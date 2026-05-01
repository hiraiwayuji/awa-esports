import {
  Crown,
  HeartPulse,
  Gamepad2,
  Sparkles,
  Cpu,
  Megaphone,
  Mic2,
  Shield,
  Rocket,
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
  avatarUrl?: string;
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
    avatarUrl: "/members/BALL.jpg",
    bio: {
      headline: "元・徳島ヴォルティスのマスコット「ぼーるくん」。現在は藍住で「ボール接骨院」を営みつつ、副業で動画編集も手がける、領域横断の連続事業家。",
      paragraphs: [
        "徳島ヴォルティス（J-League）の人気マスコット「ぼーるくん」として、地元・徳島の応援文化のど真ん中に長く立ってきた人物。プロサッカークラブの現場で磨かれた「人を巻き込み、熱量で空気をつくる」感覚は、AWA ESPORTSのチームビルディングの礎にもなっている。",
        "現在は徳島県藍住町で「ボール接骨院」を経営しながら、副業で動画編集にも取り組むなど、領域を越えて挑戦を続ける。「徳島から世界へ」を旗印に、経歴も年齢も関係なく、本気で挑む全ての人の背中を押す──それがAWA ESPORTS代表としての信条。",
      ],
      highlights: [
        "AWA ESPORTS 創業者・代表",
        "元 徳島ヴォルティス公式マスコット「ぼーるくん」",
        "ボール接骨院 代表（徳島県藍住町）",
        "副業：動画編集",
      ],
      links: [
        { label: "X (@borukuntkv)", url: "https://x.com/borukuntkv" },
        { label: "ボール接骨院", url: "https://ballsekkotsuin.com" },
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
    avatarUrl: "/members/SAMI.png",
    bio: {
      headline: "出張・訪問専門の整体「さみ整体」を運営。独自の「RE-BODY施術」で、動く身体を本来の状態に戻すトレーナー。",
      paragraphs: [
        "ご自宅・現場に伺うスタイルの出張・訪問専門整体「さみ整体」を運営。独自の「RE-BODY施術」で、選手や生活者の身体ケアを担う。徳島のBMXシーンや地元の接骨院ネットワークと密接につながり、現場で動き続ける身体に寄り添ってきた人物。",
        "AWA ESPORTSにおいては「勝つ身体は、整った身体から」という信条のもと、長時間プレーで歪みやすいプレーヤーの姿勢・コンディションを根本から整える。チームのパフォーマンス基盤を、身体面から支える存在。",
      ],
      highlights: [
        "さみ整体 主宰（徳島・出張/訪問専門）",
        "独自の「RE-BODY施術」",
        "BMX・地元接骨院ネットワークと密接連携",
        "前日予約推奨／LINEで受付",
      ],
      links: [
        { label: "Instagram", url: "https://www.instagram.com/sami.seitai/" },
        { label: "LINE予約", url: "https://lin.ee/sFWvNlQ" },
      ],
    },
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
    avatarUrl: "/members/KING.jpg",
    bio: {
      headline: "BMXフラットランド初代世界王者。「BMX界のKING」と称される、徳島が世界に誇るレジェンド。",
      paragraphs: [
        "徳島県藍住町出身。高校2年の時にテレビCMで見たBMXフラットランドに一目ぼれし、1994年から競技を開始。2001年に国内年間王者に輝き、2007年には3カ国を転戦する同競技史上初の世界サーキットで初代総合王者となる。",
        "2018年のFISE広島では日本人最年長にして5位入賞を果たし、再起を決断。現在は徳島でBMXスクール「Logical BMX」を主宰しながら次世代の育成に力を注ぐ。「世界一の身体感覚」と「プレッシャー下での集中力」をAWA ESPORTSに持ち込み、競技横断の知見でチームを底上げする存在。",
      ],
      highlights: [
        "BMXフラットランド 初代世界王者（2007年）",
        "BMX国内年間王者（2001年）",
        "FISE広島 日本人最年長5位入賞（2018年）",
        "BMXスクール「Logical BMX」主宰",
      ],
      links: [
        { label: "Instagram (本人)", url: "https://www.instagram.com/hiroyamorizaki/" },
        { label: "Logical BMX", url: "https://www.instagram.com/logical_bmx/" },
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
    avatarUrl: "/members/XENO.jpg",
    bio: {
      headline: "徳島・藍住町を拠点に活動するブランディングデザイナー（UGDESIGN代表）。戦略から伴走するクリエイティブで、AWA ESPORTSのブランドを磨く。",
      paragraphs: [
        "18歳で地元徳島の製造業からキャリアをスタートし、大阪での製造業勤務と並行して専門学校でWEB制作を学ぶ。徳島に戻ってネットショップのデザイナーとして従事した後、マーケティングとWebサイト開発の領域で経験を積み、2023年に独立。現在はUGDESIGNとして、ロゴ・Web・販促物の戦略設計から制作までを一貫して手がける。",
        "「見た目だけではないデザイン」を信条に、要件定義からブランドの輪郭を引き直し、クライアントとポジティブな関係を築きながら制作するスタイル。AWA ESPORTSのブランドが「徳島から世界へ」届く熱量を持てるよう、ビジュアル面の最終ジャッジを担う。",
      ],
      highlights: [
        "UGDESIGN 代表（徳島県藍住町）",
        "ロゴ・Web・販促物の戦略設計から一貫制作",
        "Delivery's Kitchen 青山／BARBERSHOP HOME ほか実績多数",
      ],
      links: [
        { label: "Instagram", url: "https://www.instagram.com/xeno.branding/" },
        { label: "UGDESIGN", url: "https://ugdesign.jp" },
      ],
    },
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
    avatarUrl: "/members/NAGASE.jpg",
    bio: {
      headline: "四国大学 情報教育センター 講師。教育工学を専門とし、eスポーツによる地域活性化と「光・夢工房」事業を牽引。",
      paragraphs: [
        "プログラミング教育、カリキュラム・マネジメント、知的情報システム開発を学際的に研究。近年はeスポーツによる地域活性化、および障がい学生に対するアクセシビリティ改善に取り組み、ダイバーシティ・マネジメントを通じた新価値創造を目指している。",
        "T-LAP（徳島光・アート教育人材育成事業）「光・夢工房」を担当し、AI時代を担うK-12（小中高生）層の人材育成にも従事。学術と現場、世代と地域を結ぶ思考の架け橋として、AWA ESPORTSの戦略的バックボーンを支える。",
      ],
      highlights: [
        "四国大学 情報教育センター 講師",
        "T-LAP「光・夢工房」担当",
        "徳島eスポーツ協会 企画委員",
        "専門：教育工学・プログラミング教育・eスポーツ地域活性化",
      ],
      links: [
        { label: "T-LAP プロフィール", url: "https://www.shikoku-u.ac.jp/t-lap/team/" },
        { label: "KAKEN（研究者情報）", url: "https://nrid.nii.ac.jp/ja/nrid/1000050781019/" },
      ],
    },
  },
  {
    id: "STAFF-006",
    role: "チームアドバイザー / ADVISOR",
    name: "トーキン",
    tagline: "戦略と人を見るリアリスト。",
    icon: Shield,
    accent: "warmth",
    rank: "A+",
    callsign: "TOKIN",
    avatarUrl: "/members/TOKIN.jpg",
    bio: {
      headline: "ストリートファイター6 ジュリ使い／アジア9位。徳島のFGC（格闘ゲームコミュニティ）を牽引する、現場主義のアドバイザー。",
      paragraphs: [
        "ストリートファイター6でアジア9位の実績を持つトッププレーヤー。徳島のSF6対戦会「Fighters Crossover徳島」を主催し、地元の格闘ゲームコミュニティを実地で温め続けている、徳島FGCのハブ的存在。",
        "選手としての修羅場とコミュニティ運営の両方を経験しているからこその実利感覚で、AWA ESPORTSにおいては「勝つために必要なこと」と「いま削るべきこと」を冷静に言語化。戦略と人を見るリアリストとして、チームの判断軸を支える。",
      ],
      highlights: [
        "ストリートファイター6 アジア9位（ジュリ使い）",
        "SF6対戦会「Fighters Crossover徳島」主催",
        "徳島FGCコミュニティの中核ハブ",
      ],
      links: [
        { label: "X (@talkin1978)", url: "https://x.com/talkin1978" },
      ],
    },
  },
  {
    id: "STAFF-007",
    role: "実況サポーター / CASTER",
    name: "コンソメ",
    tagline: "歓声を、勝利の追い風に。",
    icon: Mic2,
    accent: "magenta",
    rank: "A+",
    callsign: "CONSO",
    avatarUrl: "/members/CONSO.jpg",
    bio: {
      headline: "YouTube「コンソメゲームチャンネル」運営。「変な格ゲー会」代表／TGP元代表として、徳島の格ゲーシーンを長年盛り上げ続ける実況・ハイプ役。",
      paragraphs: [
        "ゲームトーク番組・ゲーム配信を主軸にしたYouTubeチャンネル「コンソメゲームチャンネル」を運営。「変な格ゲー会」の代表として、また「TGP」の元代表として、徳島の格闘ゲームコミュニティを長年運営してきた、コミュニティハブ的存在。",
        "「明日も誰かの面白かったのために」をモットーに、現場の熱を声と編集で届ける。AWA ESPORTSにおいては、試合やイベントを実況解説で盛り上げ、観る側のテンションを最大化する CASTER ロールを担う。",
      ],
      highlights: [
        "YouTube「コンソメゲームチャンネル」運営",
        "「変な格ゲー会」代表",
        "TGP（徳島の格ゲー会）元代表",
        "ゲーム配信・実況・編集",
      ],
      links: [
        { label: "X (@2019consme)", url: "https://x.com/2019consme" },
        { label: "リンク集", url: "https://x.gd/uRl8C" },
      ],
    },
  },
  {
    id: "STAFF-008",
    role: "ローンチアドバイザー / LAUNCH ADVISOR",
    name: "DOPENESS",
    tagline: "Pave the way ─ 道を切り開く力。",
    icon: Rocket,
    accent: "violet",
    rank: "S+",
    callsign: "DOPE",
    avatarUrl: "/members/DOPE.jpg",
    bio: {
      headline: "「Pave the Way（道を切り開け）」を掲げる日本のeスポーツ組織。DNECUP・DNEWIN を主催し、Esports World Cup 2025 SF6 にも登場した実績を持つ。",
      paragraphs: [
        "合同会社DopeNess が運営する、国内eスポーツの最前線で活動する組織。「DNEWIN」「DNECUP」などのトーナメントを主催し、Esports World Cup 2025 SF6 への出場実績もある、日本eスポーツシーンを牽引する一角。",
        "ELECOM、JapanNext、REDMAGIC、hi-ho ひかり withgames などのゲーミング業界トップブランドをパートナーに持ち、業界の最新動向と運営ノウハウを蓄積。AWA ESPORTSにとっては、地方発の挑戦を全国・世界レベルへ接続する Launch Advisor として、立ち上げ期の戦略・人脈面を支える重要な存在。",
      ],
      highlights: [
        "合同会社DopeNess（国内eスポーツ組織）",
        "DNECUP／DNEWIN 主催",
        "Esports World Cup 2025 SF6 出場実績",
        "ELECOM／JapanNext／REDMAGIC ほか業界トップブランドと提携",
      ],
      links: [
        { label: "公式サイト", url: "https://www.dopeness.jp" },
        { label: "X (@dopeness2021)", url: "https://x.com/dopeness2021" },
        { label: "YouTube", url: "https://www.youtube.com/channel/UCyQ0nmrJhg4TApWDsL90V9A" },
        { label: "Linktree", url: "https://linktr.ee/DOPENESS_DNE" },
      ],
    },
  },
];

export type Player = {
  name: string;
  avatarUrl?: string;
  avatarUrlHover?: string;
};

export const players: Player[] = [
  { name: "ホーク" },
  { name: "にっしん" },
  { name: "カジコ" },
  { name: "ボール" },
  { name: "キング" },
  { name: "岩ちゃん" },
  { name: "梅ドリル" },
  { name: "トーキン" },
  {
    name: "シオン",
    avatarUrl: "/members/SHION.jpg",
    avatarUrlHover: "/members/SHION-2.jpg",
  },
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
