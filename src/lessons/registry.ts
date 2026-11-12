// 스텝 타입 → 렌더러 매핑. 새 인터랙션을 추가하면 여기에 등록한다.

import type { StepRenderer } from "./types";
import { concept } from "./steps/concept";
import { quiz } from "./steps/quiz";
import { order } from "./steps/order";
import { binSort } from "./steps/binSort";
import { hotspot } from "./steps/hotspot";
// ── 중1 Ⅱ 재제작 랩 11종(2026-07-25) — 구작 orgLevels·finchSim·microscope·dichotomKey는 보존만 하고 쓰지 않는다 ──
// ── 중1 Ⅱ v3 랩 9종(2026-08-10 재제작, steps/bio4/*) — 병행 배선(unit2v3) 전용 ──
// ── 중1 Ⅱ v5 랩 12종(2026-11-11, steps/bio6/*): 정본(unit2v5) ──
import { magnifyLab } from "./steps/bio6/magnifyLab";
import { cellWorkLab } from "./steps/bio6/cellWorkLab";
import { slideBuildLab } from "./steps/bio6/slideBuildLab";
import { scopeCompareLab } from "./steps/bio6/scopeCompareLab";
import { cellFitLab } from "./steps/bio6/cellFitLab";
import { levelBuildLab } from "./steps/bio6/levelBuildLab";
import { ecoMapLab } from "./steps/bio6/ecoMapLab";
import { beakIslesLab } from "./steps/bio6/beakIslesLab";
import { kinLab } from "./steps/bio6/kinLab";
import { rankWidenLab } from "./steps/bio6/rankWidenLab";
import { kingdomPathLab } from "./steps/bio6/kingdomPathLab";
import { foodWebLab } from "./steps/bio6/foodWebLab";
// ── 중2 Ⅴ v3 랩 7종(2026-08-10 재제작, steps/plant3/*) — 병행 배선(unit5v3) 전용 ──
// ── 중2 Ⅵ v3 랩 8종(2026-08-10 재제작, steps/body3/*) — 병행 배선(unit6v3) 전용 ──
import { comic } from "./steps/comic";
import { hook } from "./steps/hook";
import { recap } from "./steps/recap";
// 중2 Ⅴ 식물과 에너지 v2(전면 재제작) — 구 plant* 랩과 타입명이 겹치지 않는다.
// 중2 Ⅵ 동물과 에너지 v2(전면 재제작) — 구 body* 랩과 타입명이 겹치지 않는다(an 접두).
import { pairMatch } from "./steps/pairMatch";
import { figTabs } from "./steps/figTabs";
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
import { kimchiLab } from "./steps/kimchiLab";
import { suffrageLab } from "./steps/suffrageLab";
import { principleLab } from "./steps/principleLab";
import { electLab } from "./steps/electLab";
import { policyLab } from "./steps/policyLab";
import { trialLab } from "./steps/trialLab";
import { fairTrialLab } from "./steps/fairTrialLab";
import { shieldLab } from "./steps/shieldLab";
import { workRightLab } from "./steps/workRightLab";
import { factLab } from "./steps/factLab";
import { feastLab } from "./steps/feastLab";
import { timelineLab } from "./steps/timelineLab";
import { opener } from "./steps/opener/opener";
// 중1 과학 v5(랩과 도입 재제작, 2026-11-12): 단원마다 자기 등록표(steps/uNv5/index.ts)를 채운다. 이 파일은 고치지 않는다.
import { U1V5_STEPS } from "./steps/u1v5";
import { U3V5_STEPS } from "./steps/u3v5";
import { U4V5_STEPS } from "./steps/u4v5";
import { U5V5_STEPS } from "./steps/u5v5";
import { U6V5_STEPS } from "./steps/u6v5";
import { U7V5_STEPS } from "./steps/u7v5";
// 중2 과학 v5(전면 재제작, 2026-11-12): 단원마다 자기 등록표(steps/g2uNv5/index.ts)를 채운다. 이 파일은 고치지 않는다.
import { G2U1V5_STEPS } from "./steps/g2u1v5";
import { G2U2V5_STEPS } from "./steps/g2u2v5";
import { G2U3V5_STEPS } from "./steps/g2u3v5";
import { G2U4V5_STEPS } from "./steps/g2u4v5";
import { G2U5V5_STEPS } from "./steps/g2u5v5";
import { G2U6V5_STEPS } from "./steps/g2u6v5";
import { G2U7V5_STEPS } from "./steps/g2u7v5";
import { G2U8V5_STEPS } from "./steps/g2u8v5";

const R: Record<string, StepRenderer> = {
  concept,
  comic,
  hook,
  recap,

  pairMatch,
  figTabs,
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
  kimchiLab,
  suffrageLab,
  principleLab,
  electLab,
  policyLab,
  trialLab,
  fairTrialLab,
  shieldLab,
  workRightLab,
  factLab,
  feastLab,
  timelineLab,
  quiz,
  order,
  binSort,
  hotspot,
  // 중1 Ⅱ 재제작 랩
  // 중1 Ⅱ v3 랩(2026-08-10 재제작)
  // 중1 Ⅱ v5 랩(2026-11-11)
  magnifyLab,
  cellWorkLab,
  slideBuildLab,
  scopeCompareLab,
  cellFitLab,
  levelBuildLab,
  ecoMapLab,
  beakIslesLab,
  kinLab,
  rankWidenLab,
  kingdomPathLab,
  foodWebLab,
  // 중2 Ⅴ v3 랩(2026-08-10 재제작)
  // 중2 Ⅵ v3 랩(2026-08-10 재제작)
  // 중1 Ⅱ 도입 샘플(2026-11-11, 병행 토글 ss.u2intro)
  opener,
  // 중1 과학 v5 단원별 등록표(타입 이름은 단원 접두 "u3…"로 시작해 위의 것과 겹치지 않는다)
  ...U1V5_STEPS,
  ...U3V5_STEPS,
  ...U4V5_STEPS,
  ...U5V5_STEPS,
  ...U6V5_STEPS,
  ...U7V5_STEPS,
  // 중2 과학 v5 단원별 등록표(타입 이름은 "g2u3…"로 시작한다)
  ...G2U1V5_STEPS,
  ...G2U2V5_STEPS,
  ...G2U3V5_STEPS,
  ...G2U4V5_STEPS,
  ...G2U5V5_STEPS,
  ...G2U6V5_STEPS,
  ...G2U7V5_STEPS,
  ...G2U8V5_STEPS,
};

export function getRenderer(type: string): StepRenderer | undefined {
  return R[type];
}

export function register(type: string, renderer: StepRenderer): void {
  R[type] = renderer;
}
