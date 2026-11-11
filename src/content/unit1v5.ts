// 중1 Ⅰ 과학과 인류의 지속가능한 삶: 랩과 문제 재제작(v5, 2026-11-12). 주소 ?u1v5 를 붙였을 때만 보인다(배선은 curriculum.ts와 v5toggle.ts).
// 정본(unit1.ts)에서 도입, 랩, 문제 스텝만 바꿔 끼운다. 레슨의 id와 수, 제목, 쪽수, 만화, 정리 카드는 정본 그대로 따라온다.
// 설계와 근거는 design/u1v5-plan.md.
// 개념 스텝과 정리 카드의 글은 unit1v5text.ts에 있다(랩 뒤에 "과학 용어 정복하기" 스텝을 두고 정리 카드를 새 랩에 맞춰 다시 썼다).
//   u1l1 과학적 탐구 방법   랩 없음(만화가 린드의 실험으로 여섯 단계를 겪게 한다). 문제를 고치고(같은 것을 두 번 묻던 문항을 뺐다) 정리 카드에서 배우지 않은 용어(대조군)를 걷었다
//   u1l2 직접 탐구하기      도입 suncups → 공정한 실험 랩(변인 분류를 대신한다) → 그래프 그리기 랩(보기만 하던 표와 그래프를 대신한다) → 새 문제 셋
//   u1l3 과학과 인류 문명   랩 없음(교과서에 실험이 없는 사례 조사 단원). 문제만 고쳤다(문두가 답을 말하던 문항, 짝 잇기)
//   u1l4 첨단 과학기술      도입 speaker → 기술 켜 보기 랩(누르면 뜻이 뜨던 카드 넉 장을 대신한다) → 새 문제 셋
//   u1l5 지속가능한 삶      도입 blanket → 온실 기체 줄이기 랩(새로 넣었다) → 실천 분류(정본 그대로) → 새 문제 셋
// 도입 장면은 새로 만들지 않았다(unit1intro.ts와 같은 장면, 같은 제목). 끝 버튼 글만 새 랩의 첫 화면에 맞췄다.
// 문제의 원칙: 랩 뒤 첫 문항은 랩에서 본 장면으로 까닭을 묻거나 새 상황에 옮겨 쓰게 한다. 랩의 판정과 같은 것을 다시 묻지 않는다.
//             문두는 그 문장만 읽고 풀 수 있게 쓴다(오답노트에서 랩 없이 다시 만난다). 형식은 레슨마다 달리 섞는다.
import type { Step } from "../lessons/types";
import type { Unit } from "./curriculum";
import { binSort, mcq, multi, opener, ox, pairMatch } from "./dsl";
import { UNIT1 } from "./unit1";
import { remakeUnit } from "./v5remake";
import { twoCupGraphFig } from "../ui/u1v5Figures";
import { L2_CONCEPT_CONTROL, L2_CONCEPT_DATA, L2_RECAP, L4_CONCEPT_A, L4_CONCEPT_B, L4_RECAP, L5_CONCEPT, L5_RECAP } from "./unit1v5text";

const fairLab = (o: { title: string; cta?: string }): Step => ({ type: "u1FairLab", ...o });
const graphLab = (o: { title: string; cta?: string }): Step => ({ type: "u1GraphLab", ...o });
const techLab = (o: { title: string; cta?: string }): Step => ({ type: "u1TechLab", ...o });
const cleanLab = (o: { title: string; cta?: string }): Step => ({ type: "u1CleanLab", ...o });

/** 정리(recap) 뒤의 문제 구간을 새 문제로 바꾼다. 정리 앞의 스텝은 그대로 둔다. */
const quizzes =
  (...next: Step[]) =>
  (steps: Step[]): Step[] => {
    const i = steps.findIndex((s) => s.type === "recap");
    return i < 0 ? steps : [...steps.slice(0, i + 1), ...next];
  };

/** 정리 카드의 글 한 군데를 고친 사본을 만든다(정본 객체는 건드리지 않는다). 제작자 말("훅")이 화면에 나오던 곳에 쓴다. */
const reword =
  (from: string, to: string) =>
  (steps: Step[]): Step[] =>
    steps.map((s) => {
      if (s.type !== "recap") return s;
      const raw = JSON.stringify(s);
      return raw.includes(from) ? (JSON.parse(raw.split(from).join(to)) as Step) : s;
    });

const chain =
  (...fns: ((steps: Step[]) => Step[])[]) =>
  (steps: Step[]): Step[] =>
    fns.reduce((acc, fn) => fn(acc), steps);

// 정본 u1l1의 순서 맞추기(탐구 여섯 단계)는 그대로 쓴다
const L1_ORDER = UNIT1.lessons[0].steps.find((s) => s.type === "order") as Step;

export const UNIT1_V5: Unit | null = remakeUnit(UNIT1, {
  u1l1: {
    after: chain(
      reword("대조군, 처리하지 않은 비교 기준", "변인 통제, 조건을 정해 지키는 일"),
      reword("그리고 알아보려는 처리를 하지 않고 둔 비교 기준이 <b>대조군</b>이에요. 린드의 실험에는 아무 처방도 받지 않은 쌍이 없었지만, 오늘날 실험에서는 그런 무리를 따로 두어 견줘요. 세 이름이 자주 섞여 나오니 짝을 지어 외워요.", "두 이름이 자주 섞여 나오니 짝을 지어 외워요."),
      quizzes(
      mcq({
        n: 1, of: 4,
        prompt: "린드가 괴혈병 실험을 하기 전에 세운 <b>가설</b>은?",
        options: [
          "신 것을 먹으면 괴혈병이 나을 것이다",
          "무엇이 괴혈병을 낫게 할까?",
          "오렌지와 레몬이 가장 잘 들었다",
          "선원 12명을 6쌍으로 나눈다",
          "바닷물을 마시면 괴혈병이 나을 것이다",
        ],
        answer: 0,
        explainGood: "맞아요. 가설은 실험하기 전에 세우는 <b>잠정적인 답</b>이에요. 실험으로 맞는지 확인할 수 있어야 해요.",
        explainBad: "가설은 질문도 결과도 아니에요. 실험하기 전에 세우는 <b>잠정적인 답</b>이에요. 린드는 신맛 나는 것이 듣는다고 보고 “신 것을 먹으면 나을 것이다”라고 예상했어요.",
      }),
      mcq({
        n: 2, of: 4,
        prompt: "린드의 실험에서 6쌍에게 서로 <b>‘다르게’ 준 조건</b>은?",
        options: ["잠자리", "기본 식사", "처방(먹인 것)", "타고 있던 배", "항해 기간"],
        answer: 2,
        explainGood: "정확해요. 린드는 오직 <b>처방(먹인 것)</b> 하나만 다르게 했어요. 그래서 누가 나았을 때 무엇 덕분인지 알 수 있었어요.",
        explainBad: "다르게 한 건 <b>처방(먹인 것)</b> 하나뿐이에요. 배, 식사, 잠자리는 모두 같게 맞췄어요. 여럿이 함께 다르면 무엇 덕분인지 알 수 없어요.",
      }),
      L1_ORDER,
      mcq({
        n: 3, of: 4,
        prompt: "여섯 쌍의 결과를 <b>표로 정리해</b> 감귤을 먹은 쌍이 가장 뚜렷하게 나았다는 <b>규칙을 찾은</b> 것은 어느 단계?",
        options: ["문제 인식", "가설 설정", "탐구 설계", "자료 해석", "결론 도출"],
        answer: 3,
        explainGood: "맞아요! 결과를 <b>표나 그래프로 정리해 규칙을 찾는</b> 단계가 자료 해석이에요.",
        explainBad: "표로 정리해 규칙을 찾는 건 <b>자료 해석</b>이에요. 결론 도출은 그다음에 가설이 맞았는지 따지는 단계예요.",
      }),
      mcq({
        n: 4, of: 4,
        prompt: "린드는 “신 것을 먹으면 낫는다”고 예상했지만, 신맛이 나는 <b>식초는 듣지 않았어요</b>. 이럴 때 알맞은 행동은?",
        options: [
          "가설을 고쳐서 다시 탐구한다",
          "식초의 결과를 빼고 발표한다",
          "기록을 가설에 맞게 고친다",
          "탐구를 그만둔다",
        ],
        answer: 0,
        explainGood: "맞아요. 결과가 가설과 다르면 <b>가설을 고쳐 다시 탐구</b>해요. 결과는 있는 그대로 두어야 해요.",
        explainBad: "결과를 빼거나 고치면 믿을 수 없는 탐구가 돼요. 결과는 있는 그대로 두고 <b>가설을 고쳐 다시 탐구</b>해요.",
      }),
      ),
    ),
  },
  u1l2: {
    intro: opener({ title: "어느 컵이 가장 뜨거워질까?", scene: "suncups", wait: "해를 꾹 눌러 보세요", cta: "공정하게 다시 실험하기" }),
    swap: {
      binSort: [fairLab({ title: "색깔만 달라지게 하려면?", cta: "용어로 정리하기" }), L2_CONCEPT_CONTROL],
      dataGraph: [graphLab({ title: "표를 그래프로 옮기면?", cta: "용어로 정리하기" }), L2_CONCEPT_DATA],
      recap: L2_RECAP,
    },
    after: chain(
      quizzes(
        multi({
          n: 1, of: 3,
          prompt: "컵을 감싼 색종이의 색깔에 따라 물의 온도가 다르게 오르는지 알아보려고 해요. <b>같게 맞춰야 할 조건</b>을 모두 고르세요.",
          options: ["물의 양", "처음 물의 온도", "햇빛을 받는 정도", "색종이의 색깔"],
          answer: [0, 1, 2],
          explainGood: "정확해요. 알아보려는 <b>색깔만 다르게</b> 하고, 온도에 영향을 줄 수 있는 나머지는 모두 같게 맞춰요.",
          explainBad: "색종이의 색깔은 알아보려는 조건이라 <b>다르게</b> 해야 해요. 물의 양, 처음 온도, 햇빛은 온도에 영향을 주니 모두 같게 맞춰요.",
        }),
        mcq({
          n: 2, of: 3,
          prompt: "얼음이 녹는 빠르기가 <b>컵의 재질</b>(유리, 종이, 금속)에 따라 다른지 알아보려고 해요. <b>다르게 해야 할 조건</b>은?",
          options: ["컵의 재질", "얼음의 크기", "컵을 두는 곳", "얼음을 넣는 때", "얼음의 개수"],
          answer: 0,
          explainGood: "맞아요. 알아보려는 것이 재질이니 <b>컵의 재질만</b> 다르게 하고 나머지는 모두 같게 맞춰요.",
          explainBad: "알아보려는 조건 하나만 다르게 해요. 여기서는 <b>컵의 재질</b>이에요. 얼음의 크기나 두는 곳까지 다르면 무엇 때문인지 알 수 없어요.",
        }),
        mcq({
          n: 3, of: 3,
          prompt: "같은 양의 물을 담은 두 컵 (가)와 (나)를 햇빛에 두고 온도를 쟀어요. 그래프에 대한 설명으로 옳은 것은?",
          figure: twoCupGraphFig(),
          options: [
            "(가)의 온도가 더 빠르게 올랐다",
            "(나)의 온도가 더 빠르게 올랐다",
            "두 컵의 온도가 똑같이 올랐다",
            "(가)의 온도는 변하지 않았다",
            "2시간 뒤에는 (나)가 더 뜨겁다",
          ],
          answer: 0,
          explainGood: "맞아요. (가)의 선이 더 가파르게 올라가요. 같은 시간 동안 <b>더 많이 오른</b> 쪽의 선이 더 가팔라요.",
          explainBad: "선이 가파를수록 온도가 빠르게 오른 거예요. <b>(가)</b>의 선이 더 가파르고, 2시간 뒤 온도도 (가)가 더 높아요.",
        }),
      ),
    ),
  },
  u1l3: {
    after: quizzes(
      mcq({
        n: 1, of: 2,
        prompt: "‘빛의 굴절 원리 → 렌즈 기술 → ( ㉠ ) → 세포의 발견’. ㉠에 들어갈 기기는?",
        options: ["망원경", "현미경", "증기 기관", "인공위성", "체온계"],
        answer: 1,
        explainGood: "맞아요! 훅은 <b>현미경</b>으로 코르크를 관찰하다 세포를 발견했어요. 원리가 기술로, 기술이 기기로 이어졌어요.",
        explainBad: "작은 것을 크게 보여 줘 세포를 발견하게 한 기기는 <b>현미경</b>이에요. 망원경도 렌즈로 만들지만 먼 곳을 보는 기기예요.",
      }),
      pairMatch({
        title: "과학기술과 바꾼 것 잇기",
        lead: "과학기술과 그것이 가져온 변화를 짝지어 보세요.",
        aLabel: "과학기술",
        bLabel: "가져온 변화",
        pairs: [
          { a: "현미경", b: "세포의 발견" },
          { a: "증기 기관", b: "공장의 대량 생산" },
          { a: "백신과 항생제", b: "평균 수명 연장" },
          { a: "인터넷과 인공위성", b: "실시간 정보 교환" },
        ],
        explainGood: "완벽해요! 과학기술 하나하나가 사람들이 사는 모습을 바꿨어요.",
        explainBad: "현미경은 세포의 발견, 증기 기관은 대량 생산, 백신과 항생제는 평균 수명 연장, 인터넷과 인공위성은 실시간 정보 교환으로 이어졌어요.",
      }),
      ox({
        n: 2, of: 2,
        prompt: "<b>백신</b>은 세균에 감염된 <b>뒤에</b> 병을 치료하는 약이다.",
        answer: false,
        explainGood: "맞아요, <b>아니에요</b>. 백신은 병에 걸리기 전에 <b>미리 막는</b> 것이고, 세균에 감염된 뒤에 치료하는 약은 항생제예요.",
        explainBad: "백신은 병을 <b>미리 막는</b> 것이에요. 세균에 감염된 뒤에 치료하는 약은 <b>항생제</b>예요. 둘의 쓰임을 구분해요.",
      }),
    ),
  },
  u1l4: {
    intro: opener({ title: "말을 알아듣는 스피커, 비결은?", scene: "speaker", wait: "말을 들려주며 확인해 보세요", cta: "기술 켜 보기" }),
    swap: { techCards: [techLab({ title: "기술을 켜면 무엇이 달라질까?", cta: "용어로 정리하기" }), L4_CONCEPT_A, L4_CONCEPT_B], recap: L4_RECAP },
    after: quizzes(
      mcq({
        n: 1, of: 2,
        prompt: "말을 알아듣는 스피커는 쓸수록 말을 더 잘 알아들어요. 그 까닭으로 알맞은 것은?",
        options: [
          "수많은 말을 학습하기 때문에",
          "사물끼리 무선으로 이어져서",
          "가상 이미지를 겹쳐 보여서",
          "유전정보를 분석하기 때문에",
        ],
        answer: 0,
        explainGood: "맞아요. 컴퓨터가 사람처럼 <b>학습</b>하고 일을 처리하게 하는 기술이 인공지능이에요.",
        explainBad: "말을 알아듣는 힘은 <b>학습</b>에서 나와요. 컴퓨터가 수많은 말을 학습해 일을 처리하게 하는 기술이 인공지능이에요.",
      }),
      binSort({
        title: "어떤 기술이 쓰였을까?",
        lead: "생활 속 장면에 쓰인 첨단 과학기술을 찾아요.",
        instruction: "각 장면을 알맞은 통에 담아요.",
        bins: [
          { id: "ai", label: "인공지능", color: "#7C5CFF" },
          { id: "ar", label: "증강 현실", color: "#3182F6" },
          { id: "iot", label: "사물 인터넷", color: "#12B886" },
          { id: "bio", label: "첨단 바이오", color: "#FF9500" },
        ],
        items: [
          { label: "스스로 판단해 달리는 차", bin: "ai" },
          { label: "화면으로 옷 입어 보기", bin: "ar" },
          { label: "집 밖에서 켜는 보일러", bin: "iot" },
          { label: "유전정보로 병 예측", bin: "bio" },
          { label: "사람과 대화하는 프로그램", bin: "ai" },
          { label: "폰으로 여는 현관문", bin: "iot" },
        ],
        explainGood: "좋아요! 학습하면 <b>인공지능</b>, 가상 이미지를 겹치면 <b>증강 현실</b>, 사물을 이으면 <b>사물 인터넷</b>, 유전정보를 쓰면 <b>첨단 바이오</b>예요.",
        explainBad: "핵심 낱말로 갈라요. 스스로 판단해 달리거나 대화하면 학습하는 <b>인공지능</b>, 화면에 옷을 겹치면 <b>증강 현실</b>, 멀리서 켜고 열면 <b>사물 인터넷</b>, 유전정보는 <b>첨단 바이오</b>예요.",
      }),
      multi({
        n: 2, of: 2,
        prompt: "인공지능이 발달하면서 함께 나타날 수 있는 <b>새로운 문제</b>를 모두 고르세요.",
        options: [
          "일자리가 인공지능으로 대체될 수 있다",
          "개인의 사생활이 침해될 수 있다",
          "생활이 더 편리해진다",
          "사회의 여러 문제 해결을 돕는다",
        ],
        answer: [0, 1],
        explainGood: "맞아요. 편리해지는 만큼 <b>일자리 대체</b>와 <b>사생활 침해</b> 같은 문제도 생겨요. 그래서 윤리 의식과 디지털 역량이 필요해요.",
        explainBad: "생활이 편리해지고 사회 문제 해결을 돕는 것은 좋은 점이에요. 새로운 문제는 <b>일자리 대체</b>와 <b>사생활 침해</b>예요.",
      }),
    ),
  },
  u1l5: {
    intro: opener({ title: "지구를 덮은 기체, 두꺼워지면?", scene: "blanket", wait: "기체를 늘렸다 줄여 보세요", cta: "온실 기체 줄여 보기" }),
    // 실천 분류(binSort)는 그대로 두고 그 앞에 랩을 넣는다
    swap: { binSort: (old) => [cleanLab({ title: "온실 기체를 줄이려면?", cta: "용어로 정리하기" }), L5_CONCEPT, old], recap: L5_RECAP },
    after: chain(
      quizzes(
        mcq({
          n: 1, of: 3,
          prompt: "발전소가 <b>석탄</b>으로 전기를 만드는 마을에서 휘발유 자동차를 전기 자동차로 바꿨더니 온실 기체가 생각보다 적게 줄었어요. 까닭은?",
          options: [
            "충전할 전기를 석탄을 태워 만들어서",
            "전기 자동차도 달릴 때 기체를 내서",
            "전기 자동차가 휘발유도 함께 써서",
            "발전소가 전기를 덜 만들게 되어서",
          ],
          answer: 0,
          explainGood: "맞아요. 전기 자동차는 달릴 때 온실 기체를 내지 않지만, <b>전기를 만드는 방법</b>까지 바꿔야 더 많이 줄어요.",
          explainBad: "전기 자동차는 달릴 때 온실 기체를 내지 않아요. 다만 충전할 전기를 <b>석탄을 태워</b> 만들면 발전소에서 그만큼 더 나와요.",
        }),
        multi({
          n: 2, of: 3,
          prompt: "지구 온난화를 늦추는 데 쓰이는 <b>과학기술</b>을 모두 고르세요.",
          options: ["태양광 발전", "수소 연료 전지 발전", "탄소 포집 장치", "석탄 화력 발전"],
          answer: [0, 1, 2],
          explainGood: "정확해요. 태양 빛과 수소로 에너지를 얻고, 나온 이산화 탄소는 붙잡아요. 모두 <b>온실 기체를 줄이는</b> 기술이에요.",
          explainBad: "석탄을 태우면 온실 기체가 많이 나와요. 태양광 발전, 수소 연료 전지 발전, 탄소 포집 장치는 <b>온실 기체를 줄이는</b> 기술이에요.",
        }),
        mcq({
          n: 3, of: 3,
          prompt: "다음 중 <b>업사이클링(새활용)</b>의 예는?",
          options: [
            "버려진 방수 천으로 가방 만들기",
            "빈 병을 분리배출하기",
            "작아진 교복 물려주기",
            "안 쓰는 플러그 뽑기",
            "일회용 포장 거절하기",
          ],
          answer: 0,
          explainGood: "맞아요. 버려질 것에 <b>가치를 더해</b> 새 제품으로 만드는 것이 업사이클링이에요.",
          explainBad: "업사이클링은 버려질 것에 디자인 같은 <b>가치를 더해 새 제품</b>으로 만드는 거예요. 분리배출은 재활용, 물려주기는 재사용이에요.",
        }),
      ),
    ),
  },
});
