// 물질 단원(IV) 랩 공용 소품 — 다크 무대 위 유리·금속 재질(파운드리 문법의 캔버스 버전).
// 원칙: 균일 단색 스트로크 금지 — ① 세로 그라데이션 유리벽 ② 좌상단 스펙큘러 스트릭
// ③ 바닥 접촉 그림자 ④ 수면·테두리 하이라이트. 모든 랩(diffusion·evaporation·
// sublimation·phaseVolume·matterShape 그릇)이 이 모듈만 쓴다.

const TAU = Math.PI * 2;

/** 바닥 접촉 그림자 — 소품이 무대에 "놓여 있게" 만드는 한 방. */
export function contactShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  alpha = 0.3,
): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  g.addColorStop(0, `rgba(3,9,20,${alpha})`);
  g.addColorStop(1, "rgba(3,9,20,0)");
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.22);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** 유리벽용 세로 그라데이션 스트로크 — 위 밝고 중간 가라앉고 아래 되살아나는 유리 특유의 톤. */
export function glassStrokeStyle(ctx: CanvasRenderingContext2D, y0: number, y1: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "rgba(216,234,255,.9)");
  g.addColorStop(0.45, "rgba(148,180,222,.42)");
  g.addColorStop(1, "rgba(190,216,248,.7)");
  return g;
}

export interface VesselBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** 윗면이 열린 유리 용기(비커·유리컵). 벽 그라데이션 + 안쪽 틴트 + 스펙큘러 + 림 틱. */
export function glassVessel(ctx: CanvasRenderingContext2D, b: VesselBounds): void {
  const r = 9; // 바닥 라운드
  // 안쪽 유리 틴트
  ctx.fillStyle = "rgba(190,220,255,.05)";
  ctx.beginPath();
  ctx.moveTo(b.x0, b.y0);
  ctx.lineTo(b.x0, b.y1 - r);
  ctx.quadraticCurveTo(b.x0, b.y1, b.x0 + r, b.y1);
  ctx.lineTo(b.x1 - r, b.y1);
  ctx.quadraticCurveTo(b.x1, b.y1, b.x1, b.y1 - r);
  ctx.lineTo(b.x1, b.y0);
  ctx.closePath();
  ctx.fill();
  // 벽(그라데이션, 위는 열림)
  ctx.strokeStyle = glassStrokeStyle(ctx, b.y0, b.y1);
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(b.x0, b.y0);
  ctx.lineTo(b.x0, b.y1 - r);
  ctx.quadraticCurveTo(b.x0, b.y1, b.x0 + r, b.y1);
  ctx.lineTo(b.x1 - r, b.y1);
  ctx.quadraticCurveTo(b.x1, b.y1, b.x1, b.y1 - r);
  ctx.lineTo(b.x1, b.y0);
  ctx.stroke();
  // 바닥 두께(유리 바닥이 더 두껍게 보이는 디테일)
  ctx.strokeStyle = "rgba(190,216,248,.35)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(b.x0 + r + 2, b.y1 - 2.4);
  ctx.lineTo(b.x1 - r - 2, b.y1 - 2.4);
  ctx.stroke();
  // 좌측 스펙큘러 스트릭
  ctx.strokeStyle = "rgba(255,255,255,.30)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x0 + 5.5, b.y0 + 12);
  ctx.lineTo(b.x0 + 5.5, b.y1 - 16);
  ctx.stroke();
  // 림(입구) 틱 — 열린 윗면 강조
  ctx.strokeStyle = "rgba(226,240,255,.9)";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(b.x0 - 3, b.y0);
  ctx.lineTo(b.x0 + 7, b.y0);
  ctx.moveTo(b.x1 - 7, b.y0);
  ctx.lineTo(b.x1 + 3, b.y0);
  ctx.stroke();
}

/** 삼각 플라스크(목 + 원뿔 몸통). 같은 유리 문법. */
export function glassFlask(
  ctx: CanvasRenderingContext2D,
  cx: number,
  neckW: number,
  neckTop: number,
  bodyTop: number,
  bodyW: number,
  botY: number,
): void {
  const path = (): void => {
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2, neckTop);
    ctx.lineTo(cx - neckW / 2, bodyTop);
    ctx.lineTo(cx - bodyW / 2 + 6, botY - 6);
    ctx.quadraticCurveTo(cx - bodyW / 2, botY, cx - bodyW / 2 + 10, botY);
    ctx.lineTo(cx + bodyW / 2 - 10, botY);
    ctx.quadraticCurveTo(cx + bodyW / 2, botY, cx + bodyW / 2 - 6, botY - 6);
    ctx.lineTo(cx + neckW / 2, bodyTop);
    ctx.lineTo(cx + neckW / 2, neckTop);
  };
  ctx.fillStyle = "rgba(190,220,255,.05)";
  path();
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = glassStrokeStyle(ctx, neckTop, botY);
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  path();
  ctx.stroke();
  // 좌측 어깨 스펙큘러
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - neckW / 2 + 5, bodyTop + 6);
  ctx.lineTo(cx - bodyW / 2 + 16, botY - 12);
  ctx.stroke();
  // 림 틱
  ctx.strokeStyle = "rgba(226,240,255,.9)";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(cx - neckW / 2 - 3, neckTop);
  ctx.lineTo(cx - neckW / 2 + 6, neckTop);
  ctx.moveTo(cx + neckW / 2 - 6, neckTop);
  ctx.lineTo(cx + neckW / 2 + 3, neckTop);
  ctx.stroke();
}

/** 용기 속 액체 채움 — 위가 밝은 세로 그라데이션 + 수면 하이라이트. */
export function liquidFill(
  ctx: CanvasRenderingContext2D,
  x0: number,
  surfaceY: number,
  x1: number,
  botY: number,
  rgb: string, // "90,150,230"
  alphaTop = 0.16,
): void {
  const g = ctx.createLinearGradient(0, surfaceY, 0, botY);
  g.addColorStop(0, `rgba(${rgb},${alphaTop})`);
  g.addColorStop(1, `rgba(${rgb},${alphaTop * 0.35})`);
  ctx.fillStyle = g;
  ctx.fillRect(x0, surfaceY, x1 - x0, botY - surfaceY);
  ctx.strokeStyle = `rgba(226,242,255,.35)`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, surfaceY);
  ctx.lineTo(x1 - 3, surfaceY);
  ctx.stroke();
}

/** 전자저울 — 금속 몸체 + 파인 디스플레이. 표시창 사각형을 돌려준다(텍스트는 호출부가). */
export function scaleBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  w: number,
  h = 34,
): { dx: number; dy: number; dw: number; dh: number } {
  const x = cx - w / 2;
  // 몸체(위 밝은 금속)
  const body = ctx.createLinearGradient(0, topY, 0, topY + h);
  body.addColorStop(0, "rgba(255,255,255,.16)");
  body.addColorStop(1, "rgba(210,226,248,.05)");
  ctx.fillStyle = body;
  roundRect(ctx, x, topY, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = glassStrokeStyle(ctx, topY, topY + h);
  ctx.lineWidth = 2;
  roundRect(ctx, x, topY, w, h, 10);
  ctx.stroke();
  // 윗면 하이라이트
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + 8, topY + 2.2);
  ctx.lineTo(x + w - 8, topY + 2.2);
  ctx.stroke();
  // 디스플레이(파인 창)
  const dw = Math.min(w * 0.52, 96);
  const dh = h - 13;
  const dx = cx - dw / 2;
  const dy = topY + 6.5;
  ctx.fillStyle = "rgba(2,10,22,.6)";
  roundRect(ctx, dx, dy, dw, dh, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,150,190,.35)";
  ctx.lineWidth = 1.2;
  roundRect(ctx, dx, dy, dw, dh, 6);
  ctx.stroke();
  return { dx, dy, dw, dh };
}

/** 따뜻한 바람 스트릭 — 양끝이 사라지는 가로 그라데이션 곡선용 스타일. */
export function windStrokeStyle(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  rgb = "255,196,120",
  a = 0.5,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(0.2, `rgba(${rgb},${a})`);
  g.addColorStop(0.8, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  return g;
}

/** 부드러운 발광 — 열원·냉기 연출. */
export function softGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rgb: string,
  a: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
