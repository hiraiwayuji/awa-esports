"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import NeonButton from "@/components/NeonButton";
import { ChevronDown, Zap, Users, Trophy, Flame } from "lucide-react";

const stats = [
  { icon: Zap, label: "FOUNDED", value: "2026" },
  { icon: Users, label: "MEMBERS", value: "8+" },
  { icon: Trophy, label: "VISION", value: "WORLD" },
  { icon: Flame, label: "BASE", value: "TOKUSHIMA" },
];

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
              <stop offset="0%" stopColor="#FF2D95" stopOpacity="0" />
              <stop offset="50%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#9B5CFF" stopOpacity="0" />
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

        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 pt-20 pb-32 grid md:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-neon-cyan" />
              <span className="text-xs font-display tracking-[0.4em] text-neon-cyan">
                AWA ESPORTS / EST. 2026
              </span>
            </div>

            <h1 className="font-display font-black leading-[0.95] text-[12vw] md:text-[7.5vw] lg:text-[6.5rem] tracking-tight">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="block text-white"
              >
                eSPORTSを通じて
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="block bg-clip-text text-transparent bg-gradient-to-r from-awa-magenta via-awa-violet to-neon-cyan"
              >
                徳島を盛り上げる
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="block text-white/30 text-[6vw] md:text-[3.5vw] lg:text-5xl mt-3 tracking-[0.1em]"
              >
                FROM AWA TO THE WORLD.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-8 max-w-xl text-sm md:text-base text-white/70 leading-relaxed text-balance"
            >
              阿波踊りの躍動感、藍色の深み。
              <br />
              徳島の魂をデジタルの最前線へ。
              <br />
              誰もが主役になれる、新しい競技の物語を。
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
            <div className="relative aspect-square rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-6 overflow-hidden neon-border">
              <div className="text-[10px] font-display tracking-[0.3em] text-neon-cyan mb-4">
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
                      <s.icon size={14} className="text-awa-magenta" />
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

      {/* MARQUEE */}
      <section className="relative py-12 border-y border-white/10 overflow-hidden bg-awa-indigo-900/30">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-12 pr-12">
              {[
                "AWA ESPORTS",
                "★",
                "TOKUSHIMA",
                "★",
                "FROM AWA TO THE WORLD",
                "★",
                "EST. 2026",
                "★",
                "誰もが主役になれる",
                "★",
                "阿波の熱を、競技の最前線へ",
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
      </section>

      {/* PILLARS */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "OPEN DOOR",
                jp: "誰でもメンバーになれる",
                desc: "経験ゼロでも、年齢に関係なく。徳島で挑戦したい全ての人へ門戸を開く。",
                textClass: "text-neon-cyan",
                bgClass: "bg-neon-cyan",
                hoverBorder: "hover:border-neon-cyan/40",
              },
              {
                title: "RANK SYSTEM",
                jp: "競争心を煽るランク制度",
                desc: "プレースキル・貢献度・人柄。多面的な評価で伸びるランク制度を導入。",
                textClass: "text-awa-magenta",
                bgClass: "bg-awa-magenta",
                hoverBorder: "hover:border-awa-magenta/40",
              },
              {
                title: "LOCAL ROOTED",
                jp: "徳島と共に育つ",
                desc: "阿波踊り、ufotable、マチ★アソビ。地域の文化と、新しい競技を結びつける。",
                textClass: "text-awa-warmth",
                bgClass: "bg-awa-warmth",
                hoverBorder: "hover:border-awa-warmth/40",
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur p-8 ${p.hoverBorder} transition-all duration-500`}
              >
                <div
                  className={`text-[11px] font-display tracking-[0.3em] mb-4 ${p.textClass}`}
                >
                  {`0${i + 1}`} / {p.title}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {p.jp}
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

      {/* CTA */}
      <section className="relative py-32">
        <div className="mx-auto max-w-5xl px-5 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-neon-cyan/30 bg-awa-indigo-900/50 backdrop-blur-md p-12 md:p-16 overflow-hidden neon-border"
          >
            <div className="absolute inset-0 bg-radial-glow opacity-50" />
            <div className="relative z-10">
              <p className="text-xs tracking-[0.4em] font-display text-neon-cyan mb-4">
                READY TO PLAY?
              </p>
              <h3 className="font-display font-black text-3xl md:text-5xl leading-tight text-white">
                次に旗を立てるのは、
                <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-magenta to-neon-cyan">
                  あなたかもしれない。
                </span>
              </h3>
              <p className="mt-6 text-white/60 text-balance">
                応募は1分で完了。
                <br className="sm:hidden" />
                徳島県民、または元徳島県民が対象です。
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
