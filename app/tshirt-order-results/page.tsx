"use client";

import { useMemo, useState } from "react";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";
import {
  TSHIRT_MAX_PER_SIZE,
  TSHIRT_SIZES,
  formatTshirtItems,
  normalizeTshirtItems,
  tshirtTotals,
  yen,
  type TshirtItems,
} from "@/lib/tshirt-order";

type Row = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  items: TshirtItems;
  total_qty: number;
  total_price: number;
  memo: string;
  source: string;
};

type EditState = {
  id: string | "new";
  name: string;
  items: TshirtItems;
  memo: string;
};

const inputCls =
  "rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition";

export default function TshirtOrderResultsPage() {
  const [pass, setPass] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function rpc(fn: string, body: Record<string, unknown>) {
    return fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: awaSupabaseHeaders(),
      body: JSON.stringify({ pass: pass.trim(), ...body }),
    });
  }

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    if (!pass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await rpc("admin_list_awa_tshirt_orders", {});
      if (!res.ok) {
        setError("合言葉が違うようです。もう一度お試しください。");
        setRows(null);
      } else {
        setRows((await res.json()) as Row[]);
      }
    } catch {
      setError("読み込みに失敗しました。通信環境をご確認ください。");
      setRows(null);
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!window.confirm("この注文を削除します。よろしいですか？")) return;
    try {
      const res = await rpc("admin_delete_awa_tshirt_orders", { target_id: id });
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
    const items = normalizeTshirtItems(editing.items);
    const totals = tshirtTotals(items);
    if (!editing.name.trim()) {
      setSaveError("お名前を入力してください。");
      return;
    }
    if (totals.qty === 0) {
      setSaveError("1枚以上入力してください。");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const isNew = editing.id === "new";
      const res = await rpc(
        isNew ? "admin_insert_awa_tshirt_orders" : "admin_update_awa_tshirt_orders",
        {
          ...(isNew ? {} : { target_id: editing.id }),
          p_name: editing.name.trim(),
          p_items: items,
          p_total_qty: totals.qty,
          p_total_price: totals.price,
          p_memo: editing.memo,
        },
      );
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

  const sizeTally = useMemo(() => {
    if (!rows) return null;
    return TSHIRT_SIZES.map((s) => {
      const n = rows.reduce((sum, r) => sum + (r.items?.[s.key] ?? 0), 0);
      return { ...s, n, subtotal: n * s.price };
    });
  }, [rows]);

  const grand = useMemo(() => {
    if (!sizeTally) return { qty: 0, price: 0 };
    return sizeTally.reduce(
      (a, s) => ({ qty: a.qty + s.n, price: a.price + s.subtotal }),
      { qty: 0, price: 0 },
    );
  }, [sizeTally]);

  function downloadCsv() {
    if (!rows) return;
    const headers = [
      "回答日時",
      "お名前",
      ...TSHIRT_SIZES.map((s) => s.label),
      "合計枚数",
      "合計金額",
      "連絡事項",
      "入力者",
    ];
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        new Date(r.created_at).toLocaleString("ja-JP"),
        r.name,
        ...TSHIRT_SIZES.map((s) => String(r.items?.[s.key] ?? 0)),
        String(r.total_qty),
        String(r.total_price),
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
    a.download = "ag-tshirt-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ADMIN / Tシャツ注文 集計"
            title="T-SHIRT ORDERS"
            subtitle="合言葉を入れると、サイズ別の枚数・金額の集計と、注文の編集・追加ができます。"
          />
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
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
                className={inputCls}
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-white/85 text-sm">
                  注文：
                  <span className="text-awa-glow font-display text-xl mx-1.5">{rows.length}</span>
                  人
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSaveError(null);
                      setEditing({ id: "new", name: "", items: {}, memo: "" });
                    }}
                    className="rounded-lg border border-awa-glow/60 text-awa-glow px-4 py-2 text-xs tracking-[0.2em] font-display hover:bg-awa-glow/10 transition"
                  >
                    ＋ 注文を代理で追加
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

              {/* サイズ別の集計（業者への発注用） */}
              <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-5 overflow-x-auto">
                <div className="text-xs tracking-[0.15em] text-neon-cyan mb-3">
                  サイズ別の合計（発注用）
                </div>
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="text-white/45 text-xs text-left">
                      <th className="py-1.5 font-normal">サイズ</th>
                      <th className="py-1.5 font-normal text-right">単価</th>
                      <th className="py-1.5 font-normal text-right">枚数</th>
                      <th className="py-1.5 font-normal text-right">小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeTally?.map((s) => (
                      <tr key={s.key} className="border-t border-white/10">
                        <td className="py-2 text-white">{s.label}</td>
                        <td className="py-2 text-right text-white/60">{yen(s.price)}</td>
                        <td
                          className={`py-2 text-right font-display text-lg ${
                            s.n > 0 ? "text-awa-glow" : "text-white/30"
                          }`}
                        >
                          {s.n}
                        </td>
                        <td className="py-2 text-right text-white/80">{yen(s.subtotal)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-awa-glow/40">
                      <td className="py-2 text-white font-bold" colSpan={2}>
                        合計
                      </td>
                      <td className="py-2 text-right text-awa-glow font-display text-xl">
                        {grand.qty}
                      </td>
                      <td className="py-2 text-right text-awa-glow font-bold">{yen(grand.price)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

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

              {rows.length === 0 ? (
                <p className="text-white/60 text-sm">まだ注文がありません。</p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">
                    ひとりずつの注文
                  </h3>
                  {rows.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.name}</span>
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
                                items: r.items ?? {},
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
                        <Row2 label="サイズ・枚数" value={formatTshirtItems(r.items ?? {}) || "—"} />
                        <Row2 label="合計" value={`${r.total_qty}枚／${yen(r.total_price)}`} />
                        <Row2 label="連絡事項" value={r.memo || "—"} />
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
      <dt className="text-white/45 w-28 shrink-0">{label}</dt>
      <dd className="text-white/85 whitespace-pre-wrap">{value}</dd>
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
  const totals = tshirtTotals(editing.items);
  return (
    <div className="rounded-xl border border-awa-glow/40 bg-awa-indigo-900/50 p-5 md:p-6 space-y-4">
      <div className="text-xs tracking-[0.15em] text-awa-glow">
        {editing.id === "new" ? "注文を代理で追加" : "注文を編集"}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.15em] text-white/70">お名前</span>
        <input
          type="text"
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          className={inputCls}
        />
      </label>
      <div>
        <span className="block text-xs tracking-[0.15em] text-white/70 mb-2">サイズ・枚数</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TSHIRT_SIZES.map((s) => (
            <label key={s.key} className="flex flex-col gap-1">
              <span className="text-xs text-white/60">{s.label}</span>
              <input
                type="number"
                min={0}
                max={TSHIRT_MAX_PER_SIZE}
                inputMode="numeric"
                value={editing.items[s.key] ?? 0}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    items: { ...editing.items, [s.key]: Number(e.target.value) || 0 },
                  })
                }
                className={inputCls}
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-white/70">
          合計 {totals.qty}枚／<span className="text-awa-glow">{yen(totals.price)}</span>
        </p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.15em] text-white/70">連絡事項</span>
        <textarea
          value={editing.memo}
          onChange={(e) => setEditing({ ...editing, memo: e.target.value })}
          rows={2}
          className={`${inputCls} resize-y`}
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
