// [중2 Ⅳ v5] 들여다보고 가르는 랩 두 판(같은 틀).
//   g2u4SortLab (g2u4l1) 「성분이 한 가지인 물질은 어느 것일까요?」
//     책의 해 보기(우리 주변의 물질 구분하기): 다이아몬드, 드라이아이스, 풍선 속 헬륨, 제빵 소다, 알루미늄 캔의 성분을 살펴 가른다.
//   g2u4CanLab  (g2u4l5) 「캔 음료 속 물질은 어떤 입자일까요?」
//     책의 해 보기(원자, 분자, 이온으로 존재하는 물질 알아보기): 알루미늄 캔, 물, 염화 나트륨, 과당을 이루는 입자를 가른다.
// 학생이 정하는 것: 어느 물질부터 볼지, 그리고 본 것을 어느 쪽으로 가를지. 잘못 가르면 그 자리에서 무엇을 다시 볼지 알려 준다.
// 판정의 근거(확대한 입자 모형과 성분 목록)는 무대에 남는다. 다 가르면 판정 질문 하나, 결론 한 문장.
// 판정이 뜨면 무대를 질문이 가리키는 것으로 바꾼다(마지막으로 가른 물질이 남아 질문과 어긋나지 않게):
//   성분 랩은 다이아몬드 확대와 성분 목록(탄소 하나), 캔 음료 랩은 알루미늄 캔과 염화 나트륨(소금 알갱이)의 확대 원 둘을 나란히.

import { el } from "../../../core/dom";
import { ELEMS } from "../../../ui/chemKit";
import type { StepRenderer } from "../../types";
import { bad, ball, bond, g4Lab, g4Svg, good, row, tap, toast, txt, type G4Step } from "./kit";

interface Item {
  key: string;
  name: string;
  /** 확대 원 위의 이름(없으면 name) */
  title?: string;
  /** 확대한 입자 모형(원 안, 가운데 108,116 반지름 84) */
  art: string;
  /** 오른쪽 목록 */
  comps: [string, string][]; // [기호, 이름]
  bin: string;
  hint: string; // 잘못 갈랐을 때
}
interface Config {
  cls: string;
  wait: string;
  first: string;
  listTitle: string;
  bins: { key: string; label: string }[];
  items: Item[];
  askBin: string; // 물질을 고른 뒤의 도움말
  judge: { q: string; choices: { t: string; ok?: boolean }[]; why: string };
  /** 판정이 뜰 때 무대: 질문이 가리키는 물질 하나(item) 또는 직접 그린 장면(art, 무대의 id 접두를 받는다) */
  judgeShow: { item: string } | { art: (ns: string) => string };
  done: string;
}

// ── 입자 그림(좌표는 원의 가운데 108,116 기준으로 계산한다) ──
const CX = 108;
const CY = 116;
const grid = (sym: string, k: number, gap: number, rows = 4, cols = 4, cx = CX, cy = CY): string => {
  let out = "";
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x = cx + (i - (cols - 1) / 2) * gap;
      const y = cy + (j - (rows - 1) / 2) * gap;
      out += ball(x, y, sym, { k, label: false });
    }
  return out;
};
// 염화 나트륨 한 층: 나트륨 이온(Na⁺)과 염화 이온(Cl⁻)이 번갈아 놓인다. 원자일 때는 나트륨이 염소보다 크지만 이온이 되면
// 반대라서, 원자 공의 크기(chemKit)를 그대로 쓰지 않고 이온 반지름(Na⁺ 102 pm, Cl⁻ 181 pm, 염화 이온이 지름 약 1.8배)의 비로 잰다.
// 이웃한 두 이온의 중심 사이 gap(확대 원에서 30 px)에 반지름의 합 gap − 3 px(거의 맞닿게).
// 전하 표시는 글자 대신 굵은 선으로 긋는다(글자 '−'는 폰에서 1 px 남짓으로 가늘었다).
const ION_PM = { Na: 102, Cl: 181 } as const;
const sign = (x: number, y: number, plus: boolean, h: number): string => {
  const line = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
  return line(x - h, y, x + h, y) + (plus ? line(x, y - h, x, y + h) : "");
};
const salt = (cx = CX, cy = CY, gap = 30): string => {
  const px = (gap - 3) / (ION_PM.Na + ION_PM.Cl);
  let out = "";
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      const x = cx + (i - 1.5) * gap;
      const y = cy + (j - 1.5) * gap;
      const sym = (i + j) % 2 ? "Cl" : "Na";
      out += ball(x, y, sym, { k: (ION_PM[sym] * px) / ELEMS[sym].r, label: false }) + sign(x, y, sym === "Na", sym === "Na" ? 4.2 : 5.6);
    }
  return out;
};
// 다이아몬드: 탄소 입자 하나가 이웃 넷과 정사면체 방향(109.5°)으로 이어지고, 이 연결이 사방으로 이어진 입체 그물이다(평면 격자가 아니다).
// 다이아몬드 격자(면심 입방 자리와 대각선으로 1/4 옮긴 자리)에서 가운데 입자로부터 0.9a 안쪽(입자 29개, 결합 40개)을 골라
// y축으로 0.42 rad, x축으로 −0.34 rad 돌려 정사영한다. 격자 상수 a = 86 px(결합 37.2 px), 정리 카드 그림 g2u4l1f2와 같은 틀이다.
// 뒤에서 앞으로 그리고(입자마다 자기 쪽 반막대, 그다음 공), 뒤쪽일수록 작고 어둡게 해 깊이를 보인다.
const diamond = (): string => {
  const basis = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
  const pts: number[][] = [];
  for (let i = -2; i <= 2; i++)
    for (let j = -2; j <= 2; j++)
      for (let k = -2; k <= 2; k++)
        for (const b of basis)
          for (const o of [0, 0.25]) {
            const p = [i + b[0] + o, j + b[1] + o, k + b[2] + o];
            if (Math.hypot(p[0], p[1], p[2]) <= 0.9 + 1e-9 && !pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-6)) pts.push(p);
          }
  const BL = Math.sqrt(3) / 4; // 결합 길이(격자 상수 1 기준)
  const bonds: [number, number][] = [];
  for (let a = 0; a < pts.length; a++)
    for (let b = a + 1; b < pts.length; b++)
      if (Math.abs(Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1], pts[a][2] - pts[b][2]) - BL) < 1e-6) bonds.push([a, b]);
  const yaw = 0.42;
  const pitch = -0.34;
  const A = 86;
  const q = pts.map(([x, y, z]) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const zr = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return { x: CX + x1 * A, y: CY + (y * Math.cos(pitch) - zr * Math.sin(pitch)) * A, z: y * Math.sin(pitch) + zr * Math.cos(pitch) };
  });
  const zMin = Math.min(...q.map((p) => p.z));
  const zMax = Math.max(...q.map((p) => p.z));
  const mix = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);
  let out = "";
  q.map((_, i) => i)
    .sort((a, b) => q[a].z - q[b].z)
    .forEach((i) => {
      const p = q[i];
      const t = (p.z - zMin) / (zMax - zMin); // 0 맨 뒤, 1 맨 앞
      for (const [a, b] of bonds) {
        if (a !== i && b !== i) continue;
        const o = q[a === i ? b : a];
        out += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${((p.x + o.x) / 2).toFixed(1)}" y2="${((p.y + o.y) / 2).toFixed(1)}" stroke="rgb(${mix(70, 154, t)},${mix(82, 168, t)},${mix(100, 188, t)})" stroke-width="${(2.6 + 1.4 * t).toFixed(1)}" stroke-linecap="round"/>`;
      }
      const k = 0.52 + 0.12 * t;
      out += ball(p.x, p.y, "C", { k, label: false }) + `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(ELEMS.C.r * k).toFixed(1)}" fill="#0D1828" opacity="${(0.5 * (1 - t)).toFixed(2)}"/>`;
    });
  return out;
};
const co2 = (x: number, y: number, a: number): string => {
  const dx = Math.cos(a) * 21;
  const dy = Math.sin(a) * 21;
  return bond(x - dx, y - dy, x + dx, y + dy) + ball(x - dx, y - dy, "O", { k: 0.8, label: false }) + ball(x + dx, y + dy, "O", { k: 0.8, label: false }) + ball(x, y, "C", { k: 0.8, label: false });
};
const water = (x: number, y: number, a: number): string => {
  const p = (t: number): [number, number] => [x + Math.cos(a + t) * 15, y + Math.sin(a + t) * 15];
  const [x1, y1] = p(-0.91);
  const [x2, y2] = p(0.91);
  return bond(x, y, x1, y1) + bond(x, y, x2, y2) + ball(x1, y1, "H", { k: 0.9, label: false }) + ball(x2, y2, "H", { k: 0.9, label: false }) + ball(x, y, "O", { k: 0.95, label: false });
};
// 제빵 소다(탄산수소 나트륨)의 한 단위: 나트륨 하나 + 탄소 하나에 산소 셋, 수소 하나
const soda = (x: number, y: number): string => {
  const o: [number, number][] = [[0, -15], [13, 8], [-13, 8]];
  return (
    o.map(([dx, dy]) => bond(x, y, x + dx, y + dy)).join("") +
    bond(x + 13, y + 8, x + 24, y + 14) +
    o.map(([dx, dy]) => ball(x + dx, y + dy, "O", { k: 0.62, label: false })).join("") +
    ball(x + 24, y + 14, "H", { k: 0.62, label: false }) +
    ball(x, y, "C", { k: 0.62, label: false }) +
    ball(x - 30, y - 2, "Na", { k: 0.62, label: false })
  );
};
// 과당 분자 C₆H₁₂O₆(원자 24개): 물에 녹은 과당의 한 모양(β-프룩토푸라노스)을 평면에 편다.
// 산소 하나가 낀 오각 고리(O, C2, C3, C4, C5)에 C2는 OH와 CH₂OH(C1), C3은 OH와 H, C4는 H와 OH, C5는 H와 CH₂OH(C6)가 붙는다.
// 좌표는 고리 결합 길이를 1로 둔 계산 좌표다(고리는 정오각형, 곁가지는 바깥 방향에서 몇 도씩 벌린다. 탄소와 산소, 탄소끼리 1, 탄소와 수소 0.8, 산소와 수소 0.75).
// 검산: 탄소 6, 산소 6, 수소 12, 결합 24. 결합하지 않은 원자끼리는 12.5 px 배율에서 2 px 넘게 떨어진다. 덩이 하나가 물 분자의 두 배쯤이다.
const FRU = (() => {
  const D = Math.PI / 180;
  const at: { el: "C" | "O" | "H"; x: number; y: number }[] = [];
  const bonds: [number, number][] = [];
  const add = (el: "C" | "O" | "H", from: number | null, x: number, y: number): number => {
    at.push({ el, x, y });
    if (from !== null) bonds.push([from, at.length - 1]);
    return at.length - 1;
  };
  const sub = (from: number, el: "C" | "O" | "H", deg: number, len: number): number => add(el, from, at[from].x + Math.cos(deg * D) * len, at[from].y + Math.sin(deg * D) * len);
  const rr = 1 / (2 * Math.sin(36 * D)); // 변이 1인 정오각형의 외접원 반지름
  const ring = [-90, -18, 54, 126, 198].map((a) => [Math.cos(a * D) * rr, Math.sin(a * D) * rr]);
  const O5 = add("O", null, ring[0][0], ring[0][1]);
  const C2 = add("C", O5, ring[1][0], ring[1][1]);
  const C3 = add("C", C2, ring[2][0], ring[2][1]);
  const C4 = add("C", C3, ring[3][0], ring[3][1]);
  const C5 = add("C", C4, ring[4][0], ring[4][1]);
  bonds.push([C5, O5]);
  const C1 = sub(C2, "C", -50, 1);
  sub(C1, "H", -115, 0.8);
  sub(sub(C1, "O", -50, 1), "H", 5, 0.75);
  sub(C1, "H", 15, 0.8);
  sub(sub(C2, "O", 14, 1), "H", 40, 0.75);
  sub(sub(C3, "O", 22, 1), "H", 72, 0.75);
  sub(C3, "H", 86, 0.8);
  sub(C4, "H", 94, 0.8);
  sub(sub(C4, "O", 158, 1), "H", 108, 0.75);
  sub(C5, "H", 166, 0.8);
  const C6 = sub(C5, "C", 230, 1);
  sub(C6, "H", 165, 0.8);
  sub(sub(C6, "O", 230, 1), "H", 175, 0.75);
  sub(C6, "H", 295, 0.8);
  return { at, bonds };
})();
const fructose = (x: number, y: number, rot: number, s = 12.5): string => {
  const c = Math.cos(rot);
  const sn = Math.sin(rot);
  const p = FRU.at.map((a) => ({ el: a.el, x: x + s * (a.x * c - a.y * sn), y: y + s * (a.x * sn + a.y * c) }));
  let out = FRU.bonds.map(([a, b]) => `<line x1="${p[a].x.toFixed(1)}" y1="${p[a].y.toFixed(1)}" x2="${p[b].x.toFixed(1)}" y2="${p[b].y.toFixed(1)}" stroke="#9AA8BC" stroke-width="3" stroke-linecap="round"/>`).join("");
  for (const el of ["H", "O", "C"] as const) for (const a of p) if (a.el === el) out += ball(a.x, a.y, el, { k: 0.44, label: false });
  return out;
};

const SORT: Config = {
  cls: "g2u4x-sort",
  wait: "다섯 물질을 모두 갈라 보세요",
  first: "물질을 하나 골라 <b>확대</b>해 보세요. 어떤 성분으로 이루어져 있나요?",
  listTitle: "이루는 성분",
  bins: [
    { key: "one", label: "성분이 한 가지" },
    { key: "many", label: "성분이 두 가지 이상" },
  ],
  items: [
    { key: "dia", name: "다이아몬드", art: diamond(), comps: [["C", "탄소"]], bin: "one", hint: "입자의 색을 보세요. 탄소 한 가지뿐이에요" },
    { key: "dry", name: "드라이아이스", art: co2(78, 76, 0.3) + co2(140, 96, -0.5) + co2(84, 140, -0.2) + co2(138, 160, 0.5), comps: [["C", "탄소"], ["O", "산소"]], bin: "many", hint: "두 가지 색의 입자가 결합해 있어요" },
    { key: "he", name: "풍선 속 헬륨", art: [[70, 80], [130, 64], [160, 118], [96, 126], [60, 160], [134, 168]].map(([x, y]) => ball(x, y, "He", { k: 1.3, label: false })).join(""), comps: [["He", "헬륨"]], bin: "one", hint: "입자가 여러 개여도 종류는 헬륨 하나예요" },
    { key: "soda", name: "제빵 소다", art: soda(96, 74) + soda(126, 118) + soda(92, 160), comps: [["Na", "나트륨"], ["H", "수소"], ["C", "탄소"], ["O", "산소"]], bin: "many", hint: "네 가지 색의 입자가 섞여 결합해 있어요" },
    { key: "al", name: "알루미늄 캔", art: grid("Al", 1, 30), comps: [["Al", "알루미늄"]], bin: "one", hint: "입자가 모두 같은 색, 알루미늄 한 가지예요" },
  ],
  askBin: "성분은 몇 가지인가요? 아래에서 골라 갈라 보세요.",
  judge: {
    q: "성분이 탄소 한 가지뿐인 <b>다이아몬드</b>를 다른 성분으로 분해할 수 있을까요?",
    choices: [{ t: "분해할 수 없다", ok: true }, { t: "탄소와 산소로 분해된다" }, { t: "가열하면 여러 성분이 된다" }],
    why: "성분이 <b>하나뿐</b>이라 갈라낼 다른 성분이 없어요.",
  },
  judgeShow: { item: "dia" },
  done: "성분이 <b>한 가지</b>인 물질과 <b>두 가지 이상</b>인 물질로 가를 수 있어요. 앞의 것은 더 분해되지 않아요.",
};

// 캔 음료 랩의 판정 장면: 왼쪽 알루미늄 캔, 오른쪽 염화 나트륨(소금 알갱이)의 확대 원을 나란히, 원 아래에 다른 점을 한 줄씩.
// 확대 원은 반지름 72(가운데 84,106과 262,106). 알갱이 사이를 25 px로 줄여 4×4가 원 안에 다 든다
// (모서리 알갱이 바깥 끝이 가운데에서 53 + 14 = 67 px, 자르는 원 70 px. 소금은 같은 이온 반지름 비 102 : 181).
const canPair = (ns: string): string => {
  const L = { x: 84, y: 106 };
  const R = { x: 262, y: 106 };
  const loupe = (c: { x: number; y: number }, id: string, art: string): string =>
    `<clipPath id="${ns}-${id}"><circle cx="${c.x}" cy="${c.y}" r="70"/></clipPath><circle cx="${c.x}" cy="${c.y}" r="72" fill="rgba(10,17,28,.6)" stroke="#2B3F5C" stroke-width="3"/><g clip-path="url(#${ns}-${id})" class="g2u4x-pop">${art}</g>`;
  return (
    loupe(L, "lpa", grid("Al", 11.5 / 14, 25, 4, 4, L.x, L.y)) +
    loupe(R, "lpb", salt(R.x, R.y, 25)) +
    txt(L.x, 24, "알루미늄 캔", { size: 13.5, fill: "#fff", weight: 800 }) +
    txt(R.x, 24, "염화 나트륨(소금 알갱이)", { size: 13.5, fill: "#fff", weight: 800 }) +
    txt(L.x, 197, "전하 없음", { size: 13.5, fill: "#C6D3E6", weight: 800 }) +
    txt(R.x, 197, "+, − 번갈아", { size: 13.5, fill: "#FFE58A", weight: 800 })
  );
};

const CAN: Config = {
  cls: "g2u4x-can",
  wait: "네 물질을 모두 갈라 보세요",
  first: "캔 음료 속 물질을 하나 골라 <b>확대</b>해 보세요. 어떤 입자로 이루어져 있나요?",
  listTitle: "이루는 성분",
  bins: [
    { key: "atom", label: "원자" },
    { key: "mol", label: "분자" },
    { key: "ion", label: "이온" },
  ],
  items: [
    { key: "al", name: "알루미늄 캔", art: grid("Al", 1, 30), comps: [["Al", "알루미늄"]], bin: "atom", hint: "같은 원자가 낱개로 가지런히 늘어서 있어요" },
    { key: "water", name: "물", art: water(74, 80, 0.4) + water(136, 76, 2.2) + water(100, 122, 4.2) + water(150, 138, 1.0) + water(72, 162, 5.4), comps: [["H", "수소"], ["O", "산소"]], bin: "mol", hint: "원자 셋이 결합한 덩이가 따로따로 떨어져 있어요" },
    {
      key: "salt",
      name: "염화 나트륨",
      title: "염화 나트륨(소금 알갱이)",
      art: salt(),
      comps: [["Na", "나트륨"], ["Cl", "염소"]],
      bin: "ion",
      hint: "입자마다 (+)와 (−) 전하를 띠고 있어요",
    },
    { key: "fru", name: "과당", art: fructose(82, 84, -0.3) + fructose(136, 150, 0.25), comps: [["C", "탄소"], ["H", "수소"], ["O", "산소"]], bin: "mol", hint: "여러 원자가 결합한 덩이가 따로 떨어져 있어요" },
  ],
  askBin: "이 물질을 이루는 입자는 무엇인가요? 아래에서 골라 보세요.",
  judge: {
    q: "알루미늄 캔과 염화 나트륨은 입자가 가지런해요. <b>다른 점</b>은?",
    choices: [{ t: "염화 나트륨의 입자는 전하를 띤다", ok: true }, { t: "염화 나트륨의 입자는 한 종류다" }, { t: "알루미늄의 입자는 전하를 띤다" }],
    why: "염화 나트륨은 <b>양이온과 음이온</b>이 번갈아 놓여 있어요.",
  },
  judgeShow: { art: canPair },
  done: "물질을 이루는 입자는 <b>원자</b>, <b>분자</b>, <b>이온</b>으로 존재해요.",
};

const make =
  (cfg: Config): StepRenderer =>
  (host, step, api) => {
    const s = step as unknown as G4Step;
    const lab = g4Lab(host, api, s, { steps: cfg.items.length, cls: cfg.cls, wait: cfg.wait });
    const { f } = lab;
    const stage = g4Svg(lab, "확대해 본 물질의 입자 모형");
    let cur: Item | null = null;
    const doneKeys = new Set<string>();

    const draw = (): void => {
      if (!cur) {
        stage.set(`<circle cx="${CX}" cy="${CY}" r="88" fill="rgba(10,17,28,.6)" stroke="#2B3F5C" stroke-width="3"/>${txt(CX, CY + 5, "물질을 골라 보세요", { size: 13.5 })}`);
        return;
      }
      const list = cur.comps.map(([sym, name], i) => ball(232, 84 + i * 30, sym, { k: 0.72, label: false }) + txt(250, 89 + i * 30, name, { anchor: "start", size: 14, fill: "#E8EEF9" })).join("");
      stage.set(`
        <defs><clipPath id="${stage.ns}-loupe"><circle cx="${CX}" cy="${CY}" r="86"/></clipPath></defs>
        <circle cx="${CX}" cy="${CY}" r="88" fill="rgba(10,17,28,.6)" stroke="#2B3F5C" stroke-width="3"/>
        <g clip-path="url(#${stage.ns}-loupe)" class="g2u4x-pop">${cur.art}</g>
        ${txt(108, 20, cur.title ?? cur.name, { size: 14, fill: "#fff", weight: 800 })}
        ${txt(222, 58, cfg.listTitle, { anchor: "start", size: 12.5, fill: "#8CA2C0" })}${list}
      `);
    };
    /** 판정이 뜰 때 무대를 질문이 가리키는 것으로 바꾼다. */
    const showJudge = (): void => {
      lab.f.stage.querySelector(".g2u4x-toast")?.remove(); // 마지막으로 가른 물질의 알림이 판정 장면을 가리지 않게
      const js = cfg.judgeShow;
      if ("item" in js) {
        cur = cfg.items.find((it) => it.key === js.item) ?? null;
        draw();
      } else stage.set(js.art(stage.ns));
      host.dataset.g4View = "judge";
    };

    const chips = cfg.items.map((it) => {
      const b = el("button", { class: "g2u4x-chipbtn", text: it.name, attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.k = it.key;
      b.addEventListener("click", () => {
        if (doneKeys.has(it.key)) return;
        tap();
        cur = it;
        chips.forEach((c) => c.classList.toggle("on", c === b));
        bins.forEach((x) => (x.disabled = false));
        draw();
        f.say(cfg.askBin);
        host.dataset.g4Cur = it.key;
      });
      return b;
    });
    const bins = cfg.bins.map((bn) => {
      const b = el("button", { class: "bv-btn main g2u4x-bin", text: bn.label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.k = bn.key;
      if (import.meta.env.DEV) b.dataset.bin = bn.key;
      b.disabled = true;
      b.addEventListener("click", () => {
        if (!cur) return;
        if (cur.bin !== bn.key) {
          bad();
          lab.slip();
          toast(lab, "다시 살펴보세요", true);
          f.say(`${cur.hint}.`);
          host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
          return;
        }
        good();
        doneKeys.add(cur.key);
        const chip = chips.find((c) => c.dataset.k === cur?.key);
        chip?.classList.remove("on");
        chip?.classList.add("done");
        if (chip) chip.disabled = true;
        f.pips(doneKeys.size);
        toast(lab, `${cur.name}: ${bn.label}`);
        bins.forEach((x) => (x.disabled = true));
        host.dataset.g4Done = String(doneKeys.size);
        if (doneKeys.size < cfg.items.length) {
          f.say(`맞아요. <b>${cur.name}</b>: ${bn.label}. 다음 물질을 골라 보세요.`);
          cur = null;
          return;
        }
        lab.tm.later(() => {
          showJudge();
          lab.judge(cfg.judge.q, cfg.judge.choices, cfg.judge.why, () => lab.finish(cfg.done));
        }, 900);
      });
      return b;
    });
    const chipBox = el("div", { class: "g2u4x-chipgrid" }, ...chips);
    if (import.meta.env.DEV) chips.forEach((c, i) => (c.dataset.bin = cfg.items[i].bin));
    f.slot.setControls(chipBox, row(...bins));
    draw();
    f.say(cfg.first);
    return lab.cleanup;
  };

export const g2u4SortLab = make(SORT);
export const g2u4CanLab = make(CAN);
