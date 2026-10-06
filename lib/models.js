import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ===== User =====
const userSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    phone: { type: String, default: "" },
    className: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
userSchema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.passwordHash);
};

// ===== FundCampaign =====
const fundCampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    amountPerPerson: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["ongoing", "closed"], default: "ongoing" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bankAccount: {
      bankBin: { type: String, default: "970415" },
      accountNo: { type: String, default: "" },
      accountName: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

// ===== Contribution =====
const contributionSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "FundCampaign", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expectedAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["unpaid", "pending", "approved", "rejected"], default: "unpaid" },
    paymentMethod: { type: String, enum: ["cash", "transfer"], default: "cash" },
    proofImage: { type: String, default: "" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);
contributionSchema.index({ campaignId: 1, userId: 1 }, { unique: true });

// ===== Transaction =====
const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    transactionDate: { type: Date, default: Date.now },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "FundCampaign", default: null },
    contributionId: { type: mongoose.Schema.Types.ObjectId, ref: "Contribution", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiptImages: [{ type: String }]
  },
  { timestamps: true }
);
transactionSchema.index({ type: 1, transactionDate: -1 });

// Cache models tranh loi OverwriteModelError trong serverless
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const FundCampaign = mongoose.models.FundCampaign || mongoose.model("FundCampaign", fundCampaignSchema);
export const Contribution = mongoose.models.Contribution || mongoose.model("Contribution", contributionSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
