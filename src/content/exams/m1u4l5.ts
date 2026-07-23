// 중1 수학 Ⅳ. 기본 도형: 단원 종합 평가 풀 v2, 레슨 5 수직 (책 151쪽)
// (m1u4e061~e075) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m1u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 7 + multi 2 + num 6, diff 6/6/3. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("35°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2가 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  mExamAngleFanFig,
  mExamXAnglesFig,
  m4PerpDistanceFig,
  m4ConstructionBisectorFig,
} from "../../ui/examFiguresMath";

export const POOL_M1U4L5: ExamItem[] = [
  {
    // [슬롯 61] 검산: 수선 PH의 발 = H(직각 마크). A·B는 비스듬한 선분의 끝.
    id: "m1u4e061", lessonId: "m1u4l5", type: "mcq",
    prompt: `그림에서 점 P에서 직선 <i class='mv'>l</i>에 수선을 그었을 때, 수선의 발은 어느 점인가요?`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", otherB: "B" }),
    options: ["점 H", "점 A", "점 B", "점 P", "직선 l 위의 모든 점"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>점 P에서 직선 l에 수직으로 내린 직선이 l과 만나는 점을 수선의 발이라 해요. 그림에서 직각 표시(작은 사각형)가 붙은 곳, 곧 <b>점 H</b>가 수선의 발이에요 ✓<span class='xh'>오답 하나씩 격파</span>점 A나 점 B는 P에서 비스듬히 그은 선분이 직선과 만나는 점일 뿐, 수직이 아니라서 수선의 발이 될 수 없어요. 수직인지 아닌지는 직각 표시로 판정해요. 점 P는 수선이 출발한 점이지 직선 l 위의 점이 아니고요. '직선 l 위의 모든 점'이 될 수 없는 이유는, 한 점에서 한 직선에 내릴 수 있는 수선은 단 하나뿐이라 발도 하나로 정해지기 때문이에요. 수선의 발 H까지의 거리 PH가 곧 점과 직선 사이의 거리라는 다음 개념과 바로 이어지니 꼭 붙여 기억하세요.",
    core: "수직으로 내려 만난 점이 수선의 발, 직각 표시로 판정!",
  },
  {
    // [슬롯 62] 검산: 점과 직선 사이 거리 = 수선 PH = 16 cm(그림 라벨). PA=19는 비스듬한 선분(함정).
    id: "m1u4e062", lessonId: "m1u4l5", type: "num",
    prompt: `그림에서 ${gsym("PH", "seg")}⊥<i class='mv'>l</i>이에요. 점 P와 직선 <i class='mv'>l</i> 사이의 거리는 몇 cm인지 구하세요.`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", lens: { ph: "16 cm", pa: "19 cm" } }),
    answer: "16", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>점과 직선 사이의 거리는 그 점에서 직선에 내린 수선의 길이로 정해요.<br>① PH⊥l이므로 PH가 수선<br>② 거리 = PH = <b>16</b> cm ✓<span class='xh'>계산 실수 격파</span>19 cm를 골랐다면 비스듬한 선분 PA를 거리로 쓴 거예요. P에서 l 위의 점까지 잇는 선분은 무수히 많지만, 그중 가장 짧은 것이 수직으로 내린 PH이고, 바로 그 최단 길이를 거리로 약속했어요. 그림에서도 16 cm가 19 cm보다 짧죠? 거리를 물으면 언제나 직각 표시가 붙은 선분부터 찾으세요. 비스듬한 선분의 길이가 아무리 여러 개 주어져도 답은 수선 하나로 정해져요.",
    core: "점과 직선의 거리 = 수선의 길이(가장 짧은 길)!",
  },
  {
    // [슬롯 63] 검산: 세로 AB·가로 CD 직교 그림 · 옳은 표기 AB⊥CD. ∠AOB는 평각(180°)·∠AOC는 90°.
    id: "m1u4e063", lessonId: "m1u4l5", type: "mcq",
    prompt: "그림과 같이 두 직선 AB, CD가 점 O에서 직각으로 만날 때, 두 직선의 관계를 기호로 바르게 나타낸 것은?",
    figure: mExamXAnglesFig({ ends: ["A", "C", "B", "D"], vertex: "O", perp: true }),
    options: [
      `${gsym("AB", "line")}⊥${gsym("CD", "line")}`,
      `${gsym("AB", "line")}∥${gsym("CD", "line")}`,
      `${gsym("AOC", "angle")}=180°`,
      `${gsym("AB", "line")}=${gsym("CD", "line")}`,
      `${gsym("AOB", "angle")}=90°`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>두 직선이 만나서 이루는 각이 직각일 때 두 직선은 서로 수직이라 하고, 기호 ⊥로 나타내요. 그림의 직각 표시가 그 증거니 <b>AB⊥CD</b>가 바른 표기예요 ✓<span class='xh'>오답 하나씩 격파</span>∥는 평행 기호예요. 평행은 만나지 않는 관계인데 두 직선은 O에서 만나고 있으니 정반대의 표기죠. ∠AOC=180°는 사실과 달라요. A와 C 사이의 각은 직각이라 90°예요. AB=CD는 두 직선이 같다는 뜻인데 서로 다른 두 직선이니 거짓이고요. ∠AOB=90°도 함정이에요. A, O, B는 한 직선 위에 나란히 있으니 ∠AOB는 평각 180°죠. 기호 문제는 각 기호가 말하는 문장을 우리말로 번역해 그림과 대조하면 전부 걸러져요. ⊥(수직), ∥(평행), =(같다)의 세 기호를 정확히 구분해 두세요.",
    core: "만나서 직각이면 ⊥! 기호를 문장으로 번역해 검증!",
  },
  {
    // [슬롯 64] 검산: PQ가 AB의 수직이등분선 → 교점 M에서 AM=MB=38÷2=19.
    id: "m1u4e064", lessonId: "m1u4l5", type: "num",
    prompt: `그림에서 직선 PQ는 ${gsym("AB", "seg")}의 수직이등분선이고, ${gsym("AB", "seg")}와 만나는 점을 M이라 해요. ${gsym("AB", "seg")}=38 cm일 때, ${gsym("AM", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m4ConstructionBisectorFig({ a: "A", b: "B", m: "P", n: "Q" }),
    answer: "19", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>수직이등분선은 이름 그대로 두 가지 일을 해요. 선분과 수직으로 만나고(수직), 선분을 절반으로 나눠요(이등분).<br>① M은 AB의 중점이 되므로 AM=MB<br>② AM=38÷2=<b>19</b> ✓<span class='xh'>계산 실수 격파</span>38을 그대로 답하면 '이등분'을 놓친 거예요. 수직이등분선이 지나는 교점은 언제나 선분의 한가운데라는 것이 핵심이죠. 그림의 양쪽 호는 컴퍼스로 같은 거리를 표시한 자국인데, 이 작도가 가능한 이유도 결국 중점을 정확히 찾기 위해서예요. 또 '수직'만 보고 90°라는 각도를 답하는 실수도 있어요. 문제가 길이를 묻는지 각을 묻는지 마지막에 한 번 더 확인하세요. 검산: AM=MB=19, 합 38 ✓",
    core: "수직이등분선의 교점 = 중점, 길이는 절반!",
  },
  {
    // [슬롯 65] 검산: P에서 그은 선분 PH·PA·PB 중 수선 PH가 최단. HA·HB는 P에서 그은 선분이 아님.
    id: "m1u4e065", lessonId: "m1u4l5", type: "mcq",
    prompt: `그림에서 ${gsym("PH", "seg")}⊥<i class='mv'>l</i>이에요. 점 P에서 직선 <i class='mv'>l</i> 위의 점까지 그은 선분 중 길이가 가장 짧은 것은?`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", otherB: "B" }),
    options: [
      `${gsym("PH", "seg")}`,
      `${gsym("PA", "seg")}`,
      `${gsym("PB", "seg")}`,
      `${gsym("HA", "seg")}`,
      `${gsym("HB", "seg")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>점에서 직선까지 잇는 무수한 선분 중 가장 짧은 것은 수직으로 내린 수선이에요.<br>① PH⊥l이므로 PH가 수선<br>② 따라서 <b>PH</b>가 가장 짧아요 ✓ 비스듬히 갈수록 길어지는 것은 그림의 PA, PB가 점점 길어지는 모습으로도 확인돼요.<span class='xh'>오답 하나씩 격파</span>PA와 PB는 비스듬한 선분이라 수선보다 길 수밖에 없어요. 샤워기에서 바닥으로 물이 곧장 떨어지는 길이 가장 짧은 것과 같은 원리죠. HA와 HB는 아예 직선 l 위에 놓인 선분이라 '점 P에서 그은 선분'이라는 조건부터 어긋나요. 보기의 선분이 조건에 맞는 후보인지 먼저 거르는 것도 문제 풀이의 일부예요. 이 최단 성질이 바로 다음 개념, 곧 '점과 직선 사이의 거리=수선의 길이'라는 약속의 근거가 된답니다.",
    core: "가장 짧은 길 = 수직으로 내린 수선!",
  },
  {
    // [슬롯 66] 검산: (x+15)+(2x)=90 → 3x=75 → x=25. 실각 40/50(합 90 ✓).
    id: "m1u4e066", lessonId: "m1u4l5", type: "num",
    prompt: `그림에서 ${gsym("AOD", "angle")}=90°일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: mExamAngleFanFig({
      left: "A", vertex: "O", right: "B",
      rays: [{ deg: 40, label: "C" }, { deg: 90, label: "D" }],
      arcs: [
        { a: 0, b: 40, label: "(x+15)°" },
        { a: 40, b: 90, label: "(2x)°" },
      ],
      perpAt: 90,
    }),
    answer: "25", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>직각 90°가 두 조각으로 나뉜 구도예요.<br>① (x+15)+2x=90<br>② 3x+15=90<br>③ 3x=75, x=<b>25</b> ✓<span class='xh'>계산 실수 격파</span>합을 180으로 세워 x=55가 나왔다면 ∠AOD=90°라는 문두 조건과 그림의 직각 표시를 놓친 거예요. 반직선 OD 왼쪽은 이 문제에서 쓰지 않는 영역이니, 식에 들어갈 전체가 90이라는 것부터 확정하세요. 또 x+15+2x를 2x+15로 묶는 계수 실수, 90−15=85로 쓰는 뺄셈 실수도 단골이에요. 검산: x=25면 두 각은 40°와 50°이고 합이 정확히 90°가 돼요. 그림에서 (2x)° 조각이 살짝 더 넓게 그려진 것도 50°>40°와 맞아떨어지죠. 직각 표시는 언제나 '전체=90'이라는 식의 뼈대 선언이에요.",
    core: "직각 분할은 합 90! 전체부터 확정하고 식 세우기!",
  },
  {
    // [슬롯 67] 검산: 수직이등분선 → 교점 M에서 AM=MB ✓. AM=2MB ✗·PQ∥AB ✗·∠AMP=90(60 ✗)·AB⊥AM ✗(AM은 AB 위).
    id: "m1u4e067", lessonId: "m1u4l5", type: "mcq",
    prompt: `그림에서 직선 PQ는 ${gsym("AB", "seg")}의 수직이등분선이고, ${gsym("AB", "seg")}와 만나는 점을 M이라 해요. 다음 중 항상 옳은 것은?`,
    figure: m4ConstructionBisectorFig({ a: "A", b: "B", m: "P", n: "Q" }),
    options: [
      `${gsym("AM", "seg")}=${gsym("MB", "seg")}`,
      `${gsym("AM", "seg")}=2${gsym("MB", "seg")}`,
      `${gsym("PQ", "line")}∥${gsym("AB", "seg")}`,
      `${gsym("AMP", "angle")}=60°`,
      `${gsym("AB", "seg")}⊥${gsym("AM", "seg")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>수직이등분선은 이름에 성질 두 개가 다 들어 있어요. 선분과 수직으로 만나고(수직), 선분을 절반으로 나눠요(이등분).<br>① 이등분 성질에 따라 교점 M은 AB의 중점<br>② 따라서 <b>AM=MB</b>가 항상 성립해요 ✓<span class='xh'>오답 하나씩 격파</span>AM=2MB는 이등분이 아니라 2:1로 나눈다는 뜻이라 정반대예요. PQ∥AB는 만나지 않는다는 뜻인데 둘은 M에서 만나니 거짓이고요. ∠AMP는 수직 성질에 따라 정확히 90°라서 60°가 아니에요. 마지막으로 AB⊥AM은 함정이에요. AM은 AB의 일부분이라 같은 직선 위에 있으니 수직일 수 없죠. 수직인 짝은 어디까지나 PQ와 AB예요. '수직'과 '이등분'이 각각 어떤 수식으로 번역되는지(∠90°와 AM=MB)를 정확히 연결하는 것이 이 개념의 전부랍니다.",
    core: "이름이 곧 성질: 수직(90°)+이등분(AM=MB)!",
  },
  {
    // [슬롯 68] 검산: H=수선의 발 ✓·PH=거리 ✓·PH⊥l ✓ / PA<PH ✗(수선 최단)·A는 수선의 발 ✗.
    id: "m1u4e068", lessonId: "m1u4l5", type: "multi",
    prompt: `그림에서 ${gsym("PH", "seg")}⊥<i class='mv'>l</i>일 때, 옳은 것을 모두 고르세요.`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A" }),
    options: [
      "점 H는 점 P에서 직선 l에 내린 수선의 발이에요",
      "선분 PH의 길이는 점 P와 직선 l 사이의 거리예요",
      `${gsym("PH", "seg")}⊥${gsym("HA", "seg")}`,
      "선분 PA의 길이는 선분 PH의 길이보다 짧아요",
      "점 A는 점 P에서 직선 l에 내린 수선의 발이에요",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>용어를 그림에 대응시켜요.<br>① P에서 l에 수직으로 내린 직선이 l과 만나는 점이 수선의 발, 곧 H ✓<br>② 그 수선의 길이 PH가 점과 직선 사이의 거리 ✓<br>③ HA는 직선 l 위의 선분이니 PH⊥l에서 PH⊥HA도 성립 ✓<span class='xh'>오답 하나씩 격파</span>PA가 PH보다 짧다는 것은 수선의 최단 성질과 정반대예요. 비스듬한 선분은 언제나 수선보다 길죠. 점 A는 비스듬한 선분 PA가 직선과 만나는 점일 뿐, 직각 표시가 없으니 수선의 발이 아니에요. 수선의 발인지 아닌지는 오직 직각 표시로 판정한다는 것, 그리고 '수선', '수선의 발', '거리'라는 세 용어가 각각 선, 점, 길이를 가리킨다는 것을 구분해 두면 이 단원 용어 문제는 전부 정리돼요.",
    core: "수선=선, 발=점, 거리=길이! 판정은 직각 표시로!",
  },
  {
    // [슬롯 69] 검산: 거리 = 수선 PH = 15(그림 라벨). PA 17·PB 20은 비스듬한 선분(함정).
    id: "m1u4e069", lessonId: "m1u4l5", type: "num",
    prompt: `그림에서 ${gsym("PH", "seg")}⊥<i class='mv'>l</i>이에요. 점 P와 직선 <i class='mv'>l</i> 사이의 거리는 몇 cm인지 구하세요.`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", otherB: "B", lens: { ph: "15 cm", pa: "17 cm", pb: "20 cm" } }),
    answer: "15", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>점과 직선 사이의 거리는 수선의 길이 하나로 정해져요.<br>① PH⊥l이므로 수선은 PH<br>② 거리 = PH = <b>15</b> cm ✓<span class='xh'>계산 실수 격파</span>17이나 20을 골랐다면 비스듬한 선분 PA, PB의 길이를 거리로 쓴 거예요. P에서 직선까지 잇는 선분은 무수히 많지만 거리는 그중 가장 짧은 수선의 길이로 약속했어요. 그림에서도 15가 세 값 중 가장 작죠? 이 대소 관계 자체가 훌륭한 검산이에요. 만약 수선이라고 찾은 선분의 길이가 다른 선분보다 길게 적혀 있다면 직각 표시를 잘못 짚었다는 신호예요. 여러 길이가 한꺼번에 주어지는 문제일수록 '직각 표시가 붙은 선분 딱 하나'만 골라내는 눈이 흔들리지 않아야 해요.",
    core: "거리 = 직각 표시 붙은 선분! 가장 작은 값인지 검산!",
  },
  {
    // [슬롯 70] 무그림 ①(일반 진술 판별) · 문장 mcq 4슬롯 중 2번째(23·70·116·144 한정).
    id: "m1u4e070", lessonId: "m1u4l5", type: "mcq",
    prompt: "수직과 거리에 대한 설명으로 옳지 <u>않은</u> 것은?",
    options: [
      "한 점에서 직선에 내릴 수 있는 수선은 하나뿐이에요",
      "점과 직선 사이의 거리는 그 점에서 수선의 발까지의 거리예요",
      "수선의 발은 수선과 직선이 만나는 점이에요",
      "점에서 직선 위의 점까지 그은 선분 중 가장 긴 선분의 길이가 그 점과 직선 사이의 거리예요",
      "두 직선이 만나서 이루는 각이 직각이면 두 직선은 서로 수직이에요",
    ],
    answer: 3, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>거리는 '가장 긴'이 아니라 <b>가장 짧은</b> 선분의 길이로 정해요. 점에서 직선으로 비스듬히 그을수록 선분은 끝없이 길어질 수 있어서, 가장 긴 선분이라는 것 자체가 존재하지 않죠. 그래서 넷째 문장이 옳지 않아요 ✓<span class='xh'>오답 하나씩 격파</span>나머지는 모두 참이에요. 한 점에서 한 직선에 내리는 수선은 단 하나로 정해지고, 그 수선이 직선과 만나는 점이 수선의 발이며, 점에서 발까지의 길이가 곧 거리예요. 직각으로 만나는 두 직선을 수직이라 부르는 것도 정의 그대로고요. 판별 문제에서 '가장 긴/가장 짧은', '하나뿐/무수히'처럼 극단을 말하는 단어는 반드시 멈춰 서서 검문해야 할 검색어예요. 뜻을 뒤집어 넣는 것이 출제자의 단골 수법이거든요.",
    core: "거리 = 최단! '가장 긴'이 보이면 즉시 검문!",
  },
  {
    // [슬롯 71] 검산: AB⊥CD → 네 각 모두 90°, ∠AOD=90.
    id: "m1u4e071", lessonId: "m1u4l5", type: "mcq",
    prompt: `그림에서 ${gsym("AB", "line")}⊥${gsym("CD", "line")}일 때, ${gsym("AOD", "angle")}의 크기는?`,
    figure: mExamXAnglesFig({ ends: ["A", "C", "B", "D"], vertex: "O", perp: true }),
    options: ["90°", "45°", "180°", "60°", "120°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>수직인 두 직선이 만드는 네 각은 전부 직각이에요.<br>① AB⊥CD이므로 한 각이 90°<br>② 이웃각은 180−90=90°, 맞꼭지각도 90°<br>③ 따라서 ∠AOD=<b>90°</b> ✓<span class='xh'>오답 하나씩 격파</span>45°는 직각의 절반으로, 수직을 '반씩 나눈 각'과 혼동한 값이에요. 180°는 ∠AOB처럼 한 직선 위의 평각을 읽은 것이고요. A와 D가 서로 다른 직선의 끝이라는 것을 그림에서 확인하면 걸러져요. 60°와 120°는 수직과 무관한 값이에요. 이 문제의 핵심은 직각 하나가 확정되는 순간 나머지 세 각도 자동으로 90°가 된다는 연쇄예요. 이웃각의 합 180°와 맞꼭지각의 같음이라는 앞 레슨의 두 성질이 수직이라는 특별한 상황에서 '네 각 모두 90°'라는 간결한 결론으로 합쳐지는 장면이랍니다.",
    core: "수직이면 네 각 전부 90°! 하나가 셋을 결정!",
  },
  {
    // [슬롯 72] 검산: x+90+(2x+6)=180 → 3x+96=180 → 3x=84 → x=28. 실각 28/90/62(합 180 ✓).
    id: "m1u4e072", lessonId: "m1u4l5", type: "num",
    prompt: `그림에서 ${gsym("AOB", "angle")}는 평각이고 ${gsym("COD", "angle")}=90°일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: mExamAngleFanFig({
      left: "A", vertex: "O", right: "B",
      rays: [{ deg: 28, label: "C" }, { deg: 118, label: "D" }],
      arcs: [
        { a: 0, b: 28, label: "x°" },
        { a: 118, b: 180, label: "(2x+6)°" },
      ],
      perpAt: 28,
    }),
    answer: "28", numKind: "int", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>평각이 세 조각(x°, 직각, (2x+6)°)으로 나뉘었어요.<br>① x+90+(2x+6)=180<br>② 3x+96=180<br>③ 3x=84, x=<b>28</b> ✓<span class='xh'>계산 실수 격파</span>직각 90을 식에서 빠뜨리고 x+(2x+6)=180으로 세우면 x=58이 되는데, 그림의 직각 표시가 평각의 한가운데 조각을 차지하고 있으니 반드시 식에 넣어야 해요. 또 상수 정리에서 90+6=96을 86으로 쓰는 실수, 84÷3을 27이나 29로 어림하는 실수도 잦아요. 3×28=84로 곱셈 검산을 하세요. 최종 검산: x=28이면 세 조각은 28°, 90°, 62°이고 합이 정확히 180°예요. 수직 조건이 방정식 속 상수 90으로 변신해 들어온다는 것, 이 단원 계산 문제의 공통 구조예요.",
    core: "⊥와 직각 표시는 식 속의 90! 빠뜨리면 바로 오답!",
  },
  {
    // [슬롯 73] 검산: 수선은 최단 · PA=14·PB=16이면 PH<14. 보기 중 가능한 값은 13뿐.
    id: "m1u4e073", lessonId: "m1u4l5", type: "mcq",
    prompt: `그림에서 ${gsym("PH", "seg")}⊥<i class='mv'>l</i>이에요. 선분 PH의 길이가 될 수 있는 것은?`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", otherB: "B", lens: { pa: "14 cm", pb: "16 cm" } }),
    options: ["13 cm", "14 cm", "15 cm", "16 cm", "17 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>수선의 최단 성질을 부등식으로 바꾸는 문제예요.<br>① PH는 P에서 직선 l까지의 수선이므로 어떤 비스듬한 선분보다 짧아요<br>② PA=14 cm보다 짧아야 하므로 PH<14<br>③ 보기 중 14보다 작은 값은 <b>13 cm</b>뿐 ✓<span class='xh'>오답 하나씩 격파</span>14 cm는 PA와 같은 길이인데, 수선은 비스듬한 선분과 같아질 수 없어요. 만약 같다면 P에서 같은 거리의 최단 경로가 두 개라는 뜻이 되어 수선이 하나뿐이라는 성질과 모순이죠. 15, 16, 17 cm는 모두 PA보다 길어서 더더욱 불가능해요. 수선이 가장 짧다는 성질은 '길이를 재는' 문제뿐 아니라 이렇게 '가능한 범위를 좁히는' 문제로도 출제돼요. 조건 PB=16은 PH<16이라는 더 느슨한 울타리라 답을 좁히는 데는 PA=14가 결정적이라는 것까지 읽으면 완벽해요.",
    core: "수선 최단을 부등식으로! PH < 비스듬한 어떤 선분!",
  },
  {
    // [슬롯 74] 검산: 수직이등분선 위의 점은 양 끝점에서 같은 거리 · PA=PB ✓·QA=QB ✓·일반 진술 ✓ /
    //  PA=PM ✗·AB=2PM ✗(근거 없음).
    id: "m1u4e074", lessonId: "m1u4l5", type: "multi",
    prompt: `그림에서 직선 PQ는 ${gsym("AB", "seg")}의 수직이등분선이고, ${gsym("AB", "seg")}와 만나는 점을 M이라 해요. 옳은 것을 모두 고르세요.`,
    figure: m4ConstructionBisectorFig({ a: "A", b: "B", m: "P", n: "Q" }),
    options: [
      `${gsym("PA", "seg")}=${gsym("PB", "seg")}`,
      `${gsym("QA", "seg")}=${gsym("QB", "seg")}`,
      "직선 PQ 위의 어느 점에서나 두 점 A, B까지의 거리는 서로 같아요",
      `${gsym("PA", "seg")}=${gsym("PM", "seg")}`,
      `${gsym("AB", "seg")}=2${gsym("PM", "seg")}`,
    ],
    answer: [0, 1, 2], diff: 3,
    explain: "<span class='xh'>정답 풀이</span>수직이등분선 위의 점이 갖는 특별한 성질을 확인해요.<br>① P는 수직이등분선 위의 점이라 A, B에서 같은 거리에 있어요: PA=PB ✓<br>② Q도 마찬가지: QA=QB ✓<br>③ 이 성질은 직선 PQ 위의 어느 점에서나 성립해요 ✓ 그림의 양쪽 원호가 컴퍼스로 같은 거리를 표시한 자국이라는 것이 그 증거죠.<span class='xh'>오답 하나씩 격파</span>PA=PM은 빗변과 다리를 같다고 한 셈이라 거짓이에요. P에서 A까지는 비스듬히, M까지는 곧장 내려가니 PA가 더 길죠. AB=2PM도 AB와 PM은 서로 다른 방향의 길이라 2배라는 근거가 어디에도 없어요. 참인 관계는 AB=2AM이에요. 수직이등분선 문제에서 '같아지는 짝'은 선분의 양 끝점 A, B로 가는 두 거리라는 것, 이 방향 감각이 심화 문제의 나침반이 돼요.",
    core: "수직이등분선 위의 점 → 양 끝까지 같은 거리!",
  },
  {
    // [슬롯 75] 검산: 거리 = 수선 PH = 21(그림 라벨 판독). §4 예시 14는 73과 소재 충돌이라 21로 조정.
    id: "m1u4e075", lessonId: "m1u4l5", type: "num",
    prompt: `그림에서 ${gsym("PH", "seg")}⊥<i class='mv'>l</i>이에요. 점 P와 직선 <i class='mv'>l</i> 사이의 거리는 몇 cm인지 구하세요.`,
    figure: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", lens: { ph: "21 cm", pa: "24 cm" } }),
    answer: "21", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>점과 직선 사이의 거리는 수선의 길이예요.<br>① 직각 표시가 붙은 PH가 수선<br>② 거리 = PH = <b>21</b> cm ✓<span class='xh'>계산 실수 격파</span>24 cm를 골랐다면 비스듬한 선분 PA를 거리로 읽은 거예요. 그림에 길이가 두 개 이상 적혀 있을 때 거리를 묻는 문제의 답은 언제나 직각 표시가 붙은 쪽 하나예요. 나머지 값은 '수선이 비스듬한 선분보다 짧다'는 것을 확인시켜 주는 비교용 장치일 뿐이죠. 실제로 21<24라는 대소 관계가 성질과 맞아떨어지는지 확인하는 것이 이 문제의 검산이에요. 앞으로 어떤 도형 문제에서든 '거리'라는 말이 나오면 자동으로 수직 기호와 직각 표시부터 찾는 반사 신경을 길러 두세요. 그 습관 하나가 거리 문제 전부를 지켜 줘요.",
    core: "거리를 물으면 직각 표시부터! 비교값에 속지 않기!",
  },
];
