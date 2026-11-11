// [도입] u2l4 longcell: 「유난히 긴 세포, 얼마나 길까?」
// 형식: 내기를 먼저 걸고, 버튼을 꾹 눌러 확인한다.
//   1 처음 화면에서 바로 예측(정오를 매기지 않는다. 답은 손이 알려 준다)
//   2 아래 버튼을 누르고 있는 동안 허리에서 시작한 세포가 다리를 따라 자라고 길이 숫자가 오른다. 손을 떼면 멈춘다.
//     내 예측은 다리 위에 파란 점으로 찍혀 있다.
//   3 발끝(약 100 cm)에 닿으면 끝. 쌤이 예측과 견주고 "무슨 일을 할까"로 랩에 넘긴다(답은 말하지 않는다).
// 2026-11-12 사용자 피드백으로 다시 짰다: 옆으로 미는 줄자 띠, 돋보기, 이름표, 중간 말을 걷어 냈다.
//   그림은 아이 하나와 세포 하나뿐이고, 조작은 제자리에서 누르고 있기라 폰에서 손가락이 화면 밖으로 나가지 않는다.
// 과학 가드: 허리(등뼈 속)에서 발끝까지 이어지는 신경세포가 약 1 m다. "가장 긴 세포"라고 하지 않는다.
// 움직임은 CSS와 setTimeout만 쓴다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const PICKS = [
  { t: "다리 길이쯤 (약 1 m)", cm: 100, vs: "" },
  { t: "한 뼘쯤 (약 20 cm)", cm: 20, vs: "예측한 한 뼘의 <b>다섯 배</b>예요." },
  { t: "손가락 길이쯤 (약 7 cm)", cm: 7, vs: "예측한 손가락 길이의 <b>열네 배</b>쯤이에요." },
];
const FULL_MS = 3600; // 처음부터 끝까지 누르고 있는 시간
const TICK = 16;

export function longCell(c: OpenerCtx): void {
  const S = c.meta.stage;
  const kid = el("div", { class: "opn-layer", html: c.art.longcellKid });
  const num = el("b", { class: "opn-lc-cm", text: "?" });
  const cap = el("span", { class: "opn-lc-cap", text: "허리에서 발끝까지" });
  const read = el("div", { class: "opn-lc-read" }, el("div", { class: "opn-lc-val" }, el("span", { class: "opn-lc-about", text: "약 " }), num, el("span", { text: " cm" })), cap);
  const pin = el("div", { class: "opn-lc-pin" }, el("span", { text: "내 예측" }));
  c.stage.append(kid, read, pin);

  const hold = el("button", { class: "opn-lc-hold", type: "button", text: "꾹 눌러서 세포 따라가기" });
  c.controls.appendChild(hold);
  c.controls.hidden = true;

  const trace = kid.querySelector<SVGPathElement>(".opn-lc-trace");
  const tip = kid.querySelector<SVGCircleElement>(".opn-lc-tip");
  const total = trace?.getTotalLength() ?? 0;
  const at = (cm: number): { x: number; y: number } => (trace && total ? trace.getPointAtLength((total * cm) / 100) : { x: 0, y: 0 });

  let phase: "ask" | "pull" | "done" = "ask";
  let cm = 0;
  let pred = PICKS[0];
  let passed = false;
  let timer = 0;
  let lastTen = 0;

  function paint(): void {
    if (trace) trace.style.strokeDasharray = `${cm} 100`;
    if (tip) {
      const p = at(cm);
      tip.setAttribute("cx", String(Math.round(p.x * 10) / 10));
      tip.setAttribute("cy", String(Math.round(p.y * 10) / 10));
    }
    if (phase !== "ask") num.textContent = String(Math.round(cm));
    c.step.dataset.opnCm = String(Math.round(cm));
    const ten = Math.floor(cm / 10);
    if (ten !== lastTen) {
      lastTen = ten;
      haptic(HAPTIC.tap);
    }
  }

  function arrive(): void {
    phase = "done";
    stop();
    c.step.dataset.opnPhase = "done";
    c.stage.classList.add("done");
    c.stage.classList.remove("pull");
    c.controls.hidden = true;
    haptic(HAPTIC.correct);
    c.face("surprised");
    const head = pred.cm === 100 ? "예측대로 <b>약 1 m</b>!" : `<b>약 1 m</b>! ${pred.vs}`;
    c.say(`${head} 이렇게 길쭉한 세포는 무슨 <b>일</b>을 할까요?`);
    c.finish();
  }

  function tick(): void {
    timer = 0;
    if (phase !== "pull") return;
    cm = Math.min(100, cm + (100 * TICK) / FULL_MS);
    paint();
    if (!passed && pred.cm < 100 && cm >= pred.cm + 6) {
      passed = true;
      c.say("내 예측은 <b>벌써 지났어요</b>. 계속 눌러 보세요!");
    }
    if (cm >= 100) arrive();
    else timer = c.later(tick, TICK);
  }
  function start(): void {
    if (phase !== "pull" || timer) return;
    hold.classList.add("on");
    timer = c.later(tick, TICK);
  }
  function stop(): void {
    hold.classList.remove("on");
    if (timer) c.cancel(timer);
    timer = 0;
  }

  hold.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    try {
      hold.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    start();
  });
  hold.addEventListener("pointerup", stop);
  hold.addEventListener("pointercancel", stop);
  hold.addEventListener("contextmenu", (e) => e.preventDefault()); // 길게 누를 때 뜨는 메뉴를 막는다
  hold.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      start();
    }
  });
  hold.addEventListener("keyup", stop);
  hold.addEventListener("blur", stop);

  paint();
  c.step.dataset.opnPhase = "ask";
  c.ask("허리에서 시작하는 이 <b>신경세포</b>, 얼마나 길까요?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 아래 버튼을 <b>꾹 눌러</b> 확인해 보세요.",
    onDone: (picked) => {
      pred = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      phase = "pull";
      c.step.dataset.opnPhase = "pull";
      c.step.dataset.opnPred = String(pred.cm);
      c.stage.classList.add("pull");
      c.controls.hidden = false;
      // 내 예측을 다리 위에 찍는다
      const p = at(pred.cm);
      pin.style.left = `${(p.x / S.w) * 100}%`;
      pin.style.top = `${(p.y / S.h) * 100}%`;
      c.face("curious");
      paint();
    },
  });
}
