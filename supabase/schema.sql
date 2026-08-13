-- 스틱스텝 동기화 스키마 v1
-- Supabase 대시보드 → SQL Editor에 전체를 붙여넣고 Run 한 번이면 끝.
-- 설계 원칙:
--   · 사용자당 progress 1행(클라이언트 AppState의 서버 사본) — 동기화가 단순하고 RLS가 명확하다.
--   · 컬럼명은 화폐 이름 '스텝'을 반영해 total_step.
--   · 리더보드/랭킹(후속 기능)은 total_step 정수 컬럼과 exams jsonb로 조회 가능하게 준비만 해 둔다.

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
  total_step int not null default 0, -- 앱의 totalXp(화폐 이름 '스텝') — 보유 잔액(소비로 줄 수 있음)
  life_step int not null default 0, -- 앱의 lifeXp — 누적 획득 스텝(장화 레벨·랭킹 기준, 소비로 줄지 않음)
  avatar_id smallint, -- 스틱맨 아바타 선택(ui/avatar AVATAR_KINDS 인덱스, null=기본)
  streak int not null default 0,
  last_study_day date,
  premium boolean not null default false, -- 영수증 검증 전까지는 편의 동기화 값(진실 원천 아님)
  lessons jsonb not null default '{}'::jsonb, -- Record<lessonId, {done,acc,bestXp}>
  exams jsonb not null default '{}'::jsonb, -- Record<examId, {attempts,best,conquered}>
  minigame jsonb not null default '{}'::jsonb, -- Record<gameId, bestScore>
  wrong_notes jsonb not null default '{}'::jsonb, -- Record<key, WrongNote> 오답노트(store.ts 참조)
  updated_at timestamptz not null default now()
);
-- 기존 배포 프로젝트에 적용할 때:
--   alter table public.progress add column if not exists wrong_notes jsonb not null default '{}'::jsonb;
--   alter table public.progress add column if not exists life_step int not null default 0;
--   alter table public.progress add column if not exists avatar_id smallint;

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

-- ── 결제(토스페이먼츠 단건) — 주문 원장 + 과목별 이용권 ─────────────────
-- 흐름: pay-order 엣지 함수가 가격을 서버에서 재계산해 orders(pending)를 만들고,
-- 결제창 인증 뒤 pay-confirm 엣지 함수가 토스 승인 API를 호출해 paid로 올린 다음
-- entitlements(과목별 이용권)를 지급한다. 클라이언트는 두 테이블 모두 "본인 행 읽기"만
-- 가능 — 쓰기는 전부 엣지 함수(service role)라 지급 조작이 불가능하다.
-- progress.premium은 편의 동기화 값 유지(진실 원천은 entitlements — 로그인 시 클라이언트가 교체 반영).
create table if not exists public.orders (
  order_id text primary key, -- "ss_" + 랜덤 32자(토스 orderId 규격 6~64자 [A-Za-z0-9_-])
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('own', 'pass30')),
  subject_ids text[] not null, -- 판매 카탈로그 id("sci-g1" 등, purchase.ts SELLABLE_SUBJECTS)
  amount int not null check (amount > 0), -- 서버가 재계산·검증한 결제 금액(원)
  price_kind text not null default 'regular', -- 검증에 매칭된 가격표: regular(정가 사다리)|earlybird|pass30
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled')),
  guardian_consent boolean not null default false, -- 주문 확인·보호자 동의 체크 기록(전상법 13조 2항 증적)
  consent_ua text, -- 동의 시점 User-Agent(증적 보강)
  payment_key text, -- 토스 paymentKey(승인 후)
  method text, -- 승인 응답의 결제수단("카드" 등)
  receipt_url text, -- 토스 매출전표 URL
  test_mode boolean not null default true, -- 테스트 키 결제 여부(라이브 전환 뒤 정산 구분)
  fail_code text,
  fail_message text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.entitlements (
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id text not null, -- 학년×과목 이용권 단위(purchase.ts SELLABLE_SUBJECTS id)
  plan text not null check (plan in ('own', 'pass30')),
  expires_at timestamptz, -- null = 소장(기간 없음) · pass30 = 승인 시점 + 30일(만료 집행의 근거)
  order_id text references public.orders (order_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
drop policy if exists "own orders select" on public.orders;
create policy "own orders select" on public.orders
  for select using (auth.uid() = user_id);
drop policy if exists "own entitlements select" on public.entitlements;
create policy "own entitlements select" on public.entitlements
  for select using (auth.uid() = user_id);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();
drop trigger if exists entitlements_touch on public.entitlements;
create trigger entitlements_touch
  before update on public.entitlements
  for each row execute function public.touch_updated_at();

-- ── 회원탈퇴: 본인 계정 완전 삭제 ──────────────────────────────────────
-- anon 키(클라이언트)는 auth.users를 지울 수 없으므로 security definer 함수로 제공한다.
-- auth.users 삭제가 profiles·progress로 cascade — 앱의 auth.ts deleteAccount()가 호출.
-- 이 파일보다 먼저 만든 프로젝트에는 이 블록만 SQL Editor에 다시 실행하면 된다.
create or replace function public.delete_user()
returns void
language sql
security definer set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;
revoke execute on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
