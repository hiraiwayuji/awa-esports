"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Building2,
  HeartHandshake,
  Shirt,
  Megaphone,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Check,
  Send,
  MessageCircle,
  Info,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import AwaBackdrop from "@/components/AwaBackdrop";
import PartnersStrip from "@/components/PartnersStrip";
import { sponsorTiers } from "@/lib/data";

// 公式X（問い合わせ導線の予備）。メールアドレスは画面に出さず、
// フォーム送信→サーバー(Resend)経由で運営の受信箱へ直接届く。
const X_URL = "https://x.com/awaken_glow";

const accentMap = {
  magenta: {
    border: "border-awa-glow/50",
    text: "text-awa-glow",
    chip: "bg-awa-glow",
    grad: "from-awa-glow/20 via-awa-glow/10 to-transparent",
  },
  cyan: {
    border: "border-neon-cyan/50",
    text: "text-neon-cyan",
    chip: "bg-neon-cyan",
    grad: "from-neon-cyan/20 via-neon-blue/10 to-transparent",
  },
  warmth: {
    border: "border-awa-glow-deep/45",
    text: "text-awa-glow-deep",
    chip: "bg-awa-glow-deep",
    grad: "from-awa-glow-deep/20 via-awa-glow/5 to-transparent",
  },
} as const;

const inquiryOptions = [
  { value: "sponsor", label: "スポンサーについて" },
  { value: "supporter", label: "応援企業として相談" },
  { value: "goods", label: "物品協賛" },
  { value: "event", label: "イベント協賛" },
  { value: "other", label: "その他" },
] as const;

const useOfFunds = [
  "ユニフォーム制作費",
  "大会参加費、交通費、遠征費の一部補助",
  "練習会・イベント運営費",
  "配信・動画・SNS広報制作費",
  "地域イベントや体験会の運営費",
  "将来的な正式選手への活動費補助",
  "チーム運営に必要な備品・環境整備",
];

const benefits = [
  {
    icon: Megaphone,
    title: "挑戦する地域企業としてPR",
    desc: "徳島発の新しい地域活動を応援している企業として発信できます。",
  },
  {
    icon: Users,
    title: "若者・学生層への接点",
    desc: "若者、学生、ゲームコミュニティに企業名を届けるきっかけになります。",
  },
  {
    icon: TrendingUp,
    title: "継続的な露出",
    desc: "SNS、イベント、ユニフォーム、活動報告を通じて継続的な露出が期待できます。",
  },
  {
    icon: HeartHandshake,
    title: "地域・若者支援の発信",
    desc: "地域貢献、若者支援、スポーツ文化支援の取り組みとして発信できます。",
  },
  {
    icon: Star,
    title: "早期サポーターとしての価値",
    desc: "将来チームが大会実績や配信実績を伸ばした際、早期から支援した企業として紹介できます。",
  },
];

const futurePlans = [
  "定期練習会の開催",
  "オンラインイベントの開催",
  "主催大会の開催",
  "Twitchなどでの配信活動",
  "地域イベントへの参加",
  "企業・団体とのコラボ企画",
  "若者や初心者が参加しやすいコミュニティづくり",
  "将来的なプロチーム化への挑戦",
];

export default function SponsorPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const [inquiryType, setInquiryType] =
    useState<(typeof inquiryOptions)[number]["value"]>("sponsor");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // CTAボタンから「種別」を指定してフォームへ誘導
  const openForm = (
    type: (typeof inquiryOptions)[number]["value"],
    menuTitle?: string,
  ) => {
    setInquiryType(type);
    if (menuTitle) setMenu(menuTitle);
    scrollToForm();
  };

  const valid =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    message.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType,
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          menu: menu.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMsg(
          data?.error === "rate_limited"
            ? "送信が続いたため一時的に制限されています。少し時間をおいてお試しください。"
            : "送信に失敗しました。お手数ですが時間をおいて再度お試しください。",
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg(
        "通信エラーが発生しました。電波の良い場所で再度お試しください。",
      );
    }
  };

  return (
    <PageTransition>
      <AwaBackdrop />

      {/* ===== HERO / ファーストビュー ===== */}
      <section className="relative pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-display tracking-[0.35em] mb-5 text-awa-glow-deep"
          >
            <span className="h-px w-8 bg-awa-glow-deep" />
            SPONSOR / 応援パートナー募集
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl md:text-6xl leading-tight text-white max-w-4xl"
          >
            徳島から、全国へ。
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-awa-glow-deep via-awa-glow to-neon-cyan">
              若者の挑戦と地域の未来を、応援する。
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl text-base md:text-lg text-white/75 leading-relaxed"
          >
            AWAKEN GLOWは、徳島を拠点に活動するイースポーツチーム・コミュニティです。
            <br className="hidden md:block" />
            地域の若者やプレイヤーが本気で成長できる場所を作り、
            <br className="hidden md:block" />
            将来的には徳島から全国へ挑戦するチームを目指しています。
            <br className="hidden md:block" />
            チームの活動を一緒に支えてくださる企業・個人の皆さまを募集しています。
          </motion.p>

          {/* 上部CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => openForm("sponsor")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-awa-glow-deep via-awa-glow to-awa-glow-deep text-white font-display tracking-[0.2em] text-xs uppercase shadow-glow hover:scale-[1.03] transition-transform"
            >
              <Send size={15} />
              スポンサーについて問い合わせる
            </button>
            <button
              onClick={() => openForm("supporter")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-awa-glow-deep/50 text-awa-glow-deep font-display tracking-[0.2em] text-xs uppercase hover:bg-awa-glow-deep/10 transition-colors"
            >
              <HeartHandshake size={15} />
              応援企業として相談する
            </button>
          </motion.div>

          {/* キーワードチップ */}
          <div className="mt-9 grid sm:grid-cols-3 gap-3 max-w-3xl">
            {[
              { icon: HeartHandshake, label: "地域共創" },
              { icon: Sparkles, label: "若者の挑戦" },
              { icon: Building2, label: "地元企業と共に" },
            ].map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-awa-glow-deep/25 bg-awa-indigo-900/40 backdrop-blur"
              >
                <p.icon className="w-5 h-5 text-awa-glow-deep" />
                <span className="text-sm text-white/80">{p.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 1. AWAKEN GLOWとは ===== */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ABOUT / AWAKEN GLOWとは"
            title="徳島から、新しいスポーツ文化を。"
            tone="warm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 max-w-3xl text-sm md:text-base text-white/75 leading-loose space-y-5"
          >
            <p>
              AWAKEN GLOWは、徳島を拠点に活動するイースポーツチーム・コミュニティです。
              格闘ゲームを中心に、練習会、大会参加、オンラインイベント、配信、地域交流を行っています。
            </p>
            <p>
              初心者が参加しやすい入口を作りながら、正式選手・強化選手を育成し、
              将来的なプロチーム化を目指します。
            </p>
            <p>
              ゲームだけでなく、地域貢献、企業PR、若者の居場所づくりにもつながるチームを目指しています。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. ご支援のお願い ===== */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-awa-glow-deep/30 bg-awa-indigo-900/50 backdrop-blur-md p-8 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-display tracking-[0.3em] text-awa-glow-deep mb-5">
                <Shirt size={14} />
                SUPPORT / ご支援のお願い
              </div>
              <div className="space-y-5 text-sm md:text-base text-white/80 leading-loose">
                <p>
                  AWAKEN GLOWでは、チームユニフォーム制作費、活動費、大会参加費、
                  交通費・遠征費の一部補助、配信・広報制作費などへのご支援をお願いしています。
                </p>
                <p>
                  今後の大会参加や遠征、地域イベントへの参加に向けて、
                  応援企業ロゴ入りユニフォームの制作と、継続的な活動費の確保を進めています。
                </p>
                <p className="text-awa-glow">
                  少額から参加できる応援メニューもご用意しています。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 3. スポンサー・応援メニュー ===== */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="MENU / 応援メニュー"
            title="あなたに合った、応援のかたち。"
            subtitle={
              <>
                ユニフォームへのロゴ掲載から、少額の個人応援まで。
                <br />
                無理なく続けられる関わり方を選んでいただけます。
              </>
            }
            tone="warm"
          />

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {sponsorTiers.map((t, i) => {
              const a = accentMap[t.accent];
              const ctaType = t.accent === "magenta" || t.code === "S-02" || t.code === "S-03"
                ? "sponsor"
                : "supporter";
              return (
                <motion.div
                  key={t.code}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -8 }}
                  className={`relative rounded-2xl border ${a.border} bg-awa-indigo-900/55 backdrop-blur-md p-7 flex flex-col ${
                    t.featured
                      ? "lg:scale-[1.05] lg:-translate-y-1 shadow-glow ring-1 ring-awa-glow/30"
                      : ""
                  }`}
                >
                  {t.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-awa-glow text-[10px] font-display tracking-[0.25em] text-awa-indigo-950 whitespace-nowrap">
                      <Star size={10} fill="currentColor" />
                      メインスポンサー
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${a.grad} pointer-events-none`}
                  />

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-display tracking-[0.3em] ${a.text}`}
                      >
                        {t.code}
                      </span>
                      <span className="text-[10px] tracking-[0.2em] font-display text-white/40">
                        {t.placement}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white">{t.title}</h3>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span
                        className={`font-display font-black text-3xl md:text-4xl ${a.text}`}
                      >
                        {t.price}
                      </span>
                      <span className="text-xs text-white/50">/ {t.period}</span>
                    </div>

                    <p className="mt-4 text-sm text-white/70 leading-relaxed">
                      {t.summary}
                    </p>

                    <ul className="mt-6 space-y-2.5 flex-1">
                      {t.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-sm text-white/80"
                        >
                          <Check
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.text}`}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {t.note && (
                      <p className={`mt-5 text-xs ${a.text} leading-relaxed`}>
                        {t.note}
                      </p>
                    )}

                    <button
                      onClick={() => openForm(ctaType, `${t.title}（${t.price} / ${t.period}）`)}
                      className={`mt-6 inline-flex items-center justify-center gap-2 py-3 rounded-full border ${a.border} ${a.text} text-xs font-display tracking-[0.25em] uppercase hover:bg-white/5 transition-colors`}
                    >
                      このメニューで相談する
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 注意書き */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl border border-white/10 bg-awa-indigo-950/50 p-6 md:p-7"
          >
            <div className="flex items-center gap-2 text-xs font-display tracking-[0.25em] text-white/60 mb-4">
              <Info size={14} />
              掲載についてのご案内
            </div>
            <ul className="space-y-3 text-sm text-white/65 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-awa-glow-deep mt-1">―</span>
                <span>
                  ユニフォームへのロゴ掲載は、制作発注前のロゴデータ提出およびご入金確認が必要です。
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-awa-glow-deep mt-1">―</span>
                <span>
                  制作スケジュールに間に合わない場合は、公式HP・SNS掲載、活動報告での紹介、
                  次回ユニフォーム掲載などで対応します。
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-awa-glow-deep mt-1">―</span>
                <span>
                  掲載内容は活動状況に応じて調整させていただく場合があります。
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ===== 4. 支援金の使い道 ===== */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="USE OF FUNDS / 支援金の使い道"
            title="いただいた応援は、こう使います。"
            tone="warm"
          />
          <div className="mt-12 grid sm:grid-cols-2 gap-4">
            {useOfFunds.map((u, i) => (
              <motion.div
                key={u}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-awa-glow-deep/20 bg-awa-indigo-900/40 backdrop-blur px-5 py-4"
              >
                <span className="mt-0.5 w-6 h-6 grid place-items-center rounded-md bg-awa-glow-deep/15 text-awa-glow-deep text-xs font-display flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-white/80 leading-relaxed">{u}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. スポンサー収入の考え方 ===== */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-awa-indigo-900/45 backdrop-blur-md p-8 md:p-12 max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 text-xs font-display tracking-[0.3em] text-neon-cyan mb-5">
              <Trophy size={14} />
              POLICY / スポンサー収入の考え方
            </div>
            <div className="space-y-5 text-sm md:text-base text-white/75 leading-loose">
              <p>
                スポンサー収入は、原則としてAWAKEN GLOWのチーム運営費に充当します。
                選手個人への直接配布ではなく、チーム全体の継続、ユニフォーム制作、活動費、
                遠征補助、広報、配信環境の整備に使わせていただきます。
              </p>
              <p>
                選手個人にスポンサーが付く場合でも、AG所属としての価値を使う場合は、
                チームへの一部還元について企業・選手・チームで相談します。
              </p>
              <p>
                同じ業種でスポンサーが重なる場合は、
                チームスポンサーを優先させていただく場合があります。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 6. 企業側のメリット ===== */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="BENEFITS / 企業側のメリット"
            title="数字以上の、価値を届けます。"
            subtitle={
              <>
                広告として消費される協賛ではなく、地域と未来に投資する応援を。
                <br />
                応援してくださる企業にも、ここでしか得られない価値を。
              </>
            }
            tone="warm"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-awa-glow-deep/25 bg-awa-indigo-900/45 backdrop-blur-md p-7 hover:border-awa-glow-deep/60 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 grid place-items-center rounded-xl border border-awa-glow-deep/40 bg-awa-glow-deep/5 mb-5">
                  <b.icon className="w-5 h-5 text-awa-glow-deep" />
                </div>
                <h3 className="text-lg font-bold text-white">{b.title}</h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 現在の応援企業 ===== */}
      <PartnersStrip variant="page" />

      {/* ===== 7. 今後の展開 ===== */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ROADMAP / 今後の展開"
            title="AWAKEN GLOWは、ここから広がっていきます。"
            tone="warm"
          />
          <div className="mt-12 flex flex-wrap gap-3">
            {futurePlans.map((f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/25 bg-awa-indigo-900/40 px-5 py-2.5 text-sm text-white/80"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                {f}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-base md:text-lg text-white/80 leading-relaxed max-w-2xl"
          >
            今後のAWAKEN GLOWの様々な展開に、
            <br className="hidden sm:block" />
            <span className="text-awa-glow">ぜひご期待ください。</span>
          </motion.p>
        </div>
      </section>

      {/* ===== 8. お問い合わせ・申込み（下部CTA＋フォーム） ===== */}
      <section ref={formRef} id="contact-form" className="relative py-24 scroll-mt-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <SectionTitle
            eyebrow="CONTACT / お問い合わせ"
            title={
              <>
                スポンサー・応援パートナーに
                <br />
                関するお問い合わせ
              </>
            }
            subtitle={
              <>
                スポンサー、応援企業、物品協賛、イベント協賛など、
                AWAKEN GLOWの活動にご興味のある企業・個人の方は、
                お気軽にお問い合わせください。
              </>
            }
            tone="warm"
            align="center"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-3xl border border-awa-glow-deep/30 bg-awa-indigo-900/60 backdrop-blur-xl p-2"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-awa-glow-deep/20">
              <span className="text-[10px] font-mono tracking-[0.3em] text-white/50">
                AWA-CONTACT / SPONSOR INTAKE
              </span>
              <span className="w-2 h-2 rounded-full bg-awa-glow-deep animate-pulse" />
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
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow-deep">
                      お問い合わせ種別 *
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) =>
                        setInquiryType(
                          e.target.value as (typeof inquiryOptions)[number]["value"],
                        )
                      }
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow-deep focus:shadow-glow rounded-lg px-4 py-3 text-white transition-all"
                    >
                      {inquiryOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow-deep">
                      お名前 *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例：山田 太郎"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow-deep focus:shadow-glow rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow-deep">
                      企業名・店名（任意）
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="例：株式会社○○ / △△商店"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow-deep focus:shadow-glow rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow-deep">
                      返信先メールアドレス *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@your-company.jp"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow-deep focus:shadow-glow rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all"
                    />
                    <p className="mt-1.5 text-[11px] text-white/40">
                      ご返信用です。いただいたアドレスへ運営からご連絡します。
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow-deep">
                      気になるメニュー（任意）
                    </label>
                    <select
                      value={menu}
                      onChange={(e) => setMenu(e.target.value)}
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow-deep focus:shadow-glow rounded-lg px-4 py-3 text-white transition-all"
                    >
                      <option value="">選択しない / まずは相談したい</option>
                      {sponsorTiers.map((t) => (
                        <option
                          key={t.code}
                          value={`${t.title}（${t.price} / ${t.period}）`}
                        >
                          {t.title}（{t.price} / {t.period}）
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-display tracking-[0.3em] text-awa-glow-deep">
                      お問い合わせ内容 *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ご質問・ご提案・ご予算など、ご自由にお書きください。"
                      className="mt-2 w-full bg-awa-indigo-950/60 border border-white/10 focus:border-awa-glow-deep focus:shadow-glow rounded-lg px-4 py-3 text-white placeholder:text-white/30 transition-all resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                      {errorMsg}
                    </p>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10">
                    <p className="text-[11px] text-white/50">
                      送信内容はAWAKEN GLOW運営に直接届きます
                    </p>
                    <motion.button
                      type="submit"
                      disabled={!valid || status === "loading"}
                      whileHover={valid ? { scale: 1.03 } : undefined}
                      whileTap={valid ? { scale: 0.97 } : undefined}
                      className={`relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-display tracking-[0.3em] text-xs uppercase overflow-hidden transition-all ${
                        valid
                          ? "bg-gradient-to-r from-awa-glow-deep via-awa-glow to-awa-glow-deep text-white shadow-glow"
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
                    className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-awa-glow-deep/10 border border-awa-glow-deep shadow-glow mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-awa-glow-deep" />
                  </motion.div>
                  <h3 className="font-display font-black text-3xl text-white mb-4">
                    ありがとうございます。
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                    お問い合わせを受け付けました。
                    <br />
                    内容を確認の上、いただいたメールアドレスへ
                    <br />
                    AWAKEN GLOW運営よりご連絡いたします。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 予備の問い合わせ導線（X） */}
          <div className="mt-8 text-center">
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-neon-cyan transition-colors"
            >
              <MessageCircle size={15} />
              X（旧Twitter）からのDMでもご相談いただけます
            </a>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/join"
              className="text-xs text-white/55 hover:text-neon-cyan underline-offset-4 hover:underline font-display tracking-[0.2em]"
            >
              選手・メンバーとして参加したい方はこちら →
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
