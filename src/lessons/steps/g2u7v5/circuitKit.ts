// [중2 Ⅶ v5] g2u7l5 직렬·병렬 랩 넷이 함께 쓰는 회로 부품.
// 도선과 전류 알갱이는 ui/elecKit의 drawWire를 그대로 쓰고, 여기에는 그 위에 얹는 것만 둔다:
// 저항, 계기의 값 표, 계기를 댈 자리(점선), 도선에 입히는 색(전지의 어느 극에 이어졌는지), 알갱이를 세는 문.
// 회로 좌표는 무대 346×230 기준이다. 전지는 아래 가운데에 (+)극을 오른쪽으로 두고, 전류는 오른쪽으로 나와 위를 돌아 왼쪽으로 들어간다.

import { xBox, xText } from "./kit";

export type Pt = [number, number];
export const C = {
  amp: "#FFD400", // 전류계의 값
  volt: "#9BE8C4", // 전압계의 값
  hi: "#FF8E7A", // (+)극에 이어진 도선
  lo: "#6FB6FF", // (−)극에 이어진 도선
  mid: "#C9A2FF", // 두 저항 사이의 도선(직렬)
};
/** 회로의 뼈대 좌표 */
export const G = { L: 44, R: 302, By: 192, bw: 84 };
/** 전지에서 나오는 도선과 들어가는 도선이 전지와 만나는 x */
export const BAT = { out: G.R - (G.R - G.L) / 2 + G.bw / 2, in: G.L + (G.R - G.L) / 2 - G.bw / 2, x: (G.L + G.R) / 2 };

/** 꺾은선의 길이 */
export function pathLen(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) s += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
  return s;
}
/** 꺾은선 위에서 처음부터 d만큼 간 점 */
export function pathAt(pts: Pt[], d: number): Pt {
  let left = d;
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (left <= len || i === pts.length - 2) {
      const t = len ? Math.min(1, left / len) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
    }
    left -= len;
  }
  return pts[pts.length - 1];
}

/** 저항: 세라믹 몸통에 띠. 이름표(예: "A")와 값("10 Ω")을 몸통 위아래에 쓴다. */
export function cRes(ctx: CanvasRenderingContext2D, x: number, y: number, o: { name?: string; ohm: string; w?: number; below?: boolean }): void {
  const w = o.w ?? 46;
  const h = 18;
  ctx.save();
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  g.addColorStop(0, "#F1DFB8");
  g.addColorStop(0.5, "#D9BC85");
  g.addColorStop(1, "#A8884F");
  ctx.fillStyle = g;
  ctx.strokeStyle = "#5C4520";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#8A4B2A";
  for (const dx of [-w * 0.24, 0, w * 0.24]) ctx.fillRect(x + dx - 2, y - h / 2 + 1.5, 4, h - 3);
  ctx.strokeStyle = "rgba(255,255,255,.6)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 6, y - h / 2 + 4);
  ctx.lineTo(x + w / 2 - 6, y - h / 2 + 4);
  ctx.stroke();
  ctx.restore();
  const ty = o.below ? y + 21 : y - 21;
  xText(ctx, o.name ? `${o.name}  ${o.ohm}` : o.ohm, x, ty, { px: 12.5, color: "#F4E3BD", w: 800 });
}

/** 밝은 면 위에 쓰는 글자(테두리 없이). */
export function cInk(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, px = 12): void {
  ctx.save();
  ctx.font = `800 ${px}px Pretendard, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** 계기의 값 표(둥근 상자). */
export function cTag(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, w = 52): void {
  xBox(ctx, x - w / 2, y - 11, w, 22, 11, "rgba(11,21,36,.94)", color);
  xText(ctx, text, x, y + 0.5, { px: 12.5, color, w: 800 });
}

/** 계기를 댈 자리: 숨 쉬듯 깜빡이는 점선 동그라미. */
export function cSpot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, tMs: number, r = 20): void {
  ctx.save();
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(tMs / 260);
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** 전압계를 댈 자리: 저항을 감싸는 점선 상자(이름표를 가리지 않는다). */
export function cSpotBox(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, tMs: number, w = 62, h = 27): void {
  ctx.save();
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(tMs / 260);
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 10);
  ctx.stroke();
  ctx.restore();
}

/** 도선에 색을 입힌다(처음부터 frac만큼). 전지의 어느 극에 이어진 도선인지 보일 때 쓴다. */
export function cPaint(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, frac = 1): void {
  if (frac <= 0) return;
  const total = pathLen(pts) * Math.min(1, frac);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 6.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let left = total;
  for (let i = 0; i < pts.length - 1 && left > 0; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    const t = len ? Math.min(1, left / len) : 0;
    ctx.lineTo(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t);
    left -= len;
  }
  ctx.stroke();
  ctx.restore();
}

/** 전압계를 댄 표시: 부품의 양 끝에서 값 표까지 가는 가는 선 두 줄. */
export function cProbe(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, tagY: number): void {
  ctx.save();
  ctx.strokeStyle = C.volt;
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.8;
  const cx = (x0 + x1) / 2;
  for (const x of [x0, x1]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, (y + tagY) / 2);
    ctx.lineTo(cx + (x < cx ? -14 : 14), tagY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = C.volt;
    ctx.fill();
  }
  ctx.restore();
}

/** 고른 자리에 가까운 것을 찾는다(무대 좌표). */
export function hit<T extends { x: number; y: number }>(spots: T[], x: number, y: number, r = 28): T | undefined {
  let best: T | undefined;
  let bd = r;
  for (const s of spots) {
    const d = Math.hypot(s.x - x, s.y - y);
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}
