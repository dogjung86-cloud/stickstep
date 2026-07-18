// socFigures2 — 사회 Ⅱ(아시아) 그림 모듈: 아시아 크롭 지도(실데이터)·퀴즈 SVG·figTabs 아트·미니아트.
//   · 지도는 ui/worldMap.generated.ts + ui/continentMap.ts(ASIA 지역 데이터)를 재사용 —
//     손으로 대륙을 그리지 않는다(사회 트랙 원칙). Ⅲ~Ⅵ도 이 문법(대륙 크롭 + 오버레이) 그대로.
//   · 종교·인구 오버레이는 교과서 분포 지도(미래엔 33·38쪽, 비상 33·39쪽)의 러프 재현 —
//     경계는 러프 폴리곤, 정확한 판정이 필요한 자리엔 쓰지 않는다(그림 전용).
import { WORLD_LAND_PATH } from "./worldMap.generated";
import { CONTINENTS, lonToX, latToY, polyPath } from "./continentMap";

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
const ASIA = CONTINENTS.asia;
const CROP = ASIA.crop;

/** 결정적 의사 난수(mulberry32) — 점묘 지도가 렌더마다 같게. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mapShell(inner: string, opts?: { h?: number; legend?: string; aria?: string; pad?: number }): string {
  const legendH = opts?.legend ? 40 : 0;
  // pad — 크롭을 사방으로 넓혀 가장자리 요소(조산대 남단·카스피해 서안)에 여백을 준다(지형도 전용).
  const p = opts?.pad ?? 0;
  const vx = CROP.x - p;
  const vy = CROP.y - 6 - p;
  const vw = CROP.w + p * 2;
  const vh = CROP.h + 10 + p * 2;
  return `<svg viewBox="${vx} ${vy} ${vw} ${vh + legendH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${opts?.aria ?? "아시아 지도"}">
    <defs>
      <clipPath id="s2-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="s2-sea" cx=".5" cy=".4" r=".95">
        <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
      </radialGradient>
    </defs>
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh + legendH}" rx="12" fill="url(#s2-sea)"/>
    <line x1="${vx}" y1="250" x2="${vx + vw}" y2="250" stroke="#7FA8C8" stroke-width="1" opacity=".55"/>
    <text x="${vx + 5}" y="246" font-size="10" font-weight="700" fill="#5A7A96">적도</text>
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
    ${inner}
    <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
    ${opts?.legend ?? ""}
  </svg>`;
}

const letterMarks = (letters?: { lon: number; lat: number; t: string }[]): string =>
  (letters ?? [])
    .map(
      (m) => `<g>
      <circle cx="${lonToX(m.lon).toFixed(1)}" cy="${latToY(m.lat).toFixed(1)}" r="10.5" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.8"/>
      <text x="${lonToX(m.lon).toFixed(1)}" y="${(latToY(m.lat) + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="900" fill="#333D4B">${m.t}</text>
    </g>`,
    )
    .join("");

/* ---------- L1: 아시아 지역 구분 지도 ---------- */
/** 다섯 지역 색 지도. labels=false면 이름 없이(퀴즈 — ㉠㉡ 마커로 지역 묻기). */
export function asiaRegionsFig(opts?: { labels?: boolean; letters?: { lon: number; lat: number; t: string }[] }): string {
  const showLabels = opts?.labels !== false;
  const fills = ASIA.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="${r.color}" opacity=".5"/>`)
    .join("");
  const labels = showLabels
    ? ASIA.regions
        .map((r) => {
          const ax = lonToX(r.anchor[0]).toFixed(1);
          const ay = (latToY(r.anchor[1]) + 4).toFixed(1);
          return `<g>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="12.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" opacity=".85">${r.name}</text>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#2E3A50">${r.name}</text>
          </g>`;
        })
        .join("")
    : "";
  return mapShell(
    `<g clip-path="url(#s2-lclip)">${fills}</g>${labels}${letterMarks(opts?.letters)}`,
    { aria: "아시아의 다섯 지역 구분 지도" },
  );
}

/* ---------- L2: 지형 지도(hotspot 배경·pad0) ---------- */
export function asiaTerrainFig(): string {
  // 지형 소품은 전부 lon/lat → lonToX/latToY로 그린다(지리적 진실). pad 12로 사방을 넓혀
  // 가장자리 요소(조산대 남단·카스피해)에 여백 확보 — 뷰박스 "557 76 372 224".
  // hotspot 스팟 % 검산 공식(pad0): x% = (svgX−557)/372·100, y% = (svgY−76)/224·100 (눈대중 금지).
  const mtn = (lon: number, lat: number, s: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${x - 7 * s} ${y + 4 * s} L${x} ${y - 6 * s} L${x + 7 * s} ${y + 4 * s}z" fill="#8FA5BE" stroke="#5A7090" stroke-width=".8"/>
      <path d="M${x - 2.2 * s} ${y - 2.6 * s} L${x} ${y - 6 * s} L${x + 2.2 * s} ${y - 2.6 * s}q-2.2 1.6-4.4 0z" fill="#F2F7FB"/>`;
  };
  const volcano = (lon: number, lat: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${x - 5} ${y + 3} L${x} ${y - 5} L${x + 5} ${y + 3}z" fill="#C25C3E" stroke="#8F2D1D" stroke-width=".8"/>
      <path d="M${x - 1.5} ${y - 6.5}q1.5-2 3 0M${x + .5} ${y - 9}q1.5-2 3 0" stroke="#E8825A" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  };
  const river = (pts: [number, number][], name?: string): string => {
    const d = pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
    return `<path d="${d}" stroke="#4E9AE8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>${name ?? ""}`;
  };
  const inner = `
    <g clip-path="url(#s2-lclip)">
      <path d="${polyPath([[78, 36], [86, 36.5], [95, 35], [99, 31], [95, 27.5], [86, 27.5], [79, 30.5]])}" fill="#C8B48A" opacity=".8"/>
      <path d="${polyPath([[76, 40], [86, 41.5], [90, 38.5], [84, 36.5], [77, 37]])}" fill="#E8D8A8" opacity=".9"/>
      <path d="${polyPath([[98, 45], [110, 45.5], [112, 42.5], [103, 41], [97, 42.5]])}" fill="#E8D8A8" opacity=".9"/>
      <path d="${polyPath([[45, 24], [52, 23], [54, 19], [48, 18], [44, 20.5]])}" fill="#E8D8A8" opacity=".9"/>
    </g>
    ${river([[94, 33], [98, 27], [100, 20], [104, 15], [106, 10.5]])}
    ${river([[91, 33], [98, 30], [104, 29], [112, 30.5], [121, 31.8]])}
    ${river([[78, 31], [82, 27], [86, 25.5], [89.5, 23.5]])}
    <path d="M ${lonToX(141)} ${latToY(43)} Q ${lonToX(139)} ${latToY(33)} ${lonToX(127)} ${latToY(23)} Q ${lonToX(122)} ${latToY(14)} ${lonToX(124)} ${latToY(5)} Q ${lonToX(118)} ${latToY(-4)} ${lonToX(106)} ${latToY(-8)}"
      stroke="#E2574C" stroke-width="2.2" stroke-dasharray="6 5" fill="none" opacity=".8"/>
    ${mtn(78, 29.2, 1)}${mtn(83, 28.6, 1.25)}${mtn(88, 28.2, 1.1)}${mtn(93, 28.6, 1)}
    ${volcano(138.5, 36)}${volcano(121, 13.5)}${volcano(110, -7.5)}
    <ellipse cx="${lonToX(50.5)}" cy="${latToY(41.5)}" rx="9" ry="16" fill="#9CCBE8" stroke="#5A94BE" stroke-width=".8" opacity=".95" transform="rotate(-12 ${lonToX(50.5)} ${latToY(41.5)})"/>
  `;
  return mapShell(inner, { pad: 12, aria: "아시아의 주요 지형 지도 — 산맥, 고원, 사막, 강, 화산대" });
}

/* ---------- L2: 아시아 기후 지도(퀴즈) ---------- */
export function asiaClimateFig(opts?: { letters?: { lon: number; lat: number; t: string }[] }): string {
  const inner = `
    <image href="${BASE}soc/climate.webp" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" clip-path="url(#s2-lclip)" opacity=".92"/>
    ${letterMarks(opts?.letters)}`;
  const pal: [string, string][] = [["#1E9E50", "열대"], ["#E8B93C", "건조"], ["#A5D65C", "온대"], ["#3FA7C8", "냉대"], ["#8E9EC8", "한대"], ["#B0672A", "고산"]];
  const legend = `<g font-size="9.5" font-weight="800">
    ${pal.map(([c, n], i) => `<g transform="translate(${CROP.x + 12 + i * 56} ${CROP.y + CROP.h + 24})">
      <rect x="0" y="-9" width="11" height="11" rx="3" fill="${c}"/><text x="15" y="1" fill="#4E5968">${n}</text></g>`).join("")}
  </g>`;
  return mapShell(inner, { legend, aria: "아시아의 기후 분포 지도" });
}

/* ---------- L2: 계절풍 요약(퀴즈 그림 — 여름/겨울 나란히) ---------- */
export function monsoonPairFig(): string {
  const panel = (x0: number, summer: boolean): string => {
    const arrow = (x1: number, y1: number, x2: number, y2: number): string => {
      const a = Math.atan2(y2 - y1, x2 - x1);
      return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${summer ? "#4E9AE8" : "#C29434"}" stroke-width="3" stroke-linecap="round"/>
        <path d="M${x2} ${y2} L${(x2 - 8 * Math.cos(a - 0.4)).toFixed(1)} ${(y2 - 8 * Math.sin(a - 0.4)).toFixed(1)} L${(x2 - 8 * Math.cos(a + 0.4)).toFixed(1)} ${(y2 - 8 * Math.sin(a + 0.4)).toFixed(1)}z" fill="${summer ? "#4E9AE8" : "#C29434"}"/>`;
    };
    return `<g transform="translate(${x0} 0)">
      <rect x="4" y="24" width="164" height="130" rx="12" fill="${summer ? "#DCEEF8" : "#E8E4DA"}"/>
      <path d="M4 74 Q40 58 80 66 Q130 72 168 60 V24 H4z" fill="${summer ? "#B8D89A" : "#D8CCA8"}" stroke="#8AA06E" stroke-width="1"/>
      <path d="M4 118h164" stroke="#7FA8C8" stroke-width="1.4" opacity=".5"/>
      ${summer ? arrow(86, 132, 74, 84) + arrow(126, 126, 112, 80) + arrow(46, 128, 40, 86) : arrow(74, 66, 86, 116) + arrow(112, 62, 126, 112) + arrow(40, 68, 46, 112)}
      ${summer ? `<path d="M60 96l-2.4 6M76 92l-2.4 6M96 96l-2.4 6" stroke="#4E9AE8" stroke-width="2" stroke-linecap="round"/>` : ""}
      <text x="86" y="46" text-anchor="middle" font-size="11.5" font-weight="900" fill="#5A6B50">대륙</text>
      <text x="86" y="148" text-anchor="middle" font-size="11.5" font-weight="900" fill="#3E6E96">바다</text>
      <text x="86" y="16" text-anchor="middle" font-size="12.5" font-weight="900" fill="${summer ? "#2E6EA8" : "#8A6A2E"}">${summer ? "(가)" : "(나)"}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 160" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="계절풍의 두 방향 — (가)와 (나) 비교 그림">
    ${panel(0, true)}${panel(172, false)}
  </svg>`;
}

/* ---------- L3: 종교 분포 지도 ---------- */
const REL_PAL = { bud: "#E8B93C", hin: "#E8590C", isl: "#2E9E5B", chr: "#7A5CB8", etc: "#C8CFD8" };

export function religionMapFig(opts?: { letters?: { lon: number; lat: number; t: string }[] }): string {
  const P = (poly: [number, number][], color: string): string => `<path d="${polyPath(poly)}" fill="${color}" opacity=".62"/>`;
  const inner = `
    <g clip-path="url(#s2-lclip)">
      <path d="${polyPath(ASIA.regions.find((r) => r.id === "east")!.poly)}" fill="${REL_PAL.etc}" opacity=".5"/>
      ${P(ASIA.regions.find((r) => r.id === "southwest")!.poly, REL_PAL.isl)}
      ${P(ASIA.regions.find((r) => r.id === "central")!.poly, REL_PAL.isl)}
      ${P([[61, 25.5], [62, 29.5], [66, 30], [69.5, 32], [71, 34], [73, 36.8], [75.5, 34.5], [71, 27.5], [68, 24], [66, 24.5], [62, 25]], REL_PAL.isl)}
      ${P([[87.8, 21.2], [88.2, 26.4], [92.3, 26], [92.6, 21.5], [90, 20.8]], REL_PAL.isl)}
      ${P([[95, 6], [103, 7.2], [104, 1.5], [113, 4], [119, 5.8], [127, 1.5], [135, -1], [141, -2.5], [141, -9.5], [130, -9], [120, -11], [110, -9.5], [103, -6], [97, -1], [94, 3]], REL_PAL.isl)}
      ${P([[68, 23.5], [72, 32], [76, 34], [80, 31.5], [85, 28.8], [88, 27.8], [92, 27.5], [96, 28.5], [97, 27], [94, 24], [92, 22], [89, 22], [87, 21], [80, 15.5], [77, 8], [72.5, 19], [69, 22]], REL_PAL.hin)}
      ${P([[92, 23], [95, 26], [98, 25.5], [101, 21], [105, 22], [107.5, 20.5], [108, 17], [109, 11], [105, 8.5], [100, 12], [97.5, 9], [95, 15], [92, 15]], REL_PAL.bud)}
      ${P([[90, 48], [98, 52], [108, 52], [116, 50], [119, 46], [111, 43], [97, 42], [90, 45]], REL_PAL.bud)}
      ${P([[79.6, 10], [82, 8.8], [81.7, 5.8], [79.8, 6]], REL_PAL.bud)}
      ${P([[116.8, 7], [116.8, 19], [122.3, 19.7], [127, 7], [125, 5.2], [120, 5]], REL_PAL.chr)}
    </g>
    ${letterMarks(opts?.letters)}`;
  const pal: [string, string][] = [[REL_PAL.bud, "불교"], [REL_PAL.hin, "힌두교"], [REL_PAL.isl, "이슬람교"], [REL_PAL.chr, "크리스트교"], [REL_PAL.etc, "기타"]];
  const legend = `<g font-size="9.5" font-weight="800">
    ${pal.map(([c, n], i) => `<g transform="translate(${CROP.x + 12 + i * 64} ${CROP.y + CROP.h + 24})">
      <rect x="0" y="-9" width="11" height="11" rx="3" fill="${c}"/><text x="15" y="1" fill="#4E5968">${n}</text></g>`).join("")}
  </g>`;
  return mapShell(inner, { legend, aria: "아시아의 종교 분포 지도 — 지역마다 주로 믿는 종교" });
}

/* ---------- L5: 인구 분포 점묘 지도(hotspot 배경·pad0) ---------- */
export function asiaPopFig(): string {
  const r = rng(20260718);
  const cluster = (lon: number, lat: number, radius: number, n: number): string => {
    let dots = "";
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * radius;
      const x = lonToX(lon + Math.cos(a) * d);
      const y = latToY(lat + Math.sin(a) * d * 0.8);
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="#C0392E" opacity=".8"/>`;
    }
    return dots;
  };
  const inner = `
    <g clip-path="url(#s2-lclip)">
      ${cluster(80, 26, 8, 46)}${cluster(78, 13, 5, 22)}${cluster(70, 29.5, 4, 14)}${cluster(90, 24, 2.6, 18)}
      ${cluster(115, 33, 8, 44)}${cluster(111, 25, 5, 20)}${cluster(127.5, 36.5, 2.2, 9)}${cluster(137, 35.6, 3.5, 13)}
      ${cluster(110, -7, 3.2, 15)}${cluster(103, 14.5, 5, 11)}${cluster(121, 14.5, 3, 7)}
      ${cluster(45, 31, 5, 6)}${cluster(51, 26, 4, 4)}${cluster(66, 41, 6, 5)}${cluster(92, 50, 8, 3)}
    </g>`;
  return mapShell(inner, { aria: "아시아의 인구 분포 점 지도 — 점이 빽빽할수록 사람이 많이 사는 곳" });
}

/* ---------- L6: 인구 구조 실루엣 비교(퀴즈) ---------- */
export function pyramidPairFig(): string {
  const panel = (x0: number, kind: "pyr" | "inv", tag: string): string => {
    const rows = 9;
    let bars = "";
    for (let i = 0; i < rows; i++) {
      const t = i / (rows - 1); // 0 아래 → 1 위
      const w = kind === "pyr" ? 118 - t * 96 : 44 + t * 56 - (t > 0.82 ? (t - 0.82) * 150 : 0);
      const y = 128 - i * 12;
      bars += `<rect x="${(80 - w / 2).toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="9.5" rx="2" fill="${kind === "pyr" ? "#F2A72E" : "#4E7CB8"}" opacity="${0.55 + 0.05 * i}"/>`;
    }
    return `<g transform="translate(${x0} 0)">
      <rect x="2" y="6" width="156" height="150" rx="12" fill="#F7F9FC" stroke="#E2E8F0"/>
      ${bars}
      <line x1="80" y1="18" x2="80" y2="140" stroke="#8A93A6" stroke-width=".8" stroke-dasharray="3 3"/>
      <text x="80" y="152" text-anchor="middle" font-size="10" font-weight="800" fill="#6B7684">아래 = 어린 나이</text>
      <text x="80" y="30" text-anchor="middle" font-size="12.5" font-weight="900" fill="#2E3A50">${tag}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 320 162" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="두 인구 구조 그래프 비교 — 아래가 넓은 (가), 위가 넓은 (나)">
    ${panel(0, "pyr", "(가)")}${panel(160, "inv", "(나)")}
  </svg>`;
}

/* ---------- L7: 산업 지도(개념 그림) ---------- */
export function asiaIndustryFig(): string {
  const badge = (lon: number, lat: number, icon: string, fill: string): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<g transform="translate(${(x - 11).toFixed(1)} ${(y - 11).toFixed(1)})">
      <circle cx="11" cy="11" r="13.5" fill="#FFFFFF" opacity=".92"/>
      <circle cx="11" cy="11" r="13.5" fill="none" stroke="${fill}" stroke-width="1.6"/>
      <g transform="translate(2 2) scale(.75)">${icon}</g>
    </g>`;
  };
  const oil = `<path d="M4 21 10 4h1.6L8 21zM20 21 13.6 4H12l4 17z" fill="#5A6B7E"/><path d="M6.5 14h11M8.2 9h7.6" stroke="#5A6B7E" stroke-width="1.6"/><path d="M12 2.6q2.6 3.2 0 5-2.6-1.8 0-5z" fill="#2E3A48"/>`;
  const sew = `<rect x="3" y="14" width="18" height="4" rx="1.6" fill="#8A5AC2"/><path d="M6 14V8q6-4 12 0v6" stroke="#8A5AC2" stroke-width="2" fill="none"/><path d="M12 5v6" stroke="#8A5AC2" stroke-width="1.8"/><circle cx="12" cy="12" r="1.4" fill="#8A5AC2"/>`;
  const chip = `<rect x="6" y="6" width="12" height="12" rx="2.4" fill="#3A4658"/><rect x="9" y="9" width="6" height="6" rx="1.4" fill="#8ED2F5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="#5A6B7E" stroke-width="1.8" stroke-linecap="round"/>`;
  const film = `<rect x="4" y="6" width="16" height="12" rx="2.4" fill="#E2574C"/><path d="M4 9h16M4 15h16" stroke="#fff" stroke-width="1.2" opacity=".7"/><path d="M10 10.5l4 1.5-4 1.5z" fill="#fff"/>`;
  const rice2 = `<path d="M12 21c-1-5-1-10 1-15" stroke="#5A8A2E" stroke-width="1.8" stroke-linecap="round"/><path d="M13 6q-3-1-4-4 3 0 4 4zM13.4 9q-3.4-.6-5-3.4 3.4-.2 5 3.4z" fill="#8CAE5A"/><path d="M13 6q2.6-1.6 5.4-.8-1.4 2.8-5.4.8z" fill="#A8C86E"/>`;
  const inner = `
    ${badge(46, 26, oil, "#5A6B7E")}${badge(52.5, 37, oil, "#5A6B7E")}
    ${badge(90, 23.5, sew, "#8A5AC2")}${badge(106, 16, sew, "#8A5AC2")}${badge(79, 21, sew, "#8A5AC2")}
    ${badge(113, 33, chip, "#3F8FC8")}${badge(127.5, 37, chip, "#3F8FC8")}${badge(138, 36.5, chip, "#3F8FC8")}
    ${badge(128.5, 34, film, "#E2574C")}
    ${badge(101, 15, rice2, "#5A8A2E")}${badge(110, -7, rice2, "#5A8A2E")}
  `;
  // 범례에도 지도와 같은 아이콘을 넣는다 — 빈 원만 있으면 "모양이 안 보인다"(실사용 피드백)
  const legIcon = (cx: number, icon: string): string => `<g transform="translate(${cx - 6} -10) scale(.5)">${icon}</g>`;
  const legend = `<g font-size="9.5" font-weight="800" fill="#4E5968">
    <g transform="translate(${CROP.x + 8} ${CROP.y + CROP.h + 24})">
      <circle cx="6" cy="-4" r="8" fill="#fff" stroke="#5A6B7E" stroke-width="1.4"/>${legIcon(6, oil)}<text x="18" y="0">석유·천연자원</text>
      <circle cx="106" cy="-4" r="8" fill="#fff" stroke="#8A5AC2" stroke-width="1.4"/>${legIcon(106, sew)}<text x="118" y="0">의류·제조 공장</text>
      <circle cx="208" cy="-4" r="8" fill="#fff" stroke="#3F8FC8" stroke-width="1.4"/>${legIcon(208, chip)}<text x="220" y="0">첨단·문화</text>
      <circle cx="292" cy="-4" r="8" fill="#fff" stroke="#5A8A2E" stroke-width="1.4"/>${legIcon(292, rice2)}<text x="304" y="0">벼농사</text>
    </g>
  </g>`;
  return mapShell(inner, { legend, aria: "아시아의 주요 산업 분포 지도" });
}

/* ---------- L8: 공장의 이사(퀴즈 그림) ---------- */
export function factoryMoveFig(): string {
  const fac = (lon: number, lat: number, s: number, faded: boolean): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${faded ? 0.45 : 1}">
      <rect x="-11" y="-6" width="22" height="12" rx="1.6" fill="#8A99B2" stroke="#5A6880" stroke-width="1"/>
      <path d="M-11 -6 l5.5 -4 v4 l5.5 -4 v4 l5.5 -4 v4" fill="#AAB8CC" stroke="#5A6880" stroke-width="1"/>
      <rect x="6" y="-14" width="3.4" height="8" fill="#5A6880"/>
      <rect x="-7" y="-2" width="4" height="4" fill="#E8EEF6"/><rect x="0" y="-2" width="4" height="4" fill="#E8EEF6"/>
    </g>`;
  };
  const arrow = (a: [number, number], b: [number, number]): string => {
    const x1 = lonToX(a[0]);
    const y1 = latToY(a[1]);
    const x2 = lonToX(b[0]);
    const y2 = latToY(b[1]);
    const mx = (x1 + x2) / 2;
    const my = Math.min(y1, y2) - 16;
    return `<path d="M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" stroke="#E8590C" stroke-width="2.6" fill="none" stroke-dasharray="7 5" marker-end="url(#s2-arr)"/>`;
  };
  const inner = `
    <defs><marker id="s2-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="#E8590C"/></marker></defs>
    ${fac(112, 33, 1.15, false)}
    ${fac(106, 17, 0.95, true)}${fac(79, 22, 0.95, true)}${fac(90, 24.5, 0.85, true)}
    ${arrow([110, 30.5], [107, 19.5])}${arrow([108.5, 32], [82, 24])}
    <text x="${lonToX(114)}" y="${latToY(37.5)}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#2E3A50">㉠</text>
    <text x="${lonToX(103)}" y="${latToY(11.5)}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#2E3A50">㉡</text>
    <text x="${lonToX(77)}" y="${latToY(17)}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#2E3A50">㉢</text>
  `;
  return mapShell(inner, { aria: "공장이 옮겨 가는 방향을 나타낸 아시아 지도 — 한 나라에서 화살표가 두 지역으로 뻗어 있다" });
}

/* ---------- L4: 공존의 도시 figTabs 아트 ---------- */
export function singaporeFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="s2-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8E8F5"/><stop offset="1" stop-color="#EEF5FB"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#s2-sg)"/>
    <g>
      <rect x="22" y="26" width="130" height="140" rx="10" fill="#FFFFFF" stroke="#C4CFDC" stroke-width="1.6"/>
      <rect x="22" y="26" width="130" height="30" rx="10" fill="#E8590C"/>
      <!-- 헤더 아래 라운드만 가리는 패치 — 넓게 잡으면 흰 글자 밑이 잘린다(달력 훅과 같은 실사고) -->
      <rect x="23.5" y="46" width="127" height="10" fill="#FFFFFF"/>
      <text x="87" y="41" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">공휴일 달력</text>
      <g>${[0, 1, 2, 3].map((r2) => [0, 1, 2, 3, 4, 5, 6].map((c) => `<rect x="${32 + c * 16}" y="${66 + r2 * 24}" width="11" height="11" rx="2.4" fill="#E8ECF2"/>`).join("")).join("")}</g>
      <circle cx="53.5" cy="71.5" r="9" fill="none" stroke="#E8B93C" stroke-width="2.6"/>
      <circle cx="117.5" cy="95.5" r="9" fill="none" stroke="#E8590C" stroke-width="2.6"/>
      <circle cx="69.5" cy="119.5" r="9" fill="none" stroke="#2E9E5B" stroke-width="2.6"/>
      <circle cx="101.5" cy="143.5" r="9" fill="none" stroke="#7A5CB8" stroke-width="2.6"/>
    </g>
    <g transform="translate(180 40)">
      <path d="M8 96V52l14-12 14 12v44z" fill="#F2E2C4" stroke="#C2A87A" stroke-width="1.4"/>
      <path d="M22 40v-8M18.5 35.5q3.5-3 7 0" stroke="#C2843A" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M52 96V58q0-14 12-14t12 14v38z" fill="#EDE8DC" stroke="#A89878" stroke-width="1.4"/>
      <path d="M64 44v-7" stroke="#C2A85A" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M96 96V60l10-16 10 16v36z" fill="#E2D8EE" stroke="#9A86BE" stroke-width="1.4"/>
      <path d="M106 44v-8M102 40h8" stroke="#7A5CB8" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="60" cy="102" rx="58" ry="5" fill="#2A3A5E" opacity=".1"/>
    </g>
    <text x="160" y="180" text-anchor="middle" font-size="12.5" font-weight="900" fill="#2E4A78">여러 종교의 기념일이 나란히 공휴일이에요</text>
  </svg>`;
}

export function malaysiaFig(): string {
  const person = (x: number, cloth: string): string => `
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="${x}" cy="96" r="7" fill="#FFE8CE"/>
      <path d="M${x} 103v7M${x} 106l-8 5M${x} 106l8 5"/>
      <path d="M${x - 8} 110h16l3 26h-22z" fill="${cloth}" stroke="none"/>
      <path d="M${x - 4} 136l-3 14M${x + 4} 136l3 14"/>
    </g>`;
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="s2-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5E8D2"/><stop offset="1" stop-color="#FBF4E6"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#s2-my)"/>
    <path d="M20 26q140 26 280 0" stroke="#C4CFDC" stroke-width="2" fill="none"/>
    ${[44, 84, 124, 164, 204, 244].map((x, i) => `<path d="M${x} ${30 + (i % 2) * 3}l6 12 8-9z" fill="${["#E8590C", "#2E9E5B", "#E8B93C", "#7A5CB8", "#3F8FC8", "#E2574C"][i]}"/>`).join("")}
    <ellipse cx="160" cy="154" rx="120" ry="8" fill="#2A3A5E" opacity=".1"/>
    ${person(70, "#2E9E5B")}${person(115, "#E8B93C")}${person(160, "#E8590C")}${person(205, "#7A5CB8")}${person(250, "#3F8FC8")}
    <path d="M92 118q10-8 18 0M182 118q10-8 18 0" stroke="#8A93A6" stroke-width="1.6" fill="none" opacity=".6"/>
    <text x="160" y="180" text-anchor="middle" font-size="12.5" font-weight="900" fill="#8A4A1E">서로 다른 옷과 종교가 한 행렬로 — 문화 화합 행진</text>
  </svg>`;
}

/* ---------- L8: 두바이의 변신 figTabs 아트 ---------- */
export function dubaiOldFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="s2-du1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5DFB8"/><stop offset="1" stop-color="#FBEFDA"/></linearGradient>
    <linearGradient id="s2-du1s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC4EC"/><stop offset="1" stop-color="#4394CC"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#s2-du1)"/>
    <rect y="120" width="320" height="70" fill="url(#s2-du1s)"/>
    <path d="M0 120h320" stroke="#DCF2FF" stroke-width="2" opacity=".7"/>
    <g>
      <path d="M96 132q34 12 68 0l-8 14h-52z" fill="#8A5A26"/>
      <path d="M130 132V96" stroke="#5A4326" stroke-width="3"/>
      <path d="M130 96q26 10 0 36" fill="#F2F4F8" stroke="#AAB4C4" stroke-width="1.4"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="112" cy="128" r="6.5" fill="#FFE8CE"/>
      <path d="M112 134v9M112 137l-7 4M112 137l8 2"/>
    </g>
    <circle cx="122" cy="141" r="5" fill="#F2ECDE" stroke="#B0A488" stroke-width="1.4"/>
    <circle cx="122" cy="140" r="1.6" fill="#F5E8D2"/>
    <g>
      <path d="M36 96q10-18 26-22M36 96q16-14 30-10" stroke="#C2A87A" stroke-width="2" fill="none"/>
      <path d="M20 120q16-30 42-46" stroke="#8A6A3E" stroke-width="2.4" fill="none"/>
    </g>
    <circle cx="272" cy="38" r="13" fill="#FFC24D"/><circle cx="272" cy="38" r="19" fill="#FFC24D" opacity=".22"/>
    <text x="160" y="176" text-anchor="middle" font-size="12.5" font-weight="900" fill="#7A5A28">진주조개를 캐던 작은 어촌</text>
  </svg>`;
}

export function dubaiOilFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="s2-du2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D0A0"/><stop offset="1" stop-color="#FAE8CC"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#s2-du2)"/>
    <rect y="132" width="320" height="58" fill="#E8CE9C"/>
    <ellipse cx="160" cy="150" rx="110" ry="7" fill="#2A3A5E" opacity=".1"/>
    <g stroke="#5A6B7E" stroke-width="3" fill="none">
      <path d="M96 140 116 62h6l20 78M100 122h38M104 104h30M108 86h22"/>
      <path d="M119 62l-22-12M119 62l24-10" stroke-width="2.4"/>
    </g>
    <path d="M119 50q4 6 0 12-4-6 0-12z" fill="#2E3A48"/>
    <g>
      <rect x="196" y="112" width="34" height="30" rx="4" fill="#3A4658"/>
      <rect x="238" y="112" width="34" height="30" rx="4" fill="#3A4658"/>
      <path d="M196 120h34M238 120h34" stroke="#5A6B7E" stroke-width="2"/>
      <ellipse cx="204" cy="116" rx="6" ry="2" fill="#fff" opacity=".2"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="62" cy="118" r="6.5" fill="#FFE8CE"/>
      <path d="M62 124v10M62 127l-7 4M62 127l9 2M62 134l-6 10M62 134l6 10"/>
      <path d="M71 128l10-4" stroke="#8A93A6"/>
    </g>
    <text x="160" y="176" text-anchor="middle" font-size="12.5" font-weight="900" fill="#8A5A18">석유 발견 — 검은 황금의 시대</text>
  </svg>`;
}

export function dubaiNowFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="s2-du3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8DCF0"/><stop offset="1" stop-color="#E8F3FA"/></linearGradient>
    <linearGradient id="s2-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEEF8"/><stop offset=".6" stop-color="#9CC6E2"/><stop offset="1" stop-color="#6E9EC2"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#s2-du3)"/>
    <rect y="140" width="320" height="50" fill="#E8D8AC"/>
    <ellipse cx="160" cy="152" rx="120" ry="7" fill="#2A3A5E" opacity=".1"/>
    <g stroke="#4E6E90" stroke-width="1.4">
      <path d="M150 140V34l12-14 12 14v106z" fill="url(#s2-glass)"/>
      <path d="M162 26v114" stroke="#7FA8C8"/>
      <rect x="92" y="70" width="30" height="70" rx="3" fill="url(#s2-glass)"/>
      <rect x="204" y="60" width="26" height="80" rx="3" fill="url(#s2-glass)"/>
      <path d="M244 140q0-52 26-52 14 0 14 22v30z" fill="url(#s2-glass)"/>
      <rect x="52" y="92" width="24" height="48" rx="3" fill="url(#s2-glass)"/>
    </g>
    <path d="M96 78h22M96 92h22M208 70h18M208 84h18" stroke="#F2F8FC" stroke-width="2" opacity=".8"/>
    <path d="M28 44l20-6-4 8q10 0 14 6l-24 4q-8-6-6-12z" fill="#E8EEF6" stroke="#7A8698" stroke-width="1.4"/>
    <path d="M44 56q10 6 22 6" stroke="#C4CFDC" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M262 152q10-6 20 0M234 158q10-6 20 0" stroke="#5BB8E8" stroke-width="2.2" stroke-linecap="round"/>
    <text x="160" y="180" text-anchor="middle" font-size="12.5" font-weight="900" fill="#2E4A78">관광·금융의 도시로 — 석유 이후를 준비해요</text>
  </svg>`;
}

/* ---------- recap 미니아트(64×64 플랫) ---------- */
const M = (inner: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;

export function soc2MiniArt(key: string): string {
  switch (key) {
    case "fiveregions": // 다섯 조각 대륙
      return M(
        `<path d="M14 20q6-8 16-6l12 2q8 2 8 10l-2 10q-2 8-10 8l-16-2q-8-2-9-10z" fill="#F2ECDE" stroke="#8A93A6" stroke-width="2"/>
        <path d="M30 14l4 12M22 34l12-6M34 26l14 4M34 26l-4 14" stroke="#8A93A6" stroke-width="1.6" stroke-dasharray="3 3"/>
        <circle cx="26" cy="22" r="3.4" fill="#E2574C"/><circle cx="40" cy="22" r="3.4" fill="#3F8FC8"/><circle cx="24" cy="38" r="3.4" fill="#F2A72E"/><circle cx="40" cy="38" r="3.4" fill="#2E9E5B"/><circle cx="16" cy="30" r="3.4" fill="#8A5AC2"/>
        <path d="M12 52q20 8 40 0" stroke="#4E9AE8" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "asiaposition": // 대륙 위치(지구본 위 아시아)
      return M(
        `<circle cx="32" cy="32" r="22" fill="#4E9AE8"/>
        <path d="M28 18q12-4 20 4l-2 12q-6 8-16 6l-8-6q-2-10 6-16z" fill="#3E9E5C"/>
        <circle cx="32" cy="32" r="22" fill="none" stroke="#2E6EA8" stroke-width="2"/>
        <path d="M10 32h44" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 4" opacity=".7"/>`,
      );
    case "regioncity": // 지역-도시 핀
      return M(
        `<path d="M32 8q12 0 12 12 0 10-12 24-12-14-12-24 0-12 12-12z" fill="#E8590C"/>
        <circle cx="32" cy="20" r="5.5" fill="#fff"/>
        <path d="M14 52q18 8 36 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>
        <circle cx="20" cy="50" r="3" fill="#3F8FC8"/><circle cx="44" cy="50" r="3" fill="#2E9E5B"/>`,
      );
    case "roofworld": // 세계의 지붕(히말라야)
      return M(
        `<path d="M6 46 22 18l8 12 8-16 14 32z" fill="#8FA5BE"/>
        <path d="M34 22l4-8 5 10q-5 4-9-2zM19 24l3-6 4 8q-4 3-7-2z" fill="#F2F7FB"/>
        <path d="M6 46h52" stroke="#5A7090" stroke-width="2"/>
        <circle cx="52" cy="14" r="6" fill="#FFC24D"/>`,
      );
    case "ringfire": // 불의 고리
      return M(
        `<path d="M46 10q10 16 0 34-8 12-22 12" stroke="#E2574C" stroke-width="3.4" stroke-dasharray="6 5" fill="none" stroke-linecap="round"/>
        <path d="M18 40l6-10 6 10z" fill="#C25C3E"/><path d="M40 24l5-8 5 8z" fill="#C25C3E"/>
        <path d="M23 28q2-3 4 0M44 14q2-3 4 0" stroke="#E8825A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "monsoon": // 계절풍(뒤집히는 화살표)
      return M(
        `<path d="M10 44q14-6 24-2" stroke="#4E9AE8" stroke-width="4" stroke-linecap="round"/>
        <path d="M34 42l8-2-4 8z" fill="#4E9AE8"/>
        <path d="M54 20q-14 6-24 2" stroke="#C29434" stroke-width="4" stroke-linecap="round"/>
        <path d="M30 22l-8 2 4-8z" fill="#C29434"/>
        <path d="M14 26l-2 5M20 24l-2 5" stroke="#4E9AE8" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "ricebowl": // 벼농사
      return M(
        `<path d="M32 40c-1-8-1-16 2-24" stroke="#5A8A2E" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M34 16q-5-2-7-7 5 0 7 7zM35 22q-6-1-9-6 6-1 9 6zM33 28q-6 0-9-5 6-2 9 5z" fill="#8CAE5A"/>
        <path d="M34 16q4-3 9-2-2 5-9 2z" fill="#A8C86E"/>
        <ellipse cx="32" cy="48" rx="17" ry="6" fill="#5BB8E8" opacity=".5"/>
        <path d="M20 48h24" stroke="#4E9AE8" stroke-width="2"/>`,
      );
    case "fourfaith": // 네 종교 상징 지붕
      return M(
        `<path d="M8 40V26l6-8 6 8v14z" fill="#E8B93C" opacity=".9"/>
        <path d="M24 40V28q0-8 6-8t6 8v12z" fill="#2E9E5B" opacity=".9"/>
        <path d="M42 40V26l5-8 5 8v14z" fill="#7A5CB8" opacity=".9"/>
        <path d="M47 16v-5M44.5 13.5h5" stroke="#5A3E96" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 48h48" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>
        <path d="M14 12v6M11 15h6" stroke="#B0803A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "prayground": // 갠지스강(강+계단)
      return M(
        `<path d="M10 18h14v6h-6v6h-6v6h-2z" fill="#D8C8A0"/>
        <path d="M10 44q22-10 44 0v8H10z" fill="#4E9AE8" opacity=".8"/>
        <path d="M18 40q6-3 12 0M34 38q6-3 12 0" stroke="#8ED2F5" stroke-width="2" stroke-linecap="round"/>
        <circle cx="30" cy="30" r="4.5" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.6"/>
        <path d="M30 34v6" stroke="#3C4654" stroke-width="1.6"/>
        <circle cx="52" cy="14" r="6" fill="#FFC24D"/>`,
      );
    case "halalfood": // 할랄 인증
      return M(
        `<circle cx="32" cy="30" r="18" fill="#fff" stroke="#1E9E50" stroke-width="3.4"/>
        <path d="M25 22v16M25 30h8M33 22v16" stroke="#1E9E50" stroke-width="3" stroke-linecap="round"/>
        <path d="M41 38q-3-2-3-8t3-8" stroke="#1E9E50" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M18 52q14 6 28 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "coexist": // 공존(두 손 + 별)
      return M(
        `<path d="M8 40q10-10 20-3l4 4q3 4-2 7l-8 5q-9 5-14-13z" fill="#F5C89A"/>
        <path d="M56 40q-10-10-20-3" stroke="#E8A16A" stroke-width="4" stroke-linecap="round"/>
        <path d="M32 10l2.4 6 6.4.4-5 4.2 1.6 6.4-5.4-3.6-5.4 3.6 1.6-6.4-5-4.2 6.4-.4z" fill="#F2A72E"/>`,
      );
    case "conflictcare": // 갈등을 줄이는 손(중립)
      return M(
        `<circle cx="22" cy="26" r="9" fill="#2E9E5B" opacity=".8"/>
        <circle cx="42" cy="26" r="9" fill="#E8590C" opacity=".8"/>
        <path d="M28 30q4 4 8 0" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 48q20 10 40 0" stroke="#4E9AE8" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M12 48v-5M52 48v-5" stroke="#4E9AE8" stroke-width="3.4" stroke-linecap="round"/>`,
      );
    case "lawheart": // 제도(방패)와 마음(하트)
      return M(
        `<path d="M20 10h24v16q0 14-12 20-12-6-12-20z" fill="#4E7CB8" opacity=".9"/>
        <path d="M26 26l5 5 9-10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M44 44c1.8-2.6 5.4-1.8 6 .6.6-2.4 4.2-3.2 6-.6 1.6 2.4-.4 5.2-6 8.8-5.6-3.6-7.6-6.4-6-8.8z" fill="#E23B4B"/>`,
      );
    case "sixtypercent": // 세계 인구 속 아시아(원그래프)
      return M(
        `<circle cx="32" cy="32" r="20" fill="#E2E8F0"/>
        <path d="M32 12a20 20 0 1 1-19 26l19-6z" fill="#E8590C"/>
        <circle cx="32" cy="32" r="20" fill="none" stroke="#8A93A6" stroke-width="1.6"/>
        <circle cx="27" cy="27" r="2.4" fill="#fff"/><circle cx="37" cy="24" r="2.4" fill="#fff"/><circle cx="38" cy="34" r="2.4" fill="#fff"/><circle cx="30" cy="38" r="2.4" fill="#fff"/>`,
      );
    case "popmove": // 인구 이동(화살표와 가방)
      return M(
        `<circle cx="18" cy="20" r="6" fill="#FFE8CE" stroke="#3C4654" stroke-width="2"/>
        <path d="M18 26v12M18 30l-6 4M18 30l6 4M18 38l-5 10M18 38l5 10" stroke="#3C4654" stroke-width="2" fill="none"/>
        <rect x="26" y="36" width="10" height="8" rx="2" fill="#C2843A"/>
        <path d="M34 22q10-6 18 2" stroke="#E8590C" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M50 20l4 4-6 2z" fill="#E8590C"/>`,
      );
    case "refugee": // 난민(집을 떠나는 발걸음 — 중립)
      return M(
        `<path d="M10 26 20 16l10 10v14H10z" fill="#C8CFD8"/>
        <path d="M14 40v-8h6v8" fill="#8A93A6"/>
        <path d="M38 30q8 0 14 6" stroke="#4E9AE8" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5"/>
        <circle cx="42" cy="20" r="5" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.8"/>
        <path d="M42 25v9M42 28l-5 3M42 28l5 3M42 34l-4 9M42 34l4 9" stroke="#3C4654" stroke-width="1.8" fill="none"/>`,
      );
    case "pyramidwide": // 아래 넓은 피라미드
      return M(
        `<rect x="12" y="42" width="40" height="8" rx="2" fill="#F2A72E"/>
        <rect x="18" y="32" width="28" height="8" rx="2" fill="#F2A72E" opacity=".85"/>
        <rect x="24" y="22" width="16" height="8" rx="2" fill="#F2A72E" opacity=".7"/>
        <rect x="29" y="12" width="6" height="8" rx="2" fill="#F2A72E" opacity=".55"/>`,
      );
    case "pyramidnarrow": // 위 넓은 역피라미드
      return M(
        `<rect x="26" y="42" width="12" height="8" rx="2" fill="#4E7CB8" opacity=".6"/>
        <rect x="20" y="32" width="24" height="8" rx="2" fill="#4E7CB8" opacity=".75"/>
        <rect x="15" y="22" width="34" height="8" rx="2" fill="#4E7CB8" opacity=".9"/>
        <rect x="12" y="12" width="40" height="8" rx="2" fill="#4E7CB8"/>`,
      );
    case "futuretwo": // 두 갈래 미래
      return M(
        `<path d="M32 52V32" stroke="#8A93A6" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 32Q22 24 16 12M32 32q10-8 16-20" stroke="#8A93A6" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="16" cy="12" r="6" fill="#2E9E5B"/><path d="M13 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="12" r="6" fill="#F2A72E"/><path d="M48 9v4M48 15.5v.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
      );
    case "threeengines": // 산업 세 기둥
      return M(
        `<rect x="10" y="30" width="12" height="22" rx="3" fill="#5A6B7E"/>
        <rect x="26" y="22" width="12" height="30" rx="3" fill="#8A5AC2"/>
        <rect x="42" y="12" width="12" height="40" rx="3" fill="#3F8FC8"/>
        <path d="M13 26l3-8 3 8M29 18l3-8 3 8" stroke="#AAB4C4" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      );
    case "oilfield": // 석유(데릭)
      return M(
        `<path d="M20 52 30 16h4l10 36M23 42h18M25 33h14M27 24h10" stroke="#5A6B7E" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M32 8q4 5 0 10-4-5 0-10z" fill="#2E3A48"/>`,
      );
    case "sewfactory": // 재봉(제조업)
      return M(
        `<rect x="10" y="40" width="44" height="8" rx="3" fill="#8A5AC2"/>
        <path d="M18 40V22q14-10 28 0v18" stroke="#8A5AC2" stroke-width="3.4" fill="none"/>
        <path d="M32 14v18" stroke="#8A5AC2" stroke-width="2.6"/>
        <circle cx="32" cy="36" r="2.6" fill="#8A5AC2"/>
        <path d="M22 52h20" stroke="#AAB4C4" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "chipwave": // 첨단(칩)
      return M(
        `<rect x="18" y="18" width="28" height="28" rx="5" fill="#3A4658"/>
        <rect x="26" y="26" width="12" height="12" rx="3" fill="#8ED2F5"/>
        <path d="M24 10v8M32 10v8M40 10v8M24 46v8M32 46v8M40 46v8M10 24h8M10 32h8M10 40h8M46 24h8M46 32h8M46 40h8" stroke="#5A6B7E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "movefactory": // 공장의 이사
      return M(
        `<rect x="10" y="26" width="20" height="14" rx="2" fill="#8A99B2"/>
        <path d="M10 26l5-4v4l5-4v4l5-4v4" fill="#AAB8CC"/>
        <circle cx="15" cy="44" r="3.4" fill="#3A4658"/><circle cx="25" cy="44" r="3.4" fill="#3A4658"/>
        <path d="M34 32q10-8 18 0" stroke="#E8590C" stroke-width="3" stroke-linecap="round" fill="none" stroke-dasharray="4 4"/>
        <path d="M50 30l5 3-6 3z" fill="#E8590C"/>`,
      );
    case "transform": // 산유국의 변신(돛단배 → 고층 빌딩)
      return M(
        `<path d="M8 46q8 4 16 0" stroke="#4E9AE8" stroke-width="3" stroke-linecap="round"/>
        <path d="M16 42V26l8 12z" fill="#F2F4F8" stroke="#8A93A6" stroke-width="1.6"/>
        <path d="M12 44h10" stroke="#8A5A26" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M28 32q6-6 12-2" stroke="#E8590C" stroke-width="2.6" stroke-linecap="round" fill="none" stroke-dasharray="3 4"/>
        <path d="M38 28l5 2-4 4z" fill="#E8590C"/>
        <path d="M44 50V22l5-6 5 6v28z" fill="#9CC6E2" stroke="#4E6E90" stroke-width="1.6"/>
        <path d="M49 16v34" stroke="#7FA8C8" stroke-width="1.2"/>
        <path d="M36 50V36h6v14z" fill="#B8D4E8" stroke="#4E6E90" stroke-width="1.4"/>
        <path d="M8 50h48" stroke="#C8B48A" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "hallyu": // 한류(음표 지구)
      return M(
        `<circle cx="28" cy="34" r="16" fill="#4E9AE8"/>
        <path d="M20 28q6-6 13-1-4 7-11 4zM30 40q7-3 9 3-5 5-10 1z" fill="#3E9E5C"/>
        <path d="M46 12v18q0 6-6 6t-6-6 6-6q3 0 6 2" stroke="#E8590C" stroke-width="3" fill="none"/>
        <path d="M46 12l8 3" stroke="#E8590C" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "handshake": // 우리나라와 아시아(맞잡음)
      return M(
        `<path d="M8 34q10-10 20-2l6 5q3 4-2 7l-9 6q-10 5-15-16z" fill="#F5C89A"/>
        <path d="M56 34q-10-10-20-2" stroke="#E8A16A" stroke-width="4" stroke-linecap="round"/>
        <path d="M26 14q6-6 12 0" stroke="#E8590C" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="20" r="2.4" fill="#E8590C"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="18" fill="#F2A72E"/>`);
  }
}
