// 진행 상태 — localStorage에 저장. 스트릭·XP·레슨 완료·온보딩 결과.

export interface LessonProgress {
  done: boolean;
  acc: number | null; // 최고 정확도(%)
  bestXp: number;
}

export interface AppState {
  version: number;
  onboarded: boolean;
  grade: string | null;
  goalMin: number;
  streak: number;
  lastStudyDay: string | null; // 'YYYY-MM-DD'
  totalXp: number;
  lessons: Record<string, LessonProgress>;
  minigame: Record<string, number>; // gameId -> 최고 점수
}

const KEY = "science-app.v1";

const DEFAULT_STATE: AppState = {
  version: 1,
  onboarded: false,
  grade: null,
  goalMin: 10,
  streak: 0,
  lastStudyDay: null,
  totalXp: 0,
  lessons: {},
  minigame: {},
};

function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

let state: AppState = load();

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) } as AppState;
  } catch {
    /* 손상된 저장소는 무시하고 기본값 */
  }
  return structuredClone(DEFAULT_STATE);
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 용량 초과 등은 무시 */
  }
}

export function getState(): Readonly<AppState> {
  return state;
}

export function setOnboarding(grade: string, goalMin: number): void {
  state.onboarded = true;
  state.grade = grade;
  state.goalMin = goalMin;
  save();
}

export function lessonOf(id: string): LessonProgress {
  return state.lessons[id] ?? { done: false, acc: null, bestXp: 0 };
}

export function isDone(id: string): boolean {
  return !!state.lessons[id]?.done;
}

/** 오늘/어제 학습했으면 유지, 아니면 끊긴 것으로 0을 반환한다. */
export function currentStreak(): number {
  if (!state.lastStudyDay) return 0;
  const gap = daysBetween(state.lastStudyDay, dayKey());
  return gap <= 1 ? state.streak : 0;
}

/** 레슨 완료 처리. 스트릭·XP 갱신 후 획득 XP를 반환. */
export function completeLesson(id: string, acc: number, xp: number): number {
  const prev = lessonOf(id);
  const firstClear = !prev.done;
  state.lessons[id] = {
    done: true,
    acc: prev.acc == null ? acc : Math.max(prev.acc, acc),
    bestXp: Math.max(prev.bestXp, xp),
  };

  const today = dayKey();
  if (state.lastStudyDay !== today) {
    const gap = state.lastStudyDay ? daysBetween(state.lastStudyDay, today) : 999;
    state.streak = gap === 1 ? state.streak + 1 : 1;
    state.lastStudyDay = today;
  } else if (state.streak === 0) {
    state.streak = 1;
    state.lastStudyDay = today;
  }

  const gained = firstClear ? xp : Math.round(xp * 0.3); // 복습은 30%
  state.totalXp += gained;
  save();
  return gained;
}

/** XP를 소모(입장료 등). 부족하면 false를 반환하고 차감하지 않는다. */
export function spendXp(n: number): boolean {
  if (state.totalXp < n) return false;
  state.totalXp -= n;
  save();
  return true;
}

/** XP 지급(미니게임 보상 등). */
export function awardXp(n: number): void {
  state.totalXp += Math.max(0, Math.round(n));
  save();
}

export function bestScore(gameId: string): number {
  return state.minigame?.[gameId] ?? 0;
}

/** 점수 제출. 최고 기록 갱신 여부를 반환한다. */
export function submitScore(gameId: string, score: number): boolean {
  if (!state.minigame) state.minigame = {};
  const prev = state.minigame[gameId] ?? 0;
  if (score > prev) {
    state.minigame[gameId] = score;
    save();
    return true;
  }
  return false;
}

export function resetAll(): void {
  state = structuredClone(DEFAULT_STATE);
  save();
}
