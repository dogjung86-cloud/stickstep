// g2u2l9f1 판의 구조: 육지에서 바다로 이어지는 땅의 입체 블록(세로만 실제 비율 1.45 px/km). 지각 + 맨틀의 윗부분 = 판,
// 판의 아랫면(점선)은 바다 쪽 약 100 km, 대륙 쪽 약 140 km. 지각과 맨틀의 경계(실선)와 판의 아랫면(점선)은 다른 선. 검산 메모는 g2u2l9f1.md
import { COL, rockAt, out, depthAxis, brace, linOf } from "./_lib.mjs";

export const meta = {
  key: "g2u2l9f1",
  w: 340,
  h: 336,
  alt: "육지에서 바다로 이어지는 땅을 자른 입체 단면. 위에서부터 지각과 맨틀의 윗부분까지가 단단한 판이고, 판의 아랫면은 바다 쪽이 깊이 약 100 km, 대륙 쪽은 그보다 깊어요. 판 아래에도 고체인 맨틀이 이어져요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(47);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  const X0 = 52, X1 = 264, Y0 = 62, K = 1.45, ZB = 168; // 해수면 y, km당 px, 바닥 깊이
  const D = [-10, -24]; // 윗면이 왼쪽 위로 물러난다
  const XC = 164, XS = 174, XB = 192; // 해안선, 대륙붕 끝, 비탈 아래
  const gs = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
  const sm = (a, b, x) => P.smooth(a, b, x);
  const YB = Y0 + ZB * K;
  /** 산맥의 높이(km): 앞면(v = 0)과 윗면 지도가 같은 함수를 쓴다. v는 0(앞) ~ 1(뒤) */
  const ridgeX = (v) => 92 + 5 * nz.n2(v * 1.4, 2.2);
  const coastX = (v) => XC + 3.5 * nz.n2(v * 1.3, 7.1);
  function H(u, v) {
    const rx = ridgeX(v);
    const amp = 0.8 + 0.25 * nz.n2(v * 3.1, 4.4);
    const mtn = 3.4 * amp * gs(u, rx, 15) + 1.2 * gs(u, rx - 22, 9) * (0.6 + 0.4 * nz.n2(v * 4, 9));
    const plain = 0.35 * (1 - sm(XC - 40, coastX(v), u));
    const rough = 0.12 * nz.fbm(u * 0.09, v * 3.5, 2) * Math.min(1, mtn + 0.2) + 1.1 * (nz.ridge(u * 0.16 + 3, v * 2.6 + 1, 3) - 0.35) * gs(u, rx, 17);
    const cx = coastX(v);
    if (u <= cx) return Math.max(0.02, plain + mtn + rough);
    if (u <= cx + (XS - XC)) return -0.15 * sm(cx, cx + (XS - XC), u);
    if (u <= cx + (XB - XC)) return -(0.15 + 3.85 * sm(cx + (XS - XC), cx + (XB - XC), u));
    return -(4 + 0.06 * nz.fbm(u * 0.05, v * 3, 2));
  }
  const elev = (x) => H(x, 0);
  /** 지각과 맨틀의 경계(km): g2u2l1f1과 같은 값(대륙 35, 산맥 뿌리 최대 55, 바다 4 + 5) */
  const moho = (x) => (x >= XB ? -elev(x) + 5 : 35 + 20 * gs(x, ridgeX(0), 22) - 26 * sm(XC - 4, XB, x));
  /** 판의 아랫면(km): 대륙 쪽 140, 바다 쪽 100 */
  const base = (x) => 140 - 40 * sm(142, 206, x);
  const topY = (x) => Y0 - Math.max(0, elev(x)) * K;
  const crustY = (x) => Y0 - elev(x) * K;
  const mohoY = (x) => Y0 + moho(x) * K;
  const baseY = (x) => Y0 + base(x) * K;

  // ── 왼쪽 옆면 ──
  {
    const quad = (y0, y1, c0, c1) => {
      ctx.beginPath();
      ctx.moveTo(X0, y0);
      ctx.lineTo(X0 + D[0], y0 + D[1]);
      ctx.lineTo(X0 + D[0], y1 + D[1]);
      ctx.lineTo(X0, y1);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, X0 + D[0], 0, X0, 0, [[0, c0], [1, c1]]);
      ctx.fill();
    };
    quad(crustY(X0), mohoY(X0), "#A5815B", "#957250");
    quad(mohoY(X0), baseY(X0), "#D9693A", "#C65E33");
    quad(baseY(X0), YB, "#E48A55", "#D27C4A");
  }

  // ── 윗면: 위에서 본 땅과 바다(산맥은 음영으로, 높이는 앞면과 같은 함수) ──
  {
    const Lu = -0.62, Lv = 0.48, Lz = 0.62;
    const green = linOf("#9CC46A"), hill = linOf("#93A067"), rock = linOf("#A48D72"), peak = linOf("#D6D0C8");
    const sea0 = linOf("#A6DBF6"), sea1 = linOf("#63AEE5");
    P.shade(t, { x: X0 + D[0], y: Y0 + D[1] - 6, w: X1 - X0 - D[0], h: -D[1] + 8 }, (x, y) => {
      const v = (y - Y0) / D[1];
      if (v < -0.02 || v > 1.0) return null;
      const u = x - D[0] * v;
      if (u < X0 - 0.5 || u > X1 + 0.5) return null;
      const vv = P.clamp(v);
      // 앞쪽 가장자리는 단면 윗선을 따른다(땅이 해수면 위로 조금 솟은 만큼)
      const e = H(u, vv);
      const lift = Math.max(0, e) * K * (1 - vv);
      if (v < 0 && y > Y0 - lift) return null;
      const a = P.smooth(1.0, 0.985, v) * P.smooth(X0 - 0.5, X0 + 0.5, u) * P.smooth(X1 + 0.5, X1 - 0.5, u);
      let c;
      if (e < 0) {
        const d = P.clamp(-e / 4);
        c = P.mixc(sea0, sea1, Math.sqrt(d));
        c = P.mixc(c, [1, 1, 1], 0.1 * vv + 0.05 * nz.n2(u * 0.2, vv * 20));
      } else {
        const du = 0.6, dv = 0.012;
        const gu = (H(u + du, vv) - H(u - du, vv)) / (2 * du), gv = (H(u, vv + dv) - H(u, vv - dv)) / (2 * dv) / 160;
        const ex = 7; // 지도 음영의 기복 과장(윗면만)
        const nx = -gu * ex, nv = -gv * ex, nn = Math.hypot(nx, nv, 1);
        const ndl = (nx * Lu + nv * Lv + Lz) / nn;
        const base0 = e < 0.8 ? green : e < 1.7 ? P.mixc(green, hill, (e - 0.8) / 0.9) : e < 2.7 ? P.mixc(hill, rock, (e - 1.7)) : P.mixc(rock, peak, Math.min(1, e - 2.7) * 0.8);
        const f = P.clamp(0.6 + 0.62 * ndl, 0.55, 1.25) * (1 + 0.04 * nz.n2(u * 0.5, vv * 12));
        c = [base0[0] * f, base0[1] * f, base0[2] * f];
        // 바닷가 모래빛
        const cx = coastX(vv);
        if (u > cx - 2.2) c = P.mixc(c, linOf("#E9DDB8"), P.smooth(cx - 2.2, cx - 0.4, u) * 0.8);
      }
      return out(c, a);
    });
  }

  // ── 앞면(자른 면) ──
  {
    const cont = { base: COL.ccrust, vari: 0.1, freq: 0.05, band: [0.015, 0.1, 0.07], grain: 1.4, grainAmp: 0.09, edge: 0.07, specks: [["#EFE5D3", 0.08, 0.55], ["#4C3A2C", 0.06, 0.55]], speck: 1.6, seed: 2 };
    const oce = { base: COL.ocrust, vari: 0.08, freq: 0.06, grain: 1.2, grainAmp: 0.08, edge: 0.06, specks: [["#8F8279", 0.1, 0.6], ["#2C2521", 0.08, 0.6]], speck: 1.4, seed: 6 };
    const lit = { base: COL.mantle, vari: 0.08, freq: 0.035, grain: 1.9, grainAmp: 0.06, edge: 0.06, specks: [["#B5512A", 0.1, 0.55], ["#F5A06E", 0.06, 0.5]], speck: 2.4, seed: 3 };
    const ast = { base: "#EF9A63", vari: 0.07, freq: 0.03, grain: 2.2, grainAmp: 0.05, edge: 0.045, specks: [["#C7683A", 0.09, 0.5], ["#F9C39A", 0.06, 0.45]], speck: 2.6, seed: 9 };
    const w0 = linOf(COL.sea0), w1 = linOf(COL.sea1);
    P.shade(t, { x: X0, y: Y0 - 8, w: X1 - X0, h: YB - Y0 + 8 }, (x, y) => {
      const ty = topY(x);
      if (y < ty - 0.6) return null;
      const a = P.smooth(ty - 0.5, ty + 0.5, y);
      const cy = crustY(x), my = mohoY(x), by = baseY(x);
      const e = elev(x);
      const wB = P.smooth(by - 0.45, by + 0.45, y);
      const wMan = P.smooth(my - 0.45, my + 0.45, y);
      const wWat = e < 0 ? 1 - P.smooth(cy - 0.45, cy + 0.45, y) : 0;
      let c;
      if (wB > 0) c = rockAt(nz, x, y, ast);
      if (wB < 1) {
        let m;
        if (wMan > 0) m = rockAt(nz, x, y, lit);
        if (wMan < 1) {
          const wO = P.smooth(XB - 0.45, XB + 0.45, x);
          let cr;
          if (wO < 1) cr = rockAt(nz, x, y, cont);
          if (wO > 0) {
            const co = rockAt(nz, x, y, oce);
            cr = cr ? P.mixc(cr, co, wO) : co;
          }
          m = m ? P.mixc(cr, m, wMan) : cr;
        }
        c = c ? P.mixc(m, c, wB) : m;
      }
      if (wWat > 0) {
        const d = P.clamp((y - Y0) / (4 * K));
        c = P.mixc(c, P.mixc(w0, w1, d * 0.9), wWat);
      }
      const lt = 1.05 - 0.07 * ((x - X0) / (X1 - X0)) - 0.06 * ((y - Y0) / (YB - Y0));
      return out([c[0] * lt, c[1] * lt, c[2] * lt], a);
    });
    const curve = (fy, x0 = X0, x1 = X1) => {
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 0.5) (x === x0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, fy(x));
    };
    // 지각과 맨틀의 경계(실선)
    ctx.save();
    curve(mohoY);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255,240,225,.5)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = "#5B3A24";
    ctx.lineWidth = 1.05;
    ctx.stroke();
    // 판의 아랫면(굵은 점선)
    curve(baseY);
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 3.6;
    ctx.stroke();
    ctx.strokeStyle = "#4A2412";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // 테두리
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X0, YB);
    ctx.lineTo(X0, crustY(X0));
    for (let x = X0; x <= X1; x += 0.5) ctx.lineTo(x, topY(x));
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(X1, Y0);
    ctx.lineTo(X1, YB);
    ctx.lineTo(X0, YB);
    ctx.strokeStyle = "rgba(60,50,45,.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // 윗면 둘레의 옅은 선
    ctx.beginPath();
    ctx.moveTo(X0, topY(X0));
    ctx.lineTo(X0 + D[0], Y0 + D[1]);
    ctx.lineTo(X1 + D[0], Y0 + D[1]);
    ctx.lineTo(X1, Y0);
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  P.softShadow(t, (X0 + X1) / 2, YB + 5, (X1 - X0) * 0.54, 6, 0.14);

  // ── 겹층 ──
  const s = S.svgLayer(root, w, h);
  // 판 묶음: 대륙 쪽(왼쪽, 지표 ~ 140 km), 바다 쪽(오른쪽, 바다 밑바닥 ~ 100 km)
  const [lx, ly] = brace(s, 34, topY(X0) + 1, baseY(X0), -1, { w: 7 });
  S.label(s, lx - 3, ly + 5, "판", { size: 14, anchor: "end" });
  const [rx, ry] = brace(s, X1 + 6, crustY(X1), baseY(X1), 1, { w: 7 });
  S.label(s, rx + 3, ry + 5, "판", { size: 14, anchor: "start" });
  S.label(s, 112, 98, "대륙 지각", { size: 14, anchor: "middle" });
  S.leader(s, [[232, 30], [232, crustY(232) + 3.5]]);
  S.label(s, 232, 25, "해양 지각", { size: 14, anchor: "middle" });
  S.label(s, 220, 146, "맨틀의 윗부분", { size: 14, anchor: "middle" });
  S.label(s, 208, 277, "판 아래의 맨틀", { size: 14, anchor: "middle" });
  S.label(s, 208, 294, "(천천히 움직임)", { size: 13.5, anchor: "middle", weight: 600, color: "#4E5968" });
  depthAxis(s, 302, Y0, K, [0, 50, 100, 150], { minor: [10, 20, 30, 40, 60, 70, 80, 90, 110, 120, 130, 140] });
  S.label(s, 338, 48, "깊이(km)", { size: 13.5, anchor: "end", weight: 700, color: "#4E5968" });
  S.label(s, 158, 330, "세로만 실제 비율(가로는 줄임)", { size: 13.5, anchor: "middle", weight: 600, color: "#6B7684" });
}
