-- ============================================================================
-- AWAKEN GLOW スポンサー管理機能 マイグレーション
-- ----------------------------------------------------------------------------
-- このプロジェクトの Supabase は複数アプリ（接骨院予約・物産館ではなく本DBは
-- 接骨院系＋AWA系）と同居する共有DBのため、テーブルはすべて `awa_sponsor_`
-- プレフィックスで追加し、既存テーブルには一切触れない（追加のみ・破壊的操作なし）。
--
-- セキュリティ方針：
--   - 全テーブルで RLS を有効化し、anon / authenticated 用ポリシーを一切作らない
--     → publishable(anon) キーからは読み書き不可（完全遮断）。
--   - スポンサー契約情報・社内メモ・独占権などの機微情報は
--     サーバー側の service_role キー（RLSをバイパス）経由でのみアクセスする。
--     service_role キーはフロントに出さず、Vercel 環境変数で保持する。
-- ============================================================================

-- 拡張（gen_random_uuid 用。既存で有効なはずだが冪等に）
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- カテゴリーマスタ（大分類・中分類・禁止/慎重フラグ・キーワード・競合グループ）
-- ----------------------------------------------------------------------------
create table if not exists public.awa_sponsor_categories (
  id                uuid primary key default gen_random_uuid(),
  parent_category   text not null default '',       -- 大分類
  category_name     text not null,                  -- カテゴリー名（中分類）
  risk_level        text not null default 'normal', -- normal | review | prohibited
  is_prohibited     boolean not null default false, -- お受けできない業種
  requires_review   boolean not null default false, -- 個別に慎重審査
  keywords          text[] not null default '{}',   -- 突合キーワード
  competitor_group  text not null default '',       -- 実質競合グループ（市場が重なる束）
  notes             text not null default '',
  is_deleted        boolean not null default false, -- 論理削除
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (category_name)
);

-- ----------------------------------------------------------------------------
-- スポンサー / 応援企業（既存の提携先）
-- ----------------------------------------------------------------------------
create table if not exists public.awa_sponsor_companies (
  id                   uuid primary key default gen_random_uuid(),
  legal_name           text not null,
  brand_name           text not null default '',
  corporate_number     text not null default '',
  website_url          text not null default '',
  business_description  text not null default '',
  company_group        text not null default '',    -- 親会社/グループ/子会社
  partner_type         text not null default 'sponsor', -- sponsor | supporter
  status               text not null default 'active',  -- prospect|active|expired|rejected
  category_id          uuid references public.awa_sponsor_categories(id) on delete set null,
  category_name        text not null default '',    -- 表示・競合突合用の冗長保持
  contract_start       date,
  contract_end         date,
  region_scope         text[] not null default '{}',
  event_scope          text[] not null default '{}',
  game_scope           text[] not null default '{}',
  exclusivity          boolean not null default false,
  exclusivity_scope    text not null default '',
  notes                text not null default '',    -- 社内メモ（非公開）
  is_deleted           boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_awa_sponsor_companies_status
  on public.awa_sponsor_companies (status) where is_deleted = false;
create index if not exists idx_awa_sponsor_companies_category
  on public.awa_sponsor_companies (category_name) where is_deleted = false;

-- ----------------------------------------------------------------------------
-- 付与している権利（独占権の期間・範囲を明示管理）
-- ----------------------------------------------------------------------------
create table if not exists public.awa_sponsor_rights (
  id                 uuid primary key default gen_random_uuid(),
  sponsor_company_id uuid not null references public.awa_sponsor_companies(id) on delete cascade,
  right_type         text not null default '',
  scope              text not null default '',
  start_date         date,
  end_date           date,
  is_exclusive       boolean not null default false,
  created_at         timestamptz not null default now()
);
create index if not exists idx_awa_sponsor_rights_company
  on public.awa_sponsor_rights (sponsor_company_id);

-- ----------------------------------------------------------------------------
-- 大会・ゲーム会社側のスポンサー規定
-- ----------------------------------------------------------------------------
create table if not exists public.awa_tournament_sponsor_rules (
  id                          uuid primary key default gen_random_uuid(),
  game_title                  text not null default '',
  tournament_name             text not null default '',
  organizer                   text not null default '',
  prohibited_categories       text[] not null default '{}',
  restricted_categories       text[] not null default '{}',
  official_sponsor_categories text[] not null default '{}',
  effective_from              date,
  effective_to                date,
  source_name                 text not null default '',
  source_url                  text not null default '',
  last_checked_at             date,
  notes                       text not null default '',
  is_deleted                  boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 審査（スクリーニング）履歴
-- ----------------------------------------------------------------------------
create table if not exists public.awa_sponsor_screenings (
  id                     uuid primary key default gen_random_uuid(),
  candidate_company_name text not null default '',
  candidate_data         jsonb not null default '{}'::jsonb,
  screening_result       text not null default 'gray', -- green|yellow|orange|red|gray
  risk_level             text not null default '',
  matched_rules          jsonb not null default '[]'::jsonb,
  matched_competitors    jsonb not null default '[]'::jsonb,
  required_actions       jsonb not null default '[]'::jsonb,
  screened_by            text not null default '',
  screened_at            timestamptz not null default now(),
  final_decision         text not null default 'pending', -- pending|approved|conditional|rejected
  decision_reason        text not null default '',
  approved_by            text not null default '',
  approved_at            timestamptz,
  is_deleted             boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists idx_awa_sponsor_screenings_created
  on public.awa_sponsor_screenings (created_at desc) where is_deleted = false;

-- ----------------------------------------------------------------------------
-- 公開ページからの問い合わせ（非公開・運営のみ閲覧）
-- ----------------------------------------------------------------------------
create table if not exists public.awa_sponsor_inquiries (
  id                   uuid primary key default gen_random_uuid(),
  submission_id        uuid unique,                 -- 二重送信の無視に使用
  company_name         text not null default '',
  contact_name         text not null default '',
  email                text not null default '',
  phone                text not null default '',
  address              text not null default '',
  website_url          text not null default '',
  sns_url              text not null default '',
  business_description  text not null default '',
  desired_type         text not null default '',    -- sponsor|supporter|consult
  support_kinds        text[] not null default '{}',
  placement_wish       text not null default '',
  target_events        text not null default '',
  free_text            text not null default '',
  agreed               boolean not null default false,
  status               text not null default 'new', -- new|reviewing|done|closed
  admin_memo           text not null default '',
  is_deleted           boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_awa_sponsor_inquiries_created
  on public.awa_sponsor_inquiries (created_at desc) where is_deleted = false;

-- ----------------------------------------------------------------------------
-- 監査ログ（誰が何を変えたか）
-- ----------------------------------------------------------------------------
create table if not exists public.awa_sponsor_audit_logs (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,
  target_type  text not null default '',
  target_id    text not null default '',
  before_data  jsonb,
  after_data   jsonb,
  user_id      text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists idx_awa_sponsor_audit_created
  on public.awa_sponsor_audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- RLS：全テーブル有効化。anon/authenticated 用ポリシーは作らない＝完全遮断。
-- サーバーの service_role キーのみ（RLSバイパス）でアクセスする。
-- ----------------------------------------------------------------------------
alter table public.awa_sponsor_categories       enable row level security;
alter table public.awa_sponsor_companies        enable row level security;
alter table public.awa_sponsor_rights           enable row level security;
alter table public.awa_tournament_sponsor_rules enable row level security;
alter table public.awa_sponsor_screenings       enable row level security;
alter table public.awa_sponsor_inquiries        enable row level security;
alter table public.awa_sponsor_audit_logs       enable row level security;
