// [중2 Ⅷ v5] g2u8l1의 시차 랩 셋(orbitLab, parallaxLab, parsecLab)이 함께 쓰는 그림 조각.
// '지구에서 본 밤하늘' 칸: 아주 먼 배경 별은 늘 같은 자리에 있고, 가까운 별만 그 사이에서 옮겨 보인다.

import { S, rnd, sBox, sGlow, sLine, sText } from "./kit";

/** 지구에서 본 밤하늘 칸. 배경 별은 seed가 같으면 늘 같은 자리. */
export function skyPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string, seed = 7): void {
  sBox(ctx, x, y, w, h, 10, "rgba(52,84,170,.22)", "rgba(143,180,255,.5)", 1.2);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 9);
  ctx.clip();
  for (let i = 0; i < 34; i++) {
    const px = x + 6 + rnd(seed + i * 3.1) * (w - 12);
    const py = y + 6 + rnd(seed + i * 7.7 + 1) * (h - 14);
    const big = i % 7 === 0;
    ctx.globalAlpha = big ? 0.85 : 0.3 + rnd(seed + i * 5.9) * 0.4;
    ctx.fillStyle = "#DCE6FF";
    ctx.beginPath();
    ctx.arc(px, py, big ? 1.7 : 0.6 + rnd(seed + i * 1.3 + 2) * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  sText(ctx, label, x + 9, y + 12, { color: S.dim, px: 12, align: "left" });
}

/** 밤하늘 칸의 아래쪽 눈금. cx를 가운데로 양쪽 n칸씩, 한 칸이 step px. */
export function skyTicks(ctx: CanvasRenderingContext2D, cx: number, y: number, step: number, n: number): void {
  for (let i = -n; i <= n; i++) sLine(ctx, cx + i * step, y - (i % 2 === 0 ? 7 : 5), cx + i * step, y, "rgba(214,226,255,.85)", 1.3);
}

/** 별이 보인 자리의 표시(빈 동그라미). */
export function skyMark(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r = 8): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** 두 자리 사이의 폭(양 끝에 짧은 세로 금). */
export function span(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, color: string, w = 2.2): void {
  sLine(ctx, x0, y, x1, y, color, w);
  sLine(ctx, x0, y - 4, x0, y + 4, color, w);
  sLine(ctx, x1, y - 4, x1, y + 4, color, w);
}

/** 꼭짓점 (x, y)에서 두 방향 a0, a1(라디안, 캔버스 각) 사이의 각을 호로 그린다. fill을 주면 부채꼴을 칠한다. */
export function angleArc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a0: number, a1: number, color: string, fill?: string): void {
  ctx.save();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, r, a0, a1);
  ctx.stroke();
  ctx.restore();
}

/** 밤하늘 칸에 보이는 별 S(빛 + 어느 때 본 것인지 알리는 색 테두리). */
export function skyStar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  sGlow(ctx, x, y, 8, color);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(x, y, 6.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
