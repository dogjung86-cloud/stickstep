// heatParticles — 온도와 입자 운동 랩(L1).
// 온도 슬라이더를 밀면 물 입자의 운동이 실시간으로 활발해지고(빨라지고 간격이 벌어지고),
// 뜨겁게 한 번 + 차갑게 한 번 탐험하면 CTA가 열린다. 입자 색·속도·잔상이 온도의 시각 언어.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, motionWord, drawGlowParticle, makeParticles, stepFree, type Box } from "../../ui/thermo";
import type { StepRenderer } from "../types";

interface HeatParticlesStep {
  title: string;
  lead?: string;
  goalHot?: number; // 기본 80
  goalCold?: number; // 기본 20
  cta?: string;
}

const T_MIN = 10;
const T_MAX = 95;
const N = 42;

export const heatParticles: StepRenderer = (host, step, api) => {
  const s = step as unknown as HeatParticlesStep;
  const goalHot = s.goalHot ?? 80;
  const goalCold = s.goalCold ?? 20;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "hp-canvas", style: "height:260px" });
  const tempDot = el("span", { class: "pdot" });
  const tempVal = el("span", { class: "hp-temp", text: "24℃" });
  const motionEl = el("span", { text: "입자 운동이 보통이에요" });
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, tempDot, el("span", { text: "물 온도 " }), tempVal),
    el("div", { class: "pill" }, motionEl),
  );
  const goalChips = el(
    "div",
    { class: "hp-goals" },
    el("span", { class: "hp-goal", dataset: { goal: "hot" }, text: "뜨겁게" }),
    el("span", { class: "hp-goal", dataset: { goal: "cold" }, text: "차갑게" }),
  );
  const stage = el("div", { class: "stage hp-stage" }, canvas, hud, goalChips);

  // ---- 온도 슬라이더 ----
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const fill = el("div", { class: "sl-fill" });
  const track = el("div", { class: "sl-track temp" }, fill, thumb);
  const slider = el(
    "div",
    {
      class: "slider hp-slider",
      attrs: {
        role: "slider",
        tabindex: "0",
        "aria-label": "물 온도",
        "aria-valuemin": String(T_MIN),
        "aria-valuemax": String(T_MAX),
        "aria-valuenow": "24",
        "aria-valuetext": "24도",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "차갑게" }), el("span", { text: "뜨겁게" })),
  );

  const helper = el("div", { class: "helper", html: "슬라이더를 밀어 물을 <b>뜨겁게</b> 데워 보세요. 입자들이 어떻게 달라질까요?" });
  host.append(stage, slider, helper);

  // ---- 상태 ----
  let T = 24; // 슬라이더 목표 온도
  let Td = 24; // 화면 표시 온도(관성)
  let box: Box = { x: 10, y: 10, w: 300, h: 240 };
  let ps = makeParticles(N, box);
  let doneHot = false;
  let doneCold = false;
  let finished = false;
  let lastShownT = -1;

  const t01 = (v: number): number => (v - T_MIN) / (T_MAX - T_MIN);

  function setSliderUI(): void {
    const f = t01(T) * 100;
    thumb.style.left = `${f}%`;
    fill.style.width = `${f}%`;
    (thumb.firstChild as HTMLElement).style.background = tempColor(t01(T));
    slider.setAttribute("aria-valuenow", String(Math.round(T)));
    slider.setAttribute("aria-valuetext", `${Math.round(T)}도`);
  }

  function setTempFromClientX(cx: number): void {
    const rect = track.getBoundingClientRect();
    T = clamp(T_MIN + ((cx - rect.left) / rect.width) * (T_MAX - T_MIN), T_MIN, T_MAX);
    setSliderUI();
  }

  let dragging = false;
  slider.addEventListener("pointerdown", (e) => {
    dragging = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    setTempFromClientX(e.clientX);
  });
  slider.addEventListener("pointermove", (e) => {
    if (dragging) setTempFromClientX(e.clientX);
  });
  const endDrag = (): void => {
    dragging = false;
    slider.classList.remove("drag");
  };
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") T = clamp(T + 3, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") T = clamp(T - 3, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    setSliderUI();
  });

  // ---- 목표 ----
  function checkGoals(): void {
    if (finished) return;
    if (!doneHot && Td >= goalHot) {
      doneHot = true;
      haptic(HAPTIC.ctaUnlock);
      (goalChips.querySelector('[data-goal="hot"]') as HTMLElement).classList.add("on");
      helper.innerHTML =
        "입자들이 <b>빠르게 움직이고 간격도 벌어졌어요</b>. 이번엔 반대로, 물을 <b>차갑게</b> 식혀 보세요.";
    }
    if (!doneCold && doneHot && Td <= goalCold) {
      doneCold = true;
      (goalChips.querySelector('[data-goal="cold"]') as HTMLElement).classList.add("on");
    }
    if (doneHot && doneCold) {
      finished = true;
      helper.innerHTML =
        "확인했어요! 온도가 높을수록 입자 운동이 <b>활발</b>하고, 낮을수록 <b>둔해요</b>. 온도는 바로 이 <b>입자 운동의 활발한 정도</b>를 나타내는 수예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 그리기 ----
  function fit(): void {
    const { w, h } = fitCanvas(canvas, 260);
    box = { x: 12, y: 12, w: w - 24, h: h - 24 };
    for (const p of ps) {
      p.x = clamp(p.x, box.x, box.x + box.w);
      p.y = clamp(p.y, box.y, box.y + box.h);
    }
  }

  const loop: Loop = createLoop((dt, tMs) => {
    Td += (T - Td) * Math.min(1, 0.055 * dt);
    const t = t01(Td);
    const { ctx, w, h } = fitCanvas(canvas, 260);
    box = { x: 12, y: 12, w: w - 24, h: h - 24 };

    const speed = 0.1 + Math.pow(t, 1.15) * 2.1;
    const repel = 15 + t * 11;
    stepFree(ps, box, dt, speed, repel);

    // 온도 무드 — 바닥/상단에 옅은 온도색 김서림
    ctx.fillStyle = tempColor(t, 0.05 + t * 0.05);
    ctx.fillRect(0, 0, w, h);

    const r = 6.2;
    for (const p of ps) {
      // 속도 잔상(활발함의 시각 언어)
      const vx = p.x - p.px;
      const vy = p.y - p.py;
      const sp = Math.hypot(vx, vy);
      if (sp > 0.9) {
        ctx.strokeStyle = tempColor(t, Math.min(0.4, (sp - 0.8) * 0.16));
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x - vx * 3.2, p.y - vy * 3.2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      // 저온에서는 제자리 미세 진동을 덧입혀 "둔하지만 멈추지 않음"을 보여준다
      const shiver = (1 - t) * 0.8;
      const ox = Math.sin(tMs / 70 + p.seed * 40) * shiver;
      const oy = Math.cos(tMs / 64 + p.seed * 60) * shiver;
      drawGlowParticle(ctx, p.x + ox, p.y + oy, r, t, 2.1);
    }

    // HUD
    const shown = Math.round(Td);
    if (shown !== lastShownT) {
      lastShownT = shown;
      tempVal.textContent = `${shown}℃`;
      tempDot.style.background = tempColor(t);
      tempDot.style.boxShadow = `0 0 8px ${tempColor(t, 0.8)}`;
      motionEl.textContent = `입자 운동이 ${motionWord(t)}`;
      checkGoals();
    }
  });

  api.setCTA("온도를 바꿔 입자를 관찰하세요", { enabled: false });
  window.addEventListener("resize", fit);
  const rafId = requestAnimationFrame(() => {
    fit();
    ps = makeParticles(N, box);
    setSliderUI();
    loop.start();
  });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", fit);
  };
};
