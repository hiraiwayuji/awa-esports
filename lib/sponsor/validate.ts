// サーバー側入力検証（zod）。XSS/過大入力/型不正を弾く。
// 文字列は max を設け、配列も要素数・要素長を制限する。

import { z } from "zod";

const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(4000);
const url = z.string().trim().max(500);
const dateStr = z.string().trim().max(20); // "YYYY-MM-DD" 想定（空文字許容）
const strArray = z.array(z.string().trim().max(120)).max(50);

export const CompanyInput = z.object({
  legal_name: z.string().trim().min(1).max(200),
  brand_name: shortText.optional().default(""),
  corporate_number: z.string().trim().max(20).optional().default(""),
  website_url: url.optional().default(""),
  business_description: longText.optional().default(""),
  company_group: shortText.optional().default(""),
  partner_type: z.enum(["sponsor", "supporter"]).default("sponsor"),
  status: z.enum(["prospect", "active", "expired", "rejected"]).default("active"),
  category_name: shortText.optional().default(""),
  contract_start: dateStr.optional().default(""),
  contract_end: dateStr.optional().default(""),
  region_scope: strArray.optional().default([]),
  event_scope: strArray.optional().default([]),
  game_scope: strArray.optional().default([]),
  exclusivity: z.boolean().optional().default(false),
  exclusivity_scope: shortText.optional().default(""),
  notes: longText.optional().default(""),
});

export const CategoryInput = z.object({
  parent_category: shortText.optional().default(""),
  category_name: z.string().trim().min(1).max(120),
  risk_level: z.enum(["normal", "review", "prohibited"]).default("normal"),
  is_prohibited: z.boolean().optional().default(false),
  requires_review: z.boolean().optional().default(false),
  keywords: strArray.optional().default([]),
  competitor_group: shortText.optional().default(""),
  notes: longText.optional().default(""),
});

export const RuleInput = z.object({
  game_title: shortText.optional().default(""),
  tournament_name: shortText.optional().default(""),
  organizer: shortText.optional().default(""),
  prohibited_categories: strArray.optional().default([]),
  restricted_categories: strArray.optional().default([]),
  official_sponsor_categories: strArray.optional().default([]),
  effective_from: dateStr.optional().default(""),
  effective_to: dateStr.optional().default(""),
  source_name: shortText.optional().default(""),
  source_url: url.optional().default(""),
  last_checked_at: dateStr.optional().default(""),
  notes: longText.optional().default(""),
});

/** 日付の空文字を null に正規化（date 型カラムは "" を弾くため）。 */
export function nullifyDates<T extends Record<string, unknown>>(obj: T, keys: string[]): T {
  const out = { ...obj };
  for (const k of keys) {
    if (out[k] === "" || out[k] === undefined) {
      (out as Record<string, unknown>)[k] = null;
    }
  }
  return out;
}
