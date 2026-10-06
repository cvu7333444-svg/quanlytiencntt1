import { cookies } from "next/headers";
import { NextResponse } from "next/server"; // Import NextResponse
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { signToken, jsonError } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Thieu email/mat khau" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: "Email hoac mat khau khong dung" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: "Tai khoan da bi khoa" }, { status: 403 });
    }

    const token = signToken(user);

    // Xử lý cookie (dùng await để tương thích Next.js 15+)
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        className: user.className,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}