// m1u4 v2 저작 전 샘플 갤러리 — 파일럿이 쓸 헬퍼·모드 전 구성 눈검수(m2u5 사이클 관행).
// node qa/render-m1u4v2-sample.mjs → tmp/m1u4v2-sample/index.html
import {
  mExamSolidFig,
  mExamPointsLineFig,
  m4AngleExamFig,
  mExamAngleFanFig,
  mExamXAnglesFig,
  m4PerpDistanceFig,
  m4ConstructionBisectorFig,
  m4TransversalExamFig,
  m4BoxRelationsFig,
  mExamCutBoxFig,
  mExamCubeNetFig,
  mExamZigzagFig,
  mExamFoldFig,
  mExamCopyAngleFig,
  mExamTriSidesFig,
  m4TriangleConditionFig,
  m4CongruenceExamFig,
  m4SurveyFig,
  mExamTwinEquiFig,
} from "../src/ui/examFiguresMath";

export const SAMPLES: Array<{ t: string; note: string; svg: string }> = [
  { t: "SD5 오각기둥(슬롯 1·8·12·15)", note: "교점 10·교선 15·면 7", svg: mExamSolidFig("prism5") },
  { t: "SD4 사각뿔(슬롯 4·9·13)", note: "교점 5·교선 8 — a+b=13", svg: mExamSolidFig("pyr4") },
  { t: "SD3 삼각기둥(슬롯 2·5·11)", note: "교선 9·면 5", svg: mExamSolidFig("prism3") },
  {
    t: "PL 네 점 기호(슬롯 16)",
    note: "직선 위 A·B·C·D — 기호 짝",
    svg: mExamPointsLineFig({ pts: ["A", "B", "C", "D"] }),
  },
  {
    t: "PL 중점(슬롯 18·20·24)",
    note: "AM 구간 라벨 + 전체 라벨",
    svg: mExamPointsLineFig({
      pts: ["A", "M", "B", "C"],
      segs: [
        { from: 0, to: 2, label: "22 cm" },
        { from: 2, to: 3, label: "11 cm" },
      ],
    }),
  },
  { t: "AE 각 분류(슬롯 31)", note: "72° 실각", svg: m4AngleExamFig({ left: "A", vertex: "O", right: "B", degrees: 72 }) },
  {
    t: "AF 평각 방정식(슬롯 36)",
    note: "(2x)°+x°+27°=180, x=51 실각 102/51/27",
    svg: mExamAngleFanFig({
      left: "A", vertex: "O", right: "B",
      rays: [{ deg: 27, label: "C" }, { deg: 78, label: "D" }],
      arcs: [
        { a: 0, b: 27, label: "27°" },
        { a: 27, b: 78, label: "x°" },
        { a: 78, b: 180, label: "(2x)°" },
      ],
    }),
  },
  {
    t: "AF perpAt(슬롯 34·43·66·72)",
    note: "x°+34°+90°=180, x=56 — 직각 마크 90~180",
    svg: mExamAngleFanFig({
      left: "A", vertex: "O", right: "B",
      rays: [{ deg: 34, label: "C" }, { deg: 90, label: "D" }],
      arcs: [
        { a: 0, b: 34, label: "34°" },
        { a: 34, b: 90, label: "x°" },
      ],
      perpAt: 90,
    }),
  },
  {
    t: "XA 기본(슬롯 46~48·50)",
    note: "58° ↔ 이웃각 x=122",
    svg: mExamXAnglesFig({ ends: ["A", "C", "B", "D"], vertex: "O", angles: ["58°", "x°", null, null] }),
  },
  {
    t: "XA ray+arcs(슬롯 49·55) 확장",
    note: "CD⊥OE 원형 — 42°(24~66 실각)·x=∠AOD(−24~24 실각 48)·직각 마크 66~156",
    svg: mExamXAnglesFig({
      ends: ["A", "C", "B", "D"], vertex: "O", slope2: 156,
      ray: { deg: 66, label: "E", perpToLine2: true },
      arcs: [
        { a: 24, b: 66, label: "42°" },
        { a: -24, b: 24, label: "x°" },
      ],
    }),
  },
  {
    t: "XA perp 직교(슬롯 63·71) + ray 분할(슬롯 59)",
    note: "네 각 90 판독·직각 분할 방정식 (x+22)°+(2x−10)°=90(실각 48/42)",
    svg: mExamXAnglesFig({
      ends: ["A", "C", "B", "D"], vertex: "O", perp: true,
      ray: { deg: 48, label: "E" },
      arcs: [
        { a: 0, b: 48, label: "(x+22)°" },
        { a: 48, b: 90, label: "(2x−10)°" },
      ],
    }),
  },
  {
    t: "PD 기본(슬롯 61·65)",
    note: "수선의 발 H",
    svg: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", otherB: "B" }),
  },
  {
    t: "PD lens 확장(슬롯 62·69·75)",
    note: "거리 11 cm — 라벨 흰 할로",
    svg: m4PerpDistanceFig({ point: "P", foot: "H", otherA: "A", otherB: "B", lens: { ph: "11 cm", pa: "13 cm", pb: "17 cm" } }),
  },
  {
    t: "CB 수직이등분선(슬롯 64·67·74)",
    note: "AM=MB·직각 마크",
    svg: m4ConstructionBisectorFig({ a: "A", b: "B", m: "M", n: "N" }),
  },
  {
    t: "TR 비평행 8각(슬롯 106~120)",
    note: "동위각·엇각 자리",
    svg: m4TransversalExamFig({ upper: "l", lower: "m", cross: "n", labels: ["a", "b", "c", "d", "e", "f", "g", "h"] }),
  },
  {
    t: "TR parallel(슬롯 121~124·128)",
    note: "l∥m — 76°·x°",
    svg: m4TransversalExamFig({ upper: "l", lower: "m", cross: "n", parallel: true, labels: ["76°", "", "", "", "x°", "", "", ""] }),
  },
  {
    t: "TR pts(슬롯 76·79·81)",
    note: "교점 이름 P·Q",
    svg: m4TransversalExamFig({ upper: "l", lower: "m", cross: "n", labels: ["", "", "", "", "", "", "", ""], pts: { ui: "P", li: "Q" } }),
  },
  {
    t: "ZZ in(슬롯 125) 신작",
    note: "34°+46° → x=80",
    svg: mExamZigzagFig({ mode: "in", a: 34, b: 46, labels: { a: "34°", b: "46°", x: "x°" } }),
  },
  {
    t: "ZZ out 관통형(슬롯 126) 신작",
    note: "38°·54°(아래 바깥 쐐기) → x=92",
    svg: mExamZigzagFig({ mode: "out", a: 38, b: 54, labels: { a: "38°", b: "54°", x: "x°" } }),
  },
  {
    t: "ZZ w 2절점(슬롯 130) 신작",
    note: "a=32·b=28·c=24 → x=56·y=52",
    svg: mExamZigzagFig({ mode: "w", a: 32, b: 28, c: 24, labels: { a: "32°", b: "28°", x: "x°", y: "y°" } }),
  },
  {
    t: "ZZ tri 삼각형 낀(슬롯 127·135) 신작",
    note: "밑각 52·58 — 정점 x=70, lRight=122",
    svg: mExamZigzagFig({ mode: "tri", a: 52, b: 58, labels: { a: "52°", x: "x°", lRight: "122°" } }),
  },
  { t: "FOLD 접기(슬롯 134)", note: "fold=62 → x=56", svg: mExamFoldFig({ fold: 62, given: "62°", x: "x°" }) },
  { t: "FOLD 역산(슬롯 136)", note: "접힌 각 92° 라벨 → 접는 각 44", svg: mExamFoldFig({ fold: 44, given: "x°", x: "92°" }) },
  {
    t: "NET 전개도(슬롯 100·102)",
    note: "십자 전개도 격자 라벨",
    svg: mExamCubeNetFig([
      { c: 0, r: 0, s: "A" }, { c: 1, r: 0, s: "B" },
      { c: -1, r: 1, s: "C" }, { c: 0, r: 1, s: "D" }, { c: 1, r: 1, s: "E" }, { c: 2, r: 1, s: "F" },
      { c: 0, r: 3, s: "G" }, { c: 1, r: 3, s: "H" },
    ]),
  },
  { t: "CX 절단 입체(슬롯 95·96)", note: "라벨 8", svg: mExamCutBoxFig(["A", "D", "B", "C", "H", "F", "G", "E"]) },
  { t: "BX 직육면체(슬롯 91·92 등)", note: "ABCD-EFGH", svg: m4BoxRelationsFig(["A", "B", "C", "D", "E", "F", "G", "H"]) },
  {
    t: "CG 합동 두 삼각형(슬롯 169·175)",
    note: "SAS 마크",
    svg: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["D", "E", "F"] }),
  },
  { t: "TC sas(슬롯 158·174)", note: "두 변+끼인각", svg: m4TriangleConditionFig({ a: "A", b: "B", c: "C", mode: "sas" }) },
  { t: "TC asa(슬롯 161)", note: "한 변+양 끝 각", svg: m4TriangleConditionFig({ a: "A", b: "B", c: "C", mode: "asa" }) },
  {
    t: "TS verts+shape+angles(슬롯 153~156) 확장",
    note: "실각 58/47 재계산 + 각 라벨",
    svg: mExamTriSidesFig({
      left: "c", right: "a", bottom: "13 cm",
      verts: ["A", "B", "C"],
      shape: { left: 58, right: 47 },
      angles: { left: "58°" },
    }),
  },
  {
    t: "TS 구형 호환(m1u2 기존 호출)",
    note: "verts 없이 — 원형 유지 확인",
    svg: mExamTriSidesFig({ left: "8 cm", right: "6 cm", bottom: "10 cm" }),
  },
  { t: "SV cross(슬롯 185·186 등)", note: "X자 측량 ASA", svg: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"] }) },
  { t: "SV reflect(슬롯 190)", note: "대칭 측량", svg: m4SurveyFig({ mode: "reflect", labels: ["P", "Q", "X", "Y"] }) },
  { t: "SV offset(슬롯 193)", note: "떨어진 두 삼각형", svg: m4SurveyFig({ mode: "offset", labels: ["X", "A", "B", "Y", "C", "D"] }) },
  { t: "TE in(슬롯 187·188·200)", note: "정삼각형 안 ㉮", svg: mExamTwinEquiFig("in") },
  { t: "TE twin(슬롯 189·192·196)", note: "잇댄 정삼각형", svg: mExamTwinEquiFig("twin") },
  { t: "CA 각 옮기기(슬롯 139·141·142)", note: "기본 라벨", svg: mExamCopyAngleFig({}) },
];
