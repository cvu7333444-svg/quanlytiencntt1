"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiggyBank, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useApp } from "@/components/Providers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { reloadUser } = useApp();

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
      await reloadUser();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-600 text-white p-3 rounded-xl mb-3"><PiggyBank size={32} /></div>
          <h1 className="text-xl font-bold">Quản lý Tiền quỹ Lớp học</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v10 · Đăng nhập để tiếp tục</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mật khẩu" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
          {error && <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <p className="font-medium text-gray-500 dark:text-gray-300 mb-1">Tài khoản mẫu (sau khi seed):</p>
         
        
        </div>
      </div>
    </div>
  );
}
