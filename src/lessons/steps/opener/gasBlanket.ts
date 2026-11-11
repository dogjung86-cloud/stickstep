// [Ⅰ단원 도입] u1l5 blanket: 「지구를 덮은 기체, 두꺼워지면?」
// 형식: 내기를 걸고, 기체를 늘렸다 줄였다 하며 온도계를 본다(되돌릴 수 있다). 끝에서 예측과 견준다.
//   1 처음 화면: 굴뚝이 있는 지구를 기체 한 겹이 덮고 있다. 바로 예측: 이 담요가 두꺼워지면 지구의 온도는.
//   2 "늘리기"를 누르면 겹이 늘고, 빠져나가던 열 화살표가 하나씩 되돌아오며 온도계가 오른다. "줄이기"는 그 반대다.
//   3 가장 두껍게 해 본 뒤 한 번 줄이면 끝: 예측과 견주고, 겪은 기체에 온실 기체라는 이름을 붙인다.
//     맺는 물음("얇게 하려면 무엇을 해야 할까")을 바로 뒤의 실천 분류가 받는다.
// 사실: 이산화 탄소 같은 온실 기체는 지구가 내보내는 열의 일부를 붙잡아 되돌린다. 양이 늘면 지구의 평균 온도가 오른다.
// 온실 기체는 원래도 있으므로 가장 얇은 상태도 한 겹이다(0겹으로 내리지 않는다). 가장 두꺼울 때도 열 하나는 빠져나간다.
// 기체는 눈에 보이지 않으므로 그려서 보여 준다고 말로 알린다. 온도계에는 숫자가 없다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const MIN = 1;
const MAX = 3;
const LEVEL = [0, 0.34, 0.6, 0.9]; // 겹 수에 따른 온도계 기둥 높이
const PICKS: Array<{ t: string; verdict: string }> = [
  { t: "올라가요", verdict: "예측대로" },
  { t: "그대로예요", verdict: "예측과 달리" },
  { t: "내려가요", verdict: "예측과 달리" },
];

export function gasBlanket(c: OpenerCtx): void {
  c.stage.append(el("div", { class: "opn-layer", html: c.art.blanketBase }));
  const col = c.stage.querySelector<SVGElement>(".opn-bl-col");
  let phase: "ask" | "play" | "done" = "ask";
  let lv = MIN;
  let sawMax = false;
  let pred = PICKS[0];
  const mk = (cls: string, label: string, sub: string, d: number): HTMLButtonElement => {
    const b = el("button", { class: `opn-u1-btn ${cls}`, attrs: { type: "button" } }, el("b", { text: label }), el("span", { text: sub })) as HTMLButtonElement;
    b.addEventListener("click", () => step(d));
    c.controls.appendChild(b);
    return b;
  };
  const up = mk("up", "늘리기", "기체를 더 뿜어요", 1);
  const down = mk("down", "줄이기", "기체를 덜어 내요", -1);

  function paint(): void {
    for (let i = MIN; i <= MAX; i++) c.stage.classList.toggle(`lv-${i}`, lv === i);
    if (col) col.style.transform = `scaleY(${LEVEL[lv]})`;
    up.disabled = phase !== "play" || lv >= MAX;
    down.disabled = phase !== "play" || lv <= MIN;
    c.step.dataset.opnLevel = String(lv);
  }

  function step(d: number): void {
    if (phase !== "play") return;
    const next = lv + d;
    if (next < MIN || next > MAX) return;
    lv = next;
    haptic(HAPTIC.tap);
    if (d > 0) {
      // 굴뚝에서 한 덩이가 올라온다(애니메이션을 다시 건다)
      c.stage.classList.remove("puff");
      void c.stage.offsetWidth;
      c.stage.classList.add("puff");
    }
    if (lv === MAX && !sawMax) {
      sawMax = true;
      c.face("surprised");
      paint();
      c.say("빠져나가던 <b>열</b>이 담요에 막혀요. 이번엔 <b>줄여</b> 보세요.");
      return;
    }
    if (d < 0 && sawMax) {
      phase = "done";
      paint();
      c.face("smile");
      haptic(HAPTIC.correct);
      c.say(`${pred.verdict} 담요가 두꺼울수록 더워져요. 이 기체가 <b>온실 기체</b>예요. 얇게 하려면 어떻게 할까요?`);
      c.finish();
      return;
    }
    paint();
  }

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  paint();
  c.ask("굴뚝에서 나온 기체가 지구를 담요처럼 덮어요. 담요가 두꺼워지면 지구의 온도는?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 안 보이는 기체를 그려 놓았어요. <b>늘려</b> 보세요.",
    onDone: (picked) => {
      pred = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.step.dataset.opnPred = String(PICKS.indexOf(pred));
      c.stage.classList.add("play");
      c.controls.hidden = false;
      c.face("curious");
      paint();
    },
  });
}
