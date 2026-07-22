// m2u5 v2 확장분 C: L6~L7 비파일럿 슬롯(설계표 순번, id=슬롯). 규칙은 rest-a 헤더와 동일.
import type { ExamItem } from "../src/content/exams/types";
import { gsym } from "../src/ui/geoKit";
import {
  m2ExamTriSplitFig,
  m2ExamXCrossFig,
  m2ExamMidsegFig,
  m2ExamMidQuadFig,
} from "../src/ui/examFiguresMath";

// L6 num 등록부: 8(s92)·6(s93)·18(s97)·14(s99)·21(s101)·24(s105)·10(s108), 중복 없음.
export const POOL_M2U5V2_REST_C: ExamItem[] = [
  {
    // [슬롯 93] 검산: AD:AB=6:10=3:5=AE:AC → AC=15 → EC=15−9=6. 전체:부분 혼동 함정.
    id: "m2u5e093", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=6 cm, ${gsym("AB", "seg")}=10 cm, ${gsym("AE", "seg")}=9 cm예요. ${gsym("EC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 61, C: 47, t: 0.6, mode: "para", paraMarks: true,
      labels: { AD: "6 cm", AB: "10 cm", AE: "9 cm", EC: "x cm" },
    }),
    answer: "6", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>주어진 6과 10은 조각과 전체(AD와 AB)예요.<br>① AD:AB=6:10=3:5<br>② 같은 짝인 AE:AC=3:5이므로 9:AC=3:5, AC=15<br>③ x=EC=AC−AE=15−9=<b>6</b> ✓<span class='xh'>계산 실수 격파</span>6:10을 AD:DB로 착각해 9:x=6:10, x=15로 답하는 것이 이 문제의 표적 함정이에요. 10은 아래 조각이 아니라 변 전체 AB예요(조각 DB는 4죠). 조각:조각(AD:DB)에는 AE:EC가, 조각:전체(AD:AB)에는 AE:AC가 짝이라는 원칙을 지키고, 전체를 구했으면 조각으로 내려오는 마지막 뺄셈까지 챙기세요. 검산: 6:10=9:15 ✓, 4:6? 조각비 6:4? 아니고 AD:DB=6:4=3:2=AE:EC=9:6 일치!",
    core: "6과 10이 조각인지 전체인지부터 읽어라!",
  },
  {
    // [슬롯 94] 검산: AD:AB=8:12=2:3 → DE=15×2/3=10.
    id: "m2u5e094", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}일 때, ${gsym("DE", "seg")}의 길이는?`,
    figure: m2ExamTriSplitFig({
      B: 63, C: 48, t: 2 / 3, mode: "para", paraMarks: true,
      labels: { AD: "8 cm", DB: "4 cm", BC: "15 cm", DE: "x cm" },
    }),
    options: ["10 cm", "12 cm", "9 cm", "7.5 cm", "11 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>DE의 길이는 조각:전체 비를 따라요.<br>① AB=8+4=12이므로 AD:AB=8:12=2:3<br>② DE:BC=AD:AB=2:3<br>③ DE=15×2/3=<b>10 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>7.5 cm는 DE:BC에 조각비 AD:DB=2:1을 써서 15÷2로 간 값이에요. DE:BC의 짝은 조각:조각이 아니라 조각:전체(AD:AB)예요. DE는 △ADE와 △ABC의 대응변이라 닮음비를 따르기 때문이죠. 12 cm는 15×4/5처럼 비를 잘못 만든 값, 9 cm와 11 cm는 어림이에요. 선분의 비(AD:DB=AE:EC)와 평행선 자체의 비(DE:BC=AD:AB)를 구분하는 것이 이 레슨의 핵심 문법이에요.",
    core: "DE:BC의 짝은 조각:전체(AD:AB)!",
  },
  {
    // [슬롯 95] 검산: 꼭짓점 반대편 평행(X자), OA:OC=9:6=3:2, OD=12×2/3=8.
    id: "m2u5e095", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}일 때, ${gsym("OD", "seg")}의 길이는?`,
    figure: m2ExamXCrossFig({
      rTop: [9, 6], rSide: [12, 8],
      labels: { OA: "9 cm", OC: "6 cm", OB: "12 cm", OD: "x cm" },
      paraMarks: true,
    }),
    options: ["8 cm", "18 cm", "9 cm", "4 cm", "10 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>꼭짓점 O의 반대편에 평행선이 있는 X자 구도예요. 엇각과 맞꼭지각으로 △OAB∽△OCD죠.<br>① 닮음비: OA:OC=9:6=3:2<br>② OB:OD=3:2이므로 12:x=3:2<br>③ 3x=24, x=<b>8 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>18 cm는 12×3/2으로 방향이 뒤집힌 값이에요. D는 작은 삼각형 쪽이니 OD는 OB보다 짧아야 하죠. 9 cm는 OA를 그대로 옮긴 값, 4 cm는 12−8 같은 어림, 10 cm도 어림이에요. 삼각형 안의 평행선(같은 쪽)이든 꼭짓점 건너편의 평행선(X자)이든, 잘린 비가 같다는 원리는 하나예요. 구도가 달라 보여도 같은 정리라는 것을 눈에 익혀 두세요.",
    core: "같은 쪽이든 X자든 평행선이 자르는 비는 하나!",
  },
  {
    // [슬롯 97] 검산: AD:DB=6:9=2:3 → x=AE: x:12=2:3 → x=8; DE:BC=AD:AB=6:15=2:5 → y=25×2/5=10. x+y=18.
    id: "m2u5e097", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}일 때, <i class='mv'>x</i>+<i class='mv'>y</i>의 값을 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 60, C: 48, t: 0.4, mode: "para", paraMarks: true,
      labels: { AD: "6 cm", DB: "9 cm", AE: "x cm", EC: "12 cm", DE: "y cm", BC: "25 cm" },
    }),
    answer: "18", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 미지수의 짝이 서로 달라요.<br>① x(선분 조각): AD:DB=AE:EC에서 6:9=x:12, x=8<br>② y(평행선): DE:BC=AD:AB에서 y:25=6:15=2:5, y=10<br>③ x+y=8+10=<b>18</b> ✓<span class='xh'>계산 실수 격파</span>y를 구할 때 조각비 2:3을 써서 25×2/3으로 가면 소수가 나오면서 무너져요. DE는 닮음비(조각:전체=2:5)를 따르는 값이라 x와 y의 공식이 달라요. 한 그림에서 두 종류의 비를 골라 쓰는 것이 이 문제의 훈련 목표예요. 검산: x=8이면 8:12=2:3 ✓, y=10이면 10:25=2:5 ✓.",
    core: "조각은 조각비, DE는 닮음비, 두 공식을 갈라 써라!",
  },
  {
    // [슬롯 98] 검산: 조각:조각과 조각:전체를 섞은 AD:DB=AE:AC만 거짓.
    id: "m2u5e098", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}일 때, 옳지 않은 것은?`,
    figure: m2ExamTriSplitFig({
      B: 62, C: 46, t: 0.55, mode: "para", paraMarks: true,
    }),
    options: [
      `${gsym("AD", "seg")}:${gsym("DB", "seg")}=${gsym("AE", "seg")}:${gsym("AC", "seg")}`,
      `${gsym("AD", "seg")}:${gsym("DB", "seg")}=${gsym("AE", "seg")}:${gsym("EC", "seg")}`,
      `${gsym("AD", "seg")}:${gsym("AB", "seg")}=${gsym("AE", "seg")}:${gsym("AC", "seg")}`,
      `${gsym("AD", "seg")}:${gsym("AB", "seg")}=${gsym("DE", "seg")}:${gsym("BC", "seg")}`,
      `${gsym("AE", "seg")}:${gsym("AC", "seg")}=${gsym("DE", "seg")}:${gsym("BC", "seg")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>비의 짝은 층이 맞아야 해요. AD:DB는 조각:조각인데 AE:AC는 조각:전체라서 층이 어긋나요. 예를 들어 AD:DB=1:1(중점)이면 AE:EC도 1:1이지만 AE:AC는 1:2가 되죠. 그래서 <b>AD:DB=AE:AC</b>가 옳지 않아요 ✓<span class='xh'>오답 하나씩 격파</span>나머지는 전부 참이에요. 조각:조각끼리(AD:DB=AE:EC), 조각:전체끼리(AD:AB=AE:AC)는 평행선의 기본 성질이고, DE:BC가 조각:전체 비와 같은 것은 △ADE∽△ABC의 닮음비이기 때문이에요. 다섯 식을 놓고 층(조각인지 전체인지)만 표시해 보면 어긋난 하나가 바로 드러나요.",
    core: "비 판별법: 조각/전체 층 표시부터!",
  },
  {
    // [슬롯 99] 검산: OA:OC=12:8=3:2 → OD=21×2/3=14.
    id: "m2u5e099", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 두 선분 AC, BD가 점 O에서 만나요. ${gsym("OD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamXCrossFig({
      rTop: [12, 8], rSide: [21, 14],
      labels: { OA: "12 cm", OC: "8 cm", OB: "21 cm", OD: "x cm" },
      paraMarks: true,
    }),
    answer: "14", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>X자 구도의 닮음이에요.<br>① 닮음비: OA:OC=12:8=3:2<br>② OB:OD=3:2이므로 21:x=3:2<br>③ 3x=42, x=<b>14</b> ✓<span class='xh'>계산 실수 격파</span>21×3/2=31.5로 답했다면 방향이 뒤집힌 거예요. C와 D가 작은 삼각형 쪽이니 OD는 OB보다 짧아야 해요. 그림의 크기 감각(작은 쪽 값이 정말 작은가)으로 마지막 확인을 하세요. 비의 짝은 언제나 O를 사이에 둔 같은 직선의 두 조각(OA와 OC, OB와 OD)이라는 원칙도 변함없어요. 검산: 12:8=21:14=3:2!",
    core: "X자 역산도 같은 직선 짝으로, 크기 감각 검산!",
  },
  {
    // [슬롯 100] 진술 multi. 검산: 9:3=3:1 → AE:EC=3:1 ✓, DE:BC=9:12=3:4 ✓, DE=½BC X(3:4).
    id: "m2u5e100", lessonId: "m2u5l6", type: "multi",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=9 cm, ${gsym("DB", "seg")}=3 cm예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamTriSplitFig({
      B: 61, C: 49, t: 0.75, mode: "para", paraMarks: true,
      labels: { AD: "9 cm", DB: "3 cm" },
    }),
    options: [
      `${gsym("AE", "seg")}:${gsym("EC", "seg")}=3:1`,
      `${gsym("DE", "seg")}:${gsym("BC", "seg")}=3:4`,
      `${gsym("ADE", "tri")}∽${gsym("ABC", "tri")}`,
      `${gsym("DE", "seg")}=½${gsym("BC", "seg")}`,
      `${gsym("AD", "seg")}:${gsym("DB", "seg")}=${gsym("AE", "seg")}:${gsym("AC", "seg")}`,
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>조각비와 닮음비를 나눠 확인해요.<br>① 조각비: AD:DB=9:3=3:1이므로 AE:EC=3:1 ✓<br>② 닮음비: AD:AB=9:12=3:4이므로 DE:BC=3:4 ✓<br>③ ∠A 공통, 동위각 같음 → △ADE∽△ABC ✓<span class='xh'>오답 하나씩 격파</span>DE=½BC는 D가 중점(AD:DB=1:1)일 때만 성립해요. 지금은 3:1이라 DE는 BC의 ¾이죠. 절반 관계는 다음 레슨(중점연결정리)의 특별한 경우이지 언제나 성립하는 규칙이 아니에요. 마지막 식은 조각:조각과 조각:전체를 섞은 층 어긋남이고요. 3:1과 3:4가 한 그림에서 어떻게 다른 역할을 하는지 정리하고 넘어가세요.",
    core: "½은 중점 전용, 일반 위치는 닮음비로!",
  },
  {
    // [슬롯 101] 검산: AD:DB=10:5=2:1 → AE=14 → AC=14+7=21.
    id: "m2u5e101", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=10 cm, ${gsym("DB", "seg")}=5 cm, ${gsym("EC", "seg")}=7 cm예요. ${gsym("AC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 59, C: 47, t: 2 / 3, mode: "para", paraMarks: true,
      labels: { AD: "10 cm", DB: "5 cm", EC: "7 cm" },
    }),
    answer: "21", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>조각을 구한 뒤 전체로 올라가요.<br>① AD:DB=10:5=2:1이므로 AE:EC=2:1<br>② AE=7×2=14<br>③ x=AC=AE+EC=14+7=<b>21</b> ✓<span class='xh'>계산 실수 격파</span>AE=14에서 멈추면 조각만 구한 거예요. 문제는 변 전체 AC를 물었으니 EC=7을 더하는 마지막 걸음까지 가야 해요. 반대로 AC를 바로 구하겠다고 AD:AB=2:3을 EC에 적용하는 것도 층 혼동이에요. EC는 조각이니 조각비(2:1)의 짝이죠. 조각으로 풀고 전체로 합산, 이 두 단계 리듬을 몸에 붙이세요. 검산: AE:EC=14:7=2:1 ✓, AD:AB=10:15=AE:AC=14:21 ✓.",
    core: "조각으로 계산하고 전체는 합산으로!",
  },
  {
    // [슬롯 103] 검산: 8:12=2:3.
    id: "m2u5e103", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=8 cm, ${gsym("DB", "seg")}=12 cm예요. ${gsym("AE", "seg")}:${gsym("EC", "seg")}를 가장 간단한 자연수의 비로 나타내면?`,
    figure: m2ExamTriSplitFig({
      B: 64, C: 46, t: 0.4, mode: "para", paraMarks: true,
      labels: { AD: "8 cm", DB: "12 cm" },
    }),
    options: ["2:3", "8:12", "3:2", "2:5", "1:2"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행선이 두 변을 같은 비로 자른다는 성질 그대로예요.<br>① AD:DB=8:12<br>② 가장 간단히 줄이면 2:3<br>③ AE:EC=AD:DB=<b>2:3</b> ✓<span class='xh'>오답 하나씩 격파</span>8:12는 줄이기 전이라 조건에 맞지 않고, 3:2는 위아래가 뒤집힌 비예요. AE가 위 조각이니 AD(위 조각)와 같은 자리로 읽어야 해요. 2:5는 조각:전체(8:20)를 줄인 값인데 물어본 것은 조각:조각이에요. 1:2는 어림이죠. 이 문제처럼 계산이 거의 없는 기초 문항일수록 비의 순서(위:아래)와 층(조각:조각)을 정확히 맞추는 습관을 점검하는 것이 출제 의도예요.",
    core: "위는 위끼리 아래는 아래끼리, 끝까지 약분!",
  },
  {
    // [슬롯 104] 검산: 닮음비 AD:AB=9:15=3:5 → 둘레 40×3/5=24.
    id: "m2u5e104", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=9 cm, ${gsym("DB", "seg")}=6 cm예요. ${gsym("ABC", "tri")}의 둘레가 40 cm일 때, ${gsym("ADE", "tri")}의 둘레는?`,
    figure: m2ExamTriSplitFig({
      B: 62, C: 48, t: 0.6, mode: "para", paraMarks: true,
      labels: { AD: "9 cm", DB: "6 cm" },
    }),
    options: ["24 cm", "40 cm", "32 cm", "20 cm", "30 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>DE∥BC이므로 △ADE∽△ABC예요.<br>① 닮음비: AD:AB=9:(9+6)=9:15=3:5<br>② 둘레의 비도 3:5이므로 x:40=3:5<br>③ x=<b>24 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>32 cm는 닮음비를 조각비 AD:DB=3:2로 잘못 잡아 40×4/5처럼 만든 값 계열이에요. 둘레는 닮음의 결과이니 반드시 조각:전체 비(3:5)를 써야 해요. 20 cm는 절반 어림, 30 cm는 3:4 어림이죠. 평행선 구도에서 닮음비가 필요한 순간(DE, 둘레, 넓이)과 조각비면 되는 순간(AE, EC)을 가려내는 것이 이 단원 심화의 전부라 해도 과언이 아니에요.",
    core: "둘레·DE는 닮음 소관, 반드시 조각:전체 비!",
  },
  {
    // [슬롯 105] 검산: OA:OC=8:12=2:3, OD=10×1.5=15, DC=6×1.5=9 → 합 24.
    id: "m2u5e105", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 ${gsym("OA", "seg")}=8 cm, ${gsym("OC", "seg")}=12 cm, ${gsym("OB", "seg")}=10 cm, ${gsym("AB", "seg")}=6 cm예요. ${gsym("OD", "seg")}+${gsym("DC", "seg")}의 값은 몇 cm인지 구하세요.`,
    figure: m2ExamXCrossFig({
      rTop: [8, 12], rSide: [10, 15],
      labels: { OA: "8 cm", OC: "12 cm", OB: "10 cm", AB: "6 cm" },
      paraMarks: true,
    }),
    answer: "24", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>닮음비 하나로 두 변을 연달아 구해요.<br>① △OAB∽△OCD, 닮음비 OA:OC=8:12=2:3<br>② OD=OB×3/2=10×1.5=15<br>③ DC=AB×3/2=6×1.5=9<br>④ OD+DC=15+9=<b>24</b> ✓<span class='xh'>계산 실수 격파</span>DC의 짝을 OC로 착각해 12×무언가로 가면 길을 잃어요. DC의 대응변은 AB(두 삼각형의 밑변끼리)예요. OD의 짝은 OB고요. 대응 세 쌍(OA↔OC, OB↔OD, AB↔DC)을 먼저 표로 정리하고 시작하면 두 단계 계산이 흔들리지 않아요. 묶음 답(합 24)은 둘 다 정확해야 맞는 장치이니 각각 검산하세요: 8:12=10:15=6:9=2:3!",
    core: "대응 세 쌍 표부터: OA↔OC, OB↔OD, AB↔DC!",
  },
  {
    // [슬롯 106] 검산: AD:DB=2:1 → AD:AB=2:3, BC=DE×3/2=12×1.5=18.
    id: "m2u5e106", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}:${gsym("DB", "seg")}=2:1, ${gsym("DE", "seg")}=12 cm예요. ${gsym("BC", "seg")}의 길이는?`,
    figure: m2ExamTriSplitFig({
      B: 60, C: 46, t: 2 / 3, mode: "para", paraMarks: true,
      labels: { DE: "12 cm", BC: "x cm" },
    }),
    options: ["18 cm", "24 cm", "16 cm", "8 cm", "15 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>조각비를 닮음비로 번역하는 것이 관문이에요.<br>① AD:DB=2:1이므로 AD:AB=2:(2+1)=2:3<br>② DE:BC=2:3이므로 12:x=2:3<br>③ x=<b>18 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>24 cm는 조각비 2:1을 DE:BC에 그대로 써서 12×2로 간 값이에요. 이 함정이 이 문제의 심장이죠. DE와 BC는 닮음 대응변이라 조각:전체 비(2:3)를 따라요. 8 cm는 12×2/3으로 방향까지 뒤집힌 값, 16 cm와 15 cm는 어림이에요. '조각비가 m:n이면 닮음비는 m:(m+n)'이라는 번역 공식을 입에 붙이면 이런 심화도 한 줄로 끝나요.",
    core: "번역 공식: 조각 m:n → 닮음 m:(m+n)!",
  },
  {
    // [슬롯 107] X자 진술 multi. 검산: 역방향(비→평행) 참, 맞꼭지각 참, 6:9=2:3 참.
    id: "m2u5e107", lessonId: "m2u5l6", type: "multi",
    prompt: `그림에서 두 선분 AC, BD가 점 O에서 만나고 ${gsym("OA", "seg")}=6 cm, ${gsym("OC", "seg")}=9 cm예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamXCrossFig({
      rTop: [6, 9], rSide: [8, 12],
      labels: { OA: "6 cm", OC: "9 cm" },
    }),
    options: [
      `${gsym("OB", "seg")}:${gsym("OD", "seg")}=2:3이면 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이다`,
      "∠AOB=∠COD이다",
      `${gsym("AB", "seg")}∥${gsym("DC", "seg")}라면 두 삼각형의 닮음비는 2:3이다`,
      `${gsym("AB", "seg")}:${gsym("DC", "seg")}=${gsym("OA", "seg")}:${gsym("OD", "seg")}이다`,
      `${gsym("OAB", "tri")}과 ${gsym("OCD", "tri")}는 항상 닮음이다`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>조건과 결론을 양방향으로 오가요.<br>① O를 낀 두 쌍의 비가 같으면(6:9=8:12=2:3) SAS 닮음이 되어 엇각이 같아지고, 그래서 평행 ✓<br>② 맞꼭지각은 언제나 같음 ✓<br>③ 평행이라면 닮음비는 OA:OC=2:3 ✓<span class='xh'>오답 하나씩 격파</span>AB:DC의 짝은 OA:OC(또는 OB:OD)이지 OA:OD처럼 다른 직선의 조각을 섞으면 안 돼요. 마지막 보기는 함정이에요. 맞꼭지각 하나만으로는 닮음이 안 되고, 비 조건이나 평행 조건이 있어야 닮음이 확정돼요. X자 모양이라고 항상 닮음은 아니라는 것, 조건을 읽는 눈이 이 문제의 표적이에요.",
    core: "X자는 조건이 있어야 닮음, 비⇄평행 양방향!",
  },
  {
    // [슬롯 108] 검산: AD:AB=6:9=2:3 → DE=15×2/3=10.
    id: "m2u5e108", lessonId: "m2u5l6", type: "num",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=6 cm, ${gsym("DB", "seg")}=3 cm, ${gsym("BC", "seg")}=15 cm예요. ${gsym("DE", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 63, C: 47, t: 2 / 3, mode: "para", paraMarks: true,
      labels: { AD: "6 cm", DB: "3 cm", BC: "15 cm", DE: "x cm" },
    }),
    answer: "10", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>DE는 닮음 대응변이니 조각:전체 비로 구해요.<br>① AB=6+3=9이므로 AD:AB=6:9=2:3<br>② DE:BC=2:3이므로 x:15=2:3<br>③ 3x=30, x=<b>10</b> ✓<span class='xh'>계산 실수 격파</span>조각비 6:3=2:1을 써서 x=15×2/1이나 15÷2로 가는 것이 표적 함정이에요. DE:BC의 짝은 언제나 AD:AB(조각:전체)죠. 또 x는 BC보다 짧아야 하니(DE가 위쪽 짧은 선분) 답이 15를 넘으면 그 자리에서 잘못을 알 수 있어요. 검산: 10:15=6:9=2:3 일치!",
    core: "DE는 항상 조각:전체 비, 크기 감각으로 확인!",
  },
  {
    // [슬롯 109] 검산: AD:AB=6:8=3:4 → BC=9×4/3=12.
    id: "m2u5e109", lessonId: "m2u5l6", type: "mcq",
    prompt: `그림에서 ${gsym("DE", "seg")}∥${gsym("BC", "seg")}이고 ${gsym("AD", "seg")}=6 cm, ${gsym("DB", "seg")}=2 cm, ${gsym("DE", "seg")}=9 cm예요. ${gsym("BC", "seg")}의 길이는?`,
    figure: m2ExamTriSplitFig({
      B: 61, C: 48, t: 0.75, mode: "para", paraMarks: true,
      labels: { AD: "6 cm", DB: "2 cm", DE: "9 cm" },
    }),
    options: ["12 cm", "27 cm", "6.75 cm", "16 cm", "10 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>DE에서 BC로 확대하는 방향이에요.<br>① AD:AB=6:8=3:4<br>② DE:BC=3:4이므로 9:x=3:4<br>③ 3x=36, x=<b>12 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>27 cm는 조각비 6:2=3:1을 DE:BC에 써서 9×3으로 간 값이에요. 확대 배율은 조각비가 아니라 조각:전체 비(3:4)에서 나와요. 6.75 cm는 방향까지 뒤집은 값인데 BC는 DE보다 길어야 하니 바로 걸러지죠. 16 cm는 9+7 같은 어림, 10 cm는 한 눈금 어림이에요. 작은 삼각형에서 큰 삼각형으로 올라가는 문제일수록 번역 공식(3:1→3:4)을 먼저 쓰고 시작하세요.",
    core: "확대 방향도 같은 번역 공식으로, 3:1이 아니라 3:4!",
  },

  // ─ L7 삼각형의 중점연결정리 ─
  // L7 num 등록부: 23(s110)·32(s111)·22(s115)·38(s116)·25(s119)·20(s123)·26(s126), 중복 없음.
  {
    // [슬롯 111] 검산: BC=2×MN=2×16=32.
    id: "m2u5e111", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("MN", "seg")}=16 cm일 때, ${gsym("BC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 61, C: 49, ticks: true, paraMarks: true,
      labels: { MN: "16 cm", BC: "x cm" },
    }),
    answer: "32", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리를 거꾸로 써요.<br>① MN=½BC<br>② 16=½x이므로 x=16×2=<b>32</b> ✓<span class='xh'>계산 실수 격파</span>16÷2=8로 답했다면 방향이 뒤집힌 거예요. MN이 절반 쪽이니 BC는 그 2배죠. 그림에서 BC가 아래쪽의 긴 밑변이라는 위치 감각으로도 확인할 수 있어요. 이 정리는 △AMN∽△ABC(닮음비 1:2)의 특별한 경우라서, '절반'과 '2배' 중 어느 쪽을 쓸지는 구하는 변이 작은 삼각형 쪽인지 큰 삼각형 쪽인지로 판단하면 돼요. 검산: 16:32=1:2!",
    core: "역산은 ×2, MN이 절반이고 BC가 원본!",
  },
  {
    // [슬롯 112] 검산: MN∥BC → 동위각 ∠AMN=∠B=64°.
    id: "m2u5e112", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ∠B=64°예요. ∠AMN의 크기는?`,
    figure: m2ExamMidsegFig({
      B: 64, C: 44, ticks: true, paraMarks: true,
    }),
    options: ["64°", "32°", "116°", "58°", "126°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리의 '평행' 쪽을 쓰는 문제예요.<br>① M, N이 중점이므로 MN∥BC<br>② 평행선에서 동위각은 같으므로 ∠AMN=∠B=<b>64°</b> ✓<span class='xh'>오답 하나씩 격파</span>32°는 길이의 절반 규칙을 각에까지 적용한 값이에요. 절반이 되는 것은 길이(MN=½BC)뿐이고, 각은 평행 덕분에 그대로 복사돼요. 116°는 보각(180−64), 58°와 126°는 어림이죠. 중점연결정리가 주는 두 가지 결론(평행, 절반) 중 문제가 어느 쪽을 쓰는지 구분하는 연습이에요. 각을 물으면 평행, 길이를 물으면 절반이에요.",
    core: "각은 평행으로 복사, 절반은 길이 전용!",
  },
  {
    // [슬롯 114] 검산: M 중점+MN∥BC → N도 중점(정리의 역) → AN=½AC=9.
    id: "m2u5e114", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 점 M은 ${gsym("AB", "seg")}의 중점이고 ${gsym("MN", "seg")}∥${gsym("BC", "seg")}예요. ${gsym("AC", "seg")}=18 cm일 때, ${gsym("AN", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({
      B: 62, C: 47, ticks: true, paraMarks: true,
      labels: { AC: "18 cm" },
    }),
    options: ["9 cm", "18 cm", "6 cm", "12 cm", "4.5 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>중점 하나와 평행만으로 나머지 중점이 공짜로 나와요.<br>① M이 중점이고 MN∥BC이면, 평행선이 두 변을 같은 비(1:1)로 자르므로 N도 AC의 중점<br>② AN=½AC=½×18=<b>9 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>6 cm는 1:2로 잘린다고 착각한 값이에요. M이 중점이라는 것이 비를 1:1로 고정해 줘요. 4.5 cm는 ¼로 두 번 줄인 값, 12 cm는 ⅔ 어림이죠. 이 성질은 중점연결정리의 역방향(중점+평행→중점)으로, 정리를 앞뒤로 자유롭게 쓸 수 있는지 확인하는 단골 각도예요. 평행선의 비 성질(앞 레슨)과 중점이 만나는 다리이기도 하죠.",
    core: "중점+평행이면 반대편도 중점(정리의 역)!",
  },
  {
    // [슬롯 116] 검산: PQ=SR=½AC=11, QR=PS=½BD=8 → 둘레 2(11+8)=38.
    id: "m2u5e116", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. ${gsym("AC", "seg")}=22 cm, ${gsym("BD", "seg")}=16 cm일 때, 사각형 PQRS의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamMidQuadFig({
      preset: 1, diag: "both", ticks: true, shade: true,
      labels: { AC: "22 cm", BD: "16 cm" },
    }),
    answer: "38", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 대각선이 각각 두 쌍의 변을 책임져요.<br>① PQ=SR=½AC=11<br>② QR=PS=½BD=8<br>③ 둘레=2×(11+8)=<b>38</b> ✓<br>정리하면 중점 사각형의 둘레는 두 대각선 길이의 합과 같아요.<span class='xh'>계산 실수 격파</span>(22+16)÷2=19로 답하면 절반을 한 번 더 나눈 거예요. 네 변이 각각 대각선의 절반이니 둘레(네 변의 합)는 절반×4, 즉 대각선 합(38) 그대로가 되죠. PQ가 어느 대각선의 절반인지 헷갈리면 △ABC 안에서 중점연결정리를 다시 그려 보세요. P, Q가 AB, BC의 중점이니 PQ는 AC와 짝이에요. 검산: 2×(11+8)=38=22+16!",
    core: "중점 사각형의 둘레 = 두 대각선의 합!",
  },
  {
    // [슬롯 117] 검산: BC=24 → MN=12 → PQ(△AMN의 중점연결)=6.
    id: "m2u5e117", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 ${gsym("ABC", "tri")}의 두 변 AB, AC의 중점이에요. 다시 ${gsym("AMN", "tri")}에서 두 변 AM, AN의 중점을 P, Q라 할 때, ${gsym("BC", "seg")}=24 cm이면 ${gsym("PQ", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({
      B: 60, C: 48, ticks: true, paraMarks: true,
      labels: { BC: "24 cm" },
    }),
    options: ["6 cm", "12 cm", "3 cm", "8 cm", "18 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>같은 정리를 두 번 겹쳐 써요.<br>① △ABC에서: MN=½BC=12<br>② △AMN에서: PQ=½MN=6<br>③ PQ=<b>6 cm</b> ✓<br>결국 PQ=¼BC, 절반의 절반이에요.<span class='xh'>오답 하나씩 격파</span>12 cm는 한 번만 적용하고 멈춘 값(MN)이에요. 문제는 두 번째 삼각형 안의 PQ까지 내려가라고 했죠. 3 cm는 ⅛로 세 번 줄인 값, 8 cm는 ⅓ 어림이에요. 정리를 반복 적용하면 ½, ¼, ⅛로 계속 줄어드는 구조가 보이는데, 이런 '접기 반복' 감각은 종이접기나 프랙털 무늬에서도 그대로 만나요.",
    core: "정리 반복 적용: 절반의 절반은 ¼!",
  },
  {
    // [슬롯 118] 바리뇽 진술 multi. 검산: 평행사변형 항상·PQ=½AC·AC=BD면 마름모 참.
    id: "m2u5e118", lessonId: "m2u5l7", type: "multi",
    prompt: "그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. 옳은 것을 모두 고르세요.",
    figure: m2ExamMidQuadFig({
      preset: 2, diag: "both", ticks: true, shade: true,
    }),
    options: [
      "사각형 PQRS는 항상 평행사변형이다",
      `${gsym("PQ", "seg")}=½${gsym("AC", "seg")}이다`,
      `${gsym("AC", "seg")}=${gsym("BD", "seg")}이면 사각형 PQRS는 마름모가 된다`,
      `${gsym("PQ", "seg")}=½${gsym("BD", "seg")}이다`,
      "사각형 PQRS의 넓이는 사각형 ABCD의 넓이와 같다",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대각선 AC를 그으면 △ABC와 △ACD에서 중점연결정리가 두 번 적용돼요.<br>① PQ∥AC∥SR, PQ=SR=½AC → 한 쌍의 대변이 평행하고 같으니 <b>항상 평행사변형</b> ✓<br>② PQ=½AC ✓<br>③ AC=BD이면 PQ=QR이 되어 네 변이 모두 같아지니 마름모 ✓<span class='xh'>오답 하나씩 격파</span>PQ의 짝은 AC예요. P, Q가 AB, BC의 중점이라 △ABC 안에서 AC와 평행·절반 관계가 생기죠. BD의 절반이 되는 것은 QR과 PS예요. 넓이는 원래 사각형의 절반이 되는 것으로 알려져 있으니 같다는 진술은 틀려요. 아무리 찌그러진 사각형이라도 중점만 이으면 반듯한 평행사변형이 나온다는 것, 이 단원에서 가장 마법 같은 결론이에요.",
    core: "찌그러져도 중점을 이으면 평행사변형, 짝은 같은 삼각형 안에서!",
  },
  {
    // [슬롯 119] 검산: 세 변 12·17·21 둘레 50 → 중점삼각형 둘레 25. 실각 (12,21,17): A≈91°·B≈54°·C≈35°.
    id: "m2u5e119", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N, D는 ${gsym("ABC", "tri")} 세 변의 중점이에요. ${gsym("MND", "tri")}의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 54, C: 35, mode: "three", ticks: true,
      labels: { AB: "12 cm", AC: "17 cm", BC: "21 cm" },
    }),
    answer: "25", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 중점을 이으면 각 변이 마주 보는 변의 절반이 돼요.<br>① 원래 둘레: 12+17+21=50<br>② 중점삼각형의 둘레는 그 절반: 50÷2=<b>25</b> ✓<span class='xh'>계산 실수 격파</span>변마다 6, 8.5, 10.5를 구해 더해도 25가 나오지만, 소수 계산이 끼어들어 실수 여지가 커져요. 세 변이 전부 절반이 되니 둘레도 통째로 절반이라는 성질을 쓰면 나눗셈 한 번으로 끝나죠. 12+17+21을 12+17=29, 29+21=50으로 차분히 더하는 것만 조심하면 돼요. 각 변의 절반이 어느 변과 짝인지(MN↔BC처럼 마주 보는 변) 헷갈려도 둘레 계산에는 영향이 없다는 것도 이 접근의 장점이에요.",
    core: "셋 다 절반이면 둘레도 절반, 통째로 나눠라!",
  },
  {
    // [슬롯 120] 검산: ∠C=180−70−62=48, MN∥BC 동위각 → ∠ANM=∠C=48°.
    id: "m2u5e120", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ∠A=70°, ∠B=62°예요. ∠ANM의 크기는?`,
    figure: m2ExamMidsegFig({
      B: 62, C: 48, ticks: true, paraMarks: true,
    }),
    options: ["48°", "62°", "70°", "55°", "42°"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 단계로 풀어요.<br>① 삼각형 내각의 합: ∠C=180°−70°−62°=48°<br>② MN∥BC이므로 동위각 ∠ANM=∠C=<b>48°</b> ✓<span class='xh'>오답 하나씩 격파</span>62°는 ∠B를 그대로 옮긴 값인데, ∠ANM의 동위각 짝은 같은 쪽인 ∠C예요(∠AMN의 짝이 ∠B죠). N이 AC 위의 점이니 C 쪽 각과 짝이라고 위치로 기억하면 좋아요. 70°는 ∠A를 옮긴 값, 55°와 42°는 어림이에요. 내각의 합으로 빠진 각을 채우고, 평행으로 복사하는 두 동작을 이어 붙이는 전형적인 2단 문제예요.",
    core: "빠진 각은 내각 합으로, 복사는 같은 쪽 동위각으로!",
  },
  {
    // [슬롯 121] 검산: MN=½×28=14.
    id: "m2u5e121", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("BC", "seg")}=28 cm일 때, ${gsym("MN", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({
      B: 63, C: 46, ticks: true, paraMarks: true,
      labels: { BC: "28 cm" },
    }),
    options: ["14 cm", "56 cm", "28 cm", "7 cm", "21 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리 그대로예요.<br>① M, N이 중점(그림의 같은 눈금 표시)<br>② MN=½BC=½×28=<b>14 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>56 cm는 2배를 한 값인데, MN은 위쪽의 짧은 선분이니 원본보다 길어질 수 없어요. 7 cm는 ¼로 두 번 나눈 값, 21 cm는 ¾ 어림이에요. 근거가 궁금하면 △AMN과 △ABC를 보세요. AM:AB=AN:AC=1:2에 ∠A가 공통이니 SAS 닮음이고, 닮음비 1:2에서 절반이 나와요. 정리는 닮음의 특별한 경우라는 연결을 기억하면 공식이 아니라 이해로 남아요.",
    core: "중점연결 = 닮음비 1:2의 특별한 경우!",
  },
  {
    // [슬롯 122] 검산: 중점삼각형 둘레 27 → 원 둘레 54.
    id: "m2u5e122", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N, D는 ${gsym("ABC", "tri")} 세 변의 중점이에요. ${gsym("MND", "tri")}의 둘레가 27 cm일 때, ${gsym("ABC", "tri")}의 둘레는?`,
    figure: m2ExamMidsegFig({
      B: 57, C: 49, mode: "three", ticks: true,
    }),
    options: ["54 cm", "13.5 cm", "27 cm", "81 cm", "40.5 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>절반 관계를 거꾸로 타고 올라가요.<br>① 중점삼각형의 둘레=원래 둘레의 ½<br>② 27=½x이므로 x=<b>54 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>13.5 cm는 절반을 한 번 더 나눈 값이에요. 역산 문제인데 정방향 공식을 또 적용한 거죠. 81 cm는 3배, 40.5 cm는 1.5배로 어림한 값이에요. 어느 쪽이 절반이고 어느 쪽이 원본인지는 그림에서 바로 보여요. 가운데 작은 삼각형이 절반 쪽이니 바깥 큰 삼각형은 2배죠. 역산 유형은 '주어진 것이 절반 쪽인가 원본 쪽인가'를 한 줄 적고 시작하면 방향 실수가 사라져요.",
    core: "역산 첫 줄: 주어진 값이 절반 쪽인지 원본 쪽인지!",
  },
  {
    // [슬롯 123] 검산: 둘레 46 = AC+BD → BD=46−26=20.
    id: "m2u5e123", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. 사각형 PQRS의 둘레가 46 cm이고 ${gsym("AC", "seg")}=26 cm일 때, ${gsym("BD", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m2ExamMidQuadFig({
      preset: 0, diag: "both", ticks: true,
      labels: { AC: "26 cm" },
    }),
    answer: "20", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>중점 사각형의 둘레가 두 대각선의 합과 같다는 성질을 거꾸로 써요.<br>① 둘레=AC+BD<br>② 46=26+BD<br>③ BD=<b>20</b> ✓<span class='xh'>계산 실수 격파</span>46−26을 계산한 뒤 다시 2로 나누거나 2를 곱하고 싶어지는 유혹을 참으세요. 둘레 속에 이미 '절반×4'가 들어 있어서, 둘레와 대각선 합은 1:1로 맞아떨어져요(PQ=SR=½AC로 AC 몫이 26, QR=PS=½BD로 BD 몫이 20). 성질을 유도 과정째 기억하면 역산에서 계수를 붙일지 말지 흔들리지 않아요. 검산: ½×26×2+½×20×2=26+20=46!",
    core: "둘레=대각선 합, 역산은 뺄셈 한 번!",
  },
  {
    // [슬롯 124] 검산: 두 번 접기, 중점삼각형의 중점삼각형 둘레 = 원 둘레의 ¼: 60→15.
    id: "m2u5e124", lessonId: "m2u5l7", type: "mcq",
    prompt: `${gsym("ABC", "tri")}의 세 변의 중점을 이어 ${gsym("MND", "tri")}를 만들고, 다시 ${gsym("MND", "tri")} 세 변의 중점을 이어 새 삼각형을 만들었어요. ${gsym("ABC", "tri")}의 둘레가 60 cm일 때, 새 삼각형의 둘레는?`,
    figure: m2ExamMidsegFig({
      B: 59, C: 47, mode: "three", ticks: true,
    }),
    options: ["15 cm", "30 cm", "20 cm", "7.5 cm", "12 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>절반이 두 번 겹쳐요.<br>① 첫 중점삼각형의 둘레: 60×½=30<br>② 두 번째 중점삼각형의 둘레: 30×½=<b>15 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>30 cm는 한 번에서 멈춘 값이고, 7.5 cm는 세 번 접은 값이에요. 몇 번 접었는지 세는 것이 전부죠. 20 cm는 ⅓로 오해한 값인데, 중점은 언제나 ½이지 ⅓이 아니에요. 이렇게 같은 규칙을 반복하면 60→30→15→7.5로 절반씩 줄어드는 수열이 나와요. 반복 축소의 감각은 프랙털 도형(시에르핀스키 삼각형)이 만들어지는 원리 그 자체랍니다.",
    core: "반복 접기는 ½을 거듭제곱처럼, 횟수만 세라!",
  },
  {
    // [슬롯 125] MS 진술 multi. 검산: MN∥BC·MN=15·닮음 참, ⅓ 거짓, AM=AN 일반 거짓.
    id: "m2u5e125", lessonId: "m2u5l7", type: "multi",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ${gsym("BC", "seg")}=30 cm예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamMidsegFig({
      B: 62, C: 46, ticks: true, paraMarks: true,
      labels: { BC: "30 cm" },
    }),
    options: [
      `${gsym("MN", "seg")}∥${gsym("BC", "seg")}`,
      `${gsym("MN", "seg")}=15 cm`,
      `${gsym("AMN", "tri")}∽${gsym("ABC", "tri")}`,
      `${gsym("MN", "seg")}은 ${gsym("BC", "seg")}의 ⅓이다`,
      `${gsym("AM", "seg")}=${gsym("AN", "seg")}이다`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리의 두 결론과 그 뿌리를 한 번에 확인해요.<br>① MN∥BC ✓<br>② MN=½×30=15 cm ✓<br>③ 뿌리인 닮음: AM:AB=AN:AC=1:2, ∠A 공통으로 SAS 닮음 ✓<span class='xh'>오답 하나씩 격파</span>⅓은 무게중심 단원에서 만날 비율이고 중점연결은 언제나 ½이에요. AM=AN은 AB=AC인 이등변삼각형일 때만 우연히 성립하는 것으로, 중점이라는 조건은 각 변 '안에서' 절반이라는 뜻이지 두 변끼리 같다는 뜻이 아니에요. 조건이 말하는 범위를 넘겨짚지 않는 것도 판별의 기술이에요.",
    core: "중점연결은 ½·평행·닮음 세트, ⅓은 남의 단원!",
  },
  {
    // [슬롯 126] 검산: BC=2×13=26.
    id: "m2u5e126", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("MN", "seg")}=13 cm일 때, ${gsym("BC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 58, C: 50, ticks: true, paraMarks: true,
      labels: { MN: "13 cm", BC: "x cm" },
    }),
    answer: "26", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>절반 관계를 거꾸로 써요.<br>① MN=½BC<br>② 13=½x, x=13×2=<b>26</b> ✓<span class='xh'>계산 실수 격파</span>13÷2=6.5로 가면 방향이 뒤집힌 거예요. 답이 소수로 나오는 순간 방향을 의심해 보는 것도 좋은 습관이에요(이 단원의 답은 대부분 자연수로 설계되니까요). MN은 위쪽 작은 삼각형의 변이고 BC는 바닥의 원본이니, 원본을 구할 때는 2배가 자연스럽죠. 검산: 13:26=1:2로 중점연결정리의 비와 정확히 맞고, MN이 짧고 BC가 긴 그림의 위치 감각과도 일치해요!",
    core: "원본 복원은 ×2, 소수가 나오면 방향 의심!",
  },
  {
    // [슬롯 127] 검산: AC=2×PQ=18, BD=2×QR=14 → AC+BD=32.
    id: "m2u5e127", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이고 ${gsym("PQ", "seg")}=9 cm, ${gsym("QR", "seg")}=7 cm예요. ${gsym("AC", "seg")}+${gsym("BD", "seg")}의 값은?`,
    figure: m2ExamMidQuadFig({
      preset: 1, diag: "both", ticks: true,
      labels: { PQ: "9 cm", QR: "7 cm" },
    }),
    options: ["32 cm", "16 cm", "23 cm", "18 cm", "28 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>변에서 대각선으로 거꾸로 올라가요.<br>① PQ=½AC이므로 AC=2×9=18<br>② QR=½BD이므로 BD=2×7=14<br>③ AC+BD=18+14=<b>32 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>16 cm는 9+7로, 변의 합에서 멈춘 값이에요. 대각선은 각 변의 2배이니 합도 2배가 되죠. 23 cm나 18 cm는 한쪽만 2배 한 값, 28 cm는 14×2로 헷갈린 값이에요. PQ의 짝이 AC(P, Q가 있는 쪽 삼각형의 밑변)이고 QR의 짝이 BD라는 대응만 정확하면, 나머지는 2배 두 번과 덧셈뿐이에요. 검산: 중점 사각형 둘레 2×(9+7)=32=AC+BD로 앞 문제의 성질과도 맞아떨어져요!",
    core: "변→대각선은 ×2, 짝은 같은 삼각형 안에서!",
  },
];
