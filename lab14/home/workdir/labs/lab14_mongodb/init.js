// init.js — Полная инициализация базы данных shop_mongo
use shop_mongo;

// Очистка предыдущих данных
db.users.drop();
db.products.drop();
db.orders.drop();

// ========== USERS ==========
db.users.insertMany([
    {
        _id: 1,
        email: "alice@example.com",
        full_name: "Alice Smith",
        created_at: new Date("2024-01-10"),
        address: { city: "Moscow", street: "Tverskaya", zipcode: "101000" }
    },
    {
        _id: 2,
        email: "bob@example.com",
        full_name: "Bob Johnson",
        created_at: new Date("2024-01-12"),
        address: { city: "Saint Petersburg", street: "Nevsky", zipcode: "191186" }
    },
    {
        _id: 3,
        email: "maria@example.com",
        full_name: "Maria Sidorova",
        created_at: new Date("2024-01-15"),
        address: { city: "Kazan", street: "Bauman", zipcode: "420000" }
    }
]);

// ========== PRODUCTS ==========
db.products.insertMany([
    { _id: 1, name: "Ноутбук", category: "Электроника", price: 75000, stock_quantity: 10,
      specs: { brand: "Lenovo", ram: "16GB", storage: "512GB SSD" } },
    { _id: 2, name: "Мышь", category: "Электроника", price: 1500, stock_quantity: 50 },
    { _id: 3, name: "Книга SQL", category: "Книги", price: 2500, stock_quantity: 30,
      specs: { author: "Дмитрий К.", pages: 450 } },
    { _id: 4, name: "Клавиатура", category: "Электроника", price: 5000, stock_quantity: 25 },
    { _id: 5, name: "Монитор", category: "Электроника", price: 25000, stock_quantity: 8 }
]);

// ========== ORDERS ==========
db.orders.insertMany([
    {
        _id: 1,
        user_id: 1,
        order_date: new Date("2024-01-20"),
        status: "completed",
        items: [
            { product_id: 1, quantity: 1, price: 75000 },
            { product_id: 2, quantity: 2, price: 1500 }
        ]
    },
    {
        _id: 2,
        user_id: 2,
        order_date: new Date("2024-01-21"),
        status: "completed",
        items: [
            { product_id: 3, quantity: 1, price: 2500 },
            { product_id: 4, quantity: 1, price: 5000 }
        ]
    },
    {
        _id: 3,
        user_id: 1,
        order_date: new Date("2024-01-22"),
        status: "completed",
        items: [
            { product_id: 5, quantity: 1, price: 25000 }
        ]
    },
    {
        _id: 4,
        user_id: 3,
        order_date: new Date("2024-01-23"),
        status: "cancelled",
        items: [
            { product_id: 1, quantity: 1, price: 75000 }
        ]
    }
]);

print("✅ База данных shop_mongo успешно инициализирована!");
print("Users: " + db.users.count());
print("Products: " + db.products.count());
print("Orders: " + db.orders.count());
