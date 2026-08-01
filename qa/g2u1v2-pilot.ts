// g2u1 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 11호) · 정본 설계표 qa/g2u1-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정 · index.ts 미등록. 확대 승인분과 함께 build-g2u1v2-lessons.mjs가
// g2u1l1~l9.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 6종(SC2·GT·SF·PM·FT·MB)+chemBoilCurvesParamFig(기존 헬퍼의 파라미터 확장판)는
// 파일럿 로컬 함수(u3 v2 관행) · 이식 때 ui/examFigures.ts "g2u1 v2" 섹션으로 승격한다(마커 사이만
// 교체·종료 마커 없으면 throw · 승격 뒤 반드시 tsc). 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다.
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커 ✓ · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) · num answer 문자열+unitLabel.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
// 각 문항 주석 = [슬롯] 검산 노트(밀도 나눗셈 · 석출량 = 녹인 양 − 냉각 한계 · 물 양 비례 ·
// 값 읽기 정답이 눈금 위인지 · 곡선 자료셋 배타 · e240/e246/e329/e333/e341 곡선 전부 상이).
import type { ExamItem } from "../src/content/exams/types";
import {
  chemSolCurveExamFig, chemMassVolExamFig, chemColumnFig, chemFunnelABFig,
  chemDistillApparatusFig, examCurveFig, svgTable, dbox,
} from "../src/ui/examFigures";
import { solCurves3Fig, crudeTowerFig } from "../src/ui/chemFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/g2u1/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;

/* ══════════ 신작 헬퍼(이식 때 examFigures "g2u1 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** SC2 질량-부피 산점도(파라미터형 · 라이트) · 점 좌표를 축 눈금으로 읽어 밀도를 비교한다.
 *  레슨 massVolScatterFig(고정 좌표 · aria가 전 좌표 낭독)의 시험판. aria는 중립(값 낭독 금지).
 *  전 점의 좌표는 눈금선 위에만 둔다(판독 과제 성립 조건). */
export function chemScatterExamFig(o: {
  pts: [string, number, number][];
  vMax: number;
  mMax: number;
  vStep: number;
  mStep: number;
}): string {
  const gx = (v: number): number => 52 + v * (258 / o.vMax);
  const gy = (m: number): number => 186 - (m / o.mMax) * 156;
  let xt = "";
  for (let v = 0; v <= o.vMax; v += o.vStep) {
    xt += `<line x1="${gx(v)}" y1="186" x2="${gx(v)}" y2="24" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(v)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  let yt = "";
  for (let m = 0; m <= o.mMax; m += o.mStep) {
    yt += `<line x1="52" y1="${gy(m)}" x2="316" y2="${gy(m)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="44" y="${gy(m) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${m}</text>`;
  }
  const dots = o.pts
    .map(
      ([lb, v, m]) => `<circle cx="${gx(v)}" cy="${gy(m)}" r="5" fill="#E64980"/>
      <text x="${gx(v) + 2}" y="${gy(m) - 11}" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${lb}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="여러 물질의 부피와 질량을 나타낸 산점도. 점마다 라벨이 붙어 있고 축 눈금으로 값을 읽는다">
    ${yt}${xt}
    <line x1="52" y1="24" x2="52" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="186" x2="316" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    ${dots}
    <text x="8" y="14" font-size="11" fill="#4E5968">질량(g)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">부피(cm³)</text>
  </svg>`;
}

/** GT 탄산음료 시험관 조건 비교(파라미터형 · 라이트) · 수조 온도(얼음물/따뜻한 물)×마개 유무.
 *  레슨 sodaTubesFig(온도×흔들기)와 조건 축을 분리한 시험판. 기포는 절대 그리지 않는다(정답 유출).
 *  마개 있는 시험관은 입구에 회색 마개, 없는 시험관은 입구가 열려 있다. */
export function chemGasTubesFig(o: { tubes: { label: string; warm: boolean; capped: boolean }[] }): string {
  const bathW = 150;
  const bath = (bx: number, warm: boolean, tubes: { label: string; capped: boolean }[]): string => {
    const water = warm ? "#FFDFD0" : "#D6ECFC";
    const edge = warm ? "#E8A187" : "#9CC4E4";
    const deco = warm
      ? ""
      : `<rect x="${bx + 14}" y="128" width="14" height="11" rx="3" fill="#FFFFFF" stroke="#B9D9F2" stroke-width="1.4"/><rect x="${bx + 122}" y="132" width="12" height="10" rx="3" fill="#FFFFFF" stroke="#B9D9F2" stroke-width="1.4"/>`;
    const ts = tubes
      .map((t, i) => {
        const tx = bx + 42 + i * 52;
        return `<path d="M${tx} 58v96a12 12 0 0 0 24 0V58" fill="#FDF3E0" stroke="#B9A187" stroke-width="1.8"/>
        <path d="M${tx} 96v58a12 12 0 0 0 24 0V96z" fill="#F5D9A8" opacity=".9"/>
        ${t.capped ? `<rect x="${tx - 2}" y="48" width="28" height="12" rx="4" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.6"/>` : `<path d="M${tx - 3} 56h30" stroke="#B9A187" stroke-width="1.8"/>`}
        <text x="${tx + 12}" y="36" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${t.label}</text>`;
      })
      .join("");
    return `<path d="M${bx} 118h${bathW}v54a12 12 0 0 1 -12 12h-${bathW - 24}a12 12 0 0 1 -12 -12z" fill="${water}" stroke="${edge}" stroke-width="2"/>
      ${deco}${ts}
      <text x="${bx + bathW / 2}" y="204" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${warm ? "따뜻한 물" : "얼음물"}</text>`;
  };
  const cold = o.tubes.filter((t) => !t.warm);
  const hot = o.tubes.filter((t) => t.warm);
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="탄산음료가 담긴 시험관 여러 개가 온도가 다른 두 수조에 담겨 있고, 시험관마다 마개 유무가 다르다">
    ${bath(10, false, cold)}
    ${bath(184, true, hot)}
  </svg>`;
}

/** SF 혼합 고체 분리 순서도(파라미터형 · 라이트) · 시작 상자·질문 2개·결과 3칸(㉮㉯㉰ 가림).
 *  geoRockFlowFig 문법 이식: 예/아니요가 각자의 결론 칸으로 갈라진다(수렴 금지). 결과 칸 이름을
 *  물으면 칸에 인쇄하지 않는다(가림판이 기본). */
export function chemSepFlowFig(o: { start: string; q1: string; q2: string }): string {
  const result = (x: number, y: number, label: string): string =>
    `<rect x="${x}" y="${y}" width="76" height="38" rx="10" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${x + 38}" y="${y + 24}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 252" ${NS} fill="none" role="img" aria-label="혼합물 분리 순서도. 시작 상자의 혼합물을 질문 두 개로 차례로 갈라 세 칸으로 나눈다">
    <rect x="72" y="10" width="200" height="34" rx="17" fill="#F2F4F6" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="172" y="31" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">${o.start}</text>
    <line x1="172" y1="44" x2="172" y2="64" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 66 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <rect x="62" y="68" width="220" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="172" y="91" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1B64DA">${o.q1}</text>
    <line x1="62" y1="87" x2="34" y2="87" stroke="#8B95A1" stroke-width="1.8"/>
    <line x1="34" y1="87" x2="34" y2="104" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M34 106 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="46" y="80" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>
    ${result(0, 108, "㉮")}
    <line x1="186" y1="106" x2="186" y2="130" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M186 132 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="206" y="122" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>
    <rect x="96" y="134" width="196" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="194" y="157" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1B64DA">${o.q2}</text>
    <line x1="96" y1="153" x2="34" y2="153" stroke="#8B95A1" stroke-width="1.8"/>
    <line x1="34" y1="153" x2="34" y2="196" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M34 198 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="84" y="148" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>
    ${result(0, 200, "㉰")}
    <line x1="172" y1="172" x2="172" y2="196" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 198 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="192" y="188" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>
    ${result(134, 200, "㉯")}
  </svg>`;
}

/** PM 입자 모형 상자(파라미터형 · 라이트) · 상자마다 입자 구성이 다르다(comp = 종류별 개수).
 *  종류 0 = 파란 원, 종류 1 = 주황 삼각형(이 단원 금지어 회피 · "입자 모형"으로만 서술).
 *  aria는 중립(어느 상자가 순물질인지 낭독 금지). */
export function chemPureMixFig(o: { boxes: { label: string; comp: number[] }[] }): string {
  const n = o.boxes.length;
  const bw = n === 4 ? 76 : 100;
  const gap = n === 4 ? 8 : 16;
  const x0 = (344 - n * bw - (n - 1) * gap) / 2;
  const shape = (kind: number, cx: number, cy: number): string =>
    kind === 0
      ? `<circle cx="${cx}" cy="${cy}" r="6.4" fill="#5AA2F8" stroke="#3A7DDB" stroke-width="1.2"/>`
      : `<path d="M${cx} ${cy - 7.4} L${cx + 6.8} ${cy + 4.8} L${cx - 6.8} ${cy + 4.8} z" fill="#F0A422" stroke="#D18708" stroke-width="1.2"/>`;
  const boxes = o.boxes
    .map((b, i) => {
      const bx = x0 + i * (bw + gap);
      const total = b.comp.reduce((a, c) => a + c, 0);
      const kinds: number[] = [];
      b.comp.forEach((cnt, k) => { for (let j = 0; j < cnt; j++) kinds.push(k); });
      const parts = kinds
        .map((k, j) => {
          const col = j % 3;
          const row = Math.floor(j / 3);
          const jit = ((i * 7 + j * 5) % 4) - 1.5;
          const cx = bw / 2 + (col - 1) * (bw / 3.4) + jit;
          const cy = 34 + row * 26 + (((j * 11 + i * 3) % 5) - 2);
          const kind = total > 6 && kinds.length > 0 ? kinds[(j * 5 + i) % kinds.length] : k;
          return shape(kind, cx, cy);
        })
        .join("");
      return `<g transform="translate(${bx},14)">
        <rect x="0" y="0" width="${bw}" height="112" rx="12" fill="#F8FAFC" stroke="#C4CAD2" stroke-width="1.6"/>
        ${parts}
        <text x="${bw / 2}" y="136" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${b.label}</text>
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="상자마다 입자 배열 모형이 그려져 있다. 상자에 라벨이 붙어 있다">${boxes}</svg>`;
}

/** FT 거름 장치(라이트) · 깔때기 속 거름종이 위에 남은 고체 ㉠, 아래 그릇에 모인 거른 용액 ㉡.
 *  내용물의 이름은 인쇄하지 않는다(㉠㉡ 판정 과제). */
export function chemFilterFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="거름 장치. 깔때기에 거름종이가 접혀 있고 위에 고체가 남아 있으며, 아래 그릇에 거른 용액이 모여 있다">
    <path d="M118 34h108l-40 62v34h-28v-34z" fill="rgba(224,238,250,.35)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M128 40h88l-33 50h-22z" fill="#FFFFFF" stroke="#C9CFD8" stroke-width="1.6"/>
    <path d="M150 52l8 -9 7 9 8 -8 7 8 8 -9 7 9" stroke="#B08D3E" stroke-width="0" fill="none"/>
    ${[152, 166, 180, 194].map((x, i) => `<rect x="${x}" y="${46 + (i % 2) * 6}" width="9" height="9" rx="2" transform="rotate(45 ${x + 4} ${50 + (i % 2) * 6})" fill="#CBB3E8" stroke="#9A7BC8" stroke-width="1.2"/>`).join("")}
    <path d="M172 130v26" stroke="#9DAABD" stroke-width="3"/>
    <path d="M132 158h80v36a10 10 0 0 1 -10 10h-60a10 10 0 0 1 -10 -10z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="2"/>
    <path d="M136 178h72v16a10 10 0 0 1 -10 10h-52a10 10 0 0 1 -10 -10z" fill="#EAE2F6" opacity=".85"/>
    <text x="258" y="52" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
    <path d="M252 50h-42" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="258" y="192" font-size="13.5" font-weight="800" fill="#4E5968">㉡</text>
    <path d="M252 188h-40" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="104" y="46" text-anchor="end" font-size="11" fill="#8B95A1">거름종이</text>
    <path d="M108 42h22" stroke="#C4CAD2" stroke-width="1.3"/>
  </svg>`;
}

/** MB 물·혼합물 가열 곡선 쌍(파라미터형 · 라이트 · 눈금 포함) · (가) 순물질은 plat 온도에서 수평,
 *  (나) 혼합물은 mixStart(>plat)에서 끓기 시작해 계속 오른다. 라벨은 (가)(나) 중립(이름 인쇄 금지).
 *  값 읽기 문항은 mixStart를 눈금선 위에 둔다. */
export function chemMixBoilFig(o: { plat: number; mixStart: number; yMin: number; yMax: number; yStep: number }): string {
  const gy = (c: number): number => 168 - ((c - o.yMin) / (o.yMax - o.yMin)) * 146;
  let yt = "";
  for (let T = o.yMin; T <= o.yMax; T += o.yStep) {
    yt += `<line x1="50" y1="${gy(T)}" x2="322" y2="${gy(T)}" stroke="#EDF0F4"/><text x="42" y="${gy(T) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${T}</text>`;
  }
  const s = o.yMin + (o.yMax - o.yMin) * 0.08;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="두 액체의 가열 곡선. 곡선에 가와 나 라벨이 붙어 있고 세로축 눈금으로 온도를 읽는다">
    ${yt}
    <line x1="50" y1="12" x2="50" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="50" y1="168" x2="322" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="M56 ${gy(s)} C120 ${gy(o.plat - 8)} 148 ${gy(o.plat - 1)} 168 ${gy(o.plat)} L318 ${gy(o.plat)}" stroke="#5E6B7E" stroke-width="2.8" fill="none"/>
    <path d="M56 ${gy(s)} C124 ${gy(o.mixStart - 9)} 156 ${gy(o.mixStart - 1)} 180 ${gy(o.mixStart)} C230 ${gy(o.mixStart + 3)} 280 ${gy(o.mixStart + 5)} 318 ${gy(o.mixStart + 7)}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-dasharray="7 5"/>
    <text x="300" y="${gy(o.plat) + 17}" font-size="12" font-weight="700" fill="#4E5968">(가)</text>
    <text x="296" y="${gy(o.mixStart + 7) - 9}" font-size="12" font-weight="700" fill="#4E5968">(나)</text>
    <text x="14" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="322" y="192" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 액체 (가)~(라) 가열 곡선 파라미터판 · chemBoilCurvesFig(고정 58/82)의 확장.
 *  (가)·(다)는 t2에서 평평(다는 기울기 완만+구간 김 = 양 많음 세트), (나)는 t1, (라)는 계속 상승.
 *  이식 때 chemBoilCurvesFig에 {t1,t2} 옵션으로 통합한다(기본값 = 현행 58/82 렌더 무영향). */
export function chemBoilCurvesParamFig(o: { t1: number; t2: number }): string {
  const top = o.t2 + 28;
  const gy = (c: number): number => 168 - (c / top) * 146;
  const seg = (x0: number, tempo: number, plateau: number, label: string, lx: number, plen: number): string => {
    const pY = gy(plateau);
    return `<path d="M${x0} ${gy(16)} L${x0 + 40 * tempo} ${pY} L${x0 + 40 * tempo + plen} ${pY}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${lx}" y="${pY - 8}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  };
  const rTop = o.t2 * 0.9;
  const riser = (x0: number, label: string): string =>
    `<path d="M${x0} ${gy(16)} L${x0 + 44} ${gy(rTop * 0.72)} C${x0 + 66} ${gy(rTop * 0.86)} ${x0 + 88} ${gy(rTop * 0.94)} ${x0 + 108} ${gy(rTop)}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${x0 + 96}" y="${gy(rTop) - 9}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="서로 다른 비커에 담긴 액체 네 개를 각각 가열한 시간-온도 그래프">
    <line x1="46" y1="12" x2="46" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[o.t1, o.t2].map((c) => `<line x1="46" y1="${gy(c)}" x2="326" y2="${gy(c)}" stroke="#EDF0F4"/><text x="38" y="${gy(c) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${c}</text>`).join("")}
    ${seg(52, 1.15, o.t2, "(가)", 100, 46)}
    ${seg(92, 1.5, o.t1, "(나)", 158, 54)}
    ${seg(128, 1.75, o.t2, "(다)", 226, 88)}
    ${riser(200, "(라)")}
    <text x="12" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="330" y="188" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/* ══════════ 파일럿 40 문항 ══════════ */

export const POOL_G2U1V2_PILOT: ExamItem[] = [
  // ── L1 물질의 특성과 밀도 (5) ──
  {
    // [e201] 특성 자격: 양 무관·고유·구별. 거짓 = "측정하는 양이 많을수록 값이 커진다".
    id: "g2u1e201",
    lessonId: "g2u1l1",
    type: "mcq",
    diff: 1,
    prompt: "<b>물질의 특성</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "물질마다 고유한 값을 가진다",
      "측정하는 양이 많을수록 값이 커진다",
      "밀도·용해도·끓는점이 여기에 속한다",
      "어떤 물질인지 구별하는 근거가 된다",
      "같은 조건이면 언제 재도 같은 값이 나온다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>물질의 특성은 <b>양과 관계없이 일정한</b> 값이에요. 반으로 잘라도, 두 배로 늘려도 값이 그대로여야 '그 물질만의 표식'이 될 수 있죠. '양이 많을수록 커진다'는 질량·부피 같은 <b>양의 값</b>에 해당하는 설명이라 특성과는 정반대예요.<span class='xh'>오답 하나씩 격파</span>특성은 물질마다 고유해서(같은 조건에서 값이 다르면 다른 물질) 구별의 근거가 되고, 밀도·용해도·끓는점·녹는점이 대표 선수예요. 또 같은 조건이면 언제, 누가 재도 같은 값이 나와야 측정할 때마다 흔들리는 값과 구별되죠. 헷갈릴 땐 <b>'반으로 잘라도 그대로인가?'</b>를 물어보세요. 그대로면 특성, 변하면 양의 값이랍니다.",
    core: "특성 = 양과 무관하게 일정한 고유값. 양 따라 변하면 탈락!",
  },
  {
    // [e204] MassVol 3선: A(20,120)=6 · B(40,120)=3 · C(40,40)=1. ㄱ 참(A 최대) ㄴ 참(3=1×3) ㄷ 거짓(같은 부피 최소 질량은 C).
    //        전 판독점 눈금 위(mStep 20). 정답 ㄱㄴ(3번째 칸) · ㄱ 참.
    id: "g2u1e204",
    lessonId: "g2u1l1",
    type: "mcq",
    diff: 2,
    prompt: "그림은 고체 A~C의 부피에 따른 질량을 나타낸 그래프예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: chemMassVolExamFig({
      lines: [
        { label: "A", density: 6 },
        { label: "B", density: 3 },
        { label: "C", density: 1 },
      ],
      vMax: 40,
      mMax: 120,
      vStep: 10,
      mStep: 20,
    }),
    bogi: [
      "밀도가 가장 큰 것은 A이다.",
      "B의 밀도는 C의 밀도의 3배이다.",
      "부피가 같을 때 질량이 가장 작은 것은 A이다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>세로축이 질량, 가로축이 부피이므로 원점을 지나는 직선의 <b>기울기가 곧 밀도</b>예요. ㄱ: 옳아요. 눈금을 읽으면 A는 부피 20 cm³에 질량 120 g으로 밀도 6 g/cm³, B는 40 cm³에 120 g으로 3 g/cm³, C는 40 cm³에 40 g으로 1 g/cm³니까 A가 가장 크죠. ㄴ: 옳아요. 3은 1의 3배예요. ㄷ이 함정이에요. 같은 부피에서 <b>아래쪽</b>에 있는 직선일수록 질량이 작은데, 맨 아래는 C예요. A는 오히려 같은 부피에서 질량이 가장 크죠.<span class='xh'>함정 포인트</span>그래프 판단은 언제나 점의 높이가 아니라 <b>기울기</b>가 기준이에요. 기울기가 가파를수록 밀도가 큰 물질!",
    core: "질량-부피 그래프의 기울기 = 밀도. A 6, B 3, C 1 g/cm³!",
  },
  {
    // [e206] SC2 산점도: (가)(20,90)=4.5 · (나)(10,30)=3 · (다)(30,90)=3 · (라)(10,60)=6 · (마)(20,120)=6.
    //        (마)와 같은 물질 = (라). 전 점 눈금 위(mStep 30). 질량 같은 (가)(다) 함정. 정답 4번째 칸.
    id: "g2u1e206",
    lessonId: "g2u1l1",
    type: "mcq",
    diff: 2,
    prompt: "그림은 고체 (가)~(마)의 부피와 질량을 잰 결과예요. <b>(마)와 같은 물질</b>로 볼 수 있는 것은?",
    figure: chemScatterExamFig({
      pts: [
        ["(가)", 20, 90],
        ["(나)", 10, 30],
        ["(다)", 30, 90],
        ["(라)", 10, 60],
        ["(마)", 20, 120],
      ],
      vMax: 40,
      mMax: 150,
      vStep: 10,
      mStep: 30,
    }),
    options: ["(가)", "(나)", "(다)", "(라)", "같은 물질이 없다"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>같은 물질인지 판별하는 기준은 <b>밀도(질량÷부피)</b>예요. 눈금을 읽어 하나씩 나눠 봐요.<br>① (마) 120÷20 = 6 g/cm³<br>② (라) 60÷10 = <b>6 g/cm³</b> ✓<br>③ (가) 90÷20 = 4.5, (나) 30÷10 = 3, (다) 90÷30 = 3<br>(마)와 나눈 값이 같은 것은 (라)뿐이에요.<span class='xh'>오답 하나씩 격파</span>(가)와 (다)는 질량이 90 g으로 서로 같지만 부피가 달라 밀도가 다르고, (마)와도 달라요. 질량이나 부피가 '같아 보이는' 짝을 고르면 안 되고, 반드시 <b>나눈 값</b>을 비교해야 해요. (나)와 (다)는 밀도 3 g/cm³로 서로 같은 물질이지만, 문제가 묻는 (마)의 짝은 아니죠. 원점과 각 점을 이어 보면 (라)와 (마)가 한 직선 위에 놓인다는 것으로도 확인할 수 있어요.",
    core: "같은 물질 = 같은 밀도 = 원점에서 이은 같은 직선 위의 점!",
  },
  {
    // [e208] 사진+표 조회: 210 g ÷ 20 cm³ = 10.5 = 은. 표(아연 7.14·니켈 8.90·은 10.50·납 11.34·금 19.32).
    id: "g2u1e208",
    lessonId: "g2u1l1",
    type: "mcq",
    diff: 2,
    prompt: "사진처럼 은백색 금속 덩어리의 질량을 재니 <b>210 g</b>, 눈금실린더로 잰 부피는 <b>20 cm³</b>였어요. 아래 밀도 표와 비교할 때 이 금속은?",
    figure: `<div style="display:flex;flex-direction:column;gap:10px">${ximg("metal-scale.webp", "전자저울 위에 놓인 은백색 금속 덩어리와 물이 든 눈금실린더")}${svgTable(
      ["금속", "밀도(g/cm³)"],
      [
        ["아연", "7.14"],
        ["니켈", "8.90"],
        ["은", "10.50"],
        ["납", "11.34"],
        ["금", "19.32"],
      ],
      { firstColHead: true },
    )}</div>`,
    options: ["아연", "니켈", "은", "납", "금"],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>겉모습이 비슷한 금속의 정체는 밀도로 조회해요.<br>① 밀도 = 질량 ÷ 부피 = 210 ÷ 20<br>② = <b>10.5 g/cm³</b><br>③ 표에서 10.50과 일치하는 금속은 <b>은</b>이에요.<span class='xh'>오답 하나씩 격파</span>니켈(8.90)이나 납(11.34)을 골랐다면 계산 없이 '비슷해 보이는' 값을 고른 거예요. 부피 20 cm³ 기준으로 니켈이라면 178 g, 납이라면 약 227 g이 나와야 하니 측정값 210 g과 맞지 않죠. 아연(7.14)은 같은 부피에서 143 g 정도로 훨씬 가볍고, 금(19.32)은 386 g이 넘는 데다 은백색도 아니에요. 측정값 두 개와 나눗셈 한 번이면 물질의 지문 조회 끝!",
    core: "210÷20 = 10.5 g/cm³ = 은. 겉모습 말고 밀도로 조회!",
  },
  {
    // [e214] num 눈금실린더 차: (85−60) = 25 cm³ · 175÷25 = 7 g/cm³. 나중 눈금 85를 그대로 쓰는 함정.
    id: "g2u1e214",
    lessonId: "g2u1l1",
    type: "num",
    diff: 1,
    prompt: "표는 어떤 금속 조각의 측정 기록이에요. 이 금속의 밀도는 몇 <b>g/cm³</b>일까요? (1 mL = 1 cm³)",
    figure: dbox([
      ["질량", "175 g"],
      ["물만 담은 눈금실린더의 눈금", "60 mL"],
      ["금속을 완전히 잠기게 넣은 뒤의 눈금", "85 mL"],
      ["조건", "금속은 물에 녹지 않아요"],
    ]),
    answer: "7",
    numKind: "int",
    unitLabel: "g/cm³",
    explain:
      "<span class='xh'>정답 풀이</span>두 단계로 구해요.<br>① 금속의 부피 = 늘어난 눈금 = 85 − 60 = <b>25 cm³</b><br>② 밀도 = 질량 ÷ 부피 = 175 ÷ 25 = <b>7 g/cm³</b><span class='xh'>이런 실수를 조심해요</span>가장 흔한 실수는 나중 눈금 85를 그대로 부피로 쓰는 거예요. 85 mL에는 원래 있던 물 60 mL가 포함돼 있으니, 반드시 <b>눈금의 차이</b>를 구해야 금속만의 부피가 나와요(175÷85 = 약 2.06은 오답). 반대로 물의 부피 60을 쓰는 실수(175÷60)도 마찬가지죠. '물에 넣기 전과 후의 차이 = 밀어낸 물의 부피 = 고체의 부피'라는 원리만 기억하면 흔들리지 않아요.",
    core: "부피는 '늘어난 눈금'! 175 ÷ (85−60) = 7 g/cm³.",
  },
  // ── L2 뜨고 가라앉기 (4) ──
  {
    // [e220] Column 3층 ㉠㉡㉢ · 공 P가 ㉠㉡ 경계(objAt 1). 부등식: ㉠ < P < ㉡ (< ㉢). 정답 2번째 칸.
    id: "g2u1e220",
    lessonId: "g2u1l2",
    type: "mcq",
    diff: 2,
    prompt: "그림은 서로 섞이지 않는 액체 ㉠~㉢을 한 원통에 부었더니 세 층으로 나뉜 모습이에요. 작은 공 P는 ㉠과 ㉡의 <b>경계</b>에 떠 있어요. 밀도 비교로 옳은 것은?",
    figure: chemColumnFig({ layers: ["㉠", "㉡", "㉢"], objLabel: "P", objAt: 1 }),
    options: [
      "P < ㉠ < ㉡",
      "㉠ < P < ㉡",
      "㉡ < P < ㉢",
      "㉢ < ㉡ < P",
      "P < ㉡ < ㉢",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>섞이지 않는 액체들은 <b>밀도가 큰 것부터 아래층</b>이 돼요. 그래서 밀도는 ㉠ < ㉡ < ㉢ 순서죠. 공 P는 ㉠ 속에서는 가라앉고 ㉡ 위에서는 뜬 채 경계에 멈춰 있으니, P의 밀도는 <b>㉠보다 크고 ㉡보다 작아요</b>. 즉 ㉠ < P < ㉡이에요.<span class='xh'>오답 하나씩 격파</span>P를 맨 앞에 둔 비교는 P가 맨 위층 위에 떠 있을 때의 이야기예요. P가 ㉡과 ㉢ 사이 값이라는 비교는 경계의 위치를 한 층 아래로 잘못 읽은 것으로, 그랬다면 P는 ㉡ 속으로 더 가라앉아 ㉡·㉢ 경계에 있어야 하죠. ㉢이 가장 작다는 식의 비교는 층 순서와 밀도 순서를 뒤집어 읽은 거예요. <b>경계에 뜬 물체 = 위층보다 크고 아래층보다 작다</b>, 이 한 줄이면 충분해요.",
    core: "아래층일수록 밀도 큼. 경계의 물체 = 위층과 아래층의 사이 값!",
  },
  {
    // [e222] iceberg 새 각도: 액체 밀도가 커지면(진한 소금물 바다) 더 떠오른다. 물체 밀도 고정·유체 밀도↑.
    id: "g2u1e222",
    lessonId: "g2u1l2",
    type: "mcq",
    diff: 2,
    prompt: "사진은 바다에 떠 있는 빙산이에요. 이 빙산이 지금보다 <b>밀도가 더 큰 진한 소금물 바다</b>로 옮겨 간다면 어떻게 될까요?",
    figure: ximg("iceberg.webp", "바다 위에 일부만 드러나고 대부분이 물속에 잠긴 빙산"),
    options: [
      "물 위로 드러나는 부분이 지금보다 많아진다",
      "물속에 잠기는 부분이 지금보다 많아진다",
      "완전히 가라앉는다",
      "빙산의 밀도가 커진다",
      "달라지는 것이 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>얼음의 밀도는 그대로인데 <b>주변 액체의 밀도가 커지면</b>, 얼음과 액체의 밀도 차이가 더 벌어져요. 밀도 차이가 클수록 물체는 더 높이 떠오르니, 빙산이 물 위로 드러나는 부분이 <b>많아져요</b>. 진한 소금물에서 몸이 더 잘 뜨는 것과 같은 원리죠.<span class='xh'>오답 하나씩 격파</span>'잠기는 부분이 많아진다'는 방향이 반대예요. 잠기는 부분이 늘어나는 건 액체의 밀도가 <b>작아질 때</b>(민물에 가까워질 때)의 일이죠. '완전히 가라앉는다'는 얼음의 밀도가 액체보다 커져야 일어나는데, 소금물이 진해질수록 오히려 그 반대가 돼요. '빙산의 밀도가 커진다'는 잘못된 진단이에요. 뜨고 가라앉기에서 변한 것은 빙산이 아니라 <b>액체 쪽</b>이라는 걸 놓치지 마세요.",
    core: "물체는 그대로, 액체 밀도↑ = 더 높이 떠오른다!",
  },
  {
    // [e230] multi 평균 밀도 조절: 정답 2개(튜브 공기 · 납 벨트 벗기). 물탱크 채우기·돌 싣기·모래주머니는 반대.
    id: "g2u1e230",
    lessonId: "g2u1l2",
    type: "multi",
    diff: 1,
    prompt: "물에 떠 있으려는 사람이나 장치의 <b>전체 평균 밀도를 작게</b> 만드는 조작을 모두 고르세요.",
    figure: dbox([
      ["상황", "몸이나 장치 전체가 물에 더 잘 뜨게 만들고 싶어요"],
      ["힌트", "평균 밀도 = 전체 질량 ÷ 전체 부피"],
    ]),
    options: [
      "공기를 가득 넣은 튜브를 몸에 두른다",
      "잠수부가 차고 있던 납 벨트를 벗는다",
      "잠수함의 물탱크에 바닷물을 가득 채운다",
      "배 바닥에 무거운 돌을 싣는다",
      "허리에 모래주머니를 찬다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>평균 밀도는 <b>전체 질량 ÷ 전체 부피</b>예요. 공기를 가득 넣은 튜브는 질량은 거의 안 늘리면서 부피를 크게 늘려 평균 밀도를 확 낮춰 줘요. 납 벨트를 벗는 것은 부피는 거의 그대로인데 질량을 크게 줄이는 조작이라 역시 평균 밀도가 작아지죠.<span class='xh'>오답 하나씩 격파</span>물탱크에 바닷물을 채우는 것은 잠수함이 <b>가라앉고 싶을 때</b> 쓰는 조작이에요(질량이 늘어 평균 밀도가 커짐). 배에 돌을 싣거나 허리에 모래주머니를 차는 것도 질량만 보태는 일이라 전부 평균 밀도를 키우죠. '뜨려면 가벼운 것을 더하거나 무거운 것을 덜어 내라'로 외우기보다, 언제나 <b>질량과 부피 중 무엇이 어떻게 변하는지</b>를 따져 보세요.",
    core: "평균 밀도 = 전체 질량÷전체 부피. 공기 더하기·무게 덜기 = 밀도↓!",
  },
  {
    // [e234] num 띄우기 한계: 1.15 × 40 = 46 g. 부피 40 cm³ 물체가 밀도 1.15 소금물에 뜨는 조건.
    id: "g2u1e234",
    lessonId: "g2u1l2",
    type: "num",
    diff: 2,
    prompt: "밀도가 <b>1.15 g/cm³</b>인 진한 소금물에 부피가 <b>40 cm³</b>인 물체를 띄우려고 해요. 물체가 이 소금물에 뜨려면 질량이 몇 <b>g</b>보다 작아야 할까요?",
    figure: dbox([
      ["소금물의 밀도", "1.15 g/cm³"],
      ["물체의 부피", "40 cm³"],
      ["뜨는 조건", "물체의 밀도 < 소금물의 밀도"],
    ]),
    answer: "46",
    numKind: "int",
    unitLabel: "g",
    explain:
      "<span class='xh'>정답 풀이</span>뜨는 조건은 물체의 밀도가 소금물의 밀도(1.15 g/cm³)보다 작은 거예요.<br>① 물체의 밀도 = 질량 ÷ 40이 1.15보다 작아야 해요.<br>② 경계가 되는 질량 = 1.15 × 40 = <b>46 g</b><br>③ 질량이 46 g보다 작으면 밀도가 1.15보다 작아져 떠요.<span class='xh'>이런 실수를 조심해요</span>40 ÷ 1.15 = 약 34.8처럼 나눗셈 방향을 뒤집는 실수가 많아요. 단위를 보면 (g/cm³)×(cm³)에서 cm³가 지워지고 g만 남으니 <b>곱셈</b>이 맞다는 걸 확인할 수 있죠. 또 '46 g이면 뜬다'고 답하면 안 돼요. 딱 46 g이면 밀도가 소금물과 같아져 둥실 멈추는 경계 상태고, 그보다 <b>작아야</b> 확실히 떠올라요.",
    core: "경계 질량 = 밀도 × 부피 = 1.15 × 40 = 46 g. 그보다 작아야 뜬다!",
  },
  // ── L3 고체의 용해도 (5) ──
  {
    // [e237] 용해도 정의 부정형: 거짓 = "용액 100 g 기준"(용매 바꿔치기 함정).
    id: "g2u1e237",
    lessonId: "g2u1l3",
    type: "mcq",
    diff: 1,
    prompt: "<b>용해도</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "어떤 온도에서 용매 100 g에 최대로 녹을 수 있는 용질의 g 수이다",
      "용액 100 g 속에 녹아 있는 용질의 g 수를 말한다",
      "같은 온도·같은 용매에서 물질마다 값이 다르다",
      "온도가 변하면 값이 달라질 수 있다",
      "대부분의 고체는 온도가 높을수록 값이 커진다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>용해도의 기준은 '용액 100 g'이 아니라 <b>'용매 100 g'</b>이에요. 녹이는 재료(용매)를 100 g으로 고정해야 물질끼리 공평하게 비교할 수 있거든요. 용액 100 g에는 이미 녹은 용질이 포함돼 있어서 기준이 흔들려요. 이 바꿔치기가 이 단원 최대의 함정이랍니다.<span class='xh'>오답 하나씩 격파</span>나머지는 모두 옳아요. 용해도는 같은 온도·같은 용매라는 조건에서 물질마다 고유한 값이라 물질의 특성이 되고, 온도가 변하면 값도 변해요(그래서 반드시 온도를 함께 적어요). 대부분의 고체는 온도가 높을수록 더 많이 녹아서 온도-용해도 그래프가 오른쪽 위로 올라가는 곡선이 되죠.",
    core: "용해도 기준 = '용매 100 g'. '용액 100 g'으로 바꿔치기가 최대 함정!",
  },
  {
    // [e240] SolCurve X': [[0,25],[20,40],[40,60],[60,95]] · Q(40,40) 불포화(한계 60).
    //        ㄱ 물 추가 = 포화 아님(거짓) · ㄴ X' 20 g 추가 = 포화(참: 60−40) · ㄷ 20 ℃ 냉각 = 포화(참: 한계 40).
    //        판정값 40·60 눈금 위(sStep 20). 정답 ㄴㄷ(4번째 칸) · ㄱ 거짓.
    id: "g2u1e240",
    lessonId: "g2u1l3",
    type: "mcq",
    diff: 2,
    prompt: "그림은 고체 X의 용해도 곡선이에요. 점 <b>Q</b>는 40 ℃ 물 100 g에 X를 <b>40 g</b> 녹인 용액이에요. 이 용액을 <b>포화 용액으로 만드는 방법</b>을 보기에서 모두 고른 것은?",
    figure: chemSolCurveExamFig({
      curves: [{ label: "X", pts: [[0, 25], [20, 40], [40, 60], [60, 95]] }],
      tMax: 60,
      sMax: 100,
      tStep: 20,
      sStep: 20,
      dots: [[40, 40, "Q"]],
    }),
    bogi: [
      "같은 온도에서 물을 더 넣는다.",
      "같은 온도에서 X를 20 g 더 녹인다.",
      "온도를 20 ℃까지 낮춘다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>포화란 그 온도의 한계까지 꽉 채운 상태예요. 곡선을 읽으면 40 ℃의 한계는 물 100 g에 60 g. ㄱ은 틀렸어요. 물을 더 넣으면 녹일 수 있는 한계가 커져서 오히려 포화에서 <b>더 멀어져요</b>. ㄴ: 옳아요. 지금 40 g이 녹아 있으니 한계까지 남은 양은 60 − 40 = <b>20 g</b>이죠. ㄷ: 옳아요. 20 ℃의 한계는 40 g이라, 온도를 20 ℃로 낮추면 지금 녹아 있는 40 g이 딱 한계와 같아져 포화가 돼요.<span class='xh'>함정 포인트</span>포화로 만드는 길은 두 갈래예요. <b>용질을 한계까지 채우거나, 온도를 낮춰 한계를 지금 양까지 끌어내리거나.</b> 물을 붓는 것은 반대 방향 조작이라는 것까지 기억해 두세요.",
    core: "포화 만들기 = 용질 채우기 또는 냉각으로 한계 내리기. 물 추가는 반대!",
  },
  {
    // [e241] solCurves3(실물질 · aria 중립화 소급본): 온도 영향 최소 = 염화 나트륨(35.7→38.4).
    id: "g2u1e241",
    lessonId: "g2u1l3",
    type: "mcq",
    diff: 2,
    prompt: "그림은 세 고체의 용해도 곡선이에요. <b>온도를 높여도 용해도가 거의 변하지 않는</b> 물질은?",
    figure: solCurves3Fig(),
    options: [
      "질산 나트륨",
      "질산 칼륨",
      "염화 나트륨",
      "세 물질 모두 비슷하게 변한다",
      "이 그래프만으로는 알 수 없다",
    ],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>곡선의 <b>기울어진 정도</b>가 온도의 영향력을 말해 줘요. 염화 나트륨의 곡선은 거의 수평에 가까워서, 온도를 0 ℃에서 80 ℃까지 올려도 용해도가 조금밖에 안 변해요. 그래서 <b>염화 나트륨</b>이 정답이에요.<span class='xh'>오답 하나씩 격파</span>질산 나트륨과 질산 칼륨은 곡선이 가파르게 치솟는 물질이에요. 특히 질산 칼륨은 온도가 오를수록 용해도가 몇 배로 뛰죠. '모두 비슷하다'는 세 곡선의 기울기가 눈에 띄게 다르니 틀렸고, '알 수 없다'도 성립하지 않아요. 곡선의 기울기 비교가 바로 이 그래프가 주는 정보거든요. 이 차이는 나중에 배우는 재결정 분리의 열쇠가 돼요. 온도 변화에 둔감한 물질은 냉각해도 결정이 잘 나오지 않으니까요.",
    core: "곡선이 평평할수록 온도에 둔감. 염화 나트륨이 대표 선수!",
  },
  {
    // [e246] SolCurve 2곡선: X2[[0,20],[20,45],[40,75],[60,90]] · Y2[[0,66],[20,69],[40,72],[60,75]].
    //        각 60 g 녹여 20 ℃ 냉각: X2 한계 45 < 60 → 석출 15 g ✓ · Y2 한계 69 > 60 → 석출 없음 ✓.
    //        판정값 45·60 눈금 위(sStep 15). guideS 60 = 넣은 양 표시.
    id: "g2u1e246",
    lessonId: "g2u1l3",
    type: "mcq",
    diff: 2,
    prompt: "그림은 고체 X와 Y의 용해도 곡선이에요. 두 고체를 <b>각각 60 g씩</b> 60 ℃ 물 100 g에 녹인 뒤 <b>20 ℃로 식혔더니 X만 결정이 생겼어요</b>. 그 까닭으로 가장 옳은 것은?",
    figure: chemSolCurveExamFig({
      curves: [
        { label: "X", pts: [[0, 20], [20, 45], [40, 75], [60, 90]] },
        { label: "Y", pts: [[0, 66], [20, 69], [40, 72], [60, 75]] },
      ],
      tMax: 60,
      sMax: 90,
      tStep: 20,
      sStep: 15,
      guideS: [60],
      guideT: [20],
    }),
    options: [
      "20 ℃에서 X의 용해도(45 g)는 60 g보다 작고, Y의 용해도(약 69 g)는 60 g보다 크기 때문",
      "X가 Y보다 물에 빨리 녹기 때문",
      "X의 결정이 Y의 결정보다 무겁기 때문",
      "Y는 온도가 낮아지면 용해도가 커지기 때문",
      "Y가 X보다 먼저 끓어 날아갔기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>식힌 온도의 한계와 녹아 있는 양을 비교하면 끝나요. 20 ℃에서 X의 한계는 <b>45 g</b>. 녹아 있던 60 g이 한계를 넘으니 넘친 60 − 45 = 15 g이 결정으로 나와요. 반면 Y의 20 ℃ 한계는 약 <b>69 g</b>으로 60 g보다 커서, 전부 녹은 채로 남죠.<span class='xh'>오답 하나씩 격파</span>'빨리 녹는다'는 속도 이야기라 석출과 무관해요. 석출은 얼마나 빨리가 아니라 <b>얼마나 많이 녹아 있을 수 있는가(한계)</b>의 문제거든요. 결정의 무게도 원인이 아니라 결과일 뿐이에요. 온도가 낮아질 때 용해도가 커지는 고체는 이 그래프에 없고(두 곡선 모두 오른쪽 위로), 식히는 과정에서 끓는 일은 일어나지 않죠. <b>석출 판정 = 녹은 양 vs 식힌 온도의 한계</b>, 이 비교 하나로 정리하세요.",
    core: "석출 판정 = 녹은 양과 냉각 온도 한계의 비교. X만 한계 초과!",
  },
  {
    // [e250] num 물 양 환산: 용해도 48(40 ℃) · 물 50 g → 48 × 50/100 = 24 g.
    id: "g2u1e250",
    lessonId: "g2u1l3",
    type: "num",
    diff: 2,
    prompt: "표는 어떤 고체의 용해도 자료예요. 40 ℃ 물 <b>50 g</b>에는 이 고체를 최대 몇 <b>g</b>까지 녹일 수 있을까요?",
    figure: dbox([
      ["40 ℃에서의 용해도", "48"],
      ["뜻", "40 ℃ 물 100 g에 최대 48 g이 녹아요"],
      ["준비한 물", "40 ℃ 물 50 g"],
    ]),
    answer: "24",
    numKind: "int",
    unitLabel: "g",
    explain:
      "<span class='xh'>정답 풀이</span>용해도 48은 <b>물 100 g 기준</b>으로 최대 48 g이 녹는다는 뜻이에요.<br>① 물이 50 g이면 기준의 절반이에요.<br>② 녹일 수 있는 한계도 절반 = 48 × 50/100 = <b>24 g</b><span class='xh'>이런 실수를 조심해요</span>용해도 값 48을 그대로 답하면 물의 양을 무시한 거예요. 용해도라는 '값'은 물질의 특성이라 변하지 않지만, 실제로 녹일 수 있는 '양'은 <b>용매의 양에 비례</b>해요. 물이 절반이면 한계도 절반, 물이 두 배면 한계도 두 배죠. 반대로 48 ÷ 50 = 0.96이나 50 − 48 = 2처럼 아무 연산이나 하지 않도록, '물 100 g에 48 g → 물 50 g에 몇 g?'이라는 비례식을 머릿속에 세우고 시작하세요.",
    core: "녹는 한계는 물 양에 비례. 물 50 g = 기준의 절반 = 24 g!",
  },
  // ── L4 기체의 용해도 (4) ──
  {
    // [e255] 기체 용해도 요인: 온도와 압력.
    id: "g2u1e255",
    lessonId: "g2u1l4",
    type: "mcq",
    diff: 1,
    prompt: "<b>기체의 용해도</b>에 영향을 주는 요인끼리 옳게 짝지은 것은?",
    options: [
      "온도와 압력",
      "온도와 그릇의 모양",
      "압력과 액체의 색깔",
      "젓는 빠르기와 그릇의 크기",
      "빛의 세기와 압력",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>기체가 액체에 녹는 양은 <b>온도와 압력</b>이 정해요. 온도가 낮을수록, 압력이 높을수록 기체는 더 많이 녹아 있을 수 있죠. 그래서 기체의 용해도를 나타낼 때는 온도와 압력을 반드시 함께 표시해요.<span class='xh'>오답 하나씩 격파</span>그릇의 모양이나 크기는 담긴 모습만 바꿀 뿐 녹는 한계와는 무관해요. 액체의 색깔과 빛의 세기도 용해도와 관계없는 조건이죠. 젓는 빠르기는 헷갈리기 쉬운 함정인데, 젓기는 녹는 <b>속도</b>를 빠르게 할 뿐 최대로 녹을 수 있는 <b>양</b>을 바꾸지는 못해요. '빨리 녹기'와 '많이 녹기'를 가르는 것이 이 단원의 중요한 눈이에요. 고체의 용해도가 주로 온도의 영향을 받는 것과 달리, 기체는 압력까지 함께 챙겨야 한다는 점도 비교해 두세요.",
    core: "기체 용해도의 두 손잡이 = 온도(낮게)·압력(높게)!",
  },
  {
    // [e257] GT 신작: (가)얼음물·마개 없음 (나)얼음물·마개 (다)따뜻한 물·마개 없음 (라)따뜻한 물·마개.
    //        기포 최다 = 온도 높고 마개 없는 (다). 정답 3번째 칸(라벨형 고정).
    id: "g2u1e257",
    lessonId: "g2u1l4",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 같은 탄산음료를 담은 시험관 (가)~(라)를 조건만 달리해 두었어요. 잠시 뒤 <b>기포가 가장 활발하게 올라오는</b> 시험관은?",
    figure: chemGasTubesFig({
      tubes: [
        { label: "(가)", warm: false, capped: false },
        { label: "(나)", warm: false, capped: true },
        { label: "(다)", warm: true, capped: false },
        { label: "(라)", warm: true, capped: true },
      ],
    }),
    options: ["(가)", "(나)", "(다)", "(라)", "네 시험관 모두 같다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>녹아 있던 기체가 빠져나오기 쉬운 조건은 <b>온도가 높을수록, 압력이 낮을수록</b>이에요. 따뜻한 물에 담긴 시험관은 온도가 높아 용해도가 작아지고, 마개가 없는 시험관은 입구가 열려 있어 기체가 눌리지 않고 빠져나가죠. 두 조건을 모두 갖춘 것은 <b>(다)</b>예요.<span class='xh'>오답 하나씩 격파</span>(가)는 입구는 열려 있지만 얼음물 속이라 기체가 잘 붙잡혀 있고, (나)는 차갑기까지 한 데다 마개까지 닫혀 가장 조용한 시험관이에요. (라)는 온도는 높지만 마개가 병 속 압력을 붙들어 기포 발생을 억누르죠. 이렇게 두 조건이 엇갈릴 때는 <b>조건 표를 그리듯 하나씩 비교</b>하면 함정에 빠지지 않아요.",
    core: "기체 탈출 조건 = 온도↑ + 마개 없음(압력↓). 둘 다 갖춘 (다)!",
  },
  {
    // [e262] aquarium-stone 새 각도(여름): 수온↑ → 용존 산소↓ → 기포 발생기 더 필요.
    id: "g2u1e262",
    lessonId: "g2u1l4",
    type: "mcq",
    diff: 2,
    prompt: "사진은 어항 바닥에서 공기 방울을 뿜어내는 기포 발생기예요. <b>더운 여름철에 이 장치를 특히 더 신경 써서 트는</b> 까닭으로 가장 옳은 것은?",
    figure: ximg("aquarium-stone.webp", "어항 바닥의 기포 발생기에서 작은 공기 방울들이 올라오는 모습"),
    options: [
      "수온이 높아지면 물에 녹아 있을 수 있는 산소의 양이 줄어들기 때문",
      "수온이 높아지면 산소가 물에 더 많이 녹기 때문",
      "여름에는 물고기가 산소를 쓰지 않기 때문",
      "기포가 물의 온도를 빠르게 낮춰 주기 때문",
      "여름에는 어항 물의 압력이 높아지기 때문",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>기체의 용해도는 <b>온도가 높을수록 작아져요</b>. 여름에 수온이 오르면 물이 붙잡아 둘 수 있는 산소의 한계 자체가 줄어들어, 물고기가 숨쉬기 어려워지죠. 그래서 기포 발생기로 공기를 계속 공급하며 물에 산소가 녹아들 기회를 늘려 주는 거예요.<span class='xh'>오답 하나씩 격파</span>'더 많이 녹는다'는 방향을 반대로 뒤집은 함정이에요. 그게 사실이라면 여름에 장치가 덜 필요하겠죠. 물고기는 여름에도 당연히 산소로 숨을 쉬고, 기포가 물을 식혀 주는 효과는 미미해서 장치의 목적이 아니에요. 어항 물의 압력이 계절 따라 높아지는 일도 없죠. 여름 어항, 데워진 강물 속 물고기가 힘들어하는 것 모두 <b>온도 상승 = 기체 용해도 감소</b>라는 한 가지 원리로 읽어 내세요.",
    core: "수온↑ = 녹을 수 있는 산소↓. 그래서 여름엔 기포 발생기 풀가동!",
  },
  {
    // [e270] multi 관련 현상: 정답 2개(물병 안쪽 기포 · 수조 벽 기포). 산 설익음(끓는점)·성에(상태 변화)·
    //        소금물 어는점(혼합물)은 다른 원리. e259/e265/e266 소재와 배타.
    id: "g2u1e270",
    lessonId: "g2u1l4",
    type: "multi",
    diff: 2,
    prompt: "다음 중 <b>기체의 용해도</b>로 설명할 수 있는 현상을 모두 고르세요.",
    options: [
      "냉장고에서 꺼내 둔 물병 안쪽에 시간이 지나며 작은 기포가 맺힌다",
      "수돗물을 받아 둔 수조 벽에 작은 기포가 다닥다닥 붙는다",
      "높은 산 위에서 밥을 지으면 쌀이 설익기 쉽다",
      "겨울철 유리창 안쪽에 하얀 성에가 생긴다",
      "소금물은 맹물보다 낮은 온도가 되어야 얼기 시작한다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>차가운 물이 실온에 놓이면 온도가 오르면서 <b>기체의 용해도가 작아져</b>, 녹아 있던 공기가 기포로 빠져나와 병 안쪽에 맺혀요. 수조 벽의 기포도 같은 원리죠. 받아 둔 물의 온도가 서서히 오르며 더 이상 붙들 수 없게 된 공기가 벽에 기포로 모이는 거예요.<span class='xh'>오답 하나씩 격파</span>높은 산의 설익은 밥은 기압이 낮아 물이 100 ℃가 되기 전에 끓어 버리는 <b>끓는점</b> 현상이에요. 유리창의 성에는 수증기가 차가운 표면에서 고체로 변하는 <b>상태 변화</b>고, 소금물이 늦게 어는 것은 혼합물의 <b>어는점이 낮아지는</b> 현상이죠. 셋 다 '기체가 얼마나 녹아 있을 수 있는가'와는 관계가 없어요. 현상 분류 문제는 겉모습이 아니라 <b>어떤 값이 변해서 생긴 일인지</b>로 가르는 게 정석이에요.",
    core: "온도↑ = 녹아 있던 공기가 기포로! 끓는점·어는점 현상과 구별하기.",
  },
  // ── L5 녹는점과 끓는점 (5) ──
  {
    // [e272] 녹는점 정의 부정형: 거짓 = "양이 많아지면 녹는점도 높아진다".
    id: "g2u1e272",
    lessonId: "g2u1l5",
    type: "mcq",
    diff: 1,
    prompt: "<b>녹는점</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "고체가 액체로 변하는 동안 일정하게 유지되는 온도이다",
      "물질의 양이 많아지면 녹는점도 높아진다",
      "같은 물질이라면 어는점과 같은 온도이다",
      "물질마다 고유한 값이라 물질을 구별하는 데 쓴다",
      "압력이 같다면 언제 측정해도 같은 값이 나온다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>녹는점은 물질의 특성이라 <b>양과 관계없이 일정</b>해요. 양이 많아지면 다 녹는 데 걸리는 시간이 길어질 뿐, 녹기 시작하고 유지되는 온도 자체는 그대로죠. '양이 많으면 녹는점이 높아진다'는 시간과 온도를 뒤섞은 대표 오개념이에요.<span class='xh'>오답 하나씩 격파</span>나머지는 모두 옳아요. 고체가 녹는 동안에는 가해 준 열이 온도를 올리는 대신 상태를 바꾸는 데 쓰여 온도가 멈춘 듯 일정하고, 그 온도가 녹는점이에요. 고체가 되는 방향으로 재면 어는점이라 부를 뿐 같은 물질이면 같은 온도고, 물질마다 값이 달라 구별의 근거가 되죠. 압력이 같다는 조건에서 언제 재도 같은 값이라는 것도 특성의 자격 그 자체예요.",
    core: "양이 바꾸는 건 시간뿐. 녹는점 = 양과 무관한 물질의 특성!",
  },
  {
    // [e274] BoilCurvesParam(64·88): (가)(다) 88 평평(다 완만·구간 김 = 양 많음) · (나) 64 · (라) 계속 상승.
    //        ㄱ 참((가)(다) 같은 물질 가능성) · ㄴ 거짓((라)는 순물질 아님) · ㄷ 참((나) 끓는점 64).
    //        정답 ㄱㄷ(3번째 칸) · ㄱ 참.
    id: "g2u1e274",
    lessonId: "g2u1l5",
    type: "mcq",
    diff: 2,
    prompt: "그림은 서로 다른 비커에 담긴 액체 (가)~(라)를 같은 세기의 불로 가열한 곡선이에요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: chemBoilCurvesParamFig({ t1: 64, t2: 88 }),
    bogi: [
      "(가)와 (다)는 같은 물질일 가능성이 크다.",
      "(라)는 한 가지 물질로만 이루어진 액체이다.",
      "(나)의 끓는점은 64 ℃이다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요. (가)와 (다)는 평평한 구간의 온도가 88 ℃로 같아요. 끓는점이 같으면 같은 물질일 가능성이 크죠. 올라가는 빠르기나 평평해지는 시각의 차이는 <b>양의 차이</b>일 뿐이에요((다)가 더 많은 경우). ㄴ이 함정이에요. (라)는 끓는 동안에도 온도가 계속 올라가니 한 가지 물질이 아니라 <b>혼합물</b>로 봐야 해요. ㄷ: 옳아요. (나)의 곡선은 64 ℃ 눈금에서 평평해지죠.<span class='xh'>함정 포인트</span>같은 물질을 찾을 때 비교할 것은 오직 <b>평평한 구간의 온도</b>예요. 그래프의 기울기·도달 시각으로 고르면 양의 차이에 속아 넘어가요.",
    core: "같은 물질 판별 = 평평한 구간의 온도만 비교. 계속 오르면 혼합물!",
  },
  {
    // [e284] multi(변하는 것): 같은 고체 12 g vs 36 g. 변함 = 다 녹는 시간·녹기 시작까지 시간·가한 열의 총량.
    //        불변 = 녹는점·녹는 동안 온도. 정답 3개.
    id: "g2u1e284",
    lessonId: "g2u1l5",
    type: "multi",
    diff: 1,
    prompt: "표는 같은 고체 물질을 양만 달리해 <b>같은 세기의 불</b>로 가열하는 실험 조건이에요. (나)가 (가)보다 <b>커지는 값</b>을 모두 고르세요.",
    figure: dbox([
      ["(가)", "고체 12 g을 가열해요"],
      ["(나)", "고체 36 g을 가열해요"],
      ["공통", "같은 물질 · 같은 세기의 불꽃"],
    ]),
    options: [
      "다 녹는 데 걸리는 시간",
      "녹는 동안 유지되는 온도",
      "가열을 시작해 녹기 시작할 때까지 걸리는 시간",
      "녹는점",
      "다 녹을 때까지 가해 준 열의 전체 양",
    ],
    answer: [0, 2, 4],
    explain:
      "<span class='xh'>정답 풀이</span>양이 3배가 되면 <b>시간과 열</b>이 더 들어요. 데워야 할 물질이 많으니 녹기 시작할 때까지도 오래 걸리고, 다 녹는 데 걸리는 시간도 길어지고, 그동안 가해 준 열의 전체 양도 많아지죠.<span class='xh'>오답 하나씩 격파</span>녹는 동안 유지되는 온도와 녹는점은 <b>같은 말</b>인데, 둘 다 물질의 특성이라 양이 3배가 되어도 그대로예요. 12 g이 녹기 시작하는 온도에서 36 g도 똑같이 녹기 시작하죠. 시험에서는 '양을 늘렸더니 녹는점이 높아졌다'는 진술로 자주 함정을 파요. 가열 곡선으로 보면 양이 많을수록 <b>올라가는 기울기는 완만해지고 평평한 구간은 길어지지만, 평평한 구간의 높이(온도)는 변하지 않는다</b>는 그림으로 기억해 두세요.",
    core: "양 3배 = 시간·열 3배 방향. 녹는점(평평한 높이)은 불변!",
  },
  {
    // [e285] BoilCurvesParam(48·76) 변형 세트: 부정형. (가)(다) 76 · (나) 48 · (라) 상승 = 혼합물.
    //        거짓 = "(라)도 일정한 온도에서 끓는 순물질이다".
    id: "g2u1e285",
    lessonId: "g2u1l5",
    type: "mcq",
    diff: 3,
    prompt: "그림은 액체 (가)~(라)를 각각 <b>같은 세기의 불</b>로 가열한 곡선이에요. 이 그래프에서 알 수 있는 내용으로 옳지 <b>않은</b> 것은?",
    figure: chemBoilCurvesParamFig({ t1: 48, t2: 76 }),
    options: [
      "(가)와 (다)는 끓는점이 같아 같은 물질일 가능성이 크다",
      "(다)의 양은 (가)보다 많다고 볼 수 있다",
      "(나)는 48 ℃에서 끓는 물질이다",
      "(라)도 일정한 온도에서 끓는 순물질이다",
      "(가)~(다)는 각각 한 종류의 물질로 볼 수 있다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>(라)의 곡선은 끓는 동안에도 온도가 <b>계속 올라가요</b>. 순물질이라면 끓는 동안 온도가 일정해야 하니, (라)는 순물질이 아니라 <b>혼합물</b>이에요. 순물질이라는 진술이 틀렸죠.<span class='xh'>오답 하나씩 격파</span>(가)와 (다)는 평평한 구간이 똑같이 76 ℃라 같은 물질일 가능성이 커요. 같은 물질인데 (다)가 더 늦게, 더 완만하게 76 ℃에 도달하고 평평한 구간도 기니 <b>양이 더 많다</b>고 읽는 것이 자연스럽죠. (나)는 48 ℃ 눈금에서 평평해지니 끓는점이 48 ℃인 물질이고, 평평한 구간이 뚜렷한 (가)~(다)는 각각 한 종류의 물질로 볼 수 있어요. <b>평평하면 순물질, 끝까지 기울어지면 혼합물</b>. 가열 곡선 판별의 두 기둥이에요.",
    core: "끓는 내내 오르는 곡선 = 혼합물. 평평한 구간이 순물질의 증표!",
  },
  {
    // [e286] num examCurveFig(heat): start 15 · p1 45 · end 75 · t[4,8] · tMax 12 · yMax 90 · yStep 15.
    //        녹는점 45(눈금 위 ✓ · 15 배수).
    id: "g2u1e286",
    lessonId: "g2u1l5",
    type: "num",
    diff: 1,
    prompt: "그림은 어떤 <b>고체</b>를 일정한 세기의 불로 가열할 때의 온도 변화예요. 이 고체의 <b>녹는점</b>은 몇 <b>℃</b>일까요?",
    figure: examCurveFig({ mode: "heat", start: 15, p1: 45, end: 75, t: [4, 8], tMax: 12, yMax: 90, yStep: 15 }),
    answer: "45",
    numKind: "int",
    unitLabel: "℃",
    explain:
      "<span class='xh'>정답 풀이</span>고체가 녹는 동안에는 가해 준 열이 온도를 올리는 대신 고체를 액체로 바꾸는 데 쓰여요. 그래서 곡선에 <b>평평한 구간</b>이 생기고, 그 구간의 온도가 곧 녹는점이에요. 눈금을 읽으면 평평한 구간은 <b>45 ℃</b>에 있어요.<span class='xh'>이런 실수를 조심해요</span>가열을 시작한 온도(15 ℃)나 그래프가 끝나는 온도(75 ℃)를 읽으면 안 돼요. 시작 온도는 실험실의 처음 온도일 뿐이고, 끝 온도는 다 녹은 액체가 계속 데워진 결과일 뿐이죠. 평평한 구간이 시작되는 시각(4분)을 답하는 실수도 있는데, 문제가 묻는 것은 시간이 아니라 <b>온도축의 값</b>이라는 걸 확인하세요. 평평한 구간에서 왼쪽 세로축으로 눈을 옮겨 눈금과 만나는 값을 읽으면 끝!",
    core: "녹는점 = 가열 곡선 평평한 구간의 온도 = 45 ℃!",
  },
  // ── L6 순물질과 혼합물 (4) ──
  {
    // [e290] 순혼 부정형: 거짓 = "혼합물이 끓는 동안 온도는 일정하게 유지된다".
    id: "g2u1e290",
    lessonId: "g2u1l6",
    type: "mcq",
    diff: 1,
    prompt: "<b>순물질과 혼합물</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "순물질은 한 종류의 물질로만 이루어져 있다",
      "혼합물이 끓는 동안 온도는 일정하게 유지된다",
      "겉보기에 균일해 보여도 혼합물일 수 있다",
      "혼합물 속 성분 물질은 자기의 성질을 그대로 지닌다",
      "순물질의 끓는점은 양이 많든 적든 일정하다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>혼합물은 끓는 동안에도 온도가 <b>계속 변해요</b>. 예를 들어 소금물은 물이 증발하며 남은 용액이 점점 진해져서, 끓는 내내 온도가 조금씩 올라가죠. '끓는 동안 온도 일정'은 순물질의 특징이라, 혼합물에 붙이면 틀린 설명이 돼요.<span class='xh'>오답 하나씩 격파</span>순물질은 한 종류의 물질이라는 것, 순물질의 끓는점이 양과 무관하게 일정하다는 것은 모두 옳아요. '균일해 보이면 순물질'이라는 착각을 경계하는 진술도 옳아요. 소금물이나 공기는 눈으로 구별이 안 될 만큼 고르게 섞여 있지만 여러 물질이 들어 있는 혼합물이거든요. 성분 물질이 자기 성질을 지닌다는 것도 혼합물의 핵심이에요. 그 덕분에 나중에 특성 차이를 이용해 도로 분리할 수 있답니다.",
    core: "끓는 동안 온도 일정 = 순물질. 혼합물은 끓는 내내 변한다!",
  },
  {
    // [e295] PM 신작: (가) 원 9(순물질) (나) 원 5+삼각형 4(혼합물) (다) 삼각형 9(순물질) (라) 원 6+삼각형 3(혼합물).
    //        순물질 = (가), (다). 정답 2번째 칸(라벨 조합 고정).
    id: "g2u1e295",
    lessonId: "g2u1l6",
    type: "mcq",
    diff: 2,
    prompt: "그림은 액체 (가)~(라)를 이루는 입자를 모형으로 나타낸 거예요. <b>순물질을 모두 고른 것</b>은? (모양이 같은 입자는 같은 물질이에요.)",
    figure: chemPureMixFig({
      boxes: [
        { label: "(가)", comp: [9] },
        { label: "(나)", comp: [5, 4] },
        { label: "(다)", comp: [0, 9] },
        { label: "(라)", comp: [6, 3] },
      ],
    }),
    options: ["(가), (나)", "(가), (다)", "(나), (라)", "(다), (라)", "(가), (나), (다)"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>순물질은 <b>한 종류의 물질</b>로만 이루어져 있어요. 입자 모형에서는 상자 안의 입자 모양이 전부 같은지를 보면 되죠. (가)는 둥근 입자만, (다)는 세모 입자만 들어 있으니 각각 순물질이에요. 서로 다른 물질이긴 하지만, 둘 다 '한 종류로만' 이루어졌다는 조건을 만족해요.<span class='xh'>오답 하나씩 격파</span>(나)와 (라)는 둥근 입자와 세모 입자가 <b>섞여</b> 있으니 두 종류 이상의 물질이 든 혼합물이에요. (라)처럼 한쪽 입자가 훨씬 많아도, 다른 종류가 조금이라도 섞여 있으면 혼합물이죠. 섞인 비율은 혼합물마다 얼마든지 다를 수 있다는 것도 함께 기억하세요. 입자의 개수가 많고 적음은 양의 차이일 뿐, 순물질인지 아닌지는 오직 <b>종류가 몇 가지인가</b>로 판정해요.",
    core: "순물질 판별 = 입자의 '종류'가 하나인가. 개수·비율은 무관!",
  },
  {
    // [e301] svgTable 가열 기록: (가) 65 ℃ 시작·일정 = 순물질 · (나) 103 ℃ 시작·계속 상승 = 혼합물.
    id: "g2u1e301",
    lessonId: "g2u1l6",
    type: "mcq",
    diff: 2,
    prompt: "표는 투명한 액체 (가)와 (나)를 각각 가열하며 관찰한 기록이에요. 옳은 결론은?",
    figure: svgTable(
      ["액체", "끓기 시작한 온도", "끓는 동안의 온도"],
      [
        ["(가)", "65 ℃", "65 ℃로 일정"],
        ["(나)", "103 ℃", "계속 올라감"],
      ],
      { firstColHead: true },
    ),
    options: [
      "(가)는 순물질이고 (나)는 혼합물이다",
      "(가)는 혼합물이고 (나)는 순물질이다",
      "(가)와 (나) 모두 순물질이다",
      "(가)와 (나) 모두 혼합물이다",
      "이 기록만으로는 판단할 수 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>판별 기준은 <b>끓는 동안 온도가 일정한가</b>예요. (가)는 65 ℃에서 끓기 시작해 끓는 내내 65 ℃를 지켰으니 <b>순물질</b>이에요. (나)는 끓는 동안에도 온도가 계속 올라가니 <b>혼합물</b>이죠. 남은 액체의 조성이 변하면서 끓는 온도가 함께 밀려 올라가는 거예요.<span class='xh'>오답 하나씩 격파</span>두 액체의 판정을 서로 뒤바꾼 결론은 '끓기 시작한 온도가 높은 쪽이 순물질'처럼 시작 온도만 보고 판단한 거예요. 시작 온도는 물질의 종류에 따라 얼마든지 다르니 판별 기준이 못 되죠. 둘 다 순물질이라거나 둘 다 혼합물이라는 결론은 (나)의 '계속 올라감', (가)의 '일정'이라는 결정적 기록을 각각 무시한 거고요. 표에 판별에 필요한 정보가 다 있으니 '판단할 수 없다'도 성립하지 않아요.",
    core: "끓는 동안 일정 = 순물질, 계속 올라감 = 혼합물. 시작 온도는 기준 아님!",
  },
  {
    // [e302] MB 신작(plat 100 · mixStart 105 · yMin 20 yMax 120 yStep 20): (가) 100 평평 = 순물질(물),
    //        (나) 100보다 위에서 끓기 시작·계속 상승. ㄱ 참 ㄴ 참(100 눈금선과 비교 판독) ㄷ 거짓(되돌아오지 않음).
    //        정답 ㄱㄴ(3번째 칸) · ㄱ 참.
    id: "g2u1e302",
    lessonId: "g2u1l6",
    type: "mcq",
    diff: 3,
    prompt: "그림은 두 액체 (가)와 (나)의 가열 곡선이에요. 하나는 <b>물</b>, 다른 하나는 <b>소금물</b>이에요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: chemMixBoilFig({ plat: 100, mixStart: 105, yMin: 20, yMax: 120, yStep: 20 }),
    bogi: [
      "(가)는 끓는 동안 온도가 일정하므로 물이다.",
      "(나)는 100 ℃보다 높은 온도에서 끓기 시작한다.",
      "(나)를 계속 끓이면 온도가 다시 100 ℃로 내려간다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요. (가)는 100 ℃ 눈금에서 평평해진 뒤 그대로 유지돼요. 끓는 동안 온도가 일정한 쪽이 순물질인 <b>물</b>이죠. ㄴ: 옳아요. (나)의 곡선이 꺾이는 지점은 100 ℃ 눈금선보다 <b>위</b>에 있어요. 소금이 녹아 있으면 물보다 높은 온도가 되어야 끓기 시작하거든요. ㄷ이 함정이에요. 끓일수록 물만 증발해 남은 소금물이 점점 <b>진해지고</b>, 진해질수록 끓는 온도는 더 올라가요. 100 ℃로 되돌아올 일은 없죠.<span class='xh'>함정 포인트</span>혼합물의 가열 곡선은 '높은 곳에서 시작해 계속 오르막'이에요. 순물질의 평평한 직선과 나란히 놓고 비교하는 눈을 길러 두세요.",
    core: "소금물 = 100 ℃보다 높게 시작 + 끓는 내내 상승. 물은 100 ℃ 수평!",
  },
  // ── L7 밀도 차로 분리하기 (4) ──
  {
    // [e308] 분별 깔때기 대상: 섞이지 않고 밀도가 다른 두 액체.
    id: "g2u1e308",
    lessonId: "g2u1l7",
    type: "mcq",
    diff: 1,
    prompt: "<b>분별 깔때기</b>로 분리하기에 알맞은 혼합물은?",
    options: [
      "서로 섞이지 않고 밀도가 다른 두 액체",
      "서로 완전히 섞여 한 층이 된 두 액체",
      "물에 완전히 녹아 있는 설탕",
      "크기가 비슷한 두 가지 고체 가루",
      "밀도가 똑같은 두 액체",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>분별 깔때기는 <b>층이 나뉜 액체</b>를 아래층부터 받아 내는 도구예요. 층이 생기려면 두 액체가 서로 섞이지 않아야 하고, 밀도가 달라야 위아래가 갈리죠. 그래서 '서로 섞이지 않고 밀도가 다른 두 액체'가 정답이에요.<span class='xh'>오답 하나씩 격파</span>완전히 섞여 한 층이 된 액체는 경계 자체가 없어서 깔때기가 손댈 곳이 없어요(이런 혼합물은 끓는점 차이를 이용해 분리해요). 물에 녹은 설탕도 층이 없기는 마찬가지라 증발이나 재결정의 몫이죠. 고체 가루끼리는 애초에 흘러내리지 않으니 깔때기와 무관하고, 밀도가 똑같은 두 액체는 섞이지 않더라도 위아래가 정해지지 않아 분리할 수 없어요. 도구 선택 문제는 언제나 <b>혼합물의 상태(층이 생기는가)</b>부터 확인하세요.",
    core: "분별 깔때기의 조건 = 안 섞임 + 밀도 차이 = 층!",
  },
  {
    // [e309] FunnelAB bogi: ㄱ 참(밀도 ㉡ > ㉠) · ㄴ 거짓(받을 때 마개는 열어 둔다) · ㄷ 참(경계에서 잠근다).
    //        정답 ㄱㄷ(3번째 칸) · ㄱ 참.
    id: "g2u1e309",
    lessonId: "g2u1l7",
    type: "mcq",
    diff: 2,
    prompt: "그림은 서로 섞이지 않는 두 액체 ㉠(위층)·㉡(아래층)이 든 분별 깔때기예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: chemFunnelABFig(),
    bogi: [
      "밀도는 ㉡이 ㉠보다 크다.",
      "㉡을 받아 내는 동안 위쪽 마개는 꼭 닫아 둔다.",
      "㉠과 ㉡의 경계가 꼭지에 이르면 꼭지를 잠근다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요. 밀도가 큰 액체가 아래층이 되니 ㉡이 ㉠보다 커요. ㄴ이 함정이에요. 마개를 닫은 채 꼭지를 열면 깔때기 안으로 공기가 들어올 길이 없어 액체가 <b>뚝뚝 끊기거나 잘 흘러나오지 않아요</b>. 받아 내는 동안에는 마개를 열어 공기 통로를 만들어 줘야 하죠. ㄷ: 옳아요. 경계면이 꼭지에 이르는 순간 잠가야 위층 ㉠이 섞여 나오지 않아요.<span class='xh'>함정 포인트</span>분별 깔때기 조작의 세 박자는 <b>마개 열기, 아래층부터 받기, 경계에서 잠그기</b>예요. 위층 ㉠은 꼭지가 아니라 위쪽 입구로 따라 내야 남아 있던 ㉡ 찌꺼기와 섞이지 않는다는 것까지 챙기면 완벽해요.",
    core: "마개 열고 · 아래층부터 · 경계에서 잠금. 세 박자만 기억!",
  },
  {
    // [e313] SF 신작: 톱밥·자갈·설탕 + 물. Q1 물에 뜨는가(예 = ㉮ 톱밥) · Q2 물에 녹는가(예 = ㉰ 설탕 · 아니요 = ㉯ 자갈).
    //        ㉯ = 자갈.
    id: "g2u1e313",
    lessonId: "g2u1l7",
    type: "mcq",
    diff: 2,
    prompt: "그림은 <b>톱밥·자갈·설탕</b>이 섞인 혼합물을 물에 넣어 분리하는 순서도예요. <b>㉯</b>에 해당하는 물질은? (톱밥은 물에 뜨고, 자갈은 가라앉으며, 설탕만 물에 녹아요.)",
    figure: chemSepFlowFig({
      start: "톱밥 + 자갈 + 설탕 + 물",
      q1: "물 위에 뜨는가?",
      q2: "물에 녹아 있는가?",
    }),
    options: ["톱밥", "자갈", "설탕", "톱밥과 자갈", "자갈과 설탕"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>순서도를 따라가요. 첫 질문 '물 위에 뜨는가?'에서 '예'로 갈라져 나온 ㉮는 물보다 밀도가 작은 <b>톱밥</b>이에요(뜰채로 건져요). 남은 것 중 두 번째 질문 '물에 녹아 있는가?'에서 '예'인 ㉰는 <b>설탕</b>(거른 용액 속에), '아니요'인 <b>㉯는 자갈</b>이에요. 가라앉은 채 녹지도 않으니 거름종이 위에 남죠.<span class='xh'>오답 하나씩 격파</span>톱밥은 이미 첫 갈림길에서 빠져나갔고, 설탕은 ㉰ 자리예요. '톱밥과 자갈'처럼 두 물질을 묶은 답은 순서도의 칸 하나에 물질 하나씩 도착한다는 구조를 놓친 거예요. 이 분리는 <b>밀도 차(뜨기), 용해도 차(녹기), 거름</b>이 이어달리기를 하는 과정이라는 것도 함께 정리해 두세요.",
    core: "뜨면 톱밥, 녹으면 설탕, 남으면 자갈. ㉯ = 거름종이 위 자갈!",
  },
  {
    // [e317] multi 밀도 차 분리 예: 정답 3개(볍씨 · 국 기름 걷기 · 플라스틱 분리). 바닷물 식수(끓는점)·
    //        천일염 정제(용해도)는 다른 특성. 볍씨는 사례 나열 보기 차용(레슨 ox 주인공 아님).
    id: "g2u1e317",
    lessonId: "g2u1l7",
    type: "multi",
    diff: 1,
    prompt: "다음 중 <b>밀도 차이</b>를 이용한 분리를 모두 고르세요.",
    options: [
      "소금물에 볍씨를 넣어 속이 꽉 찬 볍씨만 고른다",
      "국이 식은 뒤 위에 뜬 기름을 국자로 걷어 낸다",
      "종류가 다른 플라스틱 조각을 알맞은 밀도의 액체에 넣어 나눈다",
      "바닷물을 끓여 수증기를 모아 마실 물을 얻는다",
      "천일염을 물에 녹였다가 다시 결정으로 얻어 순도를 높인다",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>볍씨 고르기는 소금물보다 밀도가 큰(속이 찬) 볍씨만 가라앉는 것을, 기름 걷기는 기름의 밀도가 국물보다 작아 위층에 뜨는 것을, 플라스틱 분리는 액체의 밀도를 두 플라스틱 사이 값으로 맞춰 하나는 뜨고 하나는 가라앉게 하는 것을 이용해요. 셋 다 <b>밀도 차</b>가 주인공이죠.<span class='xh'>오답 하나씩 격파</span>바닷물을 끓여 수증기를 모으는 것은 물과 소금의 <b>끓는점 차이</b>를 이용하는 증류예요. 천일염을 녹였다가 다시 결정으로 얻는 것은 온도에 따른 <b>용해도 차이</b>를 이용하는 재결정이고요. 분리 방법 분류가 헷갈릴 때는 '무엇이 뜨고 가라앉았나(밀도), 무엇이 먼저 기화했나(끓는점), 무엇이 결정으로 나왔나(용해도)'를 물어보면 바로 갈려요.",
    core: "뜨고 가라앉혀 나누면 전부 밀도 차. 끓이면 끓는점, 결정은 용해도!",
  },
  // ── L8 재결정 (5) ──
  {
    // [e326] 재결정 부정형: 거짓 = "밀도 차이가 큰 고체일수록 분리가 잘 된다".
    id: "g2u1e326",
    lessonId: "g2u1l8",
    type: "mcq",
    diff: 1,
    prompt: "<b>재결정</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "온도에 따른 용해도 차이를 이용한다",
      "불순물이 조금 섞인 고체의 순도를 높일 때 쓴다",
      "뜨거운 용매에 녹인 뒤 식혀 결정을 얻는다",
      "밀도 차이가 큰 고체일수록 분리가 잘 된다",
      "석출된 결정은 거름 장치로 걸러 낸다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>재결정이 기대는 특성은 밀도가 아니라 <b>온도에 따른 용해도 차이</b>예요. 뜨거울 때 많이 녹던 물질이 식으면 한계를 넘겨 결정으로 쏟아지는 것을 이용하죠. 밀도 차이는 분별 깔때기나 사금 채취처럼 뜨고 가라앉기로 나누는 분리의 몫이라, 재결정의 성패와는 관계가 없어요.<span class='xh'>오답 하나씩 격파</span>나머지는 모두 재결정의 정석이에요. 불순물이 소량 섞인 고체를 뜨거운 용매에 몽땅 녹인 뒤 천천히 식히면, 주인공 고체만 한계를 넘겨 순수한 결정으로 나오고 소량의 불순물은 녹은 채 남아요. 마지막에 거름 장치로 거르면 거름종이 위에서 순도 높은 결정을 얻죠. 의약품 원료의 정제처럼 <b>순도</b>가 생명인 곳에서 활약하는 방법이랍니다.",
    core: "재결정 = 용해도 차. 밀도 차는 다른 분리의 몫!",
  },
  {
    // [e329] SolCurve 2곡선 석출 판정: P[[0,15],[20,30],[40,65],[60,115]] · Q[[0,20],[20,24],[40,28],[60,32]].
    //        60 ℃ 물 100 g에 P 90 g·Q 15 g → 20 ℃: P 한계 30 < 90 → 석출(60 g) · Q 한계 24 > 15 → 안 석출.
    //        판정값 30 눈금 위(sStep 30). guideT [20].
    id: "g2u1e329",
    lessonId: "g2u1l8",
    type: "mcq",
    diff: 2,
    prompt: "그림은 고체 P·Q의 용해도 곡선이에요. <b>60 ℃ 물 100 g</b>에 P <b>90 g</b>과 Q <b>15 g</b>을 모두 녹인 뒤 <b>20 ℃로 식히면</b>?",
    figure: chemSolCurveExamFig({
      curves: [
        { label: "P", pts: [[0, 15], [20, 30], [40, 65], [60, 115]] },
        { label: "Q", pts: [[0, 20], [20, 24], [40, 28], [60, 32]] },
      ],
      tMax: 60,
      sMax: 120,
      tStep: 20,
      sStep: 30,
      guideS: [90, 15],
      guideT: [20],
    }),
    options: [
      "P만 결정으로 석출된다",
      "Q만 결정으로 석출된다",
      "P와 Q가 함께 석출된다",
      "아무것도 석출되지 않는다",
      "P와 Q가 반응해 새로운 결정이 생긴다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>물질별로 <b>녹아 있는 양과 20 ℃의 한계</b>를 비교해요.<br>① P: 녹아 있는 양 90 g > 20 ℃ 한계 30 g. 넘친 90 − 30 = 60 g이 결정으로 나와요.<br>② Q: 녹아 있는 양 15 g < 20 ℃ 한계 24 g. 여유가 남아 그대로 녹아 있어요.<br>그래서 <b>P만 석출</b>돼요.<span class='xh'>오답 하나씩 격파</span>Q만 석출된다거나 둘 다 석출된다는 답은 곡선을 반대로 읽거나 넣은 양을 확인하지 않은 거예요. 석출 여부는 곡선의 가파름이 아니라 <b>넣은 양이 식힌 온도의 한계를 넘는가</b>로만 판정해요. 아무것도 안 나온다는 답은 P의 초과분 60 g을 놓친 것이고, 두 고체가 반응해 새 결정을 만든다는 건 혼합물의 성질(각자 성질 유지)에 어긋나죠. 이 원리가 곧 재결정 분리예요. 걸러 내면 P의 순수한 결정을 얻어요.",
    core: "석출 판정 = 넣은 양 vs 냉각 한계. P 90>30 석출, Q 15<24 그대로!",
  },
  {
    // [e330] FT 신작 bogi: 불순물 소량 섞인 고체 X를 뜨거운 물에 녹여 냉각 후 거름.
    //        ㄱ 참(㉠ = X 결정) ㄴ 참(불순물은 ㉡에) ㄷ 거짓(㉡에도 X가 냉각 온도 한계만큼 녹아 있음).
    //        정답 ㄱㄴ(3번째 칸) · ㄱ 참.
    id: "g2u1e330",
    lessonId: "g2u1l8",
    type: "mcq",
    diff: 2,
    prompt: "소량의 불순물이 섞인 고체 X를 뜨거운 물에 모두 녹인 뒤 <b>천천히 식히고 거름 장치로 걸렀어요</b>. 그림의 ㉠(거름종이 위)과 ㉡(거른 용액)에 대한 설명으로 옳은 것을 <b>보기</b>에서 모두 고른 것은? (X는 온도에 따른 용해도 차가 커요.)",
    figure: chemFilterFig(),
    bogi: [
      "㉠은 순도가 높아진 X의 결정이다.",
      "불순물은 대부분 ㉡ 속에 녹아 있다.",
      "㉡에는 X가 전혀 남아 있지 않다.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 옳아요. 용해도 차가 큰 X는 식는 동안 한계를 넘겨 결정으로 쏟아지고, 거름종이가 그 결정만 붙잡아요. 불순물은 양이 적어 한계 안에 머무니 결정에 거의 섞이지 않죠. ㄴ: 옳아요. 녹아 있는 것은 거름종이를 그대로 통과하니, 불순물은 대부분 거른 용액 ㉡ 속에 있어요. ㄷ이 함정이에요. ㉡에도 X가 <b>식힌 온도의 한계만큼은</b> 여전히 녹아 있어요. 석출되는 것은 한계를 넘친 양뿐이거든요. 그래서 ㉡은 그 온도에서 X의 포화 용액이죠.<span class='xh'>함정 포인트</span>거름종이 위 = 넘쳐서 나온 결정, 거른 용액 속 = 한계만큼의 X + 불순물. 이 두 칸 채우기가 재결정 문제의 마무리예요.",
    core: "종이 위 = 순수한 결정. 거른 용액 = 한계만큼의 X + 불순물!",
  },
  {
    // [e333] num 석출량: R[[0,10],[20,25],[40,55],[60,100]] · 60 ℃ 포화(100 g) → 20 ℃(한계 25) = 75 g.
    //        판독값 100·25 전부 눈금 위(sStep 25) · dots 표시.
    id: "g2u1e333",
    lessonId: "g2u1l8",
    type: "num",
    diff: 2,
    prompt: "그림은 고체 R의 용해도 곡선이에요. <b>60 ℃ 물 100 g</b>에 R를 최대로 녹인 포화 용액을 <b>20 ℃로 식히면</b>, 석출되는 R는 몇 <b>g</b>일까요?",
    figure: chemSolCurveExamFig({
      curves: [{ label: "R", pts: [[0, 10], [20, 25], [40, 55], [60, 100]] }],
      tMax: 60,
      sMax: 125,
      tStep: 20,
      sStep: 25,
      guideT: [20, 60],
      dots: [
        [60, 100],
        [20, 25],
      ],
    }),
    answer: "75",
    numKind: "int",
    unitLabel: "g",
    explain:
      "<span class='xh'>정답 풀이</span>석출량 공식은 하나예요. <b>석출량 = 녹아 있던 양 − 식힌 온도의 한계</b>.<br>① 60 ℃ 포화 용액이니 녹아 있던 양 = 60 ℃의 용해도 = <b>100 g</b><br>② 20 ℃의 용해도 = <b>25 g</b><br>③ 석출량 = 100 − 25 = <b>75 g</b><span class='xh'>이런 실수를 조심해요</span>20 ℃의 한계값 25를 그대로 답하면 '남는 양'과 '나오는 양'을 뒤바꾼 거예요. 25 g은 여전히 녹아 있는 양이고, 물어본 것은 결정으로 <b>나온</b> 양이죠. 그래프에서는 60 ℃ 점에서 20 ℃ 곡선까지의 <b>세로 거리</b>가 곧 석출량이에요. 두 점을 찍고 세로로 빼기, 이 동작 하나로 끝!",
    core: "석출량 = 녹인 양 − 냉각 한계 = 100 − 25 = 75 g!",
  },
  {
    // [e341] SolCurve+dbox 복합(d3): A[[0,16],[20,36],[40,80],[60,116]] · B[[0,24],[20,26],[40,29],[60,33]].
    //        A 80 g·B 20 g 녹임 → 서서히 냉각: A는 곡선이 80을 지나는 40 ℃부터 석출(80 눈금 위 ✓).
    //        B는 0 ℃ 한계 24 > 20이라 끝까지 안 석출. 정답 "약 40 ℃"(2번째 칸 · 수치 내림 고정).
    id: "g2u1e341",
    lessonId: "g2u1l8",
    type: "mcq",
    diff: 3,
    prompt: "그림은 고체 A·B의 용해도 곡선이에요. <b>60 ℃ 물 100 g</b>에 A <b>80 g</b>과 B <b>20 g</b>을 모두 녹인 뒤 <b>천천히 식혀요</b>. 처음으로 결정이 생기기 시작하는 온도에 가장 가까운 것은?",
    figure: chemSolCurveExamFig({
      curves: [
        { label: "A", pts: [[0, 16], [20, 36], [40, 80], [60, 116]] },
        { label: "B", pts: [[0, 24], [20, 26], [40, 29], [60, 33]] },
      ],
      tMax: 60,
      sMax: 120,
      tStep: 20,
      sStep: 20,
      guideS: [80],
    }),
    options: ["약 60 ℃", "약 40 ℃", "약 20 ℃", "약 0 ℃", "끝까지 식혀도 결정이 생기지 않는다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>식히는 동안 <b>녹아 있는 양이 그 온도의 한계와 같아지는 순간</b>부터 결정이 나와요. A는 80 g이 녹아 있는데, A의 곡선이 80 g을 지나는 온도가 바로 <b>40 ℃</b>예요(가로 점선과 곡선 A가 만나는 곳). 60 ℃에서 40 ℃까지는 한계(116~80 g)가 넣은 양보다 크거나 같아 조용하다가, 40 ℃를 지나 더 식으면 한계가 80 g 아래로 내려가 A의 결정이 나오기 시작하죠.<span class='xh'>오답 하나씩 격파</span>60 ℃는 아직 한계(116 g)에 한참 여유가 있는 온도예요. 20 ℃나 0 ℃는 이미 결정이 한창 나온 뒤고요. '안 생긴다'는 B만 본 판단이에요. B는 20 g뿐이라 0 ℃ 한계(24 g)까지도 여유가 있어 끝까지 녹아 있지만, A가 먼저 한계에 걸리니 전체로는 40 ℃부터 결정이 생겨요.",
    core: "석출 시작 = 녹인 양 가로선과 곡선이 만나는 온도. A 80 g → 40 ℃!",
  },
  // ── L9 증류 (4) ──
  {
    // [e343] 증류 부정형: 거짓 = "끓는점이 높은 물질이 먼저 기화해 나온다".
    id: "g2u1e343",
    lessonId: "g2u1l9",
    type: "mcq",
    diff: 1,
    prompt: "<b>증류</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
    options: [
      "물질마다 끓는점이 다른 것을 이용한다",
      "액체를 가열해 나온 기체를 식혀 다시 액체로 모은다",
      "서로 완전히 섞여 있는 액체 혼합물에 쓸 수 있다",
      "끓는점이 높은 물질이 먼저 기화해 나온다",
      "소금물에서 순수한 물을 얻을 때 쓸 수 있다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>증류에서 먼저 기화해 나오는 것은 끓는점이 <b>낮은</b> 물질이에요. 온도가 올라가다가 낮은 끓는점에 먼저 도달하니까요. '높은 물질이 먼저'는 방향을 뒤집은 대표 함정이죠.<span class='xh'>오답 하나씩 격파</span>나머지는 모두 옳아요. 증류는 물질마다 끓는점이 다르다는 특성을 이용하고, 기화한 기체를 냉각 장치로 식혀 다시 액체로 모으는 것까지가 한 세트예요. 분별 깔때기가 손댈 수 없는, 서로 완전히 섞인 액체 혼합물이 바로 증류의 주 무대죠. 소금물을 가열하면 물만 수증기로 나와 관을 타고 식으니, 받는 그릇에는 순수한 물이 모여요. 바닷물로 마실 물을 만드는 장치가 이 원리랍니다.",
    core: "증류 = 끓는점 차. 먼저 나오는 쪽은 언제나 '낮은' 끓는점!",
  },
  {
    // [e344] Distill 새 각도: 온도계 감온부를 액체 속에 담그면 → 넘어가는 기체 온도를 못 잰다.
    id: "g2u1e344",
    lessonId: "g2u1l9",
    type: "mcq",
    diff: 2,
    prompt: "그림은 증류 장치예요. 온도계 <b>A의 감온부</b>는 옆으로 뻗은 관이 갈라지는 높이에 두는 것이 원칙이에요. 만약 감온부를 <b>플라스크 속 액체에 잠기게</b> 꽂으면 어떤 문제가 생길까요?",
    figure: chemDistillApparatusFig(),
    options: [
      "관으로 넘어가는 기체의 온도가 아니라 액체의 온도를 재게 된다",
      "액체가 끓지 않게 된다",
      "온도계가 곧바로 얼어 버린다",
      "기체가 관으로 넘어가지 못하게 된다",
      "받는 그릇의 액체가 다시 플라스크로 돌아간다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>증류에서 온도계의 임무는 <b>지금 기화해 관으로 넘어가는 기체의 온도</b>를 재는 거예요. 그 온도가 곧 지금 나오는 물질의 끓는점이라, 어떤 물질이 나오는 중인지 알려 주죠. 감온부를 액체에 담그면 액체의 온도를 재게 되는데, 혼합물의 액체 온도는 조성이 변하며 계속 달라져서 '지금 무엇이 넘어가는지'를 판단할 수 없게 돼요.<span class='xh'>오답 하나씩 격파</span>온도계의 위치는 가열이나 기화 자체에는 영향이 없어요. 액체는 여전히 끓고, 기체도 관으로 잘 넘어가죠. 온도계가 어는 일은 뜨거운 플라스크 안에서 있을 수 없고, 받는 그릇의 액체가 거꾸로 돌아갈 이유도 없어요. 장치 문제는 언제나 <b>각 부분의 임무</b>부터 떠올리세요. 온도계 = 넘어가는 기체의 온도 감시자!",
    core: "감온부는 가지 관 높이. 재야 할 것은 액체가 아니라 '넘어가는 기체'!",
  },
  {
    // [e348] crudeTower bogi: ㄱ 거짓(위로 갈수록 온도 낮음 · 높아진다고 서술) · ㄴ 참(낮은 끓는점일수록 높은 층) ·
    //        ㄷ 참(바닥 = 기화 못 한 무거운 성분). 정답 ㄴㄷ(4번째 칸) · ㄱ 거짓.
    id: "g2u1e348",
    lessonId: "g2u1l9",
    type: "mcq",
    diff: 2,
    prompt: "그림은 원유를 분리하는 증류탑이에요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    figure: crudeTowerFig(),
    bogi: [
      "탑 안의 온도는 위로 갈수록 높아진다.",
      "끓는점이 낮은 성분일수록 높은 층까지 올라가 얻어진다.",
      "기화하지 못한 무거운 성분은 탑의 바닥 쪽에서 얻는다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ이 함정이에요. 증류탑은 아래에서 가열된 기체가 위로 올라가며 식는 구조라, 온도는 <b>위로 갈수록 낮아져요</b>. ㄴ: 옳아요. 끓는점이 낮은 성분은 낮은 온도에서도 기체 상태를 유지할 수 있어서, 식어 가는 위층까지 올라간 뒤에야 액체로 변해 모여요. ㄷ: 옳아요. 끓는점이 아주 높아 기화하지 못한 무거운 성분은 바닥 쪽에 남죠.<span class='xh'>함정 포인트</span>증류탑을 한 줄로 요약하면 <b>'위 = 낮은 온도 = 낮은 끓는점 성분'</b>이에요. 각 층에서 서로 다른 연료가 한꺼번에 얻어진다는 사실은 원유가 끓는점이 다른 여러 물질의 혼합물이라는 증거이기도 해요.",
    core: "증류탑: 위로 갈수록 온도↓ · 끓는점 낮은 성분이 꼭대기까지!",
  },
  {
    // [e356] examCurveFig 2단(㉠~㉤ secLabels · d3): start 20 · p1 78 · p2 100 · end 102 · t[3,6,9,12] · tMax 14.
    //        ㉡ = 에탄올 기화(78 부근) · ㉢ 상승 구간의 증기 = 혼합 증기(순수한 물 아님 = 정답) · ㉣ = 물 100.
    //        구간 라벨 보기 = shuffle:false · 정답 3번째 칸.
    id: "g2u1e356",
    lessonId: "g2u1l9",
    type: "mcq",
    diff: 3,
    prompt: "그림은 물과 에탄올의 혼합물을 가열할 때의 온도 변화예요(1기압에서 에탄올의 끓는점 78 ℃, 물 100 ℃). 구간 ㉠~㉣에 대한 설명으로 옳지 <b>않은</b> 것은?",
    figure: examCurveFig({ mode: "heat", start: 20, p1: 78, p2: 100, end: 102, t: [3, 6, 9, 12], tMax: 14, yMax: 120, yStep: 20, secLabels: true }),
    options: [
      "㉠에서는 혼합물 전체의 온도가 올라간다",
      "㉡에서는 주로 에탄올이 끓어 나온다",
      "㉢에서 나오는 증기는 순수한 물이다",
      "㉣은 주로 물이 끓는 구간이다",
      "이 곡선의 모양에서 이 액체가 혼합물임을 알 수 있다",
    ],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>㉢은 첫 번째 평평한 구간이 끝나고 온도가 다시 올라가는 구간이에요. 이때도 액체는 계속 증발하는데, 남은 에탄올과 물이 <b>함께 섞여 기화</b>하죠. 그래서 ㉢의 증기는 순수한 물이 아니라 혼합 증기예요. 순수한 물이라는 설명이 틀렸어요.<span class='xh'>오답 하나씩 격파</span>㉠은 아직 아무것도 끓지 않고 혼합물 전체가 데워지는 구간이 맞아요. ㉡은 끓는점이 낮은 에탄올이 주로 끓어 나오는 구간이라 온도가 78 ℃ 부근에서 거의 평평하고, ㉣은 에탄올이 대부분 빠져나간 뒤 주로 물이 끓는 100 ℃ 구간이에요. 평평한 구간이 두 번 나타나는 것 자체가 끓는점이 다른 두 물질이 섞여 있다는 증거니, 혼합물이라는 판단도 옳죠. <b>증류로 받아 낸 액체가 100 % 순수하지 않은 까닭</b>이 바로 ㉢ 같은 구간에 숨어 있답니다.",
    core: "상승 구간의 증기도 혼합 증기. 그래서 증류는 반복할수록 순수해져요!",
  },
];
