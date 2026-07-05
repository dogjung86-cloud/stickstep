// 콘텐츠 저작 DSL — 스텝을 간결하게 만드는 팩토리. type 문자열 오타를 막는다.
import type { Lesson, Step } from "../lessons/types";
import type { Block } from "../ui/blocks";

type Obj = Record<string, unknown>;

export const concept = (o: {
  kicker?: string;
  kickerTone?: "blue" | "bio" | "heat";
  title: string;
  lead?: string;
  blocks?: Block[];
  cta?: string;
}): Step => ({ type: "concept", ...o });

export const table = (o: {
  title?: string;
  lead?: string;
  head: string[];
  rows: (string | { v: string; strong?: boolean; dot?: string })[][];
  blocks?: Block[];
  cta?: string;
}): Step => ({ type: "table", ...o });

export const mcq = (o: {
  n?: number; of?: number; prompt: string; figure?: string; figureDark?: boolean;
  options: string[]; answer: number; explainGood?: string; explainBad?: string;
}): Step => ({ type: "quiz", mode: "mcq", ...o });

export const ox = (o: {
  n?: number; of?: number; prompt: string; figure?: string;
  answer: boolean; explainGood?: string; explainBad?: string;
}): Step => ({ type: "quiz", mode: "ox", ...o });

export const multi = (o: {
  n?: number; of?: number; prompt: string; figure?: string; figureDark?: boolean;
  options: string[]; answer: number[]; explainGood?: string; explainBad?: string;
}): Step => ({ type: "quiz", mode: "multi", ...o });

export const order = (o: {
  title: string; lead?: string; items: string[]; explainGood?: string; explainBad?: string;
}): Step => ({ type: "order", ...o });

export const binSort = (o: {
  title: string; lead?: string; instruction?: string;
  bins: { id: string; label: string; color?: string; hint?: string }[];
  items: { label: string; bin: string; svg?: string }[];
  explainGood?: string; explainBad?: string;
}): Step => ({ type: "binSort", ...o });

export const hotspot = (o: {
  title: string; lead?: string; svg: string; dark?: boolean;
  spots: { x: number; y: number; label: string; desc?: string }[];
  mode?: "reveal" | "find"; explainGood?: string; explainBad?: string;
}): Step => ({ type: "hotspot", ...o });

export const hook = (o: {
  title: string; lead?: string; narrator: string; done?: string;
  scene: "cups" | "egg" | "beach" | "wire"; choices?: string[]; cta?: string;
}): Step => ({ type: "hook", ...o });

export const recap = (o: {
  title: string; lead?: string; narrator?: string;
  cards: { name: string; text: string; color?: string; art?: string; examples?: string[]; more?: string }[];
  note?: { icon?: string; tone?: "gray" | "blue" | "bio" | "amber" | "violet"; title?: string; html: string };
  outro?: string; cta?: string;
}): Step => ({ type: "recap", ...o });

export const comic = (o: {
  title?: string; lead?: string; narrator?: string; cta?: string;
  panels: { img?: string; stage: string; title: string; caption: string; term?: { name: string; def: string } }[];
}): Step => ({ type: "comic", ...o });

// ── 열 단원(III) 랩 ──────────────────────────────────────────
export const heatParticles = (o: {
  title: string; lead?: string; goalHot?: number; goalCold?: number; cta?: string;
}): Step => ({ type: "heatParticles", ...o });

export const heatContact = (o: {
  title: string; lead?: string; hot?: number; cold?: number; cta?: string;
}): Step => ({ type: "heatContact", ...o });

export const conduction = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "conduction", ...o });

export const convection = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "convection", ...o });

export const radiation = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "radiation", ...o });

export const specificHeat = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "specificHeat", ...o });

export const expansion = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "expansion", ...o });

export const dataGraph = (o: Obj): Step => ({ type: "dataGraph", ...o });
export const historyCase = (o: Obj): Step => ({ type: "historyCase", ...o });
export const techCards = (o: Obj): Step => ({ type: "techCards", ...o });
export const orgLevels = (o: Obj): Step => ({ type: "orgLevels", ...o });
export const finchSim = (o: Obj): Step => ({ type: "finchSim", ...o });
export const microscope = (o: Obj): Step => ({ type: "microscope", ...o });
export const dichotomKey = (o: Obj): Step => ({ type: "dichotomKey", ...o });

export function lesson(l: Lesson): Lesson {
  return l;
}
