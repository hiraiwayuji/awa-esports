"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Twitch, Youtube, Twitter, Instagram } from "lucide-react";
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
    ? "relative rounded-xl border border-awa-glow/30 bg-awa-indigo-900/50 backdrop-blur p-5 hover:border-awa-glow hover:shadow-[0_0_45px_rgba(255,45,149,0.45)] transition-all duration-500 overflow-hidden"
    : "relative rounded-xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-5 hover:border-neon-cyan/60 hover:shadow-neon transition-all duration-500 overflow-hidden";

  const accentText = isLegend ? "text-awa-glow" : "text-neon-cyan";
  const accentDotBg = isLegend ? "bg-awa-glow" : "bg-neon-cyan";
  const avatarBorder = isLegend ? "border-awa-glow/40" : "border-neon-cyan/30";
  const sweepVia = isLegend ? "via-awa-glow/25" : "via-neon-cyan/20";
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
              className={`absolute w-3 h-3 pointer-events-none border-awa-glow/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c}`}
            />
          ))}

        {/* Big background number for legend cards */}
        {isLegend && (
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 -right-2 font-display font-black text-[5.5rem] leading-none text-awa-glow/[0.08] select-none tracking-tighter"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
        )}

        <div className="relative flex items-start justify-between mb-3">
          <span className={`text-[9px] font-mono tracking-[0.25em] ${accentText}/70`}>
            {String(i + 1).padStart(3, "0")}
          </span>
          <div className="flex items-center gap-2">
            {isLegend && p.sponsors && p.sponsors.length > 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] font-display tracking-[0.15em] px-1.5 py-0.5 rounded border border-awa-glow-deep/60 text-awa-glow-deep bg-awa-indigo-950/60 shadow-[0_0_8px_rgba(255,170,80,0.35)]"
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
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
                isLegend ? "group-hover:scale-105" : "group-hover:opacity-0"
              }`}
            />
            {p.avatarUrlHover && !isLegend && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
            {p.avatarUrlHover && isLegend && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:scale-105"
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
            isLegend ? "text-awa-glow/80" : "text-white/40"
          }`}
        >
          {labelText}
        </div>

        {isLegend && p.stats && (
          <div className="mt-3 pt-3 border-t border-awa-glow/15 space-y-1">
            {([
              { label: "AGG", value: p.stats.aggression },
              { label: "PAT", value: p.stats.patience },
              { label: "TM", value: p.stats.teamwork },
              { label: "STR", value: p.stats.strategy },
            ].filter((s) => typeof s.value === "number") as {
              label: string;
              value: number;
            }[]).map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[8px] font-mono tracking-[0.2em] text-white/40 w-7">
                  {s.label}
                </span>
                <div className="flex-1 h-1 bg-awa-indigo-950/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-awa-glow to-awa-glow shadow-[0_0_4px_rgba(255,45,149,0.6)]"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-awa-glow/70 w-6 text-right">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {p.socials &&
          (p.socials.twitch ||
            p.socials.x ||
            p.socials.youtube ||
            p.socials.instagram) && (
            <div className="mt-3 flex items-center gap-2">
              {p.socials.twitch && (
                <a
                  href={p.socials.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${p.name} の Twitch`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-awa-glow/40 text-awa-glow hover:bg-awa-glow/10 hover:border-awa-glow transition-colors"
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
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-awa-glow/40 text-awa-glow hover:bg-awa-glow/10 hover:border-awa-glow transition-colors"
                >
                  <Youtube size={13} />
                </a>
              )}
              {p.socials.instagram && (
                <a
                  href={p.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${p.name} の Instagram`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-pink-400/50 text-pink-400 hover:bg-pink-400/10 hover:border-pink-400 transition-colors"
                >
                  <Instagram size={13} />
                </a>
              )}
            </div>
          )}

        {/* CTA on hover — legend + clickable only */}
        {isLegend && clickable && (
          <div className="absolute inset-x-0 bottom-0 px-5 py-2.5 bg-gradient-to-t from-awa-glow/40 via-awa-glow/15 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
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
          <div className="mt-14 relative">
            {/* Massive background watermark */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-0 right-0 select-none font-display font-black text-[18vw] md:text-[14vw] lg:text-[11rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
            >
              LEGEND
            </span>

            {/* Title block */}
            <div className="relative">
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-glow via-awa-glow to-awa-glow drop-shadow-[0_0_24px_rgba(255,45,149,0.5)]">
                  LEGEND PLAYERS
                </span>
              </h2>

              {/* HUD status bar */}
              <div className="mt-3 flex items-center gap-3 text-[10px] font-mono tracking-[0.25em] text-white/50 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                  <span>
                    ROSTER {String(legendPlayers.length).padStart(2, "0")}/∞
                  </span>
                </span>
                <span className="text-white/20">/</span>
                <span className="text-awa-glow">
                  STATUS: READY FOR BATTLE
                </span>
              </div>
            </div>

            {/* Cards — hover focus: dim sibling cards on hover */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 [&:hover>*:not(:hover)]:opacity-40 [&>*]:transition-opacity [&>*]:duration-300">
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
              <span className="h-px w-8 bg-awa-glow-deep" />
              <span className="text-xs font-display tracking-[0.35em] text-awa-glow-deep">
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

          {/* Team Uniform — teaser */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-neon-cyan" />
              <span className="text-xs font-display tracking-[0.35em] text-neon-cyan">
                TEAM UNIFORM / 公式ジャージ
              </span>
            </div>
            <div className="relative mx-auto max-w-3xl aspect-[4/3] rounded-xl overflow-hidden border border-neon-cyan/20 bg-awa-indigo-900/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uniforms/AWAKEN_GLOW_JERSEY.png"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-awa-indigo-950/70 via-awa-indigo-950/30 to-awa-indigo-950/80" />
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <span className="text-[10px] font-display tracking-[0.4em] text-neon-cyan/80">
                  OFFICIAL JERSEY
                </span>
                <span className="text-3xl sm:text-5xl font-display font-black tracking-[0.3em] text-white drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]">
                  COMING SOON
                </span>
                <span className="text-xs text-white/60 tracking-[0.25em]">
                  藍染 × ネオン — AWA GRIT
                </span>
              </div>
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
