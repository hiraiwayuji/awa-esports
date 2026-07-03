"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "warm";
  className?: string;
  type?: "button" | "submit";
};

export default function NeonButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  type = "button",
}: Props) {
  const inner = (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "relative inline-flex items-center gap-3 px-7 py-3.5 font-display tracking-[0.25em] text-xs uppercase rounded-full overflow-hidden neon-border shine-sweep group",
        variant === "primary" &&
          "bg-awa-indigo-900/60 text-white hover:shadow-neon",
        variant === "ghost" && "bg-transparent text-neon-cyan",
        variant === "warm" &&
          "bg-awa-glow-deep/10 text-awa-glow-deep hover:shadow-glow border-awa-glow-deep/40",
        className,
      )}
    >
      <span
        className={clsx(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          variant === "warm"
            ? "bg-gradient-to-r from-awa-glow-deep/20 via-awa-glow/20 to-awa-glow-deep/20"
            : "bg-gradient-to-r from-awa-glow/30 via-awa-glow/30 to-neon-cyan/30",
        )}
      />
      <span className="relative z-10">{children}</span>
      <ArrowRight
        size={14}
        className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
      />
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} type={type} className="inline-block">
      {inner}
    </button>
  );
}
