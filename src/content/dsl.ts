// 콘텐츠 저작 DSL — 스텝을 간결하게 만드는 팩토리. type 문자열 오타를 막는다.
import type { Lesson, Step } from "../lessons/types";
import type { Block } from "../ui/blocks";

type Obj = Record<string, unknown>;

const RECAP_IMG_BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
/** recap '자세히'(more)용 발주 그림 임베드 — public/recap/<file>. 스타일은 .rc-more img가 담당. */
export const rimg = (file: string, alt: string): string =>
  `<img src="${RECAP_IMG_BASE}recap/${file}" alt="${alt}" loading="lazy" />`;

/** 컷 위 한글 말풍선(하이브리드 표준): 발주 이미지에 글자를 넣는 대신 앱이 얹는다.
 *  x·y는 이미지 기준 %(말풍선의 중심), flip이면 꼬리가 위를 향한다(인물 아래 배치용). */
export interface CutBubble {
  text: string;
  x: number;
  y: number;
  flip?: boolean;
}

/** 스틱맨 개념 컷(발주 만화 1컷) — public/<theme>/cuts/<name>.webp. concept의 첫 블록에 figure로 끼운다.
 *  중2 VII(elec)이 기준 구현. lazy 금지(.scroll 컨테이너에서 안 뜸 — CLAUDE.md 사고 14).
 *  bubbles를 주면 이미지 위에 위트 말풍선을 겹친다(글자 생성 리스크 없는 라스터+HTML 하이브리드). */
export const cut = (theme: string, name: string, alt: string, bubbles?: CutBubble[]): string => {
  const img = `<img src="${RECAP_IMG_BASE}${theme}/cuts/${name}.webp" alt="${alt}" style="display:block;width:100%;border-radius:12px"/>`;
  if (!bubbles?.length) return img;
  const bs = bubbles
    .map(
      (b) =>
        `<span class="cut-bubble${b.flip ? " flip" : ""}" style="left:${b.x}%;top:${b.y}%">${b.text}</span>`,
    )
    .join("");
  return `<span class="cutwrap">${img}${bs}</span>`;
};

export const concept = (o: {
  kicker?: string;
  kickerTone?: "blue" | "bio" | "heat" | "matter" | "force" | "gas" | "space" | "chem" | "geo" | "elec" | "num" | "star" | "alge" | "grph" | "geom" | "solid" | "data" | "calc" | "ineq";
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

// mcq/multi 보기는 렌더 시 표시 순서가 셔플된다(채점은 저작 인덱스 기준).
// ㄱㄴㄷ 조합·(가)(나)·①~⑤처럼 순서가 관례인 라벨형 보기만 shuffle: false로 고정한다.
export const mcq = (o: {
  n?: number; of?: number; prompt: string; figure?: string; figureDark?: boolean;
  options: string[]; answer: number; shuffle?: boolean; explainGood?: string; explainBad?: string;
}): Step => ({ type: "quiz", mode: "mcq", ...o });

export const ox = (o: {
  n?: number; of?: number; prompt: string; figure?: string;
  answer: boolean; explainGood?: string; explainBad?: string;
}): Step => ({ type: "quiz", mode: "ox", ...o });

export const multi = (o: {
  n?: number; of?: number; prompt: string; figure?: string; figureDark?: boolean;
  options: string[]; answer: number[]; shuffle?: boolean; explainGood?: string; explainBad?: string;
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
  title: string; lead?: string; svg: string; dark?: boolean; pad0?: boolean;
  spots: { x: number; y: number; label: string; desc?: string; photo?: string; photoCredit?: string; photoCap?: string }[];
  mode?: "reveal" | "find"; explainGood?: string; explainBad?: string;
}): Step => ({ type: "hotspot", ...o });

/** 그림 상태 전환(세그 탭 → 그림+설명 교체) — 교과서 "~할 때" 상태 비교 그림의 인터랙션판 */
export const figTabs = (o: {
  title: string; lead?: string;
  tabs: { name: string; art: string; cap: string }[];
  cta?: string;
}): Step => ({ type: "figTabs", ...o });

// ── 별과 우주 단원(중2 VIII) 랩 ─────────────────────────────
export const parallaxLab = (o: { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } }): Step =>
  ({ type: "parallaxLab", ...o });

export const starLight3d = (o: { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } }): Step =>
  ({ type: "starLight3d", ...o });

export const starColorLab = (o: { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } }): Step =>
  ({ type: "starColorLab", ...o });

export const balloonUniverse = (o: { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } }): Step =>
  ({ type: "balloonUniverse", ...o });

export const galaxy3d = (o: { title: string; lead?: string; cta?: string }): Step => ({ type: "galaxy3d", ...o });

export const hook = (o: {
  title: string; lead?: string; narrator: string; done?: string;
  scene: "cups" | "egg" | "beach" | "wire" | "smell" | "juice" | "wrap" | "ramen"
    | "balloon" | "tugrope" | "bow" | "iceslip" | "bottle" | "rollstop"
    | "polar" | "bubblewrap" | "foilballoon" | "pingpong"
    | "stargaze" | "planetsize" | "shadowclock" | "moonpic" | "sunglasses"
    | "colorcups" | "speaker" | "smokestack"
    | "cellzoom" | "stain" | "bodycount" | "fingerprint" | "batbird" | "foodweb"
    | "rings" | "deadsea" | "cocoa" | "fishmouth" | "gallium" | "milkzoom" | "soysauce" | "syrup" | "perfume"
    | "stripemount" | "foolsgold" | "dolstatue" | "bookcliff" | "pressrock" | "cappadocia" | "gravestone" | "puzzlemap" | "quakenews" | "eggearth"
    | "mirrortown" | "coinmagic" | "darkroom" | "catmirror" | "spoon" | "pointillism" | "fishing" | "kalimba"
    | "zoomtwo" | "signs" | "peekatom" | "menusort" | "springwater" | "magnetpull"
    | "wintershock" | "balloondoll" | "deadclock" | "brightpair" | "multitap" | "labelpeek" | "compasswire" | "ebike"
    | "thumbjump" | "nightroad" | "brightlie" | "gasflame" | "milkyband" | "orionblur" | "movingstar";
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
export const opticView = (o: { title: string; lead?: string; cta?: string }): Step =>
  ({ type: "opticView", ...o });
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

// ── 중2 IV 물질의 구성 랩 ───────────────────────────────────
export const elementLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "elementLab", ...o });
export const moleculeLab = (o: {
  title: string; lead?: string; cta?: string; curio?: CurioOpt;
  targets: { formula: string; name: string; comp: Record<string, number> }[];
  split?: boolean; palette?: string[];
}): Step => ({ type: "moleculeLab", ...o });
export const atomLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "atomLab", ...o });
export const periodicLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "periodicLab", ...o });
export const ionLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "ionLab", ...o });
export const ionMoveLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "ionMoveLab", ...o });
// ── 중2 전기와 자기 단원(g2 VII) 랩 ─────────────────────────
export const frictionLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "frictionLab", ...o });
export const rubLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rubLab", ...o });
export const inductionLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "inductionLab", ...o });
export const waterCircuit = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "waterCircuit", ...o });
export const ohmLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "ohmLab", ...o });
export const circuitLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "circuitLab", ...o });
export const coilFieldLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "coilFieldLab", ...o });
export const swingLab3d = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "swingLab3d", ...o });

export const pairMatch = (o: {
  title: string; lead?: string; aLabel?: string; bLabel?: string;
  pairs: { a: string; b: string }[]; cta?: string; explainGood?: string; explainBad?: string;
}): Step => ({ type: "pairMatch", ...o });
export const formulaLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "formulaLab", ...o });

// ── 중2 물질의 특성 단원(g2 I) 랩 ───────────────────────────
export const densityLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "densityLab", ...o });
export const densityPool = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "densityPool", ...o });
export const solubilityLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "solubilityLab", ...o });
export const gasFizz = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "gasFizz", ...o });
export const meltCurve = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "meltCurve", ...o });
export const sepFunnel = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sepFunnel", ...o });
export const recrystal = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "recrystal", ...o });
export const distillLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "distillLab", ...o });

// ── 중2 지권의 변화 단원(g2 II) 랩 ──────────────────────────
export const earthCut3d = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "earthCut3d", ...o });
export const streakLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "streakLab", ...o });
export const coolingLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "coolingLab", ...o });
export const strataLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "strataLab", ...o });
export const foliationLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "foliationLab", ...o });
export const rockCycle = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rockCycle", ...o });
export const driftLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "driftLab", ...o });
export const plateMap = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "plateMap", ...o });

export const dataGraph = (o: Obj): Step => ({ type: "dataGraph", ...o });
export const historyCase = (o: Obj): Step => ({ type: "historyCase", ...o });
export const techCards = (o: Obj): Step => ({ type: "techCards", ...o });
export const orgLevels = (o: Obj): Step => ({ type: "orgLevels", ...o });
export const finchSim = (o: Obj): Step => ({ type: "finchSim", ...o });
export const microscope = (o: Obj): Step => ({ type: "microscope", ...o });
export const dichotomKey = (o: Obj): Step => ({ type: "dichotomKey", ...o });
export const biodiversityLab = (o: Obj): Step => ({ type: "biodiversityLab", ...o });

export function lesson(l: Lesson): Lesson {
  return l;
}
