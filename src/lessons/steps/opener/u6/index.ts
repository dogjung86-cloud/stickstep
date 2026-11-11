// 중1 Ⅵ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "u6-"로 시작한다. 내용 파일에서 opener({ title, scene: "u6-ice", wait, cta }).
// 그림: qa/sketch/scenes/intro-u6.mjs → node qa/sketch/build-intro.mjs u6 → src/ui/introArt.u6.generated.ts
// 장면 코드(./scenes.ts)는 c.art(그림 표)와 c.meta(좌표)를 이 단원의 표로 읽는다.
import type { OpenerPack } from "../opener";
import { iceBear, bubbleWrap, foilBalloon, pingPong } from "./scenes";

export const U6_OPENERS: OpenerPack = {
  scenes: { "u6-ice": iceBear, "u6-wrap": bubbleWrap, "u6-foil": foilBalloon, "u6-pong": pingPong },
  art: () => import("../../../../ui/introArt.u6.generated"),
};
