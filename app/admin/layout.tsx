"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { LayoutDashboard, ShieldCheck, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin", label: "登録ダッシュボード", sub: "練習生・正式選手", icon: LayoutDashboard },
  { href: "/admin/sponsor-check", label: "営業前スポンサー確認", sub: "適合チェック・競合管理", icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    // print:block で印刷時はサイドバーを消し中身だけ出す
    <div className="min-h-screen bg-awa-indigo-950 md:flex print:block">
      {/* ===== 左サイドバー（デスクトップ） ===== */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-white/10 bg-awa-indigo-900/40 print:hidden">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="text-[10px] font-display tracking-[0.35em] text-neon-cyan">ADMIN</div>
          <div className="font-display font-black text-white mt-1 leading-tight">AWAKEN GLOW</div>
          <div className="text-[10px] text-white/40 mt-0.5">管理コンソール</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={clsx(
                  "flex items-start gap-3 rounded-xl px-3 py-3 transition-colors",
                  active
                    ? "bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan"
                    : "border border-transparent text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <it.icon size={18} className="mt-0.5 shrink-0" />
                <span className="leading-tight">
                  <span className="block text-sm font-bold">{it.label}</span>
                  <span className="block text-[11px] text-white/40">{it.sub}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-[10px] text-white/30 border-t border-white/10">
          Basic 認証で保護 · v1.0
        </div>
      </aside>

      {/* ===== モバイルヘッダー ===== */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-awa-indigo-950/90 backdrop-blur print:hidden">
        <span className="font-display font-black text-white text-sm">AG 管理</span>
        <button onClick={() => setOpen(!open)} className="text-white p-1.5" aria-label="menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-b border-white/10 bg-awa-indigo-900/60 print:hidden">
          <nav className="p-3 space-y-1">
            {navItems.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm",
                    active ? "bg-neon-cyan/10 text-neon-cyan" : "text-white/75",
                  )}
                >
                  <it.icon size={16} />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* ===== コンテンツ ===== */}
      <div className="flex-1 min-w-0 print:w-full">{children}</div>
    </div>
  );
}
