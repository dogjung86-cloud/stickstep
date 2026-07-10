// bioFigures — II 단원(생물의 구성과 다양성) recap 미니아트 + 구성 단계 도해.
// civFigures와 같은 결의 밝은 미니 패널(생물 단원은 그린 톤). 파운드리 재질 문법.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

// ══════════════════════════════════════════════════════════
// 구성 단계 도해 (orgLevels 랩용, 라이트 배경) — 파운드리 재질 문법:
//   ① 근-동조 radial 그라데이션 면 ② 좌상단 키라이트 타원(흰 opacity)
//   ③ 바닥 접촉 그림자(어두운 타원 opacity ~.14) ④ 재질별 최암색 외곽선.
// 뷰박스 200×150 통일. 동물=살구/분홍, 식물=초록, 핵=보라.
// ══════════════════════════════════════════════════════════

const orgDefs = `
  <radialGradient id="og-flesh" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#FBA6B6"/><stop offset=".55" stop-color="#F27E96"/><stop offset="1" stop-color="#D3596F"/></radialGradient>
  <radialGradient id="og-flesh2" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#F79FB0"/><stop offset="1" stop-color="#C85067"/></radialGradient>
  <radialGradient id="og-nuc" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#B49BF0"/><stop offset="1" stop-color="#6E4AC0"/></radialGradient>
  <radialGradient id="og-heart" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#F2708A"/><stop offset=".55" stop-color="#E0455F"/><stop offset="1" stop-color="#B22A44"/></radialGradient>
  <radialGradient id="og-leaf" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#8FD89A"/><stop offset=".55" stop-color="#5FB878"/><stop offset="1" stop-color="#3B8C4E"/></radialGradient>
  <radialGradient id="og-chloro" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#7BD08A"/><stop offset="1" stop-color="#2E8C4A"/></radialGradient>
  <linearGradient id="og-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF7EC"/><stop offset="1" stop-color="#CBE9D2"/></linearGradient>
  <radialGradient id="og-fur" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#E3B978"/><stop offset=".6" stop-color="#C98A3C"/><stop offset="1" stop-color="#9A6428"/></radialGradient>
  <radialGradient id="og-canopy" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#7FD08C"/><stop offset=".6" stop-color="#4CB07A"/><stop offset="1" stop-color="#2C7C45"/></radialGradient>
  <linearGradient id="og-trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B07C4A"/><stop offset="1" stop-color="#6D4526"/></linearGradient>`;

const shadow = (cx: number, cy: number, rx: number, o = 0.14): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${(rx * 0.2).toFixed(1)}" fill="#5A6478" opacity="${o}"/>`;
const hi = (cx: number, cy: number, rx: number, ry: number, o = 0.5): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF" opacity="${o}"/>`;

/** 방추형(길쭉한) 근육세포 하나 — 중심 핵. */
function muscleCell(cx: number, cy: number, w: number, h: number): string {
  return `<g>
    <path d="M${cx} ${cy - h} C ${cx + w} ${cy - h * 0.5}, ${cx + w} ${cy + h * 0.5}, ${cx} ${cy + h} C ${cx - w} ${cy + h * 0.5}, ${cx - w} ${cy - h * 0.5}, ${cx} ${cy - h} Z" fill="url(#og-flesh)" stroke="#C04A62" stroke-width="1.6"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.34}" ry="${h * 0.2}" fill="url(#og-nuc)"/>
    <ellipse cx="${cx - w * 0.28}" cy="${cy - h * 0.4}" rx="${w * 0.34}" ry="${h * 0.28}" fill="#FFFFFF" opacity=".38"/>
  </g>`;
}

const ORG: Record<string, string> = {
  // ── 동물 ─────────────────────────────
  cellMuscle: `${shadow(100, 130, 44)}${muscleCell(100, 68, 34, 52)}`,
  tissueMuscle: `${shadow(100, 132, 74)}${[24, 58, 92, 126, 160].map((x) => muscleCell(x, 66, 15, 50)).join("")}`,
  organHeart: `${shadow(100, 134, 46)}
    <path d="M100 128 C 58 92, 44 68, 44 50 A 22 22 0 0 1 100 40 A 22 22 0 0 1 156 50 C 156 68, 142 92, 100 128 Z" fill="url(#og-heart)" stroke="#9E2438" stroke-width="2"/>
    <path d="M100 44 C 96 60, 108 66, 100 84" stroke="#F2A0AE" stroke-width="3" fill="none" opacity=".55"/>
    <path d="M78 30q-14-10-26 2M122 30q14-10 26 2" stroke="#C43A50" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${hi(76, 44, 16, 12, 0.4)}`,
  systemCirc: `
    <!-- 온몸으로 뻗는 혈관 나무(동맥 빨강 · 정맥 파랑 나란히) — 위로 목·팔, 아래로 다리 -->
    <path d="M96 70 V 20 M96 40 C 72 40 58 28 46 18 M96 40 C 120 40 134 28 146 18 M96 78 V 132 M96 96 C 74 96 62 110 54 132 M96 96 C 118 96 130 110 138 132" fill="none" stroke="#D3455E" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M104 70 V 22 M104 44 C 128 44 142 32 154 22 M104 44 C 80 44 66 32 54 22 M104 78 V 132 M104 100 C 126 100 138 112 146 132 M104 100 C 82 100 70 112 62 132" fill="none" stroke="#5A8FE0" stroke-width="3.2" stroke-linecap="round"/>
    <!-- 중앙 심장 -->
    <path d="M100 96 C 74 74 66 60 66 48 A 16 16 0 0 1 100 40 A 16 16 0 0 1 134 48 C 134 60 126 74 100 96 Z" fill="url(#og-heart)" stroke="#9E2438" stroke-width="2"/>
    <path d="M100 46 C 96 58 106 62 100 74" stroke="#F2A0AE" stroke-width="2.6" fill="none" opacity=".55"/>
    ${hi(84, 50, 12, 9, 0.4)}`,
  bodyDog: `${shadow(100, 132, 52)}
    <path d="M62 76 C 62 58 74 50 100 50 C 126 50 138 58 138 76 L 138 104 A 8 8 0 0 1 130 112 L 70 112 A 8 8 0 0 1 62 104 Z" fill="url(#og-fur)" stroke="#8A5A26" stroke-width="2"/>
    <path d="M62 60 L 50 38 L 70 52 Z M138 60 L 150 38 L 130 52 Z" fill="url(#og-fur)" stroke="#8A5A26" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="86" cy="76" rx="4" ry="5" fill="#3A2410"/><ellipse cx="114" cy="76" rx="4" ry="5" fill="#3A2410"/>
    <ellipse cx="100" cy="90" rx="6" ry="4.4" fill="#3A2410"/>
    <path d="M100 94 v6 M100 100 q-8 3-12 0M100 100 q8 3 12 0" stroke="#5A3A18" stroke-width="1.6" fill="none"/>
    <path d="M78 108 v10 M96 110 v10 M104 110 v10 M122 108 v10" stroke="#9A6428" stroke-width="5" stroke-linecap="round"/>
    ${hi(84, 64, 14, 10, 0.4)}`,
  // ── 식물 ─────────────────────────────
  cellLeaf: `${shadow(100, 130, 46)}
    <rect x="52" y="24" width="96" height="88" rx="12" fill="url(#og-wall)" stroke="#3B8C4E" stroke-width="4.5"/>
    <rect x="59" y="31" width="82" height="74" rx="7" fill="#EDFBEF" stroke="#79B285" stroke-width="1.6"/>
    <ellipse cx="86" cy="60" rx="13" ry="11" fill="url(#og-nuc)"/>
    ${[[112, 46], [128, 74], [98, 86], [120, 96], [76, 88]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="url(#og-chloro)" transform="rotate(-24 ${x} ${y})"/>`).join("")}
    ${hi(74, 44, 12, 8, 0.5)}`,
  tissuePalisade: `${shadow(100, 132, 74)}
    ${[26, 56, 86, 116, 146].map((x) => `<rect x="${x}" y="30" width="24" height="80" rx="8" fill="url(#og-wall)" stroke="#3B8C4E" stroke-width="3"/><ellipse cx="${x + 12}" cy="${52 + (x % 60)}" rx="7" ry="5" fill="url(#og-chloro)"/><ellipse cx="${x + 13}" cy="${80 - (x % 40)}" rx="6" ry="4.4" fill="url(#og-chloro)"/>`).join("")}`,
  tissueSystem: `${shadow(100, 134, 76)}
    <rect x="28" y="34" width="144" height="24" rx="10" fill="url(#og-leaf)" stroke="#2C7C45" stroke-width="2"/>
    <rect x="28" y="62" width="144" height="24" rx="10" fill="#DCF3DE" stroke="#79B285" stroke-width="2"/>
    <rect x="28" y="90" width="144" height="22" rx="10" fill="url(#og-chloro)" stroke="#2C7C45" stroke-width="2" opacity=".9"/>
    ${hi(64, 40, 22, 6, 0.4)}`,
  organLeaf: `${shadow(100, 134, 48)}
    <path d="M100 24 C 150 32 168 70 158 116 C 118 118 82 100 74 60 M100 24 C 50 32 32 70 42 116 C 82 118 118 100 126 60" fill="url(#og-leaf)" stroke="#2C7C45" stroke-width="2.4"/>
    <path d="M100 24 V 122" stroke="#2C7C45" stroke-width="2.6"/>
    <path d="M100 48 q22 6 34 24 M100 48 q-22 6-34 24 M100 76 q18 5 28 20 M100 76 q-18 5-28 20" stroke="#2C7C45" stroke-width="1.4" fill="none" opacity=".55"/>
    ${hi(74, 46, 18, 11, 0.35)}`,
  bodyTree: `${shadow(100, 138, 40)}
    <rect x="92" y="86" width="16" height="48" rx="4" fill="url(#og-trunk)"/>
    <path d="M100 108 l-14 -12 M100 96 l14 -10" stroke="#6D4526" stroke-width="3" stroke-linecap="round"/>
    <circle cx="100" cy="58" r="42" fill="url(#og-canopy)" stroke="#2C7C45" stroke-width="2"/>
    <circle cx="70" cy="70" r="22" fill="url(#og-canopy)" stroke="#2C7C45" stroke-width="1.6"/>
    <circle cx="132" cy="70" r="22" fill="url(#og-canopy)" stroke="#2C7C45" stroke-width="1.6"/>
    ${hi(82, 40, 20, 13, 0.45)}`,
};

// 발주 일러스트(public/bio2/levels/<file>.webp) — 구성 단계 key → 파일명 매핑.
// 손코딩 SVG를 대체한다. 로드 실패 시 onerror로 숨겨 깨진 아이콘을 피한다(폴백은 아래 SVG).
const ORG_PHOTO: Record<string, string> = {
  cellMuscle: "muscle-cell", tissueMuscle: "muscle-tissue", organHeart: "heart",
  systemCirc: "circulatory", bodyHuman: "human",
  cellLeaf: "leaf-cell", tissuePalisade: "palisade", tissueSystem: "tissue-system",
  organLeaf: "leaf", bodyTree: "tree",
};
const ORG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

/** 구성 단계 도해. 발주 일러스트 우선(없으면 손코딩 SVG 폴백).
 *  key = cellMuscle·tissueMuscle·organHeart·systemCirc·bodyDog·
 *        cellLeaf·tissuePalisade·tissueSystem·organLeaf·bodyTree. */
export function orgArt(key: string): string {
  const file = ORG_PHOTO[key];
  if (file) {
    const fallback = `<svg viewBox='0 0 200 150' ${NS} fill='none' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><defs>${orgDefs}</defs>${ORG[key] ?? ""}</svg>`;
    return `<img class="org-photo" src="${ORG_BASE}bio2/levels/${file}.webp" alt="" onerror="this.outerHTML=this.getAttribute('data-fb')" data-fb="${fallback.replace(/"/g, "&quot;")}"/>`;
  }
  return `<svg viewBox="0 0 200 150" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${orgDefs}</defs>${ORG[key] ?? ""}</svg>`;
}

// 분류 단계 도표 — 종 → 속 → 과 → 목 → 강 → 문 → 계 계층(개 예시).
// 위로 갈수록 폭이 넓어(더 많은 생물), 각 층에 한글 계급명 + 개의 실제 분류를 라벨한다.
// codex는 이미지 안 글자를 못 넣으므로, 라벨이 본질인 이 도표는 SVG로 직접 그린다.
export function classStagesFig(): string {
  const RANK = ["계", "문", "강", "목", "과", "속", "종"];
  const DOG = ["동물계", "척삭동물문", "포유강", "식육목", "개과", "개속", "개"];
  const cx = 150, topW = 250, botW = 60, y0 = 30, h = 24, gap = 3;
  const wAt = (i: number): number => topW + (botW - topW) * (i / 7);
  const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);
  let bars = "";
  for (let i = 0; i < 7; i++) {
    const yt = y0 + i * (h + gap), yb = yt + h;
    const wt = wAt(i), wb = wAt(i + 1), t = i / 6;
    const fill = `rgb(${lerp(214, 18, t)},${lerp(240, 184, t)},${lerp(222, 134, t)})`;
    const ink = t > 0.55 ? "#FFFFFF" : "#0E5A38";
    bars +=
      `<path d="M${cx - wt / 2} ${yt} L${cx + wt / 2} ${yt} L${cx + wb / 2} ${yb} L${cx - wb / 2} ${yb} Z" fill="${fill}" stroke="#2E8C4A" stroke-width="1"/>` +
      `<text x="${cx}" y="${yt + h / 2 + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="${ink}" font-family="Pretendard, sans-serif">${RANK[i]}</text>` +
      `<text x="${cx + wt / 2 + 8}" y="${yt + h / 2 + 4}" font-size="10.5" font-weight="700" fill="#4E5968" font-family="Pretendard, sans-serif">${DOG[i]}</text>`;
  }
  return `<svg viewBox="0 0 300 232" ${NS} fill="none" role="img" aria-label="개의 분류 단계 — 위 계에서 아래 종까지, 위로 갈수록 더 많은 생물을 포함해요">
    <rect x="2" y="2" width="296" height="228" rx="14" fill="#F4FBF6"/>
    <text x="12" y="20" font-size="11.5" font-weight="800" fill="#2E8C4A" font-family="Pretendard, sans-serif">개의 분류 단계</text>
    <path d="M14 32 V 214" stroke="#8FD0A6" stroke-width="1.5"/>
    <path d="M14 32 l-3 6 h6 z" fill="#2E8C4A"/>
    <text x="20" y="46" font-size="9.5" font-weight="700" fill="#2E8C4A" font-family="Pretendard, sans-serif">많은 생물</text>
    <text x="20" y="210" font-size="9.5" font-weight="700" fill="#2E8C4A" font-family="Pretendard, sans-serif">닮은 무리</text>
    ${bars}
    <text x="150" y="226" text-anchor="middle" font-size="10.5" font-weight="700" fill="#4E5968" font-family="Pretendard, sans-serif">위(계)로 갈수록 더 많은 생물을 포함 · 종이 가장 작은 단위</text>
  </svg>`;
}

type CellTypeKey = "neuron" | "redBlood" | "epithelial" | "all";

const cellTypeDefs = `
  <linearGradient id="ct-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FBFD"/><stop offset="1" stop-color="#EAF4F2"/></linearGradient>
  <radialGradient id="ct-neuron" cx=".36" cy=".28" r=".82"><stop offset="0" stop-color="#FFD6A6"/><stop offset=".6" stop-color="#F2A66B"/><stop offset="1" stop-color="#CB7145"/></radialGradient>
  <radialGradient id="ct-rbc" cx=".36" cy=".3" r=".82"><stop offset="0" stop-color="#FF8D98"/><stop offset=".62" stop-color="#E84F62"/><stop offset="1" stop-color="#B52842"/></radialGradient>
  <radialGradient id="ct-epi" cx=".36" cy=".28" r=".9"><stop offset="0" stop-color="#BDECCF"/><stop offset=".62" stop-color="#75C99B"/><stop offset="1" stop-color="#39906A"/></radialGradient>
  <radialGradient id="ct-nuc" cx=".34" cy=".26" r=".8"><stop offset="0" stop-color="#BCA9F7"/><stop offset="1" stop-color="#6752C9"/></radialGradient>`;

const neuronScene = (x = 0, y = 0, scale = 1): string => `<g transform="translate(${x} ${y}) scale(${scale})">
  <ellipse cx="124" cy="143" rx="90" ry="8" fill="#2A3A5E" opacity=".1"/>
  <g fill="none" stroke="#B7623C" stroke-width="5" stroke-linecap="round">
    <path d="M92 83C55 60 43 29 25 22M83 72C52 74 30 61 15 69M87 94C56 111 37 132 19 139M103 65C94 40 102 21 92 9"/>
    <path d="M126 84C171 82 216 94 278 72"/>
    <path d="M278 72c18-7 26-18 36-28M278 72c18 2 28 11 40 22M278 72c18 13 21 27 27 39"/>
  </g>
  <circle cx="104" cy="82" r="31" fill="url(#ct-neuron)" stroke="#A95534" stroke-width="2.2"/>
  <circle cx="104" cy="82" r="12" fill="url(#ct-nuc)"/><ellipse cx="91" cy="67" rx="10" ry="6" fill="#fff" opacity=".42"/>
  <g fill="#F4C08D" stroke="#B7623C" stroke-width="1.4">${[151,181,211,241].map((px) => `<path d="M${px} 78q11-10 22 3-11 11-22 0z"/>`).join("")}</g>
</g>`;

const redBloodScene = (x = 0, y = 0, scale = 1): string => {
  const cells = [[68, 72, -18], [132, 58, 12], [195, 82, -8], [257, 61, 22], [105, 119, 15], [181, 126, -20], [250, 118, 8]];
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="163" cy="145" rx="126" ry="9" fill="#2A3A5E" opacity=".1"/>
    ${cells.map(([cx, cy, rot]) => `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="33" ry="20" fill="url(#ct-rbc)" stroke="#A91F36" stroke-width="2"/><ellipse cx="${cx}" cy="${cy}" rx="15" ry="7" fill="#A91F36" opacity=".46"/><ellipse cx="${cx - 9}" cy="${cy - 7}" rx="9" ry="5" fill="#FFD5D9" opacity=".38"/></g>`).join("")}
  </g>`;
};

const epithelialScene = (x = 0, y = 0, scale = 1): string => {
  const cells = Array.from({ length: 15 }, (_, i) => {
    const row = Math.floor(i / 5), col = i % 5;
    const px = 30 + col * 59 + (row % 2) * 8, py = 35 + row * 45;
    return `<path d="M${px} ${py + 5}q23-15 43 0l7 25q-20 18-47 2z" fill="url(#ct-epi)" stroke="#2E7F5C" stroke-width="1.8"/><ellipse cx="${px + 24}" cy="${py + 18}" rx="8" ry="6" fill="url(#ct-nuc)"/><ellipse cx="${px + 14}" cy="${py + 7}" rx="10" ry="4" fill="#fff" opacity=".3"/>`;
  }).join("");
  return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="163" cy="156" rx="139" ry="8" fill="#2A3A5E" opacity=".09"/>${cells}</g>`;
};

/** 신경세포·적혈구·상피세포의 모양과 기능 관계를 보여 주는 라이트 SVG. */
export function cellTypeArt(kind: CellTypeKey): string {
  if (kind === "all") {
    return `<svg viewBox="0 0 360 190" ${NS} fill="none" role="img" aria-label="긴 돌기가 있는 신경세포, 가운데가 오목한 적혈구, 납작하게 이어진 상피세포">
      <defs>${cellTypeDefs}</defs><rect x="2" y="2" width="356" height="186" rx="16" fill="url(#ct-bg)"/>
      <g transform="translate(7 26) scale(.34)">${neuronScene()}</g>
      <g transform="translate(121 34) scale(.34)">${redBloodScene()}</g>
      <g transform="translate(237 32) scale(.34)">${epithelialScene()}</g>
      <g font-family="Pretendard, sans-serif" font-size="12" font-weight="800" fill="#4E5968" text-anchor="middle">
        <text x="62" y="174">신경세포</text><text x="180" y="174">적혈구</text><text x="298" y="174">상피세포</text>
      </g>
    </svg>`;
  }
  const scene = kind === "neuron" ? neuronScene() : kind === "redBlood" ? redBloodScene() : epithelialScene();
  const alt = kind === "neuron" ? "가늘고 긴 돌기가 뻗은 신경세포" : kind === "redBlood" ? "가운데가 오목한 원반 모양 적혈구" : "납작한 세포가 빈틈없이 이어진 상피세포";
  return `<svg viewBox="0 0 320 170" ${NS} fill="none" role="img" aria-label="${alt}"><defs>${cellTypeDefs}</defs><rect x="2" y="2" width="316" height="166" rx="16" fill="url(#ct-bg)"/>${scene}</svg>`;
}

type FoodWebKey = "simple" | "rich";

/** 생물 종류와 먹이 관계가 적은 경우와 많은 경우를 비교하는 라벨 SVG. */
export function foodWebArt(kind: FoodWebKey): string {
  const rich = kind === "rich";
  const marker = `fw-${kind}`;
  const nodes = rich
    ? [
        [58, 164, "벼", "#75C96B"], [151, 166, "배추", "#68BE72"], [254, 164, "풀", "#52AE67"],
        [45, 102, "메뚜기", "#D3B55E"], [132, 100, "나비", "#E79A62"], [218, 99, "참새", "#B58A66"],
        [96, 48, "개구리", "#65B982"], [196, 47, "뱀", "#789C55"], [286, 42, "매", "#8B715E"],
      ] as (string | number)[][]
    : [
        [62, 164, "벼", "#75C96B"], [145, 112, "메뚜기", "#D3B55E"], [228, 66, "개구리", "#65B982"], [304, 28, "매", "#8B715E"],
      ] as (string | number)[][];
  const links = rich
    ? [[58,150,45,116],[151,151,132,114],[254,150,218,113],[58,150,218,113],[151,151,45,116],[45,88,96,62],[132,86,96,62],[45,88,218,113],[218,85,196,61],[96,34,196,61],[196,33,286,49],[218,85,286,49]]
    : [[62,150,145,126],[145,98,228,80],[228,52,304,37]];
  return `<svg viewBox="0 0 340 195" ${NS} fill="none" role="img" aria-label="${rich ? "여러 생물과 먹이 관계가 그물처럼 이어진 생태계" : "네 생물이 한 줄 먹이 관계로 이어진 생태계"}">
    <defs><linearGradient id="${marker}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2FAF6"/><stop offset="1" stop-color="#E5F2EA"/></linearGradient><marker id="${marker}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#709488"/></marker></defs>
    <rect x="2" y="2" width="336" height="191" rx="16" fill="url(#${marker}-bg)"/>
    <g stroke="#709488" stroke-width="2" opacity=".74" marker-end="url(#${marker}-arrow)">${links.map(([x1,y1,x2,y2]) => `<path d="M${x1} ${y1}L${x2} ${y2}"/>`).join("")}</g>
    ${nodes.map(([cx, cy, label, color]) => `<g><ellipse cx="${cx}" cy="${Number(cy) + 6}" rx="29" ry="8" fill="#2A3A5E" opacity=".08"/><rect x="${Number(cx) - 31}" y="${Number(cy) - 15}" width="62" height="30" rx="15" fill="${color}" stroke="#385E4C" stroke-width="1.3"/><ellipse cx="${Number(cx) - 11}" cy="${Number(cy) - 7}" rx="9" ry="4" fill="#fff" opacity=".32"/><text x="${cx}" y="${Number(cy) + 4}" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="11" font-weight="800" fill="#17372D">${label}</text></g>`).join("")}
  </svg>`;
}

export function bioMiniArt(key: string): string {
  const wrap = (inner: string, defs = ""): string =>
    `<svg viewBox="0 0 96 96" ${NS} fill="none" stroke-linecap="round" aria-hidden="true">
      <defs>
        <linearGradient id="bma-bg" x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#EAF7EC"/><stop offset="1" stop-color="#CFEBD6"/>
        </linearGradient>${defs}
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="18" fill="url(#bma-bg)"/>
      ${inner}
    </svg>`;
  const memb = `<radialGradient id="bma-m" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#F58BA0"/><stop offset="1" stop-color="#D9607C"/></radialGradient>`;
  const green = `<radialGradient id="bma-g" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#7FD08C"/><stop offset="1" stop-color="#3B8C3B"/></radialGradient>`;

  switch (key) {
    case "animalCell": // 동물세포(막·핵·미토)
      return wrap(
        `<ellipse cx="48" cy="48" rx="34" ry="28" fill="url(#bma-m)" stroke="#C43A50" stroke-width="2.4"/>
        <circle cx="48" cy="48" r="12" fill="#7C6BFF"/><circle cx="48" cy="48" r="4.6" fill="#4A3AAE"/>
        <path d="M28 40q6-4 12 2t-2 8q-6 2-10-4z" fill="#E86A48"/>
        <path d="M62 58q6-3 10 3t-4 8q-6 0-8-6z" fill="#E86A48"/>
        <ellipse cx="34" cy="36" rx="7" ry="4" fill="#FFD1DB" opacity=".6"/>`,
        memb,
      );
    case "plantCell": // 식물세포(벽·엽록체)
      return wrap(
        `<rect x="16" y="20" width="64" height="56" rx="8" fill="#DCF3DE" stroke="#2C7C45" stroke-width="4"/>
        <rect x="21" y="25" width="54" height="46" rx="5" fill="#EAF9EC" stroke="#79B285" stroke-width="1.6"/>
        <circle cx="42" cy="48" r="9" fill="#7C6BFF"/>
        <g fill="#5FB878">${[[30, 34], [58, 32], [62, 58], [34, 62], [50, 60]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4"/>`).join("")}</g>`,
      );
    case "micro": // 현미경
      return wrap(
        `<circle cx="48" cy="44" r="24" fill="url(#bma-g)" opacity=".22"/>
        <path d="M40 20l8-4 6 12-8 4z" fill="#5A6470"/>
        <rect x="44" y="26" width="10" height="26" rx="3" fill="#41506C"/>
        <rect x="42" y="52" width="14" height="6" rx="2" fill="#5A6470"/>
        <path d="M50 58c-2 10-10 14-18 15h36" stroke="#41506C" stroke-width="4" fill="none"/>
        <rect x="30" y="72" width="40" height="6" rx="3" fill="#5A6470"/>
        <circle cx="49" cy="30" r="3.4" fill="#8FB3E8"/>`,
      );
    case "stack": // 구성 단계(작→큰 계단)
      return wrap(
        `<g fill="url(#bma-m)" stroke="#C43A50" stroke-width="1.6">
          <circle cx="24" cy="70" r="7"/>
          <rect x="34" y="56" width="18" height="18" rx="4"/>
          <path d="M62 74C54 66 52 60 52 56a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 4-2 10-14 18z"/>
        </g>
        <path d="M18 78h18M40 78h16M60 78h20" stroke="#79B285" stroke-width="2" opacity=".5"/>
        <path d="M20 40l8-8 8 8" stroke="#3B8C3B" stroke-width="3" fill="none"/>
        <path d="M28 32v18" stroke="#3B8C3B" stroke-width="3"/>`,
        memb,
      );
    case "compare": // 동물/식물 갈림
      return wrap(
        `<circle cx="30" cy="40" r="16" fill="url(#bma-m)" stroke="#C43A50" stroke-width="2"/>
        <circle cx="30" cy="40" r="5" fill="#7C6BFF"/>
        <rect x="52" y="26" width="30" height="28" rx="5" fill="#DCF3DE" stroke="#2C7C45" stroke-width="3"/>
        <circle cx="63" cy="40" r="4.4" fill="#7C6BFF"/><ellipse cx="72" cy="44" rx="4" ry="3" fill="#5FB878"/>
        <path d="M30 62v10M66 60v12M22 76h16M56 76h20" stroke="#79B285" stroke-width="2.4"/>
        <text x="30" y="86" fill="#0E6B54" font-size="0">.</text>`,
        memb,
      );
    case "variation": // 무당벌레 변이(점 다름)
      return wrap(
        `${[[28, 34, 2], [64, 32, 4], [30, 66, 5], [66, 66, 1]]
          .map(
            ([x, y, n]) => `<g>
          <path d="M${x} ${y - 11}a11 11 0 0 1 0 22 11 11 0 0 1 0-22z" fill="#1E1210"/>
          <path d="M${x} ${y - 10}a10 10 0 0 1 10 10 10 10 0 0 1-10 10z" fill="#E23E4C"/>
          <path d="M${x} ${y - 10}a10 10 0 0 0-10 10 10 10 0 0 0 10 10z" fill="#C4283A"/>
          <path d="M${x} ${y - 10}v20" stroke="#1E1210" stroke-width="1.2"/>
          ${Array.from({ length: n as number }, (_, k) => `<circle cx="${x + (k % 2 ? 4 : -4)}" cy="${y - 4 + k * 3}" r="1.6" fill="#1E1210"/>`).join("")}
        </g>`,
          )
          .join("")}`,
      );
    case "selection": // 자연선택(부리 화살표)
      return wrap(
        `<circle cx="34" cy="46" r="16" fill="url(#bma-g)"/>
        <path d="M50 44l16-4-4 8z" fill="#E0A030"/>
        <circle cx="30" cy="42" r="2.4" fill="#123"/>
        <path d="M24 56q6 8 16 6" stroke="#2C7C45" stroke-width="2" fill="none"/>
        <path d="M70 30v40M64 64l6 8 6-8" stroke="#12B886" stroke-width="3" fill="none"/>
        <path d="M60 30h20" stroke="#12B886" stroke-width="3" opacity=".5"/>`,
      );
    case "kingdoms": // 5계(다섯 색 원)
      return wrap(
        `${[
          ["#8A6BFF", 26, 30],
          ["#12B886", 48, 26],
          ["#F0913E", 70, 30],
          ["#2FA35F", 34, 60],
          ["#3182F6", 60, 60],
        ]
          .map(([c, x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${c}"/><circle cx="${(x as number) - 3}" cy="${(y as number) - 3}" r="3.4" fill="#fff" opacity=".4"/>`)
          .join("")}`,
      );
    case "species": // 종(말+당나귀=노새 ✕)
      return wrap(
        `<circle cx="30" cy="36" r="12" fill="url(#bma-g)"/>
        <circle cx="66" cy="36" r="12" fill="#C98A3C"/>
        <path d="M42 36h12" stroke="#5A6470" stroke-width="3"/>
        <path d="M48 50v10" stroke="#5A6470" stroke-width="3"/>
        <circle cx="48" cy="70" r="12" fill="#A88858"/>
        <path d="M40 62l16 16M56 62l-16 16" stroke="#F04452" stroke-width="3.4"/>`,
      );
    case "conserve": // 보전(손 위 새싹)
      return wrap(
        `<path d="M22 62q26 16 52 0" stroke="#2C7C45" stroke-width="4" fill="none"/>
        <path d="M22 62q-4 8 2 14h48q6-6 2-14" fill="url(#bma-g)" opacity=".3"/>
        <path d="M48 58V36" stroke="#2C7C45" stroke-width="3"/>
        <path d="M48 44q-12-2-14-14 12 0 14 8M48 40q10-2 12-12-10 0-12 6z" fill="url(#bma-g)"/>`,
      );
    case "web": // 먹이그물
      return wrap(
        `<g stroke="#8FA6C8" stroke-width="2"><path d="M24 68l16-12M40 56l18-8M58 48l16-14"/></g>
        <circle cx="24" cy="70" r="9" fill="url(#bma-g)"/>
        <circle cx="42" cy="54" r="8" fill="#8FCB5A"/>
        <circle cx="60" cy="46" r="8" fill="#5FB878"/>
        <circle cx="74" cy="32" r="9" fill="#B08D6A"/>
        <circle cx="30" cy="30" r="6" fill="url(#bma-sun)"/>`,
        `<radialGradient id="bma-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F5A028"/></radialGradient>`,
      );
    default:
      return wrap(`<circle cx="48" cy="48" r="18" fill="url(#bma-g)"/>`, green);
  }
}
