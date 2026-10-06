"use client";
import { useEffect, useState } from "react";
import { Plus, UserCog, Loader2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/components/Providers";

export default function MembersPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ studentId: "", fullName: "", email: "", password: "", role: "member", className: "" });
  const { showToast } = useApp();

  const load = () => apiFetch("/api/users").then(d => setUsers(d.users));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/users", { method: "POST", body: form });
      setShowForm(false);
      setForm({ studentId: "", fullName: "", email: "", password: "", role: "member", className: "" });
      showToast("Thêm thành viên thành công");
      load();
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const toggle = async (u) => {
    try { await apiFetch(`/api/users/${u._id}`, { method: "PATCH", body: { isActive: !u.isActive } }); load(); }
    catch (err) { showToast(err.message, "error"); }
  };

  return (
    <AppShell title="Quản lý thành viên">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold md:hidden">Thành viên</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-brand-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ml-auto">
            <Plus size={16} /> Thêm thành viên
          </button>
        </div>

        {showForm && (
          <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <input required placeholder="MSSV" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            <input required placeholder="Họ tên" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            <input required type="text" placeholder="Mật khẩu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            <input placeholder="Lớp" value={form.className} onChange={e => setForm({ ...form, className: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm outline-none">
              <option value="member">Thành viên</option>
              <option value="admin">Thủ quỹ (Admin)</option>
            </select>
            <button type="submit" disabled={loading} className="sm:col-span-2 md:col-span-3 bg-brand-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Thêm thành viên
            </button>
          </form>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Vai trò</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-left px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{u.fullName.charAt(0)}</div>
                    <span className="truncate">{u.fullName}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.studentId}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700"}`}>
                      {u.role === "admin" ? "Thủ quỹ" : "Thành viên"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-gray-200 text-gray-500 dark:bg-gray-700"}`}>
                      {u.isActive ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(u)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600">
                      <UserCog size={14} /> {u.isActive ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
