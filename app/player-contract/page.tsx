"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import { ageOnDate } from "@/lib/age";
import {
  PLAYER_CONTRACT_VERSION,
  PLAYER_CONTRACT_TERMS,
} from "@/lib/legal-text";

type RoleType = "player" | "streamer" | "support" | "other";

const ROLE_LABEL: Record<RoleType, string> = {
  player: "選手",
  streamer: "ストリーマー",
  support: "サポートメンバー",
  other: "その他",
};

type FormState = {
  playerName: string;
  realName: string;
  email: string;
  discordId: string;
  birthdate: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  mainGame: string;
  roleType: RoleType;
  contractStart: string;
  contractDuration: string;
  emergencyContact: string;
  snsLinks: string;
  achievements: string;
  signature: string;

  contractCheck: boolean;
  unpaidCheck: boolean;
  portraitCheck: boolean;
  snsCheck: boolean;
  ndaCheck: boolean;
  cheatCheck: boolean;
  antiSocialCheck: boolean;
  privacyCheck: boolean;
  guardianCheck: boolean;
};

const INITIAL: FormState = {
  playerName: "",
  realName: "",
  email: "",
  discordId: "",
  birthdate: "",
  phone: "",
  address: "",
  guardianName: "",
  guardianEmail: "",
  guardianPhone: "",
  mainGame: "",
  roleType: "player",
  contractStart: "",
  contractDuration: "",
  emergencyContact: "",
  snsLinks: "",
  achievements: "",
  signature: "",
  contractCheck: false,
  unpaidCheck: false,
  portraitCheck: false,
  snsCheck: false,
  ndaCheck: false,
  cheatCheck: false,
  antiSocialCheck: false,
  privacyCheck: false,
  guardianCheck: false,
};

export default function PlayerContractPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 年齢は生年月日から自動算出（手入力させない）。
  const age = ageOnDate(form.birthdate);
  const isMinor = age !== null && age < 18;

  const requiredChecks: Array<keyof FormState> = [
    "contractCheck",
    "unpaidCheck",
    "portraitCheck",
    "snsCheck",
    "ndaCheck",
    "cheatCheck",
    "antiSocialCheck",
    "privacyCheck",
  ];

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!form.playerName.trim()) return false;
    if (!form.realName.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return false;
    if (!form.birthdate.trim()) return false;
    if (age === null) return false;
    if (!form.phone.trim()) return false;
    if (!form.address.trim()) return false;
    if (!form.mainGame.trim()) return false;
    if (!form.contractStart.trim()) return false;
    if (!form.contractDuration.trim()) return false;
    if (!form.emergencyContact.trim()) return false;
    if (!form.signature.trim()) return false;
    for (const k of requiredChecks) {
      if (!form[k]) return false;
    }
    if (isMinor) {
      if (!form.guardianName.trim()) return false;
      if (!form.guardianEmail.trim()) return false;
      if (!form.guardianPhone.trim()) return false;
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
      const res = await fetch("/api/player-contract", {
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
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[15vw] md:text-[11vw] lg:text-[9rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            PLAYER CONTRACT
          </span>
          <div className="relative">
            <SectionTitle
              eyebrow="LEGAL / 正式選手登録"
              title="PLAYER CONTRACT"
              subtitle={
                <>
                  AWAKEN GLOW の正式選手として活動する方のための
                  <br />
                  電子契約・同意ページです。
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
              このページは、AWAKEN GLOW の正式選手として活動する方のための
              電子契約ページです。
            </p>
            <p>
              送信前に契約内容を確認し、各項目に同意してください。
              <span className="text-white/60">
                送信内容は、契約同意記録として保存されます。
              </span>
            </p>
            <p className="text-white/60">
              ※本ページは法律上の正式電子署名サービスではなく、
              <br className="hidden md:block" />
              チーム運営の電子同意・誓約記録として運用しています。
            </p>
            <p className="text-white/70 text-[13px] pt-3 mt-3 border-t border-white/10">
              ご記入いただいた個人情報は、AWAKEN GLOW 運営が責任をもって管理し、
              チーム運営の目的以外には使用しません。
            </p>
          </div>
        </div>
      </section>

      {/* CONTRACT TERMS */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="rounded-2xl border border-awa-glow/30 bg-awa-indigo-950/50 backdrop-blur-md p-7 md:p-9">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-awa-glow animate-pulse shadow-[0_0_6px_rgba(45,255,183,0.8)]" />
              <div className="text-[11px] font-display tracking-[0.3em] text-awa-glow">
                CONTRACT TERMS / 契約条文（v{PLAYER_CONTRACT_VERSION}）
              </div>
            </div>
            <ol className="space-y-3 text-sm md:text-[15px] text-white/85 leading-relaxed list-decimal pl-5">
              {PLAYER_CONTRACT_TERMS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
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
                  />
                </Field>
                <Field label="本名" required>
                  <TextInput
                    value={form.realName}
                    onChange={(v) => update("realName", v)}
                  />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="メールアドレス" required>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                  />
                </Field>
                <Field label="Discord ID">
                  <TextInput
                    value={form.discordId}
                    onChange={(v) => update("discordId", v)}
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
                <Field label="年齢（自動計算）">
                  <div className="rounded-lg border border-white/15 bg-awa-indigo-950/40 text-white/80 px-3 py-2.5 text-sm">
                    {age !== null
                      ? `${age}歳${isMinor ? "（未成年）" : ""}`
                      : "生年月日を入力すると表示されます"}
                  </div>
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="電話番号" required>
                  <TextInput
                    type="tel"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                  />
                </Field>
                <Field label="住所" required>
                  <TextInput
                    value={form.address}
                    onChange={(v) => update("address", v)}
                  />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="所属部門 / ゲームタイトル" required>
                  <TextInput
                    value={form.mainGame}
                    onChange={(v) => update("mainGame", v)}
                    placeholder="例：STREET FIGHTER 6"
                  />
                </Field>
                <Field label="活動区分" required>
                  <Select
                    value={form.roleType}
                    onChange={(v) => update("roleType", v as RoleType)}
                  >
                    {(Object.keys(ROLE_LABEL) as RoleType[]).map((k) => (
                      <option key={k} value={k}>
                        {ROLE_LABEL[k]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="契約開始日" required>
                  <TextInput
                    type="date"
                    value={form.contractStart}
                    onChange={(v) => update("contractStart", v)}
                  />
                </Field>
                <Field label="契約期間" required>
                  <TextInput
                    value={form.contractDuration}
                    onChange={(v) => update("contractDuration", v)}
                    placeholder="例：1年（自動更新あり）"
                  />
                </Field>
              </FieldGrid>

              <Field label="緊急連絡先" required>
                <TextInput
                  value={form.emergencyContact}
                  onChange={(v) => update("emergencyContact", v)}
                  placeholder="氏名・続柄・電話番号など"
                />
              </Field>

              <Field label="SNSアカウント（任意・改行区切り）">
                <TextArea
                  value={form.snsLinks}
                  onChange={(v) => update("snsLinks", v)}
                  rows={3}
                  placeholder="例：&#10;X: https://x.com/...&#10;Twitch: https://twitch.tv/..."
                />
              </Field>

              <Field label="大会実績（任意）">
                <TextArea
                  value={form.achievements}
                  onChange={(v) => update("achievements", v)}
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
                    <Field label="保護者メール" required>
                      <TextInput
                        type="email"
                        value={form.guardianEmail}
                        onChange={(v) => update("guardianEmail", v)}
                      />
                    </Field>
                  </FieldGrid>
                  <Field label="保護者電話番号" required>
                    <TextInput
                      type="tel"
                      value={form.guardianPhone}
                      onChange={(v) => update("guardianPhone", v)}
                    />
                  </Field>
                  <CheckRow
                    checked={form.guardianCheck}
                    onChange={(v) => update("guardianCheck", v)}
                  >
                    保護者の同意を得たうえで本契約を結びます。
                  </CheckRow>
                </div>
              )}

              {/* Signature */}
              <Field label="署名（氏名入力）" required>
                <TextInput
                  value={form.signature}
                  onChange={(v) => update("signature", v)}
                  placeholder="本人の氏名を入力"
                />
              </Field>

              {/* Agreement checks */}
              <div className="rounded-xl border border-neon-cyan/30 bg-awa-indigo-950/50 p-5 space-y-3">
                <div className="text-[11px] font-display tracking-[0.3em] text-neon-cyan mb-1">
                  AGREEMENT CHECKS / 同意チェック
                </div>
                <CheckRow
                  checked={form.contractCheck}
                  onChange={(v) => update("contractCheck", v)}
                >
                  上記の契約条文を確認し、内容に同意します。
                </CheckRow>
                <CheckRow
                  checked={form.unpaidCheck}
                  onChange={(v) => update("unpaidCheck", v)}
                >
                  本契約が無報酬であることに同意します。
                </CheckRow>
                <CheckRow
                  checked={form.portraitCheck}
                  onChange={(v) => update("portraitCheck", v)}
                >
                  チーム広報目的での写真・動画・肖像権の利用に同意します。
                </CheckRow>
                <CheckRow
                  checked={form.snsCheck}
                  onChange={(v) => update("snsCheck", v)}
                >
                  SNS・配信におけるチームに関する発信ルールに同意します。
                </CheckRow>
                <CheckRow
                  checked={form.ndaCheck}
                  onChange={(v) => update("ndaCheck", v)}
                >
                  チーム内部情報・他メンバーの個人情報に関する機密保持（NDA）に同意します。
                </CheckRow>
                <CheckRow
                  checked={form.cheatCheck}
                  onChange={(v) => update("cheatCheck", v)}
                >
                  チート・不正行為・迷惑行為を行わないことを誓約します。
                </CheckRow>
                <CheckRow
                  checked={form.antiSocialCheck}
                  onChange={(v) => update("antiSocialCheck", v)}
                >
                  自身が反社会的勢力に該当せず、関与もしないことを誓約します。
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
                className="mt-2 rounded-xl border border-awa-glow bg-awa-glow/10 hover:bg-awa-glow/20 disabled:opacity-30 disabled:cursor-not-allowed text-awa-glow font-display tracking-[0.25em] text-sm py-3 transition-all shadow-[0_0_24px_rgba(45,255,183,0.15)] hover:shadow-[0_0_28px_rgba(45,255,183,0.35)]"
              >
                {submitting ? "送信中…" : "契約同意を送信する"}
              </button>

              <p className="text-[11px] text-white/40 text-center">
                送信日時・IP・端末情報・規約バージョンは
                契約同意記録として保存されます。
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
            AGREEMENT RECORDED
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            正式選手登録の同意を受け付けました。
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            運営確認後、登録を確定します。
            <br />
            登録メールアドレス宛にご連絡いたします。
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
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-white/15 bg-awa-indigo-950/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,240,255,0.15)] transition"
    >
      {children}
    </select>
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
