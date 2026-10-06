import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models";
import { jsonError } from "@/lib/auth";

// So quy cong khai - PUBLIC, ai cung xem duoc (khong can dang nhap)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const type = searchParams.get("type");
    const match = type ? { type } : {};

    const total = await Transaction.countDocuments(match);
    const transactions = await Transaction.find(match)
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "fullName");

    return Response.json({
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { return jsonError(err); }
}
