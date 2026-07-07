// labExplain — 랩 아래 "천천히 보는 개념 정리" 카드.
// 빠르게 움직이는 실험(파동·소리 합성 등)이 흘려보내는 개념을
// 정지 그림 + 용어 행으로 붙잡아 준다. waveLab·soundLab이 사용.

import { el } from "../core/dom";

export interface ExplainRow {
  /** 행 왼쪽 미니 그래프(SVG 문자열) — dot와 택1 */
  svg?: string;
  /** 행 왼쪽 색 점 — svg가 없을 때 용어 색 표시 */
  dot?: string;
  name: string;
  desc: string;
}

export function labExplain(o: {
  kicker: string;
  tone?: string;
  lead?: string;
  /** 카드 상단 큰 정지 그림(SVG 문자열) */
  fig?: string;
  rows: ExplainRow[];
}): HTMLElement {
  const box = el("div", { class: "lab-explain" });
  box.appendChild(el("div", { class: "lx-kicker", text: o.kicker, style: o.tone ? `color:${o.tone}` : "" }));
  if (o.lead) box.appendChild(el("div", { class: "lx-lead", html: o.lead }));
  if (o.fig) box.appendChild(el("div", { class: "lx-fig", html: o.fig }));
  for (const r of o.rows) {
    const row = el("div", { class: "lx-row" });
    if (r.svg) row.appendChild(el("div", { class: "lx-mini", html: r.svg }));
    else if (r.dot) row.appendChild(el("span", { class: "lx-dot", style: `background:${r.dot}` }));
    row.appendChild(el("div", { class: "lx-txt" }, el("b", { html: r.name }), el("p", { html: r.desc })));
    box.appendChild(row);
  }
  return box;
}
