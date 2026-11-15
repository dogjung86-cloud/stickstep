// [중2 Ⅶ v5] 자기 랩(코일과 나침반, 오른손으로 N극 찾기, 손바닥으로 힘 찾기)이 함께 쓰는 그림: 코일, 나침반, 막대자석.
// 코일의 약속: dir = 1이면 코일 속 자기장이 오른쪽을 향하고, 이때 앞쪽(보는 사람 쪽)의 전류 화살표는 아래를 향한다.
//   오른손 네 손가락을 앞쪽에서 아래로 감아 쥐면 엄지가 오른쪽을 가리킨다. dir = -1이면 앞쪽 전류는 위, 자기장은 왼쪽.

import { X, xArrow, xBox, xText } from "./kit";

// 코일 그림(2026-11-15 그래픽 감사 C103): 비스듬히 본 나선. 앞 가닥(보는 사람 쪽)은 굵고 밝게 코일 몸통을 가로지르고, 뒤 가닥은 가늘고 어둡게
//   몸통 뒤에 일부 가린다(정리 카드의 정밀 그림 '코일과 막대자석의 자기장'과 같은 결). 전류 화살표는 앞 가닥 위에 그 가닥 방향으로 얹는다.
//   나선: 감은 각 θ에서 x = x0 + PITCH·(θ − π)/2π + BULGE·sinθ, y = cy − RY·cosθ. sinθ > 0이면 앞 가닥, < 0이면 뒤 가닥이다.
//   θ가 커지는 쪽으로 흐르면 앞 가닥에서 아래로 흐른다(dir = 1). 오른손 네 손가락을 앞쪽에서 아래로 감아 쥐면 엄지가 오른쪽(+x)이라 오른쪽 끝이 N극이다.
//   나선은 왼쪽 아래(θ = π, 뒤 가닥의 시작)에서 시작해 오른쪽 아래(앞 가닥의 끝)에서 끝난다. 두 끝에 전선을 잇는다(mCoilEnds).
const TURNS = 9;
const PITCH = 12.2;
const RY = 22;
const BULGE = 9;
const helix = (x0: number, cy: number, th: number): [number, number] => [x0 + (PITCH * (th - Math.PI)) / (Math.PI * 2) + BULGE * Math.sin(th), cy - RY * Math.cos(th)];
/** 코일 두 끝(전선을 잇는 자리): 왼쪽 아래와 오른쪽 아래 */
export function mCoilEnds(cx: number, cy: number): { lx: number; rx: number; y: number } {
  const half = (TURNS * PITCH) / 2;
  return { lx: cx - half, rx: cx + half, y: cy + RY };
}
/** 코일(감은 전선 아홉 바퀴). cur가 true면 앞 가닥에 전류 화살표를 그린다. */
export function mCoil(ctx: CanvasRenderingContext2D, cx: number, cy: number, o: { cur?: boolean; dir?: 1 | -1 } = {}): void {
  const x0 = cx - (TURNS * PITCH) / 2;
  const strand = (t0: number, t1: number): void => {
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const [x, y] = helix(x0, cy, t0 + ((t1 - t0) * i) / 16);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  };
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // 뒤 가닥: 가늘고 어둡게
  for (let i = 0; i < TURNS; i++) {
    const t0 = Math.PI + i * Math.PI * 2;
    strand(t0, t0 + Math.PI);
    ctx.strokeStyle = "#4A2E14";
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.strokeStyle = "#86562A";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  // 코일 몸통(속이 빈 관이 비쳐 보이게 옅게): 뒤 가닥을 조금 가린다
  ctx.fillStyle = "rgba(11,21,36,.5)";
  ctx.beginPath();
  ctx.roundRect(x0 - 2, cy - RY + 4, TURNS * PITCH + 4, RY * 2 - 8, 6);
  ctx.fill();
  // 앞 가닥: 굵고 밝게
  for (let i = 0; i < TURNS; i++) {
    const t0 = Math.PI * 2 + i * Math.PI * 2;
    strand(t0, t0 + Math.PI);
    ctx.strokeStyle = "#6E3F16";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = "#E8A35A";
    ctx.lineWidth = 3.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,228,190,.65)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
  ctx.restore();
  if (o.cur) {
    // 앞 가닥 셋 위에 그 가닥 방향으로. 머리가 가운데(코일 속 자기장 화살표가 지나는 줄)에서 멀어지는 쪽 절반에 둔다
    // (아래로 흐르면 아래 절반, 위로 흐르면 위 절반)
    const dir = o.dir ?? 1;
    for (const i of [1, 4, 7]) {
      const mid = Math.PI * 2.5 + i * Math.PI * 2;
      const a = helix(x0, cy, mid + dir * 0.16);
      const b = helix(x0, cy, mid + dir * 1.2);
      xArrow(ctx, a[0], a[1], b[0], b[1], "#6E3F16", 5.4, 12);
      xArrow(ctx, a[0], a[1], b[0], b[1], X.cur, 2.6, 9);
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
