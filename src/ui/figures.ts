// SVG 그림 라이브러리 — 프리미엄 아트(art.generated.ts)를 앱 좌표계에 연결.
// 세포 구조도(라벨용), 생물 아이콘(분류·검색표용), 게임 지도 장식.
import { ART_BIO, ART_CELLS, ART_DECOR } from "./art.generated";

// 핫스팟 좌표는 스테이지(패딩 포함) 기준 %로 맞춰 놓았다.
const PADX = 3.6, PADY = 5.5, SPX = 92.8, SPY = 89;
export function spot(x: number, y: number, w: number, h: number, label: string, desc?: string) {
  return { x: PADX + (x / w) * SPX, y: PADY + (y / h) * SPY, label, desc };
}

// ---------- 세포 구조도 (아트의 소기관 좌표에 맞춘 핫스팟) ----------
export const animalCell = {
  svg: ART_CELLS.animalCell,
  spots: [
    spot(30, 152, 320, 210, "세포막", "세포를 둘러싸 안과 밖을 구분하고 물질 출입을 조절해요."),
    spot(150, 92, 320, 210, "핵", "유전물질이 들어 있어 세포의 생명활동을 조절해요."),
    spot(225, 62, 320, 210, "마이토콘드리아", "생명활동에 필요한 에너지를 만들어요."),
  ],
};

export const plantCell = {
  svg: ART_CELLS.plantCell,
  spots: [
    spot(160, 12, 320, 210, "세포벽", "식물세포의 세포막 바깥에 있으며, 두껍고 단단해 세포를 보호해요."),
    spot(24, 96, 320, 210, "세포막", "세포 안과 밖으로 물질이 드나드는 것을 조절해요."),
    spot(116, 82, 320, 210, "핵", "유전물질이 들어 있어 생명활동을 조절해요."),
    spot(78, 152, 320, 210, "마이토콘드리아", "생명활동에 필요한 에너지를 만들어요."),
    spot(222, 150, 320, 210, "엽록체", "초록색을 띠며, 빛에너지를 흡수해 광합성으로 양분을 만들어요."),
  ],
};

// ---------- 생물 아이콘 ----------
export const bio = ART_BIO;

// 대표 생물 이름 → 아이콘 키 매핑(없으면 fallback)
const NAME_ICON: Record<string, string> = {
  대장균: "bacteria", 포도상구균: "bacteria", 젖산균: "bacteria",
  아메바: "amoeba", 짚신벌레: "paramecium", 해캄: "algae", 다시마: "algae",
  송이버섯: "mushroom", 버섯: "mushroom", 푸른곰팡이: "mold", 효모: "yeast",
  우산이끼: "fern", 소나무: "pine", 진달래: "flower", 고사리: "fern",
  명아주: "grass", 강아지풀: "grass", 보리: "grass", 벚나무: "tree", 은행나무: "tree", 느티나무: "tree",
  말미잘: "anemone", 지렁이: "worm", 꿀벌: "bee", 박새: "bird", 까치: "bird", 갈매기: "bird",
  개: "dog", 고래: "fish", 붕어: "fish", 금붕어: "fish", 오징어: "anemone",
  개구리: "frog", 고양이: "cat", 들고양이: "cat", 박쥐: "bird", 다람쥐: "dog", 달팽이: "snail",
};

export function organism(name: string): string {
  const key = NAME_ICON[name];
  return (key && ART_BIO[key]) || ART_BIO.amoeba || "";
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

// 과학자 얼굴(과학사 사례용, 중립 실루엣)
export function scientist(): string {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sci-bg" cx="50%" cy="35%" r="75%"><stop offset="0%" stop-color="#F3F7FD"/><stop offset="100%" stop-color="#DCE6F3"/></radialGradient><linearGradient id="sci-fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C4D0E0"/><stop offset="100%" stop-color="#A9B8CC"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#sci-bg)"/><circle cx="24" cy="19" r="8" fill="url(#sci-fg)"/><path d="M9 41c1-8 7-12 15-12s14 4 15 12z" fill="url(#sci-fg)"/></svg>`;
}
