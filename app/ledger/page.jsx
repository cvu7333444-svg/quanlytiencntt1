"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Image as ImageIcon, Globe } from "lucide-react";
import AppShell from "@/components/AppShell";
import { fmtMoney, fmtDate } from "@/lib/format";

// So quy cong khai - PUBLIC, fetch truc tiep khong can auth
export default function LedgerPage() {
  const [data, setData] = useState({ transactions: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/transactions?page=${page}&limit=10${type ? `&type=${type}` : ""}`)
      .then(r => r.json()).then(setData).catch(() => {});
  }, [page, type]);

  return (
    <AppShell title="Sổ quỹ công khai">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 md:hidden">
              <Globe size={20} /> Sổ quỹ công khai
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mọi giao dịch đều minh bạch, ai cũng xem được</p>
          </div>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none">
            <option value="">Tất cả</option>
            <option value="income">Chỉ khoản thu</option>
            <option value="expense">Chỉ khoản chi</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.transactions.map(tx => (
              <div key={tx._id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className={`p-2.5 rounded-lg flex-shrink-0 ${tx.type === "income" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" : "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"}`}>
                  {tx.type === "income" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{tx.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category} · {tx.createdBy?.fullName} · {fmtDate(tx.transactionDate)}</p>
                </div>
                {tx.receiptImages?.length > 0 && (
                  <a href={tx.receiptImages[0]} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-600 flex-shrink-0"><ImageIcon size={18} /></a>
                )}
                <span className={`font-bold text-sm flex-shrink-0 ${tx.type === "income" ? "text-blue-600" : "text-rose-600"}`}>
                  {tx.type === "income" ? "+" : "-"}{fmtMoney(tx.amount)}
                </span>
              </div>
            ))}
            {data.transactions.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">Chưa có giao dịch nào</p>}
          </div>
          <div className="flex items-center justify-between p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <p className="text-xs text-gray-500">Trang {data.pagination.page} / {data.pagination.totalPages} · Tổng {data.pagination.total} giao dịch</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 border dark:border-gray-600 rounded-lg disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border dark:border-gray-600 rounded-lg disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
