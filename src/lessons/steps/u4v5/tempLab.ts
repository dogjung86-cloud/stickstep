// [중1 Ⅳ v5] u4l2 온도 랩: 「얼음을 데우면 어떻게 될까요?」
// 단원의 메타볼 무대를 그대로 쓴다(물리 수치 불변). 온도 막대를 밀면 얼음 덩어리가 물이 되고 수증기가 된다.
// '입자의 눈' 버튼(조작 칸의 50px 버튼)을 누르면 같은 장면이 입자 모형으로 보인다.
// 할 일 셋(무대 아래 칩): 물 만들기, 수증기 만들기, 입자의 눈으로 두 가지 상태 보기 → 판정 하나.
// 칩이 물질을 가리지 않게 시뮬레이션의 바닥을 칩 위로 올렸다(상자의 크기만 다르고 물리 수치는 그대로다).
// 통찰 하나: 입자는 그대로이고 모여 있는 모습과 움직임이 달라진다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { colFor } from "../../../renderers/palette";
import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { deg, u4Lab, u4Matter, u4ViewBtn, type U4Step } from "./u4Kit";

const T_MIN = -20;
const T_MAX = 120;
type Ph = "sol" | "liq" | "gas";
const phaseOf = (t: number): Ph => (t < 0.5 ? "sol" : t < 100 ? "liq" : "gas");
const NAME: Record<Ph, string> = { sol: "고체(얼음)", liq: "액체(물)", gas: "기체(수증기)" };
const SAY: Record<Ph, string> = {
  sol: "얼음이에요. 입자들이 규칙적으로 늘어서 <b>제자리에서 떨고만</b> 있어요.",
  liq: "물이 됐어요. 입자들이 붙어 있지만 <b>서로 자리를 바꾸며</b> 움직여요.",
  gas: "수증기가 됐어요. 입자들이 <b>멀리 흩어져</b> 사방으로 날아다녀요.",
};

export const u4TempLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-temp" });
  const { f, tm } = lab;

  let T = T_MIN;
  const seen = new Set<Ph>(["sol"]);
  const eyeSeen = new Set<Ph>();
  let asked = false;

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: NAME.sol });
  const m = u4Matter(lab, { sim: { count: 48, r: 6.5, temp: T_MIN, walls: (w, h) => ({ x0: 6, y0: 6, x1: w - 6, y1: h - 46 }) }, onReady: () => refresh(null) });
  m.pill.append(dot, name);
  const chip = { liq: el("span", { class: "u4x-chip", text: "물 만들기" }), gas: el("span", { class: "u4x-chip", text: "수증기 만들기" }), eye: el("span", { class: "u4x-chip", text: "입자의 눈" }) };
  f.stage.appendChild(el("div", { class: "u4x-chips" }, chip.liq, chip.gas, chip.eye));

  function refresh(prev: number | null): void {
    m.ms.setTemp(T);
    const ph = phaseOf(T);
    name.textContent = NAME[ph];
    m.read.textContent = deg(T);
    dot.style.background = colFor(T, 66, 1);
    dot.style.boxShadow = `0 0 8px ${colFor(T, 60, 0.8)}`;
    host.dataset.u4T = String(Math.round(T));
    if (asked) return;
    if (prev !== null && phaseOf(prev) !== ph) haptic(HAPTIC.cross);
    seen.add(ph);
    if (m.ms.view() === "particle") eyeSeen.add(ph);
    chip.liq.classList.toggle("on", seen.has("liq"));
    chip.gas.classList.toggle("on", seen.has("gas"));
    chip.eye.classList.toggle("on", eyeSeen.size >= 2);
    const n = (seen.has("liq") ? 1 : 0) + (seen.has("gas") ? 1 : 0) + (eyeSeen.size >= 2 ? 1 : 0);
    f.pips(n);
    if (seen.has("gas") && eyeSeen.size < 2 && ph === "gas") {
      f.say(m.ms.view() === "particle" ? "입자의 눈이에요. 온도를 <b>내려</b> 입자의 움직임이 어떻게 달라지는지 보세요." : "수증기가 됐어요. 이제 <b>입자의 눈</b> 버튼을 누르고 온도를 내려 보세요.");
    } else f.say(SAY[ph]);
    if (n === 3) {
      asked = true;
      tm.later(judge, 900);
    }
  }

  const range = bvRange({
    cls: "u4x-temp-range",
    min: T_MIN,
    max: T_MAX,
    value: T_MIN,
    label: "온도: 막대를 밀어 바꿔요",
    ticks: [{ t: "−20℃", p: 0 }, { t: "0℃", p: 14.3 }, { t: "100℃", p: 85.7 }, { t: "120℃", p: 100 }],
    onInput: (v) => {
      const prev = T;
      T = v;
      refresh(prev);
    },
  });
  const view = u4ViewBtn(m, () => {
    m.ms.toast("입자의 눈: 입자 하나하나가 보여요");
  });
  view.addEventListener("click", () => refresh(T));
  f.slot.setControls(range.el, view);

  function judge(): void {
    f.slot.ask(
      "얼음, 물, 수증기에서 <b>달라지지 않은 것</b>은?",
      [{ t: "입자의 종류와 개수", ok: true }, { t: "입자 사이의 거리" }, { t: "입자가 움직이는 모습" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "입자는 생기거나 사라지지 않았어요. <b>모인 모습과 움직임</b>만 달라졌어요.",
        onNext: () => lab.finish("같은 입자인데 <b>모여 있는 모습과 움직임</b>이 달라져 고체, 액체, 기체가 돼요."),
      },
    );
  }

  f.say("−20℃ 얼음이에요. <b>온도 막대</b>를 오른쪽으로 밀어 끝까지 데워 보세요.");
  api.setCTA("온도를 바꿔 세 가지 상태를 보세요", { enabled: false });
  return lab.cleanup;
};
