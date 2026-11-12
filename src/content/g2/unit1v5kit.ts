// 중2 Ⅰ v5 내용 파일들이 함께 쓰는 도구: 새 랩 스텝의 팩토리, 문제 구간 바꾸기, 용어 카드.
// dsl.ts를 고치지 않고 이 파일 안에 둔다(중1 unit4v5.ts와 같은 방식).
import type { Step } from "../../lessons/types";
import type { Curio } from "../../ui/curio";
import { concept } from "../dsl";

interface LabProps {
  title: string;
  cta?: string;
  curio?: Curio;
  mode?: string;
}
const lab = (type: string) => (o: LabProps): Step => ({ type, ...o }) as unknown as Step;
export const measureLab = lab("g2u1MeasureLab");
export const sizeLab = lab("g2u1SizeLab");
export const layerLab = lab("g2u1LayerLab");
export const dissolveLab = lab("g2u1DissolveLab");
export const warmLab = lab("g2u1WarmLab");
export const fizzLab = lab("g2u1FizzLab");
export const pumpLab = lab("g2u1PumpLab");
export const meltLab = lab("g2u1MeltLab");
export const boilLab = lab("g2u1BoilLab");
export const saltLab = lab("g2u1SaltLab");
export const funnelLab = lab("g2u1FunnelLab");
export const seedLab = lab("g2u1SeedLab");
export const crystalLab = lab("g2u1CrystalLab");
export const distillLab5 = lab("g2u1DistillLab");

const warn = (msg: string): void => {
  if (import.meta.env.DEV) console.warn(`[v5] g2u1: ${msg}`);
};

/** 정리 뒤의 문제 구간을 새 배열로 바꾸고, 선택형 문제에 "몇 번째 / 모두 몇 개" 번호를 다시 매긴다. */
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
/** 용어를 정의하는 개념 스텝. 컷은 싣지 않는다(그림 세션이 output/g2-v5/u1/concept-cuts.md 를 보고 그린 뒤 싣는다). */
export const words = (o: { title: string; lead: string; blocks: Block[]; cta: string }): Step => concept({ kicker: "과학 용어 정복하기", kickerTone: "chem", ...o });
