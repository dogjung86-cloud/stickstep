// forceStudio — 힘의 표현 랩(V 단원 L1). 그린 화살표가 그대로 힘이 된다.
//   · 공 모드: 공에서 드래그해 힘 화살표를 그리면(작용점·방향·크기) 놓는 순간 그 힘대로 공이 날아간다
//     — 화살표가 길수록(크기↑) 빠르고 멀리, 방향대로. "운동 상태 변화"를 몸으로 확인
//   · 찰흙 모드: 찰흙을 꾹꾹 누르면 눌린 자리가 실제로 움푹 — "모양 변화"
// 목표: ① 살살 굴리기(15N 이하) ② 세게 차기(25N 이상) ③ 찰흙 모양 바꾸기(3번 누르기).

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawForceArrow, drawGround } from "../../ui/forceProps";
import { contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface ForceStudioStep {
  title: string;
  lead?: string;
  cta?: string;
}

const TAU = Math.PI * 2;
const N_PER_PX = 0.5;

export const forceStudio: StepRenderer = (host, step, api) => {
  const s = step as unknown as ForceStudioStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock spring-canvas", style: "height:250px" });
  const nVal = el("span", { text: "0" });
  const modePill = el("span", { text: "작용점에서 드래그 — 방향과 크기" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F25757" }), modePill),
      el("div", { class: "tempread" }, nVal, el("small", { text: " N" })),
    ),
    toastEl,
  );

  const seg = el("div", { class: "seg" });
  const ballBtn = el("button", { class: "on", text: "공 밀기", attrs: { type: "button", "aria-pressed": "true" } });
  const clayBtn = el("button", { text: "찰흙 누르기", attrs: { type: "button", "aria-pressed": "false" } });
  seg.append(ballBtn, clayBtn);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge force", dataset: { g: "soft" } }, el("b", { text: "살살 굴리기" }), el("span", { text: "15 N 이하" })),
    el("div", { class: "pn-badge force", dataset: { g: "hard" } }, el("b", { text: "세게 차기" }), el("span", { text: "25 N 이상" })),
    el("div", { class: "pn-badge force", dataset: { g: "clay" } }, el("b", { text: "모양 바꾸기" }), el("span", { text: "찰흙 3번" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "공 위에서 드래그해 <b>힘 화살표</b>를 그려 보세요. 놓는 순간, 그 힘이 진짜로 작용해요!",
  });
  host.append(goalChips, helper, stage, seg); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let W = 340;
  let H = 250;
  let mode: "ball" | "clay" = "ball";
  // 공
  const ball = { x: 90, y: 0, vx: 0, vy: 0, r: 16, flying: false };
  let aiming = false;
  let aimDx = 0;
  let aimDy = 0;
  // 찰흙(8방향 반지름 변형)
  const clayR = 44;
  const dents: number[] = new Array(12).fill(0);
  let dentCount = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  const groundY = (): number => H * 0.8;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  function collect(id: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    (goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리하면 — 힘은 물체의 <b>운동 상태</b>(살살=천천히, 세게=빠르게, 방향대로)와 <b>모양</b>(찰흙 움푹)을 바꿔요. 그리고 그 힘은 화살표 하나로: <b>작용점에서, 방향으로, 크기만큼</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setMode(m: "ball" | "clay"): void {
    if (mode === m) return;
    mode = m;
    ballBtn.classList.toggle("on", m === "ball");
    clayBtn.classList.toggle("on", m === "clay");
    ballBtn.setAttribute("aria-pressed", String(m === "ball"));
    clayBtn.setAttribute("aria-pressed", String(m === "clay"));
    haptic(HAPTIC.tap);
    if (!finished) {
      helper.innerHTML =
        m === "ball"
          ? "공 위에서 드래그해 <b>힘 화살표</b>를 그려 보세요. 길수록 큰 힘!"
          : "찰흙을 <b>꾹꾹 눌러</b> 보세요. 힘이 모양을 바꿔요.";
    }
    modePill.textContent = m === "ball" ? "작용점에서 드래그 — 방향과 크기" : "누르는 곳이 움푹 — 모양 변화";
  }
  ballBtn.addEventListener("click", () => setMode("ball"));
  clayBtn.addEventListener("click", () => setMode("clay"));

  // ---- 입력 ----
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (mode === "ball") {
      if (ball.flying || Math.hypot(px - ball.x, py - ball.y) > ball.r + 20) return;
      aiming = true;
      aimDx = 0;
      aimDy = 0;
      canvas.setPointerCapture(e.pointerId);
      haptic(HAPTIC.tap);
    } else {
      // 찰흙: 클릭 지점 방향의 반지름을 움푹
      const cx = W * 0.5;
      const cy = groundY() - clayR + 6;
      const d = Math.hypot(px - cx, py - cy);
      if (d > clayR + 18) return;
      const ang = Math.atan2(py - cy, px - cx);
      const idx = ((Math.round((ang / TAU) * 12) % 12) + 12) % 12;
      dents[idx] = Math.min(clayR * 0.42, dents[idx] + 9);
      dents[(idx + 1) % 12] = Math.min(clayR * 0.3, dents[(idx + 1) % 12] + 4.5);
      dents[(idx + 11) % 12] = Math.min(clayR * 0.3, dents[(idx + 11) % 12] + 4.5);
      dentCount++;
      haptic(HAPTIC.select);
      if (dentCount >= 3) collect("clay", "모양이 변했어요 — 힘의 효과!");
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (!aiming) return;
    const r = canvas.getBoundingClientRect();
    aimDx = e.clientX - r.left - ball.x;
    aimDy = e.clientY - r.top - ball.y;
    const n = Math.hypot(aimDx, aimDy) * N_PER_PX;
    nVal.textContent = String(Math.round(n));
  };
  const onUp = (): void => {
    if (!aiming) return;
    aiming = false;
    const n = Math.hypot(aimDx, aimDy) * N_PER_PX;
    if (n < 2) {
      aimDx = 0;
      aimDy = 0;
      return;
    }
    // 발사! 힘 방향·크기 그대로 속도로
    ball.vx = aimDx * 0.055;
    ball.vy = aimDy * 0.055;
    ball.flying = true;
    haptic(HAPTIC.correct);
    if (n <= 15) collect("soft", "살살 — 천천히 굴러가요");
    else if (n >= 25) collect("hard", "세게 — 빠르게 날아가요!");
    aimDx = 0;
    aimDy = 0;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ---- 프레임 ----
  const trail: { x: number; y: number }[] = [];
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 250);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const gY = groundY();
    if (ball.y === 0) ball.y = gY - ball.r;

    // 공 물리
    if (ball.flying) {
      ball.vy += 0.22 * dt; // 중력
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y > gY - ball.r) {
        ball.y = gY - ball.r;
        ball.vy = -Math.abs(ball.vy) * 0.36;
        if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
      }
      if (ball.y === gY - ball.r || ball.vy === 0) ball.vx *= Math.pow(0.985, dt);
      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 26) trail.shift();
      // 정지·이탈 → 제자리로
      const stopped = Math.abs(ball.vx) < 0.06 && ball.vy === 0;
      const out = ball.x < -30 || ball.x > W + 30;
      if (stopped || out) {
        ball.flying = false;
        ball.vx = 0;
        ball.vy = 0;
        if (out) {
          ball.x = 90;
          ball.y = gY - ball.r;
        }
        trail.length = 0;
      }
    }

    // ---- 그리기 ----
    drawGround(ctx, W, gY, H);

    if (mode === "ball") {
      // 궤적
      if (trail.length > 1) {
        ctx.strokeStyle = "rgba(120,170,240,.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (const t of trail) ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
      // 공
      contactShadow(ctx, ball.x, gY + 5, ball.r * 2.1, 0.24);
      const bg = ctx.createRadialGradient(ball.x - 5, ball.y - 6, 2, ball.x, ball.y, ball.r * 1.15);
      bg.addColorStop(0, "#FFFFFF");
      bg.addColorStop(0.4, "#DCEAFF");
      bg.addColorStop(1, "#6E9EDB");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(96,125,170,.7)";
      ctx.lineWidth = 1.7;
      ctx.stroke();
      // 오각형 패치(축구공 느낌 살짝)
      ctx.fillStyle = "rgba(70,96,138,.5)";
      ctx.beginPath();
      ctx.arc(ball.x + ball.r * 0.28, ball.y - ball.r * 0.1, ball.r * 0.3, 0, TAU);
      ctx.fill();
      // 조준 화살표(작용점 = 공 위 드래그 시작점)
      if (aiming && Math.hypot(aimDx, aimDy) > 4) {
        drawForceArrow(ctx, ball.x, ball.y, aimDx, aimDy, { color: "#F25757", width: 4.4 });
        const n = Math.hypot(aimDx, aimDy) * N_PER_PX;
        ctx.font = "700 12px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFD1CC";
        ctx.fillText(`${Math.round(n)} N`, ball.x + aimDx * 0.5, ball.y + aimDy * 0.5 - 12);
      } else if (!ball.flying && !finished) {
        const pulse = ball.r + 8 + Math.sin(tMs / 300) * 3;
        ctx.strokeStyle = "rgba(255,194,77,.35)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, pulse, 0, TAU);
        ctx.stroke();
      }
    } else {
      // 찰흙 덩어리(변형 반영 블롭)
      const cx = W * 0.5;
      const cy = gY - clayR + 6;
      contactShadow(ctx, cx, gY + 4, clayR * 1.5, 0.26);
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const idx = i % 12;
        const ang = (idx / 12) * TAU;
        const rr = clayR - dents[idx];
        const px = cx + Math.cos(ang) * rr;
        const py = cy + Math.sin(ang) * rr * 0.92;
        if (i === 0) ctx.moveTo(px, py);
        else {
          const prev = (idx + 11) % 12;
          const pAng = (prev / 12) * TAU;
          const pr = clayR - dents[prev];
          const mx = cx + Math.cos((pAng + ang) / 2) * ((pr + rr) / 2) * 1.04;
          const my = cy + Math.sin((pAng + ang) / 2) * ((pr + rr) / 2) * 0.96;
          ctx.quadraticCurveTo(mx, my, px, py);
        }
      }
      ctx.closePath();
      const cg = ctx.createRadialGradient(cx - clayR * 0.3, cy - clayR * 0.4, 4, cx, cy, clayR * 1.2);
      cg.addColorStop(0, "#B9946E");
      cg.addColorStop(0.55, "#96714C");
      cg.addColorStop(1, "#6E4F32");
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = "rgba(58,40,22,.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,236,210,.25)";
      ctx.beginPath();
      ctx.ellipse(cx - clayR * 0.3, cy - clayR * 0.42, clayR * 0.3, clayR * 0.16, -0.6, 0, TAU);
      ctx.fill();
      if (!goals.has("clay") && !finished) {
        const pulse = clayR + 10 + Math.sin(tMs / 300) * 3;
        ctx.strokeStyle = "rgba(255,194,77,.3)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, TAU);
        ctx.stroke();
      }
    }

    if (!aiming) nVal.textContent = "0";
  });

  const onResize = (): void => {
    fitCanvas(canvas, 250);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("세 가지 목표를 달성해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
