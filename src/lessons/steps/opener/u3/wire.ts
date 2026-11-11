// [Ⅲ단원 도입] u3l5 u3-wire: 「한여름의 전깃줄은 어떻게 될까?」
// 형식: 내기를 걸고, 여름과 겨울을 오가며 전깃줄을 본다(되돌릴 수 있다). 끝에서 예측과 견준다.
//   1 처음 화면: 겨울. 눈구름 아래 두 전봇대 사이에 전깃줄이 팽팽하다. 바로 예측(정오를 매기지 않는다).
//   2 "여름으로"를 누르면 해가 뜨고 전깃줄이 축 늘어진다. "겨울로"를 누르면 다시 팽팽해진다.
//   3 여름을 본 뒤 겨울로 한 번 돌아오면 끝: 전봇대는 그대로인데 줄에 무슨 일이 생겼을까, 로 맺어 막대 가열 랩으로 넘긴다.
// 도입은 "열팽창"과 "길이가 늘어난다"를 말하지 않는다(뒤의 랩이 눈금으로 보여 준다).
// 전깃줄은 이 코드가 그린다(두 이음 자리를 잇는 곡선, 늘어진 깊이만 바뀐다). 늘어짐은 잘 보이게 실제보다 크게 그렸다.

import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { metaOf } from "./util";

type Season = "winter" | "summer";
const PICKS = ["더 축 처진다", "더 팽팽해진다", "그대로다"];

export function wire(c: OpenerCtx): void {
  const M = metaOf(c).wire;
  const S = metaOf(c).stage;
  c.stage.insertAdjacentHTML("beforeend", `<div class="opn-layer">${c.art.wireBase}</div>`);
  c.stage.insertAdjacentHTML("beforeend", `<div class="opn-layer"><svg viewBox="0 0 ${S.w} ${S.h}" aria-hidden="true"><path class="opn-u3-wire" fill="none" stroke="#1c1c1e" stroke-width="9" stroke-linecap="round"/></svg></div>`);
  const path = c.stage.querySelector<SVGPathElement>(".opn-u3-wire");
  let phase: "ask" | "play" | "done" = "ask";
  let pred = "";
  let season: Season = "winter";
  let sag: number = M.sagWinter;
  let raf = 0;
  let sawSummer = false;

  const paint = (): void => {
    const [x0, y0] = M.tieL;
    const [x1, y1] = M.tieR;
    path?.setAttribute("d", `M${x0} ${y0} Q${(x0 + x1) / 2} ${y0 + sag * 2} ${x1} ${y1}`);
    c.step.dataset.opnSag = sag.toFixed(0);
  };
  const tweenTo = (target: number, done: () => void): void => {
    cancelAnimationFrame(raf);
    const from = sag;
    const t0 = performance.now();
    const tick = (t: number): void => {
      if (!c.alive()) return;
      const u = Math.min(1, (t - t0) / 900);
      const e = u * u * (3 - 2 * u);
      sag = from + (target - from) * e;
      paint();
      if (u < 1) raf = requestAnimationFrame(tick);
      else done();
    };
    raf = requestAnimationFrame(tick);
  };
  c.onCleanup(() => cancelAnimationFrame(raf));

  const btns = {} as Record<Season, HTMLButtonElement>;
  const sync = (): void => {
    c.stage.classList.toggle("summer", season === "summer");
    btns.summer.disabled = season === "summer" || phase === "done";
    btns.winter.disabled = season === "winter" || phase === "done";
  };
  function go(to: Season): void {
    if (phase !== "play" || season === to) return;
    season = to;
    haptic(HAPTIC.tap);
    c.stage.classList.add("touched");
    c.stage.classList.remove("tight");
    sync();
    if (to === "summer") {
      tweenTo(M.sagSummer, () => {
        sawSummer = true;
        c.face("surprised");
        const head = pred === PICKS[0] ? "예측대로" : "예측과 달리";
        c.say(`${head} 여름엔 <b>축 처졌어요</b>. 이번엔 겨울로 되돌려 봐요.`);
      });
    } else {
      tweenTo(M.sagWinter, () => {
        c.stage.classList.add("tight");
        if (!sawSummer) return;
        phase = "done";
        sync();
        haptic(HAPTIC.correct);
        c.say("겨울엔 다시 팽팽해요. 전봇대 사이는 그대로인데, <b>전깃줄</b>에 무슨 일이 생긴 걸까요?");
        c.finish();
      });
    }
  }
  (["summer", "winter"] as Season[]).forEach((k) => {
    const b = el("button", { class: "opn-u3-btn", attrs: { type: "button" } }, el("b", { text: k === "summer" ? "여름으로" : "겨울로" })) as HTMLButtonElement;
    b.addEventListener("click", () => go(k));
    btns[k] = b;
    c.controls.appendChild(b);
  });
  c.controls.hidden = true;
  paint();
  sync();

  c.step.dataset.opnPhase = "ask";
  c.ask("겨울의 전깃줄이에요. 한여름이 되면 이 전깃줄은 어떻게 될까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>여름으로</b>를 눌러 확인해 보세요.",
    onDone: (picked) => {
      pred = picked;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.controls.hidden = false;
      c.face("curious");
    },
  });
}
