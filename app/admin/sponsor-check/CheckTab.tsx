"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Play, Save, Printer, Building2 } from "lucide-react";
import { emptyCandidate, SUPPORT_KINDS, type ScreeningCandidate, type ScreeningResult, type SponsorCategory } from "@/lib/sponsor/types";
import { TextField, TextArea, SelectField, CheckRow, Btn, Card, SectionHead, VerdictBadge } from "./ui";
import ResultView from "./ResultView";
import PrintSheet from "./PrintSheet";

type HoujinRec = { corporateNumber: string; name: string; address: string; postCode: string; closed: boolean };

export default function CheckTab({ canWrite }: { canWrite: boolean }) {
  const [cand, setCand] = useState<ScreeningCandidate>(emptyCandidate());
  const [categories, setCategories] = useState<SponsorCategory[]>([]);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmedBy, setConfirmedBy] = useState("");

  // 法人番号 API
  const [houjinState, setHoujin] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "notConfigured"; url: string }
    | { kind: "results"; records: HoujinRec[]; source: { name: string; url: string } }
    | { kind: "error"; message: string; url: string }
  >({ kind: "idle" });

  const set = <K extends keyof ScreeningCandidate>(k: K, v: ScreeningCandidate[K]) =>
    setCand((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/sponsor/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setCategories(j.rows);
      })
      .catch(() => {});
  }, []);

  const toggleKind = (k: string) =>
    setCand((p) => ({
      ...p,
      supportKinds: p.supportKinds.includes(k)
        ? p.supportKinds.filter((x) => x !== k)
        : [...p.supportKinds, k],
    }));

  async function lookupHoujin(mode: "number" | "name") {
    const q = mode === "number" ? cand.corporateNumber.trim() : cand.companyName.trim();
    if (!q) return;
    setHoujin({ kind: "loading" });
    try {
      const url = `/api/admin/sponsor/houjin?${mode}=${encodeURIComponent(q)}`;
      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json();
      if (j.ok && j.configured === false) {
        setHoujin({ kind: "notConfigured", url: j.source?.url ?? "https://www.houjin-bangou.nta.go.jp/" });
      } else if (j.ok && j.records) {
        setHoujin({ kind: "results", records: j.records, source: j.source });
      } else {
        setHoujin({ kind: "error", message: j.error ?? "検索に失敗しました", url: "https://www.houjin-bangou.nta.go.jp/" });
      }
    } catch {
      setHoujin({ kind: "error", message: "通信エラー", url: "https://www.houjin-bangou.nta.go.jp/" });
    }
  }

  function applyHoujin(r: HoujinRec) {
    setCand((p) => ({
      ...p,
      companyName: p.companyName || r.name,
      corporateNumber: r.corporateNumber,
      address: p.address || r.address,
      corporateVerified: true,
    }));
    setHoujin({ kind: "idle" });
  }

  async function runCheck() {
    setRunning(true);
    setErr(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/sponsor/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cand),
      });
      const j = await res.json();
      if (j.ok) {
        setResult(j.result);
        // 結果へスクロール
        setTimeout(() => document.getElementById("check-result")?.scrollIntoView({ behavior: "smooth" }), 50);
      } else {
        setErr(j.error === "db_not_configured" ? "サーバーにデータベース接続が未設定です（SUPABASE_SERVICE_ROLE_KEY）。" : "チェックに失敗しました。");
      }
    } catch {
      setErr("通信エラーが発生しました。");
    }
    setRunning(false);
  }

  async function saveScreening() {
    if (!result) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/sponsor/screenings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: cand, result }),
      });
      const j = await res.json();
      if (j.ok) setSaved(true);
      else setErr("保存に失敗しました。");
    } catch {
      setErr("通信エラーが発生しました。");
    }
    setSaving(false);
  }

  const categoryOptions = [
    { value: "", label: "（選択）" },
    ...categories.map((c) => ({
      value: c.category_name,
      label: `${c.category_name}${c.is_prohibited ? "【禁止】" : c.requires_review ? "【慎重】" : ""}`,
    })),
  ];

  const today = new Date().toLocaleDateString("ja-JP");

  return (
    <div className="space-y-6">
      <Card>
        <SectionHead eyebrow="INPUT / 候補企業の情報" title="営業前スポンサー確認" />

        {/* 法人番号確認 */}
        <div className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/[0.03] p-4 mb-5">
          <div className="flex items-center gap-2 text-[11px] text-neon-cyan mb-3">
            <Building2 size={14} /> 法人情報の確認（国税庁 法人番号）
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <TextField label="法人番号（13桁）" value={cand.corporateNumber} onChange={(v) => set("corporateNumber", v)} placeholder="1234567890123" />
              </div>
              <Btn onClick={() => lookupHoujin("number")} variant="ghost">
                <Search size={13} /> 番号で確認
              </Btn>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <TextField label="名称で検索" value={cand.companyName} onChange={(v) => set("companyName", v)} placeholder="企業名・屋号" />
              </div>
              <Btn onClick={() => lookupHoujin("name")} variant="ghost">
                <Search size={13} /> 名称で検索
              </Btn>
            </div>
          </div>

          {houjinState.kind === "loading" && (
            <p className="mt-3 text-xs text-white/50 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> 照会中…</p>
          )}
          {houjinState.kind === "notConfigured" && (
            <p className="mt-3 text-xs text-yellow-300/90">
              法人番号API未設定です。
              <a href={houjinState.url} target="_blank" rel="noopener noreferrer" className="underline ml-1">国税庁 法人番号公表サイト</a>
              で手動確認してください。
            </p>
          )}
          {houjinState.kind === "error" && (
            <p className="mt-3 text-xs text-rose-300">
              照会エラー：{houjinState.message}。
              <a href={houjinState.url} target="_blank" rel="noopener noreferrer" className="underline ml-1">公表サイトで手動確認</a>
            </p>
          )}
          {houjinState.kind === "results" && (
            <div className="mt-3 space-y-2">
              {houjinState.records.length === 0 && <p className="text-xs text-white/50">該当なし。</p>}
              {houjinState.records.map((r) => (
                <div key={r.corporateNumber} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-awa-indigo-950/40 px-3 py-2">
                  <div className="text-xs text-white/80 min-w-0">
                    <div className="font-bold truncate">{r.name} {r.closed && <span className="text-rose-300">（閉鎖）</span>}</div>
                    <div className="text-white/50">{r.corporateNumber} / {r.address}</div>
                  </div>
                  <Btn onClick={() => applyHoujin(r)} variant="ghost" className="shrink-0">反映</Btn>
                </div>
              ))}
              <p className="text-[10px] text-white/35">出典：{houjinState.source.name}。実在確認はスポンサー適格性を保証しません。</p>
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField label="企業名 *" value={cand.companyName} onChange={(v) => set("companyName", v)} />
          <TextField label="ブランド名" value={cand.brandName} onChange={(v) => set("brandName", v)} />
          <TextField label="代表者名" value={cand.representative} onChange={(v) => set("representative", v)} />
          <TextField label="所在地" value={cand.address} onChange={(v) => set("address", v)} />
          <TextField label="公式サイト" value={cand.websiteUrl} onChange={(v) => set("websiteUrl", v)} placeholder="https://…" />
          <TextField label="SNS" value={cand.snsUrl} onChange={(v) => set("snsUrl", v)} placeholder="https://…" />
          <SelectField label="業種カテゴリー" value={cand.categoryName} onChange={(v) => set("categoryName", v)} options={categoryOptions} />
          <TextField label="商品カテゴリー" value={cand.productCategory} onChange={(v) => set("productCategory", v)} placeholder="例：ゲーミングPC" />
          <SelectField
            label="区分"
            value={cand.partnerType}
            onChange={(v) => set("partnerType", v as "sponsor" | "supporter")}
            options={[
              { value: "sponsor", label: "スポンサー企業" },
              { value: "supporter", label: "応援企業" },
            ]}
          />
        </div>

        <div className="mt-4">
          <TextArea label="事業内容" value={cand.businessDescription} onChange={(v) => set("businessDescription", v)} rows={2} />
        </div>

        {/* 支援内容 */}
        <div className="mt-4">
          <span className="text-[10px] tracking-[0.15em] text-white/60">支援内容（金銭・物品・会場・機材・技術 等）</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {SUPPORT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleKind(k)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  cand.supportKinds.includes(k) ? "border-awa-glow bg-awa-glow/10 text-awa-glow" : "border-white/15 text-white/60 hover:border-white/40"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <TextField label="希望する権利" value={cand.desiredRights} onChange={(v) => set("desiredRights", v)} placeholder="ロゴ掲載・選手出演 など" />
          <div className="flex flex-col gap-2">
            <CheckRow checked={cand.exclusivity} onChange={(v) => set("exclusivity", v)} label="独占権を希望する" />
            {cand.exclusivity && (
              <TextField label="独占の範囲" value={cand.exclusivityScope} onChange={(v) => set("exclusivityScope", v)} placeholder="例：ゲーミングPC / 徳島県 / 2026年度" />
            )}
          </div>
          <TextField label="契約開始予定日" value={cand.contractStart} onChange={(v) => set("contractStart", v)} type="date" />
          <TextField label="契約終了予定日" value={cand.contractEnd} onChange={(v) => set("contractEnd", v)} type="date" />
          <TextField label="対象地域" value={cand.regionScope} onChange={(v) => set("regionScope", v)} hint="カンマ/読点区切りで複数可" />
          <TextField label="対象イベント" value={cand.eventScope} onChange={(v) => set("eventScope", v)} hint="カンマ/読点区切りで複数可" />
          <TextField label="対象ゲームタイトル" value={cand.gameScope} onChange={(v) => set("gameScope", v)} hint="カンマ/読点区切りで複数可" />
          <TextField label="営業担当者" value={cand.salesRep} onChange={(v) => set("salesRep", v)} />
        </div>

        <div className="mt-4">
          <TextArea label="備考" value={cand.notes} onChange={(v) => set("notes", v)} rows={2} />
        </div>

        <div className="mt-3">
          <CheckRow checked={cand.corporateVerified} onChange={(v) => set("corporateVerified", v)} label="法人情報を確認済み（実在・名称一致）" />
        </div>

        {err && <p className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{err}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <Btn onClick={runCheck} disabled={running} className="!px-6 !py-2.5">
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            スポンサー適合チェックを実行
          </Btn>
          <Btn onClick={() => { setCand(emptyCandidate()); setResult(null); setSaved(false); }} variant="ghost">クリア</Btn>
        </div>
      </Card>

      {/* 結果 */}
      {result && (
        <div id="check-result" className="space-y-4">
          <Card className="print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <VerdictBadge verdict={result.verdict} large />
                <span className="text-xs text-white/50">確認実施日：{today}</span>
              </div>
              <div className="flex gap-2">
                {canWrite && (
                  <Btn onClick={saveScreening} disabled={saving}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    履歴に保存
                  </Btn>
                )}
                <Btn onClick={() => window.print()} variant="ghost">
                  <Printer size={13} /> 確認シートを印刷
                </Btn>
              </div>
            </div>
            {saved && <p className="text-xs text-emerald-300 mb-3">審査履歴に保存しました。</p>}

            <div className="mb-3">
              <TextField label="確認担当者（シート記載用）" value={confirmedBy} onChange={setConfirmedBy} placeholder="氏名" />
            </div>

            <ResultView
              result={result}
              onCompetitorsChange={
                canWrite
                  ? (next) => setResult((prev) => (prev ? { ...prev, competitors: next } : prev))
                  : undefined
              }
            />
          </Card>

          {/* 印刷用シート（画面では非表示・印刷時のみ表示） */}
          <PrintSheet candidate={cand} result={result} confirmedBy={confirmedBy} date={today} />
        </div>
      )}
    </div>
  );
}
