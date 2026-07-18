// continentMap — 대륙 단원(사회 Ⅱ~Ⅵ) 공용 지역 데이터 문법.
//   · regionPlaceLab(지역 구분 배치 랩)·socFigures2 지도 그림이 함께 쓰는 단일 진실 공급원.
//   · 좌표는 전부 [lon, lat](도) — ui/worldMap.generated.ts의 equirect(1000×500)와
//     lonToX/latToY로 변환한다. 새 대륙(유럽·아프리카…)은 ContinentDef 하나만 추가하면
//     랩·지도가 그대로 재사용된다(아시아 전용 하드코딩 금지).
//   · poly는 러프 국경 폴리곤 — 판정은 근접 스냅(snapDeg)이 흡수하므로 대강의 지리적
//     진실이면 충분하다. 단 지역끼리 겹치지 않게, 핵심부(수도·반도)는 확실히 덮게 그린다.

export interface ContinentCity {
  name: string;
  lon: number;
  lat: number;
  /** 도시 라벨 세로 오프셋(svg px, 라벨 스케일 곱해 적용) — 이웃 도시와 겹칠 때 도트 아래로 내린다(+). */
  labelDy?: number;
}

export interface ContinentRegion {
  id: string;
  name: string;
  color: string;
  /** 러프 국경 폴리곤([lon,lat]) — 판정·색칠 공용. 바다를 살짝 덮어도 무해(바다 판정이 우선). */
  poly: [number, number][];
  /** 스티커 안착점·특징 아이콘 위치(지역의 시각적 무게중심 근처 육지). */
  anchor: [number, number];
  /** 정착 시 도장처럼 찍히는 대표 도시(교과서 판서 표 기준). */
  cities: ContinentCity[];
  /** 특징 안경(힌트 렌즈) 아이콘 — 24×24 뷰박스 SVG. */
  hintIcon: string;
  /** 트레이 힌트(스티커를 들었을 때). */
  hint: string;
  /** 정착 성공 문구. */
  success: string;
  /** 오답 코미디 생성용 한 줄 정체("~의 땅"에 들어갈 구). */
  trait: string;
}

export interface ContinentDef {
  id: string;
  name: string;
  /** worldMap.generated 좌표계(1000×500)의 크롭 뷰박스. */
  crop: { x: number; y: number; w: number; h: number };
  /** 가로 모드 플래그 — true면 regionPlaceLab이 rotateStage 가로 무대로 연다(세로 인라인은
   *  지도가 작게 보인다는 실사용 피드백으로 아시아·유럽 모두 wide 전환). 세로 인라인 경로는
   *  세로로 긴 대륙(아프리카·아메리카 후보)을 위해 유지한다. */
  wide?: boolean;
  regions: ContinentRegion[];
  /** 어느 지역 폴리곤에도 없는 육지에 놓았을 때의 안내(대륙별 이웃 지리로 분기). */
  outsideMsg: (lon: number, lat: number) => string;
}

/* ---------- 좌표 변환(equirect 1000×500) ---------- */
export const lonToX = (lon: number): number => ((lon + 180) / 360) * 1000;
export const latToY = (lat: number): number => ((90 - lat) / 180) * 500;

/** svg 좌표 → lon/lat (worldMap.lonLatOf와 동일식 — 여기 두어 의존 방향 단순화). */
export const xToLon = (x: number): number => (x / 1000) * 360 - 180;
export const yToLat = (y: number): number => 90 - (y / 500) * 180;

/** poly([lon,lat][]) → svg path d 문자열. */
export function polyPath(poly: [number, number][]): string {
  return (
    poly.map(([lo, la], i) => `${i === 0 ? "M" : "L"}${lonToX(lo).toFixed(1)} ${latToY(la).toFixed(1)}`).join("") + "Z"
  );
}

/* ---------- 판정 기하(도 단위) ---------- */
/** ray casting — 점(lon,lat)이 폴리곤 안인가. */
export function pointInPoly(lon: number, lat: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** 점→폴리곤 경계 최소 거리(도) — 근접 스냅 판정용(내부면 0). */
export function distToPoly(lon: number, lat: number, poly: [number, number][]): number {
  if (pointInPoly(lon, lat, poly)) return 0;
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [x1, y1] = poly[j];
    const [x2, y2] = poly[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((lon - x1) * dx + (lat - y1) * dy) / len2)) : 0;
    const px = x1 + t * dx;
    const py = y1 + t * dy;
    best = Math.min(best, Math.hypot(lon - px, lat - py));
  }
  return best;
}

/* ---------- 특징 안경 아이콘(24×24) ---------- */
const ICON = {
  chip: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2.4" fill="#3A4658"/>
    <rect x="9" y="9" width="6" height="6" rx="1.4" fill="#8ED2F5"/>
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="#5A6B7E" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  rice: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21c-1-5-1-10 1-15" stroke="#5A8A2E" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M13 6q-3-1-4-4 3 0 4 4zM13.4 9q-3.4-.6-5-3.4 3.4-.2 5 3.4zM12.6 12q-3.6 0-5.6-2.6 3.4-.8 5.6 2.6z" fill="#8CAE5A"/>
    <path d="M13 6q2.6-1.6 5.4-.8-1.4 2.8-5.4.8zM13.4 9.4q3-.8 5.6.6-2 2.4-5.6-.6z" fill="#A8C86E"/>
  </svg>`,
  people: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="7" cy="8" r="3" fill="#E8A16A"/><circle cx="17" cy="8" r="3" fill="#C2843A"/><circle cx="12" cy="10.6" r="3.3" fill="#F5C89A"/>
    <path d="M3 20q1-6 5.4-6M21 20q-1-6-5.4-6M7.4 21q.8-6.4 4.6-6.4t4.6 6.4z" stroke="#8A6A3E" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  </svg>`,
  oil: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="9" width="11" height="12" rx="1.6" fill="#5A6B7E"/>
    <path d="M4 13h11M4 17h11" stroke="#3E4A5A" stroke-width="1.2"/>
    <ellipse cx="9.5" cy="9" rx="5.5" ry="1.8" fill="#7A8698"/>
    <path d="M18.5 10.5q3.5 4.2 0 6.6-3.5-2.4 0-6.6z" fill="#2E3A48"/>
    <ellipse cx="6.8" cy="11.5" rx="1.6" ry=".8" fill="#8A98AA" opacity=".8"/>
  </svg>`,
  camel: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20q0-5 3-6 1-4 4-4t4 4q3 1 3 6h-2.4l-.6-4-1.6 4h-1.6l-.4-3.6L10 20H8.2l-.6-4-1.2 4z" fill="#C2843A"/>
    <path d="M17.6 13q2.2-.4 2.6-3 .8-.4 1-1.6-1.2-.6-2 .2-1.6.2-2 2" stroke="#A06828" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M9 10q1.4-1.6 3-1.6 1.6 0 3 1.6" stroke="#A06828" stroke-width="1.6"/>
  </svg>`,
  factory: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20v-8l5 3v-3l5 3v-3l6 3.6V20z" fill="#8A5A5A" stroke="#6E4444" stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="5.5" y="6" width="3.2" height="6.5" rx="0.8" fill="#A06060"/>
    <path d="M6 5q-.6-2 1.1-2.6M8.4 4.6q2-.9 3 .8" stroke="#B8C4D2" stroke-width="1.7" stroke-linecap="round"/>
    <rect x="12.5" y="16" width="2.2" height="2.2" rx="0.5" fill="#F2D998"/>
    <rect x="16.6" y="16.4" width="2.2" height="2.2" rx="0.5" fill="#F2D998"/>
  </svg>`,
  hearthome: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 11 12 4l8 7v9H4z" fill="#E8EEF6" stroke="#5A7896" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M12 17.6q-3.6-2.3-3.6-4.4 0-1.7 1.7-1.7 1.2 0 1.9 1.1.7-1.1 1.9-1.1 1.7 0 1.7 1.7 0 2.1-3.6 4.4z" fill="#E2574C"/>
  </svg>`,
  sunwave: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="10" r="4.2" fill="#F2C24E"/>
    <path d="M12 2.6v2M4.9 5.5l1.5 1.4M19.1 5.5l-1.5 1.4M2.6 11.4h2.2M19.2 11.4h2.2" stroke="#E8A104" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M3 18q2.2-2.2 4.5 0t4.5 0q2.2-2.2 4.5 0t4.5 0" stroke="#3F8FC8" stroke-width="2" stroke-linecap="round"/>
    <path d="M5 21q2.2-2.2 4.5 0t4.5 0q2.2-2.2 4.5 0" stroke="#6FB2DE" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  sprout: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 19h18" stroke="#8A6A3E" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 19v-7" stroke="#4E8A2E" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M12 12q-.6-4.4-5-4.8 0 4.6 5 4.8zM12 10q.4-4 4.6-4.4 .2 4.2-4.6 4.4z" fill="#6FB24E"/>
    <path d="M6 19q0-2.4 1.6-2.4T9.2 19M15 19q0-2.4 1.6-2.4T18.2 19" stroke="#C2A54E" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
};

/* ---------- 아시아(사회 Ⅱ) — 다섯 지역 ---------- */
// 지역 구분·대표 도시는 미래엔 판서 표(비상 필기 노트와 일치): 동아시아(세계 경제 주도) ·
// 동남아시아(문화·민족 다양성) · 남부 아시아(세계 최고 인구 밀집) · 서남아시아(이슬람 문화권) ·
// 중앙아시아(동서 문명 교차로). 아프가니스탄은 서남아시아 폴리곤에 둔다(교과서 지도 관례).
const ASIA: ContinentDef = {
  id: "asia",
  name: "아시아",
  // lon 25~150 · lat 56~-12 크롭 — 시베리아 남단 띠(러시아)는 "다섯 지역 밖" 안내용으로 남긴다.
  crop: { x: 569, y: 94, w: 348, h: 190 },
  wide: true, // 세로 인라인에선 지도가 작다는 실사용 피드백 — 유럽과 같이 가로 모드로
  regions: [
    {
      id: "east",
      name: "동아시아",
      color: "#E2574C",
      poly: [
        [73, 39], [76, 43], [83, 47], [90, 48], [98, 52], [108, 52], [116, 50], [120, 53],
        [127, 50], [135, 48.5], [141, 46], [146, 44.5], [147, 41], [143, 38], [141, 34],
        [134, 32], [130, 30], [128, 25.5], [122, 21.5], [119, 22.5], [116, 21], [110, 19],
        [107, 21], [105, 22.5], [101, 21.5], [98, 24], [97, 27], [92, 27.5], [85, 28],
        [80, 30], [78, 32.5], [75, 35],
      ],
      anchor: [107, 36],
      cities: [
        { name: "서울", lon: 126.98, lat: 37.57 },
        { name: "베이징", lon: 116.4, lat: 39.9 },
        { name: "도쿄", lon: 139.7, lat: 35.68 },
      ],
      hintIcon: ICON.chip,
      hint: "우리나라가 속한 지역 — 세계 경제를 주도해요.",
      success: "동아시아 완성! 우리나라·중국·일본이 세계 경제를 주도하고, 서울·베이징·도쿄가 그 심장이에요.",
      trait: "우리나라·중국·일본이 모여 세계 경제를 주도하는",
    },
    {
      id: "southeast",
      name: "동남아시아",
      color: "#2E9E5B",
      poly: [
        [92, 23], [95, 26], [98, 25.5], [101, 21], [105, 22], [107.5, 20.5], [108, 17],
        [117, 7], [117, 19], [122, 19.5], [127, 7], [132, -1], [141, -2.5], [141, -9.5],
        [133, -9], [127, -9.5], [120, -11], [113, -9.5], [104, -7], [98, -1], [94, 7], [92, 15],
      ],
      anchor: [102, 15],
      cities: [
        { name: "자카르타", lon: 106.8, lat: -6.2 },
        { name: "하노이", lon: 105.85, lat: 21.03 },
        { name: "싱가포르", lon: 103.85, lat: 1.29 },
      ],
      hintIcon: ICON.rice,
      hint: "덥고 비가 많아 벼농사가 발달 — 여러 문화와 민족이 어우러져요.",
      success: "동남아시아 완성! 벼농사의 땅이자 다양한 문화·민족이 어우러진 바다의 교차로예요.",
      trait: "벼농사와 다양한 문화·민족의",
    },
    {
      id: "south",
      name: "남부 아시아",
      color: "#F2A72E",
      poly: [
        [61, 25.5], [62, 29.5], [66, 30], [69.5, 32], [71, 34], [73, 36.8], [76, 35],
        [78, 32], [81, 30], [85, 28.5], [88, 28], [92, 27.5], [94, 27.5], [96, 28.5],
        [97, 27], [94, 24], [92, 21.5], [89, 21.5], [87, 21], [80, 15.5], [80, 5.5],
        [77, 7], [72.5, 19], [69, 22], [66, 24.5], [62, 25],
      ],
      anchor: [78, 22],
      cities: [
        { name: "뭄바이", lon: 72.88, lat: 19.08 },
        { name: "이슬라마바드", lon: 73.07, lat: 33.69 },
      ],
      hintIcon: ICON.people,
      hint: "세계에서 사람이 가장 많이 모여 사는 지역이에요.",
      success: "남부 아시아 완성! 인도·파키스탄 — 세계에서 인구가 가장 많이 모여 사는 지역이에요.",
      trait: "세계에서 인구가 가장 많이 모여 사는",
    },
    {
      id: "southwest",
      name: "서남아시아",
      color: "#8A5AC2",
      poly: [
        [26, 40.5], [29, 41.5], [35, 42.5], [41.5, 43], [46, 42], [50, 41], [52, 39],
        [54, 38], [58, 38.5], [62, 36], [65, 37], [68, 38], [71.5, 36.5], [71, 34],
        [69.5, 32], [66, 30], [62, 29.5], [61, 25.5], [57, 25.5], [56, 24], [58.5, 22],
        [59.8, 16.5], [53, 12.5], [43.5, 12.5], [42.5, 15], [39, 21], [34.5, 28],
        [34.2, 31.3], [36, 36.5], [30, 36.5], [26, 38.5],
      ],
      anchor: [46, 19.5],
      cities: [
        { name: "메카", lon: 39.83, lat: 21.42 },
        { name: "두바이", lon: 55.3, lat: 25.27 },
      ],
      hintIcon: ICON.oil,
      hint: "사막이 넓고 석유가 풍부한 이슬람 문화권이에요.",
      success: "서남아시아 완성! 사막과 석유의 땅 — 이슬람교의 성지 메카가 여기 있어요.",
      trait: "사막과 석유, 이슬람 문화권의",
    },
    {
      id: "central",
      name: "중앙아시아",
      color: "#3F8FC8",
      poly: [
        [46.8, 49], [50, 51.5], [55, 54], [61, 54.5], [69, 55.5], [77, 54], [80, 51],
        [85, 50], [87, 49], [85, 47], [80, 44.5], [76, 42.5], [74, 40], [73.5, 38],
        [71, 37.5], [68, 37.8], [65, 37.5], [62, 36], [58, 38], [54, 38.5], [52.5, 40.5],
        [50, 44], [48, 46.5],
      ],
      anchor: [64, 46],
      cities: [
        { name: "사마르칸트", lon: 66.98, lat: 39.65 },
        { name: "아스타나", lon: 71.43, lat: 51.17 },
      ],
      hintIcon: ICON.camel,
      hint: "초원의 실크로드 — 동서 문명이 오간 교차로예요.",
      success: "중앙아시아 완성! 초원의 실크로드로 동서 문명이 오간 교차로 — 사마르칸트가 그 중심이었어요.",
      trait: "초원 실크로드로 동서 문명을 이어 온",
    },
  ],
  outsideMsg: (lon, lat) => {
    if (lat > 48 && lon > 55) return "여긴 러시아(시베리아) — 아시아 땅이지만 다섯 지역 구분 밖이에요. 조금 남쪽으로!";
    if (lon < 27.5 && lat > 38) return "여긴 유럽이에요 — 아시아는 여기서 동쪽!";
    if ((lon < 37 && lat < 32.5) || (lon < 52 && lat < 13)) return "바다 건너 여긴 아프리카 — 아시아로 돌아와요!";
    return "다섯 지역의 경계 어디쯤이네요 — 지역 한가운데를 노려 봐요!";
  },
};

/* ---------- 유럽(사회 Ⅲ) — 네 지역 ---------- */
// 지역 구분·대표 도시는 미래엔 판서 표(비상 필기 노트와 일치): 서부(근대화·산업화 주도) ·
// 북부(사회 복지 제도) · 남부(연중 따뜻한 기후) · 동부(러시아·새로운 시장).
// 러시아 경계: 두 교과서 모두 러시아(모스크바)를 동부 유럽에 포함 — 동부 폴리곤을 우랄(60°E)
// 서쪽까지 덮고, 우랄 너머·튀르키예·캅카스는 outsideMsg 분기(아시아 안내)로 처리한다.
// 덴마크는 북부, 발트 3국은 동부 폴리곤에 두되(교과서 미명시 — 러프 경계 재량) 스냅이 흡수.
const EUROPE: ContinentDef = {
  id: "europe",
  name: "유럽",
  // lon -25~62.9 · lat 72~33.1 크롭 — 아이슬란드(북부 관광 도시 레이캬비크)까지 포함,
  // 지중해 남안(북아프리카)·아나톨리아(튀르키예) 가장자리는 outsideMsg 안내용으로 남긴다.
  crop: { x: 430, y: 50, w: 244, h: 108 },
  wide: true, // 2.26:1 — 세로 인라인에선 지도가 납작해 가로 모드로 배치한다(사용자 피드백)
  regions: [
    {
      id: "west",
      name: "서부 유럽",
      color: "#E2574C",
      poly: [
        [-11, 50.5], [-11, 55.8], [-5, 59], [1.5, 58.8], [2, 55.5], [5.5, 55], [9, 55],
        [15, 54.5], [14.5, 51.5], [12, 50], [13.5, 48.8], [16.9, 48.6], [17, 46.6],
        [13, 45.8], [9, 45.6], [6.5, 45.8], [6.8, 44], [7.5, 43.6], [3, 42.2],
        [-2, 43.2], [-5, 48], [-6, 49.5],
      ],
      anchor: [0.8, 45.2],
      cities: [
        { name: "런던", lon: -0.13, lat: 51.51 },
        { name: "파리", lon: 2.35, lat: 48.86 },
        { name: "베를린", lon: 13.41, lat: 52.52 },
      ],
      hintIcon: ICON.factory,
      hint: "세계의 근대화와 산업화를 이끈 지역이에요.",
      success: "서부 유럽 완성! 근대화와 산업화를 이끈 심장 — 런던·파리·베를린이 그 무대예요.",
      trait: "세계의 근대화와 산업화를 이끈",
    },
    {
      id: "north",
      name: "북부 유럽",
      color: "#3F8FC8",
      poly: [
        [-25, 62.5], [-25, 67.5], [-16, 68], [-8, 66], [10, 71.5], [26, 71.5], [31.5, 70],
        [31, 66], [30, 61], [26, 60], [22, 59], [17, 58.5], [12.5, 57], [13, 54.6],
        [10.5, 54.5], [8, 55], [7.5, 57.5], [4.8, 58], [-2, 62],
      ],
      anchor: [17, 66.2],
      cities: [
        { name: "오슬로", lon: 10.75, lat: 59.91 },
        { name: "스톡홀름", lon: 18.07, lat: 59.33, labelDy: 14 },
        { name: "헬싱키", lon: 24.94, lat: 60.17 },
      ],
      hintIcon: ICON.hearthome,
      hint: "사회 복지 제도가 잘 갖춰진 지역이에요.",
      success: "북부 유럽 완성! 복지 제도가 잘 갖춰진 나라들 — 수도는 온화한 남부 해안을 따라 모여 있어요.",
      trait: "사회 복지 제도가 잘 갖춰진",
    },
    {
      id: "south",
      name: "남부 유럽",
      color: "#F2A72E",
      poly: [
        [-10, 36.8], [-9.5, 43], [-2, 43.2], [3, 42.2], [7.5, 43.6], [6.8, 44], [9, 45.6],
        [13, 45.8], [17, 46.6], [19, 46], [21, 44.8], [26, 43.8], [28.5, 43.6], [28.5, 41.5],
        [26, 40], [24, 38], [26.5, 36.2], [24, 34.6], [19, 36.5], [15, 36.2], [12, 37.5],
        [8, 38.5], [-6, 35.8],
      ],
      // 앵커를 이베리아(-3.8,39.2)→그리스로 소급 이동(2026-07-19 감사): 지역명 라벨이
      // "서부 유럽" 라벨·바르셀로나 라벨과 한 곳에 몰려 바르셀로나가 서부 소속처럼 읽혔다.
      anchor: [22, 39.5],
      cities: [
        { name: "바르셀로나", lon: 2.17, lat: 41.38, labelDy: 14 },
        { name: "로마", lon: 12.5, lat: 41.9 },
      ],
      hintIcon: ICON.sunwave,
      hint: "연중 따뜻한 기후 — 지중해와 맞닿은 지역이에요.",
      success: "남부 유럽 완성! 연중 따뜻한 지중해의 땅 — 로마·바르셀로나가 관광객을 부르죠.",
      trait: "연중 따뜻한 지중해의",
    },
    {
      id: "east",
      name: "동부 유럽",
      color: "#2E9E5B",
      poly: [
        [14.2, 54], [19, 54.8], [21, 56], [24, 58.5], [27.5, 59.7], [31, 60.5], [36, 61.5],
        [44, 62], [50, 63], [56, 63], [60, 62], [60, 55], [59, 50], [55, 48], [50, 46],
        [48, 44], [44, 43], [40, 43.5], [36.5, 45], [33, 44.3], [30, 45], [28.5, 43.6],
        [26, 43.8], [21, 44.8], [19, 46], [17, 46.6], [16.9, 48.6], [13.5, 48.8], [12, 50],
        [14.5, 51.5], [15, 54.5],
      ],
      anchor: [33, 50.5],
      cities: [
        { name: "모스크바", lon: 37.62, lat: 55.75 },
        // 바르샤바도 도트 아래로(2026-07-19 감사) — 위 라벨끼리 베를린과 맞닿아 한 단어처럼 읽혔다.
        { name: "바르샤바", lon: 21.01, lat: 52.23, labelDy: 14 },
        { name: "프라하", lon: 14.42, lat: 50.08, labelDy: 14 },
      ],
      hintIcon: ICON.sprout,
      hint: "가장 넓은 나라 러시아가 있는, 새로운 시장으로 떠오르는 지역이에요.",
      success: "동부 유럽 완성! 세계에서 가장 넓은 러시아, 그리고 새 시장으로 떠오르는 폴란드·체코의 땅이에요.",
      trait: "새로운 시장으로 떠오르는",
    },
  ],
  outsideMsg: (lon, lat) => {
    if (lon > 58 && lat > 44) return "여긴 우랄산맥 너머 — 아시아(시베리아)로 넘어갔어요. 유럽은 서쪽!";
    if (lat < 37.5 && lon < 20) return "바다 건너 여긴 아프리카 — 유럽으로 돌아와요!";
    if (lon > 25 && lat < 42.5) return "여긴 튀르키예 부근 — 두 대륙에 걸친 땅으로, 보통 아시아로 다뤄요. 유럽은 북서쪽!";
    return "네 지역의 경계 어디쯤이네요 — 지역 한가운데를 노려 봐요!";
  },
};

export const CONTINENTS: Record<string, ContinentDef> = { asia: ASIA, europe: EUROPE };
