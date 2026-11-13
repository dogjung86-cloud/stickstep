// 대단원 V. 힘의 작용 (중1, 책 154~193쪽). 이 파일이 정본이다.
// 중단원 1 '여러 가지 힘': 1 힘의 표현(154~157) · 2 힘의 평형(158~159) · 3 중력(160~163) ·
//   4 탄성력(164~167) · 5 마찰력(168~169) · 6 부력(170~173)
// 중단원 2 '힘과 물체의 운동'(178~185)
// 레슨의 차례: 도입(또는 만화) → 랩 → 개념 → 정리 → 문제. 개념, 정리, 문제의 글은 unit5v5parts.ts에 있다.
// 설계 근거: design/u5v5-plan.md. 랩의 수치(자체 제작): 용수철 4 cm에 2 N, 부력 20 N에서 14 N, 지구 29.4 N과 달 4.9 N.
import type { Unit } from "./curriculum";
import type { Step } from "../lessons/types";
import { opener, comic } from "./dsl";
import { comicStory } from "../ui/sketchArt";
import { U5_PARTS as P } from "./unit5v5parts";

// 랩 스텝(렌더러는 src/lessons/steps/u5v5)
const lab = (type: string) => (o: { title: string; cta?: string; curio?: unknown }): Step => ({ type, ...o }) as unknown as Step;
const arrowLab = lab("u5ArrowLab");
const sumLab = lab("u5SumLab");
const gravityLab = lab("u5GravityLab");
const springLab5 = lab("u5SpringLab");
const slopeLab = lab("u5SlopeLab");
const buoyLab = lab("u5BuoyLab");
const fanLab = lab("u5FanLab");

/** 랩 뒤의 개념(있을 때만) → 정리 → 문제. 선택형 문제에는 "문제 n / of" 번호를 매긴다(curriculum.ts가 매기는 번호와 같다). */
const tail = (id: string): Step[] => {
  const p = P[id];
  const of = p.quiz.filter((st) => st.type === "quiz").length;
  let n = 0;
  const quiz = p.quiz.map((st) => (st.type === "quiz" ? ({ ...st, n: ++n, of } as Step) : st));
  return [...(p.concept ? [p.concept] : []), p.recap, ...quiz];
};

// ══════════════════════════════════════════════════════════
// 레슨 1. 힘의 표현 (책 154~157쪽)
// ══════════════════════════════════════════════════════════
const L1 = {
  id: "u5l1",
  unitId: "u5",
  title: "힘의 표현",
  subtitle: "과학에서 '힘'은 무엇이고, 어떻게 그릴까",
  label: "힘의 표현",
  icon: "target",
  minutes: 7,
  standard: "책 154~157쪽",
  doneNote: "힘의 뜻과 화살표 표현(3요소)을 배웠어요",
  steps: [
    opener({ title: "당겼다 놓은 풍선은 어디로 갈까요?", scene: "u5-balloon", wait: "풍선 줄을 당겼다 놓아 보세요", cta: "실험실 열기" }),
    arrowLab({ title: "힘을 화살표로 어떻게 나타낼까요?", cta: "개념 정리하기" }),
    ...tail("u5l1"),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 2. 힘의 평형 (책 158~159쪽)
// ══════════════════════════════════════════════════════════
const L2 = {
  id: "u5l2",
  unitId: "u5",
  title: "힘의 평형",
  subtitle: "두 힘이 만나면, 알짜힘과 평형",
  label: "힘의 평형",
  icon: "swap",
  minutes: 8,
  standard: "책 158~159쪽",
  doneNote: "알짜힘 구하기와 힘의 평형 조건을 배웠어요",
  steps: [
    opener({ title: "세게 당기는데 왜 안 움직일까요?", scene: "u5-tug", wait: "더 세게 당기게 해 보세요", cta: "실험실 열기" }),
    sumLab({ title: "두 힘을 합치면 얼마일까요?", cta: "개념 정리하기" }),
    ...tail("u5l2"),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 3. 중력 (책 160~163쪽). 만화로 시작한다: 사과에서 달까지
// ══════════════════════════════════════════════════════════
const L3 = {
  id: "u5l3",
  unitId: "u5",
  title: "중력",
  subtitle: "사과에서 달까지, 무게와 질량",
  label: "중력",
  icon: "globe",
  minutes: 9,
  standard: "책 160~163쪽",
  doneNote: "중력의 방향, 무게와 질량의 차이를 배웠어요",
  steps: [
    // 만화: 글과 그림 모두 장면 파일 qa/sketch/scenes/comic-u5l3.mjs 가 정본(편성 근거와 사실 확인은 qa/sketch/research/u5l3.md).
    comic(comicStory("u5l3")),
    gravityLab({
      title: "사과는 어느 쪽으로 떨어질까요?",
      cta: "개념 정리하기",
      curio: {
        q: "우주 정거장의 우주인은 지구 중력을 <b>안 받는</b> 걸까요?",
        a: "받아요. 그것도 아주 많이! 우주 정거장 높이(약 400km)에서 지구 중력은 지상의 <b>약 90%</b>나 돼요.<br><br>그런데도 둥둥 뜨는 건, 정거장과 우주인이 지구를 향해 <b>함께 계속 떨어지는 중</b>이기 때문이에요. 다만 옆으로 워낙 빨라서(1초에 약 7.7km!) 떨어지는 만큼 둥근 지구가 아래로 비켜나요. 만화에서 본 달과 똑같죠. <b>영원히 떨어지면서 도는 것</b>, 그게 궤도예요.",
      },
    }),
    // 만화가 중력, 무게, 질량을 용어 카드로 이미 정의하므로 개념 스텝은 없다.
    ...tail("u5l3"),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 4. 탄성력 (책 164~167쪽)
// ══════════════════════════════════════════════════════════
const L4 = {
  id: "u5l4",
  premium: true,
  unitId: "u5",
  title: "탄성력",
  subtitle: "용수철이 되돌아가려는 힘",
  label: "탄성력",
  icon: "expand",
  minutes: 8,
  standard: "책 164~167쪽",
  doneNote: "탄성력의 방향과 크기 규칙을 배웠어요",
  steps: [
    opener({ title: "뒤로 당긴 화살은 왜 앞으로 갈까요?", scene: "u5-bow", wait: "두 가지로 쏴 보세요", cta: "실험실 열기" }),
    springLab5({ title: "늘일수록 힘은 어떻게 변할까요?", cta: "개념 정리하기" }),
    ...tail("u5l4"),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 5. 마찰력 (책 168~169쪽)
// ══════════════════════════════════════════════════════════
const L5 = {
  id: "u5l5",
  premium: true,
  unitId: "u5",
  title: "마찰력",
  subtitle: "미끄럼을 방해하는 접촉면의 힘",
  label: "마찰력",
  icon: "route",
  minutes: 8,
  standard: "책 168~169쪽",
  doneNote: "마찰력의 방향과 크기를 정하는 조건을 배웠어요",
  steps: [
    opener({ title: "썰매는 어느 길에서 멀리 갈까요?", scene: "u5-sled", wait: "두 길에서 밀어 보세요", cta: "실험실 열기" }),
    slopeLab({ title: "어느 때 더 잘 버틸까요?", cta: "개념 정리하기" }),
    ...tail("u5l5"),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 6. 부력 (책 170~173쪽)
// ══════════════════════════════════════════════════════════
const L6 = {
  id: "u5l6",
  premium: true,
  unitId: "u5",
  title: "부력",
  subtitle: "물이 밀어 올리는 힘",
  label: "부력",
  icon: "flask",
  minutes: 8,
  standard: "책 170~173쪽",
  doneNote: "부력의 방향과 크기 재는 법을 배웠어요",
  steps: [
    opener({ title: "눌러 넣은 병은 어떻게 될까요?", scene: "u5-bottle", wait: "병을 눌렀다 놓아 보세요", cta: "실험실 열기" }),
    buoyLab({ title: "물속에서 눈금은 왜 줄어들까요?", cta: "개념 정리하기" }),
    ...tail("u5l6"),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 7. 힘과 물체의 운동 (책 178~185쪽)
// ══════════════════════════════════════════════════════════
const L7 = {
  id: "u5l7",
  premium: true,
  unitId: "u5",
  title: "힘과 운동",
  subtitle: "힘의 방향이 운동을 바꾸는 방식",
  label: "힘과 운동",
  icon: "bolt",
  minutes: 8,
  standard: "책 178~185쪽",
  doneNote: "힘의 방향에 따른 운동 변화를 배웠어요",
  steps: [
    opener({ title: "찬 공은 끝까지 굴러갈까요?", scene: "u5-roll", wait: "공을 차고 지켜보세요", cta: "실험실 열기" }),
    fanLab({ title: "바람은 공을 어떻게 바꿀까요?", cta: "개념 정리하기" }),
    ...tail("u5l7"),
  ],
};

export const UNIT5: Unit = {
  id: "u5",
  roman: "V",
  title: "힘의 작용",
  subtitle: "세상을 밀고 당기는 다섯 가지 힘",
  color: "#F0A422",
  icon: "bolt",
  standard: "2022 개정 교육과정",
  lessons: [L1, L2, L3, L4, L5, L6, L7],
};
