// [Ⅲ단원 도입] u3l1 u3-cups: 「똑같아 보이는 두 컵, 무엇이 다를까?」
// 형식: 내기를 걸고, 두 컵의 뚜껑을 눌러 열어 본다. 끝에서 예측과 견준다.
//   1 처음 화면: 뚜껑 덮인 똑같은 컵 둘. 바로 예측(뜨거운 물은 어느 쪽일까. 정오를 매기지 않는다).
//   2 컵을 누르면 뚜껑이 열린다. 오른쪽은 김이 오르고(뜨거운 물), 왼쪽은 얼음이 떠 있다(찬물).
//   3 끝: 겉은 똑같았는데 물속은 무엇이 다를까, 로 맺어 바로 뒤의 입자 확대 랩으로 넘긴다.
// 도입은 "입자"와 "입자 운동"을 말하지 않는다(뒤의 랩이 보여 준다).

import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { hitBtn, metaOf } from "./util";

type Side = "left" | "right";
const PICKS = ["왼쪽 컵", "오른쪽 컵", "겉만 봐서는 모른다"];

export function cups(c: OpenerCtx): void {
  const M = metaOf(c).cups;
  c.stage.insertAdjacentHTML("beforeend", `<div class="opn-layer">${c.art.cupsBase}</div>`);
  let phase: "ask" | "play" | "done" = "ask";
  let pred = "";
  const opened = new Set<Side>();

  const open = (side: Side): void => {
    if (phase !== "play" || opened.has(side)) return;
    opened.add(side);
    haptic(HAPTIC.tap);
    c.stage.classList.add(`open-${side}`, "touched");
    const hot = M[side].kind === "hot";
    c.face(hot ? "surprised" : "curious");
    if (opened.size < 2) c.say(hot ? "김이 모락모락! 이쪽이 <b>뜨거운 물</b>이에요. 다른 컵도 열어 봐요." : "얼음이 동동, 이쪽은 <b>찬물</b>이네요. 다른 컵도 열어 봐요.");
    else c.later(wrapUp, 700);
  };

  function wrapUp(): void {
    phase = "done";
    c.stage.classList.add("done");
    haptic(HAPTIC.correct);
    const head = pred === PICKS[1] ? "예측대로 오른쪽이 뜨거웠어요." : pred === PICKS[0] ? "예측과 달리 오른쪽이 뜨거웠어요." : "맞아요, 열기 전에는 알 수 없었죠.";
    c.say(`${head} 겉은 똑같은데 <b>물속</b>은 무엇이 다를까요?`);
    c.finish();
  }

  (["left", "right"] as Side[]).forEach((side) => {
    const b = hitBtn(c, [M[side].x - M.hit.w / 2, M.hit.y, M.hit.w, M.hit.h], side === "left" ? "왼쪽 컵 뚜껑 열기" : "오른쪽 컵 뚜껑 열기");
    b.classList.add("cup");
    b.addEventListener("click", () => open(side));
  });

  c.step.dataset.opnPhase = "ask";
  c.ask("똑같이 생긴 두 컵이에요. 한쪽에만 뜨거운 물이 들었어요. 어느 쪽일까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! 두 컵을 <b>눌러서</b> 뚜껑을 열어 보세요.",
    onDone: (picked) => {
      pred = picked;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
