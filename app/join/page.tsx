"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Cpu,
  MapPin,
  CalendarDays,
  Gamepad2,
  Send,
  Loader2,
} from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";

const popularGames = [
  "VALORANT",
  "Apex Legends",
  "Street Fighter 6",
  "League of Legends",
  "FORTNITE",
  "OVERWATCH 2",
  "ストリートファイター",
  "スマブラ",
  "PUBG",
  "Rainbow Six Siege",
];

export default function JoinPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [game, setGame] = useState("");
  const [residency, setResidency] = useState<
    "current" | "former" | "neighbor" | "other" | ""
  >("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1600);
  };

  const valid =
    name.trim().length > 0 &&
    Number(age) > 0 &&
    game.trim().length > 0 &&
    residency !== "";

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="JOIN US / 参加申込"
            title="READY PLAYER ONE?"
            subtitle={
              <>
                徳島ルーツの方を中心に、興味のある県外の方も歓迎。
                <br />
                あなたの「やってみたい」が、AWA ESPORTS の次の一歩になります。
              </>
            }
          />
        </div>
      </section>

      {/* Requirement cards */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: MapPin,
                title: "RESIDENCY",
                jp: "徳島ルーツ歓迎・県外も応相談",
                desc: "現在徳島・元県民の方を中心に、興味のある県外の方も。",
              },
              {
                icon: CalendarDays,
                title: "AGE",
                jp: "年齢制限なし",
                desc: "高校生からシニアまで。挑戦したい全ての人へ。",
              },
              {
                icon: Gamepad2,
                title: "TITLE",
                jp: "好きなゲーム1つ",
                desc: "ジャンル不問。FPSも格ゲーもMOBAも。",
              },
            ].map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <r.icon className="w-5 h-5 text-neon-cyan" />
                  <span className="text-[10px] font-display tracking-[0.3em] text-neon-cyan/70">
                    {String(i + 1).padStart(2, "0")} / {r.title}
                  </span>
                </div>
                <div className="text-lg font-bold text-white">{r.jp}</div>
                <p className="mt-2 text-xs text-white/50 leading-relaxed">
                  {r.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cockpit form */}
      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-neon-cyan/30 bg-awa-indigo-900/60 backdrop-blur-xl p-2 neon-border"
          >
            {/* Cockpit header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neon-cyan/20">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-awa-magenta animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-awa-warmth" />
                <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
                <span className="ml-3 text-[10px] font-mono tracking-[0.3em] text-white/50">
                  AWA-COCKPIT v1.0 / ENTRY MODULE
                </span>
              </div>
              <Cpu className="w-4 h-4 text-neon-cyan animate-pulse-slow" />
            </div>

            <AnimatePresence mode="wait">
              {status !== "done" ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="px-6 md:px-10 py-10 space-y-8"
                >
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      01 / NAME — お名前
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例：ぼーるくん"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      02 / AGE — 年齢
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="例：25"
                      min={1}
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  {/* Residency */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      03 / RESIDENCY — 徳島との関係
                    </label>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { v: "current", l: "現在 徳島県在住" },
                        { v: "former", l: "元 徳島県民" },
                        { v: "neighbor", l: "隣県在住で興味あり" },
                        { v: "other", l: "それ以外で興味あり" },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() =>
                            setResidency(
                              opt.v as
                                | "current"
                                | "former"
                                | "neighbor"
                                | "other",
                            )
                          }
                          className={`relative rounded-lg border px-4 py-3 text-sm transition-all ${
                            residency === opt.v
                              ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-neon"
                              : "border-white/15 text-white/70 hover:border-white/40"
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                    {(residency === "neighbor" || residency === "other") && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-xs text-awa-magenta/90 leading-relaxed"
                      >
                        ※ 県外の方は、まず見学・お試し参加からご案内します。
                        <br />
                        活動拠点は徳島・藍住エリアです。
                      </motion.p>
                    )}
                  </div>

                  {/* Game */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      04 / FAVORITE GAME — 好きなゲーム
                    </label>
                    <input
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      placeholder="自由に入力 or 下から選択"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {popularGames.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGame(g)}
                          className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                            game === g
                              ? "border-awa-magenta bg-awa-magenta/10 text-awa-magenta"
                              : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Launch button */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10">
                    <p className="text-[10px] tracking-[0.3em] font-mono text-white/40">
                      {">"} ALL SYSTEMS{" "}
                      <span
                        className={
                          valid
                            ? "text-neon-cyan font-bold"
                            : "text-awa-magenta/70"
                        }
                      >
                        {valid ? "READY" : "STANDBY"}
                      </span>
                    </p>
                    <motion.button
                      type="submit"
                      disabled={!valid || status === "loading"}
                      whileHover={valid ? { scale: 1.03 } : undefined}
                      whileTap={valid ? { scale: 0.97 } : undefined}
                      className={`relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-display tracking-[0.3em] text-xs uppercase overflow-hidden transition-all ${
                        valid
                          ? "bg-gradient-to-r from-awa-magenta via-awa-violet to-neon-cyan text-white shadow-neon"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          LAUNCHING...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          LAUNCH
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-8 py-20 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-neon-cyan/10 border border-neon-cyan shadow-neon mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-neon-cyan" />
                  </motion.div>
                  <div className="text-[10px] tracking-[0.4em] font-display text-neon-cyan mb-3">
                    TRANSMISSION COMPLETE
                  </div>
                  <h3 className="font-display font-black text-3xl md:text-4xl text-white mb-4">
                    WELCOME TO
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-magenta to-neon-cyan">
                      AWA ESPORTS.
                    </span>
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                    {name && (
                      <>
                        <span className="text-white">{name}</span> さん、
                        <br />
                      </>
                    )}
                    エントリーありがとうございます。
                    <br />
                    内容を確認の上、運営からご連絡いたします。
                  </p>
                  {(residency === "neighbor" || residency === "other") && (
                    <p className="mt-4 text-xs text-awa-magenta/80 leading-relaxed max-w-md mx-auto">
                      県外メンバーも歓迎しています。
                      <br />
                      まずは見学・お試し参加からご案内いたします。
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setName("");
                      setAge("");
                      setGame("");
                      setResidency("");
                    }}
                    className="mt-8 text-xs text-white/50 hover:text-neon-cyan tracking-[0.3em] font-display"
                  >
                    ← もう一度入力する
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="mt-6 text-[11px] text-center text-white/30">
            ※ 本フォームはデモ送信です。実運用時は受付完了メールが届きます。
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
