// 학교 랭킹 자료 창구: 학교별 누적 스텝 순위와 "우리 학교" 안의 순위.
// 서버는 표를 직접 읽게 하지 않고 두 함수(school_rank_board, school_member_board)가 집계만 돌려준다
// (supabase/migrations/2026-11-14-school-rank.sql). 남에게 보이는 것은 닉네임과 누적 스텝뿐이다.
// 스텁 문법은 core/school.ts와 같다: DEV 기본은 고정 자료, sessionStorage "ss.schoolreal"="1"이면 실호출,
// "ss.schoolstub"="fail"이면 실패 화면.
import { currentUser, getSupabase, isAuthConfigured } from "./auth";
import { RANK_DEFAULT_NAME, nickBlocked } from "./nickFilter";
import { getState } from "./store";

export interface SchoolRankRow {
  code: string;
  name: string;
  region: string;
  members: number;
  steps: number;
  /** 3명이 안 모인 학교는 순위가 없다(null) */
  rank: number | null;
}
export interface SchoolBoard {
  top: SchoolRankRow[];
  /** 내 학교(그 학교급에 등록했을 때만) */
  mine: SchoolRankRow | null;
}
export interface MemberRow {
  name: string;
  steps: number;
  rank: number;
  me: boolean;
}
export interface MemberBoard {
  school: string;
  /** 학교에 등록한 사람 수(이름을 숨긴 사람 포함) */
  members: number;
  top: MemberRow[];
  me: { name: string; steps: number; hidden: boolean; rank: number | null } | null;
}

/** 학교 순위에 오르는 최소 인원(서버 함수와 같은 값) */
export const RANK_MIN_MEMBERS = 3;

const env = import.meta.env;
const useStub = (): boolean => env.DEV && sessionStorage.getItem("ss.schoolreal") !== "1";
const stubFail = (): boolean => sessionStorage.getItem("ss.schoolstub") === "fail";
const wait = (ms: number): Promise<void> => new Promise((r) => window.setTimeout(r, ms));

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);
const str = (v: unknown, max: number): string => (typeof v === "string" ? v.slice(0, max) : "");

function asSchoolRow(v: unknown): SchoolRankRow | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const code = str(o.code, 12);
  const name = str(o.name, 40);
  if (!code || !name) return null;
  return { code, name, region: str(o.region, 30), members: num(o.members), steps: num(o.steps), rank: o.rank == null ? null : num(o.rank) };
}

// ---- DEV 스텁 자료 ----
const STUB_SCHOOLS: SchoolRankRow[] = [
  { code: "7531003", name: "시흥중학교", region: "경기도 시흥시", members: 14, steps: 18420, rank: 1 },
  { code: "7061115", name: "중앙중학교", region: "서울특별시 종로구", members: 9, steps: 12150, rank: 2 },
  { code: "7132131", name: "남서울중학교", region: "서울특별시 관악구", members: 11, steps: 9870, rank: 3 },
  { code: "7501001", name: "중앙중학교", region: "경기도 안양시", members: 5, steps: 6240, rank: 4 },
  { code: "7341006", name: "한빛중학교", region: "대전광역시 유성구", members: 4, steps: 3105, rank: 5 },
  { code: "7801007", name: "한라중학교", region: "제주특별자치도 제주시", members: 3, steps: 960, rank: 6 },
];
const STUB_NAMES = ["별똥별", "과학왕", RANK_DEFAULT_NAME, "초록장화", "새벽공부", RANK_DEFAULT_NAME, "물리천재", "한걸음", "두걸음", "세걸음", "네걸음"];
const stubHidden = (): boolean => sessionStorage.getItem("ss.rankhidden") === "1";

/** 학교급별 학교 순위. 실패하면 null. */
export async function fetchSchoolBoard(kind: string): Promise<SchoolBoard | null> {
  if (useStub()) {
    await wait(120);
    if (stubFail()) return null;
    const my = getState().school ?? null;
    if (kind !== "중학교") return { top: [], mine: my && my.kind === kind ? { code: my.code, name: my.name, region: my.region, members: 1, steps: getState().lifeXp, rank: null } : null };
    const hit = my ? STUB_SCHOOLS.find((s) => s.code === my.code) : undefined;
    const mine = my && my.kind === kind ? (hit ?? { code: my.code, name: my.name, region: my.region, members: 1, steps: getState().lifeXp, rank: null }) : null;
    return { top: STUB_SCHOOLS, mine };
  }
  if (!isAuthConfigured()) return null;
  try {
    const c = await getSupabase();
    const { data, error } = await c.rpc("school_rank_board", { p_kind: kind });
    if (error || !data || typeof data !== "object") return null;
    const o = data as { top?: unknown; mine?: unknown };
    return {
      top: (Array.isArray(o.top) ? o.top : []).map(asSchoolRow).filter((r): r is SchoolRankRow => !!r),
      mine: asSchoolRow(o.mine),
    };
  } catch {
    return null;
  }
}

/** 내 학교 안의 순위. 로그인과 학교 등록이 돼 있어야 한다. 실패하면 null. */
export async function fetchMemberBoard(): Promise<MemberBoard | null> {
  if (useStub()) {
    await wait(120);
    const my = getState().school ?? null;
    if (stubFail() || !my) return null;
    const st = getState();
    const nick = st.nickname && !nickBlocked(st.nickname) ? st.nickname : RANK_DEFAULT_NAME;
    const hidden = stubHidden();
    const others = STUB_NAMES.map((name, i) => ({ name, steps: 2400 - i * 190, me: false }));
    const all = hidden ? others : [...others, { name: nick, steps: st.lifeXp, me: true }];
    all.sort((a, b) => b.steps - a.steps);
    const ranked = all.map((r, i) => ({ ...r, rank: i + 1 }));
    const mine = ranked.find((r) => r.me);
    return {
      school: my.name,
      members: others.length + 1,
      top: ranked.slice(0, 10),
      me: { name: nick, steps: st.lifeXp, hidden, rank: mine ? mine.rank : null },
    };
  }
  if (!isAuthConfigured() || !currentUser()) return null;
  try {
    const c = await getSupabase();
    const { data, error } = await c.rpc("school_member_board");
    if (error || !data || typeof data !== "object") return null;
    const o = data as { school?: unknown; members?: unknown; top?: unknown; me?: unknown };
    const top = (Array.isArray(o.top) ? o.top : [])
      .map((v): MemberRow | null => {
        if (!v || typeof v !== "object") return null;
        const r = v as Record<string, unknown>;
        return { name: str(r.name, 12) || RANK_DEFAULT_NAME, steps: num(r.steps), rank: num(r.rank), me: r.me === true };
      })
      .filter((r): r is MemberRow => !!r);
    const m = o.me && typeof o.me === "object" ? (o.me as Record<string, unknown>) : null;
    return {
      school: str(o.school, 40),
      members: num(o.members),
      top,
      me: m ? { name: str(m.name, 12) || RANK_DEFAULT_NAME, steps: num(m.steps), hidden: m.hidden === true, rank: m.rank == null ? null : num(m.rank) } : null,
    };
  } catch {
    return null;
  }
}

/** 우리 학교 순위에 내 이름을 올릴지(숨겨도 학교 합계에는 더해진다). */
export async function setRankHidden(hidden: boolean): Promise<boolean> {
  if (useStub()) {
    if (stubFail()) return false;
    sessionStorage.setItem("ss.rankhidden", hidden ? "1" : "0");
    return true;
  }
  const u = currentUser();
  if (!isAuthConfigured() || !u) return false;
  try {
    const c = await getSupabase();
    const { error } = await c.from("profiles").update({ rank_hidden: hidden }).eq("id", u.id);
    return !error;
  } catch {
    return false;
  }
}
