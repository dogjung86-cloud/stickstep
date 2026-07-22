// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀 v2, 레슨 9 삼각형의 무게중심 (책 208~210쪽)
// (m2u5e146~e163) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u5-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 9 + multi 2 = 11 · num 7, diff 7/7/4. word 0(규격 v2, 교과서 실측 계승).
// 그림 원칙: 수치는 라벨 단위 병기("12 cm"·"x cm"), 관계 조건은 문두, 실각·실비 검산 완료(각 문항 주석).
// 트리플·앵커 배정은 설계표 §2·§2-1이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamCentroidFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U5L9: ExamItem[] = [
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
