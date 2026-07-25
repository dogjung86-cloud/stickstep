// leafZoomLab — 현미경 배율을 3단으로 올려 잎 → 잎세포 → 엽록체까지 파고드는 관찰 랩(중2 Ⅴ, 책 172쪽).
//  · 배율 0 = 잎 한 장 / 1 = 벽으로 나뉜 잎세포 8개 / 2 = 세포 하나가 화면을 채우고 그 안에 엽록체 9개.
//  · 엽록체를 탭하면 밝게 뛰며 이름표가 붙고, 빛을 비추면 엽록소가 빛에너지를 흡수한 뒤
//    흡수하지 못한 초록빛이 위로 되쏘아 나간다(잎이 초록으로 보이는 까닭).
//  · 캔버스 드래그는 시야 이동일 뿐 목표와 무관 — "현미경을 들여다보는 실감"만 담당한다.
// 규격: 논리 좌표 360폭 기준으로 그리고 buildLab이 준 sc를 곱한다 · 포인터는 (clientX-rect.left)/sc로 역변환 ·
//       애니메이션은 createLoop의 tMs만 사용한다(Math.random 금지 — E2E 재현성).
// 색·소품은 전부 ui/plantKit2의 헬퍼로만 그린다(단원 표현의 단일 진실 공급원).

import { clamp } from "../../../core/dom";
import { createLoop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import {
  BASE_W, alpha, badge, buildLab, drawChloroplast, drawLeaf, drawSunbeam,
  labButton, plantColor, safeCapture,
} from "../../../ui/plantKit2";
import type { Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";

interface LeafZoomStep { title: string; lead?: string; cta?: string; curio?: Curio }

type Zoom = 0 | 1 | 2;

const STAGE_H = 320;   // 무대 높이(논리 y의 최댓값과 같게)
const CX = 180;        // 현미경 시야 중심(논리)
const CY = 160;
const FIELD_R = 156;   // 시야(둥근 창) 반지름
const PAN = 40;        // 시야 이동 한계(±)
const TAP_SLOP = 6;    // 이만큼 안 움직였으면 드래그가 아니라 탭

// 배율 표기는 숫자만 — 교과서 그림은 36µm 스케일바를 쓰지만, 학생에겐 배율 숫자가 훨씬 잘 읽힌다.
const MAG = ["×1", "×100", "×400"];
const STAGE_NAME = ["잎", "잎세포", "세포 한 개"];
// 상태 필은 짧게 — 배율 숫자는 캔버스 배지가 맡는다(같은 정보를 두 번 쓰지 않는다).
const READ = ["잎 한 장을 보고 있어요", "잎세포가 보여요", "세포 안이 보여요"];
const HELP = [
  "<b>더 확대하기</b>를 눌러 잎 속을 들여다보세요.",
  "벽으로 나뉜 <b>잎세포</b>가 보여요. 화면을 끌면 시야가 움직이고, 한 번 더 확대하면 세포 안이 보여요.",
  "세포 안 <b>초록 알갱이를 탭</b>해 이름을 확인하고, <b>빛 비추기</b>로 빛을 내려 보세요.",
];
const HELP_DONE =
  "엽록체 속 <b>엽록소</b>가 빛에너지를 흡수해요. 잎이 초록으로 보이는 건 엽록소가 흡수하지 않고 " +
  "<b>되쏘아 낸 초록빛</b> 때문이에요.";
const READ_LIGHT = "초록빛은 반사돼요 — 그래서 잎이 초록으로 보여요";

// ── 배율 1: 잎세포 2행 4열 격자(논리 좌표 고정) ────────────────
const CELL_W = 66;
const CELL_H = 78;
const CELL_GAP = 6;
const GRID_X0 = CX - (CELL_W * 4 + CELL_GAP * 3) / 2;  // 39
const GRID_Y0 = CY - (CELL_H * 2 + CELL_GAP) / 2;      // 79

// 세포 안 작은 초록 점(세포 중심 기준 상대 좌표) — 세포마다 두 벌을 번갈아 써서 살짝 다르게 보인다.
const DOTS_A: [number, number][] = [[-21, -22], [12, -25], [-6, -3], [22, 8], [-20, 19], [7, 25]];
const DOTS_B: [number, number][] = [[-18, -17], [16, -13], [-2, 6], [20, 21], [-22, 24], [4, -27]];

// ── 배율 2: 세포 하나 + 엽록체 9개(3×3, 논리 x 100~260 · y 90~230) ──
const BIG_X = 40;
const BIG_Y = 38;
const BIG_W = 280;
const BIG_H = 244;
const CH_RX = 24;
const CH_RY = 15;
const CH_HIT = 22;     // 탭 판정 반경
const CHLORO: { x: number; y: number; rot: number }[] = [
  { x: 100, y: 90, rot: -0.34 }, { x: 180, y: 90, rot: 0.18 }, { x: 260, y: 90, rot: -0.12 },
  { x: 100, y: 160, rot: 0.42 }, { x: 180, y: 160, rot: -0.26 }, { x: 260, y: 160, rot: 0.14 },
  { x: 100, y: 230, rot: 0.3 }, { x: 180, y: 230, rot: -0.4 }, { x: 260, y: 230, rot: 0.08 },
];
// 반사된 초록빛 화살표가 튀어나오는 엽록체(윗줄 3개 + 가운데)
const ARROW_SRC = [0, 1, 2, 4];

/** 둥근 모서리 사각형 경로 — roundRect 타입 의존 없이 직접 그린다. */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

/** 되쏘아 나가는 초록빛 화살표(위로). */
function drawUpArrow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, a: number): void {
  if (a <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, a);
  ctx.strokeStyle = plantColor("leafHi");
  ctx.shadowColor = alpha("leafHi", 0.9);
  ctx.shadowBlur = size * 0.9;
  ctx.lineWidth = Math.max(1.8, size * 0.26);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y - size);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.42);
  ctx.lineTo(x, y - size);
  ctx.lineTo(x + size * 0.5, y - size * 0.42);
  ctx.stroke();
  ctx.restore();
}

export const leafZoomLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LeafZoomStep;

  let zoom: Zoom = 0;
  let offX = 0;          // 시야 이동(논리)
  let offY = 0;
  let dragging = false;
  let dragX = 0;
  let dragY = 0;
  let baseOffX = 0;
  let baseOffY = 0;
  let moved = 0;
  let tapIdx = -1;       // 이름표가 붙은 엽록체
  let tapMs = 0;
  let lastTMs = 0;       // 루프가 준 최신 tMs(포인터 쪽에서 애니 시작 시각으로 쓴다)
  let lightOn = false;
  let lightAmt = 0;      // 0~1 램프(빛 다발 세기)
  let lightFrom = 0;
  let lightAt = 0;
  let allDone = false;

  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "cells", name: "세포 찾기", hint: "확대하기" },
      { id: "chloro", name: "엽록체", hint: "탭해서 확인" },
      { id: "light", name: "빛 흡수", hint: "빛 비추기" },
    ],
    helper: HELP[0],
    read: READ[0],
    curio: s.curio,
    ariaLabel: "현미경 배율을 높여 잎, 잎세포, 세포 속 엽록체를 차례로 관찰하는 무대",
    onAll: () => {
      allDone = true;
      shell.helper.innerHTML = HELP_DONE;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });
  const canvas = shell.canvas;

  // ── 조작부 ──────────────────────────────────────────────────
  shell.controls.classList.add("three");
  const btnIn = labButton("더 확대하기", () => zoomBy(1), { tone: "primary" });
  btnIn.dataset.act = "zoomin";
  const btnOut = labButton("축소하기", () => zoomBy(-1));
  btnOut.dataset.act = "zoomout";
  const btnLight = labButton("빛 비추기", () => toggleLight());
  btnLight.dataset.act = "light";
  shell.controls.append(btnIn, btnOut, btnLight);

  const syncButtons = (): void => {
    btnIn.classList.toggle("primary", zoom < 2);
    btnLight.classList.toggle("on", lightOn);
    btnLight.classList.toggle("primary", zoom === 2 && !lightOn);
  };

  const setLight = (on: boolean): void => {
    if (lightOn === on) return;
    lightOn = on;
    lightFrom = lightAmt;   // 지금 값에서 이어서 램프(연타해도 튀지 않는다)
    lightAt = lastTMs;
    syncButtons();
  };

  const setZoom = (z: Zoom): void => {
    zoom = z;
    offX = 0;
    offY = 0;               // 배율이 바뀌면 시야를 가운데로 되돌린다
    if (zoom !== 2) {
      setLight(false);
      tapIdx = -1;
    }
    canvas.classList.toggle("grab", zoom >= 1);
    shell.setRead(lightOn ? READ_LIGHT : READ[zoom]);
    if (!allDone) shell.helper.innerHTML = HELP[zoom];
    syncButtons();
    if (zoom >= 1) shell.collect("cells", "벽으로 나뉜 잎세포가 보여요");
  };

  const zoomBy = (d: 1 | -1): void => {
    const next = zoom + d;
    if (next > 2) { shell.toast("가장 큰 배율이에요"); return; }
    if (next < 0) { shell.toast("가장 작은 배율이에요"); return; }
    setZoom(next as Zoom);
  };

  const toggleLight = (): void => {
    if (zoom !== 2) { shell.toast("먼저 엽록체가 보이는 배율까지 확대해요"); return; }
    setLight(!lightOn);
    if (lightOn) {
      shell.setRead(READ_LIGHT);
      shell.collect("light", "엽록소가 빛에너지를 흡수해요");
    } else {
      shell.setRead(READ[zoom]);
    }
  };

  // ── 포인터(캔버스 직결 — E2E가 캔버스에 PointerEvent를 직접 dispatch한다) ──
  const toLogic = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    const sc = (r.width || BASE_W) / BASE_W;
    return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
  };

  const hitChloro = (lx: number, ly: number): number => {
    for (let i = 0; i < CHLORO.length; i++) {
      const c = CHLORO[i];
      if (Math.hypot(lx - c.x, ly - c.y) <= CH_HIT) return i;
    }
    return -1;
  };

  const onDown = (e: PointerEvent): void => {
    const p = toLogic(e);
    dragging = true;
    moved = 0;
    dragX = p.x;
    dragY = p.y;
    baseOffX = offX;
    baseOffY = offY;
    safeCapture(canvas, e.pointerId);
    // 엽록체 탭은 누르는 즉시 반응한다(손끝 반응 + 합성 포인터에서도 확실히 잡힌다).
    if (zoom !== 2) return;
    const i = hitChloro(p.x - offX, p.y - offY);
    if (i < 0) return;
    tapIdx = i;
    tapMs = lastTMs;
    haptic(HAPTIC.select);
    shell.collect("chloro", "세포 안 초록 알갱이가 엽록체예요");
  };

  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const p = toLogic(e);
    const dx = p.x - dragX;
    const dy = p.y - dragY;
    moved = Math.max(moved, Math.hypot(dx, dy));
    if (zoom < 1) return;   // 잎 한 장은 시야를 옮길 것이 없다
    offX = clamp(baseOffX + dx, -PAN, PAN);
    offY = clamp(baseOffY + dy, -PAN, PAN);
  };

  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    if (moved > TAP_SLOP || shell.has("chloro")) return;
    if (zoom === 2) shell.toast("세포 안 초록 알갱이를 탭해 보세요");
    else if (zoom === 1) shell.toast("한 번 더 확대하면 세포 안이 보여요");
  };

  const onCancel = (): void => { dragging = false; };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);

  // ── 그리기 ──────────────────────────────────────────────────
  /** 현미경 시야 — 아주 옅은 초록이 도는 둥근 창. */
  const drawField = (ctx: CanvasRenderingContext2D, w: number, h: number, sc: number): void => {
    const g = ctx.createRadialGradient(CX * sc, CY * sc, FIELD_R * sc * 0.06, CX * sc, CY * sc, FIELD_R * sc);
    g.addColorStop(0, alpha("leaf", 0.2));
    g.addColorStop(0.65, alpha("leafLo", 0.16));
    g.addColorStop(1, alpha("leafLo", 0.05));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };

  /** 시야 밖을 어둡게 눌러 "들여다보는 창"을 만든다. */
  const drawVignette = (ctx: CanvasRenderingContext2D, w: number, h: number, sc: number): void => {
    const cx = CX * sc;
    const cy = CY * sc;
    const r = FIELD_R * sc;
    const g = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r * 1.35);
    g.addColorStop(0, alpha("ink", 0));
    g.addColorStop(0.28, alpha("ink", 0.34));
    g.addColorStop(0.62, alpha("ink", 0.86));
    g.addColorStop(1, alpha("ink", 0.98));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = alpha("paper", 0.14);
    ctx.lineWidth = 1.4 * sc;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  /** 배율 1 — 세포벽으로 나뉜 잎세포 8개, 안에는 엽록체가 될 작은 초록 점. */
  const drawCells = (ctx: CanvasRenderingContext2D, sc: number): void => {
    for (let i = 0; i < 8; i++) {
      const col = i % 4;
      const row = (i / 4) | 0;
      const x = (GRID_X0 + col * (CELL_W + CELL_GAP) + offX) * sc;
      const y = (GRID_Y0 + row * (CELL_H + CELL_GAP) + offY) * sc;
      const w = CELL_W * sc;
      const h = CELL_H * sc;
      roundRectPath(ctx, x, y, w, h, 13 * sc);
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, alpha("leaf", 0.46));
      g.addColorStop(1, alpha("leafLo", 0.72));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = alpha("leafHi", 0.92);
      ctx.lineWidth = 2 * sc;   // 세포벽
      ctx.stroke();
      const dots = i % 2 === 0 ? DOTS_A : DOTS_B;
      const n = i % 3 === 0 ? 6 : 5;
      for (let k = 0; k < n; k++) {
        const d = dots[k];
        drawChloroplast(ctx, x + w / 2 + d[0] * sc, y + h / 2 + d[1] * sc, 6.5 * sc, 4 * sc, 0.4 + k * 0.5, 0);
      }
    }
  };

  /** 배율 2 — 세포 하나가 화면을 채우고, 그 안에 엽록체 9개. */
  const drawOneCell = (ctx: CanvasRenderingContext2D, sc: number, tMs: number): void => {
    const x = (BIG_X + offX) * sc;
    const y = (BIG_Y + offY) * sc;
    const w = BIG_W * sc;
    const h = BIG_H * sc;
    roundRectPath(ctx, x, y, w, h, 34 * sc);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, alpha("leaf", 0.4));
    g.addColorStop(1, alpha("leafLo", 0.7));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = alpha("leafHi", 0.95);
    ctx.lineWidth = 8 * sc;   // 세포벽은 두껍게
    ctx.stroke();
    roundRectPath(ctx, x + 9 * sc, y + 9 * sc, w - 18 * sc, h - 18 * sc, 27 * sc);
    ctx.strokeStyle = alpha("vein", 0.45);
    ctx.lineWidth = 1.6 * sc;
    ctx.stroke();

    // 위에서 내려오는 빛 다발(엽록체에 닿는다)
    if (lightAmt > 0.01) drawSunbeam(ctx, 84 * sc, 276 * sc, 0, 250 * sc, lightAmt, tMs);

    for (let i = 0; i < CHLORO.length; i++) {
      const c = CHLORO[i];
      const since = i === tapIdx ? tMs - tapMs : Number.POSITIVE_INFINITY;
      const lift = since >= 0 && since < 620 ? Math.sin((since / 620) * Math.PI) * 9 : 0;
      const pop = since >= 0 && since < 900 ? 1 - since / 900 : 0;
      const shine = lightAmt * (0.55 + 0.45 * Math.sin(tMs / 320 + i * 0.7));
      drawChloroplast(
        ctx, (c.x + offX) * sc, (c.y + offY - lift) * sc,
        CH_RX * sc, CH_RY * sc, c.rot, clamp(shine + pop, 0, 1),
      );
    }

    // 흡수되지 않은 초록빛이 위로 되쏘아 나간다
    if (lightAmt > 0.05) {
      for (let k = 0; k < ARROW_SRC.length; k++) {
        const c = CHLORO[ARROW_SRC[k]];
        const p = ((tMs / 1500) + k * 0.25) % 1;
        const ax = (c.x + offX + (k % 2 === 0 ? -1 : 1) * p * 16) * sc;
        const ay = (c.y + offY - CH_RY - 6 - p * 82) * sc;
        drawUpArrow(ctx, ax, ay, 13 * sc, lightAmt * Math.min(1, p / 0.15) * (1 - p));
      }
    }
  };

  /** 배율 배지(좌) · 지금 보고 있는 것(우) · 이름표 — 비네트 위에 올려 항상 읽히게.
   *  좌상단 y를 70까지 내린 건 무대 HUD 상태 필(고정 CSS px, top 14)과 겹치지 않게 하기 위해서다. */
  const drawBadges = (ctx: CanvasRenderingContext2D, sc: number): void => {
    badge(ctx, 36 * sc, 70 * sc, MAG[zoom], "leaf", sc);
    badge(ctx, 300 * sc, 32 * sc, STAGE_NAME[zoom], "leaf", sc);
    if (zoom === 2 && tapIdx >= 0) {
      const c = CHLORO[tapIdx];
      const by = c.y + offY;
      // 위쪽 여백이 모자라면 이름표를 아래로 뒤집는다(우상단 배지와 겹치지 않게).
      badge(ctx, (c.x + offX) * sc, (by - 36 >= 50 ? by - 36 : by + 36) * sc, "엽록체", "leaf", sc);
    }
    if (zoom === 2 && lightAmt > 0.05) {
      ctx.save();
      ctx.globalAlpha = clamp(lightAmt, 0, 1);
      badge(ctx, CX * sc, 298 * sc, "반사된 초록빛", "leaf", sc);
      ctx.restore();
    }
  };

  const loop = createLoop((_dt, tMs) => {
    lastTMs = tMs;
    const { ctx, w, h, sc } = shell.frame();
    ctx.clearRect(0, 0, w, h);
    lightAmt = lightFrom + ((lightOn ? 1 : 0) - lightFrom) * clamp((tMs - lightAt) / 380, 0, 1);
    drawField(ctx, w, h, sc);
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX * sc, CY * sc, FIELD_R * sc, 0, Math.PI * 2);
    ctx.clip();
    if (zoom === 0) drawLeaf(ctx, CX * sc, CY * sc, 250 * sc, 120 * sc, -0.12);
    else if (zoom === 1) drawCells(ctx, sc);
    else drawOneCell(ctx, sc, tMs);
    ctx.restore();
    drawVignette(ctx, w, h, sc);
    drawBadges(ctx, sc);
  });

  syncButtons();
  // 마운트 직후엔 캔버스 폭이 0일 수 있어 다음 프레임에 루프를 켠다(circulationLab 문법).
  const rafId = requestAnimationFrame(() => loop.start());

  api.setCTA("엽록체까지 확대해 보세요", { enabled: false });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onCancel);
    shell.dispose();   // 토스트 타이머 해제까지 킷이 책임진다
  };
};
