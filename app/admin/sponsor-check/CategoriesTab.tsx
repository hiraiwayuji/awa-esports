"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { SponsorCategory } from "@/lib/sponsor/types";
import { TextField, TextArea, SelectField, CheckRow, Btn, Card, SectionHead } from "./ui";

type Draft = {
  parent_category: string;
  category_name: string;
  risk_level: "normal" | "review" | "prohibited";
  is_prohibited: boolean;
  requires_review: boolean;
  keywords: string;
  competitor_group: string;
  notes: string;
};

const empty = (): Draft => ({
  parent_category: "",
  category_name: "",
  risk_level: "normal",
  is_prohibited: false,
  requires_review: false,
  keywords: "",
  competitor_group: "",
  notes: "",
});

const splitList = (s: string) => s.split(/[,、\/／\n]/).map((x) => x.trim()).filter(Boolean);

export default function CategoriesTab({ canWrite }: { canWrite: boolean }) {
  const [rows, setRows] = useState<SponsorCategory[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty());
  const [saving, setSaving] = useState(false);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/admin/sponsor/categories", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) setRows(j.rows);
      else setErr(j.error);
    } catch {
      setErr("network_error");
    }
  }
  useEffect(() => { load(); }, []);

  function openEdit(r: SponsorCategory) {
    setEditId(r.id);
    setDraft({
      parent_category: r.parent_category,
      category_name: r.category_name,
      risk_level: r.risk_level,
      is_prohibited: r.is_prohibited,
      requires_review: r.requires_review,
      keywords: r.keywords.join("、"),
      competitor_group: r.competitor_group,
      notes: r.notes,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!draft.category_name.trim()) { setErr("カテゴリー名は必須です。"); return; }
    setSaving(true);
    setErr(null);
    const payload = {
      ...draft,
      keywords: splitList(draft.keywords),
      // risk_level とフラグの整合
      is_prohibited: draft.risk_level === "prohibited" ? true : draft.is_prohibited,
      requires_review: draft.risk_level === "review" ? true : draft.requires_review,
    };
    try {
      const res = await fetch(
        editId ? `/api/admin/sponsor/categories/${editId}` : "/api/admin/sponsor/categories",
        { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      const j = await res.json();
      if (j.ok) { setShowForm(false); setEditId(null); setDraft(empty()); load(); }
      else setErr(j.error === "duplicate_category" ? "同名のカテゴリーが既にあります。" : "保存に失敗しました。");
    } catch { setErr("network_error"); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm("このカテゴリーを削除しますか？")) return;
    const res = await fetch(`/api/admin/sponsor/categories/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) load(); else setErr("削除に失敗しました。");
  }

  const groups = rows ? groupBy(rows, (r) => r.parent_category || "その他") : {};

  return (
    <div className="space-y-5">
      <p className="text-xs text-white/50">
        競合ルール（禁止・慎重審査・競合グループ）はコードを触らずここで追加・変更できます。
        同じ「競合グループ」に属するカテゴリーは、名前が違っても競合可能性ありとして検出されます。
      </p>

      {canWrite && showForm && (
        <Card>
          <SectionHead eyebrow={editId ? "EDIT" : "NEW"} title={editId ? "カテゴリーを編集" : "カテゴリーを追加"} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextField label="大分類" value={draft.parent_category} onChange={(v) => setDraft({ ...draft, parent_category: v })} placeholder="例：IT・ハードウェア" />
            <TextField label="カテゴリー名 *" value={draft.category_name} onChange={(v) => setDraft({ ...draft, category_name: v })} />
            <SelectField label="リスク区分" value={draft.risk_level} onChange={(v) => setDraft({ ...draft, risk_level: v as Draft["risk_level"] })} options={[{ value: "normal", label: "通常" }, { value: "review", label: "慎重審査" }, { value: "prohibited", label: "禁止" }]} />
            <TextField label="競合グループ" value={draft.competitor_group} onChange={(v) => setDraft({ ...draft, competitor_group: v })} hint="市場が重なる束（例: beverage）" />
            <div className="lg:col-span-2">
              <TextField label="キーワード" value={draft.keywords} onChange={(v) => setDraft({ ...draft, keywords: v })} hint="突合語。読点区切り" />
            </div>
          </div>
          <div className="mt-3 flex gap-5">
            <CheckRow checked={draft.is_prohibited} onChange={(v) => setDraft({ ...draft, is_prohibited: v })} label="禁止業種" />
            <CheckRow checked={draft.requires_review} onChange={(v) => setDraft({ ...draft, requires_review: v })} label="慎重審査" />
          </div>
          <div className="mt-4"><TextArea label="備考" value={draft.notes} onChange={(v) => setDraft({ ...draft, notes: v })} rows={2} /></div>
          <div className="mt-4 flex gap-3">
            <Btn onClick={save} disabled={saving}>{saving ? <Loader2 size={13} className="animate-spin" /> : null}保存</Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setEditId(null); setDraft(empty()); }}>キャンセル</Btn>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        {canWrite && !showForm && <Btn onClick={() => { setDraft(empty()); setEditId(null); setShowForm(true); }}><Plus size={13} /> 追加</Btn>}
        <Btn variant="ghost" onClick={load}>↻ 再読み込み</Btn>
      </div>

      {err && <p className="text-xs text-rose-300">エラー：{err}</p>}

      {rows === null ? (
        <p className="text-sm text-white/50 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> 読み込み中…</p>
      ) : (
        Object.entries(groups).map(([parent, list]) => (
          <div key={parent}>
            <div className="text-[10px] tracking-[0.2em] text-white/40 mb-2">{parent}</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((r) => (
                <div key={r.id} className={`rounded-lg border px-3 py-2.5 ${r.is_prohibited ? "border-rose-400/30 bg-rose-500/[0.05]" : r.requires_review ? "border-yellow-300/25 bg-yellow-300/[0.04]" : "border-white/10 bg-awa-indigo-900/40"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white/90 font-medium">{r.category_name}</span>
                    <div className="flex items-center gap-1.5">
                      {r.is_prohibited && <span className="text-[9px] text-rose-300">禁止</span>}
                      {r.requires_review && <span className="text-[9px] text-yellow-300">慎重</span>}
                      {canWrite && (
                        <>
                          <button onClick={() => openEdit(r)} className="text-[10px] text-neon-cyan hover:underline">編集</button>
                          <button onClick={() => del(r.id)} className="text-rose-300/70 hover:text-rose-300"><Trash2 size={11} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {r.competitor_group && <div className="text-[10px] text-white/40 mt-0.5">grp: {r.competitor_group}</div>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function groupBy<T>(arr: T[], key: (x: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const x of arr) {
    const k = key(x);
    (out[k] ??= []).push(x);
  }
  return out;
}
