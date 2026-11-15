// [중1 Ⅳ v5] u4l2 입자 모형 만들기 랩: 「입자 모형을 만들어 볼까요?」
// 책의 해 보기(물질의 상태를 입자 모형으로 표현하기)를 손으로 한다. 주문받은 상태(액체, 기체, 고체)의 입자 모형을 학생이 만든다.
// 무대는 단원의 입자 뷰(같은 시뮬레이션, 물리 수치 불변). 학생은 '입자의 움직임' 막대를 밀어 입자의 거리, 배열, 움직임을 바꾸고 '이 모형으로 정하기'를 누른다.
// 이 소단원에는 온도가 나오지 않으므로 막대에 온도를 적지 않는다(둔하게에서 활발하게까지).
// 주문과 다른 상태의 모형을 내면 무엇이 달랐는지 알려 준다. 맞으면 같은 모형을 물질의 모습으로 잠깐 보여 준다(모형과 물질을 잇는다).
// 판정 질문은 따로 없다(만든 모형이 곧 판정이다). 한 번도 어긋나지 않았으면 맞힌 것으로 기록한다.
// 그림(2026-11-15, 감사 중·하 후보): 입자의 색은 숨은 온도를 따르지 않고 하나다(같은 입자가 거리와 배열만 바뀐다. 문제 그림 stateTrioFig와 같은 파랑).
//   색은 이 랩의 캔버스에 거는 CSS 필터로만 맞춘다(공용 렌더러는 그대로). 결론 때는 만든 세 모형을 같은 크기로 나란히 다시 보인다
//   (칸마다 같은 엔진과 같은 입자 그림, 입자 수도 같다). 칸 아래의 칩이 그 칸의 이름이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { createLoop } from "../../../core/anim";
import { MatterSim } from "../../../engine/matterSim";
import { DotRenderer } from "../../../renderers/dot";
import { hueFor } from "../../../renderers/palette";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange } from "../bio6/b6Lab";
import { u4Lab, u4Matter, type U4Step } from "./u4Kit";

type Ph = "sol" | "liq" | "gas";
const phaseOf = (t: number): Ph => (t < 0.5 ? "sol" : t < 100 ? "liq" : "gas");
const WORD: Record<Ph, string> = { sol: "고체", liq: "액체", gas: "기체" };
const HINT: Record<Ph, string> = {
  sol: "입자가 가지런히 늘어서 제자리에서만 떨어요",
  liq: "입자가 붙은 채 서로 자리를 바꿔요",
  gas: "입자가 서로 멀리 떨어져 날아다녀요",
};
const ORDER: Ph[] = ["liq", "gas", "sol"];
const HUE = 214; // 입자의 색(문제 그림의 입자 #6E9EDB와 같은 파랑)
const tint = (T: number): string => `hue-rotate(${(HUE - hueFor(T)).toFixed(1)}deg)`;
const TRIO_T: Record<Ph, number> = { liq: 50, gas: 120, sol: -20 }; // 결론 칸의 모형(막대 양끝과 가운데)

export const u4BuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-build" });
  const { f, tm } = lab;

  let T = -20;
  let idx = 0;
  let slips = 0;
  let busy = false;

  const m = u4Matter(lab, { sim: { count: 44, r: 6.2, temp: T, walls: (w, h) => ({ x0: 6, y0: 6, x1: w - 6, y1: h - 46 }) }, view: "particle" });
  m.pill.append(el("span", { text: "입자 모형" }));
  const cvs = Array.from(m.ms.el.querySelectorAll<HTMLCanvasElement>("canvas.mstage-cv:not(.mstage-overlay)"));
  const paintTint = (): void => cvs.forEach((c) => (c.style.filter = tint(T)));
  paintTint();
  const chips = ORDER.map((p) => el("span", { class: "u4x-chip", text: `${WORD[p]}의 모형` }));
  f.stage.appendChild(el("div", { class: "u4x-chips" }, ...chips));
  const paint = (): void => {
    chips.forEach((c, i) => {
      c.classList.toggle("on", i < idx);
      c.classList.toggle("now", i === idx);
    });
    host.dataset.u4Build = String(idx);
  };
  const ask = (): string => `<b>${WORD[ORDER[idx]]}</b>의 입자 모형을 만들어 보세요. 막대로 입자의 움직임을 바꾸고 정해요.`;

  /** 결론: 만든 세 모형을 같은 크기로 나란히(칩 차례대로 액체, 기체, 고체). 칸마다 작은 시뮬레이션 하나와 입자 그림 하나. */
  function showTrio(): void {
    const box = el("div", { class: "u4x-build-trio" });
    const sims: { sim: MatterSim; dot: DotRenderer }[] = [];
    ORDER.forEach((p) => {
      const cv = el("canvas", { class: "u4x-build-cv" }) as HTMLCanvasElement;
      cv.style.filter = tint(TRIO_T[p]);
      box.appendChild(el("div", { class: "u4x-build-cell" }, cv));
      sims.push({ sim: new MatterSim(100, 150, { count: 18, r: 6.2, temp: TRIO_T[p], cols: 6, walls: (w, h) => ({ x0: 4, y0: 4, x1: w - 4, y1: h - 4 }) }), dot: new DotRenderer(cv) });
    });
    f.stage.appendChild(box);
    m.ms.el.style.opacity = "0";
    const fit = (): void =>
      sims.forEach(({ sim, dot }) => {
        dot.resize();
        sim.setSize(Math.max(1, dot.canvas.clientWidth), Math.max(1, dot.canvas.clientHeight));
      });
    requestAnimationFrame(() => {
      fit();
      // 처음부터 자리 잡은 모습으로: 기체는 칸 안에 흩어 놓고, 셋 다 3초 동안 미리 움직여 둔다(액체는 바닥에 고이고 기체는 퍼진다)
      sims.forEach(({ sim }, k) => {
        sim.buildLattice(true);
        if (ORDER[k] === "gas") {
          const b = sim.bounds();
          sim.parts.forEach((p, i) => {
            p.x = b.x0 + 8 + ((i * 37) % 97) / 97 * (b.x1 - b.x0 - 16);
            p.y = b.y0 + 8 + ((i * 61) % 89) / 89 * (b.y1 - b.y0 - 16);
            p.vx = Math.cos(i * 2.4) * 2.5;
            p.vy = Math.sin(i * 2.4) * 2.5;
          });
        }
        for (let i = 0; i < 180; i++) sim.step(1);
      });
    });
    const loop = createLoop((dt) => sims.forEach(({ sim, dot }) => {
      sim.step(dt);
      dot.draw(sim);
    }));
    loop.start();
    window.addEventListener("resize", fit);
    lab.onCleanup(() => {
      loop.stop();
      window.removeEventListener("resize", fit);
      sims.forEach(({ dot }) => dot.dispose());
    });
    host.dataset.u4Trio = "1";
  }

  const range = bvRange({
    cls: "u4x-build-range",
    min: 0,
    max: 100,
    value: 0,
    label: "입자의 움직임: 막대를 밀어 바꿔요",
    ticks: ["둔하게", "활발하게"],
    onInput: (v) => {
      T = -20 + v * 1.4;
      m.ms.setTemp(T);
      paintTint();
      host.dataset.u4T = String(Math.round(T));
    },
  });
  const fix = bvBtn("main u4x-build-fix", "이 모형으로 정하기");
  fix.addEventListener("click", () => {
    if (busy || idx >= ORDER.length) return;
    const want = ORDER[idx];
    const got = phaseOf(T);
    if (got !== want) {
      slips += 1;
      haptic(HAPTIC.wrong);
      m.ms.toast(`이 모형은 ${WORD[got]}예요`);
      f.say(`이 모형은 <b>${WORD[got]}</b>예요. <b>${WORD[want]}</b>는 ${HINT[want]}.`);
      return;
    }
    busy = true;
    fix.disabled = true;
    range.input.disabled = true;
    haptic(HAPTIC.correct);
    idx += 1;
    f.pips(idx);
    paint();
    f.say(`<b>${WORD[want]}</b>의 모형이 맞아요. ${HINT[want]}. 물질의 모습으로 보면 이래요.`);
    if (m.ms.metaOk) m.ms.setView("matter");
    tm.later(() => {
      m.ms.setView("particle");
      if (idx >= ORDER.length) {
        api.recordQuiz(slips === 0);
        showTrio();
        lab.finish("입자 사이의 <b>거리</b>, <b>배열</b>, <b>움직임</b>이 다르면 물질의 상태가 달라요.");
        return;
      }
      busy = false;
      fix.disabled = false;
      range.input.disabled = false;
      f.say(ask());
    }, 2200);
  });
  f.slot.setControls(range.el, fix);

  paint();
  f.say(ask());
  api.setCTA("세 가지 모형을 만들어 보세요", { enabled: false });
  return lab.cleanup;
};
