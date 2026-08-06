// 페이월 v4 — "소장 + 가격 사다리" 리디자인(2026-07-27, 가격 구조 확정 대화 반영).
// v3(발자국 히어로 · 과목 다중 선택 · 영수증 카드) 골격은 유지하고 판매 언어와 SKU를 교체했다:
// ① '평생' 워딩 전면 폐기 → '소장'(문제집 메타포). '평생'은 서비스 무기한 보장을 약속하는 말이라
//    부채가 되고 소비자도 반신반의한다 — 약관에는 "서비스 제공 기간 내 기간 제한 없음"으로 명문화(결제 오픈 때).
// ② 30일 시험 대비 패스(단건 4,900원/과목, 자동 연장 없음) — 월 정기결제는 기각(체리피킹 역선택+빌링 비용).
// ③ 얼리버드(출시 기념 9,900원 균일)가 켜져 있으면 30일 패스를 숨기고 정가 취소선을 그린다
//    (런칭 기간 SKU 단일화 — 정가 복귀 때 core/purchase.ts EARLY_BIRD.active만 끄면 패스가 함께 열린다).
// 업셀 사다리 = "패스 세 번이면 소장 가격"(4,900×3 ≈ 14,900 — 영수증 카드가 문구로 노출).
// 가격·플랜은 core/purchase.ts(priceOfPlan · PASS30 · EARLY_BIRD)가 단일 진실 공급원.
// 환불 문구는 v3 확정 유지(전자상거래법 17조 — 가분적 콘텐츠 조항 + 무료 레슨이 시험 사용 상품):
// "이용을 시작하지 않은 과목만 7일 내 전액 환불". 전문은 public/refund.html 정본(파인프린트 아래 링크).
// e2e 계약: .pw-title 텍스트에 "프리미엄" 포함(qa/e2e-exam-*.mjs 24종이 참조) — 아이브로가 유지.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import {
  buyPremium,
  ownedPremiumSubjectIds,
  restorePurchase,
  SELLABLE_SUBJECTS,
  PER_SUBJECT_FLOOR,
  PASS30,
  EARLY_BIRD,
  earlyBirdActive,
  priceOf,
  priceOfPlan,
  saveOf,
  won,
  type PlanId,
} from "../core/purchase";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";
import { stepMarkSvg } from "../ui/stepMark";
import "../styles/paywall.css";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export function paywallScreen(opts: { lessonTitle?: string; sub?: string; onUnlocked: () => void; onClose: () => void }): Screen {
  const eb = earlyBirdActive();
  const close = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  close.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onClose();
  });
  const head = el("div", { class: "obhead" }, close, el("div", {}), el("div", { style: "width:38px" }));

  // ── 히어로: 문제집 앵커가 헤드라인 — "왜 이 가격이 싼가"를 비교 대상으로 못 박는다 ──
  const trust = (t: string): HTMLElement =>
    el("li", { class: "pwx-chip" }, el("span", { class: "pwx-chip-ic", html: icon("check", 13) }), el("span", { text: t }));
  const hero = el(
    "header",
    { class: "pwx-hero pwx-rise r1" },
    el("div", { class: "pwx-markwrap", html: stepMarkSvg("pwx") }),
    el("div", { class: "pw-title pwx-eyebrow", text: `${BRAND.name} 프리미엄` }),
    el("h1", { class: "pwx-h1", text: "문제집 한 권 값으로, 과목을 통째로" }), // 한 줄 확정(2026-07-27 v4)
    el("div", {
      // 주의: .pwx-sub는 과목 선택 버튼이 선점 — 히어로 소개문은 pwx-lead.
      // 소개문은 고정 문구(v4 재확정 2026-07-27) — 진입 맥락(opts.sub·lessonTitle)으로 바꾸지 않는다.
      // "기간 제한"은 여기서 말하지 않는다(30일 패스와 충돌) — 기간 언어는 플랜 카드·영수증 몫.
      class: "pwx-lead",
      text: "선택한 과목의 모든 프리미엄 레슨과 평가를 열어요. 구독이 아니라서 매달 나가는 돈이 없어요.",
    }),
    el("ul", { class: "pwx-chips" }, trust("기간 제한 없는 소장"), trust("자동결제 없음"), trust("이용 전 7일 환불")),
  );

  // ── 혜택: 핵심 2개는 크게, 오답 케어 2개는 묶어서 조용하게 ──
  const benefit = (ic: string, tone: string, t: string, s: string): HTMLElement =>
    el(
      "div",
      { class: "pwx-ben" },
      el("div", { class: `pwx-bico ${tone}`, html: icon(ic, 21) }),
      el("div", {}, el("h3", { class: "pwx-bt", text: t }), el("p", { class: "pwx-bs", text: s })),
    );
  const mini = (t: string, em: string): HTMLElement =>
    el(
      "div",
      { class: "pwx-mini" },
      el("span", { class: "pwx-mini-ic", html: icon("check", 15) }),
      el("span", {}, el("span", { text: t }), el("em", { text: ` · ${em}` })),
    );
  const bens = el(
    "section",
    { class: "pwx-bens pwx-rise r2", attrs: { "aria-label": "프리미엄 혜택" } },
    benefit("flask", "gold", "모든 랩·시뮬레이션 무제한", "전 단원의 프리미엄 레슨이 전부 열려요."),
    benefit("trophy", "blue", "단원 평가 무제한 재응시", "실전 문제 세트를 몇 번이든 다시 풀어요."),
    el(
      "div",
      { class: "pwx-minibox" },
      el("div", { class: "pwx-minilabel", text: "틀린 문제까지 챙겨요" }),
      mini("오답노트 자동 정리", "해결할 때까지 복습"),
      mini("취약 단원 맞춤 문제지", "많이 틀린 곳만 골라서"),
    ),
  );

  // ── 과목 선택 — 다중 선택(최소 1, 개수 제한 없음) ──
  const owned = new Set(ownedPremiumSubjectIds());
  const firstAvailable = SELLABLE_SUBJECTS.find((s) => !owned.has(s.id));
  const picked = new Set<string>(firstAvailable ? [firstAvailable.id] : []);
  const count = el("span", { class: "pwx-scount" });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });
  const subjectMsg = el("div", { class: "pwx-submsg", attrs: { role: "status", "aria-live": "polite" } });

  const chips = SELLABLE_SUBJECTS.map((s) => {
    const isOwned = owned.has(s.id);
    const chip = el(
      "button",
      {
        class: `pwx-sub ${isOwned ? "owned" : ""}`,
        attrs: {
          type: "button",
          "aria-pressed": "false",
          // 보유분은 소장인지 30일 패스인지 스텁 저장이 구분하지 못한다 — 중립 표현 유지.
          ...(isOwned ? { "aria-label": `${s.name}, 이미 이용 중인 과목` } : {}),
        },
      },
      el("span", { class: "pwx-dot", html: icon("check", 11), attrs: { "aria-hidden": "true" } }),
      el("span", { text: s.name }),
      isOwned ? el("em", { class: "pwx-owned", text: "이용중" }) : null,
    );
    chip.addEventListener("click", () => {
      if (isOwned) {
        haptic(HAPTIC.deny);
        subjectMsg.textContent = "이미 이용 중인 과목이에요. 다시 결제되지 않아요.";
        return;
      }
      if (picked.has(s.id)) {
        if (picked.size === 1) {
          haptic(HAPTIC.tap);
          subjectMsg.textContent = "최소 1과목은 골라야 해요.";
          return;
        }
        picked.delete(s.id);
      } else {
        picked.add(s.id);
      }
      haptic(HAPTIC.tap);
      subjectMsg.textContent = "";
      refresh(true);
    });
    return { id: s.id, chip, isOwned };
  });
  const hint = el("div", { class: "pwx-hint" }); // 플랜·얼리버드 상태를 따라가는 동적 안내 — refresh()가 채운다
  const subs = el(
    "section",
    { class: "pwx-subjects pwx-rise r3", attrs: { "aria-label": "이용할 과목 고르기" } },
    el("div", { class: "pwx-shead" }, el("h2", { text: "이용할 과목 고르기" }), count),
    el("div", { class: "pwx-subs", attrs: { role: "group" } }, ...chips.map((c) => c.chip)),
    subjectMsg,
    hint,
  );

  // ── 이용 방법(플랜) — 30일 패스 vs 소장(추천·기본 선택). 얼리버드 동안은 섹션 자체를 그리지 않는다 ──
  let plan: PlanId = "own";
  const planCards: { id: PlanId; card: HTMLElement }[] = [];
  const mkPlan = (id: PlanId, name: string, price: string, desc: string, badge?: string): HTMLElement => {
    const card = el(
      "button",
      { class: "pwx-plan", attrs: { type: "button", "aria-pressed": "false" } },
      badge ? el("span", { class: "pwx-plan-badge", text: badge }) : null,
      el("span", { class: "pwx-plan-name", text: name }),
      el("span", { class: "pwx-plan-price" }, el("b", { text: price }), el("span", { text: " · 과목당" })),
      el("span", { class: "pwx-plan-desc", text: desc }),
    );
    card.addEventListener("click", () => {
      if (plan === id) return;
      plan = id;
      haptic(HAPTIC.tap);
      refresh(true);
    });
    planCards.push({ id, card });
    return card;
  };
  const plans = eb
    ? null
    : el(
        "section",
        { class: "pwx-plans pwx-rise r4", attrs: { "aria-label": "이용 방법 고르기" } },
        el("div", { class: "pwx-shead" }, el("h2", { text: "이용 방법 고르기" })),
        el(
          "div",
          { class: "pwx-plangrid", attrs: { role: "group" } },
          mkPlan("pass30", "30일 패스", won(PASS30.price), "시험 기간 한 달만 가볍게"),
          mkPlan("own", "소장", won(priceOf(1)), "기간 제한 없이 계속 내 것", "추천"),
        ),
      );

  // ── 가격 카드: 영수증처럼 — 얼마를, 몇 번, 무엇에 내는지 한눈에 ──
  const pname = el("span", { class: "pwx-pname" });
  const strike = el("del", { class: "pwx-strike" }); // 얼리버드 정가 취소선(정가 = priceOf 사다리)
  const amount = el("span", { class: "pwx-amount" });
  const pernote = el("div", { class: "pwx-pernote" });
  const save = el("div", { class: "pwx-save" });
  const up = el("div", { class: "pwx-up" }); // 30일 패스 → 소장 업셀 한 줄
  const inc = (html: string): HTMLElement =>
    el("div", { class: "pwx-inc" }, el("span", { class: "pwx-inc-ic", html: icon("check", 14) }), el("span", { html }));
  const card = el(
    "section",
    { class: `pwx-card pwx-rise ${eb ? "r4" : "r5"}`, attrs: { "aria-label": "가격 안내" } },
    el(
      "div",
      { class: "pwx-cmain" },
      el("div", { class: "pwx-prow" }, pname, el("span", { class: "pwx-badge", text: "1회 결제" })),
      el("div", { class: "pwx-arow" }, strike, amount, el("span", { class: "pwx-per", text: "한 번만 내요" })),
      pernote,
      save,
      up,
    ),
    el(
      "div",
      { class: "pwx-cinc" },
      inc("<strong>새로운 콘텐츠가 추가되어도 모두 무료</strong> · 업데이트 비용 없음"),
      inc("로그인하면 어느 기기에서나 이어서 이용해요"),
    ),
  );

  // 환불 고지 — 전자상거래법 17조 6항: 청약철회가 제한된다는 사실을 사전에 표시해야
  // 이용 개시분의 환불 거절이 유효하다(불가 문구는 필수 고지이지 과잉이 아님).
  // 단위는 반드시 "과목"으로 명시 — 결제 전체 불가로 읽히면 미개시 과목의 철회권(가분 조항)과 충돌.
  // "서비스가 제공되는 동안" 줄은 소장의 정직한 정의(v4) — '평생 보장' 분쟁의 예방선이라 지우지 말 것.
  // 미성년자 줄은 간결판(사용자 확정 2026-07-15). 전상법 13조 2항 의무 고지 원문("법정대리인이
  // 동의하지 않으면 미성년자 본인 또는 법정대리인이 취소할 수 있다")은 결제 오픈 시 토스PG 결제
  // 단계·이용약관에 반드시 명문화한다(CLAUDE.md 미성년자 취소권 항목 참조 — 여기서 지운 게 아니라 이전).
  const fine = el("div", {
    class: "pwx-fine",
    text:
      "VAT 포함 가격 · 소장은 서비스가 제공되는 동안 기간 제한 없이 이용하는 상품이에요 · " +
      "결제 후 7일 이내에는 이용을 시작하지 않은 과목을 전액 환불해 드려요. " +
      "단, 이용을 시작한 과목은 환불이 불가능해요 (무료 레슨으로 먼저 체험해 보세요) · " +
      "미성년자는 반드시 보호자의 동의를 얻어 결제해 주세요",
  });
  // 환불 정책 전문 링크 — 파인프린트 요약의 근거 문서(public/refund.html 정본). 페이월은 9곳에서
  // prop 없이 열리는 화면이라 인앱 정책 화면 배선 대신 정적 원본을 새 탭으로 연다.
  const fineLink = el("a", {
    class: "pwx-fine-link",
    text: "환불 정책 전문 보기",
    attrs: { href: `${base}refund.html`, target: "_blank", rel: "noopener" },
  });

  // ── CTA: 합계와 함께 갱신, 결정 직전에 안심 정보(환불) 배치 ──
  const cta = el("button", { class: "btn cta" });
  cta.addEventListener("click", async () => {
    if (picked.size === 0) return;
    haptic(HAPTIC.tap);
    cta.disabled = true;
    const r = await buyPremium({ subjectIds: [...picked], plan });
    if (r === "ok") {
      haptic(HAPTIC.done);
      opts.onUnlocked();
    } else {
      cta.disabled = false;
      helper.textContent = "정식 출시 후 결제할 수 있어요. 조금만 기다려 주세요!";
    }
  });
  const secure = el(
    "div",
    { class: "pwx-secure" },
    el("span", { class: "pwx-secure-ic", html: icon("lock", 12) }),
    el("span", { text: "안전한 결제 · 이용 전 과목은 7일 내 전액 환불" }),
  );
  const restore = el("button", { class: "pw-restore", text: "이미 구매했나요? 구매 복원" });
  restore.addEventListener("click", async () => {
    haptic(HAPTIC.tap);
    const r = await restorePurchase();
    if (r === "ok") {
      haptic(HAPTIC.done);
      opts.onUnlocked();
    } else {
      helper.textContent = "복원할 구매 내역을 찾지 못했어요.";
    }
  });

  function refresh(pop = false): void {
    const n = picked.size;
    const total = n > 0 ? priceOfPlan(plan, n) : 0;
    chips.forEach((c) => {
      const on = picked.has(c.id);
      c.chip.classList.toggle("on", on);
      c.chip.setAttribute("aria-pressed", String(on));
    });
    planCards.forEach((p) => {
      const on = p.id === plan;
      p.card.classList.toggle("on", on);
      p.card.setAttribute("aria-pressed", String(on));
    });
    count.textContent = n > 0 ? `${n}과목 선택` : "전체 이용 중";
    if (n === 0) {
      pname.textContent = "모든 과목을 이용 중이에요";
      strike.style.display = "none";
      amount.textContent = "";
      pernote.textContent = "구매한 과목은 다시 결제되지 않아요.";
      save.style.display = "none";
      up.style.display = "none";
      hint.textContent = "";
      cta.textContent = "모든 과목을 이용 중이에요";
      cta.disabled = true;
      return;
    }
    cta.disabled = false;
    const firstName = SELLABLE_SUBJECTS.find((s) => picked.has(s.id))?.name ?? "";

    // 과목 아래 안내 — 상태 우선순위: 얼리버드 균일가 → 패스 균일가 → 보유분 안내 → 묶음 사다리
    hint.textContent = eb
      ? `지금은 출시 기념가 · 몇 과목을 담아도 과목당 ${won(EARLY_BIRD.perSubject)}`
      : plan === "pass30"
        ? `30일 패스는 몇 과목이든 과목당 ${won(PASS30.price)} · 묶음 할인은 소장에 있어요`
        : owned.size > 0
          ? "이용 중인 과목은 다시 결제되지 않아요 · 새로 고른 과목만 결제해요"
          : `담을수록 과목당 가격이 내려가요 · 3과목부터는 과목당 ${won(PER_SUBJECT_FLOOR)}`;

    const label = plan === "pass30" ? "30일 패스" : "소장";
    pname.textContent = n === 1 ? `${firstName} ${label}` : `선택한 ${n}과목 ${label}`;
    amount.textContent = won(total);
    strike.style.display = eb ? "" : "none";
    strike.textContent = eb ? won(priceOf(n)) : "";
    pernote.textContent =
      plan === "pass30"
        ? n === 1
          ? `오늘부터 ${PASS30.days}일 이용 · 자동 연장 없어요`
          : `과목당 ${won(PASS30.price)} · 오늘부터 ${PASS30.days}일 이용 · 자동 연장 없어요`
        : n === 1
          ? "월 구독이 아니에요 · 추가 결제 없음"
          : `과목당 ${won(Math.round(total / n))} · 월 구독이 아니에요 · 추가 결제 없음`;
    // 절약 필: 얼리버드 = 희소성 문구만(금액 금지), 정가 소장 = 낱개 대비 묶음 절약액(2과목부터).
    // **얼리버드에 절약 금액을 쓰지 않는 이유(2026-07-27 사용자 확정 — 되돌리지 말 것)**: 얼리버드는
    // 과목당 균일가인데 정가 사다리는 3과목째만 +9,000원으로 유독 싸다(추가 비용 10,000/9,000/11,300).
    // 그래서 정가 대비 절약액이 3과목 구간에서만 꺾여 계산 오류처럼 보인다(5,000/5,100/4,200/5,600 —
    // 퍼센트·과목당 환산으로 바꿔도 같은 자리에서 꺾인다). 할인 크기는 취소선(.pwx-strike)이 이미
    // 시각적으로 전달하므로, 필은 "2달 한정" 희소성만 진다.
    const saved = eb ? priceOf(n) - total : plan === "own" ? saveOf(n) : 0;
    save.style.display = saved > 0 ? "" : "none";
    save.textContent = saved > 0 ? (eb ? "출시 기념가 · 2달 한정" : `따로 살 때보다 ${won(saved)} 아껴요`) : "";
    up.style.display = plan === "pass30" ? "" : "none";
    up.textContent = plan === "pass30" ? "패스 세 번이면 소장 가격이에요 · 오래 볼 거면 소장이 이득" : "";
    cta.textContent =
      plan === "pass30"
        ? n === 1
          ? `${firstName} 30일 패스 시작하기`
          : `${n}과목 30일 패스 시작하기`
        : n === 1
          ? `${firstName} 소장하기`
          : `${n}과목 소장하기`;
    if (pop) {
      amount.classList.remove("pwx-pop");
      void amount.offsetWidth;
      amount.classList.add("pwx-pop");
    }
  }
  refresh();

  const body = el("div", { class: "scroll pad pwx-body" }, hero, bens, subs, plans, card, fine, fineLink, helper);
  const footer = el("div", { class: "footer pwx-footer" }, cta, secure, restore);
  const elm = el("section", { class: "screen" }, head, body, footer);
  return { el: elm };
}
