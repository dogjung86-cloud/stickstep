// 잉크 스틱맨 리그: 랩·훅·퀴즈 그림의 코드 스틱맨을 그리는 단일 진실 공급원.
// 기존 스틱맨(균일 굵기 직선 + 빈 원 머리)을 "붓으로 그린 선 + 피부색 머리 + 결 있는 머리카락"으로 격상한다.
// 원칙
//  1) 뼈대는 호출자가 그대로 준다(머리 원 + 몸통 path). 레이아웃·포즈를 바꾸지 않고 그리는 법만 바꾼다.
//  2) 모든 출력은 InkOp 목록 하나로 나온다. SVG 문자열(inkFigure)과 캔버스(paintInk)가 같은 도형을 그린다.
//  3) 흔들림은 시드 고정 노이즈(정규화 t 기준)라 애니메이션 중에도 선이 떨리지 않는다.
//  4) 크기에 따라 디테일을 줄인다(LOD). 작은 랩 인물은 실루엣, 큰 그림은 머리카락 결까지.
// 좌표: 머리카락·안경·얼굴은 머리 정규 좌표(중심 0,0 · 반지름 1 · y 아래로)에서 저작한다.

export type Pt = readonly [number, number];

export interface InkOp {
  d: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  o?: number;
}

const DEG = Math.PI / 180;
const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시드 고정 1차원 값 노이즈(-1..1). */
function noise(seed: number, knots = 6): (t: number) => number {
  const r = mulberry(seed);
  const v = Array.from({ length: knots + 1 }, () => r() * 2 - 1);
  return (t) => {
    const x = clamp(t, 0, 0.9999) * knots;
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return v[i] * (1 - u) + v[i + 1] * u;
  };
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const s = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number): string {
  const A = hexRgb(a);
  const B = hexRgb(b);
  const c = A.map((v, i) => Math.round(lerp(v, B[i], t)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function pathLen(pts: readonly Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return l;
}

/** 호 길이 등간격 재표본(양 끝 보존). */
function resample(pts: readonly Pt[], count: number): Pt[] {
  const total = pathLen(pts);
  if (total === 0 || count < 2) return [pts[0], pts[pts.length - 1]];
  const out: Pt[] = [pts[0]];
  const step = total / (count - 1);
  let seg = 1;
  let acc = 0;
  let prev = pts[0];
  for (let i = 1; i < count - 1; i++) {
    const want = step * i;
    while (seg < pts.length) {
      const d = Math.hypot(pts[seg][0] - prev[0], pts[seg][1] - prev[1]);
      if (acc + d >= want) {
        const t = d === 0 ? 0 : (want - acc) / d;
        prev = [lerp(prev[0], pts[seg][0], t), lerp(prev[1], pts[seg][1], t)];
        acc = want;
        break;
      }
      acc += d;
      prev = pts[seg];
      seg++;
    }
    out.push(prev);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** 모서리 깎기(Chaikin). 폴리라인을 손으로 그은 곡선처럼 둥글린다. */
function chaikin(pts: readonly Pt[], iter: number, closed: boolean): Pt[] {
  let cur: Pt[] = [...pts];
  for (let k = 0; k < iter; k++) {
    const next: Pt[] = [];
    const n = cur.length;
    if (!closed) next.push(cur[0]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const a = cur[i];
      const b = cur[(i + 1) % n];
      next.push([lerp(a[0], b[0], 0.25), lerp(a[1], b[1], 0.25)]);
      next.push([lerp(a[0], b[0], 0.75), lerp(a[1], b[1], 0.75)]);
    }
    if (!closed) next.push(cur[n - 1]);
    cur = next;
  }
  return cur;
}

function closedPath(pts: readonly Pt[]): string {
  const n = pts.length;
  let m = mid(pts[n - 1], pts[0]);
  let s = `M${fmt(m[0])} ${fmt(m[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    m = mid(p, pts[(i + 1) % n]);
    s += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`;
  }
  return `${s}Z`;
}

function polyPath(pts: readonly Pt[], closed = true): string {
  let s = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) s += `L${fmt(pts[i][0])} ${fmt(pts[i][1])}`;
  return closed ? `${s}Z` : s;
}

interface BrushOpts {
  /** 활처럼 휘는 양(길이 비, 부호 = 왼쪽 법선 방향). */
  bow?: number;
  /** 손떨림 진폭(길이 비). */
  wob?: number;
  /** 시작·끝 굵기 비(1 = 그대로, 작을수록 뾰족). */
  tIn?: number;
  tOut?: number;
  /** 굵기 변화량. */
  vary?: number;
}

/** 붓 획: 중심선을 흔들고 굵기를 바꿔 닫힌 도형(path d)으로 돌려준다. */
export function brush(line: readonly Pt[], w: number, seed: number, o: BrushOpts = {}): string {
  const L = pathLen(line);
  const step = Math.max(1.2, w * 1.05);
  const n = clamp(Math.ceil(L / step), 4, 56);
  const base = resample(line, n + 1);
  const wobN = noise(seed * 13 + 3, 3);
  const wN = noise(seed * 7 + 5, 5);
  const amp = (o.wob ?? 0.007) * L;
  const bow = (o.bow ?? 0) * L;
  const vary = o.vary ?? 0.2;
  const tIn = o.tIn ?? 0.85;
  const tOut = o.tOut ?? 0.6;

  const normalAt = (arr: readonly Pt[], i: number): Pt => {
    const a = arr[Math.max(0, i - 1)];
    const b = arr[Math.min(arr.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };

  const center: Pt[] = base.map((p, i) => {
    const t = i / n;
    const nn = normalAt(base, i);
    const disp = bow * 4 * t * (1 - t) + amp * wobN(t) * Math.pow(Math.sin(Math.PI * t), 0.7);
    return [p[0] + nn[0] * disp, p[1] + nn[1] * disp];
  });

  const left: Pt[] = [];
  const right: Pt[] = [];
  const halfAt = (t: number): number => {
    const capIn = Math.min(1, tIn + (1 - tIn) * (t / 0.14));
    const capOut = Math.min(1, tOut + (1 - tOut) * ((1 - t) / 0.2));
    return (w / 2) * (1 + vary * wN(t)) * capIn * capOut;
  };
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const nn = normalAt(center, i);
    const h = halfAt(t);
    left.push([center[i][0] + nn[0] * h, center[i][1] + nn[1] * h]);
    right.push([center[i][0] - nn[0] * h, center[i][1] - nn[1] * h]);
  }
  // 둥근 끝(법선 반대·접선 방향 돌출)
  const capPt = (i: number, sign: number): Pt => {
    const nn = normalAt(center, i);
    const tx = nn[1];
    const ty = -nn[0];
    const h = halfAt(i / n);
    return [center[i][0] + tx * sign * h * 0.95, center[i][1] + ty * sign * h * 0.95];
  };
  // normalAt = (-dy, dx) → 접선 (dx, dy) = (nn[1], -nn[0])
  const poly: Pt[] = [capPt(0, -1), ...left, capPt(n, 1), ...right.reverse()];
  return closedPath(poly);
}

/** 닫힌 외곽선을 굵기 변화가 있는 고리로(nonzero 채움). */
function ring(poly: readonly Pt[], w: number, seed: number, vary = 0.2): string {
  const n = poly.length;
  const wN = noise(seed * 5 + 9, 7);
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = poly[(i - 1 + n) % n];
    const b = poly[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const h = (w / 2) * (1 + vary * wN(i / n));
    outer.push([poly[i][0] + nx * h, poly[i][1] + ny * h]);
    inner.push([poly[i][0] - nx * h, poly[i][1] - ny * h]);
  }
  return closedPath(outer) + closedPath(inner.reverse());
}

/** 손으로 그린 원(저차 고조파로 살짝 찌그러짐). */
function blob(cx: number, cy: number, r: number, seed: number, amp = 1, count = 30): Pt[] {
  const rn = mulberry(seed * 31 + 7);
  const p1 = rn() * Math.PI * 2;
  const p2 = rn() * Math.PI * 2;
  const p3 = rn() * Math.PI * 2;
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const rr =
      r * (1 + amp * (0.014 * Math.cos(2 * a + p1) + 0.012 * Math.cos(3 * a + p2) + 0.006 * Math.cos(5 * a + p3)));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/* ── 몸통 path 파서 ─ 기존 스틱맨 뼈대 문자열(M l v h q c)을 그대로 받는다 ───────────── */

/** "M120 127v22M120 133l-11 5" 같은 path를 서브패스별 폴리라인으로. 곡선은 표본화한다. */
export function parseBody(d: string): Pt[][] {
  const out: Pt[][] = [];
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cur: Pt[] = [];
  let x = 0;
  let y = 0;
  let cmd = "";
  const num = (): number => parseFloat(tokens[i++]);
  const isNum = (t: string | undefined): boolean => t !== undefined && !/[a-zA-Z]/.test(t);
  while (i < tokens.length) {
    if (!isNum(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case "M":
      case "m": {
        const nx = num();
        const ny = num();
        x = cmd === "m" ? x + nx : nx;
        y = cmd === "m" ? y + ny : ny;
        if (cur.length > 1) out.push(cur);
        cur = [[x, y]];
        cmd = cmd === "M" ? "L" : "l";
        break;
      }
      case "L":
        x = num();
        y = num();
        cur.push([x, y]);
        break;
      case "l":
        x += num();
        y += num();
        cur.push([x, y]);
        break;
      case "H":
        x = num();
        cur.push([x, y]);
        break;
      case "h":
        x += num();
        cur.push([x, y]);
        break;
      case "V":
        y = num();
        cur.push([x, y]);
        break;
      case "v":
        y += num();
        cur.push([x, y]);
        break;
      case "Q":
      case "q": {
        const rel = cmd === "q";
        const cx = num() + (rel ? x : 0);
        const cy = num() + (rel ? y : 0);
        const ex = num() + (rel ? x : 0);
        const ey = num() + (rel ? y : 0);
        for (let k = 1; k <= 6; k++) {
          const t = k / 6;
          const u = 1 - t;
          cur.push([u * u * x + 2 * u * t * cx + t * t * ex, u * u * y + 2 * u * t * cy + t * t * ey]);
        }
        x = ex;
        y = ey;
        break;
      }
      case "C":
      case "c": {
        const rel = cmd === "c";
        const ax = num() + (rel ? x : 0);
        const ay = num() + (rel ? y : 0);
        const bx = num() + (rel ? x : 0);
        const by = num() + (rel ? y : 0);
        const ex = num() + (rel ? x : 0);
        const ey = num() + (rel ? y : 0);
        for (let k = 1; k <= 8; k++) {
          const t = k / 8;
          const u = 1 - t;
          cur.push([
            u * u * u * x + 3 * u * u * t * ax + 3 * u * t * t * bx + t * t * t * ex,
            u * u * u * y + 3 * u * u * t * ay + 3 * u * t * t * by + t * t * t * ey,
          ]);
        }
        x = ex;
        y = ey;
        break;
      }
      case "Z":
      case "z":
        if (cur.length) cur.push(cur[0]);
        break;
      default:
        i++; // 모르는 명령은 건너뛴다
    }
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

/* ── 외형(룩) ─────────────────────────────────────────────── */

export type HairStyle =
  | "none"
  | "crop"
  | "swept"
  | "fringe"
  | "spiky"
  | "bob"
  | "long"
  | "ponytail"
  | "pigtails"
  | "curly"
  | "afro"
  | "bun";
export type Mood = "none" | "calm" | "ok" | "joy" | "sad" | "wow" | "hmm" | "worry" | "focus" | "mad";

export interface Look {
  skin?: string;
  hair?: HairStyle;
  hairColor?: string;
  /** 머리끈·핀 색. */
  accent?: string;
  glasses?: "round" | "square";
  hat?: "beanie" | "cap" | "straw";
  hatColor?: string;
  /** 실험복(스틱맨 쌤). */
  coat?: boolean;
  /** 턱수염(점묘). */
  stubble?: boolean;
  /** 보안경을 이마에 올림. */
  goggles?: boolean;
}

export const SKIN = {
  peach: "#F8DFD0",
  sand: "#F1CDB1",
  tan: "#DDA983",
  bronze: "#B87F58",
  umber: "#8A5B3E",
} as const;

export const HAIR = {
  black: "#2B2C35",
  ebony: "#3E302C",
  brown: "#5F3C27",
  chestnut: "#84502B",
  auburn: "#A9552C",
  ginger: "#D9762B",
  honey: "#CF9A44",
  ash: "#90939B",
} as const;

export const LOOKS = {
  plain: {},
  teacher: { hair: "swept", hairColor: HAIR.black, glasses: "round", coat: true },
  crop: { hair: "crop", hairColor: HAIR.black },
  swept: { hair: "swept", hairColor: HAIR.brown },
  fringe: { hair: "fringe", hairColor: HAIR.ebony },
  spiky: { hair: "spiky", hairColor: HAIR.black },
  bob: { hair: "bob", hairColor: HAIR.brown, accent: "#3182F6" },
  long: { hair: "long", hairColor: HAIR.black, accent: "#12B886" },
  ponytail: { hair: "ponytail", hairColor: HAIR.chestnut, accent: "#3182F6" },
  pigtails: { hair: "pigtails", hairColor: HAIR.auburn, accent: "#F06595" },
  curly: { hair: "curly", hairColor: HAIR.brown },
  afro: { hair: "afro", hairColor: HAIR.ebony },
  bun: { hair: "bun", hairColor: HAIR.black, accent: "#F59F00" },
  beanie: { hat: "beanie", hatColor: "#E8590C", hair: "none" },
  cap: { hat: "cap", hatColor: "#3182F6", hair: "crop", hairColor: HAIR.black },
  elder: { hair: "swept", hairColor: HAIR.ash, glasses: "square", stubble: true },
} as const satisfies Record<string, Look>;
export type LookName = keyof typeof LOOKS;

interface Ctx {
  P: (x: number, y: number) => Pt;
  r: number;
  lw: number;
  seed: number;
  lod: 0 | 1 | 2;
  ink: string;
  /** 피부 위에 그리는 선(얼굴·안경). 다크 무대에서도 어둡다. */
  face: string;
  base: string;
  dark: string;
  light: string;
  accent: string;
  /** 꽁지머리 쪽(정면 +1, 옆모습이면 뒤통수 쪽 -1). */
  tail: number;
}

function hairTones(base: string): { dark: string; light: string } {
  const [r, g, b] = hexRgb(base);
  const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
  return lum < 0.26
    ? { dark: mix(base, "#000000", 0.35), light: mix(base, "#8FA3C4", 0.5) }
    : { dark: mix(base, "#1A0F08", 0.34), light: mix(base, "#FFF1DC", 0.32) };
}

/** 정규 좌표 도형을 채우고 외곽선을 입힌다. 큰 그림은 붓 고리, 작은 그림은 단순 스트로크. */
function shape(c: Ctx, out: InkOp[], norm: readonly Pt[], fill: string, smooth = 2, lwScale = 0.92): void {
  if (c.ink !== c.face) lwScale *= 0.62;
  const world = norm.map(([x, y]) => c.P(x, y));
  const pts = smooth ? chaikin(world, c.lod === 2 ? smooth : Math.min(smooth, 1), true) : world;
  const d = polyPath(pts);
  if (c.lod === 2) {
    out.push({ d, fill });
    out.push({ d: ring(pts, c.lw * lwScale, c.seed + pts.length), fill: c.ink });
  } else {
    out.push({ d, fill, stroke: c.ink, sw: c.lw * lwScale });
  }
}

/** 머리카락 결 한 가닥(정규 좌표 2차 곡선 → 얇은 스트로크). */
function strand(c: Ctx, out: InkOp[], a: Pt, ctrl: Pt, b: Pt, tone: string, o: number, sw?: number): void {
  const A = c.P(a[0], a[1]);
  const C = c.P(ctrl[0], ctrl[1]);
  const B = c.P(b[0], b[1]);
  out.push({
    d: `M${fmt(A[0])} ${fmt(A[1])}Q${fmt(C[0])} ${fmt(C[1])} ${fmt(B[0])} ${fmt(B[1])}`,
    stroke: tone,
    sw: sw ?? Math.max(0.32, c.r * 0.03),
    o,
  });
}

/** 삐죽한 앞머리 선: 기준선을 잘게 나눠 번갈아 얼굴 쪽·위쪽으로 민다. */
function teeth(line: readonly Pt[], spacing: number, chop: number, seed: number): Pt[] {
  const L = pathLen(line);
  const n = Math.max(3, Math.round(L / spacing));
  const base = resample(line, n + 1);
  const rn = mulberry(seed * 17 + 1);
  return base.map((p, i) => {
    if (i === 0 || i === n) return p;
    const dx = 0 - p[0];
    const dy = 0.25 - p[1];
    const dl = Math.hypot(dx, dy) || 1;
    const a = i % 2 === 1 ? chop * (0.7 + rn() * 0.7) : -chop * (0.2 + rn() * 0.35);
    return [p[0] + (dx / dl) * a, p[1] + (dy / dl) * a];
  });
}

interface CapOpts {
  a0?: number;
  a1?: number;
  R?: number;
  crown?: Pt;
  chop?: number;
}

/** 머리 윗부분을 덮는 머리카락: 바깥 호 + 삐죽한 앞머리 선 + 정수리에서 퍼지는 결. */
function hairCap(c: Ctx, out: InkOp[], line: readonly Pt[], o: CapOpts = {}): void {
  const a0 = o.a0 ?? -178;
  const a1 = o.a1 ?? -2;
  const R = o.R ?? 1.1;
  const nz = noise(c.seed + 21, 6);
  const outer: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const a = lerp(a0, a1, t) * DEG;
    const rr = R * (1 + 0.016 * nz(t));
    outer.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  const spacing = c.lod === 2 ? 0.19 : c.lod === 1 ? 0.27 : 0.42;
  const chop = o.chop ?? (c.lod === 0 ? 0.08 : 0.06);
  const hl = teeth(line, spacing, chop, c.seed + 3);
  shape(c, out, [...outer, ...hl], c.base);
  // 결: 정수리 → 앞머리 끝
  const crown = o.crown ?? [0, -1.02];
  const rn = mulberry(c.seed + 41);
  const stepEvery = c.lod === 2 ? 1 : 2;
  hl.forEach((p, i) => {
    if (i === 0 || i === hl.length - 1 || i % stepEvery !== 0 || c.lod === 0) return;
    const start: Pt = [lerp(crown[0], p[0], 0.1), lerp(crown[1], p[1], 0.1)];
    const end: Pt = [lerp(crown[0], p[0], 0.9), lerp(crown[1], p[1], 0.9)];
    const m = mid(start, end);
    const ml = Math.hypot(m[0], m[1]) || 1;
    const ctrl: Pt = [m[0] + (m[0] / ml) * 0.1, m[1] + (m[1] / ml) * 0.1];
    strand(c, out, start, ctrl, end, i % 2 ? c.light : c.dark, 0.55 + rn() * 0.3);
    if (c.lod === 2) {
      const q: Pt = [p[0] + (hl[Math.min(i + 1, hl.length - 1)][0] - p[0]) * 0.5, p[1]];
      const e2: Pt = [lerp(crown[0], q[0], 0.82), lerp(crown[1], q[1], 0.82)];
      strand(c, out, [lerp(crown[0], q[0], 0.2), lerp(crown[1], q[1], 0.2)], ctrl, e2, i % 2 ? c.dark : c.light, 0.4);
    }
  });
}

/** 가늘어지는 머리 다발(포니테일·양갈래·긴 옆머리). half = 굵기 반값 함수. */
function ribbon(c: Ctx, out: InkOp[], line: readonly Pt[], half: (t: number) => number): void {
  const smoothLine = chaikin(line, 2, false);
  const n = c.lod === 2 ? 22 : 12;
  const cl = resample(smoothLine, n + 1);
  const L: Pt[] = [];
  const R: Pt[] = [];
  const nrm = (i: number): Pt => {
    const a = cl[Math.max(0, i - 1)];
    const b = cl[Math.min(n, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  for (let i = 0; i <= n; i++) {
    const nn = nrm(i);
    const h = half(i / n);
    L.push([cl[i][0] + nn[0] * h, cl[i][1] + nn[1] * h]);
    R.push([cl[i][0] - nn[0] * h, cl[i][1] - nn[1] * h]);
  }
  shape(c, out, [...L, ...[...R].reverse()], c.base, 1);
  if (c.lod === 0) return;
  const rn = mulberry(c.seed + 77);
  const count = c.lod === 2 ? 9 : 4;
  for (let k = 0; k < count; k++) {
    const f = ((k + 0.5) / count) * 2 - 1 + (rn() - 0.5) * 0.12;
    const A = Math.floor(n * (0.03 + rn() * 0.1));
    const B = Math.floor(n * (0.72 + rn() * 0.24));
    const pts: Pt[] = [];
    for (let i = A; i <= B; i += 2) {
      const nn = nrm(i);
      const h = half(i / n) * f * 0.82;
      pts.push(c.P(cl[i][0] + nn[0] * h, cl[i][1] + nn[1] * h));
    }
    if (pts.length < 2) continue;
    out.push({
      d: polyPath(chaikin(pts, 1, false), false),
      stroke: k % 2 ? c.light : c.dark,
      sw: Math.max(0.32, c.r * 0.03),
      o: 0.6,
    });
  }
}

/** 곱슬 구름 외곽: 기준점 사이를 바깥으로 부풀린 호로 잇는다. */
function cloudPath(c: Ctx, base: readonly Pt[], pad: number, closed = true): string {
  const pts = base.map(([x, y]) => c.P(x, y));
  const n = pts.length;
  let s = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const m = mid(a, b);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    // 호는 진행 방향 왼쪽(화면 기준 바깥)으로 부푼다
    const px = dy * pad;
    const py = -dx * pad;
    s += `Q${fmt(m[0] + px)} ${fmt(m[1] + py)} ${fmt(b[0])} ${fmt(b[1])}`;
  }
  return closed ? `${s}Z` : s;
}

function curls(c: Ctx, out: InkOp[], count: number, place: (i: number, rn: () => number) => Pt, size = 0.1): void {
  const rn = mulberry(c.seed + 91);
  for (let i = 0; i < count; i++) {
    const [x, y] = place(i, rn);
    const a = rn() * Math.PI * 2;
    const s = size * (0.7 + rn() * 0.6);
    const A: Pt = [x + Math.cos(a) * s, y + Math.sin(a) * s];
    const B: Pt = [x + Math.cos(a + 2.4) * s, y + Math.sin(a + 2.4) * s];
    const C: Pt = [x + Math.cos(a + 1.2) * s * 2, y + Math.sin(a + 1.2) * s * 2];
    strand(c, out, A, C, B, i % 4 === 0 ? c.dark : c.light, 0.85, Math.max(0.4, c.r * 0.038));
  }
}

const LINE_CROP: Pt[] = [[1.02, -0.06], [0.84, -0.36], [0.45, -0.54], [0.02, -0.6], [-0.42, -0.54], [-0.82, -0.36], [-1.02, -0.06]];
const LINE_SWEPT: Pt[] = [[1.02, 0.02], [0.9, -0.28], [0.55, -0.46], [0.12, -0.56], [-0.2, -0.7], [-0.46, -0.82], [-0.68, -0.6], [-0.92, -0.32], [-1.02, -0.04]];
const LINE_FRINGE: Pt[] = [[1.03, 0.1], [0.94, -0.14], [0.52, -0.26], [0, -0.3], [-0.52, -0.26], [-0.94, -0.14], [-1.03, 0.1]];
const LINE_PART: Pt[] = [[1.03, 0.16], [0.9, -0.2], [0.56, -0.52], [0.18, -0.74], [0, -0.82], [-0.18, -0.74], [-0.56, -0.52], [-0.9, -0.2], [-1.03, 0.16]];

function hairBack(c: Ctx, style: HairStyle, out: InkOp[]): void {
  const rn = mulberry(c.seed + 55);
  switch (style) {
    case "bob": {
      const poly: Pt[] = [[-1.06, -0.55], [-1.24, 0.05], [-1.26, 0.6], [-1.08, 0.94], [-0.62, 1.0], [0.62, 1.0], [1.08, 0.94], [1.26, 0.6], [1.24, 0.05], [1.06, -0.55]];
      shape(c, out, poly, c.base);
      if (c.lod > 0) {
        const n = c.lod === 2 ? 7 : 3;
        for (let side = -1; side <= 1; side += 2)
          for (let i = 0; i < n; i++) {
            const x = side * (1.06 + (i / Math.max(1, n - 1)) * 0.14);
            strand(c, out, [x, 0.1 + rn() * 0.12], [x + side * 0.05, 0.5], [x - side * 0.04, 0.86], i % 2 ? c.light : c.dark, 0.6);
          }
      }
      return;
    }
    case "long": {
      const poly: Pt[] = [[-1.04, -0.6], [-1.25, 0.1], [-1.31, 0.9], [-1.25, 1.5], [-0.98, 1.84], [-0.62, 1.7], [-0.3, 1.5], [0, 1.44], [0.3, 1.5], [0.62, 1.7], [0.98, 1.84], [1.25, 1.5], [1.31, 0.9], [1.25, 0.1], [1.04, -0.6]];
      shape(c, out, poly, c.base);
      if (c.lod > 0) {
        const n = c.lod === 2 ? 8 : 3;
        for (let side = -1; side <= 1; side += 2)
          for (let i = 0; i < n; i++) {
            const x = side * (0.74 + (i / Math.max(1, n - 1)) * 0.46);
            strand(c, out, [x + side * 0.12, 0.3 + rn() * 0.3], [x + side * 0.14, 1.05], [x, 1.42 + rn() * 0.2], i % 2 ? c.light : c.dark, 0.6);
          }
      }
      return;
    }
    case "ponytail": {
      const tail: Pt[] = ([[0.56, -0.86], [1.02, -1.16], [1.52, -1.0], [1.8, -0.42], [1.74, 0.28], [1.46, 0.86]] as Pt[]).map(([x, y]) => [x * c.tail, y] as Pt);
      ribbon(c, out, tail, (t) => (t < 0.08 ? 0.13 + t * 2 : 0.3 * Math.pow(1 - t, 0.55) + 0.02));
      return;
    }
    case "pigtails": {
      for (const s of [-1, 1]) {
        const tail: Pt[] = [[s * 0.9, -0.34], [s * 1.34, -0.14], [s * 1.58, 0.38], [s * 1.52, 0.96], [s * 1.3, 1.3]];
        ribbon(c, out, tail, (t) => (t < 0.1 ? 0.13 + t : 0.27 * Math.pow(1 - t, 0.6) + 0.02));
      }
      return;
    }
    case "bun": {
      const pts = blob(0.02, -1.36, 0.42, c.seed, 2, 18);
      shape(c, out, pts, c.base, 1);
      if (c.lod > 0) {
        strand(c, out, [-0.26, -1.36], [0, -1.68], [0.28, -1.34], c.light, 0.6);
        strand(c, out, [-0.2, -1.2], [0.04, -1.5], [0.26, -1.2], c.dark, 0.6);
      }
      return;
    }
    case "afro": {
      const count = c.lod === 0 ? 12 : c.lod === 1 ? 16 : 22;
      const base: Pt[] = [];
      for (let i = 0; i < count; i++) {
        const a = -Math.PI / 2 + (i / count) * Math.PI * 2;
        base.push([Math.cos(a) * (1.5 + rn() * 0.06), -0.3 + Math.sin(a) * (1.42 + rn() * 0.06)]);
      }
      const d = cloudPath(c, base, 0.34);
      out.push({ d, fill: c.base, stroke: c.ink, sw: c.lw * 0.9 });
      if (c.lod > 0)
        curls(c, out, c.lod === 2 ? 46 : 16, (_i, r) => {
          const a = r() * Math.PI * 2;
          const q = 0.55 + r() * 0.42;
          return [Math.cos(a) * 1.5 * q, -0.3 + Math.sin(a) * 1.42 * q];
        }, 0.08);
      return;
    }
    default:
  }
}

function hairFront(c: Ctx, style: HairStyle, out: InkOp[]): void {
  switch (style) {
    case "crop":
      hairCap(c, out, LINE_CROP);
      return;
    case "swept":
      hairCap(c, out, LINE_SWEPT, { crown: [-0.46, -1.04] });
      return;
    case "fringe":
      hairCap(c, out, LINE_FRINGE, { R: 1.12, chop: 0.05 });
      return;
    case "bob":
      hairCap(c, out, LINE_FRINGE, { R: 1.13, chop: 0.05 });
      return;
    case "long":
    case "pigtails":
      hairCap(c, out, LINE_PART, { R: 1.11, chop: 0.03, crown: [0, -1.04] });
      if (style === "pigtails") {
        for (const s of [-1, 1]) {
          const tie = blob(s * 0.98, -0.36, 0.13, c.seed + s, 2, 10).map(([x, y]) => c.P(x, y));
          out.push({ d: closedPath(tie), fill: c.accent, stroke: c.ink, sw: c.lw * 0.7 });
        }
      }
      return;
    case "ponytail": {
      hairCap(c, out, LINE_SWEPT, { crown: [-0.46, -1.04] });
      const tie = blob(0.6 * c.tail, -0.9, 0.15, c.seed + 2, 2, 10).map(([x, y]) => c.P(x, y));
      out.push({ d: closedPath(tie), fill: c.accent, stroke: c.ink, sw: c.lw * 0.7 });
      return;
    }
    case "bun": {
      hairCap(c, out, LINE_PART, { R: 1.1, chop: 0.03, crown: [0, -1.04] });
      const tie = chaikin([[-0.26, -1.0], [0.02, -1.08], [0.3, -0.99]].map(([x, y]) => c.P(x, y)), 1, false);
      out.push({ d: polyPath(tie, false), stroke: c.accent, sw: Math.max(1, c.r * 0.09) });
      return;
    }
    case "spiky": {
      const tips: [number, number][] = [[-170, 1.14], [-150, 1.38], [-128, 1.3], [-108, 1.5], [-88, 1.38], [-66, 1.52], [-44, 1.32], [-24, 1.36], [-6, 1.12]];
      const lean = 7; // 끝이 한쪽으로 쏠린 삐침
      const outer: Pt[] = [];
      tips.forEach(([deg, rad], i) => {
        const a = (deg + lean) * DEG;
        outer.push([Math.cos(a) * rad, Math.sin(a) * rad]);
        if (i < tips.length - 1) {
          const b = ((deg + tips[i + 1][0]) / 2) * DEG;
          outer.push([Math.cos(b) * 1.08, Math.sin(b) * 1.08]);
        }
      });
      const hl = teeth(LINE_CROP, c.lod === 2 ? 0.22 : 0.36, 0.07, c.seed + 3);
      out.push({ d: polyPath([...outer, ...hl].map(([x, y]) => c.P(x, y))), fill: c.base, stroke: c.ink, sw: c.lw * 0.88 });
      if (c.lod > 0) {
        tips.forEach(([deg, rad], i) => {
          if (i === 0 || i === tips.length - 1) return;
          const a = (deg + lean) * DEG;
          const tip: Pt = [Math.cos(a) * (rad - 0.14), Math.sin(a) * (rad - 0.14)];
          const a0 = deg * DEG;
          const rootR = lerp(0.74, 1.04, Math.abs(Math.cos(a0)));
          const root: Pt = [Math.cos(a0) * rootR, Math.sin(a0) * rootR];
          strand(c, out, root, mid(root, tip), tip, i % 2 ? c.light : c.dark, 0.75);
        });
      }
      return;
    }
    case "curly": {
      const count = c.lod === 0 ? 9 : 13;
      const base: Pt[] = [];
      for (let i = 0; i <= count; i++) {
        const a = lerp(-196, 16, i / count) * DEG;
        base.push([Math.cos(a) * 1.2, Math.sin(a) * 1.2]);
      }
      const hairline: Pt[] = LINE_CROP.map(([x, y]) => [x * 1.02, y + 0.06] as Pt);
      const inner = resample(hairline, c.lod === 0 ? 4 : 7);
      const poly = [...base, ...inner];
      const d = cloudPath(c, poly, 0.34);
      out.push({ d, fill: c.base, stroke: c.ink, sw: c.lw * 0.9 });
      if (c.lod > 0)
        curls(c, out, c.lod === 2 ? 24 : 8, (_i, r) => {
          const a = lerp(-165, -15, r()) * DEG;
          const q = 0.72 + r() * 0.42;
          return [Math.cos(a) * q, Math.sin(a) * q];
        }, 0.08);
      return;
    }
    case "afro": {
      const base: Pt[] = resample(LINE_CROP.map(([x, y]) => [x * 1.02, y + 0.02] as Pt), c.lod === 0 ? 5 : 8);
      const top: Pt[] = [[-1.04, -0.5], [-0.5, -1.04], [0.5, -1.04], [1.04, -0.5]];
      const d = cloudPath(c, [...top, ...base], 0.3);
      out.push({ d, fill: c.base });
      const inner = cloudPath(c, base, 0.3, false);
      out.push({ d: inner, stroke: c.ink, sw: c.lw * 0.85 });
      return;
    }
    default:
  }
}

function hatOps(c: Ctx, look: Look, out: InkOp[]): void {
  if (!look.hat) return;
  const color = look.hatColor ?? "#E8590C";
  const dark = mix(color, "#000000", 0.26);
  const light = mix(color, "#FFFFFF", 0.3);
  const rn = mulberry(c.seed + 13);
  if (look.hat === "beanie") {
    const dome: Pt[] = [[-1.04, -0.36], [-1.0, -0.82], [-0.62, -1.2], [0, -1.34], [0.62, -1.2], [1.0, -0.82], [1.04, -0.36]];
    const band: Pt[] = [[-1.12, -0.5], [-0.6, -0.62], [0, -0.66], [0.6, -0.62], [1.12, -0.5], [1.12, -0.12], [0.6, -0.26], [0, -0.3], [-0.6, -0.26], [-1.12, -0.12]];
    shape(c, out, dome, color);
    if (c.lod > 0) {
      const n = c.lod === 2 ? 11 : 6;
      for (let i = 1; i < n; i++) {
        const x = lerp(-0.92, 0.92, i / n);
        strand(c, out, [x * 0.3, -1.24], [x * 0.9, -1.02], [x, -0.66 + Math.abs(x) * 0.12], i % 2 ? dark : light, 0.75);
      }
    }
    shape(c, out, band, mix(color, "#000000", 0.08), 1);
    if (c.lod > 0) {
      const n = c.lod === 2 ? 22 : 9;
      for (let i = 1; i < n; i++) {
        const x = lerp(-1.06, 1.06, i / n);
        const up = -0.6 + Math.abs(x) * 0.1;
        strand(c, out, [x, up], [x, up + 0.16], [x * 1.01, up + 0.34], dark, 0.8);
      }
    }
    return;
  }
  if (look.hat === "straw") {
    const straw = look.hatColor ?? "#E7C873";
    const sd = mix(straw, "#7A5316", 0.42);
    const sl = mix(straw, "#FFFFFF", 0.4);
    const brim: Pt[] = [[-1.5, -0.58], [-1.0, -0.78], [0, -0.86], [1.0, -0.78], [1.5, -0.58], [1.0, -0.42], [0, -0.36], [-1.0, -0.42]];
    shape(c, out, brim, straw, 2);
    const crown: Pt[] = [[-0.72, -0.62], [-0.68, -1.1], [-0.3, -1.34], [0.3, -1.34], [0.68, -1.1], [0.72, -0.62], [0, -0.54]];
    shape(c, out, crown, mix(straw, "#FFFFFF", 0.1), 2);
    if (c.lod > 0) {
      const a = c.P(-0.72, -0.72);
      const m = c.P(0, -0.6);
      const b = c.P(0.72, -0.72);
      out.push({ d: `M${fmt(a[0])} ${fmt(a[1])}Q${fmt(m[0])} ${fmt(m[1])} ${fmt(b[0])} ${fmt(b[1])}`, stroke: look.accent ?? "#C0392E", sw: Math.max(1, c.r * 0.12) });
      const n = c.lod === 2 ? 9 : 4;
      for (let i = 1; i < n; i++) {
        const x = lerp(-1.3, 1.3, i / n);
        strand(c, out, [x * 0.74, -0.74 + Math.abs(x) * 0.04], [x * 0.88, -0.6], [x, -0.5 - Math.abs(x) * 0.02], i % 2 ? sd : sl, 0.75);
      }
      for (let i = 1; i < n - 2; i++) {
        const x = lerp(-0.6, 0.6, i / (n - 2));
        strand(c, out, [x * 0.5, -1.28], [x * 1.1, -1.02], [x, -0.74], i % 2 ? sd : sl, 0.7);
      }
    }
    return;
  }
  // cap: 앞을 보는 쪽(+x)으로 챙이 나온다
  const dome: Pt[] = [[-1.06, -0.3], [-1.0, -0.8], [-0.56, -1.18], [0.06, -1.26], [0.66, -1.12], [1.02, -0.72], [1.06, -0.3], [0.5, -0.46], [-0.5, -0.46]];
  shape(c, out, dome, color);
  if (c.lod > 0) {
    strand(c, out, [0.04, -1.2], [0.42, -0.86], [0.46, -0.5], dark, 0.7);
    strand(c, out, [0.02, -1.2], [-0.42, -0.86], [-0.46, -0.5], dark, 0.7);
    strand(c, out, [-0.82, -0.86], [-0.5, -1.06], [-0.2, -1.12], light, 0.8);
  }
  const bill: Pt[] = [[0.42, -0.5], [1.06, -0.36], [1.62, -0.2], [1.6, -0.04], [1.06, -0.12], [0.5, -0.24]];
  shape(c, out, bill, dark, 1);
  const btn = blob(0.04, -1.27, 0.08, c.seed, 2, 8).map(([x, y]) => c.P(x, y));
  out.push({ d: closedPath(btn), fill: dark, stroke: c.ink, sw: c.lw * 0.5 });
  void rn;
}

/* ── 얼굴 ─────────────────────────────────────────────────── */

function faceOps(c: Ctx, mood: Mood, facing: number, look: Look, out: InkOp[]): void {
  const dx = facing === 0 ? 0 : 0.16;
  const ex = 0.3;
  const ey = look.glasses ? 0 : -0.02;
  const eyeR = Math.max(0.085, 0.72 / c.r); // 어떤 크기에서도 최소 약 0.7px
  const eye = (x: number, y: number, k = 1): void => {
    const p = c.P(x, y);
    const rx = eyeR * c.r * 0.92 * k;
    const ry = eyeR * c.r * 1.12 * k;
    out.push({
      d: `M${fmt(p[0] - rx)} ${fmt(p[1])}a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(rx * 2)} 0a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(-rx * 2)} 0Z`,
      fill: c.face,
    });
  };
  const line = (a: Pt, ctrl: Pt, b: Pt, w = 0.62): void => {
    const A = c.P(a[0], a[1]);
    const C = c.P(ctrl[0], ctrl[1]);
    const B = c.P(b[0], b[1]);
    out.push({
      d: `M${fmt(A[0])} ${fmt(A[1])}Q${fmt(C[0])} ${fmt(C[1])} ${fmt(B[0])} ${fmt(B[1])}`,
      stroke: c.face,
      sw: Math.max(0.8, c.lw * w),
    });
  };
  const L = -ex + dx;
  const R = ex + dx;
  const mx = dx;
  // 볼터치
  if (c.lod > 0 && mood !== "none") {
    for (const x of [L - 0.2, R + 0.2]) {
      const p = c.P(x, 0.27);
      const rx = 0.17 * c.r;
      const ry = 0.1 * c.r;
      out.push({
        d: `M${fmt(p[0] - rx)} ${fmt(p[1])}a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(rx * 2)} 0a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(-rx * 2)} 0Z`,
        fill: "#F2917F",
        o: 0.32,
      });
    }
  }
  switch (mood) {
    case "none":
      return;
    case "calm":
      eye(L, ey);
      eye(R, ey);
      return;
    case "ok":
      eye(L, ey);
      eye(R, ey);
      line([mx - 0.22, 0.38], [mx, 0.55], [mx + 0.22, 0.38]);
      return;
    case "joy": {
      line([L - 0.14, ey + 0.05], [L, ey - 0.16], [L + 0.14, ey + 0.05]);
      line([R - 0.14, ey + 0.05], [R, ey - 0.16], [R + 0.14, ey + 0.05]);
      const a = c.P(mx - 0.3, 0.32);
      const b = c.P(mx + 0.3, 0.32);
      const q = c.P(mx, 0.86);
      out.push({ d: `M${fmt(a[0])} ${fmt(a[1])}Q${fmt(q[0])} ${fmt(q[1])} ${fmt(b[0])} ${fmt(b[1])}Z`, fill: "#7A2E2A", stroke: c.face, sw: Math.max(0.7, c.lw * 0.5) });
      return;
    }
    case "sad":
      eye(L, ey + 0.03);
      eye(R, ey + 0.03);
      line([mx - 0.2, 0.52], [mx, 0.36], [mx + 0.2, 0.52]);
      if (c.lod > 0) {
        line([L - 0.14, -0.3], [L, -0.3], [L + 0.13, -0.38], 0.45);
        line([R - 0.13, -0.38], [R, -0.3], [R + 0.14, -0.3], 0.45);
      }
      return;
    case "wow": {
      eye(L, ey, 1.25);
      eye(R, ey, 1.25);
      const p = c.P(mx, 0.48);
      const rx = 0.11 * c.r;
      const ry = 0.15 * c.r;
      out.push({
        d: `M${fmt(p[0] - rx)} ${fmt(p[1])}a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(rx * 2)} 0a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(-rx * 2)} 0Z`,
        fill: c.face,
      });
      return;
    }
    case "hmm":
      eye(L, ey);
      eye(R, ey);
      line([mx - 0.16, 0.46], [mx + 0.04, 0.4], [mx + 0.22, 0.34]);
      if (c.lod > 0) line([R - 0.14, -0.3], [R, -0.42], [R + 0.15, -0.32], 0.45);
      return;
    case "worry":
      eye(L, ey);
      eye(R, ey);
      line([mx - 0.2, 0.48], [mx, 0.38], [mx + 0.2, 0.48]);
      if (c.lod > 0) {
        line([L - 0.14, -0.26], [L, -0.34], [L + 0.14, -0.4], 0.45);
        line([R - 0.14, -0.4], [R, -0.34], [R + 0.14, -0.26], 0.45);
      }
      return;
    case "focus":
      eye(L, ey);
      eye(R, ey);
      line([mx - 0.16, 0.44], [mx, 0.45], [mx + 0.16, 0.44]);
      if (c.lod > 0) {
        line([L - 0.15, -0.28], [L, -0.26], [L + 0.15, -0.26], 0.45);
        line([R - 0.15, -0.26], [R, -0.26], [R + 0.15, -0.28], 0.45);
      }
      return;
    case "mad":
      eye(L, ey + 0.03);
      eye(R, ey + 0.03);
      line([mx - 0.2, 0.5], [mx, 0.38], [mx + 0.2, 0.5]);
      line([L - 0.16, -0.36], [L, -0.26], [L + 0.15, -0.18], 0.55);
      line([R - 0.15, -0.18], [R, -0.26], [R + 0.16, -0.36], 0.55);
      return;
  }
}

function glassesOps(c: Ctx, look: Look, facing: number, out: InkOp[], phase: "lens" | "frame"): void {
  if (!look.glasses) return;
  const dx = facing === 0 ? 0 : 0.16;
  const cxL = -0.32 + dx;
  const cxR = 0.32 + dx;
  const R = 0.27;
  const y = 0;
  const lens = (cx: number): string => {
    if (look.glasses === "round") {
      const pts = blob(cx, y, R, c.seed + (cx > 0 ? 1 : 2), 1.4, 14).map(([x, yy]) => c.P(x, yy));
      return closedPath(pts);
    }
    const pts: Pt[] = [[cx - R, y - R * 0.78], [cx + R, y - R * 0.78], [cx + R, y + R * 0.78], [cx - R, y + R * 0.78]];
    return closedPath(chaikin(pts.map(([x, yy]) => c.P(x, yy)), 2, true));
  };
  const sw = Math.max(0.85, c.lw * 0.78);
  if (phase === "lens") {
    for (const cx of [cxL, cxR]) out.push({ d: lens(cx), fill: "#FFFFFF", o: 0.42 });
    return;
  }
  for (const cx of [cxL, cxR]) out.push({ d: lens(cx), stroke: c.face, sw });
  const a = c.P(cxL + R, y - 0.03);
  const m = c.P((cxL + cxR) / 2, y - 0.1);
  const b = c.P(cxR - R, y - 0.03);
  out.push({ d: `M${fmt(a[0])} ${fmt(a[1])}Q${fmt(m[0])} ${fmt(m[1])} ${fmt(b[0])} ${fmt(b[1])}`, stroke: c.face, sw: sw * 0.9 });
  const edge = (from: Pt, to: Pt): void => {
    const A = c.P(from[0], from[1]);
    const B = c.P(to[0], to[1]);
    out.push({ d: `M${fmt(A[0])} ${fmt(A[1])}L${fmt(B[0])} ${fmt(B[1])}`, stroke: c.face, sw: sw * 0.85 });
  };
  edge([cxR + R, y - 0.04], [0.99, y - 0.1]);
  if (facing === 0) edge([cxL - R, y - 0.04], [-0.99, y - 0.1]);
  // 렌즈 빛 반사
  if (c.lod > 0) {
    for (const cx of [cxL, cxR]) {
      const A = c.P(cx - 0.12, y - 0.1);
      const B = c.P(cx + 0.02, y - 0.17);
      out.push({ d: `M${fmt(A[0])} ${fmt(A[1])}L${fmt(B[0])} ${fmt(B[1])}`, stroke: "#FFFFFF", sw: Math.max(0.5, c.r * 0.045), o: 0.9 });
    }
  }
}

function stubbleOps(c: Ctx, out: InkOp[]): void {
  const rn = mulberry(c.seed + 201);
  const count = c.lod === 2 ? 70 : c.lod === 1 ? 24 : 0;
  for (let i = 0; i < count; i++) {
    const a = lerp(28, 152, rn()) * DEG;
    const q = 0.72 + rn() * 0.26;
    const p = c.P(Math.cos(a) * q, Math.sin(a) * q);
    const s = Math.max(0.28, c.r * 0.022);
    out.push({ d: `M${fmt(p[0])} ${fmt(p[1])}h${fmt(s)}`, stroke: "#4A3B33", sw: s, o: 0.55 + rn() * 0.3 });
  }
}

function gogglesOps(c: Ctx, out: InkOp[]): void {
  const strap = chaikin([[-1.02, -0.56], [-0.5, -0.82], [0.5, -0.82], [1.02, -0.56]].map(([x, y]) => c.P(x, y)), 2, false);
  out.push({ d: polyPath(strap, false), stroke: "#5B4636", sw: Math.max(1.2, c.r * 0.13) });
  for (const cx of [-0.32, 0.32]) {
    const outer = blob(cx, -0.76, 0.26, c.seed + 4, 1.2, 12).map(([x, y]) => c.P(x, y));
    const inner = blob(cx, -0.76, 0.17, c.seed + 5, 1.2, 10).map(([x, y]) => c.P(x, y));
    out.push({ d: closedPath(outer), fill: "#C99A3E", stroke: c.ink, sw: c.lw * 0.7 });
    out.push({ d: closedPath(inner), fill: "#CFEFF2", stroke: c.ink, sw: c.lw * 0.45 });
  }
}

/* ── 몸(실험복) ───────────────────────────────────────────── */

function coatOps(c: Ctx, neck: Pt, hip: Pt, facing: number, out: InkOp[]): void {
  const dx = hip[0] - neck[0];
  const dy = hip[1] - neck[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const nx = -uy;
  const ny = ux;
  const r = c.r;
  const at = (t: number, s: number): Pt => [neck[0] + ux * L * t + nx * s * r, neck[1] + uy * L * t + ny * s * r];
  const hem = 1.12;
  const body = chaikin([at(0, 0.3), at(0.16, 0.56), at(0.62, 0.62), at(hem, 0.68), at(hem, -0.68), at(0.62, -0.62), at(0.16, -0.56), at(0, -0.3)], 2, true);
  out.push({ d: polyPath(body), fill: "#FFFFFF" });
  // 옆판 그늘(옷의 부피)
  const side = facing < 0 ? 1 : -1;
  const shade = chaikin([at(0.14, side * 0.3), at(hem, side * 0.3), at(hem, side * 0.66), at(0.62, side * 0.6), at(0.18, side * 0.52)], 1, true);
  out.push({ d: polyPath(shade), fill: "#CBD6E4", o: 0.55 });
  out.push({ d: ring(body, c.lw * 0.74, c.seed + 6, 0.16), fill: c.face });
  out.push({ d: brush([at(0.2, 0), at(hem, 0)], c.lw * 0.62, c.seed + 9, { tIn: 1, tOut: 1, vary: 0.12 }), fill: c.face });
  if (c.lod > 0) {
    // 옷깃: 목에서 앞섶으로 모이는 두 획
    for (const s of [1, -1]) {
      const collar = chaikin([at(0.02, s * 0.3), at(0.14, s * 0.24), at(0.22, 0)], 1, false);
      out.push({ d: polyPath(collar, false), stroke: c.face, sw: c.lw * 0.62 });
    }
    // 주머니(스틱스텝 틸 포인트)
    const pkSide = facing < 0 ? -1 : 1;
    const pk: Pt[] = [at(0.6, pkSide * 0.14), at(0.6, pkSide * 0.46), at(0.8, pkSide * 0.46), at(0.8, pkSide * 0.14)];
    out.push({ d: polyPath(pk), fill: "#2AB8A6", stroke: c.face, sw: c.lw * 0.5 });
  }
}

/* ── 조립 ─────────────────────────────────────────────────── */

export interface FigureSpec {
  /** 머리 중심·반지름(기존 스틱맨 circle과 같은 값). */
  head: { x: number; y: number; r: number };
  /** 몸통·팔다리 path 또는 폴리라인 목록. */
  body: string | readonly (readonly Pt[])[];
  look?: Look | LookName;
  mood?: Mood;
  /** -1 왼쪽, 0 정면, 1 오른쪽. */
  facing?: -1 | 0 | 1;
  /** 다크 무대면 몸·외곽선을 밝게(얼굴은 피부 위라 그대로 어둡다). */
  scheme?: "light" | "dark";
  /** 선 굵기 직접 지정(기본은 머리 크기 비례). */
  lw?: number;
  seed?: number;
  /** 접촉 그림자 y(지정 시 발밑에 그림자). */
  ground?: number;
}

function resolveLook(l: Look | LookName | undefined): Look {
  if (!l) return {};
  return typeof l === "string" ? LOOKS[l] : l;
}

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

const LIGHT_INK = "#E8EEF8";
/** 다크 무대에서 머리·머리카락 외곽선 굵기 배율(몸 선보다 얇게. 굵으면 흰 테가 헬멧처럼 보인다). */
const darkRing = 0.5;
const DARK_INK = "#191F28";

function lineWeight(r: number): number {
  return clamp(0.88 + r * 0.098, 1.5, 9);
}

function makeCtx(spec: FigureSpec, look: Look, x: number, y: number): Ctx {
  const r = spec.head.r;
  const facing = spec.facing ?? 0;
  const flip = facing < 0 ? -1 : 1;
  const lod: 0 | 1 | 2 = r >= 20 ? 2 : r >= 9.5 ? 1 : 0;
  const hairBase = look.hairColor ?? HAIR.black;
  const tones = hairTones(hairBase);
  return {
    P: (px, py) => [x + flip * px * r, y + py * r],
    r,
    lw: spec.lw ?? lineWeight(r),
    seed: spec.seed ?? 11 + (hashStr(JSON.stringify(look)) % 97),
    lod,
    ink: spec.scheme === "dark" ? LIGHT_INK : DARK_INK,
    face: DARK_INK,
    base: hairBase,
    dark: tones.dark,
    light: tones.light,
    accent: look.accent ?? "#3182F6",
    tail: facing === 0 ? 1 : -1,
  };
}

/** 머리 앞쪽(피부·얼굴·앞머리·안경·모자). x,y = 머리 중심. */
function headFrontOps(spec: FigureSpec, look: Look, x: number, y: number): InkOp[] {
  const c = makeCtx(spec, look, x, y);
  const r = c.r;
  const facing = spec.facing ?? 0;
  const flip = facing < 0 ? -1 : 1;
  const ops: InkOp[] = [];
  const head = blob(x, y, r, c.seed);
  const skin = look.skin ?? SKIN.peach;
  ops.push({ d: closedPath(head), fill: skin });
  if (c.lod > 0) {
    // 아래쪽 은은한 그늘(입체감)
    const crescent: Pt[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = lerp(8, 142, i / 14) * DEG;
      crescent.push([x + flip * Math.cos(a) * r * 0.985, y + Math.sin(a) * r * 0.985]);
    }
    for (let i = 14; i >= 0; i--) {
      const a = lerp(2, 148, i / 14) * DEG;
      crescent.push([x - flip * r * 0.09 + flip * Math.cos(a) * r * 0.93, y - r * 0.12 + Math.sin(a) * r * 0.93]);
    }
    ops.push({ d: closedPath(crescent), fill: mix(skin, "#C4674E", 0.42), o: 0.34 });
  }
  if (look.stubble) stubbleOps(c, ops);
  ops.push({ d: ring(head, c.lw * 1.04 * (spec.scheme === "dark" ? darkRing : 1), c.seed + 2, 0.22), fill: c.ink });
  glassesOps(c, look, facing, ops, "lens");
  faceOps(c, spec.mood ?? "ok", facing, look, ops);
  const style = look.hair ?? "none";
  if (style !== "none") hairFront(c, style, ops);
  glassesOps(c, look, facing, ops, "frame");
  if (look.goggles) gogglesOps(c, ops);
  hatOps(c, look, ops);
  return ops;
}

/** 머리 뒤쪽(뒷머리·꽁지). 몸보다 먼저 그린다. */
function headBackOps(spec: FigureSpec, look: Look, x: number, y: number): InkOp[] {
  const style = look.hair ?? "none";
  if (style === "none") return [];
  const c = makeCtx(spec, look, x, y);
  const ops: InkOp[] = [];
  hairBack(c, style, ops);
  return ops;
}

/** 몸: 서브패스를 몸통·다리·팔로 분류해 자연스럽게 휘게 한다. */
function bodyOps(spec: FigureSpec, look: Look): InkOp[] {
  const { x, y, r } = spec.head;
  const facing = spec.facing ?? 0;
  const c = makeCtx(spec, look, x, y);
  const lw = c.lw;
  const seed = c.seed;
  const limbInk = c.ink;
  const ops: InkOp[] = [];
  const subs = typeof spec.body === "string" ? parseBody(spec.body) : spec.body.map((s) => [...s]);
  if (!subs.length) return ops;
  const torso = subs.find((s) => Math.hypot(s[0][0] - x, s[0][1] - y) <= r * 1.6) ?? subs[0];
  const neck = torso[0];
  const hip = torso[torso.length - 1];

  const arms: { line: Pt[]; i: number }[] = [];
  const legs: { line: Pt[]; i: number }[] = [];
  subs.forEach((s, i) => {
    if (s === torso) return;
    if (Math.hypot(s[0][0] - hip[0], s[0][1] - hip[1]) < r * 0.7) legs.push({ line: [...s], i });
    else arms.push({ line: [...s], i });
  });

  const bowFor = (line: readonly Pt[], away: Pt, k: number): number => {
    const a = line[0];
    const b = line[line.length - 1];
    const mx = (a[0] + b[0]) / 2 - away[0];
    const my = (a[1] + b[1]) / 2 - away[1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    return (nx * mx + ny * my >= 0 ? 1 : -1) * k;
  };
  const drawLimb = (line: Pt[], i: number, kind: "torso" | "leg" | "arm"): void => {
    const bent = line.length > 2;
    const pts = bent ? chaikin(line, 2, false) : line;
    let bow = 0;
    if (!bent) {
      if (kind === "torso") bow = (seed % 2 ? 1 : -1) * 0.016;
      else if (kind === "leg") bow = bowFor(line, [hip[0], hip[1] - r], 0.03);
      else bow = bowFor(line, [x, y], 0.08);
    }
    ops.push({
      d: brush(pts, lw, seed + i * 7 + 1, {
        bow,
        tIn: kind === "arm" ? 0.92 : 0.95,
        tOut: kind === "torso" ? 0.95 : 0.62,
      }),
      fill: limbInk,
    });
  };
  legs.forEach((l) => drawLimb(l.line, l.i, "leg"));
  drawLimb([...torso], subs.indexOf(torso), "torso");
  if (look.coat) coatOps(c, neck, hip, facing, ops);
  arms.forEach((a) => drawLimb(a.line, a.i, "arm"));
  return ops;
}

function shadowOps(spec: FigureSpec): InkOp[] {
  if (spec.ground === undefined) return [];
  const { x, r } = spec.head;
  const rx = r * 1.55;
  const ry = Math.max(1.3, r * 0.3);
  const dark = spec.scheme === "dark";
  return [
    {
      d: `M${fmt(x - rx)} ${fmt(spec.ground)}a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(rx * 2)} 0a${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(-rx * 2)} 0Z`,
      fill: dark ? "#000000" : "#2A3A5E",
      o: dark ? 0.3 : 0.12,
    },
  ];
}

/** 스틱맨 한 명을 InkOp 목록으로. 그리는 순서 = 그림자 → 뒷머리 → 몸 → 머리·얼굴·앞머리 → 안경 → 모자. */
export function figureOps(spec: FigureSpec): InkOp[] {
  const look = resolveLook(spec.look);
  const { x, y } = spec.head;
  return [...shadowOps(spec), ...headBackOps(spec, look, x, y), ...bodyOps(spec, look), ...headFrontOps(spec, look, x, y)];
}

/** InkOp → SVG 조각. */
export function inkSvg(ops: readonly InkOp[]): string {
  let s = "";
  for (const op of ops) {
    const fill = op.fill ?? "none";
    const stroke = op.stroke ? ` stroke="${op.stroke}" stroke-width="${fmt(op.sw ?? 1)}" stroke-linecap="round" stroke-linejoin="round"` : "";
    const o = op.o !== undefined ? ` opacity="${fmt(op.o)}"` : "";
    s += `<path d="${op.d}" fill="${fill}"${stroke}${o}/>`;
  }
  return s;
}

/** 스틱맨 한 명 SVG 그룹. attrs로 class·id·style(애니메이션 훅)을 그대로 얹을 수 있다.
 *  부모 그룹의 stroke·fill을 물려받지 않게 각 path가 자기 값을 명시한다(stroke="none"이 기본). */
export function inkFigure(spec: FigureSpec, attrs = ""): string {
  return `<g data-ink="1" stroke="none"${attrs ? ` ${attrs}` : ""}>${inkSvg(figureOps(spec))}</g>`;
}

/* ── 캔버스 ───────────────────────────────────────────────── */

interface CompiledOp {
  p: Path2D;
  fill?: string;
  stroke?: string;
  sw?: number;
  o?: number;
}
const compile = (ops: readonly InkOp[]): CompiledOp[] => ops.map((op) => ({ p: new Path2D(op.d), fill: op.fill, stroke: op.stroke, sw: op.sw, o: op.o }));

function paintCompiled(ctx: CanvasRenderingContext2D, ops: readonly CompiledOp[]): void {
  const base = ctx.globalAlpha;
  for (const op of ops) {
    ctx.globalAlpha = base * (op.o ?? 1);
    if (op.fill) {
      ctx.fillStyle = op.fill;
      ctx.fill(op.p);
    }
    if (op.stroke) {
      ctx.strokeStyle = op.stroke;
      ctx.lineWidth = op.sw ?? 1;
      ctx.stroke(op.p);
    }
  }
  ctx.globalAlpha = base;
}

/** InkOp → 캔버스. */
export function paintInk(ctx: CanvasRenderingContext2D, ops: readonly InkOp[]): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  paintCompiled(ctx, compile(ops));
  ctx.restore();
}

// 머리(피부·머리카락·얼굴)는 프레임마다 같으므로 원점 기준으로 컴파일해 재사용한다(랩 rAF 부담 최소화).
const headCache = new Map<string, { back: CompiledOp[]; front: CompiledOp[] }>();

/** 스틱맨 한 명을 캔버스에. 몸만 매 프레임 새로 계산하고 머리는 캐시로 옮겨 찍는다. */
export function paintFigure(ctx: CanvasRenderingContext2D, spec: FigureSpec): void {
  const look = resolveLook(spec.look);
  const { x, y, r } = spec.head;
  const key = `${Math.round(r * 4) / 4}|${spec.mood ?? "ok"}|${spec.facing ?? 0}|${spec.scheme ?? "light"}|${spec.lw ?? ""}|${spec.seed ?? ""}|${JSON.stringify(look)}`;
  let head = headCache.get(key);
  if (!head) {
    if (headCache.size > 80) headCache.clear();
    head = { back: compile(headBackOps(spec, look, 0, 0)), front: compile(headFrontOps(spec, look, 0, 0)) };
    headCache.set(key, head);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  paintCompiled(ctx, compile(shadowOps(spec)));
  if (head.back.length) {
    ctx.save();
    ctx.translate(x, y);
    paintCompiled(ctx, head.back);
    ctx.restore();
  }
  paintCompiled(ctx, compile(bodyOps(spec, look)));
  ctx.save();
  ctx.translate(x, y);
  paintCompiled(ctx, head.front);
  ctx.restore();
  ctx.restore();
}

/* ── 장면 저작 창구 ─ 훅·랩·퀴즈 그림의 "머리 원 + 몸통 path"를 그대로 옮겨 쓰는 함수 ───── */

export type InkStickOpts = Omit<FigureSpec, "head" | "body">;

const memo = new Map<string, string>();

/** 머리 중심(x,y)·반지름 r + 몸통 path로 스틱맨을 그린다. 같은 인자는 재계산하지 않는다.
 *  기본 표정 calm(눈만)은 장면의 분위기를 단정하지 않는다. 표정이 필요하면 mood로 준다. */
export function inkStick(x: number, y: number, r: number, body: string, o: InkStickOpts = {}): string {
  const key = `${x}|${y}|${r}|${body}|${JSON.stringify(o)}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;
  const out = inkFigure({ ...o, head: { x, y, r }, body, mood: o.mood ?? "calm" });
  if (memo.size > 600) memo.clear();
  memo.set(key, out);
  return out;
}

/* ── 분리 출력: 머리나 팔다리만 CSS로 따로 움직이는 장면용 ───────────────── */

/** 머리만(기우뚱·표정 교체처럼 머리를 따로 움직일 때). */
export function inkHead(x: number, y: number, r: number, o: InkStickOpts = {}): string {
  const look = resolveLook(o.look);
  const spec: FigureSpec = { ...o, head: { x, y, r }, body: "", mood: o.mood ?? "calm" };
  return `<g data-ink="1" stroke="none">${inkSvg([...headBackOps(spec, look, x, y), ...headFrontOps(spec, look, x, y)])}</g>`;
}

/** 몸만(머리는 inkHead로 따로 그릴 때). */
export function inkBody(x: number, y: number, r: number, body: string, o: InkStickOpts = {}): string {
  const look = resolveLook(o.look);
  return `<g data-ink="1" stroke="none">${inkSvg(bodyOps({ ...o, head: { x, y, r }, body }, look))}</g>`;
}

export interface InkLimbOpts {
  /** 머리 반지름(선 굵기 기준). */
  r: number;
  kind?: "torso" | "arm" | "leg";
  /** path 태그에 그대로 붙일 속성(class 등). */
  attrs?: string;
  /** 휨(길이 비, 부호 = 왼쪽 법선 방향). */
  bow?: number;
  scheme?: "light" | "dark";
  seed?: number;
}

/** 팔다리 한 획. 관절마다 CSS 애니메이션이 걸린 인물에 쓴다. */
export function inkLimb(d: string, o: InkLimbOpts): string {
  const line = parseBody(d)[0];
  const kind = o.kind ?? "arm";
  const pts = line.length > 2 ? chaikin(line, 2, false) : line;
  const path = brush(pts, lineWeight(o.r), o.seed ?? 23 + Math.round(line[line.length - 1][0] * 3 + line[line.length - 1][1]), {
    bow: o.bow ?? 0,
    tIn: kind === "arm" ? 0.92 : 0.95,
    tOut: kind === "torso" ? 0.95 : 0.62,
  });
  return `<path${o.attrs ? ` ${o.attrs}` : ""} d="${path}" fill="${o.scheme === "dark" ? LIGHT_INK : DARK_INK}" stroke="none"/>`;
}
