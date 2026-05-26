// queries.js — CRUD операции и агрегация

use shop_mongo;

// 1. READ: Заказы Alice с суммой
print("\n=== Заказы пользователя Alice ===");
const aliceOrders = db.orders.aggregate([
    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $match: { "user.email": "alice@example.com" } },
    { $addFields: { 
        total_amount: { $sum: { $map: { input: "$items", as: "item", in: { $multiply: ["$$item.quantity", "$$item.price"] } } } }
    }}
]);
aliceOrders.forEach(printjson);

// 2. UPDATE: Добавляем скидку заказам > 80000
print("\n=== UPDATE: Добавление скидки ===");
db.orders.updateMany(
    { $expr: { $gt: [ 
        { $sum: { $map: { input: "$items", as: "item", in: { $multiply: ["$$item.quantity", "$$item.price"] } } } }, 
        80000 
    ] } },
    { $set: { discount: 10 } }
);

// 3. DELETE: Удаляем старые отменённые заказы
print("\n=== DELETE: Старые отменённые заказы ===");
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
db.orders.deleteMany({
    status: "cancelled",
    order_date: { $lt: thirtyDaysAgo }
});

// Агрегация по категориям
print("\n=== Агрегация по категориям ===");
const categoryReport = db.orders.aggregate([
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.product_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $group: {
        _id: "$product.category",
        total_sold: { $sum: "$items.quantity" },
        total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        avg_price: { $avg: "$items.price" }
    }},
    { $sort: { total_revenue: -1 } },
    { $project: {
        category: "$_id",
        total_sold: 1,
        total_revenue: 1,
        avg_price: { $round: ["$avg_price", 2] }
    }}
]);
categoryReport.forEach(printjson);
