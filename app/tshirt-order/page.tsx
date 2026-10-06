"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import { newSubmissionId } from "@/lib/submission-id";
import {
  TSHIRT_MAX_PER_SIZE,
  TSHIRT_SIZES,
  formatTshirtItems,
  tshirtTotals,
  yen,
  type TshirtItems,
  type TshirtSizeKey,
} from "@/lib/tshirt-order";

export default function TshirtOrderPage() {
  const [name, setName] = useState("");
  const [items, setItems] = useState<TshirtItems>({});
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ summary: string; price: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionId] = useState(newSubmissionId);

  const totals = useMemo(() => tshirtTotals(items), [items]);
  const canSubmit = !submitting && name.trim() !== "" && totals.qty > 0;

  function setQty(key: TshirtSizeKey, n: number) {
    setItems((prev) => ({ ...prev, [key]: Math.max(0, Math.min(TSHIRT_MAX_PER_SIZE, n)) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/tshirt-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, items, memo, submissionId }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !json.ok) {
        setErrorMessage("送信に失敗しました。少し時間をおいて再度お試しください。");
        setSubmitting(false);
        return;
      }
      setDone({ summary: formatTshirtItems(items), price: totals.price });
    } catch {
      setErrorMessage("送信に失敗しました。少し時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[16vw] md:text-[12vw] lg:text-[9rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            T-SHIRT
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="AG オリジナルTシャツ / 注文アンケート"
              title="AG T-SHIRT"
              subtitle={
                <>
                  チームTシャツを作ります。
                  <br />
                  ほしいサイズと枚数を教えてください。
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* デザイン・値段 */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-3xl px-5 md:px-8 space-y-5">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white">
            <Image
              src="/goods/ag-tshirt-2026.jpg"
              alt="AG Tシャツのデザイン（左：表 AWAKEN GLOW／右：裏 TOKUSHIMA e-SPORTS）"
              width={1505}
              height={792}
              className="w-full h-auto"
              priority
            />
          </div>
          <p className="text-center text-xs text-white/50">左：表／右：裏　色：ブラック</p>
          <div className="rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-4 text-[15px] text-white/85 leading-relaxed">
            <div>
              <p className="text-xs tracking-[0.2em] text-awa-glow mb-2">値段（1枚）</p>
              <ul className="space-y-1.5 text-white/80">
                <li>・S／M／L／XL（LL）：1,500円</li>
                <li>・3L／4L／5L：2,000円</li>
              </ul>
            </div>
            <p className="text-white/60 text-sm">
              お名前は必ずご記入ください。違うサイズを何枚でも組み合わせて注文できます。あとから変えたいときは運営にLINE・Discordで連絡してください。
            </p>
          </div>
        </div>
      </section>

      {done ? (
        <ThanksCard summary={done.summary} price={done.price} />
      ) : (
        <section className="relative pb-24">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <form
              onSubmit={onSubmit}
              className="grid gap-7 rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-xs tracking-[0.15em] text-white/70">
                  <span className="text-awa-glow mr-1.5">①</span>
                  お名前 / プレイヤーネーム
                  <span className="text-awa-glow ml-1">*</span>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="お名前またはプレイヤーネームを入力"
                  className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
                />
              </label>

              <div>
                <span className="block text-xs tracking-[0.15em] text-white/70 mb-2">
                  <span className="text-awa-glow mr-1.5">②</span>
                  サイズと枚数
                  <span className="text-awa-glow ml-1">*</span>
                </span>
                <div className="grid gap-2">
                  {TSHIRT_SIZES.map((s) => {
                    const n = items[s.key] ?? 0;
                    return (
                      <div
                        key={s.key}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2 transition ${
                          n > 0
                            ? "border-neon-cyan bg-neon-cyan/10"
                            : "border-white/15 bg-awa-indigo-950/60"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-white font-bold text-sm">{s.label}</div>
                          <div className="text-white/50 text-xs">{yen(s.price)}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setQty(s.key, n - 1)}
                            disabled={n === 0}
                            aria-label={`${s.label}を1枚へらす`}
                            className="w-10 h-10 rounded-lg border border-white/20 text-white text-xl leading-none disabled:opacity-25 hover:border-neon-cyan transition"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-white font-display text-lg tabular-nums">
                            {n}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(s.key, n + 1)}
                            disabled={n >= TSHIRT_MAX_PER_SIZE}
                            aria-label={`${s.label}を1枚ふやす`}
                            className="w-10 h-10 rounded-lg border border-neon-cyan/60 text-neon-cyan text-xl leading-none disabled:opacity-25 hover:bg-neon-cyan/10 transition"
                          >
                            ＋
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-lg border border-awa-glow/40 bg-awa-glow/[0.06] px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-white/80">
                    合計 <span className="text-white font-bold">{totals.qty}</span> 枚
                  </span>
                  <span className="text-awa-glow font-display text-xl">{yen(totals.price)}</span>
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs tracking-[0.15em] text-white/70">
                  <span className="text-awa-glow mr-1.5">③</span>
                  連絡事項（任意）
                </span>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  placeholder="家族の分も含む、など運営に伝えたいこと"
                  className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition resize-y"
                />
              </label>

              {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}
              {!canSubmit && !submitting && (
                <p className="text-xs text-white/45 -mb-3">
                  {!name.trim() ? "お名前を入れてください。" : "サイズを1枚以上えらんでください。"}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 disabled:cursor-not-allowed text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition-all shadow-[0_0_24px_rgba(45,255,183,0.15)] hover:shadow-[0_0_28px_rgba(45,255,183,0.35)]"
              >
                {submitting ? "送信中…" : "注文を送信する"}
              </button>
            </form>
          </div>
        </section>
      )}
    </PageTransition>
  );
}

function ThanksCard({ summary, price }: { summary: string; price: number }) {
  return (
    <section className="relative pb-32">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="rounded-2xl border border-awa-glow/40 bg-gradient-to-br from-awa-glow/[0.08] via-awa-indigo-900/40 to-neon-cyan/[0.05] backdrop-blur-md p-8 md:p-10 text-center space-y-5">
          <div className="text-[11px] font-display tracking-[0.4em] text-awa-glow">THANK YOU</div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            注文を受け付けました！
          </h2>
          <div className="rounded-lg border border-white/15 bg-awa-indigo-950/60 px-4 py-3 text-sm text-white/85 space-y-1">
            <div>{summary}</div>
            <div>
              合計 <span className="text-awa-glow font-display text-lg">{yen(price)}</span>
            </div>
          </div>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            お支払い方法・受け取りは運営から連絡します。内容を変えたいときは運営にLINE・Discordで連絡してください。
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block rounded-full border border-neon-cyan/60 text-neon-cyan px-5 py-2 text-xs tracking-[0.25em] font-display hover:bg-neon-cyan/10 transition"
            >
              トップへ戻る →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
