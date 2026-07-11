// 진행 상태 — localStorage에 저장. 스트릭·XP·레슨 완료·온보딩 결과.

export interface LessonProgress {
  done: boolean;
  acc: number | null; // 최고 정확도(%)
  bestXp: number;
}

/** 단원 종합 평가 기록 — 응시(제출 완료 기준)·최고 점수·정복 인증. */
export interface ExamRecord {
  attempts: number; // 제출 완료 횟수 — 1회 무료, 재응시는 프리미엄
  best: number; // 최고 점수(100점 만점)
  conquered: boolean; // 단원 100% 정복 상태로 응시해 얻은 인증 배지
}

/** 오답노트 한 항목 — 채점 순간의 문항 스냅샷(콘텐츠가 수정·삭제돼도 노트는 스스로 렌더 가능). */
export interface WrongNote {
  key: string; // "l:<lessonId>:<q해시>"(레슨 퀴즈) | "e:<examId>:<문항id>"(단원 평가)
  kind: "lesson" | "exam";
  srcId: string; // lessonId | examId
  lessonId: string; // "레슨 복습하기" 바로가기의 근거(시험 문항도 lessonId를 가짐)
  type: "mcq" | "ox" | "multi" | "num" | "word";
  q: string; // 문항 프롬프트(HTML 허용)
  bogi?: string[]; // ㄱㄴㄷ 보기 상자(합답형)
  opts?: string[]; // 보기 텍스트(mcq/multi, ox는 ["O","X"])
  answer: number[] | string; // 정답 — 저작 인덱스 배열(mcq/ox/multi) 또는 정규화 문자열(num/word)
  explain?: string; // 해설 HTML(리뷰용)
  core?: string; // 핵심 한 줄(시험 문항)
  hasFigure: boolean; // 그림 문항 — 스냅샷에 그림은 없으니 원문 복습을 안내
  wrongCount: number;
  overcome: boolean; // 다시 풀어 맞힘(또는 스스로 확인)
  ts: number; // 마지막 갱신 시각
}

export interface AppState {
  version: number;
  onboarded: boolean;
  grade: string | null;
  viewGrade: string | null; // 홈이 보여주는 학년 커리큘럼("g1"|"g2") — 온보딩 학년과 별개로 전환 가능
  viewSubject: string | null; // 홈이 보여주는 과목("sci"|"math") — 과목 허브에서 전환·저장
  premium: boolean; // 프리미엄 구매 여부 — premium 레슨 잠금 해제
  reviewMode: boolean; // 검토 모드(브랜드 7연타) — 순차·프리미엄 잠금 전부 해제(콘텐츠 검수용)
  goalMin: number;
  streak: number;
  lastStudyDay: string | null; // 'YYYY-MM-DD'
  totalXp: number;
  lessons: Record<string, LessonProgress>;
  minigame: Record<string, number>; // gameId -> 최고 점수
  exams: Record<string, ExamRecord>; // examId -> 단원 종합 평가 기록
  wrongNotes: Record<string, WrongNote>; // key -> 오답노트(마이페이지에서 복습)
}

const KEY = "science-app.v1";

const DEFAULT_STATE: AppState = {
  version: 1,
  onboarded: false,
  grade: null,
  viewGrade: null,
  viewSubject: null,
  premium: false,
  reviewMode: false,
  goalMin: 10,
  streak: 0,
  lastStudyDay: null,
  totalXp: 0,
  lessons: {},
  minigame: {},
  exams: {},
  wrongNotes: {},
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
  onStateSaved?.(); // 동기화 훅(core/sync.ts) — 파일 끝 "동기화 훅" 섹션 참조
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

/** 홈 지도가 보여줄 학년 — 직접 전환한 적이 없으면 온보딩 학년에서 유도한다. */
export function getViewGrade(): "g1" | "g2" {
  if (state.viewGrade === "g1" || state.viewGrade === "g2") return state.viewGrade;
  return state.grade === "g2" || state.grade === "g3" ? "g2" : "g1";
}

export function setViewGrade(g: "g1" | "g2"): void {
  state.viewGrade = g;
  save();
}

/** 홈 지도가 보여줄 과목 — 전환한 적이 없으면 과학(기존 사용자 그대로). */
export function getViewSubject(): "sci" | "math" {
  return state.viewSubject === "math" ? "math" : "sci";
}

export function setViewSubject(s: "sci" | "math"): void {
  state.viewSubject = s;
  save();
}

export function isPremium(): boolean {
  return state.premium;
}

export function isReviewMode(): boolean {
  return state.reviewMode;
}

/** 검토 모드 토글(홈 브랜드 7연타). 켜면 모든 잠금이 풀린다 — 콘텐츠 검수용. */
export function toggleReviewMode(): boolean {
  state.reviewMode = !state.reviewMode;
  save();
  return state.reviewMode;
}

/** 결제 성공/복원 시 core/purchase.ts가 호출한다. */
export function setPremium(v: boolean): void {
  state.premium = v;
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

/** 오늘을 학습일로 기록(스트릭 갱신) — 레슨 완료·시험 제출 공용. */
function touchStudyDay(): void {
  const today = dayKey();
  if (state.lastStudyDay !== today) {
    const gap = state.lastStudyDay ? daysBetween(state.lastStudyDay, today) : 999;
    state.streak = gap === 1 ? state.streak + 1 : 1;
    state.lastStudyDay = today;
  } else if (state.streak === 0) {
    state.streak = 1;
    state.lastStudyDay = today;
  }
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

  touchStudyDay();

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

// ── 단원 종합 평가 ──────────────────────────────────────────
export function examRecordOf(examId: string): ExamRecord {
  return state.exams?.[examId] ?? { attempts: 0, best: 0, conquered: false };
}

/** 재응시 잠금 — 단원당 1회 무료, 두 번째부터 프리미엄(검토 모드는 해제). */
export function isExamRetakeLocked(examId: string): boolean {
  return examRecordOf(examId).attempts >= 1 && !state.premium && !state.reviewMode;
}

/** 시험 제출 처리 — 응시 횟수·최고 점수·정복 인증 기록.
 *  XP는 스타 게임 문법: 신기록 갱신분(새 최고점 − 이전 최고점)만 지급해 파밍을 막는다. */
export function recordExamResult(
  examId: string,
  score: number,
  conqueredNow: boolean,
): { gained: number; newBest: boolean } {
  if (!state.exams) state.exams = {};
  const prev = examRecordOf(examId);
  const newBest = score > prev.best;
  const gained = newBest ? score - prev.best : 0;
  state.exams[examId] = {
    attempts: prev.attempts + 1,
    best: Math.max(prev.best, score),
    conquered: prev.conquered || conqueredNow,
  };
  touchStudyDay();
  state.totalXp += gained;
  save();
  return { gained, newBest };
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

// ── 오답노트 ────────────────────────────────────────────────
const WRONG_NOTE_CAP = 200; // 저장 상한 — 넘치면 극복한 것 → 오래된 것 순으로 정리

export function wrongNoteList(): WrongNote[] {
  return Object.values(state.wrongNotes ?? {});
}

export function wrongNoteCount(): { open: number; overcome: number } {
  let open = 0;
  let overcome = 0;
  for (const n of wrongNoteList()) {
    if (n.overcome) overcome += 1;
    else open += 1;
  }
  return { open, overcome };
}

/** 오답 기록(채점 지점에서 호출) — 같은 문항을 또 틀리면 횟수만 쌓이고 극복이 풀린다. */
export function recordWrongNote(data: Omit<WrongNote, "wrongCount" | "overcome" | "ts">): void {
  if (!state.wrongNotes) state.wrongNotes = {};
  const prev = state.wrongNotes[data.key];
  state.wrongNotes[data.key] = {
    ...data,
    wrongCount: (prev?.wrongCount ?? 0) + 1,
    overcome: false,
    ts: Date.now(),
  };
  capWrongNotes();
  save();
}

/** 같은 문항을 다시 맞혔을 때 — 노트가 있으면 극복 처리(없으면 조용히 무시). */
export function resolveWrongNote(key: string): boolean {
  const n = state.wrongNotes?.[key];
  if (!n || n.overcome) return false;
  n.overcome = true;
  n.ts = Date.now();
  save();
  return true;
}

function capWrongNotes(): void {
  const keys = Object.keys(state.wrongNotes);
  if (keys.length <= WRONG_NOTE_CAP) return;
  const sorted = wrongNoteList().sort((a, b) => {
    if (a.overcome !== b.overcome) return a.overcome ? -1 : 1; // 극복한 것부터 정리
    return a.ts - b.ts; // 그다음 오래된 것부터
  });
  for (const n of sorted.slice(0, keys.length - WRONG_NOTE_CAP)) delete state.wrongNotes[n.key];
}

// ── 동기화 훅(core/sync.ts 전용) ─────────────────────────────
// store는 sync를 모른다(의존 방향: sync → store 단방향). save마다 알림만 쏜다.
let onStateSaved: (() => void) | null = null;

export function setOnStateSaved(fn: (() => void) | null): void {
  onStateSaved = fn;
}

/** 서버와 병합된 상태를 반영(core/sync.ts 전용). reviewMode·viewGrade·viewSubject 같은
 *  기기 설정은 patch에 포함하지 않는 것이 규약 — 병합 규칙은 sync.ts가 소유한다. */
export function applySyncedState(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
  save();
}
