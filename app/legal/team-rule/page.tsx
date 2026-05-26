import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import {
  UserPlus,
  ShieldOff,
  Megaphone,
  CalendarCheck,
  LogOut,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "チーム規約 — AWAKEN GLOW",
  description:
    "AWAKEN GLOW のチーム規約。初心者・学生・地域プレイヤーまで、すべてのメンバーが安心して活動できるための最低限のルールと方針。",
};

type RuleSection = {
  num: string;
  title: string;
  Icon: LucideIcon;
  items: string[];
  note?: string;
};

const sections: RuleSection[] = [
  {
    num: "01",
    title: "加入について",
    Icon: UserPlus,
    items: [
      "AWAKEN GLOW は初心者も歓迎します",
      "運営判断により加入をお断りする場合があります",
      "未成年者は保護者同意が必要です",
    ],
  },
  {
    num: "02",
    title: "禁止事項",
    Icon: ShieldOff,
    items: [
      "チート、不正行為",
      "暴言、誹謗中傷、差別発言",
      "ハラスメント行為",
      "他メンバーへの迷惑行為",
      "無断でのチーム名利用",
      "チームイメージを著しく損なう行為",
      "犯罪行為または反社会的勢力との関与",
    ],
  },
  {
    num: "03",
    title: "SNS・配信について",
    Icon: Megaphone,
    items: [
      "SNSや配信活動は自由を尊重",
      "ただし他者への配慮を必須",
      "炎上行為は禁止",
      "切り抜きや写真をチーム広報に使用する場合あり",
    ],
  },
  {
    num: "04",
    title: "チーム活動について",
    Icon: CalendarCheck,
    items: [
      "活動参加は強制ではない",
      "学業・仕事・私生活を優先可能",
      "イベントや対戦会への協力をお願いする場合あり",
    ],
  },
  {
    num: "05",
    title: "退会・除名",
    Icon: LogOut,
    note: "以下の場合は運営判断で除名となることがあります。",
    items: [
      "重大な規約違反",
      "チート行為",
      "継続的な迷惑行為",
      "チームの信用失墜行為",
    ],
  },
  {
    num: "06",
    title: "規約変更",
    Icon: RefreshCw,
    items: [
      "運営は必要に応じて本規約を変更できるものとします",
      "変更時は Discord・SNS・HP 等で告知します",
    ],
  },
];

export default function TeamRulePage() {
  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative pt-36 pb-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8 relative">
          {/* watermark */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-0 right-0 select-none font-display font-black text-[18vw] md:text-[13vw] lg:text-[10rem] leading-none tracking-tighter text-awa-glow/[0.05] uppercase whitespace-nowrap overflow-hidden"
          >
            TEAM RULE
          </span>

          <div className="relative">
            <SectionTitle
              eyebrow="LEGAL / チーム規約"
              title="TEAM RULE"
              subtitle={
                <>
                  みんなが安心して楽しめるための、
                  <br />
                  AWAKEN GLOW のチームガイドライン。
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* CONCEPT */}
      <section className="relative pb-14">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="relative rounded-2xl border border-neon-cyan/30 bg-awa-indigo-900/40 backdrop-blur-md p-7 md:p-10 overflow-hidden">
            {/* subtle glow accent */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neon-cyan/[0.05] via-transparent to-awa-glow/[0.05]" />
            <div className="relative space-y-4 text-[15px] md:text-base text-white/85 leading-relaxed">
              <p>
                AWAKEN GLOW は、
                <br className="hidden md:block" />
                「eスポーツを通じて人が成長できる場所」を目指す
                <br className="hidden md:block" />
                コミュニティ型eスポーツチームです。
              </p>
              <p>
                初心者・学生・競技志向プレイヤーまで、
                <br className="hidden md:block" />
                互いを尊重しながら成長できる環境づくりを大切にしています。
              </p>
              <p>
                本規約は、
                <br className="hidden md:block" />
                すべてのメンバーが安心して活動できるよう、
                <br className="hidden md:block" />
                最低限のルールと方針を定めるものです。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RULE CARDS */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="grid gap-5">
            {sections.map(({ num, title, Icon, items, note }) => (
              <article
                key={num}
                className="group relative rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-6 md:p-8 transition-colors hover:border-neon-cyan/40"
              >
                {/* corner accent */}
                <span className="pointer-events-none absolute top-0 left-0 h-px w-16 bg-gradient-to-r from-neon-cyan to-transparent" />

                <div className="flex items-start gap-4 mb-5">
                  <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl border border-neon-cyan/40 bg-awa-indigo-950/60 text-neon-cyan">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-[0.3em] text-neon-cyan/70">
                      {num}
                    </span>
                    <h2 className="font-display tracking-[0.08em] text-white text-lg md:text-xl mt-0.5">
                      {title}
                    </h2>
                  </div>
                </div>

                {note && (
                  <p className="text-sm text-white/70 mb-3 leading-relaxed">
                    {note}
                  </p>
                )}

                <ul className="space-y-2 text-sm md:text-[15px] text-white/80 leading-relaxed">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-neon-cyan/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* CLOSING */}
          <div className="mt-10 rounded-2xl border border-awa-glow/30 bg-gradient-to-br from-awa-glow/[0.06] via-awa-indigo-900/40 to-neon-cyan/[0.04] backdrop-blur-md p-7 md:p-9">
            <p className="text-sm md:text-base text-white/85 leading-relaxed text-center">
              本規約は、
              <br className="sm:hidden" />
              AWAKEN GLOW を安心して楽しめる
              <br className="hidden md:block" />
              コミュニティにするためのガイドラインです。
            </p>
          </div>

          <div className="mt-8 text-xs text-white/40 text-center">
            運営：AWAKEN GLOW（代表：平岩裕治）
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
