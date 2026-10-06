import { connectDB } from "@/lib/mongodb";
import { FundCampaign, Contribution, User } from "@/lib/models";
import { requireAuth, requireAdmin, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    requireAuth();
    await connectDB();
    const campaigns = await FundCampaign.find().sort({ createdAt: -1 });
    const result = [];
    for (const c of campaigns) {
      const stats = await Contribution.aggregate([
        { $match: { campaignId: c._id } },
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$paidAmount" } } }
      ]);
      const approved = stats.find(s => s._id === "approved") || { count: 0, total: 0 };
      const totalMembers = stats.reduce((a, s) => a + s.count, 0);
      result.push({ ...c.toObject(), paidCount: approved.count, totalMembers, collected: approved.total });
    }
    return Response.json({ campaigns: result });
  } catch (err) { return jsonError(err); }
}

export async function POST(req) {
  try {
    const session = requireAdmin();
    await connectDB();
    const { title, description, amountPerPerson, deadline, bankAccount, bankBin, accountNo, accountName } = await req.json();
    if (!title || !amountPerPerson || !deadline)
      return Response.json({ message: "Thieu tieu de, so tien hoac han nop" }, { status: 400 });

    const bank = bankAccount || {
      bankBin: bankBin || "970415", accountNo: accountNo || "", accountName: accountName || ""
    };
    const campaign = await FundCampaign.create({
      title, description: description || "", amountPerPerson: Number(amountPerPerson),
      deadline, createdBy: session.id, bankAccount: bank
    });

    const members = await User.find({ isActive: true });
    const docs = members.map(m => ({ campaignId: campaign._id, userId: m._id, expectedAmount: campaign.amountPerPerson, status: "unpaid" }));
    if (docs.length) await Contribution.insertMany(docs);

    return Response.json({ message: "Tao dot thu thanh cong", campaignId: campaign._id }, { status: 201 });
  } catch (err) { return jsonError(err); }
}
