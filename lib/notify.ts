/**
 * 申込・アンケートの通知メールに「保存の成否」を反映するための共通ヘルパー。
 *
 * 方針：まず保存（Supabase / Google Sheets）を試み、その結果をメールに載せてから送る。
 * 保存に失敗しても運営には必ずメールが届き、かつ「このメールが唯一の記録」だと
 * ひと目で分かるようにする。これで「利用者には成功と見えるのに記録が無い」を防ぐ。
 */

export type SaveResult = "ok" | "failed" | "skipped";

/** 保存失敗時に件名へ付ける警告プレフィックス。 */
export function subjectPrefix(save: SaveResult): string {
  return save === "failed" ? "⚠保存失敗 " : "";
}

/** メール本文（HTML）の先頭に差し込む警告バナー。保存OKなら空文字。 */
export function htmlWarning(save: SaveResult): string {
  if (save !== "failed") return "";
  return `<div style="background:#b00020;color:#fff;padding:12px 14px;border-radius:8px;margin:0 0 14px;font-size:14px;font-weight:700;">
⚠ この申込はデータベース／シートへの保存に失敗しました。<br/>
このメールが唯一の記録です。内容を必ず控えてください。
</div>`;
}

/** メール本文（テキスト）の先頭に差し込む警告。保存OKなら空文字。 */
export function textWarning(save: SaveResult): string {
  if (save !== "failed") return "";
  return `⚠ この申込はデータベース／シートへの保存に失敗しました。
このメールが唯一の記録です。内容を必ず控えてください。

`;
}
