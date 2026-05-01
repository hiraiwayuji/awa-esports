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

export type StaffBio = {
  headline?: string;
  paragraphs: string[];
  highlights?: string[];
  links?: { label: string; url: string }[];
};

export type StaffMember = {
  id: string;
  role: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: "cyan" | "magenta" | "violet" | "warmth";
  rank: string;
  callsign: string;
  bio?: StaffBio;
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
    bio: {
      headline: "徳島・川内町で「からだ鍼灸整骨院」を営む傍ら、複数のプロジェクトを並走させる連続事業家。",
      paragraphs: [
        "徳島市川内町で「からだ鍼灸整骨院」を運営し、地域の人々の身体と暮らしに寄り添ってきた。「身体」「地域」「テクノロジー」を一本の線でつなぐ視点で、AWA ESPORTS の旗を立てた。",
        "経歴も年齢もキャリアも関係なく、本気で挑戦する全ての人の背中を押すこと。それが旗振り役としての信条であり、徳島から世界へ届けたい価値観そのものでもある。",
      ],
      highlights: [
        "AWA ESPORTS 創業者・代表",
        "からだ鍼灸整骨院 代表（徳島市川内町）",
        "「徳島発」の挑戦を仕掛ける連続事業家",
      ],
    },
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
    bio: {
      headline: "AWA ESPORTSの精神的支柱。世代を越えて若い力を導く生粋のプレーヤー。",
      paragraphs: [
        "長年プレーヤーとして第一線で戦い続けてきた経験から、盤面の流れを瞬時に読み取り、勝負所での一手で「勝ち方」を背中で見せる。チームの戦術ベースを支える存在。",
        "感性と論理の両輪で若手を導き、AWA ESPORTSの文化と勝者のメンタリティを形にしていく役割を担う。",
      ],
      highlights: [
        "LEGENDクラス所属プレーヤー",
        "若手育成・チーム文化形成の中核",
        "プレーヤー兼メンターとして二刀流",
      ],
    },
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
    bio: {
      headline: "四国大学で教育工学を専門とし、eスポーツによる地域活性化を研究。徳島eスポーツ協会の企画委員も務める。",
      paragraphs: [
        "ブレンデッド・ラーニング、プログラミング教育、ファブリケーション教育を軸に、情報学と教育学を学際的に研究。近年はeスポーツによる地域活性化、および障がい学生に対するアクセシビリティ改善に取り組む。",
        "年50回以上、学校・老人ホーム・障がい児施設などでeスポーツの講演会・体験会を支援。学術と現場、世代と地域を結ぶ思考の架け橋として、AWA ESPORTSの戦略的バックボーンを支える。",
      ],
      highlights: [
        "四国大学 情報教育センター 所属",
        "徳島eスポーツ協会 企画委員",
        "専門：教育工学・プログラミング教育・eスポーツ地域活性化",
      ],
    },
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
    bio: {
      headline: "数字と現場の両方を冷静に見つめる、AWA ESPORTSの実利派アドバイザー。",
      paragraphs: [
        "感情論に流されず、「勝つために必要なこと」と「いま削るべきこと」を明確に言語化するリアリスト。短期と長期、両方の視座でチーム運営を俯瞰し、判断の精度を底上げする。",
        "現役プレーヤーとしても活動しており、現場の温度感とアドバイザー視点を行き来できる稀有な存在。「人」を見る目で組織を動かす。",
      ],
      highlights: [
        "チームアドバイザー兼 現役プレーヤー",
        "戦略立案・組織運営における実利判断",
        "数字と感情、両軸での冷静な判断力",
      ],
    },
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
  "シオン",
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
