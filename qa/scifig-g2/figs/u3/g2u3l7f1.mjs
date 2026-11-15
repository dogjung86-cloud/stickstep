// g2u3l7f1 물결파: 막대 끝이 일정하게 두드리는 점에서 동심원 물결이 퍼지는 수면(비스듬히 내려다봄)과,
// 그 점을 지나는 반지름 방향으로 앞쪽을 잘라 낸 단면(마루와 골, 진동 중심, 파장, 진폭). 검산 메모는 g2u3l7f1.md
// 수면 높이 z(r) = −A sin(2πr/λ) (r = 두드리는 점에서 거리). 위쪽 동심원과 단면은 같은 식, 같은 축척이다.
import { D2R } from "./_lib.mjs";

export const meta = {
  key: "g2u3l7f1",
  w: 340,
  h: 346,
  alt: "막대가 두드리는 점에서 동심원 물결이 퍼져요. 앞쪽을 잘라 낸 단면에는 높은 마루와 낮은 골이 번갈아 있고, 점선은 물결이 없을 때의 수면인 진동 중심이에요. 마루에서 이웃한 마루까지, 골에서 이웃한 골까지가 파장이고, 진동 중심에서 마루까지와 골까지가 진폭이에요. 마루 위의 낚시찌는 제자리에서 오르내리기만 해요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(17);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.01 });

  // ── 물결 수치 ──
  const LAM = 88; // 파장(px, 단면과 위쪽 모두)
  const A = 17; // 진폭(px, 세로를 키워 그림)
  const K = (2 * Math.PI) / LAM;
  const SX = 30; // 두드리는 점(앞 모서리 위)
  const RY = 206; // 진동 중심(물결이 없을 때 수면)의 화면 높이
  const FD = 0.52; // 안쪽(깊이) 방향 줄임
  const DEPTH = 250; // 보이는 수면의 안쪽 길이(세계 px)
  const FACE_B = 282; // 단면 바닥
  const X0 = 12, X1 = 298; // 물의 좌우 끝(오른쪽 여백에 진동 중심 이름)
  const z = (r) => -A * Math.sin(K * r);
  const dz = (r) => -A * K * Math.cos(K * r);
  const prof = (x) => RY - z(Math.abs(x - SX)); // 단면 윗선(화면 y)

  // ── 위쪽 수면: 화소마다 세계 좌표를 되짚어 물결의 기울기로 음영 ──
  const L = (() => {
    const v = [-0.5, 0.42, 0.76];
    const l = Math.hypot(...v);
    return v.map((c) => c / l);
  })();
  const V = [0, -0.55, 0.835];
  const H = (() => {
    const v = [L[0] + V[0], L[1] + V[1], L[2] + V[2]];
    const l = Math.hypot(...v);
    return v.map((c) => c / l);
  })();
  const base = P.lin([150, 214, 244]);
  const deep = P.lin([84, 166, 218]);
  const sky = P.lin([236, 246, 252]);
  // 높이장 그리기: 화면 열마다 앞에서 안쪽으로 걸으며, 아직 칠하지 않은 더 높은 화소만 칠한다(앞의 물결이 뒤를 가린다)
  {
    const dpr = t.dpr;
    const top = Math.floor(RY - DEPTH * FD - A - 6);
    const W = Math.round((X1 - X0) * dpr), Hh = Math.round((RY + A + 2 - top) * dpr);
    const off = document.createElement("canvas");
    off.width = W;
    off.height = Hh;
    const octx = off.getContext("2d");
    const img = octx.createImageData(W, Hh);
    const d = img.data;
    const step = 1 / (FD * dpr * 2.5);
    for (let i = 0; i < W; i++) {
      const X = X0 + (i + 0.5) / dpr;
      const dx = X - SX;
      let horizon = (prof(X) - top) * dpr; // 이 아래는 단면이 그린다
      for (let yw = 0; yw <= DEPTH; yw += step) {
        const r = Math.hypot(dx, yw) || 1e-6;
        const Ys = (RY - yw * FD - z(r) - top) * dpr;
        if (Ys >= horizon) continue;
        const g = dz(r);
        const nx = (-g * dx) / r, ny = (-g * yw) / r;
        const nl = Math.hypot(nx, ny, 1);
        const n0 = nx / nl, n1 = ny / nl, n2 = 1 / nl;
        const ndl = Math.max(0, n0 * L[0] + n1 * L[1] + n2 * L[2]);
        const ndh = Math.max(0, n0 * H[0] + n1 * H[1] + n2 * H[2]);
        const ndv = Math.max(0, n0 * V[0] + n1 * V[1] + n2 * V[2]);
        const fres = Math.pow(1 - ndv, 3);
        const spec = 0.55 * Math.pow(ndh, 44);
        const far = yw / DEPTH;
        const c = P.srgb([0, 1, 2].map((k) => {
          const body = base[k] * (0.32 + 0.82 * ndl) * (1 - 0.18 * far) + deep[k] * 0.1;
          return body * (1 - 0.45 * fres) + sky[k] * 0.45 * fres + spec;
        }));
        const sy = top + Ys / dpr; // 화면 y: 위쪽 끝으로 갈수록 판 색으로 스민다
        const fd = Math.min(1, Math.max(0, (DEPTH - yw) / 110));
        const fade = fd * fd * (3 - 2 * fd) * Math.min(1, Math.max(0, (sy - (top + 4)) / 40)) * Math.min(1, (X - X0) / 5) * Math.min(1, (X1 - X) / 5);
        const yTop = Math.max(0, Math.ceil(Ys));
        for (let j = Math.min(Hh - 1, Math.floor(horizon) - (horizon === Math.floor(horizon) ? 1 : 0)); j >= yTop; j--) {
          const k4 = (j * W + i) * 4;
          d[k4] = c[0];
          d[k4 + 1] = c[1];
          d[k4 + 2] = c[2];
          d[k4 + 3] = 255 * fade;
        }
        horizon = Math.min(horizon, yTop);
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, Math.round(X0 * dpr), Math.round(top * dpr));
    ctx.restore();
  }

  // ── 단면(앞 면): 물속 색, 깊을수록 짙게 ──
  const faceTop = [];
  for (let x = X0; x <= X1; x += 1) faceTop.push([x, prof(x)]);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(X0, FACE_B);
  faceTop.forEach((p) => ctx.lineTo(p[0], p[1]));
  ctx.lineTo(X1, FACE_B);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, 0, RY - A, 0, FACE_B, [[0, "#9ED3F2"], [0.35, "#7BBCE6"], [1, "#4D93C9"]]);
  ctx.fill();
  ctx.clip();
  P.shade(t, { x: X0, y: RY - A - 2, w: X1 - X0, h: FACE_B - RY + A + 2 }, (x, y) => {
    const n = nz.fbm(x * 0.035, y * 0.05, 3);
    const v = n > 0 ? 255 : 20;
    return [v, v, 255, Math.abs(n) * 0.08];
  });
  // 단면 바로 아래 밝은 띠(윗선을 따라)
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  faceTop.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] + 3) : ctx.moveTo(p[0], p[1] + 3)));
  ctx.stroke();
  ctx.restore();
  // 단면 윗선(물결의 옆모습)
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#2F7DB8";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  faceTop.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  ctx.restore();
  // 단면 아래 그림자와 옆 모서리
  P.softShadow(t, (X0 + X1) / 2, FACE_B + 4, 150, 6, 0.16);

  // ── 막대(두드리는 점): 나무 막대 끝이 수면에 닿는다 ──
  {
    const tip = [SX, prof(SX) + 3];
    const ang = Math.atan2(tip[1] - 70, tip[0] - (SX + 22));
    const len = Math.hypot(tip[1] - 70, tip[0] - (SX + 22));
    ctx.save();
    ctx.translate(tip[0], tip[1]);
    ctx.rotate(ang + Math.PI);
    const g = ctx.createLinearGradient(0, -4.5, 0, 4.5);
    g.addColorStop(0, "#E9C79A");
    g.addColorStop(0.35, "#C8955E");
    g.addColorStop(1, "#7E5432");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-1, -4.2, len, 8.4, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(110,70,40,.35)";
    ctx.lineWidth = 0.7;
    for (const dy of [-1.6, 1.2]) {
      ctx.beginPath();
      ctx.moveTo(4, dy);
      ctx.lineTo(len - 6, dy + 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 낚시찌: 위쪽 수면의 마루 고리(r = 1.75λ) 위 ──
  const bobR = 1.75 * LAM, bobA = 64 * D2R;
  const bob = [SX + bobR * Math.cos(bobA), RY - bobR * Math.sin(bobA) * FD - z(bobR)];
  {
    const [bx, by] = bob;
    const k = 1.25;
    P.softShadow(t, bx + 1, by + 1.5, 11, 3.5, 0.25);
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(k, k);
    ctx.fillStyle = P.lg(ctx, -5, 0, 5, 0, [[0, "#FFFFFF"], [0.6, "#E4EAF0"], [1, "#B9C4D0"]]);
    ctx.beginPath();
    ctx.ellipse(0, -2, 5, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = P.lg(ctx, -5, 0, 5, 0, [[0, "#FF8A80"], [0.45, "#E8423B"], [1, "#A3201E"]]);
    ctx.beginPath();
    ctx.ellipse(0, -2, 5, 7.5, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.beginPath();
    ctx.ellipse(-2, -6, 1.2, 2.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2B2F36";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(0, -20);
    ctx.stroke();
    ctx.fillStyle = "#FFB000";
    ctx.beginPath();
    ctx.arc(0, -20.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(0, -1.6, 7.5, 2.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── 겹층: 진동 중심, 자, 이름 ──
  const sv = S.svgLayer(root, w, h);
  const INK = "#26303D";
  const crestY = RY - A, troughY = RY + A;
  const xs = (r) => SX + r;
  // 마루: r = 0.75λ, 1.75λ, 2.75λ / 골: r = 0.25λ, 1.25λ, 2.25λ
  const C = [0.75, 1.75, 2.75].map((q) => xs(q * LAM));
  const T = [0.25, 1.25, 2.25].map((q) => xs(q * LAM));
  // 진동 중심(점선): 물 밖 오른쪽 여백까지 이어 이름을 단다
  S.el(sv, "line", { x1: X0 + 2, y1: RY, x2: 312, y2: RY, stroke: "rgba(255,255,255,.85)", "stroke-width": 3.2 });
  S.el(sv, "line", { x1: X0 + 2, y1: RY, x2: 312, y2: RY, stroke: "#1E3A55", "stroke-width": 1.3, "stroke-dasharray": "5 4" });
  S.label(sv, 336, RY - 4, "진동", { anchor: "end", size: 13.5, color: "#1E3A55" });
  S.label(sv, 336, RY + 12, "중심", { anchor: "end", size: 13.5, color: "#1E3A55" });
  // 자: 양끝 화살 선분
  const ruler = (a, b, o = {}) => {
    const col = o.color ?? INK;
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const g = S.el(sv, "g");
    const hd = (p, an) => {
      const c = Math.cos(an), sn = Math.sin(an), L2 = 6.5, W2 = 3.4;
      S.el(g, "path", { d: `M${p[0]} ${p[1]} L${p[0] - c * L2 - sn * W2} ${p[1] - sn * L2 + c * W2} L${p[0] - c * L2 + sn * W2} ${p[1] - sn * L2 - c * W2}Z`, fill: col });
    };
    S.el(g, "line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "rgba(255,255,255,.9)", "stroke-width": 3.4 });
    S.el(g, "line", { x1: a[0] + Math.cos(ang) * 5, y1: a[1] + Math.sin(ang) * 5, x2: b[0] - Math.cos(ang) * 5, y2: b[1] - Math.sin(ang) * 5, stroke: col, "stroke-width": o.w ?? 1.4 });
    hd(a, ang + Math.PI);
    hd(b, ang);
    return g;
  };
  const guide = (a, b, col = "rgba(38,48,61,.55)") => S.el(sv, "line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: col, "stroke-width": 1, "stroke-dasharray": "2.5 2.5" });

  // 마루, 골, 진폭(진동 중심에서 마루까지, 골까지: 같은 길이)
  ruler([C[0], RY], [C[0], crestY]);
  S.label(sv, C[0], crestY - 8, "마루", { anchor: "middle", size: 14 });
  S.label(sv, C[0] + 7, RY - 4, "진폭", { anchor: "start", size: 14 });
  ruler([T[0], RY], [T[0], troughY]);
  S.label(sv, T[0], troughY + 18, "골", { anchor: "middle", size: 14 });
  S.label(sv, T[0] + 7, RY + 15, "진폭", { anchor: "start", size: 14 });

  // 파장: 마루 → 이웃 마루(위), 골 → 이웃 골(아래)
  const yUp = crestY - 30;
  guide([C[1], crestY - 3], [C[1], yUp - 4]);
  guide([C[2], crestY - 3], [C[2], yUp - 4]);
  ruler([C[1], yUp], [C[2], yUp]);
  S.label(sv, (C[1] + C[2]) / 2, yUp - 6, "파장", { anchor: "middle", size: 14 });
  const yDn = troughY + 30;
  guide([T[1], troughY + 3], [T[1], yDn + 4]);
  guide([T[2], troughY + 3], [T[2], yDn + 4]);
  ruler([T[1], yDn], [T[2], yDn]);
  S.label(sv, (T[1] + T[2]) / 2, yDn + 18, "파장", { anchor: "middle", size: 14 });

  // 회색 보조 자: 마루(C[1])에서 이웃 골(T[2])까지 가로(파장의 절반)와 높이(진폭의 두 배)
  const GRAYC = "#6B7686";
  const yH = crestY - 12;
  guide([T[2], yH], [T[2], troughY - 3], "rgba(107,118,134,.0)");
  ruler([C[1], yH], [T[2], yH], { color: GRAYC });
  const xV = T[2] + 12;
  guide([C[1] + 4, crestY], [xV + 4, crestY], "rgba(107,118,134,.85)");
  guide([T[2] + 4, troughY], [xV + 4, troughY], "rgba(107,118,134,.85)");
  ruler([xV, crestY], [xV, troughY], { color: GRAYC });
  // 이름은 물 아래 판에: 지시선으로 잇는다
  const LY = FACE_B + 26;
  S.leader(sv, [[96, LY - 13], [C[1] + 10, yH]], { color: GRAYC });
  S.label(sv, 12, LY, "마루에서 골까지 가로", { size: 13.5, color: "#4F5A69" });
  S.label(sv, 12, LY + 16, "= 파장의 절반", { size: 13.5, color: "#4F5A69" });
  S.leader(sv, [[262, LY - 13], [xV, troughY - 6]], { color: GRAYC });
  S.label(sv, 334, LY, "마루에서 골까지 높이", { anchor: "end", size: 13.5, color: "#4F5A69" });
  S.label(sv, 334, LY + 16, "= 진폭의 두 배", { anchor: "end", size: 13.5, color: "#4F5A69" });

  // 낚시찌의 제자리 오르내림(세로 양쪽 화살표만)
  {
    const x = bob[0] + 15, y0 = bob[1] - 24, y1 = bob[1] + 6;
    ruler([x, y0], [x, y1], { color: "#C2410C" });
  }
  // 파동의 진행 방향: 위쪽 수면에서 바깥쪽으로
  {
    const a = 36 * D2R;
    const pts = [];
    for (let r = 2.05 * LAM; r <= 2.85 * LAM; r += 4) pts.push([SX + r * Math.cos(a), RY - r * Math.sin(a) * FD - 22]);
    S.fatArrow(sv, pts, { w0: 3, w1: 6, head: 11, hw: 8, fill: "#3182F6" });
    S.label(sv, 334, pts[pts.length - 1][1] - 14, "파동의 진행 방향", { anchor: "end", size: 13.5 });
  }
  window.__wave = { LAM, A, SX, RY, bob, C, T };
}
