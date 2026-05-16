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
    id: "2026-05-18-practice-1",
    date: "2026-05-18",
    startTime: "—",
    endTime: "—",
    division: "JOINT",
    venue: "徳島市内 eスポーツスペース",
    title: "第1回 徳島練習会",
    note:
      "プレタイトル：VALORANT / Apex Legends / Street Fighter 6（合同回）。詳細は運営から個別にご案内します。",
    newsSlug: "2026-05-18-tokushima-practice-1",
  },
];

export function formatDateJa(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  const dow = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  return `${y}年${m}月${d}日（${dow}）`;
}
