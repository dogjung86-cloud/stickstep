// 중2 Ⅰ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u1-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u1-rings", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u1.mjs → node qa/sketch/build-intro.mjs g2u1 → src/ui/introArt.g2u1.generated.ts
import type { OpenerPack } from "../opener";
import { cocoa, fish, gallium, milk, pot, rings, sea, soy, syrup } from "./scenes";

export const G2U1_OPENERS: OpenerPack = {
  scenes: {
    "g2u1-rings": rings,
    "g2u1-sea": sea,
    "g2u1-cocoa": cocoa,
    "g2u1-fish": fish,
    "g2u1-gallium": gallium,
    "g2u1-milk": milk,
    "g2u1-soy": soy,
    "g2u1-syrup": syrup,
    "g2u1-pot": pot,
  },
  art: () => import("../../../../ui/introArt.g2u1.generated"),
};
