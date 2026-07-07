// 결제 — 지금은 스텁. Capacitor로 앱 포장 시 이 파일만 IAP 브리지로 교체한다.
// (cordova-plugin-purchase 또는 RevenueCat: buyPremium()에서 스토어 결제창 →
//  영수증 검증 → setPremium(true) 순서만 지키면 페이월 UI는 그대로 동작한다.)
import { setPremium } from "./store";

/** 스토어 등록가와 맞출 것 — 페이월 가격 표기의 단일 출처. */
export const PREMIUM_PRICE_LABEL = "₩14,900";

export type PurchaseResult = "ok" | "unavailable";

const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

/** 프리미엄 평생 이용권 구매. DEV에서는 즉시 해금(개발·QA용). */
export async function buyPremium(): Promise<PurchaseResult> {
  if (isDev) {
    setPremium(true);
    return "ok";
  }
  // 웹 배포판: 스토어 출시 전까지 실제 결제 경로 없음
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
