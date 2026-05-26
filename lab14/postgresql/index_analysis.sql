-- 1. Анализ ДО создания индекса
EXPLAIN ANALYZE
SELECT * FROM order_items WHERE order_id = 1;

-- 2. Создание индекса
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 3. Анализ ПОСЛЕ создания индекса
EXPLAIN ANALYZE
SELECT * FROM order_items WHERE order_id = 1;
