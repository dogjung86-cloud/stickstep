// socFigures5 — 사회 Ⅴ(아메리카) 그림 모듈: 아메리카 크롭 지도(실데이터)·기후·인구·기업·미니아트.
//   · 지도는 ui/worldMap.generated.ts + ui/continentMap.ts(AMERICA 지역 데이터) 재사용 —
//     손으로 대륙을 그리지 않는다(사회 트랙 원칙). 소품(산맥·강·평원·고원)은 전부 lon/lat →
//     lonToX/latToY 계산 좌표만(눈대중 금지 — audit-soc5-geo SPOTS 검산과 1:1).
//   · 기후 분포는 public/soc/climate.webp(쾨펜 실데이터 오버레이) 육지 클립 — 아메리카는
//     열대~한대 + 고산까지 6분류가 전부 나타나는 유일한 단원이라 범례 6종.
//   · 기후 그래프 수치는 실측 근사(1991~2020 평균 반올림): 이키토스(연중 고온다습) vs
//     키토(연중 13℃ 안팎 평탄)의 대비 — 같은 적도, 다른 고도가 그림의 심장.
//   · 인구 수치는 교과서 인쇄 통계(미래엔 96~97쪽: 미국 인구 센서스 2021·신상 지리 자료 2023)
//     반올림 — 멕시코 혼혈 64%·페루 원주민 52%·아르헨티나 유럽계 86%·자메이카 아프리카계 92%.
import { WORLD_LAND_PATH } from "./worldMap.generated";
import { CONTINENTS, lonToX, latToY, polyPath } from "./continentMap";

const AMERICA = CONTINENTS.america;
const CROP = AMERICA.crop;
const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

function mapShell(inner: string, opts?: { legend?: string; aria?: string }): string {
  const legendH = opts?.legend ? 40 : 0;
  return `<svg viewBox="${CROP.x} ${CROP.y - 6} ${CROP.w} ${CROP.h + 10 + legendH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${opts?.aria ?? "아메리카 지도"}">
    <defs>
      <clipPath id="s5-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <clipPath id="s5-mapclip"><rect x="${CROP.x}" y="${CROP.y - 6}" width="${CROP.w}" height="${CROP.h + 10}" rx="12"/></clipPath>
      <radialGradient id="s5-sea" cx=".5" cy=".4" r=".95">
        <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
      </radialGradient>
    </defs>
    <rect x="${CROP.x}" y="${CROP.y - 6}" width="${CROP.w}" height="${CROP.h + 10}" rx="12" fill="url(#s5-sea)"/>
    <g clip-path="url(#s5-mapclip)">
      <line x1="${CROP.x}" y1="${latToY(23.4).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
      <text x="${CROP.x + 5}" y="${(latToY(23.4) - 3).toFixed(1)}" font-size="9.5" font-weight="700" fill="#5A7A96">북회귀선</text>
      <line x1="${CROP.x}" y1="250" x2="${CROP.x + CROP.w}" y2="250" stroke="#7FA8C8" stroke-width="1.1" opacity=".6"/>
      <text x="${CROP.x + 5}" y="247" font-size="9.5" font-weight="700" fill="#5A7A96">적도</text>
      <line x1="${CROP.x}" y1="${latToY(-23.4).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(-23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
      <text x="${CROP.x + 5}" y="${(latToY(-23.4) - 3).toFixed(1)}" font-size="9.5" font-weight="700" fill="#5A7A96">남회귀선</text>
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      ${inner}
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
    </g>
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

/* ---------- L1: 지역 구분 지도(두 구분 체계 병기) ---------- */
/** 세 지역 색 지도 + 경계선 두 개(리오그란데강·파나마 지협 — 교과서 지도의 가위선).
 *  labels=false면 이름 없이(퀴즈 — ㉠㉡ 마커), boundaries=false면 경계 표기 생략. */
export function amRegionsFig(opts?: {
  labels?: boolean;
  boundaries?: boolean;
  letters?: { lon: number; lat: number; t: string }[];
}): string {
  const showLabels = opts?.labels !== false;
  const showBounds = opts?.boundaries !== false;
  const fills = AMERICA.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="${r.color}" opacity=".5"/>`)
    .join("");
  const labels = showLabels
    ? AMERICA.regions
        .map((r) => {
          const ax = lonToX(r.anchor[0]).toFixed(1);
          const ay = (latToY(r.anchor[1]) + 3.6).toFixed(1);
          return `<g>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="10.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" opacity=".85">${r.name}</text>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#2E3A50">${r.name}</text>
          </g>`;
        })
        .join("")
    : "";
  // 경계선 — 리오그란데강(문화 구분: 앵글로|라틴)·파나마 지협(위치 구분: 북|남)
  const rio: [number, number][] = [[-117.1, 32.45], [-114.8, 32.4], [-111, 31.2], [-106.45, 31.65], [-104.9, 30.3], [-101.4, 29.5], [-99.2, 26.5], [-97.1, 25.85]];
  const rioD = rio.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
  const px = lonToX(-79.6).toFixed(1);
  const py = latToY(8.8).toFixed(1);
  const bounds = showBounds
    ? `
    <path d="${rioD}" stroke="#C0471C" stroke-width="2.2" fill="none" stroke-dasharray="6 4" stroke-linecap="round"/>
    <g>
      <text x="${lonToX(-134).toFixed(1)}" y="${latToY(31.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" opacity=".9">리오그란데강</text>
      <text x="${lonToX(-134).toFixed(1)}" y="${latToY(31.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="#C0471C">리오그란데강</text>
      <text x="${lonToX(-134).toFixed(1)}" y="${(latToY(31.5) + 10).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#8A5A3E">문화의 경계</text>
    </g>
    <circle cx="${px}" cy="${py}" r="7" fill="none" stroke="#1E4E9E" stroke-width="2.2" stroke-dasharray="3 2.5"/>
    <g>
      <text x="${lonToX(-66).toFixed(1)}" y="${latToY(4.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" opacity=".9">파나마 지협</text>
      <text x="${lonToX(-66).toFixed(1)}" y="${latToY(4.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="#1E4E9E">파나마 지협</text>
      <text x="${lonToX(-66).toFixed(1)}" y="${(latToY(4.5) + 10).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#3E5A88">위치의 경계</text>
    </g>`
    : "";
  return mapShell(
    `<g clip-path="url(#s5-lclip)">${fills}</g>${bounds}${labels}${letterMarks(opts?.letters)}`,
    { aria: "아메리카의 지역 구분 지도 — 세 지역과 두 경계(리오그란데강·파나마 지협)" },
  );
}

/* ---------- L2: 지형 지도(hotspot 배경·pad0) ---------- */
// 소품 좌표는 전부 lon/lat — 스팟 % 검산: x% = (lonToX(lon)−28)/392·100, y% = (latToY(lat)−41)/371·100.
//   로키(-113,45)→(40.3,22.6) · 애팔래치아(-79,38)→(64.4,27.9) · 그레이트플레인스(-100,41)→(49.6,25.6) ·
//   미시시피강(-90,36)→(56.6,29.4) · 안데스(-71,-20)→(70.1,71.3) · 아마존강(-60,-3)→(77.9,58.6) ·
//   브라질고원(-45,-15)→(88.5,67.6)  (audit-soc5-geo SPOTS와 1:1)
export function amTerrainFig(): string {
  const mtn = (lon: number, lat: number, s: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 5.5 * s).toFixed(1)} ${(y + 3.2 * s).toFixed(1)} L${x.toFixed(1)} ${(y - 4.8 * s).toFixed(1)} L${(x + 5.5 * s).toFixed(1)} ${(y + 3.2 * s).toFixed(1)}z" fill="#B09A6E" stroke="#7E6A48" stroke-width=".7"/>`;
  };
  const lowMtn = (lon: number, lat: number, s: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 5 * s).toFixed(1)} ${(y + 2.4 * s).toFixed(1)} Q${x.toFixed(1)} ${(y - 3.4 * s).toFixed(1)} ${(x + 5 * s).toFixed(1)} ${(y + 2.4 * s).toFixed(1)}z" fill="#C2AE86" stroke="#8E7A56" stroke-width=".7"/>`;
  };
  const river = (pts: [number, number][], w = 1.8): string => {
    const d = pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
    return `<path d="${d}" stroke="#4E9AE8" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  };
  // 그레이트플레인스(초지)·아마존 분지(진초록)·브라질고원(갈색) — 러프 영역, 육지 클립
  const plains: [number, number][] = [
    [-106, 50], [-98, 50], [-95, 44], [-94, 38], [-97, 31.5], [-102, 30.5], [-105, 36], [-107, 44],
  ];
  const amazonBasin: [number, number][] = [
    [-75, 1], [-66, 2.5], [-56, 1.5], [-50, -1.5], [-52, -6], [-60, -8.5], [-70, -8], [-75, -4.5],
  ];
  const brazilPlateau: [number, number][] = [
    [-51, -11], [-43, -9.5], [-39.5, -14], [-42, -20], [-47, -23], [-52, -19], [-53, -14],
  ];
  const inner = `
    <g clip-path="url(#s5-lclip)">
      <path d="${polyPath(plains)}" fill="#D8D096" opacity=".9"/>
      <path d="${polyPath(amazonBasin)}" fill="#9CC87E" opacity=".85"/>
      <path d="${polyPath(brazilPlateau)}" fill="#C8A66E" opacity=".8"/>
    </g>
    ${river([[-94.2, 46.5], [-91.5, 43.5], [-90.2, 40], [-89, 36.5], [-91, 33.5], [-90.2, 29.7]], 2)}
    ${river([[-105.5, 32], [-104.5, 30.5], [-101.5, 29.8], [-99.5, 27.2], [-97.2, 25.9]], 1.3)}
    ${river([[-76.5, -4.6], [-70, -4.2], [-65, -3.3], [-60, -3.1], [-55, -2.4], [-52, -1.6], [-50.2, -0.4]], 2.2)}
    ${river([[-58, -20], [-57.5, -25], [-59.5, -30], [-58.5, -34]], 1.3)}
    ${mtn(-151, 63, 1.1)}${mtn(-128, 58, 1.1)}${mtn(-122, 53, 1.2)}${mtn(-117, 49, 1.2)}${mtn(-113, 45, 1.3)}${mtn(-108, 40, 1.2)}${mtn(-106, 36, 1.1)}
    ${lowMtn(-84, 35, 1)}${lowMtn(-81, 37, 1.1)}${lowMtn(-77, 40, 1)}
    ${mtn(-104, 22, 0.9)}
    ${mtn(-77.5, 6, 0.9)}${mtn(-78.5, 0, 1)}${mtn(-76, -7, 1)}${mtn(-71.5, -14, 1.1)}${mtn(-69, -20, 1.2)}${mtn(-70, -27, 1.1)}${mtn(-70.8, -34, 1.1)}${mtn(-72, -41, 1)}${mtn(-73, -48, 0.9)}
    <ellipse cx="${lonToX(-87).toFixed(1)}" cy="${latToY(45.5).toFixed(1)}" rx="7" ry="4" fill="#7EB2E8" stroke="#4E82B8" stroke-width=".7"/>
  `;
  return mapShell(inner, { aria: "아메리카의 주요 지형 지도 — 서쪽의 높은 산맥과 동쪽의 낮은 산지·고원, 가운데의 평원과 큰 강" });
}

/* ---------- L3: 기후 분포 지도(쾨펜 실데이터 오버레이) ---------- */
export function amClimateFig(opts?: { letters?: { lon: number; lat: number; t: string }[] }): string {
  const inner = `
    <image href="${BASE}soc/climate.webp" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" clip-path="url(#s5-lclip)" opacity=".92"/>
    ${letterMarks(opts?.letters)}`;
  // 범례 색은 climate.webp 실제 팔레트(qa/gen-worldmap.mjs)와 1:1 — 눈검수로 냉대 색 교정.
  const pal: [string, string][] = [["#1E9E50", "열대"], ["#E8B93C", "건조"], ["#A5D65C", "온대"], ["#3FA7C8", "냉대"], ["#8E9EC8", "한대"], ["#B0672A", "고산"]];
  const legend = `<g font-size="9.5" font-weight="800">
    ${pal.map(([c, n], i) => `<g transform="translate(${CROP.x + 14 + i * 62} ${CROP.y + CROP.h + 24})">
      <rect x="0" y="-9" width="11" height="11" rx="3" fill="${c}"/><text x="15" y="1" fill="#4E5968">${n}</text></g>`).join("")}
  </g>`;
  return mapShell(inner, { legend, aria: "아메리카의 기후 분포 지도 — 남북으로 길어 다양한 기후가 나타난다" });
}

/* ---------- L3: 이키토스·키토 기후 그래프 페어(퀴즈 그림) ---------- */
// 실측 근사(월평균) — 이키토스(해발 106m): 연중 고온다습 / 키토(해발 2,850m): 연중 13℃ 안팎 평탄.
const IQ_T = [26, 26, 26, 26, 26, 25, 25, 26, 26, 26, 26, 26];
const IQ_P = [268, 278, 301, 285, 256, 216, 180, 165, 177, 237, 255, 286];
const QT_T = [14, 14, 14, 14, 13, 13, 13, 13, 13, 14, 14, 14];
const QT_P = [99, 112, 142, 175, 102, 43, 20, 25, 68, 115, 109, 104];

export function amClimateGraphFig(): string {
  const panel = (x0: number, name: string, temps: number[], precs: number[], tone: string): string => {
    const gx = (m: number): number => 18 + (m * 132) / 11;
    const gyT = (t: number): number => 118 - ((t + 10) / 40) * 92; // -10~30℃
    const barH = (p: number): number => Math.min(66, p * 0.24);
    const bars = precs
      .map((p, i) => `<rect x="${(gx(i) - 4).toFixed(1)}" y="${(122 - barH(p)).toFixed(1)}" width="8" height="${Math.max(0.5, barH(p)).toFixed(1)}" rx="1.5" fill="#7EB2E8" opacity=".85"/>`)
      .join("");
    const line = temps.map((t, i) => `${i === 0 ? "M" : "L"}${gx(i).toFixed(1)} ${gyT(t).toFixed(1)}`).join(" ");
    return `<g transform="translate(${x0} 0)">
      <rect x="2" y="20" width="164" height="118" rx="12" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
      <line x1="14" y1="${gyT(0).toFixed(1)}" x2="156" y2="${gyT(0).toFixed(1)}" stroke="#C2CCD8" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="13" y="${(gyT(0) - 3).toFixed(1)}" font-size="7.5" font-weight="700" fill="#8A94A6">0℃</text>
      <line x1="14" y1="${gyT(20).toFixed(1)}" x2="156" y2="${gyT(20).toFixed(1)}" stroke="#E2E8F0" stroke-width="1"/>
      <text x="13" y="${(gyT(20) - 2).toFixed(1)}" font-size="7.5" font-weight="700" fill="#8A94A6">20℃</text>
      ${bars}
      <path d="${line}" stroke="${tone}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${gx(0).toFixed(1)}" y="134" text-anchor="middle" font-size="7.5" font-weight="700" fill="#8A94A6">1월</text>
      <text x="${gx(6).toFixed(1)}" y="134" text-anchor="middle" font-size="7.5" font-weight="700" fill="#8A94A6">7월</text>
      <text x="${gx(11).toFixed(1)}" y="134" text-anchor="middle" font-size="7.5" font-weight="700" fill="#8A94A6">12월</text>
      <text x="84" y="14" text-anchor="middle" font-size="12" font-weight="900" fill="#333D4B">${name}</text>
      <g transform="translate(10 146)" font-size="7.8" font-weight="700" fill="#6B7684">
        <path d="M0 -2h12" stroke="${tone}" stroke-width="2.4"/><text x="16" y="1">기온(℃)</text>
        <rect x="58" y="-7" width="7" height="9" fill="#7EB2E8"/><text x="69" y="1">강수량(mm)</text>
      </g>
    </g>`;
  };
  return `<svg viewBox="0 0 344 160" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="같은 적도 부근 두 도시 (가)와 (나)의 기온과 강수량 그래프">
    ${panel(2, "(가)", IQ_T, IQ_P, "#E2574C")}${panel(176, "(나)", QT_T, QT_P, "#8A5AC2")}
  </svg>`;
}

/* ---------- L3: 고도-기온 다이어그램(concept·recap 겸용) ---------- */
export function amAltitudeFig(): string {
  const steps: [number, string, string, string][] = [
    [118, "#2E7E46", "0m — 약 26℃", "덥고 습한 저지"],
    [88, "#8FBF5A", "약 1,500m — 약 19℃", "온화한 사면"],
    [58, "#B0672A", "약 2,850m — 약 13℃", "고산 도시(키토)"],
    [28, "#EAF2FA", "약 5,000m 위 — 0℃ 아래", "만년설"],
  ];
  const stair = steps
    .map(
      ([y, c], i) => `<rect x="${56 + i * 4}" y="${y}" width="${118 - i * 26}" height="${i === 0 ? 34 : 30}" rx="5" fill="${c}"/>`,
    )
    .join("");
  const labels = steps
    .map(
      ([y, , t, d]) => `<g transform="translate(196 ${y + 10})">
      <text x="0" y="0" font-size="9.5" font-weight="900" fill="#333D4B">${t}</text>
      <text x="0" y="12" font-size="8.5" font-weight="700" fill="#6B7684">${d}</text>
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="고도가 높아질수록 기온이 낮아지는 계단 그림 — 저지에서 만년설까지">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="17" font-size="10" font-weight="900" fill="#333D4B">높이 올라갈수록 서늘해져요 (모형)</text>
    ${stair}${labels}
    <path d="M40 124V32M40 32l-4 7M40 32l4 7" stroke="#8A5AC2" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="30" y="80" text-anchor="middle" font-size="8.5" font-weight="800" fill="#8A5AC2" transform="rotate(-90 30 80)">고도 상승</text>
    <text x="14" y="160" font-size="8" font-weight="700" fill="#8A94A6">같은 적도라도 높이가 기후를 바꿔요 — 저위도 고산 기후</text>
  </svg>`;
}

/* ---------- L4: 주요 국가 민족(인종) 구성(퀴즈 그림) ---------- */
// 교과서 인쇄 통계(신상 지리 자료 2023, 2019년 기준) 반올림 — 각 나라의 최다 집단만 강조.
export function amEthnicFig(opts?: { letters?: boolean }): string {
  const rows: [string, string, number, string, string][] = [
    ["멕시코", "혼혈", 64, "#8A5AC2", "㉠"],
    ["페루", "원주민", 52, "#B0672A", "㉡"],
    ["아르헨티나", "유럽계", 86, "#3F8FC8", "㉢"],
    ["자메이카", "아프리카계", 92, "#2E7E4E", "㉣"],
  ];
  const useLetters = !!opts?.letters;
  const pies = rows
    .map(([nation, group, pct, color, letter], i) => {
      const cx = 52 + i * 80;
      const cy = 74;
      const r = 26;
      const a = (pct / 100) * Math.PI * 2;
      const x1 = cx + r * Math.sin(a);
      const y1 = cy - r * Math.cos(a);
      const large = pct > 50 ? 1 : 0;
      return `<g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#DCE2EC"/>
      <path d="M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${color}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" font-weight="900" fill="#FFFFFF" stroke="rgba(0,0,0,.25)" stroke-width="2" paint-order="stroke">${pct}%</text>
      <text x="${cx}" y="${cy + r + 14}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#333D4B">${nation}</text>
      <text x="${cx}" y="${cy + r + 26}" text-anchor="middle" font-size="8.5" font-weight="800" fill="${color}">${useLetters ? letter : `${group} 최다`}</text>
    </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 138" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="라틴 아메리카 네 나라의 가장 큰 민족(인종) 집단 비율 그래프">
    <rect x="0" y="0" width="344" height="138" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="18" font-size="10" font-weight="900" fill="#333D4B">나라마다 가장 큰 집단이 달라요</text>
    <text x="330" y="18" text-anchor="end" font-size="8" font-weight="700" fill="#8A94A6">(2019년, 각국 최다 집단)</text>
    ${pies}
  </svg>`;
}

/* ---------- L4: 미국 유입 이주자 출신 대륙(concept figure) ---------- */
// 미래엔 99쪽 자료 4(국제연합 2022, 2020년 기준) — 만 명 반올림.
export function amMigrantBarFig(): string {
  const rows: [string, number, string][] = [
    ["라틴 아메리카", 1252, "#E8590C"],
    ["아시아", 717, "#C2933A"],
    ["유럽", 246, "#8E9EC8"],
    ["아프리카", 131, "#2E7E4E"],
    ["앵글로아메리카", 54, "#3F8FC8"],
    ["오세아니아", 17, "#8A5AC2"],
  ];
  const bw = (v: number): number => (v / 1300) * 180;
  const bars = rows
    .map(
      ([n, v, c], i) => `<g transform="translate(0 ${30 + i * 21})">
      <text x="96" y="10" text-anchor="end" font-size="9" font-weight="800" fill="#4E5968">${n}</text>
      <rect x="102" y="0" width="${Math.max(2.5, bw(v)).toFixed(1)}" height="13" rx="4" fill="${c}"/>
      <text x="${(107 + Math.max(2.5, bw(v))).toFixed(1)}" y="10" font-size="9" font-weight="900" fill="#333D4B">${v.toLocaleString()}</text>
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="미국으로 유입된 이주자의 출신 대륙별 수를 나타낸 막대그래프">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="17" font-size="10" font-weight="900" fill="#333D4B">미국으로 온 이주자 — 어디에서 왔을까?</text>
    <text x="330" y="17" text-anchor="end" font-size="8" font-weight="700" fill="#8A94A6">(만 명, 2020년, 국제연합)</text>
    ${bars}
  </svg>`;
}

/* ---------- L5: 문화 혼종성 공식 다이어그램(concept·recap 겸용) ---------- */
export function amHybridFig(): string {
  const card = (x: number, y: number, w: number, c: string, t1: string, t2: string): string => `
    <g transform="translate(${x} ${y})">
      <rect width="${w}" height="34" rx="9" fill="${c}"/>
      <text x="${w / 2}" y="15" text-anchor="middle" font-size="9" font-weight="900" fill="#FFFFFF">${t1}</text>
      <text x="${w / 2}" y="27" text-anchor="middle" font-size="8" font-weight="700" fill="rgba(255,255,255,.85)">${t2}</text>
    </g>`;
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="서로 다른 문화가 만나 새로운 문화가 태어나는 과정을 나타낸 그림">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="18" font-size="10" font-weight="900" fill="#333D4B">문화 혼종성 — 만나서, 섞여서, 새것으로</text>
    ${card(14, 32, 100, "#B0672A", "원주민의 문화", "전통 신앙·풍습")}
    ${card(122, 32, 100, "#3F8FC8", "유럽의 문화", "언어·종교·악기")}
    ${card(230, 32, 100, "#2E7E4E", "아프리카의 문화", "리듬·춤")}
    <path d="M64 72v14q108 26 108 26M172 72v40M280 72v14q-108 26-108 26" stroke="#8A94A6" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="172" cy="118" r="17" fill="#E8590C"/>
    <path d="M165 118q7-7 14 0t-14 0z" fill="#FFFFFF" opacity=".9"/>
    <text x="172" y="147" text-anchor="middle" font-size="9.5" font-weight="900" fill="#C0471C">새로운 문화 탄생!</text>
    <text x="172" y="160" text-anchor="middle" font-size="8.5" font-weight="700" fill="#6B7684">탱고 · 레게 · 텍스멕스 · 리우 카니발 …</text>
  </svg>`;
}

/* ---------- L6: 초국적 기업의 공간적 분업(concept·퀴즈 겸용) ---------- */
/** letters=true면 기능 이름을 ㉠㉡㉢으로 가리고 입지 조건만 보여 준다(퀴즈판 — 유출 방지). */
export function amDivisionFig(opts?: { letters?: boolean }): string {
  const L = !!opts?.letters;
  const box = (x: number, y: number, w: number, h: number, c: string, name: string, cond: string): string => `
    <g transform="translate(${x} ${y})">
      <rect width="${w}" height="${h}" rx="10" fill="#FFFFFF" stroke="${c}" stroke-width="2"/>
      <rect width="${w}" height="17" rx="8" fill="${c}"/>
      <text x="${w / 2}" y="12" text-anchor="middle" font-size="9" font-weight="900" fill="#FFFFFF">${name}</text>
      <text x="${w / 2}" y="31" text-anchor="middle" font-size="7.8" font-weight="700" fill="#4E5968">${cond}</text>
    </g>`;
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="초국적 기업의 여러 기능이 서로 다른 지역에 나뉘어 자리 잡는 모습을 나타낸 그림">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="18" font-size="10" font-weight="900" fill="#333D4B">한 회사의 기능이 세계로 나뉘어요 — 공간적 분업</text>
    ${box(102, 30, 140, 38, "#1E4E9E", L ? "㉠" : "본사", "정보와 자본이 풍부한 곳")}
    ${box(14, 92, 140, 38, "#8A5AC2", L ? "㉡" : "연구소", "기술 갖춘 고급 인력이 많은 곳")}
    ${box(190, 92, 140, 38, "#C0471C", L ? "㉢" : "생산 공장", "임금이 싸고 시장과 가까운 곳")}
    <path d="M142 68l-44 24M202 68l44 24" stroke="#8A94A6" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M104 88l-6 4 7 2M240 88l6 4-7 2" stroke="#8A94A6" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="172" y="150" text-anchor="middle" font-size="8.5" font-weight="700" fill="#6B7684">본사와 자회사는 비교적 동등한 지위로, 수평적으로 연결되기도 해요</text>
  </svg>`;
}

/* ---------- L7: 디트로이트 인구 변화(퀴즈·개념 겸용) ---------- */
// 미국 인구 센서스 공표값 반올림(만 명): 1920 99 → 1950 185(정점) → 2020 64.
export function amDetroitFig(): string {
  const data: [number, number][] = [
    [1920, 99], [1930, 157], [1940, 162], [1950, 185], [1960, 167], [1970, 151],
    [1980, 120], [1990, 103], [2000, 95], [2010, 71], [2020, 64],
  ];
  const gx = (yr: number): number => 40 + ((yr - 1920) / 100) * 282;
  const gy = (v: number): number => 128 - (v / 200) * 100;
  const line = data.map(([yr, v], i) => `${i === 0 ? "M" : "L"}${gx(yr).toFixed(1)} ${gy(v).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 344 158" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="디트로이트의 인구 변화 그래프 — 1920년부터 2020년까지">
    <rect x="0" y="0" width="344" height="158" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="17" font-size="10" font-weight="900" fill="#333D4B">디트로이트의 인구</text>
    <text x="330" y="17" text-anchor="end" font-size="8" font-weight="700" fill="#8A94A6">(만 명, 미국 인구 센서스)</text>
    ${[0, 50, 100, 150, 200].map((v) => `<line x1="40" y1="${gy(v)}" x2="322" y2="${gy(v)}" stroke="#E2E8F0" stroke-width="1"/><text x="34" y="${gy(v) + 3}" text-anchor="end" font-size="7.5" font-weight="700" fill="#8A94A6">${v}</text>`).join("")}
    <path d="${line}" stroke="#4A566A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${gx(1950)}" cy="${gy(185)}" r="3.6" fill="#3F8FC8"/>
    <text x="${gx(1950)}" y="${gy(185) - 8}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#1E4E9E">1950년 약 185만</text>
    <circle cx="${gx(2020)}" cy="${gy(64)}" r="3.6" fill="#C0471C"/>
    <text x="${gx(2020) - 4}" y="${gy(64) - 10}" text-anchor="end" font-size="8.5" font-weight="900" fill="#C0471C">2020년 약 64만</text>
    <line x1="${gx(2013)}" y1="${gy(0)}" x2="${gx(2013)}" y2="${gy(120)}" stroke="#C0471C" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"/>
    <text x="${gx(2013) - 4}" y="${gy(126)}" text-anchor="end" font-size="7.5" font-weight="800" fill="#C0471C">2013년 시 정부 파산 신청</text>
    ${[1920, 1950, 1980, 2020].map((yr) => `<text x="${gx(yr)}" y="142" text-anchor="middle" font-size="7.5" font-weight="700" fill="#8A94A6">${yr}</text>`).join("")}
  </svg>`;
}

/* ---------- L7: 러스트 벨트 위치 지도(퀴즈 그림) ---------- */
// 북아메리카 북동부 크롭 — 오대호 연안 공업 지역 하이라이트(미래엔 마무리 6 계승, 러프 영역도 lon/lat).
// 벨트는 오대호 '남쪽 연안'을 감싸고, 호수는 벨트 위에 다시 그려 물로 읽히게(눈검수 재설계).
export function amRustFig(): string {
  const vx = lonToX(-98);
  const vy = latToY(52);
  const vw = lonToX(-64) - vx;
  const vh = latToY(34) - vy;
  const belt: [number, number][] = [
    [-92.5, 44.5], [-88, 44.2], [-84, 43.6], [-80, 44], [-76.5, 44.4], [-73.8, 43.2],
    [-73.5, 41.2], [-76, 39.6], [-80.5, 39.2], [-85.5, 39.6], [-89.5, 40.6], [-92.8, 42.4],
  ];
  const lake = (lon: number, lat: number, rxDeg: number, ryDeg: number): string =>
    `<ellipse cx="${lonToX(lon).toFixed(1)}" cy="${latToY(lat).toFixed(1)}" rx="${((rxDeg / 360) * 1000).toFixed(1)}" ry="${((ryDeg / 180) * 500).toFixed(1)}" fill="#7EB2E8" stroke="#4E82B8" stroke-width=".4"/>`;
  return `<svg viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="북아메리카 북동부 지도에서 오대호 연안의 한 지역이 붉은 띠로 표시되어 있다">
    <rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" rx="4" fill="#D9EDF8"/>
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
    <path d="${polyPath(belt)}" fill="#C0471C" opacity=".32" stroke="#C0471C" stroke-width="1" stroke-dasharray="3.5 2.5"/>
    ${lake(-88.4, 47.6, 3.6, 1.2)}${lake(-87, 43.8, 1.1, 2.1)}${lake(-82.4, 44.9, 1.5, 1.7)}${lake(-80.9, 42.25, 1.8, 0.75)}${lake(-77.9, 43.6, 1.4, 0.6)}
    <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".5" fill="none" fill-rule="evenodd"/>
    <circle cx="${lonToX(-83.05).toFixed(1)}" cy="${latToY(42.33).toFixed(1)}" r="1.5" fill="#333D4B"/>
    <text x="${(lonToX(-83.05) - 3).toFixed(1)}" y="${(latToY(42.33) + 1.6).toFixed(1)}" text-anchor="end" font-size="5.5" font-weight="900" fill="#333D4B">디트로이트</text>
    <circle cx="${lonToX(-80).toFixed(1)}" cy="${latToY(40.44).toFixed(1)}" r="1.5" fill="#333D4B"/>
    <text x="${(lonToX(-80) + 3).toFixed(1)}" y="${(latToY(40.44) + 5).toFixed(1)}" text-anchor="start" font-size="5.5" font-weight="900" fill="#333D4B">피츠버그</text>
    <text x="${lonToX(-88.4).toFixed(1)}" y="${latToY(49.7).toFixed(1)}" text-anchor="middle" font-size="5.5" font-weight="900" fill="#4E6E96">오대호</text>
    <text x="${(vx + 4).toFixed(1)}" y="${(vy + vh - 4).toFixed(1)}" text-anchor="start" font-size="6" font-weight="900" fill="#C0471C">붉은 띠 = ㉠ 지역</text>
  </svg>`;
}

/* ---------- recap 미니아트 (64×64 플랫 — soc4 문법) ---------- */
const M = (inner: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;

export function soc5MiniArt(key: string): string {
  switch (key) {
    /* ── L1 ── */
    case "twolands": // 두 덩어리 대륙
      return M(
        `<circle cx="32" cy="32" r="23" fill="#4E9AE8"/>
        <path d="M18 12q12-4 20 2l4 8-6 6-6 6 2 6-4 4-4-6-6-8q-4-8 0-18z" fill="#8FCE6E" stroke="#3E8E3E" stroke-width="1.6"/>
        <path d="M30 40q8-2 10 4l-2 8-4 8q-3 2-5-2l-2-8z" fill="#8FCE6E" stroke="#3E8E3E" stroke-width="1.6"/>
        <path d="M28 38l3 3" stroke="#3E8E3E" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="23" fill="none" stroke="#2E6EA8" stroke-width="2"/>`,
      );
    case "twonames": // 두 벌의 이름(경계 둘)
      return M(
        `<rect x="10" y="8" width="44" height="48" rx="8" fill="#F2ECDE" stroke="#8A93A6" stroke-width="2"/>
        <path d="M12 26q20-6 40 0" stroke="#C0471C" stroke-width="2.6" stroke-dasharray="5 4" stroke-linecap="round"/>
        <path d="M12 42q20 6 40 0" stroke="#1E4E9E" stroke-width="2.6" stroke-dasharray="5 4" stroke-linecap="round"/>
        <circle cx="20" cy="16" r="3" fill="#3F8FC8"/><circle cx="32" cy="34" r="3" fill="#E2574C"/><circle cx="44" cy="50" r="3" fill="#2E9E5B"/>`,
      );
    case "citypins": // 도시 도장들
      return M(
        `<path d="M14 52q18 6 36 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>
        <path d="M20 40q-8-8 0-16 8-8 16 0t0 16l-8 10z" fill="#E2574C" stroke="#8F2D1D" stroke-width="2"/>
        <circle cx="28" cy="31" r="5" fill="#FFE8CE"/>
        <path d="M44 34q-5-5 0-10t10 0q5 5 0 10l-5 6z" fill="#3F8FC8" stroke="#1E4E78" stroke-width="1.8"/>
        <circle cx="49" cy="29" r="3" fill="#EAF2FA"/`,
      );
    /* ── L2 ── */
    case "westspine": // 서쪽 등뼈
      return M(
        `<rect x="8" y="10" width="48" height="44" rx="8" fill="#F2ECDE"/>
        <path d="M18 54V12" stroke="#B09A6E" stroke-width="0"/>
        <path d="M14 50 20 14l6 14 4-20 6 22 4-12 4 34z" fill="#B09A6E" stroke="#7E6A48" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M19 20l1-6 3 8q-2 2-4-2zM29 16l1-8 3 10q-3 2-4-2z" fill="#F6FAFD"/>
        <path d="M48 44q4-6 8-2M46 52h10" stroke="#8FBF5A" stroke-width="0"/>
        <path d="M46 46q5-4 10 0M46 52q5-4 10 0" stroke="#C8CC8E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "bigriver": // 평원의 큰 강
      return M(
        `<rect x="8" y="10" width="48" height="44" rx="8" fill="#D8D096"/>
        <path d="M30 10q-6 12 2 22t-2 22" stroke="#4E9AE8" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M20 20q3-2 5 0M40 42q3-2 5 0" stroke="#8FAE5A" stroke-width="2" stroke-linecap="round"/>
        <path d="M44 16q4-4 8 0" stroke="#8FAE5A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "greenlung": // 아마존(지구의 허파)
      return M(
        `<circle cx="32" cy="32" r="21" fill="#2E7E46"/>
        <path d="M32 14q4 8 0 18t0 18" stroke="#9CC87E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M20 24q8 4 12 8M44 24q-8 4-12 8M22 42q6-2 10-6M42 42q-6-2-10-6" stroke="#9CC87E" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M14 30q8-4 14 2" stroke="#4E9AE8" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    /* ── L3 ── */
    case "climateladder": // 위도의 기후 사다리
      return M(
        `<rect x="16" y="8" width="32" height="9" fill="#8E9EC8"/>
        <rect x="16" y="17" width="32" height="9" fill="#4E8EC8"/>
        <rect x="16" y="26" width="32" height="9" fill="#A5D65C"/>
        <rect x="16" y="35" width="32" height="9" fill="#E8B93C"/>
        <rect x="16" y="44" width="32" height="10" fill="#1E9E50"/>
        <path d="M54 10v44M54 10l-3 5M54 10l3 5" stroke="#5A6B7E" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      );
    case "coolquito": // 서늘한 고산 도시
      return M(
        `<path d="M8 52 26 16l12 20 8-12 10 28z" fill="#B09A6E" stroke="#7E6A48" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M23 22 26 16l4 8q-4 3-7-2z" fill="#F6FAFD"/>
        <rect x="28" y="36" width="7" height="7" rx="1.4" fill="#E8EEF6" stroke="#5A7896" stroke-width="1.4"/>
        <rect x="37" y="38" width="6" height="5" rx="1.2" fill="#E8EEF6" stroke="#5A7896" stroke-width="1.4"/>
        <circle cx="50" cy="12" r="5" fill="#FFC24D"/>
        <path d="M12 60h40" stroke="#C2A54E" stroke-width="0"/>`,
      );
    case "thinair": // 고도-기온 반비례
      return M(
        `<path d="M12 52h40" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>
        <path d="M16 46 32 14l16 32z" fill="#B09A6E" stroke="#7E6A48" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M29 20 32 14l3 6q-3 3-6 0z" fill="#F6FAFD"/>
        <rect x="52" y="14" width="6" height="32" rx="3" fill="#E8EEF6" stroke="#8A93A6" stroke-width="1.4"/>
        <rect x="53.5" y="34" width="3" height="10" rx="1.5" fill="#E2574C"/>
        <circle cx="55" cy="47" r="4" fill="#E2574C"/>`,
      );
    /* ── L4 ── */
    case "shipsarrive": // 이주의 배들
      return M(
        `<path d="M6 50q14-6 26 0t26 0" stroke="#4E9AE8" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M14 40h16l-3 6H17z" fill="#8F6438" stroke="#5E4326" stroke-width="1.6"/>
        <path d="M22 40V26q8 4 8 14z" fill="#F5EEDF" stroke="#B09858" stroke-width="1.4"/>
        <path d="M40 36h14l-2.5 5H42z" fill="#5A7896" stroke="#3E5A78" stroke-width="1.6"/>
        <path d="M47 36V25q7 4 7 11z" fill="#F5EEDF" stroke="#B09858" stroke-width="1.4"/>
        <circle cx="14" cy="14" r="4" fill="#E8A16A"/><circle cx="26" cy="12" r="4" fill="#C2843A"/>
        <circle cx="38" cy="14" r="4" fill="#F5C89A"/><circle cx="50" cy="12" r="4" fill="#8A6A4E"/>`,
      );
    case "mixmosaic": // 다양한 구성 모자이크
      return M(
        `<circle cx="32" cy="32" r="22" fill="#DCE2EC"/>
        <path d="M32 10a22 22 0 0 1 20 13L32 32z" fill="#8A5AC2"/>
        <path d="M52 23a22 22 0 0 1-6 25L32 32z" fill="#3F8FC8"/>
        <path d="M46 48a22 22 0 0 1-26 2L32 32z" fill="#B0672A"/>
        <path d="M20 50a22 22 0 0 1-9-24L32 32z" fill="#2E7E4E"/>
        <circle cx="32" cy="32" r="7" fill="#F7F9FC" stroke="#8A93A6" stroke-width="1.6"/>`,
      );
    case "andesvillage": // 안데스의 원주민 마을
      return M(
        `<path d="M6 52 22 20l12 20 8-12 12 24z" fill="#B09A6E" stroke="#7E6A48" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M19 26 22 20l4 8q-4 3-7-2z" fill="#F6FAFD"/>
        <rect x="26" y="40" width="8" height="7" rx="1.4" fill="#C8965E" stroke="#8F5D2D" stroke-width="1.4"/>
        <path d="M25 40l5-4 5 4" stroke="#8F5D2D" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
        <path d="M44 44q3-6 6 0M43 47h8" stroke="#E2574C" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      );
    /* ── L5 ── */
    case "mixbowl": // 섞임의 그릇
      return M(
        `<path d="M12 30h40l-4 16q-2 8-16 8t-16-8z" fill="#E8EEF6" stroke="#5A7896" stroke-width="2"/>
        <path d="M20 30q6-10 12-4t12 0" stroke="#E8590C" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M24 14q-2 5 2 8M34 10q-2 5 2 8M44 14q-2 5 2 8" stroke="#8A93A6" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="24" cy="38" r="2.6" fill="#8A5AC2"/><circle cx="34" cy="42" r="2.6" fill="#2E7E4E"/><circle cx="42" cy="37" r="2.6" fill="#C2933A"/>`,
      );
    case "tangoshoes": // 탱고(악기와 리듬)
      return M(
        `<path d="M14 44q0-22 16-24 4 8-2 12 10-2 14 6t-6 12q-10 4-22-6z" fill="#C0471C" stroke="#8F2D1D" stroke-width="0"/>
        <path d="M16 20q10-8 20-2l-4 8q-8-4-12 2z" fill="#8A5AC2" stroke="#5E3A8E" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M14 34h22q6 0 6 6t-6 6H20q-6 0-6-6z" fill="#E2574C" stroke="#8F2D1D" stroke-width="1.8"/>
        <path d="M20 34v12M26 34v12M32 34v12" stroke="#8F2D1D" stroke-width="1.4" opacity=".6"/>
        <path d="M48 18q4-2 6 2M50 28q5-2 7 2" stroke="#3FA7A0" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="55" cy="17" r="2" fill="#3FA7A0"/><circle cx="58" cy="27" r="2" fill="#3FA7A0"/>
        <path d="M12 54h40" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "worldplate": // 세계로 간 밥상
      return M(
        `<circle cx="32" cy="34" r="20" fill="#FFFFFF" stroke="#D8DEE8" stroke-width="2.4"/>
        <circle cx="32" cy="34" r="13" fill="#F5EFE2"/>
        <path d="M26 30q6-4 12 0l-2 8h-8z" fill="#E8843A"/>
        <path d="M27 29q2-3 4-1M33 28q2-3 4-1" stroke="#3E8E3E" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="14" cy="12" r="5" fill="#E2574C"/>
        <path d="M13 8q2-3 4-2" stroke="#3E8E3E" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M46 10q6 2 6 8" stroke="#8A93A6" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M50 20l3-3 1 5z" fill="#8A93A6"/>`,
      );
    /* ── L6 ── */
    case "borderless": // 국경 없는 회사
      return M(
        `<circle cx="32" cy="32" r="21" fill="#4E9AE8"/>
        <path d="M14 26q18-6 36 0M14 38q18 6 36 0M32 11v42M12 32h40" stroke="#D9EDF8" stroke-width="1.6" fill="none"/>
        <rect x="24" y="20" width="16" height="14" rx="2.4" fill="#1E4E9E" stroke="#12305E" stroke-width="1.4"/>
        <path d="M27 24h3M27 28h3M34 24h3M34 28h3" stroke="#8ED2F5" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M18 46l7-6M46 46l-7-6" stroke="#F2C24E" stroke-width="2.2" stroke-dasharray="3 2.5" stroke-linecap="round"/>
        <circle cx="16" cy="48" r="3.4" fill="#F2C24E"/><circle cx="48" cy="48" r="3.4" fill="#F2C24E"/>`,
      );
    case "splitjobs": // 공간적 분업
      return M(
        `<rect x="24" y="8" width="16" height="14" rx="3" fill="#1E4E9E"/>
        <path d="M28 13h3M28 17h3M34 13h3M34 17h3" stroke="#C8DCF8" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M32 22v8M32 30l-14 8M32 30l14 8" stroke="#8A93A6" stroke-width="2" fill="none" stroke-linecap="round"/>
        <rect x="8" y="40" width="18" height="14" rx="3" fill="#8A5AC2"/>
        <circle cx="17" cy="47" r="3.4" fill="#EAE2F8"/>
        <rect x="38" y="40" width="18" height="14" rx="3" fill="#C0471C"/>
        <path d="M42 46h4v4h-4zM48 44h4v6h-4z" fill="#F8D8CC"/>`,
      );
    case "fruitstamp": // 세계 농장의 과일
      return M(
        `<ellipse cx="26" cy="38" rx="14" ry="16" fill="#E0B26E" stroke="#8F6438" stroke-width="1.8"/>
        <path d="M20 30l12 16M20 38l12 8M20 46l10 4M32 30 20 46" stroke="#8F6438" stroke-width="1" opacity=".6"/>
        <path d="M22 20q4 4 4 0t4 0q-2-6 2-8-6 0-6 4-2-4-6-2 4 2 2 6z" fill="#3F9A5C"/>
        <circle cx="46" cy="24" r="8" fill="#2E5EA8"/>
        <path d="M43 24q3-4 6 0t-6 0z" fill="#FFFFFF"/>
        <path d="M42 40q6-2 10 2" stroke="#8A93A6" stroke-width="2" stroke-linecap="round"/>`,
      );
    /* ── L7 ── */
    case "factorygo": // 떠나는 공장
      return M(
        `<rect x="8" y="34" width="26" height="14" rx="2.6" fill="#8A96A8" stroke="#5E6A7C" stroke-width="1.8"/>
        <path d="M12 34v-8h6v8M22 34V22h6v12" fill="#6E7A8C" stroke="#5E6A7C" stroke-width="1.4"/>
        <rect x="36" y="38" width="14" height="10" rx="2.4" fill="#E8590C" stroke="#A0400E" stroke-width="1.6"/>
        <circle cx="14" cy="52" r="4" fill="#2E3A50"/><circle cx="28" cy="52" r="4" fill="#2E3A50"/><circle cx="44" cy="52" r="4" fill="#2E3A50"/>
        <path d="M52 42h6M52 46h4" stroke="#AAB4C4" stroke-width="2" stroke-linecap="round"/>
        <path d="M56 30l4 4-4 4" stroke="#8A93A6" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "rustcity": // 러스트 벨트
      return M(
        `<rect x="10" y="24" width="14" height="28" rx="2" fill="#A8B4C4" stroke="#6E7A8C" stroke-width="1.8"/>
        <rect x="28" y="18" width="14" height="34" rx="2" fill="#8A96A8" stroke="#5E6A7C" stroke-width="1.8"/>
        <rect x="46" y="30" width="10" height="22" rx="2" fill="#B8C2D0" stroke="#6E7A8C" stroke-width="1.8"/>
        <path d="M13 30h8M13 36h8M31 24h8M31 30h8" stroke="#5E6A7C" stroke-width="1.4"/>
        <path d="M30 40l10 8M40 40l-10 8" stroke="#8F5D2D" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 56h48" stroke="#8A93A6" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M48 22q4-6 8-2" stroke="#B0672A" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      );
    case "cityreborn": // 다시 일어서는 도시
      return M(
        `<rect x="12" y="30" width="12" height="24" rx="2" fill="#8A96A8" stroke="#5E6A7C" stroke-width="1.8"/>
        <rect x="28" y="22" width="13" height="32" rx="2" fill="#5A7896" stroke="#3E5A78" stroke-width="1.8"/>
        <path d="M31 28h7M31 34h7M31 40h7" stroke="#D8ECF8" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M46 54V34l8-6v26" fill="#7FC98E" stroke="#3F9A5C" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M50 24v-8M50 16l-4 4M50 16l4 4" stroke="#2E9E5B" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 56h48" stroke="#AAB4C4" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="12" fill="#2F9E44"/>`);
  }
}
