import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { requireAuth, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    const session = requireAuth();
    await connectDB();
    const user = await User.findById(session.id).select("-passwordHash");
    return Response.json({ user });
  } catch (err) {
    return jsonError(err);
  }
}
