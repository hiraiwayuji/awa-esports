"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { X } from "lucide-react";
import type { StaffMember } from "@/lib/data";

const accentMap = {
  cyan: {
    border: "border-neon-cyan/60",
    text: "text-neon-cyan",
    glow: "shadow-[0_0_60px_rgba(0,229,255,0.35)]",
    bg: "from-neon-cyan/10 to-transparent",
    bullet: "bg-neon-cyan",
  },
  magenta: {
    border: "border-awa-glow/60",
    text: "text-awa-glow",
    glow: "shadow-[0_0_60px_rgba(255,45,149,0.35)]",
    bg: "from-awa-glow/10 to-transparent",
    bullet: "bg-awa-glow",
  },
  violet: {
    border: "border-awa-glow/60",
    text: "text-awa-glow",
    glow: "shadow-[0_0_60px_rgba(155,92,255,0.35)]",
    bg: "from-awa-glow/10 to-transparent",
    bullet: "bg-awa-glow",
  },
  warmth: {
    border: "border-awa-glow-deep/60",
    text: "text-awa-glow-deep",
    glow: "shadow-[0_0_60px_rgba(255,170,80,0.35)]",
    bg: "from-awa-glow-deep/10 to-transparent",
    bullet: "bg-awa-glow-deep",
  },
};

export default function MemberModal({
  member,
  onClose,
}: {
  member: StaffMember | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!member) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-awa-indigo-950/85 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={clsx(
              "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border bg-awa-indigo-900/95 backdrop-blur-xl",
              accentMap[member.accent].border,
              accentMap[member.accent].glow,
            )}
          >
            <ModalContent member={member} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}) {
  const a = accentMap[member.accent];
  const Icon = member.icon;
  const bio = member.bio;

  return (
    <>
      {/* Cyber corner brackets */}
      {[
        "top-3 left-3 border-t-2 border-l-2",
        "top-3 right-3 border-t-2 border-r-2",
        "bottom-3 left-3 border-b-2 border-l-2",
        "bottom-3 right-3 border-b-2 border-r-2",
      ].map((c, i) => (
        <span
          key={i}
          className={clsx("absolute w-5 h-5 pointer-events-none", c, a.text)}
        />
      ))}

      {/* Sweep gradient */}
      <span
        className={clsx(
          "absolute inset-0 pointer-events-none bg-gradient-to-br opacity-60",
          a.bg,
        )}
      />

      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 grid place-items-center w-9 h-9 rounded-full border border-white/20 bg-awa-indigo-950/80 text-white/70 hover:text-white hover:border-white/50 transition"
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-[1] p-7 md:p-10">
        <div className="flex items-start justify-between mb-6 pr-12">
          <span
            className={clsx(
              "text-[10px] font-display tracking-[0.3em]",
              a.text,
            )}
          >
            {member.id}
          </span>
          <span className="text-[10px] font-mono text-white/40">
            RANK / <span className={clsx("font-bold", a.text)}>{member.rank}</span>
          </span>
        </div>

        <div className="flex items-center gap-5 mb-7">
          <div
            className={clsx(
              "relative w-24 h-24 grid place-items-center rounded-xl border bg-awa-indigo-950/80 overflow-hidden",
              a.border,
            )}
          >
            {member.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Icon className={clsx("w-10 h-10", a.text)} />
            )}
          </div>
          <div className="flex flex-col">
            <span
              className={clsx(
                "text-[10px] tracking-[0.25em] font-display",
                a.text,
              )}
            >
              {member.role}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-white mt-1">
              {member.name}
            </span>
            <span className="text-[11px] tracking-[0.2em] font-mono text-white/40 mt-1">
              CALLSIGN / {member.callsign}
            </span>
          </div>
        </div>

        <p className="text-sm text-white/70 leading-relaxed border-y border-white/10 py-4 mb-6">
          {member.tagline}
        </p>

        {bio ? (
          <div className="space-y-6">
            {bio.headline && (
              <p
                className={clsx(
                  "text-base md:text-lg font-bold leading-relaxed",
                  a.text,
                )}
              >
                {bio.headline}
              </p>
            )}

            {bio.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm md:text-[15px] text-white/80 leading-relaxed"
              >
                {p}
              </p>
            ))}

            {bio.highlights && bio.highlights.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div
                  className={clsx(
                    "text-[10px] tracking-[0.3em] font-display mb-3",
                    a.text,
                  )}
                >
                  HIGHLIGHTS
                </div>
                <ul className="space-y-2">
                  {bio.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/80"
                    >
                      <span
                        className={clsx(
                          "mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0",
                          a.bullet,
                        )}
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bio.links && bio.links.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                {bio.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      "text-xs tracking-[0.2em] font-display px-4 py-2 rounded-full border transition hover:bg-white/5",
                      a.border,
                      a.text,
                    )}
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div
              className={clsx(
                "text-[10px] tracking-[0.4em] font-display mb-3",
                a.text,
              )}
            >
              COMING SOON
            </div>
            <p className="text-sm text-white/60">
              詳しいプロフィールは近日公開予定です。
            </p>
          </div>
        )}
      </div>
    </>
  );
}
