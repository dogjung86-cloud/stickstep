// 중2 Ⅲ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u3"로 시작한다(다른 단원, 기존 랩과 겹치지 않게). 예: { g2u3SomethingLab: somethingLab }
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다).
import type { StepRenderer } from "../../types";

export const G2U3V5_STEPS: Record<string, StepRenderer> = {};
