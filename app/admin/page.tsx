"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, string> & { _rowIndex: number };
type SheetName = "trainee" | "player_contract";

const TAB_LABEL: Record<SheetName, string> = {
  trainee: "練習生",
  player_contract: "正式選手",
};

const STATUS_OPTIONS = [
  "申請中",
  "承認済み",
  "保留",
  "退会",
  "契約解除",
] as const;

const STATUS_COLOR: Record<string, string> = {
  申請中: "border-yellow-300/60 text-yellow-300",
  承認済み: "border-emerald-300/60 text-emerald-300",
  保留: "border-sky-300/60 text-sky-300",
  退会: "border-white/30 text-white/50",
  契約解除: "border-rose-300/60 text-rose-300",
};

export default function AdminPage() {
  const [tab, setTab] = useState<SheetName>("trainee");
  const [rowsByTab, setRowsByTab] = useState<Record<SheetName, Row[] | null>>({
    trainee: null,
    player_contract: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  async function fetchTab(name: SheetName) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sheets/${name}`, { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; rows?: Row[]; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "fetch_failed");
        setLoading(false);
        return;
      }
      setRowsByTab((prev) => ({ ...prev, [name]: json.rows ?? [] }));
    } catch {
      setError("network_error");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (rowsByTab[tab] === null) {
      void fetchTab(tab);
    }
    setOpenIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const rows = rowsByTab[tab];

  const stats = useMemo(() => {
    const t = rowsByTab.trainee ?? [];
    const p = rowsByTab.player_contract ?? [];
    const minorCount = [...t, ...p].filter(
      (r) => Number.parseInt(r["年齢"] ?? "0", 10) < 18,
    ).length;
    const pendingT = t.filter((r) => (r["ステータス"] ?? "申請中") === "申請中").length;
    const pendingP = p.filter((r) => (r["ステータス"] ?? "申請中") === "申請中").length;
    const approvedP = p.filter((r) => r["ステータス"] === "承認済み").length;
    const guardianNeeded = [...t, ...p].filter(
      (r) =>
        Number.parseInt(r["年齢"] ?? "0", 10) < 18 &&
        (r["保護者同意"] ?? "").trim() !== "✅",
    ).length;

    return {
      trainee: t.length,
      contract: p.length,
      pending: pendingT + pendingP,
      minor: minorCount,
      approvedContract: approvedP,
      guardianNeeded,
    };
  }, [rowsByTab]);

  return (
    <main className="min-h-screen bg-awa-indigo-950 text-white px-5 md:px-8 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="text-[10px] font-display tracking-[0.4em] text-neon-cyan">
            ADMIN / 管理画面
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black mt-1">
            AWAKEN GLOW REGISTRATION DASHBOARD
          </h1>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard label="練習生申請数" value={stats.trainee} />
          <StatCard label="正式選手登録数" value={stats.contract} />
          <StatCard label="未確認 (申請中)" value={stats.pending} accent="yellow" />
          <StatCard label="未成年者数" value={stats.minor} />
          <StatCard label="契約同意済み" value={stats.approvedContract} accent="emerald" />
          <StatCard
            label="保護者同意が必要"
            value={stats.guardianNeeded}
            accent={stats.guardianNeeded > 0 ? "rose" : undefined}
          />
        </section>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(Object.keys(TAB_LABEL) as SheetName[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-lg border text-xs tracking-[0.2em] font-display transition ${
                tab === k
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/15 text-white/60 hover:border-white/40"
              }`}
            >
              {TAB_LABEL[k]}（{rowsByTab[k]?.length ?? "—"}）
            </button>
          ))}
          <button
            onClick={() => fetchTab(tab)}
            className="ml-auto px-3 py-2 rounded-lg border border-white/15 text-xs text-white/60 hover:border-white/40 hover:text-white transition"
          >
            ↻ 再読み込み
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-300/40 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm mb-4">
            読み込みエラー：{error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/40 overflow-hidden">
          {loading && rows === null ? (
            <div className="p-8 text-center text-white/50 text-sm">読み込み中…</div>
          ) : rows && rows.length === 0 ? (
            <div className="p-8 text-center text-white/50 text-sm">
              まだ申請がありません。
            </div>
          ) : rows ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] tracking-[0.2em] text-white/50 border-b border-white/10">
                    <Th>プレイヤー名</Th>
                    <Th>本名</Th>
                    <Th>年齢</Th>
                    <Th>Discord</Th>
                    <Th>メール</Th>
                    <Th>申請日時</Th>
                    <Th>ステータス</Th>
                    <Th>操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const age = Number.parseInt(r["年齢"] ?? "0", 10);
                    const isMinor = age < 18;
                    const status = r["ステータス"] || "申請中";
                    const opened = openIndex === r._rowIndex;
                    return (
                      <Row
                        key={r._rowIndex}
                        row={r}
                        sheetName={tab}
                        opened={opened}
                        onToggle={() =>
                          setOpenIndex(opened ? null : r._rowIndex)
                        }
                        onUpdated={() => fetchTab(tab)}
                        isMinor={isMinor}
                        status={status}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <footer className="mt-8 text-[11px] text-white/30 text-center">
          AWAKEN GLOW 管理画面 v1.0 · Basic 認証で保護されています
        </footer>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-3 font-normal whitespace-nowrap">
      {children}
    </th>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "yellow" | "emerald" | "rose";
}) {
  const accentClass =
    accent === "yellow"
      ? "text-yellow-300"
      : accent === "emerald"
        ? "text-emerald-300"
        : accent === "rose"
          ? "text-rose-300"
          : "text-neon-cyan";
  return (
    <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4">
      <div className="text-[10px] tracking-[0.2em] text-white/50">{label}</div>
      <div className={`text-3xl font-display font-black mt-1 ${accentClass}`}>
        {value}
      </div>
    </div>
  );
}

function Row({
  row,
  sheetName,
  opened,
  onToggle,
  onUpdated,
  isMinor,
  status,
}: {
  row: Row;
  sheetName: SheetName;
  opened: boolean;
  onToggle: () => void;
  onUpdated: () => void;
  isMinor: boolean;
  status: string;
}) {
  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-3 py-3 font-bold whitespace-nowrap">
          {row["プレイヤー名"] || "—"}
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {row["本名"] || "—"}
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {row["年齢"] || "—"}
          {isMinor && (
            <span className="ml-1 text-[10px] text-awa-glow">(未)</span>
          )}
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-white/70">
          {row["Discord ID"] || "—"}
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-white/70 max-w-[200px] truncate">
          {row["メール"] || "—"}
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-[11px] text-white/50">
          {row["申請日時"] || "—"}
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          <span
            className={`inline-block rounded-full border text-[11px] px-2 py-0.5 ${
              STATUS_COLOR[status] ?? "border-white/30 text-white/60"
            }`}
          >
            {status}
          </span>
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-neon-cyan text-[11px]">
          {opened ? "閉じる ▲" : "詳細 ▾"}
        </td>
      </tr>
      {opened && (
        <tr className="bg-awa-indigo-950/60">
          <td colSpan={8} className="px-5 py-5">
            <DetailPanel
              row={row}
              sheetName={sheetName}
              onUpdated={onUpdated}
              isMinor={isMinor}
              currentStatus={status}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function DetailPanel({
  row,
  sheetName,
  onUpdated,
  isMinor,
  currentStatus,
}: {
  row: Row;
  sheetName: SheetName;
  onUpdated: () => void;
  isMinor: boolean;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [memo, setMemo] = useState(row["管理者メモ"] || "");
  const [pledgeUrl, setPledgeUrl] = useState(
    row["誓約書/契約書URL"] || "",
  );
  const [discordUrl, setDiscordUrl] = useState(
    row["Discord メッセージURL"] || "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(
        `/api/admin/sheets/${sheetName}/${row._rowIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ステータス: status,
            管理者メモ: memo,
            "誓約書/契約書URL": pledgeUrl,
            "Discord メッセージURL": discordUrl,
          }),
        },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "update_failed");
      } else {
        setSaved(true);
        onUpdated();
      }
    } catch {
      setError("network_error");
    }
    setSaving(false);
  }

  // 表示する全フィールド（操作系を除く）
  const hidden = new Set([
    "_rowIndex",
    "ステータス",
    "管理者メモ",
    "誓約書/契約書URL",
    "Discord メッセージURL",
  ]);

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4">
        <div className="text-[10px] tracking-[0.25em] text-neon-cyan mb-3">
          DETAIL / 詳細情報
        </div>
        <dl className="grid grid-cols-1 gap-2 text-[13px]">
          {Object.entries(row)
            .filter(([k]) => !hidden.has(k))
            .map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[140px_1fr] gap-3 border-b border-white/5 pb-1.5"
              >
                <dt className="text-white/50 text-[11px]">{k}</dt>
                <dd className="text-white/85 whitespace-pre-wrap break-all">
                  {v || "—"}
                </dd>
              </div>
            ))}
        </dl>
      </div>

      <div className="rounded-xl border border-neon-cyan/30 bg-awa-indigo-900/40 p-4 space-y-4 self-start">
        <div className="text-[10px] tracking-[0.25em] text-neon-cyan">
          ADMIN ACTIONS / 管理者操作
        </div>

        {isMinor && (
          <div className="rounded-lg border border-awa-glow/40 bg-awa-glow/[0.05] px-3 py-2 text-[11px] text-awa-glow">
            未成年者です。保護者同意：
            {row["保護者同意"] === "✅" ? "取得済み" : "未取得"}
          </div>
        )}

        <FieldBlock label="ステータス">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FieldBlock>

        <FieldBlock label="管理者メモ">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white resize-y"
          />
        </FieldBlock>

        <FieldBlock label="誓約書 / 契約書URL（Google Drive 等）">
          <input
            value={pledgeUrl}
            onChange={(e) => setPledgeUrl(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white"
          />
        </FieldBlock>

        <FieldBlock label="Discord メッセージURL">
          <input
            value={discordUrl}
            onChange={(e) => setDiscordUrl(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white"
          />
        </FieldBlock>

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-lg border border-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 disabled:opacity-50 text-neon-cyan font-display tracking-[0.25em] text-sm py-2.5 transition"
        >
          {saving ? "保存中…" : "変更を保存"}
        </button>

        {saved && (
          <p className="text-xs text-emerald-300">保存しました。</p>
        )}
        {error && <p className="text-xs text-rose-300">エラー：{error}</p>}
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.2em] text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}
