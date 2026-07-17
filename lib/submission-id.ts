/**
 * 申込1回ごとの識別ID（UUID）を作る。
 * 通信断などで利用者が再送しても同じIDを送れば、サーバー側で重複を無視できる。
 * crypto.randomUUID が無い古い環境向けのフォールバック付き。
 */
export function newSubmissionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // フォールバック（RFC4122 v4 相当）
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
