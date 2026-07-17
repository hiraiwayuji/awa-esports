/**
 * ごく簡易なレート制限。
 *
 * ⚠ 重要な制約：これは「1つのサーバーインスタンスのメモリ」だけで数えます。
 * Vercel のようなサーバーレス環境では複数インスタンスに分散したり、
 * コールドスタートで状態が消えたりするため、これ単体では本気の連投は防げません。
 * 誤操作の二重送信をゆるく抑えるのが目的です。本気の対策が必要になったら
 * Vercel KV / Upstash Redis など共有ストアへ置き換えてください。
 *
 * peek/record を分けているのは、不正リクエスト（JSON壊れ・検証失敗）で
 * 正規ユーザーの枠を消費しないため。上限判定は最初に peek で行い、
 * 実際にカウントするのは検証を通った処理のときだけ record する。
 */

type Bucket = Map<string, number[]>;

export type RateLimiter = {
  /** 上限に達しているか（カウントは増やさない）。true なら弾く。 */
  isLimited: (ip: string) => boolean;
  /** 1回分を記録する（検証を通った処理のときだけ呼ぶ）。 */
  record: (ip: string) => void;
};

export function createRateLimiter(maxPerWindow: number, windowMs: number): RateLimiter {
  const bucket: Bucket = new Map();

  const recent = (ip: string, now: number): number[] =>
    (bucket.get(ip) ?? []).filter((t) => now - t < windowMs);

  return {
    isLimited(ip: string): boolean {
      const now = Date.now();
      const arr = recent(ip, now);
      bucket.set(ip, arr); // 古いものを掃除しておく
      return arr.length >= maxPerWindow;
    },
    record(ip: string): void {
      const now = Date.now();
      const arr = recent(ip, now);
      arr.push(now);
      bucket.set(ip, arr);
    },
  };
}

/** リクエストから発信元IPを取り出す共通処理。 */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
