// evaporation — 증발 랩(IV 단원 L1). 교과서 해보기(118쪽) 그대로:
// 거름종이에 편 손 소독제가 마르는 동안 전자저울 숫자가 줄어든다.
// 표면의 입자부터 하나씩 기체가 되어 날아가는 것이 보인다. 부채질로 가속 가능.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface EvaporationStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface LiquidP {
  x: number; // 접시 기준 상대 좌표
  y: number;
  jx: number; // 진동 시드
}
interface GasP {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
}

const START_N = 26;
const GOAL_LEFT = 12; // 남은 입자가 이만큼이면 완료(절반 증발)
const START_MASS = 0.3;
const TAU = Math.PI * 2;
const COL = "43,199,190"; // 소독제 청록

export const evaporation: StepRenderer = (host, step, api) => {
  const s = step as unknown as EvaporationStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:250px" });
  const massVal = el("span", { class: "hp-temp", text: "0.30 g" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:rgb(${COL})` }), el("span", { text: "손 소독제" })),
      el("div", { class: "pill" }, el("span", { text: "전자저울 " }), massVal),
    ),
    el("div", { class: "stage-cap", text: "거름종이에 얇게 펴 발랐어요" }),
  );

  const fanBtn = el(
    "button",
    { class: "swapbtn", attrs: { type: "button" } },
    el("span", { text: "꾹 눌러 부채질하기" }),
  );
  const helper = el("div", {
    class: "helper",
    html: "가만히 두고 저울 숫자를 지켜보세요. <b>표면의 입자</b>가 하나씩 날아가요. 부채질하면 더 빨라져요!",
  });
  host.append(stage, fanBtn, helper);

  // ---- 상태 ----
  const liquid: LiquidP[] = [];
  const gas: GasP[] = [];
  let fanning = false;
  let escapeClock = 0;
  let finished = false;
  let lastMassShown = "";

  function seed(): void {
    liquid.length = 0;
    // 접시 위 3층 웅덩이 — 위층부터 증발한다
    const rows = [10, 9, 7];
    let i = 0;
    rows.forEach((n, r) => {
      for (let c = 0; c < n; c++) {
        liquid.push({ x: (c - (n - 1) / 2) * 16 + (r % 2 ? 5 : -3), y: -r * 11, jx: i * 1.7 });
        i++;
      }
    });
  }

  fanBtn.addEventListener("pointerdown", (e) => {
    fanning = true;
    fanBtn.classList.add("done-static");
    fanBtn.setPointerCapture(e.pointerId);
    haptic(HAPTIC.tap);
  });
  const stopFan = (): void => {
    fanning = false;
    fanBtn.classList.remove("done-static");
  };
  fanBtn.addEventListener("pointerup", stopFan);
  fanBtn.addEventListener("pointercancel", stopFan);

  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 250);
    const dishX = w / 2;
    const dishY = h - 64;

    // 전자저울(간단한 몸체 + 표시창)
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.strokeStyle = "rgba(148,176,214,.4)";
    ctx.lineWidth = 2;
    const swW = Math.min(w * 0.56, 220);
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void }).roundRect(
      dishX - swW / 2, dishY + 14, swW, 34, 10,
    );
    ctx.fill();
    ctx.stroke();
    // 접시(거름종이)
    ctx.strokeStyle = "rgba(200,220,244,.6)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(dishX, dishY + 8, swW * 0.42, 9, 0, 0, TAU);
    ctx.stroke();

    // ---- 증발: 맨 위층 입자만 탈출 ----
    escapeClock += dt * (fanning ? 4.2 : 1);
    const interval = 46; // dt 프레임 누적 기준(~0.8초에 1개, 부채질 시 ~0.19초)
    if (!finished && liquid.length > GOAL_LEFT && escapeClock >= interval) {
      escapeClock = 0;
      // 가장 위(y가 가장 작은) 입자 = 표면 입자
      let top = 0;
      for (let i = 1; i < liquid.length; i++) if (liquid[i].y < liquid[top].y) top = i;
      const p = liquid.splice(top, 1)[0];
      gas.push({
        x: dishX + p.x,
        y: dishY + p.y - 6,
        vx: (Math.random() - 0.5) * 0.7 + (fanning ? 0.9 : 0),
        vy: -0.9 - Math.random() * 0.7,
        life: 1,
      });
    }

    // ---- 그리기: 액체 웅덩이 ----
    for (const p of liquid) {
      const ox = Math.sin(tMs / 260 + p.jx) * 1.3;
      const px = dishX + p.x + ox;
      const py = dishY + p.y;
      const grad = ctx.createRadialGradient(px, py, 1, px, py, 11);
      grad.addColorStop(0, `rgba(${COL},.55)`);
      grad.addColorStop(1, `rgba(${COL},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgb(${COL})`;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.32)";
      ctx.beginPath();
      ctx.arc(px - 1.5, py - 1.7, 1.7, 0, TAU);
      ctx.fill();
    }

    // ---- 그리기: 날아가는 기체 입자 ----
    for (let i = gas.length - 1; i >= 0; i--) {
      const g = gas[i];
      g.x += g.vx * dt * (fanning ? 1.6 : 1);
      g.y += g.vy * dt;
      g.vx += (Math.random() - 0.5) * 0.16 * dt;
      g.life -= 0.006 * dt;
      if (g.life <= 0 || g.y < 8) {
        gas.splice(i, 1);
        continue;
      }
      const a = Math.max(0, g.life) * 0.8;
      ctx.strokeStyle = `rgba(${COL},${a * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(g.x - g.vx * 4, g.y - g.vy * 4);
      ctx.lineTo(g.x, g.y);
      ctx.stroke();
      ctx.fillStyle = `rgba(${COL},${a})`;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 4.2, 0, TAU);
      ctx.fill();
    }

    // ---- 바람 표시 ----
    if (fanning) {
      ctx.strokeStyle = "rgba(220,236,255,.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const yy = dishY - 40 - i * 26 + Math.sin(tMs / 120 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(24, yy);
        ctx.bezierCurveTo(w * 0.3, yy - 8, w * 0.6, yy + 6, w - 30, yy - 4);
        ctx.stroke();
      }
    }

    // ---- 저울 표시 ----
    const mass = (START_MASS * liquid.length) / START_N;
    const txt = `${mass.toFixed(2)} g`;
    if (txt !== lastMassShown) {
      lastMassShown = txt;
      massVal.textContent = txt;
      // 저울 표시창에도
    }
    ctx.fillStyle = "#DFF6F4";
    ctx.font = "700 15px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(txt, dishX, dishY + 37);

    if (!finished && liquid.length <= GOAL_LEFT) {
      finished = true;
      haptic(HAPTIC.ctaUnlock);
      helper.innerHTML =
        "저울 숫자가 줄었어요! 사라진 게 아니라 <b>표면의 입자가 기체가 되어 공기 중으로</b> 날아간 거예요. 이렇게 액체 표면에서 기체로 변하는 현상이 <b>증발</b>이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 250);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    fitCanvas(canvas, 250);
    seed();
    loop.start();
  });

  api.setCTA("입자가 날아가는 걸 지켜보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
