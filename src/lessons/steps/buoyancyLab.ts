// buoyancyLab — 부력 랩(V 단원 L6). 교과서 탐구(172쪽) V-14의 조작판.
//   · 용수철저울에 매단 추를 드래그로 물에 담근다 — 잠긴 만큼 저울 눈금이 15 N → 9 N
//   · 눈금이 줄어든 만큼이 부력(최대 6 N). 부력 화살표(빨강↑)가 잠긴 부피와 함께 자란다
//   · 완전히 잠긴 뒤에는 더 깊이 넣어도 9 N 그대로 — 부력은 "잠긴 부피"가 결정 (깊이 아님)
// 목표: ① 절반 잠그기(12 N) ② 완전히 잠그기(9 N) ③ 더 깊이 눌러 보기(그대로 9 N).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawSpring, drawForceArrow } from "../../ui/forceProps";
import { glassVessel, contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface BuoyancyStep {
  title: string;
  lead?: string;
  cta?: string;
}

const W_AIR = 15; // 공기 중 무게(N)
const BUOY_MAX = 6; // 완전 잠김 부력(N)

export const buoyancyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BuoyancyStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: "height:284px",
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "추를 물에 담그기. 위아래 화살표 키로도 조절해요.",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": "0",
    },
  });
  const readVal = el("span", { text: W_AIR.toFixed(1) });
  const buoyPill = el("span", { text: "부력 0.0 N" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F25757" }), buoyPill),
      el("div", { class: "tempread" }, readVal, el("small", { text: " N" })),
    ),
    toastEl,
    el("div", { class: "stage-cap", text: "추를 잡고 아래로 끌어 물에 담가 보세요" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge force", dataset: { g: "half" } }, el("b", { text: "절반 잠금" }), el("span", { text: "몇 N?" })),
    el("div", { class: "pn-badge force", dataset: { g: "full" } }, el("b", { text: "완전 잠금" }), el("span", { text: "몇 N?" })),
    el("div", { class: "pn-badge force", dataset: { g: "deep" } }, el("b", { text: "더 깊이" }), el("span", { text: "변할까?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "공기 중에서 추의 무게는 <b>15 N</b>. 추를 천천히 물에 담그면서 저울 눈금을 지켜보세요.",
  });
  host.append(goalChips, stage, helper);

  // ---- 상태 ----
  let W = 340;
  let H = 284;
  let dragging = false;
  let dip = 0; // 0(공기) ~ 1(완전 잠김) ~ 1.6(더 깊이)
  let reading = W_AIR;
  let wave = 0; // 수면 출렁임 진폭
  let prevFrac = 0;
  let halfMs = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  const topY = (): number => 26; // 스탠드 바
  const surfaceY = (): number => H * 0.56;
  const weightH = (): number => 46;
  const weightW = (): number => 44;
  const cx = (): number => W * 0.5;

  function frac(): number {
    return clamp(dip, 0, 1);
  }
  function targetReading(): number {
    return W_AIR - BUOY_MAX * frac();
  }
  // 추 상단 y — dip 0일 때 수면 위 여유, dip 1일 때 꼭대기가 수면
  function weightTopY(): number {
    const dry = surfaceY() - weightH() - 26;
    return dry + dip * (weightH() + 26 + 14);
  }

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
        "발견 완료! 저울 눈금이 <b>줄어든 만큼이 부력</b>이에요 (15 − 9 = 6 N). 부력은 <b>물에 잠긴 부피</b>가 클수록 커지고, 완전히 잠긴 뒤엔 더 깊어져도 <b>그대로</b>였죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 입력 ----
  const grabR = 46;
  function pointerToDip(py: number): void {
    const dry = surfaceY() - weightH() - 26;
    const raw = (py - weightH() / 2 - dry) / (weightH() + 40);
    dip = clamp(raw, 0, 1.6);
    canvas.setAttribute("aria-valuenow", String(Math.round(frac() * 100)));
  }
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const wy = weightTopY() + weightH() / 2;
    if (Math.hypot(px - cx(), py - wy) > grabR) return;
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    pointerToDip(e.clientY - r.top);
  };
  const onUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowDown") dip = clamp(dip + 0.12, 0, 1.6);
    else if (e.key === "ArrowUp") dip = clamp(dip - 0.12, 0, 1.6);
    else return;
    e.preventDefault();
    canvas.setAttribute("aria-valuenow", String(Math.round(frac() * 100)));
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 프레임 ----
  let shown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 284);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const sx = cx();
    const wsY = surfaceY();
    const wTop = weightTopY();
    const wW = weightW();
    const wH = weightH();

    // 읽기값은 목표로 부드럽게 수렴(저울 바늘 관성)
    reading += (targetReading() - reading) * Math.min(1, 0.14 * dt);

    // 잠김 변화 → 수면 출렁임
    const f = frac();
    if (Math.abs(f - prevFrac) > 0.004) wave = Math.min(1, wave + Math.abs(f - prevFrac) * 6);
    prevFrac = f;
    wave *= Math.pow(0.965, dt);

    // 목표 판정
    if (f > 0.42 && f < 0.62) {
      halfMs += dt * 16.7;
      if (halfMs > 500) collect("half", "12 N!", "절반 잠김 — 저울이 12 N");
    } else halfMs = 0;
    if (f >= 0.99 && dip < 1.1) collect("full", "9 N!", "완전 잠김 — 부력이 6 N");
    if (goals.has("full") && dip > 1.35) collect("deep", "그대로 9 N", "더 깊어도 9 N — 잠긴 부피가 같으니까!");

    // ---- 그리기 ----
    // 스탠드
    ctx.strokeStyle = "rgba(196,212,236,.65)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx - 84, topY());
    ctx.lineTo(sx + 84, topY());
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx + 84, topY());
    ctx.lineTo(sx + 84, topY() + 26);
    ctx.stroke();

    // 수조(유리) + 물
    const tankW = Math.min(W * 0.6, 240);
    const tankL = sx - tankW / 2;
    const tankR = sx + tankW / 2;
    const tankBot = H - 16;
    contactShadow(ctx, sx, tankBot + 6, tankW * 0.6, 0.26);
    glassVessel(ctx, { x0: tankL, y0: wsY - 26, x1: tankR, y1: tankBot });
    // 물(출렁이는 수면)
    const waveY = (px: number): number => wsY + Math.sin(px / 26 + tMs / 160) * wave * 3.4;
    ctx.beginPath();
    ctx.moveTo(tankL + 3, waveY(tankL));
    for (let px = tankL + 8; px <= tankR - 3; px += 8) ctx.lineTo(px, waveY(px));
    ctx.lineTo(tankR - 3, tankBot - 3);
    ctx.lineTo(tankL + 3, tankBot - 3);
    ctx.closePath();
    const waterG = ctx.createLinearGradient(0, wsY, 0, tankBot);
    waterG.addColorStop(0, "rgba(92,152,235,.20)");
    waterG.addColorStop(1, "rgba(92,152,235,.07)");
    ctx.fillStyle = waterG;
    ctx.fill();
    ctx.strokeStyle = "rgba(226,242,255,.5)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(tankL + 3, waveY(tankL));
    for (let px = tankL + 8; px <= tankR - 3; px += 8) ctx.lineTo(px, waveY(px));
    ctx.stroke();

    // 용수철저울: 스탠드→스프링(눈금과 함께 줄어듦)→추
    const springTop = topY() + 4;
    const springLen = 34 + (reading / W_AIR) * 52; // 읽기값에 비례해 늘어남
    drawSpring(ctx, sx, springTop, sx, springTop + springLen, { coils: 8, radius: 9 });
    // 연결줄
    ctx.strokeStyle = "rgba(216,232,252,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, springTop + springLen);
    ctx.lineTo(sx, wTop);
    ctx.stroke();

    // 추(황동 원기둥)
    const wg = ctx.createLinearGradient(sx - wW / 2, 0, sx + wW / 2, 0);
    wg.addColorStop(0, "#8C6B2E");
    wg.addColorStop(0.3, "#E8C06A");
    wg.addColorStop(0.55, "#C89A44");
    wg.addColorStop(1, "#7E5E26");
    ctx.fillStyle = wg;
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void }).roundRect(
      sx - wW / 2, wTop, wW, wH, 7,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(64,46,12,.7)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // 고리
    ctx.strokeStyle = "#D8C08A";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(sx, wTop - 5, 5, 0, Math.PI * 2);
    ctx.stroke();
    // 잡기 유도 링
    if (!dragging && !finished) {
      const pulse = 30 + Math.sin(tMs / 300) * 4;
      ctx.strokeStyle = "rgba(255,194,77,.35)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(sx, wTop + wH / 2, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 힘 화살표: 부력(빨강↑) · 중력(파랑↓) — 교과서 V-12 색
    const buoyN = W_AIR - reading;
    if (buoyN > 0.4) {
      drawForceArrow(ctx, sx - wW / 2 - 16, wTop + wH * 0.6, 0, -buoyN * 9, { color: "#F25757", width: 4 });
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "#F5A0A0";
      ctx.fillText(`부력 ${buoyN.toFixed(1)} N`, sx - wW / 2 - 24, wTop + wH * 0.6 - buoyN * 9 - 6);
    }
    drawForceArrow(ctx, sx + wW / 2 + 16, wTop + wH * 0.4, 0, 34, { color: "#4EA3F5", width: 4 });
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#9CC8F5";
    ctx.fillText("중력", sx + wW / 2 + 24, wTop + wH * 0.4 + 46);

    // HUD 갱신
    const txt = reading.toFixed(1);
    if (txt !== shown) {
      shown = txt;
      readVal.textContent = txt;
      buoyPill.textContent = `부력 ${(W_AIR - reading).toFixed(1)} N = 15 − ${txt}`;
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 284);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("절반 → 완전 → 더 깊이, 차례로!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
  };
};
