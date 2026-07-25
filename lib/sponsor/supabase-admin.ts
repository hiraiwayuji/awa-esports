// スポンサー管理データへのサーバー専用アクセス層。
//
// スポンサー系テーブルは RLS 有効＋ポリシー無し＝publishable(anon) キーでは読み書き不可。
// アクセスは service_role キー（RLS をバイパス）でのみ行い、このキーは絶対に
// クライアントへ出さない（サーバー側の環境変数 SUPABASE_SERVICE_ROLE_KEY で保持）。
//
// これらの関数を import してよいのは Route Handler（サーバー）だけ。

import { AWA_SUPABASE_URL } from "@/lib/awa-supabase";

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** service_role キーが設定されているか（未設定なら管理機能は 503 を返す） */
export function isSponsorDbConfigured(): boolean {
  return SERVICE_KEY.length > 0;
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

const BASE = `${AWA_SUPABASE_URL}/rest/v1`;

export class SponsorDbError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** SELECT。query は PostgREST のクエリ文字列（例: "select=*&is_deleted=eq.false&order=created_at.desc"）。 */
export async function sbSelect<T>(table: string, query: string): Promise<T[]> {
  const res = await fetch(`${BASE}/${table}?${query}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new SponsorDbError(`select_failed:${table}:${res.status}:${await res.text()}`, res.status);
  }
  return (await res.json()) as T[];
}

/** INSERT（1件）。返り値は作成された行。 */
export async function sbInsert<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}/${table}`, {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    throw new SponsorDbError(`insert_failed:${table}:${res.status}:${await res.text()}`, res.status);
  }
  const arr = (await res.json()) as T[];
  return arr[0];
}

/** UPDATE（id 一致）。返り値は更新後の行。 */
export async function sbUpdate<T>(
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<T | null> {
  const res = await fetch(`${BASE}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new SponsorDbError(`update_failed:${table}:${res.status}:${await res.text()}`, res.status);
  }
  const arr = (await res.json()) as T[];
  return arr[0] ?? null;
}

/** 1件取得（id 一致）。 */
export async function sbGetById<T>(table: string, id: string): Promise<T | null> {
  const arr = await sbSelect<T>(table, `select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return arr[0] ?? null;
}
