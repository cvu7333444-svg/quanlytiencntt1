import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models";
import { requireAuth, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    requireAuth();
    await connectDB();

    const agg = await Transaction.aggregate([
      { $group: { _id: null,
        totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
        totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } } } }
    ]);
    const { totalIncome = 0, totalExpense = 0 } = agg[0] || {};

    const monthly = await Transaction.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$transactionDate" } },
        income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
        expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    const byCategory = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    const recent = await Transaction.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "fullName");

    return Response.json({
      summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense },
      monthly, byCategory, recent
    });
  } catch (err) { return jsonError(err); }
}
