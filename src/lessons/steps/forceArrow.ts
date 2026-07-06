// forceArrow — 힘 화살표의 작용점·방향·크기를 드래그로 익히는 랩.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface ForceArrowStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface ArrowVec {
  dx: number;
  dy: number;
  n: number;
}

const TAU = Math.PI * 2;
const BALL_R = 22;
const MISSIONS = ["오른쪽으로 미는 힘", "같은 오른쪽, 하지만 두 배 세게", "왼쪽 위 대각선으로"] as const;

export const forceArrow: StepRenderer = (host, step, api) => {
  const s = step as unknown as ForceArrowStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock force-arrow-canvas",
    style: "height:260px",
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "공 위에서 힘 화살표 그리기. 엔터를 누르면 현재 미션을 자동으로 통과해요.",
    },
  });
  const nText = el("span", { text: "0" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F04452" }), el("span", { text: "작용점 · 방향 · 크기" })),
      el("div", { class: "tempread" }, nText, el("small", { text: " N" })),
    ),
    el("div", { class: "stage-cap", text: "공 위에서 시작해 힘 화살표를 그려요" }),
  );
  const missionEls = MISSIONS.map((m, i) => el("div", { class: "fa-mission", text: `${i + 1}. ${m}` }));
  const missions = el("div", { class: "fa-missions" }, ...missionEls);
  const helper = el("div", {
    class: "helper",
    attrs: { role: "status", "aria-live": "polite" },
    html: "미션 1: <b>오른쪽으로 미는 힘</b>을 그려 보세요. 공 위에서 시작해야 해요.",
  });
  host.append(stage, missions, helper);

  let wNow = 320;
  let hNow = 260;
  let dragging = false;
  let dx = 0;
  let dy = 0;
  let mission = 0;
  let lastN = 0;
  let finished = false;
  const ghosts: ArrowVec[] = [];

  function center(): { x: number; y: number } {
    return { x: wNow / 2, y: hNow * 0.55 };
  }

  function point(e: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(e.clientX - rect.left, 12, rect.width - 12),
      y: clamp(e.clientY - rect.top, 12, rect.height - 12),
    };
  }

  function updateReadout(): void {
    nText.textContent = String(Math.round(Math.hypot(dx, dy) * 0.5));
  }

  function evaluate(): void {
    const n = Math.hypot(dx, dy) * 0.5;
    // 실수 탭(아주 짧은 드래그)은 실패 피드백 없이 조용히 무시 — 오답 햅틱 남발 방지
    if (n < 3) {
      dx = 0;
      dy = 0;
      updateReadout();
      return;
    }
    const angle = normalizeAngle((Math.atan2(-dy, dx) * 180) / Math.PI);
    let ok = false;
    if (mission === 0) ok = angleDistance(angle, 0) <= 25 && n >= 10;
    else if (mission === 1) ok = angleDistance(angle, 0) <= 25 && n >= lastN * 1.8;
    else ok = angle >= 115 && angle <= 155 && n >= 10;

    if (!ok) {
      haptic(HAPTIC.cross);
      helper.innerHTML =
        mission === 1
          ? "방향은 오른쪽, 크기는 방금보다 <b>거의 두 배</b>가 되게 길게 그려 보세요."
          : "작용점은 공의 중심, 방향과 크기를 다시 맞춰 보세요.";
      return;
    }
    succeed({ dx, dy, n });
  }

  function succeed(vec: ArrowVec): void {
    ghosts.push(vec);
    while (ghosts.length > 3) ghosts.shift();
    missionEls[mission].classList.add("done");
    missionEls[mission].textContent = `${mission + 1}. ${MISSIONS[mission]} 완료`;
    haptic(HAPTIC.correct);
    lastN = vec.n;
    dx = 0;
    dy = 0;
    updateReadout();

    if (mission < MISSIONS.length - 1) {
      mission += 1;
      missionEls[mission].classList.add("on");
      helper.innerHTML =
        mission === 1
          ? "미션 2: 같은 오른쪽이지만 <b>두 배쯤 세게</b> 더 길게 그려 보세요."
          : "미션 3: 이번엔 <b>왼쪽 위 대각선</b>으로 그려 보세요.";
      return;
    }
    if (!finished) {
      finished = true;
      helper.innerHTML = "화살표 하나에 <b>작용점·방향·크기</b> 세 정보가 다 들어 있어요";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  const onDown = (e: PointerEvent): void => {
    if (finished) return;
    const c = center();
    const p = point(e);
    if (Math.hypot(p.x - c.x, p.y - c.y) > BALL_R + 12) {
      haptic(HAPTIC.cross);
      helper.innerHTML = "화살표는 힘이 작용하는 <b>공 위</b>에서 시작해요.";
      return;
    }
    dragging = true;
    dx = 0;
    dy = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
    updateReadout();
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const c = center();
    const p = point(e);
    dx = p.x - c.x;
    dy = p.y - c.y;
    updateReadout();
  };
  const onUp = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    canvas.classList.remove("dragging");
    evaluate();
  };
  const onCancel = (e: PointerEvent): void => {
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    dragging = false;
    dx = 0;
    dy = 0;
    canvas.classList.remove("dragging");
    updateReadout();
  };
  const onLeave = (e: PointerEvent): void => {
    if (dragging && !canvas.hasPointerCapture(e.pointerId)) onCancel(e);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (finished || e.key !== "Enter") return;
    e.preventDefault();
    const vec = fallbackArrow(mission, lastN);
    succeed(vec);
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("keydown", onKey);

  const loop: Loop = createLoop((_, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 260);
    wNow = w;
    hNow = h;
    drawScene(ctx, w, h, tMs, ghosts, dragging ? { dx, dy, n: Math.hypot(dx, dy) * 0.5 } : null);
  });
  const onResize = (): void => {
    const fitted = fitCanvas(canvas, 260);
    wNow = fitted.w;
    hNow = fitted.h;
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    missionEls[0].classList.add("on");
    loop.start();
  });

  api.setCTA("힘 화살표 미션 3개를 완료해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onCancel);
    canvas.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("keydown", onKey);
  };
};

function fallbackArrow(mission: number, lastN: number): ArrowVec {
  if (mission === 0) return { dx: 46, dy: 0, n: 23 };
  if (mission === 1) {
    const dx = Math.max(88, (lastN * 2.1) / 0.5);
    return { dx, dy: 0, n: dx * 0.5 };
  }
  const len = 62;
  const a = (135 * Math.PI) / 180;
  return { dx: Math.cos(a) * len, dy: -Math.sin(a) * len, n: len * 0.5 };
}

function normalizeAngle(a: number): number {
  return ((a % 360) + 360) % 360;
}

function angleDistance(a: number, b: number): number {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(d, 360 - d);
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tMs: number,
  ghosts: ArrowVec[],
  active: ArrowVec | null,
): void {
  const cx = w / 2;
  const cy = h * 0.55;
  drawGuide(ctx, w, h, cx, cy);
  for (const g of ghosts) drawArrow(ctx, cx, cy, g.dx, g.dy, 0.34);
  drawBall(ctx, cx, cy, BALL_R, tMs);
  if (active) drawArrow(ctx, cx, cy, active.dx, active.dy, 1);
}

function drawGuide(ctx: CanvasRenderingContext2D, w: number, h: number, cx: number, cy: number): void {
  const floorY = cy + BALL_R + 16;
  const g = ctx.createLinearGradient(0, floorY - 20, 0, h);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(110,140,184,.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, floorY - 20, w, h - floorY + 20);
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, BALL_R + 12, 0, TAU);
  ctx.stroke();
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tMs: number): void {
  contactShadow(ctx, x, y + r + 12, r * 2.2, 0.24);
  const wob = Math.sin(tMs / 500) * 0.8;
  const g = ctx.createRadialGradient(x - r * 0.34, y - r * 0.42 + wob, r * 0.2, x, y, r * 1.15);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(0.36, "#DCEAFF");
  g.addColorStop(1, "#6E9EDB");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y + wob, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(96,125,170,.72)";
  ctx.lineWidth = 1.7;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.34, y - r * 0.38 + wob, r * 0.22, r * 0.15, -0.5, 0, TAU);
  ctx.fill();
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, alpha: number): void {
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tipX = x + dx;
  const tipY = y + dy;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#F04452";
  ctx.fillStyle = "#F04452";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX - ux * 12, tipY - uy * 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ux * 17 + px * 8, tipY - uy * 17 + py * 8);
  ctx.lineTo(tipX - ux * 17 - px * 8, tipY - uy * 17 - py * 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
