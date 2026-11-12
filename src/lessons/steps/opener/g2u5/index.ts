// 중2 Ⅴ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u5-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u5-iodine", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u5.mjs → node qa/sketch/build-intro.mjs g2u5 → src/ui/introArt.g2u5.generated.ts
import type { OpenerPack } from "../opener";
import { flood, iodine, jar, shade, thin } from "./scenes";

export const G2U5_OPENERS: OpenerPack = {
  scenes: { "g2u5-iodine": iodine, "g2u5-shade": shade, "g2u5-flood": flood, "g2u5-jar": jar, "g2u5-thin": thin },
  art: () => import("../../../../ui/introArt.g2u5.generated"),
};
