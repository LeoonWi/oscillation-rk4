# README

## About

This is the official Wails React-TS template.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

В Wails вы можете отправлять события из фронтенда (TypeScript/React) в бэкенд (Go) с помощью функции `EventsEmit` из пакета `wailsjs/runtime/runtime`. Это позволяет фронтенду уведомлять бэкенд о действиях пользователя или других событиях, передавая при необходимости данные. На бэкенде эти события обрабатываются с помощью `runtime.EventsOn`, как вы уже делали для событий от бэкенда к фронтенду.

В вашем случае, учитывая контекст симуляции и работу с объектом `data` (параметры `a`, `b`, `d`, `g`, `x`, `y`, `max`, `step`), я покажу, как отправить событие из фронтенда, например, для обновления конфигурации симуляции или уведомления о других действиях.

---

### Отправка события из фронтенда
1. **Импортируйте `EventsEmit`**:
   Используйте функцию `EventsEmit` из `wailsjs/runtime/runtime` в вашем фронтенд-коде.

2. **Отправьте событие**:
   Вызовите `EventsEmit` с именем события и данными, которые нужно передать в бэкенд.

3. **Обработайте событие на бэкенде**:
   На бэкенде подпишитесь на событие с помощью `runtime.EventsOn` и обработайте полученные данные.

---

### Пример реализации
Предположим, вы хотите отправить событие `updateConfig` из фронтенда, чтобы обновить параметры симуляции (`a`, `b`, `d`, `g`, `x`, `y`, `max`, `step`) на бэкенде.

#### 1. Код фронтенда (TypeScript/React)
Обновим ваш компонент, чтобы отправлять событие `updateConfig` при изменении параметров.

```typescript
import React, { useEffect } from "react";
import { EventsEmit } from "./wailsjs/runtime/runtime"; // Импортируем EventsEmit
import { main } from "./wailsjs/go/main/App";

type SimulationParams = {
  a: number;
  b: number;
  d: number;
  g: number;
  x: number;
  y: number;
  max: number;
  step: number;
};

type Props = {
  status: string;
  data: SimulationParams;
  setData: { [K in keyof SimulationParams]: React.Dispatch<React.SetStateAction<number>> };
};

// Функция проверки данных
function isValidSimulationData(data: SimulationParams): boolean {
  const requiredFields: (keyof SimulationParams)[] = ["a", "b", "d", "g", "x", "y", "max", "step"];
  return requiredFields.every((field) => {
    const value = data[field];
    return (
      value !== undefined &&
      value !== null &&
      typeof value === "number" &&
      !isNaN(value) &&
      (field === "step" ? value > 0 : true) &&
      (field === "max" ? value > 0 : true) &&
      (["x", "y"].includes(field) ? value >= 0 : true)
    );
  });
}

const YourComponent: React.FC<Props> = ({ status, data, setData }) => {
  useEffect(() => {
    if (!isValidSimulationData(data)) {
      console.error("Invalid simulation data:", data);
      setData.a(1.0);
      setData.b(0.1);
      setData.d(0.075);
      setData.g(1.5);
      setData.x(10.0);
      setData.y(5.0);
      setData.max(10.0);
      setData.step(0.01);
    }
  }, [data, setData]);

  // Функция для отправки события updateConfig
  const sendUpdateConfigEvent = () => {
    if (!isValidSimulationData(data)) {
      console.error("Cannot send config: invalid data");
      return;
    }
    // Отправляем событие с данными
    EventsEmit("updateConfig", {
      alpha: data.a,
      beta: data.b,
      delta: data.d,
      gamma: data.g,
      x: data.x,
      y: data.y,
      tEnd: data.max,
      dt: data.step,
    });
    console.log("Sent updateConfig event:", data);
  };

  const handleChange = (key: keyof SimulationParams, value: number) => {
    setData[key](value); // Обновляем локальное состояние
    sendUpdateConfigEvent(); // Отправляем событие в бэкенд
  };

  return (
    <div>
      <h1>Status: {status}</h1>
      <label>
        Alpha:
        <input
          type="number"
          value={data.a}
          onChange={(e) => handleChange("a", Number(e.target.value))}
        />
      </label>
      <label>
        Beta:
        <input
          type="number"
          value={data.b}
          onChange={(e) => handleChange("b", Number(e.target.value))}
        />
      </label>
      {/* Аналогично для d, g, x, y, max, step */}
      <button onClick={sendUpdateConfigEvent}>Send Config</button>
    </div>
  );
};

export default YourComponent;
```

**Что делает код**:
- Импортирована функция `EventsEmit` из `wailsjs/runtime/runtime`.
- Функция `sendUpdateConfigEvent` отправляет событие `updateConfig` с объектом, содержащим параметры симуляции.
- Проверка `isValidSimulationData` гарантирует, что отправляются только валидные данные.
- Событие отправляется при каждом изменении параметра (`handleChange`) или по нажатию кнопки `Send Config`.

#### 2. Код бэкенда (Go)
Добавим обработку события `updateConfig` в `main.go`. Предполагаю, что вы используете структуру `App` из предыдущих вопросов.

```go
package main

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"log"
	"math"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

// App структура для приложения
type App struct {
	ctx               context.Context
	cancel            context.CancelFunc
	SimulationRunning bool
	Stopped           bool
	Paused            bool
	t                 float64
	x                 float64
	y                 float64
	alpha             float64
	beta              float64
	delta             float64
	gamma             float64
	dt                float64
	tEnd              float64
	frontendReady     bool
	wg                sync.WaitGroup
}

// NewApp создает новый экземпляр App
func NewApp() *App {
	ctx, cancel := context.WithCancel(context.Background())
	return &App{
		ctx:               ctx,
		cancel:            cancel,
		SimulationRunning: false,
		Stopped:           true,
		Paused:            false,
		t:                 0,
		x:                 10.0,
		y:                 5.0,
		alpha:             1.0,
		beta:              0.1,
		delta:             0.075,
		gamma:             1.5,
		dt:                0.01,
		tEnd:              10.0,
		frontendReady:     false,
	}
}

// ResetConfig сбрасывает конфигурацию
func (a *App) ResetConfig() {
	a.x = 10.0
	a.y = 5.0
	a.alpha = 1.0
	a.beta = 0.1
	a.delta = 0.075
	a.gamma = 1.5
	a.dt = 0.01
	a.tEnd = 10.0
}

// GetStatus отправляет статус через событие
func (a *App) GetStatus() bool {
	a.emitStatus()
	return true
}

// Ready уведомляет бэкенд, что фронтенд готов
func (a *App) Ready() {
	a.frontendReady = true
	a.emitStatus()
}

// emitStatus отправляет текущее состояние на фронтенд
func (a *App) emitStatus() {
	if !a.frontendReady {
		log.Printf("Frontend not ready, skipping status emit")
		return
	}
	var status string
	if a.Stopped {
		status = "Stop"
	} else if a.Paused {
		status = "Pause"
	} else {
		status = "Start"
	}
	log.Printf("Emitting status: %s", status)
	runtime.EventsEmit(a.ctx, "status", map[string]string{
		"status": status,
	})
}

// Start запускает или возобновляет симуляцию
func (a *App) Start() {
	if a.SimulationRunning && !a.Paused {
		return
	}
	if a.Stopped {
		a.t = 0
		a.SimulationRunning = true
		a.Paused = false
		a.Stopped = false
		a.wg.Add(1)
		go a.simulation()
	} else if a.Paused {
		a.Paused = false
	}
	a.emitStatus()
}

// Pause переключает состояние паузы
func (a *App) Pause() {
	if a.SimulationRunning {
		a.Paused = !a.Paused
		a.emitStatus()
	}
}

// Stop останавливает симуляцию
func (a *App) Stop() {
	a.SimulationRunning = false
	a.Paused = false
	a.Stopped = true
	a.ResetConfig()
	a.emitStatus()
}

// simulation выполняет симуляцию
func (a *App) simulation() {
	defer a.wg.Done()
	for {
		select {
		case <-a.ctx.Done():
			log.Printf("Simulation Stopped due to context cancellation")
			a.SimulationRunning = false
			a.Paused = false
			a.Stopped = true
			return
		default:
			if a.SimulationRunning && !a.Paused && a.t < a.tEnd && !a.Stopped {
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
				if a.frontendReady {
					runtime.EventsEmit(a.ctx, "update", map[string]float64{
						"t": a.t,
						"x": a.x,
						"y": a.y,
					})
				}
				time.Sleep(time.Duration(a.dt*1000) * time.Millisecond)
			} else if a.t >= a.tEnd || a.Stopped {
				a.SimulationRunning = false
				a.Paused = false
				a.Stopped = true
				if a.frontendReady {
					runtime.EventsEmit(a.ctx, "finish", map[string]string{
						"status": "Stop",
					})
				}
				a.emitStatus()
				return
			} else {
				time.Sleep(100 * time.Millisecond)
			}
		}
	}
}

// Shutdown выполняет очистку
func (a *App) Shutdown() {
	log.Printf("Shutting down application")
	a.cancel()
	a.Stop()
	a.wg.Wait()
}

// Обработка события updateConfig
func (a *App) handleUpdateConfig(params interface{}) error {
	// Приводим params к map[string]interface{}
	data, ok := params.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid config data: expected map")
	}

	// Извлекаем значения
	requiredFields := []string{"alpha", "beta", "delta", "gamma", "x", "y", "tEnd", "dt"}
	for _, field := range requiredFields {
		val, ok := data[field]
		if !ok {
			return fmt.Errorf("missing required field: %s", field)
		}
		floatVal, ok := val.(float64)
		if !ok {
			return fmt.Errorf("invalid value for %s: expected number", field)
		}
		if math.IsNaN(floatVal) || math.IsInf(floatVal, 0) {
			return fmt.Errorf("invalid value for %s: must be a valid number", field)
		}
	}

	// Проверяем ограничения
	if data["dt"].(float64) <= 0 {
		return fmt.Errorf("dt must be positive")
	}
	if data["tEnd"].(float64) <= 0 {
		return fmt.Errorf("tEnd must be positive")
	}
	if data["x"].(float64) < 0 || data["y"].(float64) < 0 {
		return fmt.Errorf("x and y must be non-negative")
	}

	// Обновляем параметры
	a.alpha = data["alpha"].(float64)
	a.beta = data["beta"].(float64)
	a.delta = data["delta"].(float64)
	a.gamma = data["gamma"].(float64)
	a.x = data["x"].(float64)
	a.y = data["y"].(float64)
	a.tEnd = data["tEnd"].(float64)
	a.dt = data["dt"].(float64)

	log.Printf("Updated config: alpha=%f, beta=%f, delta=%f, gamma=%f, x=%f, y=%f, tEnd=%f, dt=%f",
		a.alpha, a.beta, a.delta, a.gamma, a.x, a.y, a.tEnd, a.dt)
	return nil
}

func main() {
	app := NewApp()

	// Обрабатываем сигналы SIGINT и SIGTERM
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigChan
		log.Printf("Received termination signal")
		app.Shutdown()
		os.Exit(0)
	}()

	err := wails.Run(&options.App{
		Title:  "Simulation App",
		Width:  1280,
		Height: 720,
		Bind: []interface{}{
			app,
		},
		OnStartup: func(ctx context.Context) {
			app.ctx = ctx
			// Подписываемся на событие updateConfig
			runtime.EventsOn(ctx, "updateConfig", func(data ...interface{}) {
				if len(data) == 0 {
					log.Printf("Error: no data received for updateConfig")
					return
				}
				if err := app.handleUpdateConfig(data[0]); err != nil {
					log.Printf("Error handling updateConfig: %v", err)
				}
			})
			// Подписываемся на событие закрытия окна
			runtime.EventsOn(ctx, "window:close", func(_ ...interface{}) {
				log.Printf("Window close event received")
				app.Shutdown()
				runtime.Quit(ctx)
			})
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
```

**Что делает код**:
- В `OnStartup` бэкенд подписывается на событие `updateConfig` с помощью `runtime.EventsOn`.
- Функция `handleUpdateConfig` обрабатывает полученные данные:
  - Проверяет, что данные — это объект (`map[string]interface{}`).
  - Проверяет наличие всех обязательных полей и их тип (`float64`).
  - Проверяет ограничения (`dt > 0`, `tEnd > 0`, `x >= 0`, `y >= 0`).
  - Обновляет параметры `App` и выводит лог.
- Если возникают ошибки (например, отсутствует поле или неверный тип), они логируются.

---

### Проверка
1. **Обновите код**:
   - Добавьте `EventsEmit` в фронтенд-компонент для отправки события `updateConfig`.
   - Добавьте обработку события `updateConfig` в `main.go` (как показано выше).

2. **Перестройте проект**:
   ```bash
   wails dev
   ```

3. **Протестируйте**:
   - Измените значение параметра (например, `data.a`) в компоненте — событие `updateConfig` должно отправиться автоматически.
   - Нажмите кнопку `Send Config` — событие должно отправиться вручную.
   - Проверьте логи бэкенда (`log.Printf` в `handleUpdateConfig`) — они должны показать обновлённые параметры.
   - Попробуйте отправить невалидные данные (например, `data.step = 0`) — фронтенд должен заблокировать отправку, а бэкенд вернуть ошибку.

4. **Логи фронтенда**:
   - Убедитесь, что `console.log` в `sendUpdateConfigEvent` подтверждает отправку события.

5. **Типы Wails**:
   - Убедитесь, что `frontend/src/wailsjs/go/main/App.ts` содержит все необходимые методы (`Start`, `Pause`, `Stop`, `GetStatus`, `Ready`). События не требуют изменений в сгенерированных типах, так как `EventsEmit` — часть runtime.

---

### Дополнительные рекомендации
1. **Отправка только изменившихся параметров**:
   - Чтобы снизить нагрузку, отправляйте только изменённое поле:
     ```typescript
     const handleChange = (key: keyof SimulationParams, value: number) => {
       setData[key](value);
       if (isValidSimulationData({ ...data, [key]: value })) {
         EventsEmit("updateConfig", { [key]: value });
       }
     };
     ```
   - На бэкенде модифицируйте `handleUpdateConfig` для частичного обновления:
     ```go
     func (a *App) handleUpdateConfig(params interface{}) error {
         data, ok := params.(map[string]interface{})
         if !ok {
             return fmt.Errorf("invalid config data")
         }
         for field, val := range data {
             floatVal, ok := val.(float64)
             if !ok {
                 return fmt.Errorf("invalid value for %s", field)
             }
             switch field {
             case "alpha":
                 a.alpha = floatVal
             case "beta":
                 a.beta = floatVal
             case "delta":
                 a.delta = floatVal
             case "gamma":
                 a.gamma = floatVal
             case "x":
                 if floatVal < 0 {
                     return fmt.Errorf("x must be non-negative")
                 }
                 a.x = floatVal
             case "y":
                 if floatVal < 0 {
                     return fmt.Errorf("y must be non-negative")
                 }
                 a.y = floatVal
             case "tEnd":
                 if floatVal <= 0 {
                     return fmt.Errorf("tEnd must be positive")
                 }
                 a.tEnd = floatVal
             case "dt":
                 if floatVal <= 0 {
                     return fmt.Errorf("dt must be positive")
                 }
                 a.dt = floatVal
             }
         }
         log.Printf("Partially updated config: %+v", data)
         return nil
     }
     ```

2. **Подтверждение получения события**:
   - Бэкенд может отправить событие обратно во фронтенд для подтверждения:
     ```go
     func (a *App) handleUpdateConfig(params interface{}) error {
         // ... обработка params ...
         runtime.EventsEmit(a.ctx, "configUpdated", map[string]string{
             "status": "success",
         })
         return nil
     }
     ```
   - На фронтенде подпишитесь на это событие:
     ```typescript
     EventsOn("configUpdated", (response: { status: string }) => {
       console.log("Config update status:", response.status);
     });
     ```

3. **Обработка ошибок**:
   - Если бэкенд возвращает ошибку, отправьте её во фронтенд:
     ```go
     func (a *App) handleUpdateConfig(params interface{}) error {
         if err := a.validateAndUpdateConfig(params); err != nil {
             runtime.EventsEmit(a.ctx, "configError", map[string]string{
                 "error": err.Error(),
             })
             return err
         }
         runtime.EventsEmit(a.ctx, "configUpdated", map[string]string{
             "status": "success",
         })
         return nil
     }
     ```
     ```typescript
     EventsOn("configError", (response: { error: string }) => {
       console.error("Config update failed:", response.error);
       alert(`Error: ${response.error}`);
     });
     ```

4. **Другие события**:
   - Вы можете отправлять другие события, например:
     - `startSimulation` для запуска симуляции.
     - `pauseSimulation` для паузы.
     - Пример:
       ```typescript
       const startSimulation = () => {
         EventsEmit("startSimulation");
       };
       ```
       ```go
       runtime.EventsOn(ctx, "startSimulation", func(_ ...interface{}) {
           app.Start()
       })
       ```

---

### Итог
- **Как отправить событие**: Используйте `EventsEmit("eventName", data)` из `wailsjs/runtime/runtime` на фронтенде.
- **Пример**: Событие `updateConfig` отправляет параметры симуляции в бэкенд, где оно обрабатывается с помощью `runtime.EventsOn`.
- **Интеграция**: Добавлены проверки валидности данных на фронтенде и бэкенде, а также обработка ошибок.
- **Результат**: Фронтенд может отправлять события в бэкенд, обновляя параметры симуляции, с надёжной обработкой данных.

Если у вас есть другие события, которые нужно реализовать, или дополнительные детали (например, конкретные данные или действия), напишите, и я помогу доработать код!