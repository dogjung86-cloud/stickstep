// 페이월 — 프리미엄 레슨 진입 시 전면 안내. 토스식 결제 카드 + 혜택 리스트.
// 실제 결제는 core/purchase.ts(현재 스텁, 출시 시 IAP 교체)가 담당한다.
import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { buyPremium, restorePurchase, PREMIUM_PRICE_LABEL } from "../core/purchase";
import { BRAND } from "../core/brand";
import type { Screen } from "../core/router";

const BENEFITS = [
  { icon: "flask", t: "모든 랩·시뮬레이션 무제한", s: "전 단원의 프리미엄 레슨이 전부 열려요" },
  { icon: "route", t: "중1·중2 전체 커리큘럼", s: "새로 나오는 단원도 바로 이용해요" },
  { icon: "trophy", t: "대단원 정복 문제 세트", s: "시험 대비 총정리까지 한 번에" },
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
          ? `‘${opts.lessonTitle}’를 포함한 모든 프리미엄 레슨을 열 수 있어요.`
          : "모든 프리미엄 레슨을 잠금 해제해요."),
    }),
  );

  const list = el("div", { class: "pw-benefits" });
  BENEFITS.forEach((b) => {
    list.appendChild(
      el(
        "div",
        { class: "pw-item" },
        el("div", { class: "pw-ico", html: icon(b.icon, 20) }),
        el("div", {}, el("div", { class: "pw-t", text: b.t }), el("div", { class: "pw-s", text: b.s })),
      ),
    );
  });

  const price = el(
    "div",
    { class: "pw-price" },
    el("div", { class: "pw-badge", text: "평생 이용권" }),
    el("div", { class: "pw-amount", text: PREMIUM_PRICE_LABEL }),
    el("div", { class: "pw-note", text: "한 번 결제하면 계속 이용할 수 있어요" }),
  );

  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });

  const cta = el("button", { class: "btn gold", text: "프리미엄 시작하기" });
  cta.addEventListener("click", async () => {
    haptic(HAPTIC.tap);
    cta.disabled = true;
    const r = await buyPremium();
    if (r === "ok") {
      haptic(HAPTIC.done);
      opts.onUnlocked();
    } else {
      cta.disabled = false;
      helper.textContent = "앱 스토어 출시 후 결제할 수 있어요. 조금만 기다려 주세요!";
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

  const body = el("div", { class: "scroll pad pw-body" }, hero, list, price, helper);
  const footer = el("div", { class: "footer" }, cta, restore);
  const elm = el("section", { class: "screen" }, head, body, footer);
  return { el: elm };
}
