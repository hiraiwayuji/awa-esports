"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SectionTitle from "@/components/SectionTitle";
import { AWA_SUPABASE_URL, AWA_SUPABASE_KEY } from "@/lib/awa-supabase";

type FileRow = {
  id: string;
  created_at: string;
  category: "minutes" | "doc" | "photo" | "other";
  title: string;
  file_name: string;
  file_path: string;
  mime: string;
  meeting_date: string | null;
  body: string;
};

const CATEGORIES: { key: FileRow["category"]; label: string; badge: string }[] =
  [
    { key: "minutes", label: "議事録", badge: "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" },
    { key: "doc", label: "資料", badge: "border-awa-glow/50 text-awa-glow bg-awa-glow/10" },
    { key: "photo", label: "写真", badge: "border-amber-300/50 text-amber-200 bg-amber-300/10" },
    { key: "other", label: "その他", badge: "border-white/30 text-white/70 bg-white/5" },
  ];

const CAT_LABEL: Record<FileRow["category"], string> = {
  minutes: "議事録",
  doc: "資料",
  photo: "写真",
  other: "その他",
};

const FN = `${AWA_SUPABASE_URL}/functions/v1/member-files`;

async function fnCall(payload: Record<string, unknown>) {
  const res = await fetch(FN, {
    method: "POST",
    headers: { apikey: AWA_SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export default function ResourcesPage() {
  const [memberPass, setMemberPass] = useState("");
  const [entered, setEntered] = useState(false);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 運営モード
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const adminMode = adminOpen && adminPass.trim().length > 0;

  // 入力モード（テキスト議事録 / ファイル）
  const [inputMode, setInputMode] = useState<"text" | "file">("text");

  // 共通フォーム項目
  const [upTitle, setUpTitle] = useState("");
  const [upCategory, setUpCategory] = useState<FileRow["category"]>("minutes");
  const [upDate, setUpDate] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // テキスト議事録
  const [textBody, setTextBody] = useState("");
  const [savingText, setSavingText] = useState(false);

  // ファイルアップロード
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function saveText(e: React.FormEvent) {
    e.preventDefault();
    if (!upTitle.trim() || !textBody.trim() || savingText) return;
    setSavingText(true);
    setMsg(null);
    try {
      const r = await fnCall({
        action: "create_text",
        admin_pass: adminPass.trim(),
        category: upCategory,
        title: upTitle.trim(),
        body: textBody.trim(),
        meeting_date: upDate || null,
      });
      if (!r.ok) throw new Error("failed");
      setUpTitle("");
      setTextBody("");
      setUpDate("");
      await loadFiles();
      setMsg({ text: "保存しました", ok: true });
    } catch {
      setMsg({
        text: "保存できませんでした。運営合言葉・タイトル・本文をご確認ください。",
        ok: false,
      });
    }
    setSavingText(false);
  }

  async function loadFiles(pass?: string) {
    const d = await fnCall({
      action: "list",
      member_pass: (pass ?? memberPass).trim(),
    });
    if (Array.isArray(d.files)) setFiles(d.files as FileRow[]);
  }

  async function enter(e?: React.FormEvent, passArg?: string) {
    e?.preventDefault();
    const p = (passArg ?? memberPass).trim();
    if (!p) return;
    setLoading(true);
    setError(null);
    const d = await fnCall({ action: "list", member_pass: p });
    if (Array.isArray(d.files)) {
      setFiles(d.files as FileRow[]);
      if (typeof window !== "undefined")
        sessionStorage.setItem("awa_member_pass", p);
      setEntered(true);
    } else {
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

  async function download(id: string) {
    const d = await fnCall({
      action: "download",
      member_pass: memberPass.trim(),
      id,
    });
    if (!d.url) {
      window.alert("ダウンロードできませんでした。");
      return;
    }
    const a = document.createElement("a");
    a.href = d.url as string;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !upTitle.trim() || uploading) return;
    setUploading(true);
    setMsg(null);
    try {
      const cu = await fnCall({
        action: "create_upload",
        admin_pass: adminPass.trim(),
        category: upCategory,
        title: upTitle.trim(),
        file_name: file.name,
        mime: file.type,
        meeting_date: upDate || null,
      });
      if (!cu.signedUrl) throw new Error("create_upload failed");
      const put = await fetch(cu.signedUrl as string, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error("put failed");
      setUpTitle("");
      setUpDate("");
      setFile(null);
      const input = document.getElementById(
        "file-input",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
      await loadFiles();
      setMsg({ text: "アップロードしました", ok: true });
    } catch {
      setMsg({
        text: "アップロードに失敗しました。運営合言葉・ファイルをご確認ください。",
        ok: false,
      });
    }
    setUploading(false);
  }

  async function deleteFile(id: string) {
    if (!window.confirm("この資料を削除します。よろしいですか？")) return;
    const d = await fnCall({
      action: "delete",
      admin_pass: adminPass.trim(),
      id,
    });
    if (d.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      window.alert("削除できませんでした（運営合言葉をご確認ください）。");
    }
  }

  const grouped = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        items: files.filter((f) => f.category === c.key),
      })).filter((g) => g.items.length > 0),
    [files],
  );

  return (
    <PageTransition>
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[14vw] md:text-[10vw] lg:text-[7rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            RESOURCES
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="MEMBERS ONLY / メンバー資料・議事録"
              title="RESOURCES"
              subtitle="ミーティング議事録や資料を保存・確認できます。"
            />
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          {!entered ? (
            <form
              onSubmit={enter}
              className="rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-4"
            >
              <p className="text-sm text-white/80 leading-relaxed">
                ここは<span className="text-white">メンバー専用</span>
                の資料置き場です。合言葉を入れて確認してください。
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
                <Link
                  href="/board"
                  className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition"
                >
                  ← 連絡板へ
                </Link>
                <button
                  onClick={() => loadFiles()}
                  className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition"
                >
                  最新に更新
                </button>
              </div>

              {/* 運営：追加（テキスト or ファイル） */}
              {adminMode && (
                <div className="rounded-2xl border border-awa-glow/30 bg-awa-glow/[0.04] p-5 md:p-6 space-y-4">
                  <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">
                    ADD / 追加（運営）
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${inputMode === "text" ? "border-awa-glow bg-awa-glow/15 text-awa-glow" : "border-white/15 text-white/60 hover:border-white/30"}`}
                    >
                      ✍️ テキストで書く
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("file")}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${inputMode === "file" ? "border-awa-glow bg-awa-glow/15 text-awa-glow" : "border-white/15 text-white/60 hover:border-white/30"}`}
                    >
                      📎 ファイルをアップ
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-[0.15em] text-white/70">
                        種別
                      </span>
                      <select
                        value={upCategory}
                        onChange={(e) =>
                          setUpCategory(e.target.value as FileRow["category"])
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
                        日付（任意・開催日など）
                      </span>
                      <input
                        type="date"
                        value={upDate}
                        onChange={(e) => setUpDate(e.target.value)}
                        className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan transition"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={upTitle}
                    onChange={(e) => setUpTitle(e.target.value)}
                    placeholder="タイトル（例：6月ミーティング議事録）"
                    maxLength={200}
                    className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition"
                  />

                  {inputMode === "text" ? (
                    <form onSubmit={saveText} className="space-y-4">
                      <textarea
                        value={textBody}
                        onChange={(e) => setTextBody(e.target.value)}
                        placeholder="議事録の本文をここに書いてください（改行OK）&#10;例）&#10;・決定事項：…&#10;・次回：7/5（日）14:00〜"
                        rows={8}
                        maxLength={20000}
                        className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan transition resize-y leading-relaxed"
                      />
                      {msg && (
                        <p
                          className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}
                        >
                          {msg.text}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={
                            savingText || !upTitle.trim() || !textBody.trim()
                          }
                          className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm px-6 py-2.5 transition"
                        >
                          {savingText ? "保存中…" : "保存する"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleUpload} className="space-y-4">
                      <input
                        id="file-input"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="w-full text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-awa-glow/15 file:text-awa-glow file:px-4 file:py-2 file:text-sm file:font-bold hover:file:bg-awa-glow/25"
                      />
                      <p className="text-[11px] text-white/40">
                        PDF・Word・写真などOK（25MBまで）
                      </p>
                      {msg && (
                        <p
                          className={`text-[12px] ${msg.ok ? "text-awa-glow" : "text-rose-300"}`}
                        >
                          {msg.text}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={uploading || !file || !upTitle.trim()}
                          className="rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 text-awa-glow font-display tracking-[0.2em] text-sm px-6 py-2.5 transition"
                        >
                          {uploading ? "アップロード中…" : "アップロード"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 一覧 */}
              {files.length === 0 ? (
                <p className="text-white/50 text-sm">まだ資料はありません。</p>
              ) : (
                <div className="space-y-8">
                  {grouped.map((g) => (
                    <div key={g.key} className="space-y-3">
                      <h3 className="text-sm tracking-[0.2em] text-white/70 font-display">
                        {g.label}
                      </h3>
                      {g.items.map((f) => {
                        const isText = !f.file_path;
                        return (
                          <div
                            key={f.id}
                            className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span
                                    className={`text-[10px] tracking-wider rounded-full border px-2 py-0.5 ${g.badge}`}
                                  >
                                    {CAT_LABEL[f.category]}
                                  </span>
                                  {f.meeting_date && (
                                    <span className="text-xs text-awa-glow font-bold">
                                      {f.meeting_date}
                                    </span>
                                  )}
                                </div>
                                <p className="text-white font-bold text-sm">
                                  {f.title}
                                </p>
                                {!isText && (
                                  <p className="text-white/40 text-[11px] truncate">
                                    {f.file_name}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                {!isText && (
                                  <button
                                    onClick={() => download(f.id)}
                                    className="rounded-lg border border-neon-cyan/60 text-neon-cyan text-xs px-4 py-1.5 hover:bg-neon-cyan/10 transition"
                                  >
                                    ダウンロード
                                  </button>
                                )}
                                {adminMode && (
                                  <button
                                    onClick={() => deleteFile(f.id)}
                                    className="text-[11px] text-rose-300/70 hover:text-rose-300 transition"
                                  >
                                    削除
                                  </button>
                                )}
                              </div>
                            </div>
                            {isText && f.body && (
                              <p className="mt-3 pt-3 border-t border-white/10 text-sm text-white/85 whitespace-pre-wrap leading-relaxed">
                                {f.body}
                              </p>
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
                    運営メニュー（資料の追加・削除）
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
