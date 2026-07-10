// buoyancyLab — 부력 랩(V 단원 L6). 교과서 탐구(부력 170~173쪽)의 조작판 — 수치는 자체 제작.
//   · 용수철저울은 스탠드에 고정, 사용자는 "수조"를 실험실 잭처럼 들어 올려 추를 물에 잠근다
//   · 추의 높이는 눈금(용수철 길이)에서 유도 — 부력이 생기면 용수철이 짧아지며 추가 살짝 떠오른다
//   · 부력은 기하로 계산: 추 밑면이 수면에 닿기 전엔 정확히 0, 잠긴 깊이/추 높이 = 잠긴 비율
//   · 하단 실시간 그래프: 잠긴 부피(→ 더 깊이 구간)에 따른 저울 눈금 — 완전 잠김 뒤 평평함이 보인다
// 목표: ① 절반 잠그기(17 N) ② 완전히 잠그기(14 N) ③ 더 깊이 눌러 보기(그대로 14 N).

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

const W_AIR = 20; // 공기 중 무게(N) — 자체 제작 수치
const BUOY_MAX = 6; // 완전 잠김 부력(N)
const CVH = 396; // 캔버스 전체 높이
const LABH = 292; // 위쪽 실험 영역 높이(아래는 그래프)
const MAX_RISE = 122; // 수조 최대 상승량(px)

export const buoyancyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BuoyancyStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "수조를 들어 올려 추를 물에 담그기. 위아래 화살표 키로도 조절해요.",
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
  );
  const capEl = el("div", { class: "stage-cap", text: "수조를 잡고 천천히 들어 올려 보세요" });
  stage.appendChild(capEl);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge force", dataset: { g: "half" } }, el("b", { text: "절반 잠금" }), el("span", { text: "몇 N?" })),
    el("div", { class: "pn-badge force", dataset: { g: "full" } }, el("b", { text: "완전 잠금" }), el("span", { text: "몇 N?" })),
    el("div", { class: "pn-badge force", dataset: { g: "deep" } }, el("b", { text: "더 깊이" }), el("span", { text: "변할까?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "공기 중에서 추의 무게는 <b>20 N</b>. 수조를 올려 추를 담그면서 <b>저울 눈금과 용수철</b>을 지켜보세요.",
  });
  host.append(goalChips, helper, stage); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let W = 340;
  let H = CVH;
  let dragging = false;
  let dragStartY = 0;
  let dragStartRise = 0;
  let rise = 0; // 수조 상승량(px) 0..MAX_RISE
  let reading = W_AIR; // 저울 눈금(N) — 목표로 수렴
  let wave = 0;
  let prevFrac = 0;
  let halfMs = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  const samples: { x: number; y: number }[] = []; // 그래프 산점(방문한 상태)

  const cx = (): number => W * 0.5;
  const springTop = 32;
  const wW = 44; // 추 폭
  const wH = 46; // 추 높이
  // 용수철 길이 = 눈금에 비례(부력이 받쳐 주면 짧아진다)
  const springLen = (r: number): number => 26 + (r / W_AIR) * 66;
  const weightTopY = (r: number): number => springTop + springLen(r) + 10; // 고리+연결 여유
  // 수조 기하(rise만큼 위로)
  const tankH = 100;
  const waterDepth = 86;
  const tankBotY = (): number => LABH - 8 - rise;
  const surfaceY = (): number => tankBotY() - waterDepth;

  // 기하 기반 잠김 — 밑면이 수면에 닿기 전엔 정확히 0
  function submergedFrac(): number {
    const bottom = weightTopY(reading) + wH;
    return clamp((bottom - surfaceY()) / wH, 0, 1);
  }
  function deepPx(): number {
    // 완전 잠김 이후 수면이 추 꼭대기 위로 더 올라간 깊이
    return clamp(surfaceY() < weightTopY(reading) ? weightTopY(reading) - surfaceY() : 0, 0, 30);
  }
  function targetReading(): number {
    return W_AIR - BUOY_MAX * submergedFrac();
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
        "발견 완료! 저울 눈금이 <b>줄어든 만큼이 부력</b>이에요 (20 − 14 = 6 N). 그래프처럼 부력은 <b>물에 잠긴 부피</b>를 따라 커지다가, 완전히 잠긴 뒤엔 더 깊어져도 <b>평평 — 그대로</b>였죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 입력: 수조(아래쪽 절반 어디든) 잡고 위아래 ----
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const py = e.clientY - r.top;
    if (py < 96 || py > LABH + 30) return; // 스탠드 위쪽·그래프 영역은 제외
    dragging = true;
    dragStartY = py;
    dragStartRise = rise;
    capEl.style.transition = "opacity .4s";
    capEl.style.opacity = "0"; // 그래프 x축 라벨과 겹치지 않게 안내문 퇴장
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    const py = e.clientY - r.top;
    rise = clamp(dragStartRise + (dragStartY - py), 0, MAX_RISE);
    canvas.setAttribute("aria-valuenow", String(Math.round((rise / MAX_RISE) * 100)));
  };
  const onUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowUp") rise = clamp(rise + 14, 0, MAX_RISE);
    else if (e.key === "ArrowDown") rise = clamp(rise - 14, 0, MAX_RISE);
    else return;
    e.preventDefault();
    canvas.setAttribute("aria-valuenow", String(Math.round((rise / MAX_RISE) * 100)));
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 그래프 ----
  const DEEP_MAX = 26; // 그래프 x축에서 '더 깊이' 구간이 나타내는 px 깊이
  function graphX01(): number {
    // 0..0.72 = 잠긴 부피 0→100%, 0.72..1 = 더 깊이(수면이 추 위로)
    return submergedFrac() * 0.72 + (clamp(deepPx(), 0, DEEP_MAX) / DEEP_MAX) * 0.26;
  }
  function drawGraph(ctx: CanvasRenderingContext2D, tMs: number): void {
    const gx0 = 46;
    const gx1 = W - 18;
    const gy0 = LABH + 14;
    const gy1 = H - 24;
    const xOf = (x01: number): number => gx0 + x01 * (gx1 - gx0);
    const yOf = (n: number): number => gy1 - ((n - 13) / (21 - 13)) * (gy1 - gy0);

    // 축
    ctx.strokeStyle = "rgba(148,168,196,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 4);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    // 눈금선 20/17/14
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.textAlign = "right";
    for (const n of [20, 17, 14]) {
      ctx.strokeStyle = "rgba(148,168,196,.16)";
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(n));
      ctx.lineTo(gx1, yOf(n));
      ctx.stroke();
      ctx.fillStyle = "rgba(196,212,232,.75)";
      ctx.fillText(String(n), gx0 - 6, yOf(n) + 3.5);
    }
    // '완전 잠김' 경계선 + 구간 라벨
    const xFull = xOf(0.72);
    ctx.strokeStyle = "rgba(255,194,77,.35)";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(xFull, gy0 - 2);
    ctx.lineTo(xFull, gy1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(196,212,232,.65)";
    ctx.fillText("잠긴 부피 →", (gx0 + xFull) / 2, gy1 + 13);
    ctx.fillStyle = "rgba(255,214,138,.8)";
    ctx.fillText("더 깊이", (xFull + gx1) / 2, gy1 + 13);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(196,212,232,.75)";
    ctx.fillText("저울 눈금(N)", gx0 + 4, gy0 - 6);

    // 방문한 상태 산점 — 실험으로 그려지는 그래프
    ctx.fillStyle = "rgba(120,190,255,.5)";
    for (const p of samples) {
      ctx.beginPath();
      ctx.arc(xOf(p.x), yOf(p.y), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // 현재 점(발광)
    const cxg = xOf(graphX01());
    const cyg = yOf(reading);
    const pulse = 4.4 + Math.sin(tMs / 260) * 1;
    ctx.fillStyle = "rgba(120,190,255,.25)";
    ctx.beginPath();
    ctx.arc(cxg, cyg, pulse + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9CD2FF";
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
    const sx = cx();

    // 눈금은 기하 목표로 부드럽게 수렴(저울 바늘 관성) → 추 높이도 함께 유도됨
    reading += (targetReading() - reading) * Math.min(1, 0.16 * dt);

    const f = submergedFrac();
    if (Math.abs(f - prevFrac) > 0.004) wave = Math.min(1, wave + Math.abs(f - prevFrac) * 6);
    prevFrac = f;
    wave *= Math.pow(0.965, dt);

    // 그래프 샘플 — 저울 관성이 가라앉은(평형 근처) 상태만 기록해 유령 점을 막는다
    const gx = graphX01();
    const last = samples[samples.length - 1];
    const settled = Math.abs(targetReading() - reading) < 0.3;
    if (settled && (!last || Math.abs(last.x - gx) > 0.006 || Math.abs(last.y - reading) > 0.06)) {
      samples.push({ x: gx, y: reading });
      if (samples.length > 260) samples.shift();
    }

    // 목표 판정 (기하 기준)
    if (f > 0.38 && f < 0.66) {
      halfMs += dt * 16.7;
      if (halfMs > 360) collect("half", "17 N!", "절반 잠김 — 저울이 17 N");
    } else halfMs = 0;
    if (f >= 0.995) collect("full", "14 N!", "완전 잠김 — 부력이 6 N");
    if (goals.has("full") && deepPx() > 16) collect("deep", "그대로 14 N", "더 깊어도 14 N — 잠긴 부피가 같으니까!");

    // ---- 그리기: 스탠드(고정) ----
    ctx.strokeStyle = "rgba(196,212,236,.65)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx - 84, 26);
    ctx.lineTo(sx + 84, 26);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx + 84, 26);
    ctx.lineTo(sx + 84, 52);
    ctx.stroke();

    // 수조(rise만큼 위로) — 실험실 잭 느낌의 받침
    const tankW = Math.min(W * 0.6, 240);
    const tankL = sx - tankW / 2;
    const tankR = sx + tankW / 2;
    const tBot = tankBotY();
    const wsY = surfaceY();
    // 잭 받침(바닥과 수조 사이)
    ctx.strokeStyle = "rgba(148,168,196,.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 30, LABH - 4);
    ctx.lineTo(sx - 12, tBot + 3);
    ctx.moveTo(sx + 30, LABH - 4);
    ctx.lineTo(sx + 12, tBot + 3);
    ctx.stroke();
    contactShadow(ctx, sx, LABH - 2, tankW * 0.55, 0.24);
    glassVessel(ctx, { x0: tankL, y0: tBot - tankH, x1: tankR, y1: tBot });
    // 물(출렁이는 수면)
    const waveY = (px: number): number => wsY + Math.sin(px / 26 + tMs / 160) * wave * 3.4;
    ctx.beginPath();
    ctx.moveTo(tankL + 3, waveY(tankL));
    for (let px = tankL + 8; px <= tankR - 3; px += 8) ctx.lineTo(px, waveY(px));
    ctx.lineTo(tankR - 3, tBot - 3);
    ctx.lineTo(tankL + 3, tBot - 3);
    ctx.closePath();
    const waterG = ctx.createLinearGradient(0, wsY, 0, tBot);
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

    // 용수철저울: 길이가 눈금에 비례 — 부력이 받치면 눈에 띄게 짧아진다
    const sl = springLen(reading);
    drawSpring(ctx, sx, springTop, sx, springTop + sl, { coils: 8, radius: 9 });
    const wTop = weightTopY(reading);
    // 고리 연결
    ctx.strokeStyle = "rgba(216,232,252,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, springTop + sl);
    ctx.lineTo(sx, wTop - 4);
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

    // 수조 잡기 유도(수조 옆 화살표)
    if (!dragging && !finished && rise < 6) {
      const bob = Math.sin(tMs / 300) * 4;
      ctx.strokeStyle = "rgba(255,194,77,.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tankR + 16, tBot - 26 + bob);
      ctx.lineTo(tankR + 16, tBot - 54 + bob);
      ctx.moveTo(tankR + 10, tBot - 46 + bob);
      ctx.lineTo(tankR + 16, tBot - 54 + bob);
      ctx.lineTo(tankR + 22, tBot - 46 + bob);
      ctx.stroke();
    }

    // 힘 화살표: 부력(빨강↑) · 중력(파랑↓) — 교과서 V-12 색
    const buoyN = W_AIR - reading;
    if (f > 0.005 && buoyN > 0.25) {
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

    // 그래프(하단)
    drawGraph(ctx, tMs);

    // HUD 갱신
    const txt = reading.toFixed(1);
    if (txt !== shown) {
      shown = txt;
      readVal.textContent = txt;
      const b = W_AIR - reading;
      buoyPill.textContent = b < 0.05 ? "부력 0.0 N — 아직 물 밖" : `부력 ${b.toFixed(1)} N = 20 − ${txt}`;
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
