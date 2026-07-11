// 결제 — 지금은 스텁. 웹 정식 출시 때 토스페이먼츠(PG) 연동으로 교체 예정:
// 주문 생성(가격은 서버가 결정) → 결제위젯 → 승인 → 과목별 이용권(entitlement) 지급 순서.
// Capacitor 앱 포장 시에는 이 파일만 IAP 브리지(cordova-plugin-purchase/RevenueCat)로 바꾼다.
// 페이월 UI는 아래 카탈로그·요금표만 읽으므로 결제 수단이 바뀌어도 그대로 동작한다.
import { setPremium } from "./store";

/** 판매 과목 카탈로그 — 이용권 단위 = 학년×과목. icon은 core/icons.ts 키. */
export type SellableSubject = { id: string; name: string; icon: string };
export const SELLABLE_SUBJECTS: SellableSubject[] = [
  { id: "sci-g1", name: "중1 과학", icon: "flask" },
  { id: "math-g1", name: "중1 수학", icon: "mathop" },
  { id: "sci-g2", name: "중2 과학", icon: "flask" },
  { id: "math-g2", name: "중2 수학", icon: "mathop" },
];

/** 과목 수별 정가(부가세 포함 표시가) — 2026-07-12 확정: 14,900/24,900/33,900원.
 *  얼리버드 할인은 아직 미적용(도입 시 여기에 salePrice를 더해 페이월이 함께 그리게 한다). */
export const PLAN_TIERS = [
  { n: 1, price: 14900 },
  { n: 2, price: 24900 },
  { n: 3, price: 33900 },
] as const;

/** 한 번에 담을 수 있는 최대 과목 수(전과목 이용권은 추후 별도 상품). */
export const MAX_PLAN = PLAN_TIERS.length;

export const tierOf = (n: number) => PLAN_TIERS[Math.min(Math.max(n, 1), MAX_PLAN) - 1];
/** 낱개(1과목 정가 × n) 대비 절약액. */
export const saveOf = (n: number) => tierOf(1).price * n - tierOf(n).price;
export const won = (v: number) => v.toLocaleString("ko-KR") + "원";

export type PurchaseResult = "ok" | "unavailable";

const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

/** 프리미엄 이용권 구매. DEV에서는 즉시 해금(개발·QA용).
 *  selection은 토스 PG 주문 생성에 쓸 예약 파라미터 — 스텁은 무시한다. */
export async function buyPremium(_selection?: { subjectIds: string[] }): Promise<PurchaseResult> {
  if (isDev) {
    setPremium(true);
    return "ok";
  }
  // 웹 배포판: 정식 출시(결제 오픈) 전까지 실제 결제 경로 없음
  return "unavailable";
}

/** 기기 변경 등으로 구매 내역 복원. 스토어 연동 전까지는 DEV 전용. */
export async function restorePurchase(): Promise<PurchaseResult> {
  if (isDev) {
    setPremium(true);
    return "ok";
  }
  return "unavailable";
}
