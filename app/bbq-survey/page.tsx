"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import { newSubmissionId } from "@/lib/submission-id";

type Attendance = "lodging" | "bbq_only" | "absent";
type Gamecenter = "go" | "maybe" | "no" | "";

type FormState = {
  name: string;
  attendance: Attendance | "";
  gamecenter: Gamecenter;
  dogAllergy: boolean;
  memo: string;
};

const INITIAL: FormState = {
  name: "",
  attendance: "",
  gamecenter: "",
  dogAllergy: false,
  memo: "",
};

export default function BbqSurveyPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionId] = useState(newSubmissionId);

  const showFollowups = form.attendance === "lodging" || form.attendance === "bbq_only";
  const showDogNote = form.attendance === "lodging";

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!form.name.trim()) return false;
    if (!form.attendance) return false;
    return true;
  }, [form, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bbq-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, submissionId }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !json.ok) {
        setErrorMessage("送信に失敗しました。少し時間をおいて再度お試しください。");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setErrorMessage("送信に失敗しました。少し時間をおいて再度お試しください。");
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
            BBQ CAMP
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="11/7(土)-8(日) / BBQ合宿"
              title="BBQ CAMP 2026"
              subtitle={
                <>
                  11月7日・8日でBBQ＆宿泊の合宿を企画しました。
                  <br />
                  参加・不参加を教えてください。
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* INTRO / 詳細 */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-9 space-y-5 text-[15px] text-white/85 leading-relaxed">
            <div>
              <p className="text-xs tracking-[0.2em] text-awa-glow mb-2">
                11/7（土）BBQ＆宿泊
              </p>
              <ul className="space-y-1.5 text-white/80">
                <li>・15時頃からぼちぼち集合</li>
                <li>・ゲームのセッティングをしながら順次ゲーム開始</li>
                <li>・17時過ぎから、みんなで準備してBBQ開始</li>
                <li>・BBQは20人分＋2品＋焼きそば</li>
                <li>・飲み物は各自持参</li>
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] text-awa-glow mb-2">
                料金
              </p>
              <ul className="space-y-1.5 text-white/80">
                <li>・宿泊込み：1人7,600円</li>
                <li>・BBQのみ：1人4,000円</li>
                <li>・朝食なし</li>
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] text-awa-glow mb-2">
                宿泊について
              </p>
              <ul className="space-y-1.5 text-white/80">
                <li>・最大10名</li>
                <li>・10/15までに宿泊人数を確定します</li>
                <li>・施設にワンちゃんがいるため、犬アレルギーの方は注意してください</li>
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] text-awa-glow mb-2">
                11/8（日）
              </p>
              <ul className="space-y-1.5 text-white/80">
                <li>・13時チェックアウト</li>
                <li>・昼食後、行ける人はゲームセンター「えのき」へ</li>
              </ul>
            </div>
            <p className="text-white/60 text-sm pt-1">
              お名前は必ずご記入ください。内容に変更がある場合は、あとから運営（事務局）にLINE・Discordで連絡すれば反映できます。
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
                label="参加区分を教えてください"
                value={form.attendance}
                onChange={(v) => update("attendance", v as Attendance)}
                options={[
                  ["lodging", "宿泊＋BBQ参加（1人7,600円・朝食なし）"],
                  ["bbq_only", "BBQのみ参加（日帰り・1人4,000円）"],
                  ["absent", "参加できない"],
                ]}
              />

              {showDogNote && (
                <div>
                  <FieldLabel>
                    <span className="text-awa-glow mr-1.5">②</span>
                    犬アレルギーについて
                  </FieldLabel>
                  <p className="text-[11px] text-white/45 -mt-1 mb-2">
                    宿泊先の施設にワンちゃんがいます。当てはまる方はチェックしてください。
                  </p>
                  <CheckRow
                    checked={form.dogAllergy}
                    onChange={(v) => update("dogAllergy", v)}
                  >
                    犬アレルギーがある
                  </CheckRow>
                </div>
              )}

              {showFollowups && (
                <RadioGroup
                  num="③"
                  label="11/8（日）昼食後、ゲームセンター「えのき」に行きますか？"
                  value={form.gamecenter}
                  onChange={(v) => update("gamecenter", v as Gamecenter)}
                  options={[
                    ["go", "行く"],
                    ["maybe", "未定"],
                    ["no", "行かない"],
                  ]}
                  optional
                />
              )}

              <Field label="自由記入・連絡事項（任意）">
                <TextArea
                  value={form.memo}
                  onChange={(v) => update("memo", v)}
                  rows={3}
                  placeholder="到着予定の時間、飲み物の相談、その他運営に伝えたいことなど"
                />
              </Field>

              {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}

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
            回答ありがとうございました！
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            10/15までに宿泊人数を確定します。内容を変更したいときは運営にLINE・Discordで連絡してください。
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
  value,
  onChange,
  options,
  optional,
}: {
  num: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  optional?: boolean;
}) {
  return (
    <div>
      <FieldLabel>
        <span className="text-awa-glow mr-1.5">{num}</span>
        {label}
        {!optional && <span className="text-awa-glow ml-1">*</span>}
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
