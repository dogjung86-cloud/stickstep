// 중1 Ⅶ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "u7-"로 시작한다. 예: scenes: { "u7-campfire": campfire }  →  내용 파일에서 opener({ title, scene: "u7-campfire", wait, cta })
// 그림: qa/sketch/scenes/intro-u7.mjs 에 build(add)를 내보내고 `node qa/sketch/build-intro.mjs u7` 을 돌리면
//       src/ui/introArt.u7.generated.ts 가 생긴다. 그 뒤 아래에 art 를 단다:
//       art: () => import("../../../../ui/introArt.u7.generated"),
// 장면 코드는 c.art(그림 표)와 c.meta(좌표)를 받는다. c.meta 는 이 단원의 표다:
//       const M = c.meta as unknown as typeof import("../../../../ui/introArt.u7.generated")["INTRO_META"];
import type { OpenerPack } from "../opener";

export const U7_OPENERS: OpenerPack = { scenes: {} };
