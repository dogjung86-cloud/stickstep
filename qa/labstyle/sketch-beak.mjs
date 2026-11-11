// 랩의 다른 느낌 샘플 2(손그림 공책): 두 섬의 새 랩의 그림 부품을 손그림 엔진(qa/sketch/lib/sk.mjs)으로 뽑는다.
//   node qa/labstyle/sketch-beak.mjs            → src/ui/labSketch.generated.ts
//   node qa/labstyle/sketch-beak.mjs <미리보기.svg>  → 눈검수용 SVG도 함께 쓴다(처음 무리를 올려 둔 모습)
// 만화(u2l7, qa/sketch/scenes/comic-u2l7.mjs)와 같은 손, 같은 새다: 몸통은 모두 같고 부리만 다르다.
// 그리는 코드는 번들 밖에 두고(코드 그림의 규칙), 앱은 뽑아 둔 조각 문자열만 싣는다. 움직임은 앱이 조각을 옮기고 갈아 끼워 만든다.
// 좌표는 무대 설계 판(346×230)의 세 배(1038×690)다. 선 굵기는 화면에서 2.3~2.8px로 보이게 맞췄다.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Sk, C, curve, dense, circ, poly, mix, lerp, hash } from "../sketch/lib/sk.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "src", "ui", "labSketch.generated.ts");
const W = 1038, H = 690, HALF = 519;
const BIRD = "#8E6E53";
const YOUNG = "#D9B56C"; // 어린 새: 갓 깬 새끼의 노란 솜털과 어미의 갈색 사이
export const BEAK_COLOR = { T: C.orange, L: C.blue, S: "#D6D6D0" };
const BIRD_S = 0.55; // 새 한 마리의 크기(만화의 새를 1로)
const LWK = 1.55;    // 작게 그린 새의 선이 가늘어지지 않게

/** 옆모습 새(원점 = 발밑, 오른쪽을 본다). 만화의 finch와 같은 몸통에 부리 세 가지. */
function bird(sk, kind, sd, col = BIRD) {
  const dark = mix(col, "#000000", 0.28);
  sk.ink(dense([[-8, -32], [-10, 0]]), { w: 6, seed: sd, wob: 0.3 });
  sk.ink(dense([[14, -32], [16, 0]]), { w: 6, seed: sd + 1, wob: 0.3 });
  const tail = poly([[-52, -66], [-108, -44], [-100, -68], [-56, -84]], 3);
  sk.fill(tail, dark, { dx: 0, dy: 0, wob: 0.5, seed: sd + 2 }); sk.ink(tail, { w: 7, seed: sd + 3, wob: 0.6 });
  const body = curve([[-62, -68], [-40, -98], [10, -108], [50, -94], [62, -64], [38, -36], [-10, -28], [-46, -42]], true, 4);
  sk.fill(body, col, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 4, tex: 0.8 }); sk.ink(body, { w: 8, seed: sd + 5, wob: 0.8 });
  const head = circ(52, -112, 33, { over: 0.12, seed: sd + 6 });
  sk.fill(head, col, { dx: 0.8, dy: 1, wob: 0.6, seed: sd + 7 }); sk.ink(head, { w: 8, seed: sd + 8, wob: 0.6 });
  sk.ink(curve([[-38, -72], [-6, -54], [28, -68]]), { w: 5, color: dark, seed: sd + 9, wob: 0.4 });
  beakOn(sk, kind, sd + 10);
  sk.dot(58, -120, 6.2);
}
/** 부리 세 가지: 두꺼운(T), 긴(L), 짧은(S). 머리(52, -112)의 오른쪽에 붙는다. 색 면이 보이게 선은 몸보다 가늘게 긋는다. */
const BEAK_PTS = {
  T: [[78, -150], [128, -106], [78, -82]],
  L: [[79, -129], [154, -110], [79, -95]],
  S: [[79, -128], [114, -111], [79, -95]],
};
function beakOn(sk, kind, sd) {
  const beak = poly(BEAK_PTS[kind], 3);
  sk.fill(beak, BEAK_COLOR[kind], { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(beak, { w: 4, seed: sd + 1, wob: 0.3 });
}
/** 새끼 새(작은 노란 덩이). 원점 = 발밑 */
function chick(sk, sd) {
  const b = circ(0, -26, 26, { over: 0.15, seed: sd });
  sk.fill(b, "#F6DC7A", { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.ink(b, { w: 7, seed: sd + 2, wob: 0.5 });
  const bk = poly([[22, -32], [40, -26], [22, -20]], 2);
  sk.fill(bk, C.orange, { dx: 0, dy: 0, wob: 0.2, seed: sd + 3 }); sk.ink(bk, { w: 5, seed: sd + 4, wob: 0.3 });
  sk.dot(8, -32, 4.8);
}
/** 부리에 문 씨앗(섬 (가)의 먹이). 원점 = 씨앗 가운데 */
function seedBit(sk, sd) {
  const c = circ(0, 0, 13, { over: 0.15, seed: sd, lump: 0.08 });
  sk.fill(c, "#6B4A32", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 }); sk.ink(c, { w: 5, seed: sd + 2, wob: 0.3 });
  sk.ink(curve([[-6, -3], [-3, -7], [2, -7]]), { w: 3, color: "#C9A27A", seed: sd + 3, wob: 0.1 });
}
/** 작은 곤충(섬 (나)의 먹이): 연두색 몸에 다리 셋, 까만 머리. 원점 = 몸 가운데 */
function bugBit(sk, sd) {
  for (const [x, a] of [[-7, -0.5], [0, 0], [7, 0.5]]) sk.ink(dense([[x, 4], [x + a * 8, 15]]), { w: 3, seed: sd + 5 + x, wob: 0.1 });
  const b = circ(0, 0, 10, { over: 0.1, seed: sd, sx: 1.45 });
  sk.fill(b, "#B9E24A", { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 }); sk.ink(b, { w: 4, seed: sd + 2, wob: 0.2 });
  sk.dot(13, -1, 4);
}

/** 조각 하나를 따로 뽑는다(id 접두를 달리해 한 문서에 함께 넣어도 부딪치지 않는다). */
function piece(id, scale, lwK, draw) {
  const sk = new Sk(W, H, { id });
  sk.lwK = lwK;
  sk.at(0, 0, scale, () => draw(sk));
  return { defs: sk.defs.join(""), body: sk.body.join("") };
}

// ── 바탕 장면: 바다, 두 섬, 먹이(씨앗, 벌레가 든 나무), 구성 칸의 테두리, 범례의 새 머리 ──
function scene() {
  const sk = new Sk(W, H, { id: "lsS" });
  sk.lwK = 0.9;
  // 바다: 물결치는 수평선 아래를 하늘색 마커로 칠한다
  const top = [];
  for (let x = -6; x <= W + 6; x += 6) top.push([x, 214 + 6 * Math.sin(x / 38 + 1.3) + 3 * Math.sin(x / 15)]);
  sk.fill([...top, [W + 6, 548], [-6, 548], top[0]], "#BFE0F2", { dx: 0, dy: 0, wob: 0, seed: 501, tex: true, texAng: 0.03 });
  sk.ink(top, { w: 7, wob: 0.8, seed: 502, color: C.blue });
  // 두 섬(모래 빛 땅). 가운데에 바다가 보이게 띄운다
  const isle = (ox, sd) => {
    const g = curve([[ox + 22, 372], [ox + 60, 286], [ox + 170, 244], [ox + 330, 238], [ox + 452, 262], [ox + 500, 342], [ox + 498, 452], [ox + 440, 520], [ox + 280, 540], [ox + 110, 532], [ox + 34, 470]], true, 5);
    sk.fill(g, "#EEDFB2", { dx: 1.5, dy: 2, wob: 1.2, seed: sd, tex: 0.9, texAng: -0.3 });
    sk.ink(g, { w: 9, seed: sd + 1, wob: 1.4 });
    // 물가의 잔물결
    [[ox + 6, 500], [ox + 462, 536]].forEach(([wx, wy], i) => sk.ink(curve([[wx, wy], [wx + 14, wy - 7], [wx + 28, wy], [wx + 42, wy - 7], [wx + 56, wy]]), { w: 5, color: C.white, wob: 0.3, seed: sd + 5 + i }));
  };
  isle(0, 511); isle(HALF, 521);
  // 풀 몇 포기(섬 위쪽 가장자리)
  const grass = (x, y, n, sd) => { for (let i = 0; i < n; i++) { const gx = x + i * 13, lean = ((i * 37 + sd) % 5 - 2) * 4; sk.ink(curve([[gx, y], [gx + lean * 0.5, y - 20], [gx + lean, y - 34 - (i % 3) * 6]]), { w: 6, color: i % 2 ? "#4E9A46" : "#6BB55A", seed: sd + i, wob: 0.3 }); } };
  grass(340, 246, 4, 531); grass(436, 268, 3, 541); grass(HALF + 300, 244, 4, 551); grass(HALF + 420, 262, 3, 561);
  // 섬 (가)의 먹이: 크고 단단한 씨앗(왼쪽 앞)
  [[54, 352, 22], [80, 404, 23], [48, 452, 22], [84, 494, 20]].forEach(([x, y, r], i) => {
    const c = circ(x, y, r, { over: 0.15, seed: 421 + i, lump: 0.08 });
    sk.fill(c, "#6B4A32", { dx: 0, dy: 0, wob: 0.5, seed: 441 + i }); sk.ink(c, { w: 7, seed: 461 + i, wob: 0.5 });
    sk.ink(curve([[x - r * 0.45, y - r * 0.2], [x - r * 0.2, y - r * 0.5], [x + r * 0.15, y - r * 0.5]]), { w: 4, color: "#C9A27A", seed: 481 + i, wob: 0.2 });
  });
  // 섬 (나)의 먹이: 나무 속 작은 곤충(줄기의 구멍 안)
  const tx = HALF + 80;
  const crown = curve([[tx - 62, 232], [tx - 70, 176], [tx - 30, 142], [tx + 22, 146], [tx + 62, 176], [tx + 66, 226], [tx + 24, 256], [tx - 26, 256]], true, 4);
  const trunk = poly([[tx - 26, 250], [tx + 26, 250], [tx + 30, 482], [tx - 30, 482]], 4);
  sk.fill(trunk, "#B98A56", { dx: 1, dy: 1.4, wob: 0.8, seed: 571, tex: 0.8, texAng: 1.5 }); sk.ink(trunk, { w: 8, seed: 572, wob: 0.8 });
  sk.fill(crown, "#5FAE5A", { dx: 1.2, dy: 1.6, wob: 1, seed: 573, tex: 0.9 }); sk.ink(crown, { w: 8, seed: 574, wob: 1 });
  [[tx - 4, 318], [tx + 2, 412]].forEach(([hx, hy], i) => {
    const hole = circ(hx, hy, 15, { over: 0.1, seed: 581 + i, sy: 1.3 });
    sk.fill(hole, "#3A2412", { dx: 0, dy: 0, wob: 0.3, seed: 583 + i }); sk.ink(hole, { w: 6, seed: 585 + i, wob: 0.4 });
  });
  // 벌레는 구멍 밖 줄기 위를 기어 다닌다(구멍 한가운데에 두면 눈처럼 보인다)
  [[tx + 8, 356, -0.5], [tx - 8, 452, 0.4]].forEach(([bx, by, rot], i) => sk.at(bx, by, 1.05, () => bugBit(sk, 587 + i * 9), rot));
  // 범례의 새 머리 셋(부리만 다르다)
  [["T", 96], ["L", 420], ["S", 742]].forEach(([k, x], i) => {
    sk.at(x, 722, 0.6, () => {
      const head = circ(52, -112, 33, { over: 0.12, seed: 601 + i });
      sk.fill(head, BIRD, { dx: 0.8, dy: 1, wob: 0.6, seed: 604 + i }); sk.ink(head, { w: 12, seed: 607 + i, wob: 0.6 });
      const beak = poly(BEAK_PTS[k], 3);
      sk.fill(beak, BEAK_COLOR[k], { dx: 0, dy: 0, wob: 0.3, seed: 611 + i }); sk.ink(beak, { w: 7, seed: 614 + i, wob: 0.3 });
      sk.dot(58, -120, 7);
    });
  });
  return { defs: sk.defs.join(""), body: sk.body.join("") };
}

// 구성 칸(섬마다 아홉 칸): 칠은 앱이 색을 바꾸고, 테두리는 손그림 선으로 고정
function segs() {
  const out = { A: [], B: [] };
  for (const [isle, ox] of [["A", 0], ["B", HALF]]) {
    for (let i = 0; i < 9; i++) {
      const sk = new Sk(W, H, { id: `lsG${isle}${i}` });
      const x = ox + 34 + i * 51, y = 560, w = 43, h = 26;
      const r = poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 3);
      sk.fill(r, "#ffffff", { dx: 0, dy: 0, wob: 0.6, seed: 701 + i + (isle === "B" ? 20 : 0) });
      const fillD = sk.body.pop().match(/ d="([^"]+)"/)[1];
      sk.ink(r, { w: 5.5, seed: 741 + i + (isle === "B" ? 20 : 0), wob: 0.7 });
      const inkD = sk.body.pop().match(/ d="([^"]+)"/)[1];
      out[isle].push({ fill: fillD, ink: inkD });
    }
  }
  return out;
}

const parts = {
  scene: scene(),
  T: piece("lsT", BIRD_S, LWK, (sk) => bird(sk, "T", 301)),
  L: piece("lsL", BIRD_S, LWK, (sk) => bird(sk, "L", 314)),
  S: piece("lsS2", BIRD_S, LWK, (sk) => bird(sk, "S", 327)),
  Ty: piece("lsTy", BIRD_S, LWK, (sk) => bird(sk, "T", 301, YOUNG)),
  Ly: piece("lsLy", BIRD_S, LWK, (sk) => bird(sk, "L", 314, YOUNG)),
  chick: piece("lsC", 0.62, 1.5, (sk) => chick(sk, 131)),
  seed: piece("lsD", 1, 1, (sk) => seedBit(sk, 81)),
  bug: piece("lsB", 1, 1, (sk) => bugBit(sk, 91)),
};
const SEGS = segs();

// 자리(발밑 좌표, 섬 안에서의 좌표. 섬 (나)는 x에 HALF를 더한다). 세 줄: 뒤, 가운데, 앞
const COLS = [166, 286, 406], ROWS = [338, 428, 518];
const SEATS = ROWS.flatMap((y, r) => COLS.map((x, c) => [x + (r === 1 ? -14 : 0) + Math.round((hash(r * 3 + c + 9) - 0.5) * 10), y + Math.round((hash(r * 5 + c + 3) - 0.5) * 8)]));

const defs = `${parts.scene.defs}${["T", "L", "S", "Ty", "Ly", "chick", "seed", "bug"].map((k) => `${parts[k].defs}<g id="lsh-${k}">${parts[k].body}</g>`).join("")}`;
const ts = `// 자동 생성물: node qa/labstyle/sketch-beak.mjs 가 만든다. 손으로 고치지 않는다.
// 랩의 다른 느낌 샘플 2(손그림 공책) 두 섬의 새 랩의 그림 조각. 그림 원본은 qa/labstyle/sketch-beak.mjs 다.

export const LSH_W = ${W};
export const LSH_H = ${H};
export const LSH_HALF = ${HALF};
/** 새의 자리(발밑, 섬 안 좌표). 뒤 세 자리, 가운데 세 자리, 앞 세 자리 */
export const LSH_SEATS: [number, number][] = ${JSON.stringify(SEATS)};
export const LSH_BEAK_COLOR: Record<"T" | "L" | "S", string> = ${JSON.stringify(BEAK_COLOR)};
/** 부리 끝(새의 발밑 기준). 먹이를 무는 자리 */
export const LSH_BEAK_TIP: Record<"T" | "L" | "S", [number, number]> = ${JSON.stringify(Object.fromEntries(Object.entries(BEAK_PTS).map(([k, p]) => [k, [Math.round(p[1][0] * BIRD_S), Math.round(p[1][1] * BIRD_S)]])))};
/** <defs> 안에 넣는 조각: 새 세 가지(#lsh-T, #lsh-L, #lsh-S), 어린 새(#lsh-Ty, #lsh-Ly), 갓 깬 새끼(#lsh-chick), 부리에 문 먹이(#lsh-seed, #lsh-bug) */
export const LSH_DEFS = ${JSON.stringify(defs)};
/** 바탕 장면(바다, 두 섬, 먹이, 범례의 새 머리) */
export const LSH_SCENE = ${JSON.stringify(parts.scene.body)};
/** 구성 칸: 섬마다 아홉 칸의 칠과 테두리 경로 */
export const LSH_SEGS: Record<"A" | "B", { fill: string; ink: string }[]> = ${JSON.stringify(SEGS)};
`;
if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== ts) writeFileSync(OUT, ts);
console.log(`labSketch.generated.ts ${(Buffer.byteLength(ts) / 1024).toFixed(1)}KB (defs ${(defs.length / 1024).toFixed(1)}KB, scene ${(parts.scene.body.length / 1024).toFixed(1)}KB)`);

// 눈검수용 미리보기
const preview = process.argv[2];
if (preview) {
  const START = ["T", "L", "S", "S", "T", "L", "L", "S", "T"];
  const birds = ["A", "B"].map((isle) => SEATS.map(([x, y], i) => `<use href="#lsh-${START[i]}" transform="translate(${x + (isle === "B" ? HALF : 0)} ${y})"/>`).join("")).join("");
  const segsSvg = ["A", "B"].map((isle) => SEGS[isle].map((s, i) => `<path d="${s.fill}" fill="${BEAK_COLOR[START[i]]}"/><path d="${s.ink}" stroke="#1c1c1e" stroke-width="5"/>`).join("")).join("");
  writeFileSync(preview, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="${W}" height="${H}" fill="#FBF8EF"/><defs>${defs}</defs>${parts.scene.body}${birds}<use href="#lsh-chick" transform="translate(600 620)"/><use href="#lsh-seed" transform="translate(700 610)"/><use href="#lsh-bug" transform="translate(760 610)"/>${segsSvg}</svg>`);
  console.log("preview", preview);
}
