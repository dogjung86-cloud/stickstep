// m2u5 v2 확장분 B: L4~L5 비파일럿 슬롯(설계표 순번, id=슬롯). 규칙은 rest-a 헤더와 동일.
import type { ExamItem } from "../src/content/exams/types";
import { gsym } from "../src/ui/geoKit";
import {
  m2ExamTriPairFig,
  m2ExamTriSplitFig,
  m2ExamXCrossFig,
  m2ExamRightAltFig,
} from "../src/ui/examFiguresMath";

// L4 num 등록부: 24(s58)·10(s61)·33(s64)·12(s66)·7(s69)·9(s72)·120(s73), 중복 없음.
export const POOL_M2U5V2_REST_B: ExamItem[] = [
  {
    // [슬롯 56] 검산: 6:9=8:12=2:3 두 쌍 + 끼인각 ∠B=∠E(●) → SAS. 실각: sinC/sinA=6/8 → B=65·A=70·C=45.
    id: "m2u5e056", lessonId: "m2u5l4", type: "mcq",
    prompt: "그림의 두 삼각형에서 ∠B=∠E일 때, 두 삼각형이 서로 닮은 도형임을 보이는 데 이용되는 닮음 조건은?",
    figure: m2ExamTriPairFig({
      B1: 65, C1: 45, ratio: 1.5,
      labels1: { B: "●" }, labels2: { B: "●" },
      sides1: { AB: "6 cm", BC: "8 cm" }, sides2: { AB: "9 cm", BC: "12 cm" },
      names2: ["D", "E", "F"],
    }),
    options: ["SAS 닮음", "SSS 닮음", "AA 닮음", "SAS 합동", "알 수 없다"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>주어진 정보를 세어 봐요. 변 두 쌍과 각 한 쌍이에요.<br>① AB:DE=6:9=2:3, BC:EF=8:12=2:3<br>② 같은 각 ∠B=∠E는 두 변 AB, BC 사이의 끼인각<br>③ 두 쌍의 변의 비가 같고 끼인각이 같으니 <b>SAS 닮음</b> ✓<span class='xh'>오답 하나씩 격파</span>SSS 닮음은 세 쌍의 변이 모두 필요한데 셋째 변의 길이는 주어지지 않았어요. AA 닮음은 두 쌍의 각이 필요한데 각은 한 쌍뿐이죠. SAS 합동은 대응변의 길이가 각각 같아야 하는데 여기는 1.5배 차이니 닮음이에요. 정보의 개수와 종류를 세는 것만으로 조건의 이름이 결정된다는 것, 그리고 각이 반드시 두 변 '사이'에 있어야 SAS라는 것을 함께 기억하세요.",
    core: "변 2쌍 비+끼인각 = SAS 닮음, 정보 개수로 판별!",
  },
  {
    // [슬롯 57] 검산: ∠A=71°·∠B=58° 두 쌍 → AA. 실각 C=51.
    id: "m2u5e057", lessonId: "m2u5l4", type: "mcq",
    prompt: "그림의 두 삼각형이 서로 닮은 도형임을 보이는 데 이용되는 닮음 조건은?",
    figure: m2ExamTriPairFig({
      B1: 58, C1: 51, ratio: 1.4, rot2: 35,
      labels1: { A: "71°", B: "58°" }, labels2: { A: "71°", B: "58°" },
      names2: ["D", "E", "F"],
    }),
    options: ["AA 닮음", "SAS 닮음", "SSS 닮음", "ASA 합동", "닮음이 아니다"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>주어진 정보는 각 두 쌍뿐이에요.<br>① ∠A=∠D=71°<br>② ∠B=∠E=58°<br>③ 두 쌍의 대응각이 각각 같으니 <b>AA 닮음</b> ✓<br>변의 길이 정보가 하나도 없어도 모양이 같다는 것은 확정돼요.<span class='xh'>오답 하나씩 격파</span>SAS와 SSS는 변의 비 정보가 필요한데 이 그림엔 변 길이가 없어요. ASA 합동은 두 각과 그 사이 변의 길이까지 같아야 하는데, 크기가 다른 두 삼각형이니 합동일 수 없죠. 각 두 쌍이 같으면 셋째 각도 자동으로 같아지는(내각 합 180°) 것이 AA의 힘이에요. 삼각형의 모양은 각 두 개면 완전히 결정된답니다.",
    core: "각 두 쌍이면 끝, 셋째 각은 공짜(AA)!",
  },
  {
    // [슬롯 59] 무그림(화이트리스트 ③ 수 나열 판정). 검산: (3,5,6)×2=(6,10,12)만 일치.
    id: "m2u5e059", lessonId: "m2u5l4", type: "mcq",
    prompt: "세 변의 길이가 각각 다음과 같은 두 삼각형이 서로 닮은 도형인 것은?",
    options: [
      "3, 5, 6과 6, 10, 12",
      "3, 5, 6과 5, 7, 8",
      "4, 5, 8과 8, 10, 12",
      "3, 4, 6과 9, 12, 15",
      "2, 5, 6과 6, 15, 12",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>세 쌍의 변의 길이의 비가 모두 같은지 확인해요(SSS 닮음).<br>① 3:6=1:2<br>② 5:10=1:2<br>③ 6:12=1:2<br>세 비가 모두 1:2로 같으니 <b>닮음</b> ✓<span class='xh'>오답 하나씩 격파</span>5, 7, 8은 3, 5, 6과 아무 비도 맞지 않아요. 4:8, 5:10은 1:2인데 8:12는 2:3이라 마지막에서 어긋나고, 3:9, 4:12는 1:3인데 6:15는 2:5라 역시 어긋나요. 2:6, 5:15는 1:3인데 6:12는 1:2로 마지막이 함정이죠. 두 쌍까지 맞다가 셋째에서 깨지는 세트가 단골 함정이니, 반드시 세 쌍을 끝까지 확인해야 해요. 큰 세트의 순서가 크기순이 아닐 수도 있으니 작은 변끼리, 큰 변끼리 짝지어 재는 것도 요령이에요.",
    core: "SSS 판정은 세 쌍 전부, 두 쌍에서 멈추면 함정!",
  },
  {
    // [슬롯 61] 검산: AA(각 ● 두 쌍) → BC:EF=9:15=3:5 → x=6×5/3=10. 실각 sinC/sinA=6/9 → A=76·C=40·B=64.
    id: "m2u5e061", lessonId: "m2u5l4", type: "num",
    prompt: "그림의 두 삼각형에서 ∠A=∠D, ∠B=∠E일 때, <i class='mv'>x</i>의 값을 구하세요.",
    figure: m2ExamTriPairFig({
      B1: 64, C1: 40, ratio: 5 / 3,
      labels1: { A: "●", B: "◎" }, labels2: { A: "●", B: "◎" },
      sides1: { AB: "6 cm", BC: "9 cm" }, sides2: { AB: "x cm", BC: "15 cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "10", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>각 두 쌍이 같으니 AA 닮음이에요.<br>① BC:EF=9:15=3:5로 닮음비 확정<br>② AB:DE=3:5이므로 6:x=3:5<br>③ 3x=30, x=<b>10</b> ✓<span class='xh'>계산 실수 격파</span>6×3÷5=3.6은 방향이 뒤집힌 값이에요. DEF가 큰 삼각형이니 x는 6보다 커야 하죠. 또 9와 15의 차 6을 x=6+6=12로 옮기는 덧셈식 사고도 조심하세요. 닮음은 배율의 관계라 반드시 비로 풀어야 해요. AA로 닮음을 확정한 뒤에는 어느 대응변 쌍이든 같은 비라는 사실이 계산의 근거가 돼요. 검산: 6:10=9:15=3:5!",
    core: "AA로 확정, 값 있는 쌍으로 비를 재서 적용!",
  },
  {
    // [슬롯 62] 검산: 조건 = 두 쌍 비+끼인각(SAS) → 대응은 A↔D·B↔E·C↔F.
    id: "m2u5e062", lessonId: "m2u5l4", type: "mcq",
    prompt: `그림의 두 삼각형에서 ${gsym("AB", "seg")}:${gsym("DE", "seg")}=${gsym("BC", "seg")}:${gsym("EF", "seg")}이고 ∠B=∠E예요. ${gsym("ABC", "tri")}와 닮은 삼각형을 기호로 바르게 나타낸 것은?`,
    figure: m2ExamTriPairFig({
      B1: 61, C1: 43, ratio: 1.5, flip2: true,
      labels1: { B: "●" }, labels2: { B: "●" },
      names2: ["D", "E", "F"],
    }),
    options: [
      `${gsym("DEF", "tri")}`,
      `${gsym("DFE", "tri")}`,
      `${gsym("EDF", "tri")}`,
      `${gsym("FED", "tri")}`,
      "닮은 삼각형이 없다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>조건을 해석하면 대응이 나와요.<br>① AB↔DE, BC↔EF가 같은 비<br>② 끼인각 ∠B=∠E<br>③ SAS 닮음이고, 대응은 A↔D, B↔E, C↔F<br>④ 따라서 △ABC∽<b>△DEF</b> ✓<span class='xh'>오답 하나씩 격파</span>그림이 뒤집혀 있어서 위치로 짝을 찾으면 DFE나 FED처럼 순서가 어긋나요. 대응의 근거는 그림이 아니라 조건식이에요. AB:DE라고 쓰인 순간 A↔D, B↔E가 이미 정해진 거죠. 기호 순서는 채점 대상이 되는 약속이라, 닮음은 맞혔는데 순서로 틀리는 것이 이 유형의 대표 실점이에요. 조건식의 글자 짝을 그대로 옮겨 적는 습관을 들이세요.",
    core: "대응은 조건식의 글자 짝에서, 그림 방향은 무시!",
  },
  {
    // [슬롯 63] 조건 보완 multi. 검산: 끼인각 ∠B=∠E(SAS)·CA:FD 동비(SSS)만 유효, ∠A·∠C는 비끼인각(SSA).
    id: "m2u5e063", lessonId: "m2u5l4", type: "multi",
    prompt: `${gsym("ABC", "tri")}와 ${gsym("DEF", "tri")}에서 ${gsym("AB", "seg")}:${gsym("DE", "seg")}=${gsym("BC", "seg")}:${gsym("EF", "seg")}=2:3이에요. 두 삼각형이 서로 닮은 도형이 되기 위해 더 필요한 조건으로 알맞은 것을 모두 고르세요.`,
    options: [
      "∠B=∠E",
      `${gsym("CA", "seg")}:${gsym("FD", "seg")}=2:3`,
      "∠A=∠D",
      "∠C=∠F",
      `${gsym("CA", "seg")}:${gsym("FD", "seg")}=3:2`,
    ],
    answer: [0, 1], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이미 두 쌍의 변의 비(2:3)가 있으니 완성 경로는 두 가지예요.<br>① ∠B=∠E: 두 변 AB, BC 사이의 <b>끼인각</b>이 같아지면 SAS 닮음 ✓<br>② CA:FD=2:3: 셋째 변의 비까지 같아지면 SSS 닮음 ✓<span class='xh'>오답 하나씩 격파</span>∠A는 AB와 CA 사이의 각이고 ∠C는 BC와 CA 사이의 각이라, 비가 확보된 두 변(AB, BC)의 끼인각이 아니에요. 끼인각이 아닌 각이 같아도 닮음은 단정할 수 없죠(앞에서 본 함정 그대로). CA:FD=3:2는 비의 방향이 뒤집혀 있어 오히려 닮음을 깨는 조건이에요. 조건을 고르는 문제는 어느 두 변 사이의 각인지 위치를 그려 보는 것이 정석이에요.",
    core: "완성 경로는 둘: 끼인각(SAS) 또는 셋째 변(SSS)!",
  },
  {
    // [슬롯 64] 검산: AB쌍 6:9=2:3 → 둘레 22×3/2=33. 실각 (6,9,7): A=87°·B=51°·C=42°.
    id: "m2u5e064", lessonId: "m2u5l4", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. ${gsym("ABC", "tri")}의 둘레가 22 cm일 때, ${gsym("DEF", "tri")}의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 51, C1: 42, ratio: 1.5,
      sides1: { AB: "6 cm" }, sides2: { AB: "9 cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "33", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>둘레의 비는 닮음비와 같아요.<br>① 닮음비: AB:DE=6:9=2:3<br>② 둘레: 22:x=2:3<br>③ 2x=66, x=<b>33</b> ✓<span class='xh'>계산 실수 격파</span>세 변을 각각 구해 더할 필요가 없어요. 모든 변이 3/2배가 되니 그 합도 정확히 3/2배가 되거든요. 22×2÷3=14.7처럼 방향을 뒤집는 실수와, 둘레에 제곱 비 4:9를 적용해 49.5를 만드는 실수를 조심하세요. 제곱은 넓이의 몫이고 둘레는 길이라 닮음비 그대로예요. 검산: 22:33=2:3 일치!",
    core: "둘레의 비 = 닮음비, 변마다 구할 필요 없다!",
  },
  {
    // [슬롯 66] 검산: ∠ADE=∠ACB → AD·AB=AE·AC, 6×16=8×AC → AC=12. 정합: 6×16=96=8×12 ✓, AB/AC=4/3(B=41·C=61).
    id: "m2u5e066", lessonId: "m2u5l4", type: "num",
    prompt: `그림에서 ∠ADE=∠ACB이고 ${gsym("AD", "seg")}=6 cm, ${gsym("DB", "seg")}=10 cm, ${gsym("AE", "seg")}=8 cm예요. ${gsym("AC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 41, C: 61, t: 0.375, mode: "swapped",
      labels: { AD: "6 cm", DB: "10 cm", AE: "8 cm" },
      marks: [{ at: "ADE", label: "●" }, { at: "ACB", label: "●" }],
    }),
    answer: "12", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>∠A 공통, ∠ADE=∠ACB이므로 △ADE∽△ACB(AA)예요. 대응이 D↔C, E↔B로 엇갈리는 뒤집힌 닮음이죠.<br>① AB=AD+DB=6+10=16<br>② 대응변 비에서 AD:AC=AE:AB, 곱으로 쓰면 AD×AB=AE×AC<br>③ 6×16=8×x, 96=8x, x=<b>12</b> ✓<span class='xh'>계산 실수 격파</span>평행선 문제로 착각해 AD:DB=AE:EC 꼴로 세우면 전혀 다른 값이 나와요. 이 그림에는 평행 조건이 없고 각이 엇갈려 같다는 조건뿐이에요. 그럴 때는 곱 공식 AD×AB=AE×AC가 대응 실수를 막는 가장 안전한 길이에요. 검산: 6×16=96=8×12!",
    core: "엇갈린 같은 각 = 뒤집힌 닮음, AD×AB=AE×AC!",
  },
  {
    // [슬롯 67] 검산: 정답 세트만 2:3 두 쌍+끼인각 50° 일치.
    id: "m2u5e067", lessonId: "m2u5l4", type: "mcq",
    prompt: `${gsym("ABC", "tri")}와 ${gsym("DEF", "tri")}가 서로 닮은 도형이 되는 것은?`,
    figure: m2ExamTriPairFig({
      B1: 50, C1: 62, ratio: 1.5,
      labels1: { B: "●" }, labels2: { B: "●" },
      names2: ["D", "E", "F"],
    }),
    // 감사 반영(2026-07-23): SSA 함정 보기는 대변<이웃 변인 애매 구간 수치여야 성립(구 4·6·50°는 대변이 길어
    //  삼각형이 유일 → 실제로 닮음이 되는 복수 정답), 5·4·50°(5sin50°≈3.83<4<5)로 교체.
    options: [
      `${gsym("AB", "seg")}=4 cm, ${gsym("BC", "seg")}=6 cm, ∠B=50°와 ${gsym("DE", "seg")}=6 cm, ${gsym("EF", "seg")}=9 cm, ∠E=50°`,
      `${gsym("AB", "seg")}=5 cm, ${gsym("BC", "seg")}=4 cm, ∠A=50°와 ${gsym("DE", "seg")}=10 cm, ${gsym("EF", "seg")}=8 cm, ∠D=50°`,
      `${gsym("AB", "seg")}=4 cm, ${gsym("BC", "seg")}=6 cm, ∠B=50°와 ${gsym("DE", "seg")}=6 cm, ${gsym("EF", "seg")}=8 cm, ∠E=50°`,
      `${gsym("AB", "seg")}=4 cm, ${gsym("BC", "seg")}=5 cm, ∠B=50°와 ${gsym("DE", "seg")}=8 cm, ${gsym("EF", "seg")}=10 cm, ∠E=60°`,
      `${gsym("AB", "seg")}=5 cm, ${gsym("BC", "seg")}=5 cm, ∠B=50°와 ${gsym("DE", "seg")}=10 cm, ${gsym("EF", "seg")}=11 cm, ∠E=50°`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>SAS 닮음의 세 조건을 하나씩 대조해요.<br>① 4:6=2:3, 6:9=2:3으로 두 쌍의 비 일치<br>② ∠B=∠E=50°는 그 두 변의 끼인각<br>③ 그래서 <b>SAS 닮음</b> ✓<span class='xh'>오답 하나씩 격파</span>∠A=∠D인 세트는 각이 같지만 두 변 사이의 끼인각이 아니에요. 이런 조건에서는 같은 재료로 모양이 다른 삼각형이 두 가지나 만들어질 수 있어서 닮음이라 단정할 수 없죠(SSA 함정). 6:9와 6:8이 섞인 세트는 비가 2:3과 3:4로 어긋나고, 50°와 60°인 세트는 각부터 다르죠. 5:10=1:2와 5:11이 섞인 세트도 비가 안 맞아요. 비 두 쌍, 그리고 그 사이의 각, 세 가지가 전부 맞아야 도장이 찍혀요.",
    core: "SAS 점검표: 비·비·끼인각 세 칸을 모두 채워라!",
  },
  {
    // [슬롯 68] 검산: 10:15=16:24=14:21=2:3. "가장 간단" 조건으로 10:15 미약분 오답화. 실각 (10,16,14): A=82°·B=56°·C=42°.
    id: "m2u5e068", lessonId: "m2u5l4", type: "mcq",
    prompt: "그림의 두 삼각형은 서로 닮은 도형이에요. 두 삼각형의 닮음비를 가장 간단한 자연수의 비로 나타내면?",
    figure: m2ExamTriPairFig({
      B1: 56, C1: 42, ratio: 1.5,
      sides1: { AB: "10 cm", BC: "16 cm", CA: "14 cm" }, sides2: { AB: "15 cm", BC: "24 cm", CA: "21 cm" },
      names2: ["D", "E", "F"],
    }),
    options: ["2:3", "10:15", "5:7", "4:6", "3:2"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>세 쌍의 비를 모두 확인하고 가장 간단히 줄여요.<br>① 10:15=2:3<br>② 16:24=2:3<br>③ 14:21=2:3<br>세 쌍이 전부 2:3으로 같으니 닮음비는 <b>2:3</b> ✓<span class='xh'>오답 하나씩 격파</span>10:15와 4:6은 값은 2:3과 같지만 가장 간단한 자연수의 비가 아니라서 조건에 어긋나요. 5:7은 10:14처럼 대응하지 않는 변끼리 섞어 잰 값이에요. 대응변은 짧은 변끼리(10과 15), 긴 변끼리(16과 24) 크기 순서로 짝지어야 하죠. 3:2는 방향이 뒤집힌 값이에요. 세 쌍 확인, 크기순 대응, 끝까지 약분, 세 가지를 모두 지켜야 만점이에요.",
    core: "크기순으로 짝짓고, 세 쌍 확인, 끝까지 약분!",
  },
  {
    // [슬롯 69] 검산: △ADE∽△ACB에서 AD·AB=AE·AC → AB=4×15/5=12 → DB=12−5=7. 정합 5×12=60=4×15 ✓.
    id: "m2u5e069", lessonId: "m2u5l4", type: "num",
    prompt: `그림에서 ∠ADE=∠ACB이고 ${gsym("AD", "seg")}=5 cm, ${gsym("AE", "seg")}=4 cm, ${gsym("AC", "seg")}=15 cm예요. ${gsym("DB", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 54, C: 40, t: 5 / 12, mode: "swapped",
      labels: { AD: "5 cm", AE: "4 cm", AC: "15 cm", DB: "x cm" },
      marks: [{ at: "ADE", label: "●" }, { at: "ACB", label: "●" }],
    }),
    answer: "7", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>두 단계로 풀어요.<br>① 뒤집힌 닮음(△ADE∽△ACB)에서 AD×AB=AE×AC<br>② 5×AB=4×15=60, AB=12<br>③ x=DB=AB−AD=12−5=<b>7</b> ✓<span class='xh'>계산 실수 격파</span>AB=12를 구하고 그대로 답하면 한 걸음 모자라요. 문제가 물은 것은 DB, 즉 전체에서 AD를 뺀 조각이에요. 곱 공식에 들어가는 길이는 꼭짓점 A에서 잰 전체 길이(AD, AB, AE, AC)라는 것도 중요해요. DB 같은 조각을 공식에 직접 넣으면 안 되죠. 구한 값에서 조각으로 내려오는 마지막 뺄셈까지가 한 문제예요. 검산: 5×12=60=4×15!",
    core: "곱 공식엔 꼭짓점부터 잰 전체 길이, 답은 조각까지!",
  },
  {
    // [슬롯 70] 무그림(수 나열 판정). 검산: (6,8,9)vs(9,12,14), 6:9=8:12=2:3인데 9:14≠2:3 → 닮음 아님.
    id: "m2u5e070", lessonId: "m2u5l4", type: "mcq",
    prompt: "세 변의 길이가 각각 다음과 같은 두 삼각형 중 서로 닮은 도형이 아닌 것은?",
    options: [
      "6, 8, 9와 9, 12, 14",
      "4, 6, 8과 6, 9, 12",
      "5, 6, 9와 10, 12, 18",
      "4, 5, 7과 12, 15, 21",
      "6, 7, 10과 9, 10.5, 15",
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>세 쌍의 비를 끝까지 확인해요.<br>① 6:9=2:3, 8:12=2:3까지는 일치<br>② 그런데 9:14는 2:3(=9:13.5)이 아니에요<br>③ 셋째 쌍이 어긋나니 <b>닮음이 아니에요</b> ✓<span class='xh'>오답 하나씩 격파</span>나머지는 전부 닮음이에요. 4, 6, 8과 6, 9, 12는 2:3, 5, 6, 9와 10, 12, 18은 1:2, 4, 5, 7과 12, 15, 21은 1:3, 6, 7, 10과 9, 10.5, 15는 1:1.5(=2:3)로 세 쌍이 각각 일치하죠. 소수가 섞여 있어도 비는 성립할 수 있어요. 두 쌍까지 확인하고 도장을 찍는 습관이 이 문제의 표적이에요. 9:14처럼 살짝 어긋난 마지막 쌍은 계산해 보기 전엔 보이지 않아요.",
    core: "닮음 판정의 사망 지점은 언제나 셋째 쌍!",
  },
  {
    // [슬롯 71] 그림 진술 multi. 검산: 8:12=12:18=2:3, EF=12×1.5=18, 넓이비 4:9. 실각 (8,12,10): A=83°·B=56°·C=41°.
    id: "m2u5e071", lessonId: "m2u5l4", type: "multi",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamTriPairFig({
      B1: 56, C1: 41, ratio: 1.5,
      sides1: { AB: "8 cm", BC: "12 cm", CA: "10 cm" }, sides2: { AB: "12 cm", CA: "15 cm" },
      names2: ["D", "E", "F"],
    }),
    options: [
      "두 삼각형의 닮음비는 2:3이다",
      "SSS 닮음 조건으로 닮음을 확인할 수 있다",
      `${gsym("EF", "seg")}=18 cm이다`,
      "∠A=∠E이다",
      "두 삼각형의 넓이의 비는 2:3이다",
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>라벨된 두 쌍으로 비부터 재요.<br>① AB:DE=8:12=2:3, CA:FD=10:15=2:3 → 닮음비 2:3 ✓<br>② 셋째 쌍까지 같은 비이므로 SSS로 확인 가능 ✓<br>③ EF=BC×3/2=12×1.5=18 cm ✓<span class='xh'>오답 하나씩 격파</span>∠A의 대응각은 첫 글자끼리인 ∠D이지 ∠E가 아니에요. 넓이의 비는 닮음비의 제곱인 4:9이고요. 길이 계열(변, 둘레)은 2:3을 그대로, 넓이 계열은 제곱을 쓴다는 구분이 여기서도 반복돼요. 한 그림에서 비율 계산, 조건 판별, 대응, 넓이까지 두루 점검하는 종합 확인 문제였어요.",
    core: "변·둘레는 2:3 그대로, 넓이만 4:9!",
  },
  {
    // [슬롯 72] 검산: 4:6 또는 8:12=2:3 → x=6×1.5=9. 실각 (4,8,6): A=104°·B=47°·C=29°.
    id: "m2u5e072", lessonId: "m2u5l4", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 47, C1: 29, ratio: 1.5,
      sides1: { AB: "4 cm", BC: "8 cm", CA: "6 cm" }, sides2: { AB: "6 cm", BC: "12 cm", CA: "x cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "9", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>값이 둘 다 있는 대응변으로 닮음비를 정해요.<br>① AB:DE=4:6=2:3 (BC:EF=8:12로 재확인)<br>② CA:FD=2:3이므로 6:x=2:3<br>③ 2x=18, x=<b>9</b> ✓<span class='xh'>계산 실수 격파</span>6×2÷3=4는 방향이 뒤집힌 값이에요. DEF가 큰 삼각형이니 x는 6보다 커야 하죠. 또 CA=6과 DE=6이 같은 값이라 이 둘을 짝으로 착각하기 쉬운데, 대응은 값이 아니라 기호의 자리(세 번째 글자끼리)로 정해져요. 우연히 같은 수가 두 군데 나오는 것은 시험이 즐겨 쓰는 눈속임이에요. 검산: 4:6=8:12=6:9=2:3!",
    core: "같은 수 눈속임 주의, 대응은 자리로!",
  },
  {
    // [슬롯 73] 검산: 16:20=4:5 → x=15×4/5=12, y=8×5/4=10 → xy=120. 실각 (8,16,12): A=104.5°·B=47°·C=29°.
    id: "m2u5e073", lessonId: "m2u5l4", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}∽${gsym("DEF", "tri")}예요. <i class='mv'>x</i>×<i class='mv'>y</i>의 값을 구하세요.`,
    figure: m2ExamTriPairFig({
      B1: 47, C1: 29, ratio: 1.25,
      sides1: { AB: "8 cm", BC: "16 cm", CA: "x cm" }, sides2: { AB: "y cm", BC: "20 cm", CA: "15 cm" },
      names2: ["D", "E", "F"],
    }),
    answer: "120", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>값이 둘 다 있는 BC:EF로 닮음비를 정해요.<br>① 16:20=4:5<br>② x: CA:FD=4:5에서 x:15=4:5, x=12<br>③ y: AB:DE=4:5에서 8:y=4:5, y=10<br>④ x×y=12×10=<b>120</b> ✓<span class='xh'>계산 실수 격파</span>x는 작은 삼각형의 변이라 15보다 작고(12 ✓), y는 큰 삼각형의 변이라 8보다 커요(10 ✓). 이 크기 감각이 방향 실수를 걸러 줘요. 두 미지수를 곱한 값을 묻는 것은 하나만 맞혀서는 안 되게 하는 장치이니, 각각을 차분히 구하고 마지막 곱셈까지 확인하세요. 검산: 8:10=16:20=12:15=4:5로 세 쌍 모두 일치!",
    core: "묶음 답은 각각 정확히, 크기 감각으로 검산!",
  },

  // ─ L5 닮은 삼각형 찾기: 겹친 삼각형 ─
  // L5 num 등록부: 21(s75)·20(s79)·5(s76)·8(s81)·24(s83)·36(s87)·12(s90), 중복 없음.
  {
    // [슬롯 74] 검산: ∠AED=∠ABC(●) → 공통각 A와 AA, 대응 A↔A·E↔B·D↔C → △AED∽△ABC.
    id: "m2u5e074", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ∠AED=∠ABC일 때, ${gsym("AED", "tri")}와 닮은 삼각형을 기호로 바르게 나타낸 것은?`,
    figure: m2ExamTriSplitFig({
      B: 58, C: 48, t: 0.5, mode: "swapped",
      marks: [{ at: "AED", label: "●" }, { at: "ABC", label: "●" }],
    }),
    options: [
      `${gsym("ABC", "tri")}`,
      `${gsym("ACB", "tri")}`,
      `${gsym("BCA", "tri")}`,
      `${gsym("CBA", "tri")}`,
      "닮은 삼각형이 없다",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>겹친 삼각형은 공통각부터 찾아요.<br>① ∠A는 두 삼각형의 공통각<br>② ∠AED=∠ABC(조건)<br>③ AA 닮음이고 대응은 A↔A, E↔B, D↔C<br>④ 따라서 △AED∽<b>△ABC</b> ✓<span class='xh'>오답 하나씩 격파</span>△ACB를 고르면 E↔C, D↔B로 짝이 뒤바뀌어요. 같은 각끼리(∠AED와 ∠ABC → E와 B) 짝을 짓는 것이 순서의 근거예요. 겹친 그림에서는 작은 삼각형의 이름 순서를 먼저 쓰고, 같은 각의 꼭짓점을 같은 자리에 두며 큰 삼각형을 읽어 내려가면 실수가 없어요. 조건의 각 이름 속에 답이 이미 들어 있는 셈이에요.",
    core: "공통각+같은 각, 조건의 글자에서 순서를 읽어라!",
  },
  {
    // [슬롯 76] 검산: AD·AB=AE·AC → 4×10=AE×8 → AE=5. 정합: t=0.4, s=0.4×(10/8)²=0.625=5/8 ✓.
    id: "m2u5e076", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ∠ADE=∠ACB이고 ${gsym("AD", "seg")}=4 cm, ${gsym("DB", "seg")}=6 cm, ${gsym("AC", "seg")}=8 cm예요. ${gsym("AE", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 46, C: 64, t: 0.4, mode: "swapped",
      labels: { AD: "4 cm", DB: "6 cm", AC: "8 cm", AE: "x cm" },
      marks: [{ at: "ADE", label: "●" }, { at: "ACB", label: "●" }],
    }),
    answer: "5", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>∠A 공통, ∠ADE=∠ACB이므로 뒤집힌 닮음 △ADE∽△ACB예요.<br>① AB=4+6=10<br>② AD×AB=AE×AC<br>③ 4×10=x×8, 40=8x, x=<b>5</b> ✓<span class='xh'>계산 실수 격파</span>공식에 AD=4 대신 DB=6을 넣거나, AB=10 대신 DB=6을 넣는 실수가 가장 흔해요. 곱 공식의 네 길이는 전부 꼭짓점 A에서 출발해 잰 것(AD, AB, AE, AC)이에요. 그림에서 A에 연필을 대고 각 길이를 따라가 보면 헷갈리지 않아요. 검산: 4×10=40=5×8 일치!",
    core: "곱 공식의 재료는 전부 A에서 잰 길이!",
  },
  {
    // [슬롯 77] 검산: AB∥DC → 엇각 2쌍(또는 엇각+맞꼭지각) → AA.
    id: "m2u5e077", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 두 선분 AC, BD가 점 O에서 만나요. ${gsym("OAB", "tri")}∽${gsym("OCD", "tri")}임을 보이는 근거로 알맞은 것은?`,
    figure: m2ExamXCrossFig({
      rTop: [7, 10], rSide: [8, 80 / 7],
      paraMarks: true,
    }),
    options: [
      "엇각과 맞꼭지각이 각각 같다 (AA 닮음)",
      "세 쌍의 대응변의 길이의 비가 같다 (SSS 닮음)",
      "두 쌍의 대응변의 비와 끼인각이 같다 (SAS 닮음)",
      "두 삼각형의 넓이가 같다",
      "대응하는 변이 서로 평행하다",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>변의 길이 정보가 하나도 없는데 닮음을 말할 수 있는 이유는 각이에요.<br>① AB∥DC이므로 엇각 ∠OAB=∠OCD<br>② 맞꼭지각 ∠AOB=∠COD<br>③ 두 쌍의 각이 같으니 <b>AA 닮음</b> ✓<span class='xh'>오답 하나씩 격파</span>SSS나 SAS는 변의 길이 정보가 필요한데 이 그림엔 없어요. 넓이가 같다는 것은 닮음의 근거가 아니고, 실제로 두 삼각형은 크기가 달라요. 변이 평행하다는 사실 자체는 근거의 재료일 뿐, 그 평행에서 엇각이 같아진다는 한 걸음을 밟아야 닮음 조건이 완성돼요. X자(나비꼴) 그림을 보면 반사적으로 '엇각+맞꼭지각=AA'가 떠올라야 해요.",
    core: "X자 구도의 자동 조건: 엇각+맞꼭지각=AA!",
  },
  {
    // [슬롯 78] 검산: ∠DBA=∠DAC=90−C·∠D=90 공통 등, △DBA∽△DAC∽△ABC(각 D·D·A=90, B↔A↔B 대응).
    id: "m2u5e078", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ∠BAC=90°이고 ${gsym("AD", "seg")}⊥${gsym("BC", "seg")}예요. 서로 닮은 삼각형을 빠짐없이 나타낸 것은?`,
    figure: m2ExamRightAltFig({ bd: 9, dc: 16 }),
    options: [
      `${gsym("DBA", "tri")}∽${gsym("DAC", "tri")}∽${gsym("ABC", "tri")}`,
      `${gsym("DBA", "tri")}∽${gsym("DCA", "tri")}∽${gsym("ABC", "tri")}`,
      `${gsym("ABD", "tri")}∽${gsym("ACD", "tri")}∽${gsym("ABC", "tri")}`,
      `${gsym("DBA", "tri")}∽${gsym("DAC", "tri")}뿐이다`,
      "서로 닮은 삼각형이 없다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>수선 하나가 삼각형 세 개를 만들고, 셋은 전부 닮음이에요.<br>① △DBA: ∠D=90°, ∠B, ∠DAB=90°−∠B<br>② △DAC: ∠D=90°, ∠DAC=∠B(둘 다 90°−∠C), ∠C<br>③ △ABC: ∠A=90°, ∠B, ∠C<br>같은 크기의 각이 같은 자리에 오도록 쓰면 △DBA∽△DAC∽<b>△ABC</b> ✓<span class='xh'>오답 하나씩 격파</span>△DCA는 두 번째 자리에 ∠C가 와서 ∠B 자리와 어긋나요. △ABD∽△ACD도 각의 짝이 맞지 않는 순서죠. 두 쌍만 닮았다는 보기는 큰 삼각형을 빠뜨렸어요. 셋의 닮음에서 나오는 대응변 비가 곧 AD²=BD×DC 같은 제곱 공식들의 뿌리라서, 이 순서 감각은 다음 문제들의 기초 공사예요.",
    core: "수선은 닮음 삼형제를 만든다, 순서는 같은 각끼리!",
  },
  {
    // [슬롯 80] 검산: AB∥DC ⟺ OA:OC=OB:OD → 6:9=8:x → x=12.
    id: "m2u5e080", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 두 선분 AC, BD가 점 O에서 만나요. ${gsym("AB", "seg")}∥${gsym("DC", "seg")}가 되려면 ${gsym("OD", "seg")}의 길이는 얼마여야 하나요?`,
    figure: m2ExamXCrossFig({
      rTop: [6, 9], rSide: [8, 12],
      labels: { OA: "6 cm", OC: "9 cm", OB: "8 cm", OD: "x cm" },
    }),
    options: ["12 cm", "10 cm", "13.5 cm", "7 cm", "16 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>평행의 조건을 비로 뒤집어 쓰는 문제예요. AB∥DC이려면 △OAB∽△OCD가 되어야 하고, 맞꼭지각은 이미 같으니 SAS 닮음이 되도록 O를 낀 두 쌍의 비가 같아야 해요.<br>① OA:OC=6:9=2:3<br>② OB:OD=2:3이 되어야 하므로 8:x=2:3<br>③ x=<b>12 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>13.5 cm는 9×1.5로, OC에 배율을 잘못 이어 붙인 값이에요. 비는 반드시 같은 직선 위의 짝(OA와 OC, OB와 OD)으로 세워야 해요. 10 cm는 8+2, 16 cm는 8×2로 어림한 값이죠. 지금까지는 평행에서 비를 얻었다면, 이 문제는 비를 맞춰 평행을 만들어요. 조건과 결론을 거꾸로도 쓸 수 있어야 진짜 이해예요.",
    core: "평행 ⟺ O를 낀 두 쌍의 비 일치, 거꾸로도 쓴다!",
  },
  {
    // [슬롯 81] 검산: AB²=BD·BC=4×16=64 → AB=8.
    id: "m2u5e081", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ∠BAC=90°이고 ${gsym("AD", "seg")}⊥${gsym("BC", "seg")}예요. ${gsym("BD", "seg")}=4 cm, ${gsym("DC", "seg")}=12 cm일 때, ${gsym("AB", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamRightAltFig({
      bd: 4, dc: 12,
      labels: { BD: "4 cm", DC: "12 cm", AB: "x cm" },
    }),
    answer: "8", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>△DBA∽△ABC(둘 다 ∠B 공유, 직각)에서 BD:BA=BA:BC가 나와요.<br>① AB²=BD×BC<br>② BC=4+12=16<br>③ AB²=4×16=64, 제곱해서 64가 되는 양수는 8<br>④ x=<b>8</b> ✓<span class='xh'>계산 실수 격파</span>AB²=BD×DC=48로 쓰는 것이 최대 함정이에요. 두 조각의 곱(BD×DC)과 짝을 이루는 것은 수선 AD이고, 변 AB와 짝을 이루는 것은 자기 쪽 조각과 빗변 전체(BD×BC)예요. 어느 공식이든 '그 변이 낀 두 삼각형의 대응변 비'에서 나온다는 뿌리를 기억하면 헷갈릴 때 유도해서 복구할 수 있어요. 검산: 8²=64=4×16!",
    core: "AB의 짝은 BD×BC(자기 조각×빗변 전체)!",
  },
  {
    // [슬롯 83] 검산: 닮음비 AD:AC=6:9=2:3 → 둘레 16×3/2=24.
    id: "m2u5e083", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ∠ADE=∠ACB이고 ${gsym("AD", "seg")}=6 cm, ${gsym("AC", "seg")}=9 cm예요. ${gsym("ADE", "tri")}의 둘레가 16 cm일 때, ${gsym("ACB", "tri")}의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamTriSplitFig({
      B: 60, C: 46, t: 0.5, mode: "swapped",
      labels: { AD: "6 cm", AC: "9 cm" },
      marks: [{ at: "ADE", label: "●" }, { at: "ACB", label: "●" }],
    }),
    answer: "24", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>△ADE∽△ACB(AA)이고, 닮음비는 대응변 AD:AC에서 바로 나와요.<br>① 닮음비: 6:9=2:3<br>② 둘레의 비도 2:3이므로 16:x=2:3<br>③ 2x=48, x=<b>24</b> ✓<span class='xh'>계산 실수 격파</span>AD의 짝을 AB로 잘못 잡으면 닮음비를 구할 수 없어 막혀요. 뒤집힌 닮음에서 AD(작은 삼각형)의 대응변은 AC(큰 삼각형)라는 것, 즉 대응이 D↔C로 엇갈린다는 것이 이 구도의 핵심이었죠. 닮음비만 정확히 뽑으면 둘레는 변마다 계산할 필요 없이 한 번의 비례식으로 끝나요. 검산: 16:24=2:3!",
    core: "뒤집힌 닮음의 닮음비는 AD:AC, 둘레는 그대로 따라온다!",
  },
  {
    // [슬롯 84] 검산: OA:OC=40:10=4:1, AB=12×4=48. 실비 rSide [36,9]=4:1.
    id: "m2u5e084", lessonId: "m2u5l5", type: "mcq",
    prompt: `강의 폭 ${gsym("AB", "seg")}를 직접 잴 수 없어서, 그림처럼 강 밖에 점 O를 잡고 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}가 되도록 두 점 C, D를 정했어요. ${gsym("DC", "seg")}=12 m일 때, 강의 폭 ${gsym("AB", "seg")}는?`,
    figure: m2ExamXCrossFig({
      rTop: [40, 10], rSide: [36, 9],
      labels: { OA: "40 m", OC: "10 m", DC: "12 m", AB: "x m" },
      paraMarks: true,
    }),
    options: ["48 m", "3 m", "30 m", "52 m", "120 m"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>X자 닮음 측량이에요. AB∥DC이므로 엇각과 맞꼭지각으로 △OAB∽△OCD(AA)죠.<br>① 닮음비: OA:OC=40:10=4:1<br>② AB=DC×4=12×4=<b>48 m</b> ✓<span class='xh'>오답 하나씩 격파</span>3 m는 12÷4로 방향이 뒤집힌 값이에요. 강 쪽(OA=40)이 잰 쪽(OC=10)의 4배이니 폭도 4배로 커져야 하죠. 30 m는 40−10을 어설프게 쓴 값, 52 m는 40+12로 더한 값, 120 m는 12×10처럼 엉뚱한 곱이에요. 강 이쪽에서 몇 걸음 재는 것만으로 건너편까지의 폭을 아는 것, 닮음이 고대부터 측량술의 심장이었던 이유예요.",
    core: "건널 수 없는 폭도 X자 닮음이면 몇 걸음으로 끝!",
  },
  {
    // [슬롯 85] 검산: 평행이려면 AD:DB=AE:EC → 4:8=5:x → x=10. 그림은 비평행 상태(free s≠t)가 정직.
    id: "m2u5e085", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ${gsym("AD", "seg")}=4 cm, ${gsym("DB", "seg")}=8 cm, ${gsym("AE", "seg")}=5 cm예요. ${gsym("DE", "seg")}∥${gsym("BC", "seg")}가 되려면 ${gsym("EC", "seg")}의 길이는 얼마여야 하나요?`,
    figure: m2ExamTriSplitFig({
      B: 62, C: 50, t: 1 / 3, s: 0.45, mode: "free",
      labels: { AD: "4 cm", DB: "8 cm", AE: "5 cm", EC: "x cm" },
    }),
    options: ["10 cm", "7 cm", "9 cm", "6 cm", "13 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>DE∥BC가 되기 위한 조건은 두 변이 같은 비로 잘리는 것이에요.<br>① AD:DB=4:8=1:2<br>② AE:EC=1:2가 되어야 하므로 5:x=1:2<br>③ x=<b>10 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>7 cm는 5+2처럼 차이를 이어 붙인 값이고, 9 cm는 4:8과 5:9를 얼추 비슷하게 맞춘 어림이에요. 평행은 얼추가 아니라 비가 정확히 같아야 성립해요. 6 cm는 5:6을 4:8의 절반쯤으로 착각한 값, 13 cm는 8+5예요. 그림에서 DE가 BC와 살짝 어긋나 보이는 것은 아직 조건이 맞지 않은 상태라는 뜻이에요. x=10이 되는 순간 평행이 완성되죠.",
    core: "평행의 조건 = 두 변이 같은 비로 잘리기!",
  },
  {
    // [슬롯 86] 검산: AD²=2×8=16 → AD=4, BC=10, 넓이=½×10×4=20.
    id: "m2u5e086", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ∠BAC=90°이고 ${gsym("AD", "seg")}⊥${gsym("BC", "seg")}예요. ${gsym("BD", "seg")}=2 cm, ${gsym("DC", "seg")}=8 cm일 때, ${gsym("ABC", "tri")}의 넓이는?`,
    figure: m2ExamRightAltFig({
      bd: 2, dc: 8,
      labels: { BD: "2 cm", DC: "8 cm" },
    }),
    options: ["20 cm²", "40 cm²", "16 cm²", "10 cm²", "24 cm²"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>넓이를 구하려면 밑변과 높이가 필요해요. 밑변 BC는 바로 나오고, 높이가 바로 수선 AD예요.<br>① AD²=BD×DC=2×8=16, AD=4<br>② BC=2+8=10<br>③ 넓이=½×10×4=<b>20 cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>40 cm²는 ½을 빼먹은 값이에요. 16 cm²는 AD²에서 멈춘 값인데, 16은 넓이가 아니라 수선 길이의 제곱이에요. 10 cm²는 밑변 10을 넓이로 착각한 값, 24 cm²는 계산이 뒤섞인 값이죠. 이 문제의 묘미는 수선 공식이 넓이 문제의 부품으로 쓰인다는 데 있어요. 공식은 외우는 것이 아니라 꺼내 쓰는 도구라는 것을 보여 주는 융합형이에요.",
    core: "수선 공식으로 높이를 얻고, 넓이 공식으로 마무리!",
  },
  {
    // [슬롯 87] 검산: 닮음비 8:12=2:3, △OAB 둘레 8+6+10=24 → △OCD 둘레 36.
    id: "m2u5e087", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 ${gsym("OA", "seg")}=8 cm, ${gsym("OB", "seg")}=6 cm, ${gsym("AB", "seg")}=10 cm, ${gsym("OC", "seg")}=12 cm예요. ${gsym("OCD", "tri")}의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamXCrossFig({
      rTop: [8, 12], rSide: [6, 9],
      labels: { OA: "8 cm", OB: "6 cm", AB: "10 cm", OC: "12 cm" },
      paraMarks: true,
    }),
    answer: "36", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>△OAB∽△OCD(엇각+맞꼭지각 AA)이고 닮음비는 OA:OC=8:12=2:3이에요.<br>① △OAB의 둘레=8+6+10=24<br>② 둘레의 비는 닮음비와 같으므로 24:x=2:3<br>③ x=<b>36</b> ✓<span class='xh'>계산 실수 격파</span>OD=9, DC=15를 각각 구해 12+9+15=36으로 더해도 같은 답이 나와요. 하지만 둘레의 비가 닮음비와 같다는 성질을 쓰면 변 두 개의 계산을 건너뛸 수 있죠. 종합 문제일수록 성질로 지름길을 내는 훈련이 중요해요. 흔한 실수는 △OAB의 둘레에 OC까지 섞어 더하는 것이니, 어느 삼각형의 둘레인지 변 세 개를 정확히 짚고 더하세요. 검산: 24:36=2:3!",
    core: "둘레 지름길: 세 변 다 구하지 말고 닮음비로!",
  },
  {
    // [슬롯 89] 그림 진술 multi. 검산: 6:9=8:12=2:3 → 닮음·엇각 참, OB의 짝은 OD(OC 아님).
    id: "m2u5e089", lessonId: "m2u5l5", type: "multi",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 두 선분 AC, BD가 점 O에서 만나요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamXCrossFig({
      rTop: [6, 9], rSide: [8, 12],
      labels: { OA: "6 cm", OC: "9 cm", OB: "8 cm", OD: "12 cm" },
      paraMarks: true,
    }),
    options: [
      `${gsym("OAB", "tri")}∽${gsym("OCD", "tri")}`,
      "두 삼각형의 닮음비는 2:3이다",
      "∠OAB=∠OCD이다",
      `${gsym("AB", "seg")}:${gsym("DC", "seg")}=${gsym("OB", "seg")}:${gsym("OC", "seg")}이다`,
      `${gsym("OA", "seg")}:${gsym("OC", "seg")}=${gsym("OD", "seg")}:${gsym("OB", "seg")}이다`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>평행에서 시작해요.<br>① AB∥DC → 엇각 ∠OAB=∠OCD, 맞꼭지각까지 AA 닮음 ✓<br>② 닮음비: OA:OC=6:9=2:3 (OB:OD=8:12로 재확인) ✓<span class='xh'>오답 하나씩 격파</span>AB:DC의 짝은 OB:OC가 아니라 닮음비 그 자체(OA:OC=OB:OD)예요. OB의 대응변은 같은 직선 위 건너편인 OD이지, 다른 직선의 OC가 아니죠. 마지막 보기도 OD와 OB의 자리가 뒤집혀 2:3이 아닌 3:2가 되니 틀려요. X자 구도에서 비의 짝은 언제나 O를 사이에 둔 같은 직선 위 두 조각이라는 것, 이 하나만 지키면 진술 판별이 어렵지 않아요.",
    core: "X자의 비 짝 = O를 낀 같은 직선의 두 조각!",
  },
  {
    // [슬롯 90] 검산: OA:OC=7:14=1:2 → OD=6×2=12.
    id: "m2u5e090", lessonId: "m2u5l5", type: "num",
    prompt: `그림에서 ${gsym("AB", "seg")}∥${gsym("DC", "seg")}이고 두 선분 AC, BD가 점 O에서 만나요. ${gsym("OD", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamXCrossFig({
      rTop: [7, 14], rSide: [6, 12],
      labels: { OA: "7 cm", OC: "14 cm", OB: "6 cm", OD: "x cm" },
      paraMarks: true,
    }),
    answer: "12", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>AB∥DC이므로 엇각과 맞꼭지각으로 △OAB∽△OCD예요.<br>① 닮음비: OA:OC=7:14=1:2<br>② OB:OD=1:2이므로 6:x=1:2<br>③ x=<b>12</b> ✓<span class='xh'>계산 실수 격파</span>6÷2=3으로 답했다면 방향이 뒤집힌 거예요. D는 큰 삼각형 쪽이니 OD는 OB보다 길어야 하죠. 또 OA:OB=7:6처럼 같은 삼각형 안의 두 변으로 비를 만드는 실수도 조심하세요. 닮음비는 두 삼각형을 건너서, O를 사이에 둔 같은 직선 위의 짝으로만 재요. 검산: 7:14=6:12=1:2!",
    core: "비는 삼각형을 건너서, 같은 직선의 짝으로!",
  },
  {
    // [슬롯 91] 검산: AC²=CD·CB=9×16=144 → AC=12.
    id: "m2u5e091", lessonId: "m2u5l5", type: "mcq",
    prompt: `그림에서 ∠BAC=90°이고 ${gsym("AD", "seg")}⊥${gsym("BC", "seg")}예요. ${gsym("BD", "seg")}=7 cm, ${gsym("DC", "seg")}=9 cm일 때, ${gsym("AC", "seg")}의 길이는?`,
    figure: m2ExamRightAltFig({
      bd: 7, dc: 9,
      labels: { BD: "7 cm", DC: "9 cm", AC: "x cm" },
    }),
    options: ["12 cm", "9 cm", "16 cm", "11 cm", "15 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>변 AC가 낀 닮음 쌍 △DAC∽△ABC에서 CD:CA=CA:CB가 나와요.<br>① AC²=CD×CB<br>② CB=7+9=16<br>③ AC²=9×16=144, 제곱해서 144가 되는 양수는 12<br>④ AC=<b>12 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>AC²=BD×DC=63으로 쓰면 수선 AD의 공식과 뒤섞인 거예요. 각 변의 짝을 정리하면 AD²=BD×DC(두 조각), AB²=BD×BC(B쪽 조각×전체), AC²=CD×CB(C쪽 조각×전체)예요. 셋 다 '그 변이 어느 삼각형 쌍에 끼어 있는가'에서 나오죠. 9 cm는 DC를 그대로 옮긴 값, 16 cm는 CB를 옮긴 값, 11 cm는 7+9−5 같은 어림, 15 cm는 근처 어림이에요. 검산: 12²=144=9×16!",
    core: "AC의 짝은 CD×CB, 세 공식은 자기 조각×전체!",
  },
];
