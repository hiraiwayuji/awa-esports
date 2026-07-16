export type ScheduleDivision = "SF6" | "PUYO" | "JOINT";

export type ActivityEvent = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  division: ScheduleDivision;
  venue: string;
  title: string;
  note?: string;
  newsSlug?: string;
  /** 詳細・募集ページへのリンク（newsSlug より優先） */
  link?: string;
  /** リンクのラベル（既定は「詳細 →」） */
  linkLabel?: string;
};

export const DIVISION_LABEL: Record<
  ScheduleDivision,
  { short: string; long: string; accent: string }
> = {
  SF6: {
    short: "SF6",
    long: "STREET FIGHTER 6 部門",
    accent: "magenta",
  },
  PUYO: {
    short: "PUYO",
    long: "ぷよぷよeスポーツ 部門",
    accent: "cyan",
  },
  JOINT: {
    short: "JOINT",
    long: "合同（複数タイトル）",
    accent: "violet",
  },
};

export const monthlyPolicy = {
  cadence: "原則 月2回",
  pattern:
    "同じ活動日に時間帯を分けて、ぷよぷよ部門・スト6部門の両方を実施します。両部門への参加もOK。",
  observers:
    "見学・お試し参加も大歓迎。初回は雰囲気を見るだけでも問題ありません。",
};

export const upcomingEvents: ActivityEvent[] = [
  {
    id: "2026-08-02-practice",
    date: "2026-08-02",
    startTime: "10:00",
    endTime: "18:00",
    division: "JOINT",
    venue: "CyberSheeep 徳島中央校",
    title: "8月 徳島練習会（参加者募集中）",
    note:
      "2部制／午前(10-14時)はロケットリーグ・オーバーウォッチなどをワイワイ、午後(14-18時)はスト6ガチ対戦。参加費：1枠2,000円/一日通し3,000円（高校生以下は各1,000円引）。初参加・観戦のみOK。",
    link: "/events/0802",
    linkLabel: "参加する →",
  },
  {
    id: "2026-09-06-practice",
    date: "2026-09-06",
    startTime: "10:00",
    endTime: "18:00",
    division: "JOINT",
    venue: "CyberSheeep 徳島中央校",
    title: "9月 徳島練習会（参加者募集中）",
    note:
      "2部制／午前(10-14時)はロケットリーグ・オーバーウォッチなどをワイワイ、午後(14-18時)はスト6ガチ対戦。参加費：1枠2,000円/一日通し3,000円（高校生以下は各1,000円引）。初参加・観戦のみOK。",
    link: "/events/0906",
    linkLabel: "参加する →",
  },
];

export function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  const dow = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  return `${y}年${m}月${d}日（${dow}）`;
}
