import { connectDB } from "@/lib/mongodb";
import { Contribution, FundCampaign } from "@/lib/models";
import { requireAuth, jsonError } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

export async function POST(req, { params }) {
  try {
    const session = requireAuth();
    await connectDB();
    const form = await req.formData();
    const paymentMethod = form.get("paymentMethod") || "cash";
    const note = form.get("note") || "";
    const proofFile = form.get("proof");

    const contribution = await Contribution.findById(params.id);
    if (!contribution) return Response.json({ message: "Khong tim thay dong gop" }, { status: 404 });
    const campaign = await FundCampaign.findById(contribution.campaignId);
    if (campaign?.status === "closed")
      return Response.json({ message: "Dot thu da dong, khong nop duoc nua" }, { status: 400 });
    if (contribution.userId.toString() !== session.id && session.role !== "admin")
      return Response.json({ message: "Ban chi co the nop tien cua chinh ban" }, { status: 403 });
    if (contribution.status === "approved")
      return Response.json({ message: "Khoan nay da duoc duyet" }, { status: 400 });
    if (paymentMethod === "transfer" && (!proofFile || proofFile.size === 0))
      return Response.json({ message: "Chuyen khoan bat buoc dinh kem anh chung tu" }, { status: 400 });

    let proofImage = "";
    if (proofFile && proofFile.size > 0) proofImage = await uploadImage(proofFile, "proofs");

    contribution.status = "pending";
    contribution.paymentMethod = paymentMethod;
    contribution.paidAmount = contribution.expectedAmount;
    contribution.proofImage = proofImage;
    contribution.note = note;
    await contribution.save();

    return Response.json({ message: "Da nop, cho thu quy duyet", contribution });
  } catch (err) { return jsonError(err); }
}
