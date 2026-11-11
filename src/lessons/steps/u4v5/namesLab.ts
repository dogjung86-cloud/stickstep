// [중1 Ⅳ v5] u4l3 상태 변화 이름 랩: 「이름대로 물을 바꿔 볼까요?」
// 만화에서 배운 이름 넷(기화, 액화, 응고, 융해)을 손으로 일으킨다. 메타볼 무대(물리 수치 불변)와 온도 막대를 쓴다.
// 이름을 주면 학생이 그 변화를 일으킨다. 다른 변화를 일으키면 그 자리에서 무엇을 일으켰는지 알려 준다(틀린 조작도 해 볼 수 있다).
//   50℃ 물에서 시작: 기화(올린다. 내리면 응고) → 액화 → 응고(더 내린다. 올리면 기화) → 융해.
// 판정 질문은 따로 없다(조작이 곧 판정이다). 한 번도 어긋나지 않았으면 맞힌 것으로 기록한다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { colFor } from "../../../renderers/palette";
import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { deg, u4Lab, u4Matter, u4ViewBtn, type U4Step } from "./u4Kit";

type Ph = "sol" | "liq" | "gas";
const phaseOf = (t: number): Ph => (t < 0.5 ? "sol" : t < 100 ? "liq" : "gas");
const WORD: Record<Ph, string> = { sol: "고체", liq: "액체", gas: "기체" };
const STATE: Record<Ph, string> = { sol: "고체(얼음)", liq: "액체(물)", gas: "기체(수증기)" };
const CHANGE: Record<string, string> = { "sol>liq": "융해", "liq>gas": "기화", "gas>liq": "액화", "liq>sol": "응고" };
const MISSIONS: { name: string; from: Ph; to: Ph }[] = [
  { name: "기화", from: "liq", to: "gas" },
  { name: "액화", from: "gas", to: "liq" },
  { name: "응고", from: "liq", to: "sol" },
  { name: "융해", from: "sol", to: "liq" },
];
const T0 = 50;

export const u4NamesLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 4, cls: "u4x-names" });
  const { f } = lab;

  let T = T0;
  let idx = 0;
  let slips = 0;

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: STATE.liq });
  const m = u4Matter(lab, { sim: { count: 48, r: 6.5, temp: T0, walls: (w, h) => ({ x0: 6, y0: 6, x1: w - 6, y1: h - 46 }) }, onReady: () => paint() });
  m.pill.append(dot, name);
  const chips = MISSIONS.map((ms) => el("span", { class: "u4x-chip", text: ms.name }));
  f.stage.appendChild(el("div", { class: "u4x-chips" }, ...chips));

  function paint(): void {
    m.ms.setTemp(T);
    name.textContent = STATE[phaseOf(T)];
    m.read.textContent = deg(T);
    dot.style.background = colFor(T, 66, 1);
    dot.style.boxShadow = `0 0 8px ${colFor(T, 60, 0.8)}`;
    chips.forEach((c, i) => {
      c.classList.toggle("on", i < idx);
      c.classList.toggle("now", i === idx);
    });
    host.dataset.u4T = String(Math.round(T));
    host.dataset.u4Mission = String(idx);
  }
  const prompt = (): string => `<b>${MISSIONS[idx].name}</b>를 일으켜 보세요. 온도 막대를 밀어 ${WORD[MISSIONS[idx].from]}를 ${WORD[MISSIONS[idx].to]}로 바꿔요.`;

  function change(a: Ph, b: Ph): void {
    if (idx >= MISSIONS.length) return;
    const ms = MISSIONS[idx];
    const did = CHANGE[`${a}>${b}`];
    if (a === ms.from && b === ms.to) {
      haptic(HAPTIC.correct);
      m.ms.toast(`${did}: ${WORD[a]} → ${WORD[b]}`);
      idx += 1;
      f.pips(idx);
      if (idx >= MISSIONS.length) {
        api.recordQuiz(slips === 0);
        range.input.disabled = true;
        lab.tm.later(() => lab.finish("<b>융해와 응고</b>, <b>기화와 액화</b>는 서로 반대 방향이에요. 이렇게 물질의 상태가 바뀌는 것이 <b>상태 변화</b>예요."), 1200);
        f.say(`<b>${did}</b> 성공! ${WORD[a]}가 ${WORD[b]}로 변했어요. 이름 넷을 모두 일으켰어요.`);
      } else f.say(`<b>${did}</b> 성공! 다음은 <b>${MISSIONS[idx].name}</b>예요. ${WORD[MISSIONS[idx].from]}를 ${WORD[MISSIONS[idx].to]}로 바꿔 보세요.`);
    } else if (a === ms.from) {
      slips += 1;
      haptic(HAPTIC.wrong);
      m.ms.toast(`방금은 ${did}(${WORD[a]} → ${WORD[b]})`);
      f.say(`방금 일으킨 변화는 <b>${did}</b>예요. <b>${ms.name}</b>는 ${WORD[ms.from]}가 <b>${WORD[ms.to]}</b>로 변하는 거예요.`);
    }
  }

  const range = bvRange({
    cls: "u4x-names-range",
    min: -20,
    max: 120,
    value: T0,
    label: "온도: 막대를 밀어 바꿔요",
    ticks: [{ t: "−20℃", p: 0 }, { t: "0℃", p: 14.3 }, { t: "100℃", p: 85.7 }, { t: "120℃", p: 100 }],
    onInput: (v) => {
      const order: Ph[] = ["sol", "liq", "gas"];
      let a = order.indexOf(phaseOf(T));
      const b = order.indexOf(phaseOf(v));
      T = v;
      while (a !== b) {
        const n = a + Math.sign(b - a);
        change(order[a], order[n]);
        a = n;
      }
      paint();
    },
  });
  f.slot.setControls(range.el, u4ViewBtn(m));

  f.say(prompt());
  api.setCTA("이름 넷을 차례로 일으켜 보세요", { enabled: false });
  return lab.cleanup;
};
