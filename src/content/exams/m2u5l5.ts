// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀 v2, 레슨 5 닮은 삼각형 찾기: 겹친 삼각형 (책 202~203쪽)
// (m2u5e074~e091) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u5-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 9 + multi 2 = 11 · num 7, diff 7/7/4. word 0(규격 v2, 교과서 실측 계승).
// 그림 원칙: 수치는 라벨 단위 병기("12 cm"·"x cm"), 관계 조건은 문두, 실각·실비 검산 완료(각 문항 주석).
// 트리플·앵커 배정은 설계표 §2·§2-1이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamTriSplitFig,
  m2ExamXCrossFig,
  m2ExamRightAltFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U5L5: ExamItem[] = [
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
