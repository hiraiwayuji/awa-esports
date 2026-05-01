"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { StaffMember } from "@/lib/data";

const accentMap = {
  cyan: {
    border: "border-neon-cyan/40",
    hoverShadow: "hover:shadow-neon",
    text: "text-neon-cyan",
    ring: "ring-neon-cyan",
    bg: "from-neon-cyan/20 to-transparent",
  },
  magenta: {
    border: "border-awa-magenta/50",
    hoverShadow: "hover:shadow-magenta",
    text: "text-awa-magenta",
    ring: "ring-awa-magenta",
    bg: "from-awa-magenta/20 to-transparent",
  },
  violet: {
    border: "border-awa-violet/50",
    hoverShadow: "hover:shadow-[0_0_24px_rgba(155,92,255,0.4)]",
    text: "text-awa-violet",
    ring: "ring-awa-violet",
    bg: "from-awa-violet/20 to-transparent",
  },
  warmth: {
    border: "border-awa-warmth/50",
    hoverShadow: "hover:shadow-warmth",
    text: "text-awa-warmth",
    ring: "ring-awa-warmth",
    bg: "from-awa-warmth/20 to-transparent",
  },
};

export default function MemberCard({
  member,
  index,
  onClick,
}: {
  member: StaffMember;
  index: number;
  onClick?: () => void;
}) {
  const a = accentMap[member.accent];
  const Icon = member.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`${member.name}の詳細を見る`}
        className={clsx(
          "relative h-full w-full text-left rounded-2xl border bg-awa-indigo-900/50 backdrop-blur-md p-6 overflow-hidden transition-shadow duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-awa-indigo-950",
          a.border,
          a.hoverShadow,
          a.ring,
        )}
      >
        {/* Cyber corner brackets */}
        {[
          "top-2 left-2 border-t-2 border-l-2",
          "top-2 right-2 border-t-2 border-r-2",
          "bottom-2 left-2 border-b-2 border-l-2",
          "bottom-2 right-2 border-b-2 border-r-2",
        ].map((c, i) => (
          <span
            key={i}
            className={clsx(
              "absolute w-4 h-4 transition-all duration-300",
              c,
              a.text,
            )}
          />
        ))}

        {/* Sweep gradient on hover */}
        <span
          className={clsx(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
            a.bg,
          )}
        />

        <div className="relative z-10 flex items-start justify-between mb-6">
          <span
            className={clsx(
              "text-[10px] font-display tracking-[0.3em]",
              a.text,
            )}
          >
            {member.id}
          </span>
          <span className={clsx("text-[10px] font-mono", "text-white/40")}>
            RANK / <span className={clsx("font-bold", a.text)}>{member.rank}</span>
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-5 mb-6">
          <div
            className={clsx(
              "relative w-16 h-16 grid place-items-center rounded-xl border",
              a.border,
              "bg-awa-indigo-950/80",
            )}
          >
            <Icon className={clsx("w-7 h-7", a.text)} />
            <span
              className={clsx(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow ring-2",
                a.ring,
              )}
            />
          </div>
          <div className="flex flex-col">
            <span className={clsx("text-[10px] tracking-[0.25em] font-display", a.text)}>
              {member.role}
            </span>
            <span className="text-xl md:text-2xl font-bold text-white mt-1">
              {member.name}
            </span>
            <span className="text-[11px] tracking-[0.2em] font-mono text-white/40 mt-1">
              CALLSIGN / {member.callsign}
            </span>
          </div>
        </div>

        <p className="relative z-10 text-sm text-white/70 leading-relaxed border-t border-white/10 pt-4">
          {member.tagline}
        </p>

        {/* Scan line on hover */}
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan-line transition-opacity duration-500" />
      </button>
    </motion.div>
  );
}
