"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Btn, Card, SelectField } from "./ui";

type Inquiry = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  website_url: string;
  sns_url: string;
  business_description: string;
  desired_type: string;
  support_kinds: string[];
  placement_wish: string;
  target_events: string;
  free_text: string;
  status: string;
  admin_memo: string;
  created_at: string;
};

const DESIRED: Record<string, string> = { sponsor: "スポンサー企業", supporter: "応援企業", consult: "相談" };
const STATUS: Record<string, string> = { new: "新規", reviewing: "対応中", done: "完了", closed: "終了" };

export default function InquiriesTab({ canWrite }: { canWrite: boolean }) {
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/admin/sponsor/inquiries", { cache: "no-store" });
      const j = await res.json();
      if (j.ok) setRows(j.rows);
      else setErr(j.error === "db_not_configured" ? "DB未設定" : j.error);
    } catch { setErr("network_error"); }
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: { status?: string; admin_memo?: string }) {
    const res = await fetch(`/api/admin/sponsor/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await res.json();
    if (j.ok) load(); else setErr("更新に失敗しました。");
  }

  async function del(id: string) {
    if (!confirm("この問い合わせを削除しますか？")) return;
    const res = await fetch(`/api/admin/sponsor/inquiries/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) load(); else setErr("削除に失敗しました。");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">公開ページからの問い合わせ（非公開・運営のみ閲覧）。</p>
        <Btn variant="ghost" onClick={load}>↻ 再読み込み</Btn>
      </div>
      {err && <p className="text-xs text-rose-300">エラー：{err}</p>}
      {rows === null ? (
        <p className="text-sm text-white/50 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> 読み込み中…</p>
      ) : rows.length === 0 ? (
        <Card><p className="text-sm text-white/50 text-center py-6">まだ問い合わせがありません。</p></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const open = openId === r.id;
            return (
              <div key={r.id} className="rounded-xl border border-white/10 bg-awa-indigo-900/40">
                <button onClick={() => setOpenId(open ? null : r.id)} className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left">
                  <span className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-bold text-white">{r.company_name || "（無名）"}</span>
                    <span className="text-[10px] rounded-full border border-white/15 text-white/50 px-2 py-0.5">{DESIRED[r.desired_type] ?? r.desired_type}</span>
                    <span className="text-[10px] rounded-full border border-neon-cyan/40 text-neon-cyan px-2 py-0.5">{STATUS[r.status] ?? r.status}</span>
                  </span>
                  <span className="text-[11px] text-white/40 shrink-0">{new Date(r.created_at).toLocaleString("ja-JP")}</span>
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2 text-sm">
                    <Detail l="担当者" v={r.contact_name} />
                    <Detail l="メール" v={r.email} />
                    <Detail l="電話" v={r.phone} />
                    <Detail l="所在地" v={r.address} />
                    <Detail l="公式サイト" v={r.website_url} link />
                    <Detail l="SNS" v={r.sns_url} link />
                    <Detail l="事業内容" v={r.business_description} />
                    <Detail l="希望する支援" v={r.support_kinds.join("・")} />
                    <Detail l="希望する掲載" v={r.placement_wish} />
                    <Detail l="対象イベント/ゲーム" v={r.target_events} />
                    <Detail l="自由記入" v={r.free_text} />
                    {canWrite && (
                      <div className="pt-2 flex flex-wrap items-end gap-3 border-t border-white/5">
                        <div className="w-40">
                          <SelectField label="ステータス" value={r.status} onChange={(v) => update(r.id, { status: v })} options={Object.entries(STATUS).map(([value, label]) => ({ value, label }))} />
                        </div>
                        <Btn variant="danger" onClick={() => del(r.id)}><Trash2 size={12} /> 削除</Btn>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ l, v, link }: { l: string; v: string; link?: boolean }) {
  if (!v) return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <span className="text-white/45 text-xs">{l}</span>
      {link ? (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline break-all text-xs">{v}</a>
      ) : (
        <span className="text-white/85 whitespace-pre-wrap break-words text-xs">{v}</span>
      )}
    </div>
  );
}
