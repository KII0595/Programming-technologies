package core

import (
	"sync"
	"sync/atomic"
)

type ThreadSafeCounter struct {
	value atomic.Uint64
}

func NewThreadSafeCounter() *ThreadSafeCounter {
	return &ThreadSafeCounter{}
}

func (c *ThreadSafeCounter) Add(delta uint64) {
	c.value.Add(delta)
}

func (c *ThreadSafeCounter) Load() uint64 {
	return c.value.Load()
}

type ConcurrentMap struct {
	mu    sync.RWMutex
	items map[string]int
}

func NewConcurrentMap() *ConcurrentMap {
	return &ConcurrentMap{
		items: make(map[string]int),
	}
}

func (cm *ConcurrentMap) Set(key string, val int) {
	cm.mu.Lock()
	cm.items[key] = val
	cm.mu.Unlock()
}

func (cm *ConcurrentMap) Get(key string) (int, bool) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	v, ok := cm.items[key]
	return v, ok
}
