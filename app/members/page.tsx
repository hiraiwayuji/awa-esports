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
  GAME_LABELS,
  type Player,
  type PlayerGame,
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
  variant?: "athlete" | "creator" | "trainee";
}) {
  const clickable = !!onClick && !!p.bio;
  const isFeatured = variant !== "trainee";
  const isAthlete = variant === "athlete";
  const isCreator = variant === "creator";

  const containerClass = isAthlete
    ? "relative rounded-xl border border-neon-cyan/40 bg-awa-indigo-900/50 backdrop-blur p-5 hover:border-neon-cyan hover:shadow-[0_0_45px_rgba(0,240,255,0.45)] transition-all duration-500 overflow-hidden"
    : isCreator
      ? "relative rounded-xl border border-awa-glow/30 bg-awa-indigo-900/50 backdrop-blur p-5 hover:border-awa-glow hover:shadow-[0_0_45px_rgba(255,45,149,0.45)] transition-all duration-500 overflow-hidden"
      : "relative rounded-xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-5 hover:border-neon-cyan/60 hover:shadow-neon transition-all duration-500 overflow-hidden";

  const accentText = isCreator ? "text-awa-glow" : "text-neon-cyan";
  const accentDotBg = isCreator ? "bg-awa-glow" : "bg-neon-cyan";
  const avatarBorder = isAthlete
    ? "border-neon-cyan/40"
    : isCreator
      ? "border-awa-glow/40"
      : "border-neon-cyan/30";
  const sweepVia = isCreator ? "via-awa-glow/25" : "via-neon-cyan/25";
  const labelText = isAthlete ? "ATHLETE" : isCreator ? "CREATOR" : "TRAINEE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      whileHover={isFeatured ? { y: -8, scale: 1.03 } : { y: -4 }}
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
        {/* S-rank badge — featured cards only, when rank === "S" */}
        {isFeatured && p.rank === "S" && (
          <span
            aria-label="Sランク"
            className="absolute -top-2.5 -right-2.5 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#FFE27A] via-[#FFC93A] to-[#D98E0A] text-awa-indigo-950 font-display font-black text-lg shadow-[0_0_18px_rgba(255,201,58,0.75)] border border-[#FFE27A]"
          >
            S
          </span>
        )}

        {/* Cyber corner brackets — featured only, fade in on hover */}
        {isFeatured &&
          [
            "top-2 left-2 border-t border-l",
            "top-2 right-2 border-t border-r",
            "bottom-2 left-2 border-b border-l",
            "bottom-2 right-2 border-b border-r",
          ].map((c, idx) => (
            <span
              key={idx}
              className={`absolute w-3 h-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isCreator ? "border-awa-glow/70" : "border-neon-cyan/70"
              } ${c}`}
            />
          ))}

        {/* Big background number for featured cards */}
        {isFeatured && (
          <span
            aria-hidden
            className={`pointer-events-none absolute -bottom-4 -right-2 font-display font-black text-[5.5rem] leading-none select-none tracking-tighter ${
              isCreator ? "text-awa-glow/[0.08]" : "text-neon-cyan/[0.08]"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
        )}

        <div className="relative flex items-start justify-between mb-3">
          <span className={`text-[9px] font-mono tracking-[0.25em] ${accentText}/70`}>
            {String(i + 1).padStart(3, "0")}
          </span>
          <div className="flex items-center gap-2">
            {isFeatured && p.sponsors && p.sponsors.length > 0 && (
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
        {p.avatarUrl ? (
          <div
            className={`relative w-full aspect-square rounded-lg mb-3 border overflow-hidden ${avatarBorder}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.avatarUrl}
              alt={p.name}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${
                isFeatured ? "group-hover:scale-105" : "group-hover:opacity-0"
              }`}
            />
            {p.avatarUrlHover && !isFeatured && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
            {p.avatarUrlHover && isFeatured && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrlHover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </div>
        ) : (
          <div
            className={`relative w-full aspect-square rounded-lg mb-3 border overflow-hidden ${avatarBorder} bg-gradient-to-br from-awa-indigo-950 via-awa-indigo-900 to-awa-indigo-800 grid place-items-center`}
            aria-label="写真は準備中"
          >
            {/* グリッド背景 */}
            <span
              aria-hidden
              className="absolute inset-0 bg-grid-cyber bg-[length:18px_18px] opacity-30"
            />
            {/* 走査線 */}
            <span
              aria-hidden
              className={`absolute inset-x-0 h-px ${isCreator ? "bg-awa-glow/40" : "bg-neon-cyan/40"} animate-scan-line`}
            />
            {/* イニシャル＋COMING SOON */}
            <div className="relative text-center px-2">
              <div
                className={`font-display font-black text-3xl md:text-4xl tracking-tight ${
                  isCreator ? "text-awa-glow/70" : "text-neon-cyan/70"
                }`}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div
                className={`mt-2 text-[9px] font-mono tracking-[0.25em] ${
                  isCreator ? "text-awa-glow/60" : "text-neon-cyan/60"
                }`}
              >
                COMING SOON
              </div>
            </div>
          </div>
        )}
        <div
          className={`font-bold text-white ${
            isFeatured ? "text-xl md:text-2xl" : "text-lg md:text-xl"
          }`}
        >
          {p.name}
        </div>
        <div
          className={`mt-1 text-[10px] tracking-[0.3em] font-display ${
            isFeatured
              ? isCreator
                ? "text-awa-glow/80"
                : "text-neon-cyan/80"
              : "text-white/40"
          }`}
        >
          {labelText}
        </div>

        {isFeatured && p.stats && (
          <div
            className={`mt-3 pt-3 border-t space-y-1 ${
              isCreator ? "border-awa-glow/15" : "border-neon-cyan/15"
            }`}
          >
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
                    className={
                      isCreator
                        ? "h-full bg-gradient-to-r from-awa-glow to-awa-glow shadow-[0_0_4px_rgba(255,45,149,0.6)]"
                        : "h-full bg-gradient-to-r from-neon-cyan to-neon-cyan shadow-[0_0_4px_rgba(0,240,255,0.6)]"
                    }
                    style={{ width: `${s.value}%` }}
                  />
                </div>
                <span
                  className={`text-[8px] font-mono w-6 text-right ${
                    isCreator ? "text-awa-glow/70" : "text-neon-cyan/70"
                  }`}
                >
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
                  className={
                    isAthlete
                      ? "inline-flex items-center justify-center w-7 h-7 rounded-md border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-colors"
                      : "inline-flex items-center justify-center w-7 h-7 rounded-md border border-awa-glow/40 text-awa-glow hover:bg-awa-glow/10 hover:border-awa-glow transition-colors"
                  }
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
                  className={
                    isAthlete
                      ? "inline-flex items-center justify-center w-7 h-7 rounded-md border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-colors"
                      : "inline-flex items-center justify-center w-7 h-7 rounded-md border border-awa-glow/40 text-awa-glow hover:bg-awa-glow/10 hover:border-awa-glow transition-colors"
                  }
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

        {/* CTA on hover — featured + clickable only */}
        {isFeatured && clickable && (
          <div
            className={`absolute inset-x-0 bottom-0 px-5 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ${
              isCreator
                ? "bg-gradient-to-t from-awa-glow/40 via-awa-glow/15 to-transparent"
                : "bg-gradient-to-t from-neon-cyan/40 via-neon-cyan/15 to-transparent"
            }`}
          >
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

  const athletes = legendPlayers.filter((p) => p.division === "athlete");
  const creators = legendPlayers.filter((p) => p.division === "creator");

  // アスリートをゲーム別にグループ化（順序は GAME_LABELS の定義順）
  const athleteGroups: Array<{ game: PlayerGame; players: Player[] }> = (
    Object.keys(GAME_LABELS) as PlayerGame[]
  )
    .map((game) => ({ game, players: athletes.filter((p) => p.game === game) }))
    .filter((g) => g.players.length > 0);

  // game未指定のathlete（フォールバック）も保持
  const ungroupedAthletes = athletes.filter((p) => !p.game);

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
                競技で勝ちにいくアスリート部門と、
                <br />
                配信・発信で広げるクリエイター部門。
              </>
            }
          />

          {/* Athletes */}
          <div className="mt-14 relative">
            {/* Massive background watermark */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-0 right-0 select-none font-display font-black text-[18vw] md:text-[14vw] lg:text-[11rem] leading-none tracking-tighter text-neon-cyan/[0.05] uppercase whitespace-nowrap overflow-hidden"
            >
              ATHLETES
            </span>

            {/* Title block */}
            <div className="relative">
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-neon-cyan to-neon-cyan drop-shadow-[0_0_24px_rgba(0,240,255,0.5)]">
                  ATHLETES
                </span>
                <span className="ml-3 text-sm md:text-base font-body font-bold text-white/70 align-middle">
                  / アスリート部門
                </span>
              </h2>
              <p className="mt-2 text-xs md:text-sm text-white/55 tracking-wide">
                競技で勝ちにいく、徳島の最前線。
              </p>

              {/* HUD status bar */}
              <div className="mt-3 flex items-center gap-3 text-[10px] font-mono tracking-[0.25em] text-white/50 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                  <span>ROSTER {String(athletes.length).padStart(2, "0")}/∞</span>
                </span>
                <span className="text-white/20">/</span>
                <span className="text-neon-cyan">STATUS: READY FOR BATTLE</span>
              </div>
            </div>

            {/* ゲーム別サブグループ */}
            <div className="mt-8 space-y-10">
              {athleteGroups.map(({ game, players }) => {
                const label = GAME_LABELS[game];
                return (
                  <div key={game}>
                    {/* サブヘッダー */}
                    <div className="flex items-end justify-between flex-wrap gap-2 mb-5 pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-display font-black text-lg md:text-2xl tracking-tight text-white">
                          {label.long}
                        </h3>
                        <p className="mt-1 text-[10px] md:text-xs text-white/55 tracking-wide">
                          {label.tagline}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.2em] text-neon-cyan/70">
                        {label.short} · {String(players.length).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 [&:hover>*:not(:hover)]:opacity-40 [&>*]:transition-opacity [&>*]:duration-300">
                      {players.map((p, i) => (
                        <PlayerCard
                          key={p.name}
                          p={p}
                          i={i}
                          variant="athlete"
                          onClick={() => setSelectedPlayer(p)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* ゲーム未分類フォールバック */}
              {ungroupedAthletes.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {ungroupedAthletes.map((p, i) => (
                    <PlayerCard
                      key={p.name}
                      p={p}
                      i={i}
                      variant="athlete"
                      onClick={() => setSelectedPlayer(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Creators */}
          <div className="mt-20 relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-0 right-0 select-none font-display font-black text-[18vw] md:text-[14vw] lg:text-[11rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
            >
              CREATORS
            </span>

            <div className="relative">
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-glow via-awa-glow to-awa-glow drop-shadow-[0_0_24px_rgba(255,45,149,0.5)]">
                  CREATORS
                </span>
                <span className="ml-3 text-sm md:text-base font-body font-bold text-white/70 align-middle">
                  / クリエイター部門
                </span>
              </h2>
              <p className="mt-2 text-xs md:text-sm text-white/55 tracking-wide">
                配信・発信で、徳島を広げる。
              </p>

              <div className="mt-3 flex items-center gap-3 text-[10px] font-mono tracking-[0.25em] text-white/50 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-awa-glow animate-pulse shadow-[0_0_6px_rgba(255,45,149,0.8)]" />
                  <span>ROSTER {String(creators.length).padStart(2, "0")}/∞</span>
                </span>
                <span className="text-white/20">/</span>
                <span className="text-awa-glow">STATUS: ON AIR</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 [&:hover>*:not(:hover)]:opacity-40 [&>*]:transition-opacity [&>*]:duration-300">
              {creators.map((p, i) => (
                <PlayerCard
                  key={p.name}
                  p={p}
                  i={i}
                  variant="creator"
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

          {/* Team Uniform — preview */}
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
                alt="AWAKEN GLOW 公式ジャージ（イメージ）"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded border border-neon-cyan/40 bg-awa-indigo-950/70 backdrop-blur text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                PREVIEW
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-white/50 tracking-[0.15em] font-display leading-relaxed">
              ※ 掲載画像はイメージです。
              <br className="sm:hidden" />
              デザイン・仕様は変更となる場合があります。
            </p>
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
