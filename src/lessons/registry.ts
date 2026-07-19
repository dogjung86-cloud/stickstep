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
import { biodiversityLab } from "./steps/biodiversityLab";
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
import { directorLab } from "./steps/directorLab"; // [임시 프리뷰] 적용 랩 시제품 — 폐기 시 이 줄과 R 항목 삭제
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
import { leafFactoryLab } from "./steps/plantFactoryLab";
import { photoEvidenceLab } from "./steps/plantEvidenceLab";
import { photoFactorLab } from "./steps/plantFactorLab";
import { plantRespireLab, dayNightLab } from "./steps/plantRespirationLab";
import { sugarJourneyLab } from "./steps/sugarJourneyLab";
import { nutrientTestLab } from "./steps/nutrientTestLab";
import { digestJourneyLab } from "./steps/digestJourneyLab";
import { circulationLab } from "./steps/circulationLab";
import { breathModelLab } from "./steps/breathModelLab";
import { nephronLab } from "./steps/nephronLab";
import { bodyIntegrateLab } from "./steps/bodyIntegrateLab";
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
import { coordLab } from "./steps/coordLab";
import { quadLab } from "./steps/quadLab";
import { bottleLab } from "./steps/bottleLab";
import { droneLab } from "./steps/droneLab";
import { linkLab } from "./steps/linkLab";
import { lineLab } from "./steps/lineLab";
import { shareLab } from "./steps/shareLab";
import { curveLab } from "./steps/curveLab";
import { traceLab } from "./steps/traceLab";
import { rayLab } from "./steps/rayLab";
import { angleLab } from "./steps/angleLab";
import { vertAngleLab } from "./steps/vertAngleLab";
import { perpLab } from "./steps/perpLab";
import { lineRelLab } from "./steps/lineRelLab";
import { boxRelLab } from "./steps/boxRelLab";
import { anglePairLab } from "./steps/anglePairLab";
import { parallelLab } from "./steps/parallelLab";
import { compassLab } from "./steps/compassLab";
import { triBuildLab } from "./steps/triBuildLab";
import { congLab } from "./steps/congLab";
import { diagLab } from "./steps/diagLab";
import { triSumLab } from "./steps/triSumLab";
import { polySplitLab } from "./steps/polySplitLab";
import { walkLab } from "./steps/walkLab";
import { circleLab } from "./steps/circleLab";
import { sectorLab } from "./steps/sectorLab";
import { solidLab } from "./steps/solidLab";
import { platonicLab } from "./steps/platonicLab";
import { latheLab } from "./steps/latheLab";
import { prismLab } from "./steps/prismLab";
import { coneLab } from "./steps/coneLab";
import { sphereLab } from "./steps/sphereLab";
import { meanPullLab } from "./steps/meanPullLab";
import { modeLab } from "./steps/modeLab";
import { stemLab } from "./steps/stemLab";
import { freqLab } from "./steps/freqLab";
import { histoLab } from "./steps/histoLab";
import { relFreqLab } from "./steps/relFreqLab";
import { divLab } from "./steps/divLab";
import { cycleLab } from "./steps/cycleLab";
import { denomLab } from "./steps/denomLab";
import { shiftLab } from "./steps/shiftLab";
import { powMulLab } from "./steps/powMulLab";
import { powDivLab } from "./steps/powDivLab";
import { monoLab } from "./steps/monoLab";
import { polyAddLab } from "./steps/polyAddLab";
import { expandLab } from "./steps/expandLab";
import { ineqTruthLab } from "./steps/ineqTruthLab";
import { flipLab } from "./steps/flipLab";
import { ineqSolveLab } from "./steps/ineqSolveLab";
import { vsLab } from "./steps/vsLab";
import { pairLab } from "./steps/pairLab";
import { crossLab } from "./steps/crossLab";
import { subSlotLab } from "./steps/subSlotLab";
import { elimLab } from "./steps/elimLab";
import { funcLab } from "./steps/funcLab";
import { shiftGraphLab } from "./steps/shiftGraphLab";
import { interceptLab } from "./steps/interceptLab";
import { slopeLab } from "./steps/slopeLab";
import { lineFamilyLab } from "./steps/lineFamilyLab";
import { lineBuildLab } from "./steps/lineBuildLab";
import { lineRevealLab } from "./steps/lineRevealLab";
import { meetLab } from "./steps/meetLab";
import { isoFoldLab } from "./steps/isoFoldLab";
import { isoBuildLab } from "./steps/isoBuildLab";
import { rhCongLab } from "./steps/rhCongLab";
import { circumLab } from "./steps/circumLab";
import { inCircleLab } from "./steps/inCircleLab";
import { paraSpinLab } from "./steps/paraSpinLab";
import { paraCondLab } from "./steps/paraCondLab";
import { diagRigLab } from "./steps/diagRigLab";
import { quadFamilyLab } from "./steps/quadFamilyLab";
import { areaSlideLab } from "./steps/areaSlideLab";
import { zoomLab } from "./steps/zoomLab";
import { simHuntLab } from "./steps/simHuntLab";
import { scaleTileLab } from "./steps/scaleTileLab";
import { shapeLockLab } from "./steps/shapeLockLab";
import { peelLab } from "./steps/peelLab";
import { triSliceLab } from "./steps/triSliceLab";
import { midpointLab } from "./steps/midpointLab";
import { lineDivLab } from "./steps/lineDivLab";
import { centroidLab } from "./steps/centroidLab";
import { pythaLab } from "./steps/pythaLab";
import { rightCheckLab } from "./steps/rightCheckLab";
import { caseLab } from "./steps/caseLab";
import { orLab } from "./steps/orLab";
import { treeLab } from "./steps/treeLab";
import { tossLab } from "./steps/tossLab";
import { probBarLab } from "./steps/probBarLab";
import { notLab } from "./steps/notLab";
import { probAddLab } from "./steps/probAddLab";
import { probMulLab } from "./steps/probMulLab";
import { worldPlaceLab } from "./steps/worldPlaceLab";
import { latSunLab } from "./steps/latSunLab";
import { connectLab } from "./steps/connectLab";
import { tableLinkLab } from "./steps/tableLinkLab";
import { regionPlaceLab } from "./steps/regionPlaceLab";
import { monsoonLab } from "./steps/monsoonLab";
import { pyramidLab } from "./steps/pyramidLab";
import { westWindLab } from "./steps/westWindLab";
import { rainBeltLab } from "./steps/rainBeltLab";
import { highlandLab } from "./steps/highlandLab";
import { seasonLab } from "./steps/seasonLab";
import { shipRaceLab } from "./steps/shipRaceLab";
import { judgeLab } from "./steps/judgeLab";
import { dilemmaLab } from "./steps/dilemmaLab";
import { lifePathLab } from "./steps/lifePathLab";
import { timelineLab } from "./steps/timelineLab";

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
  directorLab, // [임시 프리뷰] 적용 랩 시제품

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
  leafFactoryLab,
  photoEvidenceLab,
  photoFactorLab,
  plantRespireLab,
  dayNightLab,
  sugarJourneyLab,
  nutrientTestLab,
  digestJourneyLab,
  circulationLab,
  breathModelLab,
  nephronLab,
  bodyIntegrateLab,
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
  coordLab,
  quadLab,
  bottleLab,
  droneLab,
  linkLab,
  lineLab,
  shareLab,
  curveLab,
  traceLab,
  rayLab,
  angleLab,
  vertAngleLab,
  perpLab,
  lineRelLab,
  boxRelLab,
  anglePairLab,
  parallelLab,
  compassLab,
  triBuildLab,
  congLab,
  diagLab,
  triSumLab,
  polySplitLab,
  walkLab,
  circleLab,
  sectorLab,
  solidLab,
  platonicLab,
  latheLab,
  prismLab,
  coneLab,
  sphereLab,
  meanPullLab,
  modeLab,
  stemLab,
  freqLab,
  histoLab,
  relFreqLab,
  divLab,
  cycleLab,
  denomLab,
  shiftLab,
  powMulLab,
  powDivLab,
  monoLab,
  polyAddLab,
  expandLab,
  ineqTruthLab,
  flipLab,
  ineqSolveLab,
  vsLab,
  pairLab,
  crossLab,
  subSlotLab,
  elimLab,
  funcLab,
  shiftGraphLab,
  interceptLab,
  slopeLab,
  lineFamilyLab,
  lineBuildLab,
  lineRevealLab,
  meetLab,
  isoFoldLab,
  isoBuildLab,
  rhCongLab,
  circumLab,
  inCircleLab,
  paraSpinLab,
  paraCondLab,
  diagRigLab,
  quadFamilyLab,
  areaSlideLab,
  zoomLab,
  simHuntLab,
  scaleTileLab,
  shapeLockLab,
  peelLab,
  triSliceLab,
  midpointLab,
  lineDivLab,
  centroidLab,
  pythaLab,
  rightCheckLab,
  caseLab,
  orLab,
  treeLab,
  tossLab,
  probBarLab,
  notLab,
  probAddLab,
  probMulLab,
  worldPlaceLab,
  latSunLab,
  connectLab,
  tableLinkLab,
  regionPlaceLab,
  monsoonLab,
  pyramidLab,
  westWindLab,
  rainBeltLab,
  highlandLab,
  seasonLab,
  shipRaceLab,
  judgeLab,
  dilemmaLab,
  lifePathLab,
  timelineLab,
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
  biodiversityLab,
};

export function getRenderer(type: string): StepRenderer | undefined {
  return R[type];
}

export function register(type: string, renderer: StepRenderer): void {
  R[type] = renderer;
}
