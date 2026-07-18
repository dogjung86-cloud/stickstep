// socFigures4 — 사회 Ⅳ(아프리카) 그림 모듈: 아프리카 크롭 지도(실데이터)·기후·인구·자원·미니아트.
//   · 지도는 ui/worldMap.generated.ts + ui/continentMap.ts(AFRICA 지역 데이터) 재사용 —
//     손으로 대륙을 그리지 않는다(사회 트랙 원칙). 소품(산·강·사막)은 전부 lon/lat →
//     lonToX/latToY 계산 좌표만(눈대중 금지 — Ⅱ 스팟 실사고의 재발 방지 1급 규율).
//   · 기후 분포는 손 폴리곤이 아니라 public/soc/climate.webp(쾨펜 실데이터 오버레이)를
//     육지 클립으로 임베드 — 아프리카는 열대·건조·온대·고산 4분류가 그대로 교과서 지도다.
//   · 기후 그래프 수치는 실측 근사(1991~2020 평균 반올림): 카이로(연중 건조) vs
//     다르에스살람(고온 + 우기·건기 뚜렷)의 대비가 그림의 심장.
import { WORLD_LAND_PATH } from "./worldMap.generated";
import { CONTINENTS, lonToX, latToY, polyPath } from "./continentMap";

const AFRICA = CONTINENTS.africa;
const CROP = AFRICA.crop;
const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

function mapShell(inner: string, opts?: { legend?: string; aria?: string }): string {
  const legendH = opts?.legend ? 40 : 0;
  return `<svg viewBox="${CROP.x} ${CROP.y - 6} ${CROP.w} ${CROP.h + 10 + legendH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${opts?.aria ?? "아프리카 지도"}">
    <defs>
      <clipPath id="s4-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="s4-sea" cx=".5" cy=".4" r=".95">
        <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
      </radialGradient>
    </defs>
    <rect x="${CROP.x}" y="${CROP.y - 6}" width="${CROP.w}" height="${CROP.h + 10}" rx="12" fill="url(#s4-sea)"/>
    <line x1="${CROP.x}" y1="${latToY(23.4).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
    <text x="${CROP.x + 5}" y="${(latToY(23.4) - 3).toFixed(1)}" font-size="8.5" font-weight="700" fill="#5A7A96">북회귀선</text>
    <line x1="${CROP.x}" y1="250" x2="${CROP.x + CROP.w}" y2="250" stroke="#7FA8C8" stroke-width="1.1" opacity=".6"/>
    <text x="${CROP.x + 5}" y="247" font-size="8.5" font-weight="700" fill="#5A7A96">적도</text>
    <line x1="${CROP.x}" y1="${latToY(-23.4).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(-23.4).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>
    <text x="${CROP.x + 5}" y="${(latToY(-23.4) - 3).toFixed(1)}" font-size="8.5" font-weight="700" fill="#5A7A96">남회귀선</text>
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
      <circle cx="${lonToX(m.lon).toFixed(1)}" cy="${latToY(m.lat).toFixed(1)}" r="8.5" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.6"/>
      <text x="${lonToX(m.lon).toFixed(1)}" y="${(latToY(m.lat) + 3.2).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="#333D4B">${m.t}</text>
    </g>`,
    )
    .join("");

/* ---------- L1: 다섯 지역 구분 지도 ---------- */
/** 다섯 지역 색 지도. labels=false면 이름 없이(퀴즈 — ㉠㉡ 마커로 지역 묻기). */
export function afRegionsFig(opts?: { labels?: boolean; letters?: { lon: number; lat: number; t: string }[] }): string {
  const showLabels = opts?.labels !== false;
  const fills = AFRICA.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="${r.color}" opacity=".5"/>`)
    .join("");
  const labels = showLabels
    ? AFRICA.regions
        .map((r) => {
          const ax = lonToX(r.anchor[0]).toFixed(1);
          const ay = (latToY(r.anchor[1]) + 3.4).toFixed(1);
          return `<g>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="8.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" opacity=".85">${r.name}</text>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#2E3A50">${r.name}</text>
          </g>`;
        })
        .join("")
    : "";
  return mapShell(
    `<g clip-path="url(#s4-lclip)">${fills}</g>${labels}${letterMarks(opts?.letters)}`,
    { aria: "아프리카의 다섯 지역 구분 지도" },
  );
}

/* ---------- L2: 지형 지도(hotspot 배경·pad0) ---------- */
// 소품 좌표는 전부 lon/lat — 스팟 % 검산: x% = (lonToX(lon)−444)/209·100, y% = (latToY(lat)−138)/216·100.
//   아틀라스(-3.5,33.5)→(22.1,8.8) · 사하라(13,23)→(44.1,22.3) · 나일강(32.5,24)→(70.0,21.0) ·
//   콩고 분지(21,0)→(54.7,51.9) · 동아프리카 지구대(36.2,3.5)→(74.9,47.4) ·
//   킬리만자로(37.35,-3.07)→(76.4,55.8) · 빅토리아 폭포(25.85,-17.92)→(61.2,74.9)
export function afTerrainFig(): string {
  const mtn = (lon: number, lat: number, s: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 5.5 * s).toFixed(1)} ${(y + 3.2 * s).toFixed(1)} L${x.toFixed(1)} ${(y - 4.8 * s).toFixed(1)} L${(x + 5.5 * s).toFixed(1)} ${(y + 3.2 * s).toFixed(1)}z" fill="#B09A6E" stroke="#7E6A48" stroke-width=".7"/>`;
  };
  const volcano = (lon: number, lat: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 4.5).toFixed(1)} ${(y + 2.6).toFixed(1)} L${x.toFixed(1)} ${(y - 4.4).toFixed(1)} L${(x + 4.5).toFixed(1)} ${(y + 2.6).toFixed(1)}z" fill="#8A7458" stroke="#5E4E3A" stroke-width=".7"/>
      <path d="M${(x - 1.4).toFixed(1)} ${(y - 2.2).toFixed(1)} L${x.toFixed(1)} ${(y - 4.4).toFixed(1)} L${(x + 1.4).toFixed(1)} ${(y - 2.2).toFixed(1)}q-1.4 1.1-2.8 0z" fill="#F2F7FB"/>`;
  };
  const river = (pts: [number, number][], w = 1.6): string => {
    const d = pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
    return `<path d="${d}" stroke="#4E9AE8" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  };
  // 사하라(모래 폴리곤)와 콩고 분지(진초록) — 러프 영역, 클립으로 해안선 안에 갇힌다
  const sahara: [number, number][] = [
    [-13, 16], [-6, 19], [2, 19.5], [10, 18.5], [18, 17], [26, 16.5], [33, 15.5],
    [35, 20], [33, 25], [30, 29.5], [22, 29], [12, 29.5], [2, 30.5], [-7, 28.5], [-12, 23],
  ];
  const congo: [number, number][] = [
    [14, 4], [20, 4.5], [26, 3], [28.5, 0], [28, -3.5], [24, -6], [19, -6.5], [15, -4], [13.5, 0],
  ];
  const inner = `
    <g clip-path="url(#s4-lclip)">
      <path d="${polyPath(sahara)}" fill="#EED9A0" opacity=".9"/>
      <path d="${polyPath(congo)}" fill="#9CC87E" opacity=".8"/>
    </g>
    ${river([[32.9, 0.4], [33, 2.5], [32.4, 4.8], [31.6, 7.5], [32.6, 10], [33.4, 12.5], [33, 15.6], [32.5, 18.5], [33, 21.5], [32.9, 24], [31.2, 27], [31, 29.5], [31.5, 31]], 1.8)}
    ${river([[27.5, -0.6], [24, 0.8], [21, 1.6], [18, 0.6], [16, -1.6], [15.3, -4.3], [13.6, -5.4], [12.3, -6]], 1.7)}
    ${river([[-10.5, 10.2], [-8, 12.6], [-4, 14.6], [0, 16.4], [4, 14], [5.2, 11], [6.5, 7.2], [6.2, 4.9]], 1.4)}
    ${river([[24, -13.6], [26, -16.2], [28, -17.6], [31, -16.2], [33.5, -17.2], [35.8, -18.3]], 1.4)}
    ${mtn(-7, 31.5, 1.1)}${mtn(-3.5, 33.5, 1.25)}${mtn(1, 35.2, 1)}${mtn(7.5, 36.2, 0.9)}
    ${mtn(29, -29.5, 1)}${mtn(28, -30.8, 0.9)}
    ${volcano(37.35, -3.07)}
    <ellipse cx="${lonToX(33).toFixed(1)}" cy="${latToY(-1.3).toFixed(1)}" rx="5.6" ry="4.4" fill="#7EB2E8" stroke="#4E82B8" stroke-width=".7"/>
    <path d="M${lonToX(40.5).toFixed(1)} ${latToY(12).toFixed(1)} L${lonToX(38.5).toFixed(1)} ${latToY(8).toFixed(1)} L${lonToX(36.2).toFixed(1)} ${latToY(3.5).toFixed(1)} L${lonToX(36).toFixed(1)} ${latToY(-1).toFixed(1)} L${lonToX(35.3).toFixed(1)} ${latToY(-5).toFixed(1)} L${lonToX(34.3).toFixed(1)} ${latToY(-9).toFixed(1)} L${lonToX(34.5).toFixed(1)} ${latToY(-13).toFixed(1)}"
      stroke="#B0672A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
    <path d="M${lonToX(40.5).toFixed(1)} ${latToY(12).toFixed(1)} L${lonToX(38.5).toFixed(1)} ${latToY(8).toFixed(1)} L${lonToX(36.2).toFixed(1)} ${latToY(3.5).toFixed(1)} L${lonToX(36).toFixed(1)} ${latToY(-1).toFixed(1)} L${lonToX(35.3).toFixed(1)} ${latToY(-5).toFixed(1)} L${lonToX(34.3).toFixed(1)} ${latToY(-9).toFixed(1)} L${lonToX(34.5).toFixed(1)} ${latToY(-13).toFixed(1)}"
      stroke="#F5E6C8" stroke-width="1" fill="none" stroke-dasharray="3 3.5" stroke-linecap="round"/>
    <path d="M${(lonToX(25.85) - 3).toFixed(1)} ${(latToY(-17.92) - 2.6).toFixed(1)}h6M${(lonToX(25.85) - 2).toFixed(1)} ${(latToY(-17.92) - 2.6).toFixed(1)}v4.6M${lonToX(25.85).toFixed(1)} ${(latToY(-17.92) - 2.6).toFixed(1)}v4.6M${(lonToX(25.85) + 2).toFixed(1)} ${(latToY(-17.92) - 2.6).toFixed(1)}v4.6"
      stroke="#4E9AE8" stroke-width="1.2" stroke-linecap="round"/>
  `;
  return mapShell(inner, { aria: "아프리카의 주요 지형 지도 — 산맥과 사막, 큰 강, 지구대, 호수, 폭포" });
}

/* ---------- L3: 기후 분포 지도(쾨펜 실데이터 오버레이) ---------- */
export function afClimateFig(opts?: { letters?: { lon: number; lat: number; t: string }[] }): string {
  const inner = `
    <image href="${BASE}soc/climate.webp" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" clip-path="url(#s4-lclip)" opacity=".92"/>
    ${letterMarks(opts?.letters)}`;
  const pal: [string, string][] = [["#1E9E50", "열대"], ["#E8B93C", "건조"], ["#A5D65C", "온대"], ["#B0672A", "고산"]];
  const legend = `<g font-size="8.5" font-weight="800">
    ${pal.map(([c, n], i) => `<g transform="translate(${CROP.x + 14 + i * 50} ${CROP.y + CROP.h + 22})">
      <rect x="0" y="-8" width="10" height="10" rx="3" fill="${c}"/><text x="13" y="1" fill="#4E5968">${n}</text></g>`).join("")}
  </g>`;
  return mapShell(inner, { legend, aria: "아프리카의 기후 분포 지도 — 적도를 중심으로 남북이 비슷하게 배열된다" });
}

/* ---------- L3: 카이로·다르에스살람 기후 그래프 페어(퀴즈 그림) ---------- */
// 실측 근사(월평균) — 카이로: 연중 강수 거의 없음(건조) / 다르에스살람: 고온 + 우기(3~5월)·건기 뚜렷.
const CAIRO_T = [14, 16, 19, 23, 27, 28, 29, 29, 27, 24, 20, 16];
const CAIRO_P = [5, 4, 4, 1, 0, 0, 0, 0, 0, 1, 3, 6];
const DAR_T = [28, 28, 28, 27, 26, 25, 24, 24, 25, 26, 27, 28];
const DAR_P = [77, 58, 138, 254, 198, 43, 26, 24, 23, 45, 74, 91];

export function afClimateGraphFig(): string {
  const panel = (x0: number, name: string, temps: number[], precs: number[], tone: string): string => {
    const gx = (m: number): number => 18 + (m * 132) / 11;
    const gyT = (t: number): number => 118 - ((t + 10) / 40) * 92; // -10~30℃
    const barH = (p: number): number => Math.min(66, p * 0.26);
    const bars = precs
      .map((p, i) => `<rect x="${(gx(i) - 4).toFixed(1)}" y="${(122 - barH(p)).toFixed(1)}" width="8" height="${Math.max(0.5, barH(p)).toFixed(1)}" rx="1.5" fill="#7EB2E8" opacity=".85"/>`)
      .join("");
    const line = temps.map((t, i) => `${i === 0 ? "M" : "L"}${gx(i).toFixed(1)} ${gyT(t).toFixed(1)}`).join(" ");
    return `<g transform="translate(${x0} 0)">
      <rect x="2" y="20" width="164" height="118" rx="12" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
      <line x1="14" y1="${gyT(0).toFixed(1)}" x2="156" y2="${gyT(0).toFixed(1)}" stroke="#C2CCD8" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="13" y="${(gyT(0) - 3).toFixed(1)}" font-size="7.5" font-weight="700" fill="#8A94A6">0℃</text>
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
  return `<svg viewBox="0 0 344 160" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="(가)와 (나) 두 도시의 기온과 강수량 그래프">
    ${panel(2, "(가)", CAIRO_T, CAIRO_P, "#E8A104")}${panel(176, "(나)", DAR_T, DAR_P, "#2E9E5B")}
  </svg>`;
}

/* ---------- L3: 적도 거울 밴드 다이어그램(concept·recap 겸용) ---------- */
export function afMirrorFig(): string {
  // 밴드 rect → 적도선 → 라벨 순서로 그린다 — 선이 "열대 우림" 글자를 관통하지 않게(눈검수 수정).
  const BANDS: [number, number, string, string][] = [
    [14, 16, "#A5D65C", "온대"],
    [30, 20, "#E8B93C", "사막(건조)"],
    [50, 20, "#8FBF5A", "사바나(우기·건기)"],
    [70, 28, "#1E9E50", "열대 우림"],
    [98, 20, "#8FBF5A", "사바나(우기·건기)"],
    [118, 20, "#E8B93C", "사막(건조)"],
    [138, 16, "#A5D65C", "온대"],
  ];
  const rects = BANDS.map(([y, h, c]) => `<rect x="60" y="${y}" width="160" height="${h}" fill="${c}"/>`).join("");
  const labels = BANDS.map(
    ([y, h, , label]) => `<text x="140" y="${y + h / 2 + 3.4}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#FFFFFF" stroke="rgba(0,0,0,.18)" stroke-width="2" paint-order="stroke">${label}</text>`,
  ).join("");
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="적도를 중심으로 남북이 대칭인 기후 배열 그림 — 우림, 사바나, 사막, 온대 순서">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    ${rects}
    <line x1="48" y1="84" x2="232" y2="84" stroke="#E8590C" stroke-width="2.2" stroke-dasharray="6 4"/>
    ${labels}
    <text x="30" y="80" text-anchor="middle" font-size="9" font-weight="900" fill="#C0471C">적도</text>
    <g stroke="#8A94A6" stroke-width="1.6" fill="none">
      <path d="M244 84v-56M244 84v56M240 32l4-4 4 4M240 136l4 4 4-4"/>
    </g>
    <text x="256" y="62" font-size="8.5" font-weight="700" fill="#6B7684">적도에서</text>
    <text x="256" y="74" font-size="8.5" font-weight="700" fill="#6B7684">멀어질수록</text>
    <text x="256" y="96" font-size="8.5" font-weight="700" fill="#6B7684">같은 순서가</text>
    <text x="256" y="108" font-size="8.5" font-weight="700" fill="#6B7684">거울처럼 반복</text>
  </svg>`;
}

/* ---------- L6: 대륙별 중위 연령 막대그래프(퀴즈 그림) ---------- */
// UN 세계 인구 전망(2021 무렵) 근사 반올림 — 자연값. aria는 판독 과제를 유출하지 않는 중립 문구.
export function afMedianBarFig(): string {
  const rows: [string, number, string][] = [
    ["유럽", 44, "#8E9EC8"],
    ["북아메리카", 38, "#7EA8D8"],
    ["오세아니아", 33, "#6FB2A8"],
    ["아시아", 32, "#C2933A"],
    ["남아메리카", 31, "#B08050"],
    ["아프리카", 19, "#E8590C"],
  ];
  const bw = (v: number): number => (v / 50) * 190;
  const bars = rows
    .map(
      ([n, v, c], i) => `<g transform="translate(0 ${26 + i * 22})">
      <text x="86" y="10" text-anchor="end" font-size="9.5" font-weight="800" fill="#4E5968">${n}</text>
      <rect x="92" y="0" width="${bw(v).toFixed(1)}" height="13" rx="4" fill="${c}"/>
      <text x="${(96 + bw(v)).toFixed(1)}" y="10" font-size="9.5" font-weight="900" fill="#333D4B">${v}세</text>
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="여섯 대륙의 중위 연령을 나타낸 막대그래프">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="17" font-size="10" font-weight="900" fill="#333D4B">대륙별 중위 연령</text>
    <text x="330" y="17" text-anchor="end" font-size="8" font-weight="700" fill="#8A94A6">(2021년 무렵, 국제연합)</text>
    ${bars}
  </svg>`;
}

/* ---------- L6: 아프리카 인구 증가 곡선(concept figure) ---------- */
// 국제연합 추계 근사(억 명): 1961 약 3 → 2021 약 14 → 2081 약 37(추정 — 2022년 이후 점선).
export function afPopRiseFig(): string {
  const years = [1961, 1981, 2001, 2021, 2041, 2061, 2081];
  const vals = [3, 5, 8, 14, 21, 29, 37];
  const gx = (i: number): number => 40 + (i * 272) / 6;
  const gy = (v: number): number => 128 - (v / 40) * 100;
  const solid = vals.slice(0, 4).map((v, i) => `${i === 0 ? "M" : "L"}${gx(i).toFixed(1)} ${gy(v).toFixed(1)}`).join(" ");
  const dashed = vals.slice(3).map((v, i) => `${i === 0 ? "M" : "L"}${gx(i + 3).toFixed(1)} ${gy(v).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 344 158" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="아프리카 총인구 변화 그래프 — 1961년부터 2081년 추정까지">
    <rect x="0" y="0" width="344" height="158" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="17" font-size="10" font-weight="900" fill="#333D4B">아프리카 총인구</text>
    <text x="330" y="17" text-anchor="end" font-size="8" font-weight="700" fill="#8A94A6">(국제연합 — 2022년 이후는 추정)</text>
    ${[0, 10, 20, 30, 40].map((v) => `<line x1="40" y1="${gy(v)}" x2="320" y2="${gy(v)}" stroke="#E2E8F0" stroke-width="1"/><text x="34" y="${gy(v) + 3}" text-anchor="end" font-size="7.5" font-weight="700" fill="#8A94A6">${v}</text>`).join("")}
    <text x="14" y="52" font-size="7.5" font-weight="700" fill="#8A94A6">(억 명)</text>
    <path d="${solid}" stroke="#E8590C" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${dashed}" stroke="#E8590C" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 5" opacity=".75"/>
    <circle cx="${gx(3)}" cy="${gy(14)}" r="3.6" fill="#E8590C"/>
    <text x="${gx(3)}" y="${gy(14) - 8}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#C0471C">2021년 약 14억</text>
    ${years.map((y, i) => (i % 2 === 0 ? `<text x="${gx(i)}" y="142" text-anchor="middle" font-size="7.5" font-weight="700" fill="#8A94A6">${y}</text>` : "")).join("")}
  </svg>`;
}

/* ---------- L6: 자원 세계 순위 표(퀴즈·개념 겸용) ---------- */
// 순위·국가는 미국 지질 조사국(2023) — 점유율 수치는 두 책이 달라(기준 연도 차) 순위만 표기한다.
export function afResourceRankFig(): string {
  const rows: [string, string, string][] = [
    ["백금", "남아프리카 공화국", "1위"],
    ["코발트", "콩고 민주 공화국", "1위"],
    ["크롬", "남아프리카 공화국", "1위"],
    ["망간", "남아프리카 공화국", "1위"],
    ["보크사이트", "기니", "2위"],
    ["다이아몬드", "보츠와나", "3위"],
  ];
  const medal = (rank: string): string => (rank === "1위" ? "#E8A104" : rank === "2위" ? "#98A4B8" : "#B08050");
  const body = rows
    .map(
      ([res, nation, rank], i) => `<g transform="translate(0 ${44 + i * 19})">
      <rect x="12" y="-13" width="320" height="17" rx="5" fill="${i % 2 ? "#FFFFFF" : "#F1F5FA"}"/>
      <text x="22" y="0" font-size="9.5" font-weight="900" fill="#333D4B">${res}</text>
      <text x="118" y="0" font-size="9.5" font-weight="700" fill="#4E5968">${nation}</text>
      <circle cx="296" cy="-4.5" r="7.5" fill="${medal(rank)}"/>
      <text x="296" y="-1.4" text-anchor="middle" font-size="7.5" font-weight="900" fill="#FFFFFF">${rank.replace("위", "")}</text>
      <text x="310" y="0" font-size="8.5" font-weight="800" fill="#6B7684">위</text>
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="아프리카 주요 자원의 세계 생산 순위 표">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="18" font-size="10" font-weight="900" fill="#333D4B">아프리카의 자원 — 세계 생산 순위</text>
    <text x="330" y="18" text-anchor="end" font-size="8" font-weight="700" fill="#8A94A6">(미국 지질 조사국, 2023)</text>
    <text x="22" y="32" font-size="8" font-weight="800" fill="#8A94A6">자원</text>
    <text x="118" y="32" font-size="8" font-weight="800" fill="#8A94A6">생산 국가</text>
    <text x="288" y="32" font-size="8" font-weight="800" fill="#8A94A6">세계 순위</text>
    ${body}
  </svg>`;
}

/* ---------- L7: 아프리카연합 상징 도식(concept figure — 훅 회수) ---------- */
export function afAuFig(): string {
  const stars = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    return `<circle cx="${(172 + 92 * Math.cos(a)).toFixed(1)}" cy="${(84 + 62 * Math.sin(a)).toFixed(1)}" r="3" fill="#F2C24E"/>`;
  }).join("");
  return `<svg viewBox="0 0 344 168" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="아프리카 대륙을 별들이 원으로 둘러싼 그림 — 아프리카연합의 상징을 본뜬 도식">
    <rect x="0" y="0" width="344" height="168" rx="14" fill="#2E5E3E"/>
    <g transform="translate(172 84)">
      <g transform="scale(0.62) translate(-548.5 -247)">
        <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd" clip-path="url(#s4au-clip)"/>
      </g>
    </g>
    <defs><clipPath id="s4au-clip"><rect x="${CROP.x}" y="${CROP.y}" width="${CROP.w}" height="${CROP.h}"/></clipPath></defs>
    ${stars}
    <text x="172" y="158" text-anchor="middle" font-size="8.5" font-weight="700" fill="#CDE8CE">별들이 손잡은 원 — 회원국들의 연합을 뜻해요 (모형 도식)</text>
  </svg>`;
}

/* ---------- L8: 그레이트 그린 월 지도(concept figure) ---------- */
// 사헬 경로(세네갈~지부티) — 러프 경로도 lon/lat 계산 좌표만. 총길이 약 8,000km는 캡션 몫.
export function afGgwFig(): string {
  const route: [number, number][] = [
    [-15.5, 14.6], [-10, 14.2], [-5, 13.8], [0, 13.8], [5, 13.4], [10, 13.2],
    [15, 13.2], [20, 13.6], [25, 13.2], [30, 12.6], [34, 13.4], [38, 14.2], [42, 11.8],
  ];
  const d = route.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
  const trees = route
    .filter((_, i) => i % 2 === 0)
    .map(([lo, la]) => {
      const x = lonToX(lo);
      const y = latToY(la) - 4;
      return `<path d="M${x.toFixed(1)} ${(y + 3).toFixed(1)}v-2.6" stroke="#4E7E36" stroke-width="1"/><circle cx="${x.toFixed(1)}" cy="${(y - 1.4).toFixed(1)}" r="2.2" fill="#3F9A5C"/>`;
    })
    .join("");
  const inner = `
    <g clip-path="url(#s4-lclip)">
      <path d="${polyPath([[-13, 16], [-6, 19], [2, 19.5], [10, 18.5], [18, 17], [26, 16.5], [33, 15.5], [35, 20], [33, 25], [30, 29.5], [22, 29], [12, 29.5], [2, 30.5], [-7, 28.5], [-12, 23]])}" fill="#EED9A0" opacity=".85"/>
    </g>
    <path d="${d}" stroke="#2E9E5B" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
    ${trees}
    <text x="${lonToX(8).toFixed(1)}" y="${(latToY(24)).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="#9A7B34">사하라 사막</text>
    <text x="${lonToX(6).toFixed(1)}" y="${(latToY(9.5)).toFixed(1)}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#1E6E3C">초록 벽(나무 심기 띠)</text>
  `;
  return mapShell(inner, { aria: "사하라 사막 남쪽 가장자리를 따라 서쪽 끝에서 동쪽 끝까지 이어지는 나무 심기 띠를 표시한 아프리카 지도" });
}

/* ---------- L8: 공정 무역 이익 배분 비교(퀴즈·개념 겸용) ---------- */
// 수치 인쇄 없이 구조만 — 일반 무역은 여러 단계가 나눠 갖고, 공정 무역은 생산자 몫이 커진다.
export function afFairFig(): string {
  const seg = (x: number, w: number, c: string, label: string, dark = false): string => `
    <rect x="${x}" y="0" width="${w}" height="26" fill="${c}"/>
    ${w >= 34 ? `<text x="${x + w / 2}" y="16" text-anchor="middle" font-size="8" font-weight="800" fill="${dark ? "#334" : "#FFF"}">${label}</text>` : ""}`;
  return `<svg viewBox="0 0 344 150" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="일반 무역과 공정 무역에서 한 잔의 커피 값이 나뉘는 구조 비교 그림">
    <rect x="0" y="0" width="344" height="150" rx="14" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
    <text x="14" y="20" font-size="10" font-weight="900" fill="#333D4B">커피 한 잔 값, 누가 얼마나 가져갈까?</text>
    <text x="14" y="44" font-size="9" font-weight="800" fill="#6B7684">일반 무역</text>
    <g transform="translate(14 50)">
      ${seg(0, 22, "#C0471C", "", false)}
      ${seg(22, 62, "#98A4B8", "원료 구매", false)}
      ${seg(84, 62, "#8A94A6", "수출업자", false)}
      ${seg(146, 80, "#6B7684", "가공업자", false)}
      ${seg(226, 90, "#4E5968", "판매점", false)}
      <text x="0" y="38" font-size="8" font-weight="800" fill="#C0471C">↑ 생산자 몫(작아요)</text>
    </g>
    <text x="14" y="106" font-size="9" font-weight="800" fill="#1E6E3C">공정 무역 — 중간 단계를 줄여요</text>
    <g transform="translate(14 112)">
      ${seg(0, 108, "#2E9E5B", "생산자와 조합", false)}
      ${seg(108, 100, "#6B7684", "가공업자", false)}
      ${seg(208, 108, "#4E5968", "판매점", false)}
    </g>
  </svg>`;
}

/* ---------- recap 미니아트 (64×64 플랫 — soc2·3 문법) ---------- */
const M = (inner: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;

export function soc4MiniArt(key: string): string {
  switch (key) {
    /* ── L1 ── */
    case "position": // 두 대양 사이의 대륙
      return M(
        `<circle cx="32" cy="30" r="21" fill="#4E9AE8"/>
        <path d="M26 12q12-2 15 8 3 8-2 15-4 8-11 6-6-2-6-9l3-7-4-6z" fill="#C8B48A"/>
        <path d="M13 28q-3 2 0 4M9 24q-3 3 0 6" stroke="#D9EDF8" stroke-width="2" stroke-linecap="round"/>
        <path d="M52 28q3 2 0 4M56 24q3 3 0 6" stroke="#D9EDF8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="30" r="21" fill="none" stroke="#2E6EA8" stroke-width="2"/>
        <path d="M10 56q22 6 44 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "fiveregions": // 다섯 조각 대륙
      return M(
        `<path d="M14 12h34l6 12-4 14-8 14-8 6-8-6-8-14-6-14z" fill="#F2ECDE" stroke="#8A93A6" stroke-width="2"/>
        <path d="M12 26h44M24 26l4 24M40 26l-4 24M18 40h30" stroke="#8A93A6" stroke-width="1.6" stroke-dasharray="3 3"/>
        <circle cx="32" cy="19" r="3.4" fill="#F2A72E"/><circle cx="20" cy="33" r="3.2" fill="#E2574C"/>
        <circle cx="32" cy="35" r="3.2" fill="#2E9E5B"/><circle cx="44" cy="33" r="3.2" fill="#8A5AC2"/>
        <circle cx="32" cy="50" r="3.2" fill="#3F8FC8"/>`,
      );
    case "saharaline": // 사하라 기준선
      return M(
        `<path d="M8 22q12-8 24-4t24 0v10q-12 6-24 3t-24 1z" fill="#EED9A0"/>
        <path d="M8 40q24 8 48 0" stroke="#8A93A6" stroke-width="0"/>
        <path d="M6 34h52" stroke="#C0471C" stroke-width="2.6" stroke-dasharray="6 4" stroke-linecap="round"/>
        <path d="M10 48q10-4 20 0t24 0" stroke="#3F9A5C" stroke-width="3" stroke-linecap="round"/>
        <circle cx="46" cy="16" r="5" fill="#FFC24D"/>`,
      );
    /* ── L2 ── */
    case "plateau": // 탁자 같은 고원
      return M(
        `<path d="M8 46 16 26h32l8 20z" fill="#B09A6E" stroke="#7E6A48" stroke-width="2" stroke-linejoin="round"/>
        <path d="M16 26h32" stroke="#7E6A48" stroke-width="2"/>
        <path d="M26 26l2-6h8l2 6" fill="#8A7458" stroke="#5E4E3A" stroke-width="1.6"/>
        <path d="M8 52h48" stroke="#C8A468" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "nileriver": // 사막을 가로지르는 강
      return M(
        `<rect x="8" y="10" width="48" height="42" rx="8" fill="#EED9A0"/>
        <path d="M32 52q-6-10 2-20t-2-22" stroke="#4E9AE8" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M24 46q3-2 5 0M36 20q3-2 5 0" stroke="#3F9A5C" stroke-width="2" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="4.6" fill="#FFC24D"/>`,
      );
    case "riftcrack": // 갈라지는 지구대
      return M(
        `<rect x="8" y="12" width="48" height="40" rx="8" fill="#C8B48A"/>
        <path d="M34 12q-6 10 0 20t-4 20" stroke="#8F5D2D" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M34 12q-6 10 0 20t-4 20" stroke="#F5E6C8" stroke-width="1.6" stroke-dasharray="3 3" fill="none" stroke-linecap="round"/>
        <path d="M18 30l-6 2M52 30l6 2" stroke="#5E4E3A" stroke-width="0"/>
        <path d="M22 32h-8M42 32h8" stroke="#5E4E3A" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M16 29l-4 3 4 3M48 29l4 3-4 3" stroke="#5E4E3A" stroke-width="2" fill="none" stroke-linejoin="round"/>`,
      );
    /* ── L3 ── */
    case "mirrorbelt": // 대칭 밴드
      return M(
        `<rect x="14" y="8" width="36" height="8" fill="#E8B93C"/>
        <rect x="14" y="16" width="36" height="8" fill="#8FBF5A"/>
        <rect x="14" y="24" width="36" height="16" fill="#1E9E50"/>
        <rect x="14" y="40" width="36" height="8" fill="#8FBF5A"/>
        <rect x="14" y="48" width="36" height="8" fill="#E8B93C"/>
        <line x1="8" y1="32" x2="56" y2="32" stroke="#E8590C" stroke-width="2.6" stroke-dasharray="5 4"/>`,
      );
    case "wetdry": // 우기·건기 교대
      return M(
        `<path d="M14 20q4-8 12-6 2-6 10-5t8 7q6 1 5 8t-8 6H20q-8-1-6-10z" fill="#7EA8D8"/>
        <path d="M20 36l-2 6M28 36l-2 6M36 36l-2 6" stroke="#4E9AE8" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="48" cy="46" r="7" fill="#FFC24D"/>
        <path d="M48 36v-3M56 40l2-2M58 48h3" stroke="#E8A104" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 56h48" stroke="#C2A54E" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "seasonflip": // 남반구 계절 반대
      return M(
        `<circle cx="32" cy="32" r="17" fill="#4E9AE8"/>
        <path d="M15 32h34" stroke="#FFF" stroke-width="2"/>
        <circle cx="24" cy="24" r="5" fill="#FFC24D"/>
        <path d="M40 40l3 3M45 38l1 4M38 45l4 1" stroke="#D9EDF8" stroke-width="2" stroke-linecap="round"/>
        <path d="M52 14q6 4 4 12" stroke="#8A93A6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M54 27l2-4-4-1z" fill="#8A93A6"/>`,
      );
    /* ── L4 ── */
    case "manyvoices": // 많은 민족·언어
      return M(
        `<path d="M8 14h20v13H16l-5 5v-5H8z" fill="#FFF" stroke="#E8590C" stroke-width="2.2"/>
        <path d="M36 12h20v13h-3v5l-5-5H36z" fill="#FFF" stroke="#2E9E5B" stroke-width="2.2"/>
        <path d="M22 36h20v12h-8l-4 4v-4h-8z" fill="#FFF" stroke="#8A5AC2" stroke-width="2.2"/>
        <circle cx="14" cy="20" r="2" fill="#E8590C"/><path d="M20 20h4" stroke="#E8590C" stroke-width="2" stroke-linecap="round"/>
        <path d="M41 18l4 4M45 18l-4 4" stroke="#2E9E5B" stroke-width="2" stroke-linecap="round"/>
        <path d="M28 42q4-3 8 0" stroke="#8A5AC2" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      );
    case "mudhouse": // 흙벽돌집 골목
      return M(
        `<rect x="8" y="22" width="20" height="26" rx="2" fill="#C8965E" stroke="#8F5D2D" stroke-width="2"/>
        <rect x="36" y="22" width="20" height="26" rx="2" fill="#D8A96E" stroke="#8F5D2D" stroke-width="2"/>
        <rect x="28" y="30" width="8" height="18" fill="#5E4E3A" opacity=".5"/>
        <rect x="14" y="30" width="6" height="6" fill="#5E4E3A"/><rect x="44" y="30" width="6" height="6" fill="#5E4E3A"/>
        <circle cx="50" cy="12" r="5.6" fill="#FFC24D"/>
        <path d="M8 54h48" stroke="#C8A468" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "cassava": // 카사바 식탁
      return M(
        `<ellipse cx="32" cy="44" rx="21" ry="9" fill="#8F5D2D"/>
        <circle cx="32" cy="38" r="10" fill="#F5EEDF" stroke="#D8C8A0" stroke-width="2"/>
        <path d="M14 26q6-8 12-2M50 26q-6-8-12-2" stroke="#8F5D2D" stroke-width="0"/>
        <path d="M18 18q4-8 10-9-1 7-6 10zM46 18q-4-8-10-9 1 7 6 10z" fill="#7A9E4E"/>
        <path d="M24 22q6-4 16 0" stroke="#5E7E3A" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
      );
    /* ── L5 ── */
    case "drumroots": // 리듬의 뿌리
      return M(
        `<ellipse cx="26" cy="18" rx="12" ry="4.6" fill="#F5E8CE" stroke="#8A5E2E" stroke-width="2"/>
        <path d="M14 18q0 8 6 12-2 10 0 16 2 3 6 3t6-3q2-6 0-16 6-4 6-12z" fill="#A87244" stroke="#5E3A1E" stroke-width="2"/>
        <path d="M17 21l4 9M35 21l-4 9" stroke="#E8D8B8" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M44 14q4-2 6 2M46 24q5-2 8 2M44 34q4-2 6 2" stroke="#3FA7A0" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <circle cx="52" cy="15" r="2" fill="#3FA7A0"/><circle cx="56" cy="25" r="2" fill="#3FA7A0"/><circle cx="52" cy="35" r="2" fill="#3FA7A0"/>`,
      );
    case "maskart": // 미술 — 가면과 화폭
      return M(
        `<path d="M18 10q10-4 14 4 3 8-1 18-3 8-9 8t-9-8q-4-10 5-22z" fill="#8A6A3E" stroke="#5E4326" stroke-width="2"/>
        <path d="M16 24h7M27 24h7" stroke="#2E2118" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M22 34q3 2 6 0" stroke="#2E2118" stroke-width="2" stroke-linecap="round" fill="none"/>
        <rect x="38" y="20" width="18" height="24" rx="2" fill="#FFF" stroke="#8A93A6" stroke-width="2"/>
        <path d="M42 32l4-6 4 8 3-4" stroke="#C0471C" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 52q20 6 38 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "filmreel": // 놀리우드 — 필름과 카메라
      return M(
        `<circle cx="24" cy="26" r="14" fill="#3A4658"/>
        <circle cx="24" cy="26" r="4" fill="#F2F7FB"/>
        ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${(24 + 8.4 * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2)).toFixed(1)}" cy="${(26 + 8.4 * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2)).toFixed(1)}" r="2.4" fill="#F2F7FB"/>`).join("")}
        <path d="M38 22l10-6v20l-10-6z" fill="#E8590C"/>
        <rect x="20" y="44" width="26" height="10" rx="3" fill="#5A6B7E"/>
        <path d="M10 58h44" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    /* ── L6 ── */
    case "youngpop": // 젊은 인구(새싹 화분)
      return M(
        `<path d="M18 40h28l-4 16H22z" fill="#C8965E" stroke="#8F5D2D" stroke-width="2"/>
        <path d="M26 40q-2-10 0-16M32 40V18M38 40q2-10 0-16" stroke="#4E8A2E" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M26 24q-6-2-7-8 6 0 7 8zM32 18q-1-7 5-10 1 7-5 10zM38 24q6-2 7-8-6 0-7 8z" fill="#5BB874"/>
        <circle cx="52" cy="14" r="4.6" fill="#FFC24D"/>`,
      );
    case "gemhand": // 풍부한 자원
      return M(
        `<path d="M22 18h20l6 8-16 20-16-20z" fill="#7EC8E8" stroke="#3F8FC8" stroke-width="2" stroke-linejoin="round"/>
        <path d="M22 18l10 8 10-8M16 26h32M32 26v20" stroke="#3F8FC8" stroke-width="1.6"/>
        <circle cx="14" cy="46" r="5" fill="#F2C24E" stroke="#C2933A" stroke-width="1.6"/>
        <circle cx="50" cy="46" r="5" fill="#C8965E" stroke="#8F5D2D" stroke-width="1.6"/>
        <path d="M10 58h44" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "valueadd": // 가공하면 커지는 가치
      return M(
        `<circle cx="16" cy="40" r="7" fill="#8A7458" stroke="#5E4E3A" stroke-width="1.8"/>
        <path d="M27 40h8M31 36l4 4-4 4" stroke="#8A93A6" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="40" y="26" width="16" height="22" rx="3" fill="#4E7CB8" stroke="#2E4E7E" stroke-width="1.8"/>
        <path d="M44 32h8M44 37h8M44 42h5" stroke="#D8E8F8" stroke-width="2" stroke-linecap="round"/>
        <path d="M44 16l4 6M52 14l2 7M48 12v9" stroke="#F2C24E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M8 56h48" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    /* ── L7 ── */
    case "growbalance": // 지속가능한 발전(현재+미래 저울)
      return M(
        `<path d="M32 12v10" stroke="#5A6B7E" stroke-width="2.6"/>
        <path d="M12 24h40" stroke="#5A6B7E" stroke-width="3" stroke-linecap="round"/>
        <path d="M12 24v4q0 6 7 6t7-6v-4z" fill="#C8D0DC"/><path d="M40 24v4q0 6 7 6t7-6v-4z" fill="#C8D0DC"/>
        <circle cx="19" cy="22" r="4" fill="#E8A104"/>
        <path d="M47 24q-2-6 0-9 4 1 4 6-1 3-4 3z" fill="#3F9A5C"/>
        <rect x="26" y="44" width="12" height="12" rx="2" fill="#5A6B7E"/>`,
      );
    case "starring": // 아프리카연합(별의 원)
      return M(
        `<circle cx="32" cy="32" r="21" fill="#2E5E3E"/>
        <path d="M28 22q8-2 11 5 2 6-2 11-3 5-8 4t-6-7q-1-8 5-13z" fill="#F2ECDE"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<circle cx="${(32 + 15 * Math.cos((i * Math.PI) / 5)).toFixed(1)}" cy="${(32 + 15 * Math.sin((i * Math.PI) / 5)).toFixed(1)}" r="1.8" fill="#F2C24E"/>`).join("")}
        <circle cx="32" cy="32" r="21" fill="none" stroke="#1E4630" stroke-width="2"/>`,
      );
    case "damwater": // 잉가 프로젝트(댐과 전기)
      return M(
        `<path d="M10 20h44v8H10z" fill="#98A4B8"/>
        <path d="M14 28q2 14-2 24M26 28q1 12-1 24M40 28q-1 12 1 24M52 28q-2 14 2 24" stroke="#7EB2E8" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M34 8l-6 9h5l-5 9" stroke="#F2C24E" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    /* ── L8 ── */
    case "greenwall": // 초록 벽
      return M(
        `<rect x="6" y="14" width="52" height="18" rx="4" fill="#EED9A0"/>
        <rect x="6" y="36" width="52" height="6" rx="3" fill="#3F9A5C"/>
        ${[12, 22, 32, 42, 52].map((x) => `<path d="M${x} 36v-5" stroke="#4E7E36" stroke-width="1.6"/><circle cx="${x}" cy="28.6" r="3" fill="#5BB874"/>`).join("")}
        <path d="M8 50q24 6 48 0" stroke="#C2A54E" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "worldhands": // 세계의 협력
      return M(
        `<circle cx="32" cy="26" r="14" fill="#4E9AE8"/>
        <path d="M24 20q8-4 16 0M24 32q8 4 16 0M32 12v28M18 26h28" stroke="#D9EDF8" stroke-width="1.6" fill="none"/>
        <path d="M10 46q10-8 22-2M54 46q-10-8-22-2" stroke="#E8590C" stroke-width="0"/>
        <path d="M12 48q9-7 20-3M52 48q-9-7-20-3" stroke="#C2933A" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="32" cy="46" r="3.4" fill="#E8590C"/>`,
      );
    case "fairbean": // 공정 무역(콩과 저울추)
      return M(
        `<path d="M20 14q10-6 18 2t0 18q-8 8-18 0t0-20z" fill="#8F5D2D" stroke="#5E3A1E" stroke-width="2"/>
        <path d="M24 18q6 8 10 16" stroke="#5E3A1E" stroke-width="2" stroke-linecap="round"/>
        <circle cx="48" cy="44" r="8" fill="#F2C24E" stroke="#C2933A" stroke-width="2"/>
        <path d="M44 44h8M48 40v8" stroke="#8A6A1E" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 56h44" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="12" fill="#E8590C"/>`);
  }
}
