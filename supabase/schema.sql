-- 스틱스텝 동기화 스키마 v1
-- Supabase 대시보드 → SQL Editor에 전체를 붙여넣고 Run 한 번이면 끝.
-- 설계 원칙:
--   · 사용자당 progress 1행(클라이언트 AppState의 서버 사본) — 동기화가 단순하고 RLS가 명확하다.
--   · 컬럼명은 XP→'스틱' 개명을 선반영해 total_stick.
--   · 리더보드/랭킹(후속 기능)은 total_stick 정수 컬럼과 exams jsonb로 조회 가능하게 준비만 해 둔다.

-- ── 프로필: auth.users 1:1, 가입 시 트리거로 자동 생성 ─────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text, -- 리더보드 표시명(후속 기능) — 가입 시 null, 나중에 사용자가 정한다
  created_at timestamptz not null default now()
);

-- ── 학습 진행도: 사용자당 1행 ──────────────────────────────────────────
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  onboarded boolean not null default false,
  grade text, -- 온보딩 학년("g1"|"g2"|"g3")
  goal_min int not null default 10,
  total_stick int not null default 0, -- 앱의 totalXp(개명 예정 '스틱')
  streak int not null default 0,
  last_study_day date,
  premium boolean not null default false, -- 영수증 검증 전까지는 편의 동기화 값(진실 원천 아님)
  lessons jsonb not null default '{}'::jsonb, -- Record<lessonId, {done,acc,bestXp}>
  exams jsonb not null default '{}'::jsonb, -- Record<examId, {attempts,best,conquered}>
  minigame jsonb not null default '{}'::jsonb, -- Record<gameId, bestScore>
  wrong_notes jsonb not null default '{}'::jsonb, -- Record<key, WrongNote> 오답노트(store.ts 참조)
  updated_at timestamptz not null default now()
);
-- 기존 배포 프로젝트에 적용할 때: alter table public.progress add column if not exists wrong_notes jsonb not null default '{}'::jsonb;

-- ── RLS: 본인 행만 읽고 쓴다 ───────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists "own profile select" on public.profiles;
create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "own progress select" on public.progress;
create policy "own progress select" on public.progress
  for select using (auth.uid() = user_id);
drop policy if exists "own progress insert" on public.progress;
create policy "own progress insert" on public.progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "own progress update" on public.progress;
create policy "own progress update" on public.progress
  for update using (auth.uid() = user_id);

-- ── 가입 시 프로필 자동 생성 ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── updated_at 자동 갱신 ───────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch
  before update on public.progress
  for each row execute function public.touch_updated_at();
