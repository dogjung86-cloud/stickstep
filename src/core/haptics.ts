// 햅틱 — 프로토타입의 터치감 수치를 그대로 계승한다.
// 탭 8, CTA 해제 [10,40,14], 정답 [12,60,16], 오답 24, 완료 [12,80,12,80,20].
export function haptic(pattern: number | number[] = 8): void {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* 지원하지 않는 기기는 조용히 무시 */
  }
}

export const HAPTIC = {
  tap: 8,
  select: 8,
  ctaUnlock: [10, 40, 14] as number[],
  correct: [12, 60, 16] as number[],
  wrong: 24,
  done: [12, 80, 12, 80, 20] as number[],
  cross: 14,
} as const;
