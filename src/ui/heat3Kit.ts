// heat3Kit — 중1 Ⅲ 「열」 v3 재제작(2026-09-03) 공용 킷.
// 색·온도색 보간·입자 격자·온도계 조각의 단일 진실 공급원. 랩·그림·훅·콘텐츠가 함께 쓴다.
// (현행 unit3 계열(thermo·heatFigures)은 비교 대상 보존을 위해 여기서 참조하지 않는다.)
// 판정 선택지는 ui/bio4Kit의 b4Ask 공용을 그대로 쓴다(재구현 금지).

/** v3 전용 팔레트. 단원 액센트는 토큰 --subj-heat(#FF6B4A)과 동일값(SVG 하드코딩용). */
export const H3 = {
  heat: "#FF6B4A",
  heatDeep: "#E8431F",
  ink: "#191F28",
  sub: "#4E5968",
  hot: "#F03E3E",
  warm: "#FF922B",
  cool: "#4DABF7",
  cold: "#3B5BDB",
  water: "#4DABF7",
  oil: "#F5B301",
  flame: "#FF922B",
  copper: "#D9822B",
  iron: "#8B95A1",
  glass: "#A5D8FF",
  wood: "#C9885A",
  paper: "#FFF9E6",
  alu: "#C3CBD4",
  night: "#39445B",
  danger: "#F04452",
  ok: "#04B45F",
} as const;

/** 발주 이미지 베이스(public/heat3/...) — lazy 금지(스크롤 컨테이너 사고 14). */
export const H3_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/") + "heat3/";

/** 0~1 사이 값을 h 스톱 팔레트로 보간(차가움 → 뜨거움). 온도색·열화상 색이 전부 이 램프를 쓴다. */
const RAMP: [number, [number, number, number]][] = [
  [0, [59, 91, 219]], // #3B5BDB 차가움
  [0.3, [77, 171, 247]], // #4DABF7
  [0.55, [255, 224, 102]], // #FFE066
  [0.78, [255, 146, 43]], // #FF922B
  [1, [240, 62, 62]], // #F03E3E 뜨거움
];
export function tempColor(p: number): string {
  const x = Math.max(0, Math.min(1, p));
  for (let i = 1; i < RAMP.length; i++) {
    const [p0, c0] = RAMP[i - 1];
    const [p1, c1] = RAMP[i];
    if (x <= p1) {
      const k = (x - p0) / (p1 - p0);
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }
  }
  return "rgb(240, 62, 62)";
}

/** 입자 격자 좌표 — cols×rows, 중심 (cx, cy), 간격 gap. 랩이 온도에 따라 gap을 키우면 "입자 사이 거리"가 된다. */
export function particleGrid(cols: number, rows: number, cx: number, cy: number, gap: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const x0 = cx - ((cols - 1) * gap) / 2;
  const y0 = cy - ((rows - 1) * gap) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: x0 + c * gap, y: y0 + r * gap });
  return pts;
}

/** 시드 고정 난수(mulberry32) — 입자 흔들림이 실행마다 같아 e2e·눈검수가 안정적이다. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 온도계 SVG 조각 — 좌상단 (x, y), 관 높이 h. 수은주는 class="<ns>-merc"로 랩이 높이를 조절한다.
 *  수은주 rect는 y=y+h(바닥)에서 위로 자라도록 transform-origin이 바닥이다(scaleY로 조절). */
export function thermoSvg(x: number, y: number, h: number, ns: string, label = ""): string {
  const w = 14;
  const bulbR = 11;
  const by = y + h + 6;
  return `<g class="${ns}-thermo">
    <rect x="${x}" y="${y}" width="${w}" height="${h + 6}" rx="7" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.4"/>
    <rect class="${ns}-merc" x="${x + 4}" y="${y + 6}" width="${w - 8}" height="${h}" rx="3" fill="${H3.hot}" style="transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0.3)"/>
    <circle cx="${x + w / 2}" cy="${by}" r="${bulbR}" fill="${H3.hot}" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M${x + w / 2 - 4} ${by - 4} q3 -3 6 0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    ${[0.2, 0.4, 0.6, 0.8].map((k) => `<line x1="${x + w + 3}" y1="${y + 6 + h * (1 - k)}" x2="${x + w + 8}" y2="${y + 6 + h * (1 - k)}" stroke="#8B95A1" stroke-width="1.6"/>`).join("")}
    ${label ? `<text x="${x + w / 2}" y="${by + bulbR + 15}" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}">${label}</text>` : ""}
  </g>`;
}

/** 불꽃 SVG 조각 — 바닥 중심 (cx, baseY), 크기 s. class="<ns>-flame"로 랩이 켜고 끈다. */
export function flameSvg(cx: number, baseY: number, s: number, ns: string): string {
  return `<g class="${ns}-flame" style="transform-box: fill-box; transform-origin: 50% 100%">
    <path d="M${cx} ${baseY} c${-14 * s} ${-8 * s} ${-12 * s} ${-26 * s} ${0} ${-34 * s} c${12 * s} ${8 * s} ${14 * s} ${26 * s} 0 ${34 * s} Z" fill="${H3.flame}"/>
    <path d="M${cx} ${baseY} c${-7 * s} ${-5 * s} ${-6 * s} ${-15 * s} 0 ${-20 * s} c${6 * s} ${5 * s} ${7 * s} ${15 * s} 0 ${20 * s} Z" fill="#FFE066"/>
  </g>`;
}

/** 버너(가열 장치) 받침 — 불꽃 아래 놓는 간단한 소품. */
export function burnerSvg(cx: number, topY: number, w: number): string {
  return `<g>
    <rect x="${cx - w / 2}" y="${topY}" width="${w}" height="10" rx="4" fill="#6B7684"/>
    <rect x="${cx - w / 2 + 6}" y="${topY + 10}" width="${w - 12}" height="8" rx="3" fill="#4E5968"/>
    <rect x="${cx - 10}" y="${topY + 18}" width="20" height="6" rx="2" fill="#8B95A1"/>
  </g>`;
}

/** 비커 소품 — 좌상단 (x, y), 폭 w, 높이 h, 액체 색 fill(불투명도는 호출부). 액체 rect는 class="<ns>-liq". */
export function beakerSvg(x: number, y: number, w: number, h: number, fill: string, ns: string, level = 0.72): string {
  const lh = h * level;
  return `<g class="${ns}-beaker">
    <rect class="${ns}-liq" x="${x + 3}" y="${y + h - lh}" width="${w - 6}" height="${lh - 3}" rx="4" fill="${fill}" opacity="0.55"/>
    <path d="M${x} ${y} v${h - 10} a10 10 0 0 0 10 10 h${w - 20} a10 10 0 0 0 10 -10 v${-(h - 10)}" fill="none" stroke="#9DB2C4" stroke-width="3"/>
    <path d="M${x - 5} ${y} h${w + 10}" stroke="#9DB2C4" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x + 8} ${y + 14} v${h - 34}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
  </g>`;
}
