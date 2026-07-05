// historyCase — 과학사 사례를 탐구 과정 단계에 매핑한 타임라인.
// 각 단계를 탭하면 내용이 드러나고, 모두 열면 CTA가 켜진다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface Stage { step: string; html: string; }
interface HistoryCaseStep {
  kicker?: string;
  title: string;
  lead?: string;
  scientist?: { name: string; years?: string };
  svg?: string;
  stages: Stage[];
  cta?: string;
}

export const historyCase: StepRenderer = (host, step, api) => {
  const s = step as unknown as HistoryCaseStep;
  if (s.kicker) {
    host.appendChild(el("div", { class: "kicker" }, el("span", { class: "kdot" }), el("span", { text: s.kicker })));
  }
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  if (s.scientist) {
    host.appendChild(
      el(
        "div",
        { class: "sci-chip" },
        s.svg ? el("div", { class: "sci-face", html: s.svg }) : el("span", {}),
        el(
          "div",
          {},
          el("div", { class: "sci-name", text: s.scientist.name }),
          s.scientist.years ? el("div", { class: "sci-years", text: s.scientist.years }) : el("span", {}),
        ),
      ),
    );
  }

  const line = el("div", { class: "timeline" });
  host.appendChild(line);
  const revealed = new Set<number>();

  s.stages.forEach((stage, i) => {
    const body = el("div", { class: "tl-body", html: stage.html });
    const node = el(
      "div",
      { class: "tl-node" },
      el(
        "button",
        { class: "tl-head" },
        el("span", { class: "tl-dot", text: String(i + 1) }),
        el("span", { class: "tl-step", text: stage.step }),
        el("span", { class: "tl-chev", html: "＋" }),
      ),
      body,
    );
    const head = node.querySelector(".tl-head") as HTMLElement;
    head.addEventListener("click", () => {
      const open = node.classList.toggle("open");
      (node.querySelector(".tl-chev") as HTMLElement).textContent = open ? "－" : "＋";
      if (open && !revealed.has(i)) {
        revealed.add(i);
        haptic(HAPTIC.select);
        if (revealed.size === s.stages.length) api.enableCTA(s.cta ?? "탐구 과정을 이해했어요");
      }
    });
    line.appendChild(node);
  });

  api.setCTA(s.cta ?? "각 단계를 눌러 펼쳐 보세요", { enabled: false });
};
