// socFigures — 사회 Ⅰ 단원 그림 모듈: 기후 지도(실데이터)·퀴즈 SVG·figTabs 아트·recap 미니아트.
// 지도는 ui/worldMap.generated.ts(Natural Earth+쾨펜)를 재사용 — 손으로 대륙을 그리지 않는다.
// 파운드리 문법(그라데이션·키라이트·접촉 그림자) 준수, 라벨은 한글 SVG 텍스트(발주 아님).
import { WORLD_LAND_PATH } from "./worldMap.generated";

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

const CLIM_PAL: Record<number, string> = {
  1: "#1E9E50", 2: "#E8B93C", 3: "#A5D65C", 4: "#3FA7C8", 5: "#8E9EC8", 6: "#B0672A",
};
const CLIM_NAME: Record<number, string> = {
  1: "열대", 2: "건조", 3: "온대", 4: "냉대", 5: "한대", 6: "고산",
};

/** 경도·위도 → 지도 svg 좌표(viewBox 0 14 1000 400 기준) */
const mx = (lon: number): number => ((lon + 180) / 360) * 1000;
const my = (lat: number): number => ((90 - lat) / 180) * 500;

/**
 * 세계 기후 지도(실데이터) — 퀴즈 figure·hotspot 공용.
 * opts.letters: 지도 위 라벨 마커(㉠㉡… 또는 A·B), opts.legend: 범례 표시(기본 true).
 */
export function climateMapFig(opts?: {
  letters?: { lon: number; lat: number; t: string }[];
  legend?: boolean;
}): string {
  const legend = opts?.legend !== false;
  // 텍스트 격상판(2026-07-20 갤러리 검수): 뷰박스 1000은 폰에서 ~0.34배 — 범례 12.5·마크 17은
  // 실표시 4~6px라 실격. 범례 30(" 기후" 접미 생략)·적도 24·㉠ 마크 r30/30으로 소급, 지도층은
  // 지도 사각으로 클립해 남극 실루엣이 범례 존에 배어들던 겹침을 제거.
  const marks = (opts?.letters ?? [])
    .map(
      (m) => `<g>
        <circle cx="${mx(m.lon).toFixed(1)}" cy="${my(m.lat).toFixed(1)}" r="30" fill="#FFFFFF" stroke="#333D4B" stroke-width="3.4"/>
        <text x="${mx(m.lon).toFixed(1)}" y="${(my(m.lat) + 10).toFixed(1)}" text-anchor="middle" font-size="30" font-weight="900" fill="#333D4B">${m.t}</text>
      </g>`,
    )
    .join("");
  const legendRow = legend
    ? `<g font-size="30" font-weight="800">
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (c, i) => `<g transform="translate(${110 + i * 136} 447)">
              <rect x="0" y="-23" width="26" height="26" rx="6" fill="${CLIM_PAL[c]}"/>
              <text x="34" y="0" fill="#4E5968">${CLIM_NAME[c]}</text>
            </g>`,
          )
          .join("")}
      </g>`
    : "";
  return `<svg viewBox="0 14 1000 ${legend ? 452 : 400}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="세계의 기후 구분 지도">
    <defs>
      <clipPath id="soc-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <clipPath id="soc-mapclip"><rect x="0" y="14" width="1000" height="400" rx="12"/></clipPath>
    </defs>
    <rect x="0" y="14" width="1000" height="400" rx="12" fill="#D6EAF6"/>
    <g clip-path="url(#soc-mapclip)">
      <line x1="0" y1="250" x2="1000" y2="250" stroke="#7FA8C8" stroke-width="1"/>
      <line x1="0" y1="184.7" x2="1000" y2="184.7" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="6 6" opacity=".6"/>
      <line x1="0" y1="315.3" x2="1000" y2="315.3" stroke="#7FA8C8" stroke-width="1" stroke-dasharray="6 6" opacity=".6"/>
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      <image href="${BASE}soc/climate.webp" x="0" y="0" width="1000" height="500" preserveAspectRatio="none" clip-path="url(#soc-lclip)" opacity=".92"/>
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.45)" stroke-width=".8" fill="none" fill-rule="evenodd"/>
    </g>
    <text x="10" y="242" font-size="24" font-weight="700" fill="#5A7A96" stroke="#D6EAF6" stroke-width="6" paint-order="stroke">적도</text>
    ${marks}
    ${legendRow}
  </svg>`;
}

/** 지형 3종 파노라마 — 산지·평야·해안이 한 화면에(L1 개념) */
export function terrainFig(): string {
  return `<svg viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="산지, 평야, 해안이 함께 보이는 지형 그림">
    <defs>
      <linearGradient id="soc-tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE7F8"/><stop offset="1" stop-color="#EAF5FB"/></linearGradient>
      <linearGradient id="soc-mount" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9AB2C8"/><stop offset=".6" stop-color="#6E8AA6"/><stop offset="1" stop-color="#54708C"/></linearGradient>
      <linearGradient id="soc-plain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8DC7E"/><stop offset="1" stop-color="#8FBE56"/></linearGradient>
      <linearGradient id="soc-sea2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC4EC"/><stop offset="1" stop-color="#4394CC"/></linearGradient>
    </defs>
    <rect width="360" height="190" rx="14" fill="url(#soc-tsky)"/>
    <path d="M-4 120 L54 34 84 76 120 22 168 96 196 66 240 120z" fill="url(#soc-mount)"/>
    <path d="M114 34 120 22 128 36q-7 5-14-2z" fill="#F2F7FB"/>
    <path d="M48 44 54 34 61 46q-6 4-13-2z" fill="#F2F7FB"/>
    <path d="M-4 120h248l60 8v62H-4z" fill="url(#soc-plain)"/>
    <path d="M20 138h44M84 150h52M30 166h60M150 142h56M120 164h44" stroke="#6E9A3E" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <path d="M244 128q30 10 40 62h76v-62q-56-22-116 0z" fill="url(#soc-sea2)"/>
    <path d="M268 146q10-4 20 0M292 160q10-4 20 0M310 142q8-3 16 0" stroke="#DCF2FF" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
    <path d="M300 122l10-14 10 14z" fill="#F2F4F8" stroke="#8A93A6" stroke-width="1.4"/>
    <path d="M310 108v-8" stroke="#8A93A6" stroke-width="2"/>
    <path d="M306 104q4-3 8 0" stroke="#E23B4B" stroke-width="2.4"/>
    <text x="60" y="106" text-anchor="middle" font-size="13" font-weight="900" fill="#2E4258">산지</text>
    <text x="130" y="152" text-anchor="middle" font-size="13" font-weight="900" fill="#3E5E1E">평야</text>
    <text x="316" y="182" text-anchor="middle" font-size="13" font-weight="900" fill="#0E4E7E">해안</text>
  </svg>`;
}

/** 몽골 초원의 게르 — L2 퀴즈(이동식 집의 까닭) */
export function gerFig(): string {
  return `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="넓은 초원 위 이동식 천막집과 말">
    <defs>
      <linearGradient id="soc-gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4E2F5"/><stop offset="1" stop-color="#EDF6FA"/></linearGradient>
      <linearGradient id="soc-steppe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2DC8A"/><stop offset="1" stop-color="#96BC5E"/></linearGradient>
      <linearGradient id="soc-gerw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F0EDE4"/><stop offset="1" stop-color="#D8D2C2"/></linearGradient>
    </defs>
    <rect width="360" height="200" rx="14" fill="url(#soc-gsky)"/>
    <rect y="118" width="360" height="82" fill="url(#soc-steppe)"/>
    <ellipse cx="150" cy="164" rx="72" ry="8" fill="#2A3A5E" opacity=".12"/>
    <path d="M92 128 150 96l58 32z" fill="#E8DFC8" stroke="#B0A488" stroke-width="1.6"/>
    <path d="M96 128h108v34q-54 10-108 0z" fill="url(#soc-gerw)" stroke="#B0A488" stroke-width="1.6"/>
    <path d="M110 128v32M130 128v34M150 128v35M170 128v34M190 128v32" stroke="#C8BFA8" stroke-width="1.4"/>
    <rect x="138" y="132" width="24" height="30" rx="3" fill="#A85A28"/>
    <path d="M150 96v-10M146 90h8" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>
    <g stroke="#5A4326" stroke-width="2.4" fill="none">
      <path d="M258 138q10-10 24-6 8-14 20-6 6-10-2-14" stroke="none"/>
      <ellipse cx="276" cy="146" rx="17" ry="10" fill="#8A5A3E" stroke="none"/>
      <path d="M262 140q-8-4-8-14M262 128q-4-6 2-8M294 146q6 2 6 10M266 154v12M286 154v12" stroke="#6E4630"/>
      <circle cx="256" cy="126" r="6" fill="#8A5A3E" stroke="none"/>
      <path d="M252 120q-2-6 4-6" stroke="#6E4630"/>
    </g>
    <path d="M28 150q8-4 16 0M52 168q8-4 16 0M300 172q8-4 16 0M226 158q8-4 16 0" stroke="#7A9E46" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="300" cy="42" r="13" fill="#FFC24D"/><circle cx="300" cy="42" r="19" fill="#FFC24D" opacity=".22"/>
  </svg>`;
}

/** 청바지 한 벌의 세계 — L5 hotspot 배경(부위별 원산지) */
export function jeansFig(): string {
  return `<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="청바지 한 벌 — 부위마다 다른 나라에서 온 재료">
    <defs>
      <linearGradient id="soc-denim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E86C0"/><stop offset=".55" stop-color="#3E62A0"/><stop offset="1" stop-color="#2C4A80"/></linearGradient>
      <linearGradient id="soc-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF7EE"/><stop offset="1" stop-color="#EEE6D4"/></linearGradient>
    </defs>
    <rect width="360" height="300" rx="14" fill="url(#soc-board)"/>
    <ellipse cx="180" cy="278" rx="86" ry="9" fill="#2A3A5E" opacity=".1"/>
    <path d="M120 44h120l14 118-44 108h-26l-4-96-4 96h-26l-44-108z" fill="url(#soc-denim)" stroke="#1E3660" stroke-width="2"/>
    <path d="M120 74q60 14 120 0" stroke="#F2C879" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="M132 82q14 22 34 24M228 82q-14 22-34 24" stroke="#F2C879" stroke-width="2" stroke-dasharray="5 4"/>
    <rect x="172" y="44" width="16" height="26" rx="3" fill="#2C4A80" stroke="#F2C879" stroke-width="1.6"/>
    <circle cx="180" cy="58" r="6.5" fill="#E8C48A" stroke="#8A6A3E" stroke-width="1.6"/>
    <path d="M180 118q-3 44 0 96" stroke="#24406E" stroke-width="2.6"/>
  </svg>`;
}

/** figTabs — 피자의 세계 여행 3장면(L5 문화의 세계화) */
export function pizzaItalyFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="soc-pzsky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5E2C8"/><stop offset="1" stop-color="#FBF2E2"/></linearGradient>
    <radialGradient id="soc-dough" cx=".4" cy=".35" r="1"><stop offset="0" stop-color="#F5D9A0"/><stop offset="1" stop-color="#D8A85C"/></radialGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#soc-pzsky1)"/>
    <path d="M226 130V64l30-18 30 18v66z" fill="#E8DCC4" stroke="#B8A480" stroke-width="1.6"/>
    <path d="M242 130V96h28v34" fill="#8A5A26"/>
    <path d="M226 64l30-18 30 18" fill="none" stroke="#A85A28" stroke-width="4"/>
    <ellipse cx="120" cy="128" rx="66" ry="9" fill="#2A3A5E" opacity=".12"/>
    <circle cx="120" cy="106" r="52" fill="url(#soc-dough)" stroke="#B0803A" stroke-width="2.4"/>
    <circle cx="120" cy="106" r="41" fill="#D8443C"/>
    <circle cx="104" cy="94" r="9" fill="#FFF6E8"/><circle cx="136" cy="100" r="9" fill="#FFF6E8"/><circle cx="118" cy="122" r="9" fill="#FFF6E8"/>
    <path d="M100 116q4-5 9-2M138 84q4-5 9-2M128 128q4-5 9-2" stroke="#2E8A4C" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="100" cy="76" rx="12" ry="5" fill="#fff" opacity=".35" transform="rotate(-22 100 76)"/>
    <text x="160" y="176" text-anchor="middle" font-size="13" font-weight="900" fill="#7A5A28">이탈리아 나폴리 — 화덕에서 태어나다</text>
  </svg>`;
}

export function pizzaUsaFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="soc-pzsky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8D8F0"/><stop offset="1" stop-color="#E8EFF9"/></linearGradient>
    <linearGradient id="soc-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5EDD8"/><stop offset="1" stop-color="#D8C8A0"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#soc-pzsky2)"/>
    <path d="M228 132V52h20v-14h12v14h20v80z" fill="#8A99B2"/>
    <path d="M234 60h10v10h-10zM252 60h10v10h-10zM234 80h10v10h-10zM252 80h10v10h-10zM234 100h10v10h-10zM252 100h10v10h-10z" fill="#F2E8B0"/>
    <ellipse cx="116" cy="140" rx="76" ry="9" fill="#2A3A5E" opacity=".12"/>
    <path d="M48 128l68-96 68 96q-68 22-136 0z" fill="url(#soc-box)" stroke="#A88A50" stroke-width="2"/>
    <path d="M62 122l54-76 54 76q-54 16-108 0z" fill="#E8B93C"/>
    <circle cx="106" cy="92" r="7" fill="#C24A3E"/><circle cx="130" cy="76" r="7" fill="#C24A3E"/><circle cx="120" cy="112" r="7" fill="#C24A3E"/><circle cx="98" cy="118" r="6" fill="#C24A3E"/><circle cx="140" cy="104" r="6" fill="#C24A3E"/>
    <path d="M48 128q68 22 136 0" stroke="#B0803A" stroke-width="3"/>
    <text x="160" y="176" text-anchor="middle" font-size="13" font-weight="900" fill="#3E5170">미국 — 커지고 푸짐해지다</text>
  </svg>`;
}

export function pizzaWorldFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><radialGradient id="soc-pzglobe" cx=".38" cy=".3" r="1"><stop offset="0" stop-color="#9CD2FF"/><stop offset=".6" stop-color="#4E9AE8"/><stop offset="1" stop-color="#2B6CC0"/></radialGradient></defs>
    <rect width="320" height="190" rx="14" fill="#10203A"/>
    <circle cx="160" cy="98" r="58" fill="url(#soc-pzglobe)"/>
    <path d="M128 78q12-12 26-6 6 8-4 12-16 2-22-6zM176 66q14-4 22 6-4 10-14 8-10-4-8-14zM148 118q14-6 22 2 4 10-8 12-14 0-14-14z" fill="#3E9E5C"/>
    <g class="soc-orbit">
      <circle cx="160" cy="98" r="82" stroke="#F2C879" stroke-width="1.6" stroke-dasharray="4 7" fill="none"/>
      <g transform="translate(238 62)"><circle r="13" fill="#E8B93C" stroke="#B0803A" stroke-width="1.6"/><circle cx="-3" cy="-3" r="2.4" fill="#C24A3E"/><circle cx="4" cy="2" r="2.4" fill="#C24A3E"/><circle cx="-2" cy="5" r="2" fill="#FFF6E8"/></g>
      <g transform="translate(82 134)"><circle r="13" fill="#E8B93C" stroke="#B0803A" stroke-width="1.6"/><path d="M-5-2q5-5 10 0M-4 4q4 3 8 0" stroke="#8A3E2E" stroke-width="2.2" fill="none"/></g>
      <g transform="translate(96 40)"><circle r="13" fill="#E8B93C" stroke="#B0803A" stroke-width="1.6"/><path d="M-5 2h10M0-4v10" stroke="#2E8A4C" stroke-width="2.4"/></g>
    </g>
    <text x="160" y="176" text-anchor="middle" font-size="13" font-weight="900" fill="#DCE6FA">세계 어디서나 — 그 지역의 맛으로 변신</text>
  </svg>`;
}

/** figTabs — 세계를 바꾼 세 도시(L6 지역화) */
export function cityCuritibaFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="soc-ct1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4E8D2"/><stop offset="1" stop-color="#EAF7EE"/></linearGradient>
    <linearGradient id="soc-bus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F26A5E"/><stop offset="1" stop-color="#C23A32"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#soc-ct1)"/>
    <path d="M20 60h34v70H20zM66 44h30v86H66zM250 52h36v78h-36z" fill="#A8BCC8"/>
    <path d="M26 68h8v8h-8zM40 68h8v8h-8zM72 52h8v8h-8zM86 52h8v8h-8zM72 70h8v8h-8zM258 60h8v8h-8zM272 60h8v8h-8z" fill="#E8F2F8"/>
    <rect y="130" width="320" height="60" fill="#8A99A6"/>
    <rect y="138" width="320" height="26" fill="#C0392E" opacity=".25"/>
    <path d="M0 151h320" stroke="#fff" stroke-width="2.4" stroke-dasharray="14 12"/>
    <ellipse cx="160" cy="166" rx="90" ry="7" fill="#2A3A5E" opacity=".18"/>
    <g>
      <rect x="76" y="120" width="76" height="38" rx="8" fill="url(#soc-bus)" stroke="#8F1D1D" stroke-width="1.6"/>
      <path d="M152 128q10-2 14 6v24h-14z" fill="url(#soc-bus)" stroke="#8F1D1D" stroke-width="1.6"/>
      <rect x="84" y="128" width="14" height="12" rx="2" fill="#DCF2FF"/><rect x="104" y="128" width="14" height="12" rx="2" fill="#DCF2FF"/><rect x="124" y="128" width="14" height="12" rx="2" fill="#DCF2FF"/>
      <circle cx="96" cy="160" r="7" fill="#3A4658"/><circle cx="140" cy="160" r="7" fill="#3A4658"/>
      <circle cx="158" cy="160" r="7" fill="#3A4658"/>
      <ellipse cx="92" cy="124" rx="9" ry="3" fill="#fff" opacity=".4"/>
    </g>
    <path d="M196 132q4-16 18-18M214 114q-2 12 8 18" stroke="#2E8A4C" stroke-width="3" stroke-linecap="round"/>
    <text x="160" y="26" text-anchor="middle" font-size="13" font-weight="900" fill="#1E5E38">브라질 쿠리치바 — 버스가 바꾼 도시</text>
  </svg>`;
}

export function cityGarstangFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="soc-gt1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2E0F0"/><stop offset="1" stop-color="#EDF3FA"/></linearGradient>
    <linearGradient id="soc-choc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A5A3E"/><stop offset="1" stop-color="#5A3826"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#soc-gt1)"/>
    <path d="M36 120V70q0-8 8-8h40q8 0 8 8v50z" fill="#D8C8B0" stroke="#A8967A" stroke-width="1.6"/>
    <path d="M30 70l34-26 34 26" fill="none" stroke="#8A6A4E" stroke-width="4"/>
    <rect x="54" y="92" width="20" height="28" fill="#6E4630"/>
    <rect y="120" width="320" height="70" fill="#B8CCA0"/>
    <ellipse cx="200" cy="150" rx="80" ry="8" fill="#2A3A5E" opacity=".12"/>
    <g transform="translate(150 84)">
      <rect x="0" y="0" width="100" height="56" rx="8" fill="url(#soc-choc)" stroke="#3E2416" stroke-width="1.6"/>
      <path d="M25 0v56M50 0v56M75 0v56M0 28h100" stroke="#3E2416" stroke-width="1.6" opacity=".6"/>
      <ellipse cx="16" cy="8" rx="8" ry="3" fill="#fff" opacity=".25" transform="rotate(-18 16 8)"/>
    </g>
    <g transform="translate(258 60)">
      <circle r="22" fill="#4E9AE8" opacity=".92"/>
      <path d="M-8 2q8-12 16-2M-6 6q7 7 13 0" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M0-22v-8M-4-26h8" stroke="#2E6EA8" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <text x="160" y="26" text-anchor="middle" font-size="13" font-weight="900" fill="#2E4A78">영국 가스탕 — 세계 최초 공정 무역 마을</text>
    <text x="160" y="176" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">정당한 값을 치른 초콜릿·차만 팔기로 온 마을이 약속했어요</text>
  </svg>`;
}

export function cityBolognaFig(): string {
  return `<svg viewBox="0 0 320 190" fill="none" aria-hidden="true">
    <defs><linearGradient id="soc-bl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5DCC8"/><stop offset="1" stop-color="#FBF0E4"/></linearGradient></defs>
    <rect width="320" height="190" rx="14" fill="url(#soc-bl1)"/>
    <path d="M28 132V66h40v66zM84 132V50h34v82zM250 132V72h42v60z" fill="#D8935E" stroke="#A85A28" stroke-width="1.6"/>
    <path d="M36 76h8v10h-8zM52 76h8v10h-8zM92 60h8v10h-8zM106 60h8v10h-8zM92 82h8v10h-8zM258 82h10v10h-10zM274 82h10v10h-10z" fill="#FBF0E4"/>
    <rect y="132" width="320" height="58" fill="#C8A87A"/>
    <ellipse cx="176" cy="156" rx="86" ry="8" fill="#2A3A5E" opacity=".14"/>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="146" cy="112" r="7" fill="#FFE8CE"/><path d="M146 119v13M146 124l-8 4M146 132l-6 10M146 132l6 10"/>
      <circle cx="176" cy="108" r="7" fill="#FFE8CE"/><path d="M176 115v14M176 121l-8 3M176 121l8 3M176 129l-6 11M176 129l6 11"/>
      <circle cx="206" cy="112" r="7" fill="#FFE8CE"/><path d="M206 119v13M206 124l8 4M206 132l-6 10M206 132l6 10"/>
      <path d="M146 124q15 10 30-3M176 121q15 9 30 3" stroke="#E8590C" stroke-width="2.6"/>
    </g>
    <circle cx="176" cy="86" r="12" fill="#E8590C" opacity=".16"/>
    <path d="M170 86q6-7 12 0-6 8-12 0z" fill="#E8590C"/>
    <text x="160" y="26" text-anchor="middle" font-size="13" font-weight="900" fill="#8A4A1E">이탈리아 볼로냐 — 손잡고 만든 협동조합 도시</text>
  </svg>`;
}

/* ---------- recap 미니아트(64×64 플랫) ---------- */
const M = (inner: string, defs = ""): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

export function socMiniArt(key: string): string {
  switch (key) {
    case "latsun": // 위도에 따라 비스듬해지는 햇빛
      return M(
        `<circle cx="14" cy="14" r="8" fill="#FFC24D"/><circle cx="14" cy="14" r="12" fill="#FFC24D" opacity=".25"/>
        <path d="M24 18l22 10M26 12l24 4M22 24l18 16" stroke="#F2A72E" stroke-width="3" stroke-linecap="round"/>
        <path d="M52 22a34 34 0 0 1-14 34" stroke="#4E9AE8" stroke-width="4" stroke-linecap="round"/>
        <path d="M40 52q6 2 10 6" stroke="#2E6EA8" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "climate6": // 여섯 기후 색 칩
      return M(
        `<rect x="8" y="10" width="22" height="14" rx="4" fill="#1E9E50"/><rect x="34" y="10" width="22" height="14" rx="4" fill="#E8B93C"/>
        <rect x="8" y="26" width="22" height="14" rx="4" fill="#A5D65C"/><rect x="34" y="26" width="22" height="14" rx="4" fill="#3FA7C8"/>
        <rect x="8" y="42" width="22" height="14" rx="4" fill="#8E9EC8"/><rect x="34" y="42" width="22" height="14" rx="4" fill="#B0672A"/>`,
      );
    case "terrain":
      return M(
        `<path d="M6 40 20 18l10 14 8-10 12 18z" fill="#6E8AA6"/>
        <path d="M6 40h44v8H6z" fill="#8FBE56"/>
        <path d="M40 48q10-2 18 4v6H6v-2q20-8 34-8z" fill="#4394CC"/>
        <path d="M20 18l3 5-6 0z" fill="#F2F7FB"/>`,
      );
    case "lifehouse": // 고상 가옥
      return M(
        `<path d="M14 28 32 16l18 12z" fill="#C2843A"/>
        <rect x="20" y="28" width="24" height="12" rx="2" fill="#E8C48A"/>
        <path d="M24 40v12M40 40v12M32 40v10" stroke="#8A6A3E" stroke-width="3" stroke-linecap="round"/>
        <path d="M14 56q9-4 18 0 9-4 18 0" stroke="#5BB8E8" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "lifeclothes": // 사막의 헐렁한 옷
      return M(
        `<circle cx="32" cy="14" r="7" fill="#FFE8CE" stroke="#3C4654" stroke-width="2"/>
        <path d="M20 24h24l4 28H16z" fill="#F2F4F8" stroke="#AAB4C4" stroke-width="2"/>
        <path d="M20 24q12 8 24 0" stroke="#AAB4C4" stroke-width="2"/>
        <circle cx="50" cy="12" r="6" fill="#FFC24D"/><circle cx="50" cy="12" r="9" fill="#FFC24D" opacity=".3"/>`,
      );
    case "citizen": // 지구를 감싸는 두 손
      return M(
        `<circle cx="32" cy="28" r="14" fill="#4E9AE8"/><path d="M24 22q6-5 12-1-4 6-10 4z M34 32q6-2 8 3-5 4-9 0z" fill="#3E9E5C"/>
        <path d="M12 44q10 10 20 10t20-10" stroke="#E8590C" stroke-width="4" stroke-linecap="round"/>
        <path d="M12 44v-6M52 44v-6" stroke="#E8590C" stroke-width="4" stroke-linecap="round"/>`,
      );
    case "transport": // 배와 비행기
      return M(
        `<path d="M8 46h34l-6 8H14z" fill="#4E7CB8"/><path d="M24 46V30l12 16z" fill="#F2F4F8" stroke="#8A93A6" stroke-width="1.6"/>
        <path d="M34 18l16-8 4 4-10 10q-8 2-10-6z" fill="#E8EEF6" stroke="#7A8698" stroke-width="1.6"/>
        <path d="M40 24q6 4 12 2" stroke="#C4CFDC" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "telecom": // 전파 신호
      return M(
        `<rect x="24" y="26" width="16" height="28" rx="4" fill="#3A4658"/>
        <rect x="27" y="30" width="10" height="17" rx="2" fill="#8ED2F5"/>
        <path d="M18 22q14-12 28 0M23 15q9-8 18 0" stroke="#4E9AE8" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      );
    case "promise": // 연결의 약속(맞잡은 손)
      return M(
        `<path d="M10 34q10-12 22-2l6 6q4 4-1 8l-9 7q-10 6-18-9z" fill="#F5C89A"/>
        <path d="M54 34q-10-12-22-2" stroke="#E8A16A" stroke-width="4" stroke-linecap="round"/>
        <circle cx="32" cy="14" r="8" fill="none" stroke="#4E9AE8" stroke-width="3" stroke-dasharray="4 4"/>`,
      );
    case "rings": // 규모 동심원
      return M(
        `<circle cx="32" cy="32" r="8" fill="#E8590C"/>
        <circle cx="32" cy="32" r="17" stroke="#F2A72E" stroke-width="3" fill="none"/>
        <circle cx="32" cy="32" r="26" stroke="#4E9AE8" stroke-width="3" fill="none" stroke-dasharray="6 5"/>`,
      );
    case "consume": // 장바구니와 지구
      return M(
        `<path d="M14 26h32l-4 24H18z" fill="#E8C48A" stroke="#B0803A" stroke-width="2"/>
        <path d="M22 26q0-12 10-12t10 12" stroke="#B0803A" stroke-width="3" fill="none"/>
        <circle cx="45" cy="18" r="9" fill="#4E9AE8"/><path d="M41 15q4-3 7 0-2 4-6 2z" fill="#3E9E5C"/>`,
      );
    case "linked": // 그물망
      return M(
        `<circle cx="14" cy="16" r="5" fill="#E8590C"/><circle cx="50" cy="14" r="5" fill="#4E9AE8"/><circle cx="32" cy="34" r="6" fill="#F2A72E"/><circle cx="14" cy="50" r="5" fill="#3E9E5C"/><circle cx="50" cy="50" r="5" fill="#8E9EC8"/>
        <path d="M14 16l18 18M50 14 32 34m0 0L14 50m18-16 18 16M14 16l36-2M14 50l36 0" stroke="#AAB4C4" stroke-width="2"/>`,
      );
    case "market": // 하나의 시장(지구+가격표)
      return M(
        `<circle cx="30" cy="30" r="16" fill="#4E9AE8"/><path d="M22 24q6-6 13-1-4 7-11 4zM32 36q7-3 9 3-5 5-10 1z" fill="#3E9E5C"/>
        <path d="M40 40l12 4-2 10-12-2q-4-8 2-12z" fill="#F2C879" stroke="#B0803A" stroke-width="2"/>
        <path d="M44 46h4" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "culture": // 문화의 확산(음표+피자)
      return M(
        `<circle cx="24" cy="38" r="14" fill="#E8B93C" stroke="#B0803A" stroke-width="2"/>
        <circle cx="20" cy="34" r="3" fill="#C24A3E"/><circle cx="29" cy="40" r="3" fill="#C24A3E"/><circle cx="22" cy="45" r="2.4" fill="#FFF6E8"/>
        <path d="M44 14v22q0 6-6 6t-6-6 6-6q3 0 6 2" stroke="#4E5968" stroke-width="3" fill="none"/>
        <path d="M44 14l10 4" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "shadow": // 빛과 그림자(양면)
      return M(
        `<circle cx="32" cy="32" r="22" fill="#F2C879"/>
        <path d="M32 10a22 22 0 0 1 0 44z" fill="#5A6B7E"/>
        <path d="M24 28l6 8 10-12" stroke="#8A6A1E" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40 40l6 6M46 40l-6 6" stroke="#E8EEF6" stroke-width="3.2" stroke-linecap="round"/>`,
      );
    case "brand": // 지역 브랜드(하트 배지)
      return M(
        `<rect x="12" y="14" width="40" height="36" rx="8" fill="#F2F4F8" stroke="#AAB4C4" stroke-width="2"/>
        <path d="M25 27c2.4-3.4 7-2.4 8 .8 1-3.2 5.6-4.2 8-.8 2 3-0.4 6.8-8 11.6-7.6-4.8-10-8.6-8-11.6z" fill="#E23B4B"/>
        <path d="M20 56l6-8M44 56l-6-8" stroke="#8A93A6" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "gi": // 지리적 표시제(인증 리본)
      return M(
        `<circle cx="32" cy="27" r="15" fill="#F2C879" stroke="#B0803A" stroke-width="2.4"/>
        <path d="M32 18q6 5 0 18-6-13 0-18z" fill="#3E9E5C"/>
        <path d="M25 40l-5 15 12-7 12 7-5-15" fill="#E8590C"/>`,
      );
    case "citychange": // 지역이 세계를 바꾼다(쿠리치바 버스)
      return M(
        `<rect x="8" y="40" width="48" height="8" rx="3" fill="#8A99A6"/>
        <path d="M8 44h48" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 4"/>
        <rect x="12" y="18" width="30" height="20" rx="5" fill="#E86A5E" stroke="#8F1D1D" stroke-width="1.6"/>
        <path d="M42 22q6-1 8 4v12h-8z" fill="#E86A5E" stroke="#8F1D1D" stroke-width="1.6"/>
        <rect x="16" y="22" width="7" height="7" rx="1.6" fill="#DCF2FF"/><rect x="26" y="22" width="7" height="7" rx="1.6" fill="#DCF2FF"/>
        <circle cx="20" cy="40" r="4" fill="#3A4658"/><circle cx="42" cy="40" r="4" fill="#3A4658"/>
        <path d="M50 16q4-6 10-6M54 20q3-4 8-4" stroke="#2E8A4C" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "festival": // 지역 축제(가랜드와 텐트)
      return M(
        `<path d="M8 14q24 14 48 0" stroke="#AAB4C4" stroke-width="2" fill="none"/>
        <path d="M16 17l4 8 5-6zM32 21l4 8 5-7zM47 16l3 8 5-6z" fill="#E8590C"/>
        <path d="M14 54l18-22 18 22z" fill="#4E9AE8"/><path d="M32 32v22" stroke="#2E6EA8" stroke-width="2.4"/>
        <path d="M26 54q6-8 12 0z" fill="#F2F4F8"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="18" fill="#F2A72E"/>`);
  }
}
