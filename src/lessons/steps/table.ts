// table — 개념 정리 표. 시험에 나오는 핵심을 한눈에.
import { el } from "../../core/dom";
import { renderBlocks, type Block } from "../../ui/blocks";
import type { StepRenderer } from "../types";

type Cell = string | { v: string; strong?: boolean; dot?: string };

interface TableStep {
  title?: string;
  lead?: string;
  head: string[];
  rows: Cell[][];
  blocks?: Block[];
  cta?: string;
}

export const table: StepRenderer = (host, step, api) => {
  const s = step as unknown as TableStep;
  if (s.title) host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const grid = `grid-template-columns:${s.head.map((_, i) => (i === 0 ? "1.05fr" : "1fr")).join(" ")}`;
  const tbl = el("div", { class: "tbl" });

  const thead = el("div", { class: "trow thead", style: grid });
  for (const h of s.head) thead.appendChild(el("div", { html: h }));
  tbl.appendChild(thead);

  for (const row of s.rows) {
    const tr = el("div", { class: "trow", style: grid });
    row.forEach((cell, i) => {
      if (typeof cell === "string") {
        tr.appendChild(el("div", { class: i === 0 ? "tstate" : "tv", html: cell }));
      } else if (i === 0) {
        const c = el("div", { class: "tstate" });
        if (cell.dot) c.appendChild(el("i", { style: `background:${cell.dot}` }));
        c.appendChild(el("span", { html: cell.v }));
        tr.appendChild(c);
      } else {
        tr.appendChild(el("div", { class: `tv ${cell.strong ? "keep" : ""}`, html: cell.v }));
      }
    });
    tbl.appendChild(tr);
  }
  host.appendChild(tbl);

  if (s.blocks) renderBlocks(host, s.blocks);
  api.setCTA(s.cta ?? "다음", { enabled: true, onClick: api.next });
};
