"use client";

import { useMemo, useState } from "react";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

type Row = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  attendance: string;
  gamecenter: string;
  dog_allergy: boolean;
  memo: string;
  source: string;
};

const ATTENDANCE_OPTIONS = [
  "宿泊＋BBQ参加（1人7,600円）",
  "BBQのみ参加（日帰り・1人4,000円）",
  "参加できない",
];
const GAMECENTER_OPTIONS = ["行く", "未定", "行かない", ""];
const LODGING_LABEL = ATTENDANCE_OPTIONS[0];
const LODGING_CAPACITY = 10;

type EditState = {
  id: string | "new";
  name: string;
  attendance: string;
  gamecenter: string;
  dog_allergy: boolean;
  memo: string;
};

function emptyEdit(): EditState {
  return {
    id: "new",
    name: "",
    attendance: ATTENDANCE_OPTIONS[0],
    gamecenter: "",
    dog_allergy: false,
    memo: "",
  };
}

export default function BbqSurveyResultsPage() {
  const [pass, setPass] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    if (!pass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${AWA_SUPABASE_URL}/rest/v1/rpc/admin_list_awa_bbq_camp_rsvp`,
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
        `${AWA_SUPABASE_URL}/rest/v1/rpc/admin_delete_awa_bbq_camp_rsvp`,
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

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) {
      setSaveError("お名前を入力してください。");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const isNew = editing.id === "new";
      const fn = isNew
        ? "admin_insert_awa_bbq_camp_rsvp"
        : "admin_update_awa_bbq_camp_rsvp";
      const body: Record<string, unknown> = {
        pass: pass.trim(),
        p_name: editing.name.trim(),
        p_attendance: editing.attendance,
        p_gamecenter: editing.gamecenter,
        p_dog_allergy: editing.dog_allergy,
        p_memo: editing.memo,
      };
      if (!isNew) body.target_id = editing.id;

      const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: awaSupabaseHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSaveError("保存に失敗しました。");
        setSaving(false);
        return;
      }
      const saved = (await res.json()) as Row;
      setRows((prev) => {
        if (!prev) return prev;
        if (isNew) return [saved, ...prev];
        return prev.map((r) => (r.id === saved.id ? saved : r));
      });
      setEditing(null);
    } catch {
      setSaveError("保存に失敗しました。");
    }
    setSaving(false);
  }

  const attendanceTally = useMemo(() => {
    if (!rows) return null;
    const counts = new Map<string, number>();
    for (const r of rows) {
      const v = r.attendance || "（未回答）";
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return ATTENDANCE_OPTIONS.map((label) => [label, counts.get(label) ?? 0] as const);
  }, [rows]);

  const lodgingCount = useMemo(() => {
    if (!rows) return 0;
    return rows.filter((r) => r.attendance === LODGING_LABEL).length;
  }, [rows]);

  const dogAllergyCount = useMemo(() => {
    if (!rows) return 0;
    return rows.filter((r) => r.attendance === LODGING_LABEL && r.dog_allergy).length;
  }, [rows]);

  function downloadCsv() {
    if (!rows) return;
    const headers = ["回答日時", "お名前", "参加区分", "ゲーセン「えのき」", "犬アレルギー", "メモ", "入力者"];
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        new Date(r.created_at).toLocaleString("ja-JP"),
        r.name || "（無記名）",
        r.attendance,
        r.gamecenter || "—",
        r.dog_allergy ? "あり" : "—",
        r.memo,
        r.source === "admin" ? "事務局代理入力" : "本人",
      ]
        .map(esc)
        .join(","),
    );
    const csv = "﻿" + [headers.map(esc).join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bbq-camp-2026-rsvp.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ADMIN / BBQ合宿 集計"
            title="BBQ CAMP RESULTS"
            subtitle="合言葉を入れると、回答の集計・編集・追加ができます。"
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
              <span className="text-xs tracking-[0.15em] text-white/70">合言葉</span>
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
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-white/85 text-sm">
                    回答数：
                    <span className="text-awa-glow font-display text-xl mx-1.5">{rows.length}</span>
                    件
                  </p>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${
                      lodgingCount > LODGING_CAPACITY
                        ? "border-rose-400/50 bg-rose-500/10 text-rose-200"
                        : "border-white/15 bg-awa-indigo-950/60 text-white/70"
                    }`}
                  >
                    宿泊希望：{lodgingCount} / {LODGING_CAPACITY}名
                    {lodgingCount > LODGING_CAPACITY && " ⚠ 上限超え"}
                  </span>
                  {dogAllergyCount > 0 && (
                    <span className="rounded-full border border-amber-400/50 bg-amber-500/10 text-amber-200 px-3 py-1 text-xs">
                      🐶 犬アレルギー：{dogAllergyCount}名
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSaveError(null);
                      setEditing(emptyEdit());
                    }}
                    className="rounded-lg border border-awa-glow/60 text-awa-glow px-4 py-2 text-xs tracking-[0.2em] font-display hover:bg-awa-glow/10 transition"
                  >
                    ＋ 回答を代理で追加
                  </button>
                  {rows.length > 0 && (
                    <button
                      onClick={downloadCsv}
                      className="rounded-lg border border-neon-cyan/60 text-neon-cyan px-4 py-2 text-xs tracking-[0.2em] font-display hover:bg-neon-cyan/10 transition"
                    >
                      CSVダウンロード
                    </button>
                  )}
                </div>
              </div>

              {/* 集計 */}
              {rows.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-5">
                  <div className="text-xs tracking-[0.15em] text-neon-cyan mb-3">参加区分</div>
                  <div className="space-y-2">
                    {attendanceTally?.map(([label, n]) => (
                      <TallyBar key={label} label={label} n={n} total={rows.length} />
                    ))}
                  </div>
                </div>
              )}

              {editing && (
                <EditCard
                  editing={editing}
                  setEditing={setEditing}
                  onCancel={() => setEditing(null)}
                  onSave={save}
                  saving={saving}
                  error={saveError}
                />
              )}

              {/* 個別回答 */}
              {rows.length === 0 ? (
                <p className="text-white/60 text-sm">まだ回答がありません。</p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">個別の回答</h3>
                  {rows.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.name || "（無記名）"}</span>
                          {r.dog_allergy && (
                            <span className="rounded-full border border-amber-400/50 bg-amber-500/10 text-amber-200 px-2 py-0.5 text-[10px] tracking-wide">
                              🐶 犬アレルギー
                            </span>
                          )}
                          {r.source === "admin" && (
                            <span className="rounded-full border border-white/20 bg-white/5 text-white/60 px-2 py-0.5 text-[10px] tracking-wide">
                              事務局代理入力
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 text-xs">
                            {new Date(r.created_at).toLocaleString("ja-JP")}
                          </span>
                          <button
                            onClick={() => {
                              setSaveError(null);
                              setEditing({
                                id: r.id,
                                name: r.name,
                                attendance: r.attendance,
                                gamecenter: r.gamecenter,
                                dog_allergy: r.dog_allergy,
                                memo: r.memo,
                              });
                            }}
                            className="text-neon-cyan/80 hover:text-neon-cyan text-xs"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => remove(r.id)}
                            className="text-rose-300/80 hover:text-rose-300 text-xs"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      <dl className="grid gap-1.5">
                        <Row2 label="参加区分" value={r.attendance || "—"} />
                        <Row2 label="ゲーセン「えのき」" value={r.gamecenter || "—"} />
                        <Row2 label="メモ" value={r.memo || "—"} />
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}

function Row2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="text-white/45 w-40 shrink-0">{label}</dt>
      <dd className="text-white/85 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function TallyBar({ label, n, total }: { label: string; n: number; total: number }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/70 mb-1">
        <span>{label}</span>
        <span className="text-white/50">
          {n}件（{pct}%）
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-awa-glow"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EditCard({
  editing,
  setEditing,
  onCancel,
  onSave,
  saving,
  error,
}: {
  editing: EditState;
  setEditing: (e: EditState) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-xl border border-awa-glow/40 bg-awa-indigo-900/50 p-5 md:p-6 space-y-4">
      <div className="text-xs tracking-[0.15em] text-awa-glow">
        {editing.id === "new" ? "回答を代理で追加" : "回答を編集"}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.15em] text-white/70">お名前</span>
        <input
          type="text"
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.15em] text-white/70">参加区分</span>
        <select
          value={editing.attendance}
          onChange={(e) => setEditing({ ...editing, attendance: e.target.value })}
          className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
        >
          {ATTENDANCE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.15em] text-white/70">ゲーセン「えのき」（11/8）</span>
        <select
          value={editing.gamecenter}
          onChange={(e) => setEditing({ ...editing, gamecenter: e.target.value })}
          className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
        >
          {GAMECENTER_OPTIONS.map((o) => (
            <option key={o || "none"} value={o}>
              {o || "（未回答）"}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 rounded-lg border border-white/15 bg-awa-indigo-950/60 px-4 py-2.5 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={editing.dog_allergy}
          onChange={(e) => setEditing({ ...editing, dog_allergy: e.target.checked })}
          className="w-4 h-4 accent-awa-glow cursor-pointer"
        />
        <span>犬アレルギーがある</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.15em] text-white/70">メモ</span>
        <textarea
          value={editing.memo}
          onChange={(e) => setEditing({ ...editing, memo: e.target.value })}
          rows={3}
          className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition resize-y"
        />
      </label>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-xs px-5 py-2.5 transition"
        >
          {saving ? "保存中…" : "保存する"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-white/15 text-white/70 hover:text-white px-5 py-2.5 text-xs transition"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
