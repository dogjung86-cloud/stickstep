// 중1 Ⅳ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "u4-"로 시작한다. 내용 파일에서 opener({ title, scene: "u4-lid", wait, cta }).
// 그림: qa/sketch/scenes/intro-u4.mjs → node qa/sketch/build-intro.mjs u4 → src/ui/introArt.u4.generated.ts
import type { OpenerPack } from "../opener";
import { lid } from "./lid";
import { spill } from "./spill";
import { wrap } from "./wrap";
import { ramen } from "./ramen";

export const U4_OPENERS: OpenerPack = {
  scenes: { "u4-lid": lid, "u4-spill": spill, "u4-wrap": wrap, "u4-ramen": ramen },
  art: () => import("../../../../ui/introArt.u4.generated"),
};
