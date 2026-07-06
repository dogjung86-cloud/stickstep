// phaseVolume — 아세톤 풍선 랩(IV 단원 L4). 교과서 해보기(130쪽) 그대로:
// 삼각 플라스크 속 아세톤 1 mL, 입구에 쭈그러진 풍선. 따뜻한 바람을 불면 아세톤이 기화해
// 풍선이 크게 부푼다. HUD의 "입자 수·질량"은 끝까지 그대로 — 변하는 건 배열(부피)뿐.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface PhaseVolumeStep {
  title: string;
  lead?: string;
  cta?: string;
}

type Mode = "liquid" | "rising" | "balloon" | "returning";
interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mode: Mode;
  home: { x: number; y: number }; // 액체일 때 자리
  jx: number;
}

const N = 24;
const GOAL_GAS = 18;
const TAU = Math.PI * 2;
const LIQ = "138,124,250"; // 아세톤 액체(보라)
const GASC = "176,168,255"; // 기화한 입자(옅은 보라)

export const phaseVolume: StepRenderer = (host, step, api) => {
  const s = step as unknown as PhaseVolumeStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:280px" });
  const countPill = el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:rgb(${LIQ})` }), el("span", { text: `입자 ${N}개` }));
  const massPill = el("div", { class: "pill" }, el("span", { text: "질량 2.0 g — 그대로" }));
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, countPill, massPill),
    el("div", { class: "stage-cap", text: "아세톤 1 mL — 풍선은 아직 쭈글쭈글" }),
  );

  const heatBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "꾹 눌러 따뜻한 바람 불기" }));
  const helper = el("div", {
    class: "helper",
    html: "버튼을 <b>꾹 누르고 있으면</b> 플라스크 바닥이 데워져요. 액체 아세톤 입자에게 무슨 일이 생기는지 보세요.",
  });
  host.append(stage, heatBtn, helper);

  // ---- 상태 ----
  const ps: P[] = [];
  let heating = false;
  let escClock = 0;
  let balloonR = 16; // 표시 반지름(부드럽게 목표를 따라감)
  let finished = false;
  let massPulsed = 0;

  function seed(cx: number, botY: number): void {
    ps.length = 0;
    const rows = [9, 8, 7];
    let i = 0;
    rows.forEach((n, r) => {
      for (let c = 0; c < n; c++) {
        const home = { x: cx + (c - (n - 1) / 2) * 14 + (r % 2 ? 4 : -2), y: botY - 10 - r * 12 };
        ps.push({ x: home.x, y: home.y, vx: 0, vy: 0, mode: "liquid", home, jx: i * 2.3 });
        i++;
      }
    });
  }

  heatBtn.addEventListener("pointerdown", (e) => {
    heating = true;
    heatBtn.classList.add("done-static");
    heatBtn.setPointerCapture(e.pointerId);
    haptic(HAPTIC.tap);
  });
  const stopHeat = (): void => {
    heating = false;
    heatBtn.classList.remove("done-static");
  };
  heatBtn.addEventListener("pointerup", stopHeat);
  heatBtn.addEventListener("pointercancel", stopHeat);

  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 280);
    const cx = w / 2;
    const botY = h - 30;
    const bodyW = Math.min(w * 0.5, 190);
    const neckW = 26;
    const neckTop = 78;
    const bodyTop = botY - 84;
    if (ps.length === 0) seed(cx, botY);

    const gasCount = ps.filter((p) => p.mode !== "liquid").length;
    const targetR = 16 + gasCount * 3.1;
    balloonR += (targetR - balloonR) * Math.min(1, 0.06 * dt);
    const balloonCy = neckTop - balloonR + 6;

    // ---- 기화 ----
    if (heating && !finished) {
      escClock += dt;
      if (escClock > 22) {
        escClock = 0;
        // 표면(가장 위) 액체 입자 하나 기화
        let top = -1;
        for (let i = 0; i < ps.length; i++) {
          if (ps[i].mode !== "liquid") continue;
          if (top < 0 || ps[i].y < ps[top].y) top = i;
        }
        if (top >= 0 && gasCount < N) {
          const p = ps[top];
          p.mode = "rising";
          p.vx = 0;
          p.vy = -1.4;
          massPulsed = tMs;
          haptic(6);
        }
      }
    }

    // ---- 입자 운동 ----
    for (const p of ps) {
      if (p.mode === "liquid") {
        p.x = p.home.x + Math.sin(tMs / 250 + p.jx) * 1.6;
        p.y = p.home.y + Math.cos(tMs / 290 + p.jx) * 1.1;
      } else if (p.mode === "rising") {
        // 목(neck)을 향해 모였다가 위로
        p.x += (cx - p.x) * Math.min(1, 0.05 * dt);
        p.y += p.vy * dt;
        if (p.y < balloonCy + balloonR * 0.4) {
          p.mode = "balloon";
          p.vx = (Math.random() - 0.5) * 1.6;
          p.vy = -0.6 - Math.random() * 0.8;
        }
      } else if (p.mode === "balloon") {
        p.vx += (Math.random() - 0.5) * 0.22 * dt;
        p.vy += (Math.random() - 0.5) * 0.22 * dt;
        const v = Math.hypot(p.vx, p.vy) || 1e-4;
        const k = 1 + (1.5 / v - 1) * Math.min(1, 0.1 * dt);
        p.vx *= k;
        p.vy *= k;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // 풍선 원 내부 반사
        const dx = p.x - cx;
        const dy = p.y - balloonCy;
        const d = Math.hypot(dx, dy);
        const lim = balloonR - 7;
        if (d > lim) {
          const nx = dx / d;
          const ny = dy / d;
          p.x = cx + nx * lim;
          p.y = balloonCy + ny * lim;
          const dot = p.vx * nx + p.vy * ny;
          p.vx -= 2 * dot * nx;
          p.vy -= 2 * dot * ny;
        }
      }
    }

    // ---- 그리기: 플라스크(삼각) + 목 ----
    ctx.strokeStyle = "rgba(148,176,214,.55)";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2, neckTop);
    ctx.lineTo(cx - neckW / 2, bodyTop);
    ctx.lineTo(cx - bodyW / 2, botY);
    ctx.lineTo(cx + bodyW / 2, botY);
    ctx.lineTo(cx + neckW / 2, bodyTop);
    ctx.lineTo(cx + neckW / 2, neckTop);
    ctx.stroke();

    // ---- 풍선 ----
    const wob = Math.sin(tMs / 300) * (balloonR * 0.02);
    ctx.beginPath();
    ctx.ellipse(cx, balloonCy, balloonR + wob, balloonR - wob, 0, 0, TAU);
    ctx.strokeStyle = "rgba(255,158,190,.75)";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,158,190,.07)";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.beginPath();
    ctx.ellipse(cx - balloonR * 0.34, balloonCy - balloonR * 0.36, balloonR * 0.16, balloonR * 0.1, -0.6, 0, TAU);
    ctx.fill();

    // ---- 입자 ----
    for (const p of ps) {
      const gasP = p.mode !== "liquid";
      const col = gasP ? GASC : LIQ;
      if (gasP) {
        ctx.strokeStyle = `rgba(${col},.35)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.fillStyle = `rgb(${col})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, gasP ? 4.4 : 5.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.32)";
      ctx.beginPath();
      ctx.arc(p.x - 1.5, p.y - 1.7, 1.6, 0, TAU);
      ctx.fill();
    }

    // ---- 드라이기 바람 ----
    if (heating) {
      ctx.strokeStyle = "rgba(255,196,120,.4)";
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 3; i++) {
        const yy = botY + 8 + i * 5;
        const ph = Math.sin(tMs / 110 + i * 1.4) * 5;
        ctx.beginPath();
        ctx.moveTo(cx - bodyW / 2 - 34, yy + ph);
        ctx.quadraticCurveTo(cx, yy + 12, cx + bodyW / 2 + 34, yy + ph);
        ctx.stroke();
      }
    }

    // ---- HUD 갱신 ----
    countPill.querySelector("span:last-child")!.textContent = `입자 ${N}개 — 그대로`;
    if (tMs - massPulsed < 350) massPill.classList.add("pulse-soft");
    else massPill.classList.remove("pulse-soft");

    // ---- 완료 ----
    if (!finished && gasCount >= GOAL_GAS) {
      finished = true;
      haptic(HAPTIC.ctaUnlock);
      helper.innerHTML =
        "풍선이 빵빵해졌어요! 그런데 HUD를 보세요 — <b>입자 수도 질량도 그대로</b>예요. 기화하면서 <b>입자 사이의 거리</b>가 멀어져 <b>부피만</b> 크게 늘어난 거예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 280);
    ps.length = 0;
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    fitCanvas(canvas, 280);
    loop.start();
  });

  api.setCTA("바람을 불어 기화시켜 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
