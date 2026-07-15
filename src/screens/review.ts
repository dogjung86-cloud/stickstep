// 복습 탭 — 오답노트 + 취약 단원 문제 뽑기(프리미엄, screens/weakDrill.ts) + 질문하기(준비 중 카드).
// 취약 문제 뽑기는 오답노트의 lessonId·시험 진단과 같은 데이터가 근거라 오답노트와 한집에 산다
// (2026-07-12 IA 개편 — 마이페이지에 묻으면 발견성이 죽는다는 결론).

import { el } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { wrongNoteCount, isPremium, isReviewMode } from "../core/store";
import { isTutorConfigured } from "../core/tutor";
import { gnav, type GnavKey } from "../ui/gnav";
import type { Screen } from "../core/router";

export function reviewScreen(o: {
  onTab: (k: GnavKey) => void;
  onOpenNotebook: () => void;
  onOpenDrill: () => void;
  onOpenTutor: () => void;
}): Screen {
  const { open, overcome } = wrongNoteCount();
  // 복습 탭 콘텐츠는 전부 프리미엄(2026-07-15 사용자 확정) — 잠금이면 골드 크라운 필만 표시하고
  // 게이트·페이월 안내는 main.ts(openNotebook·openWeakDrill·openTutor)가 담당한다.
  const locked = !isPremium() && !isReviewMode();
  const crown = (): HTMLElement => el("i", { class: "prep-pill gold", html: `${icon("crown", 11)}<span>프리미엄</span>` });

  const nb = el(
    "button",
    { class: "nb-entry" },
    el("span", { class: "nb-entry-ic", html: icon("book", 18) }),
    el("span", { class: "nb-entry-t", text: "오답노트" }),
    locked ? crown() : null,
    el("span", { class: "nb-entry-n", text: open > 0 ? `${open}문항 대기` : overcome > 0 ? "전부 해결!" : "아직 비어 있어요" }),
    el("span", { class: "nb-entry-go", html: icon("chevron", 16) }),
  );
  nb.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onOpenNotebook();
  });

  // 취약 단원 문제 뽑기
  const drillLocked = locked;
  const drill = el(
    "button",
    { class: "prep-card accent" },
    el("span", { class: "prep-ic", html: icon("target", 20) }),
    el(
      "span",
      { class: "prep-tx" },
      el(
        "b",
        {},
        el("span", { text: "취약 단원 문제 뽑기" }),
        drillLocked ? el("i", { class: "prep-pill gold", html: `${icon("crown", 11)}<span>프리미엄</span>` }) : null,
      ),
      el("span", { class: "prep-desc", text: "소단원을 직접 골라 나만의 맞춤 문제지를 만들어요" }),
    ),
    el("span", { class: "nb-entry-go", html: icon("chevron", 16) }),
  );
  drill.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    o.onOpenDrill();
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

  // 질문하기 — AI 튜터 키가 있으면 활성 카드(스틱쌤 채팅), 없으면 기존 "준비 중" 카드 그대로.
  let tutorCard: HTMLElement;
  if (isTutorConfigured()) {
    tutorCard = el(
      "button",
      { class: "prep-card accent" },
      el("span", { class: "prep-ic", html: icon("bulb", 20) }),
      el(
        "span",
        { class: "prep-tx" },
        el("b", {}, el("span", { text: "질문하기" }), locked ? crown() : el("i", { class: "prep-pill ai", text: "AI 베타" })),
        el("span", { class: "prep-desc", text: "막힌 문제를 사진 찍어 AI 튜터 스틱쌤에게 바로 물어봐요" }),
      ),
      el("span", { class: "nb-entry-go", html: icon("chevron", 16) }),
    );
    tutorCard.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      o.onOpenTutor();
    });
  } else {
    tutorCard = prepCard("bulb", "질문하기", "막힌 문제를 사진과 함께 바로 물어봐요");
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
        drill,
        tutorCard,
        el("div", { class: "tab-footnote", text: "복습으로 다시 맞힌 문제는 오답노트에서 자동으로 해결 처리돼요." }),
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
