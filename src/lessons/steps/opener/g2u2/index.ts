// 중2 Ⅱ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u2-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u2-sea", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u2.mjs → node qa/sketch/build-intro.mjs g2u2 → src/ui/introArt.g2u2.generated.ts
import type { OpenerPack } from "../opener";
import { bottle, grain, ice, jar, lava, paper, pebble, sea, snow } from "./scenes";

export const G2U2_OPENERS: OpenerPack = {
  scenes: {
    "g2u2-sea": sea,
    "g2u2-grain": grain,
    "g2u2-lava": lava,
    "g2u2-jar": jar,
    "g2u2-snow": snow,
    "g2u2-pebble": pebble,
    "g2u2-bottle": bottle,
    "g2u2-paper": paper,
    "g2u2-ice": ice,
  },
  art: () => import("../../../../ui/introArt.g2u2.generated"),
};
