// 하단 글로벌 탭바 — 학습(홈)·복습·도전·마이 4개 최상위 화면 공용(2026-07-12 IA 개편).
// 탭 전환은 main.ts의 goTab(nav.reset)이 담당 — 여기서는 콜백만 쏜다. 활성 탭 재탭은 무시.

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";

export type GnavKey = "home" | "review" | "challenge" | "my";

const ITEMS: { key: GnavKey; label: string; ic: Parameters<typeof icon>[0] }[] = [
  { key: "home", label: "학습", ic: "route" },
  { key: "review", label: "복습", ic: "book" },
  { key: "challenge", label: "도전", ic: "trophy" },
  { key: "my", label: "마이", ic: "user" },
];

export function gnav(active: GnavKey, go: (k: GnavKey) => void): HTMLElement {
  const bar = el("nav", { class: "gnav", attrs: { "aria-label": "주 메뉴" } });
  for (const it of ITEMS) {
    const on = it.key === active;
    const b = el(
      "button",
      { class: `gnav-item ${on ? "on" : ""}`, attrs: on ? { "aria-current": "page" } : {} },
      el("span", { class: "gnav-ic", html: icon(it.ic, 21) }),
      el("span", { class: "gnav-tx", text: it.label }),
    );
    b.addEventListener("click", () => {
      if (it.key === active) return;
      haptic(HAPTIC.tap);
      go(it.key);
    });
    bar.appendChild(b);
  }
  return bar;
}
