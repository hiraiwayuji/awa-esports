"use client";

import { useState } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

const CARDS = [
  {
    href: "/board",
    icon: "📋",
    title: "連絡板・出欠",
    desc: "練習日程の確認と、参加（出欠）の表明",
  },
  {
    href: "/resources",
    icon: "📁",
    title: "議事録・資料",
    desc: "ミーティング議事録や資料の閲覧・保存",
  },
  {
    href: "/ledger",
    icon: "💰",
    title: "経理（会計）",
    desc: "チームの収入・支出・残高",
  },
];

export default function MemberPortal() {
  const [pass, setPass] = useState("");
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enter(e?: React.FormEvent) {
    e?.preventDefault();
    if (!pass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/board_list`, {
        method: "POST",
        headers: awaSupabaseHeaders(),
        body: JSON.stringify({ member_pass: pass.trim() }),
      });
      if (!res.ok) throw new Error("unauthorized");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("awa_member_pass", pass.trim());
      }
      setEntered(true);
    } catch {
      setError("合言葉が違うようです。もう一度お試しください。");
    }
    setLoading(false);
  }

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[15vw] md:text-[11vw] lg:text-[8rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            MEMBER ROOM
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="MEMBERS ONLY / メンバールーム"
              title="MEMBER ROOM"
              subtitle="メンバー専用のページです。合言葉を入れてご利用ください。"
            />
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          {!entered ? (
            <form
              onSubmit={enter}
              className="rounded-2xl border border-awa-glow/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-4"
            >
              <p className="text-sm text-white/80 leading-relaxed">
                ここは<span className="text-white">メンバー専用</span>
                の入口です。合言葉を入れると、連絡板・議事録・経理にアクセスできます。
              </p>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="メンバー合言葉"
                className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-awa-glow focus:shadow-[0_0_0_3px_rgba(45,255,183,0.15)] transition"
              />
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={loading || !pass.trim()}
                className="w-full rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition"
              >
                {loading ? "確認中…" : "入室する"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-awa-glow/90">
                ようこそ！下のメニューから選んでください👇
                <span className="text-white/50">
                  （各ページでは合言葉の入れ直しは不要です）
                </span>
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {CARDS.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="rounded-2xl border border-white/10 bg-awa-indigo-950/50 p-5 hover:border-awa-glow/50 hover:bg-awa-glow/[0.04] transition flex flex-col gap-2"
                  >
                    <span className="text-3xl">{c.icon}</span>
                    <span className="text-white font-bold text-sm">
                      {c.title}
                    </span>
                    <span className="text-white/55 text-[12px] leading-relaxed">
                      {c.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
