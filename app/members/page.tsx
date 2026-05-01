"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import MemberCard from "@/components/MemberCard";
import MemberModal from "@/components/MemberModal";
import PageTransition from "@/components/PageTransition";
import { staff, players, type StaffMember } from "@/lib/data";

export default function MembersPage() {
  const [selected, setSelected] = useState<StaffMember | null>(null);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="MEMBERS / 仲間たち"
            title="阿波の旗印を、共に掲げる。"
            subtitle="代表、トレーナー、レジェンド、戦略家。徳島の各分野からプロフェッショナルが集結し、ひとつのチームとして世界を目指します。"
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
            title="ACTIVE PLAYERS"
            subtitle="現在、AWA ESPORTSの旗のもと公式戦・練習会で活動中のプレーヤー一覧。"
          />

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {players.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative"
              >
                <div className="relative rounded-xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-5 hover:border-neon-cyan/60 hover:shadow-neon transition-all duration-500 overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[9px] font-mono tracking-[0.25em] text-neon-cyan/70">
                      {String(i + 1).padStart(3, "0")}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white">
                    {p}
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.3em] font-display text-white/40">
                    PLAYER
                  </div>

                  {/* Sweep on hover */}
                  <span className="pointer-events-none absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent group-hover:left-full transition-all duration-700" />
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-white/40 tracking-[0.2em] font-display">
            ROSTER UPDATED 2026 / NEW MEMBERS WELCOME
          </p>
        </div>
      </section>

      <MemberModal member={selected} onClose={() => setSelected(null)} />
    </PageTransition>
  );
}
