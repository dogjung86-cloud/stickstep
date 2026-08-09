// plant3Kit — 중2 Ⅴ 「식물과 에너지」 v3 공용 킷.
// 색·경로 헬퍼의 단일 진실 공급원 — 랩·그림·콘텐츠가 함께 쓴다.
// 판정 선택지는 ui/bio4Kit의 b4Ask 공용을 그대로 쓴다(재구현 금지).
// (현행 unit5 계열(plantKit·plantFigures)과 v2 계열(plantKit2 등)은 비교 대상 보존 — 참조 금지.)

/** v3 전용 팔레트 — 물질·기체·에너지 색의 시맨틱을 여기서만 정한다. */
export const P3 = {
  leaf: "#12B886", // 단원 액센트(--subj-bio와 동일값 — SVG 하드코딩용)
  leafDeep: "#0CA678",
  ink: "#191F28",
  chloro: "#2F9E44", // 엽록체(진초록)
  chloroLight: "#8CE99A",
  light: "#FFC940", // 빛에너지(해 노랑)
  o2: "#4DABF7", // 산소(하늘색)
  co2: "#845EF7", // 이산화 탄소(회보라)
  water: "#22B8CF", // 물(청록)
  glucose: "#FF922B", // 포도당(귤색)
  starch: "#364FC7", // 녹말(아이오딘 청람색 계열)
  sugar: "#F59F00", // 설탕(앰버)
  energy: "#FFD43B", // 에너지(옐로)
  night: "#39445B", // 밤 톤
  soil: "#846358",
  danger: "#F04452",
} as const;

/** 발주 이미지 베이스(public/plant3/...) — lazy 금지(스크롤 컨테이너 사고 14). */
export const P3_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/") + "plant3/";
