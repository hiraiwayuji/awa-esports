"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import {
  TRAINEE_AGREEMENT_VERSION,
  TRAINEE_AGREEMENT_TEXT,
} from "@/lib/legal-text";

type FormState = {
  playerName: string;
  realName: string;
  email: string;
  discordId: string;
  birthdate: string;
  age: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  mainGame: string;
  joinReason: string;
  agreementCheck: boolean;
  privacyCheck: boolean;
  guardianCheck: boolean;
};

const INITIAL: FormState = {
  playerName: "",
  realName: "",
  email: "",
  discordId: "",
  birthdate: "",
  age: "",
  phone: "",
  address: "",
  guardianName: "",
  guardianContact: "",
  mainGame: "",
  joinReason: "",
  agreementCheck: false,
  privacyCheck: false,
  guardianCheck: false,
};

export default function TraineeEntryPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const age = Number.parseInt(form.age, 10);
  const isMinor = Number.isFinite(age) && age < 18;

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!form.playerName.trim()) return false;
    if (!form.realName.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return false;
    if (!form.birthdate.trim()) return false;
    if (!Number.isFinite(age) || age < 1) return false;
    if (!form.phone.trim()) return false;
    if (!form.mainGame.trim()) return false;
    if (!form.joinReason.trim()) return false;
    if (!form.agreementCheck) return false;
    if (!form.privacyCheck) return false;
    if (isMinor) {
      if (!form.guardianName.trim()) return false;
      if (!form.guardianContact.trim()) return false;
      if (!form.guardianCheck) return false;
    }
    return true;
  }, [form, age, isMinor, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/trainee-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age,
        }),
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
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[18vw] md:text-[13vw] lg:text-[10rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            TRAINEE ENTRY
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="JOIN / 練習生登録"
              title="TRAINEE ENTRY"
              subtitle={
                <>
                  AWAKEN GLOW の練習生として、
                  <br />
                  まずはコミュニティ活動への参加からスタート。
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
              AWAKEN GLOW の練習生として参加を希望する方は、
              <Link
                href="/legal/team-rule"
                className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
              >
                チーム規約
              </Link>
              を確認のうえ、必要事項を入力してください。
            </p>
            <p>
              練習生は、まずコミュニティ活動への参加からスタートします。
              <span className="text-white/60">正式な選手登録ではありません。</span>
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
              className="grid gap-5 rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8"
            >
              <FieldGrid>
                <Field label="プレイヤーネーム" required>
                  <TextInput
                    value={form.playerName}
                    onChange={(v) => update("playerName", v)}
                    autoComplete="nickname"
                  />
                </Field>
                <Field label="本名" required>
                  <TextInput
                    value={form.realName}
                    onChange={(v) => update("realName", v)}
                    autoComplete="name"
                  />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="メールアドレス" required>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Discord ID">
                  <TextInput
                    value={form.discordId}
                    onChange={(v) => update("discordId", v)}
                    placeholder="例：awaken_glow#1234"
                  />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="生年月日" required>
                  <TextInput
                    type="date"
                    value={form.birthdate}
                    onChange={(v) => update("birthdate", v)}
                  />
                </Field>
                <Field label="年齢" required>
                  <TextInput
                    type="number"
                    value={form.age}
                    onChange={(v) => update("age", v)}
                    min={1}
                    max={120}
                  />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="電話番号" required>
                  <TextInput
                    type="tel"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="住所（任意）">
                  <TextInput
                    value={form.address}
                    onChange={(v) => update("address", v)}
                    autoComplete="street-address"
                  />
                </Field>
              </FieldGrid>

              <Field label="主なプレイタイトル" required>
                <TextInput
                  value={form.mainGame}
                  onChange={(v) => update("mainGame", v)}
                  placeholder="例：STREET FIGHTER 6 / ぷよぷよeスポーツ"
                />
              </Field>

              <Field label="参加希望理由" required>
                <TextArea
                  value={form.joinReason}
                  onChange={(v) => update("joinReason", v)}
                  rows={4}
                />
              </Field>

              {isMinor && (
                <div className="rounded-xl border border-awa-glow/40 bg-awa-glow/[0.04] p-5 space-y-4">
                  <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">
                    GUARDIAN / 保護者情報（未成年者必須）
                  </div>
                  <FieldGrid>
                    <Field label="保護者氏名" required>
                      <TextInput
                        value={form.guardianName}
                        onChange={(v) => update("guardianName", v)}
                      />
                    </Field>
                    <Field label="保護者連絡先" required>
                      <TextInput
                        value={form.guardianContact}
                        onChange={(v) => update("guardianContact", v)}
                        placeholder="メールまたは電話番号"
                      />
                    </Field>
                  </FieldGrid>
                  <CheckRow
                    checked={form.guardianCheck}
                    onChange={(v) => update("guardianCheck", v)}
                  >
                    保護者の同意を得たうえで参加します。
                  </CheckRow>
                </div>
              )}

              {/* Agreement */}
              <div className="rounded-xl border border-neon-cyan/30 bg-awa-indigo-950/50 p-5 space-y-3">
                <div className="text-[11px] font-display tracking-[0.3em] text-neon-cyan">
                  AGREEMENT / 同意内容（v{TRAINEE_AGREEMENT_VERSION}）
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {TRAINEE_AGREEMENT_TEXT}
                </p>
                <CheckRow
                  checked={form.agreementCheck}
                  onChange={(v) => update("agreementCheck", v)}
                >
                  上記の規約・誓約内容を確認し、同意します。
                </CheckRow>
                <CheckRow
                  checked={form.privacyCheck}
                  onChange={(v) => update("privacyCheck", v)}
                >
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意のうえ、個人情報の取扱いに同意します。
                </CheckRow>
              </div>

              {errorMessage && (
                <p className="text-sm text-rose-300">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 rounded-xl border border-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed text-neon-cyan font-display tracking-[0.25em] text-sm py-3 transition-all shadow-[0_0_24px_rgba(0,240,255,0.15)] hover:shadow-[0_0_28px_rgba(0,240,255,0.35)]"
              >
                {submitting ? "送信中…" : "申請を送信する"}
              </button>

              <p className="text-[11px] text-white/40 text-center">
                送信日時・IP・端末情報は同意記録として保存されます。
              </p>
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
            APPLICATION RECEIVED
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            申請を受け付けました。
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            運営確認後、Discordロールを付与します。
            <br />
            登録メールアドレス宛にご連絡することがあります。
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

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
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

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      min={min}
      max={max}
      className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
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
    <label className="flex items-start gap-3 text-sm text-white/85 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-neon-cyan cursor-pointer"
      />
      <span className="leading-relaxed">{children}</span>
    </label>
  );
}
