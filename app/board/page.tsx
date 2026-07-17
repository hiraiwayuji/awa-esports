"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

type Notice = {
  id: string;
  created_at: string;
  category: "practice" | "tournament" | "supplies" | "other";
  title: string;
  body: string;
  event_date: string | null;
};

const CATEGORIES: {
  key: Notice["category"];
  label: string;
  badge: string;
}[] = [
  { key: "practice", label: "練習日程", badge: "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" },
  { key: "tournament", label: "大会予定", badge: "border-awa-glow/50 text-awa-glow bg-awa-glow/10" },
  { key: "supplies", label: "準備物・持ち物", badge: "border-amber-300/50 text-amber-200 bg-amber-300/10" },
  { key: "other", label: "その他連絡", badge: "border-white/30 text-white/70 bg-white/5" },
];

const CAT_LABEL: Record<Notice["category"], string> = {
  practice: "練習日程",
  tournament: "大会予定",
  supplies: "準備物・持ち物",
  other: "その他連絡",
};

/** 練習会は2部制。どの枠で参加するかを選んでもらう。 */
type AttendPart = "1" | "2" | "both";

/** 出欠1件。part が null の行は、2部制になる前の古い参加表明。 */
type AttendEntry = { name: string; part: AttendPart | null };

const PART_LABEL: Record<
  AttendPart,
  { short: string; time: string; badge: string }
> = {
  "1": {
    short: "第1部",
    time: "10:00〜14:00",
    badge: "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan",
  },
  "2": {
    short: "第2部",
    time: "14:00〜18:00",
    badge: "border-awa-glow/40 bg-awa-glow/10 text-awa-glow",
  },
  both: {
    short: "両方",
    time: "10:00〜18:00",
    badge: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  },
};

const PART_ORDER: AttendPart[] = ["1", "2", "both"];

/**
 * 内訳表示（例: 第1部2・第2部1・両方3）。
 * 2部制になる前の「部未選択」が居るときだけ、その数も足して
 * 「参加◯人」と内訳の合計が食い違って見えないようにする。
 */
function partBreakdown(entries: AttendEntry[]): string {
  const parts = PART_ORDER.map(
    (pt) => `${PART_LABEL[pt].short}${entries.filter((a) => a.part === pt).length}`,
  );
  const unset = entries.filter((a) => !a.part).length;
  if (unset > 0) parts.push(`部未選択${unset}`);
  return parts.join("・");
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: awaSupabaseHeaders(),
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(String(res.status));
  // 204 No Content（参加/取消/削除など）は本文が空なので JSON.parse しない
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

function fmtDate(d: string | null): string {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  const w = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${dt.getMonth() + 1}/${dt.getDate()}（${w}）`;
}

export default function BoardPage() {
  const [memberPass, setMemberPass] = useState("");
  const [entered, setEntered] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 運営モード（投稿・削除）— 合言葉はサーバーで検証してから有効化する
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const adminMode = adminOpen && adminVerified;

  async function verifyAdmin() {
    const p = adminPass.trim();
    if (!p || verifying) return;
    setVerifying(true);
    setAdminError(null);
    try {
      const ok = await rpc<boolean>("verify_admin", { pass: p });
      if (ok) {
        setAdminVerified(true);
      } else {
        setAdminVerified(false);
        setAdminError("運営合言葉が違います。");
      }
    } catch {
      setAdminVerified(false);
      setAdminError("確認に失敗しました。通信環境をご確認ください。");
    }
    setVerifying(false);
  }

  // 投稿フォーム
  const [category, setCategory] = useState<Notice["category"]>("practice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [posting, setPosting] = useState(false);

  // 出欠（参加表明）
  const [myName, setMyName] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("awa_board_name") || ""
      : "",
  );
  const [attendance, setAttendance] = useState<Record<string, AttendEntry[]>>({});
  const [proxyName, setProxyName] = useState<Record<string, string>>({});
  const [proxyPart, setProxyPart] = useState<Record<string, AttendPart>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [attendMsg, setAttendMsg] = useState<{
    id: string;
    text: string;
    ok: boolean;
  } | null>(null);

  function updateMyName(v: string) {
    setMyName(v);
    if (typeof window !== "undefined") localStorage.setItem("awa_board_name", v);
  }

  async function loadAttendance(pass: string) {
    try {
      const rows = await rpc<
        { post_id: string; name: string; part: AttendPart | null }[]
      >("attend_all", { member_pass: pass });
      const map: Record<string, AttendEntry[]> = {};
      for (const r of rows)
        (map[r.post_id] ??= []).push({ name: r.name, part: r.part });
      setAttendance(map);
    } catch {
      /* noop */
    }
  }

  async function joinEvent(postId: string, part: AttendPart) {
    const nm = myName.trim();
    if (!nm) return;
    setBusyId(postId);
    setAttendMsg(null);
    try {
      await rpc("attend_join", {
        member_pass: memberPass.trim(),
        p_post_id: postId,
        p_name: nm,
        p_part: part,
      });
      await loadAttendance(memberPass.trim());
      setAttendMsg({
        id: postId,
        text: `${PART_LABEL[part].short}で参加登録しました！`,
        ok: true,
      });
    } catch {
      setAttendMsg({
        id: postId,
        text: "登録できませんでした。通信環境を確認して、もう一度お試しください。",
        ok: false,
      });
    }
    setBusyId(null);
  }

  async function cancelEvent(postId: string) {
    const nm = myName.trim();
    if (!nm) return;
    setBusyId(postId);
    setAttendMsg(null);
    try {
      await rpc("attend_cancel", {
        member_pass: memberPass.trim(),
        p_post_id: postId,
        p_name: nm,
      });
      await loadAttendance(memberPass.trim());
      setAttendMsg({ id: postId, text: "参加を取り消しました。", ok: true });
    } catch {
      setAttendMsg({
        id: postId,
        text: "取り消しできませんでした。もう一度お試しください。",
        ok: false,
      });
    }
    setBusyId(null);
  }

  // 運営が他のメンバーを代理で参加追加
  async function proxyAdd(postId: string) {
    const nm = (proxyName[postId] ?? "").trim();
    if (!nm) return;
    const part = proxyPart[postId] ?? "both";
    setBusyId(postId);
    setAttendMsg(null);
    try {
      await rpc("attend_join", {
        member_pass: memberPass.trim(),
        p_post_id: postId,
        p_name: nm,
        p_part: part,
      });
      await loadAttendance(memberPass.trim());
      setProxyName((p) => ({ ...p, [postId]: "" }));
      setAttendMsg({
        id: postId,
        text: `「${nm}」を${PART_LABEL[part].short}で追加しました`,
        ok: true,
      });
    } catch {
      setAttendMsg({
        id: postId,
        text: "追加できませんでした。もう一度お試しください。",
        ok: false,
      });
    }
    setBusyId(null);
  }

  // 運営が参加者を取り消す（間違い修正用）
  async function proxyRemove(postId: string, name: string) {
    if (!window.confirm(`「${name}」の参加を取り消します。よろしいですか？`))
      return;
    try {
      await rpc("attend_cancel", {
        member_pass: memberPass.trim(),
        p_post_id: postId,
        p_name: name,
      });
      await loadAttendance(memberPass.trim());
    } catch {
      window.alert("取り消しできませんでした。");
    }
  }

  async function enter(e?: React.FormEvent, passArg?: string) {
    e?.preventDefault();
    const p = (passArg ?? memberPass).trim();
    if (!p) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rpc<Notice[]>("board_list", { member_pass: p });
      setNotices(data);
      await loadAttendance(p);
      if (typeof window !== "undefined")
        sessionStorage.setItem("awa_member_pass", p);
      setEntered(true);
    } catch {
      setError("合言葉が違うようです。もう一度お試しください。");
    }
    setLoading(false);
  }

  // メンバールームで入れた合言葉を引き継いで自動入室
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? sessionStorage.getItem("awa_member_pass")
        : null;
    if (saved) {
      setMemberPass(saved);
      enter(undefined, saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    try {
      const data = await rpc<Notice[]>("board_list", {
        member_pass: memberPass.trim(),
      });
      setNotices(data);
      await loadAttendance(memberPass.trim());
    } catch {
      /* noop */
    }
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || posting) return;
    setPosting(true);
    try {
      await rpc("board_post", {
        admin_pass: adminPass.trim(),
        p_category: category,
        p_title: title.trim(),
        p_body: body.trim(),
        p_event_date: eventDate || null,
      });
      setTitle("");
      setBody("");
      setEventDate("");
      await refresh();
    } catch {
      window.alert(
        "投稿に失敗しました。運営合言葉・件名（必須）をご確認ください。",
      );
    }
    setPosting(false);
  }

  async function removeNotice(id: string) {
    if (!window.confirm("この連絡を削除します。よろしいですか？")) return;
    try {
      await rpc("board_delete", {
        admin_pass: adminPass.trim(),
        target_id: id,
      });
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch {
      window.alert("削除できませんでした（運営合言葉をご確認ください）。");
    }
  }

  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const decorate = (items: Notice[]) =>
      items
        .map((n) => {
          const ed = n.event_date
            ? new Date(n.event_date + "T00:00:00")
            : null;
          return {
            ...n,
            isPast: ed ? ed.getTime() < today.getTime() : false,
            _ed: ed,
          };
        })
        .sort((a, b) => {
          // これから（未来・日付なし）を上、終了を下
          if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
          if (a._ed && b._ed) {
            // これから＝近い順（昇順）／終了＝最近終わった順
            return a.isPast
              ? b._ed.getTime() - a._ed.getTime()
              : a._ed.getTime() - b._ed.getTime();
          }
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
    return CATEGORIES.map((c) => ({
      ...c,
      items: decorate(notices.filter((n) => n.category === c.key)),
    })).filter((g) => g.items.length > 0);
  }, [notices]);

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[15vw] md:text-[11vw] lg:text-[8rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            MEMBERS BOARD
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="MEMBERS ONLY / メンバー連絡板"
              title="MEMBERS BOARD"
              subtitle="練習日程・大会予定・準備物などの連絡を確認できます。"
            />
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          {!entered ? (
            /* 合言葉ゲート */
            <form
              onSubmit={enter}
              className="rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-4"
            >
              <p className="text-sm text-white/80 leading-relaxed">
                ここは
                <span className="text-white">メンバー専用</span>
                の連絡板です。合言葉を入れて確認してください。
              </p>
              <input
                type="password"
                value={memberPass}
                onChange={(e) => setMemberPass(e.target.value)}
                placeholder="メンバー合言葉"
                className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
              />
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={loading || !memberPass.trim()}
                className="w-full rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition"
              >
                {loading ? "確認中…" : "確認する"}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-awa-glow/80">
                  ※ 連絡はDiscordでも行います。ここは確認用です。
                </p>
                <button
                  onClick={refresh}
                  className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition shrink-0"
                >
                  最新に更新
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/resources"
                  className="block rounded-xl border border-neon-cyan/30 bg-awa-indigo-900/40 px-4 py-3 text-sm text-white/85 hover:border-neon-cyan/60 transition"
                >
                  📁 議事録・資料はこちら →
                </Link>
                <Link
                  href="/ledger"
                  className="block rounded-xl border border-neon-cyan/30 bg-awa-indigo-900/40 px-4 py-3 text-sm text-white/85 hover:border-neon-cyan/60 transition"
                >
                  💰 経理（会計）はこちら →
                </Link>
              </div>

              {/* あなたのニックネーム（出欠用） */}
              <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4 flex flex-wrap items-center gap-3">
                <span className="text-xs text-white/70 shrink-0">
                  あなたのニックネーム
                </span>
                <input
                  type="text"
                  value={myName}
                  onChange={(e) => updateMyName(e.target.value)}
                  placeholder="例：たろう"
                  maxLength={40}
                  className="grow min-w-[140px] rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition"
                />
                <span className="text-[11px] text-white/40 w-full md:w-auto">
                  ※「参加する」を押すと、この名前で参加表明されます
                </span>
              </div>

              {/* 運営の投稿フォーム */}
              {adminMode && (
                <form
                  onSubmit={submitPost}
                  className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.04] p-5 md:p-6 space-y-4"
                >
                  <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">
                    NEW NOTICE / 連絡を追加（運営）
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-[0.15em] text-white/70">
                        種別
                      </span>
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as Notice["category"])
                        }
                        className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-[0.15em] text-white/70">
                        予定日（任意）
                      </span>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="件名（例：今週の練習／○○大会エントリー）"
                    maxLength={120}
                    className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition"
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="詳細（時間・場所・持ち物・注意点など）"
                    rows={3}
                    maxLength={4000}
                    className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={posting || !title.trim()}
                      className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm px-6 py-2.5 transition"
                    >
                      {posting ? "追加中…" : "連絡を追加"}
                    </button>
                  </div>
                </form>
              )}

              {/* 連絡一覧（種別ごと） */}
              {notices.length === 0 ? (
                <p className="text-white/50 text-sm">
                  まだ連絡はありません。
                </p>
              ) : (
                <div className="space-y-8">
                  {grouped.map((g) => (
                    <div key={g.key} className="space-y-3">
                      <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">
                        {g.label}
                      </h3>
                      {g.items.map((n) => {
                        // 自分の参加状況（名前一致）。未参加なら undefined。
                        const myEntry = myName.trim()
                          ? (attendance[n.id] ?? []).find(
                              (a) => a.name === myName.trim(),
                            )
                          : undefined;
                        const myPart = myEntry?.part ?? null;
                        // 枠を出すのは「これからの練習会」だけ。
                        // 大会・対戦会は1枠だし、終わった回に枠を出しても意味がない
                        // （2部制より前の回は全員が「部未選択」になってしまう）。
                        const isTwoPart = n.category === "practice" && !n.isPast;
                        return (
                        <div
                          key={n.id}
                          className={`rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5 transition ${
                            n.isPast ? "opacity-45" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] tracking-wider rounded-full border px-2 py-0.5 ${g.badge}`}
                              >
                                {CAT_LABEL[n.category]}
                              </span>
                              {n.event_date && (
                                <span
                                  className={`text-sm font-bold ${n.isPast ? "text-white/50 line-through" : "text-awa-glow"}`}
                                >
                                  {fmtDate(n.event_date)}
                                </span>
                              )}
                              {n.isPast && (
                                <span className="text-[10px] rounded-full border border-white/20 text-white/50 px-2 py-0.5">
                                  終了
                                </span>
                              )}
                            </div>
                            <span className="text-white/35 text-[11px] shrink-0">
                              {new Date(n.created_at).toLocaleDateString(
                                "ja-JP",
                              )}
                            </span>
                          </div>
                          <p className="text-white font-bold text-[15px] mb-1">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                              {n.body}
                            </p>
                          )}

                          {/* 出欠（予定日のある連絡のみ） */}
                          {n.event_date && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="text-xs text-white/70">
                                  参加：
                                  <span className="text-awa-glow font-bold mx-1">
                                    {attendance[n.id]?.length ?? 0}
                                  </span>
                                  人
                                  {isTwoPart &&
                                    (attendance[n.id]?.length ?? 0) > 0 && (
                                      <span className="text-white/45 ml-1.5">
                                        （{partBreakdown(attendance[n.id] ?? [])}）
                                      </span>
                                    )}
                                </div>
                                {n.isPast && (
                                  <span className="text-[11px] text-white/40">
                                    受付終了
                                  </span>
                                )}
                              </div>

                              {/* 参加の枠を選ぶ（練習会は2部制） */}
                              {!n.isPast && (
                                <div className="mt-2.5">
                                  {!myName.trim() ? (
                                    <p className="text-[11px] text-awa-glow/70">
                                      ← 先に上で名前を入れてね
                                    </p>
                                  ) : isTwoPart ? (
                                    /* 練習会は2部制なので、参加する枠を選んでもらう */
                                    <>
                                      <div className="flex flex-wrap gap-2">
                                        {PART_ORDER.map((pt) => {
                                          const active = myPart === pt;
                                          return (
                                            <button
                                              key={pt}
                                              onClick={() => joinEvent(n.id, pt)}
                                              disabled={busyId === n.id}
                                              className={`rounded-full border text-xs font-bold px-4 py-1.5 transition disabled:opacity-40 ${
                                                active
                                                  ? PART_LABEL[pt].badge
                                                  : "border-white/20 text-white/65 hover:border-white/45 hover:text-white"
                                              }`}
                                            >
                                              {PART_LABEL[pt].short}
                                              <span className="ml-1.5 font-normal opacity-70">
                                                {PART_LABEL[pt].time}
                                              </span>
                                              {active && " ✓"}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      {myEntry ? (
                                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                                          <span className="text-[11px] text-white/55">
                                            {myPart
                                              ? `${PART_LABEL[myPart].short}で参加予定。押し直せば変更できます。`
                                              : "参加予定（部は未選択）。上から選べます。"}
                                          </span>
                                          <button
                                            onClick={() => cancelEvent(n.id)}
                                            disabled={busyId === n.id}
                                            className="rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-40 text-[11px] px-3 py-1 transition"
                                          >
                                            {busyId === n.id
                                              ? "処理中…"
                                              : "参加を取り消す"}
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="mt-2 text-[11px] text-white/45">
                                          参加する枠を押してください。
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    /* 練習会以外（大会・対戦会など）は1枠なので、参加するかどうかだけ */
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {myEntry ? (
                                        <>
                                          <span className="text-[11px] text-white/55">
                                            参加予定です。
                                          </span>
                                          <button
                                            onClick={() => cancelEvent(n.id)}
                                            disabled={busyId === n.id}
                                            className="rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-40 text-[11px] px-3 py-1 transition"
                                          >
                                            {busyId === n.id
                                              ? "処理中…"
                                              : "参加を取り消す"}
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => joinEvent(n.id, "both")}
                                          disabled={busyId === n.id}
                                          className="rounded-full border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow text-xs font-bold px-5 py-1.5 transition"
                                        >
                                          {busyId === n.id ? "登録中…" : "参加する"}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {attendMsg?.id === n.id && (
                                <p
                                  className={`mt-2 text-[11px] ${attendMsg.ok ? "text-awa-glow" : "text-rose-300"}`}
                                >
                                  {attendMsg.text}
                                </p>
                              )}
                              {attendance[n.id]?.length ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {attendance[n.id].map((a) => (
                                    <span
                                      key={a.name}
                                      className={`text-[11px] rounded-full border px-2 py-0.5 inline-flex items-center gap-1 ${
                                        isTwoPart && a.part
                                          ? PART_LABEL[a.part].badge
                                          : "border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan/90"
                                      }`}
                                    >
                                      {a.name}
                                      {/* 枠の表示は2部制（練習会）のときだけ */}
                                      {isTwoPart && (
                                        <span className="opacity-70">
                                          / {a.part ? PART_LABEL[a.part].short : "部未選択"}
                                        </span>
                                      )}
                                      {adminMode && (
                                        <button
                                          onClick={() => proxyRemove(n.id, a.name)}
                                          aria-label={`${a.name} を取り消す`}
                                          className="text-rose-300/70 hover:text-rose-300 leading-none font-bold"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-2 text-[11px] text-white/40">
                                  まだ参加表明はありません。
                                </p>
                              )}

                              {/* 運営：代理で参加追加 */}
                              {adminMode && !n.isPast && (
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={proxyName[n.id] ?? ""}
                                      onChange={(e) =>
                                        setProxyName((p) => ({
                                          ...p,
                                          [n.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="メンバー名を入れて代理で追加"
                                      maxLength={40}
                                      className="grow rounded-lg border border-awa-glow/30 bg-awa-indigo-950/60 text-white px-3 py-2 text-xs placeholder-white/30 focus:outline-none focus:border-awa-glow transition"
                                    />
                                    <button
                                      onClick={() => proxyAdd(n.id)}
                                      disabled={
                                        busyId === n.id ||
                                        !(proxyName[n.id] ?? "").trim()
                                      }
                                      className="rounded-lg border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow text-xs font-bold px-4 py-2 transition shrink-0"
                                    >
                                      追加
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {PART_ORDER.map((pt) => {
                                      const active =
                                        (proxyPart[n.id] ?? "both") === pt;
                                      return (
                                        <button
                                          key={pt}
                                          type="button"
                                          onClick={() =>
                                            setProxyPart((p) => ({
                                              ...p,
                                              [n.id]: pt,
                                            }))
                                          }
                                          className={`rounded-full border text-[11px] px-3 py-1 transition ${
                                            active
                                              ? PART_LABEL[pt].badge
                                              : "border-white/20 text-white/55 hover:border-white/40"
                                          }`}
                                        >
                                          {PART_LABEL[pt].short}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {adminMode && (
                            <div className="mt-3 text-right">
                              <button
                                onClick={() => removeNotice(n.id)}
                                className="text-xs text-rose-300/70 hover:text-rose-300 transition"
                              >
                                削除
                              </button>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* 運営メニュー */}
              <div className="pt-6 border-t border-white/10">
                {!adminOpen ? (
                  <button
                    onClick={() => setAdminOpen(true)}
                    className="text-xs text-white/30 hover:text-white/60 transition"
                  >
                    運営メニュー（連絡の追加・削除）
                  </button>
                ) : adminVerified ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-awa-glow">✓ 運営モード中</span>
                    <button
                      onClick={() => {
                        setAdminOpen(false);
                        setAdminPass("");
                        setAdminVerified(false);
                        setAdminError(null);
                      }}
                      className="text-xs text-white/40 hover:text-white/70 transition"
                    >
                      運営モードを終了
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="password"
                        value={adminPass}
                        onChange={(e) => {
                          setAdminPass(e.target.value);
                          setAdminVerified(false);
                          setAdminError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") verifyAdmin();
                        }}
                        placeholder="運営合言葉"
                        className="grow rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2 text-sm focus:outline-none focus:border-awa-glow/60 transition"
                      />
                      <button
                        onClick={verifyAdmin}
                        disabled={verifying || !adminPass.trim()}
                        className="rounded-lg border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow text-sm px-5 py-2 transition"
                      >
                        {verifying ? "確認中…" : "確認"}
                      </button>
                      <button
                        onClick={() => {
                          setAdminOpen(false);
                          setAdminPass("");
                          setAdminVerified(false);
                          setAdminError(null);
                        }}
                        className="text-xs text-white/40 hover:text-white/70 transition"
                      >
                        閉じる
                      </button>
                    </div>
                    {adminError && (
                      <p className="text-xs text-rose-300">{adminError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
