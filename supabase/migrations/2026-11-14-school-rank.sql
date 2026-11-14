-- 학교 랭킹(2026-11-14): 학교별 누적 스텝 순위와 "우리 학교" 안의 개인 순위.
-- 운영 Supabase의 SQL Editor에 이 파일 전체를 붙여 넣고 한 번 실행한다(여러 번 실행해도 안전).
-- 표를 직접 읽게 하지 않는다. 아래 두 함수(security definer)가 정해진 모양의 집계만 돌려준다.
--   school_rank_board(p_kind)  : 학교급별 학교 순위(3명 이상 모인 학교만) + 내 학교 한 줄. 누구나 부를 수 있다.
--   school_member_board()      : 내 학교 안의 순위(위에서 10명 + 내 순위). 로그인한 본인 학교만.
-- 남에게 보이는 것은 닉네임과 누적 스텝뿐이다. 닉네임이 없거나 쓸 수 없는 말이면 기본 이름("스텝 친구").
-- 소셜 이름, 이메일, 아바타, 사용자 id는 돌려주지 않는다.

-- 순위에 내 이름을 올리지 않는 스위치(학교 합계에는 그대로 더해진다)
alter table public.profiles add column if not exists rank_hidden boolean not null default false;

-- 순위에 쓰는 스텝: 가입한 날수에 비해 터무니없이 큰 값은 잘라 낸다(스텝은 기기가 보고하는 값이라 느슨한 방어).
-- 하루 1,500스텝 x (가입 뒤 날수 + 1)이 상한이다. 앱의 누적 스텝 자체는 건드리지 않는다.
create or replace function public.rank_steps(p_life int, p_created timestamptz)
returns int
language sql
stable
as $$
  select greatest(0, least(
    coalesce(p_life, 0),
    (floor(extract(epoch from (now() - coalesce(p_created, now()))) / 86400)::int + 1) * 1500
  ));
$$;

-- 순위에 보이는 이름: 닉네임이 없거나 금칙어가 들어 있으면 기본 이름(앱 core/nickFilter.ts와 같은 목록)
create or replace function public.rank_name(p_nick text)
returns text
language sql
immutable
as $$
  select case
    when p_nick is null or btrim(p_nick) = '' then '스텝 친구'
    when regexp_replace(lower(p_nick), '[\s._\-*~!@#^]+', '', 'g')
         ~ '(시발|씨발|씨bal|시bal|ㅅㅂ|ㅆㅂ|병신|ㅂㅅ|좆|존나|졸라|새끼|개새|지랄|ㅈㄹ|닥쳐|꺼져|미친놈|미친년|섹스|보지|자지|창녀|걸레|니애미|느금|엠창|fuck|shit|bitch|sex|porn|운영자|관리자|스틱스텝|stickstep|admin)'
      then '스텝 친구'
    else left(btrim(p_nick), 12)
  end;
$$;

create or replace function public.school_rank_board(p_kind text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select p.school_code as code,
           max(p.school_name) as name,
           max(p.school_region) as region,
           count(*)::int as members,
           sum(public.rank_steps(g.life_step, p.created_at))::bigint as steps
    from public.profiles p
    left join public.progress g on g.user_id = p.id
    where p.school_code is not null
      and p.school_kind = p_kind
      and p_kind in ('초등학교', '중학교', '고등학교')
    group by p.school_code
  ),
  r as (
    select s.*, rank() over (order by s.steps desc, s.members desc, s.code) as rk
    from s
    where s.members >= 3
  )
  select jsonb_build_object(
    'top', coalesce((
      select jsonb_agg(jsonb_build_object('code', t.code, 'name', t.name, 'region', t.region, 'members', t.members, 'steps', t.steps, 'rank', t.rk) order by t.rk)
      from (select * from r order by rk limit 50) t
    ), '[]'::jsonb),
    'mine', (
      select jsonb_build_object('code', s.code, 'name', s.name, 'region', s.region, 'members', s.members, 'steps', s.steps,
                                'rank', (select r.rk from r where r.code = s.code))
      from s
      join public.profiles me on me.id = auth.uid() and me.school_code = s.code
    )
  );
$$;

create or replace function public.school_member_board()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select id, school_code, school_name, rank_hidden from public.profiles where id = auth.uid() and school_code is not null
  ),
  m as (
    select p.id,
           public.rank_name(p.nickname) as name,
           public.rank_steps(g.life_step, p.created_at) as steps,
           p.rank_hidden as hidden
    from public.profiles p
    left join public.progress g on g.user_id = p.id
    where p.school_code = (select school_code from me)
  ),
  v as (
    select m.*, rank() over (order by m.steps desc, m.id) as rk from m where not m.hidden
  )
  select case when not exists (select 1 from me) then null else jsonb_build_object(
    'school', (select school_name from me),
    'members', (select count(*)::int from m),
    'shown', (select count(*)::int from v),
    'top', coalesce((
      select jsonb_agg(jsonb_build_object('name', t.name, 'steps', t.steps, 'rank', t.rk, 'me', t.id = auth.uid()) order by t.rk)
      from (select * from v order by rk limit 10) t
    ), '[]'::jsonb),
    'me', (
      select jsonb_build_object('name', m.name, 'steps', m.steps, 'hidden', m.hidden,
                                'rank', (select v.rk from v where v.id = m.id))
      from m where m.id = auth.uid()
    )
  ) end;
$$;

revoke all on function public.school_rank_board(text) from public;
revoke all on function public.school_member_board() from public;
grant execute on function public.school_rank_board(text) to anon, authenticated;
grant execute on function public.school_member_board() to authenticated;
