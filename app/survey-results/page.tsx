"use client";

import { useMemo, useState } from "react";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

type Row = {
  id: string;
  created_at: string;
  name: string;
  practice_days: string;
  practice_wish: string;
  gachi_days: string;
  ops: string;
  ops_detail: string;
  registration: string;
  events: string[];
  events_other: string;
  expectations: string;
};

const SINGLE_QUESTIONS: { key: keyof Row; label: string }[] = [
  { key: "practice_days", label: "① 練習日を増やしたいか" },
  { key: "gachi_days", label: "② ガチ練習日を増やしたいか" },
  { key: "ops", label: "③ 運営に携わりたいか" },
  { key: "registration", label: "④ 選手登録を希望するか" },
];

export default function SurveyAdminPage() {
  const [pass, setPass] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    if (!pass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${AWA_SUPABASE_URL}/rest/v1/rpc/admin_list_awa_survey`,
        {
          method: "POST",
          headers: awaSupabaseHeaders(),
          body: JSON.stringify({ pass: pass.trim() }),
        },
      );
      if (!res.ok) {
        setError("合言葉が違うようです。もう一度お試しください。");
        setRows(null);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as Row[];
      setRows(data);
    } catch {
      setError("読み込みに失敗しました。通信環境をご確認ください。");
      setRows(null);
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!window.confirm("この回答を削除します。よろしいですか？")) return;
    try {
      const res = await fetch(
        `${AWA_SUPABASE_URL}/rest/v1/rpc/admin_delete_awa_survey`,
        {
          method: "POST",
          headers: awaSupabaseHeaders(),
          body: JSON.stringify({ pass: pass.trim(), target_id: id }),
        },
      );
      if (!res.ok) {
        window.alert("削除に失敗しました。");
        return;
      }
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch {
      window.alert("削除に失敗しました。");
    }
  }

  const tallies = useMemo(() => {
    if (!rows) return null;
    return SINGLE_QUESTIONS.map((q) => {
      const counts = new Map<string, number>();
      for (const r of rows) {
        const v = (r[q.key] as string) || "（未回答）";
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      return {
        label: q.label,
        items: [...counts.entries()].sort((a, b) => b[1] - a[1]),
      };
    });
  }, [rows]);

  const eventTally = useMemo(() => {
    if (!rows) return null;
    const counts = new Map<string, number>();
    for (const r of rows) {
      for (const ev of r.events ?? []) {
        counts.set(ev, (counts.get(ev) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  function downloadCsv() {
    if (!rows) return;
    const headers = [
      "回答日時",
      "お名前",
      "①練習日",
      "①希望",
      "②ガチ練習日",
      "③運営参加",
      "③やりたい役割",
      "④選手登録希望",
      "⑤期待イベント",
      "⑥期待・要望",
    ];
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        new Date(r.created_at).toLocaleString("ja-JP"),
        r.name || "（無記名）",
        r.practice_days,
        r.practice_wish,
        r.gachi_days,
        r.ops,
        r.ops_detail,
        r.registration,
        (r.events ?? []).join(" / "),
        r.expectations,
      ]
        .map(esc)
        .join(","),
    );
    const csv = "﻿" + [headers.map(esc).join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "awaken-glow-survey.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ADMIN / 選手アンケート 集計"
            title="SURVEY RESULTS"
            subtitle="合言葉を入れると、みんなの回答と集計が表示されます。"
          />
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          {/* 合言葉 */}
          <form
            onSubmit={load}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-5 md:p-6"
          >
            <label className="flex flex-col gap-1.5 grow">
              <span className="text-xs tracking-[0.15em] text-white/70">
                合言葉
              </span>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="合言葉を入力"
                className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !pass.trim()}
              className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm px-6 py-2.5 transition"
            >
              {loading ? "読み込み中…" : "表示する"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

          {rows && (
            <div className="mt-8 space-y-8">
              {/* サマリー */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-white/85 text-sm">
                  回答数：
                  <span className="text-awa-glow font-display text-xl mx-1.5">
                    {rows.length}
                  </span>
                  件
                </p>
                {rows.length > 0 && (
                  <button
                    onClick={downloadCsv}
                    className="rounded-lg border border-neon-cyan/60 text-neon-cyan px-4 py-2 text-xs tracking-[0.2em] font-display hover:bg-neon-cyan/10 transition"
                  >
                    CSVダウンロード（表に貼れます）
                  </button>
                )}
              </div>

              {rows.length === 0 ? (
                <p className="text-white/60 text-sm">
                  まだ回答がありません。
                </p>
              ) : (
                <>
                  {/* 集計 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {tallies?.map((t) => (
                      <div
                        key={t.label}
                        className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-5"
                      >
                        <div className="text-xs tracking-[0.15em] text-neon-cyan mb-3">
                          {t.label}
                        </div>
                        <div className="space-y-2">
                          {t.items.map(([name, n]) => (
                            <TallyBar
                              key={name}
                              label={name}
                              n={n}
                              total={rows.length}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-5 md:col-span-2">
                      <div className="text-xs tracking-[0.15em] text-neon-cyan mb-3">
                        ⑤ 期待するイベント（複数選択）
                      </div>
                      <div className="space-y-2">
                        {eventTally && eventTally.length > 0 ? (
                          eventTally.map(([name, n]) => (
                            <TallyBar
                              key={name}
                              label={name}
                              n={n}
                              total={rows.length}
                            />
                          ))
                        ) : (
                          <p className="text-white/50 text-sm">
                            回答なし
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 個別回答 */}
                  <div className="space-y-4">
                    <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">
                      個別の回答
                    </h3>
                    {rows.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="font-bold text-white">
                            {r.name || "（無記名）"}
                          </span>
                          <span className="text-white/40 text-xs">
                            {new Date(r.created_at).toLocaleString("ja-JP")}
                          </span>
                        </div>
                        <dl className="grid gap-1.5 text-white/80">
                          <Item label="① 練習日">{r.practice_days}</Item>
                          {r.practice_wish && (
                            <Item label="　希望">{r.practice_wish}</Item>
                          )}
                          <Item label="② ガチ練習日">{r.gachi_days}</Item>
                          <Item label="③ 運営参加">{r.ops}</Item>
                          {r.ops_detail && (
                            <Item label="　役割">{r.ops_detail}</Item>
                          )}
                          <Item label="④ 選手登録">{r.registration}</Item>
                          <Item label="⑤ イベント">
                            {(r.events ?? []).join(" / ") || "—"}
                          </Item>
                          {r.expectations && (
                            <Item label="⑥ 期待・要望">{r.expectations}</Item>
                          )}
                        </dl>
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => remove(r.id)}
                            className="text-xs text-rose-300/70 hover:text-rose-300 transition"
                          >
                            この回答を削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}

function TallyBar({
  label,
  n,
  total,
}: {
  label: string;
  n: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/75 mb-1">
        <span>{label}</span>
        <span className="text-white/55">
          {n}件・{pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-awa-glow"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <dt className="text-white/45 shrink-0 w-24">{label}</dt>
      <dd className="text-white/85 whitespace-pre-wrap">{children}</dd>
    </div>
  );
}
