// 세포 그리기 도구: 둥근 다각형 경로, 반투명 세포질, 세포벽, 엽록체. 식물 조직 단면(잎, 줄기, 뿌리)에 쓴다.
import * as P from "./paint.mjs";

/** 다각형 꼭짓점을 둥글게 다듬는 경로(모서리마다 r만큼 깎아 이차 곡선으로 잇는다). */
export function roundPoly(ctx, pts, r = 4) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const r1 = Math.min(r, d1 / 2), r2 = Math.min(r, d2 / 2);
    const a = [p1[0] + ((p0[0] - p1[0]) / d1) * r1, p1[1] + ((p0[1] - p1[1]) / d1) * r1];
    const b = [p1[0] + ((p2[0] - p1[0]) / d2) * r2, p1[1] + ((p2[1] - p1[1]) / d2) * r2];
    if (i === 0) ctx.moveTo(a[0], a[1]);
    else ctx.lineTo(a[0], a[1]);
    ctx.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
  }
  ctx.closePath();
}

/** 다각형을 안쪽으로 d만큼 줄인다(볼록 다각형 근사: 무게중심 쪽으로 당김). */
export function shrink(pts, d) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map(([x, y]) => {
    const L = Math.hypot(x - cx, y - cy) || 1;
    return [x - ((x - cx) / L) * d, y - ((y - cy) / L) * d];
  });
}
export const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

/** 반투명 세포 하나: fill(세포질 두 색), wall(세포벽 밝은 선), edge(벽 바깥 가는 선), inner(벽 안쪽 그늘 세기) */
export function cell(t, pts, o = {}) {
  const { ctx } = t;
  const r = o.round ?? 5;
  const [cx, cy] = centroid(pts);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  ctx.save();
  if (o.shadow) {
    ctx.shadowColor = o.shadow;
    ctx.shadowBlur = (o.shadowBlur ?? 3) * t.dpr;
    ctx.shadowOffsetX = 0.8 * t.dpr;
    ctx.shadowOffsetY = 1.4 * t.dpr;
  }
  ctx.beginPath();
  roundPoly(ctx, pts, r);
  ctx.fillStyle = P.lg(ctx, x0, y0, x1, y1, [[0, o.fill?.[0] ?? "#E4F4D2"], [1, o.fill?.[1] ?? "#BFE09F"]]);
  ctx.fill();
  ctx.restore();
  // 벽 안쪽 그늘(세포질이 벽 쪽으로 몰린 느낌, 가운데 액포는 밝게)
  ctx.save();
  ctx.beginPath();
  roundPoly(ctx, pts, r);
  ctx.clip();
  const rad = Math.max(x1 - x0, y1 - y0) * 0.62;
  ctx.fillStyle = P.rg(ctx, cx - (x1 - x0) * 0.12, cy - (y1 - y0) * 0.14, rad * 0.1, cx, cy, rad, [
    [0, o.vac ?? "rgba(255,255,248,.55)"],
    [0.55, "rgba(255,255,248,0)"],
    [1, o.inner ?? "rgba(60,110,40,.30)"],
  ]);
  ctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  ctx.restore();
  // 세포벽: 밝은 굵은 선 + 바깥 가는 어두운 선
  ctx.save();
  ctx.beginPath();
  roundPoly(ctx, pts, r);
  ctx.lineJoin = "round";
  ctx.strokeStyle = o.edge ?? "rgba(88,128,62,.75)";
  ctx.lineWidth = o.edgeW ?? 1.5;
  ctx.stroke();
  ctx.strokeStyle = o.wall ?? "rgba(246,252,236,.95)";
  ctx.lineWidth = o.wallW ?? 0.9;
  ctx.stroke();
  ctx.restore();
}

/** 엽록체: 볼록한 타원 알갱이(왼쪽 위 빛), 안에 그라나 점 몇 개 */
export function chloroplast(t, x, y, a, b, ang = 0, o = {}) {
  const { ctx } = t;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
  ctx.fillStyle = P.rg(ctx, -a * 0.35, -b * 0.45, 0.3, 0, 0, Math.max(a, b) * 1.15, [
    [0, o.hi ?? "#B7E37E"],
    [0.45, o.mid ?? "#4FA83A"],
    [1, o.lo ?? "#22691F"],
  ]);
  ctx.fill();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "rgba(20,70,20,.55)";
  ctx.stroke();
  if (a > 2.6) {
    ctx.fillStyle = "rgba(18,66,18,.45)";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * a * 0.45, b * 0.12, a * 0.16, b * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
