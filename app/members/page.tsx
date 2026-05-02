"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Twitch, Youtube, Twitter } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import MemberCard from "@/components/MemberCard";
import MemberModal from "@/components/MemberModal";
import PlayerModal from "@/components/PlayerModal";
import PageTransition from "@/components/PageTransition";
import {
  staff,
  legendPlayers,
  traineePlayers,
  type Player,
  type StaffMember,
} from "@/lib/data";

function PlayerCard({
  p,
  i,
  onClick,
  variant = "trainee",
}: {
  p: Player;
  i: number;
  onClick?: () => void;
  variant?: "legend" | "trainee";
}) {
  const clickable = !!onClick && !!p.bio;
  const isLegend = variant === "legend";

  const containerClass = isLegend
    ? "relative rounded-xl border border-awa-magenta/30 bg-awa-indigo-900/50 backdrop-blur p-5 hover:border-awa-magenta hover:shadow-[0_0_45px_rgba(255,45,149,0.45)] transition-all duration-500 overflow-hidden"
    : "relative rounded-xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-5 hover:border-neon-cyan/60 hover:shadow-neon transition-all duration-500 overflow-hidden";

  const accentText = isLegend ? "text-awa-magenta" : "text-neon-cyan";
  const accentDotBg = isLegend ? "bg-awa-magenta" : "bg-neon-cyan";
  const avatarBorder = isLegend ? "border-awa-magenta/40" : "border-neon-cyan/30";
  const sweepVia = isLegend ? "via-awa-magenta/25" : "via-neon-cyan/20";
  const labelText = isLegend ? "LEGEND" : "TRAINEE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      whileHover={isLegend ? { y: -8, scale: 1.03 } : { y: -4 }}
      className="group relative"
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={clickable ? { cursor: "pointer" } : undefined}
    >
      <div className={containerClass}>
        {/* Cyber corner brackets — legend only, fade in on hover */}
        {isLegend &&
          [
            "top-2 left-2 border-t border-l",
            "top-2 right-2 border-t border-r",
            "bottom-2 left-2 border-b border-l",
            "bottom-2 right-2 border-b border-r",
          ].map((c, idx) => (
            <span
              key={idx}
              className={`absolute w-3 h-3 pointer-events-none border-awa-magenta/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c}`}
            />
          ))}

        <div className="flex items-start justify-between mb-3">
          <span className={`text-[9px] font-mono tracking-[0.25em] ${accentText}/70`}>
            {String(i + 1).padStart(3, "0")}
          </span>
          <div className="flex items-center gap-2">
            {isLegend && p.sponsors && p.sponsors.length > 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] font-display tracking-[0.15em] px-1.5 py-0.5 rounded border border-awa-warmth/60 text-awa-warmth bg-awa-indigo-950/60 shadow-[0_0_8px_rgba(255,170,80,0.35)]"
                title={`${p.sponsors.length}社の個人スポンサー`}
              >
                ★ {p.sponsors.length}
              </span>
            )}
            <span className={`w-2 h-2 rounded-full ${accentDotBg} animate-pulse`} />
          </div>
        </div>
        {p.avatarUrl && (
          <div
            className={`relative w-full aspect-square rounded-lg mb-3 border overflow-hidden ${avatarBorder}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.avatarUrl}
              alt={p.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isLegend ? "group-hover:scale-105" : "group-hover:opacity-0"
              }`}
            />
            {p.avatarUrlHover && !isLegend && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
            {p.avatarUrlHover && isLegend && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </div>
        )}
        <div
          className={`font-bold text-white ${
            isLegend ? "text-xl md:text-2xl" : "text-lg md:text-xl"
          }`}
        >
          {p.name}
        </div>
        <div
          className={`mt-1 text-[10px] tracking-[0.3em] font-display ${
            isLegend ? "text-awa-magenta/80" : "text-white/40"
          }`}
        >
          {labelText}
        </div>

        {p.socials && (p.socials.twitch || p.socials.x || p.socials.youtube) && (
          <div className="mt-3 flex items-center gap-2">
            {p.socials.twitch && (
              <a
                href={p.socials.twitch}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${p.name} の Twitch`}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-awa-violet/40 text-awa-violet hover:bg-awa-violet/10 hover:border-awa-violet transition-colors"
              >
                <Twitch size={13} />
              </a>
            )}
            {p.socials.x && (
              <a
                href={p.socials.x}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${p.name} の X`}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 transition-colors"
              >
                <Twitter size={13} />
              </a>
            )}
            {p.socials.youtube && (
              <a
                href={p.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${p.name} の YouTube`}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-awa-magenta/40 text-awa-magenta hover:bg-awa-magenta/10 hover:border-awa-magenta transition-colors"
              >
                <Youtube size={13} />
              </a>
            )}
          </div>
        )}

        {/* CTA on hover — legend + clickable only */}
        {isLegend && clickable && (
          <div className="absolute inset-x-0 bottom-0 px-5 py-2.5 bg-gradient-to-t from-awa-magenta/40 via-awa-magenta/15 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <span className="text-[10px] font-display tracking-[0.35em] text-white">
              VIEW PROFILE →
            </span>
          </div>
        )}

        {/* Sweep on hover */}
        <span
          className={`pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent ${sweepVia} to-transparent group-hover:left-full transition-all duration-700`}
        />
      </div>
    </motion.div>
  );
}

export default function MembersPage() {
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="MEMBERS / 仲間たち"
            title="阿波の旗印を、共に掲げる。"
            subtitle={
              <>
                代表、トレーナー、レジェンド、戦略家。
                <br />
                徳島の各分野からプロフェッショナルが集結し、ひとつのチームとして世界を目指します。
              </>
            }
          />
        </div>
      </section>

      {/* Staff cards */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((m, i) => (
              <MemberCard
                key={m.id}
                member={m}
                index={i}
                onClick={() => setSelected(m)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Roster */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ROSTER / 所属プレーヤー"
            title="PLAYERS"
            subtitle={
              <>
                徳島の旗を掲げる現役レジェンド陣と、
                <br />
                これからを担う練習生たち。
              </>
            }
          />

          {/* Legend Players */}
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-awa-magenta" />
              <span className="text-xs font-display tracking-[0.35em] text-awa-magenta">
                LEGEND PLAYERS / レジェンド
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {legendPlayers.map((p, i) => (
                <PlayerCard
                  key={p.name}
                  p={p}
                  i={i}
                  variant="legend"
                  onClick={() => setSelectedPlayer(p)}
                />
              ))}
            </div>
          </div>

          {/* Trainees */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-awa-warmth" />
              <span className="text-xs font-display tracking-[0.35em] text-awa-warmth">
                TRAINEES / 練習生
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {traineePlayers.map((p, i) => (
                <PlayerCard
                  key={p.name}
                  p={p}
                  i={i}
                  variant="trainee"
                  onClick={() => setSelectedPlayer(p)}
                />
              ))}
            </div>
          </div>

          <p className="mt-12 text-center text-xs text-white/40 tracking-[0.2em] font-display">
            ROSTER UPDATED 2026 / NEW MEMBERS WELCOME
          </p>
        </div>
      </section>

      <MemberModal member={selected} onClose={() => setSelected(null)} />
      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </PageTransition>
  );
}
