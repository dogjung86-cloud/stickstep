// 복습 탭 — 오답노트(지금 동작) + 취약 단원 문제 뽑기·질문하기(준비 중 카드).
// 취약 문제 뽑기는 오답노트의 lessonId·시험 진단과 같은 데이터가 근거라 오답노트와 한집에 산다
// (2026-07-12 IA 개편 — 마이페이지에 묻으면 발견성이 죽는다는 결론).

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { wrongNoteCount } from "../core/store";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function reviewScreen(o: { onTab: (k: GnavKey) => void; onOpenNotebook: () => void }): Screen {
  const { open, overcome } = wrongNoteCount();

  const nb = el(
    "button",
    { class: "nb-entry" },
    el("span", { class: "nb-entry-ic", html: icon("book", 18) }),
    el("span", { class: "nb-entry-t", text: "오답노트" }),
    el("span", { class: "nb-entry-n", text: open > 0 ? `${open}문항 대기` : overcome > 0 ? "전부 극복!" : "아직 비어 있어요" }),
    el("span", { class: "nb-entry-go", html: icon("chevron", 16) }),
  );
  nb.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onOpenNotebook();
  });

  function prepCard(ic: Parameters<typeof icon>[0], title: string, desc: string): HTMLElement {
    const card = el(
      "button",
      { class: "prep-card" },
      el("span", { class: "prep-ic", html: icon(ic, 20) }),
      el(
        "span",
        { class: "prep-tx" },
        el("b", {}, el("span", { text: title }), el("i", { class: "prep-pill", text: "준비 중" })),
        el("span", { class: "prep-desc", text: desc }),
      ),
    );
    card.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      snack("준비 중이에요 — 곧 열려요");
    });
    return card;
  }

  const elm = el(
    "section",
    { class: "screen tabscr", attrs: { id: "sc-review" } },
    el(
      "div",
      { class: "tab-head" },
      el("div", { class: "h1 sm", text: "복습" }),
      el("div", { class: "sub", text: "틀린 문제를 내 것으로 만드는 곳이에요." }),
    ),
    el(
      "div",
      { class: "scroll" },
      el(
        "div",
        { class: "pad" },
        nb,
        prepCard("target", "취약 단원 문제 뽑기", "많이 틀린 단원만 골라 맞춤 문제지를 만들어요"),
        prepCard("bulb", "질문하기", "막힌 문제를 사진과 함께 바로 물어봐요"),
        el("div", { class: "tab-footnote", text: "복습으로 다시 맞힌 문제는 오답노트에서 자동으로 극복 처리돼요." }),
      ),
    ),
    gnav("review", o.onTab),
  );

  let snackTimer = 0;
  const snackEl = el("div", { class: "snack" });
  elm.appendChild(snackEl);
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

  return { el: elm };
}
