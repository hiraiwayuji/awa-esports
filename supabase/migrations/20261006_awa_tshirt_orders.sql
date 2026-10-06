-- ============================================================================
-- AWAKEN GLOW Tシャツ注文アンケート マイグレーション
-- ----------------------------------------------------------------------------
-- 共有DBのため `awa_tshirt_orders` を追加するだけで、既存テーブルには触れない。
-- セキュリティ方針は awa_bbq_camp_rsvp と同じ：
--   - anon / authenticated は INSERT のみ。SELECT/UPDATE/DELETE ポリシーは作らない。
--   - 一覧・追加・修正・削除は合言葉つき SECURITY DEFINER 関数経由のみ
--     （/tshirt-order-results が使用。合言葉は 'awakenglow2026'）。
--   - submission_id は UNIQUE。on_conflict は使わず、409 を二重送信として許容する。
-- items は {"M":1,"3L":2} のようなサイズ→枚数。合計はアプリ側（lib/tshirt-order.ts）
-- で計算して total_qty / total_price に入れる。
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.awa_tshirt_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submission_id uuid,
  name text not null default '',
  items jsonb not null default '{}'::jsonb,
  total_qty integer not null default 0,
  total_price integer not null default 0,
  memo text not null default '',
  source text not null default 'self'
);

create unique index if not exists awa_tshirt_orders_submission_id_key
  on public.awa_tshirt_orders using btree (submission_id);

alter table public.awa_tshirt_orders enable row level security;

drop policy if exists awa_tshirt_orders_anon_insert on public.awa_tshirt_orders;
create policy awa_tshirt_orders_anon_insert
  on public.awa_tshirt_orders
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.admin_list_awa_tshirt_orders(pass text)
returns setof public.awa_tshirt_orders
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  return query
    select * from public.awa_tshirt_orders order by created_at desc;
end;
$$;

create or replace function public.admin_insert_awa_tshirt_orders(
  pass text,
  p_name text,
  p_items jsonb,
  p_total_qty integer,
  p_total_price integer,
  p_memo text
)
returns public.awa_tshirt_orders
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  result public.awa_tshirt_orders;
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  insert into public.awa_tshirt_orders (name, items, total_qty, total_price, memo, source)
  values (p_name, p_items, p_total_qty, p_total_price, p_memo, 'admin')
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_update_awa_tshirt_orders(
  pass text,
  target_id uuid,
  p_name text,
  p_items jsonb,
  p_total_qty integer,
  p_total_price integer,
  p_memo text
)
returns public.awa_tshirt_orders
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  result public.awa_tshirt_orders;
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  update public.awa_tshirt_orders
    set name = p_name,
        items = p_items,
        total_qty = p_total_qty,
        total_price = p_total_price,
        memo = p_memo,
        updated_at = now()
    where id = target_id
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_delete_awa_tshirt_orders(pass text, target_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if pass is distinct from 'awakenglow2026' then
    raise exception 'unauthorized';
  end if;
  delete from public.awa_tshirt_orders where id = target_id;
end;
$$;
