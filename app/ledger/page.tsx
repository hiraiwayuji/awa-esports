"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, AWA_SUPABASE_KEY, awaSupabaseHeaders } from "@/lib/awa-supabase";

type Entry = {
  id: string;
  created_at: string;
  entry_date: string;
  kind: "income" | "expense";
  item: string;
  amount: number;
  memo: string;
  receipt_path: string | null;
  receipt_name: string | null;
};

const FN = `${AWA_SUPABASE_URL}/functions/v1/member-files`;

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

async function fnCall(payload: Record<string, unknown>) {
  const res = await fetch(FN, {
    method: "POST",
    headers: { apikey: AWA_SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

const yen = (n: number) => `¥${(n ?? 0).toLocaleString("ja-JP")}`;

const inputCls =
  "rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition";

export default function LedgerPage() {
  const [adminPass, setAdminPass] = useState("");
  const [entered, setEntered] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 新規記録フォーム
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [createReceipt, setCreateReceipt] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 編集フォーム
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editKind, setEditKind] = useState<"income" | "expense">("expense");
  const [editItem, setEditItem] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editReceiptFile, setEditReceiptFile] = useState<File | null>(null);
  const [editClearReceipt, setEditClearReceipt] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMsg, setEditMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load(pass?: string) {
    const data = await rpc<Entry[]>("ledger_list", {
      member_pass: (pass ?? adminPass).trim(),
    });
    setEntries(data ?? []);
  }

  async function enter(e?: React.FormEvent) {
    e?.preventDefault();
    const p = adminPass.trim();
    if (!p) return;
    setLoading(true);
    setError(null);
    try {
      await load(p);
      setEntered(true);
    } catch {
      setError("パスワードが違います。");
    }
    setLoading(false);
  }

  async function uploadReceipt(
    entryId: string,
    file: File,
  ): Promise<{ storage_path: string; file_name: string } | null> {
    const d = await fnCall({
      action: "ledger_receipt_upload",
      admin_pass: adminPass.trim(),
      entry_id: entryId,
      file_name: file.name,
      mime: file.type,
    });
    if (!d.signedUrl) return null;
    const put = await fetch(d.signedUrl as string, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!put.ok) return null;
    return {
      storage_path: d.storage_path as string,
      file_name: d.file_name as string,
    };
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number.parseInt(amount, 10);
    if (!item.trim() || !Number.isFinite(amt) || amt < 0 || saving) return;
    setSaving(true);
    setMsg(null);
    try {
      const newId = await rpc<string>("ledger_add", {
        admin_pass: adminPass.trim(),
        p_entry_date: date || null,
        p_kind: kind,
        p_item: item.trim(),
        p_amount: amt,
        p_memo: memo.trim(),
      });

      if (createReceipt && newId) {
        const receipt = await uploadReceipt(newId, createReceipt);
        if (receipt) {
          await rpc("ledger_update", {
            admin_pass: adminPass.trim(),
            target_id: newId,
            p_entry_date: date || null,
            p_kind: kind,
            p_item: item.trim(),
            p_amount: amt,
            p_memo: memo.trim(),
            p_receipt_path: receipt.storage_path,
            p_receipt_name: receipt.file_name,
          });
        }
      }

      setItem("");
      setAmount("");
      setMemo("");
      setDate("");
      setCreateReceipt(null);
      const inp = document.getElementById("create-receipt") as HTMLInputElement | null;
      if (inp) inp.value = "";
      await load();
      setMsg({ text: "記録しました", ok: true });
    } catch {
      setMsg({
        text: "記録できませんでした。パスワード・項目・金額をご確認ください。",
        ok: false,
      });
    }
    setSaving(false);
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditDate(entry.entry_date ?? "");
    setEditKind(entry.kind);
    setEditItem(entry.item);
    setEditAmount(String(entry.amount));
    setEditMemo(entry.memo ?? "");
    setEditReceiptFile(null);
    setEditClearReceipt(false);
    setEditMsg(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number.parseInt(editAmount, 10);
    if (!editItem.trim() || !Number.isFinite(amt) || amt < 0 || savingEdit || !editingId)
      return;
    setSavingEdit(true);
    setEditMsg(null);
    try {
      let receiptPath: string | null = null;
      let receiptName: string | null = null;

      if (!editClearReceipt && editReceiptFile) {
        const receipt = await uploadReceipt(editingId, editReceiptFile);
        if (receipt) {
          receiptPath = receipt.storage_path;
          receiptName = receipt.file_name;
        }
      }

      await rpc("ledger_update", {
        admin_pass: adminPass.trim(),
        target_id: editingId,
        p_entry_date: editDate || null,
        p_kind: editKind,
        p_item: editItem.trim(),
        p_amount: amt,
        p_memo: editMemo.trim(),
        p_receipt_path: receiptPath,
        p_receipt_name: receiptName,
        p_clear_receipt: editClearReceipt,
      });

      await load();
      setEditingId(null);
    } catch {
      setEditMsg({ text: "更新できませんでした。", ok: false });
    }
    setSavingEdit(false);
  }

  async function removeEntry(id: string) {
    if (!window.confirm("この記録を削除します。よろしいですか？")) return;
    try {
      const entry = entries.find((x) => x.id === id);
      if (entry?.receipt_path) {
        await fnCall({
          action: "ledger_receipt_delete",
          admin_pass: adminPass.trim(),
          entry_id: id,
        });
      }
      await rpc("ledger_delete", { admin_pass: adminPass.trim(), target_id: id });
      setEntries((prev) => prev.filter((x) => x.id !== id));
    } catch {
      window.alert("削除できませんでした。");
    }
  }

  async function downloadReceipt(entryId: string) {
    const d = await fnCall({
      action: "ledger_receipt_download",
      admin_pass: adminPass.trim(),
      entry_id: entryId,
    });
    if (!d.url) {
      window.alert("ダウンロードできませんでした。");
      return;
    }
    const a = document.createElement("a");
    a.href = d.url as string;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
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
              eyebrow="ADMIN ONLY / 経理・会計"
              title="ACCOUNTING"
              subtitle="収入・支出・残高を管理します。"
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
                運営専用ページです。パスワードを入力してください。
              </p>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="パスワード"
                className={inputCls}
              />
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={loading || !adminPass.trim()}
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

              {/* 新規記録フォーム */}
              <form
                onSubmit={addEntry}
                className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.04] p-5 md:p-6 space-y-4"
              >
                <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">
                  NEW ENTRY / 記録を追加
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-[0.15em] text-white/70">区分</span>
                    <select
                      value={kind}
                      onChange={(e) => setKind(e.target.value as "income" | "expense")}
                      className={inputCls}
                    >
                      <option value="expense">支出</option>
                      <option value="income">収入</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-[0.15em] text-white/70">日付</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputCls}
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
                    className={inputCls}
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="金額（円）"
                    min={0}
                    className={inputCls}
                  />
                </div>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="メモ（任意）"
                  maxLength={500}
                  className={`w-full ${inputCls}`}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs tracking-[0.15em] text-white/70">
                    📎 レシート・請求書（任意）
                  </span>
                  <input
                    id="create-receipt"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setCreateReceipt(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-awa-glow/15 file:text-awa-glow file:px-3 file:py-1.5 file:text-xs file:font-bold hover:file:bg-awa-glow/25"
                  />
                  <p className="text-[11px] text-white/30">写真・PDF・Wordなど（25MBまで）</p>
                </div>
                {msg && (
                  <p className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}>
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

              {/* 一覧 */}
              {entries.length === 0 ? (
                <p className="text-white/50 text-sm">まだ記録はありません。</p>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) =>
                    editingId === e.id ? (
                      /* 編集フォーム（インライン） */
                      <div
                        key={e.id}
                        className="rounded-xl border border-awa-glow/30 bg-awa-glow/[0.03] overflow-hidden"
                      >
                        <form onSubmit={saveEdit} className="p-4 space-y-3">
                          <div className="text-[11px] font-display tracking-[0.2em] text-awa-glow">
                            EDIT / 編集
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <select
                              value={editKind}
                              onChange={(ev) =>
                                setEditKind(ev.target.value as "income" | "expense")
                              }
                              className={inputCls}
                            >
                              <option value="expense">支出</option>
                              <option value="income">収入</option>
                            </select>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(ev) => setEditDate(ev.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              type="text"
                              value={editItem}
                              onChange={(ev) => setEditItem(ev.target.value)}
                              placeholder="項目"
                              maxLength={120}
                              className={inputCls}
                            />
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(ev) => setEditAmount(ev.target.value)}
                              placeholder="金額（円）"
                              min={0}
                              className={inputCls}
                            />
                          </div>
                          <input
                            type="text"
                            value={editMemo}
                            onChange={(ev) => setEditMemo(ev.target.value)}
                            placeholder="メモ（任意）"
                            maxLength={500}
                            className={`w-full ${inputCls}`}
                          />

                          {/* レシート */}
                          <div className="space-y-2">
                            <span className="text-xs text-white/60">📎 レシート・請求書</span>
                            {e.receipt_path && !editClearReceipt && (
                              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                                <span className="text-awa-glow">添付あり：{e.receipt_name}</span>
                                <button
                                  type="button"
                                  onClick={() => setEditClearReceipt(true)}
                                  className="text-rose-300/70 hover:text-rose-300 transition"
                                >
                                  削除
                                </button>
                                <span className="text-white/30">または下で差し替え</span>
                              </div>
                            )}
                            {editClearReceipt && (
                              <div className="flex items-center gap-3 text-[11px]">
                                <span className="text-rose-300">添付を削除します</span>
                                <button
                                  type="button"
                                  onClick={() => setEditClearReceipt(false)}
                                  className="text-white/50 hover:text-white/80 transition"
                                >
                                  取り消し
                                </button>
                              </div>
                            )}
                            {!editClearReceipt && (
                              <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                onChange={(ev) =>
                                  setEditReceiptFile(ev.target.files?.[0] ?? null)
                                }
                                className="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/60 file:px-3 file:py-1.5 file:text-xs file:font-bold hover:file:bg-white/15"
                              />
                            )}
                          </div>

                          {editMsg && (
                            <p
                              className={`text-[12px] ${editMsg.ok ? "text-awa-glow" : "text-rose-300"}`}
                            >
                              {editMsg.text}
                            </p>
                          )}
                          <div className="flex gap-3 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-xs text-white/40 hover:text-white/70 transition px-4 py-2"
                            >
                              キャンセル
                            </button>
                            <button
                              type="submit"
                              disabled={savingEdit || !editItem.trim() || !editAmount.trim()}
                              className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.15em] text-xs px-5 py-2 transition"
                            >
                              {savingEdit ? "保存中…" : "保存する"}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* 通常表示 */
                      <div
                        key={e.id}
                        className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span
                              className={`text-[10px] tracking-wider rounded-full border px-2 py-0.5 ${
                                e.kind === "income"
                                  ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10"
                                  : "border-rose-300/40 text-rose-200 bg-rose-300/10"
                              }`}
                            >
                              {e.kind === "income" ? "収入" : "支出"}
                            </span>
                            <span className="text-white/40 text-[11px]">{e.entry_date}</span>
                            {e.receipt_path && (
                              <button
                                onClick={() => downloadReceipt(e.id)}
                                className="text-[11px] text-awa-glow/70 hover:text-awa-glow transition"
                                title={e.receipt_name ?? "レシート"}
                              >
                                📎 レシート
                              </button>
                            )}
                          </div>
                          <p className="text-white font-bold text-sm truncate">{e.item}</p>
                          {e.memo && (
                            <p className="text-white/40 text-[11px] truncate">{e.memo}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`font-display text-sm ${e.kind === "income" ? "text-neon-cyan" : "text-rose-300"}`}
                          >
                            {e.kind === "income" ? "+" : "−"}
                            {yen(e.amount)}
                          </span>
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEdit(e)}
                              className="text-[11px] text-white/40 hover:text-white/70 transition"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => removeEntry(e.id)}
                              className="text-[11px] text-rose-300/70 hover:text-rose-300 transition"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
