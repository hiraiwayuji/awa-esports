"use client";

import { useMemo, useState } from "react";
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

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: awaSupabaseHeaders(),
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as T;
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

  // 運営モード（投稿・削除）
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const adminMode = adminOpen && adminPass.trim().length > 0;

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
  const [attendance, setAttendance] = useState<Record<string, string[]>>({});

  function updateMyName(v: string) {
    setMyName(v);
    if (typeof window !== "undefined") localStorage.setItem("awa_board_name", v);
  }

  async function loadAttendance(pass: string) {
    try {
      const rows = await rpc<{ post_id: string; name: string }[]>(
        "attend_all",
        { member_pass: pass },
      );
      const map: Record<string, string[]> = {};
      for (const r of rows) (map[r.post_id] ??= []).push(r.name);
      setAttendance(map);
    } catch {
      /* noop */
    }
  }

  async function joinEvent(postId: string) {
    const nm = myName.trim();
    if (!nm) {
      window.alert("先に「あなたのニックネーム」を入力してください。");
      return;
    }
    try {
      await rpc("attend_join", {
        member_pass: memberPass.trim(),
        p_post_id: postId,
        p_name: nm,
      });
      await loadAttendance(memberPass.trim());
    } catch {
      window.alert("参加の登録に失敗しました。");
    }
  }

  async function cancelEvent(postId: string) {
    const nm = myName.trim();
    if (!nm) return;
    try {
      await rpc("attend_cancel", {
        member_pass: memberPass.trim(),
        p_post_id: postId,
        p_name: nm,
      });
      await loadAttendance(memberPass.trim());
    } catch {
      window.alert("取り消しに失敗しました。");
    }
  }

  async function enter(e?: React.FormEvent) {
    e?.preventDefault();
    if (!memberPass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rpc<Notice[]>("board_list", {
        member_pass: memberPass.trim(),
      });
      setNotices(data);
      await loadAttendance(memberPass.trim());
      setEntered(true);
    } catch {
      setError("合言葉が違うようです。もう一度お試しください。");
    }
    setLoading(false);
  }

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
    return CATEGORIES.map((c) => ({
      ...c,
      items: notices.filter((n) => n.category === c.key),
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
                      {g.items.map((n) => (
                        <div
                          key={n.id}
                          className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5"
                        >
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] tracking-wider rounded-full border px-2 py-0.5 ${g.badge}`}
                              >
                                {CAT_LABEL[n.category]}
                              </span>
                              {n.event_date && (
                                <span className="text-sm font-bold text-awa-glow">
                                  {fmtDate(n.event_date)}
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
                                </div>
                                {myName.trim() &&
                                attendance[n.id]?.includes(myName.trim()) ? (
                                  <button
                                    onClick={() => cancelEvent(n.id)}
                                    className="rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-xs px-4 py-1.5 transition"
                                  >
                                    参加を取り消す
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => joinEvent(n.id)}
                                    className="rounded-full border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 text-awa-glow text-xs font-bold px-5 py-1.5 transition"
                                  >
                                    参加する
                                  </button>
                                )}
                              </div>
                              {attendance[n.id]?.length ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {attendance[n.id].map((nm) => (
                                    <span
                                      key={nm}
                                      className="text-[11px] rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan/90 px-2 py-0.5"
                                    >
                                      {nm}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-2 text-[11px] text-white/40">
                                  まだ参加表明はありません。
                                </p>
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
                      ))}
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
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="運営合言葉"
                      className="grow rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2 text-sm focus:outline-none focus:border-awa-glow/60 transition"
                    />
                    <button
                      onClick={() => {
                        setAdminOpen(false);
                        setAdminPass("");
                      }}
                      className="text-xs text-white/40 hover:text-white/70 transition"
                    >
                      閉じる
                    </button>
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
