import {
  Crown,
  HeartPulse,
  Gamepad2,
  Sparkles,
  Cpu,
  Megaphone,
  Mic2,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StaffMember = {
  id: string;
  role: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: "cyan" | "magenta" | "violet" | "warmth";
  rank: string;
  callsign: string;
};

export const staff: StaffMember[] = [
  {
    id: "STAFF-001",
    role: "代表 / FOUNDER",
    name: "ぼーるくん",
    tagline: "徳島から世界へ。挑戦する全ての人の旗を立てる。",
    icon: Crown,
    accent: "magenta",
    rank: "S+",
    callsign: "BALL",
  },
  {
    id: "STAFF-002",
    role: "チームトレーナー / TRAINER",
    name: "さみ整体",
    tagline: "勝つ身体は、整った身体から。",
    icon: HeartPulse,
    accent: "cyan",
    rank: "S",
    callsign: "SAMI",
  },
  {
    id: "STAFF-003",
    role: "レジェンドプレーヤー / LEGEND",
    name: "キング森崎",
    tagline: "経験と直感で、若い力を導く。",
    icon: Gamepad2,
    accent: "violet",
    rank: "LEGEND",
    callsign: "KING",
  },
  {
    id: "STAFF-004",
    role: "デザインアドバイザー / DESIGN",
    name: "ゼノブランディング岩佐",
    tagline: "ブランドは熱を帯びて初めて伝わる。",
    icon: Sparkles,
    accent: "magenta",
    rank: "S",
    callsign: "XENO",
  },
  {
    id: "STAFF-005",
    role: "テクニカルアドバイザー / TECH",
    name: "四国大学 長瀬教授",
    tagline: "学術と現場をつなぐ思考の架け橋。",
    icon: Cpu,
    accent: "cyan",
    rank: "S",
    callsign: "NAGASE",
  },
  {
    id: "STAFF-006",
    role: "チームアドバイザー / ADVISOR",
    name: "トーキンさん",
    tagline: "戦略と人を見るリアリスト。",
    icon: Shield,
    accent: "warmth",
    rank: "A+",
    callsign: "TOKIN",
  },
  {
    id: "STAFF-007",
    role: "実況サポーター / CASTER",
    name: "コンソメさん",
    tagline: "歓声を、勝利の追い風に。",
    icon: Mic2,
    accent: "magenta",
    rank: "A+",
    callsign: "CONSO",
  },
];

export const players = [
  "ホーク",
  "にっしん",
  "カジコ",
  "ボール",
  "キング",
  "岩ちゃん",
  "梅ドリル",
  "トーキン",
];

export type NewsItem = {
  date: string;
  category: "EVENT" | "NEWS" | "MATCH";
  title: string;
  excerpt: string;
};

export const news: NewsItem[] = [
  {
    date: "2026.05.18",
    category: "EVENT",
    title: "第1回 徳島練習会開催決定！",
    excerpt:
      "徳島市内のe-sportsスペースを借りて、所属プレーヤーと参加希望者の合同練習会を開催します。観戦のみのご参加もOK。",
  },
  {
    date: "2026.05.05",
    category: "NEWS",
    title: "AWA ESPORTS チーム公式始動！",
    excerpt:
      "ロゴ、チームカラー、メンバー体制を発表。地域に根ざしたe-sportsチームとして、徳島の盛り上げに本気で挑みます。",
  },
  {
    date: "2026.04.28",
    category: "MATCH",
    title: "オンライン交流戦：四国カップ参加表明",
    excerpt:
      "四国4県のチームが参加するオンライン交流大会への参加を決定。徳島代表として、阿波の名に懸けて挑みます。",
  },
  {
    date: "2026.04.15",
    category: "NEWS",
    title: "公式SNS（X / Instagram / YouTube）開設",
    excerpt:
      "練習風景、メンバーの素顔、戦略談義などを継続的に発信していきます。ぜひフォローを！",
  },
];

export const partnerPlans = [
  {
    code: "P-01",
    title: "地域活性パートナー",
    subtitle: "メインスポンサー想定",
    monthly: "応相談",
    summary:
      "徳島のシンボルとなるような深い提携。チームの中核を、共に。",
    benefits: [
      "ユニフォーム前面ロゴ掲載",
      "公式HPトップへの大型バナー",
      "イベント共催・冠スポンサー権",
      "練習会・大会MCでのアナウンス",
      "SNSでの定期紹介（月4回以上）",
      "プレスリリース連名",
    ],
    accent: "magenta" as const,
    featured: true,
  },
  {
    code: "P-02",
    title: "トレーニングサポーター",
    subtitle: "地元企業・店舗向け",
    monthly: "月額 ¥30,000〜",
    summary:
      "練習会・交流会の現場でPRできる、実感のある応援枠。",
    benefits: [
      "公式HPロゴ掲載",
      "SNSでの紹介（月1回）",
      "練習会会場でのPR機会",
      "選手のサイン入りグッズ提供",
      "チーム公式LINEでの限定情報",
    ],
    accent: "cyan" as const,
    featured: false,
  },
  {
    code: "P-03",
    title: "個人・商店街サポーター",
    subtitle: "応援メンバー枠",
    monthly: "月額 ¥1,000〜",
    summary:
      "お名前・店名でチームの背中を押せる、地域の応援枠。",
    benefits: [
      "公式HPサポーター一覧へのお名前掲出",
      "練習会へのご招待（年2回）",
      "限定ステッカー進呈",
      "応援メッセージのSNS紹介",
    ],
    accent: "warmth" as const,
    featured: false,
  },
];
