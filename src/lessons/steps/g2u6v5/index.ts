// 중2 Ⅵ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u6"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 단원 공용 도구는 ./kit.
import type { StepRenderer } from "../../types";
import { g2u6BenedictLab, g2u6PlateLab } from "./nutrientLabs";
import { g2u6EnzymeLab, g2u6SalivaLab, g2u6VilliLab } from "./digestLabs";
import { g2u6BloodLab, g2u6HeartLab, g2u6LoopLab } from "./circLabs";
import { g2u6ChestLab, g2u6GasLab } from "./breathLabs";
import { g2u6NephronLab } from "./kidneyLab";
import { g2u6RespLab, g2u6TeamLab } from "./energyLabs";

export const G2U6V5_STEPS: Record<string, StepRenderer> = {
  g2u6PlateLab,
  g2u6BenedictLab,
  g2u6SalivaLab,
  g2u6EnzymeLab,
  g2u6VilliLab,
  g2u6HeartLab,
  g2u6BloodLab,
  g2u6LoopLab,
  g2u6ChestLab,
  g2u6GasLab,
  g2u6NephronLab,
  g2u6RespLab,
  g2u6TeamLab,
};
