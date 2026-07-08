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
import { reflectLab, diffuseLab } from "./steps/lightReflect";
import { refractLab } from "./steps/lightRefract";
import { seeLab } from "./steps/lightSee";
import { mirrorImageLab } from "./steps/lightMirror";
import { mirrorLens } from "./steps/lightBench";
import { opticView } from "./steps/opticView";
import { objectColorLab, colorMixLab, pixelLab } from "./steps/lightColor";
import { waveLab } from "./steps/waveTank";
import { soundLab } from "./steps/soundLab";
import { elementLab, moleculeLab } from "./steps/chemParticles";
import { atomLab, ionLab } from "./steps/chemAtom";
import { periodicLab } from "./steps/chemTable";
import { ionMoveLab } from "./steps/chemIonMove";
import { pairMatch } from "./steps/pairMatch";
import { formulaLab } from "./steps/formulaLab";
import { frictionLab, rubLab } from "./steps/elecStatic";
import { inductionLab } from "./steps/elecInduction";
import { waterCircuit } from "./steps/elecWater";
import { ohmLab } from "./steps/elecOhm";
import { circuitLab } from "./steps/elecCircuit";
import { coilFieldLab } from "./steps/elecCoil";
import { swingLab3d } from "./steps/elecSwing3d";
import { figTabs } from "./steps/figTabs";
import { parallaxLab } from "./steps/parallaxLab";
import { starLight3d } from "./steps/starLight3d";
import { starColorLab } from "./steps/starColorLab";
import { balloonUniverse } from "./steps/balloonUniverse";
import { galaxy3d } from "./steps/galaxy3d";
import { densityLab } from "./steps/densityLab";
import { densityPool } from "./steps/densityPool";
import { solubilityLab } from "./steps/solubilityLab";
import { gasFizz } from "./steps/gasFizz";
import { meltCurve } from "./steps/meltCurve";
import { sepFunnel } from "./steps/sepFunnel";
import { recrystal } from "./steps/recrystal";
import { distillLab } from "./steps/distillLab";
import { earthCut3d } from "./steps/earthCut3d";
import { streakLab } from "./steps/streakLab";
import { coolingLab } from "./steps/coolingLab";
import { strataLab } from "./steps/strataLab";
import { foliationLab } from "./steps/foliationLab";
import { rockCycle } from "./steps/rockCycle";
import { driftLab } from "./steps/driftLab";
import { plateMap } from "./steps/plateMap";
import { mathHook } from "./steps/hookMath";
import { mathDrill } from "./steps/mathDrill";
import { sieveLab } from "./steps/sieveLab";
import { powBuild } from "./steps/powBuild";
import { factorTree } from "./steps/factorTree";
import { vennFactor } from "./steps/vennFactor";
import { starDraw } from "./steps/starDraw";
import { numline } from "./steps/numline";
import { numWalk } from "./steps/numWalk";
import { counterLab } from "./steps/counterLab";
import { patternLab } from "./steps/patternLab";
import { areaSplit } from "./steps/areaSplit";
import { patternRule } from "./steps/patternRule";
import { substLab } from "./steps/substLab";
import { exprAnatomy } from "./steps/exprAnatomy";
import { likeTerms } from "./steps/likeTerms";
import { eqTruth } from "./steps/eqTruth";
import { balanceLab } from "./steps/balanceLab";
import { solveLab } from "./steps/solveLab";

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
  reflectLab,
  diffuseLab,
  refractLab,
  seeLab,
  mirrorImageLab,
  mirrorLens,
  opticView,
  objectColorLab,
  colorMixLab,
  pixelLab,
  waveLab,
  soundLab,
  elementLab,
  moleculeLab,
  atomLab,
  periodicLab,
  ionLab,
  ionMoveLab,
  pairMatch,
  formulaLab,
  frictionLab,
  rubLab,
  inductionLab,
  waterCircuit,
  ohmLab,
  circuitLab,
  coilFieldLab,
  swingLab3d,
  figTabs,
  parallaxLab,
  starLight3d,
  starColorLab,
  balloonUniverse,
  galaxy3d,
  densityLab,
  densityPool,
  solubilityLab,
  gasFizz,
  meltCurve,
  sepFunnel,
  recrystal,
  distillLab,
  earthCut3d,
  streakLab,
  coolingLab,
  strataLab,
  foliationLab,
  rockCycle,
  driftLab,
  plateMap,
  mathHook,
  mathDrill,
  sieveLab,
  powBuild,
  factorTree,
  vennFactor,
  starDraw,
  numline,
  numWalk,
  counterLab,
  patternLab,
  areaSplit,
  patternRule,
  substLab,
  exprAnatomy,
  likeTerms,
  eqTruth,
  balanceLab,
  solveLab,
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
