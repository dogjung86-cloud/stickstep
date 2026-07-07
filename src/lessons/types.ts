// 레슨/스텝 데이터 모델. "레슨은 코드가 아니라 데이터"의 핵심 계약.
// 스텝은 { type, ...props } 데이터. 렌더러(steps/*)가 type을 보고 그린다.

export interface Lesson {
  id: string;
  unitId: string;
  title: string; // 완료 화면 등에서 쓰는 짧은 제목
  subtitle?: string;
  label?: string; // 지도 노드 라벨(짧게)
  icon?: string; // 지도 노드 아이콘 이름
  minutes?: number;
  standard?: string; // 성취기준/출처 표기
  doneNote?: string; // 완료 화면 부제
  premium?: boolean; // 프리미엄 전용 — 구매 전에는 페이월로 안내
  steps: Step[];
}

export interface Step {
  type: string;
  [key: string]: unknown;
}

export type CtaVariant = "blue" | "good" | "bad";

/** 플레이어가 각 스텝에 넘겨주는 조종간. */
export interface StepAPI {
  lesson: Lesson;
  index: number;
  total: number;
  /** 하단 CTA 버튼 구성. */
  setCTA(
    label: string,
    opts?: { enabled?: boolean; variant?: CtaVariant; onClick?: () => void; pop?: boolean },
  ): void;
  /** 비활성 CTA를 pop+햅틱과 함께 켠다(랩 목표 달성 시). */
  enableCTA(label?: string): void;
  disableCTA(): void;
  /** 다음 스텝으로. */
  next(): void;
  /** 정오답 피드백 하단 시트. */
  openSheet(o: {
    good: boolean;
    title: string;
    html: string;
    onContinue?: () => void;
    continueLabel?: string;
  }): void;
  /** 퀴즈 채점 집계(완료 화면 정확도). */
  recordQuiz(correct: boolean): void;
  snack(msg: string): void;
}

export type StepCleanup = void | (() => void);
export type StepRenderer = (host: HTMLElement, step: Step, api: StepAPI) => StepCleanup;
