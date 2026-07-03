"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import NeonButton from "@/components/NeonButton";
import PartnersStrip from "@/components/PartnersStrip";
import { ChevronDown, Zap, Users, Trophy, Flame } from "lucide-react";

const stats = [
  { icon: Zap, label: "FOUNDED", value: "2026" },
  { icon: Users, label: "MEMBERS", value: "8+" },
  { icon: Trophy, label: "VISION", value: "WORLD" },
  { icon: Flame, label: "BASE", value: "TOKUSHIMA" },
];

/** #00F0FF → #2DFFB7 を文字数で補間 */
function lerpGlow(t: number) {
  const a = [0x00, 0xf0, 0xff];
  const b = [0x2d, 0xff, 0xb7];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** 1文字ずつ跳ね上がるステガー見出し */
function StaggerChars({
  text,
  delay = 0,
  gradient = false,
  className = "",
}: {
  text: string;
  delay?: number;
  gradient?: boolean;
  className?: string;
}) {
  const chars = Array.from(text);
  return (
    <span className={`inline-block ${className}`}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 34, rotateX: 80 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.055,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
          style={
            gradient
              ? { color: lerpGlow(chars.length > 1 ? i / (chars.length - 1) : 0) }
              : undefined
          }
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function HomePage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* HERO */}
      <section
        ref={ref}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* SVG hero deco */}
        <motion.svg
          style={{ y, opacity }}
          viewBox="0 0 1200 800"
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="heroLine" x1="0" x2="1">
              <stop offset="0%" stopColor="#2DFFB7" stopOpacity="0" />
              <stop offset="50%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#2DFFB7" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              x2="1200"
              y1={i * 50}
              y2={i * 50}
              stroke="url(#heroLine)"
              strokeWidth="0.6"
            />
          ))}
        </motion.svg>

        {/* Decorative hex */}
        <motion.div
          style={{ opacity }}
          className="absolute top-1/4 right-10 w-72 h-72 hidden md:block"
        >
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            viewBox="0 0 200 200"
            className="w-full h-full"
          >
            <polygon
              points="100,10 180,55 180,145 100,190 20,145 20,55"
              fill="none"
              stroke="rgba(0,240,255,0.4)"
              strokeWidth="1"
            />
            <polygon
              points="100,30 160,65 160,135 100,170 40,135 40,65"
              fill="none"
              stroke="rgba(255,45,149,0.3)"
              strokeWidth="1"
            />
          </motion.svg>
        </motion.div>

        {/* Diagonal light beams */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <motion.div
            initial={{ x: "-120%" }}
            animate={{ x: "220%" }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute top-0 bottom-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-neon-cyan/[0.05] to-transparent"
          />
          <motion.div
            initial={{ x: "-120%" }}
            animate={{ x: "220%" }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear", delay: 3.5 }}
            className="absolute top-0 bottom-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-awa-glow/[0.05] to-transparent"
          />
        </div>

        {/* 縦書きアクセント */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 pointer-events-none"
          aria-hidden
        >
          <span className="h-16 w-px bg-gradient-to-b from-transparent to-neon-cyan/50" />
          <span
            className="text-[10px] font-display tracking-[0.5em] text-white/30"
            style={{ writingMode: "vertical-rl" }}
          >
            TOKUSHIMA — JAPAN
          </span>
          <span className="h-16 w-px bg-gradient-to-t from-transparent to-awa-glow/50" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 pt-20 pb-32 grid lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8 min-w-0"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-neon-cyan" />
              <span className="text-xs font-display tracking-[0.4em] text-neon-cyan">
                AWAKEN GLOW / A.G. / EST. 2026
              </span>
            </div>

            <h1 className="font-display font-black leading-[0.95] text-[8vw] md:text-[5.8vw] lg:text-[5rem] tracking-tight [perspective:600px]">
              <span className="block text-white whitespace-nowrap">
                <StaggerChars text="眠れる輝きを" delay={0.1} />
              </span>
              <span className="block whitespace-nowrap">
                <StaggerChars text="目覚めさせる" delay={0.45} gradient />
              </span>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                data-text="AWAKEN YOUR GLOW."
                className="glitch glitch-hover block text-white/30 text-[6vw] md:text-[3.5vw] lg:text-5xl mt-3 tracking-[0.1em] cursor-default"
              >
                AWAKEN YOUR GLOW.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-8 max-w-xl text-sm md:text-base text-white/70 leading-relaxed text-balance"
            >
              内側にある輝きを目覚めさせ、
              <br />
              <span className="text-awa-glow">それぞれの挑戦</span>が集まる場所へ。
              <br />
              徳島から始まる、新しいeスポーツの物語を。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <NeonButton href="/join">JOIN THE TEAM</NeonButton>
              <NeonButton href="/members" variant="ghost">
                MEET MEMBERS
              </NeonButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="md:col-span-4 relative"
          >
            <div className="hud-corners relative aspect-square rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-6 overflow-hidden neon-border">
              {/* スキャンライン */}
              <div
                aria-hidden
                className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent animate-scan-line pointer-events-none"
              />
              <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.3em] text-neon-cyan mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-awa-glow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-awa-glow" />
                </span>
                SYSTEM STATUS / ONLINE
              </div>
              <div className="space-y-3">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center justify-between border-b border-white/10 pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <s.icon size={14} className="text-awa-glow" />
                      <span className="text-xs tracking-[0.2em] text-white/60">
                        {s.label}
                      </span>
                    </div>
                    <span className="font-display font-bold text-white">
                      {s.value}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-[10px] font-mono text-white/30 leading-relaxed">
                {">"} BOOTING UP...
                <br />
                {">"} CONNECTING TO 阿波.NETWORK
                <br />
                {">"} READY.
                <span className="inline-block w-2 h-3 ml-1 bg-awa-glow/70 align-middle animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-[10px] tracking-[0.3em] font-display">SCROLL</span>
          <ChevronDown size={18} />
        </motion.div>
      </section>

      {/* MARQUEE — 2段逆走 */}
      <section className="relative py-10 border-y border-white/10 overflow-hidden bg-awa-indigo-900/30">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-12 pr-12">
              {[
                "AWAKEN GLOW",
                "★",
                "A.G.",
                "★",
                "AWAKEN YOUR GLOW",
                "★",
                "GROW TOGETHER",
                "★",
                "OPEN TO ALL",
                "★",
                "TOKUSHIMA ESPORTS / EST. 2026",
                "★",
              ].map((t, i) => (
                <span
                  key={i}
                  className="font-display font-black text-3xl md:text-5xl tracking-[0.15em] text-white/10 hover:text-neon-cyan transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex whitespace-nowrap animate-marquee-reverse" aria-hidden>
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-12 pr-12">
              {[
                "眠れる輝きを目覚めさせる",
                "◆",
                "AWAKEN YOUR GLOW",
                "◆",
                "徳島発 eスポーツチーム",
                "◆",
                "挑戦する全ての人へ",
                "◆",
              ].map((t, i) => (
                <span
                  key={i}
                  className="font-display font-black text-2xl md:text-4xl tracking-[0.15em] text-stroke-cyan hover:text-neon-cyan/60 transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "OPEN DOOR",
                jp: ["誰でも", "メンバーに", "なれる"],
                desc: "経験ゼロでも、年齢に関係なく。徳島で挑戦したい全ての人へ門戸を開く。",
                textClass: "text-neon-cyan",
                bgClass: "bg-neon-cyan",
                hoverBorder: "hover:border-neon-cyan/40",
              },
              {
                title: "RANK SYSTEM",
                jp: ["成長を", "後押しする", "ランク制度"],
                desc: "プレースキル・貢献度・人柄。多面的な評価で伸びるランク制度を導入。",
                textClass: "text-awa-glow",
                bgClass: "bg-awa-glow",
                hoverBorder: "hover:border-awa-glow/40",
              },
              {
                title: "LOCAL ROOTED",
                jp: ["徳島と共に", "育つ"],
                desc: "祭りも、自然も、文化も。徳島の魅力と、新しい競技を結びつける。",
                textClass: "text-awa-glow-deep",
                bgClass: "bg-awa-glow-deep",
                hoverBorder: "hover:border-awa-glow-deep/40",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur p-8 overflow-hidden ${p.hoverBorder} transition-all duration-500`}
              >
                {/* ゴースト数字 */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 -right-3 font-display font-black text-[7rem] leading-none text-white/5 group-hover:text-white/10 transition-colors duration-500 select-none"
                >
                  {`0${i + 1}`}
                </span>
                <div
                  className={`text-[11px] font-display tracking-[0.3em] mb-4 ${p.textClass}`}
                >
                  {`0${i + 1}`} / {p.title}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {p.jp.map((seg) => (
                    <span key={seg} className="inline-block">
                      {seg}
                    </span>
                  ))}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">{p.desc}</p>
                <span
                  className={`absolute bottom-0 left-0 h-px w-0 ${p.bgClass} transition-all duration-500 group-hover:w-full`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <PartnersStrip />

      {/* SPONSOR 導線 */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-2xl border border-awa-glow-deep/30 bg-awa-indigo-900/40 backdrop-blur-md px-7 py-7 overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-glow opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[11px] font-display tracking-[0.3em] text-awa-glow-deep mb-2">
                SPONSOR / 応援パートナー募集
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                徳島から、全国へ。
                <span className="text-awa-glow">一緒に応援しませんか。</span>
              </h3>
              <p className="mt-2 text-sm text-white/60">
                チームの活動を支えてくださる企業・個人の皆さまを募集しています。
              </p>
            </div>
            <Link
              href="/sponsor"
              className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-awa-glow-deep/50 text-awa-glow-deep font-display tracking-[0.2em] text-xs uppercase hover:bg-awa-glow-deep/10 transition-colors whitespace-nowrap"
            >
              応援メニューを見る →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="mx-auto max-w-5xl px-5 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="spin-border relative rounded-3xl border border-neon-cyan/30 bg-awa-indigo-900/50 backdrop-blur-md p-12 md:p-16"
          >
            <div className="absolute inset-0 bg-radial-glow opacity-50" />
            <div className="relative z-10">
              <p className="text-xs tracking-[0.4em] font-display text-neon-cyan mb-4">
                READY TO PLAY?
              </p>
              <h3 className="font-display font-black text-3xl md:text-5xl leading-tight text-white">
                次に旗を立てるのは、
                <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-glow to-neon-cyan">
                  あなたかもしれない。
                </span>
              </h3>
              <p className="mt-6 text-white/60 text-balance">
                応募は1分で完了。
                <br className="sm:hidden" />
                徳島ルーツの方を中心に、興味のある県外の方も歓迎です。
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <NeonButton href="/join">エントリーする</NeonButton>
                <Link
                  href="/about"
                  className="text-sm text-white/60 hover:text-neon-cyan underline-offset-4 hover:underline self-center"
                >
                  まず詳しく知りたい →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
