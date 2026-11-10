// [중1 Ⅱ v5] u2l4 cellFitLab: 「세포마다 왜 모양이 다를까?」
// 한 통찰: 세포는 맡은 일에 알맞은 모양을 하고 있다. 일이 다르면 알맞은 모양도 다르다.
// 무대: 일 세 가지를 차례로 맡긴다. 세 세포(신경세포, 적혈구, 상피세포) 가운데 아무에게나 맡길 수 있고,
//   알맞지 않은 모양이면 실패가 무대에서 그대로 보인다(만약 이 세포에게 맡긴다면, 이라는 모형이다).
//   일 1 먼 곳까지 신호 보내기: 신경세포는 길게 뻗어 닿는다. 적혈구와 상피세포는 닿지 않는다.
//   일 2 좁은 혈관으로 산소 나르기: 적혈구는 지나간다. 신경세포와 상피세포는 좁은 곳에 걸린다.
//   일 3 몸의 표면 빈틈없이 덮기(위에서 내려다본 그림): 상피세포는 맞닿아 덮는다. 적혈구는 사이에 틈이, 신경세포는 빈 곳이 남아 세균이 든다.
// 조작: 조작 칸의 세포 카드 셋. 맞는 세포가 해내면 "다음 일 맡기기"가 뜬다(틀린 세포도 얼마든지 맡겨 볼 수 있다).
// 세 일을 마치면 무대가 세 일의 결과를 한 장으로 모으고, 판정(채점): 세포의 모양이 서로 다른 까닭.
// 과학 가드: 세 세포는 한 몸 안의 세포다. 신경세포 하나가 머리에서 발끝까지 잇는 것은 아니므로(중간에 갈아탄다)
//   일 1의 양 끝은 '보내는 곳'과 '받는 곳'으로만 부른다. 크기 비는 도해 수준(적혈구가 가장 작다).
// 움직임은 CSS 키프레임과 타이머. 맡길 때마다 등장 세포를 새로 그려 넣어 애니메이션이 처음부터 돈다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvRand, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "./b6Lab";

interface CftStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Cell = "nerve" | "rbc" | "epi";
const CELLS: Cell[] = ["nerve", "rbc", "epi"];
const NAME: Record<Cell, string> = { nerve: "신경세포", rbc: "적혈구", epi: "상피세포" };
const SHAPE: Record<Cell, string> = { nerve: "가늘고 긴 모양", rbc: "작고 둥근 원반", epi: "납작한 모양" };
const THUMB: Record<Cell, string> = { nerve: "bio3/figs/cell-nerve.webp", rbc: "bio3/figs/cell-rbc.webp", epi: "bio6/levels/epi-cell.webp" };

// 무대 그림의 색(카드 그림과 같은 계열)
const C = {
  nerve: "#F6B26B", nerveEdge: "#B86A1E",
  rbc: "#E5484D", rbcEdge: "#A01B24", rbcDim: "#B3262E",
  epi: "#F7B8C8", epiEdge: "#C75C80",
  nuc: "#7048E8",
  signal: "#FFE066",
  oxy: "#74C0FC",
  germ: "#94D82D", germEdge: "#4F8A10",
};

interface Job {
  pill: string;
  right: Cell;
  start: string;
  ok: string;
  okCap: string;
  fail: Partial<Record<Cell, { say: string; cap: string }>>;
}
const JOBS: Job[] = [
  {
    pill: "먼 곳까지 신호 보내기",
    right: "nerve",
    start: "<b>먼 곳까지 신호</b>를 보내야 해요. 어느 세포에게 맡길지 아래에서 골라 보세요.",
    ok: "신경세포는 <b>가늘고 길어서</b> 신호를 먼 곳까지 전달해요. 1 m쯤 되는 것도 있어요.",
    okCap: "신호가 끝까지 전해졌어요",
    fail: {
      rbc: { say: "적혈구는 작고 둥글어서 받는 곳까지 <b>닿지 않아요</b>. 다른 세포에게 맡겨 봐요.", cap: "받는 곳까지 닿지 않아요" },
      epi: { say: "상피세포는 납작한 조각이라 받는 곳까지 <b>닿지 않아요</b>. 다른 세포에게 맡겨 봐요.", cap: "받는 곳까지 닿지 않아요" },
    },
  },
  {
    pill: "좁은 혈관으로 산소 나르기",
    right: "rbc",
    start: "이번에는 <b>좁은 혈관</b>을 지나 온몸에 산소를 날라야 해요. 어느 세포가 해낼까요?",
    ok: "적혈구는 <b>작고 둥근 원반</b> 모양이라 좁은 혈관도 지나며 산소를 날라요.",
    okCap: "좁은 혈관을 지나갔어요",
    fail: {
      nerve: { say: "신경세포는 길게 뻗어 있어 좁은 혈관에 <b>걸려요</b>. 다른 세포에게 맡겨 봐요.", cap: "좁은 곳에 걸렸어요" },
      epi: { say: "상피세포는 넓적해서 좁은 혈관에 <b>걸려요</b>. 다른 세포에게 맡겨 봐요.", cap: "좁은 곳에 걸렸어요" },
    },
  },
  {
    pill: "몸의 표면 빈틈없이 덮기",
    right: "epi",
    start: "마지막 일이에요. 세균이 들어오지 못하게 몸의 <b>표면을 빈틈없이</b> 덮어야 해요.",
    ok: "상피세포는 <b>납작하고 편평해서</b> 서로 맞닿아 표면을 빈틈없이 덮어요.",
    okCap: "빈틈이 없어 세균이 못 들어와요",
    fail: {
      nerve: { say: "신경세포는 가늘어서 덮지 못한 곳이 많아요. 그 사이로 <b>세균이 들어와요</b>.", cap: "빈 곳으로 세균이 들어와요" },
      rbc: { say: "적혈구는 둥글어서 사이사이에 틈이 생겨요. 그 틈으로 <b>세균이 들어와요</b>.", cap: "틈으로 세균이 들어와요" },
    },
  },
];

const f1 = (v: number): string => v.toFixed(1);
/** 자리(바깥 g의 transform)와 움직임(안쪽 g의 CSS)을 나눈다. SVG에 CSS transform을 걸면 transform 속성이 무시되기 때문이다. */
const at = (x: number, y: number, cls: string, inner: string, style = ""): string =>
  `<g transform="translate(${f1(x)} ${f1(y)})"><g class="${cls}"${style ? ` style="${style}"` : ""}>${inner}</g></g>`;

// ── 세포 그림(원점 기준) ─────────────────────────────────────────────
const disc = (r: number): string =>
  `<circle r="${r}" fill="${C.rbc}" stroke="${C.rbcEdge}" stroke-width="1.5"/><ellipse rx="${f1(r * 0.48)}" ry="${f1(r * 0.42)}" fill="${C.rbcDim}" opacity=".75"/><path d="M${f1(-r * 0.62)} ${f1(-r * 0.36)}A${f1(r * 0.74)} ${f1(r * 0.74)} 0 0 1 ${f1(-r * 0.1)} ${f1(-r * 0.72)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`;
const tile = (w: number, h: number): string => {
  const a = w / 2;
  const b = h / 2;
  return `<path d="M${f1(-a)} ${f1(-b * 0.7)}L${f1(-a * 0.2)} ${f1(-b)}L${f1(a)} ${f1(-b * 0.66)}L${f1(a * 0.92)} ${f1(b * 0.74)}L${f1(a * 0.1)} ${f1(b)}L${f1(-a * 0.9)} ${f1(b * 0.7)}Z" fill="${C.epi}" stroke="${C.epiEdge}" stroke-width="1.6" stroke-linejoin="round"/><ellipse rx="${f1(Math.min(a, b) * 0.36)}" ry="${f1(Math.min(a, b) * 0.3)}" fill="${C.nuc}" opacity=".9"/>`;
};
/** 신경세포의 몸(가지돌기가 난 세포체). 축삭은 장면마다 따로 그린다. */
const soma = (r: number): string =>
  `<path d="M0 0l${f1(-r * 1.25)} ${f1(-r * 1.2)}M0 0l${f1(-r * 1.6)} ${f1(r * 0.1)}M0 0l${f1(-r * 1.1)} ${f1(r * 1.25)}M0 0l${f1(r * 0.3)} ${f1(-r * 1.55)}M0 0l${f1(r * 0.2)} ${f1(r * 1.55)}" fill="none" stroke="${C.nerveEdge}" stroke-width="2.6" stroke-linecap="round"/><circle r="${r}" fill="${C.nerve}" stroke="${C.nerveEdge}" stroke-width="1.6"/><circle r="${f1(r * 0.38)}" fill="${C.nuc}"/>`;

// ── 장면 0: 먼 곳까지 신호 보내기 ───────────────────────────────────
const Y0 = 114;
const node = (x: number, key: string, name: string, icon: string): string => `
  <g class="cft-node" data-n="${key}">
    <circle class="cft-node-ring" cx="${x}" cy="${Y0}" r="31" fill="none" stroke="${C.signal}" stroke-width="3"/>
    <circle cx="${x}" cy="${Y0}" r="26" fill="#22375C" stroke="#4A6491" stroke-width="1.5"/>
    <g transform="translate(${x} ${Y0})">${icon}</g>
    <text x="${x}" y="${Y0 + 47}" text-anchor="middle" font-size="13" font-weight="800" fill="#E8EEF9">${name}</text>
  </g>`;
const ICON_SEND = `<circle r="4.6" fill="${C.signal}"/><path d="M-9 -8a12 12 0 0 0 0 16M9 -8a12 12 0 0 1 0 16M-14.5 -12.5a19 19 0 0 0 0 25M14.5 -12.5a19 19 0 0 1 0 25" fill="none" stroke="${C.signal}" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>`;
const ICON_GET = `<circle r="13" fill="none" stroke="#9FB3D1" stroke-width="2.2"/><circle r="7" fill="none" stroke="#9FB3D1" stroke-width="2.2"/><circle r="2.6" fill="#E8EEF9"/>`;
const SCENE0 = `
  <path d="M72 ${Y0}H274" stroke="#3A5380" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>
  <path d="M72 70H274M72 65v10M274 65v10" fill="none" stroke="#6F86AE" stroke-width="1.4"/>
  <text x="173" y="60" text-anchor="middle" font-size="12.5" font-weight="700" fill="#C9D6EA">아주 먼 거리</text>
  ${node(42, "send", "보내는 곳", ICON_SEND)}${node(304, "get", "받는 곳", ICON_GET)}`;

function actors0(c: Cell): string {
  if (c === "nerve") {
    const pulses = [0, 1, 2].map((i) => at(0, Y0, "cft-pulse", `<circle r="5" fill="${C.signal}" stroke="#fff" stroke-width="1.2"/>`, `--d:${f1(0.75 + i * 0.5)}s`)).join("");
    return `
      <path class="cft-axon" pathLength="1" d="M100 ${Y0}H266" fill="none" stroke="${C.nerve}" stroke-width="7" stroke-linecap="round"/>
      <path class="cft-axon-end" d="M266 ${Y0}l12 -10M266 ${Y0}h14M266 ${Y0}l12 10" fill="none" stroke="${C.nerve}" stroke-width="3.4" stroke-linecap="round"/>
      ${at(88, Y0, "cft-pop", soma(14))}
      ${pulses}`;
  }
  const body = c === "rbc" ? at(96, Y0, "cft-pop", disc(13)) : at(102, Y0, "cft-pop", tile(42, 30));
  const end = c === "rbc" ? 109 : 123;
  return `
    ${body}
    ${at(0, Y0, "cft-fizz", `<circle r="5" fill="${C.signal}" stroke="#fff" stroke-width="1.2"/>`)}
    <g class="cft-gap">
      <path d="M${end + 12} ${Y0 - 9}l14 18M${end + 26} ${Y0 - 9}l-14 18" stroke="#FF8787" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M${end + 40} ${Y0}H274" stroke="#FF8787" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round" opacity=".85"/>
    </g>`;
}

// ── 장면 1: 좁은 혈관으로 산소 나르기 ───────────────────────────────
/** 혈관: 넓은 곳(높이 88)에서 좁은 곳(높이 26)으로 줄었다가 다시 넓어진다. */
const Y1 = 122;
const VESSEL_TOP = `M8 ${Y1 - 44}H104C122 ${Y1 - 44} 122 ${Y1 - 13} 140 ${Y1 - 13}H206C224 ${Y1 - 13} 224 ${Y1 - 44} 242 ${Y1 - 44}H338`;
const VESSEL_BOT = `H242C224 ${Y1 + 44} 224 ${Y1 + 13} 206 ${Y1 + 13}H140C122 ${Y1 + 13} 122 ${Y1 + 44} 104 ${Y1 + 44}H8`;
const SCENE1 = `
  <path d="${VESSEL_TOP}V${Y1 + 44}${VESSEL_BOT}Z" fill="#4A1826"/>
  <path d="${VESSEL_TOP}" fill="none" stroke="#F2A3A3" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M338 ${Y1 + 44}${VESSEL_BOT}" fill="none" stroke="#F2A3A3" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M142 68H204M142 63v10M204 63v10" fill="none" stroke="#9FB3D1" stroke-width="1.4"/>
  <text x="173" y="58" text-anchor="middle" font-size="12.5" font-weight="700" fill="#C9D6EA">좁은 혈관</text>
  <g opacity=".45" fill="none" stroke="#F2A3A3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M284 ${Y1 - 9}l9 9 -9 9"/><path d="M302 ${Y1 - 9}l9 9 -9 9"/>
  </g>
  <g transform="translate(284 24)"><circle r="4.4" fill="${C.oxy}" stroke="#fff" stroke-width="1"/><text x="10" y="4.5" font-size="12.5" font-weight="700" fill="#C9D6EA">산소</text></g>`;

function actors1(c: Cell): string {
  const stuck = (x: number): string => `<path class="cft-gap" d="M${x} ${Y1 - 9}l12 18M${x + 12} ${Y1 - 9}l-12 18" stroke="#FF8787" stroke-width="3.2" stroke-linecap="round"/>`;
  if (c === "rbc") {
    const oxy = `<circle cx="-4.6" cy="-3.4" r="3" fill="${C.oxy}" stroke="#fff" stroke-width=".9"/><circle cx="4.6" cy="3.8" r="3" fill="${C.oxy}" stroke="#fff" stroke-width=".9"/>`;
    return [0, 1, 2].map((i) => at(0, Y1, "cft-flow", `${disc(11)}${oxy}`, `--d:${f1(-i * 0.87)}s`)).join("");
  }
  if (c === "nerve") {
    return `${at(0, Y1, "cft-jam", `<path d="M-104 4C-76 -4 -44 7 -13 0" fill="none" stroke="${C.nerve}" stroke-width="6" stroke-linecap="round"/>${soma(14)}`, "--to:120px")}${stuck(152)}`;
  }
  return `${at(0, Y1, "cft-jam", tile(58, 54), "--to:96px")}${stuck(152)}`;
}

// ── 장면 2: 몸의 표면 빈틈없이 덮기(위에서 내려다본 그림) ───────────
const PX = 63;
const PY = 46;
const PW = 220;
const PH = 130;
const SCENE2 = `
  <rect x="${PX - 4}" y="${PY - 4}" width="${PW + 8}" height="${PH + 8}" rx="14" fill="#2A1A24" stroke="#5B3A4C" stroke-width="1.5"/>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="10" fill="#7A3B4E"/>
  <text x="${PX + PW / 2}" y="${PY + PH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#E9B9C6" class="cft-bare">덮이지 않은 표면</text>
  <g transform="translate(310 62)"><circle r="5.4" fill="${C.germ}" stroke="${C.germEdge}" stroke-width="1.3"/><text x="0" y="22" text-anchor="middle" font-size="12.5" font-weight="700" fill="#C9D6EA">세균</text></g>`;

const germ = (x: number, y: number, i: number, kind: "in" | "out"): string => `
  <g transform="translate(${f1(x)} ${f1(y)})">
    ${kind === "in" ? `<circle class="cft-breach" r="9" fill="none" stroke="#FF6B6B" stroke-width="2.2" style="--d:${f1(0.75 + i * 0.12)}s"/>` : ""}
    <g class="cft-germ ${kind}" style="--d:${f1(0.35 + i * 0.12)}s">
      <path d="M0 -8v-3M0 8v3M-8 0h-3M8 0h3M-5.7 -5.7l-2 -2M5.7 5.7l2 2M-5.7 5.7l-2 2M5.7 -5.7l2 -2" stroke="${C.germEdge}" stroke-width="1.4" stroke-linecap="round"/>
      <circle r="5.4" fill="${C.germ}" stroke="${C.germEdge}" stroke-width="1.3"/>
    </g>
  </g>`;

function actors2(c: Cell): string {
  if (c === "epi") {
    // 흔들린 격자점으로 만든 칸들. 가장자리 점은 조각의 변에 붙여 빈틈이 없다.
    const rnd = bvRand(41);
    const NX = 5;
    const NY = 3;
    const pts: [number, number][][] = [];
    for (let j = 0; j <= NY; j++) {
      const row: [number, number][] = [];
      for (let i = 0; i <= NX; i++) {
        const jx = i === 0 || i === NX ? 0 : (rnd() - 0.5) * 16;
        const jy = j === 0 || j === NY ? 0 : (rnd() - 0.5) * 14;
        row.push([PX + (PW * i) / NX + jx, PY + (PH * j) / NY + jy]);
      }
      pts.push(row);
    }
    let cells = "";
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        const q = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
        const cx = q.reduce((s, p) => s + p[0], 0) / 4;
        const cy = q.reduce((s, p) => s + p[1], 0) / 4;
        cells += `<g class="cft-lay" style="--d:${f1((i + j) * 0.05)}s"><path d="M${q.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L")}Z" fill="${C.epi}" stroke="${C.epiEdge}" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="5.4" ry="4.6" fill="${C.nuc}" opacity=".9"/></g>`;
      }
    const hits: [number, number][] = [[98, 80], [166, 124], [232, 76], [130, 146], [256, 142]];
    return `<clipPath id="cftClip"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="10"/></clipPath><g clip-path="url(#cftClip)">${cells}</g>${hits.map(([x, y], i) => germ(x, y, i, "out")).join("")}`;
  }
  if (c === "rbc") {
    let discs = "";
    const xs = [85, 129, 173, 217, 261];
    const ys = [68, 111, 154];
    ys.forEach((y, j) => xs.forEach((x, i) => (discs += `<g class="cft-lay" style="--d:${f1((i + j) * 0.05)}s"><g transform="translate(${x} ${y})">${disc(19)}</g></g>`)));
    // 원 네 개 사이의 마름모꼴 틈
    const gaps: [number, number][] = [[107, 89.5], [195, 89.5], [151, 132.5], [239, 132.5], [239, 89.5]];
    return `${discs}${gaps.map(([x, y], i) => germ(x, y, i, "in")).join("")}`;
  }
  const lines = [
    { s: [92, 72], d: "M92 72C130 60 170 94 214 78S262 72 272 86" },
    { s: [250, 114], d: "M250 114C214 128 176 106 132 124S86 120 74 110" },
    { s: [104, 156], d: "M104 156C146 144 190 168 232 154S266 156 274 164" },
  ];
  const nerves = lines.map((l, i) => `<g class="cft-lay" style="--d:${f1(i * 0.12)}s"><path d="${l.d}" fill="none" stroke="${C.nerve}" stroke-width="4.5" stroke-linecap="round"/><g transform="translate(${l.s[0]} ${l.s[1]})">${soma(9)}</g></g>`).join("");
  const gaps: [number, number][] = [[150, 96], [206, 134], [112, 136], [236, 100], [176, 62]];
  return `${nerves}${gaps.map(([x, y], i) => germ(x, y, i, "in")).join("")}`;
}

// ── 장면 3: 세 일의 결과를 한 장으로 ────────────────────────────────
function summary(): string {
  const rows: [Cell, string, string][] = [
    ["nerve", JOBS[0].pill, `<path d="M3 0H21" stroke="${C.nerve}" stroke-width="4" stroke-linecap="round"/><g transform="translate(-6 0)">${soma(7.5)}</g>`],
    ["rbc", JOBS[1].pill, disc(12)],
    ["epi", JOBS[2].pill, tile(34, 24)],
  ];
  return rows
    .map(([c, job, art], i) => {
      const y = 12 + i * 70;
      return `
      <g class="cft-row" style="--d:${f1(i * 0.12)}s">
        <rect x="10" y="${y}" width="326" height="62" rx="16" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.13)"/>
        <circle cx="44" cy="${y + 31}" r="23" fill="#22375C" stroke="#4A6491" stroke-width="1.4"/>
        <g transform="translate(44 ${y + 31})">${art}</g>
        <text x="78" y="${y + 26}" font-size="13.5" font-weight="800" fill="#EAF0FA">${job}</text>
        <text x="78" y="${y + 46}" font-size="12.5" font-weight="700" fill="#9FB3D1"><tspan fill="#63E6BE" font-weight="800">${NAME[c]}</tspan>  ${SHAPE[c]}</text>
        <circle cx="312" cy="${y + 31}" r="11" fill="#63E6BE"/><path d="M306.6 ${y + 31.4}l3.8 3.7 7 -7.6" fill="none" stroke="#06281C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
    })
    .join("");
}

const ACTORS = [actors0, actors1, actors2];
/** 결과가 드러날 때까지 걸리는 시간(ms). */
const RUN_MS: Record<string, number> = { "0ok": 1900, "0no": 1250, "1ok": 2300, "1no": 1400, "2ok": 1500, "2no": 1500 };

function stageSvg(): string {
  const pill = `<g class="cft-pill"><rect x="10" y="10" width="214" height="28" rx="14" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.16)"/><circle cx="26" cy="24" r="8.5" fill="#63E6BE"/><text class="cft-pill-n" x="26" y="28.4" text-anchor="middle" font-size="12.5" font-weight="800" fill="#06281C">1</text><text class="cft-pill-t" x="42" y="28.6" font-size="13" font-weight="800" fill="#EAF0FA"></text></g>`;
  const cap = `<g class="cft-cap"><rect class="cft-cap-bg" x="63" y="194" width="220" height="28" rx="14"/><text class="cft-cap-t" x="173" y="212.6" text-anchor="middle" font-size="13" font-weight="800"></text></g>`;
  return `<svg class="cft-svg" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="세포에게 일을 맡겨 보는 그림">
    <g class="cft-scene s0">${SCENE0}</g>
    <g class="cft-scene s1">${SCENE1}</g>
    <g class="cft-scene s2">${SCENE2}</g>
    <g class="cft-scene s3">${summary()}</g>
    <g class="cft-actors"></g>
    ${pill}${cap}
  </svg>`;
}

export const cellFitLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CftStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: JOBS.length + 1, cls: "cft-stage", qCls: "cft-q" });
  f.stage.innerHTML = stageSvg();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;
  const actors = svg.querySelector(".cft-actors") as SVGGElement;
  const pillN = svg.querySelector(".cft-pill-n") as SVGTextElement;
  const pillT = svg.querySelector(".cft-pill-t") as SVGTextElement;
  const capT = svg.querySelector(".cft-cap-t") as SVGTextElement;

  let job = 0;
  let busy = false;
  let solved = false;
  const tried = new Set<Cell>();

  const cards = {} as Record<Cell, BvCard>;
  CELLS.forEach((c) => {
    cards[c] = bvCard("cft-card col", { name: NAME[c], sub: SHAPE[c], icon: `<img src="${bvSrc(THUMB[c])}" alt="" draggable="false" />`, key: c });
  });
  const nextBtn = bvBtn("main cft-next", "다음 일 맡기기");
  nextBtn.hidden = true;

  const mark = (): void => {
    host.dataset.cftJob = String(job);
    host.dataset.cftBusy = busy ? "1" : "0";
    host.dataset.cftSolved = solved ? "1" : "0";
    host.dataset.cftTried = [...tried].join(",");
  };

  function setJob(n: number): void {
    job = n;
    solved = false;
    tried.clear();
    svg.setAttribute("class", `cft-svg job-${n}`);
    actors.innerHTML = "";
    pillN.textContent = String(n + 1);
    pillT.textContent = JOBS[n].pill;
    CELLS.forEach((c) => {
      cards[c].sub(SHAPE[c]);
      cards[c].el.classList.remove("done", "nope", "on");
      cards[c].el.disabled = false;
    });
    nextBtn.hidden = true;
    f.say(JOBS[n].start);
    mark();
  }

  function assign(c: Cell): void {
    if (busy || solved) return;
    haptic(HAPTIC.tap);
    busy = true;
    tried.add(c);
    const J = JOBS[job];
    const ok = c === J.right;
    svg.setAttribute("class", `cft-svg job-${job} run c-${c}`);
    actors.innerHTML = ACTORS[job](c);
    CELLS.forEach((x) => cards[x].on(x === c));
    f.say(`<b>${NAME[c]}</b>에게 맡겼어요. 어떻게 되는지 지켜봐요.`);
    mark();
    tm.later(() => {
      busy = false;
      svg.classList.add(ok ? "ok" : "fail");
      capT.textContent = ok ? J.okCap : (J.fail[c]?.cap ?? "");
      haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
      if (ok) {
        solved = true;
        cards[c].sub("해냈어요");
        cards[c].el.classList.add("done");
        CELLS.forEach((x) => (cards[x].el.disabled = true));
        f.say(J.ok);
        f.pips(job + 1);
        nextBtn.textContent = job < JOBS.length - 1 ? "다음 일 맡기기" : "세 가지 일 돌아보기";
        nextBtn.hidden = false;
      } else {
        cards[c].sub("알맞지 않아요");
        cards[c].el.classList.add("nope");
        cards[c].on(false);
        f.say(J.fail[c]?.say ?? "");
      }
      mark();
    }, RUN_MS[`${job}${ok ? "ok" : "no"}`]);
  }

  CELLS.forEach((c) => cards[c].el.addEventListener("click", () => assign(c)));
  nextBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (job < JOBS.length - 1) setJob(job + 1);
    else review();
  });

  function review(): void {
    job = JOBS.length;
    actors.innerHTML = "";
    svg.setAttribute("class", "cft-svg job-3");
    mark();
    f.say("세 가지 일을 해낸 세포가 저마다 달랐어요. 위 그림을 보고 까닭을 골라요.");
    f.slot.ask(
      "세 가지 일을 맡겨 보니, 세포의 모양이 서로 다른 까닭은?",
      [{ t: "맡은 일에 알맞은 모양이 달라서", ok: true }, { t: "세포마다 나이가 서로 달라서" }, { t: "모양은 하는 일과 상관없어서" }],
      (ok) => api.recordQuiz(ok),
      { why: "일마다 해낸 세포가 달랐어요. <b>모양이 그 일에 알맞아야</b> 했죠.", onNext: finish },
    );
  }

  function finish(): void {
    f.pips(JOBS.length + 1);
    f.say("세포의 모양에는 까닭이 있었어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("세포는 종류에 따라 <b>모양이 다르고</b>, 그 모양은 <b>맡은 일</b>을 하기에 알맞아요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(3, ...CELLS.map((c) => cards[c])), nextBtn);
  setJob(0);
  api.setCTA("세 가지 일을 맡겨 보세요", { enabled: false });
  return () => tm.clear();
};
