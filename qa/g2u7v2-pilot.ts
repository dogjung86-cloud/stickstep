// g2u7 v2 파일럿 40문항(과학 교과서 준거 규격) · 정본 설계표 qa/g2u7-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정·index.ts 미등록. 확대 승인분과 함께 build-g2u7v2-lessons.mjs가
// g2u7l1~l8.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 7종(HG·PF·SC·CF·EB·CP·SW)은 파일럿 로컬 함수(m1u5 v2 관행) · 이식 때 ui/examFigures.ts
// "g2u7 v2" 섹션으로 승격한다. 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다(미사용 헬퍼 데뷔 전 눈검수 관행).
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커는 ✓만(⭕ 금지) · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) ·
// num answer 문자열+unitLabel. 각 문항 주석 = [슬롯] 검산 노트(회로 값·F=IL×B·유도 부호 사슬).
// 언어 가드 금지어 목록은 설계표 §0 정본(이식 후 검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
import type { ExamItem } from "../src/content/exams/types";
import {
  elecCanExamFig,
  elecScopeFig,
  elecViExamFig,
  elecTwoCircuitFig,
  elecPointsFig,
  elecFlowFig,
  elecLabelFig,
  elecMotorExamFig,
  elecCoilCompassFig,
} from "../src/ui/examFigures";
import { electronFlowFig } from "../src/ui/elecFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/g2u7/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
const xpair = (a: string, altA: string, b: string, altB: string): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${IMG_BASE}exam/g2u7/${a}" alt="${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="${IMG_BASE}exam/g2u7/${b}" alt="${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>`;

/* ══════════ 신작 헬퍼 7종(이식 때 examFigures "g2u7 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;
/** (+)·(−) 전하 알갱이(examFigures eplus·eminus와 같은 시각 문법의 로컬판) */
const pch = (x: number, y: number, r = 5.8): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FBE3E0" stroke="#D06050" stroke-width="1.3"/>
   <path d="M${x - r * 0.5} ${y}h${r}M${x} ${y - r * 0.5}v${r}" stroke="#C24437" stroke-width="1.4" stroke-linecap="round"/>`;
const mch = (x: number, y: number, r = 5.8): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E3EDFB" stroke="#5B87C9" stroke-width="1.3"/>
   <path d="M${x - r * 0.5} ${y}h${r}" stroke="#3A6BAE" stroke-width="1.4" stroke-linecap="round"/>`;

/** RB rubFigV2 · 마찰 전/후 전하 분포 모형(elecRubExamFig의 확대판 · 이식 때 원본 크기 패치로 승격).
 *  파일럿 검수 반영: 헝겊을 키워(폭 128·깊이 54) moved 3(전하 9개 = 3행)까지 알갱이가 안에 담긴다.
 *  (가) 막대 = 전자를 잃는 쪽 · (나) 헝겊 = 얻는 쪽. 시작은 (+)3·(−)3 중성. */
export function rubFigV2(o: { moved: number }): string {
  const rod = (x: number, y: number): string =>
    `<rect x="${x - 62}" y="${y - 18}" width="124" height="34" rx="15" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/>
     <path d="M${x - 48} ${y - 10}h34" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  const cloth = (x: number, y: number): string =>
    `<path d="M${x - 64} ${y - 21}q14 -8 32 0t32 0t32 0t32 0v54q-14 8 -32 0t-32 0t-32 0t-32 0z" fill="#E8C9A0" stroke="#A87A44" stroke-width="1.8"/>
     ${[0, 1, 2].map((i) => `<path d="M${x - 34 + i * 34} ${y - 12}v38" stroke="#C79A66" stroke-width="1.2"/>`).join("")}`;
  const charges = (x: number, y: number, p: number, m: number): string => {
    const both = [...Array.from({ length: p }, () => "p"), ...Array.from({ length: m }, () => "m")];
    return both
      .map((k, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = x - 39 + col * 26;
        const cy = y - 8 + row * 15;
        return k === "p" ? pch(cx, cy) : mch(cx, cy);
      })
      .join("");
  };
  const P = 3;
  const M0 = 3;
  return `<svg viewBox="0 0 344 248" ${NS} fill="none" role="img" aria-label="서로 다른 두 물체 (가)와 (나)를 마찰하기 전과 후의 전하 분포 모형 · 알갱이의 종류와 개수를 비교해 읽어요">
    <text x="30" y="40" font-size="12" font-weight="800" fill="#4E5968">마찰 전</text>
    ${rod(120, 64)}${charges(120, 64, P, M0)}
    ${cloth(258, 64)}${charges(258, 64, P, M0)}
    <text x="120" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
    <text x="258" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
    <path d="M172 110v18M167 122l5 7 5-7" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <text x="30" y="166" font-size="12" font-weight="800" fill="#4E5968">마찰 후</text>
    ${rod(120, 190)}${charges(120, 190, P, M0 - o.moved)}
    ${cloth(258, 190)}${charges(258, 190, P, M0 + o.moved)}
  </svg>`;
}

/** HG elecHangFig · 실에 매단 가벼운 물체 장면(마찰 전기력 관찰) · 힘 화살표는 그리지 않는다(판정이 과제).
 *  mode "repel" = 같은 대전체 두 개가 V자로 벌어짐 · "attract" = 매단 물체가 오른쪽 대전체 쪽으로 기울어짐. */
export function elecHangFig(o: { mode: "repel" | "attract"; left: string; right: string; neutral?: boolean }): string {
  const bar = `<line x1="60" y1="26" x2="284" y2="26" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 26v-8M284 26v-8" stroke="#8B95A1" stroke-width="3"/>`;
  if (o.mode === "repel")
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="천장 막대의 한 점에 실 두 가닥으로 매단 두 물체가 서로 기울어져 벌어진 채 멈춰 있는 그림">
      ${bar}
      <line x1="172" y1="26" x2="120" y2="120" stroke="#B0B8C1" stroke-width="1.8"/>
      <line x1="172" y1="26" x2="224" y2="120" stroke="#B0B8C1" stroke-width="1.8"/>
      <g transform="rotate(-26 120 136)"><rect x="98" y="122" width="44" height="28" rx="7" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/></g>
      <g transform="rotate(26 224 136)"><rect x="202" y="122" width="44" height="28" rx="7" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/></g>
      <text x="96" y="176" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.left}</text>
      <text x="248" y="176" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.right}</text>
    </svg>`;
  if (o.neutral)
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="실에 매단 가벼운 물체의 옆으로 대전된 막대를 가까이 가져가는 그림">
    ${bar}
    <line x1="150" y1="26" x2="150" y2="118" stroke="#B0B8C1" stroke-width="1.8"/>
    <circle cx="150" cy="130" r="15" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.8"/>
    <text x="128" y="166" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.left}</text>
    <g transform="rotate(24 262 108)">
      <rect x="222" y="100" width="96" height="16" rx="8" fill="#D9C9EC" stroke="#8F78AC" stroke-width="1.6"/>
      <path d="M232 104h30" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    </g>
    <path d="M252 118l-24 6M232 121l-9 5 10 2" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
    <text x="268" y="70" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.right}</text>
  </svg>`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="실에 매단 가벼운 물체 옆으로 막대를 가까이 가져가자 물체가 막대 쪽으로 기울어진 그림">
    ${bar}
    <line x1="150" y1="26" x2="186" y2="118" stroke="#B0B8C1" stroke-width="1.8"/>
    <circle cx="190" cy="130" r="15" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.8"/>
    <text x="128" y="166" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.left}</text>
    <g transform="rotate(24 262 108)">
      <rect x="222" y="100" width="96" height="16" rx="8" fill="#D9C9EC" stroke="#8F78AC" stroke-width="1.6"/>
      <path d="M232 104h30" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    </g>
    <text x="268" y="70" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.right}</text>
  </svg>`;
}

/** PF elecPairForceFig · 매달린 대전체 A·B·C와 두 쌍의 힘 관계 화살표.
 *  rel1 = A·B 사이, rel2 = B·C 사이("att" 인력=마주보기 · "rep" 척력=등지기). 부호는 B만 인쇄. */
export function elecPairForceFig(o: { rel1: "att" | "rep"; rel2: "att" | "rep"; bSign: "+" | "-" }): string {
  const ball = (x: number, name: string, sign?: string): string =>
    `<line x1="${x}" y1="24" x2="${x}" y2="78" stroke="#B0B8C1" stroke-width="1.6"/>
     <circle cx="${x}" cy="96" r="19" fill="${sign ? "#FFF7E0" : "#F0F3F7"}" stroke="#9DAABD" stroke-width="1.8"/>
     <text x="${x}" y="${sign ? 102 : 101}" text-anchor="middle" font-size="${sign ? 14 : 13}" font-weight="800" fill="#4E5968">${sign ?? "?"}</text>
     <text x="${x}" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${name}</text>`;
  const arr = (x1: number, x2: number): string =>
    `<path d="M${x1} 96H${x2}" stroke="#F0A422" stroke-width="2.4"/><path d="M${x2} 96l${x1 < x2 ? -8 : 8} -4.6v9.2z" fill="#F0A422"/>`;
  const pair = (cx: number, rel: "att" | "rep"): string =>
    rel === "att" ? arr(cx - 26, cx - 6) + arr(cx + 26, cx + 6) : arr(cx - 6, cx - 26) + arr(cx + 6, cx + 26);
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="실에 매단 대전체 A, B, C 사이에 작용하는 힘의 방향이 화살표로 표시된 그림 · B의 전기 종류만 적혀 있다">
    <line x1="30" y1="24" x2="314" y2="24" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    ${ball(70, "A")}${ball(172, "B", `(${o.bSign === "+" ? "+" : "−"})`)}${ball(274, "C")}
    ${pair(121, o.rel1)}${pair(223, o.rel2)}
  </svg>`;
}

/** SC elecScopeChoicesFig · 검전기 전하 분포 5컷 고르기(그림이 곧 선택지 · shuffle:false 전용).
 *  pol = 가까이 가져간 대전체의 부호. 물리 정답 컷은 ②에 고정(라벨형 정답 위치 설계 관행):
 *  (−)대전체 기준 · 금속판 (+)·금속박 (−)·박 벌어짐. 미끼 = ①부호 반전 ③벌어짐 누락 ④양쪽 (+) ⑤양쪽 (−)닫힘. */
export function elecScopeChoicesFig(o: { pol: "+" | "-" }): string {
  const near = o.pol === "-" ? "p" : "m";
  const far = o.pol === "-" ? "m" : "p";
  const sgn = (k: string, x: number, y: number): string => (k === "p" ? pch(x, y, 3.6) : mch(x, y, 3.6));
  const cell = (x: number, num: string, plate: string, foil: string, open: boolean): string => {
    const foilPath = open
      ? `<path d="M33 40l-6 16M33 40l6 16" stroke="#D9B44A" stroke-width="2.4" stroke-linecap="round"/>`
      : `<path d="M33 40l-1.6 16M33 40l1.6 16" stroke="#D9B44A" stroke-width="2.4" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} 0)">
      <text x="33" y="13" text-anchor="middle" font-size="12" font-weight="800" fill="#4E5968">${num}</text>
      <ellipse cx="33" cy="22" rx="15" ry="4.5" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.4"/>
      <rect x="31" y="26" width="4" height="14" fill="#B7C2CE" stroke="#8C99A8" stroke-width="1"/>
      <rect x="12" y="32" width="42" height="34" rx="5" fill="rgba(224,238,250,.35)" stroke="#9DAABD" stroke-width="1.4"/>
      ${foilPath}
      ${sgn(plate, 24, 22)}${sgn(plate, 33, 22)}${sgn(plate, 42, 22)}
      ${sgn(foil, 26, 60)}${sgn(foil, 40, 60)}
    </g>`;
  };
  return `<svg viewBox="0 0 344 78" ${NS} fill="none" role="img" aria-label="검전기의 금속판과 금속박에 표시된 전하 분포와 금속박이 벌어진 모습이 서로 다른 다섯 가지 그림 · 번호 ①부터 ⑤">
    ${cell(2, "①", far, near, true)}
    ${cell(70, "②", near, far, true)}
    ${cell(138, "③", near, far, false)}
    ${cell(206, "④", near, near, true)}
    ${cell(274, "⑤", far, far, false)}
  </svg>`;
}

/* CF elecCircuitFig 공용 소품 · 전류 화살표는 볼트 옐로+진갈색 테두리(SCI_GUIDE 관행) */
const cfWire = (d: string): string => `<path d="${d}" stroke="#8B95A1" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
const cfBattery = (cx: number, y: number, w = 58, h = 22, flip = false): string => {
  const px = flip ? cx + w / 2 - 13 : cx - w / 2 + 13;
  const mx = flip ? cx - w / 2 + 13 : cx + w / 2 - 13;
  return `<rect x="${cx - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.8"/>
    <text x="${px}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#333D4B">+</text>
    <text x="${mx}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#333D4B">−</text>`;
};
const cfBulb = (x: number, y: number, r = 13): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3C4" stroke="#C8A23E" stroke-width="1.8"/>
   <path d="M${x - 7} ${y + 4}q3.5 -7 7 -1t7 -1" stroke="#E8963E" stroke-width="1.8" fill="none"/>`;
const cfArrow = (x: number, y: number, ang: number): string =>
  `<g transform="rotate(${ang} ${x} ${y})"><path d="M${x + 7} ${y}l-10 -6v12z" fill="#FFD400" stroke="#6E3F16" stroke-width="1.1" stroke-linejoin="round"/></g>`;

/** CF elecCircuitFig · 파라미터 회로도 워크호스. 수치는 그림 라벨로 인쇄(정보 이분) · 정답 수치는 인쇄 금지.
 *  kind: "open" 열린 스위치 회로 · "basic" 닫힌 회로+전류 화살표 ㉠ · "symbols" 기호 회로도 ㉠㉡㉢ ·
 *  "series" 같은 전구 n개 직렬(+전지 라벨) · "parallelSwitch" 병렬 두 갈래·한 갈래에만 스위치 S ·
 *  "labelR" 니크롬선 저항·전류 라벨 회로. */
export function elecCircuitFig(o: {
  kind:
    | "open"
    | "basic"
    | "symbols"
    | "series"
    | "parallelSwitch"
    | "labelR"
    | "dirs"
    | "nichromeLen"
    | "twin"
    | "battery2"
    | "parallelN"
    | "parallelAdd"
    | "branchAmps";
  bulbs?: number;
  volt?: string;
  ohm?: string;
  amp?: string;
  /** branchAmps 전용 · 인쇄할 라벨만 넘긴다(정답 값은 넘기지 않는 게 저작 규약) */
  main?: string;
  b1?: string;
  b2?: string;
}): string {
  if (o.kind === "dirs") {
    // 같은 회로 두 컷 · (가)는 전류 방향을 옳게(전지 + 왼쪽 → 시계 방향), (나)는 반대로 표시.
    // 곡선 화살표는 회전 방향 판독이 모호해 도선 위 화살표 3개로 명시(눈검수 반영 재작도).
    const mini = (ox: number, name: string, correct: boolean): string => {
      const a = (x: number, y: number, ang: number): string => cfArrow(x, y, correct ? ang : ang + 180);
      return `<text x="${ox + 62}" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${name}</text>
      ${cfWire(`M${ox + 40} 160H${ox + 8}V54h112v106h-24`)}
      ${cfBulb(ox + 64, 54, 12)}
      ${cfBattery(ox + 68, 160, 48, 20)}
      ${a(ox + 8, 104, 270)}${a(ox + 90, 54, 0)}${a(ox + 120, 110, 90)}`;
    };
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 전지와 전구 회로 두 개 · (가)와 (나)는 도선 위 화살표로 전류의 방향을 서로 반대로 표시해 두었다">
      ${mini(16, "(가)", true)}
      ${mini(196, "(나)", false)}
    </svg>`;
  }
  if (o.kind === "nichromeLen") {
    // 같은 전지·같은 굵기, 길이만 1배/2배인 니크롬선 (가)(나) 비교.
    const box = (x: number, w: number, label: string): string =>
      `<rect x="${x - w / 2}" y="40" width="${w}" height="22" rx="6" fill="#F4E6D8" stroke="#B98A5A" stroke-width="1.8"/>
       <path d="M${x - w / 2 + 7} 51l8 -6 8 6 8 -6 8 6${w > 100 ? " 8 -6 8 6 8 -6 8 6" : ""}" stroke="#B98A5A" stroke-width="1.5" fill="none"/>
       <text x="${x}" y="82" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A5A2E">${label}</text>`;
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 전지에 굵기가 같고 길이만 다른 니크롬선을 하나씩 연결한 두 회로 (가)와 (나)">
      <text x="96" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      ${cfWire("M72 160H40V51h24M128 51h24v109h-24")}
      ${box(96, 64, "길이 1배")}
      ${cfBattery(100, 160, 48, 20)}
      <text x="248" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      ${cfWire("M224 160H182V51h10M310 51h10v109h-58")}
      ${box(251, 118, "길이 2배")}
      ${cfBattery(252, 160, 48, 20)}
    </svg>`;
  }
  if (o.kind === "twin") {
    // 같은 전지·같은 전구 2개씩 · (가) 직렬 vs (나) 병렬 직접 대결.
    return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="같은 전지와 같은 전구 두 개씩으로 만든 두 회로 · (가)는 한 줄로, (나)는 두 갈래로 연결되어 있다">
      <text x="92" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      ${cfWire("M68 168H36V62h112v106h-24")}
      ${cfBulb(70, 62, 11)}${cfBulb(114, 62, 11)}
      ${cfBattery(96, 168, 48, 20)}
      <text x="252" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      ${cfWire("M228 168H196V90h112v78h-24")}
      ${cfWire("M216 90v-34h72v34")}
      ${cfBulb(252, 56, 11)}
      ${cfBulb(252, 90, 11)}
      ${cfBattery(256, 168, 48, 20)}
    </svg>`;
  }
  if (o.kind === "battery2") {
    // 전지 1개(가) vs 같은 전지 2개 직렬(나) · 전구는 같다.
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 전구에 전지 한 개를 연결한 회로 (가)와 같은 전지 두 개를 한 줄로 연결한 회로 (나)">
      <text x="92" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      ${cfWire("M68 160H36V54h112v106h-24")}
      ${cfBulb(92, 54, 12)}
      ${cfBattery(96, 160, 48, 20)}
      <text x="252" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      ${cfWire("M200 160h-4V54h112v106h-4")}
      ${cfBulb(252, 54, 12)}
      ${cfBattery(226, 160, 48, 20)}
      ${cfBattery(280, 160, 48, 20)}
    </svg>`;
  }
  if (o.kind === "parallelN") {
    // 같은 전구 n개(2~3) 병렬 + 전지 라벨(volt) · 각 갈래 전압 판독 문항용.
    const n = Math.min(3, Math.max(2, o.bulbs ?? 3));
    const ys = n === 2 ? [34, 70] : [22, 56, 90];
    return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전지 한 개에 똑같은 전구 여러 개가 갈래를 나누어 연결된 회로 · 전지의 전압이 적혀 있다">
      ${cfWire(`M134 182H56V${ys[n - 1]}h232v${182 - ys[n - 1]}h-96`)}
      ${ys
        .slice(0, n - 1)
        .map((y) => cfWire(`M120 ${ys[n - 1]}v${y - ys[n - 1]}h104v${ys[n - 1] - y}`.replace(`v0h104v0`, "h104")))
        .join("")}
      ${ys.map((y) => cfBulb(172, y, 11)).join("")}
      ${cfBattery(166, 182)}
      <text x="166" y="156" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">${o.volt ?? ""}</text>
      <text x="60" y="16" font-size="10.5" fill="#8B95A1">똑같은 전구 ${n}개</text>
    </svg>`;
  }
  if (o.kind === "parallelAdd") {
    // 병렬 2갈래 + 점선(추가 예정) 갈래 · 갈래 추가의 효과 문항용.
    return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 · 전구 한 개를 더 다는 갈래가 점선으로 표시되어 있다">
      ${cfWire("M134 182H56V90h232v92h-96")}
      ${cfWire("M120 90v-34h104v34")}
      ${cfBulb(172, 56, 11)}
      ${cfBulb(172, 90, 11)}
      <path d="M120 90v-68h104v68" stroke="#B0B8C1" stroke-width="2.6" fill="none" stroke-dasharray="7 6"/>
      <circle cx="172" cy="22" r="11" fill="none" stroke="#B0B8C1" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="298" y="26" text-anchor="end" font-size="10.5" fill="#8B95A1">추가하려는 갈래</text>
      ${cfBattery(166, 182)}
    </svg>`;
  }
  if (o.kind === "branchAmps") {
    // 병렬 두 갈래 + 전류 라벨(주어진 값만 인쇄 · 정답 값 인쇄 금지).
    return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 · 도선 위에 주어진 전류값이 적혀 있다">
      ${cfWire("M134 182H56V90h232v92h-96")}
      ${cfWire("M120 90v-34h104v34")}
      ${cfBulb(172, 56, 11)}
      ${cfBulb(172, 90, 11)}
      ${cfBattery(166, 182)}
      ${o.main ? `${cfArrow(84, 90, 0)}<text x="84" y="114" text-anchor="middle" font-size="12" font-weight="800" fill="#8A6600">${o.main}</text>` : ""}
      ${o.b1 ? `${cfArrow(200, 56, 0)}<text x="206" y="40" font-size="12" font-weight="800" fill="#8A6600">${o.b1}</text>` : ""}
      ${o.b2 ? `${cfArrow(200, 90, 0)}<text x="206" y="126" font-size="12" font-weight="800" fill="#8A6600">${o.b2}</text>` : ""}
    </svg>`;
  }
  if (o.kind === "open" || o.kind === "basic") {
    const open = o.kind === "open";
    const sw = open
      ? `<circle cx="252" cy="52" r="4" fill="#5E6B7E"/><circle cx="286" cy="52" r="4" fill="#5E6B7E"/>
         <path d="M252 52l26 -16" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
         <text x="269" y="26" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(열림)</text>`
      : `<circle cx="252" cy="52" r="4" fill="#5E6B7E"/><circle cx="286" cy="52" r="4" fill="#5E6B7E"/>
         <path d="M252 52h34" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
         <text x="269" y="30" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(닫힘)</text>`;
    const arrow = open
      ? ""
      : `${cfArrow(150, 52, 0)}<text x="150" y="34" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>`;
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지, 전구, 스위치가 도선으로 연결된 회로 그림${open ? " · 스위치는 열려 있다" : " · 도선 위에 ㉠ 화살표가 표시되어 있다"}">
      ${cfWire("M136 152H56V52h192")}${cfWire("M290 52h-2")}${cfWire("M286 52h2V152h-94")}
      ${cfBulb(96, 52)}
      ${sw}
      ${cfBattery(164, 152)}
      ${arrow}
    </svg>`;
  }
  if (o.kind === "symbols") {
    return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="전기 회로를 기호로 나타낸 회로도 · 세 부품에 ㉠, ㉡, ㉢ 표시가 있다">
      <path d="M160 140H60V44h100M184 140h100V44H184M160 44h24" stroke="#4E5968" stroke-width="2" fill="none"/>
      <path d="M160 128v24M184 134v12" stroke="#4E5968" stroke-width="2"/>
      <path d="M160 128v24" stroke="#4E5968" stroke-width="3.4"/>
      <path d="M184 122v36" stroke="#4E5968" stroke-width="1.6"/>
      <circle cx="120" cy="44" r="15" fill="none" stroke="#4E5968" stroke-width="2"/>
      <path d="M109.4 33.4l21.2 21.2M130.6 33.4l-21.2 21.2" stroke="#4E5968" stroke-width="1.8"/>
      <circle cx="240" cy="44" r="3.6" fill="#4E5968"/><circle cx="272" cy="44" r="3.6" fill="#4E5968"/>
      <path d="M240 44l26 -15" stroke="#4E5968" stroke-width="2.2" stroke-linecap="round"/>
      <text x="172" y="112" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">㉠</text>
      <path d="M172 118v14" stroke="#C4CAD2" stroke-width="1.3"/>
      <text x="120" y="84" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">㉡</text>
      <path d="M120 62v10" stroke="#C4CAD2" stroke-width="1.3"/>
      <text x="256" y="84" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">㉢</text>
      <path d="M256 62v10" stroke="#C4CAD2" stroke-width="1.3"/>
    </svg>`;
  }
  if (o.kind === "series") {
    const n = o.bulbs ?? 4;
    const xs = Array.from({ length: n }, (_, i) => 76 + (192 / (n - 1)) * i);
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지 한 개에 똑같은 전구 여러 개가 한 줄로 연결된 회로 · 전지의 전압이 적혀 있다">
      ${cfWire("M136 152H48V52h248v100h-84")}
      ${xs.map((x) => cfBulb(x, 52, 12)).join("")}
      ${cfBattery(172, 152)}
      <text x="172" y="126" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">${o.volt ?? ""}</text>
      <text x="172" y="24" text-anchor="middle" font-size="10.5" fill="#8B95A1">똑같은 전구 ${n}개</text>
    </svg>`;
  }
  if (o.kind === "parallelSwitch") {
    // 스위치 S는 병렬 구간(갈림 120 ~ 합류 224) 안(186~214)에 두어 ㉡ 갈래 전용임을 위상으로 보장.
    return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 · 한 갈래에만 스위치 S가 있고 지금은 닫혀 있다">
      ${cfWire("M134 170H56V70h232v100h-96")}
      ${cfWire("M120 70v-36h104v36")}
      ${cfBulb(172, 34, 12)}
      <text x="172" y="12" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉠</text>
      ${cfBulb(150, 70, 12)}
      <text x="150" y="98" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉡</text>
      <circle cx="186" cy="70" r="3.6" fill="#5E6B7E"/><circle cx="214" cy="70" r="3.6" fill="#5E6B7E"/>
      <path d="M186 70h28" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="214" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">스위치 S(닫힘)</text>
      ${cfBattery(166, 170)}
    </svg>`;
  }
  return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지와 니크롬선이 연결된 회로 · 그림에 적힌 값을 읽어 계산해요">
    ${cfWire("M136 152H56V52h60M228 52h60v100h-94")}
    <rect x="116" y="40" width="112" height="24" rx="6" fill="#F4E6D8" stroke="#B98A5A" stroke-width="1.8"/>
    <path d="M124 52l10 -7 10 7 10 -7 10 7 10 -7 10 7 10 -7 10 7 10 -7 10 7" stroke="#B98A5A" stroke-width="1.6" fill="none"/>
    <text x="172" y="86" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8A5A2E">니크롬선 ${o.ohm ?? ""}</text>
    ${o.amp ? `${cfArrow(268, 52, 0)}<text x="268" y="32" text-anchor="middle" font-size="12" font-weight="800" fill="#8A6600">${o.amp}</text>` : ""}
    ${o.volt ? `<text x="164" y="124" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">${o.volt}</text>` : ""}
    ${cfBattery(164, 152)}
  </svg>`;
}

/** EB elecEnergyBarFig · 전기 에너지 흐름 도식(1초 기준) · 입력 → 빛/열/운동 갈래.
 *  정답 판독이 과제이므로 aria는 값을 낭독하지 않는다. */
export function elecEnergyBarFig(o: { rows: { name: string; inW: number; parts: { label: string; w: number }[] }[] }): string {
  const H = o.rows.length * 92 + 8;
  const tone: Record<string, [string, string]> = {
    빛: ["#FFF3C4", "#C8A23E"],
    열: ["#FBE3E0", "#D06050"],
    운동: ["#E3EDFB", "#5B87C9"],
    소리: ["#EDE6FA", "#8F78AC"],
  };
  const row = (r: { name: string; inW: number; parts: { label: string; w: number }[] }, i: number): string => {
    const y = 10 + i * 92;
    const parts = r.parts
      .map((p, j) => {
        const px = 208;
        const py = y + 10 + j * 38;
        const [f, s] = tone[p.label] ?? ["#F0F3F7", "#9DAABD"];
        return `<path d="M168 ${y + 30} q20 ${py + 14 - (y + 30)} 36 ${py + 14 - (y + 30)}" stroke="#C4CAD2" stroke-width="1.8" fill="none"/>
          <path d="M${px - 6} ${py + 14}l8 -4.4v8.8z" fill="#C4CAD2"/>
          <rect x="${px + 4}" y="${py}" width="118" height="28" rx="8" fill="${f}" stroke="${s}" stroke-width="1.6"/>
          <text x="${px + 63}" y="${py + 18.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#4E5968">${p.label} ${p.w}W</text>`;
      })
      .join("");
    return `<rect x="14" y="${y + 8}" width="86" height="44" rx="9" fill="#F0F3F7" stroke="#C4CAD2" stroke-width="1.6"/>
      <text x="57" y="${y + 35}" text-anchor="middle" font-size="12" font-weight="700" fill="#333D4B">${r.name}</text>
      <path d="M100 ${y + 30}h20" stroke="#C4CAD2" stroke-width="1.8"/>
      <rect x="120" y="${y + 16}" width="48" height="28" rx="8" fill="#EAF3FC" stroke="#9FB6CE" stroke-width="1.6"/>
      <text x="144" y="${y + 34.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#2E5AA8">${r.inW}W</text>
      ${parts}`;
  };
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="전기 기구가 1초 동안 쓰는 전기 에너지가 어떤 에너지로 얼마씩 바뀌는지 나타낸 흐름 그림 · 갈래의 값을 비교해 읽어요">
    ${o.rows.map(row).join("")}
  </svg>`;
}

/** CP elecCoilPolesFig · 코일·전지·나침반 파라미터판(기존 elecCoilCompassFig 고정판과 별개).
 *  variant "one" = 열린 스위치(닫기 직전) + 코일 오른쪽 끝 나침반 ㉠(바늘 남북 그대로 · 정답 미인쇄)
 *  variant "deflected" = 닫힌 스위치 + 바늘이 돌아가 멈춘 상태(동쪽) · "열면?" 문항용
 *  variant "two" = 코일 양 끝 나침반 ㉠㉡(바늘 없는 ? 원판 · 관계 판정이 과제라 정답 미인쇄)
 *  variant "pair" = 전지 방향만 반대인 (가)(나) 두 회로 비교(바늘 남북 그대로)
 *  variant "nail" = 쇠못 전자석 + 클립. 권선 앞뒤 판독을 요구하지 않는 구도(감싸쥐기 3D 판독 금지). */
export function elecCoilPolesFig(o: { variant: "one" | "deflected" | "two" | "pair" | "nail" }): string {
  const needleE = (x: number, y: number): string =>
    `<path d="M${x + 18} ${y}l-18 7 -18 -7 18 -7z" fill="#E0452E" transform="rotate(0 ${x} ${y})"/>
     <path d="M${x - 18} ${y}l18 -7v14z" fill="#B0B8C1"/>`;
  if (o.variant === "deflected") {
    const turns = [0, 1, 2, 3, 4]
      .map((i) => `<ellipse cx="${96 + i * 22}" cy="92" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
      .join("");
    return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="코일과 전지, 닫힌 스위치로 이루어진 회로 · 코일 오른쪽 끝의 나침반 ㉠ 바늘이 옆으로 돌아가 멈춰 있다">
      ${cfWire("M85 92H74v66h57")}
      ${cfWire("M189 158h39M252 158h16v-66h-73")}
      ${turns}
      ${cfBattery(160, 150, 58, 24)}
      <circle cx="232" cy="158" r="4" fill="#5E6B7E"/><circle cx="252" cy="158" r="4" fill="#5E6B7E"/>
      <path d="M232 158h20" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="242" y="182" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(닫힘)</text>
      <circle cx="300" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      ${needleE(300, 92)}
      <text x="300" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
      <text x="140" y="62" text-anchor="middle" font-size="11" fill="#8B95A1">코일</text>
    </svg>`;
  }
  if (o.variant === "two") {
    const turns = [0, 1, 2, 3, 4]
      .map((i) => `<ellipse cx="${130 + i * 22}" cy="92" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
      .join("");
    return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="전류가 흐르는 코일의 양 끝에 나침반 ㉠과 ㉡이 하나씩 놓여 있는 회로 · 두 나침반의 바늘 방향은 가려져 있다">
      ${cfWire("M119 92h-9v66h44M229 92h9v66h-44")}
      ${turns}
      ${cfBattery(172, 150, 58, 24)}
      <circle cx="58" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <text x="58" y="99" text-anchor="middle" font-size="16" font-weight="800" fill="#8B95A1">?</text>
      <text x="58" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
      <circle cx="292" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <text x="292" y="99" text-anchor="middle" font-size="16" font-weight="800" fill="#8B95A1">?</text>
      <text x="292" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉡</text>
      <text x="174" y="56" text-anchor="middle" font-size="11" fill="#8B95A1">전류가 흐르는 코일</text>
    </svg>`;
  }
  if (o.variant === "pair") {
    const mini = (ox: number, name: string, flip: boolean): string => {
      const turns = [0, 1, 2]
        .map((i) => `<ellipse cx="${ox + 34 + i * 18}" cy="92" rx="9" ry="16" stroke="#C97F3A" stroke-width="3.4" fill="none"/>`)
        .join("");
      return `<text x="${ox + 62}" y="24" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${name}</text>
      <path d="M${ox + 27} 92h-7v54h32M${ox + 95} 92h9v54h-34" stroke="#8B95A1" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${turns}
      ${cfBattery(ox + 62, 140, 44, 18, flip)}
      <circle cx="${ox + 128}" cy="92" r="19" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <path d="M${ox + 128} 78l5.5 14 -5.5 14 -5.5 -14z" fill="#E0452E"/>
      <path d="M${ox + 128} 106l-5.5 -14h11z" fill="#B0B8C1"/>
      <text x="${ox + 128}" y="50" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">㉠</text>`;
    };
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="같은 코일과 나침반으로 만든 두 회로 (가)와 (나) · 전지의 방향만 서로 반대다">
      ${mini(8, "(가)", false)}
      ${mini(186, "(나)", true)}
    </svg>`;
  }
  if (o.variant === "one") {
    // 스위치는 아래 도선 위 열린 상태(들린 레버 + 실제 끊김) · 문두 "닫기 직전"과 일치.
    const turns = [0, 1, 2, 3, 4]
      .map((i) => `<ellipse cx="${96 + i * 22}" cy="92" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
      .join("");
    return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="코일과 전지, 열린 스위치로 이루어진 회로 · 코일의 오른쪽 끝에 나침반 ㉠이 놓여 있고 바늘은 아직 남북을 가리킨다">
      ${cfWire("M85 92H74v66h57")}
      ${cfWire("M189 158h39M256 158h12v-66h-73")}
      ${turns}
      ${cfBattery(160, 150, 58, 24)}
      <circle cx="232" cy="158" r="4" fill="#5E6B7E"/><circle cx="252" cy="158" r="4" fill="#5E6B7E"/>
      <path d="M232 158l17 -12" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="242" y="182" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(닫기 직전)</text>
      <circle cx="300" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <path d="M300 74l7 18 -7 18 -7 -18z" fill="#E0452E"/>
      <path d="M300 110l-7 -18h14z" fill="#B0B8C1"/>
      <text x="300" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
      <text x="140" y="62" text-anchor="middle" font-size="11" fill="#8B95A1">코일</text>
    </svg>`;
  }
  const turns = [0, 1, 2, 3, 4, 5]
    .map((i) => `<ellipse cx="${118 + i * 17}" cy="92" rx="8.5" ry="17" stroke="#C97F3A" stroke-width="3.4" fill="none"/>`)
    .join("");
  return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="쇠못에 코일을 감고 전지에 연결한 전자석 · 못의 뾰족한 끝에 클립이 붙어 있다">
    <path d="M96 92h-16v66h64M226 92h30v66h-40" stroke="#8B95A1" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M92 84h150l26 8 -26 8H92z" fill="#C3CBD6" stroke="#7C8798" stroke-width="1.8"/>
    ${turns}
    ${cfBattery(170, 150, 58, 24)}
    <text x="140" y="56" text-anchor="middle" font-size="11" fill="#8B95A1">쇠못에 감은 코일</text>
    <ellipse cx="266" cy="110" rx="4.5" ry="10" transform="rotate(14 266 110)" fill="none" stroke="#7C8798" stroke-width="2.2"/>
    <ellipse cx="266" cy="106.5" rx="2.6" ry="6" transform="rotate(14 266 106.5)" fill="none" stroke="#7C8798" stroke-width="1.4"/>
    <ellipse cx="280" cy="112" rx="4.5" ry="10" transform="rotate(-10 280 112)" fill="none" stroke="#7C8798" stroke-width="2.2"/>
    <ellipse cx="280" cy="108.5" rx="2.6" ry="6" transform="rotate(-10 280 108.5)" fill="none" stroke="#7C8798" stroke-width="1.4"/>
    <text x="292" y="146" text-anchor="middle" font-size="10.5" fill="#8B95A1">클립</text>
  </svg>`;
}

/** SW elecSwingExamFig · 말굽자석 틈의 코일 그네 사시도(자기장·전류·힘 3벡터는 2D 평면 불가 · 사시 관행).
 *  힘 후보 ㉮(안쪽·화면 뒤 대각)·㉯(바깥쪽·화면 앞 대각)만 표시하고 실제 힘 방향은 그리지 않는다.
 *  검산(F = IL×B · 오른손 좌표 x=오른쪽·y=위·z=화면 앞):
 *    기본: B = 아래팔(N)→위팔(S) = +y · 아래변 전류 I = 왼→오 = +x → F ∝ x̂×ŷ = +z = 앞 = ㉯.
 *    swapPoles(위 N·아래 S): B = −y → F = −z = ㉮. · revCurrent: I = −x → F = −z = ㉮.
 *    둘 다: F = +z = ㉯. 전류 반전판은 전원 (+)(−) 라벨까지 뒤집는다(극·전류 일관 관행). */
export function elecSwingExamFig(o?: { swapPoles?: boolean; revCurrent?: boolean }): string {
  const sp = o?.swapPoles ?? false;
  const rv = o?.revCurrent ?? false;
  const topPole = sp ? ["N", "#E8836B", "#A8442E"] : ["S", "#7FA6E8", "#2E5AA8"];
  const botPole = sp ? ["S", "#7FA6E8", "#2E5AA8"] : ["N", "#E8836B", "#A8442E"];
  // 사시 깊이축 = (+26, −14): 뒤(안쪽) = 오른쪽 위 대각. 슬랩 앞면 x 46~176, 틈 y 116~150.
  const slab = (y: number, [t, f, s]: string[]): string =>
    `<path d="M46 ${y}l26 -14h130l-26 14z" fill="${f}" opacity=".72" stroke="${s}" stroke-width="1.6"/>
     <path d="M176 ${y}l26 -14v20l-26 14z" fill="${f}" opacity=".55" stroke="${s}" stroke-width="1.6"/>
     <rect x="46" y="${y}" width="130" height="20" fill="${f}" stroke="${s}" stroke-width="1.8"/>
     <text x="104" y="${y + 15}" text-anchor="middle" font-size="13" font-weight="800" fill="#FFF">${t}</text>`;
  // 말굽자석 몸통(U자 연결부) · 위·아래 극 색을 반씩.
  const bridge = `<rect x="20" y="96" width="26" height="37" fill="${topPole[1]}" stroke="${topPole[2]}" stroke-width="1.8"/>
    <rect x="20" y="133" width="26" height="37" fill="${botPole[1]}" stroke="${botPole[2]}" stroke-width="1.8"/>`;
  const cur = (x: number, y: number, ang: number): string => cfArrow(x, y, rv ? ang + 180 : ang);
  // 자기장 화살표는 극 배치를 따라간다: 기본 N(아래)→S(위) = 위 방향 · swapPoles면 아래 방향.
  const field = sp
    ? `<path d="M66 120V144M61 138l5 7 5 -7" stroke="#5E6B7E" stroke-width="2" fill="none" stroke-dasharray="4 3"/>`
    : `<path d="M66 146V122M61 128l5 -7 5 7" stroke="#5E6B7E" stroke-width="2" fill="none" stroke-dasharray="4 3"/>`;
  const halo = `stroke="#FFF" stroke-width="3.4" paint-order="stroke" style="paint-order:stroke"`;
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="스탠드에 매단 코일 그네의 아래변이 옆으로 눕힌 말굽자석의 두 극 사이 틈에 들어가 있는 사시 그림 · 그네가 움직일 수 있는 두 방향에 ㉮(안쪽)와 ㉯(바깥쪽) 표시가 있다">
    <path d="M78 22h174" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <path d="M78 22v-8M252 22v-8" stroke="#8B95A1" stroke-width="3"/>
    <path d="M112 22v18M170 22v18" stroke="#6E7B8E" stroke-width="2.6"/>
    <g stroke="#C97F3A" stroke-width="4.5" fill="none" stroke-linecap="round">
      <path d="M112 40v58l-6 35M170 40v58l6 35"/>
      <path d="M104 133h74"/>
    </g>
    ${bridge}
    ${slab(96, topPole)}
    ${slab(150, botPole)}
    ${field}
    <text x="66" y="112" text-anchor="middle" font-size="10.5" font-weight="700" fill="#4E5968" ${halo}>자기장</text>
    ${cur(110, 72, 90)}${cur(136, 133, 0)}${cur(172, 72, 270)}
    <text x="192" y="64" font-size="11" font-weight="700" fill="#8A6600" ${halo}>전류</text>
    <path d="M166 130l32 -17M198 113l-4.5 9.5M198 113l-10.5 0.5" stroke="#FFF" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M166 130l32 -17M198 113l-4.5 9.5M198 113l-10.5 0.5" stroke="#04B45F" stroke-width="2.4" fill="none"/>
    <text x="204" y="104" font-size="12.5" font-weight="800" fill="#04865F" ${halo}>㉮ 안쪽</text>
    <path d="M162 140l-32 17M130 157l10.5 -0.5M130 157l4.5 -9.5" stroke="#FFF" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M162 140l-32 17M130 157l10.5 -0.5M130 157l4.5 -9.5" stroke="#E0452E" stroke-width="2.4" fill="none"/>
    <text x="128" y="186" font-size="12.5" font-weight="800" fill="#C23B2E" ${halo}>㉯ 바깥쪽</text>
    <rect x="252" y="192" width="76" height="32" rx="7" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.6"/>
    <text x="${rv ? 312 : 270}" y="213" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">+</text>
    <text x="${rv ? 270 : 312}" y="212" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">−</text>
    <text x="290" y="186" text-anchor="middle" font-size="10" fill="#8B95A1">전원</text>
    <path d="M252 200h-14V22M252 216h-22V22" stroke="#8B95A1" stroke-width="1.8" fill="none" opacity=".6"/>
  </svg>`;
}

/* ══════════ 파일럿 40문항 (슬롯 순서) ══════════ */

export const POOL_G2U7V2_PILOT: ExamItem[] = [
  /* ─ L1 마찰 전기 ─ */
  {
    // [슬롯 201] 검산: moved 1 → (가) 유리 막대 (+)3·(−)2 = 알짜 (+), (나) 명주 헝겊 (+)3·(−)4 = 알짜 (−).
    // 유리×명주는 유리가 전자를 잃는 표준 짝(교과서 대전 실험 정석). 레슨 소재(스웨터×풍선) 회피.
    id: "g2u7e201",
    lessonId: "g2u7l1",
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 유리 막대와 명주 헝겊을 마찰하기 전과 후의 전하 분포 모형이에요((가)는 유리 막대, (나)는 명주 헝겊). 마찰 후 두 물체가 띠는 전기를 옳게 짝 지은 것은?",
    figure: rubFigV2({ moved: 1 }),
    options: [
      "(가)는 (+)전기, (나)는 (−)전기를 띤다",
      "(가)는 (−)전기, (나)는 (+)전기를 띤다",
      "(가)와 (나) 모두 (+)전기를 띤다",
      "(가)와 (나) 모두 (−)전기를 띤다",
      "(가)와 (나) 모두 여전히 전기를 띠지 않는다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 (−)알갱이 개수를 세어 봐요. 마찰 전에는 두 물체 모두 (+) 3개·(−) 3개로 균형을 이룬 중성이었는데, 마찰 후 (가)는 (−)가 2개, (나)는 (−)가 4개가 됐어요. 전자 1개가 <b>(가)에서 (나)로</b> 이동한 거죠. 전자를 잃은 (가) 유리 막대는 <b>(+)전기</b>, 얻은 (나) 명주 헝겊은 <b>(−)전기</b>를 띠어요.<span class='xh'>오답 하나씩 격파</span>'(가)가 (−)'라는 짝은 <b>잃으면 (+)</b>라는 규칙을 거꾸로 적용한 함정이에요. 두 물체가 같은 부호가 되는 일은 없어요. 전자는 사라지거나 새로 생기지 않고 자리만 옮기니, 한쪽이 잃은 만큼 다른 쪽이 얻어 부호가 반드시 반대가 되죠. '여전히 중성'은 (−) 개수가 달라진 그림과 맞지 않아요.",
    core: "전자를 잃으면 (+), 얻으면 (−) · 그림에서는 (−) 개수를 센다!",
  },
  {
    // [슬롯 203] 검산: moved 2 → (가) (−) 3→1(알짜 +2)·(나) (−) 3→5(알짜 −2). ㄱ 참·ㄴ 거짓·ㄷ 참(마찰 전 3·3).
    id: "g2u7e203",
    lessonId: "g2u7l1",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 서로 다른 두 물체 (가), (나)를 마찰하기 전과 후의 전하 분포 모형이에요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: rubFigV2({ moved: 2 }),
    bogi: [
      "마찰하는 동안 전자가 (가)에서 (나)로 이동했다.",
      "마찰 후 (가)는 (−)전기를 띤다.",
      "마찰하기 전 (가)와 (나)는 전기를 띠지 않았다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ 그림에서 (가)의 (−)알갱이는 3개에서 1개로 줄고 (나)는 3개에서 5개로 늘었어요. 줄어든 2개가 그대로 옮겨 간 것, 즉 전자 2개가 <b>(가)에서 (나)로</b> 이동했죠. ㄴ: 틀려요. (가)는 전자를 <b>잃었으니 (+)전기</b>를 띠어요. 잃으면 (−)가 될 것 같은 직감을 노린 함정이에요. ㄷ: 옳아요 ✓ 마찰 전 두 물체 모두 (+) 3개·(−) 3개로 양이 같아 전기를 띠지 않는 <b>중성</b>이었어요.<span class='xh'>함정 포인트</span>이런 모형 그림 문제는 언제나 <b>(−)알갱이의 개수 변화</b>부터 세는 게 순서예요. (+)알갱이는 마찰 전후 개수가 그대로라는 것도 함께 확인해 두세요. 움직이는 건 오직 전자랍니다.",
    core: "모형 판독 순서: (−) 개수 변화부터 센다 · (+)는 늘 그대로!",
  },
  {
    // [슬롯 205] 검산: A·B 인력 → A는 B(−)와 다른 종류 = (+). B·C 척력 → C는 B와 같은 종류 = (−).
    id: "g2u7e205",
    lessonId: "g2u7l1",
    type: "mcq",
    diff: 2,
    prompt:
      "그림처럼 실에 매단 대전체 A와 B 사이에는 서로 끌어당기는 힘이, B와 C 사이에는 서로 밀어내는 힘이 작용해요. B가 (−)전기를 띤다면 A와 C가 띠는 전기는? (A, B, C는 모두 대전체예요)",
    figure: elecPairForceFig({ rel1: "att", rel2: "rep", bSign: "-" }),
    options: [
      "A는 (+)전기, C는 (−)전기",
      "A는 (−)전기, C는 (+)전기",
      "A와 C 모두 (+)전기",
      "A와 C 모두 (−)전기",
      "A는 (+)전기, C는 전기를 띠지 않는다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>두 단계로 추리해요. ① A와 B는 <b>인력</b>이에요. 다른 종류끼리 끌어당기니, B가 (−)라면 A는 <b>(+)</b>죠. ② B와 C는 <b>척력</b>이에요. 같은 종류끼리 밀어내니, C는 B와 같은 <b>(−)</b>예요.<span class='xh'>오답 하나씩 격파</span>'A가 (−), C가 (+)'는 인력·척력 규칙을 정확히 반대로 적용한 함정이에요. 다르면 당기고 같으면 민다는 순서를 다시 확인하세요. A와 C가 같은 부호라는 보기들은 두 힘 가운데 하나만 보고 판단한 결과고요. 'C는 전기를 띠지 않는다'는 성립할 수 없어요. 문제에서 C도 대전체라고 했고, 전기를 띠지 않는 물체가 <b>밀려나는 일은 없기</b> 때문이에요(끌려올 수는 있어도 밀리지는 않죠).",
    core: "다른 종류 = 인력, 같은 종류 = 척력 · 두 힘을 차례로 추리!",
  },
  {
    // [슬롯 213] 검산: 같은 물체를 같은 천으로 문지름 → 같은 종류로 대전 → 척력으로 벌어짐.
    id: "g2u7e213",
    lessonId: "g2u7l1",
    type: "mcq",
    diff: 1,
    prompt:
      "같은 털가죽으로 문지른 플라스틱 책받침 두 장을 실에 매달아 가까이 했더니, 그림처럼 서로 벌어진 채 멈췄어요. 그 까닭으로 가장 옳은 것은?",
    figure: elecHangFig({ mode: "repel", left: "문지른 책받침", right: "문지른 책받침" }),
    options: [
      "두 책받침이 같은 종류의 전기를 띠어 서로 밀어내기 때문",
      "두 책받침이 다른 종류의 전기를 띠어 서로 밀어내기 때문",
      "책받침 한 장만 전기를 띠었기 때문",
      "두 책받침 모두 전기를 띠지 않기 때문",
      "문지른 책받침이 자석의 성질을 띠게 되었기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>같은 플라스틱 책받침을 <b>같은 털가죽</b>으로 문질렀으니, 두 장 모두 같은 쪽으로 대전돼요(둘 다 전자를 얻는 쪽이죠). 같은 종류의 전기를 띤 두 물체 사이에는 <b>척력</b>이 작용하니, 실에 매달린 두 책받침이 서로 밀어내며 벌어진 채 멈춘 거예요.<span class='xh'>오답 하나씩 격파</span>'다른 종류의 전기를 띠어 밀어낸다'는 규칙 자체가 틀렸어요. 다른 종류라면 <b>끌어당겨서</b> 서로 달라붙었겠죠. 한 장만 대전됐거나 둘 다 중성이라면 밀어내는 힘이 생길 수 없어요. 중성 물체는 대전체에 끌려올 수는 있어도 밀려나지는 않거든요. 그래서 '벌어짐'은 <b>둘 다, 같은 종류로</b> 대전됐다는 확실한 증거예요. 자석의 성질은 마찰 전기와 관계없는 별개 현상이고요.",
    core: "같은 재료 짝으로 문지른 두 물체 = 같은 종류 대전 → 척력!",
  },
  {
    // [슬롯 216] 검산: moved 3 → (가) (−) 3→0·(나) (−) 3→6. 이동 전자 = 3개. v1 e16(moved 2)과 수치 교체.
    id: "g2u7e216",
    lessonId: "g2u7l1",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "개",
    prompt:
      "그림은 서로 다른 두 물체 (가), (나)를 마찰하기 전과 후의 전하 분포 모형이에요. 마찰하는 동안 (가)에서 (나)로 이동한 전자는 모두 몇 개일까요?",
    figure: rubFigV2({ moved: 3 }),
    answer: "3",
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 (−)알갱이 개수만 따라가면 돼요. ① 마찰 전: (가)도 (나)도 (−)가 3개씩이에요. ② 마찰 후: (가)는 (−)가 하나도 없고, (나)는 (−)가 6개가 됐죠. ③ (가)에서 줄어든 3개 = (나)에서 늘어난 3개. 즉 이동한 전자는 <b>3개</b>예요.<span class='xh'>함정 포인트</span>(나)의 최종 (−) 개수인 6을 답하지 않도록 조심하세요. 묻는 것은 '지금 몇 개 있나'가 아니라 <b>'몇 개가 이동했나'</b>예요. 줄어든 쪽과 늘어난 쪽의 변화량이 서로 같은지 꼭 맞춰 보고요(전자는 사라지지 않으니 반드시 같아야 해요). (+)알갱이 개수는 마찰 전후 그대로라는 것도 확인 포인트예요. 이동하는 건 언제나 전자뿐이니까요.",
    core: "이동 개수 = (−)의 변화량 · 줄어든 쪽과 늘어난 쪽이 같아야 한다!",
  },

  /* ─ L2 정전기 유도 ─ */
  {
    // [슬롯 221] 검산: (−)막대가 오른쪽 접근 → 자유 전자는 ㉡(먼 쪽)으로 밀림 → ㉠(가까운 쪽) (+)·㉡ (−).
    // 가까운 쪽 (+)와 막대 (−)의 인력이 먼 쪽 척력보다 가까워서 강함 → 깡통이 끌려 굴러옴. ㄱ 참·ㄴ 거짓·ㄷ 참.
    id: "g2u7e221",
    lessonId: "g2u7l2",
    type: "mcq",
    diff: 1,
    prompt:
      "그림처럼 (−)전기로 대전된 플라스틱 막대를 대전되지 않은 알루미늄 깡통에 가까이 가져갔어요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecCanExamFig({ pol: "-" }),
    bogi: [
      "㉠ 부분은 (+)전기를 띤다.",
      "깡통 속 자유 전자는 ㉠ 쪽으로 끌려온다.",
      "깡통은 막대 쪽으로 끌려온다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ ㉠은 (−)막대와 <b>가까운 쪽</b>이에요. 유도된 부호는 가까운 쪽이 대전체와 <b>다른 종류</b>니까 (+)죠. ㄴ: 틀려요. (−)막대는 전자를 <b>밀어내요</b>. 깡통 속 자유 전자는 막대에서 먼 ㉡ 쪽으로 밀려나고, 그래서 ㉠에 (+)가 남는 거예요. ㄷ: 옳아요 ✓ 가까운 ㉠의 (+)와 막대의 (−) 사이 인력이, 먼 ㉡의 (−)와의 척력보다 <b>거리가 가까워 더 세요</b>. 그래서 깡통은 언제나 막대 쪽으로 끌려와요.<span class='xh'>함정 포인트</span>이 단원에서 움직이는 건 오직 <b>전자</b>예요. (+)전하(원자핵)가 이동한다는 설명이 나오면 무조건 틀린 보기랍니다.",
    core: "유도: 전자만 밀리거나 끌린다 · 가까운 쪽 = 다른 종류 → 인력!",
  },
  {
    // [슬롯 223] 검산: (−)대전체를 금속판에 접근 → 전자가 먼 쪽(금속박)으로 밀림 → 판 (+)·박 (−)·
    // 박 두 장 같은 (−)끼리 척력으로 벌어짐. ㄱ 참·ㄴ 참·ㄷ 거짓(전자는 판 반대쪽으로 밀림).
    id: "g2u7e223",
    lessonId: "g2u7l2",
    type: "mcq",
    diff: 2,
    prompt:
      "그림의 검전기는 금속판, 금속 막대, 얇은 금속박 두 장이 서로 이어진 장치예요. 대전되지 않은 검전기의 금속판에 (−)대전체를 닿지 않게 가까이 가져갔어요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecScopeFig(),
    bogi: [
      "금속판과 금속박은 서로 다른 종류의 전기를 띠게 된다.",
      "밀려난 전자들은 금속 막대를 타고 금속박 쪽으로 이동한다.",
      "검전기 속 자유 전자는 금속판 쪽으로 끌려온다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ (−)대전체가 전자를 밀어내면 전자가 떠난 금속판과 전자가 모인 금속박은 <b>서로 다른 종류</b>의 전기를 띠게 돼요. 한 몸의 양 끝이 나뉘는 유도의 기본 구조죠. ㄴ: 옳아요 ✓ 밀려난 전자들의 이동 통로가 바로 <b>금속 막대</b>예요. 판·막대·박이 이어져 있어서 전자가 그 길을 타고 박까지 내려가요. ㄷ: 틀려요. (−)대전체는 전자를 끌어오는 게 아니라 <b>밀어내요</b>. 전자는 판에서 먼 쪽, 즉 박 쪽으로 이동해요.<span class='xh'>함정 포인트</span>검전기는 대전체가 <b>닿지 않아도</b> 반응해요. 금속박이 벌어졌다는 것만으로 '가까이 온 물체가 대전체구나'를 알 수 있는 장치라는 점이 핵심이에요.",
    core: "검전기: 전자가 밀리거나 끌려 이동 → 박 두 장이 같은 부호로 벌어짐!",
  },
  {
    // [슬롯 224] 검산: (−)대전체 접근 → 정답 컷 = 판 (+)·박 (−)·벌어짐 = ②. ①은 부호 반전, ③은 벌어짐
    // 누락, ④는 양쪽 (+) 복제, ⑤는 대전체 부호 복제(양쪽 (−))·닫힘. shuffle:false(그림 번호 라벨).
    id: "g2u7e224",
    lessonId: "g2u7l2",
    type: "mcq",
    diff: 2,
    prompt:
      "검전기는 금속판, 금속 막대, 얇은 금속박 두 장이 서로 이어진 장치예요. 대전되지 않은 검전기의 금속판에 (−)대전체를 닿지 않게 가까이 가져갔을 때, 검전기의 전하 분포와 금속박의 모습으로 옳은 것을 그림의 ①~⑤에서 고르면?",
    figure: elecScopeChoicesFig({ pol: "-" }),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>세 가지를 차례로 확인해요. ① 가까운 금속판: (−)대전체가 전자를 밀어내니 <b>(+)</b>. ② 먼 금속박: 밀려난 전자가 모여 <b>(−)</b>. ③ 박의 모습: 두 장이 같은 (−)로 대전됐으니 척력으로 <b>벌어짐</b>. 세 조건을 모두 만족하는 그림이 정답이에요.<span class='xh'>오답 하나씩 격파</span>판이 (−)·박이 (+)인 그림은 부호를 통째로 뒤집은 함정이에요. 전자가 어느 쪽으로 밀리는지부터 따지면 안 헷갈려요. 판과 박의 부호는 맞는데 박이 <b>닫혀 있는</b> 그림은 마지막 확인을 빠뜨린 것이고요(같은 부호 두 장은 반드시 벌어져요). 양쪽이 모두 같은 부호인 그림들은 '한쪽에서 밀려난 만큼 다른 쪽에 모인다'는 유도의 기본 구조와 어긋나요.",
    core: "판독 3단계: 가까운 판 부호 → 먼 박 부호 → 벌어짐 여부!",
  },
  {
    // [슬롯 225] 검산: 물줄기 휨은 정전기 유도(물 표면 전하 재배치 → 가까운 쪽 반대 부호 → 인력).
    // 유도는 대전체의 부호와 무관하게 언제나 인력 → 반대 부호로 바꿔도 같은 방향으로 휜다.
    id: "g2u7e225",
    lessonId: "g2u7l2",
    type: "mcq",
    diff: 1,
    prompt:
      "사진은 가늘게 흐르는 물줄기 옆에 문질러 대전시킨 플라스틱 관을 가까이 댄 모습이에요. 물줄기는 관 쪽으로 휘어지고 있어요. 이 관을 <b>반대 종류의 전기</b>로 대전시켜 같은 자리에 가까이 하면 물줄기는 어떻게 될까요?",
    figure: ximg("water-bend.webp", "가는 물줄기가 옆에 놓인 대전된 흰색 플라스틱 관 쪽으로 휘어지는 실제 실험 사진"),
    options: [
      "그래도 관 쪽으로 휘어진다",
      "이번에는 관 반대쪽으로 휘어진다",
      "휘어지지 않고 곧게 떨어진다",
      "물줄기가 끊어져 버린다",
      "부호를 알기 전에는 판단할 수 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>물줄기가 휘는 건 <b>정전기 유도</b> 때문이에요. 대전된 관을 가까이 하면 물에서 전하가 재배치되어, 관과 <b>가까운 쪽에는 언제나 관과 다른 종류</b>의 전기가 유도돼요. 다른 종류끼리는 인력이니 물줄기는 관 쪽으로 끌리죠. 관의 부호를 반대로 바꿔도 가까운 쪽 부호가 함께 반대로 바뀌니, 결과는 똑같이 <b>인력</b>이에요.<span class='xh'>오답 하나씩 격파</span>'반대쪽으로 휜다'는 유도를 직접 대전으로 착각한 답이에요. 물줄기가 처음부터 한 부호로 대전돼 있었다면 부호에 따라 밀릴 수도 있겠지만, 물은 <b>중성</b>이라 늘 끌리기만 해요. 그래서 '부호를 알아야 판단할 수 있다'도 틀려요. 유도에 의한 힘은 부호와 무관하게 인력 한 가지랍니다.",
    core: "유도로 끌리는 힘은 대전체의 부호와 무관 · 언제나 인력!",
  },
  {
    // [슬롯 231] 검산: 물줄기 휨·랩 달라붙음 = 유도(중성 물체의 전하 재배치). 클립·나침반은 자기력(무관),
    // 두 대전체의 척력은 유도가 아니라 대전체끼리의 전기력. 감사 e35(개수 세기 num)의 multi 전환 시연.
    id: "g2u7e231",
    lessonId: "g2u7l2",
    type: "multi",
    diff: 1,
    prompt: "다음 중 <b>정전기 유도</b>로 설명할 수 있는 현상을 모두 고르세요.",
    options: [
      "문지른 플라스틱 관에 가는 물줄기가 끌려 휜다",
      "포장 랩이 그릇에 착 달라붙는다",
      "자석에 철 클립이 달라붙는다",
      "같은 천으로 문지른 두 풍선이 서로 밀어낸다",
      "나침반 바늘이 북쪽을 가리킨다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>정전기 유도는 <b>대전체가 중성 물체의 전하를 재배치</b>시켜 끌어당기는 현상이에요. 중성인 물줄기가 대전된 관에 끌려 휘는 것, 벗기면서 대전된 포장 랩이 중성인 그릇을 끌어당겨 달라붙는 것이 딱 이 구조죠. 둘 다 '문지르지 않은 물체가 끌려온다'는 공통점이 있어요.<span class='xh'>오답 하나씩 격파</span>자석에 클립이 붙는 것과 나침반 바늘이 북쪽을 가리키는 것은 <b>자기력</b>이 하는 일이에요. 전기력과 자기력은 다른 힘이니 섞어 내면 안 돼요. 같은 천으로 문지른 두 풍선이 밀어내는 건 <b>둘 다 이미 대전된</b> 물체 사이의 척력이라, 중성 물체가 등장하는 유도와는 구조가 달라요. '어느 쪽이 중성이었나'를 따지는 게 유도 판별의 열쇠랍니다.",
    core: "유도 판별 열쇠: 중성 물체가 대전체에 끌려오는가!",
  },

  /* ─ L3 전류와 전압 ─ */
  {
    // [슬롯 241] 검산: 그림 전지 + 왼쪽·− 오른쪽, (가)=왼쪽 전선 위쪽 화살표·(나)=오른쪽 전선 아래쪽
    // 화살표(둘 다 전류 방향). 전자는 (−)극에서 나와 (+)극 쪽, 즉 전류와 반대로 이동.
    id: "g2u7e241",
    lessonId: "g2u7l3",
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 전지와 전구를 연결한 회로이고, (가)와 (나)는 도선 위에 표시한 전류의 방향이에요. 이 회로 속 전자에 대한 설명으로 옳은 것은?",
    figure: electronFlowFig(),
    options: [
      "전자는 전지의 (−)극에서 나와 (+)극 쪽으로 이동한다",
      "전자는 (가) 화살표와 같은 방향으로 이동한다",
      "전자는 전류와 같은 방향으로 이동한다",
      "전자는 전지의 (+)극에서 나와 (−)극 쪽으로 이동한다",
      "전자는 (+)전기를 띠고 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>전류의 방향은 <b>(+)극 → (−)극</b>으로 약속되어 있어요(그림의 (가)·(나) 화살표가 그 방향이죠). 그런데 실제로 도선 속을 움직이는 전자는 (−)전기를 띠어서, 전지의 <b>(−)극에서 밀려 나와 (+)극 쪽으로</b> 이동해요. 전류와 전자는 언제나 서로 반대 방향이에요.<span class='xh'>오답 하나씩 격파</span>'(가)와 같은 방향'·'전류와 같은 방향'·'(+)극에서 나온다'는 모두 같은 함정의 변형이에요. 전자를 알기 전에 과학자들이 전류 방향을 먼저 약속해 버렸고, 나중에 보니 전자는 그 반대로 움직이고 있었다는 게 이 단원 최다 출제 포인트죠. '전자가 (+)전기를 띤다'는 전자의 기본 성질부터 틀린 보기예요. 전자는 (−)전기를 띠는 알갱이랍니다.",
    core: "전류 (+)→(−) · 전자 (−)→(+) · 둘은 언제나 반대!",
  },
  {
    // [슬롯 243] 검산: 열린 스위치 = 회로가 끊김 → 전류 0. 전자는 전선을 떠나지 않고 그 자리에서
    // 불규칙하게 움직임(스위치를 닫는 순간 일제히 한 방향 정렬 이동 = 전류).
    id: "g2u7e243",
    lessonId: "g2u7l3",
    type: "mcq",
    diff: 2,
    prompt: "그림 회로의 스위치는 열려 있어요. 이때 전선 속 전자들에 대한 설명으로 가장 옳은 것은?",
    figure: elecCircuitFig({ kind: "open" }),
    options: [
      "전선 속에 그대로 있고, 제자리에서 불규칙하게 움직인다",
      "전선 밖으로 모두 빠져나간다",
      "전지 속으로 모두 모여 저장된다",
      "한 방향으로 줄지어 이동한다",
      "전자가 모두 사라진다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>전선 속에는 스위치와 상관없이 <b>자유 전자가 늘 가득</b> 들어 있어요. 스위치가 열려 회로가 끊기면 전자들을 한 방향으로 밀어 주는 흐름이 사라져서, 전자들은 제자리 부근에서 <b>불규칙하게 우왕좌왕</b>할 뿐이에요. 그래서 전류가 0인 거죠.<span class='xh'>오답 하나씩 격파</span>'한 방향으로 줄지어 이동한다'는 스위치를 <b>닫았을 때</b>의 모습이에요. 그 정렬된 흐름이 바로 전류고요. '전선 밖으로 빠져나간다'·'전지 속에 모인다'·'사라진다'는 모두 전자를 스위치가 만들어 내거나 없애는 것처럼 오해한 보기예요. 전자는 원래부터 전선 속에 있고, 스위치는 그 전자들이 <b>흐를 길을 열고 닫을 뿐</b>이라는 게 이 문제의 핵심이에요.",
    core: "전자는 늘 전선 속에 있다 · 스위치는 흐름의 길만 열고 닫는다!",
  },
  {
    // [슬롯 248] 검산: 기호 회로도에서 ㉠ = 긴 선+짧은 선(전지), ㉡ = 원 안 X(전구), ㉢ = 열린 레버(스위치).
    // 조합 보기 shuffle:false·정답 ②(첫 보기 정답 금지).
    id: "g2u7e248",
    lessonId: "g2u7l3",
    type: "mcq",
    diff: 2,
    prompt: "그림은 전기 회로를 기호로 나타낸 회로도예요. ㉠~㉢에 해당하는 부품을 옳게 짝 지은 것은?",
    figure: elecCircuitFig({ kind: "symbols" }),
    options: [
      "㉠ 전구, ㉡ 전지, ㉢ 스위치",
      "㉠ 전지, ㉡ 전구, ㉢ 스위치",
      "㉠ 전지, ㉡ 스위치, ㉢ 전구",
      "㉠ 스위치, ㉡ 전구, ㉢ 전지",
      "㉠ 전구, ㉡ 스위치, ㉢ 전지",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>회로 기호를 하나씩 읽어요. ㉠은 <b>길이가 다른 두 세로선</b>이에요. 긴 선이 (+)극, 짧고 굵은 선이 (−)극인 <b>전지</b> 기호죠. ㉡은 <b>원 안에 X</b>가 든 모양으로 <b>전구</b>를 나타내요. ㉢은 점 두 개 사이에 비스듬히 들린 막대가 있는 <b>스위치</b>(열린 상태) 기호예요.<span class='xh'>함정 포인트</span>전지 기호에서 극을 구분하는 기준은 선의 <b>길이</b>예요. 긴 쪽이 (+)라는 것까지 세트로 기억해 두면, 기호 회로도에서 전류의 방향(긴 선에서 나와 회로를 한 바퀴)이 바로 보여요. 실물 그림과 기호 회로도를 오가며 읽는 연습이 이 단원 그래프·회로 문제의 기본기랍니다.",
    core: "전지 = 긴 선(+)·짧은 선(−), 전구 = 원 안 X, 스위치 = 들린 막대!",
  },
  {
    // [슬롯 250] 검산: 1A = 1000mA → 0.45A = 450mA. 레슨 예시(1A·300mA)·v1(0.7A·700mA) 회피값.
    id: "g2u7e250",
    lessonId: "g2u7l3",
    type: "num",
    diff: 1,
    numKind: "int",
    unitLabel: "mA",
    prompt: "0.45A는 몇 mA일까요?",
    answer: "450",
    explain:
      "<span class='xh'>정답 풀이</span>전류의 단위 사이에는 <b>1A = 1000mA</b>라는 관계가 있어요. A를 mA로 바꿀 때는 1000을 <b>곱하면</b> 돼요. ① 0.45 × 1000 = 450 ② 따라서 0.45A = <b>450mA</b>예요.<span class='xh'>함정 포인트</span>0.45를 1000으로 나눠 0.00045라고 쓰면 방향을 반대로 간 거예요. 'mA(밀리암페어)의 밀리(m)는 1000분의 1'이니, 큰 단위(A)에서 작은 단위(mA)로 갈 때는 숫자가 <b>커져야</b> 맞아요. 45mA처럼 0 하나를 빠뜨리는 실수도 잦으니 곱한 뒤 자릿수를 한 번 더 확인하세요. 이 환산은 옴의 법칙 계산에서 mA를 A로 되바꿀 때도 그대로 쓰이는, 이 단원 계산의 기초 체력이랍니다.",
    core: "1A = 1000mA · A→mA는 ×1000!",
  },
  {
    // [슬롯 254] 검산: 그림 전지 + 왼쪽 → 전류는 왼쪽 전선 위로 → 위 전선에서 오른쪽(㉠ 화살표와 일치).
    // ① 참 ② 참(전자는 반대) ③ 거짓 ④ 거짓(열면 멈춤) ⑤ 거짓(전류는 (+)극에서 나옴).
    id: "g2u7e254",
    lessonId: "g2u7l3",
    type: "multi",
    diff: 1,
    prompt:
      "그림 회로의 스위치는 닫혀 있고, ㉠은 도선 위에 표시한 화살표 방향이에요. 옳은 것을 모두 고르세요.",
    figure: elecCircuitFig({ kind: "basic" }),
    options: [
      "전류는 ㉠ 방향으로 흐른다",
      "전자는 ㉠과 반대 방향으로 이동한다",
      "전자는 ㉠과 같은 방향으로 이동한다",
      "스위치를 열어도 전류는 계속 흐른다",
      "전류는 전지의 (−)극에서 나와 ㉠ 방향으로 흐른다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>전지의 (+)극에서 나온 전류는 회로를 따라 위 도선을 지나 (−)극으로 돌아가요. 그림에서 그 길을 따라가면 ㉠ 화살표 방향과 일치하죠 ✓ 그리고 전자는 전류와 <b>언제나 반대</b>이니 ㉠의 반대 방향으로 이동해요 ✓<span class='xh'>오답 하나씩 격파</span>'전자가 ㉠과 같은 방향'은 전류와 전자를 같은 것으로 뭉뚱그린 함정이에요. 흐름의 이름(전류)과 실제 알갱이(전자)의 방향이 반대라는 게 이 단원의 대표 개념이죠. '스위치를 열어도 흐른다'는 회로가 끊기면 전류가 0이 된다는 기본과 어긋나고, '(−)극에서 나온다'는 전류 방향의 약속을 뒤집은 보기예요. 전류의 출발점은 항상 <b>(+)극</b>으로 잡는답니다.",
    core: "전류는 (+)극에서 출발 · 전자는 그 반대로!",
  },

  /* ─ L4 옴의 법칙 ─ */
  {
    // [슬롯 261] 검산: 그래프 원점 직선이 (4V, 500mA) 통과 → R = 4 ÷ 0.5 = 8Ω. 눈금: vStep 1·iStep 100,
    // dot (4,500)이 교차점 위. 오답 = 0.008(mA 미환산 4/500)·125(거꾸로 500/4)·2(4×0.5 곱 함정)·500.
    id: "g2u7e261",
    lessonId: "g2u7l4",
    type: "mcq",
    diff: 1,
    prompt:
      "그래프는 어떤 니크롬선에 걸어 준 전압에 따른 전류의 세기예요. 표시된 점을 읽어 구한 이 니크롬선의 저항은?",
    figure: elecViExamFig({ lines: [{ label: "", r: 8 }], vMax: 5, vStep: 1, iMax: 500, iStep: 100, dots: [[4, 500]] }),
    options: ["8Ω", "0.008Ω", "125Ω", "2Ω", "500Ω"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>그래프의 점 하나를 읽으면 저항이 나와요. ① 표시된 점: 전압 4V일 때 전류 500mA. ② 단위 환산: 500mA = <b>0.5A</b>. ③ R = V ÷ I = 4 ÷ 0.5 = <b>8Ω</b>.<span class='xh'>오답 하나씩 격파</span>0.008Ω은 500을 A로 바꾸지 않고 4 ÷ 500을 그대로 계산한 값이에요. 세로축 단위가 <b>mA</b>인지 A인지 확인하는 게 이 유형의 첫걸음이죠. 125Ω은 500 ÷ 4처럼 <b>거꾸로 나눈</b> 함정이고요(저항은 전압을 전류로 나눠요). 2Ω은 4 × 0.5처럼 <b>곱해 버린</b> 값인데, 곱하기는 전압을 구할 때(V = IR) 쓰는 연산이죠. 500Ω은 전류 숫자를 그대로 옮긴 값이라 모두 계산 경로가 무너진 답이에요. 'mA를 A로, V를 I로 나누기' 두 가지만 지키면 틀릴 수 없는 문제랍니다.",
    core: "그래프 저항 = V ÷ I · mA는 반드시 A로 바꿔서!",
  },
  {
    // [슬롯 262] 검산: A는 r=8Ω(4V→500mA), B는 r=32Ω(4V→125mA). 같은 전압에서 전류는 A가 B의 4배,
    // 저항은 B가 A의 4배(32/8). ㄱ 참·ㄴ 참·ㄷ 거짓(가파른 A가 저항이 작다). iStep 125로 두 선 모두 눈금 위.
    id: "g2u7e262",
    lessonId: "g2u7l4",
    type: "mcq",
    diff: 2,
    prompt:
      "그래프는 니크롬선 A, B에 걸어 준 전압에 따른 전류의 세기예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecViExamFig({
      lines: [
        { label: "A", r: 8 },
        { label: "B", r: 32 },
      ],
      vMax: 4,
      vStep: 1,
      iMax: 500,
      iStep: 125,
    }),
    bogi: [
      "저항은 B가 A보다 크다.",
      "B의 저항은 A의 저항의 4배다.",
      "그래프의 기울기가 가파른 A는 저항도 크다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ 같은 전압(예: 4V)에서 A는 500mA, B는 125mA가 흘러요. 같은 전압인데 전류가 작은 <b>B의 저항이 큰</b> 거죠. ㄴ: 옳아요 ✓ A의 저항은 4 ÷ 0.5 = 8Ω, B는 4 ÷ 0.125 = 32Ω. 정확히 <b>4배</b>예요(같은 전압에서 전류가 4분의 1이니까요). ㄷ: 틀려요. 전압-전류 그래프에서 기울기가 가파르다는 건 같은 전압에 전류가 <b>많이</b> 흐른다는 뜻이라, 가파를수록 저항이 <b>작아요</b>.<span class='xh'>함정 포인트</span>'가파름 = 큼'이라는 직감을 노리는 게 이 그래프의 단골 함정이에요. 기울기와 저항은 반대로 간다는 것, 꼭 새겨 두세요.",
    core: "V-I 그래프: 가파른 직선 = 저항 작음 · 기울기와 저항은 반대!",
  },
  {
    // [슬롯 275] 검산: 원점 직선이 (6V, 500mA) 통과 → R = 6 ÷ 0.5 = 12Ω. vStep 1·iStep 100, 점이 눈금 위.
    // 레슨 앵커(10/20/30Ω·3V 세트)·v1(15Ω 6V·400mA) 회피 조합.
    id: "g2u7e275",
    lessonId: "g2u7l4",
    type: "num",
    diff: 1,
    numKind: "int",
    unitLabel: "Ω",
    prompt:
      "그래프는 어떤 니크롬선에 걸어 준 전압에 따른 전류의 세기예요. 표시된 점을 읽어 이 니크롬선의 저항을 구하면 몇 Ω일까요?",
    figure: elecViExamFig({ lines: [{ label: "", r: 12 }], vMax: 6, vStep: 1, iMax: 500, iStep: 100, dots: [[6, 500]] }),
    answer: "12",
    explain:
      "<span class='xh'>정답 풀이</span>① 표시된 점을 읽어요: 전압 6V일 때 전류 500mA. ② mA를 A로 바꿔요: 500mA = 0.5A. ③ 옴의 법칙으로 나눠요: R = V ÷ I = 6 ÷ 0.5 = <b>12Ω</b>.<span class='xh'>함정 포인트</span>6 ÷ 500 = 0.012처럼 단위를 안 바꾸고 나누면 1000배 작은 값이 나와요. 반대로 500 ÷ 6을 계산하면 83쯤 되는 엉뚱한 수가 나오죠. 이 유형의 실수는 딱 두 가지, <b>단위 환산 누락</b>과 <b>거꾸로 나누기</b>뿐이에요. 원점을 지나는 직선이라면 어느 점을 골라 읽어도 V ÷ I 값이 똑같다는 것도 확인해 두세요. 그 일정한 값이 바로 이 니크롬선의 저항이랍니다.",
    core: "R = V ÷ I · 500mA = 0.5A부터 바꾸고 나눈다!",
  },
  {
    // [슬롯 277] 검산: V = I × R = 0.25 × 28 = 7V. 수치는 그림 라벨(28Ω·0.25A)로 제시(정보 이분).
    // v1(0.5A·16Ω=8V, 0.4A·35Ω=14V) 회피 조합.
    id: "g2u7e277",
    lessonId: "g2u7l4",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "V",
    prompt:
      "그림은 니크롬선을 전지에 연결한 회로예요. 그림에 표시된 저항값과 전류값을 읽어, 니크롬선에 걸려 있는 전압을 구하면 몇 V일까요?",
    figure: elecCircuitFig({ kind: "labelR", ohm: "28Ω", amp: "0.25A" }),
    answer: "7",
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 두 값을 읽어요: 니크롬선의 저항 28Ω, 도선에 흐르는 전류 0.25A. 옴의 법칙 I = V ÷ R의 양변에 R를 곱하면 <b>V = I × R</b>이 되죠. ① V = 0.25 × 28 ② = <b>7V</b>.<span class='xh'>함정 포인트</span>28 ÷ 0.25 = 112처럼 나눠 버리면 안 돼요. 나누기는 저항이나 전류를 <b>구할 때</b> 쓰고, 전압을 구할 때는 <b>곱해요</b>. V, I, R 세 글자 중 무엇이 비어 있는지부터 확인하고 공식을 고르는 습관이 중요해요. 그리고 이 문제의 전류는 이미 A 단위(0.25A)라 환산이 필요 없었지만, mA로 주어졌다면 A로 바꾼 뒤 곱해야 한다는 것도 잊지 마세요. 0.25 × 28은 0.25 × 4 = 1을 이용해 28 ÷ 4 = 7로 암산하면 빨라요.",
    core: "전압을 구할 땐 V = I × R · 곱하기!",
  },
  {
    // [슬롯 280] 검산: A 6Ω·B 12Ω·C 24Ω(6V에서 1000/500/250mA · iStep 250 눈금 위). ㄱ 참(저항 최대 C)·
    // ㄴ 거짓(C가 A의 4배이지 A가 C의 4배가 아님)·ㄷ 참(같은 전압에서 전류 최대 = 저항 최소 = A).
    id: "g2u7e280",
    lessonId: "g2u7l4",
    type: "mcq",
    diff: 3,
    prompt:
      "그래프는 니크롬선 A, B, C에 걸어 준 전압에 따른 전류의 세기예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecViExamFig({
      lines: [
        { label: "A", r: 6 },
        { label: "B", r: 12 },
        { label: "C", r: 24 },
      ],
      vMax: 6,
      vStep: 1,
      iMax: 1000,
      iStep: 250,
    }),
    bogi: [
      "저항이 가장 큰 것은 C다.",
      "A의 저항은 C의 저항의 4배다.",
      "세 니크롬선에 같은 전압을 걸면 A에 가장 센 전류가 흐른다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ 같은 전압 6V에서 A는 1000mA, B는 500mA, C는 250mA예요. 전류가 가장 작은 <b>C의 저항이 가장 크죠</b>(계산하면 A 6Ω, B 12Ω, C 24Ω). ㄴ: 틀려요. 4배 관계는 맞지만 방향이 반대예요. <b>C의 저항이 A의 4배</b>(24 = 6 × 4)이지, A가 C의 4배가 아니에요. ㄷ: 옳아요 ✓ 저항이 가장 작은 A가 같은 전압에서 가장 센 전류를 흘려보내요.<span class='xh'>함정 포인트</span>여러 직선이 나오면 <b>같은 전압에서의 전류</b>를 세로로 비교하는 게 정석이에요. 그리고 'N배' 진술은 어느 쪽이 큰지 방향까지 맞아야 참이라는 것, 놓치기 쉬운 포인트랍니다.",
    core: "여러 직선 비교: 같은 전압에서 전류가 작을수록 저항이 크다!",
  },

  /* ─ L5 저항의 연결 ─ */
  {
    // [슬롯 281] 검산: (나) 직렬 2구 → 길 전체 방해 증가 → 전류 감소·각 전구 전압 절반 → (가)보다 어둡다.
    // ㄱ 참(어둡다)·ㄴ 거짓(직렬은 하나 빼면 회로 끊겨 모두 꺼짐)·ㄷ 참(한 줄 회로라 전류 같음).
    id: "g2u7e281",
    lessonId: "g2u7l5",
    type: "mcq",
    diff: 1,
    prompt:
      "그림의 (가)는 전구 1개, (나)는 같은 전구 2개를 한 줄로 연결한 회로예요. 전지와 전구는 모두 같아요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecTwoCircuitFig({ right: "series" }),
    bogi: [
      "(나)의 전구 하나는 (가)의 전구보다 어둡다.",
      "(나)에서 전구 한 개를 빼도 남은 전구는 계속 켜져 있다.",
      "(나)의 두 전구에는 같은 세기의 전류가 흐른다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ 전구 2개가 한 줄로 이어지면 전류가 지나는 길 전체의 방해가 커져 전류가 줄고, 전지의 전압도 두 전구가 <b>나눠</b> 받아요. 그래서 (나)의 전구 하나는 (가)보다 어둡죠. ㄴ: 틀려요. 직렬은 길이 <b>하나뿐</b>이라 전구 한 개를 빼는 순간 회로가 끊겨 <b>남은 전구도 꺼져요</b>. ㄷ: 옳아요 ✓ 길이 하나니 어느 지점이든 전류의 세기는 같아요. 두 전구에도 같은 전류가 흐르죠.<span class='xh'>함정 포인트</span>직렬의 두 문장, '전류는 같고 전압은 나눈다'를 세트로 기억하세요. 나눠 갖는 쪽이 무엇인지 바꿔치기하는 보기가 이 단원의 단골 함정이에요.",
    core: "직렬: 전류는 어디서나 같고, 전압은 나눠 받는다!",
  },
  {
    // [슬롯 283] 검산: 직렬(한 줄) 회로 → 전류는 어느 지점에서나 같음 → ㉠ = ㉡ = ㉢.
    id: "g2u7e283",
    lessonId: "g2u7l5",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 전지에 전구 두 개를 한 줄로 연결한 회로이고, ㉠·㉡·㉢은 도선 위 세 지점이에요. 세 지점에 흐르는 전류의 세기를 옳게 비교한 것은?",
    figure: elecPointsFig({ mode: "series" }),
    options: [
      "㉠ = ㉡ = ㉢",
      "㉠ > ㉡ > ㉢",
      "㉢ > ㉡ > ㉠",
      "㉠ = ㉢ > ㉡",
      "㉡ > ㉠ = ㉢",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>한 줄로 이어진 회로에서는 전류가 지나는 길이 <b>하나뿐</b>이에요. 물길 하나를 흐르는 물이 어느 지점에서나 같은 양으로 흐르듯, 전류도 전구 앞이든(㉠) 두 전구 사이든(㉡) 뒤든(㉢) 세기가 모두 같아요. 그래서 <b>㉠ = ㉡ = ㉢</b>이죠.<span class='xh'>오답 하나씩 격파</span>'㉠ > ㉡ > ㉢'처럼 뒤로 갈수록 줄어든다는 보기는 <b>전구가 전류를 써서 없앤다</b>는 대표 오개념이에요. 전구가 쓰는 것은 전기 에너지이지 전자가 아니에요. 전자는 사라지지 않고 회로를 계속 돌기 때문에, 전구를 지나도 전류의 세기는 그대로랍니다. '두 전구 사이(㉡)만 다르다'는 보기들도 같은 오개념의 변형이에요. 직렬 회로에서는 어느 지점에서 재어도 전류가 같은 값으로 나온다는 사실로 기억해 두세요.",
    core: "한 줄 회로의 전류는 어디서나 같다 · 전구는 전류를 소모하지 않는다!",
  },
  {
    // [슬롯 285] 검산: 병렬 두 갈래 중 ㉡ 갈래의 스위치 S를 열면 그 갈래만 끊김 → ㉡ 꺼짐 · ㉠은 전지
    // 전압을 그대로 받아 밝기 불변 · 전체 전류는 갈래 하나 몫만큼 감소(밝아지지 않음).
    id: "g2u7e285",
    lessonId: "g2u7l5",
    type: "mcq",
    diff: 2,
    prompt:
      "그림처럼 전지에 전구 ㉠, ㉡을 두 갈래로 연결하고, ㉡ 갈래에만 스위치 S를 두었어요(지금은 닫혀 있어요). S를 열면 어떻게 될까요?",
    figure: elecCircuitFig({ kind: "parallelSwitch" }),
    options: [
      "㉡만 꺼지고, ㉠의 밝기는 변하지 않는다",
      "㉠과 ㉡이 모두 꺼진다",
      "㉡만 꺼지고, ㉠은 전보다 밝아진다",
      "㉡만 꺼지고, ㉠은 전보다 어두워진다",
      "아무 변화도 일어나지 않는다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>병렬은 갈래마다 <b>독립된 길</b>이에요. S를 열면 ㉡ 갈래만 끊겨 ㉡은 꺼지지만, ㉠ 갈래는 멀쩡히 이어져 있죠. 그리고 ㉠에는 여전히 전지의 전압이 <b>통째로</b> 걸리니 밝기도 그대로예요.<span class='xh'>오답 하나씩 격파</span>'모두 꺼진다'는 직렬의 성질을 병렬에 잘못 얹은 보기예요. '㉠이 밝아진다'는 그럴듯한 함정인데, ㉠의 밝기를 정하는 건 ㉠에 걸린 전압이고 그 값은 S와 무관하게 전지 전압 그대로라 변하지 않아요. 변하는 것은 전지에서 나오는 <b>전체 전류</b>죠(갈래 하나가 끊기니 전체 전류는 줄어요). '어두워진다'도 같은 이유로 틀렸고요. 병렬 문제는 '각 갈래'와 '전체'를 분리해서 따지는 게 전부랍니다.",
    core: "병렬 갈래는 독립 · 남은 갈래의 전압(밝기)은 그대로, 전체 전류만 준다!",
  },
  {
    // [슬롯 293] 검산: 멀티탭 = 병렬. 기구를 하나 더 켤 때마다 갈래가 늘어 전체 저항은 작아지고,
    // 본선(콘센트→멀티탭) 전류는 갈래 전류의 합이라 커진다. 미래엔 11(본선 전류 축) 계승.
    id: "g2u7e293",
    lessonId: "g2u7l5",
    type: "mcq",
    diff: 1,
    prompt:
      "사진처럼 멀티탭 한 개에 여러 전기 기구를 꽂아 쓰고 있어요. 꽂아 둔 기구를 하나씩 더 켤 때마다, 벽 콘센트에서 멀티탭으로 들어오는 전선의 전체 전류는 어떻게 될까요?",
    figure: ximg("multitap.webp", "여러 전기 기구의 플러그가 꽂혀 있는 멀티탭 사진"),
    options: [
      "점점 커진다",
      "점점 작아진다",
      "변하지 않는다",
      "0이 된다",
      "커졌다 작아졌다를 반복한다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>멀티탭에 꽂힌 기구들은 서로 <b>병렬</b>로 연결돼요. 기구를 하나 더 켠다는 건 전류가 흐를 <b>갈래를 하나 더 여는</b> 것이라, 새 갈래의 전류가 더해져 본선(콘센트에서 들어오는 전선)의 전체 전류는 점점 <b>커져요</b>. 갈래가 늘수록 전체 저항이 작아진다고 설명해도 같은 결론이에요.<span class='xh'>오답 하나씩 격파</span>'변하지 않는다'는 각 기구에 걸리는 <b>전압</b>(220V)의 성질과 헷갈린 답이에요. 병렬에서 변하지 않는 건 갈래마다의 전압이고, 전체 전류는 갈래 수에 따라 달라져요. '작아진다'는 기구가 늘면 전기가 나뉘어 약해질 거라는 직감인데, 나뉘는 게 아니라 <b>합쳐지는</b> 쪽이 본선이죠. 그래서 한 멀티탭에 큰 기구를 너무 많이 꽂으면 본선에 과한 전류가 흘러 위험한 거랍니다.",
    core: "병렬 갈래가 늘면 본선 전류는 갈래 몫이 더해져 커진다!",
  },
  {
    // [슬롯 297] 검산: 같은 전구 4개 직렬 → 전지 전압 12V를 똑같이 나눔 → 12 ÷ 4 = 3V.
    // 레슨 앵커(4V→2V+2V)·v1(6V 2구·3구) 회피 조합.
    id: "g2u7e297",
    lessonId: "g2u7l5",
    type: "num",
    diff: 1,
    numKind: "int",
    unitLabel: "V",
    prompt:
      "그림처럼 12V 전지에 똑같은 전구 4개를 한 줄로 연결했어요. 전구 한 개에 걸리는 전압은 몇 V일까요?",
    figure: elecCircuitFig({ kind: "series", bulbs: 4, volt: "12V" }),
    answer: "3",
    explain:
      "<span class='xh'>정답 풀이</span>직렬 회로에서는 전지의 전압을 이어진 저항(전구)들이 <b>나눠</b> 받아요. 네 전구가 모두 같은 전구라 똑같이 나누니, ① 12V ÷ 4개 ② = 전구 한 개에 <b>3V</b>예요. 나눠 받은 전압을 다 더하면 12V, 전지의 전압과 같아지는지 검산해 보세요(3+3+3+3 = 12 ✓).<span class='xh'>함정 포인트</span>12V가 그대로 걸린다고 답하면 <b>병렬</b>의 성질을 직렬에 쓴 거예요. '한 줄 연결 = 전압 나눔, 두 갈래 연결 = 전압 그대로'를 짝으로 기억하세요. 그리고 '똑같이 나눈다'가 성립하는 건 <b>같은 전구끼리</b>라는 조건 덕분이에요. 저항이 다른 전구를 섞으면 저항이 큰 쪽이 전압을 더 많이 가져간다는 것까지 알아 두면 심화 문제도 든든해요.",
    core: "같은 저항의 직렬: 전지 전압 ÷ 개수 · 합치면 다시 전지 전압!",
  },

  /* ─ L6 전기 에너지의 전환 ─ */
  {
    // [슬롯 301] 검산: 220V-1300W = 220V에 연결할 때 소비 전력 1300W = 1초에 1300J.
    // ㄱ 참·ㄴ 참·ㄷ 거짓(1300은 저항이 아니라 소비 전력). 레슨(1800W)·천재 생각그물(850W) 회피.
    id: "g2u7e301",
    lessonId: "g2u7l6",
    type: "mcq",
    diff: 1,
    prompt: "그림은 전기 주전자에 붙은 표시 라벨이에요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecLabelFig({ volt: 220, watt: 1300 }),
    bogi: [
      "이 주전자의 소비 전력은 1300W다.",
      "220V 전원에 연결하면 1초에 1300J의 전기 에너지를 사용한다.",
      "1300이라는 숫자는 주전자의 저항을 뜻한다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ '220V-1300W' 라벨은 이 기구를 220V 전원에 연결했을 때 소비 전력이 <b>1300W</b>라는 뜻이에요. ㄴ: 옳아요 ✓ 소비 전력 1W는 <b>1초에 1J</b>의 전기 에너지를 쓴다는 뜻이니, 1300W는 1초마다 1300J을 쓰는 거죠. ㄷ: 틀려요. 라벨의 W 숫자는 저항이 아니라 <b>소비 전력</b>이에요. 저항의 단위는 Ω이고 라벨에는 보통 적혀 있지도 않죠.<span class='xh'>함정 포인트</span>라벨 해석의 조건도 눈여겨보세요. '220V에 연결했을 때'라는 조건이 붙어 있어서, 정한 전압에 연결해야 표시된 소비 전력대로 작동해요. 열을 내는 조리 기구가 다른 기구보다 W 숫자가 큰 편이라는 감각도 함께요.",
    core: "라벨 nW = 1초에 nJ · W는 저항이 아니라 소비 전력!",
  },
  {
    // [슬롯 303] 검산: 같은 밝기 = 빛 갈래가 10W로 같음. LED 12W = 빛 10 + 열 2 · 백열 60W = 빛 10 + 열 50.
    // 1초 소비 전기 에너지는 백열이 5배(60/12) → "LED가 더 많다"가 거짓(정답). 비상 60W·90/5% 세팅 회피.
    id: "g2u7e303",
    lessonId: "g2u7l6",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 같은 밝기로 빛나는 두 전등이 1초 동안 쓰는 전기 에너지가 어떤 에너지로 얼마씩 바뀌는지 나타낸 거예요. 옳지 <b>않은</b> 것은?",
    figure: elecEnergyBarFig({
      rows: [
        { name: "LED 전등", inW: 12, parts: [{ label: "빛", w: 10 }, { label: "열", w: 2 }] },
        { name: "백열전등", inW: 60, parts: [{ label: "빛", w: 10 }, { label: "열", w: 50 }] },
      ],
    }),
    options: [
      "두 전등이 1초에 빛으로 바꾸는 에너지의 양은 같다",
      "1초에 쓰는 전기 에너지는 LED 전등이 더 많다",
      "열로 바뀌는 에너지의 양은 백열전등이 LED 전등의 25배다",
      "같은 시간을 켜 두면 백열전등이 전기 에너지를 5배 쓴다",
      "백열전등이 1초에 쓰는 전기 에너지로 LED 전등은 5초를 켤 수 있다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 갈래 값을 비교하면 돼요. 빛 갈래는 둘 다 10W로 같지만, 들어가는 전기 에너지는 LED 12W·백열 60W예요. 1초에 쓰는 전기 에너지는 <b>백열전등이 더 많으니</b>(60 > 12), 'LED가 더 많다'는 진술이 옳지 않아 정답이에요.<span class='xh'>오답 하나씩 격파</span>나머지는 모두 그림에서 확인돼요. 빛 10W로 같으니 밝기가 같고 ✓ 열 갈래는 50W와 2W라 50 ÷ 2 = 25배가 맞고 ✓ 60 ÷ 12 = 5배라 같은 시간에 5배를 쓰며 ✓ 백열의 1초치 60J이면 12W인 LED를 60 ÷ 12 = 5초 켤 수 있죠 ✓ 이 문제의 핵심은 <b>밝기(빛 갈래)와 소비 전력(입력)을 분리</b>해서 읽는 거예요. 밝다고 전기를 많이 쓰는 게 아니라, 열로 새는 양이 승부를 가른답니다.",
    core: "같은 밝기여도 소비 전력은 다르다 · 차이는 열로 새는 양!",
  },
  {
    // [슬롯 304] 검산: 필라멘트 전구는 전기 에너지의 큰 몫을 열로 내보냄(달아올라 빛). '열이 전혀
    // 나지 않는다' 같은 극단 진술은 LED에도 거짓(적지만 열이 남 · EB 그림의 열 2W와 일관).
    id: "g2u7e304",
    lessonId: "g2u7l6",
    type: "mcq",
    diff: 1,
    prompt:
      "사진의 (가)는 LED 전구, (나)는 필라멘트 전구예요. (나)는 가는 필라멘트가 뜨겁게 달아오르면서 빛을 내요. 두 전구로 같은 밝기를 낼 때에 대한 설명으로 가장 옳은 것은?",
    figure: xpair(
      "led-bulb.webp",
      "LED 전구의 사진",
      "filament-bulb.webp",
      "안쪽의 가는 필라멘트가 노랗게 달아오른 전구의 사진",
    ),
    options: [
      "(나)는 전기 에너지의 많은 부분을 열로 내보낸다",
      "(가)에서는 열이 전혀 나지 않는다",
      "(나)가 전기 에너지를 더 적게 쓴다",
      "두 전구가 쓰는 전기 에너지의 양은 같다",
      "(가)는 전기 에너지를 주로 운동 에너지로 바꾼다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(나) 필라멘트 전구는 가는 금속 선을 뜨겁게 달궈서 그 빛을 이용해요. 빛을 내기 위해 먼저 뜨거워져야 하는 구조라, 쓰는 전기 에너지의 <b>많은 부분이 열로</b> 새어 나가죠. 그래서 같은 밝기를 내려면 (가) LED 전구보다 전기 에너지를 훨씬 많이 써야 해요.<span class='xh'>오답 하나씩 격파</span>'(가)에서는 열이 전혀 나지 않는다'는 '전혀'가 지나쳐요. LED도 <b>적지만 열이 나요</b>. 다만 그 몫이 작을 뿐이죠. '(나)가 더 적게 쓴다'와 '둘이 같다'는 열로 새는 양의 차이를 무시한 보기이고, '(가)가 운동 에너지로 바꾼다'는 전등의 역할 자체와 맞지 않아요(전등의 목적 에너지는 <b>빛</b>이에요). '전혀·모두·항상' 같은 극단 표현이 든 보기는 한 번 더 의심하는 습관이 좋아요.",
    core: "필라멘트 전구 = 달궈서 빛 · 전기의 큰 몫이 열로 샌다!",
  },
  {
    // [슬롯 305] 검산: 전기난로 = 주로 열(A)·환풍기 = 주로 운동(B)·LED 스탠드 = 둘 다 아님(C, 빛).
    // 조합 라벨 보기 shuffle:false·정답 ②. 순서도 분기(예/아니요 각자 결론 칸) 관행 준수 그림.
    id: "g2u7e305",
    lessonId: "g2u7l6",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 전기 기구를 두 가지 질문으로 A, B, C 세 칸에 나누는 순서도예요. 전기난로, 환풍기, LED 스탠드를 나눌 때 A, B, C에 들어갈 기구를 옳게 짝 지은 것은?",
    figure: elecFlowFig({ q1: "주로 열을 만드는가?", q2: "주로 움직임을 만드는가?" }),
    options: [
      "A 전기난로, B LED 스탠드, C 환풍기",
      "A 전기난로, B 환풍기, C LED 스탠드",
      "A 환풍기, B 전기난로, C LED 스탠드",
      "A LED 스탠드, B 환풍기, C 전기난로",
      "A 환풍기, B LED 스탠드, C 전기난로",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>순서도를 위에서부터 따라가요. 첫 질문 '주로 열을 만드는가?'에 '예'인 기구는 <b>전기난로</b>뿐이라 A = 전기난로. '아니요'로 내려간 기구 중 '주로 움직임을 만드는가?'에 '예'인 것은 날개를 돌리는 <b>환풍기</b>라 B = 환풍기. 남은 <b>LED 스탠드</b>는 두 질문 모두 '아니요'(주된 전환은 빛)라 C예요.<span class='xh'>오답 하나씩 격파</span>환풍기를 A에 넣은 짝은 모터가 도는 기구를 열 기구로 착각한 거예요. 판단 기준은 그 기구의 <b>목적 에너지</b>, 즉 '무엇을 하려고 쓰는 기구인가'예요. 난로는 따뜻해지려고(열), 환풍기는 공기를 움직이려고(운동), 스탠드는 밝히려고(빛) 쓰죠. LED 스탠드를 열 칸에 넣은 짝은 필라멘트 전구와 혼동한 함정이랍니다.",
    core: "분류 기준은 목적 에너지 · 난로 = 열, 환풍기 = 운동, 전등 = 빛!",
  },
  {
    // [슬롯 315] 검산: E = P × t = 75W × 20초 = 1500J. 수치 이분(75W는 그림 라벨·20초는 문두).
    // v1(40W×5초=200J) 회피 조합.
    id: "g2u7e315",
    lessonId: "g2u7l6",
    type: "num",
    diff: 1,
    numKind: "int",
    unitLabel: "J",
    prompt:
      "그림 라벨이 붙은 스탠드 조명을 220V 전원에 연결해 20초 동안 켜 두었어요. 이 조명이 사용한 전기 에너지는 몇 J일까요?",
    figure: elecLabelFig({ volt: 220, watt: 75 }),
    answer: "1500",
    explain:
      "<span class='xh'>정답 풀이</span>라벨에서 소비 전력을 읽어요: 75W, 즉 <b>1초에 75J</b>을 쓰는 조명이에요. 20초 동안이면 ① 사용한 전기 에너지 = 소비 전력 × 시간 ② = 75 × 20 ③ = <b>1500J</b>이죠.<span class='xh'>함정 포인트</span>75를 그대로 답하면 '1초 동안' 쓴 양이에요. 문제는 20초 동안의 <b>총량</b>을 물었으니 시간을 꼭 곱해야 해요. 반대로 220 × 20 = 4400처럼 라벨의 전압 숫자를 곱하는 실수도 있어요. 에너지 계산에 쓰는 숫자는 V가 아니라 <b>W</b>(소비 전력)라는 걸 구분하세요. 'W는 빠르기, J은 총량'으로 기억하면 좋아요. 소비 전력은 전기를 쓰는 속도이고, 거기에 시간을 곱한 것이 실제로 쓴 에너지랍니다.",
    core: "전기 에너지(J) = 소비 전력(W) × 시간(초)!",
  },

  /* ─ L7 전류가 만드는 자기장 ─ */
  {
    // [슬롯 321] 검산: 스위치를 닫으면 코일에 전류 → 코일 주위에 자기장 발생 → 코일 끝 나침반 바늘이
    // 움직인다. 그림은 닫기 직전(바늘 남북 그대로)이라 정답 미인쇄.
    id: "g2u7e321",
    lessonId: "g2u7l7",
    type: "mcq",
    diff: 1,
    prompt:
      "그림처럼 코일의 오른쪽 끝에 나침반 ㉠을 놓고, 스위치를 닫으려고 해요. 스위치를 닫는 순간 ㉠에서 관찰되는 일로 가장 옳은 것은?",
    figure: elecCoilPolesFig({ variant: "one" }),
    options: [
      "바늘의 방향이 바뀐다",
      "아무 변화도 일어나지 않는다",
      "바늘이 항상 북쪽만 가리키게 된다",
      "나침반이 뜨거워져 바늘이 멈춘다",
      "바늘이 두 방향을 번갈아 가리키며 계속 흔들리기만 한다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>스위치를 닫으면 코일에 전류가 흐르고, <b>전류가 흐르는 코일 주위에는 자기장이 생겨요</b>. 코일 끝에 놓인 나침반 바늘은 그 자기장의 방향을 따라 돌아가므로, 닫는 순간 바늘의 방향이 바뀌는 것을 볼 수 있어요.<span class='xh'>오답 하나씩 격파</span>'아무 변화도 없다'는 전기와 자기가 별개라는 옛 생각이에요. 전류가 자기장을 만든다는 사실이 이 레슨의 심장이죠. '항상 북쪽만 가리킨다'는 코일의 자기장이 없을 때, 즉 지구 자기장만 있을 때의 이야기예요. 코일의 자기장이 생기면 바늘은 더 가까운 코일의 자기장을 따라요. '뜨거워져 멈춘다'는 관찰과 무관한 서술이고, '계속 흔들리기만 한다'도 틀려요. 바늘은 새 자기장 방향으로 돌아가 <b>멈춰</b> 서요.",
    core: "전류가 흐르는 코일 주위에는 자기장이 생긴다 · 나침반이 그 증거!",
  },
  {
    // [슬롯 323] 검산: 그림은 열린 스위치(전류 0) → 지금은 코일 자기장 없음(ㄱ 참). 닫으면 자기장이
    // 생겨 ㉠ 바늘이 움직임(ㄴ 참). 전지 방향을 반대로 하면 전류·자기장 방향 반대 → 바늘은 처음과
    // 반대쪽으로 움직임(ㄷ 거짓).
    id: "g2u7e323",
    lessonId: "g2u7l7",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 코일과 전지, 열린 스위치로 이루어진 회로이고, 코일 끝에 나침반 ㉠이 놓여 있어요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecCoilCompassFig(),
    bogi: [
      "지금 이 코일은 주위에 자기장을 만들지 않는다.",
      "스위치를 닫으면 ㉠의 바늘이 움직인다.",
      "스위치를 닫은 채 전지의 방향만 반대로 하면, 바늘은 처음과 같은 쪽으로 움직인다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ 스위치가 열려 있어 전류가 0이니, 코일은 자기장을 만들지 못해요. 코일의 자기장은 <b>전류가 흐르는 동안만</b> 생기죠. ㄴ: 옳아요 ✓ 닫는 순간 전류가 흐르고 자기장이 생겨, 코일 끝의 바늘이 돌아가요. ㄷ: 틀려요. 전지 방향을 바꾸면 전류의 방향이 반대가 되고, 코일이 만드는 <b>자기장의 방향도 반대</b>가 돼요. 바늘은 처음과 <b>반대쪽</b>으로 움직이죠.<span class='xh'>함정 포인트</span>'방향 반전'과 '세기 변화'를 구분하세요. 전지 방향을 바꾸는 조작은 자기장의 <b>방향</b>을 뒤집을 뿐, 세기를 바꾸지 않아요. 세기를 바꾸는 조작은 전류의 세기나 감은 수를 바꾸는 것이랍니다.",
    core: "코일 자기장: 전류가 흐를 때만, 전류가 뒤집히면 방향도 뒤집힌다!",
  },
  {
    // [슬롯 329] 검산: 사진 = 코일·나침반 관찰 실험 장치. 실험의 목적 = 전류가 자기장을 만드는지 확인.
    id: "g2u7e329",
    lessonId: "g2u7l7",
    type: "mcq",
    diff: 1,
    prompt:
      "사진은 코일 옆에 나침반을 놓고 스위치를 여닫으며 바늘을 관찰하는 실험 장치예요. 이 실험으로 확인하려는 것으로 가장 알맞은 것은?",
    figure: ximg("coil-compass.webp", "책상 위 코일 옆에 나침반이 놓여 있는 실험 장치 사진"),
    options: [
      "전류가 흐르는 코일이 주위에 자기장을 만드는지",
      "코일에 전류가 흐르면 코일이 뜨거워지는지",
      "나침반 바늘로 전기를 만들 수 있는지",
      "전지의 전압이 시간이 지나면 줄어드는지",
      "코일의 색깔이 전류의 세기에 따라 변하는지",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>나침반 바늘은 <b>자기장을 눈으로 보게 해 주는 도구</b>예요. 코일 옆에 나침반을 두고 스위치를 여닫는 이유는, 전류가 흐를 때만 바늘이 움직이는지를 보아 <b>전류가 자기장을 만드는지</b> 확인하려는 거죠. 스위치를 닫을 때 바늘이 돌아가고 열면 되돌아오면, 자기장의 주인이 코일의 전류라는 확실한 증거가 돼요.<span class='xh'>오답 하나씩 격파</span>코일의 발열은 나침반으로는 알 수 없는 현상이라 이 장치의 목적이 아니에요. '나침반으로 전기를 만든다'·'코일 색이 변한다'는 실험 장치와 연결되지 않는 서술이고, 전지의 전압 변화를 보려면 나침반이 아니라 다른 도구가 필요하죠. 실험 문제는 <b>장치 구성(코일+나침반+스위치)</b>에서 목적을 역으로 읽어 내는 게 요령이에요.",
    core: "나침반 = 자기장 탐지기 · 스위치 여닫기 = 전류가 원인인지 확인!",
  },
  {
    // [슬롯 332] 검산: 자기장 존재 = 자석 주위(말굽자석·지구) + 전류가 흐르는 도선·코일 주위.
    // 스위치를 꺼 둔 전선(전류 0)·문지르지 않은 책받침(대전 0·게다가 전기 현상)은 자기장 없음.
    // 감사 e127(개수 세기 num)의 multi 전환 시연.
    id: "g2u7e332",
    lessonId: "g2u7l7",
    type: "multi",
    diff: 2,
    prompt: "주위에 자기장이 존재하는 경우를 모두 고르세요.",
    options: [
      "말굽자석 주위",
      "전류가 흐르는 코일 주위",
      "스위치를 꺼 둔 손전등 속 전선 주위",
      "문지르지 않은 플라스틱 책받침 주위",
      "지구 주위",
    ],
    answer: [0, 1, 4],
    explain:
      "<span class='xh'>정답 풀이</span>자기장은 자기력이 작용하는 공간이에요. 만드는 주인은 두 부류죠. ① <b>자석</b>: 말굽자석 주위에는 언제나 자기장이 있어요. 지구도 거대한 자석처럼 행동해서 지구 주위에 자기장이 있고, 그 덕분에 나침반이 남북을 가리켜요. ② <b>전류</b>: 전류가 흐르는 코일 주위에도 자기장이 생겨요.<span class='xh'>오답 하나씩 격파</span>스위치를 꺼 둔 전선은 <b>전류가 0</b>이라 자기장을 만들지 못해요. 전선이라는 물체가 아니라 그 속을 흐르는 전류가 자기장의 주인이거든요. 문지르지 않은 책받침은 대전조차 되지 않은 평범한 물체이고, 설령 문질러 대전시켜도 그건 <b>전기력</b>의 세계지 자기장이 아니에요. 정지한 전하와 자기장을 섞지 않는 것이 이 단원의 경계선이랍니다.",
    core: "자기장의 주인은 자석과 '흐르는' 전류 · 꺼진 전선은 아니다!",
  },
  {
    // [슬롯 336] 검산: 전자석 세기 ↑ = 감은 수 ↑ 또는 전류 ↑. 전류를 끊으면 자석 성질이 사라짐(ㄷ 거짓 ·
    // 전자석은 전류가 흐르는 동안만 자석). ㄱ 참·ㄴ 참.
    id: "g2u7e336",
    lessonId: "g2u7l7",
    type: "mcq",
    diff: 2,
    prompt:
      "그림처럼 쇠못에 코일을 감고 전지에 연결했더니, 못 끝에 클립이 붙었어요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: elecCoilPolesFig({ variant: "nail" }),
    bogi: [
      "코일을 더 많이 감으면 클립이 더 많이 붙는다.",
      "더 센 전류를 흘리면 클립이 더 많이 붙는다.",
      "전류를 끊어도 못은 계속 자석의 성질을 지닌다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요 ✓ 감은 수를 늘리면 코일이 만드는 자기장이 세져서, 못이 더 강한 자석이 되고 클립도 더 많이 붙어요. ㄴ: 옳아요 ✓ 전류를 세게 하는 것도 자기장을 세게 만드는 또 하나의 방법이에요. ㄷ: 틀려요. 이런 장치(전자석)는 <b>전류가 흐르는 동안만</b> 자석의 성질을 띠어요. 전류를 끊으면 자기장이 사라지고 클립도 떨어지죠.<span class='xh'>함정 포인트</span>'켜고 끌 수 있다'는 성질이 전자석의 가장 큰 쓸모예요. 고철 처리장 기중기가 고철을 원하는 곳에서 내려놓을 수 있는 것도, 전류를 끊는 순간 자석이 꺼지기 때문이랍니다. 세기 조절(감은 수·전류)과 방향 조절(전류 방향)도 짝으로 기억해 두세요.",
    core: "전자석: 전류가 흐르는 동안만 자석 · 감은 수와 전류로 세기 조절!",
  },

  /* ─ L8 코일이 받는 힘 · 전동기 ─ */
  {
    // [슬롯 341] 검산(F = IL×B): 그림 기본 상태 · B = N(왼)→S(오른) = +x. (가) 변 전류 = 앞→뒤(−z)
    // → F ∝ (−ẑ)×x̂ = −ŷ = 아래. (나) 변 전류 = 뒤→앞(+z) → F = +ŷ = 위. 정답 = (가) 아래·(나) 위(③).
    // 조합 라벨 보기 shuffle:false·첫 보기 정답 아님.
    id: "g2u7e341",
    lessonId: "g2u7l8",
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 N극과 S극 자석 사이에 수평으로 놓인 사각 코일이에요. 화살표 방향으로 전류가 흐를 때, 코일의 왼쪽 변 (가)와 오른쪽 변 (나)가 받는 힘의 방향을 옳게 짝 지은 것은?",
    figure: elecMotorExamFig(),
    options: [
      "(가) 위, (나) 위",
      "(가) 위, (나) 아래",
      "(가) 아래, (나) 위",
      "(가) 아래, (나) 아래",
      "(가)와 (나) 모두 힘을 받지 않는다",
    ],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>자기장 속에서 전류가 흐르는 도선은 힘을 받아요. 오른손을 쫙 펴서 <b>엄지를 전류 방향, 나머지 네 손가락을 자기장 방향(N→S)</b>으로 맞추면 손바닥이 미는 쪽이 힘의 방향이에요. (가) 변은 전류가 앞에서 뒤로 흐르니 힘이 <b>아래</b>, (나) 변은 뒤에서 앞으로 흐르니 힘이 <b>위</b>예요.<span class='xh'>오답 하나씩 격파</span>두 변이 같은 방향의 힘을 받는 짝은 성립하지 않아요. 두 변은 전류 방향이 서로 반대라 힘도 <b>반드시 반대</b>거든요. 바로 이 반대 방향 힘의 쌍이 코일을 한쪽으로 돌리는 회전을 만들고, 그것이 전동기의 원리예요. '힘을 받지 않는다'는 자기장 속에서 전류가 흐르고 있는 상황과 맞지 않아요.",
    core: "코일의 두 변은 전류가 반대 → 힘도 반대 → 그래서 돈다!",
  },
  {
    // [슬롯 342] 검산(F = IL×B · x=오른쪽·y=위·z=앞): 기본 · B = 아래팔(N)→위팔(S) = +y ·
    // 아래변 전류 I = 왼→오 = +x → F ∝ x̂×ŷ = +z = 앞 = ㉯(바깥쪽). 라벨 보기 shuffle:false·정답 ②.
    id: "g2u7e342",
    lessonId: "g2u7l8",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 말굽자석의 두 극 사이 틈에 코일 그네의 아래변이 들어가 있는 모습이에요. 화살표 방향으로 전류를 흘리는 순간, 그네가 움직이는 방향은?",
    figure: elecSwingExamFig(),
    options: ["㉮ 쪽(자석 안쪽)", "㉯ 쪽(자석 바깥쪽)", "위쪽", "아래쪽", "움직이지 않는다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>그네의 아래변은 자석 틈 속, 즉 <b>자기장 속에서 전류가 흐르는 도선</b>이에요. 자기장은 아래쪽 N극에서 위쪽 S극으로 향하고, 전류는 아래변을 따라 왼쪽에서 오른쪽으로 흘러요. 오른손을 쫙 펴 엄지를 전류, 네 손가락을 자기장에 맞추면 손바닥은 <b>㉯(바깥쪽)</b>을 밀어요. 그래서 그네는 바깥쪽으로 밀려나죠.<span class='xh'>오답 하나씩 격파</span>'위쪽·아래쪽'은 자기장의 방향과 힘의 방향을 혼동한 답이에요. 힘은 전류 방향과도, 자기장 방향과도 <b>수직인 제3의 방향</b>으로 작용해요(그래서 그림도 비스듬한 사시로 그려져 있어요). '움직이지 않는다'는 자기장 속에 전류가 흐르는데 힘이 없다는 뜻이라 틀렸고, ㉮는 손바닥의 방향을 반대로 읽은 답이에요.",
    core: "힘은 전류에도 자기장에도 수직 · 오른손 쫙 펴서 손바닥 방향!",
  },
  {
    // [슬롯 344] 검산(F = IL×B): 극 반전(B = −y)과 전류 반전(I = −x)을 둘 다 적용 → F ∝ (−x̂)×(−ŷ) =
    // x̂×ŷ = +z = 처음과 같은 방향(㉯). 반대의 반대 = 원래. 미래엔 9(통제 변인 3연속)의 조합 축.
    id: "g2u7e344",
    lessonId: "g2u7l8",
    type: "mcq",
    diff: 3,
    prompt:
      "그림의 코일 그네 실험에서, 자석의 두 극을 서로 바꾸고 전류의 방향도 동시에 반대로 했어요(전원의 (+)(−)를 반대로 연결). 그네가 받는 힘의 방향은 처음과 비교해 어떻게 될까요?",
    figure: elecSwingExamFig({ swapPoles: true, revCurrent: true }),
    options: [
      "처음과 같은 방향이다",
      "처음과 반대 방향이다",
      "힘을 받지 않게 된다",
      "위쪽으로 바뀐다",
      "전류의 세기를 알아야 판단할 수 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>힘의 방향을 뒤집는 조작은 두 가지예요: ① 전류 방향 반전 ② 자기장(자석 극) 반전. 하나만 하면 힘이 반대가 되지만, <b>둘 다 하면 반대가 두 번</b> 적용돼요. 반대의 반대는 원래 방향이니, 그네는 처음과 같은 쪽으로 밀려나요.<span class='xh'>오답 하나씩 격파</span>'반대 방향'은 두 조작 중 하나만 계산에 넣은 답이에요. 반전 조작은 <b>횟수가 홀수면 반대, 짝수면 원래</b>라고 정리하면 헷갈리지 않아요. '힘을 받지 않는다'는 반전 조작이 힘을 없앤다고 오해한 것인데, 방향 조작은 힘의 존재 여부와 무관해요. '전류의 세기를 알아야 한다'도 틀려요. 세기는 힘의 <b>크기</b>를 정할 뿐, <b>방향</b>은 전류와 자기장의 방향만으로 결정된답니다.",
    core: "방향 반전 두 번 = 원래 방향 · 홀수 번이면 반대!",
  },
  {
    // [슬롯 347] 검산: 스피커 = 자석 틈의 코일에 전류가 흐르며 힘을 받아 진동판을 떨리게 하는 장치
    // (자기장 속 전류가 받는 힘의 활용). 사진 재사용·질문 각도는 힘의 역할 축.
    id: "g2u7e347",
    lessonId: "g2u7l8",
    type: "mcq",
    diff: 1,
    prompt:
      "사진은 분해한 스피커예요. 소리를 내는 종이 진동판 뒤에 코일이 붙어 있고, 그 코일이 둥근 자석의 틈에 들어가 있어요. 스피커가 소리를 내는 원리로 가장 옳은 것은?",
    figure: ximg("speaker-coil.webp", "분해된 스피커의 종이 진동판과 둥근 자석, 코일이 보이는 사진"),
    options: [
      "자기장 속 코일이 전류에 따라 힘을 받아 진동판을 떨리게 한다",
      "코일이 뜨거워지면서 진동판을 데워 소리를 낸다",
      "자석이 소리를 빨아들였다가 내보낸다",
      "전류가 진동판에서 소리로 직접 바뀐다",
      "진동판이 전기를 만들어 코일로 보낸다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>스피커의 코일은 <b>자석의 자기장 속</b>에 들어 있어요. 코일에 전류가 흐르면 코일이 힘을 받고, 전류의 방향과 세기가 소리 신호를 따라 빠르게 바뀌면 힘의 방향도 따라 바뀌어요. 코일에 붙은 진동판이 그만큼 <b>앞뒤로 떨리면서</b> 공기를 흔들어 소리가 나는 거죠. 전동기와 같은 원리(자기장 속 전류가 받는 힘)를 회전 대신 <b>떨림</b>에 쓴 장치예요.<span class='xh'>오답 하나씩 격파</span>'코일이 뜨거워져서'는 전기다리미 같은 열 기구의 원리예요. 스피커가 열로 일한다면 소리가 그렇게 빠르게 바뀔 수 없겠죠. '자석이 소리를 빨아들인다'·'전류가 소리로 직접 바뀐다'는 중간 단계(힘과 떨림)를 건너뛴 서술이고, '진동판이 전기를 만든다'는 에너지의 방향이 거꾸로예요.",
    core: "스피커 = 자기장 속 코일이 받는 힘으로 진동판을 떨어 소리!",
  },
  {
    // [슬롯 349] 검산: 전동기 내장 = 전동 킥보드(바퀴 회전)·재봉틀(바늘 구동)·드럼 세탁기(통 회전).
    // 전기다리미·토스터는 열 기구(전동기 없음). 감사 e147(개수 세기 num)의 multi 전환 시연.
    id: "g2u7e349",
    lessonId: "g2u7l8",
    type: "multi",
    diff: 1,
    prompt: "속에 전동기가 들어 있는 기구를 모두 고르세요.",
    options: ["전동 킥보드", "재봉틀", "전기다리미", "드럼 세탁기", "토스터"],
    answer: [0, 1, 3],
    explain:
      "<span class='xh'>정답 풀이</span>전동기는 전기 에너지로 <b>회전(운동)</b>을 만드는 장치예요. 그래서 '무엇이 돌거나 움직이는가'를 물으면 답이 보여요. 전동 킥보드는 바퀴를 돌리는 전동기가 심장이고, 재봉틀은 전동기가 바늘을 빠르게 오르내리게 하며, 드럼 세탁기는 커다란 통을 전동기로 돌려 빨래를 해요.<span class='xh'>오답 하나씩 격파</span>전기다리미와 토스터는 <b>열</b>을 만드는 기구예요. 뜨거워지는 부품(열선)은 있어도 도는 부품이 없으니 전동기가 들어 있지 않죠. 기구를 판별할 때는 이름이 아니라 <b>하는 일</b>을 보세요. '돌리고 움직이면 전동기, 데우면 열선'이라는 기준 하나면 처음 보는 기구도 판별할 수 있어요. 참고로 헤어드라이어처럼 열선과 전동기(바람 팬)를 <b>둘 다</b> 가진 기구도 있답니다.",
    core: "판별 기준은 하는 일 · 돌면 전동기, 데우면 열선!",
  },
];

