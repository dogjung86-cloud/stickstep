// 중1 Ⅳ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "u4"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 단원 공용 도구는 ./u4Kit.
import type { StepRenderer } from "../../types";
import { u4InkLab } from "./inkLab";
import { u4EvapLab } from "./evapLab";
import { u4MoveLab } from "./moveLab";
import { u4BuildLab } from "./buildLab";
import { u4NamesLab } from "./namesLab";
import { u4WatchLab } from "./watchLab";
import { u4DryIceLab } from "./dryIceLab";
import { u4OliveLab } from "./oliveLab";
import { u4BalloonLab } from "./balloonLab";
import { u4CurveLab } from "./curveLab";
import { u4AroundLab } from "./aroundLab";

export const U4V5_STEPS: Record<string, StepRenderer> = {
  u4InkLab,
  u4EvapLab,
  u4MoveLab,
  u4BuildLab,
  u4NamesLab,
  u4WatchLab,
  u4DryIceLab,
  u4OliveLab,
  u4BalloonLab,
  u4CurveLab,
  u4AroundLab,
};
