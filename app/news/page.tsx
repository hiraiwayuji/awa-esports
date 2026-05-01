"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";
import { Calendar, Flame, Newspaper, Trophy } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import { news, type NewsItem } from "@/lib/data";

const filters: { key: "ALL" | NewsItem["category"]; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "EVENT", label: "EVENT" },
  { key: "NEWS", label: "NEWS" },
  { key: "MATCH", label: "MATCH" },
];

const iconFor = (cat: NewsItem["category"]) =>
  cat === "EVENT" ? Flame : cat === "MATCH" ? Trophy : Newspaper;

const colorFor = (cat: NewsItem["category"]) =>
  cat === "EVENT"
    ? "text-awa-magenta border-awa-magenta/40"
    : cat === "MATCH"
      ? "text-awa-warmth border-awa-warmth/40"
      : "text-neon-cyan border-neon-cyan/40";

export default function NewsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("ALL");
  const list = filter === "ALL" ? news : news.filter((n) => n.category === filter);

  return (
    <PageTransition>
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="NEWS & EVENTS"
            title="最新の動きを、ここから。"
            subtitle={
              <>
                練習会、大会参戦、メディア出演。
                <br />
                AWA ESPORTSの全ての挑戦を、リアルタイムでお届けします。
              </>
            }
          />

          <div className="mt-10 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={clsx(
                  "px-4 py-2 text-xs font-display tracking-[0.25em] rounded-full border transition-all",
                  filter === f.key
                    ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-neon"
                    : "border-white/15 text-white/60 hover:text-white hover:border-white/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="space-y-4">
            {list.map((n, i) => {
              const Icon = iconFor(n.category);
              return (
                <motion.article
                  key={n.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  className="group relative rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8 hover:border-neon-cyan/40 transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-4 md:w-56">
                      <div
                        className={clsx(
                          "w-12 h-12 grid place-items-center rounded-lg border bg-awa-indigo-950/60",
                          colorFor(n.category),
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Calendar size={12} />
                          <time>{n.date}</time>
                        </div>
                        <span
                          className={clsx(
                            "mt-1 inline-block text-[10px] font-display tracking-[0.3em]",
                            colorFor(n.category),
                          )}
                        >
                          {n.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">
                        {n.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/60 leading-relaxed">
                        {n.excerpt}
                      </p>
                    </div>
                  </div>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-awa-magenta to-neon-cyan transition-all duration-500 group-hover:w-full" />
                </motion.article>
              );
            })}
          </div>

          {list.length === 0 && (
            <p className="text-center text-white/40 py-16">
              該当するニュースはまだありません。
            </p>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
