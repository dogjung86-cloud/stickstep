// 결제 — 토스페이먼츠 v2 결제창 실연동(2026-08-13, PG 심사 대비 테스트 키 가동).
// 흐름: 주문 생성(pay-order 엣지 함수 — 가격은 서버가 재계산) → 토스 결제창(리다이렉트) →
// successUrl 복귀 → 승인(pay-confirm 엣지 함수 — 토스 승인 API + 과목별 이용권 지급) →
// entitlements(서버 진실)를 store에 반영. 라이브 전환 = 키 2개 교체(절차는 app/PAYMENTS.md).
// Capacitor 앱 포장 시에는 이 파일만 IAP 브리지(cordova-plugin-purchase/RevenueCat)로 바꾼다.
// 페이월 UI는 아래 카탈로그·요금표만 읽으므로 결제 수단이 바뀌어도 그대로 동작한다.
import { applySyncedState, getState, isPremium, setPremium } from "./store";
import { currentUser, getSupabase, isAuthConfigured, onAuthChange } from "./auth";

/** 판매 과목 카탈로그 — 이용권 단위 = 학년×과목. icon은 core/icons.ts 키.
 *  중1 사회·역사는 콘텐츠가 있어도 판매 목록에서 일단 제외(2026-07-20 사용자 지시 — 추후 재추가).
 *  id·가격을 바꾸면 supabase/functions/pay-order(서버 가격표)도 함께 — qa/check-pay.mjs가 기계 검증. */
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
 *  "패스 세 번이면 소장 가격"(4,900×3≈14,900)이 업셀 사다리다. 만료 집행은 서버 이용권(entitlements
 *  expires_at)이 담당 — store에는 만료 필드를 두지 않는다(로그인 시 서버 진실로 교체 반영).
 *  월 정기결제(구독)는 도입하지 않는다(2026-07-27 사용자 확정 — 시험 달만 결제하는 체리피킹 역선택
 *  + 빌링키 심사·해지 CS 비용이 2,750원 매출로 회수 불가. 재제안 금지). */
export type PlanId = "own" | "pass30";
export const PASS30 = { price: 4900, days: 30 } as const;

/** 얼리버드(출시 기념 — 결제 오픈 후 약 2달): 켜져 있는 동안 소장 = 과목당 9,900원 균일가
 *  (묶음 사다리 4과목째 11,300원보다도 낮아 전 구간에서 항상 유리 — 정가 취소선의 근거),
 *  30일 패스는 페이월에서 숨긴다(런칭 기간 SKU 단일화 — 2026-07-27 사용자 확정).
 *  **기본값은 꺼짐**(2026-07-27 사용자 확정): 출시(결제 오픈) 직전에 true로 —
 *  그 한 줄이 얼리버드 시작이고, 2달 뒤 false가 정가 복귀(30일 패스가 함께 열린다).
 *  서버(pay-order)는 정가 사다리·얼리버드 두 가격을 모두 승인하므로 이 플래그만 켜면 된다. */
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

const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

// ---------- 토스페이먼츠 연동 환경 ----------
// 클라이언트 키는 공개 식별값(토스 문서 명시) — 기본값은 문서 공개 테스트 키라 심사·개발 중에도
// 결제창이 항상 뜬다. 라이브 전환 시 Vercel 환경변수 VITE_TOSS_CLIENT_KEY(live_ck_…)로 교체하고,
// 서버 시크릿(supabase secrets TOSS_SECRET_KEY)을 같은 상점의 live_sk_…로 함께 바꾼다(PAYMENTS.md).
const env = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
const cleanEnv = (v: unknown): string => (typeof v === "string" ? v.replace(/﻿/g, "").trim() : "");
const TOSS_CLIENT_KEY = cleanEnv(env.VITE_TOSS_CLIENT_KEY) || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const SUPABASE_URL = cleanEnv(env.VITE_SUPABASE_URL);
const base = cleanEnv(env.BASE_URL) || "/";

/** 테스트 결제 모드 여부 — 체크아웃 시트가 "테스트 결제" 배지를 띄우는 근거(라이브 키면 자동 소멸). */
export function isTossTestMode(): boolean {
  return !TOSS_CLIENT_KEY.startsWith("live_");
}

/** DEV 실플로우 강제(sessionStorage "ss.payreal"="1" — ss.eb 문법). 기본 DEV는 즉시 해금 스텁 유지(QA·e2e 계약). */
function devRealPay(): boolean {
  return isDev && sessionStorage.getItem("ss.payreal") === "1";
}

/** e2e 전용 가짜 로그인(sessionStorage "ss.payFakeUser"=uuid) — 결제 e2e가 엣지 함수를 page.route로
 *  스텁하고 전체 파이프라인을 실플레이하기 위한 장치. DEV에서만 읽는다. */
function fakeUserId(): string | null {
  return isDev ? sessionStorage.getItem("ss.payFakeUser") : null;
}

/** 구매 흐름에 로그인이 필요한 상태인지 — 체크아웃 시트가 CTA 라벨("로그인하고 결제 진행")을 바꾸는 근거. */
export function purchaseNeedsLogin(): boolean {
  if (isDev && !devRealPay()) return false; // DEV 스텁은 즉시 해금이라 로그인 불필요
  if (fakeUserId()) return false;
  return isAuthConfigured() && !currentUser();
}

// ---------- 토스 v2 SDK 로더(GIS 스크립트 로더 문법 — auth.ts와 동일 패턴) ----------
interface TossPayment {
  requestPayment(params: Record<string, unknown>): Promise<void>;
}
interface TossSdk {
  payment(opts: { customerKey: string }): TossPayment;
}
type TossFactory = (clientKey: string) => TossSdk;
declare global {
  interface Window {
    TossPayments?: TossFactory;
  }
}

let tossPromise: Promise<TossFactory | null> | null = null;
function loadTossSdk(): Promise<TossFactory | null> {
  if (!tossPromise) {
    tossPromise = new Promise((resolve) => {
      if (window.TossPayments) {
        resolve(window.TossPayments);
        return;
      }
      try {
        const s = document.createElement("script");
        s.src = "https://js.tosspayments.com/v2/standard";
        s.async = true;
        s.onload = (): void => resolve(window.TossPayments ?? null);
        s.onerror = (): void => resolve(null);
        document.head.appendChild(s);
        window.setTimeout(() => resolve(window.TossPayments ?? null), 10000); // 로드 안전망(중복 resolve 무해)
      } catch {
        resolve(null);
      }
    });
  }
  return tossPromise;
}

// ---------- 엣지 함수 호출 ----------
async function sessionToken(): Promise<string | null> {
  if (fakeUserId()) return "e2e-stub-token"; // e2e: 서버는 page.route 스텁이라 검증 없음
  try {
    const c = await getSupabase();
    const { data } = await c.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function payApi(
  fn: "pay-order" | "pay-confirm",
  token: string,
  body: unknown,
): Promise<{ status: number; body: Record<string, unknown> | null }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = (await res.json()) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
    return { status: res.status, body: parsed };
  } catch {
    return { status: 0, body: null };
  }
}

// ---------- 이용권(entitlements) — 서버 진실을 store에 반영 ----------
interface EntitlementRow {
  subject_id: string;
  plan: string;
  expires_at: string | null;
}

/** 서버 이용권 목록으로 기기 프리미엄 상태를 교체한다(만료 패스 집행 포함).
 *  병합이 아니라 교체 — 30일 패스 만료가 이 지점에서 실효된다(오프라인 기기는 다음 접속 때). */
function applyEntitlements(rows: EntitlementRow[]): void {
  const valid = new Set(SELLABLE_SUBJECTS.map((s) => s.id));
  const now = Date.now();
  const ids = [
    ...new Set(
      rows
        .filter((e) => valid.has(e.subject_id) && (!e.expires_at || Date.parse(e.expires_at) > now))
        .map((e) => e.subject_id),
    ),
  ];
  applySyncedState({ premium: ids.length > 0, premiumSubjectIds: ids });
}

/** 서버 이용권 재조회(로그인 직후 sync.ts fullSync·구매 복원이 호출) — 성공 여부만 반환.
 *  실패(오프라인 등) 시 기기 상태를 건드리지 않는다(학습은 잃지 않는다의 결제판). */
export async function refreshEntitlements(): Promise<boolean> {
  if (!isAuthConfigured() || !currentUser()) return false;
  try {
    const c = await getSupabase();
    const { data, error } = await c.from("entitlements").select("subject_id, plan, expires_at");
    if (error || !data) return false;
    applyEntitlements(data as EntitlementRow[]);
    return true;
  } catch {
    return false;
  }
}

// ---------- 구매(주문 → 결제창) ----------
export type PurchaseOutcome =
  | { r: "ok" } // 즉시 해금(DEV 스텁)
  | { r: "redirect" } // 토스 결제창으로 이동 중(페이지가 곧 떠난다)
  | { r: "login" } // 로그인 필요
  | { r: "unavailable" } // 결제 환경 미구성(env 없음 등)
  | { r: "fail"; msg: string };

const PENDING_KEY = "ss.payPending"; // successUrl 복귀분의 승인 재료 — 승인 완료·확정 실패 시 제거
const FAIL_KEY = "ss.payFail"; // failUrl 복귀 1회성 안내(세션)

/** 프리미엄 구매(소장/30일 패스). 웹 = 토스 결제창(리다이렉트) — 성공 복귀는 successUrl 쿼리를
 *  capturePaymentReturn()이 접수하고 resumePaymentConfirm()이 승인까지 마친다.
 *  DEV 기본은 즉시 해금 스텁(기존 QA·e2e 계약 유지, 실플로우는 ss.payreal="1"). */
export async function buyPremium(selection?: {
  subjectIds: string[];
  plan?: PlanId;
  guardianConsent?: boolean;
}): Promise<PurchaseOutcome> {
  const subjectIds = [...new Set(selection?.subjectIds ?? [])];
  const plan: PlanId = selection?.plan ?? "own";
  if (isDev && !devRealPay()) {
    setPremium(true, subjectIds);
    return { r: "ok" };
  }
  if (!isAuthConfigured() || subjectIds.length === 0) return { r: "unavailable" };
  const uid = fakeUserId() ?? currentUser()?.id;
  if (!uid) return { r: "login" };
  const token = await sessionToken();
  if (!token) return { r: "login" };

  // 1) 주문 생성 — 서버가 가격을 재계산·검증한다(여기서 보낸 amount는 "화면에 보여 준 금액" 대조용).
  const amount = priceOfPlan(plan, subjectIds.length);
  const order = await payApi("pay-order", token, {
    plan,
    subjectIds,
    amount,
    guardianConsent: selection?.guardianConsent === true,
  });
  if (order.status !== 200 || !order.body) {
    if (order.status === 401) return { r: "login" };
    return { r: "fail", msg: String(order.body?.message ?? "주문을 만들지 못했어요. 잠시 후 다시 시도해 주세요.") };
  }
  const orderId = String(order.body.orderId ?? "");
  const serverAmount = Number(order.body.amount ?? amount);
  const orderName = String(order.body.orderName ?? "스틱스텝 프리미엄");

  // 2) 토스 결제창 — 모바일은 페이지 이동, 복귀는 successUrl/failUrl 쿼리로 돌아온다.
  const factory = await loadTossSdk();
  if (!factory) return { r: "fail", msg: "결제 모듈을 불러오지 못했어요. 네트워크를 확인해 주세요." };
  try {
    const user = currentUser();
    const payment = factory(TOSS_CLIENT_KEY).payment({ customerKey: uid });
    // 결제창으로 떠나기 직전에 승인 재료를 기기에 남긴다 — 복귀한 페이지(새 부팅)가 이어받는다.
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ orderId, amount: serverAmount }));
    } catch {
      /* 사생활 보호 모드 — successUrl 쿼리만으로도 승인 가능 */
    }
    await payment.requestPayment({
      method: "CARD", // 카드/간편결제 통합결제창
      amount: { currency: "KRW", value: serverAmount },
      orderId,
      orderName,
      successUrl: `${location.origin}${base}?pay=ok`,
      failUrl: `${location.origin}${base}?pay=fail`,
      ...(user?.email ? { customerEmail: user.email } : {}),
      ...(user?.name ? { customerName: user.name } : {}),
      card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
    });
    return { r: "redirect" };
  } catch (e) {
    try {
      localStorage.removeItem(PENDING_KEY);
    } catch {
      /* 무시 */
    }
    const err = e as { code?: string; message?: string } | null;
    if (err?.code === "USER_CANCEL") return { r: "fail", msg: "결제를 취소했어요." };
    return { r: "fail", msg: err?.message ?? "결제창을 열지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}

/** 기기 변경 등으로 구매 내역 복원 — 로그인 계정의 서버 이용권을 다시 불러온다. */
export type RestoreOutcome = "ok" | "none" | "login" | "unavailable";
export async function restorePurchase(): Promise<RestoreOutcome> {
  if (isDev && !devRealPay()) {
    setPremium(true);
    return "ok";
  }
  if (!isAuthConfigured()) return "unavailable";
  if (!currentUser()) return "login";
  const ok = await refreshEntitlements();
  return ok ? (ownedPremiumSubjectIds().length > 0 ? "ok" : "none") : "none";
}

// ---------- 결제창 복귀 처리(main.ts 부팅 최상단에서 호출) ----------
/** successUrl/failUrl 쿼리를 접수하고 주소를 즉시 청소한다.
 *  반드시 initAuth보다 먼저 — failUrl의 ?code=…를 OAuth 코드 교환이 오인하는 사고 차단. */
export function capturePaymentReturn(): void {
  let usp: URLSearchParams;
  try {
    usp = new URLSearchParams(location.search);
  } catch {
    return;
  }
  const pay = usp.get("pay");
  if (!pay) return;
  if (pay === "ok") {
    const paymentKey = usp.get("paymentKey");
    const orderId = usp.get("orderId");
    const amount = Number(usp.get("amount"));
    if (paymentKey && orderId && Number.isFinite(amount)) {
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ paymentKey, orderId, amount }));
      } catch {
        /* 무시 */
      }
    }
  } else {
    try {
      sessionStorage.setItem(
        FAIL_KEY,
        JSON.stringify({ code: usp.get("code") ?? "", message: usp.get("message") ?? "" }),
      );
      localStorage.removeItem(PENDING_KEY);
    } catch {
      /* 무시 */
    }
  }
  try {
    history.replaceState(null, "", location.pathname);
  } catch {
    /* 무시 */
  }
}

interface PendingPay {
  orderId: string;
  amount: number;
  paymentKey?: string;
}

function readPending(): PendingPay | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingPay;
    return p && typeof p.orderId === "string" && Number.isFinite(p.amount) ? p : null;
  } catch {
    return null;
  }
}

function clearPending(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* 무시 */
  }
}

/** 미완 승인(성공 복귀·이전 세션 잔여분)을 로그인 복원이 끝나는 대로 승인까지 밀어붙인다.
 *  notify(msg, ok)로 결과를 알린다 — 성공 시 이용권은 이미 store에 반영된 뒤다.
 *  실패 복귀(failUrl) 안내도 여기서 1회 소비한다. */
export function resumePaymentConfirm(notify: (msg: string, ok: boolean) => void): void {
  // 실패 복귀 안내(1회성) — 사용자가 결제창을 닫은 취소는 짧게, 그 외는 사유를 보여 준다.
  try {
    const failRaw = sessionStorage.getItem(FAIL_KEY);
    if (failRaw) {
      sessionStorage.removeItem(FAIL_KEY);
      const f = JSON.parse(failRaw) as { code?: string; message?: string };
      if (f.code === "PAY_PROCESS_CANCELED") notify("결제를 취소했어요.", false);
      else notify(`결제가 진행되지 않았어요${f.message ? `: ${f.message}` : ""}`, false);
    }
  } catch {
    /* 무시 */
  }

  const pending = readPending();
  if (!pending) return;
  if (!pending.paymentKey) {
    // 결제창으로 떠났지만 성공 쿼리 없이 돌아온 잔여분(창 이탈·뒤로가기) — 주문은 미결로 남고 무해.
    clearPending();
    return;
  }
  if (!isAuthConfigured() && !fakeUserId()) {
    clearPending();
    return;
  }

  let attempted = false;
  const attempt = async (): Promise<void> => {
    if (attempted) return;
    attempted = true;
    const token = await sessionToken();
    if (!token) {
      attempted = false; // 다음 로그인 이벤트 때 재시도
      return;
    }
    const res = await payApi("pay-confirm", token, pending);
    if (res.status === 200 && res.body?.ok) {
      clearPending();
      const ents = Array.isArray(res.body.entitlements) ? (res.body.entitlements as EntitlementRow[]) : [];
      if (ents.length > 0) applyEntitlements(ents);
      else {
        const subjects = Array.isArray(res.body.subjects) ? (res.body.subjects as string[]) : [];
        if (subjects.length > 0) setPremium(true, subjects); // 지급 재시도 대기 중에도 기기는 먼저 연다
      }
      notify("결제가 완료됐어요! 선택한 과목의 프리미엄이 열렸어요.", true);
      return;
    }
    if (res.status === 0 || res.status >= 500) {
      attempted = false; // 네트워크·서버 일시 장애 — 승인 재료를 남겨 다음 부팅이 재시도
      notify("결제 확인이 지연되고 있어요. 네트워크 연결 후 앱을 다시 열면 마무리돼요.", false);
      return;
    }
    if (res.status === 401) {
      attempted = false; // 세션 복원 전 — 로그인 이벤트가 다시 부른다
      return;
    }
    clearPending(); // 명확한 승인 실패(금액 불일치·세션 만료 등) — 재시도 무의미
    notify(String(res.body?.message ?? "결제 승인에 실패했어요. 결제는 청구되지 않아요."), false);
  };

  // 세션 복원(로그인)을 기다렸다가 시도 — onAuthChange는 등록 즉시 현재 상태로 1회 불린다.
  if (fakeUserId()) {
    void attempt();
    return;
  }
  onAuthChange((u) => {
    if (u) void attempt();
  });
  window.setTimeout(() => {
    if (!attempted && readPending()) notify("로그인하면 결제가 자동으로 마무리돼요.", false);
  }, 12000);
}
