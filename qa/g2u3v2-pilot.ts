// g2u3 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 6호) · 정본 설계표 qa/g2u3-v2-blueprint.md.
// 격리 저작본: 레슨 파일 무수정 · index.ts 미등록. 확대 승인분과 함께 build-g2u3v2-lessons.mjs가
// g2u3l1~l8.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 10종(LSR·LRP·LSEE·LMR·LXS·LOB·LVN·LSW·LFC·LCU)과 개조판 4종(xLAE·xLMG·xLWG·xLW4)은
// 파일럿 로컬 함수(u3 v2 관행) · 이식 때 ui/examFigures.ts "g2u3 v2" 섹션으로 승격한다.
// 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다(파일럿 미사용 모드는 PILOT_PREVIEW 부록 카드).
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커 ✓ · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) · num answer 문자열+unitLabel.
// 언어 가드 금지어 목록은 설계표 §1이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
// 핵심 서술 원칙: 뒤집힘은 "모인 빛이 교차"로 · 프리즘은 "여러 색 빛으로 갈라짐"으로.
// 광학 기하는 전부 계산(반사=미러링 · 굴절=스넬 1.33 · 상=대칭점) · 각 문항 주석 = [슬롯] 검산 노트.
import type { ExamItem } from "../src/content/exams/types";
import { lightProtractorFig, lightPixelExamFig, lightBalloonFig } from "../src/ui/examFigures";
import { twoMirrorsFig, twoLensFig } from "../src/ui/lightFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
export const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/g2u3/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
export const xpair = (a: string, altA: string, b: string, altB: string): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="${IMG_BASE}exam/g2u3/${a}" alt="${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="${IMG_BASE}exam/g2u3/${b}" alt="${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>`;

/* ══════════ 공용 소품(이식 때 examFigures "g2u3 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 광선 위 진행 방향 화살촉(V자) · examFigures lray와 동일 문법(파일럿 로컬판). */
export function ar(x1: number, y1: number, x2: number, y2: number, t: number, color: string, len = 9): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const ax = x1 + dx * t;
  const ay = y1 + dy * t;
  const wing = (sign: number): [number, number] => {
    const cos = Math.cos(0.45);
    const sin = Math.sin(0.45) * sign;
    const wx = -ux * cos + uy * sin;
    const wy = -ux * sin - uy * cos;
    return [ax + wx * len, ay + wy * len];
  };
  const [w1x, w1y] = wing(1);
  const [w2x, w2y] = wing(-1);
  return `<path d="M${w1x.toFixed(1)} ${w1y.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}L${w2x.toFixed(1)} ${w2y.toFixed(1)}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
}

/** 거울 단면 = 속이 찬 재질 몸통(사용자 파일럿 검수 반영 재작도).
 *  가는 호+빗금만으로는 볼록/오목이 안 읽힌다(호가 "부푼 곡선"으로만 보임 · 검수 지적 3건의 공통
 *  뿌리) → 반사면 호 + 평평한 등(오른쪽) + 회색 채움의 닫힌 몸통으로 그린다.
 *  볼록(벨리 왼쪽 c < p0x) = 왼쪽으로 불룩한 D자 몸통 · 오목(벨리 오른쪽 c > p0x) = 왼쪽이 파인
 *  초승달 몸통. 반사면은 항상 왼쪽 · 빗금은 등(오른쪽 평면)에. */
export function marc(p0x: number, c: number, half: number, w = 3.4): string {
  const apex = (p0x + 2 * c + p0x) / 4;
  const backX = Math.max(p0x, apex) + 10;
  const ticks = Array.from({ length: 6 }, (_, i) => {
    const y = -half + 7 + ((half * 2 - 14) * i) / 5;
    return `<line x1="${(backX - 1).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(backX + 8).toFixed(1)}" y2="${(y - 8).toFixed(1)}" stroke="#B0B8C1" stroke-width="1.6"/>`;
  }).join("");
  return `<path d="M${p0x} ${-half} Q${c} 0 ${p0x} ${half} L${backX} ${half} L${backX} ${-half} Z" fill="#E4E9F0" stroke="#8B95A1" stroke-width="1.2"/>
    <path d="M${p0x} ${-half} Q${c} 0 ${p0x} ${half}" fill="none" stroke="#5E6B7E" stroke-width="${w}" stroke-linecap="round"/>${ticks}`;
}

/** 기호 배지(㉠㉡·①~⑤ 공용). */
export function badge(x: number, y: number, t: string, r = 11): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">${t}</text>`;
}

/** xLAE 반사 각도 그림(개조판) · v1 lightAngleExamFig + spread(두 광선 사이 각 호) 옵션.
 *  mark: 표시 기준(거울면/법선/사이각) · deg: 그림에 인쇄되는 조건 각(aria 서술 허용 · 조건 값) ·
 *  spread "ask" = 사이각 호를 ?로, "show" = 사이각 값을 인쇄하고 입사각을 ?로(역산형).
 *  검산: 광선 고도각 = 거울면 기준 각(mirror는 deg 그대로 · normal은 90 minus deg ·
 *  spread-show는 90 minus 사이각/2). */
export function xLAE(o: { mark: "mirror" | "normal"; deg: number; spread?: "ask" | "show" }): string {
  const P = { x: 172, y: 150 };
  const elevDeg = o.spread === "show" ? 90 - o.deg / 2 : o.mark === "mirror" ? o.deg : 90 - o.deg;
  const rad = (elevDeg * Math.PI) / 180;
  const L = 122;
  const sx = P.x - Math.cos(rad) * L;
  const sy = P.y - Math.sin(rad) * L;
  const rx = P.x + Math.cos(rad) * L;
  const ry = P.y - Math.sin(rad) * L;
  let arcs = "";
  if (o.spread === "show") {
    arcs += `<path d="M${(P.x - Math.cos(rad) * 62).toFixed(1)} ${(P.y - Math.sin(rad) * 62).toFixed(1)} A62 62 0 0 1 ${(P.x + Math.cos(rad) * 62).toFixed(1)} ${(P.y - Math.sin(rad) * 62).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
      <text x="${P.x}" y="${P.y - 70}" text-anchor="middle" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>
      <path d="M${P.x} ${P.y - 40} A40 40 0 0 0 ${(P.x - Math.cos(rad) * 40).toFixed(1)} ${(P.y - Math.sin(rad) * 40).toFixed(1)}" stroke="#37B6D8" stroke-width="2" fill="none"/>
      <text x="${P.x - 52}" y="${P.y - 44}" font-size="13" font-weight="800" fill="#1187A6">?</text>`;
  } else {
    arcs +=
      o.mark === "mirror"
        ? `<path d="M${P.x - 52} ${P.y} A52 52 0 0 1 ${(P.x - Math.cos(rad) * 52).toFixed(1)} ${(P.y - Math.sin(rad) * 52).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
           <text x="${P.x - 88}" y="136" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>`
        : `<path d="M${P.x} ${P.y - 54} A54 54 0 0 0 ${(P.x - Math.cos(rad) * 54).toFixed(1)} ${(P.y - Math.sin(rad) * 54).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
           <text x="${P.x - 40}" y="${P.y - 62}" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>`;
    if (o.spread === "ask")
      arcs += `<path d="M${(P.x - Math.cos(rad) * 66).toFixed(1)} ${(P.y - Math.sin(rad) * 66).toFixed(1)} A66 66 0 0 1 ${(P.x + Math.cos(rad) * 66).toFixed(1)} ${(P.y - Math.sin(rad) * 66).toFixed(1)}" stroke="#37B6D8" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
      <text x="${P.x}" y="${P.y - 74}" text-anchor="middle" font-size="13" font-weight="800" fill="#1187A6">?</text>`;
  }
  const cond =
    o.spread === "show"
      ? `입사 광선과 반사 광선 사이의 각이 ${o.deg}도로 표시되어 있고 입사각 자리에 물음표가 있어요`
      : `들어오는 빛이 ${o.mark === "mirror" ? "거울 면" : "법선"}과 이루는 각이 ${o.deg}도로 표시되어 있어요` +
        (o.spread === "ask" ? ". 입사 광선과 반사 광선 사이의 각 자리에 물음표가 있어요" : "");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="수평으로 놓인 거울에 빛이 비스듬히 들어와 반사되는 그림. ${cond}">
    <line x1="30" y1="150" x2="314" y2="150" stroke="#5E6B7E" stroke-width="3.4"/>
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${44 + i * 20}" y1="150" x2="${36 + i * 20}" y2="162" stroke="#B0B8C1" stroke-width="1.6"/>`).join("")}
    <line x1="${P.x}" y1="150" x2="${P.x}" y2="30" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="6 6"/>
    <text x="${P.x + 8}" y="26" font-size="11.5" fill="#8B95A1">법선</text>
    ${arcs}
    <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <path d="M${P.x} ${P.y}L${rx.toFixed(1)} ${ry.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    ${ar(sx, sy, P.x, P.y, 0.55, "#4E5968")}
    ${ar(P.x, P.y, rx, ry, 0.55, "#4E5968")}
    <text x="${(sx - 6).toFixed(1)}" y="${(sy - 8).toFixed(1)}" font-size="11.5" fill="#4E5968">빛</text>
    <text x="292" y="176" font-size="11.5" fill="#8B95A1">거울</text>
  </svg>`;
}

/** LSR 표면 광선 다발(신작 · 파라미터형) · 비상01 돋보기 계보의 평활도 비교판.
 *  smooth: 매끈한 면 + 나란한 입사 3줄 + 나란한 반사 3줄(전부 45° 미러링).
 *  rough: 울퉁불퉁한 면 + 나란한 입사 3줄 + 제각각 반사 3줄(반사점마다 국소 법선 점선 ·
 *         낱낱은 그 법선 기준 미러링 = 법칙 성립을 기하로 보장).
 *  dir: 매끈한 유리판 + 광원 + 반사 다발이 한 방향 + 사람 A(반사 방향)·B(다른 방향).
 *  aria는 표면 상태와 배치만 서술(반사 방향의 정오 판정 낭독 금지). */
export function xLSR(kind: "smooth" | "rough" | "dir"): string {
  const inc = 42;
  const rad = (inc * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  if (kind === "dir") {
    return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="매끈한 유리판에 프로젝터 빛이 비스듬히 닿아 반사되고, 서로 다른 자리에 학생 A와 B가 서 있는 그림">
      <line x1="30" y1="160" x2="314" y2="160" stroke="#5E6B7E" stroke-width="3.6"/>
      <text x="300" y="182" font-size="11" fill="#8B95A1">유리판</text>
      <g transform="translate(52,54)"><rect x="-26" y="-16" width="44" height="30" rx="6" fill="#5E6B7E"/><circle cx="24" cy="-1" r="7" fill="#37B6D8"/></g>
      <text x="30" y="24" font-size="11" fill="#8B95A1">프로젝터</text>
      ${[0, 1].map((i) => {
        const px = 128 + i * 26;
        const sx = 74 + i * 26;
        return `<path d="M${sx} 58L${px} 160" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(sx, 58, px, 160, 0.55, "#F0A422")}
          <path d="M${px} 160L${px + 54} 58" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(px, 160, px + 54, 58, 0.6, "#F0A422")}`;
      }).join("")}
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="222" cy="46" r="9"/><path d="M222 55v26M222 64l-11 12M222 64l11 12M222 81l-9 16M222 81l9 16"/>
        <circle cx="296" cy="86" r="9"/><path d="M296 95v26M296 104l-11 12M296 104l11 12M296 121l-9 16M296 121l9 16"/>
      </g>
      <text x="222" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1B64DA">A</text>
      <text x="296" y="70" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1B64DA">B</text>
    </svg>`;
  }
  const roughSurf = `<path d="M30 160 l24 -7 l22 9 l24 -10 l23 8 l25 -8 l24 9 l23 -9 l24 8 l24 -7 l24 8 l23 -6" stroke="#5E6B7E" stroke-width="3.2" fill="none" stroke-linejoin="round"/>`;
  const smoothSurf = `<line x1="30" y1="160" x2="314" y2="160" stroke="#5E6B7E" stroke-width="3.6"/>`;
  // rough 반사점 3곳: 국소 경사각(도) · 반사 방향은 국소 법선 기준 미러링으로 계산한다.
  const tilts = [-16, 9, -27];
  const hits = [96, 172, 248];
  const beams = hits
    .map((hx, i) => {
      const hy = kind === "rough" ? 156 : 160;
      const sx = hx - dx * 110;
      const sy = hy - dy * 110;
      let out = "";
      if (kind === "smooth") {
        const ex = hx + dx * 110;
        const ey = hy - dy * 110;
        out = `<path d="M${hx} ${hy}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(hx, hy, ex, ey, 0.6, "#F0A422")}`;
      } else {
        const t = (tilts[i] * Math.PI) / 180;
        const nx = Math.sin(t);
        const ny = -Math.cos(t);
        const ix = dx;
        const iy = dy;
        const dot = ix * nx + iy * ny;
        const ox = ix - 2 * dot * nx;
        const oy = iy - 2 * dot * ny;
        const ex = hx + ox * 105;
        const ey = hy + oy * 105;
        out = `<line x1="${(hx + nx * 34).toFixed(1)}" y1="${(hy + ny * 34).toFixed(1)}" x2="${(hx - nx * 8).toFixed(1)}" y2="${(hy - ny * 8).toFixed(1)}" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="4 4"/>
          <path d="M${hx} ${hy}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(hx, hy, ex, ey, 0.6, "#F0A422")}`;
      }
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${hx} ${hy}" stroke="#4E5968" stroke-width="2.6" stroke-linecap="round"/>${ar(sx, sy, hx, hy, 0.55, "#4E5968")}${out}`;
    })
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="${kind === "smooth" ? "매끈한 표면에 나란한 빛 세 줄기가 들어와 반사되는 그림" : "울퉁불퉁한 표면에 나란한 빛 세 줄기가 들어와 반사되는 그림. 반사점마다 표면에 수직인 점선이 함께 그려져 있어요"}">
    ${kind === "smooth" ? smoothSurf : roughSurf}
    ${beams}
    <text x="298" y="186" font-size="11" fill="#8B95A1">${kind === "smooth" ? "매끈한 면" : "거친 면"}</text>
  </svg>`;
}

/** LRP 굴절 경로 그림(신작 · 파라미터형 워크호스) · 스넬 n=1.33 좌표 검산.
 *  dir "down"=공기에서 물로 · "up"=물에서 공기로. inc=입사각(도).
 *  mode "paths": 경계 통과 후 경로 후보 ①~⑤(전부 같은 색 점선) · 공간 정렬 고정 구조(§8-1).
 *  mode "obs": 물속 물체(bottom=바닥)에서 나온 빛이 굴절해 눈에 오고, 연장선 위 후보 ㉠㉡㉢
 *    (noCands면 후보 없이 연장선만 · e226 이유 고르기용).
 *  mode "vert": 수직 입사 후보(ans 자리에 직진) · "arc": 입사·굴절각 (가)(나) 호 · "both": 굴절+반사
 *    동시 작도 · "glass": 유리판 통과 · "two": 입사각 두 벌 비교.
 *  검산: down r=asin(sin i ÷ 1.33) · up r=asin(1.33 × sin i) · 반사 후보는 입사 대칭. */
export function xLRP(o: {
  dir: "down" | "up";
  inc: number;
  mode: "paths" | "obs" | "vert" | "arc" | "both" | "glass" | "two";
  ans?: number;
  scene?: "bottom" | "object";
  noCands?: boolean;
}): string {
  const P = { x: 172, y: 100 };
  const n = 1.33;
  const incR = (o.inc * Math.PI) / 180;
  const refR = o.dir === "down" ? Math.asin(Math.sin(incR) / n) : Math.asin(Math.min(0.999, Math.sin(incR) * n));
  const waterBox = (h: number): string => `<rect x="20" y="100" width="304" height="${h}" rx="8" fill="#EAF3FE"/>
    <line x1="20" y1="100" x2="324" y2="100" stroke="#7FB0E0" stroke-width="2.4"/>
    <text x="30" y="92" font-size="11.5" fill="#8B95A1">공기</text>
    <text x="30" y="120" font-size="11.5" fill="#5E86B4">물</text>
    <line x1="${P.x}" y1="16" x2="${P.x}" y2="${94 + h}" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="5 6"/>`;
  const water = waterBox(96);
  if (o.mode === "vert") {
    // 수직 입사 · 후보 = 좌우 꺾임 함정 사이에 직진(ans 자리). 검산: 입사각 0 = 굴절각 0.
    const cand = [-30, -16, -7, 18];
    const ans = o.ans ?? 4;
    let oi = 0;
    const ordered: number[] = [];
    for (let k = 1; k <= 5; k++) ordered.push(k === ans ? 0 : cand[oi++]);
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 물 표면에 수직으로 내려온 빛이 경계면에 도착한 그림. 물속에서 나아갈 경로 후보 다섯 가지가 번호로 표시되어 있어요">
      ${water}
      <path d="M${P.x} 18L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(P.x, 18, P.x, P.y, 0.55, "#4E5968")}
      ${ordered
        .map((deg, i) => {
          const a = (Math.abs(deg) * Math.PI) / 180;
          const sgn = deg < 0 ? -1 : 1;
          const ex = P.x + sgn * Math.sin(a) * 84;
          const ey = P.y + Math.cos(a) * 84;
          return `<path d="M${P.x} ${P.y}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>${badge(ex + sgn * 8, ey + 12, ["①", "②", "③", "④", "⑤"][i])}`;
        })
        .join("")}
    </svg>`;
  }
  if (o.mode === "arc" || o.mode === "both") {
    // 완성 작도(공기→물): 입사·굴절(+both는 반사까지) 실선 · 각 호는 (가)(나) 라벨(수치 미인쇄).
    const sx = P.x - Math.sin(incR) * 96;
    const sy = P.y - Math.cos(incR) * 92;
    const gx = P.x + Math.sin(refR) * 88;
    const gy = P.y + Math.cos(refR) * 88;
    const rx2 = P.x + Math.sin(incR) * 96;
    const ry2 = P.y - Math.cos(incR) * 92;
    const arc = (deg: number, up: boolean, left: boolean, r: number, lab: string): string => {
      const a = (deg * Math.PI) / 180;
      const ex = P.x + (left ? -1 : 1) * Math.sin(a) * r;
      const ey = P.y + (up ? -1 : 1) * Math.cos(a) * r;
      const y0 = up ? P.y - r : P.y + r;
      const sweep = up === left ? 0 : 1;
      return `<path d="M${P.x} ${y0} A${r} ${r} 0 0 ${sweep} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#E8961E" stroke-width="2.2" fill="none"/>
        <text x="${(P.x + (left ? -1 : 1) * (Math.sin(a / 2) * (r + 16))).toFixed(1)}" y="${(P.y + (up ? -1 : 1) * (Math.cos(a / 2) * (r + 14))).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#B26A00">${lab}</text>`;
    };
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 비스듬히 내려온 빛이 물 표면에서 ${o.mode === "both" ? "일부는 반사되고 일부는 굴절되어 물속으로 들어가는" : "굴절되어 물속으로 들어가는"} 작도 그림. 입사각 자리에 (가), 굴절각 자리에 (나) 표시가 있어요">
      ${water}
      <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(sx, sy, P.x, P.y, 0.55, "#4E5968")}
      <path d="M${P.x} ${P.y}L${gx.toFixed(1)} ${gy.toFixed(1)}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(P.x, P.y, gx, gy, 0.6, "#4E5968")}
      ${o.mode === "both" ? `<path d="M${P.x} ${P.y}L${rx2.toFixed(1)} ${ry2.toFixed(1)}" stroke="#4E5968" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>${ar(P.x, P.y, rx2, ry2, 0.6, "#4E5968")}` : ""}
      ${arc(o.inc, true, true, 46, "(가)")}
      ${arc((refR * 180) / Math.PI, false, false, 46, "(나)")}
    </svg>`;
  }
  if (o.mode === "glass") {
    // 유리판 통과 · 위 경계 굴절각 r(법선 쪽) · 아래 경계에서 원래 각으로 복귀(평행 이동).
    const gT = 78;
    const gB = 138;
    const rr = Math.asin(Math.sin(incR) / 1.5);
    const e1 = { x: 150, y: gT };
    const e2 = { x: 150 + Math.tan(rr) * (gB - gT), y: gB };
    const s = { x: e1.x - Math.sin(incR) * 78, y: gT - Math.cos(incR) * 74 };
    const out = { x: e2.x + Math.sin(incR) * 80, y: gB + Math.cos(incR) * 76 };
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기 속에 놓인 유리판을 빛이 비스듬히 통과하는 작도 그림. 유리판에 들어갈 때와 나올 때 두 경계면에서 각각 꺾이는 경로가 그려져 있어요">
      <rect x="24" y="${gT}" width="296" height="${gB - gT}" rx="6" fill="#E4F0FA" stroke="#9CBEDD" stroke-width="1.8"/>
      <text x="34" y="${gT - 8}" font-size="11.5" fill="#8B95A1">공기</text>
      <text x="34" y="${(gT + gB) / 2 + 4}" font-size="11.5" fill="#5E86B4">유리</text>
      <text x="34" y="${gB + 18}" font-size="11.5" fill="#8B95A1">공기</text>
      <line x1="${e1.x}" y1="${gT - 44}" x2="${e1.x}" y2="${gT + 34}" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 5"/>
      <line x1="${e2.x.toFixed(1)}" y1="${gB - 34}" x2="${e2.x.toFixed(1)}" y2="${gB + 44}" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 5"/>
      <path d="M${s.x.toFixed(1)} ${s.y.toFixed(1)}L${e1.x} ${e1.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      ${ar(s.x, s.y, e1.x, e1.y, 0.55, "#4E5968")}
      <path d="M${e1.x} ${e1.y}L${e2.x.toFixed(1)} ${e2.y.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      ${ar(e1.x, e1.y, e2.x, e2.y, 0.6, "#4E5968")}
      <path d="M${e2.x.toFixed(1)} ${e2.y.toFixed(1)}L${out.x.toFixed(1)} ${out.y.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      ${ar(e2.x, e2.y, out.x, out.y, 0.6, "#4E5968")}
    </svg>`;
  }
  if (o.mode === "two") {
    // 입사각 2벌(inc · inc+18) 완성 작도 · 각 벌의 굴절각은 스넬 정확 계산(관찰형).
    const mk = (i: number, color: string, lab: string): string => {
      const iR = (i * Math.PI) / 180;
      const rR = Math.asin(Math.sin(iR) / n);
      const sx = P.x - Math.sin(iR) * 92;
      const sy = P.y - Math.cos(iR) * 88;
      const gx = P.x + Math.sin(rR) * 86;
      const gy = P.y + Math.cos(rR) * 84;
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>
        ${ar(sx, sy, P.x, P.y, 0.55, color)}
        <path d="M${P.x} ${P.y}L${gx.toFixed(1)} ${gy.toFixed(1)}" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>
        ${ar(P.x, P.y, gx, gy, 0.6, color)}
        <text x="${(sx - 4).toFixed(1)}" y="${(sy - 8).toFixed(1)}" font-size="11.5" font-weight="800" fill="${color}">${lab}</text>`;
    };
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 물로 빛을 서로 다른 두 각도로 비추어, 광선 두 벌이 각각 굴절되는 모습을 한 그림에 겹쳐 그린 작도예요. 광선 A보다 광선 B가 법선에서 더 기울어 들어와요">
      ${water}
      ${mk(o.inc, "#5E6B7E", "A")}
      ${mk(Math.min(78, o.inc + 18), "#C838A6", "B")}
    </svg>`;
  }
  if (o.mode === "paths") {
    // 입사 광선: down은 공기(위)에서 · up은 물(아래)에서 경계점 P로.
    const sIn = o.dir === "down" ? -1 : 1;
    const sx = P.x - Math.sin(incR) * 96;
    const sy = P.y + sIn * Math.cos(incR) * 92;
    // 후보는 공간 정렬 고정 구조(번호가 법선→수면 순서를 따라야 오독이 없다 · §8 확정):
    // down = [과다·과다·정답 r0·직진 inc·반사] → 정답 ③ / up = [직진 inc·정답 r0·과다·과다·반사] → 정답 ②.
    const r0 = (refR * 180) / Math.PI;
    const ordered =
      o.dir === "down"
        ? [Math.max(8, r0 - 20), Math.max(16, r0 - 10), r0, o.inc, -o.inc]
        : [o.inc, r0, Math.min(70, r0 + 13), Math.min(82, r0 + 26), -o.inc];
    const sOut = o.dir === "down" ? 1 : -1;
    const paths = ordered
      .map((deg, i) => {
        const refl = deg < 0;
        const a = (Math.abs(deg) * Math.PI) / 180;
        const len = 88;
        const ex = P.x + Math.sin(a) * len;
        const ey = refl ? P.y + sIn * Math.cos(a) * len : P.y + sOut * Math.cos(a) * len;
        // 배지: 광선 끝을 광선 방향으로 연장한 자리 · 이웃과 겹치지 않게 반경을 번갈아 늘인다.
        const bd = 16 + (i % 2) * 15;
        const lx = P.x + Math.sin(a) * (len + bd);
        const ly = refl ? P.y + sIn * Math.cos(a) * (len + bd) : P.y + sOut * Math.cos(a) * (len + bd);
        return `<path d="M${P.x} ${P.y}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>
          ${badge(lx, ly, ["①", "②", "③", "④", "⑤"][i])}`;
      })
      .join("");
    return `<svg viewBox="0 ${o.dir === "up" ? -20 : 0} 344 ${o.dir === "up" ? 252 : 232}" ${NS} fill="none" role="img" aria-label="${o.dir === "down" ? "공기에서 비스듬히 내려온 빛이 물 표면에 도착한 그림" : "물속에서 비스듬히 올라온 빛이 물과 공기의 경계면에 도착한 그림"}. 경계면을 지난 뒤 빛이 나아갈 경로 후보 다섯 가지가 번호로 표시되어 있어요">
      ${waterBox(126)}
      <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(sx, sy, P.x, P.y, 0.55, "#4E5968")}
      ${paths}
    </svg>`;
  }
  // obs 모드: 물속 물체 O에서 나온 빛이 경계 Q에서 굴절해 눈 E로 · 눈의 연장선(점선) 위 ㉠㉡㉢.
  const objX = o.scene === "bottom" ? 150 : 118;
  const objY = o.scene === "bottom" ? 188 : 166;
  const upR = Math.asin(Math.min(0.999, Math.sin(incR) * n));
  const Q = { x: objX + Math.tan(incR) * (objY - 100) * 0.62, y: 100 };
  const E = { x: Q.x + Math.sin(upR) * 74, y: 100 - Math.cos(upR) * 74 };
  // 연장선: 눈에서 Q를 지나 물속으로 곧게 늘인 선 · 그 위 후보 3곳(떠 보이는 위치가 정답 자리).
  const ux = (Q.x - E.x) / Math.hypot(Q.x - E.x, Q.y - E.y);
  const uy = (Q.y - E.y) / Math.hypot(Q.x - E.x, Q.y - E.y);
  // 후보 3곳: ㉠(수면 바로 아래 · 과도) · ㉡(실제 물체보다 조금 얕음 = 정답 자리) · ㉢(실제보다 깊음).
  const cands = (o.scene === "bottom" ? [30, 56, 82] : [36, 70, 110]).map((d, i) => {
    const cx = Q.x + ux * d;
    const cy = Q.y + uy * d;
    return { cx, cy, t: ["㉠", "㉡", "㉢"][i] };
  });
  const objArt =
    o.scene === "bottom"
      ? `<path d="M${objX - 16} ${objY} h32" stroke="#8A6842" stroke-width="6" stroke-linecap="round"/><text x="${objX + 24}" y="${objY + 4}" font-size="11" fill="#5E86B4">바닥 돌</text>`
      : `<circle cx="${objX}" cy="${objY}" r="9" fill="#F5C878" stroke="#C08A3E" stroke-width="1.8"/><text x="${objX}" y="${objY + 24}" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">물체</text>`;
  return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="물속 ${o.scene === "bottom" ? "바닥" : "물체"}에서 나온 빛이 수면에서 꺾여 물 밖 눈에 들어오는 그림. ${o.noCands ? "눈에 들어온 빛을 물속으로 곧게 늘인 점선이 함께 그려져 있어요" : "눈에 들어온 빛을 곧게 늘인 점선 위에 기호 ㉠, ㉡, ㉢ 세 위치가 표시되어 있어요"}">
    ${water}
    ${objArt}
    <path d="M${objX} ${objY}L${Q.x.toFixed(1)} ${Q.y.toFixed(1)}" stroke="#F0A422" stroke-width="2.8" stroke-linecap="round"/>
    ${ar(objX, objY, Q.x, Q.y, 0.55, "#F0A422")}
    <path d="M${Q.x.toFixed(1)} ${Q.y.toFixed(1)}L${E.x.toFixed(1)} ${E.y.toFixed(1)}" stroke="#F0A422" stroke-width="2.8" stroke-linecap="round"/>
    ${ar(Q.x, Q.y, E.x, E.y, 0.6, "#F0A422")}
    <path d="M${E.x.toFixed(1)} ${E.y.toFixed(1)}L${(Q.x + ux * 96).toFixed(1)} ${(Q.y + uy * 96).toFixed(1)}" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="5 5"/>
    ${o.noCands ? "" : cands.map((c) => badge(c.cx, c.cy, c.t)).join("")}
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <path d="M${(E.x - 14).toFixed(1)} ${(E.y - 10).toFixed(1)}q12 -10 28 0q-12 10 -28 0z" fill="#fff"/>
      <circle cx="${E.x.toFixed(1)}" cy="${(E.y - 10).toFixed(1)}" r="4.2" fill="#5E86B4" stroke="none"/>
    </g>
    <text x="${(E.x + 22).toFixed(1)}" y="${(E.y - 22).toFixed(1)}" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
  </svg>`;
}

/** LSEE 물체를 보는 과정 장면(신작 · 파라미터형) · v1 lightSeePathFig(고정형) 대체.
 *  lamp: 스탠드→책 ㉠ · 책→눈 ㉡ / torch: 손전등→벽시계 ㉠ · 시계→눈 ㉡ · 눈 앞 ㉢(순서 배열용) /
 *  moon: 태양→달 ㉠ · 달→지구 사람 눈 ㉡ / window: 창밖 태양→화분 ㉠ · 화분→눈 ㉡ /
 *  water: 태양→물고기 ㉠(입수 굴절 반영) · 물고기→수면 ㉡ · 수면→눈 ㉢.
 *  경로 화살표는 전부 같은 색(순서·정오 단서 금지) · aria는 배치만 서술. */
export function xLSEE(mode: "lamp" | "torch" | "moon" | "window" | "water"): string {
  const eye = (x: number, y: number): string => `<g stroke="#3C4654" stroke-width="2.2" fill="none">
      <path d="M${x - 14} ${y}q12 -10 28 0q-12 10 -28 0z" fill="#fff"/>
      <circle cx="${x}" cy="${y}" r="4.2" fill="#5E86B4" stroke="none"/>
    </g>`;
  const ray = (x1: number, y1: number, x2: number, y2: number, tag: string, tx: number, ty: number): string =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#F0A422" stroke-width="2.8"/>${ar(x1, y1, x2, y2, 0.6, "#F0A422")}${badge(tx, ty, tag)}`;
  if (mode === "lamp") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="책상 위에 켜진 스탠드와 책, 오른쪽 위에 사람 눈이 그려져 있어요. 스탠드에서 책으로 가는 화살표에 기호 ㉠, 책에서 눈으로 가는 화살표에 기호 ㉡이 붙어 있어요">
      <line x1="16" y1="168" x2="328" y2="168" stroke="#B0B8C1" stroke-width="2.4"/>
      <g><path d="M56 166v-84" stroke="#5E6B7E" stroke-width="5" stroke-linecap="round"/>
        <path d="M56 82q30 -14 58 6" stroke="#5E6B7E" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M100 74l26 22-14 18-26-22z" fill="#3C4654"/><circle cx="112" cy="94" r="7" fill="#FFD978"/>
        <rect x="38" y="164" width="36" height="7" rx="3.5" fill="#5E6B7E"/></g>
      <g><path d="M148 168l14-26h44l14 26z" fill="#F9FBFD" stroke="#8B95A1" stroke-width="2"/>
        <path d="M162 142q22 -8 44 0M184 142v26" stroke="#8B95A1" stroke-width="1.8" fill="none"/></g>
      ${eye(296, 52)}
      ${ray(118, 100, 172, 136, "㉠", 138, 112)}
      ${ray(196, 134, 282, 62, "㉡", 244, 92)}
      <text x="56" y="184" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">스탠드</text>
      <text x="184" y="184" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">책</text>
      <text x="296" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
    </svg>`;
  }
  if (mode === "torch") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="캄캄한 방에서 손전등이 벽시계를 비추고, 오른쪽 아래에 사람 눈이 있어요. 손전등에서 시계로 가는 화살표에 ㉠, 시계에서 눈으로 가는 화살표에 ㉡, 눈에 기호 ㉢이 붙어 있어요">
      <rect x="10" y="10" width="324" height="170" rx="14" fill="#1A2536"/>
      <g transform="translate(52,132)"><rect x="-24" y="-10" width="40" height="20" rx="7" fill="#8B95A1"/><path d="M16 -12 L30 -16 V16 L16 12Z" fill="#5E6B7E"/></g>
      <circle cx="210" cy="52" r="26" fill="#F6F8FB" stroke="#8B95A1" stroke-width="2.4"/>
      <path d="M210 52 v-14 M210 52 l10 6" stroke="#3C4654" stroke-width="2.4" stroke-linecap="round"/>
      ${eye(288, 148)}
      ${ray(84, 122, 188, 68, "㉠", 132, 88)}
      ${ray(228, 68, 276, 136, "㉡", 258, 96)}
      ${badge(316, 148, "㉢")}
      <text x="52" y="168" text-anchor="middle" font-size="11" fill="#AFC3E3">손전등</text>
      <text x="210" y="24" text-anchor="middle" font-size="11" fill="#AFC3E3">벽시계</text>
    </svg>`;
  }
  if (mode === "moon") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="밤하늘 장면. 왼쪽 위 태양에서 달로 가는 화살표에 ㉠, 달에서 지상의 사람 눈으로 가는 화살표에 ㉡이 붙어 있어요">
      <rect x="10" y="10" width="324" height="170" rx="14" fill="#1A2536"/>
      <circle cx="52" cy="44" r="18" fill="#FFD470"/><text x="52" y="78" text-anchor="middle" font-size="11" fill="#AFC3E3">태양</text>
      <circle cx="196" cy="42" r="14" fill="#E8ECF3"/><text x="196" y="24" text-anchor="middle" font-size="11" fill="#AFC3E3">달</text>
      <g stroke="#AFC3E3" stroke-width="2.4" fill="none">
        <circle cx="284" cy="122" r="9"/><path d="M284 131v24M284 139l-10 11M284 139l10 11M284 155l-8 15M284 155l8 15"/></g>
      ${ray(74, 44, 178, 42, "㉠", 126, 30)}
      ${ray(206, 54, 278, 112, "㉡", 246, 78)}
    </svg>`;
  }
  if (mode === "water") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="연못가에서 물속 물고기를 내려다보는 장면. 태양에서 물고기로 가는 화살표에 ㉠, 물고기에서 수면까지 가는 화살표에 ㉡, 수면에서 꺾여 눈으로 가는 화살표에 ㉢이 붙어 있어요">
      <rect x="16" y="112" width="312" height="66" rx="8" fill="#EAF3FE"/>
      <line x1="16" y1="112" x2="328" y2="112" stroke="#7FB0E0" stroke-width="2.2"/>
      <circle cx="44" cy="36" r="14" fill="#FFD470"/><text x="44" y="66" text-anchor="middle" font-size="10.5" fill="#8B95A1">태양</text>
      <g transform="translate(150,152)"><path d="M-14 0 q14 -10 26 0 q-12 10 -26 0z" fill="#F0A422" stroke="#C08A3E" stroke-width="1.4"/><path d="M-14 0 l-9 -7 v14 z" fill="#E8961E"/><circle cx="7" cy="-2" r="1.6" fill="#3C4654"/></g>
      <text x="150" y="176" text-anchor="middle" font-size="10.5" fill="#5E86B4">물고기</text>
      <g stroke="#3C4654" stroke-width="2.2" fill="none"><path d="M270 54q11 -9 26 0q-11 9 -26 0z" fill="#fff"/><circle cx="283" cy="54" r="4" fill="#5E86B4" stroke="none"/></g>
      <text x="283" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">눈</text>
      <path d="M60 44L115.8 112" stroke="#F0A422" stroke-width="2.6"/>${ar(60, 44, 115.8, 112, 0.55, "#F0A422")}
      <path d="M115.8 112L137 150" stroke="#F0A422" stroke-width="2.6"/>${badge(84, 78, "㉠")}
      <path d="M162 146L216 112" stroke="#F0A422" stroke-width="2.6"/>${ar(162, 146, 216, 112, 0.6, "#F0A422")}${badge(196, 138, "㉡")}
      <path d="M216 112L268 62" stroke="#F0A422" stroke-width="2.6"/>${ar(216, 112, 268, 62, 0.6, "#F0A422")}${badge(232, 78, "㉢")}
    </svg>`;
  }
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="낮의 교실 창가 장면. 창밖 태양에서 창가 화분으로 가는 화살표에 ㉠, 화분에서 사람 눈으로 가는 화살표에 ㉡이 붙어 있어요">
    <rect x="18" y="14" width="120" height="120" rx="8" fill="#EAF3FE" stroke="#B0B8C1" stroke-width="2"/>
    <circle cx="58" cy="46" r="15" fill="#FFD470"/><text x="58" y="76" text-anchor="middle" font-size="10.5" fill="#8B95A1">태양</text>
    <g transform="translate(174,120)"><path d="M-14 0 h28 l-5 26 h-18 Z" fill="#C97B4A"/><path d="M0 -2 q-14 -18 -4 -30 M0 -2 q12 -16 6 -28 M0 -2 v-24" stroke="#2E9E63" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <text x="174" y="168" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">화분</text>
    ${eye(298, 62)}
    <text x="298" y="44" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
    ${ray(76, 58, 164, 104, "㉠", 118, 78)}
    ${ray(190, 110, 284, 70, "㉡", 240, 86)}
  </svg>`;
}

/** LMR 평면거울 작도 광선도(신작 · 파라미터형) · 미4 계보. 거울 = 세로선 x=208.
 *  기하: 상점 = 물체의 거울 대칭점 · 반사점 = (상점과 눈을 잇는 직선)이 거울과 만나는 점
 *  (반사 법칙과 완전 동치 · 눈대중 금지). 실선 = 물체→반사점→눈 · 점선 = 반사점→상점 연장.
 *  mode base: 한 쌍(눈 하나) + ㉠(반사 광선)·㉡(연장선) 배지 / ghost: 두 눈 · 상 자리 물음표 /
 *  dist: 물체~거울 거리 라벨 인쇄 / distRev: 물체~상 거리 인쇄 · 거울~물체 ? /
 *  eye2: 눈 두 위치(같은 상점으로 두 벌 작도 = 상 위치 불변의 물증).
 *  aria는 작도 요소만 서술(거리 정답 수치·판정 결과 낭독 금지). */
export function xLMR(o: { mode: "base" | "ghost" | "dist" | "distRev" | "eye2"; d1?: number; d2?: number }): string {
  const MX = 208;
  const obj = { x: 118, y: 128 };
  const img = { x: 2 * MX - obj.x, y: obj.y };
  const mk = (ex: number, ey: number): { hx: number; hy: number } => {
    // 반사점 = 상점→눈 직선과 거울(x=MX)의 교점.
    const t = (MX - img.x) / (ex - img.x);
    return { hx: MX, hy: img.y + (ey - img.y) * t };
  };
  const eyeA = { x: 96, y: 44 };
  const A = mk(eyeA.x, eyeA.y);
  const eyeB = { x: 46, y: 84 };
  const B = mk(eyeB.x, eyeB.y);
  const candle = (x: number, y: number, ghost = false): string =>
    `<g transform="translate(${x},${y})" opacity="${ghost ? 0.55 : 1}">
      <path d="M-7 22h14v-24h-14z" fill="${ghost ? "#EAD9BC" : "#F5C878"}" stroke="#C08A3E" stroke-width="1.6"${ghost ? ` stroke-dasharray="4 3"` : ""}/>
      <path d="M0 -12q6 7 0 12q-6 -5 0 -12z" fill="#F0A422"${ghost ? ` opacity=".6"` : ""}/>
    </g>`;
  const eyeArt = (x: number, y: number): string => `<g stroke="#3C4654" stroke-width="2" fill="none">
      <path d="M${x - 12} ${y}q10 -9 24 0q-10 9 -24 0z" fill="#fff"/><circle cx="${x}" cy="${y}" r="3.8" fill="#5E86B4" stroke="none"/></g>`;
  const mirror = `<line x1="${MX}" y1="18" x2="${MX}" y2="188" stroke="#5E6B7E" stroke-width="4"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${MX + 4}" y1="${28 + i * 18}" x2="${MX + 13}" y2="${20 + i * 18}" stroke="#B0B8C1" stroke-width="1.5"/>`).join("")}
    <text x="${MX - 6}" y="14" text-anchor="end" font-size="11" fill="#8B95A1">평면거울</text>`;
  const rayTo = (h: { hx: number; hy: number }, e: { x: number; y: number }): string =>
    `<path d="M${obj.x} ${obj.y}L${h.hx.toFixed(1)} ${h.hy.toFixed(1)}" stroke="#F0A422" stroke-width="2.8"/>${ar(obj.x, obj.y, h.hx, h.hy, 0.55, "#F0A422")}
     <path d="M${h.hx.toFixed(1)} ${h.hy.toFixed(1)}L${e.x} ${e.y}" stroke="#F0A422" stroke-width="2.8"/>${ar(h.hx, h.hy, e.x, e.y, 0.6, "#F0A422")}
     <path d="M${h.hx.toFixed(1)} ${h.hy.toFixed(1)}L${img.x} ${img.y}" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="5 5"/>`;
  if (o.mode === "eye2") {
    return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="평면거울 앞 물체에서 나온 빛이 거울에서 반사되어 서로 다른 두 위치의 눈에 각각 들어가는 작도 그림. 두 반사 광선을 거울 뒤로 늘인 점선이 그려져 있어요">
      ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
      ${rayTo(A, eyeA)}${rayTo(B, eyeB)}
      ${eyeArt(eyeA.x, eyeA.y)}${eyeArt(eyeB.x, eyeB.y)}
      <text x="${eyeA.x - 20}" y="${eyeA.y - 10}" font-size="11.5" font-weight="700" fill="#4E5968">눈 A</text>
      <text x="${eyeB.x - 24}" y="${eyeB.y + 22}" font-size="11.5" font-weight="700" fill="#4E5968">눈 B</text>
      <text x="${obj.x}" y="${obj.y + 40}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
    </svg>`;
  }
  if (o.mode === "dist" || o.mode === "distRev") {
    const lab =
      o.mode === "dist"
        ? `<path d="M${obj.x} 168h${MX - obj.x}" stroke="#8B95A1" stroke-width="1.6"/><path d="M${obj.x} 163v10M${MX} 163v10" stroke="#8B95A1" stroke-width="1.6"/>
           <text x="${(obj.x + MX) / 2}" y="184" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${o.d1} cm</text>`
        : `<path d="M${obj.x} 168h${img.x - obj.x}" stroke="#8B95A1" stroke-width="1.6"/><path d="M${obj.x} 163v10M${img.x} 163v10" stroke="#8B95A1" stroke-width="1.6"/>
           <text x="${(obj.x + img.x) / 2}" y="184" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${o.d2} cm</text>
           <path d="M${obj.x} 156h${MX - obj.x}" stroke="#37B6D8" stroke-width="1.6" stroke-dasharray="4 4"/>
           <text x="${(obj.x + MX) / 2 + 14}" y="152" text-anchor="middle" font-size="12" font-weight="800" fill="#1187A6">?</text>`;
    return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="평면거울 앞에 물체가, 거울 뒤 같은 거리에 상이 그려진 작도 그림. 거리 표시선이 함께 그려져 있어요">
      ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
      ${rayTo(A, eyeA)}${eyeArt(eyeA.x, eyeA.y)}
      ${lab}
      <text x="${obj.x - 14}" y="${obj.y + 6}" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
      <text x="${img.x + 18}" y="${img.y + 6}" font-size="11.5" font-weight="700" fill="#8B95A1">상</text>
    </svg>`;
  }
  if (o.mode === "base") {
    // 한 쌍(눈 하나)만 그려 ㉠(반사 광선)·㉡(연장선) 지칭을 또렷하게(파일럿 눈검수 반영).
    return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="평면거울 앞 물체에서 나온 빛이 거울에서 반사되어 눈에 들어가고, 그 빛을 거울 뒤로 곧게 늘인 점선이 그려진 작도 그림. 반사된 빛에 기호 ㉠, 점선에 기호 ㉡이 붙어 있어요">
      ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
      ${rayTo(A, eyeA)}
      ${eyeArt(eyeA.x, eyeA.y)}
      ${badge((A.hx + eyeA.x) / 2 + 2, (A.hy + eyeA.y) / 2 + 16, "㉠")}
      ${badge((A.hx + img.x) / 2, (A.hy + img.y) / 2 - 15, "㉡")}
      <text x="${obj.x}" y="${obj.y + 40}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
      <text x="${eyeA.x - 20}" y="${eyeA.y - 12}" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="평면거울 앞 물체에서 나온 빛이 거울의 서로 다른 두 곳에서 반사되어 두 위치의 눈에 들어가고, 반사 광선들을 거울 뒤로 곧게 늘인 점선들이 거울 뒤 한 점에 모이는 작도 그림. 그 점 위에 물음표가 있어요">
    ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
    ${rayTo(A, eyeA)}${rayTo(B, eyeB)}
    ${eyeArt(eyeA.x, eyeA.y)}${eyeArt(eyeB.x, eyeB.y)}
    <circle cx="${img.x}" cy="${img.y - 34}" r="12" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"/><text x="${img.x}" y="${img.y - 29}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">?</text>
    <text x="${obj.x}" y="${obj.y + 40}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
  </svg>`;
}

/** LMRfull 전신 거울 작도(신작) · 키 hcm의 사람 · 거울 필요 구간 = 키의 절반(계산 작도).
 *  기하: 머리끝 반사점 y = (머리+눈)/2 · 발끝 반사점 y = (발+눈)/2 · 두 점 사이가 필요 구간.
 *  구간 길이는 ?로 표시(정답 h/2 인쇄 금지). */
export function xLMRfull(hcm: number): string {
  const MX = 252;
  const px = 84;
  const top = 38;
  const foot = 178;
  const eyeY = top + 12;
  const m1 = (top + eyeY) / 2;
  const m2 = (foot + eyeY) / 2;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="키 ${hcm}센티미터인 사람이 세로로 세운 평면거울 앞에 서 있는 작도 그림. 머리끝과 발끝에서 나온 빛이 거울에서 반사되어 눈에 들어오는 광선과, 거울에서 실제로 쓰인 구간이 표시되어 있어요">
    <line x1="${MX}" y1="20" x2="${MX}" y2="196" stroke="#C4CBD4" stroke-width="3"/>
    <line x1="${MX}" y1="${m1}" x2="${MX}" y2="${m2}" stroke="#3182F6" stroke-width="5"/>
    <g stroke="#3C4654" stroke-width="2.6" fill="none">
      <circle cx="${px}" cy="${top + 8}" r="9"/>
      <path d="M${px} ${top + 17}v52M${px} ${top + 30}l-13 14M${px} ${top + 30}l13 14M${px} ${top + 69}l-11 ${foot - top - 69 - 11}M${px} ${top + 69}l11 ${foot - top - 69 - 11}"/>
    </g>
    <path d="M${px} ${top}L${MX} ${m1}" stroke="#F0A422" stroke-width="2.4"/>${ar(px, top, MX, m1, 0.55, "#F0A422")}
    <path d="M${MX} ${m1}L${px + 6} ${eyeY}" stroke="#F0A422" stroke-width="2.4"/>${ar(MX, m1, px + 6, eyeY, 0.6, "#F0A422")}
    <path d="M${px} ${foot}L${MX} ${m2}" stroke="#F0A422" stroke-width="2.4"/>${ar(px, foot, MX, m2, 0.55, "#F0A422")}
    <path d="M${MX} ${m2}L${px + 6} ${eyeY + 4}" stroke="#F0A422" stroke-width="2.4"/>${ar(MX, m2, px + 6, eyeY + 4, 0.6, "#F0A422")}
    <path d="M${px - 32} ${top}h-8M${px - 32} ${foot}h-8"/>
    <line x1="${px - 36}" y1="${top}" x2="${px - 36}" y2="${foot}" stroke="#8B95A1" stroke-width="1.5"/>
    <text x="${px - 42}" y="${(top + foot) / 2}" text-anchor="end" font-size="11.5" font-weight="800" fill="#4E5968">${hcm} cm</text>
    <line x1="${MX + 22}" y1="${m1}" x2="${MX + 22}" y2="${m2}" stroke="#37B6D8" stroke-width="1.6"/>
    <path d="M${MX + 17} ${m1}h10M${MX + 17} ${m2}h10" stroke="#37B6D8" stroke-width="1.6"/>
    <text x="${MX + 30}" y="${(m1 + m2) / 2 + 4}" font-size="13" font-weight="800" fill="#1187A6">?</text>
    <text x="${MX}" y="208" text-anchor="middle" font-size="11" fill="#8B95A1">평면거울</text>
  </svg>`;
}

/** xLMG 모눈 평면거울 상 위치(개조판) · v1 3칸 고정을 cells·후보 배치 파라미터로.
 *  cells: 물체~거울 모눈 칸 수 · order: 후보 ①~⑤가 가리키는 위치(거울 뒤 칸수 · 0=거울 면 ·
 *  공간 정렬 §8-1) · withImage: 후보 대신 상을 그려 완성 작도(판독 num·판정 bogi용).
 *  정답 유출 금지: 후보 모드에서는 상을 그리지 않는다. */
export function xLMG(o: { cells: number; order?: number[]; withImage?: boolean }): string {
  const cell = 24;
  const MX = 172;
  let grid = "";
  for (let c = 0; c <= 12; c++) grid += `<line x1="${28 + c * cell}" y1="24" x2="${28 + c * cell}" y2="192" stroke="#EDF0F4" stroke-width="1.2"/>`;
  for (let r = 0; r <= 7; r++) grid += `<line x1="28" y1="${24 + r * cell}" x2="316" y2="${24 + r * cell}" stroke="#EDF0F4" stroke-width="1.2"/>`;
  const ox = MX - o.cells * cell;
  const candle = (x: number, ghost = false): string => `<g transform="translate(${x},108)" opacity="${ghost ? 0.6 : 1}">
      <path d="M-7 22h14v-24h-14z" fill="${ghost ? "#EAD9BC" : "#F5C878"}" stroke="#C08A3E" stroke-width="1.8"${ghost ? ` stroke-dasharray="4 3"` : ""}/>
      <path d="M0 -12q6 7 0 12q-6 -5 0 -12z" fill="#F0A422"${ghost ? ` opacity=".6"` : ""}/></g>`;
  const cands = (o.order ?? [])
    .map((cellsBehind, i) => {
      const x = cellsBehind === 0 ? MX : MX + cellsBehind * cell;
      return badge(x, 108, ["①", "②", "③", "④", "⑤"][i], 11);
    })
    .join("");
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="모눈 위에 세로로 선 평면거울과 촛불 모양 물체가 그려져 있어요. 물체는 거울에서 모눈 ${o.cells}칸 떨어져 있고, ${o.withImage ? "거울 뒤에는 물체의 상이 함께 그려져 있어요" : "상이 생길 위치 후보 다섯 곳에 번호가 붙어 있어요"}">
    ${grid}
    <line x1="${MX}" y1="20" x2="${MX}" y2="196" stroke="#5E6B7E" stroke-width="4"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${MX + 4}" y1="${28 + i * 19}" x2="${MX + 13}" y2="${20 + i * 19}" stroke="#B0B8C1" stroke-width="1.5"/>`).join("")}
    ${candle(ox)}
    ${o.withImage ? candle(MX + o.cells * cell, true) : cands}
    <path d="M${ox} 142h${MX - ox}" stroke="#8B95A1" stroke-width="1.6" stroke-dasharray="4 4"/>
    <path d="M${ox} 137v10M${MX} 137v10" stroke="#8B95A1" stroke-width="1.6"/>
    <text x="${(ox + MX) / 2}" y="158" text-anchor="middle" font-size="10.5" fill="#6B7684">${o.cells}칸</text>
    <text x="152" y="16" text-anchor="end" font-size="11" fill="#8B95A1">평면거울</text>
    <text x="${ox}" y="86" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
  </svg>`;
}

/** LXS 거울·렌즈 단면 카드(신작 · 파라미터형) · 천02 계보. kinds 순서대로 (가)~(라) 배치.
 *  거울 = marc 몸통(§8-2) · 렌즈 = 유리 단면 윤곽.
 *  aria는 "네 가지 단면"만(각 카드의 정체 낭독 금지 · 식별이 곧 과제). */
export function xLXS(kinds: ("cvm" | "ccm" | "cvl" | "ccl")[]): string {
  const art = (k: string): string => {
    // 거울 단면: 반사면은 왼쪽 · 빗금(뒷면)은 오른쪽 고정(marc) · 벨리 방향이 볼록/오목을 가른다.
    if (k === "cvm") return marc(10, -32, 34);
    if (k === "ccm") return marc(-10, 32, 34);
    if (k === "cvl") return `<path d="M0 -36 q17 36 0 72 q-17 -36 0 -72 z" fill="#DCEBFB" stroke="#5E86B4" stroke-width="2.6"/>`;
    return `<path d="M-11 -36 h22 q-13 36 0 72 h-22 q13 -36 0 -72 z" fill="#DCEBFB" stroke="#5E86B4" stroke-width="2.6"/>`;
  };
  const labels = ["(가)", "(나)", "(다)", "(라)"];
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="거울과 렌즈의 옆 단면 네 가지가 (가)부터 (라)까지 카드로 나란히 그려져 있어요. 단면의 휜 방향과 뒷면 표시를 보고 종류를 구분해 보세요">
    ${kinds
      .map((k, i) => {
        const x = 27 + i * 76;
        return `<g transform="translate(${x + 27},92)">
        <rect x="-34" y="-72" width="68" height="128" rx="12" fill="#F7F9FC" stroke="#DCE3EC" stroke-width="1.6"/>
        ${art(k)}
        <text x="0" y="76" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${labels[i]}</text>
      </g>`;
      })
      .join("")}
  </svg>`;
}

/** LOB 광학 관찰 2컷(신작) · 장치 단면 + 물체(촛불) 가까이/멀리 · 상 자리 ?(정답 미인쇄).
 *  device: ccm(오목 거울 · marc 몸통) | cvl(볼록 렌즈). 그림은 조건(장치 종류 · 거리 변화)만
 *  제시하고 상의 모습은 인쇄하지 않는다(예측이 과제). */
export function xLOB(device: "ccm" | "cvl"): string {
  const dev =
    device === "ccm"
      ? marc(-12, 38, 40, 3.6)
      : `<path d="M0 -42 q19 42 0 84 q-19 -42 0 -84 z" fill="#DCEBFB" stroke="#5E86B4" stroke-width="2.6"/>`;
  const candle = (x: number): string => `<g transform="translate(${x},22)">
      <path d="M-6 18h12v-20h-12z" fill="#F5C878" stroke="#C08A3E" stroke-width="1.6"/>
      <path d="M0 -10q5 6 0 10q-5 -4 0 -10z" fill="#F0A422"/></g>`;
  const cut = (label: string, objX: number, y: number): string => `<g transform="translate(0,${y})">
      <text x="18" y="6" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
      <line x1="34" y1="22" x2="318" y2="22" stroke="#E2E6EC" stroke-width="1.4"/>
      <g transform="translate(292,22)">${dev}</g>
      ${candle(objX)}
      <circle cx="${(objX + 292) / 2 + 46}" cy="-14" r="11" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.5"/>
      <text x="${(objX + 292) / 2 + 46}" y="-9.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">?</text>
    </g>`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="같은 ${device === "ccm" ? "오목 거울" : "볼록 렌즈"} 앞에 촛불을 (가)는 가까이, (나)는 멀리 둔 두 장면. 이때 보이는 모습 자리에는 물음표가 있어요">
    ${cut("(가) 가까이", 224, 42)}
    ${cut("(나) 멀리", 66, 138)}
  </svg>`;
}

/** LVN 빛의 삼원색 벤(신작) · 비상04 계보. 겹침 영역은 전부 무채색(원 테두리만 · 알파 채움도
 *  금지 = 겹침 색 힌트가 정답 인쇄 · §8-4) · 물을 자리만 ㉠㉡ 기호(㉠=빨+파 겹침 · ㉡=중앙). */
export function xLVN(): string {
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="빨간빛, 초록빛, 파란빛 세 원이 서로 겹치게 그려진 그림. 겹친 부분은 색이 칠해져 있지 않고, 빨간빛과 파란빛이 겹친 자리에 기호 ㉠, 세 빛이 모두 겹친 가운데 자리에 기호 ㉡이 있어요">
    <circle cx="142" cy="78" r="56" fill="none" stroke="#E5322E" stroke-width="2.8"/>
    <circle cx="202" cy="78" r="56" fill="none" stroke="#12A84E" stroke-width="2.8"/>
    <circle cx="172" cy="130" r="56" fill="none" stroke="#3A6CFF" stroke-width="2.8"/>
    <text x="96" y="34" font-size="11.5" font-weight="700" fill="#C22A26">빨간빛</text>
    <text x="222" y="34" font-size="11.5" font-weight="700" fill="#0E8A40">초록빛</text>
    <text x="172" y="198" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2A52CC">파란빛</text>
    ${badge(139, 122, "㉠")}
    ${badge(172, 96, "㉡")}
  </svg>`;
}

/** LSW 용수철 파동 2컷(신작) · 비08 계보. 손이 흔든 폭(화살표)과 그 결과 파형을 함께 그린다.
 *  vary "amp": 같은 빠르기 · (나)는 폭 2배(파형 진폭 2배 · 파장 동일) /
 *  vary "freq": 같은 폭 · (나)는 두 배 빠르게(파장 절반 · 진폭 동일).
 *  판독이 과제이므로 요소 이름은 인쇄하지 않는다. aria 방향은 그림 화살표(위아래)와 일치(§8-6). */
export function xLSW(vary: "amp" | "freq"): string {
  const wave = (y: number, amp: number, cyc: number, arrowH: number): string => {
    let d = "";
    for (let i = 0; i <= 232; i += 2) {
      const yy = -Math.sin((i / 232) * Math.PI * 2 * cyc) * amp;
      d += `${d ? "L" : "M"}${86 + i} ${(y + yy).toFixed(1)}`;
    }
    return `<g>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="46" cy="${y - 26}" r="7"/><path d="M46 ${y - 19}v20M46 ${y - 12}l-8 9M46 ${y - 12}l9 8M46 ${y + 1}l-7 13M46 ${y + 1}l7 13"/>
      </g>
      <path d="M62 ${y - arrowH}v${arrowH * 2}" stroke="#37B6D8" stroke-width="2.2"/>
      <path d="M58 ${y - arrowH + 5}l4 -5 4 5M58 ${y + arrowH - 5}l4 5 4 -5" stroke="#37B6D8" stroke-width="2" fill="none"/>
      <path d="${d}" stroke="#5E6B7E" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="318" y1="${y - 26}" x2="318" y2="${y + 26}" stroke="#8B95A1" stroke-width="4"/>
    </g>`;
  };
  const a2 = vary === "amp" ? 40 : 20;
  const c2 = vary === "freq" ? 6 : 3;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="긴 용수철의 한쪽 끝을 사람이 위아래로 흔들어 파동을 만드는 두 장면 (가), (나). (나)는 (가)보다 ${vary === "amp" ? "더 큰 폭으로" : "더 빠르게"} 흔드는 장면이에요">
    <text x="18" y="30" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
    ${wave(58, 20, 3, 26)}
    <text x="18" y="126" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
    ${wave(158, a2, c2, vary === "amp" ? 46 : 26)}
  </svg>`;
}

/** LFC 소리 비교 순서도(신작) · 천09 계보 · 예/아니요 분기가 각자의 결론 칸으로(u3 FC2 문법).
 *  결론 칸 ㉠㉡ 가림(정답 미인쇄) · 아니요 화살표는 가로 화살촉 + 결론 칸과 같은 높이 정렬 ·
 *  아니요 라벨은 다이아 오른쪽 꼭짓점 바깥 위(사용자 검수 2차 반영 · 어느 쪽과도 겹치지 않는 자리). */
export function xLFC(): string {
  const box = (x: number, y: number, w: number, h: number, t: string, fill = "#F7F9FC"): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="#8B95A1" stroke-width="1.6"/>
     <text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#333D4B">${t}</text>`;
  const dia = (x: number, y: number, w: number, h: number, t1: string, t2: string): string =>
    `<path d="M${x + w / 2} ${y} L${x + w} ${y + h / 2} L${x + w / 2} ${y + h} L${x} ${y + h / 2} Z" fill="#FFF7E8" stroke="#E8961E" stroke-width="1.6"/>
     <text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8A5B00">${t1}</text>
     <text x="${x + w / 2}" y="${y + h / 2 + 11}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8A5B00">${t2}</text>`;
  const vArrow = (x: number, y1: number, y2: number, lab?: string): string =>
    `<path d="M${x} ${y1}L${x} ${y2}" stroke="#8B95A1" stroke-width="1.8"/>
     <path d="M${x - 4} ${y2 - 6}l4 6 4 -6" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
     ${lab ? `<text x="${x + 9}" y="${(y1 + y2) / 2 + 4}" font-size="10.5" font-weight="800" fill="#6B7684">${lab}</text>` : ""}`;
  const hArrow = (x1: number, x2: number, y: number, lab: string, labY: number): string =>
    `<path d="M${x1} ${y}L${x2} ${y}" stroke="#8B95A1" stroke-width="1.8"/>
     <path d="M${x2 - 6} ${y - 4}l6 4 -6 4" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
     <text x="${x1 + 4}" y="${labY}" font-size="10.5" font-weight="800" fill="#6B7684">${lab}</text>`;
  const mark = (x: number, y: number, t: string): string =>
    `<rect x="${x}" y="${y}" width="84" height="34" rx="9" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.7"/>
     <text x="${x + 42}" y="${y + 21}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">${t}</text>`;
  return `<svg viewBox="0 0 344 246" ${NS} fill="none" role="img" aria-label="두 소리의 파형을 비교하는 순서도. 첫 갈림길은 파형의 키가 같은지, 두 번째 갈림길은 파형의 촘촘한 정도가 같은지를 묻고, 각 갈림길의 아니요 방향 결론 칸에 기호 ㉠과 ㉡이 있어요">
    ${box(112, 8, 120, 32, "두 소리의 파형 관찰")}
    ${vArrow(172, 40, 56)}
    ${dia(104, 56, 136, 46, "파형의 키(높이)가", "서로 같은가?")}
    ${hArrow(240, 250, 79, "아니요", 56)}
    ${mark(250, 62, "㉠")}
    ${vArrow(172, 102, 122, "예")}
    ${dia(96, 122, 152, 46, "파형의 촘촘한 정도가", "서로 같은가?")}
    ${hArrow(248, 254, 145, "아니요", 122)}
    ${mark(254, 128, "㉡")}
    ${vArrow(172, 168, 188, "예")}
    ${box(96, 188, 152, 34, "파형의 생김새를 비교한다")}
  </svg>`;
}

/** LCU 물컵 두드리기(신작) · 천11 계보. 같은 컵 세 개 · 물 높이만 다름.
 *  숟가락 소품은 검수 반영으로 제거(어느 컵 위에 두어도 그 컵을 지목하는 힌트 · 문두가 서술).
 *  aria는 물 높이 서열만 중립 서술(높낮이 정답 낭독 금지). */
export function xLCU(): string {
  const cup = (x: number, level: number, label: string): string => `<g transform="translate(${x},44)">
      <path d="M0 0 L8 108 H60 L68 0" fill="none" stroke="#8B95A1" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M${(8 * (108 - level)) / 108} ${108 - level} L8 108 H60 L${68 - (8 * (108 - level)) / 108} ${108 - level} Z" fill="#BFE0FA" opacity=".85"/>
      <line x1="${(8 * (108 - level)) / 108}" y1="${108 - level}" x2="${68 - (8 * (108 - level)) / 108}" y2="${108 - level}" stroke="#5E86B4" stroke-width="2"/>
      <text x="34" y="132" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
    </g>`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="같은 유리컵 세 개 (가), (나), (다)에 물이 서로 다른 높이로 담겨 있는 그림. 물은 (가)가 가장 적고 (다)가 가장 많아요">
    ${cup(36, 28, "(가)")}
    ${cup(138, 62, "(나)")}
    ${cup(240, 96, "(다)")}
  </svg>`;
}

/** xLWG 파동 그래프(개조판) · v1 lightWaveGraphFig + phase(cos = 마루가 x=0·λ 위 눈금선) ·
 *  dim(마루~골 세로 치수선 기호 + 마루 높이 수평 가이드 점선) · marks(㉠~㉤ 지점 배지) 옵션.
 *  값 읽기 규칙: 정답 수치는 반드시 눈금선 위 · aria에 정답 수치 낭독 금지(축 이름만). */
export function xLWG(o: {
  xMax: number;
  xStep: number;
  yMax: number;
  yStep: number;
  amp: number;
  wavelength: number;
  xLabel: string;
  yLabel: string;
  phase?: "sin" | "cos";
  dim?: string;
  marks?: { x: number; y: number; t: string }[];
}): string {
  const L = 52;
  const R = 324;
  const T = 24;
  const B = 172;
  const mid = (T + B) / 2;
  const px = (v: number): number => L + ((R - L) * v) / o.xMax;
  const py = (v: number): number => mid - (v / o.yMax) * ((B - T) / 2);
  const fmt = (v: number): string => String(Math.round(v * 1000) / 1000);
  let grid = "";
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xStep) {
    grid += `<line x1="${px(x).toFixed(1)}" y1="${T}" x2="${px(x).toFixed(1)}" y2="${B}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${px(x).toFixed(1)}" y="${B + 16}" text-anchor="middle" font-size="10" fill="#8B95A1">${fmt(x)}</text>`;
  }
  for (let y = -o.yMax; y <= o.yMax + 1e-9; y += o.yStep) {
    grid += `<line x1="${L}" y1="${py(y).toFixed(1)}" x2="${R}" y2="${py(y).toFixed(1)}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${L - 6}" y="${(py(y) + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="#8B95A1">${fmt(y)}</text>`;
  }
  let d = "";
  const ph = o.phase ?? "sin";
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xMax / 140) {
    const t = (2 * Math.PI * x) / o.wavelength;
    const y = o.amp * (ph === "cos" ? Math.cos(t) : Math.sin(t));
    d += `${d ? "L" : "M"}${px(x).toFixed(1)} ${py(y).toFixed(1)}`;
  }
  let extra = "";
  if (o.dim) {
    // 마루~골 세로 치수선: 골 x 위치에 화살표 선 + 마루 높이에서 오는 수평 가이드 점선.
    const crestX = px(o.wavelength * (ph === "cos" ? 0 : 0.25));
    const cx = px(o.wavelength * (ph === "cos" ? 0.5 : 0.75));
    extra += `<line x1="${crestX.toFixed(1)}" y1="${py(o.amp).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${py(o.amp).toFixed(1)}" stroke="#E8961E" stroke-width="1.4" stroke-dasharray="4 3"/>
      <line x1="${cx.toFixed(1)}" y1="${py(o.amp).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${py(-o.amp).toFixed(1)}" stroke="#E8961E" stroke-width="2"/>
      <path d="M${(cx - 4).toFixed(1)} ${(py(o.amp) + 6).toFixed(1)}l4 -6 4 6M${(cx - 4).toFixed(1)} ${(py(-o.amp) - 6).toFixed(1)}l4 6 4 -6" stroke="#E8961E" stroke-width="1.8" fill="none"/>
      <text x="${(cx + 8).toFixed(1)}" y="${mid + 4}" font-size="13" font-weight="800" fill="#B26A00">${o.dim}</text>`;
  }
  if (o.marks) extra += o.marks.map((m) => badge(px(m.x), py(m.y) + (m.y >= 0 ? -16 : 16), m.t)).join("");
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="가로축이 ${o.xLabel}, 세로축이 ${o.yLabel}인 파동 그래프예요. 눈금을 따라 값을 읽어 보세요">
    ${grid}
    <line x1="${L}" y1="${mid}" x2="${R}" y2="${mid}" stroke="#C4CBD4" stroke-width="1.4"/>
    <line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="${d}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${extra}
    <text x="10" y="14" font-size="10.5" fill="#4E5968">${o.yLabel}</text>
    <text x="${R}" y="${B + 32}" text-anchor="end" font-size="10.5" fill="#4E5968">${o.xLabel}</text>
  </svg>`;
}

/** xLW4 파형 비교(개조판) · v1 4칸 + pair(2칸 대형) 옵션. aria 중립(모양 서술 금지). */
export function xLW4(o: { cells: { label: string; amp: number; cyc: number; noise?: boolean }[]; pair?: boolean }): string {
  const W = o.pair ? 250 : 116;
  const cell = (x: number, y: number, c: { label: string; amp: number; cyc: number; noise?: boolean }): string => {
    let d = "";
    for (let i = 0; i <= W; i += 2) {
      let yy = -Math.sin((i / W) * Math.PI * 2 * c.cyc) * c.amp;
      if (c.noise) yy += Math.sin((i / W) * Math.PI * 2 * c.cyc * 3.1) * c.amp * 0.45 + Math.sin((i / W) * Math.PI * 2 * c.cyc * 5.3) * c.amp * 0.22;
      d += `${d ? "L" : "M"}${x + 18 + i} ${(y + 40 + yy).toFixed(1)}`;
    }
    return `<text x="${x}" y="${y + 12}" font-size="12.5" font-weight="800" fill="#4E5968">${c.label}</text>
      <line x1="${x + 18}" y1="${y + 40}" x2="${x + 18 + W}" y2="${y + 40}" stroke="#E2E6EC" stroke-width="1.2"/>
      <path d="${d}" stroke="#5E6B7E" stroke-width="2.2" fill="none"/>`;
  };
  if (o.pair)
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 시간 동안 기록한 두 소리의 파형이에요. 반복 횟수를 비교해 보세요">
      ${cell(38, 8, o.cells[0])}${cell(38, 100, o.cells[1])}
    </svg>`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="서로 다른 네 소리를 같은 시간 동안 기록한 파형 네 개예요. 파형의 키와 촘촘함을 비교해 보세요">
    ${cell(14, 8, o.cells[0])}
    ${cell(184, 8, o.cells[1])}
    ${cell(14, 100, o.cells[2])}
    ${cell(184, 100, o.cells[3])}
  </svg>`;
}

/* ══════════ 파일럿 미사용 신작 모드 데뷔 카드(부록 · 눈검수용) ══════════ */

export const PILOT_PREVIEW: { name: string; svg: string; dark?: boolean }[] = [
  { name: "xLAE spread-ask · 거울면 46° + 사이각 ?(확대 e212)", svg: xLAE({ mark: "mirror", deg: 46, spread: "ask" }) },
  { name: "xLAE spread-show · 사이각 100° 인쇄 + 입사각 ? 역산(확대 e213)", svg: xLAE({ mark: "normal", deg: 100, spread: "show" }) },
  { name: "xLSR smooth · 매끈한 면 나란한 반사(확대 e209)", svg: xLSR("smooth") },
  { name: "xLSR dir · 유리판 정반사 방향성(확대 e218)", svg: xLSR("dir") },
  { name: "xLRP vert · 수직 입사 직진 후보(확대 e223 · 정답 ④ 배치)", svg: xLRP({ dir: "down", inc: 0, mode: "vert", ans: 4 }) },
  { name: "xLRP arc · 입사각 (가) 굴절각 (나) 호 비교(확대 e222)", svg: xLRP({ dir: "down", inc: 45, mode: "arc" }) },
  { name: "xLRP both · 굴절+반사 동시 작도(확대 e229)", svg: xLRP({ dir: "down", inc: 45, mode: "both" }) },
  { name: "xLRP glass · 유리판 통과 두 번 꺾임(확대 e234)", svg: xLRP({ dir: "down", inc: 42, mode: "glass" }) },
  { name: "xLRP two · 입사각 두 벌 비교 작도(확대 e232)", svg: xLRP({ dir: "down", inc: 28, mode: "two" }) },
  { name: "xLRP obs-bottom · 계곡 바닥이 얕아 보임(확대 e226 · 확대판은 후보 없이)", svg: xLRP({ dir: "up", inc: 25, mode: "obs", scene: "bottom", noCands: true }) },
  { name: "xLSEE torch · 손전등 벽시계 ㉠㉡㉢(확대 e240)", svg: xLSEE("torch") },
  { name: "xLSEE window · 창가 화분(확대 e242)", svg: xLSEE("window") },
  { name: "xLSEE moon · 태양 달 눈 2단 반사(확대 e245)", svg: xLSEE("moon") },
  { name: "xLSEE water · 물속 물고기 반사+굴절(확대 e248)", svg: xLSEE("water") },
  { name: "xLMR dist · 거울에서 11cm 라벨판(확대 e260)", svg: xLMR({ mode: "dist", d1: 11 }) },
  { name: "xLMR eye2 · 눈 두 위치에도 상은 그대로(확대 e270)", svg: xLMR({ mode: "eye2" }) },
  { name: "xLMG withImage · 완성 작도 5칸(확대 e259 num 판독)", svg: xLMG({ cells: 5, withImage: true }) },
  { name: "xLOB convex-lens · 볼록 렌즈 가까이/멀리(확대 e286)", svg: xLOB("cvl") },
  { name: "xLSW freq · 같은 폭 더 빠르게(확대 e329)", svg: xLSW("freq") },
  { name: "xLW4 pair · 같은 창 2회 vs 8회(확대 e351 num 4배)", svg: xLW4({ pair: true, cells: [{ label: "(가)", amp: 22, cyc: 2 }, { label: "(나)", amp: 22, cyc: 8 }] }) },
];

/* ══════════ 파일럿 40문항 ══════════ */

export const POOL_G2U3V2_PILOT: ExamItem[] = [
  // [e201 · L1 · mcq d1 · 무 W①] 반사 정의 직문. 검산: 반사 = 표면에서 되돌아 나옴(경계 통과 = 굴절).
  {
    id: "g2u3e201",
    lessonId: "g2u3l1",
    type: "mcq",
    diff: 1,
    prompt: "빛이 물체의 표면에서 <b>반사</b>된다는 것은 어떤 현상을 말할까요?",
    options: [
      "직진하던 빛이 표면에 부딪쳐 진행 방향을 바꾸어 되돌아 나오는 현상",
      "빛이 두 물질의 경계면을 통과하면서 진행 방향이 꺾이는 현상",
      "빛이 표면에 스며들어 밖으로 나오지 못하는 현상",
      "여러 색의 빛이 한곳에 겹쳐 다른 색으로 보이는 현상",
      "빛이 한 물질 안에서 곧게 나아가는 현상",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>반사는 곧게 나아가던 빛이 물체의 표면에 부딪쳐 <b>진행 방향을 바꾸어 되돌아 나오는</b> 현상이에요. 거울에 내 모습이 비치는 것도, 매끈한 금속에 주변이 비치는 것도 모두 표면에서 빛이 되돌아 나온 덕분이죠.<span class='xh'>오답 하나씩 격파</span>'경계면을 통과하면서 꺾인다'는 반사가 아니라 <b>굴절</b>의 설명이에요. 표면에서 되돌아 나오면 반사, 뚫고 지나가며 꺾이면 굴절로 구분해요. 빛이 표면에 스며들어 못 나오는 것은 <b>흡수</b>라서 그 부분은 어둡게 보일 뿐이고, 여러 색 빛이 겹쳐 다른 색으로 보이는 것은 빛의 <b>합성</b> 이야기예요. 한 물질 안에서 곧게 나아가는 것은 빛의 <b>직진</b>이라, 방향이 바뀌는 반사와는 정반대 상황이랍니다.",
    core: "반사 = 표면에 부딪쳐 방향을 바꿔 되돌아 나오는 빛!",
  },
  // [e203 · L1 · mcq d2 · xLAE mirror 26] 거울면각 함정. 검산: 입사각 = 90-26 = 64 · 반사각 = 64.
  {
    id: "g2u3e203",
    lessonId: "g2u3l1",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 빛이 거울 면과 26°의 각을 이루며 들어와 반사되었어요. 입사각과 반사각을 옳게 짝 지은 것은?",
    figure: xLAE({ mark: "mirror", deg: 26 }),
    options: [
      "입사각 64°, 반사각 64°",
      "입사각 26°, 반사각 26°",
      "입사각 26°, 반사각 64°",
      "입사각 64°, 반사각 26°",
      "입사각 90°, 반사각 90°",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 26°는 <b>거울 면과</b> 이루는 각이에요. 입사각과 반사각은 언제나 반사면에 수직인 <b>법선</b>을 기준으로 재니까<br>① 입사각 = 90° − 26° = <b>64°</b><br>② 반사 법칙(입사각 = 반사각)에 따라 반사각도 <b>64°</b>예요.<span class='xh'>오답 하나씩 격파</span>'입사각 26°, 반사각 26°'는 거울 면에서 잰 각을 그대로 입사각으로 쓴 대표 함정이에요. 기준은 늘 법선이죠. 입사각과 반사각이 서로 다른 두 짝은 반사 법칙에 어긋나니 계산해 보기도 전에 지울 수 있어요. 90° 짝은 빛이 거울 면에 수직으로 들어올 때(이때 거울면각이 90°)나 가능한 극단값이라 그림과 맞지 않아요.",
    core: "거울 면과 α° 조건이 오면 입사각 = 90°−α. 반사각은 입사각과 같다!",
  },
  // [e204 · L1 · num d2 · LPro 50] 각도기 눈금 판독. 검산: 법선 0° 기준 대칭 눈금 = 입사 50 → 반사 50.
  {
    id: "g2u3e204",
    lessonId: "g2u3l1",
    type: "num",
    diff: 2,
    prompt:
      "그림은 반원 각도기의 중심에 거울을 수평으로 놓은 반사 실험 장치예요. 각도기의 눈금은 <b>법선 방향이 0°</b>, 거울 면 쪽이 90°죠. 광원 장치에서 나온 빛이 눈금 50°를 따라 거울 중심에 들어왔다면, 반사된 빛은 눈금 몇 °를 따라 나아갈까요?",
    figure: lightProtractorFig({ inc: 50 }),
    answer: "50",
    unitLabel: "°",
    explain:
      "<span class='xh'>정답 풀이</span>이 각도기는 법선 자리가 0°라서, 광선이 가리키는 눈금이 곧 <b>법선과 이루는 각</b>이에요.<br>① 들어오는 빛이 눈금 50° = 입사각 50°<br>② 반사 법칙에 따라 반사각도 50°<br>③ 반사각 50°는 법선 반대쪽 눈금 <b>50°</b> 자리예요.<span class='xh'>이렇게 생각했다면</span>90° − 50° = 40°를 답했다면 각도기의 눈금 기준을 거울 면으로 착각한 거예요. 이 장치는 법선이 0°라는 조건을 문제에서 먼저 확인해야 해요. 눈금이 거울 면 기준(면 쪽이 0°)인 장치라면 같은 실험이라도 읽히는 숫자가 달라지죠. 실험 장치 문제는 장치의 <b>눈금 약속</b>부터 확인하는 습관이 점수를 지켜 준답니다.",
    core: "법선 0° 각도기에서는 눈금이 곧 입사각. 반사 눈금 = 입사 눈금!",
  },
  // [e207 · L1 · mcq d2 · xLSR rough] 난반사 낱낱 법칙 성립. 검산: 국소 법선 기준 미러링(그림 좌표 계산).
  {
    id: "g2u3e207",
    lessonId: "g2u3l1",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 나란하게 나아가던 빛 세 줄기가 울퉁불퉁한 표면에 닿아 반사된 모습이에요(점선은 각 반사점에서 표면에 수직으로 세운 선이에요). 이에 대한 설명으로 가장 옳은 것은?",
    figure: xLSR("rough"),
    options: [
      "빛줄기 하나하나는 자기 반사점의 법선을 기준으로 입사각과 반사각이 같다",
      "표면이 울퉁불퉁하면 반사 법칙이 성립하지 않는다",
      "반사된 빛들은 모두 서로 나란하게 나아간다",
      "빛이 반사되지 않고 모두 표면에 스며든 것이다",
      "이런 표면에는 물체의 모습이 또렷하게 비친다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>거친 표면은 지점마다 기울기가 달라서 <b>법선의 방향도 제각각</b>이에요. 그래서 나란히 온 빛도 반사 후엔 사방으로 흩어지죠. 하지만 그림의 점선을 보세요. 빛줄기 하나하나는 <b>자기 자리의 법선을 기준으로 입사각과 반사각이 똑같아요</b>. 법칙은 그대로, 방향만 흩어지는 거예요.<span class='xh'>오답 하나씩 격파</span>'반사 법칙이 성립하지 않는다'가 이 단원 대표 오개념이에요. 흩어짐의 원인은 법칙이 깨져서가 아니라 <b>법선 방향이 제각각</b>이기 때문이죠. 반사된 빛이 나란하려면 매끈한 면이어야 하고, 사방으로 흩어지니 모습도 비치지 않아요. 빛이 스며들었다면 반사 광선 자체가 그려질 수 없었겠죠.",
    core: "난반사도 낱낱의 빛은 반사 법칙을 지킨다. 법선이 제각각일 뿐!",
  },
  // [e208 · L1 · bogi d2 · 사진 xpair] 정반사·난반사 전환. 검산: ㄱ 참 · ㄴ 거짓(법칙은 성립) · ㄷ 참 → "ㄱ, ㄷ" 3칸.
  {
    id: "g2u3e208",
    lessonId: "g2u3l1",
    type: "mcq",
    diff: 2,
    prompt: "(가)는 바람이 없는 날의 잔잔한 호수, (나)는 바람이 분 뒤 물결이 이는 같은 호수예요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: xpair(
      "calm-lake.webp",
      "잔잔한 수면의 호수와 물가의 나무들",
      "ripple-lake.webp",
      "물결이 이는 수면의 호수",
    ),
    bogi: [
      "(가)의 수면에서는 주로 정반사가 일어나 물가의 나무가 수면에 비쳐 보인다",
      "(나)의 수면에서는 반사 법칙이 성립하지 않는다",
      "(나)의 수면에서도 빛의 반사는 일어나고 있다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>잔잔한 수면은 매끈한 면이라 나란히 온 빛이 나란히 반사되는 <b>정반사</b>가 일어나요. 그래서 (가)에는 물가의 나무가 거울처럼 비치죠(ㄱ 맞아요). 물결이 일면 수면의 기울기가 지점마다 달라져 빛이 사방으로 흩어지는 <b>난반사</b>로 바뀌지만, 반사 자체는 여전히 일어나고 있어요(ㄷ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄴ이 함정이에요. (나)에서도 빛줄기 하나하나는 자기 반사점의 법선을 기준으로 <b>입사각과 반사각이 같아요</b>. 반사 법칙이 깨진 게 아니라 지점마다 법선 방향이 달라 전체 방향이 흩어질 뿐이죠. 모습이 안 비치는 것과 법칙이 안 지켜지는 것은 전혀 다른 이야기랍니다.",
    core: "매끈하면 정반사(모습 비침), 거칠면 난반사. 법칙은 어느 쪽이든 성립!",
  },
  // [e220 · L2 · mcq d1 · xLRP down 45 paths] 공기→물 경로. 검산: 스넬 asin(sin45/1.33) = 32.1° · 공간 정렬 [12,22,32(정답 ③),45직진,반사].
  {
    id: "g2u3e220",
    lessonId: "g2u3l2",
    type: "mcq",
    diff: 1,
    prompt: "손전등 빛이 공기에서 물로 비스듬히 들어가요. 경계면을 지난 뒤 물속에서 빛이 나아갈 경로로 옳은 것은?",
    figure: xLRP({ dir: "down", inc: 45, mode: "paths" }),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>빛이 공기에서 물로 비스듬히 들어가면 경계면에서 <b>법선 쪽으로</b> 꺾여요. 그래서 굴절각은 입사각보다 작아지죠. 들어오던 방향을 그대로 이은 직진 경로를 머릿속 점선으로 먼저 긋고, 그보다 법선에 살짝 가까워진 경로를 고르면 ③이에요.<span class='xh'>오답 하나씩 격파</span>①과 ②는 법선 쪽으로 꺾이는 방향은 맞지만 <b>너무 많이</b> 꺾인 경로예요. 굴절돼도 빛이 법선에 달라붙듯 꺾이지는 않아요. ④는 꺾이지 않고 그대로 나아간 직진 경로인데, 비스듬히 들어간 빛은 반드시 꺾여요. ⑤는 물속으로 들어가지 않고 표면에서 위로 되돌아 나온 반사 경로라, 경계면을 '지난 뒤'의 경로로는 옳지 않아요.",
    core: "공기에서 물로 들어가면 법선 쪽으로 꺾인다(굴절각 < 입사각)!",
  },
  // [e221 · L2 · mcq d2 · xLRP up 25 paths] 물→공기 경로. 검산: asin(1.33 x sin25) = 34.2° · 공간 정렬 [25직진, 34(정답 ②), 47, 60, 반사].
  {
    id: "g2u3e221",
    lessonId: "g2u3l2",
    type: "mcq",
    diff: 2,
    prompt: "물속 잠수 손전등에서 나온 빛이 물과 공기의 경계면을 지나 공기 중으로 나아가요. 빛의 경로로 옳은 것은?",
    figure: xLRP({ dir: "up", inc: 25, mode: "paths" }),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>물에서 공기로 나갈 때는 공기로 들어올 때와 반대로 <b>법선에서 멀어지는 쪽</b>으로 꺾여요. 그래서 굴절각이 입사각보다 커지죠. 직진 경로보다 수면 쪽으로 살짝 더 기운 ②가 정답이에요.<span class='xh'>오답 하나씩 격파</span>①은 물속에서 들어온 방향 그대로 나아간 직진 경로예요. 비스듬히 경계면을 지나는 빛은 반드시 꺾여요. ③과 ④는 꺾이는 방향은 맞지만 실제보다 과하게 기울어 거의 수면에 붙어 버린 경로죠. ⑤는 공기로 나가지 못하고 물속으로 되돌아온 반사 경로라 '경계면을 지나 공기 중으로 나아간' 경로가 아니에요. 공기에서 물로 갈 때(법선 쪽)와 방향을 헷갈리지 않는 게 핵심이에요.",
    core: "물에서 공기로 나갈 때는 법선에서 멀어지게 꺾인다(굴절각 > 입사각)!",
  },
  // [e224 · L2 · bogi d2 · 사진 laser-glass] 유리 블록 두 번 굴절. 검산: 들어갈 때 법선 쪽 · 나올 때 법선에서 멀어짐 → ㄱ 참 ㄴ 거짓 ㄷ 참.
  {
    id: "g2u3e224",
    lessonId: "g2u3l2",
    type: "mcq",
    diff: 2,
    prompt: "사진은 레이저 빛이 공기에서 유리 블록으로 들어갔다가 다시 공기로 나오는 모습이에요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: ximg("laser-glass.webp", "어두운 실험대 위에서 초록 레이저 빛이 유리 블록을 지나가는 사진"),
    bogi: [
      "빛이 유리로 들어갈 때는 법선 쪽으로 꺾인다",
      "빛이 유리에서 공기로 나올 때도 법선 쪽으로 꺾인다",
      "공기와 유리의 경계면 두 곳에서 모두 굴절이 일어난다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>굴절은 서로 다른 두 물질의 <b>경계면마다</b> 일어나요. 이 사진에는 경계면이 두 곳 있죠. 공기에서 유리로 들어갈 때 한 번, 유리에서 공기로 나올 때 또 한 번 꺾여요(ㄷ 맞아요). 공기에서 유리로 들어갈 때는 <b>법선 쪽으로</b> 꺾이고요(ㄱ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄴ이 함정이에요. 유리에서 공기로 <b>나올 때</b>는 반대로 <b>법선에서 멀어지는 쪽</b>으로 꺾여요. 두 경계면에서 꺾이는 방향이 서로 반대라서, 유리를 빠져나온 빛은 처음 들어가던 방향과 나란한 방향으로 나아가게 되죠. '들어갈 때 법선 쪽, 나올 때 법선 반대쪽'을 한 세트로 기억해 두세요.",
    core: "경계면마다 굴절! 들어갈 땐 법선 쪽, 나올 땐 법선에서 멀어지게.",
  },
  // [e227 · L2 · mcq d3 · xLRP up 34 obs] 떠 보이는 위치. 검산: 연장선 위 · 실제 물체(깊이 166)보다 얕은 ㉡(y 147) 정답 · ㉢은 y 173으로 더 깊음.
  {
    id: "g2u3e227",
    lessonId: "g2u3l2",
    type: "mcq",
    diff: 3,
    prompt:
      "그림은 물속 물체에서 나온 빛이 수면에서 꺾여 눈에 들어오는 모습이에요. 점선은 눈에 들어온 빛을 뒤로 곧게 늘인 선이죠. 이 사람에게 물체는 ㉠~㉢ 중 어느 위치에 있는 것처럼 보일까요?",
    figure: xLRP({ dir: "up", inc: 34, mode: "obs", scene: "object" }),
    options: ["㉠", "㉡", "㉢", "실제 위치 그대로 보인다", "수면 위에 떠 있는 것처럼 보인다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>우리 눈은 빛이 <b>곧장 직진해서 왔다</b>고만 여겨요. 그래서 꺾여 들어온 빛을 거꾸로 곧게 늘인 <b>점선(연장선) 위</b>에 물체가 있다고 느끼죠. 연장선 위이면서 실제 물체보다 <b>수면 쪽으로 떠오른</b> 자리인 ㉡이 물체가 보이는 위치예요.<span class='xh'>오답 하나씩 격파</span>㉠은 연장선 위이긴 하지만 수면 바로 아래까지 떠올라 버린 과한 위치예요. ㉢은 실제 물체보다 오히려 <b>더 깊은</b> 자리라 '떠올라 보인다'와 반대죠. 실제 위치 그대로 보인다면 물속 물체를 겨냥하는 일이 어긋날 이유가 없을 테고, 수면 위로 떠 보이는 일은 굴절로는 일어나지 않아요. 물속 물체가 실제보다 얕게 보이는 이유를 작도로 확인하는 문제였어요.",
    core: "눈은 굴절된 빛의 연장선 위, 실제보다 떠오른 자리에 물체가 있다고 느낀다!",
  },
  // [e233 · L2 · multi d1 · 무 W①] 굴절 기본 진술. 검산: 정답 2개(경계면 꺾임 · 수직 직진).
  {
    id: "g2u3e233",
    lessonId: "g2u3l2",
    type: "multi",
    diff: 1,
    prompt: "빛의 굴절에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "서로 다른 두 물질의 경계면을 비스듬히 지날 때 진행 방향이 꺾인다",
      "경계면에 수직으로 들어간 빛은 꺾이지 않고 직진한다",
      "굴절은 빛이 표면에 부딪쳐 되돌아 나오는 현상이다",
      "빛은 한 물질 안을 지나는 동안에도 계속 방향이 꺾인다",
      "공기에서 물로 들어간 빛은 언제나 경계면을 따라 나아간다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>굴절의 조건은 두 가지예요. <b>서로 다른 두 물질의 경계면</b>을 지나야 하고, <b>비스듬히</b> 들어가야 하죠. 두 조건이 갖춰지면 경계면에서 진행 방향이 꺾여요. 반대로 경계면에 수직으로 들어가면(입사각 0°) 꺾일 방향이 없어서 굴절각도 0°, 그대로 직진해요.<span class='xh'>오답 하나씩 격파</span>표면에 부딪쳐 되돌아 나오는 것은 굴절이 아니라 <b>반사</b>예요. 같은 물질 안에서는 빛이 곧게 나아가니 '한 물질 안에서 계속 꺾인다'도 틀렸죠. 꺾이는 곳은 물질이 바뀌는 경계면 딱 한 곳이에요. 경계면을 따라 나아간다는 것은 굴절의 실제 모습이 아니라 극단적인 상상이고, 공기에서 물로 들어간 빛은 법선 쪽으로 꺾여 물속으로 나아간답니다.",
    core: "굴절 = 경계면 + 비스듬히. 수직 입사는 직진!",
  },
  // [e239 · L3 · mcq d1 · xLSEE lamp] 경로 구간별 역할 짝. 검산: ㉠ = 광원의 빛이 물체로 · ㉡ = 반사된 빛이 눈으로.
  {
    id: "g2u3e239",
    lessonId: "g2u3l3",
    type: "mcq",
    diff: 1,
    prompt: "그림은 밤에 스탠드를 켜고 책을 읽을 때 빛이 나아가는 길 ㉠, ㉡을 나타낸 거예요. ㉠과 ㉡에서 일어나는 일을 옳게 짝 지은 것은?",
    figure: xLSEE("lamp"),
    options: [
      "㉠ 광원의 빛이 책을 비춘다 · ㉡ 책에서 반사된 빛이 눈에 들어온다",
      "㉠ 책이 스스로 낸 빛이 퍼진다 · ㉡ 그 빛이 눈에 들어온다",
      "㉠ 눈에서 나간 빛이 책에 닿는다 · ㉡ 책이 그 빛을 스탠드로 보낸다",
      "㉠ 광원의 빛이 책에 모두 흡수된다 · ㉡ 책의 그림자가 눈에 보인다",
      "㉠ 책에서 반사된 빛이 스탠드로 간다 · ㉡ 스탠드의 빛이 눈에 들어온다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>책은 스스로 빛을 내지 못하는 물체예요. 그래서 책이 보이는 경로는 <b>광원 → 물체(반사) → 눈</b>의 순서죠. ㉠은 광원인 스탠드의 빛이 책을 비추는 구간, ㉡은 책 표면에서 <b>반사된</b> 빛이 눈까지 들어오는 구간이에요. 이 두 구간이 모두 이어져야 책이 보여요.<span class='xh'>오답 하나씩 격파</span>책이 스스로 빛을 낸다면 스탠드를 꺼도 보여야 하는데, 캄캄한 방에서 책은 보이지 않죠. '눈에서 나간 빛'은 아주 오래된 오개념이에요. 눈은 빛이 도착하는 곳이지 출발하는 곳이 아니랍니다. 빛이 책에 모두 흡수된다면 책은 검게 보일 뿐 글씨를 읽을 수 없고, 빛이 눈이 아니라 스탠드로 돌아가는 경로로는 우리가 책을 볼 수 없어요.",
    core: "물체가 보이는 공식: 광원 → 물체(반사) → 눈!",
  },
  // [e241 · L3 · mcq d1 · 무 W①] 오개념 역방향(사실 → 바로잡을 생각). 검산: 캄캄하면 안 보임 = 눈이 빛을 쏘지 않는 증거.
  {
    id: "g2u3e241",
    lessonId: "g2u3l3",
    type: "mcq",
    diff: 1,
    prompt:
      "불을 모두 끈 캄캄한 방에서는 눈을 아무리 크게 떠도, 시간이 아무리 지나도 아무것도 보이지 않아요. 이 사실이 <b>틀렸다고 알려 주는 생각</b>은 어느 것일까요?",
    options: [
      "눈에서 나간 빛이 물체에 닿기 때문에 물체가 보인다는 생각",
      "광원은 스스로 빛을 내는 물체라는 생각",
      "물체에서 반사된 빛이 눈에 들어와야 물체가 보인다는 생각",
      "반사할 빛이 없으면 물체가 보이지 않는다는 생각",
      "밝은 곳에서는 물체가 잘 보인다는 생각",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>만약 눈에서 빛이 나가 물체를 비추는 것이라면, 캄캄한 방에서도 눈만 뜨면 물체가 보여야 해요. 하지만 실제로는 아무것도 보이지 않죠. 그러니 캄캄한 방의 경험은 <b>'눈에서 나간 빛이 물체를 비춘다'는 생각이 틀렸음</b>을 보여 주는 증거예요. 빛의 출발점은 언제나 광원이고, 눈은 빛이 도착하는 곳이에요.<span class='xh'>오답 하나씩 격파</span>나머지 생각들은 캄캄한 방의 경험과 <b>어긋나지 않아요</b>. 광원이 스스로 빛을 낸다는 것, 반사된 빛이 눈에 들어와야 보인다는 것, 반사할 빛이 없으면 안 보인다는 것은 오히려 '캄캄하면 아무것도 안 보인다'를 그대로 설명해 주는 옳은 생각들이죠. 밝은 곳에서 잘 보인다는 생각도 같은 원리의 다른 표현이에요.",
    core: "캄캄하면 안 보인다 = 눈은 빛의 출발점이 아니라는 증거!",
  },
  // [e246 · L3 · bogi d2 · 무 W①] 정전 밤 이유 종합. 검산: ㄱ 거짓(물건은 그대로) · ㄴ ㄷ 참 → "ㄴ, ㄷ" 4칸.
  {
    id: "g2u3e246",
    lessonId: "g2u3l3",
    type: "mcq",
    diff: 2,
    prompt: "한밤중 정전으로 온 집 안이 완전히 캄캄해지자, 방 안의 어떤 물건도 보이지 않았어요. 그 까닭으로 옳은 것을 <보기>에서 모두 고른 것은?",
    bogi: [
      "방 안의 물건들이 잠시 사라졌기 때문이다",
      "물건이 반사할 빛이 없기 때문이다",
      "광원에서 온 빛도, 물건에서 반사된 빛도 눈에 들어오지 않기 때문이다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>물체가 보이려면 광원의 빛이 물체에서 <b>반사되어 눈까지</b> 와야 해요. 정전으로 광원이 모두 꺼지면 물건을 비출 빛 자체가 없으니 반사될 빛도 없고(ㄴ 맞아요), 결국 광원의 빛이든 반사된 빛이든 눈에 들어오는 빛이 하나도 없어서 아무것도 보이지 않아요(ㄷ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄱ은 재미있는 함정이에요. 물건들은 어둠 속에서도 <b>제자리에 그대로</b> 있어요. 다시 불을 켜면 모든 것이 아까 그 자리에서 보이잖아요. 보이지 않는 까닭은 물건이 없어져서가 아니라 물건이 눈으로 보낼 <b>빛이 없어서</b>예요. '보인다'는 물체의 문제가 아니라 빛의 문제라는 것, 이 단원의 핵심이랍니다.",
    core: "안 보이는 건 물체가 없어서가 아니라 눈에 올 빛이 없어서!",
  },
  // [e255 · L4 · mcq d1 · xLMR base] 작도 요소 이름. 검산: ㉠ = 거울에서 눈으로 가는 반사 광선 · ㉡ = 거울 뒤 연장선(점선).
  {
    id: "g2u3e255",
    lessonId: "g2u3l4",
    type: "mcq",
    diff: 1,
    prompt: "그림은 평면거울 앞 물체에서 나온 빛이 눈에 들어오기까지를 작도한 거예요. ㉠과 ㉡의 이름을 옳게 짝 지은 것은?",
    figure: xLMR({ mode: "base" }),
    options: [
      "㉠ 반사 광선 · ㉡ 반사 광선을 거울 뒤로 늘인 연장선",
      "㉠ 입사 광선 · ㉡ 반사 광선",
      "㉠ 연장선 · ㉡ 반사 광선",
      "㉠ 법선 · ㉡ 입사 광선",
      "㉠ 반사 광선 · ㉡ 법선",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>물체에서 나온 빛이 거울에 닿기까지가 입사 광선, 거울에서 반사 법칙대로 꺾여 <b>눈으로 향하는 실선</b>이 반사 광선(㉠)이에요. 그리고 그 반사 광선을 거울 <b>뒤쪽으로 곧게 늘인 점선</b>이 연장선(㉡)이죠. 연장선들이 만나는 거울 뒤의 한 점에 상이 생긴 것처럼 보여요.<span class='xh'>오답 하나씩 격파</span>㉠을 입사 광선이라 하면 방향이 틀려요. 입사 광선은 물체에서 거울로 <b>들어가는</b> 빛이고, ㉠은 거울에서 <b>나와</b> 눈으로 가는 빛이에요. ㉡을 법선이라 부르는 것도 곤란해요. 법선은 반사면에 수직으로 세운 기준선이지, 광선을 늘인 선이 아니거든요. 실선(실제 빛)과 점선(가상의 연장)을 구분하는 것이 작도 문제의 첫걸음이에요.",
    core: "실선 = 실제 빛(입사·반사 광선), 점선 = 거울 뒤 연장선!",
  },
  // [e256 · L4 · mcq d2 · xLMG cells4] 모눈 상 위치. 검산: 물체 4칸 → 상 = 거울 뒤 4칸 = ④(공간 정렬 order 1·2·3·4·면 · §8-1).
  {
    id: "g2u3e256",
    lessonId: "g2u3l4",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 모눈 위에 평면거울과 촛불 모양 물체가 있어요. 물체는 거울에서 4칸 떨어져 있죠. 이 물체의 상이 생기는 위치는 어디일까요?",
    figure: xLMG({ cells: 4, order: [1, 2, 3, 4, 0] }),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>평면거울의 상은 물체의 <b>거울 대칭점</b>에 생겨요. 물체에서 거울까지의 거리와 거울에서 상까지의 거리가 언제나 같다는 뜻이죠. 물체가 거울 앞 4칸이니 상은 거울 뒤 <b>4칸</b>, 곧 ④ 자리예요.<span class='xh'>오답 하나씩 격파</span>①~③은 거울 뒤이긴 하지만 물체보다 가까운 자리예요. 상이 거울에 더 붙어 보일 이유는 없어요. 모눈에서 칸 수를 세면 바로 확인되죠. ⑤(거울 면 위)를 고르면 상이 거울 표면에 붙어 있다는 뜻인데, 거울 속 모습은 언제나 거울 <b>뒤쪽 공간</b>에 있는 것처럼 보여요. 반사 광선의 연장선이 만나는 점이 거울 뒤 대칭 자리이기 때문이랍니다.",
    core: "평면거울 상 = 거울 대칭점. 앞 4칸이면 뒤 4칸!",
  },
  // [e257 · L4 · bogi d2 · xLMR ghost] 원리 판정. 검산: ㄱ 거짓(빛은 거울 뒤로 못 감) · ㄴ ㄷ 참 → "ㄴ, ㄷ" 4칸.
  {
    id: "g2u3e257",
    lessonId: "g2u3l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 평면거울에 상이 생기는 원리를 작도한 거예요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: xLMR({ mode: "ghost" }),
    bogi: [
      "물체에서 나온 빛은 거울을 뚫고 지나가 거울 뒤 물음표 자리에 모인다",
      "눈에 들어온 반사 광선을 거울 뒤로 연장하면 한 점에서 만난다",
      "우리 눈은 그 교점에서 빛이 나온 것처럼 느껴 그 자리에 상이 있다고 여긴다",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>물체의 한 점에서 나간 빛은 거울의 서로 다른 곳에서 반사되어 눈에 들어와요. 이 반사 광선들을 거울 뒤로 곧게 연장하면 <b>정확히 한 점</b>에서 만나고(ㄴ 맞아요), 눈은 빛이 늘 직진해 왔다고 여기니 그 교점에서 빛이 출발했다고 느껴요. 그래서 그 자리에 상이 있다고 여기죠(ㄷ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄱ이 핵심 함정이에요. 거울은 빛을 <b>반사</b>하는 도구라서 빛은 거울 뒤로 한 줄기도 넘어가지 않아요. 거울 뒤에 실제로 빛이 모여 상을 만드는 게 아니라, 반사 광선의 <b>연장선이 만나는 가상의 자리</b>가 상의 위치인 거예요. 그래서 거울 뒤를 아무리 뒤져도 아무것도 없답니다.",
    core: "상 = 반사 광선 연장선의 교점. 거울 뒤로 실제 빛은 가지 않는다!",
  },
  // [e261 · L4 · num d3 · xLMR distRev 26] 거리 역산. 검산: 물체~상 26 = 물체~거울 x2 → 13cm.
  {
    id: "g2u3e261",
    lessonId: "g2u3l4",
    type: "num",
    diff: 3,
    prompt:
      "평면거울 앞에 작은 초를 세웠더니, 그림처럼 초에서 거울 속 상까지의 거리가 26cm였어요. 초는 거울에서 몇 cm 떨어져 있을까요?",
    figure: xLMR({ mode: "distRev", d2: 26 }),
    answer: "13",
    unitLabel: "cm",
    explain:
      "<span class='xh'>정답 풀이</span>평면거울에서 물체~거울 거리와 거울~상 거리는 <b>항상 같아요</b>. 그러니 물체에서 상까지의 거리는 그 두 배죠.<br>① 물체~상 거리 26cm = (물체~거울 거리) × 2<br>② 물체~거울 거리 = 26 ÷ 2 = <b>13cm</b><span class='xh'>이렇게 생각했다면</span>26cm를 그대로 답했다면 '물체~상'과 '물체~거울'을 같은 거리로 읽은 거예요. 두 거리는 항상 2배 차이가 나요. 52cm를 답했다면 방향을 거꾸로 계산한 것이고요. 문제가 주는 거리가 <b>어디에서 어디까지</b>인지 그림에서 먼저 짚고, 거울을 기준으로 반씩 나뉜다는 대칭 관계를 떠올리면 틀릴 일이 없답니다.",
    core: "물체~상 거리는 물체~거울 거리의 2배. 역산은 절반!",
  },
  // [e271 · L4 · mcq d3 · xLMRfull 156] 전신 거울 절반(그림 동반 mcq · 감사 쟁점 6의 num 폐기판). 검산: 156/2 = 78.
  {
    id: "g2u3e271",
    lessonId: "g2u3l4",
    type: "mcq",
    diff: 3,
    prompt:
      "키가 156cm인 학생이 벽에 세로로 붙인 평면거울로 머리끝부터 발끝까지 한 번에 보려고 해요. 그림은 이때 머리끝과 발끝에서 나온 빛이 눈에 들어오는 경로를 작도한 거예요. 필요한 거울의 최소 세로 길이는 얼마일까요?",
    figure: xLMRfull(156),
    options: ["78cm", "156cm", "104cm", "52cm", "39cm"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 작도를 보면, 머리끝에서 온 빛은 <b>머리끝과 눈의 중간 높이</b>에서, 발끝에서 온 빛은 <b>발끝과 눈의 중간 높이</b>에서 반사되어 눈에 들어와요(입사각 = 반사각의 결과예요). 거울은 이 두 반사점 사이만 있으면 충분하죠. 두 중간점 사이의 길이는 언제나 키의 절반이라 156 ÷ 2 = <b>78cm</b>면 돼요.<span class='xh'>오답 하나씩 격파</span>키와 같은 156cm는 거울이 몸 전체를 덮어야 한다는 직감에서 나온 함정이에요. 작도해 보면 위아래로 남는 구간은 쓰이지 않아요. 104cm(키의 3분의 2)나 52cm(3분의 1), 39cm(4분의 1)는 어떤 작도로도 나오지 않는 값이죠. 참고로 이 결과는 거울에서 멀어지거나 가까워져도 변하지 않아요. 반사점이 늘 중간 높이에 생기기 때문이에요.",
    core: "전신 거울의 최소 길이 = 키의 절반. 반사점이 늘 중간 높이라서!",
  },
  // [e273 · L5 · mcq d1 · xLXS A] 단면 식별. 검산: 배치 (가)오목 거울 (나)볼록 렌즈 (다)볼록 거울 (라)오목 렌즈 → 정답 ③(다).
  {
    id: "g2u3e273",
    lessonId: "g2u3l5",
    type: "mcq",
    diff: 1,
    prompt: "그림은 거울 두 종류와 렌즈 두 종류의 옆 단면을 나타낸 거예요(빗금 친 회색 몸통은 거울의 뒷면이에요). <b>볼록 거울</b>은 어느 것일까요?",
    figure: xLXS(["ccm", "cvl", "cvm", "ccl"]),
    options: ["(가)", "(나)", "(다)", "(라)", "이 중에는 없다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 거울과 렌즈를 가르는 기준은 <b>빗금 친 회색 몸통(뒷면)</b>이에요. 몸통이 있으면 빛을 반사하는 거울, 없이 유리 단면만 있으면 빛을 통과시키는 렌즈죠. (가)와 (다)가 거울인데, 반사면이 바깥으로 불룩하게 나온 쪽이 볼록 거울이에요. (다)는 반사면이 물체 쪽으로 불룩하니 <b>볼록 거울</b>이 맞아요.<span class='xh'>오답 하나씩 격파</span>(가)는 반사면이 안쪽으로 오목하게 파인 <b>오목 거울</b>이에요. (나)는 가운데가 가장자리보다 두꺼운 <b>볼록 렌즈</b>, (라)는 가운데가 얇은 <b>오목 렌즈</b>고요. 렌즈의 볼록·오목은 가운데 두께로, 거울의 볼록·오목은 반사면이 휜 방향으로 판단해요. 단면 그림에서 몸통부터 찾는 습관을 들이면 헷갈리지 않아요.",
    core: "몸통 있으면 거울! 반사면이 불룩 나오면 볼록 거울.",
  },
  // [e275 · L5 · mcq d1 · twoMirrorsFig 데뷔] 모음/퍼뜨림 축(그림 라벨이 종류를 인쇄하므로 판별 과제 금지 · §8-3).
  {
    id: "g2u3e275",
    lessonId: "g2u3l5",
    type: "mcq",
    diff: 1,
    prompt: "그림은 볼록 거울과 오목 거울의 단면이에요. 나란한 빛을 각 거울에 비추었을 때, 반사된 빛의 진행을 옳게 짝 지은 것은?",
    figure: twoMirrorsFig(),
    options: [
      "(가)는 빛을 사방으로 퍼뜨리며 반사하고, (나)는 빛을 한곳으로 모으며 반사한다",
      "(가)는 빛을 한곳으로 모으며 반사하고, (나)는 빛을 사방으로 퍼뜨리며 반사한다",
      "(가)도 (나)도 빛을 한곳으로 모으며 반사한다",
      "(가)도 (나)도 빛을 사방으로 퍼뜨리며 반사한다",
      "(가)는 빛을 통과시키고, (나)는 빛을 반사한다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>거울의 휜 방향이 반사된 빛의 운명을 정해요. 바깥으로 불룩한 (가) 볼록 거울은 나란히 온 빛을 <b>사방으로 퍼뜨리며</b> 반사해요. 그래서 넓은 범위를 한눈에 담을 수 있죠. 안으로 오목한 (나) 오목 거울은 반대로 빛을 <b>한곳으로 모으며</b> 반사해요.<span class='xh'>오답 하나씩 격파</span>모음과 퍼뜨림을 서로 바꾼 짝은 두 거울의 성질을 뒤집은 함정이에요. 불룩한 면에 부딪힌 빛들이 벌어지고, 오목한 면에 부딪힌 빛들이 모인다는 것을 단면의 모양에서 그려 보세요. 두 거울이 똑같이 행동한다면 굳이 두 종류를 만들 이유가 없겠죠. 그리고 둘 다 <b>거울</b>이라 빛을 통과시키지 않고 반사해요. 통과시키며 꺾는 도구는 렌즈랍니다.",
    core: "볼록 거울 = 퍼뜨림(넓게 보기), 오목 거울 = 모음!",
  },
  // [e276 · L5 · bogi d3 · twoLensFig] 렌즈 판별+성질(v1 e78과 축 교체 · 명제 신작). 검산: ㄱ 참 · ㄴ 거짓(멀면 거꾸로) · ㄷ 참 → "ㄱ, ㄷ" 3칸.
  {
    id: "g2u3e276",
    lessonId: "g2u3l5",
    type: "mcq",
    diff: 3,
    prompt: "가까이 있는 무당벌레를 렌즈 (가), (나)로 관찰했더니 그림처럼 보였어요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: twoLensFig(),
    bogi: [
      "(가)는 가운데가 가장자리보다 두꺼운 렌즈다",
      "(가)의 렌즈로 멀리 있는 건물을 보면 항상 크고 바로 선 모습으로 보인다",
      "(나)와 같은 렌즈는 근시 교정용 안경에 쓰인다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>가까운 것을 <b>크게</b> 보여 준 (가)는 볼록 렌즈예요. 볼록 렌즈는 가운데가 가장자리보다 두꺼워서 지나가는 빛을 안쪽으로 모으죠(ㄱ 맞아요). 작게 보여 준 (나)는 가운데가 얇아 빛을 퍼뜨리는 오목 렌즈이고, 멀리 있는 것이 잘 안 보이는 <b>근시</b>를 교정하는 안경에 쓰여요(ㄷ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄴ이 함정이에요. 볼록 렌즈가 '항상' 크게 보여 주지는 않아요. 가까운 물체는 크고 바로 선 모습이지만, <b>멀리 있는 물체</b>는 렌즈를 지나며 모인 빛이 서로 교차해 <b>작고 거꾸로 선 모습</b>으로 보여요. 돋보기로 창밖 먼 건물을 보면 세상이 뒤집혀 보이는 게 그 증거죠. '항상'이라는 말이 들어간 보기는 예외 상황부터 떠올려 보세요.",
    core: "가까이 크게 = 볼록 렌즈. 단, 먼 물체는 작고 거꾸로!",
  },
  // [e277 · L5 · mcq d2 · 사진 glass-sphere] 유리구슬 = 볼록 렌즈 유추(비상03 계보). 검산: 구형 투명체 = 빛 모음 · 먼 풍경 = 모인 빛 교차 = 거꾸로.
  {
    id: "g2u3e277",
    lessonId: "g2u3l5",
    type: "mcq",
    diff: 2,
    prompt: "사진 속 유리구슬에는 뒤쪽의 먼 풍경이 위아래가 뒤집힌 채 맺혀 있어요. 이 유리구슬이 하는 구실과 가장 가까운 도구는 무엇일까요?",
    figure: ximg("glass-sphere.webp", "이끼 낀 바위 위 유리구슬 속에 먼 산과 하늘 풍경이 위아래가 뒤집혀 맺힌 사진"),
    options: [
      "가운데가 두꺼워 빛을 모으는 볼록 렌즈",
      "가운데가 얇아 빛을 퍼뜨리는 오목 렌즈",
      "빛을 넓게 퍼뜨리며 반사하는 볼록 거울",
      "빛을 모으며 반사하는 오목 거울",
      "빛을 모두 흡수하는 검은 판",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>유리구슬은 투명해서 빛을 <b>통과</b>시켜요. 통과시키며 꺾는 도구는 거울이 아니라 렌즈죠. 그리고 구슬은 어느 방향으로 보나 가운데가 가장 두꺼운 모양이라 <b>볼록 렌즈</b>처럼 빛을 모아요. 멀리서 온 풍경의 빛이 구슬을 지나며 모여 서로 <b>교차한 뒤</b> 눈에 들어오기 때문에, 구슬 속 풍경이 위아래가 뒤집혀 보이는 거예요.<span class='xh'>오답 하나씩 격파</span>오목 렌즈라면 빛을 퍼뜨리니 풍경이 작고 바로 선 모습이어야 해요. 뒤집힌 모습과 맞지 않죠. 거울이라면 구슬 <b>너머의</b> 풍경이 아니라 구슬 앞쪽(카메라 쪽) 풍경이 비쳐야 하고요. 빛을 모두 흡수한다면 구슬은 그냥 검게 보였을 거예요. 돋보기로 먼 창밖을 본 모습과 같은 원리라는 것을 떠올리면 쉬워요.",
    core: "투명한 구슬 = 볼록 렌즈. 먼 풍경은 모인 빛이 교차해 거꾸로!",
  },
  // [e279 · L5 · mcq d1 · 사진 convex-mirror 단독] 형태·상 판독 → 종류·쓰임(천03 계보).
  // concave-mirror.webp는 등대 장치 내부 사진이라 오목 판독 불가로 파일럿 눈검수에서 미사용 확정(§8-5).
  // 검산: 불룩한 면 + 작고 넓게 비친 상 = 볼록 거울 = 넓은 시야.
  {
    id: "g2u3e279",
    lessonId: "g2u3l5",
    type: "mcq",
    diff: 1,
    prompt: "사진은 주차장 기둥에 달린 거울이에요. 거울의 생김새와 거울에 비친 모습을 살펴볼 때, 이 거울에 대한 설명으로 가장 옳은 것은?",
    figure: ximg("convex-mirror.webp", "기둥에 달린, 바깥으로 불룩하게 튀어나온 둥근 거울에 주변 통로가 작고 넓게 비친 사진"),
    options: [
      "바깥으로 불룩한 볼록 거울이라 넓은 범위를 한눈에 비춘다",
      "안으로 오목하게 파인 거울이라 가까운 것을 크게 비춘다",
      "평면거울이라 실물과 같은 크기의 모습이 비친다",
      "빛을 한곳으로 모으며 반사하는 거울이다",
      "빛을 통과시키며 꺾는 렌즈의 한 종류다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 거울은 표면이 바깥으로 <b>불룩하게</b> 튀어나와 있고, 그 안에 통로 전체가 <b>작고 넓게</b> 담겨 있어요. 이것이 볼록 거울의 특징이죠. 볼록 거울은 빛을 사방으로 퍼뜨리며 반사해서 상이 언제나 작고 바로 선 대신, 좁은 거울 안에 <b>넓은 범위</b>가 들어와요. 그래서 주차장 모퉁이나 굽은 길목에 달아 두는 거예요.<span class='xh'>오답 하나씩 격파</span>안으로 파인 오목 거울이라면 가까운 것이 크게 비쳤을 텐데, 사진 속 모습은 실물보다 작게 담겨 있으니 맞지 않아요. 평면거울이라면 표면이 평평하고 실물 크기 그대로 비쳐야 하고요. 빛을 한곳으로 모으는 것은 오목 거울의 성질이라 불룩한 이 거울과 반대예요. 그리고 거울은 빛을 <b>반사</b>하는 도구라, 빛을 통과시키며 꺾는 렌즈와는 작동 원리부터 다르답니다.",
    core: "불룩한 면 + 작고 넓게 비친 상 = 볼록 거울(넓은 시야)!",
  },
  // [e284 · L5 · mcq d3 · xLOB ccm] 오목 거울 거리별 상 변화. 검산: 가까이 = 크고 바로 · 멀리 = 모인 빛 교차 = 작고 거꾸로.
  {
    id: "g2u3e284",
    lessonId: "g2u3l5",
    type: "mcq",
    diff: 3,
    prompt:
      "같은 오목 거울 앞에 촛불을 (가)처럼 가까이, (나)처럼 멀리 두고 거울에 비친 모습을 관찰하려고 해요. (가)와 (나)에서 보이는 모습을 옳게 짝 지은 것은?",
    figure: xLOB("ccm"),
    options: [
      "(가) 크고 바로 선 모습 · (나) 작고 거꾸로 선 모습",
      "(가) 작고 바로 선 모습 · (나) 크고 바로 선 모습",
      "(가) 크고 거꾸로 선 모습 · (나) 작고 바로 선 모습",
      "(가)와 (나) 모두 크고 바로 선 모습",
      "(가)와 (나) 모두 작고 바로 선 모습",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>오목 거울은 빛을 모으며 반사하는 거울이라 물체와의 <b>거리에 따라 상이 달라져요</b>. 물체가 가까울 때는 크고 바로 선 모습(가)이지만, 멀어지면 모인 반사 광선이 서로 <b>교차한 뒤</b> 눈에 들어와 작고 거꾸로 선 모습(나)으로 바뀌어요.<span class='xh'>오답 하나씩 격파</span>어느 거리에서나 작고 바로 선 모습이라면 그건 오목 거울이 아니라 <b>볼록 거울</b>의 행동이에요. '가까이서 거꾸로, 멀리서 바로'처럼 순서를 뒤집은 짝도 함정이죠. 뒤집힘은 빛이 모여 교차해야 생기니 <b>먼 쪽</b>에서 일어나요. 거리에 따라 변신하는 조는 오목 거울과 볼록 렌즈 둘뿐이라는 것까지 묶어 기억하면 이 유형은 끝이에요.",
    core: "오목 거울: 가까이 크고 바로, 멀면 모인 빛이 교차해 작고 거꾸로!",
  },
  // [e297 · L6 · mcq d1 · LPX R+G] 화소 합성 정방향(노랑 조각 단독 사용). 검산: 빨+초 = 노랑.
  {
    id: "g2u3e297",
    lessonId: "g2u3l6",
    type: "mcq",
    diff: 1,
    prompt:
      "대형 전광판의 한 부분을 가까이에서 확대했더니 그림처럼 빨간색 화소와 초록색 화소만 켜져 있었어요(켜진 두 화소의 밝기는 같아요). 멀리 떨어져서 이 부분을 보면 무슨 색으로 보일까요?",
    figure: lightPixelExamFig({ on: [true, true, false] }),
    options: ["노란색", "자홍색", "청록색", "흰색", "검은색"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>화소 하나하나는 빨강, 초록, 파랑 가운데 한 가지 빛만 내요. 화소가 워낙 작아서 멀리서 보면 이웃한 화소의 빛이 눈 안에서 <b>합성</b>되죠. 켜진 것이 빨강과 초록이니 두 빛의 합성 결과인 <b>노란색</b>으로 보여요.<span class='xh'>오답 하나씩 격파</span>자홍색은 빨강과 파랑, 청록색은 초록과 파랑이 합성된 색이에요. 지금 파란 화소는 꺼져 있으니 이 두 색은 나올 수 없죠. 흰색이 되려면 세 화소가 <b>모두</b> 켜져야 하고, 검은색은 세 화소가 모두 꺼졌을 때의 색이에요. 물감을 섞던 경험으로 '빨강과 초록을 섞으면 탁해진다'고 판단하면 함정에 빠져요. 빛은 겹칠수록 밝아지는 덧셈 합성이랍니다.",
    core: "빨간빛 + 초록빛 = 노란빛. 빛의 합성은 밝아지는 덧셈!",
  },
  // [e300 · L6 · bogi d2 · LPX RGB] 화소 종합(흰색 언급 금지 · 조각 배타). 검산: ㄱ 거짓(빛은 밝아짐) · ㄴ ㄷ 참 → "ㄴ, ㄷ" 4칸.
  {
    id: "g2u3e300",
    lessonId: "g2u3l6",
    type: "mcq",
    diff: 2,
    prompt: "그림은 어느 화면의 한 부분을 확대한 모습이에요(세 종류의 화소가 모두 켜져 있어요). 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: lightPixelExamFig({ on: [true, true, true] }),
    bogi: [
      "세 화소의 빛이 겹치면 물감을 섞을 때처럼 점점 어두워진다",
      "화소 하나하나는 빨강, 초록, 파랑 중 한 가지 색의 빛만 낸다",
      "각 화소의 밝기를 조절하면 이 부분을 여러 가지 색으로 보이게 할 수 있다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>화면을 확대하면 보이는 것은 빨강, 초록, 파랑 세 종류의 화소뿐이에요. 화소 하나는 자기 색 빛 <b>하나만</b> 내죠(ㄴ 맞아요). 그런데도 화면이 온갖 색을 표현할 수 있는 비밀은 <b>밝기 조절</b>이에요. 세 빛의 밝기 조합을 바꾸면 노랑도, 주황도, 살구색도 만들 수 있어요(ㄷ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄱ이 함정이에요. 물감은 섞을수록 흡수하는 빛이 늘어나 어두워지지만, 빛은 겹칠수록 에너지가 더해져 <b>더 밝아져요</b>. 화면의 화소들이 하는 일은 물감 혼합이 아니라 빛의 합성이죠. 방향이 정반대인 두 현상을 한 문장에 섞어 놓은 보기였어요.",
    core: "화소는 한 색만! 밝기 조합이 색을, 빛의 합성은 밝음을 만든다.",
  },
  // [e301 · L6 · mcq d2 · LBA 빨/검/검] 조명 관찰 역산. 검산: 빨간 조명에서만 제 색 = 빨간 빛만 반사.
  {
    id: "g2u3e301",
    lessonId: "g2u3l6",
    type: "mcq",
    diff: 2,
    prompt:
      "같은 풍선에 빨간 조명, 초록 조명, 파란 조명을 하나씩 비추었더니 그림처럼 차례대로 빨간색, 검은색, 검은색으로 보였어요. 이 풍선은 어떤 색의 빛을 반사하는 풍선일까요?",
    figure: lightBalloonFig({
      seen: [
        { fill: "#E5322E", name: "빨간색" },
        { fill: "#23282F", name: "검은색" },
        { fill: "#23282F", name: "검은색" },
      ],
    }),
    options: ["빨간색 빛만 반사한다", "초록색 빛만 반사한다", "파란색 빛만 반사한다", "세 색의 빛을 모두 반사한다", "어떤 빛도 반사하지 않는다"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>물체는 자기가 반사하는 색의 빛이 조명 속에 있을 때만 그 색으로 보여요. 빨간 조명에서 빨갛게 보였다는 것은 빨간 빛을 <b>반사한다</b>는 뜻이고, 초록·파란 조명에서 검게 보였다는 것은 그 두 빛은 <b>흡수한다</b>는 뜻이죠. 그러니 이 풍선은 <b>빨간 빛만</b> 반사하는 풍선이에요.<span class='xh'>오답 하나씩 격파</span>초록 빛이나 파란 빛을 반사하는 풍선이라면 그 색 조명에서 제 색으로 보였어야 해요. 관찰 결과와 어긋나죠. 세 빛을 모두 반사하는 풍선(흰 풍선)이라면 세 조명 모두에서 조명 색 그대로 보였을 거예요. 어떤 빛도 반사하지 않는 풍선(검은 풍선)이라면 빨간 조명에서도 검게 보였어야 하고요. 조명별 관찰 결과를 하나씩 대조하면 답이 저절로 좁혀져요.",
    core: "보이는 색 = 반사한 빛. 검게 보인 조명의 빛은 흡수한 것!",
  },
  // [e302 · L6 · mcq d2 · xLVN] 벤 ㉠㉡(자홍+백 조각 이 문항 단독 소유). 검산: 빨+파 = 자홍 · 셋 = 흰색.
  {
    id: "g2u3e302",
    lessonId: "g2u3l6",
    type: "mcq",
    diff: 2,
    prompt: "그림은 빨간빛, 초록빛, 파란빛을 흰 벽에 겹쳐 비춘 모습을 나타낸 거예요. ㉠과 ㉡ 자리에 나타나는 색을 옳게 짝 지은 것은?",
    figure: xLVN(),
    options: [
      "㉠ 자홍색 · ㉡ 흰색",
      "㉠ 노란색 · ㉡ 흰색",
      "㉠ 자홍색 · ㉡ 검은색",
      "㉠ 청록색 · ㉡ 흰색",
      "㉠ 흰색 · ㉡ 자홍색",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>㉠은 빨간빛과 파란빛 두 개가 겹친 자리예요. 빨강 + 파랑 = <b>자홍색</b>이죠. ㉡은 세 빛이 모두 겹친 한가운데예요. 삼원색을 같은 밝기로 모두 합치면 <b>흰색</b>이 돼요.<span class='xh'>오답 하나씩 격파</span>노란색은 빨강과 초록이 겹친 자리에서, 청록색은 초록과 파랑이 겹친 자리에서 나타나는 색이라 ㉠의 위치와 맞지 않아요. ㉡을 검은색이라 고른 것은 물감 경험의 함정이에요. 물감은 다 섞으면 어두워지지만 빛은 겹칠수록 밝아져서, 셋이 모이면 가장 밝은 흰색이 되죠. ㉠과 ㉡을 서로 바꾼 짝은 겹친 빛의 개수부터 세면 걸러낼 수 있어요. 두 개가 겹치면 이차색, 세 개가 겹치면 흰색이에요.",
    core: "빨+파 = 자홍, 세 빛 모두 = 흰색. 빛은 겹칠수록 밝다!",
  },
  // [e304 · L6 · bogi d2 · 사진 prism] 백색광(갈라짐 서술 원칙 · 금지어 목록은 설계표 §1). 검산: ㄱ 참 · ㄴ 거짓 · ㄷ 참 → "ㄱ, ㄷ" 3칸.
  {
    id: "g2u3e304",
    lessonId: "g2u3l6",
    type: "mcq",
    diff: 2,
    prompt: "사진은 백색광이 프리즘을 지나며 여러 색의 빛으로 갈라진 모습이에요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: ximg("prism-split.webp", "어두운 곳에서 흰 빛이 삼각 프리즘을 지나 여러 색의 띠로 갈라지는 사진"),
    bogi: [
      "백색광 속에는 여러 색의 빛이 들어 있다",
      "프리즘이 색소를 내어 흰 빛에 색을 입힌 것이다",
      "갈라진 여러 색의 빛을 다시 고르게 합치면 백색광이 된다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>프리즘을 지난 흰 빛이 여러 색 띠로 갈라졌다는 것은, 그 색들이 <b>처음부터 백색광 안에 들어 있었다</b>는 뜻이에요(ㄱ 맞아요). 그리고 갈라진 여러 색의 빛을 다시 고르게 합치면 도로 흰 빛이 돼요(ㄷ 맞아요). 여러 색 빛이 고르게 합쳐진 빛, 그것이 백색광의 정체죠.<span class='xh'>오답 하나씩 격파</span>ㄴ은 옛날 사람들이 실제로 했던 오해예요. 프리즘이 물감처럼 색을 만들어 입힌 것이라면, 갈라진 빛을 두 번째 프리즘에 통과시켰을 때 색이 더 늘어나야 해요. 하지만 실제로는 다시 합쳐져 흰 빛이 될 뿐이죠. 프리즘은 색을 <b>만드는</b> 도구가 아니라 이미 들어 있던 색을 <b>갈라 보여 주는</b> 도구랍니다.",
    core: "백색광 = 여러 색 빛의 합. 프리즘은 그걸 갈라 보여 줄 뿐!",
  },
  // [e321 · L7 · bogi d1 · 무 W①] 매질 제자리(3사 공통 최다 단골 · 레슨 multi와 명제 문구 교체). 검산: ㄱ 참 · ㄴ 거짓 · ㄷ 참 → "ㄱ, ㄷ" 3칸.
  {
    id: "g2u3e321",
    lessonId: "g2u3l7",
    type: "mcq",
    diff: 1,
    prompt: "파동에 대한 설명으로 옳은 것을 <보기>에서 모두 고른 것은?",
    bogi: [
      "파동이 전달하는 것은 물질이 아니라 에너지다",
      "물결파가 지나가면 매질인 물도 물결을 따라 계속 밀려간다",
      "매질은 파동이 지나가는 동안 제자리에서 진동한다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>파동은 한곳에서 생긴 <b>진동이 퍼져 나가는</b> 현상이에요. 이때 이동하는 것은 매질이라는 물질이 아니라 진동이라는 상태, 곧 <b>에너지</b>죠(ㄱ 맞아요). 매질은 파동이 지나가는 내내 <b>제자리에서 진동만</b> 해요(ㄷ 맞아요).<span class='xh'>오답 하나씩 격파</span>ㄴ이 이 단원 최대의 함정이에요. 물결이 호수 끝까지 내달려도 물 자체는 제자리에서 오르내릴 뿐이에요. 물이 물결을 따라 계속 밀려간다면 호수의 물이 한쪽으로 쏠려 버리겠죠. 물 위에 뜬 나뭇잎이 물결이 지나가도 제자리에서 출렁이기만 하는 것이 그 증거예요. '파동은 이동, 매질은 제자리'를 한 몸으로 기억하세요.",
    core: "파동이 나르는 건 에너지. 매질은 언제나 제자리 진동!",
  },
  // [e324 · L7 · num d2 · xLWG 거리축 cos] 파장 판독. 검산: 마루 x=0·3·6(눈금 위) → 파장 3m · 진폭 10cm(둘 다 눈금 위).
  {
    id: "g2u3e324",
    lessonId: "g2u3l7",
    type: "num",
    diff: 2,
    prompt: "그래프는 어느 물결파의 어느 순간 모습을 나타낸 거예요. 이 파동의 <b>파장</b>은 몇 m일까요?",
    figure: xLWG({ xMax: 6, xStep: 1, yMax: 20, yStep: 10, amp: 10, wavelength: 3, xLabel: "거리(m)", yLabel: "높이(cm)", phase: "cos" }),
    answer: "3",
    unitLabel: "m",
    explain:
      "<span class='xh'>정답 풀이</span>파장은 <b>마루에서 이웃한 마루까지</b>의 거리예요. 그래프에서 마루가 0m, 3m, 6m 지점에 있으니<br>① 이웃한 두 마루 사이 = 3 − 0 = <b>3m</b><br>② 골에서 이웃한 골까지 재도 똑같이 3m가 나와요. 같은 상태인 두 지점 사이면 어디를 재도 파장이거든요.<span class='xh'>이렇게 생각했다면</span>6m를 답했다면 마루 하나를 건너뛰어 두 파장을 잰 거예요. 반드시 <b>이웃한</b> 마루까지만 재야 해요. 10이라는 숫자를 골랐다면 세로축을 읽은 것인데, 세로축의 10cm는 진동 중심에서 마루까지의 거리인 진폭이에요. 가로축과 세로축은 단위부터 다르죠. 파장은 가로에서, 진폭은 세로에서 읽는다는 것을 축 이름과 함께 확인하는 습관을 들여요.",
    core: "파장 = 이웃한 마루 사이의 가로 거리. 축 이름부터 확인!",
  },
  // [e327 · L7 · num d3 · xLWG 시간축 cos] 주기 판독 → 진동수 환산 2단. 검산: 마루 간격 0.4s → 1/0.4 = 2.5Hz(dec).
  {
    id: "g2u3e327",
    lessonId: "g2u3l7",
    type: "num",
    diff: 3,
    numKind: "dec",
    prompt:
      "그래프는 물결파가 지나가는 동안 물 위에 뜬 나뭇잎 한 개의 높이를 시간에 따라 기록한 거예요. 이 파동의 <b>진동수</b>는 몇 Hz일까요?",
    figure: xLWG({ xMax: 2, xStep: 0.4, yMax: 10, yStep: 5, amp: 5, wavelength: 0.4, xLabel: "시간(초)", yLabel: "높이(cm)", phase: "cos" }),
    answer: "2.5",
    unitLabel: "Hz",
    explain:
      "<span class='xh'>정답 풀이</span>가로축이 시간인 그래프에서 마루와 이웃 마루 사이의 간격은 <b>주기</b>(한 번 진동에 걸리는 시간)예요.<br>① 그래프에서 마루 간격 = 0.4초 = 주기<br>② 진동수 = 1 ÷ 주기 = 1 ÷ 0.4 = <b>2.5Hz</b><br>1초에 2.5번 진동한다는 뜻이에요. 실제로 그래프의 0초부터 2초까지 진동이 5번 들어 있죠. 5번 ÷ 2초 = 2.5Hz로 검산도 맞아요.<span class='xh'>이렇게 생각했다면</span>0.4를 답했다면 주기를 구하고 멈춘 거예요. 문제는 진동수를 물었으니 역수를 한 번 더 취해야 해요. 4를 답했다면 1 ÷ 0.4를 어림으로 계산하다 실수한 것이니, 1 ÷ 0.4 = 10 ÷ 4 = 2.5처럼 분모 분자에 10을 곱해 정수로 바꿔 계산하면 안전해요.",
    core: "시간축 그래프의 마루 간격 = 주기. 진동수 = 1 ÷ 주기!",
  },
  // [e328 · L7 · mcq d1 · xLSW amp] 흔든 폭 → 진폭. 검산: 같은 빠르기 = 진동수·주기·파장 불변 · 폭만 진폭으로.
  {
    id: "g2u3e328",
    lessonId: "g2u3l7",
    type: "mcq",
    diff: 1,
    prompt:
      "그림 (가), (나)는 긴 용수철의 한쪽 끝을 <b>같은 빠르기</b>로, 흔드는 폭만 다르게 하여 파동을 만든 모습이에요. (가)보다 폭을 크게 흔든 (나)에서 더 커지는 것은 무엇일까요?",
    figure: xLSW("amp"),
    options: ["진폭", "파장", "진동수", "주기", "파동이 전달되는 빠르기"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>손을 흔드는 <b>폭</b>은 매질이 좌우로 벗어나는 최대 거리를 정해요. 그것이 바로 <b>진폭</b>이죠. 그림에서도 (나)의 파형이 (가)보다 옆으로 크게 부풀어 있어요. 흔드는 빠르기는 같으니 1초에 만들어지는 진동 횟수, 곧 진동수는 그대로고요.<span class='xh'>오답 하나씩 격파</span>진동수와 주기는 흔드는 <b>빠르기</b>가 정하는 값이라 이 실험에서는 변하지 않아요. 파장도 마찬가지예요. 같은 용수철에서 같은 빠르기로 흔들면 이웃한 마루 사이 간격은 그대로거든요. 파동이 전달되는 빠르기는 매질(용수철)의 성질이 정하는 값이라 손짓으로는 바뀌지 않아요. '세게, 크게'는 진폭의 언어이고 '빠르게, 자주'는 진동수의 언어라는 것을 구분하는 문제였어요.",
    core: "흔든 폭 = 진폭, 흔든 빠르기 = 진동수. 서로 독립!",
  },
  // [e331 · L7 · mcq d2 [판] · xLWG dim a] 마루~골 = 진폭 2배. 검산: a = 2 x amp → 진폭 = a/2.
  {
    id: "g2u3e331",
    lessonId: "g2u3l7",
    type: "mcq",
    diff: 2,
    prompt: "그래프의 a는 파동의 마루 꼭대기에서 골 바닥까지의 세로 거리를 나타낸 거예요. 이 파동의 진폭과 a의 관계로 옳은 것은?",
    figure: xLWG({ xMax: 8, xStep: 2, yMax: 20, yStep: 10, amp: 10, wavelength: 4, xLabel: "거리(m)", yLabel: "높이(cm)", phase: "sin", dim: "a" }),
    options: [
      "진폭은 a의 절반이다",
      "진폭은 a와 같다",
      "진폭은 a의 2배이다",
      "진폭은 a에서 파장을 뺀 값이다",
      "a만으로는 진폭을 알 수 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>진폭은 <b>진동 중심에서</b> 마루(또는 골)까지의 거리예요. 기준점이 마루도 골도 아닌 진동 중심이라는 것이 핵심이죠. a는 마루에서 골까지의 거리라 진동 중심을 기준으로 위로 한 번, 아래로 한 번을 합친 값이에요. 그러니 진폭은 <b>a의 절반</b>이에요.<span class='xh'>오답 하나씩 격파</span>'진폭 = a'가 이 단원 최다 출제 함정이에요. 마루~골 거리를 진폭이라고 부르고 싶어지지만, 정의의 출발점은 언제나 진동 중심이에요. 진폭이 a의 2배라면 파동이 그래프 밖으로 나가 버리겠죠. 파장은 가로 방향 거리라 세로 거리 a와는 계산으로 섞일 수 없는 값이고, a를 알면 반으로 나누기만 하면 되니 '알 수 없다'도 틀렸어요.",
    core: "마루~골 거리는 진폭의 2배. 진폭의 기준은 진동 중심!",
  },
  // [e335 · L7 · multi d1 · 무 W②] 파동인 것 고르기. 검산: 정답 3개(물결·소리·지진 흔들림) · 흐름/구름은 물질 이동.
  {
    id: "g2u3e335",
    lessonId: "g2u3l7",
    type: "multi",
    diff: 1,
    prompt: "다음 중 <b>파동</b>에 해당하는 것을 모두 고르세요.",
    options: [
      "잔잔한 수면 위로 퍼져 나가는 물결",
      "북소리가 공기를 타고 교실 끝까지 전달되는 것",
      "지진이 났을 때 땅의 흔들림이 먼 곳까지 전해지는 것",
      "강물이 상류에서 하류로 흘러 내려가는 것",
      "축구공이 잔디 위를 굴러가는 것",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>파동인지 가리는 기준은 하나예요. <b>물질은 제자리에 있고 진동만 퍼져 나가는가</b>. 물결은 물이 제자리에서 오르내리며 진동을 전달하고, 소리는 공기가 제자리에서 떨리며 진동을 전달하고, 지진의 흔들림은 땅이 제자리에서 떨리며 멀리까지 전해져요. 셋 다 매질은 남고 진동(에너지)만 이동하는 파동이에요.<span class='xh'>오답 하나씩 격파</span>강물이 흘러가는 것은 물이라는 <b>물질 자체가 이동</b>하는 현상이라 파동이 아니에요. 물결과 강물의 차이가 바로 이 단원의 핵심이죠. 굴러가는 축구공도 공이라는 물체가 통째로 자리를 옮기는 운동이에요. '무엇이 이동하는가'를 물어서 물질이면 이동, 진동이면 파동으로 가르면 돼요.",
    core: "판별 기준: 물질이 가면 이동, 진동만 가면 파동!",
  },
  // [e342 · L8 · mcq d1 · xLW4 A] 가장 큰 소리(미13 계보). 검산: amp (가)14 (나)18 (다)26 (라)10 → 최대 (다) · 촘촘 함정 (나)cyc8.
  {
    id: "g2u3e342",
    lessonId: "g2u3l8",
    type: "mcq",
    diff: 1,
    prompt: "(가)~(라)는 서로 다른 네 소리를 같은 시간 동안 오실로스코프로 기록한 파형이에요. <b>가장 큰 소리</b>의 파형은 어느 것일까요?",
    figure: xLW4({
      cells: [
        { label: "(가)", amp: 14, cyc: 3 },
        { label: "(나)", amp: 18, cyc: 8 },
        { label: "(다)", amp: 26, cyc: 4 },
        { label: "(라)", amp: 10, cyc: 6 },
      ],
    }),
    options: ["(가)", "(나)", "(다)", "(라)", "네 소리 모두 같다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>소리의 크기(세기)는 파형의 <b>키(위아래 폭)</b>, 곧 진폭이 정해요. 네 파형 가운데 위아래로 가장 크게 부푼 것은 (다)예요. 그러니 가장 큰 소리는 <b>(다)</b>죠. 촘촘한 정도는 크기와 상관없어요.<span class='xh'>오답 하나씩 격파</span>(나)를 골랐다면 파형이 가장 <b>촘촘한</b> 것을 고른 거예요. 촘촘함은 진동수, 곧 소리의 높낮이를 말해 줄 뿐이죠. (나)는 가장 높은 소리이지 가장 큰 소리가 아니에요. (가)와 (라)는 (다)보다 진폭이 작으니 더 작은 소리고요. 파형 문제는 언제나 질문부터 확인하세요. '크다/작다'가 나오면 키를, '높다/낮다'가 나오면 촘촘함을 읽어야 해요.",
    core: "큰 소리 = 키 큰 파형(진폭). 촘촘함은 높낮이의 몫!",
  },
  // [e346 · L8 · mcq d2 · xLCU] 물컵 두드리기(천11 계보 · 직관 반대 조건 문두 명시). 검산: 물 많음 = 무거워 느리게 떨림 = 낮은 음 → (다).
  {
    id: "g2u3e346",
    lessonId: "g2u3l8",
    type: "mcq",
    diff: 2,
    prompt:
      "같은 유리컵 (가)~(다)에 물을 서로 다른 높이로 담고, 숟가락으로 컵의 옆면을 같은 세기로 두드려 소리를 냈어요. 물이 많이 담긴 컵일수록 컵이 무거워져 떨림이 느려진다고 할 때, <b>가장 낮은 소리</b>가 나는 컵은 어느 것일까요?",
    figure: xLCU(),
    options: ["(가)", "(나)", "(다)", "세 컵 모두 같은 높이의 소리가 난다", "물의 양과 소리의 높낮이는 관계가 없다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>소리의 높낮이는 물체가 1초에 몇 번 떨리는가, 곧 <b>진동수</b>가 정해요. 컵을 두드리면 컵(과 담긴 물)이 함께 떨리는데, 물이 많을수록 떨려야 할 것이 무거워져 <b>느리게</b> 떨려요. 느린 떨림 = 작은 진동수 = 낮은 소리. 물이 가장 많은 <b>(다)</b>가 가장 낮은 소리를 내죠.<span class='xh'>오답 하나씩 격파</span>(가)를 골랐다면 물이 적을수록 낮다고 뒤집어 생각한 거예요. 물이 적으면 가벼워서 빠르게 떨리니 오히려 가장 높은 소리가 나요. 관악기처럼 '물이 많으면 공기 기둥이 짧아져 높은 소리'를 떠올렸다면, 이 실험은 컵을 <b>두드려서 컵 자체를 떨게 하는</b> 실험이라는 조건을 다시 보세요. 같은 세기로 두드리니 크기는 비슷하고, 달라지는 것은 높낮이랍니다.",
    core: "무거울수록 느린 떨림 = 낮은 소리. 물 많은 컵이 저음!",
  },
  // [e347 · L8 · bogi d2 · 사진 guitar] 줄 굵기와 높낮이. 검산: ㄱ 거짓(굵으면 낮음) · ㄴ ㄷ 참 → "ㄴ, ㄷ" 4칸.
  {
    id: "g2u3e347",
    lessonId: "g2u3l8",
    type: "mcq",
    diff: 2,
    prompt: "사진은 기타의 굵은 줄과 가는 줄이에요. 줄의 길이와 팽팽한 정도가 같다고 할 때, 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: ximg("guitar-strings.webp", "기타 울림구멍 위로 코일이 감긴 굵은 줄들과 매끈한 가는 줄들이 나란히 보이는 근접 사진"),
    bogi: [
      "같은 세기로 튕기면 굵은 줄에서 더 높은 소리가 난다",
      "같은 세기로 튕기면 가는 줄이 굵은 줄보다 빠르게 떨린다",
      "줄이 떨리는 동안에만 소리가 난다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>소리의 근원은 물체의 <b>떨림</b>이에요. 기타 줄이 떨리는 동안에만 소리가 나고, 손으로 줄을 잡아 떨림을 멈추면 소리도 뚝 끊기죠(ㄷ 맞아요). 그리고 길이와 팽팽함이 같다면 <b>가는 줄이 가벼워서 더 빠르게</b> 떨려요(ㄴ 맞아요). 빠른 떨림은 큰 진동수, 곧 높은 소리를 만들고요.<span class='xh'>오답 하나씩 격파</span>ㄱ이 함정이에요. 굵은 줄은 무거워서 <b>느리게</b> 떨리고, 그래서 <b>낮은</b> 소리를 내요. 기타의 저음 줄이 굵고 고음 줄이 가는 것도 그 때문이죠. 참고로 튕기는 세기는 소리의 크기(진폭)를 정할 뿐, 높낮이와는 독립이에요. 그래서 '같은 세기'라는 조건이 붙어 있어도 높낮이 비교에는 영향이 없답니다.",
    core: "가는 줄 = 빠른 떨림 = 높은 소리. 소리는 떨림이 있는 동안만!",
  },
  // [e349 · L8 · mcq d2 · xLFC] 순서도 번역(천09 계보). 검산: 키 다름 = 세기 · 키 같고 촘촘함 다름 = 높낮이.
  {
    id: "g2u3e349",
    lessonId: "g2u3l8",
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 두 소리의 파형을 비교해 무엇이 다른지 판정하는 순서도예요. ㉠과 ㉡에 들어갈 판정을 옳게 짝 지은 것은?",
    figure: xLFC(),
    options: [
      "㉠ 세기가 다르다 · ㉡ 높낮이가 다르다",
      "㉠ 높낮이가 다르다 · ㉡ 세기가 다르다",
      "㉠ 음색이 다르다 · ㉡ 세기가 다르다",
      "㉠ 세기가 다르다 · ㉡ 음색이 다르다",
      "㉠ 높낮이가 다르다 · ㉡ 음색이 다르다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>순서도의 첫 갈림길은 <b>파형의 키</b>를 비교해요. 키(진폭)가 다르면 소리의 <b>세기</b>가 다른 것이니 ㉠은 '세기가 다르다'예요. 키가 같아서 다음 갈림길로 내려가면 이번엔 <b>촘촘한 정도</b>(진동수)를 비교하죠. 촘촘함이 다르면 <b>높낮이</b>가 다른 것이니 ㉡은 '높낮이가 다르다'고요.<span class='xh'>오답 하나씩 격파</span>㉠과 ㉡을 서로 바꾼 짝은 진폭과 진동수의 역할을 뒤집은 함정이에요. 키는 세기, 촘촘함은 높낮이라는 대응을 흔들리지 않게 붙잡아야 해요. 음색은 키도 촘촘함도 같은데 파형의 <b>생김새</b>가 다를 때 나오는 판정이라, 두 갈림길을 모두 '예'로 통과한 뒤 마지막 칸에서 비교하는 항목이에요. ㉠이나 ㉡ 자리에 들어가면 순서도의 흐름과 맞지 않죠.",
    core: "파형 읽기 순서: 키(세기) → 촘촘함(높낮이) → 생김새(음색)!",
  },
  // [e350 · L8 · num d2 · xLWG 오실로 cos] 주기 판독 → 진동수(정의 옮겨적기 아님 · 판독 동반). 검산: 마루 간격 0.04s → 1/0.04 = 25Hz.
  {
    id: "g2u3e350",
    lessonId: "g2u3l8",
    type: "num",
    diff: 2,
    prompt:
      "그래프는 큰북을 한 번 울렸을 때의 소리를 오실로스코프로 기록한 파형이에요(가로축은 시간). 이웃한 마루 사이의 간격을 읽어 이 소리의 <b>진동수</b>를 구하면 몇 Hz일까요?",
    figure: xLWG({ xMax: 0.2, xStep: 0.04, yMax: 16, yStep: 8, amp: 8, wavelength: 0.04, xLabel: "시간(초)", yLabel: "진동 폭", phase: "cos" }),
    answer: "25",
    unitLabel: "Hz",
    explain:
      "<span class='xh'>정답 풀이</span>가로축이 시간인 파형에서 이웃한 마루 사이의 간격은 <b>주기</b>예요.<br>① 그래프의 마루 간격 = 0.04초 = 주기<br>② 진동수 = 1 ÷ 주기 = 1 ÷ 0.04 = 100 ÷ 4 = <b>25Hz</b><br>1초에 25번 떨리는, 북다운 낮은 소리라는 뜻이에요.<span class='xh'>이렇게 생각했다면</span>0.04를 그대로 답했다면 주기에서 멈춘 거예요. 진동수는 주기의 역수라 한 걸음 더 가야 해요. 1 ÷ 0.04 계산이 부담스러우면 분모와 분자에 100을 곱해 100 ÷ 4로 바꾸는 것이 실수를 막는 지름길이에요. 4Hz처럼 어림한 값을 답하지 않도록, 소수 나눗셈은 꼭 정수 나눗셈으로 고쳐 계산하세요.",
    core: "시간축 마루 간격 = 주기 → 진동수 = 1 ÷ 주기!",
  },
];
