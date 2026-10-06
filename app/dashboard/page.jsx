"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Wallet, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { fmtMoney, fmtDate } from "@/lib/format";

const COLORS = ["#3b82f6", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#14b8a6"];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { apiFetch("/api/transactions/summary").then(setData).catch(() => {}); }, []);

  if (!data) return <AppShell title="Tổng quan"><p className="text-gray-400">Đang tải...</p></AppShell>;

  const { totalIncome, totalExpense, balance } = data.summary;
  const stats = [
    { label: "Số dư quỹ", value: fmtMoney(balance), icon: Wallet, color: "bg-emerald-500" },
    { label: "Tổng thu", value: fmtMoney(totalIncome), icon: TrendingUp, color: "bg-blue-500" },
    { label: "Tổng chi", value: fmtMoney(totalExpense), icon: TrendingDown, color: "bg-rose-500" }
  ];

  return (
    <AppShell title="Tổng quan quỹ lớp">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4">
              <div className={`${s.color} text-white p-2.5 md:p-3 rounded-lg`}><s.icon size={20} /></div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-base md:text-xl font-bold truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Thu chi theo tháng</h2>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly.map(m => ({ month: m._id, Thu: m.income, Chi: m.expense }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => (v / 1000) + "k"} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Bar dataKey="Thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Chi" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Chi theo danh mục</h2>
            {data.byCategory.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có khoản chi</p>
            ) : (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 11 }}>
                      {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Receipt size={18} /> Giao dịch gần nhất</h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.recent.map(tx => (
              <div key={tx._id} className="py-3 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category} · {tx.createdBy?.fullName} · {fmtDate(tx.transactionDate)}</p>
                </div>
                <span className={`font-semibold whitespace-nowrap ${tx.type === "income" ? "text-blue-600" : "text-rose-600"}`}>
                  {tx.type === "income" ? "+" : "-"}{fmtMoney(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
