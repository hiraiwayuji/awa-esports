"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

type Entry = {
  id: string;
  created_at: string;
  entry_date: string;
  kind: "income" | "expense";
  item: string;
  amount: number;
  memo: string;
};

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: awaSupabaseHeaders(),
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(String(res.status));
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const yen = (n: number) => `¥${(n ?? 0).toLocaleString("ja-JP")}`;

export default function LedgerPage() {
  const [memberPass, setMemberPass] = useState("");
  const [entered, setEntered] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 運営モード
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const adminMode = adminOpen && adminPass.trim().length > 0;

  // 記録フォーム
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load(pass?: string) {
    const data = await rpc<Entry[]>("ledger_list", {
      member_pass: (pass ?? memberPass).trim(),
    });
    setEntries(data ?? []);
  }

  async function enter(e?: React.FormEvent) {
    e?.preventDefault();
    if (!memberPass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await load(memberPass.trim());
      setEntered(true);
    } catch {
      setError("合言葉が違うようです。もう一度お試しください。");
    }
    setLoading(false);
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number.parseInt(amount, 10);
    if (!item.trim() || !Number.isFinite(amt) || amt < 0 || saving) return;
    setSaving(true);
    setMsg(null);
    try {
      await rpc("ledger_add", {
        admin_pass: adminPass.trim(),
        p_entry_date: date || null,
        p_kind: kind,
        p_item: item.trim(),
        p_amount: amt,
        p_memo: memo.trim(),
      });
      setItem("");
      setAmount("");
      setMemo("");
      await load();
      setMsg({ text: "記録しました", ok: true });
    } catch {
      setMsg({
        text: "記録できませんでした。運営合言葉・項目・金額をご確認ください。",
        ok: false,
      });
    }
    setSaving(false);
  }

  async function removeEntry(id: string) {
    if (!window.confirm("この記録を削除します。よろしいですか？")) return;
    try {
      await rpc("ledger_delete", {
        admin_pass: adminPass.trim(),
        target_id: id,
      });
      setEntries((prev) => prev.filter((x) => x.id !== id));
    } catch {
      window.alert("削除できませんでした（運営合言葉をご確認ください）。");
    }
  }

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const e of entries) {
      if (e.kind === "income") income += e.amount;
      else expense += e.amount;
    }
    return { income, expense, balance: income - expense };
  }, [entries]);

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[15vw] md:text-[11vw] lg:text-[7rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            ACCOUNTING
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="MEMBERS ONLY / 経理・会計"
              title="ACCOUNTING"
              subtitle="チームの収入・支出・残高を確認できます。"
            />
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          {!entered ? (
            <form
              onSubmit={enter}
              className="rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-4"
            >
              <p className="text-sm text-white/80 leading-relaxed">
                ここは<span className="text-white">メンバー専用</span>
                の会計ページです。合言葉を入れて確認してください。
              </p>
              <input
                type="password"
                value={memberPass}
                onChange={(e) => setMemberPass(e.target.value)}
                placeholder="メンバー合言葉"
                className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
              />
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={loading || !memberPass.trim()}
                className="w-full rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition"
              >
                {loading ? "確認中…" : "確認する"}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/board"
                  className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition"
                >
                  ← 連絡板へ
                </Link>
                <button
                  onClick={() => load()}
                  className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition"
                >
                  最新に更新
                </button>
              </div>

              {/* サマリー */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4 text-center">
                  <div className="text-[11px] text-white/50 mb-1">収入</div>
                  <div className="text-neon-cyan font-display text-base md:text-lg">
                    {yen(totals.income)}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4 text-center">
                  <div className="text-[11px] text-white/50 mb-1">支出</div>
                  <div className="text-rose-300 font-display text-base md:text-lg">
                    {yen(totals.expense)}
                  </div>
                </div>
                <div className="rounded-xl border border-awa-glow/30 bg-awa-glow/[0.06] p-4 text-center">
                  <div className="text-[11px] text-white/50 mb-1">残高</div>
                  <div
                    className={`font-display text-base md:text-lg ${totals.balance < 0 ? "text-rose-300" : "text-awa-glow"}`}
                  >
                    {yen(totals.balance)}
                  </div>
                </div>
              </div>

              {/* 記録フォーム（運営） */}
              {adminMode && (
                <form
                  onSubmit={addEntry}
                  className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.04] p-5 md:p-6 space-y-4"
                >
                  <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">
                    NEW ENTRY / 記録を追加（運営）
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-[0.15em] text-white/70">
                        区分
                      </span>
                      <select
                        value={kind}
                        onChange={(e) =>
                          setKind(e.target.value as "income" | "expense")
                        }
                        className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
                      >
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-[0.15em] text-white/70">
                        日付
                      </span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      placeholder="項目（例：会場費／参加費）"
                      maxLength={120}
                      className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition"
                    />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="金額（円）"
                      min={0}
                      className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition"
                    />
                  </div>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="メモ（任意）"
                    maxLength={500}
                    className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition"
                  />
                  {msg && (
                    <p
                      className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}
                    >
                      {msg.text}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving || !item.trim() || !amount.trim()}
                      className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm px-6 py-2.5 transition"
                    >
                      {saving ? "記録中…" : "記録する"}
                    </button>
                  </div>
                </form>
              )}

              {/* 一覧 */}
              {entries.length === 0 ? (
                <p className="text-white/50 text-sm">まだ記録はありません。</p>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[10px] tracking-wider rounded-full border px-2 py-0.5 ${
                              e.kind === "income"
                                ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10"
                                : "border-rose-300/40 text-rose-200 bg-rose-300/10"
                            }`}
                          >
                            {e.kind === "income" ? "収入" : "支出"}
                          </span>
                          <span className="text-white/40 text-[11px]">
                            {e.entry_date}
                          </span>
                        </div>
                        <p className="text-white font-bold text-sm truncate">
                          {e.item}
                        </p>
                        {e.memo && (
                          <p className="text-white/40 text-[11px] truncate">
                            {e.memo}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`font-display text-sm ${e.kind === "income" ? "text-neon-cyan" : "text-rose-300"}`}
                        >
                          {e.kind === "income" ? "+" : "−"}
                          {yen(e.amount)}
                        </span>
                        {adminMode && (
                          <button
                            onClick={() => removeEntry(e.id)}
                            className="text-[11px] text-rose-300/70 hover:text-rose-300 transition"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 運営メニュー */}
              <div className="pt-6 border-t border-white/10">
                {!adminOpen ? (
                  <button
                    onClick={() => setAdminOpen(true)}
                    className="text-xs text-white/30 hover:text-white/60 transition"
                  >
                    運営メニュー（記録の追加・削除）
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="運営合言葉"
                      className="grow rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2 text-sm focus:outline-none focus:border-awa-glow/60 transition"
                    />
                    <button
                      onClick={() => {
                        setAdminOpen(false);
                        setAdminPass("");
                      }}
                      className="text-xs text-white/40 hover:text-white/70 transition"
                    >
                      閉じる
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
