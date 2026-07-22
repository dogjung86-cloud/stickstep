// m2u5 v2 확장분 D: L8~L9 비파일럿 슬롯(설계표 순번, id=슬롯). 규칙은 rest-a 헤더와 동일.
import type { ExamItem } from "../src/content/exams/types";
import { gsym } from "../src/ui/geoKit";
import {
  m2ExamParaLinesFig,
  m2ExamTrapCutFig,
  m2ExamCentroidFig,
} from "../src/ui/examFiguresMath";

// L8 num 등록부: 6(s128)·30(s130)·13(s134)·27(s133)·7(s137)·9(s141)·10(s145), 중복 없음.
export const POOL_M2U5V2_REST_D: ExamItem[] = [
  {
    // [슬롯 129] 검산: a:b=c:d만 참(평행선 비 보존). a:d=c:b·a:d=b:c류는 반례로 거짓.
    id: "m2u5e129", lessonId: "m2u5l8", type: "mcq",
    prompt: "그림에서 세 직선 l, m, n이 서로 평행할 때, 항상 옳은 것은?",
    figure: m2ExamParaLinesFig({
      gaps: [2, 3], names: ["l", "m", "n"],
      cuts: [
        { x0: 86, x1: 150, labels: ["a", "b"] },
        { x0: 252, x1: 208, labels: ["c", "d"] },
      ],
    }),
    options: ["a:b=c:d", "a:b=d:c", "a=c, b=d", "a:d=b:c", "a+b=c+d"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행한 세 직선은 어떤 직선을 그어도 같은 비로 잘라요. 왼쪽 직선의 위:아래 비 a:b와 오른쪽 직선의 위:아래 비 c:d가 같다는 것, 즉 <b>a:b=c:d</b>가 이 성질의 정확한 표현이에요 ✓<span class='xh'>오답 하나씩 격파</span>a:b=d:c는 위아래가 엇갈린 짝이에요. a=c, b=d는 비가 아니라 길이 자체가 같다는 주장인데, 기울기가 다른 직선은 구간 길이가 얼마든지 달라요. 평행선이 보장하는 것은 길이가 아니라 비율이죠. a:d=b:c도 서로 다른 직선의 위와 아래를 뒤섞은 식이고, a+b=c+d 역시 전체 길이가 같다는 잘못된 주장이에요. '같은 직선 안에서의 비끼리 비교한다'는 원칙 하나로 다 가려낼 수 있어요.",
    core: "평행선의 약속은 길이가 아니라 위:아래 비!",
  },
  {
    // [슬롯 131] 검산: 8:12=2:3 → x:15=2:3 → x=10.
    id: "m2u5e131", lessonId: "m2u5l8", type: "mcq",
    prompt: "그림에서 세 직선 l, m, n이 서로 평행할 때, x의 값은?",
    figure: m2ExamParaLinesFig({
      gaps: [2, 3], names: ["l", "m", "n"],
      cuts: [
        { x0: 84, x1: 148, labels: ["8 cm", "12 cm"] },
        { x0: 252, x1: 210, labels: ["x cm", "15 cm"] },
      ],
    }),
    options: ["10 cm", "12 cm", "8 cm", "18 cm", "9 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>왼쪽 직선의 비를 오른쪽에도 적용해요.<br>① 8:12=2:3<br>② x:15=2:3<br>③ 3x=30, x=<b>10 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>12 cm는 왼쪽 아래 구간을 그대로 옮긴 값이에요. 평행선 사이라도 다른 직선이면 길이는 달라질 수 있고, 같은 것은 비뿐이죠. 8 cm도 마찬가지로 왼쪽 값을 옮긴 것이고, 18 cm는 15×6/5처럼 비를 잘못 만든 값, 9 cm는 어림이에요. x가 위 구간이니 아래(15)보다 짧은 값 중에서 비 2:3을 정확히 만족하는 10이 답이에요. 검산: 10:15=8:12=2:3!",
    core: "옮겨 적기 금지, 비로만 건너간다!",
  },
  {
    // [슬롯 132] 검산: 간격 비 2:3:4 → 6:9:12와 4:6:8. x=6, y=8.
    id: "m2u5e132", lessonId: "m2u5l8", type: "mcq",
    prompt: "그림에서 네 직선 l, m, n, p가 서로 평행할 때, x와 y의 값을 차례대로 나타낸 것은?",
    figure: m2ExamParaLinesFig({
      gaps: [2, 3, 4], names: ["l", "m", "n", "p"],
      cuts: [
        { x0: 82, x1: 152, labels: ["6 cm", "9 cm", "12 cm"] },
        { x0: 254, x1: 206, labels: ["4 cm", "x cm", "y cm"] },
      ],
    }),
    options: ["6과 8", "6과 10", "5와 8", "8과 6", "7과 9"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>평행선이 넷이어도 원리는 같아요. 구간의 비가 두 직선에서 똑같이 유지돼요.<br>① 왼쪽의 비: 6:9:12=2:3:4<br>② 오른쪽도 2:3:4가 되어야 하니 4:x:y=2:3:4<br>③ 한 칸의 크기가 2이므로 x=<b>6</b>, y=<b>8</b> ✓<span class='xh'>오답 하나씩 격파</span>6과 10은 마지막 구간을 4의 배수 감각으로 어림한 값이에요. 첫 구간 4가 비의 2에 해당하니 배율은 2배이고, 3과 4에 각각 2를 곱해 6과 8이 나와요. 8과 6은 순서를 뒤집은 함정이죠. 위에서 아래로 커지는 그림의 흐름(4→6→8)과 맞는지 확인하면 걸러낼 수 있어요. 세 구간짜리 비 문제는 '한 칸의 크기'부터 구하면 늘 한 줄로 끝나요.",
    core: "구간이 늘어도 한 칸 크기부터, 2:3:4 리듬 유지!",
  },
  {
    // [슬롯 133] 검산: 9:x=3:5 → x=15; y:20=3:5 → y=12; x+y=27.
    //  감사 반영(2026-07-23): 간격 비 3:5는 gaps 렌더에만 있고 수치로 미제공 → 답 불유일. 문두에 명시(e136 문형).
    id: "m2u5e133", lessonId: "m2u5l8", type: "num",
    prompt: "그림에서 세 직선 l, m, n은 서로 평행하고, l과 m 사이의 간격과 m과 n 사이의 간격의 비는 3:5예요. x+y의 값을 구하세요.",
    figure: m2ExamParaLinesFig({
      gaps: [3, 5], names: ["l", "m", "n"],
      cuts: [
        { x0: 84, x1: 150, labels: ["9 cm", "x cm"] },
        { x0: 252, x1: 208, labels: ["y cm", "20 cm"] },
      ],
    }),
    answer: "27", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 직선을 따로따로 처리해요.<br>① 왼쪽: 9:x가 간격 비 3:5와 같아야 하므로 x=15<br>② 오른쪽: y:20=3:5이므로 y=12<br>③ x+y=15+12=<b>27</b> ✓<span class='xh'>계산 실수 격파</span>x를 구할 때 9×3/5=5.4처럼 방향을 뒤집으면 아래 구간이 위보다 짧아지는 모순이 생겨요(간격이 3:5로 아래가 넓은 그림이니까요). y에서는 20×5/3처럼 확대 방향으로 잘못 가기 쉽죠. 각 직선마다 '위:아래=3:5' 틀에 값을 끼워 넣고, 미지수가 위인지 아래인지만 확인하면 흔들리지 않아요. 검산: 9:15=12:20=3:5!",
    core: "직선마다 3:5 틀에 끼우고, 위인지 아래인지만 확인!",
  },
  {
    // [슬롯 135] 검산: EF가 평균이 되는 것은 중점일 때(1:1)뿐.
    id: "m2u5e135", lessonId: "m2u5l8", type: "mcq",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("EF", "seg")}∥${gsym("BC", "seg")}예요. ${gsym("EF", "seg")}의 길이가 ${gsym("AD", "seg")}와 ${gsym("BC", "seg")}의 길이의 평균이 되는 것은 ${gsym("AE", "seg")}:${gsym("EB", "seg")}가 얼마일 때인가요?`,
    figure: m2ExamTrapCutFig({
      top: 8, bot: 16, t: 0.5, midTicks: true, paraMarks: true,
    }),
    options: ["1:1", "1:2", "2:1", "1:3", "어떤 비이든 항상 평균이 된다"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>EF는 E의 위치에 따라 AD 쪽 값과 BC 쪽 값 사이를 이동해요. 정확히 한가운데 값(평균)이 되는 것은 E가 AB의 <b>중점(1:1)</b>일 때뿐이에요 ✓ 이때 EF=(AD+BC)÷2가 되죠.<span class='xh'>오답 하나씩 격파</span>어떤 비이든 평균이 된다는 보기가 이 문제의 표적이에요. 1:2라면 EF는 AD에 더 가까운 값이, 2:1이라면 BC에 더 가까운 값이 돼요(정확히는 AD+(BC−AD)×AE/AB). 평균 공식을 아무 위치에나 쓰는 것이 사다리꼴 유형 최대의 오답 원인이라서, 교과서도 시험도 이 경계를 반복해서 확인해요. '평균은 중점 전용'이라고 도장을 찍어 두세요.",
    core: "(AD+BC)÷2는 중점 전용 공식!",
  },
  {
    // [슬롯 136] 진술 multi. 검산: 간격 3:5 세팅, 비 보존 참, 아래>위 참(이 그림), 사선 평행이면 구간도 같음 참.
    id: "m2u5e136", lessonId: "m2u5l8", type: "multi",
    prompt: "그림에서 세 직선 l, m, n은 서로 평행하고, l과 m 사이의 간격과 m과 n 사이의 간격의 비는 3:5예요. 옳은 것을 모두 고르세요.",
    figure: m2ExamParaLinesFig({
      gaps: [3, 5], names: ["l", "m", "n"],
      cuts: [
        { x0: 90, x1: 156, labels: [null, null] },
        { x0: 250, x1: 204, labels: [null, null] },
      ],
    }),
    options: [
      "각 직선이 잘린 위 구간과 아래 구간의 비는 모두 3:5이다",
      "서로 다른 직선의 위 구간의 길이는 항상 같다",
      "이 그림에서 한 직선의 아래 구간은 위 구간보다 길다",
      "두 사선이 서로 평행하면 두 사선의 위 구간의 길이는 같다",
      "간격의 비가 3:5이므로 위 구간과 아래 구간의 길이의 차는 2 cm이다",
    ],
    answer: [0, 2, 3], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>비 보존이 핵심이에요.<br>① 어느 사선이든 위:아래=간격의 비=3:5 ✓<br>② 아래 비중이 5로 더 크니 아래 구간이 더 길어요 ✓<br>③ 두 사선이 평행하면 평행선 사이 평행사변형이 생겨 구간 길이 자체가 같아져요 ✓<span class='xh'>오답 하나씩 격파</span>기울기가 다른 사선끼리는 위 구간의 길이가 제각각이라 항상 같다는 말은 틀려요. 차가 2 cm라는 진술은 비의 수(3과 5)를 실제 길이로 착각한 것이고요. 비의 차 2는 '두 칸 차이'라는 뜻일 뿐, 한 칸이 몇 cm인지는 사선마다 달라요. 비와 길이를 구분하는 감각을 진술 판별로 다시 확인하는 문제예요.",
    core: "비는 보존, 길이는 사선마다, 평행 사선만 길이도 같다!",
  },
  {
    // [슬롯 137] 검산: AE:EB=1:2 → AE:AB=1:3 → EG=BC×⅓=21×⅓=7.
    id: "m2u5e137", lessonId: "m2u5l8", type: "num",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("EF", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AE", "seg")}:${gsym("EB", "seg")}=1:2예요. 대각선 AC와 ${gsym("EF", "seg")}의 교점을 G라 할 때, ${gsym("BC", "seg")}=21 cm이면 ${gsym("EG", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m2ExamTrapCutFig({
      top: 10, bot: 21, t: 1 / 3, diag: true, paraMarks: true,
      labels: { BC: "21 cm" },
    }),
    answer: "7", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대각선 AC가 사다리꼴을 두 삼각형으로 나눠 줘요.<br>① △ABC 안에서 EG∥BC<br>② AE:AB=1:(1+2)=1:3<br>③ EG=BC×⅓=21×⅓=<b>7</b> ✓<span class='xh'>계산 실수 격파</span>조각비 1:2를 그대로 써서 21÷2로 가면 안 돼요. EG는 △ABC의 닮음 대응변이라 조각:전체 비(1:3)를 따라요. 사다리꼴 평행선 문제의 정석 풀이가 바로 이 '대각선으로 쪼개 삼각형 두 개로 만들기'예요. EF 전체를 구할 때도 EG(△ABC 몫)와 GF(△ACD 몫)를 따로 구해 더하죠. 이 문제는 그 첫 조각만 떼어 물은 거예요. 검산: 1:3=7:21!",
    core: "사다리꼴은 대각선으로 쪼개서, EG는 △ABC 몫!",
  },
  {
    // [슬롯 138] 검산: 교차 사선도 비 보존, 8:6=4:3 → x:9=4:3 → x=12.
    id: "m2u5e138", lessonId: "m2u5l8", type: "mcq",
    prompt: "그림에서 세 직선 l, m, n이 서로 평행할 때, x의 값은?",
    figure: m2ExamParaLinesFig({
      gaps: [4, 3], names: ["l", "m", "n"],
      cuts: [
        { x0: 84, x1: 250, labels: ["8 cm", "6 cm"] },
        { x0: 262, x1: 96, labels: ["x cm", "9 cm"] },
      ],
    }),
    options: ["12 cm", "6.75 cm", "10 cm", "8 cm", "13 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>두 사선이 X자로 교차해도 평행선의 비 보존은 그대로예요.<br>① 왼쪽에서 오른쪽으로 가는 사선: 8:6=4:3<br>② 반대로 가는 사선도 위:아래=4:3이므로 x:9=4:3<br>③ 3x=36, x=<b>12 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>6.75 cm는 9×3/4으로 방향을 뒤집은 값이에요. 교차 때문에 어느 쪽이 위 구간인지 헷갈리기 쉬운데, 각 사선을 따로 떼어 '평행선 l, m, n을 차례로 지나는 위, 아래 구간'으로 읽으면 교차는 아무 영향이 없어요. 10 cm나 13 cm는 어림, 8 cm는 왼쪽 값을 옮긴 것이죠. 사선끼리 만나는 점은 평행선의 비와 무관하다는 것, X자 배치의 핵심이에요.",
    core: "교차해도 사선마다 따로, 비 보존은 불변!",
  },
  {
    // [슬롯 139] 검산: 중점(midTicks) → EF=(10+18)/2=14.
    id: "m2u5e139", lessonId: "m2u5l8", type: "mcq",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("EF", "seg")}∥${gsym("BC", "seg")}이고 점 E, F는 각각 ${gsym("AB", "seg")}, ${gsym("DC", "seg")}의 중점이에요. ${gsym("EF", "seg")}의 길이는?`,
    figure: m2ExamTrapCutFig({
      top: 10, bot: 18, t: 0.5, midTicks: true, paraMarks: true,
      labels: { AD: "10 cm", BC: "18 cm", EF: "x cm" },
    }),
    options: ["14 cm", "28 cm", "13 cm", "9 cm", "16 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점을 지나는 평행선이니 평균 공식을 써도 되는 상황이에요.<br>① E가 중점(그림의 같은 눈금)<br>② EF=(AD+BC)÷2=(10+18)÷2=<b>14 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>28 cm는 합에서 나누기를 빼먹은 값이에요. 13 cm나 16 cm는 어림이고, 9 cm는 절반을 잘못 짚은 값이죠. 근거가 궁금하면 대각선을 그어 보세요. △ABC 몫이 18÷2=9, △ACD 몫이 10÷2=5로 나뉘고 합이 14가 돼요. 평균 공식은 이 두 절반의 합을 한 번에 쓴 것일 뿐이에요. 공식과 유도가 같은 답을 주는 것을 확인하면 어느 쪽도 잊지 않아요.",
    core: "중점이니 평균 OK, 유도는 대각선 절반+절반!",
  },
  {
    // [슬롯 140] 검산: 중점 평균 역산, 15=(9+x)/2 → x=21.
    id: "m2u5e140", lessonId: "m2u5l8", type: "mcq",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("EF", "seg")}∥${gsym("BC", "seg")}이고 점 E, F는 각각 ${gsym("AB", "seg")}, ${gsym("DC", "seg")}의 중점이에요. ${gsym("AD", "seg")}=9 cm, ${gsym("EF", "seg")}=15 cm일 때, ${gsym("BC", "seg")}의 길이는?`,
    figure: m2ExamTrapCutFig({
      top: 9, bot: 21, t: 0.5, midTicks: true, paraMarks: true,
      labels: { AD: "9 cm", EF: "15 cm", BC: "x cm" },
    }),
    options: ["21 cm", "12 cm", "24 cm", "30 cm", "18 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>평균 공식을 거꾸로 풀어요.<br>① EF=(AD+BC)÷2<br>② 15=(9+x)÷2<br>③ 9+x=30, x=<b>21 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>12 cm는 15−9+6 같은 어림 계산이고, 24 cm는 15+9로 더한 값, 30 cm는 2배에서 멈춘 값(9+x 전체), 18 cm는 15와 21 사이 어림이에요. 역산의 정석은 공식을 그대로 쓴 뒤 방정식으로 푸는 것이에요. 양변에 2를 곱해 30을 만들고 9를 빼는 두 걸음이면 끝나죠. 답을 얻으면 (9+21)÷2=15로 정방향 검산까지 하는 습관이 실수를 지워 줘요.",
    core: "역산은 공식 세우고 방정식으로, 검산은 정방향으로!",
  },
  {
    // [슬롯 141] 검산: 위:아래=5:3, 합 24 → 아래 x=24×3/8=9.
    id: "m2u5e141", lessonId: "m2u5l8", type: "num",
    prompt: "그림에서 세 직선 l, m, n은 서로 평행해요. 오른쪽 직선이 위에서부터 5, 3의 비로 잘리고, 왼쪽 직선이 잘린 두 구간의 길이의 합이 24 cm일 때, 왼쪽 직선의 아래 구간의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.",
    figure: m2ExamParaLinesFig({
      gaps: [5, 3], names: ["l", "m", "n"],
      cuts: [
        { x0: 86, x1: 150, labels: [null, "x cm"] },
        { x0: 252, x1: 210, labels: ["5", "3"] },
      ],
    }),
    answer: "9", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>비와 합이 주어진 비례배분 문제예요.<br>① 왼쪽 직선도 위:아래=5:3으로 잘려요<br>② 전체 24를 5:3으로 나누면 한 칸은 24÷8=3<br>③ 아래 구간 x=3×3=<b>9</b> ✓<span class='xh'>계산 실수 격파</span>24×5/8=15는 위 구간을 구한 값이에요. 문제가 물은 것이 위인지 아래인지 마지막에 다시 확인하세요. 또 5와 3을 실제 길이로 착각해 x=3이라고 답하는 실수도 있어요. 오른쪽의 5, 3은 비율이고, 왼쪽의 실제 길이는 합 24를 나눠서 나와요. 비례배분(합÷비의 합×해당 비)은 초등에서 배운 도구지만 평행선 구도에서 다시 활약하죠. 검산: 15+9=24, 15:9=5:3!",
    core: "합이 주어지면 비례배분: 24를 5:3으로!",
  },
  {
    // [슬롯 142] 검산: 2:3:4 배분, 전체 27 → 가운데 27×3/9=9.
    id: "m2u5e142", lessonId: "m2u5l8", type: "mcq",
    prompt: "그림에서 네 직선 l, m, n, p는 서로 평행하고, 간격의 비는 위에서부터 2:3:4예요. 한 직선이 세 평행선 사이에서 잘린 전체 길이가 27 cm일 때, 가운데 구간의 길이는?",
    figure: m2ExamParaLinesFig({
      gaps: [2, 3, 4], names: ["l", "m", "n", "p"],
      cuts: [
        { x0: 110, x1: 210, labels: [null, "x cm", null] },
      ],
    }),
    options: ["9 cm", "6 cm", "12 cm", "13.5 cm", "8 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>세 구간의 비도 간격의 비 2:3:4를 그대로 따라요.<br>① 비의 합: 2+3+4=9<br>② 한 칸: 27÷9=3<br>③ 가운데 구간=3×3=<b>9 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>6 cm는 첫 구간(2칸), 12 cm는 마지막 구간(4칸)의 값이에요. 어느 구간을 물었는지 짚고 답하세요. 13.5 cm는 27을 2로 나눈 어림이고, 8 cm는 칸 수를 잘못 센 값이죠. 구간이 셋으로 늘어도 도구는 똑같이 비례배분이에요. 전체÷비의 합으로 한 칸을 구하고 해당 칸 수를 곱하면 어떤 다단 구성도 무너지지 않아요. 검산: 6+9+12=27!",
    core: "다단 구간도 비례배분 한 줄: 한 칸×칸 수!",
  },
  {
    // [슬롯 143] TC 진술 multi. 검산: 중점 세팅(6·10), EF=8·평행·F 중점 참.
    id: "m2u5e143", lessonId: "m2u5l8", type: "multi",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("BC", "seg")}이고 점 E는 ${gsym("AB", "seg")}의 중점, ${gsym("EF", "seg")}∥${gsym("BC", "seg")}예요. ${gsym("AD", "seg")}=6 cm, ${gsym("BC", "seg")}=10 cm일 때, 옳은 것을 모두 고르세요.`,
    figure: m2ExamTrapCutFig({
      top: 6, bot: 10, t: 0.5, midTicks: true, paraMarks: true,
      labels: { AD: "6 cm", BC: "10 cm" },
    }),
    options: [
      `점 F는 ${gsym("DC", "seg")}의 중점이다`,
      `${gsym("EF", "seg")}=8 cm이다`,
      `${gsym("EF", "seg")}∥${gsym("AD", "seg")}이다`,
      `${gsym("EF", "seg")}=16 cm이다`,
      `${gsym("EF", "seg")}의 길이는 ${gsym("AD", "seg")}의 길이보다 짧다`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점에서 그은 평행선의 성질을 모아 확인해요.<br>① E가 중점이고 EF∥BC이면 F도 반대편 변의 중점 ✓<br>② EF=(6+10)÷2=8 cm ✓<br>③ EF∥BC이고 AD∥BC이니 셋 다 평행 ✓<span class='xh'>오답 하나씩 격파</span>16 cm는 합에서 나누기를 빼먹은 값이에요. EF가 AD보다 짧다는 진술은 그림만 봐도 어긋나요. EF는 위 변(6)과 아래 변(10) 사이의 값이라 6보다 길고 10보다 짧은 8이 되죠. 사다리꼴의 가운데 평행선은 언제나 두 밑변 사이 크기라는 감각, 답의 타당성을 검사하는 좋은 잣대예요.",
    core: "가운데 평행선은 두 밑변 사이 값, 중점이면 정확히 평균!",
  },
  {
    // [슬롯 144] 검산: 6:15=2:5 → x:10? wait 4:x=2:5 → x=10.
    id: "m2u5e144", lessonId: "m2u5l8", type: "mcq",
    prompt: "그림에서 세 직선 l, m, n이 서로 평행할 때, x의 값은?",
    figure: m2ExamParaLinesFig({
      gaps: [2, 5], names: ["l", "m", "n"],
      cuts: [
        { x0: 86, x1: 148, labels: ["6 cm", "15 cm"] },
        { x0: 252, x1: 212, labels: ["4 cm", "x cm"] },
      ],
    }),
    options: ["10 cm", "13 cm", "8 cm", "12 cm", "9 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>간격이 크게 다른 세팅이지만 원리는 같아요.<br>① 왼쪽의 비: 6:15=2:5<br>② 오른쪽도 2:5이므로 4:x=2:5<br>③ 2x=20, x=<b>10 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>13 cm는 15−6+4처럼 차이를 이어 붙인 덧셈식 사고예요. 평행선의 관계는 덧셈이 아니라 곱셈(비율)이죠. 8 cm는 4×2로 비의 수를 배율로 착각한 값이고, 12 cm와 9 cm는 어림이에요. 위 구간 4가 왼쪽 위 6보다 짧으니 아래도 15보다 짧아야 한다는 크기 감각(10<15 ✓)으로 마지막 검산을 하면 좋아요. 검산: 4:10=6:15=2:5!",
    core: "간격이 극단이어도 덧셈 금지, 비율로!",
  },
  {
    // [슬롯 145] 검산: 중점 → EF=(7+13)/2=10.
    id: "m2u5e145", lessonId: "m2u5l8", type: "num",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("EF", "seg")}∥${gsym("BC", "seg")}이고 점 E, F는 각각 ${gsym("AB", "seg")}, ${gsym("DC", "seg")}의 중점이에요. ${gsym("EF", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTrapCutFig({
      top: 7, bot: 13, t: 0.5, midTicks: true, paraMarks: true,
      labels: { AD: "7 cm", BC: "13 cm", EF: "x cm" },
    }),
    answer: "10", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점을 지나는 평행선이니 평균으로 바로 구해요.<br>① E, F가 중점(같은 눈금 표시)<br>② x=(7+13)÷2=<b>10</b> ✓<span class='xh'>계산 실수 격파</span>7+13=20에서 멈추면 2배 값이에요. 평균의 '2로 나누기'까지가 공식이죠. 또 이 공식이 중점일 때만 통한다는 조건을 늘 떠올리세요. 다른 위치라면 대각선을 그어 두 삼각형 몫(13÷2=6.5와 7÷2=3.5)을 더하는 정석으로 돌아가야 해요. 지금은 중점이라 어느 길로 가든 10이 나와요. 답이 7과 13 사이에 있는지 확인하는 크기 감각 검산도 잊지 마세요!",
    core: "중점 평행선 = 평균, 두 밑변 사이인지 확인!",
  },

  // ─ L9 삼각형의 무게중심 ─
  // L9 num 등록부: 26(s146)·27(s147)·16(s151)·14(s152)·18(s155)·36(s159)·7(s163), 중복 없음.
  {
    // [슬롯 148] 검산: GD=⅓AD=⅓×30=10.
    id: "m2u5e148", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 중선 ${gsym("AD", "seg")}의 길이는 30 cm예요. ${gsym("GD", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({
      B: 59, C: 47, medians: ["AD"], showG: true, ticks: ["BD"],
    }),
    options: ["10 cm", "20 cm", "15 cm", "6 cm", "12 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 꼭짓점 쪽 2, 밑변 쪽 1로 나눠요.<br>① AG:GD=2:1<br>② GD는 전체의 ⅓<br>③ GD=30×⅓=<b>10 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>20 cm는 AG(꼭짓점 쪽 ⅔)의 길이예요. 문제가 어느 조각을 묻는지 확인하세요. 15 cm는 2:1을 1:1로 착각해 절반을 낸 값이고, 6 cm는 ⅕, 12 cm는 0.4배 어림이에요. 밑변에 가까운 쪽이 짧은 조각(⅓)이라는 위치 감각, 즉 무게중심이 밑변 쪽으로 치우쳐 있다는 그림 이미지를 기억하면 2:1의 방향을 잊지 않아요.",
    core: "GD는 밑변 쪽 짧은 조각, 전체의 ⅓!",
  },
  {
    // [슬롯 149] 검산: D는 BC 중점 → BD=½×26=13.
    id: "m2u5e149", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("BC", "seg")}=26 cm예요. ${gsym("BD", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({
      B: 58, C: 48, medians: ["AD"], showG: true, ticks: ["BD"],
      segLabels: [{ on: "BC", label: "26 cm" }],
    }),
    options: ["13 cm", "26 cm", "6.5 cm", "39 cm", "20 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중선의 정의로 바로 풀려요.<br>① AD가 중선이므로 D는 BC의 중점<br>② BD=½×26=<b>13 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>중선이라는 말에서 2:1부터 떠올려 26을 2:1로 나누려는 것이 이 문제의 함정이에요. 2:1은 중선 위(AD 방향)의 이야기이고, 밑변 BC는 중점 D가 정확히 절반(1:1)으로 나눠요. 6.5 cm는 ¼, 39 cm는 1.5배, 20 cm는 어림이죠. 무게중심 그림에는 두 종류의 분할이 공존해요. 밑변은 1:1, 중선은 2:1. 어느 선분 위의 이야기인지부터 확인하는 습관이 핵심이에요.",
    core: "밑변은 1:1(중점), 2:1은 중선 위 전용!",
  },
  {
    // [슬롯 151] 검산: △GBC=△ABC의 ⅓=48÷3=16.
    id: "m2u5e151", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("ABC", "tri")}의 넓이는 48 cm²예요. 색칠한 ${gsym("GBC", "tri")}의 넓이는 몇 cm²인지 구하세요.`,
    figure: m2ExamCentroidFig({
      B: 57, C: 49, medians: ["AD", "BE", "CF"], showG: true,
      shade: ["GBD", "GDC"],
    }),
    answer: "16", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>여섯 조각 그림에서 △GBC가 몇 조각인지 세요.<br>① 세 중선은 넓이를 6등분<br>② △GBC=△GBD+△GDC로 두 조각<br>③ 48×2/6=<b>16</b> ✓<span class='xh'>계산 실수 격파</span>48÷6=8에서 멈추면 한 조각(△GBD)만 구한 거예요. 색칠된 부분이 조각 두 개를 합친 삼각형이라는 것을 그림에서 확인해야 해요. 무게중심과 세 꼭짓점을 이으면 삼각형이 △GAB, △GBC, △GCA 셋으로 나뉘고 각각 전체의 ⅓이라는 결론(6조각의 2개씩)을 통째로 기억해 두면, 이런 문제는 나누기 한 번으로 끝나요. 검산: 16×3=48!",
    core: "꼭짓점 셋과 G를 이으면 ⅓씩 삼등분!",
  },
  {
    // [슬롯 152] 검산: BG=⅔×중선 BE=⅔×21=14.
    id: "m2u5e152", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이에요. 중선 ${gsym("BE", "seg")}의 길이가 21 cm일 때, ${gsym("BG", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m2ExamCentroidFig({
      B: 60, C: 46, medians: ["AD", "BE"], showG: true,
      segLabels: [{ on: "BG", label: "x cm" }],
    }),
    answer: "14", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>2:1 규칙은 세 중선 모두에 똑같이 적용돼요.<br>① BE도 중선이므로 BG:GE=2:1<br>② BG=BE×⅔=21×⅔=<b>14</b> ✓<span class='xh'>계산 실수 격파</span>21×⅓=7은 GE(중점 쪽 짧은 조각)예요. B에서 출발하는 긴 조각을 물었으니 ⅔죠. 중선이 AD가 아니라 BE로 바뀌면 갑자기 헷갈리는 경우가 많은데, 규칙은 '꼭짓점 쪽이 2'라는 것 하나예요. 어느 중선이든 출발점(꼭짓점)에서 무게중심까지가 ⅔, 무게중심에서 중점까지가 ⅓이에요. 검산: BG:GE=14:7=2:1!",
    core: "어느 중선이든 꼭짓점 쪽이 ⅔!",
  },
  {
    // [슬롯 153] 검산: AD=27 → GD=9 → GG′=⅔GD=6.
    id: "m2u5e153", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고, 점 G′는 ${gsym("GBC", "tri")}의 무게중심이에요. 중선 ${gsym("AD", "seg")}=27 cm일 때, ${gsym("GG′", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({
      B: 58, C: 48, medians: ["AD"], showG: true, g2: true, ticks: ["BD"],
    }),
    options: ["6 cm", "9 cm", "18 cm", "3 cm", "12 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>2:1 규칙을 두 번 겹쳐 써요.<br>① △ABC에서: GD=AD×⅓=27÷3=9<br>② △GBC에서 GD는 G′가 놓이는 중선이고, GG′=GD×⅔=9×⅔=<b>6 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>9 cm는 GD에서 멈춘 값이에요. G′는 △GBC의 무게중심이라 그 삼각형의 중선 GD를 다시 2:1로 나누죠. 18 cm는 AG(첫 삼각형의 ⅔)이고, 3 cm는 G′D(⅓의 ⅓), 12 cm는 어림이에요. 결국 GG′=AD×⅓×⅔=AD×2/9로, 같은 규칙이 다른 삼각형에 반복 적용되는 구조예요. 이중 무게중심은 이 반복 감각을 확인하는 단골 심화랍니다.",
    core: "이중 무게중심 = 2:1 규칙의 반복, ⅓의 ⅔!",
  },
  {
    // [슬롯 154] 진술 multi. 검산: 2:1·한 점·6등분 참 / AG=GD X / 세 변 등거리는 내심 X.
    id: "m2u5e154", lessonId: "m2u5l9", type: "multi",
    prompt: "삼각형의 무게중심에 대한 설명으로 옳은 것을 모두 고르세요.",
    options: [
      "무게중심은 중선을 꼭짓점으로부터 2:1로 나눈다",
      "세 중선은 한 점에서 만난다",
      "세 중선은 삼각형의 넓이를 6등분한다",
      "무게중심은 중선의 중점이다",
      "무게중심은 세 변에서 같은 거리에 있다",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>무게중심의 3대 성질 그대로예요.<br>① 꼭짓점 쪽부터 2:1 ✓<br>② 세 중선의 교점이 무게중심 ✓<br>③ 여섯 조각의 넓이가 모두 같음 ✓<span class='xh'>오답 하나씩 격파</span>중선의 중점이라는 말은 1:1로 나눈다는 뜻이라 2:1과 모순돼요. 세 변에서 같은 거리에 있는 점은 내심(내접원의 중심)이고, 세 꼭짓점에서 같은 거리는 외심이죠. 무게중심, 내심, 외심은 각각 중선, 각의 이등분선, 수직이등분선의 교점이라는 출신이 달라요. 삼각형의 중심 삼형제를 정의로 구분하는 것이 이런 진술 문제의 바탕이에요.",
    core: "무게중심=중선 교점·2:1·6등분, 등거리는 남의 성질!",
  },
  {
    // [슬롯 155] 검산: G 지나는 평행선 EF=⅔BC=⅔×27=18.
    id: "m2u5e155", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고, G를 지나며 ${gsym("BC", "seg")}에 평행한 직선이 두 변과 만나는 점을 E, F라 해요. ${gsym("BC", "seg")}=27 cm일 때, ${gsym("EF", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m2ExamCentroidFig({
      B: 58, C: 47, medians: ["AD"], showG: true, ef: true, ticks: ["BD"],
      segLabels: [{ on: "BC", label: "27 cm" }, { on: "EF", label: "x cm" }],
    }),
    answer: "18", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>무게중심과 평행선 단원이 만나는 융합이에요.<br>① G는 중선 AD를 A로부터 ⅔ 지점에서 지나요<br>② EF∥BC이므로 △AEF∽△ABC, 닮음비는 AG:AD=2:3<br>③ EF=BC×⅔=27×⅔=<b>18</b> ✓<span class='xh'>계산 실수 격파</span>절반(13.5)으로 어림하는 것이 흔한 실수예요. G가 중선의 한가운데가 아니라 ⅔ 지점에 있다는 것이 이 문제의 심장이죠. 2:1 규칙이 낮이의 비 2:3(A에서 잰 조각:전체)으로 번역되고, 그 비가 평행선 닮음으로 EF에 전달되는 두 단계 흐름을 따라가 보세요. 앞 단원(평행선의 비)과 이번 단원(무게중심)이 한 문제에서 만나는 대표 융합형이에요.",
    core: "G 통과 평행선 = 닮음비 2:3, 절반 아님!",
  },
  {
    // [슬롯 156] 검산: 균형점 = 무게중심, 꼭짓점에서 중선의 ⅔ → 33×⅔=22.
    id: "m2u5e156", lessonId: "m2u5l9", type: "mcq",
    prompt: "삼각형 모양의 나무 쟁반을 손가락 하나로 수평이 되게 받치려고 해요. 받칠 점은 꼭짓점 A와 마주 보는 변의 중점 D를 이은 선분 위에 있고, 이 선분의 길이는 33 cm예요. A로부터 몇 cm 지점을 받쳐야 하나요?",
    figure: m2ExamCentroidFig({
      B: 59, C: 48, medians: ["AD"], showG: true, ticks: ["BD"],
    }),
    options: ["22 cm", "11 cm", "16.5 cm", "26 cm", "30 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>고르게 만든 삼각형 판이 수평으로 균형을 이루는 점이 바로 무게중심이에요.<br>① 받칠 점=무게중심 G<br>② AG=AD×⅔=33×⅔=<b>22 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>16.5 cm는 중선의 절반인데, 무게중심은 한가운데가 아니라 밑변 쪽으로 치우친 ⅔ 지점이에요. 손가락으로 받치는 상상을 해 보면 넓은 밑변 쪽에 살이 더 많으니 균형점도 그쪽으로 쏠리는 것이 자연스럽죠. 11 cm는 ⅓(반대쪽에서 잰 값), 26 cm와 30 cm는 어림이에요. 무게중심이라는 이름 자체가 물리에서 온 것이라는 것, 판을 실제로 오려 실험해 볼 수 있다는 것이 이 개념의 매력이에요.",
    core: "균형점=무게중심, 꼭짓점에서 ⅔ 지점!",
  },
  {
    // [슬롯 157] 검산: D는 중점 → DC=BD=9.
    id: "m2u5e157", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 ${gsym("AD", "seg")}는 ${gsym("ABC", "tri")}의 중선이고 ${gsym("BD", "seg")}=9 cm예요. ${gsym("DC", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({
      B: 61, C: 47, medians: ["AD"], showG: false, ticks: ["BD"],
      segLabels: [{ on: "BD", label: "9 cm" }],
    }),
    options: ["9 cm", "18 cm", "4.5 cm", "6 cm", "13.5 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중선의 정의를 확인하는 문제예요.<br>① 중선은 꼭짓점과 마주 보는 변의 <b>중점</b>을 이은 선분<br>② D가 BC의 중점이므로 DC=BD=<b>9 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>18 cm는 BC 전체의 길이이고, 4.5 cm는 9를 다시 절반 낸 값이에요. 6 cm는 2:1 규칙을 밑변에 잘못 가져온 값이죠. 2:1은 무게중심이 중선을 나누는 비율이지, 중점 D가 밑변을 나누는 비율이 아니에요. 용어의 정의(중선, 중점)와 성질(2:1)을 분리해서 쓰는 것, 단원 마무리에서 꼭 다시 확인해야 할 기본기예요.",
    core: "중선의 발은 중점, 밑변 분할은 언제나 1:1!",
  },
  {
    // [슬롯 158은 파일럿] [슬롯 159] 검산: GG′=8 → GD=8×3/2=12 → AD=3×12=36.
    id: "m2u5e159", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고, 점 G′는 ${gsym("GBC", "tri")}의 무게중심이에요. ${gsym("GG′", "seg")}=8 cm일 때, 중선 ${gsym("AD", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m2ExamCentroidFig({
      B: 59, C: 46, medians: ["AD"], showG: true, g2: true, ticks: ["BD"],
    }),
    answer: "36", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>정방향 관계(GG′=AD×2/9)를 거꾸로 타요.<br>① △GBC에서 GG′=GD×⅔이므로 GD=8×3/2=12<br>② △ABC에서 GD=AD×⅓이므로 AD=12×3=<b>36</b> ✓<span class='xh'>계산 실수 격파</span>역산에서는 각 단계의 배율을 뒤집어(⅔ 대신 3/2을, ⅓ 대신 3을 곱해) 적용해야 해요. 8×⅔×⅓처럼 정방향 배율을 또 곱하면 점점 작아지는 엉뚱한 값이 나오죠. 지금 아는 값이 어느 삼각형의 어느 조각인지(GG′는 작은 삼각형 쪽 조각) 표시하며 한 층씩 올라가세요. 검산: AD=36 → GD=12 → GG′=8 ✓, 한 번에 확인하면 36×2/9=8!",
    core: "역산은 배율을 뒤집어 한 층씩: ×3/2, ×3!",
  },
  {
    // [슬롯 160] 검산: 6조각 중 2조각(GBD·GCE) 색칠, 72×2/6=24.
    id: "m2u5e160", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("ABC", "tri")}의 넓이는 72 cm²예요. 색칠한 부분의 넓이는?`,
    figure: m2ExamCentroidFig({
      B: 58, C: 49, medians: ["AD", "BE", "CF"], showG: true,
      shade: ["GBD", "GCE"],
    }),
    options: ["24 cm²", "12 cm²", "36 cm²", "18 cm²", "48 cm²"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>색칠한 곳이 여섯 조각 중 몇 개인지부터 세요.<br>① 세 중선은 넓이를 6등분<br>② 색칠은 서로 떨어진 두 조각<br>③ 72×2/6=<b>24 cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>12 cm²는 한 조각 값이에요. 떨어져 있는 두 조각도 각각 같은 넓이(12)라서 그냥 더하면 돼요. 36 cm²는 절반, 18 cm²는 1.5조각 어림, 48 cm²는 4조각 값이죠. 조각들이 붙어 있든 떨어져 있든 여섯 조각의 넓이가 전부 같다는 사실만 믿으면, 어떤 조합 색칠 문제도 개수 세기로 끝나요. 6등분의 근거(중선이 밑변을 절반으로 나누니 높이가 같은 두 삼각형이 생김)도 함께 기억해 두세요.",
    core: "어떤 조합이든 조각 수 세기, 6등분은 만능 자!",
  },
  {
    // [슬롯 161] 진술 multi. 검산: AD=15 → AG=10·GD=5.
    id: "m2u5e161", lessonId: "m2u5l9", type: "multi",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 중선 ${gsym("AD", "seg")}의 길이는 15 cm예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamCentroidFig({
      B: 60, C: 47, medians: ["AD"], showG: true, ticks: ["BD"],
    }),
    options: [
      `${gsym("AG", "seg")}=10 cm이다`,
      `${gsym("GD", "seg")}=5 cm이다`,
      `${gsym("AG", "seg")}:${gsym("GD", "seg")}=2:1이다`,
      `${gsym("AG", "seg")}=7.5 cm이다`,
      `점 G는 ${gsym("AD", "seg")}의 중점이다`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>15를 2:1로 나누면 끝이에요.<br>① AG=15×⅔=10 cm ✓<br>② GD=15×⅓=5 cm ✓<br>③ 10:5=2:1 ✓<span class='xh'>오답 하나씩 격파</span>7.5 cm와 '중점' 진술은 같은 오해(1:1 분할)의 두 얼굴이에요. 무게중심이 중선의 한가운데라면 균형점이 밑변 쪽 무게를 반영하지 못하겠죠. 꼭짓점 쪽이 2배 길다는 것, 그래서 G가 밑변 쪽으로 치우친다는 것을 수치(10과 5)로 확인하는 문제예요. 세 값(전체 15, 조각 10과 5)이 늘 세트로 움직인다는 감각을 들이면 어떤 조각을 물어도 즉답이 나와요.",
    core: "15는 10+5로, 2:1 세트 감각!",
  },
  {
    // [슬롯 162] 검산: AG=12 → GD=½AG=6.
    id: "m2u5e162", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이에요. ${gsym("AG", "seg")}=12 cm일 때, ${gsym("GD", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({
      B: 57, C: 48, medians: ["AD"], showG: true, ticks: ["BD"],
      segLabels: [{ on: "AG", label: "12 cm" }],
    }),
    options: ["6 cm", "12 cm", "4 cm", "8 cm", "24 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>조각에서 조각으로 바로 건너가요.<br>① AG:GD=2:1<br>② GD=AG×½=12×½=<b>6 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>4 cm는 12×⅓으로, AG를 중선 전체로 착각한 값이에요. 12는 이미 꼭짓점 쪽 조각(⅔ 몫)이니 전체는 18이고, GD는 6이죠. 8 cm는 ⅔을 조각에 또 곱한 값, 24 cm는 2배로 방향이 뒤집힌 값이에요. 주어진 값이 전체(중선)인지 조각(AG, GD)인지 확인하고, 조각끼리는 2:1로 직행하는 것이 가장 짧은 길이에요. 검산: AG+GD=12+6=18=AD, 12:6=2:1!",
    core: "주어진 게 조각이면 2:1로 직행, 전체 착각 금지!",
  },
  {
    // [슬롯 163] 검산: GD=⅓AD=⅓×21=7.
    id: "m2u5e163", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 중선 ${gsym("AD", "seg")}의 길이는 21 cm예요. ${gsym("GD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamCentroidFig({
      B: 58, C: 46, medians: ["AD"], showG: true, ticks: ["BD"],
      segLabels: [{ on: "GD", label: "x cm" }],
    }),
    answer: "7", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>2:1 분할에서 밑변 쪽 조각을 구해요.<br>① AG:GD=2:1이므로 GD는 전체의 ⅓<br>② x=21×⅓=<b>7</b> ✓<span class='xh'>계산 실수 격파</span>21×⅔=14는 AG예요. 묻는 조각이 G 아래쪽(밑변 쪽)이라는 것을 그림에서 확인하고 ⅓을 골라야 해요. 21÷2=10.5처럼 절반을 내면 2:1을 1:1로 뭉갠 것이고, 답이 소수로 나오는 순간 방향을 의심해야 하죠. 검산: AG=14, GD=7이면 합이 21이고 비가 2:1이니, 세 수가 한 세트로 정확히 맞아떨어져요!",
    core: "밑변 쪽 조각은 ⅓, 소수가 나오면 의심!",
  },
];
