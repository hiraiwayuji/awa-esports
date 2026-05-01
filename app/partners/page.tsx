"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Building2,
  HeartHandshake,
  TrendingUp,
  Users,
  Award,
  Check,
  Star,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import AwaBackdrop from "@/components/AwaBackdrop";
import { partnerPlans } from "@/lib/data";

const accentMap = {
  magenta: {
    border: "border-awa-magenta/50",
    text: "text-awa-magenta",
    bg: "bg-awa-magenta/10",
    grad: "from-awa-magenta/20 via-awa-violet/10 to-transparent",
    chip: "bg-awa-magenta",
  },
  cyan: {
    border: "border-neon-cyan/50",
    text: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
    grad: "from-neon-cyan/20 via-neon-blue/10 to-transparent",
    chip: "bg-neon-cyan",
  },
  warmth: {
    border: "border-awa-warmth/50",
    text: "text-awa-warmth",
    bg: "bg-awa-warmth/10",
    grad: "from-awa-warmth/20 via-awa-magenta/5 to-transparent",
    chip: "bg-awa-warmth",
  },
};

export default function PartnersPage() {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1500);
  };

  const valid =
    contact.trim().length > 0 &&
    email.trim().length > 0 &&
    plan !== "" &&
    message.trim().length > 0;

  return (
    <PageTransition>
      <AwaBackdrop />

      {/* Vision */}
      <section className="relative pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-display tracking-[0.35em] mb-4 text-awa-warmth"
          >
            <span className="h-px w-8 bg-awa-warmth" />
            PARTNERS / 共に創る
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl md:text-6xl leading-tight text-white max-w-4xl"
          >
            徳島の未来を、
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-warmth via-awa-magenta to-awa-warmth">
              共に創るパートナー募集。
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-2xl text-base md:text-lg text-white/75 leading-relaxed"
          >
            eスポーツを通じて、徳島の若者に夢を、地域に活力を。
            <br />
            私たちは、勝つことだけを目指すチームではありません。
            <br />
            この街と、この街を愛する人と、共に育つチームでありたい。
          </motion.p>

          <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-3xl">
            {[
              { icon: HeartHandshake, label: "地域共創" },
              { icon: Sparkles, label: "若者の挑戦" },
              { icon: Building2, label: "地元企業と共に" },
            ].map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-awa-warmth/25 bg-awa-indigo-900/40 backdrop-blur"
              >
                <p.icon className="w-5 h-5 text-awa-warmth" />
                <span className="text-sm text-white/80">{p.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="SPONSORSHIP PLANS"
            title="地域に愛される、3つの応援のかたち。"
            subtitle="大企業の名前を借りるためではなく、徳島の人々と一緒に育つ仕組みとして設計しました。あなたの想いに合うプランがきっとあります。"
            tone="warm"
          />

          <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
            {partnerPlans.map((p, i) => {
              const a = accentMap[p.accent];
              return (
                <motion.div
                  key={p.code}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`relative rounded-2xl border ${a.border} bg-awa-indigo-900/55 backdrop-blur-md p-7 flex flex-col ${
                    p.featured
                      ? "md:scale-[1.04] md:-translate-y-1 shadow-magenta"
                      : ""
                  }`}
                >
                  {p.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-awa-magenta text-[10px] font-display tracking-[0.3em] text-white">
                      <Star size={10} fill="currentColor" />
                      RECOMMENDED
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${a.grad} pointer-events-none`}
                  />

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-[10px] font-display tracking-[0.3em] ${a.text}`}>
                        {p.code}
                      </span>
                      <span className={`text-[10px] tracking-[0.25em] font-display text-white/40`}>
                        {p.subtitle}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{p.title}</h3>
                    <div className={`mt-2 text-lg font-display ${a.text}`}>
                      {p.monthly}
                    </div>
                    <p className="mt-4 text-sm text-white/70 leading-relaxed">
                      {p.summary}
                    </p>

                    <ul className="mt-6 space-y-2.5 flex-1">
                      {p.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-sm text-white/80"
                        >
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.text}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        setPlan(p.title);
                        document.getElementById("contact-form")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className={`mt-7 inline-flex items-center justify-center gap-2 py-3 rounded-full border ${a.border} ${a.text} text-xs font-display tracking-[0.3em] uppercase hover:${a.bg} transition-all`}
                    >
                      このプランで相談する
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="BENEFITS / メリット"
            title="数字以上の、価値を届けます。"
            subtitle="広告として消費される協賛ではなく、地域と未来に投資する応援。あなたの企業ブランドにも、ここでしか得られない価値を。"
            tone="warm"
          />

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "若年層へのリーチ",
                desc: "徳島県内の高校生・大学生・若手社会人へ、SNSとイベントで直接届く接点。",
              },
              {
                icon: TrendingUp,
                title: "挑戦企業ブランディング",
                desc: "「新しいことに本気で取り組む地域企業」として、メディアと若者から評価される。",
              },
              {
                icon: Award,
                title: "地域貢献の見える化",
                desc: "練習会、交流会、学校訪問。チームと一緒に汗をかく、誇れる地域貢献活動。",
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-awa-warmth/25 bg-awa-indigo-900/45 backdrop-blur-md p-7 hover:border-awa-warmth/60 hover:shadow-warmth transition-all"
              >
                <div className="w-12 h-12 grid place-items-center rounded-xl border border-awa-warmth/40 bg-awa-warmth/5 mb-5">
                  <b.icon className="w-5 h-5 text-awa-warmth" />
                </div>
                <h3 className="text-xl font-bold text-white">{b.title}</h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="relative py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <SectionTitle
            eyebrow="CONTACT / お問い合わせ"
            title="まずは、お話を聞かせてください。"
            subtitle="プランの詳細、ご予算のご相談、コラボイベントのご提案など、お気軽にどうぞ。代表ぼーるくんから直接ご連絡いたします。"
            tone="warm"
            align="center"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-3xl border border-awa-warmth/30 bg-awa-indigo-900/60 backdrop-blur-xl p-2"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-awa-warmth/20">
              <span className="text-[10px] font-mono tracking-[0.3em] text-white/50">
                AWA-CONTACT v1.0 / PARTNER INTAKE
              </span>
              <span className="w-2 h-2 rounded-full bg-awa-warmth animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              {status !== "done" ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-6 md:px-10 py-10 space-y-6"
                >
                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-warmth">
                      企業名 / 店名（任意）
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="例：株式会社○○ / △△商店"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-warmth focus:shadow-warmth rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-warmth">
                      担当者名 *
                    </label>
                    <input
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="例：山田 太郎"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-warmth focus:shadow-warmth rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-warmth">
                      メールアドレス *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@your-company.jp"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-warmth focus:shadow-warmth rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-warmth">
                      希望するプラン *
                    </label>
                    <select
                      required
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-warmth focus:shadow-warmth rounded-lg px-4 py-3 text-white transition-all"
                    >
                      <option value="">選択してください</option>
                      {partnerPlans.map((p) => (
                        <option key={p.code} value={p.title}>
                          {p.title}（{p.subtitle}）
                        </option>
                      ))}
                      <option value="未定 / 相談したい">未定 / まずは相談したい</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-warmth">
                      お問い合わせ内容 *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ご質問・ご提案・ご予算など、ご自由にお書きください。"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-warmth focus:shadow-warmth rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10">
                    <p className="text-[11px] text-white/50">
                      送信内容は代表ぼーるくん個人に届きます
                    </p>
                    <motion.button
                      type="submit"
                      disabled={!valid || status === "loading"}
                      whileHover={valid ? { scale: 1.03 } : undefined}
                      whileTap={valid ? { scale: 0.97 } : undefined}
                      className={`relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-display tracking-[0.3em] text-xs uppercase overflow-hidden transition-all ${
                        valid
                          ? "bg-gradient-to-r from-awa-warmth via-awa-magenta to-awa-warmth text-white shadow-warmth"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          SENDING...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          送信する
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
                  className="px-8 py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-awa-warmth/10 border border-awa-warmth shadow-warmth mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-awa-warmth" />
                  </motion.div>
                  <h3 className="font-display font-black text-3xl text-white mb-4">
                    ありがとうございます。
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                    お問い合わせを受け付けました。
                    <br />
                    内容を確認の上、
                    <span className="text-awa-warmth">3営業日以内に</span>
                    代表ぼーるくんよりご連絡いたします。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <p className="mt-6 text-[11px] text-center text-white/30">
            ※ 本フォームはデモ送信です。実運用時は受付確認メールが届きます。
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
