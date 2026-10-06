import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    requireAdmin();
    await connectDB();
    const { fullName, role, isActive, className, phone } = await req.json();
    const user = await User.findByIdAndUpdate(params.id, { fullName, role, isActive, className, phone }, { new: true }).select("-passwordHash");
    if (!user) return Response.json({ message: "Khong tim thay" }, { status: 404 });
    return Response.json({ message: "Cap nhat thanh cong", user });
  } catch (err) { return jsonError(err); }
}
