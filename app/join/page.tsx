"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  Cpu,
  MapPin,
  CalendarDays,
  Gamepad2,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";

type ContactMethod = "email" | "line" | "phone";
type Residency = "current" | "former" | "neighbor" | "other";
type Division = "SF6" | "PUYO" | "UNDECIDED";

const popularGames = [
  "Street Fighter 6",
  "ぷよぷよeスポーツ",
  "VALORANT",
  "Apex Legends",
  "League of Legends",
  "FORTNITE",
  "OVERWATCH 2",
  "スマブラ",
  "Tekken 8",
  "Rainbow Six Siege",
];

const contactMethodOptions: {
  v: ContactMethod;
  l: string;
  placeholder: string;
}[] = [
  { v: "email", l: "メール", placeholder: "you@example.com" },
  { v: "line", l: "LINE ID", placeholder: "@your-line-id" },
  { v: "phone", l: "電話番号", placeholder: "090-0000-0000" },
];

const divisionOptions: { v: Division; l: string; desc: string }[] = [
  { v: "SF6", l: "STREET FIGHTER 6 部門", desc: "格ゲー / SF6" },
  { v: "PUYO", l: "ぷよぷよeスポーツ 部門", desc: "連鎖 / 思考戦" },
  { v: "UNDECIDED", l: "未定 / 相談したい", desc: "他タイトルの相談も歓迎" },
];

function validateContact(method: ContactMethod, value: string): boolean {
  const v = value.trim();
  if (v.length === 0) return false;
  if (method === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (method === "phone") return /^[0-9+\-\s()]{8,}$/.test(v);
  return v.length >= 2;
}

function isKana(s: string): boolean {
  return /^[゠-ヿ぀-ゟ\sー]+$/.test(s.trim());
}

export default function JoinPage() {
  const [name, setName] = useState("");
  const [nameKana, setNameKana] = useState("");
  const [age, setAge] = useState("");
  const [residency, setResidency] = useState<Residency | "">("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [contactValue, setContactValue] = useState("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [favoriteGame, setFavoriteGame] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const ageNum = Number(age);
  const isMinor = ageNum > 0 && ageNum < 18;

  const toggleDivision = (d: Division) => {
    setDivisions((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const kanaValid = nameKana.trim().length > 0 && isKana(nameKana);
  const contactValid = validateContact(contactMethod, contactValue);

  const valid =
    name.trim().length > 0 &&
    kanaValid &&
    ageNum > 0 &&
    ageNum < 120 &&
    residency !== "" &&
    contactValid &&
    divisions.length > 0 &&
    consent &&
    (!isMinor ||
      (guardianName.trim().length > 0 && guardianContact.trim().length > 0));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nameKana,
          age: ageNum,
          residency,
          contactMethod,
          contactValue,
          divisions,
          favoriteGame,
          guardianName: isMinor ? guardianName : "",
          guardianContact: isMinor ? guardianContact : "",
          consent,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code =
          (body && typeof body.error === "string" && body.error) ||
          `http_${res.status}`;
        throw new Error(code);
      }
      setStatus("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      setErrorMessage(
        msg === "rate_limited"
          ? "短時間に複数回の送信がありました。少し時間をおいて再度お試しください。"
          : "送信できませんでした。お手数ですが contact@awakenglow.jp までご連絡ください。",
      );
      setStatus("error");
    }
  };

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="JOIN US / 参加申込"
            title="READY PLAYER ONE?"
            subtitle={
              <>
                徳島ルーツの方を中心に、興味のある県外の方も歓迎。
                <br />
                あなたの「やってみたい」が、AWAKEN GLOW の次の一歩になります。
              </>
            }
          />
        </div>
      </section>

      {/* Requirement cards */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: MapPin,
                title: "RESIDENCY",
                jp: "徳島ルーツ歓迎・県外も応相談",
                desc: "現在徳島・元県民の方を中心に、興味のある県外の方も。",
              },
              {
                icon: CalendarDays,
                title: "AGE",
                jp: "年齢制限なし",
                desc: "未成年の方は保護者の同意のうえお申し込みください。",
              },
              {
                icon: Gamepad2,
                title: "DIVISION",
                jp: "SF6 / ぷよぷよ ほか",
                desc: "希望部門を選択。未定でも相談しながら決められます。",
              },
            ].map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-neon-cyan/20 bg-awa-indigo-900/40 backdrop-blur p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <r.icon className="w-5 h-5 text-neon-cyan" />
                  <span className="text-[10px] font-display tracking-[0.3em] text-neon-cyan/70">
                    {String(i + 1).padStart(2, "0")} / {r.title}
                  </span>
                </div>
                <div className="text-lg font-bold text-white">{r.jp}</div>
                <p className="mt-2 text-xs text-white/50 leading-relaxed">
                  {r.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cockpit form */}
      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-neon-cyan/30 bg-awa-indigo-900/60 backdrop-blur-xl p-2 neon-border"
          >
            {/* Cockpit header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neon-cyan/20">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-awa-glow animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-awa-glow-deep" />
                <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
                <span className="ml-3 text-[10px] font-mono tracking-[0.3em] text-white/50">
                  AWA-COCKPIT v1.1 / ENTRY MODULE
                </span>
              </div>
              <Cpu className="w-4 h-4 text-neon-cyan animate-pulse-slow" />
            </div>

            <AnimatePresence mode="wait">
              {status !== "done" ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="px-6 md:px-10 py-10 space-y-8"
                >
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      01 / NAME — お名前
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例：平岩 裕治"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  {/* Furigana */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      02 / NAME_KANA — フリガナ
                    </label>
                    <input
                      value={nameKana}
                      onChange={(e) => setNameKana(e.target.value)}
                      placeholder="例：ヒライワ ユウジ"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                    {nameKana.length > 0 && !kanaValid && (
                      <p className="mt-2 text-xs text-awa-glow/80">
                        ひらがな・カタカナでご入力ください。
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      03 / AGE — 年齢
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="例：25"
                      min={1}
                      max={119}
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                    {isMinor && (
                      <p className="mt-2 text-xs text-awa-glow/90 leading-relaxed">
                        未成年の方は、必ず保護者の同意のうえご送信ください。
                        <br />
                        下の保護者欄も必須項目になります。
                      </p>
                    )}
                  </div>

                  {/* Residency */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      04 / RESIDENCY — 徳島との関係
                    </label>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { v: "current", l: "現在 徳島県在住" },
                        { v: "former", l: "元 徳島県民" },
                        { v: "neighbor", l: "隣県在住で興味あり" },
                        { v: "other", l: "それ以外で興味あり" },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setResidency(opt.v as Residency)}
                          className={`relative rounded-lg border px-4 py-3 text-sm transition-all ${
                            residency === opt.v
                              ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-neon"
                              : "border-white/15 text-white/70 hover:border-white/40"
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                    {(residency === "neighbor" || residency === "other") && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-xs text-awa-glow/90 leading-relaxed"
                      >
                        ※ 県外の方は、まず見学・お試し参加からご案内します。
                        <br />
                        活動拠点は徳島・藍住エリアです。
                      </motion.p>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      05 / CONTACT — 連絡先
                    </label>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {contactMethodOptions.map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => {
                            setContactMethod(opt.v);
                            setContactValue("");
                          }}
                          className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                            contactMethod === opt.v
                              ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-neon"
                              : "border-white/15 text-white/70 hover:border-white/40"
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                    <input
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={
                        contactMethodOptions.find(
                          (o) => o.v === contactMethod,
                        )?.placeholder
                      }
                      inputMode={
                        contactMethod === "phone" ? "tel" : contactMethod === "email" ? "email" : "text"
                      }
                      className="mt-3 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                    <p className="mt-2 text-[11px] text-white/40 leading-relaxed">
                      ※ 運営からの折返し連絡に使用します。
                      第三者には提供しません（
                      <Link
                        href="/legal/privacy"
                        className="text-neon-cyan/80 hover:text-neon-cyan underline-offset-4 hover:underline"
                      >
                        プライバシーポリシー
                      </Link>
                      ）。
                    </p>
                  </div>

                  {/* Division */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      06 / DIVISION — 興味のある部門（複数可）
                    </label>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {divisionOptions.map((opt) => {
                        const active = divisions.includes(opt.v);
                        return (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => toggleDivision(opt.v)}
                            className={`rounded-lg border px-4 py-3 text-left transition-all ${
                              active
                                ? "border-awa-glow bg-awa-glow/10 text-white shadow-neon"
                                : "border-white/15 text-white/70 hover:border-white/40"
                            }`}
                          >
                            <div className="text-sm font-bold">{opt.l}</div>
                            <div className="mt-1 text-[11px] text-white/50">
                              {opt.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Favorite game */}
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-neon-cyan">
                      07 / FAVORITE GAME — 好きなゲーム（任意）
                    </label>
                    <input
                      value={favoriteGame}
                      onChange={(e) => setFavoriteGame(e.target.value)}
                      placeholder="自由に入力 or 下から選択"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {popularGames.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFavoriteGame(g)}
                          className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                            favoriteGame === g
                              ? "border-awa-glow bg-awa-glow/10 text-awa-glow"
                              : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guardian (minor only) */}
                  <AnimatePresence>
                    {isMinor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-awa-glow/40 bg-awa-glow/5 p-5 space-y-5">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-awa-glow mt-0.5 shrink-0" />
                            <p className="text-xs text-awa-glow leading-relaxed">
                              未成年の方は保護者情報のご記入が必須です。
                              <br />
                              ご本人のお申込みであることを保護者の方にご確認いただいたうえで送信してください。
                            </p>
                          </div>
                          <div>
                            <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow">
                              08 / GUARDIAN — 保護者氏名
                            </label>
                            <input
                              value={guardianName}
                              onChange={(e) => setGuardianName(e.target.value)}
                              placeholder="例：平岩 太郎"
                              className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow">
                              09 / GUARDIAN_CONTACT — 保護者連絡先
                            </label>
                            <input
                              value={guardianContact}
                              onChange={(e) =>
                                setGuardianContact(e.target.value)
                              }
                              placeholder="メールまたは電話番号"
                              className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Consent */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-neon-cyan cursor-pointer"
                      />
                      <span className="text-xs text-white/70 leading-relaxed">
                        <Link
                          href="/legal/privacy"
                          target="_blank"
                          className="text-neon-cyan hover:text-awa-glow underline-offset-4 underline"
                        >
                          プライバシーポリシー
                        </Link>
                        に同意の上、送信します。
                        <br />
                        入力内容は運営からの折返し連絡・参加者名簿の管理に利用し、第三者に提供しません。
                      </span>
                    </label>
                  </div>

                  {/* Error message */}
                  {status === "error" && errorMessage && (
                    <div className="rounded-lg border border-awa-glow/40 bg-awa-glow/5 px-4 py-3 text-xs text-awa-glow leading-relaxed">
                      {errorMessage}
                    </div>
                  )}

                  {/* Launch button */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10">
                    <p className="text-[10px] tracking-[0.3em] font-mono text-white/40">
                      {">"} ALL SYSTEMS{" "}
                      <span
                        className={
                          valid
                            ? "text-neon-cyan font-bold"
                            : "text-awa-glow/70"
                        }
                      >
                        {valid ? "READY" : "STANDBY"}
                      </span>
                    </p>
                    <motion.button
                      type="submit"
                      disabled={!valid || status === "loading"}
                      whileHover={valid ? { scale: 1.03 } : undefined}
                      whileTap={valid ? { scale: 0.97 } : undefined}
                      className={`relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-display tracking-[0.3em] text-xs uppercase overflow-hidden transition-all ${
                        valid
                          ? "bg-gradient-to-r from-awa-glow via-awa-glow to-neon-cyan text-white shadow-neon"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          LAUNCHING...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          LAUNCH
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-8 py-20 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-neon-cyan/10 border border-neon-cyan shadow-neon mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-neon-cyan" />
                  </motion.div>
                  <div className="text-[10px] tracking-[0.4em] font-display text-neon-cyan mb-3">
                    TRANSMISSION COMPLETE
                  </div>
                  <h3 className="font-display font-black text-3xl md:text-4xl text-white mb-4">
                    WELCOME TO
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-glow to-neon-cyan">
                      AWAKEN GLOW.
                    </span>
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                    {name && (
                      <>
                        <span className="text-white">{name}</span> さん、
                        <br />
                      </>
                    )}
                    エントリーありがとうございます。
                    <br />
                    内容を確認のうえ、運営からご連絡いたします。
                  </p>
                  {(residency === "neighbor" || residency === "other") && (
                    <p className="mt-4 text-xs text-awa-glow/80 leading-relaxed max-w-md mx-auto">
                      県外メンバーも歓迎しています。
                      <br />
                      まずは見学・お試し参加からご案内いたします。
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setName("");
                      setNameKana("");
                      setAge("");
                      setResidency("");
                      setContactValue("");
                      setDivisions([]);
                      setFavoriteGame("");
                      setGuardianName("");
                      setGuardianContact("");
                      setConsent(false);
                    }}
                    className="mt-8 text-xs text-white/50 hover:text-neon-cyan tracking-[0.3em] font-display"
                  >
                    ← もう一度入力する
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="mt-6 text-[11px] text-center text-white/30 leading-relaxed">
            ※ 送信内容は運営にメールで通知されます。
            <br />
            通常 2〜3日以内に運営からご連絡いたします。
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
