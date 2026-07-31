// u4 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 9호) · 정본 설계표 qa/u4-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정·index.ts 미등록. 확대 승인분과 함께 build-u4v2-lessons.mjs가
// u4l1~l6.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼(QC·PP2·TRI·DF·OB·PT3·SM·SY·SB·IL·MX·DW 파일럿 데뷔 + FCQ·GA·VE·LD·EB·WC·PR·IC 부록
// 데뷔)는 파일럿 로컬 함수(m1u5 v2 관행) · 이식 때 ui/examFigures.ts "u4 v2" 섹션으로 승격한다.
// 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다(부록 = PILOT_PREVIEW 카드).
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커 ✓ · mcq/multi 5지·multi 3보기 · 라벨형 shuffle:false(첫 보기 정답 금지) · num 0 · word 0.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
// 각 문항 주석 = [슬롯] 검산 노트(입자 방향·곡선 구간·열 출입↔주변 온도·부피 방향·질량 보존·김=물방울).
// 다크 입자 문법: 입자 #6E9EDB+하이라이트 · 상자 스트로크 #2C4066 · 텍스트 #DCE8FF/#AFC3E3.
import type { ExamItem } from "../src/content/exams/types";
import { svgTable, stateFlowFig, waterFreezeFig, dbox } from "../src/ui/examFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/u4/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;

/* ══════════ 신작 헬퍼(이식 때 examFigures "u4 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 다크 입자 프리미티브(u4 v2) · 컷 간 입자 개수 12개 통일(개수 보존 검산 가능 설계 · v1의 9/6 혼재 보정).
 *  운동 표현은 교과서 세 상태 그림 문법(사용자 원본 이미지 검수로 확정):
 *  기체 = 날아가는 방향의 블러 꼬리(원뿔 잔상) · 고체 = 입자 양옆 괄호형 진동 호 ( ) ·
 *  액체 = 같은 괄호 호를 더 크게 2겹 + 입자별 회전(고체보다 크게 흔들리는 느낌). */
const dotP = (x: number, y: number, r = 5.6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#6E9EDB"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.33).toFixed(1)}" r="${(r * 0.3).toFixed(1)}" fill="rgba(255,255,255,.4)"/>`;
/** 기체 블러 꼬리 · ang = 날아가는 방향(라디안) · 꼬리는 반대쪽으로 좁아지며 페이드. */
const gasTailP = (x: number, y: number, ang: number, len: number, r = 4.7): string => {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const px = -dy;
  const py = dx;
  const w = r * 0.8;
  const tx = x - dx * len;
  const ty = y - dy * len;
  return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#8FB3E8" opacity=".22"/>
    <circle cx="${(x - dx * len * 0.55).toFixed(1)}" cy="${(y - dy * len * 0.55).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="#8FB3E8" opacity=".13"/>`;
};
/** 고체 진동 호 · 교과서 (나) 문법: 격자 덩어리의 **맨 바깥쪽에만** 그린다(입자 사이사이에는 없음).
 *  side = 그 입자가 덩어리 가장자리에서 바깥을 향한 면. */
const vibSideP = (x: number, y: number, side: "l" | "r" | "t" | "b", r = 5.8): string => {
  const rr = r + 3;
  const S = `stroke="#8FB3E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"`;
  if (side === "l") return `<path d="M${(x - rr).toFixed(1)} ${(y - 4.8).toFixed(1)}q-2.4 4.8 0 9.6" ${S}/>`;
  if (side === "r") return `<path d="M${(x + rr).toFixed(1)} ${(y - 4.8).toFixed(1)}q2.4 4.8 0 9.6" ${S}/>`;
  if (side === "t") return `<path d="M${(x - 4.8).toFixed(1)} ${(y - rr).toFixed(1)}q4.8 -2.4 9.6 0" ${S}/>`;
  return `<path d="M${(x - 4.8).toFixed(1)} ${(y + rr).toFixed(1)}q4.8 2.4 9.6 0" ${S}/>`;
};
/** 바깥 방향(중심 반대쪽) 진동 호 1개 · 고리형 고체(얼음)용. */
const vibOutP = (x: number, y: number, cx: number, cy: number, r = 5.2): string => {
  const deg = ((Math.atan2(y - cy, x - cx) * 180) / Math.PI).toFixed(1);
  const rr = r + 3;
  return `<g transform="rotate(${deg} ${x} ${y})"><path d="M${(x + rr).toFixed(1)} ${(y - 4.8).toFixed(1)}q2.4 4.8 0 9.6" stroke="#8FB3E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/></g>`;
};
/** 액체 진동 호 · 괄호 2겹 + 입자별 회전(교과서 (다) 문법 · 고체보다 크게 흔들림). */
const vib2P = (x: number, y: number, i: number, r = 5.6): string => {
  const rot = [0, 26, -26, 13, -13][i % 5];
  const r1 = r + 2.8;
  const r2 = r + 5.8;
  const arc = (rr: number): string =>
    `M${(x - rr).toFixed(1)} ${(y - 4.6).toFixed(1)}q-2.3 4.6 0 9.2M${(x + rr).toFixed(1)} ${(y - 4.6).toFixed(1)}q2.3 4.6 0 9.2`;
  return `<g transform="rotate(${rot} ${x} ${y})">
    <path d="${arc(r1)}" stroke="#8FB3E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="${arc(r2)}" stroke="#8FB3E8" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".3"/>
  </g>`;
};
/** 배치 3종 · 상자 좌표계 (0,0)~(94,84) · 전부 12개. */
const gridP = (): string => {
  let out = "";
  for (let i = 0; i < 12; i++) {
    const c = i % 4;
    const rw = Math.floor(i / 4);
    const x = 20 + c * 18;
    const y = 24 + rw * 20;
    let vib = "";
    if (c === 0) vib += vibSideP(x, y, "l");
    if (c === 3) vib += vibSideP(x, y, "r");
    if (rw === 0) vib += vibSideP(x, y, "t");
    if (rw === 2) vib += vibSideP(x, y, "b");
    out += vib + dotP(x, y, 5.8);
  }
  return out;
};
const clumpP = (): string => {
  // 교과서 액체 표준(사용자 검수 반영): 서로 닿을 듯 말 듯한 틈(중심 간 = 지름의 1.3배쯤)을 두고
  // 불규칙하게 아래쪽 2/3를 채운다 · 다닥다닥 겹칠 듯 뭉치면 실격 · 위 1/3은 자유 표면으로 비움.
  const pts: [number, number][] = [
    [21, 41], [36, 38], [50, 42], [65, 39], [79, 42],
    [27, 55], [42, 53], [57, 56], [71, 53],
    [33, 68], [48, 70], [63, 67],
  ];
  return pts.map(([x, y], i) => vib2P(x, y, i) + dotP(x, y, 5.6)).join("");
};
const scatterP = (motion = true): string => {
  const pts: [number, number][] = [
    [14, 14], [46, 10], [78, 16], [28, 32], [62, 30], [86, 38],
    [12, 48], [42, 46], [72, 52], [22, 68], [54, 66], [82, 72],
  ];
  return pts.map(([x, y], i) => `${motion ? gasTailP(x, y, ((i * 137) % 360) * (Math.PI / 180), 13) : ""}${dotP(x, y, 4.7)}`).join("");
};
/** 상태 성질 모형용 성긴 기체(교과서 세 상태 그림 표준 · 5~6개 + 날아가는 블러 꼬리).
 *  변화 전후 2컷(PP2·SB)은 개수 보존 검산 때문에 scatterP(12)를 유지한다(천체 실측 12=12 계보). */
const scatterSparseP = (): string => {
  const pts: [number, number][] = [[20, 16], [64, 12], [84, 42], [38, 40], [16, 66], [64, 66]];
  return pts.map(([x, y], i) => `${gasTailP(x, y, ((i * 137 + 40) % 360) * (Math.PI / 180), 18, 5)}${dotP(x, y, 5)}`).join("");
};
const boxP = (x: number, y: number, inner: string, label?: string): string =>
  `<g transform="translate(${x},${y})"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${inner}</g>${label ? `<text x="${x + 47}" y="${y + 104}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#AFC3E3">${label}</text>` : ""}`;

/** PP2 상태 변화 입자 모형 2컷(다크·6방향) · 왼쪽 상자가 화살표를 지나 오른쪽 상자로.
 *  컷 간 입자 개수 12 = 12(개수 보존 판정 성립). aria는 중립(방향·상태 판독 결과를 낭독하지 않는다). */
export function particleChangeFig(kind: "melt" | "freeze" | "vaporize" | "condense" | "sublime" | "deposit", o?: { labels?: [string, string] }): string {
  const arr: Record<string, [string, string]> = {
    melt: [gridP(), clumpP()],
    freeze: [clumpP(), gridP()],
    vaporize: [clumpP(), scatterP()],
    condense: [scatterP(), clumpP()],
    sublime: [gridP(), scatterP()],
    deposit: [scatterP(), gridP()],
  };
  const [a, b] = arr[kind];
  const la = o?.labels?.[0];
  const lb = o?.labels?.[1];
  const H = la ? 132 : 116;
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="입자 배열 모형 두 상자. 왼쪽 상자의 배열이 화살표를 지나 오른쪽 상자의 배열로 변한다">
    ${boxP(28, 14, a, la)}
    <path d="M142 56h52" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M186 44l14 12-14 12" fill="none" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${boxP(222, 14, b, lb)}
  </svg>`;
}

/** PT3 세 상태 입자 모형(다크·배정 파라미터판) · order로 (가)(나)(다) 배정을 바꾼다
 *  (구 stateTrioFig 고정 배열 (가)기체(나)고체(다)액체의 회피판). motion = 운동 표현 유지. */
export function stateTrioParamFig(order: ("solid" | "liquid" | "gas")[]): string {
  const inner: Record<string, string> = { solid: gridP(), liquid: clumpP(), gas: scatterSparseP() };
  const tags = ["(가)", "(나)", "(다)"];
  return `<svg viewBox="0 0 344 136" ${NS} fill="none" role="img" aria-label="물질의 세 가지 상태를 나타낸 입자 배열 모형 세 상자. 상자마다 입자의 배열과 간격이 다르다">
    ${order.map((k, i) => boxP(16 + i * 108, 8, inner[k], tags[i])).join("")}
  </svg>`;
}

/** SM 한 상태 입자 모형 단독(다크·확대 1컷). */
export function stateSingleFig(kind: "solid" | "liquid" | "gas"): string {
  const inner: Record<string, string> = { solid: gridP(), liquid: clumpP(), gas: scatterSparseP() };
  return `<svg viewBox="0 0 344 128" ${NS} fill="none" role="img" aria-label="어떤 상태의 입자 배열 모형 한 상자">
    <g transform="translate(114,10) scale(1.24)"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${inner[kind]}</g>
  </svg>`;
}

/** MX 융해 진행 중(수평 구간) 공존 모형(다크 1컷) · 아래쪽 규칙 덩어리 + 둘레 흐트러진 입자. */
export function meltMixFig(): string {
  // 아직 안 녹은 규칙 덩어리(하단 · 밀집 격자 · 진동 호) + 먼저 녹은 입자(둘레 · 운동 잔상) · 경계 분리.
  let grid = "";
  const gp: [number, number][] = [[33, 56], [47, 56], [61, 56], [33, 70], [47, 70], [61, 70]];
  gp.forEach(([x, y], i) => {
    const c = i % 3;
    const rw = Math.floor(i / 3);
    let vib = "";
    if (c === 0) vib += vibSideP(x, y, "l");
    if (c === 2) vib += vibSideP(x, y, "r");
    if (rw === 0) vib += vibSideP(x, y, "t");
    if (rw === 1) vib += vibSideP(x, y, "b");
    grid += vib + dotP(x, y, 5.8);
  });
  const liq: [number, number][] = [[16, 26], [38, 20], [62, 24], [82, 34], [12, 52], [82, 62]];
  const liqArt = liq.map(([x, y], i) => vib2P(x, y, i, 5.4) + dotP(x, y, 5.4)).join("");
  return `<svg viewBox="0 0 344 128" ${NS} fill="none" role="img" aria-label="가열 중인 용기 속 입자 모형 한 상자. 규칙적으로 모여 있는 부분과 흐트러진 부분이 함께 있다">
    <g transform="translate(114,10) scale(1.24)"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${liqArt}${grid}</g>
  </svg>`;
}

/** IL 물/얼음 입자 배열 비교(다크 2컷) · 얼음은 가운데가 빈 고리(틈) 얼개 · 물은 촘촘 불규칙.
 *  같은 개수(12)로 그려 부피 차이의 원인이 "틈"임을 판독하게 한다. */
export function iceLatticeFig(): string {
  // 얼음 = 가운데가 빈 육각 고리 얼개 · 고리 결합선을 함께 그려 "틈"이 한눈에 읽히게 한다(점만으로는 약함).
  const ringHex = (cx: number, cy: number, r: number): string => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const outline = `<path d="${pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} Z" stroke="#3D5378" stroke-width="1.6" fill="none"/>`;
    return outline + pts.map(([x, y]) => vibOutP(x, y, cx, cy) + dotP(x, y, 5.2)).join("");
  };
  const ice = `${ringHex(31, 30, 16)}${ringHex(63, 56, 16)}<line x1="31" y1="46" x2="49" y2="48" stroke="#3D5378" stroke-width="1.6"/>`;
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="두 입자 배열 모형. 왼쪽 상자는 물, 오른쪽 상자는 얼음이라고 표시되어 있다">
    ${boxP(48, 8, clumpP(), "(가) 물")}
    ${boxP(202, 8, ice, "(나) 얼음")}
  </svg>`;
}

/** EB 증발/끓음 비교 모형(다크 2컷) · (가) 표면에서만 조용히 이탈 · (나) 액체 속 기포 + 활발한 이탈. */
export function evapBoilFig(): string {
  const surface = (esc: string, inner: string): string => `${inner}${esc}`;
  const liqLow = ((): string => {
    const pts: [number, number][] = [[20, 46], [38, 42], [56, 47], [74, 43], [26, 60], [46, 62], [64, 58], [78, 64], [34, 74], [56, 74]];
    return pts.map(([x, y], i) => vib2P(x, y, i, 5.4) + dotP(x, y, 5.4)).join("");
  })();
  const evap = surface(`${gasTailP(36, 18, -1.35, 10, 4.8)}${dotP(36, 18, 4.8)}${gasTailP(70, 12, -1.75, 10, 4.8)}${dotP(70, 12, 4.8)}<path d="M24 34h46" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="4 4"/>`, liqLow);
  const boilLiq = ((): string => {
    const pts: [number, number][] = [[18, 48], [36, 44], [72, 46], [24, 62], [78, 62], [40, 76], [60, 76]];
    return pts.map(([x, y], i) => vib2P(x, y, i, 5.4) + dotP(x, y, 5.4)).join("");
  })();
  const bubble = `<circle cx="52" cy="58" r="12" stroke="#8FB3E8" stroke-width="1.6" fill="rgba(143,179,232,.08)"/>${dotP(48, 56, 3.6)}${dotP(57, 60, 3.6)}
    <circle cx="66" cy="34" r="8" stroke="#8FB3E8" stroke-width="1.4" fill="rgba(143,179,232,.08)"/>${dotP(66, 34, 3.2)}`;
  const boil = surface(`${gasTailP(28, 14, -1.55, 11, 4.8)}${dotP(28, 14, 4.8)}${gasTailP(56, 10, -1.3, 11, 4.8)}${dotP(56, 10, 4.8)}${gasTailP(82, 16, -1.85, 11, 4.8)}${dotP(82, 16, 4.8)}<path d="M14 28h66" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="4 4"/>${bubble}`, boilLiq);
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="액체가 기체로 변하는 두 가지 방식의 입자 모형 (가)와 (나). 두 상자의 속 모습이 서로 다르다">
    ${boxP(48, 8, evap, "(가)")}
    ${boxP(202, 8, boil, "(나)")}
  </svg>`;
}

/** QC 정성 가열·냉각 곡선(라이트) · 실측 3사 이식: 눈금 수치 없음 · 축 라벨(온도(℃)/시간(분))과
 *  원점 0만 · 구간 라벨 ㉠~㉤(레슨 (가)~(라) 회피) · 경계 세로 점선. pair = 같은 물질 양 비교 두 곡선. */
export function qualCurveFig(o: { mode: "heat" | "cool"; plateaus?: 1 | 2; secs?: boolean; pair?: boolean }): string {
  const L = 42;
  const BASE = 164;
  const TOP = 24;
  // secs 모드에서는 구간 라벨(㉠~)이 BASE+18 줄을 쓰므로 시간(분) 축 제목을 한 줄 아래로 내린다(겹침 방지).
  const axis = `<path d="M${L} ${TOP - 8}V${BASE}H326" stroke="#B0B8C1" stroke-width="1.6" fill="none"/>
    <text x="${L - 10}" y="${BASE + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">0</text>
    <text x="10" y="16" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="336" y="${BASE + (o.secs ? 34 : 18)}" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>`;
  const seg = (pts: [number, number][], color = "#5E6B7E", w = 3): string =>
    `<path d="${pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (o.pair) {
    const pa: [number, number][] = [[L, 148], [104, 92], [156, 92], [232, 38]];
    const pb: [number, number][] = [[L, 148], [138, 92], [252, 92], [318, 44]];
    return `<svg viewBox="0 0 344 196" ${NS} role="img" aria-label="같은 물질을 가열한 두 온도 그래프 (가)와 (나). 온도가 일정하게 유지되는 구간의 높이는 서로 같고, 길이는 서로 다르다">
      ${axis}
      <line x1="${L}" y1="92" x2="326" y2="92" stroke="#DCE0E6" stroke-width="1.2" stroke-dasharray="3 4"/>
      ${seg(pa, "#4E5968")}${seg(pb, "#3182F6")}
      <text x="238" y="34" font-size="11.5" font-weight="700" fill="#4E5968">(가)</text>
      <text x="322" y="40" text-anchor="end" font-size="11.5" font-weight="700" fill="#3182F6">(나)</text>
    </svg>`;
  }
  const two = o.plateaus === 2;
  let pts: [number, number][];
  if (o.mode === "heat") {
    pts = two
      ? [[L, 152], [102, 112], [158, 112], [216, 62], [266, 62], [318, 32]]
      : [[L, 148], [128, 92], [216, 92], [312, 38]];
  } else {
    pts = two
      ? [[L, 34], [102, 74], [158, 74], [216, 124], [266, 124], [318, 154]]
      : [[L, 40], [128, 96], [216, 96], [312, 150]];
  }
  let secs = "";
  if (o.secs) {
    const marks = ["㉠", "㉡", "㉢", "㉣", "㉤"];
    const bounds = [L, ...pts.slice(1, -1).map(([x]) => x), 326];
    for (let i = 0; i < bounds.length - 1 && i < marks.length; i++) {
      const mid = (bounds[i] + bounds[i + 1]) / 2;
      secs += `<text x="${mid.toFixed(0)}" y="${BASE + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${marks[i]}</text>`;
      if (i > 0) secs += `<line x1="${bounds[i]}" y1="${BASE}" x2="${bounds[i]}" y2="${TOP}" stroke="#DCE0E6" stroke-width="1" stroke-dasharray="2 4"/>`;
    }
  }
  return `<svg viewBox="0 0 344 ${o.secs ? 206 : 192}" ${NS} role="img" aria-label="물질을 ${o.mode === "heat" ? "가열" : "냉각"}할 때 시간에 따른 온도 변화를 나타낸 그래프. 온도가 일정하게 유지되는 구간이 있다">
    ${axis}${secs}
    ${seg(pts)}
  </svg>`;
}

/** TRI 상태 변화 삼각 다이어그램(라이트·모형 꼭짓점판) · 꼭짓점 = 입자 모형 원판(상태 이름 미표기 ·
 *  판독 과제) · 화살표 (가)~(바) 고정 배정: (가) 고체→액체 · (나) 액체→고체 · (다) 액체→기체 ·
 *  (라) 기체→액체 · (마) 고체→기체 · (바) 기체→고체. 위 = 기체 · 좌하 = 고체 · 우하 = 액체(앱 관례). */
export function phaseTriModelFig(): string {
  const md = (x: number, y: number, r = 3): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8B95A1"/>`;
  const gtail = (x: number, y: number, deg: number): string => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy;
    const py = dx;
    const w = 2.1;
    const L = 7.5;
    return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${(x - dx * L).toFixed(1)} ${(y - dy * L).toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#8B95A1" opacity=".3"/>`;
  };
  const miniSolid = `${md(-11, -6)}${md(0, -6)}${md(11, -6)}${md(-11, 5)}${md(0, 5)}${md(11, 5)}${md(-11, 16)}${md(0, 16)}${md(11, 16)}`;
  const miniLiquid = `${md(-12, -4)}${md(-1, -8)}${md(10, -3)}${md(-7, 7)}${md(4, 6)}${md(13, 9)}${md(-2, 17)}${md(9, 18)}`;
  const miniGas = `${gtail(-14, -10, 215)}${md(-14, -10, 2.6)}${gtail(8, -14, 80)}${md(8, -14, 2.6)}${gtail(15, 2, 340)}${md(15, 2, 2.6)}${gtail(-6, 4, 150)}${md(-6, 4, 2.6)}${gtail(-15, 14, 250)}${md(-15, 14, 2.6)}${gtail(6, 16, 30)}${md(6, 16, 2.6)}`;
  const node = (cx: number, cy: number, inner: string): string =>
    `<circle cx="${cx}" cy="${cy}" r="38" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.5"/><g transform="translate(${cx},${cy})">${inner}</g>`;
  const arrow = (x1: number, y1: number, x2: number, y2: number, lab: string, lx: number, ly: number): string => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = (a: number): number => x2 - Math.cos(ang - a) * 9;
    const hy = (a: number): number => y2 - Math.sin(ang - a) * 9;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6B7684" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${x2} ${y2} L${hx(0.44).toFixed(1)} ${hy(0.44).toFixed(1)} M${x2} ${y2} L${hx(-0.44).toFixed(1)} ${hy(-0.44).toFixed(1)}" stroke="#6B7684" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="${lx}" cy="${ly}" r="14" fill="#fff" stroke="#B0B8C1" stroke-width="1.4"/>
      <text x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#333D4B">${lab}</text>`;
  };
  return `<svg viewBox="0 0 344 258" ${NS} fill="none" role="img" aria-label="세 개의 입자 배열 원판 사이를 화살표 (가)부터 (바)까지가 잇는 상태 변화 그림. 원판에는 상태 이름이 적혀 있지 않다">
    ${node(172, 52, miniGas)}
    ${node(66, 200, miniSolid)}
    ${node(278, 200, miniLiquid)}
    ${arrow(112, 188, 226, 188, "(가)", 169, 172)}
    ${arrow(226, 218, 112, 218, "(나)", 169, 236)}
    ${arrow(266, 158, 210, 78, "(다)", 222, 134)}
    ${arrow(226, 62, 288, 154, "(라)", 298, 92)}
    ${arrow(80, 158, 136, 78, "(마)", 122, 134)}
    ${arrow(118, 62, 56, 154, "(바)", 46, 92)}
  </svg>`;
}

/** DF 확산 관찰(라이트) · time = 색소 한 방울의 시간 순 3컷 · temp = 같은 시간 뒤 뜨거운 물/차가운 물 비교. */
export function diffuseSeqFig(mode: "time" | "temp"): string {
  const beaker = (x: number, w: number, ink: string, label: string): string => `
    <g transform="translate(${x},0)">
      <path d="M6 18 V96 a8 8 0 0 0 8 8 H${w - 14} a8 8 0 0 0 8-8 V18" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <line x1="2" y1="18" x2="${w - 2}" y2="18" stroke="#8B95A1" stroke-width="2" stroke-linecap="round"/>
      <rect x="8" y="30" width="${w - 16}" height="72" rx="6" fill="#EAF3FF"/>
      ${ink}
      <text x="${w / 2}" y="124" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  if (mode === "time") {
    const drop = `<ellipse cx="46" cy="94" rx="15" ry="7" fill="#3B6FD4" opacity=".85"/>`;
    const mid = `<ellipse cx="46" cy="84" rx="24" ry="18" fill="#3B6FD4" opacity=".38"/><ellipse cx="46" cy="92" rx="30" ry="10" fill="#3B6FD4" opacity=".5"/>`;
    const full = `<rect x="8" y="30" width="76" height="72" rx="6" fill="#3B6FD4" opacity=".34"/>`;
    return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="물이 든 비커 바닥에 색소 한 방울을 떨어뜨린 뒤 시간 순서대로 관찰한 세 장면">
      ${beaker(14, 92, drop, "(가)")}${beaker(126, 92, mid, "(나)")}${beaker(238, 92, full, "(다)")}
    </svg>`;
  }
  const spreadBig = `<ellipse cx="53" cy="76" rx="36" ry="30" fill="#3B6FD4" opacity=".4"/><ellipse cx="53" cy="90" rx="42" ry="14" fill="#3B6FD4" opacity=".5"/>`;
  const spreadSmall = `<ellipse cx="53" cy="92" rx="18" ry="9" fill="#3B6FD4" opacity=".7"/>`;
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="같은 시간이 지난 뒤 두 비커를 비교한 그림. 한쪽은 뜨거운 물, 다른 쪽은 차가운 물이라고 표시되어 있다">
    ${beaker(46, 106, spreadBig, "(가) 뜨거운 물")}${beaker(196, 106, spreadSmall, "(나) 차가운 물")}
  </svg>`;
}

/** OB 열린 접시 증발 저울(라이트 2컷) · (가) 직후 진한 얼룩 · (나) 시간이 지난 뒤 옅은 얼룩 ·
 *  표시창은 빈 패널(숫자 각인 금지 · u4 원조 관행). */
export function openScaleFig(): string {
  const unit = (x: number, stain: string, label: string): string => `
    <g transform="translate(${x},0)">
      <ellipse cx="76" cy="42" rx="52" ry="10" fill="#F4F6F8" stroke="#8B95A1" stroke-width="1.8"/>
      <ellipse cx="76" cy="38" rx="52" ry="10" fill="#fff" stroke="#8B95A1" stroke-width="1.8"/>
      <ellipse cx="76" cy="38" rx="34" ry="6.4" fill="#FDFEFF" stroke="#C9D0D9" stroke-width="1.2"/>
      ${stain}
      <path d="M28 56h96a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="46" y="64" width="60" height="16" rx="4" fill="#2A3442"/>
      <text x="76" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const wetStain = `<ellipse cx="76" cy="37" rx="24" ry="4.6" fill="#9EC5FB" opacity=".9"/>`;
  const dryStain = `<ellipse cx="76" cy="37" rx="11" ry="2.6" fill="#C9DDF7" opacity=".8"/>
    <g stroke="#9EC5FB" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M62 26c-2-4 2-6 0-10M90 27c-2-4 2-6 0-10"/></g>`;
  return `<svg viewBox="0 0 344 124" ${NS} fill="none" role="img" aria-label="전자저울 위 접시에 액체를 떨어뜨린 거름종이를 올린 두 장면. 얼룩의 크기가 서로 다르고 표시창은 비어 있다">
    ${unit(10, wetStain, "(가) 떨어뜨린 직후")}${unit(182, dryStain, "(나) 시간이 지난 뒤")}
  </svg>`;
}

/** SY 주사기 압축 비교(라이트 2컷) · 입구를 막고 피스톤을 누른 결과 · (가) 공기 크게 눌림 · (나) 물 거의 안 눌림. */
export function syringeFig(): string {
  const unit = (y: number, plungerX: number, inner: string, label: string): string => `
    <g transform="translate(30,${y})">
      <rect x="60" y="6" width="180" height="34" rx="8" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <rect x="240" y="14" width="16" height="18" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
      <rect x="256" y="19" width="10" height="8" rx="3" fill="#8B95A1"/>
      ${inner}
      <rect x="${plungerX}" y="8" width="9" height="30" rx="3" fill="#B7C0CC" stroke="#8B95A1" stroke-width="1.4"/>
      <rect x="${plungerX - 44}" y="19" width="46" height="8" rx="3" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
      <rect x="${plungerX - 56}" y="10" width="12" height="26" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
      <path d="M${plungerX - 78} 23h14M${plungerX - 70} 17l8 6-8 6" stroke="#F04452" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="150" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const airDots = [[172, 16], [196, 24], [184, 32], [212, 15], [222, 30], [206, 23]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#9EC5FB"/>`)
    .join("");
  const waterFill = `<rect x="122" y="8" width="118" height="30" rx="6" fill="#B7D3F2" opacity=".9"/>` +
    [[130, 15], [148, 27], [166, 14], [184, 28], [202, 15], [220, 27], [232, 16], [139, 21], [157, 20], [175, 21], [193, 21], [211, 20]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#6E9EDB"/>`)
      .join("");
  return `<svg viewBox="0 0 344 148" ${NS} fill="none" role="img" aria-label="입구를 막은 주사기 두 개를 같은 힘으로 누른 그림. (가)는 피스톤이 깊이 들어갔고 (나)는 거의 들어가지 않았다">
    ${unit(2, 168, airDots, "(가) 공기")}
    ${unit(78, 118, waterFill, "(나) 물")}
  </svg>`;
}

/** SB 밀폐 용기 상태 변화 전후(라이트) · zip = 지퍼 백(드라이아이스류 · 저울 없음 · 부피 대비) ·
 *  flask = 마개 플라스크+저울(빈 패널 · 질량 대비) · open = 마개 없는 대비판. */
export function sealedPairFig(o: { vessel: "zip" | "flask"; open?: boolean }): string {
  // 라이트 그림용 기체 꼬리(교과서 문법 · 지퍼 백 기체 입자에도 운동 꼬리를 그린다 · 천재 실측 계보).
  const ltail = (x: number, y: number, deg: number, L = 9, w = 2.6): string => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy;
    const py = dx;
    return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${(x - dx * L).toFixed(1)} ${(y - dy * L).toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#9EC5FB" opacity=".4"/>`;
  };
  if (o.vessel === "zip") {
    const flat = `
      <g transform="translate(20,26)">
        <path d="M4 44 Q2 20 14 16 H128 Q140 20 138 44 Q140 62 128 64 H14 Q2 62 4 44z" fill="#F4F8FE" stroke="#8B95A1" stroke-width="2"/>
        <rect x="10" y="10" width="122" height="9" rx="4" fill="#C9D6E8" stroke="#8B95A1" stroke-width="1.4"/>
        <g transform="translate(46,25)">${[...Array(12)].map((_, i) => dotP(7 + (i % 4) * 12.5, 8 + Math.floor(i / 4) * 11.5, 4.2)).join("")}</g>
        <text x="71" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(가) 넣은 직후</text>
      </g>`;
    const puffed = `
      <g transform="translate(186,10)">
        <path d="M6 58 Q-6 26 22 14 H118 Q146 26 134 58 Q146 84 112 92 H28 Q-6 84 6 58z" fill="#F4F8FE" stroke="#8B95A1" stroke-width="2"/>
        <rect x="16" y="6" width="110" height="9" rx="4" fill="#C9D6E8" stroke="#8B95A1" stroke-width="1.4"/>
        ${[[34, 34], [66, 26], [98, 36], [26, 56], [56, 50], [88, 56], [112, 48], [44, 72], [76, 70], [104, 72], [60, 86], [88, 84]].map(([x, y], i) => `${ltail(x, y, (i * 137 + 25) % 360, 8, 2.4)}<circle cx="${x}" cy="${y}" r="3.6" fill="#9EC5FB"/>`).join("")}
        <text x="70" y="118" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(나) 시간이 지난 뒤</text>
      </g>`;
    return `<svg viewBox="0 0 344 140" ${NS} fill="none" role="img" aria-label="꼭 잠근 지퍼 백 두 장면. 하나는 납작하고 안에 고체 조각이 있으며, 다른 하나는 크게 부풀어 있다">${flat}${puffed}</svg>`;
  }
  const flask = (x: number, inner: string, label: string, open?: boolean): string => `
    <g transform="translate(${x},0)">
      ${open ? `<path d="M62 20h16" stroke="#8B95A1" stroke-width="1.8"/>` : `<rect x="60" y="12" width="20" height="12" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>`}
      <path d="M62 24 v16 L40 82 a10 10 0 0 0 9 14 h42 a10 10 0 0 0 9-14 L78 40 v-16" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      ${inner}
      <path d="M50 102h40a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8v-14a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="55" y="108" width="30" height="13" rx="4" fill="#2A3442"/>
      <text x="70" y="152" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const liquid = `<path d="M46 86 L94 86 a7 7 0 0 1 3 9 l-1 3 a8 8 0 0 1-8 5 h-46 a8 8 0 0 1-8-5 l-1-3 a7 7 0 0 1 3-9z" fill="#B7D3F2" opacity=".9" transform="translate(4,0)"/>`;
  const gasDots = [[58, 56], [78, 48], [68, 72], [52, 84], [86, 80], [74, 92]].map(([x, y], i) => `${ltail(x, y, (i * 137 + 60) % 360, 7, 2)}<circle cx="${x}" cy="${y}" r="3" fill="#9EC5FB" opacity=".85"/>`).join("");
  return `<svg viewBox="0 0 344 160" ${NS} fill="none" role="img" aria-label="${o.open ? "마개를 열어 둔" : "마개로 꼭 막은"} 플라스크를 전자저울에 올린 두 장면. 왼쪽은 바닥에 액체가 있고 오른쪽은 액체가 보이지 않는다. 표시창은 비어 있다">
    ${flask(24, liquid, "(가) 가열 전", o.open)}
    ${flask(186, gasDots, "(나) 모두 기체가 된 후", o.open)}
  </svg>`;
}

/** DW 물 + 드라이아이스 비커(라이트) · ㉠ 물속 기포 · ㉡ 비커 바깥 면 물방울 · ㉢ 흘러내리는 흰 김 ·
 *  기호 라벨만 붙이고 정체는 인쇄하지 않는다(판정 과제). */
export function dryiceBeakerFig(): string {
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="물이 든 비커 바닥에 흰 고체 덩어리가 있고, 물속에 둥근 기포가 오르며, 비커 바깥 면에 작은 물방울이 맺혀 있고, 비커 위로 흰 김이 넘쳐 흘러내린다. 세 곳에 기호가 붙어 있다">
    <path d="M116 44 V168 a10 10 0 0 0 10 10 h92 a10 10 0 0 0 10-10 V44" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <line x1="110" y1="44" x2="234" y2="44" stroke="#8B95A1" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="120" y="72" width="104" height="102" rx="7" fill="#DCEBFB"/>
    <path d="M138 160 l16 -8 18 9 16 -9 14 8 v12 h-64z" fill="#F2F7FD" stroke="#B9CBDF" stroke-width="1.6"/>
    <circle cx="150" cy="128" r="7" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <circle cx="182" cy="104" r="5.4" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <circle cx="204" cy="136" r="6.4" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <circle cx="168" cy="84" r="4.6" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <g fill="#9EC5FB"><circle cx="112" cy="96" r="4.2"/><circle cx="111" cy="120" r="3.6"/><circle cx="113" cy="146" r="4"/><circle cx="239" cy="104" r="4"/><circle cx="240" cy="132" r="3.6"/></g>
    <path d="M128 40 Q120 24 138 22 Q142 8 166 12 Q178 2 198 10 Q220 6 224 22 Q240 26 232 40 Q246 52 262 64 Q278 78 270 92 Q286 100 292 114" fill="none" stroke="#C9D4E2" stroke-width="10" stroke-linecap="round" opacity=".75"/>
    <path d="M120 40 Q98 50 84 66 Q70 80 74 96" fill="none" stroke="#C9D4E2" stroke-width="9" stroke-linecap="round" opacity=".7"/>
    <path d="M262 150 L216 136" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="278" cy="154" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="278" y="159" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">㉠</text>
    <path d="M68 168 L108 147" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="54" cy="174" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="54" y="179" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">㉡</text>
    <path d="M296 96 L268 82" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="310" cy="92" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="310" y="97" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">㉢</text>
    <text x="172" y="200" text-anchor="middle" font-size="11" fill="#8B95A1">물이 든 비커 + 흰 고체 덩어리</text>
  </svg>`;
}

/* ── 이하 파일럿 문항 미사용 · PILOT_PREVIEW 부록 데뷔 눈검수용 ── */

/** FCQ 상태 판별 순서도 질문 가림판(라이트) · 첫 질문 = 압축성(인쇄), 두 번째 질문(모양)을 ㉮로 가린다.
 *  e234의 순서도(stateFlowFig · 모양→부피 순)와 위상을 다르게 잡았다: 결론 칸이 인쇄되어도 e234의
 *  빈칸(㉡액체·㉢기체) 자리 대응을 보여 주지 않게(검산 A 유출 적발의 구조적 봉합). */
export function flowQuizFig(): string {
  const ansBox = (x: number, y: number, lab: string): string =>
    `<rect x="${x}" y="${y}" width="84" height="32" rx="10" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.5"/>
     <text x="${x + 42}" y="${y + 21}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#1B64DA">${lab}</text>`;
  const qShape = (cx: number, cy: number, w: number, txt1: string, txt2: string, masked: boolean): string =>
    `<path d="M${cx} ${cy - 30} L${cx + w} ${cy} L${cx} ${cy + 30} L${cx - w} ${cy} Z" fill="${masked ? "#FFF1F0" : "#FFF6E6"}" stroke="${masked ? "#F04452" : "#E8B04B"}" stroke-width="1.5"/>` +
    (masked
      ? `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="15" font-weight="800" fill="#D6173A">㉮</text>`
      : `<text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A5A00">${txt1}</text>
         <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A5A00">${txt2}</text>`);
  const arr = (x1: number, y1: number, x2: number, y2: number): string =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#8B95A1" stroke-width="1.8"/>`;
  return `<svg viewBox="0 0 344 250" ${NS} fill="none" role="img" aria-label="물질의 상태를 나누는 순서도. 첫 질문은 힘을 가할 때 부피가 크게 줄어드는지 묻고, 두 번째 질문 하나가 기호로 가려져 있다">
    <rect x="128" y="6" width="88" height="30" rx="10" fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"/>
    <text x="172" y="26" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">물질</text>
    ${arr(172, 36, 172, 48)}
    ${qShape(172, 78, 118, "힘을 가하면 부피가", "크게 줄어드는가?", false)}
    <text x="298" y="68" font-size="11" font-weight="700" fill="#4E5968">예</text>
    ${arr(290, 78, 314, 78)}${arr(314, 78, 314, 120)}
    ${ansBox(252, 122, "기체")}
    <text x="146" y="124" text-anchor="end" font-size="11" font-weight="700" fill="#4E5968">아니요</text>
    ${arr(172, 108, 172, 128)}
    ${qShape(172, 158, 76, "", "", true)}
    <text x="58" y="150" text-anchor="end" font-size="11" font-weight="700" fill="#4E5968">아니요</text>
    ${arr(96, 158, 64, 158)}${arr(64, 158, 64, 204)}
    ${ansBox(22, 206, "고체")}
    <text x="300" y="190" font-size="11" font-weight="700" fill="#4E5968">예</text>
    ${arr(248, 158, 292, 158)}${arr(292, 158, 292, 204)}
    ${ansBox(250, 206, "액체")}
  </svg>`;
}

/** GA 기체 질량 증거(라이트) · 같은 튜브의 바람 넣기 전/후 + 전자저울(빈 패널). */
export function gasWeighFig(): string {
  const scale = (x: number): string => `
    <path d="M${x} 96h104a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H${x}a8 8 0 0 1-8-8v-18a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
    <rect x="${x + 24}" y="104" width="56" height="14" rx="4" fill="#2A3442"/>`;
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="같은 튜브를 전자저울에 올린 두 장면. 하나는 쭈글쭈글하고 다른 하나는 빵빵하게 부풀어 있다. 표시창은 비어 있다">
    <g transform="translate(18,0)">
      <path d="M28 82 q-10 -18 8 -26 q-6 -16 18 -18 q10 -12 30 -6 q18 -8 26 6 q20 0 16 18 q14 10 2 26 q-46 14 -100 0z" fill="#FBD9CF" stroke="#C97B5F" stroke-width="2"/>
      <circle cx="80" cy="66" r="6" fill="#C97B5F"/>
      ${scale(26)}
      <text x="78" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(가) 바람 넣기 전</text>
    </g>
    <g transform="translate(186,0)">
      <circle cx="76" cy="52" r="42" fill="#FBD9CF" stroke="#C97B5F" stroke-width="2.4"/>
      <circle cx="76" cy="52" r="22" fill="#fff" stroke="#C97B5F" stroke-width="2"/>
      <circle cx="112" cy="66" r="6" fill="#C97B5F"/>
      ${scale(24)}
      <text x="76" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(나) 빵빵하게 넣은 후</text>
    </g>
  </svg>`;
}

/** VE 부피 급증 도식(라이트) · 소량의 액체(또는 고체)가 기체가 되며 훨씬 넓은 공간을 차지한다 ·
 *  입자 개수는 양쪽 같게(12) · 배율 수치는 인쇄하지 않는다. */
export function volumeJumpFig(from: "liquid" | "solid"): string {
  const srcInner = from === "liquid"
    ? `<rect x="12" y="46" width="52" height="24" rx="5" fill="#B7D3F2"/>` + [[20, 52], [30, 60], [40, 51], [50, 60], [58, 52], [26, 66], [46, 66], [56, 64], [18, 60], [36, 55], [52, 55], [42, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#4A7BC0"/>`).join("")
    : `<rect x="18" y="42" width="40" height="30" rx="6" fill="#EAF4FF" stroke="#9DB8D6" stroke-width="1.5"/>` + [[28, 50], [40, 50], [50, 50], [28, 60], [40, 60], [50, 60], [28, 68], [40, 68], [50, 68], [34, 55], [46, 55], [34, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#7FA4CC"/>`).join("");
  const gasDots = [[36, 30], [96, 20], [150, 34], [52, 66], [118, 58], [166, 74], [28, 100], [86, 92], [146, 104], [62, 128], [120, 130], [172, 118]]
    .map(([x, y], i) => {
      const a = (((i * 137 + 45) % 360) * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const px = -dy;
      const py = dx;
      return `<path d="M${(x - px * 2.2).toFixed(1)} ${(y - py * 2.2).toFixed(1)} L${(x - dx * 8).toFixed(1)} ${(y - dy * 8).toFixed(1)} L${(x + px * 2.2).toFixed(1)} ${(y + py * 2.2).toFixed(1)} Z" fill="#7FA4CC" opacity=".35"/><circle cx="${x}" cy="${y}" r="3" fill="#7FA4CC"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 164" ${NS} fill="none" role="img" aria-label="작은 그릇에 담긴 물질이 기체가 되어 훨씬 넓은 점선 상자 공간을 차지하는 그림. 입자의 개수는 양쪽이 같다">
    <g transform="translate(8,44)">
      <path d="M8 40 V64 a8 8 0 0 0 8 8 H60 a8 8 0 0 0 8-8 V40" fill="none" stroke="#8B95A1" stroke-width="2"/>
      ${srcInner}
    </g>
    <path d="M92 84h32" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M118 74l14 10-14 10" fill="none" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(140,8)">
      <rect x="4" y="4" width="192" height="144" rx="14" fill="rgba(158,197,251,.08)" stroke="#9DB8D6" stroke-width="1.8" stroke-dasharray="7 6"/>
      ${gasDots}
    </g>
  </svg>`;
}

/** LD 끓는 물 위 국자 실험(라이트) · 시계 접시 구도 교체판 · (가) 국자 속 얼음물 · (나) 국자 아랫면 물방울. */
export function ladleFig(): string {
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="끓는 물이 든 냄비 위에 얼음물을 담은 국자를 들고 있는 실험 그림. 국자 아랫면에 작은 물방울이 맺혀 있고 두 곳에 기호가 붙어 있다">
    <path d="M84 130h176v44a12 12 0 0 1-12 12H96a12 12 0 0 1-12-12z" fill="#E8EDF3" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="92" y="138" width="160" height="40" rx="8" fill="#DCEBFB"/>
    <path d="M100 142q10 6 20 0t20 0 20 0 20 0 20 0 20 0" stroke="#9DB8D6" stroke-width="2" fill="none"/>
    <circle cx="120" cy="158" r="4.6" fill="#fff" stroke="#9DB8D6" stroke-width="1.4"/>
    <circle cx="176" cy="164" r="5.4" fill="#fff" stroke="#9DB8D6" stroke-width="1.4"/>
    <circle cx="226" cy="156" r="4.2" fill="#fff" stroke="#9DB8D6" stroke-width="1.4"/>
    <g stroke="#C9D4E2" stroke-width="7" stroke-linecap="round" opacity=".8" fill="none">
      <path d="M128 122c-4-10 6-14 2-24M172 120c-4-10 6-14 2-24M216 122c-4-10 6-14 2-24"/>
    </g>
    <path d="M138 64 a34 20 0 0 0 68 0z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M150 64 a22 12 0 0 0 44 0" fill="#DCEBFB"/>
    <path d="M154 60 l10 -7 8 7 9 -6 8 6" stroke="#B9CBDF" stroke-width="2" fill="none"/>
    <path d="M206 60 L292 34" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <rect x="286" y="22" width="34" height="14" rx="6" transform="rotate(-17 286 22)" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
    <g fill="#6FA6E8"><circle cx="152" cy="88" r="3.4"/><circle cx="172" cy="92" r="4"/><circle cx="192" cy="87" r="3.2"/></g>
    <path d="M60 52 L136 60" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="44" cy="50" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="44" y="55" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">(가)</text>
    <path d="M66 100 L150 92" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="50" cy="102" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="50" y="107" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">(나)</text>
    <text x="172" y="204" text-anchor="middle" font-size="11" fill="#8B95A1">(가) 국자 속 얼음물 · (나) 국자 아랫면</text>
  </svg>`;
}

/** WC 겨울 아침 장면 종합(라이트) · ㉠ 유리창 성에 · ㉡ 입김 · ㉢ 빨랫줄의 언 빨래 · 정체 미인쇄. */
export function winterSceneFig(): string {
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="겨울 아침 마당 장면. 유리창에 얼음 결정 무늬, 사람 입 앞의 하얀 김, 빨랫줄에 뻣뻣하게 언 빨래가 있고 세 곳에 기호가 붙어 있다">
    <rect x="20" y="26" width="96" height="120" rx="8" fill="#EAF3FB" stroke="#8B95A1" stroke-width="2"/>
    <line x1="68" y1="26" x2="68" y2="146" stroke="#8B95A1" stroke-width="1.6"/>
    <line x1="20" y1="86" x2="116" y2="86" stroke="#8B95A1" stroke-width="1.6"/>
    <g stroke="#BFDCF2" stroke-width="1.8" fill="none">
      <path d="M28 42l12 12M40 42l-12 12M34 38v20M26 48h16"/>
      <path d="M84 108l14 14M98 108l-14 14M91 104v22M80 115h22"/>
    </g>
    <circle cx="196" cy="76" r="16" fill="#FBE8D8" stroke="#C99B72" stroke-width="1.8"/>
    <path d="M186 96q10 10 20 0" stroke="#C99B72" stroke-width="1.8" fill="none"/>
    <path d="M180 68q-4 4 0 8M212 68q4 4 0 8" stroke="#C99B72" stroke-width="1.6" fill="none"/>
    <path d="M214 84 q16 -4 26 4 q12 -2 16 6" stroke="#D9E2EC" stroke-width="8" stroke-linecap="round" fill="none" opacity=".85"/>
    <path d="M196 92v34l-10 34M196 126l12 34M196 104l-16 8M196 104l18 6" stroke="#C99B72" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M258 60 L338 54" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M268 60 l-3 34 h26 l-3 -35" fill="#F4F7FA" stroke="#9AA6B4" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M304 58 l-2 26 h20 l-2 -27" fill="#F4F7FA" stroke="#9AA6B4" stroke-width="1.8" stroke-linejoin="round"/>
    <g stroke="#C7D6E4" stroke-width="1.2"><path d="M270 70h20M269 80h21M306 68h15M305 76h16"/></g>
    <path d="M56 160 L44 132" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="60" cy="172" r="13" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="60" y="177" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">㉠</text>
    <path d="M232 116 L242 96" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="228" cy="128" r="13" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="228" y="133" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">㉡</text>
    <path d="M296 116 L288 96" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="300" cy="128" r="13" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="300" y="133" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">㉢</text>
  </svg>`;
}

/** LN3 빨래 세 방법 3컷(라이트) · (가) 응달에 뭉쳐 널기 · (나) 양달에 펼쳐 널기 · (다) 양달 펼침+바람.
 *  증발 조건(온도·표면·바람) 판독용 · 확대 217 multi 데뷔. */
export function laundryTrioFig(): string {
  const panel = (x: number, sun: boolean, spread: boolean, wind: boolean, label: string): string => {
    const sky = sun
      ? `<circle cx="88" cy="18" r="9" fill="#FFD25E"/><path d="M88 4v-3M100 8l2-2M104 18h3M76 8l-2-2" stroke="#FFD25E" stroke-width="2" stroke-linecap="round"/>`
      : `<path d="M70 14q6-8 16-6q4-8 14-5q10-2 12 7q8 2 5 9h-44q-6-1-3-5z" fill="#CBD5E1"/>`;
    const line = `<line x1="8" y1="42" x2="102" y2="42" stroke="#8B95A1" stroke-width="2"/>`;
    const clothes = spread
      ? `<path d="M20 42l-3 26h16l-3-26z" fill="#BFDCF2" stroke="#8FA8BE" stroke-width="1.5"/>
         <path d="M48 42l-3 26h16l-3-26z" fill="#F9D9C0" stroke="#C9A183" stroke-width="1.5"/>
         <path d="M76 42l-3 26h16l-3-26z" fill="#CFead2" stroke="#93B897" stroke-width="1.5"/>`
      : `<path d="M38 42l-6 24q14 8 28 0l-6-24z" fill="#BFDCF2" stroke="#8FA8BE" stroke-width="1.5"/>
         <path d="M46 46l-3 18h14l-3-18z" fill="#F9D9C0" stroke="#C9A183" stroke-width="1.5" opacity=".9"/>`;
    const windArt = wind
      ? `<path d="M6 54q8-4 14 0M4 62q10-5 18 0" stroke="#7FB2E5" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : "";
    return `<g transform="translate(${x},4)">
      <rect x="0" y="0" width="110" height="78" rx="10" fill="#F7FAFD" stroke="#DCE3EA" stroke-width="1.4"/>
      ${sky}${line}${clothes}${windArt}
      <text x="55" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 110" ${NS} fill="none" role="img" aria-label="같은 빨래를 세 가지 방법으로 널어 말리는 그림. 응달에 뭉쳐 넌 것, 햇볕에 펼쳐 넌 것, 햇볕에 펼치고 바람까지 부는 것">
    ${panel(6, false, false, false, "(가)")}
    ${panel(118, true, true, false, "(나)")}
    ${panel(230, true, true, true, "(다)")}
  </svg>`;
}

/** WT 물의 세 가지 상태(라이트 3컷) · (가) 얼음 · (나) 물 · (다) 수증기(눈에 보이지 않음 표기) ·
 *  이름 라벨을 인쇄하므로 명명 문항 금지 · 성질·공통점 판정 전용(확대 246 데뷔). */
export function waterThreeFig(): string {
  const panel = (x: number, art: string, label: string): string => `
    <g transform="translate(${x},4)">
      <rect x="0" y="0" width="104" height="86" rx="10" fill="#F7FAFD" stroke="#DCE3EA" stroke-width="1.4"/>
      ${art}
      <text x="52" y="106" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const ice = `<g transform="translate(26,22)">
    <path d="M8 14 L30 6 L52 14 L52 34 L30 44 L8 34 Z" fill="#EAF4FF" stroke="#9DB8D6" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 14 L30 22 L52 14 M30 22 V44" stroke="#C4DCEF" stroke-width="1.6" fill="none"/>
  </g>`;
  const water = `<g transform="translate(28,14)">
    <path d="M6 8 V52 a8 8 0 0 0 8 8 h20 a8 8 0 0 0 8-8 V8" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
    <rect x="9" y="22" width="30" height="35" rx="5" fill="#B7D3F2"/>
  </g>`;
  // (다) 주둥이 앞은 빈 점선 원만 · "안 보인다"를 글자로 선언하면 타 문항(김 판정)의 열쇠가
  // 인쇄되는 유출(검산 A 적발)이라, 시각(빈 원)으로만 전한다.
  const steam = `<g transform="translate(10,10)">
    <path d="M14 52 a20 12 0 0 1 40 0 l4 8 H10z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M50 46 L64 38 l6 4 -10 8z" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
    <circle cx="76" cy="30" r="15" fill="none" stroke="#9DB8D6" stroke-width="1.5" stroke-dasharray="4 3"/>
  </g>`;
  return `<svg viewBox="0 0 344 116" ${NS} fill="none" role="img" aria-label="물의 세 가지 상태 그림. 얼음, 물, 그리고 끓는 주전자 주둥이 앞의 점선 원">
    ${panel(6, ice, "(가) 얼음")}
    ${panel(120, water, "(나) 물")}
    ${panel(234, steam, "(다) 수증기")}
  </svg>`;
}

/** PR 옮겨 담기 착시(라이트) · 좁고 긴 컵의 주스를 넓은 대접에 남김없이 옮긴 두 장면(높이 대비). */
export function pourFig(): string {
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="좁고 긴 컵에 높이 담긴 주스를 넓은 대접에 남김없이 옮겨 담은 두 장면. 대접에서는 낮게 깔려 있다">
    <g transform="translate(58,8)">
      <path d="M8 6 V104 a8 8 0 0 0 8 8 h28 a8 8 0 0 0 8-8 V6" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <rect x="11" y="30" width="38" height="79" rx="5" fill="#FBD46B" opacity=".85"/>
      <text x="30" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(가)</text>
    </g>
    <path d="M152 76h28" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M174 66l14 10-14 10" fill="none" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(200,42)">
      <path d="M2 24 a62 34 0 0 0 124 0 v-12 H2z" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <path d="M8 26 a56 26 0 0 0 112 0 v-4 H8z" fill="#FBD46B" opacity=".85"/>
      <ellipse cx="64" cy="20" rx="56" ry="9" fill="#FFE9A8" opacity=".9"/>
      <text x="64" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(나)</text>
    </g>
  </svg>`;
}

/** IC 얼음 띄운 컵 단면(라이트) · 얼음의 일부가 수면 위로 나와 떠 있는 관찰 그림. */
export function iceCupFig(): string {
  return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="물이 든 유리컵 단면. 얼음 조각이 물에 떠 있고 일부가 수면 위로 나와 있다">
    <path d="M122 20 V116 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10-10 V20" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <rect x="126" y="52" width="92" height="70" rx="7" fill="#DCEBFB"/>
    <line x1="126" y1="52" x2="218" y2="52" stroke="#9DB8D6" stroke-width="1.8"/>
    <path d="M150 34 l40 -6 14 22 -6 24 -40 6 -14 -22z" fill="#F2F9FF" stroke="#9DB8D6" stroke-width="2"/>
    <path d="M150 34 l14 22M204 50 l-6 24" stroke="#C4DCEF" stroke-width="1.6"/>
    <text x="172" y="146" text-anchor="middle" font-size="11" fill="#8B95A1">물에 뜬 얼음</text>
  </svg>`;
}

export const POOL_U4V2_PILOT: ExamItem[] = [
  // [201] d1 무① · 확산 정의 판별. 검산: 확산 = 입자가 스스로 운동해 퍼짐(상태 변화 아님 · 외력 불요).
  {
    id: "u4e201",
    lessonId: "u4l1",
    type: "mcq",
    prompt: "<b>확산</b>이 어떤 현상인지 옳게 설명한 것은?",
    options: [
      "물질을 이루는 입자가 스스로 운동하여 사방으로 퍼져 나가는 현상",
      "액체 표면에서 입자가 기체로 변해 날아가는 현상",
      "바람과 같은 외부의 힘이 물질을 밀어서 옮기는 현상",
      "고체가 열을 받아 녹으면서 액체로 변하는 현상",
      "물질을 이루는 입자가 점점 작게 쪼개지는 현상",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>확산의 두 열쇠말은 <b>스스로 운동</b>과 <b>퍼져 나감</b>이에요. 물질을 이루는 입자는 한순간도 쉬지 않고 스스로 움직이기 때문에, 아무도 건드리지 않아도 사방으로 퍼져 나가요. 상태가 바뀌는 것이 아니라 입자가 자리를 넓혀 가는 현상이라는 점이 중요하죠.<span class='xh'>오답 하나씩 격파</span>'액체 표면에서 기체로'는 증발의 설명이라 확산과 다른 현상이에요. '외부의 힘이 밀어서'는 확산의 핵심을 정반대로 뒤집은 것 ✓ 확산은 바람 한 점 없어도 일어나요. '고체가 녹는 것'은 융해라는 상태 변화고, '입자가 쪼개진다'면 다른 물질이 되는 것이라 확산은 물론 상태 변화도 아니랍니다.",
    core: "확산 = 입자가 <b>스스로 운동</b>해 퍼져 나가는 현상. 상태 변화가 아니에요!",
  },
  // [202] d1 DF(time) · 3컷 시간 순 판독. 검산: (가) 바닥 방울 → (나) 번짐 → (다) 전체 균일 · 젓지 않음.
  {
    id: "u4e202",
    lessonId: "u4l1",
    type: "mcq",
    prompt: "그림은 물이 든 비커 바닥에 파란 색소 한 방울을 가만히 떨어뜨린 뒤, 시간 순서대로 관찰한 모습이에요. 이에 대한 설명으로 옳은 것은?",
    figure: diffuseSeqFig("time"),
    options: [
      "시간이 지나면 색소 입자가 물 전체에 골고루 퍼진다",
      "저어 주지 않았으므로 색소는 (가)의 모습 그대로 남는다",
      "색소 입자 하나하나가 점점 커져서 퍼진 것처럼 보인다",
      "(다)에서 색소 입자는 더 이상 움직이지 않는다",
      "색소 입자가 물 입자로 변하면서 색이 옅어진다",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그림을 순서대로 읽으면, 바닥에 가라앉아 있던 색소가 (나)에서 물속으로 번지고 (다)에서는 물 전체가 고르게 물들어요. 아무도 젓지 않았는데 이렇게 되는 까닭은 색소 입자와 물 입자가 <b>스스로 끊임없이 운동</b>하기 때문이에요. 이것이 확산이죠.<span class='xh'>오답 하나씩 격파</span>'(가) 그대로 남는다'는 그림의 (나)(다)와 정면으로 어긋나요. '입자가 커진다'는 오개념이에요 ✓ 퍼진 것은 입자의 크기가 아니라 입자들의 <b>자리</b>예요. '(다)에서 운동을 멈춘다'도 틀려요. 고르게 퍼진 뒤에도 입자는 계속 움직이고 있어요. '물 입자로 변한다'면 색소가 사라져야 하는데, 물 전체가 파랗게 물든 것은 색소 입자가 그대로 있다는 증거랍니다.",
    core: "젓지 않아도 퍼진다 = 입자의 자발적 운동. 다 퍼진 뒤에도 운동은 계속!",
  },
  // [206] d2 사진 squid · 증발 조건 판독 bogi(사진 의존: 펼침·바닷가·맑은 하늘). 정답 ㄱㄴㄷ 전부(천재 패턴).
  {
    id: "u4e206",
    lessonId: "u4l1",
    type: "mcq",
    prompt: "사진은 바닷가 건조대에서 오징어를 말리는 모습이에요. <b>사진에서 확인할 수 있는</b>, 오징어의 물이 빨리 날아가게 돕는 조건을 <b>보기</b>에서 모두 고른 것은?",
    figure: ximg("squid-dry.webp", "맑은 하늘 아래 바닷가 건조대에 오징어를 한 마리씩 펼쳐 널어 놓은 모습"),
    bogi: [
      "맑은 날 햇볕 아래에 널어 온도가 높다.",
      "바닷가라 바람이 잘 통하는 곳이다.",
      "오징어를 겹치지 않게 펼쳐 널었다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ ✓ 사진 속 하늘이 맑고 볕이 잘 들어요. 온도가 높을수록 물 입자의 운동이 활발해져 증발이 빨라지죠. ㄴ ✓ 배경이 바다예요. 바람은 오징어 표면에서 막 날아오른 물 입자를 계속 치워 주어 증발이 이어지게 해요. ㄷ ✓ 오징어가 한 마리씩 펼쳐져 있어요. 펼칠수록 물이 날아갈 수 있는 <b>표면이 넓어져요</b>. 세 가지가 모두 확인되니 답은 ㄱ, ㄴ, ㄷ이에요.<span class='xh'>정리해요</span>증발을 빠르게 하는 세 가지 조건, 즉 높은 온도·잘 통하는 바람·넓은 표면이 이 사진 한 장에 다 들어 있어요. 오래전부터 내려온 건조대의 위치와 너는 방법이 사실은 과학이었던 셈이죠.",
    core: "증발의 3조건 = 온도·바람·표면. 건조대 사진 한 장에 셋이 다 있어요!",
  },
  // [208] d2 OB · 열린 계 저울 (가)(나). 검산: 열린 접시 → 시료가 기체로 이탈 → 저울 위 질량 감소.
  {
    id: "u4e208",
    lessonId: "u4l1",
    type: "mcq",
    prompt: "전자저울 위 접시의 거름종이에 매니큐어 지우는 용액을 몇 방울 떨어뜨렸어요. (가)는 직후, (나)는 시간이 한참 지난 뒤의 모습이에요. 이에 대한 설명으로 옳은 것은?",
    figure: openScaleFig(),
    options: [
      "저울의 눈금은 (가)보다 (나)에서 작다",
      "용액 입자가 없어지지 않으므로 눈금은 변하지 않는다",
      "공기 중의 입자가 달라붙어 눈금이 점점 커진다",
      "거름종이가 용액을 빨아들여 점점 무거워진다",
      "용액 입자가 완전히 사라져 세상에서 없어진다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>거름종이에 스민 용액은 표면에서 <b>증발</b>해요. 기체가 된 입자들이 접시를 떠나 공기 중으로 날아가니, 저울 위에 남은 물질의 양은 줄어들어 눈금이 (나)에서 더 작아요. 그림의 얼룩이 옅어진 것도 그 증거죠.<span class='xh'>오답 하나씩 격파</span>'입자가 없어지지 않으니 눈금 그대로'가 가장 그럴듯한 함정이에요 ✓ 입자는 없어지지 않은 게 맞지만, <b>저울 위를 떠나</b> 공기 중으로 갔어요. 저울은 자기 위에 있는 것만 잴 수 있죠. 날아간 입자까지 모두 모아 잰다면 처음과 같겠지만, 이 저울의 눈금은 줄어요. '달라붙어 커진다'와 '빨아들여 무거워진다'는 근거 없는 상상이고, '완전히 사라진다'는 입자가 생기지도 없어지지도 않는다는 대원칙에 어긋나요.",
    core: "열린 접시의 증발 = 저울 눈금 감소. 입자는 사라진 게 아니라 떠난 것!",
  },
  // [212] d2 multi(5지·정답 2) · 입자 운동 증거(외력 배제). 검산: 디퓨저 확산 ✓ · 꽃병 증발 ✓ · 리본(바람)·낙엽(바람)·청소기(흡입) = 외력 ✗.
  {
    id: "u4e212",
    lessonId: "u4l1",
    type: "multi",
    prompt: "물질을 이루는 입자가 <b>스스로 운동한다</b>는 증거가 되는 현상을 <b>모두</b> 고르세요.",
    options: [
      "방에 놓아둔 디퓨저의 향이 집 안 가득 퍼진다",
      "꽃병의 물이 며칠 사이 조금씩 줄어든다",
      "선풍기 바람에 책상 위 리본이 펄럭인다",
      "청소기가 바닥의 먼지를 빨아들인다",
      "가을바람에 낙엽이 데굴데굴 굴러간다",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>디퓨저의 향이 퍼지는 것은 <b>확산</b>, 꽃병의 물이 줄어드는 것은 <b>증발</b>이에요. 둘 다 아무도 건드리지 않았는데 저절로 일어났으니, 입자가 스스로 운동한다는 증거가 되죠.<span class='xh'>오답 격파</span>리본과 낙엽은 <b>바람이라는 외부의 힘</b>이, 먼지는 <b>청소기의 흡입력</b>이 밀고 당겨서 움직인 거예요. 눈에는 똑같이 '움직임'으로 보여도, 스스로 움직인 게 아니면 입자 운동의 증거가 될 수 없어요. 증거 문제의 판별 기준은 딱 하나, <b>외부의 도움 없이 저절로 일어났는가</b>예요. 바람·젓기·빨아들이기가 끼어든 현상은 아무리 그럴듯해도 후보에서 지워야 한답니다.",
    core: "증거의 자격 = '저절로'. 바람·청소기가 움직인 것은 증거가 아니에요!",
  },
  // [216] d3 dbox 지문 · 새 가구 냄새와 환기(비상 새집 증후군 계보 · 소재 교체). 검산: 온도↑ = 운동 활발 = 기화·확산 빨라짐.
  {
    id: "u4e216",
    lessonId: "u4l1",
    type: "mcq",
    prompt: "다음은 어느 교실의 이야기예요. 이에 대한 설명으로 가장 옳은 것은?",
    figure: dbox([
      ["상황", "새 학기를 앞두고 교실에 새 책상과 사물함이 들어오자 특유의 냄새가 났어요."],
      ["안내", "선생님은 당분간 창문을 자주 열어 환기하자고 했어요. 특히 난방으로 교실이 따뜻할수록 냄새 물질이 더 빨리 나오니, 따뜻한 날일수록 환기가 중요하다고 했죠."],
    ]),
    options: [
      "따뜻할수록 입자의 운동이 활발해져, 냄새 물질이 더 빨리 나오고 더 빨리 퍼진다",
      "환기를 하면 교실에 있던 냄새 입자가 그 자리에서 사라져 없어진다",
      "냄새가 교실 전체로 퍼지는 것은 공기가 냄새를 빨아들였다가 내뿜기 때문이다",
      "난방을 하면 입자의 운동이 둔해져서 냄새가 잘 나지 않게 된다",
      "창문을 닫아 두면 냄새 입자가 스스로 움직임을 멈춘다",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>가구 속 냄새 물질은 기체가 되어 나온 뒤(기화) 스스로 운동하며 교실 전체로 퍼져요(확산). 온도가 높을수록 입자 운동이 활발해지니, 따뜻한 교실에서는 냄새 물질이 <b>더 빨리 나오고 더 빨리 퍼지죠</b>. 그래서 난방하는 날일수록 자주 환기해 밖으로 내보내야 해요.<span class='xh'>오답 하나씩 격파</span>'환기하면 입자가 사라진다'는 틀려요 ✓ 입자는 없어지는 게 아니라 <b>바깥 공기로 옮겨 갈</b> 뿐이에요. '공기가 빨아들였다 내뿜는다'는 공기를 살아 있는 것처럼 본 설명이고, '난방하면 운동이 둔해진다'는 온도와 입자 운동의 관계를 거꾸로 뒤집었어요. '창문을 닫으면 입자가 멈춘다'도 틀려요. 입자는 갇혀 있을 뿐 끊임없이 움직인답니다.",
    core: "온도 높음 = 입자 운동 활발 = 기화도 확산도 빨라짐. 환기는 입자를 내보내는 것!",
  },
  // [218] d2 무③ · 기화 → 확산 이어달리기(페인트 소재 · 구 향수 회피). 검산: ㉠ 액체가 마름 = 증발(기화) · ㉡ 퍼짐 = 확산.
  {
    id: "u4e218",
    lessonId: "u4l1",
    type: "mcq",
    prompt: "복도 벽에 페인트를 새로 칠했어요. ㉠ <b>벽의 페인트가 점점 말라 갔고</b>, 잠시 후 ㉡ <b>복도 끝 교실에서도 페인트 냄새가 났어요</b>. ㉠과 ㉡에서 일어난 현상을 차례대로 옳게 짝 지은 것은?",
    options: [
      "증발, 확산",
      "확산, 증발",
      "증발, 액화",
      "융해, 확산",
      "확산, 응고",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>두 장면을 나눠 봐요.<br>① ㉠ 벽의 액체 성분이 표면에서 기체로 변해 날아가며 페인트가 말랐어요. 이것이 <b>증발</b>이에요.<br>② ㉡ 기체가 된 냄새 입자가 스스로 운동해 복도 끝까지 퍼졌어요. 이것이 <b>확산</b>이죠.<br>먼저 기체가 되고, 그다음 퍼져 나가는 이어달리기예요.<span class='xh'>오답 하나씩 격파</span>'확산, 증발'은 순서를 뒤집은 함정이에요 ✓ 액체 상태로는 멀리 못 가요. 기체가 되어야 퍼질 수 있으니 증발이 먼저죠. '액화'는 기체가 액체로 돌아오는 반대 방향이고, '융해'는 고체가 녹는 변화, '응고'는 액체가 굳는 변화라서 마르고 퍼지는 이 장면에는 등장하지 않아요.",
    core: "마름(증발) 먼저, 퍼짐(확산)은 그다음 · 기체가 되어야 멀리 가요!",
  },
  // [228] d1 PT3 · 상태 대응 짝. 검산: PT3 order 액체·기체·고체 → (가) 붙은 불규칙 = 액체 · (나) 흩어짐 = 기체 · (다) 격자 = 고체.
  {
    id: "u4e228",
    lessonId: "u4l2",
    type: "mcq",
    prompt: "그림 (가)~(다)는 물질의 세 가지 상태를 입자 모형으로 나타낸 거예요. (가)~(다)에 해당하는 상태를 옳게 짝 지은 것은?",
    figure: stateTrioParamFig(["liquid", "gas", "solid"]),
    figureDark: true,
    options: [
      "(가) 액체, (나) 기체, (다) 고체",
      "(가) 고체, (나) 기체, (다) 액체",
      "(가) 액체, (나) 고체, (다) 기체",
      "(가) 기체, (나) 액체, (다) 고체",
      "(가) 고체, (나) 액체, (다) 기체",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>모형은 입자의 배열과 간격으로 읽어요. (가)는 입자들이 서로 붙어 있지만 줄이 <b>불규칙</b>하니 액체, (나)는 입자 사이가 멀고 뿔뿔이 흩어져 날아다니니 <b>기체</b>, (다)는 매우 가까이 <b>규칙적으로</b> 줄지어 있으니 고체예요.<span class='xh'>오답 하나씩 격파</span>(가)를 고체로 본 조합은 '붙어 있음'만 보고 배열의 규칙성을 안 본 거예요 ✓ 고체와 액체는 둘 다 입자가 가까이 있지만, <b>줄이 반듯한가 흐트러졌는가</b>로 갈려요. (다)를 기체로 본 조합은 그림과 정반대고, (나)를 액체나 고체로 본 조합은 '입자 사이가 텅 비다시피 먼' 기체의 가장 뚜렷한 특징을 놓친 거랍니다.",
    core: "모형 판독 순서: 간격 멀면 기체, 가까우면 규칙(고체)·불규칙(액체)!",
  },
  // [231] d2 SM(solid) · 고체 모형 → 성질 연결. 검산: 격자 = 고체 = 모양·부피 일정.
  {
    id: "u4e231",
    lessonId: "u4l2",
    type: "mcq",
    prompt: "그림은 어떤 상태의 입자 모형이에요. 이 상태에 있는 물질의 성질로 옳은 것은?",
    figure: stateSingleFig("solid"),
    figureDark: true,
    options: [
      "담는 그릇이 달라져도 모양과 부피가 변하지 않는다",
      "담는 그릇에 따라 모양이 변하고 부피는 일정하다",
      "담는 그릇에 따라 모양과 부피가 모두 변한다",
      "손으로 눌러서 부피를 크게 줄일 수 있다",
      "일정한 모양 없이 흘러서 담는 그릇을 채운다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>모형 속 입자들은 매우 가까이에서 <b>규칙적으로</b> 줄지어 있어요. 이런 배열은 고체예요. 모든 입자가 이웃을 단단히 붙잡은 채 제자리에서 진동만 하니, 그릇을 바꿔도 전체 모양과 차지하는 공간이 그대로 유지되죠.<span class='xh'>오답 하나씩 격파</span>'모양만 변한다'는 액체의 성질이에요 ✓ 액체 모형이라면 배열이 흐트러져 있어야 해요. '모양과 부피가 모두 변한다'와 '눌러서 부피를 줄인다'는 기체의 성질이고요. 기체 모형은 입자 사이가 텅 비다시피 멀죠. '흘러서 그릇을 채운다'는 입자들이 자리를 바꿀 수 있어야 가능한데, 그림처럼 반듯하게 줄지은 입자들은 자리를 바꾸지 못한답니다.",
    core: "규칙적 배열 판독 = 고체 = 모양·부피 모두 일정. 배열이 성질을 정해요!",
  },
  // [234] d2 FC 재사용 · 순서도 ㉡㉢(구 e27 ㉠㉢ 축 회피). 검산: 모양 변함·부피 불변 = 액체(㉡) · 모양·부피 다 변함 = 기체(㉢).
  {
    id: "u4e234",
    lessonId: "u4l2",
    type: "mcq",
    prompt: "그림은 물질의 상태를 나누는 순서도예요. 결론 칸 <b>㉡</b>과 <b>㉢</b>에 들어갈 상태를 옳게 짝 지은 것은?",
    figure: stateFlowFig(),
    options: [
      "㉡ 고체, ㉢ 기체",
      "㉡ 액체, ㉢ 기체",
      "㉡ 액체, ㉢ 고체",
      "㉡ 기체, ㉢ 액체",
      "㉡ 고체, ㉢ 액체",
    ],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>순서도를 따라가요.<br>① 첫 질문 '그릇에 따라 모양이 변하는가?'에서 '예'로 내려온 물질만 두 번째 질문을 받아요.<br>② '부피도 변하는가?'에서 <b>아니요</b>라면, 모양만 그릇을 따라가는 <b>액체</b>가 ㉡이에요.<br>③ <b>예</b>라면 모양도 부피도 그릇을 따라가는 <b>기체</b>가 ㉢이죠.<br>남은 ㉠에는 모양이 변하지 않는 고체가 들어가요.<span class='xh'>오답 하나씩 격파</span>㉡에 고체를 넣은 조합은 첫 질문을 놓친 거예요 ✓ 고체는 모양이 변하지 않아 이미 '아니요' 갈래(㉠)로 빠졌어요. ㉢에 액체나 고체를 넣은 조합은 두 번째 질문과 어긋나요. 부피까지 그릇을 따라가는 상태는 기체 하나뿐이랍니다.",
    core: "㉡ = 모양만 변함(액체), ㉢ = 모양·부피 다 변함(기체). 질문 순서대로!",
  },
  // [238] d2 SY · 주사기 압축 판독. 검산: 공기(기체) = 빈 공간 많음 → 크게 눌림 · 물(액체) = 입자 맞닿음 → 거의 안 눌림.
  {
    id: "u4e238",
    lessonId: "u4l2",
    type: "mcq",
    prompt: "주사기 두 개에 각각 공기와 물을 넣고 입구를 막은 채 같은 힘으로 피스톤을 눌렀더니 그림과 같이 되었어요. 이에 대한 설명으로 옳은 것은?",
    figure: syringeFig(),
    options: [
      "(가)에서는 입자 사이의 빈 공간이 줄어들어 부피가 크게 작아졌다",
      "(나)의 물 입자들은 서로 멀리 떨어져 있어서 눌리지 않았다",
      "(가)의 공기 입자 하나하나가 눌려서 작게 찌그러졌다",
      "(나)도 더 세게 누르면 부피가 절반으로 줄어든다",
      "두 주사기의 차이는 입자의 무게 차이 때문이다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>기체인 공기는 입자 사이가 텅 비다시피 멀어요. 피스톤을 누르면 그 <b>빈 공간이 줄어들면서</b> 부피가 확 작아지죠. 그래서 (가)의 피스톤만 깊이 들어갔어요.<span class='xh'>오답 하나씩 격파</span>'(나)의 물 입자가 멀리 떨어져 있다'는 사실이 정반대예요 ✓ 물 입자들은 이미 <b>서로 맞닿아 있어서</b> 밀어 넣을 틈이 거의 없고, 그래서 눌리지 않은 거예요. '입자가 찌그러졌다'는 오개념이에요. 눌려서 변한 것은 입자가 아니라 입자 <b>사이의 거리</b>죠. '(나)도 세게 누르면 절반'은 빈틈이 없는 액체에서는 불가능하고, '입자의 무게 차이'는 눌림과 관계없는 엉뚱한 기준이랍니다.",
    core: "눌리는 건 입자가 아니라 입자 사이 <b>빈 공간</b> · 기체에만 넉넉해요!",
  },
  // [243] d2 multi(5지·정답 2) · 기체 성질. 검산: 빈 병에도 공기 ✓ · 공간 가득 채움 ✓ / 부피 일정 ✗ · 단단히 붙잡음 ✗ · 규칙 배열 ✗.
  {
    id: "u4e243",
    lessonId: "u4l2",
    type: "multi",
    prompt: "<b>기체</b>에 대한 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "뚜껑을 연 빈 유리병 속에도 공기 입자가 들어 있다",
      "기체 입자는 주어진 공간을 구석구석 채운다",
      "기체는 담는 그릇이 달라져도 부피가 변하지 않는다",
      "기체 입자들은 서로 단단히 붙잡은 채 움직인다",
      "기체 입자들은 규칙적으로 줄지어 배열되어 있다",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>'비어 있다'고 부르는 병 속에도 공기 입자가 가득 날아다녀요. 눈에 안 보일 뿐이죠. 그리고 기체 입자는 서로 거의 붙잡지 않고 사방으로 빠르게 움직여서, 주어진 공간이 어떤 모양이든 구석까지 채워요. 두 설명이 옳아요.<span class='xh'>오답 격파</span>'부피가 변하지 않는다'는 액체의 성질을 기체에 잘못 씌운 거예요 ✓ 기체는 작은 통에 가두면 그만큼으로 줄고, 넓은 방에 풀면 방 전체로 퍼지는, <b>부피까지 그릇이 정하는</b> 유일한 상태예요. '서로 단단히 붙잡는다'는 고체와 액체의 이야기죠. 기체 입자는 붙잡는 힘이 거의 없어 자유롭게 날아다녀요. '규칙적으로 줄지어 배열'은 고체만의 특징이라 기체와는 정반대랍니다.",
    core: "기체 = 눈에 안 보여도 어디에나, 부피마저 그릇을 따라가는 상태!",
  },
  // [247] d2 SM(gas) · 기체 모형 → 행동 예측. 검산: 흩어짐+궤적 = 기체 → 더 큰 그릇이면 전체로 퍼짐.
  {
    id: "u4e247",
    lessonId: "u4l2",
    type: "mcq",
    prompt: "그림은 어떤 상태의 입자 모형이에요. 이 상태의 물질을 <b>더 큰 그릇</b>으로 옮기면 입자들은 어떻게 될까요?",
    figure: stateSingleFig("gas"),
    figureDark: true,
    options: [
      "스스로 움직여 새 그릇의 구석구석까지 퍼진다",
      "원래 차지하던 만큼의 공간에만 모여 있는다",
      "그릇 바닥에 가라앉아 차곡차곡 쌓인다",
      "서로 붙어 한 덩어리가 된 채 흘러 다닌다",
      "새 그릇에 옮기는 순간 운동을 멈춘다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>모형 속 입자들은 사이가 멀고 저마다 다른 방향으로 날아다니고 있어요. 기체죠. 기체 입자는 서로 거의 붙잡지 않고 빠르게 움직이므로, 더 큰 그릇에 옮기면 <b>그릇 전체로 퍼져 구석까지</b> 채워요. 그래서 기체는 부피가 그릇을 따라 변하죠.<span class='xh'>오답 하나씩 격파</span>'원래 공간에만 모여 있는다'는 기체가 스스로 퍼진다는 사실과 어긋나요 ✓ 붙잡는 힘이 거의 없으니 흩어질 수밖에 없어요. '바닥에 쌓인다'는 고체 알갱이의 모습이고, '붙어서 흘러 다닌다'는 액체의 모습이에요. '운동을 멈춘다'는 어떤 상황에서도 일어나지 않아요. 입자는 언제나 움직이고 있답니다.",
    core: "기체 모형의 미래 = 새 공간 전체로 확산. 부피가 그릇을 따라가는 이유!",
  },
  // [252] d3 dbox · 막대 풍선 응용. 검산: 기체 = 스스로 사방 운동 → 공간 구석까지 채움(입으로 민 것 아님).
  {
    id: "u4e252",
    lessonId: "u4l2",
    type: "mcq",
    prompt: "긴 막대 풍선에 대한 다음 관찰을 옳게 설명한 것은?",
    figure: dbox([
      ["관찰", "길고 구불구불한 막대 풍선을 불었더니, 공기를 입구에서만 넣는데도 구불구불한 끝부분까지 빠짐없이 팽팽해졌어요."],
    ]),
    options: [
      "기체 입자가 스스로 사방으로 움직여 풍선 속 공간을 구석까지 채우기 때문이다",
      "입으로 분 바람의 힘이 입자를 끝까지 밀어붙여 그 자리에 고정하기 때문이다",
      "공기가 풍선 속에서 액체로 변해 구석까지 흘러가기 때문이다",
      "풍선 고무가 공기 입자를 빨아들이기 때문이다",
      "공기 입자가 점점 커지면서 풍선 속을 메우기 때문이다",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>입구로 들어간 공기 입자들은 그 자리에 머무르지 않아요. 기체 입자는 서로 거의 붙잡지 않고 <b>스스로 사방으로 빠르게 움직이기</b> 때문에, 아무리 길고 구불구불한 공간이라도 구석구석 퍼져 채워요. 그래서 끝부분까지 팽팽해지죠.<span class='xh'>오답 하나씩 격파</span>'바람의 힘이 밀어붙여 고정한다'가 가장 그럴듯한 함정이에요 ✓ 바람은 입자를 안으로 들여보낼 뿐, 들어간 뒤의 입자는 <b>제 운동으로</b> 퍼져요. 밀려서 갔다면 입으로 불기를 멈추는 순간 되돌아와야겠죠. '액체로 변해 흐른다'면 풍선 속에 물이 고여야 하고, '고무가 빨아들인다'는 근거가 없어요. '입자가 커진다'는 오개념이에요. 입자의 크기는 어떤 상황에서도 변하지 않아요.",
    core: "풍선 끝까지 채우는 힘 = 기체 입자의 자발적 운동. 밀어서가 아니에요!",
  },
  // [255] d1 TRI · (라) 이름 판독. 검산: TRI 고정 배정 (라) = 기체(위) → 액체(우하) = 액화. 라벨형 shuffle:false · 정답 넷째 칸.
  {
    id: "u4e255",
    lessonId: "u4l3",
    type: "mcq",
    prompt: "그림은 물질의 세 가지 상태 사이의 변화를 화살표 (가)~(바)로 나타낸 거예요. 화살표 <b>(라)</b>가 나타내는 상태 변화의 이름은?",
    figure: phaseTriModelFig(),
    options: ["융해", "응고", "기화", "액화", "승화"],
    answer: 3,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 각 원판의 상태부터 읽어요. 위 원판은 입자가 흩어져 있으니 <b>기체</b>, 왼쪽 아래는 규칙적인 배열이니 <b>고체</b>, 오른쪽 아래는 붙은 채 불규칙하니 <b>액체</b>예요. (라)는 기체에서 액체로 내려가는 화살표이므로, 이름은 <b>액화</b>죠.<span class='xh'>오답 하나씩 격파</span>'기화'를 골랐다면 화살표를 거꾸로 읽은 거예요 ✓ 액체에서 기체로 올라가는 것은 (다)예요. 도착한 상태가 이름이 된다는 것, 즉 액체가 되면 액화·기체가 되면 기화라고 기억하면 안 헷갈려요. '융해'(가)와 '응고'(나)는 고체와 액체 사이의 변화고, '승화'는 액체 원판을 거치지 않는 (마)·(바)의 이름이랍니다.",
    core: "모형 판독 → 화살표 방향 → 이름. 도착 상태가 이름을 정해요(기→액 = 액화)!",
  },
  // [258] d1 무② · 이름-예 짝(천2 구조 · 소재 신작). 검산: 아이스팩 융해 ✓ / 컵 얼음 녹음 = 융해(응고 아님) · 성에 = 승화(기화 아님) · 논바닥 = 기화(액화 아님) · 끓어 넘침 = 기화(승화 아님).
  {
    id: "u4e258",
    lessonId: "u4l3",
    type: "mcq",
    prompt: "상태 변화의 이름과 그 예를 옳게 짝 지은 것은?",
    options: [
      "융해 · 꽁꽁 얼어 있던 아이스팩이 실온에서 말랑해졌다",
      "응고 · 컵에 든 얼음이 녹아서 물이 되었다",
      "기화 · 겨울 새벽 유리창 안쪽에 성에가 생겼다",
      "액화 · 가뭄이 이어지자 논바닥이 말라 갈라졌다",
      "승화 · 냄비의 국물이 끓어서 넘쳤다",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>얼어 있던 아이스팩이 말랑해진 것은 속의 고체가 <b>녹아 액체가 된</b> 것이니 융해가 맞는 짝이에요.<span class='xh'>오답 하나씩 격파</span>얼음이 녹아 물이 되는 것은 융해인데 응고라고 붙였으니 방향이 정반대예요 ✓ 응고는 액체가 굳는 변화죠. 유리창 안쪽 성에는 수증기가 물을 거치지 않고 곧장 얼어붙은 <b>승화</b>인데 기화라고 붙였고, 논바닥이 마르는 것은 물이 기체로 날아간 <b>기화</b>인데 액화라고 붙였어요. 국물이 끓어 넘치며 줄어드는 것도 기화라서 승화가 아니에요. 짝짓기 문제는 예시를 '출발 상태 → 도착 상태' 화살표로 번역한 뒤 이름과 대조하면 함정이 전부 걸러진답니다.",
    core: "예시를 화살표로 번역! 녹으면 융해, 굳으면 응고, 날아가면 기화.",
  },
  // [262] d2 사진 frost-leaf · 서리 = 승화 + 결정 모양 근거. 검산: 서리 = 수증기(기) → 얼음(고) 승화 · 근거 = 결정(이슬이 얼었다면 둥근 얼음).
  {
    id: "u4e262",
    lessonId: "u4l3",
    type: "mcq",
    prompt: "사진은 겨울 아침 나뭇잎에 생긴 <b>서리</b>예요. 서리가 만들어진 과정에 대한 설명으로 옳은 것은?",
    figure: ximg("frost-leaf.webp", "나뭇잎 가장자리와 잎맥을 따라 뾰족뾰족한 흰 얼음 알갱이가 촘촘히 자라나 있는 모습"),
    options: [
      "공기 중의 수증기가 물을 거치지 않고 곧장 얼음이 되었다",
      "잎에 맺혀 있던 이슬이 그대로 얼어붙은 것이다",
      "나뭇잎 속의 물이 배어 나와서 언 것이다",
      "밤사이 내린 눈이 잎 위에 쌓인 것이다",
      "서리는 잎에 붙어 있는 차가운 액체 방울이다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>서리는 공기 중의 수증기가 아주 차가운 잎 표면에서 <b>물방울 단계를 건너뛰고 곧장 얼음 결정</b>이 된 승화예요. 사진 속 서리가 둥근 알갱이가 아니라 <b>뾰족뾰족한 결정 모양</b>으로 자라 있는 것이 그 증거죠.<span class='xh'>오답 하나씩 격파</span>'이슬이 얼어붙었다'가 가장 흔한 오개념이에요 ✓ 이슬(액체 방울)이 얼었다면 둥근 모양 그대로 매끈한 얼음 알갱이가 되어야 해요. 결정이 가지처럼 자란 모습은 수증기가 바로 얼었다는 표시예요. '잎 속의 물이 배어 나왔다'면 잎맥 안쪽부터 젖어야 하고, '눈이 쌓였다'면 잎의 모양과 무관하게 덮여야 하죠. 서리는 액체가 아니라 <b>고체</b>라서 마지막 보기도 틀려요.",
    core: "서리 = 수증기의 승화. 뾰족한 결정 모양이 '물을 안 거쳤다'는 증거!",
  },
  // [266] d3 사진 dryice-cup · 안개 정체 + 하강 까닭. 검산: 흰 안개 = 식은 공기 중 수증기의 액화(물방울) · 차가운 공기는 가라앉음.
  {
    id: "u4e266",
    lessonId: "u4l3",
    type: "mcq",
    prompt: "사진처럼 유리컵에 담긴 드라이아이스에서 하얀 안개가 생겨나, 위로 뜨지 않고 컵을 넘어 <b>아래로 낮게 깔리며</b> 흘러내려요. 이에 대한 설명으로 가장 옳은 것은?",
    figure: ximg("dryice-cup.webp", "유리컵에 담긴 드라이아이스 둘레로 짙고 하얀 안개가 생겨 컵 아래쪽으로 흘러내리는 모습"),
    options: [
      "안개의 정체는 차가워진 공기 속 수증기가 변한 작은 물방울이며, 주변 공기보다 차가워서 가라앉는다",
      "안개의 정체는 드라이아이스가 변한 기체 그 자체이다",
      "안개는 뜨거운 수증기라서 곧 위로 솟아오른다",
      "안개는 드라이아이스가 잘게 부서진 고체 가루이다",
      "안개는 눈에 보일 만큼 커진 수증기이다",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>드라이아이스가 승화하며 주변 공기를 강하게 식히면, 공기 속 <b>수증기가 작은 물방울로 변해</b>(액화) 하얀 안개로 보여요. 이 안개는 차갑게 식은 공기와 함께 있으니 주변 공기보다 무거워 <b>아래로 가라앉으며</b> 흘러내리죠. 사진 속 낮게 깔린 모습이 그 증거예요.<span class='xh'>오답 하나씩 격파</span>'드라이아이스가 변한 기체'는 절반만 맞는 함정이에요 ✓ 그 기체는 색이 없어 <b>보이지 않아요</b>. 눈에 보이는 것은 기체가 아니라 물방울이죠. '뜨거운 수증기'는 차가운 드라이아이스 곁이라는 상황과 모순이고, '고체 가루'라면 컵 둘레에 가루가 쌓여야 해요. '보일 만큼 커진 수증기'는 말 자체가 모순이에요. 수증기는 기체라서, 보이는 순간 이미 물방울이랍니다.",
    core: "하얀 안개 = 물방울(액화). 차가운 공기와 함께라 낮게 가라앉아요!",
  },
  // [270] d2 multi(5지·정답 2) · 액화 판정. 검산: 창문 결로 ✓ · 새벽 안개 ✓ / 서리 = 승화 ✗ · 아이스크림 = 융해 ✗ · 국물 졸음 = 기화 ✗.
  {
    id: "u4e270",
    lessonId: "u4l3",
    type: "multi",
    prompt: "다음 중 <b>액화</b>에 해당하는 현상을 <b>모두</b> 고르세요.",
    options: [
      "겨울철 유리창 안쪽에 물방울이 줄줄이 맺힌다",
      "이른 새벽 강가에 뿌연 안개가 낀다",
      "겨울 아침 지붕이 하얀 서리로 덮인다",
      "여름날 아이스크림이 흘러내린다",
      "오래 끓인 국의 국물이 졸아든다",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>유리창 안쪽 물방울은 실내 공기 속 수증기가 차가운 유리에 닿아 <b>액체로 돌아온</b> 것, 강가의 안개는 공기 속 수증기가 식어 <b>작은 물방울</b>로 변해 떠 있는 것이에요. 둘 다 기체가 액체로 변했으니 액화죠.<span class='xh'>오답 격파</span>지붕의 서리는 같은 겨울 풍경이지만 수증기가 물방울 단계를 <b>건너뛰고 곧장 얼음 결정</b>이 된 승화예요 ✓ 물방울로 맺히면 액화, 긁어낼 수 있는 결정이면 승화라는 갈림길을 기억해요. 아이스크림이 흘러내리는 것은 고체가 녹는 융해, 국물이 졸아드는 것은 물이 수증기로 날아가는 기화라서 도착지가 아예 달라요. 액화의 자격은 <b>기체에서 출발해 액체에 도착</b>하는 것 하나뿐이랍니다.",
    core: "도착이 이름! 물방울로 맺히면 액화, 얼음 결정으로 앉으면 승화.",
  },
  // [275] d3 dbox 절차 · 성질 불변 확인 실험(비상 8 폐쇄형 · 결론 미인쇄). 검산: ㉠ = 비교 대상(얼음 녹인 물) 확보 단계.
  {
    id: "u4e275",
    lessonId: "u4l3",
    type: "mcq",
    prompt: "다음은 '상태가 변해도 같은 물질인지'를 확인하는 실험 계획이에요. 절차의 빈칸 <b>㉠</b>에 들어갈 내용으로 가장 알맞은 것은?",
    figure: dbox([
      ["준비물", "비커, 뜨거운 물, 차가운 유리판, 얼음, 푸른색 염화 코발트 종이, 핀셋"],
      ["절차 ①", "뜨거운 물이 든 비커 위에 차가운 유리판을 비스듬히 올려 두고, 유리판 아래쪽에 맺힌 물방울에 푸른색 염화 코발트 종이를 대 본다."],
      ["절차 ②", "( ㉠ )"],
      ["절차 ③", "①과 ②의 결과를 비교한다."],
    ]),
    options: [
      "얼음이 녹은 물에도 푸른색 염화 코발트 종이를 대 본다",
      "유리판을 얼음으로 더 차갑게 식힌다",
      "비커의 물이 빨리 줄도록 더 세게 가열한다",
      "유리판에 맺힌 물방울을 마른 수건으로 닦아 낸다",
      "염화 코발트 종이를 물에 헹구어 말린다",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>이 실험의 목표는 '수증기였다가 돌아온 물'과 '얼음이었다가 녹은 물'이 <b>같은 물질인지</b> 확인하는 거예요. ①에서 기체를 거친 물을 검사했으니, ②에서는 <b>고체를 거친 물</b>, 곧 얼음 녹은 물을 같은 종이로 검사해야 ③에서 비교할 두 결과가 갖춰지죠. 준비물의 얼음이 바로 이 단계를 위한 재료예요.<span class='xh'>오답 하나씩 격파</span>'유리판을 더 식힌다'와 '더 세게 가열한다'는 물방울을 더 많이 얻는 요령일 뿐, 비교 대상을 만들지 못해요 ✓ 실험 설계에서 빠진 조각은 언제나 <b>목표</b>에서 찾아요. '물방울을 닦아 낸다'는 ①의 결과를 지워 버리는 일이고, '종이를 물에 헹군다'면 종이가 미리 붉게 변해 검사 도구로 쓸 수 없게 된답니다.",
    core: "설계의 빈칸은 목표에서 역산 · 비교하려면 얼음 녹인 물 검사가 필요해요!",
  },
  // [281] d1 PP2(melt) · 융해 모형 판독. 검산: 규칙 격자(고) → 붙은 불규칙(액) · 12 = 12 개수 보존.
  {
    id: "u4e281",
    lessonId: "u4l4",
    type: "mcq",
    prompt: "그림은 어떤 상태 변화가 일어날 때의 입자 모형이에요. 이 변화에서 나타나는 일로 옳은 것은?",
    figure: particleChangeFig("melt"),
    figureDark: true,
    options: [
      "입자의 배열이 흐트러지고 입자들이 서로 자리를 바꿀 수 있게 된다",
      "입자의 개수가 늘어난다",
      "입자 하나하나의 크기가 커진다",
      "물질의 질량이 줄어든다",
      "입자 사이의 거리가 매우 멀어져 뿔뿔이 흩어진다",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>왼쪽 상자는 입자들이 규칙적으로 줄지은 고체, 오른쪽 상자는 붙은 채 흐트러진 액체예요. 고체가 액체로 변하는 융해에서는 반듯하던 <b>배열이 무너지고</b>, 입자들이 이웃을 갈아타며 <b>자리를 바꿀 수 있게</b> 되죠. 그래서 녹은 물질은 흐를 수 있어요.<span class='xh'>오답 하나씩 격파</span>두 상자의 입자를 세어 보면 <b>똑같이 12개</b>예요 ✓ 개수는 변하지 않았죠. 입자의 크기도 양쪽이 같게 그려져 있어요. 변하는 것은 배열과 간격뿐이에요. 개수가 그대로니 질량이 줄 리도 없고요. '뿔뿔이 흩어진다'는 기체가 될 때의 모습이라, 서로 붙어 있는 오른쪽 상자와 맞지 않아요.",
    core: "융해 = 배열 무너짐 + 자리 바꾸기 시작. 개수·크기·질량은 그대로!",
  },
  // [284] d2 SB(zip) · 밀폐 승화 전후. 검산: 밀봉 = 질량 불변 · 고→기 = 부피 크게 증가 · 개수 동일.
  {
    id: "u4e284",
    lessonId: "u4l4",
    type: "mcq",
    prompt: "드라이아이스 조각을 지퍼 백에 넣고 공기를 뺀 뒤 꼭 잠갔어요. (가)는 넣은 직후, (나)는 드라이아이스가 모두 기체로 변한 뒤예요. 이에 대한 설명으로 옳은 것은?",
    figure: sealedPairFig({ vessel: "zip" }),
    options: [
      "지퍼 백은 크게 부풀지만, 전체 질량은 (가)일 때와 같다",
      "기체가 되면서 입자 수가 늘어나므로 더 무거워진다",
      "밀봉을 했으므로 지퍼 백의 부피도 변하지 않는다",
      "입자 사이의 거리는 (가)일 때와 같다",
      "입자들이 조금씩 없어지므로 가벼워진다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>고체가 곧장 기체로 변하는 승화가 일어나면 입자 사이가 확 벌어져 <b>부피가 크게 늘고</b>, 그래서 지퍼 백이 빵빵해져요. 하지만 꼭 잠근 봉지라 입자는 한 개도 빠져나가지 못했죠. 입자의 종류와 개수가 그대로니 <b>전체 질량은 변하지 않아요</b>.<span class='xh'>오답 하나씩 격파</span>'입자 수가 늘어난다'는 오개념이에요 ✓ 그림의 (가)와 (나)의 입자 수는 같아요. 기체가 된 것은 개수가 아니라 <b>간격</b>이 변한 거예요. '부피도 변하지 않는다'는 빵빵해진 (나)의 모습과 어긋나고, '거리가 같다'는 납작한 (가)와 부푼 (나)의 차이를 부정하는 셈이에요. '입자가 없어진다'는 밀봉된 봉지에서 일어날 수 없는 일이랍니다.",
    core: "밀폐 승화 = 부피는 크게↑, 질량은 그대로. 변한 건 입자 사이 간격!",
  },
  // [288] d2 WF 재사용 bogi · 물 응고 부피 예외. 검산: ㄱ 부피↑ 참 · ㄴ 질량 늘어남 거짓 · ㄷ 녹으면 원래 높이 참(왕복).
  {
    id: "u4e288",
    lessonId: "u4l4",
    type: "mcq",
    prompt: "그림처럼 물을 담아 처음 높이를 표시한 유리병을 통째로 얼렸더니 (나)처럼 되었어요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: waterFreezeFig(),
    bogi: [
      "물이 얼면서 부피가 늘어났다.",
      "물이 얼면서 질량도 함께 늘어났다.",
      "얼음이 다시 다 녹으면 물의 높이는 처음 표시로 돌아온다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ ✓ 언 뒤의 높이가 처음 표시선보다 올라갔으니 부피가 늘어난 거예요. 물이 얼 때 입자들이 틈이 많은 얼개로 짜이기 때문이죠. ㄴ은 틀려요 ✓ 부피가 늘었어도 입자의 개수는 그대로라서 <b>질량은 변하지 않아요</b>. 커진 것은 입자 사이의 틈이지 물질의 양이 아니에요. ㄷ ✓ 얼음이 녹으면 입자들이 원래의 촘촘한 액체 배열로 돌아오니, 높이도 처음 표시선으로 돌아와요. 상태가 왕복하면 부피도 왕복하죠.<span class='xh'>함정 포인트</span>'커졌으니 무거워졌겠지'라는 직감이 ㄴ을 고르게 만들어요. 부피와 질량은 반드시 따로 판정해요.",
    core: "얼면 부피만↑(질량 그대로), 녹으면 부피도 원위치 · 왕복까지 세트!",
  },
  // [292] d2 무① bogi · 변/불변 종합. 검산: 질량 불변 참 · 거리 변함 참 · 성질 바뀜 거짓.
  {
    id: "u4e292",
    lessonId: "u4l4",
    type: "mcq",
    prompt: "물질의 상태가 변할 때에 대한 설명으로 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    bogi: [
      "물질의 질량은 변하지 않는다.",
      "입자 사이의 거리가 달라진다.",
      "물질이 성질이 다른 새로운 물질로 바뀐다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ ✓ 상태 변화에서 입자는 생기지도 없어지지도 않으니, 입자의 개수가 정하는 질량은 그대로예요. ㄴ ✓ 상태 변화의 정체가 바로 입자의 배열과 <b>사이 간격이 달라지는</b> 일이에요. 그 결과로 부피가 변하죠. ㄷ은 틀려요 ✓ 얼음도 물도 수증기도 전부 같은 물 입자로 이루어진 <b>같은 물질</b>이에요. 상태가 변해도 물질의 성질은 그대로라서, 새로운 물질이 되는 것이 아니랍니다.<span class='xh'>함정 포인트</span>변하는 것(배열·거리·부피)과 변하지 않는 것(종류·개수·질량·성질)의 두 목록을 뒤섞는 것이 합답형의 단골 수법이에요. 보기마다 어느 목록 소속인지 확인하며 판정해요.",
    core: "변함: 배열·거리·부피 / 불변: 종류·개수·질량·성질 · 목록으로 판정!",
  },
  // [296] d2 multi(5지·정답 2) · 굳는 동안 불변(미6 폐쇄형). 검산: 질량 ✓ 성질 ✓ / 배열 ✗ 부피 ✗ 운동 정도 ✗(전부 변함).
  {
    id: "u4e296",
    lessonId: "u4l4",
    type: "multi",
    prompt: "액체가 고체로 <b>굳는 동안</b> 변하지 <b>않는</b> 것을 <b>모두</b> 고르세요.",
    options: [
      "물질의 질량",
      "물질이 나타내는 고유한 성질",
      "입자의 배열",
      "물질의 부피",
      "입자 운동의 활발한 정도",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>굳는 동안(응고) 입자는 단 한 개도 생기거나 없어지지 않아요. 그래서 <b>질량</b>은 그대로죠. 또 입자의 종류가 그대로니 그 물질만의 <b>고유한 성질</b>도 변하지 않아요. 녹였다 굳힌 물질이 여전히 같은 물질인 이유예요.<span class='xh'>오답 격파</span>'입자의 배열'은 변하는 쪽이에요 ✓ 응고는 자리를 바꾸던 입자들이 규칙적인 배열로 <b>자리를 잡는</b> 변화 그 자체거든요. 배열과 거리가 달라지니 '부피'도 함께 변해요. '운동의 활발한 정도'도 변해요. 자유롭게 미끄러지던 입자들이 제자리 진동만 하게 되니 둔해지죠. 질량·종류·성질은 불변 진영, 배열·거리·부피·운동은 변화 진영이라는 두 목록만 기억하면 흔들리지 않아요.",
    core: "응고에서도 질량·성질은 불변 · 배열·부피·운동은 전부 변하는 쪽!",
  },
  // [301] d3 표(실험 기록) · 밀폐/열린 대비 해석(감사 처방). 검산: (가) 밀폐 = 불변 · (나) 열린 = 감소(입자 이탈) · 정성 기록(수치 없음).
  {
    id: "u4e301",
    lessonId: "u4l4",
    type: "mcq",
    prompt: "표는 두 실험에서 상태 변화가 일어나기 전과 후에 전자저울로 잰 결과를 정리한 거예요. 이를 옳게 해석한 것은?",
    figure: svgTable(
      ["구분", "한 일", "저울 눈금"],
      [
        ["(가)", "밀폐한 병의 물을 얼렸다", "변화 없음"],
        ["(나)", "접시의 물을 사흘 두었다", "줄어듦"],
      ],
      { firstColHead: true },
    ),
    options: [
      "(나)에서 줄어든 만큼의 물 입자는 기체가 되어 공기 중으로 나갔다",
      "(가)에서는 입자 수가 늘었지만 우연히 눈금이 같았다",
      "(나)에서는 물 입자의 일부가 완전히 사라졌다",
      "(가)의 결과는 물이 얼면 더 무거워진다는 뜻이다",
      "(나)의 접시를 밀폐했더라면 눈금이 더 빨리 줄었을 것이다",
    ],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>두 결과를 나란히 읽어요.<br>① (가) 밀폐한 병은 입자가 드나들 수 없으니, 물이 얼음이 되어도 눈금이 그대로예요. 상태 변화 자체는 질량을 바꾸지 않는다는 증거죠.<br>② (나) 뚜껑 없는 접시에서는 물이 증발해 <b>기체가 된 입자들이 접시를 떠났고</b>, 그만큼 저울 눈금이 줄었어요.<br>줄어든 것은 입자가 사라져서가 아니라 <b>저울 밖으로 이사</b>해서예요.<span class='xh'>오답 하나씩 격파</span>'입자 수가 늘었는데 우연히 같다'는 근거 없는 상상이고, '완전히 사라졌다'는 입자 보존의 대원칙에 어긋나요 ✓ '(가)는 얼면 무거워진다는 뜻'이라면 눈금이 늘었어야 하니 표와 모순이죠. '(나)를 밀폐했다면'은 반대예요. 밀폐하면 입자가 못 나가 눈금이 (가)처럼 <b>변하지 않았을</b> 거예요.",
    core: "밀폐면 불변, 열려 있으면 감소 · 두 기록의 차이가 곧 입자의 행방!",
  },
  // [305] d2 IL · 얼음 틈 배열 판독. 검산: 같은 개수 12 · 얼음 = 고리(틈) 얼개 → 같은 양이 더 넓은 자리 = 부피↑.
  {
    id: "u4e305",
    lessonId: "u4l4",
    type: "mcq",
    prompt: "그림은 물과 얼음의 입자 배열을 나타낸 모형이에요. 물이 얼 때 <b>부피가 늘어나는 까닭</b>을 그림에서 찾아 옳게 설명한 것은?",
    figure: iceLatticeFig(),
    figureDark: true,
    options: [
      "얼음이 될 때 입자들이 가운데에 빈틈이 생기는 얼개로 짜이기 때문",
      "얼음이 될 때 입자 하나하나가 커지기 때문",
      "얼음이 될 때 입자의 개수가 늘어나기 때문",
      "얼음이 될 때 입자들이 더 촘촘하게 모이기 때문",
      "얼음이 될 때 물 입자가 더 가벼운 입자로 바뀌기 때문",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그림을 비교하면 (가)의 물 입자들은 빈틈 없이 붙어 있는데, (나)의 얼음 입자들은 <b>고리 모양으로 손을 잡아 가운데가 비어</b> 있어요. 같은 개수의 입자가 틈을 두고 짜이니, 차지하는 자리가 넓어져 부피가 늘어나는 거예요. 대부분의 물질은 얼 때 부피가 줄어드는데, 물은 이 특별한 얼개 때문에 반대랍니다.<span class='xh'>오답 하나씩 격파</span>'입자가 커진다'와 '개수가 늘어난다'는 그림과 어긋나요 ✓ 두 상자의 입자는 <b>크기도 개수도 같게</b> 그려져 있어요. '더 촘촘하게 모인다'면 부피는 오히려 줄어야 하니 방향이 반대고, '가벼운 입자로 바뀐다'는 입자의 종류가 변하지 않는다는 대원칙에 어긋나요.",
    core: "얼음의 비밀 = 틈 있는 얼개. 입자는 그대로, 짜임새가 자리를 넓혀요!",
  },
  // [308] d1 무① · 흡수 묶음. 검산: 흡수 = 융해·기화·승화(고→기) = 입자가 흩어지는 방향.
  {
    id: "u4e308",
    lessonId: "u4l5",
    type: "mcq",
    prompt: "상태가 변할 때 열에너지를 <b>흡수</b>하는 변화끼리 옳게 묶은 것은?",
    options: [
      "융해, 기화, 승화(고체→기체)",
      "응고, 액화, 승화(기체→고체)",
      "융해, 액화, 승화(고체→기체)",
      "응고, 기화, 승화(기체→고체)",
      "융해, 응고, 액화",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>판정 기준은 입자의 방향이에요. 규칙적인 배열을 허물고(융해), 서로의 붙잡음을 뿌리치고(기화), 격자에서 곧장 날아오르는(승화, 고체→기체) 것처럼 입자가 <b>흩어지는 방향</b>의 변화는 전부 에너지가 필요해서, 주변의 열에너지를 흡수해요.<span class='xh'>오답 하나씩 격파</span>'응고, 액화, 승화(기체→고체)'는 정확히 반대편 묶음이에요 ✓ 입자가 <b>모이는 방향</b>이라 남는 에너지를 내놓는 방출 삼형제죠. 나머지 묶음들은 흡수와 방출이 섞여 있어요. 응고나 액화가 하나라도 끼어 있으면 흡수 묶음이 될 수 없어요. 헷갈릴 때는 고체에서 기체 쪽으로 <b>올라가는 방향이면 흡수</b>라고 기억해요.",
    core: "흩어지면 흡수(융해·기화·승화↑), 모이면 방출 · 방향이 곧 판정 기준!",
  },
  // [310] d2 QC(heat·2수평·㉠~㉤) 긍정형. 검산: ㉠고체 상승 · ㉡융해 수평(고+액) · ㉢액체 상승 · ㉣끓음 수평(액+기) · ㉤기체 상승.
  {
    id: "u4e310",
    lessonId: "u4l5",
    type: "mcq",
    prompt: "그림은 고체 물질을 일정한 세기의 불로 가열할 때 시간에 따른 온도 변화예요. ㉠~㉤ 구간에 대한 설명으로 옳은 것은?",
    figure: qualCurveFig({ mode: "heat", plateaus: 2, secs: true }),
    options: [
      "㉣ 구간의 용기 속에는 액체와 기체가 함께 들어 있다",
      "㉠ 구간에서 물질은 액체 상태이다",
      "㉡ 구간에서는 온도가 계속 올라간다",
      "㉢ 구간에서 상태 변화가 일어나고 있다",
      "㉤ 구간에서 물질은 고체 상태이다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>그래프를 구간별로 읽어요. ㉠은 고체가 데워지는 구간, ㉡은 첫 번째 수평 구간이라 고체가 녹는 중(고체+액체), ㉢은 다 녹은 액체가 데워지는 구간, ㉣은 두 번째 수평 구간이라 액체가 끓어 기체가 되는 중이에요. 그래서 ㉣의 용기 속에는 <b>액체와 기체가 함께</b> 있어요.<span class='xh'>오답 하나씩 격파</span>㉠은 가열을 막 시작한 구간이니 아직 <b>고체</b>예요 ✓ ㉡은 수평 구간이라 온도가 <b>일정하게 유지</b>되죠. ㉢은 온도가 오르는 구간이라 상태 변화 없이 액체가 데워지기만 해요. 상태가 변하는 곳은 수평 구간뿐이에요. ㉤은 모두 기체가 된 뒤라 고체가 아니라 <b>기체</b>랍니다.",
    core: "수평 = 상태 변화 중(두 상태 공존), 상승 = 한 상태로 온도만 오름!",
  },
  // [313] d2 QC(pair) · 양 비교 관계 추론. 검산: 양 많음 = 수평 도달 늦고 수평 길다 · 수평 높이(온도)는 같음.
  {
    id: "u4e313",
    lessonId: "u4l5",
    type: "mcq",
    prompt: "그림은 <b>같은 고체 물질</b>을 양만 다르게 하여 같은 세기의 불로 가열한 (가)와 (나)의 온도 변화예요. 이에 대한 설명으로 옳은 것은?",
    figure: qualCurveFig({ mode: "heat", pair: true }),
    options: [
      "(나)가 (가)보다 물질의 양이 많다",
      "(가)와 (나)의 온도가 일정해지는 온도는 서로 다르다",
      "(가)가 (나)보다 물질의 양이 많다",
      "온도가 일정한 구간에서 (나)는 열에너지를 흡수하지 않는다",
      "(나)는 (가)와 다른 종류의 물질이다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>양이 많을수록 전부 녹는 데 더 많은 열에너지가 필요해서, 온도가 일정한 구간이 <b>더 길게</b> 이어져요. 그래프에서 (나)의 수평 구간이 (가)보다 늦게 시작해 더 길게 이어지니, <b>(나)의 양이 더 많아요</b>.<span class='xh'>오답 하나씩 격파</span>'일정해지는 온도가 다르다'는 그래프와 어긋나요 ✓ 두 곡선의 수평 구간은 <b>같은 높이</b>에 있어요. 같은 물질이면 양이 달라도 녹는 동안 유지되는 온도는 같기 때문이죠. '(가)가 많다'는 수평 길이를 거꾸로 읽은 것이고, '열에너지를 흡수하지 않는다'는 수평 구간에도 열이 계속 들어가 상태 변화에 쓰인다는 사실과 반대예요. 문두에서 같은 물질이라 했으니 마지막 보기도 성립하지 않아요.",
    core: "양이 많으면 수평 구간이 길어질 뿐 · 유지되는 온도(높이)는 그대로!",
  },
  // [315] d2 사진 kettle · 센 불 예측. 검산: 끓는 동안 온도 일정 · 센 불 = 기화 빨라짐 = 김 세짐 · 100℃는 자연값(정답 아님).
  {
    id: "u4e315",
    lessonId: "u4l5",
    type: "mcq",
    prompt: "사진처럼 주전자의 물이 세차게 끓으며 주둥이에서 김이 뿜어져 나오고 있어요. 이 상태에서 불을 <b>최대로</b> 키우면 어떻게 될까요?",
    figure: ximg("kettle-steam.webp", "가스불 위 주전자의 주둥이에서 김이 힘차게 뿜어져 나오는 모습"),
    options: [
      "물의 온도는 그대로이고, 김이 지금보다 더 세차게 나온다",
      "물의 온도가 계속 올라가면서 더 뜨거운 물이 된다",
      "김이 더 이상 나오지 않게 된다",
      "물이 줄어드는 빠르기가 지금보다 느려진다",
      "물이 끓기를 멈추고 조용해진다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>일단 끓기 시작한 물의 온도는 <b>일정하게 유지</b>돼요. 불을 세게 해서 더 들어온 열에너지는 온도를 올리는 데 쓰이지 못하고 <b>전부 물을 수증기로 바꾸는 데</b> 쓰이거든요. 그래서 온도는 그대로인 채, 만들어지는 수증기만 많아져 김이 더 세차게 뿜어져 나와요. 물이 줄어드는 속도도 빨라지죠.<span class='xh'>오답 하나씩 격파</span>'온도가 계속 올라간다'는 끓는 동안 온도가 멈춘다는 핵심을 놓친 답이에요 ✓ 아무리 센 불도 끓는 물을 더 뜨겁게 만들지 못해요. '김이 안 나온다'와 '끓기를 멈춘다'는 열을 더 넣는 상황과 정반대고, '줄어드는 빠르기가 느려진다'도 반대예요. 수증기가 더 빨리 생기니 물은 더 빨리 줄어든답니다.",
    core: "센 불은 온도가 아니라 속도를 올려요 · 끓는 물 온도는 일정!",
  },
  // [319] d2 무③ · 얼음물 온도(구 num 0℃의 정성 재설계). 검산: 얼음 남아 있는 동안 = 융해 진행 = 온도 일정(들어온 열이 융해에 전액).
  {
    id: "u4e319",
    lessonId: "u4l5",
    type: "mcq",
    prompt: "얼음과 물이 함께 든 컵을 따뜻한 실내에 두었어요. <b>얼음이 아직 남아 있는 동안</b>, 얼음물의 온도는 어떻게 될까요?",
    options: [
      "얼음이 다 녹을 때까지 거의 일정하게 유지된다",
      "실내 온도가 될 때까지 계속 올라간다",
      "얼음이 열을 내놓아 점점 더 차가워진다",
      "얼음의 양에 따라 크게 올랐다 내렸다 한다",
      "물 부분만 따뜻해지고 얼음 곁은 계속 차갑다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>얼음과 물이 함께 있다는 것은 융해가 <b>진행 중</b>이라는 뜻이에요. 따뜻한 실내에서 컵으로 들어오는 열에너지는 물을 데우는 데 쓰이지 못하고 <b>얼음을 녹이는 데 전부</b> 쓰여요. 그래서 얼음이 다 녹기 전까지 얼음물의 온도는 거의 일정하게 유지되죠. 얼음이 남아 있는 음료가 끝까지 차가운 이유예요.<span class='xh'>오답 하나씩 격파</span>'계속 올라간다'는 얼음이 다 녹은 <b>다음</b>의 일이에요 ✓ 그때부터 들어오는 열이 온도를 올리기 시작하죠. '얼음이 열을 내놓는다'는 방향이 반대예요. 녹는 얼음은 열을 <b>흡수</b>해요. 온도가 크게 오르내릴 이유도 없고, 컵 속 물은 섞이며 고르게 유지되니 마지막 보기도 어긋나요.",
    core: "얼음이 남아 있는 동안 온도는 일정 · 들어온 열이 전부 융해에 쓰여요!",
  },
  // [324] d2 multi(5지·정답 2) · 수평 구간 진술. 검산: 열 계속 흡수 ✓ · 공존 ✓ / 온도 올림 ✗ · 배열 불변 ✗ · 서서히 상승 ✗.
  {
    id: "u4e324",
    lessonId: "u4l5",
    type: "multi",
    prompt: "고체 물질을 가열할 때 나타나는, <b>온도가 일정하게 유지되는 구간</b>에 대한 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "불을 끄지 않는 한 물질은 열에너지를 계속 받아들이고 있다",
      "용기 속에는 고체와 액체 두 상태가 함께 들어 있다",
      "이 구간에서 받아들인 열에너지는 물질의 온도를 높이는 데 쓰인다",
      "이 구간에서 입자의 배열은 변하지 않는다",
      "이 구간에서도 온도는 아주 천천히 올라가고 있다",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>온도가 멈춘 수평 구간에도 불은 계속 타고 있고, 물질은 열에너지를 <b>쉼 없이 받아들이는 중</b>이에요. 다만 그 열이 전부 고체의 배열을 허무는 데 쓰일 뿐이죠. 그리고 이 구간에서는 먼저 녹은 액체와 아직 안 녹은 고체가 <b>함께</b> 들어 있어요. 두 설명이 옳아요.<span class='xh'>오답 격파</span>'온도를 높이는 데 쓰인다'가 첫 함정이에요 ✓ 온도가 일정하다는 것 자체가, 받아들인 열이 온도 올리기에 <b>쓰이지 못하고</b> 전부 상태 바꾸기에 투입되고 있다는 뜻이죠. '배열이 변하지 않는다'는 정반대예요. 이 구간이야말로 규칙적인 배열이 <b>무너지는 중</b>인 가장 바쁜 시간이에요. '천천히 올라간다'도 틀려요. 상태 변화가 끝나기 전까지 온도는 그대로 유지된답니다.",
    core: "수평 구간 = 열은 계속 흡수 + 두 상태 공존 + 배열은 한창 변하는 중!",
  },
  // [326] d2 MX · 수평 구간 공존 모형 판독(구 e71 텍스트의 그림화). 검산: 격자 덩어리 + 흐트러진 입자 공존 = 융해 진행 중.
  {
    id: "u4e326",
    lessonId: "u4l5",
    type: "mcq",
    prompt: "그림은 고체 물질을 가열하다가 <b>온도가 일정한 구간</b>일 때, 용기 속 입자의 모습을 나타낸 모형이에요. 이에 대한 설명으로 옳은 것은?",
    figure: meltMixFig(),
    figureDark: true,
    options: [
      "규칙적인 배열을 이룬 부분과 흐트러진 부분이 함께 있다 · 융해가 진행되는 중이다",
      "모든 입자가 규칙적으로 배열되어 있다 · 아직 고체 상태이다",
      "모든 입자가 흐트러져 있다 · 이미 전부 액체가 되었다",
      "입자들이 뿔뿔이 흩어져 날아가고 있다 · 기화가 일어나는 중이다",
      "입자의 개수가 점점 줄어들고 있다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>모형을 보면 아래쪽에는 아직 반듯하게 줄지은 입자 덩어리가 있고, 그 둘레에 흐트러진 입자들이 있어요. 규칙적인 부분은 <b>아직 녹지 않은 고체</b>, 흐트러진 부분은 <b>먼저 녹은 액체</b>죠. 두 상태가 함께 있으니 지금은 융해가 진행 중인 수평 구간이에요.<span class='xh'>오답 하나씩 격파</span>'전부 규칙적'이라면 녹기 전(온도가 오르던 구간)의 모습이고, '전부 흐트러짐'은 다 녹은 뒤의 모습이에요 ✓ 수평 구간은 그 <b>사이</b>의 시간이라 두 모습이 공존해요. '뿔뿔이 흩어져 날아간다'는 기체가 될 때의 모형이라 서로 붙어 있는 이 그림과 다르고, '개수가 줄어든다'는 상태 변화에서 일어나지 않는 일이랍니다.",
    core: "온도가 멈춘 시간의 용기 속 = 고체·액체 공존 · 모형에 두 배열이 다 보여요!",
  },
  // [335] d1 무① · 방출 묶음. 검산: 방출 = 액화·응고·승화(기→고) = 입자가 모이는 방향. 정답 둘째 칸(구 e85 첫 칸 회피).
  {
    id: "u4e335",
    lessonId: "u4l6",
    type: "mcq",
    prompt: "상태가 변할 때 열에너지를 <b>방출</b>하는 변화끼리 옳게 묶은 것은?",
    options: [
      "융해, 기화, 승화(고체→기체)",
      "액화, 응고, 승화(기체→고체)",
      "기화, 액화, 응고",
      "융해, 액화, 승화(기체→고체)",
      "응고, 기화, 승화(고체→기체)",
    ],
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>자유롭게 날던 기체 입자가 붙잡히고(액화), 미끄러지던 액체 입자가 제자리에 고정되고(응고), 기체가 곧장 격자로 얼어붙는(승화, 기체→고체) 변화는 전부 입자가 <b>모이는 방향</b>이에요. 모일 때는 남는 에너지를 밖으로 내놓으니, 셋 다 열에너지를 방출하죠.<span class='xh'>오답 하나씩 격파</span>'융해, 기화, 승화(고체→기체)'는 정반대인 흡수 묶음이에요 ✓ 나머지 묶음들은 흡수와 방출이 섞여 있어요. 융해나 기화가 하나라도 보이면 그 묶음은 방출 묶음이 될 수 없죠. 기체에서 고체 쪽으로 <b>내려가는 방향이면 방출</b>이라고 정리해 두면, 어떤 조합이 나와도 한눈에 골라낼 수 있어요.",
    core: "모이면 방출(액화·응고·승화↓) · 내려가는 방향의 세 변화예요!",
  },
  // [336] d1 QC(cool·㉠~㉢) · 냉각 수평 구간 상태. 검산: ㉠ 액체 하강 · ㉡ 응고 수평(액+고) · ㉢ 고체 하강.
  {
    id: "u4e336",
    lessonId: "u4l6",
    type: "mcq",
    prompt: "그림은 액체 물질을 서서히 식힐 때 시간에 따른 온도 변화예요. <b>㉡ 구간</b>에서 용기 속 물질의 상태는?",
    figure: qualCurveFig({ mode: "cool", plateaus: 1, secs: true }),
    options: [
      "액체와 고체가 함께 있다",
      "액체만 있다",
      "고체만 있다",
      "기체와 액체가 함께 있다",
      "기체만 있다",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>냉각 곡선을 구간별로 읽어요. ㉠은 액체가 식으며 온도가 내려가는 구간, ㉡은 온도가 멈춘 수평 구간이니 액체가 <b>굳는 중</b>이에요. 먼저 굳은 부분은 고체가 되었고 아직 안 굳은 부분은 액체로 남아, 용기 속에는 <b>액체와 고체가 함께</b> 들어 있죠. ㉢은 다 굳은 고체가 계속 식는 구간이에요.<span class='xh'>오답 하나씩 격파</span>'액체만'은 ㉠ 구간의, '고체만'은 ㉢ 구간의 모습이에요 ✓ 수평 구간은 그 사이라서 두 상태가 공존해요. 기체가 든 보기들은 이 실험과 맞지 않아요. 액체에서 출발해 식히기만 했으니, 기체가 만들어질 일이 없답니다.",
    core: "냉각 곡선의 수평 = 굳는 중 = 액체·고체 공존. 가열 곡선과 거울 대칭!",
  },
  // [337] d2 QC(cool) · 수평 이유(방출 상쇄). 검산: 응고 방출열이 빠져나가는 열을 채움 → 온도 유지.
  {
    id: "u4e337",
    lessonId: "u4l6",
    type: "mcq",
    prompt: "그림은 액체 물질을 서서히 식힐 때의 온도 변화예요. <b>식히고 있는데도</b> 온도가 일정하게 유지되는 구간이 나타나는 까닭으로 가장 옳은 것은?",
    figure: qualCurveFig({ mode: "cool", plateaus: 1 }),
    options: [
      "물질이 굳으면서 내놓는 열에너지가, 밖으로 빠져나가는 열을 채워 주기 때문",
      "이 구간에서는 열이 밖으로 빠져나가지 않기 때문",
      "이 구간에서 물질이 주변의 열에너지를 흡수하기 때문",
      "입자의 운동이 완전히 멈추기 때문",
      "이 구간에서는 아무 변화도 일어나지 않기 때문",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>수평 구간에서는 응고가 진행 중이에요. 입자들이 규칙적인 배열로 자리를 잡으며 열에너지를 <b>내놓는데</b>, 이 방출이 밖으로 빠져나가는 열을 정확히 메워 줘요. 나가는 만큼 안에서 내놓으니, 식히는 중인데도 온도가 내려가지 않고 버티는 거죠.<span class='xh'>오답 하나씩 격파</span>'열이 빠져나가지 않는다'는 냉각 자체를 부정한 설명이에요 ✓ 열은 계속 나가고 있고, 그 몫을 방출이 <b>보충</b>하는 구조예요. '흡수하기 때문'은 방향이 반대예요. 흡수는 녹거나 끓을 때의 일이죠. '운동이 완전히 멈춘다'는 어떤 온도에서도 없는 일이고, '아무 변화도 없다'는 이 구간이야말로 배열이 바뀌는 중이라는 사실과 어긋나요.",
    core: "굳는 동안 온도 유지 = 방출한 열이 빠져나가는 몫을 채우기 때문!",
  },
  // [341] d2 사진 window-frost · 같은 변화(승화 기→고) 예 연결. 검산: 성에 = 기→고 승화 · 보기 중 승화 예 = 냉동고 벽 얼음 결정 유일.
  {
    id: "u4e341",
    lessonId: "u4l6",
    type: "mcq",
    prompt: "사진은 한겨울 유리창에 생긴 <b>성에</b>예요. 성에가 만들어질 때와 <b>같은 상태 변화</b>가 일어나는 예는?",
    figure: ximg("window-frost.webp", "유리창 한 면 가득 깃털 모양의 흰 얼음 결정 무늬가 자라나 있는 모습"),
    options: [
      "냉동고 안쪽 벽에 얼음 결정이 낀다",
      "얼음 틀에 넣은 물이 꽁꽁 언다",
      "새벽 풀잎에 이슬이 맺힌다",
      "빨랫줄의 젖은 빨래가 마른다",
      "컵 속 얼음이 녹아 물이 된다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 성에는 공기 중의 수증기가 물을 거치지 않고 차가운 유리에 <b>곧장 얼어붙은</b> 변화예요. 깃털 같은 결정 무늬가 그 증거죠. 냉동고 안쪽 벽의 얼음 결정도 냉동고 안 수증기가 똑같이 곧장 얼어붙은 것이라, 같은 상태 변화예요.<span class='xh'>오답 하나씩 격파</span>'얼음 틀의 물이 언다'는 액체가 고체로 굳는 응고예요 ✓ 성에는 <b>기체에서 출발</b>한다는 점이 달라요. 출발지가 다르면 다른 변화죠. '이슬'은 수증기가 물방울로 변하는 액화라 도착지가 액체고, '빨래가 마른다'는 액체가 기체로 가는 기화, '얼음이 녹는다'는 융해예요. 같은 변화를 찾을 때는 <b>출발과 도착 상태가 모두 같은지</b> 확인해요.",
    core: "성에의 짝 = 냉동고 벽 얼음 결정. 출발(기체)과 도착(고체)이 같아야 같은 변화!",
  },
  // [342] d2 DW · ㉡ 판정. 검산: ㉡ 비커 바깥벽 물방울 = 공기 중 수증기가 차가운 면에 액화(비커 속 물 아님).
  {
    id: "u4e342",
    lessonId: "u4l6",
    type: "mcq",
    prompt: "그림처럼 물이 든 비커에 드라이아이스 조각을 넣었더니 ㉠ 물속에서 기포가 올라오고, ㉡ 비커 바깥 면에 물방울이 맺혔으며, ㉢ 비커 위로 흰 김이 넘쳐 흘렀어요. <b>㉡의 물방울</b>에 대한 설명으로 옳은 것은?",
    figure: dryiceBeakerFig(),
    options: [
      "공기 중의 수증기가 차가워진 비커 면에 닿아 물방울로 변한 것이다",
      "비커 속의 물이 유리를 뚫고 배어 나온 것이다",
      "드라이아이스가 녹아서 생긴 물이다",
      "㉢의 흰 김이 얼어붙은 것이다",
      "㉠의 기포가 밖으로 빠져나와 맺힌 것이다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>드라이아이스가 물을 강하게 식히면 비커 전체가 차가워져요. 그러면 비커 <b>바깥쪽 공기 속에 있던 수증기</b>가 차가운 유리 면에 닿아 액체 물방울로 돌아와 맺히죠(액화). 물방울의 출처는 비커 안이 아니라 <b>바깥 공기</b>라는 것이 핵심이에요.<span class='xh'>오답 하나씩 격파</span>'물이 유리를 뚫고 나왔다'는 유리가 물을 통과시키지 않으니 불가능해요 ✓ '드라이아이스가 녹은 물'이라면 물방울이 비커 안에 생겨야 하고, 드라이아이스는 애초에 액체를 거치지 않고 곧장 기체가 되는 물질이에요. '흰 김이 얼어붙었다'면 물방울이 아니라 얼음이 만져져야 하고, '기포가 빠져나와 맺혔다'는 기포 속 기체가 눈에 보이지 않는다는 사실과 어긋나요.",
    core: "차가운 표면의 물방울, 출처는 언제나 공기 중 수증기(액화)!",
  },
  // [353] d2 dbox 지문 · 스키장 제설기. 검산: 물 → 얼음 = 응고 = 방출(추운 밤 공중에서 얼며 열을 내놓음).
  {
    id: "u4e353",
    lessonId: "u4l6",
    type: "mcq",
    prompt: "다음 읽기 자료의 밑줄 친 과정에서 일어나는 일로 옳은 것은?",
    figure: dbox([
      ["읽기 자료", "스키장의 제설기는 기온이 낮은 밤에 물을 아주 작은 방울로 만들어 공중에 뿌려요. <b>물방울은 차가운 공기 속을 떨어지는 동안 얼어서 눈이 되고</b>, 슬로프 위에 쌓여요."],
    ]),
    options: [
      "물이 얼면서 열에너지를 주변 공기에 내놓는다",
      "물이 얼면서 주변 공기의 열에너지를 흡수한다",
      "물방울이 수증기가 되었다가 다시 얼어서 눈이 된다",
      "물이 얼면서 물방울의 질량이 점점 늘어난다",
      "이 변화의 이름은 승화이다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>밑줄 친 과정은 액체인 물방울이 고체인 눈이 되는 <b>응고</b>예요. 응고는 입자들이 모여 규칙적으로 자리 잡는 변화라, 남는 열에너지를 <b>주변 공기에 내놓아요</b>. 그래서 제설기는 방출되는 열을 식혀 줄 만큼 기온이 낮은 밤에만 눈을 만들 수 있죠.<span class='xh'>오답 하나씩 격파</span>'열에너지를 흡수한다'는 방향이 반대예요 ✓ '차가워지는 변화니까 흡수하겠지'라는 직감이 함정인데, 판정 기준은 온도가 아니라 <b>입자가 모이는가 흩어지는가</b>예요. '수증기가 되었다가 언다'는 자료에 없는 단계를 지어낸 것이고, '질량이 늘어난다'는 상태 변화에서 질량이 변하지 않는다는 원칙에 어긋나요. 액체에서 고체로 가는 변화의 이름은 승화가 아니라 <b>응고</b>랍니다.",
    core: "물방울이 눈이 되는 건 응고 = 방출. 차가워 보여도 열은 내놓는 중!",
  },
];

/** 파일럿 부록 · 파일럿 문항 미사용 신작 헬퍼의 데뷔 눈검수 카드(문항 없이 그림만). */
export const PILOT_PREVIEW: { name: string; dark?: boolean; svg: string }[] = [
  { name: "FCQ flowQuizFig(압축 우선 위상 · ㉮=모양 질문 가림) · 확대 235", svg: flowQuizFig() },
  { name: "GA gasWeighFig · 확대 241 예정", svg: gasWeighFig() },
  { name: "VE volumeJumpFig(liquid) · 확대 291 예정", svg: volumeJumpFig("liquid") },
  { name: "LD ladleFig · 확대 271·272 예정", svg: ladleFig() },
  { name: "EB evapBoilFig · 확대 213 예정", dark: true, svg: evapBoilFig() },
  { name: "PP2 particleChangeFig(deposit) · 확대 354 예정", dark: true, svg: particleChangeFig("deposit") },
  { name: "QC qualCurveFig(cool·plateaus 2) · 확대 변형", svg: qualCurveFig({ mode: "cool", plateaus: 2, secs: true }) },
  { name: "WC winterSceneFig · 확대 배치 검토(예비)", svg: winterSceneFig() },
  { name: "PR pourFig · 확대 249 예정(예비)", svg: pourFig() },
  { name: "IC iceCupFig · 확대 289 검토(예비)", svg: iceCupFig() },
];
