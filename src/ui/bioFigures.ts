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
  systemCirc: "circulatory", bodyDog: "dog",
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
