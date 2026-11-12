// 중2 Ⅷ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u8"로 시작한다(다른 단원, 기존 랩과 겹치지 않게). 예: { g2u8SomethingLab: somethingLab }
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다).
import type { StepRenderer } from "../../types";
import { pencilLab } from "./pencilLab";
import { parallaxLab } from "./parallaxLab";
import { luxLab } from "./luxLab";
import { spreadLab } from "./spreadLab";
import { magLab } from "./magLab";
import { absLab } from "./absLab";
import { heaterLab } from "./heaterLab";
import { starTempLab } from "./starTempLab";

export const G2U8V5_STEPS: Record<string, StepRenderer> = {
  g2u8PencilLab: pencilLab,
  g2u8ParallaxLab: parallaxLab,
  g2u8LuxLab: luxLab,
  g2u8SpreadLab: spreadLab,
  g2u8MagLab: magLab,
  g2u8AbsLab: absLab,
  g2u8HeaterLab: heaterLab,
  g2u8StarTempLab: starTempLab,
};
