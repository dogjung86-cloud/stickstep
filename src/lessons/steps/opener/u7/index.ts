// 중1 Ⅶ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "u7-"로 시작한다. 내용 파일(content/unit7v5.ts)에서 opener({ title, scene: "u7-…", wait, cta })로 쓴다.
// 그림: qa/sketch/scenes/intro-u7.mjs → node qa/sketch/build-intro.mjs u7 → src/ui/introArt.u7.generated.ts(생성물, 손으로 고치지 않는다).
// 다섯 장면 모두 같은 형식이다: 내기(예측)를 먼저 걸고 → 누르기 또는 꾹 누르기로 장면을 바꾸고 → 끝에서 예측과 견준다.
// 까닭(원리)은 도입에서 말하지 않고 바로 뒤의 랩이 받는다. 시트는 styles/u7v5.css의 .opn-u7- 구역.
import type { OpenerPack } from "../opener";
import { brightDot } from "./brightDot";
import { jupiterRow } from "./jupiterRow";
import { shadowTurn } from "./shadowTurn";
import { moonWeek } from "./moonWeek";
import { bittenSun } from "./bittenSun";

export const U7_OPENERS: OpenerPack = {
  scenes: { "u7-brightdot": brightDot, "u7-jupiterrow": jupiterRow, "u7-shadowturn": shadowTurn, "u7-moonweek": moonWeek, "u7-bittensun": bittenSun },
  art: () => import("../../../../ui/introArt.u7.generated"),
};
