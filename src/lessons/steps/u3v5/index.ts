// 중1 Ⅲ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "u3"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 무대 부품은 ./kit.ts.
import type { StepRenderer } from "../../types";
import { tempLab } from "./tempLab";
import { contactLab } from "./contactLab";
import { rodLab } from "./rodLab";
import { convLab } from "./convLab";
import { radLab } from "./radLab";
import { raceLab } from "./raceLab";
import { railLab } from "./railLab";
import { tapeLab } from "./tapeLab";

export const U3V5_STEPS: Record<string, StepRenderer> = {
  u3TempLab: tempLab,
  u3ContactLab: contactLab,
  u3RodLab: rodLab,
  u3ConvLab: convLab,
  u3RadLab: radLab,
  u3RaceLab: raceLab,
  u3RailLab: railLab,
  u3TapeLab: tapeLab,
};
