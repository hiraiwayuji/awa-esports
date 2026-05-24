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
      headline: "元 大塚FC（→徳島ヴォルティス）プロサッカー選手、のちにヴォルティスで「ボールくん」としてイベントで活躍。現在は藍住で「ボール接骨院」を営みつつ、副業で動画編集・AIシステム化・すだち農家も手がける、領域横断の連続事業家。",
      paragraphs: [
        "元 大塚FC（現 徳島ヴォルティスの前身）のプロサッカー選手として徳島のフットボールシーンで活躍した後、徳島ヴォルティス（J-League）で「ボールくん」としてイベントの場に立ち、地元・徳島の応援文化のど真ん中に長く居続けた人物。プロクラブの現場で磨かれた「人を巻き込み、熱量で空気をつくる」感覚は、AWAKEN GLOWのチームビルディングの礎にもなっている。",
        "現在は徳島県藍住町で「ボール接骨院」を経営しながら、副業で動画編集・AIシステム化・すだち農家にも取り組むなど、領域を越えて挑戦を続ける。「徳島から世界へ」を旗印に、経歴も年齢も関係なく、本気で挑む全ての人の背中を押す──それがAWAKEN GLOW代表としての信条。",
      ],
      highlights: [
        "本名：平岩裕治",
        "AWAKEN GLOW 創業者・代表",
        "元 大塚FC プロサッカー選手",
        "元 徳島ヴォルティス「ボールくん」（イベント出演）",
        "ボール接骨院 代表（徳島県藍住町）",
        "副業：動画編集／AIシステム化／すだち農家",
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
        "AWAKEN GLOWにおいては「勝つ身体は、整った身体から」という信条のもと、長時間プレーで歪みやすいプレーヤーの姿勢・コンディションを根本から整える。チームのパフォーマンス基盤を、身体面から支える存在。",
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
    name: "森崎弘也",
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
        "2018年のFISE広島では日本人最年長にして5位入賞を果たし、再起を決断。現在は徳島でBMXスクール「Logical BMX」を主宰しながら次世代の育成に力を注ぐ。「世界一の身体感覚」と「プレッシャー下での集中力」をAWAKEN GLOWに持ち込み、競技横断の知見でチームを底上げする存在。",
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
      headline: "徳島・藍住町を拠点に活動するブランディングデザイナー（ゼノブランディング 代表）。戦略から伴走するクリエイティブで、AWAKEN GLOWのブランドを磨く。",
      paragraphs: [
        "18歳で地元徳島の製造業からキャリアをスタートし、大阪での製造業勤務と並行して専門学校でWEB制作を学ぶ。徳島に戻ってネットショップのデザイナーとして従事した後、マーケティングとWebサイト開発の領域で経験を積み、2023年に独立。現在はゼノブランディングとして、ロゴ・Web・販促物の戦略設計から制作までを一貫して手がける。",
        "「見た目だけではないデザイン」を信条に、要件定義からブランドの輪郭を引き直し、クライアントとポジティブな関係を築きながら制作するスタイル。AWAKEN GLOWのブランドが「徳島から世界へ」届く熱量を持てるよう、ビジュアル面の最終ジャッジを担う。",
      ],
      highlights: [
        "ゼノブランディング 代表（徳島県藍住町）",
        "ロゴ・Web・販促物の戦略設計から一貫制作",
      ],
      links: [
        { label: "Instagram", url: "https://www.instagram.com/xeno.branding/" },
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
      headline: "ストリートファイター6 ジュリ使い。現場主義のアドバイザー。",
      paragraphs: [
        "選手としての修羅場とコミュニティ運営の両方を経験しているからこその実利感覚で、AWAKEN GLOWにおいては「勝つために必要なこと」と「いま削るべきこと」を冷静に言語化。戦略と人を見るリアリストとして、チームの判断軸を支える。",
      ],
      highlights: [
        "SF6対戦会「Fighters Crossover徳島」主催",
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
      headline: "YouTube「コンソメゲームチャンネル」運営。「変な格ゲー会」代表として、徳島の格ゲーシーンを長年盛り上げ続ける実況・ハイプ役。",
      paragraphs: [
        "ゲームトーク番組・ゲーム配信を主軸にしたYouTubeチャンネル「コンソメゲームチャンネル」を運営。「変な格ゲー会」の代表として、徳島の格闘ゲームコミュニティを長年運営してきた、コミュニティハブ的存在。",
        "「明日も誰かの面白かったのために」をモットーに、現場の熱を情熱と絶叫で届ける。AWAKEN GLOWにおいては、試合やイベントを実況解説で盛り上げ、観る側のテンションを最大化する CASTER ロールを担う。",
      ],
      highlights: [
        "YouTube「コンソメゲームチャンネル」運営",
        "「変な格ゲー会」代表",
        "EVO Japan 2025 ウチュメガファイト部門 2位",
        "ゲーム配信・実況・編集",
      ],
      links: [
        { label: "X (@2019consme)", url: "https://x.com/2019consme" },
        { label: "リンク集", url: "https://x.gd/uRl8C" },
      ],
    },
  },
];

export const specialThanks: StaffMember[] = [
  {
    id: "SPECIAL-001",
    role: "講師 / LECTURER",
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
        "T-LAP（徳島光・アート教育人材育成事業）「光・夢工房」を担当し、AI時代を担うK-12（小中高生）層の人材育成にも従事。学術と現場、世代と地域を結ぶ思考の架け橋として、AWAKEN GLOWの戦略的バックボーンを支える。",
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
    id: "SPECIAL-002",
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
        "ELECOM、JapanNext、REDMAGIC、hi-ho ひかり withgames などのゲーミング業界トップブランドをパートナーに持ち、業界の最新動向と運営ノウハウを蓄積。AWAKEN GLOWにとっては、地方発の挑戦を全国・世界レベルへ接続する Launch Advisor として、立ち上げ期の戦略・人脈面を支える重要な存在。",
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

export type PlayerSocials = {
  twitch?: string;
  x?: string;
  youtube?: string;
  instagram?: string;
};

export type PlayerBio = {
  headline?: string;
  paragraphs?: string[];
  highlights?: string[];
  message?: string;
};

export type PlayerSponsor = {
  name: string;
  url?: string;
  logoUrl?: string;
  tier?: "MAIN" | "SUB" | string;
};

export type PlayerStats = {
  aggression?: number;
  patience?: number;
  teamwork?: number;
  strategy?: number;
};

export type PlayerDivision = "athlete" | "creator";
export type PlayerRank = "S";
export type PlayerGame = "SF6" | "PUYO" | "VF" | "MELTY";

export type Player = {
  name: string;
  division?: PlayerDivision;
  game?: PlayerGame;
  rank?: PlayerRank;
  avatarUrl?: string;
  avatarUrlHover?: string;
  socials?: PlayerSocials;
  role?: string;
  tagline?: string;
  bio?: PlayerBio;
  sponsors?: PlayerSponsor[];
  stats?: PlayerStats;
};

export const GAME_LABELS: Record<PlayerGame, { short: string; long: string; tagline: string }> = {
  SF6: {
    short: "SF6",
    long: "STREET FIGHTER 6 部門",
    tagline: "格闘ゲームの最高峰、徳島から世界へ。",
  },
  PUYO: {
    short: "PUYO",
    long: "ぷよぷよeスポーツ 部門",
    tagline: "連鎖の美しさで魅せる、頭脳の競技。",
  },
  VF: {
    short: "VF",
    long: "VIRTUA FIGHTER 部門",
    tagline: "3D格闘の礎、読み合いの極北。",
  },
  MELTY: {
    short: "MELTY",
    long: "MELTY BLOOD 部門",
    tagline: "高速2D格闘、型月ファンタジーの系譜。",
  },
};

export const legendPlayers: Player[] = [
  {
    name: "hawk",
    division: "athlete",
    game: "SF6",
    rank: "S",
    avatarUrl: "/members/HAWK.png",
    avatarUrlHover: "/members/HAWK-2.jpg",
    role: "STREET FIGHTER 6 / 不知火舞・エド使い",
    tagline: "Patient but aggressive ─ 我慢からの一撃。",
    socials: {
      twitch: "https://www.twitch.tv/hawkfgc",
      x: "https://x.com/hawkfgc98",
    },
    bio: {
      headline: "ストリートファイター6プレーヤー。不知火舞でレジェンド帯到達、サブにエドも握るスタンダードキャラ使い。",
      paragraphs: [
        "プレイスタイルは Patient but aggressive ─ じっくり読み合いを制し、決める時は一気に攻め切る。",
        "アメリカ育ちで英語も堪能。海外勢ともそのまま渡り合える、徳島では稀有なバイリンガルプレーヤー。",
      ],
      highlights: [
        "主戦：STREET FIGHTER 6",
        "使用キャラ：不知火舞（メイン）／ エド（サブ）",
        "SF6 不知火舞 レジェンド帯到達",
        "スタイル：Patient but aggressive",
      ],
      message: "Watch my Twitch live stream — 配信、覗きにきて。",
    },
    sponsors: [
      { name: "（仮）パーソナルスポンサー A", tier: "MAIN" },
      { name: "（仮）パーソナルスポンサー B" },
    ],
    stats: {
      aggression: 75,
      patience: 80,
      teamwork: 60,
      strategy: 70,
    },
  },
  {
    name: "シオン",
    division: "athlete",
    game: "SF6",
    avatarUrl: "/members/SHION.jpg",
    avatarUrlHover: "/members/SHION-2.jpg",
    role: "STREET FIGHTER 6 → MARVEL: Tokon Fighting Souls（2026年8月移行予定）",
    tagline: "対応型。集中力で局面を読み切る。",
    socials: {
      twitch: "https://www.twitch.tv/sion0766",
      youtube: "https://www.youtube.com/@シオン-e5s",
    },
    bio: {
      headline: "ストリートファイター6プレーヤー。2026年8月、MARVEL: Tokon Fighting Souls へキャリア移行予定。",
      paragraphs: [
        "プレイスタイルは対応型。相手の手を読み切って合わせていく集中力が最大の武器。",
      ],
      highlights: [
        "主戦：STREET FIGHTER 6（〜2026年7月）",
        "今後：MARVEL: Tokon Fighting Souls（2026年8月〜）",
        "プレイスタイル：対応型",
        "強み：集中力",
        "好きなゲーム：ULTIMATE MARVEL VS. CAPCOM 3",
      ],
      message: "どこまでやれるかは分かりませんが、精一杯頑張ります。",
    },
    stats: {
      aggression: 50,
      patience: 90,
      teamwork: 65,
      strategy: 80,
    },
  },
  { name: "カジコ", division: "athlete", game: "SF6" },
  { name: "森崎弘也", division: "athlete", game: "SF6", avatarUrl: "/members/KING.jpg" },
  {
    name: "SB@963",
    division: "athlete",
    game: "SF6",
    role: "STREET FIGHTER 6 / アタッカー・サポート",
    tagline: "連携で、徳島のゲームの輪を広げる。",
    bio: {
      headline: "ストリートファイター6プレーヤー。アタッカーとサポート、状況に応じて切り替える連携重視タイプ。",
      paragraphs: [
        "プレイスタイルは攻撃的。連携力・チームワークを武器に、チームで勝つ展開を作る。",
      ],
      highlights: [
        "主戦：STREET FIGHTER 6",
        "ロール：アタッカー / サポート",
        "スタイル：攻撃的",
        "強み：連携力・チームワーク",
        "他に好きなゲーム：APEX",
      ],
      message: "徳島にもっとゲームの輪を広げるために、できることは頑張ります。",
    },
    stats: {
      aggression: 80,
      patience: 55,
      teamwork: 90,
      strategy: 65,
    },
  },
  {
    name: "オフトンスキー",
    division: "athlete",
    game: "SF6",
    role: "STREET FIGHTER 6 / 戦略型",
    tagline: "戦略型。アドリブ力で局面を切り開く。",
    bio: {
      headline: "ストリートファイター6プレーヤー。戦略を基本に置きつつ、アドリブ力で局面を切り開くタイプ。",
      paragraphs: [
        "プレイスタイルは戦略型。読みと組み立てを基本にしつつ、その場のアドリブで予想外の手を打つ。",
      ],
      highlights: [
        "主戦：STREET FIGHTER 6",
        "スタイル：戦略型",
        "強み：アドリブ力",
        "他に好きなゲーム：対人ゲーム / RPG",
      ],
      message: "成長して、結果を残したいです。",
    },
    stats: {
      aggression: 60,
      patience: 75,
      teamwork: 65,
      strategy: 90,
    },
  },
  {
    name: "HT",
    division: "athlete",
    game: "SF6",
    role: "STREET FIGHTER 6 / ザンギエフ使い",
    tagline: "伝説のザンギ使い。",
    bio: {
      headline: "徳島が誇る伝説のザンギエフ使い。一撃の重さで盤面をひっくり返す。",
      highlights: [
        "主戦：STREET FIGHTER 6",
        "使用キャラ：ザンギエフ",
        "二つ名：伝説のザンギ使い",
      ],
    },
    stats: {
      aggression: 85,
      patience: 80,
      teamwork: 55,
      strategy: 70,
    },
  },
  {
    name: "TKO",
    division: "athlete",
    game: "SF6",
    avatarUrl: "/members/TKO.jpg",
    role: "STREET FIGHTER 6",
    tagline: "経験と独創性で、昨日の自分を超える。",
    socials: {
      x: "https://x.com/TKO570707",
      youtube: "https://youtube.com/@tko-gamegallery4917",
    },
    bio: {
      headline: "KOF・バーチャファイター・ストリートファイターを渡り歩いてきたベテラン。経験と独創性を武器に徳島SF6シーンに加わる。",
      paragraphs: [
        "プレイスタイルは攻撃的。長年格闘ゲームに向き合ってきた経験値と、それを支える独創的な発想が最大の武器。",
      ],
      highlights: [
        "本名：石川 隆雄（いしかわ たかお）",
        "主戦：STREET FIGHTER 6",
        "スタイル：攻撃的",
        "強み：年齢を経た経験 × 独創性",
        "格ゲー遍歴：KOF / バーチャファイター / ストリートファイター",
      ],
      message: "昨日の自分より強くなりたいです、よろしくお願いします。",
    },
    stats: {
      aggression: 80,
      patience: 70,
      teamwork: 60,
      strategy: 85,
    },
  },
  {
    name: "Evilyuu",
    division: "athlete",
    game: "SF6",
    role: "STREET FIGHTER 6",
    tagline: "熱い心と、楽しむ心を両立する。",
    bio: {
      headline: "ストリートファイター6プレーヤー。冷静なプレイスタイルと「楽しむ心」を武器に、徳島SF6シーンに加わった新鋭。",
      highlights: [
        "主戦：STREET FIGHTER 6",
        "スタイル：冷静型",
        "強み：楽しむ心",
        "好きなゲーム：数え切れないほど",
      ],
      message: "熱い心を持ちつつも、楽しむことを忘れないように頑張ります！",
    },
    stats: {
      aggression: 65,
      patience: 80,
      teamwork: 60,
      strategy: 75,
    },
  },
  {
    name: "EXE",
    division: "athlete",
    game: "PUYO",
    avatarUrl: "/members/EXE.jpg",
    role: "ぷよぷよeスポーツ / 大連鎖重視型",
    tagline: "「EXEスペシャル」で連鎖の美を組み立てる。",
    socials: {
      x: "https://x.com/EXEshikokupuyo",
      youtube: "https://youtube.com/@exe_2424",
    },
    bio: {
      headline: "徳島ぷよぷよ界の大連鎖重視型プレーヤー。「EXEスペシャル」と名付けた独自の連鎖尾を武器に戦う。",
      paragraphs: [
        "プレイスタイルは大連鎖重視型。各種連鎖を多数組むことができるレパートリーの豊富さと、「EXEスペシャル」と名付けた独自の連鎖尾が最大の武器。",
      ],
      highlights: [
        "本名：坂本 光",
        "主戦：ぷよぷよeスポーツ",
        "プレイスタイル：大連鎖重視型",
        "得意：レパートリー豊富な連鎖構築",
        "特技：独自の連鎖尾「EXEスペシャル」",
        "好きなゲーム：ぷよぷよ / XI(sai) / GGXXΛC / MAD RAT DEAD / カービィのきらきらきっず",
      ],
      message: "徳島のぷよぷよを盛り上げられるよう、自己研鑽しながら活動していきます！",
    },
    stats: {
      aggression: 60,
      patience: 90,
      teamwork: 60,
      strategy: 95,
    },
  },
  {
    name: "あず ♀",
    division: "athlete",
    game: "PUYO",
    role: "ぷよぷよ / テトリス ほか",
    tagline: "徳島を、最強のeスポーツチームに。",
    bio: {
      headline: "読み方は「あずめす」。ぷよぷよ・テトリスを軸に、多種多様なタイトルを経験してきた、徳島の不定形ファイター。",
      paragraphs: [
        "プレイスタイルは不定形。固定の型を持たず、経験値の豊富さで状況に合わせて柔軟に戦うのが持ち味。",
      ],
      highlights: [
        "本名：森本 海（もりもと かい）",
        "主戦：ぷよぷよ / テトリス ほか",
        "強み：不定形・経験値",
        "好きなゲーム：ポケモン / スプラトゥーン / ぷよぷよ / テトリス / マリオカート / パワプロ / ドラクエ ほか",
      ],
      message: "徳島を最強のeスポーツチームに。",
    },
    stats: {
      aggression: 50,
      patience: 75,
      teamwork: 70,
      strategy: 85,
    },
  },
  {
    name: "乱世の奸雄",
    division: "athlete",
    game: "VF",
    role: "VIRTUA FIGHTER 5 REVO / 先鋒",
    tagline: "おっさんの成長を、舐めんなよ。",
    socials: {
      x: "https://x.com/ransenokanyuu1",
    },
    bio: {
      headline: "バーチャファイター5 REVO World Stage プレーヤー。団体戦先鋒固定の防御型ベテラン。大舞台でこそ真価を発揮する徳島の奸雄。",
      paragraphs: [
        "プレイスタイルは防御型。読み合いと我慢で相手の崩れを待ち、決定機で確実に仕留めるベテランの戦い方。",
      ],
      highlights: [
        "本名：井村守男",
        "主戦：バーチャファイター5 REVO World Stage",
        "団体戦ポジション：先鋒（固定）",
        "スタイル：防御型",
        "強み：大舞台で強い",
        "格ゲー遍歴：バーチャ / 餓狼伝説スペシャル ほか",
        "好きなRPG：FF2 / ロマンシング サガ / スカイリム",
      ],
      message: "おっさんの成長、舐めんなよ？",
    },
    stats: {
      aggression: 55,
      patience: 90,
      teamwork: 70,
      strategy: 80,
    },
  },
  {
    name: "てぃーる",
    division: "athlete",
    game: "MELTY",
    role: "MELTY BLOOD / 選手・広報",
    tagline: "スピードと判断で、空気を一気に変える。",
    socials: {
      x: "https://x.com/toba_mituru",
    },
    bio: {
      headline: "MELTY BLOOD プレーヤー。選手としてだけでなく、チームの広報役も担う徳島のスピード型ファイター。",
      paragraphs: [
        "プレイスタイルはスピード型。連携力・判断力・メンタルの強さを武器に、相手の対応が追いつかない速度で局面を作る。",
      ],
      highlights: [
        "主戦：MELTY BLOOD",
        "役割：選手 / 広報",
        "スタイル：スピード型",
        "強み：連携力・判断力・メンタルの強さ",
        "好きなゲーム：クロノトリガー",
      ],
      message: "徳島eスポーツを盛り上げたい！",
    },
    stats: {
      aggression: 75,
      patience: 70,
      teamwork: 85,
      strategy: 80,
    },
  },
  {
    name: "ボールくん",
    division: "creator",
    avatarUrl: "/members/BORU.jpg",
    role: "STREET FIGHTER 6 / モダンマノン使い",
    tagline: "コマ投げで、徳島の道を切り開く特攻隊長。",
    socials: {
      x: "https://x.com/borukuntkv",
    },
    bio: {
      headline: "元 大塚FC（→徳島ヴォルティス）プロサッカー選手。AWAKEN GLOW 代表が自らアタッカーとしてSF6の最前線に立つ。",
      paragraphs: [
        "プレイスタイルはモダンマノンによるコマ投げ中心。攻撃力を武器に、特攻隊長として徳島の道を切り開く。",
      ],
      highlights: [
        "本名：平岩裕治",
        "主戦：STREET FIGHTER 6（モダンマノン）",
        "ロール：アタッカー",
        "強み：攻撃力",
        "他に好きなゲーム：APEX / Ghost of Tsushima",
        "経歴：元 大塚FC プロサッカー選手 → 徳島ヴォルティス公式マスコット",
        "AWAKEN GLOW 創業者・代表",
      ],
      message: "徳島を盛り上げるために、特攻隊長として道を切り開いていきます。",
    },
    stats: {
      aggression: 95,
      patience: 45,
      teamwork: 70,
      strategy: 60,
    },
  },
  {
    name: "いわちゃん",
    division: "creator",
    avatarUrl: "/members/IWASA.jpg",
    role: "OVERWATCH（タンク）/ VALORANT（コントローラー）",
    tagline: "勝ちも、楽しさも、両方持って戦う。",
    socials: {
      instagram: "https://www.instagram.com/xeno.branding/",
    },
    bio: {
      headline: "Overwatchタンク／VALORANTコントローラーの戦略派。",
      paragraphs: [
        "プレイスタイルはチーム重視かつ攻撃的。チームの特徴を読み解き、戦術を組み立てるのが得意。",
      ],
      highlights: [
        "本名：岩佐悠嗣（いわさ ゆうじ）",
        "主戦：Overwatch（タンク）",
        "サブ：VALORANT（コントローラー）",
        "強み：チーム戦略・戦術理解",
        "スタイル：チーム重視 × 攻撃的",
      ],
      message: "勝ちにこだわることも大事ですが、楽しくゲームできることを大切にしたいです＾＾",
    },
    stats: {
      aggression: 70,
      patience: 60,
      teamwork: 90,
      strategy: 85,
    },
  },
  { name: "梅ドリル", division: "creator" },
  { name: "トーキン", division: "creator" },
];

export const traineePlayers: Player[] = [
  { name: "タケルン" },
  { name: "トム" },
  {
    name: "ケイ",
    avatarUrl: "/members/KEI.jpg",
    role: "STREET FIGHTER 6 / アタッカー",
    tagline: "観察して、攻める。",
    bio: {
      headline:
        "ストリートファイター6プレーヤー。攻撃的なアタッカーとしてチームに加入したルーキー。",
      paragraphs: [
        "プレイスタイルは攻撃的。前に出る判断を厭わず、相手の隙を見たら一気に踏み込む。",
        "強みは観察力。攻めの中でも相手のクセや手癖を冷静に読み取り、次の一手につなげるタイプ。",
        "メイン以外では『ピクミン』をこよなく愛する一面も。",
      ],
      highlights: [
        "主戦：STREET FIGHTER 6",
        "ロール：アタッカー",
        "プレイスタイル：攻撃的",
        "強み：観察力",
        "好きなゲーム：ピクミン",
      ],
      message: "チームと一緒に頑張っていきます。",
    },
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

export type PartnerCompany = {
  id: string;
  name: string;
  label: string;
  logoUrl?: string;
  instagramUrl?: string;
  memberNote?: string;
  invertOnDark?: boolean;
};

export const partnerCompanies: PartnerCompany[] = [
  {
    id: "ball-clinic",
    name: "ボール接骨院",
    label: "BALL CLINIC",
    logoUrl: "/partners/BALL_CLINIC.svg",
    instagramUrl: "https://www.instagram.com/ballsekkotsuin/",
    memberNote: "代表：ぼーるくん",
    invertOnDark: true,
  },
  {
    id: "sami-seitai",
    name: "さみ整体",
    label: "SAMI SEITAI",
    logoUrl: "/partners/SAMI_SEITAI.png",
    instagramUrl: "https://www.instagram.com/sami.seitai/",
    memberNote: "メンバー：さみ",
    invertOnDark: true,
  },
  {
    id: "xeno-branding",
    name: "XENO BRANDING STUDIO",
    label: "XENO",
    logoUrl: "/partners/XENO.jpg",
    instagramUrl: "https://www.instagram.com/xeno.branding/",
    memberNote: "メンバー：ゼノ",
    invertOnDark: true,
  },
  {
    id: "homebase",
    name: "HOMEBASE",
    label: "HOMEBASE",
    logoUrl: "/partners/HOMEBASE.png",
    instagramUrl: "https://www.instagram.com/logical_bmx/",
    memberNote: "代表：森崎弘也",
    invertOnDark: true,
  },
];
