// latSunLab — 위도와 햇빛 랩(사회 Ⅰ L1). 미래엔 9쪽 "위도에 따른 햇빛" 그림의 조작판.
//   · 태양 광선은 지구에 평행하게 도착 — 오른쪽에서 들어오는 수평 광선 다발(따뜻한 노랑).
//   · 왼쪽에 큰 지구 원호(남색 원판). 남쪽 림은 캔버스 아래로 잘려 "거대한 행성"으로 읽힌다.
//     기하는 진짜 원(R=195, 중심 (24, 280)). 중심 x를 캔버스 살짝 안쪽(+24)에 둔 이유:
//     위도 85° 지표점의 x = cx + R·cos85° ≈ cx + 17이라, cx < 0이면 고위도 스틱맨이 왼쪽으로
//     잘린다(0~85° 전 구간 가시성 우선). 중심점 자체는 행성 채움에 덮여 화면에선 알 수 없다.
//   · 하이라이트 빔(폭 22px 고정)이 스틱맨 위치의 지표에 닿고, 닿는 구간은 원 기하 그대로
//     asin으로 정확 계산(≈ 폭/cos위도). 극 근처에선 빔 일부가 극 위로 새어 나가는 것까지 진짜
//     기하다(수평 광선의 낮 경계 = 위도 90°, 그 위를 지나는 빛은 지표에 닿지 못한다).
//   · HUD 게이지 = cos(위도)를 %로("같은 넓이가 받는 햇빛" — 적도 100 · 60° 50 · 80° 17).
//   · 온도는 수치 대신 스틱맨 옷차림: 30° 미만 반팔+땀방울, 30~65° 긴팔, 65° 초과 패딩+덜덜.
// 목표: ① 적도 근처(15° 이하) ② 중위도(30~60°) ③ 극지방(70° 이상) — 각 대역 400ms 머무름
// (buoyancyLab halfMs 문법). 3개 달성 → 결론 helper + recordQuiz + CTA.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawStickman, poseStand } from "../../ui/stick";
import { curioCard } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LatSunStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: { q: string; a: string };
}

const CVH = 396; // 캔버스 높이(buoyancy와 동일 규격)
const R = 195; // 지구 반지름(px)
const CX = 24; // 지구 중심 x — 헤더 주석의 가시성 절충값
const CY = 280; // 지구 중심 y(적도 높이)
const LAT_MAX = 85; // 드래그 상한(°)
const LAT_START = 22; // 시작 위도 — 세 목표 대역 어디에도 안 걸리는 중립 지점
const HW = 11; // 하이라이트 빔 반폭(px) — 전체 폭 22 고정

type Pt = { x: number; y: number };
const lp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const rad = (deg: number): number => (deg * Math.PI) / 180;

function seg(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export const latSunLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LatSunStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "스틱맨의 위도 옮기기. 위아래 화살표 키로도 조절해요.",
      "aria-valuemin": "0",
      "aria-valuemax": String(LAT_MAX),
      "aria-valuenow": String(LAT_START),
      "aria-valuetext": `위도 ${LAT_START}도, 같은 넓이가 받는 햇빛 93퍼센트`,
    },
  });

  // HUD — 왼쪽: 게이지 필+미터 바(인라인 스타일 — 전용 CSS 불필요), 오른쪽: 위도 읽기
  const pdot = el("span", { class: "pdot", style: "background:#FFC24D" });
  const pillTxt = el("span", { text: "같은 넓이가 받는 햇빛 93%" });
  const meterFill = el("span", {
    style:
      "display:block;height:100%;width:93%;border-radius:99px;" +
      "background:linear-gradient(90deg,#FFE3A1,#FFC24D);transition:width .25s",
  });
  const meter = el(
    "span",
    {
      style:
        "display:block;width:118px;height:7px;border-radius:99px;background:rgba(255,255,255,.15);" +
        "border:1px solid rgba(255,255,255,.12);overflow:hidden",
    },
    meterFill,
  );
  const hudLeft = el(
    "div",
    { style: "display:flex;flex-direction:column;gap:6px;align-items:flex-start" },
    el("div", { class: "pill" }, pdot, pillTxt),
    meter,
  );
  const latVal = el("span", { text: String(LAT_START) });
  const readEl = el("div", { class: "tempread" }, el("small", { text: "위도 " }), latVal, el("small", { text: "°" }));
  const toastEl = el("div", { class: "toast low" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, hudLeft, readEl), toastEl);
  const capEl = el("div", { class: "stage-cap", text: "스틱맨을 끌어 남북으로 옮겨 보세요" });
  stage.appendChild(capEl);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "eq" } }, el("b", { text: "적도 근처" }), el("span", { text: "햇빛 집중!" })),
    el("div", { class: "pn-badge world", dataset: { g: "mid" } }, el("b", { text: "중위도" }), el("span", { text: "비스듬히" })),
    el("div", { class: "pn-badge world", dataset: { g: "pole" } }, el("b", { text: "극지방" }), el("span", { text: "넓게 분산" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지구 위 스틱맨을 <b>위아래로 끌어</b> 위도를 바꿔 보세요. 노란 <b>빛 기둥이 닿는 땅의 길이</b>와 <b>같은 넓이가 받는 햇빛 %</b>가 어떻게 변할까요?",
  });
  host.append(goalChips, helper, stage); // 지시(helper)는 조작 요소 위 — 전 트랙 공통 규칙
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let H = CVH;
  let lat = LAT_START; // 목표 위도(입력이 정함)
  let showLat = LAT_START; // 표시 위도(살짝 따라감)
  let dragging = false;
  let dragLat0 = LAT_START;
  let dragAng0 = 0;
  let eqMs = 0;
  let midMs = 0;
  let poleMs = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capFaded = false;
  let shownPct = -1;
  let shownLat = -1;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2000);
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
        "위도가 높아질수록 같은 햇빛이 <b>넓은 땅에 나뉘어요</b> — 그래서 <b>적도는 덥고 극지방은 추워요</b>. 위치가 기후를 정하는 <b>첫 번째 열쇠</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "기후 지도 보러 가기");
    }
  }

  function syncAria(): void {
    const l = Math.round(lat);
    const p = Math.round(Math.cos(rad(lat)) * 100);
    canvas.setAttribute("aria-valuenow", String(l));
    canvas.setAttribute("aria-valuetext", `위도 ${l}도, 같은 넓이가 받는 햇빛 ${p}퍼센트`);
  }

  // ---- 입력: 원호 따라 각도 드래그(상하 드래그도 자연히 각도 변화가 된다) ----
  function pointerAngle(e: PointerEvent): number {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    return (Math.atan2(CY - y, x - CX) * 180) / Math.PI;
  }
  const onDown = (e: PointerEvent): void => {
    dragging = true;
    dragLat0 = lat;
    dragAng0 = pointerAngle(e);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 안전(사고 7) */
    }
    canvas.classList.add("dragging");
    if (!capFaded) {
      capFaded = true;
      capEl.style.transition = "opacity .4s";
      capEl.style.opacity = "0";
    }
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    lat = clamp(dragLat0 + (pointerAngle(e) - dragAng0), 0, LAT_MAX);
    syncAria();
  };
  const onUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowUp") lat = clamp(lat + 5, 0, LAT_MAX);
    else if (e.key === "ArrowDown") lat = clamp(lat - 5, 0, LAT_MAX);
    else return;
    e.preventDefault();
    syncAria();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 스틱맨(+옷차림) — 지표 접선에 맞춰 회전한 로컬 좌표에서 그린다 ----
  function drawTraveler(ctx: CanvasRenderingContext2D, px: number, py: number, aRad: number, tMs: number): void {
    const hot = showLat < 30;
    const cold = showLat > 65;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 2 - aRad); // 로컬 -y = 지표 바깥(법선) 방향
    if (cold) ctx.translate(Math.sin(tMs / 32) * 1.2, 0); // 덜덜 떨림
    const j = drawStickman(ctx, 0, 0, 34, poseStand(tMs), { face: "dot" });
    ctx.lineCap = "round";
    if (hot) {
      // 반팔 티(몸통만) + 땀방울
      ctx.strokeStyle = "#EBD9A4";
      ctx.lineWidth = 6;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      for (const i of [0, 1]) {
        const ph = (tMs / 640 + i * 0.47) % 1;
        ctx.fillStyle = `rgba(140,214,255,${((1 - ph) * 0.85).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(j.head.x + 6.5 + ph * 5, j.head.y - 2 + ph * 11, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (!cold) {
      // 긴팔 셔츠(몸통+소매)
      ctx.strokeStyle = "#7FB0E0";
      ctx.lineWidth = 6;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      ctx.lineWidth = 4.6;
      const f = lp(j.shoulder, j.handF, 0.84);
      const b = lp(j.shoulder, j.handB, 0.84);
      seg(ctx, j.shoulder.x, j.shoulder.y, f.x, f.y);
      seg(ctx, j.shoulder.x, j.shoulder.y, b.x, b.y);
    } else {
      // 패딩(사회 포인트 오렌지) + 누빔 하이라이트 + 목도리 + 입김
      ctx.strokeStyle = "#E8590C";
      ctx.lineWidth = 12.5;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      ctx.lineWidth = 7.5;
      const f = lp(j.shoulder, j.handF, 0.88);
      const b = lp(j.shoulder, j.handB, 0.88);
      seg(ctx, j.shoulder.x, j.shoulder.y, f.x, f.y);
      seg(ctx, j.shoulder.x, j.shoulder.y, b.x, b.y);
      ctx.strokeStyle = "rgba(255,255,255,.3)";
      ctx.lineWidth = 4;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      const neck = lp(j.shoulder, j.head, 0.38);
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 3.2;
      seg(ctx, neck.x - 4, neck.y, neck.x + 4.5, neck.y + 0.8);
      seg(ctx, neck.x + 2.4, neck.y + 0.6, neck.x + 3.6, neck.y + 6.8);
      const ph = (tMs % 1500) / 1500;
      if (ph < 0.55) {
        const pp = ph / 0.55;
        ctx.strokeStyle = `rgba(226,240,255,${((1 - pp) * 0.6).toFixed(2)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(j.head.x + 8 + pp * 8, j.head.y - 1.5, 1.5 + pp * 2.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;

    showLat += (lat - showLat) * Math.min(1, 0.3 * dt);
    if (Math.abs(lat - showLat) < 0.05) showLat = lat;
    const a = rad(showLat);
    const px = CX + R * Math.cos(a);
    const py = CY - R * Math.sin(a);
    const pct = Math.round(Math.cos(a) * 100);

    // 목표 판정 — 대역에 400ms 머무르면 수집(buoyancy halfMs 문법)
    const tick = dt * 16.7;
    if (showLat <= 15) {
      eqMs += tick;
      if (eqMs > 400) collect("eq", `${pct}%!`, "적도 — 좁은 땅에 쏙! 일 년 내내 더워요");
    } else eqMs = 0;
    if (showLat >= 30 && showLat <= 60) {
      midMs += tick;
      if (midMs > 400) collect("mid", `${pct}%!`, "중위도 — 비스듬히 닿아 더 넓게 나뉘어요");
    } else midMs = 0;
    if (showLat >= 70) {
      poleMs += tick;
      if (poleMs > 400) collect("pole", `${pct}%!`, "극지방 — 아주 넓게 퍼져요. 그래서 추워요");
    } else poleMs = 0;

    // 1) 오른쪽 빛 유입 글로우(태양은 멀리 — 평행 광선이라 원반은 그리지 않는다)
    const inGlow = ctx.createLinearGradient(W - 84, 0, W, 0);
    inGlow.addColorStop(0, "rgba(255,205,120,0)");
    inGlow.addColorStop(1, "rgba(255,205,120,.11)");
    ctx.fillStyle = inGlow;
    ctx.fillRect(W - 84, 0, 84, H);

    // 2) 지구 — 남색 원판(남쪽 림은 캔버스 아래로 잘려 큰 행성으로 읽힘)
    const disc = ctx.createRadialGradient(CX, CY, R * 0.2, CX, CY, R);
    disc.addColorStop(0, "#0E1C36");
    disc.addColorStop(0.78, "#142645");
    disc.addColorStop(0.97, "#1D3560");
    disc.addColorStop(1, "#294573");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(CX, CY, R, -Math.PI * 0.56, Math.PI * 0.5);
    ctx.lineTo(-10, CY + R + 10);
    ctx.lineTo(-10, 70);
    ctx.closePath();
    ctx.fill();
    // 지표 라인(밝은 림)
    ctx.strokeStyle = "rgba(182,204,238,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, R, -Math.PI * 0.53, Math.PI * 0.47);
    ctx.stroke();

    // 3) 위도 눈금·라벨(행성 안쪽 — 광선 지역과 겹치지 않게)
    for (let d = -30; d <= 90; d += 15) {
      const aa = rad(d);
      const ca = Math.cos(aa);
      const sa = Math.sin(aa);
      const major = d % 30 === 0 && d >= 0;
      ctx.strokeStyle = major ? "rgba(182,204,238,.5)" : "rgba(182,204,238,.26)";
      ctx.lineWidth = major ? 1.6 : 1.2;
      const inR = R - (major ? 9 : 6);
      seg(ctx, CX + inR * ca, CY - inR * sa, CX + (R - 1) * ca, CY - (R - 1) * sa);
    }
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = "rgba(160,185,220,.3)";
    ctx.lineWidth = 1.2;
    seg(ctx, CX + R - 132, CY, CX + R - 12, CY);
    ctx.setLineDash([]);
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(205,222,244,.72)";
    ctx.fillText("적도", CX + R - 26, CY + 15);
    for (const [d, txt] of [[30, "30°"], [60, "60°"], [90, "북극"]] as [number, string][]) {
      const aa = rad(d);
      ctx.fillText(txt, CX + (R - 26) * Math.cos(aa), CY - (R - 26) * Math.sin(aa) + 3.5);
    }

    // 4) 평행 광선 다발 — 지표에 닿으면 멈추고, 극 위를 지나는 줄은 그대로 통과
    for (let y = 64; y < H - 20; y += 34) {
      if (Math.abs(y - py) < HW + 18) continue; // 하이라이트 빔 자리는 비워 둔다
      const dy = CY - y;
      const hits = Math.abs(dy) <= R - 1;
      const xEnd = hits ? CX + Math.sqrt(R * R - dy * dy) : -4;
      ctx.strokeStyle = hits ? "rgba(255,196,90,.09)" : "rgba(255,196,90,.06)";
      ctx.lineWidth = 2.8;
      seg(ctx, W + 2, y, xEnd, y);
      ctx.strokeStyle = hits ? "rgba(255,208,124,.28)" : "rgba(255,208,124,.16)";
      ctx.lineWidth = 1.3;
      seg(ctx, W + 2, y, xEnd, y);
      const ax = hits ? Math.min(xEnd + 40, W - 26) : 130;
      ctx.strokeStyle = hits ? "rgba(255,208,124,.34)" : "rgba(255,208,124,.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax + 6.5, y - 4);
      ctx.lineTo(ax, y);
      ctx.lineTo(ax + 6.5, y + 4);
      ctx.stroke();
    }

    // 5) 하이라이트 빔(폭 22px 고정) — 스틱맨 위치의 지표에 닿는다
    const yU = py - HW;
    const yL = py + HW;
    const sinHi = (CY - yU) / R;
    const sinLo = (CY - yL) / R;
    const miss = sinHi > 1; // 윗변이 극 위로 새는 상태(고위도)
    const phiHi = Math.asin(Math.min(1, sinHi));
    const phiLo = Math.asin(Math.max(-1, sinLo));
    const yUeff = miss ? CY - R : yU;
    const xU = CX + R * Math.cos(phiHi);
    const xL = CX + R * Math.cos(phiLo);
    if (miss) {
      // 지표에 닿지 못하고 스쳐 지나가는 윗부분
      ctx.fillStyle = "rgba(255,196,90,.09)";
      ctx.fillRect(-4, yU, W + 8, yUeff - yU);
      ctx.strokeStyle = "rgba(255,205,110,.3)";
      ctx.lineWidth = 1.3;
      seg(ctx, W + 2, yU, -4, yU);
    }
    const beam = ctx.createLinearGradient(px - 30, 0, W, 0);
    beam.addColorStop(0, "rgba(255,196,90,.30)");
    beam.addColorStop(0.5, "rgba(255,196,90,.14)");
    beam.addColorStop(1, "rgba(255,196,90,.05)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(W + 2, yUeff);
    ctx.lineTo(xU, yUeff);
    for (let i = 1; i <= 12; i++) {
      const aa = phiHi + ((phiLo - phiHi) * i) / 12;
      ctx.lineTo(CX + R * Math.cos(aa), CY - R * Math.sin(aa));
    }
    ctx.lineTo(W + 2, yL);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,205,110,.5)";
    ctx.lineWidth = 1.5;
    seg(ctx, W + 2, yUeff, xU, yUeff);
    seg(ctx, W + 2, yL, xL, yL);
    // 중심 광선 + 흐르는 빛 알갱이(진행 방향이 몸으로 읽히게)
    ctx.strokeStyle = "rgba(255,200,90,.22)";
    ctx.lineWidth = 4.5;
    seg(ctx, W + 2, py, px + 1, py);
    ctx.strokeStyle = "rgba(255,228,168,.85)";
    ctx.lineWidth = 1.8;
    seg(ctx, W + 2, py, px + 1, py);
    ctx.save();
    ctx.setLineDash([5, 24]);
    ctx.lineDashOffset = -((tMs * 0.07) % 290);
    ctx.strokeStyle = "rgba(255,242,205,.9)";
    ctx.lineWidth = 2.4;
    seg(ctx, W + 2, py, px + 2, py);
    ctx.restore();

    // 6) 빛이 닿는 지표 구간 — "같은 빛이 이만큼 넓게 나뉜다"
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const am = (phiHi + phiLo) / 2;
    const mx = CX + R * Math.cos(am);
    const my = CY - R * Math.sin(am);
    const halo = ctx.createRadialGradient(mx, my, 2, mx, my, 44);
    halo.addColorStop(0, "rgba(255,190,80,.16)");
    halo.addColorStop(1, "rgba(255,190,80,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, 44, 0, Math.PI * 2);
    ctx.fill();
    for (const [lw, col] of [
      [9, "rgba(255,170,60,.2)"],
      [4.6, "rgba(255,196,80,.55)"],
      [2, "rgba(255,235,196,.9)"],
    ] as [number, string][]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(CX, CY, R, -phiHi, -phiLo);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,240,205,.75)";
    ctx.lineWidth = 1.5;
    for (const aa of [phiHi, phiLo]) {
      const ca = Math.cos(aa);
      const sa = Math.sin(aa);
      seg(ctx, CX + (R - 7) * ca, CY - (R - 7) * sa, CX + (R + 7) * ca, CY - (R + 7) * sa);
    }
    ctx.restore();

    // 7) 스틱맨 여행자
    drawTraveler(ctx, px, py, a, tMs);

    // 8) 시작 힌트 — 첫 목표 전, 원호 방향 위아래 화살표
    if (!dragging && goals.size === 0 && !finished) {
      const bob = Math.sin(tMs / 300) * 3.5;
      const nx = -Math.sin(a);
      const ny = -Math.cos(a);
      const ox = Math.cos(a);
      const oy = -Math.sin(a);
      ctx.strokeStyle = "rgba(255,194,77,.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (const d of [1, -1]) {
        const dist = (d === 1 ? 52 : 38) + bob;
        const tx = px + ox * 18 + nx * dist * d;
        const ty = py + oy * 18 + ny * dist * d;
        seg(ctx, tx - nx * d * 16, ty - ny * d * 16, tx, ty);
        ctx.beginPath();
        ctx.moveTo(tx - nx * d * 8 + ox * 5.5, ty - ny * d * 8 + oy * 5.5);
        ctx.lineTo(tx, ty);
        ctx.lineTo(tx - nx * d * 8 - ox * 5.5, ty - ny * d * 8 - oy * 5.5);
        ctx.stroke();
      }
    }

    // 9) HUD 갱신(변할 때만)
    if (pct !== shownPct) {
      shownPct = pct;
      pillTxt.textContent = `같은 넓이가 받는 햇빛 ${pct}%`;
      meterFill.style.width = `${pct}%`;
      pdot.style.background = `hsl(${45 + (100 - pct) * 1.5}, 86%, 64%)`;
    }
    const l = Math.round(showLat);
    if (l !== shownLat) {
      shownLat = l;
      latVal.textContent = String(l);
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH, 1.75);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("적도 → 중위도 → 극지방 차례로!", { enabled: false });
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
