// 페이월 v3 — "결제 구조가 곧 신뢰" 리디자인(2026-07-15, 사용자 목업 확정).
// 히어로 = 깃발을 향해 걷는 발자국 마크(홈 트레일 #bsfp 패스 재사용, 도장 스태거 연출) +
// "한 번 결제로, 모든 단원을 평생" 헤드라인 + 신뢰 칩(평생 소장·자동결제 없음·환불).
// 과목은 다중 선택(개수 제한 없음, 최소 1) — 가격은 core/purchase.ts priceOf가 단일 진실 공급원
// (1~3과목 = 14,900/24,900/33,900원 사다리, 4과목째부터 과목당 11,300원 고정 = 할인 종료).
// 환불 문구는 전자상거래법 17조(디지털콘텐츠 청약철회) 기준으로 확정(2026-07-15):
// "이용을 시작하지 않은 과목만 7일 내 전액 환불" — 가분적 콘텐츠 조항 + 무료 레슨(시험 사용 상품).
// 실제 결제는 core/purchase.ts 스텁(토스 PG 연동 예정) — DEV에서만 즉시 해금(QA용).
// e2e 계약: .pw-title 텍스트에 "프리미엄" 포함(qa/e2e-exam-*.mjs 14종이 참조).
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { buyPremium, restorePurchase, SELLABLE_SUBJECTS, PER_SUBJECT_FLOOR, priceOf, saveOf, won } from "../core/purchase";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";
import "../styles/paywall.css";

/** 히어로 마크 — 깃발을 향해 왼쪽→오른쪽으로 걸어가는 발자국 6개(실제 걸음처럼 위/아래
 *  지그재그 교차, 2026-07-15 사용자 지시 — 처음 4개에서 한 세트 더해 6개 확정). 발자국 패스는
 *  홈 트레일 미니 발자국(ui/soleMap.ts #bsfp)과 동일(발끝 -y 기준 → rotate 90±스플레이로 발끝이
 *  오른쪽). 바깥 g가 배치(속성 transform)를, 안쪽 g(.pwx-fp)가 도장 애니(CSS)를 소유해
 *  서로 덮어쓰지 않는다. */
function stepMarkSvg(): string {
  const FP =
    `<path d="M0,-5.6 C1.8,-5.6 3.2,-4.4 3.2,-2.6 C3.2,-0.8 2.5,0.8 1.7,1.4 C1.2,1.8 -1.2,1.8 -1.7,1.4 C-2.5,0.8 -3.2,-0.8 -3.2,-2.6 C-3.2,-4.4 -1.8,-5.6 0,-5.6 Z"/>` +
    `<rect x="-2" y="2.9" width="4" height="2.7" rx="1.35"/>`;
  const fp = (x: number, y: number, deg: number, k: string, op: number): string =>
    `<g transform="translate(${x} ${y}) rotate(${deg}) scale(1.45)"><g class="pwx-fp ${k}" fill="url(#pwxGold)" opacity="${op}">${FP}</g></g>`;
  return (
    `<svg class="pwx-mark" viewBox="0 0 136 40" fill="none" aria-hidden="true">` +
    `<defs><linearGradient id="pwxGold" x1="0" y1="1" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#EFA32B"/><stop offset="1" stop-color="#FFCF4D"/>` +
    `</linearGradient></defs>` +
    fp(9, 27, 98, "f1", 0.3) + // 오른발(아래)
    fp(28, 13, 82, "f2", 0.44) + // 왼발(위)
    fp(47, 27, 98, "f3", 0.58) +
    fp(66, 13, 82, "f4", 0.72) +
    fp(85, 27, 98, "f5", 0.86) +
    fp(104, 13, 82, "f6", 1) +
    `<g class="pwx-flag" fill="var(--n800)">` +
    `<rect x="123" y="5" width="2.6" height="24" rx="1.3"/>` +
    `<path d="M125.6 6 H135 L131.3 9.6 L135 13.2 H125.6 Z"/>` +
    `</g></svg>`
  );
}

export function paywallScreen(opts: { lessonTitle?: string; sub?: string; onUnlocked: () => void; onClose: () => void }): Screen {
  const close = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  close.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onClose();
  });
  const head = el("div", { class: "obhead" }, close, el("div", {}), el("div", { style: "width:38px" }));

  // ── 히어로: 결제 구조가 헤드라인 ──
  const trust = (t: string): HTMLElement =>
    el("li", { class: "pwx-chip" }, el("span", { class: "pwx-chip-ic", html: icon("check", 13) }), el("span", { text: t }));
  const hero = el(
    "header",
    { class: "pwx-hero pwx-rise r1" },
    el("div", { class: "pwx-markwrap", html: stepMarkSvg() }),
    el("div", { class: "pw-title pwx-eyebrow", text: `${BRAND.name} 프리미엄` }),
    el("h1", { class: "pwx-h1", text: "한 번 결제로, 모든 단원을 평생" }), // 한 줄 확정(2026-07-15)
    el("div", {
      // 주의: .pwx-sub는 과목 선택 버튼이 선점 — 히어로 소개문은 pwx-lead.
      // 소개문은 고정 문구(사용자 확정 2026-07-15) — 진입 맥락(opts.sub·lessonTitle)으로 바꾸지 않는다.
      class: "pwx-lead",
      text: "선택한 과목의 프리미엄 레슨과 평가를 기간 제한 없이 이용해요. 매달 나가는 구독료가 없어요.",
    }),
    el("ul", { class: "pwx-chips" }, trust("평생 소장"), trust("자동결제 없음"), trust("이용 전 7일 환불")),
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
  const picked = new Set<string>([SELLABLE_SUBJECTS[0].id]);
  const count = el("span", { class: "pwx-scount" });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });

  const chips = SELLABLE_SUBJECTS.map((s) => {
    const chip = el(
      "button",
      { class: "pwx-sub", attrs: { type: "button", "aria-pressed": "false" } },
      el("span", { class: "pwx-dot", html: icon("check", 11), attrs: { "aria-hidden": "true" } }),
      el("span", { text: s.name }),
    );
    chip.addEventListener("click", () => {
      if (picked.has(s.id)) {
        if (picked.size === 1) {
          haptic(HAPTIC.tap);
          helper.textContent = "최소 1과목은 골라야 해요.";
          return;
        }
        picked.delete(s.id);
      } else {
        picked.add(s.id);
      }
      haptic(HAPTIC.tap);
      helper.textContent = "";
      refresh(true);
    });
    return { id: s.id, chip };
  });
  const subs = el(
    "section",
    { class: "pwx-subjects pwx-rise r3", attrs: { "aria-label": "이용할 과목 고르기" } },
    el("div", { class: "pwx-shead" }, el("h2", { text: "이용할 과목 고르기" }), count),
    el("div", { class: "pwx-subs", attrs: { role: "group" } }, ...chips.map((c) => c.chip)),
    el("div", { class: "pwx-hint", text: `담을수록 과목당 가격이 내려가요 · 3과목부터는 과목당 ${won(PER_SUBJECT_FLOOR)}` }),
  );

  // ── 가격 카드: 영수증처럼 — 얼마를, 몇 번, 무엇에 내는지 한눈에 ──
  const pname = el("span", { class: "pwx-pname" });
  const amount = el("span", { class: "pwx-amount" });
  const pernote = el("div", { class: "pwx-pernote" });
  const save = el("div", { class: "pwx-save" });
  const inc = (html: string): HTMLElement =>
    el("div", { class: "pwx-inc" }, el("span", { class: "pwx-inc-ic", html: icon("check", 14) }), el("span", { html }));
  const card = el(
    "section",
    { class: "pwx-card pwx-rise r4", attrs: { "aria-label": "가격 안내" } },
    el(
      "div",
      { class: "pwx-cmain" },
      el("div", { class: "pwx-prow" }, pname, el("span", { class: "pwx-badge", text: "1회 결제" })),
      el("div", { class: "pwx-arow" }, amount, el("span", { class: "pwx-per", text: "한 번만 내요" })),
      pernote,
      save,
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
  // 미성년자 줄은 간결판(사용자 확정 2026-07-15). 전상법 13조 2항 의무 고지 원문("법정대리인이
  // 동의하지 않으면 미성년자 본인 또는 법정대리인이 취소할 수 있다")은 결제 오픈 시 토스PG 결제
  // 단계·이용약관에 반드시 명문화한다(CLAUDE.md 미성년자 취소권 항목 참조 — 여기서 지운 게 아니라 이전).
  const fine = el("div", {
    class: "pwx-fine",
    text:
      "VAT 포함 가격 · 결제 후 7일 이내에는 이용을 시작하지 않은 과목을 전액 환불해 드려요. " +
      "단, 이용을 시작한 과목은 환불이 불가능해요 (무료 레슨으로 먼저 체험해 보세요) · " +
      "미성년자는 반드시 보호자의 동의를 얻어 결제해 주세요",
  });

  // ── CTA: 합계와 함께 갱신, 결정 직전에 안심 정보(환불) 배치 ──
  const cta = el("button", { class: "btn cta" });
  cta.addEventListener("click", async () => {
    haptic(HAPTIC.tap);
    cta.disabled = true;
    const r = await buyPremium({ subjectIds: [...picked] });
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
    const price = priceOf(n);
    chips.forEach((c) => {
      const on = picked.has(c.id);
      c.chip.classList.toggle("on", on);
      c.chip.setAttribute("aria-pressed", String(on));
    });
    count.textContent = `${n}과목 선택`;
    const firstName = SELLABLE_SUBJECTS.find((s) => picked.has(s.id))?.name ?? "";
    pname.textContent = n === 1 ? `${firstName} 평생 이용권` : `선택한 ${n}과목 평생 이용권`;
    amount.textContent = won(price);
    pernote.textContent =
      n === 1 ? "월 구독이 아니에요 · 추가 결제 없음" : `과목당 ${won(Math.round(price / n))} · 월 구독이 아니에요 · 추가 결제 없음`;
    const saved = saveOf(n);
    save.style.display = saved > 0 ? "" : "none";
    save.textContent = saved > 0 ? `따로 살 때보다 ${won(saved)} 아껴요` : "";
    cta.textContent = n === 1 ? `${firstName} 평생 이용 시작하기` : `${n}과목 평생 이용 시작하기`;
    if (pop) {
      amount.classList.remove("pwx-pop");
      void amount.offsetWidth;
      amount.classList.add("pwx-pop");
    }
  }
  refresh();

  const body = el("div", { class: "scroll pad pwx-body" }, hero, bens, subs, card, fine, helper);
  const footer = el("div", { class: "footer pwx-footer" }, cta, secure, restore);
  const elm = el("section", { class: "screen" }, head, body, footer);
  return { el: elm };
}
