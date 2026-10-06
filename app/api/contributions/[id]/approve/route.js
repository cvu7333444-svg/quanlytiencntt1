import { connectDB } from "@/lib/mongodb";
import { Contribution, Transaction, User } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    const session = requireAdmin();
    await connectDB();
    const contribution = await Contribution.findById(params.id);
    if (!contribution) return Response.json({ message: "Khong tim thay dong gop" }, { status: 404 });
    if (contribution.status !== "pending")
      return Response.json({ message: "Chi co the duyet khoan dang cho xu ly" }, { status: 400 });

    contribution.status = "approved";
    contribution.approvedBy = session.id;
    contribution.approvedAt = new Date();
    await contribution.save();

    const user = await User.findById(contribution.userId);
    await Transaction.create({
      type: "income", category: "Dong gop quy lop", amount: contribution.paidAmount,
      description: `Nop tien dot thu - ${user?.fullName || ""}`,
      campaignId: contribution.campaignId, contributionId: contribution._id,
      createdBy: session.id, receiptImages: contribution.proofImage ? [contribution.proofImage] : []
    });

    return Response.json({ message: "Duyet thanh cong, tien da vao so quy" });
  } catch (err) { return jsonError(err); }
}
