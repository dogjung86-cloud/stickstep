// 중2 Ⅳ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u4"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 단원 공용 도구는 ./kit.
import type { StepRenderer } from "../../types";
import { g2u4WaterLab } from "./waterLab";
import { g2u4SortLab, g2u4CanLab } from "./inspectLab";
import { g2u4SymbolLab, g2u4CardLab } from "./symbolLab";
import { g2u4FormulaLab } from "./formulaLab";
import { g2u4NeutralLab, g2u4KindLab } from "./atomLab";
import { g2u4TableLab, g2u4AlkaliLab, g2u4NobleLab } from "./periodicLab";
import { g2u4MolLab, g2u4IonLab } from "./particleLab";
import { g2u4MoveLab, g2u4PoleLab } from "./moveLab";

export const G2U4V5_STEPS: Record<string, StepRenderer> = {
  g2u4WaterLab,
  g2u4SortLab,
  g2u4SymbolLab,
  g2u4CardLab,
  g2u4FormulaLab,
  g2u4NeutralLab,
  g2u4KindLab,
  g2u4TableLab,
  g2u4AlkaliLab,
  g2u4NobleLab,
  g2u4MolLab,
  g2u4IonLab,
  g2u4CanLab,
  g2u4MoveLab,
  g2u4PoleLab,
};
