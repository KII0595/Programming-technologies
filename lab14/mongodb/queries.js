use shop_mongo;

// 1. READ: Заказы Alice с суммой
print("=== 1. Заказы Alice ===");
const aliceOrders = db.orders.aggregate([
    { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user_info" } },
    { $unwind: "$user_info" },
    { $match: { "user_info.email": "alice@example.com" } },
    { $addFields: {
        total_amount: { $sum: { $map: { input: "$items", as: "item", in: { $multiply: ["$$item.quantity", "$$item.price"] } } } }
    }}
]).toArray();
printjson(aliceOrders);

// 2. UPDATE: Добавить discount 10% к заказам дороже 80000
print("\n=== 2. Обновление заказов > 80000 ===");
// Сначала вычисляем ID заказов > 80000
const expensiveOrderIds = db.orders.aggregate([
    { $addFields: {
        total: { $sum: { $map: { input: "$items", as: "i", in: { $multiply: ["$$i.quantity", "$$i.price"] } } } }
    }},
    { $match: { total: { $gt: 80000 } } },
    { $project: { _id: 1 } }
]).map(doc => doc._id);

if (expensiveOrderIds.length > 0) {
    db.orders.updateMany(
        { _id: { $in: expensiveOrderIds } },
        { $set: { discount: 10 } }
    );
    print(`✅ Обновлено ${expensiveOrderIds.length} заказов.`);
} else {
    print("⚠️ Нет заказов дороже 80000 руб.");
}

// 3. DELETE: Удалить отменённые заказы старше 30 дней
print("\n=== 3. Удаление старых отменённых заказов ===");
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const deleteResult = db.orders.deleteMany({
    status: "cancelled",
    order_date: { $lt: thirtyDaysAgo }
});
print(`🗑️ Удалено: ${deleteResult.deletedCount} документов.`);
