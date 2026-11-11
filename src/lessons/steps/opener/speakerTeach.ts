// [Ⅰ단원 도입] u1l4 speaker: 「말을 알아듣는 스피커, 비결은?」
// 형식: 내기를 걸고, 들려줄 양을 골라 직접 들려주며 확인한다(어느 것부터 해도 된다).
//   1 처음 화면: 아이와 새 스피커. 바로 예측: 말을 얼마나 들려줘야 알아들을까(정오를 매기지 않는다).
//   2 버튼 셋(한 번, 열 번, 수천 번) 가운데 하나를 누르면 그만큼 말소리가 스피커로 흘러가고 등이 켜진다.
//     한 번과 열 번은 물음표가 뜨고, 수천 번은 음표가 나온다.
//   3 수천 번을 들려주면 끝: 예측과 견주고, 겪은 일("많이 듣고 배운다")에 인공지능이라는 이름을 붙인다.
// 사실: 말소리를 알아듣는 프로그램은 수많은 사람의 말을 듣고 배워서 만든다. 여기의 횟수는 양의 차이를 겪게 하는 어림이고,
// 실제로는 수천 번보다 훨씬 많다(보기와 맺는 말을 "수천 번도 넘게", "수많은 말"로 쓴 까닭이다).
// 움직임은 CSS 키프레임이고 상태는 무대의 클래스(send-1~3, lv-1~3, huh, ok)로 바꾼다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const TRIES = [
  { btn: "한 번", ms: 1000, say: "한 번 들어서는 못 알아들어요." },
  { btn: "열 번", ms: 1500, say: "열 번을 들어도 아직이에요." },
  { btn: "수천 번", ms: 2300, say: "" },
];
const PICKS: Array<{ t: string; verdict: string }> = [
  { t: "수천 번도 넘게", verdict: "예측대로, 수많은 말을 듣고서야" },
  { t: "열 번쯤", verdict: "예측보다 훨씬 많이 듣고서야" },
  { t: "한 번", verdict: "예측보다 훨씬 많이 듣고서야" },
];

export function speakerTeach(c: OpenerCtx): void {
  c.stage.append(el("div", { class: "opn-layer", html: c.art.speakerBase }));
  let phase: "ask" | "play" | "done" = "ask";
  let busy = false;
  let pred = PICKS[0];
  const tried = new Set<number>();
  const btns = TRIES.map((t, i) => {
    const b = el("button", { class: "opn-u1-btn", attrs: { type: "button", "data-n": String(i + 1) } }, el("b", { text: t.btn }), el("span", { text: "들려주기" })) as HTMLButtonElement;
    b.addEventListener("click", () => send(i));
    c.controls.appendChild(b);
    return b;
  });
  const mark = (): void => {
    c.step.dataset.opnTried = [...tried].sort().join(",");
  };

  function send(i: number): void {
    if (phase !== "play" || busy) return;
    busy = true;
    haptic(HAPTIC.tap);
    const cl = c.stage.classList;
    cl.remove("huh", "ok", "lv-1", "lv-2", "lv-3");
    cl.add(`send-${i + 1}`);
    btns.forEach((b) => (b.disabled = true));
    c.face("curious");
    c.later(() => {
      cl.remove(`send-${i + 1}`);
      cl.add(`lv-${i + 1}`);
      tried.add(i);
      btns[i].classList.add("tried");
      mark();
      busy = false;
      if (i < 2) {
        cl.add("huh");
        haptic(HAPTIC.wrong);
        c.say(TRIES[i].say);
        btns.forEach((b) => (b.disabled = false));
        return;
      }
      phase = "done";
      cl.add("ok");
      haptic(HAPTIC.correct);
      c.face("smile");
      c.say(`${pred.verdict} 알아들어요. 이렇게 컴퓨터가 배우는 기술이 <b>인공지능</b>이에요.`);
      c.finish();
    }, TRIES[i].ms);
  }

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  mark();
  c.ask("새 스피커에게 “음악 틀어 줘”를 가르쳐요. 몇 번 들려줘야 알아들을까요?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 아래 버튼으로 말을 <b>들려주며</b> 확인해요.",
    onDone: (picked) => {
      pred = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.step.dataset.opnPred = String(PICKS.indexOf(pred));
      c.stage.classList.add("play");
      c.controls.hidden = false;
    },
  });
}
