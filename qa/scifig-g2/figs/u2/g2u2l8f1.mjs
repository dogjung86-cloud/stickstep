// g2u2l8f1 대서양을 닫으면 이어지는 산맥: 같은 투영(람베르트 등적 방위, 북쪽이 위), 같은 축척의 지도 두 장.
// 해안선은 Natural Earth 110m(_data.mjs), 대륙을 모으는 회전은 Bullard 외(1965) 표 2. 북아메리카는 그대로 두고 그린란드, 유럽, 아프리카를 옮긴다.
// 아이슬란드는 대서양이 열린 뒤에 생긴 섬이라 모은 지도에서 뺀다. 검산 메모는 g2u2l8f1.md
import { NA, GR, EU, AF, IS, ROT, BELT } from "./_data.mjs";

export const meta = {
  key: "g2u2l8f1",
  w: 340,
  h: 404,
  alt: "위 지도는 지금의 모습으로, 북아메리카 동쪽의 산맥과 그린란드 동쪽, 영국 북부, 노르웨이의 산맥이 대서양을 사이에 두고 떨어져 있어요. 아래 지도처럼 대서양을 닫아 대륙을 모으면 이 산맥들이 한 줄로 이어져요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(3);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.01 });

  // ── 구면 회전(오른손 방향) ──
  const rad = Math.PI / 180;
  const vec = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
  const toLL = (v) => [Math.atan2(v[2], Math.hypot(v[0], v[1])) / rad, Math.atan2(v[1], v[0]) / rad];
  function rotM(lat, lon, ang) {
    const [x, y, z] = vec(lat, lon), a = ang * rad, c = Math.cos(a), s = Math.sin(a), q = 1 - c;
    return [[q * x * x + c, q * x * y - s * z, q * x * z + s * y], [q * x * y + s * z, q * y * y + c, q * y * z - s * x], [q * x * z - s * y, q * y * z + s * x, q * z * z + c]];
  }
  const app = (M, v) => [0, 1, 2].map((i) => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]);
  // 불러드 표기(시계 방향 +)를 오른손 각으로: −각. 표의 차례대로 돌린다
  const plateRot = (key) => {
    const ms = (ROT[key] ?? []).map(([la, lo, an]) => rotM(la, lo, -an));
    return ([lon, lat]) => {
      let v = vec(lat, lon);
      for (const M of ms) v = app(M, v);
      const [la2, lo2] = toLL(v);
      return [lo2, la2];
    };
  };
  const same = (p) => p;
  const rots = { na: same, gr: plateRot("gr"), eu: plateRot("eu"), af: plateRot("af"), is: same };

  // ── 투영: 람베르트 등적 방위(가운데 북위 52°, 서경 36°), 북쪽이 위 ──
  const LAT0 = 52 * rad, LON0 = -36 * rad;
  const proj = ([lon, lat]) => {
    const la = lat * rad, dl = lon * rad - LON0;
    const k = Math.sqrt(2 / (1 + Math.sin(LAT0) * Math.sin(la) + Math.cos(LAT0) * Math.cos(la) * Math.cos(dl)));
    return [k * Math.cos(la) * Math.sin(dl), -k * (Math.cos(LAT0) * Math.sin(la) - Math.sin(LAT0) * Math.cos(la) * Math.cos(dl))];
  };
  const MW = 320, MH = 172;
  const MAPS = [{ x: 10, y: 26 }, { x: 10, y: 224 }];
  // 축척: 지금 지도의 꼭 보일 자리(앨라배마, 플로리다, 뉴펀들랜드, 그린란드 북동, 노르웨이 북쪽, 지브롤터, 서사하라 바닷가)가 들어오게
  const keyPts = [[-88, 30.5], [-80.5, 25.5], [-55, 52], [-17, 81.6], [27, 71], [22, 60], [-6, 36], [-15, 27.5]].map(proj);
  const bx0 = Math.min(...keyPts.map((p) => p[0])), bx1 = Math.max(...keyPts.map((p) => p[0]));
  const by0 = Math.min(...keyPts.map((p) => p[1])), by1 = Math.max(...keyPts.map((p) => p[1]));
  const SC = Math.min((MW - 24) / (bx1 - bx0), (MH - 16) / (by1 - by0));
  const OX = (MW - (bx1 - bx0) * SC) / 2 - bx0 * SC, OY = (MH - (by1 - by0) * SC) / 2 - by0 * SC;
  const toPx = (m, ll2) => {
    const [x, y] = proj(ll2);
    return [MAPS[m].x + OX + x * SC, MAPS[m].y + OY + y * SC];
  };

  const LAND = { na: NA, gr: GR, eu: EU, af: AF, is: IS };
  // 지도 한 장은 따로 만든 캔버스(소프트웨어 그리기)에 그려 붙인다. 큰 오목 다각형을 잘라 그리기(clip) 안에서 채우면
  // 헤드리스 크롬의 GPU 캔버스가 통째로 지워지는 일이 있어서다(2026-11 확인).
  const dpr = t.dpr;
  const mapCanvas = (m) => {
    const c = document.createElement("canvas");
    c.width = Math.round(MW * dpr);
    c.height = Math.round(MH * dpr);
    const g = c.getContext("2d", { willReadFrequently: true });
    g.setTransform(dpr, 0, 0, dpr, -MAPS[m].x * dpr, -MAPS[m].y * dpr);
    return { c, g };
  };
  const ringPath = (g, m, ring, f) => {
    ring.forEach((p, i) => {
      const [x, y] = toPx(m, f(p));
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.closePath();
  };
  const mapsG = [];
  const drawMap = (m, closed) => {
    const { x, y } = MAPS[m];
    const { c, g } = mapCanvas(m);
    mapsG[m] = { c, g };
    // 바다
    g.fillStyle = P.lg(g, x, y, x + MW * 0.3, y + MH, [[0, "#D6ECF8"], [1, "#A9D3EE"]]);
    g.fillRect(x, y, MW, MH);
    // 경위선(10°)
    g.strokeStyle = "rgba(255,255,255,.55)";
    g.lineWidth = 0.7;
    for (let lon = -120; lon <= 60; lon += 10) {
      g.beginPath();
      for (let lat = 0; lat <= 88; lat += 2) {
        const [px, py] = toPx(m, [lon, lat]);
        lat ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    }
    for (let lat = 10; lat <= 80; lat += 10) {
      g.beginPath();
      for (let lon = -130; lon <= 70; lon += 2) {
        const [px, py] = toPx(m, [lon, lat]);
        lon > -130 ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    }
    // 땅: 그림자 → 면 → 해안선(아이슬란드는 대서양이 열린 뒤에 생겨 모은 지도에서 뺀다)
    const keys = closed ? ["af", "na", "gr", "eu"] : ["af", "na", "gr", "eu", "is"];
    for (const k of keys) {
      const f = closed ? rots[k] : same;
      g.save();
      g.shadowColor = "rgba(40,60,90,.28)";
      g.shadowBlur = 3 * dpr;
      g.shadowOffsetX = 0.6 * dpr;
      g.shadowOffsetY = 1.2 * dpr;
      g.beginPath();
      for (const r of LAND[k]) ringPath(g, m, r, f);
      g.fillStyle = P.lg(g, x, y, x + MW, y + MH, [[0, "#F3EBD9"], [1, "#E4D6B8"]]);
      g.fill();
      g.restore();
      g.beginPath();
      for (const r of LAND[k]) ringPath(g, m, r, f);
      g.strokeStyle = "rgba(120,100,70,.75)";
      g.lineWidth = 0.7;
      g.lineJoin = "round";
      g.stroke();
    }
  };
  const finishMap = (m) => {
    const { x, y } = MAPS[m];
    const { c, g } = mapsG[m];
    // 둥근 모서리
    g.globalCompositeOperation = "destination-in";
    g.beginPath();
    P.rrect(g, x, y, MW, MH, 10);
    g.fill();
    g.globalCompositeOperation = "source-over";
    P.dropShadow(t, (cc) => P.rrect(cc, x, y, MW, MH, 10), { dx: 2, dy: 4, blur: 10, a: 0.18 });
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(c, Math.round(x * dpr), Math.round(y * dpr));
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y, MW, MH, 10);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#A9B3C1";
    ctx.beginPath();
    P.rrect(ctx, x - 2, y - 2, MW + 4, MH + 4, 11.5);
    ctx.stroke();
    ctx.restore();
  };
  drawMap(0, false);
  drawMap(1, true);

  // ── 산맥의 띠 ──
  const smoothLine = (pts) => {
    // 캣멀롬으로 촘촘히
    const outp = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 8; k++) {
        const u = k / 8, u2 = u * u, u3 = u2 * u;
        outp.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
      }
    }
    outp.push(pts[pts.length - 1]);
    return outp;
  };
  const band = (m, lines, wide) => {
    const g = mapsG[m].g;
    g.save();
    if (wide) {
      // 맞붙은 두 가닥(그린란드 동쪽과 노르웨이) 사이도 같은 산맥: 넓은 띠 하나로 채운다
      const [l1, l2] = wide.map(smoothLine);
      g.beginPath();
      l1.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      for (let i = l2.length - 1; i >= 0; i--) g.lineTo(l2[i][0], l2[i][1]);
      g.closePath();
      g.fillStyle = "#B98450";
      g.fill();
      // 띠 안의 봉우리 무늬
      g.fillStyle = "rgba(255,240,220,.85)";
      const n = Math.min(l1.length, l2.length);
      for (let i = 6; i < n; i += 9)
        for (const f of [0.33, 0.66]) {
          const px = l1[i][0] + (l2[i][0] - l1[i][0]) * f, py = l1[i][1] + (l2[i][1] - l1[i][1]) * f;
          g.beginPath();
          g.moveTo(px - 1.6, py + 1);
          g.lineTo(px, py - 1.4);
          g.lineTo(px + 1.6, py + 1);
          g.closePath();
          g.fill();
        }
    }
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const [wdt, col] of [[7.4, "rgba(255,255,255,.75)"], [5.6, "#8A5A2E"], [2.4, "#C08A55"]]) {
      g.strokeStyle = col;
      g.lineWidth = wdt;
      for (const ln of lines) {
        const sm = smoothLine(ln);
        g.beginPath();
        sm.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
        g.stroke();
      }
    }
    // 봉우리 무늬(작은 산 표시)
    g.fillStyle = "rgba(255,240,220,.9)";
    for (const ln of lines) {
      const sm = smoothLine(ln);
      for (let i = 4; i < sm.length; i += 7) {
        const [px, py] = sm[i];
        g.beginPath();
        g.moveTo(px - 1.6, py + 1);
        g.lineTo(px, py - 1.4);
        g.lineTo(px + 1.6, py + 1);
        g.closePath();
        g.fill();
      }
    }
    g.restore();
  };
  const px0 = (k, plate) => BELT[k].map((p) => toPx(0, p));
  void plateRot;
  band(0, [px0("app"), px0("brit"), px0("nor"), px0("gre")]);
  // 모은 지도: 각 조각을 제 판과 함께 옮기고, 이어지는 차례대로 한 줄로 잇는다
  const moved = (k, plate) => BELT[k].map((p) => toPx(1, rots[plate](p)));
  const A1 = moved("app", "na"), B1 = moved("brit", "eu"), C1 = moved("nor", "eu"), D1 = moved("gre", "gr");
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const trunk = [...A1, ...B1];
  const fork = mid(C1[0], D1[0]);
  band(1, [trunk.concat([fork]), [fork, ...C1], [fork, ...D1]], [[fork, ...C1], [fork, ...D1]]);
  finishMap(0);
  finishMap(1);

  // ── 겹층 ──
  const s = S.svgLayer(root, w, h);
  const pill = (x, y, text) => {
    const ww = text.length * 13.6 + 18;
    S.el(s, "rect", { x, y, width: ww, height: 21, rx: 10.5, fill: "#26303D", opacity: 0.9 });
    S.label(s, x + ww / 2, y + 15.4, text, { size: 13.5, anchor: "middle", halo: false, color: "#fff" });
  };
  pill(MAPS[0].x + 8, MAPS[0].y + 8, "지금");
  // 두 지도 사이: 대륙을 모으면
  S.fatArrow(s, [[170, MAPS[0].y + MH + 2], [170, MAPS[1].y - 2]], { fill: "#3182F6", w0: 6, w1: 8, head: 10, hw: 10 });
  S.label(s, 184, MAPS[0].y + MH + 17, "대륙을 모으면", { size: 14 });
  // 이름(지금 지도)
  const L0 = (ll2) => toPx(0, ll2);
  const nm = (p, text, o = {}) => S.label(s, p[0], p[1], text, { size: 14, anchor: "middle", ...o });
  nm(L0([-96, 47]), "북아메리카");
  nm(L0([-54, 68.5]), "그린란드");
  nm(L0([16, 52]), "유럽");
  nm(L0([-3, 28]), "아프리카");
  nm(L0([-38, 42]), "대서양", { color: "#1D5C8F" });
  // 산맥 지시선(애팔래치아)
  const ap = L0([-79.4, 38.5]);
  S.leader(s, [[ap[0] - 22, ap[1] + 34], ap]);
  S.label(s, ap[0] - 26, ap[1] + 39, "산맥", { size: 14, anchor: "end" });
  // 이름(모은 지도)
  const L1 = (ll2, plate) => toPx(1, rots[plate](ll2));
  nm(L1([-96, 47], "na"), "북아메리카");
  nm(L1([-57, 69], "gr"), "그린란드");
  nm(L1([16, 52], "eu"), "유럽");
  nm(L1([-3, 28], "af"), "아프리카");
}
