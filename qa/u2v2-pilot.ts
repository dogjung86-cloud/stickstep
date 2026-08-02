// u2 v2 파일럿 40문항 스테이징 · 중1 과학 Ⅱ 생물의 구성과 다양성 (과학 재출제 13호 · 마지막 단원)
// 정본 설계표 qa/u2-v2-blueprint.md(실측·회피표·쿼터·헬퍼 명세). 이식은 qa/build-u2v2-lessons.mjs.
// 규격: mcq 140/multi 20/num 0/word 0 · diff 64/64/32 · 시각 100/160 · 사진 신규 발주 0.
// 신작 헬퍼 15종(SB·OM·CP·SS·SQ·SC·VC·OL·DP·TB·RN·DK·KQ·FW·HC)은 여기서 로컬 저작하고
// 이식 때 examFigures "u2 v2" 섹션으로 승격한다.
// 언어 가드 금지어 목록은 설계표 §0-3이 정본이다. 검사기가 소스 전체(주석 포함)를 스캔하므로
// 여기에 낱말을 나열하지 않는다(m1u6 v2 ⑦ 관행).
import type { ExamItem } from "../src/content/exams/types";
import {
  svgTable, dbox,
  bioFieldPairFig, bioDiversityGridFig, bioKingdomClueTableFig, bioPopulationBarsFig,
} from "../src/ui/examFigures";

const IMG_BASE = "";
/** exam/u2 발주 실사. loading=lazy 금지(사고 #14). */
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/u2/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** bio3 발주 자산 재사용(레슨과 질문 각도가 다를 때만). */
const bimg = (path: string, alt: string, ratio = "4 / 3"): string =>
  `<img src="${IMG_BASE}bio3/${path}" alt="${alt}" style="display:block;width:100%;aspect-ratio:${ratio};object-fit:cover;border-radius:14px;background:#EEF1F4" />`;
/** 사진 두 장 (가)(나) 나란히. */
const xpair = (a: [string, string], b: [string, string]): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${[a, b]
    .map(
      ([f, alt], i) =>
        `<figure style="margin:0;position:relative"><img src="${IMG_BASE}exam/u2/${f}" alt="${alt}" style="display:block;width:100%;border-radius:12px" /><figcaption style="position:absolute;left:7px;top:7px;background:rgba(255,255,255,.94);border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:900;color:#1F3A5F">${
          i ? "(나)" : "(가)"
        }</figcaption></figure>`,
    )
    .join("")}</div>`;

/** 발주 세포 실사 위에 기호 배지를 얹는다(라스터+벡터 하이브리드 · SCI_GUIDE 관례).
 *  좌표는 "이미지 상자 기준 %"(0~100). 배지는 여백으로 빼도 되게 음수·100 초과를 허용한다
 *  (overflow: visible). tx·ty = 가리키는 지점 · bx·by = 배지 자리. */
const cellPhotoFig = (o: { photo: string; alt: string; marks: { sym: string; bx: number; by: number; tx: number; ty: number }[] }): string => {
  const ov = o.marks
    .map(
      (m) => `<line x1="${m.bx}" y1="${m.by}" x2="${m.tx}" y2="${m.ty}" stroke="#20262E" stroke-width="0.8" stroke-linecap="round"/>
        <circle cx="${m.tx}" cy="${m.ty}" r="1.7" fill="#20262E"/>
        <circle cx="${m.bx}" cy="${m.by}" r="5.4" fill="#FFFFFF" stroke="#20262E" stroke-width="0.9"/>
        <text x="${m.bx}" y="${m.by + 2.3}" text-anchor="middle" font-size="6.4" font-weight="900" fill="#20262E">${m.sym}</text>`,
    )
    .join("");
  return `<div style="position:relative;width:100%;background:#F4F7F6;border-radius:14px;padding:26px 0">
    <div style="position:relative;width:74%;margin:0 auto">
      <img src="${IMG_BASE}bio3/${o.photo}" alt="${o.alt}" style="display:block;width:100%;border-radius:8px" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true">${ov}</svg>
    </div>
  </div>`;
};

/** 세포 모양 후보 카드 ①~⑤ · 발주 실사 5종을 3+2 격자로 늘어놓는다(라벨형 shuffle:false 전용).
 *  카드 순서는 넘긴 배열 그대로이므로 정답 자리를 저작 단계에서 정한다. */
const cellShapeCardsFig = (shapes: { photo: string; alt: string }[]): string =>
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${shapes
    .map(
      (s, i) =>
        `<figure style="margin:0;position:relative"><img src="${IMG_BASE}bio3/${s.photo}" alt="${s.alt}" style="display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;background:#F7F8FA" /><figcaption style="position:absolute;left:6px;top:6px;background:rgba(255,255,255,.95);border-radius:999px;width:22px;height:22px;line-height:22px;text-align:center;font-size:13px;font-weight:900;color:#20262E;box-shadow:0 1px 4px rgba(10,20,40,.22)">${"①②③④⑤"[i]}</figcaption></figure>`,
    )
    .join("")}</div>`;

const NS = `xmlns="http://www.w3.org/2000/svg"`;
const SYM = ["㉠", "㉡", "㉢", "㉣", "㉤"];
const PAREN = ["(가)", "(나)", "(다)", "(라)", "(마)"];

/** 한글 줄바꿈(공백 단위) · 라벨 공용. */
const wrapKo = (s: string, per: number): string[] => {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > per) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
};

// ── SB 크기 비교(band 로그 띠 · pair 두 생물 대조 · ruler 1 mm 확대) ───────────
/** o.mode band = 대상들을 크기 띠 위에 핀으로 · pair = 두 생물의 세포 크기·세포 수 대조 ·
 *  ruler = 1 mm 한 칸 안에 세포가 늘어선 모습. aria는 mode·라벨에서 파생한다. */
export function sizeBandFig(
  o:
    | { mode: "band"; items: { label: string; um: number }[] }
    | { mode: "pair"; a: { name: string; cellUm: number; many: number }; b: { name: string; cellUm: number; many: number } }
    | { mode: "ruler"; cells: number; cellUm: number },
): string {
  if (o.mode === "band") {
    const L = 30;
    const R = 322;
    const X = (um: number): number => L + (Math.log10(um) / 5) * (R - L);
    const ticks: [number, string][] = [
      [1, "1 µm"],
      [10, "10 µm"],
      [100, "100 µm"],
      [1000, "1 mm"],
      [10000, "1 cm"],
      [100000, "10 cm"],
    ];
    const bandY = 128;
    let body = `<line x1="${L}" y1="${bandY}" x2="${R}" y2="${bandY}" stroke="#8B95A1" stroke-width="1.8"/>`;
    for (const [v, t] of ticks) {
      const x = X(v);
      body += `<line x1="${x.toFixed(1)}" y1="${bandY - 6}" x2="${x.toFixed(1)}" y2="${bandY + 6}" stroke="#8B95A1" stroke-width="1.4"/>
        <text x="${x.toFixed(1)}" y="${bandY + 24}" text-anchor="middle" font-size="11.5" fill="#4E5968">${t}</text>`;
    }
    o.items.forEach((it, i) => {
      const x = X(it.um);
      const y = i % 2 === 0 ? 44 : 82;
      body += `<line x1="${x.toFixed(1)}" y1="${y + 14}" x2="${x.toFixed(1)}" y2="${bandY - 4}" stroke="#B0B8C1" stroke-width="1.2" stroke-dasharray="3 3"/>
        <circle cx="${x.toFixed(1)}" cy="${bandY}" r="5" fill="#12B886"/>
        <rect x="${(x - 39).toFixed(1)}" y="${y - 13}" width="78" height="27" rx="8" fill="#E9F8F1" stroke="#12B886" stroke-width="1.3"/>
        <text x="${x.toFixed(1)}" y="${y + 5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B6E4F">${it.label}</text>`;
    });
    return `<svg viewBox="0 0 344 168" ${NS} role="img" aria-label="여러 대상의 크기를 나타낸 띠. 왼쪽으로 갈수록 작고 오른쪽으로 갈수록 크다. 표시된 대상은 ${o.items
      .map((i) => i.label)
      .join(", ")}">
      <rect x="2" y="2" width="340" height="164" rx="18" fill="#F7FAF9"/>${body}</svg>`;
  }
  if (o.mode === "pair") {
    const panel = (x: number, s: { name: string; cellUm: number; many: number }, tag: string): string => {
      const barW = Math.round(s.many * 108);
      return `<text x="${x + 74}" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${tag} ${s.name}</text>
        <rect x="${x + 22}" y="40" width="104" height="58" rx="12" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="1.4"/>
        <rect x="${x + 48}" y="52" width="52" height="34" rx="10" fill="#D9F2E6" stroke="#12B886" stroke-width="1.8"/>
        <circle cx="${x + 74}" cy="69" r="7" fill="#7048E8"/>
        <text x="${x + 74}" y="114" text-anchor="middle" font-size="11.5" fill="#4E5968">세포 한 개 약 ${s.cellUm} µm</text>
        <text x="${x + 22}" y="140" font-size="11.5" fill="#4E5968">세포 수</text>
        <rect x="${x + 22}" y="148" width="108" height="12" rx="6" fill="#EDF0F3"/>
        <rect x="${x + 22}" y="148" width="${barW}" height="12" rx="6" fill="#3182F6"/>`;
    };
    return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="${o.a.name}와 ${o.b.name}의 세포 한 개의 크기와 세포 수를 나란히 나타낸 자료">
      <rect x="2" y="2" width="340" height="172" rx="18" fill="#F7FAFC"/>
      ${panel(8, o.a, "(가)")}${panel(178, o.b, "(나)")}
      <line x1="172" y1="18" x2="172" y2="164" stroke="#DCE0E6" stroke-width="1.2"/></svg>`;
  }
  const cw = 268 / o.cells;
  let cells = "";
  for (let i = 0; i < o.cells; i += 1) {
    cells += `<rect x="${(38 + i * cw).toFixed(1)}" y="66" width="${(cw - 1.6).toFixed(1)}" height="40" rx="3" fill="#D9F2E6" stroke="#12B886" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 344 156" ${NS} role="img" aria-label="자의 눈금 한 칸을 확대해 그 안에 세포 ${o.cells}개가 줄지어 늘어선 모습을 나타낸 그림">
    <rect x="2" y="2" width="340" height="152" rx="18" fill="#FAFBFC"/>
    <line x1="38" y1="40" x2="306" y2="40" stroke="#4E5968" stroke-width="1.6"/>
    <line x1="38" y1="32" x2="38" y2="48" stroke="#4E5968" stroke-width="1.6"/>
    <line x1="306" y1="32" x2="306" y2="48" stroke="#4E5968" stroke-width="1.6"/>
    <text x="172" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">자의 눈금 한 칸 = 1 mm</text>
    ${cells}
    <text x="172" y="128" text-anchor="middle" font-size="12" fill="#4E5968">세포 한 개의 한 변은 약 ${o.cellUm} µm</text></svg>`;
}

// ── OM 몸이 세포 한 개인 생물 ↔ 여러 개인 생물 ──────────────────────────────
export function oneVsManyFig(o: { aName: string; bName: string }): string {
  let many = "";
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      const x = 196 + c * 20;
      const y = 52 + r * 18;
      const inBody = Math.abs(c - 2.5) * 1.5 + Math.abs(r - 2) < 5.2;
      if (inBody) many += `<rect x="${x}" y="${y}" width="17" height="15" rx="4" fill="#D9F2E6" stroke="#12B886" stroke-width="1.1"/><circle cx="${x + 8.5}" cy="${y + 7.5}" r="2.4" fill="#7048E8"/>`;
    }
  }
  return `<svg viewBox="0 0 344 164" ${NS} role="img" aria-label="두 생물 ${o.aName}, ${o.bName}의 몸을 확대해 나란히 그린 그림">
    <rect x="2" y="2" width="340" height="160" rx="18" fill="#F7FAF9"/>
    <text x="88" y="28" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${o.aName}</text>
    <text x="256" y="28" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${o.bName}</text>
    <ellipse cx="88" cy="98" rx="58" ry="42" fill="#D9F2E6" stroke="#12B886" stroke-width="2.2"/>
    <circle cx="88" cy="98" r="13" fill="#7048E8"/>
    ${many}
    <line x1="172" y1="16" x2="172" y2="150" stroke="#DCE0E6" stroke-width="1.2"/></svg>`;
}

// ── SS 현미경표본 만들기 네 칸(순서는 파라미터 그대로 · blank는 ㉠) ──────────
export function slideStepsFig(o: { steps: string[]; blank?: number }): string {
  const BW = 74;
  const GAP = 12;
  const X0 = (344 - (BW * 4 + GAP * 3)) / 2;
  let body = "";
  o.steps.forEach((s, i) => {
    const x = X0 + i * (BW + GAP);
    const bl = o.blank === i;
    const lines = bl ? ["㉠"] : wrapKo(s, 6);
    body += `<rect x="${x}" y="44" width="${BW}" height="84" rx="11" fill="${bl ? "#FFFFFF" : "#F4F7FA"}" stroke="${bl ? "#3182F6" : "#C0C8D2"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
      <circle cx="${x + BW / 2}" cy="34" r="11" fill="#3182F6"/><text x="${x + BW / 2}" y="38.5" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF">${i + 1}</text>`;
    lines.forEach((ln, j) => {
      body += `<text x="${x + BW / 2}" y="${86 - ((lines.length - 1) * 16) / 2 + j * 16 + (bl ? 2 : 0)}" text-anchor="middle" font-size="${bl ? 16 : 12}" font-weight="${bl ? 900 : 600}" fill="${bl ? "#1B64DA" : "#333D4B"}">${ln}</text>`;
    });
    if (i < 3) body += `<path d="M${x + BW + 1} 86 h9 M${x + BW + 10} 86 l-5 -4 M${x + BW + 10} 86 l-5 4" stroke="#8B95A1" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  });
  return `<svg viewBox="0 0 344 146" ${NS} role="img" aria-label="한 학생이 실제로 한 차례를 네 칸에 나타낸 그림. 각 칸의 내용은 ${o.steps
    .map((s, i) => (o.blank === i ? "가려진 칸" : s))
    .join(", ")}">
    <rect x="2" y="2" width="340" height="142" rx="18" fill="#FAFBFC"/>${body}</svg>`;
}

// ── VC 좁아진 통로를 지나는 세포 단면 ──────────────────────────────────────
/** narrowW = 좁아진 곳의 폭(px) · restW = 눌리지 않은 세포의 폭. restW가 narrowW보다 크게
 *  그려져야 "크기가 작아서 통과한다"는 오답이 그림으로 반박된다(설계 의존 조건).
 *  stiff = 잘 휘지 않는 단단한 세포. 이때는 좁아진 곳 **앞에서 멈춘** 모습으로 그리고
 *  "지나온 뒤" 세포를 그리지 않는다(검산 A 적발 · 구판은 단단한 세포를 좁은 곳 한가운데
 *  덮어 그려 "지나가지 못한다"는 정답을 그림이 반박했다). aria도 stiff에서 파생한다. */
export function vesselCrossFig(o: { narrowW: number; stiff?: boolean }): string {
  const midY = 100;
  const half = o.narrowW / 2;
  const wall = (sign: number): string =>
    `<path d="M8 ${midY + sign * 46}C90 ${midY + sign * 46} 118 ${midY + sign * half} 172 ${midY + sign * half}C226 ${midY + sign * half} 254 ${midY + sign * 46} 336 ${midY + sign * 46}" fill="none" stroke="#D96A7E" stroke-width="5" stroke-linecap="round"/>`;
  const disc = (cx: number, squeeze: number): string =>
    `<g transform="translate(${cx} ${midY})"><ellipse cx="0" cy="0" rx="${26 - squeeze * 8}" ry="${13 - squeeze * 3}" fill="#EF7C90" stroke="#A92B49" stroke-width="1.8"/><ellipse cx="0" cy="0" rx="${11 - squeeze * 3}" ry="${5 - squeeze}" fill="#C94867"/></g>`;
  const stiffBall = (cx: number): string =>
    `<circle cx="${cx}" cy="${midY}" r="24" fill="#C9CFD8" stroke="#5A6473" stroke-width="2"/>
     <path d="M${cx + 30} ${midY - 20} l14 14 l-14 14" fill="none" stroke="#B04A5E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M${cx + 34} ${midY - 6} h16 M${cx + 42} ${midY - 14} v16" fill="none" stroke="#B04A5E" stroke-width="3" stroke-linecap="round" transform="rotate(45 ${cx + 42} ${midY - 6})"/>`;
  const body = o.stiff
    ? `${disc(64, 0)}${stiffBall(122)}`
    : `${disc(80, 0)}${disc(172, 1)}${disc(268, 0)}
       <text x="268" y="${midY + 40}" text-anchor="middle" font-size="11.5" fill="#4E5968">지나온 뒤</text>`;
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="가운데가 좁아진 관과 그 안의 세포를 옆에서 본 그림${
    o.stiff ? ". 단단한 세포 하나가 좁아진 곳 앞에 멈춰 서 있다" : ". 세포 셋이 좁아진 곳을 차례로 지나고 있다"
  }">
    <rect x="2" y="2" width="340" height="196" rx="18" fill="#FFF6F8"/>
    ${wall(1)}${wall(-1)}
    <path d="M12 ${midY}h30 M42 ${midY} l-7 -5 M42 ${midY} l-7 5" stroke="#8B95A1" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${body}
    <line x1="172" y1="${midY - half - 6}" x2="172" y2="${midY - half - 22}" stroke="#8B95A1" stroke-width="1.1"/>
    <text x="172" y="${midY - half - 26}" text-anchor="middle" font-size="11.5" fill="#4E5968">좁아진 곳</text>
    <text x="${o.stiff ? 64 : 80}" y="${midY + 40}" text-anchor="middle" font-size="11.5" fill="#4E5968">들어가기 전</text></svg>`;
}

// ── OL 동물·식물 구성 단계 사다리 두 줄(hide 자리는 ㉠㉡㉢㉣) ────────────────
const OL_A = ["세포", "조직", "기관", "기관계", "개체"];
const OL_P = ["세포", "조직", "조직계", "기관", "개체"];
export function orgLadderPairFig(o: { hideA?: number[]; hideP?: number[] }): string {
  const hideA = o.hideA ?? [];
  const hideP = o.hideP ?? [];
  const BW = 58;
  const GAP = 8;
  const X0 = (344 - (BW * 5 + GAP * 4)) / 2;
  const row = (names: string[], hide: number[], symOffset: number, y: number, tag: string): string => {
    let out = `<text x="12" y="${y - 10}" font-size="12" font-weight="800" fill="#4E5968">${tag}</text>`;
    names.forEach((s, i) => {
      const x = X0 + i * (BW + GAP);
      const k = hide.indexOf(i);
      const bl = k >= 0;
      out += `<rect x="${x}" y="${y}" width="${BW}" height="36" rx="10" fill="${bl ? "#FFFFFF" : "#F2F6FA"}" stroke="${bl ? "#3182F6" : "#B7C2CE"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
        <text x="${x + BW / 2}" y="${y + 23}" text-anchor="middle" font-size="${bl ? 15 : 11.5}" font-weight="${bl ? 900 : 700}" fill="${bl ? "#1B64DA" : "#333D4B"}">${bl ? SYM[symOffset + k] : s}</text>`;
      if (i < 4)
        out += `<path d="M${x + BW + 1} ${y + 18} h5 M${x + BW + 6} ${y + 18} l-4 -3 M${x + BW + 6} ${y + 18} l-4 3" stroke="#8B95A1" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    });
    return out;
  };
  return `<svg viewBox="0 0 344 150" ${NS} role="img" aria-label="동물과 식물의 구성 단계를 각각 다섯 칸으로 나타낸 두 줄. 동물 줄은 ${hideA.length}칸, 식물 줄은 ${hideP.length}칸이 기호로 가려져 있다">
    <rect x="2" y="2" width="340" height="146" rx="18" fill="#F6FAF7"/>
    ${row(OL_A, hideA, 0, 34, "동물")}
    ${row(OL_P, hideP, hideA.length, 100, "식물")}</svg>`;
}

// ── DP 두 지역 생물 분포(점 색 = 종류 · 범례는 기호로) ──────────────────────
/** 범례는 두지 않는다 · 패널마다 쓰는 색 가짓수가 달라 공용 범례가 판독을 오도한다(검산 B 적발).
 *  "색이 같으면 같은 종류"라는 규약은 문두가 제시한다. */
export function diversityPlotFig(o: { panels: { label: string; kinds: number[] }[] }): string {
  const COLORS = ["#EF6B7A", "#4BAE82", "#4C83D5", "#E5A33F", "#8B6FD1", "#3BB1C4"];
  const panel = (x: number, p: { label: string; kinds: number[] }): string => {
    let dots = "";
    let i = 0;
    p.kinds.forEach((n, k) => {
      for (let j = 0; j < n; j += 1, i += 1) {
        const dx = x + 20 + (i % 5) * 22;
        const dy = 44 + Math.floor(i / 5) * 22;
        dots += `<circle cx="${dx}" cy="${dy}" r="7" fill="${COLORS[k]}" stroke="#FFFFFF" stroke-width="1.4"/>`;
      }
    });
    return `<rect x="${x}" y="26" width="140" height="112" rx="14" fill="#FFFFFF" stroke="#C3D6C9" stroke-width="1.6"/>${dots}
      <text x="${x + 70}" y="158" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${p.label}</text>`;
  };
  return `<svg viewBox="0 0 344 174" ${NS} role="img" aria-label="두 지역 ${o.panels
    .map((p) => p.label)
    .join(", ")}에서 관찰된 생물을 색이 있는 점으로 나타낸 자료">
    <rect x="2" y="2" width="340" height="170" rx="18" fill="#EEF7F1"/>
    ${panel(22, o.panels[0])}${panel(182, o.panels[1])}</svg>`;
}

// ── TB 같은 종류 무리의 특징 분포 막대(세대별·지역별 두 패널) ────────────────
export function traitBarsFig(o: { panels: { label: string; bars: number[] }[]; axisNote: string }): string {
  const H = 100;
  const top = Math.max(4, Math.ceil(Math.max(...o.panels.flatMap((p) => p.bars)) / 2) * 2);
  const panel = (y: number, p: { label: string; bars: number[] }): string => {
    const base = y + H - 26;
    let out = `<text x="14" y="${y + 12}" font-size="12" font-weight="800" fill="#4E5968">${p.label}</text>
      <line x1="46" y1="${base}" x2="322" y2="${base}" stroke="#9CA7B4" stroke-width="1.4"/>
      <line x1="46" y1="${y + 16}" x2="46" y2="${base}" stroke="#9CA7B4" stroke-width="1.4"/>`;
    for (let t = 0; t <= top; t += 2) {
      const gy = base - (t / top) * (base - y - 20);
      out += `<line x1="46" y1="${gy.toFixed(1)}" x2="322" y2="${gy.toFixed(1)}" stroke="#E6EBF0"/><text x="40" y="${(gy + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#8B95A1">${t}</text>`;
    }
    p.bars.forEach((v, i) => {
      const bx = 62 + i * 52;
      const bh = (v / top) * (base - y - 20);
      out += `<rect x="${bx}" y="${(base - bh).toFixed(1)}" width="34" height="${bh.toFixed(1)}" rx="4" fill="#54B889"/>
        <text x="${bx + 17}" y="${base + 15}" text-anchor="middle" font-size="11" fill="#596574">${"①②③④⑤"[i]}</text>`;
    });
    return out;
  };
  return `<svg viewBox="0 0 344 ${H * o.panels.length + 34}" ${NS} role="img" aria-label="${o.panels
    .map((p) => p.label)
    .join("와 ")}에서 같은 종류 무리의 특징이 어떻게 나뉘어 있는지 막대로 나타낸 자료">
    <rect x="2" y="2" width="340" height="${H * o.panels.length + 30}" rx="18" fill="#FAFBFC"/>
    ${o.panels.map((p, i) => panel(16 + i * H, p)).join("")}
    <text x="172" y="${H * o.panels.length + 26}" text-anchor="middle" font-size="11" fill="#8B95A1">${o.axisNote}</text></svg>`;
}

// ── RN 분류 단계 포함 관계 중첩도(안쪽이 좁은 무리) ─────────────────────────
const RANKS = ["종", "속", "과", "목", "강", "문", "계"];
export function rankNestFig(o: { hide?: number[]; dots?: { label: string; level: number }[] }): string {
  const hide = o.hide ?? [];
  const IN = 15;
  let body = "";
  for (let i = 6; i >= 0; i -= 1) {
    const d = 6 - i;
    const x = 8 + d * IN;
    const y = 8 + d * IN;
    const w = 328 - d * IN * 2;
    const h = 212 - d * IN * 2;
    const k = hide.indexOf(i);
    const bl = k >= 0;
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${12 - d}" fill="${d % 2 ? "#F4F8FB" : "#FFFFFF"}" stroke="${bl ? "#3182F6" : "#B7C2CE"}" stroke-width="${bl ? 1.8 : 1.2}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${x + 8}" y="${y + 15}" font-size="${bl ? 13 : 11.5}" font-weight="${bl ? 900 : 700}" fill="${bl ? "#1B64DA" : "#4E5968"}">${bl ? PAREN[k] : RANKS[i]}</text>`;
  }
  for (const d of o.dots ?? []) {
    const dd = 6 - d.level;
    const cx = 328 - dd * IN - 22;
    const cy = 8 + dd * IN + 15;
    body += `<circle cx="${cx}" cy="${cy}" r="10" fill="#12B886"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">${d.label}</text>`;
  }
  return `<svg viewBox="0 0 344 228" ${NS} role="img" aria-label="분류 단계를 크기가 다른 상자 일곱 개로 겹쳐 나타낸 그림${hide.length ? `. ${hide.length}칸은 이름 대신 기호로 표시되어 있다` : ""}">${body}</svg>`;
}

// ── DK 이분 분류 순서도(기준 한 개 · 결론 두 칸이 서로 다르게) ───────────────
export function dichotomyFig(o: { items: string[]; q: string | null; yes: string[]; no: string[] }): string {
  const box = (x: number, y: number, w: number, h: number, lines: string[], tone: "top" | "q" | "leaf", blank: boolean): string => {
    const fill = tone === "q" ? (blank ? "#FFFFFF" : "#EAF3FE") : tone === "top" ? "#F2F4F7" : "#F0FAF4";
    const stroke = blank ? "#3182F6" : tone === "q" ? "#5AA2F8" : tone === "top" ? "#C0C8D2" : "#7BBE8E";
    let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="${fill}" stroke="${stroke}" stroke-width="${blank ? 1.8 : 1.4}"${blank ? ' stroke-dasharray="5 4"' : ""}/>`;
    lines.forEach((ln, j) => {
      out += `<text x="${x + w / 2}" y="${y + h / 2 + 4.5 - ((lines.length - 1) * 16) / 2 + j * 16}" text-anchor="middle" font-size="${blank ? 15 : 12.5}" font-weight="${blank ? 900 : 700}" fill="${blank ? "#1B64DA" : "#333D4B"}">${ln}</text>`;
    });
    return out;
  };
  const qLines = o.q === null ? ["(가)"] : wrapKo(o.q, 14);
  const qh = Math.max(38, qLines.length * 17 + 20);
  // 갈래 화살표는 반드시 "아래 결론 상자를 가리키도록" 꺾어 내린다(사용자 검수 지적).
  // 예전 판은 옆으로만 꺾여 상자를 안 가리켰다.
  const qBottom = 62 + qh;
  const midY = qBottom + 20;
  const y2 = qBottom + 42;
  const H = y2 + 58;
  const branch = (fromX: number, toX: number): string =>
    `<path d="M${fromX} ${qBottom} V${midY} H${toX} V${y2 - 3}" fill="none" stroke="#8B95A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M${toX} ${y2 - 3} l-4.5 -6 M${toX} ${y2 - 3} l4.5 -6" fill="none" stroke="#8B95A1" stroke-width="1.5" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="생물 ${o.items.length}가지를 기준 하나로 두 무리로 나눈 순서도${o.q === null ? ". 기준 자리는 비어 있다" : ""}">
    <rect x="2" y="2" width="340" height="${H - 4}" rx="18" fill="#FAFBFC"/>
    ${box(52, 14, 240, 34, [o.items.join(" · ")], "top", false)}
    <path d="M172 48 v10 M172 60 l-4 -6 M172 60 l4 -6" stroke="#8B95A1" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    ${box(72, 62, 200, qh, qLines, "q", o.q === null)}
    ${branch(110, 88)}${branch(234, 256)}
    <text x="96" y="${midY - 5}" font-size="11.5" font-weight="700" fill="#0B6E4F">예</text>
    <text x="248" y="${midY - 5}" text-anchor="end" font-size="11.5" font-weight="700" fill="#B4690E">아니요</text>
    ${box(14, y2, 148, 44, [o.yes.join(" · ")], "leaf", false)}
    ${box(182, y2, 148, 44, [o.no.join(" · ")], "leaf", false)}</svg>`;
}

// ── KQ 5계 검색표 시험판(결과 칸·질문 칸 각각 가림) ─────────────────────────
const KQ_Q = ["핵막이 있나요?", "균계·식물계·동물계 가운데 하나인가요?", "광합성을 하나요?", "세포벽이 있나요?"];
const KQ_SIDE = ["아니요", "아니요", "예", "아니요"];
const KQ_LEAF = ["원핵생물계", "원생생물계", "식물계", "동물계"];
const KQ_LAST = "균계";
export function kingdomKeyQuizFig(o: { blanks?: number[]; qBlanks?: number[] }): string {
  const blanks = o.blanks ?? [];
  const qBlanks = o.qBlanks ?? [];
  const BX = 10;
  // 질문 상자 폭은 168 · 곁가지 "아니요" 라벨이 결과 상자에 덮이지 않을 만큼 사이를 벌린다(검산 B 적발).
  const BW = 168;
  const BH = 44;
  const GAP = 22;
  const LX = 232;
  const LW = 100;
  const LH = 32;
  const spine = BX + BW / 2;
  let body = "";
  KQ_Q.forEach((q, i) => {
    const y = 14 + i * (BH + GAP);
    const cy = y + BH / 2;
    const qk = qBlanks.indexOf(i);
    const qb = qk >= 0;
    const lines = qb ? [SYM[qk]] : wrapKo(q, 11);
    body += `<rect x="${BX}" y="${y}" width="${BW}" height="${BH}" rx="12" fill="${qb ? "#FFFFFF" : "#EAF3FE"}" stroke="${qb ? "#3182F6" : "#5AA2F8"}" stroke-width="${qb ? 1.8 : 1.4}"${qb ? ' stroke-dasharray="5 4"' : ""}/>`;
    lines.forEach((ln, j) => {
      body += `<text x="${spine}" y="${cy + 4.5 - ((lines.length - 1) * 16) / 2 + j * 16}" text-anchor="middle" font-size="${qb ? 16 : 12.5}" font-weight="${qb ? 900 : 700}" fill="${qb ? "#1B64DA" : "#1F4E86"}">${ln}</text>`;
    });
    body += `<path d="M${BX + BW} ${cy} h${LX - BX - BW - 4} M${LX - 4} ${cy} l-6 -4 M${LX - 4} ${cy} l-6 4" stroke="#8B95A1" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <text x="${BX + BW + 6}" y="${cy - 6}" font-size="10.5" font-weight="700" fill="#4E5968">${KQ_SIDE[i]}</text>`;
    const lk = blanks.indexOf(i);
    const lb = lk >= 0;
    body += `<rect x="${LX}" y="${cy - LH / 2}" width="${LW}" height="${LH}" rx="10" fill="${lb ? "#FFFFFF" : "#E9F8F1"}" stroke="${lb ? "#3182F6" : "#12B886"}" stroke-width="${lb ? 1.8 : 1.5}"${lb ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${LX + LW / 2}" y="${cy + 4.5}" text-anchor="middle" font-size="${lb ? 14 : 12}" font-weight="900" fill="${lb ? "#1B64DA" : "#0B6E4F"}">${lb ? PAREN[lk] : KQ_LEAF[i]}</text>`;
    const nextY = y + BH;
    body += `<path d="M${spine} ${nextY} v${GAP - 4} M${spine} ${nextY + GAP - 4} l-4 -6 M${spine} ${nextY + GAP - 4} l4 -6" stroke="#8B95A1" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <text x="${spine + 6}" y="${nextY + 14}" font-size="10.5" font-weight="700" fill="#4E5968">${KQ_SIDE[i] === "예" ? "아니요" : "예"}</text>`;
  });
  const lastY = 14 + 4 * (BH + GAP);
  const lk = blanks.indexOf(4);
  const lb = lk >= 0;
  body += `<rect x="${spine - LW / 2}" y="${lastY}" width="${LW}" height="${LH}" rx="10" fill="${lb ? "#FFFFFF" : "#E9F8F1"}" stroke="${lb ? "#3182F6" : "#12B886"}" stroke-width="${lb ? 1.8 : 1.5}"${lb ? ' stroke-dasharray="5 4"' : ""}/>
    <text x="${spine}" y="${lastY + 21}" text-anchor="middle" font-size="${lb ? 14 : 12}" font-weight="900" fill="${lb ? "#1B64DA" : "#0B6E4F"}">${lb ? PAREN[lk] : KQ_LAST}</text>`;
  return `<svg viewBox="0 0 344 ${lastY + LH + 14}" ${NS} role="img" aria-label="생물을 다섯 무리로 나누는 검색표. 질문을 따라 예와 아니요로 갈라진다${blanks.length ? ` · 결과 칸 ${blanks.length}곳` : ""}${qBlanks.length ? ` · 질문 칸 ${qBlanks.length}곳` : ""}${blanks.length || qBlanks.length ? "이 기호로 가려져 있다" : ""}">
    <rect x="2" y="2" width="340" height="${lastY + LH + 10}" rx="18" fill="#F7FAFC"/>${body}</svg>`;
}

// ── FW 먹이 관계 두 그물(갈래 수가 다르게) ─────────────────────────────────
export function foodWebQuizFig(o: { panels: { label: string; kind: "chain" | "web" }[] }): string {
  const PH = 132;
  const node = (x: number, y: number, t: string): string =>
    `<rect x="${x - 30}" y="${y - 13}" width="60" height="26" rx="13" fill="#FFFFFF" stroke="#7BBE8E" stroke-width="1.5"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2A6B47">${t}</text>`;
  // 끝점은 상자 "경계"까지만 자른다 · 축별 고정 오프셋(31,15)을 빼면 대각선이 상자 안에 파묻힌다(검산 B 적발).
  const arrow = (x1: number, y1: number, x2: number, y2: number): string => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const ca = Math.abs(Math.cos(a));
    const sa = Math.abs(Math.sin(a));
    const t = Math.min(ca > 1e-6 ? 31 / ca : 1e9, sa > 1e-6 ? 14 / sa : 1e9);
    const sx = x1 + Math.cos(a) * t;
    const sy = y1 + Math.sin(a) * t;
    const ex = x2 - Math.cos(a) * t;
    const ey = y2 - Math.sin(a) * t;
    return `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#8B95A1" stroke-width="1.5"/>
      <path d="M${ex.toFixed(1)} ${ey.toFixed(1)} l${(-Math.cos(a - 0.5) * 7).toFixed(1)} ${(-Math.sin(a - 0.5) * 7).toFixed(1)} M${ex.toFixed(1)} ${ey.toFixed(1)} l${(-Math.cos(a + 0.5) * 7).toFixed(1)} ${(-Math.sin(a + 0.5) * 7).toFixed(1)}" stroke="#8B95A1" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  };
  const panel = (y0: number, p: { label: string; kind: "chain" | "web" }): string => {
    const yTop = y0 + 34;
    const yMid = y0 + 74;
    const yBot = y0 + 112;
    let out = `<text x="12" y="${y0 + 16}" font-size="12" font-weight="800" fill="#4E5968">${p.label}</text>`;
    if (p.kind === "chain") {
      out += node(56, yBot, "나뭇잎") + node(56, yMid, "애벌레") + node(56, yTop, "박새") + node(210, yTop, "족제비");
      out += arrow(56, yBot, 56, yMid) + arrow(56, yMid, 56, yTop) + arrow(56, yTop, 210, yTop);
    } else {
      // 족제비는 박새·들쥐 사이 높이에 두어 두 갈래가 모두 뚜렷한 길이로 그려지게 한다.
      const yPred = y0 + 54;
      out += node(52, yBot, "나뭇잎") + node(146, yBot, "씨앗") + node(52, yMid, "애벌레") + node(146, yMid, "들쥐") + node(52, yTop, "박새") + node(256, yPred, "족제비");
      out += arrow(52, yBot, 52, yMid) + arrow(52, yMid, 52, yTop) + arrow(146, yBot, 146, yMid);
      out += arrow(52, yTop, 256, yPred) + arrow(146, yMid, 256, yPred);
    }
    return out;
  };
  return `<svg viewBox="0 0 344 ${PH * o.panels.length + 20}" ${NS} role="img" aria-label="${o.panels
    .map((p) => p.label)
    .join(", ")} ${o.panels.length > 1 ? "두 생태계" : "한 생태계"}의 먹이 관계를 화살표로 이어 나타낸 그림">
    <rect x="2" y="2" width="340" height="${PH * o.panels.length + 16}" rx="18" fill="#F5FBF7"/>
    ${o.panels.map((p, i) => panel(8 + i * PH, p)).join("")}</svg>`;
}

// ── HC 숲 서식지 분단 전후(도로·생태통로) ──────────────────────────────────
export function habitatCutFig(o: { panels: { label: string; stage: "before" | "after" | "corridor" }[] }): string {
  const PW = 160;
  // 동물 종류는 색만으로 구분하면 판독이 어렵다 · 종류마다 모양도 함께 다르게 그린다(눈검수 반영).
  const ico = (x: number, y: number, kind: number): string => {
    const C = ["#7A4E2E", "#C77B14", "#4A5566", "#1F6B3E", "#6A45C4"][kind];
    if (kind === 0) return `<circle cx="${x}" cy="${y}" r="5.6" fill="${C}"/>`;
    if (kind === 1) return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="1.6" fill="${C}"/>`;
    if (kind === 2) return `<path d="M${x} ${y - 6.2}l5.6 10h-11.2z" fill="${C}"/>`;
    if (kind === 3) return `<path d="M${x} ${y - 6.4}l6 6.4l-6 6.4l-6 -6.4z" fill="${C}"/>`;
    return `<path d="M${x - 5.6} ${y}h11.2M${x} ${y - 5.6}v11.2" stroke="${C}" stroke-width="3.4" stroke-linecap="round"/>`;
  };
  const panel = (x0: number, p: { label: string; stage: "before" | "after" | "corridor" }): string => {
    const split = p.stage !== "before";
    let out = `<rect x="${x0}" y="30" width="${PW}" height="132" rx="12" fill="#CFE8D3" stroke="#7BBE8E" stroke-width="1.6"/>`;
    if (split) {
      out += `<rect x="${x0}" y="86" width="${PW}" height="22" fill="#B9BFC7"/>
        <line x1="${x0}" y1="97" x2="${x0 + PW}" y2="97" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="10 8"/>`;
    }
    if (p.stage === "corridor") {
      out += `<rect x="${x0 + 54}" y="80" width="52" height="34" rx="10" fill="#8FCB9B" stroke="#3F8B57" stroke-width="1.8"/>`;
    }
    const spots: [number, number, number][] =
      p.stage === "before"
        ? [[34, 56, 0], [96, 50, 1], [62, 74, 2], [126, 70, 3], [40, 128, 4], [104, 134, 0], [136, 122, 1]]
        : p.stage === "after"
          ? [[34, 56, 0], [96, 50, 1], [104, 134, 0]]
          : [[34, 56, 0], [96, 50, 1], [62, 72, 2], [104, 134, 0], [136, 126, 1]];
    for (const [dx, dy, k] of spots) out += ico(x0 + dx, dy, k);
    out += `<text x="${x0 + PW / 2}" y="18" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${p.label}</text>`;
    return out;
  };
  return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="같은 숲을 ${o.panels
    .map((p) => p.label)
    .join(", ")} 두 시기로 나타낸 그림. 초록 바탕은 숲, 회색 띠는 도로이며 작은 도형은 그곳에서 관찰된 동물을 뜻한다">
    <rect x="2" y="2" width="340" height="172" rx="18" fill="#F4FAF5"/>
    ${o.panels.map((p, i) => panel(10 + i * 172, p)).join("")}</svg>`;
}

const L1 = "u2l1";
const L2 = "u2l2";
const L3 = "u2l3";
const L4 = "u2l4";
const L5 = "u2l5";
const L6 = "u2l6";
const L7 = "u2l7";
const L8 = "u2l8";
const L9 = "u2l9";
const L10 = "u2l10";

export const POOL_U2V2_PILOT: ExamItem[] = [
  // ══════════ L1 세포, 생명의 기본 단위 ══════════
  {
    id: "u2e201",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 여러 대상의 크기를 하나의 띠 위에 나타낸 자료예요. 사람의 눈이 따로 떼어 구분할 수 있는 가장 작은 크기가 약 0.1 mm일 때, 이 자료에서 <b>맨눈으로 구분할 수 있는 것</b>만을 모두 고른 것은?",
    figure: sizeBandFig({
      mode: "band",
      items: [
        { label: "㉠ 상피세포", um: 50 },
        { label: "㉡ 세균", um: 2 },
        { label: "㉢ 개미", um: 4000 },
        { label: "㉣ 동전", um: 26000 },
      ],
    }),
    options: ["㉠, ㉡", "㉠, ㉢", "㉡, ㉢", "㉢, ㉣", "㉠, ㉡, ㉣"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>0.1 mm는 100 µm예요. 띠에서 100 µm 눈금보다 <b>오른쪽</b>에 있는 것이 눈으로 구분할 수 있는 크기죠. ㉢ 개미는 약 4000 µm, ㉣ 동전은 그보다도 더 오른쪽이라 둘 다 기준보다 훨씬 커요. 그래서 답은 ㉢과 ㉣이에요.<span class='xh'>오답 하나씩 격파</span>㉠ 상피세포는 약 50 µm, ㉡ 세균은 약 2 µm로 둘 다 100 µm 눈금보다 왼쪽에 있어요. 눈이 구분할 수 있는 한계보다 작으니 확대하지 않으면 보이지 않죠. 그래서 ㉠이나 ㉡이 섞인 보기는 답이 될 수 없어요. 크기 띠 문제는 <b>기준 눈금을 먼저 찍고, 그보다 왼쪽인지 오른쪽인지만 보는 것</b>이 요령이에요.",
    core: "0.1 mm = 100 µm. 띠에서 그 눈금보다 오른쪽이면 맨눈으로 보여요!",
  },
  {
    id: "u2e203",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "그림은 서로 다른 두 생물 (가)와 (나)의 몸을 확대해 나타낸 것이에요. 이 자료를 옳게 해석한 것은?",
    figure: oneVsManyFig({ aName: "(가)", bName: "(나)" }),
    options: [
      "(가)는 몸 전체가 세포 한 개이고, (나)는 여러 세포가 모여 몸을 이루고 있어요",
      "(가)는 세포로 이루어져 있지 않고, (나)만 세포로 이루어져 있어요",
      "(가)는 아직 다 자라지 않아 세포가 하나이고, 자라면 (나)처럼 세포가 나뉘어요",
      "(가)의 세포 한 개가 (나)의 세포 한 개보다 훨씬 작아요",
      "(나)는 세포가 많으므로 (가)보다 더 오래 살 수 있어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)는 커다란 세포가 딱 하나, (나)는 작은 세포가 여럿 모여 몸을 이루고 있어요. 크기나 수는 달라도 <b>둘 다 세포로 이루어져 있다</b>는 점은 같죠.<span class='xh'>오답 하나씩 격파</span>(가)가 세포로 이루어져 있지 않다는 설명은 자료와 어긋나요. (가)에도 테두리와 그 안의 둥근 부분이 분명히 그려져 있고, 그것이 세포 한 개거든요. 자라면 세포가 나뉜다는 설명은 자료가 말해 주지 않는 내용이라 근거가 없어요. 그림에서 (가)의 세포는 오히려 (나)의 세포보다 크게 그려져 있으니 크기 비교도 반대고요. 수명은 이 자료로 알 수 없는 정보랍니다.",
    core: "세포 한 개짜리 몸도, 세포 여럿짜리 몸도 모두 세포로 되어 있어요!",
  },
  {
    id: "u2e213",
    lessonId: L1,
    type: "multi",
    diff: 2,
    prompt: "세포에 대한 설명으로 옳은 것을 <b>모두</b> 골라 보세요.",
    options: [
      "몸을 이루는 부분이면서, 살아가는 데 필요한 일이 일어나는 자리이기도 해요",
      "몸이 아주 작은 생물도 세포로 이루어져 있어요",
      "종류에 따라 크기와 생김새가 서로 다를 수 있어요",
      "세포가 하나뿐인 생물은 자라거나 자손을 남기지 못해요",
      "세포 하나가 곧 생물 하나라서, 세포를 세면 그 지역의 생물 수를 알 수 있어요",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>세포는 몸을 이루는 <b>재료</b>이면서 동시에 <b>생명활동</b>이 실제로 일어나는 <b>자리</b>예요. 두 가지를 함께 말해야 완전한 설명이죠. 아주 작은 생물도 세포가 없는 것이 아니라 세포가 한 개일 뿐이고, 세포의 크기와 생김새는 종류에 따라 제각각이에요.<span class='xh'>오답 하나씩 격파</span>세포가 하나뿐이어도 자라고 자손을 남겨요. 오히려 그 한 칸 안에서 생명활동이 모두 일어나죠. 세포 하나가 곧 생물 하나인 것도 아니에요. 몸이 세포 한 개인 생물도 있지만, 대부분의 생물은 수많은 세포가 모여 한 마리를 이루거든요. 세포를 센다고 생물의 수가 나오지는 않는답니다.",
    core: "세포 = 구성 단위 + 생명활동의 자리. 세포 수 ≠ 생물 수예요!",
  },
  {
    id: "u2e215",
    lessonId: L1,
    type: "mcq",
    diff: 3,
    prompt:
      "그림은 몸집이 크게 차이 나는 두 생물 (가)와 (나)에서, 세포 한 개의 크기와 몸을 이루는 세포의 수를 조사해 나타낸 자료예요. 한 학생이 “몸집이 큰 생물은 세포 한 개도 그만큼 크다.”라고 말했어요. 이 말을 자료에 맞게 고친 것은?",
    figure: sizeBandFig({
      mode: "pair",
      a: { name: "작은 생물", cellUm: 20, many: 0.18 },
      b: { name: "큰 생물", cellUm: 20, many: 0.95 },
    }),
    options: [
      "몸집이 큰 생물은 세포 한 개의 크기가 아니라 세포의 수가 훨씬 많아요",
      "몸집이 큰 생물은 세포 한 개도 크고 세포의 수도 많아요",
      "몸집이 큰 생물은 세포 한 개가 오히려 더 작아요",
      "몸집이 큰 생물은 세포의 수는 비슷하고 세포 한 개만 커요",
      "몸집과 세포는 아무 관계가 없어서 자료로는 비교할 수 없어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>자료에서 세포 한 개의 크기는 두 생물 모두 약 20 µm로 <b>같아요</b>. 반면 세포의 수를 나타낸 막대는 큰 생물 쪽이 훨씬 길죠. 그러니 몸집의 차이를 만든 것은 세포의 크기가 아니라 <b>세포의 수</b>예요.<span class='xh'>오답 하나씩 격파</span>세포 한 개도 크다는 설명은 20 µm로 같다는 자료와 어긋나요. 오히려 더 작다는 설명도 마찬가지고요. 세포의 수가 비슷하다는 설명은 막대 길이가 크게 다른 것과 정면으로 부딪혀요. 두 항목이 자료에 뚜렷이 적혀 있으니 “비교할 수 없다”도 옳지 않아요. <b>바꿔야 할 것과 바꾸지 말아야 할 것을 자료에서 하나씩 짚는 것</b>이 이런 고치기 문제의 요령이에요.",
    core: "세포 크기는 그대로, 세포 수가 늘어나 몸이 커져요!",
  },

  // ══════════ L2 세포의 구조와 기능 ══════════
  {
    id: "u2e218",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 어떤 세포를 나타낸 것으로, 세 곳이 ㉠~㉢으로 표시되어 있어요. ㉠~㉢ 가운데 <b>동물세포에서는 볼 수 없는</b> 것과, 이 세포의 가장 바깥을 두껍게 둘러싼 구조의 이름을 옳게 짝지은 것은?",
    figure: cellPhotoFig({
      photo: "figs/plant-cell.webp",
      alt: "각진 상자 모양의 세포를 나타낸 그림. 가장 바깥에 두꺼운 테두리가 있고 안쪽에는 크고 둥근 덩어리 하나, 주황색 알갱이 여러 개, 초록색 알갱이 여러 개가 보인다",
      // 좌표는 tmp 격자 캘리브레이션으로 확정(㉠ 보라 핵 · ㉡ 왼쪽 주황 알갱이 · ㉢ 아래쪽 초록 알갱이).
      marks: [
        { sym: "㉠", bx: 114, by: 16, tx: 62, ty: 30 },
        { sym: "㉡", bx: -14, by: 56, tx: 18, ty: 56 },
        { sym: "㉢", bx: 44, by: 112, tx: 47, ty: 80 },
      ],
    }),
    options: ["㉠ · 세포막", "㉠ · 세포벽", "㉡ · 세포벽", "㉢ · 세포막", "㉢ · 세포벽"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 ㉠은 크고 둥근 보라색 덩어리라 <b>핵</b>, ㉡은 주황색 알갱이라 <b>마이토콘드리아</b>, ㉢은 초록색 알갱이라 <b>엽록체</b>예요. 이 셋 가운데 동물세포에 없는 것은 엽록체 하나뿐이죠. 그리고 가장 바깥을 두껍게 둘러싼 구조는 <b>세포벽</b>이고, 이것도 동물세포에는 없어요.<span class='xh'>오답 하나씩 격파</span>㉠ 핵과 ㉡ 마이토콘드리아는 두 종류의 세포에 <b>모두</b> 있어서 구분의 근거가 되지 못해요. 가장 바깥의 두꺼운 테두리를 세포막이라고 한 짝도 틀려요. 세포막은 그 안쪽에 얇게 붙어 있어 그림에서도 두껍게 보이지 않거든요. <b>기호 문제는 이름만 읽지 말고 그림에서 그 기호가 어디를 가리키는지</b> 먼저 확인해야 해요.",
    core: "초록 알갱이 = 엽록체, 두꺼운 바깥 테두리 = 세포벽! 둘 다 동물세포엔 없어요.",
  },
  {
    id: "u2e221",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt: "표는 서로 다른 두 세포에서 다섯 가지 구조가 관찰되었는지를 정리한 것이에요. 식물세포는 어느 것이며, 그렇게 판단한 근거로 가장 알맞은 것은?",
    figure: svgTable(
      ["구조", "세포 (가)", "세포 (나)"],
      [
        ["세포막", "○", "○"],
        ["핵", "○", "○"],
        ["마이토콘드리아", "○", "○"],
        ["엽록체", "×", "○"],
        ["세포벽", "×", "○"],
      ],
      { firstColHead: true },
    ),
    options: [
      "(가) · 세포막이 관찰되었기 때문이에요",
      "(가) · 핵이 관찰되었기 때문이에요",
      "(나) · 마이토콘드리아가 관찰되었기 때문이에요",
      "(나) · 엽록체와 세포벽이 함께 관찰되었기 때문이에요",
      "(가)와 (나) 모두 · 핵이 관찰되었기 때문이에요",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>표에서 (가)와 (나)가 갈리는 칸은 <b>엽록체와 세포벽</b> 두 줄뿐이에요. 이 두 구조가 함께 관찰된 (나)가 식물세포죠. 결론뿐 아니라 근거까지 이 두 줄을 짚어야 완전한 답이 돼요.<span class='xh'>오답 하나씩 격파</span>세포막·핵·마이토콘드리아는 표에서 두 세포 모두 ○예요. 두 쪽이 같은 칸은 구분의 근거가 될 수 없으니, 이 셋을 근거로 든 선택은 전부 틀려요. 특히 결론이 맞더라도 근거가 마이토콘드리아면 안 되는 까닭이 여기에 있어요. (가)와 (나)가 모두 식물세포라는 선택도 갈리는 칸이 실제로 있으므로 옳지 않아요. <b>표 문제는 두 칸이 다른 줄부터 찾는 것</b>이 요령이에요.",
    core: "표에서 서로 다른 줄만이 근거가 돼요 · 여기선 엽록체와 세포벽!",
  },
  {
    id: "u2e227",
    lessonId: L2,
    type: "multi",
    diff: 2,
    prompt: "그림은 어떤 세포를 나타낸 것이에요. ㉠~㉢에 대한 설명으로 옳은 것을 <b>모두</b> 골라 보세요.",
    figure: cellPhotoFig({
      photo: "figs/animal-cell.webp",
      alt: "테두리가 둥글고 무른 세포를 나타낸 그림. 안쪽에 크고 둥근 덩어리 하나와 길쭉한 주황색 알갱이 여러 개가 보인다",
      // 좌표는 tmp 격자 캘리브레이션으로 확정(㉠ 바깥 테두리 · ㉡ 보라 핵 · ㉢ 왼쪽 주황 알갱이).
      marks: [
        { sym: "㉠", bx: 50, by: -12, tx: 50, ty: 10 },
        { sym: "㉡", bx: 114, by: 24, tx: 63, ty: 33 },
        { sym: "㉢", bx: -14, by: 68, tx: 18, ty: 60 },
      ],
    }),
    options: [
      "㉠은 안과 밖을 가르고, 드나드는 물질을 가려 받아요",
      "㉡ 안에는 유전물질이 들어 있어요",
      "㉢은 양분을 이용해 생명활동에 쓸 에너지를 만들어요",
      "㉢은 빛을 받아 스스로 양분을 만들어요",
      "㉠은 단단한 벽이라 세포가 눌려도 모양이 무너지지 않게 해요",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 ㉠은 세포를 둘러싼 테두리, ㉡은 가운데의 큰 보라색 덩어리, ㉢은 주황색 알갱이예요. 각각 세포막·핵·마이토콘드리아죠. 세포막은 드나드는 물질을 가려 받고, 핵 안에는 유전물질이 들어 있으며, 마이토콘드리아는 양분을 써서 에너지를 만들어요.<span class='xh'>오답 하나씩 격파</span>빛을 받아 스스로 양분을 만드는 것은 엽록체가 하는 일이라 ㉢의 설명이 될 수 없어요. 마이토콘드리아는 양분을 <b>쓰는</b> 쪽이고 방향이 정반대죠. 단단한 벽이 되어 눌려도 모양을 지켜 주는 것은 세포벽이라 ㉠에도 맞지 않아요. 이 그림에는 세포벽이 아예 그려져 있지 않답니다.",
    core: "테두리 = 세포막, 큰 덩어리 = 핵, 알갱이 = 마이토콘드리아!",
  },
  {
    id: "u2e232",
    lessonId: L2,
    type: "mcq",
    diff: 3,
    prompt: "세포막과 세포벽에 대한 설명으로 옳은 것만을 보기에서 모두 고른 것은?",
    bogi: [
      "물질이 드나드는 것을 조절하는 쪽은 세포벽이 아니라 세포막이에요",
      "세포벽은 두껍고 단단해서 세포가 눌려도 모양이 잘 무너지지 않아요",
      "세포막은 물질을 가려 받지 않고 무엇이든 그대로 통과시켜요",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ은 옳아요. 세포벽은 두껍고 단단하지만 물질을 가려 받지는 않고, 드나듦을 조절하는 문 역할은 그 안쪽의 세포막이 맡아요. ㄴ도 옳아요. 세포벽은 틀처럼 버텨 주어 세포가 눌려도 모양이 잘 무너지지 않게 하죠.<span class='xh'>오답 하나씩 격파</span>ㄷ은 틀려요. 세포막이 무엇이든 그대로 통과시킨다면 세포 안이 일하기 좋은 상태로 유지될 수 없어요. 필요한 물질은 들이고 해로운 물질은 막기 때문에 세포막을 꽉 막힌 벽이 아니라 <b>드나듦을 조절하는 문</b>이라고 부르는 거예요. 그래서 ㄷ이 들어간 조합은 답이 될 수 없고, ㄱ과 ㄴ만 맞는 조합이 정답이랍니다.",
    core: "조절하는 문은 막, 버텨 주는 틀은 벽!",
  },

  // ══════════ L3 현미경으로 세포 보기 ══════════
  {
    id: "u2e233",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 한 학생이 입안 상피세포 표본을 만든 차례를 그대로 나타낸 것이에요. 이 표본을 현미경으로 관찰했을 때 나타날 일로 가장 알맞은 것은?",
    figure: slideStepsFig({
      steps: ["받침 유리에 시료 올리기", "덮개 유리를 비스듬히 덮기", "염색액 한 방울 떨어뜨리기", "거름종이로 남은 용액 빨아들이기"],
    }),
    options: [
      "염색액이 시료까지 잘 스며들지 못해 핵이 뚜렷하게 보이지 않아요",
      "덮개 유리와 받침 유리 사이에 동그란 공기방울이 가득 생겨요",
      "시료가 눌려 터지는 바람에 세포가 하나도 남지 않아요",
      "배율이 저절로 낮아져 세포가 실제보다 작게 보여요",
      "거름종이가 시료까지 빨아들여 받침 유리가 비어 버려요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>세 번째 칸을 보면 <b>덮개 유리를 덮은 뒤에</b> 염색액을 떨어뜨렸어요. 덮개 유리가 이미 시료를 덮고 있으니 염색액이 시료까지 닿기 어렵죠. 입안 상피세포는 색이 거의 없어 염색해야 핵이 보이는데, 염색이 제대로 되지 않으니 핵이 흐릿하게 남아요.<span class='xh'>오답 하나씩 격파</span>공기방울은 덮개 유리를 툭 내려놓을 때 생기는데, 두 번째 칸에서 <b>비스듬히</b> 덮었으니 이 표본의 문제는 아니에요. 시료가 터지거나 거름종이가 시료까지 빨아들이는 일도 이 차례와 관계가 없고요. 배율은 렌즈로 정하는 것이라 표본을 만드는 차례 때문에 저절로 달라지지 않아요.",
    core: "염색은 덮개 유리를 덮기 전에! 덮은 뒤엔 스며들지 못해요.",
  },
  {
    id: "u2e235",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "사진은 두 가지 세포를 현미경으로 관찰한 결과예요. 이 관찰 결과<b>만으로</b> 알 수 있는 것을 보기에서 모두 고른 것은?",
    figure: xpair(
      ["cheek-cells.webp", "현미경으로 관찰한 입안 상피세포. 넓적한 세포가 여럿 겹쳐 있고 안쪽에 짙게 물든 부분이 보인다"],
      ["elodea-cells.webp", "현미경으로 관찰한 검정말잎 세포. 각진 칸이 줄지어 있고 칸마다 초록색 알갱이가 가득하다"],
    ),
    bogi: [
      "(가)와 (나) 모두 하나하나의 세포로 나뉘어 있어요",
      "(나)의 세포 안에 가득한 초록색 알갱이는 엽록체예요",
      "(가)는 (나)보다 더 높은 배율로 관찰한 결과예요",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ은 옳아요. 두 사진 모두 테두리로 구분되는 칸, 곧 <b>세포</b>가 여럿 늘어서 있죠. ㄴ도 옳아요. (나)의 각진 세포 안을 가득 채운 초록색 알갱이는 <b>엽록체</b>이고, 여기서 광합성이 일어나요.<span class='xh'>오답 하나씩 격파</span>ㄷ은 알 수 없어요. 사진에는 배율이 적혀 있지 않고, 세포가 크게 보인다고 해서 배율이 높다고 단정할 수도 없어요. 원래 크기가 다른 세포를 같은 배율로 본 것일 수도 있거든요. 그래서 ㄷ이 들어간 조합은 답이 될 수 없고, ㄱ과 ㄴ만 맞는 조합이 정답이에요. <b>사진에 담긴 정보와 담기지 않은 정보를 가르는 것</b>이 관찰 문제의 핵심이랍니다.",
    core: "사진은 세포의 모습까지! 배율은 사진만으론 알 수 없어요.",
  },
  {
    id: "u2e242",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "사진은 입안 상피세포를 염색액으로 물들인 뒤 관찰한 모습이에요. 염색을 했기 때문에 뚜렷하게 드러난 것으로 가장 알맞은 것은?",
    figure: ximg("cheek-cells.webp", "현미경으로 관찰한 입안 상피세포. 넓적한 세포가 여럿 겹쳐 있고 세포 안쪽에 짙게 물든 부분이 보인다"),
    options: [
      "세포마다 하나씩 자리 잡은 핵",
      "세포를 둘러싼 두껍고 단단한 세포벽",
      "세포 안을 가득 채운 초록색 알갱이",
      "세포와 세포 사이에 갇힌 동그란 공기방울",
      "세포가 살아 있는 동안 움직이는 모습",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>입안 상피세포는 색이 거의 없어 그냥 보면 흐릿해요. 염색액을 쓰면 세포마다 하나씩 있는 <b>핵</b>이 짙게 물들어 또렷하게 드러나죠. 사진에서도 세포 안쪽에 진하게 물든 부분이 하나씩 보여요.<span class='xh'>오답 하나씩 격파</span>세포벽과 초록색 알갱이는 식물세포의 구조라 동물의 몸에서 얻은 이 세포에는 아예 없어요. 공기방울은 덮개 유리를 잘못 덮었을 때 생기는 것이지 염색으로 드러나는 것이 아니고, 사진에도 동그란 방울이 보이지 않아요. 염색액은 색을 입혀 구조를 드러낼 뿐이라 살아 움직이는 모습을 보여 주지도 않아요. 염색은 <b>안 보이던 구조를 드러내려고</b> 하는 방법이랍니다.",
    core: "염색은 색이 없는 세포에서 핵을 드러내는 방법이에요!",
  },
  {
    id: "u2e246",
    lessonId: L3,
    type: "mcq",
    diff: 3,
    prompt: "그림은 <b>같은 표본</b>을 배율만 바꾸어 관찰한 두 결과 (가)와 (나)예요. 이 자료에서 반드시 옳다고 말할 수 있는 것은?",
    figure: bioFieldPairFig(18, 6),
    options: [
      "(나)는 (가)보다 배율이 높아 한 번에 보이는 범위가 좁고 세포가 크게 보여요",
      "(나)의 세포가 (가)의 세포보다 실제로 더 크게 자란 것이에요",
      "(가)에서 (나)로 가는 동안 표본 속 세포의 수가 실제로 줄어들었어요",
      "(나)는 (가)보다 보이는 범위가 좁아진 만큼 화면이 더 밝아졌어요",
      "(가)는 염색하지 않은 결과이고 (나)는 염색한 뒤의 결과예요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>같은 표본인데 (나)에서는 세포가 크고 수가 적게 보여요. <b>저배율</b>에서 <b>고배율</b>로 올리면 상은 크게 보이는 대신 <b>한 번에 보이는 범위는 좁아지죠</b>. 그래서 같은 자리에 있던 세포 가운데 일부만 화면에 남는 거예요.<span class='xh'>오답 하나씩 격파</span>세포가 실제로 자란 것도, 수가 실제로 줄어든 것도 아니에요. 같은 표본이라는 조건이 문두에 분명히 있으니 실제 변화로 읽으면 안 돼요. 배율을 올리면 화면은 오히려 <b>어두워져요</b>. 염색 여부는 이 자료로 알 수 없는 정보라 근거 없이 단정할 수 없답니다.",
    core: "배율↑ → 상은 크게, 범위는 좁게, 화면은 어둡게!",
  },

  // ══════════ L4 모양이 다르면 하는 일도 달라요 ══════════
  {
    id: "u2e251",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "그림은 세포의 모양 다섯 가지를 카드로 늘어놓은 것이에요. 멀리 떨어진 곳까지 신호를 보내는 일을 맡기에 가장 알맞은 모양은?",
    figure: cellShapeCardsFig([
      { photo: "figs/cell-ball.webp", alt: "속이 꽉 찬 공 모양의 둥근 세포 하나" },
      { photo: "figs/cell-nerve.webp", alt: "가늘고 길게 뻗은 세포 하나. 한쪽 끝에 여러 갈래로 갈라진 가지가 있다" },
      { photo: "figs/cell-rbc.webp", alt: "가운데가 오목하게 눌린 붉은 원반 모양의 세포 여러 개" },
      { photo: "figs/cell-epithelial.webp", alt: "납작한 세포 여러 개가 서로 맞물려 한 겹의 판을 이룬 모습" },
      { photo: "figs/cell-brick.webp", alt: "각진 직사각형 세포가 벽돌처럼 줄지어 맞물린 모습" },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>②는 한쪽이 가늘고 길게 쭉 뻗어 있어요. 우리 몸에서 이런 모양을 한 것이 <b>신경세포</b>죠. 중간에 다른 세포로 옮겨 실을 필요 없이 <b>한 번에</b> 먼 곳까지 신호를 보낼 수 있어서, 갈아타는 자리가 없을수록 신호는 빠르고 정확해요.<span class='xh'>오답 하나씩 격파</span>①은 속이 꽉 찬 공 모양이라 어느 방향으로도 길지 않아 멀리 잇지 못해요. ③은 가운데가 눌린 원반이라 산소를 싣고 내리는 <b>적혈구</b>의 모양이고, ④는 납작한 것이 빈틈없이 이어 붙어 넓은 면을 덮는 <b>상피세포</b>의 배열이에요. ⑤는 각진 칸이 벽돌처럼 맞물린 모습이라 길게 뻗은 부분이 없죠.",
    core: "멀리 보내려면 길게! 가늘고 긴 것이 신경세포예요.",
  },
  {
    id: "u2e252",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "그림은 가운데가 좁아진 관을 어떤 세포가 지나가는 모습이에요. 이 세포가 좁아진 곳을 통과할 수 있는 까닭으로 가장 알맞은 것은?",
    figure: vesselCrossFig({ narrowW: 20 }),
    options: [
      "납작하고 잘 휘어져 지나가는 동안 모양을 바꿀 수 있기 때문이에요",
      "세포가 원래 좁아진 곳보다 작아서 그대로 빠져나가기 때문이에요",
      "단단한 세포벽이 있어 눌려도 찌그러지지 않기 때문이에요",
      "스스로 헤엄쳐 좁은 곳을 밀고 나아가기 때문이에요",
      "공 모양이라 좁은 곳에서 굴러서 지나가기 때문이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>그림 속 세포는 좁은 혈관을 지나며 산소를 실어 나르는 <b>적혈구</b>예요. 들어가기 전과 지나온 뒤에는 넓적한데 좁아진 곳에서는 <b>가늘게 눌려</b> 있죠. 납작하고 잘 휘어지기 때문에 모양을 바꿔 가며 통과하는 거예요.<span class='xh'>오답 하나씩 격파</span>세포가 원래 더 작다는 설명은 그림과 어긋나요. 눌리지 않은 세포의 폭이 좁아진 곳보다 뚜렷이 넓게 그려져 있거든요. 세포벽은 식물세포의 구조라 적혈구에는 없고, 있었다면 오히려 눌리지 못해 지나갈 수 없었을 거예요. 스스로 헤엄치거나 굴러간다는 설명도 그림에 근거가 없답니다.",
    core: "적혈구는 눌려서 지나요 · 딱딱하면 오히려 못 지나가요!",
  },
  {
    id: "u2e259",
    lessonId: L4,
    type: "multi",
    diff: 2,
    prompt: "사진은 한 동물의 몸에서 관찰한 서로 다른 세포들이에요. 이에 대한 설명으로 옳은 것을 <b>모두</b> 골라 보세요.",
    figure: ximg(
      "cell-shapes-observation.webp",
      "가늘고 길게 뻗은 세포, 가운데가 오목한 붉은 원반 모양의 세포 무리, 납작한 세포가 빈틈없이 이어 붙은 무리를 함께 나타낸 사진",
    ),
    options: [
      "가운데가 오목한 원반 모양은 겉면이 넓어 산소를 싣고 내리기에 알맞아요",
      "납작한 세포가 빈틈없이 이어 붙으면 표면을 덮어 보호하기에 알맞아요",
      "가늘고 길게 뻗은 세포는 산소를 실어 나르는 일을 맡아요",
      "세 세포는 생김새가 달라도 맡은 일은 모두 같아요",
      "세 세포는 모두 세포벽이 있어 모양이 단단하게 고정되어 있어요",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>가운데가 눌린 원반은 <b>적혈구</b>예요. 같은 부피에서 겉면이 넓어져 산소를 주고받기에 유리하죠. 납작한 세포가 타일처럼 맞물린 것은 <b>상피세포</b>로, 적은 재료로 넓은 면을 빈틈없이 덮을 수 있어요.<span class='xh'>오답 하나씩 격파</span>가늘고 길게 뻗은 것은 <b>신경세포</b>라, 산소를 나르는 것이 아니라 먼 곳까지 신호를 잇는 쪽이에요. 생김새가 이렇게까지 다른 까닭이 바로 맡은 일이 다르기 때문이라 하는 일이 모두 같다는 설명도 어긋나요. 세포벽은 식물세포의 구조여서 동물의 몸에서 얻은 이 세 세포에는 없답니다.",
    core: "적혈구는 싣고 내리기, 상피세포는 덮기, 신경세포는 잇기!",
  },
  {
    id: "u2e264",
    lessonId: L4,
    type: "mcq",
    diff: 3,
    prompt: "세포의 모양과 하는 일의 관계에 대한 설명으로 옳은 것만을 보기에서 모두 고른 것은?",
    bogi: [
      "이미 다 자란 세포도 그 일을 오래 할수록 모양이 점점 달라져요",
      "한 생물의 몸 안에서도 세포의 모양은 여러 가지예요",
      "생김새가 다른 세포는 맡은 일도 서로 다른 경우가 많아요",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ은 옳아요. 같은 몸 안에도 길게 뻗은 <b>신경세포</b>, 가운데가 눌린 <b>적혈구</b>, 납작한 <b>상피세포</b>처럼 생김새가 제각각이죠. ㄷ도 옳아요. 그 차이는 멋으로 생긴 것이 아니라 맡은 일에 맞춘 결과랍니다.<span class='xh'>오답 하나씩 격파</span>ㄱ은 틀려요. 다 자란 세포가 일을 오래 한다고 모양이 달라지지는 않아요. 신경세포가 신호를 많이 보낸다고 더 길어지지 않고, 적혈구가 산소를 많이 나른다고 더 납작해지지도 않죠. 세포는 <b>처음부터 그 일에 알맞은 모양으로 자란</b> 것이랍니다.",
    core: "쓰면서 모양이 바뀌는 게 아니라, 그 일에 맞는 모양으로 자라요!",
  },

  // ══════════ L5 생물의 구성 단계 ══════════
  {
    id: "u2e268",
    lessonId: L5,
    type: "mcq",
    diff: 1,
    prompt: "그림은 동물과 식물의 구성 단계를 작은 단계부터 차례로 나타낸 것이에요. ㉠~㉣에 들어갈 단계를 옳게 짝지은 것은?",
    figure: orgLadderPairFig({ hideA: [2, 3], hideP: [2, 3] }),
    options: [
      "㉠ 기관계 · ㉡ 기관 · ㉢ 기관 · ㉣ 조직계",
      "㉠ 조직계 · ㉡ 기관 · ㉢ 기관계 · ㉣ 기관",
      "㉠ 기관 · ㉡ 기관계 · ㉢ 조직계 · ㉣ 기관",
      "㉠ 기관 · ㉡ 조직계 · ㉢ 기관계 · ㉣ 기관",
      "㉠ 기관계 · ㉡ 개체 · ㉢ 조직 · ㉣ 조직계",
    ],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>동물 줄은 세포에서 시작해 조직 다음에 <b>기관</b>이 오고, 기관들이 모여 <b>기관계</b>가 된 뒤 개체가 돼요. 식물 줄은 조직 다음에 <b>조직계</b>가 오고, 조직계가 모여 <b>기관</b>을 이룬 뒤 개체가 되고요.<span class='xh'>오답 하나씩 격파</span>이름의 뒷부분이 아니라 <b>무엇이 모였는지</b>를 보면 자리가 정해져요. 조직계는 조직의 모임이라 조직 바로 위, 기관계는 기관의 모임이라 기관 바로 위에 와요. 그래서 동물 줄에 조직계를 넣거나 식물 줄에 기관계를 넣은 짝은 전부 틀려요. 개체나 조직을 가운데 칸에 넣은 짝은 양 끝 칸에 이미 그 이름이 적혀 있어 곧바로 걸러낼 수 있답니다.",
    core: "조직계는 조직 위, 기관계는 기관 위! 모인 것이 자리를 정해요.",
  },
  {
    id: "u2e272",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "코와 폐처럼 숨을 쉬는 데 관여하는 여러 기관이 서로 이어져 한 가지 일을 함께 맡고 있어요. 이 전체는 어느 구성 단계에 해당할까요?",
    options: ["세포", "조직", "기관", "기관계", "개체"],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>서로 다른 <b>기관들</b>이 한 가지 일을 위해 이어져 함께 움직이고 있어요. 기관이 모인 단계이니 답은 기관계예요. 이름에 담긴 뜻 그대로 기관 바로 위 칸이죠.<span class='xh'>오답 하나씩 격파</span>세포는 몸을 이루는 가장 작은 단위라 여러 기관을 묶는 이름이 될 수 없어요. 조직은 모양과 기능이 비슷한 <b>세포</b>가 모인 단계라 한 칸 아래고요. 기관은 코나 폐 <b>하나하나</b>를 가리키므로 그 여럿을 묶은 이름으로는 맞지 않아요. 개체는 이런 단계가 모두 모여 이루어진 <b>생물 한 마리 전체</b>라 범위가 너무 넓답니다.",
    core: "기관이 모이면 기관계! 무엇이 모였는지가 이름을 정해요.",
  },
  {
    id: "u2e277",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "표는 식물의 몸을 이루는 단계와 그 예를 <b>차례와 상관없이</b> 정리한 것이에요. <b>㉠</b>에 들어갈 예로 가장 알맞은 것은?",
    figure: svgTable(
      ["단계", "예"],
      [
        ["조직", "울타리조직"],
        ["기관", "㉠"],
        ["세포", "표피세포"],
        ["조직계", "표피조직계"],
      ],
      { firstColHead: true },
    ),
    options: ["잎", "표피조직계", "울타리조직", "표피세포", "소화계"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>기관은 여러 조직계가 모여 고유한 형태와 일을 갖게 된 단계예요. 식물에서는 잎이나 줄기, 뿌리가 여기에 해당하죠. 표의 다른 세 줄에 세포·조직·조직계의 예가 이미 적혀 있으니 ㉠ 자리에는 기관의 예인 <b>잎</b>이 들어가요.<span class='xh'>오답 하나씩 격파</span>표피조직계와 울타리조직, 표피세포는 표의 다른 줄에 이미 적혀 있는 예라 다시 들어갈 수 없어요. 소화계는 동물의 구성 단계인 기관계의 예이고, 식물의 구성 단계에는 기관계라는 칸 자체가 없답니다. <b>표 채우기는 이미 쓰인 칸을 먼저 지우고 남는 것을 보는 것</b>이 요령이에요.",
    core: "식물의 기관 = 잎·줄기·뿌리! 소화계는 동물 쪽이에요.",
  },
  {
    id: "u2e279",
    lessonId: L5,
    type: "multi",
    diff: 3,
    prompt: "생물의 구성 단계에 대한 설명으로 옳은 것을 <b>모두</b> 골라 보세요.",
    options: [
      "몸의 여러 부분이 서로 떨어지지 않고 관련을 맺으며 모여야 하나의 개체가 돼요",
      "조직계는 여러 조직이 모여 이루어진 단계예요",
      "기관계는 여러 조직계가 모여 이루어진 단계예요",
      "개체는 구성 단계 가운데 가장 작은 단계예요",
      "조직은 서로 다른 종류의 세포가 골고루 섞여 있는 단계예요",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>몸의 부분들이 따로 떨어져 있으면 하나의 생물이 되지 못해요. 서로 관련을 맺으며 함께 움직여야 개체가 되죠. 그리고 이름 그대로 조직계는 <b>조직</b>이 모인 단계예요.<span class='xh'>오답 하나씩 격파</span>기관계는 조직계가 아니라 <b>기관</b>이 모인 단계라 이름과 어긋나요. 개체는 가장 작은 단계가 아니라 모든 단계가 모여 이루어진 가장 큰 쪽이고, 가장 작은 단계는 세포랍니다. 조직은 서로 다른 세포가 섞인 것이 아니라 <b>모양과 하는 일이 비슷한</b> 세포가 모인 단계예요. 이름의 뒷부분이 아니라 <b>무엇이 모였는지</b>를 보면 헷갈리지 않아요.",
    core: "무엇이 모였는지가 이름을 정해요 · 조직계는 조직, 기관계는 기관!",
  },

  // ══════════ L6 생물다양성 ══════════
  {
    id: "u2e281",
    lessonId: L6,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 넓이가 같은 두 지역 A와 B에서 관찰된 생물을 점으로 나타낸 자료예요. 점의 색이 같으면 같은 종류를 뜻해요. 생물 종류의 다양함이 더 높은 지역과 그 까닭으로 옳은 것은?",
    figure: bioDiversityGridFig([4, 3, 3, 2], [9, 3]),
    options: [
      "A · 관찰된 점의 색이 더 여러 가지, 곧 생물의 종류가 더 많기 때문이에요",
      "A · 관찰된 점의 총 수가 B보다 더 많기 때문이에요",
      "B · 관찰된 점의 색이 더 여러 가지, 곧 생물의 종류가 더 많기 때문이에요",
      "B · 한 가지 색의 점이 가장 많이 모여 있기 때문이에요",
      "두 지역이 같아요 · 관찰된 점의 총 수가 서로 같기 때문이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>A에는 서로 다른 색의 점이 네 가지, B에는 두 가지 있어요. 생물 종류의 다양함은 <b>색의 가짓수</b>, 곧 서로 다른 종류가 몇 가지인지로 판단하니 A가 더 높아요.<span class='xh'>오답 하나씩 격파</span>같은 근거를 들면서 B가 더 높다고 한 선택은 색을 세어 보면 곧바로 어긋나요. B의 색은 두 가지뿐이거든요. 점의 총 수는 두 지역이 같으니 그것을 근거로 A가 높다고 해도 자료와 맞지 않고요. 한 가지 색이 많이 모여 있다는 것은 오히려 <b>한 종류에 개체가 몰려 있다</b>는 뜻이라 다양함과는 반대 방향이에요. 총 수가 같다고 다양함까지 같지는 않답니다.",
    core: "마릿수 말고 색의 가짓수! 종류가 다양함을 정해요.",
  },
  {
    id: "u2e284",
    lessonId: L6,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 두 지역 (가)와 (나)에서 관찰된 생물을 점으로 나타낸 자료예요. 점의 색이 같으면 같은 종류를 뜻해요. 이 자료만으로는 알 수 <b>없는</b> 것은?",
    figure: diversityPlotFig({
      panels: [
        { label: "(가)", kinds: [12, 6] },
        { label: "(나)", kinds: [2, 2, 2, 2, 2, 2] },
      ],
    }),
    options: [
      "(가)와 (나) 가운데 서로 다른 종류가 더 많이 관찰된 곳",
      "(가)와 (나) 가운데 관찰된 개체가 더 많은 곳",
      "(가)에서 가장 많이 관찰된 종류가 무엇인지",
      "(나)에서 관찰된 생물이 몇 가지 종류인지",
      "(가)와 (나)에 각각 어떤 환경이 몇 가지나 있는지",
    ],
    answer: 4,
    explain:
      "<span class='xh'>정답 풀이</span>이 자료가 담고 있는 것은 <b>점의 색과 개수</b>뿐이에요. 어떤 환경이 몇 가지 있는지는 점만으로는 알 수 없죠. 숲인지 습지인지, 그런 환경이 몇 가지나 섞여 있는지는 따로 조사해야 알 수 있는 정보예요.<span class='xh'>오답 하나씩 격파</span>각 지역의 점 색을 세어 보면 서로 다른 종류가 몇 가지인지 알 수 있으니 종류가 더 많은 곳도 가려낼 수 있어요. 점을 세면 개체가 더 많은 곳도 알 수 있고요. (가)에서 가장 많은 색이 무엇인지, (나)에 색이 몇 가지인지도 그림에서 바로 읽히죠. <b>자료가 실제로 담고 있는 정보가 무엇인지</b>를 먼저 확인하는 것이 판독 문제의 첫걸음이에요.",
    core: "점 자료는 종류와 개체만 말해요 · 환경 이야기는 없어요!",
  },
  {
    id: "u2e289",
    lessonId: L6,
    type: "mcq",
    diff: 2,
    prompt: "생물다양성에 대한 설명으로 옳은 것만을 보기에서 모두 고른 것은?",
    bogi: [
      "살아가는 환경이 여러 가지일수록 그곳에 자리 잡을 수 있는 생물의 종류도 늘어나요",
      "같은 종류끼리도 개체마다 조금씩 다른 점이 있다면 그것도 다양함으로 세요",
      "생물이 눈에 잘 띄지 않는 메마른 곳은 생태계로 세지 않아요",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ은 옳아요. 생물은 아무 곳에서나 살지 못하고 자기에게 맞는 환경에서 살아가니, 환경의 종류가 늘면 자리 잡을 수 있는 생물의 종류도 늘어요. ㄴ도 옳아요. 같은 종류 안에서 개체마다 조금씩 다른 점도 다양함으로 셈한답니다.<span class='xh'>오답 하나씩 격파</span>ㄷ은 틀려요. 메마른 곳도 그 조건을 견디는 생물들의 터전이라 엄연한 생태계예요. 생물이 눈에 잘 띄지 않는다고 해서 생태계가 아닌 것은 아니거든요. 그래서 ㄷ이 들어간 조합은 답이 될 수 없고, ㄱ과 ㄴ만 맞는 조합이 정답이에요. <b>생물다양성은 생태계 · 종류 · 같은 종류 사이 세 가지를 모두 담는 말</b>이랍니다.",
    core: "메마른 곳도 생태계! 환경이 다양하면 종류도 다양해져요.",
  },
  {
    id: "u2e294",
    lessonId: L6,
    type: "mcq",
    diff: 3,
    prompt:
      "그림은 두 지역 (가)와 (나)에서 관찰된 생물을 점으로 나타낸 자료예요. 점의 색이 같으면 같은 종류를 뜻해요. 이 자료에 대한 설명으로 가장 알맞은 것은?",
    figure: diversityPlotFig({
      panels: [
        { label: "(가)", kinds: [8, 1, 1, 1, 1] },
        { label: "(나)", kinds: [3, 3, 2, 2, 2] },
      ],
    }),
    options: [
      "두 지역의 생물 종류 수는 같지만, (가)는 한 종류에 개체가 크게 몰려 있어요",
      "(가)가 (나)보다 서로 다른 생물 종류가 더 많아요",
      "(나)가 (가)보다 관찰된 개체가 훨씬 많아요",
      "(가)에는 사실상 한 종류의 생물만 살고 있어요",
      "두 지역은 색깔별 점의 개수까지 서로 똑같아요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>점의 색을 세어 보면 두 지역 모두 다섯 가지예요. 곧 <b>종류 수는 같아요</b>. 그런데 (가)는 한 색이 크게 몰려 있고 나머지는 하나씩뿐인 반면, (나)는 다섯 색이 비교적 고르게 흩어져 있죠. 같은 종류 수라도 분포는 이렇게 다를 수 있어요.<span class='xh'>오답 하나씩 격파</span>종류가 더 많다는 설명은 색의 가짓수가 같다는 자료와 어긋나요. 점의 총 수도 두 지역이 같으니 개체가 훨씬 많다는 설명도 맞지 않고요. (가)에도 다른 색의 점이 분명히 하나씩 있으니 한 종류만 산다고 할 수 없어요. 색깔별 개수는 (가)와 (나)가 뚜렷이 다르니 두 지역이 똑같다는 설명도 어긋난답니다.",
    core: "종류 수가 같아도 몰림 정도는 다를 수 있어요!",
  },

  // ══════════ L7 변이와 새로운 종 ══════════
  {
    id: "u2e297",
    lessonId: L7,
    type: "mcq",
    diff: 1,
    prompt:
      "사진은 한 잎에서 함께 관찰한 <b>같은 종류</b>의 무당벌레예요. 등에 있는 점의 수와 무늬가 개체마다 조금씩 달라요. 이런 차이를 무엇이라고 하며, 그렇게 부르려면 어떤 조건이 필요할까요?",
    figure: ximg("ladybug-variation.webp", "잎 위에 나란히 앉은 무당벌레 다섯 마리. 등의 점 수와 무늬가 개체마다 조금씩 다르다"),
    options: [
      "변이 · 같은 종류의 개체 사이에서 나타나는 차이일 때만 그렇게 불러요",
      "변이 · 서로 다른 종류의 생물을 비교했을 때만 그렇게 불러요",
      "적응 · 개체가 살아가는 동안 무늬를 스스로 바꾼 결과이기 때문이에요",
      "적응 · 점이 많은 개체일수록 더 오래 살아남기 때문이에요",
      "멸종 · 점의 수가 같은 개체가 점점 사라지고 있기 때문이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 무당벌레는 모두 <b>같은 종류</b>인데도 점의 수와 무늬가 제각각이에요. 이렇게 같은 종류 안에서 개체마다 나타나는 차이를 변이라고 해요. 조건이 바로 이 부분이라, 같은 종류일 때만 쓰는 말이랍니다.<span class='xh'>오답 하나씩 격파</span>서로 다른 종류를 비교한 차이는 변이가 아니에요. 거미와 개미의 다리 수 차이 같은 것이 여기에 해당하죠. 적응은 환경에 알맞은 특징을 갖게 되는 것을 가리키는 말이고, 개체가 살면서 무늬를 스스로 바꾸는 일은 일어나지 않아요. 사진만으로는 어떤 개체가 오래 사는지도 알 수 없고, 사라지는 개체가 있다는 근거도 없어요.",
    core: "같은 종류 안의 차이 = 변이! 다른 종류끼리는 해당 없어요.",
  },
  {
    id: "u2e301",
    lessonId: L7,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 어떤 섬에 사는 <b>같은 종류</b> 달팽이 무리에서 껍데기 무늬의 진하기가 어떻게 나뉘어 있는지를 처음 세대와 여섯 세대 뒤에 조사한 자료예요. 이 자료를 옳게 해석한 것은?",
    figure: traitBarsFig({
      panels: [
        { label: "처음 세대", bars: [1, 3, 6, 3, 1] },
        { label: "여섯 세대 뒤", bars: [1, 2, 3, 5, 3] },
      ],
      axisNote: "① 연함 ← 껍데기 무늬의 진하기 → ⑤ 진함",
    }),
    options: [
      "여섯 세대를 지나는 동안 무늬가 진한 쪽 개체의 비율이 높아졌어요",
      "살아 있는 개체 하나하나의 무늬가 세월이 지나면서 점점 진해졌어요",
      "처음 세대에는 무늬가 연한 개체가 한 마리도 없었어요",
      "여섯 세대 뒤에는 무늬가 연한 개체가 모두 사라졌어요",
      "여섯 세대를 지나며 무리 전체의 개체 수가 두 배로 늘어났어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>같은 종류인데도 개체마다 무늬 진하기가 다른 것이 <b>변이</b>예요. 처음 세대는 가운데 ③이 가장 높았는데 여섯 세대 뒤에는 봉우리가 오른쪽 ④로 옮겨 갔죠. 곧 무늬가 <b>진한 쪽</b> 개체의 비율이 높아진 거예요. 달라진 것은 무리의 구성이랍니다.<span class='xh'>오답 하나씩 격파</span>개체 하나하나의 무늬가 진해진 것이 아니에요. 한 마리의 무늬는 평생 그대로이고, 세대를 지나며 바뀌는 것은 무리 안에서 어떤 개체가 많아지는가예요. 처음 세대의 ①에도 막대가 있으니 연한 개체가 없었다는 설명은 자료와 어긋나고, 여섯 세대 뒤에도 ①과 ②에 막대가 남아 있으니 모두 사라진 것도 아니에요. 두 세대의 막대를 모두 더하면 수가 같아 개체 수가 두 배가 되지도 않았답니다.",
    core: "개체가 아니라 무리의 봉우리가 옮겨 가요!",
  },
  {
    id: "u2e306",
    lessonId: L7,
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 아주 오래전 한 무리에서 갈라져 서로 다른 두 섬에 살게 된 달팽이를 오랜 시간이 지난 뒤 조사한 자료예요. <b>이 자료가 보여 주는 것</b>과, 두 무리가 서로 다른 종이 되었는지 판단하려면 <b>더 확인해야 할 것</b>을 옳게 짝지은 것은?",
    figure: traitBarsFig({
      panels: [
        { label: "(가) 섬 무리", bars: [6, 4, 1, 0, 0] },
        { label: "(나) 섬 무리", bars: [0, 0, 1, 4, 6] },
      ],
      axisNote: "① 연함 ← 껍데기 무늬의 진하기 → ⑤ 진함",
    }),
    options: [
      "보여 주는 것 = 두 무리의 무늬 진하기 분포가 서로 반대쪽으로 갈렸다 · 더 확인할 것 = 다시 만났을 때 번식 능력이 있는 자손이 태어나는지",
      "보여 주는 것 = 두 무리가 이미 서로 다른 종이 되었다 · 더 확인할 것 = 두 무리가 같은 먹이를 먹는지",
      "보여 주는 것 = 두 무리에 속한 개체의 수가 크게 다르다 · 더 확인할 것 = 무늬 진하기의 평균값",
      "보여 주는 것 = 두 무리가 서로 짝짓기를 하지 않는다 · 더 확인할 것 = 두 섬의 넓이 차이",
      "보여 주는 것 = 개체 하나하나의 무늬가 세대마다 진해졌다 · 더 확인할 것 = 각 개체의 나이",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>막대를 보면 (가)는 왼쪽 연한 쪽에, (나)는 오른쪽 진한 쪽에 몰려 있어요. 자료가 보여 주는 것은 딱 여기까지죠. 생김새가 갈렸다는 것만으로는 다른 종이라고 말할 수 없고, 자연 상태에서 짝짓기를 해 <b>번식 능력이 있는 자손</b>이 태어나는지까지 확인해야 해요.<span class='xh'>오답 하나씩 격파</span>이미 다른 종이 되었다는 것은 자료가 보여 주는 것이 아니라 판단해야 할 결론이에요. 두 무리의 막대를 모두 더하면 개체 수는 같으니 크게 다르다는 설명도 어긋나고, 짝짓기를 했는지는 이 자료에 아예 담겨 있지 않아요. 개체 하나하나의 무늬는 평생 그대로라 세대마다 진해졌다고 할 수도 없답니다.",
    core: "자료는 분포가 갈렸다는 것까지! 종 판정은 자손이 결정해요.",
  },
  {
    id: "u2e312",
    lessonId: L7,
    type: "mcq",
    diff: 3,
    prompt: "한 무리에 속한 개체들이 서로 거의 비슷할 때 그 무리가 위험할 수 있는 까닭으로 옳은 것만을 보기에서 모두 고른 것은?",
    bogi: [
      "그런 무리는 개체 수도 반드시 적어서 쉽게 사라져요",
      "개체는 살아가는 동안 스스로 몸을 바꿔 환경에 맞출 수 있으니 괜찮아요",
      "환경이 크게 달라졌을 때 그 조건에서 살아남는 개체가 나올 가능성이 낮아요",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄷ만 옳아요. 개체들이 서로 거의 비슷하다는 것은 <b>변이</b>가 적다는 뜻이에요. 조건이 바뀌면 다 같이 견디지 못할 수 있죠. 반대로 조금씩 다른 개체가 섞여 있으면 그중 바뀐 조건에서도 버티는 개체가 나올 가능성이 생겨요.<span class='xh'>오답 하나씩 격파</span>ㄱ은 틀려요. 변이가 적다는 것과 개체 수가 적다는 것은 서로 다른 이야기예요. 수가 아주 많아도 모두 비슷하면 똑같이 위험하답니다. ㄴ도 틀려요. 개체는 살아가는 동안 스스로 몸을 바꾸지 못해요. 오히려 그럴 수 없기 때문에 무리가 미리 지니고 있던 변이가 중요한 거예요.",
    core: "변이가 밑천이에요 · 모두 똑같으면 한 번에 위험해져요!",
  },

  // ══════════ L8 생물의 분류와 종 ══════════
  {
    id: "u2e313",
    lessonId: L8,
    type: "mcq",
    diff: 1,
    prompt: "그림은 분류 단계의 포함 관계를 크기가 다른 상자로 겹쳐 나타낸 것이에요. (가)와 (나)에 들어갈 단계를 차례대로 옳게 짝지은 것은?",
    figure: rankNestFig({ hide: [6, 0] }),
    options: ["(가) 종 · (나) 계", "(가) 계 · (나) 종", "(가) 문 · (나) 속", "(가) 계 · (나) 속", "(가) 강 · (나) 종"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>바깥쪽 상자일수록 더 많은 생물을 품는 넓은 무리예요. 가장 바깥인 (가)는 가장 넓은 단계라 <b>계</b>이고, 가장 안쪽인 (나)는 가장 좁은 단계라 <b>종</b>이죠. 그림에는 속·과·목·강·문이 이미 적혀 있어 남는 자리는 양 끝뿐이에요.<span class='xh'>오답 하나씩 격파</span>종과 계를 뒤바꾼 짝은 안팎 관계가 정반대예요. 문과 속은 그림 안쪽에 이미 이름이 적혀 있어 다시 들어갈 수 없고, 강도 마찬가지고요. <b>바깥이 넓고 안쪽이 좁다</b>는 관계만 잡으면 양 끝은 바로 정해진답니다.",
    core: "바깥이 계, 안쪽이 종! 안으로 갈수록 좁아져요.",
  },
  {
    id: "u2e316",
    lessonId: L8,
    type: "mcq",
    diff: 1,
    prompt: "그림은 네 생물을 기준 (가) 하나로 두 무리로 나눈 것이에요. (가)에 들어갈 분류 기준으로 가장 알맞은 것은?",
    figure: dichotomyFig({
      items: ["소나무", "버섯", "지렁이", "말미잘"],
      q: null,
      yes: ["소나무", "버섯"],
      no: ["지렁이", "말미잘"],
    }),
    options: ["광합성을 하는가?", "세포벽이 있는가?", "핵막이 있는가?", "몸이 하나의 세포로 되어 있는가?", "물속에서 사는가?"],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>예 쪽에는 소나무와 버섯, 아니요 쪽에는 지렁이와 말미잘이 놓였어요. 소나무와 버섯은 <b>세포벽이 있고</b>, 지렁이와 말미잘은 세포벽이 없죠. 그래서 기준은 세포벽의 유무예요.<span class='xh'>오답 하나씩 격파</span>광합성을 기준으로 삼으면 예 쪽에 소나무만 남아 그림과 맞지 않아요. 버섯은 광합성을 하지 않거든요. 핵막은 네 생물 모두에 있어 아예 갈라지지 않고, 몸이 세포 하나인 생물도 넷 중에 없어요. 물속에 사는 것은 말미잘뿐이라 두 마리씩 갈린 그림과 어긋나요. <b>기준 찾기는 갈라진 두 무리가 실제로 그렇게 나뉘는지 하나씩 대 보는 것</b>이 정석이에요.",
    core: "예 쪽·아니요 쪽을 다 대 봐야 기준이 확정돼요!",
  },
  {
    id: "u2e321",
    lessonId: L8,
    type: "mcq",
    diff: 2,
    prompt: "생물의 분류에 대한 설명으로 옳은 것만을 보기에서 모두 고른 것은?",
    bogi: [
      "생물분류의 기본 단위는 계예요",
      "분류 기준으로는 생물이 지닌 고유한 특징을 골라야 해요",
      "좁은 무리일수록 그 안에 든 생물들의 공통점이 많아요",
    ],
    options: ["ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ은 옳아요. 색깔이나 사람에게 쓸모가 있는지는 사람의 편의일 뿐이라 기준이 될 수 없고, 생물이 지닌 고유한 특징을 골라야 누가 나누어도 같은 결과가 나와요. ㄷ도 옳아요. 무리가 좁아질수록 그 안에 남는 생물들은 서로 더 많이 닮아 있죠.<span class='xh'>오답 하나씩 격파</span>ㄱ은 틀려요. 계는 가장 <b>넓은</b> 무리일 뿐이고, 기본 단위는 더 나누지 않고 세는 기준이 되는 단위라 <b>종</b>이에요. 가장 크다는 것과 기본 단위라는 것은 전혀 다른 말이랍니다. 그래서 ㄱ이 들어간 조합은 모두 답이 될 수 없어요.",
    core: "기본 단위는 종 · 계는 그냥 가장 넓은 무리예요!",
  },
  {
    id: "u2e327",
    lessonId: L8,
    type: "multi",
    diff: 3,
    prompt: "그림은 네 생물을 기준 하나로 나눈 순서도예요. 이 순서도에서 읽을 수 있는 것을 <b>모두</b> 골라 보세요.",
    figure: dichotomyFig({
      items: ["소나무", "고사리", "붕어", "개구리"],
      q: "광합성을 하는가?",
      yes: ["소나무", "고사리"],
      no: ["붕어", "개구리"],
    }),
    options: [
      "이 기준 하나로 네 생물이 두 무리로 갈라졌어요",
      "이 기준만으로는 소나무와 고사리를 서로 갈라내지 못해요",
      "네 생물을 더 잘게 나누려면 기준을 하나 더 세워야 해요",
      "이 기준으로 나눈 결과는 나누는 사람에 따라 달라질 수 있어요",
      "광합성을 하지 않는 생물은 모두 물속에서 살아요",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>순서도에서 예 쪽과 아니요 쪽에 두 생물씩 놓였으니 기준 하나로 두 무리가 만들어졌어요. 그런데 같은 칸에 든 소나무와 고사리는 이 기준으로는 더 갈라지지 않죠. 더 잘게 나누려면 기준을 하나 더 세워야 해요.<span class='xh'>오답 하나씩 격파</span>광합성 여부는 생물이 지닌 고유한 특징이라 누가 나누어도 결과가 같아요. 나누는 사람에 따라 달라지는 것은 색깔이나 예쁨 같은 사람의 편의를 기준으로 삼았을 때예요. 아니요 쪽에 놓인 개구리는 물과 뭍을 오가며 살아서, 광합성을 하지 않는 생물이 모두 물속에서 산다는 설명도 성립하지 않아요.",
    core: "기준 하나는 두 무리까지! 더 나누려면 기준을 더해요.",
  },

  // ══════════ L9 5계로 나눈 생물 ══════════
  {
    id: "u2e329",
    lessonId: L9,
    type: "mcq",
    diff: 1,
    prompt: "그림의 검색표를 질문에 따라 따라갔을 때 <b>(가)</b> 자리에 놓이는 무리로 알맞은 것은?",
    // 질문 칸 두 곳을 함께 가린다 · 펼쳐 두면 다른 문항(332·343)의 정답 문구를 그림이 인쇄한다(검산 B).
    figure: kingdomKeyQuizFig({ blanks: [1], qBlanks: [2, 3] }),
    options: ["원핵생물계", "원생생물계", "균계", "식물계", "동물계"],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>(가)는 첫 질문에서 핵막이 있다고 답한 뒤, 두 번째 질문에서 균계·식물계·동물계 가운데 하나가 <b>아니라고</b> 답했을 때 도착하는 자리예요. 핵막은 있지만 나머지 세 무리 어디에도 딱 맞지 않는 생물을 모은 무리, 곧 원생생물계랍니다.<span class='xh'>오답 하나씩 격파</span>원핵생물계는 첫 질문에서 이미 갈라져 나가 검색표 맨 위에 적혀 있어요. 식물계와 동물계는 아래쪽 질문을 지난 자리에 각각 이름이 적혀 있고, 균계는 마지막 갈림길의 끝에 있죠. 이미 그림에 적힌 이름은 (가)에 다시 들어갈 수 없어요. <b>검색표 문제는 그 자리까지 오는 동안 어떤 답을 했는지 되짚는 것</b>이 요령이에요.",
    core: "핵막은 있는데 세 무리 어디에도 안 맞으면 원생생물계!",
  },
  {
    id: "u2e330",
    lessonId: L9,
    type: "mcq",
    diff: 1,
    prompt: "표는 다섯 무리 A~E의 특징을 정리한 것이에요. <b>식물계</b>에 해당하는 것과 그 근거로 옳은 것은?",
    figure: bioKingdomClueTableFig(),
    options: [
      "A · 세포벽이 있고 양분을 흡수하기 때문이에요",
      "B · 핵막과 세포벽이 있고 광합성을 해 스스로 양분을 만들기 때문이에요",
      "C · 핵막이 있고 양분을 섭취하기 때문이에요",
      "D · 특징이 다양해 여러 생물을 포함하기 때문이에요",
      "E · 핵막과 세포벽이 모두 있기 때문이에요",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>식물계는 핵막과 세포벽이 있고 광합성을 해 스스로 양분을 만들어요. 표에서 이 네 가지를 모두 만족하는 것은 <b>B</b>뿐이에요. 특히 광합성 칸이 ○이면서 양분을 스스로 만든다고 적힌 곳은 B 한 줄이죠.<span class='xh'>오답 하나씩 격파</span>A는 세포벽이 있지만 핵막이 없고 광합성도 하지 않아요. C는 세포벽이 없고 양분을 섭취하니 식물계와 정반대고요. D는 특징 칸이 다양하다고만 적혀 있어 식물계의 조건을 확정할 수 없어요. E는 핵막과 세포벽이 모두 있지만 <b>광합성 칸이 ×</b>라 스스로 양분을 만들지 못해요. 두 조건만 맞고 나머지가 어긋나면 답이 될 수 없답니다.",
    core: "식물계 = 핵막 ○ · 세포벽 ○ · 광합성 ○ 세 조건을 모두!",
  },
  {
    id: "u2e338",
    lessonId: L9,
    type: "mcq",
    diff: 2,
    prompt: "생물의 다섯 무리에 대한 설명으로 옳은 것만을 보기에서 모두 고른 것은?",
    bogi: [
      "광합성을 하는 생물이라고 해서 모두 식물계인 것은 아니에요",
      "몸이 하나의 세포로 된 생물은 모두 원핵생물계에 속해요",
      "균계에는 몸이 여러 세포인 것과 하나인 것이 함께 있어요",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ은 옳아요. 다시마와 해캄은 광합성을 하지만 뿌리·줄기·잎처럼 하는 일이 나뉜 기관이 뚜렷하지 않아요. 그래서 <b>식물계</b>가 아니라 원생생물계로 묶는답니다. ㄷ도 옳아요. 균계는 대부분 다세포지만 효모처럼 몸이 세포 하나인 단세포도 있답니다.<span class='xh'>오답 하나씩 격파</span>ㄴ은 틀려요. 몸이 세포 하나여도 핵막이 있으면 원핵생물계가 아니에요. 아메바와 짚신벌레는 몸이 세포 하나지만 핵막이 있어 원생생물계에 속하고, 효모도 몸이 세포 하나인데 균계예요. <b>세포의 수와 무리는 곧바로 이어지지 않는다</b>는 것이 이 단원에서 가장 자주 걸리는 함정이랍니다.",
    core: "광합성해도 식물계가 아닐 수 있고, 세포 하나여도 원핵이 아닐 수 있어요!",
  },
  {
    id: "u2e343",
    lessonId: L9,
    type: "multi",
    diff: 3,
    prompt: "그림은 생물을 다섯 무리로 나누는 검색표예요. <b>㉠</b>에 들어갈 질문으로 알맞은 것을 <b>모두</b> 골라 보세요.",
    figure: kingdomKeyQuizFig({ blanks: [1], qBlanks: [3] }),
    options: [
      "세포벽이 있는가?",
      "죽은 생물이나 배설물을 분해해 양분을 얻는가?",
      "스스로 움직이는가?",
      "핵막이 있는가?",
      "먹이를 섭취해 양분을 얻는가?",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>㉠에서 <b>아니요</b>로 가면 동물계, <b>예</b>로 가면 균계예요. 세포벽은 균계에 있고 동물계에 없으니 방향이 맞고, 죽은 생물이나 배설물을 분해해 양분을 얻는 것도 균계 쪽이라 방향이 맞아요.<span class='xh'>오답 하나씩 격파</span>스스로 움직이는 쪽은 동물계라 예와 아니요가 뒤바뀌어요. 먹이를 섭취해 양분을 얻는 것도 동물계라 마찬가지로 방향이 반대죠. 핵막은 이 자리까지 온 생물이라면 모두 있으니 아예 갈라지지 않아요. <b>검색표의 빈 질문은 예와 아니요의 방향까지 맞아야</b> 답이 된답니다.",
    core: "빈 질문은 방향까지 확인! 예가 균계, 아니요가 동물계예요.",
  },

  // ══════════ L10 생물다양성보전 ══════════
  {
    id: "u2e345",
    lessonId: L10,
    type: "mcq",
    diff: 1,
    prompt:
      "그림은 두 생태계의 먹이 관계를 나타낸 것이에요. 화살표는 먹히는 생물에서 먹는 생물 쪽을 가리켜요. 애벌레가 크게 줄었을 때 <b>족제비</b>가 받는 영향이 더 작을 것으로 예상되는 쪽과 그 까닭으로 옳은 것은?",
    figure: foodWebQuizFig({
      panels: [
        { label: "(가)", kind: "chain" },
        { label: "(나)", kind: "web" },
      ],
    }),
    options: [
      "(나) · 족제비가 먹는 생물의 갈래가 여럿이라 대신할 먹이가 있기 때문이에요",
      "(가) · 먹이 관계가 단순해 변화가 천천히 전해지기 때문이에요",
      "(가) · 족제비가 애벌레를 직접 먹지 않기 때문이에요",
      "(나) · 생물의 수가 많아 애벌레가 금방 다시 늘어나기 때문이에요",
      "두 곳이 같아요 · 애벌레는 어느 쪽에서도 족제비의 먹이가 아니기 때문이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)의 <b>먹이 관계</b>에서 족제비로 들어오는 화살표는 박새 하나뿐이에요. 애벌레가 줄면 박새가 줄고, 그 영향이 족제비까지 곧바로 이어지죠. (나)에서는 족제비로 들어오는 화살표가 박새와 들쥐 <b>둘</b>이라, 한쪽이 줄어도 다른 먹이로 버틸 수 있어요.<span class='xh'>오답 하나씩 격파</span>(가)가 단순해서 변화가 천천히 전해진다는 설명은 반대예요. 갈래가 하나뿐이면 오히려 곧바로 전해지죠. 족제비가 애벌레를 직접 먹지 않는 것은 두 그림 모두 마찬가지라 차이를 만들지 못하고, 생물의 수가 많다고 애벌레가 저절로 다시 늘어나지도 않아요. 두 그림 모두 애벌레에서 박새를 거쳐 족제비로 이어지는 길이 있으니 <b>애벌레가 족제비의 먹이가 아니라는 설명</b>도 어긋난답니다.",
    core: "들어오는 화살표가 여럿이면 버틸 수 있어요!",
  },
  {
    id: "u2e348",
    lessonId: L10,
    type: "mcq",
    diff: 1,
    prompt: "그림은 같은 숲을 도로가 놓이기 전과 놓인 뒤에 조사해 나타낸 것이에요. 작은 도형은 그곳에서 관찰된 동물을 뜻해요. (나)에서 나타난 변화를 옳게 설명한 것은?",
    figure: habitatCutFig({
      panels: [
        { label: "(가) 도로가 놓이기 전", stage: "before" },
        { label: "(나) 도로가 놓인 뒤", stage: "after" },
      ],
    }),
    options: [
      "숲이 두 조각으로 나뉘어 이어진 살 곳이 좁아지고, 관찰되는 동물의 종류도 줄었어요",
      "도로가 생기면서 숲의 넓이가 오히려 넓어졌어요",
      "동물의 종류는 그대로이고 관찰된 수만 늘었어요",
      "도로 덕분에 동물이 숲의 이쪽저쪽을 더 쉽게 오갈 수 있게 되었어요",
      "숲은 예전 그대로이고 도로만 옆에 새로 생겼어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)에서는 초록 숲이 한 덩어리였는데 (나)에서는 회색 도로가 가운데를 가로질러 숲이 두 조각으로 나뉘었어요. 함께 그려진 동물 도형도 종류가 눈에 띄게 줄었죠. 이렇게 살 곳이 사라지거나 조각나는 것을 <b>서식지파괴</b>라고 해요.<span class='xh'>오답 하나씩 격파</span>도로가 숲을 덮은 만큼 숲의 넓이는 오히려 줄어요. 동물 도형의 종류가 분명히 줄었으니 그대로라는 설명도 자료와 어긋나고요. 도로는 동물이 건너기 어려운 장벽이 되어 오가기를 더 힘들게 해요. 그림에서 도로가 숲 옆이 아니라 <b>한가운데</b>를 지나고 있으니 <b>숲이 예전 그대로라는 설명</b>도 맞지 않아요.",
    core: "도로가 숲을 자르면 살 곳이 조각나요 · 서식지파괴예요!",
  },
  {
    id: "u2e351",
    lessonId: L10,
    type: "mcq",
    diff: 2,
    prompt: "그림은 한 지역에서 해마다 같은 방법으로 조사한 어떤 동물의 개체 수예요. 이 자료<b>만으로</b> 말할 수 있는 것은?",
    figure: bioPopulationBarsFig([38, 29, 17, 11], ["1년", "2년", "3년", "4년"]),
    options: [
      "조사한 4년 동안 이 동물의 개체 수가 꾸준히 줄었어요",
      "이 동물은 이 지역에서 이미 멸종했어요",
      "개체 수가 줄어든 원인은 도로를 새로 놓았기 때문이에요",
      "이 지역에 사는 다른 생물의 수도 모두 함께 줄었어요",
      "5년째에는 개체 수가 0이 될 거예요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>막대의 높이가 38, 29, 17, 11로 해마다 낮아지고 있어요. 자료가 직접 보여 주는 것은 딱 이것, <b>조사 기간 동안 개체 수가 꾸준히 줄었다</b>는 사실이에요.<span class='xh'>오답 하나씩 격파</span>4년째에도 막대가 남아 있으니 이미 멸종했다고 말할 수 없어요. 줄어든 <b>원인</b>은 이 자료에 아예 담겨 있지 않아서 도로 때문이라고 단정할 수 없고, 다른 생물의 수도 조사한 적이 없어 함께 줄었다고 할 수 없죠. 앞으로 어떻게 될지는 더더욱 이 자료 밖의 이야기라 0이 된다고 예언할 수 없어요. <b>자료가 말한 것과 말하지 않은 것을 가르는 것</b>이 판독 문제의 핵심이에요.",
    core: "자료는 줄었다는 사실까지만! 원인과 앞날은 말하지 않아요.",
  },
  {
    id: "u2e360",
    lessonId: L10,
    type: "multi",
    diff: 3,
    prompt: "생물다양성을 지키기 위한 조치와 그것이 겨냥한 문제를 옳게 짝지은 것을 <b>모두</b> 골라 보세요.",
    options: [
      "강을 가로막던 낡은 보를 헐어 물길을 다시 잇는 것은, 생물의 이동이 끊기는 문제를 겨냥해요",
      "보호가 필요한 지역을 국립공원으로 정해 관리하는 것은, 살 곳 자체가 사라지는 문제를 겨냥해요",
      "잡을 수 있는 크기와 시기를 정해 두는 것은, 기후가 달라지는 문제를 겨냥해요",
      "위기에 놓인 생물을 사육장에서만 길러 두면, 살 곳이 사라지는 문제까지 함께 풀려요",
      "다른 지역의 물고기를 저수지에 풀어 주는 것은, 생물의 종류를 늘리는 방법이에요",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>물길을 가로막은 구조물을 헐면 끊겼던 이동 경로가 이어져요. 살 곳이 조각나 오갈 수 없게 된 문제를 정확히 겨냥한 조치죠. 국립공원 지정은 보호가 필요한 지역을 통째로 관리해 살 곳이 사라지는 것을 막는 조치예요.<span class='xh'>오답 하나씩 격파</span>잡을 수 있는 크기와 시기를 정하는 것은 지나친 채집을 막는 조치라 기후가 달라지는 문제와는 겨냥점이 달라요. 사육장에서만 기르면 그 생물은 남을지 몰라도 <b>서식지는 그대로 사라져요</b>. 다른 지역의 물고기를 풀어 주면 외래생물이 되어 원래 살던 생물의 자리를 빼앗을 수 있어 종류를 늘리는 방법이 아니랍니다.",
    core: "조치는 그 원인을 겨냥해야 해요 · 살 곳부터가 핵심!",
  },
];
