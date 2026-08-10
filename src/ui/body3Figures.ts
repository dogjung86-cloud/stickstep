// body3Figures — 중2 Ⅵ v3 퀴즈·concept 도해 + recap 미니아트.
// 규약: 퀴즈용 그림은 정답 유출 차단 인자(blanks)를 받고, concept·recap은 무인자.
// 색은 body3Kit.B6 시맨틱만 사용. 어두운 면 위 라벨은 흰 글자 + 그 면의 최암색 할로.
import { B6 } from "./body3Kit";

const SVG = (w: number, h: number, inner: string, label?: string): string =>
  `<svg viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg"${label ? ` role="img" aria-label="${label}"` : ` aria-hidden="true"`}>${inner}</svg>`;

// ── 검출 반응 도해(L1) — 시약 ↔ 영양소 ↔ 반응색 대응표 ─────────────────
// blanks: 가릴 행 키("starch"|"sugar"|"protein"|"fat") — 색 원과 색 이름을 ?로 바꾼다.
// 퀴즈 전용(정답 유출 차단), concept·recap은 무인자로 전체 공개.
const DETECT_ROWS = [
  { key: "starch", reagent: "아이오딘-아이오딘화 칼륨", target: "녹말", color: B6.iodine, colorName: "청람색", heat: false },
  { key: "sugar", reagent: "베네딕트 (+가열)", target: "포도당 등 당분", color: B6.benedict, colorName: "황적색", heat: true },
  { key: "protein", reagent: "뷰렛", target: "단백질", color: B6.biuret, colorName: "보라색", heat: false },
  { key: "fat", reagent: "수단 III", target: "지방", color: B6.sudan, colorName: "선홍색", heat: false },
] as const;

export function detectMatchFig(blanks: string[] = []): string {
  const rows = DETECT_ROWS.map((r, i) => {
    const y = 28 + i * 44;
    const hidden = blanks.includes(r.key);
    const mark = blanks.length ? (hidden ? "㉠" : "") : "";
    const circle = hidden
      ? `<circle cx="292" cy="${y}" r="13" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="292" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#868E96">${mark || "?"}</text>`
      : `<circle cx="292" cy="${y}" r="13" fill="${r.color}"/>
         <text x="292" y="${y + 26}" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">${r.colorName}</text>`;
    return `<g>
      <rect x="10" y="${y - 15}" width="158" height="30" rx="15" fill="#F8F9FA" stroke="#DEE2E6" stroke-width="1.6"/>
      <text x="89" y="${y + 4.5}" text-anchor="middle" font-size="${r.reagent.length > 10 ? 10.5 : 12}" font-weight="700" fill="#333D4B">${r.reagent}</text>
      <path d="M174 ${y} h20 M188 ${y - 4} l8 4 -8 4 Z" stroke="#ADB5BD" stroke-width="2" fill="#ADB5BD"/>
      <text x="230" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${B6.ink}">${r.target}</text>
      ${circle}
    </g>`;
  }).join("");
  return SVG(330, 202, rows, "영양소 검출 반응 대응표");
}

// ── 소화계 모식도(L2 concept) — 소화관 세로 흐름 + 부속 기관 곁가지 ──────
// 경로도는 한글 라벨이 본질이라 벡터로 그린다(하이브리드 방침 — 실사풍은 발주본 bimg 곁들임).
export function digestMapFig(): string {
  const duct = (y: number, label: string, w = 86): string =>
    `<g><rect x="${62 - w / 2 + 43}" y="${y - 17}" width="${w}" height="34" rx="12" fill="#FFF7F5" stroke="#E8B9B2" stroke-width="2.4"/>
     <text x="105" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#C9303E">${label}</text></g>`;
  const side = (x: number, y: number, label: string, tone: string): string =>
    `<g><rect x="${x - 40}" y="${y - 16}" width="80" height="32" rx="12" fill="#FFFFFF" stroke="${tone}" stroke-width="2.2"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text></g>`;
  const arrow = (d: string): string => `<path d="${d}" stroke="#B0B8C1" stroke-width="2.2" fill="none" marker-end="url(#b6arrow)"/>`;
  return SVG(
    340,
    268,
    `<defs><marker id="b6arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#B0B8C1"/></marker></defs>
    <path d="M105 42 v206" stroke="#F1D9D5" stroke-width="5" stroke-linecap="round"/>
    ${duct(30, "입")}
    ${duct(72, "식도")}
    ${duct(114, "위")}
    ${duct(156, "작은창자", 96)}
    ${duct(198, "큰창자")}
    ${duct(240, "항문")}
    ${side(255, 30, "침샘", "#F3C9A8")}
    ${arrow("M215 30 h-56")}
    ${side(255, 88, "간", "#F3C9A8")}
    ${arrow("M255 104 v14")}
    ${side(255, 134, "쓸개", "#F3C9A8")}
    ${arrow("M215 140 l-52 12")}
    ${side(255, 186, "이자", "#F3C9A8")}
    ${arrow("M215 180 l-52 -16")}
    <text x="250" y="222" text-anchor="middle" font-size="11" font-weight="700" fill="#8B95A1">침·쓸개즙·이자액이</text>
    <text x="250" y="237" text-anchor="middle" font-size="11" font-weight="700" fill="#8B95A1">소화관으로 분비돼요</text>`,
    "소화계 모식도 — 소화관과 부속 기관",
  );
}

// ── 녹말 소화 흐름도(L2 퀴즈) — blanks: ["final"]이면 최종 산물을 ㉠로 가림 ──
export function starchFlowFig(blanks: string[] = []): string {
  const hideFinal = blanks.includes("final");
  const boxc = (x: number, label: string, hidden = false): string =>
    hidden
      ? `<g><rect x="${x - 38}" y="86" width="76" height="34" rx="12" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="${x}" y="108" text-anchor="middle" font-size="14" font-weight="800" fill="#868E96">㉠</text></g>`
      : `<g><rect x="${x - 38}" y="86" width="76" height="34" rx="12" fill="#FFF4E6" stroke="#F3C9A8" stroke-width="2.4"/>
         <text x="${x}" y="108" text-anchor="middle" font-size="13.5" font-weight="800" fill="#D9480F">${label}</text></g>`;
  const enz = (x: number, l1: string, l2: string): string =>
    `<path d="M${x - 22} 103 h44" stroke="#B0B8C1" stroke-width="2.4" marker-end="url(#b6arrow2)"/>
     <text x="${x}" y="82" text-anchor="middle" font-size="11.5" font-weight="800" fill="#7048E8">${l1}</text>
     <text x="${x}" y="132" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">${l2}</text>`;
  return SVG(
    340,
    150,
    `<defs><marker id="b6arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#B0B8C1"/></marker></defs>
    ${boxc(52, "녹말")}
    ${enz(113, "아밀레이스", "(입 · 침)")}
    ${boxc(170, "엿당")}
    ${enz(230, "아밀레이스", "(작은창자 · 이자액)")}
    ${boxc(290, "포도당", hideFinal)}`,
    "녹말의 소화 과정 흐름도",
  );
}

// ── recap 미니아트(64×64 플랫 — 과학 *Figures 관례) ─────────────────────
const MINI: Record<string, string> = {};

/** 물방울(물 = 구성 성분 1위) */
MINI.waterBody = `<circle cx="32" cy="34" r="22" fill="#E7F5FF"/><path d="M32 14 C40 26 46 32 46 40 a14 14 0 0 1 -28 0 c0 -8 6 -14 14 -26 Z" fill="${B6.water}"/><path d="M26 40 c0 5 3 8 7 9" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;

/** 여섯 재료(영양소 6종 = 색점 육각 배치) */
MINI.sixMats = `<circle cx="32" cy="14" r="7" fill="${B6.carb}"/><circle cx="48" cy="23" r="7" fill="${B6.protein}"/><circle cx="48" cy="41" r="7" fill="${B6.fat}"/><circle cx="32" cy="50" r="7" fill="${B6.vitamin}"/><circle cx="16" cy="41" r="7" fill="${B6.mineral}"/><circle cx="16" cy="23" r="7" fill="${B6.water}"/><circle cx="32" cy="32" r="5" fill="#FFFFFF" stroke="#CED4DA" stroke-width="2"/>`;

/** 에너지원 3형제(장작+불꽃) */
MINI.energyLogs = `<rect x="12" y="42" width="40" height="7" rx="3.5" fill="#B08D4F" transform="rotate(-8 32 45)"/><rect x="12" y="48" width="40" height="7" rx="3.5" fill="#8D6E3A" transform="rotate(6 32 51)"/><path d="M32 12 c7 8 12 13 12 20 a12 12 0 0 1 -24 0 c0 -7 5 -12 12 -20 Z" fill="#FF922B"/><path d="M32 22 c4 5 6 8 6 12 a6 6 0 0 1 -12 0 c0 -4 2 -7 6 -12 Z" fill="${B6.energy}"/>`;

/** 검출 색 짝(시험관 4개 + 반응색) */
MINI.colorTubes = `<g stroke-width="2"><rect x="8" y="14" width="10" height="34" rx="5" fill="#E7ECFB" stroke="#B9C2CC"/><rect x="9.5" y="30" width="7" height="16" rx="3.5" fill="${B6.iodine}"/><rect x="22" y="14" width="10" height="34" rx="5" fill="#FDEDE4" stroke="#B9C2CC"/><rect x="23.5" y="30" width="7" height="16" rx="3.5" fill="${B6.benedict}"/><rect x="36" y="14" width="10" height="34" rx="5" fill="#F0EAFB" stroke="#B9C2CC"/><rect x="37.5" y="30" width="7" height="16" rx="3.5" fill="${B6.biuret}"/><rect x="50" y="14" width="10" height="34" rx="5" fill="#FDE9EC" stroke="#B9C2CC"/><rect x="51.5" y="30" width="7" height="16" rx="3.5" fill="${B6.sudan}"/></g>`;

/** 좁은 문과 조각 상자(소화 = 크기 문제) */
MINI.doorParts = `<rect x="24" y="12" width="18" height="40" rx="3" fill="#FFF7F5" stroke="#C9303E" stroke-width="2.6"/><circle cx="38" cy="33" r="2" fill="#C9303E"/><rect x="6" y="20" width="13" height="10" rx="2" fill="${B6.carb}"/><rect x="6" y="34" width="13" height="10" rx="2" fill="${B6.carb}" opacity="0.75"/><path d="M46 24 h8 M50 20 l6 4 -6 4 Z" stroke="${B6.carb}" stroke-width="2.4" fill="${B6.carb}"/><circle cx="52" cy="40" r="4" fill="${B6.glucose}"/><circle cx="58" cy="46" r="4" fill="${B6.glucose}"/>`;

/** 전담 가위(효소 특이성 — 모양 다른 가위 2개와 사슬) */
MINI.enzymeScissors = `<path d="M10 22 h26" stroke="${B6.carb}" stroke-width="3"/><circle cx="14" cy="22" r="4.5" fill="${B6.carb}"/><circle cx="26" cy="22" r="4.5" fill="${B6.carb}"/><circle cx="38" cy="22" r="4.5" fill="${B6.carb}"/><path d="M44 12 l12 14 M56 12 l-12 14" stroke="#7048E8" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="28" r="3.4" fill="none" stroke="#7048E8" stroke-width="2.4"/><circle cx="55" cy="28" r="3.4" fill="none" stroke="#7048E8" stroke-width="2.4"/><path d="M10 46 h20" stroke="${B6.protein}" stroke-width="3"/><circle cx="14" cy="46" r="4.5" fill="${B6.protein}"/><circle cx="26" cy="46" r="4.5" fill="${B6.protein}"/><path d="M40 40 q6 6 0 12" stroke="#C9CDD2" stroke-width="2.6" fill="none"/><text x="52" y="52" font-size="14" font-weight="800" fill="#8B95A1">?</text>`;

/** 접힌 융털 카펫(표면적) */
MINI.villiFold = `<rect x="8" y="40" width="48" height="12" rx="4" fill="#FBEEEC" stroke="#E8B9B2" stroke-width="2"/><path d="M12 40 v-14 a5 5 0 0 1 10 0 v14 M24 40 v-18 a5 5 0 0 1 10 0 v18 M36 40 v-14 a5 5 0 0 1 10 0 v14" fill="#FFB3B9" stroke="#E07A85" stroke-width="2.2"/><circle cx="17" cy="30" r="1.6" fill="#FFFFFF"/><circle cx="29" cy="27" r="1.6" fill="#FFFFFF"/><circle cx="41" cy="30" r="1.6" fill="#FFFFFF"/>`;

/** 자리표시(키 미등록) — 저작 중 눈에 띄게 */
const FALLBACK = `<rect x="10" y="10" width="44" height="44" rx="10" fill="#F1F3F5" stroke="#CED4DA" stroke-width="2"/><text x="32" y="38" text-anchor="middle" font-size="16" fill="#868E96">?</text>`;

export function b6MiniArt(key: string): string {
  return SVG(64, 64, MINI[key] ?? FALLBACK);
}
