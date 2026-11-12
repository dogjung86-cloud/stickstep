// 중2 Ⅴ 내용 파일들이 함께 쓰는 저작 도구(랩 팩토리, 개념 스텝, 문제 번호 매기기). dsl.ts를 고치지 않고 여기에 둔다.
import type { Step } from "../../lessons/types";
import { concept } from "../dsl";

interface LabProps {
  title: string;
  cta?: string;
}
const lab = (type: string) => (o: LabProps): Step => ({ type, ...o }) as unknown as Step;
export const scopeLab = lab("g2u5ScopeLab");
export const supplyLab = lab("g2u5SupplyLab");
export const sensorLab = lab("g2u5SensorLab");
export const starchLab = lab("g2u5StarchLab");
export const designLab = lab("g2u5DesignLab");
export const farmLab = lab("g2u5FarmLab");
export const darkLab = lab("g2u5DarkLab");
export const sproutLab = lab("g2u5SproutLab");
export const lightLab = lab("g2u5LightLab");
export const cycleLab = lab("g2u5CycleLab");
export const routeLab = lab("g2u5RouteLab");
export const storeLab = lab("g2u5StoreLab");

/** 정리 뒤의 문제 구간. 선택형 문항에 "몇 번째 / 모두 몇 개" 번호를 매긴다. */
export function problems(next: Step[]): Step[] {
  const of = next.filter((st) => st.type === "quiz").length;
  let n = 0;
  return next.map((st) => (st.type === "quiz" ? ({ ...st, n: ++n, of } as Step) : st));
}

export type Block = NonNullable<Parameters<typeof concept>[0]["blocks"]>[number];
export const term = (name: string, def: string): Block => ({ k: "term", name, def }) as Block;
export const note = (html: string, tone: "blue" | "amber" | "violet" = "amber"): Block => ({ k: "note", tone, html }) as Block;
/** 용어를 정의하는 개념 스텝. 컷은 싣지 않는다(그림 세션이 output/g2-v5/u5/concept-cuts.md 를 보고 그린 뒤 첫 블록으로 싣는다). */
export const words = (o: { title: string; lead: string; blocks: Block[]; cta: string }): Step => concept({ kicker: "과학 용어 정복하기", kickerTone: "plant", ...o });

export const C = { green: "#27864B", sky: "#3B9AE1", violet: "#7C6BFF", amber: "#F59F00", red: "#F04452", teal: "#12B886", blue: "#3182F6" };
