/**
 * 練習会の募集ページ（/events/xxxx）の開催情報。
 *
 * ページ本体は components/PracticeEventPage.tsx が共通で、この設定を差し替えるだけで
 * 新しい回のページを作れます。新しい練習会を追加するときは、
 *   1. ここに設定を1つ足す
 *   2. app/events/<slug>/page.tsx を3行だけ作る（既存の回をコピー）
 *   3. lib/schedule.ts の upcomingEvents に足す
 * の3ステップです。時間・参加費を変えるときも、ここだけ直せば
 * 開催情報カード・タイムテーブル・料金表・申込フォームの全部に反映されます。
 */

export type TimeSlot = "morning" | "afternoon" | "full";

export type SlotOption = {
  value: TimeSlot;
  title: string;
  /** 表示用の時間。TIMETABLE と表記を揃えること。 */
  time: string;
  /** 枠の中身。折り返しの都合で fee とは別に持つ。 */
  note: string;
  /** 参加費。語の途中で改行しないよう、意味のかたまりごとに分ける。 */
  fee: string[];
};

export type TimeBlock = {
  accent: "cyan" | "magenta";
  time: string;
  tag: string;
  title: string;
  lines: string[];
  foot: string;
};

/**
 * 紹介文の1行。dim: true の部分だけ少し暗い色で表示します
 * （元の 8/2 ページの「隣同士でワイワイ楽しむ」の見せ方）。
 */
export type IntroSegment = { text: string; dim?: boolean };

export type PracticeEvent = {
  /** URL の /events/<slug> と揃える */
  slug: string;
  /** API・DB に渡す開催日（ISO） */
  date: string;
  /** 開催情報カード用（例：2026年8月2日（日）） */
  dateLabel: string;
  /** 冒頭の紹介文用（例：8月2日（日）） */
  monthDayLabel: string;
  /** 見出し・ボタンなどで使う短い表記（例：8/2） */
  shortLabel: string;
  heroWatermark: string;
  heroEyebrow: string;
  heroTitle: string;
  timeLabel: string;
  venueLabel: string;
  venueNote: string;
  mapUrl: string;
  feeLabel: string;
  titlesLabel: string;
  targetLabel: string;
  timetable: TimeBlock[];
  timetableNote: string;
  fee: { rows: { label: string; adult: string; student: string }[]; note: string };
  slots: SlotOption[];
  intro: IntroSegment[][];
  introFoot: string;
};

/** 徳島練習会の定番会場 */
const CYBER_SHEEEP = {
  venueLabel: "CyberSheeep 徳島中央校",
  venueNote: "アクセス・駐車場などの詳細は、お申込み後にご案内します。",
  mapUrl: "https://maps.app.goo.gl/MzpWD1ay764UUwz98",
};

/**
 * 2部制（午前ワイワイ／午後スト6ガチ）の共通設定。
 * 回ごとに中身が変わったら、その回の設定で上書きしてください。
 */
const STANDARD_TIMETABLE: TimeBlock[] = [
  {
    accent: "cyan",
    time: "10:00 – 14:00",
    tag: "CASUAL",
    title: "みんなでワイワイ枠",
    lines: [
      "スト6以外を中心に、気軽に遊ぶ時間。",
      "ロケットリーグやオーバーウォッチを3人で協力プレイしたり、",
      "ハイスペックなゲーミングPCを思いっきり楽しもう！",
    ],
    foot: "ゲーム初心者・観戦だけでも大歓迎",
  },
  {
    accent: "magenta",
    time: "14:00 – 18:00",
    tag: "SERIOUS",
    title: "スト6 ガチ対戦枠",
    lines: [
      "午後はストリートファイター6が中心。",
      "腕に自信のある猛者たちと、本気でプレイしたい人はこちら。",
    ],
    foot: "もちろん観戦・お試し対戦もOK",
  },
];

const STANDARD_FEE = {
  rows: [
    { label: "1枠のみ（午前 or 午後）", adult: "2,000円", student: "1,000円" },
    { label: "一日通し（午前＋午後）", adult: "3,000円", student: "2,000円" },
  ],
  note: "「高校生以下」は高校生・中学生・小学生などが対象です。お支払いは当日、会場で承ります。",
};

const STANDARD_SLOTS: SlotOption[] = [
  {
    value: "morning",
    title: "午前だけ参加",
    time: "10:00 – 14:00",
    note: "みんなでワイワイ枠",
    fee: ["1枠 2,000円", "高校生以下 1,000円"],
  },
  {
    value: "afternoon",
    title: "午後だけ参加",
    time: "14:00 – 18:00",
    note: "スト6 ガチ対戦枠",
    fee: ["1枠 2,000円", "高校生以下 1,000円"],
  },
  {
    value: "full",
    title: "一日通しで参加",
    time: "10:00 – 18:00",
    note: "午前＋午後",
    fee: ["3,000円", "高校生以下 2,000円"],
  },
];

const STANDARD_INTRO: IntroSegment[][] = [
  [
    { text: "AWAKEN GLOW の練習会は、勝ち負けだけでなく" },
    { text: "隣同士でワイワイ楽しむ", dim: true },
    { text: "のが魅力です。" },
  ],
  [
    {
      text: "午前はロケットリーグやオーバーウォッチをみんなで、午後はスト6でガチ対戦。「ゲームは好きだけど大会はまだ…」という方こそ、まずは気軽に遊びに来てください。",
    },
  ],
];

export const PRACTICE_EVENTS: PracticeEvent[] = [
  {
    slug: "0802",
    date: "2026-08-02",
    dateLabel: "2026年8月2日（日）",
    monthDayLabel: "8月2日（日）",
    shortLabel: "8/2",
    heroWatermark: "PRACTICE 8/2",
    heroEyebrow: "EVENT / 8月2日 徳島練習会",
    heroTitle: "AUGUST 2 MEETUP",
    timeLabel: "10:00〜18:00",
    ...CYBER_SHEEEP,
    feeLabel: "1枠 2,000円／一日通し 3,000円（高校生以下は割引あり）",
    titlesLabel: "スト6・ロケットリーグ・オーバーウォッチ ほか",
    targetLabel: "どなたでも（初参加・観戦のみOK／年齢不問）",
    timetable: STANDARD_TIMETABLE,
    timetableNote:
      "どちらか片方だけの参加もOK。午前だけワイワイ遊びに来る／午後のスト6だけ参加する、も大歓迎です。",
    fee: STANDARD_FEE,
    slots: STANDARD_SLOTS,
    intro: STANDARD_INTRO,
    introFoot:
      "下のフォームからお申込みいただくと、会場・持ち物など当日の詳しいご案内をお送りします。",
  },
  {
    slug: "0906",
    date: "2026-09-06",
    dateLabel: "2026年9月6日（日）",
    monthDayLabel: "9月6日（日）",
    shortLabel: "9/6",
    heroWatermark: "PRACTICE 9/6",
    heroEyebrow: "EVENT / 9月6日 徳島練習会",
    heroTitle: "SEPTEMBER 6 MEETUP",
    timeLabel: "10:00〜18:00",
    ...CYBER_SHEEEP,
    feeLabel: "1枠 2,000円／一日通し 3,000円（高校生以下は割引あり）",
    titlesLabel: "スト6・ロケットリーグ・オーバーウォッチ ほか",
    targetLabel: "どなたでも（初参加・観戦のみOK／年齢不問）",
    timetable: STANDARD_TIMETABLE,
    timetableNote:
      "どちらか片方だけの参加もOK。午前だけワイワイ遊びに来る／午後のスト6だけ参加する、も大歓迎です。",
    fee: STANDARD_FEE,
    slots: STANDARD_SLOTS,
    intro: STANDARD_INTRO,
    introFoot:
      "下のフォームからお申込みいただくと、会場・持ち物など当日の詳しいご案内をお送りします。",
  },
];

export function getPracticeEvent(slug: string): PracticeEvent | undefined {
  return PRACTICE_EVENTS.find((e) => e.slug === slug);
}

/** 開催日（ISO）→ 表示用ラベル。API の通知メールでも使う。 */
export function practiceEventLabel(isoDate: string): string {
  return (
    PRACTICE_EVENTS.find((e) => e.date === isoDate)?.shortLabel ?? isoDate
  );
}
