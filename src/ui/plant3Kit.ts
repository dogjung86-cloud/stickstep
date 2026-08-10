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

// ── 상추 로제트 페인터(공용) ────────────────────────────────────────
// "상추라고 명명한 그림이 상추로 안 보인다"(2026-08-10 사용자 피드백)의 해법.
// 주름(스캘럽) 가장자리 잎을 계산으로 겹쳐 그린다 — gasCross·starchQuest·veggiebag 훅이 공유.
// 좌표계: 포기 밑동이 (0,0), 위로 자란다(호출부가 translate·scale로 배치).
// 사용법: <defs>에 p3LettuceDefs() 1회 + 무대에 p3Lettuce(x, y, s).

const ptA = (a: number, r: number): [number, number] => [
  +(Math.sin(a) * r).toFixed(1),
  +(-Math.cos(a) * r).toFixed(1),
];

/** 스캘럽 잎 한 장 — 방향 th(라디안, 0=수직)·길이 len·반각 half·혹 bumps개. */
function scallopLeaf(th: number, len: number, half: number, bumps: number): string {
  const a0 = th - half;
  const a1 = th + half;
  const dip = 0.86; // 혹 사이 골의 반지름 비 — 1.06(혹 마루)과의 차가 주름 깊이
  const [ex, ey] = ptA(a0, len * dip);
  const [c1x, c1y] = ptA(a0 - 0.24, len * 0.5);
  let d = `M0 0 C${c1x} ${c1y} ${+(ex * 0.7).toFixed(1)} ${+(ey * 0.7).toFixed(1)} ${ex} ${ey}`;
  for (let i = 1; i <= bumps; i++) {
    const [cx, cy] = ptA(a0 + ((a1 - a0) * (i - 0.5)) / bumps, len * 1.06);
    const [vx, vy] = ptA(a0 + ((a1 - a0) * i) / bumps, len * (i === bumps ? dip : dip - 0.045));
    d += ` Q${cx} ${cy} ${vx} ${vy}`;
  }
  const [lx, ly] = ptA(a1, len * dip);
  const [c2x, c2y] = ptA(a1 + 0.24, len * 0.5);
  d += ` C${+(lx * 0.7).toFixed(1)} ${+(ly * 0.7).toFixed(1)} ${c2x} ${c2y} 0 0 Z`;
  return d;
}

/** 상추 그라데이션 4종 — 무대 SVG의 <defs>에 1회 포함.
 *  ns = 무대별 id 접두(gxc·stq·vb …). SVG url(#id)는 문서 전역 첫 매치를 집는데, 라우터가
 *  이전 화면을 스택에 남겨 두므로 화면 간 같은 id가 공존하면 숨김 서브트리의 그라데이션이
 *  잡혀 페인트가 실패한다(잎이 흰색 — 실사고). 반드시 무대마다 다른 ns를 쓴다. */
export function p3LettuceDefs(ns: string): string {
  return `
    <radialGradient id="${ns}LetB" cx="0.42" cy="0.24" r="1">
      <stop offset="0" stop-color="#3E9E56"/><stop offset="0.62" stop-color="#2E8B47"/><stop offset="1" stop-color="#1C6B33"/>
    </radialGradient>
    <radialGradient id="${ns}LetM" cx="0.42" cy="0.24" r="1">
      <stop offset="0" stop-color="#6FC981"/><stop offset="0.6" stop-color="#4FB268"/><stop offset="1" stop-color="#2E8B47"/>
    </radialGradient>
    <radialGradient id="${ns}LetF" cx="0.42" cy="0.26" r="1">
      <stop offset="0" stop-color="#B2E8A6"/><stop offset="0.58" stop-color="#8FD98A"/><stop offset="1" stop-color="#57B26A"/>
    </radialGradient>
    <radialGradient id="${ns}LetH" cx="0.46" cy="0.3" r="1">
      <stop offset="0" stop-color="#E9FAD3"/><stop offset="0.6" stop-color="#CDF2AE"/><stop offset="1" stop-color="#A5E08F"/>
    </radialGradient>`;
}

/** 상추 한 포기(로제트) — 밑동 (x, y), 배율 s, ns는 p3LettuceDefs와 동일 접두.
 *  원 좌표계 폭 ±58 · 높이 83. */
export function p3Lettuce(x: number, y: number, s: number, ns: string): string {
  const leaf = (th: number, len: number, half: number, bumps: number, grad: string, sw: number): string =>
    `<path d="${scallopLeaf(th, len, half, bumps)}" fill="url(#${ns}${grad})" stroke="#1E5A2A" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const rib = (th: number, len: number): string => {
    const [tx, ty] = ptA(th, len);
    const [mx, my] = ptA(th * 0.9, len * 0.5);
    return `<path d="M0 -4 Q${mx} ${my} ${tx} ${ty}" stroke="#EAF9E4" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.7"/>`;
  };
  const L: string[] = [
    // 뒷줄(어두운 바깥 잎)
    leaf(-0.62, 72, 0.34, 3, "LetB", 2),
    leaf(0.62, 72, 0.34, 3, "LetB", 2),
    leaf(0, 78, 0.34, 3, "LetB", 2),
    // 중간줄
    leaf(-0.95, 58, 0.3, 3, "LetM", 2),
    leaf(0.95, 58, 0.3, 3, "LetM", 2),
    leaf(-0.3, 64, 0.3, 3, "LetM", 2),
    leaf(0.3, 64, 0.3, 3, "LetM", 2),
    // 앞줄(밝은 잎) + 잎맥
    leaf(-0.55, 46, 0.38, 4, "LetF", 1.8),
    leaf(0.55, 46, 0.38, 4, "LetF", 1.8),
    rib(-0.55, 32),
    rib(0.55, 32),
    // 속잎(연한 하트)
    leaf(0, 30, 0.52, 4, "LetH", 1.6),
    rib(0, 20),
  ];
  return `<g transform="translate(${x} ${y}) scale(${s})">${L.join("")}</g>`;
}
