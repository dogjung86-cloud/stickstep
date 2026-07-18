// 레이저 미로 — 퍼즐 생성기·격자 빔 트레이서(순수, DOM 없음. 한붓그리기 gen.ts 문법).
// 핵심 보장: "풀 수 없는 판은 절대 출제하지 않는다."
//  ① 생성이 정답 역산 — 정답 경로(광원→거울들→보석)를 먼저 깔고, 거울 '각도만' 섞는다.
//     위치는 그대로라 돌려서 되돌리면 반드시 풀린다(수학이 아니라 구성으로 보장).
//  ② 조립된 정답 상태를 실제 트레이서로 돌려 전 보석 점등을 검증(간섭 실수 차단), 실패 시 재시도.
//  ③ 섞은 상태가 우연히 이미 풀려 있으면 다시 섞는다. 전멸 시 1거울 수제 판 폴백.
// 스테이지 시드 고정(같은 판 = 같은 그림) — 한붓그리기와 동일한 공정성 규칙.
//
// 색 규칙 = 빛의 삼원색 가산혼합(중2 III colorMixLab 그대로): R=1·G=2·B=4 비트마스크,
// 보석은 도착한 빛의 합이 요구색과 '정확히' 같아야 켜진다(노랑 보석에 파랑까지 오면 하양이라 꺼짐).

export type Dir = 0 | 1 | 2 | 3; // 상·우·하·좌
export const DX = [0, 1, 0, -1] as const;
export const DY = [-1, 0, 1, 0] as const;
const REV = [2, 3, 0, 1] as const;
// 거울 반사 — o=0 "/" · o=1 "\" (입사각=반사각의 격자판)
const SLASH = [1, 0, 3, 2] as const;
const BACK = [3, 2, 1, 0] as const;
export const reflect = (d: Dir, o: 0 | 1): Dir => (o === 0 ? SLASH[d] : BACK[d]) as Dir;

export const COLOR_HEX: Record<number, string> = {
  1: "#FF5A66", 2: "#53E07E", 4: "#4DA6FF", // 삼원색
  3: "#FFC53D", 5: "#E85BD0", 6: "#3ADCD8", // 2색 합성(노랑·자홍·청록)
  7: "#F4F6FF", // 하양
};
export const COLOR_NAME: Record<number, string> = { 1: "빨강", 2: "초록", 4: "파랑", 3: "노랑", 5: "자홍", 6: "청록", 7: "하양" };

export interface Cell {
  kind: "mirror" | "splitter" | "block" | "emitter" | "target";
  x: number;
  y: number;
  solO?: 0 | 1; // 정답 각도(거울·반거울)
  scrO?: 0 | 1; // 섞인 시작 각도
  dir?: Dir; // 광원 발사 방향
  color?: number; // 광원 색(비트)
  req?: number; // 보석 요구색(비트 합)
}

export interface LaserPuzzle {
  grid: number;
  cells: Cell[];
  kind: "mono" | "pair" | "white" | "twoMono";
  pairReq?: number; // 합성 보석 요구색(코치 문구용)
}

// ── 시드 RNG(mulberry32 — 한붓그리기 공유 문법) ─────────
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

// ── 빔 트레이서(게임·검증 공용 — 단일 진실 공급원) ──────
export interface Seg {
  x1: number; y1: number; x2: number; y2: number; // 칸 단위 좌표(중심 = +0.5)
  color: number;
}
export interface Hit {
  x: number; y: number; din: Dir; dout: Dir; color: number; splitter: boolean;
}
export interface Traced {
  segs: Seg[];
  hits: Hit[];
  arrived: Map<number, number>; // 보석 셀 인덱스 -> 도착색 비트합
  won: boolean;
}

/** orient(i) = 셀 i의 현재 각도. 게임은 플레이 각도, 검증은 solO/scrO를 넣는다. */
export function trace(p: LaserPuzzle, orient: (i: number) => 0 | 1): Traced {
  const at = new Map<string, number>();
  p.cells.forEach((c, i) => at.set(`${c.x},${c.y}`, i));
  const segs: Seg[] = [];
  const hits: Hit[] = [];
  const arrived = new Map<number, number>();
  for (let ei = 0; ei < p.cells.length; ei++) {
    const e = p.cells[ei];
    if (e.kind !== "emitter") continue;
    const visited = new Set<string>();
    const queue: { x: number; y: number; d: Dir }[] = [{ x: e.x, y: e.y, d: e.dir! }];
    let guard = 400;
    while (queue.length && guard-- > 0) {
      const b = queue.shift()!;
      let { x, y } = b;
      let d = b.d;
      let sx = x + 0.5;
      let sy = y + 0.5;
      let march = 200;
      while (march-- > 0) {
        const nx = x + DX[d];
        const ny = y + DY[d];
        if (nx < 0 || ny < 0 || nx >= p.grid || ny >= p.grid) {
          // 격자 밖으로 탈출 — 경계선까지 그린다
          segs.push({ x1: sx, y1: sy, x2: x + 0.5 + DX[d] * 0.5, y2: y + 0.5 + DY[d] * 0.5, color: e.color! });
          break;
        }
        const vk = `${nx},${ny},${d}`;
        if (visited.has(vk)) {
          segs.push({ x1: sx, y1: sy, x2: nx + 0.5, y2: ny + 0.5, color: e.color! });
          break; // 루프 가드(반거울 순환)
        }
        visited.add(vk);
        const ci = at.get(`${nx},${ny}`);
        if (ci === undefined) {
          x = nx;
          y = ny;
          continue;
        }
        const c = p.cells[ci];
        if (c.kind === "block" || c.kind === "emitter") {
          segs.push({ x1: sx, y1: sy, x2: nx + 0.5 - DX[d] * 0.5, y2: ny + 0.5 - DY[d] * 0.5, color: e.color! });
          break;
        }
        if (c.kind === "target") {
          segs.push({ x1: sx, y1: sy, x2: nx + 0.5, y2: ny + 0.5, color: e.color! });
          arrived.set(ci, (arrived.get(ci) ?? 0) | e.color!);
          break;
        }
        // 거울·반거울
        const o = orient(ci);
        const rd = reflect(d, o);
        segs.push({ x1: sx, y1: sy, x2: nx + 0.5, y2: ny + 0.5, color: e.color! });
        hits.push({ x: nx, y: ny, din: d, dout: rd, color: e.color!, splitter: c.kind === "splitter" });
        if (c.kind === "splitter") queue.push({ x: nx, y: ny, d }); // 절반은 직진 통과
        x = nx;
        y = ny;
        d = rd;
        sx = x + 0.5;
        sy = y + 0.5;
      }
    }
  }
  let won = true;
  for (let i = 0; i < p.cells.length; i++) {
    if (p.cells[i].kind === "target" && (arrived.get(i) ?? 0) !== p.cells[i].req) won = false;
  }
  return { segs, hits, arrived, won };
}

// ── 난이도 커브 ─────────────────────────────────────────
interface Params {
  grid: number;
  kind: "mono" | "pair" | "white" | "twoMono";
  turns: number; // 주 빔 꺾임(=거울) 수
  splitters: number;
  distract: number; // 함정 거울(경로 밖)
  blocks: number;
  pair: [number, number];
}

function paramsFor(s: number): Params {
  const white = s >= 12 && (s - 12) % 8 === 0; // 삼원색 하양 보석 — 12·20·28…
  const pair = !white && s >= 7 && (s - 7) % 2 === 0; // 2색 합성판 — 7판부터 한 판 걸러
  const twoMono = !white && !pair && s >= 10 && (s - 10) % 4 === 0;
  const pairs: [number, number][] = [[1, 2], [1, 4], [2, 4]]; // 노랑·자홍·청록 순환
  return {
    grid: s < 5 ? 5 : s < 9 ? 6 : 7,
    kind: white ? "white" : pair ? "pair" : twoMono ? "twoMono" : "mono",
    turns: Math.min(5, 1 + Math.floor((s - 1) / 3)),
    // 반거울 데뷔 5판. 후반 모노판이 드물어지므로 14판+ 두 갈래(twoMono) 판에도 1개 배정
    splitters: white || pair || s < 5 ? 0 : twoMono ? (s >= 14 ? 1 : 0) : s >= 13 ? 2 : 1,
    distract: s < 4 ? 0 : Math.min(3, 1 + Math.floor((s - 4) / 4)),
    blocks: s < 6 ? 0 : Math.min(4, 1 + Math.floor((s - 6) / 5)),
    pair: pairs[Math.floor(Math.max(0, s - 7) / 2) % 3],
  };
}

// ── 정답 역산 생성 ──────────────────────────────────────
interface WalkTurn { x: number; y: number; dIn: Dir; dOut: Dir; }
interface Walk { turns: WalkTurn[]; end: { x: number; y: number }; legs: { key: string; dir: Dir }[]; }

function attemptGen(stage: number, seed: number): LaserPuzzle | null {
  const P = paramsFor(stage);
  const rnd = mulberry32(seed);
  const g = P.grid;
  const cells: Cell[] = [];
  const optic = new Set<string>();
  const transit = new Set<string>();
  const transitDir = new Map<string, Dir>();
  const k = (x: number, y: number): string => `${x},${y}`;
  const inG = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < g && y < g;
  const shuffled = <T,>(a: T[]): T[] => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };

  /** cur에서 d 방향으로 갈 수 있는 정지 후보(광학 소자 배치 가능 칸)를 모은다. */
  function stops(cx: number, cy: number, d: Dir): { x: number; y: number }[] {
    const out: { x: number; y: number }[] = [];
    let x = cx + DX[d];
    let y = cy + DY[d];
    while (inG(x, y) && !optic.has(k(x, y))) {
      if (!transit.has(k(x, y))) out.push({ x, y });
      x += DX[d];
      y += DY[d];
    }
    return out;
  }

  /** 시작 칸에서 d0로 출발해 turns번 꺾는 경로를 깐다(끝 칸 포함). 실패 시 null. */
  function runWalk(sx: number, sy: number, d0: Dir, turns: number): Walk | null {
    const turnsOut: WalkTurn[] = [];
    const legs: { key: string; dir: Dir }[] = [];
    let cx = sx;
    let cy = sy;
    let d = d0;
    for (let t = 0; t <= turns; t++) {
      const cand = stops(cx, cy, d);
      if (!cand.length) return null;
      const isLast = t === turns;
      const pick = shuffled(cand).find((c) => {
        if (isLast) return true;
        // 다음 꺾임이 이어질 수 있는 정지점만
        return ([0, 1, 2, 3] as Dir[]).some((nd) => nd !== d && nd !== REV[d] && stops(c.x, c.y, nd).length > 0);
      });
      if (!pick) return null;
      // 지나간 칸을 트랜짓으로(정지 칸 제외 — 정지 칸은 소자가 된다)
      let x = cx + DX[d];
      let y = cy + DY[d];
      while (!(x === pick.x && y === pick.y)) {
        transit.add(k(x, y));
        if (!transitDir.has(k(x, y))) transitDir.set(k(x, y), d);
        x += DX[d];
        y += DY[d];
      }
      legs.push({ key: k(pick.x, pick.y), dir: d });
      if (isLast) return { turns: turnsOut, end: pick, legs };
      const nds = shuffled(([0, 1, 2, 3] as Dir[]).filter((nd) => nd !== d && nd !== REV[d] && stops(pick.x, pick.y, nd).length > 0));
      if (!nds.length) return null;
      turnsOut.push({ x: pick.x, y: pick.y, dIn: d, dOut: nds[0] });
      optic.add(k(pick.x, pick.y)); // 거울 자리 선점
      cx = pick.x;
      cy = pick.y;
      d = nds[0];
    }
    return null;
  }

  const mirrorAt = (x: number, y: number, o: 0 | 1): void => {
    cells.push({ kind: "mirror", x, y, solO: o });
    optic.add(k(x, y));
  };
  /** 빔 진행 기준 in→out이 되는 각도. */
  const orientFor = (din: Dir, dout: Dir): 0 | 1 => (reflect(din, 0) === dout ? 0 : 1);

  /** 광원에서 앞으로 걷기 — 끝에 보석. */
  function forwardBeam(color: number, req: number, turns: number): boolean {
    for (let tr = 0; tr < 26; tr++) {
      const ex = Math.floor(rnd() * g);
      const ey = Math.floor(rnd() * g);
      if (optic.has(k(ex, ey)) || transit.has(k(ex, ey))) continue;
      const dirs = shuffled([0, 1, 2, 3] as Dir[]).filter((d) => stops(ex, ey, d).length >= 1);
      if (!dirs.length) continue;
      optic.add(k(ex, ey));
      const w = runWalk(ex, ey, dirs[0], turns);
      if (!w) {
        optic.delete(k(ex, ey)); // 이 시작점 폐기(선점한 거울 자리는 되돌리기 복잡 — 시도 자체를 버린다)
        return false;
      }
      cells.push({ kind: "emitter", x: ex, y: ey, dir: dirs[0], color });
      for (const t of w.turns) mirrorAt(t.x, t.y, orientFor(t.dIn, t.dOut));
      cells.push({ kind: "target", x: w.end.x, y: w.end.y, req });
      optic.add(k(w.end.x, w.end.y));
      return true;
    }
    return false;
  }

  /** 보석에서 거꾸로 걷기 — 끝에 광원(합성 보석의 각 빛줄기). */
  function backwardBeam(tx: number, ty: number, dd: Dir, color: number, turns: number): boolean {
    const w = runWalk(tx, ty, dd, turns);
    if (!w) return false;
    for (const t of w.turns) mirrorAt(t.x, t.y, orientFor(REV[t.dOut] as Dir, REV[t.dIn] as Dir));
    const lastDir = w.legs[w.legs.length - 1].dir;
    cells.push({ kind: "emitter", x: w.end.x, y: w.end.y, dir: REV[lastDir] as Dir, color });
    optic.add(k(w.end.x, w.end.y));
    return true;
  }

  // ── 본 구성 ──
  // 다색·다광원 판은 빔당 꺾임을 3으로 캡 — 난이도는 '여러 빛의 조율'이 내고,
  // 거울 수(=탭 피로·시각 밀도)는 폭주하지 않게 한다(소크 상한 12의 근거).
  const beamTurns = P.kind === "mono" ? P.turns : Math.max(1, Math.min(P.turns - 1, 3));
  if (P.kind === "mono" || P.kind === "twoMono") {
    if (!forwardBeam(1, 1, beamTurns)) return null;
    if (P.kind === "twoMono" && !forwardBeam(1, 1, Math.max(1, beamTurns - 1))) return null;
    // 반거울 — 주 빔의 직진 구간 하나를 반거울로 바꾸고, 갈라진 빛을 새 보석까지
    for (let sp = 0; sp < P.splitters; sp++) {
      let done = false;
      for (let tr = 0; tr < 24 && !done; tr++) {
        const keys = [...transit];
        if (!keys.length) break;
        const key = keys[Math.floor(rnd() * keys.length)];
        const [xs, ys] = key.split(",").map(Number);
        const d = transitDir.get(key)!;
        const o: 0 | 1 = rnd() < 0.5 ? 0 : 1;
        const rd = reflect(d, o);
        transit.delete(key); // 반거울 자리는 소자가 된다
        optic.add(key);
        const w = runWalk(xs, ys, rd, 1 + (stage >= 9 && rnd() < 0.5 ? 1 : 0));
        if (!w) {
          optic.delete(key);
          transit.add(key);
          continue;
        }
        cells.push({ kind: "splitter", x: xs, y: ys, solO: o });
        for (const t of w.turns) mirrorAt(t.x, t.y, orientFor(t.dIn, t.dOut));
        cells.push({ kind: "target", x: w.end.x, y: w.end.y, req: 1 });
        optic.add(k(w.end.x, w.end.y));
        done = true;
      }
      if (!done && sp === 0) return null; // 최소 1개는 성사돼야 반거울 판
    }
  } else {
    // 합성판 — 보석을 먼저 놓고 각 빛줄기를 거꾸로 깐다
    const colors = P.kind === "white" ? [1, 2, 4] : [P.pair[0], P.pair[1]];
    const req = colors.reduce((a, b) => a | b, 0);
    let placed = false;
    for (let tr = 0; tr < 26 && !placed; tr++) {
      const tx = 1 + Math.floor(rnd() * (g - 2));
      const ty = 1 + Math.floor(rnd() * (g - 2));
      if (optic.has(k(tx, ty)) || transit.has(k(tx, ty))) continue;
      const dds = shuffled([0, 1, 2, 3] as Dir[]).filter((d) => stops(tx, ty, d).length >= 1);
      if (dds.length < colors.length) continue;
      optic.add(k(tx, ty));
      let ok = true;
      for (let i = 0; i < colors.length && ok; i++) ok = backwardBeam(tx, ty, dds[i], colors[i], Math.max(1, beamTurns - (i === 2 ? 1 : 0)));
      if (!ok) return null; // 부분 성공 롤백은 복잡 — 시도를 버린다
      cells.push({ kind: "target", x: tx, y: ty, req });
      placed = true;
    }
    if (!placed) return null;
  }

  // 함정 거울·장애물 — 경로 밖 빈 칸에만(정답을 절대 건드리지 않는다)
  const freeCells = (): { x: number; y: number }[] => {
    const out: { x: number; y: number }[] = [];
    for (let x = 0; x < g; x++)
      for (let y = 0; y < g; y++) if (!optic.has(k(x, y)) && !transit.has(k(x, y))) out.push({ x, y });
    return out;
  };
  for (let i = 0; i < P.distract; i++) {
    const f = freeCells();
    if (!f.length) break;
    const c = f[Math.floor(rnd() * f.length)];
    mirrorAt(c.x, c.y, rnd() < 0.5 ? 0 : 1);
  }
  for (let i = 0; i < P.blocks; i++) {
    const f = freeCells();
    if (!f.length) break;
    const c = f[Math.floor(rnd() * f.length)];
    cells.push({ kind: "block", x: c.x, y: c.y });
    optic.add(k(c.x, c.y));
  }

  const puzzle: LaserPuzzle = { grid: g, cells, kind: P.kind, pairReq: P.kind === "pair" ? (P.pair[0] | P.pair[1]) : P.kind === "white" ? 7 : undefined };

  // ── 검증 ① 정답 상태가 실제로 전 보석을 켜는가(간섭 실수 차단) ──
  if (!trace(puzzle, (i) => puzzle.cells[i].solO ?? 0).won) return null;

  // ── 섞기 — 각도만. 우연히 풀려 있으면 다시(검증 ②) ──
  const rot = cells.map((c, i) => (c.kind === "mirror" || c.kind === "splitter" ? i : -1)).filter((i) => i >= 0);
  if (!rot.length) return null;
  for (let tr = 0; tr < 14; tr++) {
    let flips = 0;
    for (const i of rot) {
      const flip = rnd() < 0.55;
      cells[i].scrO = flip ? (((cells[i].solO ?? 0) ^ 1) as 0 | 1) : cells[i].solO;
      if (flip) flips++;
    }
    if (!flips) continue;
    if (!trace(puzzle, (i) => puzzle.cells[i].scrO ?? puzzle.cells[i].solO ?? 0).won) return puzzle;
  }
  // 마지막 수단 — 경로 거울 하나씩 단독 반전을 시도(어느 하나는 반드시 빔을 끊는다)
  for (const i of rot) {
    for (const j of rot) cells[j].scrO = cells[j].solO;
    cells[i].scrO = ((cells[i].solO ?? 0) ^ 1) as 0 | 1;
    if (!trace(puzzle, (x) => puzzle.cells[x].scrO ?? 0).won) return puzzle;
  }
  return null;
}

/** 폴백 — 1거울 수제 판(탭 한 번이면 풀리는 안전판. 이론상 도달 불가, soak가 감시). */
function fallbackPuzzle(): LaserPuzzle {
  return {
    grid: 5,
    kind: "mono",
    cells: [
      { kind: "emitter", x: 0, y: 2, dir: 1, color: 1 },
      { kind: "mirror", x: 2, y: 2, solO: 0, scrO: 1 },
      { kind: "target", x: 2, y: 0, req: 1 },
    ],
  };
}

const seedOf = (stage: number, tr: number): number => ((stage * 2246822519) ^ (tr * 3266489917) ^ 0x85ebca6b) >>> 0;

interface Built {
  puzzle: LaserPuzzle;
  fallback: boolean;
}

function build(stage: number): Built {
  for (let tr = 0; tr < 90; tr++) {
    const p = attemptGen(stage, seedOf(stage, tr));
    if (p) return { puzzle: p, fallback: false };
  }
  return { puzzle: fallbackPuzzle(), fallback: true };
}

/** 스테이지 퍼즐(결정적). 항상 풀 수 있다. */
export function puzzleFor(stage: number): LaserPuzzle {
  return build(stage).puzzle;
}

/** DEV·e2e soak용 — 생성 품질 리포트. */
export function inspect(stage: number): {
  stage: number;
  grid: number;
  kind: string;
  mirrors: number;
  splitters: number;
  targets: number;
  emitters: number;
  rotatable: number;
  solutionWins: boolean;
  scrambledWon: boolean;
  fallback: boolean;
} {
  const b = build(stage);
  const p = b.puzzle;
  const n = (kk: Cell["kind"]): number => p.cells.filter((c) => c.kind === kk).length;
  return {
    stage,
    grid: p.grid,
    kind: p.kind,
    mirrors: n("mirror"),
    splitters: n("splitter"),
    targets: n("target"),
    emitters: n("emitter"),
    rotatable: n("mirror") + n("splitter"),
    solutionWins: trace(p, (i) => p.cells[i].solO ?? 0).won,
    scrambledWon: trace(p, (i) => p.cells[i].scrO ?? p.cells[i].solO ?? 0).won,
    fallback: b.fallback,
  };
}
