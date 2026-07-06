// charlesSyringe — 샤를 법칙 랩(VI 단원 L4). 교과서 탐구(210~213쪽)의 조작판.
//   · 물중탕 속 세로 주사기: 물 온도 슬라이더 20~80℃ — 부피는 교과서 표 그대로
//     (20→27.2, 30→28.1, 40→29.1, 50→30.0, 60→30.9, 70→31.8, 80→32.8 mL ≈ 선형)
//   · 속 입자는 온도에 비례해 빨라지고(꼬리 길어짐), 피스톤이 밀려 올라간다 (압력 일정)
//   · 하단 실시간 그래프(x=온도 ℃, y=부피 mL) — 직선이 그려진다
// 목표: ① 50℃(30.0 mL) ② 80℃(32.8 mL) ③ 도로 식혀 20℃(27.2 mL).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { GasBox } from "../../ui/gasKit";
import { tempColor } from "../../ui/thermo";
import { glassStrokeStyle, contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface CharlesStep {
  title: string;
  lead?: string;
  cta?: string;
}

const T_MIN = 20;
const T_MAX = 80;
const volOf = (t: number): number => 27.2 + (t - 20) * (5.6 / 60); // 표의 선형 근사(양끝 정확)
const CVH = 400;
const LABH = 288;

export const charlesSyringe: StepRenderer = (host, step, api) => {
  const s = step as unknown as CharlesStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const readVal = el("span", { text: "27.2" });
  const tempPill = el("span", { text: "물 온도 20℃" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F0A422" }), tempPill),
      el("div", { class: "tempread" }, readVal, el("small", { text: " mL" })),
    ),
    toastEl,
  );

  // 온도 슬라이더 — heatParticles와 동일한 커스텀 슬라이더 문법
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const fillEl = el("div", { class: "sl-fill" });
  const track = el("div", { class: "sl-track temp" }, fillEl, thumb);
  const slider = el(
    "div",
    {
      class: "slider hp-slider",
      attrs: {
        role: "slider", tabindex: "0", "aria-label": "물 온도",
        "aria-valuemin": String(T_MIN), "aria-valuemax": String(T_MAX),
        "aria-valuenow": "20", "aria-valuetext": "20도",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "차갑게 20℃" }), el("span", { text: "뜨겁게 80℃" })),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "t50" } }, el("b", { text: "50℃로" }), el("span", { text: "부피는?" })),
    el("div", { class: "pn-badge", dataset: { g: "t80" } }, el("b", { text: "80℃로" }), el("span", { text: "끝까지!" })),
    el("div", { class: "pn-badge", dataset: { g: "cool" } }, el("b", { text: "도로 식히기" }), el("span", { text: "돌아올까?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "주사기를 물에 담갔어요(끝은 막음, 압력 일정). 슬라이더로 <b>물 온도</b>를 올리며 피스톤을 지켜보세요.",
  });
  host.append(goalChips, stage, slider, helper);

  // ---- 상태 ----
  let W = 340;
  let H = CVH;
  let temp = 20;
  let dispVol = volOf(20); // 표시 부피(관성)
  const gas = new GasBox(0.95);
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  const holdMs = { t50: 0, t80: 0, cool: 0 };
  const samples: { t: number; v: number }[] = [];

  const t01 = (v: number): number => (v - T_MIN) / (T_MAX - T_MIN);
  function setSliderUI(): void {
    const f = t01(temp) * 100;
    thumb.style.left = `${f}%`;
    fillEl.style.width = `${f}%`;
    (thumb.firstChild as HTMLElement).style.background = tempColor(t01(temp));
    slider.setAttribute("aria-valuenow", String(Math.round(temp)));
    slider.setAttribute("aria-valuetext", `${Math.round(temp)}도`);
  }
  function setTempFromClientX(cx: number): void {
    const rect = track.getBoundingClientRect();
    temp = clamp(T_MIN + ((cx - rect.left) / rect.width) * (T_MAX - T_MIN), T_MIN, T_MAX);
    setSliderUI();
  }
  let sliderDrag = false;
  slider.addEventListener("pointerdown", (e) => {
    sliderDrag = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    setTempFromClientX(e.clientX);
    haptic(HAPTIC.tap);
  });
  slider.addEventListener("pointermove", (e) => {
    if (sliderDrag) setTempFromClientX(e.clientX);
  });
  const endSlider = (): void => {
    sliderDrag = false;
    slider.classList.remove("drag");
  };
  slider.addEventListener("pointerup", endSlider);
  slider.addEventListener("pointercancel", endSlider);
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") temp = clamp(temp + 5, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") temp = clamp(temp - 5, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    setSliderUI();
  });
  requestAnimationFrame(setSliderUI);

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function collect(id: string, subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "이게 <b>샤를 법칙</b> — 압력이 일정할 때 온도가 높아지면 부피가 <b>일정한 비율로</b> 늘어나요. 입자 수는 그대로, <b>운동이 빨라져 세게 충돌</b>하면서 피스톤을 밀어 올린 거예요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 그래프(x=온도, y=부피) ----
  function drawGraph(ctx: CanvasRenderingContext2D, tMs: number): void {
    const gx0 = 52;
    const gx1 = W - 18;
    const gy0 = LABH + 16;
    const gy1 = H - 24;
    const xOf = (t: number): number => gx0 + ((t - 15) / 70) * (gx1 - gx0);
    const yOf = (v: number): number => gy1 - ((v - 26.4) / 7.2) * (gy1 - gy0);

    ctx.strokeStyle = "rgba(148,168,196,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 4);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(196,212,232,.75)";
    ctx.textAlign = "right";
    for (const v of [28, 30, 32]) {
      ctx.strokeStyle = "rgba(148,168,196,.14)";
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(v));
      ctx.lineTo(gx1, yOf(v));
      ctx.stroke();
      ctx.fillText(String(v), gx0 - 6, yOf(v) + 3.5);
    }
    ctx.textAlign = "center";
    for (const t of [20, 40, 60, 80]) ctx.fillText(String(t), xOf(t), gy1 + 13);
    ctx.textAlign = "left";
    ctx.fillText("부피(mL)", gx0 + 4, gy0 - 6);
    ctx.textAlign = "right";
    ctx.fillText("온도(℃) →", gx1, gy0 - 6);

    // 이론 직선(연하게)
    ctx.strokeStyle = "rgba(255,190,120,.2)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(xOf(18), yOf(volOf(18)));
    ctx.lineTo(xOf(82), yOf(volOf(82)));
    ctx.stroke();
    // 방문 샘플
    ctx.fillStyle = "rgba(255,190,120,.6)";
    for (const smp of samples) {
      ctx.beginPath();
      ctx.arc(xOf(smp.t), yOf(smp.v), 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    // 현재 점
    const cxg = xOf(temp);
    const cyg = yOf(dispVol);
    ctx.fillStyle = "rgba(255,190,120,.25)";
    ctx.beginPath();
    ctx.arc(cxg, cyg, 8 + Math.sin(tMs / 260), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD08A";
    ctx.beginPath();
    ctx.arc(cxg, cyg, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- 프레임 ----
  let shown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const sx = W * 0.5;

    dispVol += (volOf(temp) - dispVol) * Math.min(1, 0.12 * dt);
    const warm01 = (temp - T_MIN) / (T_MAX - T_MIN);
    const speedScale = 1 + warm01 * 0.65;

    // 목표 판정
    const nearT = (t: number): boolean => Math.abs(temp - t) <= 2;
    holdMs.t50 = nearT(50) ? holdMs.t50 + dt * 16.7 : 0;
    holdMs.t80 = temp >= 78 ? holdMs.t80 + dt * 16.7 : 0;
    holdMs.cool = temp <= 22 ? holdMs.cool + dt * 16.7 : 0;
    if (holdMs.t50 > 500) collect("t50", "30.0 mL!", "50℃ — 딱 30.0 mL");
    if (goals.has("t50") && holdMs.t80 > 500) collect("t80", "32.8 mL!", "80℃ — 32.8 mL까지 팽창");
    if (goals.has("t80") && holdMs.cool > 500) collect("cool", "27.2 mL!", "식히니 그대로 돌아왔어요");

    // 샘플
    const last = samples[samples.length - 1];
    if (Math.abs(volOf(temp) - dispVol) < 0.12 && (!last || Math.abs(last.t - temp) > 1.2)) {
      samples.push({ t: temp, v: dispVol });
      if (samples.length > 200) samples.shift();
    }

    // ---- 그리기 ----
    // 비커(물중탕) — 온도색 물
    const bkW = Math.min(W * 0.62, 250);
    const bkL = sx - bkW / 2;
    const bkR = sx + bkW / 2;
    const bkTop = 74;
    const bkBot = LABH - 14;
    contactShadow(ctx, sx, bkBot + 6, bkW * 0.55, 0.24);
    // 물
    const wTop = bkTop + 18;
    const waterG = ctx.createLinearGradient(0, wTop, 0, bkBot);
    const wc = tempColor(warm01, 0.34);
    const wc2 = tempColor(warm01, 0.12);
    waterG.addColorStop(0, wc);
    waterG.addColorStop(1, wc2);
    ctx.fillStyle = waterG;
    ctx.beginPath();
    ctx.roundRect(bkL + 3, wTop, bkW - 6, bkBot - wTop - 3, 8);
    ctx.fill();
    // 수면 라인
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bkL + 6, wTop);
    ctx.lineTo(bkR - 6, wTop);
    ctx.stroke();
    // 비커 유리
    ctx.strokeStyle = glassStrokeStyle(ctx, bkTop, bkBot);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(bkL, bkTop - 6);
    ctx.lineTo(bkL, bkBot - 8);
    ctx.quadraticCurveTo(bkL, bkBot, bkL + 8, bkBot);
    ctx.lineTo(bkR - 8, bkBot);
    ctx.quadraticCurveTo(bkR, bkBot, bkR, bkBot - 8);
    ctx.lineTo(bkR, bkTop - 6);
    ctx.stroke();
    // 가열 기포(뜨거울 때)
    if (warm01 > 0.55) {
      for (let i = 0; i < 5; i++) {
        const bx = bkL + 24 + ((i * 47.3) % (bkW - 48));
        const by = bkBot - 10 - (((tMs * (0.02 + i * 0.004)) + i * 37) % (bkBot - wTop - 22));
        ctx.strokeStyle = `rgba(255,255,255,${(0.28 * (warm01 - 0.5)) / 0.5})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(bx, by, 2.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 세로 주사기(물속) — 몸통 고정, 피스톤이 부피 따라 위아래
    const syW = 74;
    const syL = sx - syW / 2;
    const syBot = bkBot - 12;
    const syTop = 96;
    // 기체 기둥: 27.2~32.8mL → 픽셀 높이
    const colH = 74 + ((dispVol - 27.2) / 5.6) * 46; // 74..120px
    const gasTop = syBot - colH;
    const b = { x0: syL + 5, y0: gasTop + 3, x1: syL + syW - 5, y1: syBot - 5 };
    gas.setCount(12, b);
    gas.step(dt, b, speedScale);

    // 몸통 유리
    const syG = ctx.createLinearGradient(syL, 0, syL + syW, 0);
    syG.addColorStop(0, "rgba(214,232,252,.30)");
    syG.addColorStop(0.22, "rgba(255,255,255,.44)");
    syG.addColorStop(0.6, "rgba(190,214,240,.16)");
    syG.addColorStop(1, "rgba(150,178,210,.26)");
    ctx.fillStyle = syG;
    ctx.beginPath();
    ctx.roundRect(syL, syTop, syW, syBot - syTop + 6, 9);
    ctx.fill();
    ctx.strokeStyle = glassStrokeStyle(ctx, syTop, syBot);
    ctx.lineWidth = 2;
    ctx.stroke();
    // 눈금 27~33
    ctx.font = "600 9px Pretendard, sans-serif";
    ctx.textAlign = "left";
    for (let mv = 28; mv <= 32; mv += 2) {
      const my = syBot - (74 + ((mv - 27.2) / 5.6) * 46);
      ctx.strokeStyle = "rgba(226,240,255,.42)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(syL + 4, my);
      ctx.lineTo(syL + 14, my);
      ctx.stroke();
      ctx.fillStyle = "rgba(196,214,236,.75)";
      ctx.fillText(String(mv), syL + 17, my + 3);
    }
    // 기체 입자
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(b.x0 - 2, b.y0 - 2, b.x1 - b.x0 + 4, b.y1 - b.y0 + 4, 7);
    ctx.clip();
    gas.draw(ctx, 205, speedScale);
    ctx.restore();
    // 마개(아래 노즐)
    ctx.fillStyle = "rgba(150,178,210,.5)";
    ctx.beginPath();
    ctx.roundRect(sx - 9, syBot + 4, 18, 10, 4);
    ctx.fill();
    const capG = ctx.createLinearGradient(sx - 8, 0, sx + 8, 0);
    capG.addColorStop(0, "#7FB2E8");
    capG.addColorStop(1, "#3E6EA8");
    ctx.fillStyle = capG;
    ctx.beginPath();
    ctx.roundRect(sx - 7, syBot + 13, 14, 9, 3.5);
    ctx.fill();
    // 피스톤(기체 위) + 축(위로)
    const py = gasTop;
    const rodG = ctx.createLinearGradient(sx - 6, 0, sx + 6, 0);
    rodG.addColorStop(0, "#E8F2FC");
    rodG.addColorStop(1, "#9FB6CE");
    ctx.fillStyle = rodG;
    ctx.beginPath();
    ctx.roundRect(sx - 5, 40, 10, py - 40, 4);
    ctx.fill();
    const faceG = ctx.createLinearGradient(syL, 0, syL + syW, 0);
    faceG.addColorStop(0, "#5B87B8");
    faceG.addColorStop(0.5, "#DCEBFA");
    faceG.addColorStop(1, "#46688E");
    ctx.fillStyle = faceG;
    ctx.beginPath();
    ctx.roundRect(syL + 3, py - 10, syW - 6, 13, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,52,76,.65)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // 축 캡(맨 위)
    ctx.fillStyle = "#7FA6D2";
    ctx.beginPath();
    ctx.roundRect(sx - 16, 30, 32, 12, 5);
    ctx.fill();
    // 피스톤 이동 잔상 화살표(팽창 중일 때)
    if (volOf(temp) - dispVol > 0.25) {
      ctx.strokeStyle = "rgba(255,194,77,.6)";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(syL - 14, py + 8);
      ctx.lineTo(syL - 14, py - 12);
      ctx.moveTo(syL - 19, py - 6);
      ctx.lineTo(syL - 14, py - 12);
      ctx.lineTo(syL - 9, py - 6);
      ctx.stroke();
    }
    // 온도계(비커 옆)
    const thX = bkR - 18;
    ctx.strokeStyle = "rgba(226,240,255,.6)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(thX, bkTop - 18);
    ctx.lineTo(thX, wTop + 46);
    ctx.stroke();
    ctx.strokeStyle = tempColor(warm01, 0.95);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(thX, wTop + 46);
    ctx.lineTo(thX, wTop + 46 - 24 - warm01 * 34);
    ctx.stroke();

    drawGraph(ctx, tMs);

    // HUD
    const txt = dispVol.toFixed(1);
    if (txt !== shown) {
      shown = txt;
      readVal.textContent = txt;
      tempPill.textContent = `물 온도 ${temp}℃`;
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("50℃ → 80℃ → 식히기, 차례로!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
