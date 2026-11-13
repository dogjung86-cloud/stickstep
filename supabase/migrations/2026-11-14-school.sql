-- 내 학교 등록(2026-11-14): profiles에 학교 컬럼 네 개를 더한다.
-- 운영 Supabase의 SQL Editor에 이 파일 전체를 붙여 넣고 한 번 실행한다(여러 번 실행해도 안전).
-- 수집 항목은 최소로: 나이스 표준학교코드, 학교명, 지역(시도 + 시군구), 학교급. 주소 전체는 저장하지 않는다.
-- 선택 입력이라 전부 null 허용이고, 등록 해제는 네 컬럼을 null로 되돌린다.
-- 읽기와 쓰기는 기존 정책("own profile select", "own profile update")이 본인 행으로 제한한다.
-- 회원탈퇴(delete_user)는 auth.users 삭제가 profiles로 cascade되어 학교 정보도 함께 지워진다.
alter table public.profiles add column if not exists school_code text;
alter table public.profiles add column if not exists school_name text;
alter table public.profiles add column if not exists school_region text;
alter table public.profiles add column if not exists school_kind text;

-- 길이 상한(앱 store.setSchool의 자르기와 같은 값)
alter table public.profiles drop constraint if exists profiles_school_len;
alter table public.profiles add constraint profiles_school_len check (
  coalesce(char_length(school_code), 0) <= 12
  and coalesce(char_length(school_name), 0) <= 40
  and coalesce(char_length(school_region), 0) <= 30
  and coalesce(char_length(school_kind), 0) <= 12
);

-- 학교별 집계(랭킹 등)를 나중에 붙일 때 쓸 색인. 지금은 앱이 학교로 조회하지 않는다.
create index if not exists profiles_school_idx on public.profiles (school_code) where school_code is not null;
