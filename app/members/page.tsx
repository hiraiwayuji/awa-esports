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
  specialThanks,
  legendPlayers,
  traineePlayers,
  type Player,
  type StaffMember,
} from "@/lib/data";

function PlayerCard({
  p,
  i,
  onClick,
}: {
  p: Player;
  i: number;
  onClick?: () => void;
}) {
  const clickable = !!onClick && !!p.bio;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ y: -4 }}
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
      <div className="relative rounded-xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-5 hover:border-neon-cyan/60 hover:shadow-neon transition-all duration-500 overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[9px] font-mono tracking-[0.25em] text-neon-cyan/70">
            {String(i + 1).padStart(3, "0")}
          </span>
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
        </div>
        {p.avatarUrl && (
          <div className="relative w-full aspect-square rounded-lg mb-3 border border-neon-cyan/30 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.avatarUrl}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
            />
            {p.avatarUrlHover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </div>
        )}
        <div className="text-lg md:text-xl font-bold text-white">{p.name}</div>
        <div className="mt-1 text-[10px] tracking-[0.3em] font-display text-white/40">
          PLAYER
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

        {/* Sweep on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent group-hover:left-full transition-all duration-700" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {legendPlayers.map((p, i) => (
                <PlayerCard
                  key={p.name}
                  p={p}
                  i={i}
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

      {/* Special Thanks */}
      <section className="relative pb-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="SPECIAL THANKS / 特別協力"
            title="外部から、旗を後押しする力。"
            subtitle={
              <>
                学術と業界の最前線から、AWA ESPORTS の立ち上げを支えてくれる
                <br />
                特別な協力者の方々。
              </>
            }
          />
          <div className="mt-14 mx-auto max-w-4xl grid sm:grid-cols-2 gap-6">
            {specialThanks.map((m, i) => (
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

      <MemberModal member={selected} onClose={() => setSelected(null)} />
      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </PageTransition>
  );
}
