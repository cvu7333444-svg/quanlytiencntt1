import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES || "7d";

export const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role, fullName: user.fullName }, SECRET, { expiresIn: EXPIRES });

// Lay session tu cookie httpOnly (dung trong API route)
export function getSession() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function requireAuth() {
  const session = getSession();
  if (!session) throw { status: 401, message: "Chua dang nhap" };
  return session;
}

export function requireAdmin() {
  const session = requireAuth();
  if (session.role !== "admin") throw { status: 403, message: "Chi thu quy moi co quyen" };
  return session;
}

export const jsonError = (err) =>
  Response.json({ message: err.message || "Loi he thong" }, { status: err.status || 500 });
