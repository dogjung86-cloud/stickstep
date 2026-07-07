// lightKit — 중2 III 빛 단원 랩 공용 킷(다크 무대 캔버스).
// 발광 광선(글로우 다층 + 광자 점 흐름), 각도 호·법선·각도기, 레이저·거울·눈 소품.
// 파운드리 재질 문법의 캔버스 버전: 균일 단색 스트로크 금지, 광선은 additive 글로우.
// reflectLab · diffuseLab · refractLab · seeLab · mirrorImageLab · lightBench가 공유한다.

export const TAU = Math.PI * 2;

export interface Pt {
  x: number;
  y: number;
}

/** 레이저 빔 기본색 — 교과서 실험(레이저 지시기)의 초록. */
export const BEAM_GREEN = "88,240,150";
/** 백색광·햇빛 빔. */
export const BEAM_WHITE = "255,244,214";

export interface BeamOpts {
  rgb?: string; // "r,g,b"
  width?: number; // 코어 두께
  alpha?: number; // 코어 불투명도
  dash?: number[]; // 점선(허상 연장선 등)
  arrow?: boolean; // 끝점 화살촉(진행 방향)
  arrowAt?: number; // 화살촉 위치(0~1, 경로 길이 비율) — 없으면 끝
  flow?: number; // 광자 점 흐름 위상(0~1). undefined면 점 없음
  glow?: boolean; // 글로우 레이어(기본 true)
}

function polyLen(pts: Pt[]): number {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
}

/** 경로 위 s(px) 지점의 좌표와 방향각. */
function pointAt(pts: Pt[], s: number): { x: number; y: number; a: number } {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= s || i === pts.length - 1) {
      const t = seg > 0 ? Math.min(1, Math.max(0, (s - acc) / seg)) : 0;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t,
        a: Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x),
      };
    }
    acc += seg;
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, a: 0 };
}

/** 발광 광선 — 넓은 글로우 → 중간 → 밝은 코어 3층 + (선택) 광자 점 흐름 + 화살촉. */
export function drawBeam(ctx: CanvasRenderingContext2D, pts: Pt[], o: BeamOpts = {}): void {
  if (pts.length < 2) return;
  const rgb = o.rgb ?? BEAM_GREEN;
  const w = o.width ?? 3;
  const alpha = o.alpha ?? 0.95;
  const trace = (): void => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  };
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (o.dash) ctx.setLineDash(o.dash);
  if (o.glow !== false) {
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(${rgb},${0.10 * alpha})`;
    ctx.lineWidth = w * 4.2;
    trace();
    ctx.strokeStyle = `rgba(${rgb},${0.22 * alpha})`;
    ctx.lineWidth = w * 2.1;
    trace();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = `rgba(${rgb},${alpha})`;
  ctx.lineWidth = w;
  trace();
  // 코어 하이라이트(가장 밝은 심지)
  if (o.glow !== false && !o.dash) {
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * alpha})`;
    ctx.lineWidth = Math.max(1, w * 0.36);
    trace();
  }
  ctx.setLineDash([]);

  const L = polyLen(pts);
  // 광자 점 흐름 — 진행 방향이 몸으로 읽힌다
  if (o.flow !== undefined && L > 18) {
    const gap = 30;
    ctx.globalCompositeOperation = "lighter";
    for (let s = ((o.flow % 1) + 1) % 1 * gap; s < L; s += gap) {
      const p = pointAt(pts, s);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
      g.addColorStop(0, `rgba(255,255,255,${0.85 * alpha})`);
      g.addColorStop(0.4, `rgba(${rgb},${0.5 * alpha})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  // 화살촉
  if (o.arrow) {
    const at = (o.arrowAt ?? 0.995) * L;
    const p = pointAt(pts, Math.max(0, Math.min(L - 0.01, at)));
    drawArrowHead(ctx, p.x, p.y, p.a, Math.max(7, w * 2.6), `rgba(${rgb},${alpha})`);
  }
  ctx.restore();
}

export function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size * 0.6, 0);
  ctx.lineTo(-size * 0.55, -size * 0.52);
  ctx.lineTo(-size * 0.28, 0);
  ctx.lineTo(-size * 0.55, size * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 법선 — 표면 위 점에서 수직으로 뻗는 점선(교과서 표기). dir: 법선 방향각. */
export function drawNormal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  len: number,
  opts: { both?: boolean; alpha?: number } = {},
): void {
  const a = opts.alpha ?? 0.55;
  ctx.save();
  ctx.strokeStyle = `rgba(214,228,248,${a})`;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(x - (opts.both ? Math.cos(dir) * len * 0.32 : 0), y - (opts.both ? Math.sin(dir) * len * 0.32 : 0));
  ctx.lineTo(x + Math.cos(dir) * len, y + Math.sin(dir) * len);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** 각도 호 + 도수 라벨. a0→a1(반시계/시계 자동 최단 방향). */
export function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  rgb: string,
  label?: string,
  labelR?: number,
): void {
  let d = a1 - a0;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  ctx.save();
  ctx.strokeStyle = `rgba(${rgb},.9)`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a0 + d, d < 0);
  ctx.stroke();
  if (label) {
    const mid = a0 + d / 2;
    const lr = labelR ?? r + 15;
    const tx = cx + Math.cos(mid) * lr;
    const ty = cy + Math.sin(mid) * lr;
    ctx.font = "800 12.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "rgba(7,14,26,.85)";
    ctx.strokeText(label, tx, ty);
    ctx.fillStyle = `rgba(${rgb},1)`;
    ctx.fillText(label, tx, ty);
  }
  ctx.restore();
}

/** 반원 각도기 — 표면(baseAngle 방향)에 놓인 눈금판. 15° 간격 틱, 은은한 라인. */
export function drawProtractor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  baseAngle: number,
  opts: { alpha?: number } = {},
): void {
  const A = opts.alpha ?? 1;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(baseAngle);
  // 판(아주 옅은 유리)
  const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  g.addColorStop(0, `rgba(160,190,235,${0.05 * A})`);
  g.addColorStop(1, `rgba(160,190,235,${0.012 * A})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, TAU);
  ctx.closePath();
  ctx.fill();
  // 테두리 호
  ctx.strokeStyle = `rgba(190,214,246,${0.30 * A})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, TAU);
  ctx.stroke();
  // 틱(15° 간격, 30°는 길게 + 0°/90° 강조)
  for (let deg = 0; deg <= 180; deg += 15) {
    const a = Math.PI + (deg / 180) * Math.PI;
    const major = deg % 30 === 0;
    const inner = major ? r - 11 : r - 6.5;
    ctx.strokeStyle =
      deg === 90
        ? `rgba(226,240,255,${0.6 * A})`
        : `rgba(190,214,246,${(major ? 0.4 : 0.22) * A})`;
    ctx.lineWidth = deg === 90 ? 1.8 : 1.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * (r - 1.5), Math.sin(a) * (r - 1.5));
    ctx.stroke();
  }
  ctx.restore();
}

/** 슬릿 레이저 소품 — 각도 방향으로 쏘는 손잡이형 본체(파운드리 금속 문법). */
export function laserBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  o: { rgb?: string; len?: number; grip?: boolean } = {},
): void {
  const rgb = o.rgb ?? BEAM_GREEN;
  const L = o.len ?? 52;
  const W = 19;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // 본체(빔 반대쪽으로 몸통) — 빔 수직 방향 금속 그라데이션(위 밝음)
  const body = ctx.createLinearGradient(0, -W / 2, 0, W / 2);
  body.addColorStop(0, "#93A9C8");
  body.addColorStop(0.45, "#5F7699");
  body.addColorStop(1, "#2E3D57");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(-L, -W / 2, L, W, 7);
  ctx.fill();
  // 윗면 키라이트
  ctx.strokeStyle = "rgba(233,242,255,.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-L + 7, -W / 2 + 2.6);
  ctx.lineTo(-9, -W / 2 + 2.6);
  ctx.stroke();
  // 외곽(최암색)
  ctx.strokeStyle = "#1D2A40";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.roundRect(-L, -W / 2, L, W, 7);
  ctx.stroke();
  // 그립 홈
  if (o.grip !== false) {
    ctx.strokeStyle = "rgba(20,30,48,.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const gx = -L + 12 + i * 7;
      ctx.beginPath();
      ctx.moveTo(gx, -W / 2 + 4);
      ctx.lineTo(gx, W / 2 - 4);
      ctx.stroke();
    }
  }
  // 방출구 + 발광
  ctx.fillStyle = "#20304A";
  ctx.beginPath();
  ctx.roundRect(-2, -W / 2 + 3.5, 6, W - 7, 2.5);
  ctx.fill();
  const glow = ctx.createRadialGradient(4, 0, 0, 4, 0, 13);
  glow.addColorStop(0, `rgba(${rgb},.9)`);
  glow.addColorStop(0.35, `rgba(${rgb},.32)`);
  glow.addColorStop(1, `rgba(${rgb},0)`);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(4, 0, 13, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** 평면거울 소품 — 유리 앞면 + 은박 뒷면 빗금(교과서 표기). (x0,y0)→(x1,y1). */
export function mirrorProp(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o: { back?: 1 | -1; hatch?: boolean } = {},
): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const nx = Math.cos(a + Math.PI / 2) * (o.back ?? 1);
  const ny = Math.sin(a + Math.PI / 2) * (o.back ?? 1);
  ctx.save();
  ctx.lineCap = "round";
  // 뒷판(도금 두께)
  ctx.strokeStyle = "rgba(64,84,116,.9)";
  ctx.lineWidth = 6.5;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * 3.4, y0 + ny * 3.4);
  ctx.lineTo(x1 + nx * 3.4, y1 + ny * 3.4);
  ctx.stroke();
  // 유리 앞면(밝은 청백 — 세로 그라데이션 대신 양끝 그라데이션)
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "rgba(212,232,255,.95)");
  g.addColorStop(0.5, "rgba(158,194,238,.8)");
  g.addColorStop(1, "rgba(206,228,254,.95)");
  ctx.strokeStyle = g;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  // 스펙큘러 짧은 스트릭
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 1.6;
  const mx = x0 + (x1 - x0) * 0.18;
  const my = y0 + (y1 - y0) * 0.18;
  ctx.beginPath();
  ctx.moveTo(mx, my);
  ctx.lineTo(mx + (x1 - x0) * 0.1, my + (y1 - y0) * 0.1);
  ctx.stroke();
  // 뒷면 빗금(거울 기호)
  if (o.hatch !== false) {
    ctx.strokeStyle = "rgba(148,170,204,.5)";
    ctx.lineWidth = 1.4;
    const L = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.floor(L / 13);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const px = x0 + (x1 - x0) * t;
      const py = y0 + (y1 - y0) * t;
      ctx.beginPath();
      ctx.moveTo(px + nx * 5, py + ny * 5);
      ctx.lineTo(px + nx * 12 - Math.cos(a) * 6, py + ny * 12 - Math.sin(a) * 6);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** 눈 소품 — 시선 방향(angle)을 바라보는 눈. 광선이 "눈에 들어옴"을 표현. */
export function eyeProp(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, s = 16): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // 흰자(아몬드) — 위 밝은 그라데이션
  const g = ctx.createLinearGradient(0, -s * 0.62, 0, s * 0.62);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(1, "#CBD9EC");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(0, -s * 0.94, s, 0);
  ctx.quadraticCurveTo(0, s * 0.94, -s, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#31415C";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  // 홍채(시선 쪽으로 치우침) + 동공 + 하이라이트
  const ix = s * 0.34;
  const iris = ctx.createRadialGradient(ix - 1.5, -1.5, 0.5, ix, 0, s * 0.42);
  iris.addColorStop(0, "#7FB8F2");
  iris.addColorStop(1, "#2E6DB4");
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(ix, 0, s * 0.42, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#14243C";
  ctx.beginPath();
  ctx.arc(ix + s * 0.06, 0, s * 0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.beginPath();
  ctx.arc(ix - s * 0.06, -s * 0.12, s * 0.085, 0, TAU);
  ctx.fill();
  // 속눈썹 두 가닥
  ctx.strokeStyle = "#31415C";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-s * 0.55, -s * 0.52);
  ctx.lineTo(-s * 0.78, -s * 0.78);
  ctx.moveTo(-s * 0.12, -s * 0.66);
  ctx.lineTo(-s * 0.24, -s * 0.95);
  ctx.stroke();
  ctx.restore();
}

/** 도수 표기용 — 라디안 → 반올림 도수 문자열. */
export function degLabel(rad: number): string {
  return `${Math.round((rad * 180) / Math.PI)}°`;
}

/** setPointerCapture 안전 래퍼 — 합성 이벤트(E2E·테스트)에는 활성 포인터가 없어 throw한다. */
export function capturePointer(elm: Element, e: PointerEvent): void {
  try {
    elm.setPointerCapture(e.pointerId);
  } catch {
    /* 합성 이벤트 — 캡처 없이 진행 */
  }
}
