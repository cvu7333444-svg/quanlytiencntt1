"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Users, Coins } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { fmtMoney, fmtDate } from "@/lib/format";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amountPerPerson: "", deadline: "", description: "", bankBin: "970415", accountNo: "", accountName: "" });
  const { isAdmin, showToast } = useApp();

  const load = () => apiFetch("/api/campaigns").then(d => setCampaigns(d.campaigns));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/campaigns", { method: "POST", body: form });
      setShowForm(false);
      setForm({ title: "", amountPerPerson: "", deadline: "", description: "", bankBin: "970415", accountNo: "", accountName: "" });
      showToast("Tạo đợt thu thành công");
      load();
    } catch (err) { showToast(err.message, "error"); }
  };

  return (
    <AppShell title="Các đợt thu">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold md:hidden">Các đợt thu</h1>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ml-auto">
              <Plus size={16} /> Tạo đợt thu
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold">Tạo đợt thu mới</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Tên đợt thu" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
              <input required type="number" placeholder="Số tiền mỗi người" value={form.amountPerPerson} onChange={e => setForm({ ...form, amountPerPerson: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
              <input required type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
              <input placeholder="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">Tài khoản nhận chuyển khoản (dùng tạo mã QR, bỏ trống nếu chỉ thu tiền mặt):</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Mã ngân hàng (BIN, VD: 970415)" value={form.bankBin} onChange={e => setForm({ ...form, bankBin: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
              <input placeholder="Số tài khoản" value={form.accountNo} onChange={e => setForm({ ...form, accountNo: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
              <input placeholder="Tên chủ tài khoản" value={form.accountName} onChange={e => setForm({ ...form, accountName: e.target.value })}
                className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            </div>
            <button className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium">Tạo</button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <Link key={c._id} href={`/campaigns/${c._id}`}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition block">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">{c.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${c.status === "ongoing" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-gray-700"}`}>
                  {c.status === "ongoing" ? "Đang thu" : "Đã đóng"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{c.description || "Không có mô tả"}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Coins size={10} /> Mỗi người</p>
                  <p className="text-xs font-bold">{fmtMoney(c.amountPerPerson)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Users size={10} /> Đã nộp</p>
                  <p className="text-xs font-bold text-emerald-600">{c.paidCount}/{c.totalMembers}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Calendar size={10} /> Hạn</p>
                  <p className="text-xs font-bold">{fmtDate(c.deadline)}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${c.totalMembers ? (c.paidCount / c.totalMembers) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Đã thu: {fmtMoney(c.collected)}</p>
              </div>
            </Link>
          ))}
          {campaigns.length === 0 && <p className="text-gray-400 text-sm col-span-2">Chưa có đợt thu nào</p>}
        </div>
      </div>
    </AppShell>
  );
}
