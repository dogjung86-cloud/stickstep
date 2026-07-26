// 결제 — 지금은 스텁. 웹 정식 출시 때 토스페이먼츠(PG) 연동으로 교체 예정:
// 주문 생성(가격은 서버가 결정) → 결제위젯 → 승인 → 과목별 이용권(entitlement) 지급 순서.
// Capacitor 앱 포장 시에는 이 파일만 IAP 브리지(cordova-plugin-purchase/RevenueCat)로 바꾼다.
// 페이월 UI는 아래 카탈로그·요금표만 읽으므로 결제 수단이 바뀌어도 그대로 동작한다.
import { getState, isPremium, setPremium } from "./store";

/** 판매 과목 카탈로그 — 이용권 단위 = 학년×과목. icon은 core/icons.ts 키.
 *  중1 사회·역사는 콘텐츠가 있어도 판매 목록에서 일단 제외(2026-07-20 사용자 지시 — 추후 재추가). */
export type SellableSubject = { id: string; name: string; icon: string };
export const SELLABLE_SUBJECTS: SellableSubject[] = [
  { id: "sci-g1", name: "중1 과학", icon: "flask" },
  { id: "math-g1", name: "중1 수학", icon: "mathop" },
  { id: "sci-g2", name: "중2 과학", icon: "flask" },
  { id: "math-g2", name: "중2 수학", icon: "mathop" },
];

/** 과목 수별 정가(부가세 포함 표시가) — 2026-07-12 확정: 14,900/24,900/33,900원.
 *  선택 개수 제한 없음 + 할인 사다리는 3과목에서 끝(2026-07-15 사용자 확정):
 *  4과목째부터는 과목당 가격이 3과목 수준(11,300원)에 고정 — n과목 = 11,300 × n원. */
export const PLAN_TIERS = [
  { n: 1, price: 14900 },
  { n: 2, price: 24900 },
  { n: 3, price: 33900 },
] as const;

/** 이용 방법(플랜) — 가격 사다리 v4(2026-07-27 확정).
 *  own = "소장"(기간 없음). '평생' 워딩은 전면 금지 — 서비스 무기한 보장을 약속하는 말이라 부채가 되고
 *  소비자도 반신반의한다. 약관에는 "서비스 제공 기간 내 기간 제한 없음"으로 명문화한다(결제 오픈 때).
 *  pass30 = 30일 시험 대비 패스(단건 결제·자동 연장 없음), 과목당 균일가·묶음 할인 없음 —
 *  "패스 세 번이면 소장 가격"(4,900×3≈14,900)이 업셀 사다리다.
 *  월 정기결제(구독)는 도입하지 않는다(2026-07-27 사용자 확정 — 시험 달만 결제하는 체리피킹 역선택
 *  + 빌링키 심사·해지 CS 비용이 2,750원 매출로 회수 불가. 재제안 금지). */
export type PlanId = "own" | "pass30";
export const PASS30 = { price: 4900, days: 30 } as const;

/** 얼리버드(출시 기념 — 결제 오픈 후 약 2달): 켜져 있는 동안 소장 = 과목당 9,900원 균일가
 *  (묶음 사다리 4과목째 11,300원보다도 낮아 전 구간에서 항상 유리 — 정가 취소선의 근거),
 *  30일 패스는 페이월에서 숨긴다(런칭 기간 SKU 단일화 — 2026-07-27 사용자 확정).
 *  **기본값은 꺼짐**(2026-07-27 사용자 확정): 결제가 아직 스텁이라 지금 켜 둘 이유가 없고,
 *  켜 두면 로컬 검수에서 30일 패스·플랜 카드를 아예 못 본다. **출시(결제 오픈) 직전에 true로**
 *  — 그 한 줄이 얼리버드 시작이고, 2달 뒤 false가 정가 복귀(30일 패스가 함께 열린다). */
export const EARLY_BIRD = { active: false, perSubject: 9900 } as const;

/** 얼리버드 활성 여부. DEV에선 sessionStorage "ss.eb"("1"/"0")로 강제 가능(눈검수·QA용 — srxSeed 문법). */
export function earlyBirdActive(): boolean {
  if (isDev) {
    const o = sessionStorage.getItem("ss.eb");
    if (o === "1") return true;
    if (o === "0") return false;
  }
  return EARLY_BIRD.active;
}

/** 플랜별 n과목 합계 판매가(얼리버드 반영). 정가 취소선·할인액 비교는 priceOf(n)로 계산한다. */
export function priceOfPlan(plan: PlanId, n: number): number {
  const k = Math.max(n, 1);
  if (plan === "pass30") return PASS30.price * k;
  return earlyBirdActive() ? EARLY_BIRD.perSubject * k : priceOf(k);
}

/** 3과목 이후 과목당 고정 단가(= 3과목 정가 ÷ 3 = 11,300원 — 더 내려가지 않는다). */
export const PER_SUBJECT_FLOOR = PLAN_TIERS[2].price / 3;

/** n과목 합계 정가. */
export function priceOf(n: number): number {
  const k = Math.max(n, 1);
  return k <= PLAN_TIERS.length ? PLAN_TIERS[k - 1].price : Math.round(PER_SUBJECT_FLOOR * k);
}

/** 낱개(1과목 정가 × n) 대비 절약액. */
export const saveOf = (n: number) => PLAN_TIERS[0].price * Math.max(n, 1) - priceOf(n);
export const won = (v: number) => v.toLocaleString("ko-KR") + "원";

/** 이미 보유한 학년×과목 이용권. 구버전 premium=true와 운영 계정은 전 과목 권한이므로
 *  선택 목록이 없을 때 현재 판매 카탈로그 전체를 반환한다. */
export function ownedPremiumSubjectIds(): string[] {
  if (!isPremium()) return [];
  const valid = new Set(SELLABLE_SUBJECTS.map((s) => s.id));
  const saved = (getState().premiumSubjectIds ?? []).filter((id) => valid.has(id));
  return saved.length > 0 ? saved : [...valid];
}

export type PurchaseResult = "ok" | "unavailable";

const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

/** 프리미엄 구매(소장/30일 패스). DEV에서는 즉시 해금(개발·QA용).
 *  selection은 토스 PG 주문 생성에 쓸 예약 파라미터이며, 지금은 마이 탭 표시용으로 기기에 함께 남긴다.
 *  30일 패스의 만료 집행은 서버 이용권(토스 PG 연동·entitlement 테이블) 때 구현한다 —
 *  스텁·DEV 해금은 기간 개념 없이 전 기능을 연다(store에 만료 필드를 선반영하지 않는다). */
export async function buyPremium(selection?: { subjectIds: string[]; plan?: PlanId }): Promise<PurchaseResult> {
  if (isDev) {
    setPremium(true, selection?.subjectIds);
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
