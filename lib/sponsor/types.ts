// AWAKEN GLOW スポンサー管理 — 共有型定義（クライアント/サーバー共通）。

/** 判定 5 段階 */
export type Verdict = "green" | "yellow" | "orange" | "red" | "gray";

export const VERDICT_META: Record<
  Verdict,
  { label: string; short: string; color: string; ring: string; text: string; bg: string }
> = {
  green: {
    label: "契約候補",
    short: "緑",
    color: "#2DFFB7",
    ring: "border-emerald-400/60",
    text: "text-emerald-300",
    bg: "bg-emerald-400/10",
  },
  yellow: {
    label: "条件付きで検討可能",
    short: "黄",
    color: "#FFD84D",
    ring: "border-yellow-300/60",
    text: "text-yellow-300",
    bg: "bg-yellow-300/10",
  },
  orange: {
    label: "運営会議での審査が必要",
    short: "橙",
    color: "#FF9A3C",
    ring: "border-orange-400/60",
    text: "text-orange-300",
    bg: "bg-orange-400/10",
  },
  red: {
    label: "契約不可",
    short: "赤",
    color: "#FF5A6E",
    ring: "border-rose-400/60",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
  },
  gray: {
    label: "情報不足・未確認",
    short: "灰",
    color: "#9AA6C0",
    ring: "border-white/25",
    text: "text-white/60",
    bg: "bg-white/5",
  },
};

/** カテゴリーマスタ */
export type SponsorCategory = {
  id: string;
  parent_category: string;
  category_name: string;
  risk_level: "normal" | "review" | "prohibited";
  is_prohibited: boolean;
  requires_review: boolean;
  keywords: string[];
  competitor_group: string;
  notes: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

/** 既存スポンサー/応援企業 */
export type SponsorCompany = {
  id: string;
  legal_name: string;
  brand_name: string;
  corporate_number: string;
  website_url: string;
  business_description: string;
  company_group: string;
  partner_type: "sponsor" | "supporter";
  status: "prospect" | "active" | "expired" | "rejected";
  category_id: string | null;
  category_name: string;
  contract_start: string | null;
  contract_end: string | null;
  region_scope: string[];
  event_scope: string[];
  game_scope: string[];
  exclusivity: boolean;
  exclusivity_scope: string;
  notes: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

/** 大会・ゲーム会社側のスポンサー規定 */
export type TournamentRule = {
  id: string;
  game_title: string;
  tournament_name: string;
  organizer: string;
  prohibited_categories: string[];
  restricted_categories: string[];
  official_sponsor_categories: string[];
  effective_from: string | null;
  effective_to: string | null;
  source_name: string;
  source_url: string;
  last_checked_at: string | null;
  notes: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

/** 管理画面「営業前スポンサー確認」の入力（＝審査の候補データ） */
export type ScreeningCandidate = {
  companyName: string;
  brandName: string;
  corporateNumber: string;
  address: string;
  representative: string;
  websiteUrl: string;
  snsUrl: string;
  businessDescription: string;
  categoryName: string;
  productCategory: string;
  partnerType: "sponsor" | "supporter";
  supportKinds: string[];
  desiredRights: string;
  exclusivity: boolean;
  exclusivityScope: string;
  contractStart: string;
  contractEnd: string;
  regionScope: string;
  eventScope: string;
  gameScope: string;
  salesRep: string;
  notes: string;
  corporateVerified: boolean;
};

export function emptyCandidate(): ScreeningCandidate {
  return {
    companyName: "",
    brandName: "",
    corporateNumber: "",
    address: "",
    representative: "",
    websiteUrl: "",
    snsUrl: "",
    businessDescription: "",
    categoryName: "",
    productCategory: "",
    partnerType: "sponsor",
    supportKinds: [],
    desiredRights: "",
    exclusivity: false,
    exclusivityScope: "",
    contractStart: "",
    contractEnd: "",
    regionScope: "",
    eventScope: "",
    gameScope: "",
    salesRep: "",
    notes: "",
    corporateVerified: false,
  };
}

/** チェック 1 項目（A〜N） */
export type CheckItem = {
  code: string;
  label: string;
  status: "ok" | "warn" | "block" | "info" | "unknown";
  message: string;
};

/** 競合の突合結果 */
export type CompetitorMatch = {
  companyId: string;
  companyName: string;
  categoryName: string;
  matchType: "category" | "group" | "brand_group" | "product";
  reason: string;
  overlap: string[];
  exclusivity: boolean;
  severity: "possible" | "likely" | "conflict";
};

/** 審査結果 */
export type ScreeningResult = {
  verdict: Verdict;
  riskLevel: string;
  checks: CheckItem[];
  competitors: CompetitorMatch[];
  competitorCategories: string[];
  exclusivity: { requested: boolean; scope: string; conflicts: string[] };
  tournamentNotes: string[];
  missingDocs: string[];
  preContractChecks: string[];
  recommendedActions: string[];
  summary: string;
};

/** 支援内容の選択肢（管理・公開共通） */
export const SUPPORT_KINDS = [
  "金銭協賛",
  "物品提供",
  "会場提供",
  "機材提供",
  "技術協力",
  "イベント協力",
  "その他",
] as const;
