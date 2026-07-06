// heatCurve — 가열·냉각 곡선 랩(IV 단원 L5·L6). 교과서 탐구(136~137·140쪽)의 디지털 구현:
// 버튼을 꾹 누르는 동안 물질이 가열(냉각)되고, 옆 그래프에 온도 곡선이 실시간으로 그려진다.
// 상태가 변하는 동안(융해·기화 / 액화·응고) 온도가 "멈추는" 수평 구간을 직접 목격하는 것이 목표.
// 메타볼 무대가 곧 입자 모형 띠 — 그래프의 구간과 무대의 상태가 실시간으로 대응한다.
// 주의: 이 교과서는 '녹는점·끓는점' 용어를 아직 도입하지 않는다 — "온도 일정"으로만 서술.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { createMatterStage } from "../../ui/matterStage";
import { colFor } from "../../renderers/palette";
import type { StepRenderer } from "../types";

interface HeatCurveStep {
  title: string;
  lead?: string;
  mode?: "heat" | "cool";
  cta?: string;
}

// 엔탈피 모델 — E(0~230)를 온도·잠열 구간으로 매핑(단위는 연출용)
const E_ICE = 20; // -20→0℃
const E_MELT = 50; // 융해 잠열 구간 끝
const E_WATER = 150; // 0→100℃
const E_BOIL = 210; // 기화 잠열 구간 끝
const E_MAX = 230; // 100→120℃

interface MapResult {
  T: number; // 표시 온도
  simT: number; // 시뮬 온도(잠열 구간에서 상 전이 밴드를 통과)
  zone: "ice" | "melt" | "water" | "boil" | "steam";
}
function mapE(E: number): MapResult {
  if (E < E_ICE) return { T: -20 + (E / E_ICE) * 20, simT: -20 + (E / E_ICE) * 18, zone: "ice" };
  if (E < E_MELT) {
    const f = (E - E_ICE) / (E_MELT - E_ICE);
    return { T: 0, simT: -2 + f * 5, zone: "melt" }; // 시뮬 밴드 -2~3 통과 = 서서히 녹음
  }
  if (E < E_WATER) {
    const f = (E - E_MELT) / (E_WATER - E_MELT);
    return { T: f * 100, simT: 3 + f * 93, zone: "water" };
  }
  if (E < E_BOIL) {
    const f = (E - E_WATER) / (E_BOIL - E_WATER);
    return { T: 100, simT: 96 + f * 8, zone: "boil" }; // 시뮬 밴드 96~104 통과 = 서서히 끓음
  }
  const f = (E - E_BOIL) / (E_MAX - E_BOIL);
  return { T: 100 + f * 20, simT: 104 + f * 16, zone: "steam" };
}

export const heatCurve: StepRenderer = (host, step, api) => {
  const s = step as unknown as HeatCurveStep;
  const mode = s.mode ?? "heat";
  const heatMode = mode === "heat";

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대(메타볼 = 입자 모형) ----
  const stage = createMatterStage({
    height: "168px",
    sim: { count: 44, r: 6, temp: heatMode ? -20 : 120 },
  });
  const phaseDot = el("span", { class: "pdot" });
  const phaseName = el("span", { text: heatMode ? "고체" : "기체" });
  const tempNum = el("span", { text: heatMode ? "-20" : "120" });
  const energyPill = el(
    "div",
    { class: "pill hc-energy" },
    el("span", { text: heatMode ? "열에너지 흡수" : "열에너지 방출" }),
  );
  stage.hud.append(
    el("div", { class: "pill" }, phaseDot, phaseName),
    el("div", { class: "tempread" }, tempNum, el("small", { text: "°C" })),
  );
  stage.el.appendChild(el("div", { class: "hc-energy-slot" }, energyPill));

  // ---- 그래프 ----
  const graph = el("canvas", { class: "mstage-cvblock", style: "height:170px" });
  const graphWrap = el("div", { class: "stage hc-graph" }, graph);

  const actBtn = el(
    "button",
    { class: "swapbtn" , attrs: { type: "button" } },
    el("span", { text: heatMode ? "꾹 눌러 가열하기" : "꾹 눌러 냉각하기" }),
  );
  const helper = el("div", {
    class: "helper",
    html: heatMode
      ? "버튼을 꾹 누르는 동안 <b>-20℃ 얼음</b>이 가열돼요. 그래프의 온도 곡선을 잘 보세요 — 어딘가에서 <b>이상한 일</b>이 벌어져요."
      : "버튼을 꾹 누르는 동안 <b>120℃ 수증기</b>가 식어요. 온도가 <b>내려가다 멈추는 곳</b>이 있는지 잘 보세요.",
  });
  host.append(stage.el, graphWrap, actBtn, helper);

  // ---- 상태 ----
  let E = heatMode ? 0 : E_MAX;
  let active = false;
  const samples: { x: number; T: number }[] = [];
  let lastZone: MapResult["zone"] = heatMode ? "ice" : "steam";
  const plateausSeen = new Set<string>();
  let finished = false;

  const RATE = 0.55; // E/프레임(dt=1 기준) — 완주까지 약 7초 홀드

  actBtn.addEventListener("pointerdown", (e) => {
    active = true;
    actBtn.classList.add("done-static");
    actBtn.setPointerCapture(e.pointerId);
    haptic(HAPTIC.tap);
  });
  const stopAct = (): void => {
    active = false;
    actBtn.classList.remove("done-static");
  };
  actBtn.addEventListener("pointerup", stopAct);
  actBtn.addEventListener("pointercancel", stopAct);

  const ZONE_MSG: Record<string, { toast: string; helper: string }> = heatMode
    ? {
        melt: {
          toast: "0℃ — 온도가 멈췄어요!",
          helper: "가열 중인데 온도가 <b>0℃에서 꼼짝도 안 해요</b>. 흡수한 열에너지가 전부 <b>얼음→물 상태 변화</b>에 쓰이고 있거든요. 무대를 보세요 — 얼음이 녹는 중!",
        },
        water: {
          toast: "다 녹았다 — 온도가 다시 올라요",
          helper: "얼음이 전부 물이 되자 온도가 <b>다시 오르기 시작</b>했어요. 이제 흡수한 열에너지가 온도를 올리는 데 쓰여요.",
        },
        boil: {
          toast: "100℃ — 또 멈췄어요!",
          helper: "이번엔 <b>100℃에서 멈춤</b>! 열에너지가 전부 <b>물→수증기 상태 변화</b>에 쓰이는 중이에요. 아무리 세게 끓여도 물은 100℃를 넘지 않아요.",
        },
        steam: {
          toast: "다 끓었다 — 온도가 다시 올라요",
          helper: "전부 수증기가 되자 온도가 다시 올라요. 수평 구간 두 개 — 이게 오늘의 발견이에요!",
        },
      }
    : {
        boil: {
          toast: "100℃ — 온도가 멈췄어요!",
          helper: "식는 중인데 온도가 <b>100℃에서 멈췄어요</b>. 수증기가 물이 되면서(액화) <b>열에너지를 방출</b>해 온도를 붙잡고 있는 거예요.",
        },
        water: {
          toast: "다 액화됐다 — 다시 식어요",
          helper: "수증기가 전부 물이 되자 온도가 다시 내려가요.",
        },
        melt: {
          toast: "0℃ — 또 멈췄어요!",
          helper: "이번엔 <b>0℃에서 멈춤</b>! 물이 얼면서(응고) <b>열에너지를 방출</b>하고 있어요. 사과나무에 물을 뿌리는 이유가 바로 이거예요.",
        },
        ice: {
          toast: "다 얼었다 — 다시 식어요",
          helper: "전부 얼음이 되자 온도가 다시 내려가요. 방출 방향에서도 수평 구간은 두 개!",
        },
      };

  function onZoneChange(zone: MapResult["zone"]): void {
    const msg = ZONE_MSG[zone];
    if (!msg) return;
    if (zone === "melt" || zone === "boil") {
      if (!plateausSeen.has(zone)) {
        plateausSeen.add(zone);
        haptic(HAPTIC.cross);
      }
    }
    stage.toast(msg.toast);
    if (!finished) helper.innerHTML = msg.helper;
  }

  function drawGraph(): void {
    const { ctx, w, h } = fitCanvas(graph, 170);
    const padL = 40;
    const padR = 14;
    const padT = 16;
    const padB = 26;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const yOf = (T: number): number => padT + (1 - (T + 20) / 140) * plotH;

    // 축
    ctx.strokeStyle = "rgba(148,176,214,.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(padL, padT - 4);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = "#8CA2C0";
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("온도(℃)", padL - 32, padT - 6);
    ctx.textAlign = "right";
    ctx.fillText(heatMode ? "가열 시간 →" : "냉각 시간 →", w - padR, h - 8);

    // 기준선 0·100
    ctx.setLineDash([4, 5]);
    for (const [T, label] of [
      [0, "0"],
      [100, "100"],
    ] as [number, string][]) {
      ctx.strokeStyle = "rgba(148,176,214,.28)";
      ctx.beginPath();
      ctx.moveTo(padL, yOf(T));
      ctx.lineTo(padL + plotW, yOf(T));
      ctx.stroke();
      ctx.fillStyle = "#8CA2C0";
      ctx.textAlign = "right";
      ctx.fillText(label, padL - 6, yOf(T) + 3.5);
    }
    ctx.setLineDash([]);
    ctx.fillText("-20", padL - 6, yOf(-20) + 3.5);
    ctx.fillText("120", padL - 6, yOf(120) + 3.5);

    // 곡선 — 색은 그 지점 온도색
    if (samples.length > 1) {
      for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1];
        const b = samples[i];
        ctx.strokeStyle = colFor(b.T, 62, 0.95);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(padL + a.x * plotW, yOf(a.T));
        ctx.lineTo(padL + b.x * plotW, yOf(b.T));
        ctx.stroke();
      }
      // 현재 점(발광)
      const last = samples[samples.length - 1];
      const px = padL + last.x * plotW;
      const py = yOf(last.T);
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 15);
      glow.addColorStop(0, colFor(last.T, 62, 0.5));
      glow.addColorStop(1, colFor(last.T, 62, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colFor(last.T, 70, 1);
      ctx.beginPath();
      ctx.arc(px, py, 4.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.arc(px - 1.2, py - 1.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 수평 구간 배지(구간을 지나왔으면 표시)
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    const meltX = ((E_ICE + E_MELT) / 2 / E_MAX) * plotW + padL;
    const boilX = ((E_WATER + E_BOIL) / 2 / E_MAX) * plotW + padL;
    const progressed = (heatMode ? E : E_MAX - E) / E_MAX;
    if (plateausSeen.has("melt") || progressed > (heatMode ? E_MELT : E_MAX - E_ICE) / E_MAX) {
      ctx.fillStyle = "rgba(220,236,255,.85)";
      ctx.fillText(heatMode ? "융해 — 온도 일정" : "응고 — 온도 일정", meltX, yOf(0) - 8);
    }
    if (plateausSeen.has("boil") || progressed > (heatMode ? E_BOIL : E_MAX - E_WATER) / E_MAX) {
      ctx.fillStyle = "rgba(255,224,214,.9)";
      ctx.fillText(heatMode ? "기화 — 온도 일정" : "액화 — 온도 일정", boilX, yOf(100) - 8);
    }
  }

  const loop: Loop = createLoop((dt, tMs) => {
    if (active && !finished) {
      E = clamp(E + (heatMode ? RATE : -RATE) * dt, 0, E_MAX);
    }
    const m = mapE(E);
    stage.setTemp(m.simT);
    stage.tick(dt, tMs);

    // HUD
    tempNum.textContent = String(Math.round(m.T));
    const ph = m.simT < 0.5 ? "고체" : m.simT < 100 ? "액체" : "기체";
    const mixing = m.zone === "melt" || m.zone === "boil";
    phaseName.textContent = mixing ? (m.zone === "melt" ? "고체+액체" : "액체+기체") : ph;
    phaseDot.style.background = colFor(m.T, 66, 1);
    phaseDot.style.boxShadow = `0 0 8px ${colFor(m.T, 60, 0.8)}`;
    energyPill.classList.toggle("on", active);

    // 샘플(활성 중에만 진행) — x는 E 진행률이라 그래프가 정직하게 옆으로 자란다
    if (active && !finished) {
      const x = (heatMode ? E : E_MAX - E) / E_MAX;
      const lastX = samples.length ? samples[samples.length - 1].x : -1;
      if (x - lastX > 0.004) samples.push({ x, T: m.T });
    }
    if (m.zone !== lastZone) {
      onZoneChange(m.zone);
      lastZone = m.zone;
    }
    drawGraph();

    // 완료: 두 수평 구간을 모두 지나면
    const done = heatMode ? E >= E_BOIL + 6 : E <= E_ICE - 6 || (E <= 6 && plateausSeen.has("melt"));
    if (!finished && plateausSeen.has("melt") && plateausSeen.has("boil") && done) {
      finished = true;
      haptic(HAPTIC.ctaUnlock);
      helper.innerHTML = heatMode
        ? "완주! 상태가 변하는 동안엔 흡수한 열에너지가 <b>전부 상태 변화에 사용</b>돼서 온도가 일정했어요. 그래프의 수평 구간 두 개가 그 증거예요."
        : "완주! 상태가 변하는 동안엔 <b>열에너지를 방출</b>하면서 온도가 일정하게 유지됐어요. 냉각 곡선에도 수평 구간이 두 개!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  });

  const onResize = (): void => {
    stage.resize();
    fitCanvas(graph, 170);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    stage.resize();
    stage.sim.buildLattice(true);
    fitCanvas(graph, 170);
    loop.start();
  });

  api.setCTA(heatMode ? "가열해서 그래프를 완성하세요" : "냉각해서 그래프를 완성하세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    stage.dispose();
  };
};
