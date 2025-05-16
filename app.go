package main

import (
	"context"
	"fmt"
	"log"
	"math"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx               context.Context
	cancel            context.CancelFunc
	simulationRunning bool    // Флаг выполнения симуляции
	stopped           bool    // Флаг остановки
	paused            bool    // Флаг паузы
	t                 float64 // Текущее время
	x                 float64 // Переменная x
	y                 float64 // Переменная y
	alpha             float64 // Параметры модели
	beta              float64 // Параметры модели
	delta             float64 // Параметры модели
	gamma             float64 // Параметры модели
	dt                float64 // Шаг времени в секундах
	tEnd              float64 // Конечное время в секундах
	wg                sync.WaitGroup
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		simulationRunning: false,
		stopped:           true,
		paused:            false,
		t:                 0,
		x:                 10.0,
		y:                 5.0,
		alpha:             1.0,
		beta:              0.1,
		delta:             0.075,
		gamma:             1.5,
		dt:                1.0,
		tEnd:              10.0,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}
func (a *App) shutdown() {
	log.Printf("Shutting down application")
	a.cancel()  // Отменяем контекст
	a.Stop()    // Останавливаем симуляцию
	a.wg.Wait() // Ждём завершения горутин
}

// Вызов события на сервере для обновления статуса симуляции (Pull)
func (a *App) GetStatus() {
	a.emitStatus()
}

// Сброс всех параметров на значения по умолчанию (Pull)
func (a *App) Reset() {
	a.simulationRunning = false
	a.stopped = true
	a.paused = false
	a.t = 0
	a.x = 10.0
	a.y = 5.0
	a.alpha = 1.0
	a.beta = 0.1
	a.delta = 0.075
	a.gamma = 1.5
	a.dt = 1.0
	a.tEnd = 10.0
}

// Отправка события для обновления статуса симуляции (Push)
func (a *App) emitStatus() {
	var status string
	if a.stopped {
		status = "Stop"
	} else if a.paused {
		status = "Pause"
	} else {
		status = "Run"
	}
	runtime.EventsEmit(a.ctx, "status", map[string]string{
		"status": status,
	})
}

// Запуск симуляции (Pull)
func (a *App) Start() {
	if a.simulationRunning && !a.paused {
		return // Симуляция уже работает и не на паузе
	}
	if a.stopped {
		a.t = 0
		// TODO инициализировать конфиг
		a.simulationRunning = true
		a.paused = false
		a.stopped = false
		a.wg.Add(1)
		go a.simulation()
	} else if a.paused {
		a.paused = false
	}
	a.emitStatus()
}

// Приостановка симуляци на паузу (Pull)
func (a *App) Pause() {
	a.paused = true
	a.emitStatus()
}

// Полная остановка симуляции (Pull)
func (a *App) Stop() {
	a.simulationRunning = false
	a.paused = false
	a.stopped = true
	a.emitStatus()
}

func (a *App) simulation() {
	defer a.wg.Done()
	for {
		select {
		case <-a.ctx.Done():
			log.Printf("Simulation stopped due to context cancellation")
			a.simulationRunning = false
			a.paused = false
			a.stopped = true
			return
		default:
			if a.simulationRunning && !a.paused && a.t < a.tEnd && !a.stopped {
				// Метод Рунге-Кутты 4-го порядка
				dx1 := a.dt * (a.alpha*a.x - a.beta*a.x*a.y)
				dy1 := a.dt * (a.delta*a.x*a.y - a.gamma*a.y)

				dx2 := a.dt * (a.alpha*(a.x+dx1/2) - a.beta*(a.x+dx1/2)*(a.y+dy1/2))
				dy2 := a.dt * (a.delta*(a.x+dx1/2)*(a.y+dy1/2) - a.gamma*(a.y+dy1/2))

				dx3 := a.dt * (a.alpha*(a.x+dx2/2) - a.beta*(a.x+dx2/2)*(a.y+dy2/2))
				dy3 := a.dt * (a.delta*(a.x+dx2/2)*(a.y+dy2/2) - a.gamma*(a.y+dy2/2))

				dx4 := a.dt * (a.alpha*(a.x+dx3) - a.beta*(a.x+dx3)*(a.y+dy3))
				dy4 := a.dt * (a.delta*(a.x+dx3)*(a.y+dy3) - a.gamma*(a.y+dy3))

				a.x += (dx1 + 2*dx2 + 2*dx3 + dx4) / 6
				a.y += (dy1 + 2*dy2 + 2*dy3 + dy4) / 6
				a.t += a.dt

				// Отправляем данные на фронтенд
				log.Printf("t: %v, x: %v, y: %v", a.t, a.x, a.y)
				runtime.EventsEmit(a.ctx, "update", map[string]float64{
					"t": a.t,
					"x": a.x,
					"y": a.y,
				})

				// Задержка для имитации dt
				time.Sleep(time.Duration(a.dt * float64(time.Second)))
			} else if a.t >= a.tEnd || a.stopped {
				// Завершение симуляции
				a.Stop()
				return
			} else {
				// Ожидание при паузе
				time.Sleep(time.Duration(a.dt * float64(time.Second)))
			}
		}
	}
}

// метод обработки обновления параметров симуляции
func (a *App) handleUpdateConfig(params interface{}) error {
	// получение данных
	data, ok := params.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid config data: expected map")
	}

	// список обязательных полей
	requiredFields := []string{"a", "b", "d", "g", "x", "y", "max", "step"}

	// валидация
	for _, field := range requiredFields {
		val, ok := data[field]
		if !ok {
			return fmt.Errorf("missing required field: %s, %s", field, val)
		}
		floatVal, ok := val.(float64)
		if !ok {
			return fmt.Errorf("invalid value for %s: expected number", field)
		}
		if math.IsNaN(floatVal) || math.IsInf(floatVal, 0) {
			return fmt.Errorf("invalid value for %s: must be a valid number", field)
		}
	}

	if data["step"].(float64) <= 0 {
		return fmt.Errorf("dt must be positive")
	}
	if data["max"].(float64) <= 0 {
		return fmt.Errorf("tEnd must be positive")
	}

	// обновление параметров
	a.alpha = data["a"].(float64)
	a.beta = data["b"].(float64)
	a.delta = data["d"].(float64)
	a.gamma = data["g"].(float64)
	a.x = data["x"].(float64)
	a.y = data["y"].(float64)
	a.tEnd = data["max"].(float64)
	a.dt = data["step"].(float64)

	log.Printf("Updated config: alpha=%f, beta=%f, delta=%f, gamma=%f, x=%f, y=%f, tEnd=%f, dt=%f",
		a.alpha, a.beta, a.delta, a.gamma, a.x, a.y, a.tEnd, a.dt)
	return nil
}
