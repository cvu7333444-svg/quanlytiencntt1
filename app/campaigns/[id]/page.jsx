"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QrCode, Check, X, Upload, ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { fmtMoney, fmtDate, statusLabel } from "@/lib/format";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAdmin, showToast } = useApp();
  const [data, setData] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [payForm, setPayForm] = useState({ paymentMethod: "cash", note: "", file: null });

  const load = () => apiFetch(`/api/campaigns/${id}`).then(setData);
  useEffect(() => { load(); }, [id]);

  const handlePay = async (cid) => {
    try {
      const fd = new FormData();
      fd.append("paymentMethod", payForm.paymentMethod);
      fd.append("note", payForm.note);
      if (payForm.file) fd.append("proof", payForm.file);
      await apiFetch(`/api/contributions/${cid}/pay`, { method: "POST", body: fd });
      setShowQr(false);
      showToast("Đã gửi, chờ thủ quỹ duyệt");
      load();
    } catch (err) { showToast(err.message, "error"); }
  };

  const approve = async (cid) => {
    try { await apiFetch(`/api/contributions/${cid}/approve`, { method: "PATCH" }); showToast("Duyệt thành công"); load(); }
    catch (err) { showToast(err.message, "error"); }
  };
  const reject = async (cid) => {
    const reason = prompt("Lý do từ chối:");
    if (reason === null) return;
    try { await apiFetch(`/api/contributions/${cid}/reject`, { method: "PATCH", body: { reason } }); showToast("Đã từ chối"); load(); }
    catch (err) { showToast(err.message, "error"); }
  };

  if (!data) return <AppShell><p className="text-gray-400">Đang tải...</p></AppShell>;
  const { campaign, contributions, qrUrl } = data;
  const mine = contributions.find(c => String(c.userId?._id) === String(user?._id));

  return (
    <AppShell title={campaign.title}>
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm flex flex-wrap justify-between items-start gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold">{campaign.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign.description}</p>
            <p className="text-xs text-gray-400 mt-2">Hạn nộp: {fmtDate(campaign.deadline)} · Mỗi người: {fmtMoney(campaign.amountPerPerson)}</p>
          </div>
          {mine && mine.status !== "approved" && campaign.status === "ongoing" && (
            <button onClick={() => setShowQr(true)}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <QrCode size={16} /> Nộp tiền
            </button>
          )}
        </div>

        {showQr && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowQr(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg">Nộp tiền đợt thu</h3>
              <div className="text-center">
                <img src={qrUrl} alt="QR chuyển khoản" className="mx-auto rounded-lg border" style={{ width: 200 }} />
                <p className="text-xs text-gray-400 mt-2">Quét QR chuyển khoản {fmtMoney(campaign.amountPerPerson)}</p>
              </div>
              <select value={payForm.paymentMethod} onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm">
                <option value="cash">Tiền mặt (giao trực tiếp thủ quỹ)</option>
                <option value="transfer">Chuyển khoản (bắt buộc đính kèm ảnh)</option>
              </select>
              {payForm.paymentMethod === "transfer" && (
                <label className="flex items-center gap-2 text-sm border-2 border-dashed rounded-lg p-3 cursor-pointer">
                  <Upload size={16} />
                  <span className="truncate">{payForm.file ? payForm.file.name : "Tải ảnh chụp chuyển khoản"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setPayForm({ ...payForm, file: e.target.files[0] })} />
                </label>
              )}
              <input placeholder="Ghi chú" value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm" />
              <div className="flex gap-2">
                <button onClick={() => setShowQr(false)} className="flex-1 py-2 border rounded-lg text-sm">Hủy</button>
                <button onClick={() => handlePay(mine._id)} className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-medium">Xác nhận đã nộp</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
          <div className="p-5 border-b dark:border-gray-700"><h2 className="font-semibold">Trạng thái đóng góp</h2></div>
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Thành viên</th>
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-left px-4 py-3">Chứng từ</th>
                {isAdmin && <th className="text-left px-4 py-3">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {contributions.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium">{c.userId?.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.userId?.studentId}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusLabel[c.status].cls}`}>{statusLabel[c.status].text}</span></td>
                  <td className="px-4 py-3">
                    {c.proofImage ? <a href={c.proofImage} target="_blank" rel="noreferrer" className="text-brand-600 text-xs underline">Xem ảnh</a> : "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {c.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(c._id)} className="bg-emerald-100 text-emerald-700 p-1.5 rounded hover:bg-emerald-200"><Check size={14} /></button>
                          <button onClick={() => reject(c._id)} className="bg-rose-100 text-rose-700 p-1.5 rounded hover:bg-rose-200"><X size={14} /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
