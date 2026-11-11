// 중1 Ⅶ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "u7"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 단원 공용 부품은 ./kit.
//   u7TourLab(u7l1 태양계의 천체 여섯 가지, 가로 3D) · u7PlanetLab(u7l2 행성을 두 무리로) · u7SunLab(u7l3 태양의 표면, 대기, 활동)
//   u7SkyLab(u7l4 하루 동안 별의 움직임) · u7ZodiacLab(u7l4 계절과 별자리, 3D) · u7MoonLab(u7l5 달의 위상, 3D) · u7EclipseLab(u7l6 일식과 월식, 가로 3D)
// tourLab.ts와 eclipseLab.ts는 정본의 3D 무대를 옮겨 적은 생성물이다(qa/u7v5-port-landscape.py).
import type { StepRenderer } from "../../types";
import { u7TourLab } from "./tourLab";
import { u7PlanetLab } from "./planetLab";
import { u7SunLab } from "./sunLab";
import { u7SkyLab } from "./skyLab";
import { u7ZodiacLab } from "./zodiacLab";
import { u7MoonLab } from "./moonLab";
import { u7EclipseLab } from "./eclipseLab";

export const U7V5_STEPS: Record<string, StepRenderer> = { u7TourLab, u7PlanetLab, u7SunLab, u7SkyLab, u7ZodiacLab, u7MoonLab, u7EclipseLab };
