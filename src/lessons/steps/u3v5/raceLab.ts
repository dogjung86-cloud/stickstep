// [중1 Ⅲ v5] u3l4 u3RaceLab: 「같은 불에 어느 쪽이 빨리 뜨거워질까?」
// 한 통찰: 질량이 같아도 같은 열을 받았을 때 온도가 변하는 정도는 물질마다 다르다. 물은 같은 온도만큼 오르는 데 열이 더 많이 든다.
// 책의 탐구(질량이 같은 물과 식용유를 같은 가열 장치로 가열하며 온도 센서로 그래프를 본다)를 한 무대에 옮겼다.
//   왼쪽: 가열 장치 위의 두 비커와 온도   오른쪽: 가열 시간과 온도 그래프(목표 60℃ 점선)
// 학생이 정하는 것: 식용유를 얼마나 담을지(물은 200 g), 그리고 얼마나 오래 가열할지(꾹 누르는 동안만 가열된다. 가열한 시간이 곧 준 열의 양이다).
// 실패하는 길: 식용유를 100 g만 담으면 훨씬 빨리 뜨거워지지만 질량이 달라 공정한 비교가 아니다. 그 실험은 버리고 다시 담는다.
// 흐름: 예측(정오 없음) → 식용유 담기 → 식용유가 60℃가 될 때까지 가열 → 식용유는 불을 끄고 물도 60℃가 될 때까지 더 가열 → 판정 → 결론.
// 셈: 둘 다 20℃에서 시작한다. 식용유는 20초에 60℃. 식용유의 비열은 물의 0.47배쯤이라 물은 같은 시간에 0.47배만 오른다(42.6초에 60℃).
// '비열'이라는 말은 이 랩에서 쓰지 않는다(바로 뒤의 정리에서 이름 붙인다).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { el } from "../../../core/dom";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, u3Hold, beaker, water, hotPlate, txt, graphAxes, graphLine, SUB, type Ctx } from "./kit";

interface RaceStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const T0 = 20;
const GOAL = 60;
const OIL_RATE = 2; // ℃/초
const WATER_RATE = OIL_RATE * 0.47;
const SPEED = 6.5; // 화면 1초에 흐르는 가열 시간(초)
const C_OIL = "#FFD666";
const C_WATER = "#6FD3FF";

export const raceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RaceStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 3, cls: "u3x-race", api });

  let phase: "predict" | "setup" | "oil" | "water" | "ask" | "done" = "predict";
  let oilMass = 0; // 담은 식용유(g). 0이면 아직 담지 않았다
  let heating = false;
  let tOil = 0; // 식용유를 가열한 시간(초)
  let tWater = 0;
  let pred = "";
  let glow = 0;
  const cOil: [number, number][] = [[0, T0]];
  const cWater: [number, number][] = [[0, T0]];
  const oilRate = (): number => (oilMass === 100 ? OIL_RATE * 2 : OIL_RATE);
  const oilT = (): number => Math.min(GOAL, T0 + oilRate() * tOil);
  const waterT = (): number => Math.min(GOAL, T0 + WATER_RATE * tWater);

  function drawBeaker(ctx: Ctx, x: number, name: string, T: number, liquid: string, line: string, on: number, off: boolean, fill = 1): void {
    if (fill > 0) water(ctx, x + 3, 186 - 74 * fill, 46, 186, liquid, line, 5);
    // 온도 센서
    ctx.strokeStyle = "rgba(232,238,249,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 34, 88);
    ctx.lineTo(x + 34, 150);
    ctx.stroke();
    beaker(ctx, x, 98, 52, 90, { r: 6 });
    hotPlate(ctx, x - 4, 190, 60, on);
    txt(ctx, name, x + 26, 56, { size: 12.5, color: SUB });
    txt(ctx, `${Math.round(T)}℃`, x + 26, 76, { size: 17, weight: 800, color: line });
    if (off) txt(ctx, "불 끔", x + 26, 222, { size: 12, color: SUB, weight: 600 });
  }

  const cv = u3Canvas(f.stage, (ctx, dt) => {
    host.dataset.u3Phase = phase;
    if (heating) {
      const d = (dt / 60) * SPEED;
      if (phase === "oil") {
        tOil += d;
        tWater += d;
        if (oilT() >= GOAL) {
          tOil = (GOAL - T0) / oilRate();
          tWater = tOil;
          if (oilMass === 100) unfair();
          else oilReached();
        }
      } else if (phase === "water") {
        tWater += d;
        if (waterT() >= GOAL) {
          tWater = (GOAL - T0) / WATER_RATE;
          waterReached();
        }
      }
      cOil.push([tOil, oilT()]);
      cWater.push([tWater, waterT()]);
    }
    glow += ((heating ? 1 : 0) - glow) * Math.min(1, 0.15 * dt);
    const oilOn = phase === "predict" || phase === "setup" || phase === "oil";
    drawBeaker(ctx, 16, "물", waterT(), "rgba(90,169,255,.42)", C_WATER, glow, false);
    drawBeaker(ctx, 90, "식용유", oilT(), "rgba(255,214,102,.45)", C_OIL, oilOn ? glow : 0, !oilOn, oilMass / 200);
    txt(ctx, oilMass ? `물 200 g · 식용유 ${oilMass} g` : "물 200 g · 식용유 ?", 79, 22, { size: 12.5, color: oilMass === 100 ? "#FF8F8F" : SUB });
    host.dataset.u3Oil = String(oilMass);
    // 그래프
    const g = graphAxes(ctx, { x: 200, y: 44, w: 134, h: 128, tMax: 48, vMin: 0, vMax: 80, ticks: [20, 40, 60], xLabel: "가열 시간", yLabel: "온도(℃)" });
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(g.px(0), g.py(GOAL));
    ctx.lineTo(g.px(48), g.py(GOAL));
    ctx.stroke();
    const mark = (t: number, color: string): void => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(g.px(t), g.py(GOAL));
      ctx.lineTo(g.px(t), g.py(0));
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, `${Math.round(t)}초`, g.px(t), g.py(0) - 9, { size: 12.5, color, weight: 800 });
      ctx.setLineDash([4, 4]);
    };
    if (oilT() >= GOAL) mark(tOil, C_OIL);
    if (waterT() >= GOAL) mark(tWater, C_WATER);
    ctx.setLineDash([]);
    txt(ctx, "목표 60℃", 332, g.py(GOAL) - 9, { size: 12, color: "#E8EEF9", align: "right", weight: 600 });
    graphLine(ctx, g, cWater, C_WATER);
    graphLine(ctx, g, cOil, C_OIL);
    ctx.fillStyle = C_WATER;
    ctx.fillRect(204, 213, 12, 3);
    txt(ctx, "물", 220, 215, { size: 12, align: "left", weight: 600 });
    ctx.fillStyle = C_OIL;
    ctx.fillRect(244, 213, 12, 3);
    txt(ctx, "식용유", 260, 215, { size: 12, align: "left", weight: 600 });
  });

  const hold = u3Hold("가열하기 (꾹 누르고 있기)", (down) => {
    if (phase === "setup" && oilMass && down) {
      phase = "oil";
      m100.disabled = m200.disabled = true;
    }
    if (phase !== "oil" && phase !== "water") return;
    const was = heating; // 목표에 닿아 가열이 이미 멈춘 뒤에 손을 뗀 것이면 안내를 덮어쓰지 않는다
    heating = down;
    if (!down && !was) return;
    if (down) f.say(phase === "oil" ? "가열 중! 두 온도와 그래프를 지켜봐요. <b>식용유가 60℃</b>가 될 때까지 누르고 있어요." : "물만 계속 가열해요. <b>물이 60℃</b>가 될 때까지 누르고 있어요.");
    else f.say("손을 떼니 가열이 멈췄어요. 다시 <b>꾹</b> 눌러 이어서 가열해요.");
  });

  const m100 = bvBtn("", "식용유 100 g");
  const m200 = bvBtn("", "식용유 200 g");
  const pour = (g: number): void => {
    if (phase !== "setup" || heating) return;
    haptic(HAPTIC.tap);
    oilMass = g;
    m100.classList.toggle("on", g === 100);
    m200.classList.toggle("on", g === 200);
    hold.disabled = false;
    f.say(`식용유를 <b>${g} g</b> 담았어요. <b>가열하기</b>를 꾹 눌러 봐요. 누르는 동안만 가열돼요.`);
  };
  m100.addEventListener("click", () => pour(100));
  m200.addEventListener("click", () => pour(200));

  /** 식용유를 물의 절반만 담고 가열한 경우: 공정하지 않은 실험이라 버린다. */
  function unfair(): void {
    heating = false;
    hold.disabled = true;
    hold.classList.remove("down");
    haptic(HAPTIC.wrong);
    f.say(`식용유가 ${Math.round(tOil)}초 만에 60℃! 그런데 식용유가 물의 <b>절반</b>뿐이라 공정한 비교가 아니에요. <b>질량을 같게</b> 다시 담아요.`);
    tm.later(() => {
      tOil = 0;
      tWater = 0;
      oilMass = 0;
      cOil.length = 1;
      cWater.length = 1;
      m100.classList.remove("on");
      m100.disabled = true;
      m200.disabled = false;
      phase = "setup";
    }, 2600);
  }

  function oilReached(): void {
    phase = "water";
    m100.disabled = m200.disabled = true;
    heating = false;
    hold.disabled = true;
    hold.classList.remove("down");
    haptic(HAPTIC.ctaUnlock);
    f.pips(1);
    const head = pred.includes("식용유") ? "예측대로" : "예측과 달리";
    f.say(`${head} <b>식용유</b>가 먼저 60℃가 됐어요. 물은 아직 ${Math.round(waterT())}℃예요. 물도 60℃까지 더 가열해 봐요.`);
    tm.later(() => {
      hold.disabled = false;
    }, 900);
    api.setCTA("물도 60℃까지 가열해 보세요", { enabled: false });
  }

  function waterReached(): void {
    heating = false;
    phase = "ask";
    hold.disabled = true;
    hold.classList.remove("down");
    haptic(HAPTIC.correct);
    f.pips(2);
    f.say(`물은 <b>${Math.round(tWater)}초</b>나 가열해야 60℃가 됐어요. 식용유는 ${Math.round(tOil)}초면 됐는데요.`);
    tm.later(askFinal, 2600);
  }

  function askFinal(): void {
    f.say("그래프의 두 시간을 견주어 보고 골라 봐요. 오래 가열할수록 열을 많이 준 거예요.");
    f.slot.ask(
      "20℃에서 60℃까지 데우는 데 <b>열이 더 많이</b> 든 쪽은?",
      [{ t: "물", ok: true }, { t: "식용유" }, { t: "둘이 같다" }],
      (ok) => api.recordQuiz(ok),
      { why: `물은 ${Math.round((GOAL - T0) / WATER_RATE)}초, 식용유는 ${Math.round((GOAL - T0) / OIL_RATE)}초를 가열했어요.`, onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("같은 열을 받아도 온도가 변하는 정도는 <b>물질마다 달라요</b>. 식용유는 온도가 빨리 오르고, 물은 열을 더 많이 받아야 같은 온도만큼 올라요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(el("div", { class: "u3x-row" }, m100, m200), hold);
  hold.disabled = true;
  api.setCTA("두 액체를 가열해 보세요", { enabled: false });
  f.say("물과 식용유를 같은 세기로 가열해 온도를 견줄 거예요. 먼저 <b>예측</b>부터 해 봐요.");
  f.slot.ask(
    "같은 양을 똑같이 가열하면 온도가 <b>더 빨리</b> 오르는 쪽은?",
    [{ t: "물" }, { t: "식용유" }, { t: "둘이 같다" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        pred = f.slot.qBox.querySelector(".bv-choice.sel")?.textContent ?? "";
        phase = "setup";
        f.slot.showControls();
        f.say("물은 <b>200 g</b>을 담았어요. 공정하게 견주려면 식용유는 얼마나 담아야 할까요? 골라서 담아 봐요.");
        api.setCTA("두 액체를 가열해 보세요", { enabled: false });
      },
    },
  );
  return () => {
    tm.clear();
    cv.stop();
  };
};
