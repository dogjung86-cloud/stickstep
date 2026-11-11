// [중1 Ⅳ v5] u4l5 가열 곡선 랩, u4l6 냉각 곡선 랩: 「계속 가열하면(식히면) 온도는 어떻게 될까요?」
// 책의 탐구(얼음이 녹고 물이 끓을 때의 온도 측정)와 해 보기(물이 얼 때의 온도 측정)를 손으로 한다.
// 지금 랩의 무대(메타볼)와 에너지 모형(구간 값)을 그대로 살리고 배치만 고쳤다:
//   무대와 그래프를 세로로 쌓지 않고 한 무대 안에 좌우로 놓는다(왼쪽 물질, 오른쪽 온도 그래프). 꾹 누르는 버튼은 조작 칸 맨 위에 있다.
// 조작: 예측(정오를 매기지 않는다) → 꾹 눌러 가열(냉각) → 온도가 처음 멈춘 순간 판정 하나(무대에서 무슨 일이?) → 끝까지 → 결론.
// 판정은 무대에 보이는 것(녹고 있다, 물이 되고 있다)으로 답한다. 책이 '녹는점, 끓는점'을 들이지 않으므로 쓰지 않는다.

import { el, clamp } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { colFor } from "../../../renderers/palette";
import { fitCanvas } from "../../../ui/canvas";
import type { StepRenderer } from "../../types";
import { deg, u4Hold, u4Lab, u4Matter, u4Predict, type U4Step } from "./u4Kit";

// 에너지 모형: E(0~230)를 온도와 상태 변화 구간으로 바꾼다(지금 랩 heatCurve.ts의 값 그대로. 단위는 연출용)
const E_ICE = 20;
const E_MELT = 50;
const E_WATER = 150;
const E_BOIL = 210;
const E_MAX = 230;
type Zone = "ice" | "melt" | "water" | "boil" | "steam";
function mapE(E: number): { T: number; simT: number; zone: Zone } {
  if (E < E_ICE) return { T: -20 + (E / E_ICE) * 20, simT: -20 + (E / E_ICE) * 18, zone: "ice" };
  if (E < E_MELT) return { T: 0, simT: -2 + ((E - E_ICE) / (E_MELT - E_ICE)) * 5, zone: "melt" };
  if (E < E_WATER) {
    const k = (E - E_MELT) / (E_WATER - E_MELT);
    return { T: k * 100, simT: 3 + k * 93, zone: "water" };
  }
  if (E < E_BOIL) return { T: 100, simT: 96 + ((E - E_WATER) / (E_BOIL - E_WATER)) * 8, zone: "boil" };
  const k = (E - E_BOIL) / (E_MAX - E_BOIL);
  return { T: 100 + k * 20, simT: 104 + k * 16, zone: "steam" };
}
const RATE = 0.55; // 프레임마다 더하는 E(끝까지 약 7초)
const STATE: Record<Zone, string> = { ice: "고체", melt: "고체+액체", water: "액체", boil: "액체+기체", steam: "기체" };

interface HeatStep extends U4Step {
  mode?: "heat" | "cool";
}

export const u4HeatLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as HeatStep;
  const heat = (s.mode ?? "heat") === "heat";
  const lab = u4Lab(host, api, s, { steps: 3, cls: `u4x-heat ${heat ? "is-heat" : "is-cool"}` });
  const { f, tm } = lab;

  const simBox = el("div", { class: "u4x-heat-sim" });
  const graph = el("canvas", { class: "u4x-heat-graph" });
  const tag = el("div", { class: "u4x-heat-tag", text: heat ? "열에너지를 받는 중" : "열에너지를 내놓는 중" });
  f.stage.append(simBox, graph, tag);

  let E = heat ? 0 : E_MAX;
  let active = false;
  let paused = false; // 판정이 떠 있는 동안
  let ended = false;
  let pred = "";
  let lastZone: Zone = heat ? "ice" : "steam";
  const seen = new Set<Zone>();
  const samples: { x: number; T: number }[] = [];
  // 가는 길에서 첫 번째와 두 번째로 만나는 멈춤 구간
  const first: Zone = heat ? "melt" : "boil";
  const second: Zone = heat ? "boil" : "melt";
  const progress = (): number => (heat ? E : E_MAX - E) / E_MAX;

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: STATE[lastZone] });
  const m = u4Matter(lab, {
    box: simBox,
    sim: { count: 36, r: 6, temp: heat ? -20 : 120, walls: (w, h) => ({ x0: 4, y0: 4, x1: w - 4, y1: h - 42 }) },
    onFrame: (dt) => {
      if (active && !paused && !ended) E = clamp(E + (heat ? RATE : -RATE) * dt, 0, E_MAX);
      const mp = mapE(E);
      m.ms.setTemp(mp.simT);
      name.textContent = STATE[mp.zone];
      temp.textContent = deg(mp.T);
      dot.style.background = colFor(mp.T, 66, 1);
      if (active && !paused && !ended) {
        const x = progress();
        if (!samples.length || x - samples[samples.length - 1].x > 0.004) samples.push({ x, T: mp.T });
      }
      if (mp.zone !== lastZone) {
        lastZone = mp.zone;
        onZone(mp.zone);
      }
      // 첫 멈춤 구간을 조금 지나면 멈추고 묻는다
      const into = heat ? E - E_ICE : E_BOIL - E;
      if (!paused && !asked && mp.zone === first && into > 19) {
        asked = true;
        paused = true;
        tm.later(judge, 250);
      }
      draw();
      host.dataset.u4E = E.toFixed(0);
      if (!ended && (heat ? E >= E_MAX - 2 : E <= 2)) end();
    },
  });
  m.pill.append(dot, name);
  m.read.remove();
  const temp = el("div", { class: "u4x-heat-temp", text: deg(heat ? -20 : 120) });
  f.stage.appendChild(temp);
  let asked = false;

  function onZone(z: Zone): void {
    seen.add(z);
    if (z === first) {
      haptic(HAPTIC.cross);
      m.ms.toast(heat ? "0℃에서 멈췄어요" : "100℃에서 멈췄어요");
    } else if (z === second) {
      haptic(HAPTIC.cross);
      f.pips(2);
      m.ms.toast(heat ? "100℃에서 또 멈췄어요" : "0℃에서 또 멈췄어요");
      f.say(heat ? "<b>100℃</b>에서 또 멈췄어요. 무대에서는 물이 <b>수증기</b>가 되고 있어요(기화)." : "<b>0℃</b>에서 또 멈췄어요. 무대에서는 물이 <b>얼음</b>이 되고 있어요(응고).");
    } else if (z === "water" && !ended) {
      f.say(heat ? "얼음이 다 녹자 온도가 <b>다시 올라요</b>. 계속 가열해 보세요." : "수증기가 다 물이 되자 온도가 <b>다시 내려가요</b>. 계속 식혀 보세요.");
    }
  }

  function draw(): void {
    const { ctx, w, h } = fitCanvas(graph);
    ctx.clearRect(0, 0, w, h);
    const padL = 36, padR = 10, padT = 46, padB = 28;
    const pw = w - padL - padR, ph = h - padT - padB;
    const yOf = (T: number): number => padT + (1 - (T + 20) / 140) * ph;
    ctx.strokeStyle = "rgba(148,176,214,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(padL, padT - 6);
    ctx.lineTo(padL, padT + ph);
    ctx.lineTo(padL + pw, padT + ph);
    ctx.stroke();
    ctx.font = "700 12px Pretendard, sans-serif";
    ctx.fillStyle = "#8CA2C0";
    ctx.textAlign = "left";
    ctx.fillText("온도(℃)", 8, padT - 16);
    ctx.textAlign = "right";
    ctx.fillText(heat ? "가열 시간 →" : "냉각 시간 →", w - padR, h - 8);
    ctx.setLineDash([4, 5]);
    for (const T of [0, 100]) {
      ctx.strokeStyle = "rgba(148,176,214,.3)";
      ctx.beginPath();
      ctx.moveTo(padL, yOf(T));
      ctx.lineTo(padL + pw, yOf(T));
      ctx.stroke();
      ctx.fillText(String(T), padL - 5, yOf(T) + 4);
    }
    ctx.setLineDash([]);
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1], b = samples[i];
      ctx.strokeStyle = colFor(b.T, 62, 0.95);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(padL + a.x * pw, yOf(a.T));
      ctx.lineTo(padL + b.x * pw, yOf(b.T));
      ctx.stroke();
    }
    const last = samples[samples.length - 1] ?? { x: 0, T: heat ? -20 : 120 };
    ctx.fillStyle = colFor(last.T, 70, 1);
    ctx.beginPath();
    ctx.arc(padL + last.x * pw, yOf(last.T), 4.6, 0, Math.PI * 2);
    ctx.fill();
    // 지나온 멈춤 구간의 이름
    ctx.font = "800 12px Pretendard, sans-serif";
    ctx.textAlign = "center";
    const p = progress();
    const meltMid = (E_ICE + E_MELT) / 2 / E_MAX, boilMid = (E_WATER + E_BOIL) / 2 / E_MAX;
    const xm = heat ? meltMid : 1 - meltMid, xb = heat ? boilMid : 1 - boilMid;
    if (p > xm + 0.05) {
      ctx.fillStyle = "#CFE3FF";
      ctx.fillText(heat ? "융해" : "응고", padL + xm * pw, yOf(0) - 9);
    }
    if (p > xb + 0.05) {
      ctx.fillStyle = "#FFD9CF";
      ctx.fillText(heat ? "기화" : "액화", padL + xb * pw, yOf(100) - 9);
    }
  }

  const hold = u4Hold(
    lab,
    heat ? "꾹 눌러 가열하기" : "꾹 눌러 냉각하기",
    () => !paused && !ended,
    (on) => {
      active = on;
      f.stage.classList.toggle("act", on);
    },
  );

  // 키보드(Enter, Space): 누를 때마다 0.8초만큼 진행한다
  hold.addEventListener("click", (e) => {
    if (e.detail !== 0 || paused || ended) return;
    active = true;
    tm.later(() => (active = false), 800);
  });

  function judge(): void {
    active = false;
    f.stage.classList.remove("act");
    f.say(heat ? "가열하고 있는데 온도가 <b>0℃에서 멈췄어요</b>. 왼쪽 무대를 보세요." : "식히고 있는데 온도가 <b>100℃에서 멈췄어요</b>. 왼쪽 무대를 보세요.");
    f.slot.ask(
      heat ? "온도가 멈춰 있는 지금, <b>무대의 얼음</b>은?" : "온도가 멈춰 있는 지금, <b>무대의 수증기</b>는?",
      heat ? [{ t: "녹아서 물이 되고 있다", ok: true }, { t: "아무 변화가 없다" }, { t: "끓어서 수증기가 되고 있다" }] : [{ t: "물방울이 되고 있다", ok: true }, { t: "아무 변화가 없다" }, { t: "곧바로 얼음이 되고 있다" }],
      (ok) => api.recordQuiz(ok),
      {
        why: heat ? "얼음이 <b>녹는 동안</b>에는 가열해도 온도가 오르지 않았어요(융해)." : "수증기가 <b>물이 되는 동안</b>에는 식혀도 온도가 내려가지 않았어요(액화).",
        onNext: () => {
          paused = false;
          f.pips(1);
          f.slot.showControls();
          f.say(heat ? "계속 <b>꾹 눌러</b> 가열해요. 온도가 또 멈추는 곳이 있는지 보세요." : "계속 <b>꾹 눌러</b> 식혀요. 온도가 또 멈추는 곳이 있는지 보세요.");
          api.setCTA(heat ? "끝까지 가열해 보세요" : "끝까지 식혀 보세요", { enabled: false });
        },
      },
    );
  }

  function end(): void {
    ended = true;
    active = false;
    hold.disabled = true;
    f.stage.classList.remove("act");
    haptic(HAPTIC.correct);
    const head = pred.includes("멈추는") ? "예측대로" : "예측과 달리";
    f.say(`${head} 온도가 <b>두 번</b> 멈췄어요. 두 번 모두 상태가 변하는 동안이었어요.`);
    tm.later(
      () =>
        lab.finish(
          heat
            ? "상태가 변하는 동안에는 받은 열에너지가 모두 <b>상태 변화에 쓰여</b> 온도가 일정해요. 융해와 기화는 열에너지를 <b>흡수</b>해요."
            : "상태가 변하는 동안에는 열에너지를 <b>방출</b>하므로 온도가 일정해요. 액화와 응고는 열에너지를 방출해요.",
        ),
      1300,
    );
  }

  f.say(heat ? "<b>−20℃ 얼음</b>을 수증기가 될 때까지 가열할 거예요. 먼저 예측해 보세요." : "<b>120℃ 수증기</b>를 얼음이 될 때까지 식힐 거예요. 먼저 예측해 보세요.");
  u4Predict(
    lab,
    heat ? "얼음을 <b>쉬지 않고 가열</b>하면 온도는 어떻게 될까요?" : "수증기를 <b>쉬지 않고 식히면</b> 온도는 어떻게 될까요?",
    heat ? ["오르다가 멈추는 곳이 있다", "쉬지 않고 계속 오른다", "갈수록 빨리 오른다"] : ["내려가다 멈추는 곳이 있다", "쉬지 않고 계속 내려간다", "갈수록 빨리 내려간다"],
    (picked) => {
      pred = picked;
      f.say(heat ? "버튼을 <b>꾹 눌러</b> 가열해요. 오른쪽 그래프에 온도가 그려져요." : "버튼을 <b>꾹 눌러</b> 식혀요. 오른쪽 그래프에 온도가 그려져요.");
      f.slot.setControls(hold);
      api.setCTA(heat ? "꾹 눌러 가열해 보세요" : "꾹 눌러 식혀 보세요", { enabled: false });
    },
  );
  api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  return lab.cleanup;
};
