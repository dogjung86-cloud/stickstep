// animalKit — 중2 Ⅵ 동물과 에너지 공용 킷.
// 색·물질 토큰·기관 재질·관(혈관/소화관)·판막·흐름 점의 **단일 진실 공급원**.
// 랩과 도해는 반드시 이 파일의 헬퍼를 쓴다(색·크기 하드코딩 금지).
//
// 재질 문법은 파운드리 공식을 따른다: ① 근-동조 3스톱 면 ② 좌상단 키라이트
// ③ 바닥 접촉 그림자 ④ 외곽선은 재질별 최암색. 균일한 검은 외곽선 금지.

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

/** 발주 에셋 경로 — public/anim/<rel>. lazy 금지 규칙은 임베드 쪽에서 지킨다. */
export const anAsset = (rel: string): string => `${BASE}anim/${rel}`;

// ── 팔레트 ────────────────────────────────────────────────────────────────
// 세 값(hi/mid/lo)이 한 재질을 이룬다. hi는 키라이트, lo는 외곽선 겸 그림자.
export interface Mat {
  hi: string;
  mid: string;
  lo: string;
}

const mat = (hi: string, mid: string, lo: string): Mat => ({ hi, mid, lo });

/** 물질(알갱이) 색 — 영양소·기체·노폐물. 퀴즈에서 "색이 정답 단서"가 되지 않게 주의해 쓸 것. */
export const SUBSTANCE = {
  starch: mat("#FFCE8A", "#E89A34", "#9A5C10"), // 녹말 — 굵은 사슬
  sugar: mat("#FFD79A", "#F2AE4A", "#A86A18"), // 엿당·포도당
  protein: mat("#C9AEF2", "#8E6BD1", "#4E3288"), // 단백질
  amino: mat("#D9C6F7", "#A98BE0", "#5F429A"), // 아미노산
  fat: mat("#FFEDA6", "#F0CD52", "#9A7A12"), // 지방
  fatty: mat("#FFF3C2", "#F5DC7C", "#A88A22"), // 지방산·모노글리세라이드
  vitamin: mat("#9BE8B6", "#43BE72", "#146B38"), // 바이타민
  mineral: mat("#CFD8E2", "#93A3B5", "#4C5B6B"), // 무기염류
  water: mat("#B6E8FA", "#5FC0E4", "#1E6C8A"), // 물
  oxygen: mat("#AFE2FA", "#45B3E8", "#14648F"), // 산소
  carbon: mat("#CFC3E4", "#8B7BB5", "#463A66"), // 이산화 탄소
  urea: mat("#DDE3A8", "#93A63F", "#4C570F"), // 요소
  ammonia: mat("#E8D6A8", "#B99A45", "#5E4A0E"), // 암모니아
  energy: mat("#FFE8A0", "#FFC53D", "#B07A00"), // 에너지
} as const;

export type SubstanceKey = keyof typeof SUBSTANCE;

/** 기관·조직 재질. */
export const TISSUE = {
  gut: mat("#F9C6B2", "#E58A72", "#A2513C"), // 소화관(위·창자)
  gland: mat("#F6D9A8", "#D6A253", "#8B6118"), // 소화샘(침샘·간·이자)
  heart: mat("#F98C93", "#D8404F", "#83202E"), // 심장 근육
  lung: mat("#F6CBD8", "#DE8FA6", "#8A4A5F"), // 허파
  kidney: mat("#E39AA1", "#B84759", "#6C2836"), // 콩팥
  cell: mat("#FFE6BE", "#F2C173", "#A2731F"), // 조직세포
  bone: mat("#F2EEE6", "#D6CDBC", "#8C8272"), // 갈비뼈
  membrane: mat("#CFE6F2", "#93BFD4", "#4A7286"), // 막(가로막·세포막)
} as const;

export type TissueKey = keyof typeof TISSUE;

/** 혈관·관 재질. 동맥/정맥의 색은 산소량이 아니라 **혈관 종류**를 뜻하지 않는다 —
 *  교과서 그림 VI-9의 규약대로 "산소 많은 혈액=붉은색 / 적은 혈액=푸른색"에 쓴다. */
export const VESSEL = {
  rich: mat("#FF8A92", "#E03A4B", "#8A2230"), // 산소를 많이 포함한 혈액
  poor: mat("#93A9E8", "#4A63B8", "#26356E"), // 산소를 적게 포함한 혈액
  capillary: mat("#E9A8BC", "#C86A8A", "#7A3450"), // 모세혈관
  airway: mat("#E7F6FC", "#A9D8E7", "#4E7889"), // 숨관·숨관가지
  tubule: mat("#FFE9B0", "#EFC759", "#9A7420"), // 세뇨관(오줌이 흐르는 관)
} as const;

export type VesselKey = keyof typeof VESSEL;

export const SHADOW = "#2A3A5E";

/** 문자열 키 하나로 어떤 재질이든 꺼낸다(도해 저작 편의). */
export function anMat(key: string): Mat {
  return (
    (SUBSTANCE as Record<string, Mat>)[key] ||
    (TISSUE as Record<string, Mat>)[key] ||
    (VESSEL as Record<string, Mat>)[key] ||
    mat("#DDE3EA", "#A8B4C2", "#5A6673")
  );
}

/** CSS 변수 읽기 — 무대 배경 등 토큰이 정본인 색. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ── 포인터 ────────────────────────────────────────────────────────────────
/** 합성 PointerEvent(E2E)에서 throw해 핸들러가 통째로 죽는 것을 막는다. */
export function capturePointer(target: Element, ev: PointerEvent): void {
  try {
    (target as HTMLElement).setPointerCapture(ev.pointerId);
  } catch {
    /* 합성 포인터는 캡처가 없을 수 있다. */
  }
}

/** 캔버스 논리 좌표(BASE_W 기준) ↔ 화면 좌표. 랩은 전부 이 스케일 규약을 쓴다. */
export function canvasPoint(canvas: HTMLCanvasElement, ev: PointerEvent, baseW: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const k = baseW / Math.max(1, rect.width);
  return { x: (ev.clientX - rect.left) * k, y: (ev.clientY - rect.top) * k };
}

/** 랩 캔버스 맞추기 — **논리 좌표계(BASE_W × baseH)가 잘리지 않도록** CSS 높이를 폭에 맞춰 늘린다.
 *
 *  랩은 ctx.scale(k, k)로 가로·세로를 같은 비율로 키우는데(원 비율 유지),
 *  CSS 높이를 baseH로 고정하면 세로로 보이는 논리 높이가 baseH/k로 줄어 **아래가 잘린다**
 *  (폭 374px 기기에서 4% 잘림 — 실제로 트레이 라벨이 잘렸다).
 *  그래서 매 프레임 CSS 높이를 baseH·k로 맞춰 준다. 반환값의 ctx는 이미 scale(k,k)가 적용돼 있다.
 */
export function fitLabCanvas(
  canvas: HTMLCanvasElement,
  baseW: number,
  baseH: number,
  maxDpr = 1.75,
): { ctx: CanvasRenderingContext2D; k: number } {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.clientWidth || baseW;
  const k = w / baseW;
  const cssH = Math.round(baseH * k);
  if (canvas.style.height !== `${cssH}px`) canvas.style.height = `${cssH}px`;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
  return { ctx, k };
}

// ── 캔버스 프리미티브 ─────────────────────────────────────────────────────
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 바닥 접촉 그림자 — 파운드리 공식 ③. */
export function contactShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry = rx * 0.28,
  alpha = 0.16,
): void {
  ctx.save();
  ctx.fillStyle = withAlpha(SHADOW, alpha);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 물질 알갱이 하나. 3스톱 구면 + 좌상단 키라이트 + 최암색 외곽선. */
export function drawToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  key: string,
  opts?: { alpha?: number; ring?: boolean },
): void {
  const m = anMat(key);
  ctx.save();
  if (opts?.alpha != null) ctx.globalAlpha = opts.alpha;
  const g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.4, r * 0.12, x, y, r);
  g.addColorStop(0, m.hi);
  g.addColorStop(0.55, m.mid);
  g.addColorStop(1, m.lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = m.lo;
  ctx.lineWidth = Math.max(0.8, r * 0.13);
  ctx.stroke();
  ctx.fillStyle = withAlpha("#FFFFFF", 0.55);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.33, y - r * 0.38, r * 0.26, r * 0.18, -0.6, 0, Math.PI * 2);
  ctx.fill();
  if (opts?.ring) {
    ctx.strokeStyle = withAlpha("#FFFFFF", 0.8);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r + 3.2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** 사슬형 큰 영양소(녹말·단백질·지방) — 알갱이 n개가 이어진 덩어리. 소화 전/후 대비의 핵심. */
export function drawChain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  n: number,
  key: string,
  angle = 0,
): void {
  const m = anMat(key);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const step = r * 1.5;
  const span = (n - 1) * step;
  ctx.strokeStyle = m.lo;
  ctx.lineWidth = r * 0.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const px = -span / 2 + i * step;
    const py = Math.sin(i * 1.1) * r * 0.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  for (let i = 0; i < n; i++) {
    const px = -span / 2 + i * step;
    const py = Math.sin(i * 1.1) * r * 0.5;
    drawToken(ctx, px, py, r, key);
  }
  ctx.restore();
}

/** 관(혈관·소화관·세뇨관) — 중심선 점 배열을 따라 3스톱 원통 재질로 그린다. */
export function drawTube(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  w: number,
  key: string,
  opts?: { alpha?: number; dashHint?: boolean },
): void {
  if (pts.length < 2) return;
  const m = anMat(key);
  ctx.save();
  if (opts?.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const stroke = (width: number, color: string): void => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  };
  stroke(w + 2, m.lo);
  stroke(w, m.mid);
  stroke(Math.max(1, w * 0.32), withAlpha(m.hi, opts?.dashHint ? 0.5 : 0.85));
  ctx.restore();
}

/** 관 위를 흐르는 알갱이 — 진행 방향이 몸으로 읽히는 장치(elecKit drawWire 문법 계승). */
export function drawFlowDots(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  phase: number,
  key: string,
  opts?: { count?: number; r?: number },
): void {
  if (pts.length < 2) return;
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    segs.push(d);
    total += d;
  }
  const count = opts?.count ?? 6;
  const r = opts?.r ?? 3.2;
  for (let k = 0; k < count; k++) {
    const t = ((phase + k / count) % 1) * total;
    let acc = 0;
    for (let i = 0; i < segs.length; i++) {
      if (acc + segs[i] >= t) {
        const f = segs[i] === 0 ? 0 : (t - acc) / segs[i];
        const a = pts[i];
        const b = pts[i + 1];
        drawToken(ctx, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, r, key);
        break;
      }
      acc += segs[i];
    }
  }
}

/** 판막 — 두 장의 얇은 막. open이면 흐름 방향으로 젖혀지고, 닫히면 맞닿아 역류를 막는다. */
export function drawValve(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  open: number,
  dir: 1 | -1 = 1,
): void {
  const t = Math.max(0, Math.min(1, open));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  const tip = w * (0.16 + 0.82 * t);
  const lip = w * 0.52;
  ctx.fillStyle = withAlpha("#FFE9EC", 0.94);
  ctx.strokeStyle = VESSEL.rich.lo;
  ctx.lineWidth = 1.2;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, s * lip);
    ctx.quadraticCurveTo(tip * 0.6, s * lip * 0.9, tip, s * lip * (1 - 0.86 * (1 - t)));
    ctx.lineTo(tip, s * lip * (1 - 0.86 * (1 - t)) - s * 1.6);
    ctx.quadraticCurveTo(tip * 0.55, s * lip * 0.62, 0, s * lip * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** 조직세포 — 둥근 세포질 + 핵. 세포호흡·기체 교환 장면 공용. */
export function drawCellBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  opts?: { nucleus?: boolean; glow?: number },
): void {
  const m = TISSUE.cell;
  ctx.save();
  if (opts?.glow) {
    ctx.fillStyle = withAlpha(SUBSTANCE.energy.mid, 0.28 * opts.glow);
    ctx.beginPath();
    ctx.arc(x, y, r * (1.35 + 0.25 * opts.glow), 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.15, x, y, r);
  g.addColorStop(0, m.hi);
  g.addColorStop(0.6, m.mid);
  g.addColorStop(1, m.lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = m.lo;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  if (opts?.nucleus !== false) {
    ctx.fillStyle = withAlpha(m.lo, 0.45);
    ctx.beginPath();
    ctx.arc(x + r * 0.12, y + r * 0.06, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 적혈구 — 핵이 없고 가운데가 오목한 원반(교과서 서술 그대로). */
export function drawRBC(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tilt = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
  g.addColorStop(0, "#B22B3A");
  g.addColorStop(0.42, "#E04353");
  g.addColorStop(1, "#8A2230");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7C1E2B";
  ctx.lineWidth = Math.max(0.8, r * 0.11);
  ctx.stroke();
  ctx.fillStyle = withAlpha("#FFFFFF", 0.32);
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.34, r * 0.24, r * 0.16, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 백혈구 — 혈구 중 가장 크고 모양이 일정하지 않으며 **핵이 있다**. */
export function drawWBC(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rad = r * (1 + 0.14 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 5 - seed));
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.34, r * 0.14, 0, 0, r * 1.1);
  g.addColorStop(0, "#FBF6FF");
  g.addColorStop(0.65, "#DCCCF0");
  g.addColorStop(1, "#9E86C0");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#7A63A2";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = "#7B5FB0";
  ctx.beginPath();
  ctx.ellipse(-r * 0.12, 0, r * 0.44, r * 0.36, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.3, r * 0.16, r * 0.28, r * 0.24, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 혈소판 — 혈구 중 가장 작고 모양이 일정하지 않으며 핵이 없다. */
export function drawPlatelet(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(seed);
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rad = r * (1 + 0.3 * Math.sin(a * 4 + seed * 2));
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad * 0.8;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r * 1.2);
  g.addColorStop(0, "#FFE9A8");
  g.addColorStop(1, "#D19A24");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#A0740F";
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();
}

/** 캔버스 라벨 필 — 어두운 무대 위에서도 읽히는 흰 글자 + 진한 알약(대비 규칙). */
export function labelChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  opts?: { bg?: string; fg?: string; size?: number; align?: "center" | "left" },
): void {
  const size = opts?.size ?? 11;
  ctx.save();
  ctx.font = `800 ${size}px Pretendard, sans-serif`;
  const w = ctx.measureText(text).width + 14;
  const h = size + 9;
  const left = opts?.align === "left" ? x : x - w / 2;
  ctx.fillStyle = opts?.bg ?? withAlpha("#0B1524", 0.82);
  roundRect(ctx, left, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = opts?.fg ?? "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + w / 2, y + 0.5);
  ctx.restore();
}

/** 화살표 — 물질 이동 방향. 굵기·머리 크기는 한 규약으로 통일한다. */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  w = 3,
): void {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = w * 2.6;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(a) * head * 0.7, y2 - Math.sin(a) * head * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head);
  ctx.lineTo(x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 어두운 무대 위 상자 — 몸통은 mid→lo(진한 톤), hi는 얇은 상단 키라이트로만.
 *  밝은 hi를 몸통에 쓰면 흰 라벨이 묻힌다(대비 규칙). */
export function drawSlab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  key: string,
  opts?: { radius?: number; active?: boolean },
): void {
  const m = anMat(key);
  const r = opts?.radius ?? 12;
  ctx.save();
  contactShadow(ctx, x + w / 2, y + h + 3, w * 0.42, 5, 0.18);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, m.mid);
  g.addColorStop(1, m.lo);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = opts?.active ? m.hi : withAlpha(m.lo, 0.9);
  ctx.lineWidth = opts?.active ? 2.4 : 1.4;
  ctx.stroke();
  ctx.fillStyle = withAlpha(m.hi, 0.42);
  roundRect(ctx, x + 3, y + 2.5, w - 6, Math.min(7, h * 0.18), 4);
  ctx.fill();
  ctx.restore();
}
