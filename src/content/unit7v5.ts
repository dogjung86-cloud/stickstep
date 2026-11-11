// 중1 Ⅶ 태양계: 랩과 도입 재제작(v5, 2026-11-12). 주소에 ?u7v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit7.ts)을 베끼지 않는다. remakeUnit으로 도입과 랩 스텝만 바꿔 끼운다
// (레슨의 id와 수, 제목, 쪽수, 잠금, 개념, 정리, 문제, u7l3의 만화는 정본 그대로 따라온다).
// 설계와 교과서 대응표는 design/u7v5-plan.md.
//
//   레슨   도입(opener 장면)          랩(스텝 타입)
//   u7l1   u7-brightdot               u7TourLab(가로 3D: 천체 여섯 가지 찾기)
//   u7l2   u7-jupiterrow              u7PlanetLab(그래프 셋을 보고 두 무리로 가르기) + 정본의 표
//   u7l3   (만화 그대로)              u7SunLab(흑점, 달이 가렸을 때, 흑점 수 늘리기)
//   u7l4   u7-shadowturn              u7SkyLab(시각을 밀어 별의 움직임 보기), u7ZodiacLab(3D: 지구를 옮겨 별자리 찾기)
//   u7l5   u7-moonweek                u7MoonLab(3D: 달을 옮겨 네 모습 찾기)
//   u7l6   u7-bittensun               u7EclipseLab(가로 3D: 일식과 월식 만들기)
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { UNIT7 } from "./unit7";
import { remakeUnit } from "./v5remake";
import { opener } from "./dsl";

/** 이 단원의 랩 스텝. 제목은 학생이 답할 질문 한 줄(15자 안쪽, 한 줄에 들어가야 한다). */
const lab = (type: string, o: { title: string; cta: string; [k: string]: unknown }): Step => ({ type, ...o });

export const UNIT7_V5: Unit | null = remakeUnit(UNIT7, {
  u7l1: {
    intro: opener({ title: "저 밝은 점도 별일까요?", scene: "u7-brightdot", wait: "먼저 밝은 점을 확대해 보세요", cta: "태양계로 출발" }),
    swap: { solarTour: lab("u7TourLab", { title: "태양계에는 누가 살까요?", cta: "개념 정리하기" }) },
  },
  u7l2: {
    intro: opener({ title: "목성 옆에 지구를 세우면?", scene: "u7-jupiterrow", wait: "먼저 지구를 세워 보세요", cta: "두 무리로 나누기" }),
    // 표는 그대로 두고 그 앞에 랩을 놓는다(랩이 그래프로 두 무리를 가르고, 표가 표면과 고리를 보탠다)
    swap: { table: (old) => [lab("u7PlanetLab", { title: "여덟 행성, 어떻게 나눌까요?", cta: "표로 정리하기" }), old] },
  },
  u7l3: {
    swap: { sunLab: (old) => lab("u7SunLab", { title: "태양은 늘 같은 모습일까요?", cta: "구조 라벨 붙이기", curio: old.curio }) },
    // 만화는 그대로다. 끝 버튼의 글만 새 랩에 맞춘다(옛 글은 "태양 관측소 열기")
    after: (steps) => steps.map((st) => (st.type === "comic" ? { ...st, cta: "태양 살펴보기" } : st)),
  },
  u7l4: {
    intro: opener({ title: "그림자는 왜 자리를 옮길까요?", scene: "u7-shadowturn", wait: "먼저 해를 옮겨 보세요", cta: "밤하늘 살펴보기" }),
    swap: {
      skyDaily: lab("u7SkyLab", { title: "별은 밤새 어디로 움직일까요?", cta: "다음으로" }),
      zodiacRing: lab("u7ZodiacLab", { title: "계절마다 별자리는 왜 다를까요?", cta: "개념 정리하기" }),
    },
  },
  u7l5: {
    intro: opener({ title: "일주일 뒤, 달은 어떤 모양일까요?", scene: "u7-moonweek", wait: "먼저 날짜를 넘겨 보세요", cta: "달을 직접 옮겨 보기" }),
    swap: { moonPhase3d: lab("u7MoonLab", { title: "달 모양은 왜 달라 보일까요?", cta: "개념 정리하기" }) },
  },
  u7l6: {
    intro: opener({ title: "한낮의 해가 왜 이지러질까요?", scene: "u7-bittensun", wait: "먼저 안경을 써 보세요", cta: "세 천체를 한 줄로" }),
    swap: { eclipse3d: lab("u7EclipseLab", { title: "일식과 월식은 언제 생길까요?", cta: "개념 정리하기" }) },
  },
});
