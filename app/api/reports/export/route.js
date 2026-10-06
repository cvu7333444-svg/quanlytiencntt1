import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models";
import { requireAdmin, jsonError } from "@/lib/auth";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const getBalance = async () => {
  const agg = await Transaction.aggregate([
    { $group: { _id: null,
      income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
      expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } } } }
  ]);
  return { totalIncome: agg[0]?.income || 0, totalExpense: agg[0]?.expense || 0, balance: (agg[0]?.income || 0) - (agg[0]?.expense || 0) };
};

export async function GET(req) {
  try {
    requireAdmin();
    await connectDB();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "excel";
    const { totalIncome, totalExpense, balance } = await getBalance();
    const txs = await Transaction.find().sort({ transactionDate: 1 }).populate("createdBy", "fullName").lean();

    if (format === "pdf") {
      // PDF: dung stream phu hop serverless
      const chunks = [];
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      doc.on("data", (c) => chunks.push(c));
      doc.fontSize(18).text("BAO CAO TIEN QUY LOP HOC", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Ngay lap: ${new Date().toLocaleDateString("vi-VN")}`);
      doc.moveDown();
      doc.text(`Tong thu: ${totalIncome.toLocaleString("vi-VN")} VND`);
      doc.text(`Tong chi: ${totalExpense.toLocaleString("vi-VN")} VND`);
      doc.text(`So du: ${balance.toLocaleString("vi-VN")} VND`);
      doc.moveDown().fontSize(14).text("Chi tiet giao dich:").moveDown(0.5);
      txs.forEach(t => doc.fontSize(9).text(
        `${new Date(t.transactionDate).toLocaleDateString("vi-VN")} | ${t.type === "income" ? "THU" : "CHI"} | ${t.category} | ${t.description} | ${t.amount.toLocaleString("vi-VN")} VND`
      ));
      const buffer = await new Promise((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.end();
      });
      return new Response(buffer, { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=bao-cao-quy-lop.pdf" } });
    }

    // Excel
    const workbook = new ExcelJS.Workbook();
    const s1 = workbook.addWorksheet("Tong hop");
    s1.columns = [{ header: "Chi tieu", key: "label", width: 30 }, { header: "So tien (VND)", key: "value", width: 20 }];
    s1.addRow({ label: "Tong thu", value: totalIncome });
    s1.addRow({ label: "Tong chi", value: totalExpense });
    s1.addRow({ label: "So du hien tai", value: balance });
    s1.getRow(1).font = { bold: true };

    const s2 = workbook.addWorksheet("Chi tiet giao dich");
    s2.columns = [
      { header: "Ngay", key: "date", width: 15 }, { header: "Loai", key: "type", width: 10 },
      { header: "Danh muc", key: "category", width: 20 }, { header: "Mo ta", key: "desc", width: 40 },
      { header: "So tien", key: "amount", width: 15 }, { header: "Nguoi ghi nhan", key: "by", width: 20 }
    ];
    s2.getRow(1).font = { bold: true };
    txs.forEach(t => s2.addRow({
      date: new Date(t.transactionDate).toLocaleDateString("vi-VN"),
      type: t.type === "income" ? "THU" : "CHI", category: t.category, desc: t.description,
      amount: t.amount, by: t.createdBy?.fullName || ""
    }));

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=bao-cao-quy-lop.xlsx"
      }
    });
  } catch (err) { return jsonError(err); }
}
