// 중2 Ⅳ 내용 파일들이 함께 쓰는 저작 도구(랩 팩토리, 개념 스텝, 문제 번호 매기기). dsl.ts를 고치지 않고 여기에 둔다.
import type { Step } from "../../lessons/types";
import { concept } from "../dsl";

interface LabProps {
  title: string;
  cta?: string;
}
const lab = (type: string) => (o: LabProps): Step => ({ type, ...o }) as unknown as Step;
export const waterLab = lab("g2u4WaterLab");
export const sortLab = lab("g2u4SortLab");
export const symbolLab = lab("g2u4SymbolLab");
export const cardLab = lab("g2u4CardLab");
export const formulaLab = lab("g2u4FormulaLab");
export const neutralLab = lab("g2u4NeutralLab");
export const kindLab = lab("g2u4KindLab");
export const tableLab = lab("g2u4TableLab");
export const alkaliLab = lab("g2u4AlkaliLab");
export const nobleLab = lab("g2u4NobleLab");
export const molLab = lab("g2u4MolLab");
export const ionLab = lab("g2u4IonLab");
export const canLab = lab("g2u4CanLab");
export const moveLab = lab("g2u4MoveLab");
export const poleLab = lab("g2u4PoleLab");

/** 문제 구간의 선택형 문항에 "몇 번째 / 모두 몇 개" 번호를 매긴다. */
export function problems(next: Step[]): Step[] {
  const of = next.filter((st) => st.type === "quiz").length;
  let n = 0;
  return next.map((st) => (st.type === "quiz" ? ({ ...st, n: ++n, of } as Step) : st));
}

export type Block = NonNullable<Parameters<typeof concept>[0]["blocks"]>[number];
export const term = (name: string, def: string): Block => ({ k: "term", name, def }) as Block;
export const note = (html: string, tone: "blue" | "amber" | "violet" = "amber"): Block => ({ k: "note", tone, html }) as Block;
/** 용어를 정의하는 개념 스텝. 컷은 내용 파일이 첫 블록으로 싣는다. */
export const words = (o: { title: string; lead: string; blocks: Block[]; cta: string }): Step => concept({ kicker: "과학 용어 정복하기", kickerTone: "atom" as "bio", ...o });

export const C = { green: "#7CB024", cyan: "#37B6D8", blue: "#3182F6", red: "#F04452", violet: "#8E5CF0", amber: "#F59F00" };
