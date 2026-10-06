import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { signToken, jsonError } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ message: "Thieu email/mat khau" }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return Response.json({ message: "Email hoac mat khau khong dung" }, { status: 401 });
    if (!user.isActive) return Response.json({ message: "Tai khoan da bi khoa" }, { status: 403 });
    const token = signToken(user);
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/"
    });
    return Response.json({
      user: { id: user._id, _id: user._id, fullName: user.fullName, email: user.email, role: user.role, studentId: user.studentId, className: user.className }
    });
  } catch (err) {
    return jsonError(err);
  }
}
