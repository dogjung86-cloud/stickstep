// 레이저 미로 v2 — "사각 블록 배치" 문법(2026-07-19 사용자 확정). v1 탭 토글 회전은 거울당
// 2상태라 연타 몇 초면 풀리는 마찰 0 게임이었다 — 회전 개념이 아예 없는 정사각 블록을
// '어느 칸에 놓을까'만으로 풀게 해 탐색 공간을 칸 수로 키운 구조적 해결이 v2다.
// 퍼즐 생성기·대각 빔 트레이서(순수, DOM 없음. 한붓그리기 gen.ts 문법).
//
// 핵심 보장: "풀 수 없는 판은 절대 출제하지 않는다."
//  ① 생성이 정답 역산 — 정답 블록 배치를 먼저 깔아 경로를 만들고, 블록 '위치만' 흩는다.
//     조각 종류·개수가 정답과 같으므로 제자리로 옮기면 반드시 풀린다(구성으로 보장).
//  ② 정답 배치를 실제 트레이서로 돌려 전 보석 점등을 검증(간섭 실수 차단), 실패 시 재시도.
//  ③ 흩은 상태가 우연히 풀려 있으면 다시 흩는다(흩기는 정답 칸을 피해서). 전멸 시 수제 판 폴백.
// 스테이지 시드 고정(같은 판 = 같은 그림) — 한붓그리기·v1과 동일한 공정성 규칙.
//
// ── 기하(v2의 심장): 빔은 45° 대각선, 블록은 축 정렬 정사각형 ──
// 빔 웨이포인트는 "칸 변의 중점" 격자만 지난다. 배로 늘린 좌표(ex,ey ∈ [0,2G], ex+ey 홀수)에서
// 반 스텝이 정확히 +=(dx,dy)다. 다음 반 스텝이 건널 칸에 블록이 있으면 지금 서 있는 변이
// 반사면 — 세로 변 중점(ex 짝수)이면 dx 반전(좌·우 면), 가로 변 중점(ey 짝수)이면 dy 반전
// (상·하 면). 이 격자류의 대각선은 칸 꼭짓점을 절대 지나지 않아 모서리 모호함이 구조적으로
// 없고, 반사점은 언제나 블록 면 한가운데다(입사각=반사각 45°가 법선 양쪽에 정확히 성립 —
// 교과서 반사 도해 그대로).
//
// 색 규칙 = 빛의 삼원색 가산혼합(중2 III colorMixLab 그대로): R=1·G=2·B=4 비트마스크,
// 보석(통과형 링 노드)은 도착한 빛의 합이 요구색과 '정확히' 같아야 켜진다.

export type DDir = 0 | 1 | 2 | 3; // 대각 방향: ↗·↘·↙·↖
export const DDX = [1, 1, -1, -1] as const;
export const DDY = [-1, 1, 1, -1] as const;
const FLIPX = [3, 2, 1, 0] as const; // 세로 면(좌·우) 반사 — dx 반전
const FLIPY = [1, 0, 3, 2] as const; // 가로 면(상·하) 반사 — dy 반전
export const REV = [2, 3, 0, 1] as const;

export const COLOR_HEX: Record<number, string> = {
  1: "#FF5A66", 2: "#53E07E", 4: "#4DA6FF", // 삼원색
  3: "#FFC53D", 5: "#E85BD0", 6: "#3ADCD8", // 2색 합성(노랑·자홍·청록)
  7: "#F4F6FF", // 하양
};
export const COLOR_NAME: Record<number, string> = { 1: "빨강", 2: "초록", 4: "파랑", 3: "노랑", 5: "자홍", 6: "청록", 7: "하양" };

export interface Piece {
  kind: "box" | "glass";
  solX: number; solY: number; // 정답 칸
  scrX: number; scrY: number; // 흩은 시작 칸(여분 블록은 sol=scr — 안 옮겨도 되는 조각)
}
export interface Rock { x: number; y: number; } // 고정 바위 — 빛 흡수·배치 불가
export interface Emitter { ex: number; ey: number; dir: DDir; color: number; } // 변 중점 노드(배 좌표)
export interface Gem { ex: number; ey: number; req: number; } // 통과형 링 노드(배 좌표)

export interface LaserPuzzle {
  grid: number;
  pieces: Piece[];
  rocks: Rock[];
  emitters: Emitter[];
  gems: Gem[];
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

// ── 격자 기하 헬퍼(트레이서·생성 공용) ──────────────────
/** 노드(ex,ey)에서 d로 반 스텝 나아갈 때 건너는 칸. */
const crossedX = (ex: number, d: DDir): number => ((ex % 2 === 0 ? ex + DDX[d] : ex) - 1) / 2;
const crossedY = (ey: number, d: DDir): number => ((ey % 2 === 0 ? ey + DDY[d] : ey) - 1) / 2;
/** 지금 서 있는 변이 반사면 — 세로 변이면 dx, 가로 변이면 dy 반전. */
const bounce = (ex: number, d: DDir): DDir => (ex % 2 === 0 ? FLIPX[d] : FLIPY[d]) as DDir;

// ── 빔 트레이서(게임·검증 공용 — 단일 진실 공급원) ──────
export interface Seg { x1: number; y1: number; x2: number; y2: number; color: number; } // 칸 단위(노드 = 배 좌표/2)
export interface Hit { x: number; y: number; din: DDir; dout: DDir; color: number; glass: boolean; }
export interface Exit { x: number; y: number; dir: DDir; color: number; } // 판 밖으로 나가는 꼬리 빔
export interface Traced {
  segs: Seg[];
  hits: Hit[];
  exits: Exit[];
  arrived: Map<number, number>; // 보석 인덱스 -> 도착색 비트합
  won: boolean;
}

/** pos(i) = 조각 i의 현재 칸. 게임은 플레이 위치, 검증은 sol/scr을 넣는다. */
export function trace(p: LaserPuzzle, pos: (i: number) => { x: number; y: number }): Traced {
  const occ = new Map<string, "box" | "glass" | "rock">();
  p.pieces.forEach((pc, i) => {
    const q = pos(i);
    occ.set(`${q.x},${q.y}`, pc.kind);
  });
  for (const r of p.rocks) occ.set(`${r.x},${r.y}`, "rock");
  const gemAt = new Map<string, number>();
  p.gems.forEach((gm, i) => gemAt.set(`${gm.ex},${gm.ey}`, i));
  const segs: Seg[] = [];
  const hits: Hit[] = [];
  const exits: Exit[] = [];
  const arrived = new Map<number, number>();
  const g = p.grid;
  for (const e of p.emitters) {
    const visited = new Set<string>();
    const queue: { ex: number; ey: number; d: DDir }[] = [{ ex: e.ex, ey: e.ey, d: e.dir }];
    let guard = 40;
    while (queue.length && guard-- > 0) {
      const b = queue.shift()!;
      let { ex, ey } = b;
      let d = b.d;
      let sx = ex / 2;
      let sy = ey / 2;
      const closeSeg = (): void => {
        if (sx !== ex / 2 || sy !== ey / 2) segs.push({ x1: sx, y1: sy, x2: ex / 2, y2: ey / 2, color: e.color });
      };
      let march = 600;
      while (march-- > 0) {
        const vk = `${ex},${ey},${d}`;
        if (visited.has(vk)) {
          closeSeg();
          break; // 루프 가드(블록 4개 사이 순환 등)
        }
        visited.add(vk);
        const cx = crossedX(ex, d);
        const cy = crossedY(ey, d);
        if (cx < 0 || cy < 0 || cx >= g || cy >= g) {
          closeSeg();
          exits.push({ x: ex / 2, y: ey / 2, dir: d, color: e.color });
          break; // 판 밖 — 렌더가 꼬리 빔을 무대 끝까지 늘린다
        }
        const o = occ.get(`${cx},${cy}`);
        if (o === "rock") {
          closeSeg();
          break; // 바위는 흡수
        }
        if (o) {
          if (o === "glass") {
            // 절반은 통과 — 유리 칸을 건너간 노드에서 같은 방향으로 계속(가지 분기)
            const tx = ex + DDX[d];
            const ty = ey + DDY[d];
            segs.push({ x1: ex / 2, y1: ey / 2, x2: tx / 2, y2: ty / 2, color: e.color });
            const gi = gemAt.get(`${tx},${ty}`);
            if (gi !== undefined) arrived.set(gi, (arrived.get(gi) ?? 0) | e.color);
            queue.push({ ex: tx, ey: ty, d });
          }
          const nd = bounce(ex, d);
          hits.push({ x: ex / 2, y: ey / 2, din: d, dout: nd, color: e.color, glass: o === "glass" });
          closeSeg();
          sx = ex / 2;
          sy = ey / 2;
          d = nd;
          continue;
        }
        ex += DDX[d];
        ey += DDY[d];
        const gi = gemAt.get(`${ex},${ey}`);
        if (gi !== undefined) arrived.set(gi, (arrived.get(gi) ?? 0) | e.color);
      }
    }
  }
  let won = p.gems.length > 0;
  p.gems.forEach((gm, i) => {
    if ((arrived.get(i) ?? 0) !== gm.req) won = false;
  });
  return { segs, hits, exits, arrived, won };
}

// ── 난이도 커브 ─────────────────────────────────────────
interface Params {
  grid: number;
  kind: "mono" | "pair" | "white" | "twoMono";
  turns: number; // 주 빔 꺾임(=필요 상자) 수
  glass: number;
  rocks: number;
  decoys: number; // 여분 블록(v1 함정 거울의 배치판 — 안 써도 되는 조각이 노이즈)
  pair: [number, number];
}

function paramsFor(s: number): Params {
  const white = s >= 12 && (s - 12) % 8 === 0; // 삼원색 하양 보석 — 12·20·28…
  const pairK = !white && s >= 7 && (s - 7) % 2 === 0; // 2색 합성판 — 7판부터 한 판 걸러
  const twoMono = !white && !pairK && s >= 10 && (s - 10) % 4 === 0;
  const multi = white || pairK;
  const pairs: [number, number][] = [[1, 2], [1, 4], [2, 4]]; // 노랑·자홍·청록 순환
  return {
    grid: s < 5 ? 5 : s < 9 ? 6 : 7,
    kind: white ? "white" : pairK ? "pair" : twoMono ? "twoMono" : "mono",
    turns: Math.min(4, 1 + Math.floor((s - 1) / 3)),
    // 유리 데뷔 5판(v1 반거울 계승). 후반 모노판이 드물어지므로 14판+ 두 갈래판에도 1개
    glass: multi || s < 5 ? 0 : twoMono ? (s >= 14 ? 1 : 0) : s >= 13 ? 2 : 1,
    rocks: s < 6 ? 0 : Math.min(4, 1 + Math.floor((s - 6) / 5)),
    // 드래그는 탭보다 조작 비용이 커서 여분 블록은 모노 2·합성 1로 캡(총 조각 ≤ 10)
    decoys: multi ? (s >= 8 ? 1 : 0) : s < 4 ? 0 : Math.min(2, 1 + Math.floor((s - 4) / 6)),
    pair: pairs[Math.floor(Math.max(0, s - 7) / 2) % 3],
  };
}

// ── 정답 역산 생성 ──────────────────────────────────────
function attemptGen(stage: number, seed: number): LaserPuzzle | null {
  const P = paramsFor(stage);
  const rnd = mulberry32(seed);
  const g = P.grid;
  const pieces: Piece[] = [];
  const rocks: Rock[] = [];
  const emitters: Emitter[] = [];
  const gems: Gem[] = [];
  const optic = new Set<string>(); // 정답 조각·바위가 차지한 칸
  const transit = new Set<string>(); // 정답 빔이 건너는 칸(보석 전까지)
  const transitInfo = new Map<string, { ex: number; ey: number; d: DDir }>(); // 첫 통과 노드·방향
  const usedNodes = new Set<string>(); // 광원·보석 노드
  const ck = (x: number, y: number): string => `${x},${y}`;
  const nk = (ex: number, ey: number): string => `${ex},${ey}`;
  const inCell = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < g && y < g;
  const shuffled = <T,>(a: T[]): T[] => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };

  interface RayCand { ex: number; ey: number; cx: number; cy: number; } // 이 노드에서 꺾으려면 (cx,cy)에 상자
  /** 노드에서 d로 곧게 나아가며 턴 후보(상자를 놓을 수 있는 자유 칸)와 지나는 노드를 모은다. */
  function ray(ex: number, ey: number, d: DDir): { cand: RayCand[]; nodes: { ex: number; ey: number }[] } {
    const cand: RayCand[] = [];
    const nodes: { ex: number; ey: number }[] = [];
    let m = 4 * g;
    while (m-- > 0) {
      const cx = crossedX(ex, d);
      const cy = crossedY(ey, d);
      if (!inCell(cx, cy) || optic.has(ck(cx, cy))) break; // 판 밖·기존 소자 — 구성 걷기는 여기서 멈춘다
      if (!transit.has(ck(cx, cy))) cand.push({ ex, ey, cx, cy }); // 다른 빔이 건너는 칸엔 못 놓는다(빔은 서로 통과)
      ex += DDX[d];
      ey += DDY[d];
      nodes.push({ ex, ey });
    }
    return { cand, nodes };
  }

  /** from 노드에서 to 노드까지 건넌 칸을 트랜짓으로 기록. */
  function markTransit(ex: number, ey: number, d: DDir, toEx: number, toEy: number): void {
    let m = 4 * g;
    while (!(ex === toEx && ey === toEy) && m-- > 0) {
      const key = ck(crossedX(ex, d), crossedY(ey, d));
      if (!transit.has(key)) {
        transit.add(key);
        transitInfo.set(key, { ex, ey, d });
      }
      ex += DDX[d];
      ey += DDY[d];
    }
  }

  interface Walk { boxes: { x: number; y: number }[]; end: { ex: number; ey: number }; lastDir: DDir; }
  /** 시작 노드에서 d0로 출발해 turns번 꺾는 경로를 깐다(끝 노드 포함). 실패 시 null. */
  function runWalk(sx: number, sy: number, d0: DDir, turns: number): Walk | null {
    const boxes: { x: number; y: number }[] = [];
    let ex = sx;
    let ey = sy;
    let d = d0;
    for (let t = 0; t < turns; t++) {
      const { cand } = ray(ex, ey, d);
      const isLast = t === turns - 1;
      const pick = shuffled(cand).find((c) => {
        const nd = bounce(c.ex, d);
        const r2 = ray(c.ex, c.ey, nd);
        return isLast ? r2.nodes.some((n) => !usedNodes.has(nk(n.ex, n.ey))) : r2.cand.length > 0;
      });
      if (!pick) return null;
      markTransit(ex, ey, d, pick.ex, pick.ey);
      optic.add(ck(pick.cx, pick.cy));
      boxes.push({ x: pick.cx, y: pick.cy });
      ex = pick.ex;
      ey = pick.ey;
      d = bounce(ex, d);
    }
    const fin = ray(ex, ey, d).nodes.filter((n) => !usedNodes.has(nk(n.ex, n.ey)));
    if (!fin.length) return null;
    const end = fin[Math.floor(rnd() * fin.length)];
    markTransit(ex, ey, d, end.ex, end.ey);
    return { boxes, end, lastDir: d };
  }

  /** 아직 안 쓰인 변 중점 노드 하나(벽 포함). */
  function randomNode(): { ex: number; ey: number } | null {
    for (let t = 0; t < 30; t++) {
      const vertical = rnd() < 0.5;
      const ex = vertical ? 2 * Math.floor(rnd() * (g + 1)) : 2 * Math.floor(rnd() * g) + 1;
      const ey = vertical ? 2 * Math.floor(rnd() * g) + 1 : 2 * Math.floor(rnd() * (g + 1));
      if (!usedNodes.has(nk(ex, ey))) return { ex, ey };
    }
    return null;
  }

  const pushBoxes = (list: { x: number; y: number }[]): void => {
    for (const b of list) pieces.push({ kind: "box", solX: b.x, solY: b.y, scrX: b.x, scrY: b.y });
  };

  /** 광원에서 앞으로 걷기 — 끝에 보석. */
  function forwardBeam(color: number, req: number, turns: number): boolean {
    for (let tr = 0; tr < 26; tr++) {
      const n = randomNode();
      if (!n) return false;
      const dirs = shuffled([0, 1, 2, 3] as DDir[]).filter((d) => ray(n.ex, n.ey, d).cand.length >= 1);
      if (!dirs.length) continue;
      usedNodes.add(nk(n.ex, n.ey));
      const w = runWalk(n.ex, n.ey, dirs[0], turns);
      if (!w) return false; // 부분 변형 롤백은 복잡 — 시도를 버린다(v1 관례)
      emitters.push({ ex: n.ex, ey: n.ey, dir: dirs[0], color });
      pushBoxes(w.boxes);
      gems.push({ ex: w.end.ex, ey: w.end.ey, req });
      usedNodes.add(nk(w.end.ex, w.end.ey));
      return true;
    }
    return false;
  }

  /** 보석에서 거꾸로 걷기 — 끝에 광원(합성 보석의 각 빛줄기. 반사는 축 반전이라 경로 가역). */
  function backwardBeam(gx: number, gy: number, dd: DDir, color: number, turns: number): boolean {
    const w = runWalk(gx, gy, dd, turns);
    if (!w) return false;
    pushBoxes(w.boxes);
    emitters.push({ ex: w.end.ex, ey: w.end.ey, dir: REV[w.lastDir] as DDir, color });
    usedNodes.add(nk(w.end.ex, w.end.ey));
    return true;
  }

  // ── 본 구성 ──
  // 다색판은 빔당 꺾임을 2로 캡 — 난이도는 '여러 빛의 조율'이 내고, 조각 수(=드래그 피로)는
  // 폭주하지 않게 한다(총 조각 ≤ 10 = 소크 상한의 근거).
  const beamTurns = Math.max(1, Math.min(2, P.turns - 1));
  if (P.kind === "mono" || P.kind === "twoMono") {
    if (!forwardBeam(1, 1, P.turns)) return null;
    if (P.kind === "twoMono" && !forwardBeam(1, 1, beamTurns)) return null;
    // 유리 — 주 빔이 건너는 칸 하나를 유리로 바꾸고, 갈라진 반사 가지를 새 보석까지
    for (let sp = 0; sp < P.glass; sp++) {
      let done = false;
      for (let tr = 0; tr < 24 && !done; tr++) {
        const keys = [...transit];
        if (!keys.length) break;
        const key = keys[Math.floor(rnd() * keys.length)];
        const info = transitInfo.get(key)!;
        const parts = key.split(",");
        const xs = Number(parts[0]);
        const ys = Number(parts[1]);
        const nd = bounce(info.ex, info.d);
        transit.delete(key); // 유리 자리는 소자가 된다
        optic.add(key);
        const w = runWalk(info.ex, info.ey, nd, 1);
        if (!w) {
          optic.delete(key);
          transit.add(key);
          continue;
        }
        pieces.push({ kind: "glass", solX: xs, solY: ys, scrX: xs, scrY: ys });
        pushBoxes(w.boxes);
        gems.push({ ex: w.end.ex, ey: w.end.ey, req: 1 });
        usedNodes.add(nk(w.end.ex, w.end.ey));
        done = true;
      }
      if (!done && sp === 0) return null; // 최소 1개는 성사돼야 유리 판
    }
  } else {
    // 합성판 — 보석 노드를 먼저 놓고 각 빛줄기를 거꾸로 깐다
    const colors = P.kind === "white" ? [1, 2, 4] : [P.pair[0], P.pair[1]];
    const req = colors.reduce((a, b) => a | b, 0);
    let placed = false;
    for (let tr = 0; tr < 26 && !placed; tr++) {
      const n = randomNode();
      if (!n) return null;
      const dds = shuffled([0, 1, 2, 3] as DDir[]).filter((d) => ray(n.ex, n.ey, d).cand.length >= 1);
      if (dds.length < colors.length) continue;
      usedNodes.add(nk(n.ex, n.ey));
      let okAll = true;
      for (let i = 0; i < colors.length && okAll; i++) okAll = backwardBeam(n.ex, n.ey, dds[i], colors[i], Math.max(1, beamTurns - (i === 2 ? 1 : 0)));
      if (!okAll) return null; // 부분 성공 롤백은 복잡 — 시도를 버린다
      gems.push({ ex: n.ex, ey: n.ey, req });
      placed = true;
    }
    if (!placed) return null;
  }

  // 바위·여분 블록 — 경로 밖 빈 칸에만(정답을 절대 건드리지 않는다)
  const freeCells = (): { x: number; y: number }[] => {
    const out: { x: number; y: number }[] = [];
    for (let x = 0; x < g; x++) for (let y = 0; y < g; y++) if (!optic.has(ck(x, y)) && !transit.has(ck(x, y))) out.push({ x, y });
    return out;
  };
  for (let i = 0; i < P.rocks; i++) {
    const f = freeCells();
    if (!f.length) break;
    const c = f[Math.floor(rnd() * f.length)];
    rocks.push({ x: c.x, y: c.y });
    optic.add(ck(c.x, c.y));
  }
  const needed = pieces.length; // 여분 블록 앞까지가 "옮겨야 하는" 조각
  for (let i = 0; i < P.decoys; i++) {
    const f = freeCells();
    if (!f.length) break;
    const c = f[Math.floor(rnd() * f.length)];
    pieces.push({ kind: "box", solX: c.x, solY: c.y, scrX: c.x, scrY: c.y });
    optic.add(ck(c.x, c.y));
  }

  const puzzle: LaserPuzzle = {
    grid: g, pieces, rocks, emitters, gems, kind: P.kind,
    pairReq: P.kind === "pair" ? (P.pair[0] | P.pair[1]) : P.kind === "white" ? 7 : undefined,
  };

  // ── 검증 ① 정답 배치가 실제로 전 보석을 켜는가(간섭 실수 차단) ──
  if (!trace(puzzle, (i) => ({ x: puzzle.pieces[i].solX, y: puzzle.pieces[i].solY })).won) return null;

  // ── 흩기 — 위치만, 정답 칸·바위는 피해서. 우연히 풀려 있으면 다시(검증 ②) ──
  if (!needed) return null;
  const solSet = new Set(pieces.map((p) => ck(p.solX, p.solY)));
  const rockSet = new Set(rocks.map((r) => ck(r.x, r.y)));
  const open: { x: number; y: number }[] = [];
  for (let x = 0; x < g; x++) for (let y = 0; y < g; y++) if (!solSet.has(ck(x, y)) && !rockSet.has(ck(x, y))) open.push({ x, y });
  if (open.length < needed) return null;
  for (let tr = 0; tr < 14; tr++) {
    const spots = shuffled(open);
    for (let i = 0; i < needed; i++) {
      pieces[i].scrX = spots[i].x;
      pieces[i].scrY = spots[i].y;
    }
    if (!trace(puzzle, (i) => ({ x: puzzle.pieces[i].scrX, y: puzzle.pieces[i].scrY })).won) return puzzle;
  }
  return null;
}

/** 폴백 — 1블록 수제 판(손검산 완료. 이론상 도달 불가, soak가 감시). */
function fallbackPuzzle(): LaserPuzzle {
  return {
    grid: 5,
    kind: "mono",
    pieces: [{ kind: "box", solX: 1, solY: 2, scrX: 3, scrY: 3 }],
    rocks: [],
    emitters: [{ ex: 0, ey: 3, dir: 1, color: 1 }],
    gems: [{ ex: 1, ey: 6, req: 1 }],
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
  boxes: number;
  glass: number;
  decoys: number;
  rocks: number;
  gems: number;
  emitters: number;
  movable: number;
  solutionWins: boolean;
  scrambledWon: boolean;
  fallback: boolean;
} {
  const b = build(stage);
  const p = b.puzzle;
  return {
    stage,
    grid: p.grid,
    kind: p.kind,
    boxes: p.pieces.filter((x) => x.kind === "box").length,
    glass: p.pieces.filter((x) => x.kind === "glass").length,
    decoys: p.pieces.filter((x) => x.solX === x.scrX && x.solY === x.scrY).length,
    rocks: p.rocks.length,
    gems: p.gems.length,
    emitters: p.emitters.length,
    movable: p.pieces.length,
    solutionWins: trace(p, (i) => ({ x: p.pieces[i].solX, y: p.pieces[i].solY })).won,
    scrambledWon: trace(p, (i) => ({ x: p.pieces[i].scrX, y: p.pieces[i].scrY })).won,
    fallback: b.fallback,
  };
}
