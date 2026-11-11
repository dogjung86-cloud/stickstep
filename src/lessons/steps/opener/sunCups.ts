// [Ⅰ단원 도입] u1l2 suncups: 「어느 컵이 가장 뜨거워질까?」
// 형식: 내기를 걸고, 해를 꾹 눌러 햇빛을 비추며 온도계를 지켜본다. 끝에서 예측과 견준다.
//   1 처음 화면: 검은, 파란, 흰 색종이로 감싼 물컵 셋과 해. 바로 예측(정오를 매기지 않는다).
//   2 해를 누르고 있는 동안만 햇빛이 비치고 세 온도계가 저마다 다른 빠르기로 오른다. 손을 떼면 멈춘다.
//   3 끝: 가장 뜨거운 것은 파란 컵이다. 검은 컵만 파라솔 그늘에 있었기 때문이다(파라솔은 처음부터 그림에 있다).
//     "이러면 색깔 탓인지 알 수 없다"로 맺어, 바로 뒤의 변인 통제 분류(무엇을 다르게, 무엇을 같게)로 넘긴다.
// 도입은 공정한 실험의 결과(검은 컵이 가장 많이 오른다)를 말하지 않는다. 그 답은 뒤의 자료 해석 스텝이 준다.
// 사실: 햇빛을 받는 두 컵 가운데는 어두운 파란 쪽이 흰 쪽보다 빛을 더 흡수해 더 많이 오른다. 그늘의 컵은 거의 오르지 않는다.
// 온도계에는 숫자가 없다(기둥 높이만 견준다). 움직임은 누르는 동안의 rAF 하나다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

type Cup = "black" | "blue" | "white";
const CUPS: Cup[] = ["black", "blue", "white"];
const NAME: Record<Cup, string> = { black: "검은 컵", blue: "파란 컵", white: "흰 컵" };
const START = 0.2;
const END: Record<Cup, number> = { blue: 0.94, white: 0.66, black: 0.3 }; // 기둥 높이(관 길이 대비)
const NEED = 2400; // 다 오르는 데 눌러야 하는 시간(ms)

export function sunCups(c: OpenerCtx): void {
  const M = c.meta.suncups;
  const S = c.meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  c.stage.append(el("div", { class: "opn-layer", html: c.art.suncupsBase }));
  const cols = {} as Record<Cup, SVGElement | null>;
  for (const k of CUPS) cols[k] = c.stage.querySelector<SVGElement>(`.opn-sc-col.c-${k}`);
  const [hx, hy, hw, hh] = M.hit;
  const sunBtn = el("button", {
    class: "opn-sc-hit",
    attrs: { type: "button", "aria-label": "해를 꾹 눌러 햇빛 비추기" },
    style: { left: pct(hx, S.w), top: pct(hy, S.h), width: pct(hw, S.w), height: pct(hh, S.h) },
  }) as HTMLButtonElement;
  c.stage.append(sunBtn);

  let phase: "ask" | "play" | "done" = "ask";
  let pred: Cup = "black";
  let heat = 0; // 0~1
  let holding = false;
  let last = 0;
  let raf = 0;

  const paint = (): void => {
    for (const k of CUPS) {
      const col = cols[k];
      if (col) col.style.transform = `scaleY(${START + (END[k] - START) * heat})`;
    }
    c.step.dataset.opnHeat = heat.toFixed(2);
  };

  function wrapUp(): void {
    phase = "done";
    c.stage.classList.add("done");
    c.face("surprised");
    haptic(HAPTIC.correct);
    const head = pred === "blue" ? "예측대로" : "예측과 달리";
    c.say(`${head} <b>파란 컵</b>이 가장 뜨거워요. 그런데 검은 컵만 <b>그늘</b>에 있었네요. 공정하게 다시 해 봐요.`);
    c.finish();
  }

  function release(end = false): void {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    c.stage.classList.remove("lit");
    if (!end && phase === "play" && heat < 1) c.say("손을 떼니 햇빛이 멈췄어요. 끝까지 <b>꾹</b> 눌러 주세요.");
  }
  function add(d: number): void {
    heat = Math.min(1, heat + d);
    paint();
    if (heat >= 1 && phase === "play") {
      release(true);
      wrapUp();
    }
  }
  const tick = (t: number): void => {
    if (!holding || !c.alive()) return;
    const d = (t - last) / NEED;
    last = t;
    add(d);
    if (holding) raf = requestAnimationFrame(tick);
  };
  function press(): void {
    if (phase !== "play" || holding) return;
    holding = true;
    last = performance.now();
    c.stage.classList.add("lit", "touched");
    haptic(HAPTIC.tap);
    raf = requestAnimationFrame(tick);
  }

  sunBtn.addEventListener("pointerdown", (e) => {
    try {
      sunBtn.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    press();
  });
  sunBtn.addEventListener("pointerup", () => release());
  sunBtn.addEventListener("pointercancel", () => release());
  sunBtn.addEventListener("contextmenu", (e) => e.preventDefault());
  // 키보드: 누를 때마다 조금씩 비춘다
  sunBtn.addEventListener("click", (e) => {
    if (e.detail !== 0 || phase !== "play") return;
    c.stage.classList.add("touched");
    add(0.34);
  });
  c.onCleanup(() => cancelAnimationFrame(raf));

  c.step.dataset.opnPhase = "ask";
  paint();
  c.ask("검은, 파란, 흰 색종이로 감싼 물컵이에요. 햇빛을 받으면 어느 컵이 가장 뜨거워질까요?", {
    choices: CUPS.map((k) => NAME[k]),
    neutral: true,
    good: "예측 완료! <b>해</b>를 꾹 눌러 햇빛을 비춰 보세요.",
    onDone: (picked) => {
      pred = CUPS.find((k) => NAME[k] === picked) ?? "black";
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.step.dataset.opnPred = pred;
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
