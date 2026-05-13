"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import { partnerCompanies, type PartnerCompany } from "@/lib/data";

type Props = {
  variant?: "home" | "page";
};

function PartnerCard({ p, index }: { p: PartnerCompany; index: number }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group h-full rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur p-6 hover:border-neon-cyan/40 transition-all duration-500"
    >
      <div className="relative aspect-[16/9] mb-5 overflow-hidden rounded-lg">
        {p.logoUrl ? (
          <Image
            src={p.logoUrl}
            alt={p.name}
            fill
            sizes="(min-width: 768px) 22vw, 45vw"
            className={
              p.invertOnDark
                ? "object-contain p-3 [filter:invert(1)_hue-rotate(180deg)_brightness(1.05)]"
                : "object-contain p-3"
            }
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-black text-lg md:text-xl tracking-[0.25em] text-white/70 text-center leading-tight">
              {p.label}
            </span>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 pt-4">
        <div className="text-sm font-bold text-white/85">{p.name}</div>
        {p.memberNote && (
          <div className="mt-1 text-[11px] tracking-[0.15em] text-white/40">
            {p.memberNote}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (p.instagramUrl) {
    return (
      <a
        href={p.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${p.name} Instagram`}
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return <div className="h-full">{inner}</div>;
}

export default function PartnersStrip({ variant = "home" }: Props) {
  return (
    <section className={variant === "home" ? "relative py-24" : "relative py-20"}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionTitle
          eyebrow="SUPPORTED BY"
          title={
            <>
              メンバーの事業が、
              <br className="hidden md:block" />
              チームを支えている。
            </>
          }
          subtitle={
            <>
              AWAKEN GLOWは、徳島で実際に汗をかいて働くメンバーの事業に支えられています。
              <br />
              地域に根を張る仲間と、一緒に育っていくチームでありたい。
            </>
          }
          tone="warm"
        />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {partnerCompanies.map((p, i) => (
            <PartnerCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
