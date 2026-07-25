"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import type { TournamentRule } from "@/lib/sponsor/types";
import { TextField, TextArea, Btn, Card, SectionHead } from "./ui";

type Draft = {
  game_title: string;
  tournament_name: string;
  organizer: string;
  prohibited_categories: string;
  restricted_categories: string;
  official_sponsor_categories: string;
  effective_from: string;
  effective_to: string;
  source_name: string;
  source_url: string;
  last_checked_at: string;
  notes: string;
};

const empty = (): Draft => ({
  game_title: "",
  tournament_name: "",
  organizer: "",
  prohibited_categories: "",
  restricted_categories: "",
  official_sponsor_categories: "",
  effective_from: "",
  effective_to: "",
  source_name: "",
  source_url: "",
  last_checked_at: "",
  notes: "",
});

const splitList = (s: string) => s.split(/[,、\/／\n]/).map((x) => x.trim()).filter(Boolean);

export default function RulesTab({ canWrite }: { canWrite: boolean }) {
  const [rows, setRows] = useState<TournamentRule[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty());
  const [saving, setSaving] = useState(false);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/admin/sponsor/rules", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) setRows(j.rows);
      else setErr(j.error);
    } catch { setErr("network_error"); }
  }
  useEffect(() => { load(); }, []);

  function openEdit(r: TournamentRule) {
    setEditId(r.id);
    setDraft({
      game_title: r.game_title,
      tournament_name: r.tournament_name,
      organizer: r.organizer,
      prohibited_categories: r.prohibited_categories.join("、"),
      restricted_categories: r.restricted_categories.join("、"),
      official_sponsor_categories: r.official_sponsor_categories.join("、"),
      effective_from: r.effective_from ?? "",
      effective_to: r.effective_to ?? "",
      source_name: r.source_name,
      source_url: r.source_url,
      last_checked_at: r.last_checked_at ?? "",
      notes: r.notes,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!draft.game_title.trim() && !draft.tournament_name.trim()) { setErr("ゲームタイトルか大会名を入力してください。"); return; }
    setSaving(true);
    setErr(null);
    const payload = {
      ...draft,
      prohibited_categories: splitList(draft.prohibited_categories),
      restricted_categories: splitList(draft.restricted_categories),
      official_sponsor_categories: splitList(draft.official_sponsor_categories),
    };
    try {
      const res = await fetch(editId ? `/api/admin/sponsor/rules/${editId}` : "/api/admin/sponsor/rules", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j.ok) { setShowForm(false); setEditId(null); setDraft(empty()); load(); }
      else setErr("保存に失敗しました。");
    } catch { setErr("network_error"); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm("この規定を削除しますか？")) return;
    const res = await fetch(`/api/admin/sponsor/rules/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) load(); else setErr("削除に失敗しました。");
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-white/50">
        大会・ゲーム会社側のスポンサー規定を登録します。対象ゲームが一致する候補をチェックした際、
        禁止カテゴリー該当は「契約不可」、制限カテゴリー該当は「要審査」として自動で反映されます。
      </p>

      {canWrite && showForm && (
        <Card>
          <SectionHead eyebrow={editId ? "EDIT" : "NEW"} title={editId ? "大会規定を編集" : "大会規定を追加"} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextField label="ゲームタイトル" value={draft.game_title} onChange={(v) => setDraft({ ...draft, game_title: v })} placeholder="例：ストリートファイター6" />
            <TextField label="大会名" value={draft.tournament_name} onChange={(v) => setDraft({ ...draft, tournament_name: v })} />
            <TextField label="主催者" value={draft.organizer} onChange={(v) => setDraft({ ...draft, organizer: v })} />
            <TextField label="適用開始" value={draft.effective_from} onChange={(v) => setDraft({ ...draft, effective_from: v })} type="date" />
            <TextField label="適用終了" value={draft.effective_to} onChange={(v) => setDraft({ ...draft, effective_to: v })} type="date" />
            <TextField label="最終確認日" value={draft.last_checked_at} onChange={(v) => setDraft({ ...draft, last_checked_at: v })} type="date" />
            <TextField label="出典名" value={draft.source_name} onChange={(v) => setDraft({ ...draft, source_name: v })} />
            <div className="lg:col-span-2"><TextField label="出典URL" value={draft.source_url} onChange={(v) => setDraft({ ...draft, source_url: v })} placeholder="https://…" /></div>
          </div>
          <div className="mt-4 grid gap-4">
            <TextField label="禁止カテゴリー" value={draft.prohibited_categories} onChange={(v) => setDraft({ ...draft, prohibited_categories: v })} hint="読点区切り" />
            <TextField label="制限カテゴリー" value={draft.restricted_categories} onChange={(v) => setDraft({ ...draft, restricted_categories: v })} hint="読点区切り" />
            <TextField label="公式スポンサーカテゴリー" value={draft.official_sponsor_categories} onChange={(v) => setDraft({ ...draft, official_sponsor_categories: v })} hint="読点区切り" />
            <TextArea label="備考" value={draft.notes} onChange={(v) => setDraft({ ...draft, notes: v })} rows={2} />
          </div>
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
      ) : rows.length === 0 ? (
        <Card><p className="text-sm text-white/50 text-center py-6">まだ大会規定が登録されていません。</p></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">{r.tournament_name || r.game_title}</span>
                {canWrite && (
                  <div className="flex gap-2">
                    <Btn variant="ghost" onClick={() => openEdit(r)}>編集</Btn>
                    <Btn variant="danger" onClick={() => del(r.id)}><Trash2 size={12} /></Btn>
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-white/55 flex flex-wrap gap-x-4 gap-y-1">
                {r.game_title && <span>ゲーム：{r.game_title}</span>}
                {r.organizer && <span>主催：{r.organizer}</span>}
                {r.last_checked_at && <span>最終確認：{r.last_checked_at}</span>}
              </div>
              {r.prohibited_categories.length > 0 && <div className="mt-1.5 text-xs text-rose-300/90">禁止：{r.prohibited_categories.join("・")}</div>}
              {r.restricted_categories.length > 0 && <div className="text-xs text-yellow-300/90">制限：{r.restricted_categories.join("・")}</div>}
              {r.official_sponsor_categories.length > 0 && <div className="text-xs text-emerald-300/80">公式：{r.official_sponsor_categories.join("・")}</div>}
              {r.source_url && (
                <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-neon-cyan hover:underline">
                  <ExternalLink size={11} /> {r.source_name || "出典"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
