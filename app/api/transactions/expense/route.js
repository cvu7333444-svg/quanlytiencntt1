import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

// POST: ghi nhan khoan chi - bat buoc anh hoa don, khong cho chi vuot so du
export async function POST(req) {
  try {
    const session = requireAdmin();
    await connectDB();
    const form = await req.formData();
    const category = form.get("category");
    const amount = Number(form.get("amount"));
    const description = form.get("description");
    const transactionDate = form.get("transactionDate");
    const receiptFiles = form.getAll("receipts").filter(f => f.size > 0);

    if (!category || !amount || !description)
      return Response.json({ message: "Thieu danh muc, so tien hoac mo ta" }, { status: 400 });
    if (amount <= 0) return Response.json({ message: "So tien phai lon hon 0" }, { status: 400 });
    if (receiptFiles.length === 0)
      return Response.json({ message: "Bat buoc dinh kem anh minh chung hoa don" }, { status: 400 });

    // Kiem tra so du
    const agg = await Transaction.aggregate([
      { $group: { _id: null,
        income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
        expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } } } }
    ]);
    const balance = (agg[0]?.income || 0) - (agg[0]?.expense || 0);
    if (amount > balance)
      return Response.json({ message: `So tien vuot so du quy (${balance.toLocaleString("vi-VN")} VND)` }, { status: 400 });

    const receiptImages = [];
    for (const f of receiptFiles) receiptImages.push(await uploadImage(f, "receipts"));

    const tx = await Transaction.create({
      type: "expense", category, amount, description,
      transactionDate: transactionDate || Date.now(),
      createdBy: session.id, receiptImages
    });

    return Response.json({ message: "Ghi nhan khoan chi thanh cong", data: tx }, { status: 201 });
  } catch (err) { return jsonError(err); }
}
