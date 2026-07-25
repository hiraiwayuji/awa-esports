"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Btn, Card, VerdictBadge, TextArea, SelectField } from "./ui";

type Screening = {
  id: string;
  candidate_company_name: string;
  candidate_data: Record<string, unknown>;
  screening_result: string;
  risk_level: string;
  matched_rules: { code: string; label: string; status: string; message: string }[];
  matched_competitors: { companyName: string; reason: string }[];
  required_actions: string[];
  screened_by: string;
  screened_at: string;
  final_decision: string;
  decision_reason: string;
  approved_by: string;
  approved_at: string | null;
  created_at: string;
};

const DECISION: Record<string, string> = {
  pending: "未決",
  approved: "承認",
  conditional: "条件付き承認",
  rejected: "却下",
};

export default function HistoryTab({ canWrite }: { canWrite: boolean }) {
  const [rows, setRows] = useState<Screening[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/admin/sponsor/screenings", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) setRows(j.rows);
      else setErr(j.error === "db_not_configured" ? "DB未設定" : j.error);
    } catch { setErr("network_error"); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">過去に実行した適合チェックの履歴。最終承認（人間の判断）をここで記録します。</p>
        <Btn variant="ghost" onClick={load}>↻ 再読み込み</Btn>
      </div>
      {err && <p className="text-xs text-rose-300">エラー：{err}</p>}
      {rows === null ? (
        <p className="text-sm text-white/50 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> 読み込み中…</p>
      ) : rows.length === 0 ? (
        <Card><p className="text-sm text-white/50 text-center py-6">まだ審査履歴がありません。</p></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <ScreeningRow key={r.id} r={r} open={openId === r.id} onToggle={() => setOpenId(openId === r.id ? null : r.id)} canWrite={canWrite} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScreeningRow({ r, open, onToggle, canWrite, onUpdated }: { r: Screening; open: boolean; onToggle: () => void; canWrite: boolean; onUpdated: () => void }) {
  const [decision, setDecision] = useState(r.final_decision);
  const [reason, setReason] = useState(r.decision_reason);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/sponsor/screenings/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ final_decision: decision, decision_reason: reason }),
    });
    const j = await res.json();
    setSaving(false);
    if (j.ok) onUpdated();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-bold text-white">{r.candidate_company_name || "（無名）"}</span>
          <VerdictBadge verdict={r.screening_result} />
          <span className="text-[10px] rounded-full border border-white/15 text-white/55 px-2 py-0.5">{DECISION[r.final_decision] ?? r.final_decision}</span>
        </span>
        <span className="text-[11px] text-white/40 shrink-0">{new Date(r.created_at).toLocaleString("ja-JP")} / {r.screened_by}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 text-sm">
          <p className="text-xs text-white/50">リスク評価：{r.risk_level}</p>
          {r.matched_competitors.length > 0 && (
            <div className="text-xs text-white/70">競合：{r.matched_competitors.map((c) => c.companyName).join("・")}</div>
          )}
          {r.required_actions.length > 0 && (
            <div>
              <div className="text-[10px] tracking-[0.2em] text-neon-cyan mb-1">対応事項</div>
              <ul className="text-xs text-white/70 space-y-0.5">
                {r.required_actions.map((a, i) => <li key={i}>・{a}</li>)}
              </ul>
            </div>
          )}
          {r.approved_by && (
            <p className="text-xs text-emerald-300/80">承認者：{r.approved_by}（{r.approved_at ? new Date(r.approved_at).toLocaleString("ja-JP") : ""}）</p>
          )}

          {canWrite && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="text-[10px] tracking-[0.2em] text-neon-cyan">最終判定（人間の承認）</div>
              <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
                <SelectField label="最終決定" value={decision} onChange={setDecision} options={Object.entries(DECISION).map(([value, label]) => ({ value, label }))} />
                <TextArea label="判定理由" value={reason} onChange={setReason} rows={2} />
              </div>
              <Btn onClick={save} disabled={saving}>{saving ? <Loader2 size={13} className="animate-spin" /> : null}最終判定を保存</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
