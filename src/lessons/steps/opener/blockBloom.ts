// [도입] u2l5 blockbloom: 「블록으로 꽃 만들기, 몇 번 모을까?」
// 형식: 내기를 걸고(한 번, 두 번, 세 번), 버튼을 꾹 눌러 블록을 모은다. 일찍 떼면 다시 흩어진다.
//   1 바닥에 흩어진 블록 열 개. 처음 화면에서 바로 예측한다.
//   2 한 번 꾹: 블록이 모여 부품 셋(꽃송이, 줄기, 잎)이 된다. 또 한 번 꾹: 부품이 모여 꽃이 된다.
//   3 쌤이 예측과 견주어 말하고 랩(세포가 모이면 무엇이 될까)으로 넘긴다.
// 도입은 구성 단계의 이름을 말하지 않는다(이름은 랩 뒤의 개념이 붙인다).
// 블록의 자리는 그림의 CSS 변수에 있고(qa/sketch/scenes/intro-u2-rest.mjs), 무대의 클래스(to1, s1, to2, s2)가 자리를 고른다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const HOLD = 900;
const PICKS = ["두 번", "한 번", "세 번"];

export function blockBloom(c: OpenerCtx): void {
  const count = el("div", { class: "opn-tag opn-bb-count", text: "모은 횟수 0번" });
  c.stage.append(el("div", { class: "opn-layer", html: c.art.blockbloomBase }), count);
  const label = el("span", { text: "꾹 눌러 모으기" });
  const btn = el("button", { class: "opn-hold", attrs: { type: "button" } }, el("i", {}), label) as HTMLButtonElement;
  c.controls.appendChild(btn);

  let phase: "ask" | "play" | "done" = "ask";
  let pick = PICKS[0];
  let level = 0;
  let timer = 0;
  let holding = false;

  function commit(): void {
    holding = false;
    level += 1;
    c.stage.classList.remove("hold", "to1", "to2");
    c.stage.classList.add(`s${level}`);
    btn.classList.remove("on");
    count.textContent = `모은 횟수 ${level}번`;
    c.step.dataset.opnLevel = String(level);
    haptic(HAPTIC.correct);
    if (level === 1) {
      label.textContent = "한 번 더 꾹 누르기";
      c.say("블록이 모여 <b>꽃송이, 줄기, 잎</b>이 됐어요. 한 번 더 모아 볼까요?");
      return;
    }
    phase = "done";
    c.controls.hidden = true;
    c.face("smile");
    c.say(`${pick === PICKS[0] ? "예측대로 두 번!" : "두 번이면 돼요!"} 블록이 부품으로, 부품이 꽃으로. <b>세포</b>도 이렇게 모일까요?`);
    c.finish();
  }
  function press(): void {
    if (phase !== "play" || holding) return;
    holding = true;
    c.stage.classList.add("hold", `to${level + 1}`);
    btn.classList.add("on");
    haptic(HAPTIC.tap);
    timer = c.later(commit, HOLD);
  }
  function release(): void {
    if (!holding) return;
    holding = false;
    c.cancel(timer);
    c.stage.classList.remove("hold", "to1", "to2");
    btn.classList.remove("on");
    c.say("일찍 떼면 다시 흩어져요. 다 모일 때까지 <b>꾹</b> 눌러 주세요.");
  }
  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointerleave", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  // 키보드로 누르면 떼는 일 없이 끝까지 모은다
  btn.addEventListener("click", (e) => {
    if (e.detail === 0) press();
  });

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  c.step.dataset.opnLevel = "0";
  c.ask("흩어진 블록을 모아 <b>꽃</b>을 만들어요. 몇 번 모으면 완성될까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! 아래 버튼을 <b>꾹 눌러</b> 블록을 모아 보세요.",
    onDone: (picked) => {
      pick = PICKS.find((p) => p === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.controls.hidden = false;
      c.face("curious");
    },
  });
}
