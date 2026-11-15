// SVG 그림 라이브러리 — 프리미엄 아트(art.generated.ts)를 앱 좌표계에 연결.
// 세포 구조도(라벨용), 생물 아이콘(분류·검색표용), 게임 지도 장식.
import { ART_BIO, ART_CELLS, ART_DECOR } from "./art.generated";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

// ---------- 세포 구조도 (발주 일러스트 + 부위별 핫스팟 좌표) ----------
// svg 필드는 hotspot 렌더러가 innerHTML로 받는다 — 발주 이미지 <img>를 넣고,
// 좌표는 이미지 기준 %(스테이지 패딩 0이라 이미지 %와 일치, 스크린샷으로 정렬).
// 폴백: 이미지 로드 실패 시 손코딩 SVG(ART_CELLS)로 우아하게 대체.
const cellImg = (file: string, alt: string): string => {
  const fb = `<svg viewBox='0 0 320 210' xmlns='http://www.w3.org/2000/svg'>${ART_CELLS[file === "animal" ? "animalCell" : "plantCell"]}</svg>`;
  return `<img src="${base}bio2/cells/${file}.webp" alt="${alt}" onerror="this.outerHTML=this.getAttribute('data-fb')" data-fb="${fb.replace(/"/g, "&quot;")}"/>`;
};

export const animalCell = {
  svg: cellImg("animal", "동물세포"),
  spots: [
    { x: 12, y: 47, label: "세포막", desc: "세포를 둘러싸 안과 밖을 구분하고 물질 출입을 조절해요." },
    { x: 35, y: 32, label: "핵", desc: "유전물질이 들어 있어 세포의 생명활동을 조절해요." },
    { x: 51, y: 68, label: "마이토콘드리아", desc: "생명활동에 필요한 에너지를 만들어요." },
  ],
};

export const plantCell = {
  svg: cellImg("plant", "식물세포"),
  spots: [
    { x: 50, y: 8, label: "세포벽", desc: "식물세포의 세포막 바깥에 있으며, 두껍고 단단해 세포를 보호해요." },
    { x: 20, y: 20, label: "세포막", desc: "세포 안과 밖으로 물질이 드나드는 것을 조절해요." },
    { x: 48, y: 30, label: "핵", desc: "유전물질이 들어 있어 생명활동을 조절해요." },
    { x: 26, y: 34, label: "마이토콘드리아", desc: "생명활동에 필요한 에너지를 만들어요." },
    { x: 31, y: 72, label: "엽록체", desc: "초록색을 띠며, 빛에너지를 흡수해 광합성으로 양분을 만들어요." },
  ],
};

// ---------- 생물 아이콘 ----------
export const bio = ART_BIO;

// 대표 생물 이름 → 아이콘 키 매핑(없으면 fallback)
const NAME_ICON: Record<string, string> = {
  대장균: "bacteria", 포도상구균: "coccus", 젖산균: "bacillus",
  아메바: "amoeba", 짚신벌레: "paramecium", 해캄: "algae", 다시마: "algae",
  송이버섯: "mushroom", 버섯: "mushroom", 푸른곰팡이: "mold", 효모: "yeast",
  우산이끼: "fern", 소나무: "pine", 진달래: "flower", 고사리: "fern",
  명아주: "grass", 강아지풀: "grass", 보리: "grass", 벚나무: "tree", 은행나무: "tree", 느티나무: "tree",
  말미잘: "anemone", 지렁이: "worm", 꿀벌: "bee", 박새: "bird", 까치: "bird", 갈매기: "bird",
  개: "dog", 붕어: "fish", 금붕어: "fish",
  개구리: "frog", 고양이: "cat", 들고양이: "cat", 달팽이: "snail",
};

// 발주 일러스트가 있는 아이콘 키(public/bio/<key>.webp). 5계 분류 학습용 13종.
// 이 키는 실제 발주(codex)로 만든 밝은 교육 일러스트 — 조잡한 픽토그램 SVG를 대체한다.
const BIO_PHOTO = new Set([
  "bacteria", "amoeba", "paramecium", "algae", "mushroom", "mold",
  "yeast", "pine", "fern", "flower", "fish", "bee", "bird",
]);

// 세균 두 가지는 코드 그림(2026-11-15 그래픽 손질). 발주 그림 bacteria.webp는 편모가 달린 막대균(대장균)이라
// 젖산균(편모 없는 막대균이 짧게 이어진 것)과 포도상구균(공 모양 세균이 포도송이처럼 모인 것)에 맞지 않았다.
// 발주 그림과 같은 결(흰 바탕, 왼쪽 위 빛의 둥근 입체, 옅은 바닥 그림자)로 그린다. 그라데이션 id는 부를 때마다 새로 붙인다.
let codeBioN = 0;
const CODE_BIO: Record<string, (name: string) => string> = {
  bacillus: (name) => {
    const g = `cbB${++codeBioN}`;
    // 짧게 이어진 막대 사슬 둘(셋, 둘). 막대 길이 16, 굵기 8.5
    const rod = (x: number, y: number, a: number): string =>
      `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-8" y="-4.25" width="16" height="8.5" rx="4.25" fill="url(#${g})" stroke="#1F7A55" stroke-width=".8" stroke-opacity=".55"/>` +
      `<path d="M-4.6 -1.9H3.6" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".55"/></g>`;
    const chain = (x: number, y: number, a: number, n: number): string => {
      const r = (a * Math.PI) / 180;
      return Array.from({ length: n }, (_, i) => rod(x + Math.cos(r) * 17.4 * i, y + Math.sin(r) * 17.4 * i, a)).join("");
    };
    return `<svg class="bio-ico" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name}">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A6E9C9"/><stop offset=".5" stop-color="#3DBA87"/><stop offset="1" stop-color="#1D8A5D"/></linearGradient></defs>
      <rect width="64" height="64" rx="12" fill="#fff"/>
      <ellipse cx="33" cy="57" rx="23" ry="2.6" fill="#2A3A5E" opacity=".08"/>
      ${chain(13.5, 41, -34, 3)}${chain(31, 46, 17, 2)}
    </svg>`;
  },
  coccus: (name) => {
    const g = `cbC${++codeBioN}`;
    // 크기가 조금씩 다른 공 모양 세균이 송이로 모였다(뒤에서 앞으로 그린다)
    const balls: [number, number, number][] = [
      [25, 16, 5.4], [36, 14.5, 5.8], [46, 20, 5.2],
      [18.5, 25.5, 5.8], [29.5, 24.5, 6.2], [40.5, 27, 6], [50.5, 30.5, 5.3],
      [23.5, 35.5, 6], [34.5, 36, 6.4], [45.5, 39.5, 5.8],
      [12.5, 44.5, 4.8], [28.5, 46, 5.9], [39.5, 48, 5.6], [51.5, 50.5, 4.4],
    ];
    const ball = ([x, y, r]: [number, number, number]): string =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})" stroke="#5B3FC4" stroke-width=".7" stroke-opacity=".55"/>` +
      `<ellipse cx="${(x - r * 0.36).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" rx="${(r * 0.3).toFixed(1)}" ry="${(r * 0.22).toFixed(1)}" fill="#fff" opacity=".7"/>`;
    return `<svg class="bio-ico" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name}">
      <defs><radialGradient id="${g}" cx=".36" cy=".32" r=".74"><stop offset="0" stop-color="#EEE8FF"/><stop offset=".5" stop-color="#9C82F7"/><stop offset="1" stop-color="#6245D3"/></radialGradient></defs>
      <rect width="64" height="64" rx="12" fill="#fff"/>
      <ellipse cx="32" cy="58" rx="22" ry="2.6" fill="#2A3A5E" opacity=".08"/>
      ${balls.map(ball).join("")}
    </svg>`;
  },
};

export function organism(name: string): string {
  const key = NAME_ICON[name];
  if (key && CODE_BIO[key]) return CODE_BIO[key](name);
  if (key && BIO_PHOTO.has(key)) {
    // 발주 일러스트 우선. 로드 실패 시 부드럽게 숨겨 깨진 이미지 아이콘을 피한다.
    return `<img class="bio-ico" src="${base}bio/${key}.webp" alt="${name}" onerror="this.classList.add('bio-ico-broken')"/>`;
  }
  return (key && ART_BIO[key]) || "";
}

// ---------- 게임 지도 장식 ----------
export function decor(key: string): string {
  return ART_DECOR[key] || "";
}
export const DECOR_KEYS = Object.keys(ART_DECOR);

// 스틱맨 쌤 — 만화 컷의 주인공과 같은 결. 손그림 느낌의 흑선 스틱 과학자.
export function stickman(): string {
  return `<svg viewBox="0 0 120 152" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1B2430" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="60" cy="145" rx="30" ry="5" fill="#1B2430" stroke="none" opacity=".08"/>
    <circle cx="60" cy="28" r="18" fill="#fff"/>
    <circle cx="52.5" cy="27" r="5.2" fill="#fff" stroke-width="2.6"/>
    <circle cx="67.5" cy="27" r="5.2" fill="#fff" stroke-width="2.6"/>
    <path d="M57.7 26.5h4.6" stroke-width="2.2"/>
    <path d="M47.3 26.2l-3.6-1.4M72.7 26.2l3.6-1.4" stroke-width="2.2"/>
    <circle cx="52.5" cy="27.4" r="1.5" fill="#1B2430" stroke="none"/>
    <circle cx="67.5" cy="27.4" r="1.5" fill="#1B2430" stroke="none"/>
    <path d="M54 37q6 4 12 0" stroke-width="2.4"/>
    <path d="M60 46v6"/>
    <path d="M44 60q16-10 32 0l-2 60H46z" fill="#fff"/>
    <path d="M60 52l-6 8M60 52l6 8"/>
    <path d="M60 60v58" stroke-width="2"/>
    <path d="M46 66l-12 30 3 4" />
    <path d="M74 64l18-16 5 3" />
    <path d="M52 120l-3 26M68 120l3 26"/>
    <path d="M45 147l7-2M74 147l-7-2" stroke-width="3"/>
    <path d="M66 79h6" stroke="#F04452" stroke-width="2.6"/>
  </svg>`;
}

// 스틱맨 머리(캡션 옆 아바타용)
export function stickmanHead(): string {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#1B2430" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="24" cy="21" r="15" fill="#fff"/>
    <circle cx="18" cy="20" r="4.4" fill="#fff" stroke-width="2.2"/>
    <circle cx="30" cy="20" r="4.4" fill="#fff" stroke-width="2.2"/>
    <path d="M22.4 19.6h3.2" stroke-width="1.8"/>
    <circle cx="18" cy="20.3" r="1.3" fill="#1B2430" stroke="none"/>
    <circle cx="30" cy="20.3" r="1.3" fill="#1B2430" stroke="none"/>
    <path d="M19 29q5 3.5 10 0" stroke-width="2"/>
    <path d="M12 44q12-9 24 0" stroke-width="2.6" fill="#fff"/>
  </svg>`;
}

/** 말풍선 뿔 꼬리(cut-bubble tail: "right"|"left" 변형) — 작은 꼭지 대신 만화 관용의 긴 스윕 삼각형.
 *  밑변(y0 행)이 몸통 아래 테두리 위에 겹쳐 흰 채움으로 지우고 바깥 두 변만 스트로크해,
 *  몸통 테두리와 이음새 없이 이어진다. 위치·반전은 ui.css .cut-tail 규칙 몫(comic.ts·dsl.ts cut() 공용).
 *  선 굵기는 몸통 테두리와 동일 1.6 고정 — 두 변이 일찍 모이면 끝쪽이 먹선 덩어리로 합쳐져 굵어 보이므로,
 *  밑변 대비 충분히 긴 스윕(흰 속이 끝까지 유지) + 끝만 미터 조인 뾰족점으로 잡은 기하다(둥근 캡 금지). */
export function cutTailHorn(): string {
  return (
    `<svg class="cut-tail" viewBox="0 0 70 34" aria-hidden="true">` +
    `<path d="M1 0 L62 27 L30 0 Z" fill="#FFFFFF"/>` +
    `<path d="M1 0 L62 27 L30 0" fill="none" stroke="#39424E" stroke-width="1.6" stroke-linejoin="miter" stroke-miterlimit="8"/>` +
    `</svg>`
  );
}

// 과학자 얼굴(과학사 사례용, 중립 실루엣)
export function scientist(): string {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sci-bg" cx="50%" cy="35%" r="75%"><stop offset="0%" stop-color="#F3F7FD"/><stop offset="100%" stop-color="#DCE6F3"/></radialGradient><linearGradient id="sci-fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C4D0E0"/><stop offset="100%" stop-color="#A9B8CC"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#sci-bg)"/><circle cx="24" cy="19" r="8" fill="url(#sci-fg)"/><path d="M9 41c1-8 7-12 15-12s14 4 15 12z" fill="url(#sci-fg)"/></svg>`;
}
