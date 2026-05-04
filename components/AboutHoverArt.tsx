"use client";

import { motion } from "framer-motion";

type Slug = "awa-odori" | "ufotable" | "machi-asobi";

type Props = {
  slug: Slug;
  active: boolean;
};

/**
 * About カード用のオリジナルSVGアートワーク（写真/動画の代替）。
 * - 阿波踊り：提灯の揺らぎ + 扇 + 流れる光の帯
 * - ufotable：放射状集中線 + フィルム + パルス発光
 * - マチ★アソビ：ハーフトーンドット + ネオン★ + グリッチ街
 */
export default function AboutHoverArt({ slug, active }: Props) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {slug === "awa-odori" && <AwaOdori active={active} />}
        {slug === "ufotable" && <Ufotable active={active} />}
        {slug === "machi-asobi" && <MachiAsobi active={active} />}

        {/* 共通：上にグラデを乗せて文字読みやすさ確保 */}
        <div className="absolute inset-0 bg-gradient-to-b from-awa-indigo-950/30 via-awa-indigo-950/40 to-awa-indigo-950/75" />
      </motion.div>
    </div>
  );
}

/* ---------------- 阿波踊り ---------------- */
function AwaOdori({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* 背景 radial グロー */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, rgba(255,45,149,0.45), transparent 65%), radial-gradient(ellipse at 30% 30%, rgba(240,185,92,0.3), transparent 60%)",
        }}
      />

      {/* 流れる光の帯（法被の流れ） */}
      <motion.div
        className="absolute -inset-1/4 origin-center"
        animate={
          active
            ? { rotate: [0, 8, -4, 0], x: ["-10%", "8%", "-10%"] }
            : { rotate: 0, x: 0 }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "repeating-linear-gradient(105deg, transparent 0 32px, rgba(240,185,92,0.18) 32px 34px, transparent 34px 80px, rgba(255,45,149,0.18) 80px 82px)",
        }}
      />

      {/* 大きな扇のシルエット */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute -right-12 -top-10 w-64 h-64 opacity-25"
        animate={active ? { rotate: [0, -6, 6, 0] } : { rotate: 0 }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="ougi" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DFFB7" />
            <stop offset="100%" stopColor="#2DFFB7" />
          </linearGradient>
        </defs>
        <path
          d="M100,160 L40,60 Q100,30 160,60 Z"
          fill="url(#ougi)"
          opacity="0.6"
        />
        {[...Array(7)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="160"
            x2={40 + i * 20}
            y2={60 + Math.abs(i - 3) * 6}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
        ))}
      </motion.svg>

      {/* 連なる提灯（上下に揺らぐ円） */}
      <svg
        viewBox="0 0 400 200"
        className="absolute inset-x-0 top-3 w-full"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="20"
          x2="400"
          y2="20"
          stroke="rgba(240,185,92,0.4)"
          strokeWidth="0.8"
          strokeDasharray="3 4"
        />
      </svg>
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + i * 13}%`,
            top: "10%",
            width: 16,
            height: 22,
            background:
              i % 2 === 0
                ? "radial-gradient(circle at 50% 35%, #FFD180, #FF6E40)"
                : "radial-gradient(circle at 50% 35%, #FFB199, #E91E63)",
            boxShadow:
              i % 2 === 0
                ? "0 0 14px rgba(255,110,64,0.7)"
                : "0 0 14px rgba(233,30,99,0.6)",
          }}
          animate={
            active
              ? {
                  y: [0, 4, 0, -3, 0],
                  rotate: [0, 4, 0, -4, 0],
                }
              : { y: 0, rotate: 0 }
          }
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}

      {/* 踊りの抽象シルエット（流れ） */}
      <svg
        viewBox="0 0 400 200"
        className="absolute bottom-0 inset-x-0 w-full h-2/3 opacity-50"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,180 C60,140 100,170 160,140 S280,170 340,130 L400,150 L400,200 L0,200 Z"
          fill="rgba(255,45,149,0.35)"
          animate={active ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,190 C80,170 130,190 200,165 S320,190 400,170 L400,200 L0,200 Z"
          fill="rgba(240,185,92,0.4)"
          animate={active ? { y: [0, 3, 0] } : { y: 0 }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </svg>

      {/* 火の粉 */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(i * 71) % 100}%`,
            bottom: 0,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: i % 2 ? "#2DFFB7" : "#2DFFB7",
            boxShadow: "0 0 8px currentColor",
          }}
          animate={
            active
              ? { y: [-0, -200], opacity: [0, 1, 0] }
              : { y: 0, opacity: 0 }
          }
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- ufotable ---------------- */
function Ufotable({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* 背景グロー */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(155,92,255,0.45), transparent 60%), radial-gradient(circle at 80% 20%, rgba(0,240,255,0.3), transparent 55%)",
        }}
      />

      {/* 集中線（放射状、ゆっくり回転） */}
      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute inset-0 w-full h-full opacity-50"
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const x2 = Math.cos(angle) * 200;
          const y2 = Math.sin(angle) * 200;
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x2}
              y2={y2}
              stroke={i % 3 === 0 ? "#2DFFB7" : "rgba(155,92,255,0.4)"}
              strokeWidth={i % 6 === 0 ? "0.8" : "0.3"}
            />
          );
        })}
      </motion.svg>

      {/* 中央の発光パルス */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 80,
          height: 80,
          background:
            "radial-gradient(circle, rgba(155,92,255,0.9) 0%, rgba(0,240,255,0.5) 40%, transparent 70%)",
          filter: "blur(2px)",
        }}
        animate={
          active
            ? { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }
            : { scale: 1, opacity: 0.6 }
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* フィルムストリップ風（上下） */}
      {[
        { y: "top-0", direction: 1 },
        { y: "bottom-0", direction: -1 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className={`absolute ${s.y} inset-x-0 h-6 flex items-center gap-1 px-2 opacity-60`}
          animate={
            active
              ? { x: [`${s.direction * -10}%`, `${s.direction * 10}%`] }
              : { x: 0 }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse",
          }}
        >
          {Array.from({ length: 30 }).map((_, j) => (
            <span
              key={j}
              className="block h-3 w-3 bg-awa-glow/70 rounded-sm flex-shrink-0"
            />
          ))}
        </motion.div>
      ))}

      {/* スパーク */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={`flash-${i}`}
          className="absolute"
          style={{
            left: `${10 + ((i * 23) % 80)}%`,
            top: `${15 + ((i * 31) % 60)}%`,
            width: 10,
            height: 10,
            background: "white",
            borderRadius: "50%",
            boxShadow:
              "0 0 12px white, 0 0 24px rgba(0,240,255,0.8), 0 0 36px rgba(155,92,255,0.6)",
          }}
          animate={
            active
              ? { scale: [0, 1, 0], opacity: [0, 1, 0] }
              : { scale: 0, opacity: 0 }
          }
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}

      {/* ホログラムグリッド */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}

/* ---------------- マチ★アソビ ---------------- */
function MachiAsobi({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* 背景：暖色 + マゼンタのネオン */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 80%, rgba(240,185,92,0.4), transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(255,45,149,0.4), transparent 55%)",
        }}
      />

      {/* ハーフトーンドット背景 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(240,185,92,0.6) 1.2px, transparent 1.6px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* 街シルエット（夜景ビル群） */}
      <svg
        viewBox="0 0 400 100"
        className="absolute bottom-0 inset-x-0 w-full opacity-70"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="city" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2A6B" />
            <stop offset="100%" stopColor="#070B1F" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 L20,60 L20,40 L40,40 L40,55 L70,55 L70,30 L100,30 L100,50 L130,50 L130,20 L160,20 L160,45 L195,45 L195,35 L230,35 L230,55 L260,55 L260,28 L290,28 L290,48 L320,48 L320,38 L355,38 L355,55 L400,55 L400,100 L0,100 Z"
          fill="url(#city)"
        />
        {/* ビルの窓ライト */}
        {Array.from({ length: 25 }).map((_, i) => (
          <rect
            key={i}
            x={(i * 17) % 400}
            y={50 + ((i * 7) % 25)}
            width={2}
            height={2}
            fill={i % 3 === 0 ? "#2DFFB7" : "#2DFFB7"}
          />
        ))}
      </svg>

      {/* 巨大な ★（マチ★アソビのシンボル） */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute right-6 top-6 w-20 h-20"
        animate={
          active ? { rotate: 360, scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }
        }
        transition={{
          rotate: { duration: 14, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <defs>
          <linearGradient id="starG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DFFB7" />
            <stop offset="100%" stopColor="#2DFFB7" />
          </linearGradient>
        </defs>
        <polygon
          points="50,5 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38"
          fill="url(#starG)"
          stroke="white"
          strokeWidth="1"
          opacity="0.9"
          style={{ filter: "drop-shadow(0 0 12px rgba(240,185,92,0.8))" }}
        />
      </motion.svg>

      {/* 散らばる小★ */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={`star-${i}`}
          className="absolute font-display font-black"
          style={{
            left: `${10 + ((i * 23) % 75)}%`,
            top: `${20 + ((i * 17) % 50)}%`,
            color: i % 2 ? "#2DFFB7" : "#2DFFB7",
            fontSize: 10 + (i % 3) * 4,
            textShadow: "0 0 8px currentColor",
          }}
          animate={
            active
              ? {
                  opacity: [0, 1, 0],
                  y: [0, -10, -20],
                  rotate: [0, 180, 360],
                }
              : { opacity: 0 }
          }
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          ★
        </motion.span>
      ))}

      {/* ネオンサイン風テキスト */}
      <motion.div
        className="absolute left-5 top-8 font-display font-black text-2xl tracking-[0.1em]"
        style={{
          color: "#2DFFB7",
          textShadow:
            "0 0 8px #2DFFB7, 0 0 18px rgba(240,185,92,0.7), 0 0 28px rgba(255,45,149,0.5)",
        }}
        animate={active ? { opacity: [1, 0.7, 1, 0.4, 1] } : { opacity: 1 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        POP
      </motion.div>

      {/* グリッチライン */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.span
          key={`glitch-${i}`}
          className="absolute inset-x-0 h-px"
          style={{
            top: `${30 + i * 22}%`,
            background:
              i % 2
                ? "linear-gradient(90deg, transparent, #2DFFB7, transparent)"
                : "linear-gradient(90deg, transparent, #2DFFB7, transparent)",
          }}
          animate={
            active
              ? { x: ["-100%", "100%"], opacity: [0, 1, 0] }
              : { x: "-100%", opacity: 0 }
          }
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
