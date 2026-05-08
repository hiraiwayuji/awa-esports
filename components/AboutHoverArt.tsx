"use client";

import { motion } from "framer-motion";

type Slug =
  | "awa-odori"
  | "iya-kazurabashi"
  | "naruto-uzushio"
  | "machi-asobi";

type Props = {
  slug: Slug;
  active: boolean;
};

/**
 * About カード用のオリジナルSVGアートワーク（写真/動画の代替）。
 * - 阿波踊り：提灯の揺らぎ + 扇 + 流れる光の帯
 * - 祖谷のかずら橋：山のシルエット + かずら橋 + 流れる霧 + 蛍
 * - 鳴門の渦潮：回転スパイラル + 波 + 飛沫
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
        {slug === "iya-kazurabashi" && <IyaKazurabashi active={active} />}
        {slug === "naruto-uzushio" && <NarutoUzushio active={active} />}
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

/* ---------------- 祖谷のかずら橋 ---------------- */
function IyaKazurabashi({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* 背景：深緑〜深青のラジアルグラデ（深い山と霧） */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(45,255,183,0.25), transparent 60%), radial-gradient(ellipse at 30% 30%, rgba(27,42,107,0.7), transparent 65%)",
        }}
      />

      {/* 流れる霧の帯（横方向にゆっくり移動） */}
      <motion.div
        className="absolute -inset-1/4"
        animate={
          active ? { x: ["-15%", "8%", "-15%"] } : { x: 0 }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "repeating-linear-gradient(95deg, transparent 0 80px, rgba(255,255,255,0.06) 80px 120px, transparent 120px 200px, rgba(45,255,183,0.05) 200px 260px)",
        }}
      />

      {/* 山のシルエット（奥：薄く） */}
      <svg
        viewBox="0 0 400 200"
        className="absolute bottom-0 inset-x-0 w-full h-3/5 opacity-45"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mountainBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B2A6B" />
            <stop offset="100%" stopColor="#070B1F" />
          </linearGradient>
        </defs>
        <path
          d="M0,180 L40,110 L80,140 L130,80 L180,130 L230,90 L280,140 L330,100 L400,150 L400,200 L0,200 Z"
          fill="url(#mountainBack)"
        />
      </svg>

      {/* 山のシルエット（手前：濃く） */}
      <svg
        viewBox="0 0 400 200"
        className="absolute bottom-0 inset-x-0 w-full h-2/5 opacity-80"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mountainFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070B1F" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,150 L60,90 L110,130 L170,80 L230,120 L290,70 L350,110 L400,90 L400,200 Z"
          fill="url(#mountainFront)"
        />
      </svg>

      {/* かずら橋（横ロープ + 吊り垂直線、ゆるい弧） */}
      <motion.svg
        viewBox="0 0 400 100"
        className="absolute left-0 right-0 top-[42%] w-full h-16 opacity-70"
        preserveAspectRatio="none"
        animate={active ? { y: [0, 1.5, 0, -1.5, 0] } : { y: 0 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* 上ロープ（弧） */}
        <path
          d="M10,30 Q200,55 390,30"
          stroke="rgba(240,185,92,0.7)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* 床ロープ（弧、少し下） */}
        <path
          d="M10,55 Q200,80 390,55"
          stroke="rgba(240,185,92,0.85)"
          strokeWidth="1.6"
          fill="none"
        />
        {/* 吊り垂直線（編み込み） */}
        {Array.from({ length: 16 }).map((_, i) => {
          const t = i / 15;
          const x = 10 + t * 380;
          // 弧の y を線形補間で近似
          const yTop = 30 + Math.sin(t * Math.PI) * 25;
          const yBottom = 55 + Math.sin(t * Math.PI) * 25;
          return (
            <line
              key={i}
              x1={x}
              y1={yTop}
              x2={x}
              y2={yBottom}
              stroke="rgba(240,185,92,0.5)"
              strokeWidth="0.6"
            />
          );
        })}
      </motion.svg>

      {/* 蛍（ふわふわ上昇する発光ドット） */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={`firefly-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(i * 83) % 100}%`,
            bottom: `${5 + ((i * 13) % 30)}%`,
            width: 3,
            height: 3,
            background: "#2DFFB7",
            boxShadow:
              "0 0 8px #2DFFB7, 0 0 14px rgba(45,255,183,0.6)",
          }}
          animate={
            active
              ? {
                  y: [0, -120, -180],
                  x: [0, (i % 2 ? 12 : -12), 0],
                  opacity: [0, 1, 0],
                }
              : { y: 0, opacity: 0 }
          }
          transition={{
            duration: 6 + (i % 4),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- 鳴門の渦潮 ---------------- */
function NarutoUzushio({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* 背景：青〜エメラルドのラジアルグラデ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,240,255,0.4), transparent 60%), radial-gradient(circle at 30% 80%, rgba(45,255,183,0.3), transparent 55%)",
        }}
      />

      {/* 中央の渦（スパイラルSVG、永続回転） */}
      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute inset-0 w-full h-full opacity-65"
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="uzuGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,240,255,0.9)" />
            <stop offset="60%" stopColor="rgba(45,255,183,0.5)" />
            <stop offset="100%" stopColor="rgba(45,255,183,0)" />
          </radialGradient>
        </defs>
        {/* スパイラル：複数のアルキメデス螺旋 path */}
        {[0, 1, 2].map((layer) => {
          const points: string[] = [];
          const turns = 3.2;
          const steps = 140;
          const offset = (layer * Math.PI * 2) / 3;
          for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * turns * Math.PI * 2;
            const r = 4 + (t / (turns * Math.PI * 2)) * 75;
            const x = Math.cos(t + offset) * r;
            const y = Math.sin(t + offset) * r;
            points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
          }
          return (
            <path
              key={layer}
              d={points.join(" ")}
              stroke={
                layer === 0
                  ? "rgba(0,240,255,0.85)"
                  : layer === 1
                  ? "rgba(45,255,183,0.65)"
                  : "rgba(255,255,255,0.45)"
              }
              strokeWidth={layer === 0 ? "1.4" : "0.8"}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        {/* 渦の中心グロー */}
        <circle r="14" fill="url(#uzuGrad)" />
      </motion.svg>

      {/* 中央の発光パルス */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 60,
          height: 60,
          background:
            "radial-gradient(circle, rgba(0,240,255,0.7) 0%, rgba(45,255,183,0.4) 45%, transparent 75%)",
          filter: "blur(3px)",
        }}
        animate={
          active
            ? { scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }
            : { scale: 1, opacity: 0.5 }
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 波のシルエット（下部、2レイヤー） */}
      <svg
        viewBox="0 0 400 200"
        className="absolute bottom-0 inset-x-0 w-full h-2/3 opacity-55"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,180 C60,140 100,170 160,140 S280,170 340,130 L400,150 L400,200 L0,200 Z"
          fill="rgba(0,240,255,0.35)"
          animate={active ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,190 C80,170 130,190 200,165 S320,190 400,170 L400,200 L0,200 Z"
          fill="rgba(45,255,183,0.4)"
          animate={active ? { y: [0, 3, 0] } : { y: 0 }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </svg>

      {/* 飛沫（白い小ドットが上方向に弾ける） */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={`splash-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${10 + ((i * 71) % 80)}%`,
            top: `${40 + ((i * 17) % 30)}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: "white",
            boxShadow:
              "0 0 8px white, 0 0 14px rgba(0,240,255,0.7)",
          }}
          animate={
            active
              ? {
                  y: [0, -40 - (i % 4) * 10],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.4],
                }
              : { y: 0, opacity: 0 }
          }
          transition={{
            duration: 2 + (i % 3) * 0.4,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeOut",
          }}
        />
      ))}
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
