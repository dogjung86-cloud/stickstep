// g2u6 v2 파일럿 40문항 스테이징 · 중2 과학 Ⅵ 동물과 에너지 (신규 출제 · 시리즈 15호)
// 정본 설계표 qa/g2u6-v2-blueprint.md(실측·회피표·쿼터·헬퍼 명세). 이식은 qa/build-g2u6v2-lessons.mjs.
// 규격: mcq 144/multi 16/num 0/word 0 · diff 64/64/32 · 시각 116/160(72.5%) · bogi 28 · 합답 44.
// 실측 근거: 3사 40 응답 단위 · 계산 0 · 개수 세기 0 · 그래프 0 · 기호 판독 50% · 시각 부착 85%.
// 신작 헬퍼 24종은 여기서 로컬 저작하고 이식 때 examFigures "g2u6 v2" 섹션으로 승격한다.
// 표기 표준(3사 대조 확정): 아밀레이스·펩신·트립신·라이페이스 · 지방산+모노글리세라이드 ·
// 숨관/숨관가지 · 허파/허파꽈리 · 토리/보먼주머니/세뇨관 · 콩팥 · 쓸개즙 · 바이타민 · 온몸순환/허파순환.
// 가슴 속 공간은 '가슴우리'로 통일하고, 기관 이름은 '허파'(혈관만 폐동맥·폐정맥)로 쓴다.
// ⚠ 이 파일의 주석에도 금지어 리터럴을 쓰지 않는다(check가 소스 전체를 스캔한다 · 검산 A 3-10).
import type { ExamItem } from "../src/content/exams/types";
import { svgTable, dbox } from "../src/ui/examFigures";

const IMG_BASE = "";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/g2u6/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 한글 줄바꿈(공백 단위) · 라벨·상자 문구 공용. */
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

/** 받침 판정 조사 · aria 낭독이 어색해지지 않게(검산 A 3-6). 괄호·기호는 안쪽 글자로 판정한다. */
const josa = (w: string, pair: string): string => {
  const [a, b] = pair.split("/");
  const m = w.replace(/[()㉠-㉣]/g, "").trim();
  // 기호만으로 된 라벨(㉠~㉣)은 지우고 나면 빈 문자열이 된다 · 우리말 관례는 "㉠은"이라 받침 있는 쪽.
  if (!m) return a;
  const c = m.charCodeAt(m.length - 1);
  if (Number.isNaN(c)) return b;
  // A~E·숫자 등 한글이 아닌 라벨은 읽을 때 모음으로 끝나므로 받침 없는 쪽(는·를)을 쓴다.
  if (c < 0xac00 || c > 0xd7a3) return b;
  return (c - 0xac00) % 28 ? a : b;
};

/** 기호 배지(원 안 기호) · 전 헬퍼 공용. 흰 원 + 파란 테로 어떤 바탕 위에서도 읽힌다. */
const mark = (x: number, y: number, t: string, r = 12.5): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.8"/>
   <text x="${x}" y="${y + 4.4}" text-anchor="middle" font-size="${r > 11 ? 12.5 : 11}" font-weight="800" fill="#1B64DA">${t}</text>`;

/** 어두운 면 위 흰 라벨 · 할로는 그 면의 최암색으로(흰 할로는 글자를 지운다 · bodyFigures 계보). */
const T = (x: number, y: number, t: string, o?: { size?: number; anchor?: string; fill?: string; halo?: string; weight?: number }): string => {
  const s = o?.size ?? 12;
  const a = o?.anchor ?? "middle";
  const f = o?.fill ?? "#333D4B";
  const w = o?.weight ?? 700;
  const halo = o?.halo ? `stroke="${o.halo}" stroke-width="3" paint-order="stroke"` : "";
  return `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" font-weight="${w}" fill="${f}" ${halo}>${t}</text>`;
};

// ══════════════════ 발주 라스터 하이브리드 ══════════════════
// SCI_GUIDE g2u6 하이브리드 방침: **발주 라스터 위에 한글 기호·지시선은 SVG/DOM으로 얹는다.**
// 라스터에는 글자가 하나도 없으므로, 같은 라스터라도 기호 세트·가림 대상·질문 축을 바꾸면
// 자료셋이 갈린다(레슨은 `bodyLabeled`로 이름 라벨을 얹으므로 시험은 기호만 얹어 verbatim을 피한다).
// 좌표는 %(그림 기준)다 · 반드시 스크린샷으로 눈으로 맞춘다(CLAUDE.md 세포도 좌표 관행).
type Pin = { x: number; y: number; t: string; lx?: number; ly?: number };
export const rasterFig = (
  file: string,
  alt: string,
  pins: Pin[],
  o?: { base?: string; caption?: string },
): string => {
  const base = o?.base ?? "body/figs";
  const lines = pins
    .filter((p) => p.lx !== undefined && p.ly !== undefined)
    .map((p) => `<line x1="${p.x}" y1="${p.y}" x2="${p.lx}" y2="${p.ly}" stroke="#8B95A1" stroke-width="1" vector-effect="non-scaling-stroke"/>`)
    .join("");
  const badges = pins
    .map(
      (p) =>
        `<span style="position:absolute;left:${p.lx ?? p.x}%;top:${p.ly ?? p.y}%;transform:translate(-50%,-50%);width:27px;height:27px;border-radius:999px;background:#fff;border:1.9px solid #3182F6;color:#1B64DA;font-size:12.5px;font-weight:800;line-height:23px;text-align:center;box-shadow:0 1px 4px rgba(10,20,40,.2)">${p.t}</span>`,
    )
    .join("");
  return `<div style="position:relative;border-radius:14px;overflow:hidden;background:#FBFCFD;border:1px solid #DCE0E6">
    <img src="${IMG_BASE}${base}/${file}" alt="${alt}" style="display:block;width:100%"/>
    ${lines ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${lines}</svg>` : ""}
    ${badges}
    ${o?.caption ? `<div style="position:absolute;left:0;right:0;bottom:0;padding:5px 8px;background:rgba(251,252,253,.92);font-size:10.8px;font-weight:700;color:#6B7684;text-align:center">${o.caption}</div>` : ""}
  </div>`;
};

/** 라스터 두 장을 (가)(나)로 나란히 · 들숨·날숨처럼 한 쌍이 곧 자료인 문항용. */
export const rasterPair = (
  a: { file: string; label: string },
  b: { file: string; label: string },
  alt: string,
  base = "body/figs/v2",
): string =>
  `<div style="display:flex;gap:8px" role="img" aria-label="${alt}">
    ${[a, b]
      .map(
        (c) => `<div style="flex:1;border:1px solid #DCE0E6;border-radius:12px;overflow:hidden;background:#FBFCFD">
        <img src="${IMG_BASE}${base}/${c.file}" alt="" style="display:block;width:100%"/>
        <div style="padding:5px 0 7px;text-align:center;font-size:13px;font-weight:900;color:#191F28">${c.label}</div>
      </div>`,
      )
      .join("")}
  </div>`;

/** 라스터 위에 물질 이동 화살표를 얹는다(콩팥단위 세 과정 등). %좌표 · 화살촉 자동. */
export const rasterArrows = (
  file: string,
  alt: string,
  arrows: { x1: number; y1: number; x2: number; y2: number; c: string; t?: string; tx?: number; ty?: number }[],
  base = "body/figs/v2",
): string => {
  const body = arrows
    .map((a) => {
      const dx = a.x2 - a.x1;
      const dy = a.y2 - a.y1;
      const L = Math.hypot(dx, dy) || 1;
      const ux = dx / L;
      const uy = dy / L;
      return `<path d="M${a.x1} ${a.y1} L${a.x2} ${a.y2} M${a.x2} ${a.y2} l${(-ux * 4 - uy * 2.4).toFixed(2)} ${(-uy * 4 + ux * 2.4).toFixed(2)} M${a.x2} ${a.y2} l${(-ux * 4 + uy * 2.4).toFixed(2)} ${(-uy * 4 - ux * 2.4).toFixed(2)}" fill="none" stroke="${a.c}" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    })
    .join("");
  const badges = arrows
    .filter((a) => a.t)
    .map(
      (a) =>
        `<span style="position:absolute;left:${a.tx ?? (a.x1 + a.x2) / 2}%;top:${a.ty ?? (a.y1 + a.y2) / 2 + 9}%;transform:translate(-50%,-50%);width:27px;height:27px;border-radius:999px;background:#fff;border:1.9px solid ${a.c};color:${a.c};font-size:12.5px;font-weight:800;line-height:23px;text-align:center;box-shadow:0 1px 4px rgba(10,20,40,.2)">${a.t}</span>`,
    )
    .join("");
  return `<div style="position:relative;border-radius:14px;overflow:hidden;background:#FBFCFD;border:1px solid #DCE0E6">
    <img src="${IMG_BASE}${base}/${file}" alt="${alt}" style="display:block;width:100%"/>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${body}</svg>
    ${badges}
  </div>`;
};

// ══════════════════ L1 영양소 ══════════════════

/** NT 검출 반응 시험관 열(파라미터형).
 *  tubes[].tint = 관찰된 용액 색 키 · heated = 가열 표시(중탕 물 표시) · reagent 라벨은 선택.
 *  aria는 파라미터 파생이며 **관찰 서술까지만** 한다(어느 영양소인지는 낭독하지 않는다). */
const TINT: Record<string, [string, string]> = {
  none: ["#DDE3EA", "변화 없음"],
  blue: ["#8FB3E8", "푸른색"],
  navy: ["#2C3E8F", "청람색"],
  purple: ["#9B59B6", "보라색"],
  orange: ["#E8833A", "황적색"],
  red: ["#E8455F", "선홍색"],
};
export function bodyTestTubesFig(o: { tubes: { label: string; tint: string; reagent?: string; heated?: boolean }[]; hideTint?: number }): string {
  const n = o.tubes.length;
  const W = 344;
  const gap = n <= 3 ? 96 : n === 4 ? 78 : 64;
  const x0 = (W - gap * n) / 2 + gap / 2;
  // 시약 설명은 한 줄에 들어갈 글자 수를 **칸 폭에서** 뽑고, 그러고도 넘치면 글자 크기를 줄인다.
  // 상수 나눗셈(gap/5.6)으로 줄바꿈만 하면 한글 한 글자가 10.5px라 4관에서 옆 칸을 침범한다(갤러리 적발).
  const per = Math.max(4, Math.floor((gap - 6) / 9));
  const rlines = (s?: string): string[] => (s ? wrapKo(s, per) : []);
  const rsize = (ls: string[]): number => (ls.length ? Math.max(7.6, Math.min(10.5, (gap - 6) / Math.max(...ls.map((l) => l.length)))) : 10.5);
  const body = o.tubes
    .map((t, i) => {
      const cx = x0 + i * gap;
      const hidden = o.hideTint === i;
      const [col] = TINT[t.tint] ?? TINT.none;
      const fill = hidden ? "#F2F4F7" : col;
      const heat = t.heated
        ? `<path d="M${cx - 26} 128 h52 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-52 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4 Z" fill="#FFE3C4" stroke="#E8A25A" stroke-width="1.3"/>
           <path d="M${cx - 14} 137 q4 -5 8 0 q4 5 8 0 q4 -5 8 0" fill="none" stroke="#E8833A" stroke-width="1.6" stroke-linecap="round"/>`
        : "";
      return `<g>
        ${heat}
        <ellipse cx="${cx}" cy="46" rx="17" ry="5" fill="#EDF1F5" stroke="#B9C2CC" stroke-width="1.3"/>
        <path d="M${cx - 17} 46 V116 Q${cx - 17} 130 ${cx} 130 Q${cx + 17} 130 ${cx + 17} 116 V46" fill="#F7FAFC" stroke="#B9C2CC" stroke-width="1.4"/>
        <path d="M${cx - 15} 86 V116 Q${cx - 15} 128 ${cx} 128 Q${cx + 15} 128 ${cx + 15} 116 V86 Z" fill="${fill}" opacity="${hidden ? 1 : 0.92}"/>
        ${hidden ? `<text x="${cx}" y="${112}" text-anchor="middle" font-size="15" font-weight="800" fill="#8B95A1">?</text>` : ""}
        <path d="M${cx - 12} 58 q7 -4 14 -2" stroke="#FFFFFF" stroke-width="2.6" opacity=".7" stroke-linecap="round" fill="none"/>
        ${T(cx, 168, t.label, { size: Math.max(9, Math.min(13, (gap - 8) / Math.max(1, t.label.length))), weight: 900, fill: "#191F28" })}
        ${rlines(t.reagent).map((ln, k, a) => T(cx, 185 + k * 13, ln, { size: rsize(a), weight: 700, fill: "#6B7684" })).join("")}
      </g>`;
    })
    .join("");
  const obs = o.tubes
    .map((t, i) => `${t.label}${josa(t.label, "은/는")} ${o.hideTint === i ? "결과를 가려 두었다" : (TINT[t.tint] ?? TINT.none)[1]}${t.heated ? "이고 따뜻한 물에 담가 두었다" : ""}`)
    .join(", ");
  // 긴 시약 설명은 줄바꿈되므로 줄 수만큼 그림 높이를 늘린다(라벨 겹침·잘림 방지 · 파일럿 검수 적발).
  const maxLines = Math.max(1, ...o.tubes.map((t) => rlines(t.reagent).length));
  const H = 183 + maxLines * 13;
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="시험관 ${n}개를 나란히 둔 그림. ${obs}">
    <rect x="8" y="8" width="328" height="${H - 16}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    ${body}
  </svg>`;
}

/** NC 영양소 분류 도표(파라미터형) · 칸 일부를 기호로 가린다.
 *  cols = 분류 축(기능 등) · 각 열의 items 중 mask 인덱스를 ㉠㉡㉢으로 대체한다. */
export function nutrientChartFig(o: { title?: string; cols: { head: string; items: string[] }[]; masks?: { col: number; row: number; sym: string }[] }): string {
  const n = o.cols.length;
  const W = 344;
  const cw = (W - 24 - (n - 1) * 8) / n;
  const maxRows = Math.max(...o.cols.map((c) => c.items.length));
  const H = 46 + maxRows * 30 + 16;
  const body = o.cols
    .map((c, ci) => {
      const x = 12 + ci * (cw + 8);
      const cells = c.items
        .map((it, ri) => {
          const m = o.masks?.find((k) => k.col === ci && k.row === ri);
          const y = 46 + ri * 30;
          return `<rect x="${x}" y="${y}" width="${cw}" height="26" rx="7" fill="${m ? "#FFFFFF" : "#F7F8FA"}" stroke="${m ? "#3182F6" : "#DCE0E6"}" stroke-width="${m ? 1.7 : 1.1}"${m ? ' stroke-dasharray="5 4"' : ""}/>
            ${T(x + cw / 2, y + 17.5, m ? m.sym : it, { size: m ? 12 : Math.max(9.5, Math.min(12, (cw - 8) / it.length)), weight: m ? 800 : 700, fill: m ? "#1B64DA" : "#333D4B" })}`;
        })
        .join("");
      const hs = Math.max(9, Math.min(12, (cw - 8) / c.head.length));
      return `<rect x="${x}" y="12" width="${cw}" height="28" rx="8" fill="#EEF4FF" stroke="#C7DBFA" stroke-width="1.2"/>
        ${T(x + cw / 2, 31, c.head, { size: hs, weight: 800, fill: "#1B64DA" })}${cells}`;
    })
    .join("");
  const maskDesc = o.masks?.length ? `, ${o.masks.map((m) => m.sym).join("·")} 자리는 비어 있다` : "";
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="${o.title ?? "영양소를 갈래별로 묶은 표"}. 갈래는 ${o.cols.map((c) => c.head).join(", ")}이다${maskDesc}">
    ${body}
  </svg>`;
}

/** 표 계열 공용 래퍼 · svgTable의 고정 aria("자료 표")를 머리글·행 이름에서 파생한 문구로 바꾼다
 *  (§5-2 "aria는 파라미터 파생" · 검산 A 3-11). 값 자체는 낭독하지 않아 판독 과제를 지운다. */
const tableAria = (svg: string, head: string[], rows: string[][], what: string): string =>
  svg.replace(
    'aria-label="자료 표"',
    `aria-label="${what}. 세로줄은 ${head.join(", ")}이다. ${rows
      .map((r) => `${r[0]} 줄은 ${head.slice(1).map((h, i) => `${h} ${r[i + 1]}`).join(", ")}`)
      .join(". ")}"`,
  );

/** FT 식품 성분 자료 표 · svgTable 래핑(2열 한글 ≤13자 · 3열 ≤8자 준수). */
export function foodTableFig(head: string[], rows: string[][]): string {
  return tableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "식품에 들어 있는 성분을 정리한 표");
}

// ══════════════════ L2 소화와 소화효소 ══════════════════

/** EG 영양소 × 소화 장소 격자(파라미터형).
 *  cells[r][c] = "" 없음 · "arrow" 분해 일어남 · 기호 문자열이면 그 칸에 기호 배지.
 *  행 = 소화 장소 · 열 = 영양소. 효소 이름은 인쇄하지 않는 것이 기본. */
export function enzymeGridFig(o: { cols: string[]; rows: string[]; cells: string[][]; note?: string }): string {
  const W = 344;
  const LW = 76;
  const cw = (W - 24 - LW) / o.cols.length;
  const rh = 40;
  const H = 44 + o.rows.length * rh + (o.note ? 26 : 10);
  let body = "";
  o.cols.forEach((c, ci) => {
    const x = 12 + LW + ci * cw;
    body += `<rect x="${x}" y="12" width="${cw}" height="28" rx="7" fill="#EEF4FF" stroke="#C7DBFA" stroke-width="1.2"/>${T(x + cw / 2, 30.5, c, { size: 12, weight: 800, fill: "#1B64DA" })}`;
  });
  o.rows.forEach((r, ri) => {
    const y = 44 + ri * rh;
    body += `<rect x="12" y="${y}" width="${LW}" height="${rh - 4}" rx="7" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.1"/>${T(12 + LW / 2, y + rh / 2 + 2, r, { size: 12, weight: 800 })}`;
    o.cols.forEach((_, ci) => {
      const x = 12 + LW + ci * cw;
      const v = o.cells[ri]?.[ci] ?? "";
      body += `<rect x="${x}" y="${y}" width="${cw}" height="${rh - 4}" rx="7" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.1"/>`;
      if (v === "arrow") {
        body += `<path d="M${x + cw / 2 - 15} ${y + rh / 2} h26 m-6 -5 l6 5 l-6 5" fill="none" stroke="#37A446" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (v) {
        body += mark(x + cw / 2, y + rh / 2 - 2, v, 11);
      }
    });
  });
  if (o.note) body += T(W / 2, H - 10, o.note, { size: 10.8, weight: 700, fill: "#6B7684" });
  const syms = o.cells.flat().filter((v) => v && v !== "arrow");
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="세로는 ${o.rows.join("·")}, 가로는 ${o.cols.join("·")}으로 나눈 표. 분해가 일어나는 칸에는 화살표가 있고${syms.length ? ` ${syms.join("·")} 기호가 붙은 칸이 있다` : " 나머지 칸은 비어 있다"}">
    ${body}
  </svg>`;
}

/** DF 소화·흡수 흐름도(파라미터형 · 가로 사슬) · blank 칸은 ㉠ 점선.
 *  arrowLabels가 있으면 화살표 위에 조건을 적는다(상자 밖 배치 · 겹침 방지). */
export function digestFlowFig(o: { steps: string[]; blank?: number; arrowLabels?: (string | null)[]; caption?: string }): string {
  const W = 344;
  const n = o.steps.length;
  // 칸이 적을수록 간격을 줄여 상자 폭을 확보한다(글자 하한 11px 보장 · 검산 A 3-1).
  const GAP = n <= 3 ? 20 : 28;
  const bw = (W - 24 - GAP * (n - 1)) / n;
  const y = o.arrowLabels ? 46 : 30;
  const H = y + 46 + (o.caption ? 26 : 12);
  let body = "";
  o.steps.forEach((s, i) => {
    const x = 12 + i * (bw + GAP);
    const bl = o.blank === i;
    const lines = wrapKo(s, 6);
    // 띄어쓰기가 없는 긴 낱말(모노글리세라이드 등)은 줄바꿈이 안 되므로 글자 크기로 상자 안에 맞춘다.
    const maxLen = Math.max(...lines.map((l) => l.length), 1);
    const fs = Math.max(11, Math.min(11.5, (bw - 8) / maxLen));
    body += `<rect x="${x}" y="${y}" width="${bw}" height="42" rx="10" fill="${bl ? "#FFFFFF" : "#F2F4F7"}" stroke="${bl ? "#3182F6" : "#C9D0D8"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>`;
    if (bl) body += T(x + bw / 2, y + 27, "㉠", { size: 15, weight: 800, fill: "#1B64DA" });
    else lines.forEach((ln, k) => (body += T(x + bw / 2, y + (lines.length === 1 ? 26 : 20 + k * (fs + 3)), ln, { size: fs, weight: 700 })));
    if (i < n - 1) {
      const ax = x + bw + 5;
      body += `<path d="M${ax} ${y + 21} h${GAP - 10} m-6 -5 l6 5 l-6 5" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
      const al = o.arrowLabels?.[i];
      if (al) body += T(ax + (GAP - 10) / 2, y - 8, al, { size: 10.5, weight: 800, fill: "#B4690E" });
    }
  });
  if (o.caption) body += T(W / 2, H - 9, o.caption, { size: 10.8, weight: 700, fill: "#6B7684" });
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="왼쪽에서 오른쪽으로 이어지는 흐름도. 칸은 ${n}개이고${o.blank === undefined ? " 모두 채워져 있다" : " 한 칸은 비어 있으며 기호로 표시되어 있다"}">
    ${body}
  </svg>`;
}

// ══════════════════ L3 순환계 ══════════════════

/** CP 두 순환 경로 도해(기호판) · 심장을 가운데 두고 위 고리·아래 고리.
 *  loopSyms = [위 고리, 아래 고리] · vesselSyms = [왼위, 오른위, 오른아래, 왼아래] 혈관 기호.
 *  showColor:false면 색 단서를 지운다(색이 곧 답이 되는 문항에서 쓴다). */
export function circulationPathFig(o: { loopSyms?: (string | null)[]; vesselSyms?: (string | null)[]; showColor?: boolean }): string {
  const [up, down] = o.loopSyms ?? [null, null];
  const [v1, v2, v3, v4] = o.vesselSyms ?? [null, null, null, null];
  const red = o.showColor === false ? "#9AA3AD" : "#D9525F";
  const blue = o.showColor === false ? "#9AA3AD" : "#4A6FA5";
  // 방향 화살촉은 항상 그린다. 색을 지운 판(showColor:false)에서 화살촉까지 없으면 어느 쪽으로
  // 흐르는지 판독할 근거가 사라져 문항이 성립하지 않는다(파일럿 검수 적발 · 정보 미제시는 치명).
  const tipUp = (x: number, y: number): string => `<path d="M${x - 6} ${y + 5} L${x} ${y - 3} L${x + 6} ${y + 5}" fill="none" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const tipDown = (x: number, y: number): string => `<path d="M${x - 6} ${y - 5} L${x} ${y + 3} L${x + 6} ${y - 5}" fill="none" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // aria는 파라미터에서 파생한다. 이 그림에서는 **화살촉의 방향**만이 혈관 이름의 판독 근거라
  // 방향을 낭독하지 않으면 스크린리더 경로에서 문항이 성립하지 않는다(검산 A S17).
  const WHERE = ["왼쪽 위", "오른쪽 위", "오른쪽 아래", "왼쪽 아래"];
  const TOWARD = ["허파 쪽인 위", "심장 쪽인 아래", "조직세포 쪽인 아래", "심장 쪽인 위"];
  const vDesc = [v1, v2, v3, v4]
    .map((v, i) => `${WHERE[i]} 혈관은 화살촉이 ${TOWARD[i]}를 향하고${v ? ` ${v} 기호가 붙어 있다` : " 기호는 붙어 있지 않다"}`)
    .join(", ");
  const lDesc = [up, down].filter(Boolean).length
    ? `. 점선 고리로 묶은 자리에 ${[up ? "위쪽 고리에 " + up : "", down ? "아래쪽 고리에 " + down : ""].filter(Boolean).join(", ")} 기호가 붙어 있다`
    : "";
  const cDesc = o.showColor === false ? ". 혈관은 모두 같은 회색으로 그려져 색 단서는 없다" : ". 혈관은 붉은색과 푸른색으로 나누어 그려져 있다";
  return `<svg viewBox="0 0 344 250" ${NS} role="img" aria-label="심장을 가운데 두고 위쪽 고리는 허파로, 아래쪽 고리는 조직세포로 이어진 혈액 순환 경로 도해. ${vDesc}${lDesc}${cDesc}">
    <rect x="8" y="8" width="328" height="234" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <path d="M126 52 C104 50 96 76 108 98 C118 116 132 124 142 128" fill="none" stroke="${blue}" stroke-width="7" stroke-linecap="round"/>
    <path d="M202 128 C214 124 228 114 238 96 C250 74 240 50 218 52" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/>
    <path d="M202 152 C216 158 232 176 226 198" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/>
    <path d="M118 198 C112 176 128 158 142 152" fill="none" stroke="${blue}" stroke-width="7" stroke-linecap="round"/>
    ${tipUp(100, 80)}${tipDown(245, 82)}${tipDown(227, 178)}${tipUp(117, 176)}
    <rect x="128" y="28" width="88" height="40" rx="12" fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.5"/>
    ${T(172, 53, "허파", { size: 13, weight: 900, fill: "#2E5D93" })}
    <rect x="132" y="112" width="80" height="56" rx="13" fill="#F0C9CE" stroke="#A83744" stroke-width="1.7"/>
    ${T(172, 145, "심장", { size: 13, weight: 900, fill: "#8C3540" })}
    <rect x="122" y="192" width="100" height="40" rx="12" fill="#EAF6EC" stroke="#7FB77E" stroke-width="1.5"/>
    ${T(172, 217, "조직세포", { size: 12.5, weight: 900, fill: "#3B7A44" })}
    ${up ? `<path d="M118 34 C74 44 62 96 92 128" fill="none" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="5 4"/>${mark(74, 62, up)}` : ""}
    ${down ? `<path d="M226 222 C270 212 282 160 252 128" fill="none" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="5 4"/>${mark(270, 192, down)}` : ""}
    ${v1 ? mark(108, 58, v1, 11) : ""}${v2 ? mark(238, 58, v2, 11) : ""}
    ${v3 ? mark(234, 192, v3, 11) : ""}${v4 ? mark(110, 192, v4, 11) : ""}
  </svg>`;
}

// ══════════════════ L4 호흡계와 호흡운동 ══════════════════

/** BM 병 호흡 모형(파라미터형) · 부품에 기호를 붙이고 이름은 인쇄하지 않는다.
 *  pull = 고무막을 아래로 당긴 상태 · syms = [유리관, 고무풍선, 병, 고무막]. */
export function breathModelFig(o: { pull: boolean; syms?: (string | null)[]; hand?: boolean }): string {
  const [tube, balloon, jar, sheet] = o.syms ?? [null, null, null, null];
  // 병의 크기는 고정하고 고무막만 병 안에서 오르내린다(병 바닥선이 함께 움직이면 병이 줄어든 것처럼 읽힌다).
  const memY = o.pull ? 200 : 168;
  const bal = o.pull ? 1 : 0.66;
  const bw = 34 * bal;
  const bh = 40 * bal;
  return `<svg viewBox="0 0 344 244" ${NS} role="img" aria-label="투명한 병 안에 고무풍선을 매단 호흡 모형 그림. 병 아래를 막은 고무 막이 ${o.pull ? "아래로 당겨져 풍선이 크게 부풀어" : "위로 올라와 풍선이 쪼그라들어"} 있다. ${[[tube, "병 위쪽에 꽂힌 유리관"], [balloon, "병 안에 매달린 고무풍선"], [jar, "바깥을 이루는 병"], [sheet, "병 아래를 막은 고무 막"]].filter((x) => x[0]).map((x) => `${x[1]}에 ${x[0]} 기호가 붙어 있다`).join(", ") || "부품에 기호는 붙어 있지 않다"}">
    <rect x="8" y="8" width="328" height="228" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <rect x="164" y="26" width="16" height="46" rx="6" fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.6"/>
    <path d="M104 72 H240 V212 H104 Z" fill="#F2F8FD" stroke="none" opacity=".9"/>
    <path d="M104 72 V212 M240 72 V212" fill="none" stroke="#9BB9DC" stroke-width="2.4"/>
    <path d="M120 62 H224 a10 10 0 0 1 10 10 H110 a10 10 0 0 1 10 -10 Z" fill="#DCE9F7" stroke="#9BB9DC" stroke-width="1.5"/>
    <ellipse cx="172" cy="${96 + bh * 0.5}" rx="${bw}" ry="${bh}" fill="#F0C9CE" stroke="#A83744" stroke-width="1.6"/>
    <path d="M172 72 V${96}" stroke="#A83744" stroke-width="3"/>
    <path d="M104 ${memY - 24} Q172 ${memY} 240 ${memY - 24}" fill="none" stroke="#C2606C" stroke-width="7" stroke-linecap="round"/>
    ${o.hand ? `<path d="M166 ${memY + 4} q6 -8 12 0 v22 h-12 Z" fill="#F3C7B4" stroke="#D89C82" stroke-width="1.4"/>` : ""}
    ${tube ? mark(200, 40, tube, 11) : ""}
    ${balloon ? mark(172, 96 + bh, balloon, 11) : ""}
    ${jar ? mark(120, 92, jar, 11) : ""}
    ${sheet ? mark(218, memY - 8, sheet, 11) : ""}
  </svg>`;
}

/** AL 허파꽈리 기체 교환(기호판) · 기체 기호를 허파꽈리 쪽과 모세혈관 쪽 **양쪽에** 배치한다
 *  (한쪽만 보고 정하면 뒤집히는 천재 02 구조 계승). dirs = 화살표 방향 [위쪽, 아래쪽]. */
export function alveoliQuizFig(o: { symA?: string | null; symB?: string | null; showArrows?: boolean; showWall?: boolean }): string {
  const arr = o.showArrows
    ? `<path d="M152 96 h44 m-8 -5.5 l8 5.5 l-8 5.5" fill="none" stroke="#3182F6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M196 148 h-44 m8 -5.5 l-8 5.5 l8 5.5" fill="none" stroke="#7C6BFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  // aria는 파라미터에서 파생한다. 화살표가 있으면 그 방향까지 관찰 서술로 말해야 이 그림으로만
  // 풀리는 문항(방향 판정)이 스크린리더에서도 성립한다. 기체의 정체는 여전히 학생 몫이라 유출이 아니다.
  const marks = o.symA && o.symB
    ? `기체 두 가지에 ${o.symA}·${o.symB} 기호가 붙어 있고 같은 기호가 벽 양쪽에 각각 놓여 있다`
    : "기체에 기호는 붙어 있지 않다";
  const arrows = o.showArrows
    ? `. ${o.symA}는 왼쪽에서 오른쪽으로, ${o.symB}는 오른쪽에서 왼쪽으로 향하는 화살표와 함께 그려져 있다`
    : "";
  const wall = o.showWall ? ". 두 자리를 가르는 벽은 한 겹으로 얇게 그려져 있다" : "";
  return `<svg viewBox="0 0 344 220" ${NS} role="img" aria-label="허파꽈리와 그것을 감싼 모세혈관을 얇은 벽 하나를 사이에 두고 그린 그림. ${marks}${arrows}${wall}">
    <rect x="8" y="8" width="328" height="204" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <path d="M26 122 C58 122 60 88 84 88" fill="none" stroke="#9BB9DC" stroke-width="12" stroke-linecap="round"/>
    <g fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.8">
      <circle cx="104" cy="72" r="30"/><circle cx="98" cy="132" r="30"/><circle cx="140" cy="102" r="26"/>
    </g>
    <path d="M212 42 C238 62 244 104 232 140 C222 172 208 186 196 194" fill="none" stroke="#D9525F" stroke-width="13" stroke-linecap="round"/>
    <path d="M212 42 C238 62 244 104 232 140 C222 172 208 186 196 194" fill="none" stroke="#4A6FA5" stroke-width="6" stroke-linecap="round" opacity=".55"/>
    <path d="M172 40 V196" stroke="#B9C2CC" stroke-width="2" stroke-dasharray="6 5"/>
    ${T(172, 32, "얇은 벽", { size: 10.8, weight: 700, fill: "#8B95A1" })}
    ${arr}
    ${o.symA ? `${mark(132, 96, o.symA, 11)}${mark(216, 96, o.symA, 11)}` : ""}
    ${o.symB ? `${mark(216, 148, o.symB, 11)}${mark(132, 150, o.symB, 11)}` : ""}
    ${o.showWall ? `<path d="M164 108 h16 M164 108 l4 -4 M164 108 l4 4 M180 108 l-4 -4 M180 108 l-4 4" fill="none" stroke="#4E5968" stroke-width="1.6" stroke-linecap="round"/>${T(172, 124, "한 겹", { size: 10, weight: 800, fill: "#4E5968", halo: "#FFFFFF" })}` : ""}
    ${T(90, 206, "허파꽈리 쪽", { size: 10.8, weight: 800, fill: "#2E5D93" })}
    ${T(262, 206, "모세혈관 쪽", { size: 10.8, weight: 800, fill: "#8C3540" })}
  </svg>`;
}

/** GT 들숨·날숨 성분 자료 표 · svgTable 래핑(3열 한글 ≤8자 준수). */
export function gasTableFig(head: string[], rows: string[][]): string {
  return tableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "들숨과 날숨에 든 기체의 양을 견준 표");
}

// ══════════════════ L5 배설계 ══════════════════

/** UT 혈액·여과액·오줌 성분 표 · svgTable 래핑(3열 한글 ≤8자). */
export function urineTableFig(head: string[], rows: string[][]): string {
  return tableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "여과액과 오줌에 든 물질을 견준 표");
}

/** HC 검사 결과지(항목 | 결과 | 정상 범위) · svgTable 래핑(천재 10 구조 계승 · 대소 비교만). */
export function checkupFig(rows: string[][]): string {
  const head = ["검사 항목", "결과", "정상 범위"];
  return tableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "건강 검진 결과지의 일부");
}

// ══════════════════ L6 세포호흡과 기관계의 통합 ══════════════════

/** CR 세포호흡 도해(기호판) · 재료 칸·결과 칸을 기호로 가릴 수 있다.
 *  hide = "in" 재료 가림 · "out" 결과 가림 · "none". */
export function cellRespQuizFig(o: { inItems: string[]; outItems: string[]; hide?: "in" | "out" | "none"; symIn?: string; symOut?: string }): string {
  const boxed = (x: number, y: number, w: number, title: string, items: string[], hidden: boolean, sym?: string): string => {
    const rows = items
      .map((it, i) => `<rect x="${x + 9}" y="${y + 34 + i * 32}" width="${w - 18}" height="26" rx="8" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1"/>${T(x + w / 2, y + 51 + i * 32, it, { size: 11.5, weight: 700 })}`)
      .join("");
    const masked = `<rect x="${x + 9}" y="${y + 34}" width="${w - 18}" height="${items.length * 32 - 6}" rx="8" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.7" stroke-dasharray="5 4"/>${T(x + w / 2, y + 34 + (items.length * 32 - 6) / 2 + 5, sym ?? "㉠", { size: 15, weight: 800, fill: "#1B64DA" })}`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${34 + items.length * 32 - 4}" rx="12" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="1.3"/>
      ${T(x + w / 2, y + 22, title, { size: 12, weight: 900, fill: "#4E5968" })}${hidden ? masked : rows}`;
  };
  // 상자 폭 96 · 원 반지름 44에서는 좌우 화살표가 4~10px밖에 남지 않아 방향 단서로 기능하지 못했다
  // (검산 B 33 · 해설은 화살표 방향을 판독 근거로 든다). 상자를 좁히고 원을 줄여 ≥24px를 확보한다.
  const BW = 84;
  const RAD = 38;
  const H = 46 + Math.max(o.inItems.length, o.outItems.length) * 32 + 40;
  const midY = 24 + (34 + Math.max(o.inItems.length, o.outItems.length) * 32 - 4) / 2;
  // aria 파생: 칸에 실제로 적힌 내용과 가림 기호를 낭독해야 접근성 경로에서도 문항이 성립한다(§9-1 B13).
  const inTxt = o.hide === "in" ? `가려져 ${o.symIn ?? "㉠"} 기호로 표시되어` : o.inItems.join("와 ") + "가 적혀";
  const outTxt = o.hide === "out" ? `가려져 ${o.symOut ?? "㉠"} 기호로 표시되어` : o.outItems.join("와 ") + "가 적혀";
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="조직세포를 가운데 두고 왼쪽에 들어가는 물질 칸, 오른쪽에 생기는 물질 칸을 놓은 도해. 왼쪽 칸에는 ${inTxt} 있고 오른쪽 칸에는 ${outTxt} 있다. 화살표는 왼쪽 칸에서 조직세포로, 조직세포에서 오른쪽 칸으로 향한다">
    <rect x="8" y="8" width="328" height="${H - 16}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    ${boxed(14, 24, BW, "들어가는 물질", o.inItems, o.hide === "in", o.symIn)}
    ${boxed(344 - 14 - BW, 24, BW, "생기는 물질", o.outItems, o.hide === "out", o.symOut)}
    <circle cx="172" cy="${midY}" r="${RAD}" fill="#EAF6EC" stroke="#7FB77E" stroke-width="1.8"/>
    ${T(172, midY + 5, "조직세포", { size: 12.5, weight: 900, fill: "#3B7A44" })}
    <path d="M${14 + BW + 6} ${midY} h${172 - RAD - (14 + BW + 6) - 4} m-6 -5 l6 5 l-6 5" fill="none" stroke="#37A446" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${172 + RAD + 4} ${midY} h${344 - 14 - BW - 6 - (172 + RAD + 4) - 4} m-6 -5 l6 5 l-6 5" fill="none" stroke="#7C6BFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    ${T(172, H - 14, "에너지는 이 과정에서 생명 활동에 쓰여요", { size: 10.5, weight: 700, fill: "#6B7684" })}
  </svg>`;
}

/** SI 기관계 상자 + 물질 화살표(기호판) · 상자 이름을 기호로 가리고 화살표 라벨만으로 역산시킨다
 *  (천재 08 구조 계승). boxes = [왼위, 왼아래, 오른위, 오른아래] · center는 고정 표기. */
export function systemsQuizFig(o: { boxes: { sym: string; label?: string; inLabel?: string; outLabel?: string; dir?: "toCenter" | "fromCenter" | "both" }[]; center?: string }): string {
  // 가운데 순환계는 **세로 막대**로 그린다. 네 상자를 모서리에 두고 중앙에 작은 상자를 놓으면
  // 화살표가 그 상자를 비껴가거나(직결로 오독) 상자에 덮여 사라진다(사용자 검수 36·37번 적발).
  // 막대로 두면 두 줄 모두 같은 높이에서 막대 변에 정확히 닿는다.
  const BW = 92;
  const BH = 54;
  const LX = 8;
  const RX = 244;
  const CX = 136;
  const CW = 72;
  const ROW = [28, 124];
  const POS: [number, number][] = [
    [LX, ROW[0]],
    [LX, ROW[1]],
    [RX, ROW[0]],
    [RX, ROW[1]],
  ];
  const body = o.boxes
    .map((b, i) => {
      const [x, y] = POS[i] ?? POS[0];
      const cxm = x + BW / 2;
      const ay = y + BH / 2;
      const left = x < 172;
      const dir = b.dir ?? "toCenter";
      // 화살표는 바깥 상자 변 ↔ 가운데 막대 변 사이 빈 구간에만 그린다(어디에도 덮이지 않는다).
      const a1 = left ? x + BW + 4 : x - 4;
      const a2 = left ? CX - 4 : CX + CW + 4;
      const head = (px: number, sign: number): string => `M${px} ${ay} l${-7 * sign} -5 M${px} ${ay} l${-7 * sign} 5`;
      const toCenter = dir === "toCenter";
      const tip = dir === "both" ? "" : toCenter ? head(a2, left ? 1 : -1) : head(a1, left ? -1 : 1);
      const both = dir === "both" ? `${head(a2, left ? 1 : -1)} ${head(a1, left ? -1 : 1)}` : "";
      return `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="12" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="1.4"/>
        ${b.label ? T(cxm, y + BH / 2 + 5, b.label, { size: 12, weight: 900 }) : mark(cxm, y + BH / 2, b.sym)}
        ${b.inLabel ? `<path d="M${cxm} ${y - 6} V${y - 1}" stroke="#B4690E" stroke-width="1.2" stroke-linecap="round"/>${T(cxm, y - 8, b.inLabel, { size: 10.8, weight: 800, fill: "#B4690E" })}` : ""}
        ${b.outLabel ? `<path d="M${cxm} ${y + BH + 2} V${y + BH + 7} " stroke="#B4690E" stroke-width="1.2" stroke-linecap="round"/>${T(cxm, y + BH + 17, b.outLabel, { size: 10.8, weight: 800, fill: "#B4690E" })}` : ""}
        <path d="M${a1} ${ay} H${a2} ${tip}${both}" fill="none" stroke="#3182F6" stroke-width="2.2" stroke-linecap="round"/>`;
    })
    .join("");
  // aria 파생: 상자마다 무엇이 붙어 있고 화살표가 어느 쪽을 향하는지까지 관찰 서술한다.
  const WHERE = ["왼쪽 위", "왼쪽 아래", "오른쪽 위", "오른쪽 아래"];
  const desc = o.boxes
    .map((b, i) => {
      const who = b.label ? `${b.label}이라고 적힌 상자` : `${b.sym} 기호가 붙은 상자`;
      const io2 = [b.inLabel ? `위에 ${b.inLabel}` : "", b.outLabel ? `아래에 ${b.outLabel}` : ""].filter(Boolean).join(", ");
      const d = b.dir === "fromCenter" ? "가운데에서 이 상자 쪽으로" : b.dir === "both" ? "양쪽으로" : "이 상자에서 가운데 쪽으로";
      return `${WHERE[i]}는 ${who}이고${io2 ? ` ${io2}가 적혀 있으며` : ""} 화살표는 ${d} 향한다`;
    })
    .join(". ");
  return `<svg viewBox="0 0 344 206" ${NS} role="img" aria-label="가운데에 ${o.center ?? "순환계"} 상자를 세로로 길게 두고 그 양옆에 상자 네 개를 놓은 관계 도해. ${desc}">
    <rect x="8" y="8" width="328" height="190" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <rect x="${CX}" y="22" width="${CW}" height="158" rx="14" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.7"/>
    ${T(CX + CW / 2, 96, o.center ?? "순환계", { size: 12.5, weight: 900, fill: "#1B64DA" })}
    ${T(CX + CW / 2, 114, "혈액", { size: 11, weight: 700, fill: "#4E5968" })}
    ${body}
  </svg>`;
}

/** AT 활동 강도별 지표 표 · svgTable 래핑(천재 09 구조 계승 · 한 지표만 추세가 반대). */
export function activityTableFig(head: string[], rows: string[][]): string {
  return tableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "활동에 따른 몸의 변화를 견준 표");
}

// ══════════════════ 확대 120 신작(파일럿 문항은 건드리지 않는 append) ══════════════════
// 사용자 검수로 "해부 구조도는 발주 라스터가 정본"이 확정됐다(§5-1). 라스터는 장당 2문항이 상한이라
// 확대분의 시각 조달은 **해부가 아닌 자료**(표·성질 카드·이동 도해)로 채운다. 셋 다 파라미터형이고
// aria는 파라미터에서 파생한다.

/** 표 범용 래퍼 · what은 이 표가 무엇을 정리한 것인지만 적는다(판정 결과·해석은 적지 않는다). */
export function dataTableFig(what: string, head: string[], rows: string[][]): string {
  return tableAria(svgTable(head, rows, { firstColHead: true }), head, rows, what);
}

/** 정체 역동정 카드 · 기호 배지 + 성질 줄을 가로 카드로 쌓는다.
 *  같은 해부 그림을 반복하지 않고도 "순서 없이 나타낸 것" 아키타입을 만들 수 있다.
 *  성질 줄에는 이름을 적지 않는 것이 원칙이다(이름을 적으면 정체가 인쇄된다). */
export function factCardsFig(o: { cards: { sym: string; lines: string[] }[]; caption?: string }): string {
  const W = 344;
  const LH = 17;
  let y = 14;
  const parts: string[] = [];
  for (const c of o.cards) {
    const wrapped = c.lines.flatMap((ln) => wrapKo(ln, 20));
    const h = 14 + wrapped.length * LH;
    parts.push(`<rect x="12" y="${y}" width="${W - 24}" height="${h}" rx="11" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.2"/>`);
    parts.push(mark(38, y + h / 2, c.sym, 12.5));
    wrapped.forEach((ln, k) => parts.push(T(66, y + 22 + k * LH, ln, { size: 12, anchor: "start", weight: 700, fill: "#333D4B" })));
    y += h + 8;
  }
  const H = y + (o.caption ? 22 : 4);
  if (o.caption) parts.push(T(W / 2, H - 8, o.caption, { size: 10.8, weight: 700, fill: "#6B7684" }));
  const desc = o.cards.map((c) => `${c.sym} 카드에는 ${c.lines.join(", ")}${josa(c.lines[c.lines.length - 1] ?? "", "이라고/라고")} 적혀 있다`).join(". ");
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="성질을 적은 카드 ${o.cards.length}장을 위아래로 늘어놓은 그림. 이름은 적혀 있지 않다. ${desc}">
    <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    ${parts.join("")}
  </svg>`;
}

/** 두 자리 사이 물질 이동 도해 · 이름 상자 둘과 그 사이 화살표.
 *  dir "right"면 왼쪽에서 오른쪽으로 간다. 방향 판정이 정답인 문항에서는 물질 이름을 기호로 가린다. */
export function transferFig(o: { left: string; right: string; arrows: { sym: string; dir: "right" | "left" }[]; caption?: string; note?: string }): string {
  const W = 344;
  const BX = 20;
  const BW = 96;
  const RX = W - BX - BW;
  const n = o.arrows.length;
  const boxH = n * 46 + 18;
  // 상자 아래에 note·caption 자리를 따로 확보한다(초판은 두 줄이 상자 안으로 파고들었다 · 갤러리 적발).
  const boxBottom = 46 + boxH;
  const noteY = boxBottom + 18;
  const capY = boxBottom + (o.note ? 40 : 18);
  const H = boxBottom + (o.note ? 26 : 0) + (o.caption ? 28 : 0) + 12;
  const body = o.arrows
    .map((a, i) => {
      const y = 60 + i * 46;
      const x1 = a.dir === "right" ? BX + BW + 10 : RX - 10;
      const x2 = a.dir === "right" ? RX - 10 : BX + BW + 10;
      const s = a.dir === "right" ? 1 : -1;
      return `<path d="M${x1} ${y} H${x2} M${x2} ${y} l${-9 * s} -5.5 M${x2} ${y} l${-9 * s} 5.5" fill="none" stroke="#3182F6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        ${mark((x1 + x2) / 2, y - 17, a.sym, 12)}`;
    })
    .join("");
  const desc = o.arrows.map((a) => `${a.sym}${josa(a.sym, "은/는")} ${a.dir === "right" ? `${o.left} 쪽에서 ${o.right} 쪽으로` : `${o.right} 쪽에서 ${o.left} 쪽으로`} 향하는 화살표와 함께 그려져 있다`).join(", ");
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="왼쪽에 ${o.left}, 오른쪽에 ${o.right} 상자를 두고 그 사이에 물질이 옮겨 가는 화살표를 그린 그림. ${desc}${o.note ? `. ${o.note}` : ""}">
    <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <rect x="${BX}" y="46" width="${BW}" height="${boxH}" rx="12" fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.5"/>
    <rect x="${RX}" y="46" width="${BW}" height="${boxH}" rx="12" fill="#FADFE3" stroke="#C2606C" stroke-width="1.5"/>
    ${T(BX + BW / 2, 34, o.left, { size: 12.5, weight: 900, fill: "#2E5D93" })}
    ${T(RX + BW / 2, 34, o.right, { size: 12.5, weight: 900, fill: "#8C3540" })}
    ${body}
    ${o.note ? T(W / 2, noteY, o.note, { size: 10.8, weight: 700, fill: "#6B7684" }) : ""}
    ${o.caption ? T(W / 2, capY, o.caption, { size: 10.8, weight: 700, fill: "#6B7684" }) : ""}
  </svg>`;
}

// ══════════════════ 문항 ══════════════════
const L1 = "g2u6l1";
const L2 = "g2u6l2";
const L3 = "g2u6l3";
const L4 = "g2u6l4";
const L5 = "g2u6l5";
const L6 = "g2u6l6";

export const POOL_G2U6V2_PILOT: ExamItem[] = [
  {
    id: "g2u6e201",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "그림은 세 가지 즙에 각각 다른 검출 용액을 넣은 뒤 나타난 색을 정리한 거예요. <b>(가)</b>에 들어 있다고 판단할 수 있는 영양소는?",
    figure: bodyTestTubesFig({
      tubes: [
        { label: "(가)", tint: "navy", reagent: "아이오딘 용액" },
        { label: "(나)", tint: "none", reagent: "아이오딘 용액" },
        { label: "(다)", tint: "purple", reagent: "뷰렛 용액" },
      ],
    }),
    options: ["녹말", "포도당", "단백질", "지방", "무기염류"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)에 넣은 것은 아이오딘 용액이고 색이 짙은 청람색으로 바뀌었어요. 아이오딘 용액을 만나 청람색이 되는 영양소는 <b>녹말</b>이에요. 같은 용액을 넣었는데도 색이 그대로인 (나)에는 녹말이 없다는 뜻이라, 두 관을 나란히 보면 판단이 더 분명해져요.<span class='xh'>오답 하나씩 격파</span>'포도당'은 베네딕트 용액을 넣고 따뜻하게 데워야 황적색이 나타나므로 아이오딘 용액만으로는 확인할 수 없어요. '단백질'은 뷰렛 용액을 넣었을 때 보라색이 되는데 그 결과는 (다)에서 보이죠. '지방'은 수단 Ⅲ 용액을 써야 하고 이 그림에는 그 용액이 아예 없어요. '무기염류'는 여기 쓰인 세 용액 가운데 어느 것으로도 확인하는 물질이 아니에요. <b>어떤 용액을 넣었는지를 먼저 보고</b> 그다음에 색을 읽는 것이 순서랍니다.",
    core: "아이오딘 용액 + 청람색 = 녹말. 용액을 먼저, 색을 나중에 읽어요!",
  },
  {
    id: "g2u6e203",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "그림은 어떤 음식물 즙을 세 관에 나누어 담고 각각 다른 처리를 한 결과예요. 이 결과에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?",
    figure: bodyTestTubesFig({
      tubes: [
        { label: "A", tint: "navy", reagent: "아이오딘 용액" },
        { label: "B", tint: "orange", reagent: "베네딕트 용액", heated: true },
        { label: "C", tint: "none", reagent: "뷰렛 용액" },
      ],
    }),
    bogi: [
      "이 음식물 즙에는 녹말이 들어 있어요.",
      "B의 색 변화는 따뜻하게 데우지 않아도 똑같이 나타나요.",
      "이 음식물 즙에는 단백질이 거의 없다고 볼 수 있어요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ ✓ A는 아이오딘 용액을 넣어 청람색이 되었으니 녹말이 있어요. ㄷ ✓ C는 뷰렛 용액을 넣었는데도 색이 그대로예요. 단백질이 있었다면 보라색이 나타났을 테니 단백질은 거의 없다고 볼 수 있죠.<span class='xh'>오답 하나씩 격파</span>ㄴ ✗ 베네딕트 용액은 <b>포도당</b>을 찾는 용액인데, 넣기만 해서는 색이 잘 바뀌지 않고 <b>따뜻하게 데워야</b> 황적색이 뚜렷하게 나타나요. B에 데움 표시가 함께 그려져 있는 까닭이 바로 그것이라, 데우지 않아도 같은 결과가 나온다는 진술은 틀렸어요. 검출 반응 문제는 <b>용액·조건·색</b> 세 가지를 한 묶음으로 확인하는 습관이 필요해요. 하나만 놓쳐도 결론이 뒤집힌답니다.",
    core: "용액 · 조건 · 색을 한 묶음으로. 베네딕트는 데움이 조건이에요!",
  },
  {
    id: "g2u6e206",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "표는 영양소를 몸에서 하는 일에 따라 나눈 거예요. <b>㉠</b> 자리에 들어갈 수 있는 영양소로 옳은 것은?",
    figure: nutrientChartFig({
      title: "영양소를 하는 일에 따라 나눈 표",
      cols: [
        { head: "에너지를 내요", items: ["탄수화물", "단백질", "지방"] },
        { head: "몸을 이루어요", items: ["단백질", "지방", "무기염류"] },
        { head: "기능을 조절해요", items: ["㉠", "물", "무기염류"] },
      ],
      masks: [{ col: 2, row: 0, sym: "㉠" }],
    }),
    options: ["바이타민", "녹말", "지방", "아미노산", "엿당"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>세 번째 칸은 몸의 기능을 조절하는 영양소가 모인 자리예요. 물과 무기염류가 이미 들어 있고, 여기에 함께 묶이는 것이 <b>바이타민</b>이에요. 바이타민은 아주 적은 양으로도 몸의 여러 기능이 잘 일어나도록 돕지만 에너지를 내는 데 쓰이지는 않아요.<span class='xh'>오답 하나씩 격파</span>'지방'은 에너지를 내고 몸을 이루기도 하지만 몸의 기능을 조절하는 무리에는 들지 않아요. '녹말'과 '엿당'은 탄수화물의 한 종류이고, '아미노산'은 단백질이 잘게 나뉜 물질이에요. 셋 다 <b>여섯 가지 영양소의 이름이 아니라 그 안에 속한 물질 이름</b>이라 이 표의 칸을 채울 수 없어요. 표 문제는 이미 채워진 칸이 무엇을 뜻하는지 먼저 읽어야 남은 자리의 성격이 보인답니다.",
    core: "조절하는 영양소 = 바이타민 · 무기염류 · 물. 이미 채워진 칸부터 읽어요!",
  },
  {
    id: "g2u6e210",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "표는 세 가지 식품 100 g에 가장 많이 들어 있는 성분과 그다음으로 많은 성분을 나타낸 거예요. 이 표만으로 알 수 있는 것은?",
    figure: foodTableFig(
      ["식품", "가장 많은 성분", "다음 성분"],
      [
        ["(가)", "물", "단백질"],
        ["(나)", "탄수화물", "물"],
        ["(다)", "지방", "단백질"],
      ],
    ),
    options: [
      "(가)에는 단백질보다 물이 더 많이 들어 있어요.",
      "(나)에는 지방이 전혀 들어 있지 않아요.",
      "(다)에는 바이타민이 가장 많이 들어 있어요.",
      "세 식품 모두 물이 가장 많은 성분이에요.",
      "(가)와 (다)에 들어 있는 단백질의 양은 서로 같아요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>표는 각 식품에서 <b>가장 많은 성분</b>과 <b>그다음 성분</b>만 알려 줘요. (가)는 첫 칸이 물, 둘째 칸이 단백질이니 물이 단백질보다 많다는 것은 표에서 곧바로 읽어 낼 수 있죠.<span class='xh'>오답 하나씩 격파</span>'(나)에 지방이 전혀 없다'는 진술은 지나쳐요. 표에 이름이 안 보인다고 해서 없다는 뜻은 아니고 상위 두 가지에 들지 못했을 뿐이에요. '(다)에 바이타민이 가장 많다'는 표와 어긋나요. (다)의 첫 칸은 지방이니까요. '세 식품 모두 물이 가장 많다'도 틀렸어요. 첫 칸이 물인 식품은 (가)뿐이에요. '(가)와 (다)의 단백질 양이 같다'는 <b>순위만 있고 양은 없는</b> 표로는 판단할 수 없어요. 자료 문제는 <b>표가 말하지 않은 것</b>을 골라내는 것이 절반이랍니다.",
    core: "순위 표는 순위만 말해요. 없다·같다는 함부로 결론짓지 않기!",
  },
  {
    id: "g2u6e213",
    lessonId: L1,
    type: "mcq",
    diff: 3,
    prompt: "어떤 즙에 무엇이 들어 있는지 알아보려고 그림처럼 실험했더니 두 관 모두 색이 변하지 않았어요. 이 결과를 두고 내린 판단으로 가장 알맞은 것은?",
    figure: bodyTestTubesFig({
      tubes: [
        { label: "(가)", tint: "none", reagent: "즙 + 검출 용액" },
        { label: "(나)", tint: "none", reagent: "증류수 + 검출 용액" },
      ],
    }),
    options: [
      "(가)에는 알아보려던 영양소가 거의 없고, (나)는 비교 기준으로 둔 것이에요.",
      "검출 용액이 상해서 실험이 실패한 것이므로 결론을 낼 수 없어요.",
      "(나)에서도 색이 변하지 않았으므로 (가)의 결과는 믿을 수 없어요.",
      "(가)에 그 영양소가 많아서 오히려 색이 사라진 것이에요.",
      "두 관을 데웠다면 (나)에서도 보라색이 나타났을 거예요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(나)는 알아보려는 물질이 들어 있지 않은 관, 곧 <b>대조군</b>이에요. 대조군을 함께 두는 까닭은 색이 변하지 않은 상태가 어떤 모습인지를 확인해 두기 위해서예요. (나)가 그대로이고 (가)도 그대로라면, (가)에 알아보려던 영양소가 거의 없다는 결론을 자신 있게 내릴 수 있어요.<span class='xh'>오답 하나씩 격파</span>'용액이 상했다'는 근거가 없어요. 용액이 문제였는지 확인하려면 그 영양소가 확실히 든 관을 따로 두어야 하죠. '(나)도 안 변했으니 못 믿는다'는 대조군의 역할을 거꾸로 이해한 거예요. 대조군은 변하지 않는 것이 정상이에요. '많아서 색이 사라졌다'는 검출 반응에 없는 현상이고, 이 반응은 데우는 조건이 필요하지 않아요. <b>비교 기준이 있어야 결과가 결론이 된다</b>는 점이 이 문제의 핵심이에요.",
    core: "대조군은 변하지 않는 게 정상. 견줄 관이 있어야 결론이 서요!",
  },
  {
    id: "g2u6e219",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "달걀흰자를 녹인 즙에 어떤 영양소가 들었는지 알아보려는데, 실수로 아이오딘 용액을 떨어뜨렸어요. 이때 일어날 일로 가장 알맞은 것은?",
    options: [
      "색이 거의 변하지 않아 알아보려던 것을 확인하지 못해요.",
      "보라색으로 변해 알아보려던 것을 확인할 수 있어요.",
      "청람색으로 변해 알아보려던 것을 확인할 수 있어요.",
      "선홍색으로 변해 알아보려던 것을 확인할 수 있어요.",
      "즙 속 영양소가 모두 사라져 다시 실험할 수 없어요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>달걀흰자를 녹인 즙에서 알아보려던 것은 단백질이에요. 그런데 아이오딘 용액은 <b>녹말이 있을 때만</b> 색이 바뀌는 용액이라, 녹말이 거의 없는 이 즙에서는 색이 그대로예요. 검출 용액은 저마다 짝이 정해져 있어서 아무 용액이나 넣는다고 결과가 나오지 않아요.<span class='xh'>오답 하나씩 격파</span>'보라색으로 변한다'는 뷰렛 용액을 넣었을 때의 결과예요. 용액을 바꿔 넣었으니 그 결과는 나오지 않죠. '청람색으로 변한다'는 아이오딘 용액의 짝인 녹말이 들어 있을 때의 이야기라 이 즙에는 맞지 않아요. '선홍색'은 수단 Ⅲ 용액과 지방의 짝이고요. '영양소가 모두 사라진다'는 검출 반응에 없는 현상이에요. 색이 안 바뀌었다고 <b>아무것도 없다</b>가 아니라 <b>그 용액이 찾는 것이 없다</b>로 읽어야 한답니다.",
    core: "용액마다 찾는 것이 달라요. 색이 안 바뀌면 그 용액의 짝이 없는 것!",
  },
  {
    id: "g2u6e221",
    lessonId: L1,
    type: "multi",
    diff: 3,
    prompt: "A·B·C에는 어떤 음식물 즙을, D에는 다른 음식물 즙을 담고 검출 용액을 넣었어요. 이 결과로부터 알 수 있는 것을 <b>모두</b> 고르세요.",
    figure: bodyTestTubesFig({
      tubes: [
        { label: "A", tint: "navy", reagent: "아이오딘 용액" },
        { label: "B", tint: "purple", reagent: "뷰렛 용액" },
        { label: "C", tint: "none", reagent: "수단 Ⅲ 용액" },
        { label: "D", tint: "red", reagent: "수단 Ⅲ 용액" },
      ],
    }),
    options: [
      "A·B·C에 담은 즙에는 녹말이 들어 있어요.",
      "A·B·C에 담은 즙에는 단백질도 들어 있어요.",
      "D에 담은 즙에는 지방이 들어 있어요.",
      "A·B·C에 담은 즙에는 지방이 들어 있어요.",
      "A·B·C에 담은 즙에는 단백질이 가장 많이 들어 있어요.",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>A는 아이오딘 용액에서 청람색이 되었으니 그 즙에는 녹말이 있어요. 같은 즙을 담은 B는 뷰렛 용액에서 보라색이 되었으니 단백질도 함께 들어 있죠. D는 다른 즙인데 수단 Ⅲ 용액에서 선홍색으로 물들었으니 지방이 있어요.<span class='xh'>오답 하나씩 격파</span>'A·B·C의 즙에 지방이 있다'는 C의 결과와 어긋나요. 같은 수단 Ⅲ 용액을 넣었는데 C는 색이 그대로였으니 그 즙에는 지방이 없다고 보아야 해요. '단백질이 가장 많다'는 판단도 할 수 없어요. 색 변화는 <b>있고 없음</b>만 알려 줄 뿐 양의 많고 적음은 말해 주지 않으니까요. 같은 용액을 넣은 <b>C와 D를 견주면</b> 두 즙의 차이가 곧바로 드러난답니다.",
    core: "같은 용액을 넣은 두 관을 견주기. 색은 있고 없음만 말해요!",
  },
  {
    id: "g2u6e227",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt: "그림은 사람의 소화 기관을 나타낸 거예요. A~E 가운데 <b>위</b>를 나타낸 것은?",
    figure: rasterFig(
      "digestive.webp",
      "사람의 소화 기관을 몸 앞에서 본 그림. 기관 이름은 적혀 있지 않고 A부터 E까지 기호만 지시선으로 이어져 있다",
      [
        { x: 41, y: 13, t: "A", lx: 16, ly: 10 },
        { x: 38, y: 51, t: "B", lx: 13, ly: 46 },
        { x: 60, y: 52, t: "C", lx: 86, ly: 46 },
        { x: 53, y: 61, t: "D", lx: 88, ly: 63 },
        { x: 52, y: 74, t: "E", lx: 86, ly: 82 },
      ],
    ),
    options: ["A", "B", "C", "D", "E"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>위는 식도를 지나온 음식물이 잠시 머무는 <b>주머니 모양</b>의 기관이라, 가늘고 긴 관 한가운데에 불룩하게 그려져요. 그림에서 식도가 내려와 닿는 불룩한 자리에 붙은 기호가 C예요.<span class='xh'>오답 하나씩 격파</span>A는 소화관이 시작되는 맨 위, 곧 입이에요. B는 그림 왼쪽에 넓게 자리 잡은 간이고, D는 위 아래쪽에 길게 누운 이자예요. 두 기관 모두 소화액을 만들어 보내지만 음식물이 그 안을 직접 지나가지는 않아요. E는 아래쪽에서 여러 번 구부러진 가는 관, 곧 작은창자예요. 구조도 문제는 <b>모양과 이어진 순서</b>를 함께 보는 것이 요령이에요. 이름이 적혀 있지 않아도 위아래로 이어지는 관을 따라가면 어느 기호가 무엇인지 좁혀진답니다.",
    core: "식도 아래 불룩한 주머니 = 위. 모양과 이어진 순서로 좁혀요!",
  },
  {
    id: "g2u6e231",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "표는 세 영양소의 소화가 일어나는 곳을 화살표로 나타낸 거예요. <b>단백질</b>의 소화가 처음 일어나는 곳은?",
    figure: enzymeGridFig({
      cols: ["탄수화물", "단백질", "지방"],
      rows: ["입", "위", "작은창자"],
      cells: [
        ["arrow", "", ""],
        ["", "arrow", ""],
        ["arrow", "arrow", "arrow"],
      ],
      note: "화살표는 그곳에서 분해가 일어난다는 뜻이에요",
    }),
    options: ["입", "위", "작은창자", "큰창자", "식도"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>단백질 칸을 위에서 아래로 훑어 보면 화살표가 처음 나타나는 줄이 <b>위</b>예요. 입 줄의 단백질 칸은 비어 있으니 입에서는 단백질 소화가 일어나지 않죠.<span class='xh'>오답 하나씩 격파</span>'입'은 탄수화물 칸에만 화살표가 있어요. '작은창자'에도 단백질 화살표가 있지만 위보다 아래 줄이라 처음은 아니에요. 여기서는 소화가 마무리되는 곳이죠. '큰창자'와 '식도'는 표에 줄 자체가 없어요. 음식물이 지나가기는 하지만 영양소를 분해하는 일은 맡지 않기 때문이에요. 표를 읽을 때는 <b>가로줄이 장소, 세로줄이 영양소</b>라는 것을 먼저 확인하고, 묻는 영양소의 세로줄만 위에서 아래로 따라 내려가면 실수가 줄어든답니다.",
    core: "세로줄을 위에서 아래로. 단백질의 첫 화살표는 위 줄이에요!",
  },
  {
    id: "g2u6e233",
    lessonId: L2,
    type: "mcq",
    diff: 3,
    prompt: "표는 소화액이 어떤 영양소에 작용하는지를 나타낸 것이고, <b>㉠</b>과 <b>㉡</b>은 아밀레이스와 트립신을 순서 없이 나타낸 거예요. 옳은 것만을 <보기>에서 있는 대로 고른 것은?",
    figure: enzymeGridFig({
      cols: ["녹말", "단백질", "지방"],
      rows: ["침", "위액", "이자액"],
      cells: [
        ["arrow", "", ""],
        ["", "arrow", ""],
        ["㉠", "㉡", "arrow"],
      ],
      note: "칸의 표시는 그 소화액이 그 영양소에 작용한다는 뜻이에요",
    }),
    bogi: [
      "㉠은 트립신이에요.",
      "㉡이 작용하는 영양소는 끝까지 나뉘면 아미노산이 돼요.",
      "㉠과 ㉡은 같은 소화액에 들어 있어요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ ✓ ㉡은 단백질 세로줄에 있으니 단백질에 작용해요. 단백질이 끝까지 잘게 나뉘면 아미노산이 되죠. ㄷ ✓ ㉠과 ㉡은 <b>이자액</b> 가로줄에 나란히 놓여 있어요. 두 효소가 같은 소화액에 함께 들어 있다는 뜻이죠.<span class='xh'>오답 하나씩 격파</span>ㄱ ✗ ㉠은 녹말 세로줄에 있어요. 두 효소 가운데 녹말에 작용하는 것은 아밀레이스이니 ㉠은 트립신이 아니라 아밀레이스예요. 트립신은 단백질 쪽인 ㉡이죠. 이런 문제는 <b>세로줄로 작용하는 영양소를 먼저 정하고</b>, 그다음 가로줄로 어느 소화액인지를 정하는 두 단계로 풀면 정확해요. 세로줄만 보고 이름을 맞바꾸면 통째로 뒤집힌답니다.",
    core: "세로줄로 영양소, 가로줄로 소화액. 두 단계로 정체를 좁혀요!",
  },
  {
    id: "g2u6e236",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "그림은 작은창자 안쪽 벽에 난 융털 하나를 크게 나타낸 거예요. <b>㉡</b>으로 들어가는 물질로 옳은 것은?",
    figure: rasterFig(
      "villus.webp",
      "작은창자 안쪽 벽에 난 융털 하나를 세로로 잘라 크게 그린 그림. 바깥은 한 줄로 늘어선 세포 층이고, 안쪽 가운데에는 위쪽 끝이 막힌 굵은 크림색 관이 곧게 서 있으며 그 둘레를 붉은 혈관과 파란 혈관이 그물처럼 감싸고 있다. 두 통로에 ㉠·㉡ 기호가 지시선으로 이어져 있다",
      [
        { x: 44, y: 70, t: "㉠", lx: 16, ly: 56 },
        { x: 50, y: 45, t: "㉡", lx: 84, ly: 30 },
      ],
      { base: "exam/g2u6" },
    ),
    options: [
      "포도당",
      "아미노산",
      "지방산과 모노글리세라이드",
      "무기염류",
      "요소",
    ],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>융털 안에는 두 갈래로 갈라져 도는 통로와 가운데를 곧게 지나는 통로가 함께 있어요. 가운데 통로 ㉡이 <b>암죽관</b>이고, 이곳으로는 지방이 잘게 나뉘어 생긴 <b>지방산과 모노글리세라이드</b>가 들어가요.<span class='xh'>오답 하나씩 격파</span>'포도당'과 '아미노산'은 물에 잘 녹는 물질이라 융털 벽 가까이 그물처럼 퍼진 ㉠, 곧 <b>모세혈관</b> 쪽으로 들어가요. '무기염류'도 같은 길을 따라가죠. '요소'는 음식물이 소화되어 생긴 영양소가 아니라 몸에서 생긴 노폐물이라 애초에 이곳에서 흡수되는 물질이 아니에요. 두 통로를 가르는 기준은 <b>물에 잘 녹는가</b>예요. 이 기준 하나만 잡아 두면 물질 이름이 바뀌어도 흔들리지 않는답니다.",
    core: "가운데 통로는 지방 소화 산물의 길. 기준은 물에 녹는가!",
  },
  {
    id: "g2u6e239",
    lessonId: L2,
    type: "mcq",
    diff: 3,
    prompt: "그림은 침이 하는 일을 알아보려고 꾸민 실험이에요. 시험관 <b>A</b>를 함께 둔 까닭으로 가장 알맞은 것은?",
    figure: rasterFig(
      "saliva-setup.webp",
      "따뜻한 물이 담긴 비커 안에 똑같이 생긴 시험관 두 개가 나란히 서 있는 실험 장치 그림. 두 시험관에 든 액체의 색과 높이는 서로 같다",
      [
        { x: 39, y: 20, t: "A" },
        { x: 60, y: 19, t: "B" },
      ],
      { base: "exam/g2u6", caption: "A에는 녹말 용액과 증류수를, B에는 녹말 용액과 침 희석액을 넣고 10분 담가 두었어요" },
    ),
    options: [
      "침을 넣지 않았을 때의 결과를 견주어 보려고",
      "확인 용액이 녹말과 반응하지 않는다는 것을 보이려고",
      "실험에 쓸 녹말 용액을 더 많이 마련해 두려고",
      "물의 온도를 35 ℃로 맞추기 쉽게 하려고",
      "침 희석액이 상하지 않았는지 확인하려고",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>두 관은 <b>침을 넣었는가</b>만 다르고 나머지 조건은 모두 같아요. A는 침 대신 증류수를 넣은 관이라, 침이 없을 때 녹말이 그대로 남아 있는지를 보여 주는 자리예요. B와 견주어야 두 관의 차이를 만든 것이 침이라고 말할 수 있죠. B에서 녹말이 사라졌다면 침 속 <b>아밀레이스</b>가 분해한 것이에요.<span class='xh'>오답 하나씩 격파</span>'확인 용액이 녹말과 반응하지 않는다'는 이 실험이 알아보려는 것이 아니에요. 용액이 녹말과 반응한다는 것은 이미 알고 시작하죠. '녹말 용액을 더 마련한다'와 '온도를 맞추기 쉽게 한다'는 실험 결과를 읽는 것과 아무 관계가 없어요. '침 희석액이 상했는지 확인한다'도 A에는 침이 아예 없으므로 확인할 수가 없죠. <b>다른 조건은 같게, 알아볼 조건 하나만 다르게</b> 두었는지 확인하는 것이 이런 실험을 읽는 첫걸음이에요.",
    core: "조건 하나만 다르게. 견줄 관이 있어야 원인을 말할 수 있어요!",
  },
  {
    id: "g2u6e243",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "쓸개즙에 대한 설명으로 옳은 것은?",
    options: [
      "뭉쳐 있던 지방이 잘게 나뉘어 겉면이 넓어지게 해요.",
      "이자에서 만들어져 위로 나와요.",
      "녹말을 엿당으로 바꾸는 일을 해요.",
      "단백질에 작용하는 소화효소가 들어 있어요.",
      "흡수가 끝난 영양소를 혈관 밖으로 밀어내요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>쓸개즙은 <b>소화효소가 아닌 소화액</b>이에요. 한 덩어리로 뭉쳐 있던 지방을 잘게 나누어 놓는데, 그러면 효소가 달라붙을 자리가 크게 늘어나 뒤이어 <b>라이페이스</b>가 하는 분해가 훨씬 수월해져요.<span class='xh'>오답 하나씩 격파</span>'이자에서 만들어져 위로 나온다'는 두 군데가 모두 틀렸어요. 쓸개즙은 간에서 만들어져 쓸개에 모였다가 작은창자로 나와요. '녹말을 엿당으로 바꾼다'는 아밀레이스가 하는 일이고, '단백질에 작용하는 소화효소가 들어 있다'는 쓸개즙에 효소가 없다는 사실과 어긋나요. '흡수가 끝난 영양소를 밀어낸다'는 소화액이 하는 일이 아니에요. 쓸개즙은 <b>자르는 도구가 아니라 펼쳐 주는 손</b>이라고 생각하면 헷갈리지 않아요.",
    core: "쓸개즙은 흩어 놓을 뿐, 자르지 않아요. 효소가 아니에요!",
  },
  {
    id: "g2u6e250",
    lessonId: L2,
    type: "multi",
    diff: 2,
    prompt: "그림은 지방이 소화되는 과정을 차례대로 나타낸 거예요. 이 과정에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: digestFlowFig({
      steps: ["지방", "작은 지방 방울", "지방산과 모노글리세라이드"],
      arrowLabels: ["㉠", "라이페이스"],
      caption: "화살표 위는 그 단계에 관여한 소화액이나 효소예요",
    }),
    options: [
      "㉠은 소화효소가 아니라 소화액이에요.",
      "이 과정에서 만들어진 물질은 주로 암죽관으로 들어가요.",
      "㉠은 위액에 들어 있어요.",
      "㉠이 지방을 최종 산물까지 분해해요.",
      "지방은 입에서부터 잘게 나뉘기 시작해요.",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>㉠ 단계에서는 지방이 <b>작은 방울로 나뉘기만</b> 하고 아직 최종 산물이 되지 않았어요. 그러니 ㉠은 효소가 아니라 소화액인 <b>쓸개즙</b>이고, 잘게 자르는 일은 다음 화살표의 <b>라이페이스</b>가 맡아요. 이렇게 만들어진 최종 산물은 융털 가운데 통로인 <b>암죽관</b>으로 들어가요.<span class='xh'>오답 하나씩 격파</span>'㉠이 위액에 있다'는 틀렸어요. 이 단계는 작은창자에서 일어나고 쓸개즙은 간에서 만들어져 쓸개에 모였다가 나오죠. '㉠이 최종 산물까지 분해한다'는 그림과 어긋나요. 쓸개즙 다음에 화살표가 하나 더 있다는 것이 곧 반증이에요. '입에서부터 나뉘기 시작한다'도 첫 칸이 아무 처리도 받지 않은 지방이라는 점과 맞지 않아요. 입에서 시작되는 것은 탄수화물의 소화랍니다.",
    core: "화살표가 하나 더 남았다면 아직 최종 산물이 아니에요!",
  },
  {
    id: "g2u6e254",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "그림은 사람의 심장을 갈라 안을 나타낸 거예요. 벽을 이루는 근육이 <b>가장 두꺼운</b> 방의 기호는?",
    figure: rasterFig(
      "heart.webp",
      "심장을 반으로 갈라 안을 보이게 그린 단면. 방 이름은 적혀 있지 않고 네 방에 기호만 붙어 있으며 방을 둘러싼 근육 벽의 두께가 자리마다 다르게 그려져 있다",
      [
        { x: 31, y: 41, t: "㉠" },
        { x: 34, y: 67, t: "㉡" },
        { x: 67, y: 38, t: "㉢" },
        { x: 68, y: 68, t: "㉣" },
      ],
    ),
    options: ["㉠", "㉡", "㉢", "㉣", "네 방의 두께가 모두 같아요"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 아래쪽 두 방을 견주어 보면 오른편 ㉣의 테두리가 훨씬 두껍게 그려져 있어요. <b>㉣이 좌심실</b>이에요. 혈액을 온몸 구석구석까지 밀어내야 해서 그만큼 센 힘이 필요하고, 그래서 근육 벽이 가장 두꺼워요.<span class='xh'>오답 하나씩 격파</span>㉠은 우심방, ㉢은 좌심방이에요. 두 심방은 돌아온 혈액을 받아 바로 아래 심실로 내려보내기만 하므로 벽이 얇아요. ㉡은 우심실로, 혈액을 허파까지만 보내면 되니 좌심실보다 짧은 거리라 벽도 덜 두껍죠. '네 방의 두께가 모두 같다'는 그림과 곧바로 어긋나요. 심장 문제는 <b>혈액을 얼마나 멀리 보내야 하는가</b>로 벽 두께를 설명할 수 있다는 점이 핵심이에요.",
    core: "온몸으로 내보내는 좌심실 벽이 가장 두꺼워요. 멀리 보낼수록 두툼!",
  },
  {
    id: "g2u6e259",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "그림은 세 가지 혈관을 잘라 본 단면이에요. <b>(다)</b>에 대한 설명으로 옳은 것은?",
    figure: rasterFig(
      "vessel-compare.webp",
      "혈관 세 가지를 잘라 본 단면을 나란히 그린 그림. 세 칸은 벽의 두께와 속공간의 넓이가 서로 다르게 그려져 있고, 오른쪽 칸 안쪽에만 접힌 구조가 보인다",
      [
        { x: 16, y: 8, t: "(가)" },
        { x: 50, y: 8, t: "(나)" },
        { x: 84, y: 8, t: "(다)" },
      ],
      { base: "body/figs/v2" },
    ),
    options: [
      "혈액이 거꾸로 흐르지 못하게 막는 구조가 있어요.",
      "벽이 세 혈관 가운데 가장 두꺼워요.",
      "벽이 한 겹이라 물질이 오가기 쉬워요.",
      "심장에서 막 나온 혈액이 지나가는 혈관이에요.",
      "속공간이 세 혈관 가운데 가장 좁아요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(다)의 안쪽에는 반달 모양으로 접힌 구조가 그려져 있어요. 이것이 <b>판막</b>이고, 혈액이 뒤로 밀리지 않도록 한 방향으로만 흐르게 붙잡아 줘요. 판막이 있는 (다)는 <b>정맥</b>이에요. 심장에서 멀어질수록 혈액을 밀어 주는 힘이 약해지기 때문에 이런 장치가 필요하죠.<span class='xh'>오답 하나씩 격파</span>'벽이 가장 두껍다'와 '심장에서 막 나온 혈액'은 (가), 곧 <b>동맥</b>의 특징이에요. 높은 압력을 견뎌야 하니 벽이 두툼하죠. '벽이 한 겹'은 (나) <b>모세혈관</b>의 특징으로, 세 혈관 가운데 가장 가늘고 얇게 그려져 있어요. '속공간이 가장 좁다'도 그림과 반대예요. 정맥의 안쪽 빈 공간이 가장 넓거든요. <b>벽 두께 · 속공간 · 접힌 구조</b> 세 가지를 나란히 견주는 것이 요령이에요.",
    core: "접힌 구조가 있으면 역류를 막는 혈관. 세 가지를 나란히 견줘요!",
  },
  {
    id: "g2u6e263",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "그림은 혈액을 이루는 성분을 따로 그린 거예요. <b>산소를 운반</b>하는 성분의 기호는?",
    figure: rasterFig(
      "blood-parts.webp",
      "혈액을 이루는 성분 네 가지를 크기 차이가 드러나게 나란히 그린 그림. 왼쪽부터 작은 조각 여러 개, 가운데가 옴폭한 붉은 원반, 안에 진한 덩어리가 든 가장 큰 둥근 것, 옅은 노란빛 액체 덩어리가 놓여 있다. 이름은 적혀 있지 않다",
      [
        { x: 10, y: 55, t: "(가)", lx: 10, ly: 22 },
        { x: 31, y: 52, t: "(나)", lx: 31, ly: 22 },
        { x: 58, y: 45, t: "(다)", lx: 58, ly: 12 },
        { x: 86, y: 52, t: "(라)", lx: 86, ly: 22 },
      ],
      { base: "exam/g2u6" },
    ),
    options: ["(가)", "(나)", "(다)", "(라)", "(가)와 (다)"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>산소를 나르는 성분은 <b>적혈구</b>이고, 가운데가 옴폭 들어간 둥근 원반 모양이에요. 그림에서 그런 모양은 (나)뿐이죠. 적혈구 안에는 산소와 잘 결합하는 <b>헤모글로빈</b>이 들어 있어 허파에서 받은 산소를 온몸으로 옮겨요.<span class='xh'>오답 하나씩 격파</span>(가)는 작고 불규칙한 조각들, 곧 <b>혈소판</b>이에요. 상처가 났을 때 혈액응고를 도와 피를 굳게 하죠. (다)는 안쪽에 진한 핵이 보이는 가장 큰 <b>백혈구</b>로, 몸에 들어온 병원체를 없애요. (라)는 세포가 아니라 노란빛 액체 덩어리인 <b>혈장</b>이고, 녹아 있는 물질을 실어 날라요. 이름이 적혀 있지 않을 때는 <b>모양과 크기, 안쪽 무늬</b>가 곧 단서랍니다.",
    core: "가운데가 옴폭한 원반 = 적혈구 = 산소 운반. 모양이 곧 단서예요!",
  },
  {
    id: "g2u6e271",
    lessonId: L3,
    type: "mcq",
    diff: 3,
    prompt: "그림은 혈액이 도는 두 갈래 길을 나타낸 거예요. <b>㉠~㉣</b>에 대한 설명으로 옳은 것만을 <보기>에서 있는 대로 고른 것은?",
    figure: circulationPathFig({ vesselSyms: ["㉠", "㉡", "㉢", "㉣"] }),
    bogi: [
      "㉠과 ㉢은 심장에서 나가는 혈액이 흐르는 혈관이에요.",
      "㉡을 흐르는 혈액은 곧바로 ㉢으로 이어져요.",
      "㉣을 흐르는 혈액은 조직세포를 막 지나온 뒤예요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>화살촉을 따라가면 ㉠은 심장에서 허파로 올라가는 <b>폐동맥</b>, ㉢은 심장에서 조직세포로 내려가는 <b>대동맥</b>이에요. 둘 다 심장에서 나가는 쪽이니 ㄱ은 옳아요. ㉡은 허파에서 돌아오는 <b>폐정맥</b>이고 그 혈액은 심장을 지나 곧바로 대동맥으로 나가니 ㄴ도 옳죠. ㉣은 조직세포를 지나 돌아오는 <b>대정맥</b>이니 ㄷ도 옳아요.<span class='xh'>오답 하나씩 격파</span>이 문제에서 흔히 흔들리는 지점은 <b>혈관 이름과 산소량을 같은 것으로 묶는 습관</b>이에요. 심장에서 나가는지 들어오는지는 <b>화살촉이 가리키는 방향</b>으로 정해지고, 산소가 많고 적음은 그 혈액이 <b>허파를 지났는지 조직세포를 지났는지</b>로 정해져요. 두 기준이 다르다는 것만 잡아 두면 네 혈관을 순서대로 이어 갈 수 있답니다.",
    core: "방향은 화살촉으로, 산소량은 지나온 곳으로. 기준이 달라요!",
  },
  {
    id: "g2u6e273",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "어떤 학생이 “정맥에는 언제나 산소가 적은 혈액이 흐른다”라고 말했어요. 이 말의 문제점을 옳게 짚은 것은?",
    options: [
      "허파를 막 지나온 혈액이 심장으로 들어갈 때도 정맥을 지나요.",
      "정맥에는 판막이 없으므로 산소를 잴 수 없어요.",
      "정맥은 심장에서 나가는 혈관이므로 처음부터 잘못된 말이에요.",
      "모세혈관에서는 산소가 전혀 오가지 않기 때문이에요.",
      "혈액은 산소를 운반하지 않으므로 비교 자체가 뜻이 없어요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>정맥은 <b>심장으로 들어오는 혈관</b>이라는 뜻이지 산소가 적다는 뜻이 아니에요. 허파에서 기체를 주고받고 온 혈액이 심장으로 돌아갈 때 지나는 <b>폐정맥</b>이 바로 그런 정맥으로, 그 혈액은 산소가 넉넉하죠. 그래서 언제나라는 말이 성립하지 않아요.<span class='xh'>오답 하나씩 격파</span>'정맥에 판막이 없다'는 사실과 어긋나요. 팔다리의 정맥에는 역류를 막는 판막이 있죠. '정맥은 심장에서 나가는 혈관'은 방향을 거꾸로 말한 것이라, 잘못을 바로잡는 근거로 쓸 수 없어요. '모세혈관에서 산소가 오가지 않는다'도 틀려요. 조직세포와 물질을 주고받는 곳이 바로 모세혈관이니까요. '혈액이 산소를 운반하지 않는다'는 아예 사실이 아니에요. <b>혈관 이름은 방향, 산소량은 지나온 곳</b>이라는 두 기준을 나누어 두면 흔들리지 않아요.",
    core: "정맥은 방향의 이름. 허파에서 오는 정맥엔 산소가 많아요!",
  },
  {
    id: "g2u6e274",
    lessonId: L3,
    type: "multi",
    diff: 3,
    prompt: "그림에서 <b>(가)</b>와 <b>(나)</b>는 점선으로 묶은 두 순환을 나타낸 거예요. 이에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: circulationPathFig({ loopSyms: ["(가)", "(나)"] }),
    options: [
      "(가)를 도는 동안 혈액은 산소를 얻어요.",
      "(나)를 도는 동안 혈액은 이산화 탄소를 받아요.",
      "(가)를 나온 혈액은 심장을 거쳐 (나)로 들어가요.",
      "(가)를 돌고 나온 혈액은 곧바로 (가)로 다시 들어가요.",
      "(나)는 심장을 거치지 않고 따로 도는 길이에요.",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>(가)는 심장과 허파를 묶은 위쪽 고리, 곧 <b>허파순환</b>이에요. 허파에서 기체를 주고받으며 혈액이 산소를 얻죠. (나)는 심장과 조직세포를 묶은 <b>온몸순환</b>으로, 조직세포가 내놓은 이산화 탄소를 혈액이 받아요. 허파순환을 마친 혈액은 심장을 한 번 지난 뒤 온몸순환으로 나가요.<span class='xh'>오답 하나씩 격파</span>'(가)를 돌고 나와 곧바로 (가)로 다시 들어간다'는 그림의 이어짐과 어긋나요. 허파를 다녀온 혈액은 심장을 거쳐 온몸순환으로 나가야 조직세포에 산소를 건넬 수 있어요. '(나)가 심장을 거치지 않는다'도 반대예요. 온몸순환 역시 심장에서 시작해 심장으로 돌아오죠. <b>점선 고리가 어느 기관을 묶고 있는지</b>부터 읽는 것이 순서랍니다.",
    core: "점선이 묶은 기관부터 읽어요. 두 고리는 심장을 사이에 두고 이어져요!",
  },
  {
    id: "g2u6e277",
    lessonId: L3,
    type: "mcq",
    diff: 3,
    prompt: "그림과 같은 심장에서 (가)와 (나)를 가르는 벽에 구멍이 생겨 두 방의 혈액이 섞인다면, 나타날 수 있는 변화로 가장 알맞은 것은?",
    figure: rasterFig(
      "heart.webp",
      "심장을 반으로 갈라 안을 보이게 그린 단면. 아래쪽 두 방에만 기호가 붙어 있고 두 방을 둘러싼 근육 벽의 두께가 서로 다르게 그려져 있다",
      [
        { x: 34, y: 67, t: "(나)" },
        { x: 68, y: 68, t: "(가)" },
      ],
    ),
    options: [
      "온몸으로 나가는 혈액의 산소가 줄어들어요.",
      "허파로 가는 혈액이 아예 흐르지 못하게 돼요.",
      "심장이 뛰는 것을 멈추고 혈액이 고이게 돼요.",
      "온몸으로 나가는 혈액의 산소가 오히려 늘어나요.",
      "허파로 들어가는 혈액의 산소가 오히려 줄어들어요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>아래 두 방 가운데 벽이 두꺼운 (가)가 <b>좌심실</b>로 허파를 다녀와 산소가 많은 혈액이, (나)인 <b>우심실</b>에는 온몸을 돌고 와 산소가 적은 혈액이 들어 있어요. 벽에 구멍이 생겨 둘이 섞이면 좌심실에서 나가는 혈액의 산소가 섞이기 전보다 <b>줄어들어요</b>. 그러면 조직세포에 건네줄 산소도 모자라게 되죠.<span class='xh'>오답 하나씩 격파</span>'허파로 가는 혈액이 아예 못 흐른다'는 지나쳐요. 길이 막힌 것이 아니라 섞였을 뿐이에요. '심장이 멈춘다'도 마찬가지로 근거가 없어요. '온몸으로 나가는 산소가 오히려 늘어난다'는 섞임의 뜻과 정반대죠. 산소가 적은 쪽이 들어왔으니 늘어날 수는 없어요. '허파로 들어가는 혈액의 산소가 줄어든다'도 반대예요. 산소가 많은 쪽이 섞여 들어가니 오히려 늘죠. 심장의 좌우가 <b>나뉘어 있는 까닭</b>을 묻는 문제랍니다.",
    core: "좌우가 나뉜 까닭 = 섞이지 않게. 섞이면 산소가 줄어요!",
  },
  {
    id: "g2u6e281",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "그림은 사람의 호흡 기관을 나타낸 거예요. 들이마신 공기가 <b>가장 나중에</b> 지나는 곳의 기호는?",
    figure: rasterFig(
      "respiratory.webp",
      "사람의 호흡 기관을 몸 앞에서 본 그림. 부위 이름은 적혀 있지 않고 A부터 D까지 기호만 지시선으로 이어져 있다",
      [
        { x: 34, y: 14, t: "A", lx: 14, ly: 12 },
        { x: 49, y: 40, t: "B", lx: 84, ly: 30 },
        { x: 45, y: 54, t: "C", lx: 15, ly: 52 },
        { x: 50, y: 84, t: "D", lx: 86, ly: 88 },
      ],
    ),
    options: ["A", "B", "C", "D", "네 곳을 동시에 지나요"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>공기는 얼굴 쪽에서 들어와 아래로 내려가며 점점 가는 길로 갈라져요. 그림에서 A는 <b>코</b>, B는 그 아래로 곧게 뻗은 굵은 관인 <b>숨관</b>, C는 숨관이 두 갈래로 갈라진 <b>숨관가지</b>예요. 넷 가운데 공기가 가장 나중에 지나는 곳은 C죠.<span class='xh'>오답 하나씩 격파</span>코는 공기가 가장 먼저 들어오는 곳이라 순서로는 첫 번째, 숨관은 그다음이에요. D는 가슴 아래를 가로지르는 <b>가로막</b>으로, 숨을 쉬게 만드는 운동을 맡을 뿐 공기가 그 안을 지나가는 통로가 아니에요. '네 곳을 동시에 지난다'도 그림의 이어짐과 맞지 않아요. 호흡 기관 그림은 위에서 아래로, 굵은 관에서 가는 관으로 따라 내려가며 읽는 것이 순서랍니다.",
    core: "위에서 아래로, 굵은 관에서 가는 관으로. 근육은 통로가 아니에요!",
  },
  {
    id: "g2u6e285",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "그림은 숨을 쉴 때 몸에서 일어나는 일을 알아보려고 만든 모형이고, <b>C는 가슴우리에 해당해요.</b> 손으로 D를 아래로 당긴 지금, 이 모형에 대한 설명으로 옳은 것은?",
    figure: breathModelFig({ pull: true, syms: ["A", "B", "C", "D"], hand: true }),
    options: [
      "D를 당겨 C 안이 넓어지자 B가 부풀었어요.",
      "B가 스스로 부풀어 D를 아래로 끌어내렸어요.",
      "D를 당기면 C 안의 압력이 바깥보다 높아져요.",
      "A를 막고 D를 당겨도 B는 똑같이 부풀어요.",
      "D를 위로 밀어 올려도 B는 그대로 부푼 채예요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>손이 <b>가로막에 해당하는 D</b>를 아래로 당기면 가슴우리에 해당하는 C 안의 공간이 넓어져요. 넓어진 만큼 안쪽 압력이 낮아지고, 바깥 공기가 <b>숨관에 해당하는 A</b>를 따라 밀려 들어와 <b>허파에 해당하는 B</b>가 부풀죠. 순서가 <b>당김 → 넓어짐 → 압력 낮아짐 → 공기 들어옴</b>이라는 점이 이 모형의 전부예요.<span class='xh'>오답 하나씩 격파</span>'B가 스스로 부풀어 D를 끌어내렸다'는 순서를 거꾸로 본 거예요. 실제 허파도 스스로 부풀 수 없고 가슴우리의 공간 변화를 따라갈 뿐이죠. '압력이 바깥보다 높아진다'는 넓어지면 낮아진다는 관계와 반대예요. 'A를 막아도 똑같이 부푼다'는 공기가 들어올 길이 막히면 B가 부풀 수 없다는 점을 놓쳤어요. 'D를 밀어 올려도 그대로'는 공간이 좁아지면 B에서 공기가 빠져나간다는 사실과 어긋나죠.",
    core: "당김 → 넓어짐 → 압력 낮아짐 → 공기 들어옴. 순서가 전부예요!",
  },
  {
    id: "g2u6e292",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "그림은 숨을 쉴 때 가슴 속 모습을 견주어 나타낸 거예요. 옳은 것만을 <보기>에서 있는 대로 고른 것은?",
    figure: rasterPair(
      { file: "breath-inhale.webp", label: "(가)" },
      { file: "breath-exhale.webp", label: "(나)" },
      "숨을 쉴 때 가슴 속 모습을 견주어 그린 두 그림. (가)는 갈비뼈가 위로 올라가 벌어져 있고 아래를 가로지르는 근육이 평평하게 내려와 있으며 허파가 크다. (나)는 갈비뼈가 아래로 내려와 모여 있고 아래 근육이 위로 볼록하게 솟아 있으며 허파가 작다",
    ),
    bogi: [
      "(가)에서는 가슴 속 공간이 (나)에서보다 넓어요.",
      "(나)에서는 가로막이 위로 올라가 있어요.",
      "(가)에서는 가슴 속 압력이 (나)에서보다 높아요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ ✓ (가)는 갈비뼈가 위로 올라가고 가로막이 아래로 내려가 있어 <b>가슴우리</b>의 공간이 넓어요. (나)는 그 반대라 좁죠. ㄴ ✓ (나)에서 아래쪽 붉은 곡선이 위로 볼록하게 솟아 있어요. 가로막이 올라간 모습이에요.<span class='xh'>오답 하나씩 격파</span>ㄷ ✗ 가슴우리가 넓어지면 그 안의 압력은 <b>낮아져요</b>. 넓은 (가)의 압력이 좁은 (나)보다 높다는 진술은 거꾸로 된 것이죠. 이 관계를 뒤집어 외우면 공기가 어느 쪽으로 움직이는지도 함께 뒤집혀요. 그림에는 공기의 방향이 그려져 있지 않으므로, <b>갈비뼈와 가로막의 자리 → 공간의 넓이 → 압력</b> 순서로 스스로 이어 가야 답이 나온답니다.",
    core: "넓어지면 압력은 낮아져요. 자리 → 넓이 → 압력 순서로!",
  },
  {
    id: "g2u6e297",
    lessonId: L4,
    type: "mcq",
    diff: 3,
    prompt: "그림은 허파꽈리와 그것을 감싼 모세혈관 사이에서 기체가 오가는 모습이에요. <b>㉠</b>과 <b>㉡</b>은 산소와 이산화 탄소를 순서 없이 나타낸 것이에요. 이에 대한 설명으로 옳은 것은?",
    figure: alveoliQuizFig({ symA: "㉠", symB: "㉡", showArrows: true }),
    options: [
      "㉠은 산소이고, 들이마신 공기를 따라 들어와 혈액으로 옮겨 가요.",
      "㉡은 산소이고, 혈액에서 허파꽈리 쪽으로 옮겨 가요.",
      "㉠과 ㉡은 모두 혈액에서 허파꽈리 쪽으로 옮겨 가요.",
      "㉠은 이산화 탄소이고, 날숨에 섞여 몸 밖으로 나가요.",
      "㉠과 ㉡은 서로 자리를 바꾸지 않고 제자리에 머물러요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>㉠은 허파꽈리 쪽에서 모세혈관 쪽으로 화살표를 따라 옮겨 가요. 들이마신 공기가 도착한 허파꽈리에 많고 혈액에는 적은 기체, 곧 <b>산소</b>가 이 방향으로 움직이죠. 그래서 ㉠은 산소이고 혈액으로 옮겨 간다는 설명이 맞아요.<span class='xh'>오답 하나씩 격파</span>'㉡이 산소'라는 설명은 방향과 어긋나요. ㉡은 혈액 쪽에서 허파꽈리 쪽으로 가는데, 그 방향으로 움직이는 기체는 이산화 탄소예요. '둘 다 혈액에서 허파꽈리로 간다'는 두 화살표가 서로 반대를 향한다는 그림과 맞지 않아요. '㉠이 이산화 탄소'도 마찬가지로 방향이 뒤집힌 설명이죠. '제자리에 머문다'는 화살표가 그려진 까닭 자체를 무시한 거예요. 두 기체 모두 많은 쪽에서 적은 쪽으로 <b>확산</b>해 옮겨 가죠. 기호가 벽 양쪽에 하나씩 놓여 있으니 한쪽만 보고 정하면 뒤집힌답니다.",
    core: "양쪽에 놓인 기호는 화살표 방향으로 정체를 정해요!",
  },
  {
    id: "g2u6e299",
    lessonId: L4,
    type: "multi",
    diff: 3,
    prompt: "그림에서 확인할 수 있는 것 가운데, 허파꽈리가 기체를 주고받기에 알맞은 까닭이 되는 것을 <b>모두</b> 고르세요.",
    figure: alveoliQuizFig({ showWall: true }),
    options: [
      "작은 주머니가 여럿 모여 있어 맞닿는 겉면이 넓어요.",
      "주머니와 혈관 사이를 가르는 것이 한 겹의 얇은 벽뿐이에요.",
      "주머니와 혈관을 가르는 벽이 두꺼워 기체를 오래 붙잡아 둬요.",
      "주머니 안에서 기체를 새로 만들어 내요.",
      "주머니마다 근육이 있어 기체를 힘껏 밀어내요.",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 주머니가 여러 개 붙어 있는 모습이 보여요. 이렇게 작은 주머니가 모이면 같은 부피에서도 <b>기체가 닿을 수 있는 겉면</b>이 넓어져요. 또 주머니를 감싼 <b>모세혈관</b>과의 사이에 '한 겹'이라 표시된 얇은 벽 하나만 있는 것도 그림에서 곧바로 읽을 수 있죠. 넓은 겉면과 짧은 거리가 교환을 빠르게 만들어요.<span class='xh'>오답 하나씩 격파</span>'벽이 두껍다'는 그림의 한 겹 표시와 정반대예요. 벽이 얇아야 기체가 짧은 거리를 지나 빨리 건너가죠. '기체를 새로 만든다'는 사실이 아니에요. 허파꽈리는 이미 있는 기체가 <b>많은 쪽에서 적은 쪽으로</b> 옮겨 가도록 자리를 내줄 뿐이에요. '근육이 힘껏 밀어낸다'도 틀려요. 기체가 옮겨 가는 데에는 미는 힘이 따로 들지 않는답니다.",
    core: "넓게 · 얇게 · 가깝게. 그림의 한 겹 표시가 근거예요!",
  },
  {
    id: "g2u6e303",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "표는 들숨과 날숨에 들어 있는 기체의 양을 견주어 나타낸 거예요. 이 표를 옳게 해석한 것은?",
    figure: gasTableFig(
      ["기체", "들숨", "날숨"],
      [
        ["산소", "많음", "적음"],
        ["이산화 탄소", "적음", "많음"],
        ["질소", "비슷", "비슷"],
      ],
    ),
    options: [
      "몸속에서 산소가 쓰이고 이산화 탄소가 생겼음을 알 수 있어요.",
      "날숨에는 산소가 전혀 들어 있지 않아요.",
      "질소가 몸속에서 이산화 탄소로 바뀌었어요.",
      "들숨에는 이산화 탄소가 전혀 들어 있지 않아요.",
      "몸속에서 산소가 새로 만들어졌음을 알 수 있어요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>들어올 때보다 나갈 때 산소가 줄고 이산화 탄소가 늘었어요. 몸속에서 산소가 <b>쓰이고</b> 그 대신 이산화 탄소가 <b>생겼다</b>는 뜻이죠. 질소가 들고 날 때 비슷한 것은, 몸이 질소는 쓰지도 만들지도 않는다는 사실과 잘 맞아요.<span class='xh'>오답 하나씩 격파</span>'날숨에 산소가 전혀 없다'는 표를 지나치게 읽은 거예요. 표는 적어졌다고만 했지 없어졌다고 하지 않았어요. '들숨에 이산화 탄소가 전혀 없다'도 같은 잘못이에요. '질소가 이산화 탄소로 바뀌었다'는 질소의 양이 거의 그대로라는 사실과 어긋나죠. '산소가 새로 만들어졌다'는 줄어든 방향과 정반대예요. 자료 문제는 <b>줄었다·늘었다</b>를 <b>없다·다 바뀌었다</b>로 부풀리지 않는 것이 중요하답니다.",
    core: "줄었다 ≠ 없다. 산소는 쓰이고 이산화 탄소는 생겨요!",
  },
  {
    id: "g2u6e310",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "그림은 사람의 배설 기관을 나타낸 거예요. 옳은 것만을 <보기>에서 있는 대로 고른 것은?",
    figure: rasterFig(
      "urinary.webp",
      "사람의 배설 기관을 몸 앞에서 본 그림. 기관 이름은 적혀 있지 않고 기호만 지시선으로 이어져 있으며, 오른쪽 기관은 반으로 갈라 속을 보이게 그렸다",
      [
        { x: 31, y: 29, t: "㉠", lx: 12, ly: 25 },
        { x: 64, y: 48, t: "㉡", lx: 87, ly: 52 },
        { x: 50, y: 78, t: "㉢", lx: 18, ly: 80 },
        { x: 50, y: 89, t: "㉣", lx: 82, ly: 90 },
      ],
    ),
    bogi: [
      "㉡에서 오줌이 만들어져요.",
      "㉢은 오줌을 잠시 모아 두는 곳이에요.",
      "오줌은 ㉣ → ㉢ → ㉡ 차례로 이동해요.",
    ],
    options: ["ㄱ", "ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ ✓ ㉢은 아래쪽에 놓인 주머니 모양의 <b>방광</b>이라 만들어진 오줌을 잠시 모아 두는 곳이에요.<span class='xh'>오답 하나씩 격파</span>ㄱ ✗ ㉡은 아래로 내려오는 가느다란 <b>오줌관</b>이라 오줌을 옮기는 길이지 만드는 곳이 아니에요. 오줌을 만드는 곳은 몸통 위쪽 양옆에 하나씩 놓인 붉은 강낭콩 모양의 <b>콩팥</b>, 곧 ㉠이죠. ㄷ ✗ 차례가 거꾸로예요. 오줌은 콩팥에서 시작해 아래로 내려가며 몸 밖으로 나가므로 ㉠ → ㉡ → ㉢ → ㉣ 차례가 맞아요. ㉣은 마지막에 몸 밖으로 이어지는 짧은 <b>요도</b>라 시작점이 될 수 없죠. 이런 그림은 <b>만드는 곳 · 옮기는 길 · 모아 두는 곳 · 내보내는 길</b> 네 가지 구실로 나누어 읽으면 기호가 없어도 순서가 보인답니다.",
    core: "만들고 · 옮기고 · 모으고 · 내보내요. 위에서 아래로 한 방향!",
  },
  {
    id: "g2u6e313",
    lessonId: L5,
    type: "mcq",
    diff: 3,
    prompt: "그림은 콩팥 속 아주 작은 처리 단위를 나타낸 것이고, <b>(가)~(다)</b>는 여과·재흡수·분비를 순서 없이 나타낸 거예요. 이에 대한 설명으로 옳은 것은?",
    figure: rasterArrows(
      "nephron-process.webp",
      "콩팥 속 처리 단위를 단순하게 그린 그림. 실뭉치처럼 감긴 혈관과 그것을 감싼 주머니, 거기서 이어진 곧은 관, 관을 감싸고 도는 다른 혈관이 그려져 있고 물질이 이동하는 화살표 세 개에 기호가 붙어 있다",
      [
        { x1: 23, y1: 62, x2: 31, y2: 68, c: "#37A446", t: "(가)", tx: 17, ty: 79 },
        { x1: 60, y1: 63, x2: 60, y2: 50, c: "#3182F6", t: "(나)", tx: 70, ty: 56 },
        { x1: 44, y1: 46, x2: 44, y2: 60, c: "#B4690E", t: "(다)", tx: 34, ty: 53 },
      ],
    ),
    options: [
      "(가)는 여과이며, 크기가 작은 물질이 혈액에서 빠져나가요.",
      "(나)는 분비이며, 노폐물이 혈관에서 관 쪽으로 옮겨 가요.",
      "(다)는 재흡수이며, 포도당이 혈관으로 되돌아가요.",
      "(가)에서는 혈구와 큰 단백질도 함께 빠져나가요.",
      "(나)와 (다)는 물질이 같은 방향으로 옮겨 가요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>(가)는 실뭉치처럼 얽힌 혈관인 <b>토리</b>에서 그 둘레를 감싼 <b>보먼주머니</b> 쪽으로 향하는 화살표예요. 이렇게 혈액에서 크기가 작은 물질만 빠져나가는 과정이 여과죠. 크기로 거르는 단계라 큰 것은 혈액에 남아요.<span class='xh'>오답 하나씩 격파</span>(나)는 <b>세뇨관</b>에서 그 곁의 모세혈관 쪽으로 향하니 되돌려 보내는 과정, 곧 재흡수예요. 그러니 (나)를 분비라고 한 설명은 방향이 반대죠. (다)는 모세혈관에서 세뇨관 쪽으로 향하니 분비이고, 재흡수라고 한 설명도 어긋나요. '(가)에서 혈구와 큰 단백질도 빠져나간다'는 크기로 거른다는 성격과 맞지 않아요. '(나)와 (다)가 같은 방향'이라는 설명도 두 화살표가 서로 반대를 향한다는 그림과 어긋나죠. <b>화살표의 출발점과 도착점</b>만 정확히 읽으면 세 과정이 저절로 갈린답니다.",
    core: "출발점과 도착점으로 세 과정을 갈라요. 여과는 크기로 거르기!",
  },
  {
    id: "g2u6e315",
    lessonId: L5,
    type: "multi",
    diff: 2,
    prompt: "그림은 콩팥 속 처리 단위의 생김새예요. <b>그림에서 확인할 수 있는 것</b>을 <b>모두</b> 고르세요.",
    figure: rasterFig(
      "nephron.webp",
      "콩팥 속 처리 단위 하나를 자세히 그린 그림. 실뭉치처럼 감긴 혈관과 그것을 감싼 주머니가 맞닿아 있고, 거기서 나온 구불구불한 관이 한 방향으로 길게 이어지며, 그 관 둘레를 다른 혈관이 그물처럼 따라붙어 있다. 이름도 화살표도 적혀 있지 않다",
      [],
    ),
    options: [
      "토리와 그것을 감싼 보먼주머니가 서로 맞닿아 있어요.",
      "보먼주머니에서 나온 세뇨관은 되돌아오지 않고 한 방향으로만 이어져요.",
      "세뇨관의 둘레를 모세혈관이 나란히 따라 붙어 있어요.",
      "보먼주머니 안이 여러 칸으로 나뉘어 있어요.",
      "세뇨관의 끝이 다시 보먼주머니로 이어져 고리를 이루어요.",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>그림 왼쪽 위를 보면 실뭉치처럼 감긴 <b>토리</b>와 그 둘레를 감싼 <b>보먼주머니</b>가 맞닿아 있어요. 거기서 나온 <b>세뇨관</b>은 구불구불 오른쪽 아래로 내려가며 한 방향으로만 이어지고, 그 곁을 <b>모세혈관</b>이 나란히 따라붙죠. 이 한 벌이 <b>콩팥단위</b>이고, 세 가지 모두 눈으로 따라가면 확인할 수 있어요.<span class='xh'>오답 하나씩 격파</span>'주머니 안이 여러 칸으로 나뉘어 있다'는 그림에 없는 이야기예요. 보먼주머니 안에는 토리 하나가 들어 있을 뿐 칸막이가 그려져 있지 않죠. '관의 끝이 다시 주머니로 이어져 고리를 이룬다'도 그림과 어긋나요. 관은 아래로 내려가 밖으로 빠져나가며 끝나요. 그림 문제는 <b>선을 눈으로 끝까지 따라가 보는 것</b>이 가장 확실한 확인이랍니다.",
    core: "선을 눈으로 끝까지 따라가 보기. 관은 한 방향으로만 이어져요!",
  },
  {
    id: "g2u6e317",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "표는 어떤 사람의 여과액과 오줌에 들어 있는 물질을 견주어 나타낸 거예요. 이 표를 옳게 해석한 것은?",
    figure: urineTableFig(
      ["물질", "여과액", "오줌"],
      [
        ["물", "많음", "적음"],
        ["무기염류", "있음", "있음"],
        ["요소", "있음", "많음"],
      ],
    ),
    options: [
      "여과된 물의 상당량이 다시 혈액으로 돌아갔어요.",
      "요소가 세뇨관에서 모두 혈액으로 돌아갔어요.",
      "무기염류는 여과되지 않는 물질이에요.",
      "물이 콩팥에서 새로 만들어졌어요.",
      "여과액과 오줌은 성분이 완전히 같아요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>물은 여과액에서 많았는데 오줌에서는 적어졌어요. 사라진 것이 아니라 세뇨관을 지나는 동안 <b>상당량이 재흡수되어 혈액으로 돌아갔다</b>는 뜻이에요. 몸에 필요한 물을 그대로 버리지 않는 구조죠.<span class='xh'>오답 하나씩 격파</span>'요소가 모두 재흡수되었다'는 표와 정반대예요. 요소는 오줌에서 오히려 많아졌으니 대부분 남아서 나간 것이죠. '무기염류가 여과되지 않는다'도 어긋나요. 여과액 칸에 있음이라고 적혀 있으니 여과는 되었어요. '물이 새로 만들어졌다'는 줄어든 방향과 반대이고, '성분이 완전히 같다'는 세 줄의 값이 서로 다르다는 사실과 맞지 않아요. 이런 표는 <b>여과액 칸에서 오줌 칸으로 값이 어떻게 달라졌는가</b>를 물질마다 따로 읽는 것이 요령이에요.",
    core: "여과액 → 오줌으로 값이 준 물질은 되돌아간 것. 줄마다 따로 읽어요!",
  },
  {
    id: "g2u6e320",
    lessonId: L5,
    type: "mcq",
    diff: 3,
    prompt: "표는 어떤 사람의 여과액과 오줌을 살펴본 결과예요. 이 결과로 볼 때 제대로 이루어지지 <u>못한</u> 과정은?",
    figure: urineTableFig(
      ["물질", "여과액", "오줌"],
      [
        ["포도당", "있음", "있음"],
        ["혈구", "없음", "없음"],
      ],
    ),
    options: [
      "필요한 물질을 되돌려 보내는 과정",
      "혈액에서 처음 걸러 내는 과정",
      "남은 노폐물을 더 내보내는 과정",
      "오줌을 방광으로 옮기는 과정",
      "오줌을 몸 밖으로 내보내는 과정",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>포도당은 크기가 작아 여과액에는 들어 있는 것이 정상이에요. 다만 몸에 꼭 필요한 영양소라 세뇨관을 지나는 동안 <b>남김없이 재흡수</b>되어야 해요. 그런데 오줌에도 남아 있으니 되돌려 보내는 과정, 곧 <b>재흡수</b>가 제대로 이루어지지 못한 것이죠.<span class='xh'>오답 하나씩 격파</span>'처음 걸러 내는 과정'인 <b>여과</b>는 오히려 정상이에요. 덩치가 큰 혈구가 여과액에도 오줌에도 없다는 것이 크기로 잘 걸러졌다는 증거니까요. '더 내보내는 과정'인 <b>분비</b>는 남은 노폐물을 세뇨관 쪽으로 보내는 일이라 포도당이 남은 까닭을 설명하지 못해요. '방광으로 옮기기'와 '몸 밖으로 내보내기'는 오줌이 만들어진 뒤의 이동이라 성분을 바꾸지 않아요. 이런 문제는 <b>어느 단계에서 걸러지고 어느 단계에서 되돌아가는지</b>를 물질마다 나누어 따져야 풀린답니다.",
    core: "포도당은 걸러진 뒤 전부 되돌아가야 정상. 단계를 나누어 따져요!",
  },
  {
    id: "g2u6e321",
    lessonId: L5,
    type: "mcq",
    diff: 3,
    prompt: "표는 어떤 사람의 건강 검진 결과 가운데 두 줄이에요. 이 결과에 대한 판단으로 가장 알맞은 것은?",
    figure: checkupFig([
      ["오줌 속 단백질", "나옴", "나오지 않음"],
      ["오줌 속 무기염류", "나옴", "나옴"],
    ]),
    options: [
      "크기로 걸러 내는 단계가 제대로 이루어지지 않았을 수 있어요.",
      "두 줄 모두 정상 범위 안이므로 살펴볼 것이 없어요.",
      "무기염류가 나온 것이 이상하므로 그 줄을 살펴야 해요.",
      "오줌을 몸 밖으로 내보내는 길이 막혔다고 볼 수 있어요.",
      "단백질이 오줌에 나오는 것은 누구에게나 정상이에요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>두 줄 가운데 결과가 정상 범위와 어긋난 것은 첫 줄이에요. 단백질은 덩치가 커서 <b>여과</b> 단계에서 걸러지지 않고 혈액에 남아야 하는데 오줌에 나왔다는 것은 그 단계가 제대로 되지 않았을 수 있다는 뜻이죠.<span class='xh'>오답 하나씩 격파</span>'두 줄 모두 정상'은 첫 줄의 결과와 정상 범위가 다르다는 점을 놓친 거예요. '무기염류가 나온 것이 이상하다'도 틀려요. 그 줄은 결과와 정상 범위가 같으니 살펴볼 까닭이 없죠. 무기염류는 몸이 필요한 만큼만 되돌리고 남은 것은 내보내므로 오줌에 있는 것이 자연스러워요. '내보내는 길이 막혔다'는 성분이 아니라 양의 문제라 이 표로는 알 수 없어요. '누구에게나 정상'은 정상 범위 칸과 곧바로 어긋나요. 검사 결과는 <b>결과 칸과 정상 범위 칸을 줄마다 짝지어</b> 읽는 것이 먼저랍니다.",
    core: "결과 칸과 정상 범위 칸을 줄마다 짝지어요. 큰 단백질은 안 걸러져요!",
  },
  {
    id: "g2u6e324",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "어떤 학생이 “똥과 오줌은 모두 몸에서 생긴 노폐물을 내보내는 것”이라고 말했어요. 이 말의 문제점을 옳게 짚은 것은?",
    options: [
      "똥은 소화되지 않고 남은 찌꺼기라서 몸에서 생긴 노폐물과는 달라요.",
      "오줌도 사실은 소화되지 않은 찌꺼기라서 둘은 같은 것이에요.",
      "똥은 콩팥에서 만들어지므로 오줌과 만들어지는 곳이 같아요.",
      "오줌에는 노폐물이 들어 있지 않으므로 비교할 수 없어요.",
      "똥과 오줌은 모두 허파를 거쳐 몸 밖으로 나가요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>똥은 음식물 가운데 소화되지 않아 흡수되지 못한 찌꺼기가 소화관을 그대로 지나 나가는 것이라 <b>배출</b>이라고 해요. 몸속 세포가 활동하면서 만들어 낸 물질이 아니죠. 반면 오줌에 든 요소는 세포의 물질대사에서 생겨 혈액을 타고 콩팥까지 온 노폐물이라, 이것을 내보내는 것이 <b>배설</b>이에요.<span class='xh'>오답 하나씩 격파</span>'오줌도 찌꺼기라 같다'는 배설과 배출을 거꾸로 묶은 거예요. '똥이 콩팥에서 만들어진다'는 사실이 아니에요. 똥은 소화관의 끝에서 만들어지죠. '오줌에 노폐물이 없다'는 오줌의 성분과 어긋나요. '둘 다 허파를 거친다'도 틀려요. 허파로 나가는 것은 기체 형태의 물질이에요. <b>어디에서 생겼는가</b>가 두 낱말을 가르는 기준이랍니다.",
    core: "몸속에서 생겼는가, 그냥 지나갔는가. 그 기준으로 갈려요!",
  },
  {
    id: "g2u6e334",
    lessonId: L6,
    type: "mcq",
    diff: 1,
    prompt: "그림은 조직세포에서 일어나는 일을 나타낸 거예요. <b>㉠</b> 자리에 들어갈 물질로 옳은 것은?",
    figure: cellRespQuizFig({
      inItems: ["영양소", "산소"],
      outItems: ["이산화 탄소", "물"],
      hide: "out",
      symOut: "㉠",
    }),
    options: [
      "이산화 탄소와 물",
      "영양소와 산소",
      "요소와 무기염류",
      "녹말과 단백질",
      "적혈구와 혈소판",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>왼쪽 칸에 영양소와 산소가 들어가고, 조직세포를 지난 뒤 오른쪽 칸으로 나오는 물질이 ㉠이에요. 세포가 영양소를 산소와 함께 잘게 분해하면 <b>이산화 탄소와 물</b>이 남고, 그 과정에서 생명 활동에 쓸 에너지를 얻어요.<span class='xh'>오답 하나씩 격파</span>'영양소와 산소'는 왼쪽 칸에 이미 그려져 있어요. 들어가는 것과 나오는 것을 같게 둘 수는 없죠. '요소와 무기염류'는 이 그림의 과정에서 곧바로 생기는 물질이 아니에요. 요소는 단백질이 분해될 때 생긴 물질이 간에서 바뀐 것이죠. '녹말과 단백질'은 잘게 나뉘기 전의 큰 영양소라 결과가 될 수 없어요. '적혈구와 혈소판'은 혈액을 이루는 성분이지 이 과정에서 만들어지는 물질이 아니에요. <b>들어가는 칸과 나오는 칸을 견주는 것</b>이 이 그림의 읽는 법이랍니다.",
    core: "영양소 + 산소 → 이산화 탄소 + 물 + 에너지. 두 칸을 견줘요!",
  },
  {
    id: "g2u6e338",
    lessonId: L6,
    type: "mcq",
    diff: 2,
    prompt: "그림은 네 기관계가 서로 어떻게 이어지는지를 나타낸 거예요. <b>(나)</b>에 해당하는 기관계는?",
    figure: systemsQuizFig({
      boxes: [
        { sym: "(가)", inLabel: "음식물", outLabel: "영양소", dir: "toCenter" },
        { sym: "(나)", inLabel: "산소", outLabel: "이산화 탄소", dir: "both" },
        { sym: "(다)", outLabel: "오줌", dir: "fromCenter" },
        { sym: "", label: "조직세포", dir: "both" },
      ],
    }),
    options: ["소화계", "호흡계", "배설계", "순환계", "조직세포"],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>(나) 상자에는 산소가 들어오고 이산화 탄소가 나간다고 적혀 있어요. 바깥 공기에서 산소를 받아들이고 이산화 탄소를 내보내는 일을 맡은 것은 <b>호흡계</b>죠. 화살표가 양쪽을 향하는 것도 두 기체가 서로 반대로 오간다는 뜻이에요.<span class='xh'>오답 하나씩 격파</span>'소화계'는 음식물을 받아 영양소를 내보내는 (가) 자리예요. '배설계'는 오줌을 내보내는 (다) 자리이고요. '순환계'는 가운데에 이름이 이미 적혀 있으니 답이 될 수 없어요. '조직세포'는 오른쪽 아래에 따로 그려져 있죠. 이런 도해는 <b>상자에 붙은 물질 이름만으로 정체를 되짚는</b> 것이 과제예요. 어떤 물질이 드나드는지가 곧 그 기관계가 하는 일이랍니다.",
    core: "드나드는 물질이 곧 그 기관계의 일. 산소와 이산화 탄소는 호흡계!",
  },
  {
    id: "g2u6e340",
    lessonId: L6,
    type: "mcq",
    diff: 3,
    prompt: "그림은 기관계가 서로 물질을 주고받는 모습이에요. 옳은 것만을 <보기>에서 있는 대로 고른 것은?",
    figure: systemsQuizFig({
      boxes: [
        { sym: "(다)", inLabel: "산소", dir: "toCenter" },
        { sym: "", label: "소화계", inLabel: "음식물", dir: "toCenter" },
        { sym: "(라)", outLabel: "요소", dir: "fromCenter" },
        { sym: "", label: "조직세포", dir: "both" },
      ],
    }),
    bogi: [
      "(라)는 요소를 오줌으로 내보내는 기관계예요.",
      "(다)에서 받아들인 산소는 가운데 기관계를 거쳐 조직세포에 닿아요.",
      "소화계에서 흡수된 영양소는 가운데 기관계를 거치지 않고 조직세포로 가요.",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ ✓ (라) 상자에서 나가는 물질이 요소라고 적혀 있어요. 요소를 걸러 오줌으로 내보내는 <b>배설계</b>죠. ㄴ ✓ 산소가 들어오는 (다)는 <b>호흡계</b>이고, 그 산소는 화살표를 따라 가운데 <b>순환계</b>로 갔다가 조직세포 쪽으로 이어져요.<span class='xh'>오답 하나씩 격파</span>ㄷ ✗ 그림에서 소화계와 조직세포를 곧바로 잇는 화살표는 없어요. 모든 상자가 순환계를 거쳐 이어져 있죠. 흡수된 영양소도 혈액에 실려 조직세포까지 가야 해요. 이 도해에서 가운데 상자가 <b>모든 길이 지나가는 자리</b>에 놓인 까닭이 바로 그것이에요. 화살표를 눈으로 따라가 보면 어느 상자든 가운데를 지나야 반대편에 닿는다는 것을 알 수 있답니다.",
    core: "모든 길은 가운데를 지나요. 화살표를 눈으로 따라가 보기!",
  },
  {
    id: "g2u6e346",
    lessonId: L6,
    type: "mcq",
    diff: 2,
    prompt: "표는 활동에 따라 몸에서 나타나는 변화를 견주어 나타낸 거예요. 나머지와 <b>변화의 방향이 다른</b> 항목은?",
    figure: activityTableFig(
      ["활동", "심장박동", "숨쉬기", "소화 활동"],
      [
        ["쉴 때", "느림", "느림", "활발"],
        ["걸을 때", "보통", "보통", "보통"],
        ["달릴 때", "빠름", "빠름", "느림"],
      ],
    ),
    options: ["소화 활동", "심장박동", "숨쉬기", "활동의 종류", "세 항목 모두 같아요"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>표를 위에서 아래로 읽으면 활동이 힘들어질수록 심장박동과 숨쉬기는 나란히 빨라져요. 그런데 소화 활동만은 활발에서 보통을 거쳐 느림으로 <b>반대 방향</b>으로 바뀌죠. 몸이 근육 쪽에 힘을 몰아주는 동안 다른 일은 잠시 뒤로 미루기 때문이에요.<span class='xh'>오답 하나씩 격파</span>'심장박동'과 '숨쉬기'는 둘 다 느림에서 빠름으로 같은 방향이라 나머지와 다르다고 할 수 없어요. '활동의 종류'는 견줄 값이 아니라 가로줄을 나누는 기준이라 방향을 말할 대상이 아니죠. '세 항목 모두 같다'는 소화 활동 줄을 놓친 판단이에요. 표 문제는 <b>세로줄마다 위에서 아래로 방향을 하나씩 적어 보는</b> 습관을 들이면 다른 하나가 곧바로 눈에 띈답니다.",
    core: "세로줄마다 방향을 적어 보기. 하나만 거꾸로 가는 줄을 찾아요!",
  },
  {
    id: "g2u6e349",
    lessonId: L6,
    type: "multi",
    diff: 2,
    prompt: "표는 한 사람이 쉴 때와 달린 직후에 드나든 기체의 양을 견준 거예요. 이 변화에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: activityTableFig(
      ["때", "들이마신 산소", "내쉰 이산화 탄소"],
      [
        ["쉴 때", "적음", "적음"],
        ["달린 직후", "많음", "많음"],
      ],
    ),
    options: [
      "근육 세포에 산소를 더 빨리 보내기 위한 변화예요.",
      "근육 세포가 내놓은 이산화 탄소를 더 빨리 거두기 위한 변화예요.",
      "세포가 에너지를 더 많이 쓰기 시작한 것이 변화의 출발점이에요.",
      "달리면 허파가 스스로 부풀어 산소를 더 빨아들이기 때문이에요.",
      "근육 세포가 스스로 산소를 만들어 쓰기 때문이에요.",
    ],
    answer: [0, 1, 2],
    explain:
      "<span class='xh'>정답 풀이</span>표에서 달린 직후에는 들이마신 산소도, 내쉰 이산화 탄소도 함께 늘었어요. <b>세포호흡</b>의 재료인 산소를 더 많이 받아들이고 그 결과로 생긴 이산화 탄소를 더 많이 내보냈다는 뜻이죠. 그렇게 된 출발점은 <b>세포가 에너지를 더 많이 쓰기 시작한 것</b>이에요. 몸의 변화는 그 요구를 따라간 결과예요.<span class='xh'>오답 하나씩 격파</span>'허파가 스스로 부풀어 빨아들인다'는 틀렸어요. 허파에는 스스로 부풀 힘이 없고 가슴우리의 부피가 바뀌어야 공기가 오가죠. '근육 세포가 스스로 산소를 만든다'도 사실이 아니에요. 산소는 오직 바깥에서 들어와 혈액에 실려 옮겨져요. <b>세포의 요구가 먼저이고 몸의 변화가 그 뒤</b>라는 순서를 잡아 두면 헷갈리지 않아요.",
    core: "세포의 주문이 먼저, 몸의 변화가 뒤. 표의 두 값이 함께 늘었어요!",
  },
  {
    id: "g2u6e350",
    lessonId: L6,
    type: "mcq",
    diff: 2,
    prompt: "어떤 학생이 “숨을 쉬는 것과 세포호흡은 같은 말”이라고 했어요. 이 말의 문제점을 옳게 짚은 것은?",
    options: [
      "숨쉬기는 가슴우리가 움직여 공기가 오가게 하는 몸의 동작이고, 세포호흡은 세포 안에서 영양소가 분해되며 에너지가 나오는 변화예요.",
      "숨쉬기는 세포에서 일어나고, 세포호흡은 허파에서 일어나요.",
      "숨쉬기에는 산소가 필요하지만 세포호흡에는 산소가 필요 없어요.",
      "세포호흡은 잠을 자는 동안에는 일어나지 않아요.",
      "세포호흡으로는 이산화 탄소가 생기지 않아요.",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>숨쉬기는 가슴우리의 부피가 달라지면서 공기가 허파 안팎을 오가는 <b>몸의 동작</b>이에요. 세포호흡은 조직세포 안에서 영양소가 산소와 함께 분해되며 에너지가 나오는 <b>물질의 변화</b>죠. 일어나는 곳도 다르고 일어나는 일의 성격도 달라요.<span class='xh'>오답 하나씩 격파</span>'숨쉬기가 세포에서, 세포호흡이 허파에서'는 두 낱말을 정반대로 바꿔 놓은 설명이에요. '세포호흡에 산소가 필요 없다'는 사실과 어긋나요. 산소는 세포호흡의 재료 가운데 하나니까요. '잠잘 때는 일어나지 않는다'도 틀려요. 심장과 여러 세포가 계속 활동하므로 세포호흡은 멈추지 않아요. '이산화 탄소가 생기지 않는다'도 어긋나죠. 두 낱말은 <b>산소와 이산화 탄소의 흐름으로 이어져 있을 뿐</b> 같은 것이 아니랍니다.",
    core: "숨쉬기는 운동, 세포호흡은 물질 변화. 이어져 있을 뿐 달라요!",
  },
];
