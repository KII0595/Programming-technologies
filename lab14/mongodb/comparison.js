use shop_mongo;

print("=== Топ-3 пользователей по сумме заказов ===");
const topUsers = db.orders.aggregate([
    { $unwind: "$items" },
    {
        $group: {
            _id: "$user_id",
            total_spent: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
    },
    { $sort: { total_spent: -1 } },
    { $limit: 3 },
    {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" }
    },
    { $unwind: "$user" },
    {
        $project: { _id: 0, full_name: "$user.full_name", total_spent: 1 }
    }
]).toArray();

printjson(topUsers);
