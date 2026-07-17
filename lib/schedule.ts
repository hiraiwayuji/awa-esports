import { practiceScheduleItems } from "@/lib/practice-events";

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

// 練習会（募集ページのある回）は lib/practice-events.ts を唯一の出典として生成する。
// 練習会以外の予定を足したいときは、この配列に手書きで追加してください。
const otherEvents: ActivityEvent[] = [];

export const upcomingEvents: ActivityEvent[] = [
  ...practiceScheduleItems().map((p) => ({
    ...p,
    division: "JOINT" as ScheduleDivision,
  })),
  ...otherEvents,
];

export function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  const dow = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  return `${y}年${m}月${d}日（${dow}）`;
}
