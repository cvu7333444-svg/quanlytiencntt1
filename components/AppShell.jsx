"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, HandCoins, Wallet, BookOpen, Users, FileBarChart,
  LogOut, PiggyBank, Sun, Moon, Menu, X
} from "lucide-react";
import { useState } from "react";
import { useApp } from "./Providers";

const NAV = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, roles: ["admin", "member"] },
  { href: "/campaigns", label: "Đợt thu", icon: HandCoins, roles: ["admin", "member"] },
  { href: "/expense/new", label: "Ghi chi", icon: Wallet, roles: ["admin"] },
  { href: "/ledger", label: "Sổ quỹ", icon: BookOpen, roles: ["admin", "member"] },
  { href: "/members", label: "Thành viên", icon: Users, roles: ["admin"] },
  { href: "/reports", label: "Báo cáo", icon: FileBarChart, roles: ["admin"] }
];

export default function AppShell({ children, title }) {
  const { user, isAdmin, logout, dark, toggleDark } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);

  const items = NAV.filter(i => i.roles.includes(user?.role));

  const NavLinks = ({ onNavigate }) => (
    <>
      {items.map(item => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              active ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                     : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <item.icon size={18} />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen">
      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setDrawer(true)} className="p-1"><Menu size={22} /></button>
        <div className="flex items-center gap-2">
          <PiggyBank size={20} className="text-brand-600" />
          <span className="font-bold text-sm">Quỹ Lớp Học</span>
        </div>
        <button onClick={toggleDark} className="p-1">{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
      </header>

      {/* Drawer mobile */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setDrawer(false)}>
          <div className="w-64 h-full bg-white dark:bg-gray-800 p-4 space-y-2" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Menu</span>
              <button onClick={() => setDrawer(false)}><X size={20} /></button>
            </div>
            <NavLinks onNavigate={() => setDrawer(false)} />
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg">
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <div className="bg-brand-600 text-white p-2 rounded-lg"><PiggyBank size={20} /></div>
          <div>
            <p className="font-bold text-sm">Quỹ Lớp Học</p>
            <p className="text-xs text-gray-400">v10 · PWA</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1"><NavLinks /></nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{isAdmin ? "Thủ quỹ" : "Thành viên"}</p>
            </div>
            <button onClick={toggleDark} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-60 page-content">
        {title && (
          <div className="hidden md:flex items-center justify-between px-6 pt-6">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
        )}
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 safe-area-bottom">
        {items.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] ${active ? "text-brand-600" : "text-gray-400"}`}>
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
