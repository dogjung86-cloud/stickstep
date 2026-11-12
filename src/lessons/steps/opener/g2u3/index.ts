// 중2 Ⅲ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u3-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u3-town", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u3.mjs → node qa/sketch/build-intro.mjs g2u3 → src/ui/introArt.g2u3.generated.ts
import type { OpenerPack } from "../opener";
import { G2U3_SCENES } from "./scenes";

export const G2U3_OPENERS: OpenerPack = { scenes: G2U3_SCENES, art: () => import("../../../../ui/introArt.g2u3.generated") };
