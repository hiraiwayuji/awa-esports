"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

type Post = {
  id: string;
  created_at: string;
  author: string;
  body: string;
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

export default function BoardPage() {
  const [memberPass, setMemberPass] = useState("");
  const [entered, setEntered] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 投稿フォーム
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  // 運営モード（投稿削除）
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);

  async function enter(e?: React.FormEvent) {
    e?.preventDefault();
    if (!memberPass.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rpc<Post[]>("board_list", {
        member_pass: memberPass.trim(),
      });
      setPosts(data);
      setEntered(true);
    } catch {
      setError("合言葉が違うようです。もう一度お試しください。");
    }
    setLoading(false);
  }

  async function refresh() {
    try {
      const data = await rpc<Post[]>("board_list", {
        member_pass: memberPass.trim(),
      });
      setPosts(data);
    } catch {
      /* noop */
    }
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !body.trim() || posting) return;
    setPosting(true);
    try {
      await rpc("board_post", {
        member_pass: memberPass.trim(),
        p_author: author.trim(),
        p_body: body.trim(),
      });
      setBody("");
      await refresh();
    } catch {
      window.alert("投稿に失敗しました。文字数や合言葉をご確認ください。");
    }
    setPosting(false);
  }

  async function removePost(id: string) {
    if (!adminPass.trim()) {
      window.alert("運営合言葉を入力してください。");
      return;
    }
    if (!window.confirm("この投稿を削除します。よろしいですか？")) return;
    try {
      await rpc("board_delete", {
        admin_pass: adminPass.trim(),
        target_id: id,
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      window.alert("削除できませんでした（運営合言葉が違うかもしれません）。");
    }
  }

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
              subtitle="AWAKEN GLOW メンバー専用の連絡板です。"
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
                のページです。合言葉を入れて入室してください。
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
                {loading ? "確認中…" : "入室する"}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              {/* 安全のお願い */}
              <div className="rounded-xl border border-awa-glow/30 bg-awa-glow/[0.04] px-5 py-4 text-[13px] text-awa-glow/90 leading-relaxed space-y-1">
                <p className="font-bold text-awa-glow">
                  📌 安全に使うためのお願い
                </p>
                <ul className="list-disc ml-5 space-y-0.5 text-awa-glow/80">
                  <li>
                    本名・住所・学校名・電話番号など、個人が特定できる情報は書かないでください
                  </li>
                  <li>ニックネーム（ゲーマータグ）で大丈夫です</li>
                  <li>
                    ここはメンバー専用です。合言葉やURLを外部に共有しないでください
                  </li>
                  <li>
                    不適切な投稿・困ったことがあれば運営（ぼーるくん）まで
                  </li>
                </ul>
              </div>

              {/* 投稿フォーム */}
              <form
                onSubmit={submitPost}
                className="rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-5 md:p-6 space-y-4"
              >
                <div className="text-[11px] font-display tracking-[0.3em] text-neon-cyan">
                  NEW POST / 書き込む
                </div>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="ニックネーム"
                  maxLength={40}
                  className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="連絡・相談・雑談などを書いてね（個人情報は書かないでね）"
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition resize-y"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={posting || !author.trim() || !body.trim()}
                    className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm px-6 py-2.5 transition"
                  >
                    {posting ? "送信中…" : "書き込む"}
                  </button>
                </div>
              </form>

              {/* 投稿一覧 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">
                    みんなの書き込み（{posts.length}）
                  </h3>
                  <button
                    onClick={refresh}
                    className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition"
                  >
                    最新に更新
                  </button>
                </div>

                {posts.length === 0 ? (
                  <p className="text-white/50 text-sm">
                    まだ書き込みがありません。最初の一言をどうぞ！
                  </p>
                ) : (
                  posts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-white text-sm">
                          {p.author}
                        </span>
                        <span className="text-white/40 text-xs">
                          {new Date(p.created_at).toLocaleString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm text-white/85 whitespace-pre-wrap leading-relaxed">
                        {p.body}
                      </p>
                      {adminOpen && (
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => removePost(p.id)}
                            className="text-xs text-rose-300/70 hover:text-rose-300 transition"
                          >
                            運営削除
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 運営メニュー */}
              <div className="pt-6 border-t border-white/10">
                {!adminOpen ? (
                  <button
                    onClick={() => setAdminOpen(true)}
                    className="text-xs text-white/30 hover:text-white/60 transition"
                  >
                    運営メニュー
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="運営合言葉（削除用）"
                      className="grow rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2 text-sm focus:outline-none focus:border-rose-300/60 transition"
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
