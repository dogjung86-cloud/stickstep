// concept — 개념 설명(읽기) 스텝. 제목 + 리드 + 블록들.
import { el } from "../../core/dom";
import { renderBlocks, type Block } from "../../ui/blocks";
import type { StepRenderer } from "../types";

interface ConceptStep {
  kicker?: string;
  kickerTone?: "blue" | "bio" | "heat";
  title: string;
  lead?: string;
  blocks?: Block[];
  cta?: string;
}

export const concept: StepRenderer = (host, step, api) => {
  const s = step as unknown as ConceptStep;
  if (s.kicker) {
    host.appendChild(
      el(
        "div",
        { class: `kicker ${s.kickerTone === "bio" ? "bio" : s.kickerTone === "heat" ? "heat" : ""}` },
        el("span", { class: "kdot" }),
        el("span", { text: s.kicker }),
      ),
    );
  }
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));
  if (s.blocks) renderBlocks(host, s.blocks);
  api.setCTA(s.cta ?? "다음", { enabled: true, onClick: api.next });
};
