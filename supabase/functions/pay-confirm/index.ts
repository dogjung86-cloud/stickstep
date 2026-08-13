// 스틱스텝 결제 2단계 — 승인 + 이용권 지급. successUrl 쿼리(paymentKey·orderId·amount)를 받아
// ① 주문 대조(소유자·금액) ② 토스 승인 API 호출 ③ orders paid 갱신 ④ entitlements 지급 순서로 처리한다.
// - 시크릿 키는 TOSS_SECRET_KEY 시크릿(없으면 문서 테스트 키 폴백 — 라이브 전환 시 반드시 설정, PAYMENTS.md).
// - 같은 주문 재호출(성공 페이지 새로고침 등)은 지급 상태를 그대로 돌려주는 멱등 동작.
// - 배포: Supabase 엣지 함수(관리 API), verify_jwt=false + 코드에서 JWT 직접 검증.
import { createClient } from "npm:@supabase/supabase-js@2";

// 토스 문서 공개 테스트 시크릿 키(docs.tosspayments.com 예제 키 — 비밀 아님, 테스트 결제 전용).
// 라이브 키는 절대 코드에 넣지 않는다 — supabase secrets(TOSS_SECRET_KEY)로만.
const DOCS_TEST_SECRET = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
const PASS30_DAYS = 30;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

type EntRow = { subject_id: string; plan: string; expires_at: string | null };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: userData } = jwt ? await sb.auth.getUser(jwt) : { data: { user: null } };
  const user = userData?.user;
  if (!user) return json(401, { error: "login_required", message: "로그인이 필요해요." });

  let body: { paymentKey?: unknown; orderId?: unknown; amount?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request", message: "요청 형식이 올바르지 않아요." });
  }
  const paymentKey = typeof body.paymentKey === "string" ? body.paymentKey : "";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount))
    return json(400, { error: "bad_request", message: "결제 정보가 올바르지 않아요." });

  const { data: order, error: ordErr } = await sb.from("orders").select("*").eq("order_id", orderId).maybeSingle();
  if (ordErr) return json(500, { error: "server_error", message: "잠시 후 다시 시도해 주세요." });
  if (!order || order.user_id !== user.id)
    return json(404, { error: "order_not_found", message: "주문을 찾지 못했어요." });

  const activeEnts = async (): Promise<EntRow[]> => {
    const nowIso = new Date().toISOString();
    const { data } = await sb.from("entitlements").select("subject_id, plan, expires_at").eq("user_id", user.id);
    return ((data ?? []) as EntRow[]).filter((e) => !e.expires_at || e.expires_at > nowIso);
  };

  // 이용권 지급 — 소장은 기간 없음(expires_at null), 30일 패스는 승인 시점+30일.
  // 소장 보유 과목은 패스로 격하하지 않는다(주문 단계에서 이미 차단되지만 최종 방어).
  // 승인 성공 뒤 지급이 실패해도 결제를 되돌리지 않는다 — 재호출(멱등)이 이 함수로 지급을 복구한다.
  // 패스 만료는 반드시 "승인 시각 + 30일" 앵커 — now() 기준이면 성공 페이지 재방문마다 만료가
  // 밀리는 무한 연장 구멍이 된다. 재호출은 같은 앵커라 결과가 불변(멱등).
  const grant = async (approvedIso: string): Promise<boolean> => {
    const { data: existing } = await sb
      .from("entitlements")
      .select("subject_id, plan, expires_at")
      .eq("user_id", user.id)
      .in("subject_id", order.subject_ids);
    const cur = new Map(((existing ?? []) as EntRow[]).map((e) => [e.subject_id, e]));
    const expires =
      order.plan === "pass30"
        ? new Date(new Date(approvedIso).getTime() + PASS30_DAYS * 24 * 60 * 60 * 1000).toISOString()
        : null;
    const rows = (order.subject_ids as string[])
      .filter((id) => {
        if (order.plan === "own") return true; // 소장은 항상 최상위 — 패스 위에 덮어써도 승격
        const e = cur.get(id);
        if (!e) return true;
        if (e.plan === "own" && !e.expires_at) return false; // 소장 보유를 패스로 격하 금지
        return !e.expires_at || !expires || e.expires_at < expires; // 더 긴 이용권을 단축 금지
      })
      .map((id) => ({ user_id: user.id, subject_id: id, plan: order.plan, expires_at: expires, order_id: orderId }));
    if (rows.length === 0) return true;
    const { error } = await sb.from("entitlements").upsert(rows, { onConflict: "user_id,subject_id" });
    return !error;
  };

  // 멱등: 이미 승인된 주문(성공 페이지 새로고침·이중 호출)은 지급을 보증한 뒤 결과만 다시 돌려준다.
  if (order.status === "paid") {
    const granted = await grant(order.approved_at ?? new Date().toISOString());
    return json(200, {
      ok: true,
      subjects: order.subject_ids,
      plan: order.plan,
      receiptUrl: order.receipt_url,
      entitlements: await activeEnts(),
      ...(granted ? {} : { grantRetry: true }),
    });
  }

  // successUrl 쿼리의 amount ↔ 주문 원장 금액 대조(문서의 필수 검증 — 결제 과정 금액 변조 차단).
  if (amount !== order.amount) {
    await sb
      .from("orders")
      .update({ status: "failed", fail_code: "AMOUNT_MISMATCH", fail_message: `쿼리 ${amount} ≠ 주문 ${order.amount}` })
      .eq("order_id", orderId);
    return json(400, { error: "amount_mismatch", message: "결제 금액이 주문과 달라요. 다시 시도해 주세요." });
  }

  // 토스 결제 승인 — Basic base64("시크릿키:"). 멱등 키로 orderId를 실어 네트워크 재시도에도 안전.
  const secret = (Deno.env.get("TOSS_SECRET_KEY") ?? "").trim() || DOCS_TEST_SECRET;
  const auth = "Basic " + btoa(`${secret}:`);
  let pay: Record<string, unknown>;
  try {
    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json", "Idempotency-Key": orderId },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    pay = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const code = String(pay.code ?? "CONFIRM_FAILED");
      // 이전 호출이 이미 승인시킨 결제(이중 제출 경합) — 실패가 아니라 성공 경로로 합류시킨다.
      if (code !== "ALREADY_PROCESSED_PAYMENT") {
        await sb
          .from("orders")
          .update({ status: "failed", fail_code: code, fail_message: String(pay.message ?? "") })
          .eq("order_id", orderId);
        return json(402, { error: code, message: String(pay.message ?? "결제 승인에 실패했어요.") });
      }
    }
  } catch {
    return json(502, { error: "toss_unreachable", message: "결제사와 통신하지 못했어요. 잠시 후 다시 시도해 주세요." });
  }

  const receipt = (pay.receipt as { url?: string } | null | undefined)?.url ?? null;
  const approvedIso = typeof pay.approvedAt === "string" ? pay.approvedAt : new Date().toISOString();
  await sb
    .from("orders")
    .update({
      status: "paid",
      payment_key: paymentKey,
      method: typeof pay.method === "string" ? pay.method : null,
      receipt_url: receipt,
      test_mode: !secret.startsWith("live_"),
      approved_at: approvedIso,
      fail_code: null,
      fail_message: null,
    })
    .eq("order_id", orderId);

  const granted = await grant(approvedIso);
  return json(200, {
    ok: true,
    subjects: order.subject_ids,
    plan: order.plan,
    receiptUrl: receipt,
    entitlements: await activeEnts(),
    ...(granted ? {} : { grantRetry: true }),
  });
});
