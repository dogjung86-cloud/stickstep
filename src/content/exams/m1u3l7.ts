// 수학 중1 Ⅲ. 좌표평면과 그래프 v2 재출제 문항 풀 · L7 반비례: 곱이 일정한 관계(책 126~128쪽) 슬롯 134~155(22문항).
// 생성 파일: 수정은 qa/m1u3v2-*.ts(스테이징 정본)에서 한 뒤 node qa/build-m1u3v2-lessons.mjs 재실행.
// 규격 v2(정본 qa/m1u3-v2-blueprint.md · §3-0 우선): mcq 11/multi 2/num 9·word 0 · diff 9/9/4 ·
// 그림 5 · mfmt 미사용(slash 분수·withVars·U+2212) · 무그림은 화이트리스트 사유 태그 · em대시 금지.
import type { ExamItem } from "./types";
import { mExamTableFig } from "../../ui/examFiguresMath";

const withVars = (text: string): string =>
  text.replace(/[xyabkp]/g, (variable) => `<i class='mv'>${variable}</i>`);

export const POOL_M1U3L7: ExamItem[] = [
  {
    // [슬롯 134] 검산: y=9/x만 분모에 x가 있는 반비례 ✓. y=x/9는 (1/9)x 정비례 함정,
    //  y=9x 정비례·y=9−x 뺄셈·y=x+9 덧셈. 레슨 binSort 세트(200/x·x/5·60·−12/x)와 분리.
    id: "m1u3e134",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례</b>하는 것은?",
    options: [withVars("y=9/x"), withVars("y=x/9"), withVars("y=9x"), withVars("y=9−x"), withVars("y=x+9")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례는 <i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i>(<i class='mv'>a</i>는 0이 아닌 수) 꼴, 즉 <b>분모에 <i class='mv'>x</i>가 있는</b> 관계예요. <i class='mv'>y</i>=9/<i class='mv'>x</i>는 <i class='mv'>a</i>=9인 반비례가 맞고, 두 변수의 곱 <i class='mv'>xy</i>가 항상 9로 일정하죠.<span class='xh'>오답 하나씩 격파</span>가장 위험한 함정은 '<i class='mv'>y</i>=<i class='mv'>x</i>/9'예요. 나눗셈이 보이지만 <i class='mv'>x</i>가 분자에 있어서 (1/9)×<i class='mv'>x</i>, 곧 정비례예요. <i class='mv'>x</i>가 분모에 있는지 분자에 있는지가 갈림길이에요. '<i class='mv'>y</i>=9<i class='mv'>x</i>'는 곱하는 정비례이고, '<i class='mv'>y</i>=9−<i class='mv'>x</i>'와 '<i class='mv'>y</i>=<i class='mv'>x</i>+9'는 빼거나 더하는 관계라 <i class='mv'>x</i>가 2배일 때 <i class='mv'>y</i>가 1/2배가 되지 않아요.",
    core: "x가 분모에 있어야 반비례, 분자면 정비례예요.",
  },
  {
    // [슬롯 135] 검산: 반비례의 a는 곱 · a=xy=2×9=18 ✓.
    id: "m1u3e135",
    lessonId: "m1u3l7",
    type: "num",
    prompt: withVars("y") + "가 " + withVars("x") + "에 반비례하고 " + withVars("x=2") + "일 때 " + withVars("y=9") + "예요. " + withVars("y=a/x") + "라 할 때 " + withVars("a") + "의 값을 구하세요.",
    answer: "18",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례 관계 <i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i>의 양변에 <i class='mv'>x</i>를 곱하면 <i class='mv'>xy</i>=<i class='mv'>a</i>예요. 즉 반비례에서 <i class='mv'>a</i>는 두 변수의 <b>곱</b>이죠. 주어진 한 쌍을 곱하면 <i class='mv'>a</i>=2×9=<b>18</b>이에요. 관계식은 <i class='mv'>y</i>=18/<i class='mv'>x</i>이고, <i class='mv'>x</i>=2를 다시 넣으면 9가 나와 조건과 맞아요.<span class='xh'>계산 함정 격파</span>정비례의 습관대로 9÷2를 계산하면 4.5라는 엉뚱한 값이 나와요. 나눗셈은 정비례의 <i class='mv'>a</i>, 곱셈은 반비례의 <i class='mv'>a</i>라는 두 공식을 짝으로 기억해요. 또 9−2나 9+2처럼 덧뺄셈으로 접근하는 것도 곱이 일정하다는 반비례의 본질과 어긋나죠. '반비례는 곱이 보물'이라는 한 문장이면 충분해요.",
    core: "반비례의 a는 곱, 2×9면 끝이에요.",
  },
  {
    // [슬롯 136] 검산: 쿠키 36개 고정 나눔 → y=36/x 반비례 ✓. 오답 = 정비례 2(가격·둘레)·
    //  뺄셈 1(남은 개수)·무관계 1(나이와 몸무게).
    id: "m1u3e136",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례하는</b> 상황은?",
    options: [
      "쿠키 36개를 x명이 남김없이 똑같이 나눌 때 한 명이 받는 개수 y개",
      "한 개 500원인 아이스크림 x개의 가격 y원",
      "쿠키 36개 중 x개를 먹고 남은 개수 y개",
      "나이가 x살인 사람의 몸무게 y kg",
      "한 변이 x cm인 정사각형의 둘레 y cm",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>쿠키 전체 36개가 고정된 채 <i class='mv'>x</i>명이 똑같이 나누면 (사람 수)×(한 명의 개수)=36이 항상 성립해요. <i class='mv'>y</i>=36/<i class='mv'>x</i>인 반비례죠. 사람이 2배가 되면 한 명 몫이 정확히 절반이 되는 관계예요.<span class='xh'>오답 하나씩 격파</span>아이스크림 가격은 <i class='mv'>y</i>=500<i class='mv'>x</i>, 정사각형 둘레는 <i class='mv'>y</i>=4<i class='mv'>x</i>로 둘 다 정비례예요. 남은 쿠키는 <i class='mv'>y</i>=36−<i class='mv'>x</i>인 빼기 관계인데, 줄어든다고 다 반비례가 아니라는 대표 함정이죠. 곱 검사를 하면 1×35, 2×34처럼 곱이 제멋대로예요. 나이와 몸무게는 사람마다 달라 식 자체가 없고요. 반비례의 신호는 '전체가 고정된 나눔', 검산은 곱이 일정한지예요.",
    core: "전체 고정 나눔이 반비례, 곱 검사로 확인!",
  },
  {
    // [슬롯 137] 검산: 표의 곱 = 2×18=3×12=6×6=36 일정 → ㉠은 x=4 열 → 36÷4=9 ✓.
    id: "m1u3e137",
    lessonId: "m1u3l7",
    type: "num",
    prompt: "표는 " + withVars("y") + "가 " + withVars("x") + "에 반비례하는 관계를 나타낸 거예요. ㉠에 알맞은 수를 구하세요.",
    figure: mExamTableFig(["x", "2", "3", "4", "6"], [["y", "18", "12", "㉠", "6"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    answer: "9",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례라 했으니 <i class='mv'>x</i>×<i class='mv'>y</i>가 일정해요. 채워진 열에서 2×18=36, 3×12=36, 6×6=36이므로 일정한 곱은 36이에요. ㉠은 <i class='mv'>x</i>=4일 때의 값이니 36÷4=<b>9</b>죠.<span class='xh'>계산 함정 격파</span>이웃 값 12와 6 사이라며 어림으로 9를 쓰는 건 이번엔 우연히 맞지만 검사 없이는 위험해요. 반드시 곱부터 확정하고 나눠요. 또 <i class='mv'>y</i>값이 18, 12, ㉠, 6으로 줄어드는 규칙을 '6씩 감소'로 읽어 ㉠=6이라고 하면, 반비례는 일정한 차로 줄지 않는다는 것을 놓친 거예요. <i class='mv'>x</i>가 커질수록 줄어드는 폭이 작아지는 것이 반비례의 리듬이랍니다.",
    core: "곱 36부터 확정, 빈칸은 곱÷x예요.",
  },
  {
    // [슬롯 138] 검산: xy=48의 양변을 x로 나누면 y=48/x ✓ (천재05ㅂ 변형 표기 계보).
    id: "m1u3e138",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "관계식 " + withVars("xy=48") + "과 <b>같은 관계</b>를 나타내는 것은?",
    options: [withVars("y=48/x"), withVars("y=48x"), withVars("y=x/48"), withVars("y=48−x"), withVars("y=x+48")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>xy</i>=48은 두 변수의 곱이 항상 48이라는 뜻이에요. 양변을 <i class='mv'>x</i>로 나누면 <i class='mv'>y</i>=<b>48/<i class='mv'>x</i></b>가 되죠. 곱이 일정한 관계와 <i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i> 꼴은 같은 반비례의 두 가지 표기일 뿐이에요.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=48<i class='mv'>x</i>'는 정비례라 곱이 48<i class='mv'>x</i>²으로 계속 변하고, '<i class='mv'>y</i>=<i class='mv'>x</i>/48'도 (1/48)배인 정비례예요. '<i class='mv'>y</i>=48−<i class='mv'>x</i>'와 '<i class='mv'>y</i>=<i class='mv'>x</i>+48'은 합이나 차에 관한 관계라 곱을 일정하게 지키지 못하죠. 변형 표기를 만나면 '양변을 <i class='mv'>x</i>로 나눠 <i class='mv'>y</i>=꼴로 정리한다'는 한 수만 기억하면 정체가 바로 드러나요.",
    core: "xy=48을 x로 나누면 y=48/x, 같은 옷이에요.",
  },
  {
    // [슬롯 139] 검산: a=xy=(−4)×5=−20 ✓ 음수 곱.
    id: "m1u3e139",
    lessonId: "m1u3l7",
    type: "num",
    prompt: withVars("y") + "가 " + withVars("x") + "에 반비례하고 " + withVars("x=−4") + "일 때 " + withVars("y=5") + "예요. " + withVars("y=a/x") + "라 할 때 " + withVars("a") + "의 값을 구하세요.",
    answer: "-20",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>반비례의 <i class='mv'>a</i>는 두 변수의 곱이에요. <i class='mv'>a</i>=(−4)×5=<b>−20</b>이죠. 관계식은 <i class='mv'>y</i>=−20/<i class='mv'>x</i>이고, <i class='mv'>x</i>=−4를 다시 넣으면 −20÷(−4)=5로 처음 조건이 재현돼요. <i class='mv'>a</i>가 음수인 반비례도 얼마든지 있어요.<span class='xh'>계산 함정 격파</span>(−4)×5를 20으로 쓰면 음수 곱셈의 부호를 잃은 거예요. 음수와 양수의 곱은 음수죠. 부호가 헷갈리면 검산 대입에서 바로 들통나요. 20이라면 <i class='mv'>x</i>=−4일 때 <i class='mv'>y</i>=−5가 되어 조건과 어긋나거든요. '곱으로 구하고 대입으로 검산'의 왕복 두 걸음이 부호 실수를 걸러 주는 안전망이에요.",
    core: "a는 곱 그대로, 부호까지 함께 가져와요.",
  },
  {
    // [슬롯 140] 검산: 맞물린 톱니바퀴는 (톱니 수)×(회전수)가 서로 같음 · A: 24×5=120 =
    //  B: x×y → y=120/x ✓ (교과서 정석 소재 · 반비례 관계식 세우기).
    id: "m1u3e140",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt:
      "맞물려 도는 두 톱니바퀴 A, B가 있어요. A의 톱니는 <b>24개</b>이고, A가 <b>5바퀴</b> 도는 동안 톱니가 " + withVars("x") + "개인 B는 " + withVars("y") + "바퀴 돌아요. " + withVars("x") + "와 " + withVars("y") + " 사이의 관계식은?",
    options: [withVars("y=120/x"), withVars("y=24x"), withVars("y=120x"), withVars("y=x/120"), withVars("y=24/x")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>맞물린 톱니바퀴는 지나간 톱니 수가 서로 같아요. A쪽은 24개×5바퀴=120개의 톱니가 지나가므로, B쪽도 <i class='mv'>x</i>×<i class='mv'>y</i>=120이어야 해요. 정리하면 <b><i class='mv'>y</i>=120/<i class='mv'>x</i></b>인 반비례예요. 톱니가 많은 바퀴일수록 천천히 도는 일상 감각과도 맞죠.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=24<i class='mv'>x</i>'나 '<i class='mv'>y</i>=120<i class='mv'>x</i>'는 톱니가 많을수록 더 많이 돈다는 식이라 방향이 반대예요. '<i class='mv'>y</i>=24/<i class='mv'>x</i>'는 A의 회전수 5를 곱하지 않아 일정한 곱을 24로 잘못 잡은 답이죠. 톱니 문제의 열쇠는 '무엇이 보존되는가'예요. 지나간 톱니 수 120이 바로 그 고정된 전체랍니다.",
    core: "맞물림 = 지나간 톱니 수 보존, 곱이 120!",
  },
  {
    // [슬롯 141] 검산: 전체 720 L 고정 → xy=720, y=720/x. x=24이면 y=720÷24=30분 ✓
    //  (비상06-4 수영장 1800 L·레슨 수영장 2400 L과 수치·소재 분리 · 물탱크).
    id: "m1u3e141",
    lessonId: "m1u3l7",
    type: "num",
    prompt: "들이가 <b>720 L</b>인 빈 물탱크에 1분에 " + withVars("x") + " L씩 일정하게 물을 넣으면 가득 채우는 데 " + withVars("y") + "분이 걸려요. 1분에 <b>24 L</b>씩 넣을 때 걸리는 시간은 몇 분인지 구하세요.",
    answer: "30",
    numKind: "int",
    unitLabel: "분",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>1분에 넣는 양과 걸리는 시간을 곱하면 언제나 물탱크 전체의 들이가 돼요. 즉 <i class='mv'>xy</i>=720이고, 관계식은 <i class='mv'>y</i>=720/<i class='mv'>x</i>인 반비례예요. <i class='mv'>x</i>=24를 대입하면 <i class='mv'>y</i>=720÷24=<b>30</b>분이에요. 검산으로 24×30=720이 전체 들이와 맞는지 확인하면 완벽하죠.<span class='xh'>계산 함정 격파</span>720에서 24를 빼거나 더하는 계산은 '전체가 고정된 나눗셈 상황'을 담지 못해요. 반비례 활용의 첫걸음은 항상 '무엇이 고정되어 있나'를 찾는 거예요. 여기서는 물탱크의 들이 720 L가 그 고정된 전체예요. 1분에 넣는 양이 많아질수록 시간이 줄어드는 방향까지 확인하면, 답이 720보다 훨씬 작은 것도 자연스럽게 이해돼요.",
    core: "전체가 고정이면 곱이 일정, xy=720이 열쇠예요.",
  },
  {
    // [슬롯 142] 검산: ㄱ 참(1/2배 성질) · ㄴ 참(xy 일정) · ㄷ 참(분모 0 금지) ·
    //  ㄹ 거짓(x 커지면 y 작아짐 · x>0 기준) · ㅁ 거짓(a=0이면 관계 자체가 무너짐). [0,1,2].
    id: "m1u3e142",
    lessonId: "m1u3l7",
    type: "multi",
    prompt: "반비례 관계 " + withVars("y=a/x") + "(" + withVars("a") + "는 0이 아닌 수)에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "x의 값이 2배가 되면 y의 값은 1/2배가 돼요",
      "두 변수의 곱 xy는 항상 a로 일정해요",
      "x의 값으로 0을 사용할 수 없어요",
      "x의 값이 커지면 y의 값도 항상 커져요",
      "a는 0이어도 돼요",
    ],
    answer: [0, 1, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>반비례의 정의가 '<i class='mv'>x</i>가 2배, 3배가 되면 <i class='mv'>y</i>는 1/2배, 1/3배가 된다'예요. 양변에 <i class='mv'>x</i>를 곱하면 <i class='mv'>xy</i>=<i class='mv'>a</i>라 곱이 일정한 것도 맞고, <i class='mv'>x</i>는 나누는 수라 0이 될 수 없다는 것도 참이에요. 0으로 나누기는 수학에 없으니까요.<span class='xh'>틀린 설명 격파</span>'<i class='mv'>x</i>가 커지면 <i class='mv'>y</i>도 커진다'는 정비례의 이야기예요. 반비례는 곱을 지키느라 한쪽이 커지면 다른 쪽이 작아지죠. 그리고 <i class='mv'>a</i>=0이면 <i class='mv'>y</i>가 항상 0이 되어 '곱이 일정한 관계'라 부를 것이 없어져요. 그래서 정비례든 반비례든 <i class='mv'>a</i>는 0이 아니라는 단서가 늘 붙는답니다.",
    core: "2배면 1/2배, 곱은 일정, x=0은 금지!",
  },
  {
    // [슬롯 143] 검산: (가) y/x=4 일정(정비례) · (나) 곱 24 일정(반비례 ✓) · (다) 합 12
    //  일정(x+y=12). 라벨 보기 고정 · 정답 (나) 두 번째(① 금지 ✓).
    id: "m1u3e143",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "세 표 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례하는</b> 것은?",
    figure:
      mExamTableFig(["x", "1", "2", "4"], [["y", "4", "8", "16"]], { title: "(가)", aria: "표 (가)의 x와 y의 대응" }) +
      mExamTableFig(["x", "1", "2", "4"], [["y", "24", "12", "6"]], { title: "(나)", aria: "표 (나)의 x와 y의 대응" }) +
      mExamTableFig(["x", "1", "2", "4"], [["y", "11", "10", "8"]], { title: "(다)", aria: "표 (다)의 x와 y의 대응" }),
    options: ["(가)", "(나)", "(다)", "(나)와 (다)", "없다"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례 판별은 곱 검사예요. 표 (나)는 1×24=2×12=4×6=24로 곱이 전부 24라 <i class='mv'>y</i>=24/<i class='mv'>x</i>인 반비례예요. 답은 <b>(나)</b>죠.<span class='xh'>오답 하나씩 격파</span>표 (가)는 4÷1=8÷2=16÷4=4로 나눈 값이 일정한 정비례예요. 곱은 4, 16, 64로 제각각이죠. 표 (다)는 <i class='mv'>y</i>가 줄어들긴 하지만 곱이 11, 20, 32로 흩어져요. 사실 (다)는 합이 12로 일정한 관계라, '줄어드니까 반비례'라는 착각을 정면으로 깨는 표예요. 감소하는 표를 만나면 곱 검사부터, 증가하는 표를 만나면 나눗셈 검사부터 돌리는 습관을 들여요.",
    core: "줄어든다고 반비례가 아니에요, 곱 검사!",
  },
  {
    // [슬롯 144] 검산: y=32/x에 x=8 → 32÷8=4 ✓ (레슨 60/x·12/x 회피 · 초판 24/x는 s140
    //  오답 보기와 레슨 내 같은 관계식 노출이라 32/x로 교체 · 게이트 WARN 반영).
    id: "m1u3e144",
    lessonId: "m1u3l7",
    type: "num",
    prompt: "반비례 관계 " + withVars("y=32/x") + "에서 " + withVars("x=8") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    answer: "4",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>관계식에 대입만 하면 돼요. <i class='mv'>y</i>=32/<i class='mv'>x</i>에 <i class='mv'>x</i>=8을 넣으면 <i class='mv'>y</i>=32÷8=<b>4</b>예요. 두 변수의 곱이 8×4=32로 일정하다는 반비례의 약속도 그대로 확인되죠.<span class='xh'>계산 함정 격파</span>32×8=256을 계산하면 대입과 곱 검사를 혼동한 거예요. 식이 이미 주어진 문제에서는 나누기만 하면 되고, 곱하기는 <i class='mv'>a</i>를 모를 때 구하는 방법이에요. 또 32−8=24나 32+8=40처럼 연산을 바꾸면 반비례의 구조가 사라져요. 분수 표기 32/<i class='mv'>x</i>는 '32를 <i class='mv'>x</i>로 나눈다'는 뜻이라는 것을 눈으로 확인하고 계산해요.",
    core: "식이 있으면 대입, 32 나누기 8이면 끝!",
  },
  {
    // [슬롯 145] 검산: y=−36/x에서 y=9 → 9=−36/x → x=−36÷9=−4 ✓ 역방향.
    id: "m1u3e145",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "반비례 관계 " + withVars("y=−36/x") + "에서 " + withVars("y=9") + "일 때 " + withVars("x") + "의 값은?",
    options: ["−4", "4", "−9", "9", "−45"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>이번에는 <i class='mv'>y</i>가 주어지고 <i class='mv'>x</i>를 묻는 역방향이에요. 곱이 일정하다는 성질을 쓰면 <i class='mv'>xy</i>=−36이므로 <i class='mv'>x</i>×9=−36, 즉 <i class='mv'>x</i>=−36÷9=<b>−4</b>예요. 검산으로 −36÷(−4)=9가 주어진 <i class='mv'>y</i>와 정확히 맞아요.<span class='xh'>오답 하나씩 격파</span>'4'는 −36의 음의 부호를 잃은 답이에요. 양수 <i class='mv'>y</i>가 나오려면 <i class='mv'>x</i>가 음수여야 한다는 부호 감각으로 걸러 낼 수 있죠. '−9'는 <i class='mv'>y</i>값에 부호만 바꾼 것이고, '−45'는 −36−9라는 엉뚱한 뺄셈이에요. 역방향 문제일수록 <i class='mv'>xy</i>=<i class='mv'>a</i>라는 대칭 꼴로 바꿔 놓고 풀면 방향에 흔들리지 않아요.",
    core: "xy=−36으로 바꾸면 역방향도 한 줄이에요.",
  },
  {
    // [슬롯 146] 검산: 240장 · 12명이면 20장씩 · 4장 적은 16장씩이 되려면 240÷16=15명 ✓
    //  (조건 변화 복합).
    id: "m1u3e146",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt:
      "색종이 <b>240장</b>을 " + withVars("x") + "명이 남김없이 똑같이 나누면 한 명이 " + withVars("y") + "장씩 받아요. <b>12명</b>이 나눌 때보다 한 명이 받는 색종이가 <b>4장 적어지려면</b> 몇 명이 나눠야 할까요?",
    options: ["15명", "16명", "20명", "24명", "10명"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>전체 240장이 고정이니 <i class='mv'>y</i>=240/<i class='mv'>x</i>예요. 12명이 나누면 한 명이 240÷12=20장을 받죠. 여기서 4장 적어지면 한 명이 16장을 받아야 하고, 그때의 사람 수는 240÷16=<b>15</b>명이에요. 사람이 12명에서 15명으로 늘어나니 한 명 몫이 줄어드는 방향도 자연스럽죠.<span class='xh'>오답 하나씩 격파</span>'16명'은 목표 몫 16장을 사람 수로 착각한 답이고, '20명'은 12명일 때의 몫 20장을 그대로 옮긴 거예요. '24명'은 240÷10처럼 단계를 건너뛴 값이고, '10명'은 사람을 줄이는 반대 방향이에요. 조건 변화 문제는 기준 상황(12명, 20장)을 먼저 완성하고, 바뀐 목표(16장)를 세운 뒤, 식으로 되돌아가는 세 걸음으로 정리해요.",
    core: "기준 몫 → 목표 몫 → 다시 식, 세 걸음이에요.",
  },
  {
    // [슬롯 147] 검산: a=xy=3×(−8)=−24 → y=−24/x → x=−2일 때 y=−24÷(−2)=12 ✓
    //  (레슨 드릴 (−2, 6)→−12·xy=−8과 값·세팅 분리).
    id: "m1u3e147",
    lessonId: "m1u3l7",
    type: "num",
    prompt: withVars("y") + "가 " + withVars("x") + "에 반비례하고 " + withVars("x=3") + "일 때 " + withVars("y=−8") + "이에요. " + withVars("x=−2") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    answer: "12",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>반비례에서는 곱 <i class='mv'>xy</i>가 항상 일정하고 그 값이 <i class='mv'>a</i>예요. 주어진 한 쌍으로 <i class='mv'>a</i>=3×(−8)=−24를 확정하면 관계식은 <i class='mv'>y</i>=−24/<i class='mv'>x</i>예요. <i class='mv'>x</i>=−2를 대입하면 <i class='mv'>y</i>=−24÷(−2)=<b>12</b>예요. 음수를 음수로 나누면 양수가 되죠.<span class='xh'>계산 함정 격파</span>부호 실수가 두 군데에서 기다려요. 먼저 <i class='mv'>a</i>를 3×8=24로 계산하면 곱의 음수 부호를 잃고, 마지막 나눗셈에서 −24÷(−2)를 −12로 쓰면 부호 규칙을 놓친 거예요. '음수 곱 양수는 음수, 음수 나누기 음수는 양수'를 소리 내어 확인하며 두 단계를 밟아요. 검산은 (−2)×12=−24로 곱이 <i class='mv'>a</i> 그대로인지 보면 끝이에요.",
    core: "반비례의 a는 곱으로 확정, 부호는 두 번 검사해요.",
  },
  {
    // [슬롯 148] 검산: "남은 거리"만 y=100−x 뺄셈 = 반비례 아님(정답). 나머지 4개는 곱
    //  고정 반비례(직사각형 24·주스 1200·두 수 60·책 300쪽).
    id: "m1u3e148",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례하지 않는</b> 것은?",
    options: [
      "100 m 달리기에서 x m를 달렸을 때 남은 거리 y m",
      "넓이가 24 cm²인 직사각형의 가로 x cm와 세로 y cm",
      "주스 1200 mL를 x명이 똑같이 나눌 때 한 명의 양 y mL",
      "곱이 60인 두 수 x와 y",
      "300쪽짜리 책을 하루에 x쪽씩 읽어 다 읽는 데 걸리는 날수 y일",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>남은 거리는 <i class='mv'>y</i>=100−<i class='mv'>x</i>인 빼기 관계예요. <i class='mv'>x</i>가 2배가 되어도 <i class='mv'>y</i>가 1/2배가 되지 않고, 곱도 일정하지 않으니 반비례가 아니에요. <b>이것이 정답</b>이죠.<span class='xh'>오답 하나씩 격파</span>직사각형은 <i class='mv'>xy</i>=24, 주스 나눔은 <i class='mv'>xy</i>=1200, 두 수는 <i class='mv'>xy</i>=60, 책 읽기는 <i class='mv'>xy</i>=300으로 넷 다 곱이 고정된 반비례예요. 각각 넓이, 전체 양, 곱, 전체 쪽수라는 '고정된 전체'가 숨어 있죠. 감소한다는 인상은 판별 기준이 아니에요. 남은 거리도 줄어들지만 반비례가 아니듯, 판정 도장은 언제나 곱 검사가 찍는답니다.",
    core: "뺄셈 감소와 곱 고정 감소를 구분해요.",
  },
  {
    // [슬롯 149] 검산: 곱 = 2×21=6×7=42 일정 → ㉠은 y=14인 열의 x → 42÷14=3 ✓
    //  (빈칸이 x행인 역방향 표).
    id: "m1u3e149",
    lessonId: "m1u3l7",
    type: "num",
    prompt: "표는 " + withVars("y") + "가 " + withVars("x") + "에 반비례하는 관계를 나타낸 거예요. ㉠에 알맞은 수를 구하세요.",
    figure: mExamTableFig(["x", "2", "㉠", "6"], [["y", "21", "14", "7"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    answer: "3",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>곱 검사부터 해요. 2×21=42, 6×7=42이므로 일정한 곱은 42예요. ㉠ 열은 <i class='mv'>y</i>=14이니 ㉠×14=42에서 ㉠=42÷14=<b>3</b>이죠. <i class='mv'>x</i>가 2, 3, 6으로 커질 때 <i class='mv'>y</i>가 21, 14, 7로 줄어드는 흐름과도 맞아요.<span class='xh'>계산 함정 격파</span>x행이 2 다음이니 4라고 쓰면 나열의 규칙을 확인하지 않은 답이에요. 반비례 표의 <i class='mv'>x</i>는 등간격일 이유가 없어요. 이 표에서 4를 넣으면 곱이 4×14=56이 되어 약속 42가 깨지죠. 빈칸이 <i class='mv'>y</i>행이든 <i class='mv'>x</i>행이든 방법은 하나예요. 곱을 확정하고, 아는 값으로 나눈다!",
    core: "빈칸이 어느 행이든 곱÷아는 값이에요.",
  },
  {
    // [슬롯 150] 검산: 곱 = 2×27=3×18=6×9=54 일정 → y=54/x ✓. 함정 y=27/x는 곱 27이라
    //  전 열 불일치 · y=54x·y=x/54는 정비례 · y=54−x는 첫 열(2, 52?)부터 탈락.
    id: "m1u3e150",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "표는 " + withVars("x") + "와 " + withVars("y") + " 사이의 관계를 나타낸 거예요. " + withVars("x") + "와 " + withVars("y") + " 사이의 <b>관계식</b>은?",
    figure: mExamTableFig(["x", "2", "3", "6"], [["y", "27", "18", "9"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    options: [withVars("y=54/x"), withVars("y=27/x"), withVars("y=54x"), withVars("y=x/54"), withVars("y=54−x")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>표를 검사하면 <i class='mv'>y</i>가 줄어드니 곱 검사부터예요. 2×27=54, 3×18=54, 6×9=54로 곱이 일정하므로 반비례이고, 관계식은 <b><i class='mv'>y</i>=54/<i class='mv'>x</i></b>예요. 세 열 모두에 대입해 재확인하면 완벽하죠.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=27/<i class='mv'>x</i>'는 첫 열의 <i class='mv'>y</i>값 27을 그대로 <i class='mv'>a</i>로 쓴 함정이에요. <i class='mv'>x</i>=2를 넣으면 13.5가 되어 표와 어긋나죠. 반비례의 <i class='mv'>a</i>는 한 값이 아니라 곱이에요. '<i class='mv'>y</i>=54<i class='mv'>x</i>'와 '<i class='mv'>y</i>=<i class='mv'>x</i>/54'는 정비례라 증가 방향부터 다르고, '<i class='mv'>y</i>=54−<i class='mv'>x</i>'는 <i class='mv'>x</i>=2일 때 52라 첫 열에서 바로 탈락해요. 식 후보는 반드시 모든 열로 검산해요.",
    core: "a는 첫 y값이 아니라 곱, 전 열로 검산!",
  },
  {
    // [슬롯 151] 검산: ㄱ xy=81(곱 일정 ✓) · ㄴ y=7/x ✓ · ㄷ y=x/7 정비례 · ㄹ y=7x
    //  정비례 · ㅁ y=7−x 뺄셈. answer [0, 1].
    id: "m1u3e151",
    lessonId: "m1u3l7",
    type: "multi",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례하는</b> 것을 모두 고르세요.",
    options: [withVars("xy=81"), withVars("y=7/x"), withVars("y=x/7"), withVars("y=7x"), withVars("y=7−x")],
    answer: [0, 1],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>반비례는 <i class='mv'>y</i>=<i class='mv'>a</i>/<i class='mv'>x</i> 꼴, 또는 같은 말로 <i class='mv'>xy</i>=<i class='mv'>a</i>(곱 일정) 꼴이에요. <i class='mv'>xy</i>=81은 곱이 81로 일정한 반비례이고, <i class='mv'>y</i>=7/<i class='mv'>x</i>는 <i class='mv'>a</i>=7인 반비례 그 자체죠. 이 둘이 정답이에요.<span class='xh'>틀린 것 격파</span><i class='mv'>y</i>=<i class='mv'>x</i>/7은 나눗셈처럼 보여도 <i class='mv'>x</i>가 분자에 있어 (1/7)배인 정비례예요. 분모의 <i class='mv'>x</i>와 분자의 <i class='mv'>x</i>를 가르는 눈이 판별의 절반이죠. <i class='mv'>y</i>=7<i class='mv'>x</i>는 정비례, <i class='mv'>y</i>=7−<i class='mv'>x</i>는 빼기 관계라 곱이 일정하지 않아요. 변형 표기 <i class='mv'>xy</i>=<i class='mv'>a</i>를 반비례의 다른 옷으로 알아보는 것이 이 문제의 핵심이에요.",
    core: "xy=a도 반비례의 정식 표기예요.",
  },
  {
    // [슬롯 152] 검산: 전체 일의 양 = 6명×10일 = 60(명·일 몫) 고정 → 4명이면 60÷4=15일 ✓.
    id: "m1u3e152",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "어떤 일을 똑같은 빠르기로 일하는 <b>6명</b>이 하면 <b>10일</b>이 걸려요. 같은 일을 <b>4명</b>이 하면 며칠이 걸릴까요?",
    options: ["15일", "12일", "9일", "8일", "20일"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>일의 전체 양이 고정이에요. 6명이 10일 일했으니 전체 일은 6×10=60(한 사람의 하루치 일 60묶음)이죠. 사람 수 <i class='mv'>x</i>와 걸리는 날수 <i class='mv'>y</i>는 <i class='mv'>xy</i>=60인 반비례이고, 4명이면 <i class='mv'>y</i>=60÷4=<b>15</b>일이에요. 사람이 줄었으니 날수가 늘어나는 방향도 맞아요.<span class='xh'>오답 하나씩 격파</span>'12일'은 사람이 6에서 4로 2 줄었으니 날도 2 늘린다는 덧셈식 접근이에요. 반비례는 더하고 빼는 관계가 아니라 곱을 지키는 관계죠. '9일'이나 '8일'은 사람이 줄었는데 날수까지 줄어드는 방향 착오예요. '20일'은 60÷3처럼 나누는 수를 잘못 잡은 값이고요. 일 문제의 열쇠는 '전체 일 = 사람×날수'라는 보존량을 찾는 거예요.",
    core: "전체 일 60이 고정, 사람이 줄면 날이 늘어요.",
  },
  {
    // [슬롯 153] 검산: y=−14/x에 x=7 → −14÷7=−2 ✓.
    id: "m1u3e153",
    lessonId: "m1u3l7",
    type: "num",
    prompt: "반비례 관계 " + withVars("y=−14/x") + "에서 " + withVars("x=7") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    answer: "-2",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>=−14/<i class='mv'>x</i>에 <i class='mv'>x</i>=7을 대입하면 <i class='mv'>y</i>=−14÷7=<b>−2</b>예요. 음수를 양수로 나누면 음수라는 부호 규칙만 지키면 한 줄로 끝나요. 곱 검사로도 7×(−2)=−14가 <i class='mv'>a</i>와 일치하죠.<span class='xh'>계산 함정 격파</span>−14÷7을 2로 쓰면 부호를 잃은 거예요. 분자의 음의 부호는 나눗셈 결과에 그대로 살아남아요. 또 −14−7=−21이나 −14+7=−7처럼 나눗셈을 덧뺄셈으로 바꾸는 실수, 그리고 7÷14처럼 분자와 분모를 뒤집는 실수도 잦아요. 분수 꼴 −14/<i class='mv'>x</i>는 '−14를 <i class='mv'>x</i>로 나눈다'로 소리 내어 번역한 뒤 계산하면 흔들리지 않아요.",
    core: "음수 나누기 양수는 음수, 부호가 살아남아요.",
  },
  {
    // [슬롯 154] 검산: 균형 = (거리)×(무게) 보존 · 4×15=60 → 3 m 쪽은 60÷3=20 kg ✓
    //  (레슨 시소 훅 30·60 kg과 수치·각도 분리).
    id: "m1u3e154",
    lessonId: "m1u3l7",
    type: "num",
    prompt:
      "받침점을 중심으로 균형을 이루는 긴 널빤지는 <b>(받침점까지의 거리)×(물체의 무게)</b>가 양쪽에서 같아요. 받침점에서 <b>4 m</b> 떨어진 곳에 <b>15 kg</b>짜리 상자를 올렸다면, 반대쪽 <b>3 m</b> 떨어진 곳에는 몇 kg짜리 상자를 올려야 균형이 맞는지 구하세요.",
    answer: "20",
    numKind: "int",
    unitLabel: "kg",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>한쪽의 (거리)×(무게)는 4×15=60이에요. 균형을 이루려면 반대쪽도 이 값이 60이어야 하므로, 3 m 거리라면 무게는 60÷3=<b>20</b> kg이어야 해요. 거리가 가까울수록 더 무거운 것을 올려야 한다는 시소의 감각 그대로, 곱 60을 지키는 반비례 관계죠.<span class='xh'>계산 함정 격파</span>거리가 4에서 3으로 1 줄었으니 무게도 1만 바꿔 16 kg이라 하면 덧뺄셈식 접근이에요. 균형은 차가 아니라 곱으로 정해져요. 또 60÷4=15처럼 원래 쪽 거리로 다시 나누면 제자리로 돌아갈 뿐이죠. '보존되는 곱 확정 → 새 조건으로 나누기'라는 반비례 활용의 두 걸음을 그대로 밟으면 돼요.",
    core: "균형은 곱 보존, 60을 새 거리로 나눠요.",
  },
  {
    // [슬롯 155] 검산: (가) x 1·3·5 / y 3·9·15는 y/x=3 일정(정비례) · (나) x 3·7·9 /
    //  y 21·9·7은 곱 63·63·63 일정(반비례 a=63) ✓ → 정답 "(나), a=63". 조합 보기 관례
    //  순서 고정 · 정답 두 번째(① 금지 ✓). xy=63은 레슨·다른 슬롯 미사용 값.
    id: "m1u3e155",
    lessonId: "m1u3l7",
    type: "mcq",
    prompt: "두 표 (가), (나) 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>반비례</b>하는 것과 그때의 " + withVars("a") + "(" + withVars("y=a/x") + ")를 짝지은 것은?",
    figure:
      mExamTableFig(["x", "1", "3", "5"], [["y", "3", "9", "15"]], { title: "(가)", aria: "표 (가)의 x와 y의 대응" }) +
      mExamTableFig(["x", "3", "7", "9"], [["y", "21", "9", "7"]], { title: "(나)", aria: "표 (나)의 x와 y의 대응" }),
    options: ["(가), a=3", "(나), a=63", "(나), a=21", "(가), a=15", "(나), a=7"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>반비례인지 확인하는 방법은 <b>곱 검사</b>예요. 표 (나)에서 <i class='mv'>x</i>×<i class='mv'>y</i>를 계산하면 3×21=63, 7×9=63, 9×7=63으로 전부 같아요. 곱이 63으로 일정하므로 (나)가 반비례이고, 그 일정한 곱이 바로 <i class='mv'>a</i>=<b>63</b>이에요.<span class='xh'>오답 하나씩 격파</span>표 (가)는 3÷1=9÷3=15÷5=3으로 나눈 값이 일정한 정비례라서 반비례로 고르면 검사 종류부터 틀린 거예요. '(나), <i class='mv'>a</i>=21'은 첫 열의 <i class='mv'>y</i>값을, '(나), <i class='mv'>a</i>=7'은 마지막 열의 <i class='mv'>y</i>값을 <i class='mv'>a</i>로 착각한 답이에요. 반비례의 <i class='mv'>a</i>는 표의 한 값이 아니라 두 값의 곱이라는 것, 잊지 마세요.",
    core: "반비례 판별은 곱 검사, 그 곱이 곧 a예요.",
  },
];
