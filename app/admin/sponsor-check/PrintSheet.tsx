"use client";

// スポンサー営業前確認シート（A4印刷用）。
// 画面では非表示（hidden）、印刷時のみ表示（print:block）。
// globals.css の @media print で白地・黒文字に整える。

import type { ScreeningCandidate, ScreeningResult, CheckItem } from "@/lib/sponsor/types";

const VERDICT_JP: Record<string, string> = {
  green: "緑：契約候補",
  yellow: "黄：条件付きで検討可能",
  orange: "橙：運営会議での審査が必要",
  red: "赤：契約不可",
  gray: "灰：情報不足・未確認",
};

function pickCheck(checks: CheckItem[], code: string): string {
  const c = checks.find((x) => x.code === code);
  if (!c) return "—";
  const mark = c.status === "ok" ? "○" : c.status === "block" ? "×" : c.status === "warn" ? "△" : c.status === "unknown" ? "？" : "・";
  return `${mark} ${c.message}`;
}

export default function PrintSheet({
  candidate,
  result,
  confirmedBy,
  date,
}: {
  candidate: ScreeningCandidate;
  result: ScreeningResult;
  confirmedBy: string;
  date: string;
}) {
  return (
    <div className="print-sheet hidden print:block text-black">
      <div style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
          <div>
            <div className="text-lg font-black">スポンサー営業前確認シート</div>
            <div className="text-xs">AWAKEN GLOW（A.G.）</div>
          </div>
          <div className="ps-badge inline-block px-4 py-2 font-black text-sm">
            {VERDICT_JP[result.verdict] ?? result.verdict}
          </div>
        </div>

        {/* 基本情報 */}
        <table className="w-full text-xs border-collapse mb-3">
          <tbody>
            <Row2 l1="企業名" v1={candidate.companyName || "—"} l2="業種" v2={candidate.categoryName || candidate.productCategory || "—"} />
            <Row2 l1="ブランド名" v1={candidate.brandName || "—"} l2="区分" v2={candidate.partnerType === "sponsor" ? "スポンサー企業" : "応援企業"} />
            <Row2 l1="法人番号" v1={candidate.corporateNumber || "—"} l2="代表者" v2={candidate.representative || "—"} />
            <Row2 l1="営業担当者" v1={candidate.salesRep || "—"} l2="確認日" v2={date} />
            <Row2 l1="確認担当者" v1={confirmedBy || "　　　　　　"} l2="総合判定" v2={VERDICT_JP[result.verdict] ?? result.verdict} />
          </tbody>
        </table>

        {/* チェック結果 */}
        <div className="ps-box p-2 mb-2">
          <div className="font-bold text-xs mb-1">チェック結果</div>
          <table className="w-full text-[11px] border-collapse">
            <tbody>
              <CheckLine label="禁止業種チェック" text={pickCheck(result.checks, "A")} />
              <CheckLine label="慎重審査業種" text={pickCheck(result.checks, "B")} />
              <CheckLine label="競合チェック" text={pickCheck(result.checks, "C")} />
              <CheckLine label="独占権チェック" text={pickCheck(result.checks, "D")} />
              <CheckLine label="大会規定チェック" text={pickCheck(result.checks, "J")} />
              <CheckLine label="法人情報チェック" text={pickCheck(result.checks, "K")} />
            </tbody>
          </table>
        </div>

        {/* 競合 */}
        <div className="ps-box p-2 mb-2">
          <div className="font-bold text-xs mb-1">競合企業</div>
          {result.competitors.length === 0 ? (
            <div className="text-[11px]">検出なし</div>
          ) : (
            <ul className="text-[11px] list-disc pl-4">
              {result.competitors.map((c) => (
                <li key={c.companyId}>
                  {c.companyName}（{c.reason}）{(c as { manualDecision?: string }).manualDecision ? ` ／ 手動判定：${jpDecision((c as { manualDecision?: string }).manualDecision!)}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 不足資料 / 確認事項 */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="ps-box p-2">
            <div className="font-bold text-xs mb-1">不足資料</div>
            <ListOrDash items={result.missingDocs} />
          </div>
          <div className="ps-box p-2">
            <div className="font-bold text-xs mb-1">確認事項</div>
            <ListOrDash items={result.preContractChecks} />
          </div>
        </div>

        {/* 営業時に聞く質問 */}
        <div className="ps-box p-2 mb-2">
          <div className="font-bold text-xs mb-1">営業時に聞く質問（記入）</div>
          <div className="h-14 border-b border-dashed border-gray-400" />
        </div>

        {/* 担当者メモ */}
        <div className="ps-box p-2 mb-2">
          <div className="font-bold text-xs mb-1">担当者メモ</div>
          <div className="h-14 border-b border-dashed border-gray-400" />
        </div>

        {/* 運営承認欄 */}
        <div className="ps-box p-2">
          <div className="font-bold text-xs mb-2">運営承認欄</div>
          <div className="flex gap-6 text-[11px]">
            <div>承認 / 条件付き承認 / 却下（いずれかに○）</div>
          </div>
          <div className="flex gap-8 mt-4 text-[11px]">
            <div>承認者：＿＿＿＿＿＿＿＿</div>
            <div>日付：＿＿＿＿＿＿</div>
            <div>印：＿＿＿</div>
          </div>
        </div>

        <div className="text-[9px] mt-3 text-gray-600">
          ※ 本シートは営業前の下準備です。最終承認は必ず運営（人間）が行います。個別の契約条件は契約書／合意書で定めます。
        </div>
      </div>
    </div>
  );
}

function jpDecision(v: string): string {
  return v === "competes" ? "競合する" : v === "not_competes" ? "競合しない" : v === "conditional" ? "条件付きで許可" : v;
}

function Row2({ l1, v1, l2, v2 }: { l1: string; v1: string; l2: string; v2: string }) {
  return (
    <tr>
      <th className="ps-box text-left p-1.5 w-[16%] font-bold bg-gray-100">{l1}</th>
      <td className="ps-box p-1.5 w-[34%]">{v1}</td>
      <th className="ps-box text-left p-1.5 w-[16%] font-bold bg-gray-100">{l2}</th>
      <td className="ps-box p-1.5 w-[34%]">{v2}</td>
    </tr>
  );
}

function CheckLine({ label, text }: { label: string; text: string }) {
  return (
    <tr>
      <th className="text-left p-1 w-[28%] font-bold align-top">{label}</th>
      <td className="p-1 align-top">{text}</td>
    </tr>
  );
}

function ListOrDash({ items }: { items: string[] }) {
  if (!items.length) return <div className="text-[11px]">—</div>;
  return (
    <ul className="text-[11px] list-disc pl-4">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}
