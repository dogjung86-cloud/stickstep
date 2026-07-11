// 페이월 v2 — 과목 선택형 정가(2026-07-12 확정: 1/2/3과목 = 14,900/24,900/33,900원).
// 과목 칩을 담으면 요금 사다리·합계가 실시간으로 계산된다. 실제 결제는 core/purchase.ts
// 스텁(토스 PG 연동 예정)이 담당 — DEV에서만 즉시 해금(QA용), 프로덕션 웹은 출시 후 오픈.
// e2e 계약: .pw-title 텍스트에 "프리미엄" 포함(qa/e2e-exam-*.mjs 8종이 참조).
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { buyPremium, restorePurchase, PLAN_TIERS, SELLABLE_SUBJECTS, MAX_PLAN, tierOf, saveOf, won } from "../core/purchase";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";
import "../styles/paywall.css";

const BENEFITS = [
  { icon: "flask", t: "모든 랩·시뮬레이션 무제한", s: "전 단원의 프리미엄 레슨이 전부 열려요" },
  { icon: "trophy", t: "단원 종합 평가 무제한 재응시", s: "실전 문제 세트를 몇 번이든 다시 풀어요" },
  { icon: "book", t: "오답노트 자동 정리", s: "틀린 문제를 모아 뒀다가 극복할 때까지 복습해요" },
  { icon: "target", t: "취약 단원 문제 뽑기", s: "많이 틀린 단원만 골라 맞춤 문제지를 만들어요" },
  { icon: "route", t: "새 단원 업데이트 포함", s: "고른 과목에 새 단원이 나오면 바로 열려요" },
];

export function paywallScreen(opts: { lessonTitle?: string; sub?: string; onUnlocked: () => void; onClose: () => void }): Screen {
  const close = el("button", { class: "backbtn", attrs: { "aria-label": "닫기" }, html: icon("x", 22) });
  close.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    opts.onClose();
  });
  const head = el("div", { class: "obhead" }, close, el("div", {}), el("div", { style: "width:38px" }));

  const hero = el(
    "div",
    { class: "pw-hero" },
    el("div", { class: "pw-crown", html: icon("crown", 44) }),
    el("div", { class: "pw-title", text: `${BRAND.name} 프리미엄` }),
    el("div", {
      class: "pw-sub",
      text:
        opts.sub ??
        (opts.lessonTitle
          ? `'${opts.lessonTitle}'를 포함한 모든 프리미엄 레슨을 열 수 있어요.`
          : "원하는 과목만 골라서 잠금 해제해요."),
    }),
  );

  // 혜택 — 문제 출제(단원 평가)·오답노트·취약 단원 뽑기까지 전부 프리미엄 소속
  const bens = el("div", { class: "pwx-bens" });
  BENEFITS.forEach((b) => {
    bens.appendChild(
      el(
        "div",
        { class: "pwx-ben" },
        el("div", { class: "pwx-bico", html: icon(b.icon, 19) }),
        el("div", {}, el("div", { class: "pwx-bt", text: b.t }), el("div", { class: "pwx-bs", text: b.s })),
      ),
    );
  });

  // 과목 선택 — 담은 개수(1~3)가 곧 요금제
  const picked = new Set<string>([SELLABLE_SUBJECTS[0].id]);
  const count = el("span", { class: "pwx-scount" });
  const slabel = el("div", { class: "pwx-slabel" }, el("b", { text: "이용할 과목 고르기" }), count);
  const subs = el("div", { class: "pwx-subs", attrs: { role: "group", "aria-label": "이용할 과목 고르기" } });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });

  const chips = SELLABLE_SUBJECTS.map((s) => {
    const chip = el(
      "button",
      { class: "pwx-sub", attrs: { type: "button", "aria-pressed": "false" } },
      el("span", { class: "pwx-sico", html: icon(s.icon, 18) }),
      el("span", { text: s.name }),
      el("span", { class: "pwx-ck", html: icon("check", 12), attrs: { "aria-hidden": "true" } }),
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
        if (picked.size >= MAX_PLAN) {
          haptic(HAPTIC.tap);
          helper.textContent = `한 번에 ${MAX_PLAN}과목까지 담을 수 있어요. 전과목 이용권은 준비 중이에요!`;
          return;
        }
        picked.add(s.id);
      }
      haptic(HAPTIC.tap);
      helper.textContent = "";
      refresh(true);
    });
    return { id: s.id, chip };
  });
  chips.forEach((c) => subs.appendChild(c.chip));
  const hint = el("div", { class: "pwx-hint", text: "과목을 담을수록 과목당 가격이 내려가요" });

  // 요금 사다리 — 현재 담은 과목 수 칸이 밝혀진다(스크린리더에는 합계 카드가 대신 읽힌다)
  const tiers = el("div", { class: "pwx-tiers", attrs: { "aria-hidden": "true" } });
  const tierEls = PLAN_TIERS.map((t) => {
    const tile = el(
      "div",
      { class: "pwx-tier" },
      el("span", { class: "tn", text: `${t.n}과목` }),
      el("span", { class: "tp", text: won(t.price) }),
      el("span", { class: t.n === 1 ? "ts" : "ts save", text: t.n === 1 ? "" : `${won(saveOf(t.n))} 절약` }),
    );
    tiers.appendChild(tile);
    return tile;
  });

  // 합계 카드
  const amount = el("div", { class: "pw-amount" });
  const note = el("div", { class: "pw-note" });
  const save = el("div", { class: "pwx-save" });
  const price = el(
    "div",
    { class: "pwx-price" },
    el("div", { class: "pwx-pbadge", html: icon("crown", 13) + "<span>평생 이용권</span>" }),
    amount,
    note,
    save,
  );
  const fine = el("div", {
    class: "pwx-fine",
    text: "표시 가격은 부가세 포함 정가예요 · 미성년자는 보호자 동의 후 결제해 주세요",
  });

  function refresh(pop = false): void {
    const n = picked.size;
    const t = tierOf(n);
    chips.forEach((c) => {
      const on = picked.has(c.id);
      c.chip.classList.toggle("on", on);
      c.chip.setAttribute("aria-pressed", String(on));
    });
    count.textContent = `${n}과목 선택`;
    tierEls.forEach((tile, i) => tile.classList.toggle("on", PLAN_TIERS[i].n === n));
    amount.textContent = won(t.price);
    note.textContent =
      n === 1 ? "한 번 결제하면 평생 이용해요" : `과목당 ${won(Math.round(t.price / n))} · 한 번 결제하면 평생 이용해요`;
    const saved = saveOf(n);
    save.style.display = saved > 0 ? "" : "none";
    save.textContent = saved > 0 ? `따로 살 때보다 ${won(saved)} 아껴요` : "";
    if (pop) {
      amount.classList.remove("pwx-pop");
      void amount.offsetWidth;
      amount.classList.add("pwx-pop");
    }
  }
  refresh();

  const cta = el("button", { class: "btn gold", text: "프리미엄 시작하기" });
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

  const body = el("div", { class: "scroll pad pw-body" }, hero, bens, slabel, subs, hint, tiers, price, fine, helper);
  const footer = el("div", { class: "footer" }, cta, restore);
  const elm = el("section", { class: "screen" }, head, body, footer);
  return { el: elm };
}
