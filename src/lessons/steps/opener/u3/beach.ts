// [Ⅲ단원 도입] u3l4 u3-beach: 「한낮의 해변, 어느 쪽이 더 뜨거울까?」
// 형식: 내기를 걸고, 해를 꾹 눌러 햇볕을 비추는 동안 모래와 바닷물의 온도계를 본다. 끝에서 예측과 견준다.
//   1 처음 화면: 해, 모래밭과 바다, 온도계 둘(같은 높이에서 시작). 바로 예측(정오를 매기지 않는다).
//   2 누르는 동안 햇볕이 똑같이 비치는데 모래의 온도계만 쑥 오른다. 손을 떼면 멈춘다.
//   3 끝: 같은 햇볕인데 모래만 뜨겁다. "왜 물은 천천히 데워질까"로 맺어 물과 식용유 가열 랩으로 넘긴다.
// 도입은 "비열"을 말하지 않는다. 온도계에는 숫자가 없다.
// 사실: 한낮의 모래는 바닷물보다 온도가 훨씬 많이 오른다(물은 같은 열을 받아도 온도가 덜 변한다).

import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { hitBtn, holdFill, metaOf } from "./util";

const START = 0.2;
const END = { sand: 0.94, sea: 0.36 };
const PICKS = ["모래", "바닷물", "둘이 비슷하다"];

export function beach(c: OpenerCtx): void {
  const M = metaOf(c).beach;
  c.stage.insertAdjacentHTML("beforeend", `<div class="opn-layer">${c.art.beachBase}</div>`);
  const colSand = c.stage.querySelector<SVGElement>(".opn-u3-col.sand");
  const colSea = c.stage.querySelector<SVGElement>(".opn-u3-col.sea");
  let phase: "ask" | "play" | "done" = "ask";
  let pred = "";

  const btn = hitBtn(c, M.hit as unknown as [number, number, number, number], "해를 꾹 눌러 햇볕 비추기", true);
  holdFill(c, btn, {
    need: 2400,
    can: () => phase === "play",
    onDown: () => c.stage.classList.add("lit", "touched"),
    onUp: (finished) => {
      c.stage.classList.remove("lit");
      if (!finished) c.say("손을 떼니 햇볕이 멈췄어요. 끝까지 <b>꾹</b> 눌러 주세요.");
    },
    paint: (p) => {
      if (colSand) colSand.style.transform = `scaleY(${START + (END.sand - START) * p})`;
      if (colSea) colSea.style.transform = `scaleY(${START + (END.sea - START) * p})`;
      c.step.dataset.opnHeat = p.toFixed(2);
    },
    done: () => {
      phase = "done";
      c.stage.classList.add("done");
      c.face("surprised");
      haptic(HAPTIC.correct);
      const head = pred === PICKS[0] ? "예측대로" : "예측과 달리";
      c.say(`${head} <b>모래</b>만 훨씬 뜨거워졌어요. 햇볕은 똑같이 받았는데, 물은 왜 천천히 데워질까요?`);
      c.finish();
    },
  });

  c.step.dataset.opnPhase = "ask";
  c.ask("한낮의 해변이에요. 같은 햇볕을 받은 모래와 바닷물, 어느 쪽이 더 뜨거울까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>해</b>를 꾹 눌러 햇볕을 비춰 보세요.",
    onDone: (picked) => {
      pred = picked;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
