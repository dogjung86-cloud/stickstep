// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀 v2, 레슨 1 도형의 닮음: 크기만 다른 쌍둥이 (책 190~193쪽)
// (m2u5e001~e018) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u5-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 9 + multi 2 = 11 · num 7, diff 7/8/3. word 0(규격 v2, 교과서 실측 계승).
// 그림 원칙: 수치는 라벨 단위 병기("12 cm"·"x cm"), 관계 조건은 문두, 실각·실비 검산 완료(각 문항 주석).
// 트리플·앵커 배정은 설계표 §2·§2-1이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamSimQuadPairFig,
  m2ExamTriPairFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U5L1: ExamItem[] = [
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
    // [슬롯 3] 검산: ∠E는 ∠B의 대응각, 180−76−45=59°. 실각 라벨 A=76·C=45와 B1=59·C1=45 정합.
    id: "m2u5e003", lessonId: "m2u5l1", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. ∠E의 크기는?`,
    figure: m2ExamTriPairFig({
      B1: 59, C1: 45, ratio: 1.4, rot2: 40,
      labels1: { A: "76°", C: "45°" },
      names2: ["D", "E", "F"],
    }),
    options: ["59°", "45°", "76°", "31°", "121°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮음 기호의 순서가 대응을 알려 줘요. △ABC∽△DEF에서 두 번째 글자끼리 짝이니 ∠E의 대응각은 ∠B예요.<br>① ∠B=180°−76°−45°=59°<br>② 닮은 도형의 대응각은 크기가 같으므로 ∠E=<b>59°</b> ✓<span class='xh'>오답 하나씩 격파</span>45°는 ∠C, 76°는 ∠A의 크기예요. 오른쪽 삼각형이 돌아가 있어서 눈짐작으로 위치가 비슷한 각을 고르면 이런 함정에 걸려요. 대응은 그림의 방향이 아니라 기호의 글자 순서로 정해진다는 것이 핵심이에요. 31°는 76−45처럼 엉뚱하게 뺀 값이고, 121°는 59°의 보각(180−59)이에요. 나머지 각부터 구하고 기호로 짝을 찾으면 흔들리지 않아요.",
    core: "대응각은 그림 방향이 아니라 ∽ 기호의 글자 순서로!",
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
    // [슬롯 5] 검산: 닮음비 4:7, AB=8 → DE=8×7/4=14. ratio 1.75(상한 준수).
    id: "m2u5e005", lessonId: "m2u5l1", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}이고 두 삼각형의 닮음비는 4:7이에요. ${gsym("DE", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 64, C1: 47, ratio: 1.75,
      sides1: { AB: "8 cm" }, sides2: { AB: "x cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "14", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>닮음비는 대응변의 길이의 비예요.<br>① AB의 대응변은 DE<br>② AB:DE=4:7이므로 8:x=4:7<br>③ 4x=56, x=<b>14</b> ✓<span class='xh'>계산 실수 격파</span>8×4÷7로 계산하면 약 4.6이 나오는데, 닮음비 4:7에서 앞의 4가 △ABC 쪽(작은 도형)이라는 것을 놓친 거예요. DEF가 큰 쪽이니 DE는 8 cm보다 길어야 해요. 비례식을 세울 때는 기호 순서대로 '작은 쪽:큰 쪽'을 한 번 정해 두고 끝까지 같은 방향으로 쓰는 것이 안전해요. 검산: 8:14=4:7로 약분하면 딱 맞아요.",
    core: "닮음비의 앞뒤가 어느 도형인지부터 고정!",
  },
  {
    // [슬롯 6] 검산: 정답 쌍 6:4=15:10=3:2 유일 일치. 반례 4:3vs3:2, 5:2vs15:8, 3:2vs4:3, 7:4vs3:2 확인.
    //  그림은 가로만 늘린 왜곡 반례(12×8 vs 18×8), 닮음이 아님을 시각 제시.
    id: "m2u5e006", lessonId: "m2u5l1", type: "mcq",
    prompt: "그림의 두 직사각형은 가로만 늘어나 서로 닮은 도형이 아니에요. 다음 중 두 직사각형이 서로 닮은 도형인 것은?",
    figure: m2ExamSimQuadPairFig({
      rect: [12, 8, 18, 8],
      sidesL: ["12 cm", "8 cm", null, null], sidesR: ["18 cm", "8 cm", null, null],
    }),
    options: [
      "가로 6 cm, 세로 4 cm와 가로 15 cm, 세로 10 cm",
      "가로 8 cm, 세로 6 cm와 가로 12 cm, 세로 8 cm",
      "가로 10 cm, 세로 4 cm와 가로 15 cm, 세로 8 cm",
      "가로 9 cm, 세로 6 cm와 가로 12 cm, 세로 9 cm",
      "가로 14 cm, 세로 8 cm와 가로 21 cm, 세로 14 cm",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>직사각형이 닮으려면 가로:세로 비가 같아야 해요.<br>① 6:4=3:2<br>② 15:10=3:2<br>③ 두 비가 같으니 <b>닮음</b> ✓ (닮음비는 6:15=2:5)<span class='xh'>오답 하나씩 격파</span>8:6=4:3과 12:8=3:2는 달라요. 10:4=5:2와 15:8도 다르죠. 9:6=3:2와 12:9=4:3은 앞뒤가 뒤바뀐 함정이고, 14:8=7:4와 21:14=3:2도 어긋나요. 그림처럼 한 방향만 늘린 직사각형이 닮음이 아닌 이유도 같은 원리예요. 가로세로가 같은 배율로 늘어야 모양이 유지돼요.",
    core: "직사각형 닮음 = 가로:세로 비 일치!",
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
  {
    // [슬롯 8] 검산: ∽ 순서상 AB↔DE·BC↔EF 고정, 뒤집힘은 시각 함정일 뿐.
    id: "m2u5e008", lessonId: "m2u5l1", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. 대응변끼리 바르게 짝 지은 것은?`,
    figure: m2ExamTriPairFig({
      B1: 57, C1: 38, ratio: 1.4, flip2: true,
      names2: ["D", "E", "F"],
    }),
    options: [
      `${gsym("AB", "seg")}와 ${gsym("DE", "seg")}, ${gsym("BC", "seg")}와 ${gsym("EF", "seg")}`,
      `${gsym("AB", "seg")}와 ${gsym("EF", "seg")}, ${gsym("BC", "seg")}와 ${gsym("DE", "seg")}`,
      `${gsym("AB", "seg")}와 ${gsym("DF", "seg")}, ${gsym("BC", "seg")}와 ${gsym("DE", "seg")}`,
      `${gsym("AB", "seg")}와 ${gsym("DE", "seg")}, ${gsym("BC", "seg")}와 ${gsym("DF", "seg")}`,
      `${gsym("AB", "seg")}와 ${gsym("FD", "seg")}, ${gsym("BC", "seg")}와 ${gsym("EF", "seg")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대응변은 닮음 기호의 글자 순서에서 바로 읽어요.<br>① A↔D, B↔E, C↔F<br>② 그래서 AB↔<b>DE</b>, BC↔<b>EF</b>, CA↔FD ✓<span class='xh'>오답 하나씩 격파</span>오른쪽 삼각형이 뒤집혀 있어서 그림만 보고 짝을 찾으면 AB와 EF처럼 위치가 비슷해 보이는 변을 고르게 돼요. 하지만 대응은 △ABC∽△DEF라는 기호가 이미 확정해 놓았어요. 첫 두 글자끼리(AB와 DE), 뒤 두 글자끼리(BC와 EF) 기계적으로 읽으면 그림이 아무리 돌아가고 뒤집혀 있어도 틀릴 수가 없어요. 나머지 보기들은 전부 글자 순서를 무시한 짝이에요.",
    core: "짝은 그림이 아니라 기호에서, 글자 위치끼리!",
  },
  {
    // [슬롯 9] 검산: 둘레의 비 = 닮음비 5:7, 작은 둘레 25 → 25×7/5=35.
    id: "m2u5e009", lessonId: "m2u5l1", type: "num",
    prompt: "그림의 두 사각형은 서로 닮은 도형이에요. 작은 사각형의 둘레가 25 cm일 때, 큰 사각형의 둘레는 몇 cm인지 구하세요.",
    figure: m2ExamSimQuadPairFig({
      angles: [97, 83, 94, 86], sides: [5, 6], ratio: 1.4,
      sidesL: ["5 cm", null, null, null], sidesR: ["7 cm", null, null, null],
    }),
    answer: "35", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>닮은 도형에서 둘레의 비는 닮음비와 같아요. 모든 변이 같은 배율로 늘어나니 그 합인 둘레도 같은 배율이죠.<br>① 닮음비: 5:7<br>② 둘레의 비도 5:7이므로 25:x=5:7<br>③ 5x=175, x=<b>35</b> ✓<span class='xh'>계산 실수 격파</span>둘레라는 말에 넓이의 비(25:49)를 떠올려 25×49÷25=49로 계산하면 안 돼요. 제곱이 붙는 것은 넓이뿐이고, 둘레는 길이의 합이라 닮음비를 그대로 써요. 길이 1제곱, 넓이 2제곱, 부피 3제곱의 사다리에서 둘레는 길이 칸에 속한다는 것만 기억하면 돼요. 검산: 25:35=5:7 일치!",
    core: "둘레의 비 = 닮음비 그대로(제곱은 넓이만)!",
  },
  {
    // [슬롯 10] 무그림(화이트리스트 ④ 한 줄 역산). 검산: 6×50000=300000 cm=3000 m=3 km.
    id: "m2u5e010", lessonId: "m2u5l1", type: "mcq",
    prompt: "축척이 1:50000인 지도에서 두 지점 사이의 거리가 6 cm예요. 실제 거리는?",
    options: ["3 km", "30 km", "0.3 km", "6 km", "12 km"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>축척 1:50000은 지도가 실제를 1/50000로 줄인 닮음이라는 뜻이에요.<br>① 실제 거리=6×50000=300000 cm<br>② 300000 cm=3000 m=<b>3 km</b> ✓<span class='xh'>오답 하나씩 격파</span>30 km나 0.3 km는 단위 환산에서 0의 개수를 놓친 값이에요. cm에서 m로 갈 때 0을 두 개, m에서 km로 갈 때 세 개를 지워야 하니 300000 cm에서 다섯 개를 지우면 3이 남아요. 6 km는 곱셈 없이 수만 옮긴 값이고, 12 km는 어림으로 두 배를 한 값이죠. 축척 문제는 곱셈보다 단위 환산이 진짜 관문이에요. 지도는 우리 주변에서 닮음이 실제로 쓰이는 대표적인 예랍니다.",
    core: "축척은 닮음비, 관문은 cm→km 단위 환산!",
  },
  {
    // [슬롯 11] 문장 진술 multi(판별 쿼터). 참: 대응각 동일·변 비 일정·1:1이면 합동.
    id: "m2u5e011", lessonId: "m2u5l1", type: "multi",
    prompt: "서로 닮은 두 평면도형에 대한 설명으로 옳은 것을 모두 고르세요.",
    options: [
      "대응하는 각의 크기는 서로 같다",
      "대응하는 변의 길이의 비는 일정하다",
      "두 도형의 넓이는 항상 같다",
      "닮음비가 1:1이면 두 도형은 합동이다",
      "대응하는 변의 길이는 항상 서로 같다",
    ],
    answer: [0, 1, 3], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>닮음의 정의 그 자체예요. 한 도형을 일정한 비율로 확대·축소해 다른 도형과 완전히 포갤 수 있을 때 닮음이라 하고, 이때 <b>각은 그대로, 변은 같은 비율</b>로 변해요. 비율이 1:1이면 크기까지 같아지니 합동이 되죠. 합동은 닮음의 특별한 경우예요 ✓<span class='xh'>오답 하나씩 격파</span>넓이가 항상 같다는 말과 변의 길이가 항상 같다는 말은 닮음비가 1:1일 때만 성립해요. 일반적으로는 크기가 다르니 변도 넓이도 달라요. 닮음에서 변하지 않는 것은 모양(각과 비율)이고, 변하는 것은 크기(길이·넓이)라고 정리해 두면 판별이 쉬워요.",
    core: "닮음 불변량은 각과 비율, 크기는 변한다!",
  },
  {
    // [슬롯 12] 검산: 닮음비 15:10? 아니 AB쌍 10:15=2:3... BC 21×2/3=14. 실각 (10,12,14): A=57°·B=79°·C=44°.
    id: "m2u5e012", lessonId: "m2u5l1", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}일 때, ${gsym("CA", "seg")}의 길이는?`,
    figure: m2ExamTriPairFig({
      B1: 79, C1: 44, ratio: 1.5,
      sides1: { AB: "10 cm", BC: "12 cm", CA: "x cm" }, sides2: { AB: "15 cm", BC: "18 cm", CA: "21 cm" },
      names2: ["D", "E", "F"],
    }),
    options: ["14 cm", "21 cm", "16 cm", "12 cm", "10 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>먼저 값이 둘 다 있는 대응변으로 닮음비를 정해요.<br>① AB:DE=10:15=2:3 (BC:EF=12:18=2:3으로 확인)<br>② CA:FD=2:3이므로 x:21=2:3<br>③ 3x=42, x=<b>14 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>21 cm는 FD를 그대로 옮긴 값이에요. CA는 작은 삼각형의 변이니 21보다 작아야 하죠. 16 cm는 21에서 5를 빼는 식으로 차이가 일정하다고 착각한 값인데, 닮음은 덧셈이 아니라 곱셈(배율)의 관계예요. 12 cm는 BC와 헷갈린 값, 10 cm는 AB를 옮긴 값이에요. 두 쌍의 비가 모두 2:3으로 같은지 확인하고 시작하면 안전해요.",
    core: "닮음은 차가 아니라 비, 두 쌍으로 비를 확인!",
  },
  {
    // [슬롯 13] 검산: 사각형 내각 합 360, x=360−105−78−89=88. angles 실각 렌더.
    id: "m2u5e013", lessonId: "m2u5l1", type: "num",
    prompt: "그림에서 사각형 ABCD∽사각형 EFGH예요. ∠G의 크기 <i class='mv'>x</i>°에서 <i class='mv'>x</i>의 값을 구하세요.",
    figure: m2ExamSimQuadPairFig({
      angles: [105, 78, 88, 89], sides: [6, 7], ratio: 1.35,
      labelsL: ["105°", "78°", null, "89°"], labelsR: [null, null, "x°", null],
      namesL: ["A", "B", "C", "D"], namesR: ["E", "F", "G", "H"],
    }),
    answer: "88", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>∠G의 대응각은 ∠C인데, ∠C의 크기가 그림에 없으니 사각형의 내각의 합으로 구해요.<br>① 사각형 내각의 합은 360°<br>② ∠C=360°−105°−78°−89°=88°<br>③ 대응각은 같으므로 x=<b>88</b> ✓<span class='xh'>계산 실수 격파</span>105+78+89=272를 360에서 빼는 계산에서 272를 262나 282로 잘못 더하는 실수가 흔해요. 세 수를 두 번 더해 확인하세요. 또 ∠G의 짝을 ∠B나 ∠D로 잘못 잡으면 78이나 89를 그대로 답하게 되는데, EFGH의 세 번째 글자 G는 ABCD의 세 번째 글자 C와 짝이에요. 닮은 도형에서 각 정보는 이렇게 한 도형에 모아 놓고 대응으로 건너 읽게 하는 것이 단골 출제 방식이에요.",
    core: "모자란 각은 내각의 합 360°로, 짝은 글자 순서로!",
  },
  {
    // [슬롯 14] 검산: 회전+뒤집기 복합, 옳은 표기는 대응각 짝 유지. 실각 A=72·B=63·C=45.
    id: "m2u5e014", lessonId: "m2u5l1", type: "mcq",
    prompt: `그림의 두 삼각형은 서로 닮은 도형이고 ∠A=∠D, ∠B=∠E예요. 닮음 기호로 바르게 나타낸 것은?`,
    figure: m2ExamTriPairFig({
      B1: 63, C1: 45, ratio: 1.4, rot2: 150, flip2: true,
      labels1: { A: "72°", B: "63°" }, labels2: { A: "72°", B: "63°" },
      names2: ["D", "E", "F"],
    }),
    options: [
      `${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}`,
      `${gsym("ABC", "tri")}∽${gsym("EFD", "tri")}`,
      `${gsym("ABC", "tri")}∽${gsym("FED", "tri")}`,
      `${gsym("ABC", "tri")}∽${gsym("DFE", "tri")}`,
      `${gsym("ABC", "tri")}∽${gsym("EDF", "tri")}`,
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>닮음 기호는 대응하는 꼭짓점을 같은 자리에 써요.<br>① ∠A=∠D이므로 A↔D<br>② ∠B=∠E이므로 B↔E<br>③ 남은 C↔F<br>④ 따라서 △ABC∽<b>△DEF</b> ✓<span class='xh'>오답 하나씩 격파</span>오른쪽 삼각형이 크게 돌아가고 뒤집혀 있어서 그림의 위치로 대응을 잡으면 EFD나 FED처럼 어긋난 순서를 고르게 돼요. 대응의 근거는 오직 같은 크기의 각이에요. 각이 같은 꼭짓점끼리 짝을 짓고, 그 순서 그대로 기호에 옮기면 끝이에요. 거꾸로 기호를 보고 대응각을 읽을 수도 있어야 해요.",
    core: "회전·뒤집기 무시, 같은 각끼리 짝지어 순서대로!",
  },
  {
    // [슬롯 15] 검산: 뒤집힌 사각형, AB쌍 6:8=3:4 확정 후 BC 9→x=12. flipR 대응 찾기+2단이 diff3 근거.
    id: "m2u5e015", lessonId: "m2u5l1", type: "num",
    prompt: `그림에서 사각형 ABCD∽사각형 EFGH이고, 오른쪽 사각형은 뒤집혀 있어요. ${gsym("FG", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamSimQuadPairFig({
      angles: [96, 84, 92, 88], sides: [6, 9], ratio: 4 / 3, flipR: true,
      sidesL: ["6 cm", "9 cm", null, null], sidesR: ["8 cm", "x cm", null, null],
      namesL: ["A", "B", "C", "D"], namesR: ["E", "F", "G", "H"],
    }),
    answer: "12", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>뒤집혀 있어도 대응은 기호 순서 그대로예요.<br>① AB:EF=6:8=3:4<br>② BC의 대응변은 FG이므로 9:x=3:4<br>③ 3x=36, x=<b>12</b> ✓<span class='xh'>계산 실수 격파</span>뒤집힌 그림에서는 FG가 왼쪽 사각형의 BC와 반대쪽에 보여서, 위치로 대응을 잡으면 DA(=9의 짝이 아닌 변)와 짝짓는 실수가 나와요. 기호 ABCD∽EFGH의 두 번째·세 번째 글자에서 BC↔FG를 읽는 것이 유일하게 믿을 근거예요. 9×3÷4=6.75로 방향을 뒤집는 실수도 조심하세요. EFGH가 큰 쪽이니 x는 9보다 커야 해요. 검산: 6:8=9:12=3:4!",
    core: "뒤집힌 도형일수록 기호 순서만 믿어라!",
  },
  {
    // [슬롯 16] 검산: AB쌍 6:9=2:3 → 최장변 BC 10×1.5=15. 실각 (6,10,9): A=81°·B=63°·C=36°.
    id: "m2u5e016", lessonId: "m2u5l1", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}일 때, ${gsym("DEF", "tri")}에서 가장 긴 변의 길이는?`,
    figure: m2ExamTriPairFig({
      B1: 63, C1: 36, ratio: 1.5,
      sides1: { AB: "6 cm", BC: "10 cm", CA: "9 cm" }, sides2: { AB: "9 cm" },
      names2: ["D", "E", "F"],
    }),
    options: ["15 cm", "13.5 cm", "10 cm", "18 cm", "12 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>두 단계로 풀어요.<br>① 닮음비: AB:DE=6:9=2:3<br>② 닮은 도형에서 가장 긴 변끼리 대응하니, △ABC의 최장변 BC=10의 대응변 EF가 △DEF의 최장변<br>③ EF=10×3/2=<b>15 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>13.5 cm는 CA=9를 1.5배 한 값으로, 가장 긴 변을 잘못 고른 거예요. 세 변 6, 10, 9 중 최장은 10이죠. 10 cm는 BC를 그대로 옮긴 값이고, 18 cm는 10에 닮음비 대신 어림한 배율을 곱한 값, 12 cm는 CA의 짝(FD=13.5)을 잘못 계산한 값이에요. 닮음에서는 변의 크기 순서가 그대로 보존된다는 사실이 이 문제의 숨은 열쇠예요.",
    core: "닮음은 크기 순서 보존, 최장변의 짝이 최장변!",
  },
  {
    // [슬롯 17] 그림 판별 multi. 검산: 닮음비 8:12=2:3 ✓, EF=6×1.5=9 ✓, GH=1.5×CD ✓ / ∠G=∠B X(G↔C), 둘레비 4:9 X.
    id: "m2u5e017", lessonId: "m2u5l1", type: "multi",
    prompt: "그림에서 사각형 ABCD∽사각형 EFGH예요. 옳은 것을 모두 고르세요.",
    figure: m2ExamSimQuadPairFig({
      angles: [98, 82, 93, 87], sides: [6, 8], ratio: 1.5,
      sidesL: ["6 cm", "8 cm", null, null], sidesR: [null, "12 cm", null, null],
      namesL: ["A", "B", "C", "D"], namesR: ["E", "F", "G", "H"],
    }),
    options: [
      "두 사각형의 닮음비는 2:3이다",
      `${gsym("EF", "seg")}=9 cm이다`,
      "∠G=∠B이다",
      "둘레의 길이의 비는 4:9이다",
      `${gsym("GH", "seg")}의 길이는 ${gsym("CD", "seg")}의 1.5배이다`,
    ],
    answer: [0, 1, 4], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>그림에서 값이 둘 다 있는 대응변은 BC와 FG예요.<br>① 닮음비: 8:12=2:3 ✓<br>② EF=AB×3/2=6×1.5=9 cm ✓<br>③ 모든 대응변이 1.5배이므로 GH=1.5×CD ✓<span class='xh'>오답 하나씩 격파</span>∠G의 대응각은 세 번째 글자끼리인 ∠C이지 ∠B가 아니에요. 둘레의 비 4:9는 닮음비를 제곱한 넓이의 비예요. 둘레는 길이라서 닮음비 2:3을 그대로 따라가죠. 그림 하나에서 비율 계산, 대응 읽기, 둘레와 넓이의 구분까지 한 번에 점검하는 종합 확인 문제였어요.",
    core: "둘레는 닮음비 그대로, 제곱은 넓이 전용!",
  },
  {
    // [슬롯 18] 검산: AB쌍 6:9=2:3... 그림 BC 12→18 비 2:3 확정, x=DE=6×1.5=9. 실각(6,12,?): sinC/sinA=1/2 → B=70·C=30.
    id: "m2u5e018", lessonId: "m2u5l1", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}일 때, ${gsym("DE", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 70, C1: 30, ratio: 1.5,
      sides1: { AB: "6 cm", BC: "12 cm" }, sides2: { AB: "x cm", BC: "18 cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "9", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>값이 둘 다 있는 대응변 BC와 EF로 닮음비부터 정해요.<br>① BC:EF=12:18=2:3<br>② AB:DE=2:3이므로 6:x=2:3<br>③ 2x=18, x=<b>9</b> ✓<span class='xh'>계산 실수 격파</span>6×2÷3=4로 계산했다면 비의 방향이 뒤집힌 거예요. DEF가 큰 삼각형이니 DE는 6보다 커야 하죠. 또 12와 18의 차이 6을 그대로 옮겨 6+6=12로 답하는 덧셈식 사고도 흔한 함정이에요. 닮음은 모든 변이 같은 '배율'로 늘어나는 곱셈의 관계라서, 차이가 아니라 비로 계산해야 해요. 검산: 6:9=12:18=2:3!",
    core: "닮음비 먼저 확정, 더하기가 아니라 곱하기!",
  },
];
