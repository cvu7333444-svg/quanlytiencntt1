// Script tao du lieu mau. Chay: node --env-file=.env lib/seed.js (Node >= 20.6)
// Hoac: MONGODB_URI="..." JWT_SECRET="..." node lib/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  studentId: String, fullName: String, email: String, passwordHash: String,
  role: { type: String, default: "member" }, className: String, isActive: { type: Boolean, default: true }
});
const campaignSchema = new mongoose.Schema({
  title: String, description: String, amountPerPerson: Number, deadline: Date,
  status: { type: String, default: "ongoing" }, createdBy: mongoose.Schema.Types.ObjectId,
  bankAccount: { bankBin: String, accountNo: String, accountName: String }
});
const contributionSchema = new mongoose.Schema({
  campaignId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId,
  expectedAmount: Number, paidAmount: Number, status: String,
  paymentMethod: String, proofImage: String, approvedBy: mongoose.Schema.Types.ObjectId, approvedAt: Date
});
const transactionSchema = new mongoose.Schema({
  type: String, category: String, amount: Number, description: String,
  transactionDate: Date, campaignId: mongoose.Schema.Types.ObjectId,
  contributionId: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId, receiptImages: [String]
});

const User = mongoose.model("User", userSchema);
const FundCampaign = mongoose.model("FundCampaign", campaignSchema);
const Contribution = mongoose.model("Contribution", contributionSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.deleteMany({}), FundCampaign.deleteMany({}), Contribution.deleteMany({}), Transaction.deleteMany({})]);
  const hash = (p) => bcrypt.hashSync(p, 10);

  const admin = await User.create({
    studentId: "AD001", fullName: "Nguyen Van Thu Quy", email: "thuquy@class.edu",
    passwordHash: hash("admin123"), role: "admin", className: "CNTT K18A"
  });

  const names = ["Tran Thi Mai", "Le Van An", "Pham Hoang Nam", "Vu Thu Trang", "Hoang Minh Duc"];
  const members = [];
  for (let i = 0; i < names.length; i++) {
    members.push(await User.create({
      studentId: `SV${100 + i}`, fullName: names[i], email: `sv${100 + i}@class.edu`,
      passwordHash: hash("123456"), role: "member", className: "CNTT K18A"
    }));
  }

  const campaign = await FundCampaign.create({
    title: "Thu sinh hoat phi thang 10", description: "Dong gop sinh hoat lop thang 10/2026",
    amountPerPerson: 50000, deadline: new Date(Date.now() + 7 * 86400000), createdBy: admin._id,
    bankAccount: { bankBin: "970415", accountNo: "0123456789", accountName: "NGUYEN VAN THU QUY" }
  });

  for (let i = 0; i < 2; i++) {
    const c = await Contribution.create({
      campaignId: campaign._id, userId: members[i]._id, expectedAmount: 50000, paidAmount: 50000,
      status: "approved", paymentMethod: "transfer", approvedBy: admin._id, approvedAt: new Date()
    });
    await Transaction.create({
      type: "income", category: "Dong gop quy lop", amount: 50000,
      description: `Nop sinh hoat phi - ${members[i].fullName}`,
      campaignId: campaign._id, contributionId: c._id, createdBy: admin._id
    });
  }
  await Contribution.create({ campaignId: campaign._id, userId: members[2]._id, expectedAmount: 50000, paidAmount: 50000, status: "pending", paymentMethod: "cash" });
  for (let i = 3; i < 5; i++)
    await Contribution.create({ campaignId: campaign._id, userId: members[i]._id, expectedAmount: 50000, status: "unpaid" });

  await Transaction.create({ type: "expense", category: "Hoc tap", amount: 30000, description: "Mua phan bang, but chi", createdBy: admin._id, receiptImages: [] });
  await Transaction.create({ type: "expense", category: "Su kien", amount: 40000, description: "Do uong team building", createdBy: admin._id, receiptImages: [] });

  console.log("Seed xong!");
  console.log("Admin: thuquy@class.edu / admin123");
  console.log("Member: sv100@class.edu ... sv104@class.edu / 123456");
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });
