import { cookies } from "next/headers";

export async function POST() {
  cookies().set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return Response.json({ message: "Da dang xuat" });
}
