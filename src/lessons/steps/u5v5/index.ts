// 중1 Ⅴ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "u5"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 공용 부품은 ./u5Kit.
import type { StepRenderer } from "../../types";
import { arrowLab } from "./arrowLab";
import { sumLab } from "./sumLab";
import { gravityLab } from "./gravityLab";
import { springLab5 } from "./springLab5";
import { slopeLab } from "./slopeLab";
import { buoyLab } from "./buoyLab";
import { fanLab } from "./fanLab";

export const U5V5_STEPS: Record<string, StepRenderer> = {
  u5ArrowLab: arrowLab,
  u5SumLab: sumLab,
  u5GravityLab: gravityLab,
  u5SpringLab: springLab5,
  u5SlopeLab: slopeLab,
  u5BuoyLab: buoyLab,
  u5FanLab: fanLab,
};
