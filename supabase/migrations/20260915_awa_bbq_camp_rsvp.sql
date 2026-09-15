-- ============================================================================
-- AWAKEN GLOW BBQ合宿(11/7-8) 参加アンケート マイグレーション
-- ----------------------------------------------------------------------------
-- このプロジェクトの Supabase は複数アプリと同居する共有DBのため、テーブルは
-- `awa_bbq_camp_rsvp` として追加し、既存テーブルには一切触れない（追加のみ）。
--
-- セキュリティ方針（既存の awa_survey_responses と同じパターン）：
--   - anon / authenticated には INSERT のみ許可（with_check true）。SELECT/UPDATE/
--     DELETE のポリシーは一切作らない → 一般公開キーからは他人の回答を読めない。
--   - 一覧・追加・修正・削除は合言葉つきの SECURITY DEFINER 関数経由でのみ行う
--     （/bbq-survey-results 管理画面が使用）。合言葉は 'awakenglow2026'
--     （既存の /survey-results と共通）。
--   - submission_id には UNIQUE INDEX を張るが、PostgREST の `on_conflict=` は
--     使わない（ON CONFLICT句はRLSのSELECTポリシーを要求するため、INSERTのみ
--     許可の構成だと常に 42501 で失敗する）。アプリ側は通常のINSERTを行い、
--     重複（409 unique_violation）は「二重送信」として許容する。
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.awa_bbq_camp_rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submission_id uuid,
  name text not null default '',
  attendance text not null default '',
  gamecenter text not null default '',
  dog_allergy boolean not null default false,
  memo text not null default '',
  source text not null default 'self'
);

create unique index if not exists awa_bbq_camp_rsvp_submission_id_key
  on public.awa_bbq_camp_rsvp using btree (submission_id);

alter table public.awa_bbq_camp_rsvp enable row level security;

drop policy if exists awa_bbq_camp_rsvp_anon_insert on public.awa_bbq_camp_rsvp;
create policy awa_bbq_camp_rsvp_anon_insert
  on public.awa_bbq_camp_rsvp
  for insert
  to anon, authenticated
  with check (true);

-- ----------------------------------------------------------------------------
-- 事務局用 RPC（合言葉ゲート、SECURITY DEFINER でRLSをバイパス）
-- ----------------------------------------------------------------------------

create or replace function public.admin_list_awa_bbq_camp_rsvp(pass text)
returns setof public.awa_bbq_camp_rsvp
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  return query
    select * from public.awa_bbq_camp_rsvp order by created_at desc;
end;
$$;

create or replace function public.admin_insert_awa_bbq_camp_rsvp(
  pass text,
  p_name text,
  p_attendance text,
  p_gamecenter text,
  p_dog_allergy boolean,
  p_memo text
)
returns public.awa_bbq_camp_rsvp
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  result public.awa_bbq_camp_rsvp;
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  insert into public.awa_bbq_camp_rsvp (name, attendance, gamecenter, dog_allergy, memo, source)
  values (p_name, p_attendance, p_gamecenter, p_dog_allergy, p_memo, 'admin')
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_update_awa_bbq_camp_rsvp(
  pass text,
  target_id uuid,
  p_name text,
  p_attendance text,
  p_gamecenter text,
  p_dog_allergy boolean,
  p_memo text
)
returns public.awa_bbq_camp_rsvp
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  result public.awa_bbq_camp_rsvp;
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  update public.awa_bbq_camp_rsvp
    set name = p_name,
        attendance = p_attendance,
        gamecenter = p_gamecenter,
        dog_allergy = p_dog_allergy,
        memo = p_memo,
        updated_at = now()
    where id = target_id
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_delete_awa_bbq_camp_rsvp(pass text, target_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  delete from public.awa_bbq_camp_rsvp where id = target_id;
end;
$$;
