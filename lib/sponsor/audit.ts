// 監査ログ（誰が何をいつ変えたか）を残す共通ヘルパー。サーバー専用。
// 監査ログ自体の失敗で本処理を落とさない（best-effort）。

import { sbInsert } from "./supabase-admin";

export async function writeAudit(params: {
  action: string;
  targetType: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  userId: string;
}): Promise<void> {
  try {
    await sbInsert("awa_sponsor_audit_logs", {
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId ?? "",
      before_data: params.before ?? null,
      after_data: params.after ?? null,
      user_id: params.userId,
    });
  } catch (e) {
    console.error("audit_write_failed", e);
  }
}
