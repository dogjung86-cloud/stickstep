// 중2 Ⅶ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u7"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 설계와 책의 실험 대응표는 design/g2u7v5-plan.md.
import type { StepRenderer } from "../../types";
import { strawLab } from "./strawLab";
import { rubLab } from "./rubLab";
import { canLab } from "./canLab";
import { wireLab } from "./wireLab";
import { waterLab } from "./waterLab";
import { ohmLab } from "./ohmLab";
import { formulaLab } from "./formulaLab";
import { bulbLab } from "./bulbLab";
import { splitLab } from "./splitLab";
import { powerLab } from "./powerLab";
import { effLab } from "./effLab";
import { coilLab } from "./coilLab";
import { swingLab } from "./swingLab";
import { motorLab } from "./motorLab";

export const G2U7V5_STEPS: Record<string, StepRenderer> = {
  g2u7StrawLab: strawLab,
  g2u7RubLab: rubLab,
  g2u7CanLab: canLab,
  g2u7WireLab: wireLab,
  g2u7WaterLab: waterLab,
  g2u7OhmLab: ohmLab,
  g2u7FormulaLab: formulaLab,
  g2u7BulbLab: bulbLab,
  g2u7SplitLab: splitLab,
  g2u7PowerLab: powerLab,
  g2u7EffLab: effLab,
  g2u7CoilLab: coilLab,
  g2u7SwingLab: swingLab,
  g2u7MotorLab: motorLab,
};
