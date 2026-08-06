// examFiguresSoc — 사회 단원 종합 평가 전용 그림(과학 examFigures·수학 examFiguresMath에
// 추가 금지 규칙의 사회판 · 2026-08-06 s1u1 v1에서 신설). 이후 사회 시험 그림은 전부 여기.
// 원칙(SOC_GUIDE·EXAM_GUIDE): ① 세계지도·기후는 worldMap.generated.ts 실데이터만(손그리기 0)
// ② 지도 위 마커·경로는 전부 lon/lat → 좌표 계산(눈대중 0 — audit 검산 대상)
// ③ aria는 파라미터에서 파생한 "관찰 서술"만 — 판정 결과·정답 유출 금지
// ④ 파운드리 문법(그라데이션·키라이트·접촉 그림자), SVG 텍스트 12px 이상
// ⑤ 고정 기하 clipPath만 고정 id 사용(파라미터 기하 클립은 id에 기하 각인 — 사회 Ⅵ 관례)
import { WORLD_LAND_PATH } from "./worldMap.generated";
import { CONTINENTS, lonToX, latToY, polyPath } from "./continentMap";

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 경도·위도 → 세계지도 svg 좌표(viewBox 0 14 1000 400 — socFigures.climateMapFig와 동일 격자) */
const mx = (lon: number): number => ((lon + 180) / 360) * 1000;
const my = (lat: number): number => ((90 - lat) / 180) * 500;

/** 한글 라벨 2줄 래핑(공백 우선, 없으면 글자 수로 절단 — 상자류 공용) */
function wrap2(t: string, per: number): string[] {
  if (t.length <= per) return [t];
  const sp = t.lastIndexOf(" ", per);
  const cut = sp >= Math.ceil(per * 0.45) ? sp : per;
  const a = t.slice(0, cut).trim();
  const b = t.slice(cut).trim();
  return [a, b];
}

/* ================================================================
 * 1. socWorldFig — 기후색 없는 세계지도(위치 마커·이동 경로·적도)
 *    marks: ㉠㉡… 위치 배지 / routes: 두 지점을 잇는 곡선 화살표
 *    kind — air 하늘길(주황) · sea 바닷길(파랑) · cable 해저 케이블(보라 점선)
 *    ⚠ 경로는 날짜변경선 비횡단(|Δlon| ≤ 180)만 — 태평양 횡단 항로는 곡선이
 *      지도 반대편으로 감겨 실격(눈검수 실측). 출제 세팅에서 금지.
 * ================================================================ */
export function socWorldFig(opts?: {
  marks?: { lon: number; lat: number; t: string }[];
  routes?: { from: [number, number]; to: [number, number]; kind?: "air" | "sea" | "cable" }[];
  eq?: boolean;
}): string {
  const marks = opts?.marks ?? [];
  const routes = opts?.routes ?? [];
  const ROUTE_STYLE: Record<string, string> = {
    air: `stroke="#E8590C" stroke-width="6"`,
    sea: `stroke="#2E6EA8" stroke-width="6"`,
    cable: `stroke="#7048E8" stroke-width="5" stroke-dasharray="12 10"`,
  };
  const routeSvg = routes
    .map((r) => {
      const x1 = mx(r.from[0]);
      const y1 = my(r.from[1]);
      const x2 = mx(r.to[0]);
      const y2 = my(r.to[1]);
      // 완만한 곡선 — 중점에서 위(극 쪽)로 거리의 16%만큼 들어 올린 제어점
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.16;
      const kind = r.kind ?? "air";
      // 도착점 화살촉 — 곡선 종점 접선 방향
      const ang = Math.atan2(y2 - cy, x2 - cx);
      const ah = 16;
      const a1x = x2 - ah * Math.cos(ang - 0.42);
      const a1y = y2 - ah * Math.sin(ang - 0.42);
      const a2x = x2 - ah * Math.cos(ang + 0.42);
      const a2y = y2 - ah * Math.sin(ang + 0.42);
      const col = kind === "air" ? "#E8590C" : kind === "sea" ? "#2E6EA8" : "#7048E8";
      return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" ${ROUTE_STYLE[kind]} fill="none" stroke-linecap="round"/>
        <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="9" fill="${col}"/>
        <path d="M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${a1x.toFixed(1)} ${a1y.toFixed(1)} L ${a2x.toFixed(1)} ${a2y.toFixed(1)} z" fill="${col}"/>`;
    })
    .join("");
  const markSvg = marks
    .map(
      (m) => `<g>
      <circle cx="${mx(m.lon).toFixed(1)}" cy="${my(m.lat).toFixed(1)}" r="30" fill="#FFFFFF" stroke="#333D4B" stroke-width="3.4"/>
      <text x="${mx(m.lon).toFixed(1)}" y="${(my(m.lat) + 10).toFixed(1)}" text-anchor="middle" font-size="30" font-weight="900" fill="#333D4B">${m.t}</text>
    </g>`,
    )
    .join("");
  const eqSvg = opts?.eq
    ? `<line x1="0" y1="250" x2="1000" y2="250" stroke="#7FA8C8" stroke-width="1.6" stroke-dasharray="10 8"/>
       <text x="10" y="242" font-size="24" font-weight="700" fill="#5A7A96" stroke="#D6EAF6" stroke-width="6" paint-order="stroke">적도</text>`
    : "";
  const ariaBits = [
    "세계지도",
    marks.length ? `위치 ${marks.map((m) => m.t).join("·")} 표시` : "",
    routes.length ? "두 지점을 잇는 경로 화살표" : "",
  ].filter(Boolean);
  return `<svg viewBox="0 14 1000 400" ${NS} fill="none" role="img" aria-label="${ariaBits.join(" — ")}">
    <defs><clipPath id="sxw-clip"><rect x="0" y="14" width="1000" height="400" rx="12"/></clipPath></defs>
    <rect x="0" y="14" width="1000" height="400" rx="12" fill="#D6EAF6"/>
    <g clip-path="url(#sxw-clip)">
      <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
      <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.45)" stroke-width=".8" fill="none" fill-rule="evenodd"/>
      ${eqSvg}${routeSvg}
    </g>
    ${markSvg}
  </svg>`;
}

/* ================================================================
 * 2. socLatBeamFig — 위도별 햇빛 단면(같은 폭 광선 다발 → 닿는 땅 넓이)
 *    기하: 수평 광선이 반지름 R 원에 닿는 점 = (−√(R²−y²), y).
 *    다발 반폭 h가 위도 φ에서 덮는 호 길이 ∝ 1/cosφ — 정직한 투영.
 * ================================================================ */
export function socLatBeamFig(opts?: { marks?: { lat: number; t: string }[] }): string {
  const marks = opts?.marks ?? [
    { lat: 2, t: "㉮" },
    { lat: 45, t: "㉯" },
    { lat: 72, t: "㉰" },
  ];
  const CX = 252;
  const CY = 124;
  const R = 96;
  const H = 10; // 광선 다발 반폭(px)
  let beams = "";
  for (const m of marks) {
    const yC = -R * Math.sin((m.lat * Math.PI) / 180); // 중심선(위쪽 음수)
    const ys = [yC - H, yC + H].map((y) => Math.max(-R + 2, Math.min(R - 2, y)));
    const hits = ys.map((y) => ({ x: CX - Math.sqrt(R * R - y * y), y: CY + y }));
    // 광선 2줄
    beams += hits
      .map(
        (p) =>
          `<line x1="30" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#F2A72E" stroke-width="3.4" stroke-linecap="round"/>`,
      )
      .join("");
    // 두 광선 사이를 채우는 옅은 띠
    beams += `<path d="M30 ${hits[0].y.toFixed(1)} L ${hits[0].x.toFixed(1)} ${hits[0].y.toFixed(1)} L ${hits[1].x.toFixed(1)} ${hits[1].y.toFixed(1)} L 30 ${hits[1].y.toFixed(1)} z" fill="#F2A72E" opacity=".16"/>`;
    // 닿는 땅(호 구간) — 두 접점 사이의 원호를 굵게
    const a0 = Math.atan2(hits[0].y - CY, hits[0].x - CX);
    const a1 = Math.atan2(hits[1].y - CY, hits[1].x - CX);
    const arcP = (a: number): string => `${(CX + R * Math.cos(a)).toFixed(1)} ${(CY + R * Math.sin(a)).toFixed(1)}`;
    beams += `<path d="M ${arcP(a0)} A ${R} ${R} 0 0 ${a1 > a0 ? 1 : 0} ${arcP(a1)}" stroke="#E8590C" stroke-width="9" fill="none" stroke-linecap="round"/>`;
    // 라벨 — 지구 안쪽(바깥은 광선 띠와 겹침 — 눈검수 실측 교정).
    // 적도 다발은 a0·a1이 ±180°를 걸쳐 단순 평균이 0(반대쪽)이 된다 — 랩어라운드 보정.
    let a1n = a1;
    if (Math.abs(a1 - a0) > Math.PI) a1n = a1 + (a1 < a0 ? 2 : -2) * Math.PI;
    const mid = (a0 + a1n) / 2;
    const lx = CX + (R - 28) * Math.cos(mid);
    const ly = CY + (R - 28) * Math.sin(mid);
    beams += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="13" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.8"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 4.6).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="900" fill="#333D4B">${m.t}</text>`;
  }
  return `<svg viewBox="0 0 360 248" ${NS} fill="none" role="img" aria-label="같은 폭의 태양 광선 다발이 둥근 지구의 ${marks.map((m) => m.t).join(", ")} 세 곳에 닿는 모습을 나타낸 단면 그림">
    <defs>
      <radialGradient id="sxb-earth" cx=".38" cy=".32" r="1"><stop offset="0" stop-color="#BFE0F5"/><stop offset=".65" stop-color="#7FB4DC"/><stop offset="1" stop-color="#5890BE"/></radialGradient>
    </defs>
    <rect width="360" height="248" rx="14" fill="#F4F8FB"/>
    <circle cx="30" cy="124" r="17" fill="#FFC24D"/><circle cx="30" cy="124" r="25" fill="#FFC24D" opacity=".22"/>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#sxb-earth)" stroke="#4A6E92" stroke-width="2"/>
    <line x1="${CX - R + 6}" y1="${CY}" x2="${CX + R - 6}" y2="${CY}" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="6 6" opacity=".75"/>
    <text x="${CX + R - 10}" y="${CY - 8}" text-anchor="end" font-size="12" font-weight="800" fill="#2E5474">적도</text>
    ${beams}
  </svg>`;
}

/* ================================================================
 * 3. socLifeSceneFig — 환경과 생활 장면 6종(텍스트 무인쇄 · 관찰 aria)
 * ================================================================ */
export type SocLifeScene = "stilt" | "ger" | "igloo" | "desertwear" | "tundrawear" | "oasis";

export function socLifeSceneFig(kind: SocLifeScene): string {
  const scenes: Record<SocLifeScene, { aria: string; body: string; defs?: string }> = {
    stilt: {
      aria: "물가 위에 기둥을 높이 세워 바닥을 땅에서 띄운 집과 사다리가 있는 풍경",
      defs: `<linearGradient id="sxs-sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9E8DA"/><stop offset="1" stop-color="#EFF8F1"/></linearGradient>
        <linearGradient id="sxs-wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC4EC"/><stop offset="1" stop-color="#4E9ACC"/></linearGradient>`,
      body: `<rect width="360" height="200" rx="14" fill="url(#sxs-sky1)"/>
        <rect y="150" width="360" height="50" fill="url(#sxs-wat)"/>
        <path d="M20 166q10-4 20 0M60 178q10-4 20 0M270 170q10-4 20 0M320 182q10-4 20 0" stroke="#DCF2FF" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
        <ellipse cx="170" cy="158" rx="86" ry="8" fill="#2A3A5E" opacity=".12"/>
        <path d="M96 96 170 58l74 38z" fill="#C2934A" stroke="#8A6A3E" stroke-width="1.8"/>
        <path d="M104 96h132v30q-66 10-132 0z" fill="#E8C48A" stroke="#B0803A" stroke-width="1.8"/>
        <rect x="158" y="102" width="26" height="24" rx="3" fill="#6E4630"/>
        <path d="M116 126v34M144 128v32M196 128v32M224 126v34" stroke="#8A6A3E" stroke-width="5" stroke-linecap="round"/>
        <path d="M246 100l26 58M258 112l-16 8M266 128l-18 8M272 144l-18 8" stroke="#8A6A3E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M300 44q8-14 20 0 12-10 18 4" stroke="#3E9E5C" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M318 48v52" stroke="#8A6A3E" stroke-width="4" stroke-linecap="round"/>
        <path d="M44 26l-7 18M70 20l-7 18M96 30l-7 18" stroke="#9EC8E8" stroke-width="2.6" stroke-linecap="round"/>`,
    },
    ger: {
      aria: "접은 나무 뼈대와 말아 둔 천을 수레에 싣는 가족의 모습",
      defs: `<linearGradient id="sxs-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4E2F5"/><stop offset="1" stop-color="#EDF6FA"/></linearGradient>
        <linearGradient id="sxs-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2DC8A"/><stop offset="1" stop-color="#96BC5E"/></linearGradient>`,
      body: `<rect width="360" height="200" rx="14" fill="url(#sxs-sky2)"/>
        <rect y="132" width="360" height="68" fill="url(#sxs-grass)"/>
        <circle cx="318" cy="38" r="12" fill="#FFC24D"/><circle cx="318" cy="38" r="18" fill="#FFC24D" opacity=".22"/>
        <ellipse cx="150" cy="164" rx="92" ry="8" fill="#2A3A5E" opacity=".14"/>
        <rect x="84" y="118" width="120" height="30" rx="5" fill="#B0803A" stroke="#7A5A28" stroke-width="1.8"/>
        <circle cx="112" cy="156" r="13" fill="#6E4630" stroke="#4E3018" stroke-width="2"/><circle cx="112" cy="156" r="4" fill="#D8C8A8"/>
        <circle cx="176" cy="156" r="13" fill="#6E4630" stroke="#4E3018" stroke-width="2"/><circle cx="176" cy="156" r="4" fill="#D8C8A8"/>
        <path d="M92 118l14-26 14 26M120 118l14-26 14 26M148 118l14-26 14 26" stroke="#8A6A3E" stroke-width="3" fill="none"/>
        <ellipse cx="178" cy="104" rx="24" ry="13" fill="#F0EDE4" stroke="#B0A488" stroke-width="1.8"/>
        <ellipse cx="178" cy="104" rx="24" ry="13" fill="none" stroke="#B0A488" stroke-width="1.2" stroke-dasharray="3 5"/>
        <path d="M204 132q20-2 30 6" stroke="#7A5A28" stroke-width="3" fill="none"/>
        <ellipse cx="258" cy="136" rx="20" ry="12" fill="#8A5A3E"/>
        <path d="M244 130q-6-2-8-14" stroke="#8A5A3E" stroke-width="7" stroke-linecap="round"/>
        <circle cx="234" cy="112" r="7" fill="#8A5A3E"/>
        <path d="M230 106l-2-6M238 106l2-6" stroke="#6E4630" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M246 146v18M256 148v16M266 148v16M274 144v18" stroke="#6E4630" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M276 132q8 2 8 10" stroke="#6E4630" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="52" cy="112" r="8" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M52 120v20M52 126l-10 6M52 126l10 4M52 140l-8 14M52 140l8 14" stroke="#3C4654" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M28 150q8-4 16 0M300 168q8-4 16 0M330 152q8-4 16 0" stroke="#7A9E46" stroke-width="2.4" stroke-linecap="round"/>`,
    },
    igloo: {
      aria: "눈 덮인 벌판에 눈과 얼음 벽돌을 둥글게 쌓아 만든 집이 있는 풍경",
      defs: `<linearGradient id="sxs-sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8CFE8"/><stop offset="1" stop-color="#E4EEF8"/></linearGradient>
        <linearGradient id="sxs-ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#CFE2F2"/></linearGradient>`,
      body: `<rect width="360" height="200" rx="14" fill="url(#sxs-sky3)"/>
        <rect y="140" width="360" height="60" fill="#EDF4FA"/>
        <path d="M0 140q60-10 120 0t120 0 120 0v60H0z" fill="#F6FAFE"/>
        <ellipse cx="172" cy="160" rx="92" ry="9" fill="#2A3A5E" opacity=".1"/>
        <path d="M92 152a80 80 0 0 1 160 0z" fill="url(#sxs-ice)" stroke="#9EB8D0" stroke-width="2.2"/>
        <path d="M104 128q68-16 136 0M120 106q52-12 104 0M140 90q32-8 72 0" stroke="#B8CFE2" stroke-width="1.8" fill="none"/>
        <path d="M132 152v-22M172 148v-28M212 152v-22M152 128v-20M192 128v-20M172 106v-14" stroke="#B8CFE2" stroke-width="1.8"/>
        <path d="M226 152a26 26 0 0 1 52 0z" fill="url(#sxs-ice)" stroke="#9EB8D0" stroke-width="2"/>
        <path d="M240 152a12 14 0 0 1 24 0z" fill="#4E6480"/>
        <circle cx="46" cy="34" r="2.6" fill="#fff"/><circle cx="86" cy="52" r="2.2" fill="#fff"/><circle cx="130" cy="30" r="2.6" fill="#fff"/><circle cx="210" cy="44" r="2.2" fill="#fff"/><circle cx="286" cy="30" r="2.6" fill="#fff"/><circle cx="322" cy="58" r="2.2" fill="#fff"/><circle cx="256" cy="66" r="2.4" fill="#fff"/>`,
    },
    desertwear: {
      aria: "강한 햇살과 모래바람 속에서 온몸을 감싸는 헐렁하고 긴 옷을 입은 사람",
      defs: `<linearGradient id="sxs-sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DCA0"/><stop offset=".55" stop-color="#FAEBC6"/><stop offset="1" stop-color="#FDF6E6"/></linearGradient>
        <linearGradient id="sxs-dune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D492"/><stop offset=".5" stop-color="#E2B468"/><stop offset="1" stop-color="#CE9A4E"/></linearGradient>
        <linearGradient id="sxs-duneB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E0AC"/><stop offset="1" stop-color="#E8C280"/></linearGradient>
        <linearGradient id="sxs-robe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDFDFB"/><stop offset=".6" stop-color="#F0EEE4"/><stop offset="1" stop-color="#D9D4C2"/></linearGradient>
        <radialGradient id="sxs-sun4" cx=".38" cy=".38" r=".9"><stop offset="0" stop-color="#FFDE8E"/><stop offset="1" stop-color="#FFB63C"/></radialGradient>`,
      body: `<rect width="360" height="200" rx="14" fill="url(#sxs-sky4)"/>
        <circle cx="56" cy="42" r="34" fill="#FFC96A" opacity=".16"/>
        <circle cx="56" cy="42" r="24" fill="#FFC24D" opacity=".3"/>
        <circle cx="56" cy="42" r="15" fill="url(#sxs-sun4)"/>
        <path d="M56 16v-8M30 27l-6-6M82 27l6-6M20 46h-8M92 46h8M34 62l-6 6M78 62l6 6" stroke="#F2A72E" stroke-width="3" stroke-linecap="round"/>
        <path d="M226 84q26-8 52-2M244 104q22-6 44 0M252 64q20-6 40-1" stroke="#E0B468" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".75"/>
        <circle cx="288" cy="79" r="1.8" fill="#DCAE5E"/><circle cx="300" cy="100" r="1.6" fill="#DCAE5E"/><circle cx="302" cy="60" r="1.6" fill="#DCAE5E"/><circle cx="320" cy="88" r="1.4" fill="#DCAE5E"/>
        <path d="M0 146q74-24 158-12t202-6v72H0z" fill="url(#sxs-duneB)"/>
        <path d="M0 160q92-30 190-10t170-6v56H0z" fill="url(#sxs-dune)"/>
        <path d="M18 154q46-16 96-10M236 146q52-8 96 0" stroke="#FBEBC2" stroke-width="2.6" fill="none" opacity=".8" stroke-linecap="round"/>
        <path d="M108 150q34 4 58 14M268 152q26 2 44 10" stroke="#B8823E" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>
        <ellipse cx="178" cy="184" rx="54" ry="7" fill="#2A3A5E" opacity=".14"/>
        <path d="M186 62q22-2 36 10t16 20q-5 3-10-1-8-10-20-15t-23-6z" fill="#EDF0F5" stroke="#AAB4C4" stroke-width="1.6"/>
        <circle cx="168" cy="66" r="11.5" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M152 62a16 16 0 0 1 32 0l-3 6q-13-9-26 0z" fill="#F6F7FA" stroke="#9AA4B4" stroke-width="1.8"/>
        <path d="M151 66q17-9 34 0" stroke="#DCE2EA" stroke-width="3" stroke-linecap="round"/>
        <path d="M156 76q12 7 24 0l4 8q-16 9-32 0z" fill="#EDF0F5" stroke="#AAB4C4" stroke-width="1.4"/>
        <path d="M148 92q20-12 40 0l7 27q4 24 11 51q-18 10-40 9q-22-1-38-10q6-28 12-51z" fill="url(#sxs-robe)" stroke="#A8A290" stroke-width="2"/>
        <path d="M151 98q-17 9-24 38l10 5q8-23 20-32z" fill="#F4F2E9" stroke="#A8A290" stroke-width="1.8"/>
        <path d="M185 98q19 9 26 40l-10 5q-9-26-22-36z" fill="#E5E2D4" stroke="#A8A290" stroke-width="1.8"/>
        <path d="M153 120q15 7 32 0" stroke="#C2934A" stroke-width="4.6" stroke-linecap="round"/>
        <path d="M159 130q-3 22-4 42M175 128q4 24 8 44" stroke="#C6C0AC" stroke-width="1.8" opacity=".8"/>
        <path d="M152 102q-6 28-8 60" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".6"/>
        <path d="M120 168q14-5 26-1M212 172q12-4 22 0" stroke="#E0B468" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`,
    },
    tundrawear: {
      aria: "눈 덮인 추운 벌판에서 솜을 넣은 두꺼운 털옷과 털모자를 입은 사람",
      defs: `<linearGradient id="sxs-sky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2D4E8"/><stop offset="1" stop-color="#E8F0F8"/></linearGradient>`,
      body: `<rect width="360" height="200" rx="14" fill="url(#sxs-sky5)"/>
        <rect y="146" width="360" height="54" fill="#F2F7FC"/>
        <path d="M0 146q70-8 140 0t140 0 80 0" stroke="#D2E0EC" stroke-width="2" fill="none"/>
        <ellipse cx="170" cy="182" rx="46" ry="6" fill="#2A3A5E" opacity=".12"/>
        <circle cx="170" cy="78" r="11" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M154 74a16 16 0 0 1 32 0l-4 6q-12-8-24 0z" fill="#8A5A3E" stroke="#6E4630" stroke-width="2"/>
        <path d="M152 74q18-10 36 0" stroke="#C2934A" stroke-width="4" stroke-linecap="round"/>
        <path d="M144 96q26-12 52 0l8 52q-34 12-68 0z" fill="#A85A28" stroke="#7A3E1C" stroke-width="2.2"/>
        <path d="M150 118h40M148 134h44" stroke="#7A3E1C" stroke-width="2" opacity=".55"/>
        <path d="M144 96q-12 6-14 24M196 96q12 6 14 24" stroke="#A85A28" stroke-width="9" stroke-linecap="round"/>
        <path d="M156 148l-4 30M184 148l4 30" stroke="#6E4630" stroke-width="9" stroke-linecap="round"/>
        <path d="M148 182h12M180 182h12" stroke="#3C4654" stroke-width="4" stroke-linecap="round"/>
        <path d="M188 70q10-6 16-2" stroke="#C8D8E8" stroke-width="3" stroke-linecap="round" opacity=".9"/>
        <circle cx="212" cy="64" r="5" fill="#DCE8F2" opacity=".9"/>
        <circle cx="60" cy="40" r="2.4" fill="#fff"/><circle cx="104" cy="58" r="2" fill="#fff"/><circle cx="250" cy="36" r="2.4" fill="#fff"/><circle cx="300" cy="60" r="2" fill="#fff"/><circle cx="34" cy="82" r="2" fill="#fff"/>`,
    },
    oasis: {
      aria: "모래 언덕 사이 물웅덩이 곁에 키 큰 나무와 작은 밭이 모여 있는 풍경",
      defs: `<linearGradient id="sxs-sky6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8E4B8"/><stop offset="1" stop-color="#FCF2DC"/></linearGradient>
        <linearGradient id="sxs-dune2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDCB86"/><stop offset="1" stop-color="#D8A85C"/></linearGradient>
        <radialGradient id="sxs-pool" cx=".5" cy=".4" r="1"><stop offset="0" stop-color="#8ED2F5"/><stop offset="1" stop-color="#4394CC"/></radialGradient>`,
      body: `<rect width="360" height="200" rx="14" fill="url(#sxs-sky6)"/>
        <path d="M0 132q80-30 170-8t190-8v84H0z" fill="url(#sxs-dune2)"/>
        <circle cx="52" cy="40" r="13" fill="#FFB63C"/><circle cx="52" cy="40" r="21" fill="#FFB63C" opacity=".26"/>
        <ellipse cx="185" cy="164" rx="78" ry="18" fill="url(#sxs-pool)" stroke="#2E6EA8" stroke-width="2"/>
        <path d="M150 162q12-4 24 0M196 170q12-4 24 0" stroke="#DCF2FF" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>
        <path d="M120 138V84" stroke="#8A6A3E" stroke-width="5" stroke-linecap="round"/>
        <path d="M120 84q-22-14-34-6M120 84q-16-20-32-18M120 84q2-22-10-30M120 84q16-20 32-18M120 84q22-14 34-6" stroke="#2E8A4C" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="112" cy="92" r="3.4" fill="#C2552E"/><circle cx="126" cy="94" r="3.4" fill="#C2552E"/><circle cx="119" cy="100" r="3.4" fill="#C2552E"/>
        <path d="M258 138V96" stroke="#8A6A3E" stroke-width="4.4" stroke-linecap="round"/>
        <path d="M258 96q-18-12-28-5M258 96q-13-16-26-15M258 96q13-16 26-15M258 96q18-12 28-5" stroke="#2E8A4C" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <path d="M60 168h56M60 178h56M60 188h56" stroke="#7A9E46" stroke-width="4" stroke-linecap="round"/>
        <path d="M290 168h44M290 180h44" stroke="#7A9E46" stroke-width="4" stroke-linecap="round"/>`,
    },
  };
  const s = scenes[kind];
  return `<svg viewBox="0 0 360 200" ${NS} fill="none" role="img" aria-label="${s.aria}"><defs>${s.defs ?? ""}</defs>${s.body}</svg>`;
}

/* ================================================================
 * 4. socEraCardsFig — 연결 도구 4시대 카드(㉮돛단배 ㉯증기 기관차 ㉰항공기 ㉱인터넷)
 *    hide: 이름 가림(아이콘만 — 순서·이름 묻기용)
 * ================================================================ */
export function socEraCardsFig(opts?: { hide?: boolean; marks?: string[] }): string {
  const hide = opts?.hide ?? false;
  const marks = opts?.marks ?? ["㉮", "㉯", "㉰", "㉱"];
  const names = ["돛단배", "증기 기관차", "항공기", "인터넷"];
  const defs = `<linearGradient id="sxe-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F4F7FA"/></linearGradient>
    <linearGradient id="sxe-sail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DEE5EE"/></linearGradient>
    <linearGradient id="sxe-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E9AD2"/><stop offset="1" stop-color="#3A64A0"/></linearGradient>
    <linearGradient id="sxe-boil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#66748C"/><stop offset=".45" stop-color="#4A5870"/><stop offset="1" stop-color="#303C52"/></linearGradient>
    <linearGradient id="sxe-fus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBFDFF"/><stop offset="1" stop-color="#C2CEDE"/></linearGradient>
    <radialGradient id="sxe-glo" cx=".36" cy=".32" r=".95"><stop offset="0" stop-color="#8CC8F6"/><stop offset="1" stop-color="#3576C2"/></radialGradient>`;
  const icons = [
    // 돛단배 — 파도·이중 돛(주돛 그늘 주름)·범포 하이라이트·깃발
    `<path d="M8 51q9-5 17 0t17 0 17 0" stroke="#8CC0E4" stroke-width="2.4" fill="none" stroke-linecap="round"/>
     <path d="M13 40h44l-9 11H21z" fill="url(#sxe-hull)" stroke="#28517E" stroke-width="1.6"/>
     <path d="M16 43h37" stroke="#9EC2E8" stroke-width="1.6" opacity=".8"/>
     <path d="M37 40V7" stroke="#7A5A30" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M40 9l19 29H40z" fill="url(#sxe-sail)" stroke="#96A0B2" stroke-width="1.6"/>
     <path d="M44 20q6 9 10 16" stroke="#C4CCD8" stroke-width="1.4" fill="none"/>
     <path d="M34 12L21 38h13z" fill="#EDF1F6" stroke="#96A0B2" stroke-width="1.5"/>
     <path d="M37 7l9 2.6-9 2.6z" fill="#E8590C"/>`,
    // 증기 기관차 — 보일러 원통 스펙큘러·연통 증기 3방울·운전실 창·바퀴 허브+연결봉·레일
    `<path d="M6 56h58" stroke="#8A93A6" stroke-width="2" stroke-linecap="round"/>
     <circle cx="25" cy="13" r="5" fill="#E7EDF5" opacity=".95"/><circle cx="33" cy="8" r="4" fill="#E7EDF5" opacity=".7"/><circle cx="41" cy="4" r="3" fill="#E7EDF5" opacity=".5"/>
     <path d="M14 21h8v9h-8z" fill="#2A3442"/><rect x="11" y="17" width="14" height="5" rx="2.5" fill="#222C3A"/>
     <rect x="8" y="29" width="34" height="17" rx="8" fill="url(#sxe-boil)" stroke="#1A2432" stroke-width="1.6"/>
     <path d="M13 33q13-3 25 0" stroke="#96A4BC" stroke-width="2" stroke-linecap="round" opacity=".85"/>
     <rect x="41" y="19" width="17" height="27" rx="3" fill="#3A4658" stroke="#1A2432" stroke-width="1.6"/>
     <rect x="45" y="23" width="9" height="9" rx="2" fill="#C2DCF2"/>
     <path d="M8 46l-4 9h9z" fill="#2A3442"/>
     <circle cx="17" cy="50.6" r="5.4" fill="#26303E" stroke="#0E141E" stroke-width="1.5"/><circle cx="17" cy="50.6" r="1.8" fill="#96A4BC"/>
     <circle cx="33" cy="49.2" r="6.8" fill="#26303E" stroke="#0E141E" stroke-width="1.5"/><circle cx="33" cy="49.2" r="2" fill="#96A4BC"/>
     <circle cx="50" cy="50.6" r="5.4" fill="#26303E" stroke="#0E141E" stroke-width="1.5"/><circle cx="50" cy="50.6" r="1.8" fill="#96A4BC"/>
     <path d="M17 50.6l16-1.4 17 1.4" stroke="#96A4BC" stroke-width="2" fill="none"/>`,
    // 항공기 — 유선 동체·주익/수직 꼬리날개·엔진 포드·창문 점선·항적 스트릭
    `<path d="M3 30h11M1 38h8M5 46h9" stroke="#C6D6EA" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>
     <path d="M35 31l-4-13 7 1 5 12z" fill="#CDD7E4" stroke="#6E7A8E" stroke-width="1.3"/>
     <path d="M13 36q21-8 44-6c4 0 7 1.6 6.4 3.6-.8 2.6-4.6 3.8-9.4 4.6q-24 3.4-41-2.2z" fill="url(#sxe-fus)" stroke="#66748A" stroke-width="1.6"/>
     <path d="M17 34l-6-11 8 1 5 9z" fill="#B6C2D2" stroke="#66748A" stroke-width="1.3"/>
     <path d="M34 37l-9 13 8 1 10-13z" fill="#B6C2D2" stroke="#66748A" stroke-width="1.3"/>
     <rect x="42" y="36" width="10" height="4.6" rx="2.3" fill="#8A98AC" stroke="#66748A" stroke-width="1.2"/>
     <path d="M56 29q4 .6 5 2" stroke="#4E6C9E" stroke-width="2.2" stroke-linecap="round"/>
     <path d="M26 33q12-4 24-4" stroke="#5E88C8" stroke-width="1.8" stroke-dasharray="1.6 3.2" stroke-linecap="round"/>`,
    // 인터넷 — 구면 지구(키라이트·경위선)+와이파이 신호·접촉 그림자
    `<ellipse cx="31" cy="52" rx="15" ry="2.8" fill="#2A3A5E" opacity=".1"/>
     <circle cx="31" cy="34" r="16" fill="url(#sxe-glo)" stroke="#28568E" stroke-width="1.5"/>
     <path d="M21 27q5-5 12-3-1 6-7 7-4 0-5-4zM33 42q6-4 10 1-3 5-9 3z" fill="#42A45C" opacity=".95"/>
     <ellipse cx="31" cy="34" rx="16" ry="6.4" fill="none" stroke="#FFFFFF" stroke-width="1" opacity=".35"/>
     <path d="M31 18v32" stroke="#FFFFFF" stroke-width="1" opacity=".3"/>
     <path d="M19 24q4-5 9-6" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>
     <path d="M46 21a13 13 0 0 1 12 8" stroke="#E8590C" stroke-width="2.6" fill="none" stroke-linecap="round"/>
     <path d="M46 27a8 8 0 0 1 7 5" stroke="#E8590C" stroke-width="2.6" fill="none" stroke-linecap="round"/>
     <circle cx="47" cy="35" r="2.2" fill="#E8590C"/>`,
  ];
  const CW = 82;
  const GAP = 6;
  const H = hide ? 84 : 102;
  const cards = icons
    .map(
      (ic, i) => `<g transform="translate(${8 + i * (CW + GAP)} 10)">
      <ellipse cx="${CW / 2}" cy="${H + 3}" rx="32" ry="3.2" fill="#2A3A5E" opacity=".08"/>
      <rect width="${CW}" height="${H}" rx="12" fill="url(#sxe-card)" stroke="#D8DDE4" stroke-width="1.6"/>
      <circle cx="17" cy="17" r="12" fill="#FFF4E8" stroke="#E8590C" stroke-width="1.6"/>
      <text x="17" y="21.5" text-anchor="middle" font-size="13" font-weight="900" fill="#B84A08">${marks[i]}</text>
      <g transform="translate(7 14)">${ic}</g>
      ${hide ? "" : `<text x="${CW / 2}" y="94" text-anchor="middle" font-size="12" font-weight="800" fill="#4E5968">${names[i]}</text>`}
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 360 ${hide ? 104 : 122}" ${NS} fill="none" role="img" aria-label="세계를 이어 온 도구 카드 ${marks.join(", ")} 네 장${hide ? " — 이름 없이 그림만 있다" : ""}"><defs>${defs}</defs>${cards}</svg>`;
}

/* ================================================================
 * 5. socTimeBarsFig — 걸리는 시간의 상대 비교 막대(정성 — 수치 눈금 없음)
 *    rows: [{ name, frac }] frac 0~1(가장 긴 막대 대비 비율)
 * ================================================================ */
export function socTimeBarsFig(rows: { name: string; frac: number }[]): string {
  const BAR_X = 118;
  const BAR_W = 224;
  const RH = 40;
  const H = rows.length * RH + 46;
  const bars = rows
    .map((r, i) => {
      const y = 34 + i * RH;
      const w = Math.max(10, BAR_W * r.frac);
      return `<text x="108" y="${y + 15}" text-anchor="end" font-size="12.5" font-weight="800" fill="#4E5968">${r.name}</text>
      <rect x="${BAR_X}" y="${y}" width="${BAR_W}" height="22" rx="11" fill="#EEF2F6"/>
      <rect x="${BAR_X}" y="${y}" width="${w.toFixed(1)}" height="22" rx="11" fill="#E8590C" opacity="${(0.5 + 0.5 * r.frac).toFixed(2)}"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 360 ${H}" ${NS} fill="none" role="img" aria-label="같은 소식이 전해지는 데 걸리는 시간을 상대적인 막대 길이로 나타낸 그림(막대 ${rows.length}개)">
    <text x="118" y="20" font-size="12" font-weight="700" fill="#8B95A1">걸리는 시간(막대가 길수록 오래 걸려요)</text>
    ${bars}
  </svg>`;
}

/* ================================================================
 * 6. socScaleRingsFig — 연결의 규모 동심원(안 → 밖)
 *    labels: 안쪽부터 3개(기본 ㉠㉡㉢) · dots: 사례 점(ring 0~2)
 * ================================================================ */
export function socScaleRingsFig(opts?: { labels?: string[]; dots?: { ring: 0 | 1 | 2; t: string }[] }): string {
  const labels = opts?.labels ?? ["㉠", "㉡", "㉢"];
  const dots = opts?.dots ?? [];
  const CX = 180;
  const CY = 152; // 바깥 라벨이 뷰박스 위로 잘리던 것 교정(눈검수 실측)
  const RS = [44, 84, 124];
  const COLS = ["#E8590C", "#F2A72E", "#4E9AE8"];
  const rings = RS.map(
    (r, i) =>
      `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${COLS[i]}" stroke-width="${i === 2 ? 3 : 3.6}" ${i === 2 ? 'stroke-dasharray="8 7"' : ""}/>`,
  ).join("");
  const labelSvg = labels
    .map((t, i) => {
      const y = CY - RS[i] + (i === 0 ? 6 : -8);
      return `<rect x="${CX - 30}" y="${y - 14}" width="60" height="22" rx="11" fill="#FFFFFF" stroke="${COLS[i]}" stroke-width="1.8"/>
      <text x="${CX}" y="${y + 2}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#333D4B">${t}</text>`;
    })
    .join("");
  const dotSvg = dots
    .map((d, i) => {
      const ang = -0.5 + i * 1.15;
      const r = d.ring === 0 ? 22 : (RS[d.ring - 1] + RS[d.ring]) / 2;
      const x = CX + r * Math.cos(ang);
      const y = CY + r * Math.sin(ang);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="${COLS[d.ring]}"/>
      <text x="${x.toFixed(1)}" y="${(y + 4.4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF">${d.t}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 360 300" ${NS} fill="none" role="img" aria-label="가운데에서 바깥으로 넓어지는 세 겹 동심원 그림 — ${labels.join(", ")} 표시${dots.length ? `, 점 ${dots.map((d) => d.t).join("·")}` : ""}">
    <circle cx="${CX}" cy="${CY}" r="10" fill="#333D4B"/>
    ${rings}${labelSvg}${dotSvg}
  </svg>`;
}

/* ================================================================
 * 7. socTableFig — 사회 비교 표(svgTable 문법 · aria 파라미터 파생)
 *    셀 한글 한도: 2열 ≤13자 · 3열 ≤8자(과학 관례 계승)
 * ================================================================ */
export function socTableFig(head: string[], rows: string[][], opts?: { firstColHead?: boolean; aria?: string }): string {
  const W = 344;
  const cols = head.length;
  const colW = (W - 16) / cols;
  const rowH = 32;
  const H = rowH * (rows.length + 1) + 16;
  const cellX = (c: number): number => 8 + c * colW;
  let out = `<rect x="8" y="8" width="${W - 16}" height="${rowH}" fill="#FDF0E6"/>`;
  head.forEach((h, c) => {
    out += `<text x="${cellX(c) + colW / 2}" y="${8 + rowH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#B84A08">${h}</text>`;
  });
  rows.forEach((r, i) => {
    const y = 8 + rowH * (i + 1);
    if (opts?.firstColHead) out += `<rect x="8" y="${y}" width="${colW}" height="${rowH}" fill="#F7F8FA"/>`;
    r.forEach((v, c) => {
      out += `<text x="${cellX(c) + colW / 2}" y="${y + rowH / 2 + 4.5}" text-anchor="middle" font-size="12.5" ${c === 0 && opts?.firstColHead ? 'font-weight="700"' : ""} fill="#333D4B">${v}</text>`;
    });
  });
  let grid = "";
  for (let i = 0; i <= rows.length + 1; i++) {
    grid += `<line x1="8" y1="${8 + rowH * i}" x2="${W - 8}" y2="${8 + rowH * i}" stroke="#E8D5C4" stroke-width="1.2"/>`;
  }
  for (let c = 0; c <= cols; c++) {
    grid += `<line x1="${8 + c * colW}" y1="8" x2="${8 + c * colW}" y2="${8 + rowH * (rows.length + 1)}" stroke="#E8D5C4" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="${opts?.aria ?? "자료 표"}">${out}${grid}</svg>`;
}

/* ================================================================
 * 8. socChatFig — 학생 대화 카드(익명 색이름 닉 · 무성별 스틱 헤드)
 *    cards: [{ name, text }] — text는 2줄 자동 래핑(한 줄 ≤22자 권장)
 * ================================================================ */
export function socChatFig(cards: { name: string; text: string }[]): string {
  const CH = 78;
  const H = cards.length * CH + 14;
  const body = cards
    .map((c, i) => {
      const y = 8 + i * CH;
      const lines = wrap2(c.text, 22);
      const texts = lines
        .map(
          (ln, k) =>
            `<text x="86" y="${y + (lines.length === 1 ? 46 : 38 + k * 19)}" font-size="12.8" fill="#333D4B">${ln}</text>`,
        )
        .join("");
      return `<rect x="8" y="${y}" width="344" height="${CH - 10}" rx="14" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.6"/>
      <circle cx="42" cy="${y + 34}" r="17" fill="#FFF4E8" stroke="#E8A972" stroke-width="1.8"/>
      <circle cx="42" cy="${y + 30}" r="8" fill="none" stroke="#3C4654" stroke-width="2"/>
      <path d="M34 ${y + 46}q8-8 16 0" stroke="#3C4654" stroke-width="2" fill="none"/>
      <text x="86" y="${y + 21}" font-size="11.5" font-weight="800" fill="#B84A08">${c.name}</text>
      ${texts}`;
    })
    .join("");
  return `<svg viewBox="0 0 360 ${H}" ${NS} fill="none" role="img" aria-label="학생들이 조사한 내용을 적은 카드 ${cards.length}장">${body}</svg>`;
}

/* ================================================================
 * 9. socFlowFig — 가로 사슬 순서도(㉠ 가림 지원)
 *    steps ≤4 권장 · 각 칸 텍스트는 2줄 래핑(칸 폭에 맞춰 ≤6자/줄)
 * ================================================================ */
export function socFlowFig(steps: string[], opts?: { blank?: number }): string {
  const n = steps.length;
  const AR = 16;
  const BW = (344 - AR * (n - 1)) / n;
  const BH = 58;
  const body = steps
    .map((s, i) => {
      const x = 8 + i * (BW + AR);
      const isBlank = opts?.blank === i;
      const lines = isBlank ? ["㉠"] : wrap2(s, Math.max(4, Math.floor(BW / 13)));
      const texts = lines
        .map(
          (ln, k) =>
            `<text x="${x + BW / 2}" y="${16 + (lines.length === 1 ? BH / 2 + 4.5 : BH / 2 - 5 + k * 17)}" text-anchor="middle" font-size="${isBlank ? 15 : 12}" font-weight="${isBlank ? 900 : 700}" fill="${isBlank ? "#B84A08" : "#333D4B"}">${ln}</text>`,
        )
        .join("");
      const arrow =
        i < n - 1
          ? `<path d="M ${x + BW + 3} ${16 + BH / 2} h ${AR - 9} m 0 0 l -5 -4 m 5 4 l -5 4" stroke="#8B95A1" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
          : "";
      return `<rect x="${x}" y="16" width="${BW}" height="${BH}" rx="12" fill="${isBlank ? "#FFF4E8" : "#FFFFFF"}" stroke="${isBlank ? "#E8590C" : "#DCE0E6"}" stroke-width="${isBlank ? 2 : 1.6}" ${isBlank ? 'stroke-dasharray="6 5"' : ""}/>${texts}${arrow}`;
    })
    .join("");
  return `<svg viewBox="0 0 360 90" ${NS} fill="none" role="img" aria-label="차례를 나타낸 흐름도(칸 ${n}개)${opts?.blank !== undefined ? " — 한 칸은 ㉠로 비워져 있다" : ""}">${body}</svg>`;
}

/* ================================================================
 * 10. socStrategySceneFig — 지역화 전략 장면 4종(글자 무인쇄 · 관찰 aria)
 * ================================================================ */
export type SocStrategyScene = "brand" | "gi" | "festival" | "local";

export function socStrategySceneFig(kind: SocStrategyScene): string {
  const scenes: Record<SocStrategyScene, { aria: string; body: string; defs?: string }> = {
    brand: {
      aria: "머그잔과 티셔츠 같은 기념품마다 같은 심벌이 그려져 진열된 가게 선반",
      defs: `<linearGradient id="sxg-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EDDE"/><stop offset="1" stop-color="#E8DCC4"/></linearGradient>`,
      body: `<rect width="360" height="180" rx="14" fill="url(#sxg-shelf)"/>
        <rect x="24" y="58" width="312" height="8" rx="4" fill="#B0A488"/>
        <rect x="24" y="132" width="312" height="8" rx="4" fill="#B0A488"/>
        <g transform="translate(48 20)">
          <rect width="46" height="38" rx="7" fill="#FFFFFF" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M46 10q12 0 12 10t-12 10" stroke="#AAB4C4" stroke-width="3" fill="none"/>
          <path d="M17 15c2-3 6-2 6.5.7C24 13 28 12 30 15c1.7 2.6-.3 5.8-6.5 9.7C17.3 20.8 15.3 17.6 17 15z" fill="#E23B4B"/>
        </g>
        <g transform="translate(150 14)">
          <path d="M12 12 26 2h20l14 10-8 10-6-4v28H26V18l-6 4z" fill="#F7F8FA" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M31 22c1.6-2.4 4.8-1.6 5.2.6.4-2.2 3.6-3 5.2-.6 1.4 2.1-.2 4.7-5.2 7.8-5-3.1-6.6-5.7-5.2-7.8z" fill="#E23B4B"/>
        </g>
        <g transform="translate(252 18)">
          <rect width="40" height="40" rx="6" fill="#FFFFFF" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M14 14c1.6-2.4 4.8-1.6 5.2.6.4-2.2 3.6-3 5.2-.6 1.4 2.1-.2 4.7-5.2 7.8-5-3.1-6.6-5.7-5.2-7.8z" fill="#E23B4B"/>
          <path d="M8 32h24" stroke="#DCE0E6" stroke-width="2.4"/>
        </g>
        <g transform="translate(70 84)">
          <path d="M6 40V10q0-6 6-6h20q6 0 6 6v30z" fill="#FFFFFF" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M16 16c1.4-2 4-1.3 4.4.5.3-1.8 3-2.5 4.4-.5 1.2 1.8-.2 4-4.4 6.6-4.2-2.6-5.6-4.8-4.4-6.6z" fill="#E23B4B"/>
        </g>
        <g transform="translate(160 78)">
          <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M18 20c1.6-2.4 4.8-1.6 5.2.6.4-2.2 3.6-3 5.2-.6 1.4 2.1-.2 4.7-5.2 7.8-5-3.1-6.6-5.7-5.2-7.8z" fill="#E23B4B"/>
        </g>
        <g transform="translate(248 84)">
          <rect width="52" height="34" rx="6" fill="#FFFFFF" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M21 12c1.6-2.4 4.8-1.6 5.2.6.4-2.2 3.6-3 5.2-.6 1.4 2.1-.2 4.7-5.2 7.8-5-3.1-6.6-5.7-5.2-7.8z" fill="#E23B4B"/>
        </g>
        <ellipse cx="180" cy="166" rx="120" ry="6" fill="#2A3A5E" opacity=".08"/>`,
    },
    gi: {
      aria: "바구니에 담긴 특산물에 지역 인증 리본 꼬리표가 달린 모습",
      defs: `<linearGradient id="sxg-bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF3E4"/><stop offset="1" stop-color="#F8FBF4"/></linearGradient>`,
      body: `<rect width="360" height="180" rx="14" fill="url(#sxg-bg2)"/>
        <ellipse cx="160" cy="156" rx="96" ry="9" fill="#2A3A5E" opacity=".12"/>
        <path d="M76 96h168l-16 58H92z" fill="#E8C48A" stroke="#B0803A" stroke-width="2"/>
        <path d="M84 108h152M90 124h140M96 140h128" stroke="#C89C56" stroke-width="2" opacity=".7"/>
        <circle cx="122" cy="84" r="17" fill="#8FBE56" stroke="#5E8E2E" stroke-width="2"/>
        <circle cx="158" cy="78" r="19" fill="#A5D65C" stroke="#5E8E2E" stroke-width="2"/>
        <circle cx="196" cy="84" r="17" fill="#8FBE56" stroke="#5E8E2E" stroke-width="2"/>
        <path d="M158 60q4-8 12-8M122 68q2-6 8-8" stroke="#5E8E2E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M226 74q22-8 34 6" stroke="#B0803A" stroke-width="2.4" fill="none"/>
        <g transform="translate(252 66)">
          <circle cx="26" cy="22" r="20" fill="#F2C879" stroke="#B0803A" stroke-width="2.4"/>
          <path d="M18 22l6 7 11-13" stroke="#8A5A18" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 38l-6 18 14-8 14 8-6-18" fill="#E8590C"/>
        </g>`,
    },
    festival: {
      aria: "깃발 장식 줄과 풍선이 걸린 축제 천막과 모여드는 사람들",
      defs: `<linearGradient id="sxg-bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE7F8"/><stop offset="1" stop-color="#EFF7FC"/></linearGradient>
        <linearGradient id="sxg-tent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F26A5E"/><stop offset="1" stop-color="#C23A32"/></linearGradient>`,
      body: `<rect width="360" height="180" rx="14" fill="url(#sxg-bg3)"/>
        <rect y="140" width="360" height="40" fill="#B8DC8E"/>
        <path d="M20 24q160 40 320 0" stroke="#8B95A1" stroke-width="2" fill="none"/>
        <path d="M56 30l6 12 8-9zM130 42l6 12 8-9zM210 42l6 12 8-9zM290 30l6 12 8-9z" fill="#E8590C"/>
        <path d="M96 36l6 12 8-9zM172 44l6 12 8-9zM252 36l6 12 8-9z" fill="#4E9AE8"/>
        <ellipse cx="180" cy="152" rx="110" ry="7" fill="#2A3A5E" opacity=".14"/>
        <path d="M96 142V96l84-34 84 34v46z" fill="url(#sxg-tent)" stroke="#8F1D1D" stroke-width="2"/>
        <path d="M96 96l84-34 84 34" fill="none" stroke="#8F1D1D" stroke-width="3"/>
        <path d="M124 142v-40M180 142v-46M236 142v-40" stroke="#8F1D1D" stroke-width="2" opacity=".5"/>
        <rect x="160" y="108" width="40" height="34" rx="5" fill="#FFF4E8"/>
        <path d="M180 62V44" stroke="#8F1D1D" stroke-width="2.6"/><path d="M180 44l16 5-16 5z" fill="#F2C879"/>
        <circle cx="52" cy="120" r="10" fill="#F2A72E"/><path d="M52 130v14" stroke="#B0803A" stroke-width="2"/>
        <circle cx="310 " cy="116" r="10" fill="#4E9AE8"/><path d="M310 126v14" stroke="#2E6EA8" stroke-width="2"/>
        <g stroke="#3C4654" stroke-width="2" fill="none">
          <circle cx="290" cy="150" r="5" fill="#FFE8CE"/><path d="M290 155v9M290 158l-5 3M290 158l5 3M290 164l-4 8M290 164l4 8"/>
          <circle cx="72" cy="152" r="5" fill="#FFE8CE"/><path d="M72 157v9M72 160l-5 3M72 160l5 3M72 166l-4 8M72 166l4 8"/>
        </g>`,
    },
    local: {
      aria: "같은 심벌 간판을 단 두 가게가 서로 다른 음식을 내놓은 모습",
      defs: `<linearGradient id="sxg-bg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EFE8"/><stop offset="1" stop-color="#FAF8F2"/></linearGradient>`,
      body: `<rect width="360" height="180" rx="14" fill="url(#sxg-bg4)"/>
        <g transform="translate(20 18)">
          <rect width="152" height="144" rx="12" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.8"/>
          <rect x="12" y="12" width="128" height="34" rx="8" fill="#F2C879"/>
          <circle cx="76" cy="29" r="12" fill="#E8590C"/><path d="M70 29q6-7 12 0-6 7-12 0z" fill="#FFF4E8"/>
          <path d="M46 108q0 12 12 12h36q12 0 12-12z" fill="#F2F4F8" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M52 108q24-22 48 0z" fill="#FFFFFF" stroke="#C4CFDC" stroke-width="1.6"/>
          <circle cx="68" cy="98" r="2.6" fill="#C24A3E"/><circle cx="84" cy="99" r="2.6" fill="#2E8A4C"/><circle cx="76" cy="92" r="2.6" fill="#E8B93C"/>
          <path d="M66 78q3-5 0-9M78 78q3-5 0-9" stroke="#C4CFDC" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        </g>
        <g transform="translate(188 18)">
          <rect width="152" height="144" rx="12" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.8"/>
          <rect x="12" y="12" width="128" height="34" rx="8" fill="#F2C879"/>
          <circle cx="76" cy="29" r="12" fill="#E8590C"/><path d="M70 29q6-7 12 0-6 7-12 0z" fill="#FFF4E8"/>
          <ellipse cx="76" cy="108" rx="46" ry="12" fill="#F2F4F8" stroke="#AAB4C4" stroke-width="1.8"/>
          <path d="M48 100q28-26 56 0z" fill="#E8C48A" stroke="#B0803A" stroke-width="1.8"/>
          <path d="M58 96q18-14 36 0" stroke="#B0803A" stroke-width="1.6" fill="none" opacity=".7"/>
          <circle cx="64" cy="94" r="2.4" fill="#8A5A18"/><circle cx="78" cy="90" r="2.4" fill="#8A5A18"/><circle cx="90" cy="95" r="2.4" fill="#8A5A18"/>
        </g>`,
    },
  };
  const s = scenes[kind];
  return `<svg viewBox="0 0 360 180" ${NS} fill="none" role="img" aria-label="${s.aria}"><defs>${s.defs ?? ""}</defs>${s.body}</svg>`;
}

/* ================================================================
 * 11. socDbox — 조건·지문 자료 상자(HTML · 과학 dbox 계보)
 * ================================================================ */
export const socDbox = (rows: [string, string][]): string =>
  `<div style="border:1.5px solid #E8D5C4;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:7px;background:#FFFDF9">
    ${rows.map(([tag, body]) => `<div style="display:flex;gap:8px;font-size:13.2px;line-height:1.55;word-break:keep-all">${tag ? `<b style="flex:none;color:#B84A08">${tag}</b>` : ""}<span>${body}</span></div>`).join("")}
  </div>`;

/* ════════════════════════════════════════════════════════════════
 * s1u2 v1 — 아시아 단원 시험 그림(2026-08 · 정본 qa/s1u2-v1-blueprint.md §5)
 * 지도는 continentMap ASIA def(크롭·폴리곤)+WORLD_LAND_PATH 재사용 — 손그리기 0.
 * ════════════════════════════════════════════════════════════════ */

const ASIA_DEF = CONTINENTS.asia;

/* ================================================================
 * 12. sxAsiaMapFig — 아시아 크롭 지도(레터 마커·이동 화살표·지형 소품)
 *    letters: 마커(r10.5 — 두 마커 중심 거리 ≥ ~8° 의무 · dx/dy는 svg px 오프셋
 *             배지 + 대상점 리더선 · GEO 검산은 lon/lat 앵커 기준)
 *    arrows:  곡선 이동 화살표(socWorldFig routes 문법의 크롭판 — 시작 점·도착 화살촉)
 *    terrain: 지형 소품(산맥·고원·사막·강·조산대·카스피 — socFigures2.asiaTerrainFig와
 *             같은 lon/lat 지리 사실 기하 · pad 12로 가장자리 여백)
 * ================================================================ */
export function sxAsiaMapFig(opts?: {
  letters?: { lon: number; lat: number; t: string; dx?: number; dy?: number }[];
  arrows?: { from: [number, number]; to: [number, number]; color?: string }[];
  terrain?: boolean;
}): string {
  const CROP = ASIA_DEF.crop;
  const p = opts?.terrain ? 12 : 0;
  const vx = CROP.x - p;
  const vy = CROP.y - 6 - p;
  const vw = CROP.w + p * 2;
  const vh = CROP.h + 10 + p * 2;

  const mtn = (lon: number, lat: number, s: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${x - 7 * s} ${y + 4 * s} L${x} ${y - 6 * s} L${x + 7 * s} ${y + 4 * s}z" fill="#8FA5BE" stroke="#5A7090" stroke-width=".8"/>
      <path d="M${x - 2.2 * s} ${y - 2.6 * s} L${x} ${y - 6 * s} L${x + 2.2 * s} ${y - 2.6 * s}q-2.2 1.6-4.4 0z" fill="#F2F7FB"/>`;
  };
  const volcano = (lon: number, lat: number): string => {
    const x = lonToX(lon);
    const y = latToY(lat);
    return `<path d="M${x - 5} ${y + 3} L${x} ${y - 5} L${x + 5} ${y + 3}z" fill="#C25C3E" stroke="#8F2D1D" stroke-width=".8"/>`;
  };
  const river = (pts: [number, number][]): string =>
    `<path d="${pts.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join(" ")}" stroke="#4E9AE8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`;
  const terrainSvg = opts?.terrain
    ? `<g clip-path="url(#sx2-lclip)">
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
      <ellipse cx="${lonToX(50.5)}" cy="${latToY(41.5)}" rx="9" ry="16" fill="#9CCBE8" stroke="#5A94BE" stroke-width=".8" opacity=".95" transform="rotate(-12 ${lonToX(50.5)} ${latToY(41.5)})"/>`
    : "";

  const arrowSvg = (opts?.arrows ?? [])
    .map((a) => {
      const x1 = lonToX(a.from[0]);
      const y1 = latToY(a.from[1]);
      const x2 = lonToX(a.to[0]);
      const y2 = latToY(a.to[1]);
      const cx = (x1 + x2) / 2;
      const cy = Math.min(y1, y2) - Math.max(10, Math.hypot(x2 - x1, y2 - y1) * 0.18);
      const col = a.color ?? "#E8590C";
      const ang = Math.atan2(y2 - cy, x2 - cx);
      const ah = 9;
      return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${col}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-dasharray="8 6"/>
      <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.6" fill="${col}"/>
      <path d="M ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 - ah * Math.cos(ang - 0.42)).toFixed(1)} ${(y2 - ah * Math.sin(ang - 0.42)).toFixed(1)} L ${(x2 - ah * Math.cos(ang + 0.42)).toFixed(1)} ${(y2 - ah * Math.sin(ang + 0.42)).toFixed(1)} z" fill="${col}"/>`;
    })
    .join("");

  const letterSvg = (opts?.letters ?? [])
    .map((m) => {
      const tx = lonToX(m.lon);
      const ty = latToY(m.lat);
      const bx = tx + (m.dx ?? 0);
      const by = ty + (m.dy ?? 0);
      const leader =
        m.dx || m.dy
          ? `<line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="#333D4B" stroke-width="1.3"/>
             <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="2.4" fill="#333D4B"/>`
          : "";
      return `${leader}<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="10.5" fill="#FFFFFF" stroke="#333D4B" stroke-width="1.8"/>
      <text x="${bx.toFixed(1)}" y="${(by + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="900" fill="#333D4B">${m.t}</text>`;
    })
    .join("");

  const ariaBits = [
    "아시아 지도",
    opts?.terrain ? "산맥·고원·사막·강·화산대 지형 표시" : "",
    (opts?.letters ?? []).length ? `위치 ${(opts?.letters ?? []).map((m) => m.t).join("·")} 표시` : "",
    (opts?.arrows ?? []).length ? "이동 방향 화살표" : "",
  ].filter(Boolean);
  return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" ${NS} fill="none" role="img" aria-label="${ariaBits.join(" — ")}">
    <defs>
      <clipPath id="sx2-lclip"><path d="${WORLD_LAND_PATH}" fill-rule="evenodd"/></clipPath>
      <radialGradient id="sx2-sea" cx=".5" cy=".4" r=".95">
        <stop offset="0" stop-color="#D9EDF8"/><stop offset="1" stop-color="#BCDCEF"/>
      </radialGradient>
    </defs>
    <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="12" fill="url(#sx2-sea)"/>
    <line x1="${vx}" y1="250" x2="${vx + vw}" y2="250" stroke="#7FA8C8" stroke-width="1" opacity=".55"/>
    <text x="${vx + 5}" y="246" font-size="10" font-weight="700" fill="#5A7A96">적도</text>
    <path d="${WORLD_LAND_PATH}" fill="#F2ECDE" fill-rule="evenodd"/>
    ${terrainSvg}
    <path d="${WORLD_LAND_PATH}" stroke="rgba(74,88,110,.5)" stroke-width=".7" fill="none" fill-rule="evenodd"/>
    ${arrowSvg}${letterSvg}
  </svg>`;
}

/* ================================================================
 * 13. sxPyramidFig — 인구 피라미드 1~3패널(wide 하광형·aged 상광형·migrant 청장년 남성 돌출)
 *    막대는 정성 실루엣(수치 눈금 없음) · 아래 = 어린 나이 · 왼쪽 남/오른쪽 여 표기.
 *    aria는 kinds에서 파생한 관찰 서술만(나라 이름·유형 판정 인쇄 금지).
 * ================================================================ */
export type SxPyramidKind = "wide" | "aged" | "migrant";

export function sxPyramidFig(kinds: SxPyramidKind[], opts?: { tags?: string[] }): string {
  const n = Math.max(1, Math.min(3, kinds.length));
  const PW = n === 3 ? 118 : 158;
  const W = PW * n + 8 * (n - 1);
  const tags = opts?.tags ?? ["(가)", "(나)", "(다)"];
  const rows = 9;
  const panel = (kind: SxPyramidKind, x0: number, tag: string): string => {
    const cx = PW / 2;
    let bars = "";
    for (let i = 0; i < rows; i++) {
      const t = i / (rows - 1); // 0 아래 → 1 위
      const y = 128 - i * 12;
      let lw: number;
      let rw: number;
      if (kind === "wide") {
        lw = rw = (PW * 0.37 - t * PW * 0.3) ;
      } else if (kind === "aged") {
        lw = rw = (PW * 0.14 + t * PW * 0.175 - (t > 0.82 ? (t - 0.82) * PW * 0.47 : 0));
      } else {
        // migrant: 오른쪽(여)은 홀쭉한 종형, 왼쪽(남)은 청장년 대역(행 2~5)만 크게 돌출
        rw = PW * 0.11 + (t > 0.15 && t < 0.7 ? PW * 0.045 : 0) - (t > 0.82 ? (t - 0.82) * PW * 0.35 : 0);
        const bulge = t >= 0.2 && t <= 0.62 ? Math.sin(((t - 0.2) / 0.42) * Math.PI) * PW * 0.3 : 0;
        lw = rw + bulge;
      }
      bars += `<rect x="${(x0 + cx - lw).toFixed(1)}" y="${y}" width="${lw.toFixed(1)}" height="9.5" rx="2" fill="${kind === "wide" ? "#F2A72E" : kind === "aged" ? "#4E7CB8" : "#2E9E5B"}" opacity="${(0.52 + 0.05 * i).toFixed(2)}"/>
        <rect x="${(x0 + cx).toFixed(1)}" y="${y}" width="${rw.toFixed(1)}" height="9.5" rx="2" fill="${kind === "wide" ? "#F2A72E" : kind === "aged" ? "#4E7CB8" : "#2E9E5B"}" opacity="${(0.4 + 0.045 * i).toFixed(2)}"/>`;
    }
    return `<g transform="translate(${x0 === 0 ? 0 : 0} 0)">
      <rect x="${x0 + 2}" y="6" width="${PW - 4}" height="158" rx="12" fill="#F7F9FC" stroke="#E2E8F0"/>
      ${bars}
      <line x1="${x0 + cx}" y1="18" x2="${x0 + cx}" y2="140" stroke="#8A93A6" stroke-width=".8" stroke-dasharray="3 3"/>
      <text x="${x0 + 14}" y="150" font-size="10" font-weight="800" fill="#6B7684">남</text>
      <text x="${x0 + PW - 14}" y="150" text-anchor="end" font-size="10" font-weight="800" fill="#6B7684">여</text>
      <text x="${x0 + cx}" y="160" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1">아래 = 어린 나이</text>
      <text x="${x0 + cx}" y="30" text-anchor="middle" font-size="12.5" font-weight="900" fill="#2E3A50">${tag}</text>
    </g>`;
  };
  const kindWord: Record<SxPyramidKind, string> = {
    wide: "아래쪽 막대가 넓은",
    aged: "위쪽 막대가 넓은",
    migrant: "가운데 나이대의 왼쪽 막대만 길게 튀어나온",
  };
  const aria = `인구 피라미드 그래프 ${n}개 — ${kinds.map((k, i) => `${tags[i]} ${kindWord[k]} 모양`).join(", ")}`;
  return `<svg viewBox="0 0 ${W} 170" ${NS} fill="none" role="img" aria-label="${aria}">
    ${kinds.slice(0, n).map((k, i) => panel(k, i * (PW + 8), tags[i])).join("")}
  </svg>`;
}
