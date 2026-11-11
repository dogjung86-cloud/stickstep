// 도입 샘플 3(u2l2) 빵 공장의 그림. intro-u2.mjs가 다시 내보낸다.
// 뒷벽에 시설 셋(출입문, 통제실의 화면, 발전기)이 나란히 있고, 앞쪽 바닥에 빵 만드는 줄이 지나간다:
//   출입문으로 밀가루 자루가 들어온다 → 밀가루 통 → 반죽이 띠를 타고 화덕으로 → 빵이 나와 상자에 쌓인다.
// 움직이는 것은 묶음(<g class>)으로 나눠 두고 앱의 CSS가 움직인다. 시설을 끄면 무대의 상태 클래스에 따라 묶음이 바뀐다.
//   opn-fc-doorL / doorR  문짝(열려 있을 때 양옆으로 밀려 있다. 닫으면 가운데로)
//   opn-fc-sack           문으로 들어오는 자루        opn-fc-flour  밀가루 통 속의 밀가루
//   opn-fc-dough          띠 위의 반죽 셋             opn-fc-loaf   구워져 나오는 빵 셋
//   opn-fc-burnt          통제실이 꺼졌을 때 나오는 탄 빵, 덜 부푼 빵, 너무 큰 빵
//   opn-fc-fire           화덕의 불                   opn-fc-osmoke 탄내(통제실이 꺼졌을 때)
//   opn-fc-wave / noise   통제실 화면의 고른 선 / 끊긴 선(조절이 끊겼다)      opn-fc-lamps  조작판의 표시등
//   opn-fc-spokes         발전기 바퀴살(돈다)          opn-fc-bolt   번개 표시
//   opn-fc-smoke          굴뚝 연기                   opn-fc-dark   전기가 끊겼을 때 실내를 덮는 어둠
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, squiggle } from "../lib/sk.mjs";

export const FC = {
  // 시설마다 누르는 자리(무대 좌표의 x, y, w, h)와 이름표 자리(가운데 x, 위 y)
  hit: { door: [62, 104, 264, 300], ctrl: [332, 104, 196, 224], gen: [704, 104, 196, 250] },
  tag: { door: [190, 118], ctrl: [424, 118], gen: [815, 118] },
};
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };

function loaf(sk, x, y, s, sd, o = {}) {
  sk.at(x, y, s, () => {
    const body = curve([[-36, 0], [-38, -18], [-26, -34], [0, -38], [26, -34], [38, -18], [36, 0]], false, 3);
    const pts = [...body, body[0]];
    sk.fill(pts, o.color ?? "#E3A553", { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd, tex: !o.flat });
    sk.ink(pts, { w: 8, seed: sd + 1, wob: 0.6 });
    for (const dx of [-14, 2, 18]) sk.ink(curve([[dx - 5, -30], [dx, -22], [dx + 3, -13]]), { w: 4, color: o.score ?? "#B5742A", seed: sd + 2 + dx, wob: 0.3 });
  });
}
function sack(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const b = curve([[-30, 0], [-36, -30], [-26, -58], [-10, -64], [10, -64], [26, -58], [36, -30], [30, 0]], false, 3);
    sk.fill([...b, b[0]], "#F4E6C6", { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd });
    sk.ink([...b, b[0]], { w: 8, seed: sd + 1, wob: 0.6 });
    sk.ink(curve([[-12, -64], [-18, -78], [-6, -74]]), { w: 6, seed: sd + 2, wob: 0.3 });
    sk.ink(curve([[12, -64], [18, -78], [6, -74]]), { w: 6, seed: sd + 3, wob: 0.3 });
    sk.ink(dense([[-14, -34], [14, -34]]), { w: 5, color: "#C9A86A", seed: sd + 4, wob: 0.3 });
    sk.ink(dense([[-10, -22], [10, -22]]), { w: 5, color: "#C9A86A", seed: sd + 5, wob: 0.3 });
  });
}

export function factoryBase() {
  const sk = new Sk(960, 544, { id: "fb" });
  const WALL = "#FFF6E4", FLOOR = "#EFE3CC";
  // ── 건물: 지붕, 굴뚝, 뒷벽, 바닥 ──
  g(sk, "opn-fc-smoke", () => {
    for (const [x, y, r, i] of [[650, 42, 17, 0], [686, 26, 12, 1]]) {
      const p = circ(x, y, r, { over: 0.2, seed: 11 + i, lump: 0.06 });
      sk.fill(p, "#E6E8EC", { dx: 0, dy: 0, wob: 0.6, seed: 13 + i });
      sk.ink(p, { w: 6, color: C.gray, seed: 15 + i, wob: 0.6 });
    }
  });
  const chim = poly([[584, 96], [588, 44], [626, 44], [630, 96]], 4);
  sk.fill(chim, "#C9CDD2", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 17 }); sk.ink(chim, { w: 9, seed: 18 });
  const wall = poly([[60, 98], [900, 98], [900, 404], [60, 404]], 6);
  sk.fill(wall, WALL, { dx: 0, dy: 0, wob: 0.8, seed: 21 });
  const floor = poly([[44, 404], [916, 404], [916, 500], [44, 500]], 6);
  sk.fill(floor, FLOOR, { dx: 0, dy: 0, wob: 0.8, seed: 23 });
  const roof = poly([[36, 98], [50, 62], [910, 62], [924, 98]], 6);
  sk.fill(roof, "#F0B24A", { dx: 1, dy: 1.2, wob: 0.8, seed: 25, tex: true, texAng: 0.02 });
  sk.ink(roof, { w: 10, seed: 26 });
  sk.ink(dense([[60, 98], [60, 500]], 6), { w: 10, seed: 27 });
  sk.ink(dense([[900, 98], [900, 500]], 6), { w: 10, seed: 28 });
  sk.ink(dense([[40, 500], [920, 502]], 8), { w: 10, seed: 29 });
  sk.ink(dense([[64, 404], [896, 404]], 8), { w: 5, color: "#D2C2A2", seed: 30, wob: 1 });

  // ── 출입문(뒷벽 왼쪽): 문틀, 바깥 풍경, 들어오는 자루, 문짝 둘 ──
  const out = poly([[122, 178], [258, 178], [258, 402], [122, 402]], 5);
  sk.fill(out, "#CDE9F8", { dx: 0, dy: 0, wob: 0.5, seed: 41 });
  sk.fill(poly([[122, 356], [258, 356], [258, 402], [122, 402]], 5), "#BFD9A0", { dx: 0, dy: 0, wob: 0.5, seed: 42 });
  g(sk, "opn-fc-sack", () => sack(sk, 190, 398, 1.0, 51));
  g(sk, "opn-fc-doorL", () => {
    const d = poly([[122, 180], [190, 180], [190, 402], [122, 402]], 5);
    sk.fill(d, "#C98A4B", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 61, tex: true, texAng: 1.5 });
    sk.ink(d, { w: 8, seed: 62 });
    sk.ink(dense([[176, 280], [176, 312]]), { w: 7, seed: 63, wob: 0.3 });
  });
  g(sk, "opn-fc-doorR", () => {
    const d = poly([[190, 180], [258, 180], [258, 402], [190, 402]], 5);
    sk.fill(d, "#C98A4B", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 65, tex: true, texAng: 1.5 });
    sk.ink(d, { w: 8, seed: 66 });
    sk.ink(dense([[204, 280], [204, 312]]), { w: 7, seed: 67, wob: 0.3 });
  });
  sk.ink(poly([[120, 176], [260, 176], [260, 404], [120, 404]], 5), { w: 10, seed: 44 });
  sk.ink(dense([[66, 168], [318, 168]], 6), { w: 8, color: "#6B5A45", seed: 45, wob: 0.8 }); // 문이 밀리는 레일

  // ── 통제실(뒷벽 가운데): 화면과 조작판 ──
  const mon = rrect(346, 172, 156, 104, 14);
  sk.fill(mon, "#27313D", { dx: 0, dy: 0, wob: 0.5, seed: 71 });
  g(sk, "opn-fc-wave", () => {
    const pts = [];
    for (let x = 362; x <= 486; x += 6) pts.push([x, 224 - 20 * Math.sin((x - 362) / 19)]);
    sk.ink(pts, { w: 7, color: "#3FD08B", seed: 73, wob: 0.4 });
  });
  g(sk, "opn-fc-noise", () => {
    sk.ink(dense([[364, 226], [484, 226]], 4), { w: 7, color: "#FF6B6B", seed: 75, wob: 0.5, dash: [16, 16] });
  });
  sk.ink(mon, { w: 10, seed: 72 });
  const desk = rrect(334, 286, 180, 34, 8);
  sk.fill(desk, "#C9CDD2", { dx: 0.6, dy: 0.8, wob: 0.5, seed: 77 }); sk.ink(desk, { w: 8, seed: 78 });
  g(sk, "opn-fc-lamps", () => {
    for (const [x, c, i] of [[366, C.red, 0], [424, C.lemon, 1], [482, C.green, 2]]) {
      const k = circ(x, 303, 9, { over: 0.2, seed: 80 + i });
      sk.fill(k, c, { dx: 0, dy: 0, wob: 0.3, seed: 83 + i }); sk.ink(k, { w: 5, seed: 86 + i, wob: 0.3 });
    }
  });

  // ── 발전기(뒷벽 오른쪽): 몸통, 받침, 바퀴, 바퀴살, 번개, 화덕으로 가는 전선 ──
  sk.ink(curve([[752, 330], [724, 352], [706, 378], [692, 396]]), { w: 7, color: "#4E5968", seed: 88, wob: 0.6 });
  const house = rrect(738, 166, 154, 150, 18);
  sk.fill(house, "#C9D6E2", { dx: 0.8, dy: 1, wob: 0.6, seed: 89, tex: true }); sk.ink(house, { w: 9, seed: 90 });
  const base = rrect(748, 300, 136, 46, 8);
  sk.fill(base, "#9FB4C7", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 91, tex: true }); sk.ink(base, { w: 9, seed: 92 });
  const rim = circ(815, 238, 64, { over: 0.1, seed: 93 });
  sk.fill(rim, "#EEF2F6", { dx: 0, dy: 0, wob: 0.6, seed: 94 });
  g(sk, "opn-fc-spokes", () => {
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      sk.ink(dense([[815, 238], [815 + 54 * Math.cos(a), 238 + 54 * Math.sin(a)]]), { w: 10, color: "#5A6B7F", seed: 95 + i, wob: 0.4 });
    }
  });
  sk.ink(rim, { w: 11, seed: 98 });
  const hub = circ(815, 238, 13, { over: 0.2, seed: 99 });
  sk.fill(hub, "#5A6B7F", { dx: 0, dy: 0, wob: 0.3, seed: 100 }); sk.ink(hub, { w: 6, seed: 101, wob: 0.3 });
  g(sk, "opn-fc-bolt", () => {
    const b = poly([[712, 176], [686, 218], [706, 218], [692, 254], [734, 204], [714, 204], [728, 176]], 3);
    sk.fill(b, C.lemon, { dx: 0, dy: 0, wob: 0.4, seed: 103 }); sk.ink(b, { w: 6, seed: 104, wob: 0.4 });
  });

  // ── 앞쪽의 빵 만드는 줄: 밀가루 통, 띠, 반죽, 빵, 화덕, 상자 ──
  const bin = poly([[262, 388], [346, 388], [330, 446], [278, 446]], 4);
  sk.fill(bin, "#B9C6D3", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 111 });
  g(sk, "opn-fc-flour", () => {
    const f = curve([[270, 392], [286, 378], [304, 372], [322, 378], [338, 392]], false, 3);
    sk.fill([...f, f[0]], "#FFFDF4", { dx: 0, dy: 0, wob: 0.4, seed: 113 });
    sk.ink(f, { w: 6, color: "#C9BFA2", seed: 114, wob: 0.4 });
  });
  sk.ink(bin, { w: 9, seed: 112 });
  // 띠
  const belt = rrect(300, 452, 506, 26, 13);
  sk.fill(belt, "#8E99A6", { dx: 0, dy: 0, wob: 0.6, seed: 121 }); sk.ink(belt, { w: 9, seed: 122 });
  for (const [x, i] of [[322, 0], [432, 1], [716, 2], [784, 3]]) { const r = circ(x, 465, 8, { over: 0.2, seed: 124 + i }); sk.fill(r, "#DDE3EA", { dx: 0, dy: 0, wob: 0.3, seed: 128 + i }); sk.ink(r, { w: 4, seed: 132 + i, wob: 0.3 }); }
  for (const x of [330, 776]) sk.ink(dense([[x, 480], [x, 498]]), { w: 9, seed: 136 + x });
  for (let i = 0; i < 3; i++) {
    g(sk, `opn-fc-dough d${i}`, () => {
      // 반죽: 납작하게 퍼진 덩이(달걀이나 공으로 읽히지 않게)
      const d = curve([[330, 452], [328, 436], [340, 424], [356, 422], [370, 428], [376, 442], [374, 452]], false, 3);
      sk.fill([...d, d[0]], "#F4E3BC", { dx: 0, dy: 0, wob: 0.5, seed: 144 + i });
      sk.ink([...d, d[0]], { w: 7, seed: 147 + i, wob: 0.5 });
      sk.ink(curve([[342, 434], [350, 430], [358, 432]]), { w: 3.5, color: "#C9A86A", seed: 150 + i, wob: 0.3 });
    });
  }
  for (let i = 0; i < 3; i++) g(sk, `opn-fc-loaf d${i}`, () => loaf(sk, 690, 452, 0.9, 151 + i * 9));
  g(sk, "opn-fc-burnt d0", () => loaf(sk, 690, 452, 0.9, 181, { color: "#4A372C", score: "#2A1F18", flat: true }));
  g(sk, "opn-fc-burnt d1", () => loaf(sk, 690, 452, 0.52, 191, { color: "#F3E7C4", score: "#D9C79A", flat: true }));
  g(sk, "opn-fc-burnt d2", () => loaf(sk, 690, 452, 1.25, 201, { color: "#3F2E25", score: "#221913", flat: true }));
  // 화덕(띠 위에 걸터앉아 반죽과 빵을 가린다)과 굴뚝으로 가는 통
  const pipe = poly([[590, 98], [622, 98], [622, 336], [590, 336]], 5);
  sk.fill(pipe, "#C9CDD2", { dx: 0.6, dy: 0.8, wob: 0.5, seed: 211 }); sk.ink(pipe, { w: 8, seed: 212 });
  const oven = rrect(522, 334, 168, 144, 16);
  sk.fill(oven, "#B9553E", { dx: 1, dy: 1.2, wob: 0.8, seed: 213, tex: true });
  sk.ink(oven, { w: 10, seed: 214 });
  const win = rrect(548, 362, 116, 70, 14);
  sk.fill(win, "#3A2A26", { dx: 0, dy: 0, wob: 0.4, seed: 215 });
  g(sk, "opn-fc-fire", () => {
    sk.glow(606, 404, 66, C.orange, 0.75, 0.15);
    for (const [x, hh, i] of [[584, 34, 0], [608, 46, 1], [632, 30, 2]]) {
      const fl = curve([[x, 428 - hh], [x + 12, 418 - hh * 0.4], [x + 9, 428], [x - 9, 428], [x - 12, 418 - hh * 0.4]], true, 2);
      sk.fill(fl, i === 1 ? C.lemon : C.orange, { dx: 0, dy: 0, wob: 0.3, seed: 216 + i });
    }
  });
  sk.ink(win, { w: 8, seed: 219 });
  g(sk, "opn-fc-osmoke", () => {
    for (const [x, i] of [[540, 0], [580, 1], [660, 2]]) sk.ink(squiggle(x, 330, 46, 8, 2, i * 1.3), { w: 7, color: "#6B6B70", wob: 0, seed: 221 + i });
  });
  // 빵 상자
  const crate = poly([[806, 440], [892, 440], [884, 498], [814, 498]], 4);
  loaf(sk, 834, 446, 0.7, 231); loaf(sk, 864, 444, 0.7, 241);
  sk.fill(crate, C.wood, { dx: 0.6, dy: 0.8, wob: 0.6, seed: 251, tex: true, texAng: 0.02 });
  sk.ink(crate, { w: 9, seed: 252 });
  sk.ink(dense([[810, 468], [888, 468]]), { w: 5, color: C.woodDark, seed: 253, wob: 0.4 });
  // 전기가 끊겼을 때의 어둠(실내만 덮는다)
  sk.raw(`<path class="opn-fc-dark" d="M64 100H896V498H64Z" fill="#1B2433"/>`);
  return { sk, meta: {} };
}
