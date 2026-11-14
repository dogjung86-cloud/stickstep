// 내 학교 등록: 학교 검색(나이스 교육정보 개방 포털 학교기본정보)과 서버 반영의 단일 창구.
// 진입은 마이 탭 프로필 카드의 학교 줄 → "내 학교" 시트(screens/my.ts) 한 곳뿐.
// - 검색은 Supabase 엣지 함수 school-search가 대신 부른다(나이스 인증키를 번들에 싣지 않는다).
// - 저장은 최소 항목만: 표준학교코드·학교명·지역(시도 + 시군구)·학교급. 주소 전체, 전화번호 등은 받지도 않는다.
// - 게스트는 기기에만 저장(서버 전송 없음), 로그인 상태면 profiles의 school_* 컬럼에도 반영한다
//   (닉네임과 같은 결. progress 테이블이 아니라서 sync.ts rowOf에 넣지 않는다).
// - 스텁 문법은 결제(purchase.ts)·접수함과 같다: DEV 기본은 네트워크 없는 스텁(고정 목록에서 검색,
//   서버 반영은 window.__ssSchoolPush에만 기록), sessionStorage "ss.schoolreal"="1"이면 실호출.
//   DEV에서 실패 화면을 보려면 "ss.schoolstub"="fail".
import { currentUser, getSupabase, isAuthConfigured } from "./auth";
import type { SchoolInfo } from "./store";

export type School = SchoolInfo;

/** 검색할 학교급(시트의 학교급 세그 순서). 서버 함수 허용 목록과 같아야 한다. 등록은 학교급과 상관없이 한 곳뿐이다. */
export const SCHOOL_KINDS: readonly string[] = ["초등학교", "중학교", "고등학교"];
/** 시트를 처음 열 때 고르는 학교급(등록한 학교가 있으면 그 학교급). */
export const SCHOOL_KIND_DEFAULT = "중학교";
export const SCHOOL_QUERY_MIN = 2;
export const SCHOOL_QUERY_MAX = 20;

export type SchoolSearchResult =
  | { ok: true; items: School[]; total: number } // total = 조건에 맞는 전체 수(목록은 앞의 일부만)
  | { ok: false; reason: "short" | "network" };

const env = import.meta.env;
const cleanEnv = (v: unknown): string => (typeof v === "string" ? v.replace(/﻿/g, "").trim() : "");
const SUPABASE_URL = cleanEnv(env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = cleanEnv(env.VITE_SUPABASE_ANON_KEY);

const useStub = (): boolean => env.DEV && sessionStorage.getItem("ss.schoolreal") !== "1";

/** 검색어 정리: 공백 접기 + 길이 컷. 화면과 서버가 같은 규칙을 쓴다. */
export function cleanSchoolQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, SCHOOL_QUERY_MAX);
}

// DEV 스텁용 목록. 이름이 같은 학교(중앙중학교)와 지역만 다른 학교를 일부러 넣었다(동명 구분 확인용).
const STUB: School[] = [
  { code: "7061115", name: "중앙중학교", region: "서울특별시 종로구", kind: "중학교" },
  { code: "7211196", name: "부산중앙중학교", region: "부산광역시 기장군", kind: "중학교" },
  { code: "7501001", name: "중앙중학교", region: "경기도 안양시", kind: "중학교" },
  { code: "8011002", name: "중앙중학교", region: "충청북도 청주시", kind: "중학교" },
  { code: "7132131", name: "남서울중학교", region: "서울특별시 관악구", kind: "중학교" },
  { code: "7051183", name: "북서울중학교", region: "서울특별시 도봉구", kind: "중학교" },
  { code: "7531003", name: "시흥중학교", region: "경기도 시흥시", kind: "중학교" },
  { code: "7531004", name: "시흥은행중학교", region: "경기도 시흥시", kind: "중학교" },
  { code: "7031005", name: "시흥중학교", region: "서울특별시 금천구", kind: "중학교" },
  { code: "7341006", name: "한빛중학교", region: "대전광역시 유성구", kind: "중학교" },
  { code: "7801007", name: "한라중학교", region: "제주특별자치도 제주시", kind: "중학교" },
  { code: "7010001", name: "중앙고등학교", region: "서울특별시 종로구", kind: "고등학교" },
  { code: "7020001", name: "중앙초등학교", region: "서울특별시 중구", kind: "초등학교" },
];

function asSchool(v: unknown): School | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const s = (x: unknown, max: number): string => (typeof x === "string" ? x.trim().slice(0, max) : "");
  const code = s(o.code, 12);
  const name = s(o.name, 40);
  if (!code || !name) return null;
  return { code, name, region: s(o.region, 30), kind: s(o.kind, 12) };
}

/** 학교 이름으로 검색. 두 글자 미만이면 호출하지 않고 "short"를 돌려준다. */
export async function searchSchools(rawQuery: string, kind: string = SCHOOL_KIND_DEFAULT): Promise<SchoolSearchResult> {
  const q = cleanSchoolQuery(rawQuery);
  if (q.length < SCHOOL_QUERY_MIN) return { ok: false, reason: "short" };

  if (useStub()) {
    await new Promise((r) => window.setTimeout(r, 120)); // 불러오는 중 상태가 한 번은 보이게
    if (sessionStorage.getItem("ss.schoolstub") === "fail") return { ok: false, reason: "network" };
    const key = q.replace(/\s/g, "");
    const items = STUB.filter((s) => s.kind === kind && s.name.includes(key));
    return { ok: true, items, total: items.length };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok: false, reason: "network" }; // env 없는 빌드
  try {
    // 검색어는 주소가 아니라 본문에 싣는다(접속 기록에 남지 않게).
    const res = await fetch(`${SUPABASE_URL}/functions/v1/school-search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q, kind }),
    });
    if (!res.ok) return { ok: false, reason: "network" };
    const body = (await res.json()) as { items?: unknown; total?: unknown };
    const items = (Array.isArray(body.items) ? body.items : []).map(asSchool).filter((s): s is School => !!s);
    return { ok: true, items, total: typeof body.total === "number" ? body.total : items.length };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** profiles 행에 실리는 학교 컬럼 묶음(등록 해제는 전부 null). sync.ts도 이 모양을 쓴다. */
export function schoolColumns(s: School | null): Record<string, string | null> {
  return {
    school_code: s?.code ?? null,
    school_name: s?.name ?? null,
    school_region: s?.region ?? null,
    school_kind: s?.kind ?? null,
  };
}

/** profiles 행에서 학교를 읽는다(컬럼이 비었으면 null). */
export function schoolFromRow(row: Record<string, unknown> | null | undefined): School | null {
  if (!row) return null;
  return asSchool({ code: row.school_code, name: row.school_name, region: row.school_region, kind: row.school_kind });
}

/** 로그인 상태면 서버 프로필에도 반영한다(등록·변경·해제 직후). 게스트와 스텁은 서버에 아무것도 보내지 않는다. */
export async function pushSchool(s: School | null): Promise<boolean> {
  if (useStub()) {
    const w = window as unknown as { __ssSchoolPush?: (School | null)[] };
    (w.__ssSchoolPush ??= []).push(s); // e2e 확인용(DEV 전용)
    return true;
  }
  const u = currentUser();
  if (!isAuthConfigured() || !u) return false;
  try {
    const c = await getSupabase();
    const { error } = await c.from("profiles").update(schoolColumns(s)).eq("id", u.id);
    return !error;
  } catch {
    return false;
  }
}
