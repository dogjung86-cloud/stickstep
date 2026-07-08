// 수학 저작 DSL — 수학 스텝 팩토리. 과학 dsl.ts와 분리해 병합 충돌을 없앤다.
// 수식 표기는 ui/mathKit의 mfmt 마이크로 마크업: "{a/b}" 분수 · "^n" 지수 ·
// "(+3)"/"(-5)" 부호 수(부호만 색) · × ÷ | | 는 문자 그대로.
import type { Step } from "../../lessons/types";
import type { CurioOpt } from "../dsl";

/** 스틱맨 미리보기 퍼즐(수학판 훅) — hookAsk 규칙(choices[0]=정답, good≠bad)은 장면 렌더러가 지킨다. */
export const mathHook = (o: {
  title: string;
  lead?: string;
  narrator: string;
  done?: string;
  scene:
    | "cicada" // L1 매미 13·17년 주기
    | "paperfold" // L2 종이 접기 두께
    | "lockcode" // L3 소수 자물쇠(암호)
    | "tilefloor" // L4 정사각 타일 깔기
    | "buslight" // L5 두 버스 동시 출발
    | "freezer" // L6 냉동고 영하 온도
    | "gpsdist" // L7 거리만 알 때 방향은?
    | "golfscore" // L8 골프 스코어 −의 세계
    | "daytemp" // L9 일교차 3−(−7)
    | "rewind" // L10 거꾸로 재생×뒤로 걷기
    | "mentalmath" // L11 암산왕 98×5
    | "snsdebate"; // L12 6÷2(1+2) 논쟁
  choices?: string[];
  cta?: string;
}): Step => ({ type: "mathHook", ...o });

/** 드릴 문항 — q는 mfmt 마크업, 답은 kind별(int: 정수, frac: "n/d" 기약, dec: 소수). */
export interface DrillItem {
  q: string;
  a: number | string;
  kind?: "int" | "frac" | "dec";
  /** 오답 시 한 줄 교정(mfmt 허용) — 오개념을 짚는다. */
  why?: string;
  /** 오답 시 수직선 미니 재생(정수 덧셈·뺄셈 전용): from에서 move만큼 점프. */
  strip?: { from: number; move: number };
}

/** 계산 스프린트 — 넘패드 연속 풀이. recordQuiz는 "첫 시도 정답률 ≥ passRatio" 1회. */
export const mathDrill = (o: {
  title: string;
  lead?: string;
  items: DrillItem[];
  passRatio?: number; // 기본 0.7
  cta?: string;
}): Step => ({ type: "mathDrill", ...o });

/** 에라토스테네스의 체 — 1~max 격자에서 배수를 쓸어 소수만 남긴다. */
export const sieveLab = (o: { title: string; lead?: string; max?: number; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sieveLab", ...o });

/** 거듭제곱 칩 쌓기 — 같은 수 칩을 겹쳐 2×2×2 → 2^3. */
export const powBuild = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "powBuild", ...o });

/** 소인수분해 인수 트리 — 합성수를 탭해 가르고, 어떤 길이든 결과가 같음을 본다. */
export const factorTree = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "factorTree", ...o });

/** 소인수 벤 다이어그램 — gcd: 공통 소인수를 교집합으로 모으기, lcm: 울타리 전체 곱하기. */
export const vennFactor = (o: {
  title: string;
  lead?: string;
  mode: "gcd" | "lcm";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "vennFactor", ...o });

/** 별그리기 — 원 위 n점을 k칸씩 잇기. 한붓 성공 조건이 서로소임을 발견. */
export const starDraw = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "starDraw", ...o });

/** 수직선 — place: 수 카드를 자리에 놓기, abs: 원점 거리 재기·절댓값 쌍 찾기. */
export const numline = (o: {
  title: string;
  lead?: string;
  mode: "place" | "abs";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "numline", ...o });

/** 수직선 산책 — 도착점을 먼저 예측(탭)하고 스틱맨이 걸어가 확인하는 덧셈 랩. */
export const numWalk = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "numWalk", ...o });

/** 셈돌 랩 — add: (+)(−) 칩 상쇄로 덧셈, sub: 0쌍을 투입해 없는 칩을 빼는 뺄셈. */
export const counterLab = (o: {
  title: string;
  lead?: string;
  mode: "add" | "sub";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "counterLab", ...o });

/** 곱 패턴 랩 — 곱하는 수를 1씩 줄이며 패턴으로 (−)×(−)=+를 스스로 발견. */
export const patternLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "patternLab", ...o });

/** 분배법칙 넓이 랩 — 직사각형을 쪼개도 넓이 합이 같음 → 98×5 암산 지름길. */
export const areaSplit = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "areaSplit", ...o });
