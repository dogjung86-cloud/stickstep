// 중2 수학 Ⅳ. 삼각형과 사각형의 성질: 단원 종합 평가 풀 v2, 레슨 6 평행사변형의 성질 (책 162~166쪽)
// (m2u4e101~e120) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 10 + multi 2 + num 8, diff 8/8/4. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("34°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2·§8이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ ▱ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamParaFig,
  m2ExamParaBisectFig,
  m2ExamEquiTriFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U4L6: ExamItem[] = [
  {
    // [슬롯 101] 검산: 평행사변형 정의 = 두 쌍의 대변이 각각 평행.
    id: "m2u4e101", lessonId: "m2u4l6", type: "mcq",
    prompt: "평행사변형의 정의로 알맞은 것은?",
    figure: m2ExamParaFig({ arrows: true }),
    options: [
      "두 쌍의 대변이 각각 평행한 사각형",
      "네 변의 길이가 모두 같은 사각형",
      "네 내각의 크기가 모두 같은 사각형",
      "두 대각선의 길이가 같은 사각형",
      "한 쌍의 대변만 평행한 사각형",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 정의는 <b>두 쌍의 대변이 각각 평행한 사각형</b>이에요. 이름 그대로 '평행'이 정의의 전부이고, 대변의 길이가 같다거나 대각의 크기가 같다는 것은 정의에서 증명으로 얻어 내는 성질이에요.<span class='xh'>오답 하나씩 격파</span>네 변이 모두 같은 것은 마름모, 네 내각이 모두 같은 것은 직사각형의 정의예요. 대각선의 길이가 같은 것도 직사각형 쪽 성질이죠. 한 쌍의 대변만 평행하면 사다리꼴이에요. 정의와 성질을 구분하는 감각은 이 단원 내내 중요해요. 증명 문제에서 쓸 수 있는 출발점은 언제나 정의(평행)뿐이거든요.",
    core: "정의는 평행 두 쌍, 나머지는 증명된 성질!",
  },
  {
    // [슬롯 102] 검산: 이웃각 합 180(AB∥DC 사이) → ∠A=180−104=76 ✓. 실각 angleB=104?? ∠B=104 라벨 ·
    // ParaFig angleB 실각: 104(둔각 B) 렌더.
    id: "m2u4e102", lessonId: "m2u4l6", type: "num",
    prompt: "그림의 평행사변형 ABCD에서 ∠B=104°일 때, ∠A의 크기는 몇 도인가요? 숫자만 입력하세요.",
    figure: m2ExamParaFig({ angleB: 104, angles: { B: "104°", A: "x°" } }),
    answer: "76", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형에서 이웃하는 두 내각의 크기의 합은 180°예요.<br>① ∠A와 ∠B는 변 AB를 사이에 둔 이웃각<br>② ∠A=180°−104°=<b>76°</b><span class='xh'>계산 실수 격파</span>104를 그대로 옮기면 마주 보는 각(∠D)과 혼동한 거예요. 이웃각의 합이 180°인 이유는 AD∥BC 사이에 변 AB가 가로놓여 두 각이 같은 쪽에 나란히 끼기 때문이에요. 평행선 사이에 낀 같은 쪽 두 각의 합이 180°라는 중1 성질이 사각형 안에서 다시 살아나는 거죠. 대각은 같고 이웃각은 합이 180°, 이 두 문장이 평행사변형 각 계산의 전부예요.",
    core: "이웃각 합 180°, 대각은 같음, 위치부터 판독!",
  },
  {
    // [슬롯 103] 검산: 대변 상등 → 둘레 = 2×(12+19) = 62 ✓.
    id: "m2u4e103", lessonId: "m2u4l6", type: "num",
    prompt: `그림의 평행사변형 ABCD에서 ${gsym("AB", "seg")}=12 cm, ${gsym("BC", "seg")}=19 cm예요. 이 평행사변형의 둘레의 길이는 몇 cm인가요? 숫자만 입력하세요.`,
    figure: m2ExamParaFig({ sides: { AB: "12 cm", BC: "19 cm" } }),
    answer: "62", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형은 마주 보는 두 변의 길이가 각각 같아요.<br>① CD=AB=12 cm, DA=BC=19 cm<br>② 둘레=12+19+12+19=2×(12+19)=<b>62 cm</b><span class='xh'>계산 실수 격파</span>12+19=31에서 멈추면 둘레의 절반만 구한 거예요. 변이 두 개만 보여도 대변 상등 덕분에 네 변이 전부 확정된다는 것이 이 문항의 핵심이에요. 이 성질은 대각선 하나로 사각형을 두 삼각형으로 갈라 ASA 합동을 만드는 증명에서 나오는데, 그 증명이 이 단원의 대표 서술형이니 결과와 근거를 함께 챙겨 두세요.",
    core: "둘레 = (이웃한 두 변의 합)×2, 대변 상등 덕분!",
  },
  {
    // [슬롯 104] 검산: 대각선 이등분 → AC=2×OA=30 ✓.
    id: "m2u4e104", lessonId: "m2u4l6", type: "mcq",
    prompt: `그림의 평행사변형 ABCD에서 두 대각선의 교점이 O예요. ${gsym("OA", "seg")}=15 cm일 때, ${gsym("AC", "seg")}의 길이는?`,
    figure: m2ExamParaFig({ diag: "both", oLabels: { OA: "15 cm" } }),
    options: ["30 cm", "15 cm", "60 cm", "45 cm", "24 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 두 대각선은 서로를 이등분해요. 교점 O는 대각선 AC의 중점이니<br>① OC=OA=15 cm<br>② AC=15+15=<b>30 cm</b><span class='xh'>오답 하나씩 격파</span>15 cm는 반쪽에서 멈춘 값이고, 60 cm는 두 배를 한 번 더 한 값이에요. 45나 24는 근거가 없어요. '서로를 이등분한다'는 문구는 각 대각선이 상대 대각선에 의해 반으로 잘린다는 뜻이라, OA=OC이고 OB=OD예요. 다만 OA와 OB가 같다는 보장은 없다는 것도 함께 기억하세요. 두 대각선의 길이 자체가 같은 것은 직사각형부터 생기는 성질이거든요.",
    core: "O는 두 대각선 각각의 중점, 반쪽×2!",
  },
  {
    // [슬롯 105] 검산: AD∥BC 엇각 ∠ADB=∠DBC=34 · △ABD?? 풀이: ∠B=∠ABD+∠DBC=52+34=86 →
    // ∠A=180−86=94(이웃각) ✓. 실각 angleB=86.
    id: "m2u4e105", lessonId: "m2u4l6", type: "mcq",
    prompt: "그림의 평행사변형 ABCD에 대각선 BD를 그었어요. ∠DBC=34°, ∠ABD=52°일 때, ∠A의 크기는?",
    figure: m2ExamParaFig({ angleB: 86, diag: "BD", marks: [{ at: "DBC", label: "34°" }, { at: "ABD", label: "52°" }], angles: { A: "x°" } }),
    options: ["94°", "86°", "128°", "76°", "104°"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>쪼개진 두 각을 합쳐 ∠B부터 복원해요.<br>① ∠B=∠ABD+∠DBC=52°+34°=86°<br>② ∠A와 ∠B는 이웃각이니 ∠A=180°−86°=<b>94°</b><span class='xh'>오답 하나씩 격파</span>86°는 ∠B에서 멈춘 값이고, 104°는 180°에서 76°를 빼는 등 조각을 잘못 조합한 값이에요. 128°는 180−52로 한 조각만 쓴 계산이에요. 대각선이 그어져 있으면 AD∥BC의 엇각으로 ∠ADB=∠DBC=34°라는 정보도 함께 생기는데, 이 문제에서는 ∠B 복원 경로가 더 빨라요. 여러 경로 중 최단 경로를 고르는 눈도 연습 대상이에요.",
    core: "쪼개진 각은 합쳐서 전체로, 그다음 이웃각 180°!",
  },
  {
    // [슬롯 106] 검산(기본 실각 angleB=61·w=208·h=116): ①OA=OC 참(이등분) ②대각 참 ⑤엇각 참(AD∥BC).
    // ③AB=AD 거짓(그림 실측 133 vs 208로 시각도 다름 · 그림상 참 가드) ④수직 거짓(마름모 성질). 정답 [0,1,4].
    id: "m2u4e106", lessonId: "m2u4l6", type: "multi",
    prompt: "그림의 평행사변형 ABCD에서 두 대각선의 교점이 O일 때, 항상 성립하는 것을 모두 고르세요.",
    figure: m2ExamParaFig({ diag: "both" }),
    options: [
      `${gsym("OA", "seg")}=${gsym("OC", "seg")}`,
      "∠ADC=∠ABC",
      `${gsym("AB", "seg")}=${gsym("AD", "seg")}`,
      "∠AOB=90°",
      "∠DAC=∠ACB",
    ],
    answer: [0, 1, 4], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 두 대각선은 서로를 이등분하니 OA=OC가 성립하고, 마주 보는 두 각의 크기는 같으니 ∠ADC=∠ABC예요. 또 AD∥BC에 대각선 AC가 가로지르니 ∠DAC=∠ACB는 엇각으로 같아요.<span class='xh'>오답 하나씩 격파</span>AB=AD는 이웃하는 두 변이 같다는 뜻이라 마름모에서나 성립하는 조건이에요. 평행사변형이 보장하는 것은 마주 보는 변끼리의 길이예요. ∠AOB=90°, 곧 두 대각선이 수직으로 만나는 것도 마름모의 성질이라 일반 평행사변형에서는 성립하지 않아요. '서로를 이등분한다'까지가 평행사변형의 몫이고, 길이가 같거나 수직인 것은 특수한 사각형의 몫이에요.",
    core: "평행사변형 대각선은 서로를 이등분, 수직·등장은 특수 사각형 몫!",
  },
  {
    // [슬롯 107] 검산: ∠B+∠C=180(이웃각) → ∠B=180×4/9=80, ∠C=100. ∠A=∠C=100(대각) ✓. 원형 무그림(비Ⅳ2-3).
    id: "m2u4e107", lessonId: "m2u4l6", type: "num",
    prompt: "평행사변형 ABCD에서 ∠B:∠C=4:5일 때, ∠A의 크기는 몇 도인가요? 숫자만 입력하세요.",
    answer: "100", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>평행사변형에서 이웃하는 두 내각의 크기의 합은 180°예요.<br>① ∠B+∠C=180°이고 비가 4:5이니 ∠B=180°×4/9=80°, ∠C=180°×5/9=100°<br>② 마주 보는 각은 크기가 같으니 ∠A=∠C=<b>100°</b><span class='xh'>계산 실수 격파</span>80으로 답하면 ∠B를 구하고 멈춘 거예요. 문제가 묻는 것은 ∠A이고, ∠A는 ∠B의 이웃이 아니라 ∠C의 맞은편이라는 위치 관계를 한 번 더 확인해야 해요. 비례배분에서 분모는 4+5=9라는 것, 그리고 이웃각의 합이 180°인 이유는 AB∥DC 사이에 낀 두 각이기 때문이라는 것까지 챙기면 완벽해요.",
    core: "이웃각 합 180°로 비례배분, 묻는 각은 대각으로 건너가기!",
  },
  {
    // [슬롯 108] 검산(PB mode A): ∠BAE=∠DAE(이등분)·∠DAE=∠AEB(AD∥BC 엇각) → ∠BAE=∠AEB →
    // BE=AB=11 → EC=17−11=6 ✓. ratio=17/11 실비.
    id: "m2u4e108", lessonId: "m2u4l6", type: "mcq",
    prompt: `평행사변형 ABCD에서 ∠A의 이등분선이 ${gsym("BC", "seg")}와 만나는 점이 E예요. ${gsym("AB", "seg")}=11 cm, ${gsym("BC", "seg")}=17 cm일 때, ${gsym("EC", "seg")}의 길이는?`,
    figure: m2ExamParaBisectFig({ mode: "A", angleB: 62, ratio: 17 / 11, labels: [{ on: "AB", label: "11 cm" }, { on: "EC", label: "x cm" }] }),
    options: ["6 cm", "11 cm", "17 cm", "3 cm", "28 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이등분선과 평행선이 만나면 이등변삼각형이 숨어 있어요.<br>① AD∥BC이니 ∠DAE=∠AEB(엇각)<br>② AE는 ∠A의 이등분선이니 ∠BAE=∠DAE<br>③ 그래서 ∠BAE=∠AEB, △ABE는 이등변: BE=AB=11 cm<br>④ EC=BC−BE=17−11=<b>6 cm</b><span class='xh'>오답 하나씩 격파</span>11은 BE에서 멈춘 값이고, 17은 BC를 옮긴 값이에요. 3은 (17−11)÷2로 불필요한 반 나누기를 한 값, 28은 더한 값이에요. '이등분선의 발까지의 변 = 이웃 변'이라는 결과를 외우기보다, 엇각과 이등분이 만나 두 각이 같아지는 유도를 쓰면 어느 꼭짓점에서 출발해도 흔들리지 않아요.",
    core: "이등분선+엇각 → BE=AB, 남는 조각이 EC!",
  },
  {
    // [슬롯 109] 검산(PB Bext, ratio=23/14 실비): ∠ABE=∠BEC(엇각, AB∥DC 연장) = ∠EBC(이등분) →
    // △BCE 이등변 CE=CB=23 → DE=CE−CD=23−14=9 ✓.
    id: "m2u4e109", lessonId: "m2u4l6", type: "num",
    prompt: `평행사변형 ABCD에서 ∠B의 이등분선이 ${gsym("DC", "seg")}의 연장선과 만나는 점을 E라 해요. ${gsym("AB", "seg")}=14 cm, ${gsym("BC", "seg")}=23 cm일 때, ${gsym("DE", "seg")}의 길이는 몇 cm인가요? 숫자만 입력하세요.`,
    figure: m2ExamParaBisectFig({
      mode: "Bext", angleB: 58, ratio: 23 / 14,
      labels: [{ on: "AB", label: "14 cm" }, { on: "BC", label: "23 cm" }, { on: "DE", label: "x cm" }],
    }),
    answer: "9", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이등분선과 평행선이 만나면 이등변삼각형이 숨어 있어요.<br>① AB∥DC이니 ∠ABE=∠BEC(엇각)<br>② BE는 ∠B의 이등분선이니 ∠ABE=∠EBC<br>③ 그래서 ∠BEC=∠EBC, △BCE는 이등변: CE=CB=23 cm<br>④ DE=CE−CD=23−14=<b>9 cm</b>(CD=AB=14, 평행사변형의 대변)<span class='xh'>계산 실수 격파</span>23−14를 바로 쓰면 답은 맞지만 근거가 없어요. CE=CB가 되는 이유, 곧 엇각과 이등분이 만나 두 각이 같아지고 이등변삼각형이 되는 조건이 발동한다는 흐름이 핵심이에요. E가 D 바깥쪽 연장선 위라는 것도 그림에서 확인하세요. 그래야 DE가 CE에서 CD를 뺀 나머지 조각이 돼요.",
    core: "이등분선+엇각 = 이등변, CE=CB로 바꿔 조각을 빼라!",
  },
  {
    // [슬롯 110] 검산(PB mode AD): BE=AB=12·CF=CD=12 → BE+CF=24, BC=20 → 겹침 EF=24−20=4 ✓
    // (2AB>BC라 겹침 존재 · B,F,E,C 순서).
    id: "m2u4e110", lessonId: "m2u4l6", type: "mcq",
    prompt: `평행사변형 ABCD에서 ∠A의 이등분선과 ∠D의 이등분선이 ${gsym("BC", "seg")}와 만나는 점이 각각 E, F예요. ${gsym("AD", "seg")}=20 cm, ${gsym("AB", "seg")}=12 cm일 때, ${gsym("FE", "seg")}의 길이는?`,
    figure: m2ExamParaBisectFig({ mode: "AD", angleB: 64, ratio: 20 / 12, labels: [{ on: "AD", label: "20 cm" }, { on: "AB", label: "12 cm" }, { on: "FE", label: "x cm" }] }),
    options: ["4 cm", "8 cm", "2 cm", "6 cm", "12 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>양쪽에서 이등변삼각형이 하나씩 생겨요.<br>① ∠A의 이등분선: 엇각으로 ∠BAE=∠AEB이니 BE=AB=12 cm<br>② ∠D의 이등분선: 같은 논리로 CF=CD=12 cm<br>③ BE+CF=24 cm인데 BC=AD=20 cm뿐이라 두 구간이 겹쳐요<br>④ 겹친 부분 FE=24−20=<b>4 cm</b><span class='xh'>오답 하나씩 격파</span>8은 20−12에서 멈춘 값(한쪽만 계산), 2는 4를 다시 반으로 나눈 값이에요. 겹침 구조를 안 보고 BC에서 조각을 하나만 빼면 틀려요. BE와 CF를 같은 밑변 위에 겹쳐 놓고 초과분이 겹침이 된다는 그림을 그리는 것이 핵심이에요. 두 이등분선의 발이 어느 쪽에서 오는지(E는 A쪽, F는 D쪽) 순서 확인도 필수예요.",
    core: "양쪽 이등변 두 개, 합−밑변=겹침!",
  },
  {
    // [슬롯 111] 검산: 이등분 → OA=AC÷2=34÷2=17 ✓(문두 AC 이중 제시).
    id: "m2u4e111", lessonId: "m2u4l6", type: "num",
    prompt: `그림의 평행사변형 ABCD에서 두 대각선의 교점이 O이고 ${gsym("AC", "seg")}=34 cm예요. ${gsym("OA", "seg")}의 길이는 몇 cm인가요? 숫자만 입력하세요.`,
    figure: m2ExamParaFig({ diag: "both", oLabels: { OA: "x cm" } }),
    answer: "17", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 두 대각선은 서로를 이등분하니 O는 AC의 중점이에요.<br>① OA=AC÷2=34÷2=<b>17 cm</b><span class='xh'>계산 실수 격파</span>34를 그대로 쓰면 전체와 반쪽을 뒤바꾼 거예요. 104번 유형(반쪽에서 전체)과 이 문제(전체에서 반쪽)는 같은 성질을 반대 방향으로 쓰는 짝이에요. 방향이 어느 쪽이든 '서로를 이등분한다'는 문구를 O가 각 대각선의 중점이라는 그림으로 번역하는 것이 먼저예요. 이 성질이 성립하는 근거는 △OAD≡△OCB(엇각 두 쌍과 AD=CB의 ASA)라는 것도 서술형 대비로 알아 두면 좋아요.",
    core: "전체 ↔ 반쪽 자유 왕복, O는 중점!",
  },
  {
    // [슬롯 112] 검산(문장 mcq ④/10): ①이등분 참(통일 문구) · ②길이 같음(직사) ③수직(마름모)
    // ④이웃각 같음(직사) ⑤네 변 같음(마름모) 전부 특수 사각형 몫.
    id: "m2u4e112", lessonId: "m2u4l6", type: "mcq",
    prompt: "평행사변형의 성질로 옳은 것은?",
    options: [
      "두 대각선은 서로를 이등분해요",
      "두 대각선의 길이는 항상 같아요",
      "두 대각선은 항상 서로 수직이에요",
      "이웃하는 두 내각의 크기는 항상 같아요",
      "네 변의 길이는 항상 모두 같아요",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 대각선 성질은 <b>서로를 이등분한다</b>까지예요. 교점이 두 대각선 각각의 중점이 된다는 뜻이죠.<span class='xh'>오답 하나씩 격파</span>대각선의 길이가 같아지는 것은 직사각형, 서로 수직이 되는 것은 마름모부터 생기는 성질이에요. 이웃각의 크기가 같아지려면 둘 다 90°가 되어야 하니 그것도 직사각형 이야기이고, 네 변이 모두 같은 것은 마름모의 정의예요. 일반 평행사변형이 보장하는 것과 특수한 사각형에서 추가되는 것을 구분하는 감각이 다음 레슨(직사각형, 마름모)으로 이어지는 다리예요.",
    core: "평사의 대각선은 이등분까지, 길이·수직은 특수 몫!",
  },
  {
    // [슬롯 113] 검산: 대각선 AC 합동 증명의 ㉠ = AD∥BC의 엇각 ∠BCA=∠DAC. 결론(AB=CD·∠B=∠D·AD=BC)을
    // 근거로 쓰면 순환. 이등변 밑각 보기는 무관 거짓. 정답 0(문장+근거 보기라 셔플 유지).
    id: "m2u4e113", lessonId: "m2u4l6", type: "mcq",
    prompt: `다음은 평행사변형 ABCD에서 마주 보는 두 변의 길이가 각각 같음을 증명하는 과정이에요.<br><span style="display:block;margin:8px 0;padding:10px 12px;border:1.5px solid #D5DEF0;border-radius:10px;background:#F8FAFF;line-height:1.75">대각선 AC를 긋자.<br>${gsym("ABC", "tri")}와 ${gsym("CDA", "tri")}에서<br>AB∥DC이므로 ∠BAC=∠DCA (엇각),<br>${gsym("AC", "seg")}는 공통,<br>㉠<br>이므로 ${gsym("ABC", "tri")}≡${gsym("CDA", "tri")} (ASA 합동)<br>따라서 ${gsym("AB", "seg")}=${gsym("CD", "seg")}, ${gsym("BC", "seg")}=${gsym("DA", "seg")}</span>㉠에 들어갈 알맞은 것은?`,
    options: [
      "AD∥BC이므로 ∠BCA=∠DAC (엇각)",
      `평행사변형의 대변이므로 ${gsym("AB", "seg")}=${gsym("CD", "seg")}`,
      "평행사변형의 대각이므로 ∠B=∠D",
      `평행사변형의 대변이므로 ${gsym("AD", "seg")}=${gsym("BC", "seg")}`,
      "이등변삼각형이므로 ∠BAC=∠BCA",
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>ASA 합동에는 한 변과 그 양 끝 각이 필요해요. 공통변 AC의 양 끝 각 중 하나(∠BAC=∠DCA)는 이미 확보했으니, 남은 하나는 다른 평행 쌍 AD∥BC에서 나오는 엇각 <b>∠BCA=∠DAC</b>예요.<span class='xh'>오답 하나씩 격파</span>AB=CD와 AD=BC는 지금 증명하려는 결론 그 자체라서 근거로 쓰면 순환 논법이 돼요. ∠B=∠D도 이 합동이 끝난 뒤에야 따라 나오는 성질이라 순서가 뒤집혀요. 이등변삼각형 운운은 주어진 적 없는 정보예요. 평행사변형의 정의는 '두 쌍의 대변이 각각 평행'뿐이니, 증명의 재료도 평행에서 나오는 엇각 두 쌍과 공통변뿐이에요.",
    core: "정의(평행)에서 나온 엇각만 재료, 결론을 근거로 쓰면 순환!",
  },
  {
    // [슬롯 114] 검산: △ACD에서 112+38+∠DAC=180 → ∠DAC=30 ✓. 실각: ∠D는 ∠B의 "대각"이라
    // ∠D=angleB · 112를 원하면 angleB=112(구 68은 이웃각 혼동 실사고, codex 검산 반영).
    id: "m2u4e114", lessonId: "m2u4l6", type: "num",
    prompt: "그림의 평행사변형 ABCD에 대각선 AC를 그었어요. ∠D=112°, ∠DCA=38°일 때, ∠DAC의 크기는 몇 도인가요? 숫자만 입력하세요.",
    figure: m2ExamParaFig({ angleB: 112, diag: "AC", angles: { D: "112°" }, marks: [{ at: "DCA", label: "38°" }, { at: "DAC", label: "x°" }] }),
    answer: "30", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대각선이 만든 삼각형 ACD 하나에 집중해요.<br>① △ACD의 세 내각: ∠D=112°, ∠DCA=38°, ∠DAC<br>② ∠DAC=180°−112°−38°=<b>30°</b><span class='xh'>계산 실수 격파</span>평행사변형 성질을 쓰지 않아도 삼각형 내각의 합만으로 끝나는 문제예요. 오히려 함정은 계산 후 검산에 있어요. ∠DAC=30°이면 엇각(AD∥BC)으로 ∠ACB=30°가 되고, ∠BCD=38°+30°=68°가 되어 ∠D=112°와 이웃각 합 180°를 정확히 채워요. 이렇게 평행사변형의 각 성질로 답을 되짚는 습관이 실수를 걸러 줘요.",
    core: "대각선 삼각형은 내각합으로, 검산은 평사 성질로!",
  },
  {
    // [슬롯 115] 검산: 평사가 보장 못 하는 것 = AB=BC(이웃 변 상등 · 마름모행). 나머지는 대변 상등·평행.
    id: "m2u4e115", lessonId: "m2u4l6", type: "mcq",
    prompt: "평행사변형 ABCD에서 항상 성립한다고 할 수 없는 것은?",
    figure: m2ExamParaFig({ ticksOpp: true }),
    options: [
      `${gsym("AB", "seg")}=${gsym("BC", "seg")}`,
      `${gsym("AB", "seg")}=${gsym("DC", "seg")}`,
      `${gsym("AD", "seg")}=${gsym("BC", "seg")}`,
      "AB∥DC",
      "AD∥BC",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>AB=BC는 이웃하는 두 변이 같다는 뜻이에요. 평행사변형이 보장하는 것은 마주 보는 변끼리의 상등이지 이웃 변의 상등이 아니라서, <b>항상 성립한다고 할 수 없어요</b>. 이웃 변까지 같아지는 순간 그 도형은 마름모가 돼요.<span class='xh'>오답 하나씩 격파</span>AB=DC와 AD=BC는 대변 상등 성질 그대로이고, AB∥DC와 AD∥BC는 정의 그 자체예요. 이 문제의 진짜 목적은 '대변'과 '이웃 변'을 정확히 구분하는 거예요. 기호로 쓰면 헷갈리기 쉬우니, 사각형 ABCD에서 마주 보는 짝은 AB와 DC, AD와 BC라는 것을 꼭짓점 순서로 확인하는 습관을 들이세요.",
    core: "평사는 대변만 보장, 이웃 변 상등은 마름모행!",
  },
  {
    // [슬롯 116] 검산: 참 = 대변·대각·이등분 / 거짓 = 길이 같음(직사)·수직(마름모).
    id: "m2u4e116", lessonId: "m2u4l6", type: "multi",
    prompt: "평행사변형의 성질로 옳은 것을 모두 고르세요.",
    options: [
      "두 쌍의 대변의 길이가 각각 같아요",
      "두 쌍의 대각의 크기가 각각 같아요",
      "마주 보는 두 변끼리는 서로 평행해요",
      "두 대각선의 길이가 같아요",
      "두 대각선은 서로 수직이에요",
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형은 정의상 마주 보는 두 변끼리 평행하고, 여기서 합동 논증으로 대변의 길이가 각각 같다는 것과 대각의 크기가 각각 같다는 성질이 증명돼요. 셋 다 항상 성립해요.<span class='xh'>오답 하나씩 격파</span>대각선의 길이가 같은 것은 직사각형, 대각선이 수직인 것은 마름모에서 추가되는 성질이라 일반 평행사변형에는 해당하지 않아요. 기울어진 평행사변형을 하나 그려 두 대각선을 재 보면 길이가 다르고 수직도 아니라는 것이 바로 보여요. 반례 하나를 그려 보는 습관이 성질 암기보다 오래가요. 참고로 대각선이 '서로를 이등분한다'는 것도 평행사변형의 성질인데, 길이가 같다는 것과는 전혀 다른 말이라 구분해야 해요.",
    core: "대변·대각·이등분이 3대 성질, 길이·수직은 아니다!",
  },
  {
    // [슬롯 117] 검산: 대변 상등 → AB=DC=15 ✓.
    id: "m2u4e117", lessonId: "m2u4l6", type: "num",
    prompt: `그림의 평행사변형 ABCD에서 ${gsym("DC", "seg")}=15 cm일 때, ${gsym("AB", "seg")}의 길이는 몇 cm인가요? 숫자만 입력하세요.`,
    figure: m2ExamParaFig({ sides: { CD: "15 cm", AB: "x cm" } }),
    answer: "15", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형에서 마주 보는 두 변의 길이는 같아요. AB와 DC는 대변이니 AB=DC=<b>15 cm</b>예요.<span class='xh'>계산 실수 격파</span>확인할 것은 단 하나, AB의 짝이 정말 DC인가예요. 사각형 ABCD를 한 바퀴 돌며 읽으면 AB 다음이 BC, 그다음이 CD, DA 순서이고, 마주 보는 짝은 한 칸 건너의 변이에요. 그래서 AB와 CD, BC와 DA가 대변 짝이 되죠. 이 짝 찾기가 익숙해지면 대변 상등, 대각 상등 문제에서 실수가 사라져요. 참고로 이 성질의 근거는 대각선 하나로 만든 두 삼각형의 ASA 합동이에요.",
    core: "대변 짝은 한 칸 건너, AB의 짝은 DC!",
  },
  {
    // [슬롯 118] 검산: ∠BAE=62(반각) → ∠A=124 → 그림 실각 angleB=56. ∠AEB=∠DAE=62(엇각) →
    // ∠AEC=180−62=118 ✓.
    id: "m2u4e118", lessonId: "m2u4l6", type: "mcq",
    prompt: `평행사변형 ABCD에서 ∠A의 이등분선이 ${gsym("BC", "seg")}와 만나는 점이 E예요. ∠BAE=62°일 때, ∠AEC의 크기는?`,
    figure: m2ExamParaBisectFig({ mode: "A", angleB: 56, ratio: 1.55 }),
    options: ["118°", "62°", "56°", "124°", "112°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>엇각으로 ∠AEB를 확보한 뒤 평각으로 넘어가요.<br>① AE가 ∠A를 이등분하니 ∠DAE=∠BAE=62°<br>② AD∥BC이니 ∠AEB=∠DAE=62°(엇각)<br>③ ∠AEC는 ∠AEB와 평각을 이루니 180°−62°=<b>118°</b><span class='xh'>오답 하나씩 격파</span>62°는 엇각에서 멈춘 값이고, 124°는 ∠A 전체(62°×2)예요. 56°는 ∠B의 크기(180−124)이고 112°는 다른 조합 착오예요. 이 문제는 이등분, 엇각, 평각이라는 세 가지 기본기가 한 줄로 이어지는 구성이라, 각이 어디에서 어디로 옮겨 가는지 화살표를 그리며 풀면 경로가 선명해져요. ∠BAE=∠AEB 덕분에 △ABE가 이등변이라는 사실도 함께 보이면 금상첨화예요.",
    core: "이등분 → 엇각 → 평각, 각의 이동 경로 그리기!",
  },
  {
    // [슬롯 119] 검산: 대각 상등 → ∠C=∠A=98 ✓. 실각 angleB=82(∠A=98).
    id: "m2u4e119", lessonId: "m2u4l6", type: "num",
    prompt: "그림의 평행사변형 ABCD에서 ∠A=98°일 때, ∠C의 크기는 몇 도인가요? 숫자만 입력하세요.",
    figure: m2ExamParaFig({ angleB: 82, angles: { A: "98°", C: "x°" } }),
    answer: "98", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형에서 마주 보는 두 각의 크기는 같아요. ∠A와 ∠C는 대각이니 ∠C=∠A=<b>98°</b>예요.<span class='xh'>계산 실수 격파</span>180°−98°=82°로 답하면 이웃각(∠B, ∠D)과 혼동한 거예요. 각의 위치부터 판독하세요. 마주 보면 같고, 이웃하면 합이 180°예요. 사각형 내각의 합 360°로 검산하면 98+82+98+82=360이 정확히 맞아요. 대각 상등의 근거는 두 쌍의 평행에서 나온 엇각들을 이어 붙이는 논증 또는 반 바퀴 돌려 포개는 관찰이라는 것도 기억해 두세요.",
    core: "마주 보면 같다, 이웃하면 180°, 위치 먼저!",
  },
  {
    // [슬롯 120] 검산(ET): △EBD≡△CBA(SAS: EB=CB·BD=BA·∠EBD=∠CBA=60°+∠ABE 공통합) → DE=CA=AF.
    // △FCE≡△ACB(SAS 동형) → EF=AB=AD → 두 쌍 대변 상등으로 평행사변형 ✓.
    id: "m2u4e120", lessonId: "m2u4l6", type: "mcq",
    prompt: "그림처럼 △ABC의 세 변을 각각 한 변으로 하는 정삼각형 ABD, BCE, ACF를 그리고, D와 E, E와 F를 이었어요. 삼각형의 합동을 두 번 이용하면 DE=AF, EF=AD임을 알 수 있어요. 이때 □DAFE가 평행사변형임을 판정하는 근거 조건은?",
    figure: m2ExamEquiTriFig(),
    options: [
      "두 쌍의 대변의 길이가 각각 같음",
      "두 쌍의 대변이 각각 평행함",
      "두 대각선이 서로를 이등분함",
      "한 쌍의 대변이 평행하고 그 길이가 같음",
      "두 쌍의 대각의 크기가 각각 같음",
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>합동 두 번으로 대변 두 쌍의 길이를 확정해요.<br>① △EBD와 △CBA에서 EB=CB, BD=BA(정삼각형), ∠EBD=60°+∠ABE=∠CBA이니 SAS 합동: DE=CA, 그런데 CA=AF(정삼각형)이니 DE=AF<br>② 같은 방법으로 △FCE≡△ACB에서 EF=AB=AD<br>③ 두 쌍의 대변의 길이가 각각 같으니 평행사변형이에요<span class='xh'>오답 하나씩 격파</span>평행함이나 대각의 크기는 이 그림에서 직접 확인할 길이 없어요. 합동으로 얻을 수 있는 것은 길이이니, 길이 조건으로 판정하는 것이 자연스러운 경로예요. 대각선 정보도 없고, 한 쌍 평행+길이 조건도 평행을 모르니 쓸 수 없어요.",
    core: "합동이 주는 건 길이, 그래서 대변 두 쌍 조건!",
  },
];
