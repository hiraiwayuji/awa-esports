"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Twitch, Youtube, Twitter, User } from "lucide-react";
import type { Player } from "@/lib/data";

export default function PlayerModal({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [player, onClose]);

  return (
    <AnimatePresence>
      {player && (
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
            className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-awa-magenta/60 bg-awa-indigo-900/95 backdrop-blur-xl shadow-[0_0_60px_rgba(255,45,149,0.35)]"
          >
            <PlayerModalContent player={player} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerModalContent({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const bio = player.bio;

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
          className={`absolute w-5 h-5 pointer-events-none text-awa-magenta ${c}`}
        />
      ))}

      <span className="absolute inset-0 pointer-events-none bg-gradient-to-br from-awa-magenta/10 to-transparent opacity-60" />

      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 grid place-items-center w-9 h-9 rounded-full border border-white/20 bg-awa-indigo-950/80 text-white/70 hover:text-white hover:border-white/50 transition"
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-[1] p-7 md:p-10">
        <div className="flex items-center justify-between mb-6 pr-12">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-awa-magenta animate-pulse shadow-[0_0_10px_rgba(255,45,149,0.9)]" />
            <span className="text-[10px] font-display tracking-[0.3em] text-awa-magenta">
              LEGEND PLAYER
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-white/30">
            TRANSMISSION_LIVE
          </span>
        </div>

        <div className="flex items-center gap-5 mb-7">
          <div className="relative w-28 h-28 grid place-items-center rounded-xl border border-awa-magenta/60 bg-awa-indigo-950/80 overflow-hidden shadow-[0_0_24px_rgba(255,45,149,0.35)]">
            {player.avatarUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)",
                  }}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-awa-magenta/20 via-transparent to-awa-violet/20" />
              </>
            ) : (
              <User className="w-10 h-10 text-awa-magenta" />
            )}
            {[
              "top-1 left-1 border-t border-l",
              "top-1 right-1 border-t border-r",
              "bottom-1 left-1 border-b border-l",
              "bottom-1 right-1 border-b border-r",
            ].map((c, idx) => (
              <span
                key={idx}
                className={`absolute w-2.5 h-2.5 pointer-events-none border-awa-magenta/80 ${c}`}
              />
            ))}
          </div>
          <div className="flex flex-col">
            {player.role && (
              <span className="text-[10px] tracking-[0.25em] font-display text-awa-magenta">
                {player.role}
              </span>
            )}
            <span className="text-2xl md:text-3xl font-black mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-awa-magenta to-awa-violet drop-shadow-[0_0_18px_rgba(255,45,149,0.35)]">
              {player.name}
            </span>
          </div>
        </div>

        {player.tagline && (
          <p className="text-sm text-white/70 leading-relaxed border-y border-white/10 py-4 mb-6">
            {player.tagline}
          </p>
        )}

        {bio ? (
          <div className="space-y-6">
            {bio.headline && (
              <p className="text-base md:text-lg font-bold leading-relaxed text-awa-magenta">
                {bio.headline}
              </p>
            )}

            {bio.paragraphs?.map((p, i) => (
              <p
                key={i}
                className="text-sm md:text-[15px] text-white/80 leading-relaxed"
              >
                {p}
              </p>
            ))}

            {bio.highlights && bio.highlights.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div className="text-[10px] tracking-[0.3em] font-display mb-3 text-awa-magenta">
                  HIGHLIGHTS
                </div>
                <ul className="space-y-2">
                  {bio.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/80"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-awa-magenta" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bio.message && (
              <motion.div
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.6,
                  delay: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-awa-magenta animate-pulse shadow-[0_0_8px_rgba(255,45,149,0.8)]" />
                  <div className="text-[10px] tracking-[0.3em] font-display text-awa-magenta">
                    MESSAGE FROM {player.name.toUpperCase()}
                  </div>
                </div>
                <blockquote className="relative pl-6 pr-2 py-1 border-l-2 border-awa-magenta/70">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                    animate={{ opacity: 0.6, scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute -top-3 -left-1 text-6xl text-awa-magenta leading-none font-serif select-none pointer-events-none drop-shadow-[0_0_14px_rgba(255,45,149,0.8)]"
                  >
                    “
                  </motion.span>
                  <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.022,
                          delayChildren: 0.85,
                        },
                      },
                    }}
                    className="text-sm md:text-[15px] text-white/90 leading-relaxed"
                  >
                    {bio.message.split("").map((ch, idx) => (
                      <motion.span
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, y: 4 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.22 }}
                        className="inline-block whitespace-pre"
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </motion.p>
                </blockquote>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="text-[10px] tracking-[0.4em] font-display mb-3 text-awa-magenta">
              COMING SOON
            </div>
            <p className="text-sm text-white/60">
              詳しいプロフィールは近日公開予定です。
            </p>
          </div>
        )}

        {player.socials &&
          (player.socials.twitch || player.socials.x || player.socials.youtube) && (
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3">
              {player.socials.twitch && (
                <a
                  href={player.socials.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display px-4 py-2 rounded-full border border-awa-violet/60 text-awa-violet transition hover:bg-awa-violet/10"
                >
                  <Twitch className="w-3.5 h-3.5" />
                  TWITCH →
                </a>
              )}
              {player.socials.x && (
                <a
                  href={player.socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display px-4 py-2 rounded-full border border-white/30 text-white/80 transition hover:bg-white/10"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  X →
                </a>
              )}
              {player.socials.youtube && (
                <a
                  href={player.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display px-4 py-2 rounded-full border border-awa-magenta/60 text-awa-magenta transition hover:bg-awa-magenta/10"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  YOUTUBE →
                </a>
              )}
            </div>
          )}
      </div>
    </>
  );
}
