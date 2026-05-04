"use client";

import { motion } from "framer-motion";

/**
 * Partners ページ専用の地域背景デコ。
 * - 眉山シルエットの連山（SVG）
 * - 提灯のドット（点滅）
 * - 阿波踊りの法被ライン（流れる斜線）
 */
export default function AwaBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 提灯ドット */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 73) % 100}%`,
            top: `${10 + ((i * 37) % 60)}%`,
            width: 6 + (i % 3) * 3,
            height: 6 + (i % 3) * 3,
            background:
              i % 2 === 0
                ? "rgba(240, 185, 92, 0.45)"
                : "rgba(255, 45, 149, 0.35)",
            boxShadow:
              i % 2 === 0
                ? "0 0 18px rgba(240, 185, 92, 0.55)"
                : "0 0 18px rgba(255, 45, 149, 0.45)",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: i * 0.25,
          }}
        />
      ))}

      {/* 法被ライン（流れる斜線） */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern
              id="happi"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(60)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="#2DFFB7"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#happi)" />
        </svg>
      </div>

      {/* 眉山シルエット（連山）— ボトムに配置 */}
      <svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 inset-x-0 w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bizan1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#101B47" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#070B1F" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="bizan2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1B2A6B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#070B1F" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* 後景 */}
        <path
          d="M0,260 Q120,170 250,210 T520,200 T780,170 T1080,210 T1440,180 L1440,320 L0,320 Z"
          fill="url(#bizan2)"
        />
        {/* 中景 */}
        <path
          d="M0,290 Q180,210 360,250 T720,230 T1080,260 T1440,220 L1440,320 L0,320 Z"
          fill="url(#bizan1)"
        />
        {/* 前景の細線（眉山の稜線） */}
        <path
          d="M0,290 Q180,210 360,250 T720,230 T1080,260 T1440,220"
          fill="none"
          stroke="rgba(240, 185, 92, 0.18)"
          strokeWidth="1"
        />
      </svg>

      {/* 上から下へのフェード */}
      <div className="absolute inset-0 bg-gradient-to-b from-awa-indigo-950/50 via-transparent to-awa-indigo-950/80" />
    </div>
  );
}
