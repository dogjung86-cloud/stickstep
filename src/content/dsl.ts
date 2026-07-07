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
  spots: { x: number; y: number; label: string; desc?: string; photo?: string; photoCredit?: string }[];
  mode?: "reveal" | "find"; explainGood?: string; explainBad?: string;
}): Step => ({ type: "hotspot", ...o });

export const hook = (o: {
  title: string; lead?: string; narrator: string; done?: string;
  scene: "cups" | "egg" | "beach" | "wire" | "smell" | "juice" | "wrap" | "ramen"
    | "balloon" | "tugrope" | "bow" | "iceslip" | "bottle" | "rollstop"
    | "polar" | "bubblewrap" | "foilballoon" | "pingpong"
    | "stargaze" | "planetsize" | "shadowclock" | "moonpic" | "sunglasses"
    | "colorcups" | "speaker" | "smokestack"
    | "cellzoom" | "stain" | "bodycount" | "ladybugs" | "batbird" | "foodweb"
    | "mirrortown" | "coinmagic" | "darkroom" | "catmirror" | "spoon" | "pointillism" | "fishing" | "kalimba";
  choices?: string[]; cta?: string;
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

/** 랩 공통 옵션 — curio: "교과서엔 없지만 궁금한 질문" 카드(ui/curio.ts). */
export type CurioOpt = { q: string; a: string };

export const conduction = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "conduction", ...o });

export const convection = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "convection", ...o });

export const radiation = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "radiation", ...o });

export const specificHeat = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "specificHeat", ...o });

export const expansion = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "expansion", ...o });

// ── 물질의 상태 변화 단원(IV) 랩 ────────────────────────────
export const diffusion = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "diffusion", ...o });

export const evaporation = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "evaporation", ...o });

export const matterTemp = (o: {
  title: string; lead?: string; goalBoil?: number; goalFreeze?: number; cta?: string;
}): Step => ({ type: "matterTemp", ...o });

export const matterShape = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "matterShape", ...o });

export const matterCompare = (o: { title: string; lead?: string; note?: string; cta?: string }): Step =>
  ({ type: "matterCompare", ...o });

export const phaseNames = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "phaseNames", ...o });

export const sublimation = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "sublimation", ...o });

export const phaseVolume = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "phaseVolume", ...o });

export const heatCurve = (o: { title: string; lead?: string; mode?: "heat" | "cool"; cta?: string }): Step =>
  ({ type: "heatCurve", ...o });

// ── 힘의 작용 단원(V) 랩 ───────────────────────────────────
export const springLab = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "springLab", ...o });

export const tugOfWar = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "tugOfWar", ...o });

export const gravityDrop = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "gravityDrop", ...o });

export const frictionPush = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "frictionPush", ...o });

export const buoyancyLab = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "buoyancyLab", ...o });

export const forceStudio = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "forceStudio", ...o });

export const windSoccer = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "windSoccer", ...o });

// ── 기체 단원(VI) 랩 ────────────────────────────────────────
export const gasPressure = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "gasPressure", ...o });
export const boyleSyringe = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "boyleSyringe", ...o });
export const diverBubble = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "diverBubble", ...o });
export const charlesSyringe = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "charlesSyringe", ...o });
export const hotairRide = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "hotairRide", ...o });

// ── 태양계 단원(VII) 랩 ─────────────────────────────────────
export const solarTour = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "solarTour", ...o });
export const sunLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sunLab", ...o });
export const skyDaily = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "skyDaily", ...o });
export const zodiacRing = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "zodiacRing", ...o });
export const moonPhase3d = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "moonPhase3d", ...o });
export const eclipse3d = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "eclipse3d", ...o });

// ── 중2 III 빛과 파동 랩 ────────────────────────────────────
export const reflectLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "reflectLab", ...o });
export const diffuseLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "diffuseLab", ...o });
export const refractLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "refractLab", ...o });
export const seeLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "seeLab", ...o });
export const mirrorImageLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "mirrorImageLab", ...o });
export const mirrorLens = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "mirrorLens", ...o });
export const objectColorLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "objectColorLab", ...o });
export const colorMixLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "colorMixLab", ...o });
export const pixelLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "pixelLab", ...o });
export const waveLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "waveLab", ...o });
export const soundLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "soundLab", ...o });

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
