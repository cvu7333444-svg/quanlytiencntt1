import { connectDB } from "@/lib/mongodb";
import { FundCampaign, Contribution } from "@/lib/models";
import { requireAuth, jsonError } from "@/lib/auth";
import { generateVietQrUrl } from "@/lib/qr";

export async function GET(req, { params }) {
  try {
    requireAuth();
    await connectDB();
    const campaign = await FundCampaign.findById(params.id);
    if (!campaign) return Response.json({ message: "Khong tim thay dot thu" }, { status: 404 });

    const contributions = await Contribution.find({ campaignId: campaign._id })
      .populate("userId", "fullName studentId email")
      .sort({ status: 1 });

    const qrUrl = generateVietQrUrl({
      bankBin: campaign.bankAccount.bankBin,
      accountNo: campaign.bankAccount.accountNo,
      accountName: campaign.bankAccount.accountName,
      amount: campaign.amountPerPerson,
      addInfo: `${campaign._id.toString().slice(-6)} dong quy lop`
    });

    return Response.json({ campaign, contributions, qrUrl });
  } catch (err) { return jsonError(err); }
}
