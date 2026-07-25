"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  HeartHandshake,
  Building2,
  Users,
  Sparkles,
  BadgeCheck,
  Ban,
  AlertTriangle,
  Swords,
  Gamepad2,
  Megaphone,
  ClipboardCheck,
  Handshake,
  Gavel,
  ArrowRight,
  Send,
  CheckCircle2,
  Loader2,
  ScrollText,
} from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import AwaBackdrop from "@/components/AwaBackdrop";
import { SUPPORT_KINDS } from "@/lib/sponsor/types";

const LAST_UPDATED = "2026年7月25日";

// なぜ審査するか（3本柱）
const whyPillars = [
  {
    icon: Users,
    title: "青少年の育成を守るため",
    desc: "学生や未成年のメンバーが多く関わります。子どもたちが安心して打ち込める環境を守ることを最優先します。",
  },
  {
    icon: HeartHandshake,
    title: "地域の信頼にこたえるため",
    desc: "徳島の地域企業・団体と歩むチームとして、応援してくださる企業と、地域からの信頼の両方を大切にします。",
  },
  {
    icon: ShieldCheck,
    title: "企業・チーム双方を守るため",
    desc: "後からのトラブルを避け、応援企業のブランドとAGの活動、双方の価値を守るために事前に確認します。",
  },
];

// スポンサー企業 と 応援企業 の違い
const partnerTypes = [
  {
    icon: Building2,
    tag: "SPONSOR",
    title: "スポンサー企業",
    color: "text-neon-cyan",
    border: "border-neon-cyan/40",
    points: [
      "継続的な協賛でチームを支えてくださる企業",
      "ユニフォーム・公式ページ・配信などでの掲載",
      "契約書に基づく明確な権利・掲載範囲",
      "業種によっては独占的な掲載も相談可能",
    ],
  },
  {
    icon: HeartHandshake,
    tag: "SUPPORTER",
    title: "応援企業",
    color: "text-awa-glow",
    border: "border-awa-glow/40",
    points: [
      "少額・単発からチームを応援してくださる企業・個人",
      "活動報告やSNSでのお名前紹介が中心",
      "無理なく続けられる、ゆるやかな関わり方",
      "将来のスポンサーへのはじめの一歩としても歓迎",
    ],
  },
];

// 提携の基本条件
const basicConditions = [
  "法令および公序良俗に反しないこと",
  "青少年の健全な育成を妨げないこと",
  "反社会的勢力と一切の関係がないこと",
  "AGの活動理念（挑戦の応援・地域共創・一緒に成長）に反しないこと",
  "掲載内容・表現について事前にAGと確認できること",
  "契約・合意した範囲を守っていただけること",
];

// お受けできない業種（禁止）
const prohibited = [
  "アダルト・風俗・出会い系",
  "ギャンブル・賭博（パチンコ、オンラインカジノ、賭け等）",
  "反社会的勢力およびその関連事業",
  "違法薬物・脱法ドラッグ",
  "たばこ・電子タバコ",
  "マルチ商法・ネットワークビジネス・情報商材",
  "誇大・虚偽の医療／健康／美容商材",
  "特定の政治・宗教活動を目的とする団体",
];

// 個別に慎重審査する業種
const cautious = [
  "酒類",
  "美容・美容医療",
  "サプリメント・健康食品",
  "投資・暗号資産・FX",
  "消費者金融・キャッシング",
  "医療・医薬品",
  "求人・人材サービス",
];

// 審査・契約の流れ
const flow = [
  { step: "01", title: "お問い合わせ", desc: "下記フォームまたはSNSからご連絡ください。" },
  { step: "02", title: "内容の確認", desc: "事業内容・ご希望の支援・掲載内容を運営で確認します。" },
  { step: "03", title: "審査", desc: "業種・競合・大会規定などを確認します。慎重審査業種は個別に検討します。" },
  { step: "04", title: "ご提案・お打ち合わせ", desc: "掲載範囲・条件をご提案し、すり合わせます。" },
  { step: "05", title: "契約・合意", desc: "スポンサー契約書または合意書を取り交わします。" },
  { step: "06", title: "掲載・活動開始", desc: "ユニフォーム・公式ページ・SNS等で掲載を開始します。" },
];

const desiredOptions = [
  { value: "sponsor", label: "スポンサー企業" },
  { value: "supporter", label: "応援企業" },
  { value: "consult", label: "相談したい" },
] as const;

export default function PartnersPolicyPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const submissionId = useMemo(
    () =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : undefined,
    [],
  );

  const [desiredType, setDesiredType] =
    useState<(typeof desiredOptions)[number]["value"]>("sponsor");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [snsUrl, setSnsUrl] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [supportKinds, setSupportKinds] = useState<string[]>([]);
  const [placementWish, setPlacementWish] = useState("");
  const [targetEvents, setTargetEvents] = useState("");
  const [freeText, setFreeText] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleKind = (k: string) =>
    setSupportKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );

  const valid =
    companyName.trim().length > 0 &&
    contactName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    agreed;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/partners-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          websiteUrl: websiteUrl.trim(),
          snsUrl: snsUrl.trim(),
          businessDescription: businessDescription.trim(),
          desiredType,
          supportKinds,
          placementWish: placementWish.trim(),
          targetEvents: targetEvents.trim(),
          freeText: freeText.trim(),
          agreed,
          submissionId,
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
      setErrorMsg("通信エラーが発生しました。電波の良い場所で再度お試しください。");
    }
  };

  return (
    <PageTransition>
      <AwaBackdrop />

      {/* ===== HERO ===== */}
      <section className="relative pt-36 pb-14">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-display tracking-[0.35em] mb-5 text-neon-cyan"
          >
            <ScrollText size={14} />
            PARTNERS POLICY / 提携の考え方
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-3xl md:text-5xl leading-tight text-white"
          >
            スポンサー企業・応援企業
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-awa-glow to-neon-cyan">
              に関する規約
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-7 max-w-3xl text-sm md:text-base text-white/75 leading-loose"
          >
            AWAKEN GLOW（A.G.）は、徳島から挑戦する若者を応援するeスポーツチームです。
            <br className="hidden md:block" />
            応援してくださる企業と、支えられる子どもたち・地域の双方を大切にするために、
            <br className="hidden md:block" />
            スポンサー・応援企業の提携についての基本的な考え方をまとめています。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-neon-cyan via-awa-glow to-neon-cyan text-awa-indigo-950 font-display font-bold tracking-[0.15em] text-xs uppercase shadow-neon hover:scale-[1.03] transition-transform"
            >
              <Send size={15} />
              スポンサー・応援のお問い合わせ
            </button>
            <Link
              href="/sponsor"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white/80 font-display tracking-[0.15em] text-xs uppercase hover:bg-white/5 transition-colors"
            >
              応援メニューを見る
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 md:px-8 pb-24 space-y-20">
        {/* 1. 審査を行う理由 */}
        <PolicySection num="1" eyebrow="WHY / 審査を行う理由" title="なぜ、AGはスポンサー審査を行うのか。">
          <div className="grid sm:grid-cols-3 gap-5">
            {whyPillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-neon-cyan/20 bg-awa-indigo-900/50 backdrop-blur p-6 hover:border-neon-cyan/50 hover:shadow-neon transition-all"
              >
                <div className="w-12 h-12 grid place-items-center rounded-xl border border-neon-cyan/40 bg-neon-cyan/5 mb-4">
                  <p.icon className="w-5 h-5 text-neon-cyan" />
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
                <p className="mt-2.5 text-sm text-white/70 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </PolicySection>

        {/* 2. スポンサー企業と応援企業の違い */}
        <PolicySection num="2" eyebrow="TYPES / 提携の種類" title="スポンサー企業と応援企業の違い。">
          <div className="grid sm:grid-cols-2 gap-5">
            {partnerTypes.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border ${t.border} bg-awa-indigo-900/50 backdrop-blur p-7`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 grid place-items-center rounded-xl border ${t.border} bg-white/5`}>
                    <t.icon className={`w-5 h-5 ${t.color}`} />
                  </div>
                  <div>
                    <div className={`text-[10px] font-display tracking-[0.3em] ${t.color}`}>{t.tag}</div>
                    <h3 className="text-lg font-bold text-white">{t.title}</h3>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-white/80">
                      <BadgeCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t.color}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </PolicySection>

        {/* 3. 提携の基本条件 */}
        <PolicySection num="3" eyebrow="CONDITIONS / 基本条件" title="提携の基本条件。">
          <div className="grid sm:grid-cols-2 gap-3">
            {basicConditions.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-awa-indigo-900/40 px-5 py-4"
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-awa-glow flex-shrink-0" />
                <span className="text-sm text-white/80 leading-relaxed">{c}</span>
              </motion.div>
            ))}
          </div>
        </PolicySection>

        {/* 4. お受けできない業種 */}
        <PolicySection num="4" eyebrow="NOT ACCEPTED / お受けできない業種" title="お受けできない業種・事業。">
          <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-2xl">
            青少年が多く関わるチームとして、次の業種・事業との提携はお受けしておりません。
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {prohibited.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-5 py-4"
              >
                <Ban className="w-5 h-5 mt-0.5 text-rose-300/90 flex-shrink-0" />
                <span className="text-sm text-white/85 leading-relaxed">{p}</span>
              </motion.div>
            ))}
          </div>
        </PolicySection>

        {/* 5. 慎重審査業種 */}
        <PolicySection num="5" eyebrow="CAREFUL REVIEW / 慎重審査" title="個別に慎重な審査を行う業種。">
          <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-2xl">
            次の業種は、直ちにお断りするものではありませんが、掲載範囲・表現・法令適合などを
            個別にていねいに確認させていただきます。
          </p>
          <div className="flex flex-wrap gap-2.5">
            {cautious.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/[0.06] px-4 py-2 text-sm text-white/85"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                {c}
              </motion.span>
            ))}
          </div>
        </PolicySection>

        {/* 6. 競合・独占 */}
        <PolicySection num="6" eyebrow="COMPETITION / 競合・独占" title="競合企業および業種独占に関する方針。">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/45 p-7 space-y-4 text-sm text-white/80 leading-loose">
            <p className="flex items-start gap-3">
              <Swords className="w-5 h-5 mt-0.5 text-neon-cyan flex-shrink-0" />
              既存のスポンサー・応援企業と同じ業種、または実質的に市場が重なる企業とのあいだで、
              競合が生じないよう配慮します。企業名が異なっていても、事業内容が重なる場合は
              「競合の可能性あり」として個別に確認します。
            </p>
            <p className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 mt-0.5 text-awa-glow flex-shrink-0" />
              業種によっては、期間・地域・イベントを定めた独占的な掲載をご相談いただけます。
              独占の範囲と期間は、契約書または合意書で明確に定めます。
            </p>
            <p className="flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 mt-0.5 text-neon-cyan flex-shrink-0" />
              同じ業種でご相談が重なった場合は、チームスポンサーを優先させていただくことがあります。
              その際も、双方に誠実にご説明します。
            </p>
          </div>
        </PolicySection>

        {/* 7. 大会規定の優先 */}
        <PolicySection num="7" eyebrow="TOURNAMENT / 大会規定" title="ゲーム会社・大会規定の優先。">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/45 p-7 flex items-start gap-4">
            <div className="w-12 h-12 grid place-items-center rounded-xl border border-neon-cyan/40 bg-neon-cyan/5 flex-shrink-0">
              <Gamepad2 className="w-5 h-5 text-neon-cyan" />
            </div>
            <p className="text-sm text-white/80 leading-loose">
              大会やゲームタイトルによっては、主催者・ゲーム会社が定めるスポンサー規定があります。
              AGは、これらの規定を最優先します。大会規定と抵触する掲載・協賛は、
              内容の調整をお願いする場合や、対象の大会に限り掲載を見合わせる場合があります。
            </p>
          </div>
        </PolicySection>

        {/* 8. 広告表示 */}
        <PolicySection num="8" eyebrow="DISCLOSURE / 広告表示" title="広告であることの表示。">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/45 p-7 flex items-start gap-4">
            <div className="w-12 h-12 grid place-items-center rounded-xl border border-awa-glow/40 bg-awa-glow/5 flex-shrink-0">
              <Megaphone className="w-5 h-5 text-awa-glow" />
            </div>
            <p className="text-sm text-white/80 leading-loose">
              SNS投稿や掲載が広告・宣伝にあたる場合は、「広告」「PR」などの表示を行います。
              景品表示法（いわゆるステマ規制）を守り、応援してくださる企業とファンの双方に
              誠実であることを大切にします。
            </p>
          </div>
        </PolicySection>

        {/* 9. 審査・契約の流れ */}
        <PolicySection num="9" eyebrow="FLOW / 流れ" title="審査および契約の流れ。">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flow.map((f, i) => (
              <motion.div
                key={f.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/10 bg-awa-indigo-900/45 p-6"
              >
                <div className="font-display font-black text-2xl text-neon-cyan/80">{f.step}</div>
                <h3 className="mt-2 text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </PolicySection>

        {/* 10. 提携停止・契約解除 */}
        <PolicySection num="10" eyebrow="TERMINATION / 解除" title="提携停止・契約解除。">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/45 p-7 flex items-start gap-4">
            <div className="w-12 h-12 grid place-items-center rounded-xl border border-rose-400/30 bg-rose-500/5 flex-shrink-0">
              <Gavel className="w-5 h-5 text-rose-300" />
            </div>
            <div className="text-sm text-white/80 leading-loose space-y-3">
              <p>
                次の場合、AGは提携の一時停止または契約の解除を行うことがあります。
              </p>
              <ul className="space-y-1.5 pl-1">
                <li>・本規約や契約・合意した内容に反したとき</li>
                <li>・法令違反、または反社会的勢力との関係が判明したとき</li>
                <li>・AGや選手、地域の信頼を著しく損なうおそれがあるとき</li>
                <li>・虚偽の情報にもとづく提携であったことが判明したとき</li>
              </ul>
              <p>停止・解除の判断は、できる限り事前にご説明のうえ、誠実に対応します。</p>
            </div>
          </div>
        </PolicySection>

        {/* 11. 最終決定 */}
        <PolicySection num="11" eyebrow="DECISION / 最終決定" title="最終決定。">
          <div className="rounded-2xl border border-neon-cyan/20 bg-awa-indigo-900/45 p-7 flex items-start gap-4">
            <div className="w-12 h-12 grid place-items-center rounded-xl border border-neon-cyan/40 bg-neon-cyan/5 flex-shrink-0">
              <Handshake className="w-5 h-5 text-neon-cyan" />
            </div>
            <p className="text-sm text-white/80 leading-loose">
              スポンサー・応援企業の提携可否の最終決定は、AG運営が行います。
              審査の結果、ご希望に添えない場合もございますが、その際もていねいにご説明します。
              いただいたお問い合わせ・企業情報は、選定と連絡の目的以外には使用しません。
            </p>
          </div>
        </PolicySection>

        {/* 12. お問い合わせフォーム */}
        <section ref={formRef} id="inquiry-form" className="scroll-mt-24">
          <SectionTitle
            eyebrow="CONTACT / お問い合わせ"
            title={<>スポンサー・応援企業の<br className="sm:hidden" />お問い合わせ</>}
            subtitle={<>ご相談・ご質問だけでも歓迎します。いただいた情報は一般公開されません。</>}
            align="center"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-3xl border border-neon-cyan/25 bg-awa-indigo-900/60 backdrop-blur-xl p-2"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neon-cyan/20">
              <span className="text-[10px] font-mono tracking-[0.3em] text-white/50">AWA-PARTNERS / INTAKE</span>
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              {status !== "done" ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 md:px-9 py-9 space-y-6"
                >
                  {/* 希望区分 */}
                  <Field label="希望区分 *">
                    <div className="grid grid-cols-3 gap-2">
                      {desiredOptions.map((o) => (
                        <button
                          type="button"
                          key={o.value}
                          onClick={() => setDesiredType(o.value)}
                          className={`rounded-lg border px-2 py-2.5 text-xs md:text-sm transition-colors ${
                            desiredType === o.value
                              ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                              : "border-white/15 text-white/60 hover:border-white/40"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="企業名・屋号 *">
                      <Input value={companyName} onChange={setCompanyName} placeholder="株式会社○○ / △△商店" />
                    </Field>
                    <Field label="担当者名 *">
                      <Input value={contactName} onChange={setContactName} placeholder="山田 太郎" />
                    </Field>
                    <Field label="メールアドレス *">
                      <Input value={email} onChange={setEmail} type="email" placeholder="example@your-company.jp" />
                    </Field>
                    <Field label="電話番号">
                      <Input value={phone} onChange={setPhone} placeholder="088-000-0000" />
                    </Field>
                    <Field label="所在地">
                      <Input value={address} onChange={setAddress} placeholder="徳島県○○市…" />
                    </Field>
                    <Field label="公式サイトURL">
                      <Input value={websiteUrl} onChange={setWebsiteUrl} placeholder="https://…" />
                    </Field>
                    <Field label="SNS URL">
                      <Input value={snsUrl} onChange={setSnsUrl} placeholder="https://x.com/…" />
                    </Field>
                    <Field label="対象イベント・ゲームタイトル">
                      <Input value={targetEvents} onChange={setTargetEvents} placeholder="例：ストリートファイター6 / 地域大会" />
                    </Field>
                  </div>

                  <Field label="主な事業内容">
                    <Textarea value={businessDescription} onChange={setBusinessDescription} rows={2} placeholder="事業の内容を教えてください。" />
                  </Field>

                  {/* 希望する支援内容 */}
                  <Field label="希望する支援内容（複数選択可）">
                    <div className="flex flex-wrap gap-2">
                      {SUPPORT_KINDS.map((k) => (
                        <button
                          type="button"
                          key={k}
                          onClick={() => toggleKind(k)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                            supportKinds.includes(k)
                              ? "border-awa-glow bg-awa-glow/10 text-awa-glow"
                              : "border-white/15 text-white/60 hover:border-white/40"
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="希望する掲載内容">
                    <Textarea value={placementWish} onChange={setPlacementWish} rows={2} placeholder="ユニフォーム掲載・SNS紹介・活動報告など。" />
                  </Field>

                  <Field label="自由記入欄">
                    <Textarea value={freeText} onChange={setFreeText} rows={3} placeholder="ご質問・ご要望など、ご自由にお書きください。" />
                  </Field>

                  {/* 規約同意 */}
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-awa-indigo-950/40 px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 accent-neon-cyan w-4 h-4"
                    />
                    <span className="text-xs text-white/70 leading-relaxed">
                      本ページ「スポンサー企業・応援企業に関する規約」の内容を確認し、同意します。*
                    </span>
                  </label>

                  {status === "error" && (
                    <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3">
                      {errorMsg}
                    </p>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10">
                    <p className="text-[11px] text-white/50">送信内容はAG運営に直接届きます（非公開）</p>
                    <motion.button
                      type="submit"
                      disabled={!valid || status === "loading"}
                      whileHover={valid ? { scale: 1.03 } : undefined}
                      whileTap={valid ? { scale: 0.97 } : undefined}
                      className={`inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-display tracking-[0.25em] text-xs uppercase transition-all ${
                        valid
                          ? "bg-gradient-to-r from-neon-cyan via-awa-glow to-neon-cyan text-awa-indigo-950 font-bold shadow-neon"
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
                    className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-neon-cyan/10 border border-neon-cyan shadow-neon mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-neon-cyan" />
                  </motion.div>
                  <h3 className="font-display font-black text-3xl text-white mb-4">ありがとうございます。</h3>
                  <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                    お問い合わせを受け付けました。
                    <br />
                    内容を確認の上、いただいたメールアドレスへ
                    <br />
                    AG運営よりご連絡いたします。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* 注意書き＋最終更新日 */}
        <div className="rounded-2xl border border-white/10 bg-awa-indigo-950/50 p-6 md:p-7">
          <p className="text-xs md:text-sm text-white/55 leading-relaxed">
            本ページはAGがスポンサーおよび応援企業を選定するための基本方針を定めたものです。
            個別の契約条件は、スポンサー契約書または合意書において別途定めます。
          </p>
          <p className="mt-4 text-[11px] text-white/40 font-display tracking-[0.2em]">
            最終更新日：{LAST_UPDATED}
          </p>
        </div>
      </div>
    </PageTransition>
  );
}

// --- 小物 ---

function PolicySection({
  num,
  eyebrow,
  title,
  children,
}: {
  num: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="grid place-items-center w-9 h-9 rounded-lg border border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan font-display font-black text-sm">
          {num}
        </span>
        <div>
          <div className="text-[10px] font-display tracking-[0.35em] text-neon-cyan">{eyebrow}</div>
          <h2 className="text-xl md:text-2xl font-display font-black text-white leading-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-display tracking-[0.25em] text-neon-cyan">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-awa-indigo-950/60 border border-white/10 focus:border-neon-cyan focus:shadow-neon rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all resize-y"
    />
  );
}
