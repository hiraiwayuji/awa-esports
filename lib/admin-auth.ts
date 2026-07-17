import { timingSafeEqual } from "crypto";

/**
 * /api/admin/* の Route Handler 自身で Basic 認証を再確認する（多層防御）。
 *
 * 認証は middleware.ts でも行っているが、middleware をすり抜ける攻撃
 * （例: CVE-2025-29927）に備え、API 側でも同じ認証情報を検証する。
 * これで middleware が破られても、個人情報の入った Sheets は守られる。
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** 認証OKなら true。ADMIN_USER / ADMIN_PASSWORD 未設定時は false（閉じる）。 */
export function isAdminAuthed(req: Request): boolean {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return false;

  const expected = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  return safeEqual(auth, expected);
}
