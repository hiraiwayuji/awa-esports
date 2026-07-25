"use client";

import type { ReactNode } from "react";

// 管理画面フォーム共通の小物。ダーク基調・省スペース。

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.15em] text-white/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-neon-cyan transition-colors"
      />
      {hint && <span className="text-[10px] text-white/35">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.15em] text-white/60">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-neon-cyan transition-colors resize-y"
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.15em] text-white/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-awa-indigo-950/60 px-3 py-2 text-sm text-white focus:border-neon-cyan transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-white/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-neon-cyan w-4 h-4"
      />
      {label}
    </label>
  );
}

export function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary:
      "border-neon-cyan bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20",
    ghost: "border-white/15 text-white/70 hover:border-white/40 hover:text-white",
    danger: "border-rose-400/50 text-rose-300 hover:bg-rose-500/10",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-display tracking-[0.1em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-awa-indigo-900/40 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">{eyebrow}</div>
      <h2 className="text-lg font-display font-black text-white mt-0.5">{title}</h2>
    </div>
  );
}

/** 判定バッジ（5段階） */
export function VerdictBadge({ verdict, large }: { verdict: string; large?: boolean }) {
  const map: Record<string, { label: string; cls: string }> = {
    green: { label: "緑：契約候補", cls: "border-emerald-400/60 text-emerald-300 bg-emerald-400/10" },
    yellow: { label: "黄：条件付きで検討可能", cls: "border-yellow-300/60 text-yellow-300 bg-yellow-300/10" },
    orange: { label: "橙：運営会議での審査が必要", cls: "border-orange-400/60 text-orange-300 bg-orange-400/10" },
    red: { label: "赤：契約不可", cls: "border-rose-400/60 text-rose-300 bg-rose-500/10" },
    gray: { label: "灰：情報不足・未確認", cls: "border-white/25 text-white/60 bg-white/5" },
  };
  const v = map[verdict] ?? map.gray;
  return (
    <span
      className={`inline-flex items-center rounded-full border font-display font-bold ${v.cls} ${
        large ? "px-5 py-2 text-sm tracking-[0.1em]" : "px-3 py-1 text-xs"
      }`}
    >
      {v.label}
    </span>
  );
}
