import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import {
  upcomingEvents,
  monthlyPolicy,
  DIVISION_LABEL,
  formatDateJa,
} from "@/lib/schedule";

export const metadata = {
  title: "ACTIVITY SCHEDULE — AWAKEN GLOW",
  description:
    "AWAKEN GLOW の活動日・部門別スケジュール。ぷよぷよ部門・スト6部門の活動予定を掲載します。",
};

const divisionAccentClass: Record<string, string> = {
  magenta: "border-awa-glow/40 bg-awa-glow/10 text-awa-glow",
  cyan: "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan",
  violet: "border-white/30 bg-white/10 text-white",
};

export default function SchedulePage() {
  return (
    <PageTransition>
      <section className="relative pt-36 pb-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="SCHEDULE / 活動予定"
            title="ACTIVITY SCHEDULE"
            subtitle={
              <>
                AWAKEN GLOW の活動日と部門別スケジュール。
                <br />
                ぷよぷよ部門・スト6部門それぞれの予定を掲載します。
              </>
            }
          />
        </div>
      </section>

      {/* Monthly policy */}
      <section className="relative py-10">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="rounded-2xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur-md p-8 md:p-10">
            <div className="text-[10px] font-display tracking-[0.3em] text-neon-cyan mb-3">
              MONTHLY POLICY / 月次方針
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-bold">頻度</span>
                </div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  {monthlyPolicy.cadence}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-bold">部門の運用</span>
                </div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  {monthlyPolicy.pattern}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm font-bold">見学・お試し</span>
                </div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  {monthlyPolicy.observers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="relative py-10">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="text-[10px] font-display tracking-[0.3em] text-awa-glow mb-5">
            UPCOMING / 直近の活動予定
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-awa-indigo-900/30 p-8 text-center text-sm text-white/50">
              現在、確定済みの予定はありません。
              <br />
              次回開催はニュース欄でご案内します。
            </div>
          ) : (
            <ul className="space-y-4">
              {upcomingEvents.map((ev) => {
                const div = DIVISION_LABEL[ev.division];
                return (
                  <li
                    key={ev.id}
                    className="rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-display tracking-[0.2em] border ${
                              divisionAccentClass[div.accent] ??
                              divisionAccentClass.violet
                            }`}
                          >
                            {div.short}
                          </span>
                          <span className="text-xs text-white/50">
                            {div.long}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                          {ev.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-white/70">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-neon-cyan" />
                            {formatDateJa(ev.date)}
                          </span>
                          {ev.startTime !== "—" && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                              {ev.startTime}–{ev.endTime}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
                            {ev.venue}
                          </span>
                        </div>
                        {ev.note && (
                          <p className="text-xs text-white/55 leading-relaxed">
                            {ev.note}
                          </p>
                        )}
                      </div>
                      {(ev.link || ev.newsSlug) && (
                        <Link
                          href={ev.link ?? `/news/${ev.newsSlug}`}
                          className="shrink-0 text-[11px] font-display tracking-[0.3em] text-neon-cyan hover:text-awa-glow transition self-start"
                        >
                          {ev.linkLabel ?? "詳細 →"}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            活動に興味のある方は、まずは見学・お試し参加からどうぞ。
            <br />
            申込フォームから希望部門を選択してエントリーできます。
          </p>
          <Link
            href="/join"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-display tracking-[0.3em] text-xs uppercase bg-gradient-to-r from-awa-glow via-awa-glow to-neon-cyan text-white shadow-neon hover:scale-[1.02] transition-transform"
          >
            JOIN US →
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
