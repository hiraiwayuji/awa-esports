"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";
import { Calendar, Flame, Newspaper, Trophy } from "lucide-react";
import type { NewsCategory, NewsItem } from "@/lib/news";

const filters: { key: "ALL" | NewsCategory; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "EVENT", label: "EVENT" },
  { key: "NEWS", label: "NEWS" },
  { key: "MATCH", label: "MATCH" },
];

const iconFor = (cat: NewsCategory) =>
  cat === "EVENT" ? Flame : cat === "MATCH" ? Trophy : Newspaper;

const colorFor = (cat: NewsCategory) =>
  cat === "EVENT"
    ? "text-awa-glow border-awa-glow/40"
    : cat === "MATCH"
      ? "text-awa-glow-deep border-awa-glow-deep/40"
      : "text-neon-cyan border-neon-cyan/40";

export default function NewsList({ items }: { items: NewsItem[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("ALL");
  const list =
    filter === "ALL" ? items : items.filter((n) => n.category === filter);

  return (
    <>
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

      <div className="mt-10 space-y-4">
        {list.map((n, i) => {
          const Icon = iconFor(n.category);
          return (
            <motion.div
              key={n.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: 4 }}
            >
              <Link
                href={`/news/${n.slug}`}
                className="group relative block rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8 hover:border-neon-cyan/40 transition-all duration-500"
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
                        <time>{n.displayDate}</time>
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
                <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-awa-glow to-neon-cyan transition-all duration-500 group-hover:w-full" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {list.length === 0 && (
        <p className="text-center text-white/40 py-16">
          該当するニュースはまだありません。
        </p>
      )}
    </>
  );
}
