// [중2 Ⅶ v5] g2u7l3 waterLab: 「물길과 전기 회로는 어디가 닮았을까요?」 (가로 화면)
// 다루는 내용: 물의 흐름 비유(펌프, 관, 수도꼭지, 물레방아 ↔ 전지, 전선, 스위치, 전구)와, 물의 흐름에 비유해 전류를 설명하기.
// 한 통찰: 펌프가 물의 높이 차를 만들어 물을 계속 흐르게 하듯, 전지는 전압으로 전류를 계속 흐르게 한다.
// 학생이 정하는 것: 펌프의 세기(전지의 수), 수도꼭지(스위치)를 여닫는 것, 어느 부분이 어느 부분과 짝인지 눌러 찾는 것.
// 실패하는 길: 펌프가 없으면 수도꼭지를 열어도 물이 흐르지 않고, 수도꼭지를 잠그면 펌프가 있어도 흐르지 않는다(전기 회로도 똑같이 멈춘다).
// 옛 랩(waterCircuit3d)은 3D 장면에서 짝을 눌렀다. 여기서는 두 그림을 나란히 놓고 같은 조작 하나로 함께 움직여 견준다.
// 세로 화면의 무대에는 같은 그림을 작게 보여 주고, 조작은 가로 화면에서 한다. 가로 화면은 한 화면 검사의 대상이 아니다.
// 누를 자리 힌트(2026-11-15, 사용자 지적 "어느 위치인지 힌트를 줘야 터치할 수 있다"): 가로 화면에서 아직 찾지 않은 자리마다
//   은은하게 깜박이는 점선 상자를 두 그림 모두에 띄우고(옛 3D판의 "깜빡이는 점선 링"과 같은 결, 크게 키우지 말 것),
//   빈 곳을 누르면 가장 가까운 남은 자리를 잠깐 더 밝게 짚어 준다. 짝이 무엇인지는 누른 뒤에만 알려 준다.
//   누르는 자리는 그린 상자에 여유를 두르고 48px보다 작으면 넓힌다(hitBox). 상자끼리 여유가 겹치면 누른 점에 더 가까운 자리가 받는다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawBulb, drawSwitch, drawWire } from "../../../ui/elecKit";
import type { RotateStage } from "../../../ui/rotateStage";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { C } from "./circuitKit";
import { X, xArrow, xBox, xCanvas, xFrame, xJosa, xSegs, xText, type LabStep } from "./kit";

/** 넓은 화면(PC, 태블릿 가로)의 가로 화면: 폰 가로 화면 크기의 설계 판에 그려 창에 맞춰 통째로 키운다(2026-11-15 그래픽 감사 C093).
 *  예전에는 판을 창 크기 그대로 써서 부품은 폰 크기인데 물길과 전선만 길게 늘어났다(1920×1080에서 펌프 26px 남짓).
 *  그림이 차지하는 높이는 설계 판의 y0~y1(위 상태 줄 아래, 아래 버튼 줄 위)이고, 이 띠를 창의 같은 띠 가운데에 놓는다. 배율 상한 KMAX. */
const DESIGN = { w: 700, h: 390, y0: 84, y1: 326 };
const KMAX = 2;
/** 창(w×h)에서 쓸 배율과 자리. k가 1이면 예전처럼 창 크기 그대로 그린다(폰). */
function fitDesign(w: number, h: number): { k: number; ox: number; oy: number; lw: number; lh: number } {
  const top = 92; // 상태 줄(.g2u7x-wsay, 50~82px) 아래
  const bottom = h - 66; // 버튼 줄(.g2u7x-wbar) 위
  const k = Math.min((w - 32) / DESIGN.w, (bottom - top) / (DESIGN.y1 - DESIGN.y0), KMAX);
  if (k <= 1) return { k: 1, ox: 0, oy: 0, lw: w, lh: h };
  return { k, ox: (w - DESIGN.w * k) / 2, oy: (top + bottom) / 2 - ((DESIGN.y0 + DESIGN.y1) / 2) * k, lw: DESIGN.w, lh: DESIGN.h };
}

type PairKey = "pump" | "gap" | "flow" | "tap" | "wheel";
const PAIRS: { k: PairKey; a: string; b: string }[] = [
  { k: "pump", a: "펌프", b: "전지" },
  { k: "gap", a: "물의 높이 차", b: "전압" },
  { k: "flow", a: "물의 흐름", b: "전류" },
  { k: "tap", a: "수도꼭지", b: "스위치" },
  { k: "wheel", a: "물레방아", b: "전구" },
];
interface View {
  level: 0 | 1 | 2;
  open: boolean;
  found: Set<PairKey>;
  hot: PairKey | null;
  spin: number;
  ph: number;
  /** 지금 시각(ms, 그리기 루프의 시각). 찾을 자리의 깜박임은 물이 멈춰도 이어진다. */
  now: number;
  /** 움직임 줄이기 설정이면 깜박이지 않고 은은한 빛만 둔다. */
  still: boolean;
  /** 빈 곳을 눌렀을 때 잠깐 더 밝게 짚어 주는 자리(i: 0 왼쪽 물길, 1 오른쪽 회로)와 시작 시각. */
  nudge: { k: PairKey; i: number; t0: number } | null;
}
type Rect = [number, number, number, number];
type Spot = { k: PairKey; i: number };
/** 빈 곳을 눌렀을 때 짚어 주는 시간. */
const NUDGE_MS = 1500;
/** 가로 화면 위쪽의 상태 줄(.g2u7x-wsay, 50~82px)에 이름표가 가리지 않게 이보다 아래에 쓴다. */
const SAFE_TOP = 92;
/** 누르는 자리: 그린 상자에 여유 6px을 두르고, 그래도 48px보다 작으면 가운데를 두고 48px까지 넓힌다. */
function hitBox(r: Rect): Rect {
  const w = Math.max(r[2] + 12, 48);
  const h = Math.max(r[3] + 12, 48);
  return [r[0] + r[2] / 2 - w / 2, r[1] + r[3] / 2 - h / 2, w, h];
}
/** 점에서 상자까지의 거리(안이면 0). */
function gapTo(p: { x: number; y: number }, r: Rect): number {
  return Math.hypot(Math.max(r[0] - p.x, 0, p.x - r[0] - r[2]), Math.max(r[1] - p.y, 0, p.y - r[1] - r[3]));
}
/** 누른 점이 받히는 자리. 여유가 겹치면 그린 상자에 더 가까운 자리. */
function pickSpot(hits: Record<PairKey, Rect[]>, p: { x: number; y: number }): Spot | null {
  let best: Spot | null = null;
  let bestD = Infinity;
  for (const { k } of PAIRS)
    (hits[k] ?? []).forEach((r, i) => {
      const b = hitBox(r);
      if (p.x < b[0] || p.x > b[0] + b[2] || p.y < b[1] || p.y > b[1] + b[3]) return;
      const d = gapTo(p, r);
      if (d < bestD) {
        best = { k, i };
        bestD = d;
      }
    });
  return best;
}
/** 아직 찾지 않은 자리 가운데 누른 점에 가장 가까운 자리. */
function nearestOpen(hits: Record<PairKey, Rect[]>, found: Set<PairKey>, p: { x: number; y: number }): Spot | null {
  let best: Spot | null = null;
  let bestD = Infinity;
  for (const { k } of PAIRS) {
    if (found.has(k)) continue;
    (hits[k] ?? []).forEach((r, i) => {
      const d = gapTo(p, r);
      if (d < bestD) {
        best = { k, i };
        bestD = d;
      }
    });
  }
  return best;
}
/** 아직 찾지 않은 자리: 은은하게 깜박이는 점선 상자. 짚어 주는 자리는 더 밝은 실선과 퍼지는 고리. */
function drawGlow(ctx: CanvasRenderingContext2D, r: Rect, v: View, nudged: boolean): void {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(r[0], r[1], r[2], r[3], 10);
  if (nudged && v.nudge) {
    const age = Math.min(1, Math.max(0, (v.now - v.nudge.t0) / NUDGE_MS));
    const fade = age < 0.75 ? 1 : 1 - (age - 0.75) / 0.25;
    ctx.fillStyle = `rgba(255,255,255,${0.16 * fade})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.22 * fade})`;
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.6 * fade})`;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    if (!v.still) {
      const q = (age * 2) % 1; // 고리가 두 번 퍼진다
      const g = 4 + q * 16;
      ctx.beginPath();
      ctx.roundRect(r[0] - g, r[1] - g, r[2] + g * 2, r[3] + g * 2, 10 + g);
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - q) * fade})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else {
    const p = v.still ? 0.5 : 0.5 + 0.5 * Math.sin((v.now / 1700) * Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.02 + 0.05 * p})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.04 + 0.09 * p})`;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.4 * p})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.restore();
}

/** 두 그림을 w×h 판에 그린다. 눌러 찾을 자리(왼쪽 그림과 오른쪽 그림 각각)를 돌려준다.
 *  live(가로 화면)이면 찾을 자리의 힌트와 찾은 자리의 이름표를 함께 그린다. 세로 화면의 작은 그림에는 힌트를 두지 않는다(눌러도 반응이 없어서).
 *  그림: 물길은 투명한 위아래 물통, 아래 물통에 잠긴 파란 펌프, 하늘색 관, 노란 물레방아로 그린다(정밀 그림 g2u7l5f1과 같은 부품과 색).
 *    짝은 왼쪽에서 오른쪽으로 같은 차례다: 펌프 ↔ 전지(왼쪽), 수도꼭지 ↔ 스위치(위 가운데), 물이 떨어지는 곳 ↔ 전구(오른쪽).
 *    높이 차는 위 물통 수면과 아래 물통 수면 사이의 화살표, 전압은 위 전선과 아래 전선 사이의 화살표다.
 *    회로의 전선은 높이 색으로 칠한다(병렬 전압 랩과 같은 약속): 전지 (+)극에서 전구 앞까지 높은 색(빨강), 전구 뒤에서 (−)극까지 낮은 색(파랑).
 *    스위치를 열면 스위치 뒤부터 전구까지도 낮은 색이다(전구를 지나 (−)극과 이어져 있다. 수도꼭지를 잠그면 꼭지 뒤 물길이 비는 것과 같다).
 *    전압 화살표에는 값(전지 하나 1.5 V, 둘 3 V)을 쓴다. 높이 차는 낮음, 높음으로만 보이고 수치는 전압에만 쓴다(옛 3D판의 약속). */
function drawPair(ctx: CanvasRenderingContext2D, w: number, h: number, v: View, live: boolean): Record<PairKey, Rect[]> {
  const big = w > 500;
  const fs = big ? 13.5 : 12;
  const pw = w / 2;
  const base = h * (big ? 0.68 : 0.84);
  // 세로 화면의 작은 그림(346×230)은 블록을 높게 세워 무대 위쪽 빈자리를 쓴다
  const rise = h * (big ? 0.18 : 0.3) + (v.level === 2 ? h * (big ? 0.12 : 0.17) : 0);
  const top = base - rise;
  const on = v.level > 0 && v.open;
  const hits = {} as Record<PairKey, Rect[]>;
  /** 눌러 찾을 자리. side가 "right"면 이름표를 상자 오른쪽에 쓴다(위에 쓰면 다른 것에 걸리는 자리).
   *  오른쪽 이름표가 maxX를 넘으면(좁은 무대) 상자 위 가장자리에 붙여 쓴다. */
  const mark = (k: PairKey, r: Rect, name: string, side: "up" | "right" = "up", maxX = Infinity): void => {
    const i = (hits[k] ??= []).push(r) - 1;
    const done = v.found.has(k);
    if (live && !done) drawGlow(ctx, r, v, v.nudge?.k === k && v.nudge.i === i);
    if (v.hot === k || done) {
      ctx.save();
      ctx.strokeStyle = v.hot === k ? "#FFE08A" : "rgba(255,224,138,.45)";
      ctx.lineWidth = v.hot === k ? 2.5 : 1.5;
      ctx.setLineDash(v.hot === k ? [] : [5, 4]);
      ctx.beginPath();
      ctx.roundRect(r[0], r[1], r[2], r[3], 10);
      ctx.stroke();
      ctx.restore();
    }
    if (live && done) {
      let fits = side === "right";
      if (fits && maxX < Infinity) {
        ctx.save();
        ctx.font = `800 ${fs}px Pretendard, system-ui, sans-serif`; // xText와 같은 글꼴로 잰다
        fits = r[0] + r[2] + 6 + ctx.measureText(name).width <= maxX;
        ctx.restore();
      }
      if (fits) xText(ctx, name, r[0] + r[2] + 6, r[1] + r[3] / 2, { px: fs, color: "#FFE08A", w: 800, align: "left" });
      else xText(ctx, name, r[0] + r[2] / 2, Math.max(r[1] - (side === "right" ? 2 : 9), SAFE_TOP), { px: fs, color: "#FFE08A", w: 800 });
    }
  };
  // 두 그림이 함께 쓰는 자리(그림 반쪽 안의 x): 전지, 전압, 수도꼭지·스위치, 물이 떨어지는 곳·전구
  const px = pw * 0.2;
  const fx = pw * 0.78;
  const tx = (px + fx) / 2;
  const gx = pw * 0.4;
  const ox = pw; // 오른쪽 그림(회로)의 시작
  // ── 왼쪽: 물길. 부품과 색은 정밀 그림 g2u7l5f1과 같다(투명한 위아래 물통, 아래 물통에 잠긴 파란 펌프, 하늘색 관, 노란 물레방아).
  //   펌프가 아래 물통의 물을 올리는 관(맨 왼쪽)으로 위 물통에 붓고, 위 물통 오른쪽 관의 수도꼭지를 지나 물이 떨어지며 물레방아를 돌리고 아래 물통으로 돌아온다.
  //   어두운 무대라 유리와 물은 정밀 그림보다 옅게 깐다(뒷유리 rgba(190,220,245,.08), 물 #BFE6FB → #7CC2EC를 85%로).
  const PIPE = "#6CC0F4";
  const PIPE_LINE = "#2B78BE";
  const RIM = "#8FB0CC";
  const pipeW = big ? 9 : 6;
  /** 관: 테두리 → 바탕(물이 차면 하늘색, 비면 옅은 회청) → 가운데 빛줄 */
  const tubeLine = (pts: [number, number][], filled: boolean): void => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = PIPE_LINE;
    ctx.lineWidth = pipeW + 3;
    ctx.stroke();
    ctx.strokeStyle = filled ? PIPE : "rgba(143,164,194,.4)";
    ctx.lineWidth = pipeW;
    ctx.stroke();
    ctx.strokeStyle = "rgba(236,248,255,.55)";
    ctx.lineWidth = Math.max(1.2, pipeW * 0.22);
    ctx.stroke();
    ctx.restore();
  };
  /** 위가 열린 유리 물통: 뒷유리, 물(수면 surf부터 바닥까지), 수면 선, 세 벽 */
  const glassTank = (x0: number, y0: number, x1: number, y1: number, surf: number): void => {
    ctx.save();
    ctx.fillStyle = "rgba(190,220,245,.08)";
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (surf < y1 - 3) {
      const g = ctx.createLinearGradient(0, surf, 0, y1);
      g.addColorStop(0, "rgba(191,230,251,.85)");
      g.addColorStop(1, "rgba(124,194,236,.85)");
      ctx.fillStyle = g;
      ctx.fillRect(x0 + 1.5, surf, x1 - x0 - 3, y1 - surf - 1.5);
      ctx.strokeStyle = "#3D9BEA";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x0 + 1.5, surf);
      ctx.lineTo(x1 - 1.5, surf);
      ctx.stroke();
    }
    ctx.strokeStyle = RIM;
    ctx.lineWidth = big ? 2.4 : 1.8;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1, y0);
    ctx.stroke();
    ctx.restore();
  };
  // 자리(그림 반쪽 안의 x): 펌프와 올리는 관 0.08, 높이 차 0.14, 위 물통 0.2~0.42, 수도꼭지 tx, 물이 떨어지는 곳 fx
  const pumpX = pw * 0.08;
  const gapX = pw * 0.14;
  const tankL = pw * 0.2;
  const tankR = pw * 0.42;
  const pourX = pw * 0.27;
  const upSurf = v.level > 0 ? top - 16 : top - 1; // 펌프가 없으면 위 물통이 거의 비어 있다
  const loSurf = base - 6;
  // 아래 물통(펌프가 잠겨 있다)
  glassTank(pw * 0.03, base - 16, pw * 0.95, base + 18, loSurf);
  // 위 물통
  glassTank(tankL, top - 30, tankR, top + 4, upSurf);
  // 파란 펌프(아래 물통 바닥, 펌프가 둘이면 몸통이 크다). 아래쪽에 물 빨아들이는 틈 셋
  const pumpW = big ? 24 : 16;
  const pumpH = (big ? 18 : 13) + (v.level === 2 ? (big ? 6 : 4) : 0);
  const pumpY = base + 16 - pumpH / 2 - 2;
  ctx.save();
  ctx.globalAlpha = v.level > 0 ? 1 : 0.35;
  const pg = ctx.createLinearGradient(pumpX - pumpW / 2, 0, pumpX + pumpW / 2, 0);
  pg.addColorStop(0, "#8DB6F5");
  pg.addColorStop(0.5, "#2F6FDE");
  pg.addColorStop(1, "#1E4FA8");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(pumpX - pumpW / 2, pumpY - pumpH / 2, pumpW, pumpH, 5);
  ctx.fill();
  ctx.strokeStyle = "#173E85";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = "rgba(14,38,90,.55)";
  for (let i = -1; i <= 1; i++) ctx.fillRect(pumpX + i * pumpW * 0.24 - 1, pumpY + pumpH * 0.08, 2, pumpH * 0.32);
  ctx.restore();
  // 올리는 관(펌프 → 위로 → 위 물통 위에서 붓는다). 펌프가 돌면 관 속 물이 올라간다
  const riseTop = top - 40;
  tubeLine([[pumpX, pumpY - pumpH / 2], [pumpX, riseTop], [pourX, riseTop], [pourX, top - 26]], v.level > 0);
  if (v.level > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(236,248,255,.85)";
    const run = pumpY - pumpH / 2 - riseTop;
    for (let i = 0; i < 5; i++) {
      const y = pumpY - pumpH / 2 - (((v.ph * (on ? 1 : 0) * 26 + i * 22) % run) + 2);
      ctx.fillRect(pumpX - 1.5, y, 3, 6);
    }
    ctx.restore();
  }
  // 위 물통으로 쏟아지는 물(펌프가 돌 때)
  if (v.level > 0) {
    ctx.fillStyle = "rgba(108,192,244,.85)";
    ctx.fillRect(pourX - 2.5, top - 26, 5, upSurf - (top - 26));
  }
  // 위 물통 오른쪽 관: 수도꼭지 앞은 펌프가 돌면 차 있고, 꼭지 뒤는 꼭지를 열어야 찬다
  tubeLine([[tankR, top - 2], [tx, top - 2]], v.level > 0);
  tubeLine([[tx, top - 2], [fx + 5, top - 2], [fx + 5, top + 8]], on);
  // 수도꼭지
  xBox(ctx, tx - 4, top - 18, 8, 12, 2, "#B9C4D4", "#66738A");
  xBox(ctx, tx - 13, top - 24, 26, 7, 3, v.open ? "#37C08E" : "#F25757", "#3A465C");
  if (!v.open) xBox(ctx, tx - 2, top - 7, 4, 10, 1, "#3A465C");
  // 떨어지는 물과 노란 물레방아(물줄기가 바퀴의 오른쪽 판에 닿는다)
  const wy = (top + base) / 2 + 4;
  const wr = Math.min(rise * 0.42, big ? 34 : 22);
  if (on) {
    ctx.fillStyle = "rgba(108,192,244,.85)";
    ctx.fillRect(fx + 2, top + 8, 6, loSurf - (top + 8));
  }
  ctx.save();
  ctx.translate(fx - wr * 0.55, wy);
  ctx.rotate(v.spin);
  const ring = wr * 0.8;
  ctx.strokeStyle = "#B07A00";
  ctx.lineWidth = big ? 2 : 1.5;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * ring, Math.sin(a) * ring);
    ctx.stroke();
  }
  ctx.lineWidth = big ? 3 : 2.2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * ring, Math.sin(a) * ring);
    ctx.lineTo(Math.cos(a) * (wr + 3), Math.sin(a) * (wr + 3));
    ctx.stroke();
  }
  ctx.strokeStyle = "#FFD43B";
  ctx.lineWidth = big ? 5 : 3.6;
  ctx.beginPath();
  ctx.arc(0, 0, ring, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#E0A800";
  ctx.lineWidth = 1.1;
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(0, 0, ring + d * (big ? 2.6 : 1.9), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#6C757D";
  ctx.beginPath();
  ctx.arc(fx - wr * 0.55, wy, big ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();
  // 높이 차: 위 물통 수면에서 아래 물통 수면까지(위 수면은 물통 왼쪽 벽에서 점선으로 끌어온다)
  if (v.level > 0) {
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#7C8796";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tankL, upSurf);
    ctx.lineTo(gapX - 5, upSurf);
    ctx.stroke();
    ctx.restore();
    xArrow(ctx, gapX, upSurf + 3, gapX, loSurf - 2, "rgba(232,238,249,.8)", 1.8, 6);
    xArrow(ctx, gapX, loSurf - 5, gapX, upSurf, "rgba(232,238,249,.8)", 1.8, 6);
  }
  if (on) {
    xArrow(ctx, tx + 40, top - 16, tx + 68, top - 16, PIPE, 2.2, 7);
    xArrow(ctx, pw * 0.62, base + 6, pw * 0.46, base + 6, "#1864AB", 2.2, 7);
  }
  // ── 오른쪽: 전기 회로(물길과 같은 자리) ──
  const L = ox + px;
  const Rr = ox + fx;
  const tc = ox + tx;
  const T = top - 5; // 위 물길의 가운데 높이
  const B = base + 6; // 아래 물길의 가운데 높이
  const mid = (T + B) / 2;
  const flow = v.ph * 0.5;
  const ww = big ? 4 : 3;
  const hi = v.level > 0 ? C.hi : undefined; // 높은 쪽(전지 (+)극 쪽)
  const lo = v.level > 0 ? C.lo : undefined; // 낮은 쪽(전지 (−)극 쪽)
  const br = big ? 22 : 16; // 전구 반지름
  const bulbTop = mid - br - 2;
  const bulbBot = mid + br * 1.33;
  // 전지: 왼쪽 면에 세워 둔다((+)극이 위). 하나면 1.5 V, 둘을 이으면 3 V
  const span = B - T;
  const cellL = v.level === 2 ? Math.min(46, (span - 22) / 2) : Math.min(58, span - 26);
  const cellW = big ? 24 : 20;
  const batTop = mid - (v.level === 2 ? cellL + 5 : cellL / 2 + 5);
  const batBot = mid + (v.level === 2 ? cellL : cellL / 2);
  const wire = (pts: [number, number][], color: string | undefined): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on, flow, dir: 1, width: ww, color });
  wire([[L, v.level > 0 ? batTop : mid - 30], [L, T], [tc - 24, T]], hi);
  wire([[tc + 24, T], [Rr, T], [Rr, bulbTop]], v.open ? hi : lo);
  wire([[Rr, bulbBot], [Rr, B], [L, B], [L, v.level > 0 ? batBot : mid + 30]], lo);
  drawSwitch(ctx, tc, T, v.open, 48);
  drawBulb(ctx, Rr, mid, br, on ? v.level / 2 : 0);
  if (v.level === 0) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#8FA4C2";
    ctx.strokeRect(L - 12, mid - 28, 24, 56);
    ctx.restore();
  } else if (v.level === 1) drawBattery(ctx, L, mid, cellL, cellW, false, true);
  else {
    drawBattery(ctx, L, mid - cellL / 2 - 2, cellL, cellW, false, true);
    drawBattery(ctx, L, mid + cellL / 2 + 2, cellL, cellW, false, true);
  }
  // 전압: 위 전선(높음)과 아래 전선(낮음) 사이의 화살표와 값. 물길의 높이 차와 같은 자리
  const vx = ox + gx;
  if (v.level > 0) {
    xArrow(ctx, vx, T + 8, vx, B - 5, C.volt, 1.8, 6);
    xArrow(ctx, vx, B - 8, vx, T + 5, C.volt, 1.8, 6);
    const tw = big ? 50 : 42;
    xBox(ctx, vx - tw / 2, mid - 11, tw, 22, 11, "rgba(11,21,36,.94)", C.volt, 1.4);
    xText(ctx, v.level === 2 ? "3 V" : "1.5 V", vx, mid + 0.5, { px: big ? 13 : 12, color: C.volt, w: 800 });
  }
  if (on) xArrow(ctx, tc + 46, T - 13, tc + 74, T - 13, X.cur, 2.2, 7);
  // 가운데 금
  ctx.strokeStyle = "rgba(143,164,194,.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pw, h * 0.12);
  ctx.lineTo(pw, base + 30);
  ctx.stroke();
  xText(ctx, "물길", pw * 0.5, big ? base + 44 : 16, { px: fs + 1, w: 800 });
  xText(ctx, "전기 회로", ox + pw * 0.5, big ? base + 44 : 16, { px: fs + 1, w: 800 });
  // 높이 색의 뜻(회로 쪽 바닥 아래, 큰 그림에서만)
  if (big && v.level > 0) {
    xText(ctx, "높음", L + 44, T - 13, { px: 12, color: C.hi, w: 800 });
    xText(ctx, "낮음", ox + pw * 0.62, B + 18, { px: 12, color: C.lo, w: 800 });
  }
  // 눌러 찾을 자리(왼쪽, 오른쪽). 두 그림이 같은 자리다. 높이 차와 전압 상자는 위아래 화살표를 다 감싸고, 수도꼭지 상자는 꼭지 가운데에 둔다.
  // 스위치 상자는 들린 손잡이까지만(아래로 길면 전압 상자 오른쪽 빈 곳을 눌렀을 때 스위치가 더 가까워진다).
  // 이름표를 상자 오른쪽에 쓰는 넷: 높이 차와 전압(위에 쓰면 관과 전선에 걸린다. 물레방아, 전구 상자까지 자리가 모자라면 상자 위 가장자리),
  // 물의 흐름과 전류(수도꼭지, 스위치 이름표와 붙어 한 말로 읽힌다. 위에 쓰면 폰에서 상태 줄에 가린다).
  mark("pump", [pumpX - 20, pumpY - pumpH / 2 - 8, 40, pumpH + 14], "펌프");
  mark("pump", [L - 22, T + 4, 44, B - T - 8], "전지");
  mark("gap", [gapX - 16, upSurf - 2, 32, loSurf - upSurf + 2], "높이 차", "right", fx - wr * 0.55 - wr - 4);
  mark("gap", [vx - 25, T + 12, 50, B - T - 18], "전압", "right", Rr - 26);
  mark("flow", [tx + 38, top - 34, 46, 30], "물의 흐름", "right");
  mark("flow", [tc + 38, T - 29, 46, 30], "전류", "right");
  mark("tap", [tx - 22, top - 40, 44, 44], "수도꼭지");
  mark("tap", [tc - 24, T - 30, 48, 36], "스위치");
  // 물레방아와 전구의 이름표는 상자 오른쪽(위에 쓰면 물의 흐름, 전류 이름표와 포개졌다). 자리가 모자라면(좁은 폰) 상자 위 가장자리
  mark("wheel", [fx - wr * 0.55 - wr - 4, wy - wr - 4, wr * 2 + 8, wr * 2 + 8], "물레방아", "right", pw - 4);
  mark("wheel", [Rr - 24, mid - br - 4, 48, br * 2.4 + 8], "전구", "right", w - 6);
  return hits;
}

export const waterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const v: View = { level: 1, open: true, found: new Set(), hot: null, spin: 0, ph: 0, now: 0, still, nudge: null };
  const tried = { off: false, strong: false };
  let rot: RotateStage | null = null;
  let rotLoop: Loop | null = null;
  let finished = false;
  let asked = false;

  const tick = (dt: number): void => {
    const on = v.level > 0 && v.open;
    v.ph += (dt / 60) * (on ? v.level : 0);
    v.spin += (dt / 60) * (on ? v.level * 1.6 : 0);
  };
  st.run((ctx, w, h, t, dt) => {
    if (!rot) {
      tick(dt);
      v.now = t;
    }
    drawPair(ctx, w, h, v, false);
  });

  const go = bvBtn("main", "가로 화면으로 넓게 실험하기");
  f.slot.setControls(go);
  const missionDone = (): boolean => v.found.size === PAIRS.length && tried.off && tried.strong;

  go.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    void enter();
  });

  async function enter(): Promise<void> {
    if (rot) return;
    const { enterRotateStage } = await import("../../../ui/rotateStage");
    if (!tm.alive()) return;
    rot = enterRotateStage({ title: "빛나는 요소를 눌러 역할이 같은 짝을 찾아보세요", onLeave: leave });
    const cv = el("canvas", { class: "g2u7x-wcv" }) as HTMLCanvasElement;
    const status = el("div", { class: "g2u7x-wsay" });
    const lv = xSegs(
      [
        { k: "0", t: "펌프·전지 없음" },
        { k: "1", t: "기본(1단)" },
        { k: "2", t: "세게(2단)" },
      ],
      String(v.level) as "0" | "1" | "2",
      (k) => {
        v.level = Number(k) as 0 | 1 | 2;
        if (v.level === 2) tried.strong = true;
        if (v.level === 0) tried.off = true;
        say();
      },
    );
    const tapBtn = el("button", { class: "g2u7x-wtap", text: "수도꼭지 잠그기 · 스위치 열기", attrs: { type: "button" } }) as HTMLButtonElement;
    tapBtn.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      v.open = !v.open;
      if (!v.open) tried.off = true;
      tapBtn.textContent = v.open ? "수도꼭지 잠그기 · 스위치 열기" : "수도꼭지 열기 · 스위치 닫기";
      say();
    });
    const bar = el("div", { class: "g2u7x-wbar" }, lv.el, tapBtn);
    rot.stage.append(cv, status, bar);
    let hits = {} as Record<PairKey, Rect[]>;
    const say = (msg?: string): void => {
      const left = PAIRS.filter((p) => !v.found.has(p.k)).length;
      const on = v.level > 0 && v.open;
      const idle = left ? "빛나는 곳을 눌러 짝을 찾아보세요." : "짝을 모두 찾았어요.";
      const base = msg ?? (!on ? (v.level === 0 ? "펌프도 전지도 없어 물도 전류도 흐르지 않아요." : "수도꼭지를 잠그고 스위치를 열자 물도 전류도 멈췄어요.") : v.level === 2 ? "높이 차가 커지자 물이 세게 흐르고 전구도 더 밝아요." : idle);
      const todo = [left ? `<b>남은 짝 ${left}개</b>` : "", tried.strong ? "" : "세게(2단) 켜 보기", tried.off ? "" : "흐름 멈춰 보기"].filter(Boolean).join(" · ");
      status.innerHTML = missionDone() ? "다섯 짝과 조건 변화를 모두 확인했어요! <b>세로로 돌아가기</b>를 눌러 마무리해 보세요." : `${base} ${todo}`;
      status.dataset.done = missionDone() ? "1" : "0";
    };
    cv.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      const spot = pickSpot(hits, p);
      if (spot) {
        const pair = PAIRS.find((q) => q.k === spot.k)!;
        haptic(v.found.has(pair.k) ? HAPTIC.tap : HAPTIC.correct);
        v.found.add(pair.k);
        v.hot = pair.k;
        v.nudge = null;
        say(`물길의 <b>${pair.a}</b>에 해당하는 전기 회로 요소는 <b>${pair.b}</b>${xJosa(pair.b, "이에요", "예요")}!`);
        return;
      }
      // 빈 곳: 가장 가까운 남은 자리를 잠깐 더 밝게 짚어 준다(짝이 무엇인지는 알려 주지 않는다)
      const near = nearestOpen(hits, v.found, p);
      if (!near) return;
      haptic(HAPTIC.tap);
      v.nudge = { ...near, t0: performance.now() };
      say("흰 점선으로 빛나는 요소를 눌러야 짝을 확인할 수 있어요.");
    });
    if (import.meta.env.DEV) {
      const dev = cv as unknown as { __hits: () => unknown; __hint: () => unknown };
      dev.__hits = () => hits;
      // 검사용: 지금 빛나는 자리("짝:쪽"), 짚어 주는 자리, 누르는 자리(여유를 넣은 상자)
      dev.__hint = () => ({
        glow: PAIRS.filter((p) => !v.found.has(p.k)).flatMap((p) => (hits[p.k] ?? []).map((_, i) => `${p.k}:${i}`)),
        nudge: v.nudge ? `${v.nudge.k}:${v.nudge.i}` : null,
        boxes: PAIRS.flatMap((p) => (hits[p.k] ?? []).map((r) => hitBox(r))),
      });
    }
    say();
    rotLoop = createLoop((dt, t) => {
      if (!rot) return;
      const { w, h } = rot.size();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) {
        cv.width = Math.round(w * d);
        cv.height = Math.round(h * d);
        cv.style.width = `${w}px`;
        cv.style.height = `${h}px`;
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, w, h);
      tick(dt);
      v.now = t;
      if (v.nudge && t - v.nudge.t0 > NUDGE_MS) v.nudge = null;
      // 넓은 화면이면 설계 판에 그려 통째로 키운다. 누르는 자리도 같은 배율로 화면 좌표로 옮긴다
      const fit = fitDesign(w, h);
      ctx.setTransform(d * fit.k, 0, 0, d * fit.k, d * fit.ox, d * fit.oy);
      const drawn = drawPair(ctx, fit.lw, fit.lh, v, true);
      hits = {} as Record<PairKey, Rect[]>;
      for (const { k } of PAIRS) hits[k] = (drawn[k] ?? []).map((r) => [fit.ox + r[0] * fit.k, fit.oy + r[1] * fit.k, r[2] * fit.k, r[3] * fit.k] as Rect);
      cv.dataset.k = fit.k.toFixed(2);
    }).start();
  }
  function leave(): void {
    rotLoop?.stop();
    rotLoop = null;
    rot?.dispose();
    rot = null;
    v.hot = null;
    v.nudge = null;
    f.pips(missionDone() ? 1 : 0);
    if (missionDone() && !asked) {
      asked = true;
      finished = true;
      v.level = 1;
      v.open = true;
      tm.later(ask1, 500);
    } else if (!finished) {
      // 짝이 남았으면 빛나는 곳으로, 짝은 다 찾았으면 아직 안 해 본 조작으로 안내한다
      const rest = !tried.strong && !tried.off ? "세게(2단) 켜 보기와 흐름 멈춰 보기를 해 보세요" : !tried.strong ? "세게(2단) 켜 보기를 해 보세요" : "흐름 멈춰 보기를 해 보세요";
      f.say(v.found.size < PAIRS.length ? "아직 찾지 못한 짝이 있어요. <b>가로 화면</b>에서 빛나는 곳을 모두 눌러 보세요." : `짝은 다 찾았어요. <b>가로 화면</b>에서 ${rest}.`);
    }
  }
  function ask1(): void {
    f.say("물길 모형과 전기 회로의 닮은 점을 모두 비교해 보았어요!");
    f.slot.ask(
      "전기 회로에서 물길의 '펌프'와 같은 역할을 하는 것은 무엇인가요?",
      [{ t: "전지", ok: true }, { t: "전구" }, { t: "스위치" }],
      (ok) => api.recordQuiz(ok),
      { why: "펌프가 높이 차를 만들어 물을 계속 흐르게 하듯, <b>전지</b>는 전압을 만들어 전류를 계속 흐르게 해요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(2);
    f.slot.ask(
      "펌프를 세게 작동시켜 물의 높이 차가 커졌을 때 물의 흐름은 어떻게 변했나요?",
      [{ t: "더 세게 흘렀어요", ok: true }, { t: "그대로였어요" }, { t: "더 약하게 흘렀어요" }],
      () => undefined,
      { why: "높이 차(전압)가 커지면 물의 흐름(전류)이 세져요. 회로에서도 전지를 2개로 늘리자 <b>전구가 더 밝아졌어요</b>.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("물의 높이 차가 물을 흐르게 하듯, 전압이 전류를 흐르게 한다는 것을 확인했어요!");
    f.slot.conclude("펌프가 물의 <b>높이 차</b>를 유지해 물을 계속 흐르게 하듯, 전지는 <b>전압</b>을 유지해 전류를 계속 흐르게 해요. 이처럼 전류를 흐르게 하는 능력을 <b>전압</b>(단위 V)이라고 해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.say("왼쪽은 물길 모형, 오른쪽은 전기 회로예요. <b>가로 화면</b>을 열어 빛나는 요소를 누르며 같은 역할을 하는 짝을 찾아보세요.");
  api.setCTA("가로 화면에서 다섯 짝을 찾아보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
    rotLoop?.stop();
    rot?.dispose();
    rot = null;
  };
};
