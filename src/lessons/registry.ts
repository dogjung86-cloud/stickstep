// 스텝 타입 → 렌더러 매핑. 새 인터랙션을 추가하면 여기에 등록한다.

import type { StepRenderer } from "./types";
import { concept } from "./steps/concept";
import { quiz } from "./steps/quiz";
import { table } from "./steps/table";
import { order } from "./steps/order";
import { binSort } from "./steps/binSort";
import { hotspot } from "./steps/hotspot";
import { dataGraph } from "./steps/dataGraph";
import { historyCase } from "./steps/historyCase";
import { techCards } from "./steps/techCards";
import { orgLevels } from "./steps/orgLevels";
import { finchSim } from "./steps/finchSim";
import { microscope } from "./steps/microscope";
import { dichotomKey } from "./steps/dichotomKey";
import { comic } from "./steps/comic";
import { hook } from "./steps/hook";
import { recap } from "./steps/recap";
import { heatParticles } from "./steps/heatParticles";
import { heatContact } from "./steps/heatContact";
import { conduction } from "./steps/conduction";
import { convection } from "./steps/convection";
import { radiation } from "./steps/radiation";
import { specificHeat } from "./steps/specificHeat";
import { expansion } from "./steps/expansion";
import { diffusion } from "./steps/diffusion";
import { evaporation } from "./steps/evaporation";
import { matterTemp } from "./steps/matterTemp";
import { matterShape } from "./steps/matterShape";
import { matterCompare } from "./steps/matterCompare";
import { phaseNames } from "./steps/phaseNames";
import { sublimation } from "./steps/sublimation";
import { phaseVolume } from "./steps/phaseVolume";
import { heatCurve } from "./steps/heatCurve";
import { springLab } from "./steps/springLab";
import { tugOfWar } from "./steps/tugOfWar";
import { gravityDrop } from "./steps/gravityDrop";
import { frictionPush } from "./steps/frictionPush";
import { buoyancyLab } from "./steps/buoyancyLab";
import { forceStudio } from "./steps/forceStudio";
import { windSoccer } from "./steps/windSoccer";
import { gasPressure } from "./steps/gasPressure";
import { boyleSyringe } from "./steps/boyleSyringe";
import { diverBubble } from "./steps/diverBubble";
import { charlesSyringe } from "./steps/charlesSyringe";
import { hotairRide } from "./steps/hotairRide";
import { solarTour } from "./steps/solarTour";
import { sunLab } from "./steps/sunLab";
import { skyDaily } from "./steps/skyDaily";
import { zodiacRing } from "./steps/zodiacRing";
import { moonPhase3d } from "./steps/moonPhase3d";
import { eclipse3d } from "./steps/eclipse3d";

const R: Record<string, StepRenderer> = {
  concept,
  comic,
  hook,
  recap,
  heatParticles,
  heatContact,
  conduction,
  convection,
  radiation,
  specificHeat,
  expansion,
  diffusion,
  evaporation,
  matterTemp,
  matterShape,
  matterCompare,
  phaseNames,
  sublimation,
  phaseVolume,
  heatCurve,
  springLab,
  tugOfWar,
  gravityDrop,
  frictionPush,
  buoyancyLab,
  forceStudio,
  windSoccer,
  gasPressure,
  boyleSyringe,
  diverBubble,
  charlesSyringe,
  hotairRide,
  solarTour,
  sunLab,
  skyDaily,
  zodiacRing,
  moonPhase3d,
  eclipse3d,
  quiz,
  table,
  order,
  binSort,
  hotspot,
  dataGraph,
  historyCase,
  techCards,
  orgLevels,
  finchSim,
  microscope,
  dichotomKey,
};

export function getRenderer(type: string): StepRenderer | undefined {
  return R[type];
}

export function register(type: string, renderer: StepRenderer): void {
  R[type] = renderer;
}
