"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "neon" | "warm";
};

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "neon",
}: Props) {
  return (
    <div
      className={clsx(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={clsx(
            "inline-flex items-center gap-2 text-xs font-display tracking-[0.35em] mb-4",
            tone === "neon" ? "text-neon-cyan" : "text-awa-warmth",
          )}
        >
          <span
            className={clsx(
              "h-px w-8",
              tone === "neon" ? "bg-neon-cyan" : "bg-awa-warmth",
            )}
          />
          {eyebrow}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="font-display font-black text-3xl md:text-5xl leading-tight text-white"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-sm md:text-base text-white/70 leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
