// AG Tシャツ注文アンケートのサイズと値段（ここ1か所が正・申込ページ/API/集計ページ共通）
// 値段：S〜XL(LL) は 1,500円、3L 以上は 2,000円。

export const TSHIRT_SIZES = [
  { key: "S", label: "S", price: 1500 },
  { key: "M", label: "M", price: 1500 },
  { key: "L", label: "L", price: 1500 },
  { key: "XL", label: "XL（LL）", price: 1500 },
  { key: "3L", label: "3L（XXL）", price: 2000 },
  { key: "4L", label: "4L（XXXL）", price: 2000 },
  { key: "5L", label: "5L", price: 2000 },
] as const;

export type TshirtSizeKey = (typeof TSHIRT_SIZES)[number]["key"];

/** サイズごとの枚数（0枚のサイズは省略してよい） */
export type TshirtItems = Partial<Record<TshirtSizeKey, number>>;

export const TSHIRT_MAX_PER_SIZE = 20;

/** 注文の締め切り（この日の終わりまで受け付ける）。過ぎたら回答ページとAPIは受付を止める。
 *  締め切り後の追加は集計ページの「注文を代理で追加」から入れる。 */
export const TSHIRT_DEADLINE_LABEL = "10月18日（日）";
export const TSHIRT_DEADLINE_END = Date.parse("2026-10-18T23:59:59+09:00");
export const tshirtOrderClosed = (now: number = Date.now()) => now > TSHIRT_DEADLINE_END;

export function tshirtTotals(items: TshirtItems) {
  let qty = 0;
  let price = 0;
  for (const s of TSHIRT_SIZES) {
    const n = Math.max(0, Math.floor(items[s.key] ?? 0));
    qty += n;
    price += n * s.price;
  }
  return { qty, price };
}

/** 0枚を落として、サイズ順に並べた形にそろえる */
export function normalizeTshirtItems(items: TshirtItems): TshirtItems {
  const out: TshirtItems = {};
  for (const s of TSHIRT_SIZES) {
    const n = Math.max(0, Math.min(TSHIRT_MAX_PER_SIZE, Math.floor(items[s.key] ?? 0)));
    if (n > 0) out[s.key] = n;
  }
  return out;
}

export function formatTshirtItems(items: TshirtItems) {
  return TSHIRT_SIZES.filter((s) => (items[s.key] ?? 0) > 0)
    .map((s) => `${s.label}×${items[s.key]}`)
    .join("、");
}

export const yen = (n: number) => `${n.toLocaleString("ja-JP")}円`;
