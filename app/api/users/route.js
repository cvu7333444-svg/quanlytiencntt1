import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    requireAdmin();
    await connectDB();
    const users = await User.find().select("-passwordHash").sort({ fullName: 1 });
    return Response.json({ users });
  } catch (err) { return jsonError(err); }
}

export async function POST(req) {
  try {
    requireAdmin();
    await connectDB();
    const { studentId, fullName, email, password, role, phone, className } = await req.json();
    if (!studentId || !fullName || !email || !password)
      return Response.json({ message: "Thieu thong tin bat buoc" }, { status: 400 });
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { studentId }] });
    if (exists) return Response.json({ message: "Email hoac MSSV da ton tai" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ studentId, fullName, email, passwordHash, role: role || "member", phone: phone || "", className: className || "" });
    return Response.json({ message: "Them thanh vien thanh cong", userId: user._id }, { status: 201 });
  } catch (err) { return jsonError(err); }
}
