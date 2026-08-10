// body3Kit — 중2 Ⅵ 「동물과 에너지」 v3 공용 킷.
// 색·경로 헬퍼의 단일 진실 공급원 — 랩·그림·콘텐츠가 함께 쓴다.
// 판정 선택지는 ui/bio4Kit의 b4Ask 공용을 그대로 쓴다(재구현 금지).
// (현행 unit6 계열(bodyKit·bodyFigures)과 v2 계열(animalKit 등)은 비교 대상 보존 — 참조 금지.)

/** v3 전용 팔레트 — 영양소·기체·혈액·반응색의 시맨틱을 여기서만 정한다.
 *  기체·양분 색은 중2 Ⅴ v3(plant3Kit)과 동일값 — 같은 학생이 두 단원을 오가므로 색 언어를 통일한다. */
export const B6 = {
  body: "#E23B4B", // 단원 액센트(--subj-body와 동일값 — SVG 하드코딩용)
  ink: "#191F28",
  // 영양소 토큰
  carb: "#F59F00", // 탄수화물(앰버)
  protein: "#7048E8", // 단백질(바이올렛)
  fat: "#FD7E14", // 지방(오렌지)
  vitamin: "#2F9E44", // 바이타민(그린)
  mineral: "#868E96", // 무기염류(스틸)
  water: "#22B8CF", // 물(청록 — plant3와 동일)
  // 소화 산물
  glucose: "#FF922B", // 포도당(귤색 — plant3와 동일)
  amino: "#9775FA", // 아미노산(연보라)
  fatty: "#E8A80C", // 지방산·모노글리세라이드(딥앰버)
  // 기체·에너지
  o2: "#4DABF7", // 산소(하늘색 — plant3와 동일)
  co2: "#845EF7", // 이산화 탄소(회보라 — plant3와 동일)
  energy: "#FFD43B", // 에너지(옐로 — plant3와 동일)
  urea: "#A9832B", // 요소(황토 — 노폐물)
  // 혈액
  oxyBlood: "#F03E3E", // 산소 많은 혈액(선홍)
  deoxyBlood: "#A61E4D", // 산소 적은 혈액(암적)
  // 검출 반응색(교과서 그림 VI-2)
  iodine: "#364FC7", // 아이오딘 반응 청람색
  benedict: "#E8590C", // 베네딕트 반응 황적색
  biuret: "#6741D9", // 뷰렛 반응 보라색
  sudan: "#F03E3E", // 수단 III 반응 선홍색
  night: "#39445B",
  danger: "#F04452",
} as const;

/** 발주 이미지 베이스(public/body3/...) — lazy 금지(스크롤 컨테이너 사고 14). */
export const B6_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/") + "body3/";
