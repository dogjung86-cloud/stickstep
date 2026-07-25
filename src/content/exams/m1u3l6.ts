// 수학 중1 Ⅲ. 좌표평면과 그래프 v2 재출제 문항 풀 · L6 정비례 그래프: 원점을 지나는 직선(책 123~125쪽) 슬롯 112~133(22문항).
// 생성 파일: 수정은 qa/m1u3v2-*.ts(스테이징 정본)에서 한 뒤 node qa/build-m1u3v2-lessons.mjs 재실행.
// 규격 v2(정본 qa/m1u3-v2-blueprint.md · §3-0 우선): mcq 11/multi 2/num 9·word 0 · diff 9/8/5 ·
// 그림 13 · mfmt 미사용(slash 분수·withVars·U+2212) · 무그림은 화이트리스트 사유 태그 · em대시 금지.
import type { ExamItem } from "./types";
import { mExamRelChoicesFig, mExamRelationPlaneFig } from "../../ui/examFiguresMath";

const withVars = (text: string): string =>
  text.replace(/[xyabk]/g, (variable) => `<i class='mv'>${variable}</i>`);
const minus = (value: number | string): string => String(value).replace("-", "−");
const coordPair = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;

export const POOL_M1U3L6: ExamItem[] = [
  {
    // [슬롯 112] 검산: 그림 직선 a=4/5 > 0 → 오른쪽 위 방향 · 제1·3사분면 통과 ✓.
    //  조합 문장 보기(방향+사분면) 셔플 기본.
    id: "m1u3e112",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그림과 같은 정비례 관계의 그래프에 대한 설명으로 <b>옳은</b> 것은?",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 4 / 5, color: "#364FC7" }],
    }),
    options: [
      "오른쪽 위로 향하고 제1사분면과 제3사분면을 지나요",
      "오른쪽 아래로 향하고 제2사분면과 제4사분면을 지나요",
      "오른쪽 위로 향하고 제2사분면과 제4사분면을 지나요",
      "오른쪽 아래로 향하고 제1사분면과 제3사분면을 지나요",
      "원점을 지나지 않아요",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 직선은 왼쪽 아래에서 오른쪽 위로 올라가요. <i class='mv'>x</i>가 커질 때 <i class='mv'>y</i>도 커지는 방향이고, 원점을 지나면서 오른쪽 위(제1사분면)와 왼쪽 아래(제3사분면)를 통과하죠. 그래서 첫 번째 설명이 옳아요.<span class='xh'>오답 하나씩 격파</span>'오른쪽 아래로 향한다'는 배율 <i class='mv'>a</i>가 음수일 때의 모습이라 그림과 반대예요. '오른쪽 위로 향하며 제2·4사분면을 지난다'는 조합은 아예 성립할 수 없어요. 원점을 지나는 직선이 오른쪽 위로 향하면 반드시 1·3사분면 짝이고, 오른쪽 아래로 향하면 2·4사분면 짝이거든요. 방향과 사분면은 세트로 묶여 다닌다는 것, 그리고 정비례 그래프는 언제나 원점을 지난다는 것을 함께 기억해요.",
    core: "방향과 사분면 짝은 세트, a>0은 1·3사분면!",
  },
  {
    // [슬롯 113] 검산: 직선이 격자점 P(1, 7)을 지남 → 7=a×1 → a=7 ✓ (§3-0에서 (1, 4)→(1, 7)
    //  재설계 · s24=4와 값 분산). min −8·max 8·labelEvery 1이라 1·7 전부 라벨 눈금 위.
    //  |a|=7 직선이 y축에 바짝 서는 모양 자체가 이 레슨의 성질(|a| 클수록 y축에 가까움).
    id: "m1u3e113",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 그림과 같이 점 P를 지날 때, " + withVars("a") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -8,
      max: 8,
      size: 330,
      labelEvery: 1,
      lines: [{ a: 7, color: "#364FC7" }],
      points: [{ label: "P", x: 1, y: 7, color: "#364FC7", labelDx: 14, labelDy: 4 }],
    }),
    answer: "7",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (1, 7)이에요. 정비례 관계 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>의 그래프 위의 점이므로 좌표를 식에 대입하면 7=<i class='mv'>a</i>×1, 즉 <i class='mv'>a</i>=<b>7</b>이에요. <i class='mv'>x</i>=1일 때의 <i class='mv'>y</i>값이 바로 <i class='mv'>a</i>라는 성질을 쓰면 대입 없이도 한눈에 읽을 수 있죠.<span class='xh'>판독 함정 격파</span>P의 두 좌표를 거꾸로 읽어 (7, 1)로 보면 <i class='mv'>a</i>=1/7이 되어 완전히 다른 답이 나와요. 가로가 1, 세로가 7이라는 순서를 지켜요. 또 이 직선이 y축에 바짝 붙어 가파르게 선 것은 |<i class='mv'>a</i>|가 큰 정비례 그래프의 특징이에요. 가파르다고 겁먹지 말고 격자점 하나만 정확히 찾으면 돼요.",
    core: "그래프 위 격자점 하나면 a가 바로 나와요.",
  },
  {
    // [슬롯 114] 검산: y=−7x 대입 판별 · (2, −14): −7×2=−14 ✓ 정답. (−2, −14)는 14 ·
    //  (14, −2)는 −98 · (2, 14)는 부호 반대 · (−1, −7)은 7 · 전부 불일치 ✓ (통과점 (1, −7)은
    //  보기에 넣지 않음 · 복수 정답 방지). §3-0: 초판 y=5x → 7x(s132 충돌 회피)가 s113 정답
    //  a=7과 2차 충돌(검산 V2 적발) → 3차 교체 y=−7x(L6 내 ±7 노출은 이 문항의 −7뿐).
    id: "m1u3e114",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=−7x") + "의 그래프 <b>위에 있는</b> 점은?",
    options: [coordPair(2, -14), coordPair(-2, -14), coordPair(14, -2), coordPair(2, 14), coordPair(-1, -7)],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그래프 위의 점인지 확인하는 방법은 좌표를 식에 대입하는 거예요. (2, −14)를 넣으면 <i class='mv'>y</i>=−7×2=−14로 <i class='mv'>y</i>좌표와 정확히 일치하니 <b>(2, −14)</b>가 그래프 위의 점이에요.<span class='xh'>오답 하나씩 격파</span>(−2, −14)는 −7×(−2)=14라 y좌표의 부호가 어긋나고, (2, 14)도 같은 부호 함정의 반대쪽이에요. 배율이 음수면 <i class='mv'>x</i>와 <i class='mv'>y</i>의 부호가 반드시 반대라는 성질로 걸러낼 수 있죠. (14, −2)는 두 좌표를 거꾸로 짝지은 순서 함정으로 −7×14=−98이라 탈락해요. (−1, −7)은 −7×(−1)=7이라 y좌표가 반대예요. 다섯 좌표를 전부 대입 검사하는 것이 정석이고, 곱해서 <i class='mv'>y</i>가 나오는지 한 줄씩 확인하면 실수가 없어요.",
    core: "a가 음수면 두 좌표의 부호는 반드시 반대예요.",
  },
  {
    // [슬롯 115] 검산: 그림 직선은 y=−8x(부품 §3-0) · (1, k)를 지나므로 k=−8×1=−8 ✓.
    //  |a|=8이라 y축에 바짝 선 직선 · min −9·max 9·labelEvery 1로 (1, −8) 라벨 눈금 위.
    id: "m1u3e115",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같아요. 이 그래프가 점 " + withVars("(1, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -9,
      max: 9,
      size: 330,
      labelEvery: 1,
      lines: [{ a: -8, color: "#364FC7" }],
    }),
    answer: "-8",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>가로 1칸 자리에서 직선이 지나는 높이를 격자에서 읽으면 −8이에요. 즉 그래프가 (1, −8)을 지나므로 <i class='mv'>k</i>=<b>−8</b>이에요. <i class='mv'>x</i>=1일 때의 <i class='mv'>y</i>값은 정비례 관계식의 배율 그 자체라서, 이 직선이 <i class='mv'>y</i>=−8<i class='mv'>x</i>의 그래프라는 것도 함께 읽을 수 있죠.<span class='xh'>판독 함정 격파</span>직선이 y축에 바짝 붙어 가파르니 이웃 세로줄과 헷갈리기 쉬워요. 반드시 가로 1칸 지점에서 세로로 짚어 내려가며 격자 눈금을 세요. 부호를 놓치고 8이라 답하면 오른쪽 위로 향하는 정반대 직선이 되니, 직선의 방향(오른쪽 아래)과 답의 부호(음수)가 맞는지 마지막에 대조해요.",
    core: "x=1에서의 높이가 곧 배율이자 k예요.",
  },
  {
    // [슬롯 116] 검산: y=−3x는 원점을 지나는 오른쪽 아래 직선 → 카드 ②. 함정 ① 우상향
    //  직선·③ 1·3사분면 곡선·④ 원점 이탈 우상향·⑤ 2·4사분면 곡선. 근거는 방향·원점·직선
    //  여부만(기울어진 정도 비교 없음) · 라벨 보기 shuffle:false · 정답 ② (① 금지 ✓).
    id: "m1u3e116",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=−3x") + "의 그래프로 알맞은 것은?",
    figure: mExamRelChoicesFig([
      { line: { a: 0.8 } },
      { line: { a: -0.8 } },
      { inv: 1 },
      { line: { a: 0.8, bPx: 18 } },
      { inv: -1 },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>의 그래프는 언제나 원점을 지나는 직선이고, <i class='mv'>a</i>=−3처럼 <i class='mv'>a</i>가 음수이면 오른쪽 아래로 향하며 제2사분면과 제4사분면을 지나요. 두 조건을 모두 만족하는 카드는 <b>②</b>뿐이에요.<span class='xh'>오답 하나씩 격파</span>'①'은 원점을 지나지만 오른쪽 위로 향하니 <i class='mv'>a</i>가 양수인 그래프예요. '④'는 방향은 위쪽인 데다 원점을 지나지 않아 정비례 그래프 자체가 아니죠. '③'과 '⑤'는 한 쌍의 매끄러운 곡선이라 반비례 그래프예요. 식을 보고 직선인지 곡선인지, 원점을 지나는지, 어느 쪽으로 향하는지 세 가지만 차례로 확인하면 개형 문제는 틀릴 수 없어요.",
    core: "a가 음수인 정비례는 원점 지나 오른쪽 아래 직선!",
  },
  {
    // [슬롯 117] 검산: 격자점 (5, 3) 판독 → a=3/5 ✓ (§3-0에서 (4, 3)·3/4가 121 문두와
    //  충돌해 재설계). slash 보기 · 5/3은 역수·−3/5는 부호·3은 y좌표·15는 곱 함정.
    id: "m1u3e117",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 그림과 같이 점 P를 지날 때, " + withVars("a") + "의 값은?",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 3 / 5, color: "#364FC7" }],
      points: [{ label: "P", x: 5, y: 3, color: "#364FC7", labelDx: 13, labelDy: -6 }],
    }),
    options: ["3/5", "5/3", "−3/5", "3", "15"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (5, 3)이에요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에 대입하면 3=5<i class='mv'>a</i>이므로 <i class='mv'>a</i>=<b>3/5</b>예요. 배율이 1보다 작은 분수라서 직선이 완만하게 눕는 모양인 것도 그림과 맞아떨어지죠.<span class='xh'>오답 하나씩 격파</span>'5/3'은 <i class='mv'>x</i>÷<i class='mv'>y</i>로 거꾸로 나눈 역수 함정이에요. <i class='mv'>a</i>는 언제나 <i class='mv'>y</i>÷<i class='mv'>x</i>, 즉 세로를 가로로 나눈 값이에요. '−3/5'는 오른쪽 위로 향하는 그림과 부호가 어긋나고, '3'은 P의 y좌표를, '15'는 두 좌표의 곱을 답한 거예요. 곱은 반비례의 <i class='mv'>a</i>를 구할 때의 방법이니 두 관계식의 공식을 섞지 않도록 조심해요.",
    core: "a는 세로÷가로, 분수여도 당당한 배율이에요.",
  },
  {
    // [슬롯 118] 검산: (2, −8) 대입 → a=−4 → y=−4x에 x=−3 → k=(−4)×(−3)=12 ✓ 2단.
    id: "m1u3e118",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 두 점 " + withVars("(2, −8)") + ", " + withVars("(−3, k)") + "를 지나요. " + withVars("k") + "의 값을 구하세요.",
    answer: "12",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 좌표가 완전한 점 (2, −8)로 배율을 확정해요. −8=2<i class='mv'>a</i>에서 <i class='mv'>a</i>=−4이므로 그래프의 식은 <i class='mv'>y</i>=−4<i class='mv'>x</i>예요. 이제 <i class='mv'>x</i>=−3을 대입하면 <i class='mv'>k</i>=(−4)×(−3)=<b>12</b>죠.<span class='xh'>계산 함정 격파</span>부호 처리가 두 번 이어져요. −8÷2에서 음의 부호를 잃으면 <i class='mv'>a</i>=4가 되어 <i class='mv'>k</i>=−12로 뒤집히고, (−4)×(−3)을 −12로 쓰면 음수 곱셈 규칙을 놓친 거예요. 같은 그래프 위의 두 점은 반드시 같은 식을 만족한다는 것이 이 유형의 뼈대예요. 완전한 점으로 식을 만들고, 미지수가 있는 점을 대입하는 순서만 지키면 어떤 두 점 문제도 같은 길로 풀려요.",
    core: "완전한 점으로 식부터, 미지수 점은 그다음!",
  },
  {
    // [슬롯 119] 검산: 직선 y=(1/3)x · ㄱ 참(원점) · ㄴ 참((3, 1) 통과: 1=(1/3)×3 ✓ 격자
    //  판독 가능) · ㄷ 참(a>0이라 증가) · ㄹ 거짓((1, 3)은 자리 바꿈 · (1/3)×1=1/3≠3) ·
    //  ㅁ 거짓(오른쪽 위로 향함). answer [0,1,2].
    id: "m1u3e119",
    lessonId: "m1u3l6",
    type: "multi",
    prompt: "그림과 같은 정비례 관계의 그래프에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 1 / 3, color: "#364FC7" }],
    }),
    options: [
      "원점을 지나는 직선이에요",
      "점 (3, 1)을 지나요",
      "x의 값이 커지면 y의 값도 커져요",
      "점 (1, 3)을 지나요",
      "오른쪽 아래로 향해요",
    ],
    answer: [0, 1, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프는 원점을 지나는 직선이므로 정비례 관계이고 첫 설명은 참이에요. 격자를 따라가면 가로 3칸, 세로 1칸 지점에서 직선이 격자점을 정확히 지나므로 (3, 1)을 지난다는 설명도 참이죠. 직선이 오른쪽 위로 향하니 <i class='mv'>x</i>가 커질 때 <i class='mv'>y</i>도 커진다는 설명까지 참이에요.<span class='xh'>틀린 설명 격파</span>'(1, 3)을 지난다'는 (3, 1)의 두 수를 바꾼 함정이에요. 가로 1칸 지점에서 직선의 높이는 3이 아니라 1/3이라 격자점을 지나지도 않죠. 좌표의 순서가 바뀌면 완전히 다른 점이라는 L1의 원칙이 그래프에서도 그대로 살아 있어요. '오른쪽 아래로 향한다'는 눈에 보이는 방향과 정반대이고, 그건 <i class='mv'>a</i>가 음수일 때의 모습이에요.",
    core: "직선이 지나는 격자점을 찾고 순서 함정을 걸러요.",
  },
  {
    // [슬롯 120] 검산: (−1, 2)로 a=−2 확정 → (3, b)에서 b=−2×3=−6 ✓ (천재06 a+b 묶음
    //  계보의 부품형 · 수치 신작).
    id: "m1u3e120",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 두 점 " + withVars("(−1, 2)") + ", " + withVars("(3, b)") + "를 지나요. " + withVars("b") + "의 값을 구하세요.",
    answer: "-6",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>좌표가 완전한 점 (−1, 2)를 대입하면 2=−<i class='mv'>a</i>이므로 <i class='mv'>a</i>=−2예요. 그래프의 식은 <i class='mv'>y</i>=−2<i class='mv'>x</i>이고, <i class='mv'>x</i>=3을 넣으면 <i class='mv'>b</i>=−2×3=<b>−6</b>이에요. 두 점 (−1, 2)와 (3, −6)이 같은 직선 위에서 원점을 사이에 두고 반대쪽에 있는 그림을 떠올리면 부호가 자연스럽죠.<span class='xh'>계산 함정 격파</span>2=−<i class='mv'>a</i>에서 <i class='mv'>a</i>=2로 쓰면 음수 계수 확정에서 미끄러져요. <i class='mv'>x</i>가 −1일 때 <i class='mv'>y</i>가 양수 2라는 것은 배율이 음수라는 신호예요. 부호가 반대인 두 좌표를 보면 <i class='mv'>a</i>&lt;0을 예상하고 계산을 시작하는 감각을 길러 두면, 마지막 답 <i class='mv'>b</i>의 부호도 검산할 수 있어요.",
    core: "좌표 부호가 반대면 배율은 음수라는 신호예요.",
  },
  {
    // [슬롯 121] 검산: y=(3/4)x에서 x=3이면 y=9/4(≠4) → "(3, 4)를 지난다"가 거짓 = 정답 ✓.
    //  (4, 3)은 (3/4)×4=3으로 참. 대입 검증 함정(미래엔05ㄷ 계보).
    id: "m1u3e121",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=(3/4)x") + "의 그래프에 대한 설명으로 <b>옳지 않은</b> 것은?",
    options: [
      "점 (3, 4)를 지나요",
      "원점을 지나는 직선이에요",
      "오른쪽 위로 향해요",
      "점 (4, 3)을 지나요",
      "x의 값이 커지면 y의 값도 커져요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>수상한 좌표는 대입으로 검산해요. <i class='mv'>x</i>=3을 넣으면 <i class='mv'>y</i>=(3/4)×3=9/4이지 4가 아니에요. 그러니 '(3, 4)를 지난다'가 <b>옳지 않은</b> 설명이에요. 반대로 <i class='mv'>x</i>=4를 넣으면 <i class='mv'>y</i>=3이라 (4, 3)은 정확히 그래프 위의 점이죠.<span class='xh'>오답 하나씩 격파</span>나머지는 전부 참이에요. 정비례 그래프는 언제나 원점을 지나는 직선이고, 배율 3/4이 양수라 오른쪽 위로 향하며 <i class='mv'>x</i>가 커질 때 <i class='mv'>y</i>도 커져요. 이 문제의 함정은 (3, 4)와 (4, 3)이 나란히 등장한다는 거예요. 분수 배율 <i class='mv'>a</i>=3/4은 '가로 4칸에 세로 3칸'이라는 뜻이라, 지나는 격자점은 (4, 3)이에요. 분자와 분모가 어느 축의 몫인지 뒤집지 않도록 대입 검산을 습관화해요.",
    core: "수상한 점은 대입 검산, (4, 3)만 진짜예요.",
  },
  {
    // [슬롯 122] 검산: 조건 = 원점 통과 + 오른쪽 위 → ② 우상향 원점 직선 ✓. ① 곡선 ·
    //  ③ 우하향 · ④ 원점 이탈 우상향 · ⑤ 2·4사분면 곡선. 정답 ② (① 금지 ✓).
    id: "m1u3e122",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그래프가 <b>원점을 지나는 직선</b>이면서 <b>오른쪽 위로 향하는</b> 것은?",
    figure: mExamRelChoicesFig([
      { inv: 1 },
      { line: { a: 0.85 } },
      { line: { a: -0.85 } },
      { line: { a: 0.85, bPx: 16 } },
      { inv: -1 },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 그래프의 두 가지 신분증을 확인해요. 원점을 지나는가, 그리고 어느 방향인가. '②'는 원점을 지나는 곧은 직선이면서 오른쪽 위로 올라가므로 두 조건을 모두 만족해요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 <i class='mv'>a</i>&gt;0인 그래프의 표준 모습이죠.<span class='xh'>오답 하나씩 격파</span>'①'과 '⑤'는 한 쌍의 매끄러운 곡선이라 반비례 그래프예요. 방향 이전에 직선이 아니라는 점에서 탈락이죠. '③'은 직선이고 원점도 지나지만 오른쪽 아래로 향해 방향 조건에 걸려요. '④'는 오른쪽 위로 가긴 해도 원점을 비껴가서 정비례 그래프가 아니에요. 직선인가, 원점을 지나는가, 방향이 맞는가의 세 관문을 차례로 통과시키면 카드 문제는 기계적으로 풀려요.",
    core: "직선·원점·방향, 세 관문을 차례로 통과!",
  },
  {
    // [슬롯 123] 검산: y=(1/4)x에 x=8 → k=2 ✓ 분수 계수 대입.
    id: "m1u3e123",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=(1/4)x") + "의 그래프가 점 " + withVars("(8, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    answer: "2",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그래프가 (8, <i class='mv'>k</i>)를 지난다는 것은 <i class='mv'>x</i>=8일 때의 <i class='mv'>y</i>값이 <i class='mv'>k</i>라는 뜻이에요. 대입하면 <i class='mv'>k</i>=(1/4)×8=8÷4=<b>2</b>예요. 배율이 1/4이라는 것은 <i class='mv'>y</i>가 <i class='mv'>x</i>의 4분의 1이라는 뜻이니, 8의 4분의 1인 2가 바로 나오죠.<span class='xh'>계산 함정 격파</span>분수 배율에서 4를 곱해 32라고 답하면 1/4배와 4배를 뒤집은 거예요. (1/4)<i class='mv'>x</i>는 <i class='mv'>x</i>를 4로 나눈다는 뜻이에요. 또 8−4=4나 8+4=12처럼 연산을 바꿔 버리는 실수도 있어요. 분수 계수가 나오면 '분모로 나누고 분자를 곱한다'로 번역해 계산하면 헷갈릴 일이 없어요.",
    core: "(1/4)x는 x를 4로 나누라는 뜻이에요.",
  },
  {
    // [슬롯 124] 검산: ㉠은 (1, 4) 격자 통과 → a=4 · ㉡은 (1, −6) 통과 → a=−6 ✓
    //  (§3-0 재설계 부품 4·−6). ㉠㉡ 정의는 문두가 담당(가파른 직선의 lines label은
    //  x=max−0.4 고정 위치라 뷰박스 밖 클리핑 · 눈검수 반영, 그림 라벨 제거).
    //  ㉠㉡ 조합 보기 관례순 고정 · 정답 두 번째(① 금지 ✓).
    id: "m1u3e124",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt:
      "그림의 두 직선은 각각 정비례 관계 그래프예요. <b>오른쪽 위로 향하는</b> 직선을 ㉠, <b>오른쪽 아래로 향하는</b> 직선을 ㉡이라 할 때, ㉠과 ㉡의 " + withVars("a") + "(" + withVars("y=ax") + ") 값을 차례로 짝지은 것은?",
    figure: mExamRelationPlaneFig({
      min: -9,
      max: 9,
      size: 330,
      labelEvery: 1,
      lines: [
        { a: 4, color: "#364FC7" },
        { a: -6, color: "#E8547E" },
      ],
    }),
    options: ["㉠ −6, ㉡ 4", "㉠ 4, ㉡ −6", "㉠ 4, ㉡ 6", "㉠ 1/4, ㉡ −1/6", "㉠ −4, ㉡ 6"],
    answer: 1,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>각 직선이 지나는 격자점을 하나씩 찾아요. ㉠은 오른쪽 위로 향하며 (1, 4)를 지나므로 <i class='mv'>a</i>=4이고, ㉡은 오른쪽 아래로 향하며 (1, −6)을 지나므로 <i class='mv'>a</i>=−6이에요. 짝은 <b>㉠ 4, ㉡ −6</b>이죠. 방향이 위면 양수, 아래면 음수라는 부호 확인이 첫 번째 검산이에요.<span class='xh'>오답 하나씩 격파</span>'㉠ −6, ㉡ 4'는 두 직선의 값을 서로 바꾼 짝이고, '㉠ 4, ㉡ 6'은 ㉡의 방향(아래)을 보고도 부호를 놓친 답이에요. '㉠ 1/4, ㉡ −1/6'은 격자점을 (4, 1)·(−6, 1)로 거꾸로 읽어 역수가 된 경우죠. '㉠ −4, ㉡ 6'은 두 부호를 모두 뒤집은 답이에요. 직선이 두 개일 때는 하나씩 이름표를 붙여 가며 각각 판독하고, 마지막에 방향과 부호를 대조해요.",
    core: "직선마다 격자점 하나, 방향으로 부호 검산!",
  },
  {
    // [슬롯 125] 검산: P(2, 7) 판독 → x가 2배(2→4)면 y도 2배(7→14) → y=14 ✓
    //  (§3-0 재설계 · 배율 성질 경로 · 부품 a=7/2).
    id: "m1u3e125",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같이 점 P를 지나요. " + withVars("x=4") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -8,
      max: 8,
      size: 330,
      labelEvery: 1,
      lines: [{ a: 3.5, color: "#364FC7" }],
      points: [{ label: "P", x: 2, y: 7, color: "#364FC7", labelDx: 14, labelDy: -4 }],
    }),
    answer: "14",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (2, 7)이에요. 정비례에서는 <i class='mv'>x</i>가 2배가 되면 <i class='mv'>y</i>도 2배가 되죠. <i class='mv'>x</i>가 2에서 4로 2배가 되었으니 <i class='mv'>y</i>는 7의 2배인 <b>14</b>예요. 관계식으로 풀어도 <i class='mv'>a</i>=7/2이고 (7/2)×4=14로 같은 답이에요.<span class='xh'>계산 함정 격파</span>'<i class='mv'>x</i>가 2 커졌으니 <i class='mv'>y</i>도 2 커진다'로 읽으면 9라는 오답이 나와요. 정비례는 덧셈이 아니라 배율의 관계라는 것이 핵심이에요. 또 배율을 <i class='mv'>a</i>=2/7로 뒤집어 계산하는 실수도 있는데, 이 경로로는 답이 분수가 되어 버리니 신호로 삼아요. 분수 배율이 부담스러우면 이 문제처럼 '몇 배가 되었나'의 성질 경로가 훨씬 빠르고 안전해요.",
    core: "x가 2배면 y도 2배, 배율 경로가 지름길!",
  },
  {
    // [슬롯 126] 검산: a<0의 성질 = 오른쪽 아래 + 제2·4사분면 ✓ (문장 조합 보기).
    id: "m1u3e126",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=ax") + "에서 " + withVars("a") + "&lt;0일 때, 그래프에 대한 설명으로 <b>옳은</b> 것은?",
    options: [
      "오른쪽 아래로 향하고 제2사분면과 제4사분면을 지나요",
      "오른쪽 위로 향하고 제1사분면과 제3사분면을 지나요",
      "오른쪽 아래로 향하고 제1사분면과 제3사분면을 지나요",
      "x의 값이 커지면 y의 값도 커져요",
      "원점을 지나지 않아요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>a</i>가 음수이면 <i class='mv'>x</i>와 <i class='mv'>y</i>의 부호가 항상 반대예요. 그래서 그래프는 오른쪽으로 갈수록 내려가고, 부호가 반대인 구역인 제2사분면(−, +)과 제4사분면(+, −)을 지나요. 첫 번째 설명이 정확해요.<span class='xh'>오답 하나씩 격파</span>'오른쪽 위 + 1·3사분면'은 <i class='mv'>a</i>&gt;0일 때의 이야기예요. '오른쪽 아래 + 1·3사분면'은 있을 수 없는 조합이고요. 방향이 아래면 사분면 짝은 자동으로 2·4예요. '<i class='mv'>x</i>가 커지면 <i class='mv'>y</i>도 커진다'는 <i class='mv'>a</i>&gt;0의 성질이라 반대이고, '원점을 지나지 않는다'는 정비례 그래프의 신분증을 부정하는 설명이에요. <i class='mv'>a</i>의 부호 하나가 방향·사분면·증감을 한꺼번에 정한다는 것을 세트로 기억해요.",
    core: "a<0이면 내리막, 2·4사분면 세트예요.",
  },
  {
    // [슬롯 127] 검산: ㄱ 참(원점 통과) · ㄴ 참(a>0 우상향) · ㄹ 참(x=1일 때 y=a) ·
    //  ㄷ 거짓(a<0은 2·4사분면) · ㅁ 거짓(직선). answer [0, 1, 3].
    id: "m1u3e127",
    lessonId: "m1u3l6",
    type: "multi",
    prompt: "정비례 관계 " + withVars("y=ax") + "(" + withVars("a") + "는 0이 아닌 수)의 그래프에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "원점을 지나요",
      "a>0이면 오른쪽 위로 향해요",
      "a<0이면 제1사분면과 제3사분면을 지나요",
      "x=1일 때 y의 값은 a예요",
      "그래프는 매끄러운 곡선이에요",
    ],
    answer: [0, 1, 3],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 그래프는 <i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=0이라 반드시 원점을 지나고, <i class='mv'>a</i>&gt;0이면 오른쪽 위로 향해요. 또 <i class='mv'>x</i>=1을 대입하면 <i class='mv'>y</i>=<i class='mv'>a</i>×1=<i class='mv'>a</i>이니 그래프는 언제나 점 (1, <i class='mv'>a</i>)를 지나요. 격자에서 가로 1칸 자리의 높이만 읽으면 <i class='mv'>a</i>가 바로 나오는, 그래프에서 배율을 읽는 지름길 성질이죠.<span class='xh'>틀린 설명 격파</span><i class='mv'>a</i>&lt;0일 때 지나는 구역은 제2사분면과 제4사분면이에요. 1·3사분면은 <i class='mv'>a</i>&gt;0의 몫이니 부호와 구역의 짝을 바꾼 함정이죠. 그리고 정비례 그래프는 언제나 곧은 직선이에요. 매끄러운 곡선은 반비례 그래프의 모습이라, 두 그래프의 정체성을 맞바꾼 설명이에요. 판별 문제에서는 부호와 구역의 짝, 직선과 곡선의 짝을 바꿔치기하는 보기가 단골이라는 것을 기억해요.",
    core: "원점 통과 직선, (1, a)가 열쇠 점이에요.",
  },
  {
    // [슬롯 128] 검산: 그림 직선 y=−5x(부품) · (−1, k)에서 k=(−5)×(−1)=5 ✓ 그림 (−1, 5)
    //  격자 판독 (§3-0에서 값 10→5 재배정).
    id: "m1u3e128",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같아요. 이 그래프가 점 " + withVars("(−1, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: -5, color: "#364FC7" }],
    }),
    answer: "5",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>가로 −1칸 자리에서 직선이 지나는 높이를 격자에서 읽으면 5예요. 즉 그래프가 (−1, 5)를 지나므로 <i class='mv'>k</i>=<b>5</b>예요. 이 직선은 (1, −5)도 지나니 <i class='mv'>y</i>=−5<i class='mv'>x</i>의 그래프이고, <i class='mv'>x</i>=−1을 대입하면 (−5)×(−1)=5로 계산과 판독이 일치해요.<span class='xh'>판독 함정 격파</span>오른쪽 아래로 향하는 직선이니 <i class='mv'>y</i>값도 음수일 거라고 지레짐작해 −5라 답하면, <i class='mv'>x</i>가 음수인 왼쪽에서는 직선이 x축 위쪽에 있다는 것을 놓친 거예요. 내리막 직선도 왼쪽 절반에서는 양수 <i class='mv'>y</i>를 가져요. 부호는 직선의 방향이 아니라 묻는 지점의 실제 위치에서 읽어야 한다는 것이 이 문제의 교훈이에요.",
    core: "내리막 직선도 왼쪽에서는 y가 양수예요.",
  },
  {
    // [슬롯 129] 검산: 원점을 지나는 것은 y=3x뿐 ✓ (y=3x+1은 (0, 1) · y=3/x·xy=3은 반비례
    //  원점 비통과 · y=4−x는 (0, 4)).
    id: "m1u3e129",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그래프가 <b>원점을 지나는</b> 것은?",
    options: [withVars("y=3x"), withVars("y=3x+1"), withVars("y=3/x"), withVars("y=4−x"), withVars("xy=3")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>원점 (0, 0)을 지나는지 확인하려면 <i class='mv'>x</i>=0을 넣어 <i class='mv'>y</i>=0이 되는지 보면 돼요. <i class='mv'>y</i>=3<i class='mv'>x</i>는 3×0=0이라 통과예요. 0에 무엇을 곱해도 0이라는 성질이 정비례 그래프가 항상 원점을 지나는 이유죠.<span class='xh'>오답 하나씩 격파</span><i class='mv'>y</i>=3<i class='mv'>x</i>+1은 <i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=1이라 원점을 살짝 비껴가요. +1 하나가 그래프 전체를 들어 올린 셈이에요. <i class='mv'>y</i>=4−<i class='mv'>x</i>도 (0, 4)를 지나 탈락이죠. <i class='mv'>y</i>=3/<i class='mv'>x</i>와 <i class='mv'>xy</i>=3은 반비례라 <i class='mv'>x</i>=0 자체가 금지 구역이고, 곡선이 축에 한없이 가까워질 뿐 원점 근처에도 못 가요. '0 대입 검사'는 원점 통과를 판별하는 만능 열쇠랍니다.",
    core: "x=0에 y=0이 나와야 원점 통과예요.",
  },
  {
    // [슬롯 130] 검산: 조건 = 원점 통과 직선 + 오른쪽 아래 → 카드 ③. 함정 ② 곡선(방향은
    //  비슷해도 직선 아님)·④ 우하향이지만 원점 이탈·⑤ 원점 이탈 우상향·① 우상향.
    //  두 조건 동시 판정 복합 · 정답 ③ (① 금지 ✓).
    id: "m1u3e130",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그래프가 <b>원점을 지나는 직선</b>이면서 <b>오른쪽 아래로 향하는</b> 것은?",
    figure: mExamRelChoicesFig([
      { line: { a: 0.9 } },
      { inv: -1 },
      { line: { a: -0.9 } },
      { line: { a: -0.9, bPx: -16 } },
      { line: { a: 0.9, bPx: 14 } },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 2,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>조건이 두 개예요. 원점을 지나는 직선이어야 하고, 동시에 오른쪽 아래로 향해야 하죠. '③'은 원점을 지나는 직선이면서 오른쪽 아래로 내려가므로 두 조건을 모두 만족해요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 <i class='mv'>a</i>&lt;0인 그래프의 모습 그대로예요.<span class='xh'>오답 하나씩 격파</span>'②'는 오른쪽 아래로 향하는 것처럼 보이지만 한 쌍의 곡선이라 반비례 그래프이고 원점도 지나지 않아요. '④'는 방향은 맞는데 직선이 원점을 비껴가서 정비례 그래프가 아니죠. '①'과 '⑤'는 둘 다 오른쪽 위로 향해서 방향 조건에서 탈락해요. 조건이 두 개인 문제는 하나만 확인하고 멈추지 말고, 카드마다 두 조건에 전부 체크 표시를 해 보는 게 안전해요.",
    core: "조건 둘 다 만족하는 카드만 살아남아요.",
  },
  {
    // [슬롯 131] 검산: 점 P(3, 5) 격자 판독 → x가 3에서 6으로 2배가 되면 y도 5에서 2배 →
    //  (6, 10), k=10 ✓ (§3-0 재설계 · a=5/3 분수 경유 없이 정비례 배율 성질로 푸는 경로).
    id: "m1u3e131",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같이 점 P를 지나요. 이 그래프가 점 " + withVars("(6, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 5 / 3, color: "#364FC7" }],
      points: [{ label: "P", x: 3, y: 5, color: "#364FC7", labelDx: 14, labelDy: -6 }],
    }),
    answer: "10",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (3, 5)예요. 정비례 관계에서는 <i class='mv'>x</i>가 2배가 되면 <i class='mv'>y</i>도 2배가 돼요. <i class='mv'>x</i>가 3에서 6으로 2배가 되었으니 <i class='mv'>y</i>는 5의 2배인 <b>10</b>, 즉 <i class='mv'>k</i>=10이에요. 관계식으로 풀어도 같아요. 5=3<i class='mv'>a</i>에서 <i class='mv'>a</i>=5/3이고, <i class='mv'>y</i>=(5/3)×6=10이죠.<span class='xh'>계산 함정 격파</span>'<i class='mv'>x</i>가 3만큼 커졌으니 <i class='mv'>y</i>도 3만큼 커진다'고 보면 8이라는 오답이 나와요. 정비례는 '같은 양을 더하는' 관계가 아니라 '같은 배율로 곱하는' 관계예요. 또 P를 (5, 3)으로 거꾸로 읽으면 배율 경로가 전부 어긋나니, 판독 순서도 늘 조심해요.",
    core: "정비례는 더하기가 아니라 배율, 2배면 2배!",
  },
  {
    // [슬롯 132] 검산: 격자점 (2, 5) 판독 → a=5/2 → 식 y=(5/2)x ✓ slash 보기.
    //  (2/5)x는 역수 · 5x는 y좌표 오독 · 2x+1은 원점 이탈 · 10/x는 곱 함정.
    id: "m1u3e132",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그림과 같이 점 P를 지나는 정비례 관계 그래프의 <b>관계식</b>은?",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 2.5, color: "#364FC7" }],
      points: [{ label: "P", x: 2, y: 5, color: "#364FC7", labelDx: 13, labelDy: -6 }],
    }),
    options: [withVars("y=(5/2)x"), withVars("y=(2/5)x"), withVars("y=5x"), withVars("y=2x+1"), withVars("y=10/x")],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표는 (2, 5)예요. 정비례 관계식 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에 대입하면 5=2<i class='mv'>a</i>에서 <i class='mv'>a</i>=5/2이고, 관계식은 <b><i class='mv'>y</i>=(5/2)<i class='mv'>x</i></b>예요. 검산으로 <i class='mv'>x</i>=2를 넣으면 (5/2)×2=5로 P를 정확히 지나죠.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=(2/5)<i class='mv'>x</i>'는 가로와 세로를 거꾸로 나눈 역수 함정이에요. '<i class='mv'>y</i>=5<i class='mv'>x</i>'는 P의 y좌표 5를 그대로 배율로 쓴 것인데, 그 직선은 (2, 10)을 지나 버려요. '<i class='mv'>y</i>=2<i class='mv'>x</i>+1'은 (2, 5)를 지나긴 하지만 원점을 지나지 않아 정비례 관계식이 아니고, '<i class='mv'>y</i>=10/<i class='mv'>x</i>'는 곱 10이 일정한 반비례 곡선이에요. 점 하나를 지나는 식은 많아도 '원점을 지나는 정비례'라는 조건이 답을 하나로 좁혀 줘요.",
    core: "정비례 조건이 (2, 5)를 지나는 식을 하나로!",
  },
  {
    // [슬롯 133] 검산: y=9x에 x=2 → k=18 ✓ 기초 대입.
    id: "m1u3e133",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=9x") + "의 그래프가 점 " + withVars("(2, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    answer: "18",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그래프가 (2, <i class='mv'>k</i>)를 지난다는 것은 <i class='mv'>x</i>=2일 때의 <i class='mv'>y</i>값이 <i class='mv'>k</i>라는 뜻이에요. <i class='mv'>y</i>=9<i class='mv'>x</i>에 대입하면 <i class='mv'>k</i>=9×2=<b>18</b>이에요. 그래프 위의 점과 식의 대입은 같은 말이라는 것, 이것이 그래프 단원의 가장 기본 문법이에요.<span class='xh'>계산 함정 격파</span>9+2=11로 더하거나 9−2=7로 빼는 연산 착오가 가장 흔해요. 9<i class='mv'>x</i>는 9와 <i class='mv'>x</i>의 곱이라는 표기 약속을 확인해요. 또 (2, <i class='mv'>k</i>)에서 2가 <i class='mv'>y</i>좌표라고 착각해 2=9<i class='mv'>k</i>를 풀면 분수가 나오는데, 순서쌍의 앞자리는 언제나 <i class='mv'>x</i>예요. 이상한 분수가 나오면 자리를 바꿔 읽었는지 의심하는 것도 좋은 습관이에요.",
    core: "지나는 점 = 대입, k는 9×2로 끝나요.",
  },
];
