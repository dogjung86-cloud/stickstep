// 버그·건의 접수 — Supabase reports 테이블(insert 전용, 운영자 수신함)로 보내는 단일 창구.
// 진입은 마이 탭 "버그·건의 보내기" 시트(screens/my.ts) 한 곳뿐. 공개 게시판이 아니다:
// 접수함에는 select 정책이 없어 앱에서는 아무도(작성자 포함) 읽지 못한다.
// 핵심 가치는 자동 컨텍스트 첨부다. 학생이 "어디가 이상해요"라고밖에 못 적어도
// 접수 순간의 과목·학년·최근 단원·기기 정보가 함께 남아 재현 좌표가 된다.
// 스텁 문법은 결제(purchase.ts)와 동일: DEV 기본은 실전송 없는 스텁(window.__ssReports에만
// 기록 — e2e·로컬 검수가 운영 DB를 더럽히지 않게), sessionStorage "ss.reportreal"="1"로
// 실전송 강제. 프로덕션 번들은 항상 실전송이고, env가 없으면 실패를 정직하게 반환한다.
import { getState, getViewGrade, getViewSubject, isPremium, isReviewMode, recentUnit } from "./store";
import { currentUser, getSupabase, isAuthConfigured } from "./auth";

export type ReportKind = "bug" | "typo" | "idea";

export const REPORT_BODY_MIN = 5;
export const REPORT_BODY_MAX = 800; // schema.sql reports.body check와 동일해야 한다(이원화 금지)
export const REPORT_DAILY_CAP = 5; // 하루 접수 상한(기기 기준) — 중학생 도배 방지의 1차 방어선

export type ReportFail = "short" | "cap" | "error";
export interface ReportResult {
  ok: boolean;
  reason?: ReportFail;
}

interface ReportRow {
  user_id: string | null;
  kind: ReportKind;
  body: string;
  context: Record<string, unknown>;
}

const CAP_KEY = "ss.reportCap"; // "<YYYY-MM-DD>:<보낸 수>" — 자정(기기 시간) 리셋

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sentToday(): number {
  try {
    const raw = localStorage.getItem(CAP_KEY);
    if (!raw) return 0;
    const [day, n] = raw.split(":");
    return day === todayStr() ? Math.max(0, Number(n) || 0) : 0;
  } catch {
    return 0;
  }
}

function bumpSentToday(): void {
  try {
    localStorage.setItem(CAP_KEY, `${todayStr()}:${sentToday() + 1}`);
  } catch {
    /* 저장 불가 기기는 상한 없이 통과 — 접수가 상한 집계보다 중요하다 */
  }
}

/** 오늘 더 보낼 수 있는 접수 수(시트 문구·상한 판정 공용). */
export function reportsLeftToday(): number {
  return Math.max(0, REPORT_DAILY_CAP - sentToday());
}

/** 접수 순간의 재현 컨텍스트. 개인정보는 담지 않는다(내용 외 수집 항목은 privacy.html 1의 라와 동기). */
function reportContext(): Record<string, unknown> {
  const s = getState();
  return {
    subject: getViewSubject(),
    grade: getViewGrade(),
    unit: recentUnit(), // 최근에 실제로 연 단원(레슨·시험 기준) — "어느 단원이었는지"의 좌표
    premium: isPremium(),
    review: isReviewMode(),
    onboarded: s.onboarded,
    mode: import.meta.env.MODE,
    vw: window.innerWidth,
    vh: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    lang: navigator.language,
    ua: navigator.userAgent,
  };
}

/** 접수 전송. 검증(길이·일일 상한) 실패는 reason으로 구분해 시트가 문구를 고른다. */
export async function submitReport(kind: ReportKind, bodyRaw: string): Promise<ReportResult> {
  const body = bodyRaw.trim().slice(0, REPORT_BODY_MAX);
  if (body.length < REPORT_BODY_MIN) return { ok: false, reason: "short" };
  if (reportsLeftToday() <= 0) return { ok: false, reason: "cap" };

  const row: ReportRow = {
    user_id: currentUser()?.id ?? null, // 게스트도 접수 가능(로그인 강요 없음 — 앱 로그인 정책과 같은 결)
    kind,
    body,
    context: reportContext(),
  };

  // DEV 기본 스텁: 로컬 dev·e2e의 전송이 운영 reports에 쌓이면 실제 접수와 구분이 안 된다.
  const stub = import.meta.env.DEV && sessionStorage.getItem("ss.reportreal") !== "1";
  if (stub) {
    const w = window as unknown as { __ssReports?: ReportRow[] };
    (w.__ssReports ??= []).push(row); // e2e 검증 훅(DEV 전용)
    bumpSentToday();
    return { ok: true };
  }

  if (!isAuthConfigured()) return { ok: false, reason: "error" }; // env 없는 프로덕션(이론상 경로)
  try {
    const c = await getSupabase();
    const { error } = await c.from("reports").insert(row); // select 없는 insert라 조회 정책 불필요
    if (error) return { ok: false, reason: "error" };
    bumpSentToday();
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}
