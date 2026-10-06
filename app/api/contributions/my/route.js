import { connectDB } from "@/lib/mongodb";
import { Contribution } from "@/lib/models";
import { requireAuth, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    const session = requireAuth();
    await connectDB();
    const list = await Contribution.find({ userId: session.id })
      .populate("campaignId", "title deadline status amountPerPerson")
      .sort({ createdAt: -1 });
    return Response.json({ contributions: list });
  } catch (err) { return jsonError(err); }
}
