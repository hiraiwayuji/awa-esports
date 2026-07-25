"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Building2, Tags, Gamepad2, Inbox, History, AlertTriangle } from "lucide-react";
import CheckTab from "./CheckTab";
import CompaniesTab from "./CompaniesTab";
import CategoriesTab from "./CategoriesTab";
import RulesTab from "./RulesTab";
import InquiriesTab from "./InquiriesTab";
import HistoryTab from "./HistoryTab";

type TabKey = "check" | "companies" | "categories" | "rules" | "inquiries" | "history";

const TABS: { key: TabKey; label: string; icon: typeof ShieldCheck }[] = [
  { key: "check", label: "適合チェック", icon: ShieldCheck },
  { key: "companies", label: "企業一覧", icon: Building2 },
  { key: "categories", label: "カテゴリー", icon: Tags },
  { key: "rules", label: "大会規定", icon: Gamepad2 },
  { key: "inquiries", label: "問い合わせ", icon: Inbox },
  { key: "history", label: "審査履歴", icon: History },
];

export default function SponsorCheckPage() {
  const [tab, setTab] = useState<TabKey>("check");
  const [canWrite, setCanWrite] = useState(false);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sponsor/whoami", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setCanWrite(j.role === "admin");
          setDbConfigured(j.dbConfigured);
        }
      })
      .catch(() => {})
      .finally(() => setRoleLoaded(true));
  }, []);

  return (
    <main className="min-h-screen text-white px-4 md:px-8 py-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="text-[10px] font-display tracking-[0.4em] text-neon-cyan">SPONSOR / 営業前スポンサー確認</div>
          <h1 className="text-2xl md:text-3xl font-display font-black mt-1">営業前スポンサー確認</h1>
          <p className="text-xs text-white/50 mt-2">
            禁止業種・競合・独占権・大会規定などをルールベースで確認します。
            <span className="text-white/70">最終承認は必ず運営（人間）が行います。</span>
            {roleLoaded && !canWrite && <span className="ml-2 text-yellow-300">（閲覧者モード：編集はできません）</span>}
          </p>
        </header>

        {roleLoaded && !dbConfigured && (
          <div className="mb-5 rounded-xl border border-yellow-300/40 bg-yellow-300/[0.06] px-4 py-3 text-sm text-yellow-200 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              データベース接続（<code className="text-yellow-100">SUPABASE_SERVICE_ROLE_KEY</code>）が未設定です。
              適合チェック・企業管理・履歴の保存が利用できません。README のセットアップ手順をご確認ください。
            </span>
          </div>
        )}

        {/* タブ */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-display tracking-[0.1em] whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/15 text-white/60 hover:border-white/40"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "check" && <CheckTab canWrite={canWrite} />}
        {tab === "companies" && <CompaniesTab canWrite={canWrite} />}
        {tab === "categories" && <CategoriesTab canWrite={canWrite} />}
        {tab === "rules" && <RulesTab canWrite={canWrite} />}
        {tab === "inquiries" && <InquiriesTab canWrite={canWrite} />}
        {tab === "history" && <HistoryTab canWrite={canWrite} />}
      </div>
    </main>
  );
}
