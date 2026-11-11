// 중1 Ⅰ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "u1"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 강조색만 u1v5.css가 단원색(파랑)으로 덮는다.
//   u1FairLab  u1l2 「색깔만 달라지게 하려면?」            조건 카드 셋을 정하고 실험을 돌린다(변인 통제)
//   u1GraphLab u1l2 「표를 그래프로 옮기면 무엇이 보일까?」 표의 값을 그래프에 찍는다(자료 해석)
import type { StepRenderer } from "../../types";
import { fairLab } from "./fairLab";
import { graphLab } from "./graphLab";

export const U1V5_STEPS: Record<string, StepRenderer> = {
  u1FairLab: fairLab,
  u1GraphLab: graphLab,
};
