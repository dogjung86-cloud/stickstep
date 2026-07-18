// socFigures3 — 사회 Ⅲ(유럽) 그림 모듈: 유럽 크롭 지도(실데이터)·기후 그래프·EU 도해·미니아트.
//   · 지도는 ui/worldMap.generated.ts + ui/continentMap.ts(EUROPE 지역 데이터)를 재사용 —
//     손으로 대륙을 그리지 않는다(사회 트랙 원칙, socFigures2 문법 계승).
//   · 기후 분포는 교과서 지도(미래엔 55쪽·비상 55쪽)의 러프 재현 — 쾨펜 climate.webp는
//     "서안 해양성/지중해성" 구분이 없어(둘 다 온대) 교과서식 러프 폴리곤으로 따로 그린다.
//   · 기후 그래프 수치는 실측 근사(climate-data 1991~2020 평균의 반올림) — 런던(연중 고른 비·
//     완만한 기온) vs 로마(여름 고온·강수 급감)의 대비가 그림의 심장.
import { WORLD_LAND_PATH } from "./worldMap.generated";
import { CONTINENTS, lonToX, latToY, polyPath } from "./continentMap";

const EUROPE = CONTINENTS.europe;
const CROP = EUROPE.crop;

function mapShell(inner: string, opts?: { legend?: string; aria?: string }): string {
  const legendH = opts?.legend ? 40 : 0;
  return `<svg viewBox="${CROP.x} ${CROP.y - 6} ${CROP.w} ${CROP.h + 10 + legendH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${opts?.aria ?? "유럽 지도"}">
    <defs>
      <clipPath id="s3-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="s3-sea" cx=".5" cy=".4" r=".95">
        <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
      </radialGradient>
    </defs>
    <rect x="${CROP.x}" y="${CROP.y - 6}" width="${CROP.w}" height="${CROP.h + 10}" rx="12" fill="url(#s3-sea)"/>
    <line x1="${CROP.x}" y1="${latToY(60).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(60).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" opacity=".5"/>
    <text x="${CROP.x + 5}" y="${(latToY(60) - 3).toFixed(1)}" font-size="8.5" font-weight="700" fill="#5A7A96">북위 60°</text>
    <line x1="${CROP.x}" y1="${latToY(40).toFixed(1)}" x2="${CROP.x + CROP.w}" y2="${latToY(40).toFixed(1)}" stroke="#7FA8C8" stroke-width="1" opacity=".5"/>
    <text x="${CROP.x + 5}" y="${(latToY(40) - 3).toFixed(1)}" font-size="8.5" font-weight="700" fill="#5A7A96">북위 40°</text>
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

/* ---------- L1: 유럽 지역 구분 지도 ---------- */
/** 네 지역 색 지도. labels=false면 이름 없이(퀴즈 — ㉠㉡ 마커로 지역 묻기). */
export function euroRegionsFig(opts?: { labels?: boolean; letters?: { lon: number; lat: number; t: string }[] }): string {
  const showLabels = opts?.labels !== false;
  const fills = EUROPE.regions
    .map((r) => `<path d="${polyPath(r.poly)}" fill="${r.color}" opacity=".5"/>`)
    .join("");
  const labels = showLabels
    ? EUROPE.regions
        .map((r) => {
          const ax = lonToX(r.anchor[0]).toFixed(1);
          const ay = (latToY(r.anchor[1]) + 3.4).toFixed(1);
          return `<g>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="9.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" opacity=".85">${r.name}</text>
            <text x="${ax}" y="${ay}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#2E3A50">${r.name}</text>
          </g>`;
        })
        .join("")
    : "";
  return mapShell(
    `<g clip-path="url(#s3-lclip)">${fills}</g>${labels}${letterMarks(opts?.letters)}`,
    { aria: "유럽의 네 지역 구분 지도" },
  );
}

/* ---------- L2: 지형 지도(hotspot 배경·pad0) ---------- */
export function euroTerrainFig(): string {
  const mtn = (lon: number, lat: number, s: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 5.5 * s).toFixed(1)} ${(y + 3.2 * s).toFixed(1)} L${x.toFixed(1)} ${(y - 4.8 * s).toFixed(1)} L${(x + 5.5 * s).toFixed(1)} ${(y + 3.2 * s).toFixed(1)}z" fill="#8FA5BE" stroke="#5A7090" stroke-width=".7"/>
      <path d="M${(x - 1.7 * s).toFixed(1)} ${(y - 2 * s).toFixed(1)} L${x.toFixed(1)} ${(y - 4.8 * s).toFixed(1)} L${(x + 1.7 * s).toFixed(1)} ${(y - 2 * s).toFixed(1)}q-1.7 1.3-3.4 0z" fill="#F2F7FB"/>`;
  };
  const volcano = (lon: number, lat: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${(x - 4).toFixed(1)} ${(y + 2.4).toFixed(1)} L${x.toFixed(1)} ${(y - 4).toFixed(1)} L${(x + 4).toFixed(1)} ${(y + 2.4).toFixed(1)}z" fill="#C25C3E" stroke="#8F2D1D" stroke-width=".7"/>
      <path d="M${(x - 1.2).toFixed(1)} ${(y - 5.2).toFixed(1)}q1.2-1.6 2.4 0M${(x + 0.4).toFixed(1)} ${(y - 7.2).toFixed(1)}q1.2-1.6 2.4 0" stroke="#E8825A" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  };
  const river = (pts: [number, number][]): string => {
    const d = pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ");
    return `<path d="${d}" stroke="#4E9AE8" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  };
  const inner = `
    <g clip-path="url(#s3-lclip)">
      <path d="${polyPath([[-1, 49.5], [4, 51.5], [10, 53], [18, 53.5], [28, 54], [40, 56], [52, 56.5], [56, 53], [50, 50], [40, 50], [30, 50.5], [20, 50.5], [12, 50], [5, 48.5], [0, 47.5]])}" fill="#E8D8A8" opacity=".85"/>
    </g>
    ${river([[8.2, 46.4], [7.6, 48.6], [6.8, 50.4], [6.1, 51.8], [4.6, 52]])}
    ${river([[9, 48.6], [13, 48.5], [17, 47.9], [19, 46.6], [22, 45], [26, 44.6], [29.5, 45.4]])}
    ${river([[37, 57.5], [43, 56.2], [46, 51.5], [47.5, 47.5]])}
    ${mtn(6.5, 61, 1)}${mtn(9.5, 62.8, 1.15)}${mtn(13, 64.8, 1)}${mtn(16.5, 66.6, 0.95)}
    ${mtn(6.8, 45.9, 1.3)}${mtn(10, 46.3, 1.5)}${mtn(13.2, 46.6, 1.3)}
    ${mtn(-0.5, 42.7, 1)}${mtn(2, 42.5, 0.95)}
    ${mtn(58.8, 57, 0.9)}${mtn(59.3, 60.5, 0.95)}${mtn(58.6, 53.5, 0.85)}
    ${volcano(-19, 64.6)}${volcano(15, 37.7)}
    <path d="M${lonToX(5.6).toFixed(1)} ${latToY(61.2).toFixed(1)}l3 1.4-2.2 1 3 1.3-2.2 1 3.2 1.4" stroke="#3F8FC8" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  return mapShell(inner, { aria: "유럽의 주요 지형 지도 — 두 산맥과 넓은 평원, 강, 화산" });
}

/* ---------- L3: 기후 분포 지도(교과서식 러프 재현) ---------- */
export function euroClimateFig(opts?: { letters?: { lon: number; lat: number; t: string }[] }): string {
  // 노르웨이 해안은 서안 해양성 띠가 북극권 부근까지 이어진다(두 교과서 지도 공통 — 2026-07-19 감사 보강).
  const oceanic: [number, number][] = [
    [-11, 50.5], [-11, 56], [-5, 59.5], [-1, 63], [3, 66.5], [8, 69.3], [13, 70], [17, 70],
    [19, 69.8], [16, 68.2], [12, 66], [9, 63.5], [7.5, 61], [9, 58.5], [12.5, 57],
    [13, 54.6], [15, 53], [15, 49], [10, 47], [5, 45.5], [-2, 43.2], [-9.5, 43.5], [-10, 45],
  ];
  const med: [number, number][] = [
    [-9.8, 36.8], [-9.3, 42.5], [-2, 42.8], [3, 42.2], [7, 43.4], [10, 44], [14, 45.2],
    [18, 44], [22, 41.5], [26, 40.5], [28.4, 41.3], [27, 37], [23, 34.8], [15, 36], [8, 38], [-6, 35.6],
  ];
  const cold: [number, number][] = [
    [0, 66], [8, 71.3], [26, 71], [31.5, 69.5], [40, 66], [52, 66], [60, 63], [60, 48.5],
    [50, 46.5], [40, 47], [30, 47.5], [20, 48], [15, 49], [15, 53], [12.5, 57], [9, 58.5],
    [7, 60], [5, 63],
  ];
  // 한대 = 아이슬란드 + 스칸디나비아 산줄기 띠 + 러시아 북극해 연안(두 교과서 지도 공통 표현 —
  // 아이슬란드만 칠하던 것을 2026-07-19 감사에서 보강). 색도 바다와 헷갈리지 않게 한 단계 진하게.
  const polar: [number, number][] = [[-25, 62.8], [-25, 67], [-13, 67], [-13.5, 63]];
  const polarScand: [number, number][] = [
    [5, 60.2], [7.5, 62.5], [11, 65.2], [15, 67.6], [19, 69.4], [24, 70.8], [29, 71.3],
    [31.5, 70.3], [26, 69.6], [21, 68.6], [16, 66.8], [12, 64.3], [8.5, 61.6], [6.5, 59.6],
  ];
  const polarArctic: [number, number][] = [
    [34, 68.8], [40, 67.8], [47, 68], [54, 68.6], [60, 69.3], [60, 67.4], [53, 66.8],
    [46, 66.2], [39, 66], [33, 67.2],
  ];
  const POLAR_C = "#7E8EB4";
  const inner = `
    <g clip-path="url(#s3-lclip)">
      <path d="${polyPath(cold)}" fill="#8FA2C8" opacity=".72"/>
      <path d="${polyPath(oceanic)}" fill="#4EA84E" opacity=".72"/>
      <path d="${polyPath(med)}" fill="#E8B93C" opacity=".78"/>
      <path d="${polyPath(polar)}" fill="${POLAR_C}" opacity=".85"/>
      <path d="${polyPath(polarScand)}" fill="${POLAR_C}" opacity=".85"/>
      <path d="${polyPath(polarArctic)}" fill="${POLAR_C}" opacity=".85"/>
    </g>
    ${letterMarks(opts?.letters)}`;
  const pal: [string, string][] = [["#4EA84E", "서안 해양성"], ["#E8B93C", "지중해성"], ["#8FA2C8", "냉대"], [POLAR_C, "한대"]];
  const legend = `<g font-size="8.5" font-weight="800">
    ${pal.map(([c, n], i) => `<g transform="translate(${CROP.x + 10 + i * 62} ${CROP.y + CROP.h + 22})">
      <rect x="0" y="-8" width="10" height="10" rx="3" fill="${c}"/><text x="13" y="1" fill="#4E5968">${n}</text></g>`).join("")}
  </g>`;
  return mapShell(inner, { legend, aria: "유럽의 기후 분포 지도(러프) — 서안 해양성, 지중해성, 냉대, 한대" });
}

/* ---------- L3: 런던·로마 기후 그래프 페어(퀴즈 그림) ---------- */
// 실측 근사(월평균) — 런던: 기온 완만·강수 연중 고름 / 로마: 여름 고온·강수 급감(여름 건조).
const LONDON_T = [5, 5, 8, 11, 14, 17, 19, 19, 16, 12, 8, 6];
const LONDON_P = [55, 41, 42, 44, 49, 45, 45, 50, 49, 69, 59, 55];
const ROME_T = [8, 9, 11, 14, 18, 22, 25, 25, 21, 17, 12, 9];
const ROME_P = [67, 73, 58, 81, 65, 32, 14, 33, 68, 93, 110, 90];

export function climatePairFig(): string {
  const panel = (x0: number, name: string, temps: number[], precs: number[], tone: string): string => {
    const gx = (m: number): number => 18 + (m * 132) / 11;
    const gyT = (t: number): number => 118 - ((t + 10) / 40) * 92; // -10~30℃
    const barH = (p: number): number => Math.min(64, p * 0.5);
    const bars = precs
      .map((p, i) => `<rect x="${(gx(i) - 4).toFixed(1)}" y="${(122 - barH(p)).toFixed(1)}" width="8" height="${barH(p).toFixed(1)}" rx="1.5" fill="#7EB2E8" opacity=".85"/>`)
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
    ${panel(2, "(가)", LONDON_T, LONDON_P, "#4EA84E")}${panel(176, "(나)", ROME_T, ROME_P, "#E8A104")}
  </svg>`;
}

/* ---------- L6: 유럽연합 변천 타임라인(concept figure) ---------- */
export function euTimelineFig(): string {
  const node = (x: number, year: string, label: string, icon: string, tone: string): string => `
    <g transform="translate(${x} 0)">
      <circle cx="0" cy="64" r="6" fill="${tone}" stroke="#FFFFFF" stroke-width="2"/>
      <g transform="translate(0 30)">${icon}</g>
      <text x="0" y="86" text-anchor="middle" font-size="10.5" font-weight="900" fill="#333D4B">${year}</text>
      <text x="0" y="100" text-anchor="middle" font-size="9" font-weight="700" fill="#6B7684">${label}</text>
    </g>`;
  const coal = `<g><rect x="-13" y="-8" width="11" height="14" rx="2" fill="#5A6B7E"/><path d="M3 -6l5 3-5 3 5 3-5 3" stroke="#C2843A" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-7.5" cy="-12" r="3" fill="#3A4658"/></g>`;
  const market = `<g><path d="M-11 -4h22l-3 12h-16z" fill="#E8B93C" stroke="#B8892E" stroke-width="1.4"/><path d="M-7 -4q0-8 7-8t7 8" stroke="#B8892E" stroke-width="1.8" fill="none"/></g>`;
  const stars = `<g>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<circle cx="${(10 * Math.cos((i * Math.PI) / 6)).toFixed(1)}" cy="${(-2 + 10 * Math.sin((i * Math.PI) / 6)).toFixed(1)}" r="1.7" fill="#F2C24E"/>`).join("")}<circle cx="0" cy="-2" r="13.5" fill="none" stroke="#2E4E9E" stroke-width="2.4"/></g>`;
  const exit = `<g><rect x="-12" y="-12" width="15" height="22" rx="2" fill="#E8EEF6" stroke="#5A7896" stroke-width="1.6"/><path d="M-4 -1h14M6 -6l6 5-6 5" stroke="#C0392E" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return `<svg viewBox="0 0 344 108" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="유럽연합의 변천 — 석탄 철강 공동체에서 유럽연합, 그리고 영국의 탈퇴까지">
    <path d="M30 64H314" stroke="#C8D0DC" stroke-width="3" stroke-linecap="round"/>
    <path d="M304 64l10 0" stroke="#C8D0DC" stroke-width="3" stroke-linecap="round"/>
    ${node(52, "1952년", "석탄·철강 공동체", coal, "#5A6B7E")}
    ${node(136, "1958년~", "경제 공동체로 확대", market, "#C2933A")}
    ${node(220, "1993년", "유럽연합(EU) 출범", stars, "#2E4E9E")}
    ${node(300, "2020년", "영국, 탈퇴(브렉시트)", exit, "#C0392E")}
  </svg>`;
}

/* ---------- L6: 통합의 세 장치(개념·퀴즈 겸용) ---------- */
export function euroUnionFig(): string {
  const panel = (x: number, title: string, art: string): string => `
    <g transform="translate(${x} 0)">
      <rect x="0" y="8" width="104" height="96" rx="12" fill="#F7F9FC" stroke="#D8DEE8" stroke-width="1.2"/>
      <g transform="translate(52 48)">${art}</g>
      <text x="52" y="94" text-anchor="middle" font-size="9.5" font-weight="800" fill="#333D4B">${title}</text>
    </g>`;
  const gate = `<g>
    <rect x="-30" y="10" width="60" height="6" rx="3" fill="#C8D0DC"/>
    <rect x="-26" y="-14" width="7" height="26" rx="2" fill="#5A6B7E"/>
    <g transform="rotate(-58 -21 -12)"><rect x="-21" y="-15" width="42" height="6" rx="3" fill="#E2574C"/><rect x="-21" y="-15" width="10" height="6" rx="3" fill="#FFFFFF"/></g>
    <path d="M6 4l7-7M9 7l10-10" stroke="#2E9E5B" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="16" cy="8" r="5" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.4"/>
    <path d="M16 13v8M16 15l-4 3M16 15l4 3" stroke="#3C4654" stroke-width="1.4" fill="none"/>
  </g>`;
  const nofee = `<g>
    <rect x="-24" y="-8" width="26" height="20" rx="3" fill="#C2933A" stroke="#8A6A2E" stroke-width="1.4"/>
    <path d="M-24 -1h26M-11 -8v20" stroke="#8A6A2E" stroke-width="1.2"/>
    <path d="M8 2h18M20 -4l7 6-7 6" stroke="#2E9E5B" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(16 -14)"><circle r="8" fill="none" stroke="#C0392E" stroke-width="2"/><path d="M-5.6 -5.6L5.6 5.6" stroke="#C0392E" stroke-width="2"/><text x="0" y="3" text-anchor="middle" font-size="8" font-weight="900" fill="#C0392E">₩</text></g>
  </g>`;
  const euro = `<g>
    <circle cx="0" cy="0" r="17" fill="#F2C24E" stroke="#C2933A" stroke-width="2"/>
    <circle cx="0" cy="0" r="11.5" fill="#FFE9A8"/>
    <text x="0" y="6" text-anchor="middle" font-size="17" font-weight="900" fill="#8A6A1E">€</text>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${(14.5 * Math.cos((i * Math.PI) / 4)).toFixed(1)}" cy="${(14.5 * Math.sin((i * Math.PI) / 4)).toFixed(1)}" r="1" fill="#C2933A"/>`).join("")}
  </g>`;
  return `<svg viewBox="0 0 344 112" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="유럽 통합의 세 장치 — 자유로운 이동, 관세 없는 무역, 단일 화폐">
    ${panel(6, "국경 검문 없이 (솅겐 조약)", gate)}
    ${panel(120, "관세 없이 사고팔기", nofee)}
    ${panel(234, "화폐는 하나로 (유로)", euro)}
  </svg>`;
}

/* ---------- L7: 분리 움직임 지도(hotspot 배경·퀴즈 겸용) ---------- */
export function euroSepFig(opts?: { labels?: boolean; letters?: { lon: number; lat: number; t: string }[] }): string {
  const showLabels = opts?.labels !== false;
  const spots: { lon: number; lat: number; name: string }[] = [
    { lon: -4.2, lat: 56.8, name: "스코틀랜드" },
    { lon: 4.5, lat: 51.1, name: "플랑드르" },
    { lon: 1.6, lat: 41.8, name: "카탈루냐" },
  ];
  const marks = spots
    .map((sp) => {
      const x = lonToX(sp.lon);
      const y = latToY(sp.lat);
      return `<g>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="#E2574C" opacity=".25"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#E2574C" stroke="#FFFFFF" stroke-width="1.2"/>
        ${showLabels ? `<text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" font-size="8.5" font-weight="900" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linejoin="round">${sp.name}</text>
        <text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#8F2D1D">${sp.name}</text>` : ""}
      </g>`;
    })
    .join("");
  return mapShell(`${marks}${letterMarks(opts?.letters)}`, {
    aria: "국가 안에서 분리 움직임이 나타나는 지역들을 표시한 유럽 지도",
  });
}

/* ---------- recap 미니아트 (64×64 플랫 — soc2 문법) ---------- */
const M = (inner: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;

export function soc3MiniArt(key: string): string {
  switch (key) {
    /* ── L1 ── */
    case "eurpos": // 유라시아 서쪽 끝의 반도 대륙
      return M(
        `<circle cx="36" cy="32" r="22" fill="#4E9AE8"/>
        <path d="M40 14q16 6 14 22l-6 12q-10 8-22 4l6-10-4-8 6-12z" fill="#C8B48A"/>
        <path d="M30 22q-8 2-12 8l4 6q6 2 8-2l-2-6z" fill="#3E9E5C"/>
        <circle cx="36" cy="32" r="22" fill="none" stroke="#2E6EA8" stroke-width="2"/>
        <path d="M31 20v22" stroke="#8F5D2D" stroke-width="2" stroke-dasharray="3 3"/>`,
      );
    case "fourregions": // 네 조각 대륙
      return M(
        `<path d="M14 18q8-8 20-5l14 4q6 4 4 12l-4 12q-4 8-14 6l-14-4q-8-4-8-12z" fill="#F2ECDE" stroke="#8A93A6" stroke-width="2"/>
        <path d="M32 13v34M14 30h36" stroke="#8A93A6" stroke-width="1.6" stroke-dasharray="3 3"/>
        <circle cx="24" cy="22" r="3.6" fill="#E2574C"/><circle cx="41" cy="21" r="3.6" fill="#3F8FC8"/>
        <circle cx="24" cy="39" r="3.6" fill="#F2A72E"/><circle cx="42" cy="38" r="3.6" fill="#2E9E5B"/>
        <path d="M12 54q20 8 40 0" stroke="#4E9AE8" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "citypins": // 나라-도시 짝(핀 + 이름표)
      return M(
        `<path d="M24 6q11 0 11 11 0 9-11 21-11-12-11-21 0-11 11-11z" fill="#E8590C"/>
        <circle cx="24" cy="17" r="5" fill="#fff"/>
        <rect x="34" y="36" width="22" height="12" rx="4" fill="#FFF" stroke="#AAB4C4" stroke-width="2"/>
        <path d="M38 42h14" stroke="#8A93A6" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 54q22 8 44 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    /* ── L2 ── */
    case "twomounts": // 늙은 산 vs 젊은 산
      return M(
        `<path d="M4 46q10-18 22-16 6 2 8 8l-4 8z" fill="#A8905E"/>
        <path d="M30 46 46 14l14 32z" fill="#8FA5BE"/>
        <path d="M43 20l3-6 4 8q-4 3-7-2z" fill="#F2F7FB"/>
        <path d="M4 46h56" stroke="#5A7090" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M12 36q4-3 8-1" stroke="#8A7448" stroke-width="1.6" stroke-linecap="round"/>`,
      );
    case "plainriver": // 평원 + 하천 운하
      return M(
        `<path d="M6 40q26-10 52 0v14H6z" fill="#E8D48A"/>
        <path d="M6 30q26-8 52 0" stroke="#C8B060" stroke-width="2" stroke-linecap="round" opacity=".6"/>
        <path d="M14 54q6-18 10-22M30 54q2-16 4-22M46 54q-2-14-4-20" stroke="#4E9AE8" stroke-width="0" />
        <path d="M32 20q-6 12-4 34" stroke="#4E9AE8" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <rect x="24" y="42" width="12" height="5" rx="2" fill="#8A5A26"/>
        <path d="M12 22l4-8 4 8zM44 20l4-8 4 8z" fill="#C8A83E" opacity="0"/>`,
      );
    case "fjord": // 피오르(U자곡 + 바닷물)
      return M(
        `<path d="M6 12v40h52V12L42 40q-10 8-20 0z" fill="#8FA5BE"/>
        <path d="M22 40q10 8 20 0v12H22z" fill="#4E9AE8"/>
        <path d="M10 16l10 22M54 16 44 38" stroke="#5A7090" stroke-width="2" stroke-linecap="round"/>
        <path d="M28 48q4 2 8 0" stroke="#8ED2F5" stroke-width="2" stroke-linecap="round"/>`,
      );
    /* ── L3 ── */
    case "warmwind": // 난류 + 편서풍(서안 해양성)
      return M(
        `<path d="M8 50q16 4 26-6t20-8" stroke="#FF8A4E" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M6 24q10-4 18 0t18 0" stroke="#8ED2F5" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M42 24l8-2-4 7z" fill="#8ED2F5"/>
        <circle cx="52" cy="14" r="6" fill="#FFC24D"/>`,
      );
    case "olivesun": // 지중해성 — 올리브와 태양
      return M(
        `<circle cx="46" cy="16" r="8" fill="#FFC24D"/>
        <path d="M46 4v-2M56 8l2-2M58 18h3" stroke="#E8A104" stroke-width="2" stroke-linecap="round"/>
        <path d="M24 54q-4-16 2-28" stroke="#8A6A3E" stroke-width="3" stroke-linecap="round"/>
        <path d="M26 28q-8-2-10-9 8-1 10 9zM28 24q2-9 10-10 0 8-10 10z" fill="#7A9E4E"/>
        <ellipse cx="20" cy="34" rx="3" ry="4" fill="#4E6E2E"/><ellipse cx="32" cy="31" rx="3" ry="4" fill="#4E6E2E"/>
        <path d="M8 56h48" stroke="#C8A468" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "taiga": // 냉대 — 침엽수 + 눈
      return M(
        `<path d="M20 44l8-14 8 14zM16 54l12-18 12 18z" fill="#3E7E4E"/>
        <rect x="26" y="54" width="4" height="6" fill="#8A5A26"/>
        <path d="M44 18v8M40 22h8M41.2 19.2l5.6 5.6M46.8 19.2l-5.6 5.6" stroke="#8ED2F5" stroke-width="2" stroke-linecap="round"/>
        <circle cx="14" cy="16" r="1.4" fill="#B8D8F2"/><circle cx="52" cy="38" r="1.4" fill="#B8D8F2"/><circle cx="8" cy="30" r="1.2" fill="#B8D8F2"/>`,
      );
    /* ── L4 ── */
    case "citycards": // 도시 명함 네 장
      return M(
        `<rect x="8" y="10" width="22" height="15" rx="3" fill="#FFF" stroke="#4E7CB8" stroke-width="2"/>
        <rect x="34" y="10" width="22" height="15" rx="3" fill="#FFF" stroke="#C2933A" stroke-width="2"/>
        <rect x="8" y="30" width="22" height="15" rx="3" fill="#FFF" stroke="#2E9E5B" stroke-width="2"/>
        <rect x="34" y="30" width="22" height="15" rx="3" fill="#FFF" stroke="#8A5AC2" stroke-width="2"/>
        <circle cx="15" cy="17" r="3" fill="#F2C24E"/><path d="M39 21l4-7 4 7z" fill="#C8B48A"/>
        <path d="M14 40q3-5 6 0" stroke="#2E9E5B" stroke-width="2" fill="none"/><circle cx="45" cy="37" r="2.6" fill="#8A5AC2"/>
        <path d="M12 52q20 6 40 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "worldlondon": // 세계 도시(지구 + 빌딩)
      return M(
        `<circle cx="22" cy="26" r="14" fill="#4E9AE8" opacity=".9"/>
        <path d="M14 20q8-4 16 0M14 32q8 4 16 0M22 12v28M10 26h24" stroke="#D9EDF8" stroke-width="1.6" fill="none"/>
        <rect x="40" y="18" width="8" height="30" fill="#3E5478"/><rect x="50" y="26" width="7" height="22" fill="#56709A"/>
        <rect x="42" y="22" width="3" height="3" fill="#FFE9B8"/><rect x="52" y="30" width="2.6" height="2.6" fill="#FFE9B8"/>
        <path d="M8 52q24 8 48 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "cityturn": // 도시의 변신(공장 → 미술관/새 기능)
      return M(
        `<path d="M8 40V26l6 5v-5l6 5v-5h6v14z" fill="#8A93A6"/>
        <rect x="10" y="16" width="4" height="9" fill="#6E7A8E"/>
        <path d="M34 30q4-10 14-10t12 10" stroke="#E8590C" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M46 16l6-2-2 6z" fill="#E8590C"/>
        <path d="M36 40q6-8 12-2t10-2v10H36z" fill="#F2C24E"/>
        <path d="M8 52q24 6 50 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    /* ── L5 ── */
    case "balance": // 환경·경제·사회의 조화(세 고리)
      return M(
        `<circle cx="24" cy="24" r="12" fill="none" stroke="#2E9E5B" stroke-width="3.4"/>
        <circle cx="40" cy="24" r="12" fill="none" stroke="#4E7CB8" stroke-width="3.4"/>
        <circle cx="32" cy="38" r="12" fill="none" stroke="#E8A104" stroke-width="3.4"/>
        <circle cx="32" cy="29" r="3" fill="#333D4B"/>`,
      );
    case "netzero": // 탄소중립(배출 = 흡수)
      return M(
        `<path d="M14 40V22l5 4v-4l5 4v-4h4v18z" fill="#8A93A6"/>
        <path d="M18 16q2-4 5-2" stroke="#B8C2D2" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M44 40q-8-2-8-10 0-10 10-12 2 10-2 22z" fill="#4E9E5A"/>
        <path d="M44 40q2-10 6-14" stroke="#2E6E3A" stroke-width="2" stroke-linecap="round"/>
        <path d="M26 50h12M32 44v12" stroke="#333D4B" stroke-width="0"/>
        <path d="M24 52h16" stroke="#333D4B" stroke-width="3" stroke-linecap="round"/>
        <path d="M28 47l4 5 4-5" stroke="#333D4B" stroke-width="0"/>`,
      );
    case "greenacts": // 노력들(태양광 + 자전거 + 나무)
      return M(
        `<rect x="8" y="14" width="16" height="11" rx="2" fill="#2E4E7E" transform="rotate(-14 16 20)"/>
        <path d="M9 18l14-4M12 24l12-3.4" stroke="#5A7CB0" stroke-width="1.2"/>
        <circle cx="44" cy="20" r="9" fill="#4E9E5A"/><rect x="42.6" y="27" width="2.8" height="8" fill="#8A5A26"/>
        <circle cx="20" cy="46" r="7" stroke="#4E7CB8" stroke-width="2.6" fill="none"/><circle cx="40" cy="46" r="7" stroke="#4E7CB8" stroke-width="2.6" fill="none"/>
        <path d="M20 46l7-11h7l6 11M27 35l-3 11" stroke="#4E7CB8" stroke-width="2.2" fill="none"/>`,
      );
    /* ── L6 ── */
    case "unionring": // 별 12개의 원
      return M(
        `<circle cx="32" cy="32" r="20" fill="#2E4E9E"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<circle cx="${(32 + 13 * Math.cos((i * Math.PI) / 6)).toFixed(1)}" cy="${(32 + 13 * Math.sin((i * Math.PI) / 6)).toFixed(1)}" r="2" fill="#F2C24E"/>`).join("")}
        <circle cx="32" cy="32" r="20" fill="none" stroke="#1E3670" stroke-width="2"/>`,
      );
    case "freepass": // 자유 이동(열린 차단기)
      return M(
        `<rect x="8" y="44" width="48" height="5" rx="2.5" fill="#C8D0DC"/>
        <rect x="12" y="20" width="6" height="24" rx="2" fill="#5A6B7E"/>
        <g transform="rotate(-56 18 22)"><rect x="18" y="19" width="34" height="6" rx="3" fill="#E2574C"/><rect x="18" y="19" width="9" height="6" rx="3" fill="#FFF"/></g>
        <circle cx="40" cy="34" r="5" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.6"/>
        <path d="M40 39v9M40 41l-5 3M40 41l5 3M40 48l-4 8M40 48l4 8" stroke="#3C4654" stroke-width="1.6" fill="none"/>
        <path d="M50 28l6-6M52 34l8-8" stroke="#2E9E5B" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "gapcoin": // 통합의 그늘(기울어진 동전 저울)
      return M(
        `<path d="M32 12v10" stroke="#5A6B7E" stroke-width="2.6"/>
        <path d="M14 22h36" stroke="#5A6B7E" stroke-width="0"/>
        <path d="M12 26 52 18" stroke="#5A6B7E" stroke-width="3" stroke-linecap="round"/>
        <path d="M12 26v4q0 6 7 6t7-6v-4z" fill="#C8D0DC"/><path d="M52 18v4q0 6-7 6t-7-6v-4z" fill="#C8D0DC"/>
        <circle cx="19" cy="24" r="4" fill="#F2C24E" stroke="#C2933A" stroke-width="1.4"/>
        <circle cx="45" cy="15" r="3" fill="#F2C24E" stroke="#C2933A" stroke-width="1.2" opacity=".55"/>
        <rect x="28" y="46" width="8" height="10" rx="2" fill="#5A6B7E"/>`,
      );
    /* ── L7 ── */
    case "exitdoor": // 두 갈래(원 안·밖)
      return M(
        `<circle cx="26" cy="32" r="18" fill="none" stroke="#2E4E9E" stroke-width="3" stroke-dasharray="6 5"/>
        <circle cx="22" cy="28" r="4" fill="#4E7CB8"/><circle cx="32" cy="38" r="4" fill="#4E7CB8"/><circle cx="20" cy="40" r="4" fill="#4E7CB8"/>
        <circle cx="48" cy="26" r="4.6" fill="#E2574C"/>
        <path d="M40 30q4-2 6-3" stroke="#E2574C" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "langgap": // 분리 요인(말풍선 둘 + 동전 격차)
      return M(
        `<path d="M8 14h20v13H16l-5 5v-5H8z" fill="#FFF" stroke="#4E7CB8" stroke-width="2.2"/>
        <path d="M36 14h20v13h-3v5l-5-5H36z" fill="#FFF" stroke="#E2574C" stroke-width="2.2"/>
        <path d="M13 20h10M41 20h10" stroke="#AAB4C4" stroke-width="2" stroke-linecap="round"/>
        <circle cx="20" cy="46" r="6" fill="#F2C24E" stroke="#C2933A" stroke-width="1.6"/>
        <circle cx="42" cy="48" r="3.6" fill="#F2C24E" stroke="#C2933A" stroke-width="1.3"/>`,
      );
    case "bridgehand": // 잇는 손(공존)
      return M(
        `<path d="M6 36q10-14 22-6M58 36q-10-14-22-6" stroke="#8A93A6" stroke-width="0"/>
        <path d="M10 30q8 8 18 4M54 30q-8 8-18 4" stroke="#8A93A6" stroke-width="0"/>
        <path d="M8 34q10-10 20-4l4 2q10 6 20-2" stroke="#C8D0DC" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M22 34q4-6 10-3t10-1" stroke="#E8590C" stroke-width="0"/>
        <path d="M18 38q6 6 14 2M46 38q-6 6-14 2" stroke="#4E7CB8" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="32" cy="36" r="4" fill="#E8590C"/>
        <path d="M12 52q20 6 40 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="12" fill="#E8590C"/>`);
  }
}
