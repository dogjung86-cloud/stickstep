// [중2 Ⅶ v5] 자기 랩(코일과 나침반, 오른손으로 N극 찾기, 손바닥으로 힘 찾기)이 함께 쓰는 그림: 코일, 나침반, 막대자석.
// 코일의 약속: dir = 1이면 코일 속 자기장이 오른쪽을 향하고, 이때 앞쪽(보는 사람 쪽)의 전류 화살표는 아래를 향한다.
//   오른손 네 손가락을 앞쪽에서 아래로 감아 쥐면 엄지가 오른쪽을 가리킨다. dir = -1이면 앞쪽 전류는 위, 자기장은 왼쪽.

import { X, xArrow, xBox, xText } from "./kit";

/** 코일(감은 전선 아홉 바퀴). cur가 true면 앞쪽에 전류 화살표를 그린다. */
export function mCoil(ctx: CanvasRenderingContext2D, cx: number, cy: number, o: { cur?: boolean; dir?: 1 | -1 } = {}): void {
  const x0 = cx - 49;
  for (let i = 0; i < 9; i++) {
    const x = x0 + i * 12.2;
    ctx.strokeStyle = "#7A4B1E";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, cy, 7, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#D9944A";
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }
  if (o.cur) {
    const dir = o.dir ?? 1;
    for (const i of [0, 4, 8]) {
      const x = x0 + i * 12.2 + 7;
      const y0 = cy - dir * 13;
      const y1 = cy + dir * 13;
      xArrow(ctx, x, y0, x, y1, "#6E3F16", 5, 11);
      xArrow(ctx, x, y0, x, y1, X.cur, 2.4, 8);
    }
  }
}

/** 나침반. ang은 N극(빨간 끝)이 가리키는 방향(라디안, 화면 좌표). */
export function mCompass(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, r = 17): void {
  ctx.save();
  ctx.fillStyle = "#F4F7FB";
  ctx.strokeStyle = "#5C6A82";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const n = r - 3;
  for (const [c, s] of [["#E0503A", 1], ["#3D8FE8", -1]] as [string, number][]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(s * n, 0);
    ctx.lineTo(0, -4.5);
    ctx.lineTo(0, 4.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** 나침반을 놓을 빈 자리(점선). mark가 있으면 가운데에 글자를 쓴다. */
export function mSlot(ctx: CanvasRenderingContext2D, x: number, y: number, mark?: string, r = 17): void {
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(232,238,249,.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  if (mark) xText(ctx, mark, x, y + 0.5, { px: 14, color: X.dim, w: 800 });
}

/** 막대자석(가로). nRight면 오른쪽 끝이 N극. */
export function mBar(ctx: CanvasRenderingContext2D, cx: number, cy: number, nRight: boolean, w = 110, h = 40): void {
  const nC = "#E0503A";
  const sC = "#3D8FE8";
  xBox(ctx, cx - w / 2, cy - h / 2, w / 2, h, 6, nRight ? sC : nC, "rgba(255,255,255,.3)");
  xBox(ctx, cx, cy - h / 2, w / 2, h, 6, nRight ? nC : sC, "rgba(255,255,255,.3)");
  xText(ctx, nRight ? "S" : "N", cx - w / 4, cy + 0.5, { px: 15, w: 800, color: "#fff" });
  xText(ctx, nRight ? "N" : "S", cx + w / 4, cy + 0.5, { px: 15, w: 800, color: "#fff" });
}
