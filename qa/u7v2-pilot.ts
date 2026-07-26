// u7 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 3호) · 정본 설계표 qa/u7-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정·index.ts 미등록. 확대 승인분과 함께 build-u7v2-lessons.mjs가
// u7l1~l6.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 11종(SG·SP·SK·SS2·ZE·EO·WS·MO·PC·EA·EP)과 PD 순서도는 파일럿 로컬 함수(m1u5 v2 관행) ·
// 이식 때 ui/examFigures.ts "u7 v2" 섹션으로 승격한다. 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다
// (PC·WS는 파일럿 문항 미사용 · PILOT_PREVIEW 부록 카드로 데뷔 눈검수).
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커 ✓ · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) · num answer 문자열+unitLabel.
// 각 문항 주석 = [슬롯] 검산 노트(밝은 반구=태양 쪽·위치↔위상·회전 반시계·식 진행 방향·그래프 값).
// 다크 그림 문법: 스트로크 #2C4066/#3D5378 · 텍스트 #DCE8FF/#AFC3E3 · 별 #EDE2BE · 태양 #FFE9A8→#F2A93B.
import type { ExamItem } from "../src/content/exams/types";
import { planetOrderFig, moonPhase8Fig, svgTable } from "../src/ui/examFigures";
import { planetGroupsFig } from "../src/ui/spaceFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/u7/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
const pimg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}photos/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** 조건 자료 상자 · 미래엔 2 계보(텍스트 조건 (가)(나)(다)). 시각자료로 집계한다. */
export const dbox = (rows: [string, string][]): string =>
  `<div style="border:1.5px solid #D9DFE6;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:7px">
    ${rows.map(([tag, body]) => `<div style="display:flex;gap:8px;font-size:13.2px;line-height:1.55;word-break:keep-all"><b style="flex:none;color:#4E5968">${tag}</b><span>${body}</span></div>`).join("")}
  </div>`;

/* ══════════ 신작 헬퍼(이식 때 examFigures "u7 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** SG 흑점 수 연도 그래프(다크·파라미터형) · 실제 태양 사이클 연도만 사용(극대 1957·1968·1979 ·
 *  극소 1954·1964·1976·1986). 레슨 sunspotGraphFig 창(1990~2010·극소 1996·극대 2000)과 분리.
 *  극대·극소 연도는 곡선 위 라벨로 직접 표기(눈금 사이 판독 오차 차단 · 정답 값은 라벨·눈금 위 원칙).
 *  가이드 점선 없음. peaks·dips는 [연도, 라벨 표시 여부]. */
export function sunspotCycleFig(o: { y0: number; y1: number; peaks: number[]; dips: number[]; labelPeaks?: boolean }): string {
  const L = 46;
  const R = 330;
  const TOP = 34;
  const BASE = 168;
  const HI = 58;
  const x = (yr: number): number => L + ((yr - o.y0) / (o.y1 - o.y0)) * (R - L);
  // 곡선: 극소(BASE 근처)와 극대(HI)를 번갈아 지나는 부드러운 산봉우리 열.
  const pts: [number, number][] = [];
  const knots = [...o.dips.map((y) => [y, BASE - 8] as [number, number]), ...o.peaks.map((y) => [y, HI] as [number, number])].sort((a, b) => a[0] - b[0]);
  if (knots.length && knots[0][0] > o.y0) pts.push([o.y0, BASE - 22]);
  pts.push(...knots);
  if (knots.length && knots[knots.length - 1][0] < o.y1) pts.push([o.y1, BASE - 30]);
  let d = `M${x(pts[0][0]).toFixed(1)} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [py, pv] = pts[i - 1];
    const [cy, cv] = pts[i];
    const mx = (x(py) + x(cy)) / 2;
    d += ` C${mx.toFixed(1)} ${pv}, ${mx.toFixed(1)} ${cv}, ${x(cy).toFixed(1)} ${cv}`;
  }
  let ticks = "";
  for (let yr = Math.ceil(o.y0 / 5) * 5; yr <= o.y1; yr += 5) {
    ticks += `<path d="M${x(yr).toFixed(1)} ${BASE}v5" stroke="#3D5378" stroke-width="1.6"/>
      <text x="${x(yr).toFixed(1)}" y="${BASE + 20}" text-anchor="middle" font-size="10.5" fill="#AFC3E3">${yr}</text>`;
  }
  const peakLabels = (o.labelPeaks ?? true)
    ? o.peaks.map((yr) => `<circle cx="${x(yr).toFixed(1)}" cy="${HI}" r="3.4" fill="#FFD25E"/>
        <text x="${x(yr).toFixed(1)}" y="${HI - 10}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#FFE9A8">${yr}년</text>`).join("")
    : "";
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="여러 해 동안 관측한 흑점 수의 변화 그래프. 가장 많았던 해가 곡선 위에 표시되어 있다">
    <path d="M${L} ${TOP - 10}V${BASE}H${R + 6}" stroke="#3D5378" stroke-width="2"/>
    <text x="${L - 8}" y="${TOP + 2}" text-anchor="end" font-size="10.5" fill="#AFC3E3">많음</text>
    <text x="${L - 8}" y="${BASE}" text-anchor="end" font-size="10.5" fill="#AFC3E3">적음</text>
    <text x="18" y="${(TOP + BASE) / 2}" text-anchor="middle" font-size="10.5" fill="#8FA6CE" transform="rotate(-90 18 ${(TOP + BASE) / 2})">흑점 수</text>
    ${ticks}
    <text x="${R}" y="${BASE + 34}" text-anchor="end" font-size="10.5" fill="#8FA6CE">연도(년)</text>
    <path d="${d}" stroke="#FFD25E" stroke-width="2.4"/>
    ${peakLabels}
  </svg>`;
}

/** SP 태양 실사 가림판(다크) · 실제 사진 위 기호 콜아웃만(이름 라벨 없음 · sunAnatomyFig의 시험판).
 *  normal: 백색광 전면(㉠ 둥근 표면 전체 · ㉡ 검은 점). eclipse: 개기일식(㉢ 밖으로 뻗은 진주빛).
 *  사진 좌표는 눈검수로 확정(흑점 위치에 ㉡이 실제로 닿는지 갤러리에서 판정). */
export function sunLabelFig(kind: "normal" | "eclipse"): string {
  if (kind === "normal") {
    return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="망원경으로 찍은 태양 전체 사진. 둥근 면 전체를 가리키는 기호와 표면의 검은 점 하나를 가리키는 기호가 붙어 있다">
      <defs><clipPath id="u7sp-n"><circle cx="172" cy="118" r="86"/></clipPath></defs>
      <g clip-path="url(#u7sp-n)"><image href="${IMG_BASE}photos/sun_whitelight.jpg" x="80" y="26" width="184" height="184" preserveAspectRatio="xMidYMid slice"/></g>
      <circle cx="172" cy="118" r="86" stroke="rgba(224,150,40,.65)" stroke-width="1.6"/>
      <path d="M258 60L218 82" stroke="#8FB3E8" stroke-width="1.8"/>
      <circle cx="286" cy="52" r="15" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="286" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">㉠</text>
      <text x="286" y="82" text-anchor="middle" font-size="9.5" fill="#AFC3E3">둥근 면 전체</text>
      <path d="M84 178L163 118" stroke="#8FB3E8" stroke-width="1.8"/>
      <circle cx="174" cy="110" r="13" stroke="#8FB3E8" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/>
      <circle cx="62" cy="186" r="15" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="62" y="191" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">㉡</text>
      <text x="62" y="214" text-anchor="middle" font-size="9.5" fill="#AFC3E3">검은 점</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="검게 가려진 둥근 천체 둘레로 밝은 빛이 멀리 뻗어 있는 사진. 그 빛을 가리키는 기호가 붙어 있다">
    <defs><clipPath id="u7sp-e"><circle cx="172" cy="118" r="92"/></clipPath></defs>
    <g clip-path="url(#u7sp-e)"><image href="${IMG_BASE}photos/eclipse_corona.jpg" x="66" y="12" width="212" height="212" preserveAspectRatio="xMidYMid slice"/></g>
    <path d="M268 66L232 96" stroke="#8FB3E8" stroke-width="1.8"/>
    <circle cx="292" cy="56" r="15" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
    <text x="292" y="61" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">㉢</text>
    <text x="292" y="86" text-anchor="middle" font-size="9.5" fill="#AFC3E3">밖으로 뻗은 빛</text>
  </svg>`;
}

/** SK 방향별 일주 궤적(다크·파라미터형) · 교과서 표준 구도(우리나라 기준):
 *  동쪽 하늘 = 오른쪽 위로 비스듬히 떠오름(↗) · 서쪽 하늘 = 오른쪽 아래로 비스듬히 짐(↘) ·
 *  남쪽 하늘 = 왼쪽(동)에서 오른쪽(서)으로 수평(→). 화살촉은 진행 방향(레슨 northSkyFig 검산 계보).
 *  choices 모드 = "북쪽 하늘을 오래 찍으면?" ①~⑤ 미니 컷(정답 ② 반시계 동심원 · shuffle:false 전용). */
export function skyTrailFig(o: { dir: "e" | "w" | "s"; choices?: boolean; hideLabel?: boolean }): string {
  // hideLabel: "어느 방향 하늘인가"를 묻는 문항용 · 방향 필을 "관측 기록"으로 중립화(검산 B-3 유출 차단).
  if (o.choices) {
    const mini = (cx: number, kind: string, num: string): string => {
      let art = "";
      if (kind === "ccw") art = `<circle cx="${cx}" cy="64" r="9" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="10 6"/><circle cx="${cx}" cy="64" r="17" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="18 9"/><path d="M${cx + 17} 64A17 17 0 0 0 ${cx} 47" stroke="#FFD25E" stroke-width="1.8"/><path d="M${cx - 2} 44l-5 4 6 3z" fill="#FFD25E"/><circle cx="${cx}" cy="64" r="1.8" fill="#FFF0C8"/>`;
      else if (kind === "cw") art = `<circle cx="${cx}" cy="64" r="9" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="10 6"/><circle cx="${cx}" cy="64" r="17" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="18 9"/><path d="M${cx + 17} 64A17 17 0 0 1 ${cx} 81" stroke="#FFD25E" stroke-width="1.8"/><path d="M${cx - 2} 84l-5-4 6-3z" fill="#FFD25E"/><circle cx="${cx}" cy="64" r="1.8" fill="#FFF0C8"/>`;
      else if (kind === "flat") art = `<path d="M${cx - 20} 56h40M${cx - 20} 66h40M${cx - 20} 76h40" stroke="#BED6FF" stroke-width="1.6"/><path d="M${cx + 22} 66l-7-3.5v7z" fill="#FFD25E" transform="rotate(180 ${cx + 18} 66)"/>`;
      else if (kind === "rise") art = `<path d="M${cx - 18} 80l28-24M${cx - 22} 68l28-24M${cx - 8} 86l28-24" stroke="#BED6FF" stroke-width="1.6"/><path d="M${cx + 12} 54l1-8-8 2z" fill="#FFD25E"/>`;
      else art = `<path d="M${cx - 22} 46q22 18 44 0M${cx - 22} 62q22 18 44 0M${cx - 22} 78q22 18 44 0" stroke="#BED6FF" stroke-width="1.6"/>`;
      return `${art}<text x="${cx}" y="108" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">${num}</text>`;
    };
    return `<svg viewBox="0 0 344 128" ${NS} fill="none" role="img" aria-label="북쪽 하늘을 오랫동안 찍었을 때 나올 수 있는 별 궤적 다섯 가지 후보 그림">
      <rect x="4" y="8" width="336" height="112" rx="14" fill="#0E1830"/>
      ${mini(40, "rise", "①")}${mini(106, "ccw", "②")}${mini(172, "flat", "③")}${mini(238, "cw", "④")}${mini(304, "wave", "⑤")}
    </svg>`;
  }
  const label = o.hideLabel ? "관측 기록" : o.dir === "e" ? "동쪽 하늘" : o.dir === "w" ? "서쪽 하늘" : "남쪽 하늘";
  let sd = o.dir === "e" ? 7 : o.dir === "w" ? 11 : 17;
  const rnd = (): number => {
    sd = (sd * 48271) % 2147483647;
    return sd / 2147483647;
  };
  let lines = "";
  for (let i = 0; i < 13; i++) {
    const x0 = 24 + rnd() * 210;
    const y0 = 22 + rnd() * 96;
    const len = 52 + rnd() * 40;
    const op = (0.22 + rnd() * 0.3).toFixed(2);
    if (o.dir === "s") {
      lines += `<path d="M${x0.toFixed(0)} ${y0.toFixed(0)}h${len.toFixed(0)}" stroke="rgba(190,214,255,${op})" stroke-width="1.6"/><circle cx="${(x0 + len).toFixed(0)}" cy="${y0.toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
    } else if (o.dir === "e") {
      const dy = len * 0.62;
      lines += `<path d="M${x0.toFixed(0)} ${(y0 + dy).toFixed(0)}l${len.toFixed(0)} ${(-dy).toFixed(0)}" stroke="rgba(190,214,255,${op})" stroke-width="1.6"/><circle cx="${(x0 + len).toFixed(0)}" cy="${y0.toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
    } else {
      const dy = len * 0.62;
      lines += `<path d="M${x0.toFixed(0)} ${y0.toFixed(0)}l${len.toFixed(0)} ${dy.toFixed(0)}" stroke="rgba(190,214,255,${op})" stroke-width="1.6"/><circle cx="${(x0 + len).toFixed(0)}" cy="${(y0 + dy).toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
    }
  }
  const arrow =
    o.dir === "s"
      ? `<path d="M118 128h84" stroke="#FFD25E" stroke-width="2.4"/><path d="M211 128l-9-4.5v9z" fill="#FFD25E"/>`
      : o.dir === "e"
        ? `<path d="M128 150l64-40" stroke="#FFD25E" stroke-width="2.4"/><path d="M196 106l-10-1 4 9z" fill="#FFD25E"/>`
        : `<path d="M128 110l64 40" stroke="#FFD25E" stroke-width="2.4"/><path d="M196 154l-4-9-6 8z" fill="#FFD25E"/>`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="한 방향 하늘을 오랫동안 찍은 별 궤적 그림. 궤적이 기울어진 모양과 노란 화살표가 별이 움직인 방향을 나타내고, 아래에 지평선이 있다">
    <rect x="4" y="6" width="336" height="172" rx="14" fill="#0E1830"/>
    ${lines}
    ${arrow}
    <path d="M10 168q80-22 160-10t164 2v8a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z" fill="#04080F" stroke="#3D5378" stroke-width="1.4"/>
    <text x="30" y="174" font-size="9.5" fill="#7E93B8">지평선</text>
    <rect x="130" y="184" width="84" height="20" rx="10" fill="#16233F" stroke="#2C4066" stroke-width="1"/>
    <text x="172" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#BFD4F2">${label}</text>
  </svg>`;
}

/** SS2 북쪽 하늘 위치 후보(다크) · 북극성 중심 원 궤도 + 30도 간격 눈금 틱 + 별 A + 후보 ㉠~㉤.
 *  offsets = A로부터의 각도(반시계 +). 후보 라벨은 offsets 순서대로 ㉠~㉤.
 *  [검산] 시계 반대 = 수학 각 증가 방향. 정답 후보가 ㉠(첫 보기)이 되지 않게 배치할 것. */
export function starSpinChoiceFig(o: { fromDeg: number; offsets: number[] }): string {
  const cx = 172;
  const cy = 116;
  const R = 80;
  const pos = (d: number, r: number): [number, number] => [cx + Math.cos((d * Math.PI) / 180) * r, cy - Math.sin((d * Math.PI) / 180) * r];
  let ticks = "";
  for (let d = 0; d < 360; d += 30) {
    const [tx1, ty1] = pos(d, R - 4);
    const [tx2, ty2] = pos(d, R + 4);
    ticks += `<path d="M${tx1.toFixed(1)} ${ty1.toFixed(1)}L${tx2.toFixed(1)} ${ty2.toFixed(1)}" stroke="#3D5378" stroke-width="1.6"/>`;
  }
  const [ax, ay] = pos(o.fromDeg, R);
  const G = ["㉠", "㉡", "㉢", "㉣", "㉤"];
  const cands = o.offsets
    .map((off, i) => {
      const [px, py] = pos(o.fromDeg + off, R);
      const [lx, ly] = pos(o.fromDeg + off, R + 22);
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.6" stroke="#8FB3E8" stroke-width="1.6" stroke-dasharray="3 3"/>
        <text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="800" fill="#DCE8FF">${G[i]}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 232" ${NS} fill="none" role="img" aria-label="북쪽 하늘 그림. 가운데 북극성이 있고 원 궤도에 30도 간격 눈금이 있다. 별 A와 다섯 개의 점선 원 후보 자리가 표시되어 있다">
    <circle cx="${cx}" cy="${cy}" r="${R}" stroke="#2C4066" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${ticks}
    <circle cx="${cx}" cy="${cy}" r="4.6" fill="#FFE9A8"/>
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="10.5" fill="#AFC3E3">북극성</text>
    <text x="${cx + 42}" y="${cy - 4}" font-size="9.5" fill="#7E93B8">눈금 간격 30°</text>
    <circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="5.6" fill="#EDE2BE"/>
    <text x="${(ax + 15).toFixed(1)}" y="${(ay + 4).toFixed(1)}" font-size="12.5" font-weight="700" fill="#DCE8FF">A</text>
    ${cands}
    <path d="M24 222h296" stroke="#3D5378" stroke-width="2"/>
    <text x="322" y="216" text-anchor="end" font-size="10" fill="#7E93B8">지평선</text>
  </svg>`;
}

/** ZE 황도 12궁(다크·파라미터형) · 레슨 zodiacQuizFig(㉠=5월·양↔천칭)와 별개 시험판: 지구 위치가
 *  파라미터. earthDeg = 지구가 놓인 별자리 쪽 각도(그 별자리 "앞"). 별자리 배열은 레슨과 동일 각도표.
 *  [검산] 태양 쪽(못 보는) 별자리 = earthDeg+180 · 한밤 남쪽 별자리 = earthDeg. 두 점선(태양 방향·
 *  반대 방향)이 판독 장치. 전 별자리 같은 스타일(강조 금지 · 정답 유추 방지). */
export function zodiacExamFig(o: { earthDeg: number }): string {
  const names: [string, number][] = [
    ["게", 0], ["쌍둥이", 30], ["황소", 60], ["양", 90], ["물고기", 120], ["물병", 150],
    ["염소", 180], ["궁수", 210], ["전갈", 240], ["천칭", 270], ["처녀", 300], ["사자", 330],
  ];
  const cx = 172;
  const cy = 108;
  const R = 84;
  let ring = "";
  for (const [n, deg] of names) {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R * 0.82;
    ring += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#9FB6DC"/>
      <text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" fill="#9FB6DC" font-size="9.5" text-anchor="middle">${n}</text>`;
  }
  const ea = (o.earthDeg * Math.PI) / 180;
  const eR = R - 26;
  const ex = cx + Math.cos(ea) * eR;
  const ey = cy + Math.sin(ea) * eR * 0.82;
  const ox = cx + Math.cos(ea) * (R - 8);
  const oy = cy + Math.sin(ea) * (R - 8) * 0.82;
  const sx = cx - Math.cos(ea) * (R - 8);
  const sy = cy - Math.sin(ea) * (R - 8) * 0.82;
  return `<svg viewBox="0 0 344 224" ${NS} fill="none" role="img" aria-label="가운데 태양을 두고 열두 별자리가 빙 둘러 있는 그림. 궤도 위의 지구에서 태양 방향과 그 반대 방향으로 점선이 그어져 있다">
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.82}" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="3 4"/>
    ${ring}
    <circle cx="${cx}" cy="${cy}" r="10" fill="url(#u7ze-sun)"/>
    <text x="${cx + 20}" y="${cy + 4}" fill="#FFC85E" font-size="9.5">태양</text>
    <path d="M${ex.toFixed(1)} ${ey.toFixed(1)}L${sx.toFixed(1)} ${sy.toFixed(1)}" stroke="rgba(255,170,80,.55)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${ex.toFixed(1)} ${ey.toFixed(1)}L${ox.toFixed(1)} ${oy.toFixed(1)}" stroke="rgba(140,190,255,.6)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="6" fill="url(#u7ze-ea)"/>
    <text x="${(ex - Math.cos(ea) * 24).toFixed(1)}" y="${(ey - Math.sin(ea) * 0.82 * 24 + 4).toFixed(1)}" fill="#BFD8FF" font-size="10.5" font-weight="700" text-anchor="middle">지구</text>
    <defs>
      <radialGradient id="u7ze-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFEDBE"/><stop offset="1" stop-color="#FFB03A"/></radialGradient>
      <radialGradient id="u7ze-ea" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient>
    </defs>
  </svg>`;
}

/** EO 지구 낮밤 관측자(다크) · 북극 위에서 본 조감. 햇빛 오른쪽 · 자전 반시계.
 *  [검산] 오른쪽 절반 = 낮. 반시계 자전이므로 A(오른쪽) = 한낮 · B(위) = 해 질 무렵(밝은 쪽 → 어두운
 *  쪽으로 넘어감) · C(왼쪽) = 한밤 · D(아래) = 해 뜰 무렵(어두운 쪽 → 밝은 쪽). */
export function earthDayNightFig(): string {
  const cx = 156;
  const cy = 118;
  const R = 62;
  const obs = (deg: number, name: string): string => {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * R;
    const lx = cx + Math.cos(a) * (R + 22);
    const ly = cy - Math.sin(a) * (R + 22);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.4" fill="#FFE9A8" stroke="#B98A3A" stroke-width="1.2"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">${name}</text>`;
  };
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="북극 위에서 내려다본 지구 그림. 오른쪽에서 햇빛이 들어와 오른쪽 절반이 밝고, 지구 둘레 네 곳에 관측자 A, B, C, D가 표시되어 있으며 자전 방향 화살표는 시계 반대 방향이다">
    <defs>
      <clipPath id="u7eo-day"><rect x="${cx}" y="${cy - R - 2}" width="${R + 4}" height="${R * 2 + 4}"/></clipPath>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#16233F" stroke="#3D5378" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#2E5FA8" clip-path="url(#u7eo-day)"/>
    <path d="M${cx} ${cy - R}V${cy + R}" stroke="#5A6C8E" stroke-width="1.2" stroke-dasharray="4 4"/>
    <path d="M${cx - 18} ${cy - 8}q6-6 12-2t12 0" stroke="#7CA65A" stroke-width="1.6"/>
    <path d="M${cx + 8} ${cy + 18}q8-4 16 0" stroke="#7CA65A" stroke-width="1.6"/>
    <path d="M${cx + 30} ${cy - R - 26}a${R + 30} ${R + 30} 0 0 1 -60 0" stroke="#8FB3E8" stroke-width="2" fill="none" stroke-dasharray="6 5"/>
    <path d="M${cx - 30} ${cy - R - 22}l-4-8 9-1z" fill="#8FB3E8"/>
    <text x="${cx}" y="${cy - R - 36}" text-anchor="middle" font-size="10" fill="#8FB3E8">자전 방향(서 → 동)</text>
    ${obs(0, "A")}${obs(90, "B")}${obs(180, "C")}${obs(270, "D")}
    <g stroke="#FFC24E" stroke-width="3"><path d="M336 88l-18 0M336 118l-18 0M336 148l-18 0"/></g>
    <path d="M318 88l7-4v8zM318 118l7-4v8zM318 148l7-4v8z" fill="#FFC24E"/>
    <text x="327" y="170" fill="#FFD79E" font-size="9.5" text-anchor="middle">햇빛</text>
  </svg>`;
}

/** MO 달 공전 위치판(다크·파라미터형) · 지구 중심 4위치. moonPhase8Fig(반구 인쇄 8위치)와 역할 분리:
 *  달 원판은 중립 회색(위상 미인쇄 · 위치→위상 추론이 과제). 햇빛 오른쪽 고정.
 *  [검산] 오른쪽 = 삭 자리 · 위 = 상현 자리 · 왼쪽 = 망 자리 · 아래 = 하현 자리(반시계 공전).
 *  labels = [오른쪽, 위, 왼쪽, 아래] 순 라벨 문자열. arrow = 반시계 공전 화살표 표시. */
export function moonPosFig(o: { labels: [string, string, string, string]; arrow?: boolean }): string {
  const cx = 156;
  const cy = 112;
  const R = 66;
  const spots = [0, 90, 180, 270].map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * R * 0.88;
    const lx = cx + Math.cos(a) * (R + 24);
    const ly = cy - Math.sin(a) * (R * 0.88 + 22);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#3A4560" stroke="#5A6C8E" stroke-width="1.2"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 5.5).toFixed(1)}" fill="#DCE8FF" font-size="14.5" font-weight="800" text-anchor="middle">${o.labels[i]}</text>`;
  }).join("");
  const arrow = o.arrow
    ? `<path d="M${cx + R - 6} ${cy - 26}A${R} ${R * 0.88} 0 0 0 ${cx + 22} ${cy - R * 0.88 + 3}" stroke="#8FB3E8" stroke-width="2" fill="none"/>
       <path d="M${cx + 18} ${cy - R * 0.88 - 3}l-8 3 5 6z" fill="#8FB3E8"/>
       <text x="${cx + R + 4}" y="${cy - 40}" font-size="9.5" fill="#8FB3E8">공전 방향</text>`
    : "";
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="지구를 중심으로 한 달의 공전 궤도 그림. 햇빛은 오른쪽에서 들어오고, 궤도 위 네 곳에 달의 자리가 표시되어 있다. 달의 밝은 부분은 그리지 않은 중립 그림">
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.88}" stroke="#3D5378" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${spots}
    ${arrow}
    <circle cx="${cx}" cy="${cy}" r="12" fill="url(#u7mo-earth)"/>
    <path d="M${cx - 5} ${cy - 2}q3-3 6-1t6 0" stroke="#7CA65A" stroke-width="1.6"/>
    <text x="${cx}" y="${cy + 28}" fill="#BFD8FF" font-size="9.5" text-anchor="middle">지구</text>
    <defs><radialGradient id="u7mo-earth" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient></defs>
    <g stroke="#FFC24E" stroke-width="3"><path d="M336 82l-16 0M336 112l-16 0M336 142l-16 0"/></g>
    <path d="M320 82l7-4v8zM320 112l7-4v8zM320 142l7-4v8z" fill="#FFC24E"/>
    <text x="328" y="164" fill="#FFD79E" font-size="9.5" text-anchor="middle">태양 빛</text>
  </svg>`;
}

/** EA 세 천체 배열(다크·파라미터형) · 그림자 없이 배열만(eclipseShadowFig의 그림자 판독과 역할 분리).
 *  kind solar = 태양 · 달 · 지구 차례(일식 배치) · lunar = 태양 · 지구 · 달(월식 배치).
 *  tilt = 달이 일직선에서 위로 벗어난 컷(궤도 기울어짐 · 얇은 그림자 띠가 지구 위를 비껴감).
 *  [검산] 천체 이름은 라벨로 인쇄(배열 판정이 과제 · 이름 동정이 과제가 아님). */
export function eclipseAlignFig(o: { kind: "solar" | "lunar"; tilt?: boolean }): string {
  const defs = `<defs>
    <radialGradient id="u7ea-sun" cx=".5" cy=".5" r=".9"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2A93B"/></radialGradient>
    <radialGradient id="u7ea-earth" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient>
    <radialGradient id="u7ea-moon" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#D8D2C0"/><stop offset="1" stop-color="#8E8874"/></radialGradient>
  </defs>`;
  const sun = `<circle cx="52" cy="96" r="34" fill="url(#u7ea-sun)"/><text x="52" y="146" text-anchor="middle" font-size="10.5" fill="#FFD79E">태양</text>`;
  if (o.tilt) {
    // [검산] 달은 지구를 도는 위성이라 지구 곁의 기울어진 궤도(타원) 위, 태양 쪽 끝에 그린다
    // (검수 지적: 태양 쪽에 붕 뜬 초판은 삭의 자리로 안 읽힘). 그림자 띠는 태양(52,96)→달(241,64)
    // 연장선 · 지구 x구간(262~322)에서 띠 아래변이 지구 윗변(y66)보다 위를 지나 비껴간다.
    // 기울기는 시각 과장(캡션 명시 · 수치 라벨 없음 · 5° 직접 묻기 금지 원칙).
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="태양과 지구 사이에서, 지구 둘레를 도는 달의 궤도가 기울어져 달이 일직선보다 위로 벗어나 있는 그림. 달의 그림자 띠가 지구 위쪽을 비껴 지나간다">
      ${defs}
      ${sun}
      <path d="M96 96H332" stroke="#5A6C8E" stroke-width="1.2" stroke-dasharray="5 5"/>
      <text x="118" y="110" font-size="9" fill="#5A7396">태양과 지구를 잇는 선</text>
      <ellipse cx="292" cy="96" rx="60" ry="13" transform="rotate(32 292 96)" stroke="#8FB3E8" stroke-width="1.2" stroke-dasharray="4 4"/>
      <path d="M216 144L259 94" stroke="#8FB3E8" stroke-width="1"/>
      <text x="196" y="156" text-anchor="middle" font-size="9.5" fill="#8FB3E8">달의 공전 궤도(기울어짐)</text>
      <circle cx="241" cy="64" r="9" fill="url(#u7ea-moon)"/>
      <text x="241" y="46" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>
      <path d="M249 60L336 46L336 56L250 69z" fill="rgba(10,16,32,.55)"/>
      <text x="296" y="40" text-anchor="middle" font-size="9.5" fill="#8FA6CE">달의 그림자</text>
      <circle cx="292" cy="96" r="30" fill="url(#u7ea-earth)"/>
      <path d="M282 78q6-4 12-2M278 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/>
      <text x="292" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>
      <text x="172" y="182" text-anchor="middle" font-size="9" fill="#66788F">궤도 기울기는 실제보다 과장해 그렸어요</text>
    </svg>`;
  }
  const mid = o.kind === "solar"
    ? `<circle cx="176" cy="96" r="9" fill="url(#u7ea-moon)"/><text x="176" y="120" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>
       <circle cx="292" cy="96" r="30" fill="url(#u7ea-earth)"/><path d="M282 78q6-4 12-2M278 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/><text x="292" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>`
    : `<circle cx="192" cy="96" r="30" fill="url(#u7ea-earth)"/><path d="M182 78q6-4 12-2M178 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/><text x="192" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>
       <circle cx="296" cy="96" r="9" fill="url(#u7ea-moon)"/><text x="296" y="120" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>`;
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="태양과 두 천체가 한 줄로 늘어선 배열 그림. 각 천체에 이름이 붙어 있다">
    ${defs}
    ${sun}
    <path d="M96 96H332" stroke="#5A6C8E" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${mid}
  </svg>`;
}

/** EP 식 진행 컷(다크·파라미터형) · mode next: 진행 (가)(나) 두 컷 + 다음 모습 후보 ①~⑤.
 *  [검산 · 진행 방향 규칙] 일식 = 태양의 오른쪽(서쪽)부터 가려진다 · 월식 = 달의 왼쪽(동쪽)부터
 *  가려진다(남쪽 하늘 기준 · 근거는 달의 서에서 동으로 가는 공전). 정답 컷은 ②에 배치(shuffle:false).
 *  개기월식 컷의 달 색은 모식(실제 붉은 색감은 사진 몫). */
export function eclipseProgressFig(o: { kind: "solar" | "lunar"; mode?: "next" | "order" | "label" }): string {
  const sunDisk = (cx: number, cy: number, r: number, cover: number, fromRight: boolean): string => {
    const off = (1.55 - cover * 1.35) * r * (fromRight ? 1 : -1);
    return `<defs>${cover === 0 ? "" : ""}</defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFD879"/>
      ${cover > 0 ? `<circle cx="${(cx + off).toFixed(1)}" cy="${cy}" r="${r * 1.02}" fill="#0E1830"/>` : ""}
      <circle cx="${cx}" cy="${cy}" r="${r}" stroke="#B98A3A" stroke-width="1" fill="none"/>`;
  };
  const moonDisk = (cx: number, cy: number, r: number, cover: number, fromLeft: boolean): string => {
    const off = (1.55 - cover * 1.35) * r * (fromLeft ? -1 : 1);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#EDE2BE"/>
      ${cover > 0 ? `<circle cx="${(cx + off).toFixed(1)}" cy="${cy}" r="${r * 1.06}" fill="#1A2438" opacity=".94"/>` : ""}
      <circle cx="${cx}" cy="${cy}" r="${r}" stroke="#7E93B8" stroke-width="1" fill="none"/>`;
  };
  const disk = (cx: number, cy: number, r: number, cover: number, correctDir: boolean): string =>
    o.kind === "solar" ? sunDisk(cx, cy, r, cover, correctDir) : moonDisk(cx, cy, r, cover, correctDir);
  const capt = o.kind === "solar" ? "일식이 진행되는 모습(남쪽 하늘 기준)" : "월식이 진행되는 모습(남쪽 하늘 기준)";
  if (o.mode === "order") {
    // 순서 배열판(월식 342용): 세 장면을 순서 없이 (가)(나)(다) 나열. [검산] 문두를 "가려지는 동안"으로
    // 한정해야 복원 국면 역순의 복수 정답이 차단된다. 정답 순서 = (나) 온달 → (다) 살짝 → (가) 절반
    // (월식은 달의 왼쪽부터 · fromLeft = true).
    return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="월식이 진행되는 동안의 세 장면을 순서 없이 늘어놓은 그림. 달이 가려진 정도가 장면마다 다르다">
      <rect x="4" y="6" width="336" height="140" rx="14" fill="#0E1830"/>
      <text x="172" y="26" text-anchor="middle" font-size="10.5" fill="#8FA6CE">월식이 진행되는 동안의 세 장면(순서 없이 나열 · 남쪽 하늘 기준)</text>
      ${disk(70, 78, 26, 0.5, true)}
      <text x="70" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(가)</text>
      ${disk(172, 78, 26, 0, true)}
      <text x="172" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(나)</text>
      ${disk(274, 78, 26, 0.22, true)}
      <text x="274" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(다)</text>
    </svg>`;
  }
  if (o.mode === "label") {
    // 라벨판(일식 359용): 태양 원판 양 가장자리 ㉮(왼쪽)·㉯(오른쪽)만. 달은 그리지 않는다(접근 방향
    // 인쇄 = 정답 유출). [검산] 먼저 가려지는 쪽 = ㉯(오른쪽 · 서쪽) · 근거는 달의 서→동 공전.
    return `<svg viewBox="0 0 344 172" ${NS} fill="none" role="img" aria-label="곧 일식이 시작될 태양 원판 그림. 왼쪽 가장자리와 오른쪽 가장자리에 기호가 붙어 있다">
      <rect x="4" y="6" width="336" height="160" rx="14" fill="#0E1830"/>
      <text x="172" y="28" text-anchor="middle" font-size="10.5" fill="#8FA6CE">곧 일식이 시작돼요(남쪽 하늘 기준)</text>
      ${sunDisk(172, 96, 42, 0, true)}
      <circle cx="106" cy="96" r="14" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="106" y="101" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">㉮</text>
      <path d="M120 96h8" stroke="#8FB3E8" stroke-width="1.6"/>
      <circle cx="238" cy="96" r="14" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="238" y="101" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">㉯</text>
      <path d="M224 96h-8" stroke="#8FB3E8" stroke-width="1.6"/>
    </svg>`;
  }
  const cand = (cx: number, num: string, cover: number, correctDir: boolean): string =>
    `${disk(cx, 168, 17, cover, correctDir)}<text x="${cx}" y="206" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">${num}</text>`;
  return `<svg viewBox="0 0 344 218" ${NS} fill="none" role="img" aria-label="식이 진행되는 두 장면 (가), (나)와 다음에 올 모습 후보 다섯 개가 그려진 그림">
    <rect x="4" y="6" width="336" height="206" rx="14" fill="#0E1830"/>
    <text x="172" y="26" text-anchor="middle" font-size="10.5" fill="#8FA6CE">${capt}</text>
    ${disk(100, 62, 24, 0.22, true)}
    <text x="100" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(가)</text>
    <path d="M148 62h32M173 56l9 6-9 6z" fill="#8FB3E8" stroke="#8FB3E8" stroke-width="1.6"/>
    ${disk(238, 62, 24, 0.5, true)}
    <text x="238" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(나)</text>
    <path d="M20 122h304" stroke="#2C4066" stroke-width="1.2"/>
    <text x="28" y="139" font-size="10" fill="#8FA6CE">바로 다음에 올 모습은?</text>
    ${cand(46, "①", 0, true)}
    ${cand(109, "②", 0.78, true)}
    ${cand(172, "③", 0.5, false)}
    ${cand(235, "④", 0.22, true)}
    ${cand(298, "⑤", 0.78, false)}
  </svg>`;
}

/** PD 행성 분류 순서도(라이트) · 코딩 분기(천재 06 계보 · 질문·행성 세트는 자체 제작).
 *  [검산] 질문 1 "표면에 충돌 구덩이가 많고 대기가 거의 없는가" 예 = A(수성) · 아니요 → 질문 2
 *  "뚜렷하고 큰 고리를 가졌는가" 예 = B(토성) · 아니요 = C(해왕성). 결론 칸은 각자 분리(수렴 금지). */
export function planetFlowFig(q1: string, q2: string, o?: { names?: string; reveal?: [string, string, string]; hideQ2?: boolean }): string {
  const box = (x: number, y: number, w: number, h: number, txt: string, fill = "#F7F9FC"): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="#C9D2DD" stroke-width="1.4"/>
     ${txt}`;
  const t = (x: number, y: number, s: string, size = 11.5, w = 700, fill = "#333D4B"): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${w}" fill="${fill}">${s}</text>`;
  const names = o?.names ?? "수성 · 토성 · 해왕성";
  const r1 = o?.reveal?.[0] ?? "A";
  const r2 = o?.reveal?.[1] ?? "B";
  const r3 = o?.reveal?.[2] ?? "C";
  const rs = o?.reveal ? 12 : 14;
  const q2txt = o?.hideQ2 ? `${t(234, 133, "㉠ ?", 13)}${t(234, 149, "(질문 2)", 9.5, 600, "#8B95A1")}` : `${t(234, 133, q2, 11)}${t(234, 149, "(질문 2)", 9.5, 600, "#8B95A1")}`;
  return `<svg viewBox="0 0 344 218" ${NS} fill="none" role="img" aria-label="행성을 두 가지 질문으로 나누는 순서도. 질문마다 예와 아니요 갈래가 있고 끝 칸은 세 곳으로 갈라진다">
    ${box(92, 10, 160, 30, t(172, 29, names, 12), "#EEF4FF")}
    <path d="M172 40v14" stroke="#8B95A1" stroke-width="1.6"/>
    ${box(52, 54, 240, 40, `${t(172, 71, q1, 11)}${t(172, 87, "(질문 1)", 9.5, 600, "#8B95A1")}`)}
    <path d="M90 94v22M234 94v22" stroke="#8B95A1" stroke-width="1.6"/>
    ${t(76, 110, "예", 10.5, 700, "#04B45F")}${t(248, 110, "아니요", 10.5, 700, "#F04452")}
    ${box(58, 116, 64, 32, t(90, 137, r1, rs), "#FFF7E8")}
    ${box(140, 116, 188, 40, q2txt)}
    <path d="M196 156v22M296 156v22" stroke="#8B95A1" stroke-width="1.6"/>
    ${t(182, 172, "예", 10.5, 700, "#04B45F")}${t(312, 172, "아니요", 10.5, 700, "#F04452")}
    ${box(160, 178, 72, 32, t(196, 199, r2, rs), "#FFF7E8")}
    ${box(260, 178, 72, 32, t(296, 199, r3, rs), "#FFF7E8")}
  </svg>`;
}

/** PC 위상 카드 셔플판(다크) · 다섯 모양 카드 (가)~(마)를 뒤섞어 나열(순서 배열 문항 전용 ·
 *  fivePhasesFig의 고정 ①~⑤ 제시와 구분). shapes = 카드 순서대로 위상 키.
 *  [검산] 모양: new=거의 안 보임 · crescent=오른쪽 가는 조각 · first=오른쪽 반 · full=온면 ·
 *  last=왼쪽 반(밝은 쪽 = 태양 쪽 원칙의 지구 시점판). */
export function phaseCardsFig(shapes: ("new" | "crescent" | "first" | "full" | "last")[]): string {
  const moon = (cx: number, kind: string): string => {
    const r = 16;
    const base = `<circle cx="${cx}" cy="58" r="${r}" fill="#232E48" stroke="#5A6C8E" stroke-width="1"/>`;
    if (kind === "new") return base;
    if (kind === "full") return `<circle cx="${cx}" cy="58" r="${r}" fill="#EDE2BE" stroke="#B9AE8C" stroke-width="1"/>`;
    if (kind === "first") return `${base}<path d="M${cx} ${58 - r}a${r} ${r} 0 0 1 0 ${r * 2}z" fill="#EDE2BE"/>`;
    if (kind === "last") return `${base}<path d="M${cx} ${58 - r}a${r} ${r} 0 0 0 0 ${r * 2}z" fill="#EDE2BE"/>`;
    return `${base}<path d="M${cx} ${58 - r}a${r} ${r} 0 0 1 0 ${r * 2}a${r * 1.5} ${r * 1.5} 0 0 0 0 ${-r * 2}z" fill="#EDE2BE"/>`;
  };
  const tags = ["(가)", "(나)", "(다)", "(라)", "(마)"];
  return `<svg viewBox="0 0 344 118" ${NS} fill="none" role="img" aria-label="뒤섞어 놓은 달의 다섯 가지 모양 카드. 각 카드에 가나다 순서 기호가 붙어 있다">
    <rect x="4" y="6" width="336" height="106" rx="14" fill="#0E1830"/>
    ${shapes.map((k, i) => `${moon(44 + i * 64, k)}<text x="${44 + i * 64}" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#DCE8FF">${tags[i]}</text>`).join("")}
  </svg>`;
}

/** WS 같은 시각 서쪽 하늘 연속 관측(다크) · 15일 간격 3컷(천재 11 계보 · 별자리는 가상 점군).
 *  [검산] 해 진 직후 서쪽 하늘: 같은 별자리가 날이 갈수록 태양 쪽(지평선 쪽)으로 낮아진다 =
 *  태양이 별자리 사이를 서에서 동으로 이동(연주 운동)한 결과. 컷 순서 (가)→(나)→(다). */
export function westSkyFig(o?: { v?: 2 }): string {
  // v 2 = 별자리 모양·높이·간격(10일)이 다른 두 번째 자료셋(같은 그림 두 문항 금지 · 자료셋 배타).
  const alt = o?.v === 2;
  const cut = (x0: number, tag: string, starY: number): string => {
    const pts = alt
      ? [[0, 0], [12, -14], [28, -8], [40, -18], [18, -24], [34, 2]]
      : [[0, 0], [14, -10], [26, -2], [36, -14], [22, -22]];
    const line = alt
      ? `<path d="M${x0 + 34} ${starY}L${x0 + 46} ${starY - 14}L${x0 + 62} ${starY - 8}L${x0 + 74} ${starY - 18}M${x0 + 46} ${starY - 14}L${x0 + 52} ${starY - 24}M${x0 + 62} ${starY - 8}L${x0 + 68} ${starY + 2}" stroke="rgba(190,214,255,.5)" stroke-width="1"/>`
      : `<path d="M${x0 + 34} ${starY}L${x0 + 48} ${starY - 10}L${x0 + 60} ${starY - 2}L${x0 + 70} ${starY - 14}M${x0 + 48} ${starY - 10}L${x0 + 56} ${starY - 22}" stroke="rgba(190,214,255,.5)" stroke-width="1"/>`;
    const cluster = pts.map(([dx, dy]) => `<circle cx="${x0 + 34 + dx}" cy="${starY + dy}" r="1.9" fill="#EDE2BE"/>`).join("") + line;
    return `<rect x="${x0}" y="16" width="104" height="150" rx="10" fill="#0E1830" stroke="#22314F" stroke-width="1"/>
      ${cluster}
      <path d="M${x0 + 6} 142q30-10 52-6t46 2v8a8 8 0 0 1-8 8h-82a8 8 0 0 1-8-8z" fill="#0A1428"/>
      <circle cx="${x0 + 20}" cy="150" r="7" fill="#FF9E4A" opacity=".85"/>
      <text x="${x0 + 52}" y="180" text-anchor="middle" font-size="11" font-weight="700" fill="#AFC3E3">${tag}</text>`;
  };
  const g1 = alt ? 66 : 58;
  const g2 = alt ? 94 : 92;
  const g3 = alt ? 122 : 124;
  const t2 = alt ? "(나) 10일 뒤" : "(나) 15일 뒤";
  const t3 = alt ? "(다) 20일 뒤" : "(다) 30일 뒤";
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="며칠 간격으로 같은 시각에 서쪽 하늘을 관측한 세 장면. 같은 별자리가 점점 지평선 가까이 내려가 있다">
    ${cut(8, "(가)", g1)}${cut(120, t2, g2)}${cut(232, t3, g3)}
    <text x="172" y="192" text-anchor="middle" font-size="9.5" fill="#7E93B8">해가 진 직후 · 서쪽 하늘 · 주황 점은 해가 진 자리</text>
  </svg>`;
}

/** 파일럿 부록 · 문항 미사용 신작(PC·WS)의 데뷔 눈검수 카드(갤러리 말미 렌더 전용). */
export const PILOT_PREVIEW: { name: string; dark: boolean; svg: string }[] = [
  { name: "PC phaseCardsFig(셔플 예시)", dark: true, svg: phaseCardsFig(["first", "new", "full", "crescent", "last"]) },
  { name: "WS westSkyFig", dark: true, svg: westSkyFig() },
];

/* ══════════ 파일럿 40 문항 ══════════ */

export const POOL_U7V2_PILOT: ExamItem[] = [
  // [201 · d1 · 무①] 태양계 정의 · v1 e01과 보기 구성 분리(인공위성·지구 중심 미끼 신작).
  {
    id: "u7e201",
    lessonId: "u7l1",
    type: "mcq",
    diff: 1,
    prompt: "<b>태양계</b>에 대한 설명으로 가장 옳은 것은?",
    options: [
      "태양의 영향이 미치는 공간과 그 안에서 태양 주위를 도는 천체들을 묶어 부르는 이름이다",
      "지구를 중심으로 도는 천체들을 묶어 부르는 이름이다",
      "밤하늘에서 맨눈에 보이는 모든 천체를 묶어 부르는 이름이다",
      "스스로 빛을 내는 별들만 모아 부르는 이름이다",
      "달과 인공위성처럼 지구 가까이 있는 천체만 묶어 부르는 이름이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>태양계는 <b>태양</b>과, 태양 주위를 공전하는 행성·위성·소행성·혜성·왜소 행성, 그리고 이들이 차지하는 <b>공간</b>까지를 아우르는 이름이에요. 중심은 언제나 태양이죠.<span class='xh'>오답 하나씩 격파</span>'지구를 중심으로'는 중심을 잘못 잡았어요 · 지구도 태양 주위를 도는 여덟 행성 중 하나일 뿐이에요. '밤하늘에 보이는 모든 천체'는 범위가 너무 넓어요 · 밤하늘 별 대부분은 태양계 바깥의 아주 먼 천체거든요. '스스로 빛을 내는 별들의 모임'이라면 태양계 식구 중엔 태양 하나만 남아 모임이 되질 않고, '달과 인공위성'은 지구 둘레의 아주 좁은 동네만 가리키는 설명이라 태양계 전체와는 거리가 멀어요.",
    core: "태양계 = 태양 + 그 주위를 도는 천체들 + 그 공간. 중심은 태양!",
  },
  // [202 · d1 · PO] 배열 A(수성) 특징 · v1 E(목성)·B(금성) 축 회피. 인접 밀기 오답(금성 대기를 A에).
  {
    id: "u7e202",
    lessonId: "u7l1",
    type: "mcq",
    diff: 1,
    prompt: "그림은 태양에서 가까운 순서대로 늘어선 여덟 행성(A~H)이에요. <b>A</b>에 대한 설명으로 옳은 것은?",
    figure: planetOrderFig(),
    figureDark: true,
    options: [
      "대기가 거의 없어 낮과 밤의 온도 차가 매우 크다",
      "이산화 탄소의 두꺼운 대기가 있어 표면이 매우 뜨겁다",
      "표면이 붉고 흰 극관이 있다",
      "여덟 행성 가운데 가장 크다",
      "뚜렷하고 큰 고리를 두르고 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>A는 태양에서 첫 번째 · <b>수성</b>이에요. 수성은 대기가 거의 없어서 낮에는 뜨겁게 달궈지고 밤에는 급격히 식어, 낮과 밤의 <b>온도 차가 매우 커요</b>. 표면에는 충돌 구덩이가 가득하죠.<span class='xh'>오답 하나씩 격파</span>'이산화 탄소의 두꺼운 대기'는 바로 옆 B(금성)의 특징을 한 칸 밀어 놓은 함정이에요. '붉은 표면과 극관'은 D(화성), '가장 크다'는 E(목성), '뚜렷한 고리'는 F(토성)의 자랑이고요. 배열 문제는 먼저 '몇 번째 = 어느 행성'을 확정한 뒤 특징을 맞춰야 해요 · 이웃 행성의 특징을 슬쩍 밀어 넣는 오답이 단골이니, 수금지화목토천해 순서부터 단단히!",
    core: "A = 수성: 대기 거의 없음 → 낮밤 온도 차 최대. 순서 확정이 먼저!",
  },
  // [204 · d1 · 사진 mars(신규 NASA)] 실사 동정 · 극관·붉은 표면. alt에 행성 이름 금지.
  {
    id: "u7e204",
    lessonId: "u7l1",
    type: "mcq",
    diff: 1,
    prompt: "사진은 어떤 행성의 실제 모습이에요. 표면이 전체적으로 붉고, 극 쪽에 흰 부분이 보여요. 이 행성은?",
    figure: pimg("mars.jpg", "표면이 전체적으로 붉은빛이고 극 부분이 희게 덮여 있는 행성의 실제 관측 사진"),
    options: ["화성", "금성", "수성", "목성", "토성"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>붉은 표면과 극 쪽의 흰 덮개 · 두 가지 단서가 모두 <b>화성</b>을 가리켜요. 화성 표면의 흙에는 철 성분이 많아 붉게 보이고, 극에는 얼음과 드라이아이스로 된 <b>극관</b>이 하얗게 덮여 있어요. 과거에 물이 흘렀던 흔적이 발견된 행성이기도 하죠.<span class='xh'>오답 하나씩 격파</span>금성은 두꺼운 구름 대기에 싸여 뿌옇게 보일 뿐 붉은 암석 표면이 드러나지 않고, 수성은 회색빛 표면에 충돌 구덩이가 가득해요. 목성은 줄무늬와 대적점이 있는 거대한 기체 행성이고, 토성은 뚜렷한 고리부터 눈에 들어오죠. 사진 동정 문제는 '색깔 + 결정적 부위(극관·고리·대적점)' 조합으로 푸는 게 요령이에요.",
    core: "붉은 표면 + 흰 극관 = 화성. 동정은 색+결정적 부위 조합으로!",
  },
  // [208 · d2 · 무①] 혜성 · 가까워질 때 변화(v1 "멀어질 때" 축 회피). 꼬리 = 태양 반대쪽.
  {
    id: "u7e208",
    lessonId: "u7l1",
    type: "mcq",
    diff: 2,
    prompt: "혜성 하나가 태양에 <b>가까워지고 있어요</b>. 이때 혜성에서 일어나는 일로 옳은 것은?",
    options: [
      "표면 물질이 증발하면서 태양 반대쪽으로 꼬리가 생긴다",
      "태양 쪽을 향해 꼬리가 길게 자란다",
      "온도가 낮아져 얼음이 더 두껍게 얼어붙는다",
      "스스로 빛을 내기 시작한다",
      "꼬리가 점점 짧아지다가 완전히 사라진다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>혜성이 태양에 가까워지면 태양의 열에 표면의 얼음과 먼지가 증발해 퍼져 나가고, 이 물질이 태양이 미는 힘에 밀려 <b>태양의 반대쪽</b>으로 긴 꼬리를 만들어요. 가까울수록 증발이 활발해 꼬리도 길어지죠.<span class='xh'>오답 하나씩 격파</span>'태양 쪽으로 꼬리'는 방향을 뒤집은 단골 함정 · 꼬리는 혜성이 가는 방향과도 무관하게 언제나 태양 반대쪽이에요. '온도가 낮아진다'는 상황이 거꾸로예요 · 태양에 다가가는 중이니 점점 뜨거워지죠. '스스로 빛을 낸다'는 자격 미달 · 혜성이 밝게 보이는 건 태양 빛을 반사하고 증발한 물질이 빛나 보이기 때문이에요. '꼬리가 사라진다'는 멀어질 때 이야기랍니다.",
    core: "혜성 꼬리는 언제나 태양 반대쪽 · 가까워질수록 길어진다!",
  },
  // [213 · d2 · TB] 행성 자료표 판독 bogi · 반지름(지구=1)·위성 수(2023 기준 과학 사실).
  // 검산: A 금성 0.9·0 / B 화성 0.5·2 / C 목성 11.2·95 / D 토성 9.4·146.
  // ㄱ 참(C 11.2 최대) · ㄴ 참(A 위성 0) · ㄷ 거짓(B 0.5 < 지구 1). 정답 = ㄱ, ㄴ.
  {
    id: "u7e213",
    lessonId: "u7l1",
    type: "mcq",
    diff: 2,
    prompt: "표는 네 행성 A~D의 자료예요. 옳은 설명을 <보기>에서 모두 고른 것은?",
    figure: svgTable(
      ["행성", "반지름(지구=1)", "위성 수(개)"],
      [
        ["A", "0.9", "0"],
        ["B", "0.5", "2"],
        ["C", "11.2", "95"],
        ["D", "9.4", "146"],
      ],
      { firstColHead: true },
    ),
    bogi: ["반지름이 가장 큰 행성은 C이다", "A에는 위성이 없다", "B는 지구보다 크다"],
    options: ["ㄱ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>표를 한 줄씩 읽어요. ㄱ ✓ 반지름 열에서 가장 큰 값은 C의 11.2 · C가 가장 큰 행성이에요. ㄴ ✓ A의 위성 수는 0 · 위성이 없죠. ㄷ ✗ 반지름 기준이 '지구=1'이니 B의 0.5는 지구의 절반 크기라는 뜻 · 지구보다 <b>작아요</b>. 따라서 옳은 것은 ㄱ, ㄴ.<span class='xh'>오답 하나씩 격파</span>ㄷ에 걸렸다면 기준 단위를 놓친 거예요 · 이런 표는 첫 행의 '(지구=1)' 같은 기준부터 확인해야 해요. 참고로 반지름이 10배 안팎에 위성을 수십 개씩 거느린 C·D는 목성·토성 같은 커다란 행성들, 위성이 없거나 한둘뿐인 A·B는 수성·금성·화성 같은 작은 행성들의 전형적인 모습이랍니다.",
    core: "표 판독은 기준(지구=1)부터! 큰 행성은 위성도 많은 경향.",
  },
  // [218 · d1 · 사진 neptune(신규 NASA)] 해왕성 동정 · v1 무그림 서술의 사진 격상. alt 이름 금지.
  {
    id: "u7e218",
    lessonId: "u7l1",
    type: "mcq",
    diff: 1,
    prompt: "사진은 탐사선이 촬영한 실제 행성이에요. 전체가 파랗게 보이고, 표면에 검은 소용돌이 무늬가 관측된 적이 있어요. 이 행성은?",
    figure: pimg("neptune.jpg", "전체가 짙푸른 색으로 보이고 표면에 어두운 무늬가 있는 행성의 실제 관측 사진"),
    options: ["해왕성", "천왕성", "지구", "수성", "화성"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>짙푸른 색과 검은 소용돌이(<b>대흑점</b>) · <b>해왕성</b>의 특징이에요. 해왕성은 태양에서 가장 먼 여덟 번째 행성으로, 대기의 메테인 성분이 붉은빛을 흡수해 파랗게 보여요.<span class='xh'>오답 하나씩 격파</span>천왕성도 푸른 계열이지만 초록빛이 도는 <b>청록색</b>에 가깝고 표면 무늬가 거의 없이 밋밋해요 · 해왕성의 더 짙은 파랑·대흑점과 구분되죠. 지구는 파란 바다 위에 하얀 구름과 초록·갈색 대륙이 섞여 보이니 민무늬 파란 공과는 달라요. 수성은 회색 암석 표면에 충돌 구덩이, 화성은 붉은 표면이라 색부터 어긋나고요. '파랑 계열 두 형제'는 짙은 파랑+대흑점 = 해왕성, 청록 민무늬 = 천왕성으로 정리해 두세요.",
    core: "짙은 파랑 + 대흑점 = 해왕성. 청록 민무늬는 천왕성!",
  },
  // [225 · d1 · multi 무①] 위성 옳은 설명 모두 · v1 e17(행성 multi)과 대상 축 분리.
  // 검산: 정답 = "행성 주위 공전"(참) · "행성마다 수가 다르다"(참). 오답 = 태양 직접 공전 ·
  // 스스로 빛남 · 모든 행성이 가짐(수성·금성 0).
  {
    id: "u7e225",
    lessonId: "u7l1",
    type: "multi",
    diff: 1,
    prompt: "<b>위성</b>에 대한 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "행성 주위를 공전하는 천체이다",
      "행성마다 거느린 위성의 수가 다르다",
      "태양 주위를 직접 공전한다",
      "스스로 빛을 내며 행성을 밝혀 준다",
      "여덟 행성 모두 위성을 가지고 있다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>위성은 <b>행성 주위를 공전</b>하는 천체예요 · 달이 지구를 도는 것처럼요 ✓. 그리고 행성마다 사정이 달라서, 지구는 1개(달), 화성은 2개, 목성과 토성은 수십 개가 넘는 위성을 거느려요 ✓.<span class='xh'>오답 하나씩 격파</span>'태양 주위를 직접 공전'은 행성·소행성·혜성의 이야기예요 · 위성은 행성에 딸려 함께 태양을 돌 뿐, 도는 중심은 행성이죠. '스스로 빛을 낸다'는 태양계에서 태양만의 자격 · 달이 밝아 보이는 것도 태양 빛의 반사예요. '여덟 행성 모두 위성을 가진다'도 틀렸어요 · 태양에 가까운 수성과 금성은 위성이 <b>하나도 없답니다</b>.",
    core: "위성 = 행성 주위 공전. 수성·금성은 위성 0개!",
  },
  // [228 · d2 · TB 행판정] 비교표 ①~⑤ 행 판정(미3 계보 · 속성 구성 자체 제작).
  // 검산: ① 표면 교차(거짓) ② 반지름 반전(거짓) ③ 위성 수(참 · 정답) ④ 고리 반전(거짓) ⑤ 질량 반전(거짓).
  // shuffle:false(행 번호 = 보기) · 정답 ③ = 첫 칸 아님 ✓.
  {
    id: "u7e228",
    lessonId: "u7l2",
    type: "mcq",
    diff: 2,
    prompt: "표는 지구형 행성과 목성형 행성을 비교한 거예요. ①~⑤ 중 내용이 <b>옳은</b> 행은?",
    figure: svgTable(
      ["", "지구형 행성", "목성형 행성"],
      [
        ["① 표면", "기체", "단단한 암석"],
        ["② 반지름", "크다", "작다"],
        ["③ 위성 수", "없거나 적다", "많다"],
        ["④ 고리", "있다", "없다"],
        ["⑤ 질량", "크다", "작다"],
      ],
      { firstColHead: true },
    ),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>행마다 좌우가 제자리에 있는지 확인해요. ③ ✓ 지구형(수성·금성·지구·화성)은 위성이 없거나 한둘뿐이고, 목성형(목성·토성·천왕성·해왕성)은 위성을 수십 개씩 거느려요 · 옳은 행이에요.<span class='xh'>오답 하나씩 격파</span>①은 좌우가 뒤바뀌었어요 · 단단한 암석 표면이 지구형, 기체 표면이 목성형이죠. ②도 반대 · 반지름은 목성형이 훨씬 커요. ④도 뒤집혔어요 · 고리는 목성형 네 행성이 모두 가지고 있고 지구형에는 없어요. ⑤ 역시 반대 · 질량은 목성형이 압도적으로 크죠. 비교표 문제는 '지구형 = 작고 단단하고 단출, 목성형 = 크고 기체이고 식구 많음'이라는 큰 그림 하나로 다섯 행을 한 번에 검산할 수 있어요.",
    core: "지구형 = 작고 암석·위성 적음 / 목성형 = 크고 기체·위성 많음·고리!",
  },
  // [231 · d2 · GS 산점도] 왼쪽 아래 무리 · v1 "오른쪽 위(크고 듬직)" 축 반전.
  {
    id: "u7e231",
    lessonId: "u7l2",
    type: "mcq",
    diff: 2,
    prompt: "그래프는 여덟 행성의 질량과 반지름을 점으로 찍은 거예요(지구=1). <b>왼쪽 아래에 모인 무리</b>에 대한 설명으로 옳은 것은?",
    figure: planetGroupsFig(),
    figureDark: true,
    options: [
      "표면이 단단한 암석으로 되어 있다",
      "네 행성 모두 고리를 가지고 있다",
      "위성을 수십 개씩 거느린다",
      "목성형 행성 무리이다",
      "태양에서 먼 네 행성이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>질량도 반지름도 작은 왼쪽 아래 무리는 수성·금성·지구·화성 · <b>지구형 행성</b>이에요. 지구형 행성은 표면이 <b>단단한 암석</b>이라 탐사선이 내려앉을 수도 있죠.<span class='xh'>오답 하나씩 격파</span>'고리'와 '수십 개의 위성'은 오른쪽 위 무리(목성형)의 특징이에요 · 지구형은 고리가 없고 위성도 없거나 한둘뿐이죠. '목성형 행성 무리'는 이름표를 반대로 붙인 것 · 크고 무거운 오른쪽 위 무리가 목성형이에요. '태양에서 먼 네 행성'도 반대예요 · 지구형 넷은 모두 태양 가까운 안쪽 궤도를 돌아요. 그래프에서 두 무리가 뚜렷이 갈라진다는 사실 자체가, 여덟 행성을 지구형·목성형으로 나누는 근거랍니다.",
    core: "왼쪽 아래(작음) = 지구형: 암석 표면·안쪽 궤도. 오른쪽 위 = 목성형!",
  },
  // [234 · d2 · PD 순서도] 코딩 분기 · 세트 신작(수성·토성·해왕성 · 천06 금·화·목, v1 세트 회피).
  // 검산: 질문1 "충돌 구덩이 많고 대기 거의 없음" 예 = 수성(A) · 질문2 "뚜렷하고 큰 고리" 예 = 토성(B) ·
  // 아니요 = 해왕성(C).
  {
    id: "u7e234",
    lessonId: "u7l2",
    type: "mcq",
    diff: 2,
    prompt: "수성, 토성, 해왕성을 순서도의 두 질문으로 구분했어요. A, B, C에 들어갈 행성을 차례대로 옳게 짝 지은 것은?",
    figure: planetFlowFig("표면에 충돌 구덩이가 많고 대기가 거의 없는가?", "뚜렷하고 큰 고리를 가졌는가?"),
    options: [
      "수성, 토성, 해왕성",
      "수성, 해왕성, 토성",
      "토성, 수성, 해왕성",
      "해왕성, 토성, 수성",
      "토성, 해왕성, 수성",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>질문 1부터 차례로 걸러요. ① '충돌 구덩이가 많고 대기가 거의 없는가?'에 '예'인 행성은 <b>수성</b>뿐 · A는 수성. ② 남은 토성과 해왕성 중 '뚜렷하고 큰 고리'에 '예'는 <b>토성</b> · B는 토성. ③ 마지막 남은 <b>해왕성</b>이 C예요.<span class='xh'>오답 하나씩 격파</span>'수성, 해왕성, 토성'은 질문 2를 거꾸로 읽은 결과예요 · 고리 질문에 '예'로 걸러지는 쪽이 B라는 갈래 방향을 놓치면 이렇게 뒤집혀요. 토성이 A로 간 조합들은 질문 1이 어긋나요 · 토성은 기체 행성이라 충돌 구덩이 표면이 아니죠. 참고로 해왕성도 가는 고리를 가지고 있지만 '뚜렷하고 큰' 고리는 토성만의 특징이라 질문이 성립한답니다. 순서도 문제는 갈래의 예/아니요 방향을 손가락으로 짚으며 따라가는 게 정확해요.",
    core: "분기 순서도는 질문 순서대로: 구덩이+무대기 = 수성 → 큰 고리 = 토성!",
  },
  // [238 · d1 · 사진 mercury(신규 NASA)] 수성 동정+무리 · 미11 계보. alt 이름 금지.
  {
    id: "u7e238",
    lessonId: "u7l2",
    type: "mcq",
    diff: 1,
    prompt: "사진은 탐사선이 촬영한 실제 행성이에요. 회색 표면에 충돌 구덩이가 가득해요. 이 행성의 이름과 속한 무리를 옳게 짝 지은 것은?",
    figure: pimg("mercury.jpg", "회색빛 표면에 크고 작은 충돌 구덩이가 가득한 행성의 실제 관측 사진"),
    options: [
      "수성, 지구형 행성",
      "수성, 목성형 행성",
      "화성, 지구형 행성",
      "토성, 목성형 행성",
      "천왕성, 목성형 행성",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>회색 암석 표면에 충돌 구덩이가 가득한 모습 · 대기가 거의 없어 운석의 흔적이 고스란히 남은 <b>수성</b>이에요. 수성은 크기가 작고 표면이 단단한 <b>지구형 행성</b> 무리에 속하죠.<span class='xh'>오답 하나씩 격파</span>'수성, 목성형'은 이름은 맞았지만 무리가 틀렸어요 · 목성형은 크고 표면이 기체인 무리라 수성이 낄 자리가 아니죠. 화성이라면 표면이 회색이 아니라 <b>붉게</b> 보여야 해요. 토성은 뚜렷한 고리, 천왕성은 청록색 민무늬가 트레이드마크라 사진과 전혀 다르고, 둘 다 기체 행성이라 충돌 구덩이 표면 자체가 없답니다. 달과 닮은 회색 구덩이 표면 = 수성, 이 조합으로 기억해 두세요.",
    core: "회색+충돌 구덩이 가득 = 수성(지구형). 붉으면 화성!",
  },
  // [245 · d3 · 자료상자] 조건 셋 동정 → 지구형 골라내기(2단 · 미2 계보 역방향, 세트 신작).
  // 검산: (가) 청록색·누워서 자전 = 천왕성(목성형) · (나) 붉은 표면·극관 = 화성(지구형) ·
  // (다) 가장 큰 행성·대적점 = 목성(목성형) → 지구형은 (나) 하나.
  {
    id: "u7e245",
    lessonId: "u7l2",
    type: "mcq",
    diff: 3,
    prompt: "세 행성의 특징이에요. 이 가운데 <b>지구형 행성</b>인 것을 모두 고른 것은?",
    figure: dbox([
      ["(가)", "청록색으로 보이며, 자전축이 공전 궤도면과 거의 나란해 누운 채 돈다."],
      ["(나)", "표면이 붉고, 극에 얼음으로 덮인 흰 극관이 있다."],
      ["(다)", "태양계에서 가장 크고, 대적점이라는 대기 소용돌이가 있다."],
    ]),
    options: ["(가)", "(나)", "(가), (다)", "(나), (다)", "(가), (나), (다)"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 정체를 밝혀요. (가) 청록색+누운 자전축 = <b>천왕성</b>, (나) 붉은 표면+극관 = <b>화성</b>, (다) 최대 크기+대적점 = <b>목성</b>. 이제 무리를 나누면 화성만 수성·금성·지구·화성의 <b>지구형</b>이고, 천왕성과 목성은 둘 다 목성형이에요. 정답은 (나) 하나!<span class='xh'>오답 하나씩 격파</span>(가)를 골랐다면 천왕성의 '작은 존재감'에 속은 거예요 · 천왕성은 지구보다 4배나 큰 기체 행성이랍니다. (다)를 포함한 조합은 목성이 '행성의 왕'이라는 것만 봐도 탈락 · 목성형이라는 이름 자체가 목성에서 왔죠. 이 문제처럼 특징으로 행성을 알아낸 뒤 무리까지 나누는 2단 문제는, 동정을 먼저 끝내고 무리 판정은 마지막에 한꺼번에 하는 게 실수가 적어요.",
    core: "동정 먼저(천왕성·화성·목성) → 무리 판정. 지구형은 화성뿐!",
  },
  // [250 · d2 · multi 무①] 지구형 특징 모두 · v1 e37 조합 교체(궤도 위치 축 추가).
  // 검산: 정답 = "표면이 단단한 암석"(참) · "태양 가까운 안쪽 궤도"(참). 오답 = 고리 · 위성 수십 개 ·
  // 반지름 크다.
  {
    id: "u7e250",
    lessonId: "u7l2",
    type: "multi",
    diff: 2,
    prompt: "<b>지구형 행성</b>의 공통 특징으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "단단한 암석으로 된 표면을 가진다",
      "목성형 행성보다 태양에 가까운 궤도를 돈다",
      "모두 고리를 가지고 있다",
      "위성을 수십 개씩 거느린다",
      "목성형 행성보다 반지름이 크다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>지구형 행성(수성·금성·지구·화성)은 표면이 <b>단단한 암석</b>이라 밟고 설 땅이 있어요 ✓. 그리고 넷 모두 목성형 행성들보다 <b>태양에 가까운 안쪽 궤도</b>를 돌죠 ✓ · 수금지화 다음에 목토천해가 오는 순서 그대로예요.<span class='xh'>오답 하나씩 격파</span>'고리'는 정반대 · 고리는 목성형 네 행성의 공통 장비이고 지구형에는 하나도 없어요. '위성 수십 개'도 목성형 이야기 · 지구형은 지구 1개, 화성 2개가 전부이고 수성·금성은 아예 없죠. '반지름이 크다'도 뒤집혔어요 · 가장 큰 지구형(지구)조차 가장 작은 목성형(해왕성)의 4분의 1 크기랍니다. 지구형의 정체는 '작지만 단단한 안쪽 식구'로 묶어 기억하세요.",
    core: "지구형 = 암석 표면 + 안쪽 궤도. 고리·위성 부자는 목성형!",
  },
  // [254 · d1 · SP normal] 사진 가림판 ㉠㉡ · 광구·흑점 기호 대응(레슨 sunAnatomyFig 라벨판 대체).
  {
    id: "u7e254",
    lessonId: "u7l3",
    type: "mcq",
    diff: 1,
    prompt: "사진은 망원경으로 찍은 실제 태양이에요. ㉠(둥근 면 전체)과 ㉡(검은 점)의 이름을 차례대로 옳게 짝 지은 것은?",
    figure: sunLabelFig("normal"),
    figureDark: true,
    options: ["광구, 쌀알 무늬", "광구, 흑점", "코로나, 흑점", "채층, 홍염", "흑점, 광구"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>㉠은 우리가 맨눈으로 보는 태양의 둥글고 밝은 표면 · <b>광구</b>예요. ㉡은 광구 위에 나타나는 검은 점 · <b>흑점</b>이죠. 흑점은 주위보다 온도가 낮아 상대적으로 어둡게 보이는 부분이에요.<span class='xh'>오답 하나씩 격파</span>'쌀알 무늬'는 광구를 크게 확대해야 보이는 자글자글한 알갱이 무늬라, 이렇게 뚜렷한 검은 점과는 달라요. '코로나'와 '채층'은 태양의 <b>대기</b>여서 평소 사진에는 아예 담기지 않죠 · 광구가 너무 밝아 개기일식 때에만 드러나요. '흑점, 광구'는 순서를 뒤집은 함정 · ㉠이 면 전체, ㉡이 점이라는 그림 표시를 확인하면 걸리지 않아요.",
    core: "맨눈에 보이는 밝은 표면 = 광구, 그 위의 검은 점 = 흑점!",
  },
  // [256 · d2 · 사진 hinode] 확대 사진 (가) 판정 · 미4 함정(흑점=쌀알 오인) 계보.
  {
    id: "u7e256",
    lessonId: "u7l3",
    type: "mcq",
    diff: 2,
    prompt: "사진은 태양 표면을 크게 확대한 실제 관측 사진이에요. 가운데의 어두운 부분 (가)에 대한 설명으로 옳은 것은?",
    figure: pimg("sunspot_hinode.jpg", "자글자글한 알갱이 무늬 배경 한가운데에 크고 어두운 얼룩이 있는 태양 표면 확대 사진"),
    options: [
      "주위보다 온도가 낮아 어둡게 보인다",
      "광구에 뚫린 구멍이라 어둡게 보인다",
      "주위를 뒤덮은 쌀알 무늬의 한 알갱이이다",
      "태양의 대기에서 일어나는 현상이다",
      "주위보다 온도가 높아 검게 타 버린 부분이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)는 <b>흑점</b>이에요. 흑점이 검게 보이는 건 빛이 없어서가 아니라 주위 광구보다 <b>온도가 낮기</b> 때문 · 상대적으로 어두워 보일 뿐, 흑점만 떼어 놓고 보면 여전히 밝게 빛나는 부분이랍니다.<span class='xh'>오답 하나씩 격파</span>'구멍'은 흑점의 단골 오개념 · 뚫린 곳이 아니라 온도가 낮은 부분이에요. '쌀알 무늬의 한 알갱이'는 배경과 주인공을 혼동한 것 · (가) 둘레를 가득 채운 자글자글한 무늬가 쌀알 무늬이고, (가)는 그보다 훨씬 크고 뚜렷한 흑점이죠. '태양의 대기 현상'도 틀렸어요 · 흑점은 표면(광구)에 나타나요. '온도가 높아 검게 탔다'는 방향이 반대인 데다, 온도가 높으면 오히려 더 밝게 빛난답니다.",
    core: "흑점 = 주위보다 온도가 낮아 어두운 부분. 구멍 아님, 표면(광구) 소속!",
  },
  // [259 · d1 · 사진 corona] 코로나 정체+평소에 안 보이는 까닭.
  {
    id: "u7e259",
    lessonId: "u7l3",
    type: "mcq",
    diff: 1,
    prompt: "사진은 달이 태양을 완전히 가린 순간이에요. 검게 가려진 태양 둘레로 진주색 빛이 멀리까지 뻗어 있어요. 이 빛에 대한 설명으로 옳은 것은?",
    figure: pimg("eclipse_corona.jpg", "검은 원반 둘레로 희뿌연 빛줄기가 사방으로 멀리 뻗어 있는 실제 관측 사진"),
    options: [
      "코로나로, 평소에는 광구가 너무 밝아서 보이지 않는다",
      "코로나로, 태양이 아니라 달의 대기가 빛나는 것이다",
      "채층으로, 광구 바로 위를 얇게 덮은 대기층이다",
      "홍염으로, 물질이 불기둥처럼 솟아오른 것이다",
      "쌀알 무늬로, 표면이 끓어오르며 만든 무늬이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>진주색으로 멀리까지 뻗은 이 빛은 태양의 바깥 대기 <b>코로나</b>예요. 코로나는 <b>항상 그 자리에</b> 있지만 평소에는 광구가 압도적으로 밝아 묻혀 보이지 않다가, 개기일식으로 광구가 가려지는 순간 드러나요.<span class='xh'>오답 하나씩 격파</span>'달의 대기가 빛난다'는 주인을 잘못 짚은 함정이에요 · 가운데 검은 원반이 달인 건 맞지만, 달은 대기가 거의 없는 천체라 저렇게 빛날 대기 자체가 없어요. 이 빛의 주인은 어디까지나 태양이죠. '채층'은 광구 바로 위의 얇고 붉은 층이라, 이렇게 멀리 뻗는 진주빛과는 생김새부터 달라요. '홍염'은 가장자리에서 솟는 불기둥 모양이고, '쌀알 무늬'는 대기가 아니라 광구 표면의 무늬라 개기일식 사진과는 관계가 없죠.",
    core: "코로나는 늘 있다 · 개기일식은 '만드는' 게 아니라 '보여 주는' 순간!",
  },
  // [263 · d2 · 사진 whitelight bogi] 흑점 많은 시기 종합 · 천12 계보.
  // 검산: ㄱ 활발(참) · ㄴ 코로나 커짐(참) · ㄷ 오로라 드물어짐(거짓 · 잦아짐). 정답 ㄱ, ㄴ.
  {
    id: "u7e263",
    lessonId: "u7l3",
    type: "mcq",
    diff: 2,
    prompt: "사진은 어느 해에 관측한 태양이에요. 표면에 검은 점이 유난히 <b>많이</b> 보여요. 이 시기에 대한 옳은 설명을 <보기>에서 모두 고른 것은?",
    figure: pimg("sun_whitelight.jpg", "둥근 태양 전면 곳곳에 검은 점 무리가 많이 흩어져 있는 실제 관측 사진"),
    bogi: ["태양의 활동이 활발한 시기이다", "코로나의 크기가 커진다", "지구에서 오로라를 보기 어려워진다"],
    options: ["ㄱ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>흑점 수는 태양 활동의 <b>계기판</b>이에요. ㄱ ✓ 흑점이 많은 시기 = 태양 활동이 활발한 시기예요. ㄴ ✓ 활발한 시기에는 코로나가 더 크게 부풀고, 홍염과 플레어도 잦아지죠. ㄷ ✗ 활발한 시기에는 태양에서 날아오는 전기를 띤 입자가 늘어나 지구의 오로라가 더 <b>자주, 더 넓은 지역에서</b> 나타나요 · '보기 어려워진다'는 반대 서술이에요.<span class='xh'>오답 하나씩 격파</span>ㄷ을 참으로 착각했다면 흑점의 '어두움'을 태양이 식는 신호로 읽은 것일 수 있어요 · 흑점은 낮은 온도의 좁은 부분일 뿐, 흑점이 많다는 건 오히려 태양이 부산하게 활동한다는 뜻이랍니다. 흑점↑ = 코로나·홍염·플레어·오로라 전부 ↑, 한 세트로 기억하세요.",
    core: "흑점 많음 = 활동 활발: 코로나 커지고 홍염·플레어·오로라 잦아진다!",
  },
  // [266 · d2 · SG C창 bogi] 그래프 종합 · 극대 1979·1989 라벨 · 레슨 창(1990~2010) 회피.
  // 검산: ㄱ 극대 반복 간격 약 10~11년(참 · 1989-1979) · ㄴ 흑점 수 일정(거짓) · ㄷ 1989년 무렵
  // 활동 활발(참). 정답 ㄱ, ㄷ · 관례 순서 조합 보기에서 3번째.
  {
    id: "u7e266",
    lessonId: "u7l3",
    type: "mcq",
    diff: 2,
    prompt: "그래프는 여러 해 동안 관측한 흑점 수의 변화예요. 옳은 설명을 <보기>에서 모두 고른 것은?",
    figure: sunspotCycleFig({ y0: 1972, y1: 1994, peaks: [1979, 1989], dips: [1976, 1986] }),
    figureDark: true,
    bogi: [
      "흑점 수가 가장 많은 때가 일정한 간격으로 되풀이된다",
      "흑점 수는 해가 지나도 거의 변하지 않는다",
      "1989년 무렵은 태양의 활동이 활발한 시기였다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ ✓ 곡선의 산봉우리(1979년, 1989년)가 약 10년 간격으로 되풀이돼요 · 흑점 수는 일정한 주기로 늘었다 줄었다를 반복하죠. ㄷ ✓ 1989년은 산봉우리, 즉 흑점 수가 가장 많은 때이니 태양 활동이 <b>활발한</b> 시기예요.<span class='xh'>오답 하나씩 격파</span>ㄴ ✗ 그래프가 오르내리는 것 자체가 '거의 변하지 않는다'를 부정해요 · 골짜기(1976년, 1986년 무렵)와 산봉우리의 차이가 뚜렷하죠. 이런 그래프 문제의 요령은 두 가지예요. 첫째, 산봉우리끼리의 간격을 재서 주기를 읽는다. 둘째, 산봉우리 = 활발, 골짜기 = 잠잠으로 활동 상태를 번역한다. 흑점 수 그래프 하나로 태양의 컨디션 달력을 읽는 셈이랍니다.",
    core: "산봉우리 간격 = 주기, 산봉우리 = 활발한 시기. 그래프가 태양의 달력!",
  },
  // [275 · d2 · num · SG A창] 극대~극대 간격 판독 = 11년. 그래프 라벨 1957·1968 → 1968-1957 = 11.
  // v1 "2014+11" 회상형과 달리 그래프가 근거(미13 계보). 답 11 · 단위 년.
  {
    id: "u7e275",
    lessonId: "u7l3",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "년",
    prompt: "그래프는 흑점 수의 변화를 관측한 거예요. 흑점 수가 가장 많았던 때에서 다음으로 가장 많았던 때까지의 간격은 약 몇 <b>년</b>인가요? (그래프에서 읽어 계산)",
    figure: sunspotCycleFig({ y0: 1950, y1: 1972, peaks: [1957, 1968], dips: [1954, 1964] }),
    figureDark: true,
    answer: "11",
    explain:
      "<span class='xh'>정답 풀이</span>그래프에서 흑점 수가 가장 많은 산봉우리는 <b>1957년</b>과 <b>1968년</b>에 표시돼 있어요. 간격을 계산하면 ① 1968 − 1957 = <b>11</b> · 약 11년이에요. 흑점 수는 이렇게 약 11년을 주기로 늘었다 줄었다를 반복하고, 이 주기는 태양 활동이 활발해지는 때를 예측하는 근거가 되죠.<span class='xh'>오답 하나씩 격파</span>골짜기(1954년, 1964년 무렵)끼리 재도 약 10~11년으로 비슷하지만, 문제가 물은 것은 '가장 많았던 때' 사이의 간격이니 산봉우리의 연도를 읽어야 해요. 그래프 문제에서 숫자는 외운 값이 아니라 <b>곡선에서 읽은 값</b>으로 답하는 습관이 중요해요 · 이 그래프가 바로 그 근거 자료랍니다.",
    core: "주기는 그래프의 산봉우리 간격으로 읽는다: 1968 − 1957 = 약 11년!",
  },
  // [278 · d2 · multi 무①] 흑점 옳은 설명 모두 · v1 word·ㄱㄴㄷ 조합 회피.
  // 검산: 정답 = "주위보다 온도 낮음"(참) · "수가 시기에 따라 변함"(참). 오답 = 대기 현상 ·
  // 수 일정 · 온도 높음.
  {
    id: "u7e278",
    lessonId: "u7l3",
    type: "multi",
    diff: 2,
    prompt: "태양의 <b>흑점</b>에 대한 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "태양의 표면인 광구에서 나타난다",
      "흑점의 수는 시기에 따라 달라진다",
      "태양의 대기에서 나타나는 현상이다",
      "흑점의 수는 언제나 거의 일정하다",
      "주위보다 온도가 높은 부분이다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>흑점의 주소는 태양의 표면, 곧 <b>광구</b>예요 ✓. 그리고 흑점의 <b>수는 시기에 따라 달라져서</b>, 많아졌다 적어졌다를 약 11년 주기로 반복하죠 ✓ · 그래서 흑점 수가 태양 활동의 지표가 돼요.<span class='xh'>오답 하나씩 격파</span>'태양의 대기에서 나타난다'는 주소를 잘못 적었어요 · 채층·코로나 같은 대기에서 보이는 건 홍염이나 플레어이고, 흑점은 어디까지나 표면의 무늬죠. 첫 번째 보기와 세 번째 보기는 같은 질문의 참과 거짓 · 표면 팀과 대기 팀의 명단을 정리해 두면 헷갈리지 않아요. '수가 언제나 일정하다'는 흑점 수 그래프의 오르내림과 정면으로 어긋나요. '온도가 높다'는 반대 · 온도가 높으면 밝게 빛나야지 검게 보일 수가 없답니다.",
    core: "흑점 = 광구의 저온부, 수는 약 11년 주기로 변한다!",
  },
  // [281 · d1 · 사진 star-trails] 동심원 궤적 · 촬영 방법+원인 축(v1 "옳지 않은"·"방향 짝" 축 회피).
  {
    id: "u7e281",
    lessonId: "u7l4",
    type: "mcq",
    diff: 1,
    prompt: "사진처럼 별들이 긴 원호를 그린 밤하늘 사진을 얻으려고 해요. 촬영 방법과 원호가 생기는 까닭을 옳게 짝 지은 것은?",
    figure: ximg("star-trails.webp", "밤하늘의 별들이 한 점을 중심으로 여러 겹의 동심원 호를 그린 장노출 사진"),
    options: [
      "카메라를 고정하고 오래 촬영한다, 지구가 자전하기 때문",
      "카메라를 고정하고 오래 촬영한다, 별이 실제로 지구 둘레를 돌기 때문",
      "카메라를 빠르게 돌리며 촬영한다, 지구가 자전하기 때문",
      "한순간만 촬영한다, 별빛이 원 모양으로 퍼지기 때문",
      "카메라를 고정하고 오래 촬영한다, 지구가 공전하기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>카메라를 <b>고정</b>해 두고 오랫동안 촬영하면, 하늘의 별들이 조금씩 이동한 흔적이 호로 이어져요. 별이 도는 것처럼 보이는 원인은 <b>지구의 자전</b> · 지구가 하루에 한 바퀴 돌기 때문에 별이 반대로 도는 것처럼 보이는 겉보기 운동(일주 운동)이죠.<span class='xh'>오답 하나씩 격파</span>'별이 실제로 돈다'는 일주 운동의 대표 오개념 · 도는 건 별이 아니라 지구예요. '카메라를 돌리며 촬영'하면 별이 아니라 온 화면이 흔들린 사진이 나오고, '한순간 촬영'은 점으로 찍힐 뿐 호가 생길 시간이 없어요. '공전 때문'은 주기를 착각한 것 · 하룻밤 사이의 회전은 하루 주기인 자전의 몫이고, 공전은 1년에 걸친 변화를 만든답니다.",
    core: "고정 + 장노출 = 일주 운동 궤적. 원인은 별이 아니라 지구의 자전!",
  },
  // [283 · d2 · SK 서쪽] 서쪽 하늘 궤적 판독 · 오른쪽 아래로 비스듬히 진다.
  {
    id: "u7e283",
    lessonId: "u7l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 우리나라에서 어느 방향 하늘을 오랫동안 관측해 기록한 별의 움직임이에요. 이에 대한 설명으로 옳은 것은?",
    figure: skyTrailFig({ dir: "w", hideLabel: true }),
    figureDark: true,
    options: [
      "서쪽 하늘이고, 별들이 지평선 아래로 비스듬히 지고 있다",
      "동쪽 하늘이고, 별들이 지평선 위로 비스듬히 떠오르고 있다",
      "북쪽 하늘이고, 별들이 한 점을 중심으로 돌고 있다",
      "남쪽 하늘이고, 별들이 지평선과 나란하게 흐르고 있다",
      "서쪽 하늘이고, 별들이 제자리에서 깜빡이고 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>궤적이 오른쪽 <b>아래</b>, 지평선 쪽으로 비스듬히 기울어 있어요 · 별들이 지고 있다는 뜻이니 여기는 <b>서쪽 하늘</b>이에요. 지평선을 향해 내려가는 화살표 방향이 그 증거죠.<span class='xh'>오답 하나씩 격파</span>'동쪽 하늘'이라면 궤적이 반대로 지평선에서 위로 떠오르는 방향이어야 해요 · 기울기는 닮았지만 진행 방향이 반대죠. '북쪽 하늘'은 북극성을 중심으로 한 동심원 궤적이 나와야 하고, '남쪽 하늘'은 지평선과 나란한 수평 궤적이라 비스듬히 가라앉는 이 그림과 달라요. '제자리에서 깜빡인다'는 일주 운동 자체를 부정하는 설명이고요. 방향별 궤적은 동 = 비스듬히 ↗ 떠오름, 남 = 수평 →, 서 = 비스듬히 ↘ 짐, 북 = 반시계 동심원으로 세트로 외워 두면 사진·그림 문제가 전부 풀려요.",
    core: "비스듬히 내려가면 서쪽 하늘! 동↗·남→·서↘·북 동심원.",
  },
  // [287 · d2 · SS2] 2시간 뒤 위치 · 반시계 30°(시간당 15°는 그림 조건이 아니라 지식 · 위치로 검사).
  // 검산: fromDeg 150 · 정답 = +30(반시계) = ㉡. ㉠은 시계 방향 30(미끼) · ㉢ +60(4시간) ·
  // ㉣ -60 · ㉤ +90(6시간). shuffle:false · 정답 2번째 ✓.
  {
    id: "u7e287",
    lessonId: "u7l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 북쪽 하늘의 별 A예요(눈금 간격 30°). 지금부터 <b>2시간 뒤</b>, 별 A는 ㉠~㉤ 중 어느 자리에 있을까요?",
    figure: starSpinChoiceFig({ fromDeg: 150, offsets: [-30, 30, 60, -60, 90] }),
    figureDark: true,
    options: ["㉠", "㉡", "㉢", "㉣", "㉤"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>북쪽 하늘의 별은 북극성을 중심으로 <b>시계 반대 방향</b>, 한 시간에 약 15°씩 도는 것처럼 보여요. ① 2시간이면 15° × 2 = 30° ② 그림 눈금 한 칸이 30°이니, A에서 시계 반대 방향으로 <b>한 칸</b> 이동한 ㉡이 정답이에요.<span class='xh'>오답 하나씩 격파</span>㉠은 거리(한 칸)는 맞지만 시계 방향으로 간 자리 · 회전 방향을 뒤집으면 걸리는 함정이에요. ㉢은 반시계 두 칸(60°)이라 4시간 뒤, ㉤은 세 칸(90°)이라 6시간 뒤의 자리죠. ㉣은 시계 방향으로 두 칸이라 방향·시간이 모두 어긋나요. 이런 문제는 '방향 먼저(반시계), 거리 다음(15° × 시간)' 두 단계로 끊어 풀면 정확하답니다.",
    core: "북쪽 하늘은 반시계로 시간당 15° · 방향 먼저, 칸 수는 그다음!",
  },
  // [291 · d2 · ZE] 태양 쪽 별자리 · earthDeg 210(염소 앞): 태양 쪽 = 쌍둥이 · 한밤 남쪽 = 염소.
  // 레슨 양↔천칭 · v1 사자·물병 짝 회피 ✓.
  {
    id: "u7e291",
    lessonId: "u7l4",
    type: "mcq",
    diff: 2,
    prompt: "그림은 태양 둘레의 열두 별자리와 지구의 위치예요. 이날 <b>태양과 같은 쪽에 있어서 볼 수 없는</b> 별자리는?",
    figure: zodiacExamFig({ earthDeg: 210 }),
    figureDark: true,
    options: ["쌍둥이자리", "염소자리", "궁수자리", "양자리", "사자자리"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>지구에서 태양 방향으로 그은 점선을 따라가면, 태양 <b>건너편</b>에 닿는 별자리가 쌍둥이자리예요. 태양과 같은 쪽 하늘에 있는 별자리는 태양 빛이 너무 밝아 볼 수 없으니, 이날 못 보는 별자리는 <b>쌍둥이자리</b>죠.<span class='xh'>오답 하나씩 격파</span>궁수자리는 정반대예요 · 그림에서 지구의 등 뒤(태양 반대쪽)에 있어서 <b>한밤중 남쪽 하늘</b>에서 가장 잘 보이는 별자리랍니다. 염소자리는 그 궁수자리 옆이라 역시 밤하늘에서 볼 수 있는 쪽이고, 양자리와 사자자리는 태양 방향에서 비켜나 있어 초저녁이나 새벽 하늘에서 만날 수 있어요. 그림에서 '지구 → 태양 → 그 너머'로 이어지는 직선 하나만 그으면 못 보는 별자리가 바로 나온다는 것, 이게 이 유형의 핵심 기술이에요.",
    core: "못 보는 별자리 = 지구에서 태양 너머 쪽. 한밤 남쪽 = 그 정반대!",
  },
  // [295 · d1 · EO] 한밤 관측자 · C(왼쪽 · 태양 반대). shuffle:false · 정답 3번째 ✓.
  {
    id: "u7e295",
    lessonId: "u7l4",
    type: "mcq",
    diff: 1,
    prompt: "그림은 북극 위에서 내려다본 지구예요(햇빛은 오른쪽에서). A~D 중 <b>한밤중</b>인 관측자는?",
    figure: earthDayNightFig(),
    figureDark: true,
    options: ["A", "B", "C", "D", "네 곳 모두 낮이다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>햇빛이 오른쪽에서 들어오니 지구의 오른쪽 절반이 낮, 왼쪽 절반이 밤이에요. 태양의 정반대 쪽인 <b>C</b>가 한밤중이죠. 지구가 자전하면서 모든 지역이 낮과 밤을 번갈아 지나게 되는 거예요.<span class='xh'>오답 하나씩 격파</span>A는 태양을 정면으로 마주한 자리라 한낮이에요. B와 D는 낮과 밤의 경계에 있는데, 자전 방향(시계 반대)을 따라가 보면 B는 밝은 쪽에서 어두운 쪽으로 넘어가는 <b>해 질 무렵</b>, D는 어두운 쪽에서 밝은 쪽으로 들어서는 <b>해 뜰 무렵</b>이랍니다. '네 곳 모두 낮'은 지구의 절반만 햇빛을 받는다는 기본과 어긋나요. 이 그림 하나로 하루의 네 장면(정오 A, 저녁 B, 자정 C, 새벽 D)을 전부 읽을 수 있어요.",
    core: "태양 정반대 = 한밤. 자전 방향을 따라가면 저녁·새벽 자리도 보인다!",
  },
  // [299 · d1 · multi 무①] 자전 현상 모두 · 정답 = 낮밤 교대 · 일주 운동. 미끼에 달 위상 추가(신작).
  {
    id: "u7e299",
    lessonId: "u7l4",
    type: "multi",
    diff: 1,
    prompt: "지구의 <b>자전</b> 때문에 나타나는 현상을 <b>모두</b> 고르세요.",
    options: [
      "낮과 밤이 번갈아 나타난다",
      "별들이 북극성 둘레를 하루에 한 바퀴 도는 것처럼 보인다",
      "계절마다 한밤에 보이는 별자리가 달라진다",
      "태양이 1년에 걸쳐 별자리 사이를 이동하는 것처럼 보인다",
      "달의 모양이 한 달을 주기로 달라진다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>구분 기준은 <b>주기</b>예요. 하루 만에 되풀이되는 변화라면 자전의 몫이죠. 낮과 밤의 교대 ✓, 별이 북극성 둘레를 하루 한 바퀴 도는 것처럼 보이는 일주 운동 ✓ · 둘 다 하루짜리 변화이니 자전 때문이에요.<span class='xh'>오답 하나씩 격파</span>'계절별 별자리'와 '태양의 1년 이동(연주 운동)'은 1년에 걸친 변화 · 지구가 태양 둘레를 도는 <b>공전</b> 때문이에요. '달의 모양 변화'는 지구의 운동이 아니라 <b>달이 지구를 공전</b>하기 때문에 생기는 한 달짜리 변화라, 자전·공전 어느 쪽에 넣어도 틀려요. 하루 = 자전, 1년 = 공전, 한 달 = 달의 공전 · 주기로 원인을 가르는 이 잣대가 이 단원 판별 문제의 만능 열쇠랍니다.",
    core: "주기가 기준: 하루짜리 변화(낮밤·일주)만 자전의 몫!",
  },
  // [305 · d3 · 무⑤ 학생 대화] 연주 방향 · 도윤(동→서 · 거짓) 아린(서→동 하루 1° · 참) 세아(자전
  // 원인 · 거짓). shuffle:false 대화 순서 관례 · 정답 2번째 ✓. v1 대화 구성·이름 회피.
  {
    id: "u7e305",
    lessonId: "u7l4",
    type: "mcq",
    diff: 3,
    prompt: "태양의 연주 운동을 두고 세 학생이 말했어요. <b>옳게</b> 말한 학생은?<br><br>도윤: \"태양은 별자리 사이를 동에서 서로 옮겨 가.\"<br>아린: \"태양은 별자리 사이를 하루 약 1°씩 서에서 동으로 옮겨 가.\"<br>세아: \"이 겉보기 움직임은 지구의 자전 때문에 생겨.\"",
    options: ["도윤", "아린", "세아", "도윤, 세아", "아린, 세아"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>옳게 말한 학생은 <b>아린</b>이에요. 지구가 공전 궤도를 따라 움직이면 태양이 배경 별자리 사이를 하루 약 1°씩, <b>서에서 동으로</b> 옮겨 가는 것처럼 보여요 · 1년이면 360°, 제자리로 돌아오죠. 이게 태양의 연주 운동이에요.<span class='xh'>오답 하나씩 격파</span>도윤은 방향을 뒤집었어요 · '동에서 서'는 하루 동안 태양이 뜨고 지는 <b>일주 운동</b>의 방향이라, 별자리를 배경으로 한 1년짜리 이동과 혼동하기 쉬운 지점이죠. 세아는 원인을 잘못 짚었어요 · 연주 운동은 1년에 걸친 변화이니 자전이 아니라 <b>공전</b>의 몫이에요. 하루 주기 겉보기(동→서)는 자전, 1년 주기 겉보기(서→동)는 공전 · 방향과 주기를 쌍으로 묶어 기억하면 두 함정을 한 번에 피할 수 있답니다.",
    core: "연주 운동 = 서→동, 하루 1°, 원인은 공전. 동→서 하루 주기는 일주!",
  },
  // [308 · d1 · 무①] 위상 변화의 까닭 · 지구 그림자 오개념 격파(v1 e81 보기 구성 교체).
  {
    id: "u7e308",
    lessonId: "u7l5",
    type: "mcq",
    diff: 1,
    prompt: "달의 모양(위상)이 날마다 조금씩 달라 보이는 까닭으로 옳은 것은?",
    options: [
      "달이 지구 주위를 돌면서, 밝은 면이 우리에게 보이는 정도가 달라지기 때문",
      "지구의 그림자가 달을 조금씩 가리기 때문",
      "달의 실제 모양이 부풀었다 줄었다 하기 때문",
      "달이 내는 빛의 세기가 날마다 달라지기 때문",
      "구름이 달의 일부를 가리는 날이 많기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>달은 언제나 <b>태양 쪽 절반만</b> 밝아요. 그런데 달이 지구 주위를 <b>공전</b>하면서 태양·지구·달의 상대적인 위치가 바뀌고, 그 밝은 절반이 우리 눈에 보이는 정도가 달라져요 · 이것이 위상 변화의 정체예요.<span class='xh'>오답 하나씩 격파</span>'지구의 그림자'는 이 단원 최대의 오개념이에요 · 지구 그림자가 달을 가리는 건 <b>월식</b>이라는 특별한 날의 사건이고, 매일의 위상 변화와는 원인이 완전히 달라요. '실제 모양이 변한다'는 착시를 실체로 오해한 것 · 달은 늘 같은 공 모양이죠. '빛의 세기'는 출발부터 틀렸어요 · 달은 스스로 빛나지 않고 태양 빛을 반사할 뿐이에요. '구름'은 날씨 이야기일 뿐, 맑은 날에도 위상은 어김없이 변한답니다.",
    core: "위상 변화 = 달의 공전으로 보는 각도가 변하는 것. 지구 그림자는 월식!",
  },
  // [311 · d2 · MP8] ④ 위치 모양 · 상현(③)과 망(⑤) 사이 = 오른쪽 볼록달(v1 ③⑤② 축 회피).
  // 검산: 햇빛 오른쪽 · ④ = 위 왼쪽 45° 자리 → 밝은 반구의 4분의 3쯤 보임 · 오른쪽이 부푼 볼록달.
  {
    id: "u7e311",
    lessonId: "u7l5",
    type: "mcq",
    diff: 2,
    prompt: "그림은 달의 공전 궤도 여덟 위치예요(햇빛은 오른쪽에서). 달이 <b>④ 위치</b>에 있을 때 지구에서 보이는 모양은?",
    figure: moonPhase8Fig(),
    figureDark: true,
    options: [
      "오른쪽이 넓게 부풀어 보름에 가까운 볼록한 달",
      "오른쪽 절반만 밝은 반달",
      "왼쪽 절반만 밝은 반달",
      "오른쪽 가장자리만 가늘게 밝은 조각달",
      "온 면이 둥글게 밝은 보름달",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>④는 상현 자리(③)와 망 자리(⑤)의 <b>사이</b>예요. ③에서 오른쪽 절반이 보였고 ⑤에서 온 면이 보이니, 그 중간인 ④에서는 절반보다 많고 온 면보다는 적은 · <b>오른쪽이 넓게 부푼 볼록한 달</b>이 보여요.<span class='xh'>오답 하나씩 격파</span>'오른쪽 반달'은 한 정거장 전인 ③(상현)의 모습이고, '보름달'은 다음 정거장 ⑤(망)의 모습이에요 · ④는 그 사이라서 둘 다 정답이 될 수 없죠. '왼쪽 반달'(하현)은 궤도 반대편 ⑦의 몫이고, '오른쪽 가는 조각달'(초승)은 ② 근처의 모습이라 태양 쪽에 훨씬 가까워야 해요. 궤도 문제는 대표 네 자리(①삭·③상현·⑤망·⑦하현)를 먼저 박아 두고, 사이 위치는 '앞뒤 정거장의 중간 모양'으로 읽으면 전부 풀린답니다.",
    core: "④ = 상현과 망 사이 → 오른쪽이 부푼 볼록달. 대표 4자리부터 고정!",
  },
  // [313 · d2 · MO] C 위치(태양 반대) · 망 + 음력 15일. 라벨 [A오른쪽·B위·C왼쪽·D아래].
  {
    id: "u7e313",
    lessonId: "u7l5",
    type: "mcq",
    diff: 2,
    prompt: "그림은 달의 공전 궤도 네 자리예요(햇빛은 오른쪽에서). 달이 <b>C</b>에 있을 때의 위상과 그 무렵의 음력 날짜를 옳게 짝 지은 것은?",
    figure: moonPosFig({ labels: ["A", "B", "C", "D"] }),
    figureDark: true,
    options: [
      "보름달, 음력 15일 무렵",
      "보이지 않는 달(삭), 음력 1일 무렵",
      "오른쪽 반달(상현), 음력 7~8일 무렵",
      "왼쪽 반달(하현), 음력 22~23일 무렵",
      "보름달, 음력 1일 무렵",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>C는 지구를 사이에 두고 태양의 <b>정반대</b>에 있는 자리예요. 이때 달의 밝은 절반이 우리를 정면으로 향해 온 면이 다 보여요 · <b>보름달(망)</b>이죠. 보름달은 이름 그대로 <b>음력 15일(보름)</b> 무렵에 떠요.<span class='xh'>오답 하나씩 격파</span>'삭, 음력 1일'은 정반대 자리인 A(태양 쪽)의 짝이에요 · 밝은 면이 모두 태양 쪽을 향해 지구에선 보이지 않죠. '상현, 7~8일'은 B(위), '하현, 22~23일'은 D(아래)의 짝이고요. '보름달, 음력 1일'은 모양은 맞혔지만 날짜가 어긋난 조합 · 음력 날짜는 달의 위상을 그대로 따라가는 달력이라, 1일 = 삭, 15일 = 망이라는 대응이 흔들리지 않아요. 위치·위상·음력 셋을 한 줄로 잇는 연습이 이 유형의 정석이랍니다.",
    core: "태양 반대(C) = 망 = 음력 15일. 위치·위상·음력은 한 세트!",
  },
  // [315 · d3 · MO] 좌우 반전 격파 · B(위) = 상현 자리(햇빛 오른쪽 · 반시계). 미9 계보.
  {
    id: "u7e315",
    lessonId: "u7l5",
    type: "mcq",
    diff: 3,
    prompt: "한 학생이 그림의 <b>B 위치</b>에 있는 달을 \"왼쪽 반원이 밝은 반달로 보인다\"라고 설명했어요. 이 설명에 대한 판단으로 옳은 것은?",
    figure: moonPosFig({ labels: ["A", "B", "C", "D"] }),
    figureDark: true,
    options: [
      "틀렸다, 오른쪽 반원이 밝은 반달(상현)로 보인다",
      "옳다, B는 왼쪽 반원이 밝은 하현 자리다",
      "틀렸다, 온 면이 밝은 보름달로 보인다",
      "틀렸다, 밝은 면이 태양 쪽을 향해 보이지 않는다",
      "틀렸다, 오른쪽 가장자리만 가늘게 밝은 초승달로 보인다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>햇빛이 오른쪽에서 들어오니 B(궤도 위쪽)에 있는 달은 오른쪽 절반이 밝아요. 지구에서 올려다보면 <b>오른쪽 반원이 밝은 상현달</b>로 보이죠 · 학생은 좌우를 뒤집어 말한 거예요.<span class='xh'>오답 하나씩 격파</span>'옳다(하현 자리)'를 골랐다면 상현·하현의 자리를 통째로 바꿔 기억한 것 · 왼쪽 반원이 밝은 하현은 궤도 <b>아래쪽</b>(D)의 몫이에요. '보름달'은 태양 반대편(C), '보이지 않는다(삭)'는 태양 쪽(A)의 이야기라 자리부터 달라요. '초승달'은 A와 B 사이쯤에서 보이는 모습이고요. 상현↔하현 좌우 바꿔치기는 이 단원 최다 출제 함정이라, '햇빛 오른쪽 그림에서 위 = 오른쪽 반달(상현)'을 기준 문장으로 못 박아 두는 게 안전해요.",
    core: "햇빛 오른쪽 그림: 위 자리 = 오른쪽 반달(상현). 왼쪽 반달은 아래(하현)!",
  },
  // [319 · d2 · 사진 crescent] 차오르는 방향 · 오른쪽부터(v1 "옳은 설명" 축과 분리).
  {
    id: "u7e319",
    lessonId: "u7l5",
    type: "mcq",
    diff: 2,
    prompt: "사진은 초저녁에 본 달이에요. 오른쪽 가장자리만 가늘게 밝아요. 앞으로 보름달이 될 때까지, 달의 밝은 부분은 어떻게 변해 갈까요?",
    figure: ximg("crescent-moon.webp", "오른쪽 가장자리만 가늘게 밝은 조각달이 어두운 하늘에 떠 있는 사진"),
    options: [
      "오른쪽부터 점점 넓어져 오른쪽 반달을 거쳐 보름달이 된다",
      "왼쪽부터 점점 넓어져 왼쪽 반달을 거쳐 보름달이 된다",
      "밝은 부분이 점점 줄어들어 사라졌다가 갑자기 보름달이 된다",
      "가는 조각 모양 그대로 크기만 커져 보름달이 된다",
      "위쪽부터 차올라 위 반달을 거쳐 보름달이 된다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>오른쪽 가장자리가 밝은 이 달은 <b>초승달</b> · 삭을 막 지난 달이에요. 이후 달이 공전을 이어 가면 밝은 부분이 <b>오른쪽에서 왼쪽으로</b> 점점 넓어져요. 초승 → 오른쪽 반달(상현) → 오른쪽이 부푼 볼록달 → 보름달 순서죠.<span class='xh'>오답 하나씩 격파</span>'왼쪽부터'는 차오름과 이지러짐을 바꿔치기한 함정 · 왼쪽 반달(하현)은 보름달을 지나 <b>줄어드는</b> 길목에서 만나는 모습이에요. '줄어들다 갑자기 보름'은 순서를 건너뛰는 마법이라 자연에 없고, '조각 모양 그대로 커진다'는 위상이 모양의 변화라는 사실과 어긋나요. '위쪽부터'는 방향 자체가 틀렸죠. 차오를 땐 오른쪽부터, 이지러질 땐 오른쪽부터 어두워져요 · 늘 오른쪽이 먼저랍니다.",
    core: "초승달 → 오른쪽부터 차올라 상현 → 보름. 왼쪽 반달은 줄어드는 길!",
  },
  // [329 · d2 · multi 무①] 위상 옳은 설명 모두 · 정답 = 한 달 주기 · 공전 원인(v1 조합 교체).
  {
    id: "u7e329",
    lessonId: "u7l5",
    type: "multi",
    diff: 2,
    prompt: "달의 <b>위상 변화</b>에 대한 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "약 한 달을 주기로 같은 순서가 되풀이된다",
      "달이 지구 주위를 공전하기 때문에 생긴다",
      "지구의 그림자가 달을 가리기 때문에 생긴다",
      "달의 실제 모양이 달라지는 현상이다",
      "위상이 변하는 순서는 그때그때 달라진다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>위상 변화는 삭 → 초승 → 상현 → 망 → 하현 → 그믐의 순서로 <b>약 한 달</b>마다 되풀이돼요 ✓. 원인은 <b>달의 공전</b> · 태양·지구·달의 상대 위치가 돌면서 밝은 면이 보이는 정도가 변하는 거죠 ✓.<span class='xh'>오답 하나씩 격파</span>'지구의 그림자'는 월식의 원인이지 매일의 위상 변화와는 무관해요 · 위상은 그림자 없이도 위치 관계만으로 생긴답니다. '실제 모양이 달라진다'는 겉보기와 실체의 혼동 · 달은 늘 같은 공 모양이고 보이는 부분만 달라져요. '순서가 그때그때 다르다'는 주기 현상의 성질과 정반대 · 순서는 언제나 같아서, 오늘 위상만 알면 일주일 뒤 모양까지 예측할 수 있어요.",
    core: "위상 = 달의 공전이 만드는 한 달 주기 현상. 순서는 늘 같다!",
  },
  // [334 · d1 · EA solar] 배열 판정 · 태양·달·지구 차례 = 일식 · 가려지는 것은 태양.
  {
    id: "u7e334",
    lessonId: "u7l6",
    type: "mcq",
    diff: 1,
    prompt: "그림처럼 태양, 달, 지구가 한 줄로 늘어섰어요. 이 배치에서 일어날 수 있는 현상과 이때 가려지는 천체를 옳게 짝 지은 것은?",
    figure: eclipseAlignFig({ kind: "solar" }),
    figureDark: true,
    options: [
      "일식, 태양이 가려진다",
      "월식, 달이 가려진다",
      "일식, 달이 가려진다",
      "월식, 태양이 가려진다",
      "일식과 월식이 동시에 일어난다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>배열이 태양 - <b>달</b> - 지구 차례예요. 달이 태양과 지구 사이에 끼어들어 <b>태양을 가리는</b> 현상, 즉 <b>일식</b>이 일어날 수 있는 배치죠. '일식'의 일(日)이 해를 뜻하니, 가려지는 쪽도 태양이에요.<span class='xh'>오답 하나씩 격파</span>'월식'이 되려면 달이 지구 <b>바깥쪽</b>, 그러니까 태양 - 지구 - 달 순서여야 해요 · 지구의 그림자 속에 달이 들어가야 하니까요. '일식, 달이 가려진다'는 이름과 대상이 어긋난 조합 · 식(蝕) 현상의 이름은 <b>가려지는 천체</b>를 따라 붙어요. '동시에 일어난다'는 불가능해요 · 한 배열에서 가운데 낀 천체는 하나뿐이니, 일식과 월식은 같은 순간에 함께 일어날 수 없답니다.",
    core: "태양-달-지구 = 일식(태양이 가려짐). 이름은 가려지는 천체를 따른다!",
  },
  // [337 · d2 · EA tilt] 삭인데 일식이 없는 까닭 · 궤도 기울어짐(수치 5° 미출제 · 이유 판정만).
  {
    id: "u7e337",
    lessonId: "u7l6",
    type: "mcq",
    diff: 2,
    prompt: "그림은 달이 삭의 자리에 온 날이에요. 그런데도 이날 일식이 일어나지 <b>않았어요</b>. 그 까닭으로 옳은 것은?",
    figure: eclipseAlignFig({ kind: "solar", tilt: true }),
    figureDark: true,
    options: [
      "달의 공전 궤도가 기울어져 있어, 달의 그림자가 지구를 비껴갔기 때문",
      "달이 너무 작아서 태양을 가릴 수 없기 때문",
      "삭인 날에는 달이 지구에서 가장 멀어지기 때문",
      "지구가 자전하면서 그림자를 피해 돌기 때문",
      "삭인 날 달은 밤하늘에만 떠 있기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>달의 공전 궤도는 지구의 공전 궤도면과 <b>나란하지 않고 조금 기울어져</b> 있어요. 그래서 삭이 되어도 그림처럼 달이 일직선에서 살짝 비켜나, 달의 그림자가 지구 위나 아래로 <b>비껴가는</b> 달이 대부분이에요. 삭·망은 매달 오지만 일식·월식이 드문 이유가 바로 이거죠.<span class='xh'>오답 하나씩 격파</span>'달이 너무 작다'면 일식은 영영 없어야 하는데, 실제로는 궤도가 정렬되는 날 개기일식까지 일어나요 · 달의 겉보기 크기는 태양을 가리기에 충분해요. '삭에 가장 멀어진다'는 근거 없는 설명이고, '자전으로 그림자를 피한다'는 지구 자전과 그림자의 위치는 별개 문제라 성립하지 않아요. '삭인 날 달은 밤하늘에만'은 반대예요 · 삭의 달은 태양과 같은 쪽이라 <b>낮 하늘</b>에 함께 떠 있답니다.",
    core: "달 궤도가 기울어져 그림자가 대개 비껴간다 · 그래서 일식은 드물다!",
  },
  // [341 · d2 · EP solar] 진행 다음 컷 · 오른쪽부터 가려짐(근거: 달의 서→동 공전). 정답 ② ·
  // shuffle:false. ③⑤ = 왼쪽부터(방향 미끼) · ① = 되돌아감 · ④ = 그대로.
  {
    id: "u7e341",
    lessonId: "u7l6",
    type: "mcq",
    diff: 2,
    prompt: "그림 (가), (나)는 일식이 진행되는 모습을 차례로 그린 거예요(남쪽 하늘 기준). 바로 다음에 올 모습으로 옳은 것은?",
    figure: eclipseProgressFig({ kind: "solar" }),
    figureDark: true,
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>(가)에서 태양의 <b>오른쪽</b>이 살짝 가려지고, (나)에서 오른쪽이 절반 가까이 가려졌어요 · 달이 태양의 오른쪽(서쪽)에서부터 파고들며 진행 중이죠. 다음 순간은 오른쪽이 <b>더 깊게</b> 가려진 ②예요. 일식이 태양의 오른쪽부터 가려지는 까닭은 달이 하늘에서 <b>서에서 동으로</b> 공전하며 태양을 따라잡기 때문이에요.<span class='xh'>오답 하나씩 격파</span>①은 다시 온전해진 태양이라 진행을 거꾸로 돌린 모습이고, ④는 (가)와 같은 단계라 시간이 멈춘 셈이에요. ③과 ⑤는 <b>왼쪽</b>이 가려진 모습 · 진행 방향을 통째로 뒤집은 함정으로, 월식(달의 왼쪽부터)과 헷갈리게 만드는 단골 미끼랍니다. 진행 문제는 '어느 쪽이 먼저 먹혔나'를 (가)에서 확인하고 그 방향을 밀고 나가면 돼요.",
    core: "일식은 태양 오른쪽(서쪽)부터 · 달이 서→동으로 공전하며 따라잡기 때문!",
  },
  // [343 · d1 · 사진 red-moon] 개기월식 동정 · 현상 이름 + 달의 위치.
  {
    id: "u7e343",
    lessonId: "u7l6",
    type: "mcq",
    diff: 1,
    prompt: "사진은 어느 날 밤 관측된 달이에요. 보름달이 검붉게 물들어 있어요. 이 현상의 이름과 이때 달의 위치를 옳게 짝 지은 것은?",
    figure: ximg("red-moon.webp", "둥근 달 전체가 검붉은 색으로 어둡게 물들어 있는 밤하늘 사진"),
    options: [
      "개기월식, 달이 지구의 그림자 속에 들어가 있다",
      "개기일식, 달이 태양과 지구 사이에 있다",
      "부분월식, 달이 지구 그림자의 가장자리에 걸쳐 있다",
      "개기월식, 달이 태양과 지구 사이에 있다",
      "부분일식, 달이 태양의 일부를 가리고 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>보름달 <b>전체</b>가 검붉게 물든 모습은 <b>개기월식</b>이에요. 달이 지구의 그림자 속에 <b>통째로</b> 들어간 순간으로, 이때 지구 대기를 지나며 꺾인 붉은빛이 달에 닿아 완전히 사라지는 대신 붉게 보여요.<span class='xh'>오답 하나씩 격파</span>'개기일식'은 태양이 가려지는 낮의 현상이라, 밤하늘의 붉은 달과는 주인공부터 달라요. '부분월식'이라면 달의 <b>일부만</b> 어둡게 깎여 보여야 하는데 사진은 온 면이 물들어 있죠. '개기월식인데 달이 태양과 지구 사이'는 이름과 위치가 모순된 조합 · 그 위치는 삭, 즉 일식의 자리예요. 월식은 언제나 태양 - 지구 - 달 배열, 즉 달이 지구 그림자 쪽(망의 자리)에 있을 때 일어난답니다.",
    core: "온 면이 붉은 달 = 개기월식 = 달이 지구 그림자 속(망의 자리)!",
  },
  // [345 · d1 · 사진 corona(2)] 개기일식 조건 · L3 259(대기 정체)와 축 분리: 현상의 때·위상.
  {
    id: "u7e345",
    lessonId: "u7l6",
    type: "mcq",
    diff: 1,
    prompt: "사진은 개기일식의 순간이에요. 이날에 대한 설명으로 옳은 것은?",
    figure: pimg("eclipse_corona.jpg", "검게 가려진 둥근 태양 둘레로 밝은 빛이 퍼져 나가는 하늘 사진"),
    options: [
      "한낮인데도 하늘이 어두워지며, 이날 달의 위상은 삭이다",
      "한낮인데도 하늘이 어두워지며, 이날 달의 위상은 망이다",
      "밤에만 볼 수 있는 현상이다",
      "이날 지구의 낮 지역 어디에서나 이 모습을 볼 수 있다",
      "달이 지구의 그림자 속에 들어간 순간이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>개기일식은 달이 태양을 완전히 가리는 순간이라, <b>한낮의 하늘이 갑자기 어두워지는</b> 극적인 현상이에요. 이때 달은 태양과 지구 <b>사이</b>에 있으니 위상으로는 <b>삭</b> · 지구에서 보이지 않는 달이 태양 앞을 지나는 거죠.<span class='xh'>오답 하나씩 격파</span>'망'은 정반대 자리 · 망의 달은 태양 반대편에 있어서 태양을 가릴 수 없어요(망에 일어나는 건 월식). '밤에만 볼 수 있다'는 모순이에요 · 태양이 떠 있는 <b>낮</b>이어야 태양이 가려지는 걸 볼 수 있죠. '낮 지역 어디서나'는 함정 · 개기일식은 달의 짙은 그림자가 닿는 <b>좁은 지역</b>에서만 보여요. '지구의 그림자에 달이 들어간다'는 월식의 설명이라 주어가 바뀌었답니다.",
    core: "개기일식 = 낮이 어두워지는 순간, 달의 위상은 삭. 보이는 지역은 좁다!",
  },
  // [353 · d3 · 무⑤] 오개념 2연 격파 · 비상 Q6 ㄱ("안 보인다")·ㄴ("낮 어디서나") 계보.
  {
    id: "u7e353",
    lessonId: "u7l6",
    type: "mcq",
    diff: 3,
    prompt: "일식과 월식에 대한 설명으로 옳은 것은?",
    options: [
      "개기월식 때 달은 완전히 사라져 보이는 것이 아니라 붉게 보인다",
      "개기월식 때 달은 아무것도 보이지 않게 된다",
      "일식은 낮인 지역이라면 어디에서나 볼 수 있다",
      "일식이 일어나는 날 달의 위상은 망이다",
      "월식은 달이 삭의 자리에 있을 때 일어난다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>개기월식 때 달은 지구 그림자에 완전히 잠기지만, 지구 대기를 지나며 꺾인 붉은빛이 달까지 닿아 <b>검붉게 보여요</b> · '사라지는' 게 아니라 '물드는' 거예요.<span class='xh'>오답 하나씩 격파</span>'아무것도 보이지 않는다'가 바로 그 오개념 · 붉은 달을 떠올리면 바로잡을 수 있어요. '낮이면 어디서나 일식'도 단골 함정 · 일식은 달의 <b>그림자가 닿는 지역</b>에서만 보이고, 특히 개기일식이 보이는 지역은 매우 좁아요. '일식 = 망'은 위상을 뒤집은 것 · 달이 태양과 지구 사이에 끼는 일식날의 위상은 <b>삭</b>이에요. 마찬가지로 '월식 = 삭'도 반대 · 월식은 달이 지구 그림자 쪽, 즉 <b>망</b>의 자리에 있을 때 일어나죠. 일식 = 삭, 월식 = 망, 이 대응이 흔들리면 연쇄로 틀리는 유형이랍니다.",
    core: "개기월식 = 붉은 달(사라짐 아님) · 일식은 그림자 지역만 · 일식 삭, 월식 망!",
  },
  // [357 · d2 · multi 무③] 모형 실험 · 레슨 quiz(손전등=태양 ㄱㄴㄷ)·v1(일식 만들기)과 진술 축 분리.
  // 검산: ① 참(사이 = 일식 배치) · ② 참(그림자 속 = 월식 배치) · ③ 거짓(크기 구분 필요) ·
  // ④ 거짓(광원 필요) · ⑤ 거짓(큰 공 표면에 작은 공 그림자가 생긴다).
  {
    id: "u7e357",
    lessonId: "u7l6",
    type: "multi",
    diff: 2,
    prompt: "손전등과 크기가 다른 두 공으로 일식과 월식을 재현하려고 해요. 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "작은 공을 손전등과 큰 공 사이에 일렬로 놓으면 일식 상황이 된다",
      "큰 공의 그림자 속에 작은 공을 넣으면 월식 상황이 된다",
      "두 공의 크기가 같아도 실험 결과는 달라지지 않는다",
      "손전등 대신 빛나지 않는 공을 놓아도 같은 실험이 된다",
      "일식 상황에서 큰 공의 표면에는 아무 그림자도 생기지 않는다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>모형의 대응은 손전등 = 태양, 큰 공 = 지구, 작은 공 = 달이에요. 작은 공이 손전등과 큰 공 <b>사이</b>에 끼면 태양 - 달 - 지구 배열, 곧 <b>일식</b> 상황이고 ✓, 큰 공의 <b>그림자 속</b>에 작은 공이 들어가면 태양 - 지구 - 달 배열, 곧 <b>월식</b> 상황이에요 ✓.<span class='xh'>오답 하나씩 격파</span>'크기가 같아도 된다'면 어느 공이 지구이고 달인지 구분이 사라져요 · 크기가 다른 공을 고르는 것 자체가 지구와 달의 크기 차이를 담는 설계랍니다. '빛나지 않는 공을 광원 자리에'는 실험의 심장을 빼는 것 · 태양 역할은 <b>스스로 빛을 내는</b> 광원이어야 그림자가 생겨요. '큰 공 표면에 그림자가 없다'는 일식 배치의 핵심을 놓친 설명 · 일식 상황에서는 작은 공(달)의 그림자가 큰 공(지구) 표면에 드리워지고, 바로 그 그림자 지역에서 일식이 보이는 거예요.",
    core: "사이에 끼면 일식, 그림자에 들어가면 월식 · 광원과 크기 차이가 모형의 핵심!",
  },
];

