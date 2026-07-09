// solidKit, 수학 Ⅴ 입체도형 공용 킷 — 이벤트 구동 SVG 3D 투영의 단일 진실 공급원.
// boxRelLab(Ⅳ 기함)의 rotY→rotX 회전 + 약한 원근 문법을 일반 다면체로 승격했다.
// rAF 금지 관철: 재계산은 호출부의 pointermove/버튼 이벤트에서만 일어난다.
// 숨은 모서리는 교과서 겨냥도처럼 점선 — "인접한 두 면이 모두 뒷면"이면 숨김(볼록 입체 전제).
// 정다면체 5종의 면은 쌍대성으로 생성: 정다면체의 면 법선 방향 = 쌍대 입체의 꼭짓점 방향.
// (정사면체↔자기 자신, 정육면체↔정팔면체, 정십이면체↔정이십면체)

export type V3 = [number, number, number];

export interface Solid {
  verts: V3[];
  /** 각 면 = 꼭짓점 인덱스 루프(법선이 바깥을 향하도록 정렬됨). */
  faces: number[][];
  /** 면 루프에서 유도한 모서리(중복 제거, [i,j] i<j). */
  edges: [number, number][];
}

export interface ProjOpts {
  cx: number;
  cy: number;
  /** 원근 초점 거리(boxRelLab 관례 560). */
  f?: number;
  /** 모델 → 화면 배율. */
  scale?: number;
}

/** 회전만 적용(법선 판정·투영 공용): rotY(ry) 후 rotX(rx). +z가 화면 앞(관찰자 쪽). */
export function rotv(v: V3, ry: number, rx: number): V3 {
  const [x, y, z] = v;
  const cy1 = Math.cos(ry);
  const sy1 = Math.sin(ry);
  const cx1 = Math.cos(rx);
  const sx1 = Math.sin(rx);
  const x1 = x * cy1 + z * sy1;
  const z1 = -x * sy1 + z * cy1;
  const y2 = y * cx1 - z1 * sx1;
  const z2 = y * sx1 + z1 * cx1;
  return [x1, y2, z2];
}

/** 한 점 투영(약한 원근). */
export function projectPt(v: V3, ry: number, rx: number, o: ProjOpts): { x: number; y: number; z: number } {
  const s = o.scale ?? 1;
  const f = o.f ?? 560;
  const [x1, y2, z2] = rotv([v[0] * s, v[1] * s, v[2] * s], ry, rx);
  const sc = f / (f - z2);
  return { x: o.cx + x1 * sc, y: o.cy + y2 * sc, z: z2 };
}

/* ── 기하 유틸 ── */
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const addTo = (a: V3, b: V3): void => {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
};

/** 면 루프의 뉴얼 법선(정규화 안 함). */
export function faceNormal(verts: V3[], loop: number[]): V3 {
  const n: V3 = [0, 0, 0];
  for (let i = 0; i < loop.length; i++) {
    const p = verts[loop[i]];
    const q = verts[loop[(i + 1) % loop.length]];
    n[0] += (p[1] - q[1]) * (p[2] + q[2]);
    n[1] += (p[2] - q[2]) * (p[0] + q[0]);
    n[2] += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return n;
}

/** 면 루프들의 법선을 바깥(무게중심 반대)으로 정렬하고 edges를 유도해 Solid로 포장. */
export function makeSolid(verts: V3[], faces: number[][]): Solid {
  const c: V3 = [0, 0, 0];
  for (const v of verts) addTo(c, v);
  c[0] /= verts.length;
  c[1] /= verts.length;
  c[2] /= verts.length;
  const fixed = faces.map((loop) => {
    const n = faceNormal(verts, loop);
    const fc: V3 = [0, 0, 0];
    for (const i of loop) addTo(fc, verts[i]);
    fc[0] /= loop.length;
    fc[1] /= loop.length;
    fc[2] /= loop.length;
    return dot3(n, sub(fc, c)) < 0 ? [...loop].reverse() : loop;
  });
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const loop of fixed) {
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push(a < b ? [a, b] : [b, a]);
      }
    }
  }
  return { verts, faces: fixed, edges };
}

/** 법선 방향 목록으로 볼록 정다면체의 면을 그룹핑(각 방향에서 dot 최대인 꼭짓점들 = 한 면). */
function facesFromPlanes(verts: V3[], normals: V3[]): number[][] {
  return normals.map((n) => {
    const ds = verts.map((v) => dot3(v, n));
    const max = Math.max(...ds);
    const idx = verts.map((_, i) => i).filter((i) => ds[i] > max - 1e-6);
    // 면 평면 위에서 각도순 정렬
    const len = Math.hypot(n[0], n[1], n[2]);
    const nn: V3 = [n[0] / len, n[1] / len, n[2] / len];
    const ref: V3 = Math.abs(nn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u: V3 = [
      nn[1] * ref[2] - nn[2] * ref[1],
      nn[2] * ref[0] - nn[0] * ref[2],
      nn[0] * ref[1] - nn[1] * ref[0],
    ];
    const ul = Math.hypot(u[0], u[1], u[2]);
    u[0] /= ul;
    u[1] /= ul;
    u[2] /= ul;
    const w: V3 = [
      nn[1] * u[2] - nn[2] * u[1],
      nn[2] * u[0] - nn[0] * u[2],
      nn[0] * u[1] - nn[1] * u[0],
    ];
    return idx.sort((a, b) => {
      const va = verts[a];
      const vb = verts[b];
      return Math.atan2(dot3(va, w), dot3(va, u)) - Math.atan2(dot3(vb, w), dot3(vb, u));
    });
  });
}

/* ── 각기둥·각뿔·각뿔대(밑면 정n각형, 중심 원점, y축이 높이 방향: -h/2 위 ~ +h/2 아래) ── */

const ring = (n: number, R: number, y: number, a0 = 90): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((a0 + (360 / n) * i) * Math.PI) / 180;
    return [R * Math.cos(a), y, -R * Math.sin(a)] as V3;
  });

/** 정n각기둥. */
export function prismSolid(n: number, R: number, h: number): Solid {
  const verts = [...ring(n, R, -h / 2), ...ring(n, R, h / 2)];
  const top = Array.from({ length: n }, (_, i) => i);
  const bot = Array.from({ length: n }, (_, i) => n + i);
  const sides = Array.from({ length: n }, (_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]);
  return makeSolid(verts, [top, bot, ...sides]);
}

/** 정n각뿔(꼭짓점 위). */
export function pyramidSolid(n: number, R: number, h: number): Solid {
  const apex: V3 = [0, -h / 2, 0];
  const verts = [apex, ...ring(n, R, h / 2)];
  const bot = Array.from({ length: n }, (_, i) => 1 + i);
  const sides = Array.from({ length: n }, (_, i) => [0, 1 + i, 1 + ((i + 1) % n)]);
  return makeSolid(verts, [bot, ...sides]);
}

/** 정n각뿔대(윗면 Rt < 아랫면 Rb). */
export function frustumSolid(n: number, Rb: number, Rt: number, h: number): Solid {
  const verts = [...ring(n, Rt, -h / 2), ...ring(n, Rb, h / 2)];
  const top = Array.from({ length: n }, (_, i) => i);
  const bot = Array.from({ length: n }, (_, i) => n + i);
  const sides = Array.from({ length: n }, (_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]);
  return makeSolid(verts, [top, bot, ...sides]);
}

/* ── 정다면체 5종(단위 크기, 쓰기 전 scale로 확대) ── */

const PHI = (1 + Math.sqrt(5)) / 2;

function tetraVerts(): V3[] {
  return [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ];
}
function cubeVerts(): V3[] {
  const out: V3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x, y, z]);
  return out;
}
function octaVerts(): V3[] {
  return [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ];
}
function icosaVerts(): V3[] {
  const out: V3[] = [];
  for (const a of [-1, 1])
    for (const b of [-PHI, PHI]) {
      out.push([0, a, b]);
      out.push([a, b, 0]);
      out.push([b, 0, a]);
    }
  return out;
}
function dodecaVerts(): V3[] {
  const out: V3[] = [...cubeVerts()];
  const p = PHI;
  const q = 1 / PHI;
  for (const a of [-q, q])
    for (const b of [-p, p]) {
      out.push([0, a, b]);
      out.push([a, b, 0]);
      out.push([b, 0, a]);
    }
  return out;
}

/** 순환 좌표 패밀리 생성: (0,a,b) → (a,b,0) → (b,0,a), a·b 부호 전 조합. */
function cyc(av: number, bv: number): V3[] {
  const out: V3[] = [];
  for (const a of [-av, av])
    for (const b of [-bv, bv]) {
      out.push([0, a, b]);
      out.push([a, b, 0]);
      out.push([b, 0, a]);
    }
  return out;
}

/** 정다면체 5종 — 면은 "면 중심 방향" 법선 패밀리로 그룹핑해 생성.
 *  주의: 쌍대 꼭짓점 좌표를 그대로 쓰면 순환 순서가 어긋난다(실사고).
 *  법선 패밀리는 실제 면 중심을 손으로 유도해 검산했다(오일러 V−E+F=2 확인). */
export const PLATONIC: Record<"tetra" | "cube" | "octa" | "dodeca" | "icosa", Solid> = {
  // 정사면체: 면 법선 = 반대 꼭짓점의 반대 방향
  tetra: makeSolid(
    tetraVerts(),
    facesFromPlanes(tetraVerts(), tetraVerts().map((v) => [-v[0], -v[1], -v[2]] as V3)),
  ),
  cube: makeSolid(cubeVerts(), facesFromPlanes(cubeVerts(), octaVerts())),
  octa: makeSolid(octaVerts(), facesFromPlanes(octaVerts(), cubeVerts())),
  // 정십이면체(꼭짓점 = 정육면체 + cyc(1/φ, φ)): 면 중심 방향 = cyc(φ, 1) 12방향
  dodeca: makeSolid(dodecaVerts(), facesFromPlanes(dodecaVerts(), cyc(PHI, 1))),
  // 정이십면체(꼭짓점 = cyc(1, φ)): 면 중심 방향 = 정육면체 8방향 + cyc(φ, 1/φ) 12방향
  icosa: makeSolid(icosaVerts(), facesFromPlanes(icosaVerts(), [...cubeVerts(), ...cyc(PHI, 1 / PHI)])),
};

/* ── 그리기 ── */

export interface SolidSvgOpts extends ProjOpts {
  ink?: string;
  hiddenColor?: string;
  width?: number;
  /** 앞면 은은한 채움(재질감). */
  faceFill?: string;
  faceOpacity?: number;
  /** 강조 모서리(edges 인덱스 → 색). */
  highlight?: Record<number, string>;
}

/** 다면체 겨냥도 SVG 조각(숨은 모서리 점선). 호출부가 <g>에 innerHTML로 꽂는다. */
export function solidSvg(solid: Solid, ry: number, rx: number, o: SolidSvgOpts): string {
  const ink = o.ink ?? "#334155";
  const hid = o.hiddenColor ?? "#A9B6C6";
  const w = o.width ?? 2.4;
  const P = solid.verts.map((v) => projectPt(v, ry, rx, o));
  const visFace = solid.faces.map((loop) => rotv(faceNormal(solid.verts, loop), ry, rx)[2] > 0.02);

  // 면 채움(보이는 면만) — 램버트 음영: 좌상단 앞쪽 광원 기준으로 면마다 밝기를 달리해
  // "균일 틴트 와이어프레임"이 아니라 입체로 읽히게 한다(faceOpacity는 기준 농도).
  let sFill = "";
  if (o.faceFill) {
    const L: V3 = [-0.33, -0.55, 0.77]; // 화면 좌표(x 오른쪽·y 아래·z 관찰자 쪽) 기준 광원 방향
    solid.faces.forEach((loop, i) => {
      if (!visFace[i]) return;
      const n = rotv(faceNormal(solid.verts, loop), ry, rx);
      const len = Math.hypot(n[0], n[1], n[2]) || 1;
      const lambert = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / len);
      const op = (o.faceOpacity ?? 0.1) * (0.45 + 1.75 * lambert);
      const d = "M" + loop.map((vi) => `${P[vi].x.toFixed(1)} ${P[vi].y.toFixed(1)}`).join(" L") + " Z";
      sFill += `<path d="${d}" fill="${o.faceFill}" opacity="${op.toFixed(3)}"/>`;
    });
  }

  // 모서리: 인접 두 면이 모두 뒷면이면 숨김(점선)
  const adj: number[][] = solid.edges.map(() => []);
  solid.faces.forEach((loop, fi) => {
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      const ei = solid.edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
      if (ei >= 0) adj[ei].push(fi);
    }
  });
  let sHid = "";
  let sVis = "";
  let sHi = "";
  solid.edges.forEach(([a, b], ei) => {
    const p1 = P[a];
    const p2 = P[b];
    const hidden = adj[ei].length > 0 && adj[ei].every((fi) => !visFace[fi]);
    const hl = o.highlight?.[ei];
    const line = (color: string, w2: number, dash: string): string =>
      `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${color}" stroke-width="${w2}"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="round"/>`;
    if (hl) sHi += line(hl, w + 2, hidden ? "7 6" : "");
    else if (hidden) sHid += line(hid, Math.max(1.6, w - 0.7), "6 6");
    else sVis += line(ink, w, "");
  });
  return sFill + sHid + sVis + sHi;
}
