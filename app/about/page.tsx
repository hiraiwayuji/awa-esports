"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import NeonButton from "@/components/NeonButton";
import PageTransition from "@/components/PageTransition";
import HoverMediaSlideshow, {
  type Media,
} from "@/components/HoverMediaSlideshow";
import AboutHoverArt from "@/components/AboutHoverArt";
import {
  Flame,
  Building2,
  Mountain,
  Waves,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";

type CultureCard = {
  icon: typeof Flame;
  title: string;
  en: string;
  desc: string;
  slug: "awa-odori" | "iya-kazurabashi" | "naruto-uzushio" | "machi-asobi";
  fallbackColor: string;
  /**
   * 背景に流すメディア。空配列のままでも動作（フォールバックパターン表示）。
   * 素材を入れる場合：public/about/<slug>/N.jpg を配置し、
   * { type: "image", src: "/about/<slug>/N.jpg" } を追加するだけ。
   * 動画は { type: "video", src: "/about/<slug>/N.mp4" } 。
   */
  media: Media[];
};

const cultureCards: CultureCard[] = [
  {
    icon: Flame,
    title: "阿波踊り",
    en: "AWA-ODORI",
    desc: "夏の夜を熱狂で染める日本最大級の踊り。徳島の血に流れる「躍動と一体感」は、eスポーツの観戦体験そのもの。",
    slug: "awa-odori",
    fallbackColor: "#2DFFB7",
    media: [
      // 例: { type: "image", src: "/about/awa-odori/1.jpg", alt: "阿波踊り" },
      // 例: { type: "video", src: "/about/awa-odori/loop.mp4" },
    ],
  },
  {
    icon: Mountain,
    title: "祖谷のかずら橋",
    en: "WILD NATURE",
    desc: "落人がかずらを編んで谷を渡った、徳島の秘境。自然と渡り合う粘り強さが、いまも徳島の暮らしに息づいている。",
    slug: "iya-kazurabashi",
    fallbackColor: "#2DFFB7",
    media: [],
  },
  {
    icon: Waves,
    title: "鳴門の渦潮",
    en: "NATURAL WONDER",
    desc: "世界三大潮流のひとつ。海をうねらせる巨大な渦の迫力は、徳島が持つ自然の力の象徴。",
    slug: "naruto-uzushio",
    fallbackColor: "#2DFFB7",
    media: [],
  },
  {
    icon: Building2,
    title: "マチ★アソビ",
    en: "POP CULTURE",
    desc: "徳島市街全体が舞台のサブカルチャー祭典。観客を巻き込み「街そのものを盛り上げる」DNAが息づく。",
    slug: "machi-asobi",
    fallbackColor: "#2DFFB7",
    media: [],
  },
];

const ranks = [
  {
    rank: "S",
    label: "LEGEND",
    desc: "全国レベルの実績、または圧倒的なチーム貢献。",
    color: "from-awa-glow to-awa-glow",
  },
  {
    rank: "A",
    label: "VANGUARD",
    desc: "県大会・主要大会で結果を残した中核プレイヤー。",
    color: "from-awa-glow to-neon-cyan",
  },
  {
    rank: "B",
    label: "RISING",
    desc: "練習会で頭角を表し、伸び盛り。チーム公式戦の舞台へ。",
    color: "from-neon-cyan to-neon-blue",
  },
  {
    rank: "C",
    label: "ROOKIE",
    desc: "始めたばかりでもOK。ここからキャリアが始まる。",
    color: "from-white/40 to-white/10",
  },
];

export default function AboutPage() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-36 pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="ABOUT US / 私たちについて"
            title="徳島には、世界へ届く熱がある。"
            subtitle={
              <>
                祭りが、自然が、文化が、徳島を世界の舞台へ押し上げてきた。
                <br />
                次の主役はeスポーツ。私たちは、徳島の物語に新しい1ページを書き加える。
              </>
            }
          />
        </div>
      </section>

      {/* Culture */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cultureCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx((h) => (h === i ? null : h))}
                onFocus={() => setHoverIdx(i)}
                onBlur={() => setHoverIdx((h) => (h === i ? null : h))}
                tabIndex={0}
                className="group relative rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-8 hover:border-awa-glow/40 hover:shadow-glow transition-all duration-500 overflow-hidden"
              >
                {/* ホバー時の背景演出 */}
                {c.media.length > 0 ? (
                  <HoverMediaSlideshow
                    media={c.media}
                    active={hoverIdx === i}
                    fallbackColor={c.fallbackColor}
                    interval={3500}
                    maxOpacity={0.4}
                  />
                ) : (
                  <AboutHoverArt slug={c.slug} active={hoverIdx === i} />
                )}

                {/* カード本体 */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 grid place-items-center rounded-lg border border-awa-glow/30 bg-awa-glow/5 backdrop-blur">
                      <c.icon className="w-5 h-5 text-awa-glow" />
                    </div>
                    <span className="text-[10px] tracking-[0.3em] font-display text-white/30">
                      {c.en}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{c.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{c.desc}</p>
                </div>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-awa-glow transition-all duration-500 group-hover:w-full z-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative py-32">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-neon-cyan/30 bg-awa-indigo-900/50 backdrop-blur-md p-10 md:p-16 overflow-hidden neon-border"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-awa-glow/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-neon-cyan/20 blur-3xl" />
            <div className="relative z-10">
              <div className="text-xs font-display tracking-[0.4em] text-neon-cyan mb-4">
                MANIFESTO / 私たちの誓い
              </div>
              <h3 className="font-display font-black text-3xl md:text-5xl text-white leading-tight">
                <span className="block">誰でもメンバーになれる。</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-awa-glow to-neon-cyan">
                  仲間と一緒に、本気になれる。
                </span>
              </h3>
              <div className="mt-8 grid md:grid-cols-2 gap-6 text-white/70 leading-relaxed">
                <p>
                  eスポーツは、年齢・性別・過去の競技経験を超えて、フラットに人を結びつける。
                  学生にも、社会人にも、子どもや親子にも、リタイア世代にも、新しい挑戦の舞台がある。
                </p>
                <p>
                  「徳島ルーツを大切にする」というスタンスは、線引きではなく、この地域への愛着の証。
                  徳島に縁を持つ人を中心に、これから挑戦したい人、仲間と成長したい人を、私たちは歓迎する。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Identity: A.G. = AWAKEN GLOW */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative grid md:grid-cols-[auto,1fr] items-center gap-10 md:gap-16 rounded-3xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-10 md:p-16 overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-awa-glow/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-neon-cyan/15 blur-3xl" />

            <div className="relative z-10 flex justify-center">
              <svg viewBox="0 0 80 88" className="w-32 md:w-44">
                <defs>
                  <linearGradient id="agAboutGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="100%" stopColor="#2DFFB7" />
                  </linearGradient>
                </defs>
                <path
                  d="M 40 6 L 74 16 L 74 48 C 74 66 60 78 40 82 C 20 78 6 66 6 48 L 6 16 Z"
                  fill="rgba(7,11,31,0.6)"
                  stroke="url(#agAboutGrad)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <text
                  x="40"
                  y="56"
                  textAnchor="middle"
                  fontFamily="Orbitron"
                  fontWeight="900"
                  fontSize="28"
                  fill="#FFFFFF"
                  letterSpacing="-1"
                >
                  AG
                </text>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="text-xs font-display tracking-[0.4em] text-awa-glow mb-3">
                BRAND IDENTITY / 名前の意味
              </div>
              <div className="font-display font-black leading-tight">
                <span className="block text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-br from-neon-cyan to-awa-glow">
                  A.G.
                </span>
                <span className="block text-2xl md:text-3xl text-white mt-2">
                  = AWAKEN GLOW
                </span>
              </div>
              <p className="mt-6 text-white/70 leading-relaxed">
                AWAKEN GLOW という名前には、一人ひとりの中にある可能性や個性を目覚めさせ、
                それぞれの形で輝ける場所をつくりたい、という想いを込めています。
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                上手い人だけが集まるチームではなく、これから挑戦したい人、仲間と成長したい人、
                徳島から新しい文化を一緒につくりたい人のためのチーム。
              </p>
              <p className="mt-4 text-white/70 leading-relaxed">
                ゲームを通して、人と人がつながり、挑戦するきっかけが生まれる場所へ。
              </p>
              <p className="mt-6 text-base md:text-lg font-display text-awa-glow">
                &quot;Awaken your Glow. Grow together from Tokushima.&quot;
              </p>
              <p className="mt-2 text-sm text-white/50">
                徳島から始まる、新しいeスポーツコミュニティを。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Concept: Not Pro */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative grid md:grid-cols-[auto,1fr] items-center gap-10 md:gap-16 rounded-3xl border border-awa-glow/30 bg-awa-indigo-900/40 backdrop-blur-md p-10 md:p-16 overflow-hidden"
          >
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-awa-glow/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-neon-cyan/15 blur-3xl" />
            <div className="relative z-10">
              <div className="text-xs font-display tracking-[0.4em] text-awa-glow mb-3">
                OUR STANCE / 私たちの立ち位置
              </div>
              <div className="font-display font-black leading-none">
                <span className="block text-6xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-awa-glow via-awa-glow to-neon-cyan">
                  NOT PRO.
                </span>
                <span className="block text-white/85 text-2xl md:text-3xl mt-4 leading-snug">
                  草野球感覚で、
                  <br />
                  本気になる。
                </span>
              </div>
            </div>
            <div className="relative z-10 space-y-4 text-white/70 leading-relaxed">
              <p>
                私たちは選手にギャラを払うトッププロチームではない。
              </p>
              <p>
                AWAKEN GLOW は、参加者が会費を出し合って集まる、
                <br />
                地域に根ざした<span className="text-neon-cyan">「草野球感覚」</span>のeスポーツチーム。
              </p>
              <p>
                腕前ではなく、ゲームと徳島が好きという気持ちを持ち寄る場所。
                <br />
                だから誰でも、何歳でも、いつから始めても歓迎する。
              </p>
              <p className="text-white/40 text-xs pt-2">
                ※ 通常活動は会場利用料を参加メンバーで分担する形式です。詳細は入会時にご案内します。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rank System */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="RANK SYSTEM"
            title="あなたのペースで、上へ。"
            subtitle={
              <>
                所属プレイヤーには公式ランクが付与される。
                <br />
                スキルだけでなく、チームへの貢献、地域への発信も含めた多面的な評価で、誰もが上を目指せる。
              </>
            }
          />
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ranks.map((r, i) => (
              <motion.div
                key={r.rank}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur p-6 hover:border-white/30 transition-all overflow-hidden"
              >
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${r.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}
                />
                <div className="relative z-10">
                  <div
                    className={`inline-block font-display font-black text-6xl bg-clip-text text-transparent bg-gradient-to-br ${r.color}`}
                  >
                    {r.rank}
                  </div>
                  <div className="mt-2 text-xs tracking-[0.3em] font-display text-white/60">
                    {r.label}
                  </div>
                  <p className="mt-4 text-sm text-white/60 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              {
                icon: TrendingUp,
                title: "プレイ実績",
                desc: "公式戦・大会での結果",
              },
              { icon: Users, title: "チーム貢献", desc: "練習会運営・後進育成" },
              {
                icon: Award,
                title: "地域発信",
                desc: "SNS発信・イベント参加",
              },
            ].map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-awa-indigo-900/30"
              >
                <m.icon className="text-neon-cyan w-5 h-5 mt-1" />
                <div>
                  <div className="text-sm font-bold text-white">{m.title}</div>
                  <div className="text-xs text-white/50 mt-1">{m.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8 text-center">
          <h3 className="font-display font-black text-3xl md:text-4xl text-white">
            あなたの挑戦が、徳島の次の物語になる。
          </h3>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <NeonButton href="/join">JOIN US</NeonButton>
            <NeonButton href="/members" variant="ghost">
              MEMBERS
            </NeonButton>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
