"use client";

import { useEffect, useMemo, useState } from "react";
import { AWA_SUPABASE_URL, AWA_SUPABASE_KEY, awaSupabaseHeaders } from "@/lib/awa-supabase";

/* ── 定数 ─────────────────────────────────── */
const MEMBER_PASS = "agmember2026";
const FN = `${AWA_SUPABASE_URL}/functions/v1/member-files`;

/* ── 共通ヘルパー ─────────────────────────── */
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: awaSupabaseHeaders(),
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(String(res.status));
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function fnCall(payload: Record<string, unknown>) {
  const res = await fetch(FN, {
    method: "POST",
    headers: { apikey: AWA_SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

/* ── 型定義 ───────────────────────────────── */
type Tab = "board" | "survey" | "ledger" | "resources";

type BoardPost = {
  id: string; created_at: string;
  category: "practice" | "tournament" | "supplies" | "other";
  title: string; body: string; event_date: string | null;
};
type AttendRow = { post_id: string; name: string };

type SurveyRow = {
  id: string; created_at: string; name: string;
  practice_days: string; practice_wish: string; gachi_days: string;
  ops: string; ops_detail: string; registration: string;
  events: string[]; events_other: string; expectations: string;
};

type LedgerEntry = {
  id: string; created_at: string; entry_date: string;
  kind: "income" | "expense"; item: string; amount: number; memo: string;
  receipt_path: string | null; receipt_name: string | null;
};

type FileRow = {
  id: string; created_at: string;
  category: "minutes" | "doc" | "photo" | "other";
  title: string; file_name: string; file_path: string;
  mime: string; meeting_date: string | null; body: string;
};

/* ── 小部品 ───────────────────────────────── */
const inputCls =
  "rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition";

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`text-[10px] tracking-wider rounded-full border px-2 py-0.5 ${color}`}>
      {children}
    </span>
  );
}

const CAT_BOARD: Record<BoardPost["category"], { label: string; color: string }> = {
  practice:   { label: "練習日程", color: "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" },
  tournament: { label: "大会予定", color: "border-awa-glow/50 text-awa-glow bg-awa-glow/10" },
  supplies:   { label: "準備物",   color: "border-amber-300/50 text-amber-200 bg-amber-300/10" },
  other:      { label: "その他",   color: "border-white/30 text-white/60 bg-white/5" },
};

const TABS: { key: Tab; emoji: string; label: string }[] = [
  { key: "board",     emoji: "📋", label: "連絡板" },
  { key: "survey",    emoji: "📊", label: "アンケート" },
  { key: "ledger",    emoji: "💰", label: "経理" },
  { key: "resources", emoji: "📁", label: "議事録" },
];

/* ═══════════════════════════════════════════
   メインページ
═══════════════════════════════════════════ */
export default function OpsPage() {
  const [passInput, setPassInput] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [tab, setTab] = useState<Tab>("board");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const p = passInput.trim();
    if (!p) return;
    setLogging(true);
    setLoginErr(null);
    try {
      await rpc<SurveyRow[]>("admin_list_awa_survey", { pass: p });
      setAdminPass(p);
    } catch {
      setLoginErr("パスワードが違います。");
    }
    setLogging(false);
  }

  if (!adminPass) {
    return (
      <main className="min-h-screen bg-awa-indigo-950 flex items-center justify-center px-5">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/50 backdrop-blur-md p-8 space-y-5"
        >
          <div>
            <div className="text-[10px] font-display tracking-[0.4em] text-neon-cyan mb-1">
              AWAKEN GLOW
            </div>
            <h1 className="text-xl font-display font-black text-white">運営管理画面</h1>
          </div>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="管理パスワード"
            className={`w-full ${inputCls}`}
          />
          {loginErr && <p className="text-sm text-rose-300">{loginErr}</p>}
          <button
            type="submit"
            disabled={logging || !passInput.trim()}
            className="w-full rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm py-3 transition"
          >
            {logging ? "確認中…" : "ログイン"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-awa-indigo-950 text-white">
      <header className="sticky top-0 z-20 bg-awa-indigo-950/90 backdrop-blur-xl border-b border-white/10 px-5 md:px-8 h-14 flex items-center justify-between">
        <span className="font-display font-black text-sm tracking-[0.2em] text-white">
          AG <span className="text-neon-cyan">OPS</span>
        </span>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display tracking-[0.15em] transition ${
                tab === t.key
                  ? "bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdminPass("")}
          className="text-[11px] text-white/30 hover:text-white/60 transition"
        >
          ログアウト
        </button>
      </header>

      <div className="mx-auto max-w-4xl px-5 md:px-8 py-8">
        {tab === "board"     && <BoardTab adminPass={adminPass} />}
        {tab === "survey"    && <SurveyTab adminPass={adminPass} />}
        {tab === "ledger"    && <LedgerTab adminPass={adminPass} />}
        {tab === "resources" && <ResourcesTab adminPass={adminPass} />}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════
   連絡板タブ
═══════════════════════════════════════════ */
function BoardTab({ adminPass }: { adminPass: string }) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [attend, setAttend] = useState<AttendRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規投稿フォーム
  const [cat, setCat] = useState<BoardPost["category"]>("practice");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 編集
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState<BoardPost["category"]>("practice");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editDate, setEditDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // 代理出欠
  const [proxyName, setProxyName] = useState<Record<string, string>>({});

  async function load() {
    const [p, a] = await Promise.all([
      rpc<BoardPost[]>("board_list", { member_pass: MEMBER_PASS }),
      rpc<AttendRow[]>("attend_all", { member_pass: MEMBER_PASS }),
    ]);
    setPosts(p ?? []);
    setAttend(a ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function addPost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || posting) return;
    setPosting(true);
    setPostMsg(null);
    try {
      const text = await rpc<string | null>("board_post", {
        admin_pass: adminPass, category: cat,
        title: title.trim(), body: body.trim(), event_date: eventDate || null,
      });
      void text;
      setTitle(""); setBody(""); setEventDate("");
      await load();
      setPostMsg({ text: "投稿しました", ok: true });
    } catch {
      setPostMsg({ text: "投稿できませんでした。", ok: false });
    }
    setPosting(false);
  }

  function startEdit(post: BoardPost) {
    setEditingId(post.id);
    setEditCat(post.category);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditDate(post.event_date ?? "");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || savingEdit || !editingId) return;
    setSavingEdit(true);
    try {
      await rpc("board_update", {
        admin_pass: adminPass, target_id: editingId,
        p_category: editCat, p_title: editTitle.trim(),
        p_body: editBody.trim(), p_event_date: editDate || null,
      });
      await load();
      setEditingId(null);
    } catch { /* ignore */ }
    setSavingEdit(false);
  }

  async function deletePost(id: string) {
    if (!window.confirm("この投稿を削除しますか？")) return;
    await rpc("board_delete", { admin_pass: adminPass, id });
    await load();
  }

  async function proxyJoin(postId: string) {
    const name = (proxyName[postId] ?? "").trim();
    if (!name) return;
    await rpc("attend_join", { member_pass: MEMBER_PASS, post_id: postId, name });
    setProxyName((p) => ({ ...p, [postId]: "" }));
    await load();
  }

  async function proxyCancel(postId: string, name: string) {
    await rpc("attend_cancel", { member_pass: MEMBER_PASS, post_id: postId, name });
    await load();
  }

  const attendMap = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const a of attend) {
      if (!m[a.post_id]) m[a.post_id] = [];
      m[a.post_id].push(a.name);
    }
    return m;
  }, [attend]);

  if (loading) return <p className="text-white/50 text-sm">読み込み中…</p>;

  return (
    <div className="space-y-6">
      {/* 投稿フォーム */}
      <form onSubmit={addPost} className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.03] p-5 space-y-3">
        <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">NEW POST / 投稿</div>
        <div className="grid gap-3 md:grid-cols-2">
          <select value={cat} onChange={(e) => setCat(e.target.value as BoardPost["category"])} className={inputCls}>
            {Object.entries(CAT_BOARD).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputCls} />
        </div>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="件名" maxLength={200} className={`w-full ${inputCls}`} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="詳細（任意）" rows={3} maxLength={2000} className={`w-full ${inputCls} resize-y`} />
        {postMsg && <p className={`text-[12px] ${postMsg.ok ? "text-awa-glow" : "text-rose-300"}`}>{postMsg.text}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={posting || !title.trim()} className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-xs px-5 py-2 transition">
            {posting ? "投稿中…" : "投稿する"}
          </button>
        </div>
      </form>

      {/* 投稿一覧 */}
      {posts.length === 0 ? (
        <p className="text-white/50 text-sm">投稿はありません。</p>
      ) : (
        posts.map((post) => {
          const names = attendMap[post.id] ?? [];
          const isEditing = editingId === post.id;
          return (
            <div key={post.id} className="rounded-xl border border-white/10 bg-awa-indigo-950/50 overflow-hidden">
              {isEditing ? (
                <form onSubmit={saveEdit} className="p-4 space-y-3">
                  <div className="text-[11px] font-display tracking-[0.2em] text-awa-glow">EDIT</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select value={editCat} onChange={(e) => setEditCat(e.target.value as BoardPost["category"])} className={inputCls}>
                      {Object.entries(CAT_BOARD).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={inputCls} />
                  </div>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} className={`w-full ${inputCls}`} />
                  <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={3} maxLength={2000} className={`w-full ${inputCls} resize-y`} />
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-white/40 hover:text-white/70 px-4 py-2 transition">キャンセル</button>
                    <button type="submit" disabled={savingEdit || !editTitle.trim()} className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.15em] text-xs px-5 py-2 transition">
                      {savingEdit ? "保存中…" : "保存"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge color={CAT_BOARD[post.category].color}>{CAT_BOARD[post.category].label}</Badge>
                        {post.event_date && <span className="text-xs font-bold text-awa-glow">{post.event_date}</span>}
                      </div>
                      <p className="text-white font-bold text-sm">{post.title}</p>
                      {post.body && <p className="text-white/60 text-xs mt-1 whitespace-pre-wrap">{post.body}</p>}
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => startEdit(post)} className="text-[11px] text-white/40 hover:text-white/70 transition">編集</button>
                      <button onClick={() => deletePost(post.id)} className="text-[11px] text-rose-300/70 hover:text-rose-300 transition">削除</button>
                    </div>
                  </div>
                  {/* 出欠 */}
                  {post.event_date && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {names.length === 0
                          ? <span className="text-[11px] text-white/30">参加者なし</span>
                          : names.map((n) => (
                            <span key={n} className="flex items-center gap-1 text-[11px] bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-full px-2.5 py-0.5">
                              {n}
                              <button onClick={() => proxyCancel(post.id, n)} className="text-neon-cyan/50 hover:text-rose-300 transition ml-0.5">×</button>
                            </span>
                          ))
                        }
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={proxyName[post.id] ?? ""}
                          onChange={(e) => setProxyName((p) => ({ ...p, [post.id]: e.target.value }))}
                          placeholder="名前を入力して追加"
                          className={`grow text-xs ${inputCls} py-1.5`}
                        />
                        <button onClick={() => proxyJoin(post.id)} className="text-xs border border-neon-cyan/50 text-neon-cyan rounded-lg px-3 hover:bg-neon-cyan/10 transition">追加</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   アンケートタブ
═══════════════════════════════════════════ */
const SURVEY_Q: { key: keyof SurveyRow; label: string }[] = [
  { key: "practice_days",  label: "① 練習日を増やしたいか" },
  { key: "gachi_days",     label: "② ガチ練習日を増やしたいか" },
  { key: "ops",            label: "③ 運営に携わりたいか" },
  { key: "registration",   label: "④ 選手登録を希望するか" },
];

function SurveyTab({ adminPass }: { adminPass: string }) {
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rpc<SurveyRow[]>("admin_list_awa_survey", { pass: adminPass })
      .then((d) => { setRows(d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [adminPass]);

  async function remove(id: string) {
    if (!window.confirm("この回答を削除しますか？")) return;
    await rpc("admin_delete_awa_survey", { pass: adminPass, target_id: id });
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function downloadCsv() {
    const headers = ["回答日時","お名前","①練習日","希望","②ガチ練習","③運営","役割","④登録希望","⑤イベント","⑥期待・要望"];
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [new Date(r.created_at).toLocaleString("ja-JP"), r.name || "（無記名）",
       r.practice_days, r.practice_wish, r.gachi_days, r.ops, r.ops_detail,
       r.registration, (r.events ?? []).join(" / "), r.expectations].map(esc).join(",")
    );
    const csv = "﻿" + [headers.map(esc).join(","), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "ag-survey.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const tallies = useMemo(() =>
    SURVEY_Q.map((q) => {
      const counts = new Map<string, number>();
      for (const r of rows) {
        const v = (r[q.key] as string) || "（未回答）";
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      return { label: q.label, items: [...counts.entries()].sort((a, b) => b[1] - a[1]) };
    }), [rows]);

  const eventTally = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) for (const ev of r.events ?? []) counts.set(ev, (counts.get(ev) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  if (loading) return <p className="text-white/50 text-sm">読み込み中…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-white/80 text-sm">
          回答数：<span className="text-awa-glow font-display text-2xl mx-1.5">{rows.length}</span>件
        </p>
        {rows.length > 0 && (
          <button onClick={downloadCsv} className="rounded-lg border border-neon-cyan/60 text-neon-cyan px-4 py-2 text-xs tracking-[0.15em] font-display hover:bg-neon-cyan/10 transition">
            CSVダウンロード
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-white/50 text-sm">まだ回答がありません。</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {tallies.map((t) => (
              <div key={t.label} className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-5">
                <div className="text-xs tracking-[0.15em] text-neon-cyan mb-3">{t.label}</div>
                <div className="space-y-2">
                  {t.items.map(([name, n]) => (
                    <TallyBar key={name} label={name} n={n} total={rows.length} />
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-5 md:col-span-2">
              <div className="text-xs tracking-[0.15em] text-neon-cyan mb-3">⑤ 期待するイベント（複数選択）</div>
              <div className="space-y-2">
                {eventTally.length > 0
                  ? eventTally.map(([name, n]) => <TallyBar key={name} label={name} n={n} total={rows.length} />)
                  : <p className="text-white/50 text-sm">回答なし</p>
                }
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">個別の回答</h3>
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5 text-sm">
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <span className="font-bold text-white">{r.name || "（無記名）"}</span>
                  <span className="text-white/40 text-xs">{new Date(r.created_at).toLocaleString("ja-JP")}</span>
                </div>
                <dl className="grid gap-1.5 text-white/80">
                  <SurveyItem label="① 練習日">{r.practice_days}</SurveyItem>
                  {r.practice_wish && <SurveyItem label="　希望">{r.practice_wish}</SurveyItem>}
                  <SurveyItem label="② ガチ練習">{r.gachi_days}</SurveyItem>
                  <SurveyItem label="③ 運営">{r.ops}</SurveyItem>
                  {r.ops_detail && <SurveyItem label="　役割">{r.ops_detail}</SurveyItem>}
                  <SurveyItem label="④ 選手登録">{r.registration}</SurveyItem>
                  <SurveyItem label="⑤ イベント">{(r.events ?? []).join(" / ") || "—"}</SurveyItem>
                  {r.expectations && <SurveyItem label="⑥ 期待">{r.expectations}</SurveyItem>}
                </dl>
                <div className="text-right mt-3">
                  <button onClick={() => remove(r.id)} className="text-xs text-rose-300/70 hover:text-rose-300 transition">
                    この回答を削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   経理タブ
═══════════════════════════════════════════ */
const yen = (n: number) => `¥${(n ?? 0).toLocaleString("ja-JP")}`;

function LedgerTab({ adminPass }: { adminPass: string }) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規フォーム
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [createReceipt, setCreateReceipt] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 編集
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editKind, setEditKind] = useState<"income" | "expense">("expense");
  const [editItem, setEditItem] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editReceiptFile, setEditReceiptFile] = useState<File | null>(null);
  const [editClear, setEditClear] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  async function load() {
    const d = await rpc<LedgerEntry[]>("ledger_list", { member_pass: adminPass });
    setEntries(d ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function uploadReceipt(entryId: string, file: File) {
    const d = await fnCall({ action: "ledger_receipt_upload", admin_pass: adminPass, entry_id: entryId, file_name: file.name, mime: file.type });
    if (!d.signedUrl) return null;
    const put = await fetch(d.signedUrl as string, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
    if (!put.ok) return null;
    return { storage_path: d.storage_path as string, file_name: d.file_name as string };
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number.parseInt(amount, 10);
    if (!item.trim() || !Number.isFinite(amt) || amt < 0 || saving) return;
    setSaving(true); setMsg(null);
    try {
      const newId = await rpc<string>("ledger_add", { admin_pass: adminPass, p_entry_date: date || null, p_kind: kind, p_item: item.trim(), p_amount: amt, p_memo: memo.trim() });
      if (createReceipt && newId) {
        const r = await uploadReceipt(newId, createReceipt);
        if (r) await rpc("ledger_update", { admin_pass: adminPass, target_id: newId, p_entry_date: date || null, p_kind: kind, p_item: item.trim(), p_amount: amt, p_memo: memo.trim(), p_receipt_path: r.storage_path, p_receipt_name: r.file_name });
      }
      setItem(""); setAmount(""); setMemo(""); setDate(""); setCreateReceipt(null);
      const inp = document.getElementById("ops-receipt") as HTMLInputElement | null;
      if (inp) inp.value = "";
      await load(); setMsg({ text: "記録しました", ok: true });
    } catch { setMsg({ text: "記録できませんでした。", ok: false }); }
    setSaving(false);
  }

  function startEdit(e: LedgerEntry) {
    setEditingId(e.id); setEditDate(e.entry_date ?? ""); setEditKind(e.kind);
    setEditItem(e.item); setEditAmount(String(e.amount)); setEditMemo(e.memo ?? "");
    setEditReceiptFile(null); setEditClear(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number.parseInt(editAmount, 10);
    if (!editItem.trim() || !Number.isFinite(amt) || savingEdit || !editingId) return;
    setSavingEdit(true);
    try {
      let rp: string | null = null; let rn: string | null = null;
      if (!editClear && editReceiptFile) {
        const r = await uploadReceipt(editingId, editReceiptFile);
        if (r) { rp = r.storage_path; rn = r.file_name; }
      }
      await rpc("ledger_update", { admin_pass: adminPass, target_id: editingId, p_entry_date: editDate || null, p_kind: editKind, p_item: editItem.trim(), p_amount: amt, p_memo: editMemo.trim(), p_receipt_path: rp, p_receipt_name: rn, p_clear_receipt: editClear });
      await load(); setEditingId(null);
    } catch { /* ignore */ }
    setSavingEdit(false);
  }

  async function remove(id: string) {
    if (!window.confirm("削除しますか？")) return;
    const entry = entries.find((x) => x.id === id);
    if (entry?.receipt_path) await fnCall({ action: "ledger_receipt_delete", admin_pass: adminPass, entry_id: id });
    await rpc("ledger_delete", { admin_pass: adminPass, target_id: id });
    setEntries((prev) => prev.filter((x) => x.id !== id));
  }

  async function dlReceipt(id: string) {
    const d = await fnCall({ action: "ledger_receipt_download", admin_pass: adminPass, entry_id: id });
    if (!d.url) { window.alert("ダウンロードできませんでした。"); return; }
    const a = document.createElement("a"); a.href = d.url as string; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
  }

  const totals = useMemo(() => {
    let income = 0; let expense = 0;
    for (const e of entries) { if (e.kind === "income") income += e.amount; else expense += e.amount; }
    return { income, expense, balance: income - expense };
  }, [entries]);

  if (loading) return <p className="text-white/50 text-sm">読み込み中…</p>;

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4 text-center">
          <div className="text-[11px] text-white/50 mb-1">収入</div>
          <div className="text-neon-cyan font-display text-lg">{yen(totals.income)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-awa-indigo-900/40 p-4 text-center">
          <div className="text-[11px] text-white/50 mb-1">支出</div>
          <div className="text-rose-300 font-display text-lg">{yen(totals.expense)}</div>
        </div>
        <div className="rounded-xl border border-awa-glow/30 bg-awa-glow/[0.06] p-4 text-center">
          <div className="text-[11px] text-white/50 mb-1">残高</div>
          <div className={`font-display text-lg ${totals.balance < 0 ? "text-rose-300" : "text-awa-glow"}`}>{yen(totals.balance)}</div>
        </div>
      </div>

      {/* 記録フォーム */}
      <form onSubmit={addEntry} className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.03] p-5 space-y-3">
        <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">NEW ENTRY</div>
        <div className="grid gap-3 md:grid-cols-2">
          <select value={kind} onChange={(e) => setKind(e.target.value as "income" | "expense")} className={inputCls}>
            <option value="expense">支出</option>
            <option value="income">収入</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} placeholder="項目" maxLength={120} className={inputCls} />
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="金額（円）" min={0} className={inputCls} />
        </div>
        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="メモ（任意）" maxLength={500} className={`w-full ${inputCls}`} />
        <input id="ops-receipt" type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setCreateReceipt(e.target.files?.[0] ?? null)}
          className="w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-awa-glow/15 file:text-awa-glow file:px-3 file:py-1.5 file:text-xs hover:file:bg-awa-glow/25" />
        {msg && <p className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}>{msg.text}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !item.trim() || !amount.trim()} className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.15em] text-xs px-5 py-2 transition">
            {saving ? "記録中…" : "記録する"}
          </button>
        </div>
      </form>

      {/* 一覧 */}
      <div className="space-y-2">
        {entries.map((e) => editingId === e.id ? (
          <div key={e.id} className="rounded-xl border border-awa-glow/30 bg-awa-glow/[0.02]">
            <form onSubmit={saveEdit} className="p-4 space-y-3">
              <div className="text-[11px] font-display tracking-[0.2em] text-awa-glow">EDIT</div>
              <div className="grid gap-3 md:grid-cols-2">
                <select value={editKind} onChange={(ev) => setEditKind(ev.target.value as "income" | "expense")} className={inputCls}>
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
                <input type="date" value={editDate} onChange={(ev) => setEditDate(ev.target.value)} className={inputCls} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="text" value={editItem} onChange={(ev) => setEditItem(ev.target.value)} maxLength={120} className={inputCls} />
                <input type="number" value={editAmount} onChange={(ev) => setEditAmount(ev.target.value)} min={0} className={inputCls} />
              </div>
              <input type="text" value={editMemo} onChange={(ev) => setEditMemo(ev.target.value)} maxLength={500} className={`w-full ${inputCls}`} />
              {e.receipt_path && !editClear && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-awa-glow">📎 {e.receipt_name}</span>
                  <button type="button" onClick={() => setEditClear(true)} className="text-rose-300/70 hover:text-rose-300">削除</button>
                </div>
              )}
              {editClear && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-rose-300">添付を削除します</span>
                  <button type="button" onClick={() => setEditClear(false)} className="text-white/50 hover:text-white/80">取り消し</button>
                </div>
              )}
              {!editClear && <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(ev) => setEditReceiptFile(ev.target.files?.[0] ?? null)} className="w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/60 file:px-3 file:py-1.5 file:text-xs" />}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-white/40 hover:text-white/70 px-4 py-2 transition">キャンセル</button>
                <button type="submit" disabled={savingEdit} className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.15em] text-xs px-5 py-2 transition">{savingEdit ? "保存中…" : "保存"}</button>
              </div>
            </form>
          </div>
        ) : (
          <div key={e.id} className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <Badge color={e.kind === "income" ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" : "border-rose-300/40 text-rose-200 bg-rose-300/10"}>
                  {e.kind === "income" ? "収入" : "支出"}
                </Badge>
                <span className="text-white/40 text-[11px]">{e.entry_date}</span>
                {e.receipt_path && (
                  <button onClick={() => dlReceipt(e.id)} className="text-[11px] text-awa-glow/70 hover:text-awa-glow transition">📎 レシート</button>
                )}
              </div>
              <p className="text-white font-bold text-sm truncate">{e.item}</p>
              {e.memo && <p className="text-white/40 text-[11px] truncate">{e.memo}</p>}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`font-display text-sm ${e.kind === "income" ? "text-neon-cyan" : "text-rose-300"}`}>
                {e.kind === "income" ? "+" : "−"}{yen(e.amount)}
              </span>
              <div className="flex gap-3">
                <button onClick={() => startEdit(e)} className="text-[11px] text-white/40 hover:text-white/70 transition">編集</button>
                <button onClick={() => remove(e.id)} className="text-[11px] text-rose-300/70 hover:text-rose-300 transition">削除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   議事録タブ
═══════════════════════════════════════════ */
const CAT_FILE: Record<FileRow["category"], { label: string; color: string }> = {
  minutes: { label: "議事録", color: "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" },
  doc:     { label: "資料",   color: "border-awa-glow/50 text-awa-glow bg-awa-glow/10" },
  photo:   { label: "写真",   color: "border-amber-300/50 text-amber-200 bg-amber-300/10" },
  other:   { label: "その他", color: "border-white/30 text-white/60 bg-white/5" },
};

function ResourcesTab({ adminPass }: { adminPass: string }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  // フォーム
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [upCat, setUpCat] = useState<FileRow["category"]>("minutes");
  const [upTitle, setUpTitle] = useState("");
  const [upDate, setUpDate] = useState("");
  const [textBody, setTextBody] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [savingText, setSavingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    const d = await fnCall({ action: "list", member_pass: MEMBER_PASS });
    if (Array.isArray(d.files)) setFiles(d.files as FileRow[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function saveText(e: React.FormEvent) {
    e.preventDefault();
    if (!upTitle.trim() || !textBody.trim() || savingText) return;
    setSavingText(true); setMsg(null);
    const r = await fnCall({ action: "create_text", admin_pass: adminPass, category: upCat, title: upTitle.trim(), body: textBody.trim(), meeting_date: upDate || null });
    if (r.ok) { setUpTitle(""); setTextBody(""); setUpDate(""); await load(); setMsg({ text: "保存しました", ok: true }); }
    else setMsg({ text: "保存できませんでした。", ok: false });
    setSavingText(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !upTitle.trim() || uploading) return;
    setUploading(true); setMsg(null);
    try {
      const cu = await fnCall({ action: "create_upload", admin_pass: adminPass, category: upCat, title: upTitle.trim(), file_name: uploadFile.name, mime: uploadFile.type, meeting_date: upDate || null });
      if (!cu.signedUrl) throw new Error("no url");
      const put = await fetch(cu.signedUrl as string, { method: "PUT", headers: { "Content-Type": uploadFile.type || "application/octet-stream" }, body: uploadFile });
      if (!put.ok) throw new Error("put failed");
      setUpTitle(""); setUpDate(""); setUploadFile(null);
      const inp = document.getElementById("ops-file-input") as HTMLInputElement | null;
      if (inp) inp.value = "";
      await load(); setMsg({ text: "アップロードしました", ok: true });
    } catch { setMsg({ text: "アップロードできませんでした。", ok: false }); }
    setUploading(false);
  }

  async function dlFile(id: string) {
    const d = await fnCall({ action: "download", member_pass: MEMBER_PASS, id });
    if (!d.url) { window.alert("ダウンロードできませんでした。"); return; }
    const a = document.createElement("a"); a.href = d.url as string; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
  }

  async function deleteFile(id: string) {
    if (!window.confirm("削除しますか？")) return;
    await fnCall({ action: "delete", admin_pass: adminPass, id });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) return <p className="text-white/50 text-sm">読み込み中…</p>;

  return (
    <div className="space-y-6">
      {/* 追加フォーム */}
      <div className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.03] p-5 space-y-3">
        <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">ADD / 追加</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setInputMode("text")} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${inputMode === "text" ? "border-awa-glow bg-awa-glow/15 text-awa-glow" : "border-white/15 text-white/60 hover:border-white/30"}`}>✍️ テキスト</button>
          <button type="button" onClick={() => setInputMode("file")} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${inputMode === "file" ? "border-awa-glow bg-awa-glow/15 text-awa-glow" : "border-white/15 text-white/60 hover:border-white/30"}`}>📎 ファイル</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select value={upCat} onChange={(e) => setUpCat(e.target.value as FileRow["category"])} className={inputCls}>
            {Object.entries(CAT_FILE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={upDate} onChange={(e) => setUpDate(e.target.value)} className={inputCls} />
        </div>
        <input type="text" value={upTitle} onChange={(e) => setUpTitle(e.target.value)} placeholder="タイトル" maxLength={200} className={`w-full ${inputCls}`} />
        {inputMode === "text" ? (
          <form onSubmit={saveText} className="space-y-3">
            <textarea value={textBody} onChange={(e) => setTextBody(e.target.value)} placeholder="本文（改行OK）" rows={5} maxLength={20000} className={`w-full ${inputCls} resize-y`} />
            {msg && <p className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}>{msg.text}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={savingText || !upTitle.trim() || !textBody.trim()} className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.15em] text-xs px-5 py-2 transition">
                {savingText ? "保存中…" : "保存する"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpload} className="space-y-3">
            <input id="ops-file-input" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} className="w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-awa-glow/15 file:text-awa-glow file:px-3 file:py-1.5 file:text-xs hover:file:bg-awa-glow/25" />
            {msg && <p className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}>{msg.text}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={uploading || !uploadFile || !upTitle.trim()} className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.15em] text-xs px-5 py-2 transition">
                {uploading ? "アップ中…" : "アップロード"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 一覧（アコーディオン） */}
      {files.length === 0 ? (
        <p className="text-white/50 text-sm">まだ資料はありません。</p>
      ) : (
        <div className="space-y-2">
          {files.map((f) => {
            const isText = !f.file_path;
            const open = openId === f.id;
            return (
              <div key={f.id} className="rounded-xl border border-white/10 bg-awa-indigo-950/50 overflow-hidden">
                <button onClick={() => setOpenId(open ? null : f.id)} className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-white/[0.03] transition">
                  <span className="min-w-0 flex items-center gap-2 flex-wrap">
                    <Badge color={CAT_FILE[f.category].color}>{CAT_FILE[f.category].label}</Badge>
                    {f.meeting_date && <span className="text-xs font-bold text-awa-glow">{f.meeting_date}</span>}
                    <span className="text-white font-bold text-sm">{f.title}</span>
                  </span>
                  <span className="text-white/40 text-xs shrink-0">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-3">
                    {isText
                      ? <p className="text-sm text-white/85 whitespace-pre-wrap leading-relaxed">{f.body}</p>
                      : <div className="flex items-center justify-between gap-3">
                          <span className="text-white/50 text-[11px] truncate">{f.file_name}</span>
                          <button onClick={() => dlFile(f.id)} className="rounded-lg border border-neon-cyan/60 text-neon-cyan text-xs px-4 py-1.5 hover:bg-neon-cyan/10 transition shrink-0">ダウンロード</button>
                        </div>
                    }
                    <div className="text-right mt-3">
                      <button onClick={() => deleteFile(f.id)} className="text-[11px] text-rose-300/70 hover:text-rose-300 transition">削除</button>
                    </div>
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

/* ── ヘルパーコンポーネント ────────────────── */
function TallyBar({ label, n, total }: { label: string; n: number; total: number }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/75 mb-1">
        <span>{label}</span>
        <span className="text-white/55">{n}件・{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-awa-glow" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SurveyItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-white/45 shrink-0 w-24">{label}</dt>
      <dd className="text-white/85 whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

