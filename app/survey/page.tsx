"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";

type Practice = "more" | "keep" | "less" | "either";
type Gachi = "want" | "monthly" | "enough" | "no";
type Ops = "want" | "maybe" | "no";
type Registration = "want" | "considering" | "trial" | "no";

const EVENT_OPTIONS = [
  "大会・トーナメント出場",
  "他チームとの交流戦・対抗戦",
  "チーム内のオフ会・交流イベント",
  "配信・観戦イベント",
  "徳島の地域イベント・出展",
  "初心者向けの体験会・練習会",
];

type FormState = {
  name: string;
  practiceDays: Practice | "";
  practiceWish: string;
  gachiDays: Gachi | "";
  ops: Ops | "";
  opsDetail: string;
  registration: Registration | "";
  events: string[];
  eventsOther: string;
  expectations: string;
};

const INITIAL: FormState = {
  name: "",
  practiceDays: "",
  practiceWish: "",
  gachiDays: "",
  ops: "",
  opsDetail: "",
  registration: "",
  events: [],
  eventsOther: "",
  expectations: "",
};

export default function SurveyPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!form.name.trim()) return false;
    if (!form.practiceDays) return false;
    if (!form.gachiDays) return false;
    if (!form.ops) return false;
    if (!form.registration) return false;
    return true;
  }, [form, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleEvent(label: string) {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(label)
        ? prev.events.filter((e) => e !== label)
        : [...prev.events, label],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[16vw] md:text-[12vw] lg:text-[9rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            TEAM SURVEY
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="MEMBERS / 選手アンケート"
              title="TEAM SURVEY"
              subtitle={
                <>
                  これからのチームづくりの参考にさせてください。
                  <br />
                  みんなの今の気持ちを聞かせてください（3分ほど）。
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-3 text-[15px] text-white/85 leading-relaxed">
            <p>
              いつも AWAKEN GLOW を盛り上げてくれてありがとうございます。
            </p>
            <p>
              練習やイベント、これからの活動について、
              みんなの本音を教えてください。
              <span className="text-white/60">
                お名前は必ずご記入ください。
              </span>
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
                  placeholder="お名前またはプレイヤーネームを入力"
                />
              </Field>

              <RadioGroup
                num="①"
                label="普段の練習日（みんなで集まる練習会）を増やしたいですか？"
                value={form.practiceDays}
                onChange={(v) => update("practiceDays", v as Practice)}
                options={[
                  ["more", "もっと増やしてほしい"],
                  ["keep", "今くらいがちょうどいい"],
                  ["less", "少し減らしてもいい"],
                  ["either", "参加できる範囲で・どちらでもない"],
                ]}
              />

              <Field label="増やすとしたら、希望の曜日・時間帯・頻度（任意）">
                <TextArea
                  value={form.practiceWish}
                  onChange={(v) => update("practiceWish", v)}
                  rows={2}
                  placeholder="例：平日夜が出やすい／土日の昼／週2回くらい"
                />
              </Field>

              <RadioGroup
                num="②"
                label="ガチ練習日（勝ちにこだわる真剣な競技練習）を増やしたいですか？"
                value={form.gachiDays}
                onChange={(v) => update("gachiDays", v as Gachi)}
                options={[
                  ["want", "ぜひ増やしてほしい"],
                  ["monthly", "月1〜2回ならほしい"],
                  ["enough", "今は普段の練習で十分"],
                  ["no", "興味はない"],
                ]}
              />

              <RadioGroup
                num="③"
                label="チームの運営に携わってみたいですか？"
                help="大会の準備、SNS発信、イベント企画、新メンバーのサポートなど"
                value={form.ops}
                onChange={(v) => update("ops", v as Ops)}
                options={[
                  ["want", "携わってみたい"],
                  ["maybe", "内容によっては手伝いたい"],
                  ["no", "今は遠慮しておきたい"],
                ]}
              />

              <Field label="やってみたい役割・手伝えそうなこと（任意）">
                <TextArea
                  value={form.opsDetail}
                  onChange={(v) => update("opsDetail", v)}
                  rows={2}
                />
              </Field>

              <RadioGroup
                num="④"
                label="正式な選手登録を希望しますか？"
                help="AWAKEN GLOW の正式所属選手として登録するかどうかです。"
                value={form.registration}
                onChange={(v) => update("registration", v as Registration)}
                options={[
                  ["want", "希望する"],
                  ["considering", "検討中・くわしく話を聞きたい"],
                  ["trial", "今は見学・お試しで続けたい"],
                  ["no", "希望しない"],
                ]}
              />

              <div>
                <FieldLabel>
                  <span className="text-awa-glow mr-1.5">⑤</span>
                  どんなイベントを期待しますか？（いくつでも）
                </FieldLabel>
                <div className="grid gap-2.5 mt-1">
                  {EVENT_OPTIONS.map((label) => (
                    <CheckRow
                      key={label}
                      checked={form.events.includes(label)}
                      onChange={() => toggleEvent(label)}
                    >
                      {label}
                    </CheckRow>
                  ))}
                </div>
                <div className="mt-3">
                  <TextInput
                    value={form.eventsOther}
                    onChange={(v) => update("eventsOther", v)}
                    placeholder="その他（自由記入）"
                  />
                </div>
              </div>

              <Field label="⑥ 今後のチームへの期待・要望（任意）">
                <TextArea
                  value={form.expectations}
                  onChange={(v) => update("expectations", v)}
                  rows={4}
                  placeholder="ポジティブなことも、こうしてほしいという要望も大歓迎です。"
                />
              </Field>

              {errorMessage && (
                <p className="text-sm text-rose-300">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 disabled:cursor-not-allowed text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition-all shadow-[0_0_24px_rgba(45,255,183,0.15)] hover:shadow-[0_0_28px_rgba(45,255,183,0.35)]"
              >
                {submitting ? "送信中…" : "アンケートを送信する"}
              </button>
            </form>
          </div>
        </section>
      )}
    </PageTransition>
  );
}

function ThanksCard() {
  return (
    <section className="relative pb-32">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="rounded-2xl border border-awa-glow/40 bg-gradient-to-br from-awa-glow/[0.08] via-awa-indigo-900/40 to-neon-cyan/[0.05] backdrop-blur-md p-8 md:p-10 text-center space-y-5">
          <div className="text-[11px] font-display tracking-[0.4em] text-awa-glow">
            THANK YOU
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            アンケートのご協力ありがとうございました！
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            みんなの声をこれからのチームづくりに活かします。
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
  num,
  label,
  help,
  value,
  onChange,
  options,
}: {
  num: string;
  label: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <FieldLabel>
        <span className="text-awa-glow mr-1.5">{num}</span>
        {label}
        <span className="text-awa-glow ml-1">*</span>
      </FieldLabel>
      {help && <p className="text-[11px] text-white/45 -mt-1 mb-2">{help}</p>}
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
