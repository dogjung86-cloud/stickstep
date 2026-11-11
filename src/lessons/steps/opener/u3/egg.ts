// [Ⅲ단원 도입] u3l2 u3-egg: 「갓 삶은 달걀을 찬물에 넣으면?」
// 형식: 내기를 걸고, 달걀을 꾹 눌러 찬물에 담그고 있는 동안 두 온도계를 본다. 끝에서 예측과 견준다.
//   1 처음 화면: 김 나는 달걀, 찬물 그릇, 온도계 둘(달걀 것은 높고 물 것은 낮다). 바로 예측(정오를 매기지 않는다).
//   2 누르는 동안 달걀이 물에 잠기고, 달걀의 온도계는 내려가고 물의 온도계는 올라간다. 손을 떼면 달걀이 나오고 멈춘다.
//   3 끝: 두 온도계가 같은 높이에서 멈춘다. "왜 거기서 멈출까"로 맺어 바로 뒤의 열량계 랩으로 넘긴다.
// 도입은 "열이 이동한다"와 "열평형"을 말하지 않는다. 온도계에는 숫자가 없다(기둥 높이만 견준다).
// 사실: 물이 달걀보다 훨씬 많아서 같아지는 온도는 물의 처음 온도 쪽에 가깝다.

import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { hitBtn, holdFill, metaOf } from "./util";

const EGG0 = 0.9;
const WATER0 = 0.16;
const END = 0.36;
const PICKS = ["달걀만 식는다", "물만 미지근해진다", "달걀은 식고 물은 미지근해진다"];
const TUBE = { top: 136, bottom: 440 }; // 기둥의 꼭대기와 바닥(그림 좌표)

export function egg(c: OpenerCtx): void {
  const M = metaOf(c).egg;
  c.stage.insertAdjacentHTML("beforeend", `<div class="opn-layer">${c.art.eggBase}</div>`);
  const colEgg = c.stage.querySelector<SVGElement>(".opn-u3-col.egg");
  const colWater = c.stage.querySelector<SVGElement>(".opn-u3-col.water");
  const steam = c.stage.querySelector<SVGElement>(".opn-u3-eggsteam");
  const level = c.stage.querySelector<SVGElement>(".opn-u3-level");
  let phase: "ask" | "play" | "done" = "ask";
  let pred = "";

  const btn = hitBtn(c, M.hit as unknown as [number, number, number, number], "달걀을 꾹 눌러 찬물에 담그기");
  holdFill(c, btn, {
    need: 2600,
    can: () => phase === "play",
    onDown: () => c.stage.classList.add("dip", "touched"),
    onUp: (finished) => {
      if (finished) return;
      c.stage.classList.remove("dip");
      c.say("손을 떼니 달걀이 물 밖으로 나왔어요. 끝까지 <b>꾹</b> 눌러 주세요.");
    },
    paint: (p) => {
      const e = p * (2 - p); // 처음에 빨리, 갈수록 천천히
      if (colEgg) colEgg.style.transform = `scaleY(${EGG0 + (END - EGG0) * e})`;
      if (colWater) colWater.style.transform = `scaleY(${WATER0 + (END - WATER0) * e})`;
      if (steam) steam.style.opacity = String(1 - e);
      c.step.dataset.opnHeat = p.toFixed(2);
    },
    done: () => {
      phase = "done";
      c.stage.classList.add("done");
      level?.setAttribute("transform", `translate(0 ${TUBE.bottom - (TUBE.bottom - TUBE.top) * END})`);
      c.face("surprised");
      haptic(HAPTIC.correct);
      const head = pred === PICKS[2] ? "예측대로" : "예측과 달리";
      c.say(`${head} 달걀은 식고 물은 미지근해졌어요. 두 온도계가 <b>같은 높이</b>에서 멈췄네요. 왜일까요?`);
      c.finish();
    },
  });

  c.step.dataset.opnPhase = "ask";
  c.ask("갓 삶은 뜨거운 달걀을 찬물에 담가 두면 어떻게 될까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>달걀</b>을 꾹 눌러 찬물에 담가 보세요.",
    onDone: (picked) => {
      pred = picked;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
