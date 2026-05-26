// Google Sheets への書き込みヘルパー。
// 環境変数：GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_ID
// シート名は固定で "trainee" と "player_contract" を想定。

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export type SheetName = "trainee" | "player_contract";

function getDoc(): GoogleSpreadsheet {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Vercel UI から貼り付けた値の \n エスケープ / 末尾改行 を吸収
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? "";
  const key = rawKey.replace(/\\n/g, "\n").trim() + "\n";

  if (!sheetId || !email || !rawKey) {
    throw new Error("sheets_env_missing");
  }

  const jwt = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return new GoogleSpreadsheet(sheetId, jwt);
}

/**
 * 指定タブに1行追加する。
 * - タブが空ならヘッダー行を自動セット
 * - 既存ヘッダーに無いキーがあれば、ヘッダーを拡張してから書き込む
 * - 失敗時は例外を投げる（呼び出し側でエラーログ + フォーム送信は成功扱いにする）
 */
export async function appendToSheet(
  sheetName: SheetName,
  row: Record<string, string>,
): Promise<void> {
  const doc = getDoc();
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) {
    throw new Error(`sheet_not_found: ${sheetName}`);
  }

  // 既存ヘッダー取得（空シートだと load が失敗するので catch）
  let currentHeaders: string[] = [];
  try {
    await sheet.loadHeaderRow();
    currentHeaders = sheet.headerValues ?? [];
  } catch {
    currentHeaders = [];
  }

  const incomingKeys = Object.keys(row);

  if (currentHeaders.length === 0) {
    // 空シート → 初回ヘッダー設定
    await sheet.setHeaderRow(incomingKeys);
  } else {
    // 既存ヘッダーに無い新規キーがあれば拡張
    const newKeys = incomingKeys.filter((k) => !currentHeaders.includes(k));
    if (newKeys.length > 0) {
      await sheet.setHeaderRow([...currentHeaders, ...newKeys]);
    }
  }

  await sheet.addRow(row);
}

/**
 * 指定タブの全行を取得（ヘッダーをキーにしたobject配列で返す）。
 * 戻り値には _rowIndex（0始まり、ヘッダー行を除いたデータ行のindex）を含める。
 */
export async function getSheetRows(
  sheetName: SheetName,
): Promise<Array<Record<string, string> & { _rowIndex: number }>> {
  const doc = getDoc();
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) return [];

  try {
    await sheet.loadHeaderRow();
  } catch {
    return [];
  }

  const rows = await sheet.getRows();
  return rows.map((r, i) => {
    const obj = r.toObject() as Record<string, string>;
    // 型システムの index-signature 衝突を避けるため明示キャスト
    return { ...obj, _rowIndex: i } as Record<string, string> & {
      _rowIndex: number;
    };
  });
}

/**
 * 指定行のフィールドを更新する。
 * @param sheetName タブ名
 * @param rowIndex データ行のindex（getSheetRows の _rowIndex）
 * @param updates 更新したいキー/値
 */
export async function updateSheetRow(
  sheetName: SheetName,
  rowIndex: number,
  updates: Record<string, string>,
): Promise<void> {
  const doc = getDoc();
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) throw new Error(`sheet_not_found: ${sheetName}`);

  await sheet.loadHeaderRow().catch(() => {});
  const rows = await sheet.getRows();
  if (rowIndex < 0 || rowIndex >= rows.length) {
    throw new Error("row_index_out_of_range");
  }

  // ヘッダーに無いキーがあれば拡張
  const currentHeaders = sheet.headerValues ?? [];
  const newKeys = Object.keys(updates).filter(
    (k) => !currentHeaders.includes(k),
  );
  if (newKeys.length > 0) {
    await sheet.setHeaderRow([...currentHeaders, ...newKeys]);
    // ヘッダー変更後は rows を取り直す
    const refreshed = await sheet.getRows();
    for (const [k, v] of Object.entries(updates)) {
      refreshed[rowIndex].set(k, v);
    }
    await refreshed[rowIndex].save();
    return;
  }

  for (const [k, v] of Object.entries(updates)) {
    rows[rowIndex].set(k, v);
  }
  await rows[rowIndex].save();
}

