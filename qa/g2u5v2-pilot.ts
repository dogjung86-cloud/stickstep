// g2u5 v2 파일럿 40문항 스테이징 · 중2 과학 Ⅴ 식물과 에너지 (신규 출제 · 시리즈 14호)
// 정본 설계표 qa/g2u5-v2-blueprint.md(실측·회피표·쿼터·헬퍼 명세). 이식은 qa/build-g2u5v2-lessons.mjs.
// 규격: mcq 144/multi 16/num 0/word 0 · diff 64/64/32 · 시각 112/160 · bogi 24 · 사진 18문항.
// 신작 헬퍼 9종(PS·LF·ST·SP·EX·FC·DN·GB·TR)은 여기서 로컬 저작하고 이식 때 examFigures "g2u5 v2" 섹션 승격.
// 재사용 4종 = svgTable · dbox · variableTableFig · inquiryFlowFig(뒤 둘은 u1 v2 섹션).
import type { ExamItem } from "../src/content/exams/types";
import { svgTable, dbox, variableTableFig, inquiryFlowFig } from "../src/ui/examFigures";

const IMG_BASE = "";
/** 시험 전용 신규 발주 사진(public/exam/g2u5). */
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/g2u5/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;
/** 레슨 자산 재사용 사진(public/plant). */
const pimg = (path: string, alt: string): string =>
  `<img src="${IMG_BASE}plant/${path}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;

const NS = `xmlns="http://www.w3.org/2000/svg"`;

// ── g2u5 v2 공용 팔레트(examFigures 관행대로 하드 헥스 · 토큰 미로드 환경에서도 색이 산다) ──
const C = {
  ink: "#333D4B", sub: "#4E5968", line: "#C9D0D8", panel: "#F2F4F7", white: "#FFFFFF",
  leafHi: "#7FD66D", leaf: "#39A85A", leafLo: "#17643A", vein: "#8FCB6B",
  xylem: "#3C93E8", phloem: "#DC4B86", sun: "#F0A422", sunHi: "#FFD97A",
  co2: "#7A8798", o2: "#17958F", o2Fill: "#7FD5D0", glucose: "#7A5FCB", starch: "#B08FE0",
  soil: "#8A6440", night: "#1E2C4A", blue: "#1B64DA", tint: "#EAF7EF", warn: "#C43A2E",
};

// ── 발주 도해 베이스(public/exam/g2u5fig · 글자·기호·화살표 0의 일러스트) ──────────────
// 하이브리드 방침: 라스터는 그림만 담고, 기호(㉠㉡)·물질 이름 칩·화살표는 아래 헬퍼가 SVG로 얹는다.
// 오버레이 좌표는 눈대중이 아니라 qa/shot-g2u5fig-grid.mjs로 격자를 얹어 실측한 원본 비율에서 역산했다.
const G5_IMG_BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
const g5fig = (file: string): string => `${G5_IMG_BASE}exam/g2u5fig/${file}`;

/** 문서 안에서 유일한 id(리뷰 화면이 같은 그림을 여러 번 렌더해도 clipPath가 충돌하지 않게). */
let uidSeed = Math.floor(Math.random() * 1679616);
const uid = (): string => `g5${(uidSeed++).toString(36)}`;

/** 기호 배지(원 + 기호) + 지시선. 지시선 없는 라벨은 무엇을 가리키는지 모호해진다(plantFigures 결함). */
const g5badge = (bx: number, by: number, tx: number, ty: number, sym: string, color: string): string =>
  `<line x1="${bx}" y1="${by}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="1.4"/>
   <circle cx="${bx}" cy="${by}" r="12" fill="#FFFFFF" stroke="${color}" stroke-width="1.6"/>
   <text x="${bx}" y="${by + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${color}">${sym}</text>`;

const g5chip = (x: number, y: number, w: number, text: string, color: string, dashed = false): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="24" rx="12" fill="#FFFFFF" stroke="${color}" stroke-width="${dashed ? 1.8 : 1.5}"${dashed ? ' stroke-dasharray="5 4"' : ""}/>
   <text x="${x + w / 2}" y="${y + 16.5}" text-anchor="middle" font-size="12" font-weight="${dashed ? 800 : 700}" fill="${color}">${text}</text>`;

/** 화살촉 크기는 **선 굵기와 분리**한다(markerUnits="userSpaceOnUse").
 *  기본값(strokeWidth)이면 굵기 4.6짜리 화살에 29px 화살촉이 붙어 몸통이 안 보인다(사용자 지적). */
const arrowDefs = (id: string, color: string, size = 12): string =>
  `<marker id="${id}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="${size}" markerHeight="${size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="${color}"/></marker>`;

// ══════════════════════════════════════════════════════════════════════════════
// PS · 광합성·호흡 물질/에너지 출입 도해 (파라미터 가림판)
// 구 respirationCycleFig은 "포도당·산소"·"이산화 탄소·물"·"에너지"를 전부 글자로 인쇄해
// 물질 방향을 묻는 문항에 쓰면 정답 인쇄였다. 이 판은 슬롯별 가림(㉠㉡㉢㉣)을 지원한다.
// ══════════════════════════════════════════════════════════════════════════════
type PsSlot = "in1" | "in2" | "out1" | "out2" | "site" | "energy";
const PS_TEXT: Record<"photo" | "resp", Record<PsSlot, string>> = {
  photo: { in1: "이산화 탄소", in2: "물", out1: "포도당", out2: "산소", site: "엽록체", energy: "빛에너지" },
  resp: { in1: "포도당", in2: "산소", out1: "이산화 탄소", out2: "물", site: "마이토콘드리아", energy: "에너지" },
};
/** o.hide 순서대로 ㉠㉡㉢㉣를 배정한다. o.reverse에 든 화살표는 방향이 뒤집힌다(오류 찾기 문항용).
 *  o.arrowSyms가 참이면 네 화살표에 ㉠~㉣ 기호를 단다(가림과 동시에 쓰지 않는다). */
/** o.materials === false면 물질 칩·화살표를 아예 그리지 않는다(에너지 방향만 묻는 문항용 ·
 *  같은 도해를 두 문항이 나눠 쓰면 한쪽이 다른 쪽의 정답을 인쇄한다). */
export function psExchangeFig(o: { mode: "photo" | "resp"; hide?: PsSlot[]; reverse?: PsSlot[]; arrowSyms?: boolean; materials?: false }): string {
  const T = PS_TEXT[o.mode];
  const SYM = ["㉠", "㉡", "㉢", "㉣"];
  const hidden = new Map<PsSlot, string>();
  (o.hide ?? []).forEach((k, i) => hidden.set(k, SYM[i] ?? "㉠"));
  const rev = new Set(o.reverse ?? []);
  const label = (k: PsSlot): string => hidden.get(k) ?? T[k];
  const isHid = (k: PsSlot): boolean => hidden.has(k);
  const CY = 112, RY = 32;
  // 화살표·칩 색은 물질마다 고정한다(한 색이 두 물질을 뜻하면 색이 오독의 단서가 된다).
  const MAT_COL: Record<"photo" | "resp", Record<"in1" | "in2" | "out1" | "out2", string>> = {
    photo: { in1: C.co2, in2: C.xylem, out1: C.glucose, out2: C.o2 },
    resp: { in1: C.glucose, in2: C.o2, out1: C.co2, out2: C.xylem },
  };
  const mIn = uid(), mOut = uid(), mE = uid();

  // 소기관은 발주 일러스트를 얹는다. 임베드 사각형은 "그림 속 소기관 몸통"이 (CX,CY) 중심의
  // 가로 128 상자에 오도록 실측 비율에서 역산했다(엽록체 몸통 = 원본 폭 87%·높이 41%·중심 48.5/49.5%,
  // 마이토콘드리아 = 84%·43%·중심 50/47.5%). 결과는 두 모드 모두 몸통이 x 108~236 · y 80~144.
  const EMB = o.mode === "photo"
    ? { file: "chloroplast.webp", x: 100.7, y: 39.2, w: 147.1 }
    : { file: "mitochondrion.webp", x: 95.8, y: 39.6, w: 152.4 };
  const organelle = `<image href="${g5fig(EMB.file)}" x="${EMB.x}" y="${EMB.y}" width="${EMB.w}" height="${EMB.w}" preserveAspectRatio="xMidYMid meet"/>`;

  // 물질 화살표 4개 · in은 기본 오른쪽(들어감), out은 기본 오른쪽(나감). reverse면 뒤집는다.
  const hArrow = (x1: number, x2: number, y: number, color: string, marker: string, flip: boolean): string =>
    flip
      ? `<path d="M${x2} ${y} H${x1}" stroke="${color}" stroke-width="3.2" marker-end="url(#${marker})" fill="none"/>`
      : `<path d="M${x1} ${y} H${x2}" stroke="${color}" stroke-width="3.2" marker-end="url(#${marker})" fill="none"/>`;

  // 화살표 높이는 소기관 몸통(y 80~144)의 위·아래 어깨에 닿는 96과 128로 잡는다.
  const rows: { k: "in1" | "in2" | "out1" | "out2"; y: number; side: "L" | "R" }[] = [
    { k: "in1", y: 96, side: "L" },
    { k: "in2", y: 128, side: "L" },
    { k: "out1", y: 96, side: "R" },
    { k: "out2", y: 128, side: "R" },
  ];
  const markers = new Map<string, string>();
  let body = "";
  let ai = 0;
  for (const r of o.materials === false ? [] : rows) {
    const hid = isHid(r.k);
    const col = hid ? C.blue : MAT_COL[o.mode][r.k];
    const mk = `${r.side === "L" ? mIn : mOut}${r.k}`;
    markers.set(mk, col);
    if (r.side === "L") {
      body += g5chip(8, r.y - 12, 84, label(r.k), col, hid);
      body += hArrow(94, 126, r.y, col, mk, rev.has(r.k));
    } else {
      body += g5chip(252, r.y - 12, 84, label(r.k), col, hid);
      body += hArrow(218, 250, r.y, col, mk, rev.has(r.k));
    }
    if (o.arrowSyms) {
      const bx = r.side === "L" ? 104 : 240;
      body += `<circle cx="${bx}" cy="${r.y - 18}" r="10.5" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.4"/>
        <text x="${bx}" y="${r.y - 13.8}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${C.sub}">${SYM[ai]}</text>`;
    }
    ai += 1;
  }

  // 에너지(세로) · 광합성은 들어오고, 호흡은 나간다.
  const eHid = isHid("energy");
  const eCol = eHid ? C.blue : C.sun;
  markers.set(mE, eCol);
  const eFlip = rev.has("energy");
  const down = o.mode === "photo" ? !eFlip : eFlip;
  body += down
    ? `<path d="M172 40 V72" stroke="${eCol}" stroke-width="3.2" marker-end="url(#${mE})" fill="none"/>`
    : `<path d="M172 72 V40" stroke="${eCol}" stroke-width="3.2" marker-end="url(#${mE})" fill="none"/>`;
  body += `<text x="172" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="${eCol}">${label("energy")}</text>`;

  const sHid = isHid("site");
  body += `<rect x="106" y="${CY + RY + 8}" width="132" height="26" rx="13" fill="${sHid ? "#FFFFFF" : C.tint}" stroke="${sHid ? C.blue : C.leafLo}" stroke-width="${sHid ? 1.8 : 1.4}"${sHid ? ' stroke-dasharray="5 4"' : ""}/>
    <text x="172" y="${CY + RY + 25}" text-anchor="middle" font-size="13" font-weight="800" fill="${sHid ? C.blue : C.leafLo}">${label("site")}</text>`;

  const hidNames = (o.hide ?? []).map((_k, i) => SYM[i]).join("·");
  const aria = o.materials === false
    ? "한 세포 소기관과, 그 위쪽으로 이어진 에너지 화살표만 그린 그림"
    : `한 세포 소기관을 가운데 두고 왼쪽과 오른쪽에 물질 이름 칸이 두 개씩 있고 각 칸에 화살표가 이어진 그림${o.hide?.length ? `. ${hidNames} 자리는 이름이 가려져 있다` : ""}${o.arrowSyms ? ". 화살표마다 기호가 붙어 있다" : ""}`;
  const defs = [...markers].map(([id, col]) => arrowDefs(id, col)).join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="${aria}"><defs>${defs}</defs>${organelle}${body}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// LF · 잎 단면 + 부위 기호 (지시선 필수 · 인셋에도 연결선)
// 구 leafRouteFig은 기공 인셋이 지시선 없이 잎 바깥에 떠 있고 (가)(나)(다) 배정이 레슨에 3중 소진.
// ══════════════════════════════════════════════════════════════════════════════
type LfPart = "chloro" | "stoma" | "xylem" | "phloem" | "cell";
/** 발주 일러스트(leaf-section.webp) 위에 기호 배지와 지시선만 얹는다.
 *  지시선 끝점은 qa/shot-g2u5fig-grid.mjs로 격자를 얹어 실측한 원본 비율에서 역산했다:
 *  물관 다발 (23.5%, 40%) · 체관 다발 (23%, 55%) · 엽록체 알갱이 (52%, 28%) ·
 *  해면 세포 (48.5%, 57%) · 기공 틈 (74.5%, 71.5%). 그림은 4:3이므로 x% x 3.44, y% x 2.58. */
export function leafPartsFig(o: { marks: { part: LfPart; sym: string }[] }): string {
  const IW = 344, IH = 258;
  const px = (f: number): number => Math.round(f * IW / 100) / 100;   // f = 만분율(2350 = 23.50%)
  const py = (f: number): number => Math.round(f * IH / 100) / 100;   // f = 만분율(7150 = 71.50%)
  const art = `<image href="${g5fig("leaf-section.webp")}" x="0" y="0" width="${IW}" height="${IH}" preserveAspectRatio="xMidYMid meet"/>`;
  // 배지는 그림의 흰 여백(위 0~45 · 아래 191~258)에만 둔다.
  const POS: Record<LfPart, { bx: number; by: number; tx: number; ty: number; col: string }> = {
    xylem: { bx: 36, by: 24, tx: px(2350), ty: py(4000), col: C.xylem },
    chloro: { bx: 180, by: 22, tx: px(5200), ty: py(2800), col: C.leafLo },
    phloem: { bx: 40, by: 234, tx: px(2300), ty: py(5500), col: C.phloem },
    cell: { bx: 152, by: 234, tx: px(4850), ty: py(5700), col: C.sub },
    stoma: { bx: 302, by: 234, tx: px(7450), ty: py(7150), col: C.leafLo },
  };
  let badges = "";
  for (const m of o.marks) {
    const p = POS[m.part];
    badges += g5badge(p.bx, p.by, p.tx, p.ty, m.sym, p.col);
  }
  const syms = o.marks.map((m) => m.sym).join("·");
  return `<svg viewBox="0 0 ${IW} ${IH}" ${NS} fill="none" role="img" aria-label="잎을 세로로 자른 단면 그림. 위아래에 납작한 세포가 한 줄씩 있고 그 사이를 길쭉한 세포와 둥근 세포가 채우고 있으며, 아래쪽 한 곳에는 세포 두 개가 감싼 틈이 있다. ${syms} 기호가 각각 서로 다른 부분을 가리킨다">${art}${badges}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// ST · 아이오딘 반응 잎 (조건 라벨 기본 미인쇄 · 부위 기호 ㉠㉡)
// 구 starchTestFig은 "햇빛 받은 잎 / 햇빛 가린 잎" 조건을 인쇄해 판정 과제가 붕괴했다.
// ══════════════════════════════════════════════════════════════════════════════
/** regions는 왼쪽부터(ring이면 [바깥 테두리, 안쪽]).
 *  result "blue" = 청람색 · "none" = 반응 없음(탈색된 옅은 빛깔) · "green" = 아직 반응 전 초록 ·
 *  "white" = 엽록소가 없는 흰 부분. */
export function starchLeafFig(o: {
  regions: { result: "blue" | "none" | "green" | "white"; sym?: string }[];
  cover?: number;   // 이 구간을 은박 띠로 덮는다(인덱스 · ring 모드에서는 무시)
  ring?: boolean;   // 얼룩무늬 잎 문법 · 바깥 테두리와 안쪽을 나눈다
}): string {
  const id = uid(), idIn = uid();
  const n = o.regions.length;
  const LX = 34, RX = 310, TY = 46, BY = 168;
  const CXm = (LX + RX) / 2, CYm = (TY + BY) / 2;
  const seg = (RX - LX) / n;
  const FILL: Record<string, string> = { blue: "#2E4E9E", none: "#EDE4CE", green: "#49AE63", white: "#F7F7F2" };
  const leafPath = (s: number): string => {
    const lx = CXm + (LX - CXm) * s, rx = CXm + (RX - CXm) * s;
    const ty = CYm + (TY - CYm) * s, by = CYm + (BY - CYm) * s;
    return `M${lx} ${CYm} C${lx + (rx - lx) * 0.09} ${ty - 6 * s} ${rx - (rx - lx) * 0.15} ${ty - 2 * s} ${rx} ${CYm} C${rx - (rx - lx) * 0.15} ${by + 2 * s} ${lx + (rx - lx) * 0.09} ${by + 6 * s} ${lx} ${CYm} Z`;
  };
  const leaf = leafPath(1);
  let fills = "";
  let marks = "";
  if (o.ring) {
    fills += `<path d="${leaf}" fill="${FILL[o.regions[0].result]}"/>`;
    fills += `<path d="${leafPath(0.6)}" fill="${FILL[o.regions[1]?.result ?? "none"]}" stroke="${C.leafLo}" stroke-width="1.4" stroke-dasharray="5 4"/>`;
    const at: [number, number][] = [[LX + 30, CYm], [CXm, CYm]];
    o.regions.slice(0, 2).forEach((r, i) => {
      if (!r.sym) return;
      marks += `<circle cx="${at[i][0]}" cy="${at[i][1]}" r="14" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.6"/>
        <text x="${at[i][0]}" y="${at[i][1] + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="${C.ink}">${r.sym}</text>`;
    });
  } else {
    o.regions.forEach((r, i) => {
      fills += `<rect x="${LX + seg * i}" y="${TY - 12}" width="${seg + 0.6}" height="${BY - TY + 24}" fill="${FILL[r.result]}" clip-path="url(#${id})"/>`;
      if (!r.sym) return;
      const cx = LX + seg * (i + 0.5);
      marks += `<circle cx="${cx}" cy="${CYm}" r="14" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.6"/>
        <text x="${cx}" y="${CYm + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="${C.ink}">${r.sym}</text>`;
    });
  }
  let cover = "";
  if (o.cover !== undefined && !o.ring) {
    const x = LX + seg * o.cover;
    cover = `<rect x="${x}" y="${TY - 8}" width="${seg}" height="${BY - TY + 16}" rx="7" fill="#C6CDD6" stroke="#8B95A1" stroke-width="1.6" opacity=".95"/>
      <path d="M${x + 7} ${TY + 12} l${seg - 14} 0 M${x + 7} ${TY + 44} l${seg - 14} 0 M${x + 7} ${TY + 76} l${seg - 14} 0 M${x + 7} ${TY + 108} l${seg - 14} 0" stroke="#FFFFFF" stroke-width="1.2" opacity=".7"/>`;
  }
  const plate = `<ellipse cx="172" cy="${CYm + 26}" rx="152" ry="44" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>`;
  const shapeTxt = o.ring ? "잎의 바깥 테두리와 안쪽의 빛깔이 서로 다르다" : `잎이 ${n}개 구역으로 나뉘어 서로 다른 빛깔로 보인다`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="접시 위에 놓인 잎 한 장을 위에서 본 그림. ${shapeTxt}${o.cover !== undefined && !o.ring ? ". 한 구역은 은박으로 덮여 있다" : ""}">
    <defs><clipPath id="${id}"><path d="${leaf}"/></clipPath><clipPath id="${idIn}"><path d="${leafPath(0.6)}"/></clipPath></defs>
    ${plate}<path d="${leaf}" fill="#EDE4CE" stroke="${C.leafLo}" stroke-width="2"/>${fills}
    <path d="${leaf}" fill="none" stroke="${C.leafLo}" stroke-width="2"/>
    ${o.ring ? "" : `<path d="M${LX + 8} ${CYm} H${RX - 10}" stroke="${C.leafLo}" stroke-width="1.6" opacity=".45"/>`}${cover}${marks}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SP · 기체 농도 시간 곡선 (정성 · 눈금 수치 없음 · 가이드 점선 금지)
// 구 sensorGraphFig의 고정 aria "이산화 탄소 감소와 산소 증가"는 정답 낭독이었다.
// ══════════════════════════════════════════════════════════════════════════════
type SpShape = "up" | "down" | "flat" | "flat-up" | "flat-down" | "up-flat" | "down-flat" | "down-up" | "up-down";
export function gasSensorFig(o: {
  series: { name: string; shape: SpShape; color?: string }[];
  changeAt?: number;                          // 0~1 · flat/꺾임 지점
  marks?: { frac: number; sym: string }[];    // 세로 점선 + 기호
  xLabel?: string; yLabel?: string;
}): string {
  const L = 54, R = 328, TOP = 30, BASE = 156;
  const k = o.changeAt ?? 0.45;
  const px = (f: number): number => L + f * (R - L);
  const HI = TOP + 10, LO = BASE - 12, MID = (HI + LO) / 2;
  const path = (shape: SpShape): string => {
    const kx = px(k);
    switch (shape) {
      // flat은 "변화가 없는 대조군"이라 다른 곡선과 **같은 높이에서 출발**해야 한다.
      // MID에서 시작하던 초판은 247(똑같이 밀폐한 두 용기)에서 두 용기의 처음 농도가 다르게 그려졌다
      // (갤러리 눈검수 자가 적발). down도 HI에서 출발하므로 왼쪽 끝에서 만났다가 갈라진다.
      case "flat": return `M${L} ${HI} H${R}`;
      case "up": return `M${L} ${LO} C${px(0.35)} ${LO - 6} ${px(0.6)} ${HI + 22} ${R} ${HI}`;
      case "down": return `M${L} ${HI} C${px(0.35)} ${HI + 6} ${px(0.6)} ${LO - 22} ${R} ${LO}`;
      case "flat-up": return `M${L} ${LO} H${kx} C${px(k + 0.18)} ${LO - 8} ${px(k + 0.4)} ${HI + 18} ${R} ${HI}`;
      case "flat-down": return `M${L} ${HI} H${kx} C${px(k + 0.18)} ${HI + 8} ${px(k + 0.4)} ${LO - 18} ${R} ${LO}`;
      case "up-flat": return `M${L} ${LO} C${px(k * 0.5)} ${LO - 10} ${px(k * 0.8)} ${HI + 16} ${kx} ${HI} H${R}`;
      // V자 · Λ자 · 하루 동안의 농도 변화처럼 방향이 한 번 바뀌는 곡선(꺾이는 지점 = changeAt).
      case "down-up": return `M${L} ${MID + 24} C${px(k * 0.55)} ${LO} ${px(k * 0.8)} ${LO} ${kx} ${LO} C${px(k + (1 - k) * 0.3)} ${LO} ${px(k + (1 - k) * 0.6)} ${MID + 6} ${R} ${MID - 6}`;
      case "up-down": return `M${L} ${MID - 24} C${px(k * 0.55)} ${HI} ${px(k * 0.8)} ${HI} ${kx} ${HI} C${px(k + (1 - k) * 0.3)} ${HI} ${px(k + (1 - k) * 0.6)} ${MID - 6} ${R} ${MID + 6}`;
      default: return `M${L} ${HI} C${px(k * 0.5)} ${HI + 10} ${px(k * 0.8)} ${LO - 16} ${kx} ${LO} H${R}`;
    }
  };
  const COLORS = [C.co2, C.o2, C.glucose];
  let curves = "";
  o.series.forEach((s, i) => {
    const col = s.color ?? COLORS[i % 3];
    curves += `<path d="${path(s.shape)}" stroke="${col}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
  });
  let marks = "";
  for (const m of o.marks ?? []) {
    const x = px(m.frac);
    marks += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BASE}" stroke="${C.line}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <circle cx="${x}" cy="${TOP - 12}" r="11" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.5"/>
      <text x="${x}" y="${TOP - 7.6}" text-anchor="middle" font-size="12" font-weight="800" fill="${C.ink}">${m.sym}</text>`;
  }
  let legend = "";
  o.series.forEach((s, i) => {
    const col = s.color ?? COLORS[i % 3];
    const x = 54 + i * 132;
    legend += `<rect x="${x}" y="${BASE + 22}" width="18" height="4" rx="2" fill="${col}"/>
      <text x="${x + 24}" y="${BASE + 30}" font-size="12" font-weight="700" fill="${C.sub}">${s.name}</text>`;
  });
  const yTxt = o.yLabel ?? "기체 농도";
  const xTxt = o.xLabel ?? "시간";
  const aria = `가로축이 ${xTxt}, 세로축이 ${yTxt}인 그래프에 곡선 ${o.series.length}개가 그려져 있다. 눈금 수치는 표시되어 있지 않다${o.marks?.length ? `. ${o.marks.map((m) => m.sym).join("·")} 위치에 세로 점선이 있다` : ""}`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="${aria}">
    <path d="M${L} ${TOP} V${BASE} H${R}" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    <path d="M${L} ${TOP} l-4.5 7 M${L} ${TOP} l4.5 7 M${R} ${BASE} l-7 -4.5 M${R} ${BASE} l-7 4.5" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    ${marks}${curves}
    <text x="6" y="${TOP - 8}" font-size="11.5" font-weight="700" fill="${C.sub}">${yTxt}</text>
    <text x="${R}" y="${BASE + 16}" text-anchor="end" font-size="11.5" font-weight="700" fill="${C.sub}">${xTxt}</text>${legend}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// EX · 밀폐 용기 실험 패널 (조건 이름 미인쇄 · 라벨은 (가)(나)(다)뿐)
// ══════════════════════════════════════════════════════════════════════════════
export function sealedPlantFig(o: {
  panels: { plant: "live" | "boiled" | "none"; cover: "none" | "foil" | "dark"; label: string; probe?: boolean }[];
  lime?: boolean;   // 용기 바닥에 석회수 접시를 둔다(뿌옇게 변한 상태는 그리지 않는다 · 결과 인쇄 금지)
}): string {
  const n = o.panels.length;
  const PW = n === 2 ? 156 : 106;
  const GAP = n === 2 ? 20 : 12;
  const startX = (344 - (PW * n + GAP * (n - 1))) / 2;
  let body = "";
  o.panels.forEach((p, i) => {
    const x = startX + i * (PW + GAP);
    const cx = x + PW / 2;
    const jarTop = 34, jarBot = 168;
    const jw = PW - 22;
    const jx = x + 11;
    const dark = p.cover === "dark";
    body += `<rect x="${jx}" y="${jarTop}" width="${jw}" height="${jarBot - jarTop}" rx="10" fill="${dark ? "#3A4356" : "#EAF4FA"}" stroke="${C.sub}" stroke-width="1.8"/>
      <rect x="${jx - 4}" y="${jarTop - 12}" width="${jw + 8}" height="14" rx="5" fill="#B9C2CC" stroke="${C.sub}" stroke-width="1.6"/>`;
    if (p.plant !== "none") {
      const leafCol = p.plant === "live" ? C.leaf : "#9A9A6E";
      const leafHi = p.plant === "live" ? C.leafHi : "#B4B48A";
      body += `<path d="M${cx} 148 V108" stroke="${p.plant === "live" ? C.leafLo : "#7A7A58"}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M${cx} 116 C${cx - 26} 100 ${cx - 34} 112 ${cx - 30} 122 C${cx - 16} 130 ${cx - 4} 126 ${cx} 116 Z" fill="${leafCol}" stroke="${p.plant === "live" ? C.leafLo : "#7A7A58"}" stroke-width="1.4"/>
        <path d="M${cx} 110 C${cx + 26} 94 ${cx + 34} 106 ${cx + 30} 116 C${cx + 16} 124 ${cx + 4} 120 ${cx} 110 Z" fill="${leafHi}" stroke="${p.plant === "live" ? C.leafLo : "#7A7A58"}" stroke-width="1.4"/>
        <path d="M${cx - 16} 148 h32 l-4 16 h-24 Z" fill="#C0724A" stroke="#8A4E2F" stroke-width="1.4"/>`;
    }
    if (o.lime) body += `<ellipse cx="${cx}" cy="${jarBot - 8}" rx="${jw / 3}" ry="6" fill="#FFFFFF" stroke="${C.line}" stroke-width="1.4"/>`;
    if (p.cover === "foil") {
      body += `<rect x="${jx - 2}" y="${jarTop + 4}" width="${jw + 4}" height="${jarBot - jarTop - 8}" rx="8" fill="#C6CDD6" stroke="#8B95A1" stroke-width="1.6" opacity=".95"/>
        <path d="M${jx + 6} ${jarTop + 24} h${jw - 12} M${jx + 6} ${jarTop + 56} h${jw - 12} M${jx + 6} ${jarTop + 88} h${jw - 12}" stroke="#FFFFFF" stroke-width="1.2" opacity=".65"/>`;
    }
    if (p.probe !== false) {
      body += `<path d="M${cx + jw / 2 - 12} ${jarTop - 6} V54" stroke="${C.sub}" stroke-width="2.2" fill="none"/>
        <rect x="${cx + jw / 2 - 20}" y="54" width="16" height="22" rx="4" fill="#DDE3EA" stroke="${C.sub}" stroke-width="1.4"/>
        <path d="M${cx + jw / 2 - 12} ${jarTop - 6} C${cx + jw / 2 + 4} ${jarTop - 22} ${x + PW - 2} ${jarTop - 20} ${x + PW - 2} ${jarTop - 6}" stroke="${C.sub}" stroke-width="1.6" fill="none"/>`;
    }
    body += `<text x="${cx}" y="190" text-anchor="middle" font-size="13.5" font-weight="800" fill="${C.ink}">${p.label}</text>`;
  });
  // aria는 "무엇이 보이는가"까지만 서술한다(가려짐·식물 상태는 관찰 · 어느 쪽이 대조군인지는 판정이라 제외).
  const seen = o.panels.map((p) => {
    const cov = p.cover === "foil" ? "겉면이 불투명한 것으로 감싸여 있고" : p.cover === "dark" ? "속이 어둡고" : "속이 훤히 들여다보이고";
    const pl = p.plant === "live" ? "안에 푸른 잎의 화분이 있다" : p.plant === "boiled" ? "안에 빛깔이 바랜 화분이 있다" : "안이 비어 있다";
    return `${p.label} 용기는 ${cov} ${pl}`;
  }).join(", ");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="뚜껑을 덮은 용기 ${n}개를 나란히 놓은 실험 그림. ${seen}${o.lime ? ". 각 용기 바닥에는 얕은 접시가 하나씩 놓여 있다" : ""}">${body}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// FC · 요인–광합성량 곡선 (정성 · 축 라벨 생략 = 역추론 문항)
// ══════════════════════════════════════════════════════════════════════════════
export function factorGraphFig(o: {
  kind: "sat" | "peak";
  curves: { label?: string; scale?: number; color?: string }[];
  xLabel?: string; yLabel?: string;
  marks?: { frac: number; sym: string }[];
}): string {
  const L = 54, R = 322, TOP = 28, BASE = 152;
  const px = (f: number): number => L + f * (R - L);
  const COLORS = [C.leafLo, C.sun, C.xylem];
  // sat 다중 곡선은 "같은 상승 경로를 공유하고 각자의 높이에서 먼저 평평해진다"(교과서 표준 도해).
  // scale로 곡선 전체를 비례 축소하면 저광도 구간의 기울기까지 달라져 "빛이 부족할 땐 두 조건이
  // 거의 같다"는 판정 근거가 사라진다(검산 A 적발). 공유 상승 곡선을 샘플링해 각자 plateau로 클램프한다.
  const TOP1 = BASE - (BASE - TOP - 8);
  const bez = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const sharedSat = (n: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([bez(t, L + 2, px(0.16), px(0.36), px(0.58)), bez(t, BASE - 4, BASE - (BASE - TOP1) * 0.5, TOP1 + 4, TOP1)]);
    }
    return pts;
  };
  let curves = "";
  o.curves.forEach((c, i) => {
    const s = c.scale ?? 1;
    const top = BASE - (BASE - TOP - 8) * s;
    const col = c.color ?? COLORS[i % 3];
    let d;
    if (o.kind === "sat") {
      const pts = sharedSat(48).map(([x, y]) => [x, Math.max(top, y)] as [number, number]);
      d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} L${R} ${top.toFixed(1)}`;
    } else {
      d = `M${L + 2} ${BASE - 4} C${px(0.2)} ${BASE - (BASE - top) * 0.55} ${px(0.34)} ${top} ${px(0.48)} ${top} C${px(0.66)} ${top} ${px(0.76)} ${BASE - (BASE - top) * 0.45} ${R} ${BASE - 6}`;
    }
    curves += `<path d="${d}" stroke="${col}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    // 라벨 자리: sat는 곡선이 오른쪽에서 평평해지므로 오른쪽 끝 위에 건다.
    // peak는 오른쪽에서 곡선들이 한데 모여 내려오므로 거기에 걸면 라벨이 곡선에 겹친다
    // (봉우리 2곡선 데뷔 슬롯 281에서 실제로 겹쳤다 · 갤러리 눈검수 자가 적발).
    // → 각 곡선의 **자기 봉우리 바로 위**에 건다. scale이 다르면 높이가 갈리므로 라벨끼리도 안 겹친다.
    if (c.label) {
      curves += o.kind === "sat"
        ? `<text x="${R - 4}" y="${top - 6}" text-anchor="end" font-size="11.5" font-weight="700" fill="${col}">${c.label}</text>`
        : `<text x="${px(0.57)}" y="${top - 7}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${col}">${c.label}</text>`;
    }
  });
  let marks = "";
  for (const m of o.marks ?? []) {
    const x = px(m.frac);
    marks += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BASE}" stroke="${C.line}" stroke-width="1.3" stroke-dasharray="4 4"/>
      <circle cx="${x}" cy="${BASE + 18}" r="11" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.5"/>
      <text x="${x}" y="${BASE + 22.6}" text-anchor="middle" font-size="12" font-weight="800" fill="${C.ink}">${m.sym}</text>`;
  }
  const yTxt = o.yLabel ?? "광합성량";
  const xTxt = o.xLabel ?? "?";
  const aria = `가로축이 ${o.xLabel ?? "이름이 적혀 있지 않은 조건"}, 세로축이 ${yTxt}인 그래프에 곡선 ${o.curves.length}개가 그려져 있다. 눈금 수치는 표시되어 있지 않다`;
  return `<svg viewBox="0 0 344 202" ${NS} fill="none" role="img" aria-label="${aria}">
    <path d="M${L} ${TOP} V${BASE} H${R}" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    <path d="M${L} ${TOP} l-4.5 7 M${L} ${TOP} l4.5 7 M${R} ${BASE} l-7 -4.5 M${R} ${BASE} l-7 4.5" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    ${marks}${curves}
    <text x="6" y="${TOP - 8}" font-size="11.5" font-weight="700" fill="${C.sub}">${yTxt}</text>
    <text x="${R}" y="${BASE + (o.marks?.length ? 46 : 18)}" text-anchor="end" font-size="11.5" font-weight="700" fill="${C.sub}">${xTxt}</text></svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// DN · 낮/밤 겉보기 기체 출입 2패널 (기체 이름 칩 인쇄 · 결론 캡션 없음)
// 구 dayNightFlowFig은 범례 없이 색으로만 기체를 구분했고 캡션이 결론을 인쇄했다.
// ══════════════════════════════════════════════════════════════════════════════
type DnGas = "co2" | "o2" | null;
const DN_NAME: Record<"co2" | "o2", string> = { co2: "이산화 탄소", o2: "산소" };
/** 패널을 세로로 쌓는다 · 좌우 배치로는 기체 이름 칩 두 개(각 88px)가 폭 344 안에서 겹친다
 *  (첫 렌더에서 실제로 겹쳤다). 세로 쌓기면 칸마다 칩이 좌우로 넉넉히 떨어진다. */
export function dayNightGasFig(o: {
  panels: { light: "bright" | "dim" | "none"; inGas: DnGas; outGas: DnGas; label: string; inSym?: string; outSym?: string }[];
}): string {
  const PX = 8, PW = 328, PH = 142, GAP = 12;
  const mCo2 = uid(), mO2 = uid(), mMask = uid();
  let body = "";
  o.panels.forEach((p, i) => {
    const y = 10 + i * (PH + GAP);
    const cx = PX + 150;
    const night = p.light === "none";
    body += `<rect x="${PX}" y="${y}" width="${PW}" height="${PH}" rx="14" fill="${night ? C.night : "#F3FAF2"}" stroke="${night ? "#0F1A31" : C.leafLo}" stroke-width="1.6"/>`;
    body += night
      ? `<circle cx="${PX + 296}" cy="${y + 30}" r="13" fill="#F3EFC0"/><circle cx="${PX + 301}" cy="${y + 27}" r="11" fill="${C.night}"/>`
      : `<circle cx="${PX + 296}" cy="${y + 30}" r="${p.light === "bright" ? 14 : 10}" fill="${p.light === "bright" ? C.sun : "#E6D6A8"}"/>${p.light === "bright"
        ? `<path d="M${PX + 296} ${y + 8} v-6 M${PX + 296} ${y + 52} v6 M${PX + 274} ${y + 30} h-6 M${PX + 318} ${y + 30} h6" stroke="${C.sun}" stroke-width="2.4" stroke-linecap="round"/>`
        : `<ellipse cx="${PX + 282}" cy="${y + 34}" rx="20" ry="9" fill="#DDE3EA"/>`}`;
    // 식물
    body += `<path d="M${cx} ${y + 118} V${y + 74}" stroke="${night ? "#2C5B3C" : C.leafLo}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${cx} ${y + 86} C${cx - 30} ${y + 68} ${cx - 40} ${y + 82} ${cx - 34} ${y + 94} C${cx - 18} ${y + 104} ${cx - 5} ${y + 98} ${cx} ${y + 86} Z" fill="${night ? "#2F7A4B" : C.leaf}" stroke="${night ? "#1B4A2C" : C.leafLo}" stroke-width="1.4"/>
      <path d="M${cx} ${y + 78} C${cx + 30} ${y + 60} ${cx + 40} ${y + 74} ${cx + 34} ${y + 86} C${cx + 18} ${y + 96} ${cx + 5} ${y + 90} ${cx} ${y + 78} Z" fill="${night ? "#3B8F58" : C.leafHi}" stroke="${night ? "#1B4A2C" : C.leafLo}" stroke-width="1.4"/>
      <path d="M${cx - 18} ${y + 118} h36 l-5 16 h-26 Z" fill="#C0724A" stroke="#8A4E2F" stroke-width="1.4"/>`;
    // inSym·outSym이 오면 기체 이름 대신 기호를 점선 칩으로 인쇄한다(기체 동정 문항 · 정답 인쇄 차단).
    if (p.inGas) {
      const hid = !!p.inSym;
      const col = hid ? C.blue : p.inGas === "co2" ? C.co2 : C.o2;
      body += `<path d="M${PX + 18} ${y + 92} H${cx - 40}" stroke="${col}" stroke-width="3.6" marker-end="url(#${hid ? mMask : p.inGas === "co2" ? mCo2 : mO2})" fill="none"/>`;
      body += g5chip(PX + 12, y + 52, 92, p.inSym ?? DN_NAME[p.inGas], col, hid);
    }
    if (p.outGas) {
      const hid = !!p.outSym;
      const col = hid ? C.blue : p.outGas === "co2" ? C.co2 : C.o2;
      body += `<path d="M${cx + 40} ${y + 92} H${PX + 236}" stroke="${col}" stroke-width="3.6" marker-end="url(#${hid ? mMask : p.outGas === "co2" ? mCo2 : mO2})" fill="none"/>`;
      body += g5chip(PX + 156, y + 52, 92, p.outSym ?? DN_NAME[p.outGas], col, hid);
    }
    body += `<text x="${PX + 22}" y="${y + 26}" font-size="14" font-weight="800" fill="${night ? "#FFFFFF" : C.ink}">${p.label}</text>`;
  });
  const desc = o.panels.map((p) => `${p.label} 칸은 ${p.light === "none" ? "빛이 없고" : p.light === "bright" ? "해가 밝게 떠 있고" : "빛이 약하고"} 왼쪽과 오른쪽에 이름표가 붙은 화살표가 하나씩 있다${p.inSym || p.outSym ? `. 이름표 가운데 ${[p.inSym, p.outSym].filter(Boolean).join("·")}는 기호로 가려져 있다` : ""}`).join(", ");
  const H = 10 + o.panels.length * (PH + GAP);
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="같은 식물을 서로 다른 빛 조건에서 그린 ${o.panels.length}개 칸. ${desc}"><defs>${arrowDefs(mCo2, C.co2, 14)}${arrowDefs(mO2, C.o2, 14)}${arrowDefs(mMask, C.blue, 14)}</defs>${body}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// GB · 광합성량 / 호흡량 막대 쌍 (값 라벨 미인쇄 · 높이 판독이 과제)
// ══════════════════════════════════════════════════════════════════════════════
export function rateBarsFig(o: { groups: { label: string; photo: number; resp: number }[]; yLabel?: string }): string {
  const BASE = 156, TOP = 34;
  const maxV = Math.max(...o.groups.flatMap((g) => [g.photo, g.resp]), 1);
  const h = (v: number): number => (v / maxV) * (BASE - TOP - 6);
  const BW = 22, INNER = 7;
  const gw = BW * 2 + INNER;
  const span = 322 - 58;
  const step = span / o.groups.length;
  let body = "";
  o.groups.forEach((g, i) => {
    const gx = 58 + step * i + (step - gw) / 2;
    // 값이 0인 막대는 아무것도 안 그리면 "빠뜨린 것"으로 읽힌다 → 점선 빈 자리로 표시한다.
    const bar = (bx: number, v: number, fill: string, stroke: string): string =>
      v > 0
        ? `<rect x="${bx}" y="${BASE - h(v)}" width="${BW}" height="${h(v)}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`
        : `<rect x="${bx}" y="${BASE - 9}" width="${BW}" height="9" rx="3" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
    body += bar(gx, g.photo, C.leaf, C.leafLo);
    body += bar(gx + BW + INNER, g.resp, "#C86AA0", "#8E3E6C");
    body += `<text x="${gx + gw / 2}" y="${BASE + 18}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${C.ink}">${g.label}</text>`;
  });
  const legend = `<rect x="58" y="${BASE + 30}" width="14" height="10" rx="2" fill="${C.leaf}" stroke="${C.leafLo}" stroke-width="1.1"/>
    <text x="78" y="${BASE + 39}" font-size="12" font-weight="700" fill="${C.sub}">광합성량</text>
    <rect x="176" y="${BASE + 30}" width="14" height="10" rx="2" fill="#C86AA0" stroke="#8E3E6C" stroke-width="1.1"/>
    <text x="196" y="${BASE + 39}" font-size="12" font-weight="700" fill="${C.sub}">호흡량</text>`;
  // 세로축 이름을 x 46 오른끝맞춤으로만 두면 축 왼쪽 38px를 넘는 긴 이름이 화면 밖으로 잘린다
  // (318 "하루 동안의 양"이 "동안의 양"으로 보였다). 폭을 재서 넘치면 축 위 왼끝맞춤으로 돌린다.
  const yl = o.yLabel ?? "양";
  const ylw = [...yl].reduce((a, c) => a + (c === " " ? 3.4 : 11.5), 0);
  const ylTag =
    ylw > 38
      ? `<text x="8" y="20" font-size="11.5" font-weight="700" fill="${C.sub}">${yl}</text>`
      : `<text x="46" y="${TOP - 2}" text-anchor="end" font-size="11.5" font-weight="700" fill="${C.sub}">${yl}</text>`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="${o.groups.map((g) => g.label).join("·")}에서 잰 두 가지 양을 막대 두 개씩 짝지어 나타낸 그래프. 막대에 값은 적혀 있지 않다">
    <path d="M54 ${TOP - 4} V${BASE} H326" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    ${ylTag}
    ${body}${legend}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// TR · 물관·체관 이동 경로도 (물관은 반드시 뿌리 끝에서 시작 · 라벨은 지시선 배지)
// 구 transportFig은 물관 화살표가 줄기 중간에서 시작했고 라벨 (나)가 줄기에 겹쳐 뭉갰다.
// ══════════════════════════════════════════════════════════════════════════════
type TrRoute = "xylem" | "phloem-up" | "phloem-down" | "phloem-fruit";
/** 발주 일러스트(plant-vessels.webp) 위에 이동 화살표와 기호 배지만 얹는다.
 *  격자 실측(qa/shot-g2u5fig-grid.mjs): 줄기는 x 49.5%의 곧은 수직선 · 흙 선 y 71% ·
 *  뿌리 71~95% · 왼쪽 잎 y 27~44% · 오른쪽 잎 y 20~40% · 어린 순 y 5~17% · 열매 (62.5%, 45%).
 *  그림은 3:4이므로 x% x 3.44, y% x 4.59. 화살표는 줄기를 가리지 않도록 양옆으로 나란히 둔다
 *  (물관 x 46% · 체관 x 53%). 뷰박스는 420이라 아래 흙 일부가 잘린다. */
export function transportRouteFig(o: {
  routes: TrRoute[];
  syms?: { route: TrRoute; sym: string }[];
  reverse?: TrRoute[];
}): string {
  const IW = 344, IH = 459, VH = 420;
  const px = (f: number): number => Math.round(f * IW / 100) / 100;   // f = 만분율(2350 = 23.50%)
  const py = (f: number): number => Math.round(f * IH / 100) / 100;   // f = 만분율(7150 = 71.50%)
  const mX = uid(), mP = uid();
  const rev = new Set(o.reverse ?? []);
  const XV = px(4600), PH = px(5300);
  const art = `<image href="${g5fig("plant-vessels.webp")}" x="0" y="0" width="${IW}" height="${IH}" preserveAspectRatio="xMidYMid meet"/>`;
  const P: Record<TrRoute, { d: string; rd: string; col: string; m: string; bx: number; by: number; tx: number; ty: number }> = {
    xylem: {
      d: `M${XV} ${py(8600)} V${py(2700)}`, rd: `M${XV} ${py(2700)} V${py(8600)}`,
      col: C.xylem, m: mX, bx: 44, by: 250, tx: XV - 1, ty: 252,
    },
    "phloem-up": {
      d: `M${PH} ${py(3300)} V${py(1200)}`, rd: `M${PH} ${py(1200)} V${py(3300)}`,
      col: C.phloem, m: mP, bx: 300, by: 62, tx: PH + 2, ty: 68,
    },
    "phloem-down": {
      d: `M${PH} ${py(3800)} V${py(8400)}`, rd: `M${PH} ${py(8400)} V${py(3800)}`,
      col: C.phloem, m: mP, bx: 300, by: 292, tx: PH + 2, ty: 294,
    },
    // 열매 갈래 · 확대 격자 실측(qa/shot-g2u5fig-zoom.mjs plant-vessels.webp 42 34 76 54):
    // 열매 가지는 줄기의 마디 (50.5%, 42.3%)에서 갈라져 **위로 올라가** 열매 꼭지(x 57~68%, y 38~43%)에
    // 닿는다. 2차 수리본은 (53%, 35.3%) 허공에서 시작해 아래로 내려가 방향이 반대였다(사용자 3차 지적).
    // 이제 마디 오른쪽 끝(51.2%, 42.4%)에서 출발해 가지 곡선을 따라 오르며 체관 줄기와 교차한다.
    "phloem-fruit": {
      d: `M${px(5120)} ${py(4240)} C${px(5400)} ${py(4060)} ${px(5620)} ${py(3940)} ${px(6020)} ${py(3950)}`,
      rd: `M${px(6020)} ${py(3950)} C${px(5620)} ${py(3940)} ${px(5400)} ${py(4060)} ${px(5120)} ${py(4240)}`,
      col: C.phloem, m: mP, bx: 300, by: 258, tx: px(6020), ty: py(3950),
    },
  };
  let arrows = "";
  for (const r of o.routes) {
    const p = P[r];
    arrows += `<path d="${rev.has(r) ? p.rd : p.d}" stroke="${p.col}" stroke-width="3.8" marker-end="url(#${p.m})" fill="none" stroke-linecap="round"/>`;
  }
  let badges = "";
  for (const sm of o.syms ?? []) {
    const p = P[sm.route];
    badges += g5badge(p.bx, p.by, p.tx, p.ty, sm.sym, p.col);
  }
  const syms = (o.syms ?? []).map((sm) => sm.sym).join("·");
  return `<svg viewBox="0 0 ${IW} ${VH}" ${NS} fill="none" role="img" aria-label="흙에 뿌리를 내린 식물 한 그루를 옆에서 그린 그림. 곧은 줄기에 잎 두 장과 붉은 열매 하나가 달려 있고, 줄기 양옆에 이동 방향을 나타낸 화살표가 그려져 있다${syms ? `. ${syms} 기호가 각각 한 화살표를 가리킨다` : ""}"><defs>${arrowDefs(mX, C.xylem, 14)}${arrowDefs(mP, C.phloem, 14)}</defs>${art}${arrows}${badges}</svg>`;
}

const L1 = "g2u5l1";
const L2 = "g2u5l2";
const L3 = "g2u5l3";
const L4 = "g2u5l4";
const L5 = "g2u5l5";
const L6 = "g2u5l6";

export const POOL_G2U5_PILOT: ExamItem[] = [
  {
    // [201] d1 LF ④ · 재료가 드나드는 경로. 검산: 이산화 탄소는 기공(㉤)으로 들어온다.
    // 레슨 leafRouteFig의 (가)엽록체·(나)기공·(다)물관 배정과 기호·자리를 전면 교체했다.
    id: "g2u5e201",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "그림은 잎을 세로로 자른 단면이에요. 광합성의 재료인 <b>이산화 탄소</b>가 주로 드나드는 곳은 어디일까요?",
    figure: leafPartsFig({
      marks: [
        { part: "xylem", sym: "㉠" }, { part: "chloro", sym: "㉡" }, { part: "phloem", sym: "㉢" },
        { part: "cell", sym: "㉣" }, { part: "stoma", sym: "㉤" },
      ],
    }),
    options: ["㉠", "㉡", "㉢", "㉣", "㉤"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>㉤은 잎의 아래쪽 표면에서 도톰한 두 세포가 마주 보며 감싼 작은 틈, 곧 <b>기공</b>이에요. 공기 중의 <b>이산화 탄소</b>는 이 기공을 지나 잎 안으로 들어와 광합성의 재료가 되죠. 광합성의 두 재료 가운데 공기에서 오는 쪽이 이산화 탄소라는 점을 떠올리면 어디로 들어올지 바로 이어져요.<span class='xh'>오답 하나씩 격파</span>㉠은 잎맥 다발 속 위쪽의 굵고 둥근 관, 곧 <b>물관</b>이에요. 여기로는 뿌리에서 흡수한 물이 올라오죠. ㉢은 그 아래쪽의 작은 관인 <b>체관</b>이라 잎에서 만든 양분이 지나가는 길이고요. ㉡은 세포 안에 촘촘히 든 초록색 알갱이인 <b>엽록체</b>로, 재료가 드나드는 통로가 아니라 광합성이 <b>일어나는 장소</b>예요. ㉣은 잎 속을 채운 둥근 세포 자체라 통로가 아니에요. 통로를 묻는지 장소를 묻는지부터 갈라내면 헷갈리지 않아요.",
    core: "이산화 탄소는 기공으로 · 물은 물관으로 · 양분은 체관으로!",
  },
  {
    // [203] d2 PS ② · 출입 도해 판독. 검산: 광합성 in = 이산화 탄소·물 / out = 포도당·산소.
    // 물·포도당은 그림에 인쇄돼 있으므로 미끼로 쓸 수 있다(㉠㉡만 가림).
    id: "g2u5e203",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "그림은 잎의 어떤 세포 소기관에서 일어나는 물질 변화를 나타낸 거예요. ㉠과 ㉡에 알맞은 물질을 바르게 짝 지은 것은?",
    figure: psExchangeFig({ mode: "photo", hide: ["in1", "out2"] }),
    options: [
      "㉠ 산소 · ㉡ 이산화 탄소",
      "㉠ 이산화 탄소 · ㉡ 산소",
      "㉠ 이산화 탄소 · ㉡ 녹말",
      "㉠ 물 · ㉡ 산소",
      "㉠ 빛에너지 · ㉡ 포도당",
    ],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 소기관은 <b>엽록체</b>이고, 여기서 일어나는 일은 광합성이에요. 들어가는 쪽에 이미 '물'이 적혀 있으니 나머지 재료인 ㉠은 <b>이산화 탄소</b>죠. 나오는 쪽에 '포도당'이 적혀 있으니 나머지 생성물인 ㉡은 <b>산소</b>예요.<span class='xh'>오답 하나씩 격파</span>'㉠ 산소 · ㉡ 이산화 탄소'는 재료와 생성물을 통째로 뒤집은 짝이에요. '㉡ 녹말'은 광합성으로 곧바로 생기는 물질이 아니라 포도당 일부가 나중에 바뀐 저장 형태고요. '㉠ 물'은 이미 그림에 적혀 있으니 같은 물질이 두 번 들어갈 수 없어요. '㉠ 빛에너지'는 화살표 위쪽에 따로 그려진 조건이지 화살표 왼쪽의 물질 재료가 아니에요.",
    core: "엽록체로 들어가는 건 이산화 탄소와 물, 나오는 건 포도당과 산소!",
  },
  {
    // [204] d1 무③ ③ · 빛의 역할(에너지 vs 물질). 검산: 하루 사이 늘어난 잎의 무게는 빛으로 만들어
    // 저장한 양분이지 빛 자체가 아니다. 초판은 문두에 광합성 완전식을 인쇄해 203의 ㉠㉡과 207의
    // 정답 집합을 통째로 유출했다(검산 A 적발) → 물질 이름을 쓰지 않는 무게 해석 축으로 전면 교체.
    id: "g2u5e204",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "같은 나무에서 딴 잎 두 장의 무게를 재고, 한 장만 하루 동안 햇빛을 받게 했어요. 다음 날 <b>햇빛을 받은 잎만</b> 조금 무거워졌어요. 이 무게 차이를 만든 것으로 가장 알맞은 것은?",
    options: [
      "빛에너지를 이용해 잎이 새로 만들어 저장한 양분",
      "잎 속에 그대로 쌓인 빛",
      "잎 표면에 내려앉은 먼지",
      "잎이 흡수한 소리와 열",
      "잎이 밤사이 잃어버린 물의 양",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>빛을 받은 잎에서는 잎 속 공장이 돌아가 <b>새로운 양분이 만들어져 쌓여요.</b> 늘어난 무게의 정체는 바로 그 양분이죠. 빛은 이 변화를 일으키는 <b>에너지</b>일 뿐, 그 자체가 잎에 쌓이는 물질이 아니에요.<span class='xh'>오답 하나씩 격파</span>'그대로 쌓인 빛'은 빛을 물질로 착각한 설명이에요. 빛은 무게를 가진 알갱이처럼 잎에 고이지 않아요. 먼지가 하루 사이에 잴 수 있을 만큼 쌓이지도 않고, 그렇다면 빛을 가린 잎에도 똑같이 쌓였겠죠. 소리와 열은 잎에 남아 무게가 되는 것이 아니에요. 물을 잃었다면 무게는 <b>줄어야</b> 하니 방향이 반대고요. 무게가 늘었다면 무언가 새로 만들어졌는지부터 따져 보세요.",
    core: "늘어난 무게의 정체는 새로 만든 양분, 빛이 아니에요!",
  },
  {
    // [205] d2 dbox ⑳ · 결론의 한계. 검산: 이 실험만으로는 "흙에서 온 것이 아니다"까지만 말할 수 있다.
    // 만화(반 헬몬트·버드나무·5년)와 인물·세팅·수치를 전부 교체한 익명판.
    id: "g2u5e205",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어느 연구자가 오래전에 한 실험이에요. 이 결과에서 <b>바로 이끌어 낼 수 있는</b> 결론으로 가장 알맞은 것은?",
    figure: dbox([
      ["실험", "말린 흙 20 kg을 담은 큰 화분에 어린 나무 한 그루를 심고, 3년 동안 빗물과 수돗물만 주며 길렀어요."],
      ["결과", "나무의 무게는 크게 늘었지만, 화분에 담긴 흙의 무게는 아주 조금밖에 줄지 않았어요."],
    ]),
    options: [
      "늘어난 나무의 무게는 대부분 흙에서 온 것이 아니에요",
      "나무의 몸은 모두 물로만 만들어졌어요",
      "흙에 들어 있던 무기 양분이 나무 무게의 대부분이 되었어요",
      "3년이 더 지나면 화분의 흙이 모두 사라질 거예요",
      "흙의 무게가 거의 줄지 않았으므로 나무는 자라지 않았어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>나무는 크게 무거워졌는데 흙은 거의 줄지 않았어요. 늘어난 무게만큼 흙이 사라지지 않았으니, 나무를 이룬 물질의 대부분이 <b>흙에서 온 것은 아니라는</b> 것까지가 이 결과로 말할 수 있는 범위예요.<span class='xh'>오답 하나씩 격파</span>'모두 물로만'은 이 실험에서 준 것이 물뿐이었다는 사실에서 성급하게 건너뛴 결론이에요. 공기 중의 물질도 쓰였는지는 이 실험만으로 확인할 수 없죠. '무기 양분이 무게의 대부분'이라면 흙이 그만큼 크게 줄었어야 하니 관찰과 어긋나요. '흙이 모두 사라질 것'은 관찰한 3년치를 근거 없이 앞질러 늘린 예측이고요. 나무가 무거워졌다는 것 자체가 자랐다는 뜻이므로 '자라지 않았다'도 관찰과 반대예요.",
    core: "관찰이 말해 주는 데까지만 결론 내리기!",
  },
  {
    // [207] multi d1 무① ① · 생성물 판별(정답 2개). 검산: 광합성 생성물 = 포도당·산소.
    // 이산화 탄소·물은 재료 · 엽록소는 광합성으로 만들어지는 물질이 아니다.
    // 레슨 multi(물질 재료로 쓰이는 것 모두)와 축을 재료→생성물로 반전하고 보기 세트도 교체했다.
    id: "g2u5e207",
    lessonId: L1,
    type: "multi",
    diff: 1,
    prompt: "빛을 충분히 받은 잎에서 광합성으로 <b>새로 만들어지는 물질</b>을 모두 골라 보세요.",
    options: ["포도당", "산소", "이산화 탄소", "물", "엽록소"],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>광합성으로 새로 만들어지는 물질은 <b>포도당</b>과 <b>산소</b> 두 가지예요. 포도당은 식물이 쓸 양분이고, 산소는 함께 생겨 잎 밖으로 나갈 수 있죠.<span class='xh'>오답 하나씩 격파</span>이산화 탄소와 물은 광합성에 <b>쓰이는 재료</b>라 새로 만들어지는 쪽이 아니에요. 방향을 반대로 기억하면 그래프나 도해를 읽을 때마다 어긋나니 재료와 생성물을 짝지어 외워 두세요. 엽록소는 잎을 초록으로 보이게 하는 색소로, 광합성이 <b>일어나게 돕는 쪽</b>이지 광합성으로 만들어지는 물질이 아니에요. 잎에 녹말이 쌓이는 것도 포도당이 나중에 바뀐 결과라서 '처음 만들어지는 물질'과는 구분해야 해요.",
    core: "만들어지는 건 포도당과 산소, 쓰이는 건 이산화 탄소와 물!",
  },
  {
    // [209] d1 사진 stomata-micro ④ · 기공의 역할. alt는 관찰 서술만(이름·역할 미언급).
    // 검산: 광합성 재료로 기공을 지나는 것은 이산화 탄소.
    id: "g2u5e209",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "사진은 잎의 표면을 현미경으로 확대해 본 모습이에요. 사진 <b>가운데</b>에서 볼 수 있는 것과 그 역할을 바르게 짝 지은 것은?",
    figure: ximg("stomata-micro.webp", "잎 표면을 현미경으로 확대한 사진. 조각보처럼 이어진 납작한 세포들 사이에 길쭉한 틈이 하나 있고, 그 양옆을 콩 모양의 도톰한 세포 두 개가 감싸고 있어요."),
    options: [
      "세포 두 개가 감싼 구멍 · 기체가 드나드는 통로예요",
      "세포 두 개가 감싼 구멍 · 물을 담아 두는 주머니예요",
      "굵고 곧은 관 · 뿌리에서 온 물이 지나는 길이에요",
      "동그란 초록색 알갱이 · 광합성이 일어나는 곳이에요",
      "두껍고 단단한 껍질 · 잎을 받쳐 주는 벽이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 가운데에는 <b>도톰한 세포 두 개가 마주 보며 감싼 길쭉한 틈</b>이 보여요. 이것이 잎 표면의 <b>기공</b>이고, 이산화 탄소와 산소 같은 기체가 이 구멍을 지나 드나들어요.<span class='xh'>오답 하나씩 격파</span>같은 구멍을 두고 '물을 담아 두는 주머니'라고 한 짝은 역할이 틀렸어요. 기공은 물을 가두는 곳이 아니라 기체가 오가는 통로죠. '굵고 곧은 관'은 사진에 없어요. 물이 지나는 <b>물관</b>은 잎맥 속에 있어 표면에서는 보이지 않아요. '동그란 초록색 알갱이'는 세포 안의 <b>엽록체</b>를 가리키는 말인데, 사진 가운데의 모양과는 달라요. '두껍고 단단한 껍질' 역시 사진에서 확인할 수 없고요. 사진 문제는 <b>보이는 모양</b>을 먼저 확정하고 역할을 붙이세요.",
    core: "두 세포가 감싼 틈 = 기체가 드나드는 구멍!",
  },
  {
    // [214] d3 dbox bogi ⑳ · 조건 판정. 검산: 광합성에는 빛과 엽록체가 모두 필요하다.
    // (다)는 물에 담갔어도 어두운 상자 안이라 빛이 없다 → ㄷ 거짓.
    id: "g2u5e214",
    lessonId: L1,
    type: "mcq",
    diff: 3,
    prompt: "같은 화분 식물에서 고른 잎 세 장을 하루 동안 다르게 두었어요. 이에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: dbox([
      ["(가)", "잎을 그대로 둔 채 햇빛이 잘 드는 창가에 두었어요."],
      ["(나)", "잎 전체를 은박으로 빈틈없이 감싼 채 같은 창가에 두었어요."],
      ["(다)", "잎을 따서 물이 담긴 컵에 꽂고 어두운 상자 안에 넣었어요."],
    ]),
    bogi: [
      "(가)의 잎에서는 광합성이 일어났어요.",
      "(나)의 잎에서는 빛이 닿지 않아 광합성이 거의 일어나지 않았어요.",
      "(다)의 잎은 물에 담겨 있으므로 광합성에 필요한 것이 모두 갖추어졌어요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ. (가)는 빛도 받고 잎도 온전하니 광합성이 일어나요. ㄴ. (나)는 잎 전체가 은박에 싸여 빛이 닿지 않아요. 광합성은 빛이 있어야 일어나므로 거의 멈추죠.<span class='xh'>오답 하나씩 격파</span>ㄷ. (다)의 잎은 물은 넉넉히 얻었지만 <b>어두운 상자</b> 안에 있어요. 광합성에 꼭 필요한 빛이 빠져 있으니 '필요한 것이 모두 갖추어졌다'고 할 수 없어요. 재료가 있어도 빛이라는 조건이 없으면 잎 속 공장은 돌아가지 않아요. 이렇게 조건을 하나씩 지워 보면 어느 장치에서 광합성이 일어날지 빠르게 가려낼 수 있어요.",
    core: "재료가 다 있어도 빛이 없으면 광합성은 멈춰요!",
  },
  {
    // [228] d1 ST ⑤ · 아이오딘 반응 해석. 검산: 청람색 = 녹말 · 포도당 직접 검출 아님.
    // 조건 라벨은 인쇄하지 않는 파라미터판(구 starchTestFig은 조건을 인쇄했다).
    id: "g2u5e228",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt: "하루 동안 어둠에 둔 화분 식물의 잎 한 장에서 한쪽만 빛을 받게 한 뒤, 그 잎을 탈색하고 아이오딘 용액을 떨어뜨렸더니 그림처럼 되었어요. <b>㉠ 부분</b>에 대한 설명으로 옳은 것은?",
    figure: starchLeafFig({ regions: [{ result: "blue", sym: "㉠" }, { result: "none", sym: "㉡" }] }),
    options: [
      "녹말이 생겨 아이오딘 반응이 나타났어요",
      "포도당이 아이오딘 용액에 직접 검출되었어요",
      "엽록소가 남아 있어 색이 진해졌어요",
      "빛을 받지 못해 아무 변화도 일어나지 않았어요",
      "녹말이 모두 설탕으로 바뀌면서 색이 변했어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>아이오딘 용액은 <b>녹말</b>과 만나면 청람색 계열로 변해요. ㉠ 부분이 짙게 변했다는 것은 그곳에 녹말이 있다는 뜻이고, 빛을 받아 광합성이 일어난 결과 만들어진 양분의 일부가 녹말로 저장되었음을 보여 주죠.<span class='xh'>오답 하나씩 격파</span>아이오딘 용액이 검출하는 것은 포도당이 아니라 녹말이에요. 이 둘을 바꿔 쓰면 실험의 뜻이 통째로 달라져요. 엽록소는 탈색 과정에서 이미 빠져나갔기 때문에 색이 진해진 원인이 될 수 없어요. ㉠은 빛을 받은 쪽이라 '빛을 받지 못했다'도 어긋나고요. 설탕으로 바뀌는 변화는 아이오딘 용액으로 확인할 수 없어요.",
    core: "청람색으로 변하면 그곳에 녹말이 있다는 뜻!",
  },
  {
    // [229] d2 IF ⑤ · 절차의 까닭. 검산: 뜨거운 물 → 에탄올 중탕(탈색) → 물 헹굼 → 아이오딘.
    // 레슨 order(4단계 전체 배열)와 달리 한 칸의 내용과 까닭만 묻는다.
    id: "g2u5e229",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "그림은 빛을 받은 잎에서 녹말을 확인하는 실험 과정이에요. ㉠에 들어갈 과정과 그 까닭으로 가장 알맞은 것은?",
    figure: inquiryFlowFig({ steps: ["뜨거운 물에 담그기", "에탄올 중탕", "물로 헹구기", "아이오딘 용액"], blank: 1 }),
    options: [
      "에탄올에 넣어 중탕하기. 잎의 초록색을 빼야 색 변화가 잘 보이기 때문이에요",
      "에탄올에 넣어 중탕하기. 잎에 녹말을 새로 만들어 주기 위해서예요",
      "아이오딘 용액을 한 번 더 떨어뜨리기. 색을 더 진하게 하기 위해서예요",
      "잎을 햇빛에 널어 말리기. 남은 물기를 없애기 위해서예요",
      "잎을 잘게 자르기. 녹말을 잎 전체에 골고루 퍼뜨리기 위해서예요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>잎에는 짙은 초록색 색소가 들어 있어서, 그대로 두면 아이오딘 용액 때문에 생긴 색 변화를 알아보기 어려워요. 그래서 잎을 <b>에탄올에 넣어 중탕</b>해 색소를 빼내죠. 색이 빠진 잎에 아이오딘 용액을 떨어뜨려야 청람색이 뚜렷하게 보여요.<span class='xh'>오답 하나씩 격파</span>에탄올은 색소를 빼낼 뿐 녹말을 만들지 않아요. 아이오딘 용액을 두 번 떨어뜨려도 색소가 남아 있으면 판독은 그대로 어렵고요. 햇빛에 말리면 물기는 없어져도 초록색은 그대로라 목적을 이루지 못해요. 잘게 자르는 것도 색소 문제를 해결해 주지 않아요. 이 실험의 순서는 <b>색소를 먼저 빼고 그다음에 검출</b>이라는 흐름으로 기억하세요.",
    core: "색소를 먼저 빼야 색 변화가 보여요!",
  },
  {
    // [230] d2 EX ⑥ · 조작 변인 판정. 검산: 두 용기의 차이는 은박으로 빛을 막았는지 여부뿐.
    // 조건 이름은 그림에 인쇄하지 않는다((가)(나) 라벨만).
    id: "g2u5e230",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "같은 크기의 화분 식물을 똑같은 두 용기에 넣고 뚜껑을 닫아 밝은 곳에 그림처럼 두었어요. 두 용기에서 <b>일부러 다르게 한 조건</b>은 무엇일까요?",
    figure: sealedPlantFig({
      panels: [{ plant: "live", cover: "none", label: "(가)" }, { plant: "live", cover: "foil", label: "(나)" }],
    }),
    options: [
      "용기 안으로 들어가는 빛",
      "용기 안에 넣은 식물의 종류",
      "용기의 크기와 모양",
      "실험을 시작할 때 용기 안 공기의 온도",
      "식물에 준 물의 양",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(나)만 은박으로 감싸여 있어요. 두 용기는 같은 밝은 곳에 두었으니, 실제로 달라진 것은 <b>빛이 용기 안까지 들어가는지</b> 하나뿐이죠. 이렇게 알아보려는 조건 하나만 다르게 해야 결과의 원인을 빛이라고 말할 수 있어요.<span class='xh'>오답 하나씩 격파</span>식물의 종류와 크기는 '같은 크기의 화분 식물'이라고 문두에 밝혀 두었어요. 용기도 '똑같은 두 용기'라 크기와 모양이 같고요. 온도와 물의 양은 같게 맞춰야 하는 조건이라 여기서 일부러 다르게 한 것이 아니에요. 다르게 한 조건을 찾을 때는 두 장치의 그림에서 <b>눈에 보이는 차이</b>부터 짚어 보세요.",
    core: "다르게 한 조건은 딱 하나 · 나머지는 모두 같게!",
  },
  {
    // [234] d1 VT ⑦ · 표 판독으로 실험 목적 동정. 검산: 다르게 한 행이 곧 알아보려는 조건.
    id: "g2u5e234",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt: "표는 어떤 실험에서 조건을 어떻게 맞추었는지 정리한 거예요. 이 실험으로 알아보려는 것은 무엇일까요?",
    figure: variableTableFig({
      items: ["빛을 비추는지 여부", "물의 양", "식물의 종류와 크기", "실험한 시간"],
      marks: ["diff", "same", "same", "same"],
    }),
    options: [
      "빛이 있고 없음에 따라 광합성이 달라지는지",
      "물의 양에 따라 광합성이 달라지는지",
      "식물의 종류에 따라 광합성이 달라지는지",
      "시간이 지날수록 식물이 얼마나 자라는지",
      "물의 온도가 광합성에 영향을 주는지",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>표에서 '다르게'에 표시된 줄은 <b>빛을 비추는지 여부</b> 하나뿐이에요. 실험에서 일부러 다르게 한 조건이 바로 알아보려는 조건이므로, 이 실험은 빛의 유무가 광합성에 미치는 영향을 확인하려는 거예요.<span class='xh'>오답 하나씩 격파</span>물의 양·식물의 종류와 크기·실험한 시간은 모두 '같게'에 표시돼 있어요. 같게 맞춘 조건은 결과의 원인이 될 수 없으니 알아보려는 대상이 아니죠. 물의 온도는 표에 아예 나오지 않은 항목이라 이 표만으로는 확인할 수 없고요. 조건 표를 읽을 때는 <b>다르게 표시된 줄을 먼저 찾는</b> 습관을 들이면 실험의 목적이 한눈에 보여요.",
    core: "다르게 한 조건 = 알아보려는 조건!",
  },
  {
    // [235] multi d2 dbox ⑦ · 통제 변인 판별(정답 3개). 검산: 조작 변인은 전등뿐,
    // '기포에서 나온 기체의 종류'는 조건이 아니라 결과라 통제 대상이 아니다.
    id: "g2u5e235",
    lessonId: L2,
    type: "multi",
    diff: 2,
    prompt: "다음 실험에서 <b>같게 맞추어야 하는 조건</b>을 모두 골라 보세요.",
    figure: dbox([
      ["실험", "크기가 비슷한 물풀을 똑같은 유리컵 두 개에 하나씩 넣고, 한 컵에는 전등을 비추고 다른 컵은 검은 상자로 덮었어요. 그런 다음 일정 시간 동안 물풀에서 나오는 기포의 수를 세었어요."],
    ]),
    options: [
      "물풀의 크기와 양",
      "컵에 담은 물의 양과 온도",
      "전등을 비추는지 여부",
      "기포를 세는 시간",
      "기포에서 나온 기체의 종류",
    ],
    answer: [0, 1, 3],
    explain:
      "<span class='xh'>정답 풀이</span>이 실험에서 알아보려는 것은 빛의 유무예요. 그러니 물풀의 크기와 양, 물의 양과 온도, 기포를 세는 시간처럼 결과에 영향을 줄 수 있는 나머지 조건은 모두 <b>같게</b> 맞춰야 해요. 그래야 기포 수의 차이를 빛 때문이라고 말할 수 있죠.<span class='xh'>오답 하나씩 격파</span>'전등을 비추는지 여부'는 일부러 다르게 한 조건이에요. 이것까지 같게 하면 비교 자체가 사라져 실험이 성립하지 않아요. '기포에서 나온 기체의 종류'는 실험을 하기 전에 맞추는 조건이 아니라 <b>실험이 끝난 뒤 확인하는 결과</b>예요. 맞추는 조건과 얻는 결과를 갈라 두는 것이 공정한 실험의 첫걸음이에요.",
    core: "비교하려는 하나만 다르게, 나머지는 전부 같게!",
  },
  {
    // [236] d1 사진 pondweed-bubbles ⑥ · 기체 확인 방법. 검산: 산소는 꺼져 가는 불씨를 되살린다.
    // 석회수는 이산화 탄소 · 아이오딘 용액은 녹말 검출.
    // 훅(기포의 정체는?) 직문을 피하고 확인 '방법'으로 축을 옮겼다.
    id: "g2u5e236",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt: "사진은 밝은 곳에 둔 물속 식물을 찍은 거예요. 사진에서 <b>관찰되는 것</b>이 광합성으로 생긴 산소인지 확인하는 방법으로 가장 알맞은 것은?",
    figure: ximg("pondweed-bubbles.webp", "물이 담긴 유리컵 속에 잠긴 깃털 모양의 물풀에서 작은 알갱이 같은 것이 여러 개 위로 올라오는 사진."),
    options: [
      "기포를 모은 뒤 꺼져 가는 불씨를 대어 다시 타오르는지 살펴봐요",
      "기포를 모은 뒤 아이오딘 용액을 떨어뜨려 색이 변하는지 살펴봐요",
      "기포를 모은 뒤 석회수에 넣어 뿌옇게 흐려지는지 살펴봐요",
      "기포가 올라오는 물의 온도를 재어 올라갔는지 살펴봐요",
      "물풀의 무게를 재어 처음보다 늘었는지 살펴봐요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진에서 위로 올라오는 것은 <b>기포</b>예요. 산소는 물질이 타는 것을 돕는 성질이 있으므로, 이 기포를 모아 <b>꺼져 가는 불씨</b>를 대었을 때 불꽃이 다시 살아나면 그 기체가 산소라고 판단할 수 있어요.<span class='xh'>오답 하나씩 격파</span>아이오딘 용액은 녹말을 확인하는 시약이라 기체에는 쓸 수 없어요. 석회수가 뿌옇게 흐려지는 것은 <b>이산화 탄소</b>를 확인하는 방법이니, 산소를 확인하려는 이 문제와는 반대편 시약이죠. 물의 온도는 밝은 곳에 두기만 해도 오를 수 있어 기체의 종류를 가려 주지 못해요. 물풀의 무게 변화도 어떤 기체가 나왔는지에 대해서는 아무것도 말해 주지 않고요.",
    core: "산소는 꺼져 가는 불씨를 되살려요!",
  },
  {
    // [247] d3 SP bogi ⑥ · 대조 장치 두 곡선 판독. 검산: 빛을 비춘 두 용기 중 식물이 든 쪽에서만
    // 이산화 탄소가 줄고, 빈 용기는 변화가 없다(빈 용기는 호흡도 광합성도 없으므로 평평이 정확).
    // 초판은 CO2 감소 + O2 증가 2곡선이라 레슨 sensorGraphFig·mcq와 같은 자료 조합이었다(검산 A 적발).
    id: "g2u5e247",
    lessonId: L2,
    type: "mcq",
    diff: 3,
    prompt: "똑같이 밀폐한 두 용기를 같은 밝기의 빛 아래 두고 이산화 탄소 농도를 재어 그래프로 나타냈어요. 한 용기에는 식물을 넣었고 다른 용기는 비워 두었어요. 이 결과에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: gasSensorFig({
      series: [{ name: "식물을 넣은 용기", shape: "down" }, { name: "비워 둔 용기", shape: "flat", color: "#7A5FCB" }],
      xLabel: "시간",
      yLabel: "이산화 탄소 농도",
    }),
    bogi: [
      "두 용기에서 이산화 탄소가 비슷하게 줄었어요.",
      "식물을 넣은 용기에서만 이산화 탄소가 줄었어요.",
      "이산화 탄소가 줄어든 것이 식물 때문임을 이 비교로 말할 수 있어요.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ. 내려가는 곡선은 <b>식물을 넣은 용기</b>예요. 비워 둔 용기의 곡선은 처음 높이 그대로 이어지죠. ㄷ. 두 용기는 밝기도 용기도 같고 오직 식물의 유무만 다르니, 이산화 탄소가 줄어든 원인을 식물이라고 말할 수 있어요. 비교 기준이 있어야 원인을 지목할 수 있다는 점이 이 실험의 핵심이에요.<span class='xh'>오답 하나씩 격파</span>ㄱ은 두 곡선을 뭉뚱그려 읽은 거예요. 그래프에서 <b>한 곡선만</b> 내려가고 다른 곡선은 평평해요. 만약 빈 용기에서도 똑같이 줄었다면, 줄어든 까닭을 식물이라고 말할 수 없게 되죠. 곡선 문제는 범례에서 이름과 색을 먼저 짝지어 놓고 각각의 방향을 따로 읽어야 실수가 없어요.",
    core: "비워 둔 용기와 견주어야 식물 때문이라고 말할 수 있어요!",
  },
  {
    // [255] d1 FC ⑧ · 포화 곡선 판독. 검산: sat 곡선은 frac 0.58부터 평평 → ㉢(0.82)이 최대.
    id: "g2u5e255",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "그래프는 다른 조건을 모두 같게 하고 빛의 세기만 바꾸며 잰 광합성량이에요. 광합성량이 <b>가장 큰</b> 지점은 어디일까요?",
    figure: factorGraphFig({
      kind: "sat",
      curves: [{}],
      xLabel: "빛의 세기",
      marks: [{ frac: 0.1, sym: "㉠" }, { frac: 0.28, sym: "㉡" }, { frac: 0.82, sym: "㉢" }],
    }),
    options: ["㉠", "㉡", "㉢", "㉠과 ㉡이 같아요", "세 지점 모두 같아요"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>세로축이 광합성량이므로 <b>곡선이 가장 높이 올라간 자리</b>가 광합성량이 가장 큰 지점이에요. 곡선은 왼쪽에서 가파르게 오르다가 오른쪽에서 거의 평평해지고, ㉢은 그 평평한 구간에 있어 세 지점 가운데 가장 높아요.<span class='xh'>오답 하나씩 격파</span>㉠은 곡선의 아래쪽이라 광합성량이 가장 작아요. ㉡은 아직 오르는 중이어서 ㉢보다 낮고요. ㉠과 ㉡은 높이가 뚜렷하게 다르므로 같다고 볼 수 없어요. 세 지점이 모두 같다면 곡선이 수평선이어야 하는데, 그래프는 분명히 왼쪽에서 오른쪽으로 올라가고 있어요. 그래프 문제는 <b>세로축이 무엇인지</b>부터 확인하고 높이를 비교하세요.",
    core: "세로축이 광합성량 · 높이가 곧 크기!",
  },
  {
    // [258] d2 FC ⑧ · 봉우리 오른쪽이 내려가는 까닭. 검산: 알맞은 범위를 넘으면 광합성을 돕는
    // 과정이 방해받아 광합성량이 줄어든다("높을수록 유리"는 항상 거짓 미끼).
    // 초판은 "가로축이 어떤 조건인가" 역추론이었는데, 255·262가 빛·이산화 탄소를 포화형으로 인쇄해
    // 소거만으로 온도가 남았다(검산 A 적발) → 그래프 모양을 반드시 읽어야 하는 축으로 교체.
    id: "g2u5e258",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "그래프는 다른 조건을 모두 같게 하고 어떤 조건 하나만 바꾸며 잰 광합성량이에요. 오른쪽으로 갈수록 광합성량이 <b>다시 줄어드는</b> 까닭으로 가장 알맞은 것은?",
    figure: factorGraphFig({ kind: "peak", curves: [{}] }),
    options: [
      "조건이 알맞은 범위를 넘어서면 광합성을 돕는 과정이 방해받기 때문이에요",
      "조건을 높일수록 재료가 더 넉넉하게 공급되기 때문이에요",
      "조건이 높아지면 식물이 광합성을 아예 그만두기 때문이에요",
      "그래프를 그릴 때 눈금을 잘못 읽었기 때문이에요",
      "광합성량은 어떤 조건과도 관계가 없기 때문이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>곡선은 가운데에서 가장 높고 그 뒤로는 내려가요. 조건을 <b>알맞은 범위까지</b> 높이면 광합성이 활발해지지만, 그 범위를 넘어서면 광합성을 돕는 과정이 방해를 받아 오히려 광합성량이 줄어들죠. '높을수록 무조건 유리하다'가 이 단원에서 가장 흔한 오해예요.<span class='xh'>오답 하나씩 격파</span>'재료가 더 넉넉해진다'가 맞다면 곡선은 계속 올라가거나 평평해져야지 내려갈 수 없어요. '아예 그만둔다'면 곡선이 바닥까지 떨어져야 하는데, 오른쪽 끝에서도 곡선은 바닥보다 위에 있어요. 눈금을 잘못 읽었다는 설명은 관찰 결과 자체를 부정하는 것이라 근거가 없고요. 조건과 관계가 없다면 곡선은 처음부터 수평선이었겠죠. <b>곡선이 어디에서 방향을 바꾸는지</b>를 먼저 짚어 보세요.",
    core: "알맞은 범위를 넘으면 오히려 줄어요!",
  },
  {
    // [260] d1 사진 greenhouse ⑰ · 장치와 조건 짝. 검산: 조명 = 빛의 세기, 환기 = 공기를 바꿔 이산화 탄소 농도 조절.
    // 레슨 mcq("빛이 충분한데 안 늘 때 다음 점검")와 축을 분리했다.
    id: "g2u5e260",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "사진은 작물을 기르는 온실 안이에요. 천장에 달린 장치들 가운데 <b>광합성 조건을 직접 조절하는</b> 두 가지와 그 조건을 바르게 짝 지은 것은?",
    figure: pimg("figs/greenhouse.webp", "유리 지붕 아래 작물이 줄지어 자라는 온실 안의 사진. 천장에 길쭉한 등 여러 개와 커다란 날개가 도는 장치, 작은 상자 모양 기구가 달려 있어요."),
    options: [
      "조명은 빛의 세기를, 환기 장치는 이산화 탄소 농도를 조절해요",
      "조명은 이산화 탄소 농도를, 환기 장치는 빛의 세기를 조절해요",
      "조명은 준 물의 양을, 환기 장치는 흙의 종류를 조절해요",
      "두 장치 모두 빛의 세기만 조절해요",
      "두 장치 모두 광합성 조건과는 관계가 없어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>천장의 길쭉한 등은 작물에 닿는 <b>빛의 세기</b>를 직접 바꿔 주는 조명이에요. 커다란 날개가 도는 장치는 온실 안팎의 공기를 바꾸는 환기 장치라, 광합성에 쓰이며 줄어든 <b>이산화 탄소 농도</b>를 되살려 주죠. 환기는 온도도 함께 낮춰 주지만, 보기에서 짝지을 조건으로는 이산화 탄소 쪽이 핵심이에요.<span class='xh'>오답 하나씩 격파</span>조명이 이산화 탄소 농도를 바꾸지는 못해요. 빛은 기체가 아니니까요. 환기 장치도 빛을 만들어 내지는 않고요. 물의 양은 물을 주는 장치가, 흙의 종류는 재배 방식이 맡는 일이라 천장의 두 장치와 짝지을 수 없어요. 온실 장치가 광합성과 무관하다는 설명은 온실을 짓는 이유 자체를 부정하는 셈이에요.",
    core: "조명은 빛, 환기는 공기 속 이산화 탄소!",
  },
  {
    // [261] d2 VT ⑦ · 통제 변인 판정. 검산: 온도만 다르게 하고 나머지는 같게 → ㉠(물풀의 크기와 양)은 '같게'.
    // 234와 표 구성·질문 구조를 다르게 했다(234 = 목적 동정 · 261 = 빈칸 판정).
    id: "g2u5e261",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "표는 온도가 광합성량에 미치는 영향을 알아보는 실험의 조건이에요. ㉠에 들어갈 표시와 그 까닭으로 가장 알맞은 것은?",
    figure: variableTableFig({
      items: ["물의 온도", "비추는 빛의 세기", "이산화 탄소 농도", "물풀의 크기와 양"],
      marks: ["diff", "same", "same", "q"],
    }),
    options: [
      "같게. 비교하려는 온도 말고는 모두 같아야 결과의 원인을 가릴 수 있기 때문이에요",
      "다르게. 조건이 많이 달라질수록 결과의 차이가 뚜렷해지기 때문이에요",
      "같게. 물풀의 크기는 광합성량과 아무 관계가 없기 때문이에요",
      "다르게. 물풀이 클수록 물의 온도가 잘 올라가기 때문이에요",
      "같게 하든 다르게 하든 결과에는 아무 영향이 없기 때문이에요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>이 실험에서 일부러 다르게 한 것은 물의 온도 하나예요. 물풀의 크기와 양은 광합성량에 영향을 줄 수 있으니 <b>같게</b> 맞춰야 해요. 그래야 결과의 차이를 온도 때문이라고 말할 수 있죠.<span class='xh'>오답 하나씩 격파</span>'조건이 많이 달라질수록 차이가 뚜렷해진다'는 말은 그럴듯하지만, 여러 조건이 동시에 달라지면 어느 조건이 결과를 만들었는지 알 수 없어 실험이 무너져요. '물풀의 크기는 관계가 없다'는 결론 자체가 틀렸어요. 잎이 많을수록 광합성량은 달라지니까요. '물풀이 클수록 온도가 오른다'도 근거 없는 설명이고요. 영향이 아예 없다는 설명은 조건을 맞추는 일 자체를 부정해요.",
    core: "비교할 하나만 빼고 전부 같게!",
  },
  {
    // [262] multi d2 FC ⑧ · 곡선 구간 판독(정답 2개). 검산: sat 곡선은 frac 0.58부터 평평 →
    // ㉠(0.1)~㉡(0.62) 구간은 증가 · ㉡~㉢(0.9) 구간은 거의 일정.
    id: "g2u5e262",
    lessonId: L3,
    type: "multi",
    diff: 2,
    prompt: "그래프는 다른 조건을 모두 같게 하고 이산화 탄소 농도만 바꾸며 잰 광합성량이에요. 그래프에서 알 수 있는 것을 모두 골라 보세요.",
    figure: factorGraphFig({
      kind: "sat",
      curves: [{}],
      xLabel: "이산화 탄소 농도",
      marks: [{ frac: 0.1, sym: "㉠" }, { frac: 0.55, sym: "㉡" }, { frac: 0.9, sym: "㉢" }],
    }),
    options: [
      "㉠에서 ㉡ 사이에서는 농도가 높아질수록 광합성량이 커져요",
      "㉡에서 ㉢ 사이에서는 광합성량이 거의 일정해요",
      "㉢에서는 광합성이 완전히 멈춰요",
      "농도가 가장 낮을 때 광합성량이 가장 커요",
      "농도를 계속 높이면 광합성량도 끝없이 커져요",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>곡선은 왼쪽에서 가파르게 올라가다가 오른쪽으로 갈수록 누워요. 그래서 ㉠에서 ㉡ 사이는 농도가 높아질수록 광합성량이 <b>커지는</b> 구간이고, ㉡에서 ㉢ 사이는 높이가 거의 그대로인 <b>일정한</b> 구간이에요.<span class='xh'>오답 하나씩 격파</span>㉢에서도 곡선은 높은 자리를 유지하고 있어요. 평평하다는 것은 '더 늘지 않는다'는 뜻이지 '멈췄다'는 뜻이 아니에요. 농도가 가장 낮은 왼쪽 끝은 곡선이 가장 낮은 자리라 광합성량이 가장 작고요. 오른쪽이 평평해졌으므로 끝없이 커진다는 설명도 그래프와 어긋나요. 평평해진 구간은 다른 조건이 광합성량을 붙잡고 있다는 신호랍니다.",
    core: "오르는 구간과 평평한 구간을 나눠 읽기!",
  },
  {
    // [265] d3 TB bogi ⑨ · 조건 조합 비교. 검산: A(강·짙음) 최대, D(약·옅음) 최소.
    // B와 C는 부족한 요인이 서로 달라 크기를 단정할 수 없다 → ㄴ 거짓.
    id: "g2u5e265",
    lessonId: L3,
    type: "mcq",
    diff: 3,
    prompt: "표는 같은 종류의 식물을 네 구역에 나누어 두고 조건을 다르게 한 거예요. 표에 없는 조건은 모두 같아요. 광합성량에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: svgTable(
      ["구역", "빛의 세기", "이산화 탄소"],
      [["A", "강함", "짙음"], ["B", "강함", "옅음"], ["C", "약함", "짙음"], ["D", "약함", "옅음"]],
      { firstColHead: true },
    ),
    bogi: [
      "A 구역의 광합성량이 네 구역 가운데 가장 클 거예요.",
      "B 구역과 C 구역의 광합성량은 반드시 같을 거예요.",
      "D 구역은 두 조건이 모두 부족해 광합성량이 가장 작을 거예요.",
    ],
    options: ["ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ. A는 빛도 강하고 이산화 탄소도 짙어 두 조건이 모두 넉넉해요. 그러니 광합성량이 가장 클 것으로 볼 수 있죠. ㄷ. D는 반대로 두 조건이 모두 부족하니 가장 작을 것으로 볼 수 있어요.<span class='xh'>오답 하나씩 격파</span>ㄴ이 함정이에요. B는 이산화 탄소가 부족하고 C는 빛이 부족한데, <b>어느 쪽이 더 크게 발목을 잡는지는 표만으로 알 수 없어요.</b> 둘 다 '조건 하나가 부족하다'는 점만 같을 뿐이라 광합성량이 반드시 같다고 단정할 수는 없죠. 조건이 두 가지일 때는 '둘 다 넉넉함'과 '둘 다 부족함'만 확실하게 비교할 수 있다는 점을 기억하세요.",
    core: "부족한 조건이 다르면 크기는 단정할 수 없어요!",
  },
  {
    // [272] d3 FC ⑨ · 제한 요인 전환. 검산: 두 곡선은 왼쪽(빛 부족)에서 거의 겹치고
    // 오른쪽(빛 충분)에서 벌어진다 → 빛이 충분해진 뒤에는 이산화 탄소가 제한한다.
    id: "g2u5e272",
    lessonId: L3,
    type: "mcq",
    diff: 3,
    prompt: "그래프는 이산화 탄소 농도를 두 가지로 다르게 해 두고, 각각 빛의 세기를 바꾸며 광합성량을 잰 결과예요. 이 결과에 대한 해석으로 가장 알맞은 것은?",
    figure: factorGraphFig({
      kind: "sat",
      curves: [{ label: "이산화 탄소 짙음", scale: 1 }, { label: "이산화 탄소 옅음", scale: 0.62 }],
      xLabel: "빛의 세기",
    }),
    options: [
      "빛이 충분해진 뒤에는 이산화 탄소 농도가 광합성량을 제한해요",
      "이산화 탄소 농도는 광합성량과 아무 관계가 없어요",
      "빛이 아주 약할 때에도 이산화 탄소 농도에 따라 광합성량이 크게 달라져요",
      "이산화 탄소가 옅어도 빛만 세게 하면 광합성량을 끝없이 늘릴 수 있어요",
      "두 곡선이 가까워지는 곳에서 광합성이 멈춰요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>왼쪽 끝, 즉 빛이 아주 약한 구간에서는 두 곡선이 거의 붙어 있어요. 이때는 빛이 부족한 것이 광합성량을 붙잡고 있기 때문이죠. 오른쪽으로 갈수록 두 곡선이 <b>벌어지며 서로 다른 높이에서 평평</b>해져요. 빛이 넉넉해진 뒤에는 이산화 탄소 농도가 광합성량을 정하고 있다는 뜻이에요.<span class='xh'>오답 하나씩 격파</span>두 곡선의 평평해진 높이가 다르므로 이산화 탄소가 관계없다는 설명은 틀렸어요. 빛이 아주 약한 구간에서는 두 곡선이 거의 겹치니 '크게 달라진다'도 그래프와 어긋나고요. 옅은 조건의 곡선은 낮은 높이에서 평평해지므로 빛만 세게 해서 끝없이 늘릴 수도 없어요. 평평해진 구간에서도 광합성은 계속 일어나고 있어요.",
    core: "지금 가장 부족한 조건이 광합성량을 정해요!",
  },
  {
    // [282] d1 PS ⑩ · 호흡 도해 판독. 검산: 호흡 in = 포도당·산소 / out = 이산화 탄소·물.
    // 산소·이산화 탄소·물은 그림에 인쇄돼 있으므로 ㉠(포도당)만 가린다.
    id: "g2u5e282",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "그림은 식물의 살아 있는 세포에서 일어나는 호흡을 나타낸 거예요. ㉠에 알맞은 물질은 무엇일까요?",
    figure: psExchangeFig({ mode: "resp", hide: ["in1"] }),
    options: ["포도당", "녹말", "엽록소", "무기 양분", "빛에너지"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>호흡은 세포가 양분에 저장된 에너지를 꺼내 쓰는 과정이에요. 이때 산소와 함께 쓰이는 양분이 바로 <b>포도당</b>이죠. 그림에서 산소가 이미 적혀 있으니 ㉠은 남은 재료인 포도당이에요.<span class='xh'>오답 하나씩 격파</span>녹말은 포도당이 잎에 저장된 형태라 그대로 호흡에 들어가지 않아요. 엽록소는 광합성이 일어나게 돕는 색소이지 호흡의 재료가 아니고요. 무기 양분은 뿌리가 흙에서 흡수하는 물질로, 식물의 몸을 만드는 데 필요하지만 호흡에서 산소와 짝을 이루는 재료는 아니에요. 빛에너지는 광합성에 필요한 조건이지 호흡의 재료가 아니에요. 호흡에는 빛이 필요 없다는 점도 함께 기억하세요.",
    core: "호흡의 재료는 포도당과 산소!",
  },
  {
    // [285] d2 dbox ⑥ · 호흡열. 검산: 싹튼 씨앗의 호흡으로 양분의 에너지 일부가 열로 나온다.
    // 288(발아 콩 사진)과 데이터 세트를 분리하려고 대조 장치를 두지 않은 단일 장치로 서술했다.
    id: "g2u5e285",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "다음 장치의 결과를 가장 잘 설명한 것은?",
    figure: dbox([
      ["장치", "막 싹이 튼 씨앗을 보온병에 가득 채우고 온도계를 꽂은 뒤 마개를 막아 서늘한 곳에 두었어요."],
      ["결과", "하루 뒤 병 안의 온도가 바깥 공기보다 눈에 띄게 높아졌어요."],
    ]),
    options: [
      "씨앗이 호흡하면서 양분에 저장돼 있던 에너지의 일부가 열로 나왔어요",
      "씨앗이 광합성을 활발히 해서 열이 생겼어요",
      "보온병 마개가 열려 바깥의 따뜻한 공기가 들어왔어요",
      "씨앗이 물을 빨아들여 부풀면서 병 속 공기를 눌러 데웠어요",
      "씨앗에 남아 있던 햇빛이 밤사이 조금씩 새어 나왔어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>싹이 트는 씨앗은 자라기 위해 저장된 양분을 활발히 쓰고 있어요. 이때 일어나는 것이 <b>호흡</b>이고, 양분에 저장돼 있던 에너지 가운데 일부가 열로 나오면서 병 안의 온도가 올라간 거예요.<span class='xh'>오답 하나씩 격파</span>보온병은 마개로 막혀 있고 씨앗에는 잎도 빛도 없으니 광합성은 일어날 수 없어요. 마개가 열렸다면 서늘한 곳의 공기가 들어와 오히려 온도가 내려갔겠죠. 씨앗이 부풀어 공기를 누른다 해도 하루 내내 온도가 높게 유지되지는 않아요. 그런 눌림은 잠깐이니까요. 빛이 씨앗에 저장됐다가 새어 나온다는 설명은 빛을 물질처럼 오해한 것이고요. 살아 있는 씨앗이 <b>스스로</b> 열을 냈다는 점이 이 장치의 핵심이에요.",
    core: "호흡하면 에너지의 일부가 열로 나와요!",
  },
  {
    // [288] d1 사진 sprouting-seeds ⑥ · 대조군의 역할. 검산: 삶은 콩은 살아 있지 않아 호흡하지 않는다.
    // 285(보온병 온도)와 축이 다르다(285 = 결과의 까닭 · 288 = 대조 장치를 두는 목적).
    id: "g2u5e288",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "사진은 콩을 담아 나란히 둔 똑같은 병 두 개예요. <b>오른쪽 병</b>의 콩은 미리 삶아서 식힌 것이에요. 이렇게 삶은 콩을 함께 두는 까닭으로 가장 알맞은 것은?",
    figure: ximg("sprouting-seeds.webp", "똑같은 유리병 두 개가 나란히 놓인 사진. 왼쪽 병의 콩에는 흰 싹이 돋아 있고, 오른쪽 병의 콩은 매끈하게 부풀어 있어요."),
    options: [
      "살아 있지 않은 씨앗과 비교해, 나타난 변화가 살아 있는 씨앗 때문임을 확인하려고",
      "삶은 콩이 싹 튼 콩보다 호흡을 더 활발히 하는지 확인하려고",
      "두 병의 콩이 서로 다른 종류인지 확인하려고",
      "삶은 콩에서 광합성이 일어나는지 확인하려고",
      "두 병의 콩을 합쳐 전체 무게를 재려고",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진에서 왼쪽 병의 콩에는 흰 싹이 돋아 있고 오른쪽 병의 콩은 매끈해요. 삶은 콩은 <b>더 이상 살아 있지 않아</b> 호흡을 하지 않죠. 두 병을 나란히 두면 '싹 튼 콩 쪽에서만 변화가 나타났다'는 것을 확인할 수 있어, 그 변화가 살아 있는 씨앗 때문이라고 말할 근거가 생겨요. 비교의 기준이 되는 이런 장치가 실험을 단단하게 만들어요.<span class='xh'>오답 하나씩 격파</span>삶은 콩은 살아 있지 않으니 호흡을 더 활발히 할 수 없어요. 두 병에는 같은 콩을 넣으므로 종류를 확인하려는 것도 아니고요. 병 속에는 빛을 받을 잎이 없으니 광합성을 확인하려는 장치도 아니에요. 무게를 재려는 것이라면 두 병을 굳이 다르게 처리할 까닭이 없죠.",
    core: "비교 기준이 있어야 원인을 말할 수 있어요!",
  },
  {
    // [290] d1 TB ⑩ · 호흡 정리표 빈칸. 검산: 호흡 재료 = 포도당·산소.
    // 초판은 '필요한 물질' 칸에 포도당·산소를, '일어나는 곳' 칸에 살아 있는 세포를 인쇄해
    // 282(㉠ = 포도당)와 292(ㄴ·ㄷ)의 정답을 통째로 노출했다(검산 B 적발) → 빈칸을 재료 쪽으로
    // 옮기고 '일어나는 곳' 행을 삭제해 양방향 유출을 끊었다.
    id: "g2u5e290",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "표는 식물의 호흡을 정리한 거예요. ㉠에 들어갈 물질로 알맞은 것은?",
    figure: svgTable(
      ["구분", "호흡"],
      [["필요한 물질", "㉠"], ["생기는 물질", "이산화 탄소, 물"]],
      { firstColHead: true },
    ),
    options: ["포도당, 산소", "이산화 탄소, 물", "녹말, 설탕", "물, 빛에너지", "무기 양분, 엽록소"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>호흡은 <b>포도당과 산소</b>를 이용해 이산화 탄소와 물을 만들면서, 포도당에 저장돼 있던 에너지를 생명활동에 쓸 수 있게 꺼내는 과정이에요. 표의 아래 칸에 생기는 물질이 적혀 있으니 ㉠은 필요한 물질이 들어갈 자리예요.<span class='xh'>오답 하나씩 격파</span>'이산화 탄소, 물'은 바로 아래 칸에 적힌 생성물이라 같은 것이 두 번 들어갈 수 없어요. 녹말과 설탕은 잎에서 만든 양분이 저장되거나 이동할 때 바뀌는 형태이지 호흡에 곧바로 들어가는 재료가 아니에요. 빛에너지는 광합성에 필요한 조건이라 호흡의 재료 칸에 넣을 수 없고요. 무기 양분과 엽록소도 호흡에서 소모되는 물질이 아니에요. 표 문제는 <b>이미 적힌 칸</b>을 단서로 삼아 빈칸의 역할부터 정하세요.",
    core: "호흡에 필요한 건 포도당과 산소!",
  },
  {
    // [292] d3 무⑤ bogi ⑳ · 오개념 격파. 검산: 호흡은 낮·밤 모두 · 살아 있는 모든 세포에서 일어난다
    // (엽록체가 있는 세포로 한정되는 것은 광합성).
    id: "g2u5e292",
    lessonId: L4,
    type: "mcq",
    diff: 3,
    prompt: "식물의 호흡에 대한 설명으로 옳은 것을 모두 고른 것은?",
    bogi: [
      "식물의 호흡은 빛이 없는 밤에만 일어나요.",
      "빛이 전혀 닿지 않는 땅속 덩이줄기의 세포에서도 호흡이 일어나요.",
      "호흡은 엽록체가 들어 있는 세포에서만 일어나요.",
    ],
    options: ["ㄱ", "ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ. 호흡은 <b>살아 있는 세포라면 어디서든</b> 일어나요. 땅속 덩이줄기처럼 빛이 전혀 닿지 않는 곳의 세포도 살아 있으니 계속 호흡하죠.<span class='xh'>오답 하나씩 격파</span>ㄱ은 이 단원에서 가장 흔한 오해예요. 호흡에는 빛이 필요하지 않으므로 낮에도 밤에도 <b>쉬지 않고</b> 일어나요. 낮에 산소가 밖으로 나오는 것처럼 보이는 것은 광합성이 더 활발하기 때문이지 호흡이 멈춰서가 아니에요. ㄷ은 광합성의 조건을 호흡에 잘못 옮겨 붙인 설명이에요. 엽록체가 있어야 하는 쪽은 광합성이고, 호흡은 엽록체가 없는 세포에서도 일어나요. 두 과정의 조건을 섞지 않도록 조심하세요.",
    core: "호흡은 낮에도 밤에도, 살아 있는 모든 세포에서!",
  },
  {
    // [294] multi d2 PS ⑪ · 호흡 에너지의 쓰임(정답 3개). 그림은 materials:false로 물질 칩을 지워
    // 282(㉠ = 포도당)의 정답을 인쇄하지 않는다. 검산: 광합성은 빛에너지를 저장, 호흡은 방출.
    id: "g2u5e294",
    lessonId: L4,
    type: "multi",
    diff: 2,
    prompt: "그림은 식물 세포에서 일어나는 호흡을 나타낸 거예요. 물질 이름은 모두 가려져 있고, <b>위쪽 화살표</b>만 방향이 드러나 있어요. 이 화살표가 나타내는 것이 실제로 쓰이는 예를 모두 골라 보세요.",
    figure: psExchangeFig({ mode: "resp", hide: ["in1", "in2", "out1", "out2"] }),
    options: [
      "뿌리 끝에서 새 세포를 만들어 뿌리를 뻗는 일",
      "뿌리가 흙 속의 무기 양분을 세포 안으로 끌어들이는 일",
      "겨울눈이 부풀어 새 가지로 자라는 일",
      "이산화 탄소를 산소로 곧바로 바꾸는 일",
      "빛에너지를 식물이 새로 만들어 내는 일",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>위쪽 화살표는 <b>마이토콘드리아</b>에서 <b>밖으로 나가는 에너지</b>를 나타내요. 호흡으로 꺼낸 이 에너지는 식물이 살아가고 자라는 데 쓰이죠. 뿌리 끝에서 새 세포를 만드는 일, 흙 속의 무기 양분을 세포 안으로 끌어들이는 일, 겨울눈이 부풀어 새 가지로 자라는 일이 모두 에너지가 있어야 가능해요.<span class='xh'>오답 하나씩 격파</span>'이산화 탄소를 산소로 곧바로 바꾸는 일'은 어떤 과정에도 해당하지 않아요. 광합성에서도 이산화 탄소는 포도당의 재료로 쓰일 뿐 산소로 바뀌지 않죠. '빛에너지를 새로 만들어 내는 일'은 방향이 거꾸로예요. 식물은 빛에너지를 <b>받아서</b> 양분에 저장하는 쪽이지 빛을 만들어 내지 않아요.",
    core: "꺼낸 에너지는 자라고 옮기고 싹 틔우는 데!",
  },
  {
    // [308] d1 DN ⑫ · 낮의 겉보기 출입. (가)의 나가는 기체만 ㉠으로 가리고 나머지는 인쇄한다.
    // 검산: 강한 낮에는 광합성량 > 호흡량이라 겉보기로 CO2 흡수·O2 방출.
    id: "g2u5e308",
    lessonId: L5,
    type: "mcq",
    diff: 1,
    prompt: "그림은 같은 화분 식물을 (가) 해가 밝게 뜬 낮과 (나) 빛이 없는 밤에 관찰해 기체의 겉보기 출입을 나타낸 거예요. ㉠에 알맞은 기체는 무엇일까요?",
    figure: dayNightGasFig({
      panels: [
        { light: "bright", inGas: "co2", outGas: "o2", outSym: "㉠", label: "(가)" },
        { light: "none", inGas: "o2", outGas: "co2", label: "(나)" },
      ],
    }),
    options: ["산소", "이산화 탄소", "흙에서 올라온 무기 양분", "잎에 저장된 녹말", "포도당"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)는 빛이 충분한 낮이에요. 이때는 광합성이 호흡보다 활발해서, 두 과정을 합친 결과로 이산화 탄소가 들어가고 <b>산소</b>가 밖으로 나오죠. 들어가는 쪽에 이미 이산화 탄소가 적혀 있으니 나가는 ㉠은 산소예요.<span class='xh'>오답 하나씩 격파</span>이산화 탄소는 같은 칸의 들어가는 쪽에 이미 적혀 있어 같은 방향으로 두 번 쓸 수 없어요. 무기 양분은 뿌리가 흙에서 흡수해 물관을 타고 올라오는 물질이지 잎에서 공기로 나가는 기체가 아니에요. 녹말과 포도당은 잎 안에서 만들어지거나 저장되는 <b>양분</b>이라 기공을 드나들지 않고요. (나) 칸과 견주어 보면 낮과 밤의 방향이 서로 반대라는 점도 확인할 수 있어요.",
    core: "밝은 낮에는 이산화 탄소가 들어가고 산소가 나와요!",
  },
  {
    // [310] d2 GB ⑫ · 막대 쌍 판독. 검산: (가)는 광합성량 > 호흡량 → 겉보기로 CO2 흡수·O2 방출.
    // 312와 데이터 세트를 분리했다(라벨·값 전부 다름).
    id: "g2u5e310",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "그래프는 같은 식물에서 세 때에 잰 광합성량과 호흡량이에요. <b>(가)</b>일 때 식물과 바깥 공기 사이의 기체 출입을 바르게 설명한 것은?",
    figure: rateBarsFig({
      groups: [{ label: "(가)", photo: 9, resp: 4 }, { label: "(나)", photo: 4, resp: 4 }, { label: "(다)", photo: 0, resp: 4 }],
      yLabel: "양",
    }),
    options: [
      "이산화 탄소가 들어가고 산소가 나와요",
      "산소가 들어가고 이산화 탄소가 나와요",
      "기체가 드나들지 않아요",
      "산소만 들어가고 다른 기체는 움직이지 않아요",
      "이산화 탄소만 나오고 산소는 움직이지 않아요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)에서는 광합성량 막대가 호흡량 막대보다 뚜렷하게 높아요. 광합성이 쓰는 이산화 탄소가 호흡이 내놓는 양보다 많고, 광합성이 만드는 산소가 호흡이 쓰는 양보다 많죠. 그래서 두 과정을 합친 결과로 <b>이산화 탄소가 들어가고 산소가 나오는</b> 것처럼 보여요.<span class='xh'>오답 하나씩 격파</span>'산소가 들어가고 이산화 탄소가 나온다'는 호흡량이 더 클 때의 모습이라 (가)와 반대예요. '드나들지 않는다'는 두 막대의 높이가 같을 때의 이야기고요. 한쪽 기체만 움직인다는 설명들은 두 과정이 <b>함께</b> 일어난다는 사실을 놓친 거예요. 어느 한쪽 기체만 오가는 일은 일어나지 않아요.",
    core: "광합성량이 더 크면 산소가 나가는 것처럼 보여요!",
  },
  {
    // [312] d3 GB bogi ⑫ · 세 때 종합 판정. 검산: A(2<6) 호흡 우세 · B(6=6) 겉보기 0 · C(11>6) 광합성 우세.
    // 호흡량 막대가 세 때 모두 있으므로 ㄷ(호흡은 계속된다)도 참.
    id: "g2u5e312",
    lessonId: L5,
    type: "mcq",
    diff: 3,
    prompt: "그래프는 같은 식물에서 하루 중 세 때에 잰 광합성량과 호흡량이에요. 이에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: rateBarsFig({
      groups: [{ label: "A", photo: 2, resp: 6 }, { label: "B", photo: 6, resp: 6 }, { label: "C", photo: 11, resp: 6 }],
      yLabel: "양",
    }),
    bogi: [
      "A일 때는 산소가 안으로 들어가고 이산화 탄소가 밖으로 나가요.",
      "B일 때는 기체의 겉보기 출입이 거의 없어요.",
      "C일 때에도 호흡은 계속되고 있어요.",
    ],
    options: ["ㄱ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ. A는 호흡량 막대가 더 높아요. 호흡이 우세하니 겉보기로는 산소가 들어가고 이산화 탄소가 나가죠. ㄴ. B는 두 막대의 높이가 같아요. 서로 주고받는 양이 맞아떨어져 겉보기 출입이 거의 없어요. ㄷ. C에서도 호흡량 막대는 그대로 서 있어요. 광합성이 훨씬 활발할 뿐 호흡이 멈춘 것이 아니에요.<span class='xh'>오답 하나씩 격파</span>세 설명이 모두 옳으므로 일부만 고른 조합은 전부 답이 될 수 없어요. 특히 C를 보고 '광합성만 한다'고 읽는 실수가 잦은데, 막대 두 개가 함께 그려져 있다는 것 자체가 <b>두 과정이 동시에</b> 일어나고 있다는 표시예요. 겉보기 출입은 두 막대의 <b>차이</b>일 뿐이라는 점을 기준으로 삼으세요.",
    core: "겉보기 출입은 두 막대의 차이 · 호흡은 늘 진행 중!",
  },
  {
    // [313] d1 사진 day-observatory ⑫ · 낮에도 호흡은 계속된다. alt는 관찰 서술만.
    id: "g2u5e313",
    lessonId: L5,
    type: "mcq",
    diff: 1,
    prompt: "사진은 어느 화분 식물을 관찰한 모습이에요. 사진에 찍힌 순간 이 식물에서 일어나는 일에 대한 설명으로 옳은 것은?",
    figure: pimg("figs/day-observatory.webp", "창으로 환한 햇빛이 들어오는 방의 탁자 위에 놓인 화분 식물 사진. 창밖에는 파란 하늘과 나무가 보여요."),
    options: [
      "빛을 받고 있으므로 광합성과 호흡이 함께 일어나고 있어요",
      "빛을 받고 있으므로 광합성만 일어나고 호흡은 잠시 멈춰 있어요",
      "호흡만 일어나고 광합성은 잠시 멈춰 있어요",
      "광합성과 호흡이 모두 멈춰 있어요",
      "광합성과 호흡이 한 번씩 번갈아 가며 일어나요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진의 창으로 환한 햇빛이 들어오고 있으니 이 순간은 <b>빛을 충분히 받는 때</b>예요. 이때 잎에서는 광합성이 활발히 일어나죠. 그렇다고 호흡이 쉬는 것은 아니에요. 호흡은 빛과 상관없이 살아 있는 세포에서 계속되므로 <b>두 과정이 함께</b> 일어나고 있어요.<span class='xh'>오답 하나씩 격파</span>'호흡이 멈춰 있다'는 낮에 산소가 밖으로 나오는 모습만 보고 호흡이 사라졌다고 오해한 설명이에요. '광합성이 멈춰 있다'는 빛이 없을 때의 모습이라 사진과 맞지 않고요. 둘 다 멈춘 상태는 식물이 살아 있는 한 없어요. 번갈아 일어난다는 설명도 사실과 달라요. 두 과정은 <b>동시에</b> 진행되며, 우리가 보는 기체의 출입은 그 둘을 합친 결과예요.",
    core: "낮에는 두 과정이 함께! 보이는 건 합친 결과!",
  },
  {
    // [315] d2 TB bogi ⑬ · 비교표에서 뒤바뀐 행. 검산: 흡수 기체는 광합성 = 이산화 탄소, 호흡 = 산소라
    // 표의 '흡수 기체' 행이 서로 바뀌어 있다. 나머지 두 행은 옳다.
    // 초판은 '일어나는 때' 행을 함께 실어 292 ㄱ·313 정답·316 정답 보기를 통째로 인쇄했다
    // (검산 B 적발 · 이 구간 최대 유출원) → 그 행을 삭제하고 3행으로 줄였다.
    id: "g2u5e315",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "표는 광합성과 호흡을 견주어 정리한 것인데, 한 줄의 내용이 서로 바뀌어 적혀 있어요. 이에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: svgTable(
      ["구분", "광합성", "호흡"],
      [
        ["일어나는 곳", "엽록체", "마이토콘드리아"],
        ["흡수 기체", "산소", "이산화 탄소"],
        ["에너지", "저장", "방출"],
      ],
      { firstColHead: true },
    ),
    bogi: [
      "'일어나는 곳' 줄의 내용이 서로 바뀌어 있어요.",
      "'흡수 기체' 줄의 내용이 서로 바뀌어 있어요.",
      "'에너지' 줄은 바르게 적혀 있어요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ. 광합성은 <b>이산화 탄소</b>를 흡수하고 호흡은 <b>산소</b>를 흡수해요. 표에는 정확히 반대로 적혀 있으니 이 줄이 바뀐 줄이에요. ㄷ. 광합성은 빛에너지를 양분에 저장하고 호흡은 양분의 에너지를 방출하므로 '에너지' 줄은 바르게 적혀 있어요.<span class='xh'>오답 하나씩 격파</span>ㄱ은 표를 잘못 읽은 거예요. 광합성이 일어나는 곳은 엽록체, 호흡이 일어나는 곳은 마이토콘드리아가 맞으니 이 줄은 바뀌지 않았어요. 비교표 문제는 <b>줄마다 한 번씩</b> 옳은지 따져 보는 것이 안전해요. 한 줄만 바뀌어 있어도 표 전체가 틀린 것처럼 보이기 쉽거든요.",
    core: "광합성은 이산화 탄소를, 호흡은 산소를 흡수!",
  },
  {
    // [316] multi d1 DN ⑫ · 밤에 일어나는 일(정답 2개). 그림이 인쇄하는 기체 이름은 보기에서 뺐다.
    // 검산: 밤에는 광합성만 멈추고 호흡은 계속된다.
    id: "g2u5e316",
    lessonId: L5,
    type: "multi",
    diff: 1,
    prompt: "그림은 빛이 없는 밤에 관찰한 식물이에요. 이때 식물에서 일어나는 일을 모두 골라 보세요.",
    figure: dayNightGasFig({
      panels: [{ light: "none", inGas: "o2", outGas: "co2", label: "빛이 없는 밤" }],
    }),
    options: [
      "살아 있는 세포에서 호흡이 계속돼요",
      "엽록체는 재료가 있어도 양분 만들기를 시작하지 못해요",
      "잎 세포의 마이토콘드리아도 함께 멈춰요",
      "엽록체가 사라졌다가 아침에 다시 생겨요",
      "저장된 에너지가 아무 과정 없이 조금씩 새어 나가요",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>밤에는 빛이 없으므로 엽록체는 재료가 갖춰져 있어도 <b>양분 만들기를 시작하지 못해요</b>. 반면 호흡에는 빛이 필요하지 않으니 살아 있는 세포에서 <b>계속</b> 일어나죠. 그래서 밤의 식물은 호흡만 하는 상태가 돼요.<span class='xh'>오답 하나씩 격파</span>마이토콘드리아까지 멈춘다면 식물은 에너지를 얻지 못해 살아갈 수 없어요. '엽록체가 사라졌다가 다시 생긴다'는 근거 없는 설명이고요. 엽록체는 낮이든 밤이든 세포 안에 그대로 있어요. '아무 과정 없이 새어 나간다'도 틀렸어요. 에너지는 저절로 흘러나오는 것이 아니라 호흡이라는 <b>과정을 통해</b> 꺼내 쓰는 것이니까요.",
    core: "밤에 멈추는 건 광합성뿐!",
  },
  {
    // [317] d2 SP ⑫ · 하루 곡선의 바닥. 검산: CO2가 더 줄지 않는 지점 = 광합성량과 호흡량이 비슷해진 때.
    // 247(2곡선 up/down)과 데이터 세트·모양이 다르다.
    id: "g2u5e317",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "밀폐한 유리 상자에 화분 식물을 넣고 하루 동안 이산화 탄소 농도를 재었어요. 곡선이 가장 낮아지는 <b>㉡ 무렵</b>에 식물에 일어난 일로 가장 알맞은 것은?",
    figure: gasSensorFig({
      series: [{ name: "이산화 탄소", shape: "down-up" }],
      changeAt: 0.5,
      marks: [{ frac: 0.25, sym: "㉠" }, { frac: 0.5, sym: "㉡" }, { frac: 0.78, sym: "㉢" }],
      xLabel: "시각",
      yLabel: "이산화 탄소 농도",
    }),
    options: [
      "빛이 약해지면서 광합성량이 호흡량과 비슷해졌어요",
      "식물의 호흡이 완전히 멈추었어요",
      "식물의 광합성이 하루 중 가장 활발해졌어요",
      "상자 안의 공기가 모두 빠져나갔어요",
      "식물이 이산화 탄소를 만들어 내기를 멈추었어요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>곡선이 내려가는 동안은 광합성이 쓰는 이산화 탄소가 호흡이 내놓는 양보다 많다는 뜻이에요. ㉡에서 곡선이 더 내려가지 않고 방향을 바꾼다는 것은 두 양이 <b>비슷해졌다</b>는 신호죠. 해가 기울어 빛이 약해지면 이런 일이 일어나요.<span class='xh'>오답 하나씩 격파</span>호흡이 멈춘 상태라면 이후 곡선이 다시 올라갈 까닭이 없어요. 광합성이 가장 활발한 때는 곡선이 <b>가장 가파르게 내려가는</b> 구간이지 바닥이 아니에요. 상자는 밀폐되어 있으니 공기가 빠져나갈 수 없고요. 식물은 살아 있는 한 호흡으로 이산화 탄소를 계속 내놓아요. 곡선의 바닥은 '아무 일도 없는 때'가 아니라 <b>두 과정의 크기가 맞아떨어진 때</b>랍니다.",
    core: "곡선이 방향을 바꾸는 곳 = 두 양이 같아진 때!",
  },
  {
    // [335] d1 TR ⑮ · 물관이 나르는 물질. 검산: 물관 = 뿌리 → 잎, 물과 무기 양분(한 방향).
    // 344와 데이터 세트를 분리하려고 344에서는 물관을 그리지 않는다.
    id: "g2u5e335",
    lessonId: L6,
    type: "mcq",
    diff: 1,
    prompt: "그림은 식물에서 물질이 이동하는 길을 화살표로 나타낸 거예요. <b>㉠</b>을 따라 이동하는 물질로 가장 알맞은 것은?",
    figure: transportRouteFig({
      routes: ["xylem", "phloem-up", "phloem-down", "phloem-fruit"],
      syms: [{ route: "xylem", sym: "㉠" }, { route: "phloem-down", sym: "㉡" }],
    }),
    options: [
      "뿌리에서 흡수한 물과 무기 양분",
      "잎에서 만들어 다른 기관으로 보내는 양분",
      "잎에 저장된 녹말 알갱이",
      "공기에서 들어온 이산화 탄소",
      "광합성으로 생긴 산소",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>㉠은 뿌리 쪽에서 시작해 잎 쪽으로 <b>위로만</b> 향하는 화살표예요. 이 길이 물관이고, 뿌리가 흙에서 흡수한 <b>물과 무기 양분</b>이 여기를 따라 줄기를 지나 잎까지 올라가요.<span class='xh'>오답 하나씩 격파</span>잎에서 만들어 다른 기관으로 보내는 양분이 지나는 길은 체관이라 화살표의 출발점이 잎 쪽이에요. 녹말은 물에 잘 녹지 않아 관 속을 알갱이째 이동하지 않아요. 이산화 탄소는 잎의 기공으로 드나드는 기체라 뿌리에서 올라오지 않고요. 산소도 광합성으로 잎에서 생긴 기체라 방향이 맞지 않아요. 화살표 문제는 <b>출발점이 어디인지</b>부터 확인하세요.",
    core: "아래에서 위로만 = 물관 · 물과 무기 양분!",
  },
  {
    // [337] d1 IF ⑭ · 전환 사슬 빈칸. 검산: 포도당 → 녹말(임시 저장) → 설탕(주로 밤) → 체관 이동.
    // 레슨 order(5단계 전체 배열)와 달리 한 칸만 묻는다.
    id: "g2u5e337",
    lessonId: L6,
    type: "mcq",
    diff: 1,
    prompt: "그림은 잎에서 만든 양분이 다른 기관으로 옮겨 가기까지의 과정이에요. ㉠에 들어갈 내용으로 알맞은 것은?",
    figure: inquiryFlowFig({
      steps: ["잎에서 포도당", "녹말로 저장", "설탕으로 바뀜", "체관으로 이동"],
      blank: 2,
    }),
    options: [
      "물에 잘 녹는 설탕으로 바뀜",
      "물에 잘 녹지 않는 녹말로 다시 바뀜",
      "이산화 탄소로 분해됨",
      "빛에너지로 바뀜",
      "무기 양분으로 바뀜",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>잎은 낮에 만든 포도당의 일부를 물에 잘 녹지 않는 녹말로 바꾸어 잠시 저장해요. 이 양분을 다른 기관으로 보내려면 관 속의 액체에 실려야 하므로, 주로 밤에 <b>물에 잘 녹는 설탕</b>으로 바꾼 뒤 체관으로 들여보내죠.<span class='xh'>오답 하나씩 격파</span>바로 앞 칸에서 이미 녹말로 저장했으니 다시 녹말로 바꾸면 이동에 아무 도움이 되지 않아요. 이산화 탄소로 분해된다면 애써 만든 양분이 사라지는 셈이라 뒤 칸의 '이동'과 이어지지 않고요. 양분이 빛에너지로 바뀌는 일은 일어나지 않아요. 무기 양분은 뿌리가 흙에서 흡수하는 물질이라 잎에서 만들어지지 않아요.",
    core: "옮기려면 물에 잘 녹는 설탕으로!",
  },
  {
    // [341] d1 사진 storage-foods ⑯ · 저장 '부위' 분류. 레슨 binSort·mcq의 '성분 연결' 축과 분리했다.
    // 검산: 고구마 = 뿌리 · 사탕수수 = 줄기 · 포도 = 열매 · 콩과 참깨 = 씨.
    id: "g2u5e341",
    lessonId: L6,
    type: "mcq",
    diff: 1,
    prompt: "사진은 식물이 양분을 저장해 둔 여러 부분이에요. 이 가운데 <b>뿌리</b>에 양분을 저장한 것은 무엇일까요?",
    figure: pimg("figs/storage-foods.webp", "밝은 바탕에 다섯 가지가 나란히 놓인 사진. 보랏빛 알이 송송 달린 송이, 마디가 있는 굵은 대 토막, 붉은 껍질의 길쭉한 덩이 두 개, 깍지에 든 둥근 알갱이, 아주 작고 납작한 낟알이 보여요."),
    options: ["고구마", "포도", "사탕수수", "콩", "참깨"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>고구마는 뿌리의 일부가 굵게 부풀어 양분을 저장한 것이에요. 잎에서 만들어 체관으로 내려보낸 양분이 <b>뿌리</b>에 쌓여 우리가 먹는 부분이 되었죠.<span class='xh'>오답 하나씩 격파</span>포도는 꽃이 진 자리에 생기는 <b>열매</b>에 양분을 저장한 예예요. 사탕수수는 굵고 곧은 <b>줄기</b>에 단맛이 나는 양분을 모아 두고요. 콩과 참깨는 둘 다 <b>씨</b>에 양분을 저장해 싹이 틀 때 쓸 밑천으로 삼아요. 같은 사진이라도 '무엇이 많이 들어 있는가'와 '어느 부분에 저장했는가'는 서로 다른 질문이니, 문두가 무엇을 묻는지 먼저 확인하세요.",
    core: "고구마는 뿌리, 사탕수수는 줄기, 포도는 열매, 콩·참깨는 씨!",
  },
  {
    // [344] multi d2 TR ⑮ · 체관 이동의 방향(정답 3개). 335의 정답(물관 물질)을 인쇄하지 않도록
    // 물관 화살표는 그리지 않았다. 검산: 체관은 양분이 필요한 기관을 향해 위·아래로 모두 이동.
    id: "g2u5e344",
    lessonId: L6,
    type: "multi",
    diff: 2,
    prompt: "그림은 잎에서 만든 양분이 이동하는 길을 화살표로 나타낸 거예요. 이 그림에서 알 수 있는 것을 모두 골라 보세요.",
    figure: transportRouteFig({ routes: ["phloem-up", "phloem-down", "phloem-fruit"] }),
    options: [
      "잎에서 만든 양분이 위쪽 어린 부분으로도 이동해요",
      "잎에서 만든 양분이 아래쪽 뿌리 쪽으로도 이동해요",
      "잎에서 만든 양분이 열매 쪽으로도 이동해요",
      "이 화살표를 지나는 것은 뿌리가 흙에서 흡수한 물이에요",
      "잎에서 만든 양분은 만들어진 잎 안에만 머물러요",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>그림의 화살표는 모두 <b>잎에서 출발</b>해 세 방향으로 뻗어 있어요. 위쪽의 어린 부분으로, 아래쪽의 뿌리로, 그리고 옆의 열매로 각각 향하죠. 출발점이 잎이고 도착점이 저마다 다르다는 점이 이 그림이 보여 주는 전부예요.<span class='xh'>오답 하나씩 격파</span>'뿌리가 흡수한 물'은 출발점이 반대예요. 물이 지나는 길인 <b>물관</b>이라면 화살표가 뿌리에서 시작해야 하는데, 그림의 화살표는 모두 잎에서 뻗어 나가는 <b>체관</b>이에요. 양분이 잎 안에만 머문다면 열매도 뿌리도 자랄 수 없고, 화살표를 그릴 까닭도 없겠죠. 이동을 읽을 때는 <b>출발점과 도착점</b>을 먼저 짚어 보세요.",
    core: "출발점은 잎, 도착점은 양분이 필요한 기관!",
  },
  {
    // [346] d3 dbox bogi ⑰ · 껍질 고리 벗기기. 검산: 체관은 껍질 안쪽에 있어 끊기고,
    // 물관은 더 안쪽이라 남는다 → 위쪽에 양분이 쌓여 부풀고 뿌리는 양분을 받지 못한다.
    id: "g2u5e346",
    lessonId: L6,
    type: "mcq",
    diff: 3,
    prompt: "다음 관찰에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: dbox([
      ["관찰", "잘 자라는 나무의 줄기 한 곳에서 껍질만 고리 모양으로 빙 둘러 벗겨 내고 몇 주 동안 두었어요."],
      ["결과", "벗겨 낸 자리의 바로 위쪽이 볼록하게 부풀었고, 잎은 한동안 시들지 않았어요."],
    ]),
    bogi: [
      "껍질 안쪽의 체관이 끊겨 위에서 오던 양분이 그 자리에 쌓였어요.",
      "줄기의 더 안쪽을 지나는 길까지 함께 끊겨 잎이 곧바로 시들었어요.",
      "시간이 더 지나면 뿌리로 가는 양분이 줄어 뿌리가 약해질 수 있어요.",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ. 잎에서 만든 양분이 지나는 체관은 줄기 껍질 안쪽에 있어요. 껍질을 고리처럼 벗기면 이 길이 끊겨 위에서 오던 양분이 잘린 자리 <b>위쪽에 쌓이면서</b> 볼록해지죠. ㄷ. 양분을 계속 받지 못하면 뿌리는 점점 약해져요.<span class='xh'>오답 하나씩 격파</span>ㄴ이 함정이에요. 줄기의 <b>더 안쪽</b>을 지나는 길은 껍질만 벗겨서는 끊기지 않아요. 그래서 잎은 한동안 시들지 않죠. 결과에 적힌 '잎은 한동안 시들지 않았다'가 바로 그 증거예요. 관찰 결과에 적힌 문장을 하나씩 근거로 삼아 따져 보면 이런 함정을 피할 수 있어요.",
    core: "껍질 안쪽은 체관, 그보다 안쪽이 물관!",
  },
  {
    // [352] d2 TB bogi ⑯ · 저장 기관·형태 판정. 검산: 감자 = 줄기·녹말 / 땅콩 = 씨·지방 / 양파 = 잎·당.
    // 레슨 binSort의 5종 세트(고구마·포도·사탕수수·콩·깨)와 소재를 전면 교체했다.
    id: "g2u5e352",
    lessonId: L6,
    type: "mcq",
    diff: 2,
    prompt: "표는 세 식물이 양분을 저장하는 방식을 정리한 거예요. 이에 대한 설명으로 옳은 것을 모두 고른 것은?",
    figure: svgTable(
      ["식물", "저장 기관", "많이 든 양분"],
      [["감자", "줄기", "녹말"], ["땅콩", "씨", "지방"], ["양파", "비늘잎", "당"]],
      { firstColHead: true },
    ),
    bogi: [
      "감자는 뿌리에 양분을 저장하는 예예요.",
      "세 식물은 모두 같은 형태로 양분을 저장해요.",
      "잎에서 만든 양분이 여러 기관으로 옮겨져 저장된 예들이에요.",
    ],
    options: ["ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄷ. 세 식물 모두 <b>양분을 만든 잎이 아닌 다른 곳</b>에 양분을 쌓아 두었어요. 양파에서 먹는 부분은 땅속줄기에 겹겹이 붙은 비늘잎이라 광합성을 하는 잎과는 달라요. 잎에서 만든 양분이 체관을 따라 옮겨 간 뒤 그곳에 쌓인 것이므로 <b>이동해 저장된</b> 예들이 맞아요.<span class='xh'>오답 하나씩 격파</span>ㄱ은 표와 정면으로 어긋나요. 표에는 감자의 저장 기관이 <b>줄기</b>라고 분명히 적혀 있어요. ㄴ도 표를 보면 바로 가려낼 수 있어요. 녹말·지방·당으로 저장 형태가 <b>저마다 다르니까요.</b> 표가 함께 주어진 문제는 보기의 내용을 표의 칸과 하나씩 맞대어 보면 대부분 판정할 수 있어요. 표에 없는 내용을 스스로 지어내지 않는 것이 요령이에요.",
    core: "저장 기관도 저장 형태도 식물마다 달라요!",
  },
];
