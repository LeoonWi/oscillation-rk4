package main

import (
	"context"
	"embed"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Обрабатываем сигналы SIGINT и SIGTERM
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigChan
		log.Printf("Received termination signal")
		app.shutdown()
		os.Exit(0)
	}()

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "oscillations-rk4-go",
		MinWidth:  696,
		Width:     910,
		MinHeight: 671,
		Height:    660,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			runtime.EventsOn(ctx, "Send", func(data ...interface{}) {
				if err := app.handleUpdateConfig(data[0]); err != nil {
					log.Printf("Error handling updateConfig: %v", err)
				}
			})

			// Подписываемся на событие закрытия окна
			runtime.EventsOn(ctx, "window:close", func(_ ...interface{}) {
				log.Printf("Window close event received")
				app.shutdown()
				runtime.Quit(ctx)
			})
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
