// 중1 Ⅴ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "u5-"로 시작한다. 내용 파일에서 opener({ title, scene: "u5-balloon", wait, cta }).
// 그림: qa/sketch/scenes/intro-u5.mjs → node qa/sketch/build-intro.mjs u5 → src/ui/introArt.u5.generated.ts
import type { OpenerPack } from "../opener";
import { U5_SCENES } from "./scenes";

export const U5_OPENERS: OpenerPack = { scenes: U5_SCENES, art: () => import("../../../../ui/introArt.u5.generated") };
