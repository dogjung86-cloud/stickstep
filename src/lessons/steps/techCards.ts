// techCards — 첨단 과학기술 뒤집기 카드. 탭하면 정의·사례가 드러난다.

import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface Card { name: string; icon: string; def: string; example: string; }
interface TechCardsStep { title: string; lead?: string; cards: Card[]; cta?: string; }

export const techCards: StepRenderer = (host, step, api) => {
  const s = step as unknown as TechCardsStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const grid = el("div", { class: "flip-grid" });
  host.appendChild(grid);
  const flipped = new Set<number>();

  s.cards.forEach((card, i) => {
    const front = el(
      "div",
      { class: "flip-face flip-front" },
      el("div", { class: "flip-ic", html: icon(card.icon, 26) }),
      el("div", { class: "flip-name", text: card.name }),
      el("div", { class: "flip-hint", text: "탭해서 알아보기" }),
    );
    const back = el(
      "div",
      { class: "flip-face flip-back" },
      el("div", { class: "flip-def", html: card.def }),
      el("div", { class: "flip-ex" }, el("span", { class: "flip-ex-k", text: "예" }), el("span", { html: card.example })),
    );
    const cardEl = el("button", { class: "flip-card" }, el("div", { class: "flip-inner" }, front, back));
    cardEl.addEventListener("click", () => {
      const isFlip = cardEl.classList.toggle("flipped");
      haptic(HAPTIC.tap);
      if (isFlip && !flipped.has(i)) {
        flipped.add(i);
        if (flipped.size === s.cards.length) api.enableCTA(s.cta ?? "모두 살펴봤어요");
      }
    });
    grid.appendChild(cardEl);
  });

  api.setCTA(s.cta ?? "카드를 뒤집어 보세요", { enabled: false });
};
