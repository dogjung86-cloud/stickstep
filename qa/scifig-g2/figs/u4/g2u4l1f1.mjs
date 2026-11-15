// g2u4l1f1 섞은 것과 결합한 것: 같은 크기의 두 상자에 흰 공(수소) 16개와 빨간 공(산소) 8개가 똑같이 들어 있다.
// 왼쪽은 수소 입자(흰 공 둘) 8개와 산소 입자(빨간 공 둘) 4개를 섞기만 한 기체, 오른쪽은 물 입자(빨간 공 하나에 흰 공 둘, 104.5° 굽음) 8개인 수증기.
// 이 레슨은 '원자', '분자'를 배우기 전이라 글은 '입자'와 공의 색으로만 쓴다. 검산 메모는 g2u4l1f1.md
import { ELEM, molecule, glassBox } from "./_lib.mjs";

export const meta = {
  key: "g2u4l1f1",
  w: 340,
  h: 330,
  alt: "같은 크기의 상자 둘이 있어요. 왼쪽 상자에는 흰 공 둘이 붙은 수소 입자 8개와 빨간 공 둘이 붙은 산소 입자 4개가 따로따로 섞여 있고, 오른쪽 상자에는 빨간 공 하나에 흰 공 둘이 굽은 모양으로 붙은 물 입자 8개가 있어요. 두 상자 모두 흰 공 16개, 빨간 공 8개예요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const nz = N.makeNoise(41);
  const rnd = N.rng(1207);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const SC = 0.8; // 공 크기 배율(상대 크기는 chemKit 그대로: 수소 9, 산소 12)
  const rH = ELEM.H.r * SC, rO = ELEM.O.r * SC;
  const BW = 140, BH = 172, BY = 60, DX = 14, DY = -10;
  const boxes = [{ x: 12 }, { x: 180 }];

  // 입자 모양(공 중심의 상대 자리)
  const dHH = 1.25 * rH, dOO = 1.22 * rO;
  const dOH = 0.72 * (rO + rH), HALF = (104.5 / 2) * (Math.PI / 180); // 물: 결합 사이 각 104.5°
  const shapes = {
    H2: (a) => [{ el: "H", u: -dHH / 2 * Math.cos(a), v: -dHH / 2 * Math.sin(a) }, { el: "H", u: dHH / 2 * Math.cos(a), v: dHH / 2 * Math.sin(a) }],
    O2: (a) => [{ el: "O", u: -dOO / 2 * Math.cos(a), v: -dOO / 2 * Math.sin(a) }, { el: "O", u: dOO / 2 * Math.cos(a), v: dOO / 2 * Math.sin(a) }],
    H2O: (a) => [
      { el: "O", u: 0, v: 0 },
      { el: "H", u: dOH * Math.cos(a - HALF), v: dOH * Math.sin(a - HALF) },
      { el: "H", u: dOH * Math.cos(a + HALF), v: dOH * Math.sin(a + HALF) },
    ],
  };
  // 자리 고르기: 상자 안에서 서로 일정 거리 이상(기체: 입자 사이가 넓다), 이름표 자리는 비운다
  // 자리: 엇갈린 격자에 흔들림을 준다(기체처럼 고루 떨어져 있고, 서로 닿지 않게). 종류는 칸마다 정한다.
  const grid = (cols, rows, x0, x1, y0, y1, stagger) => {
    const out = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const off = j % 2 ? stagger : 0;
        const x = x0 + ((x1 - x0) * i) / Math.max(1, cols - 1) + off + (rnd() - 0.5) * 9;
        const y = y0 + ((y1 - y0) * j) / Math.max(1, rows - 1) + (rnd() - 0.5) * 8;
        out.push({ x, y, a: rnd() * Math.PI * 2, z: rnd(), front: rnd() < 0.5 });
      }
    return out;
  };
  const L = grid(3, 4, 22, 104, 28, 140, 14);
  // 왼쪽: 산소 넷은 흩어 놓고(이름표 곁 하나 포함), 나머지는 수소
  const oxySlots = [10, 4, 2, 7];
  L.forEach((m, i) => (m.kind = oxySlots.includes(i) ? "O2" : "H2"));
  const R = grid(2, 4, 30, 96, 30, 140, 16);
  R.forEach((m) => (m.kind = "H2O"));
  const count = (arr, k) => arr.filter((m) => m.kind === k).length;
  if (count(L, "H2") !== 8 || count(L, "O2") !== 4 || count(R, "H2O") !== 8) throw new Error("입자 개수가 맞지 않아요");

  const drawBox = (bx, mols) => {
    const gb = glassBox(t, P, bx, BY, BW, BH, DX, DY);
    gb.back();
    // 깊이: z가 클수록 뒤(오른쪽 위로 조금 밀리고 바탕색으로 조금 스민다)
    const items = mols.map((m) => {
      const ox = bx + m.x + m.z * DX * 0.8, oy = BY + m.y + m.z * DY * 0.8;
      const atoms = shapes[m.kind](m.a).map((q, i) => ({
        el: q.el,
        x: ox + q.u,
        y: oy + q.v,
        // 물 입자: 흰 공이 산소 공의 앞이나 뒤(입체로 돌아간 모습). 두 공 입자: 한쪽이 살짝 앞
        z: q.el === "O" && m.kind === "H2O" ? 0 : (m.front ? 1 : -1) * (m.kind === "H2O" ? 1 : i === 0 ? 1 : -1),
        fog: m.z * 0.22,
      }));
      return { z: m.z, atoms, cx: ox, cy: oy, kind: m.kind };
    });
    items.sort((a, b) => b.z - a.z);
    for (const it of items) molecule(t, P, it.atoms, { contact: 0.22 });
    gb.front();
    return items;
  };
  const li = drawBox(boxes[0].x, L);
  const ri = drawBox(boxes[1].x, R);

  // ── 글자 ──
  const sv = S.svgLayer(root, w, h);
  const cx0 = boxes[0].x + BW / 2, cx1 = boxes[1].x + BW / 2;
  S.label(sv, cx0, 22, "수소와 산소를 섞은 기체", { anchor: "middle", size: 14 });
  S.label(sv, cx0, 39, "(혼합물)", { anchor: "middle", size: 13.5, color: "#5B6676" });
  S.label(sv, cx1, 22, "수증기", { anchor: "middle", size: 14 });
  S.label(sv, cx1, 39, "(화합물)", { anchor: "middle", size: 13.5, color: "#5B6676" });
  // 입자 이름: 상자 안 비운 자리에서 가장 가까운 그 입자로
  const nearest = (items, kind, p) => items.filter((i) => i.kind === kind).sort((a, b) => Math.hypot(a.cx - p[0], a.cy - p[1]) - Math.hypot(b.cx - p[0], b.cy - p[1]))[0];
  {
    const p = [boxes[0].x + 8, BY + BH - 8];
    const m = nearest(li, "O2", p);
    S.leader(sv, [[p[0] + 29, p[1] - 9], [m.cx - 6, m.cy + 4]]);
    S.label(sv, p[0], p[1], "산소", { size: 14, color: "#B42318" });
  }
  {
    const p = [boxes[0].x + BW - 8, BY + 17];
    const m = nearest(li, "H2", p);
    S.leader(sv, [[p[0] - 14, p[1] + 4], [m.cx + 3, m.cy - 3]]);
    S.label(sv, p[0], p[1], "수소", { anchor: "end", size: 14, color: "#3A4655" });
  }
  {
    const p = [boxes[1].x + BW - 8, BY + BH - 8];
    const m = nearest(ri, "H2O", p);
    S.leader(sv, [[p[0] - 16, p[1] - 11], [m.cx + 4, m.cy + 2]]);
    S.label(sv, p[0], p[1], "물", { anchor: "end", size: 14, color: "#B42318" });
  }
  // 섞기만 / 결합: 알약 모양 꼬리표
  const pill = (x, y, text, fill) => {
    const g = S.el(sv, "g");
    const wpx = text.length * 13.6 + 22;
    S.el(g, "rect", { x: x - wpx / 2, y: y - 15, width: wpx, height: 23, rx: 11.5, fill, opacity: 0.95 });
    S.el(g, "text", { x, y: y + 1.5, "text-anchor": "middle", "font-size": 14, "font-weight": 800, fill: "#fff", "font-family": "'Pretendard Variable', Pretendard, sans-serif" }).textContent = text;
  };
  const yb = BY + BH + 22;
  pill(cx0, yb, "섞기만 했어요", "#64748B");
  pill(cx1, yb, "결합했어요", "#2F9E44");
  S.label(sv, cx0, yb + 26, "흰 공 16개, 빨간 공 8개", { anchor: "middle", size: 13.5, color: "#3A4655" });
  S.label(sv, cx1, yb + 26, "흰 공 16개, 빨간 공 8개", { anchor: "middle", size: 13.5, color: "#3A4655" });
  S.label(sv, cx0, yb + 47, "불을 대면 큰 소리를", { anchor: "middle", size: 13.5, color: "#C2410C" });
  S.label(sv, cx0, yb + 63, "내며 타요", { anchor: "middle", size: 13.5, color: "#C2410C" });
  S.label(sv, cx1, yb + 47, "불이 붙지 않아요", { anchor: "middle", size: 13.5, color: "#1F6FB2" });
}
