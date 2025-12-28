package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"lab7-go-concurrency/core"
	"lab7-go-concurrency/server"
)

func main() {
	fmt.Println("Лабораторная №7: Конкурентность в Go")
	fmt.Println("=====================================")

	showBasicSync()
	showChannelUsage()
	showParallelTransform()
	showPipeline()
	startWebServer()
}

func showBasicSync() {
	fmt.Println("\n1. Атомарный счётчик")
	c := core.NewThreadSafeCounter()
	var wg sync.WaitGroup
	for i := 0; i < 300; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Add(5)
		}()
	}
	wg.Wait()
	fmt.Println("Значение:", c.Load())
}

func showChannelUsage() {
	fmt.Println("\n2. Каналы с контекстом")
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	gen := core.NumberGenerator(ctx, 10, 8)
	transformed := core.Transform(ctx, gen, func(x int) int { return x * x })
	result := core.Collect(transformed)
	fmt.Println("Результаты:", result)
}

func showParallelTransform() {
	fmt.Println("\n3. Параллельное преобразование")
	data := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	tasks := make([]core.Task, len(data))
	for i, v := range data {
		val := v
		tasks[i] = func() int { return val * val * val }
	}
	results := core.WorkerPool(context.Background(), tasks, 3)
	fmt.Println("Кубы:", results)
}

func showPipeline() {
	fmt.Println("\n4. Pipeline")
	res := core.Pipeline([]int{1, 2, 3, 4},
		func(x int) int { return x + 10 },
		func(x int) int { return x * 3 },
		func(x int) int { return x - 5 },
	)
	fmt.Println("Результат:", res)
}

func startWebServer() {
	fmt.Println("\n5. Запуск веб-сервера")
	srv := server.NewWebServer(":9000")

	go func() {
		if err := srv.Launch(); err != nil && err != http.ErrServerClosed {
			log.Printf("Ошибка запуска: %v", err)
		}
	}()

	fmt.Println("Сервер доступен: http://localhost:9000")
	fmt.Println("Ctrl+C для завершения")

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Ошибка остановки: %v", err)
	}
	fmt.Println("Сервер завершил работу")
}
