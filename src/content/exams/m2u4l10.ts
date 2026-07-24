// 중2 수학 Ⅳ. 삼각형과 사각형의 성질: 단원 종합 평가 풀 v2, 레슨 10 평행선과 넓이 (책 179~187쪽)
// (m2u4e181~e200) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 10 + multi 2 + num 8, diff 8/8/4. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("34°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2·§8이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ ▱ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamEqAreaFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U4L10: ExamItem[] = [
  {
    // [슬롯 181] 검산(twin aX=70·dX=180: AD=110 vs BC=144, 시각 구분): l∥m에서 BC 공유+높이 같음 →
    // △DBC만 넓이 같음. △ABD·△ACD는 밑변 AD 기준이라 일반적으로 다름(그림상 참 가드: AD≠BC 뚜렷).
    id: "m2u4e181", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림에서 두 직선 <i class='mv'>l</i>과 <i class='mv'>m</i>은 평행하고, 점 A, D는 <i class='mv'>l</i> 위에, 점 B, C는 <i class='mv'>m</i> 위에 있어요. ${gsym("ABC", "tri")}와 넓이가 항상 같은 삼각형은?`,
    figure: m2ExamEqAreaFig({ mode: "twin", aX: 70, dX: 180 }),
    options: [
      `${gsym("DBC", "tri")}`,
      `${gsym("ABD", "tri")}`,
      `${gsym("ACD", "tri")}`,
      `${gsym("ABD", "tri")}와 ${gsym("ACD", "tri")}`,
      "넓이가 같은 삼각형은 없어요",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>넓이는 밑변과 높이로만 정해져요. △ABC와 △DBC는 밑변 BC를 함께 쓰고, 꼭짓점 A와 D가 모두 직선 l 위에 있으니 높이도 두 평행선 사이의 거리로 같아요. 그래서 모양은 달라도 넓이는 항상 같아요.<span class='xh'>오답 하나씩 격파</span>△ABD와 △ACD는 밑변이 BC가 아니라 l 위의 선분 AD예요. AD와 BC의 길이가 같다는 보장이 없으니 △ABC와 넓이가 같다고 할 수 없어요. 그림에서도 AD가 BC보다 짧게 그려져 있죠. '꼭짓점이 평행선 위를 미끄러져도 넓이는 그대로'라는 이 성질이 평행선과 넓이 단원의 심장이에요.",
    core: "밑변 공유+꼭짓점이 평행선 위 = 넓이 불변!",
  },
  {
    // [슬롯 182] 검산: l∥m·밑변 BC 공유 → △DBC=△ABC=26 ✓(등적 개념 판독 · 값 일치가 곧 개념).
    id: "m2u4e182", lessonId: "m2u4l10", type: "num",
    prompt: `그림에서 두 직선 <i class='mv'>l</i>과 <i class='mv'>m</i>은 평행하고, ${gsym("ABC", "tri")}의 넓이는 26 cm²예요. ${gsym("DBC", "tri")}의 넓이는 몇 cm²인가요? 숫자만 입력하세요.`,
    figure: m2ExamEqAreaFig({ mode: "twin", aX: 70, dX: 180, shade: "ABC", areaLabel: { in: "ABC", label: "26 cm²" } }),
    answer: "26", numKind: "int", unitLabel: "cm²", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>△ABC와 △DBC는 밑변 BC를 공유하고, 꼭짓점 A와 D가 모두 직선 l 위에 있어요. 높이가 두 평행선 사이의 거리로 같으니 넓이도 같아요. 답은 <b>26 cm²</b>.<span class='xh'>계산 실수 격파</span>계산이 없다는 것 자체가 이 단원의 메시지예요. 모양이 완전히 달라 보여도 밑변과 높이라는 두 재료만 같으면 넓이는 같다, 이것이 등적 변형의 전부거든요. A에서 D로 꼭짓점이 평행선을 따라 미끄러져도 넓이 값은 그대로 실려 간다는 그림을 머릿속에 넣어 두세요. 뒤에 나오는 사다리꼴, 경계 펴기 유형이 전부 이 한 장면의 응용이에요.",
    core: "밑변 공유+평행선 위 이동 = 넓이 그대로!",
  },
  {
    // [슬롯 183] 검산: AD∥BC → △ABC=△DBC(밑변 BC 공유·높이 같음). 양쪽에서 공통 △OBC를 빼면
    // △ABO=△DCO ✓. △OBC·△AOD·△ABD·△DBC는 일반적으로 △ABO와 다름.
    id: "m2u4e183", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림처럼 AD∥BC인 사다리꼴 ABCD에서 두 대각선의 교점이 O예요. ${gsym("ABO", "tri")}와 넓이가 항상 같은 삼각형은?`,
    figure: m2ExamEqAreaFig({ mode: "trap", shade: "ABO" }),
    options: [
      `${gsym("DCO", "tri")}`,
      `${gsym("OBC", "tri")}`,
      `${gsym("AOD", "tri")}`,
      `${gsym("DBC", "tri")}`,
      `${gsym("ABD", "tri")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>보이지 않는 큰 삼각형 두 개에서 출발해요.<br>① AD∥BC이니 △ABC와 △DBC는 밑변 BC를 공유하고 높이가 같아 넓이가 같아요<br>② 두 삼각형은 가운데 △OBC를 함께 품고 있어요<br>③ 같은 넓이에서 같은 조각을 빼면 남는 조각도 같아요: △ABO=△ABC−△OBC, △DCO=△DBC−△OBC이므로 <b>△ABO=△DCO</b><span class='xh'>오답 하나씩 격파</span>△OBC나 △AOD는 빼고 남는 공통 조각이거나 반대쪽 조각이라 △ABO와 같을 근거가 없어요. △DBC는 큰 삼각형 전체라 부분인 △ABO보다 당연히 커요. 사다리꼴 대각선 유형은 언제나 '큰 등적 두 개 만들기, 공통 조각 빼기' 두 걸음으로 끝나요.",
    core: "등적 큰 삼각형 두 개에서 공통 조각 빼기!",
  },
  {
    // [슬롯 184] 검산(codex 반영 · 구 "△ABO=14 → △DCO=14" 직복사는 183과 동시 추출 시 즉답 유출):
    // 2단 유도로 재설계 · △DBC=△ABC=30(등적) → △DCO=30−18=12 ✓. 값 복사가 아니라 등적+빼기.
    id: "m2u4e184", lessonId: "m2u4l10", type: "num",
    prompt: `그림처럼 AD∥BC인 사다리꼴 ABCD에서 두 대각선의 교점이 O예요. ${gsym("ABC", "tri")}의 넓이가 30 cm², ${gsym("OBC", "tri")}의 넓이가 18 cm²일 때, ${gsym("DCO", "tri")}의 넓이는 몇 cm²인가요? 숫자만 입력하세요.`,
    figure: m2ExamEqAreaFig({ mode: "trap", shade: "DCO" }),
    answer: "12", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>등적 변형으로 큰 삼각형을 갈아탄 뒤 공통 조각을 빼요.<br>① AD∥BC이니 △DBC와 △ABC는 밑변 BC가 같고 높이가 두 평행선 사이 거리로 같아 넓이가 같아요: △DBC=30 cm²<br>② △DCO=△DBC−△OBC=30−18=<b>12 cm²</b><span class='xh'>계산 실수 격파</span>△DCO를 직접 잴 방법은 없고, 등적으로 값을 아는 큰 삼각형(△DBC)을 만들어 공통 조각을 빼는 우회로가 유일한 길이에요. 30−18을 △ABO의 넓이라고 생각했다면 그것도 맞아요. △ABO=△ABC−△OBC=12라서 양 날개 조각 △ABO와 △DCO가 12 cm²로 같다는 사실까지 한 번에 확인돼요.",
    core: "등적으로 큰 삼각형 갈아타기, 그다음 공통 조각 빼기!",
  },
  {
    // [슬롯 185] 검산: 평사 대각선 AC가 넓이 반분 → △ABC=56÷2=28 ✓.
    id: "m2u4e185", lessonId: "m2u4l10", type: "mcq",
    prompt: "그림처럼 넓이가 56 cm²인 평행사변형 ABCD에 대각선 AC를 그었어요. △ABC의 넓이는?",
    figure: m2ExamEqAreaFig({ mode: "para", diag: "AC", shade: "ABC" }),
    options: ["28 cm²", "56 cm²", "14 cm²", "112 cm²", "24 cm²"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 대각선은 넓이를 정확히 반으로 나눠요.<br>① △ABC와 △CDA는 세 변이 각각 같아(대변 상등+AC 공통) SSS 합동<br>② 합동이면 넓이가 같으니 △ABC=56÷2=<b>28 cm²</b><span class='xh'>오답 하나씩 격파</span>56은 전체를 옮긴 값, 14는 반을 두 번 나눈 값이에요. 대각선 한 개가 반분한다는 사실의 근거가 합동이라는 것까지 연결해 두세요. 반분은 어림이 아니라 증명된 사실이에요. 참고로 다른 대각선 BD를 그어도 똑같이 반분되고, 두 대각선을 모두 그으면 네 조각의 넓이가 전부 같아져요. 다음 단계 유형의 예고편이에요.",
    core: "평사 대각선 = 넓이 반분, 근거는 합동!",
  },
  {
    // [슬롯 186] 검산: 두 대각선 → 4등분(각 삼각형 = ¼): △OAB=68÷4=17 ✓.
    id: "m2u4e186", lessonId: "m2u4l10", type: "num",
    prompt: "그림처럼 넓이가 68 cm²인 평행사변형 ABCD에 두 대각선을 모두 그었어요. 교점을 O라 할 때, △OAB의 넓이는 몇 cm²인가요? 숫자만 입력하세요.",
    figure: m2ExamEqAreaFig({ mode: "para", diag: "both", shade: "ABO" }),
    answer: "17", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 대각선이 평행사변형을 네 조각으로 나누고, 네 조각의 넓이는 전부 같아요.<br>① 대각선 AC가 반분: △ABC=34 cm²<br>② O는 대각선 이등분 성질로 AC의 중점이니, △OAB와 △OBC는 밑변 AO=OC가 같고 높이가 같아 넓이가 같아요<br>③ △OAB=34÷2=<b>17 cm²</b><span class='xh'>계산 실수 격파</span>34에서 멈추면 반분까지만 간 거예요. 4등분의 근거가 '대각선 반분+중점의 등적 분할' 두 단계라는 것을 유도로 기억하세요. 네 조각이 합동은 아니어도(마주 보는 조각끼리만 합동) 넓이는 전부 같다는 것이 포인트예요. 밑변이 같고 높이가 같으면 모양과 무관하게 넓이가 같으니까요.",
    core: "두 대각선 = 4등분, 합동 아니어도 넓이는 같다!",
  },
  {
    // [슬롯 187] 검산(twin+segAD): 정답 △ABC와 △DBC(BC 공유·높이 같음). △ABD·△ACD 쌍은 서로
    // 등적이지만 보기에 함께 넣지 않아 복수 정답 차단(§0 가드).
    id: "m2u4e187", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림에서 두 직선 <i class='mv'>l</i>과 <i class='mv'>m</i>은 평행해요. 다음 중 넓이가 항상 같은 두 삼각형을 짝 지은 것은?`,
    figure: m2ExamEqAreaFig({ mode: "twin", aX: 70, dX: 180, segAD: true }),
    options: [
      `${gsym("ABC", "tri")}와 ${gsym("DBC", "tri")}`,
      `${gsym("ABC", "tri")}와 ${gsym("ABD", "tri")}`,
      `${gsym("DBC", "tri")}와 ${gsym("ABD", "tri")}`,
      `${gsym("ABC", "tri")}와 ${gsym("ACD", "tri")}`,
      "넓이가 같은 짝이 없어요",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>△ABC와 △DBC는 밑변 BC를 함께 쓰고 꼭짓점 A, D가 평행선 l 위에 있어 높이가 같아요. 그래서 <b>넓이가 항상 같아요</b>.<span class='xh'>오답 하나씩 격파</span>△ABD나 △ACD는 밑변이 BC가 아니라 l 위의 선분 AD예요. AD와 BC의 길이가 같다는 보장이 없으니 △ABC와 넓이가 같다고 할 수 없어요. 그림에서도 AD가 BC보다 짧게 그려져 있죠. 등적을 판정하는 기준은 언제나 두 가지, 공유하는 밑변이 있는가와 나머지 꼭짓점들이 그 밑변과 평행한 한 직선 위에 있는가예요. 이 두 질문을 통과한 짝만 등적이에요.",
    core: "등적 판정 질문 둘: 밑변 공유? 꼭짓점이 평행선 위?",
  },
  {
    // [슬롯 188] 검산: DE∥AC → △ACD=△ACE(밑변 AC 공유·높이 같음) → □ABCD=△ABC+△ACD=△ABC+△ACE=△ABE.
    // BE=BC+CE=9+5=14, △ABE=½×14×8=56 ✓. 등적 결론은 문두에서 말하지 않는다(검수 반영,
    // 미리 말하면 발견 스텝이 사라져 삼각형 넓이 계산 문제로 강등). 수치·높이는 그림 라벨(bentLabels).
    id: "m2u4e188", lessonId: "m2u4l10", type: "num",
    prompt: `그림처럼 경계가 꺾인 밭 ABCD가 있어요. 점 D를 지나고 대각선 AC와 평행한 직선이 변 BC의 연장선과 만나는 점이 E예요. ${gsym("BC", "seg")}=9 m, ${gsym("CE", "seg")}=5 m이고 점 A와 직선 BC 사이의 거리가 8 m일 때, 밭 ABCD의 넓이는 몇 m²인가요? 숫자만 입력하세요.`,
    figure: m2ExamEqAreaFig({ mode: "bent", bentLabels: { bc: "9 m", ce: "5 m", height: "8 m" } }),
    answer: "56", numKind: "int", unitLabel: "m²", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>꺾인 경계를 곧게 펴는 열쇠는 등적 변형이에요.<br>① DE∥AC이니 △ACD와 △ACE는 밑변 AC를 공유하고 높이가 같아 넓이가 같아요<br>② □ABCD=△ABC+△ACD=△ABC+△ACE=△ABE, 곧 꺾인 밭과 △ABE의 넓이가 같아요<br>③ BE=BC+CE=9+5=14 m이고 높이는 8 m: 넓이=½×14×8=<b>56 m²</b><span class='xh'>계산 실수 격파</span>이 문제의 심장은 ②를 스스로 세우는 거예요. 넓이가 같다는 말은 문제 어디에도 없고, DE∥AC라는 조건에서 등적 변형을 떠올려야 해요. ½을 빠뜨린 112, BC만 쓴 36, CE를 빼는 16 모두 자주 나오는 실수예요. D를 AC와 평행한 길을 따라 E까지 미끄러뜨린 것이라 넓이가 보존된다는 그림을 머릿속에 그려 보세요.",
    core: "평행 조건을 보면 등적 변형부터 떠올리기, 꺾인 경계는 펴진다!",
  },
  {
    // [슬롯 189] 검산(codex 반영 · 구판은 문두가 '넓이가 같다' 결론을 선언하는 §8-1 스포일러 + 오답
    // ③AD=CE가 그림상 실제 참(아래)이라 이중 결함 → 대상+이유 결합 5지로 재설계). 그림 기하 주의:
    // bent는 A·D가 같은 높이(AD∥BC)라 ACED가 평행사변형 · △ABD·△DCE·△ADE도 실제 등적, AD=CE 참.
    // 오답 "대상"은 넓이가 명백히 다른 △ABC(11648px²)·△ABE(17408px²)만 사용(△ACD=5760px²).
    id: "m2u4e189", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림에서 DE∥AC일 때, ${gsym("ACD", "tri")}와 넓이가 같은 삼각형과 그 이유를 바르게 짝 지은 것은?`,
    figure: m2ExamEqAreaFig({ mode: "bent" }),
    options: [
      `${gsym("ACE", "tri")} : 밑변 AC가 공통이고, DE∥AC라서 높이가 같음`,
      `${gsym("ACE", "tri")} : 두 삼각형이 서로 합동임`,
      `${gsym("ABC", "tri")} : 밑변 AC가 공통임`,
      `${gsym("ABE", "tri")} : DE∥AC라서 높이가 같음`,
      `${gsym("ABC", "tri")} : 대각선 AC가 사각형의 넓이를 반으로 나눔`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>△ACD와 △ACE는 밑변 AC를 공유하고, 나머지 꼭짓점 D와 E가 모두 AC에 평행한 직선 DE 위에 있어요. 평행선 사이의 거리는 일정하니 두 삼각형의 높이가 같고, 밑변과 높이가 모두 같으니 넓이가 같아요. 모양은 달라도 넓이는 같은 거죠.<span class='xh'>오답 하나씩 격파</span>두 삼각형은 모양이 완전히 달라 합동이 아니에요. 넓이가 같다고 합동인 것은 아니거든요. △ABC는 밑변 AC가 공통이어도 B가 직선 DE 위에 있지 않아 높이가 달라요. 밑변 공유만으로는 부족하고, 평행이 높이를 보장해 줘야 해요. △ABE는 △ABC와 △ACE를 합친 큰 삼각형이라 사각형 ABCD 전체와 짝을 이루는 도형이고, 일반 사각형에서는 대각선이 넓이를 반으로 나눈다는 보장도 없어요. 이유는 언제나 '밑변 공유'와 '평행' 두 조각이에요.",
    core: "이유는 언제나 두 조각: 밑변 공유+평행으로 높이 보존!",
  },
  {
    // [슬롯 190] 검산: 평사 대각선 반분 → △ACD=44÷2=22 ✓.
    id: "m2u4e190", lessonId: "m2u4l10", type: "num",
    prompt: "그림처럼 넓이가 44 cm²인 평행사변형 ABCD에 대각선 AC를 그었어요. △ACD의 넓이는 몇 cm²인가요? 숫자만 입력하세요.",
    figure: m2ExamEqAreaFig({ mode: "para", diag: "AC", shade: "ACD" }),
    answer: "22", numKind: "int", unitLabel: "cm²", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행사변형의 대각선은 넓이를 반으로 나눠요.<br>① △ACD=44÷2=<b>22 cm²</b><span class='xh'>계산 실수 격파</span>대각선 AC가 만든 두 삼각형 △ABC와 △CDA는 대변 상등(AB=CD, BC=DA)에 공통변 AC를 더해 SSS 합동이라 넓이가 정확히 같아요. 반분의 근거를 합동으로 말할 수 있으면 이 유형은 끝이에요. 응용으로, 어느 쪽 조각을 묻든 답은 전체의 절반이고, 두 대각선을 모두 그으면 4등분이 된다는 계단도 함께 기억해 두세요. 44÷2를 24로 잘못 계산하는 사소한 실수만 조심하면 돼요.",
    core: "대각선 반분, 근거는 SSS 합동!",
  },
  {
    // [슬롯 191] 검산: twin 판별 · 거짓(정답) = "높이가 다름". 나머지 참(밑변 공유·높이=평행선 거리·등적·모양 무관).
    id: "m2u4e191", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림에서 두 직선 <i class='mv'>l</i>과 <i class='mv'>m</i>은 평행해요. ${gsym("ABC", "tri")}와 ${gsym("DBC", "tri")}에 대한 설명으로 옳지 않은 것은?`,
    figure: m2ExamEqAreaFig({ mode: "twin", aX: 70, dX: 180 }),
    options: [
      "두 삼각형의 높이는 서로 달라요",
      `두 삼각형은 밑변 ${gsym("BC", "seg")}를 공유해요`,
      "두 삼각형의 높이는 두 평행선 사이의 거리와 같아요",
      "두 삼각형의 넓이는 서로 같아요",
      "모양이 달라도 넓이는 같을 수 있어요",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>꼭짓점 A와 D가 모두 직선 l 위에 있고 밑변 BC가 직선 m 위에 있으니, 두 삼각형의 높이는 둘 다 두 평행선 사이의 거리예요. 높이가 서로 다르다는 첫 번째 설명이 <b>옳지 않아요</b>.<span class='xh'>오답 하나씩 격파</span>나머지 넷은 등적 변형의 뼈대 그 자체예요. 밑변을 공유하고, 높이가 평행선 사이 거리로 같고, 그래서 넓이가 같고, 모양이 달라도 넓이는 같을 수 있죠. 삼각형이 기울어져 있으면 높이도 기울어 보인다는 착시가 이 오답의 뿌리인데, 높이는 언제나 밑변에 수직으로 잰 거리라는 정의로 돌아가면 흔들리지 않아요.",
    core: "높이는 수직 거리, 평행선 사이면 어디서나 일정!",
  },
  {
    // [슬롯 192] 검산: trap 진술 · ①△ABC=△DBC 참(등적) ②△ABO=△DCO 참(공통 빼기) ⑤AD∥BC 참(그림 화살표) /
    // ③△ABO=△OBC 거짓 ④△AOD=△ABO 거짓.
    id: "m2u4e192", lessonId: "m2u4l10", type: "multi",
    prompt: "그림처럼 AD∥BC인 사다리꼴 ABCD에서 두 대각선의 교점이 O예요. 옳은 것을 모두 고르세요.",
    figure: m2ExamEqAreaFig({ mode: "trap" }),
    options: [
      `${gsym("ABC", "tri")}와 ${gsym("DBC", "tri")}의 넓이는 같아요`,
      `${gsym("ABO", "tri")}와 ${gsym("DCO", "tri")}의 넓이는 같아요`,
      `${gsym("ABO", "tri")}와 ${gsym("OBC", "tri")}의 넓이는 같아요`,
      `${gsym("AOD", "tri")}와 ${gsym("ABO", "tri")}의 넓이는 같아요`,
      "AD∥BC예요",
    ],
    answer: [0, 1, 4], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>AD∥BC이니 △ABC와 △DBC는 밑변 BC 공유에 높이가 같아 등적이에요. 이 두 삼각형이 공통 조각 △OBC를 품고 있으니, 양쪽에서 빼면 △ABO=△DCO도 성립해요. 평행 표시는 그림의 화살표 그대로예요.<span class='xh'>오답 하나씩 격파</span>△ABO와 △OBC는 밑변을 AO와 OC로 보면 높이가 같지만 AO=OC라는 보장이 없어요. 사다리꼴의 대각선은 서로를 이등분하지 않거든요. △AOD와 △ABO도 마찬가지로 같을 근거가 없어요. 사다리꼴에서 확실한 등적은 '큰 삼각형 두 개'와 '양 날개 조각' 두 쌍뿐이라는 것을 기억하세요.",
    core: "사다리꼴 등적은 큰 둘과 양 날개, 나머지는 근거 없음!",
  },
  {
    // [슬롯 193] 검산(EA split 3:2 실비): 높이 공유 → 넓이 비 = 밑변 비: △ABD=45×3/(3+2)=27 ✓.
    id: "m2u4e193", lessonId: "m2u4l10", type: "num",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 점 D는 ${gsym("BC", "seg")} 위에 있고 ${gsym("BD", "seg")}:${gsym("DC", "seg")}=3:2예요. ${gsym("ABC", "tri")}의 넓이가 45 cm²일 때, ${gsym("ABD", "tri")}의 넓이는 몇 cm²인가요? 숫자만 입력하세요.`,
    figure: m2ExamEqAreaFig({ mode: "split", m: 3, n: 2, shade: "ABD", splitLabels: { bd: "3", dc: "2" } }),
    answer: "27", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>△ABD와 △ADC는 꼭짓점 A가 같아서 높이가 같아요. 높이가 같으면 넓이의 비는 밑변의 비와 같아요.<br>① △ABD:△ADC=BD:DC=3:2<br>② △ABD=45×3/5=<b>27 cm²</b><span class='xh'>계산 실수 격파</span>45÷2=22.5처럼 무조건 반으로 나누면 D가 중점일 때만 맞는 계산이에요. 비례배분의 분모가 3+2=5라는 것, 그리고 이 원리가 성립하는 이유가 '높이 공유'라는 것을 연결해 두세요. 등적 변형(넓이가 같다)과 등고 분할(넓이가 밑변에 비례한다)은 둘 다 높이에 주목하는 한 가족의 기술이에요. 검산: △ADC=18, 27+18=45 ✓",
    core: "높이 공유면 넓이 비 = 밑변 비, 분모는 비의 합!",
  },
  {
    // [슬롯 194] 검산: 새 곧은 경계는 A~E(DE∥AC의 E) · 등적 변형으로 넓이 보존. C·D·B는 넓이 훼손.
    id: "m2u4e194", lessonId: "m2u4l10", type: "mcq",
    prompt: "그림처럼 두 밭 사이의 경계가 A에서 D, C로 꺾여 있어요. 밭 주인들이 넓이를 바꾸지 않으면서 경계를 A에서 시작하는 곧은 선분 하나로 바꾸기로 했어요. 점 D를 지나고 대각선 AC에 평행한 직선이 변 BC의 연장선과 만나는 점을 E라 할 때, 새 경계선으로 알맞은 것은?",
    figure: m2ExamEqAreaFig({ mode: "bent" }),
    options: [
      `${gsym("AE", "seg")}`,
      `${gsym("AC", "seg")}`,
      `${gsym("AB", "seg")}`,
      `${gsym("DC", "seg")}`,
      "어떤 선분으로 바꿔도 넓이가 변하지 않아요",
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>꺾인 경계 A−D−C를 곧게 펴려면 D를 없애면서 넓이를 보존해야 해요. DE∥AC이니 △ACD와 △ACE는 밑변 AC 공유에 높이가 같아 등적이에요. 그래서 경계를 <b>AE</b>로 바꾸면 □ABCD=△ABE가 되어 양쪽 밭의 넓이가 그대로예요.<span class='xh'>오답 하나씩 격파</span>AC로 바꾸면 △ACD만큼 한쪽 밭이 작아져요. AB나 DC는 경계 역할 자체가 어긋나고요. 아무 선분이나 되는 것도 아니에요. 평행선을 따라 D를 E로 미끄러뜨렸기 때문에 넓이가 보존되는 것이지, 평행이 아닌 방향으로 옮기면 넓이가 변해요. 조건 속 평행이 이 문제의 생명줄이에요.",
    core: "경계 펴기 = 평행선 따라 꼭짓점 미끄러뜨리기!",
  },
  {
    // [슬롯 195] 검산(문장 mcq ⑩/10): 등적의 근거 = 평행선 사이 거리 일정 → 높이 불변.
    id: "m2u4e195", lessonId: "m2u4l10", type: "mcq",
    prompt: "평행한 두 직선 사이에서 삼각형의 꼭짓점을 밑변과 평행한 직선을 따라 옮겨도 넓이가 변하지 않는 이유로 가장 알맞은 것은?",
    options: [
      "두 평행선 사이의 거리가 일정해서 높이가 변하지 않기 때문이에요",
      "삼각형의 세 내각의 크기의 합이 180°이기 때문이에요",
      "꼭짓점을 옮기면 밑변의 길이도 함께 변하기 때문이에요",
      "옮기기 전과 후의 삼각형이 서로 합동이기 때문이에요",
      "삼각형의 둘레의 길이가 변하지 않기 때문이에요",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 넓이는 밑변과 높이로만 정해져요. 꼭짓점이 밑변과 평행한 직선 위를 움직이면 밑변은 그대로이고, 높이는 <b>두 평행선 사이의 거리로 일정</b>하니 넓이가 변할 수 없어요.<span class='xh'>오답 하나씩 격파</span>내각의 합은 모든 삼각형의 공통 성질이라 넓이 보존과 무관해요. 밑변은 변하지 않으니 함께 변한다는 설명은 사실과 다르고, 옮긴 삼각형은 모양이 달라져 합동이 아니에요. 둘레도 실제로는 변해요. 오직 '높이 불변' 하나가 이유의 전부라는 것, 그래서 이 단원의 이름이 평행선과 넓이라는 것을 기억하세요.",
    core: "넓이의 재료는 밑변과 높이뿐, 평행이 높이를 지킨다!",
  },
  {
    // [슬롯 196] 검산: BE=11+5=16, △ABE=½×16×h=72?? 세팅: BC=11·CE=5·넓이 72 → h=9 ✓(라벨 11·5와 답 9 분리).
    id: "m2u4e196", lessonId: "m2u4l10", type: "num",
    prompt: `그림처럼 경계가 꺾인 밭 ABCD가 있어요. 점 D를 지나고 대각선 AC와 평행한 직선이 변 BC의 연장선과 만나는 점이 E이고, ${gsym("BC", "seg")}=11 m, ${gsym("CE", "seg")}=5 m예요. 밭 ABCD의 넓이가 72 m²일 때, 점 A와 직선 BC 사이의 거리는 몇 m인가요? 숫자만 입력하세요.`,
    // 물음(높이)도 수선 점선+x m 라벨로 시각 지시(188 문법 · 어디를 묻는지 그림이 보여 준다).
    figure: m2ExamEqAreaFig({ mode: "bent", bentLabels: { bc: "11 m", ce: "5 m", height: "x m" } }),
    answer: "9", numKind: "int", unitLabel: "m", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>경계 펴기로 밭을 삼각형으로 바꾼 뒤 넓이 공식을 거꾸로 써요.<br>① DE∥AC이니 △ACD=△ACE, 그래서 □ABCD=△ABE<br>② △ABE의 밑변 BE=11+5=16 m<br>③ 72=½×16×(높이), 높이=<b>9 m</b><span class='xh'>계산 실수 격파</span>72÷16=4.5로 답하면 ½을 빠뜨린 거예요. 이 문제는 등적 변형(넓이 보존)을 정방향으로 쓴 뒤 넓이 공식을 역방향으로 돌리는 2단 구성이에요. 밑변을 BC=11로만 잡는 실수도 잦은데, 편 뒤의 삼각형 밑변은 E까지 늘어난 BE 전체라는 것을 그림에서 확인하세요.",
    core: "펴서 삼각형으로, 그다음 넓이 공식 역회전!",
  },
  {
    // [슬롯 197] 검산: 등적 판독 · △DBC=32 라벨 → △ABC=32(등적 개념 · 184 관행과 동일 정당성).
    id: "m2u4e197", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림에서 두 직선 <i class='mv'>l</i>과 <i class='mv'>m</i>은 평행하고, ${gsym("DBC", "tri")}의 넓이는 32 cm²예요. ${gsym("ABC", "tri")}의 넓이는?`,
    figure: m2ExamEqAreaFig({ mode: "twin", aX: 70, dX: 180, shade: "DBC", areaLabel: { in: "DBC", label: "32 cm²" } }),
    options: ["32 cm²", "16 cm²", "64 cm²", "30 cm²", "알 수 없어요"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 삼각형은 밑변 BC를 공유하고 꼭짓점 A, D가 평행선 l 위에 있어 높이가 같아요. 넓이는 밑변과 높이로만 정해지니 △ABC=△DBC=<b>32 cm²</b>예요.<span class='xh'>오답 하나씩 격파</span>16이나 64는 반이나 두 배를 할 이유가 없는 값이에요. '알 수 없다'가 매력적으로 보이는 건 A의 정확한 위치를 모르기 때문인데, 등적 변형의 힘이 바로 그거예요. A가 l 위 어디에 있든 넓이는 같으니, 위치를 몰라도 넓이는 확정돼요. 모르는 것(위치)과 아는 것(넓이)을 구분하는 감각이 이 단원의 완성이에요.",
    core: "위치는 몰라도 넓이는 안다, 그것이 등적의 힘!",
  },
  {
    // [슬롯 198] 검산: para diag both · ①반분 참 ②O 중점 등적 참 ③4분 등적 참 / ④⅓ 거짓 ⑤>½ 거짓.
    id: "m2u4e198", lessonId: "m2u4l10", type: "multi",
    prompt: "그림처럼 평행사변형 ABCD에 두 대각선을 모두 그었어요. 교점을 O라 할 때, 옳은 것을 모두 고르세요.",
    figure: m2ExamEqAreaFig({ mode: "para", diag: "both" }),
    options: [
      `${gsym("ABC", "tri")}의 넓이는 평행사변형의 넓이의 절반이에요`,
      `${gsym("OAB", "tri")}와 ${gsym("OBC", "tri")}의 넓이는 같아요`,
      "두 대각선은 평행사변형의 넓이를 4등분해요",
      `${gsym("OAB", "tri")}의 넓이는 평행사변형의 넓이의 3분의 1이에요`,
      `${gsym("ABD", "tri")}의 넓이는 평행사변형의 넓이의 절반보다 커요`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>대각선 하나는 넓이를 반분하고(합동), O는 대각선 이등분 성질로 각 대각선의 중점이라 반쪽 삼각형이 다시 반씩 나뉘어요. 그래서 네 조각은 전부 전체의 4분의 1로 같아요.<span class='xh'>오답 하나씩 격파</span>△OAB가 3분의 1이라는 것은 4등분 구조와 어긋나고, △ABD는 대각선 BD가 만든 반쪽이라 정확히 절반이지 절반보다 크지 않아요. 반분과 4등분의 근거를 각각 합동과 중점 등적 분할로 말할 수 있으면, 평행사변형 넓이 조각 문제는 어떤 변형이 나와도 두 원리의 조합으로 풀려요.",
    core: "대각선 하나는 ½, 둘이면 ¼, 근거는 합동+중점!",
  },
  {
    // [슬롯 199] 검산: 4등분 역산 · △OAB=19 → 전체 = 4×19=76 ✓(76은 L6 102와 파일 간 일치 · 과제 다름 수용).
    id: "m2u4e199", lessonId: "m2u4l10", type: "num",
    prompt: "그림처럼 평행사변형 ABCD에 두 대각선을 모두 그었더니 △OAB의 넓이가 19 cm²였어요. 평행사변형 ABCD의 넓이는 몇 cm²인가요? 숫자만 입력하세요. (점 O는 두 대각선의 교점이에요.)",
    figure: m2ExamEqAreaFig({ mode: "para", diag: "both", shade: "ABO", areaLabel: { in: "ABO", label: "19 cm²" } }),
    answer: "76", numKind: "int", unitLabel: "cm²", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>두 대각선은 평행사변형의 넓이를 4등분해요.<br>① 네 조각의 넓이가 전부 같으니 전체=4×19=<b>76 cm²</b><span class='xh'>계산 실수 격파</span>2×19=38로 답하면 반분(대각선 하나)과 4등분(대각선 둘)을 혼동한 거예요. 그림에 대각선이 몇 개 그어져 있는지부터 세는 습관이 이 유형의 시작이에요. 4등분의 근거는 대각선 반분+중점의 등적 분할이라는 두 단계이고, 역산은 그 구조를 거꾸로 타고 올라가 조각에 4를 곱하는 것뿐이에요. 조각에서 전체로, 전체에서 조각으로 자유롭게 오갈 수 있으면 완성이에요.",
    core: "대각선 개수부터 세기, 둘이면 조각×4!",
  },
  {
    // [슬롯 200] 검산(EA split 2:3): DC:BC=3:5 → △ADC=전체×3/5: 36=전체×3/5 → 전체=60 ✓.
    id: "m2u4e200", lessonId: "m2u4l10", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 점 D는 ${gsym("BC", "seg")} 위에 있고 ${gsym("BD", "seg")}:${gsym("DC", "seg")}=2:3이에요. ${gsym("ADC", "tri")}의 넓이가 36 cm²일 때, ${gsym("ABC", "tri")}의 넓이는?`,
    figure: m2ExamEqAreaFig({ mode: "split", m: 2, n: 3, shade: "ADC", splitLabels: { bd: "2", dc: "3" }, areaLabel: { in: "ADC", label: "36 cm²" } }),
    options: ["60 cm²", "54 cm²", "90 cm²", "24 cm²", "48 cm²"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>높이가 같은 두 조각의 넓이 비는 밑변의 비와 같아요.<br>① △ABD:△ADC=BD:DC=2:3<br>② △ADC는 전체의 3/5이니 36=전체×3/5<br>③ 전체=36×5/3=<b>60 cm²</b><span class='xh'>오답 하나씩 격파</span>54는 36×3/2로 비를 거꾸로 쓴 값이고, 90은 36×5/2로 조각을 잘못 고른 값이에요. 24는 △ABD의 넓이(36×2/3)라 묻는 대상이 아니에요. 역산에서는 주어진 조각이 전체의 몇 분의 몇인지부터 확정하는 것이 순서예요. D가 BC를 2:3으로 나누면 A 쪽에서 본 두 조각도 2:3으로 나뉜다는 등고 분할이 뼈대예요.",
    core: "조각의 몫(3/5) 확정 먼저, 역산은 나누기!",
  },
];
