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
  // 내비게이션 탭(탭바·지도 발바닥 노드) — 8ms는 실기기 모터의 체감 문턱 아래라 "진동 없음"으로
  // 느껴진다(2026-07-21 사용자 피드백). 약하지만 확실히 느껴지는 15ms.
  navTap: 15,
  // 잠긴 발바닥 노드 탭 — "안 돼요"가 손끝에서도 구분되게 살짝 더 강한 단발 버즈(사용자 승인).
  deny: 30,
  ctaUnlock: [10, 40, 14] as number[],
  correct: [12, 60, 16] as number[],
  wrong: 24,
  done: [12, 80, 12, 80, 20] as number[],
  cross: 14,
} as const;
