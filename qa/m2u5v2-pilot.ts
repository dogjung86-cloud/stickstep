// m2u5 v2 파일럿 40문항(교과서 준거 규격) - 정본 설계표 qa/m2u5-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: src 미수정, index.ts 미등록. 승인 후 슬롯 번호대로 m2u5lN.ts에 이식한다.
// 표기: 기하 풀 mfmt 미사용(gsym, 유니코드 리터럴), em대시 금지, 뺄셈·차는 −(U+2212), num answer만 ASCII.
// 발문 표준: 조건(관계)은 문두, 수치는 그림 라벨(단위 병기, 미지수 x cm), 핵심 수치 이중 제시.
// 각 문항 주석 = [슬롯 n] 검산 노트.
import type { ExamItem } from "../src/content/exams/types";
import { gsym } from "../src/ui/geoKit";
import {
  m2ExamSimQuadPairFig,
  m2ExamTriPairFig,
  m2ExamTriSplitFig,
  m2ExamXCrossFig,
  m2ExamRightAltFig,
  m2ExamParaLinesFig,
  m2ExamTrapCutFig,
  m2ExamMidsegFig,
  m2ExamMidQuadFig,
  m2ExamCentroidFig,
  m2ExamPythaSquaresFig,
  m2ExamRightTriFig,
  m2ExamGridRightFig,
  m2ExamConeCutFig,
  m2ExamSolidPairFig,
  m2ExamFrameFig,
  m2ExamSectorPairFig,
} from "../src/ui/examFiguresMath";

export const POOL_M2U5V2_PILOT: ExamItem[] = [
  // ─ L1 도형의 닮음 ─
  {
    // [슬롯 1] 검산: BC:EF=9:15=3:5, CA:FD=12:20=3:5 일치. ratio 5/3 실비.
    //  실각: BC:CA=9:12=sinA:sinB → A=48°, B=82°(sin48/sin82=0.750), C=50°.
    id: "m2u5e001", lessonId: "m2u5l1", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. 두 삼각형의 닮음비를 가장 간단한 자연수의 비로 나타내면?`,
    figure: m2ExamTriPairFig({
      B1: 82, C1: 50, ratio: 5 / 3,
      sides1: { BC: "9 cm", CA: "12 cm" }, sides2: { BC: "15 cm", CA: "20 cm" },
      names2: ["D", "E", "F"],
    }),
    options: ["3:5", "5:3", "9:15", "3:4", "5:9"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮음비는 대응변의 길이의 비예요.<br>① BC의 대응변은 EF: 9:15<br>② 9:15를 가장 간단한 자연수의 비로 줄이면 <b>3:5</b><br>③ CA:FD=12:20=3:5로도 같은 값이 나와요 ✓<span class='xh'>오답 하나씩 격파</span>5:3은 큰 도형부터 잰 비예요. △ABC∽△DEF처럼 ABC가 먼저 쓰였으니 비도 ABC 쪽이 앞이어야 해요. 9:15는 줄이기 전의 비라서 문제의 조건(가장 간단한 자연수의 비)에 맞지 않아요. 3:4나 5:9는 대응하지 않는 변끼리 섞어 잰 값이에요. 닮음비는 반드시 대응변끼리, 그리고 기호에 쓰인 순서대로 재는 것이 핵심이에요.",
    core: "닮음비는 대응변의 비, 기호 순서대로 재고 가장 간단히!",
  },
  {
    // [슬롯 2] 검산: AB:EF=6:9=2:3, BC=10 → FG=10×3/2=15. angles 합 95+85+88+92=360.
    id: "m2u5e002", lessonId: "m2u5l1", type: "num",
    prompt: `그림에서 사각형 ABCD∽사각형 EFGH이고 ${gsym("AB", "seg")}=6 cm, ${gsym("EF", "seg")}=9 cm, ${gsym("BC", "seg")}=10 cm예요. ${gsym("FG", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamSimQuadPairFig({
      angles: [95, 85, 88, 92], sides: [6, 10], ratio: 1.5,
      sidesL: ["6 cm", "10 cm", null, null], sidesR: ["9 cm", "x cm", null, null],
      namesL: ["A", "B", "C", "D"], namesR: ["E", "F", "G", "H"],
    }),
    answer: "15", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮은 도형에서 대응변의 길이의 비는 모두 같아요.<br>① 닮음비: AB:EF=6:9=2:3<br>② BC의 대응변은 FG이므로 BC:FG=2:3<br>③ 10:x=2:3, 2x=30, x=<b>15</b> ✓<span class='xh'>계산 실수 격파</span>10×2÷3으로 계산해 약 6.7을 얻었다면 비의 방향이 뒤집힌 거예요. EFGH가 더 큰 도형이니 FG는 BC보다 길어야 해요. 답이 조건과 어울리는지, 큰 도형의 변이 정말 커졌는지 마지막에 확인하는 습관이 실수를 막아 줘요. 검산: 6:9=10:15=2:3으로 두 쌍의 비가 같으니 맞아요.",
    core: "닮음비 확정 후 대응변에 같은 비를 적용!",
  },
  {
    // [슬롯 4] 무그림(화이트리스트 ① 항상 닮음 판별). 두 원만 항상 닮음.
    id: "m2u5e004", lessonId: "m2u5l1", type: "mcq",
    prompt: "다음 중 두 도형이 항상 서로 닮은 도형인 것은?",
    options: ["두 원", "두 직사각형", "두 이등변삼각형", "두 마름모", "두 직각삼각형"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>항상 닮음이 되려면 모양이 하나로 정해지는 도형이어야 해요. <b>두 원</b>은 크기(반지름)만 다를 뿐 모양이 언제나 같아서 항상 닮음이에요 ✓ 정삼각형, 정사각형, 구처럼 정해진 모양의 도형들이 이 부류예요.<span class='xh'>오답 하나씩 격파</span>직사각형은 가로세로 비가 제각각이라 길쭉한 것과 정사각형에 가까운 것은 닮지 않았어요. 이등변삼각형도 꼭지각이 20°인 뾰족한 것과 100°인 납작한 것이 있죠. 마름모는 네 변이 같아도 내각이 다르면 모양이 달라요. 직각삼각형 역시 직각 하나만 같을 뿐 나머지 두 각이 다를 수 있어요. 변의 비와 각이 전부 저절로 같아지는 도형만 항상 닮음이에요.",
    core: "모양이 하나로 정해지는 도형(원·정다각형·구)만 항상 닮음!",
  },
  {
    // [슬롯 7] 검산: 닮음비 BC:EF=8:12=2:3. y=15×2/3=10, x=12×3/2=18, x+y=28.
    //  실각: 변 (10,8,12) → cosB=0.125(B=83°), cosC≈0.56(C=56°), A=41°. 라벨-실비 일치.
    id: "m2u5e007", lessonId: "m2u5l1", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. <i class='mv'>x</i>+<i class='mv'>y</i>의 값을 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 83, C1: 56, ratio: 1.5,
      sides1: { AB: "y cm", BC: "8 cm", CA: "12 cm" }, sides2: { AB: "15 cm", BC: "12 cm", CA: "x cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "28", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>먼저 두 값이 모두 있는 대응변으로 닮음비를 정해요.<br>① BC:EF=8:12=2:3<br>② AB:DE=2:3이므로 y:15=2:3, y=10<br>③ CA:FD=2:3이므로 12:x=2:3, x=18<br>④ x+y=18+10=<b>28</b> ✓<span class='xh'>계산 실수 격파</span>y는 작은 삼각형의 변이라 15보다 작아야 하고, x는 큰 삼각형의 변이라 12보다 커야 해요. 방향이 헷갈리면 이 크기 감각으로 바로 잡아낼 수 있어요. y=22.5(15×3÷2)나 x=8(12×2÷3)처럼 비를 거꾸로 적용한 값이 대표적인 실수죠. 두 미지수 문제는 한 변씩 차분히, 매번 닮음비 2:3을 다시 확인하며 푸는 것이 안전해요. 검산: 10:15=12:18=2:3!",
    core: "값이 둘 다 있는 변으로 닮음비부터, 그다음 한 변씩!",
  },

  // ─ L2 여러 가지 닮은 도형 ─
  {
    // [슬롯 20] 검산: 반지름 5:7 → 높이 10×7/5=14. dims2=dims1×1.4 실비.
    id: "m2u5e020", lessonId: "m2u5l2", type: "num",
    prompt: `그림의 두 원기둥 (가), (나)는 서로 닮은 도형이에요. (나)의 높이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamSolidPairFig({
      kind: "cyl", dims1: [5, 10], dims2: [7, 14],
      labels1: ["5 cm", "10 cm"], labels2: ["7 cm", "x cm"],
    }),
    answer: "14", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮은 입체도형에서도 대응하는 길이의 비는 모두 같아요.<br>① 닮음비: 밑면 반지름의 비 5:7<br>② 높이의 비도 5:7이므로 10:x=5:7<br>③ 5x=70, x=<b>14</b> ✓<span class='xh'>계산 실수 격파</span>10×5÷7로 계산하면 (나)가 (가)보다 작아져 버려요. 반지름이 5에서 7로 커졌으니 높이도 10보다 커져야 자연스럽죠. 또 반지름과 높이를 섞어 5:10 같은 비를 만들면 안 돼요. 닮음비는 반드시 같은 종류의 길이끼리(반지름은 반지름, 높이는 높이) 재야 해요. 검산: 5:7=10:14가 성립하니 맞아요.",
    core: "입체의 닮음비도 대응 길이끼리, 반지름은 반지름과!",
  },
  {
    // [슬롯 22] 검산: 중심각 72° 동일 + 닮음비 2:3, r=6 → x=9. 실비 6:9.
    id: "m2u5e022", lessonId: "m2u5l2", type: "num",
    prompt: `그림의 두 부채꼴은 중심각의 크기가 72°로 같아서 서로 닮은 도형이에요. 두 부채꼴의 닮음비가 2:3일 때, 큰 부채꼴의 반지름 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamSectorPairFig({ deg1: 72, deg2: 72, r1: 6, r2: 9, labels1: { r: "6 cm", deg: "72°" }, labels2: { r: "x cm", deg: "72°" } }),
    answer: "9", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중심각이 같은 두 부채꼴은 모양이 같아서 닮음이고, 닮음비는 반지름의 비예요.<br>① 닮음비 2:3 = 반지름의 비<br>② 6:x=2:3<br>③ 2x=18, x=<b>9</b> ✓<span class='xh'>이렇게 확인해요</span>부채꼴은 반지름이 같아도 중심각이 다르면 모양이 달라서 닮음이 아니에요. 그래서 문제마다 중심각이 같다는 조건을 먼저 확인해야 해요. 6×2÷3=4로 계산했다면 큰 부채꼴을 구하는데 답이 6보다 작아진 것이니 비의 방향이 뒤집힌 거예요. 닮음비 2:3에서 앞의 2가 작은 쪽(반지름 6 cm)임을 짚고 시작하면 안전해요.",
    core: "부채꼴 닮음은 중심각 같을 때, 닮음비는 반지름 비!",
  },
  {
    // [슬롯 23] 검산: 바깥 48:36=4:3, 안 (48−12):(36−12)=36:24=3:2. 서로 다르니 비닮음 발견.
    id: "m2u5e023", lessonId: "m2u5l2", type: "mcq",
    prompt: "그림은 폭이 6 cm로 일정한 액자예요. 바깥 직사각형과 안쪽 직사각형의 (가로):(세로)를 각각 가장 간단한 자연수의 비로 차례대로 나타낸 것은?",
    figure: m2ExamFrameFig({ outW: 48, outH: 36, pad: 6, labels: { outW: "48 cm", outH: "36 cm", pad: "6 cm" } }),
    options: ["4:3과 3:2", "4:3과 4:3", "3:2와 3:2", "8:6과 6:4", "4:3과 2:3"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>안쪽 직사각형은 양쪽에서 폭 6 cm씩 줄어들어요.<br>① 바깥: 48:36=<b>4:3</b><br>② 안쪽 가로: 48−6×2=36, 세로: 36−6×2=24<br>③ 안쪽: 36:24=<b>3:2</b> ✓<br>두 비가 다르니 바깥과 안쪽 직사각형은 서로 닮음이 아니에요!<span class='xh'>오답 하나씩 격파</span>4:3과 4:3을 골랐다면 테두리가 일정하니 모양도 그대로일 거라고 넘겨짚은 거예요. 같은 길이를 빼면 비는 달라져요. 8:6과 6:4는 줄이기 전의 비라 조건에 맞지 않고, 2:3은 가로세로를 뒤집어 잰 값이에요. 일정한 폭의 액자나 사진 테두리는 항상 닮음처럼 보이는 대표 함정이에요.",
    core: "같은 폭을 빼면 비가 변한다, 액자 안팎은 닮음이 아님!",
  },

  // ─ L3 넓이의 비와 부피의 비 ─
  {
    // [슬롯 37] 검산: 닮음비 8:14=4:7 → 넓이비 16:49.
    id: "m2u5e037", lessonId: "m2u5l3", type: "mcq",
    prompt: "그림의 두 사각형은 서로 닮은 도형이에요. 두 사각형의 넓이의 비를 가장 간단한 자연수의 비로 나타내면?",
    figure: m2ExamSimQuadPairFig({
      angles: [100, 80, 95, 85], sides: [8, 7], ratio: 1.75,
      sidesL: ["8 cm", null, null, null], sidesR: ["14 cm", null, null, null],
    }),
    options: ["16:49", "4:7", "8:14", "64:343", "4:49"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮은 평면도형에서 넓이의 비는 닮음비의 제곱이에요.<br>① 닮음비: 8:14=4:7<br>② 넓이의 비: 4²:7²=<b>16:49</b> ✓<span class='xh'>오답 하나씩 격파</span>4:7은 닮음비 그대로예요. 길이가 4:7이면 넓이는 가로도 세로도 함께 늘어나 제곱으로 벌어져요. 8:14는 줄이기 전의 닮음비이고, 64:343은 세제곱한 값인데 세제곱은 입체의 부피에서 쓰는 비예요. 4:49는 한쪽만 제곱한 값이죠. 길이는 1제곱, 넓이는 2제곱, 부피는 3제곱이라는 차원의 사다리를 기억하면 헷갈리지 않아요.",
    core: "넓이의 비 = 닮음비의 제곱!",
  },
  {
    // [슬롯 40] 검산: 닮음비 10:14=5:7 → 넓이비 25:49, 75×49/25=147.
    id: "m2u5e040", lessonId: "m2u5l3", type: "num",
    prompt: `그림의 두 사각형은 서로 닮은 도형이고, 작은 사각형의 넓이는 75 cm²예요. 큰 사각형의 넓이는 몇 cm²인지 구하세요.`,
    figure: m2ExamSimQuadPairFig({
      angles: [92, 88, 96, 84], sides: [10, 9], ratio: 1.4,
      sidesL: ["10 cm", null, null, null], sidesR: ["14 cm", null, null, null],
    }),
    answer: "147", numKind: "int", unitLabel: "cm²", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮음비부터 정하고 넓이의 비로 넘어가요.<br>① 닮음비: 10:14=5:7<br>② 넓이의 비: 25:49<br>③ 75:(넓이)=25:49, 넓이=75×49÷25=<b>147</b> ✓<span class='xh'>계산 실수 격파</span>75×7÷5=105로 계산했다면 넓이에 닮음비를 그대로 쓴 거예요. 넓이는 반드시 제곱한 비 25:49로 계산해야 해요. 계산 순서도 요령이 있어요. 75÷25=3을 먼저 구하면 3×49=147로 훨씬 간단해지죠. 검산: 147÷75=1.96=(7/5)², 즉 닮음비의 제곱과 일치하니 맞아요.",
    core: "넓이 역산은 제곱비로, 나누기 먼저 하면 계산이 가벼워요!",
  },
  {
    // [슬롯 42] 검산: 부피비 125:216=5³:6³ → 닮음비 5:6 → 10×6/5=12.
    id: "m2u5e042", lessonId: "m2u5l3", type: "num",
    prompt: `그림의 두 구는 서로 닮은 도형이고 부피의 비가 125:216이에요. 작은 구의 반지름이 10 cm일 때, 큰 구의 반지름 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamSolidPairFig({
      kind: "sphere", dims1: [10], dims2: [12],
      labels1: ["10 cm"], labels2: ["x cm"],
    }),
    answer: "12", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>부피의 비에서 거꾸로 닮음비를 찾아요.<br>① 부피의 비 125:216에서 125=5×5×5, 216=6×6×6<br>② 그래서 닮음비는 5:6<br>③ 반지름도 5:6이므로 10:x=5:6, x=<b>12</b> ✓<span class='xh'>계산 실수 격파</span>부피의 비를 그대로 반지름에 써서 10:x=125:216으로 두면 x가 216이 되는 엉뚱한 답이 나와요. 부피는 닮음비를 세 번 곱한 값이니, 반지름으로 돌아가려면 세제곱해서 그 수가 되는 수(125는 5, 216은 6)를 찾아야 해요. 이렇게 차원을 한 단계씩 되돌리는 감각이 이 단원의 핵심이에요. 검산: 10:12=5:6, 5³:6³=125:216 일치!",
    core: "부피비에서 닮음비로 돌아가려면 세제곱을 풀어라!",
  },
  {
    // [슬롯 49] 검산: 높이 3등분 절단, 위부터 닮음비 1:2:3, 누적 부피 1:8:27 → 조각 1:7:19.
    id: "m2u5e049", lessonId: "m2u5l3", type: "mcq",
    prompt: "그림처럼 원뿔을 높이를 3등분하는 지점에서 밑면에 평행한 두 평면으로 잘랐어요. 위에서부터 세 조각 ㉮, ㉯, ㉰의 부피의 비는?",
    figure: m2ExamConeCutFig({ cuts: 3, names: ["㉮", "㉯", "㉰"] }),
    options: ["1:7:19", "1:2:3", "1:8:27", "1:4:9", "3:5:7"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>꼭짓점부터 재면 세 원뿔이 겹쳐 있는 그림이에요.<br>① 위 원뿔들의 닮음비: 1:2:3<br>② 그 부피의 비: 1³:2³:3³=1:8:27<br>③ ㉮=1, ㉯=8−1=7, ㉰=27−8=19<br>④ 따라서 <b>1:7:19</b> ✓<span class='xh'>오답 하나씩 격파</span>1:8:27은 겹쳐 있는 세 원뿔 전체의 부피 비예요. ㉯와 ㉰는 조각이니 아래 원뿔에서 위 원뿔을 빼야 해요. 1:2:3은 닮음비를 그대로 쓴 값, 1:4:9는 제곱해서 넓이의 비에서 멈춘 값이에요. 3:5:7은 단면 넓이 차이만 어림한 값이죠. 잘린 조각 문제는 언제나 누적에서 누적을 빼는 두 단계로 풀어요.",
    core: "조각의 부피 = 누적 부피의 차, 1:8:27에서 빼라!",
  },

  // ─ L4 삼각형의 닮음 조건 ─
  {
    // [슬롯 55] 검산: 8:12=10:15=14:21=2:3, 세 쌍 비 일치 → SSS 닮음.
    //  실각: 변 (8,14,10)=(4,7,5)×2 → A(대변 14)=101.5°, B(대변 10)=44.4°, C(대변 8)=34.1°. ratio 1.5.
    id: "m2u5e055", lessonId: "m2u5l4", type: "mcq",
    prompt: "그림의 두 삼각형이 서로 닮은 도형임을 보이는 데 이용되는 닮음 조건은?",
    figure: m2ExamTriPairFig({
      B1: 44, C1: 34, ratio: 1.5,
      sides1: { AB: "8 cm", BC: "14 cm", CA: "10 cm" }, sides2: { AB: "12 cm", BC: "21 cm", CA: "15 cm" },
      names2: ["D", "E", "F"],
    }),
    options: ["SSS 닮음", "SAS 닮음", "AA 닮음", "SSS 합동", "닮음이 아니다"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>주어진 정보가 무엇인지부터 확인해요. 각은 없고 세 쌍의 변 길이만 있어요.<br>① 8:12=2:3<br>② 10:15=2:3<br>③ 14:21=2:3<br>세 쌍의 대응변의 길이의 비가 모두 같으니 <b>SSS 닮음</b>이에요 ✓<span class='xh'>오답 하나씩 격파</span>SAS 닮음은 두 쌍의 변의 비와 그 끼인각이 필요한데 이 그림엔 각 정보가 없어요. AA 닮음도 두 쌍의 각이 필요하죠. SSS 합동은 세 변의 길이가 각각 같아야 하는데 여기는 길이가 1.5배씩 차이 나니 합동이 아니라 닮음이에요. 어떤 정보가 주어졌는지 보고 조건의 이름을 고르는 것이 이 유형의 전부예요.",
    core: "변 세 쌍의 비가 같다 = SSS 닮음, 정보 종류로 조건 판별!",
  },
  {
    // [슬롯 58] 검산: AB:DE=9:18=1:2, BC:EF=8:16=1:2, 끼인각 ∠B=∠E(같음 표시 ●) → SAS. x=12×2=24.
    //  실각: 변 (9,8,12): AB=9(대각 C≈49°), BC=8(대각 A≈90°), CA=12(대각 B≈42°), 꼭지각 A가 90°라 좌우 안 잘림.
    id: "m2u5e058", lessonId: "m2u5l4", type: "num",
    prompt: `그림의 두 삼각형에서 ∠B=∠E일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 42, C1: 49, ratio: 2,
      labels1: { B: "●" }, labels2: { B: "●" },
      sides1: { AB: "9 cm", BC: "8 cm", CA: "12 cm" }, sides2: { AB: "18 cm", BC: "16 cm", CA: "x cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "24", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>먼저 두 삼각형이 닮음인지 확인해요.<br>① AB:DE=9:18=1:2, BC:EF=8:16=1:2<br>② 그 끼인각 ∠B=∠E(그림의 같음 표시)이므로 SAS 닮음<br>③ CA:FD=1:2이므로 12:x=1:2, x=<b>24</b> ✓<span class='xh'>계산 실수 격파</span>비례식만 세워도 답은 나오지만, 시험에서는 두 변의 비가 정말 같은지(9:18과 8:16), 같다고 표시된 각이 정말 그 두 변 사이의 끼인각인지 확인하는 단계가 근거예요. 12÷2=6으로 계산했다면 방향이 뒤집힌 거예요. x는 큰 삼각형의 변이니 12보다 커야 해요. 검산: 9:18=8:16=12:24=1:2로 세 쌍이 모두 일치!",
    core: "두 쌍 비+끼인각 확인(SAS), 그다음 비례식!",
  },
  {
    // [슬롯 60] SSA 함정: 비 2:5 두 쌍 + 끼인각이 아닌 ∠A=∠D → 닮음 단정 불가.
    //  그림은 각 라벨과 실각이 일치하도록 A1=A2=44°(B1+C1=B2+C2=136), 모양은 다르게.
    id: "m2u5e060", lessonId: "m2u5l4", type: "mcq",
    prompt: `그림의 두 삼각형에서 ${gsym("AB", "seg")}:${gsym("DE", "seg")}=${gsym("BC", "seg")}:${gsym("EF", "seg")}=2:5이고 ∠A=∠D=44°예요. 두 삼각형에 대한 설명으로 옳은 것은?`,
    figure: m2ExamTriPairFig({
      B1: 70, C1: 66, B2: 58, C2: 78,
      labels1: { A: "44°" }, labels2: { A: "44°" },
      names2: ["D", "E", "F"],
    }),
    options: [
      "닮음이라고 단정할 수 없다",
      "SAS 닮음이다",
      "SSS 닮음이다",
      "AA 닮음이다",
      "닮음비 2:5인 닮음이다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>SAS 닮음이 되려면 두 쌍의 변의 비가 같고, 그 <b>끼인각</b>이 같아야 해요. 여기서 비가 주어진 변은 AB와 BC인데, 이 두 변 사이에 끼인 각은 ∠B예요. 그런데 같다고 한 각은 ∠A, 즉 끼인각이 아니에요. 그래서 <b>닮음이라고 단정할 수 없어요</b> ✓ 실제로 그림의 두 삼각형은 나머지 각이 서로 달라요.<span class='xh'>오답 하나씩 격파</span>SAS를 골랐다면 각의 위치를 확인하지 않은 거예요. 변 두 쌍과 각 하나가 보이면 반사적으로 SAS로 보이지만, 각이 두 변 사이에 있어야만 성립해요. SSS는 세 쌍의 변이, AA는 두 쌍의 각이 필요하니 조건 부족이에요. 조건이 어긋난 이상 닮음비 2:5도 말할 수 없어요.",
    core: "SAS의 S와 S 사이엔 반드시 끼인각, 아니면 단정 금지!",
  },
  {
    // [슬롯 65] 검산: ∠A 공통+∠ADE=∠ACB → AA. 대응 A↔A, D↔C, E↔B → △ADE∽△ACB.
    id: "m2u5e065", lessonId: "m2u5l4", type: "mcq",
    prompt: `그림에서 ∠ADE=∠ACB일 때, ${gsym("ADE", "tri")}와 닮은 삼각형을 기호로 바르게 나타낸 것은?`,
    figure: m2ExamTriSplitFig({
      B: 64, C: 46, t: 0.56, mode: "swapped",
      marks: [{ at: "ADE", label: "●" }, { at: "ACB", label: "●" }],
    }),
    options: [
      `${gsym("ACB", "tri")}`,
      `${gsym("ABC", "tri")}`,
      `${gsym("BCA", "tri")}`,
      `${gsym("CBA", "tri")}`,
      "닮은 삼각형이 없다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>닮음 기호는 대응하는 꼭짓점 순서대로 써요.<br>① ∠A는 두 삼각형의 공통각<br>② ∠ADE=∠ACB(주어진 조건)<br>③ 두 쌍의 각이 같으니 AA 닮음<br>④ 대응을 짚으면 A↔A, D↔C, E↔B이므로 △ADE∽<b>△ACB</b> ✓<span class='xh'>오답 하나씩 격파</span>△ABC를 골랐다면 큰 삼각형의 이름을 늘 쓰던 순서로 쓴 거예요. 닮음 기호에서는 이름 순서가 곧 대응 관계라서, ∠D와 짝인 ∠C가 두 번째 자리에 와야 해요. △BCA나 △CBA도 대응이 어긋나요. 이 그림은 D와 C가 엇갈려 대응하는 뒤집힌 닮음이라, 평행선 문제처럼 D↔B로 넘겨짚으면 틀려요. 같은 각끼리 짝을 지어 순서를 맞추는 것이 전부예요.",
    core: "닮음 기호의 순서 = 같은 각끼리의 대응 순서!",
  },

  // ─ L5 닮은 삼각형 찾기: 겹친 삼각형 ─
  {
    // [슬롯 75] 검산: OA:OC=10:15=2:3, OB:OD=14:21=2:3 → AB∥DC, x=21. (구 e099의 단위 병기 교정판)
    id: "m2u5e075", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 두 선분 AC, BD가 점 O에서 만나요. ${gsym("OD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamXCrossFig({
      rTop: [10, 15], rSide: [14, 21],
      labels: { OA: "10 cm", OC: "15 cm", OB: "14 cm", OD: "x cm" },
      paraMarks: true,
    }),
    answer: "21", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>AB∥DC이므로 엇각이 같고, 맞꼭지각도 같아서 △OAB∽△OCD(AA)예요.<br>① OA:OC=10:15=2:3<br>② OB:OD도 2:3이므로 14:x=2:3<br>③ 2x=42, x=<b>21</b> ✓<span class='xh'>계산 실수 격파</span>14×2÷3으로 계산해 약 9.3을 얻었다면 비의 방향이 뒤집힌 거예요. O에서 D까지는 O에서 B까지보다 먼 쪽(큰 삼각형 쪽)이니 14보다 커야 해요. 또 OA:OB처럼 같은 삼각형 안의 두 변으로 비를 만들면 안 돼요. 비는 반드시 대응변끼리, 즉 O를 사이에 둔 같은 직선 위 짝(OA와 OC, OB와 OD)으로 세워요. 검산: 10:15=14:21=2:3!",
    core: "X자 겹침은 O 건너편끼리 대응, 엇각+맞꼭지각으로 AA!",
  },
  {
    // [슬롯 79] 검산: AD²=BD·DC=16×25=400 → AD=20. 완전제곱 쌍 16·25.
    id: "m2u5e079", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ∠BAC=90°이고 ${gsym("AD", "seg")}⊥${gsym("BC", "seg")}예요. ${gsym("AD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamRightAltFig({
      bd: 16, dc: 25, rightAtA: true,
      labels: { BD: "16 cm", DC: "25 cm", AD: "x cm" },
    }),
    answer: "20", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>직각삼각형의 빗변에 수선을 내리면 작은 두 삼각형이 원래 삼각형과 모두 닮음이에요. 그중 △DBA∽△DAC에서 DB:DA=DA:DC가 나와요.<br>① AD²=BD×DC=16×25=400<br>② 제곱해서 400이 되는 양수는 20<br>③ x=<b>20</b> ✓<span class='xh'>계산 실수 격파</span>16+25나 25−16처럼 더하거나 빼는 건 이 구도와 관계없는 계산이에요. 수선의 발 D가 빗변을 나눈 두 조각의 곱이 수선의 제곱과 같다는 것이 핵심 관계예요. 근거가 궁금하면 △DBA와 △DAC에서 ∠DBA=∠DAC(둘 다 90°−∠C)를 확인해 보세요. 검산은 20×20=400=16×25로 곱이 정확히 일치해요!",
    core: "빗변의 수선: AD² = BD×DC(두 조각의 곱)!",
  },
  {
    // [슬롯 82] 그림 진술 판별(수치 없음). 참: △ABD∽△CAD(A↔C,B↔A,D↔D), AD²=BD·DC, AB²=BD·BC.
    id: "m2u5e082", lessonId: "m2u5l5", type: "multi",
    prompt: `그림에서 ∠BAC=90°이고 ${gsym("AD", "seg")}⊥${gsym("BC", "seg")}예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamRightAltFig({ bd: 9, dc: 16 }),
    options: [
      `${gsym("ABD", "tri")}∽${gsym("CAD", "tri")}`,
      `${gsym("AD", "seg")}²=${gsym("BD", "seg")}×${gsym("DC", "seg")}`,
      `${gsym("AB", "seg")}²=${gsym("BD", "seg")}×${gsym("BC", "seg")}`,
      `${gsym("AD", "seg")}²=${gsym("AB", "seg")}×${gsym("AC", "seg")}`,
      `${gsym("ABC", "tri")}과 ${gsym("DBA", "tri")}는 합동이다`,
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>수선 하나가 만드는 세 닮음 삼각형에서 나오는 관계들이에요.<br>① △ABD∽△CAD: ∠ADB=∠CDA=90°, ∠BAD=∠BCA(둘 다 90°−∠B)라 AA 닮음 ✓<br>② AD²=BD×DC: ①의 대응변 비 BD:AD=AD:DC에서 ✓<br>③ AB²=BD×BC: △DBA∽△ABC의 비에서 ✓<span class='xh'>오답 하나씩 격파</span>AD²=AB×AC는 그럴듯해 보이지만 성립하지 않아요. 옳은 관계는 AD×BC=AB×AC(넓이를 두 방법으로 계산)예요. 제곱 관계의 짝은 언제나 빗변 위의 두 조각이에요. △ABC와 △DBA는 크기가 다르니 합동이 아니라 닮음이죠. 세 관계식 모두 닮음의 대응변 비에서 나온다는 뿌리를 기억하면 헷갈리지 않아요.",
    core: "수선 구도의 제곱 관계는 전부 닮음의 대응변 비!",
  },
  {
    // [슬롯 88] 검산: ∠ADE=∠ACB → △ADE∽△ACB(AA), AD·AB=AE·AC. 4×12=6×AC → AC=8. t=4/12.
    //  실비: swapped의 s=t·(AB/AC)²에서 AE/AC 라벨 비 6/8과 일치하려면 AB/AC=1.5 → sinC/sinB=1.5(B=33°, C=55°).
    id: "m2u5e088", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ∠ADE=∠ACB이고 ${gsym("AD", "seg")}=4 cm, ${gsym("DB", "seg")}=8 cm, ${gsym("AE", "seg")}=6 cm예요. ${gsym("AC", "seg")}의 길이는?`,
    figure: m2ExamTriSplitFig({
      B: 33, C: 55, t: 1 / 3, mode: "swapped",
      labels: { AD: "4 cm", DB: "8 cm", AE: "6 cm" },
      marks: [{ at: "ADE", label: "●" }, { at: "ACB", label: "●" }],
    }),
    options: ["8 cm", "9 cm", "16 cm", "12 cm", "7 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>∠A 공통, ∠ADE=∠ACB이므로 △ADE∽△ACB(AA)예요. 대응이 D↔C, E↔B로 엇갈리는 것에 주의!<br>① 대응변 비: AD:AC=AE:AB<br>② AB=AD+DB=4+8=12<br>③ 4:AC=6:12이므로 6×AC=48<br>④ AC=<b>8 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>9 cm는 DE∥BC인 평행 문제로 착각해 AD:DB=AE:EC 꼴로 세운 값이에요. 이 그림은 평행이 아니라 각이 엇갈려 같은 뒤집힌 닮음이라 대응 상대가 달라요. 16 cm는 비례식을 4:6=12:AC로 잘못 짝지은 값이고, 12 cm는 AB를 그대로 옮긴 값이에요. 곱으로 정리한 AD×AB=AE×AC를 쓰면 대응 실수가 줄어요. 검산: 4×12=48=6×8!",
    core: "각이 엇갈려 같으면 뒤집힌 닮음, AD×AB=AE×AC!",
  },

  // ─ L6 삼각형과 평행선 ─
  {
    // [슬롯 92] 검산: DE∥BC, AD:DB=9:6=3:2, AE:EC=12:x=3:2 → x=8. t=9/15=0.6.
    id: "m2u5e092", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}일 때, ${gsym("EC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 63, C: 49, t: 0.6, mode: "para", paraMarks: true,
      labels: { AD: "9 cm", DB: "6 cm", AE: "12 cm", EC: "x cm" },
    }),
    answer: "8", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>DE∥BC이면 삼각형의 두 변이 같은 비로 잘려요.<br>① AD:DB=9:6=3:2<br>② AE:EC도 3:2이므로 12:x=3:2<br>③ 3x=24, x=<b>8</b> ✓<span class='xh'>계산 실수 격파</span>12:x=9:6에서 그대로 풀어도 x=8로 같은 답이 나와요. 조심할 것은 비의 짝이에요. AD:DB(위 조각:아래 조각)에는 AE:EC(위 조각:아래 조각)가 짝이고, AD:AB(위 조각:전체)에는 AE:AC(위 조각:전체)가 짝이에요. 위 조각과 전체를 섞어 9:15=12:x처럼 세우면 x=20이라는 엉뚱한 값이 나오죠. 어느 쪽 짝인지 정하고 시작하는 것이 전부예요. 검산: 9:6=12:8=3:2!",
    core: "평행선이 자르는 비는 조각:조각끼리, 조각:전체끼리!",
  },
  {
    // [슬롯 96] 검산: 정답 세트 4:6=6:9=2:3 유일 일치. 나머지 반례 확인 완료(3:5≠5:3, 3:2≠9:7, 1:1≠6:7, 4:1≠2:1).
    id: "m2u5e096", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림처럼 ${gsym("ABC", "tri")}의 두 변 AB, AC 위에 점 D, E가 있어요. 다음 중 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}인 것은?`,
    figure: m2ExamTriSplitFig({ B: 60, C: 47, t: 0.52, s: 0.45, mode: "free" }),
    options: [
      `${gsym("AD", "seg")}=4 cm, ${gsym("DB", "seg")}=6 cm, ${gsym("AE", "seg")}=6 cm, ${gsym("EC", "seg")}=9 cm`,
      `${gsym("AD", "seg")}=3 cm, ${gsym("DB", "seg")}=5 cm, ${gsym("AE", "seg")}=5 cm, ${gsym("EC", "seg")}=3 cm`,
      `${gsym("AD", "seg")}=6 cm, ${gsym("DB", "seg")}=4 cm, ${gsym("AE", "seg")}=9 cm, ${gsym("EC", "seg")}=7 cm`,
      `${gsym("AD", "seg")}=5 cm, ${gsym("DB", "seg")}=5 cm, ${gsym("AE", "seg")}=6 cm, ${gsym("EC", "seg")}=7 cm`,
      `${gsym("AD", "seg")}=8 cm, ${gsym("DB", "seg")}=2 cm, ${gsym("AE", "seg")}=8 cm, ${gsym("EC", "seg")}=4 cm`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>DE∥BC가 되려면 AD:DB=AE:EC여야 해요.<br>① AD:DB=4:6=2:3<br>② AE:EC=6:9=2:3<br>③ 두 비가 같으니 <b>평행이에요</b> ✓<span class='xh'>오답 하나씩 격파</span>AD=3, DB=5, AE=5, EC=3인 세트는 3:5와 5:3으로, 숫자가 뒤집혀 있어 언뜻 짝처럼 보이는 함정이에요. 6:4=3:2와 9:7, 5:5=1:1과 6:7, 8:2=4:1과 8:4=2:1도 전부 비가 달라요. 수가 같은 게 아니라 비가 같아야 평행이라는 것, 그리고 반드시 같은 위치의 조각끼리(위:아래) 비교해야 한다는 것이 판정의 기준이에요.",
    core: "평행 판정 = AD:DB와 AE:EC의 비 일치 확인!",
  },
  {
    // [슬롯 102] 검산: OA:OC=48:16=3:1, OB:OD=42:14=3:1 → AB∥DC 세팅, AB=30×3=90.
    id: "m2u5e102", lessonId: "m2u5l6", type: "mcq",
    prompt: `호수의 폭 ${gsym("AB", "seg")}를 직접 잴 수 없어서, 그림처럼 점 O를 잡고 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}가 되도록 두 점 C, D를 정했어요. ${gsym("DC", "seg")}=30 m일 때, 호수의 폭 ${gsym("AB", "seg")}는?`,
    figure: m2ExamXCrossFig({
      rTop: [48, 16], rSide: [54, 18],
      labels: { OA: "48 m", OC: "16 m", DC: "30 m", AB: "x m" },
      paraMarks: true,
    }),
    options: ["90 m", "10 m", "60 m", "96 m", "78 m"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>직접 잴 수 없는 길이를 닮음으로 재는 대표적인 방법이에요. AB∥DC이므로 엇각과 맞꼭지각으로 △OAB∽△OCD(AA)예요.<br>① 닮음비: OA:OC=48:16=3:1<br>② AB:DC=3:1이므로 AB=30×3=<b>90 m</b> ✓<span class='xh'>오답 하나씩 격파</span>10 m는 30÷3으로, 큰 삼각형 쪽을 구하는데 오히려 줄인 값이에요. 호수 쪽(OA=48)이 측량 쪽(OC=16)의 3배이니 폭도 3배가 돼야 해요. 60 m는 닮음비를 2:1로 잘못 읽은 값, 96 m는 48×2처럼 엉뚱한 곱을 만든 값, 78 m는 48+30으로 더해 버린 값이에요. 실생활 측량 문제도 결국 X자 닮음의 비례식 하나로 끝나요.",
    core: "잴 수 없는 폭은 X자 닮음으로, 비는 O 건너편끼리!",
  },

  // ─ L7 삼각형의 중점연결정리 ─
  {
    // [슬롯 110] 검산: M, N이 중점이면 MN=½BC=46/2=23.
    id: "m2u5e110", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("BC", "seg")}=46 cm일 때, ${gsym("MN", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 62, C: 48, ticks: true, paraMarks: true,
      labels: { BC: "46 cm", MN: "x cm" },
    }),
    answer: "23", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 두 변의 중점을 이은 선분은 나머지 변과 평행하고, 길이는 그 절반이에요(중점연결정리).<br>① M, N이 중점이라는 표시(같은 눈금)를 확인<br>② MN=½×BC=½×46=<b>23</b> ✓<span class='xh'>계산 실수 격파</span>92라고 답했다면 절반이 아니라 2배를 한 거예요. 중점을 이은 선분 MN은 밑변 BC보다 짧은 쪽이에요. 그림에서도 MN이 BC보다 위에 있는 짧은 선분이니, 계산 결과가 그림의 크기 감각과 맞는지 확인하면 방향 실수를 바로 잡을 수 있어요. 이 정리는 △AMN∽△ABC(닮음비 1:2, SAS)에서 나온 것이라, 닮음비 1:2만 기억해도 절반이 바로 보여요.",
    core: "중점끼리 이으면 평행+절반, 닮음비 1:2!",
  },
  {
    // [슬롯 113] 검산: 세 변 9·15·20(둘레 44) → 중점삼각형 각 변은 절반, 둘레 22.
    //  실각: 변 AB=9(대각 C)·AC=15(대각 B)·BC=20(대각 A) → A≈110°, B≈45°, C≈25°.
    id: "m2u5e113", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N, D는 ${gsym("ABC", "tri")} 세 변의 중점이에요. ${gsym("MND", "tri")}의 둘레는?`,
    figure: m2ExamMidsegFig({
      B: 45, C: 25, mode: "three", ticks: true,
      labels: { AB: "9 cm", AC: "15 cm", BC: "20 cm" },
    }),
    options: ["22 cm", "44 cm", "11 cm", "33 cm", "88 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>세 중점을 이으면 중점연결정리가 세 번 적용돼요.<br>① 각 변이 마주 보는 변의 절반: 9÷2, 15÷2, 20÷2<br>② 중점삼각형의 둘레=(9+15+20)÷2=44÷2=<b>22 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>44 cm는 원래 삼각형의 둘레를 그대로 답한 값이에요. 11 cm는 절반을 두 번 해 ¼로 줄인 값인데, 절반이 되는 것은 한 번뿐이죠. 33 cm는 둘레의 ¾, 88 cm는 반대로 2배를 한 값이에요. 변마다 따로 4.5, 7.5, 10을 구해 더해도 되지만, 세 변이 전부 절반이 되니 둘레도 통째로 절반이라는 사실을 쓰면 한 번의 나눗셈으로 끝나요.",
    core: "중점삼각형의 둘레 = 원래 둘레의 절반!",
  },
  {
    // [슬롯 115] 검산: 바리뇽, PQ=½AC=44/2=22.
    id: "m2u5e115", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. 대각선 ${gsym("AC", "seg")}=44 cm일 때, ${gsym("PQ", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidQuadFig({
      preset: 0, diag: "AC", ticks: true, shade: true,
      labels: { AC: "44 cm", PQ: "x cm" },
    }),
    answer: "22", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>사각형에 대각선 AC를 그으면 두 삼각형으로 나뉘어요.<br>① △ABC에서 P, Q는 두 변의 중점이므로 중점연결정리에 따라 PQ∥AC, PQ=½AC<br>② x=44÷2=<b>22</b> ✓<span class='xh'>이렇게 확인해요</span>사각형 문제처럼 보여도 대각선 하나를 그으면 삼각형의 중점연결정리 문제가 돼요. 반대쪽 △ACD에서도 SR=½AC=22가 되니 PQ=SR이고, 같은 방법으로 대각선 BD를 그으면 QR=PS=½BD예요. 두 쌍의 대변이 각각 같아지니 네 중점을 이은 사각형 PQRS는 언제나 평행사변형이 되죠. 44×2=88로 답했다면 절반과 2배의 방향이 뒤집힌 것이니 그림의 크기 감각으로 확인하세요.",
    core: "네 변의 중점 사각형은 대각선의 절반 변, 항상 평행사변형!",
  },

  // ─ L8 평행선 사이의 선분의 길이의 비 ─
  {
    // [슬롯 128] 검산: 9:15=3:5, x:10=9:15 → x=6. gaps 3:5 실비 렌더와 라벨 비 일치.
    id: "m2u5e128", lessonId: "m2u5l8", type: "num",
    prompt: `그림에서 세 직선 l, m, n이 서로 평행할 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m2ExamParaLinesFig({
      gaps: [3, 5], names: ["l", "m", "n"],
      cuts: [
        { x0: 84, x1: 148, labels: ["9 cm", "15 cm"] },
        { x0: 252, x1: 208, labels: ["x cm", "10 cm"] },
      ],
    }),
    answer: "6", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행한 세 직선은 어떤 직선을 그어도 같은 비로 잘라요.<br>① 왼쪽 직선의 비: 9:15=3:5<br>② 오른쪽 직선도 3:5이므로 x:10=3:5<br>③ 5x=30, x=<b>6</b> ✓<span class='xh'>계산 실수 격파</span>x:10=15:9처럼 위아래를 엇갈리게 짝지으면 안 돼요. 왼쪽의 위 구간(9)에는 오른쪽의 위 구간(x)이, 아래(15)에는 아래(10)가 짝이에요. 또 9와 x가 같은 평행선 사이에 있다고 9=x로 착각하는 경우가 있는데, 평행선이 보장하는 것은 길이가 아니라 비가 같다는 사실이에요. 기울기가 다른 직선이라 구간 길이 자체는 얼마든지 달라요. 검산: 6:10=9:15=3:5!",
    core: "평행선 사이는 위:아래 비가 같다, 길이가 아니라 비!",
  },
  {
    // [슬롯 130] 순수 비 예외(라벨 숫자만 허용, 미래엔 07-02 실측 계보). 검산: 18:x=3:5 → x=30.
    id: "m2u5e130", lessonId: "m2u5l8", type: "num",
    prompt: `그림에서 세 직선 l, m, n은 서로 평행하고, 그림의 수는 각 구간의 길이의 비를 나타내요. 한 직선이 위에서부터 3, 5의 비로 잘리고 다른 직선의 위 구간의 길이가 18일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m2ExamParaLinesFig({
      gaps: [3, 5], names: ["l", "m", "n"],
      cuts: [
        { x0: 252, x1: 210, labels: ["3", "5"] },
        { x0: 86, x1: 150, labels: ["18", "x"] },
      ],
    }),
    answer: "30", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>비 3:5는 오른쪽 직선의 위:아래 비율이에요. 평행선 사이에서는 왼쪽 직선도 같은 비로 잘려요.<br>① 18:x=3:5<br>② 3x=90, x=<b>30</b> ✓<span class='xh'>이렇게 확인해요</span>18÷3=6이 비의 한 칸에 해당하니 x=5×6=30으로 곱셈 한 번에 구할 수도 있어요. 3과 5는 실제 길이가 아니라 비율이라는 점을 놓치면 x=5라고 그대로 옮겨 적는 실수가 나와요. 비의 수와 실제 길이의 수를 구분해 읽는 습관이 이 유형의 포인트예요. 검산: 18:30=3:5 일치!",
    core: "비의 수와 실제 길이를 구분, 한 칸의 크기부터!",
  },
  {
    // [슬롯 134] 검산: AE:EB=1:3 → t=¼, EF=AD+(BC−AD)×¼=10+12/4=13.
    id: "m2u5e134", lessonId: "m2u5l8", type: "num",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("EF", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AE", "seg")}:${gsym("EB", "seg")}=1:3이에요. ${gsym("EF", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTrapCutFig({
      top: 10, bot: 22, t: 0.25, paraMarks: true,
      labels: { AD: "10 cm", BC: "22 cm", EF: "x cm" },
    }),
    answer: "13", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대각선 AC를 그어 두 삼각형으로 나눠 풀어요.<br>① △ABC에서 AE:AB=1:4이므로 대각선과 만나는 점까지의 길이는 ½×... 대신 공식화된 두 단계로: EF 중 △ABC 쪽 조각=BC×(1/4)=5.5, △ACD 쪽 조각=AD×(3/4)=7.5<br>② x=5.5+7.5=<b>13</b> ✓<span class='xh'>계산 실수 격파</span>(10+22)÷2=16으로 답하는 것이 이 유형 최대의 함정이에요. 평균은 E가 AB의 중점일 때(1:1)만 통해요. 지금은 1:3이라 EF가 위쪽 변 AD에 훨씬 가까우니 16보다 작은 13이 자연스럽죠. 위에서부터 1:3 지점이면 AD 쪽 비중이 3, BC 쪽 비중이 1이 되는 것(비중이 반대로 붙는 것)도 헷갈리기 쉬운 지점이에요. 검산: 13은 10과 22를 1:3으로 나눈 내분값, 10+(22−10)×¼=13!",
    core: "사다리꼴 평행선은 대각선으로 쪼개 두 번 계산, 평균은 중점일 때만!",
  },

  // ─ L9 삼각형의 무게중심 ─
  {
    // [슬롯 146] 검산: AG=⅔AD=⅔×39=26.
    id: "m2u5e146", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 중선 ${gsym("AD", "seg")}의 길이는 39 cm예요. ${gsym("AG", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    // AD 전체 라벨은 A 근처 쐐기(변 AB와 중선 사이)에 끼어 그림 표기 생략, 문두 수치가 전담(교과서 관행).
    figure: m2ExamCentroidFig({
      B: 60, C: 46, medians: ["AD"], showG: true, ticks: ["BD"],
      segLabels: [{ on: "AG", label: "x cm" }],
    }),
    answer: "26", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 꼭짓점 쪽부터 2:1로 나눠요.<br>① AG:GD=2:1이므로 AG는 중선 AD의 ⅔<br>② x=39×⅔=<b>26</b> ✓<span class='xh'>계산 실수 격파</span>39×⅓=13은 GD, 즉 아래쪽 짧은 조각의 길이예요. 어느 쪽이 2배인지 헷갈리면 무게중심이 꼭짓점보다 밑변에 가깝다는 사실을 떠올리세요. 밑변에 가까우니 꼭짓점 쪽 조각 AG가 긴 쪽(⅔)이에요. 39÷2=19.5로 반을 나누는 것도 2:1을 1:1로 착각한 실수죠. 검산: AG=26, GD=13, 26:13=2:1이고 합이 39로 딱 맞아요.",
    core: "무게중심은 중선을 2:1로, 꼭짓점 쪽이 ⅔!",
  },
  {
    // [슬롯 147] 검산: GD=⅓AD → AD=9×3=27.
    id: "m2u5e147", lessonId: "m2u5l9", type: "num",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이에요. ${gsym("GD", "seg")}=9 cm일 때, 중선 ${gsym("AD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    // AD 전체 라벨은 쐐기 겹침으로 그림 표기 생략, 구할 값 x는 문두가 전담.
    figure: m2ExamCentroidFig({
      B: 56, C: 50, medians: ["AD"], showG: true, ticks: ["BD"],
      segLabels: [{ on: "GD", label: "9 cm" }],
    }),
    answer: "27", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>GD는 무게중심이 나눈 두 조각 중 짧은 쪽(밑변 쪽)이에요.<br>① AG:GD=2:1이므로 GD는 전체 중선의 ⅓<br>② AD=9×3=<b>27</b> ✓<span class='xh'>계산 실수 격파</span>9×2=18은 AG만 구한 값이에요. 문제가 묻는 것은 중선 전체 AD이니 AG+GD=18+9=27까지 가야 해요. 거꾸로 9를 AG로 착각하면 AD를 13.5로 구하는 실수가 나오는데, 그림에서 G 아래쪽의 짧은 조각에 9 cm가 붙어 있는지 위치부터 확인하면 막을 수 있어요. 역산 문제는 주어진 조각이 전체의 몇 분의 몇인지부터 정하는 것이 순서예요.",
    core: "GD는 중선의 ⅓, 역산은 ×3 한 번!",
  },
  {
    // [슬롯 150] 검산: 중선 3개는 넓이를 6등분, △GBD=54/6=9.
    id: "m2u5e150", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고, ${gsym("ABC", "tri")}의 넓이는 54 cm²예요. 색칠한 ${gsym("GBD", "tri")}의 넓이는?`,
    figure: m2ExamCentroidFig({
      B: 58, C: 48, medians: ["AD", "BE", "CF"], showG: true,
      shade: ["GBD"],
    }),
    options: ["9 cm²", "18 cm²", "27 cm²", "6 cm²", "12 cm²"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 중선은 삼각형의 넓이를 똑같은 여섯 조각으로 나눠요.<br>① 중선은 밑변을 절반으로 나누니 넓이도 절반씩<br>② 세 중선이 만나면 같은 넓이 조각이 6개<br>③ △GBD=54÷6=<b>9 cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>18 cm²는 ⅓(두 조각 몫)로, △GBC처럼 조각 두 개를 합친 삼각형의 넓이예요. 27 cm²는 절반이니 중선 하나가 나눈 큰 조각이죠. 색칠된 부분이 여섯 조각 중 몇 개인지부터 세는 것이 순서예요. 6등분의 근거도 간단해요. △GBD와 △GDC는 밑변 BD=DC에 높이가 같아 넓이가 같고, 이런 짝이 세 중선마다 생겨 결국 여섯 조각이 모두 같아져요.",
    core: "세 중선은 넓이 6등분, 조각 개수부터 세라!",
  },
  {
    // [슬롯 158] 검산: ∠A=90°, 빗변 중선 AD=½BC=30(외심=빗변 중점), AG=⅔×30=20. B+C=56+34=90.
    id: "m2u5e158", lessonId: "m2u5l9", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}는 ∠A=90°인 직각삼각형이고, 점 G는 무게중심, 점 D는 ${gsym("BC", "seg")}의 중점이에요. ${gsym("BC", "seg")}=60 cm일 때, ${gsym("AG", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({
      B: 56, C: 34, rightAt: "A", medians: ["AD"], showG: true, ticks: ["BD"],
      segLabels: [{ on: "BC", label: "60 cm" }],
    }),
    options: ["20 cm", "30 cm", "40 cm", "15 cm", "10 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>두 정리를 이어 쓰는 문제예요.<br>① 직각삼각형에서 빗변의 중점 D는 세 꼭짓점에서 같은 거리에 있어요(외심). 그래서 AD=BD=CD=½×60=30<br>② G는 무게중심이니 AG=⅔×AD=⅔×30=<b>20 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>30 cm는 중선 AD에서 멈춘 값이고, 40 cm는 ⅔ 대신 BC에 ⅔를 곱한 값이에요. 15 cm는 AD의 절반, 10 cm는 AD의 ⅓(GD)이죠. 이 문제의 핵심은 직각삼각형의 빗변 중선이 빗변의 절반과 같다는 사실(빗변 중점이 외심)을 먼저 꺼내는 거예요. 직각 표시와 중점 표시가 함께 보이면 이 연결을 의심해 보세요.",
    core: "직각삼각형 빗변 중선=빗변 절반, 그 위에 2:1!",
  },

  // ─ L10 피타고라스 정리 ─
  {
    // [슬롯 164] 검산: 6²+8²=36+64=100=10². 트리플 (6,8,10).
    id: "m2u5e164", lessonId: "m2u5l10", type: "num",
    prompt: `그림의 직각삼각형에서 <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m2ExamRightTriFig({
      a: 6, b: 8,
      labels: { a: "6 cm", b: "8 cm", c: "x cm" },
    }),
    answer: "10", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>직각삼각형에서 직각을 낀 두 변의 제곱의 합은 빗변의 제곱과 같아요.<br>① x²=6²+8²=36+64=100<br>② 제곱해서 100이 되는 양수는 10<br>③ x=<b>10</b> ✓<span class='xh'>계산 실수 격파</span>6+8=14처럼 길이를 그대로 더하면 안 돼요. 피타고라스 정리는 길이가 아니라 제곱끼리의 관계예요. 또 x가 빗변(직각의 맞은편, 가장 긴 변)인지 먼저 확인하세요. 빗변이 아닌 변을 구할 때는 빗변의 제곱에서 빼야 해요. 답을 얻은 뒤에는 10이 6, 8보다 큰지(빗변이 가장 긴 변인지) 확인하면 검산까지 끝나요.",
    core: "직각변 제곱의 합 = 빗변의 제곱!",
  },
  {
    // [슬롯 166] 검산: 400+441=841. ㉠=c² 정사각형 넓이. 트리플 (20,21,29).
    id: "m2u5e166", lessonId: "m2u5l10", type: "mcq",
    prompt: "그림은 직각삼각형의 세 변을 각각 한 변으로 하는 세 정사각형을 그린 거예요. ㉠에 알맞은 넓이는?",
    figure: m2ExamPythaSquaresFig({
      a: 20, b: 21,
      areas: ["400 cm²", "441 cm²", "㉠"],
    }),
    options: ["841 cm²", "41 cm²", "58 cm²", "800 cm²", "881 cm²"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>세 정사각형의 넓이는 각 변의 제곱과 같아요. 피타고라스 정리는 곧 넓이의 관계죠.<br>① 두 직각변 위 정사각형: 400 cm², 441 cm²<br>② 빗변 위 정사각형 ㉠=400+441=<b>841 cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>41 cm²는 넓이에서 변의 길이(20, 21)를 꺼내 더한 값이에요. 넓이 관계를 물었으니 넓이끼리 더해야 해요. 58 cm²는 세 변의 길이 합(20+21+... 이 아니라 어림한 값), 800 cm²와 881 cm²는 더하다 만 값이거나 잘못 더한 값이죠. 이 그림이 바로 피타고라스 정리의 뜻이에요. 두 직각변 위 정사각형을 오려 붙이면 빗변 위 정사각형이 꼭 채워져요.",
    core: "정사각형 넓이의 합 관계가 곧 피타고라스 정리!",
  },
  {
    // [슬롯 169] 검산: 격자 직각변 5칸·2칸 → 기울어진 정사각형 넓이 25+4=29.
    id: "m2u5e169", lessonId: "m2u5l10", type: "mcq",
    prompt: "그림처럼 한 칸의 한 변이 1 cm인 모눈 위에 직각삼각형과, 그 빗변을 한 변으로 하는 기울어진 정사각형을 그렸어요. 정사각형 ㉠의 넓이는?",
    figure: m2ExamGridRightFig({
      cols: 8, rows: 8,
      tri: [[1, 1], [6, 1], [1, 3]],
      hypSquare: true, areaLabel: "㉠",
    }),
    options: ["29 cm²", "21 cm²", "10 cm²", "25 cm²", "49 cm²"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>기울어진 정사각형의 넓이는 칸으로 직접 세기 어려우니 피타고라스 정리를 써요.<br>① 직각삼각형의 두 직각변을 칸으로 세면 5칸, 2칸<br>② 빗변의 제곱=5²+2²=25+4=29<br>③ 정사각형의 넓이는 (한 변)²이므로 <b>29 cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>25 cm²는 긴 직각변만 제곱한 값이고, 10 cm²는 5×2로 두 변을 곱한 값이에요. 21 cm²는 25−4처럼 빼 버린 값이죠. 49 cm²는 5+2=7을 한 변으로 착각해 제곱한 값이에요. 한 변의 길이가 자연수가 아닌 정사각형도 넓이는 이렇게 정확히 구할 수 있다는 것이 이 유형의 재미예요.",
    core: "기울어진 정사각형 넓이 = 빗변의 제곱 = 두 직각변 제곱의 합!",
  },
  {
    // [슬롯 170] 검산: AC²=6²+6²=72, AD²=72+7²=121 → AD=11. dual 조합 (6,6,7)→11(헬퍼 공인 목록).
    id: "m2u5e170", lessonId: "m2u5l10", type: "num",
    prompt: `그림에서 ∠ABC=90°, ∠ACD=90°예요. ${gsym("AD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamRightTriFig({
      a: 6, b: 6,
      labels: { a: "6 cm", b: "6 cm" },
      dual: { d: 7, dLabel: "7 cm", hypLabel: "x cm" },
    }),
    answer: "11", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>직각삼각형이 두 개 이어져 있으니 피타고라스 정리를 두 번 써요.<br>① △ABC에서 AC²=6²+6²=36+36=72<br>② △ACD에서 AD²=AC²+CD²=72+49=121<br>③ 제곱해서 121이 되는 양수는 11, x=<b>11</b> ✓<span class='xh'>계산 실수 격파</span>중간에 AC의 길이를 꺼내려 하면 막혀요. 72는 제곱해서 나오는 자연수가 없으니까요. 요령은 AC²=72를 제곱인 채로 다음 식에 그대로 넘기는 거예요. 두 번째 삼각형에서 필요한 것도 어차피 AC의 제곱이거든요. 이렇게 연쇄 직각삼각형은 제곱값의 릴레이로 풀면 계산이 끊기지 않아요. 검산: 36+36+49=121=11²!",
    core: "연쇄 직각삼각형은 제곱값을 그대로 릴레이!",
  },
  {
    // [슬롯 172] 검산: shape right, HC=14−6=8, DC²=15²+8²=225+64=289=17². 트리플 (8,15,17).
    id: "m2u5e172", lessonId: "m2u5l10", type: "num",
    prompt: `그림의 사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("BC", "seg")}, ∠A=∠B=90°예요. 점 D에서 ${gsym("BC", "seg")}에 내린 수선의 발을 H라 할 때, ${gsym("DC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTrapCutFig({
      top: 6, bot: 14, t: 1, shape: "right", perp: true, perpName: "H",
      labels: { AD: "6 cm", BC: "14 cm", AB: "15 cm", DC: "x cm" },
    }),
    answer: "17", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>수선 DH를 내리면 사각형 ABHD는 직사각형이 되고, 직각삼각형 DHC가 남아요.<br>① DH=AB=15(직사각형의 마주 보는 변)<br>② HC=BC−BH=BC−AD=14−6=8<br>③ △DHC에서 x²=15²+8²=225+64=289, x=<b>17</b> ✓<span class='xh'>계산 실수 격파</span>이 유형의 핵심은 HC=8을 만들어 내는 과정이에요. BH가 AD와 같은 6이 되는 이유(ABHD가 직사각형)를 건너뛰면 HC를 14로 잘못 쓰게 돼요. 사다리꼴, 평행사변형에서 빗금 친 변의 길이를 구할 때는 언제나 수선을 내려 직각삼각형을 만드는 것이 정석 첫수예요. 검산: 8, 15, 17은 제곱 관계 64+225=289를 만족!",
    core: "사다리꼴 빗변은 수선 내려 직각삼각형부터 만들기!",
  },

  // ─ L11 직각삼각형이 되는 조건 ─
  {
    // [슬롯 183] 무그림(화이트리스트 ③ 직각 판정 - 그림 직각 마크가 결론 유출). 검산: 81+1600=1681=41².
    //  반례: 16+25=41≠36, 36+49=85≠64, 25+36=61≠64, 49+64=113≠81.
    id: "m2u5e183", lessonId: "m2u5l11", type: "mcq",
    prompt: "세 변의 길이가 각각 다음과 같은 삼각형 중 직각삼각형인 것은?",
    options: ["9 cm, 40 cm, 41 cm", "4 cm, 5 cm, 6 cm", "6 cm, 7 cm, 8 cm", "5 cm, 6 cm, 8 cm", "7 cm, 8 cm, 9 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>가장 긴 변의 제곱이 나머지 두 변의 제곱의 합과 같으면 직각삼각형이에요.<br>① 9²+40²=81+1600=1681<br>② 41²=1681로 일치!<br>③ 그래서 <b>9 cm, 40 cm, 41 cm</b>가 직각삼각형 ✓<span class='xh'>오답 하나씩 격파</span>4, 5, 6은 16+25=41≠36, 6, 7, 8은 36+49=85≠64, 5, 6, 8은 25+36=61≠64, 7, 8, 9는 49+64=113≠81로 전부 어긋나요. 연속한 수나 비슷한 크기의 수라고 직각이 되는 게 아니라, 제곱의 합 관계가 정확히 맞아떨어지는 특별한 세 수만 직각삼각형을 만들어요. 확인할 때는 반드시 가장 긴 변을 골라 그 제곱과 비교하세요.",
    core: "판정 기준은 (가장 긴 변)² = 나머지 제곱의 합!",
  },
  {
    // [슬롯 186] 무그림(화이트리스트 ③). 검산: 14²+48²=196+2304=2500=50². (7,24,25)×2.
    id: "m2u5e186", lessonId: "m2u5l11", type: "mcq",
    prompt: `세 변의 길이가 14 cm, 48 cm, <i class='mv'>x</i> cm인 삼각형이 직각삼각형이 되도록 하는 <i class='mv'>x</i>의 값은? (단, <i class='mv'>x</i> cm가 가장 긴 변이에요.)`,
    options: ["50", "62", "34", "46", "58"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>x가 가장 긴 변(빗변)이므로 제곱의 합 관계를 세워요.<br>① x²=14²+48²=196+2304=2500<br>② 제곱해서 2500이 되는 양수는 50<br>③ x=<b>50</b> ✓<span class='xh'>오답 하나씩 격파</span>62는 14+48로 두 변을 그대로 더한 값인데, 삼각형에서 한 변이 나머지 두 변의 합과 같으면 아예 삼각형이 만들어지지 않아요. 34는 48−14로 뺀 값이고, 46이나 58은 2500 근처의 어림값이에요. 참고로 14, 48, 50은 7, 24, 25를 2배 한 세 수예요. 직각삼각형의 세 변을 같은 배수로 늘려도 제곱 관계가 유지되니 여전히 직각삼각형이죠.",
    core: "빗변 미지수면 제곱 합부터, 배수 세 쌍도 직각 유지!",
  },
  {
    // [슬롯 190] 무그림(ㄱㄴㄷ 진술 판별). 검산: 16²+30²=256+900=1156=34² 참, 13²+84²=169+7056=7225=85² 참,
    //  2배 진술은 거짓(제곱 관계 4배로 유지), 4·6·7은 16+36=52≠49 거짓.
    id: "m2u5e190", lessonId: "m2u5l11", type: "multi",
    prompt: "직각삼각형이 되는 조건에 대한 설명으로 옳은 것을 모두 고르세요.",
    options: [
      "세 변 중 가장 긴 변의 길이의 제곱이 나머지 두 변의 길이의 제곱의 합과 같으면 직각삼각형이다",
      "세 변의 길이가 16 cm, 30 cm, 34 cm인 삼각형은 직각삼각형이다",
      "세 변의 길이가 13 cm, 84 cm, 85 cm인 삼각형은 직각삼각형이다",
      "직각삼각형의 세 변의 길이를 각각 2배 하면 더 이상 직각삼각형이 아니다",
      "세 변의 길이가 4 cm, 6 cm, 7 cm인 삼각형은 직각삼각형이다",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>판정 기준과 그 적용을 함께 확인해요.<br>① 가장 긴 변의 제곱=나머지 제곱의 합이면 직각삼각형: 조건 그 자체 ✓<br>② 16²+30²=256+900=1156=34² ✓<br>③ 13²+84²=169+7056=7225=85² ✓<span class='xh'>오답 하나씩 격파</span>세 변을 2배 하면 각 변의 제곱은 4배가 되는데, 양쪽이 똑같이 4배가 되니 등식은 그대로 유지돼요. 모양이 같은 닮은 삼각형이 될 뿐 직각은 사라지지 않죠. 4, 6, 7은 16+36=52이고 49와 다르니 직각삼각형이 아니에요. 수치 진술은 눈어림이 아니라 반드시 제곱 계산으로 확인하는 것이 원칙이에요.",
    core: "직각 판정은 언제나 제곱 계산으로, 배수는 직각 유지!",
  },
];

