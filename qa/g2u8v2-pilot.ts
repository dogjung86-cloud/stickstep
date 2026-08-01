// g2u8 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 4호) · 정본 설계표 qa/g2u8-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정·index.ts 미등록. 확대 승인분과 함께 build-g2u8v2-lessons.mjs가
// g2u8l1~l8.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 5종(OP·DP·FL·MB·TM)은 파일럿 로컬 함수(m1u5 v2 관행) · 이식 때 ui/examFigures.ts
// "g2u8 v2" 섹션으로 승격한다. 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다.
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커는 ✓만 · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) · num answer 문자열+unitLabel.
// 각 문항 주석 = [슬롯] 검산 노트(시차 절반·제곱 관계·등급 산술·색 순서·성단 짝·풍선 대응).
// 언어 가드 금지어 목록은 설계표 §0 정본(이식 후 검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
import type { ExamItem } from "../src/content/exams/types";
import {
  starParallax3Fig, starShiftPairFig, starBrightGridFig,
  colorTempTrioFig, starGalaxyQuizFig, starClusterMapFig, starExpandArrowFig, svgTable,
} from "../src/ui/examFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
/** NASA·ESO 실사(photos/star · v1 풀 pimg 문법 재사용, lazy 금지) */
const pimg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}photos/star/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** 발주 실사(exam/g2u8) */
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/g2u8/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** photos/star 2연 (가)(나) 나란히 */
const spair = (a: string, altA: string, b: string, altB: string): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${IMG_BASE}photos/star/${a}" alt="${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="${IMG_BASE}photos/star/${b}" alt="${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>`;
/** exam/g2u8 2연 (가)(나) · 풍선 xpair용 */
const xpair = (a: string, altA: string, b: string, altB: string): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${IMG_BASE}exam/g2u8/${a}" alt="${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="${IMG_BASE}exam/g2u8/${b}" alt="${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>`;

/* ══════════ 신작 헬퍼 5종(이식 때 examFigures "g2u8 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;
/** 발광 별(examFigures xstar와 같은 시각 문법의 로컬판) */
const vstar = (x: number, y: number, r: number, fill: string): string => {
  const spikes: string[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    spikes.push(
      `<line x1="${(x + Math.cos(a) * r * 1.15).toFixed(1)}" y1="${(y + Math.sin(a) * r * 1.15).toFixed(1)}" x2="${(x + Math.cos(a) * r * 1.9).toFixed(1)}" y2="${(y + Math.sin(a) * r * 1.9).toFixed(1)}" stroke="${fill}" stroke-width="${Math.max(1.1, r * 0.16)}" opacity=".75"/>`,
    );
  }
  return `<circle cx="${x}" cy="${y}" r="${r * 2.1}" fill="${fill}" opacity=".13"/><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${spikes.join("")}`;
};

/** MS msFigV2 · 색×겉보기 등급 산점도(starMagScatterFig의 v2 패치판 · 이식 때 원본 패치로 승격).
 *  파일럿 눈검수 반영 2건: ① 하단 "표면 온도 높음·낮음" 방향 라벨 제거(색·온도 방향 판정이 과제인데
 *  그림이 답을 인쇄 · 실측 산점도 원형에도 없는 라벨) ② 마지막 칸(적색) 별의 라벨이 가장자리에
 *  붙지 않게 col 5 이상은 라벨을 왼쪽에 단다. */
export function msFigV2(o: { pts: { label: string; col: number; mag: number }[] }): string {
  const COLS = ["청색", "청백색", "백색", "황백색", "황색", "주황색", "적색"];
  const HEX = ["#9CC4FF", "#BFD8FF", "#F0F4FA", "#FFF2D0", "#FFE9A8", "#FFC08A", "#FF9A66"];
  const gx = (c: number): number => 66 + c * 42;
  const gy = (m: number): number => 26 + (m - 1) * 32;
  let axis = "";
  for (let m = 1; m <= 5; m++)
    axis += `<line x1="46" y1="${gy(m)}" x2="330" y2="${gy(m)}" stroke="#1E2C48" stroke-width="1"/>
      <text x="38" y="${gy(m) + 4}" text-anchor="end" font-size="10.5" fill="#7E93B8">${m}</text>`;
  const cols = COLS.map(
    (c, i) => `<text x="${gx(i)}" y="184" text-anchor="middle" font-size="9.5" fill="#AFC3E3">${c}</text>`,
  ).join("");
  const pts = o.pts
    .map((p) => {
      const left = p.col >= 5;
      return `${vstar(gx(p.col), gy(p.mag), 6, HEX[p.col])}
      <text x="${gx(p.col) + (left ? -15 : 15)}" y="${gy(p.mag) - 8}" text-anchor="${left ? "end" : "start"}" font-size="12" font-weight="800" fill="#DCE8FF">${p.label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="가로축은 별의 색(청색에서 적색까지 일곱 단계), 세로축은 겉보기 등급인 그래프에 별 ${o.pts.map((p) => p.label).join(", ")}의 위치가 점으로 표시된 그림">
    ${axis}
    <line x1="46" y1="18" x2="46" y2="168" stroke="#3D5378" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#3D5378" stroke-width="1.6"/>
    <text x="14" y="14" font-size="10" fill="#7E93B8">겉보기 등급</text>
    ${cols}${pts}
  </svg>`;
}

/** OP starOrbitPickFig · 지구 공전 궤도 위 네 위치 A~D(정면 원 궤도)와 오른쪽 먼 별.
 *  이웃한 두 위치 사이 = 3개월 캡션이 판독 근거(마주 보는 짝 = 6개월). 시차각 수치 미인쇄. */
export function starOrbitPickFig(): string {
  const cx = 130;
  const cy = 104;
  const R = 62;
  const pos: { x: number; y: number; t: string }[] = [
    { x: cx, y: cy - R, t: "A" },
    { x: cx + R, y: cy, t: "B" },
    { x: cx, y: cy + R, t: "C" },
    { x: cx - R, y: cy, t: "D" },
  ];
  const dots = pos
    .map(
      (p) => `<circle cx="${p.x}" cy="${p.y}" r="6" fill="#3E8EE0"/>
        <text x="${p.x + (p.x === cx ? 14 : p.x > cx ? 15 : -15)}" y="${p.y === cy ? p.y + 4 : p.y > cy ? p.y + 17 : p.y - 10}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">${p.t}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="태양 둘레를 도는 지구 공전 궤도 위에 네 위치 A, B, C, D가 표시되어 있고, 오른쪽 멀리 별이 있는 그림">
    <circle cx="${cx}" cy="${cy}" r="${R}" stroke="#2C4066" stroke-width="1.4" stroke-dasharray="4 5"/>
    <circle cx="${cx}" cy="${cy}" r="9" fill="#FFC24D"/>
    <text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="10.5" fill="#7E93B8">태양</text>
    <path d="M${cx + R - 4} ${cy - 14}a14 14 0 0 1 3 10" stroke="#5E7398" stroke-width="1.4" fill="none"/>
    <path d="M${cx + R - 1} ${cy - 5}l3 -6 3 6" stroke="#5E7398" stroke-width="1.4" fill="none"/>
    ${dots}
    ${vstar(312, cy, 7, "#FFE9A8")}
    <text x="312" y="70" text-anchor="middle" font-size="11" fill="#AFC3E3">별</text>
    <text x="130" y="196" text-anchor="middle" font-size="10.5" fill="#7E93B8">이웃한 두 위치 사이의 간격 = 3개월</text>
  </svg>`;
}

/** DP starDistPairFig · 같은 별을 (가) 거리 r · (나) 거리 far배에서 관측하는 장면.
 *  거리 비 라벨(r · far r)만 인쇄, 밝기 배수는 인쇄하지 않는다(계산이 과제). */
export function starDistPairFig(o: { far: number }): string {
  const sx = 34;
  const y = 92;
  const r1 = 64;
  const gx = sx + r1;
  const fx = sx + r1 * o.far;
  const eye = (x: number, label: string): string =>
    `<circle cx="${x}" cy="${y}" r="10" fill="#16233C" stroke="#5B7BB8" stroke-width="1.6"/>
     <circle cx="${x - 3}" cy="${y}" r="3.4" fill="#C9D6F0"/>
     <text x="${x}" y="${y + 30}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">${label}</text>`;
  const brace = (x1: number, x2: number, ly: number, t: string): string =>
    `<path d="M${x1} ${ly}h${x2 - x1}" stroke="#8B6F3A" stroke-width="1.2" stroke-dasharray="4 4"/>
     <path d="M${x1} ${ly - 4}v8M${x2} ${ly - 4}v8" stroke="#8B6F3A" stroke-width="1.2"/>
     <text x="${(x1 + x2) / 2}" y="${ly - 8}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#C9A96A">${t}</text>`;
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="같은 별을 (가)는 별에서 거리 r인 곳, (나)는 거리 ${o.far}r인 곳에서 관측하는 그림">
    ${vstar(sx, y, 8, "#FFE9A8")}
    <text x="${sx}" y="${y - 24}" text-anchor="middle" font-size="11" fill="#AFC3E3">별</text>
    ${eye(gx, "(가)")}
    ${eye(fx, "(나)")}
    ${brace(sx, gx, 44, "r")}
    ${brace(sx, fx, 24, `${o.far}r`)}
  </svg>`;
}

/** FL starFlowFig · 거리·넓이·밝기 관계 순서도(라이트) · 결론 칸 ㉠·㉡은 비어 있다(관계 채우기). */
export function starFlowFig(): string {
  const box = (y: number, w: number, text: string, sub?: string): string => {
    const x = (344 - w) / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="42" rx="10" fill="#F7F9FC" stroke="#C4CAD2" stroke-width="1.4"/>
      <text x="172" y="${y + (sub ? 18 : 26)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">${text}</text>
      ${sub ? `<text x="172" y="${y + 34}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1B64DA">${sub}</text>` : ""}`;
  };
  const arrow = (y: number): string => `<path d="M172 ${y}v14M167 ${y + 8}l5 7 5-7" stroke="#8B95A1" stroke-width="1.8" fill="none"/>`;
  return `<svg viewBox="0 0 344 194" ${NS} fill="none" role="img" aria-label="별까지의 거리가 멀어질 때 빛이 덮는 넓이와 밝기가 어떻게 되는지 빈칸 ㉠과 ㉡으로 묻는 순서도">
    ${box(8, 250, "별까지의 거리가 멀어진다")}
    ${arrow(52)}
    ${box(70, 280, "빛이 덮는 넓이는", "㉠")}
    ${arrow(114)}
    ${box(132, 280, "우리 눈에 보이는 별의 밝기는", "㉡")}
  </svg>`;
}

/** MB starMagBandFig · 겉보기 등급 눈금 띠(다크) 위 별 마커 · 눈금 숫자와 별 위치만 인쇄.
 *  밝기 배수(2.5·100)와 밝음·어두움 방향 라벨은 인쇄하지 않는다(판독·계산이 과제). */
export function starMagBandFig(o: { min: number; max: number; stars: { mag: number; label: string }[] }): string {
  const x0 = 34;
  const x1 = 310;
  const y = 108;
  const gx = (m: number): number => x0 + ((m - o.min) / (o.max - o.min)) * (x1 - x0);
  let ticks = "";
  for (let m = o.min; m <= o.max; m++)
    ticks += `<line x1="${gx(m)}" y1="${y - 6}" x2="${gx(m)}" y2="${y + 6}" stroke="#4A6292" stroke-width="1.4"/>
      <text x="${gx(m)}" y="${y + 26}" text-anchor="middle" font-size="11" fill="#AFC3E3">${m}</text>`;
  const stars = o.stars
    .map(
      (s) => `${vstar(gx(s.mag), y - 34, 6.5, "#FFE9A8")}
      <line x1="${gx(s.mag)}" y1="${y - 20}" x2="${gx(s.mag)}" y2="${y - 8}" stroke="#8B6F3A" stroke-width="1.2" stroke-dasharray="3 3"/>
      <text x="${gx(s.mag)}" y="${y - 56}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">${s.label}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="겉보기 등급 ${o.min}부터 ${o.max}까지 눈금이 새겨진 띠 위에 별 ${o.stars.map((s) => s.label).join(", ")}의 위치가 표시된 그림">
    <line x1="${x0 - 10}" y1="${y}" x2="${x1 + 12}" y2="${y}" stroke="#3D5378" stroke-width="1.8"/>
    ${ticks}${stars}
    <text x="${x1 + 16}" y="${y + 26}" text-anchor="start" font-size="10.5" fill="#7E93B8">등급</text>
  </svg>`;
}

/** TM starTopMarksFig · 위에서 본 우리은하 실사 위 위치 마커 A·B·C(중심 · 중간 · 가장자리).
 *  마커에 이름·거리 라벨 없음(위치 판정이 과제). 실사 스코프 문법(뷰포트가 클립을 완전히 덮는다). */
export function starTopMarksFig(): string {
  const mark = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="9" stroke="#FFE9A8" stroke-width="2" fill="none"/>
     <circle cx="${x}" cy="${y}" r="2.4" fill="#FFE9A8"/>
     <text x="${x}" y="${y - 15}" text-anchor="middle" font-size="14" font-weight="800" fill="#FFE9A8" stroke="#0B1524" stroke-width="3" paint-order="stroke">${t}</text>`;
  return `<svg viewBox="0 0 344 300" ${NS} fill="none" role="img" aria-label="위에서 내려다본 우리은하 그림 위에 세 위치 A, B, C가 기호로만 표시되어 있어요">
    <rect x="0" y="0" width="344" height="300" fill="#0B1524"/>
    <image href="${IMG_BASE}photos/star/milkyway-top.webp" x="22" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice"/>
    ${mark(164, 140, "A")}
    ${mark(238, 190, "B")}
    ${mark(316, 150, "C")}
  </svg>`;
}

/* ══════════ 파일럿 40문항 ══════════ */

export const POOL_G2U8V2_PILOT: ExamItem[] = [
  // ─── L1 별까지의 거리(연주 시차) · 🅟 5 ───
  {
    // [202] d1 · P thumb-eye · 절차 판정(두 관측 위치 = 왼눈·오른눈). v1 각도(시차 관찰 조건)와 교체.
    id: "g2u8e202",
    lessonId: "g2u8l1",
    type: "mcq",
    diff: 1,
    prompt: "사진처럼 팔을 쭉 뻗어 엄지를 세우고, 창밖 나무를 배경 삼아 시차를 관찰하려고 해요. 이어서 해야 할 일로 옳은 것은?",
    figure: ximg("thumb-eye.webp", "팔을 뻗어 엄지를 세우고 창밖 나무를 향해 서 있는 사람의 뒷모습"),
    options: [
      "한쪽 눈만 뜨고 엄지를 본 다음, 반대쪽 눈으로 바꿔 뜨고 엄지의 위치 변화를 살핀다",
      "두 눈을 모두 뜨고 엄지를 오랫동안 바라본다",
      "엄지를 좌우로 빠르게 흔들면서 바라본다",
      "나무 쪽으로 걸어가면서 엄지를 바라본다",
      "엄지에 손전등을 비춰 더 밝게 만든 뒤 바라본다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>시차는 <b>같은 물체를 서로 다른 두 위치에서 볼 때</b> 방향이 달라져 보이는 현상이에요. 왼눈과 오른눈은 약 6 cm 떨어진 서로 다른 두 관측 위치죠. 그래서 한쪽 눈으로 본 다음 반대쪽 눈으로 바꿔 뜨면, 엄지가 배경 나무 위에서 자리를 옮겨 보여요. 이것이 가장 간단한 시차 관찰이에요.<span class='xh'>오답 하나씩 격파</span>두 눈을 모두 뜨고 오래 바라보는 건 관측 위치를 바꾸지 않으니 아무리 기다려도 시차가 나타나지 않아요. 엄지를 흔드는 건 물체 자체를 움직이는 것이라 시차가 아니에요. 시차는 <b>관측자의 위치</b>가 바뀔 때 생기는 것이거든요. 나무 쪽으로 걸어가면 거리만 줄어들 뿐 두 위치에서의 방향 비교가 없고, 손전등으로 밝게 만드는 건 밝기의 문제일 뿐 방향 변화와는 관계가 없답니다.",
    core: "시차 관찰의 핵심 = 같은 물체를 서로 다른 두 위치에서 보기!",
  },
  {
    // [206] d2 · PX(0.3″/0.15″/0.05″) bogi 종합. 검산: 시차각 (가)>(나)>(다) → 거리 (가)<(나)<(다).
    // ㄱ 거짓(가장 가까운 별 = (가))·ㄴ 참·ㄷ 참 → 답 "ㄴ, ㄷ".
    id: "g2u8e206",
    lessonId: "g2u8l1",
    type: "mcq",
    diff: 2,
    prompt: "그림은 지구 공전 궤도의 양 끝에서 세 별 (가), (나), (다)를 바라본 시차를 나타낸 거예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: starParallax3Fig({ p: ["0.3″", "0.15″", "0.05″"] }),
    figureDark: true,
    bogi: [
      "세 별 중 지구에서 가장 가까운 별은 (다)다.",
      "연주 시차가 가장 큰 별은 (가)다.",
      "별까지의 거리가 멀수록 시차각이 작아진다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ이 함정이에요. 시차각은 (가) 0.3″로 가장 크고 (다) 0.05″로 가장 작죠. 시차는 <b>가까울수록 크게</b> 나타나니, 가장 가까운 별은 (다)가 아니라 <b>(가)</b>예요. ㄴ은 옳아요. 시차가 가장 큰 (가)는 연주 시차(시차의 절반)도 가장 커요. ㄷ도 옳아요. 그림에서 별이 멀어질수록 시선 부채꼴이 점점 좁아지는 것이 보이죠. 밑변(지구 궤도)은 그대로인데 삼각형이 길쭉해지니 꼭짓점 각이 작아지는 거예요.<span class='xh'>함정 포인트</span>\"각이 작다 = 멀다\"를 \"각이 크다 = 멀다\"로 뒤집어 내는 문제가 단골이에요. 기차 창밖에서 가까운 물체일수록 휙휙 크게 움직여 보였던 것처럼, <b>클수록 가깝다</b>로 기억하세요.",
    core: "시차각이 클수록 가까운 별 · 멀수록 부채꼴이 좁아진다!",
  },
  {
    // [209] d1 · SP(1.6″→0.7″) · ㉮가 움직여 보이는 까닭 = 지구 공전. 간격 수치는 장면 사실감(채점 미사용).
    id: "g2u8e209",
    lessonId: "g2u8l1",
    type: "mcq",
    diff: 1,
    prompt: "그림은 6개월 간격으로 같은 하늘을 관측한 모습이에요. 배경별 ㉯에 대해 별 ㉮의 위치가 달라져 보인 까닭은?",
    figure: starShiftPairFig({ g1: "1.6″", g2: "0.7″" }),
    figureDark: true,
    options: [
      "지구가 공전해서 관측하는 위치가 달라졌기 때문에",
      "별 ㉮가 실제로 ㉯를 향해 날아가고 있기 때문에",
      "배경별 ㉯가 6개월 동안 크게 움직였기 때문에",
      "별 ㉮의 밝기가 변하면서 위치가 달라 보였기 때문에",
      "달이 지구 주위를 공전하기 때문에",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>6개월이 지나면 지구는 공전 궤도의 반대편으로 가요. 관측소(지구)의 위치가 궤도 지름만큼 달라지니, 가까운 별 ㉮의 방향이 먼 배경별 ㉯에 대해 달라져 보이는 거예요. 움직인 건 별이 아니라 <b>관측자인 지구</b>랍니다.<span class='xh'>오답 하나씩 격파</span>\"㉮가 실제로 날아간다\"가 대표 오개념이에요. 별들은 이 기간에 사실상 제자리예요. ㉯가 움직였다는 것도 틀렸어요. ㉯는 아주 멀리 있어 시차가 거의 없는 <b>붙박이 기준</b> 역할을 하죠. 밝기 변화는 위치가 달라 보이는 것과 관계가 없고, 달의 공전은 지구의 위치를 바꾸지 못해요. 연주 시차급의 위치 변화를 만드는 건 <b>지구의 공전</b>뿐이에요.",
    core: "별이 움직인 게 아니라 지구(관측소)가 움직였다!",
  },
  {
    // [211] d2 · num(dec) · SP(0.14″→0.06″) 정보 이분(수치는 그림 라벨만).
    // 검산: 이동각 = 0.14−0.06 = 0.08″ = 시차 → 연주 시차 = 절반 = 0.04″. 정답이 그림 라벨(0.14·0.06)과 다름 ✓
    id: "g2u8e211",
    lessonId: "g2u8l1",
    type: "num",
    diff: 2,
    numKind: "dec",
    unitLabel: "″",
    prompt: "그림은 6개월 간격으로 관측한 별 ㉮의 위치예요. 이 관측에서 별 ㉮가 배경별 ㉯에 대해 움직여 보인 각(시차)을 구한 뒤, ㉮의 연주 시차를 소수로 구하세요. (단위: ″)",
    figure: starShiftPairFig({ g1: "0.14″", g2: "0.06″" }),
    figureDark: true,
    answer: "0.04",
    explain:
      "<span class='xh'>정답 풀이</span>① 6개월 전 ㉮와 ㉯ 사이의 각은 0.14″, 현재는 0.06″예요.<br>② ㉮가 움직여 보인 각(시차) = 0.14″ − 0.06″ = <b>0.08″</b><br>③ 연주 시차는 6개월 간격으로 잰 시차의 <b>절반</b>이니 0.08″ ÷ 2 = <b>0.04″</b>예요.<span class='xh'>이런 실수를 조심해요</span>가장 흔한 실수는 이동한 각 0.08″를 그대로 답하는 거예요. 연주 시차는 궤도 반지름 기준의 각으로 약속했기 때문에 반드시 <b>절반</b>으로 나눠야 해요. 반대로 그림의 0.14″나 0.06″를 그대로 옮겨 적는 것도 안 돼요. 그건 어느 한 시점의 ㉮와 ㉯ 사이 간격일 뿐, ㉮가 움직여 보인 각이 아니거든요. 두 관측을 <b>비교</b>해서 변화량을 먼저 구하는 것이 첫 단추랍니다.",
    core: "연주 시차 = 6개월 간격 시차(이동각)의 절반!",
  },
  {
    // [219] d1 · OP 신작 데뷔 · 관측 두 시점 고르기. 검산: 마주 보는 짝(A·C)만 6개월 간격 = 기선 최대.
    // B·D도 마주 보는 짝이지만 보기에서 제외(대안 유효 답 배제 관행) · 해설에서 언급.
    id: "g2u8e219",
    lessonId: "g2u8l1",
    type: "mcq",
    diff: 1,
    prompt: "그림은 지구 공전 궤도 위의 네 위치 A~D예요. 별의 연주 시차를 재기 위해 두 번 관측한다면, 어느 두 위치에서 해야 할까요?",
    figure: starOrbitPickFig(),
    figureDark: true,
    options: ["A와 B", "A와 C", "B와 C", "C와 D", "네 위치 중 아무 두 곳이나 상관없다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>시차는 두 관측 위치 사이가 멀수록 크게 잡혀요. 궤도 위에서 서로 가장 멀리 떨어진 짝은 <b>마주 보는 두 위치</b>고, 지구가 A에서 C까지 가는 데 걸리는 시간이 바로 <b>6개월</b>이에요(이웃 위치 사이가 3개월이니 두 칸이면 6개월). 그래서 A와 C에서 관측해야 해요. 같은 이유로 B와 D처럼 마주 보는 다른 짝도 가능하답니다.<span class='xh'>오답 하나씩 격파</span>A와 B, B와 C, C와 D는 모두 3개월 간격의 이웃 위치라 두 관측소 사이 거리가 마주 보는 짝보다 짧아요. 시차각이 작게 잡혀 정확한 측정이 어렵죠. \"아무 두 곳이나 상관없다\"도 틀렸어요. 관측 위치 사이 거리가 달라지면 시차각도 달라지니, <b>궤도 양 끝</b>이라는 조건을 지켜야 별끼리 공정하게 비교할 수 있어요.",
    core: "연주 시차 관측 = 궤도에서 마주 보는 두 위치(6개월 간격)!",
  },

  // ─── L2 별의 밝기와 거리 · 🅟 5 ───
  {
    // [223] d2 · BG bogi. 검산: 2배 지점 격자 2×2 = 4칸(그림 판독 ㄱ 참) · 빛 총량 불변(ㄷ 참) ·
    // 멀수록 한 칸 몫 감소(ㄴ 거짓) → 답 "ㄱ, ㄷ".
    id: "g2u8e223",
    lessonId: "g2u8l2",
    type: "mcq",
    diff: 2,
    prompt: "그림은 광원에서 나온 한 빛다발이 거리 1배, 2배, 3배 지점에서 덮는 격자판이에요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: starBrightGridFig(),
    figureDark: true,
    bogi: [
      "거리 2배 지점의 격자판은 모두 네 칸이다.",
      "거리가 멀어질수록 격자판 한 칸이 받는 빛의 양은 많아진다.",
      "광원에서 나온 빛 전체의 양은 세 지점에서 모두 같다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ은 옳아요. 그림에서 거리 2배 지점의 격자판은 가로 2칸, 세로 2칸으로 2×2 = <b>네 칸</b>이죠. 거리 3배 지점은 3×3 = 아홉 칸이고요. ㄴ이 함정이에요. 같은 양의 빛을 더 많은 칸이 나눠 가지니, 거리가 멀수록 한 칸이 받는 빛은 오히려 <b>줄어들어요</b>. ㄷ은 옳아요. 빛알은 도중에 사라지지 않아요. 세 지점을 지나는 빛 전체의 양은 똑같고, 다만 덮는 넓이가 커지면서 <b>넓게 나뉘는 것</b>뿐이에요.<span class='xh'>함정 포인트</span>\"멀면 빛이 사라져서 어둡다\"는 오개념을 이 그림이 정면으로 깨 줘요. 사라진 게 아니라 <b>퍼진 것</b>. 그래서 밝기는 나눠 가진 칸 수(면적)에 반비례한답니다.",
    core: "빛은 사라지지 않고 퍼진다 · 칸 수가 늘수록 한 칸 몫은 감소!",
  },
  {
    // [225] d2 · DP(far 4) 신작 데뷔 · 미3 형식 계승(수치 교체 r·4r). 검산: (나) 거리 4배 → 밝기 1/16 →
    // (가)가 16배 밝게. 보기 크기순 나열 shuffle:false · 정답 4번째(첫 칸 아님 ✓).
    id: "g2u8e225",
    lessonId: "g2u8l2",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 같은 별을 (가)와 (나) 두 곳에서 관측해요. (가)에서 본 별의 밝기는 (나)에서 본 밝기의 몇 배일까요?",
    figure: starDistPairFig({ far: 4 }),
    figureDark: true,
    options: ["2배", "4배", "8배", "16배", "64배"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>① (나)는 (가)보다 별에서 4배 먼 곳이에요.<br>② 밝기는 거리의 제곱에 반비례하니, (나)에서 본 밝기는 (가)의 1/(4×4) = <b>1/16</b>이에요.<br>③ 뒤집으면 (가)에서 본 밝기는 (나)의 <b>16배</b>죠.<span class='xh'>오답 하나씩 격파</span>4배를 고르는 건 제곱을 빠뜨린 답이에요. 빛은 가로와 세로 두 방향으로 함께 퍼지니 거리 4배면 면적이 4×4배가 돼요. 2배는 거꾸로 \"제곱해서 4가 되는 수\"를 구해 버린 것이고, 8배는 4×2로 어중간하게 섞은 계산이에요. 64배는 4를 세 번 곱한 값(4×4×4)인데, 빛이 퍼지는 건 평면(두 방향)이라 두 번만 곱해야 해요. <b>거리 몇 배 → 밝기는 그 제곱분의 1</b>, 이 한 줄이면 충분해요.",
    core: "거리 4배 → 밝기 1/16 · 가까운 쪽이 16배 밝다!",
  },
  {
    // [228] d2 · num(int) · 역산. 검산: 1/d² = 1/64 → d² = 64 → d = 8(제곱해서 64가 되는 양수).
    id: "g2u8e228",
    lessonId: "g2u8l2",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "배",
    prompt: "어떤 별까지의 거리가 몇 배로 멀어지면, 우리 눈에 보이는 밝기가 처음의 1/64로 줄어들까요? (단위: 배)",
    answer: "8",
    explain:
      "<span class='xh'>정답 풀이</span>① 밝기는 거리의 제곱에 반비례해요. 거리가 □배가 되면 밝기는 1/(□×□)이 되죠.<br>② 밝기가 1/64이 되려면 □×□ = 64여야 해요.<br>③ 제곱해서 64가 되는 수는 8이니, 거리가 <b>8배</b>로 멀어진 거예요.<span class='xh'>이런 실수를 조심해요</span>64를 2로 나눠 32배라고 답하거나, 64를 그대로 답하는 실수가 많아요. \"밝기 1/64\"에서 64는 거리 배수가 아니라 <b>거리 배수를 제곱한 값</b>이라는 게 핵심이에요. 거꾸로 가는 문제일수록 순서를 지켜요. 먼저 \"몇을 제곱하면 이 수가 되지?\"를 묻고, 그 답이 거리 배수예요. 확인 삼아 정방향으로 검산해 보면, 거리 8배 → 넓이 8×8 = 64배 → 밝기 1/64로 딱 맞아떨어지죠.",
    core: "밝기 1/64 → 거리는 제곱해서 64가 되는 8배!",
  },
  {
    // [231] d2 · 학생 발화 교정(천09 형식) · 제곱 누락 격파. 검산: 2배 → 1/4.
    id: "g2u8e231",
    lessonId: "g2u8l2",
    type: "mcq",
    diff: 2,
    prompt: "별을 좋아하는 친구가 이렇게 말했어요. <b>\"별까지의 거리가 2배가 되면, 밝기는 1/2이 되겠지?\"</b> 친구의 말을 바르게 고쳐 준 것은?",
    options: [
      "빛은 가로와 세로 두 방향으로 함께 퍼지니, 밝기는 1/4이 돼",
      "맞아, 거리에 비례해서 밝기도 1/2이 돼",
      "거리가 변해도 별의 밝기는 그대로야",
      "거리가 2배가 되면 밝기는 오히려 2배가 돼",
      "빛이 도중에 사라지기 때문에 1/8이 돼",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>친구는 거리와 밝기를 단순 반비례로 생각했어요. 하지만 별빛은 한 줄로 오는 게 아니라 <b>면으로 퍼지며</b> 와요. 거리 2배 지점에서는 같은 빛이 가로 2배, 세로 2배, 즉 2×2 = 4배 넓이를 덮으니 한 곳이 받는 빛은 <b>1/4</b>이 되죠.<span class='xh'>오답 하나씩 격파</span>\"1/2이 맞다\"는 제곱을 빠뜨린 원래 오답 그대로예요. \"밝기는 그대로\"는 밤하늘에서 같은 별이라도 가까울수록 밝게 보인다는 사실과 어긋나요. \"2배가 된다\"는 방향 자체가 반대고요. \"사라져서 1/8\"은 두 가지가 모두 틀렸어요. 빛알은 사라지지 않고(퍼질 뿐), 1/8은 2를 세 번 곱한 수라 평면으로 퍼지는 빛에는 맞지 않는 계산이에요.",
    core: "거리 2배 → 면적 4배 → 밝기 1/4(제곱을 잊지 말 것)!",
  },
  {
    // [234] d2 · FL 신작 데뷔 · 관계 채우기(천07 계보의 일반화판 · 수치 없음). ㉠ 제곱 비례 · ㉡ 제곱 반비례.
    id: "g2u8e234",
    lessonId: "g2u8l2",
    type: "mcq",
    diff: 2,
    prompt: "그림은 별까지의 거리와 밝기의 관계를 정리한 순서도예요. ㉠과 ㉡에 들어갈 말을 옳게 짝 지은 것은?",
    figure: starFlowFig(),
    options: [
      "㉠ 거리에 비례해 커진다 · ㉡ 거리에 반비례해 어두워진다",
      "㉠ 거리의 제곱에 비례해 커진다 · ㉡ 거리의 제곱에 반비례해 어두워진다",
      "㉠ 거리의 제곱에 비례해 커진다 · ㉡ 거리에 반비례해 어두워진다",
      "㉠ 변하지 않는다 · ㉡ 거리의 제곱에 반비례해 어두워진다",
      "㉠ 거리에 비례해 커진다 · ㉡ 변하지 않는다",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>별빛은 사방으로 퍼지며 나아가요. 거리가 2배, 3배가 되면 빛이 덮는 넓이는 가로·세로가 함께 늘어나 4배, 9배, 즉 <b>거리의 제곱에 비례(㉠)</b>해 커져요. 같은 양의 빛이 그만큼 넓게 나뉘니, 한 곳에서 보는 밝기는 <b>거리의 제곱에 반비례(㉡)</b>해 어두워지고요. 넓이와 밝기는 항상 역수 짝이라, ㉠이 제곱 비례면 ㉡은 자동으로 제곱 반비례예요.<span class='xh'>오답 하나씩 격파</span>㉠을 \"거리에 비례\"로 고르면 빛이 한 방향으로만 퍼진다고 본 셈이에요. 실제로는 면으로 퍼지죠. ㉠과 ㉡의 제곱이 짝짝이인 조합은 넓이와 밝기가 역수 관계라는 것과 모순돼요. \"변하지 않는다\"류는 멀수록 어두워지는 밤하늘의 관찰 사실 자체와 어긋난답니다.",
    core: "넓이는 거리 제곱에 비례 · 밝기는 거리 제곱에 반비례(역수 짝)!",
  },

  // ─── L3 별의 등급 · 🅟 5 ───
  {
    // [243] d2 · num(int) · MB 신작 데뷔(P 2등급 · Q 7등급 · 배수 미인쇄). 검산: 7−2 = 5등급 차 =
    // 100배(5등급 차는 정확히 100배로 약속 · 1등급 차 약 2.5배는 근사). aria에 100 없음 ✓
    id: "g2u8e243",
    lessonId: "g2u8l3",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "배",
    prompt: "그림은 겉보기 등급 눈금 위에 두 별 P와 Q의 위치를 나타낸 거예요. P는 Q보다 약 몇 배 밝게 보일까요? (단위: 배)",
    figure: starMagBandFig({ min: 0, max: 8, stars: [{ mag: 2, label: "P" }, { mag: 7, label: "Q" }] }),
    figureDark: true,
    answer: "100",
    explain:
      "<span class='xh'>정답 풀이</span>① 눈금을 읽으면 P는 2등급, Q는 7등급이에요.<br>② 두 별의 등급 차이는 7 − 2 = <b>5등급</b>이죠.<br>③ 등급이 5계단 차이 나면 밝기는 <b>약 100배</b> 차이 나기로 약속했어요. 숫자가 작은 P가 100배 밝게 보여요.<span class='xh'>이런 실수를 조심해요</span>등급 차이에 2.5를 곱해 12.5배라고 답하면 안 돼요. 등급은 더하기 사다리가 아니라 <b>곱하기 사다리</b>라, 한 계단(약 2.5배)을 다섯 번 곱해야 하고 그 결과가 약 100배예요. 등급 숫자가 큰 Q를 더 밝다고 읽는 것도 단골 실수예요. 등급은 성적표처럼 <b>숫자가 작을수록 밝은 별</b>이랍니다. 눈금 그림에서 위치를 읽고, 계단 수를 세고, 100배 약속을 적용하는 세 단계로 풀어요.",
    core: "5등급 차이 = 약 100배 · 등급 숫자가 작을수록 밝다!",
  },
  {
    // [244] d1 · num(int) · 겉=절 → 10 pc. 검산: 절대 등급의 정의(10 pc 가정)에서 곧바로.
    id: "g2u8e244",
    lessonId: "g2u8l3",
    type: "num",
    diff: 1,
    numKind: "int",
    unitLabel: "pc",
    prompt: "어떤 별은 겉보기 등급과 절대 등급이 서로 같아요. 이 별까지의 거리는 몇 pc일까요? (단위: pc)",
    answer: "10",
    explain:
      "<span class='xh'>정답 풀이</span>절대 등급은 별을 <b>10 pc 거리에 세워 놓았다고 가정</b>할 때의 등급이에요. 어떤 별의 겉보기 등급이 절대 등급과 같다는 건, 지금 보이는 모습이 10 pc에 세워 놓은 모습과 똑같다는 뜻이죠. 그러니 이 별은 실제로 <b>10 pc</b> 거리에 있는 거예요.<span class='xh'>이런 실수를 조심해요</span>이 성질은 거리 판정의 출발점이라 꼭 세트로 기억해요. 별이 10 pc보다 <b>가까이</b> 있으면 실제보다 밝게 보여 겉보기 등급 숫자가 절대 등급보다 작아지고, 10 pc보다 <b>멀리</b> 있으면 어둡게 보여 겉보기 등급 숫자가 절대 등급보다 커져요. 즉 두 등급을 비교하면 계산 없이도 별이 기준 거리(10 pc)의 안쪽인지 바깥쪽인지 판정할 수 있답니다. 1 pc이나 100 pc처럼 다른 기준을 떠올리지 않게, \"절대 등급의 출발선 = 10 pc\"을 정확히 새겨 두세요.",
    core: "겉보기 등급 = 절대 등급 ⇔ 그 별까지의 거리는 10 pc!",
  },
  {
    // [247] d2 · TBL A벌(신수치 · v1 2벌·교과서 표 회피). 검산: 겉보기 최소 = (나) −0.8(음수) →
    // 가장 밝게 보임. 절대 열은 이 문항의 채점과 무관(다른 벌과 정답 분리).
    id: "g2u8e247",
    lessonId: "g2u8l3",
    type: "mcq",
    diff: 2,
    prompt: "표는 세 별의 겉보기 등급과 절대 등급이에요. 밤하늘에서 맨눈으로 볼 때 <b>가장 밝게 보이는</b> 별은?",
    figure: svgTable(
      ["별", "겉보기 등급", "절대 등급"],
      [["(가)", "1.5", "0.5"], ["(나)", "−0.8", "2.0"], ["(다)", "2.5", "−3.5"]],
    ),
    options: ["(가)", "(나)", "(다)", "셋 다 똑같이 보인다", "표만으로는 알 수 없다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>\"맨눈으로 밝게 보인다\"는 <b>겉보기 등급</b>의 몫이에요. 겉보기 등급 열에서 가장 작은 숫자를 찾으면 (나)의 −0.8이죠. 음수는 0보다 작으니 1.5나 2.5보다 훨씬 밝은 성적이에요. 그래서 가장 밝게 보이는 별은 <b>(나)</b>예요.<span class='xh'>오답 하나씩 격파</span>(다)를 고르는 건 절대 등급 −3.5를 읽은 결과예요. (다)는 <b>실제로는</b> 셋 중 가장 강한 별이지만, 겉보기 등급이 2.5라 눈에는 가장 어둡게 보여요. 실력과 보이는 성적은 다르답니다. (가)의 1.5는 −0.8보다 큰 숫자라 (나)보다 어둡게 보이고요. 음수가 섞이면 크기 비교부터 조심하세요. \"셋 다 같다\"거나 \"알 수 없다\"는 표의 정보로 충분히 판정되는 문제라 틀린 보기예요. 질문에 \"보이는\"이 나오면 겉보기 열, \"실제\"가 나오면 절대 열을 읽어요.",
    core: "\"밝게 보인다\" = 겉보기 등급 최소 찾기(음수 비교 주의)!",
  },
  {
    // [249] d3 · TBL C벌 · 10 pc보다 가까운 별 = 겉<절. 검산: (가) 3.0>1.0 멂 · (나) 0.0<4.0 가까움 ✓ ·
    // (다) 1.0=1.0 정확히 10 pc(가깝지 않음). 미끼 조합 "(나), (다)".
    id: "g2u8e249",
    lessonId: "g2u8l3",
    type: "mcq",
    diff: 3,
    prompt: "표는 세 별의 겉보기 등급과 절대 등급이에요. 지구에서 10 pc보다 <b>가까이</b> 있는 별은?",
    figure: svgTable(
      ["별", "겉보기 등급", "절대 등급"],
      [["(가)", "3.0", "1.0"], ["(나)", "0.0", "4.0"], ["(다)", "1.0", "1.0"]],
    ),
    options: ["(가)", "(나)", "(다)", "(나), (다)", "(가), (다)"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>10 pc보다 가까운 별은 기준 거리보다 별을 당겨 놓은 셈이라 실제보다 밝게 보여요. 그래서 <b>겉보기 등급 숫자가 절대 등급보다 작아지죠</b>. 세 별을 확인하면 (가)는 3.0 > 1.0이라 기준보다 멀리 있고, (나)는 0.0 < 4.0이라 <b>10 pc보다 가까이</b> 있어요. (다)는 두 등급이 1.0으로 같으니 정확히 10 pc 거리에 있는 별이에요.<span class='xh'>오답 하나씩 격파</span>\"(나), (다)\"를 고르면 (다)를 가까운 별로 잘못 넣은 거예요. 두 등급이 같다는 건 기준 거리보다 안쪽이 아니라 <b>딱 기준선 위</b>라는 뜻이죠. (가)는 겉보기가 더 큰(어둡게 보이는) 별이라 10 pc 바깥이에요. 부호 규칙 한 줄로 정리하면, <b>겉보기 − 절대가 음수면 가깝고, 0이면 10 pc, 양수면 멀다</b>랍니다.",
    core: "겉보기 < 절대 = 10 pc보다 가까운 별(같으면 딱 10 pc)!",
  },
  {
    // [257] d3 · 절대 등급 환산 추론(비07 계승 · 수치 교체 100 pc·겉 6). 검산: 100 pc → 10 pc =
    // 거리 1/10 → 밝기 100배↑ = 5등급 작아짐 → 6 − 5 = 1등급. 보기 크기순 shuffle:false · 정답 3번째.
    id: "g2u8e257",
    lessonId: "g2u8l3",
    type: "mcq",
    diff: 3,
    prompt: "지구에서 100 pc 떨어져 있는 어떤 별의 겉보기 등급이 6등급이에요. 이 별의 절대 등급은 몇 등급일까요?",
    options: ["−4등급", "0.6등급", "1등급", "6등급", "11등급"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>① 절대 등급은 별을 10 pc에 세웠다고 가정한 등급이에요. 이 별을 100 pc에서 10 pc로 당기면 거리가 1/10이 되죠.<br>② 밝기는 거리 제곱에 반비례하니 10×10 = <b>100배 밝아져요</b>.<br>③ 100배 밝아지는 건 등급으로 <b>5등급 작아지는 것</b>이에요. 6 − 5 = <b>1등급</b>이 절대 등급이죠.<span class='xh'>오답 하나씩 격파</span>11등급은 5를 더한 값인데, 별을 기준보다 멀리 보내는 방향으로 착각한 거예요. 지금 이 별은 기준(10 pc)보다 멀리 있으니 당겨 오면 밝아져야(등급이 작아져야) 해요. 6등급 그대로는 거리 차이를 무시한 답, 0.6등급은 등급을 10으로 나눈 엉뚱한 계산, −4등급은 10등급을 빼 버린 과잉 계산이에요. \"거리 10배 차이 = 밝기 100배 = 5등급 차이\" 세 단계를 순서대로 밟으면 흔들리지 않아요.",
    core: "100 pc → 10 pc = 100배 밝아짐 = 5등급 작아짐!",
  },

  // ─── L4 별의 색과 표면 온도 · 🅟 5 ───
  {
    // [261] d1 · P star-colors(v1 재사용 · 질문 각도 = 온도 판정+근거 짝). 검산: 청백 > 주황(색 사다리).
    id: "g2u8e261",
    lessonId: "g2u8l4",
    type: "mcq",
    diff: 1,
    prompt: "사진은 밤하늘에서 찍은 두 별이에요. 표면 온도가 더 높은 별과 그렇게 판단한 근거를 옳게 짝 지은 것은?",
    figure: ximg("star-colors.webp", "어두운 밤하늘 별밭 · 왼쪽 위와 오른쪽 아래에 밝은 별이 하나씩 보인다"),
    options: [
      "왼쪽 위의 별 · 청백색으로 빛나고 있어서",
      "오른쪽 아래의 별 · 주황빛으로 빛나고 있어서",
      "왼쪽 위의 별 · 더 크게 보여서",
      "오른쪽 아래의 별 · 더 밝게 보여서",
      "두 별의 색이 달라도 표면 온도는 비교할 수 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>별의 색은 표면 온도를 알려 주는 온도계예요. 온도가 높을수록 파란 쪽 빛을 많이 내서 <b>청백색·청색</b>으로, 낮을수록 붉은 쪽 빛을 많이 내서 <b>주황색·적색</b>으로 보이죠. 사진에서 왼쪽 위의 별은 청백색, 오른쪽 아래의 별은 주황빛이니 표면 온도는 <b>왼쪽 위의 별</b>이 더 높아요.<span class='xh'>오답 하나씩 격파</span>주황빛이라서 뜨겁다는 건 불꽃 이미지에 낚인 답이에요. 별의 세계에서는 <b>파란 쪽이 뜨겁고 붉은 쪽이 차가워요</b>. \"더 크게 보여서\"나 \"더 밝게 보여서\"는 온도의 근거가 될 수 없어요. 크기와 밝기는 거리나 별의 실제 실력이 섞인 값이라, 온도를 말해 주는 채널은 오직 <b>색</b>이랍니다. 색으로 비교할 수 없다는 보기는 색과 온도의 관계 자체를 부정한 것이라 틀렸어요.",
    core: "색이 온도계 · 청백은 고온, 주황·적색은 저온!",
  },
  {
    // [264] d2 · CT 신조합(㉮황 · ㉯청백 · ㉰주황 · v1 ㉠적/㉡백/㉢청과 조합·기호 분리). 검산:
    // 온도 내림차순 = 청백(㉯) > 황(㉮) > 주황(㉰). 나열 보기 shuffle:false · 정답 3번째.
    id: "g2u8e264",
    lessonId: "g2u8l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 색이 서로 다른 세 별이에요. 표면 온도가 <b>높은 별부터</b> 순서대로 나열한 것은?",
    figure: colorTempTrioFig({
      stars: [
        { label: "㉮", name: "황색", hex: "#FFE9A8" },
        { label: "㉯", name: "청백색", hex: "#BFD8FF" },
        { label: "㉰", name: "주황색", hex: "#FFC08A" },
      ],
    }),
    figureDark: true,
    options: ["㉮ → ㉯ → ㉰", "㉮ → ㉰ → ㉯", "㉯ → ㉮ → ㉰", "㉯ → ㉰ → ㉮", "㉰ → ㉮ → ㉯"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>별의 색을 온도가 낮은 쪽부터 늘어놓으면 적색 → 주황색 → 황색 → 황백색 → 백색 → 청백색 → 청색이에요. 세 별을 이 사다리에 놓으면 청백색 ㉯가 가장 높은 칸, 황색 ㉮가 중간, 주황색 ㉰가 가장 낮은 칸이죠. 그래서 온도가 높은 순서는 <b>㉯ → ㉮ → ㉰</b>예요.<span class='xh'>오답 하나씩 격파</span>㉰(주황)를 앞세운 나열은 \"붉은 계열이 뜨겁다\"는 불꽃 이미지의 함정이에요. 별은 반대로 <b>파란 쪽이 뜨거워요</b>. ㉮(황색)를 맨 앞에 둔 나열은 색 사다리에서 황색이 청백색보다 아래 칸이라는 걸 놓친 거예요. ㉯ → ㉰ → ㉮처럼 뒤쪽 두 별이 뒤집힌 나열도 주황이 황색보다 낮은 온도라는 순서를 확인하면 걸러낼 수 있어요. 색 사다리 일곱 칸을 통째로 외워 두면 어떤 조합이 나와도 흔들리지 않아요.",
    core: "온도 순서 = 청색 쪽이 위, 적색 쪽이 아래(청백 > 황 > 주황)!",
  },
  {
    // [269] d2 · MS bogi(1벌: A 청색 4등급 · B 황색 1등급 · C 적색 2등급). 검산: 온도 최고 = 청색 A(ㄱ 참) ·
    // 가장 밝게 보임 = 등급 최소 1 = B(ㄴ 참) · C(적)가 B(황)보다 온도 높다(거짓 · 적 < 황) → "ㄱ, ㄴ".
    id: "g2u8e269",
    lessonId: "g2u8l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 별 A~C의 색과 겉보기 등급을 나타낸 산점도예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: msFigV2({
      pts: [
        { label: "A", col: 0, mag: 4 },
        { label: "B", col: 4, mag: 1 },
        { label: "C", col: 6, mag: 2 },
      ],
    }),
    figureDark: true,
    bogi: [
      "표면 온도가 가장 높은 별은 A다.",
      "맨눈으로 볼 때 가장 밝게 보이는 별은 B다.",
      "C는 B보다 표면 온도가 높다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ은 옳아요. 가로축에서 A는 청색 칸에 있어요. 청색은 색 사다리의 가장 뜨거운 칸이라 세 별 중 표면 온도 1위죠. ㄴ도 옳아요. 세로축의 겉보기 등급은 <b>숫자가 작을수록 밝게 보이는</b> 값이에요. B가 1등급으로 가장 작으니 맨눈에는 B가 가장 밝아요. ㄷ이 함정이에요. C는 적색, B는 황색인데 색 사다리에서 적색이 황색보다 <b>아래 칸(저온)</b>이라 C의 표면 온도가 더 낮아요.<span class='xh'>함정 포인트</span>이 그래프의 핵심은 두 축이 <b>서로 다른 정보</b>라는 거예요. 가로축(색)은 온도만, 세로축(등급)은 보이는 밝기만 말해 줘요. \"뜨거운 별이 항상 밝게 보인다\"처럼 두 축을 섞으면 바로 함정에 빠진답니다.",
    core: "색 축은 온도 · 등급 축은 밝기 · 두 정보를 섞지 말 것!",
  },
  {
    // [277] d1 · TBL 색 표(익명 3별 · 비03 형식 계승 · 실명·색 세트 교체). 검산: 청 > 백 > 적 →
    // (다) → (가) → (나). 나열 보기 shuffle:false · 정답 4번째.
    id: "g2u8e277",
    lessonId: "g2u8l4",
    type: "mcq",
    diff: 1,
    prompt: "표는 세 별의 색을 나타낸 거예요. 표면 온도가 <b>높은 것부터</b> 순서대로 나열한 것은?",
    figure: svgTable(["별", "색"], [["(가)", "백색"], ["(나)", "적색"], ["(다)", "청색"]]),
    options: [
      "(가) → (나) → (다)",
      "(가) → (다) → (나)",
      "(나) → (가) → (다)",
      "(다) → (가) → (나)",
      "(다) → (나) → (가)",
    ],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>색 사다리를 온도가 높은 쪽부터 읽으면 청색 → 청백색 → 백색 → 황백색 → 황색 → 주황색 → 적색이에요. 표의 세 별을 여기에 놓으면 청색 (다)가 가장 뜨겁고, 백색 (가)가 중간, 적색 (나)가 가장 차갑죠. 그래서 <b>(다) → (가) → (나)</b> 순서예요.<span class='xh'>오답 하나씩 격파</span>(나)를 앞세운 나열은 붉은 별을 가장 뜨겁다고 본 불꽃 이미지 함정이에요. 별의 붉은색은 온도 사다리의 <b>맨 아래 칸</b>이랍니다(그래도 표면이 약 3,000℃지만, 별 중에서는 낮은 편이죠). (다) → (나) → (가)는 첫 자리는 맞았지만 백색과 적색의 순서가 뒤집혔어요. 백색은 중간보다 높은 온도의 색이에요. 표로 주어진 색을 사다리 위 위치로 바꿔 읽는 연습, 이 유형의 전부예요.",
    core: "청색이 최고온 · 백색은 중상위 · 적색이 최저온!",
  },
  {
    // [278] d2 · P albireo(신규 수급 · CC BY 4.0 눈검수 통과) · 한 시야 색 대비. 검산: 왼쪽 청백 · 오른쪽
    // 주황(크롭 확인) → 왼쪽 온도 높음. alt는 색 미낭독(관찰이 과제) · 보기도 색을 말하지 않고 판단만.
    id: "g2u8e278",
    lessonId: "g2u8l4",
    type: "mcq",
    diff: 2,
    prompt: "사진은 망원경으로 한 시야에 잡힌 두 별이에요. 두 별의 <b>색을 관찰</b>해 옳게 판단한 것은?",
    figure: pimg("albireo.webp", "검은 하늘에 나란히 놓인 밝은 두 별"),
    options: [
      "왼쪽 별이 오른쪽 별보다 표면 온도가 높다",
      "오른쪽 별이 왼쪽 별보다 표면 온도가 높다",
      "두 별의 표면 온도는 같다",
      "더 밝게 보이는 별이 반드시 표면 온도도 높다",
      "사진의 색만으로는 표면 온도를 비교할 수 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진을 관찰하면 왼쪽 별은 <b>청백색</b>, 오른쪽 별은 <b>주황색</b>으로 빛나고 있어요. 별의 색은 표면 온도의 온도계라, 파란 쪽으로 갈수록 뜨겁고 붉은 쪽으로 갈수록 차갑죠. 그래서 청백색인 <b>왼쪽 별의 표면 온도가 더 높아요</b>. 실제 밤하늘에도 이렇게 색이 다른 두 별이 나란히 보이는 곳이 있어서, 망원경으로 색과 온도의 관계를 한눈에 확인할 수 있답니다.<span class='xh'>오답 하나씩 격파</span>오른쪽(주황) 별을 고르는 건 붉은 계열을 뜨겁다고 본 함정이에요. 색이 다른데 온도가 같을 수는 없어요. \"밝게 보이는 별이 반드시 뜨겁다\"는 밝기와 온도를 섞은 오답이에요. 밝기에는 거리와 실제 실력이 섞여 있어서 온도의 근거가 못 되죠. 색은 온도를 알려 주는 확실한 채널이니 \"비교할 수 없다\"도 틀렸어요.",
    core: "한 시야의 두 별도 색으로 온도 비교 · 청백 쪽이 고온!",
  },

  // ─── L5 우리은하 · 🅟 5 ───
  {
    // [281] d1 · GQ(㉠ 중심부 · ㉡ 원반 위 · ㉢ 원반 바깥) · 태양계 위치 = ㉡. v1 각도 대조는 이식 때
    // 확인(구 풀 폐기라 소재 자유 · 레슨 퀴즈 5지 문구와는 형식 분리). 라벨 보기 shuffle:false.
    id: "g2u8e281",
    lessonId: "g2u8l5",
    type: "mcq",
    diff: 1,
    prompt: "그림은 옆에서 본 우리은하예요. 태양계가 있는 위치로 옳은 것은?",
    figure: starGalaxyQuizFig(),
    figureDark: true,
    options: ["㉠", "㉡", "㉢", "우리은하 밖", "㉠, ㉡, ㉢ 어디에나 있다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>태양계는 우리은하의 중심이 아니라 <b>원반 위, 중심에서 멀리 떨어진 변두리</b>에 있어요. 그림에서 중심의 불룩한 부분이 ㉠, 원반 위 한 점이 ㉡, 원반 바깥 공간이 ㉢이니 태양계의 자리는 <b>㉡</b>이죠.<span class='xh'>오답 하나씩 격파</span>㉠(중심부)을 고르는 건 \"우리가 우주의 중심\"이라는 자연스러운 착각이에요. 실제 태양계는 중심에서 약 3만 광년 떨어진 나선팔 위에 있어요. ㉢은 원반을 벗어난 바깥 공간이라 별이 드문 곳이에요. 태양계는 별이 모여 있는 원반 안에 살고 있죠. \"우리은하 밖\"은 정의부터 틀렸어요. 우리은하는 <b>태양계가 속한</b> 은하니까요. \"어디에나 있다\"는 위치가 하나로 정해져 있다는 사실과 어긋나요. 은하수가 하늘에서 띠로 보이는 것도 우리가 원반 안 변두리에서 안쪽을 바라보기 때문이랍니다.",
    core: "태양계 = 중심(㉠)이 아니라 원반 위 변두리(㉡)!",
  },
  {
    // [284] d2 · TM 신작 데뷔(실사 위 A 중심 · B 중간 · C 가장자리) · 천08(1) 계보. 검산: 중심~태양
    // 약 3만 광년 = 반지름(약 5만 광년)의 절반 남짓 → 중간 지점 B.
    id: "g2u8e284",
    lessonId: "g2u8l5",
    type: "mcq",
    diff: 2,
    prompt: "그림은 위에서 내려다본 우리은하 위에 세 지점 A~C를 표시한 거예요. 태양계의 위치로 가장 알맞은 곳은?",
    figure: starTopMarksFig(),
    figureDark: true,
    options: ["A", "B", "C", "A와 C 사이 어디든 상관없다", "이 그림에 태양계 자리는 없다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>태양계는 은하 중심에서 약 3만 광년 떨어진 나선팔 위에 있어요. 우리은하의 지름이 약 10만 광년이니 반지름은 약 5만 광년이고, 3만 광년은 그 절반을 조금 넘는 위치죠. 그래서 정중앙(A)도, 원반의 맨 가장자리(C)도 아닌 <b>중간 지점 B</b>가 태양계의 자리예요.<span class='xh'>오답 하나씩 격파</span>A(중심)는 별이 가장 빽빽하게 모인 막대 중심부라 태양계의 자리가 아니에요. C는 원반이 거의 끝나는 바깥 가장자리인데, 태양계는 그렇게 끝자락까지 밀려나 있지는 않아요. \"어디든 상관없다\"는 위치가 정해져 있다는 사실과 어긋나고, \"태양계 자리는 없다\"는 태양계가 우리은하의 구성원이라는 정의 자체에 어긋나요. 숫자 짝을 세트로 기억하세요. <b>지름 약 10만 광년, 중심에서 태양계까지 약 3만 광년</b>이에요.",
    core: "태양계 = 중심과 가장자리 사이(중심에서 약 3만 광년)!",
  },
  {
    // [287] d2 · P milkyway-pan · 파노라마 중앙이 밝고 두꺼운 까닭 = 중심 방향. v1과 각도 대조(구 풀
    // 폐기 · 레슨은 훅 실사만). 재사용2(e288 확대분)와 정답 축 분리 예정.
    id: "g2u8e287",
    lessonId: "g2u8l5",
    type: "mcq",
    diff: 2,
    prompt: "사진은 우리은하 안에서 하늘을 한 바퀴 담은 은하수 파노라마예요. 가운데 부분이 유난히 밝고 두껍게 보이는 까닭은?",
    figure: pimg("milkyway-pan.webp", "하늘을 가로지르는 뿌연 별의 띠 · 가운데 부분이 가장 밝고 두껍다"),
    options: [
      "별이 가장 많이 모여 있는 우리은하 중심 방향을 바라본 부분이라서",
      "그 방향에 태양이 있어서",
      "지구에서 가장 가까운 별들이 그 방향에 모여 있어서",
      "그 부분에만 구름이 껴 있어서",
      "카메라 불빛이 반사되어서",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>은하수는 원반 모양 우리은하의 <b>안</b>에서 원반 방향을 둘러본 모습이에요. 그중에서도 <b>은하 중심 방향</b>을 바라보면 두껍고 별이 가장 많이 쌓인 부분을 보게 되니, 그쪽 은하수가 가장 밝고 두껍게 보여요. 사진의 가운데가 바로 그 방향이죠.<span class='xh'>오답 하나씩 격파</span>태양은 우리은하의 한 구성원일 뿐이고, 은하수의 밝기를 만드는 건 수많은 별이 겹겹이 쌓인 두께예요. \"가까운 별이 모여서\"는 원인을 거꾸로 본 거예요. 밝은 띠는 가까운 몇몇 별이 아니라 <b>멀리까지 겹겹이 이어진 수많은 별</b>의 빛이 합쳐진 결과랍니다. 구름이나 카메라 불빛은 천체 사진의 원리와 무관한 보기고요. \"은하수의 가장 밝은 부분 = 중심 방향\"은 우리가 은하 안 변두리에 산다는 증거이기도 해요.",
    core: "은하수가 가장 밝은 쪽 = 별이 가장 많은 은하 중심 방향!",
  },
  {
    // [290] d3 · GQ bogi 종합. 검산: ㉠ 중심부 = 별 최밀집(ㄱ 참) · 태양계는 ㉡(ㄴ 거짓) · 옆 모습 =
    // 가운데 불룩한 원반(ㄷ 참) → "ㄱ, ㄷ".
    id: "g2u8e290",
    lessonId: "g2u8l5",
    type: "mcq",
    diff: 3,
    prompt: "그림은 옆에서 본 우리은하예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: starGalaxyQuizFig(),
    figureDark: true,
    bogi: [
      "㉠은 우리은하에서 별이 가장 빽빽하게 모여 있는 부분이다.",
      "태양계는 ㉠에 있다.",
      "옆에서 본 우리은하는 가운데가 불룩한 원반 모양이다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ은 옳아요. ㉠은 은하 중심부인데, 이곳은 별이 가장 빽빽하게 모여 있어 옆에서 보면 불룩하게 부풀어 보여요. ㄴ이 함정이에요. 태양계는 중심(㉠)이 아니라 <b>원반 위의 ㉡</b>, 중심에서 약 3만 광년 떨어진 변두리에 있어요. ㄷ은 옳아요. 위에서 보면 막대와 나선팔이 보이지만, 옆에서 보면 <b>가운데가 불룩한 납작한 원반</b>이죠. 접시를 옆에서 보면 납작한 선으로 보이는 것과 같은 원리예요.<span class='xh'>함정 포인트</span>중심부가 불룩한 이유(별 밀집)와 태양계의 위치(변두리)를 한 문제에 엮는 게 이 유형의 단골이에요. \"불룩한 곳 = 중요한 곳 = 우리 자리\"라는 연상이 함정이니, 태양계는 언제나 <b>변두리 주민</b>임을 기억하세요.",
    core: "중심부(㉠) = 별 최밀집 · 태양계는 원반 위 ㉡ · 옆 모습 = 불룩한 원반!",
  },
  {
    // [296] d2 · TBL 수치 조건 표(지름 10만 · 중심~태양 3만 · 조건 제시·판독, 직접 회상 아님).
    // 검산: 반지름 5만 · 중심에서 3만 → 가장자리까지 2만 < 3만 → 가장자리에 더 가깝다.
    id: "g2u8e296",
    lessonId: "g2u8l5",
    type: "mcq",
    diff: 2,
    prompt: "표는 우리은하의 크기에 대한 자료예요. 표를 보고 옳게 해석한 것은?",
    figure: svgTable(
      ["구간", "거리"],
      [["우리은하의 지름", "약 10만 광년"], ["은하 중심에서 태양계까지", "약 3만 광년"]],
    ),
    options: [
      "태양계는 은하 중심보다 은하 가장자리에 더 가깝다",
      "태양계는 우리은하의 정중앙에 있다",
      "우리은하의 지름은 약 3만 광년이다",
      "은하 중심에서 태양계까지는 약 10만 광년이다",
      "태양계는 우리은하 밖에 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>지름이 약 10만 광년이니 중심에서 원반 가장자리까지(반지름)는 약 5만 광년이에요. 태양계는 중심에서 약 3만 광년 지점에 있으니, 가장자리까지 남은 거리는 약 2만 광년이죠. 3만 광년(중심 쪽)보다 2만 광년(가장자리 쪽)이 짧으니 태양계는 <b>가장자리에 더 가까운 변두리</b>에 있어요.<span class='xh'>오답 하나씩 격파</span>\"정중앙\"은 중심에서 3만 광년이나 떨어져 있다는 표의 내용과 바로 모순돼요. \"지름이 약 3만 광년\"과 \"중심에서 태양계까지 약 10만 광년\"은 표의 두 값을 서로 <b>맞바꾼</b> 함정이에요. 어느 값이 은하 전체 크기이고 어느 값이 우리 집 주소인지 짝을 정확히 붙여 두세요. \"우리은하 밖\"은 태양계가 우리은하의 구성원이라는 정의와 어긋나요.",
    core: "반지름 5만 · 중심에서 3만 → 태양계는 가장자리 쪽 변두리!",
  },

  // ─── L6 성단과 성운 · 🅟 5 ───
  {
    // [300] d2 · P pleiades · 색 관찰 → 나이·온도 추론(천11 계보 · 레슨 "이 사진의 천체는?"과 각도 분리).
    // 검산: 파랑 = 고온 = 젊음 = 산개(허술 관찰로 ①vs③ 구분).
    id: "g2u8e300",
    lessonId: "g2u8l6",
    type: "mcq",
    diff: 2,
    prompt: "사진의 별 무리는 파란색 별들이 듬성듬성 모여 있어요. 이 별 무리에 대한 설명으로 옳은 것은?",
    figure: pimg("pleiades.webp", "파란 별 여러 개가 듬성듬성 모여 있는 별 무리 사진"),
    figureDark: true,
    options: [
      "표면 온도가 높은 젊은 별들이 모인 산개 성단이다",
      "표면 온도가 낮은 늙은 별들이 모인 산개 성단이다",
      "수십만 개의 별이 공 모양으로 빽빽하게 모인 구상 성단이다",
      "가스와 티끌이 구름처럼 모인 성운이다",
      "우리은하 밖에 있는 외부 은하다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진에서 별들이 <b>허술하게 흩어져</b> 있으니 산개 성단이에요. 그리고 별들의 색이 <b>파란색</b>이죠. 파란색은 표면 온도가 높다는 뜻이고, 산개 성단의 파란 별들은 태어난 지 오래되지 않은 <b>젊은 별</b>이에요. 색과 온도의 규칙이 성단의 나이까지 알려 주는 셈이죠.<span class='xh'>오답 하나씩 격파</span>\"낮은 온도의 늙은 별\"은 색 관찰과 어긋나요. 파란색은 온도 사다리의 높은 칸이니까요. 붉고 늙은 별 위주인 쪽은 구상 성단이에요. \"공 모양으로 빽빽\"은 사진과 달라요. 이 무리는 중심으로 뭉치지 않고 듬성듬성하죠. 성운은 별 무리가 아니라 <b>가스와 티끌의 구름</b>이라 뿌옇게 번져 보이고, 외부 은하는 우리은하 밖의 별 도시라 이렇게 낱낱의 별로 흩어져 보이지 않아요.",
    core: "허술한 무리 + 파란 별 = 젊고 뜨거운 산개 성단!",
  },
  {
    // [305] d2 · spair(pleiades (가) · m5 (나)) bogi 비교. 검산: (가) 산개 = 허술(ㄱ 거짓) · 별 수는
    // 구상(나)이 많음(ㄴ 참) · (가) 파랑 = 고온 vs (나) 붉음 = 저온(ㄷ 참) → "ㄴ, ㄷ".
    id: "g2u8e305",
    lessonId: "g2u8l6",
    type: "mcq",
    diff: 2,
    prompt: "사진 (가)와 (나)는 서로 다른 두 별 무리예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: spair(
      "pleiades.webp", "파란 별들이 듬성듬성 모인 별 무리",
      "m5-globular.webp", "수많은 별이 중심으로 갈수록 빽빽해지는 공 모양 별 무리",
    ),
    figureDark: true,
    bogi: [
      "(가)는 별들이 공 모양으로 빽빽하게 모여 있다.",
      "무리를 이룬 별의 수는 (나)가 (가)보다 많다.",
      "(가)의 별들은 (나)의 별들보다 대체로 표면 온도가 높다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ이 함정이에요. 공 모양으로 빽빽한 쪽은 (나)예요. (가)는 별들이 허술하게 흩어진 <b>산개 성단</b>이고, (나)는 수만~수십만 개의 별이 공처럼 뭉친 <b>구상 성단</b>이죠. ㄴ은 옳아요. 산개 성단은 수십~수만 개, 구상 성단은 수만~수십만 개 수준이라 별의 수는 (나)의 압승이에요. 사진에서도 (나)의 별이 셀 수 없이 많죠. ㄷ도 옳아요. (가)의 별들은 파란색(고온), (나)의 별들은 대체로 붉은색(저온)이니 표면 온도는 (가) 쪽이 높아요.<span class='xh'>함정 포인트</span>비교 세트로 묶어 두세요. <b>산개 = 허술·파랑·젊음 / 구상 = 공 모양·빽빽·붉음·늙음·별 수 많음</b>. 속성 하나만 슬쩍 바꿔 내는 문제가 단골이에요.",
    core: "산개 = 허술·파랑 · 구상 = 빽빽한 공·붉음·별 수 최다!",
  },
  {
    // [309] d2 · P m78 · 반사 성운이 파란 까닭. 검산: 반사 성운 = 근처 별빛을 티끌이 반사(주로 파랑).
    id: "g2u8e309",
    lessonId: "g2u8l6",
    type: "mcq",
    diff: 2,
    prompt: "사진의 천체는 푸르스름한 빛으로 뿌옇게 번져 보여요. 이 천체가 이렇게 빛나 보이는 까닭은?",
    figure: pimg("m78-reflection.webp", "푸르스름한 빛으로 뿌옇게 번져 보이는 천체 사진"),
    figureDark: true,
    options: [
      "근처 별의 빛을 가스와 티끌이 거울처럼 반사하기 때문에",
      "가스와 티끌이 스스로 빛을 만들어 내기 때문에",
      "뒤에서 오는 별빛을 막아서기 때문에",
      "표면 온도가 매우 낮아서 파랗게 보이기 때문에",
      "파란색 별 수십만 개가 공 모양으로 뭉쳐 있기 때문에",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>이 천체는 <b>반사 성운</b>이에요. 성운을 이루는 가스와 티끌이 근처 별의 빛을 반사해 주로 <b>파르스름하게</b> 보이죠. 스스로 빛나는 게 아니라 별빛을 되비추는 것이라, 거울 같은 구름이라고 생각하면 돼요.<span class='xh'>오답 하나씩 격파</span>\"스스로 빛을 만든다\"는 방출 성운의 방식이에요. 방출 성운은 뜨거운 별 곁에서 에너지를 받아 스스로 붉게 빛나죠. \"뒤의 빛을 막는다\"는 암흑 성운의 방식이라 검은 실루엣으로 보였을 거예요. \"온도가 낮아 파랗다\"는 색 규칙을 뒤집은 오답이에요. 파란색이 저온의 색이 아닐뿐더러, 성운의 색은 별처럼 표면 온도로 정해지는 게 아니라 <b>빛과의 관계</b>로 정해져요. \"파란 별 수십만 개\"는 구상 성단의 묘사인데, 성운은 별 무리가 아니라 가스와 티끌의 구름이랍니다.",
    core: "반사 성운 = 근처 별빛을 되비추는 구름(주로 파르스름)!",
  },
  {
    // [313] d2 · CM(㉮ 원반 · ㉯ 중심부·바깥) · 분포 → 종류. 검산: 산개 성단 = 나선팔(원반) 분포.
    // 그림 하단 캡션이 위치를 서술하고, 종류 짝 판정은 학생 지식(유출 아님).
    id: "g2u8e313",
    lessonId: "g2u8l6",
    type: "mcq",
    diff: 2,
    prompt: "그림은 옆에서 본 우리은하에서 두 별 무리 ㉮와 ㉯의 분포를 나타낸 거예요. ㉮ 자리(원반의 나선팔)를 따라 주로 흩어져 있는 별 무리는?",
    figure: starClusterMapFig(),
    figureDark: true,
    options: ["산개 성단", "구상 성단", "방출 성운", "암흑 성운", "외부 은하"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>별 무리의 분포에는 규칙이 있어요. <b>산개 성단은 주로 원반(나선팔)</b>을 따라 흩어져 있고, <b>구상 성단은 은하 중심부 주위와 원반을 감싸는 바깥 공간(헤일로)</b>에 구형으로 퍼져 있죠. ㉮는 원반을 따라 놓인 점들이니 산개 성단의 분포예요.<span class='xh'>오답 하나씩 격파</span>구상 성단은 ㉯의 분포(중심부 주위와 원반 바깥)에 해당해요. 방출 성운과 암흑 성운은 성단이 아니라 가스와 티끌의 구름이라 \"별 무리\"라는 문제의 조건에서 벗어나요. 외부 은하는 우리은하 안의 구성원이 아니라 은하 밖의 다른 은하고요. 분포와 정체를 짝으로 기억하세요. <b>나선팔 = 젊은 산개 성단의 동네, 중심부·헤일로 = 늙은 구상 성단의 동네</b>예요. 산개 성단이 젊다는 사실과 나선팔이 새 별이 태어나는 곳이라는 사실이 자연스럽게 이어진답니다.",
    core: "산개 성단 = 원반(나선팔) · 구상 성단 = 중심부·원반 바깥!",
  },
  {
    // [319] d2 · TBL 관찰 기록 상자(미12 계보 · 문두에 "별 무리" 세트 명시 · 기록 3줄로 후보 유일).
    // 검산: 공 모양 + 중심 빽빽 + 붉은색 = 구상 성단 유일(산개는 허술·파랑이라 배제).
    id: "g2u8e319",
    lessonId: "g2u8l6",
    type: "mcq",
    diff: 2,
    prompt: "다음은 어떤 <b>별 무리</b>를 관찰한 기록이에요. 이 기록에 해당하는 천체는?",
    figure: svgTable(
      ["관찰 항목", "기록"],
      [["모양", "공처럼 둥글게 뭉침"], ["별의 분포", "중심으로 갈수록 빽빽함"], ["별의 색", "대체로 붉은색"]],
      { firstColHead: true },
    ),
    options: ["구상 성단", "산개 성단", "방출 성운", "암흑 성운", "은하수"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>기록을 하나씩 대조해요. 공처럼 둥글게 뭉친 모양, 중심으로 갈수록 빽빽한 분포, 대체로 붉은 별. 세 가지가 모두 가리키는 건 <b>구상 성단</b>이에요. 수만~수십만 개의 늙고 붉은 별이 공 모양으로 뭉친 무리죠.<span class='xh'>오답 하나씩 격파</span>산개 성단이라면 기록이 반대로 나왔을 거예요. 허술하게 흩어진 모양에, 파란 별 위주라고요. 방출 성운과 암흑 성운은 애초에 별 무리가 아니라 가스와 티끌의 구름이라, \"별들이 모여 있다\"는 관찰 자체가 성립하지 않아요. 은하수는 특정 별 무리가 아니라 <b>우리은하를 안에서 본 모습</b> 전체를 가리키는 이름이고요. 관찰 기록형 문제는 기록 한 줄 한 줄을 후보의 성질과 대조해 <b>모두 만족하는 하나</b>를 찾는 게 정석이에요.",
    core: "공 모양 + 중심 빽빽 + 붉음 → 구상 성단!",
  },

  // ─── L7 팽창하는 우주 · 🅟 5 ───
  {
    // [323] d2 · P andromeda · 외부 은하 판정 근거(비10(1) 폐쇄형 변환). 검산: 거리 > 우리은하 크기 →
    // 우리은하 안에 있을 수 없음.
    id: "g2u8e323",
    lessonId: "g2u8l7",
    type: "mcq",
    diff: 2,
    prompt: "사진의 천체는 오랫동안 우리은하 안의 구름(성운)으로 여겨졌지만, 지금은 우리은하 <b>밖</b>의 외부 은하로 분류돼요. 그렇게 판정된 결정적 근거는?",
    figure: pimg("andromeda.webp", "뿌옇게 빛나는 타원형의 큰 천체와 주변 별들이 담긴 사진"),
    figureDark: true,
    options: [
      "측정한 거리가 우리은하의 크기보다 훨씬 멀었기 때문에",
      "나선 모양이 뚜렷하게 보였기 때문에",
      "색이 주변 별들과 달랐기 때문에",
      "스스로 빛을 내지 않았기 때문에",
      "밤마다 하늘에서 위치가 크게 바뀌었기 때문에",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>어떤 천체가 우리은하의 구성원인지 아닌지를 가르는 결정타는 <b>거리</b>예요. 이 천체까지의 거리를 재 보니 우리은하의 지름보다 <b>훨씬 멀리</b> 있었죠. 우리은하 크기 밖에 있으니 우리은하 안의 구름일 수 없고, 수많은 별을 가진 <b>또 하나의 은하</b>라는 결론이 나온 거예요.<span class='xh'>오답 하나씩 격파</span>나선 모양이나 색은 \"멀리 있는 은하\"와 \"가까운 성운\"을 가르지 못해요. 모양이 비슷해 보여도 거리가 다르면 정체가 완전히 달라지니까요. 실제로 거리를 재기 전까지는 뿌연 모양만 보고 성운이라 불렀답니다. \"스스로 빛을 내지 않았다\"는 사실과도 다르고(은하는 수많은 별의 빛으로 빛나요), \"밤마다 위치가 크게 바뀐다\"는 관측 사실이 아니에요. 아주 멀리 있는 천체일수록 위치 변화는 오히려 느껴지지 않죠.",
    core: "외부 은하 판정의 결정타 = 우리은하 크기를 넘는 거리!",
  },
  {
    // [327] d1 · xpair(balloon-big/small · 발주분 쌍 데뷔 · v1 balloon-expansion 단독과 사진 분리).
    // 검산: 풍선 모형 대응 · 딱지 = 은하 · 표면 = 우주 공간.
    id: "g2u8e327",
    lessonId: "g2u8l7",
    type: "mcq",
    diff: 1,
    prompt: "(가)는 조금 분 풍선, (나)는 같은 풍선을 더 크게 분 모습이에요. 우주 팽창을 설명하는 이 모형에서 붙임딱지가 나타내는 것은?",
    figure: xpair(
      "balloon-small.webp", "표면에 둥근 붙임딱지 여러 장이 붙은 조금 분 풍선",
      "balloon-big.webp", "같은 붙임딱지들이 붙어 있고 더 크게 분 풍선",
    ),
    options: ["은하", "별", "우주 공간 전체", "지구", "태양"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>풍선 모형의 대응을 정확히 붙여야 해요. 부풀어 늘어나는 <b>풍선 표면 = 우주 공간</b>, 표면 위에 붙은 <b>붙임딱지 = 은하</b>예요. 풍선을 불면 표면이 늘어나면서 딱지 사이의 간격이 저절로 멀어지는데, 이것이 은하 사이 공간이 늘어나 은하들이 서로 멀어지는 우주 팽창을 흉내 내죠.<span class='xh'>오답 하나씩 격파</span>\"별\"은 규모가 틀렸어요. 이 모형에서 딱지 하나는 별 하나가 아니라 수천억 개의 별을 품은 <b>은하 하나</b>예요. \"우주 공간 전체\"는 딱지가 아니라 풍선 표면의 몫이고요. 지구나 태양 같은 특정 천체 하나를 딱지에 대응시키는 것도 규모가 맞지 않아요. 모형 문제는 <b>무엇이 무엇을 흉내 내는지</b> 대응표부터 세우는 게 첫 단추랍니다. 참고로 (가)와 (나)를 비교하면 딱지 자체의 크기는 거의 그대로라는 것도 관찰할 수 있어요.",
    core: "풍선 표면 = 우주 공간 · 붙임딱지 = 은하!",
  },
  {
    // [330] d3 · 학생 발화 bogi(천09 학생 판정 계보). 검산: ㄱ 참(공간 팽창) · ㄴ 거짓(중심 없음 ·
    // 어느 은하에서 봐도 같음) · ㄷ 참(멀수록 빨리) → "ㄱ, ㄷ".
    id: "g2u8e330",
    lessonId: "g2u8l7",
    type: "mcq",
    diff: 3,
    prompt: "우주 팽창을 배운 세 학생 ㄱ, ㄴ, ㄷ이 <b>보기</b>처럼 말했어요. 옳게 말한 학생만 고른 것은?",
    bogi: [
      "\"은하와 은하 사이의 공간이 늘어나면서 은하들이 서로 멀어지는 거야.\"",
      "\"모든 은하가 우리에게서 멀어져 보이니까, 우리은하가 팽창의 중심이야.\"",
      "\"멀리 있는 은하일수록 같은 시간 동안 더 빨리 멀어져.\"",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ은 옳아요. 우주 팽창은 은하들이 공간 속을 날아가 흩어지는 게 아니라 <b>은하 사이의 공간 자체가 늘어나는</b> 현상이에요. ㄴ이 함정이에요. 우리에게서 모두 멀어져 보이는 건 사실이지만, 풍선 표면의 어느 딱지에서 봐도 다른 딱지들이 전부 멀어져 보이는 것처럼 <b>어느 은하에서 관측해도 똑같은 광경</b>이 보여요. 그래서 우리은하를 포함해 그 누구도 특별한 중심이 아니에요. ㄷ은 옳아요. 공간의 모든 구간이 함께 늘어나니, 멀리 있는 은하일수록 같은 시간에 더 많이 벌어져요.<span class='xh'>함정 포인트</span>\"다 나에게서 멀어지니 내가 중심\"은 이 단원 최고의 함정이에요. 관측 사실(멀어짐)은 맞지만 결론(중심)이 틀린, 한 끗 차이의 오개념이랍니다.",
    core: "공간 자체의 팽창 · 중심은 없다 · 멀수록 빨리!",
  },
  {
    // [331] d3 · EX bogi. 검산: 그림 = A 관측 기준 · B 짧은 화살 · C 긴 화살. ㄱ 거짓(중심 단정 불가) ·
    // ㄴ 참(먼 C가 빠름) · ㄷ 참(B에서 봐도 같은 규칙) → "ㄴ, ㄷ".
    id: "g2u8e331",
    lessonId: "g2u8l7",
    type: "mcq",
    diff: 3,
    prompt: "그림은 은하 A에서 은하 B와 C를 관측한 결과예요(화살표는 각 은하가 멀어지는 빠르기). 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: starExpandArrowFig(),
    figureDark: true,
    bogi: [
      "이 관측으로 A가 우주 팽창의 중심임을 알 수 있다.",
      "A에서 볼 때, 멀리 있는 은하일수록 더 빨리 멀어진다.",
      "B에서 관측해도 다른 은하들이 자기에게서 멀어져 보인다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄴ은 옳아요. 그림에서 가까운 B의 화살표는 짧고 먼 C의 화살표는 길죠. 공간의 모든 구간이 함께 늘어나니 <b>거리가 멀수록 같은 시간에 더 많이 벌어지는</b> 거예요. ㄷ도 옳아요. 우주 팽창에는 특별한 중심이 없어서, B로 자리를 옮겨 관측해도 A와 C가 B에게서 멀어져 보여요. 누가 관측하든 같은 규칙이 보이죠. ㄱ이 함정이에요. \"모두 A에게서 멀어지니 A가 중심\"처럼 보이지만, 방금 본 대로 어느 은하에서 관측해도 똑같은 그림이 나오기 때문에 이 관측만으로 A를 중심이라고 말할 수 없어요.<span class='xh'>함정 포인트</span>관측 기준(A)과 팽창의 중심을 혼동하게 만드는 게 이 그림의 노림수예요. <b>기준은 누구나 될 수 있고, 중심은 아무도 아니다</b>. 이 한 줄로 정리하세요.",
    core: "먼 은하일수록 긴 화살표 · 어느 은하에서 봐도 같은 광경!",
  },
  {
    // [336] d2 · multi · 풍선 모형 해석(레슨 multi와 보기 전면 신작 · 크기 불변 함정 추가).
    // 검산: 표면 = 공간(참) · 간격 멀어짐(참) · 먼 딱지 빨리(참) · 딱지 커짐(거짓 · 은하 불변) ·
    // 내부 공기 중심(거짓 · 표면만 우주).
    id: "g2u8e336",
    lessonId: "g2u8l7",
    type: "multi",
    diff: 2,
    prompt: "풍선 표면에 붙임딱지를 붙이고 크게 불어 보는 우주 팽창 모형 실험이 있어요. 이 모형의 해석으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "늘어나는 풍선 표면은 우주 공간에 해당한다",
      "풍선이 부풀면 딱지 사이의 간격이 멀어진다",
      "서로 멀리 떨어진 딱지일수록 같은 시간에 더 많이 멀어진다",
      "풍선이 부풀면 딱지 자체의 크기도 함께 커진다",
      "풍선 안쪽의 공기가 우주 팽창의 중심에 해당한다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>이 모형의 대응은 세 가지예요. 첫째, 부풀며 늘어나는 <b>풍선 표면이 우주 공간</b>이에요. 둘째, 표면이 늘어나면 그 위에 붙은 딱지(은하) 사이의 <b>간격이 저절로 멀어져요</b>. 셋째, 표면의 모든 부분이 함께 늘어나니 <b>멀리 떨어진 딱지일수록 같은 시간에 더 많이 벌어져요</b>. 실제 우주에서 멀리 있는 은하일수록 빨리 멀어지는 것과 같은 원리죠.<span class='xh'>오답 하나씩 격파</span>\"딱지 자체도 커진다\"는 관찰과 달라요. 커지는 건 딱지 사이의 <b>간격</b>이지 딱지가 아니에요. 실제 우주에서도 은하 자체는 중력 등으로 단단히 묶여 있어 커지지 않죠. \"안쪽 공기가 중심\"도 틀렸어요. 이 모형에서 우주에 해당하는 부분은 <b>풍선 표면뿐</b>이라, 표면이 아닌 안쪽 공기는 모형 밖의 부품이에요. 표면 위 어느 딱지도 특별하지 않으니 팽창의 중심은 없답니다.",
    core: "표면 = 공간 · 간격만 멀어짐(딱지 불변) · 중심 없음!",
  },

  // ─── L8 우주 탐사 · 🅟 5 ───
  {
    // [342] d1 · P sputnik · 장치 정체·역할(레슨 "최초의 인공위성은?" 5지와 각도 교체 · 사진 관찰형).
    id: "g2u8e342",
    lessonId: "g2u8l8",
    type: "mcq",
    diff: 1,
    prompt: "사진은 인류가 우주로 쏘아 올린 <b>최초의 장치</b>예요. 공 모양 몸체에 긴 안테나가 달린 이 장치가 한 일은?",
    figure: pimg("sputnik.webp", "금속 공 모양 몸체에 길고 가는 안테나가 여러 개 달린 장치"),
    options: [
      "지구 둘레를 돌며 전파 신호를 보냈다",
      "달 표면에 착륙해 흙을 조사했다",
      "사람을 태우고 우주를 비행했다",
      "먼 은하의 사진을 찍어 지구로 보냈다",
      "화성 표면을 돌아다니며 탐사했다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진의 장치는 인류 최초의 <b>인공위성</b>이에요. 인공위성은 지구 둘레를 도는 장치라는 뜻이고, 이 첫 위성은 지구를 돌며 <b>전파 신호를 보내는 일</b>을 해냈어요. 이 작은 공 하나가 우주 시대의 문을 연 거죠.<span class='xh'>오답 하나씩 격파</span>달 착륙은 그로부터 십여 년 뒤 사람이 해낸 일이고, 착륙해 조사하는 건 위성이 아니라 <b>착륙선·탐사선</b>의 몫이에요. 사람을 태운 비행도 최초 위성 이후의 단계예요. 첫 위성엔 사람이 타지 않았죠. 먼 은하의 사진은 훨씬 뒤의 <b>우주 망원경</b>이 하는 일이고, 화성 표면을 돌아다니는 건 화성에 보낸 탐사 차의 일이에요. 탐사의 역사는 \"기계를 올리고 → 사람이 나가고 → 우주에 눈과 집을 짓는\" 순서로 흘렀다는 큰 흐름을 기억하세요.",
    core: "최초의 인공위성 = 지구 둘레를 돌며 신호를 보낸 공 모양 장치!",
  },
  {
    // [347] d2 · P pluto · 상세 모습을 얻은 방법 = 탐사선 접근(장비 역할 구분).
    id: "g2u8e347",
    lessonId: "g2u8l8",
    type: "mcq",
    diff: 2,
    prompt: "사진은 명왕성의 모습이에요. 지구에서는 점 하나로만 보이던 명왕성의 이런 <b>상세한 모습</b>을 처음으로 얻을 수 있었던 방법은?",
    figure: pimg("pluto.webp", "밝은 하트 모양 무늬가 있는 둥근 천체의 상세한 모습"),
    figureDark: true,
    options: [
      "탐사선이 가까이 다가가서 직접 찍었다",
      "지상의 대형 망원경으로 찍었다",
      "국제우주정거장에서 맨눈으로 관찰했다",
      "달에 설치한 카메라로 찍었다",
      "인공위성이 지구 둘레를 돌며 찍었다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>명왕성은 너무 멀어서 지구의 망원경으로는 흐릿한 점으로만 보여요. 이런 천체의 지형과 무늬까지 담은 상세한 모습은 <b>탐사선이 직접 날아가 가까이에서 촬영</b>해야 얻을 수 있어요. 실제로 탐사선이 명왕성 곁을 지나며 하트 무늬가 선명한 사진을 보내왔죠. 직접 가서 확인하는 것, 이것이 탐사선만의 힘이에요.<span class='xh'>오답 하나씩 격파</span>지상 대형 망원경은 대기의 방해까지 겹쳐 명왕성을 점 이상으로 키워 보여 주지 못해요. 국제우주정거장은 지구 바로 위를 도는 실험실이라 명왕성 관찰 기지가 아니고, 맨눈으로는 더더욱 불가능해요. 달에 설치한 카메라도 명왕성까지의 아득한 거리를 좁혀 주지 못하죠. 인공위성은 <b>지구 둘레</b>를 도는 장치라 명왕성 근접 촬영과는 역할이 달라요. 장비마다 맡은 일이 다르다는 것, 이 문제의 핵심이에요.",
    core: "먼 천체의 상세한 모습 = 직접 다가간 탐사선의 몫!",
  },
  {
    // [350] d2 · 역사 순서 나열(레슨 order 4항목과 형식 분리 · "몇 번째" v1 num 결함의 올바른 재작성).
    // 검산: 인공위성(최초) → 달 착륙 → 허블 → 제임스 웹(연대 유일 · 대안 유효 순서 구조적 부재).
    id: "g2u8e350",
    lessonId: "g2u8l8",
    type: "mcq",
    diff: 2,
    prompt: "우주 탐사의 주요 사건을 <b>먼저 일어난 것부터</b> 순서대로 나열한 것은?",
    options: [
      "달 착륙 → 최초의 인공위성 → 허블 우주 망원경 → 제임스 웹 우주 망원경",
      "최초의 인공위성 → 달 착륙 → 허블 우주 망원경 → 제임스 웹 우주 망원경",
      "최초의 인공위성 → 허블 우주 망원경 → 달 착륙 → 제임스 웹 우주 망원경",
      "달 착륙 → 허블 우주 망원경 → 최초의 인공위성 → 제임스 웹 우주 망원경",
      "최초의 인공위성 → 달 착륙 → 제임스 웹 우주 망원경 → 허블 우주 망원경",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>흐름으로 기억하면 순서가 저절로 나와요. 인류는 먼저 지구 둘레에 <b>기계(최초의 인공위성)</b>를 올렸고, 다음으로 <b>사람이 직접</b> 지구 밖 천체(달)에 발을 디뎠어요. 그 뒤 우주에 <b>눈(허블 우주 망원경)</b>을 띄워 대기의 방해 없이 우주를 보기 시작했고, 최근에 그 바통을 이어받은 <b>다음 세대의 눈(제임스 웹 우주 망원경)</b>이 올라갔죠.<span class='xh'>오답 하나씩 격파</span>달 착륙을 맨 앞에 둔 나열은 순서가 뒤집혔어요. 사람을 보내기 전에 기계를 먼저 올려 우주 비행을 확인하는 게 자연스러운 순서였죠. 허블을 달 착륙보다 앞에 둔 나열도 틀렸어요. 우주 망원경은 달 착륙보다 한참 뒤의 기술이에요. 제임스 웹을 허블보다 앞에 둔 나열은 세대교체 관계를 뒤집은 거예요. 제임스 웹은 허블의 <b>다음 세대</b>랍니다. \"올리고 → 나가고 → 눈을 띄우고 → 눈을 바꾸다\"로 기억하세요.",
    core: "인공위성 → 달 착륙 → 허블 → 제임스 웹(올리고·나가고·눈 띄우고)!",
  },
  {
    // [352] d1 · multi · 일상 속 우주 기술(천12 폐쇄형 변환). 검산: 태풍 관측·위치 찾기·위성 통신 =
    // 전부 인공위성 기반(참 3) · 자전거·부싯돌 = 무관(거짓 2).
    id: "g2u8e352",
    lessonId: "g2u8l8",
    type: "multi",
    diff: 1,
    prompt: "우주 탐사 기술이 우리 일상생활에 쓰이는 예로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "인공위성 사진으로 태풍의 이동을 미리 살핀다",
      "위성 신호를 받아 지도에서 내 위치를 찾는다",
      "위성을 거쳐 지구 반대편과 실시간으로 통신한다",
      "자전거 페달을 밟아 바퀴를 굴린다",
      "부싯돌을 부딪쳐 불을 피운다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>우주 탐사로 개발된 기술은 이미 일상 깊숙이 들어와 있어요. 기상 <b>인공위성</b>이 구름 사진을 보내 주니 태풍의 진로를 미리 알 수 있고, 위치를 알려 주는 <b>위성 신호</b> 덕분에 스마트폰 지도가 내가 선 자리를 찾아내요. 지구 반대편과의 실시간 통신도 <b>통신 위성</b>이 전파를 중계해 주기에 가능하죠. 셋 모두 우주에 띄운 장치가 없으면 멈추는 일상이에요.<span class='xh'>오답 하나씩 격파</span>자전거 페달과 바퀴는 사람의 힘과 기계 장치만으로 굴러가는, 우주 기술과 무관한 예예요. 부싯돌로 불 피우기는 우주 시대보다 수만 년 앞선 기술이고요. 이 유형의 판정 기준은 하나예요. <b>그 일의 어딘가에 인공위성이나 우주에서 개발된 기술이 끼어 있는가?</b> 일기예보, 내비게이션, 위성 통신처럼 하늘 위 장치가 다리를 놓아 주는 일이면 우주 기술의 일상 활용이랍니다.",
    core: "일기예보·위치 찾기·위성 통신 = 일상 속 인공위성!",
  },
  {
    // [360] d3 · bogi 단원 종합(역사 흐름 · 의의 · 숙제). 검산: ㄱ 참(위성 1957 → 달 1969) ·
    // ㄴ 참(스핀오프) · ㄷ 거짓(우주 쓰레기 문제 · 저절로 안 사라짐) → "ㄱ, ㄴ".
    id: "g2u8e360",
    lessonId: "g2u8l8",
    type: "mcq",
    diff: 3,
    prompt: "우주 탐사에 대한 설명으로 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    bogi: [
      "인류는 인공위성을 먼저 쏘아 올린 뒤에, 사람이 달에 다녀왔다.",
      "우주 탐사 과정에서 개발된 기술은 일상생활에도 쓰인다.",
      "수명이 다한 인공위성과 파편은 우주에서 저절로 모두 사라지므로 문제가 되지 않는다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ은 옳아요. 인류는 기계(인공위성)를 먼저 올려 우주 비행을 확인한 뒤에야 사람을 보냈고, 그 뒤 달 착륙까지 이어졌죠. ㄴ도 옳아요. 일기예보와 내비게이션, 위성 통신처럼 탐사 과정에서 개발된 기술이 일상으로 돌아와 우리 생활을 바꿨어요. ㄷ이 함정이에요. 수명이 다한 위성과 로켓 파편은 저절로 사라지지 않고 <b>우주 쓰레기</b>가 되어 매우 빠른 속도로 지구 둘레를 돌아요. 새 위성과 부딪힐 위험 때문에 국제 사회가 함께 해결책을 찾는 <b>현재 진행형 숙제</b>랍니다.<span class='xh'>함정 포인트</span>\"우주는 넓으니 쓰레기쯤은 알아서 없어지겠지\"라는 방심을 노린 보기예요. 탐사의 성과와 함께 남겨진 숙제까지 아는 것이 이 단원의 마무리예요.",
    core: "위성 → 사람 순서 · 기술은 일상으로 · 우주 쓰레기는 남은 숙제!",
  },
];
