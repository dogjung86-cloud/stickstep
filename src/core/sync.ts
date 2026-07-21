// 동기화 — 로그인 사용자의 학습 기록을 Supabase progress 테이블(사용자당 1행)과 맞춘다.
// 병합 원칙: "학습은 절대 잃지 않는다" — 레슨·시험·게임은 항목별 max/OR,
// 스틱(totalXp)은 큰 쪽, 스트릭은 더 최근에 공부한 기기 기준.
// reviewMode·viewGrade·viewSubject 같은 기기 설정은 동기화하지 않는다.
// 흐름: 로그인 직후 pull→병합→push, 이후 저장(save)마다 2.5초 디바운스 push.
import type { AppState, ExamRecord, LessonProgress, WrongNote } from "./store";
import { applySyncedState, getState, setOnStateSaved } from "./store";
import { getSupabase, isAuthConfigured, onAuthChange } from "./auth";

interface ProgressRow {
  user_id: string;
  onboarded: boolean;
  grade: string | null;
  goal_min: number;
  total_step: number; // 앱의 totalXp — 화폐 이름 '스텝'(사용자 확정)을 컬럼명에 반영
  life_step: number; // 앱의 lifeXp — 누적 획득 스텝(장화 레벨·랭킹 기준, 소비로 줄지 않음)
  avatar_id: number | null; // 스틱맨 아바타 선택(계정 정체성이라 동기화)
  // 주의: store.avatarCustom(파츠 조합)·avatarPreset(캐릭터 프리셋)은 아직 동기화하지
  // 않는다 — progress에 없는 컬럼을 upsert 페이로드에 넣으면 PostgREST가 400을 반환해
  // push 전체가 죽는다. 활성화 절차: ① supabase/schema.sql에 avatar_custom jsonb·
  // avatar_preset int 추가 후 운영 DB에 재실행
  // ② 이 인터페이스·rowOf·mergeIntoLocal(로컬 우선 — avatar_id와 같은 규칙)에 필드 추가.
  streak: number;
  last_study_day: string | null;
  premium: boolean;
  lessons: Record<string, LessonProgress>;
  exams: Record<string, ExamRecord>;
  minigame: Record<string, number>;
  wrong_notes: Record<string, WrongNote>;
}

function rowOf(s: Readonly<AppState>, userId: string): ProgressRow {
  return {
    user_id: userId,
    onboarded: s.onboarded,
    grade: s.grade,
    goal_min: s.goalMin,
    total_step: s.totalXp,
    life_step: s.lifeXp,
    avatar_id: s.avatarId,
    streak: s.streak,
    last_study_day: s.lastStudyDay,
    premium: s.premium,
    lessons: s.lessons,
    exams: s.exams,
    minigame: s.minigame,
    wrong_notes: s.wrongNotes ?? {},
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

function mergeWrongNotes(a: Record<string, WrongNote>, b: Record<string, WrongNote>): Record<string, WrongNote> {
  // 같은 키는 더 최근 기록이 상태(극복 여부·스냅샷)를 대표하고, 틀린 횟수는 큰 쪽을 남긴다.
  const out: Record<string, WrongNote> = { ...a };
  for (const [k, nb] of Object.entries(b ?? {})) {
    const na = out[k];
    if (!na) {
      out[k] = nb;
      continue;
    }
    const newer = nb.ts >= na.ts ? nb : na;
    out[k] = { ...newer, wrongCount: Math.max(na.wrongCount, nb.wrongCount) };
  }
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
    totalXp: Math.max(local.totalXp, row.total_step),
    // 구버전 행에는 life_step이 없을 수 있다 — total_step이 하한.
    lifeXp: Math.max(local.lifeXp, row.life_step ?? row.total_step ?? 0),
    avatarId: local.avatarId ?? row.avatar_id ?? null,
    streak,
    lastStudyDay,
    lessons: mergeLessons(local.lessons, row.lessons),
    exams: mergeExams(local.exams ?? {}, row.exams),
    minigame: mergeMinigame(local.minigame ?? {}, row.minigame),
    wrongNotes: mergeWrongNotes(local.wrongNotes ?? {}, row.wrong_notes ?? {}),
  };
}

/**
 * 계정 전환 교체 패치(2026-07-21 사용자 버그 리포트 — A 로그아웃 후 같은 기기에서 B 로그인 시
 * A의 닉네임이 B 마이 탭에 보이고 profiles에도 밀려 올라감): 이 기기 데이터의 주인(syncedUserId)이
 * 새 로그인 계정과 다르면 "학습은 잃지 않는다" 병합을 적용하지 않는다 — 그 데이터는 게스트가 아니라
 * 이전 계정의 것이라, 병합하면 기록·닉네임·아바타가 계정 사이를 넘나든다(개인정보 누출).
 * 계정 데이터는 전부 새 계정의 서버 값으로 교체하고, 서버 행이 없으면(신규 계정) 초기값에서 시작.
 * 기기 설정(onboarded·viewGrade·viewSubject·reviewMode·desktopMode)은 계정 정보가 아니라 유지.
 * export는 QA 검증용(qa에서 vite 모듈 import로 순수 함수 검사 — data-oi와 같은 dev 관행).
 */
export function accountSwitchPatch(local: Readonly<AppState>, row: ProgressRow | null): Partial<AppState> {
  return {
    grade: row?.grade ?? local.grade, // 신규 계정은 기기 온보딩 학년으로 시작(직후 push가 서버에 기록)
    goalMin: row ? row.goal_min : local.goalMin,
    premium: row?.premium ?? false,
    premiumSubjectIds: [], // 결제 백엔드 연동 전 로컬 표시값 — 다른 계정으로 넘기지 않는다
    totalXp: row?.total_step ?? 0,
    lifeXp: row ? Math.max(row.life_step ?? 0, row.total_step ?? 0) : 0,
    avatarId: row?.avatar_id ?? null,
    streak: row?.streak ?? 0,
    lastStudyDay: row?.last_study_day ?? null,
    lessons: row?.lessons ?? {},
    exams: row?.exams ?? {},
    minigame: row?.minigame ?? {},
    wrongNotes: row?.wrong_notes ?? {},
    // 서버 미동기 정체성·추적 필드 — 이전 계정 흔적이 남지 않게 리셋.
    // 닉네임은 아래 fullSync 닉네임 단계가 새 계정 profiles 값을 채택한다.
    nickname: null,
    avatarCustom: null,
    avatarPreset: null,
    lastUnits: {},
    recentUnitId: null,
  };
}

let activeUserId: string | null = null;
let pushTimer = 0;
let pushing = false;
let dirty = false;
let syncing = false; // fullSync 풀 구간 가드 — 디바운스 push가 이전 계정 로컬을 새 계정 행에 밀어올리는 경합 차단

function schedulePush(): void {
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => void pushNow(), 2500);
}

async function pushNow(): Promise<void> {
  if (!activeUserId || pushing || syncing) return;
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

/**
 * 로그인 직후 1회. 기기 데이터의 주인(syncedUserId)에 따라 갈린다:
 * 같은 계정·첫 로그인(주인 없음) = 병합("학습은 잃지 않는다" — 게스트 진행 흡수),
 * 다른 계정 = 교체(accountSwitchPatch — 이전 계정 데이터를 병합·푸시하면 계정 간 누출).
 */
async function fullSync(userId: string): Promise<void> {
  syncing = true;
  window.clearTimeout(pushTimer); // 로그인 전 저장이 걸어 둔 디바운스 push 취소(이전 계정 데이터 보호)
  try {
    const sb = await getSupabase();
    const prevOwner = getState().syncedUserId ?? null;
    const switching = prevOwner !== null && prevOwner !== userId;
    const { data } = await sb.from("progress").select("*").eq("user_id", userId).maybeSingle();
    const row = (data as ProgressRow | null) ?? null;
    if (switching) applySyncedState({ ...accountSwitchPatch(getState(), row), syncedUserId: userId });
    else if (row) applySyncedState({ ...mergeIntoLocal(getState(), row), syncedUserId: userId });
    else applySyncedState({ syncedUserId: userId }); // 신규 계정 첫 기기 — 게스트 데이터가 곧 시작 기록
    syncing = false;
    await pushNow();
    // 닉네임(profiles.nickname — progress와 별개 테이블이라 rowOf에 안 싣는다): 같은 계정·첫 로그인만
    // 기기 값 우선("학습은 잃지 않는다"의 닉네임판). 계정 전환은 교체 패치가 로컬 닉네임을 이미 비워
    // 항상 서버 값 채택 경로로 들어간다 — 이전 계정 닉네임을 새 계정 프로필에 밀어쓰지 않는다.
    const { data: prof } = await sb.from("profiles").select("nickname").eq("id", userId).maybeSingle();
    const localNick = getState().nickname;
    const serverNick = (prof?.nickname as string | null | undefined) ?? null;
    if (localNick && localNick !== serverNick) await sb.from("profiles").update({ nickname: localNick }).eq("id", userId);
    else if (!localNick && serverNick) applySyncedState({ nickname: serverNick });
  } catch {
    /* 실패해도 학습은 로컬로 계속 — 다음 저장 push가 재시도 역할 */
  } finally {
    syncing = false;
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
