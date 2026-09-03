// matter3Figures — 중1 Ⅳ 「물질의 상태 변화」 v3 문제·개념·recap 그림(SVG)과 미니아트.
// 퀴즈용 그림은 정답 유출 가림 인자(blank/quiz)를 받고, concept·recap용은 무인자 완성본을 쓴다.
// 입자 색은 상태·온도와 무관하게 하나(M3.part) — 색이 정답의 단서가 되지 않게. aria-label은 중립(정답 유출 금지).

import { M3, stateBox, stateParticles, seededRandom, motionArcs, beakerSvg, flameSvg, burnerSvg, scaleSvg, thermoSvg } from "./matter3Kit";

const svg = (vb: string, body: string, aria = ""): string =>
  `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${aria}">${body}</svg>`;

const TXT = (x: number, y: number, t: string, size = 12, anchor = "middle", color: string = M3.sub, weight = 800): string =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}">${t}</text>`;

/** 화살표(직선) — (x1,y1)→(x2,y2), 색. */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, w = 2.6): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - 9 * Math.cos(a), hy = y2 - 9 * Math.sin(a);
  const lx = hx - 5 * Math.sin(a), ly = hy + 5 * Math.cos(a);
  const rx = hx + 5 * Math.sin(a), ry = hy - 5 * Math.cos(a);
  return `<path d="M${x1} ${y1} L${hx.toFixed(1)} ${hy.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><path d="M${x2} ${y2} L${lx.toFixed(1)} ${ly.toFixed(1)} L${rx.toFixed(1)} ${ry.toFixed(1)} Z" fill="${color}"/>`;
}

// ── L1 ──────────────────────────────────────────────────────────
/** 잉크 확산의 시간 순서(비커 3개). quiz면 순서를 섞어 (가)(나)(다)로 붙인다: (가) 조금 뒤 · (나) 처음 · (다) 한참 뒤. */
export function diffuseTimeFig(o: { quiz?: boolean } = {}): string {
  const rnd = seededRandom(5);
  const stages = [0, 0.45, 1]; // 처음·조금 뒤·한참 뒤
  const order = o.quiz ? [1, 0, 2] : [0, 1, 2];
  const labels = o.quiz ? ["(가)", "(나)", "(다)"] : ["처음", "조금 뒤", "한참 뒤"];
  const body = order.map((si, i) => {
    const k = stages[si];
    const x = 14 + i * 110;
    const dots = Array.from({ length: 22 }, () => {
      const r = rnd();
      // k=0이면 바닥 근처 뭉침, k=1이면 물 전체 고르게
      const spreadY = 14 + k * 76;
      const px = 26 + x + 4 + (k === 0 ? 20 + rnd() * 36 : rnd() * 72);
      const py = 138 - rnd() * spreadY;
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(2.2 + r * 0.8).toFixed(1)}" fill="${M3.inkBlue}" opacity="0.85"/>`;
    }).join("");
    return `${beakerSvg(x + 10, 40, 80, 104, M3.water, "dt" + i, 0.82)}${dots}${TXT(x + 50, 166, labels[i], 12, "middle", M3.ink)}`;
  }).join("");
  return svg("0 0 340 176", body, "물이 든 비커 바닥에 넣은 잉크가 퍼져 가는 세 장면");
}

/** 손 소독제 표면의 증발 입자 모형 — 액체층 위 표면 입자가 기체가 되어 날아간다. */
export function evapParticleFig(): string {
  const rnd = seededRandom(9);
  const liq = stateParticles("liquid", 40, 60, 200, 110, rnd);
  const fly = [[112, 40], [160, 30], [200, 46], [236, 24]];
  const body = `
    <rect x="30" y="20" width="220" height="150" rx="12" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
    <line x1="40" y1="118" x2="240" y2="118" stroke="#B8B0F0" stroke-width="1.4" stroke-dasharray="3 3"/>
    ${TXT(140, 36, "공기", 12, "middle", "#8B95A1")}${TXT(48, 108, "액체", 12, "start", M3.ink)}
    ${liq.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${(p.y + 16).toFixed(1)}" r="5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("")}
    ${fly.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>${arrow(x, y + 30, x, y + 10, M3.matterDeep, 2)}`).join("")}
    ${scaleSvg(260, 100, 70, "ev", "줄어듦")}
    ${TXT(295, 92, "저울", 12, "middle", M3.sub)}
    ${TXT(150, 188, "액체(손 소독제) 표면의 입자가 기체가 되어 날아가요", 12, "middle", M3.matterDeep)}
  `;
  return svg("0 0 340 196", body, "손 소독제 표면에서 입자가 공기 중으로 날아가는 증발의 입자 모형");
}

// ── L2 ──────────────────────────────────────────────────────────
/** 세 상태의 입자 배열 상자. blank면 (가) 기체 · (나) 고체 · (다) 액체 순으로 섞어 라벨을 가린다. */
export function threeStatesFig(o: { blank?: boolean } = {}): string {
  const kinds: ("solid" | "liquid" | "gas")[] = o.blank ? ["gas", "solid", "liquid"] : ["solid", "liquid", "gas"];
  const labels = o.blank ? ["(가)", "(나)", "(다)"] : ["고체", "액체", "기체"];
  const body = kinds.map((k, i) => stateBox(k, 10 + i * 110, 10, 100, 110, 11 + i, { label: labels[i] })).join("");
  return svg("0 0 340 150", body, "물질의 세 가지 상태를 입자 모형으로 나타낸 상자 세 개");
}

// ── L3 ──────────────────────────────────────────────────────────
/** 상태 변화 이름 도표 — 고체·액체·기체 상자와 여섯 화살표. blank면 이름을 ㉠~㉥으로 가린다. */
export function phaseCycleFig(o: { blank?: boolean } = {}): string {
  const names = o.blank ? ["㉠", "㉡", "㉢", "㉣", "㉤", "㉥"] : ["융해", "응고", "기화", "액화", "승화", "승화"];
  const body = `
    ${stateBox("solid", 14, 70, 84, 84, 21, { label: "고체", arcs: false })}
    ${stateBox("liquid", 128, 70, 84, 84, 22, { label: "액체", arcs: false })}
    ${stateBox("gas", 242, 70, 84, 84, 23, { label: "기체", arcs: false })}
    ${arrow(100, 98, 126, 98, M3.hot)}${TXT(113, 90, names[0], 12, "middle", M3.hot)}
    ${arrow(126, 126, 100, 126, M3.cold)}${TXT(113, 142, names[1], 12, "middle", M3.cold)}
    ${arrow(214, 98, 240, 98, M3.hot)}${TXT(227, 90, names[2], 12, "middle", M3.hot)}
    ${arrow(240, 126, 214, 126, M3.cold)}${TXT(227, 142, names[3], 12, "middle", M3.cold)}
    <path d="M56 66 C56 22 284 22 284 66" stroke="${M3.hot}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-dasharray="0"/>${arrow(283, 60, 284, 68, M3.hot)}
    ${TXT(170, 26, names[4], 12, "middle", M3.hot)}
    <path d="M284 170 C284 214 56 214 56 170" stroke="${M3.cold}" stroke-width="2.6" fill="none" stroke-linecap="round"/>${arrow(57, 176, 56, 168, M3.cold)}
    ${TXT(170, 214, names[5], 12, "middle", M3.cold)}
  `;
  return svg("0 0 340 224", body, "고체·액체·기체 사이의 여섯 가지 상태 변화 도표");
}

/** 시계 접시 실험 도해 — (가) 접시 위 얼음, (나) 접시 아랫면 물방울. 문제용(이름은 그림에 없음). */
export function dishExpFig(): string {
  const body = `
    ${burnerSvg(150, 190, 80)}${flameSvg(150, 190, 0.9, "de")}
    <rect x="104" y="118" width="92" height="64" rx="6" fill="${M3.water}" opacity="0.6"/>
    <path d="M100 70 v118 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 v-118" fill="none" stroke="${M3.glass}" stroke-width="3"/>
    <path d="M94 70 h112" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
    ${[124, 150, 176].map((x) => `<path d="M${x} 112 q6 -10 0 -18 t0 -18" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>`).join("")}
    ${[126, 148, 170].map((x) => `<path d="M${x} 72 c-4 6 -4 10 0 12 c4 -2 4 -6 0 -12 Z" fill="#9BD0F5" stroke="#5BA7E0" stroke-width="1"/>`).join("")}
    <path d="M86 68 q64 22 128 0" fill="#EAF4FB" stroke="${M3.glass}" stroke-width="3"/>
    <path d="M86 68 q64 -6 128 0" fill="none" stroke="${M3.glass}" stroke-width="2"/>
    <rect x="124" y="42" width="26" height="22" rx="5" fill="#EAF4FF" stroke="#8FC1E8" stroke-width="1.6"/>
    <rect x="154" y="46" width="22" height="18" rx="5" fill="#EAF4FF" stroke="#8FC1E8" stroke-width="1.6"/>
    ${TXT(230, 52, "(가) 얼음", 12, "start", M3.ink)}${arrow(226, 54, 180, 54, M3.matterDeep, 2)}
    ${TXT(230, 92, "(나) 물방울", 12, "start", M3.ink)}${arrow(226, 88, 176, 80, M3.matterDeep, 2)}
    ${TXT(150, 232, "뜨거운 물 위에 얼음을 담은 시계 접시", 12, "middle", M3.sub)}
  `;
  return svg("0 0 340 240", body, "뜨거운 물이 든 비커 위에 얼음을 담은 시계 접시를 올린 실험 장치");
}

// ── L4 ──────────────────────────────────────────────────────────
/** 상태 변화와 입자 배열 — 세 상자와 양방향 화살표. blank면 화살표에 (가)~(라) 라벨만 단다. */
export function arrangeChangeFig(o: { blank?: boolean } = {}): string {
  const l = o.blank ? ["(가)", "(나)", "(다)", "(라)"] : ["융해", "응고", "기화", "액화"];
  const body = `
    ${stateBox("solid", 14, 30, 84, 90, 31, { label: "고체" })}
    ${stateBox("liquid", 128, 30, 84, 90, 32, { label: "액체" })}
    ${stateBox("gas", 242, 30, 84, 90, 33, { label: "기체" })}
    ${arrow(100, 60, 126, 60, M3.hot)}${TXT(113, 52, l[0], 12, "middle", M3.hot)}
    ${arrow(126, 90, 100, 90, M3.cold)}${TXT(113, 108, l[1], 12, "middle", M3.cold)}
    ${arrow(214, 60, 240, 60, M3.hot)}${TXT(227, 52, l[2], 12, "middle", M3.hot)}
    ${arrow(240, 90, 214, 90, M3.cold)}${TXT(227, 108, l[3], 12, "middle", M3.cold)}
    ${o.blank ? "" : TXT(170, 160, "오른쪽으로 갈수록 입자 사이가 멀어지고 배열이 불규칙해져요", 12, "middle", M3.matterDeep)}
    ${TXT(170, o.blank ? 160 : 178, "입자의 종류와 개수는 그대로", 12, "middle", M3.ink)}
  `;
  return svg("0 0 340 190", body, "고체·액체·기체 사이의 상태 변화와 입자 배열의 변화");
}

/** 응고 전·후의 질량과 부피 — 저울 위 병 두 개. concept용. */
export function volumeMassFig(): string {
  const jar = (x: number, level: number, fill: string, frozen: boolean): string => `
    <rect x="${x + 2}" y="${100 - level}" width="44" height="${level}" rx="5" fill="${fill}" opacity="0.85"/>
    <rect x="${x}" y="40" width="48" height="62" rx="6" fill="none" stroke="${M3.glass}" stroke-width="2.6"/>
    <rect x="${x + 4}" y="30" width="40" height="12" rx="3" fill="#8B95A1" stroke="#5C6B7A" stroke-width="1.4"/>
    <rect x="${x - 4}" y="${98 - level}" width="56" height="4" rx="1.5" fill="${frozen ? "#3B5BDB" : "#F03E3E"}"/>
    ${frozen ? `<rect x="${x - 4}" y="46" width="56" height="4" rx="1.5" fill="#F03E3E" opacity="0.6"/>` : ""}`;
  const body = `
    ${scaleSvg(24, 106, 112, "vm1", "12.60 g")}${jar(56, 52, M3.oil, false)}
    ${TXT(80, 22, "얼리기 전(액체)", 12, "middle", M3.ink)}
    ${arrow(150, 80, 186, 80, M3.cold)}${TXT(168, 70, "응고", 12, "middle", M3.cold)}
    ${scaleSvg(204, 106, 112, "vm2", "12.60 g")}${jar(236, 46, M3.oilFrozen, true)}
    ${TXT(260, 22, "얼린 뒤(고체)", 12, "middle", M3.ink)}
    ${TXT(170, 176, "질량은 그대로, 액면(부피)은 내려갔어요", 12, "middle", M3.matterDeep)}
  `;
  return svg("0 0 340 186", body, "올리브유를 얼리기 전과 후의 저울 눈금과 액체 높이 비교");
}

// ── L5 ──────────────────────────────────────────────────────────
/** 가열 곡선(얼음 → 물 → 수증기). quiz면 (가)~(라) 구간 라벨, 아니면 융해·기화 라벨. */
export function heatCurveFig(o: { quiz?: boolean } = {}): string {
  const X0 = 46, Y0 = 16, W = 264, H = 150;
  const tMax = 10, tMin = -20, tTop = 120;
  const yOf = (T: number): number => Y0 + H - ((T - tMin) / (tTop - tMin)) * H;
  const xOf = (t: number): number => X0 + (t / tMax) * W;
  const pts = [[0, -10], [1.5, 0], [3.5, 0], [7, 100], [9, 100], [9.6, 112]].map(([t, T]) => `${xOf(t).toFixed(1)},${yOf(T).toFixed(1)}`).join(" ");
  const zones = o.quiz
    ? [["(가)", 0.75], ["(나)", 2.5], ["(다)", 5.25], ["(라)", 8]].map(([n, t]) => TXT(xOf(Number(t)), Y0 + 6, String(n), 12, "middle", M3.ink)).join("") +
      [1.5, 3.5, 7, 9].map((t) => `<line x1="${xOf(t)}" y1="${Y0 - 2}" x2="${xOf(t)}" y2="${Y0 + H}" stroke="#D9D2FF" stroke-width="1.2" stroke-dasharray="4 4"/>`).join("")
    : `${TXT(xOf(2.5), yOf(0) - 10, "얼음이 녹는 중(융해)", 12, "middle", M3.hot)}${TXT(xOf(8), yOf(100) - 10, "물이 끓는 중(기화)", 12, "middle", M3.hot)}`;
  const body = `
    <line x1="${X0}" y1="${Y0 - 4}" x2="${X0}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${X0}" y1="${Y0 + H}" x2="${X0 + W + 8}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[-20, 0, 20, 40, 60, 80, 100, 120].map((v) => `<line x1="${X0 - 4}" y1="${yOf(v)}" x2="${X0 + W}" y2="${yOf(v)}" stroke="${v === 0 || v === 100 ? "#D9D2FF" : "#EEF0F3"}" stroke-width="1"/>${[0, 40, 80, 100].includes(v) ? TXT(X0 - 8, yOf(v) + 4, String(v), 11, "end", "#8B95A1") : ""}`).join("")}
    ${TXT(14, Y0 + 2, "온도(℃)", 11, "start")}${TXT(X0 + W / 2, Y0 + H + 26, "가열 시간(분)", 12)}
    ${[0, 2, 4, 6, 8, 10].map((t) => TXT(xOf(t), Y0 + H + 14, String(t), 11, "middle", "#8B95A1")).join("")}
    ${zones}
    <polyline points="${pts}" stroke="${M3.matter}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  return svg("0 0 340 210", body, "얼음을 계속 가열할 때 시간에 따른 온도 변화 그래프");
}

/** 열에너지를 흡수하는 상태 변화의 입자 배열 — 고체 → 액체 → 기체(열 흡수 화살표). concept용. */
export function absorbArrangeFig(): string {
  const body = `
    ${stateBox("solid", 14, 34, 84, 90, 51, { label: "고체" })}
    ${stateBox("liquid", 128, 34, 84, 90, 52, { label: "액체" })}
    ${stateBox("gas", 242, 34, 84, 90, 53, { label: "기체" })}
    ${arrow(100, 78, 126, 78, M3.hot, 3)}${TXT(113, 68, "융해", 12, "middle", M3.hot)}
    ${arrow(214, 78, 240, 78, M3.hot, 3)}${TXT(227, 68, "기화", 12, "middle", M3.hot)}
    ${[40, 268].map((x) => `${flameSvg(x + 16, 28, 0.5, "aa")}`).join("")}
    ${TXT(170, 24, "열에너지 흡수", 12, "middle", M3.hot)}
    ${TXT(170, 164, "입자 운동이 활발해지고 사이가 멀어지며 배열이 불규칙해져요", 12, "middle", M3.matterDeep)}
  `;
  return svg("0 0 340 176", body, "가열할 때 고체에서 액체, 기체로 변하는 입자 배열의 변화");
}

// ── L6 ──────────────────────────────────────────────────────────
/** 냉각 곡선(수증기 → 물 → 얼음, 평평한 구간 2번). quiz면 (가)(나) 구간 라벨, 아니면 액화·응고 라벨. */
export function coolCurveFig(o: { quiz?: boolean } = {}): string {
  const X0 = 46, Y0 = 16, W = 264, H = 150;
  const tMax = 10, tMin = -20, tTop = 120;
  const yOf = (T: number): number => Y0 + H - ((T - tMin) / (tTop - tMin)) * H;
  const xOf = (t: number): number => X0 + (t / tMax) * W;
  const pts = [[0, 112], [1, 100], [3, 100], [6.5, 0], [8.5, 0], [9.6, -10]].map(([t, T]) => `${xOf(t).toFixed(1)},${yOf(T).toFixed(1)}`).join(" ");
  const zones = o.quiz
    ? [["(가)", 2], ["(나)", 7.5]].map(([n, t]) => TXT(xOf(Number(t)), Y0 + 6, String(n), 12, "middle", M3.ink)).join("") +
      [1, 3, 6.5, 8.5].map((t) => `<line x1="${xOf(t)}" y1="${Y0 - 2}" x2="${xOf(t)}" y2="${Y0 + H}" stroke="#D9D2FF" stroke-width="1.2" stroke-dasharray="4 4"/>`).join("")
    : `${TXT(xOf(2), yOf(100) - 10, "수증기가 물로(액화)", 12, "middle", M3.cold)}${TXT(xOf(7.5), yOf(0) - 10, "물이 얼음으로(응고)", 12, "middle", M3.cold)}`;
  const body = `
    <line x1="${X0}" y1="${Y0 - 4}" x2="${X0}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${X0}" y1="${Y0 + H}" x2="${X0 + W + 8}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[-20, 0, 20, 40, 60, 80, 100, 120].map((v) => `<line x1="${X0 - 4}" y1="${yOf(v)}" x2="${X0 + W}" y2="${yOf(v)}" stroke="${v === 0 || v === 100 ? "#D9D2FF" : "#EEF0F3"}" stroke-width="1"/>${[0, 40, 80, 100].includes(v) ? TXT(X0 - 8, yOf(v) + 4, String(v), 11, "end", "#8B95A1") : ""}`).join("")}
    ${TXT(14, Y0 + 2, "온도(℃)", 11, "start")}${TXT(X0 + W / 2, Y0 + H + 26, "냉각 시간(분)", 12)}
    ${[0, 2, 4, 6, 8, 10].map((t) => TXT(xOf(t), Y0 + H + 14, String(t), 11, "middle", "#8B95A1")).join("")}
    ${zones}
    <polyline points="${pts}" stroke="${M3.cold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  return svg("0 0 340 210", body, "수증기를 계속 냉각할 때 시간에 따른 온도 변화 그래프");
}

/** 열에너지를 방출하는 상태 변화의 입자 배열 — 기체 → 액체 → 고체. concept용. */
export function releaseArrangeFig(): string {
  const body = `
    ${stateBox("gas", 14, 34, 84, 90, 61, { label: "기체" })}
    ${stateBox("liquid", 128, 34, 84, 90, 62, { label: "액체" })}
    ${stateBox("solid", 242, 34, 84, 90, 63, { label: "고체" })}
    ${arrow(100, 78, 126, 78, M3.cold, 3)}${TXT(113, 68, "액화", 12, "middle", M3.cold)}
    ${arrow(214, 78, 240, 78, M3.cold, 3)}${TXT(227, 68, "응고", 12, "middle", M3.cold)}
    ${[56, 170, 284].map((x) => `<path d="M${x - 6} 18 l6 6 M${x} 12 l0 8 M${x + 6} 18 l-6 6" stroke="#74B9F0" stroke-width="2.2" stroke-linecap="round"/>`).join("")}
    ${TXT(170, 32, "열에너지 방출", 12, "middle", M3.cold)}
    ${TXT(170, 164, "입자 운동이 둔해지고 사이가 가까워지며 배열이 규칙적으로 변해요", 12, "middle", M3.matterDeep)}
  `;
  return svg("0 0 340 176", body, "냉각할 때 기체에서 액체, 고체로 변하는 입자 배열의 변화");
}

/** 아이스박스 속 얼음과 음료수 — 문제용. */
export function iceboxFig(): string {
  const body = `
    <rect x="60" y="60" width="220" height="120" rx="12" fill="#DCEBFA" stroke="#5C6B7A" stroke-width="3"/>
    <rect x="52" y="48" width="236" height="20" rx="8" fill="#9DB2C4" stroke="#5C6B7A" stroke-width="3"/>
    ${[[84, 130, 30], [124, 146, 26], [220, 140, 28], [250, 122, 24], [176, 150, 22]].map(([x, y, w]) => `<path d="M${x} ${y} l${w * 0.3} -${w * 0.6} l${w * 0.7} ${w * 0.1} l${w * 0.1} ${w * 0.5} l-${w * 0.6} ${w * 0.35} Z" fill="#F4FAFF" stroke="#8FB3D8" stroke-width="1.4"/>`).join("")}
    <rect x="150" y="84" width="34" height="80" rx="8" fill="#F06595" stroke="#A61E4D" stroke-width="2"/><rect x="156" y="76" width="22" height="12" rx="3" fill="#C2255C"/>
    ${thermoSvg(300, 70, 70, "ib", "")}
    ${TXT(170, 200, "아이스박스에 얼음과 음료수를 함께 넣었어요", 12, "middle", M3.sub)}
  `;
  return svg("0 0 340 210", body, "얼음과 음료수를 함께 넣은 아이스박스");
}

// ── recap 미니아트(64×64 플랫) ────────────────────────────────────
const MINI: Record<string, () => string> = {
  diffuse: () => svg("0 0 64 64", `<rect x="6" y="10" width="52" height="44" rx="10" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>${[[16, 44], [22, 30], [30, 46], [34, 22], [42, 36], [50, 26], [48, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${M3.inkBlue}" opacity="0.85"/>`).join("")}${arrow(18, 16, 30, 16, M3.matterDeep, 2)}`, "퍼져 나가는 잉크 입자"),
  evaporate: () => svg("0 0 64 64", `<rect x="8" y="38" width="48" height="16" rx="6" fill="${M3.water}" opacity="0.7"/>${[[20, 26], [34, 18], [46, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.2"/>`).join("")}${arrow(34, 40, 34, 30, M3.matterDeep, 2)}`, "표면에서 날아가는 입자"),
  selfMove: () => svg("0 0 64 64", `<circle cx="32" cy="32" r="7" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.6"/>${motionArcs({ x: 32, y: 32 }, 1, 7, M3.partEdge)}<path d="M32 12 v-6 M32 52 v6 M12 32 h-6 M52 32 h6" stroke="${M3.matterDeep}" stroke-width="2.2" stroke-linecap="round"/>`, "스스로 움직이는 입자"),
  solidBox: () => svg("0 0 64 64", stateBox("solid", 6, 8, 52, 48, 71, { r: 4.5, arcs: false }), "고체의 입자 배열"),
  liquidBox: () => svg("0 0 64 64", stateBox("liquid", 6, 8, 52, 48, 72, { r: 4.5, arcs: false }), "액체의 입자 배열"),
  gasBox: () => svg("0 0 64 64", stateBox("gas", 6, 8, 52, 48, 73, { r: 4.5, arcs: false }), "기체의 입자 배열"),
  meltFreeze: () => svg("0 0 64 64", `<rect x="8" y="30" width="20" height="20" rx="4" fill="#EAF4FF" stroke="#8FC1E8" stroke-width="1.6"/><path d="M36 50 a10 6 0 0 0 20 0 a10 6 0 0 0 -20 0 Z" fill="${M3.water}" opacity="0.8"/>${arrow(20, 20, 46, 20, M3.hot, 2.2)}${arrow(46, 60, 20, 60, M3.cold, 2.2)}`, "융해와 응고"),
  boilCondense: () => svg("0 0 64 64", `<path d="M8 50 a10 6 0 0 0 20 0 a10 6 0 0 0 -20 0 Z" fill="${M3.water}" opacity="0.8"/>${[36, 46, 56].map((x) => `<path d="M${x} 48 q4 -8 0 -14 t0 -12" stroke="#9DB2C4" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join("")}${arrow(20, 14, 46, 14, M3.hot, 2.2)}`, "기화와 액화"),
  sublime: () => svg("0 0 64 64", `<rect x="10" y="34" width="18" height="18" rx="4" fill="#F4FAFF" stroke="#8FB3D8" stroke-width="1.6"/>${[40, 50].map((x) => `<path d="M${x} 44 q4 -8 0 -14 t0 -12" stroke="#B8C7DA" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join("")}<path d="M22 22 C22 10 44 10 44 22" stroke="${M3.hot}" stroke-width="2.2" fill="none"/>${arrow(43, 16, 44, 24, M3.hot, 2)}<path d="M46 56 C46 66 22 66 22 56" stroke="${M3.cold}" stroke-width="2.2" fill="none"/>${arrow(23, 62, 22, 54, M3.cold, 2)}`, "승화(양방향)"),
  massSame: () => svg("0 0 64 64", `<path d="M8 40 h48" stroke="${M3.ink}" stroke-width="2.6" stroke-linecap="round"/><path d="M32 40 v14 M22 54 h20" stroke="${M3.ink}" stroke-width="2.6" stroke-linecap="round"/><rect x="10" y="26" width="16" height="12" rx="3" fill="#EAF4FF" stroke="#8FC1E8" stroke-width="1.4"/><path d="M38 38 a8 5 0 0 0 16 0 a8 5 0 0 0 -16 0 Z" fill="${M3.water}" opacity="0.8"/><path d="M28 14 h8 M28 20 h8" stroke="${M3.ok}" stroke-width="2.6" stroke-linecap="round"/>`, "질량은 그대로"),
  volumeChange: () => svg("0 0 64 64", `${stateBox("liquid", 4, 18, 26, 30, 74, { r: 3.5, arcs: false })}${stateBox("gas", 34, 6, 28, 46, 75, { r: 3.5, arcs: false })}${arrow(28, 12, 34, 8, M3.hot, 2)}`, "부피는 변한다"),
  waterIce: () => svg("0 0 64 64", `<rect x="10" y="12" width="20" height="40" rx="4" fill="none" stroke="#7FA6C8" stroke-width="2"/><rect x="12" y="24" width="16" height="26" rx="3" fill="${M3.water}" opacity="0.7"/><path d="M36 12 q-6 20 0 40 q10 0 20 0 q6 -20 0 -40 Z" fill="#EAF4FF" stroke="#7FA6C8" stroke-width="2"/><path d="M40 20 l4 3 M48 30 l-4 4" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>`, "물은 얼면 부피가 커진다"),
  absorbHeat: () => svg("0 0 64 64", `<rect x="14" y="20" width="36" height="30" rx="6" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>${[24, 32, 40].map((x) => `<circle cx="${x}" cy="35" r="4" fill="${M3.part}"/>`).join("")}${flameSvg(32, 62, 0.4, "mi")}${arrow(32, 58, 32, 50, M3.hot, 2)}`, "열에너지 흡수"),
  flatCurve: () => svg("0 0 64 64", `<path d="M8 52 h48 M8 52 v-40" stroke="#A9B6A9" stroke-width="2"/><polyline points="10,46 20,34 34,34 46,18 54,18" stroke="${M3.matter}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, "온도 일정 구간"),
  meltBoil: () => svg("0 0 64 64", `<rect x="8" y="30" width="16" height="16" rx="4" fill="#EAF4FF" stroke="#8FC1E8" stroke-width="1.6"/><path d="M28 46 a8 5 0 0 0 16 0 a8 5 0 0 0 -16 0 Z" fill="${M3.water}" opacity="0.8"/><path d="M52 44 q4 -8 0 -14 t0 -10" stroke="#9DB2C4" stroke-width="2.4" fill="none" stroke-linecap="round"/>${arrow(12, 18, 52, 18, M3.hot, 2.2)}`, "융해와 기화"),
  releaseHeat: () => svg("0 0 64 64", `<rect x="14" y="14" width="36" height="30" rx="6" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>${[24, 32, 40].map((x) => `<circle cx="${x}" cy="29" r="4" fill="${M3.part}"/>`).join("")}${arrow(32, 46, 32, 58, M3.cold, 2)}<path d="M20 58 l4 4 M44 58 l-4 4" stroke="#74B9F0" stroke-width="2" stroke-linecap="round"/>`, "열에너지 방출"),
  coolCurve: () => svg("0 0 64 64", `<path d="M8 52 h48 M8 52 v-40" stroke="#A9B6A9" stroke-width="2"/><polyline points="10,16 20,26 32,26 44,44 54,44" stroke="${M3.cold}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, "냉각 곡선"),
  surroundUse: () => svg("0 0 64 64", `${thermoSvg(12, 8, 30, "su")}<path d="M40 46 q5 -8 0 -14 t0 -12" stroke="#9DB2C4" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M50 30 l4 4 M54 22 l-4 4" stroke="#74B9F0" stroke-width="2" stroke-linecap="round"/>`, "주변 온도의 변화"),
};

export function m3MiniArt(key: string): string {
  const fn = MINI[key];
  return fn ? fn() : "";
}
