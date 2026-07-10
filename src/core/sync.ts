// 동기화 — 로그인 사용자의 학습 기록을 Supabase progress 테이블(사용자당 1행)과 맞춘다.
// 병합 원칙: "학습은 절대 잃지 않는다" — 레슨·시험·게임은 항목별 max/OR,
// 스틱(totalXp)은 큰 쪽, 스트릭은 더 최근에 공부한 기기 기준.
// reviewMode·viewGrade·viewSubject 같은 기기 설정은 동기화하지 않는다.
// 흐름: 로그인 직후 pull→병합→push, 이후 저장(save)마다 2.5초 디바운스 push.
import type { AppState, ExamRecord, LessonProgress } from "./store";
import { applySyncedState, getState, setOnStateSaved } from "./store";
import { getSupabase, isAuthConfigured, onAuthChange } from "./auth";

interface ProgressRow {
  user_id: string;
  onboarded: boolean;
  grade: string | null;
  goal_min: number;
  total_stick: number; // 앱의 totalXp — 서버 컬럼명은 '스틱' 개명 선반영
  streak: number;
  last_study_day: string | null;
  premium: boolean;
  lessons: Record<string, LessonProgress>;
  exams: Record<string, ExamRecord>;
  minigame: Record<string, number>;
}

function rowOf(s: Readonly<AppState>, userId: string): ProgressRow {
  return {
    user_id: userId,
    onboarded: s.onboarded,
    grade: s.grade,
    goal_min: s.goalMin,
    total_stick: s.totalXp,
    streak: s.streak,
    last_study_day: s.lastStudyDay,
    premium: s.premium,
    lessons: s.lessons,
    exams: s.exams,
    minigame: s.minigame,
  };
}

function mergeLessons(
  a: Record<string, LessonProgress>,
  b: Record<string, LessonProgress>,
): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = { ...a };
  for (const [id, lb] of Object.entries(b ?? {})) {
    const la = out[id];
    out[id] = la
      ? {
          done: la.done || lb.done,
          acc: la.acc == null ? lb.acc : lb.acc == null ? la.acc : Math.max(la.acc, lb.acc),
          bestXp: Math.max(la.bestXp, lb.bestXp),
        }
      : lb;
  }
  return out;
}

function mergeExams(a: Record<string, ExamRecord>, b: Record<string, ExamRecord>): Record<string, ExamRecord> {
  const out: Record<string, ExamRecord> = { ...a };
  for (const [id, eb] of Object.entries(b ?? {})) {
    const ea = out[id];
    out[id] = ea
      ? {
          // attempts는 합산하면 기기마다 이중 계산 — 보수적으로 큰 쪽(무료 1회 정책이 헐거워지는
          // 쪽이 아니라 잠기는 쪽으로 틀리게) 채택.
          attempts: Math.max(ea.attempts, eb.attempts),
          best: Math.max(ea.best, eb.best),
          conquered: ea.conquered || eb.conquered,
        }
      : eb;
  }
  return out;
}

function mergeMinigame(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [id, v] of Object.entries(b ?? {})) out[id] = Math.max(out[id] ?? 0, v);
  return out;
}

/** 서버 행을 로컬 상태에 병합한 패치를 만든다(기기 설정 필드는 건드리지 않음). */
function mergeIntoLocal(local: Readonly<AppState>, row: ProgressRow): Partial<AppState> {
  // 스트릭: 더 최근에 공부한 쪽이 진실. 같은 날이면 큰 쪽(둘 다 이어온 기록).
  let streak = local.streak;
  let lastStudyDay = local.lastStudyDay;
  const l = local.lastStudyDay ?? "";
  const r = row.last_study_day ?? "";
  if (r > l) {
    streak = row.streak;
    lastStudyDay = row.last_study_day;
  } else if (r !== "" && r === l) {
    streak = Math.max(local.streak, row.streak);
  }
  return {
    onboarded: local.onboarded || row.onboarded,
    grade: local.grade ?? row.grade,
    goalMin: local.onboarded ? local.goalMin : row.goal_min,
    premium: local.premium || row.premium,
    totalXp: Math.max(local.totalXp, row.total_stick),
    streak,
    lastStudyDay,
    lessons: mergeLessons(local.lessons, row.lessons),
    exams: mergeExams(local.exams ?? {}, row.exams),
    minigame: mergeMinigame(local.minigame ?? {}, row.minigame),
  };
}

let activeUserId: string | null = null;
let pushTimer = 0;
let pushing = false;
let dirty = false;

function schedulePush(): void {
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => void pushNow(), 2500);
}

async function pushNow(): Promise<void> {
  if (!activeUserId || pushing) return;
  pushing = true;
  dirty = false;
  try {
    const sb = await getSupabase();
    await sb.from("progress").upsert(rowOf(getState(), activeUserId));
  } catch {
    dirty = true; // 네트워크 실패 — 다음 저장 때 다시 시도
  } finally {
    pushing = false;
  }
}

/** 로그인 직후 1회: 서버 기록을 내려받아 병합하고, 결과를 다시 올린다. */
async function fullSync(userId: string): Promise<void> {
  try {
    const sb = await getSupabase();
    const { data } = await sb.from("progress").select("*").eq("user_id", userId).maybeSingle();
    if (data) applySyncedState(mergeIntoLocal(getState(), data as ProgressRow));
    await pushNow();
  } catch {
    /* 실패해도 학습은 로컬로 계속 — 다음 저장 push가 재시도 역할 */
  }
}

/** 앱 시작 시 1회 호출(main.ts). 환경변수가 없으면 아무것도 하지 않는다. */
export function initSync(): void {
  if (!isAuthConfigured()) return;
  setOnStateSaved(() => {
    if (activeUserId) {
      dirty = true;
      schedulePush();
    }
  });
  onAuthChange((u) => {
    if (u && u.id !== activeUserId) {
      activeUserId = u.id;
      void fullSync(u.id);
    } else if (!u) {
      activeUserId = null;
      window.clearTimeout(pushTimer);
    }
  });
  // 화면을 닫는 순간 미반영분을 최선 노력으로 밀어올린다(실패해도 다음 세션 push가 수습).
  window.addEventListener("pagehide", () => {
    if (activeUserId && dirty) void pushNow();
  });
}
