// heat3Figures — 중1 Ⅲ 「열」 v3 문제·개념·recap 그림(SVG)과 미니아트.
// 퀴즈용 그림은 정답 유출 가림 인자(blank)를 받고, concept·recap용은 무인자 완성본을 쓴다.
// 온도색·소품은 heat3Kit이 단일 진실 공급원. aria-label은 중립(정답 유출 금지).

import { H3, tempColor, thermoSvg, flameSvg, burnerSvg, beakerSvg, particleGrid } from "./heat3Kit";

const svg = (vb: string, body: string, aria = ""): string =>
  `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${aria}">${body}</svg>`;

const TXT = (x: number, y: number, t: string, size = 12, anchor = "middle", color: string = H3.sub, weight = 800): string =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}">${t}</text>`;

/** 입자 상자(정적) — 상자 (x, y, w, h), 활발도 level 0~1(간격·흔들림 호·색이 함께 커진다). */
export function particleBox(x: number, y: number, w: number, h: number, level: number, o: { label?: string; cols?: number; rows?: number; r?: number } = {}): string {
  const cols = o.cols ?? 4;
  const rows = o.rows ?? 3;
  const r = o.r ?? 5;
  const gap = Math.min((w - 24) / (cols - 1), (h - 24) / (rows - 1)) * (0.78 + 0.22 * level);
  const pts = particleGrid(cols, rows, x + w / 2, y + h / 2, gap);
  const col = tempColor(0.12 + 0.76 * level);
  const arcs = pts
    .map(({ x: px, y: py }) => {
      if (level < 0.12) return "";
      const d = r + 2.5 + level * 3;
      const len = 3 + level * 6;
      const op = 0.35 + level * 0.55;
      const one = `<path d="M${(px - d).toFixed(1)} ${(py - len / 2).toFixed(1)} q${(-2 - level * 2).toFixed(1)} ${(len / 2).toFixed(1)} 0 ${len.toFixed(1)}" stroke="${col}" stroke-width="1.8" stroke-linecap="round" opacity="${op.toFixed(2)}"/>` +
        `<path d="M${(px + d).toFixed(1)} ${(py - len / 2).toFixed(1)} q${(2 + level * 2).toFixed(1)} ${(len / 2).toFixed(1)} 0 ${len.toFixed(1)}" stroke="${col}" stroke-width="1.8" stroke-linecap="round" opacity="${op.toFixed(2)}"/>`;
      const two = level > 0.6
        ? `<path d="M${(px - len / 2).toFixed(1)} ${(py - d).toFixed(1)} q${(len / 2).toFixed(1)} ${(-2 - level * 2).toFixed(1)} ${len.toFixed(1)} 0" stroke="${col}" stroke-width="1.6" stroke-linecap="round" opacity="${(op * 0.8).toFixed(2)}"/>` +
          `<path d="M${(px - len / 2).toFixed(1)} ${(py + d).toFixed(1)} q${(len / 2).toFixed(1)} ${(2 + level * 2).toFixed(1)} ${len.toFixed(1)} 0" stroke="${col}" stroke-width="1.6" stroke-linecap="round" opacity="${(op * 0.8).toFixed(2)}"/>`
        : "";
      return one + two;
    })
    .join("");
  const dots = pts.map(({ x: px, y: py }) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="${col}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("");
  const label = o.label ? TXT(x + w / 2, y + h + 16, o.label, 12, "middle", H3.ink) : "";
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#F4F8FC" stroke="#C9D3DE" stroke-width="2"/>
    ${arcs}${dots}${label}
  </g>`;
}

// ── L1 ──────────────────────────────────────────────────────────
/** 온도가 다른 세 물의 입자 운동 모형(가)(나)(다). levels 순서를 바꿔 문항마다 다르게 쓴다. */
export function particleTrioFig(o: { levels?: [number, number, number]; labels?: [string, string, string] } = {}): string {
  const lv = o.levels ?? [0.55, 0.12, 0.95];
  const lb = o.labels ?? ["(가)", "(나)", "(다)"];
  const body = lv.map((l, i) => particleBox(10 + i * 110, 10, 100, 96, l, { label: lb[i] })).join("");
  return svg("0 0 340 136", body, "온도가 다른 세 물의 입자 운동 모형");
}

/** 가열·냉각 화살표 도해 — 찬물(둔함) ↔ 뜨거운 물(활발). concept·recap용. */
export function heatCoolFig(): string {
  const body = `
    ${particleBox(12, 14, 130, 100, 0.15, { label: "온도가 낮은 물" })}
    ${particleBox(198, 14, 130, 100, 0.92, { label: "온도가 높은 물" })}
    <path d="M150 48 h34 M178 42 l8 6 -8 6 Z" stroke="${H3.hot}" stroke-width="3" fill="${H3.hot}" stroke-linecap="round"/>
    ${TXT(167, 36, "가열", 11, "middle", H3.hot)}
    <path d="M190 84 h-34 M162 78 l-8 6 8 6 Z" stroke="${H3.cold}" stroke-width="3" fill="${H3.cold}" stroke-linecap="round"/>
    ${TXT(173, 104, "냉각", 11, "middle", H3.cold)}
  `;
  return svg("0 0 340 140", body, "가열하면 입자 운동이 활발해지고 냉각하면 둔해지는 도해");
}

// ── L2 ──────────────────────────────────────────────────────────
/** 열의 이동과 입자 운동(처음 → 시간이 흐른 후 → 열평형). concept용. */
export function heatFlowFig(): string {
  const body = `
    ${TXT(80, 16, "처음", 12, "middle", H3.ink)}
    ${particleBox(14, 24, 120, 84, 0.95)}
    ${particleBox(206, 24, 120, 84, 0.12)}
    <path d="M142 66 h50 M184 60 l10 6 -10 6 Z" stroke="${H3.heat}" stroke-width="3.4" fill="${H3.heat}" stroke-linecap="round"/>
    ${TXT(168, 56, "열", 12, "middle", H3.heat)}
    ${TXT(74, 126, "뜨거운 물", 11)}${TXT(266, 126, "찬물", 11)}
    <path d="M170 138 v18 M164 150 l6 8 6 -8" stroke="#8B95A1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${TXT(232, 152, "시간이 흐른 후", 11, "middle", "#8B95A1")}
    ${particleBox(14, 166, 120, 84, 0.5)}
    ${particleBox(206, 166, 120, 84, 0.5)}
    <rect x="142" y="196" width="56" height="22" rx="11" fill="#E6FCF5" stroke="${H3.ok}" stroke-width="2"/>
    ${TXT(170, 211, "열평형", 11, "middle", "#0A8F4E")}
    ${TXT(74, 268, "입자 운동이 처음보다 둔해져요", 10.5)}${TXT(266, 268, "입자 운동이 처음보다 활발해져요", 10.5)}
  `;
  return svg("0 0 340 280", body, "뜨거운 물과 찬물이 접촉해 열평형에 이르는 과정의 입자 모형");
}

/** 접촉한 두 물의 시간·온도 그래프. quiz면 (가)(나) 라벨·다른 수치로 그린다. */
export function contactGraphFig(o: { quiz?: boolean } = {}): string {
  const X0 = 46, Y0 = 14, W = 264, H = 150;
  const tMax = 8, tEq = o.quiz ? 4 : 5;
  const hot0 = o.quiz ? 50 : 70, cold0 = 10, teq = o.quiz ? 30 : 40;
  const yMax = o.quiz ? 60 : 80;
  const yOf = (T: number): number => Y0 + H - (T / yMax) * H;
  const xOf = (t: number): number => X0 + (t / tMax) * W;
  const tau = tEq / 3.2;
  const curve = (T0: number): string => {
    const pts: string[] = [];
    for (let t = 0; t <= tMax + 0.001; t += 0.25) {
      const T = t >= tEq ? teq : teq + (T0 - teq) * Math.exp(-t / tau) - (T0 - teq) * Math.exp(-tEq / tau) * (t / tEq);
      pts.push(`${xOf(t).toFixed(1)},${yOf(T).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += o.quiz ? 10 : 20) yTicks.push(v);
  const body = `
    <line x1="${X0}" y1="${Y0 - 4}" x2="${X0}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${X0}" y1="${Y0 + H}" x2="${X0 + W + 8}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${yTicks.map((v) => `<line x1="${X0 - 4}" y1="${yOf(v)}" x2="${X0 + W}" y2="${yOf(v)}" stroke="#E5E8EB" stroke-width="1"/>${TXT(X0 - 8, yOf(v) + 4, String(v), 10, "end", "#8B95A1")}`).join("")}
    ${Array.from({ length: tMax + 1 }, (_, t) => TXT(xOf(t), Y0 + H + 14, String(t), 10, "middle", "#8B95A1")).join("")}
    ${TXT(X0 + W / 2, Y0 + H + 30, "시간(분)", 11)}
    ${TXT(14, Y0 + 6, "온도(℃)", 10.5, "start")}
    <polyline points="${curve(hot0)}" stroke="${H3.hot}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${curve(cold0)}" stroke="${H3.cold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${TXT(xOf(0.4), yOf(hot0) - 8, o.quiz ? "(가)" : "뜨거운 물", 11, "start", H3.hot)}
    ${TXT(xOf(0.4), yOf(cold0) + 16, o.quiz ? "(나)" : "찬물", 11, "start", H3.cold)}
    ${o.quiz ? "" : `<rect x="${xOf(tEq) + 6}" y="${yOf(teq) - 24}" width="56" height="20" rx="10" fill="#E6FCF5" stroke="${H3.ok}" stroke-width="1.8"/>${TXT(xOf(tEq) + 34, yOf(teq) - 10, "열평형", 10.5, "middle", "#0A8F4E")}`}
  `;
  return svg("0 0 340 210", body, "접촉한 두 물의 시간에 따른 온도 변화 그래프");
}

// ── L3 ──────────────────────────────────────────────────────────
/** 전도 — 가열한 쪽부터 이웃 입자에 차례로 운동이 전달되는 막대. */
export function conductChainFig(): string {
  const n = 9;
  const parts = Array.from({ length: n }, (_, i) => {
    const level = Math.max(0.08, 1 - i * 0.11);
    const x = 74 + i * 28;
    const col = tempColor(0.15 + 0.8 * level);
    const d = 10 + level * 3, len = 4 + level * 8;
    const arc = level > 0.15
      ? `<path d="M${x - d} ${64 - len / 2} q-3 ${len / 2} 0 ${len} M${x + d} ${64 - len / 2} q3 ${len / 2} 0 ${len}" stroke="${col}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="${(0.3 + level * 0.6).toFixed(2)}"/>`
      : "";
    return `${arc}<circle cx="${x}" cy="64" r="7" fill="${col}" stroke="#FFFFFF" stroke-width="1.6"/>`;
  }).join("");
  const body = `
    <rect x="56" y="44" width="270" height="40" rx="8" fill="#F1F3F5" stroke="#C9D3DE" stroke-width="2"/>
    ${flameSvg(38, 92, 0.9, "cc")}
    ${burnerSvg(38, 92, 40)}
    ${parts}
    <path d="M70 108 h230 M292 102 l10 6 -10 6 Z" stroke="${H3.heat}" stroke-width="2.6" fill="${H3.heat}" stroke-linecap="round"/>
    ${TXT(186, 126, "열의 이동 방향(입자는 제자리)", 11, "middle", H3.heat)}
  `;
  return svg("0 0 340 136", body, "고체 막대의 한쪽을 가열할 때 입자 운동이 차례로 전달되는 전도 모형");
}

/** 열화상 카메라로 본 세 막대(구리·철·유리) — blank면 (가)(나)(다). */
export function rodsThermalFig(o: { blank?: boolean } = {}): string {
  // 문제(blank)에서는 구리를 두 번째 줄에 둔다(라벨형 보기 "첫 칸 정답" 회피 관행).
  const rods: [string, number][] = o.blank
    ? [["철 막대", 0.5], ["구리 막대", 0.86], ["유리 막대", 0.14]]
    : [["구리 막대", 0.86], ["철 막대", 0.5], ["유리 막대", 0.14]];
  const labels = o.blank ? ["(가)", "(나)", "(다)"] : rods.map((r) => r[0]);
  const body = `
    <rect x="0" y="0" width="340" height="176" rx="16" fill="#101A33"/>
    <defs>
      <linearGradient id="h3rodHot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#F03E3E"/><stop offset="0.55" stop-color="#FF922B"/><stop offset="1" stop-color="#FFE066"/>
      </linearGradient>
    </defs>
    ${flameSvg(44, 150, 1.1, "rt")}
    ${rods.map(([, k], i) => {
      const y = 30 + i * 44;
      return `<rect x="66" y="${y}" width="250" height="20" rx="6" fill="#3B5BDB"/>
        <rect x="66" y="${y}" width="${(250 * k).toFixed(0)}" height="20" rx="6" fill="url(#h3rodHot)"/>
        ${TXT(316, y + 34, labels[i], 11, "end", "#DCE8F5")}`;
    }).join("")}
    ${TXT(14, 168, "열화상 카메라 화면(빨강일수록 뜨거움)", 10, "start", "#8FA3C8")}
  `;
  return svg("0 0 340 176", body, "가열 장치로 한쪽 끝을 가열한 세 막대를 열화상 카메라로 본 모습");
}

/** 대류 — 냄비 속 물이 순환하는 도해. */
export function convectionPotFig(): string {
  const body = `
    ${burnerSvg(170, 150, 90)}
    ${flameSvg(150, 150, 0.8, "cv")}${flameSvg(190, 150, 0.8, "cv")}
    <path d="M78 40 v96 a12 12 0 0 0 12 12 h160 a12 12 0 0 0 12 -12 v-96" fill="#DCEEFB" stroke="#5C6B7A" stroke-width="3.2"/>
    <path d="M66 40 h208" stroke="#5C6B7A" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M170 132 c-30 -14 -46 -50 -40 -78 M130 54 l-6 12 12 -2" stroke="${H3.hot}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M170 132 c30 -14 46 -50 40 -78 M210 54 l6 12 -12 -2" stroke="${H3.hot}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M104 62 c-14 30 -8 56 30 68 M134 130 l-14 -2 8 -10" stroke="${H3.cold}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M236 62 c14 30 8 56 -30 68 M206 130 l14 -2 -8 -10" stroke="${H3.cold}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${TXT(170, 30, "뜨거워진 물은 위로, 위의 물은 아래로", 11, "middle", H3.ink)}
  `;
  return svg("0 0 340 176", body, "냄비 아래를 가열할 때 물이 순환하는 대류 도해");
}

/** 복사 — 난로에서 사람에게 열이 직접 이동. blocked면 판이 가로막는다. */
export function radiationFig(o: { blocked?: boolean } = {}): string {
  const rays = [40, 60, 80, 100, 120].map((y) =>
    `<path d="M92 ${y} q14 -5 28 0 t28 0 t28 0 t28 0 t28 0" stroke="${H3.warm}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${o.blocked ? 0.35 : 0.85}"/>`).join("");
  const body = `
    <rect x="36" y="30" width="48" height="110" rx="10" fill="#4E5968"/>
    <rect x="44" y="40" width="32" height="90" rx="6" fill="${H3.hot}"/>
    <path d="M52 52 v66 M60 48 v74 M68 52 v66" stroke="#FFE066" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    ${rays}
    ${o.blocked ? `<rect x="182" y="26" width="10" height="122" rx="3" fill="${H3.wood}" stroke="#8A5A30" stroke-width="2"/>` : ""}
    <circle cx="272" cy="52" r="14" fill="#FFFFFF" stroke="${H3.ink}" stroke-width="2.6"/>
    <path d="M272 66 v46 M272 82 l-20 18 M272 82 l20 18 M272 112 l-16 30 M272 112 l16 30" stroke="${H3.ink}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <circle cx="267" cy="50" r="1.6" fill="${H3.ink}"/><circle cx="277" cy="50" r="1.6" fill="${H3.ink}"/>
    ${TXT(170, 166, o.blocked ? "판이 가로막으면 따뜻함이 바로 줄어요" : "물질을 통하지 않고 열이 직접 도착해요", 11, "middle", H3.ink)}
  `;
  return svg("0 0 340 176", body, o.blocked ? "난로와 사람 사이를 판이 가로막은 모습" : "난로에서 사람에게 열이 직접 이동하는 복사 도해");
}

/** 온돌 단면 — ①구들장 ②방 공기 ③바닥에서 사람. 문제용(방식 이름은 그림에 없음). */
export function ondolFig(): string {
  const body = `
    <rect x="0" y="120" width="340" height="50" fill="#D9B678"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${52 + i * 40}" y="122" width="36" height="14" rx="3" fill="#8B95A1" stroke="#5C6B7A" stroke-width="1.6"/>`).join("")}
    <rect x="52" y="112" width="280" height="10" fill="#E8CFAA" stroke="#A9885A" stroke-width="2"/>
    <rect x="8" y="112" width="40" height="52" rx="6" fill="#4E5968"/>
    ${flameSvg(28, 158, 0.9, "od")}
    <rect x="52" y="28" width="280" height="84" fill="#F8F9FA" stroke="#C9D3DE" stroke-width="2"/>
    <path d="M110 104 c-18 -20 -10 -50 18 -60 M124 46 l6 -6 -14 -2" stroke="${H3.hot}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M250 44 c18 20 10 50 -18 60 M236 102 l-6 6 14 2" stroke="${H3.cold}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M160 108 q6 -8 0 -16 M176 108 q6 -8 0 -16 M192 108 q6 -8 0 -16" stroke="${H3.warm}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="290" cy="80" r="10" fill="#FFFFFF" stroke="${H3.ink}" stroke-width="2.4"/>
    <path d="M280 96 h-40 M280 96 l6 -4 M240 96 l-12 12" stroke="${H3.ink}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <circle cx="150" cy="129" r="11" fill="#FFFFFF" stroke="${H3.heat}" stroke-width="2.2"/>${TXT(150, 133, "①", 11, "middle", H3.heat)}
    <circle cx="200" cy="60" r="11" fill="#FFFFFF" stroke="${H3.heat}" stroke-width="2.2"/>${TXT(200, 64, "②", 11, "middle", H3.heat)}
    <circle cx="176" cy="84" r="11" fill="#FFFFFF" stroke="${H3.heat}" stroke-width="2.2"/>${TXT(176, 88, "③", 11, "middle", H3.heat)}
    ${TXT(28, 108, "아궁이", 10, "middle", "#DCE8F5")}${TXT(300, 148, "구들장", 10, "middle", "#F8F9FA")}
  `;
  return svg("0 0 340 176", body, "아궁이의 불이 방을 데우는 온돌의 단면");
}

// ── L4 ──────────────────────────────────────────────────────────
/** 같은 열을 준 두 액체의 시간·온도 그래프. quiz면 (가)(나) 라벨. */
export function heatRaceGraphFig(o: { quiz?: boolean } = {}): string {
  const X0 = 46, Y0 = 14, W = 264, H = 140;
  const tMax = 4, yMax = 100;
  const yOf = (T: number): number => Y0 + H - (T / yMax) * H;
  const xOf = (t: number): number => X0 + (t / tMax) * W;
  const line = (slope: number): string => `${xOf(0).toFixed(1)},${yOf(20).toFixed(1)} ${xOf(tMax).toFixed(1)},${yOf(20 + slope * tMax).toFixed(1)}`;
  const fastSlope = o.quiz ? 19 : 17;
  const slowSlope = o.quiz ? 7 : 8;
  const body = `
    <line x1="${X0}" y1="${Y0 - 4}" x2="${X0}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${X0}" y1="${Y0 + H}" x2="${X0 + W + 8}" y2="${Y0 + H}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 20, 40, 60, 80, 100].map((v) => `<line x1="${X0 - 4}" y1="${yOf(v)}" x2="${X0 + W}" y2="${yOf(v)}" stroke="#E5E8EB" stroke-width="1"/>${TXT(X0 - 8, yOf(v) + 4, String(v), 10, "end", "#8B95A1")}`).join("")}
    ${[0, 1, 2, 3, 4].map((t) => TXT(xOf(t), Y0 + H + 14, String(t), 10, "middle", "#8B95A1")).join("")}
    ${TXT(X0 + W / 2, Y0 + H + 30, "시간(분)", 11)}
    ${TXT(14, Y0 + 6, "온도(℃)", 10.5, "start")}
    <polyline points="${line(fastSlope)}" stroke="${H3.oil}" stroke-width="3.2" stroke-linecap="round"/>
    <polyline points="${line(slowSlope)}" stroke="${H3.water}" stroke-width="3.2" stroke-linecap="round"/>
    ${TXT(xOf(tMax) + 4, yOf(20 + fastSlope * tMax) + 4, o.quiz ? "(가)" : "식용유", 11, "start", "#B8860B")}
    ${TXT(xOf(tMax) + 4, yOf(20 + slowSlope * tMax) + 4, o.quiz ? "(나)" : "물", 11, "start", "#1C7ED6")}
  `;
  return svg("0 0 340 200", body, "질량이 같은 두 액체를 같은 세기로 가열했을 때 시간에 따른 온도 변화 그래프");
}

/** 여러 물질의 상대적 비열 막대(물 = 1, 25℃). CRC 핸드북 값 기반의 과학 사실. */
export function specificHeatBarFig(): string {
  const rows: [string, number][] = [["철", 0.11], ["모래", 0.19], ["알루미늄", 0.21], ["콩기름", 0.47], ["얼음", 0.5], ["에탄올", 0.57], ["물", 1]];
  const body = `
    ${rows.map(([n, v], i) => {
      const y = 12 + i * 26;
      const w = 210 * v;
      return `${TXT(70, y + 14, n, 12, "end", H3.ink)}
        <rect x="80" y="${y}" width="210" height="20" rx="6" fill="#F1F3F5"/>
        <rect x="80" y="${y}" width="${w.toFixed(1)}" height="20" rx="6" fill="${n === "물" ? H3.water : tempColor(0.75 - v * 0.5)}"/>
        ${TXT(80 + w + 6, y + 14, v.toFixed(2), 11, "start", H3.sub)}`;
    }).join("")}
    ${TXT(185, 206, "물의 비열을 1로 했을 때의 상대적인 값", 10.5, "middle", "#8B95A1")}
  `;
  return svg("0 0 340 214", body, "여러 물질의 상대적인 비열 막대그래프");
}

// ── L5 ──────────────────────────────────────────────────────────
/** 열팽창의 입자 모형 — 가열 전/후 상자. */
export function expansionParticlesFig(): string {
  const body = `
    ${particleBox(16, 22, 128, 100, 0.18, { label: "가열 전" })}
    ${particleBox(182, 12, 144, 118, 0.85, { label: "가열 후" })}
    <path d="M150 70 h24 M168 64 l8 6 -8 6 Z" stroke="${H3.heat}" stroke-width="3" fill="${H3.heat}" stroke-linecap="round"/>
    ${TXT(80, 160, "입자 사이의 거리가 가까워요", 10.5)}${TXT(254, 160, "거리가 멀어져 부피가 커져요", 10.5)}
  `;
  return svg("0 0 340 170", body, "가열 전과 가열 후 물체를 구성하는 입자의 배열 비교");
}

/** 액체의 열팽창 — 유리관이 달린 플라스크. state에 따라 액체 높이가 다르다. */
export function liquidFlaskFig(state: "before" | "after"): string {
  const level = state === "after" ? 40 : 96;
  const body = `
    <rect x="163" y="14" width="14" height="112" rx="5" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M150 126 l-38 46 a10 10 0 0 0 8 16 h100 a10 10 0 0 0 8 -16 l-38 -46 Z" fill="#EAF4FB" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M150 126 v-4 h40 v4" fill="none" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M118 166 l32 -38 h40 l32 38 a8 8 0 0 1 -6 14 h-92 a8 8 0 0 1 -6 -14 Z" fill="${H3.hot}" opacity="0.55"/>
    <rect x="166" y="${level}" width="8" height="${126 - level}" fill="${H3.hot}" opacity="0.75"/>
    <line x1="182" y1="96" x2="200" y2="96" stroke="#8B95A1" stroke-width="1.8"/>${TXT(204, 100, "처음 높이", 10, "start")}
    ${state === "after" ? `<line x1="182" y1="40" x2="200" y2="40" stroke="${H3.hot}" stroke-width="1.8"/>${TXT(204, 44, "나중 높이", 10, "start", H3.hot)}` : ""}
    ${state === "after" ? `${flameSvg(170, 200, 0.9, "lf")}${burnerSvg(170, 200, 60)}` : `${burnerSvg(170, 200, 60)}`}
    ${TXT(170, 250, state === "after" ? "가열 후: 액체가 유리관을 타고 올라와요" : "가열 전", 11, "middle", H3.ink)}
  `;
  return svg("0 0 340 262", body, state === "after" ? "가열한 뒤 액체가 유리관 위로 올라온 플라스크" : "가열하기 전 액체가 담긴 플라스크");
}

/** 알루미늄 테이프(종이+알루미늄박) 가열 전·후. */
export function tapeBendFig(): string {
  const body = `
    <line x1="0" y1="14" x2="340" y2="14" stroke="#8B95A1" stroke-width="2"/>
    <rect x="70" y="14" width="10" height="130" fill="${H3.alu}" stroke="#8B95A1" stroke-width="1.6"/>
    <rect x="80" y="14" width="10" height="130" fill="${H3.paper}" stroke="#C9B37A" stroke-width="1.6"/>
    ${TXT(80, 166, "가열 전", 11, "middle", H3.ink)}
    <path d="M226 14 c4 40 8 80 38 124" stroke="${H3.alu}" stroke-width="10" fill="none"/>
    <path d="M221 14 c4 40 8 80 38 124" stroke="#8B95A1" stroke-width="1.6" fill="none"/>
    <path d="M236 14 c4 40 6 76 34 118" stroke="${H3.paper}" stroke-width="10" fill="none"/>
    <path d="M241 14 c4 40 6 76 34 118" stroke="#C9B37A" stroke-width="1.6" fill="none"/>
    ${flameSvg(232, 178, 0.8, "tb")}${burnerSvg(232, 178, 44)}
    ${TXT(232, 214, "가열 후", 11, "middle", H3.ink)}
    ${TXT(218, 44, "알루미늄박", 9.5, "end", H3.sub)}${TXT(248, 44, "종이", 9.5, "start", H3.sub)}
  `;
  return svg("0 0 340 224", body, "종이를 붙인 알루미늄 테이프를 가열하기 전과 후의 모습");
}

/** 바이메탈 — 온도가 낮을 때(곧음)와 높을 때(휨). bigOnTop이면 위쪽 금속이 열팽창 정도가 큰 금속. */
export function bimetalFig(o: { blank?: boolean; bigOnTop?: boolean } = {}): string {
  const bigOnTop = o.bigOnTop ?? true;
  const bigCol = "#F5B301", smallCol = "#8B95A1";
  const top = bigOnTop ? bigCol : smallCol;
  const bot = bigOnTop ? smallCol : bigCol;
  const nameTop = o.blank ? "㉠" : bigOnTop ? "열팽창 정도가 큰 금속" : "열팽창 정도가 작은 금속";
  const nameBot = o.blank ? "㉡" : bigOnTop ? "열팽창 정도가 작은 금속" : "열팽창 정도가 큰 금속";
  const dir = bigOnTop ? 1 : -1; // 큰 금속이 위면 아래(작은 금속 쪽)로 휜다
  const bend = (c: string, off: number): string =>
    `<path d="M186 ${90 + off} c40 0 74 ${4 * dir} 120 ${44 * dir}" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="butt"/>`;
  const body = `
    <rect x="18" y="82" width="10" height="26" rx="2" fill="#4E5968"/>
    <rect x="28" y="84" width="120" height="10" fill="${top}"/>
    <rect x="28" y="94" width="120" height="10" fill="${bot}"/>
    ${TXT(88, 68, "온도가 낮을 때", 11, "middle", H3.ink)}
    ${TXT(88, 128, nameTop, 10, "middle", "#B8860B")}${TXT(88, 144, nameBot, 10, "middle", "#5C6B7A")}
    <rect x="24" y="120" width="8" height="8" fill="${top}"/><rect x="24" y="136" width="8" height="8" fill="${bot}"/>
    <rect x="176" y="82" width="10" height="26" rx="2" fill="#4E5968"/>
    ${bend(top, -5)}
    ${bend(bot, 5)}
    ${TXT(252, 68, "온도가 높을 때", 11, "middle", H3.ink)}
    ${flameSvg(252, 176, 0.8, "bm")}${burnerSvg(252, 176, 44)}
    ${TXT(252, 210, o.blank ? "" : "열팽창 정도가 작은 금속 쪽으로 휘어요", 10.5, "middle", H3.sub)}
  `;
  return svg("0 0 340 218", body, "두 금속을 붙인 바이메탈이 온도에 따라 변하는 모습");
}

// ── recap 미니아트(64×64 플랫) ────────────────────────────────────
const MINI: Record<string, () => string> = {
  thermoDial: () => svg("0 0 64 64", `${thermoSvg(20, 6, 34, "mi")}<path d="M42 14 q4 -6 8 0 M42 26 q4 -6 8 0" stroke="${H3.hot}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`, "온도계"),
  heatUp: () => svg("0 0 64 64", `${particleBox(6, 10, 52, 42, 0.9, { cols: 3, rows: 2, r: 5 })}<path d="M20 60 q4 -6 8 0 M36 60 q4 -6 8 0" stroke="${H3.hot}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`, "활발한 입자"),
  coolDown: () => svg("0 0 64 64", `${particleBox(6, 10, 52, 42, 0.1, { cols: 3, rows: 2, r: 5 })}<path d="M22 58 l4 -4 4 4 M34 58 l4 -4 4 4" stroke="${H3.cold}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "둔한 입자"),
  rubHands: () => svg("0 0 64 64", `<path d="M10 40 c0 -10 8 -16 16 -14 l0 20 c-8 2 -16 0 -16 -6 Z" fill="#FFE8CC" stroke="#C77B4A" stroke-width="2"/><path d="M54 24 c0 10 -8 16 -16 14 l0 -20 c8 -2 16 0 16 6 Z" fill="#FFE8CC" stroke="#C77B4A" stroke-width="2"/><path d="M30 8 l4 6 M36 6 l0 7 M42 8 l-4 6" stroke="${H3.hot}" stroke-width="2.4" stroke-linecap="round"/>`, "손 비비기"),
  heatArrow: () => svg("0 0 64 64", `<rect x="4" y="18" width="20" height="28" rx="6" fill="${H3.hot}" opacity="0.8"/><rect x="40" y="18" width="20" height="28" rx="6" fill="${H3.cold}" opacity="0.8"/><path d="M26 32 h10 M32 27 l6 5 -6 5 Z" stroke="${H3.heat}" stroke-width="2.6" fill="${H3.heat}" stroke-linecap="round"/>`, "열의 이동 방향"),
  balanceEq: () => svg("0 0 64 64", `<rect x="4" y="18" width="24" height="28" rx="6" fill="${tempColor(0.5)}" opacity="0.85"/><rect x="36" y="18" width="24" height="28" rx="6" fill="${tempColor(0.5)}" opacity="0.85"/><path d="M28 28 h8 M28 36 h8" stroke="${H3.ink}" stroke-width="2.6" stroke-linecap="round"/><circle cx="32" cy="10" r="4" fill="${H3.ok}"/>`, "온도가 같아진 두 물체"),
  particleSwap: () => svg("0 0 64 64", `${particleBox(2, 14, 28, 36, 0.9, { cols: 2, rows: 2, r: 4 })}${particleBox(34, 14, 28, 36, 0.1, { cols: 2, rows: 2, r: 4 })}<path d="M26 8 h12 M34 4 l4 4 -4 4" stroke="${H3.heat}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "입자 운동 교환"),
  beepThermo: () => svg("0 0 64 64", `<rect x="14" y="8" width="36" height="48" rx="10" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.4"/><rect x="20" y="16" width="24" height="14" rx="3" fill="#E6FCF5"/><path d="M52 14 q6 6 0 12 M56 8 q10 10 0 24" stroke="${H3.ok}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M26 42 h12" stroke="#8B95A1" stroke-width="2.4" stroke-linecap="round"/>`, "체온계"),
  conductChain: () => svg("0 0 64 64", `<rect x="4" y="24" width="56" height="16" rx="5" fill="#F1F3F5" stroke="#C9D3DE" stroke-width="1.6"/>${[10, 22, 34, 46, 56].map((x, i) => `<circle cx="${x}" cy="32" r="4" fill="${tempColor(0.9 - i * 0.18)}"/>`).join("")}<path d="M4 50 q4 -6 8 0" stroke="${H3.hot}" stroke-width="2" fill="none" stroke-linecap="round"/>`, "전도"),
  convectLoop: () => svg("0 0 64 64", `<path d="M14 14 v34 a6 6 0 0 0 6 6 h24 a6 6 0 0 0 6 -6 v-34" fill="#DCEEFB" stroke="#5C6B7A" stroke-width="2.4"/><path d="M32 46 c-10 -6 -12 -20 -6 -26 M32 46 c10 -6 12 -20 6 -26" stroke="${H3.hot}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M20 24 c-4 12 0 20 10 22 M44 24 c4 12 0 20 -10 22" stroke="${H3.cold}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M26 60 q6 -8 12 0" stroke="${H3.flame}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`, "대류"),
  radiateWave: () => svg("0 0 64 64", `<rect x="6" y="14" width="14" height="36" rx="4" fill="#4E5968"/><rect x="9" y="18" width="8" height="28" rx="2" fill="${H3.hot}"/><path d="M26 24 q6 -4 12 0 t12 0 M26 32 q6 -4 12 0 t12 0 M26 40 q6 -4 12 0 t12 0" stroke="${H3.warm}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "복사"),
  threeWays: () => svg("0 0 64 64", `<rect x="4" y="8" width="16" height="10" rx="3" fill="${tempColor(0.9)}"/><circle cx="12" cy="36" r="8" fill="none" stroke="${H3.hot}" stroke-width="2.4"/><path d="M8 36 a4 4 0 0 1 8 0" stroke="${H3.cold}" stroke-width="2.4" fill="none"/><path d="M30 12 q6 -4 12 0 t12 0 M30 24 q6 -4 12 0 t12 0" stroke="${H3.warm}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M30 44 h24 M48 40 l6 4 -6 4" stroke="${H3.heat}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "열의 이동 세 방식"),
  calorie: () => svg("0 0 64 64", `<path d="M32 6 c-10 14 -14 22 -12 32 a12 12 0 0 0 24 0 c2 -10 -2 -18 -12 -32 Z" fill="${H3.flame}"/><path d="M32 24 c-5 8 -6 12 -5 17 a5 5 0 0 0 10 0 c1 -5 0 -9 -5 -17 Z" fill="#FFE066"/><path d="M14 58 h36" stroke="${H3.ink}" stroke-width="2.6" stroke-linecap="round"/>`, "열량"),
  heatFast: () => svg("0 0 64 64", `${beakerSvg(8, 12, 22, 36, H3.oil, "mi", 0.7)}${beakerSvg(34, 12, 22, 36, H3.water, "mi", 0.7)}<path d="M19 8 l0 -5 M17 4 l2 -2 2 2" stroke="${H3.hot}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M14 58 q5 -6 10 0 M40 58 q5 -6 10 0" stroke="${H3.flame}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "빨리 데워지는 액체"),
  potSlow: () => svg("0 0 64 64", `<path d="M10 28 h44 v16 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 Z" fill="#5C4033" stroke="#3B2A22" stroke-width="2.4"/><path d="M8 28 h48" stroke="#3B2A22" stroke-width="3" stroke-linecap="round"/><path d="M24 22 q3 -8 0 -12 M32 22 q3 -8 0 -12 M40 22 q3 -8 0 -12" stroke="#8B95A1" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "뚝배기"),
  bodyWater: () => svg("0 0 64 64", `<circle cx="32" cy="14" r="8" fill="#FFFFFF" stroke="${H3.ink}" stroke-width="2.4"/><path d="M32 22 v20 M32 30 l-12 10 M32 30 l12 10 M32 42 l-10 16 M32 42 l10 16" stroke="${H3.ink}" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M50 24 c0 -5 4 -10 4 -10 c0 0 4 5 4 10 a4 4 0 0 1 -8 0 Z" fill="${H3.water}"/>`, "물이 많은 몸"),
  expandGap: () => svg("0 0 64 64", `<rect x="4" y="40" width="26" height="12" rx="2" fill="#8B95A1"/><rect x="34" y="40" width="26" height="12" rx="2" fill="#8B95A1"/><path d="M26 30 l6 8 M38 30 l-6 8" stroke="${H3.hot}" stroke-width="2.2" stroke-linecap="round"/><circle cx="48" cy="14" r="7" fill="${H3.oil}"/>`, "철로의 틈"),
  bimetalBend: () => svg("0 0 64 64", `<rect x="4" y="20" width="8" height="20" rx="2" fill="#4E5968"/><path d="M12 26 c16 0 30 2 44 20" stroke="#F5B301" stroke-width="6" fill="none"/><path d="M12 34 c16 0 30 2 44 20" stroke="#8B95A1" stroke-width="6" fill="none"/><path d="M40 10 q4 -6 8 0" stroke="${H3.hot}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, "바이메탈"),
  particleFar: () => svg("0 0 64 64", `${particleBox(4, 14, 24, 32, 0.15, { cols: 2, rows: 2, r: 4 })}${particleBox(34, 8, 28, 44, 0.85, { cols: 2, rows: 2, r: 4 })}`, "입자 사이 거리"),
  jarLid: () => svg("0 0 64 64", `<rect x="16" y="22" width="32" height="34" rx="6" fill="#EAF4FB" stroke="#8B95A1" stroke-width="2.4"/><rect x="12" y="14" width="40" height="12" rx="4" fill="#8B95A1"/><path d="M28 6 c0 -3 2 -5 4 -5 c2 0 4 2 4 5 v6 h-8 Z" fill="${H3.water}"/><path d="M6 14 l4 4 M58 14 l-4 4" stroke="${H3.hot}" stroke-width="2" stroke-linecap="round"/>`, "병뚜껑 열기"),
};

export function h3MiniArt(key: string): string {
  const fn = MINI[key];
  return fn ? fn() : "";
}
