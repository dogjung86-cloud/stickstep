// g2u6l4f2 들숨과 날숨: 같은 사람의 가슴을 앞에서 비춰 본 두 칸. 들숨은 갈비뼈가 위와 바깥으로, 가로막이 아래로(돔이 납작해짐) →
// 흉강이 커짐 → 허파 속 압력이 낮아짐 → 공기가 들어옴. 날숨은 모두 반대. 반대쪽 숨의 흉강 윤곽을 흐린 점선으로 겹친다.
// 허파에는 힘 화살표를 달지 않는다(허파는 근육이 없다). 움직임의 폭은 크게 그렸다. 검산 메모는 g2u6l4f2.md
import * as L from "./_lib.mjs";

export const meta = {
  key: "g2u6l4f2",
  w: 340,
  h: 394,
  alt: "들숨과 날숨을 나란히 그린 가슴. 들숨에서는 갈비뼈가 위와 바깥으로 올라가고 가로막이 내려가 흉강이 커지고, 날숨에서는 반대로 움직여 흉강이 작아져요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(73);
  const FONT = "'Pretendard Variable', Pretendard, sans-serif";
  await document.fonts.load(`700 13.5px ${FONT}`, "갈비뼈가로막흉강부피커짐작아짐허파속압력낮아짐높아짐공기가들어와요나가요들숨날숨");

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const s = 3.9, TOP = 36, NY = TOP + 33 * s;
  const IN = 1, EX = 0; // 갈비뼈 상태(ribAt의 f)
  const st = {
    [EX]: {
      DU: [[-12.6, 17.2], [-11.4, 15.2], [-9.6, 13.0], [-7.5, 11.9], [-5.6, 11.6], [-3.4, 12.0], [-1.2, 12.9], [1.5, 13.3], [4.2, 12.9], [6.4, 12.6], [8.6, 13.2], [10.6, 14.8], [12.2, 16.8], [12.9, 18.0]],
      DLo: [[12.9, 18.0], [13.4, 19.6], [13.5, 21.2], [11.9, 19.6], [10.3, 17.2], [8.4, 15.6], [6.3, 15.1], [3.5, 15.6], [0, 15.8], [-3.4, 14.8], [-5.6, 14.3], [-7.6, 14.6], [-9.8, 15.9], [-11.6, 18.0], [-12.7, 20.1], [-13.0, 18.6], [-12.6, 17.2]],
      RLlat: [[-1.5, -0.6], [-2.3, -2.6], [-3.9, -3.3], [-6.4, -2.6], [-9.2, -0.5], [-11.3, 2.8], [-12.6, 7.0], [-13.1, 11.4], [-13.1, 14.6], [-12.9, 16.2], [-12.6, 17.2]],
      RLmed: [[-2.15, 10.8], [-2.5, 7.8], [-2.3, 4.8], [-1.75, 1.8], [-1.5, -0.6]],
      LLlat: [[12.9, 18.0], [13.2, 16.6], [13.3, 14.0], [13.1, 10.6], [12.4, 6.8], [11.1, 3.0], [8.9, -0.4], [6.2, -2.5], [3.8, -3.2], [2.2, -2.5], [1.6, -0.6], [1.7, 2.0], [1.9, 5.0], [2.05, 8.3], [3.4, 9.7], [5.2, 10.7], [5.6, 11.8], [4.7, 12.7], [3.5, 13.3]],
      ling: 3.0,
    },
    [IN]: {
      DU: [[-13.7, 19.7], [-12.1, 18.2], [-9.8, 16.6], [-7.5, 15.8], [-5.6, 15.6], [-3.4, 15.8], [-1.2, 16.2], [1.5, 16.4], [4.2, 16.2], [6.4, 16.0], [8.6, 16.3], [10.6, 17.2], [12.7, 18.8], [13.9, 20.2]],
      DLo: [[13.9, 20.2], [14.3, 21.6], [14.4, 23.0], [12.8, 21.2], [10.6, 19.1], [8.6, 18.2], [6.4, 17.9], [4.2, 18.1], [0, 18.4], [-3.4, 18.0], [-5.6, 17.8], [-7.5, 18.0], [-9.8, 18.9], [-12.0, 20.6], [-13.6, 22.4], [-14.0, 21.0], [-13.7, 19.7]],
      RLlat: [[-1.5, -0.6], [-2.3, -2.6], [-3.9, -3.3], [-6.5, -2.6], [-9.5, -0.5], [-11.9, 2.8], [-13.4, 7.0], [-14.1, 11.4], [-14.25, 15.0], [-14.1, 17.6], [-13.7, 19.7]],
      RLmed: [[-2.0, 13.6], [-2.15, 10.8], [-2.5, 7.8], [-2.3, 4.8], [-1.75, 1.8], [-1.5, -0.6]],
      LLlat: [[13.9, 20.2], [14.2, 18.4], [14.4, 15.0], [14.1, 11.0], [13.3, 6.9], [11.7, 3.0], [9.2, -0.4], [6.3, -2.5], [3.8, -3.2], [2.2, -2.5], [1.6, -0.6], [1.7, 2.0], [1.9, 5.0], [2.05, 8.3], [3.4, 9.7], [5.2, 10.8], [5.7, 12.0], [5.0, 13.4], [3.9, 14.6]],
      ling: 3.2,
    },
  };

  const panel = (cx, f, other) => {
    const X = (u) => cx + u * s, Y = (v) => NY + v * s;
    const C = (pts) => pts.map(([u, v]) => [X(u), Y(v)]);
    const S0 = st[f];
    const body = L.frontBody(cx, TOP, s, { bottom: 66 });
    const fade = (x, y) => 1 - P.smooth(Y(21.5), Y(27), y);
    L.pillow(t, L.bbox([...body.head, ...body.body]), (c) => {
      L.poly(c, body.head);
      L.poly(c, body.body);
      for (const e of L.ears(cx, TOP, s)) L.poly(c, e);
    }, { color: "#F3D2BE", light: "#FDF1E8", dark: "#D7A68C", blur: 9, relief: 0.8, alpha: 0.62, edgeAlpha: 0.95, spec: 0.08, rim: 0.1, alphaFn: fade });

    const ribs = L.RIBS.map((r) => L.ribAt(r, f));
    // 뒤로 비치는 등뼈와 갈비뼈 뒤 활
    const ghost = L.layer(t);
    {
      const c = ghost.ctx;
      c.lineCap = "round";
      for (let v = -16.5; v < 27; v += 2.25) {
        const wv = v < -5 ? 1.35 : v < 18 ? 1.6 : 2.0;
        c.fillStyle = "#E9DFCC";
        c.beginPath();
        c.roundRect(X(-wv), Y(v), 2 * wv * s, 1.7 * s, 1.8);
        c.fill();
      }
      for (const r of ribs)
        for (const sd of [-1, 1]) {
          const pr = L.ribParts(r, sd, ribs);
          c.strokeStyle = "#E6DCC8";
          c.lineWidth = 1.1 * s;
          c.beginPath();
          L.poly(c, C(pr.back), false);
          c.stroke();
        }
    }
    L.put(t, ghost, 0.45);

    // 흉강(갈비뼈와 가로막으로 둘러싸인 공간): 옅은 푸른 빛
    const dUp = L.spline(C(S0.DU), false, 10);
    const yOn = (pts, x) => {
      for (let i = 1; i < pts.length; i++)
        if ((pts[i - 1][0] - x) * (pts[i][0] - x) <= 0) {
          const q = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1);
          return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q;
        }
      return null;
    };
    const duAt = (u) => (yOn(dUp, X(u)) - NY) / s;
    // 몸의 오른쪽 허파의 가장 낮은 옆 끝에서 옆 가장자리를 따라 꼭대기, 위를 건너 왼쪽 허파의 옆 가장자리로 내려와 가로막을 따라 돌아온다
    const cavity = (SS) => {
      const up = L.spline(C([...SS.RLlat.slice(2).reverse(), [-1.6, -2.6], [0, -2.3], [1.6, -2.6], ...SS.LLlat.slice(0, 9).reverse()]), false, 8);
      const du = L.spline(C(SS.DU), false, 10);
      return [...up, ...du.slice().reverse().slice(1)];
    };
    const cav = cavity(S0);
    ctx.save();
    ctx.fillStyle = "rgba(160,205,245,.22)";
    ctx.beginPath();
    L.poly(ctx, cav);
    ctx.fill();
    ctx.restore();

    // 가로막(돔). 아래 가장자리는 배 쪽으로 휘어 내려가며 옅어진다
    const dLo = L.spline(C(S0.DLo), false, 8);
    const dia = [...dUp, ...dLo.slice(1, -1)];
    const loEdge = dLo.slice(Math.round(dLo.length * 0.13), Math.round(dLo.length * 0.87));
    L.pillow(t, L.bbox(dia), (c) => L.poly(c, dia), {
      color: "#BE5059", light: "#F0A3A0", dark: "#7A2A3C", blur: 3.4, relief: 0.5, spec: 0.1, gloss: 14,
      alphaFn: (x, y) => {
        const yt = yOn(dUp, x), yb = yOn(loEdge, x);
        if (yt === null || yb === null || yb <= yt) return 1;
        return 1 - 0.6 * P.smooth(0.15, 1.0, (y - yt) / (yb - yt));
      },
      tex: (x, y) => {
        const u = (x - cx) / s, v = (y - NY) / s;
        const tendon = (1 - P.smooth(2.4, 5.2, Math.abs(u + 0.3))) * (1 - P.smooth(S0.DU[6][1] + 1.6, S0.DU[6][1] + 3.0, v));
        const ang = Math.atan2(y - Y(S0.DU[5][1] - 2), x - X(-0.3));
        const fib = 0.5 + 0.5 * Math.sin(ang * 90 + nz.n2(x * 0.07, y * 0.07) * 2.4);
        const m = 0.86 + 0.2 * fib * (1 - tendon);
        return [m + tendon * 0.55, m + tendon * 0.82, m + tendon * 0.8];
      },
    });

    // 허파: 바닥은 가로막 윗면
    const baseSeg = (u0, u1) => dUp.filter(([x]) => (x - X(u0)) * (x - X(u1)) <= 0).sort((a, b) => (u0 < u1 ? a[0] - b[0] : b[0] - a[0]));
    const RL = [...L.spline(C(S0.RLlat), false, 8), ...baseSeg(S0.RLlat[S0.RLlat.length - 1][0], -1.75), ...L.spline(C([[-1.75, duAt(-1.75)], ...S0.RLmed]), false, 8)];
    const LL = [...L.spline(C([...S0.LLlat, [S0.ling, duAt(S0.ling)]]), false, 8), ...baseSeg(S0.ling, S0.LLlat[0][0])];
    ctx.save();
    ctx.filter = "blur(1.8px)";
    ctx.strokeStyle = "rgba(70,20,35,.4)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    L.poly(ctx, dUp.map(([x, y]) => [x, y + 1.3]), false);
    ctx.stroke();
    ctx.restore();
    const lungTex = (x, y) => 0.94 + 0.09 * nz.fbm(x * 0.1, y * 0.1, 4);
    for (const pl of [RL, LL]) L.pillow(t, L.bbox(pl), (c) => L.poly(c, pl), { color: "#E7979E", light: "#FFD9D9", dark: "#A8505F", blur: 5.4, relief: 1.05, spec: 0.22, gloss: 22, rim: 0.2, tex: lungTex, alpha: 0.97 });

    // 숨관과 숨관가지(짧게)
    const lMainEnd = [X(3.2), Y(7.9)], rMainEnd = [X(-1.25), Y(7.7)];
    const br = [
      { pts: L.spline([[X(-0.45), Y(5.1)], [X(-0.85), Y(6.4)], rMainEnd], false, 6), w: 5.8 },
      { pts: L.spline([[X(0.45), Y(5.1)], [X(1.8), Y(6.5)], lMainEnd], false, 6), w: 4.9 },
    ];
    L.tubes(t, br, { ...L.AIR_TUBE, edge: "#A87676" });
    L.trachea(t, X, Y, s);

    // 앞쪽 갈비뼈(뼈는 크림색, 앞 끝의 연골은 푸른 흰색), 복장뼈, 빗장뼈
    const front = [], cart = [];
    for (const r of ribs)
      for (const sd of [-1, 1]) {
        const pr = L.ribParts(r, sd, ribs);
        const wd = (r.k <= 2 ? 0.8 : 0.98) * s;
        front.push({ pts: C(pr.front), w: wd });
        if (pr.cart) cart.push({ pts: C(pr.cart), w: wd * 0.82 });
      }
    L.tubes(t, cart, { ...L.CART, alpha: 0.72 });
    L.tubes(t, front, { ...L.BONE, alpha: 0.86 });
    const dyS = -1.0 * f;
    const stern = L.spline(C([[0, -0.4], [2.6, 0.2], [2.4, 4.4], [1.7, 5.2], [1.8, 13.6], [1.2, 15.6], [0.5, 18.2], [-0.5, 18.2], [-1.2, 15.6], [-1.8, 13.6], [-1.7, 5.2], [-2.4, 4.4], [-2.6, 0.2]].map(([u, v]) => [u, v + dyS])), true, 6);
    L.pillow(t, L.bbox(stern), (c) => L.poly(c, stern), { color: "#F0E7D6", light: "#FFFDF8", dark: "#BBA98D", blur: 2.2, spec: 0.2, alpha: 0.42 });
    for (const sd of [-1, 1]) {
      const cl = L.spline(C([[sd * 1.9, -0.7 - 0.4 * f], [sd * 6, -1.6 - 0.4 * f], [sd * 10.5, -1.2 - 0.4 * f], [sd * 14.6, -2.6 - 0.4 * f], [sd * 16.4, -2.9 - 0.4 * f]]), false, 8);
      L.tubes(t, [{ pts: cl, w: 1.05 * s }], { ...L.BONE, alpha: 0.78 });
    }
    L.headAirway(t, cx, TOP, s);

    // 흉강의 윤곽: 이 칸은 실선, 반대쪽 숨은 흐린 점선
    const cavO = cavity(st[other]);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.setLineDash([2.2, 2.6]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.beginPath();
    L.poly(ctx, cavO);
    ctx.stroke();
    ctx.strokeStyle = "rgba(70,85,105,.75)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    L.poly(ctx, cavO);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    L.poly(ctx, cav);
    ctx.stroke();
    ctx.strokeStyle = "#2F80D0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    L.poly(ctx, cav);
    ctx.stroke();
    ctx.restore();
    return { X, Y, C, ribs, duAt, S0 };
  };

  const A = panel(85, IN, EX);
  const B = panel(255, EX, IN);

  // 가운데 칸막이
  ctx.save();
  ctx.strokeStyle = "rgba(160,172,188,.55)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(170, 44);
  ctx.lineTo(170, 270);
  ctx.stroke();
  ctx.restore();

  // ── 겹층 ──
  const sv = S.svgLayer(root, w, h);
  const MOVE = "#F08C00", AIR = "#3D9BF0";
  const curve = (a, b, c2, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
    const q = i / n;
    return [(1 - q) ** 2 * a[0] + 2 * (1 - q) * q * b[0] + q ** 2 * c2[0], (1 - q) ** 2 * a[1] + 2 * (1 - q) * q * b[1] + q ** 2 * c2[1]];
  });
  const fat = (pts, fill) => S.fatArrow(sv, pts, { fill, w0: 3.2, w1: 5.2, head: 8.5, hw: 6.8, sw: 1.1 });
  // 들숨: 갈비뼈는 위와 바깥으로, 가로막은 아래로, 공기가 코로
  for (const sd of [-1, 1]) {
    const p0 = [A.X(sd * 15.0), A.Y(13.0)], p2 = [A.X(sd * 17.4), A.Y(7.0)];
    fat(curve(p0, [A.X(sd * 17.2), A.Y(11.2)], p2), MOVE);
  }
  fat([[A.X(0), A.Y(18.9)], [A.X(0), A.Y(24.6)]], MOVE);
  fat(curve([85 - 36, TOP + 22.6 * s], [85 - 18, TOP + 21.4 * s], [85 - 4.6, TOP + 17.7 * s]), AIR);
  // 날숨: 모두 반대
  for (const sd of [-1, 1]) {
    const p0 = [B.X(sd * 16.6), B.Y(5.4)], p2 = [B.X(sd * 14.6), B.Y(11.6)];
    fat(curve(p0, [B.X(sd * 16.8), B.Y(9.4)], p2), MOVE);
  }
  fat([[B.X(0), B.Y(22.4)], [B.X(0), B.Y(16.5)]], MOVE);
  fat(curve([255 + 4.6, TOP + 17.7 * s], [255 + 18, TOP + 21.4 * s], [255 + 36, TOP + 22.6 * s]), AIR);

  // 칸 이름
  const pill = (cx, text, fill) => {
    const g = S.el(sv, "g");
    S.el(g, "rect", { x: cx - 30, y: 6, width: 60, height: 25, rx: 12.5, fill, opacity: 0.96 });
    S.el(g, "text", { x: cx, y: 23.6, "text-anchor": "middle", "font-size": 15.5, "font-weight": 800, fill: "#fff", "font-family": FONT }).textContent = text;
  };
  pill(85, "들숨", "#2F80D0");
  pill(255, "날숨", "#7C5CD6");

  // 부분 이름
  const lab = (x, y, text, pts, o = {}) => {
    if (pts) S.leader(sv, pts);
    S.label(sv, x, y, text, { size: 14, ...o });
  };
  const r3 = L.ribParts(A.ribs[2], -1, A.ribs);
  const rp = r3.front[5];
  lab(3, A.Y(1.2), "갈비뼈", [[22, A.Y(2.4)], [A.X(rp[0]), A.Y(rp[1])]]);
  lab(3, A.Y(19.4), "허파", [[18, A.Y(18.1)], [A.X(-10.6), A.Y(14.6)]]);
  lab(337, B.Y(23.6), "가로막", [[322, B.Y(22.3)], [B.X(9.4), B.Y(B.duAt(9.4) + 0.7)]], { anchor: "end" });
  for (const P0 of [A, B]) S.label(sv, P0.X(0), P0.Y(9.6), "흉강", { size: 13.5, anchor: "middle", color: "#1C6DBF", haloW: 4 });

  // ── 아래: 차례 줄(몸이 먼저 움직이고, 공기가 뒤따른다) ──
  const mctx = document.createElement("canvas").getContext("2d");
  mctx.font = `700 13.5px ${FONT}`;
  const tw = (str) => mctx.measureText(str).width;
  const chain = (cx, steps, fill, line, ink) => {
    let y = 279;
    steps.forEach((parts, i) => {
      const segs = parts.map((p) => (typeof p === "number" ? { gap: p, w: p } : p === "↑" || p === "↓" ? { a: p === "↑" ? "up" : "down", w: 9 } : { s: p, w: tw(p) }));
      const W = segs.reduce((q, g) => q + g.w, 0) + segs.filter((g) => g.gap === undefined).length * 3 - 3;
      const bw = W + 18, bh = 20;
      S.el(sv, "rect", { x: cx - bw / 2, y, width: bw, height: bh, rx: 10.5, fill, stroke: line, "stroke-width": 1 });
      let x = cx - W / 2;
      for (const g of segs) {
        if (g.gap !== undefined) {
          x += g.w;
          continue;
        }
        if (g.s !== undefined) S.el(sv, "text", { x, y: y + 14.6, "font-size": 13.5, "font-weight": 700, fill: "#26303D", "font-family": FONT, "letter-spacing": "-0.01em" }).textContent = g.s;
        else {
          const ax = x + 4.5, ay = y + 10, up = g.a === "up";
          S.el(sv, "path", { d: up ? `M${ax} ${ay - 6} L${ax + 4.4} ${ay - 0.6} L${ax + 1.6} ${ay - 0.6} L${ax + 1.6} ${ay + 5.6} L${ax - 1.6} ${ay + 5.6} L${ax - 1.6} ${ay - 0.6} L${ax - 4.4} ${ay - 0.6} Z` : `M${ax} ${ay + 6} L${ax + 4.4} ${ay + 0.6} L${ax + 1.6} ${ay + 0.6} L${ax + 1.6} ${ay - 5.6} L${ax - 1.6} ${ay - 5.6} L${ax - 1.6} ${ay + 0.6} L${ax - 4.4} ${ay + 0.6} Z`, fill: ink });
        }
        x += g.w + 3;
      }
      y += bh;
      if (i < steps.length - 1) {
        S.el(sv, "path", { d: `M${cx - 5} ${y + 1.8} L${cx + 5} ${y + 1.8} L${cx} ${y + 6.8} Z`, fill: line });
        y += 8.6;
      }
    });
  };
  chain(85, [["갈비뼈", "↑", 5, "가로막", "↓"], ["흉강 부피 커짐"], ["허파 속 압력 낮아짐"], ["공기가 들어와요"]], "#EAF4FE", "#9CCBF5", "#2F80D0");
  chain(255, [["갈비뼈", "↓", 5, "가로막", "↑"], ["흉강 부피 작아짐"], ["허파 속 압력 높아짐"], ["공기가 나가요"]], "#F2EEFD", "#C5B6F2", "#7C5CD6");
}
