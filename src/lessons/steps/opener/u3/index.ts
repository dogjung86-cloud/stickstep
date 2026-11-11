// 중1 Ⅲ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "u3-"로 시작한다. 내용 파일(unit3v5.ts)에서 opener({ title, scene: "u3-cups", wait, cta })로 쓴다.
// 그림: qa/sketch/scenes/intro-u3.mjs → node qa/sketch/build-intro.mjs u3 → src/ui/introArt.u3.generated.ts
// 장면 코드는 c.art(그림 표)와 c.meta(좌표)를 받는다(./util.ts의 metaOf가 이 단원의 표 타입으로 다시 읽는다).
import type { OpenerPack } from "../opener";
import { cups } from "./cups";
import { egg } from "./egg";
import { beach } from "./beach";
import { wire } from "./wire";

export const U3_OPENERS: OpenerPack = {
  scenes: { "u3-cups": cups, "u3-egg": egg, "u3-beach": beach, "u3-wire": wire },
  art: () => import("../../../../ui/introArt.u3.generated"),
};
