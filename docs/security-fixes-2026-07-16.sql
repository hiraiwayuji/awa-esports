-- ============================================================
-- AWAKEN GLOW セキュリティ修正 2026-07-16
-- Codex レビュー指摘 #1（合言葉漏れ）と #5（二重送信）に対応するDB変更。
--
-- 方針（ぼーるくん判断）:
--   メンバー合言葉のローテーションは行わない（/board はあまり見られないため許容）。
--   目的は /ops をメンバー合言葉から切り離すこと。よって読み取り系RPCを
--   「管理合言葉でも通す」ようにするだけ。メンバーへの再周知は不要。
--
-- ⚠ 適用手順（順番厳守）:
--   1. このSQLを適用（読み取り系RPCが管理合言葉も受理＋submission_id列）
--   2. member-files Edge Function を更新デプロイ（list/download が管理合言葉も受理）
--   3. Web（/ops をはじめ本体）をデプロイ
--
--   ※ 将来メンバー合言葉を変えたくなったら、下の ag_is_member の1行だけ直せばよい。
-- ============================================================

-- 合言葉チェックを1か所に集約（将来のローテーションはこの2関数だけ直せばよい）
create or replace function public.ag_is_member(pass text)
returns boolean
language sql
immutable
set search_path to 'public', 'pg_temp'
as $$
  -- メンバー合言葉（/board・/resources 用）。今回は据え置き。
  select pass = 'agmember2026';
$$;

create or replace function public.ag_is_admin(pass text)
returns boolean
language sql
immutable
set search_path to 'public', 'pg_temp'
as $$
  select pass = 'awakenglow2026';
$$;

-- 連絡板の閲覧：メンバー合言葉 または 管理合言葉（/ops はログイン済みの管理合言葉を使う）
create or replace function public.board_list(member_pass text)
returns setof public.awa_board_posts
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not (public.ag_is_member(member_pass) or public.ag_is_admin(member_pass)) then
    raise exception 'unauthorized';
  end if;
  return query
    select * from public.awa_board_posts
    order by coalesce(event_date, created_at::date) desc, created_at desc;
end;
$function$;

-- 出欠一覧
create or replace function public.attend_all(member_pass text)
returns table(post_id uuid, name text, created_at timestamptz)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not (public.ag_is_member(member_pass) or public.ag_is_admin(member_pass)) then
    raise exception 'unauthorized';
  end if;
  return query
    select a.post_id, a.name, a.created_at
    from public.awa_board_attendance a
    order by a.created_at asc;
end;
$function$;

-- 出欠の追加
create or replace function public.attend_join(member_pass text, p_post_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  nm text := btrim(coalesce(p_name, ''));
begin
  if not (public.ag_is_member(member_pass) or public.ag_is_admin(member_pass)) then
    raise exception 'unauthorized';
  end if;
  if nm = '' or char_length(nm) > 40 then
    raise exception 'invalid_name';
  end if;
  insert into public.awa_board_attendance (post_id, name)
  values (p_post_id, nm)
  on conflict (post_id, name) do nothing;
end;
$function$;

-- 出欠の取消
create or replace function public.attend_cancel(member_pass text, p_post_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not (public.ag_is_member(member_pass) or public.ag_is_admin(member_pass)) then
    raise exception 'unauthorized';
  end if;
  delete from public.awa_board_attendance
  where post_id = p_post_id and name = btrim(coalesce(p_name, ''));
end;
$function$;

-- ============================================================
-- #5 二重送信対策：申込1回ごとのUUIDに一意制約を張り、再送は無視できるようにする
-- ============================================================
-- 注: 部分インデックス（where ...）は PostgREST の on_conflict と噛み合わないため、
-- 全体の一意インデックスにする。NULL は Postgres 既定で「互いに異なる」扱いなので、
-- submission_id 未指定（古いクライアント）の行は何行あっても許容される。
alter table public.awa_event_entries
  add column if not exists submission_id uuid;
create unique index if not exists awa_event_entries_submission_id_key
  on public.awa_event_entries (submission_id);

alter table public.awa_survey_responses
  add column if not exists submission_id uuid;
create unique index if not exists awa_survey_responses_submission_id_key
  on public.awa_survey_responses (submission_id);
