// socFigures6 — 사회 Ⅵ(오세아니아와 극지방) 그림 모듈: 지역·지형·기후 지도(실데이터)·
// 극중심 원판·환류 지도·수확 달력·모식도·미니아트.
//   · 지도는 ui/worldMap.generated.ts + ui/continentMap.ts(OCEANIA) 재사용 — 대륙 손그리기 금지.
//     소품·스팟·레터는 전부 lon/lat → lonToX/latToY 계산 좌표만(audit-soc6-geo SPOTS/LETTERS와 1:1).
//   · 날짜변경선 동쪽(서경) 좌표는 언랩(+360)으로 쓰고, gpgpFig는 WORLD_LAND_PATH를 +360
//     평행이동한 사본과 합성해 태평양 중심 크롭(아메리카 서안 포함)을 만든다(생성기 무수정).
//   · 극 원판은 worldMap.generated의 POLAR_NORTH/SOUTH_PATH(방위 정거 베이크 — 미래엔 122쪽
//     도법 그대로: 북 0°=아래·남 0°=위) — polarXY로 라벨·기지 도트를 같은 식으로 얹는다.
//   · 기후 분포는 public/soc/climate.webp(쾨펜 실데이터) 육지 클립 — 범례는 교과서 4분류
//     (열대·건조·온대·고산 — 미래엔 114쪽 범례와 일치, 오세아니아는 냉·한대가 없다).
//   · 기후 그래프 수치는 실측 근사(1991~2020 반올림): 다윈(우기·건기)·앨리스스프링스(연중
//     건조)·오클랜드(연중 고른 비·연교차 작음) — 미래엔 그래프 3종 구도.
import { WORLD_LAND_PATH, POLAR_NORTH_PATH, POLAR_SOUTH_PATH, polarXY } from "./worldMap.generated";
import { CONTINENTS, lonToX, latToY, polyPath } from "./continentMap";

const OC = CONTINENTS.oceania;
const CROP = OC.crop;
const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

/* ---------- 공용 셸(Ⅴ mapShell 문법 — 오세아니아는 지역 채움 비클립) ---------- */
function mapShell(inner: string, opts?: { legend?: string; aria?: string }): string {
  const legendH = opts?.legend ? 40 : 0;
  return `<svg viewBox="${CROP.x} ${CROP.y - 6} ${CROP.w} ${CROP.h + 10 + legendH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${opts?.aria ?? "오세아니아 지도"}">
    <defs>
      <clipPath id="s6-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="s6-sea" cx=".5" cy=".4" r=".95">
        <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
      </radialGradient>
    </defs>
    <rect x="${CROP.x}" y="${CROP.y - 6}" width="${CROP.w}" height="${CROP.h + 10}" rx="12" fill="url(#s6-sea)"/>
    <line x1="${CROP.x}" y1="250" x2="${CROP.x + CROP.w}" y2="250" stroke="#7FA8C8" stroke-width="1.1" opacity=".6"/>
    <text x="${CROP.x + 5}" y="247" font-size="9.5" font-weight="700" fill="#5A7A96">적도</text>
    <line x1="${CROP.x}" y1="${latToY(-23.4).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(-23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
    <text x="${CROP.x + 5}" y="${(latToY(-23.4) - 3).toFixed(1)}" font-size="9.5" font-weight="700" fill="#5A7A96">남회귀선</text>
    <line x1="1000" y1="${CROP.y - 6}" x2="1000" y2="${CROP.y + CROP.h + 4}" stroke="#D8484C" stroke-width="1.1" stroke-dasharray="5 4" opacity=".75"/>
    <text x="997" y="${CROP.y + 8}" font-size="8.5" font-weight="800" fill="#B04046" text-anchor="end">날짜 변경선</text>
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
      <circle cx="${lonToX(m.lon).toFixed(1)}" cy="${latToY(m.lat).toFixed(1)}" r="10" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.8"/>
      <text x="${lonToX(m.lon).toFixed(1)}" y="${(latToY(m.lat) + 3.8).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#333D4B">${m.t}</text>
    </g>`,
    )
    .join("");

/* ---------- L1: 지역 구분 지도(다섯 지역 — 대양 지역이라 채움 비클립) ---------- */
export function ocRegionsFig(opts?: {
  labels?: boolean;
  letters?: { lon: number; lat: number; t: string }[];
}): string {
  const showLabels = opts?.labels !== false;
  const fills = OC.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="${r.color}" opacity=".34"/>`)
    .join("");
  const edges = OC.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="none" stroke="#7E8CA0" stroke-width=".9" stroke-dasharray="4 4" opacity=".55"/>`)
    .join("");
  const labels = showLabels
    ? OC.regions
        .map((r) => {
          const ax = lonToX(r.anchor[0]).toFixed(1);
          const ay = (latToY(r.anchor[1]) + 3.6).toFixed(1);
          return `<g>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="9.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" opacity=".85">${r.name}</text>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#2E3A50">${r.name}</text>
          </g>`;
        })
        .join("")
    : "";
  return mapShell(`${fills}${edges}${labels}${letterMarks(opts?.letters)}`, {
    aria: "오세아니아의 지역 구분 지도 — 오스트레일리아·뉴질랜드와 멜라네시아·미크로네시아·폴리네시아",
  });
}

/* ---------- L2: 지형 지도(hotspot 배경·pad0 — 호주·뉴질랜드 확대 크롭) ---------- */
// 뷰박스 "806 272 197 112"(lon 110.2~181.1 · lat -7.9~-48.2). 스팟 % 검산:
// x% = (lonToX(lon)−806)/197·100, y% = (latToY(lat)−272)/112·100 (audit-soc6-geo SPOTS와 1:1).
export const OC_TERRAIN_VB = { x: 806, y: 272, w: 197, h: 112 };
export function ocTerrainFig(): string {
  const V = OC_TERRAIN_VB;
  const mtn = (lon: number, lat: number, sc: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 4.6 * sc).toFixed(1)} ${(y + 2.7 * sc).toFixed(1)} L${x.toFixed(1)} ${(y - 4 * sc).toFixed(1)} L${(x + 4.6 * sc).toFixed(1)} ${(y + 2.7 * sc).toFixed(1)}z" fill="#B09A6E" stroke="#7E6A48" stroke-width=".6"/>`;
  };
  const volc = (lon: number, lat: number, sc: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<g><path d="M${(x - 4.2 * sc).toFixed(1)} ${(y + 2.6 * sc).toFixed(1)} L${x.toFixed(1)} ${(y - 3.6 * sc).toFixed(1)} L${(x + 4.2 * sc).toFixed(1)} ${(y + 2.6 * sc).toFixed(1)}z" fill="#B0785E" stroke="#7E4A38" stroke-width=".6"/>
      <path d="M${x.toFixed(1)} ${(y - 3.6 * sc).toFixed(1)}q${(1.6 * sc).toFixed(1)}-${(2.6 * sc).toFixed(1)} ${(3 * sc).toFixed(1)}-${(2 * sc).toFixed(1)}" stroke="#B8B4C0" stroke-width="${(1.1 * sc).toFixed(1)}" fill="none" stroke-linecap="round"/></g>`;
  };
  const river = (pts: [number, number][], w = 1.4): string => {
    const d = pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
    return `<path d="${d}" stroke="#4E9AE8" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  };
  // 러프 영역(육지 클립) — 서부 사막·대찬정 분지·머리달링 분지
  const desert: [number, number][] = [
    [114, -21], [121, -19.5], [128, -21], [130, -25], [129, -30], [124, -32], [117, -30], [114, -26],
  ];
  const basin: [number, number][] = [
    [136, -20], [142, -20], [145, -24], [144, -28], [139, -29], [135, -26], [134, -22],
  ];
  const murray: [number, number][] = [
    [140, -32], [146, -33], [148, -36], [144, -38], [140, -36],
  ];
  // 대보초 — 북동 해안 앞바다 산호 점선 호(교과서 지도 구도)
  const reefArc = "M" + [
    [143.4, -11.5], [144.6, -13.5], [146, -15.5], [147.6, -17.5], [149.6, -19.5], [151.6, -21.5],
  ].map(([lo, la]) => `${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" L");
  const inner = `
    <g clip-path="url(#s6-tclip)">
      <path d="${polyPath(desert)}" fill="#EBCF8E" opacity=".9"/>
      <path d="${polyPath(basin)}" fill="#D8E8B8" opacity=".85"/>
      <path d="${polyPath(murray)}" fill="#C8E2D8" opacity=".8"/>
    </g>
    ${river([[147.5, -25], [145.5, -29], [143.5, -33], [141.5, -34.2], [139.8, -35.2]], 1.3)}
    ${river([[150.5, -28.5], [147.5, -31], [144.5, -33.5], [141.5, -34.2]], 1.1)}
    <path d="${reefArc}" stroke="#3FB8A8" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 3" fill="none" opacity=".95"/>
    ${mtn(151.5, -26.5, 1)}${mtn(150.5, -29.5, 1.1)}${mtn(149.5, -32.5, 1.1)}${mtn(148, -35.5, 1.2)}${mtn(146.5, -37.5, 1)}${mtn(145.5, -16.5, 0.9)}${mtn(144.8, -20, 0.9)}${mtn(146.5, -23, 0.9)}
    ${volc(175.6, -39, 1)}${volc(174.1, -39.3, 0.8)}
    ${mtn(170, -43.5, 1)}${mtn(168.3, -44.8, 0.9)}
    <path d="M${lonToX(167.2).toFixed(1)} ${latToY(-45.6).toFixed(1)}q2.4-1.6 4.8 0M${lonToX(166.6).toFixed(1)} ${latToY(-46.2).toFixed(1)}q2-1.4 4 0" stroke="#8ED2F0" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  `;
  return `<svg viewBox="${V.x} ${V.y} ${V.w} ${V.h}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="오스트레일리아와 뉴질랜드의 지형 지도">
    <defs>
      <clipPath id="s6-tclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="s6-tsea" cx=".5" cy=".4" r=".95"><stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/></radialGradient>
    </defs>
    <rect x="${V.x}" y="${V.y}" width="${V.w}" height="${V.h}" fill="url(#s6-tsea)"/>
    <line x1="${V.x}" y1="${latToY(-23.4).toFixed(1)}" x2="${V.x + V.w}" y2="${latToY(-23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
    <text x="${V.x + V.w - 4}" y="${(latToY(-23.4) - 3).toFixed(1)}" text-anchor="end" font-size="8" font-weight="700" fill="#5A7A96">남회귀선</text>
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
    ${inner}
    <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".6" fill="none" fill-rule="evenodd"/>
  </svg>`;
}

/* ---------- L3: 기후 분포 지도(쾨펜 실데이터 — 호주·뉴질랜드·뉴기니 크롭) ---------- */
export function ocClimateFig(opts?: { letters?: { lon: number; lat: number; t: string }[] }): string {
  const V = { x: 806, y: 244, w: 197, h: 140 }; // lon 110.2~181.1 · lat 2.2~-48.2
  // 범례 색은 climate.webp 실제 팔레트(qa/gen-worldmap.mjs PAL)와 1:1.
  const pal: [string, string][] = [["#1E9E50", "열대"], ["#E8B93C", "건조"], ["#A5D65C", "온대"], ["#B0672A", "고산"]];
  const legend = `<g font-size="9" font-weight="800">
    ${pal.map(([c, n], i) => `<g transform="translate(${V.x + 14 + i * 46} ${V.y + V.h + 20})">
      <rect x="0" y="-8.5" width="10" height="10" rx="2.6" fill="${c}"/><text x="14" y="1" fill="#4E5968">${n}</text></g>`).join("")}
  </g>`;
  return `<svg viewBox="${V.x} ${V.y - 6} ${V.w} ${V.h + 10 + 32}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="오세아니아의 기후 분포 지도">
    <defs>
      <clipPath id="s6-cclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="s6-csea" cx=".5" cy=".4" r=".95"><stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/></radialGradient>
    </defs>
    <rect x="${V.x}" y="${V.y - 6}" width="${V.w}" height="${V.h + 10}" rx="12" fill="url(#s6-csea)"/>
    <line x1="${V.x}" y1="250" x2="${V.x + V.w}" y2="250" stroke="#7FA8C8" stroke-width="1" opacity=".6"/>
    <text x="${V.x + 4}" y="247" font-size="8.5" font-weight="700" fill="#5A7A96">적도</text>
    <line x1="${V.x}" y1="${latToY(-23.4).toFixed(1)}" x2="${V.x + V.w}" y2="${latToY(-23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
    <text x="${V.x + V.w - 4}" y="${(latToY(-23.4) - 3).toFixed(1)}" text-anchor="end" font-size="8.5" font-weight="700" fill="#5A7A96">남회귀선</text>
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
    <image href="${BASE}soc/climate.webp" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" clip-path="url(#s6-cclip)" opacity=".92"/>
    <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".6" fill="none" fill-rule="evenodd"/>
    ${letterMarks(opts?.letters)}
    ${legend}
  </svg>`;
}

/* ---------- L3: 기후 그래프 3패널(다윈·앨리스스프링스·오클랜드 — 실측 근사) ---------- */
const DW_T = [29, 29, 29, 29, 27, 25, 25, 26, 28, 29, 30, 29];
const DW_P = [430, 370, 320, 100, 20, 2, 1, 5, 15, 70, 140, 250];
const AS_T = [29, 28, 25, 20, 15, 12, 12, 14, 18, 23, 26, 28];
const AS_P = [40, 42, 32, 17, 18, 13, 15, 9, 9, 21, 29, 38];
const AK_T = [20, 20, 19, 16, 14, 12, 11, 12, 13, 15, 17, 19];
const AK_P = [75, 85, 90, 105, 105, 120, 130, 115, 100, 90, 80, 90];

export function ocClimateGraphFig(): string {
  const panel = (x0: number, name: string, temps: number[], precs: number[], tone: string): string => {
    const gx = (m: number): number => 12 + (m * 86) / 11;
    const gyT = (t: number): number => 108 - ((t + 5) / 40) * 82; // -5~35℃
    const barH = (p: number): number => Math.min(58, p * 0.135);
    const bars = precs
      .map((p, i) => `<rect x="${(gx(i) - 2.6).toFixed(1)}" y="${(112 - barH(p)).toFixed(1)}" width="5.2" height="${Math.max(0.5, barH(p)).toFixed(1)}" rx="1" fill="#7EB2E8" opacity=".85"/>`)
      .join("");
    const line = temps.map((t, i) => `${i === 0 ? "M" : "L"}${gx(i).toFixed(1)} ${gyT(t).toFixed(1)}`).join(" ");
    return `<g transform="translate(${x0} 0)">
      <rect x="1" y="18" width="108" height="102" rx="10" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.1"/>
      <line x1="9" y1="${gyT(0).toFixed(1)}" x2="102" y2="${gyT(0).toFixed(1)}" stroke="#C2CCD8" stroke-width=".9" stroke-dasharray="3 3"/>
      <text x="9" y="${(gyT(0) - 2.4).toFixed(1)}" font-size="6.5" font-weight="700" fill="#8A94A6">0℃</text>
      <line x1="9" y1="${gyT(20).toFixed(1)}" x2="102" y2="${gyT(20).toFixed(1)}" stroke="#E2E8F0" stroke-width=".9"/>
      <text x="9" y="${(gyT(20) - 1.6).toFixed(1)}" font-size="6.5" font-weight="700" fill="#8A94A6">20℃</text>
      ${bars}
      <path d="${line}" stroke="${tone}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${gx(0).toFixed(1)}" y="118.5" text-anchor="middle" font-size="6.4" font-weight="700" fill="#8A94A6">1월</text>
      <text x="${gx(6).toFixed(1)}" y="118.5" text-anchor="middle" font-size="6.4" font-weight="700" fill="#8A94A6">7월</text>
      <text x="${gx(11).toFixed(1)}" y="118.5" text-anchor="middle" font-size="6.4" font-weight="700" fill="#8A94A6">12월</text>
      <text x="55" y="12" text-anchor="middle" font-size="11" font-weight="900" fill="#333D4B">${name}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 146" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="오세아니아 세 지역 (가), (나), (다)의 기온과 강수량 그래프">
    ${panel(2, "(가)", DW_T, DW_P, "#E2574C")}${panel(117, "(나)", AS_T, AS_P, "#E8940A")}${panel(232, "(다)", AK_T, AK_P, "#2E9E5B")}
    <g transform="translate(8 136)" font-size="7" font-weight="700" fill="#6B7684">
      <path d="M0 -2h11" stroke="#8A5AC2" stroke-width="2.2"/><text x="15" y="1">기온(℃)</text>
      <rect x="56" y="-7" width="6" height="8" fill="#7EB2E8"/><text x="66" y="1">강수량(mm)</text>
    </g>
  </svg>`;
}

/* ---------- L4: 밀 수확 달력(비상 자료2 구도 — 남·북반구 수확 시기 대비) ---------- */
export function wheatCalFig(): string {
  const rows: { name: string; months: number[]; south?: boolean }[] = [
    { name: "오스트레일리아", months: [11, 12, 1, 2], south: true },
    { name: "인도", months: [4, 5] },
    { name: "미국", months: [6, 7, 8] },
    { name: "프랑스", months: [7, 8] },
  ];
  const cw = 21.5;
  const x0 = 78;
  const header = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return `<text x="${(x0 + (i + 0.5) * cw).toFixed(1)}" y="20" text-anchor="middle" font-size="8" font-weight="800" fill="#6B7684">${m}</text>`;
  }).join("");
  const body = rows
    .map((r, ri) => {
      const y = 32 + ri * 26;
      const cells = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const on = r.months.includes(m);
        return `<rect x="${(x0 + i * cw + 1).toFixed(1)}" y="${y}" width="${cw - 2}" height="18" rx="4" fill="${on ? (r.south ? "#E8590C" : "#7EB2E8") : "#EEF2F7"}" opacity="${on ? ".92" : "1"}"/>`;
      }).join("");
      return `<g>
        <text x="${x0 - 8}" y="${y + 13}" text-anchor="end" font-size="9.5" font-weight="${r.south ? 900 : 700}" fill="${r.south ? "#C2440A" : "#4E5968"}">${r.name}</text>
        ${cells}
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 158" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="나라별 밀 수확 시기 달력 — 남반구의 오스트레일리아만 11월에서 2월 사이에 수확한다">
    <rect x="2" y="4" width="340" height="150" rx="12" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="20" font-size="9" font-weight="800" fill="#8A94A6">수확 시기(월)</text>
    ${header}${body}
    <g transform="translate(14 146)" font-size="8" font-weight="700" fill="#6B7684">
      <rect x="0" y="-8" width="9" height="9" rx="2.4" fill="#E8590C"/><text x="13" y="0">남반구(계절 반대)</text>
      <rect x="102" y="-8" width="9" height="9" rx="2.4" fill="#7EB2E8"/><text x="116" y="0">북반구</text>
    </g>
  </svg>`;
}

/* ---------- L4: 수출 상대 막대(미래엔 2022 수치 — 아시아 이웃 강조) ---------- */
export function tradeBarFig(): string {
  const rows: [string, number, boolean][] = [
    ["중국", 24.9, true], ["일본", 12.8, true], ["대한민국", 6.0, true], ["인도", 4.7, true], ["미국", 3.0, false],
  ];
  const bars = rows
    .map(([n, v, asia], i) => {
      const y = 30 + i * 24;
      const w = v * 8.2;
      return `<g>
        <text x="70" y="${y + 11}" text-anchor="end" font-size="10" font-weight="800" fill="#4E5968">${n}</text>
        <rect x="78" y="${y}" width="${w.toFixed(1)}" height="15" rx="7" fill="${asia ? "#E8590C" : "#AAB4C4"}" opacity=".9"/>
        <text x="${(82 + w).toFixed(1)}" y="${y + 11.5}" font-size="9.5" font-weight="900" fill="#333D4B">${v.toFixed(1)}%</text>
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 160" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="오스트레일리아의 무역 상대 비율 막대 그래프">
    <rect x="2" y="4" width="340" height="152" rx="12" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="21" font-size="10" font-weight="900" fill="#333D4B">오스트레일리아의 무역 상대(2022년)</text>
    ${bars}
    <g transform="translate(230 21)" font-size="8" font-weight="700" fill="#6B7684">
      <rect x="0" y="-8" width="9" height="9" rx="2.4" fill="#E8590C"/><text x="13" y="0">아시아의 이웃</text>
    </g>
  </svg>`;
}

/* ---------- L5: 태평양 환류·쓰레기 지대 지도(+360 사본 합성 — 아메리카 서안 포함) ---------- */
export function gpgpFig(): string {
  const V = { x: 819, y: 78, w: 361, h: 206 }; // lon 114.8~244.8 · lat 61.9~-12.2
  const arrow = (pts: [number, number][], w = 2): string => {
    const d = pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
    const [l2, l1] = [pts[pts.length - 1], pts[pts.length - 2]];
    const a = Math.atan2(latToY(l2[1]) - latToY(l1[1]), lonToX(l2[0]) - lonToX(l1[0]));
    const hx = lonToX(l2[0]);
    const hy = latToY(l2[1]);
    const h = 5;
    return `<path d="${d}" stroke="#3F8FC8" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
      <path d="M${(hx - h * Math.cos(a - 0.5)).toFixed(1)} ${(hy - h * Math.sin(a - 0.5)).toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)} L${(hx - h * Math.cos(a + 0.5)).toFixed(1)} ${(hy - h * Math.sin(a + 0.5)).toFixed(1)}" stroke="#3F8FC8" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
  };
  // 북태평양 환류(시계 방향 모형): 쿠로시오(일본 동안 북상) → 북태평양 해류(동진) →
  // 캘리포니아 해류(남하) → 북적도 해류(서진). GPGP = 환류 안쪽(하와이~캘리포니아 사이).
  const gyre = `
    ${arrow([[126, 24], [130, 30], [137, 36], [145, 40]], 2.2)}
    ${arrow([[150, 42], [170, 45], [190, 45], [208, 42]], 2.2)}
    ${arrow([[221, 38], [227, 30], [229, 22]], 2.2)}
    ${arrow([[224, 14], [200, 10], [170, 10], [142, 13]], 2.2)}
  `;
  const trash = `
    <ellipse cx="${lonToX(222).toFixed(1)}" cy="${latToY(30).toFixed(1)}" rx="26" ry="15" fill="#8A93A6" opacity=".4"/>
    <ellipse cx="${lonToX(222).toFixed(1)}" cy="${latToY(30).toFixed(1)}" rx="26" ry="15" fill="none" stroke="#5E6B7E" stroke-width="1.4" stroke-dasharray="5 4"/>
    ${[[216, 33], [222, 28], [228, 32], [219, 26], [226, 27]]
      .map(([lo, la]) => `<rect x="${(lonToX(lo) - 2.4).toFixed(1)}" y="${(latToY(la) - 1.2).toFixed(1)}" width="4.8" height="2.4" rx="1" fill="#D8E4EE" stroke="#7E8A98" stroke-width=".6"/>`)
      .join("")}
  `;
  return `<svg viewBox="${V.x} ${V.y} ${V.w} ${V.h}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="북태평양의 해류 순환과 거대 쓰레기 지대 위치 지도">
    <defs><radialGradient id="s6-psea" cx=".5" cy=".45" r=".9"><stop offset="0" stop-color="#CFE7F5"/><stop offset="1" stop-color="#AFD2EA"/></radialGradient></defs>
    <rect x="${V.x}" y="${V.y}" width="${V.w}" height="${V.h}" rx="12" fill="url(#s6-psea)"/>
    <g clip-path="url(#s6-pclip)"><clipPath id="s6-pclip"><rect x="${V.x}" y="${V.y}" width="${V.w}" height="${V.h}" rx="12"/></clipPath>
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      <g transform="translate(1000 0)"><path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/></g>
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.45)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
      <g transform="translate(1000 0)"><path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.45)" stroke-width=".7" fill="none" fill-rule="evenodd"/></g>
      <line x1="1000" y1="${V.y}" x2="1000" y2="${V.y + V.h}" stroke="#D8484C" stroke-width="1" stroke-dasharray="5 4" opacity=".5"/>
      ${gyre}${trash}
      <line x1="${V.x}" y1="250" x2="${V.x + V.w}" y2="250" stroke="#7FA8C8" stroke-width="1" opacity=".55"/>
      <text x="${V.x + 5}" y="247" font-size="9" font-weight="700" fill="#5A7A96">적도</text>
    </g>
    <g>
      <text x="${lonToX(222).toFixed(1)}" y="${(latToY(30) - 22).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" opacity=".9">거대 쓰레기 지대</text>
      <text x="${lonToX(222).toFixed(1)}" y="${(latToY(30) - 22).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#3E4A5A">거대 쓰레기 지대</text>
      <text x="${lonToX(205).toFixed(1)}" y="${(latToY(20.5) + 3).toFixed(1)}" font-size="8" font-weight="800" fill="#5A7A96">하와이 제도</text>
      <text x="${lonToX(150).toFixed(1)}" y="${(latToY(48)).toFixed(1)}" font-size="8.5" font-weight="800" fill="#2E6E9E">해류의 순환</text>
    </g>
    <rect x="${V.x}" y="${V.y}" width="${V.w}" height="${V.h}" rx="12" stroke="#D8DEE8" stroke-width="1.2"/>
  </svg>`;
}

/* ---------- L5: 해수면 상승 모식도(산호섬 단면 — '모형') ---------- */
export function sealevelFig(): string {
  return `<svg viewBox="0 0 344 170" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="해발 고도가 낮은 산호섬과 해수면 상승을 나타낸 모형 단면도">
    <defs>
      <linearGradient id="s6-sl-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC2E8"/><stop offset="1" stop-color="#3F8FC8"/></linearGradient>
      <linearGradient id="s6-sl-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E2B8"/><stop offset="1" stop-color="#D8BE8A"/></linearGradient>
    </defs>
    <rect x="2" y="4" width="340" height="162" rx="12" fill="#F0F7FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <path d="M14 96q76-34 158-30t158 26v64H14z" fill="url(#s6-sl-sand)"/>
    <path d="M120 66q10-14 22-16M196 62q14-2 24 6" stroke="#B89A5E" stroke-width="0" fill="none"/>
    <path d="M168 60V38M168 38q-4-12-14-14 8-2 14 4 6-6 14-4-10 2-14 14z" stroke="#4E8A2E" stroke-width="3" fill="#6FB24E" stroke-linejoin="round"/>
    <rect x="140" y="52" width="20" height="14" rx="2.6" fill="#E8EEF4" stroke="#8A96A8" stroke-width="1.4"/>
    <path d="M138 52l12-8 12 8" stroke="#8A96A8" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <path d="M14 100q40-8 80-6M330 96q-36-6-72-4" stroke="#C8AE7A" stroke-width="0"/>
    <path d="M14 112q56 10 116 6M330 108q-52 8-104 8" stroke="#B89A5E" stroke-width="0"/>
    <rect x="14" y="118" width="316" height="48" fill="url(#s6-sl-sea)" opacity=".92"/>
    <path d="M14 118q40-8 80 0t80 0q40-8 80 0t76 0" stroke="#EAF6FC" stroke-width="2.2" fill="none" opacity=".9"/>
    <line x1="14" y1="96" x2="330" y2="96" stroke="#2E6E9E" stroke-width="1.6" stroke-dasharray="7 5"/>
    <path d="M306 118V98" stroke="#E2574C" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M301 104l5-6 5 6" stroke="#E2574C" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g font-size="9.5" font-weight="800">
      <text x="24" y="90" fill="#2E6E9E">해수면이 오르면 잠기는 높이(모형)</text>
      <text x="240" y="136" fill="#EAF6FC">지금의 바다</text>
      <text x="150" y="86" fill="#8A6A2E">해발 고도가 아주 낮은 산호섬</text>
    </g>
  </svg>`;
}

/* ---------- L7·L8: 극중심 원판(방위 정거 베이크 — 미래엔 122쪽 구도) ---------- */
function polarDisc(south: boolean, cx: number, cy: number, R: number, opts?: { bases?: boolean }): string {
  const s = R / 200; // POLAR r 200 = 콜래티튜드 50°(위도 40°) 림
  const P = (lon: number, lat: number): { x: number; y: number } => {
    const p = polarXY(lon, lat, south);
    return { x: cx + p.x * s, y: cy + p.y * s };
  };
  const id = south ? "ps" : "pn";
  const circleAt = (deg: number): number => (90 - deg) * 4 * s; // 위도 deg 원의 화면 반지름
  const meridians = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + R * Math.sin(a)).toFixed(1)}" y2="${(cy + (south ? -1 : 1) * R * Math.cos(a)).toFixed(1)}" stroke="#FFFFFF" stroke-width=".6" opacity=".35"/>`;
  }).join("");
  const labels = south
    ? `
      <text x="${P(0, -84).x.toFixed(1)}" y="${(P(0, -84).y + 3).toFixed(1)}" text-anchor="middle" font-size="${(R * 0.105).toFixed(1)}" font-weight="900" fill="#4E5968">남극 대륙</text>
      <text x="${P(140, -57).x.toFixed(1)}" y="${P(140, -57).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.085).toFixed(1)}" font-weight="800" fill="#2E6E9E">남극해</text>
      <text x="${P(-63, -45).x.toFixed(1)}" y="${P(-63, -45).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.08).toFixed(1)}" font-weight="800" fill="#7A6A4E">아메리카</text>
      <text x="${P(147, -44).x.toFixed(1)}" y="${P(147, -44).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.08).toFixed(1)}" font-weight="800" fill="#7A6A4E">오세아니아</text>
      <text x="${P(20, -44).x.toFixed(1)}" y="${P(20, -44).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.08).toFixed(1)}" font-weight="800" fill="#7A6A4E">아프리카</text>`
    : `
      <text x="${P(95, 52).x.toFixed(1)}" y="${P(95, 52).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.08).toFixed(1)}" font-weight="800" fill="#7A6A4E">아시아</text>
      <text x="${P(15, 51).x.toFixed(1)}" y="${P(15, 51).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.08).toFixed(1)}" font-weight="800" fill="#7A6A4E">유럽</text>
      <text x="${P(-100, 52).x.toFixed(1)}" y="${P(-100, 52).y.toFixed(1)}" text-anchor="middle" font-size="${(R * 0.08).toFixed(1)}" font-weight="800" fill="#7A6A4E">아메리카</text>
      <text x="${(cx + R * 0.02).toFixed(1)}" y="${(cy + R * 0.3).toFixed(1)}" text-anchor="middle" font-size="${(R * 0.09).toFixed(1)}" font-weight="800" fill="#2E6E9E">북극해</text>`;
  const bases = south && opts?.bases
    ? `
      <circle cx="${P(-58.79, -62.22).x.toFixed(1)}" cy="${P(-58.79, -62.22).y.toFixed(1)}" r="3.4" fill="#E8590C" stroke="#FFFFFF" stroke-width="1.4"/>
      <text x="${(P(-58.79, -62.22).x - 6).toFixed(1)}" y="${(P(-58.79, -62.22).y - 6).toFixed(1)}" text-anchor="end" font-size="${(R * 0.078).toFixed(1)}" font-weight="900" fill="#C2440A">세종 과학 기지</text>
      <circle cx="${P(164.23, -74.62).x.toFixed(1)}" cy="${P(164.23, -74.62).y.toFixed(1)}" r="3.4" fill="#E8590C" stroke="#FFFFFF" stroke-width="1.4"/>
      <text x="${(P(164.23, -74.62).x + 6).toFixed(1)}" y="${(P(164.23, -74.62).y + 10).toFixed(1)}" font-size="${(R * 0.078).toFixed(1)}" font-weight="900" fill="#C2440A">장보고 과학 기지</text>`
    : "";
  return `
    <defs><clipPath id="s6-${id}clip"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath></defs>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#AFD2EC"/>
    <g clip-path="url(#s6-${id}clip)">
      <g transform="translate(${cx} ${cy}) scale(${s.toFixed(4)})">
        <path d="${south ? POLAR_SOUTH_PATH : POLAR_NORTH_PATH}" fill="${south ? "#F7FAFD" : "#F2ECDE"}" fill-rule="evenodd" stroke="rgba(74,88,110,.5)" stroke-width="${(0.7 / s).toFixed(2)}"/>
      </g>
      ${meridians}
      <circle cx="${cx}" cy="${cy}" r="${circleAt(66.5).toFixed(1)}" fill="none" stroke="#E08E3E" stroke-width="1" stroke-dasharray="5 4" opacity=".8"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${R}" stroke="#33415C" stroke-width="1.8" fill="none"/>
    <circle cx="${cx}" cy="${cy}" r="2.6" fill="#E2574C"/>
    <text x="${(cx + 5).toFixed(1)}" y="${(cy + (south ? 14 : -5)).toFixed(1)}" font-size="${(R * 0.082).toFixed(1)}" font-weight="900" fill="#B03A2E">${south ? "남극점" : "북극점"}</text>
    <text x="${cx.toFixed(1)}" y="${(cy + circleAt(66.5) * (south ? -1 : 1) * -1 + (south ? 10 : -4)).toFixed(1)}" text-anchor="middle" font-size="${(R * 0.072).toFixed(1)}" font-weight="800" fill="#B87A2E">${south ? "남극권" : "북극권"}</text>
    ${labels}${bases}`;
}

/** 두 원판 대비("대륙이 둘러싼 바다 ↔ 바다가 둘러싼 대륙") 또는 단일 원판. */
export function polarFig(kind: "both" | "north" | "south" = "both", opts?: { bases?: boolean }): string {
  if (kind === "both") {
    return `<svg viewBox="0 0 344 206" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
      aria-label="북극 지방과 남극 지방의 극중심 지도 — 북극은 대륙이 둘러싼 바다, 남극은 바다가 둘러싼 대륙">
      ${polarDisc(false, 88, 92, 78)}
      ${polarDisc(true, 256, 92, 78)}
      <text x="88" y="192" text-anchor="middle" font-size="11" font-weight="900" fill="#333D4B">북극 지방</text>
      <text x="256" y="192" text-anchor="middle" font-size="11" font-weight="900" fill="#333D4B">남극 지방</text>
      <text x="88" y="205" text-anchor="middle" font-size="8.5" font-weight="700" fill="#6B7684">대륙이 둘러싼 바다</text>
      <text x="256" y="205" text-anchor="middle" font-size="8.5" font-weight="700" fill="#6B7684">바다가 둘러싼 대륙</text>
    </svg>`;
  }
  const south = kind === "south";
  return `<svg viewBox="0 0 344 268" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="${south ? "남극 지방의 극중심 지도" : "북극 지방의 극중심 지도"}">
    ${polarDisc(south, 172, 132, 120, opts)}
  </svg>`;
}

/* ---------- recap 미니아트(64×64 플랫 — 전 카드 필수) ---------- */
const M = (body: string): string =>
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

export function soc6MiniArt(key: string): string {
  switch (key) {
    /* ── L1 ── */
    case "datelinefirst": // 날짜 변경선과 첫 새해
      return M(
        `<circle cx="32" cy="32" r="22" fill="#2E4E7E"/>
        <path d="M14 26q18-6 36 0M14 38q18 6 36 0" stroke="#4E7EAE" stroke-width="1.6" fill="none"/>
        <line x1="40" y1="10" x2="40" y2="54" stroke="#E2574C" stroke-width="2.2" stroke-dasharray="4 3"/>
        <circle cx="35" cy="30" r="2" fill="#F2ECDE"/><circle cx="37" cy="38" r="1.6" fill="#F2ECDE"/>
        <path d="M46 18l2-4 2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3z" fill="#F2C24E"/>`,
      );
    case "bigsmallmix": // 큰 대륙 + 작은 섬들
      return M(
        `<path d="M8 34q2-12 14-15l18-3q11 0 16 5l6 8-3 9-10 7-12 2-12-2-11-3q-6-4-6-8z" fill="#E2574C" opacity=".85"/>
        <path d="M46 48q5-2 7 2l-3 6q-4 3-6-1z" fill="#2E9E5B"/>
        <circle cx="50" cy="14" r="2.2" fill="#F2A72E"/><circle cx="56" cy="20" r="1.8" fill="#3F8FC8"/>
        <circle cx="44" cy="10" r="1.6" fill="#8A5AC2"/><circle cx="57" cy="10" r="1.4" fill="#F2A72E"/>`,
      );
    case "stampcities": // 도시 도장
      return M(
        `<rect x="10" y="12" width="44" height="40" rx="8" fill="#F5EFE2" stroke="#C8B896" stroke-width="2"/>
        <circle cx="24" cy="26" r="5" fill="#FFFFFF" stroke="#C0471C" stroke-width="2.4"/>
        <circle cx="42" cy="34" r="5" fill="#FFFFFF" stroke="#1E7E46" stroke-width="2.4"/>
        <circle cx="28" cy="44" r="5" fill="#FFFFFF" stroke="#2E5EA8" stroke-width="2.4"/>
        <path d="M46 14l6 6" stroke="#8A93A6" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    /* ── L2 ── */
    case "flatland": // 낮고 평평한 대륙과 울루루
      return M(
        `<path d="M6 44h52" stroke="#C2A54E" stroke-width="3" stroke-linecap="round"/>
        <path d="M22 42q2-12 10-12t10 12z" fill="#C0471C"/>
        <path d="M28 41q1-7 3-9M35 41q1-8 3-9" stroke="#8E3210" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>
        <circle cx="50" cy="16" r="5" fill="#F2C24E"/>
        <path d="M10 52h18M38 52h14" stroke="#D8B86E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "reefribbon": // 대보초 산호 리본
      return M(
        `<path d="M10 40q12-20 30-24 12-2 14 8-16 2-24 12t-8 18q-10-2-12-14z" fill="#3F8FC8" opacity=".3"/>
        <path d="M14 40q10-16 26-21" stroke="#3FB8A8" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 5"/>
        <path d="M40 44q0-8-6-8 2-6 8-4 2-6 8-2-4 2-4 6 6 0 6 8z" fill="#E85D7A"/>
        <path d="M20 52q4-3 8 0l-2 5h-4z" fill="#F2A72E"/><circle cx="24.6" cy="53.6" r=".9" fill="#5E3A10"/>`,
      );
    case "twinislands": // 뉴질랜드 — 화산의 북섬·빙하의 남섬
      return M(
        `<path d="M36 10q10 2 8 14l-8 8q-8 2-8-6z" fill="#2E9E5B"/>
        <path d="M22 34q10 0 10 10l-6 10q-10 2-12-6z" fill="#2E9E5B"/>
        <path d="M36 16l3-5 3 5z" fill="#B0785E" stroke="#7E4A38" stroke-width="1"/>
        <path d="M40 10q2-3 4-2" stroke="#B8B4C0" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M20 44q3-2 6 0M18 49q3-2 6 0" stroke="#8ED2F0" stroke-width="1.8" stroke-linecap="round"/>`,
      );
    /* ── L3 ── */
    case "flipseason": // 계절 반전 — 반팔과 패딩
      return M(
        `<line x1="32" y1="8" x2="32" y2="56" stroke="#C2CCD8" stroke-width="2" stroke-dasharray="4 3"/>
        <circle cx="17" cy="20" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="2"/>
        <path d="M17 26v12M17 30h-6M17 30h6M17 38l-5 8M17 38l5 8" stroke="#3C4654" stroke-width="2" stroke-linecap="round"/>
        <path d="M11 30h12" stroke="#E8590C" stroke-width="6" stroke-linecap="round" opacity=".85"/>
        <circle cx="47" cy="20" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="2"/>
        <path d="M47 26v12M47 30h-6M47 30h6M47 38l-5 8M47 38l5 8" stroke="#3C4654" stroke-width="2" stroke-linecap="round"/>
        <circle cx="52" cy="9" r="4" fill="#F2C24E"/>
        <path d="M8 10l1.6 3.4L13 15l-3.4 1.6L8 20l-1.6-3.4L3 15l3.4-1.6z" fill="#8ED2F0"/>`,
      );
    case "tiltorbit": // 기울어진 채 공전
      return M(
        `<circle cx="18" cy="32" r="8" fill="#F2C24E"/>
        <ellipse cx="32" cy="32" rx="26" ry="12" stroke="#AAB4C4" stroke-width="1.8" fill="none"/>
        <circle cx="52" cy="38" r="7" fill="#2E5EA8"/>
        <line x1="47" y1="30" x2="57" y2="46" stroke="#F2C24E" stroke-width="2.2" stroke-dasharray="3 2.4"/>
        <path d="M46 32q4-3 6-8" stroke="#8A93A6" stroke-width="0"/>`,
      );
    case "mildkiwi": // 온화한 뉴질랜드 — 연중 고른 비
      return M(
        `<path d="M14 20q8-10 20-8 12-2 16 8 6 2 4 9H12q-3-6 2-9z" fill="#C8D8E8"/>
        <path d="M20 36v7M30 34v7M40 36v7M50 34v7" stroke="#4E9AE8" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="32" cy="52" r="7" fill="#9E7E4E"/><circle cx="32" cy="52" r="4.6" fill="#B8D86E"/><circle cx="32" cy="52" r="1.4" fill="#F2F0D8"/>`,
      );
    /* ── L4 ── */
    case "orehold": // 광석을 실은 배
      return M(
        `<path d="M8 40h48l-6 12H14z" fill="#5E6B7E" stroke="#3A4658" stroke-width="2"/>
        <path d="M16 40q0-8 8-9 0-6 8-6t8 6q8 1 8 9z" fill="#C0471C" opacity="0"/>
        <circle cx="24" cy="34" r="5" fill="#B0672A"/><circle cx="34" cy="31" r="6" fill="#8F5D2D"/><circle cx="44" cy="34" r="5" fill="#C08A32"/>
        <path d="M4 56q6-4 12 0t12 0q6-4 12 0t12 0" stroke="#3F8FC8" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "sheepwool": // 양 떼의 나라
      return M(
        `<circle cx="22" cy="22" r="4" fill="#F2F0E6"/><circle cx="30" cy="19" r="4.6" fill="#F2F0E6"/><circle cx="38" cy="21" r="4.2" fill="#F2F0E6"/>
        <ellipse cx="30" cy="30" rx="14" ry="9" fill="#F2F0E6" stroke="#B8B0A0" stroke-width="1.8"/>
        <circle cx="43" cy="26" r="5" fill="#4A4038"/>
        <path d="M24 38v8M36 38v8" stroke="#8A7A66" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M8 52h48" stroke="#7FB24E" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "asialink": // 아시아와의 연결
      return M(
        `<path d="M10 18q10-8 22-4l8 6-4 8-12 4-12-4q-6-4-2-10z" fill="#E8B93C" opacity=".8"/>
        <path d="M34 46q8-6 18-3l4 6-6 7-12-1q-6-3-4-9z" fill="#E2574C" opacity=".85"/>
        <path d="M22 28q10 8 22 16" stroke="#E8590C" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 4"/>
        <path d="M40 40l6 4-2 6" stroke="#E8590C" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    /* ── L5 ── */
    case "gyretrash": // 환류가 모은 쓰레기
      return M(
        `<circle cx="32" cy="32" r="22" fill="#3F8FC8" opacity=".25"/>
        <path d="M32 12a20 20 0 0 1 18 12M52 40a20 20 0 0 1-16 13M14 42a20 20 0 0 1-1-16" stroke="#2E6E9E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M48 22l4 1-2 4M34 55l-4-1 2-4M12 24l1 5 4-1" stroke="#2E6E9E" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="26" y="27" width="7" height="3.6" rx="1.4" fill="#D8E4EE" stroke="#7E8A98" stroke-width="1"/>
        <rect x="33" y="33" width="6" height="3" rx="1.4" fill="#D8E4EE" stroke="#7E8A98" stroke-width="1" transform="rotate(18 36 34)"/>
        <path d="M24 36q3-4 6 0l-1.6 4h-3z" fill="#AEBCCA"/>`,
      );
    case "lowatoll": // 해발이 낮은 산호섬
      return M(
        `<path d="M10 36q22-10 44 0v6H10z" fill="#F2E2B8"/>
        <path d="M32 30V20M32 20q-3-8-9-9 5-2 9 3 4-5 9-3-6 1-9 9z" stroke="#4E8A2E" stroke-width="2.4" fill="#6FB24E" stroke-linejoin="round"/>
        <rect x="8" y="42" width="48" height="12" fill="#3F8FC8" opacity=".85"/>
        <path d="M8 42q8-3 16 0t16 0q8-3 16 0" stroke="#EAF6FC" stroke-width="1.8" fill="none"/>
        <line x1="8" y1="34" x2="56" y2="34" stroke="#2E6E9E" stroke-width="1.6" stroke-dasharray="4 3"/>
        <path d="M50 42v-6M47 39l3-4 3 4" stroke="#E2574C" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "whitecoral": // 백화된 산호
      return M(
        `<path d="M18 52V40q-8-2-8-12 6 0 8 6 0-9 7-13 4 5 1 13 5-5 11-4-2 8-11 10v12z" fill="#E85D7A"/>
        <path d="M44 52V42q-6-1-6-9 7 0 8 6 1-8 8-9 1 8-6 11v11z" fill="#E8ECF0" stroke="#B8C2CC" stroke-width="1.2"/>
        <path d="M8 56h48" stroke="#C8B896" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M46 20q3-3 6 0M44 14q4-4 8 0" stroke="#8AB4D8" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      );
    /* ── L6 ── */
    case "threelayers": // 국제·국가·개인의 3층
      return M(
        `<rect x="12" y="10" width="40" height="12" rx="6" fill="#2E5EA8"/>
        <rect x="12" y="26" width="40" height="12" rx="6" fill="#3F8FC8"/>
        <rect x="12" y="42" width="40" height="12" rx="6" fill="#7EB2E8"/>
        <circle cx="20" cy="16" r="3" fill="#D9EDF8"/><circle cx="20" cy="32" r="3" fill="#D9EDF8"/><circle cx="20" cy="48" r="3" fill="#EAF6FC"/>
        <path d="M28 16h16M28 32h16M28 48h16" stroke="#EAF6FC" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "tumblerhero": // 텀블러와 장바구니
      return M(
        `<path d="M20 14h14l-2 34q-1 6-5 6t-5-6z" fill="#3FB8A8" stroke="#1E7E70" stroke-width="2"/>
        <rect x="19" y="10" width="16" height="6" rx="3" fill="#1E7E70"/>
        <path d="M40 30h14l-2 20H42z" fill="#F2E2B8" stroke="#B89A5E" stroke-width="2" stroke-linejoin="round"/>
        <path d="M43 30q0-6 4-6t4 6" stroke="#B89A5E" stroke-width="2" fill="none"/>
        <path d="M44 38q3-3 6 0" stroke="#4E8A2E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      );
    case "lawscroll": // 국제 협약 문서
      return M(
        `<rect x="14" y="10" width="36" height="44" rx="6" fill="#F5EFE2" stroke="#C8B896" stroke-width="2"/>
        <circle cx="32" cy="22" r="6" fill="#3F8FC8" opacity=".2"/>
        <path d="M28 22q2-4 4-2t4-2" stroke="#2E5EA8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M20 34h24M20 40h24M20 46h14" stroke="#8A93A6" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="46" cy="46" r="5" fill="#E2574C" opacity=".85"/>`,
      );
    /* ── L7 ── */
    case "polarpair": // 두 원판의 대비
      return M(
        `<circle cx="18" cy="32" r="13" fill="#F2ECDE" stroke="#33415C" stroke-width="2"/>
        <circle cx="18" cy="32" r="6.5" fill="#7FAED4"/>
        <circle cx="46" cy="32" r="13" fill="#7FAED4" stroke="#33415C" stroke-width="2"/>
        <circle cx="46" cy="32" r="6.5" fill="#F7FAFD" stroke="#C8D4E0" stroke-width="1"/>
        <circle cx="18" cy="32" r="1.6" fill="#E2574C"/><circle cx="46" cy="32" r="1.6" fill="#E2574C"/>`,
      );
    case "shortcutroute": // 북극해 지름길
      return M(
        `<circle cx="32" cy="30" r="20" fill="#AFD2EC" stroke="#33415C" stroke-width="2"/>
        <path d="M18 44q-8-10-2-22M46 44q8-10 2-22" stroke="#F2ECDE" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M18 42q6-14 28 0" stroke="#E8590C" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <path d="M42 38l5 4-6 2" stroke="#E8590C" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 52q9 4 18 0t18 0" stroke="#3F8FC8" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "icecorelab": // 빙하 코어 연구
      return M(
        `<path d="M8 50q12-4 24 0t24 0" stroke="#B8D4E8" stroke-width="3" stroke-linecap="round"/>
        <rect x="26" y="8" width="12" height="38" rx="6" fill="#D8ECFA" stroke="#8AB4D8" stroke-width="2"/>
        <path d="M27 18h10M27 26h10M27 34h10" stroke="#3FB8A8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="49" cy="18" r="8" fill="none" stroke="#8A6A3E" stroke-width="2.4"/>
        <path d="M55 24l5 5" stroke="#8A6A3E" stroke-width="2.8" stroke-linecap="round"/>`,
      );
    /* ── L8 ── */
    case "resourcechest": // 잠든 자원
      return M(
        `<path d="M10 46q10 4 22 4t22-4v8q-10 4-22 4t-22-4z" fill="#7FAED4"/>
        <rect x="18" y="22" width="28" height="20" rx="4" fill="#8A6A3E" stroke="#5E4626" stroke-width="2"/>
        <path d="M18 30h28" stroke="#5E4626" stroke-width="1.6"/>
        <circle cx="32" cy="32" r="3" fill="#F2C24E"/>
        <path d="M24 18q2-6 8-6t8 6" stroke="#5E4626" stroke-width="2.4" fill="none"/>
        <path d="M50 14l2-4 2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3z" fill="#F2C24E" opacity=".8"/>`,
      );
    case "fragileweb": // 극지방 생태계의 그물
      return M(
        `<circle cx="32" cy="32" r="20" stroke="#8AB4D8" stroke-width="1.6" fill="none"/>
        <path d="M32 12v40M12 32h40M18 18l28 28M46 18 18 46" stroke="#8AB4D8" stroke-width="1.2" opacity=".7"/>
        <path d="M22 28q3-4 7-1t3 7q-5 3-8-1t-2-5z" fill="#2E3A48"/>
        <path d="M40 40q4-1 5 3t-3 5q-4-1-4-4t2-4z" fill="#F4F8FB" stroke="#8A9AAC" stroke-width="1.2"/>
        <path d="M44 20l3 3" stroke="#E2574C" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "balancescale": // 개발과 보전의 저울
      return M(
        `<path d="M32 10v34" stroke="#5A6B7E" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M12 18h40" stroke="#5A6B7E" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M12 18l-4 12h8zM52 18l-4 12h8z" fill="#AAB4C4"/>
        <path d="M8 30q4 4 8 0M48 30q4 4 8 0" stroke="#5A6B7E" stroke-width="2" fill="none"/>
        <rect x="8" y="32" width="8" height="6" rx="1.6" fill="#8A6A3E"/>
        <path d="M50 34l3-4 3 4z" fill="#D8ECFA" stroke="#8AB4D8" stroke-width="1.2"/>
        <path d="M22 50h20" stroke="#8A93A6" stroke-width="3" stroke-linecap="round"/>`,
      );
  }
  return M(`<circle cx="32" cy="32" r="14" fill="#E8590C" opacity=".3"/>`);
}
