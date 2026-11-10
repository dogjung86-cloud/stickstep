// 스틱맨 아바타 아트 카탈로그(v2, 2026-11): 색 팔레트와 파츠 그림만 모은 파일.
// 조합·정규화·프리셋·픽커 메타는 stickParts.ts가 맡고, 여기는 "무엇을 어떻게 그리는가"만 안다.
// 좌표계는 viewBox 0 0 96 96, 머리 중심 (48,45)·반지름 24.5(v1과 동일: 눈·입·안경 좌표가 여기에 물려 있다).
// 화풍: 굵은 손그림 잉크 외곽선 + 평면 색(막대 인물 정체성 유지). 그라데이션·그림자·광택은 쓰지 않는다.
// 규약: 각 배열은 끝에 append만 한다. 저장된 인덱스가 곧 파츠라서 순서 변경·삭제는 금지(v1과 같은 규약).
//       색 팔레트도 같다. 인덱스 0은 "예전 모습"(종이색 얼굴·먹색 머리·흰 옷·파란 소품·하늘 배경)이어야 한다.

export const INK = "#2A3542";
const WHITE = "#FFFFFF";
const BLUE = "#3182F6";
const GREEN = "#2EA96C";
const PINK = "#F0879E";
const GOLD = "#FFC83D";
const CORAL = "#FF7272";
const NAVY = "#3B4C78";

/* ── 팔레트 ──────────────────────────────────────────────── */
export interface SkinCol {
  name: string;
  fill: string;
  /** 볼터치·빗금 볼에 쓰는 홍조 색 */
  blush: string;
}
export const SKINS: SkinCol[] = [
  { name: "종이", fill: "#FFFFFF", blush: "#FFA9BC" },
  { name: "복숭아", fill: "#FFE6D8", blush: "#FF9AAE" },
  { name: "살구", fill: "#FAD3B8", blush: "#F58E9B" },
  { name: "꿀", fill: "#EFBE92", blush: "#E97F86" },
  { name: "밤", fill: "#CE9468", blush: "#D96F72" },
  { name: "코코아", fill: "#A06C4A", blush: "#C8605F" },
  { name: "하늘", fill: "#D3E8FF", blush: "#FF9FBC" },
  { name: "민트", fill: "#D2F1DE", blush: "#FF9FBC" },
  { name: "라벤더", fill: "#E4D9FB", blush: "#FF9FBC" },
  { name: "레몬", fill: "#FFF1B8", blush: "#FF9AAE" },
  { name: "벚꽃", fill: "#FFDCE8", blush: "#FF8FAE" },
];

export interface HairCol {
  name: string;
  fill: string;
  /** 결을 그리는 밝은 선 */
  hi: string;
}
export const HAIR_COLS: HairCol[] = [
  { name: "먹색", fill: INK, hi: "#5C6980" },
  { name: "고동", fill: "#6B4A35", hi: "#94715A" },
  { name: "밤색", fill: "#A66B3D", hi: "#CC9566" },
  { name: "금빛", fill: "#F4C64E", hi: "#FCE39A" },
  { name: "주황", fill: "#EC7B3E", hi: "#F8AD7B" },
  { name: "분홍", fill: "#F47FA8", hi: "#FCB9CF" },
  { name: "파랑", fill: "#4A90F5", hi: "#95C0FB" },
  { name: "보라", fill: "#9272F0", hi: "#C0ADF8" },
  { name: "초록", fill: "#37B076", hi: "#86D8AE" },
  { name: "은빛", fill: "#C2CAD6", hi: "#EDF1F5" },
];

export interface TopCol {
  name: string;
  fill: string;
  /** 깃·주머니 같은 어두운 디테일 */
  d: string;
  /** 줄무늬·옆선처럼 옷 위에 얹는 대비 색 */
  on: string;
}
export const TOP_COLS: TopCol[] = [
  { name: "하양", fill: "#FFFFFF", d: "#DCE3EC", on: BLUE },
  { name: "파랑", fill: "#3F8CF7", d: "#2A6FDB", on: WHITE },
  { name: "하늘", fill: "#9CCBFF", d: "#6FAEF5", on: WHITE },
  { name: "초록", fill: "#3DB57C", d: "#289662", on: WHITE },
  { name: "노랑", fill: "#FFD557", d: "#EDB92B", on: WHITE },
  { name: "주황", fill: "#FF9E4A", d: "#EA7F23", on: WHITE },
  { name: "코랄", fill: "#FF7272", d: "#E85252", on: WHITE },
  { name: "분홍", fill: "#FFA3C4", d: "#F37FA8", on: WHITE },
  { name: "보라", fill: "#A084FA", d: "#8062E8", on: WHITE },
  { name: "남색", fill: "#3B4C78", d: "#2B3A60", on: WHITE },
  { name: "회색", fill: "#B5BECB", d: "#98A2B1", on: WHITE },
  { name: "먹색", fill: "#343F4E", d: "#232C38", on: WHITE },
];

export interface AccCol {
  name: string;
  fill: string;
  d: string;
}
export const ACC_COLS: AccCol[] = [
  { name: "파랑", fill: BLUE, d: "#1B64DA" },
  { name: "빨강", fill: "#F25C5C", d: "#D43F3F" },
  { name: "노랑", fill: GOLD, d: "#E8A917" },
  { name: "초록", fill: GREEN, d: "#1E8A54" },
  { name: "분홍", fill: "#FF8FB1", d: "#EE6C95" },
  { name: "보라", fill: "#8E6CF0", d: "#7350DA" },
  { name: "주황", fill: "#FF8A3D", d: "#E66D1E" },
  { name: "남색", fill: NAVY, d: "#2B3A60" },
  { name: "하양", fill: "#FFFFFF", d: "#DCE3EC" },
  { name: "먹색", fill: "#343F4E", d: "#232C38" },
];

/** 한 번의 합성에 쓰이는 색 문맥: 파츠 그리기 함수가 받는다. */
export interface Paint {
  skin: SkinCol;
  hair: HairCol;
  top: TopCol;
  acc: AccCol;
  /** 문서 안에서 유일한 id 접미. 클립·그라데이션 id가 다른 아바타 SVG와 겹치지 않게 한다. */
  uid: string;
}
type Draw = (p: Paint) => string;

export interface ArtPart {
  name: string;
  /** 몸·머리 뒤에 깔리는 레이어 */
  back?: Draw;
  /** 얼굴 위에 얹는 레이어 */
  front?: Draw;
}
export interface HairPart extends ArtPart {
  /** 정수리 위로 솟는 장식(새싹·똥머리·볏). 꼭대기를 덮는 모자를 쓰면 그리지 않는다. */
  knot?: Draw;
  /** 모자를 썼을 때 전용 모양. 없으면 모자 선 위쪽을 잘라 낸다. */
  hat?: { back?: Draw; front?: Draw };
  /** 모자를 썼을 때 덧그리는 조각(짧은 머리의 구레나룻). 잘라 낸 머리 위에 얹는다. */
  tuck?: Draw;
}
export interface AccPart extends ArtPart {
  /** 이 y보다 위의 머리카락은 모자 속으로 들어간다(가린다). */
  hatLine?: number;
  /** 정수리에 얹는 물건(왕관·학사모). 머리 위 장식(knot)만 숨긴다. */
  top?: boolean;
  /** 머리 위 장식(knot)을 이 물건보다 위에 그린다(헤드폰 밴드가 새싹 줄기를 가로지르지 않게). */
  knotOver?: boolean;
}

/* ── 그리기 헬퍼 ─────────────────────────────────────────── */
const SL = `stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"`;
/** 잉크 외곽선을 두른 면 */
const shape = (d: string, fill: string, sw = 2.6, extra = ""): string =>
  `<path d="${d}" fill="${fill}" ${SL} stroke-width="${sw}"${extra ? " " + extra : ""}/>`;
/** 선만 */
const line = (d: string, sw = 2.6, color = INK, extra = ""): string =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra ? " " + extra : ""}/>`;
/** 외곽선 없는 면 */
const fillOnly = (d: string, fill: string, extra = ""): string => `<path d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`;
const disc = (cx: number, cy: number, r: number, fill: string, sw = 0): string =>
  sw
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${SL} stroke-width="${sw}"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
/** 좌우 대칭(x=48 축) 복제 */
const flip = (svg: string): string => `<g transform="matrix(-1 0 0 1 96 0)">${svg}</g>`;
const both = (svg: string): string => svg + flip(svg);
const at = (x: number, y: number, rot: number, svg: string): string =>
  `<g transform="translate(${x} ${y}) rotate(${rot})">${svg}</g>`;

type Pt = [number, number];
const n2 = (v: number): number => Math.round(v * 100) / 100;
/** 경계점을 바깥으로 볼록한 호로 잇는다(곱슬·구름·방울). 점은 화면 기준 시계 방향으로 준다.
 *  chord가 true면 마지막 점에서 첫 점으로는 호 대신 직선으로 닫는다(머리 뒤에 숨는 변). */
function scallop(pts: Pt[], k = 0.62, chord = false): string {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  const last = chord ? pts.length - 1 : pts.length;
  for (let i = 1; i <= last; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    const r = n2(Math.hypot(b[0] - a[0], b[1] - a[1]) * k);
    d += ` A${r},${r} 0 0 1 ${b[0]},${b[1]}`;
  }
  return d + " z";
}
/** 타원 둘레 위의 점들(시계 방향, 각도는 도). a1은 포함하지 않는다. */
function ring(cx: number, cy: number, rx: number, ry: number, n: number, a0 = -180, a1 = 180): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([n2(cx + rx * Math.cos(t)), n2(cy + ry * Math.sin(t))]);
  }
  return out;
}
function star(cx: number, cy: number, R: number, r: number, rot = -90): string {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const t = ((rot + i * 36) * Math.PI) / 180;
    const q = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${n2(cx + q * Math.cos(t))},${n2(cy + q * Math.sin(t))} `;
  }
  return d + "z";
}
function heart(cx: number, cy: number, s: number): string {
  const x = (k: number): number => n2(cx + k * s);
  const y = (k: number): number => n2(cy + k * s);
  return (
    `M${x(0)},${y(0.9)} C${x(-1.3)},${y(0.05)} ${x(-1.1)},${y(-0.95)} ${x(-0.48)},${y(-0.95)} ` +
    `C${x(-0.16)},${y(-0.95)} ${x(0)},${y(-0.72)} ${x(0)},${y(-0.42)} ` +
    `C${x(0)},${y(-0.72)} ${x(0.16)},${y(-0.95)} ${x(0.48)},${y(-0.95)} ` +
    `C${x(1.1)},${y(-0.95)} ${x(1.3)},${y(0.05)} ${x(0)},${y(0.9)} z`
  );
}

/* ── 얼굴형 ──────────────────────────────────────────────────
   정수리 높이(y≈20.5~23)는 다섯 가지가 거의 같다. 그래야 머리카락·모자가 어느 얼굴에도 들뜨지 않는다.
   머리카락은 동글(반지름 24.5) 기준으로 그렸고 늘 얼굴보다 조금 크게 덮으므로, 얼굴이 좁아지는 쪽은 안전하다. */
const DOME = "M23.5,45 A24.5,24.5 0 0 1 72.5,45";
const head = (d: string): Draw => (p) => `<path d="${d}" fill="${p.skin.fill}" ${SL} stroke-width="3"/>`;
const oval = (cy: number, rx: number, ry: number): Draw => (p) =>
  `<ellipse cx="48" cy="${cy}" rx="${rx}" ry="${ry}" fill="${p.skin.fill}" ${SL} stroke-width="3"/>`;
export const FACES: ArtPart[] = [
  { name: "동글", front: head(`${DOME} A24.5,24.5 0 0 1 23.5,45 z`) },
  { name: "갸름", front: oval(46.8, 21.8, 26.3) },
  { name: "각진", front: head(`${DOME} L72.5,55 C72.5,64.5 67,69.6 58,69.6 L38,69.6 C29,69.6 23.5,64.5 23.5,55 z`) },
  { name: "통통", front: oval(46.6, 26.4, 23.4) },
  { name: "뾰족", front: head(`${DOME} C72.5,57 61.5,66.5 48,73.2 C34.5,66.5 23.5,57 23.5,45 z`) },
];

/* ── 머리 ──────────────────────────────────────────────────── */
const hairShape = (d: string, p: Paint, sw = 2.6): string => shape(d, p.hair.fill, sw);
const hairHi = (d: string, p: Paint, sw = 2): string => line(d, sw, p.hair.hi);
/** 머리끈·방울 색: 머리가 파랑이면 묻히니까 노랑으로 바꾼다. */
const tieOf = (p: Paint): string => (p.hair.fill === HAIR_COLS[6].fill ? GOLD : BLUE);

// 앞머리 3종(여러 머리 모양이 함께 쓴다)
/** 가운데 가르마 */
const CROWN_PART =
  "M21.5,46 C19.5,27 33,15.5 48,15.5 C63,15.5 76.5,27 74.5,46 C71,37.5 64,31.5 55.5,29.8 C52.5,29.2 50,28 48,26 C46,28 43.5,29.2 40.5,29.8 C32,31.5 25,37.5 21.5,46 z";
/** 짧게 내린 앞머리 */
const CROWN_FULL =
  "M22,45.5 C19.8,27 33,15.5 48,15.5 C63,15.5 76.2,27 74,45.5 C72,38 67,33 60,31 C52,29 44,29 36,31 C29,33 24,38 22,45.5 z";
/** 한쪽으로 쓸어 넘긴 앞머리 */
const CROWN_SWEEP =
  "M21.5,46 C19.5,27 33,15.5 48,15.5 C63,15.5 76.5,27 74.5,46 C73.5,38 69.5,31.5 63.5,28 C55,34.2 39.5,37 27.5,35.6 C24.8,38.6 22.6,42.2 21.5,46 z";
const crownPart: Draw = (p) => hairShape(CROWN_PART, p) + hairHi("M33,24 C37,20.2 41.5,18.4 45.5,18", p);
const crownFull: Draw = (p) => hairShape(CROWN_FULL, p) + hairHi("M31.5,25 C35.5,20.6 41,18.6 46,18.4", p);
/** 모자 아래로 내려온 구레나룻: 짧은 머리가 모자를 쓰면 민머리처럼 보이는 것을 막는다. */
const sideburns: Draw = (p) =>
  both(hairShape("M22,32 C21,38 21,45 22.6,50.6 C23.2,52.4 25.6,52.2 26.2,50.4 C27,46.5 27,39 26,32 z", p, 2.4));

const AFRO_RING = ring(48, 38, 31, 30, 16, -202.5, 157.5);
/** 뒤통수 구름: 턱 아래로는 내려가지 않게 양옆에서 끊고, 머리 뒤에 숨는 아랫변은 직선으로 닫는다. */
const AFRO_BACK: Pt[] = [[30, 63], [20.5, 57.5], ...AFRO_RING.slice(0, 11), [75.5, 57.5], [66, 63]];
const AFRO_FRONT: Pt[] = [
  ...AFRO_RING.slice(0, 11),
  [70.5, 40],
  [62.5, 33.5],
  [53, 31],
  [43, 31],
  [33.5, 33.5],
  [25.5, 40],
];
const AFRO_PUFF: Pt[] = [
  [22.5, 37.5],
  [27.5, 47],
  [27.5, 59.5],
  [21, 64],
  [13.5, 59.5],
  [11, 50.5],
  [14, 42],
];

export const HAIRS: HairPart[] = [
  { name: "민머리" },
  {
    // 브랜드 기본 캐릭터의 머리. 먹색(기본)일 때는 잎이 새싹 초록이고, 색을 고르면 잎이 그 색으로 물든다.
    name: "새싹",
    knot: (p) => {
      const leaf = p.hair.fill === INK ? GREEN : p.hair.fill;
      return (
        line("M48,22 L48,15.5", 2.6) +
        shape("M48,16.2 C45.5,10 40,7.8 34.5,9.4 C36.5,15.6 42.5,18.4 48,16.2 z", leaf, 2) +
        shape("M48,16.2 C50.5,10 56,7.8 61.5,9.4 C59.5,15.6 53.5,18.4 48,16.2 z", leaf, 2)
      );
    },
  },
  {
    name: "바가지",
    front: (p) =>
      hairShape(
        "M21.8,48 C19.5,28 33,15.5 48,15.5 C63,15.5 76.5,28 74.2,48 C73,48.8 71.2,48.6 70,47.6 C70.5,38 66,33.5 60,32 C52,30.5 44,30.5 36,32 C30,33.5 25.5,38 26,47.6 C24.8,48.6 23,48.8 21.8,48 z",
        p,
      ) + hairHi("M31,25.5 C35,21 41,18.8 46.5,18.6", p),
    tuck: sideburns,
  },
  {
    name: "까치머리",
    front: (p) =>
      hairShape(
        "M22.5,41 L20,27.5 L28,30 L26.5,16.5 L35.5,22 L37.5,9.5 L45.5,18 L50.5,6.5 L55.5,18 L63.5,10 L64.5,22.5 L73.5,17 L70.5,30 L77,28.5 L73.5,41 " +
          "L69.5,35.5 L64.5,38.5 L60.5,32.5 L55,37 L50,31.5 L44.5,37 L40,32 L35,38 L31,33.5 L26.5,37.5 z",
        p,
      ),
    tuck: sideburns,
  },
  {
    name: "곱슬",
    front: (p) =>
      hairShape(
        scallop([
          [21.5, 42],
          [19.5, 31],
          [25, 21.5],
          [35, 14.5],
          [48, 12],
          [61, 14.5],
          [71, 21.5],
          [76.5, 31],
          [74.5, 42],
          [66, 37],
          [57, 34.5],
          [48, 36],
          [39, 34.5],
          [30, 37],
        ]),
        p,
      ) +
      hairHi("M33,22.5 C34.5,20.4 37.5,20.2 38.6,22.4 M49,18.6 C50.5,16.6 53.6,16.6 54.8,18.8 M61,25 C62.4,23.2 65,23.2 66,25", p, 1.8),
    tuck: sideburns,
  },
  {
    name: "양갈래",
    back: (p) =>
      both(hairShape("M25,39.5 C16,42 10.5,52.5 12.5,63 C14,70.5 21.5,72 25.5,66.5 C29.5,61 29,48 25,39.5 z", p)),
    front: (p) => crownPart(p) + disc(23.6, 42.4, 3.1, tieOf(p), 2) + disc(72.4, 42.4, 3.1, tieOf(p), 2),
  },
  {
    name: "포니테일",
    back: (p) =>
      hairShape(
        "M62.5,21 C70.5,13 82,16.5 84,26.5 C85.5,38 81,52.5 76.5,63.5 C75.3,66.3 72,65.8 72,63 C73,52.5 72.5,41.5 69,32.5 C67.5,28.5 65.5,24.5 62.5,21 z",
        p,
      ) + hairHi("M77.5,26.5 C79.4,35 78.6,45 76,54", p),
    front: (p) =>
      hairShape(CROWN_SWEEP, p) + hairHi("M33,24 C37,20.2 41.5,18.4 45.5,18", p) + disc(66.2, 23.4, 3.3, tieOf(p), 2),
    // 모자를 쓰면 꼬리를 낮게 묶은 모양으로 바꾼다(위로 솟은 꼬리는 모자와 싸운다).
    hat: {
      back: (p) =>
        hairShape("M70.5,39 C78,39.5 83.5,45 83,52.5 C82.6,58.5 79.6,63.5 76.4,66 C74.8,67 72.8,66 73,64 C74.2,57 73.6,48.5 70.5,39 z", p) +
        hairHi("M78.4,46.5 C79.4,51 78.6,56 76.6,60", p),
      front: sideburns,
    },
  },
  {
    name: "긴 생머리",
    back: (p) => both(hairShape("M23.5,34 C16,47 14.5,66 16.5,100 L34,100 C30.5,70 30,50 32.5,37 z", p)),
    front: crownPart,
  },
  {
    name: "단발",
    front: (p) =>
      hairShape(
        "M21,50 C17.5,28 32,15.5 48,15.5 C64,15.5 78.5,28 75,50 C75.5,56 75,61 73.5,65.5 C70.5,67.5 66,67 63.5,64.5 C66,56 66.5,46 65,39.5 C60,33 54,31 48,31 C42,31 36,33 31,39.5 C29.5,46 30,56 32.5,64.5 C30,67 25.5,67.5 22.5,65.5 C21,61 20.5,56 21,50 z",
        p,
      ) + hairHi("M30.5,26 C34.5,21.2 40.5,18.8 46.5,18.6", p),
  },
  // ── v2 추가 ──
  {
    name: "뽀글파마",
    back: (p) => hairShape(scallop(AFRO_BACK, 0.62, true), p),
    front: (p) =>
      hairShape(scallop(AFRO_FRONT), p) +
      hairHi("M27,22 C28.6,19.6 32,19.6 33.2,22 M46,13 C47.6,10.8 51,10.8 52.2,13.2 M64,20.5 C65.6,18.4 68.6,18.6 69.6,21 M38,25.5 C39.4,23.6 42.2,23.6 43.2,25.6", p, 1.8),
    hat: { back: (p) => both(hairShape(scallop(AFRO_PUFF), p)) },
  },
  {
    name: "똥머리",
    knot: (p) => hairShape(scallop(ring(48, 10.8, 8.6, 7.8, 7, -180, 180), 0.7), p) + hairHi("M43.5,9 C45,6.4 49.5,5.6 52,7.4", p, 1.8),
    front: crownFull,
    tuck: sideburns,
  },
  {
    name: "모히칸",
    knot: (p) =>
      hairShape("M37.5,25.6 L34.4,11.4 L40.6,15.4 L42,2.6 L48,10.6 L53,1.8 L55.6,12.6 L61.6,9 L58.6,25.6 C54,23 42,23 37.5,25.6 z", p),
  },
  {
    name: "땋은 머리",
    back: (p) => {
      const seg = (cx: number, cy: number, rot: number): string =>
        `<ellipse cx="${cx}" cy="${cy}" rx="5.4" ry="4.9" transform="rotate(${rot} ${cx} ${cy})" fill="${p.hair.fill}" ${SL} stroke-width="2.4"/>`;
      const braid =
        hairShape("M19.6,78 C18.2,82 18.6,85.5 20.4,88.5 C22.6,85.6 23.4,82 22.6,78 z", p, 2.2) +
        seg(21.2, 72.5, -16) +
        seg(19.8, 65, 16) +
        seg(19.4, 57.5, -16) +
        seg(19.8, 50, 16) +
        `<rect x="17.4" y="75.4" width="7" height="3.6" rx="1.8" fill="${tieOf(p)}" ${SL} stroke-width="1.6"/>`;
      return both(braid);
    },
    front: crownPart,
  },
  {
    name: "웨이브",
    back: (p) =>
      both(
        hairShape(
          "M24,33.5 A8.2,8.2 0 0 0 16.5,45 A7.6,7.6 0 0 0 13.8,56.5 A7.6,7.6 0 0 0 15.6,68.5 A7.8,7.8 0 0 0 14.4,81 A7.8,7.8 0 0 0 15.4,93.5 L16,100 L34,100 C30.6,70 30.4,50 33,37 z",
          p,
        ),
      ),
    front: crownPart,
  },
  {
    name: "올림머리",
    front: (p) =>
      hairShape(
        "M22,44 C20.4,36 21.6,29 25.6,23.6 C23.6,16 30,9.6 38.6,9.6 C43,6 52,5.6 57.6,8.6 C66,8 73.6,14 73.6,22.6 C76.6,28.6 76.6,37 74,44 C72.6,37.6 70,32.6 66,29.6 C56,31.6 40,31.6 30,29.6 C26,32.6 23.6,37.6 22,44 z",
        p,
      ) + hairHi("M31.5,20.5 C35,15.4 41,13 47,13.4 M52.5,12.6 C58,13 63,16 66,20.6", p),
    tuck: sideburns,
  },
  {
    name: "덮은 머리",
    front: (p) =>
      hairShape(
        "M21.5,49 C19,28 33,15.5 48,15.5 C63,15.5 77,28 74.5,49 C73.2,49.8 71.5,49.6 70.5,48.6 C70.8,45 70.2,41.5 69,38.5 " +
          "L63.5,39.5 L61.5,36.5 L56.5,39.6 L53,36.8 L48,39.8 L43,36.8 L39.5,39.6 L34.5,36.5 L32.5,39.5 L27,38.5 " +
          "C25.8,41.5 25.2,45 25.5,48.6 C24.5,49.6 22.8,49.8 21.5,49 z",
        p,
      ) + hairHi("M30.5,26 C34.5,21.2 40.5,18.8 46.5,18.6", p),
    tuck: sideburns,
  },
  {
    name: "사과머리",
    knot: (p) =>
      hairShape("M48,18 C43,13.6 40.6,8 42,2.8 C45,4.6 47.2,7.4 48,10.4 C48.8,7.4 51,4.6 54,2.8 C55.4,8 53,13.6 48,18 z", p, 2.2) +
      disc(48, 18.2, 2.7, tieOf(p), 1.8),
    front: crownFull,
    tuck: sideburns,
  },
];

/* ── 눈 ────────────────────────────────────────────────────── */
const eyeDots = (y = 44, r = 2.6): string => disc(39, y, r, INK) + disc(57, y, r, INK);
export const EYES: ArtPart[] = [
  { name: "점눈", front: () => eyeDots() },
  { name: "웃음눈", front: () => line("M34.5,45.5 C36.5,41.5 41.5,41.5 43.5,45.5 M52.5,45.5 C54.5,41.5 59.5,41.5 61.5,45.5", 3) },
  {
    name: "또랑눈",
    front: () => disc(39, 44, 5.2, WHITE, 2.5) + disc(57, 44, 5.2, WHITE, 2.5) + disc(40, 44.6, 2, INK) + disc(58, 44.6, 2, INK),
  },
  {
    name: "반짝눈",
    front: () => disc(39, 44, 4.4, INK) + disc(57, 44, 4.4, INK) + disc(40.5, 42.5, 1.5, WHITE) + disc(58.5, 42.5, 1.5, WHITE),
  },
  { name: "졸린눈", front: () => line("M34.5,43.5 C36.5,46.5 41.5,46.5 43.5,43.5 M52.5,43.5 C54.5,46.5 59.5,46.5 61.5,43.5", 3) },
  { name: "윙크", front: () => disc(39, 44, 2.6, INK) + line("M52.5,44.5 C54.5,41 59.5,41 61.5,44.5", 3) },
  // ── v2 추가 ──
  {
    name: "초롱눈",
    front: () =>
      `<ellipse cx="39" cy="44.4" rx="4.5" ry="5.5" fill="${INK}"/><ellipse cx="57" cy="44.4" rx="4.5" ry="5.5" fill="${INK}"/>` +
      disc(40.6, 42.2, 1.7, WHITE) +
      disc(58.6, 42.2, 1.7, WHITE) +
      disc(37.6, 46.9, 0.9, WHITE) +
      disc(55.6, 46.9, 0.9, WHITE),
  },
  { name: "결심한 눈", front: () => line("M33.4,37.6 L43.4,40.6 M62.6,37.6 L52.6,40.6", 3) + eyeDots(45.4, 2.7) },
  { name: "별눈", front: () => shape(star(39, 44.2, 5.6, 2.5), GOLD, 1.8) + shape(star(57, 44.2, 5.6, 2.5), GOLD, 1.8) },
  {
    name: "깜짝눈",
    front: () =>
      disc(39, 44.6, 5.2, WHITE, 2.5) +
      disc(57, 44.6, 5.2, WHITE, 2.5) +
      disc(39, 44.6, 1.6, INK) +
      disc(57, 44.6, 1.6, INK) +
      line("M34.8,36 C36.8,34.2 41.2,34.2 43.2,36 M52.8,36 C54.8,34.2 59.2,34.2 61.2,36", 2.4),
  },
  {
    name: "옆눈",
    front: () =>
      `<ellipse cx="39" cy="44.2" rx="5.5" ry="4" fill="${WHITE}" ${SL} stroke-width="2.5"/><ellipse cx="57" cy="44.2" rx="5.5" ry="4" fill="${WHITE}" ${SL} stroke-width="2.5"/>` +
      disc(41.7, 44.4, 2.1, INK) +
      disc(59.7, 44.4, 2.1, INK),
  },
  {
    name: "속눈썹",
    front: () => eyeDots(44, 2.8) + line("M36.2,41.8 L33.8,39.6 M35.4,44 L32.4,43.2 M59.8,41.8 L62.2,39.6 M60.6,44 L63.6,43.2", 2),
  },
  { name: "질끈 감은 눈", front: () => line("M35,40.6 L42.6,44 L35,47.4 M61,40.6 L53.4,44 L61,47.4", 3) },
  { name: "하트눈", front: () => shape(heart(39, 44.4, 4.6), "#FF6F91", 1.8) + shape(heart(57, 44.4, 4.6), "#FF6F91", 1.8) },
];

/* ── 입·표정 ───────────────────────────────────────────────── */
export const MOUTHS: ArtPart[] = [
  { name: "미소", front: () => line("M42,55.5 C45,58.8 51,58.8 54,55.5", 3) },
  { name: "활짝", front: () => shape("M40,54 C42,61 54,61 56,54 z", INK, 2) },
  { name: "오", front: () => `<ellipse cx="48" cy="57.5" rx="3.6" ry="4.4" fill="${INK}"/>` },
  { name: "새침", front: () => line("M42.5,56.5 C46,54.8 50,58.2 53.5,56.5", 3) },
  { name: "씨익", front: () => line("M43.5,56.5 C47.5,59 53,57.5 55.5,53.5", 3) },
  {
    name: "메롱",
    front: () => line("M42,55 C45,58 51,58 54,55", 3) + shape("M44.8,57 C44.8,63 51.2,63 51.2,57.2 z", PINK, 1.8),
  },
  // ── v2 추가 ──
  {
    name: "이히",
    front: () => shape("M39.6,54 L56.4,54 C56.4,62.6 39.6,62.6 39.6,54 z", WHITE, 2.5) + line("M48,54.4 L48,60 M43.6,54.4 L43.6,58.6 M52.4,54.4 L52.4,58.6", 1.5),
  },
  { name: "뾰로통", front: () => line("M42.5,58.6 C45.5,55.4 50.5,55.4 53.5,58.6", 3) },
  { name: "고양이입", front: () => line("M41.4,55.4 C42.2,59.3 47.2,59.5 48,55.9 C48.8,59.5 53.8,59.3 54.6,55.4", 2.8) },
  { name: "일자", front: () => line("M43,57 L53,57", 3) },
  {
    name: "껄껄",
    front: () =>
      shape("M39.6,53.6 C40.6,63.8 55.4,63.8 56.4,53.6 z", INK, 2) +
      fillOnly("M43.6,59.8 C45.6,57.6 50.4,57.6 52.4,59.8 C50.6,62.2 45.4,62.2 43.6,59.8 z", PINK),
  },
  {
    name: "덧니",
    front: () => shape("M41.4,54.4 C43.6,61.4 52.4,61.4 54.6,54.4 z", INK, 2) + fillOnly("M44.4,54.6 L48.4,54.6 L46.4,58.8 z", WHITE),
  },
];

/* ── 볼(얼굴 포인트) ───────────────────────────────────────── */
export const CHEEKS: ArtPart[] = [
  { name: "없음" },
  {
    name: "볼터치",
    front: (p) =>
      `<ellipse cx="32.6" cy="52.6" rx="4.4" ry="2.9" fill="${p.skin.blush}" opacity=".85"/><ellipse cx="63.4" cy="52.6" rx="4.4" ry="2.9" fill="${p.skin.blush}" opacity=".85"/>`,
  },
  {
    name: "주근깨",
    front: () => {
      const d = disc(30.4, 51.4, 0.95, INK) + disc(33.4, 53.6, 0.95, INK) + disc(36.2, 51.2, 0.95, INK);
      return `<g opacity=".5">${both(d)}</g>`;
    },
  },
  {
    name: "반창고",
    front: () =>
      at(
        63.4,
        52.4,
        -18,
        `<rect x="-6.2" y="-2.7" width="12.4" height="5.4" rx="2.5" fill="#F6D9B4" ${SL} stroke-width="1.8"/>` +
          `<rect x="-2" y="-1.8" width="4" height="3.6" rx=".8" fill="#E9BE8C"/>`,
      ),
  },
  { name: "별 스티커", front: () => shape(star(31.8, 52.6, 4.3, 1.95), GOLD, 1.6) },
  { name: "하트 스티커", front: () => shape(heart(64, 52.8, 3.6), "#FF6F91", 1.6) },
  {
    name: "빗금 볼",
    front: (p) => both(line("M29.4,54.6 L31.4,50.6 M32.6,54.6 L34.6,50.6 M35.8,54.6 L37.8,50.6", 1.8, p.skin.blush)),
  },
];

/* ── 안경 ──────────────────────────────────────────────────── */
const TEMPLES = "M31,43.5 L26,42 M65,43.5 L70,42";
export const GLASSES: ArtPart[] = [
  { name: "없음" },
  {
    name: "둥근 안경",
    front: () =>
      `<circle cx="39" cy="45" r="8" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="57" cy="45" r="8" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
      line("M47,44.5 C47.6,43.8 48.4,43.8 49,44.5 " + TEMPLES, 2.5),
  },
  {
    name: "사각 안경",
    front: () =>
      `<rect x="31" y="38.5" width="15" height="12.5" rx="3.5" fill="none" stroke="${INK}" stroke-width="2.5"/><rect x="50" y="38.5" width="15" height="12.5" rx="3.5" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
      line("M46,43.5 h4 M31,42.5 L26.5,41.5 M65,42.5 L69.5,41.5", 2.5),
  },
  {
    name: "뿔테 안경",
    front: () =>
      `<rect x="30.5" y="38" width="16" height="13" rx="4.5" fill="none" stroke="${INK}" stroke-width="3.5"/><rect x="49.5" y="38" width="16" height="13" rx="4.5" fill="none" stroke="${INK}" stroke-width="3.5"/>` +
      line("M46.5,43 h3", 3),
  },
  {
    name: "선글라스",
    front: () =>
      `<rect x="30.5" y="38" width="16" height="13" rx="4.5" fill="${INK}"/><rect x="49.5" y="38" width="16" height="13" rx="4.5" fill="${INK}"/>` +
      line("M46.5,43 h3 M30.5,42.5 L26,41.5 M65.5,42.5 L70,41.5", 2.5) +
      line("M33.4,41.4 L36.6,41.4 M52.4,41.4 L55.6,41.4", 1.6, "#7C889B"),
  },
  // ── v2 추가 ──
  {
    name: "보안경",
    front: () =>
      line("M27.6,44 L23.4,43 M68.4,44 L72.6,43", 4.2) +
      `<rect x="27.6" y="36.6" width="40.8" height="16" rx="7.4" fill="#BFE3FF" fill-opacity=".6" ${SL} stroke-width="2.6"/>` +
      line("M32.6,40.8 L38.2,40.8", 2, WHITE) +
      line("M46.2,52.6 C46.8,49.8 49.2,49.8 49.8,52.6", 2.2),
  },
  {
    name: "노을 선글라스",
    front: () =>
      disc(39, 45, 7.8, "#FF9A4D", 2.5) +
      disc(57, 45, 7.8, "#FF9A4D", 2.5) +
      line("M46.8,44.5 C47.5,43.7 48.5,43.7 49.2,44.5 " + TEMPLES, 2.5) +
      line("M34.6,42.4 C35.4,40.8 36.8,39.8 38.4,39.6 M52.6,42.4 C53.4,40.8 54.8,39.8 56.4,39.6", 1.6, "#FFD0A0"),
  },
  {
    name: "반테 안경",
    front: () =>
      line("M31,41 C31,52.4 46.4,52.4 46.4,41 M49.6,41 C49.6,52.4 65,52.4 65,41", 1.8) +
      line("M30.4,40.6 L46.8,40.6 M49.2,40.6 L65.6,40.6", 3.6) +
      line("M46.8,42 h2.4 M30.4,41 L26,40.4 M65.6,41 L70,40.4", 2.5),
  },
  {
    name: "하트 안경",
    front: () =>
      shape(heart(39, 45.2, 7.4), "#FF8FB1", 2.4, `fill-opacity=".38"`) +
      shape(heart(57, 45.2, 7.4), "#FF8FB1", 2.4, `fill-opacity=".38"`) +
      line("M46.6,42.6 h2.8 M31.2,41.6 L26.2,41 M64.8,41.6 L69.8,41", 2.4),
  },
];

/* ── 모자·머리 장식 ──────────────────────────────────────────
   모든 물건이 '모자 색'에 반응한다(색 줄을 눌렀는데 아무 일도 안 일어나는 죽은 조작을 없앤다).
   왕관은 금색이 정체성이라 보석만, 밀짚모자는 띠만, 우주 헬멧은 목 고리만 색을 따른다. */
/** 왕관 보석 색: 모자 색을 따르되 금색과 겹치는 노랑이면 코랄로 바꾼다. */
const gem = (p: Paint): string => (p.acc.fill === GOLD ? CORAL : p.acc.fill);
export const ACCS: AccPart[] = [
  { name: "없음" },
  {
    name: "비니",
    hatLine: 38.5,
    front: (p) =>
      shape("M21,38.5 C19,22.5 31.5,11.5 48,11.5 C64.5,11.5 77,22.5 75,38.5 C66,34.5 30,34.5 21,38.5 z", p.acc.fill) +
      shape("M19.8,37.6 C29,32.8 67,32.8 76.2,37.6 L76.6,43.6 C67,38.2 29,38.2 19.4,43.6 z", p.acc.d) +
      line("M29.4,35.6 L29,41 M38.8,34.2 L38.6,39.4 M48,33.9 L48,39 M57.2,34.2 L57.4,39.4 M66.6,35.6 L67,41", 1.5, INK, `opacity=".45"`) +
      disc(48, 9.4, 5.2, WHITE, 2.4),
  },
  {
    name: "야구모자",
    hatLine: 35.5,
    front: (p) =>
      shape("M54,31.6 C66,31 81,34 89,40.4 C90.6,41.8 89.4,44.4 87.2,44 C78,42.2 69,40 61,39.2 C57.6,38.8 55,35.8 54,31.6 z", p.acc.d) +
      shape("M21,36.5 C19.5,21.5 31.5,11.8 48,11.8 C64.5,11.8 76.5,21.5 75,36.5 C66,32.4 30,32.4 21,36.5 z", p.acc.fill) +
      line("M48,12.6 C42,18 38.6,25 37.6,33 M48,12.6 C54,18 57.4,25 58.4,33", 1.6, p.acc.d) +
      disc(48, 11.8, 2.3, p.acc.d, 1.6),
  },
  {
    name: "헤드폰",
    knotOver: true,
    front: (p) =>
      line("M22.5,42 C20.5,22 33,11.5 48,11.5 C63,11.5 75.5,22 73.5,42", 5.4) +
      line("M22.5,42 C20.5,22 33,11.5 48,11.5 C63,11.5 75.5,22 73.5,42", 1.8, p.acc.fill) +
      `<rect x="16.4" y="38.5" width="10.6" height="17" rx="5.3" fill="${p.acc.fill}" ${SL} stroke-width="2.6"/>` +
      `<rect x="69" y="38.5" width="10.6" height="17" rx="5.3" fill="${p.acc.fill}" ${SL} stroke-width="2.6"/>`,
  },
  // ── v2 추가 ──
  {
    name: "머리띠",
    front: (p) =>
      shape("M74,33.4 C78.4,29.4 82.6,29.2 85.4,31.2 C83,32.8 81.2,34.6 80.2,36.8 z", p.acc.fill, 2.2) +
      shape("M74.2,35.6 C78,37.2 81,40.8 81.6,45 C78.4,44 75.8,41.8 74.4,39 z", p.acc.fill, 2.2) +
      shape("M22.2,31.4 C30,27.2 66,27.2 73.8,31.4 L74.6,37.6 C66,33.4 30,33.4 21.4,37.6 z", p.acc.fill) +
      disc(74.8, 34.6, 2.7, p.acc.d, 2),
  },
  {
    name: "왕관",
    top: true,
    front: (p) =>
      shape("M33,22.6 L30.4,8.6 L39,15.2 L48,5 L57,15.2 L65.6,8.6 L63,22.6 C58,20.6 38,20.6 33,22.6 z", GOLD) +
      disc(30.4, 8.4, 2, gem(p), 1.5) +
      disc(48, 4.8, 2, gem(p), 1.5) +
      disc(65.6, 8.4, 2, gem(p), 1.5) +
      shape("M48,14.6 L50.4,17.6 L48,20.4 L45.6,17.6 z", gem(p), 1.4),
  },
  {
    name: "버킷햇",
    hatLine: 38,
    front: (p) =>
      shape("M27,31 C27,19 35.5,12.5 48,12.5 C60.5,12.5 69,19 69,31 z", p.acc.fill) +
      shape(
        "M15.5,38.5 C19,30.5 31,28.5 48,28.5 C65,28.5 77,30.5 80.5,38.5 C81.5,41.5 78.5,43.5 75.5,42.3 C67,39 29,39 20.5,42.3 C17.5,43.5 14.5,41.5 15.5,38.5 z",
        p.acc.fill,
      ) +
      line("M27.4,30.4 C33.4,28 62.6,28 68.6,30.4", 2.2, p.acc.d),
  },
  {
    name: "리본",
    front: (p) =>
      at(
        33.5,
        19.5,
        -24,
        shape("M0,0 C-5,-8 -14,-9 -15.5,-3.5 C-16.5,2 -12,7 0,0 z", p.acc.fill, 2.4) +
          shape("M0,0 C5,-8 14,-9 15.5,-3.5 C16.5,2 12,7 0,0 z", p.acc.fill, 2.4) +
          `<rect x="-2.8" y="-3.4" width="5.6" height="6.8" rx="2.4" fill="${p.acc.d}" ${SL} stroke-width="2"/>`,
      ),
  },
  {
    name: "고양이 귀",
    front: (p) =>
      both(shape("M25,27.5 L22.4,8.6 L40.4,17.6 z", p.acc.fill) + fillOnly("M27.6,22.4 L26.2,13.6 L34.8,17.9 z", p.acc.fill === "#FF8FB1" ? "#FFE3EC" : "#FF9EB5")),
  },
  {
    name: "학사모",
    top: true,
    front: (p) => {
      const tassel = p.acc.fill === GOLD ? WHITE : GOLD;
      return (
        shape("M30,27 C30,19.5 38,16.5 48,16.5 C58,16.5 66,19.5 66,27 C60,24.8 36,24.8 30,27 z", p.acc.d) +
        shape("M48,3.6 L80,13 L48,22.4 L16,13 z", p.acc.fill) +
        line("M48,13 L69.6,15.8 L70,26", 1.8, tassel) +
        shape("M68.2,25.6 L71.8,25.6 L72.4,32.6 L67.6,32.6 z", tassel, 1.4) +
        disc(48, 13, 1.9, tassel, 1.3)
      );
    },
  },
  {
    name: "꽃핀",
    front: (p) => {
      const petals = ring(29.5, 24.5, 4.4, 4.4, 5, -90, 270)
        .map(([x, y]) => disc(x, y, 3.5, p.acc.fill, 1.7))
        .join("");
      return petals + disc(29.5, 24.5, 2.7, GOLD, 1.5);
    },
  },
  {
    name: "밀짚모자",
    hatLine: 34.5,
    front: (p) =>
      shape("M30,29.5 C30,18 37.5,12 48,12 C58.5,12 66,18 66,29.5 z", "#F3D68E") +
      shape(
        "M10.5,33.5 C13,27.5 30,25.5 48,25.5 C66,25.5 83,27.5 85.5,33.5 C86.5,37 82.5,39.3 79,38.3 C68,35.6 28,35.6 17,38.3 C13.5,39.3 9.5,37 10.5,33.5 z",
        "#F3D68E",
      ) +
      shape("M30,26.8 C36,24.6 60,24.6 66,26.8 L66,30.2 C60,28 36,28 30,30.2 z", p.acc.fill, 1.8),
  },
  {
    name: "우주 헬멧",
    front: (p) =>
      `<circle cx="48" cy="43.5" r="37.2" fill="#BFE3FF" fill-opacity=".2" ${SL} stroke-width="2.6"/>` +
      line("M21.5,29.5 C25.5,20 33,13.6 41.5,11", 3, WHITE, `opacity=".9"`) +
      line("M18.6,37.5 C18.8,36 19.2,34.6 19.6,33.2", 3, WHITE, `opacity=".9"`) +
      shape("M24.6,74.4 C31.6,81 64.4,81 71.4,74.4 L72.6,80.6 C65.4,87.6 30.6,87.6 23.4,80.6 z", p.acc.fill, 2.4),
  },
  {
    name: "마법사 모자",
    hatLine: 32.5,
    front: (p) =>
      shape("M30.5,27.5 C35,18 40,8.5 46,2.6 C48.5,0.8 52.5,1.6 55.5,4.2 C53,4.6 51,6.2 50,8.2 C56,13.6 62,20.6 66,27.5 z", p.acc.fill) +
      shape(
        "M14.5,31 C18.5,25.5 32,24.5 48,24.5 C64,24.5 77.5,25.5 81.5,31 C83,34.5 79.5,36.8 76,35.8 C66,33 30,33 20,35.8 C16.5,36.8 13,34.5 14.5,31 z",
        p.acc.fill,
      ) +
      line("M31.6,26.4 C37,24.6 59,24.6 64.8,26.4", 2.4, p.acc.d) +
      fillOnly(star(43.5, 17, 3.3, 1.5), GOLD) +
      fillOnly(star(52.6, 12.2, 2.2, 1), GOLD),
  },
];

/* ── 옷(상반신) ────────────────────────────────────────────── */
const BUST_D = "M21.5,97 C23.5,79 33,71.5 48,71.5 C63,71.5 72.5,79 74.5,97";
const bust = (fill: string): string => `<path d="${BUST_D}" fill="${fill}" ${SL} stroke-width="3"/>`;
/** 겉옷 아래에 받쳐 입는 티 색: 겉옷이 흰색이면 묻히니 하늘색으로 받친다. */
const under = (p: Paint): string => (p.top.fill === "#FFFFFF" ? "#9CCBFF" : "#FFFFFF");
export const TOPS: ArtPart[] = [
  { name: "브이넥 티", front: (p) => bust(p.top.fill) + line("M42.5,73.5 L48,79 L53.5,73.5", 2.5) },
  {
    name: "라운드 티",
    front: (p) => bust(p.top.fill) + shape("M39.6,73.2 C42,80 54,80 56.4,73.2 L53.4,72.6 C51.8,76.8 44.2,76.8 42.6,72.6 z", p.top.d, 2.2),
  },
  {
    name: "후드티",
    back: (p) => shape("M30.5,81 C25.5,71 28.5,61 36.5,58.5 L59.5,58.5 C67.5,61 70.5,71 65.5,81 z", p.top.fill),
    front: (p) =>
      bust(p.top.fill) +
      line("M41.5,73.2 L48,81.5 L54.5,73.2", 2.5) +
      line("M45,78.6 L44.4,86.6 M51,78.6 L51.6,86.6", 2) +
      disc(44.4, 87.4, 1.4, WHITE, 1.4) +
      disc(51.6, 87.4, 1.4, WHITE, 1.4),
  },
  {
    name: "줄무늬 티",
    front: (p) =>
      `<clipPath id="sb${p.uid}"><path d="${BUST_D} L74.5,100 L21.5,100 z"/></clipPath>` +
      bust(p.top.fill) +
      `<g clip-path="url(#sb${p.uid})"><rect x="16" y="80.6" width="64" height="3.8" fill="${p.top.on}"/><rect x="16" y="88.4" width="64" height="3.8" fill="${p.top.on}"/></g>` +
      `<path d="${BUST_D}" fill="none" ${SL} stroke-width="3"/>` +
      line("M41,73.4 C43.4,78 52.6,78 55,73.4", 2.5),
  },
  {
    name: "셔츠와 넥타이",
    front: (p) => {
      const tie = p.top.fill === NAVY || p.top.fill === "#343F4E" ? CORAL : NAVY;
      return (
        bust(p.top.fill) +
        shape("M46,79.6 L50,79.6 L51.4,91.4 L48,95.6 L44.6,91.4 z", tie, 1.8) +
        shape("M40.8,72.8 L48,79.4 L43.4,83.8 L37.6,75.6 z", p.top.fill, 2.2) +
        shape("M55.2,72.8 L48,79.4 L52.6,83.8 L58.4,75.6 z", p.top.fill, 2.2)
      );
    },
  },
  {
    name: "멜빵바지",
    front: (p) =>
      bust(under(p)) +
      line("M41,73.4 C43.4,77.6 52.6,77.6 55,73.4", 2.3) +
      shape("M35.5,97 L35.5,85 C35.5,82.6 37.2,81 39.5,81 L56.5,81 C58.8,81 60.5,82.6 60.5,85 L60.5,97", p.top.fill) +
      shape("M36.2,81.4 L40.8,81.4 L39.2,73 L34.6,74.3 z", p.top.fill, 2.2) +
      shape("M59.8,81.4 L55.2,81.4 L56.8,73 L61.4,74.3 z", p.top.fill, 2.2) +
      disc(38.5, 83, 1.5, GOLD, 1.2) +
      disc(57.5, 83, 1.5, GOLD, 1.2) +
      line("M43.6,87 L52.4,87 L52.4,91.4 C50.4,93.6 45.6,93.6 43.6,91.4 z", 1.6, p.top.d),
  },
  {
    name: "실험 가운",
    front: (p) =>
      bust(WHITE) +
      fillOnly("M41,72.6 L55,72.6 L48,90 z", p.top.fill === "#FFFFFF" ? "#CFE4FF" : p.top.fill) +
      line("M42.6,73 C44.4,76.8 51.6,76.8 53.4,73", 2) +
      line("M41,72.6 L48,90 L55,72.6 M48,90 L48,97", 2.4) +
      line("M41,72.6 L36.4,79.6 L43.2,81.8 M55,72.6 L59.6,79.6 L52.8,81.8", 2) +
      line("M29.4,88.4 L36.8,88.4 L36.8,97", 1.8) +
      line("M33,84.6 L33,90", 2.2, BLUE),
  },
  {
    name: "목도리",
    front: (p) =>
      bust(under(p)) +
      shape("M53.4,81 L61.6,82.6 L62.6,96.6 L54.4,97 z", p.top.fill, 2.4) +
      line("M54.6,90.6 L62.2,90", 1.8, p.top.d) +
      shape(
        "M31.5,74.5 C37.5,69.8 58.5,69.8 64.5,74.5 C66,78 65.5,81.5 63.5,83.5 C56.5,79.5 39.5,79.5 32.5,83.5 C30.5,81.5 30,78 31.5,74.5 z",
        p.top.fill,
      ) +
      line("M38,74 L37.2,80.4 M48,72.8 L48,79.4 M58,74 L58.8,80.4", 1.8, p.top.d),
  },
  {
    name: "집업 저지",
    front: (p) =>
      bust(p.top.fill) +
      line("M26.8,97 C28.6,84.6 34.4,77.6 42.6,74.8 M69.2,97 C67.4,84.6 61.6,77.6 53.4,74.8", 2.2, p.top.on) +
      line("M48,78.6 L48,97", 2) +
      shape("M40.6,73 L44.6,80.2 L48,78.4 L51.4,80.2 L55.4,73 C53,75.6 43,75.6 40.6,73 z", p.top.d, 2.2) +
      disc(48, 83.4, 1.5, "#E3E9F1", 1.2),
  },
  {
    name: "망토",
    back: (p) => shape("M32,73.5 C21,78 13,88 10.5,97 L85.5,97 C83,88 75,78 64,73.5 z", p.top.fill),
    front: (p) =>
      bust(under(p)) +
      line("M36.6,74.4 C40.6,79.8 55.4,79.8 59.4,74.4", 2.6) +
      shape(star(48, 88.6, 5.4, 2.4), GOLD, 1.6) +
      disc(48, 78.6, 2.3, GOLD, 1.5),
  },
];

/* ── 손에 든 것 ────────────────────────────────────────────── */
/** 물건을 쥔 주먹: 피부색 동그라미 하나(막대 인물의 손). */
const fist = (p: Paint, x: number, y: number): string => disc(x, y, 4.3, p.skin.fill, 2.4);
const PROP_ART: ArtPart[] = [
  { name: "없음" },
  {
    name: "연필",
    front: (p) =>
      at(
        64.5,
        95.5,
        -63,
        shape("M0,-3.3 L5,-3.3 L5,3.3 L0,3.3 C-1.6,3.3 -1.6,-3.3 0,-3.3 z", "#FF9EB5", 2) +
          shape("M5,-3.3 L8.4,-3.3 L8.4,3.3 L5,3.3 z", "#C9D1DC", 2) +
          shape("M8.4,-3.3 L30,-3.3 L30,3.3 L8.4,3.3 z", GOLD, 2) +
          line("M9.4,0 L29,0", 1.2, "#E8A917") +
          shape("M30,-3.3 L37.6,0 L30,3.3 z", "#F6D9B4", 2) +
          fillOnly("M34.6,-1.3 L37.6,0 L34.6,1.3 z", INK),
      ) + fist(p, 70.6, 83.4),
  },
  {
    name: "플라스크",
    front: (p) =>
      at(
        77.5,
        77,
        8,
        fillOnly("M-2.6,-12 L-2.6,-5 L-9.5,8 C-10.5,10.5 -9,12.5 -6.5,12.5 L6.5,12.5 C9,12.5 10.5,10.5 9.5,8 L2.6,-5 L2.6,-12 z", "#EAF6FF") +
          fillOnly("M-7.4,4 L7.4,4 L9.5,8 C10.5,10.5 9,12.5 6.5,12.5 L-6.5,12.5 C-9,12.5 -10.5,10.5 -9.5,8 z", "#3FC8A0") +
          line("M-2.6,-12 L-2.6,-5 L-9.5,8 C-10.5,10.5 -9,12.5 -6.5,12.5 L6.5,12.5 C9,12.5 10.5,10.5 9.5,8 L2.6,-5 L2.6,-12", 2.4) +
          line("M-4.4,-12 L4.4,-12", 2.6) +
          disc(-2.6, 8.6, 1.3, WHITE) +
          disc(2.8, 7.2, 1, WHITE) +
          disc(1.2, -17.4, 1.7, "#BFF0DF", 1.3) +
          disc(-2.4, -22.4, 1.2, "#BFF0DF", 1.2),
      ) + fist(p, 68.4, 85.4),
  },
  {
    name: "책",
    front: (p) =>
      at(
        74,
        82.5,
        -8,
        `<rect x="-9" y="-11.4" width="20" height="24.4" rx="1.6" fill="${WHITE}" ${SL} stroke-width="2"/>` +
          `<rect x="-10.6" y="-12.6" width="20.4" height="24.6" rx="2.2" fill="${CORAL}" ${SL} stroke-width="2.4"/>` +
          line("M-6.6,-12.4 L-6.6,11.8", 1.8, "#E85252") +
          `<rect x="-3.4" y="-8" width="10" height="6" rx="1.2" fill="#FFF3D6"/>`,
      ) + fist(p, 64.4, 88.6),
  },
  {
    name: "돋보기",
    front: (p) =>
      line("M73.6,73.4 L66.6,85.6", 5.4) +
      line("M73.6,73.4 L66.6,85.6", 2.2, "#B57A4A") +
      disc(79, 65.6, 8.6, "#D9EEFF", 2.8) +
      line("M74.6,63 C75.4,60.6 77.4,59 79.8,58.6", 1.8, WHITE) +
      fist(p, 67.6, 84),
  },
  {
    name: "별 막대",
    front: (p) =>
      line("M67.4,88 L77.6,68.6", 2.8) +
      shape(star(80.4, 62.4, 9, 4.1, -78), GOLD, 2.2) +
      line("M69.4,60.4 L69.4,64.2 M67.5,62.3 L71.3,62.3", 1.7, GOLD) +
      fist(p, 68.6, 85.6),
  },
  {
    name: "아이스크림",
    front: (p) =>
      at(
        77.5,
        74,
        9,
        shape("M-5.6,0 L5.6,0 L0,15.4 z", "#F2B55E", 2.2) +
          line("M-3.6,3.4 L1.6,10 M3.4,3.6 L-1.4,10.4", 1.2, "#C98A35") +
          `<circle cx="0" cy="-4.8" r="7.2" fill="#FF9EC0" ${SL} stroke-width="2.4"/>` +
          line("M-4.4,-7 C-3.4,-9.2 -1.6,-10.4 0.6,-10.6", 1.6, "#FFD0E0") +
          disc(1.6, -12.6, 2.2, "#F25C5C", 1.5),
      ) + fist(p, 76.2, 87.4),
  },
  {
    name: "깃발",
    front: (p) =>
      shape("M74.6,58.6 C80,56 84,61.2 89.4,58.8 L88,70.8 C83,73.2 79,68 73,70.6 z", BLUE, 2.4) +
      fillOnly(star(81.2, 64.8, 3.3, 1.5), WHITE) +
      line("M69.2,95 L74.8,57.4", 2.8) +
      fist(p, 70.8, 84.4),
  },
  {
    name: "축구공",
    front: () =>
      disc(71.5, 82, 9.8, WHITE, 2.6) +
      fillOnly("M71.5,77.4 L75.6,80.4 L74,85.2 L69,85.2 L67.4,80.4 z", INK) +
      line("M71.5,77.4 L71.5,72.6 M75.6,80.4 L80.4,78.6 M74,85.2 L77,89.4 M69,85.2 L66,89.4 M67.4,80.4 L62.6,78.6", 1.6),
  },
  {
    name: "새싹 화분",
    front: () =>
      line("M75,77.4 L75,68.4", 2.4) +
      shape("M75,69.4 C73,64.4 68.6,62.6 64.4,63.8 C66,68.8 70.6,71 75,69.4 z", GREEN, 1.9) +
      shape("M75,69.4 C77,64.4 81.4,62.6 85.6,63.8 C84,68.8 79.4,71 75,69.4 z", GREEN, 1.9) +
      shape("M68,80.6 L82,80.6 L80.2,92.6 L69.8,92.6 z", "#E58B5B", 2.3) +
      `<rect x="66.4" y="77" width="17.2" height="4.2" rx="1.8" fill="#EE9D70" ${SL} stroke-width="2.2"/>`,
  },
  {
    name: "트로피",
    front: (p) =>
      line("M69.6,66.4 C65.2,66.2 64.6,72.6 70.6,73.4 M83.4,66.4 C87.8,66.2 88.4,72.6 82.4,73.4", 2.3) +
      shape("M69.4,62.6 L83.6,62.6 C83.6,70.6 80.6,75.4 76.5,75.4 C72.4,75.4 69.4,70.6 69.4,62.6 z", GOLD, 2.4) +
      line("M76.5,75.6 L76.5,80.6", 3.4) +
      shape("M71,80.6 L82,80.6 L83,84.6 L70,84.6 z", GOLD, 2.2) +
      line("M73,66 C73.2,68.6 74,70.6 75.2,72", 1.6, "#FFE9A6") +
      fist(p, 76.2, 88.6),
  },
];
/** 손에 든 것은 동그란 액자의 오른쪽 아래에 놓이는데, 그 구석은 원에 잘린다.
 *  그린 자리에서 원 안쪽으로 조금씩 당겨 놓는다([dx, dy], PROP_ART와 같은 순서). */
const PROP_NUDGE: Pt[] = [
  [0, 0],
  [-2, -2],
  [-4.5, -6.5],
  [-4, -3],
  [-1.5, -1],
  [-1.5, -1],
  [-2.5, -3.5],
  [-1.5, 0],
  [-2.5, -3],
  [-3, -6],
  [-2.5, -2.5],
];
export const PROPS: ArtPart[] = PROP_ART.map((part, i) => {
  const draw = part.front;
  const [dx, dy] = PROP_NUDGE[i] ?? [0, 0];
  if (!draw || (!dx && !dy)) return part;
  return { name: part.name, front: (p: Paint) => `<g transform="translate(${dx} ${dy})">${draw(p)}</g>` };
});

/* ── 배경 ──────────────────────────────────────────────────── */
export interface BgPart {
  name: string;
  /** 픽커 견본·대비 계산에 쓰는 대표 색 */
  css: string;
  draw: Draw;
}
const plain = (c: string): Draw => () => `<rect width="96" height="96" fill="${c}"/>`;
export const BGS: BgPart[] = [
  { name: "하늘", css: "#EEF4FF", draw: plain("#EEF4FF") },
  { name: "민트", css: "#DFF5EA", draw: plain("#DFF5EA") },
  { name: "레몬", css: "#FFF3C4", draw: plain("#FFF3C4") },
  { name: "복숭아", css: "#FFE6D8", draw: plain("#FFE6D8") },
  { name: "라벤더", css: "#ECE5FF", draw: plain("#ECE5FF") },
  { name: "분홍", css: "#FFE1EC", draw: plain("#FFE1EC") },
  { name: "하양", css: "#FFFFFF", draw: plain("#FFFFFF") },
  {
    name: "밤하늘",
    css: "#26335C",
    draw: () => {
      const dots: [number, number, number][] = [
        [13, 22, 1.1],
        [22, 12, 0.8],
        [80, 16, 1.2],
        [88, 34, 0.8],
        [9, 44, 0.8],
        [70, 8, 0.7],
        [86, 58, 1],
        [12, 66, 0.9],
        [34, 6, 0.9],
      ];
      return (
        `<rect width="96" height="96" fill="#26335C"/>` +
        dots.map(([x, y, r]) => disc(x, y, r, "#FFFFFF")).join("") +
        fillOnly(star(17, 33, 3, 1.1, -90), "#FFE9A6") +
        fillOnly(star(82, 44, 2.4, 0.9, -90), "#FFE9A6") +
        fillOnly("M80.6,15.6 C76.4,16.6 73.6,20.4 73.6,24.6 C73.6,29.6 77.6,33.6 82.6,33.6 C85,33.6 87.2,32.6 88.8,31 C83.6,31.2 79.4,27 79.4,21.8 C79.4,19.4 80.2,17.2 81.6,15.6 z", "#FFE9A6")
      );
    },
  },
  {
    name: "노을",
    css: "#FFC2B0",
    draw: (p) =>
      `<linearGradient id="sg${p.uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDFA8"/><stop offset=".55" stop-color="#FFB5BE"/><stop offset="1" stop-color="#CDB8FF"/></linearGradient>` +
      `<rect width="96" height="96" fill="url(#sg${p.uid})"/>`,
  },
  {
    name: "햇살",
    css: "#FFE89A",
    draw: () => {
      let rays = "";
      for (let i = 0; i < 12; i++) {
        const a0 = ((i * 30 - 8) * Math.PI) / 180;
        const a1 = ((i * 30 + 8) * Math.PI) / 180;
        rays += `M48,48 L${n2(48 + 90 * Math.cos(a0))},${n2(48 + 90 * Math.sin(a0))} L${n2(48 + 90 * Math.cos(a1))},${n2(48 + 90 * Math.sin(a1))} z `;
      }
      return `<rect width="96" height="96" fill="#FFE89A"/>` + fillOnly(rays.trim(), "#FFF5CC");
    },
  },
  {
    name: "물방울",
    css: "#DCEAFF",
    draw: () => {
      let dots = "";
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) dots += disc(4 + c * 12 + (r % 2 ? 6 : 0), 4 + r * 12, 2.3, "#FFFFFF");
      return `<rect width="96" height="96" fill="#DCEAFF"/>` + dots;
    },
  },
  {
    name: "모눈",
    css: "#F5F8FF",
    draw: () => {
      let d = "";
      for (let i = 0; i <= 12; i++) d += `M${i * 8},0 V96 M0,${i * 8} H96 `;
      return `<rect width="96" height="96" fill="#F5F8FF"/>` + `<path d="${d.trim()}" fill="none" stroke="#CFDDF6" stroke-width=".9"/>`;
    },
  },
  {
    name: "칠판",
    css: "#2F6B57",
    draw: () =>
      `<rect width="96" height="96" fill="#2F6B57"/>` +
      `<g fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".5">` +
      `<path d="M9,24 L19,24 M14,19 L14,29"/><path d="M78,13 L86,27 L70,27 z"/>` +
      `<ellipse cx="14" cy="60" rx="7" ry="3" transform="rotate(-30 14 60)"/><ellipse cx="14" cy="60" rx="7" ry="3" transform="rotate(30 14 60)"/>` +
      `<path d="M76,50 C78,46 82,46 84,50 C86,54 90,54 92,50"/><path d="M82,66 L88,72 M88,66 L82,72"/>` +
      `</g>`,
  },
];
