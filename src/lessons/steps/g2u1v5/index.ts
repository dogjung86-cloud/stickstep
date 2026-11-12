// 중2 Ⅰ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u1"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다).
import type { StepRenderer } from "../../types";
import { g2u1MeasureLab } from "./measureLab";
import { g2u1SizeLab } from "./sizeLab";
import { g2u1LayerLab } from "./layerLab";
import { g2u1DissolveLab } from "./dissolveLab";
import { g2u1WarmLab } from "./warmLab";
import { g2u1FizzLab, g2u1PumpLab } from "./fizzLabs";
import { g2u1BoilLab, g2u1MeltLab, g2u1SaltLab } from "./curveLabs";
import { g2u1FunnelLab } from "./funnelLab";
import { g2u1SeedLab } from "./seedLab";
import { g2u1CrystalLab } from "./crystalLab";
import { g2u1DistillLab } from "./distillLab";

export const G2U1V5_STEPS: Record<string, StepRenderer> = {
  g2u1MeasureLab,
  g2u1SizeLab,
  g2u1LayerLab,
  g2u1DissolveLab,
  g2u1WarmLab,
  g2u1FizzLab,
  g2u1PumpLab,
  g2u1MeltLab,
  g2u1BoilLab,
  g2u1SaltLab,
  g2u1FunnelLab,
  g2u1SeedLab,
  g2u1CrystalLab,
  g2u1DistillLab,
};
