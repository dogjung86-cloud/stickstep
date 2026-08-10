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
  kickerTone?: "blue" | "bio" | "heat" | "matter" | "force" | "gas" | "space" | "chem" | "geo" | "plant" | "body" | "elec" | "num" | "star" | "alge" | "grph" | "geom" | "solid" | "data" | "calc" | "ineq" | "func" | "prove" | "sim" | "dice" | "world" | "his";
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
    // 중1 Ⅱ 재제작 훅 10종(hookBio2.ts) — 구작 6종과 이름이 겹치지 않는다
    | "celldot" | "slidepress" | "signalrun" | "blockflower" | "biomedoor"
    | "beakpick" | "batwho" | "noplant" | "seedvault" | "scalezoom"
    // 중1 Ⅱ v3 훅 8종(hookBio4.ts, 2026-08-10 재제작)
    | "breadfactory" | "waterlens" | "blooddrop" | "brickhouse"
    | "dokdofriends" | "martshelf" | "mushroomscan" | "beegone"
    | "rings" | "deadsea" | "cocoa" | "fishmouth" | "gallium" | "milkzoom" | "soysauce" | "syrup" | "perfume"
    | "stripemount" | "foolsgold" | "dolstatue" | "bookcliff" | "pressrock" | "cappadocia" | "gravestone" | "puzzlemap" | "quakenews" | "eggearth"
    | "mirrortown" | "coinmagic" | "darkroom" | "catmirror" | "spoon" | "pointillism" | "fishing" | "kalimba"
    | "zoomtwo" | "signs" | "peekatom" | "menusort" | "springwater" | "magnetpull"
    | "potmass" | "waterweed" | "windowplant" | "bedroomplant" | "germinating" | "fruitthinning"
    | "sproutpot" | "stomapeek" | "darkbox" | "mixedtest" | "greenhouse" | "mangrove" | "honeyflower"
    // 중2 Ⅴ v3 훅 5종(hookPlant3.ts, 2026-08-10 재제작) — 현행·v2 13종과 이름이 겹치지 않는다
    | "potatodrop" | "winterberry" | "veggiebag" | "tropicalnight" | "sweetpotato"
    // 중2 Ⅵ v3 훅 5장면(hookBody3.ts, 2026-08-10 재제작)
    | "bodyscan" | "dripbag" | "hiccup" | "peetest" | "warmbody"
    | "wintershock" | "balloondoll" | "deadclock" | "brightpair" | "multitap" | "labelpeek" | "compasswire" | "ebike"
    | "thumbjump" | "nightroad" | "brightlie" | "gasflame" | "milkyband" | "orionblur" | "movingstar"
    | "breadonly" | "chewrice" | "pulse" | "deepbreath" | "peecolor" | "afterrun"
    | "threecities" | "stilthouse" | "skyroute" | "avocado" | "maasai" | "ilovenyc"
    | "asiangames" | "monsoonrain" | "templetrip" | "halalmark" | "trainride" | "emptyclass" | "madein" | "fanchant"
    | "dawnsoccer" | "peakhike" | "frozenriver" | "cityfeed" | "skislope" | "trainborder" | "fourshirts"
    | "mappuzzle" | "satnile" | "herdmove" | "shadelane" | "movienight" | "classphoto" | "flagstars" | "greenline"
    | "searchamerica" | "panroad" | "quitopack" | "teamroster" | "dinnertable" | "fruitlogo" | "motorcity"
    | "newyearfirst" | "ulurumystery" | "santasurf" | "martorigin" | "trashisland" | "ploggingrun" | "stationwhy" | "arcticflags"
    | "twinstory" | "hiddenteacher" | "profileme" | "nametags" | "doubleday" | "vinestangle" | "dollshelf"
    | "wordhunt" | "greetmix" | "birthsoup" | "mycomment" | "mugwort" | "doorbell" | "siesta"
    | "seatwar" | "oneway" | "lotclass" | "hundredmen" | "kingnope" | "idiotword" | "uniformday"
    | "onevote" | "ruleposter" | "electletter" | "cablecar" | "schoolzone" | "bikename" | "yellowcarpet"
    | "morninglaw" | "goddess" | "twoloans" | "jarcourt" | "oddtrial" | "flipverdict"
    | "tenbook" | "schoolfree" | "seatbelt" | "dormrule" | "whoworker" | "teenwage"
    | "saveicon" | "gamechar" | "timecapsule" | "dangi" | "milmyeon"
    | "sprout" | "receipt" | "aptmap" | "parcel" | "olympic" | "romanclock" | "silkscarf"
    | "lambskewer" | "examnotice" | "kanasign" | "hanjahw" | "zeroscore" | "chessmate" | "arabnum" | "francejersey" | "pepper"
    | "penmotto" | "banknote" | "gercamp" | "chilikimchi" | "shogungame" | "tajphoto" | "coffeesign" | "frychoco" | "assembly";
  choices?: string[]; cta?: string;
}): Step => ({ type: "hook", ...o });

export const recap = (o: {
  title: string; lead?: string; narrator?: string;
  cards: { name: string; text: string; color?: string; art?: string; examples?: string[]; more?: string }[];
  note?: { icon?: string; tone?: "gray" | "blue" | "bio" | "amber" | "violet"; title?: string; html: string };
  outro?: string; cta?: string;
}): Step => ({ type: "recap", ...o });

// comic panels[].bubbles = CutBubble 하이브리드(발주 컷엔 연기만, 앱이 한글 말풍선을 얹는다).
// 컷당 1~2개·한 풍선 20자 안쪽, 사건 설명은 캡션 몫 — 역사 트랙이 파일럿(하위 호환: 없으면 기존 그대로).
export const comic = (o: {
  title?: string; lead?: string; narrator?: string; cta?: string;
  panels: { img?: string; stage: string; title: string; caption: string; term?: { name: string; def: string }; bubbles?: CutBubble[] }[];
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

// ── 중2 V 식물과 에너지 랩 ──────────────────────────────────
export const leafFactoryLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "leafFactoryLab", ...o });
export const photoEvidenceLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "photoEvidenceLab", ...o });
export const photoFactorLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "photoFactorLab", ...o });
export const plantRespireLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "plantRespireLab", ...o });
export const dayNightLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "dayNightLab", ...o });
export const sugarJourneyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sugarJourneyLab", ...o });
// ── 중2 Ⅴ 식물과 에너지 랩(v2 — 전면 재제작, steps/plant2/*) ──
export const leafZoomLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "leafZoomLab", ...o });
export const photoBuildLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "photoBuildLab", ...o });
export const gasSensorLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "gasSensorLab", ...o });
export const iodineTestLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "iodineTestLab", ...o });
export const photoDesignLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "photoDesignLab", ...o });
export const photoCurveLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "photoCurveLab", ...o });
export const dayNightGasLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "dayNightGasLab", ...o });
export const sugarFlowLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sugarFlowLab", ...o });

// ── 중2 VI 동물과 에너지 랩 ─────────────────────────────────
export const nutrientTestLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "nutrientTestLab", ...o });
export const digestJourneyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "digestJourneyLab", ...o });
export const circulationLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "circulationLab", ...o });
export const breathModelLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "breathModelLab", ...o });
export const nephronLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "nephronLab", ...o });
export const bodyIntegrateLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "bodyIntegrateLab", ...o });

// ── 중2 Ⅵ 동물과 에너지(g2u6, 2026-07-25 재제작) ─────────────
// 훅은 과학 hook.ts와 분리된 독립 타입 `animalHook`(steps/hookAnimal.ts)을 쓴다.
export type AnimalScene =
  | "lunchtray" | "mysterytube" | "cellgate" | "pineapple" | "foldtowel" | "pulsecheck"
  | "spintube" | "twoloop" | "holdbreath" | "windowair" | "saltysnack" | "afterswim";

export const animalHook = (o: {
  title: string; lead?: string; narrator: string; done?: string;
  scene: AnimalScene; choices?: string[]; cta?: string;
}): Step => ({ type: "animalHook", ...o });

type AnLabOpt = { title: string; lead?: string; cta?: string; curio?: CurioOpt };
export const anMealLab = (o: AnLabOpt): Step => ({ type: "anMealLab", ...o });
export const anReagentLab = (o: AnLabOpt): Step => ({ type: "anReagentLab", ...o });
export const anOrganLab = (o: AnLabOpt): Step => ({ type: "anOrganLab", ...o });
export const anEnzymeLab = (o: AnLabOpt): Step => ({ type: "anEnzymeLab", ...o });
export const anVilliLab = (o: AnLabOpt): Step => ({ type: "anVilliLab", ...o });
export const anHeartLab = (o: AnLabOpt): Step => ({ type: "anHeartLab", ...o });
export const anBloodLab = (o: AnLabOpt): Step => ({ type: "anBloodLab", ...o });
export const anPathLab = (o: AnLabOpt): Step => ({ type: "anPathLab", ...o });
export const anBreathLab = (o: AnLabOpt): Step => ({ type: "anBreathLab", ...o });
export const anGasSwapLab = (o: AnLabOpt): Step => ({ type: "anGasSwapLab", ...o });
export const anNephronLab = (o: AnLabOpt): Step => ({ type: "anNephronLab", ...o });
export const anEnergyLab = (o: AnLabOpt): Step => ({ type: "anEnergyLab", ...o });

// ── 중2 전기와 자기 단원(g2 VII) 랩 ─────────────────────────
export const frictionLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "frictionLab", ...o });
export const rubLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rubLab", ...o });
export const inductionLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "inductionLab", ...o });
export const waterCircuit = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "waterCircuit", ...o });
// 3D 판(현행). 위 2D 판은 원본 보존용으로 남겨 둔다.
export const waterCircuit3d = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "waterCircuit3d", ...o });
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

// ── 사회 Ⅰ 세계화 시대, 지리의 힘 랩 ────────────────────────
export const worldPlaceLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "worldPlaceLab", ...o });
export const latSunLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "latSunLab", ...o });
export const connectLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "connectLab", ...o });
export const tableLinkLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "tableLinkLab", ...o });
export const regionPlaceLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt; continent?: string }): Step =>
  ({ type: "regionPlaceLab", ...o });
export const monsoonLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "monsoonLab", ...o });
export const pyramidLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "pyramidLab", ...o });
export const westWindLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "westWindLab", ...o });

// ── 역사 트랙 랩 — 연표 문법 1호(timelineLab, 파라미터형: Ⅱ~Ⅶ이 defId만 바꿔 재사용) ──
export const timelineLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt; defId: string }): Step =>
  ({ type: "timelineLab", ...o });
export const rainBeltLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rainBeltLab", ...o });
export const highlandLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "highlandLab", ...o });
export const seasonLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "seasonLab", ...o });
export const shipRaceLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "shipRaceLab", ...o });

// ── 사회 일반사회 문법(Ⅶ에서 확립 — Ⅷ~Ⅻ 재사용): 데이터는 ui/judgeKit.ts가 단일 진실 공급원 ──
export const judgeLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt; judge: string }): Step =>
  ({ type: "judgeLab", ...o });
export const dilemmaLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt; dilemma: string }): Step =>
  ({ type: "dilemmaLab", ...o });
export const lifePathLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "lifePathLab", ...o });
// 사회 Ⅷ 전용 랩 3종(문화의 속성 릴레이·팩트체크·손님상) — 데이터 내장형(judgeKit 밖)
export const kimchiLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "kimchiLab", ...o });
export const factLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "factLab", ...o });
export const feastLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "feastLab", ...o });
// 사회 Ⅸ 전용 기함 랩 2종(참정권 타임라인·민주주의 원리 릴레이) — 데이터 내장형(judgeKit 밖)
export const suffrageLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "suffrageLab", ...o });
export const principleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "principleLab", ...o });
// 사회 Ⅹ 전용 신작 기함 2종(데이터 내장형 — 선거 6단계 릴레이·정치과정 5단계+환류 릴레이)
export const electLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "electLab", ...o });
export const policyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "policyLab", ...o });
// 사회 Ⅺ 전용 신작 기함 2종(데이터 내장형 — 민사·형사 절차 릴레이·공정한 재판 4제도 반사실 릴레이)
export const trialLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "trialLab", ...o });
export const fairTrialLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "fairTrialLab", ...o });
export const shieldLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "shieldLab", ...o });
export const workRightLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "workRightLab", ...o });

// ── 중1 Ⅱ 생물의 구성과 다양성 랩 11종(2026-07-25 재제작) ────────────
// 전부 같은 계약: { title, lead?, cta?, curio? }. 구작 랩(orgLevels·finchSim·microscope·
// dichotomKey·biodiversityLab)은 아래 Obj 팩토리로 보존만 하고 새 단원에선 쓰지 않는다.
export const cellScaleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "cellScaleLab", ...o });
export const cellFactoryLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "cellFactoryLab", ...o });
/** 동물세포·식물세포를 나란히 놓고 공통점·차이점을 찾는 비교 랩(실사용 피드백 2026-07-25). */
export const cellCompareLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "cellCompareLab", ...o });
export const microscopeLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "microscopeLab", ...o });
export const cellJobLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "cellJobLab", ...o });
export const orgLadderLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "orgLadderLab", ...o });
export const diversityLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "diversityLab", ...o });
/** L7 기함 — 변이 → 환경 적응 → 종 분화를 집단 분포의 이동으로 보여 준다. */
export const finchIslandLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "finchIslandLab", ...o });
export const classifyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "classifyLab", ...o });
export const rankLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rankLab", ...o });
export const kingdomKeyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "kingdomKeyLab", ...o });
export const webStabilityLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "webStabilityLab", ...o });

// ── 중1 Ⅱ 생물의 구성과 다양성 v3 랩 9종(2026-08-10 재제작 — steps/bio4/*) ──
// 병행 배선(unit2v3.ts + ss.u2v3 토글) 전용 — 현행 unit2 계열과 이름이 겹치지 않는다.
type B4LabOpt = { title: string; lead?: string; cta?: string; curio?: CurioOpt };
export const zoomRulerLab = (o: B4LabOpt): Step => ({ type: "zoomRulerLab", ...o });
export const slideMakeLab = (o: B4LabOpt): Step => ({ type: "slideMakeLab", ...o });
export const shapeJobLab = (o: B4LabOpt): Step => ({ type: "shapeJobLab", ...o });
export const lifeStackLab = (o: B4LabOpt): Step => ({ type: "lifeStackLab", ...o });
export const ecoScanLab = (o: B4LabOpt): Step => ({ type: "ecoScanLab", ...o });
export const beakIslandsLab = (o: B4LabOpt): Step => ({ type: "beakIslandsLab", ...o });
export const groupRuleLab = (o: B4LabOpt): Step => ({ type: "groupRuleLab", ...o });
export const kingdomGateLab = (o: B4LabOpt): Step => ({ type: "kingdomGateLab", ...o });
export const webDropLab = (o: B4LabOpt): Step => ({ type: "webDropLab", ...o });

// ── 중2 Ⅴ 식물과 에너지 v3 랩 7종(2026-08-10 재제작 — steps/plant3/*) ──
// 병행 배선(unit5v3.ts + ss.g2u5v3 토글) 전용 — 현행 unit5 계열·v2(plant2)와 이름이 겹치지 않는다.
export const greenHuntLab = (o: B4LabOpt): Step => ({ type: "greenHuntLab", ...o });
export const gasCrossLab = (o: B4LabOpt): Step => ({ type: "gasCrossLab", ...o });
export const starchQuestLab = (o: B4LabOpt): Step => ({ type: "starchQuestLab", ...o });
export const factorCurveLab = (o: B4LabOpt): Step => ({ type: "factorCurveLab", ...o });
export const flipEngineLab = (o: B4LabOpt): Step => ({ type: "flipEngineLab", ...o });
export const sunGaugeLab = (o: B4LabOpt): Step => ({ type: "sunGaugeLab", ...o });
export const sapFlowLab = (o: B4LabOpt): Step => ({ type: "sapFlowLab", ...o });

// ── 중2 Ⅵ 동물과 에너지 v3 랩 8종(2026-08-10 재제작 — steps/body3/*) ──
// 병행 배선(unit6v3.ts + ss.g2u6v3 토글) 전용 — 현행 unit6 계열·v2(anim)와 이름이 겹치지 않는다.
export const colorClueLab = (o: B4LabOpt): Step => ({ type: "colorClueLab", ...o });
export const salivaRaceLab = (o: B4LabOpt): Step => ({ type: "salivaRaceLab", ...o });
export const foodTripLab = (o: B4LabOpt): Step => ({ type: "foodTripLab", ...o });
export const heartPumpLab = (o: B4LabOpt): Step => ({ type: "heartPumpLab", ...o });
export const twoLoopsLab = (o: B4LabOpt): Step => ({ type: "twoLoopsLab", ...o });
export const chestModelLab = (o: B4LabOpt): Step => ({ type: "chestModelLab", ...o });
export const kidneyFilterLab = (o: B4LabOpt): Step => ({ type: "kidneyFilterLab", ...o });
export const bodyTeamLab = (o: B4LabOpt): Step => ({ type: "bodyTeamLab", ...o });

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
