// g2u3l1f1 빛의 반사: 수평 평면거울에 거울 면과 20°로 들어온 레이저 빛(입사각 70°)이 점 O에서 반사각 70°로 나간다.
// 오른쪽 위 작은 칸: 법선을 따라 수직으로 들어간 빛은 왔던 길로 되돌아간다(입사각 0°, 반사각 0°). 검산 메모는 g2u3l1f1.md
import { D2R, AMBER, CYAN, AMBER_INK, CYAN_INK, GRAY_INK, beam, hotspot, headOn, vHead, arcWedge, dashLine, rightMark, laser, insetBox, mirror } from "./_lib.mjs";

export const meta = {
  key: "g2u3l1f1",
  w: 340,
  h: 270,
  alt: "수평으로 놓인 거울에 레이저 빛이 거울 면과 20°를 이루며 들어와 거울의 한 점에서 반사해요. 그 점에 세운 법선과 입사 광선이 이루는 입사각은 70°, 법선과 반사 광선이 이루는 반사각도 70°예요. 오른쪽 위 작은 칸에서는 법선을 따라 수직으로 들어간 빛이 왔던 길로 되돌아가요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const nz = N.makeNoise(31);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  // ── 기하(계산) ──
  const MY = 226; // 거울 반사면
  const O = [170, MY];
  const GRAZE = 20; // 빛과 거울 면이 이루는 각
  const INC = 90 - GRAZE; // 입사각 70°(법선에서 잰 각)
  const L1 = 132, L2 = 152;
  const dIn = [Math.cos(GRAZE * D2R), Math.sin(GRAZE * D2R)]; // 오른쪽 아래로 진행
  const src = [O[0] - L1 * dIn[0], O[1] - L1 * dIn[1]]; // 레이저 앞끝
  const end = [O[0] + L2 * Math.cos(GRAZE * D2R), O[1] - L2 * Math.sin(GRAZE * D2R)]; // 반사: 법선 반대쪽, 같은 각
  const NTOP = 58; // 법선 위끝

  // ── 거울(두께 없는 반사면 + 뒷면 빗금) ──
  mirror(t, P, 12, 328, MY, { back: 12 });

  // ── 빛 ──
  beam(t, [src, O], { w: 2.5 });
  beam(t, [O, end], { w: 2.5 });
  hotspot(t, O[0], O[1] - 0.5, 9);
  laser(t, src[0], src[1], Math.atan2(dIn[1], dIn[0]), { len: 40, wid: 12 });

  // ── 오른쪽 위 작은 칸: 수직으로 들어간 빛 ──
  const B = { x: 178, y: 8, w: 154, h: 106 };
  const bx = B.x + B.w / 2 + 3; // 칸 안의 법선 자리
  const bMirror = B.y + 84;
  const bLaser = B.y + 30;
  insetBox(t, P, B.x, B.y, B.w, B.h, 12, () => {
    mirror(t, P, B.x + 14, B.x + B.w - 14, bMirror, { back: 8 });
    beam(t, [[bx, bLaser], [bx, bMirror]], { w: 2.4 });
    hotspot(t, bx, bMirror - 0.5, 8);
    laser(t, bx, bLaser, Math.PI / 2, { len: 24, wid: 11 });
  });

  // ── 겹층: 선, 호, 화살촉, 글자 ──
  const sv = S.svgLayer(root, w, h);
  // 법선(점선) + 직각 표시
  dashLine(S, sv, [O[0], O[1] - 1.5], [O[0], NTOP]);
  rightMark(S, sv, [O[0], O[1] - 1.6], [1, 0], [0, -1], 8);
  // 각: 입사각(앰버, 법선 ↔ 입사 광선), 반사각(시안, 법선 ↔ 반사 광선), 거울 면과 이룬 각(회색)
  arcWedge(S, sv, O, 40, -90 - INC, -90, AMBER);
  arcWedge(S, sv, O, 40, -90, -90 + INC, CYAN);
  arcWedge(S, sv, O, 80, 180, 180 + GRAZE, "138,150,166", { fillA: 0.16, w: 1.5 });
  // 화살촉(빛이 가는 쪽)
  headOn(S, sv, src, O, 0.5, 11);
  headOn(S, sv, O, end, 0.52, 11);
  // 작은 칸: 내려가는 빛과 되돌아오는 빛(같은 길)
  dashLine(S, sv, [bx, bMirror - 1.6], [bx, bLaser + 2], { halo: false, color: "rgba(70,84,104,.55)", w: 1.1, dash: "3 3" });
  rightMark(S, sv, [bx, bMirror - 1.6], [1, 0], [0, -1], 7);
  // 빛줄기 곁의 작은 방향 화살표: 왼쪽은 내려가는 빛, 오른쪽은 되돌아 올라가는 빛(빛줄기는 하나로 겹친다)
  const side = (x, y0, y1) => {
    S.el(sv, "line", { x1: x, y1: y0, x2: x, y2: y1 - Math.sign(y1 - y0) * 5, stroke: "#14A658", "stroke-width": 1.8, "stroke-linecap": "round" });
    vHead(S, sv, x, y1, y1 > y0 ? Math.PI / 2 : -Math.PI / 2, 9);
  };
  side(bx - 9, B.y + 42, B.y + 64);
  side(bx + 9, B.y + 72, B.y + 50);

  // 글자
  S.label(sv, O[0], NTOP - 7, "법선", { anchor: "middle" });
  const pA = [O[0] + 64 * Math.cos(-125 * D2R), O[1] + 64 * Math.sin(-125 * D2R)];
  const pC = [O[0] + 64 * Math.cos(-55 * D2R), O[1] + 64 * Math.sin(-55 * D2R)];
  S.label(sv, pA[0] - 6, pA[1] + 5, `입사각 ${INC}°`, { anchor: "middle", size: 14, color: AMBER_INK });
  S.label(sv, pC[0] + 6, pC[1] + 5, `반사각 ${INC}°`, { anchor: "middle", size: 14, color: CYAN_INK });
  S.label(sv, 14, 218, "입사 광선", { size: 14 });
  S.label(sv, 330, 160, "반사 광선", { anchor: "end", size: 14 });
  S.label(sv, 14, 257, "거울", { size: 14 });
  // 거울 면과 이룬 각 20°: 위 왼쪽 글 → 회색 호
  const g20 = [O[0] + 80 * Math.cos(194 * D2R), O[1] + 80 * Math.sin(194 * D2R)];
  S.leader(sv, [[46, 132], g20], { color: "#7B8696" });
  S.label(sv, 12, 108, `거울 면과 이룬 각 ${GRAZE}°`, { size: 13.5, color: GRAY_INK });
  S.label(sv, 12, 125, "(입사각 아님)", { size: 13.5, color: GRAY_INK });
  // 작은 칸 글자
  S.label(sv, bx - 17, B.y + 58, "입사각 0°", { anchor: "end", size: 13.5, color: AMBER_INK });
  S.label(sv, bx + 17, B.y + 66, "반사각 0°", { anchor: "start", size: 13.5, color: CYAN_INK });
}
