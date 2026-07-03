"use client";

import { useEffect, useRef } from "react";

/**
 * マウス位置に追従する薄いシアンのスポットライト。
 * CSS変数 --mx / --my を直接更新するので再レンダーは発生しない。
 * タッチ端末ではマウスイベントが来ないため実質無効（中央の淡い光のみ）。
 */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden />;
}
