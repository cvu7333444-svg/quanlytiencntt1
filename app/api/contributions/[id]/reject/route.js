import { connectDB } from "@/lib/mongodb";
import { Contribution } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    requireAdmin();
    await connectDB();
    const { reason } = await req.json();
    // Chi tu choi duoc khoan dang cho duyet (pending), tranh tu choi khoan da approved lam sai so du
    const contribution = await Contribution.findOneAndUpdate(
      { _id: params.id, status: "pending" },
      { status: "rejected", note: reason || "" },
      { new: true }
    );
    if (!contribution) return Response.json({ message: "Khong tim thay khoan cho duyet hoac khoan khong o trang thai cho duyet" }, { status: 400 });
    return Response.json({ message: "Da tu choi", contribution });
  } catch (err) { return jsonError(err); }
}
