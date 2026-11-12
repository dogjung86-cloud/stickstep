// 중2 Ⅱ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u2"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 공용 도구는 ./kit.
import type { StepRenderer } from "../../types";
import { g2u2SystemLab } from "./systemLab";
import { g2u2LayerLab, g2u2ProbeLab } from "./earthLabs";
import { g2u2MineralLab, g2u2PowderLab } from "./mineralLabs";
import { g2u2CoolLab, g2u2IgneousLab } from "./igneousLabs";
import { g2u2MetaLab, g2u2PressLab, g2u2SedLab } from "./sedMetaLabs";
import { g2u2CycleLab, g2u2RockIdLab } from "./rockLabs";

export const G2U2V5_STEPS: Record<string, StepRenderer> = {
  g2u2SystemLab,
  g2u2ProbeLab,
  g2u2LayerLab,
  g2u2PowderLab,
  g2u2MineralLab,
  g2u2CoolLab,
  g2u2IgneousLab,
  g2u2SedLab,
  g2u2PressLab,
  g2u2MetaLab,
  g2u2RockIdLab,
  g2u2CycleLab,
};
