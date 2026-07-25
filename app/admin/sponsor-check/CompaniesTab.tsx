"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Download, Trash2, AlertCircle } from "lucide-react";
import type { SponsorCompany, SponsorCategory } from "@/lib/sponsor/types";
import { TextField, TextArea, SelectField, CheckRow, Btn, Card, SectionHead } from "./ui";

const STATUS_LABEL: Record<string, string> = {
  prospect: "審査中",
  active: "契約中",
  expired: "契約終了",
  rejected: "契約不可",
};
const STATUS_COLOR: Record<string, string> = {
  prospect: "border-yellow-300/50 text-yellow-300",
  active: "border-emerald-300/50 text-emerald-300",
  expired: "border-white/25 text-white/50",
  rejected: "border-rose-300/50 text-rose-300",
};

type Draft = {
  legal_name: string;
  brand_name: string;
  corporate_number: string;
  website_url: string;
  business_description: string;
  company_group: string;
  partner_type: "sponsor" | "supporter";
  status: "prospect" | "active" | "expired" | "rejected";
  category_name: string;
  contract_start: string;
  contract_end: string;
  region_scope: string;
  event_scope: string;
  game_scope: string;
  exclusivity: boolean;
  exclusivity_scope: string;
  notes: string;
};

function emptyDraft(): Draft {
  return {
    legal_name: "",
    brand_name: "",
    corporate_number: "",
    website_url: "",
    business_description: "",
    company_group: "",
    partner_type: "sponsor",
    status: "active",
    category_name: "",
    contract_start: "",
    contract_end: "",
    region_scope: "",
    event_scope: "",
    game_scope: "",
    exclusivity: false,
    exclusivity_scope: "",
    notes: "",
  };
}

const splitList = (s: string) =>
  s.split(/[,、\/／\n]/).map((x) => x.trim()).filter(Boolean);

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function CompaniesTab({ canWrite }: { canWrite: boolean }) {
  const [rows, setRows] = useState<SponsorCompany[] | null>(null);
  const [categories, setCategories] = useState<SponsorCategory[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  // フィルター
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [fCategory, setFCategory] = useState("all");
  const [fExclusive, setFExclusive] = useState(false);
  const [fGame, setFGame] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/admin/sponsor/companies", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) setRows(j.rows);
      else setErr(j.error === "db_not_configured" ? "DB未設定（SUPABASE_SERVICE_ROLE_KEY）" : j.error);
    } catch {
      setErr("network_error");
    }
  }

  useEffect(() => {
    load();
    fetch("/api/admin/sponsor/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => j.ok && setCategories(j.rows))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fType !== "all" && r.partner_type !== fType) return false;
      if (fCategory !== "all" && r.category_name !== fCategory) return false;
      if (fExclusive && !r.exclusivity) return false;
      if (fGame && !r.game_scope.some((g) => g.includes(fGame))) return false;
      if (q) {
        const hay = `${r.legal_name} ${r.brand_name} ${r.category_name} ${r.business_description}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, fStatus, fType, fCategory, fExclusive, fGame, q]);

  function openEdit(r: SponsorCompany) {
    setEditId(r.id);
    setDraft({
      legal_name: r.legal_name,
      brand_name: r.brand_name,
      corporate_number: r.corporate_number,
      website_url: r.website_url,
      business_description: r.business_description,
      company_group: r.company_group,
      partner_type: r.partner_type,
      status: r.status,
      category_name: r.category_name,
      contract_start: r.contract_start ?? "",
      contract_end: r.contract_end ?? "",
      region_scope: r.region_scope.join("、"),
      event_scope: r.event_scope.join("、"),
      game_scope: r.game_scope.join("、"),
      exclusivity: r.exclusivity,
      exclusivity_scope: r.exclusivity_scope,
      notes: r.notes,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!draft.legal_name.trim()) {
      setErr("企業名（正式名称）は必須です。");
      return;
    }
    setSaving(true);
    setErr(null);
    const payload = {
      ...draft,
      region_scope: splitList(draft.region_scope),
      event_scope: splitList(draft.event_scope),
      game_scope: splitList(draft.game_scope),
    };
    try {
      const res = await fetch(
        editId ? `/api/admin/sponsor/companies/${editId}` : "/api/admin/sponsor/companies",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const j = await res.json();
      if (j.ok) {
        setShowForm(false);
        setEditId(null);
        setDraft(emptyDraft());
        load();
      } else {
        setErr("保存に失敗しました。");
      }
    } catch {
      setErr("network_error");
    }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm("この企業を削除（論理削除）しますか？")) return;
    try {
      const res = await fetch(`/api/admin/sponsor/companies/${id}`, { method: "DELETE" });
      const j = await res.json();
      if (j.ok) load();
      else setErr("削除に失敗しました。");
    } catch {
      setErr("network_error");
    }
  }

  const categoryOptions = [
    { value: "", label: "（未分類）" },
    ...categories.map((c) => ({ value: c.category_name, label: c.category_name })),
  ];

  return (
    <div className="space-y-5">
      {/* 追加/編集フォーム */}
      {canWrite && showForm && (
        <Card>
          <SectionHead eyebrow={editId ? "EDIT" : "NEW"} title={editId ? "企業を編集" : "スポンサー/応援企業を追加"} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextField label="正式名称 *" value={draft.legal_name} onChange={(v) => setDraft({ ...draft, legal_name: v })} />
            <TextField label="ブランド名" value={draft.brand_name} onChange={(v) => setDraft({ ...draft, brand_name: v })} />
            <TextField label="法人番号" value={draft.corporate_number} onChange={(v) => setDraft({ ...draft, corporate_number: v })} />
            <TextField label="親会社/グループ" value={draft.company_group} onChange={(v) => setDraft({ ...draft, company_group: v })} />
            <SelectField label="業種カテゴリー" value={draft.category_name} onChange={(v) => setDraft({ ...draft, category_name: v })} options={categoryOptions} />
            <SelectField label="区分" value={draft.partner_type} onChange={(v) => setDraft({ ...draft, partner_type: v as Draft["partner_type"] })} options={[{ value: "sponsor", label: "スポンサー企業" }, { value: "supporter", label: "応援企業" }]} />
            <SelectField label="ステータス" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v as Draft["status"] })} options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))} />
            <TextField label="公式サイト" value={draft.website_url} onChange={(v) => setDraft({ ...draft, website_url: v })} />
            <TextField label="契約開始" value={draft.contract_start} onChange={(v) => setDraft({ ...draft, contract_start: v })} type="date" />
            <TextField label="契約終了" value={draft.contract_end} onChange={(v) => setDraft({ ...draft, contract_end: v })} type="date" />
            <TextField label="対象地域" value={draft.region_scope} onChange={(v) => setDraft({ ...draft, region_scope: v })} hint="読点区切り" />
            <TextField label="対象イベント" value={draft.event_scope} onChange={(v) => setDraft({ ...draft, event_scope: v })} hint="読点区切り" />
            <TextField label="対象ゲーム" value={draft.game_scope} onChange={(v) => setDraft({ ...draft, game_scope: v })} hint="読点区切り" />
            <TextField label="独占の範囲" value={draft.exclusivity_scope} onChange={(v) => setDraft({ ...draft, exclusivity_scope: v })} />
          </div>
          <div className="mt-4">
            <TextArea label="事業内容" value={draft.business_description} onChange={(v) => setDraft({ ...draft, business_description: v })} rows={2} />
          </div>
          <div className="mt-4">
            <TextArea label="社内メモ（非公開）" value={draft.notes} onChange={(v) => setDraft({ ...draft, notes: v })} rows={2} />
          </div>
          <div className="mt-3">
            <CheckRow checked={draft.exclusivity} onChange={(v) => setDraft({ ...draft, exclusivity: v })} label="独占契約" />
          </div>
          <div className="mt-4 flex gap-3">
            <Btn onClick={save} disabled={saving}>{saving ? <Loader2 size={13} className="animate-spin" /> : null}保存</Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setEditId(null); setDraft(emptyDraft()); }}>キャンセル</Btn>
          </div>
        </Card>
      )}

      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-2">
        {canWrite && !showForm && (
          <Btn onClick={() => { setDraft(emptyDraft()); setEditId(null); setShowForm(true); }}>
            <Plus size={13} /> 企業を追加
          </Btn>
        )}
        <a
          href="/api/admin/sponsor/companies?format=csv"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 text-white/70 hover:border-white/40 px-4 py-2 text-xs font-display tracking-[0.1em]"
        >
          <Download size={13} /> CSV出力
        </a>
        <Btn variant="ghost" onClick={load}>↻ 再読み込み</Btn>
      </div>

      {/* フィルター */}
      <Card className="!p-4">
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SelectField label="ステータス" value={fStatus} onChange={setFStatus} options={[{ value: "all", label: "すべて" }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]} />
          <SelectField label="区分" value={fType} onChange={setFType} options={[{ value: "all", label: "すべて" }, { value: "sponsor", label: "スポンサー" }, { value: "supporter", label: "応援企業" }]} />
          <SelectField label="業種" value={fCategory} onChange={setFCategory} options={[{ value: "all", label: "すべて" }, ...categories.map((c) => ({ value: c.category_name, label: c.category_name }))]} />
          <TextField label="ゲーム" value={fGame} onChange={setFGame} placeholder="ゲーム名" />
          <TextField label="検索" value={q} onChange={setQ} placeholder="名称・事業内容" />
          <div className="flex items-end pb-1">
            <CheckRow checked={fExclusive} onChange={setFExclusive} label="独占のみ" />
          </div>
        </div>
      </Card>

      {err && <p className="text-xs text-rose-300">エラー：{err}</p>}

      {/* 一覧 */}
      {rows === null ? (
        <p className="text-sm text-white/50 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> 読み込み中…</p>
      ) : filtered.length === 0 ? (
        <Card><p className="text-sm text-white/50 text-center py-6">該当する企業がありません。</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const d = daysUntil(r.contract_end);
            const expiringSoon = r.status === "active" && d !== null && d >= 0 && d <= 60;
            return (
              <div key={r.id} className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-bold text-white">{r.brand_name || r.legal_name}</span>
                    <span className={`text-[10px] rounded-full border px-2 py-0.5 ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                    <span className="text-[10px] rounded-full border border-white/15 text-white/50 px-2 py-0.5">{r.partner_type === "sponsor" ? "スポンサー" : "応援"}</span>
                    {r.category_name && <span className="text-[10px] text-white/45">{r.category_name}</span>}
                    {r.exclusivity && <span className="text-[10px] rounded-full border border-neon-cyan/40 text-neon-cyan px-2 py-0.5">独占</span>}
                    {expiringSoon && (
                      <span className="text-[10px] rounded-full border border-orange-400/50 text-orange-300 px-2 py-0.5 flex items-center gap-1">
                        <AlertCircle size={10} /> 更新期限まで{d}日
                      </span>
                    )}
                  </div>
                  {canWrite && (
                    <div className="flex gap-2 shrink-0">
                      <Btn variant="ghost" onClick={() => openEdit(r)}>編集</Btn>
                      <Btn variant="danger" onClick={() => del(r.id)}><Trash2 size={12} /></Btn>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-white/55 flex flex-wrap gap-x-4 gap-y-1">
                  {(r.contract_start || r.contract_end) && (
                    <span>期間：{r.contract_start ?? "—"} 〜 {r.contract_end ?? "—"}</span>
                  )}
                  {r.game_scope.length > 0 && <span>ゲーム：{r.game_scope.join("・")}</span>}
                  {r.region_scope.length > 0 && <span>地域：{r.region_scope.join("・")}</span>}
                  {r.exclusivity_scope && <span>独占範囲：{r.exclusivity_scope}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
