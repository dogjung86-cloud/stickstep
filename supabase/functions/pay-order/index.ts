// 스틱스텝 결제 1단계 — 주문 생성. "가격은 서버가 결정한다"(core/purchase.ts 헤더의 예약 설계).
// 클라이언트가 보낸 {plan, subjectIds, amount}를 검증해 orders(pending) 행을 만들고
// 토스 결제창에 넘길 {orderId, amount, orderName}을 돌려준다.
// - 금액은 서버 가격표로 재계산 — 클라이언트 표시가와 다르면 주문을 거부한다(조작·스테일 차단).
// - 얼리버드는 active 여부와 무관하게 "앱이 판매한 적 있는 두 가격(정가 사다리·균일가)"만 통과 —
//   출시일에 purchase.ts EARLY_BIRD.active만 켜도 서버 재배포 없이 결제가 계속 성립한다.
//   (가격표 자체를 바꿀 때는 이 파일도 함께 — qa/check-pay.mjs가 두 파일의 일치를 기계 검증.)
// - 배포: Supabase 엣지 함수(관리 API), verify_jwt=false(CORS preflight 통과) + 코드에서 JWT 직접 검증.
import { createClient } from "npm:@supabase/supabase-js@2";

// ── 가격표 — app/src/core/purchase.ts와 반드시 동기(qa/check-pay.mjs) ──
const PLAN_TIERS = [14900, 24900, 33900]; // 소장 1/2/3과목 정가
const PER_SUBJECT_FLOOR = 33900 / 3; // 4과목째부터 과목당 11,300원 고정
const PASS30_PRICE = 4900; // 30일 시험 대비 패스(과목당 균일)
const EARLY_BIRD_PER = 9900; // 얼리버드 소장 균일가(출시 기념)
const SELLABLE: Record<string, string> = {
  "sci-g1": "중1 과학",
  "math-g1": "중1 수학",
  "sci-g2": "중2 과학",
  "math-g2": "중2 수학",
};

const priceRegular = (n: number): number => (n <= 3 ? PLAN_TIERS[n - 1] : Math.round(PER_SUBJECT_FLOOR * n));

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: userData } = jwt ? await sb.auth.getUser(jwt) : { data: { user: null } };
  const user = userData?.user;
  if (!user) return json(401, { error: "login_required", message: "로그인이 필요해요." });

  let body: { plan?: string; subjectIds?: unknown; amount?: unknown; guardianConsent?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request", message: "요청 형식이 올바르지 않아요." });
  }

  const plan = body.plan === "pass30" ? "pass30" : body.plan === "own" ? "own" : null;
  const ids = Array.isArray(body.subjectIds) ? [...new Set(body.subjectIds.filter((v) => typeof v === "string"))] : [];
  if (!plan || ids.length < 1 || ids.length > 8 || ids.some((id) => !(id in SELLABLE)))
    return json(400, { error: "bad_request", message: "주문 정보가 올바르지 않아요." });
  // 보호자 동의·주문 확인 체크는 결제 진입의 필수 관문(전상법 13조 2항 증적) — 서버도 강제한다.
  if (body.guardianConsent !== true)
    return json(400, { error: "consent_required", message: "주문 확인과 동의에 체크해 주세요." });

  // 이미 이용 중인 과목은 이중 결제 차단(페이월도 막지만 서버가 최종 방어선).
  const nowIso = new Date().toISOString();
  const { data: ents, error: entErr } = await sb
    .from("entitlements")
    .select("subject_id, plan, expires_at")
    .eq("user_id", user.id)
    .in("subject_id", ids);
  if (entErr) return json(500, { error: "server_error", message: "잠시 후 다시 시도해 주세요." });
  const active = (ents ?? []).filter((e) => !e.expires_at || e.expires_at > nowIso).map((e) => e.subject_id);
  if (active.length > 0)
    return json(409, {
      error: "already_owned",
      subjects: active,
      message: `${active.map((id) => SELLABLE[id]).join(", ")}은(는) 이미 이용 중이에요.`,
    });

  // 금액 검증 — 서버 가격표의 "판매 성립 가격"과 정확히 일치해야 한다.
  const n = ids.length;
  const claimed = typeof body.amount === "number" ? body.amount : -1;
  let priceKind: "regular" | "earlybird" | "pass30";
  if (plan === "pass30") {
    if (claimed !== PASS30_PRICE * n)
      return json(409, { error: "price_mismatch", message: "가격 정보가 갱신됐어요. 화면을 새로고침해 주세요." });
    priceKind = "pass30";
  } else if (claimed === priceRegular(n)) priceKind = "regular";
  else if (claimed === EARLY_BIRD_PER * n) priceKind = "earlybird";
  else return json(409, { error: "price_mismatch", message: "가격 정보가 갱신됐어요. 화면을 새로고침해 주세요." });

  const orderId = "ss_" + crypto.randomUUID().replace(/-/g, ""); // 토스 규격: 6~64자 [A-Za-z0-9_-]
  const planLabel = plan === "pass30" ? "30일 패스" : "소장";
  const first = SELLABLE[ids[0]];
  const orderName = n === 1 ? `스틱스텝 ${first} ${planLabel}` : `스틱스텝 ${first} 외 ${n - 1}과목 ${planLabel}`;

  const { error: insErr } = await sb.from("orders").insert({
    order_id: orderId,
    user_id: user.id,
    plan,
    subject_ids: ids,
    amount: claimed,
    price_kind: priceKind,
    status: "pending",
    guardian_consent: true,
    consent_ua: req.headers.get("User-Agent") ?? null,
  });
  if (insErr) return json(500, { error: "server_error", message: "주문을 만들지 못했어요. 잠시 후 다시 시도해 주세요." });

  return json(200, { orderId, amount: claimed, orderName });
});
