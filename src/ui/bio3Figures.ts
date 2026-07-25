// bio3Figures — 중1 Ⅱ(생물의 구성과 다양성) 재제작 전용 도해·미니아트 SVG.
// 전부 문자열만 반환하는 순수 함수(DOM 접근 없음). 라이트(흰 카드) 기준.
//
// 설계 원칙
// ① "한글 라벨이 본질인 도형"만 여기에 둔다(발주 라스터로는 글자를 못 넣는다).
// ② 좌표는 전부 계산으로 유도한다 — 피라미드 폭·부채꼴 각·원호 점은 수식과 근거를 주석에 남긴다.
// ③ SVG 텍스트는 12px 이상(실기기 가독성 규칙). 겹칠 위험이 있는 라벨만 흰 할로.
// ④ aria-label은 구조만 설명한다 — 퀴즈 그림으로 쓰일 수 있으므로 정답(계 이름·유리한 부리 등)을
//    문장으로 풀어 쓰지 않는다.
// ⑤ 문구는 완전 한글 해요체 명사형, 이모지 금지. 중1이라 '분자'가 아니라 '입자'.
//
// 과학 정확성 가드(위반 금지)
// - 원핵생물계는 핵막이 없을 뿐 세포벽은 있다(prokaryote 글리프에 두꺼운 벽, 핵 없음).
// - 균계는 세포벽이 있고 광합성을 하지 않는다(검색표에서 '광합성' 갈림길 아래에 둔다).
// - 분류체계 순서는 종 → 속 → 과 → 목 → 강 → 문 → 계.
// - 적혈구는 가운데가 오목한 원반(rbc 글리프는 옆모습을 오목하게 그린다).
// - 표기는 '마이토콘드리아'(미토콘드리아 아님).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 팔레트 — tokens.css의 브랜드/단원 색을 하드코딩(그림은 카드 위 라이트 기준). */
const C = {
  ink: "#191F28",
  ink2: "#333D4B",
  ink3: "#4E5968",
  gray: "#8B95A1",
  gray2: "#6B7684",
  line: "#C4CAD2",
  faint: "#EDF0F4",
  paper: "#F8FAFC",
  edge: "#E2E8EF",
  white: "#FFFFFF",
  bio: "#12B886", // --subj-bio
  bioDeep: "#087F5B",
  bioTint: "#E6FCF5",
  cyto: "#EAF7F1", // 세포질
  cytoChip: "#CDEDE0",
  blue: "#3182F6",
  blueDeep: "#1B64DA",
  blueTint: "#EAF2FD",
  leaf: "#8FDCA0",
  leafDeep: "#1F7A32",
  chloro: "#66C97A", // 엽록체
  wall: "#C9A26A", // 세포벽
  wallDeep: "#8E6A34",
  memb: "#EF7C93", // 세포막
  membDeep: "#C0506B",
  nuc: "#7C6BFF", // 핵
  nucTint: "#E9E5FF",
  nucDeep: "#5B4BD6",
  mito: "#FF9F43", // 마이토콘드리아
  mitoTint: "#FFE7CC",
  mitoDeep: "#D97706",
  blood: "#F26D7D",
  bloodDeep: "#C9314B",
  seed: "#C08A4E",
  seedDeep: "#8A5F2E",
  bark: "#A9744A",
  barkDeep: "#6B4A2E",
  beak: "#F2A93B",
  beakDeep: "#C97D14",
  sky: "#DDF0FB",
  metal: "#D7DDE5",
  metal2: "#C4CCD6",
  shadow: "#2A3A5E",
};

/** 좌표 문자열(소수 1자리까지) — 계산 좌표를 그대로 쓰되 문자열은 짧게. */
const n = (v: number): string => String(Math.round(v * 10) / 10);

/** 루트 svg. fill="none"을 반드시 두어 테두리 rect가 검게 채워지는 사고를 막는다. */
function fig(w: number, h: number, label: string, inner: string): string {
  return `<svg viewBox="0 0 ${w} ${h}" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">${inner}</svg>`;
}

type TextOpt = {
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  halo?: boolean;
};

/** 라벨 텍스트 — 기본 12.5px(12px 미만 금지). halo=true면 흰 할로(겹침 대비). */
function tx(x: number, y: number, t: string, o: TextOpt = {}): string {
  const halo = o.halo ? ` stroke="${C.white}" stroke-width="3.2" paint-order="stroke"` : "";
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${o.anchor ?? "start"}" font-size="${
    o.size ?? 12.5
  }" font-weight="${o.weight ?? 700}" fill="${o.fill ?? C.ink2}"${halo}>${t}</text>`;
}

/** 두 점이 이루는 방향각(도) — 화살촉 회전에 쓴다(0도 = 오른쪽). */
function dirDeg(x1: number, y1: number, x2: number, y2: number): number {
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}

/** 화살촉 — (x,y)를 꼭짓점으로 deg 방향을 향한다. */
function head(x: number, y: number, deg: number, color: string, size = 8): string {
  const b = size * 0.45;
  return `<path d="M0 0 L-${n(size)} -${n(b)} L-${n(size)} ${n(b)} Z" fill="${color}" transform="translate(${n(
    x,
  )} ${n(y)}) rotate(${n(deg)})"/>`;
}

/** 직선 화살표(먹이 관계·흐름도 공용). */
function arrowLine(x1: number, y1: number, x2: number, y2: number, color = C.gray, w = 1.8): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="${w}"/>${head(
    x2,
    y2,
    dirDeg(x1, y1, x2, y2),
    color,
  )}`;
}

/** 2차 베지에 화살표 — 중간 노드를 피해 바깥으로 돌아가는 먹이 관계 선에 쓴다. */
function arrowCurve(
  x1: number,
  y1: number,
  cxp: number,
  cyp: number,
  x2: number,
  y2: number,
  color = C.gray,
  w = 1.8,
): string {
  return `<path d="M${n(x1)} ${n(y1)} Q${n(cxp)} ${n(cyp)} ${n(x2)} ${n(y2)}" stroke="${color}" stroke-width="${w}" fill="none"/>${head(
    x2,
    y2,
    dirDeg(cxp, cyp, x2, y2),
    color,
  )}`;
}

/** 카드 배경 패널(대조도 2단 구성 공용). */
function panel(x: number, y: number, w: number, h: number, fill = C.paper): string {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="16" fill="${fill}" stroke="${
    C.edge
  }" stroke-width="1.4"/>`;
}

// ────────────────────────────────────────────────────────────────
// (A) 라벨이 본질인 도해
// ────────────────────────────────────────────────────────────────

/** 분류체계 7단계 — 아래로 갈수록 넓어지는 계단(포함 관계).
 *  예는 들고양이 한 종류가 속한 무리를 단계마다 넓힌 것. */
const RANKS: readonly { rank: string; ex: string }[] = [
  { rank: "종", ex: "들고양이" },
  { rank: "속", ex: "고양이속" },
  { rank: "과", ex: "고양이과" },
  { rank: "목", ex: "식육목" },
  { rank: "강", ex: "포유강" },
  { rank: "문", ex: "척삭동물문" },
  { rank: "계", ex: "동물계" },
];

/** 단계별 띠 색(위=좁은 무리 진한 색 → 아래=넓은 무리 옅은 색)과 글자색.
 *  옅은 4~6번 띠에 흰 글자를 쓰면 대비가 무너지므로 잉크로 뒤집는다. */
const RANK_TONE: readonly { fill: string; ink: string }[] = [
  { fill: "#087F5B", ink: C.white },
  { fill: "#099268", ink: C.white },
  { fill: "#0CA678", ink: C.white },
  { fill: "#12B886", ink: C.white },
  { fill: "#38D9A9", ink: "#08553C" },
  { fill: "#69DEB8", ink: "#08553C" },
  { fill: "#A7EDD5", ink: "#08553C" },
];

/**
 * 분류체계 7단계 계단(종 → 계). 아래로 갈수록 띠가 넓어져 포함 관계가 읽힌다.
 * @param blanks 이름을 가리고 (가)(나)… 로 표시할 단계 index(0=종 … 6=계). 기본값은 전부 표기.
 *   가릴 때는 단계 이름과 예를 함께 지운다 — 예('고양이과'·'포유강')의 끝 글자가 곧 단계 이름이라
 *   이름만 가리면 정답이 그대로 새기 때문이다.
 */
export function classRankFig(blanks: readonly number[] = []): string {
  const cx = 180;
  const wMin = 120;
  const wMax = 280; // 띠 폭: w(i) = wMin + (wMax-wMin)·i/6 → 마지막 띠가 x 40~320
  const y0 = 40;
  const h = 30;
  const gap = 5; // 세로 피치 35 → 7단이 y 40~270
  const wOf = (i: number): number => wMin + ((wMax - wMin) * i) / (RANKS.length - 1);
  const yOf = (i: number): number => y0 + i * (h + gap);
  const mark = ["(가)", "(나)", "(다)", "(라)"];

  // 띠 사이 사다리꼴 — 좁은 띠가 넓은 띠에 담기는 실루엣을 만든다.
  const wedges = RANKS.slice(0, -1)
    .map((_, i) => {
      const wa = wOf(i);
      const wb = wOf(i + 1);
      const ya = yOf(i) + h;
      const yb = yOf(i + 1);
      return `<path d="M${n(cx - wa / 2)} ${n(ya)} L${n(cx + wa / 2)} ${n(ya)} L${n(cx + wb / 2)} ${n(
        yb,
      )} L${n(cx - wb / 2)} ${n(yb)} Z" fill="#F1FCF7"/>`;
    })
    .join("");

  const bars = RANKS.map((r, i) => {
    const w = wOf(i);
    const y = yOf(i);
    const tone = RANK_TONE[i];
    const hidden = blanks.indexOf(i) >= 0;
    const body = hidden
      ? tx(cx, y + 20, mark[blanks.indexOf(i)] ?? "(가)", {
          size: 14,
          weight: 900,
          fill: tone.ink,
          anchor: "middle",
        })
      : `${tx(cx - w / 2 + 14, y + 20, r.rank, { size: 13.5, weight: 900, fill: tone.ink })}
         ${tx(cx + w / 2 - 14, y + 20, r.ex, { size: 12.5, weight: 700, fill: tone.ink, anchor: "end" })}`;
    return `<rect x="${n(cx - w / 2)}" y="${n(y)}" width="${n(w)}" height="${h}" rx="9" fill="${
      tone.fill
    }"/>${body}`;
  }).join("");

  const axisTop = y0;
  const axisBottom = yOf(RANKS.length - 1) + h;
  const axis = `<line x1="27" y1="${n(axisTop)}" x2="27" y2="${n(axisBottom - 6)}" stroke="${
    C.line
  }" stroke-width="1.6"/>${head(27, axisBottom, 90, C.line, 7)}
    <text x="13" y="${n((axisTop + axisBottom) / 2)}" text-anchor="middle" font-size="12" font-weight="700" fill="${
      C.gray
    }" transform="rotate(-90 13 ${n((axisTop + axisBottom) / 2)})">포함하는 무리가 넓어져요</text>`;

  return fig(
    344,
    306,
    "분류 단계를 위에서 아래로 일곱 칸에 나타낸 계단 그림이에요. 아래로 갈수록 칸이 넓어져요",
    `${tx(180, 22, "위로 갈수록 좁은 무리, 아래로 갈수록 넓은 무리", {
      size: 12,
      weight: 700,
      fill: C.gray2,
      anchor: "middle",
    })}
     ${wedges}${bars}${axis}
     ${tx(180, 298, "들고양이 한 종류가 속한 무리를 단계마다 넓힌 예예요", {
       size: 12,
       weight: 700,
       fill: C.gray2,
       anchor: "middle",
     })}`,
  );
}

/** 5계 검색표 — 예·아니요 갈림길 4개와 잎 노드 5개. */
const KEY_STEPS: readonly { lines: readonly string[]; sideLabel: string; downLabel: string; leaf: string }[] = [
  { lines: ["핵막에 싸인 핵이 있나요?"], sideLabel: "아니요", downLabel: "예", leaf: "원핵생물계" },
  { lines: ["균계·식물계·동물계 가운데", "하나에 속하나요?"], sideLabel: "아니요", downLabel: "예", leaf: "원생생물계" },
  { lines: ["엽록체가 있어", "광합성을 하나요?"], sideLabel: "예", downLabel: "아니요", leaf: "식물계" },
  { lines: ["세포벽이 없고", "스스로 움직이나요?"], sideLabel: "예", downLabel: "아니요", leaf: "동물계" },
];
/** 마지막 갈림길의 '아니요' 잎(세로 줄기 끝). */
const KEY_LAST_LEAF = "균계";

/**
 * 5계 검색표 흐름도. 질문 4개를 지나며 다섯 무리로 갈린다.
 * @param blanks (가)(나)… 로 가릴 잎 index(0 원핵 · 1 원생 · 2 식물 · 3 동물 · 4 균계, 위→아래 순서).
 */
export function kingdomKeyFig(blanks: readonly number[] = []): string {
  const boxX = 10;
  const boxW = 204;
  const boxH = 42;
  const gapV = 24; // 세로 피치 66
  const spineX = boxX + boxW / 2; // 112 — 아래로 내려가는 줄기
  const leafX = 250;
  const leafW = 86;
  const leafH = 34;
  const y0 = 56;
  const yOf = (i: number): number => y0 + i * (boxH + gapV);
  const mark = ["(가)", "(나)", "(다)", "(라)", "(마)"];

  const leafPill = (x: number, cy: number, name: string, idx: number): string => {
    const hidden = blanks.indexOf(idx) >= 0;
    const label = hidden ? mark[blanks.indexOf(idx)] ?? "(가)" : name;
    return `<rect x="${n(x)}" y="${n(cy - leafH / 2)}" width="${leafW}" height="${leafH}" rx="10" fill="${
      hidden ? C.paper : C.bioTint
    }" stroke="${hidden ? C.line : C.bio}" stroke-width="1.6"${hidden ? ` stroke-dasharray="5 4"` : ""}/>
      ${tx(x + leafW / 2, cy + 5, label, {
        size: 12.5,
        weight: 900,
        fill: hidden ? C.ink3 : C.bioDeep,
        anchor: "middle",
      })}`;
  };

  const steps = KEY_STEPS.map((s, i) => {
    const y = yOf(i);
    const cy = y + boxH / 2;
    const text =
      s.lines.length === 1
        ? tx(spineX, y + 26, s.lines[0], { size: 12.5, weight: 700, fill: C.blueDeep, anchor: "middle" })
        : `${tx(spineX, y + 18, s.lines[0], { size: 12.5, weight: 700, fill: C.blueDeep, anchor: "middle" })}
           ${tx(spineX, y + 33, s.lines[1], { size: 12.5, weight: 700, fill: C.blueDeep, anchor: "middle" })}`;
    const nextY = i < KEY_STEPS.length - 1 ? yOf(i + 1) : y + boxH + gapV; // 마지막은 잎으로 내려간다
    return `<rect x="${boxX}" y="${n(y)}" width="${boxW}" height="${boxH}" rx="12" fill="${
      C.blueTint
    }" stroke="#5AA2F8" stroke-width="1.5"/>${text}
      ${arrowLine(boxX + boxW, cy, leafX - 2, cy)}
      ${tx((boxX + boxW + leafX) / 2, cy - 10, s.sideLabel, {
        size: 12,
        weight: 800,
        fill: C.ink3,
        anchor: "middle",
        halo: true,
      })}
      ${leafPill(leafX, cy, s.leaf, i)}
      ${arrowLine(spineX, y + boxH, spineX, nextY - 2)}
      ${tx(spineX + 10, y + boxH + 16, s.downLabel, { size: 12, weight: 800, fill: C.ink3 })}`;
  }).join("");

  const lastY = yOf(KEY_STEPS.length - 1) + boxH + gapV; // 마지막 잎의 윗변
  return fig(
    344,
    lastY + leafH + 12,
    "생물을 예와 아니요 질문 네 개로 갈라 다섯 무리로 나누는 검색표 그림이에요",
    `<rect x="42" y="6" width="140" height="28" rx="14" fill="${C.faint}" stroke="${C.line}" stroke-width="1.4"/>
     ${tx(112, 25, "여러 가지 생물", { size: 12.5, weight: 800, fill: C.ink2, anchor: "middle" })}
     ${arrowLine(112, 34, 112, y0 - 2)}
     ${steps}
     ${leafPill(spineX - leafW / 2, lastY + leafH / 2, KEY_LAST_LEAF, KEY_STEPS.length)}`,
  );
}

/** 구성 단계 — 동물/식물 각각 5단계와 실제 예. */
const ORG_LEVELS: Record<"animal" | "plant", readonly { step: string; ex: string }[]> = {
  animal: [
    { step: "세포", ex: "근육세포" },
    { step: "조직", ex: "근육조직" },
    { step: "기관", ex: "심장" },
    { step: "기관계", ex: "순환계" },
    { step: "개체", ex: "강아지" },
  ],
  plant: [
    { step: "세포", ex: "잎살세포" },
    { step: "조직", ex: "울타리조직" },
    // 울타리조직은 기본조직계에 속한다 — 포함 관계가 어긋나지 않게 예를 고른다.
    { step: "조직계", ex: "기본조직계" },
    { step: "기관", ex: "잎" },
    { step: "개체", ex: "나무" },
  ],
};

/** 단계 글리프(32×32 로컬 좌표) — 카드 오른쪽에 놓는 작은 도상. */
function levelGlyph(step: string, plant: boolean): string {
  if (step === "세포") {
    return `<path d="M16 3c8 0 13 5 13 13s-6 13-13 13S3 24 3 16 8 3 16 3z" fill="${C.cyto}" stroke="${C.bio}" stroke-width="2"/>
      <circle cx="13" cy="13" r="4.4" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="1.6"/>`;
  }
  if (step === "조직") {
    return `<g fill="${C.cyto}" stroke="${C.bio}" stroke-width="1.6">
      <rect x="2" y="5" width="13" height="10" rx="4.5"/><rect x="17" y="5" width="13" height="10" rx="4.5"/>
      <rect x="2" y="17" width="13" height="10" rx="4.5"/><rect x="17" y="17" width="13" height="10" rx="4.5"/></g>
      <g fill="${C.nuc}"><circle cx="8" cy="10" r="1.8"/><circle cx="23" cy="10" r="1.8"/><circle cx="8" cy="22" r="1.8"/><circle cx="23" cy="22" r="1.8"/></g>`;
  }
  if (step === "조직계") {
    return `<rect x="3" y="5" width="26" height="6" rx="3" fill="#DFF3E4" stroke="${C.leafDeep}" stroke-width="1.4"/>
      <rect x="3" y="12" width="26" height="9" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.4"/>
      <path d="M9 12v9M16 12v9M23 12v9" stroke="${C.leafDeep}" stroke-width="1.2"/>
      <rect x="3" y="22" width="26" height="6" rx="3" fill="#DFF3E4" stroke="${C.leafDeep}" stroke-width="1.4"/>`;
  }
  if (step === "기관") {
    return plant
      ? `<path d="M16 29C5 24 3 12 9 5c9-1 17 6 17 14 0 4-3 8-10 10z" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.8"/>
         <path d="M16 29C15 20 13 11 9 5" stroke="${C.leafDeep}" stroke-width="1.6"/>`
      : `<path d="M16 28C7 22 3 17 3 12c0-4 3-7 6.5-7 2.5 0 4.9 1.3 6.5 3.6C17.6 6.3 20 5 22.5 5 26 5 29 8 29 12c0 5-4 10-13 16z" fill="#F7A8B4" stroke="${C.bloodDeep}" stroke-width="1.8"/>`;
  }
  if (step === "기관계") {
    return `<path d="M16 20C10 16 7 13 7 10c0-2.4 1.9-4.2 4-4.2 1.5 0 3 .8 4 2 1-1.2 2.5-2 4-2 2.1 0 4 1.8 4 4.2 0 3-3 6-7 10z" fill="#F7A8B4" stroke="${C.bloodDeep}" stroke-width="1.6"/>
      <path d="M11 15C4 17 3 26 16 27s12-9 5-12" stroke="${C.bloodDeep}" stroke-width="1.8" fill="none"/>
      <circle cx="16" cy="27" r="2.4" fill="${C.blood}"/>`;
  }
  // 개체
  return plant
    ? `<path d="M16 29V14" stroke="${C.wallDeep}" stroke-width="2.4"/>
       <path d="M16 16c-7 0-11-4-11-9 7-2 11 2 11 9zM16 14c0-7 4-11 11-9 1 5-3 9-11 9z" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.6"/>
       <path d="M16 29c-3 1-5 2-6 3M16 29c3 1 5 2 6 3" stroke="${C.wallDeep}" stroke-width="1.6"/>`
    : `<path d="M6 20c0-5 5-8 11-8s11 3 11 8-5 8-11 8S6 25 6 20z" fill="#E8DCCB" stroke="#8A7A64" stroke-width="1.6"/>
       <circle cx="24" cy="12" r="5.5" fill="#E8DCCB" stroke="#8A7A64" stroke-width="1.6"/>
       <path d="M22 7l-2-4 4 1.6M27 7l3-3.6.6 4.4" fill="#E8DCCB" stroke="#8A7A64" stroke-width="1.4"/>
       <path d="M10 27v4M15 28v3.5M21 28v3.5M6 20c-3-1-4-3-4-5" stroke="#8A7A64" stroke-width="1.6"/>`;
}

/** 구성 단계 화살표 도해 — 동물은 기관계, 식물은 조직계가 들어가는 자리가 다르다. */
export function orgLevelFig(kind: "animal" | "plant"): string {
  const rows = ORG_LEVELS[kind];
  const plant = kind === "plant";
  const cardX = 20;
  const cardW = 304;
  const cardH = 44;
  const gap = 24; // 세로 피치 68
  const yOf = (i: number): number => 34 + i * (cardH + gap);
  const pillX = 32;
  const pillW = 78;

  const body = rows
    .map((r, i) => {
      const y = yOf(i);
      const arrow =
        i < rows.length - 1
          ? `${arrowLine(pillX + pillW / 2, y + cardH, pillX + pillW / 2, y + cardH + gap - 2, C.bio, 2.2)}
             ${tx(pillX + pillW / 2 + 12, y + cardH + 17, "모여서", { size: 12, weight: 700, fill: C.gray2 })}`
          : "";
      return `<rect x="${cardX}" y="${n(y)}" width="${cardW}" height="${cardH}" rx="14" fill="${
        C.white
      }" stroke="${C.edge}" stroke-width="1.4"/>
        <rect x="${pillX}" y="${n(y + 8)}" width="${pillW}" height="28" rx="14" fill="${C.bio}"/>
        ${tx(pillX + pillW / 2, y + 27, r.step, { size: 13, weight: 900, fill: C.white, anchor: "middle" })}
        ${tx(122, y + 27, r.ex, { size: 12.5, weight: 800, fill: C.ink })}
        <g transform="translate(276 ${n(y + 6)})">${levelGlyph(r.step, plant)}</g>
        ${arrow}`;
    })
    .join("");

  const last = yOf(rows.length - 1) + cardH;
  return fig(
    344,
    last + 16,
    `${plant ? "식물" : "동물"}의 구성 단계 다섯 칸을 위에서 아래로 화살표로 이은 그림이에요`,
    `${tx(172, 21, `${plant ? "식물" : "동물"}의 구성 단계`, {
      size: 13.5,
      weight: 900,
      fill: C.ink,
      anchor: "middle",
    })}${body}`,
  );
}

/** 마이토콘드리아 한 알 — 겉막 콩 모양 + 안쪽 주름. 두 세포에 같은 색으로 쓴다. */
function mitoShape(cx: number, cy: number, rot: number, rx = 15, ry = 8): string {
  return `<g transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})">
    <ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${C.mitoTint}" stroke="${
    C.mitoDeep
  }" stroke-width="1.6"/>
    <path d="M${n(cx - rx + 4)} ${n(cy + 2)}q4 -6 7 0t7 0t7 0" stroke="${C.mitoDeep}" stroke-width="1.4" fill="none"/>
  </g>`;
}

/** 엽록체 한 알 — 초록 타원 + 안쪽 알갱이 줄. */
function chloroShape(cx: number, cy: number, rot: number, rx = 11, ry = 7): string {
  return `<g transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})">
    <ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${C.chloro}" stroke="${
    C.leafDeep
  }" stroke-width="1.5"/>
    <path d="M${n(cx - 5)} ${n(cy - 2)}h5M${n(cx - 5)} ${n(cy + 2)}h5M${n(cx + 2)} ${n(cy - 2)}h4M${n(
    cx + 2,
  )} ${n(cy + 2)}h4" stroke="${C.leafDeep}" stroke-width="1.6"/>
  </g>`;
}

/** 세포 구조 이름표 — 같은 구조는 두 세포에서 반드시 같은 색.
 *  색만 보고 "식물세포에만 있는 것"이 드러나면 퀴즈 정답이 새므로, 구분은 그림에 있느냐 없느냐로만. */
const CELL_PARTS: Record<"animal" | "plant", readonly (readonly [string, string])[]> = {
  animal: [
    ["세포막", C.memb],
    ["세포질", C.cytoChip],
    ["핵", C.nuc],
    ["마이토콘드리아", C.mito],
  ],
  plant: [
    ["세포벽", C.wall],
    ["세포막", C.memb],
    ["세포질", C.cytoChip],
    ["핵", C.nuc],
    ["엽록체", C.chloro],
    ["마이토콘드리아", C.mito],
  ],
};

/** 동물세포와 식물세포 대조도(그림 + 이름표 목록). */
export function cellCompareFig(): string {
  const legend = (px: number, kind: "animal" | "plant"): string =>
    CELL_PARTS[kind]
      .map(([name, color], i) => {
        const y = 196 + i * 18; // 이름표 줄 간격 18px — 12px 글자가 겹치지 않는 최소치
        return `<rect x="${n(px + 14)}" y="${n(y - 10)}" width="11" height="11" rx="3.5" fill="${color}" stroke="${
          C.line
        }" stroke-width="1"/>${tx(px + 32, y, name, { size: 12, weight: 750, fill: C.ink2 })}`;
      })
      .join("");

  // 동물세포: 둥근 세포막 안에 핵 1개 + 마이토콘드리아 2개(중심 88,100 / 폭 112 · 높이 106)
  const animal = `<path d="M88 46C118 46 144 66 144 96C144 128 120 152 88 152C56 152 32 130 32 98C32 68 58 46 88 46Z" fill="${C.cyto}" stroke="${C.memb}" stroke-width="3.4"/>
    <circle cx="78" cy="88" r="21" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="1.8"/>
    <circle cx="82" cy="84" r="6" fill="${C.nuc}"/>
    ${mitoShape(118, 124, -20)}${mitoShape(54, 126, 14)}
    <g fill="${C.cytoChip}"><circle cx="112" cy="72" r="3"/><circle cx="60" cy="96" r="2.6"/><circle cx="96" cy="140" r="2.6"/></g>`;

  // 식물세포: 두꺼운 세포벽(바깥) + 세포막(안쪽 선) + 핵 1 + 엽록체 4 + 마이토콘드리아 2
  const plant = `<rect x="196" y="42" width="120" height="118" rx="14" stroke="${C.wall}" stroke-width="7"/>
    <rect x="202.5" y="48.5" width="107" height="105" rx="10" fill="${C.cyto}" stroke="${C.memb}" stroke-width="2.6"/>
    <circle cx="226" cy="76" r="18" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="1.8"/>
    <circle cx="229" cy="73" r="5" fill="${C.nuc}"/>
    ${mitoShape(284, 64, -18)}${mitoShape(232, 138, 12)}
    ${chloroShape(213, 112, 35)}${chloroShape(252, 104, -12)}${chloroShape(290, 106, 20)}${chloroShape(277, 140, 15)}`;

  return fig(
    344,
    296,
    "동물세포와 식물세포를 나란히 그린 대조도예요. 그림 아래에 각 세포에서 보이는 구조 이름이 차례로 적혀 있어요",
    `${tx(88, 18, "동물세포", { size: 13.5, weight: 900, fill: C.ink, anchor: "middle" })}
     ${tx(256, 18, "식물세포", { size: 13.5, weight: 900, fill: C.ink, anchor: "middle" })}
     ${panel(8, 26, 160, 262)}${panel(176, 26, 160, 262)}
     ${animal}${plant}
     <path d="M20 176h136M188 176h136" stroke="${C.edge}" stroke-width="1.4" stroke-dasharray="5 4"/>
     ${legend(8, "animal")}${legend(176, "plant")}`,
  );
}

/** 먹이 관계 노드 — 폭 76 · 높이 30(반폭 38 · 반높이 15)으로 고정해 화살표 끝점을 계산한다. */
const FW_HW = 38;
const FW_HH = 15;
/** 다섯 층의 세로 중심(아래=생산자 272 → 위=최종 소비자 30, 간격 약 60.5). */
const FW_LAYER = [272, 212, 151, 90, 30] as const;

function fwNode(cx: number, cy: number, name: string, producer: boolean): string {
  return `<rect x="${n(cx - FW_HW)}" y="${n(cy - FW_HH)}" width="${FW_HW * 2}" height="${FW_HH * 2}" rx="15" fill="${
    producer ? "#E9F8EF" : C.white
  }" stroke="${producer ? C.leafDeep : "#B0B8C1"}" stroke-width="1.6"/>
  ${tx(cx, cy + 5, name, { size: 12.5, weight: 800, fill: producer ? C.leafDeep : C.ink2, anchor: "middle" })}`;
}

/**
 * 먹이 관계 그림 2종. 화살표는 먹이가 되는 쪽 → 먹는 쪽.
 * @param rich false = 한 줄 사슬(다양성 낮음) · true = 여러 갈래 그물(다양성 높음).
 *   두 그림은 같은 층·같은 viewBox를 쓰고, 한 줄 사슬(벼-메뚜기-개구리-뱀-매)이 그물의 부분집합이라
 *   "개구리가 사라지면?"을 나란히 비교할 수 있다.
 */
export function foodWebFig(rich: boolean): string {
  const [L0, L1, L2, L3, L4] = FW_LAYER;
  const legend = tx(172, 306, "화살표는 먹이가 되는 쪽에서 먹는 쪽으로 향해요", {
    size: 12,
    weight: 700,
    fill: C.gray2,
    anchor: "middle",
  });

  if (!rich) {
    const chain: readonly [string, number, boolean][] = [
      ["벼", L0, true],
      ["메뚜기", L1, false],
      ["개구리", L2, false],
      ["뱀", L3, false],
      ["매", L4, false],
    ];
    const links = chain
      .slice(0, -1)
      .map((_, i) => arrowLine(172, chain[i][1] - FW_HH, 172, chain[i + 1][1] + FW_HH + 2))
      .join("");
    return fig(
      344,
      316,
      "생물 다섯 칸이 한 줄로 이어진 먹이 관계 그림이에요",
      `${links}${chain.map(([nm, y, p]) => fwNode(172, y, nm, p)).join("")}${legend}`,
    );
  }

  // 그물: 층마다 x를 고르게 벌려 화살표가 다른 칸을 관통하지 않게 배치했다.
  const nodes: readonly [number, number, string, boolean][] = [
    [58, L0, "벼", true],
    [172, L0, "풀", true],
    [286, L0, "열매", true],
    [58, L1, "메뚜기", false],
    [172, L1, "쥐", false],
    [286, L1, "다람쥐", false],
    [68, L2, "개구리", false],
    [232, L2, "참새", false],
    [116, L3, "뱀", false],
    [172, L4, "매", false],
  ];
  // [시작x, 시작y(먹이 윗변), 끝x, 끝y(먹는 쪽 아랫변)] — 같은 칸에 여러 화살표가 모이면 x를 ±14 어긋낸다.
  const edges: readonly [number, number, number, number][] = [
    [44, L0 - FW_HH, 44, L1 + FW_HH + 2],
    [158, L0 - FW_HH, 72, L1 + FW_HH + 2],
    [72, L0 - FW_HH, 158, L1 + FW_HH + 2],
    [272, L0 - FW_HH, 186, L1 + FW_HH + 2],
    [186, L0 - FW_HH, 272, L1 + FW_HH + 2],
    [300, L0 - FW_HH, 300, L1 + FW_HH + 2],
    [58, L1 - FW_HH, 68, L2 + FW_HH + 2],
    [72, L1 - FW_HH, 232, L2 + FW_HH + 2],
    [172, L1 - FW_HH, 130, L3 + FW_HH + 2], // 쥐 → 뱀: y=166·136에서 x가 158·144라 개구리(≤106)·참새(≥194) 사이를 지난다
    [68, L2 - FW_HH, 102, L3 + FW_HH + 2],
    [116, L3 - FW_HH, 144, L4 + FW_HH],
    [232, L2 - FW_HH, 172, L4 + FW_HH], // 참새 → 매: y=105에서 x≈212로 뱀(≤154) 오른쪽을 지난다
  ];
  // 다람쥐 → 매는 참새·뱀 칸을 정면으로 지나므로 오른쪽으로 부풀린 곡선으로 우회한다.
  // Q(286,197)-(334,124)-(200,45): y=166→x≈298, y=136→x≈295, y=105→x≈276 (모두 칸 오른쪽 바깥).
  const bow = arrowCurve(286, L1 - FW_HH, 334, 124, 200, L4 + FW_HH);

  return fig(
    344,
    316,
    "여러 생물이 여러 갈래로 얽혀 이어진 먹이 관계 그림이에요",
    `${edges.map((e) => arrowLine(e[0], e[1], e[2], e[3])).join("")}${bow}
     ${nodes.map(([x, y, nm, p]) => fwNode(x, y, nm, p)).join("")}${legend}`,
  );
}

/** 껍데기 가장자리 점 — 꼭지(umbo)를 원점으로 한 부채꼴 매개화.
 *  edge(th) = (cx + w·sin th, cy - h + 1.9h·cos th) → th=0이 바닥 중앙, th=±78°가 양옆 위쪽. */
function shellEdge(cx: number, cy: number, w: number, h: number, thDeg: number): [number, number] {
  const r = (thDeg * Math.PI) / 180;
  return [cx + w * Math.sin(r), cy - h + 1.9 * h * Math.cos(r)];
}

/** 바지락 껍데기 한 장 — 같은 종류라 형태 규칙은 같고, 무늬(marks)·색·크기만 조금씩 다르다. */
function shell(
  cx: number,
  cy: number,
  base: number,
  tint: string,
  accent: string,
  marks: readonly number[],
  scale: number,
  rot: number,
): string {
  const w = base * scale;
  const h = base * 0.95 * scale;
  const TH = 78; // 부채의 반각
  const ux = cx;
  const uy = cy - h;
  const steps = 16; // 현 오차 ≈ R(1-cos(θ/2)) ≈ 0.5px → 눈에 보이지 않는다
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const [ex, ey] = shellEdge(cx, cy, w, h, -TH + (2 * TH * i) / steps);
    pts.push(`${n(ex)} ${n(ey)}`);
  }
  const outline = `M${n(ux)} ${n(uy)} L${pts.join(" L")} Z`;
  const rib = [-58, -29, 0, 29, 58]
    .map((th) => {
      const [ex, ey] = shellEdge(cx, cy, w, h, th);
      return `M${n(ux)} ${n(uy)} L${n(ex)} ${n(ey)}`;
    })
    .join("");
  const growth = [0.55, 0.8]
    .map((f) => {
      const arc: string[] = [];
      for (let i = 0; i <= 8; i++) {
        const [ex, ey] = shellEdge(cx, cy, w, h, -TH + (2 * TH * i) / 8);
        arc.push(`${n(ux + (ex - ux) * f)} ${n(uy + (ey - uy) * f)}`);
      }
      return `M${arc.join(" L")}`;
    })
    .join("");
  const band = marks
    .map((th) => {
      const [ex, ey] = shellEdge(cx, cy, w, h, th);
      const x0 = ux + (ex - ux) * 0.32;
      const y0 = uy + (ey - uy) * 0.32;
      return `M${n(x0)} ${n(y0)} L${n(ex)} ${n(ey)}`;
    })
    .join("");
  return `<g transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})">
    <ellipse cx="${n(cx)}" cy="${n(cy + h * 0.97)}" rx="${n(w * 0.78)}" ry="4" fill="${C.shadow}" opacity=".10"/>
    <path d="${outline}" fill="${tint}" stroke="${C.wallDeep}" stroke-width="1.6"/>
    <path d="${growth}" stroke="#D8C3A0" stroke-width="1" fill="none"/>
    <path d="${rib}" stroke="#D8C3A0" stroke-width="1.1" fill="none"/>
    <path d="${band}" stroke="${accent}" stroke-width="5" fill="none"/>
  </g>`;
}

/** 같은 종류 안의 변이 — 바지락 껍데기 6장의 무늬·색·크기가 조금씩 다르다. */
export function variationFig(): string {
  const spec: readonly { tint: string; accent: string; marks: number[]; scale: number; rot: number }[] = [
    { tint: "#F4E9D7", accent: "#8A5F2E", marks: [-46, 8], scale: 1.0, rot: -6 },
    { tint: "#EFE1C6", accent: "#7A5230", marks: [-20, 24, 60], scale: 0.94, rot: 3 },
    { tint: "#F7F0E2", accent: "#96683A", marks: [-62, -12, 40], scale: 1.05, rot: -2 },
    { tint: "#EBDDC1", accent: "#6E4A28", marks: [30], scale: 0.97, rot: 5 },
    { tint: "#F2E6CE", accent: "#8A5F2E", marks: [-54, -22, 14, 52], scale: 1.02, rot: -4 },
    { tint: "#F0E5D2", accent: "#7E5528", marks: [-36, 46], scale: 0.92, rot: 2 },
  ];
  const cols = [62, 172, 282];
  const rows = [88, 196];
  const body = spec
    .map((s, i) =>
      shell(cols[i % 3], rows[Math.floor(i / 3)], 42, s.tint, s.accent, s.marks, s.scale, s.rot),
    )
    .join("");
  return fig(
    344,
    272,
    "바지락 껍데기 여섯 개가 두 줄로 놓여 있어요. 껍데기마다 무늬가 조금씩 달라요",
    `${body}${tx(172, 258, "모두 같은 종류의 바지락이에요", {
      size: 12.5,
      weight: 700,
      fill: C.gray2,
      anchor: "middle",
    })}`,
  );
}

/** 섬 하나의 먹이 그림 — 왼쪽 섬은 단단한 씨앗, 오른쪽 섬은 나무 속 곤충. */
function islandFood(px: number, seeds: boolean): string {
  if (seeds) {
    const one = (cx: number, cy: number, rot: number): string =>
      `<g transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})">
        <ellipse cx="${n(cx)}" cy="${n(cy)}" rx="13" ry="10" fill="${C.seed}" stroke="${C.seedDeep}" stroke-width="1.8"/>
        <path d="M${n(cx - 9)} ${n(cy)}h18" stroke="${C.seedDeep}" stroke-width="1.4"/>
        <path d="M${n(cx - 7)} ${n(cy - 5)}q4 -3 8 -1" stroke="${C.white}" stroke-width="2" opacity=".55"/>
      </g>`;
    return `<rect x="${n(px + 12)}" y="56" width="136" height="90" rx="12" fill="#FFF7E8"/>
      <path d="M${n(px + 26)} 132h108" stroke="#E4D3B2" stroke-width="3.4"/>
      ${one(px + 52, 112, -12)}${one(px + 80, 120, 8)}${one(px + 108, 106, 16)}`;
  }
  const trunkX = px + 60;
  return `<rect x="${n(px + 12)}" y="56" width="136" height="90" rx="12" fill="#EAF6EE"/>
    <rect x="${n(trunkX)}" y="64" width="32" height="76" rx="6" fill="${C.bark}" stroke="${C.barkDeep}" stroke-width="1.8"/>
    <path d="M${n(trunkX + 8)} 70v64M${n(trunkX + 22)} 72v60" stroke="${C.barkDeep}" stroke-width="1.2" opacity=".6"/>
    <ellipse cx="${n(trunkX + 16)}" cy="100" rx="11" ry="9" fill="${C.barkDeep}"/>
    <path d="M${n(trunkX + 10)} 102q4 -7 9 -3t5 4" stroke="#F5E7CE" stroke-width="4" fill="none"/>
    <path d="M${n(px + 24)} 140h112" stroke="#CFE3D4" stroke-width="3.4"/>`;
}

/**
 * 두 섬의 먹이와 부리 대조도.
 * @param mode "pair" = 먹이와 그 섬에서 유리한 부리를 함께(개념용) ·
 *   "foodOnly" = 부리 자리를 물음표로 비운다(퀴즈용 — 정답이 그림에 미리 새지 않게).
 */
export function beakEnvFig(mode: "pair" | "foodOnly" = "pair"): string {
  const island = (px: number, seeds: boolean): string => {
    const beak = seeds
      ? `<path d="M${n(px + 84)} 198L${n(px + 120)} 210L${n(px + 84)} 224Z" fill="${C.beak}" stroke="${
          C.beakDeep
        }" stroke-width="1.8"/>`
      : `<path d="M${n(px + 84)} 205L${n(px + 134)} 210L${n(px + 84)} 216Z" fill="${C.beak}" stroke="${
          C.beakDeep
        }" stroke-width="1.8"/>`;
    const bird =
      mode === "pair"
        ? `${beak}
           <circle cx="${n(px + 62)}" cy="210" r="24" fill="#E8E1D6" stroke="#A79C8C" stroke-width="1.8"/>
           <circle cx="${n(px + 70)}" cy="202" r="3.2" fill="${C.ink2}"/>
           ${tx(px + 80, 252, seeds ? "굵고 두꺼운 부리" : "가늘고 긴 부리", {
             size: 12.5,
             weight: 800,
             fill: C.ink,
             anchor: "middle",
           })}`
        : `<rect x="${n(px + 34)}" y="188" width="92" height="52" rx="14" fill="${C.white}" stroke="${
            C.line
          }" stroke-width="1.6" stroke-dasharray="5 4"/>
           ${tx(px + 80, 222, "?", { size: 22, weight: 900, fill: C.gray, anchor: "middle" })}`;
    return `${panel(px + 0, 26, 160, 232)}
      ${tx(px + 80, 46, seeds ? "섬 (가)" : "섬 (나)", { size: 13.5, weight: 900, fill: C.ink, anchor: "middle" })}
      ${islandFood(px, seeds)}
      ${tx(px + 80, 164, seeds ? "단단한 씨앗" : "나무 속 곤충", {
        size: 12.5,
        weight: 800,
        fill: C.ink,
        anchor: "middle",
      })}
      <path d="M${n(px + 12)} 176h136" stroke="${C.edge}" stroke-width="1.4" stroke-dasharray="5 4"/>
      ${bird}`;
  };
  const label =
    mode === "pair"
      ? "두 섬을 나란히 놓고 섬마다 먹이와 새의 부리를 보여 주는 대조도예요"
      : "두 섬의 먹이를 나란히 보여 주는 그림이에요. 부리 자리는 물음표로 비어 있어요";
  return fig(344, 274, label, `${island(8, true)}${island(176, false)}`);
}

/** 광학 현미경 부위 도해 — 이름표는 왼쪽 5개·오른쪽 2개로 나누어 리드선을 겹치지 않게 배치. */
export function microscopePartsFig(): string {
  const lead = (x1: number, y: number, x2: number): string =>
    `<line x1="${n(x1)}" y1="${n(y)}" x2="${n(x2)}" y2="${n(y)}" stroke="${C.line}" stroke-width="1.2"/>`;
  const left = (y: number, t: string, toX: number): string =>
    `${lead(96, y, toX)}${tx(92, y + 4, t, { size: 12.5, weight: 800, fill: C.ink2, anchor: "end" })}`;
  const right = (y: number, t: string, toX: number): string =>
    `${lead(262, y, toX)}${tx(266, y + 4, t, { size: 12.5, weight: 800, fill: C.ink2 })}`;

  const body = `
    <!-- 팔: 받침대에서 경통 오른쪽으로 이어지는 곡선(조동·미동 나사가 이 위에 붙는다) -->
    <path d="M226 258C250 226 246 176 214 158" stroke="#B9C1CC" stroke-width="15" fill="none"/>
    <!-- 받침대 -->
    <rect x="104" y="254" width="132" height="20" rx="9" fill="#C9D0DA" stroke="${C.gray}" stroke-width="1.6"/>
    <!-- 접안렌즈 · 경통 · 회전판 -->
    <rect x="148" y="30" width="44" height="9" rx="4.5" fill="#E4E9F0" stroke="${C.gray}" stroke-width="1.5"/>
    <rect x="152" y="36" width="36" height="30" rx="6" fill="#E4E9F0" stroke="${C.gray}" stroke-width="1.6"/>
    <rect x="150" y="64" width="40" height="70" rx="4" fill="${C.metal}" stroke="${C.gray}" stroke-width="1.6"/>
    <rect x="138" y="132" width="64" height="18" rx="9" fill="${C.metal2}" stroke="${C.gray}" stroke-width="1.6"/>
    <!-- 대물렌즈 2개(길이가 다른 두 배율) -->
    <path d="M148 150h18l-4 28h-10z" fill="#E4E9F0" stroke="${C.gray}" stroke-width="1.5"/>
    <path d="M176 150h18l-4 20h-10z" fill="#E4E9F0" stroke="${C.gray}" stroke-width="1.5"/>
    <!-- 재물대(가운데 구멍 + 클립) -->
    <rect x="122" y="180" width="20" height="6" rx="3" fill="${C.gray}"/>
    <rect x="194" y="180" width="20" height="6" rx="3" fill="${C.gray}"/>
    <rect x="100" y="186" width="134" height="12" rx="3" fill="${C.metal2}" stroke="${C.gray}" stroke-width="1.6"/>
    <ellipse cx="167" cy="192" rx="13" ry="4.5" fill="${C.paper}"/>
    <!-- 조리개(레버 포함) -->
    <circle cx="167" cy="210" r="11" fill="#E4E9F0" stroke="${C.gray}" stroke-width="1.6"/>
    <circle cx="167" cy="210" r="4.5" fill="${C.paper}"/>
    <path d="M178 214l14 5" stroke="${C.gray}" stroke-width="2"/>
    <!-- 반사경 -->
    <path d="M167 254v-10" stroke="${C.gray}" stroke-width="3"/>
    <g transform="rotate(-22 167 236)">
      <ellipse cx="167" cy="236" rx="19" ry="13" fill="${C.blueTint}" stroke="${C.gray}" stroke-width="1.8"/>
      <path d="M156 232q8 -5 16 -2" stroke="${C.white}" stroke-width="3" opacity=".8"/>
    </g>
    <!-- 조동나사(큰 것) · 미동나사(작은 것) -->
    <circle cx="238" cy="176" r="15" fill="${C.metal}" stroke="${C.gray}" stroke-width="1.8"/>
    <path d="M230 170h16M230 176h16M230 182h16" stroke="${C.gray}" stroke-width="1.2"/>
    <circle cx="246" cy="208" r="9.5" fill="${C.metal}" stroke="${C.gray}" stroke-width="1.8"/>
    <path d="M240 204h12M240 210h12" stroke="${C.gray}" stroke-width="1.2"/>`;

  return fig(
    344,
    290,
    "광학 현미경을 옆에서 본 그림이에요. 여러 부분에 이름표가 이어져 있어요",
    `${body}
     ${left(48, "접안렌즈", 150)}
     ${left(164, "대물렌즈", 150)}
     ${left(192, "재물대", 100)}
     ${left(214, "조리개", 155)}
     ${left(242, "반사경", 150)}
     ${right(176, "조동나사", 253)}
     ${right(208, "미동나사", 256)}`,
  );
}

// ────────────────────────────────────────────────────────────────
// (B) recap 미니아트 — 64×64 플랫. 카드 한 문장의 핵심을 도상 하나로(텍스트 없음).
// ────────────────────────────────────────────────────────────────

/** 분류체계 글리프 — 위(좁은 무리)에서 아래(넓은 무리)로 폭이 커지는 7단 계단.
 *  폭 w(i) = 14 + 34·i/6, 세로 피치 7(막대 5 + 틈 2) → y 9~56. */
function rankGlyph(): string {
  return RANK_TONE.map((tone, i) => {
    const w = 14 + (34 * i) / 6;
    return `<rect x="${n(32 - w / 2)}" y="${n(9 + i * 7)}" width="${n(w)}" height="5" rx="2.5" fill="${tone.fill}"/>`;
  }).join("");
}

/** 5계 글리프 — 원을 72°씩 다섯 조각으로. 조각 k의 두 끝점은 −90°+72k, −90°+72(k+1). */
function kingdomGlyph(): string {
  const r = 22;
  const pt = (d: number): [number, number] => {
    const a = (d * Math.PI) / 180;
    return [32 + r * Math.cos(a), 32 + r * Math.sin(a)];
  };
  const fills = ["#D3F9D8", "#C5F6FA", "#FFF3BF", "#FFE3E3", "#E5DBFF"];
  const wedge = fills
    .map((f, k) => {
      const [x0, y0] = pt(-90 + 72 * k);
      const [x1, y1] = pt(-90 + 72 * (k + 1));
      return `<path d="M32 32L${n(x0)} ${n(y0)}A${r} ${r} 0 0 1 ${n(x1)} ${n(y1)}Z" fill="${f}" stroke="${
        C.white
      }" stroke-width="1.6"/>`;
    })
    .join("");
  return `${wedge}<circle cx="32" cy="32" r="${r}" stroke="${C.gray}" stroke-width="1.6"/>`;
}

const MINI: Record<string, string> = {
  // ── L1~L4 세포 ──
  // 세포: 둥근 세포 한 칸 + 핵
  cell: `<path d="M32 9C46 9 55 19 55 31C55 44 45 55 32 55C19 55 9 44 9 31C9 19 18 9 32 9Z" fill="${C.cyto}" stroke="${C.bio}" stroke-width="2.8"/>
    <circle cx="26" cy="28" r="7.5" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="2.2"/>
    <circle cx="42" cy="40" r="4.2" fill="${C.mitoTint}" stroke="${C.mitoDeep}" stroke-width="1.6"/>`,
  // 세포벽: 바깥의 두꺼운 벽 + 안쪽의 얇은 세포막
  cellwall: `<rect x="8" y="14" width="48" height="36" rx="10" stroke="${C.wall}" stroke-width="6.5"/>
    <rect x="14" y="20" width="36" height="24" rx="6" fill="${C.cyto}" stroke="${C.memb}" stroke-width="2.4"/>
    <circle cx="24" cy="32" r="4.8" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="1.8"/>`,
  // 핵: 세포 가운데의 둥근 핵과 인
  nucleus: `<path d="M32 11C45 11 54 20 54 32C54 44 45 53 32 53C19 53 10 44 10 32C10 20 19 11 32 11Z" fill="${C.cyto}" stroke="#9AA3AD" stroke-width="1.8"/>
    <circle cx="32" cy="32" r="14" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="2.6"/>
    <circle cx="36" cy="28" r="5" fill="${C.nuc}"/>`,
  // 마이토콘드리아: 콩 모양 + 안쪽 주름
  mito: `<g transform="rotate(-18 32 32)"><ellipse cx="32" cy="32" rx="25" ry="14" fill="${C.mitoTint}" stroke="${C.mitoDeep}" stroke-width="2.6"/>
    <path d="M12 34q5 -8 10 0t10 0t10 0t10 0" stroke="${C.mitoDeep}" stroke-width="2.2" fill="none"/></g>`,
  // 엽록체: 초록 알갱이 + 안쪽 알갱이 더미
  chloro: `<g transform="rotate(-16 32 32)"><ellipse cx="32" cy="32" rx="25" ry="15" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="2.6"/>
    <path d="M16 28h9M16 34h9M31 25h9M31 31h9M31 37h9M46 30h6" stroke="${C.leafDeep}" stroke-width="2.6"/></g>`,
  // 세포막: 드나드는 것을 가려 받는 경계(지나가는 알갱이 / 막히는 알갱이)
  membrane: `<path d="M6 26h52M6 38h52" stroke="${C.memb}" stroke-width="3.6"/>
    <circle cx="19" cy="11" r="6" fill="${C.bio}"/>
    <path d="M19 19v27" stroke="#0CA678" stroke-width="2.6"/><path d="M19 53l-6-9h12z" fill="#0CA678"/>
    <circle cx="45" cy="13" r="5" fill="${C.line}"/>
    <path d="M39 26l12 12M51 26l-12 12" stroke="${C.gray}" stroke-width="2.6"/>`,
  // 동물세포: 둥근 윤곽 + 핵 + 마이토콘드리아
  animalcell: `<path d="M32 9C46 9 56 19 56 31C56 45 45 55 31 55C18 55 8 45 8 32C8 19 18 9 32 9Z" fill="${C.cyto}" stroke="${C.memb}" stroke-width="3"/>
    <circle cx="27" cy="27" r="9" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="2"/>
    <ellipse cx="42" cy="42" rx="9" ry="5" transform="rotate(-20 42 42)" fill="${C.mitoTint}" stroke="${C.mitoDeep}" stroke-width="1.8"/>
    <ellipse cx="20" cy="44" rx="8" ry="4.5" transform="rotate(15 20 44)" fill="${C.mitoTint}" stroke="${C.mitoDeep}" stroke-width="1.8"/>`,
  // 식물세포: 네모 윤곽(세포벽) + 엽록체
  plantcell: `<rect x="7" y="12" width="50" height="40" rx="9" stroke="${C.wall}" stroke-width="6"/>
    <rect x="12" y="17" width="40" height="30" rx="5" fill="${C.cyto}" stroke="${C.memb}" stroke-width="2.2"/>
    <circle cx="22" cy="26" r="6.5" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="1.8"/>
    <ellipse cx="38" cy="25" rx="7" ry="4.5" transform="rotate(-18 38 25)" fill="${C.chloro}" stroke="${C.leafDeep}" stroke-width="1.6"/>
    <ellipse cx="42" cy="39" rx="7" ry="4.5" transform="rotate(12 42 39)" fill="${C.chloro}" stroke="${C.leafDeep}" stroke-width="1.6"/>
    <ellipse cx="22" cy="40" rx="7" ry="4.5" transform="rotate(-8 22 40)" fill="${C.chloro}" stroke="${C.leafDeep}" stroke-width="1.6"/>`,
  // 신경세포: 길게 뻗은 돌기로 신호를 전한다
  nerve: `<circle cx="17" cy="32" r="10" fill="${C.nucTint}" stroke="${C.nucDeep}" stroke-width="2.4"/>
    <path d="M9 25L3 18M9 39L3 46M17 22V12" stroke="${C.nucDeep}" stroke-width="2.4"/>
    <path d="M27 32h22" stroke="${C.nuc}" stroke-width="3.6"/>
    <path d="M49 32l8-7M49 32l8 7M49 32h9" stroke="${C.nuc}" stroke-width="2.6"/>`,
  // 적혈구: 가운데가 오목한 원반(위에서 본 모습 + 옆모습)
  rbc: `<circle cx="24" cy="22" r="14" fill="${C.blood}" stroke="${C.bloodDeep}" stroke-width="2.2"/>
    <circle cx="24" cy="22" r="7" fill="#FBBFC7"/>
    <circle cx="24" cy="22" r="7" stroke="#E8909D" stroke-width="1.4"/>
    <path d="M8 48C13 37 23 45 32 45C41 45 51 37 56 48C51 59 41 51 32 51C23 51 13 59 8 48Z" fill="${C.blood}" stroke="${C.bloodDeep}" stroke-width="2.2"/>`,
  // 상피세포: 납작한 세포가 이어져 표면을 덮는다
  epithelial: `<path d="M4 22h56M4 44h56" stroke="${C.line}" stroke-width="2"/>
    <g fill="${C.blueTint}" stroke="${C.blue}" stroke-width="2"><rect x="5" y="26" width="17" height="13" rx="5"/><rect x="24" y="26" width="16" height="13" rx="5"/><rect x="42" y="26" width="17" height="13" rx="5"/></g>
    <g fill="${C.nucDeep}"><circle cx="13" cy="32" r="2.4"/><circle cx="32" cy="32" r="2.4"/><circle cx="50" cy="32" r="2.4"/></g>`,
  // 구성 단계 사다리: 한 칸씩 올라간다
  ladder: `<path d="M20 58V14M44 58V14" stroke="${C.gray}" stroke-width="3.2"/>
    <path d="M20 50h24M20 40h24M20 30h24M20 20h24" stroke="${C.bio}" stroke-width="3.2"/>
    <path d="M32 4l-7 8h14z" fill="${C.bio}"/>`,
  // ── L5 구성 단계 ──
  // 조직: 모양과 기능이 같은 세포가 모인 것
  tissue: `<g fill="${C.cyto}" stroke="${C.bio}" stroke-width="2"><rect x="6" y="16" width="16" height="14" rx="6"/><rect x="24" y="16" width="16" height="14" rx="6"/><rect x="42" y="16" width="16" height="14" rx="6"/>
    <rect x="6" y="34" width="16" height="14" rx="6"/><rect x="24" y="34" width="16" height="14" rx="6"/><rect x="42" y="34" width="16" height="14" rx="6"/></g>
    <g fill="${C.nuc}"><circle cx="14" cy="23" r="2.6"/><circle cx="32" cy="23" r="2.6"/><circle cx="50" cy="23" r="2.6"/><circle cx="14" cy="41" r="2.6"/><circle cx="32" cy="41" r="2.6"/><circle cx="50" cy="41" r="2.6"/></g>`,
  // 기관: 여러 조직이 모여 고유한 일을 하는 것
  organ: `<path d="M32 54C13 41 6 32 6 23C6 15 12 9 19 9C24 9 29 12 32 16C35 12 40 9 45 9C52 9 58 15 58 23C58 32 51 41 32 54Z" fill="#F7A8B4" stroke="${C.bloodDeep}" stroke-width="2.6"/>
    <path d="M32 16v34" stroke="${C.bloodDeep}" stroke-width="2"/>`,
  // 기관계: 관련된 기관이 이어져 한 흐름을 이룬다
  organsys: `<path d="M32 34C22 27 17 22 17 16C17 11 21 7 26 7C29 7 31 9 32 11C33 9 35 7 38 7C43 7 47 11 47 16C47 22 42 27 32 34Z" fill="#F7A8B4" stroke="${C.bloodDeep}" stroke-width="2.2"/>
    <path d="M20 38C8 43 10 58 26 58C42 58 54 49 48 38" stroke="${C.bloodDeep}" stroke-width="2.8" fill="none"/>
    <circle cx="26" cy="58" r="3.4" fill="${C.blood}"/><circle cx="48" cy="38" r="3.4" fill="${C.blood}"/>`,
  // 조직계: 여러 조직이 층을 이룬 잎 단면
  tissuesys: `<rect x="6" y="16" width="52" height="9" rx="4.5" fill="#DFF3E4" stroke="${C.leafDeep}" stroke-width="1.8"/>
    <rect x="6" y="26" width="52" height="14" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.8"/>
    <path d="M17 26v14M28 26v14M39 26v14M50 26v14" stroke="${C.leafDeep}" stroke-width="1.4"/>
    <rect x="6" y="41" width="52" height="9" rx="4.5" fill="#DFF3E4" stroke="${C.leafDeep}" stroke-width="1.8"/>
    <ellipse cx="22" cy="33" rx="7" ry="5" fill="#FFF3BF" stroke="${C.wall}" stroke-width="1.8"/>`,
  // ── L6~L7 다양성·변이 ──
  // 종류의 다양함: 서로 다른 생물이 여럿(잎·물고기·버섯·벌레·새)
  diversity: `<path d="M16 28C8 24 8 12 16 10C24 12 24 24 16 28Z" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.8"/>
    <path d="M25 17c4-6 13-7 17-3 2 2 2 4 0 6-4 4-13 3-17-3z" fill="#7FC4F5" stroke="${C.blueDeep}" stroke-width="1.6"/>
    <path d="M42 14l6-4v14l-6-4z" fill="#7FC4F5" stroke="${C.blueDeep}" stroke-width="1.6"/>
    <path d="M6 46c0-6 4-9 8-9s8 3 8 9z" fill="#F3A183" stroke="#B85C38" stroke-width="1.8"/>
    <rect x="11" y="46" width="6" height="9" rx="3" fill="#F7E3D0" stroke="#B85C38" stroke-width="1.6"/>
    <path d="M35 41v13" stroke="#B8860B" stroke-width="2.4"/>
    <path d="M34 48c-4-8-11-8-11-2.5s7 7 11 2.5zM36 48c4-8 11-8 11-2.5s-7 7-11 2.5z" fill="#FFD43B" stroke="#B8860B" stroke-width="1.6"/>
    <path d="M35 41l-3-4M35 41l3-4" stroke="#B8860B" stroke-width="1.6"/>
    <path d="M44 50c4-6 8-6 8-2c0-4 5-4 9 2" stroke="${C.gray2}" stroke-width="2.6" fill="none"/>`,
  // 생태계의 다양함: 산·물·햇빛이 어우러진 곳
  ecosystem: `<circle cx="50" cy="14" r="7" fill="#FFC85E"/>
    <path d="M4 40l14-18 10 12 8-10 14 16z" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.8"/>
    <rect x="4" y="42" width="56" height="14" rx="4" fill="#BFE0F8"/>
    <path d="M10 48q5 -4 10 0t10 0t10 0t10 0" stroke="#8FBBF2" stroke-width="2" fill="none"/>`,
  // 종: 같은 무리끼리 짝을 지어 번식 능력이 있는 자손을 남긴다
  species: `<g fill="#6A9BD8">
      <path d="M5 22c0-6 6-10 13-10 4 0 7 1 9 3l4-4v6c2 2 3 4 3 6 0 6-6 10-14 10S5 28 5 22z"/>
      <path d="M33 22c0-6 6-10 13-10 4 0 7 1 9 3l4-4v6c2 2 3 4 3 6 0 6-6 10-14 10s-15-4-15-11z"/>
      <path d="M24 50c0-4 4-7 8-7 3 0 5 .7 6.5 2l3-3v4.5c1.2 1.2 1.8 2.4 1.8 3.7 0 4-4.3 6.8-9.3 6.8S24 54 24 50z"/></g>
    <g fill="${C.white}"><circle cx="24" cy="19" r="2"/><circle cx="52" cy="19" r="2"/><circle cx="37" cy="48" r="1.5"/></g>
    <g fill="${C.beak}"><path d="M31.5 22l6 2.5-6 2.5z"/><path d="M59.5 22l4 2.5-4 2.5z"/><path d="M42.5 49l4 1.8-4 1.8z"/></g>
    <path d="M18 33L27 43M46 33L38 43" stroke="${C.line}" stroke-width="1.8" stroke-dasharray="3 3"/>`,
  // 변이: 같은 종류인데 무늬가 조금씩 다르다
  variation: `<g stroke="#A8794A" stroke-width="1.6">
      <path d="M14 19C3 21 2 33 3 39Q14 46 25 39C26 33 25 21 14 19Z" fill="#F4E9D7"/>
      <path d="M32 19C21 21 20 33 21 39Q32 46 43 39C44 33 43 21 32 19Z" fill="#EFE1C6"/>
      <path d="M50 19C39 21 38 33 39 39Q50 46 61 39C62 33 61 21 50 19Z" fill="#F7F0E2"/></g>
    <g stroke="#7A5230" stroke-width="3">
      <path d="M14 23L9 38"/><path d="M32 23V41"/><path d="M50 23L45 38"/><path d="M50 23L55 38"/></g>`,
  // 환경 적응: 먹이에 맞는 부리를 가진 개체가 살아남는다
  adapt: `<circle cx="24" cy="26" r="13" fill="#E8E1D6" stroke="#A79C8C" stroke-width="2"/>
    <circle cx="29" cy="22" r="2.6" fill="${C.ink2}"/>
    <path d="M36 18l16 8-16 8z" fill="${C.beak}" stroke="${C.beakDeep}" stroke-width="1.8"/>
    <ellipse cx="55" cy="26" rx="6" ry="5" fill="${C.seed}" stroke="${C.seedDeep}" stroke-width="1.8"/>
    <path d="M16 50l7 7 15-15" stroke="${C.bio}" stroke-width="3.4"/>`,
  // 새로운 종: 한 무리가 오랜 시간 뒤 서로 다른 두 무리로 갈린다
  newspecies: `<circle cx="12" cy="32" r="9" fill="${C.bio}"/>
    <path d="M23 28L37 17" stroke="${C.gray}" stroke-width="2.4"/>${head(38, 16, -38, C.gray, 6)}
    <path d="M23 36L37 47" stroke="${C.gray}" stroke-width="2.4"/>${head(38, 48, 38, C.gray, 6)}
    <circle cx="50" cy="13" r="9" fill="#7FC4F5"/>
    <rect x="42" y="42" width="17" height="17" rx="5" fill="#FFB03A"/>`,
  // ── L8~L9 분류 ──
  // 분류: 고유한 특징을 기준으로 무리를 나눈다
  classify: `<circle cx="18" cy="32" r="14" fill="${C.blueTint}" stroke="${C.blue}" stroke-width="2"/>
    <circle cx="46" cy="32" r="14" fill="${C.bioTint}" stroke="${C.bio}" stroke-width="2"/>
    <g fill="${C.blue}"><circle cx="13" cy="27" r="3.4"/><circle cx="23" cy="30" r="3.4"/><circle cx="16" cy="38" r="3.4"/></g>
    <g fill="${C.bio}"><path d="M46 23l4.5 8h-9z"/><path d="M39 35l4.5 8h-9z"/><path d="M53 35l4.5 8h-9z"/></g>`,
  // 분류체계: 아래로 갈수록 넓어지는 일곱 단계
  rank: rankGlyph(),
  // 5계: 생물 전체를 다섯 무리로
  kingdom5: kingdomGlyph(),
  // 원핵생물계: 핵은 없고 세포벽은 있는 한 세포짜리
  prokaryote: `<rect x="8" y="23" width="38" height="19" rx="9.5" fill="#FFF3BF" stroke="${C.wall}" stroke-width="4"/>
    <path d="M15 32q4 -4 8 0t8 0t8 0" stroke="${C.gray}" stroke-width="2.2" fill="none"/>
    <path d="M46 32c5 0 5-6 10-6s3 6 8 6" stroke="${C.gray}" stroke-width="2.4" fill="none"/>`,
  // 원생생물계: 핵은 있지만 나머지 세 무리에 들지 않는 무리
  protist: `<path d="M14 20c3-8 12-9 16-4 3-6 12-8 16-2 5-6 14-2 13 5 6 2 6 11 0 13 4 6-2 14-9 11-1 8-11 10-15 4-4 6-13 5-15-2-8 2-13-6-9-12-4-5-1-13 3-13z" fill="#C5F6FA" stroke="#1098AD" stroke-width="2.4"/>
    <circle cx="27" cy="31" r="6" fill="#8FE3F0" stroke="#1098AD" stroke-width="1.8"/>
    <circle cx="44" cy="40" r="3" fill="#FFFFFF" stroke="#1098AD" stroke-width="1.4"/>`,
  // 균계: 세포벽이 있고 광합성 대신 분해로 살아간다
  fungi: `<path d="M9 30c0-12 10-19 23-19s23 7 23 19z" fill="#F3A183" stroke="#B85C38" stroke-width="2.4"/>
    <g fill="#FFE0D2"><circle cx="20" cy="22" r="3"/><circle cx="34" cy="18" r="3.4"/><circle cx="45" cy="24" r="2.6"/></g>
    <path d="M25 30h14v18c0 3-3 5-7 5s-7-2-7-5z" fill="#F7E3D0" stroke="#B85C38" stroke-width="2.2"/>
    <path d="M8 56c7-4 14-3 20-1M36 55c7-3 13-3 20-1" stroke="#B85C38" stroke-width="2"/>`,
  // 식물계: 엽록체로 스스로 양분을 만든다
  plantk: `<path d="M32 56V26" stroke="${C.wallDeep}" stroke-width="3.4"/>
    <path d="M32 32c-11 0-18-6-18-14 11-3 18 4 18 14zM32 28c0-11 7-17 18-14 2 9-7 15-18 14z" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="2"/>
    <path d="M32 56c-5 1-8 3-11 6M32 56c5 1 8 3 11 6" stroke="${C.wallDeep}" stroke-width="2.2"/>`,
  // 동물계: 세포벽이 없고 먹이를 먹으며 움직인다
  animalk: `<path d="M8 32c8-13 27-15 36-6 3 3 4 8 0 12-9 9-28 7-36-6z" fill="#7FC4F5" stroke="${C.blueDeep}" stroke-width="2.4"/>
    <path d="M44 24l12-7v30l-12-7z" fill="#7FC4F5" stroke="${C.blueDeep}" stroke-width="2.4"/>
    <circle cx="19" cy="28" r="2.6" fill="${C.blueDeep}"/>
    <path d="M27 24q6 6 0 12" stroke="${C.blueDeep}" stroke-width="1.8" fill="none"/>`,
  // ── L10 보전 ──
  // 멸종: 한 종류가 생태계에서 사라진다
  extinct: `<path d="M20 46c-9-4-13-13-10-21 3-8 12-12 20-9 5 2 8 6 9 11l8 3-7 4c-1 8-6 13-13 14z" fill="#E8EBEF" stroke="${C.gray}" stroke-width="2" stroke-dasharray="5 4"/>
    <circle cx="26" cy="27" r="2.2" fill="${C.gray}"/>
    <g fill="${C.line}"><circle cx="49" cy="20" r="3.2"/><circle cx="56" cy="13" r="2.2" opacity=".7"/><circle cx="61" cy="7" r="1.6" opacity=".45"/></g>`,
  // 먹이 관계: 여러 갈래로 이어진 그물
  foodweb: `<g stroke="${C.gray}" stroke-width="2"><path d="M14 46L19 38M38 46L25 38M38 46L43 38M20 26L29 19M44 26L35 19"/></g>
    <g fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.6"><circle cx="14" cy="52" r="6"/><circle cx="38" cy="52" r="6"/></g>
    <g fill="#BFE0F8" stroke="${C.blueDeep}" stroke-width="1.6"><circle cx="20" cy="32" r="6"/><circle cx="44" cy="32" r="6"/></g>
    <circle cx="32" cy="13" r="7" fill="${C.mitoTint}" stroke="${C.mitoDeep}" stroke-width="1.8"/>`,
  // 생물이 주는 혜택: 먹을거리·약·재료
  benefit: `<path d="M8 44c6 11 42 11 48 0" stroke="${C.bio}" stroke-width="3.4" fill="none"/>
    <path d="M16 36c-7-4-8-15-1-19 7 2 9 14 1 19z" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="1.8"/>
    <g transform="rotate(24 32 27)"><rect x="26" y="17" width="12" height="20" rx="6" fill="#FFE3E3" stroke="${C.bloodDeep}" stroke-width="1.8"/><path d="M26 27h12" stroke="${C.bloodDeep}" stroke-width="1.6"/></g>
    <path d="M50 38V14" stroke="${C.wall}" stroke-width="2.4"/>
    <g fill="#F0C070" stroke="${C.wallDeep}" stroke-width="1.2"><ellipse cx="46" cy="20" rx="3.6" ry="2.3" transform="rotate(-30 46 20)"/><ellipse cx="54" cy="20" rx="3.6" ry="2.3" transform="rotate(30 54 20)"/><ellipse cx="46" cy="28" rx="3.6" ry="2.3" transform="rotate(-30 46 28)"/><ellipse cx="54" cy="28" rx="3.6" ry="2.3" transform="rotate(30 54 28)"/></g>`,
  // 서식지: 생물이 살아가는 자리
  habitat: `<path d="M4 50h56" stroke="${C.wallDeep}" stroke-width="3"/>
    <path d="M22 50V32" stroke="${C.wallDeep}" stroke-width="3.4"/>
    <circle cx="22" cy="22" r="13" fill="${C.leaf}" stroke="${C.leafDeep}" stroke-width="2"/>
    <path d="M40 50c0-6 4-10 9-10s9 4 9 10z" fill="${C.wall}" stroke="${C.wallDeep}" stroke-width="1.8"/>
    <g fill="${C.white}"><ellipse cx="46" cy="46" rx="3" ry="2.3"/><ellipse cx="52" cy="46" rx="3" ry="2.3"/></g>
    <path d="M8 50q2 -6 4 0M14 50q2 -5 4 0M60 50q-2 -5 -4 0" stroke="${C.leafDeep}" stroke-width="2"/>`,
  // 외래생물: 살던 곳이 아닌 무리 안으로 들어온다
  alien: `<circle cx="25" cy="35" r="19" fill="#F1FCF7" stroke="${C.bio}" stroke-width="2" stroke-dasharray="5 4"/>
    <g fill="${C.bio}"><circle cx="19" cy="29" r="4"/><circle cx="31" cy="33" r="4"/><circle cx="21" cy="43" r="4"/></g>
    <path d="M50 10l7 12H43z" fill="#F04452"/>
    <path d="M47 25L36 34" stroke="#F04452" stroke-width="2.4"/>${head(35, 35, 140, "#F04452", 6)}`,
  // 생태통로: 길 위로 이어 준 통로를 동물이 건넌다
  ecobridge: `<rect x="4" y="42" width="56" height="16" rx="3" fill="${C.line}"/>
    <path d="M8 50h8M22 50h8M36 50h8M50 50h6" stroke="${C.white}" stroke-width="2.4"/>
    <path d="M6 44Q32 8 58 44" stroke="${C.leaf}" stroke-width="8" fill="none"/>
    <path d="M6 44Q32 8 58 44" stroke="${C.leafDeep}" stroke-width="1.6" fill="none"/>
    <ellipse cx="32" cy="15" rx="7" ry="4.5" fill="${C.bark}"/><circle cx="39" cy="11" r="3.4" fill="${C.bark}"/>
    <path d="M38 8l-2-4M41 8l3-4" stroke="${C.bark}" stroke-width="1.8"/>
    <path d="M28 19v4M35 19v4" stroke="${C.bark}" stroke-width="1.8"/>`,
};

/** 없는 키를 위한 중립 플레이스홀더 — 빈 문자열을 반환하면 카드 자리가 비어 보인다. */
const MINI_FALLBACK = `<rect x="12" y="12" width="40" height="40" rx="12" fill="${C.faint}" stroke="${C.line}" stroke-width="2" stroke-dasharray="5 4"/>
  <circle cx="32" cy="32" r="6.5" fill="${C.line}"/>`;

/** recap 카드 미니아트(64×64 플랫). 카드 본문이 뜻을 말하므로 aria-hidden. */
export function bio3MiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
    MINI[key] ?? MINI_FALLBACK
  }</svg>`;
}

/** 다섯 생물계 비교표 — 랩(kingdomKeyLab)의 마무리와 L9 recap이 **함께 쓰는 단일 진실 공급원**.
 *  두 곳에 같은 표를 각각 적으면 한쪽만 고쳐져 어긋난다(구작 dichotomKey의 표를 되살린 것,
 *  사용자 요청 2026-07-26). 스타일은 styles/bio3-class.css의 .kkl-tbl 계열이 담당한다.
 *  "종류마다 달라요"는 억지 단정을 피한 표기 — 5계를 가르는 열쇠는 핵막·세포벽·광합성 여부다. */
export interface KingdomRow {
  k: string; color: string; nucleus: string; wall: string; food: string; rep: string;
}
export const KINGDOM_ROWS: readonly KingdomRow[] = [
  { k: "원핵생물계", color: "#A896FF", nucleus: "없음 · 한 세포", wall: "있음", food: "종류마다 달라요", rep: "대장균" },
  { k: "원생생물계", color: "#3FC5DC", nucleus: "있음 · 대부분 한 세포", wall: "종류마다 달라요", food: "종류마다 달라요", rep: "아메바" },
  { k: "균계", color: "#F79A4A", nucleus: "있음 · 대부분 여러 세포", wall: "있음", food: "분해해 흡수", rep: "송이버섯" },
  { k: "식물계", color: "#51CF66", nucleus: "있음 · 여러 세포", wall: "있음", food: "광합성", rep: "소나무" },
  { k: "동물계", color: "#74C0FC", nucleus: "있음 · 여러 세포", wall: "없음", food: "먹이 섭취", rep: "박새" },
];

export function kingdomTableHtml(): string {
  const head = ["계", "핵막 · 세포 수", "세포벽", "양분 얻기"]
    .map((h) => `<div class="kkl-th" role="columnheader">${h}</div>`).join("");
  const rows = KINGDOM_ROWS.map((r) => `<div class="kkl-tr" role="row">
      <div class="kkl-td name" role="rowheader" style="--kc:${r.color}"><b>${r.k}</b><i>${r.rep}</i></div>
      <div class="kkl-td" role="cell">${r.nucleus}</div>
      <div class="kkl-td" role="cell">${r.wall}</div>
      <div class="kkl-td" role="cell">${r.food}</div>
    </div>`).join("");
  return `<div class="kkl-tbl" role="table" aria-label="다섯 생물계 비교표">
    <div class="kkl-tr head" role="row">${head}</div>${rows}
  </div>
  <div class="kkl-note">다섯 계를 가르는 열쇠는 <b>핵막</b>·<b>세포벽</b>·<b>광합성 여부</b>예요. 한 가지 특징만으로 단정하지 말고 함께 견주어야 해요.</div>`;
}
