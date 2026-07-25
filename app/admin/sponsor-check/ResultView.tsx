"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle } from "lucide-react";
import type { ScreeningResult, CheckItem, CompetitorMatch } from "@/lib/sponsor/types";

function statusIcon(s: CheckItem["status"]) {
  switch (s) {
    case "ok":
      return <CheckCircle2 size={16} className="text-emerald-300" />;
    case "warn":
      return <AlertTriangle size={16} className="text-yellow-300" />;
    case "block":
      return <XCircle size={16} className="text-rose-300" />;
    case "unknown":
      return <HelpCircle size={16} className="text-white/50" />;
    default:
      return <Info size={16} className="text-sky-300" />;
  }
}

const severityLabel: Record<CompetitorMatch["severity"], string> = {
  conflict: "競合（強）",
  likely: "競合の可能性（高）",
  possible: "競合の可能性",
};

export default function ResultView({
  result,
  onCompetitorsChange,
}: {
  result: ScreeningResult;
  onCompetitorsChange?: (next: CompetitorMatch[]) => void;
}) {
  return (
    <div className="space-y-6">
      {/* 総合サマリ */}
      <div className="rounded-xl border border-white/10 bg-awa-indigo-950/40 p-4">
        <div className="text-[10px] tracking-[0.2em] text-neon-cyan mb-2">総合判定・理由</div>
        <p className="text-sm text-white/85 leading-relaxed">{result.summary}</p>
        <p className="mt-2 text-xs text-white/50">リスク評価：{result.riskLevel}</p>
      </div>

      {/* チェック項目 A〜N */}
      <div>
        <div className="text-[10px] tracking-[0.2em] text-neon-cyan mb-2">該当したルール（チェック項目）</div>
        <ul className="space-y-2">
          {result.checks.map((c) => (
            <li key={c.code} className="flex items-start gap-3 rounded-lg border border-white/10 bg-awa-indigo-950/30 px-3 py-2.5">
              <span className="mt-0.5">{statusIcon(c.status)}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white/90">
                  <span className="text-white/40 mr-1">{c.code}.</span>
                  {c.label}
                </div>
                <div className="text-xs text-white/65 leading-relaxed mt-0.5">{c.message}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 競合 */}
      <div>
        <div className="text-[10px] tracking-[0.2em] text-neon-cyan mb-2">
          競合企業・競合カテゴリー
          {result.competitorCategories.length > 0 && (
            <span className="text-white/40 ml-2">（{result.competitorCategories.join("・")}）</span>
          )}
        </div>
        {result.competitors.length === 0 ? (
          <p className="text-xs text-white/50">競合は検出されませんでした。</p>
        ) : (
          <ul className="space-y-2">
            {result.competitors.map((co, i) => (
              <CompetitorRow
                key={co.companyId}
                comp={co}
                editable={!!onCompetitorsChange}
                onChange={(next) => {
                  if (!onCompetitorsChange) return;
                  const arr = [...result.competitors];
                  arr[i] = next;
                  onCompetitorsChange(arr);
                }}
              />
            ))}
          </ul>
        )}
      </div>

      {/* 独占権 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <InfoBox title="独占権の有無">
          {result.exclusivity.requested ? (
            <>希望：あり{result.exclusivity.scope ? `（${result.exclusivity.scope}）` : ""}</>
          ) : (
            "希望：なし"
          )}
          {result.exclusivity.conflicts.length > 0 && (
            <ul className="mt-1.5 space-y-1">
              {result.exclusivity.conflicts.map((x) => (
                <li key={x} className="text-rose-300/90">・{x}</li>
              ))}
            </ul>
          )}
        </InfoBox>
        <InfoBox title="大会規定上の注意">
          {result.tournamentNotes.length === 0 ? (
            "特記事項なし"
          ) : (
            <ul className="space-y-1">
              {result.tournamentNotes.map((x) => (
                <li key={x}>・{x}</li>
              ))}
            </ul>
          )}
        </InfoBox>
        <InfoBox title="不足している資料">
          {result.missingDocs.length === 0 ? (
            "なし"
          ) : (
            <ul className="space-y-1">
              {result.missingDocs.map((x) => (
                <li key={x} className="text-yellow-300/90">・{x}</li>
              ))}
            </ul>
          )}
        </InfoBox>
        <InfoBox title="契約前に確認すべきこと">
          {result.preContractChecks.length === 0 ? (
            "なし"
          ) : (
            <ul className="space-y-1">
              {result.preContractChecks.map((x) => (
                <li key={x}>・{x}</li>
              ))}
            </ul>
          )}
        </InfoBox>
      </div>

      {/* 推奨する次の対応 */}
      <div className="rounded-xl border border-neon-cyan/25 bg-neon-cyan/[0.04] p-4">
        <div className="text-[10px] tracking-[0.2em] text-neon-cyan mb-2">推奨する次の対応</div>
        <ul className="space-y-1.5">
          {result.recommendedActions.map((x) => (
            <li key={x} className="text-sm text-white/85 flex items-start gap-2">
              <span className="text-neon-cyan mt-0.5">→</span>
              {x}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompetitorRow({
  comp,
  editable,
  onChange,
}: {
  comp: CompetitorMatch & { manualDecision?: string; manualReason?: string };
  editable: boolean;
  onChange: (next: CompetitorMatch) => void;
}) {
  const [reason, setReason] = useState(comp.manualReason ?? "");
  const sevColor =
    comp.severity === "conflict"
      ? "border-rose-400/40 text-rose-300"
      : comp.severity === "likely"
        ? "border-orange-400/40 text-orange-300"
        : "border-yellow-300/40 text-yellow-300";

  return (
    <li className="rounded-lg border border-white/10 bg-awa-indigo-950/30 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-white/90">{comp.companyName}</span>
        <span className={`text-[10px] rounded-full border px-2 py-0.5 ${sevColor}`}>{severityLabel[comp.severity]}</span>
      </div>
      <div className="text-xs text-white/60 mt-1">{comp.reason}</div>
      {comp.overlap.length > 0 && (
        <div className="text-[11px] text-white/45 mt-1">重複：{comp.overlap.join(" / ")}</div>
      )}
      {editable && (
        <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "competes", l: "競合する" },
              { v: "not_competes", l: "競合しない" },
              { v: "conditional", l: "条件付きで許可" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() =>
                  onChange({ ...comp, manualDecision: o.v, manualReason: reason } as CompetitorMatch)
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  (comp as { manualDecision?: string }).manualDecision === o.v
                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/15 text-white/55 hover:border-white/40"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
          <input
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              onChange({ ...comp, manualReason: e.target.value } as CompetitorMatch);
            }}
            placeholder="手動判定の理由（記録されます）"
            className="w-full rounded-md border border-white/15 bg-awa-indigo-950/60 px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/25"
          />
        </div>
      )}
    </li>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-awa-indigo-950/30 p-3.5">
      <div className="text-[10px] tracking-[0.2em] text-white/55 mb-1.5">{title}</div>
      <div className="text-xs text-white/80 leading-relaxed">{children}</div>
    </div>
  );
}
