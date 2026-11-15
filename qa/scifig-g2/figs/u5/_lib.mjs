// g2u5 그림들이 함께 쓰는 도우미(밑줄로 시작해 빌드가 그림으로 치지 않는다).
//   확대 원(시범 g2u4l5f1과 같은 결: 그림자, 흰 고리, 회색 선), 확대 통로(두 원의 바깥 접선, 반투명 쐐기와 점선),
//   눈금 막대, 포아송 씨앗(겹치지 않게 흩은 점), 마이토콘드리아(작은 분홍 알갱이), 곡선 점열.
// 쓰는 법: import { lib } from "./_lib.mjs"; const L = lib(kit);

export function lib(kit) {
  const { paint: P, svg: S } = kit;

  /** 확대 원을 연다: 그림자를 깔고 원으로 자른 뒤 바탕을 칠한다. 다 그린 뒤 lensClose. */
  function lensOpen(t, c, r, bg = ["#FFFFFF", "#E9EDF2"], shadow = 0.2) {
    const { ctx } = t;
    P.dropShadow(t, (q) => q.arc(c[0], c[1], r, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: shadow });
    ctx.save();
    ctx.beginPath();
    ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
    ctx.clip();
    if (bg) {
      ctx.fillStyle = P.rg(ctx, c[0] - r * 0.3, c[1] - r * 0.4, 4, c[0], c[1], r, [[0, bg[0]], [1, bg[1]]]);
      ctx.fillRect(c[0] - r, c[1] - r, 2 * r, 2 * r);
    }
  }
  /** 확대 원을 닫는다: 자르기를 풀고 흰 고리와 바깥 회색 선. */
  function lensClose(t, c, r, o = {}) {
    const { ctx } = t;
    ctx.restore();
    ctx.save();
    ctx.lineWidth = o.ring ?? 4;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = o.line ?? "#A9B3C1";
    ctx.beginPath();
    ctx.arc(c[0], c[1], r + (o.ring ?? 4) * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /** 두 원(c1,r1 → c2,r2)의 바깥 접선 두 개. [[p1,p2],[q1,q2]] */
  function tangents(c1, r1, c2, r2) {
    const dx = c2[0] - c1[0], dy = c2[1] - c1[1];
    const d = Math.hypot(dx, dy);
    const ux = dx / d, uy = dy / d;
    const th = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / d)));
    const out = [];
    for (const s of [1, -1]) {
      const c = Math.cos(s * th), sn = Math.sin(s * th);
      const nx = ux * c - uy * sn, ny = ux * sn + uy * c;
      out.push([[c1[0] + r1 * nx, c1[1] + r1 * ny], [c2[0] + r2 * nx, c2[1] + r2 * ny]]);
    }
    return out;
  }

  /** 확대 통로: 작은 원(고른 곳)에서 큰 확대 원으로 반투명 쐐기와 점선. 바탕 판 위, 시야와 확대 원보다 먼저 그린다
   *  (뒤에 그리는 원들이 통로의 양 끝을 덮는다). o.clip(ctx)를 주면 그 경로 안에만 그린다. */
  function lensPath(t, c1, r1, c2, r2, o = {}) {
    const { ctx } = t;
    const [[a1, a2], [b1, b2]] = tangents(c1, r1, c2, r2);
    ctx.save();
    if (o.clip) {
      ctx.beginPath();
      o.clip(ctx);
      ctx.clip("evenodd");
    }
    ctx.fillStyle = P.lg(ctx, c1[0], c1[1], c2[0], c2[1], [[0, "rgba(120,135,160,.20)"], [1, "rgba(120,135,160,.05)"]]);
    ctx.beginPath();
    ctx.moveTo(a1[0], a1[1]);
    ctx.lineTo(a2[0], a2[1]);
    ctx.arc(c2[0], c2[1], r2, Math.atan2(a2[1] - c2[1], a2[0] - c2[0]), Math.atan2(b2[1] - c2[1], b2[0] - c2[0]), o.ccw ?? false);
    ctx.lineTo(b1[0], b1[1]);
    ctx.arc(c1[0], c1[1], r1, Math.atan2(b1[1] - c1[1], b1[0] - c1[0]), Math.atan2(a1[1] - c1[1], a1[0] - c1[0]), o.ccw ?? false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(120,135,160,.6)";
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a1[0], a1[1]);
    ctx.lineTo(a2[0], a2[1]);
    ctx.moveTo(b1[0], b1[1]);
    ctx.lineTo(b2[0], b2[1]);
    ctx.stroke();
    ctx.restore();
  }

  /** 고른 곳 표시: 작은 원(흰 고리 + 회색 선). */
  function marker(t, c, r) {
    const { ctx } = t;
    ctx.save();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "rgba(255,255,255,.95)";
    ctx.beginPath();
    ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#7F8B9C";
    ctx.beginPath();
    ctx.arc(c[0], c[1], r + 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /** 눈금 막대(SVG): x0~x1 길이의 막대와 아래(또는 o.side) 글자. */
  function scaleBar(s, x0, x1, y, text, o = {}) {
    const g = S.el(s, "g");
    const col = o.color ?? "#26303D";
    S.el(g, "line", { x1: x0, y1: y, x2: x1, y2: y, stroke: "#fff", "stroke-width": 6.2, "stroke-linecap": "butt", opacity: 0.9 });
    S.el(g, "line", { x1: x0, y1: y, x2: x1, y2: y, stroke: col, "stroke-width": 3, "stroke-linecap": "butt" });
    for (const x of [x0, x1]) {
      S.el(g, "line", { x1: x, y1: y - 4, x2: x, y2: y + 4, stroke: "#fff", "stroke-width": 3.6 });
      S.el(g, "line", { x1: x, y1: y - 3.5, x2: x, y2: y + 3.5, stroke: col, "stroke-width": 1.4 });
    }
    if (o.side === "right") S.label(s, x1 + 6, y + 4.8, text, { size: o.size ?? 13.5, color: col });
    else if (o.side === "left") S.label(s, x0 - 6, y + 4.8, text, { size: o.size ?? 13.5, color: col, anchor: "end" });
    else S.label(s, (x0 + x1) / 2, y + (o.dy ?? 17), text, { size: o.size ?? 13.5, color: col, anchor: "middle" });
    return g;
  }

  /** 포아송 씨앗: inside(x,y)를 만족하는 곳에 서로 minD 이상 떨어진 점을 n개까지(시도 tries번). keep은 미리 놓인 점. */
  function poisson(rnd, { n = 100, minD = 10, box, inside = () => true, keep = [], tries = 20000, gap }) {
    const pts = keep.slice();
    for (let i = 0; i < tries && pts.length < n + keep.length; i++) {
      const x = box[0] + (box[2] - box[0]) * rnd(), y = box[1] + (box[3] - box[1]) * rnd();
      if (!inside(x, y)) continue;
      let ok = true;
      for (const p of pts) {
        const need = gap ? gap(p, x, y) : minD;
        if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < need * need) {
          ok = false;
          break;
        }
      }
      if (ok) pts.push([x, y]);
    }
    return pts.slice(keep.length);
  }

  /** 마이토콘드리아(세포 그림용 작은 알갱이): 길이 L, 굵기 W(px), 분홍 겉막과 안쪽 주름의 기미. */
  function mito(t, x, y, Lh, W, ang, o = {}) {
    const { ctx } = t;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const hl = Lh / 2, hw = W / 2;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(-hl + hw, -hw);
      ctx.lineTo(hl - hw, -hw);
      ctx.arc(hl - hw, 0, hw, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-hl + hw, hw);
      ctx.arc(-hl + hw, 0, hw, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.closePath();
    };
    path();
    ctx.fillStyle = P.lg(ctx, 0, -hw, 0, hw, [[0, o.hi ?? "#F59AB5"], [0.55, o.mid ?? "#E0527F"], [1, o.lo ?? "#B8325E"]]);
    ctx.fill();
    ctx.lineWidth = 0.45;
    ctx.strokeStyle = "rgba(120,20,60,.6)";
    ctx.stroke();
    if (Lh > 4.5) {
      // 안쪽 주름 기미: 가로 줄 몇 개(주황)
      ctx.save();
      path();
      ctx.clip();
      ctx.strokeStyle = "rgba(255,190,120,.85)";
      ctx.lineWidth = Math.max(0.35, W * 0.16);
      const k = Math.max(2, Math.round(Lh / 2.2));
      for (let i = 1; i < k; i++) {
        const xx = -hl + (Lh * i) / k;
        ctx.beginPath();
        ctx.moveTo(xx, i % 2 ? -hw * 0.75 : hw * 0.75);
        ctx.lineTo(xx, i % 2 ? hw * 0.1 : -hw * 0.1);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 윗면 빛
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.ellipse(-hl * 0.15, -hw * 0.45, hl * 0.55, hw * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 이차 베지어 점열(화살표 중심선용) */
  const quad = (a, b, c, n = 16) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const u = i / n;
      return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]];
    });

  /** 삼차 베지어 점열 */
  const cubic = (a, b, c, d, n = 20) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const u = i / n, v = 1 - u;
      return [v ** 3 * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u ** 3 * d[0], v ** 3 * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u ** 3 * d[1]];
    });

  return { lensOpen, lensClose, lensPath, tangents, marker, scaleBar, poisson, mito, quad, cubic };
}
