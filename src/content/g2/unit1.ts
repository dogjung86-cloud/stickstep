// 중2 대단원 Ⅰ: 물질의 특성. 이 파일이 정본이다(curriculum.ts가 G2_UNIT1을 바로 싣는다).
// 소단원 차례: 밀도 → 뜨고 가라앉기 → 고체의 용해도 → 기체의 용해도 → 녹는점과 끓는점 → 순물질과 혼합물 → 밀도 차로 분리하기 → 재결정 → 증류.
// 무료 레슨 1~3 + 프리미엄 레슨 4~9(premium: true이면 페이월).
// 레슨의 스텝은 차례대로 도입(opener) → 랩 → 용어(개념) → 정리 → 문제이고, 스텝 배열은 레슨별로 아래 파일에 있다:
//   unit1v5a.ts(레슨 1), unit1v5b.ts(2~3), unit1v5c.ts(4~6), unit1v5d.ts(7~9). 공용 도구는 unit1v5kit.ts.
// 설계와 책의 실험 대응표는 design/g2u1v5-plan.md. 정답은 과학적으로 직접 확정했다(밀도와 용해도 수치는 CRC 표 기준).
import type { Unit } from "../curriculum";
import { lesson } from "../dsl";
import { L1 } from "./unit1v5a";
import { L2, L3 } from "./unit1v5b";
import { L4, L5, L6 } from "./unit1v5c";
import { L7, L8, L9 } from "./unit1v5d";

export const G2_UNIT1: Unit = {
  id: "g2u1",
  roman: "I",
  title: "물질의 특성",
  subtitle: "밀도·용해도·녹는점, 물질의 지문을 찾아라",
  color: "#E64980",
  icon: "flask",
  standard: "책 12~51쪽",
  lessons: [
    // ── L1. 물질의 특성과 밀도 ────────────────────────────────
    lesson({
      id: "g2u1l1",
      unitId: "g2u1",
      title: "물질의 특성과 밀도",
      subtitle: "같은 은백색, 다른 정체, 밀도로 구별해요",
      label: "밀도",
      icon: "flask",
      minutes: 8,
      standard: "책 14~19쪽",
      doneNote: "밀도 = 질량 ÷ 부피, 물질의 지문이에요",
      // 도입 → MeasureLab → SizeLab → 용어 → 정리 → 문제 5
      steps: L1,
    }),

    // ── L2. 뜨고 가라앉기 ────────────────────────────────────
    lesson({
      id: "g2u1l2",
      unitId: "g2u1",
      title: "뜨고 가라앉기",
      subtitle: "밀도 기둥에 무엇이 뜨고 무엇이 가라앉을까",
      label: "뜨고 가라앉기",
      icon: "drop",
      minutes: 7,
      standard: "책 18~19쪽",
      doneNote: "밀도가 작으면 위로, 크면 아래로!",
      // 도입 → LayerLab → 정리 → 문제 4
      steps: L2,
    }),

    // ── L3. 고체의 용해도 ────────────────────────────────────
    lesson({
      id: "g2u1l3",
      unitId: "g2u1",
      title: "고체의 용해도",
      subtitle: "물 100 g에 최대로 녹는 양, 물질마다 달라요",
      label: "용해도",
      icon: "drop",
      minutes: 8,
      standard: "책 20~23쪽",
      doneNote: "용해도도 물질의 특성이에요",
      // 도입 → DissolveLab → 용어 → WarmLab → 정리 → 문제 5
      steps: L3,
    }),

    // ── L4. 기체의 용해도 (프리미엄) ─────────────────────────
    lesson({
      id: "g2u1l4",
      unitId: "g2u1",
      title: "기체의 용해도",
      subtitle: "탄산음료 기포의 비밀, 온도와 압력",
      label: "기체 용해도",
      icon: "sparkle",
      minutes: 7,
      standard: "책 22~23쪽",
      doneNote: "기체는 차갑고 압력이 높을수록 잘 녹아요",
      premium: true,
      // 도입 → FizzLab → PumpLab → 정리 → 분류 → 문제 3
      steps: L4,
    }),

    // ── L5. 녹는점과 끓는점 (프리미엄) ───────────────────────
    lesson({
      id: "g2u1l5",
      unitId: "g2u1",
      title: "녹는점과 끓는점",
      subtitle: "가열 곡선의 평평한 구간이 알려 주는 것",
      label: "녹는점·끓는점",
      icon: "thermo",
      minutes: 9,
      standard: "책 24~27쪽",
      doneNote: "양이 달라져도 녹는점·끓는점은 그대로!",
      premium: true,
      // 도입 → MeltLab → BoilLab → 용어 → 정리 → 문제 5
      steps: L5,
    }),

    // ── L6. 순물질과 혼합물 (프리미엄) ───────────────────────
    lesson({
      id: "g2u1l6",
      unitId: "g2u1",
      title: "순물질과 혼합물",
      subtitle: "물질의 특성이 일정한가로 가려내요",
      label: "순물질·혼합물",
      icon: "layers",
      minutes: 7,
      standard: "책 30~33쪽",
      doneNote: "혼합물 속 순물질은 제 성질을 그대로 지녀요",
      premium: true,
      // 도입 → 용어 → 분류 → SaltLab → 정리 → 문제 4
      steps: L6,
    }),

    // ── L7. 밀도 차로 분리 (프리미엄) ────────────────────────
    lesson({
      id: "g2u1l7",
      unitId: "g2u1",
      title: "밀도 차로 분리하기",
      subtitle: "분별 깔때기, 아래층부터 받아 내요",
      label: "밀도 차 분리",
      icon: "swap",
      minutes: 8,
      standard: "책 34~35쪽",
      doneNote: "섞이지 않는 액체는 밀도 차로 나눠요",
      premium: true,
      // 도입 → FunnelLab → SeedLab → 정리 → 문제 4
      steps: L7,
    }),

    // ── L8. 재결정 (프리미엄) ────────────────────────────────
    lesson({
      id: "g2u1l8",
      unitId: "g2u1",
      title: "재결정",
      subtitle: "식히기만 했는데 순수한 결정이 자라나요",
      label: "재결정",
      icon: "star",
      minutes: 8,
      standard: "책 36~37쪽",
      doneNote: "용해도 차가 큰 물질이 먼저 석출돼요",
      premium: true,
      // 도입 → CrystalLab → 용어 → 정리 → 문제 → 순서 배열 → 문제 2
      steps: L8,
    }),

    // ── L9. 증류 (프리미엄) ──────────────────────────────────
    lesson({
      id: "g2u1l9",
      unitId: "g2u1",
      title: "증류",
      subtitle: "끓는점 차이로 액체 혼합물을 나눠요",
      label: "증류",
      icon: "flame",
      minutes: 9,
      standard: "책 38~41쪽",
      doneNote: "먼저 끓어 나오는 건 끓는점이 낮은 쪽!",
      premium: true,
      // 도입 → DistillLab → 용어 → 정리 → 문제 2 → 순서 배열 → 문제 2
      steps: L9,
    }),
  ],
};

// 검사 도구(qa/check-g2u1v5.mjs)가 문제의 정답을 찾는 표. 개발 모드에서만 내놓는다(운영 번들에는 없다).
if (import.meta.env.DEV) Object.assign(globalThis as unknown as Record<string, unknown>, { __g2u1v5: G2_UNIT1 });
