import { connectDB } from "@/lib/mongodb";
import { FundCampaign } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    requireAdmin();
    await connectDB();
    const campaign = await FundCampaign.findByIdAndUpdate(params.id, { status: "closed" }, { new: true });
    if (!campaign) return Response.json({ message: "Khong tim thay dot thu" }, { status: 404 });
    return Response.json({ message: "Da dong dot thu", campaign });
  } catch (err) { return jsonError(err); }
}
