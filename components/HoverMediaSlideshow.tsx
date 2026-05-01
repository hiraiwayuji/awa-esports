"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type Media =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string };

type Props = {
  media: Media[];
  active: boolean;
  /** 切替間隔(ms) */
  interval?: number;
  /** ホバー時の最大不透明度 (0〜1) */
  maxOpacity?: number;
  /** フォールバック表示用カラー（active時の薄いオーバーレイ） */
  fallbackColor?: string;
};

/**
 * カードの背景に、ホバー時だけメディアをクロスフェードで流す。
 * - 画像 / 動画どちらにも対応
 * - 配列が空ならグラデーション + ノイズSVGのフォールバック演出
 * - メディアは active=true の間だけ次々切り替わる
 */
export default function HoverMediaSlideshow({
  media,
  active,
  interval = 3000,
  maxOpacity = 0.35,
  fallbackColor = "#FF2D95",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || media.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % media.length);
    }, interval);
    return () => clearInterval(t);
  }, [active, media.length, interval]);

  // 非ホバー時は0、ホバー時は maxOpacity
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: active ? maxOpacity : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {media.length > 0 ? (
          <AnimatePresence mode="sync">
            {media.map((m, i) =>
              i === index ? (
                <motion.div
                  key={m.src + i}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1.02 }}
                  exit={{ opacity: 0, scale: 1.0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  {m.type === "image" ? (
                    <img
                      src={m.src}
                      alt={m.alt ?? ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <video
                      src={m.src}
                      poster={m.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              ) : null,
            )}
          </AnimatePresence>
        ) : (
          // フォールバック演出（素材未投入時）
          <FallbackPattern color={fallbackColor} />
        )}

        {/* 上に色味グラデーションを重ねて読みやすさ確保 */}
        <div className="absolute inset-0 bg-gradient-to-b from-awa-indigo-950/30 via-awa-indigo-950/40 to-awa-indigo-950/70" />
      </motion.div>
    </div>
  );
}

function FallbackPattern({ color }: { color: string }) {
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${color}55, transparent 60%), radial-gradient(ellipse at 70% 70%, #00F0FF44, transparent 60%)`,
        }}
      />
      <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
        <defs>
          <pattern
            id="hatch"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke={color} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hatch)" />
      </svg>
    </div>
  );
}
