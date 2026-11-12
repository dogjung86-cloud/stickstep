// 중2 Ⅲ v5 랩의 등록표. registry.ts가 이 표를 통째로 싣는다(registry.ts를 고치지 않는다).
// 스텝 타입 이름은 "g2u3"로 시작한다(다른 단원, 기존 랩과 겹치지 않게).
// 랩 뼈대는 ../bio6/b6Lab 의 bvFrame 을 그대로 쓴다(뼈대 파일과 bio6.css 는 고치지 않는다). 공용 부품은 ./lxKit.
import type { StepRenderer } from "../../types";
import { reflectLab5, roughLab } from "./reflectLabs";
import { tankLab, coinLab } from "./refractLabs";
import { pathLab } from "./pathLab";
import { halfMirrorLab, extendLab } from "./mirrorLabs";
import { curveLab, useLab } from "./curveLabs";
import { lampLab, torchLab, pixelLab } from "./colorLabs";
import { ballLab, waveLab } from "./waveLabs";

export const G2U3V5_STEPS: Record<string, StepRenderer> = {
  g2u3ReflectLab: reflectLab5,
  g2u3RoughLab: roughLab,
  g2u3TankLab: tankLab,
  g2u3CoinLab: coinLab,
  g2u3PathLab: pathLab,
  g2u3HalfMirrorLab: halfMirrorLab,
  g2u3ExtendLab: extendLab,
  g2u3CurveLab: curveLab,
  g2u3UseLab: useLab,
  g2u3LampLab: lampLab,
  g2u3TorchLab: torchLab,
  g2u3PixelLab: pixelLab,
  g2u3BallLab: ballLab,
  g2u3WaveLab: waveLab,
};
