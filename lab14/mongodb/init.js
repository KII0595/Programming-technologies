use shop_mongo;

db.users.drop(); db.products.drop(); db.orders.drop();

db.users.insertMany([
    { _id: 1, email: "alice@example.com", full_name: "Alice Smith", created_at: new Date(), address: { city: "Moscow", street: "Tverskaya", zipcode: "101000" } },
    { _id: 2, email: "bob@example.com", full_name: "Bob Johnson", created_at: new Date(), address: { city: "Saint Petersburg", street: "Nevsky", zipcode: "191186" } }
]);

db.products.insertMany([
    { _id: 1, name: "Ноутбук", category: "Электроника", price: 75000, stock_quantity: 10, specs: { brand: "Lenovo", ram: "16GB", storage: "512GB SSD" } },
    { _id: 2, name: "Мышь", category: "Электроника", price: 1500, stock_quantity: 50 },
    { _id: 3, name: "Книга SQL", category: "Книги", price: 2500, stock_quantity: 30, specs: { author: "Дмитрий К.", pages: 450 } },
    // Дополнительные продукты
    { _id: 4, name: "Монитор", category: "Электроника", price: 25000, stock_quantity: 20 },
    { _id: 5, name: "Python для начинающих", category: "Книги", price: 1200, stock_quantity: 40 }
]);

// Заказы с вложенным массивом items (TODO A)
db.orders.insertMany([
    {
        _id: 1, user_id: 1, order_date: new Date(), status: "completed",
        items: [
            { product_id: 1, quantity: 1, price: 75000 },
            { product_id: 2, quantity: 2, price: 1500 }
        ]
    },
    {
        _id: 2, user_id: 2, order_date: new Date(), status: "completed",
        items: [
            { product_id: 3, quantity: 1, price: 2500 },
            { product_id: 5, quantity: 3, price: 1200 }
        ]
    },
    {
        _id: 3, user_id: 1, order_date: new Date(), status: "pending",
        items: [
            { product_id: 4, quantity: 1, price: 25000 },
            { product_id: 3, quantity: 2, price: 2500 }
        ]
    }
]);

print("✅ Данные успешно загружены.");
