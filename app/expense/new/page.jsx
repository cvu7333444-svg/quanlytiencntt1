"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/components/Providers";

const CATEGORIES = ["Học tập", "Sự kiện", "Từ thiện", "Quà tặng", "Văn phòng phẩm", "Khác"];

export default function ExpensePage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [form, setForm] = useState({ category: "Học tập", amount: "", description: "", transactionDate: "" });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (files.length === 0) { setError("Bắt buộc đính kèm ít nhất 1 ảnh minh chứng hóa đơn"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      files.forEach(f => fd.append("receipts", f));
      await apiFetch("/api/transactions/expense", { method: "POST", body: fd });
      setSuccess(true);
      showToast("Ghi nhận khoản chi thành công");
      setTimeout(() => router.push("/ledger"), 1500);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (success)
    return (
      <AppShell title="Ghi khoản chi">
        <div className="flex flex-col items-center justify-center py-16 text-emerald-600 gap-3">
          <CheckCircle2 size={48} />
          <p className="text-lg font-semibold">Ghi nhận thành công!</p>
          <p className="text-sm text-gray-500">Đang chuyển đến sổ quỹ...</p>
        </div>
      </AppShell>
    );

  return (
    <AppShell title="Ghi nhận khoản chi">
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl p-5 md:p-6 shadow-sm space-y-5 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục <span className="text-rose-500">*</span></label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Số tiền (VND) <span className="text-rose-500">*</span></label>
            <input required type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0" className="w-full px-3 py-2.5 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày chi</label>
            <input type="date" value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })}
              className="w-full px-3 py-2.5 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả chi tiết <span className="text-rose-500">*</span></label>
          <textarea required rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Mua gì? Cho hoạt động nào?" className="w-full px-3 py-2.5 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ảnh minh chứng <span className="text-rose-500">* (bắt buộc, tối đa 5 ảnh)</span></label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer hover:border-brand-500">
            <Upload size={24} className="text-gray-400" />
            <span className="text-sm text-gray-500">{files.length ? `Đã chọn ${files.length} ảnh` : "Click chọn ảnh hóa đơn"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))} />
          </label>
          {files.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {files.map((f, i) => <div key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-[150px]">{f.name}</div>)}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 p-3 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Đang ghi nhận..." : "Xác nhận ghi khoản chi"}
        </button>
      </form>
    </AppShell>
  );
}
