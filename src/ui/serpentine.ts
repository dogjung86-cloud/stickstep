// 게임 지도용 구불구불한 경로 생성기 — N개 노드를 부드러운 곡선 위에 배치한다.
// 방향(아틀라스/트레일/토스)과 무관하게 재사용하는 순수 지오메트리.

export interface MapPoint { x: number; y: number; }
export interface Serpentine {
  points: MapPoint[]; // 각 노드 중심(px)
  path: string;       // 노드를 지나는 부드러운 SVG path(d)
  width: number;
  height: number;
}

export interface SerpentineOpts {
  width: number;      // 트랙 폭(px)
  gap?: number;       // 노드 세로 간격
  top?: number;       // 첫 노드 y
  bottom?: number;    // 마지막 여백
  amp?: number;       // 중심에서 좌우 진폭
  pattern?: number[]; // -1..1 정규화된 좌우 오프셋 시퀀스(반복)
}

const DEFAULT_PATTERN = [0, 0.72, 1, 0.72, 0, -0.72, -1, -0.72];

export function serpentine(count: number, opts: SerpentineOpts): Serpentine {
  const width = opts.width;
  const gap = opts.gap ?? 118;
  const top = opts.top ?? 70;
  const amp = opts.amp ?? Math.min(96, width * 0.26);
  const pattern = opts.pattern ?? DEFAULT_PATTERN;
  const cx = width / 2;

  const points: MapPoint[] = [];
  for (let i = 0; i < count; i++) {
    const off = pattern[i % pattern.length];
    points.push({ x: cx + off * amp, y: top + i * gap });
  }
  const height = top + (count - 1) * gap + (opts.bottom ?? top);

  return { points, path: smoothPath(points), width, height };
}

/** Catmull-Rom → cubic bezier 로 노드들을 부드럽게 잇는다. */
export function smoothPath(pts: MapPoint[]): string {
  if (pts.length < 2) return "";
  const p = pts;
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const t = 0.5 / 3;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * 완료 노드 수(nodesDone)까지의 경로. 현재 노드(첫 미완료 노드)까지 색칠해
 * "여기까지 걸어왔다"를 보여준다(Duolingo식). 호출부에서 nodesDone>0일 때만 그린다.
 */
export function pathUpTo(pts: MapPoint[], nodesDone: number): string {
  const upto = pts.slice(0, Math.max(2, Math.min(pts.length, nodesDone + 1)));
  return smoothPath(upto);
}
