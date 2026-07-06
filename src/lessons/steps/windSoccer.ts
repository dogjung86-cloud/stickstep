// windSoccer — 힘과 운동 랩(V 단원 L7). 교과서 해보기(178쪽: 홈통+탁구공+선풍기)의 위에서 본 확장판.
//   · 공이 왼쪽에서 오른쪽으로 굴러간다(위에서 본 운동장). 굴러가는 동안 바람 버튼을 꾹:
//     나란한 바람 → 속력이 변한다 · 수직 바람 → 방향이 변한다 · 비스듬한 바람 → 둘 다 변한다 (그림 V-16)
//   · 알짜힘이 0이 아니면 운동 상태가 변한다는 것을 손으로 확인.
// 목표: 세 종류 바람 효과를 각각 관찰.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawForceArrow } from "../../ui/forceProps";
import { windStrokeStyle } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface WindSoccerStep {
  title: string;
  lead?: string;
  cta?: string;
}

type WindId = "along" | "perp" | "diag";
const TAU = Math.PI * 2;
const WINDS: { id: WindId; name: string; fx: number; fy: number; effect: string }[] = [
  { id: "along", name: "나란한 바람 →", fx: 0.09, fy: 0, effect: "속력 변화" },
  { id: "perp", name: "수직 바람 ↓", fx: 0, fy: 0.09, effect: "방향 변화" },
  { id: "diag", name: "비스듬한 바람 ↘", fx: 0.064, fy: 0.064, effect: "둘 다 변화" },
];

export const windSoccer: StepRenderer = (host, step, api) => {
  const s = step as unknown as WindSoccerStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:236px" });
  const spdVal = el("span", { text: "0" });
  const statePill = el("span", { text: "공이 굴러갑니다 — 위에서 본 모습" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#4EA3F5" }), statePill),
      el("div", { class: "tempread" }, spdVal, el("small", { text: " 속력" })),
    ),
    toastEl,
  );

  const windBtns = new Map<WindId, HTMLButtonElement>();
  const controls = el(
    "div",
    { class: "ws-controls" },
    ...WINDS.map((wd) => {
      const b = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: wd.name }));
      windBtns.set(wd.id, b);
      return b;
    }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...WINDS.map((wd) =>
      el("div", { class: "pn-badge force", dataset: { g: wd.id } }, el("b", { text: wd.effect }), el("span", { text: wd.name.slice(-1) === "→" ? "나란히" : wd.name.includes("수직") ? "수직" : "비스듬히" })),
    ),
  );
  const helper = el("div", {
    class: "helper",
    html: "공이 굴러가는 동안 <b>바람 버튼을 꾹</b> 눌러 보세요. 운동 방향과 <b>나란한</b> 바람부터!",
  });
  host.append(goalChips, stage, controls, helper);

  // ---- 상태 ----
  let W = 340;
  let H = 236;
  const ball = { x: -20, y: 0, vx: 1.5, vy: 0, r: 13 };
  let activeWind: WindId | null = null;
  let windHeldMs = 0;
  let entrySpeed = 1.5;
  let entryAngle = 0;
  const trail: { x: number; y: number; t: number }[] = [];
  const goals = new Set<WindId>();
  let finished = false;
  let toastTimer = 0;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  function resetBall(): void {
    ball.x = -20;
    ball.y = H * 0.42;
    ball.vx = 1.5;
    ball.vy = 0;
    trail.length = 0;
    windHeldMs = 0;
    entrySpeed = 1.5;
    entryAngle = 0;
  }

  function collect(id: WindId): void {
    if (goals.has(id)) return;
    goals.add(id);
    (goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    const wd = WINDS.find((x) => x.id === id)!;
    toast(`${wd.effect}를 확인했어요!`);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "삼종 완성! 알짜힘이 0이 아니면 물체의 운동은 반드시 변해요 — 나란하면 <b>속력</b>, 수직이면 <b>방향</b>, 비스듬하면 <b>둘 다</b>. 반대로 힘이 없으면? 계속 그대로 굴러가죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    } else if (!finished) {
      const next = WINDS.find((x) => !goals.has(x.id));
      if (next) helper.innerHTML = `좋아요! 다음은 <b>${next.name}</b> 버튼을 꾹 눌러 보세요.`;
    }
  }

  // 홀드 입력
  windBtns.forEach((b, id) => {
    b.addEventListener("pointerdown", (e) => {
      activeWind = id;
      windHeldMs = 0;
      entrySpeed = Math.hypot(ball.vx, ball.vy);
      entryAngle = Math.atan2(ball.vy, ball.vx);
      b.classList.add("done-static");
      b.setPointerCapture(e.pointerId);
      haptic(HAPTIC.tap);
    });
    const up = (): void => {
      if (activeWind === id) activeWind = null;
      b.classList.remove("done-static");
    };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
  });

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 236);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    if (ball.y === 0) resetBall();

    // 물리 — 바람이 불면 가속(알짜힘), 아니면 등속(잔디 마찰은 무시한 이상화)
    const wd = activeWind ? WINDS.find((x) => x.id === activeWind)! : null;
    if (wd && ball.x > 20 && ball.x < W - 20) {
      ball.vx += wd.fx * dt;
      ball.vy += wd.fy * dt;
      windHeldMs += dt * 16.7;
      // 효과 판정
      const spd = Math.hypot(ball.vx, ball.vy);
      const ang = Math.atan2(ball.vy, ball.vx);
      const dSpd = Math.abs(spd - entrySpeed) / entrySpeed;
      const dAng = Math.abs(ang - entryAngle);
      if (windHeldMs > 420) {
        if (wd.id === "along" && dSpd > 0.25) collect("along");
        else if (wd.id === "perp" && dAng > 0.2) collect("perp");
        else if (wd.id === "diag" && dSpd > 0.18 && dAng > 0.15) collect("diag");
      }
    }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    trail.push({ x: ball.x, y: ball.y, t: tMs });
    while (trail.length > 60) trail.shift();
    if (ball.x > W + 24 || ball.y > H + 24 || ball.y < -24) resetBall();

    // HUD
    spdVal.textContent = Math.hypot(ball.vx, ball.vy).toFixed(1);
    statePill.textContent = wd ? `${wd.name} 부는 중 — ${wd.effect}?` : "공이 굴러갑니다 — 위에서 본 모습";

    // ---- 그리기: 잔디 운동장(위에서 본) ----
    const turf = ctx.createLinearGradient(0, 0, 0, H);
    turf.addColorStop(0, "rgba(46,120,80,.16)");
    turf.addColorStop(1, "rgba(46,120,80,.05)");
    ctx.fillStyle = turf;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 1.4;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo((W / 5) * i, 8);
      ctx.lineTo((W / 5) * i, H - 8);
      ctx.stroke();
    }
    // 원래 경로 안내(점선, 수평)
    ctx.setLineDash([4, 7]);
    ctx.strokeStyle = "rgba(216,232,252,.25)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.42);
    ctx.lineTo(W, H * 0.42);
    ctx.stroke();
    ctx.setLineDash([]);

    // 바람 스트릭
    if (wd) {
      ctx.strokeStyle = windStrokeStyle(ctx, 0, W, "190,220,250", 0.45);
      ctx.lineWidth = 2;
      const ang = Math.atan2(wd.fy, wd.fx);
      for (let i = 0; i < 5; i++) {
        const off = (tMs / 4 + i * 90) % (W + 160) - 80;
        const sy = 26 + i * ((H - 52) / 5);
        ctx.save();
        ctx.translate(off, sy);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(-26, 0);
        ctx.lineTo(26, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(19, -4);
        ctx.lineTo(27, 0);
        ctx.lineTo(19, 4);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 궤적 — 속력이 빠를수록 점 간격이 벌어진다(속력의 시각화)
    ctx.fillStyle = "rgba(150,196,248,.5)";
    for (let i = 0; i < trail.length; i += 4) {
      const p = trail[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, TAU);
      ctx.fill();
    }

    // 공(위에서 본 축구공)
    const bg = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, ball.r * 1.2);
    bg.addColorStop(0, "#FFFFFF");
    bg.addColorStop(0.5, "#E8F0FA");
    bg.addColorStop(1, "#9AB2CE");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(70,96,130,.7)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "rgba(40,58,86,.8)";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r * 0.34, 0, TAU);
    ctx.fill();

    // 힘(바람) 화살표 — 공 작용점에서
    if (wd && ball.x > 0 && ball.x < W) {
      const mag = 34;
      const len = Math.hypot(wd.fx, wd.fy);
      drawForceArrow(ctx, ball.x, ball.y, (wd.fx / len) * mag, (wd.fy / len) * mag, { color: "#F25757", width: 4 });
    }
    // 운동 방향 화살표(초록, 가늘게)
    const spd = Math.hypot(ball.vx, ball.vy);
    if (spd > 0.2) {
      drawForceArrow(ctx, ball.x, ball.y, (ball.vx / spd) * 26, (ball.vy / spd) * 26, { color: "#37C08E", width: 2.6, alpha: 0.85 });
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 236);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    resetBall();
    loop.start();
  });

  api.setCTA("세 가지 바람 효과를 관찰하세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
