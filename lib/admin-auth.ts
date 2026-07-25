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

/**
 * 管理者権限と閲覧者権限を分けるためのロール判定。
 *   - admin  … ADMIN_USER / ADMIN_PASSWORD（作成・更新・承認・削除まで可）
 *   - viewer … ADMIN_VIEWER_USER / ADMIN_VIEWER_PASSWORD（任意設定・閲覧のみ）
 *   - null   … 認証情報が一致しない
 *
 * middleware は admin/viewer どちらも通す（Basic 認証で 401 になるのはどちらとも
 * 一致しなかった場合）。書き込み系 API は requireAdmin で admin のみに絞る。
 */
export type AdminRole = "admin" | "viewer" | null;

export function adminRole(req: Request): AdminRole {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return null;

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (user && pass) {
    const expected = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
    if (safeEqual(auth, expected)) return "admin";
  }

  const vUser = process.env.ADMIN_VIEWER_USER;
  const vPass = process.env.ADMIN_VIEWER_PASSWORD;
  if (vUser && vPass) {
    const expected = "Basic " + Buffer.from(`${vUser}:${vPass}`).toString("base64");
    if (safeEqual(auth, expected)) return "viewer";
  }

  return null;
}

/** 読み取りは admin/viewer どちらでも許可。 */
export function canRead(req: Request): boolean {
  return adminRole(req) !== null;
}

/** 書き込み・承認・削除は admin のみ。 */
export function requireAdmin(req: Request): boolean {
  return adminRole(req) === "admin";
}

/** Basic 認証ヘッダーからユーザー名を取り出す（監査ログ用。パスワードは扱わない）。 */
export function adminUserName(req: Request): string {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return "unknown";
  try {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const name = decoded.split(":")[0] ?? "unknown";
    return name || "unknown";
  } catch {
    return "unknown";
  }
}
