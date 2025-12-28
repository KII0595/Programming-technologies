package core

import (
	"context"
	"sync"
)

type Task func() int

func WorkerPool(ctx context.Context, tasks []Task, workers int) []int {
	if workers < 1 {
		workers = 4
	}

	taskCh := make(chan Task, len(tasks))
	resultCh := make(chan int, len(tasks))

	for i := 0; i < workers; i++ {
		go func() {
			for t := range taskCh {
				select {
				case <-ctx.Done():
					return
				case resultCh <- t():
				}
			}
		}()
	}

	for _, t := range tasks {
		taskCh <- t
	}
	close(taskCh)

	results := make([]int, 0, len(tasks))
	for i := 0; i < len(tasks); i++ {
		select {
		case <-ctx.Done():
			return results
		case r := <-resultCh:
			results = append(results, r)
		}
	}
	return results
}

func Pipeline(input []int, fns ...func(int) int) []int {
	data := make([]int, len(input))
	copy(data, input)

	for _, fn := range fns {
		temp := make([]int, len(data))
		var wg sync.WaitGroup
		for i, v := range data {
			wg.Add(1)
			go func(idx int, val int) {
				defer wg.Done()
				temp[idx] = fn(val)
			}(i, v)
		}
		wg.Wait()
		data = temp
	}
	return data
}
