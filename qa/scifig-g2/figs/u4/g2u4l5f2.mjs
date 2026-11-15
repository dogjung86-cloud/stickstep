// g2u4l5f2 분자와 원자: 네 칸(물, 산소, 헬륨, 구리). 칸마다 익숙한 모습과 확대 원.
// 물은 굽은 물 분자가 맞닿아 제멋대로(액체), 산소는 원자 둘이 붙은 분자가 멀리 떨어짐(기체), 헬륨은 원자 하나씩 멀리 떨어짐(기체),
// 구리는 원자가 빈틈없이 쌓인 덩어리(면심 입방, 이웃 12개, 분자 경계 없음). 네 입자는 같은 배율이고 크기가 비슷하다. 검산 메모는 g2u4l5f2.md
import { ELEM, ball, contact, molecule } from "./_lib.mjs";

export const meta = {
  key: "g2u4l5f2",
  w: 340,
  h: 410,
  alt: "네 칸에 물, 산소, 헬륨, 구리를 확대한 모습이 있어요. 물은 산소 원자 1개와 수소 원자 2개가 굽은 모양으로 결합한 물 분자가 서로 맞닿아 있어요. 산소는 산소 원자 2개가 결합한 산소 분자가, 헬륨은 헬륨 원자 하나하나가 서로 멀리 떨어져 있어요. 구리는 분자 없이 구리 원자가 빈틈없이 층층이 쌓여 있어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(53);
  const rnd = N.rng(4409);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 같은 배율: chemKit 반지름 × SC ──
  const SC = 0.36;
  const rO = ELEM.O.r * SC, rH = ELEM.H.r * SC, rHe = ELEM.He.r * SC, rCu = ELEM.Cu.r * SC;
  const dOO = 1.22 * rO, dOH = 0.72 * (rO + rH), HALF = (104.5 / 2) * (Math.PI / 180);
  const R = 73; // 확대 원 반지름
  const cells = [
    { key: "water", x0: 4, y0: 4 },
    { key: "oxygen", x0: 172, y0: 4 },
    { key: "helium", x0: 4, y0: 206 },
    { key: "copper", x0: 172, y0: 206 },
  ];
  for (const c of cells) c.C = [c.x0 + 84, c.y0 + 126];

  const lens = (C, fn) => {
    P.dropShadow(t, (c) => c.arc(C[0], C[1], R, 0, Math.PI * 2), { dx: 2, dy: 5, blur: 12, a: 0.18 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(C[0], C[1], R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = P.rg(ctx, C[0] - R * 0.3, C[1] - R * 0.35, 4, C[0], C[1], R, [[0, "#FFFFFF"], [1, "#E8EDF3"]]);
    ctx.fillRect(C[0] - R, C[1] - R, 2 * R, 2 * R);
    fn();
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(C[0], C[1], R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#A9B3C1";
    ctx.beginPath();
    ctx.arc(C[0], C[1], R + 2.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  // 분자 하나를 묶는 옅은 테두리(분자인 칸만)
  const ring = [];
  const outline = (x, y, rx, ry, ang) => ring.push({ x, y, rx, ry, ang });

  // 물 분자 공 자리
  const water = (x, y, a, tilt) => [
    { el: "O", x, y, z: 0 },
    { el: "H", x: x + dOH * Math.cos(a - HALF), y: y + dOH * Math.sin(a - HALF), z: tilt },
    { el: "H", x: x + dOH * Math.cos(a + HALF), y: y + dOH * Math.sin(a + HALF), z: tilt },
  ];

  // ── 1. 물: 맞닿은 채 제멋대로(액체) ──
  const cW = cells[0];
  let pick = null;
  lens(cW.C, () => {
    const pts = [];
    const ext = dOH + rH; // 분자 바깥 반지름
    const want = [cW.C[0] + 34, cW.C[1] - 34]; // 묶어 보일 분자 자리(오른쪽 위)
    const atomsOf = (p) => water(p.x, p.y, p.a, p.tilt);
    const placed = [];
    const fits = (p) => {
      for (const a of atomsOf(p)) {
        const ra = a.el === "O" ? rO : rH;
        for (const b of placed) if (Math.hypot(a.x - b.x, a.y - b.y) < (ra + b.r) * 0.97) return false;
      }
      return true;
    };
    const add = (p) => {
      pts.push(p);
      for (const a of atomsOf(p)) placed.push({ x: a.x, y: a.y, r: a.el === "O" ? rO : rH });
    };
    add({ x: want[0], y: want[1], a: -0.6, z: 0.9, tilt: 1 });
    let guard = 0;
    while (guard++ < 60000) {
      const x = cW.C[0] - R - 8 + rnd() * (2 * R + 16), y = cW.C[1] - R - 8 + rnd() * (2 * R + 16);
      if (Math.hypot(x - cW.C[0], y - cW.C[1]) > R + 8) continue;
      if (pts.some((p) => Math.hypot(p.x - x, p.y - y) < ext * 0.9)) continue;
      const p = { x, y, a: rnd() * Math.PI * 2, z: rnd(), tilt: rnd() < 0.5 ? 1 : -1 };
      if (fits(p)) add(p);
    }
    window.__waterN = pts.length;
    pts.sort((a, b) => a.z - b.z);
    for (const p of pts) molecule(t, P, water(p.x, p.y, p.a, p.tilt), { contact: 0.24, scale: SC });
    pick = pts.find((p) => p.x === want[0]);
    outline(pick.x + 1.5, pick.y - 0.5, ext + 4.5, ext + 2.5, -0.6);
  });

  // ── 2. 산소: 원자 둘이 붙은 분자, 서로 멀리(기체) ──
  const cO = cells[1];
  // 기체: 입자 사이(중심 사이)가 입자 크기의 약 10배. 원 안에는 둘만 들어온다(산소와 헬륨이 같은 간격)
  const oxy = [
    { x: cO.C[0] + 46, y: cO.C[1] - 30, a: 0.5 },
    { x: cO.C[0] - 50, y: cO.C[1] + 34, a: -0.9 },
  ];
  lens(cO.C, () => {
    for (const m of oxy) {
      const c = Math.cos(m.a), s = Math.sin(m.a);
      molecule(t, P, [
        { el: "O", x: m.x - (dOO / 2) * c, y: m.y - (dOO / 2) * s, z: 0 },
        { el: "O", x: m.x + (dOO / 2) * c, y: m.y + (dOO / 2) * s, z: 1 },
      ], { contact: 0.24, scale: SC });
    }
  });
  outline(oxy[0].x, oxy[0].y, dOO / 2 + rO + 4, rO + 4, oxy[0].a);

  // ── 3. 헬륨: 원자 하나가 하나의 입자, 서로 멀리(기체) ──
  const cHe = cells[2];
  const he = [
    { x: cHe.C[0] + 46, y: cHe.C[1] - 32 },
    { x: cHe.C[0] - 48, y: cHe.C[1] + 36 },
  ];
  lens(cHe.C, () => {
    for (const a of he) {
      contact(t, P, a.x, a.y, rHe, 0.12);
      ball(t, P, a.x, a.y, rHe, "He");
    }
  });
  outline(he[0].x, he[0].y, rHe + 4, rHe + 4, 0);

  // ── 4. 구리: 면심 입방으로 빈틈없이 쌓인 덩어리, 가장자리는 잘린 듯 ──
  const cCu = cells[3];
  let cuPick = null;
  lens(cCu.C, () => {
    const yaw = -0.52, pitch = -0.42;
    const rot = ([x, y, z]) => {
      const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
      const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
      return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)];
    };
    const A = rCu * 2 * Math.SQRT2; // 이웃 원자끼리 맞닿음: 가장 가까운 거리 = a/√2 = 지름
    const basis = [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]];
    const N3 = [5, 4, 5];
    const atoms = [];
    for (let i = 0; i <= N3[0]; i++)
      for (let j = 0; j <= N3[1]; j++)
        for (let k = 0; k <= N3[2]; k++)
          for (const b of basis) {
            const p = [i + b[0], j + b[1], k + b[2]];
            if (p[0] > N3[0] + 1e-9 || p[1] > N3[1] + 1e-9 || p[2] > N3[2] + 1e-9) continue;
            const q = rot([(p[0] - N3[0] / 2) * A, -(p[1] - N3[1] / 2) * A, (p[2] - N3[2] / 2) * A]);
            atoms.push({ x: cCu.C[0] + q[0], y: cCu.C[1] + 8 + q[1], z: q[2], p });
          }
    atoms.sort((a, b) => a.z - b.z);
    const zMin = atoms[0].z, zMax = atoms[atoms.length - 1].z;
    P.softShadow(t, cCu.C[0] + 6, cCu.C[1] + 64, 66, 10, 0.18);
    for (const a of atoms) {
      const fog = 0.3 * (1 - (a.z - zMin) / (zMax - zMin));
      contact(t, P, a.x, a.y, rCu, 0.3);
      ball(t, P, a.x, a.y, rCu, "Cu", { fog, fogTo: [226, 232, 240] });
    }
    // 앞쪽 위 모서리 근처의 원자 하나를 짚는다
    cuPick = atoms.filter((a) => Math.abs(a.p[2] - N3[2]) < 1e-9 && Math.abs(a.p[1] - N3[1]) < 1e-9).sort((a, b) => b.x - a.x)[1];
  });

  // ── 익숙한 모습(왼쪽 위 작은 그림) ──
  const icon = {
    water(x, y) {
      // 물컵: 유리 벽, 물, 반짝임
      P.softShadow(t, x + 16, y + 40, 15, 3, 0.18);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 2);
      ctx.lineTo(x + 29, y + 2);
      ctx.lineTo(x + 26, y + 40);
      ctx.lineTo(x + 6, y + 40);
      ctx.closePath();
      ctx.fillStyle = "rgba(225,240,250,.85)";
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = P.lg(ctx, 0, y + 12, 0, y + 40, [[0, "#A7D8F5"], [1, "#5FAFE3"]]);
      ctx.fillRect(x, y + 12, 34, 30);
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.fillRect(x, y + 11.5, 34, 1.4);
      ctx.restore();
      ctx.strokeStyle = "rgba(80,120,150,.7)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 6);
      ctx.lineTo(x + 9, y + 34);
      ctx.stroke();
      ctx.restore();
    },
    oxygen(x, y) {
      // 산소만 모은 병: 투명한 병과 마개
      P.softShadow(t, x + 16, y + 40, 15, 3, 0.18);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + 11, y + 6);
      ctx.lineTo(x + 21, y + 6);
      ctx.lineTo(x + 21, y + 12);
      ctx.quadraticCurveTo(x + 30, y + 15, x + 30, y + 24);
      ctx.lineTo(x + 30, y + 37);
      ctx.quadraticCurveTo(x + 30, y + 40, x + 27, y + 40);
      ctx.lineTo(x + 5, y + 40);
      ctx.quadraticCurveTo(x + 2, y + 40, x + 2, y + 37);
      ctx.lineTo(x + 2, y + 24);
      ctx.quadraticCurveTo(x + 2, y + 15, x + 11, y + 12);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, x, 0, x + 32, 0, [[0, "rgba(236,246,252,.95)"], [0.4, "rgba(255,255,255,.9)"], [1, "rgba(200,222,238,.95)"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(80,120,150,.7)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.fillStyle = P.lg(ctx, 0, y + 1, 0, y + 7, [[0, "#B08968"], [1, "#7F5539"]]);
      ctx.beginPath();
      ctx.roundRect(x + 9.5, y + 1, 13, 6.5, 1.5);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 22);
      ctx.lineTo(x + 6, y + 35);
      ctx.stroke();
      ctx.restore();
    },
    helium(x, y) {
      // 헬륨 풍선: 옅은 하늘색 풍선과 끈
      ctx.save();
      ctx.strokeStyle = "rgba(90,100,115,.8)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x + 17, y + 30);
      ctx.bezierCurveTo(x + 13, y + 34, x + 21, y + 38, x + 16, y + 44);
      ctx.stroke();
      ctx.restore();
      P.sphere(t, x + 17, y + 16, 13, "#8FD3E8", { spec: 0.6, gloss: 26, rim: 0.25, bounce: "#E3F8FC" });
      ctx.save();
      ctx.fillStyle = "#6FBFD8";
      ctx.beginPath();
      ctx.moveTo(x + 14.5, y + 31.5);
      ctx.lineTo(x + 19.5, y + 31.5);
      ctx.lineTo(x + 17, y + 28.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    copper(x, y) {
      // 구리 전선: 감은 구리선(주황 갈색 금속 광택)
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const cx = x + 4 + i * 4.6, cy = y + 22;
        ctx.strokeStyle = P.lg(ctx, cx - 6, cy - 12, cx + 6, cy + 12, [[0, "#FFD2A8"], [0.5, "#D8844A"], [1, "#8A4B22"]]);
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 4.2, 12, 0.25, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = P.lg(ctx, x, y + 34, x + 34, y + 30, [[0, "#FFD2A8"], [1, "#B5652F"]]);
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(x + 27, y + 32);
      ctx.quadraticCurveTo(x + 34, y + 40, x + 40, y + 36);
      ctx.stroke();
      ctx.restore();
    },
  };
  // 구리 칸은 왼쪽 칸(헬륨)의 긴 부제와 닿지 않게 그림과 이름을 오른쪽으로 조금 민다
  for (const c of cells) icon[c.key](c.x0 + (c.key === "copper" ? 22 : 6), c.y0 + 4);

  // ── 겹층: 묶음 테두리, 이름 ──
  const sv = S.svgLayer(root, w, h);
  for (const r of ring)
    S.el(sv, "ellipse", { cx: r.x, cy: r.y, rx: r.rx, ry: r.ry, transform: `rotate(${(r.ang * 180) / Math.PI} ${r.x} ${r.y})`, fill: "rgba(255,255,255,.18)", stroke: "#3182F6", "stroke-width": 1.4, "stroke-dasharray": "3 2.2" });
  const title = (c, a, b2, dx = 0) => {
    S.label(sv, c.x0 + 50 + dx, c.y0 + 20, a, { size: 14 });
    if (b2) S.label(sv, c.x0 + 50 + dx, c.y0 + 37, b2, { size: 13.5, color: "#5B6676" });
  };
  title(cells[0], "물(분자)");
  title(cells[1], "산소(분자)");
  title(cells[2], "헬륨", "(원자 1개가 분자 구실)");
  title(cells[3], "구리(원자)", null, 18);
  // 칸 안 이름: 원 오른쪽 위 바깥에서 지시선
  const tagOut = (c, text, target) => {
    const lx = c.x0 + 166, ly = c.y0 + 56;
    S.leader(sv, [[lx - 14, ly + 4], [target[0], target[1]]], { color: "#3B5B8C" });
    S.label(sv, lx, ly, text, { anchor: "end", size: 13.5, color: "#1F4E8C" });
  };
  tagOut(cells[0], "물 분자", [pick.x + 9, pick.y - 9]);
  tagOut(cells[1], "산소 분자", [oxy[0].x + 9, oxy[0].y - 5]);
  tagOut(cells[2], "헬륨 원자", [he[0].x + 5, he[0].y - 5]);
  tagOut(cells[3], "구리 원자", [cuPick.x + 1, cuPick.y - 2]);
}
