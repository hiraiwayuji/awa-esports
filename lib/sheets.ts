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
