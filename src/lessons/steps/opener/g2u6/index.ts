// 중2 Ⅵ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u6-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u6-peanut", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u6.mjs → node qa/sketch/build-intro.mjs g2u6 → src/ui/introArt.g2u6.generated.ts
import type { OpenerPack } from "../opener";
import { breath, chew, peanut, run, water } from "./scenes";

export const G2U6_OPENERS: OpenerPack = {
  scenes: { "g2u6-peanut": peanut, "g2u6-chew": chew, "g2u6-breath": breath, "g2u6-water": water, "g2u6-run": run },
  art: () => import("../../../../ui/introArt.g2u6.generated"),
};
