// 중2 Ⅳ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u4-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u4-split", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u4.mjs → node qa/sketch/build-intro.mjs g2u4 → src/ui/introArt.g2u4.generated.ts
import type { OpenerPack } from "../opener";
import { blot, marks, peek, salt, split } from "./scenes";

export const G2U4_OPENERS: OpenerPack = {
  scenes: { "g2u4-split": split, "g2u4-marks": marks, "g2u4-peek": peek, "g2u4-salt": salt, "g2u4-blot": blot },
  art: () => import("../../../../ui/introArt.g2u4.generated"),
};
