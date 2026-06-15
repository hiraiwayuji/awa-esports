// AWAKEN GLOW 選手アンケート用 Supabase 接続設定。
//
// ここに置いている publishable キーは「公開してよい」キーで、データベースは
// RLS（行レベルセキュリティ）で保護されています：
//   - 匿名ユーザーは回答の INSERT（投稿）のみ可能
//   - 回答一覧の閲覧は、合言葉を渡す関数経由でしかできない
// そのためフロントエンドのコードに直接書いても問題ありません。

export const AWA_SUPABASE_URL = "https://uatmzcnoumafeuzprkdo.supabase.co";
export const AWA_SUPABASE_KEY = "sb_publishable_66pQhd_jrQeL3CXw5oUiZA_FqR9390U";

/** REST 共通ヘッダー */
export function awaSupabaseHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: AWA_SUPABASE_KEY,
    Authorization: `Bearer ${AWA_SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}
