// 중2 수학 Ⅲ. 일차함수: 단원 종합 평가 풀, 레슨 9 일차함수와 일차방정식 (m2u3e161~e180) · 책 122~127쪽
// 유형 쿼터: mcq 9 + multi 3 = 12 · num 6 · word 2, diff 8/8/4.
// 함정 계보(3사 마무리 구조만 계승, 수치·문구는 전부 신작): 방정식→y=꼴 변환·좌표축 평행 판별·두 점 x좌표 같음·계수 역산·직사각형 넓이.
// 수치 앵커 회피: y=−(3/2)x+6·y=−(2/3)x+2·x=4·y=−4·x=−3·y=6·x=0·직사각형 12·k=3 전부 회피표 대조 완료.
// word 정답: 일차방정식(e165)·y축(e174).
// 표기: em대시 금지, 뺄셈·음수는 −(U+2212, num answer만 ASCII), 수식·부등호는 mfmt(자동 이스케이프).
import type { ExamItem } from "./types";
import { mfmt } from "../../ui/mathKit";
import { lineFig } from "../../ui/mathFigures2";

const L = "m2u3l9";

export const POOL_M2U3L9: ExamItem[] = [
  // e161 mcq 그림 세로선·가로선 판별 (가)x=4·(나)y=−4 · 정답 1 · diff1 · shuffle:false
  {
    id: "m2u3e161",
    lessonId: L,
    type: "mcq",
    prompt: "그림에서 직선 (가)와 (나)의 방정식을 차례로 바르게 나타낸 것은?",
    figure: lineFig({
      lines: [
        { vert: 4, label: "(가)" },
        { a: 0, b: -4, color: "#E8A93E", label: "(나)", lx: -3.6 },
      ],
    }),
    options: [
      "(가) " + mfmt("y=4") + ", (나) " + mfmt("x=-4"),
      "(가) " + mfmt("x=4") + ", (나) " + mfmt("y=-4"),
      "(가) " + mfmt("x=-4") + ", (나) " + mfmt("y=4"),
      "(가) " + mfmt("x=4") + ", (나) " + mfmt("y=4"),
      "(가) " + mfmt("y=-4") + ", (나) " + mfmt("x=4"),
    ],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>세로로 곧게 선 직선과 가로로 누운 직선을 구분해요.<br>① (가)는 y축에 평행한 세로선이고 지나는 점의 x좌표가 항상 4라서 " +
      mfmt("x=4") +
      "예요<br>② (나)는 x축에 평행한 가로선이고 y좌표가 항상 −4라서 " +
      mfmt("y=-4") +
      "예요 ✓.<span class='xh'>오답 하나씩 격파</span>(가)를 " +
      mfmt("y=4") +
      "로 본 것은 세로선과 가로선을 뒤바꾼 거예요. 세로선은 <i class='mv'>x</i>의 값이 고정되니 <i class='mv'>x</i>=(수) 꼴이죠. (나)를 " +
      mfmt("y=4") +
      "로 본 것은 지나는 y좌표를 4로 잘못 읽은 거예요. 실제로는 −4를 지나요. 부호까지 뒤집어 " +
      mfmt("x=-4") +
      "나 " +
      mfmt("y=4") +
      "로 두면 그림과 어긋나요. 세로선은 <i class='mv'>x</i>=(수), 가로선은 <i class='mv'>y</i>=(수)로 기억해요.",
    core: "세로선은 x=(수), 가로선은 y=(수)!",
  },
  // e162 mcq 합답형 3x+2y−12=0 성질 ㄱㄴ · 정답 2 · diff2 · shuffle:false
  {
    id: "m2u3e162",
    lessonId: L,
    type: "mcq",
    prompt:
      "일차방정식 " +
      mfmt("3x+2y-12=0") +
      "의 그래프에 대한 설명으로 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    bogi: [
      "기울기는 " + mfmt("-{3/2}") + "이다.",
      "y절편은 6이다.",
      "오른쪽 위로 향하는 직선이다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>방정식을 " +
      mfmt("y=") +
      " 꼴로 바꿔 기울기와 y절편을 읽어요.<br>① " +
      mfmt("3x+2y-12=0") +
      "에서 " +
      mfmt("2y=-3x+12") +
      "<br>② 양변을 2로 나누면 " +
      mfmt("y=-{3/2}x+6") +
      "이에요<br>③ 기울기 " +
      mfmt("-{3/2}") +
      "(ㄱ 참), y절편 6(ㄴ 참)이고, 기울기가 음수라 오른쪽 아래로 내려가요(ㄷ 거짓). 옳은 것은 ㄱ, ㄴ이에요 ✓.<span class='xh'>오답 하나씩 격파</span>ㄷ은 기울기가 음수인데 오른쪽 위로 향한다고 했으니 어긋나요. 기울기가 음수면 <i class='mv'>x</i>가 커질수록 <i class='mv'>y</i>가 작아져 오른쪽 아래로 내려가죠. ㄱ만 또는 ㄴ만 고르면 맞는 설명 하나를 빠뜨린 거예요. 셋 다 고르면 거짓인 ㄷ까지 포함돼 틀려요.",
    core: "방정식은 y= 꼴로 바꿔 기울기·y절편을 읽어요!",
  },
  // e163 mcq 좌표축 평행 판별(y축 평행=x=수) 2x+8=0 · 정답 0 · diff1
  {
    id: "m2u3e163",
    lessonId: L,
    type: "mcq",
    prompt: "다음 방정식의 그래프 중 <b>y축에 평행한</b> 직선은?",
    options: [
      mfmt("2x+8=0"),
      mfmt("3y-6=0"),
      mfmt("x+y=1"),
      mfmt("x-5y=0"),
      mfmt("y=x-4"),
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>y축에 평행한 직선은 <i class='mv'>y</i>가 사라지고 <i class='mv'>x</i>만 남는 <i class='mv'>x</i>=(수) 꼴이에요.<br>① " +
      mfmt("2x+8=0") +
      "에서 " +
      mfmt("2x=-8") +
      "<br>② " +
      mfmt("x=-4") +
      "가 되어 점 (−4, 0)을 지나는 세로선이에요 ✓. 이 직선은 y축에 평행하죠.<span class='xh'>오답 하나씩 격파</span>" +
      mfmt("3y-6=0") +
      "은 " +
      mfmt("y=2") +
      "가 되어 x축에 평행한 가로선이에요. y축이 아니라 x축에 평행하죠. " +
      mfmt("x+y=1") +
      "과 " +
      mfmt("y=x-4") +
      "는 비스듬히 기운 직선이라 어느 축과도 평행하지 않아요. " +
      mfmt("x-5y=0") +
      "은 " +
      mfmt("y={1/5}x") +
      "로 원점을 지나는 기운 직선이에요. <i class='mv'>x</i>만 남아야 y축에 평행해요.",
    core: "y축에 평행 = x=(수) 꼴!",
  },
  // e164 num 6x+2y+14=0 기울기 −3 · diff2
  {
    id: "m2u3e164",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 " + mfmt("6x+2y+14=0") + "의 그래프의 <b>기울기</b>를 구하세요.",
    answer: "-3",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>방정식을 " +
      mfmt("y=") +
      " 꼴로 바꾸면 <i class='mv'>x</i>의 계수가 기울기예요.<br>① " +
      mfmt("6x+2y+14=0") +
      "에서 " +
      mfmt("2y=-6x-14") +
      "<br>② 양변을 2로 나누면 " +
      mfmt("y=-3x-7") +
      "<br>③ 그래서 기울기는 <b>−3</b>이에요 ✓.<span class='xh'>이렇게 확인해요</span>기울기가 −3이면 <i class='mv'>x</i>가 1 커질 때 <i class='mv'>y</i>는 3 작아져요. " +
      mfmt("y=-3x-7") +
      "에서 <i class='mv'>x</i>=0이면 <i class='mv'>y</i>=−7, <i class='mv'>x</i>=1이면 <i class='mv'>y</i>=−10으로 3만큼 줄어드니 맞아요. 만약 <i class='mv'>y</i>의 계수 2로 나누는 과정을 빠뜨리고 −6을 그대로 기울기로 두면 틀려요. 반드시 <i class='mv'>y</i>의 계수가 1이 되도록 정리한 뒤 읽어야 해요.",
    core: "y=(수)x+(수) 꼴로 바꿔야 기울기가 보여요!",
  },
  // e165 word 일차방정식 · diff1
  {
    id: "m2u3e165",
    lessonId: L,
    type: "word",
    prompt: "미지수가 2개인 ___의 그래프는 좌표평면 위에서 곧은 직선이 돼요. 빈칸에 알맞은 말은?",
    answer: "일차방정식",
    bank: ["일차방정식", "일차함수", "정비례", "반비례", "부등식", "연립방정식", "순환소수", "좌표축"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><b>일차방정식</b>이 정답이에요.<br>① 미지수가 <i class='mv'>x</i>, <i class='mv'>y</i> 2개이고 차수가 1인 방정식 " +
      mfmt("ax+by+c=0") +
      "을 미지수가 2개인 일차방정식이라 해요<br>② 이 방정식을 참으로 만드는 순서쌍 (<i class='mv'>x</i>, <i class='mv'>y</i>)를 좌표평면에 모두 찍으면 곧은 직선이 돼요 ✓.<span class='xh'>이것만 조심</span>일차함수는 " +
      mfmt("y=ax+b") +
      "처럼 <i class='mv'>y</i>를 <i class='mv'>x</i>로 나타낸 식이라 '미지수가 2개인'이라는 표현과 어울리지 않아요. 연립방정식은 방정식을 두 개 묶은 것이고, 정비례·반비례는 특별한 관계의 이름이에요. 부등식은 등호 대신 부등호로 크기를 비교하는 식이라 여기에 맞지 않아요. '미지수 2개, 차수 1'에 딱 맞는 것은 일차방정식이에요.",
    core: "미지수 2개·차수 1 방정식의 그래프는 직선!",
  },
  // e166 mcq 그림 그래프→방정식 2x+3y−6=0 · 정답 0 · diff2
  {
    id: "m2u3e166",
    lessonId: L,
    type: "mcq",
    prompt: "그림은 어떤 일차방정식의 그래프예요. 이 직선을 나타내는 방정식은?",
    figure: lineFig({ lines: [{ a: -2 / 3, b: 2 }] }),
    options: [
      mfmt("2x+3y-6=0"),
      mfmt("3x+2y-6=0"),
      mfmt("2x-3y-6=0"),
      mfmt("2x+3y+6=0"),
      mfmt("3x+2y+6=0"),
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프가 지나는 두 점을 읽어 식을 세워요.<br>① 그래프는 x축과 점 (3, 0)에서, y축과 점 (0, 2)에서 만나요<br>② y절편이 2이고 <i class='mv'>x</i>가 3 늘 때 <i class='mv'>y</i>가 2 줄어드니 기울기는 " +
      mfmt("-{2/3}") +
      "예요. 그래서 " +
      mfmt("y=-{2/3}x+2") +
      "<br>③ 양변에 3을 곱해 정리하면 " +
      mfmt("2x+3y-6=0") +
      "이에요 ✓.<span class='xh'>오답 하나씩 격파</span>" +
      mfmt("3x+2y-6=0") +
      "은 <i class='mv'>x</i>와 <i class='mv'>y</i>의 계수를 뒤바꾼 식이라 x절편 2, y절편 3인 직선이 돼요. " +
      mfmt("2x-3y-6=0") +
      "은 (3, 0)은 지나지만 y절편이 −2라서 (0, 2)를 지나지 않아요. " +
      mfmt("2x+3y+6=0") +
      "은 상수항 부호가 반대라 x절편 −3, y절편 −2이고요. " +
      mfmt("3x+2y+6=0") +
      "도 대입하면 두 점을 지나지 않아요. 두 절편을 정확히 읽는 게 핵심이에요.",
    core: "x절편·y절편 두 점을 읽어 식을 세워요!",
  },
  // e167 mcq 두 점 x좌표 같음 → x=−3 · 정답 0 · diff1
  {
    id: "m2u3e167",
    lessonId: L,
    type: "mcq",
    prompt: "두 점 (−3, 1)과 (−3, 5)를 모두 지나는 직선의 방정식은?",
    options: [mfmt("x=-3"), mfmt("y=-3"), mfmt("x=3"), mfmt("y=3"), mfmt("y=1")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>두 점의 x좌표가 −3으로 같아요.<br>① x좌표가 같은 두 점을 지나는 직선은 y축에 평행한 세로선이에요<br>② <i class='mv'>x</i>의 값이 항상 −3이니 방정식은 " +
      mfmt("x=-3") +
      "이에요 ✓.<span class='xh'>오답 하나씩 격파</span>" +
      mfmt("y=-3") +
      "은 x축에 평행한 가로선이라 두 점을 지나지 않아요. " +
      mfmt("x=3") +
      "은 부호를 놓쳐 점 (3, ...)을 지나는 세로선이 되죠. " +
      mfmt("y=3") +
      "은 두 점의 y좌표 1과 5의 가운데 값 3을 잘못 답한 거예요. 두 점을 잇는 것은 세로선이라 <i class='mv'>y</i>=(수) 꼴이 될 수 없어요. " +
      mfmt("y=1") +
      "은 한 점의 y좌표만 보고 정한 것으로 나머지 점 (−3, 5)를 지나지 않아요. x좌표가 같으면 <i class='mv'>x</i>=(수) 꼴이에요.",
    core: "x좌표가 같은 두 점 → x=(수) 세로선!",
  },
  // e168 multi y=−4 성질 종합 · 정답 [0,1,3] · diff2
  {
    id: "m2u3e168",
    lessonId: L,
    type: "multi",
    prompt:
      "직선 " +
      mfmt("y=-4") +
      "에 대한 설명으로 옳은 것은? <b>정답을 모두 고르세요.</b>",
    options: [
      "점 (0, −4)를 지난다.",
      "x축에 평행하다.",
      "y축에 평행하다.",
      "<i class='mv'>x</i>의 값에 관계없이 <i class='mv'>y</i>의 값은 −4로 일정하다.",
      "원점을 지난다.",
    ],
    answer: [0, 1, 3],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>" +
      mfmt("y=-4") +
      "는 x축에 평행한 가로선이에요.<br>① 이 직선 위의 점은 <i class='mv'>x</i>가 무엇이든 <i class='mv'>y</i>가 항상 −4예요. 그래서 y의 값이 −4로 일정하다는 설명이 맞아요<br>② x축에 평행하고, y축과는 점 (0, −4)에서 만나요 ✓. 옳은 설명은 세 개예요.<span class='xh'>오답 하나씩 격파</span>'y축에 평행하다'는 어긋나요. 가로선인 " +
      mfmt("y=-4") +
      "는 세로인 y축과 오히려 만나죠. y축에 평행한 것은 <i class='mv'>x</i>=(수) 꼴이에요. '원점을 지난다'도 틀려요. 원점은 (0, 0)인데 이 직선은 (0, −4)를 지나 원점보다 4칸 아래를 지나거든요.",
    core: "y=(수)는 x축에 평행, y가 일정한 가로선!",
  },
  // e169 num 5x+2y+10=0 y절편 −5 · diff2
  {
    id: "m2u3e169",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 " + mfmt("5x+2y+10=0") + "의 그래프의 <b>y절편</b>을 구하세요.",
    answer: "-5",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>y절편은 그래프가 y축과 만나는 점의 y좌표, 즉 <i class='mv'>x</i>=0일 때의 <i class='mv'>y</i>의 값이에요.<br>① " +
      mfmt("5x+2y+10=0") +
      "에 " +
      mfmt("x=0") +
      "을 넣으면 " +
      mfmt("2y+10=0") +
      "<br>② " +
      mfmt("2y=-10") +
      "이니 " +
      mfmt("y=-5") +
      "<br>③ 그래서 y절편은 <b>−5</b>예요 ✓.<span class='xh'>이렇게 확인해요</span>방정식을 " +
      mfmt("y=") +
      " 꼴로 바꿔도 같아요. " +
      mfmt("2y=-5x-10") +
      "에서 " +
      mfmt("y=-{5/2}x-5") +
      "이니 상수항 −5가 바로 y절편이죠. 만약 " +
      mfmt("x=0") +
      "을 넣지 않고 상수항 10을 그대로 답하면 2로 나누는 과정을 빠뜨린 거예요. <i class='mv'>x</i>에 0을 넣거나 <i class='mv'>y</i>의 계수를 1로 만든 뒤 읽어야 해요.",
    core: "y절편은 x=0을 대입한 y의 값!",
  },
  // e170 mcq 점 (−2,6) 지나고 x축 평행 → y=6 · 정답 0 · diff1
  {
    id: "m2u3e170",
    lessonId: L,
    type: "mcq",
    prompt: "점 (−2, 6)을 지나고 <b>x축에 평행한</b> 직선의 방정식은?",
    options: [mfmt("y=6"), mfmt("x=-2"), mfmt("y=-2"), mfmt("x=6"), mfmt("y=-6")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>x축에 평행한 직선은 가로선이라 <i class='mv'>y</i>=(수) 꼴이에요.<br>① 가로선 위의 점은 y좌표가 모두 같아요<br>② 점 (−2, 6)을 지나니 y좌표 6이 항상 유지돼 방정식은 " +
      mfmt("y=6") +
      "이에요 ✓.<span class='xh'>오답 하나씩 격파</span>" +
      mfmt("x=-2") +
      "는 y축에 평행한 세로선이라 x축이 아니라 y축에 평행하죠. 방향을 반대로 본 거예요. " +
      mfmt("y=-2") +
      "와 " +
      mfmt("y=-6") +
      "은 지나는 y좌표를 잘못 읽거나 부호를 놓친 값이에요. 점의 y좌표는 6이죠. " +
      mfmt("x=6") +
      "은 점의 x좌표(−2)도 아니고 세로선이라 두 번 어긋나요. x축에 평행하면 점의 y좌표를 그대로 쓰면 돼요.",
    core: "x축에 평행 → 점의 y좌표로 y=(수)!",
  },
  // e171 mcq 2x−5y+10=0 x절편·y절편 · 정답 0 · diff2
  {
    id: "m2u3e171",
    lessonId: L,
    type: "mcq",
    prompt:
      "일차방정식 " +
      mfmt("2x-5y+10=0") +
      "의 그래프의 <b>x절편과 y절편</b>을 차례로 구한 것은?",
    options: [
      "x절편 −5, y절편 2",
      "x절편 5, y절편 −2",
      "x절편 −5, y절편 −2",
      "x절편 2, y절편 −5",
      "x절편 −2, y절편 5",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>x절편은 " +
      mfmt("y=0") +
      "일 때 <i class='mv'>x</i>의 값, y절편은 " +
      mfmt("x=0") +
      "일 때 <i class='mv'>y</i>의 값이에요.<br>① " +
      mfmt("y=0") +
      "을 넣으면 " +
      mfmt("2x+10=0") +
      "이라 " +
      mfmt("x=-5") +
      ", x절편은 −5<br>② " +
      mfmt("x=0") +
      "을 넣으면 " +
      mfmt("-5y+10=0") +
      "이라 " +
      mfmt("y=2") +
      ", y절편은 2예요 ✓.<span class='xh'>오답 하나씩 격파</span>'x절편 5, y절편 −2'는 두 절편의 부호를 모두 반대로 본 거예요. 상수항 +10을 옮길 때 부호를 놓치기 쉬우니 주의해요. 'x절편 −5, y절편 −2'는 y절편의 부호만 틀렸고, 'x절편 2, y절편 −5'는 두 절편에 넣을 값을 맞바꾼 거예요. 각 절편은 나머지 문자에 0을 넣어 구해요.",
    core: "x절편은 y=0, y절편은 x=0을 대입!",
  },
  // e172 num ax+2y−6=0이 (1,1) 지남 → a=4 · diff2
  {
    id: "m2u3e172",
    lessonId: L,
    type: "num",
    prompt:
      "일차방정식 " +
      mfmt("ax+2y-6=0") +
      "의 그래프가 점 (1, 1)을 지날 때, 상수 <i class='mv'>a</i>의 값을 구하세요.",
    answer: "4",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프가 어떤 점을 지나면 그 점의 좌표를 방정식에 넣어도 등식이 성립해요.<br>① " +
      mfmt("ax+2y-6=0") +
      "에 " +
      mfmt("x=1") +
      ", " +
      mfmt("y=1") +
      "을 대입하면 " +
      mfmt("a+2-6=0") +
      "<br>② " +
      mfmt("a-4=0") +
      "이니 " +
      mfmt("a=4") +
      "예요 ✓.<span class='xh'>이렇게 확인해요</span>구한 " +
      mfmt("a=4") +
      "를 넣으면 방정식은 " +
      mfmt("4x+2y-6=0") +
      "이에요. 여기에 점 (1, 1)을 다시 넣으면 " +
      mfmt("4+2-6=0") +
      "으로 0이 되어 등식이 성립하죠. 점이 그래프 위에 있다는 말과 좌표를 대입해 식이 성립한다는 말은 완전히 같은 뜻이에요. 대입 한 번으로 미지 계수가 바로 나오는 셈이죠.",
    core: "지나는 점의 좌표를 대입하면 등식이 성립!",
  },
  // e173 multi x+4y−8=0 성질 종합 · 정답 [0,1,3] · diff2
  {
    id: "m2u3e173",
    lessonId: L,
    type: "multi",
    prompt:
      "일차방정식 " +
      mfmt("x+4y-8=0") +
      "의 그래프에 대한 설명으로 옳은 것은? <b>정답을 모두 고르세요.</b>",
    options: [
      "오른쪽 아래로 향하는 직선이다.",
      "y절편은 2이다.",
      "기울기는 4이다.",
      "점 (8, 0)을 지난다.",
      "y축에 평행하다.",
    ],
    answer: [0, 1, 3],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>방정식을 " +
      mfmt("y=") +
      " 꼴로 바꾸면 " +
      mfmt("4y=-x+8") +
      ", " +
      mfmt("y=-{1/4}x+2") +
      "예요.<br>① 기울기가 " +
      mfmt("-{1/4}") +
      "로 음수라 오른쪽 아래로 향해요<br>② y절편은 2이고, " +
      mfmt("y=0") +
      "을 넣으면 " +
      mfmt("x=8") +
      "이라 점 (8, 0)을 지나요 ✓. 옳은 설명은 세 개예요.<span class='xh'>오답 하나씩 격파</span>'기울기는 4이다'는 어긋나요. <i class='mv'>y</i>의 계수 4로 나누는 과정을 빠뜨리면 안 되고, 실제 기울기는 " +
      mfmt("-{1/4}") +
      "예요. 'y축에 평행하다'도 틀려요. y축에 평행한 것은 <i class='mv'>x</i>=(수) 꼴인데 이 식은 기울기가 있는 비스듬한 직선이거든요.",
    core: "y= 꼴로 바꾸면 기울기·절편·방향이 다 보여요!",
  },
  // e174 word y축 · diff1
  {
    id: "m2u3e174",
    lessonId: L,
    type: "word",
    prompt:
      "일차방정식 " +
      mfmt("x=m") +
      " (단, <i class='mv'>m</i>은 상수)의 그래프는 점 (<i class='mv'>m</i>, 0)을 지나고 ___에 평행한 직선이에요. 빈칸에 알맞은 말은?",
    answer: "y축",
    bank: ["y축", "x축", "원점", "사분면", "대각선", "기울기", "x절편", "y절편"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><b>y축</b>이 정답이에요.<br>① " +
      mfmt("x=m") +
      "은 <i class='mv'>x</i>의 값이 항상 <i class='mv'>m</i>으로 고정된 세로선이에요<br>② 세로로 곧게 뻗은 이 직선은 마찬가지로 세로인 y축과 나란해서 y축에 평행해요 ✓.<span class='xh'>이것만 조심</span>x축은 가로 방향이라 세로선 " +
      mfmt("x=m") +
      "과는 평행이 아니라 오히려 점 (<i class='mv'>m</i>, 0)에서 만나요. 원점은 점 (0, 0) 하나라 '평행'을 말할 대상이 아니고, 기울기·x절편·y절편은 직선의 성질이나 위치를 가리키는 말이라 빈칸에 들어갈 수 없어요. 세로선은 세로축인 y축에 평행하다고 기억해요.",
    core: "x=m은 세로선, y축에 평행!",
  },
  // e175 mcq y축의 방정식 x=0 · 정답 0 · diff1
  {
    id: "m2u3e175",
    lessonId: L,
    type: "mcq",
    prompt: "다음 중 <b>y축</b>을 나타내는 방정식은?",
    options: [mfmt("x=0"), mfmt("y=0"), mfmt("x=1"), mfmt("y=1"), mfmt("x+3y=0")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>y축은 세로축이고, 그 위의 점은 x좌표가 모두 0이에요.<br>① (0, 1), (0, −2), (0, 3)처럼 y축 위의 점은 <i class='mv'>x</i>가 전부 0이죠<br>② <i class='mv'>x</i>의 값이 항상 0이니 y축의 방정식은 " +
      mfmt("x=0") +
      "이에요 ✓.<span class='xh'>오답 하나씩 격파</span>" +
      mfmt("y=0") +
      "은 y좌표가 항상 0인 가로선, 즉 x축이에요. y축과 헷갈리기 쉬우니 주의해요. " +
      mfmt("x=1") +
      "과 " +
      mfmt("y=1") +
      "은 축에서 1칸 떨어진 세로선·가로선이라 축 자체가 아니에요. " +
      mfmt("x+3y=0") +
      "은 " +
      mfmt("y=-{1/3}x") +
      "로 원점을 지나는 비스듬한 직선이라 y축이 아니죠. y축은 " +
      mfmt("x=0") +
      ", x축은 " +
      mfmt("y=0") +
      "이에요.",
    core: "y축은 x=0, x축은 y=0!",
  },
  // e176 num 네 직선 x=1·x=4·y=−1·y=3 직사각형 넓이 12 · diff3
  {
    id: "m2u3e176",
    lessonId: L,
    type: "num",
    prompt:
      "네 직선 " +
      mfmt("x=1") +
      ", " +
      mfmt("x=4") +
      ", " +
      mfmt("y=-1") +
      ", " +
      mfmt("y=3") +
      "으로 둘러싸인 직사각형의 <b>넓이</b>를 구하세요.",
    answer: "12",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>세로선 두 개와 가로선 두 개가 만드는 직사각형의 가로·세로 길이를 구해요.<br>① 세로선은 " +
      mfmt("x=1") +
      "과 " +
      mfmt("x=4") +
      "이니 가로 길이는 " +
      mfmt("4-1=3") +
      "<br>② 가로선은 " +
      mfmt("y=-1") +
      "과 " +
      mfmt("y=3") +
      "이니 세로 길이는 " +
      mfmt("3-(-1)=4") +
      "<br>③ 넓이는 3×4=<b>12</b>예요 ✓.<span class='xh'>이렇게 확인해요</span>네 직선의 교점, 즉 직사각형의 꼭짓점은 (1, −1), (4, −1), (4, 3), (1, 3)이에요. 가로로 1에서 4까지 3칸, 세로로 −1에서 3까지 4칸이니 넓이 3×4=12가 맞아요. 세로 길이를 구할 때 " +
      mfmt("3-1=2") +
      "처럼 아래 좌표 −1의 부호를 놓치면 안 돼요. −1을 빼면 +1이 더해져 4가 되죠.",
    core: "가로선·세로선 사이 거리를 곱하면 넓이!",
  },
  // e177 mcq 기울기 조건으로 a 구해 y절편 (2x+ay+14=0, 기울기 −1) → −7 · 정답 0 · diff3
  {
    id: "m2u3e177",
    lessonId: L,
    type: "mcq",
    prompt:
      "일차방정식 " +
      mfmt("2x+ay+14=0") +
      "의 그래프의 기울기가 −1일 때, 이 그래프의 <b>y절편</b>은? (단, <i class='mv'>a</i>는 상수)",
    options: ["−7", "7", "−14", "14", "−2"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>기울기 조건으로 <i class='mv'>a</i>를 먼저 구한 뒤 y절편을 구해요.<br>① " +
      mfmt("2x+ay+14=0") +
      "을 <i class='mv'>y</i>에 대해 풀면 " +
      mfmt("ay=-2x-14") +
      "<br>② 기울기는 −2를 <i class='mv'>a</i>로 나눈 값인데 이것이 −1이려면 " +
      mfmt("a=2") +
      "여야 해요<br>③ " +
      mfmt("a=2") +
      "이면 " +
      mfmt("2x+2y+14=0") +
      ", 즉 " +
      mfmt("y=-x-7") +
      "이라 y절편은 <b>−7</b>이에요 ✓.<span class='xh'>오답 하나씩 격파</span>14나 −14는 <i class='mv'>a</i>를 구하지 않고 상수항 14를 그대로(또는 부호만 바꿔) y절편으로 본 거예요. <i class='mv'>a</i>로 나누는 과정이 빠졌죠. 7은 y절편의 부호를 놓친 값이에요. −2가 y절편이 되려면 <i class='mv'>a</i>=7이어야 하는데, 그러면 기울기가 −2/7이 되어 조건 −1과 어긋나요. 기울기로 <i class='mv'>a</i>=2를 먼저 확정해야 해요.",
    core: "기울기로 미지 계수를 먼저 구한 뒤 절편!",
  },
  // e178 num x+ay+10=0 기울기 1/2 → a=−2 · diff3
  {
    id: "m2u3e178",
    lessonId: L,
    type: "num",
    prompt:
      "일차방정식 " +
      mfmt("x+ay+10=0") +
      "의 그래프의 기울기가 " +
      mfmt("{1/2}") +
      "일 때, 상수 <i class='mv'>a</i>의 값을 구하세요.",
    answer: "-2",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>방정식을 <i class='mv'>y</i>에 대해 풀어 기울기를 <i class='mv'>a</i>로 나타낸 뒤 조건과 비교해요.<br>① " +
      mfmt("x+ay+10=0") +
      "에서 " +
      mfmt("ay=-x-10") +
      "<br>② 기울기는 −1을 <i class='mv'>a</i>로 나눈 값이고 이것이 " +
      mfmt("{1/2}") +
      "예요<br>③ −1을 <i class='mv'>a</i>로 나눠 " +
      mfmt("{1/2}") +
      "이 되려면 " +
      mfmt("a=-2") +
      "여야 해요 ✓.<span class='xh'>이렇게 확인해요</span>" +
      mfmt("a=-2") +
      "를 넣으면 방정식은 " +
      mfmt("x-2y+10=0") +
      "이에요. <i class='mv'>y</i>에 대해 풀면 " +
      mfmt("2y=x+10") +
      ", " +
      mfmt("y={1/2}x+5") +
      "라 기울기가 정말 " +
      mfmt("{1/2}") +
      "이죠. 기울기가 양수인데 <i class='mv'>a</i>를 양수로 두면 기울기가 음수가 되니, <i class='mv'>a</i>는 음수 −2가 맞아요.",
    core: "y에 대해 풀어 기울기를 a로 나타낸 뒤 비교!",
  },
  // e179 multi 좌표축 평행 방정식 모두 고르기 · 정답 [0,1,3] · diff3
  {
    id: "m2u3e179",
    lessonId: L,
    type: "multi",
    prompt:
      "다음 방정식 중 그래프가 좌표축에 평행한 직선인 것은? <b>정답을 모두 고르세요.</b>",
    options: [
      mfmt("x+7=0"),
      mfmt("2y+18=0"),
      mfmt("x+y-9=0"),
      mfmt("5y-15=0"),
      mfmt("3x-2y=0"),
    ],
    answer: [0, 1, 3],
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>좌표축에 평행한 직선은 <i class='mv'>x</i>=(수) 꼴(y축에 평행)이거나 <i class='mv'>y</i>=(수) 꼴(x축에 평행)이라 문자가 하나만 남아요.<br>① " +
      mfmt("x+7=0") +
      "은 " +
      mfmt("x=-7") +
      "이라 y축에 평행<br>② " +
      mfmt("2y+18=0") +
      "은 " +
      mfmt("y=-9") +
      ", " +
      mfmt("5y-15=0") +
      "은 " +
      mfmt("y=3") +
      "이라 둘 다 x축에 평행해요 ✓. 옳은 것은 세 개예요.<span class='xh'>오답 하나씩 격파</span>" +
      mfmt("x+y-9=0") +
      "은 <i class='mv'>x</i>와 <i class='mv'>y</i>가 모두 있어 " +
      mfmt("y=-x+9") +
      "인 비스듬한 직선이에요. " +
      mfmt("3x-2y=0") +
      "도 " +
      mfmt("y={3/2}x") +
      "로 원점을 지나는 기운 직선이라 어느 축과도 평행하지 않아요. 문자가 하나만 남는 방정식만 좌표축에 평행해요.",
    core: "문자가 하나만 남으면 좌표축에 평행!",
  },
  // e180 num 두 점 (−2,2k+1)(5,k+4) x축 평행 → k=3 · diff1
  {
    id: "m2u3e180",
    lessonId: L,
    type: "num",
    prompt:
      "두 점 (−2, 2<i class='mv'>k</i>+1)과 (5, <i class='mv'>k</i>+4)를 지나는 직선이 <b>x축에 평행할</b> 때, 상수 <i class='mv'>k</i>의 값을 구하세요.",
    answer: "3",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>x축에 평행한 직선(가로선) 위의 점들은 y좌표가 모두 같아야 해요.<br>① 두 점의 y좌표가 같아야 하니 " +
      mfmt("2k+1=k+4") +
      "<br>② " +
      mfmt("2k-k=4-1") +
      "에서 " +
      mfmt("k=3") +
      "이에요 ✓.<span class='xh'>이렇게 확인해요</span>" +
      mfmt("k=3") +
      "을 넣으면 두 점은 (−2, 7)과 (5, 7)이 돼요. y좌표가 둘 다 7로 같으니 이 두 점을 잇는 직선은 x축에 평행한 가로선이 맞아요. 만약 x좌표가 같아야 한다고 착각하면 −2와 5가 달라 성립하지 않으니, x축에 평행할 때는 y좌표를 같게 놓는다는 걸 기억해요.",
    core: "x축에 평행하면 두 점의 y좌표가 같다!",
  },
];
