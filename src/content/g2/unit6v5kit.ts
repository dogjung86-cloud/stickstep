// 중2 Ⅵ v5 내용 파일들이 함께 쓰는 저작 도구(랩 팩토리, 개념 스텝, 문제 구간 바꾸기). dsl.ts를 고치지 않고 여기에 둔다.
import type { Step } from "../../lessons/types";
import { concept } from "../dsl";

interface LabProps {
  title: string;
  cta?: string;
}
const lab = (type: string) => (o: LabProps): Step => ({ type, ...o }) as unknown as Step;
export const plateLab = lab("g2u6PlateLab");
export const benedictLab = lab("g2u6BenedictLab");
export const salivaLab = lab("g2u6SalivaLab");
export const enzymeLab = lab("g2u6EnzymeLab");
export const villiLab = lab("g2u6VilliLab");
export const heartLab = lab("g2u6HeartLab");
export const bloodLab = lab("g2u6BloodLab");
export const loopLab = lab("g2u6LoopLab");
export const chestLab = lab("g2u6ChestLab");
export const gasLab = lab("g2u6GasLab");
export const nephronLab = lab("g2u6NephronLab");
export const respLab = lab("g2u6RespLab");
export const teamLab = lab("g2u6TeamLab");

const warn = (msg: string): void => {
  if (import.meta.env.DEV) console.warn(`[v5] g2u6: ${msg}`);
};

/** 정리 뒤의 문제 구간을 새 배열로 바꾸고, 선택형 문항에 "몇 번째 / 모두 몇 개" 번호를 매긴다. */
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

export type Block = NonNullable<Parameters<typeof concept>[0]["blocks"]>[number];
export const term = (name: string, def: string): Block => ({ k: "term", name, def }) as Block;
export const note = (html: string, tone: "blue" | "amber" | "violet" = "amber"): Block => ({ k: "note", tone, html }) as Block;
/** 용어를 정의하는 개념 스텝. 컷은 싣지 않는다(그림 세션이 output/g2-v5/u6/concept-cuts.md 를 보고 그린 뒤 첫 블록으로 싣는다). */
export const words = (o: { title: string; lead: string; blocks: Block[]; cta: string }): Step => concept({ kicker: "과학 용어 정복하기", kickerTone: "body", ...o });

export const C = { rose: "#E23B4B", green: "#27864B", sky: "#3B9AE1", violet: "#7C6BFF", amber: "#F59F00", red: "#F04452", teal: "#12B886", blue: "#3182F6" };
