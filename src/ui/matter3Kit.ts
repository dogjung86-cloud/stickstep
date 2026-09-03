// matter3Kit — 중1 Ⅳ 「물질의 상태 변화」 v3 재제작(2026-09-03) 공용 킷.
// 색·입자 배치·시드 난수·소품 SVG 조각의 단일 진실 공급원. 랩·그림·훅·콘텐츠가 함께 쓴다.
// (현행 unit4 계열(matterFigures·labProps)은 비교 대상 보존을 위해 여기서 참조하지 않는다.
//  메타볼 무대(ui/matterStage)는 단원의 정체성이라 랩 2종이 킷으로 재사용한다 — SCI_GUIDE 메타볼 섹션.)
// 판정 선택지는 ui/bio4Kit의 b4Ask 공용을 그대로 쓴다(재구현 금지).

/** v3 전용 팔레트. 단원 액센트는 토큰 --subj-matter(#7C6BFF)와 동일값(SVG 하드코딩용). */
export const M3 = {
  matter: "#7C6BFF",
  matterDeep: "#5F4BE8",
  matterTint: "#F0ECFF",
  ink: "#191F28",
  sub: "#4E5968",
  part: "#7C6BFF", // 입자 공통색 — 상태·온도와 무관하게 하나(색이 정답의 단서가 되지 않게)
  partEdge: "#5F4BE8",
  water: "#4DABF7",
  waterDeep: "#1C7ED6",
  ice: "#C5E4FF",
  iceEdge: "#74C0FC",
  steam: "#B8C7DA",
  inkBlue: "#3B5BDB",
  yellow: "#FFD43B",
  btb: "#4DABF7",
  hot: "#F03E3E",
  warm: "#FF922B",
  cold: "#3B5BDB",
  glass: "#9DB2C4",
  metal: "#8B95A1",
  oil: "#F5B301",
  oilFrozen: "#FFF1B8",
  wood: "#C9885A",
  teal: "#12B886",
  ok: "#04B45F",
  danger: "#F04452",
  night: "#101A33",
} as const;

/** 발주 이미지 베이스(public/matter3/...) — lazy 금지(스크롤 컨테이너 사고 14). */
export const M3_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/") + "matter3/";

export interface Pt {
  x: number;
  y: number;
}

/** 시드 고정 난수(mulberry32) — 입자 흔들림·배치가 실행마다 같아 e2e·눈검수가 안정적이다. */
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

/** 입자 격자 좌표 — cols×rows, 중심 (cx, cy), 간격 gap. */
export function particleGrid(cols: number, rows: number, cx: number, cy: number, gap: number): Pt[] {
  const pts: Pt[] = [];
  const x0 = cx - ((cols - 1) * gap) / 2;
  const y0 = cy - ((rows - 1) * gap) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: x0 + c * gap, y: y0 + r * gap });
  return pts;
}

export type StateKind = "solid" | "liquid" | "gas";

/** 상태별 입자 배치 — 상자 (x, y, w, h) 안. 고체 = 바닥 중앙 빽빽한 규칙 격자,
 *  액체 = 바닥에 가라앉은 불규칙 무리(사이가 고체보다 멀다), 기체 = 상자 전체에 드문드문(매우 멀다).
 *  개수는 고체·액체 12, 기체 12로 같게 두어 "개수는 그대로, 배열만 다르다"가 그림에서 읽히게 한다. */
export function stateParticles(kind: StateKind, x: number, y: number, w: number, h: number, rnd: () => number, r = 5, topPad = 0): Pt[] {
  const n = 12;
  if (kind === "solid") {
    const gap = r * 2.15;
    return particleGrid(4, 3, x + w / 2, y + h - r - 4 - gap, gap);
  }
  if (kind === "liquid") {
    const gap = r * 2.75;
    const base = particleGrid(4, 3, x + w / 2, y + h - r - 6 - gap * 1.05, gap);
    return base.map((p) => ({ x: p.x + (rnd() - 0.5) * gap * 0.5, y: p.y + (rnd() - 0.5) * gap * 0.4 }));
  }
  // gas — 서로 겹치지 않게 후보를 뽑아 최소 거리 확보
  const pts: Pt[] = [];
  let guard = 0;
  while (pts.length < n && guard++ < 400) {
    const p = { x: x + r + 3 + rnd() * (w - 2 * r - 6), y: y + r + 3 + topPad + rnd() * (h - 2 * r - 6 - topPad) };
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > r * 3.4)) pts.push(p);
  }
  return pts;
}

/** 입자 흔들림 호(운동 표시) — 활발할수록 크고 진하다. */
export function motionArcs(p: Pt, level: number, r: number, color: string): string {
  if (level < 0.1) return "";
  const d = r + 2 + level * 3;
  const len = 3 + level * 6;
  const op = (0.3 + level * 0.55).toFixed(2);
  return `<path d="M${(p.x - d).toFixed(1)} ${(p.y - len / 2).toFixed(1)} q${(-2 - level * 2).toFixed(1)} ${(len / 2).toFixed(1)} 0 ${len.toFixed(1)} M${(p.x + d).toFixed(1)} ${(p.y - len / 2).toFixed(1)} q${(2 + level * 2).toFixed(1)} ${(len / 2).toFixed(1)} 0 ${len.toFixed(1)}" stroke="${color}" stroke-width="1.7" stroke-linecap="round" fill="none" opacity="${op}"/>`;
}

/** 입자 상자(정적) — 상태 kind의 배열을 그린다. 라벨은 상자 아래. */
export function stateBox(kind: StateKind, x: number, y: number, w: number, h: number, seed: number, o: { label?: string; r?: number; arcs?: boolean } = {}): string {
  const r = o.r ?? 5;
  const rnd = seededRandom(seed);
  const pts = stateParticles(kind, x, y, w, h, rnd, r);
  const level = kind === "solid" ? 0.15 : kind === "liquid" ? 0.5 : 0.95;
  const arcs = o.arcs === false ? "" : pts.map((p) => motionArcs(p, level, r, M3.partEdge)).join("");
  const dots = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("");
  const label = o.label ? `<text x="${x + w / 2}" y="${y + h + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.ink}">${o.label}</text>` : "";
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>${arcs}${dots}${label}</g>`;
}

/** 온도계 SVG 조각 — 좌상단 (x, y), 관 높이 h. 수은주는 class="<ns>-merc"로 랩이 scaleY를 조절한다(바닥 기준). */
export function thermoSvg(x: number, y: number, h: number, ns: string, label = ""): string {
  const w = 14;
  const bulbR = 11;
  const by = y + h + 6;
  return `<g class="${ns}-thermo">
    <rect x="${x}" y="${y}" width="${w}" height="${h + 6}" rx="7" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.4"/>
    <rect class="${ns}-merc" x="${x + 4}" y="${y + 6}" width="${w - 8}" height="${h}" rx="3" fill="${M3.hot}" style="transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0.3)"/>
    <circle cx="${x + w / 2}" cy="${by}" r="${bulbR}" fill="${M3.hot}" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M${x + w / 2 - 4} ${by - 4} q3 -3 6 0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    ${[0.2, 0.4, 0.6, 0.8].map((k) => `<line x1="${x + w + 3}" y1="${y + 6 + h * (1 - k)}" x2="${x + w + 8}" y2="${y + 6 + h * (1 - k)}" stroke="#8B95A1" stroke-width="1.6"/>`).join("")}
    ${label ? `<text x="${x + w / 2}" y="${by + bulbR + 15}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">${label}</text>` : ""}
  </g>`;
}

/** 불꽃 SVG 조각 — 바닥 중심 (cx, baseY), 크기 s. class="<ns>-flame"로 랩이 켜고 끈다. */
export function flameSvg(cx: number, baseY: number, s: number, ns: string): string {
  return `<g class="${ns}-flame" style="transform-box: fill-box; transform-origin: 50% 100%">
    <path d="M${cx} ${baseY} c${-14 * s} ${-8 * s} ${-12 * s} ${-26 * s} ${0} ${-34 * s} c${12 * s} ${8 * s} ${14 * s} ${26 * s} 0 ${34 * s} Z" fill="${M3.warm}"/>
    <path d="M${cx} ${baseY} c${-7 * s} ${-5 * s} ${-6 * s} ${-15 * s} 0 ${-20 * s} c${6 * s} ${5 * s} ${7 * s} ${15 * s} 0 ${20 * s} Z" fill="#FFE066"/>
  </g>`;
}

/** 가열 장치 받침. */
export function burnerSvg(cx: number, topY: number, w: number): string {
  return `<g>
    <rect x="${cx - w / 2}" y="${topY}" width="${w}" height="10" rx="4" fill="#6B7684"/>
    <rect x="${cx - w / 2 + 6}" y="${topY + 10}" width="${w - 12}" height="8" rx="3" fill="#4E5968"/>
    <rect x="${cx - 10}" y="${topY + 18}" width="20" height="6" rx="2" fill="#8B95A1"/>
  </g>`;
}

/** 비커 — 좌상단 (x, y), 폭 w, 높이 h, 액체 색 fill. 액체 rect는 class="<ns>-liq". */
export function beakerSvg(x: number, y: number, w: number, h: number, fill: string, ns: string, level = 0.72): string {
  const lh = h * level;
  return `<g class="${ns}-beaker">
    <rect class="${ns}-liq" x="${x + 3}" y="${y + h - lh}" width="${w - 6}" height="${lh - 3}" rx="4" fill="${fill}" opacity="0.55"/>
    <path d="M${x} ${y} v${h - 10} a10 10 0 0 0 10 10 h${w - 20} a10 10 0 0 0 10 -10 v${-(h - 10)}" fill="none" stroke="${M3.glass}" stroke-width="3"/>
    <path d="M${x - 5} ${y} h${w + 10}" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x + 8} ${y + 14} v${h - 34}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
  </g>`;
}

/** 전자저울 — 좌상단 (x, y), 폭 w. 표시창 글자는 class="<ns>-read"(랩이 textContent를 바꾼다). */
export function scaleSvg(x: number, y: number, w: number, ns: string, read = "0.00 g"): string {
  return `<g class="${ns}-scale">
    <rect x="${x}" y="${y}" width="${w}" height="16" rx="4" fill="#C3CBD4" stroke="#8B95A1" stroke-width="1.6"/>
    <rect x="${x + 6}" y="${y + 16}" width="${w - 12}" height="30" rx="8" fill="#E9EDF2" stroke="#8B95A1" stroke-width="2"/>
    <rect x="${x + w / 2 - 34}" y="${y + 22}" width="68" height="18" rx="4" fill="#1F2B3D"/>
    <text class="${ns}-read" x="${x + w / 2}" y="${y + 35}" text-anchor="middle" font-size="12" font-weight="800" fill="#7CF29C" font-family="ui-monospace, monospace">${read}</text>
  </g>`;
}

/** 삼각 플라스크 — 바닥 중심 (cx, baseY), 높이 h. 액체 path는 class="<ns>-liq". */
export function flaskSvg(cx: number, baseY: number, h: number, ns: string, fill: string, level = 0.3): string {
  const bw = h * 0.62; // 바닥 반폭
  const nw = h * 0.16; // 목 반폭
  const ny = baseY - h; // 목 윗선
  const sh = baseY - h * 0.55; // 어깨
  const liqTop = baseY - h * 0.5 * level - 4;
  const t = (baseY - liqTop) / (baseY - sh);
  const lw = bw + (nw - bw) * Math.min(1, t);
  return `<g class="${ns}-flask">
    <path class="${ns}-liq" d="M${cx - lw + 3} ${liqTop} h${(lw - 3) * 2} L${cx + bw - 3} ${baseY - 3} h${-(bw - 3) * 2} Z" fill="${fill}" opacity="0.6"/>
    <path d="M${cx - nw} ${ny} v${h * 0.45} L${cx - bw} ${baseY - 8} a8 8 0 0 0 8 8 h${(bw - 8) * 2} a8 8 0 0 0 8 -8 L${cx + nw} ${ny + h * 0.45} v${-h * 0.45}" fill="none" stroke="${M3.glass}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M${cx - nw - 4} ${ny} h${nw * 2 + 8}" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

/** 손그림 스틱맨(코와 팔이 있는 옆모습) — 훅·그림 공용. (x, y)는 머리 중심. */
export function stickSvg(x: number, y: number, s = 1, face: "smile" | "o" | "sniff" = "smile"): string {
  const r = 12 * s;
  const mouth = face === "o" ? `<circle cx="${x + 4 * s}" cy="${y + 4 * s}" r="${2.2 * s}" fill="none" stroke="${M3.ink}" stroke-width="${2 * s}"/>`
    : face === "sniff" ? `<path d="M${x + 1 * s} ${y + 5 * s} q3 2 6 0" stroke="${M3.ink}" stroke-width="${2 * s}" fill="none" stroke-linecap="round"/><path d="M${x + 12 * s} ${y - 2 * s} q4 -3 3 -8 M${x + 16 * s} ${y} q4 -3 3 -8" stroke="${M3.teal}" stroke-width="${1.8 * s}" fill="none" stroke-linecap="round"/>`
    : `<path d="M${x - 1 * s} ${y + 5 * s} q4 4 8 0" stroke="${M3.ink}" stroke-width="${2 * s}" fill="none" stroke-linecap="round"/>`;
  return `<g>
    <circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="${M3.ink}" stroke-width="${2.6 * s}"/>
    <circle cx="${x + 3 * s}" cy="${y - 2 * s}" r="${1.6 * s}" fill="${M3.ink}"/>
    ${mouth}
    <path d="M${x} ${y + r} v${34 * s} M${x} ${y + r + 10 * s} l${-11 * s} ${12 * s} M${x} ${y + r + 10 * s} l${12 * s} ${10 * s} M${x} ${y + r + 34 * s} l${-9 * s} ${22 * s} M${x} ${y + r + 34 * s} l${9 * s} ${22 * s}" stroke="${M3.ink}" stroke-width="${2.6 * s}" stroke-linecap="round" fill="none"/>
  </g>`;
}
