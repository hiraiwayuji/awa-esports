// 審査に必要なマスタ（カテゴリー・既存企業・大会規定）をまとめて読む。サーバー専用。

import { sbSelect } from "./supabase-admin";
import type { SponsorCategory, SponsorCompany, TournamentRule } from "./types";
import type { ScreeningContext } from "./screening";

export async function loadScreeningContext(): Promise<ScreeningContext> {
  const [categories, companies, rules] = await Promise.all([
    sbSelect<SponsorCategory>(
      "awa_sponsor_categories",
      "select=*&is_deleted=eq.false&order=parent_category.asc",
    ),
    sbSelect<SponsorCompany>(
      "awa_sponsor_companies",
      "select=*&is_deleted=eq.false&order=created_at.desc",
    ),
    sbSelect<TournamentRule>(
      "awa_tournament_sponsor_rules",
      "select=*&is_deleted=eq.false&order=created_at.desc",
    ),
  ]);
  return { categories, companies, rules };
}
