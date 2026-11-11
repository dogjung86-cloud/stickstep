// [중1 Ⅳ v5] u4l2 입자 모형 만들기 랩: 「입자 모형을 만들어 볼까요?」
// 책의 해 보기(물질의 상태를 입자 모형으로 표현하기)를 손으로 한다. 주문받은 상태(액체, 기체, 고체)의 입자 모형을 학생이 만든다.
// 무대는 단원의 입자 뷰(같은 시뮬레이션, 물리 수치 불변). 학생은 '입자의 움직임' 막대를 밀어 입자의 거리, 배열, 움직임을 바꾸고 '이 모형으로 정하기'를 누른다.
// 이 소단원에는 온도가 나오지 않으므로 막대에 온도를 적지 않는다(둔하게에서 활발하게까지).
// 주문과 다른 상태의 모형을 내면 무엇이 달랐는지 알려 준다. 맞으면 같은 모형을 물질의 모습으로 잠깐 보여 준다(모형과 물질을 잇는다).
// 판정 질문은 따로 없다(만든 모형이 곧 판정이다). 한 번도 어긋나지 않았으면 맞힌 것으로 기록한다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
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
