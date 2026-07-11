// 장화 레벨 — 누적 획득 스텝(store.lifeXp) 기준. 소비(미니게임 입장 등)로는 절대 내려가지 않는다.
// 단계·명칭은 사용자 확정(2026-07-12): 색 4 → 무지개 → 별 시리즈 5 → 은·금·다이아·은하 14단계.
// ('흙장화'는 위화감 리스크로 금지 — 시작 장화는 노랑.)
// 문턱은 이 표만 고치면 된다(레벨은 저장하지 않고 항상 누적치로 재계산).
// 근거: 레슨 첫 완주 = 40+정답×20(보통 140~180스텝), 하루 10분 ≈ 200스텝,
// 전 콘텐츠 첫 완주 상한 ≈ 3.2만 → 별무지개(3.5만)까지가 "완주자" 구간,
// 은~은하는 복습(30%)·시험 신기록·향후 콘텐츠(사회·중3)를 포함한 장기 엔드게임.

export interface BootTier {
  id: string; // ui/boots.ts 아트 키
  name: string;
  need: number; // 누적 스텝 문턱
}

export const BOOT_TIERS: BootTier[] = [
  { id: "yellow", name: "노랑 장화", need: 0 },
  { id: "green", name: "초록 장화", need: 300 },
  { id: "blue", name: "파랑 장화", need: 1000 },
  { id: "red", name: "빨강 장화", need: 2500 },
  { id: "rainbow", name: "무지개 장화", need: 5000 },
  { id: "star-yellow", name: "별노랑 장화", need: 8500 },
  { id: "star-green", name: "별초록 장화", need: 13000 },
  { id: "star-blue", name: "별파랑 장화", need: 19000 },
  { id: "star-red", name: "별빨강 장화", need: 26000 },
  { id: "star-rainbow", name: "별무지개 장화", need: 35000 },
  { id: "silver", name: "은장화", need: 46000 },
  { id: "gold", name: "금장화", need: 60000 },
  { id: "diamond", name: "다이아 장화", need: 78000 },
  { id: "galaxy", name: "은하 장화", need: 100000 },
];

export interface BootLevel {
  tier: BootTier;
  level: number; // 1부터
  next: BootTier | null; // 마지막 단계면 null
  toNext: number; // 다음 장화까지 남은 스텝(마지막 단계면 0)
  progress: number; // 현 구간 진행률 0~1(마지막 단계면 1)
}

export function bootLevel(lifeSteps: number): BootLevel {
  const n = Math.max(0, lifeSteps);
  let idx = 0;
  for (let i = 0; i < BOOT_TIERS.length; i++) if (n >= BOOT_TIERS[i].need) idx = i;
  const tier = BOOT_TIERS[idx];
  const next = BOOT_TIERS[idx + 1] ?? null;
  if (!next) return { tier, level: idx + 1, next: null, toNext: 0, progress: 1 };
  const span = next.need - tier.need;
  return {
    tier,
    level: idx + 1,
    next,
    toNext: next.need - n,
    progress: Math.min(1, (n - tier.need) / span),
  };
}
