// 힘의 작용 단원(V) 공용 소품 — 용수철 코일·힘 화살표·밧줄·나무 상자.
// 파운드리 재질 문법의 캔버스 구현: 단색 스트로크 금지, 그라데이션+하이라이트+접촉 그림자.
// 물리는 각 랩이 소유한다 — 여기는 "그리기"만.

const TAU = Math.PI * 2;

/** 힘 화살표 — 작용점에서 (dx,dy)만큼. 부드러운 몸통 + 또렷한 촉 + 미세 광. */
export function drawForceArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  opts: { color?: string; width?: number; alpha?: number; label?: string } = {},
): void {
  const len = Math.hypot(dx, dy);
  if (len < 3) return;
  const color = opts.color ?? "#F25757";
  const w = opts.width ?? 4;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const headL = Math.min(16, 8 + len * 0.12);
  const tipX = x + dx;
  const tipY = y + dy;
  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 1;
  // 몸통(끝을 촉 앞에서 멈춤)
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX - ux * (headL - 2), tipY - uy * (headL - 2));
  ctx.stroke();
  // 몸통 상단 하이라이트(가는 밝은 선)
  ctx.strokeStyle = "rgba(255,255,255,.4)";
  ctx.lineWidth = Math.max(1, w * 0.32);
  ctx.beginPath();
  ctx.moveTo(x + px * w * 0.22, y + py * w * 0.22);
  ctx.lineTo(tipX - ux * headL + px * w * 0.22, tipY - uy * headL + py * w * 0.22);
  ctx.stroke();
  // 촉
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ux * headL + px * headL * 0.52, tipY - uy * headL + py * headL * 0.52);
  ctx.lineTo(tipX - ux * headL - px * headL * 0.52, tipY - uy * headL - py * headL * 0.52);
  ctx.closePath();
  ctx.fill();
  // 작용점 표시(도넛)
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x, y, Math.max(2.6, w * 0.6), 0, TAU);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.4, w * 0.32), 0, TAU);
  ctx.fill();
  // 라벨
  if (opts.label) {
    ctx.font = "700 12px Pretendard, sans-serif";
    ctx.textAlign = "center";
    const lx = x + dx * 0.55 + px * 14;
    const ly = y + dy * 0.55 + py * 14 + 4;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "rgba(11,21,36,.75)";
    ctx.strokeText(opts.label, lx, ly);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(opts.label, lx, ly);
  }
  ctx.restore();
}

/** 용수철 코일 — (x0,y0)→(x1,y1)을 잇는 리얼 코일. 각 코일 = 타원 루프(원근),
 *  아래 어두운 패스 + 위 밝은 하이라이트 패스 2겹으로 금속 원통 셰이딩.
 *  자연 길이 대비 늘어남/압축은 코일 간격으로 그대로 드러난다. */
export function drawSpring(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  opts: { coils?: number; radius?: number; endLen?: number; tone?: "steel" | "gold" } = {},
): void {
  const coils = opts.coils ?? 10;
  const R = opts.radius ?? 11;
  const endLen = opts.endLen ?? 12;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  if (L < endLen * 2 + 4) return;
  const ux = dx / L;
  const uy = dy / L;
  const px = -uy; // 축과 수직(코일 반지름 방향)
  const py = ux;

  const bodyL = L - endLen * 2;
  const step = bodyL / coils;
  const sx = x0 + ux * endLen;
  const sy = y0 + uy * endLen;

  // 코일 경로 생성 — 각 코일을 4개의 베지어 구간(뒤로 넘어가는 반원 + 앞으로 오는 반원)으로
  const seg = (t: number, side: number): { x: number; y: number } => ({
    x: sx + ux * t + px * R * side,
    y: sy + uy * t + py * R * side,
  });

  const paths: { fromT: number; toT: number }[] = [];
  for (let i = 0; i < coils; i++) paths.push({ fromT: i * step, toT: (i + 1) * step });

  const dark = opts.tone === "gold" ? "rgba(148,110,42,.9)" : "rgba(96,116,146,.95)";
  const mid = opts.tone === "gold" ? "rgba(214,168,84,.95)" : "rgba(168,188,214,.95)";
  const light = opts.tone === "gold" ? "rgba(255,226,158,.95)" : "rgba(232,242,252,.95)";

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 끝 고리(양쪽 훅)
  ctx.strokeStyle = mid;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(sx, sy);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - ux * endLen, y1 - uy * endLen);
  ctx.stroke();

  // 1패스: 뒤쪽 반코일(어두움) — 몸통에 가려지는 부분
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3.4;
  for (const c of paths) {
    const a = seg(c.fromT, 1);
    const b = seg(c.fromT + step * 0.5, -1);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    // 위(+측)에서 아래(−측)로 넘어가는 뒷면 곡선
    const c1 = seg(c.fromT + step * 0.1, 1.05);
    const c2 = seg(c.fromT + step * 0.4, -1.05);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
    ctx.stroke();
  }
  // 2패스: 앞쪽 반코일(중간톤, 두꺼움)
  ctx.strokeStyle = mid;
  ctx.lineWidth = 3.8;
  for (const c of paths) {
    const b = seg(c.fromT + step * 0.5, -1);
    const e = seg(c.toT, 1);
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    const c1 = seg(c.fromT + step * 0.62, -1.05);
    const c2 = seg(c.toT - step * 0.08, 1.05);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e.x, e.y);
    ctx.stroke();
  }
  // 3패스: 앞면 하이라이트(가늘고 밝게, 위쪽 라인)
  ctx.strokeStyle = light;
  ctx.lineWidth = 1.5;
  for (const c of paths) {
    const b = seg(c.fromT + step * 0.52, -0.82);
    const e = seg(c.toT - step * 0.02, 0.78);
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    const c1 = seg(c.fromT + step * 0.64, -0.9);
    const c2 = seg(c.toT - step * 0.12, 0.86);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e.x, e.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** 밧줄 — 살짝 처지는 곡선 + 꼬임 표시. tension 0~1(팽팽할수록 직선). */
export function drawRope(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tension: number,
  tMs = 0,
): void {
  const midX = (x0 + x1) / 2;
  const sag = (1 - tension) * 16 + 2 + Math.sin(tMs / 300) * (1 - tension) * 2;
  const midY = (y0 + y1) / 2 + sag;
  ctx.save();
  ctx.lineCap = "round";
  // 본체
  ctx.strokeStyle = "#C9A26A";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(midX, midY, x1, y1);
  ctx.stroke();
  // 상단 하이라이트
  ctx.strokeStyle = "rgba(255,232,190,.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, y0 - 1.2);
  ctx.quadraticCurveTo(midX, midY - 1.4, x1, y1 - 1.2);
  ctx.stroke();
  // 꼬임 짧은 사선들
  ctx.strokeStyle = "rgba(122,88,40,.55)";
  ctx.lineWidth = 1.4;
  const n = 9;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * midX + t * t * x1;
    const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * midY + t * t * y1;
    ctx.beginPath();
    ctx.moveTo(bx - 2.6, by - 2.2);
    ctx.lineTo(bx + 2.6, by + 2.2);
    ctx.stroke();
  }
  ctx.restore();
}

/** 나무 상자 — 골드빛 판재 + 대각 보강대 + 상단 하이라이트. (x,y)=바닥 중심. */
export function drawCrate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tMs = 0,
  wobble = 0,
): void {
  const left = x - w / 2;
  const top = y - h;
  const tilt = wobble * Math.sin(tMs / 90) * 0.012;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.translate(-x, -y);
  const g = ctx.createLinearGradient(0, top, 0, y);
  g.addColorStop(0, "#D8A85E");
  g.addColorStop(0.55, "#BE8A42");
  g.addColorStop(1, "#9C6E30");
  ctx.fillStyle = g;
  ctx.fillRect(left, top, w, h);
  // 판재 줄눈
  ctx.strokeStyle = "rgba(84,56,20,.5)";
  ctx.lineWidth = 1.6;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(left + 3, top + (h * i) / 3);
    ctx.lineTo(left + w - 3, top + (h * i) / 3);
    ctx.stroke();
  }
  // 테두리 + 대각 보강대
  ctx.strokeStyle = "rgba(72,46,14,.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(left + 1.5, top + 1.5, w - 3, h - 3);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(left + 4, top + 4);
  ctx.lineTo(left + w - 4, y - 4);
  ctx.moveTo(left + w - 4, top + 4);
  ctx.lineTo(left + 4, y - 4);
  ctx.stroke();
  // 상단 하이라이트
  ctx.strokeStyle = "rgba(255,232,180,.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left + 4, top + 2.4);
  ctx.lineTo(left + w - 4, top + 2.4);
  ctx.stroke();
  ctx.restore();
}

/** 지면 라인 — 양끝이 사라지는 밝은 선 + 아래 그라데이션. */
export function drawGround(ctx: CanvasRenderingContext2D, w: number, y: number, h: number): void {
  const line = ctx.createLinearGradient(0, 0, w, 0);
  line.addColorStop(0, "rgba(178,204,238,0)");
  line.addColorStop(0.12, "rgba(178,204,238,.5)");
  line.addColorStop(0.88, "rgba(178,204,238,.5)");
  line.addColorStop(1, "rgba(178,204,238,0)");
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();
  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, "rgba(110,140,184,.09)");
  g.addColorStop(1, "rgba(110,140,184,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, h - y);
}
