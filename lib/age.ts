/**
 * 生年月日（ISO: YYYY-MM-DD）から年齢を算出するユーティリティ。
 *
 * 未成年判定は「自己申告の年齢」ではなく必ずこの算出値で行うこと。
 * 年齢欄を手入力に任せると、実際は未成年でも18以上と入力して
 * 保護者同意を回避できてしまうため。
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO文字列を厳密にパース。実在しない日付・形式違いは null。 */
export function parseIsoDate(value: string): { y: number; m: number; d: number } | null {
  const s = (value ?? "").trim();
  if (!ISO_DATE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  // 2/30 のような存在しない日をはじく（JSのDateは繰り上げるので突き合わせる）
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/**
 * birthdate（ISO）時点 refDate（既定=今日）での満年齢。
 * 形式不正・未来日・現実的でない年齢（0未満/130超）は null を返す。
 * refDate は "YYYY-MM-DD" またはDate。テスト・サーバー時刻の固定に使う。
 */
export function ageOnDate(birthdate: string, refDate: Date = new Date()): number | null {
  const b = parseIsoDate(birthdate);
  if (!b) return null;

  const ry = refDate.getFullYear();
  const rm = refDate.getMonth() + 1;
  const rd = refDate.getDate();

  let age = ry - b.y;
  // 誕生日がまだ来ていなければ1引く
  if (rm < b.m || (rm === b.m && rd < b.d)) age -= 1;

  if (age < 0 || age > 130) return null; // 未来日・非現実値
  return age;
}
