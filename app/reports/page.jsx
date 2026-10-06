"use client";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import AppShell from "@/components/AppShell";

async function download(format) {
  const res = await fetch(`/api/reports/export?format=${format}`, { credentials: "include" });
  if (!res.ok) { alert("Xuất báo cáo thất bại"); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = format === "pdf" ? "bao-cao-quy-lop.pdf" : "bao-cao-quy-lop.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  return (
    <AppShell title="Xuất báo cáo">
      <div className="space-y-6 max-w-2xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">Tải báo cáo thu chi toàn bộ quỹ lớp về máy.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => download("excel")}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition text-left flex items-center gap-4 group">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 p-3 rounded-lg group-hover:scale-110 transition">
              <FileSpreadsheet size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Xuất Excel (.xlsx)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 sheet: Tổng hợp + Chi tiết giao dịch</p>
            </div>
            <Download size={20} className="text-gray-300 group-hover:text-emerald-600" />
          </button>
          <button onClick={() => download("pdf")}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition text-left flex items-center gap-4 group">
            <div className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 p-3 rounded-lg group-hover:scale-110 transition">
              <FileText size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Xuất PDF (.pdf)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Văn bản, in nộp giáo viên chủ nhiệm</p>
            </div>
            <Download size={20} className="text-gray-300 group-hover:text-rose-600" />
          </button>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Lưu ý:</strong> Báo cáo tổng hợp toàn bộ giao dịch. Có thể mở rộng API thêm tham số <code>from</code>/<code>to</code> để lọc theo khoảng thời gian.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
