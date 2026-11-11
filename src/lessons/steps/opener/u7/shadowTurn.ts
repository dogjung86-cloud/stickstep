// [Ⅶ단원 도입] u7l4 u7-shadowturn: 「그림자는 왜 자리를 옮길까요?」
// 형식: 내기를 걸고, 아침, 한낮, 저녁을 눌러 해를 옮기며 나무 그림자를 본다. 끝에서 예측과 견준다.
// 사실(남쪽을 보고 선 그림): 해는 왼쪽(동)에서 떠서 한낮에 가장 높고 오른쪽(서)으로 진다.
//   그림자는 해의 반대쪽에 눕고 한낮에 가장 짧다.
// 도입은 까닭(지구의 자전)을 말하지 않는다. "정말 해가 움직인 걸까"로 맺어 바로 뒤의 별 움직임 랩으로 넘긴다.
// 정본 훅(shadowclock)은 답한 뒤 "지구가 스스로 돌아서"라고 바로 알려 줬다. 그 답은 랩의 결론으로 옮겼다.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { verdict } from "./hold";

const PICKS = ["왼쪽으로 누워요", "오른쪽 그대로예요", "사라져요"];
const TIMES = [
  { n: 1, name: "아침", sub: "해가 왼쪽에" },
  { n: 2, name: "한낮", sub: "해가 높이" },
  { n: 3, name: "저녁", sub: "해가 오른쪽에" },
];

export function shadowTurn(c: OpenerCtx): void {
  c.stage.append(el("div", { class: "opn-layer", html: c.art.shadowturnBase }));
  let phase: "ask" | "play" | "done" = "ask";
  let hit = true;
  let now = 1;
  const seen = new Set<number>([1]);
  const btns = TIMES.map((t) => {
    const b = el("button", { class: "opn-u7-btn", attrs: { type: "button" }, dataset: { n: String(t.n) } }, el("b", { text: t.name }), el("span", { text: t.sub })) as HTMLButtonElement;
    b.addEventListener("click", () => go(t.n));
    c.controls.appendChild(b);
    return b;
  });
  const paint = (): void => {
    for (const t of TIMES) c.stage.classList.toggle(`t${t.n}`, now === t.n);
    btns.forEach((b, i) => {
      b.classList.toggle("on", TIMES[i].n === now);
      b.disabled = phase !== "play";
    });
    c.step.dataset.opnTime = String(now);
  };
  function go(n: number): void {
    if (phase !== "play" || n === now) return;
    now = n;
    seen.add(n);
    haptic(HAPTIC.tap);
    if (seen.size === 3) {
      phase = "done";
      paint();
      c.face("surprised");
      haptic(HAPTIC.correct);
      c.say(`${verdict(hit)} 그림자는 해의 반대쪽으로 옮겨 가요. 정말 <b>해</b>가 움직인 걸까요? 밤하늘에서 알아봐요.`);
      c.finish();
      return;
    }
    paint();
    c.say(n === 2 ? "한낮에는 해가 높아서 그림자가 짧아요. 이제 <b>저녁</b>도 눌러 보세요." : n === 3 ? "저녁의 그림자를 봤어요. <b>한낮</b>도 눌러 보세요." : "아침이에요. <b>한낮</b>과 <b>저녁</b>을 눌러 보세요.");
  }
  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  paint();
  c.ask("아침에는 해가 왼쪽에 있어 나무 그림자가 오른쪽으로 누워요. 저녁에는 어디로 누울까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>한낮</b>과 <b>저녁</b>을 눌러 해를 옮겨 보세요.",
    onDone: (picked) => {
      hit = picked === PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.controls.hidden = false;
      c.face("curious");
      paint();
    },
  });
}
