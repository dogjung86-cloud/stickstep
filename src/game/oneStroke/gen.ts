// 네온 한붓그리기 — 퍼즐 생성기·솔버(순수, DOM 없음. 스텝 러시 engine.ts 문법).
// 핵심 보장: "불가능한 퍼즐은 절대 출제하지 않는다."
//  ① 구성 자체가 오일러 조건을 지킨다 — 모든 차수가 짝수가 되도록 사이클만 합성하고,
//     홀수판은 마지막에 현(chord) 하나만 더해 홀수점을 정확히 2개 만든다.
//  ② 그 위에 히어홀저 솔버로 실제 경로를 찾아 이중 검증 — 실패 시 그 시도는 폐기.
//  ③ 전부 실패하면(이론상 없음) 수제 도형으로 폴백 — 어떤 경로로도 미해결 퍼즐이 안 나간다.
// 스테이지는 시드 고정(같은 판 = 같은 그림): 재도전이 곧 연습이 되고, 기록 비교가 공정하다.

export interface Pt {
  x: number;
  y: number;
}

export interface StrokePuzzle {
  verts: Pt[];
  edges: [number, number][];
  odd: number[]; // 홀수점 인덱스(0개 = 아무 데서나 시작, 2개 = 여기서만 시작 가능)
}

/** 논리 좌표계 — 정사각 1000×1000, 렌더러가 화면에 맞춰 스케일한다. */
export const BOARD = 1000;

// ── 시드 RNG(mulberry32) ────────────────────────────────
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 기하 헬퍼 ───────────────────────────────────────────
const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

/** 점 p에서 선분 ab까지 거리. */
function distToSeg(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L2 = dx * dx + dy * dy;
  if (L2 === 0) return dist(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** 두 선분의 내부 교차 여부(끝점 공유는 교차 아님) + 교차각(도). */
function segCross(a: Pt, b: Pt, c: Pt, d: Pt): { hit: boolean; angle: number } {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const den = r.x * s.y - r.y * s.x;
  if (Math.abs(den) < 1e-9) return { hit: false, angle: 0 };
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den;
  const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den;
  const eps = 0.02; // 끝점 부근은 제외 — 정점 공유 간선은 호출부가 걸러 주지만 이중 안전
  if (t <= eps || t >= 1 - eps || u <= eps || u >= 1 - eps) return { hit: false, angle: 0 };
  const cosA = (r.x * s.x + r.y * s.y) / (Math.hypot(r.x, r.y) * Math.hypot(s.x, s.y));
  const deg = (Math.acos(Math.max(-1, Math.min(1, Math.abs(cosA)))) * 180) / Math.PI;
  return { hit: true, angle: deg };
}

const ekey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

function degreesOf(n: number, edges: [number, number][]): number[] {
  const deg = new Array<number>(n).fill(0);
  for (const [a, b] of edges) {
    deg[a]++;
    deg[b]++;
  }
  return deg;
}

function oddOf(n: number, edges: [number, number][]): number[] {
  return degreesOf(n, edges)
    .map((d, i) => (d % 2 === 1 ? i : -1))
    .filter((i) => i >= 0);
}

// ── 히어홀저 솔버 — 오일러 트레일(간선 전부 한 번씩) ─────
/** 성공 시 정점 열(길이 = 간선 수 + 1), 불가능(홀수점≠0·2 또는 비연결)이면 null. */
export function solvePath(p: StrokePuzzle): number[] | null {
  const E = p.edges.length;
  if (E === 0) return null;
  const adj: number[][] = p.verts.map(() => []);
  p.edges.forEach(([a, b], i) => {
    adj[a].push(i);
    adj[b].push(i);
  });
  const odd = oddOf(p.verts.length, p.edges);
  if (odd.length !== 0 && odd.length !== 2) return null;
  const start = odd.length ? odd[0] : p.edges[0][0];
  const used = new Array<boolean>(E).fill(false);
  const ptr = new Array<number>(p.verts.length).fill(0);
  const stack: number[] = [start];
  const out: number[] = [];
  while (stack.length) {
    const v = stack[stack.length - 1];
    let advanced = false;
    while (ptr[v] < adj[v].length) {
      const ei = adj[v][ptr[v]++];
      if (used[ei]) continue;
      used[ei] = true;
      const [a, b] = p.edges[ei];
      stack.push(a === v ? b : a);
      advanced = true;
      break;
    }
    if (!advanced) out.push(stack.pop()!);
  }
  if (out.length !== E + 1) return null; // 비연결 그래프 등 — 트레일이 간선을 다 못 덮음
  return out.reverse();
}

// ── 수제 스테이지 1~6 (튜토리얼 아크) ───────────────────
// 1 삼각형(긋기·스냅 배우기) → 2 별(교차선도 괜찮아) → 3 나비(일찍 닫으면 막힌다)
// → 4 집(첫 홀수판 — 시작점이 중요하다) → 5 봉투(클래식) → 6 별+오각형(긴 순환 브리더)
const PENTA: Pt[] = [0, 1, 2, 3, 4].map((i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return { x: Math.round(500 + 400 * Math.cos(a)), y: Math.round(520 + 400 * Math.sin(a)) };
});

const HAND: { verts: Pt[]; edges: [number, number][] }[] = [
  { verts: [{ x: 500, y: 170 }, { x: 165, y: 775 }, { x: 835, y: 775 }], edges: [[0, 1], [1, 2], [2, 0]] },
  { verts: PENTA, edges: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]] },
  {
    verts: [{ x: 160, y: 285 }, { x: 160, y: 735 }, { x: 500, y: 510 }, { x: 840, y: 285 }, { x: 840, y: 735 }],
    edges: [[0, 1], [0, 2], [1, 2], [3, 4], [2, 3], [2, 4]],
  },
  {
    verts: [{ x: 255, y: 800 }, { x: 745, y: 800 }, { x: 745, y: 395 }, { x: 255, y: 395 }, { x: 500, y: 140 }],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 2]],
  },
  {
    verts: [{ x: 235, y: 815 }, { x: 765, y: 815 }, { x: 765, y: 380 }, { x: 235, y: 380 }, { x: 500, y: 125 }],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [3, 4], [4, 2]],
  },
  { verts: PENTA, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [2, 4], [4, 1], [1, 3], [3, 0]] },
];
export const HAND_COUNT = HAND.length;

// ── 난이도 커브(스테이지 → 생성 파라미터) ────────────────
interface Limits {
  ringN: number; // 바깥 링 정점 수
  innerN: number; // 내부 정점 수(스포크 — 12판부터)
  edgeTarget: number; // 간선 목표(캡 20 — 손가락 피로 한계)
  oddMode: boolean; // true = 홀수점 2개(시작점 찾기), false = 순환 브리더
  crossMax: number; // 허용 교차 수(시각 난이도)
  degMax: number; // 정점 최대 차수(시각 혼잡 캡)
  clearMin: number; // 정점-비인접 간선 최소 거리(스냅 오인 방지 — 스냅 반경보다 크게)
  lenMin: number; // 간선 최소 길이
  gapMin: number; // 정점 최소 간격
  angleMin: number; // 교차 최소 각(얕은 X는 한 줄로 오독)
}

function limitsFor(stage: number): Limits {
  const t = Math.max(1, stage - HAND_COUNT);
  return {
    ringN: Math.min(10, 5 + Math.ceil(t / 3)),
    innerN: stage >= 12 ? Math.min(2, 1 + Math.floor((stage - 12) / 6)) : 0,
    edgeTarget: Math.min(20, 8 + t),
    oddMode: stage % 4 !== 2, // 4판마다 한 번은 짝수 순환(브리더) — s10·s14·s18…
    crossMax: stage < 9 ? 0 : stage < 12 ? 2 : stage < 15 ? 4 : stage < 18 ? 6 : 8,
    degMax: stage < 10 ? 4 : stage < 14 ? 5 : 6,
    clearMin: stage < 12 ? 115 : 105, // 고밀도 후반은 살짝 완화(스냅 92보다는 항상 여유)
    lenMin: 110,
    gapMin: 135,
    angleMin: 20,
  };
}

// ── 퍼즐 품질 계측(검증·soak 공용) ──────────────────────
export interface Metrics {
  n: number;
  e: number;
  odd: number;
  cross: number;
  minClear: number;
  minLen: number;
  maxDeg: number;
  minAngle: number; // 교차가 없으면 90
  dup: boolean; // 중복 간선(있으면 실격)
}

export function metricsOf(p: StrokePuzzle): Metrics {
  let cross = 0;
  let minAngle = 90;
  let minClear = Infinity;
  let minLen = Infinity;
  const seen = new Set<string>();
  let dup = false;
  for (const [a, b] of p.edges) {
    const k = ekey(a, b);
    if (seen.has(k) || a === b) dup = true;
    seen.add(k);
    minLen = Math.min(minLen, dist(p.verts[a], p.verts[b]));
    for (let w = 0; w < p.verts.length; w++) {
      if (w === a || w === b) continue;
      minClear = Math.min(minClear, distToSeg(p.verts[w], p.verts[a], p.verts[b]));
    }
  }
  for (let i = 0; i < p.edges.length; i++) {
    for (let j = i + 1; j < p.edges.length; j++) {
      const [a, b] = p.edges[i];
      const [c, d] = p.edges[j];
      if (a === c || a === d || b === c || b === d) continue;
      const r = segCross(p.verts[a], p.verts[b], p.verts[c], p.verts[d]);
      if (r.hit) {
        cross++;
        minAngle = Math.min(minAngle, r.angle);
      }
    }
  }
  return {
    n: p.verts.length,
    e: p.edges.length,
    odd: oddOf(p.verts.length, p.edges).length,
    cross,
    minClear,
    minLen,
    maxDeg: Math.max(...degreesOf(p.verts.length, p.edges)),
    minAngle,
    dup,
  };
}

// ── 절차 생성(7판~) ─────────────────────────────────────
/** 한 번의 생성 시도 — 실패 조건이면 null. relax = 완화 배수(전멸 시 2차 패스). */
function attempt(stage: number, seed: number, relax: number): StrokePuzzle | null {
  const L = limitsFor(stage);
  const rnd = mulberry32(seed);
  const clearMin = L.clearMin * relax;
  const gapMin = L.gapMin * relax;
  const lenMin = L.lenMin * relax;
  const crossMax = relax < 1 ? L.crossMax + 3 : L.crossMax;

  // 1) 정점 배치 — 바깥 링(지터) + 내부 정점(중심 부근, 링과 넉넉한 간격)
  const verts: Pt[] = [];
  const step = (Math.PI * 2) / L.ringN;
  for (let i = 0; i < L.ringN; i++) {
    const a = -Math.PI / 2 + i * step + (rnd() - 0.5) * step * 0.44;
    const r = 415 + (rnd() - 0.5) * 110;
    verts.push({ x: Math.round(500 + r * Math.cos(a)), y: Math.round(500 + r * Math.sin(a)) });
  }
  for (let i = 0; i < L.innerN; i++) {
    let placed = false;
    for (let tr = 0; tr < 24 && !placed; tr++) {
      const a = rnd() * Math.PI * 2;
      const r = 60 + rnd() * 90;
      const p = { x: Math.round(500 + r * Math.cos(a)), y: Math.round(500 + r * Math.sin(a)) };
      const innerOk = verts.slice(L.ringN).every((q) => dist(p, q) >= 190); // 내부끼리는 더 벌린다
      if (innerOk && verts.every((q) => dist(p, q) >= gapMin * 1.15)) {
        verts.push(p);
        placed = true;
      }
    }
    if (!placed) return null;
  }
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) if (dist(verts[i], verts[j]) < gapMin) return null;

  // 2) 간선 — 증분 실행 가능성 검사(핵심 개선): 후보 간선을 "지금" 중복·길이·정점 근접·
  //    교차 예산·교차각으로 거르고, 사이클 단위로만 커밋한다. 일괄 최종 검증에서 통째로
  //    죽던 고밀도 판(18판+)이 이걸로 산다. 최종 metricsOf 검증은 이중 안전으로 유지.
  const edges: [number, number][] = [];
  const has = new Set<string>();
  const deg = new Array<number>(verts.length).fill(0);
  let crossCount = 0;

  /** 후보 간선 검사 — 통과 시 새로 생기는 교차 수를 반환, 실격이면 null. extra = 같은 사이클의 앞 간선들. */
  function check(a: number, b: number, extra: [number, number][]): number | null {
    if (a === b || has.has(ekey(a, b))) return null;
    const A = verts[a];
    const B = verts[b];
    if (dist(A, B) < lenMin) return null;
    for (let w = 0; w < verts.length; w++) {
      if (w === a || w === b) continue;
      if (distToSeg(verts[w], A, B) < clearMin) return null;
    }
    let plus = 0;
    for (const [c, d] of [...edges, ...extra]) {
      if (a === c || a === d || b === c || b === d) continue;
      const r = segCross(A, B, verts[c], verts[d]);
      if (r.hit) {
        if (r.angle < L.angleMin) return null;
        plus++;
      }
    }
    return plus;
  }

  const commit = (a: number, b: number, plus: number): void => {
    edges.push([a, b]);
    has.add(ekey(a, b));
    deg[a]++;
    deg[b]++;
    crossCount += plus;
  };

  /** 사이클(정점 열) 전체가 실행 가능할 때만 통째로 커밋. */
  function tryCycle(ids: number[]): boolean {
    const extra: [number, number][] = [];
    const plusList: number[] = [];
    let total = 0;
    for (let i = 0; i < ids.length; i++) {
      const a = ids[i];
      const b = ids[(i + 1) % ids.length];
      const plus = check(a, b, extra);
      if (plus === null) return false;
      total += plus;
      if (crossCount + total > crossMax) return false;
      extra.push([a, b]);
      plusList.push(plus);
    }
    // 사이클 내부 간선끼리의 교차는 check의 extra 대조에 이미 포함됨
    ids.forEach((v, i) => commit(v, ids[(i + 1) % ids.length], plusList[i]));
    return true;
  }

  // 링 순환(연결 보장·짝수 차수) — 간선 하나라도 실격이면 이 배치는 폐기
  for (let i = 0; i < L.ringN; i++) {
    const plus = check(i, (i + 1) % L.ringN, []);
    if (plus === null || crossCount + plus > crossMax) return null;
    commit(i, (i + 1) % L.ringN, plus);
  }

  // 3) 내부 정점 커버 — a-v-b 삼각 사이클(a·b는 링에서 비인접 → b-a가 새 현. 전원 차수 +2)
  for (let v = L.ringN; v < verts.length; v++) {
    let done = false;
    for (let tr = 0; tr < 40 && !done; tr++) {
      const a = Math.floor(rnd() * L.ringN);
      const b = Math.floor(rnd() * L.ringN);
      if (a === b || has.has(ekey(a, b))) continue; // 링 이웃(간선 존재)이면 스킵
      if (deg[a] + 2 > L.degMax || deg[b] + 2 > L.degMax) continue;
      done = tryCycle([a, v, b]);
    }
    if (!done) return null;
  }

  // 4) 추가 사이클(3각 — 12판부터 4각도) — 목표 간선 수까지. 사이클 합성이라 차수는 항상 짝수 유지
  const base = L.edgeTarget - (L.oddMode ? 1 : 0);
  let guard = 90;
  while (edges.length + 3 <= base + 1 && guard-- > 0) {
    const quad = stage >= 12 && base - edges.length >= 4 && rnd() < 0.45;
    const need = quad ? 4 : 3;
    const ids: number[] = [];
    let ok = true;
    for (let i = 0; i < need; i++) {
      const v = Math.floor(rnd() * verts.length);
      if (ids.includes(v) || deg[v] + 2 > L.degMax) {
        ok = false;
        break;
      }
      ids.push(v);
    }
    if (!ok) continue;
    tryCycle(ids);
  }
  if (edges.length < base - 2) return null; // 살이 너무 안 붙으면 폐기

  // 5) 홀수판 — 현 하나로 홀수점 정확히 2개(멀수록 시작점 찾기가 재밌다)
  if (L.oddMode) {
    let bestPair: [number, number, number] | null = null; // a, b, plus
    let bestD = 0;
    for (let tr = 0; tr < 40; tr++) {
      const a = Math.floor(rnd() * verts.length);
      const b = Math.floor(rnd() * verts.length);
      if (a === b) continue;
      if (deg[a] + 1 > L.degMax || deg[b] + 1 > L.degMax) continue;
      const plus = check(a, b, []);
      if (plus === null || crossCount + plus > crossMax) continue;
      const d = dist(verts[a], verts[b]);
      if (d > bestD) {
        bestD = d;
        bestPair = [a, b, plus];
      }
    }
    if (!bestPair) return null;
    commit(bestPair[0], bestPair[1], bestPair[2]);
  }

  // 6) 검증 — 품질 게이트 + 솔버 이중 확인
  const p: StrokePuzzle = { verts, edges, odd: oddOf(verts.length, edges) };
  const m = metricsOf(p);
  if (m.dup) return null;
  if (m.odd !== (L.oddMode ? 2 : 0)) return null;
  if (m.maxDeg > L.degMax) return null;
  if (m.cross > crossMax) return null;
  if (m.minClear < clearMin) return null;
  if (m.minLen < lenMin) return null;
  if (m.cross > 0 && m.minAngle < L.angleMin) return null;
  if (!solvePath(p)) return null;
  return p;
}

/** 스테이지 시드 — 시도 번호를 섞어 결정적으로 변주. */
const seedOf = (stage: number, tr: number): number => ((stage * 2654435761) ^ (tr * 40503) ^ 0x9e3779b9) >>> 0;

interface Built {
  puzzle: StrokePuzzle;
  fallback: boolean; // true = 생성 전멸로 수제 도형 대체(이론상 없음 — soak가 감시)
}

function build(stage: number): Built {
  if (stage <= HAND_COUNT) {
    const h = HAND[stage - 1];
    const puzzle: StrokePuzzle = {
      verts: h.verts.map((v) => ({ ...v })),
      edges: h.edges.map((e) => [...e] as [number, number]),
      odd: oddOf(h.verts.length, h.edges),
    };
    return { puzzle, fallback: false };
  }
  for (let tr = 0; tr < 70; tr++) {
    const p = attempt(stage, seedOf(stage, tr), 1);
    if (p) return { puzzle: p, fallback: false };
  }
  for (let tr = 70; tr < 140; tr++) {
    const p = attempt(stage, seedOf(stage, tr), 0.82); // 완화 패스
    if (p) return { puzzle: p, fallback: false };
  }
  // 최후 폴백 — 수제 도형 순환(절대 미해결 퍼즐을 내보내지 않는다)
  return { puzzle: build(((stage - 1) % HAND_COUNT) + 1).puzzle, fallback: true };
}

/** 스테이지 퍼즐(결정적 — 같은 판은 언제나 같은 그림). 항상 한붓그리기 가능. */
export function puzzleFor(stage: number): StrokePuzzle {
  return build(stage).puzzle;
}

/** DEV·e2e soak용 — 생성 품질 리포트. */
export function inspect(stage: number): Metrics & { stage: number; solvable: boolean; fallback: boolean } {
  const b = build(stage);
  return {
    stage,
    ...metricsOf(b.puzzle),
    solvable: !!solvePath(b.puzzle),
    fallback: b.fallback,
  };
}
