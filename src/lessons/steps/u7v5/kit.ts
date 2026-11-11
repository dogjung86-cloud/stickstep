// 중1 Ⅶ v5 랩의 공용 부품. 뼈대는 Ⅱ단원과 같은 bvFrame(../bio6/b6Lab)이고, 여기에는 이 단원만 쓰는 것을 둔다.
//   u7Frame : 뼈대를 놓고 단원 클래스(.u7x-step)를 붙인다(색과 치수는 styles/u7v5.css가 이 클래스 아래에서만 바꾼다).
//   u7Goals : 찾을 것 목록(누르는 버튼이 아니다. 찾으면 체크와 이름이 붙는다). 조작 칸에 놓는다.
//   u7Dev   : 검사 도구가 3D 무대를 좌표 없이 움직이는 손잡이. 개발 서버에서만 붙는다.
import { el } from "../../../core/dom";
import { bvFrame, type BvFrame } from "../bio6/b6Lab";
import type { StepAPI } from "../../types";

export function u7Frame(host: HTMLElement, o: { title: string; steps: number; cls: string; api: Pick<StepAPI, "setCTA"> }): BvFrame {
  host.classList.add("u7x-step");
  return bvFrame(host, { title: o.title, steps: o.steps, cls: `u7x-stage ${o.cls}`, qCls: "u7x-q", api: o.api });
}

export interface U7Goals {
  el: HTMLElement;
  /** 찾았다: 체크를 붙이고 아래 글을 바꾼다. 이미 찾은 것이면 false. */
  done(id: string, sub?: string): boolean;
  has(id: string): boolean;
  count(): number;
  total: number;
}

export function u7Goals(cols: number, items: { id: string; name: string; sub: string }[]): U7Goals {
  const found = new Set<string>();
  const chips = new Map<string, { chip: HTMLElement; sub: HTMLElement }>();
  const row = el("div", { class: "u7x-goals" });
  row.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  for (const it of items) {
    const sub = el("i", { text: it.sub });
    const chip = el("div", { class: "u7x-goal", dataset: { g: it.id } }, el("b", { text: it.name }), sub);
    chips.set(it.id, { chip, sub });
    row.appendChild(chip);
  }
  return {
    el: row,
    total: items.length,
    done(id, sub) {
      const c = chips.get(id);
      if (!c || found.has(id)) return false;
      found.add(id);
      c.chip.classList.add("done");
      if (sub) c.sub.textContent = sub;
      return true;
    },
    has: (id) => found.has(id),
    count: () => found.size,
  };
}

/** 개발 서버에서만: 스텝 요소에 검사용 손잡이를 단다(운영 번들에는 없다). */
export function u7Dev(host: HTMLElement, hooks: Record<string, (...a: number[]) => void>): void {
  if (import.meta.env.DEV) (host as unknown as { __u7?: unknown }).__u7 = hooks;
}
