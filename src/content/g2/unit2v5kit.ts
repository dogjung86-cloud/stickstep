// 중2 Ⅱ v5 내용 파일들이 함께 쓰는 저작 도구(랩 팩토리, 용어 스텝, 문제 구간 바꾸기, 실사 그림).
import type { Step } from "../../lessons/types";
import { concept } from "../dsl";

/** 새 랩 스텝의 팩토리(dsl.ts를 고치지 않는다). */
export const lab = (type: string) => (o: { title: string; cta?: string }): Step => ({ type, ...o }) as unknown as Step;

const warn = (msg: string): void => {
  if (import.meta.env.DEV) console.warn(`[v5] g2u2: ${msg}`);
};

/** 정리 뒤의 문제 구간을 새 배열로 바꾼다. 선택형, OX, 복수 선택에는 "몇 번째 / 모두 몇 개" 번호를 다시 매긴다. */
export function problems(steps: Step[], next: Step[]): Step[] {
  let at = -1;
  steps.forEach((st, i) => {
    if (st.type === "recap") at = i;
  });
  if (at < 0) {
    warn("정리 스텝을 찾지 못해 문제를 바꾸지 않았다");
    return steps;
  }
  const of = next.filter((st) => st.type === "quiz").length;
  let n = 0;
  return [...steps.slice(0, at + 1), ...next.map((st) => (st.type === "quiz" ? ({ ...st, n: ++n, of } as Step) : st))];
}

type Block = NonNullable<Parameters<typeof concept>[0]["blocks"]>[number];
export const term = (name: string, def: string): Block => ({ k: "term", name, def }) as Block;
export const note = (html: string, tone: "blue" | "amber" | "violet" = "amber"): Block => ({ k: "note", tone, html }) as Block;
/** 용어를 정의하는 개념 스텝(컷은 싣지 않는다. 그림 세션이 output/g2-v5/u2/concept-cuts.md 를 보고 그린 뒤 싣는다). */
export const words = (o: { title: string; lead: string; blocks: Block[]; cta: string }): Step => concept({ kicker: "과학 용어 정복하기", kickerTone: "geo", ...o });

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const src = (path: string): string => `${IMG_BASE}geo/${path}`;
/** 실사 한 장(문제 그림). */
export const gimg = (path: string, alt: string): string => `<img src="${src(path)}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** 실사 여러 장을 나란히, 아래에 라벨. */
export const gset = (cells: [string, string, string][], cols = cells.length): string =>
  `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px">${cells
    .map(([p, alt, lab2]) => `<figure style="margin:0"><img src="${src(p)}" alt="${alt}" style="display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px"/><figcaption style="text-align:center;font-size:12.5px;font-weight:700;color:#4E5968;margin-top:5px">${lab2}</figcaption></figure>`)
    .join("")}</div>`;
/** 분류 문제의 칩에 넣는 작은 실사. */
export const gitem = (path: string, alt: string): string =>
  `<img src="${src(path)}" alt="${alt}" draggable="false" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:10px;pointer-events:none" />`;
