"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Gamepad2, Users, Sparkles } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";

/**
 * 8/2 徳島練習会 参加者募集ページ。
 * 開催情報はこの EVENT にまとめています。時間・参加費など変更があれば
 * ここだけ直せば全体に反映されます。
 */
const EVENT = {
  dateLabel: "2026年8月2日（日）",
  timeLabel: "10:00〜18:00",
  venueLabel: "CyberSheeep 徳島中央校",
  venueNote:
    "アクセス・駐車場などの詳細は、お申込み後にご案内します。",
  mapUrl: "https://maps.app.goo.gl/MzpWD1ay764UUwz98",
  feeLabel: "1枠 2,000円／一日通し 3,000円（高校生以下は割引あり）",
  titlesLabel: "スト6・ロケットリーグ・オーバーウォッチ ほか",
};

/** 参加費（2部制・高校生以下は割引） */
const FEE = {
  rows: [
    { label: "1枠のみ（午前 or 午後）", adult: "2,000円", student: "1,000円" },
    { label: "一日通し（午前＋午後）", adult: "3,000円", student: "2,000円" },
  ],
  note: "「高校生以下」は高校生・中学生・小学生などが対象です。お支払いは当日、会場で承ります。",
};

/** 当日のタイムテーブル（2部制） */
const TIMETABLE = [
  {
    accent: "cyan" as const,
    time: "10:00 – 14:00",
    tag: "CASUAL",
    title: "みんなでワイワイ枠",
    lines: [
      "スト6以外を中心に、気軽に遊ぶ時間。",
      "ロケットリーグやオーバーウォッチを3人で協力プレイしたり、",
      "ハイスペックなゲーミングPCを思いっきり楽しもう！",
    ],
    foot: "ゲーム初心者・観戦だけでも大歓迎",
  },
  {
    accent: "magenta" as const,
    time: "14:00 – 18:00",
    tag: "SERIOUS",
    title: "スト6 ガチ対戦枠",
    lines: [
      "午後はストリートファイター6が中心。",
      "腕に自信のある猛者たちと、本気でプレイしたい人はこちら。",
    ],
    foot: "もちろん観戦・お試し対戦もOK",
  },
];

type AttendType = "first" | "again" | "watch";
type TimeSlot = "morning" | "afternoon" | "full";

/**
 * 参加時間帯の選択肢。ラベルは TIMETABLE / FEE と表記を揃えています。
 * note / fee は語の途中で折り返らないよう、意味のかたまりごとに分けて持ちます。
 */
const SLOT_OPTIONS: {
  value: TimeSlot;
  title: string;
  time: string;
  note: string;
  fee: string[];
}[] = [
  {
    value: "morning",
    title: "午前だけ参加",
    time: "10:00 – 14:00",
    note: "みんなでワイワイ枠",
    fee: ["1枠 2,000円", "高校生以下 1,000円"],
  },
  {
    value: "afternoon",
    title: "午後だけ参加",
    time: "14:00 – 18:00",
    note: "スト6 ガチ対戦枠",
    fee: ["1枠 2,000円", "高校生以下 1,000円"],
  },
  {
    value: "full",
    title: "一日通しで参加",
    time: "10:00 – 18:00",
    note: "午前＋午後",
    fee: ["3,000円", "高校生以下 2,000円"],
  },
];

const TITLE_OPTIONS = [
  "ストリートファイター6",
  "ロケットリーグ",
  "オーバーウォッチ",
  "ぷよぷよeスポーツ",
  "eFootball",
  "まだ決めていない・当日決める",
];

type FormState = {
  name: string;
  contact: string;
  attendType: AttendType | "";
  timeSlot: TimeSlot | "";
  titles: string[];
  titlesOther: string;
  isMinor: boolean;
  guardianConsent: boolean;
  message: string;
  photoNg: boolean;
};

const INITIAL: FormState = {
  name: "",
  contact: "",
  attendType: "",
  timeSlot: "",
  titles: [],
  titlesOther: "",
  isMinor: false,
  guardianConsent: false,
  message: "",
  photoNg: false,
};

export default function Event0802Page() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!form.name.trim()) return false;
    if (!form.contact.trim()) return false;
    if (!form.attendType) return false;
    if (!form.timeSlot) return false;
    if (form.isMinor && !form.guardianConsent) return false;
    return true;
  }, [form, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTitle(label: string) {
    setForm((prev) => ({
      ...prev,
      titles: prev.titles.includes(label)
        ? prev.titles.filter((t) => t !== label)
        : [...prev.titles, label],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/event-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventDate: "2026-08-02" }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !json.ok) {
        setErrorMessage(
          "送信に失敗しました。少し時間をおいて再度お試しください。",
        );
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setErrorMessage(
        "送信に失敗しました。少し時間をおいて再度お試しください。",
      );
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative pt-36 pb-8 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[17vw] md:text-[12vw] lg:text-[9rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            PRACTICE 8/2
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="EVENT / 8月2日 徳島練習会"
              title="AUGUST 2 MEETUP"
              subtitle={
                <>
                  次回の徳島練習会は 8月2日（日）。
                  <br />
                  初めての方も、観戦だけの方も大歓迎です。
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* EVENT DETAILS */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="rounded-2xl border border-neon-cyan/25 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9">
            <div className="text-[10px] font-display tracking-[0.3em] text-neon-cyan mb-5">
              EVENT INFO / 開催情報
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="開催日">
                {EVENT.dateLabel}
              </InfoRow>
              <InfoRow icon={<Clock className="w-4 h-4" />} label="時間">
                {EVENT.timeLabel}
              </InfoRow>
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="会場">
                {EVENT.venueLabel}
                <span className="block text-[11px] text-white/45 mt-0.5">
                  {EVENT.venueNote}
                </span>
                <a
                  href={EVENT.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-display tracking-[0.1em] text-neon-cyan hover:text-awa-glow transition mt-1.5"
                >
                  Googleマップで見る →
                </a>
              </InfoRow>
              <InfoRow icon={<Gamepad2 className="w-4 h-4" />} label="種目">
                {EVENT.titlesLabel}
              </InfoRow>
              <InfoRow icon={<Users className="w-4 h-4" />} label="対象">
                どなたでも（初参加・観戦のみOK／年齢不問）
              </InfoRow>
              <InfoRow icon={<Sparkles className="w-4 h-4" />} label="参加費">
                {EVENT.feeLabel}
              </InfoRow>
            </div>
          </div>
        </div>
      </section>

      {/* TIMETABLE */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="text-[10px] font-display tracking-[0.3em] text-awa-glow mb-5">
            TIMETABLE / 当日の流れ（2部制）
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TIMETABLE.map((b) => (
              <TimeBlock key={b.time} block={b} />
            ))}
          </div>
          <p className="text-[12px] text-white/50 leading-relaxed mt-4">
            どちらか片方だけの参加もOK。
            午前だけワイワイ遊びに来る／午後のスト6だけ参加する、も大歓迎です。
          </p>
        </div>
      </section>

      {/* PRICE */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="text-[10px] font-display tracking-[0.3em] text-neon-cyan mb-5">
            PRICE / 参加費
          </div>
          <div className="overflow-hidden rounded-2xl border border-neon-cyan/25 bg-awa-indigo-900/40 backdrop-blur-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="text-left font-medium px-5 py-3 text-xs tracking-[0.1em]">
                    参加区分
                  </th>
                  <th className="text-right font-medium px-5 py-3 text-xs tracking-[0.1em]">
                    一般
                  </th>
                  <th className="text-right font-medium px-5 py-3 text-xs tracking-[0.1em]">
                    高校生以下
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEE.rows.map((r) => (
                  <tr
                    key={r.label}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-5 py-3.5 text-white/85">{r.label}</td>
                    <td className="px-5 py-3.5 text-right font-display font-bold text-white">
                      {r.adult}
                    </td>
                    <td className="px-5 py-3.5 text-right font-display font-bold text-awa-glow">
                      {r.student}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-white/50 leading-relaxed mt-3">
            {FEE.note}
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-3 text-[15px] text-white/85 leading-relaxed">
            <p>
              AWAKEN GLOW の練習会は、勝ち負けだけでなく
              <span className="text-white/60">
                隣同士でワイワイ楽しむ
              </span>
              のが魅力です。
            </p>
            <p>
              午前はロケットリーグやオーバーウォッチをみんなで、
              午後はスト6でガチ対戦。
              「ゲームは好きだけど大会はまだ…」という方こそ、
              まずは気軽に遊びに来てください。
            </p>
            <p className="text-white/70 text-[13px] pt-3 mt-1 border-t border-white/10">
              下のフォームからお申込みいただくと、会場・持ち物など
              当日の詳しいご案内をお送りします。
            </p>
          </div>
        </div>
      </section>

      {done ? (
        <ThanksCard />
      ) : (
        <section className="relative pb-24">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <form
              onSubmit={onSubmit}
              className="grid gap-7 rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8"
            >
              <Field label="お名前 / プレイヤーネーム" required>
                <TextInput
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  placeholder="お名前またはプレイヤーネーム"
                  autoComplete="name"
                />
              </Field>

              <Field
                label="ご連絡先（LINE・メール・電話のいずれか）"
                required
              >
                <TextInput
                  value={form.contact}
                  onChange={(v) => update("contact", v)}
                  placeholder="例：LINE ID／メールアドレス／電話番号"
                />
                <span className="text-[11px] text-white/45 mt-1">
                  当日のご案内・変更連絡にのみ使用します。
                </span>
              </Field>

              <RadioGroup
                label="参加のかたち"
                value={form.attendType}
                onChange={(v) => update("attendType", v as AttendType)}
                options={[
                  ["first", "初めて参加する"],
                  ["again", "参加したことがある"],
                  ["watch", "観戦・見学だけしたい"],
                ]}
              />

              <div>
                <FieldLabel>
                  参加する時間帯
                  <span className="text-awa-glow ml-1">*</span>
                </FieldLabel>
                <p className="text-[11px] text-white/45 -mt-1 mb-2">
                  午前だけ・午後だけの参加もOKです。
                </p>
                <div className="grid gap-2.5">
                  {SLOT_OPTIONS.map((s) => (
                    <SlotRow
                      key={s.value}
                      option={s}
                      active={form.timeSlot === s.value}
                      onSelect={() => update("timeSlot", s.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>プレイしたいタイトル（いくつでも・任意）</FieldLabel>
                <div className="grid gap-2.5 mt-1 sm:grid-cols-2">
                  {TITLE_OPTIONS.map((label) => (
                    <CheckRow
                      key={label}
                      checked={form.titles.includes(label)}
                      onChange={() => toggleTitle(label)}
                    >
                      {label}
                    </CheckRow>
                  ))}
                </div>
                <div className="mt-3">
                  <TextInput
                    value={form.titlesOther}
                    onChange={(v) => update("titlesOther", v)}
                    placeholder="その他のタイトル（自由記入）"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-awa-indigo-950/50 p-5 space-y-3">
                <CheckRow
                  checked={form.isMinor}
                  onChange={(v) => {
                    update("isMinor", v);
                    if (!v) update("guardianConsent", false);
                  }}
                >
                  参加者は18歳未満です
                </CheckRow>
                {form.isMinor && (
                  <div className="pl-1 border-l-2 border-awa-glow/40 ml-1">
                    <CheckRow
                      checked={form.guardianConsent}
                      onChange={(v) => update("guardianConsent", v)}
                    >
                      保護者の同意を得たうえで参加します。
                      <span className="text-awa-glow ml-1">*</span>
                    </CheckRow>
                  </div>
                )}
              </div>

              <Field label="ひとこと・ご質問（任意）">
                <TextArea
                  value={form.message}
                  onChange={(v) => update("message", v)}
                  rows={3}
                  placeholder="はじめてで不安なこと、聞きたいことなど、何でもどうぞ。"
                />
              </Field>

              <div>
                <FieldLabel>写真の掲載について</FieldLabel>
                <p className="text-[11px] text-white/45 -mt-1 mb-2">
                  練習会の写真を SNS・公式サイトに掲載することがあります。
                  掲載してほしくない方はチェックしてください（チェックがなければ掲載OKとします）。
                </p>
                <CheckRow
                  checked={form.photoNg}
                  onChange={(v) => update("photoNg", v)}
                >
                  自分が写った写真の掲載はNG（SNS・HPに載せないでほしい）
                </CheckRow>
              </div>

              {errorMessage && (
                <p className="text-sm text-rose-300">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 disabled:cursor-not-allowed text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition-all shadow-[0_0_24px_rgba(45,255,183,0.15)] hover:shadow-[0_0_28px_rgba(45,255,183,0.35)]"
              >
                {submitting ? "送信中…" : "8/2 練習会に申し込む"}
              </button>

              <p className="text-[11px] text-white/40 text-center">
                申込内容は AWAKEN GLOW 運営が責任をもって管理し、
                当日のご案内以外には使用しません。
              </p>
            </form>
          </div>
        </section>
      )}
    </PageTransition>
  );
}

function TimeBlock({
  block,
}: {
  block: {
    accent: "cyan" | "magenta";
    time: string;
    tag: string;
    title: string;
    lines: string[];
    foot: string;
  };
}) {
  const cyan = block.accent === "cyan";
  const border = cyan ? "border-neon-cyan/40" : "border-awa-glow/40";
  const glow = cyan
    ? "from-neon-cyan/[0.10] to-transparent"
    : "from-awa-glow/[0.10] to-transparent";
  const accentText = cyan ? "text-neon-cyan" : "text-awa-glow";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${glow} bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-7`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-display font-black text-lg ${accentText}`}>
          {block.time}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-display tracking-[0.2em] border ${border} ${accentText}`}
        >
          {block.tag}
        </span>
      </div>
      <h3 className="text-xl font-bold text-white mt-3">{block.title}</h3>
      <div className="mt-3 space-y-1 text-sm text-white/80 leading-relaxed">
        {block.lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      <p className={`mt-4 text-[12px] ${accentText}`}>{block.foot}</p>
    </div>
  );
}

function SlotRow({
  option,
  active,
  onSelect,
}: {
  option: (typeof SLOT_OPTIONS)[number];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
        active
          ? "border-neon-cyan bg-neon-cyan/10 shadow-[0_0_0_3px_rgba(0,240,255,0.12)]"
          : "border-white/15 bg-awa-indigo-950/60 hover:border-white/30"
      }`}
    >
      <input
        type="radio"
        name="timeSlot"
        checked={active}
        onChange={onSelect}
        className="mt-1 w-4 h-4 accent-neon-cyan cursor-pointer shrink-0"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span
            className={`text-sm ${active ? "text-white" : "text-white/80"}`}
          >
            {option.title}
          </span>
          <span
            className={`font-display font-bold text-[13px] ${
              active ? "text-neon-cyan" : "text-white/50"
            }`}
          >
            {option.time}
          </span>
        </span>
        <span className="flex flex-wrap gap-x-2 text-[11px] text-white/45 mt-0.5 leading-relaxed">
          <span className="whitespace-nowrap">{option.note}</span>
          {option.fee.map((f) => (
            <span key={f} className="whitespace-nowrap">
              {f}
            </span>
          ))}
        </span>
      </span>
    </label>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-neon-cyan shrink-0">{icon}</span>
      <div>
        <div className="text-[10px] font-display tracking-[0.2em] text-white/50">
          {label}
        </div>
        <div className="text-sm text-white/90 leading-relaxed mt-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

function ThanksCard() {
  return (
    <section className="relative pb-32">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="rounded-2xl border border-awa-glow/40 bg-gradient-to-br from-awa-glow/[0.08] via-awa-indigo-900/40 to-neon-cyan/[0.05] backdrop-blur-md p-8 md:p-10 text-center space-y-5">
          <div className="text-[11px] font-display tracking-[0.4em] text-awa-glow">
            ENTRY RECEIVED
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            8/2 練習会のお申込みありがとうございます！
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            会場・持ち物など当日の詳しいご案内を、
            <br />
            いただいた連絡先へお送りします。当日お会いできるのを楽しみにしています！
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block rounded-full border border-neon-cyan/60 text-neon-cyan px-5 py-2 text-xs tracking-[0.25em] font-display hover:bg-neon-cyan/10 transition"
            >
              トップへ戻る →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs tracking-[0.15em] text-white/70 mb-2">
      {children}
    </span>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs tracking-[0.15em] text-white/70">
        {label}
        {required && <span className="text-awa-glow ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <FieldLabel>
        {label}
        <span className="text-awa-glow ml-1">*</span>
      </FieldLabel>
      <div className="grid gap-2.5">
        {options.map(([val, text]) => {
          const active = value === val;
          return (
            <label
              key={val}
              className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm cursor-pointer transition ${
                active
                  ? "border-neon-cyan bg-neon-cyan/10 text-white shadow-[0_0_0_3px_rgba(0,240,255,0.12)]"
                  : "border-white/15 bg-awa-indigo-950/60 text-white/80 hover:border-white/30"
              }`}
            >
              <input
                type="radio"
                name={label}
                checked={active}
                onChange={() => onChange(val)}
                className="w-4 h-4 accent-neon-cyan cursor-pointer"
              />
              <span>{text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition resize-y"
    />
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border px-4 py-2.5 text-sm cursor-pointer transition ${
        checked
          ? "border-awa-glow bg-awa-glow/10 text-white"
          : "border-white/15 bg-awa-indigo-950/60 text-white/80 hover:border-white/30"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-awa-glow cursor-pointer"
      />
      <span className="leading-relaxed">{children}</span>
    </label>
  );
}
