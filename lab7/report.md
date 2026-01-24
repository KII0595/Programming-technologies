# Отчет по лабораторной работе №7  
## Конкурентное программирование в языке Go

**Дата:** 2025-12-28  
**Семестр:** 2 курс, 1 полугодие (3 семестр)  
**Группа:** ПИН-б-о-24-1  
**Дисциплина:** Технологии программирования  
**Студент:** Кочкарев Ислам Ильясович  

### Цель работы
Практическое изучение средств конкурентного программирования в Go: горутины, каналы, группы синхронизации, контексты. Реализация классических паттернов параллельной обработки данных и создание простого веб-сервера с поддержкой graceful shutdown.

### Среда выполнения
Работа выполнена в операционной системе **Windows 10** с использованием PowerShell и официального компилятора Go версии 1.23.

### Структура проекта

```
lab7-go-concurrency/
├── main.go                  // запуск всех демонстраций
├── core/
│   ├── sync.go              // базовая синхронизация и атомарные операции
│   ├── channels.go          // каналы с поддержкой контекста
│   └── patterns.go          // Worker Pool, Pipeline, Fan-Out/Fan-In
└── server/
└── api.go               // HTTP-сервер с метриками и middleware
```

### Основные реализованные компоненты
- Безопасная работа с общими данными (мьютексы, атомарные операции)
- Генерация и обработка данных через каналы с отменой по контексту
- Параллельное преобразование коллекций
- Реализация паттернов Worker Pool и Pipeline
- Fan-Out/Fan-In для распределённой обработки
- HTTP-сервер с логированием запросов, восстановлением после паники и graceful shutdown

## Реализация и примеры кода

### Пример 1. Базовая горутина

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Printf("Горутина %d работает\n", id)
        }(i)
    }

    wg.Wait()
    fmt.Println("Все горутины завершены")
}
```

**Описание:**
В данном примере создаются три горутины, которые выполняются параллельно. WaitGroup используется для ожидания их завершения.


### Пример 2. Каналы (Producer–Consumer)

```go
package main

import "fmt"

func main() {
    ch := make(chan int)

    go func() {
        for i := 1; i <= 5; i++ {
            ch <- i
        }
        close(ch)
    }()

    for val := range ch {
        fmt.Println("Получено:", val)
    }
}
```

**Описание:**
Одна горутина отправляет данные в канал, другая — принимает их.

### Пример 3. Worker Pool

```go
package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        results <- job * job
    }
}

func main() {
    jobs := make(chan int, 5)
    results := make(chan int, 5)

    var wg sync.WaitGroup

    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    for i := 1; i <= 5; i++ {
        jobs <- i
    }
    close(jobs)

    wg.Wait()
    close(results)

    for res := range results {
        fmt.Println("Результат:", res)
    }
}
```

### Пример 4. Pipeline

```go
package main

import "fmt"

func stage1(nums []int) []int {
    out := []int{}
    for _, n := range nums {
        out = append(out, n*2)
    }
    return out
}

func stage2(nums []int) []int {
    out := []int{}
    for _, n := range nums {
        out = append(out, n+1)
    }
    return out
}

func main() {
    input := []int{1, 2, 3, 4, 5}
    result := stage2(stage1(input))
    fmt.Println(result)
}
```

### Пример 5. Fan-Out / Fan-In

```go
package main

import "fmt"

func square(ch <-chan int, out chan<- int) {
    for n := range ch {
        out <- n * n
    }
}

func main() {
    input := make(chan int)
    output := make(chan int)

    for i := 0; i < 3; i++ {
        go square(input, output)
    }

    go func() {
        for i := 1; i <= 5; i++ {
            input <- i
        }
        close(input)
    }()

    for i := 1; i <= 5; i++ {
        fmt.Println(<-output)
    }
}
```

## Результаты выполнения

Все примеры успешно выполняются без состояний гонки (проверено go run -race).
Веб-сервер корректно обрабатывает параллельные запросы, выводит статистику и завершает работу по сигналу Ctrl+C.

## Выводы

- Горутины в Go — лёгкий и эффективный механизм для запуска тысяч параллельных задач.
 
- Каналы предоставляют типобезопасный способ обмена данными без явных блокировок.

- Паттерны Worker Pool и Pipeline позволяют строить эффективные конвейеры обработки данных.

- Использование context.Context обеспечивает контролируемую отмену длительных операций.

- Встроенная поддержка конкурентности делает Go отличным инструментом для создания высоконагруженных серверных приложений.
