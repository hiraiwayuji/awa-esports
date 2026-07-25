// 国税庁 法人番号 Web-API（ver4）クライアント — サーバー専用。
//
// アプリケーションID（APIキー）は HOUJIN_BANGOU_APP_ID 環境変数で保持し、
// 絶対にクライアントへ出さない（このモジュールを import してよいのはサーバーのみ）。
//
// 未設定でもエラーにせず configured:false を返し、UI 側で
// 「法人番号API未設定」＋公表サイトへの手動確認導線を出す。
//
// 注意：法人番号が実在しても、その企業がスポンサーとして適切であることを
// 自動保証しない（適格性の判断は別途・人間が行う）。

const APP_ID = process.env.HOUJIN_BANGOU_APP_ID || "";
const API_BASE = "https://api.houjin-bangou.nta.go.jp/4";

// 出典表示に使う（画面で必ず表示する）。
export const HOUJIN_SOURCE = {
  name: "国税庁 法人番号公表サイト",
  url: "https://www.houjin-bangou.nta.go.jp/",
};

export type HoujinRecord = {
  corporateNumber: string;
  name: string;
  address: string;
  postCode: string;
  updateDate: string;
  closed: boolean;
};

export type HoujinResult =
  | { configured: false }
  | { configured: true; ok: true; records: HoujinRecord[]; source: typeof HOUJIN_SOURCE }
  | { configured: true; ok: false; error: string; source: typeof HOUJIN_SOURCE };

export function isHoujinConfigured(): boolean {
  return APP_ID.length > 0;
}

/** CSV 1行を素朴に分割（法人番号APIはフィールド内カンマを "" で括る） */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function toRecord(cols: string[]): HoujinRecord | null {
  if (cols.length < 12) return null;
  const corporateNumber = cols[1] ?? "";
  const name = cols[6] ?? "";
  if (!corporateNumber && !name) return null;
  const prefecture = cols[9] ?? "";
  const city = cols[10] ?? "";
  const street = cols[11] ?? "";
  const postCode = cols[15] ?? "";
  const closeDate = cols[18] ?? "";
  return {
    corporateNumber,
    name,
    address: `${prefecture}${city}${street}`.trim(),
    postCode,
    updateDate: cols[4] ?? "",
    closed: closeDate.trim().length > 0,
  };
}

async function fetchCsv(url: string): Promise<string[][]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`houjin_http_${res.status}`);
  }
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  // 1行目はヘッダー相当のカウント行になることがあるため、法人番号らしき行のみ採用。
  return lines.map(parseCsvLine);
}

/** 13桁の法人番号で検索。type=02 は CSV(Unicode)。 */
export async function lookupByNumber(numberRaw: string): Promise<HoujinResult> {
  if (!APP_ID) return { configured: false };
  const number = numberRaw.replace(/[^0-9]/g, "");
  if (number.length !== 13) {
    return { configured: true, ok: false, error: "法人番号は13桁で入力してください。", source: HOUJIN_SOURCE };
  }
  try {
    const url = `${API_BASE}/num?id=${encodeURIComponent(APP_ID)}&number=${number}&type=02&history=0`;
    const rows = await fetchCsv(url);
    const records = rows.map(toRecord).filter((r): r is HoujinRecord => !!r && /^\d{13}$/.test(r.corporateNumber));
    return { configured: true, ok: true, records, source: HOUJIN_SOURCE };
  } catch (e) {
    return {
      configured: true,
      ok: false,
      error: e instanceof Error ? e.message : "lookup_failed",
      source: HOUJIN_SOURCE,
    };
  }
}

/** 商号・名称で検索（部分一致・国内のみ・最大件数は API 既定）。 */
export async function searchByName(nameRaw: string): Promise<HoujinResult> {
  if (!APP_ID) return { configured: false };
  const name = nameRaw.trim();
  if (name.length < 1) {
    return { configured: true, ok: false, error: "検索する名称を入力してください。", source: HOUJIN_SOURCE };
  }
  try {
    const url = `${API_BASE}/name?id=${encodeURIComponent(APP_ID)}&name=${encodeURIComponent(name)}&type=02&mode=2&target=1&close=0`;
    const rows = await fetchCsv(url);
    const records = rows
      .map(toRecord)
      .filter((r): r is HoujinRecord => !!r && /^\d{13}$/.test(r.corporateNumber))
      .slice(0, 20);
    return { configured: true, ok: true, records, source: HOUJIN_SOURCE };
  } catch (e) {
    return {
      configured: true,
      ok: false,
      error: e instanceof Error ? e.message : "search_failed",
      source: HOUJIN_SOURCE,
    };
  }
}
