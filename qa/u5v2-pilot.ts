// u5 v2 파일럿 40문항(과학 교과서 준거 규격 · 재출제 7호) · 정본 설계표 qa/u5-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정 · index.ts 미등록. 확대 승인분과 함께 build-u5v2-lessons.mjs가
// u5l1~l7.ts를 재생성한다(문항 40개는 승인분 무수정).
// 신작 헬퍼 7종(AR·FB·GD·SH·BS·FR·TJ)은 파일럿 로컬 함수(u7·u3 v2 관행) · 이식 때
// ui/examFigures.ts "u5 v2" 섹션으로 승격한다. 파일럿 갤러리가 신작 데뷔 눈검수를 겸한다
// (미사용 모드·신규 사진 2장은 PILOT_PREVIEW 부록 카드로 데뷔 눈검수).
// 표기: 해요체 · em대시 금지(주석 포함 · 가운뎃점) · 해설 250~450자(태그 제외)+xh 2단+core ·
// 판정 마커 ✓ · mcq/multi 5지 · 라벨형 shuffle:false(첫 보기 정답 금지) · num answer 문자열+unitLabel.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
// 서술 표준: 알짜힘(다른 이름 금지) · "일정한 속력으로 (곧게)" · "바닥이 떠받치는 힘" · 용수철저울.
// 힘 검산 세트(각 문항 주석): 같은 방향 합 · 반대 방향 차(방향은 큰 쪽) · 평형 = 한 물체+크기 같음
// +방향 반대 · 무게 = 질량×9.8(단서 문두 제시) · 달 1/6 · 용수철 늘어남 비례(상수 일관) · 부력 =
// 공기 중 무게 − 물속 눈금 · 뜬 채 정지 = 부력이 무게와 같음 · 잠긴 부피 비례+깊이 무관 · 마찰력 =
// 운동(하려는) 방향 반대 · 밀어도 정지 = 미는 힘과 같은 크기 · 힘 화살표 길이 = 크기 비례(코드 보장).
// ⚠ 인코딩 주의: 이 파일은 BOM 없는 UTF-8 · PowerShell Get-Content(-Raw)로 열면 CP949로 깨진다
// (실사고 · 복구 불가 '?' 치환). 일괄 치환은 node 스크립트나 Edit 도구로만.
import type { ExamItem } from "../src/content/exams/types";
import { forcePairFig, pushStillFig, springExamGraph, svgTable, dbox, floatBallFig } from "../src/ui/examFigures";

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/u5/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;

/* ══════════ 신작 헬퍼(이식 때 examFigures "u5 v2" 섹션 승격) ══════════ */

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 공용 화살표(라이트) · 촉 포함. 길이는 호출부가 값에 비례해 계산한다. */
function fArr(x1: number, y1: number, x2: number, y2: number, color: string, w = 4.4, dash = ""): string {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - Math.cos(ang) * 11;
  const by = y2 - Math.sin(ang) * 11;
  const hx = (a: number): number => x2 - Math.cos(ang - a) * 12;
  const hy = (a: number): number => y2 - Math.sin(ang - a) * 12;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>
  <path d="M${x2.toFixed(1)} ${y2.toFixed(1)} L${hx(0.44).toFixed(1)} ${hy(0.44).toFixed(1)} L${hx(-0.44).toFixed(1)} ${hy(-0.44).toFixed(1)} Z" fill="${color}"/>`;
}
const DIRV: Record<string, [number, number]> = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const DIRKO: Record<string, string> = { r: "오른쪽", l: "왼쪽", u: "위쪽", d: "아래쪽" };

/** AR 화살표 표현 헬퍼(라이트 · 파라미터형) · L1 전용.
 *  anat: 화살표 한 개에 ㉮(시작점)·㉯(길이 구간)·㉰(화살촉) 기호 · aria는 기호 위치만(요소 이름 낭독 금지).
 *  grid: 모눈 위 화살표 1~3개(칸 수 파라미터) + "모눈 한 칸 = ○" 캡션 옵션 · aria에 칸 수 낭독 금지.
 *  cards: 후보 화살표 카드 ①~⑤(길이·방향·굵기 변형 · 정답 카드가 첫 칸이 되지 않게 저작). */
export function arrowAnatFig(
  o:
    | { mode: "anat" }
    | { mode: "grid"; cell?: string; arrows: { row: number; cells: number; start?: number; dir?: "r" | "l"; name?: string }[] }
    | { mode: "cards"; cards: { len: number; dir: "r" | "l" | "u"; w?: number }[] },
): string {
  if (o.mode === "anat") {
    return `<svg viewBox="0 0 344 128" ${NS} role="img" aria-label="힘을 나타낸 화살표 하나. 시작점에 ㉮, 몸통의 길이 구간에 ㉯, 화살촉에 ㉰ 기호가 붙어 있다">
      <circle cx="72" cy="66" r="6" fill="#34434F"/>
      ${fArr(72, 66, 268, 66, "#5E6B7E", 5)}
      <path d="M72 46 v-8 M256 46 v-8" stroke="#B0B8C1" stroke-width="1.4"/>
      <path d="M72 42 H256" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="4 4"/>
      <text x="72" y="94" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">㉮</text>
      <text x="164" y="32" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">㉯</text>
      <text x="272" y="94" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">㉰</text>
    </svg>`;
  }
  if (o.mode === "grid") {
    const rows = Math.max(...o.arrows.map((a) => a.row)) + 1;
    const H = 20 + rows * 42 + (o.cell ? 26 : 8);
    const x0 = 36;
    let grid = "";
    for (let c = 0; c <= 8; c++) grid += `<line x1="${x0 + c * 32}" y1="14" x2="${x0 + c * 32}" y2="${14 + rows * 42}" stroke="#E4E9EF" stroke-width="1"/>`;
    for (let r = 0; r <= rows; r++) grid += `<line x1="${x0}" y1="${14 + r * 42}" x2="${x0 + 256}" y2="${14 + r * 42}" stroke="#E4E9EF" stroke-width="1"/>`;
    const arrows = o.arrows
      .map((a) => {
        const y = 14 + a.row * 42 + 21;
        const bx = x0 + 8 + (a.start ?? 0) * 32;
        const sx = a.dir === "l" ? bx + a.cells * 32 : bx;
        const ex = a.dir === "l" ? bx : bx + a.cells * 32;
        const name = a.name ? `<text x="${(a.dir === "l" ? ex : sx) - 14}" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">${a.name}</text>` : "";
        return `<circle cx="${sx}" cy="${y}" r="4.6" fill="#34434F"/>${fArr(sx, y, ex, y, "#5E6B7E", 4.6)}${name}`;
      })
      .join("");
    const cap = o.cell ? `<text x="292" y="${H - 8}" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">모눈 한 칸 = ${o.cell}</text>` : "";
    return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="모눈 위에 그린 힘 화살표${o.arrows.length > 1 ? " 여러 개. 길이와 방향을 모눈 칸으로 비교할 수 있다" : " 하나"}">${grid}${arrows}${cap}</svg>`;
  }
  const cards = o.cards
    .map((c, i) => {
      const cx = 8 + i * 66 + 33;
      const cyMid = 52;
      const [dx, dy] = DIRV[c.dir];
      const half = c.len / 2;
      const sx = cx - dx * half;
      const sy = cyMid + 10 - dy * half;
      return `<g>
        <rect x="${8 + i * 66}" y="8" width="62" height="86" rx="12" fill="#F7F9FB" stroke="#D5DBE3" stroke-width="1.4"/>
        <text x="${cx}" y="28" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${["①", "②", "③", "④", "⑤"][i]}</text>
        <circle cx="${sx}" cy="${sy}" r="3.8" fill="#34434F"/>
        ${fArr(sx, sy, sx + dx * c.len, sy + dy * c.len, "#5E6B7E", c.w ?? 4.4)}
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 102" ${NS} role="img" aria-label="힘 화살표 후보 카드 ①에서 ⑤. 길이나 방향, 굵기가 서로 다르다">${cards}</svg>`;
}

/** FB 수평면 힘 장면(라이트 · 파라미터형) · 물체+힘 화살표 워크호스.
 *  화살표 길이는 n 값에 단조 증가(최소 가시폭 보정 어핀 · 대소 관계는 항상 정확하나 정확한
 *  배수는 라벨 몫 · 배수 판정 과제는 AR 모눈이 전담) · tone: act 주황(작용힘)/resist 파랑(마찰·반응)/
 *  grav 남색(중력)/buoy 하늘(부력)/기본 중립 · motion: 속이 빈 초록 화살표(힘과 구분).
 *  같은 방향 수평 화살표 여럿이면 세로 스택(겹침 방지) · 수직 화살표는 물체 가장자리에서 시작,
 *  뷰박스 높이 동적 확장(잘림 방지). cand: 방향 후보 점선 화살표 ㉮~(방향이 정답인 문항은
 *  반드시 후보 제시형 · 단정 화살표 금지). aria는 각 화살표의 방향·라벨 값만 서술(그림 속 조건
 *  서술 = 동등 접근 · 판정 결과 낭독 금지). */
export function forceSceneFig(o: {
  obj?: "box" | "ball" | "bag" | "cart";
  arrows?: { dir: "l" | "r" | "u" | "d"; n?: number; label?: string; tone?: "act" | "resist" | "grav" | "buoy" }[];
  motion?: "l" | "r";
  ground?: "line" | "rough" | "ice" | "water" | "none";
  still?: boolean;
  cand?: { name: string; dir: "l" | "r" | "u" | "d" }[];
  cap?: string;
  /** true면 aria에 라벨 값을 낭독하지 않는다(값이 곧 정답인 평형 문항용 · 값은 문두가 제공). */
  quiet?: boolean;
}): string {
  const TONE: Record<string, string> = { act: "#E8710A", resist: "#4A7DDB", grav: "#3F5875", buoy: "#37A8DB" };
  const arrows = o.arrows ?? [];
  const maxN = Math.max(1, ...arrows.map((a) => a.n ?? 0));
  const len = (n?: number): number => (n ? 26 + (n / maxN) * 66 : 62);
  const gy = 118;
  let ground = "";
  if (o.ground === "rough") {
    let hatch = "";
    for (let x = 30; x <= 314; x += 16) hatch += `<line x1="${x}" y1="${gy}" x2="${x - 9}" y2="${gy + 11}" stroke="#C9B49A" stroke-width="2"/>`;
    ground = `<line x1="20" y1="${gy}" x2="324" y2="${gy}" stroke="#B08D5E" stroke-width="3"/>${hatch}`;
  } else if (o.ground === "ice") {
    ground = `<line x1="20" y1="${gy}" x2="324" y2="${gy}" stroke="#9CC8EE" stroke-width="3"/><path d="M40 ${gy + 8} h44 M130 ${gy + 8} h30 M240 ${gy + 8} h50" stroke="#C9E4F8" stroke-width="2.4" stroke-linecap="round"/>`;
  } else if (o.ground === "water") {
    ground = `<rect x="24" y="86" width="296" height="52" rx="6" fill="rgba(90,162,248,.20)"/><path d="M24 86 h296" stroke="#5AA2F8" stroke-width="2.2"/>`;
  } else if (o.ground !== "none") {
    ground = `<line x1="24" y1="${gy}" x2="320" y2="${gy}" stroke="#D5DBE3" stroke-width="2"/>`;
  }
  const cx = 172;
  let objSvg = "";
  const inWater = o.ground === "water";
  const oy = 74;
  let objTop = oy;
  let objBot = oy + 44;
  if (o.obj === "ball") {
    // 물 장면의 공은 수면(86) 아래 완전 잠김 배치(수면 위 노출 = "잠긴 공" 문두와 모순 · 검산 B 반영)
    const cy = inWater ? 112 : 96;
    objSvg = `<circle cx="${cx}" cy="${cy}" r="22" fill="#FFD98A" stroke="#C9A96A" stroke-width="2.2"/>`;
    objTop = cy - 22;
    objBot = cy + 22;
  } else if (o.obj === "bag") {
    objSvg = `<path d="M${cx - 26} ${gy} v-30 q0 -10 10 -10 h32 q10 0 10 10 v30 z" fill="#D9C6EC" stroke="#9A7FBE" stroke-width="2"/><path d="M${cx - 8} ${gy - 40} q8 -14 16 0" fill="none" stroke="#9A7FBE" stroke-width="2.4"/>`;
    objTop = gy - 52;
    objBot = gy;
  } else if (o.obj === "cart") {
    objSvg = `<rect x="${cx - 30}" y="${gy - 40}" width="60" height="26" rx="6" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/><circle cx="${cx - 16}" cy="${gy - 8}" r="7" fill="#8B95A1"/><circle cx="${cx + 16}" cy="${gy - 8}" r="7" fill="#8B95A1"/>`;
    objTop = gy - 40;
    objBot = gy;
  } else {
    objSvg = `<rect x="${cx - 30}" y="${oy}" width="60" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>`;
  }
  const midY = inWater ? 92 : 96;
  const offsetsFor = (count: number): number[] => (count === 1 ? [0] : count === 2 ? [-13, 13] : [-16, 0, 16]);
  const hOffsets = new Map<number, number>();
  for (const dir of ["l", "r"]) {
    const idxs = arrows.map((a, i) => (a.dir === dir ? i : -1)).filter((i) => i >= 0);
    const offs = offsetsFor(idxs.length);
    idxs.forEach((idx, k) => hOffsets.set(idx, offs[k] ?? 0));
  }
  let maxY = 152;
  const arrParts: string[] = [];
  arrows.forEach((a, i) => {
    const color = a.tone ? TONE[a.tone] : "#5E6B7E";
    const L = len(a.n);
    const [dx, dy] = DIRV[a.dir];
    let sx = cx + dx * 32;
    let sy = midY + (hOffsets.get(i) ?? 0);
    if (a.dir === "u") { sx = cx; sy = objTop - 4; }
    if (a.dir === "d") { sx = cx; sy = objBot + 4; }
    let ex = sx + dx * L;
    let ey = sy + dy * L;
    if (a.dir === "u" && ey < 16) ey = 16;
    if (a.dir === "d") maxY = Math.max(maxY, ey + 10);
    const lx = a.dir === "u" || a.dir === "d" ? sx + 16 : (sx + ex) / 2;
    const ly = a.dir === "u" || a.dir === "d" ? (sy + ey) / 2 : sy - 12;
    const label = a.label ? `<text x="${lx}" y="${ly}" text-anchor="${a.dir === "u" || a.dir === "d" ? "start" : "middle"}" font-size="12.5" font-weight="700" fill="${color}">${a.label}</text>` : "";
    arrParts.push(fArr(sx, sy, ex, ey, color, 4.6) + label);
  });
  const hasCand = (o.cand ?? []).length > 0;
  const motion = o.motion
    ? (() => {
        const [dx] = DIRV[o.motion!];
        const sx = cx + dx * (hasCand ? 44 : 6);
        const y = objTop - 22;
        return `${fArr(sx, y, sx + dx * 58, y, "#37C08E", 3.6)}<text x="${sx + dx * 29}" y="${y - 9}" text-anchor="middle" font-size="11" font-weight="700" fill="#2C9973">운동 방향</text>`;
      })()
    : "";
  const cand = (o.cand ?? [])
    .map((c) => {
      const [dx, dy] = DIRV[c.dir];
      let sx = cx + dx * 34;
      let sy = midY;
      if (c.dir === "u") { sx = cx; sy = objTop - 6; }
      if (c.dir === "d") { sx = cx; sy = objBot + 6; }
      const ex = sx + dx * 40;
      const ey = sy + dy * 40;
      if (c.dir === "d") maxY = Math.max(maxY, ey + 22);
      return `${fArr(sx, sy, ex, ey, "#8B95A1", 3.4, "5 5")}<text x="${ex + dx * 13}" y="${ey + dy * 16 + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${c.name}</text>`;
    })
    .join("");
  const still = o.still ? `<text x="${cx}" y="50" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">정지 상태</text>` : "";
  const H = Math.ceil(o.cap ? maxY + 16 : maxY);
  const cap = o.cap ? `<text x="172" y="${H - 6}" text-anchor="middle" font-size="11.5" fill="#8B95A1">${o.cap}</text>` : "";
  const ariaArr = arrows.map((a) => `${DIRKO[a.dir]}으로${!o.quiet && a.label ? " " + a.label : ""} 화살표`).join(", ");
  const ariaCand = (o.cand ?? []).map((c) => `${c.name}는 ${DIRKO[c.dir]}`).join(", ");
  const aria = `물체 그림.${arrows.length ? " 힘 화살표: " + ariaArr + "." : ""}${o.motion ? ` ${DIRKO[o.motion]}으로 움직이는 중.` : ""}${o.cand?.length ? " 후보 화살표: " + ariaCand + "." : ""}${o.still ? " 정지 상태라고 적혀 있다." : ""}`;
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="${aria}">${ground}${objSvg}${arrParts.join("")}${motion}${cand}${still}${cap}</svg>`;
}

/** GD 천체 주위 중력 방향(라이트 · 파라미터형) · 물체 위치 deg(0=오른쪽·90=위)와 후보 화살표.
 *  후보 dir: in(중심 쪽)·out(바깥)·u/d/l/r(화면 절대 방향). 화살표는 짧게(행성 원 침범 방지),
 *  라벨은 화살표 중간의 수직 옆자리. aria는 화면 절대 방향으로만 서술(중심 쪽 여부는 판정
 *  과제라 낭독 금지). 레슨 (가)(나)+A~F 그림과 위치·기호 체계 분리. */
export function gravityDirsFig(o: {
  body?: "earth" | "moon";
  spots: { label: string; deg: number; cands: { name: string; dir: "in" | "out" | "u" | "d" | "l" | "r" }[] }[];
}): string {
  const cx = 172;
  const cy = 118;
  const R = 46;
  const moon = o.body === "moon";
  const planet = moon
    ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#F0F1F3" stroke="#9AA2AA" stroke-width="2.4"/>
       <circle cx="${cx - 14}" cy="${cy - 10}" r="8" fill="#DCDFE3"/><circle cx="${cx + 12}" cy="${cy + 14}" r="6" fill="#DCDFE3"/><circle cx="${cx + 18}" cy="${cy - 16}" r="4.5" fill="#DCDFE3"/>
       <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10.5" fill="#8B95A1">달</text>`
    : `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#EAF2FD" stroke="#8FB3E8" stroke-width="2.4"/>
       <ellipse cx="${cx - 16}" cy="${cy - 14}" rx="17" ry="11" fill="#CBE4D2"/><ellipse cx="${cx + 18}" cy="${cy + 14}" rx="12" ry="8" fill="#CBE4D2"/>
       <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10.5" fill="#8B95A1">지구</text>`;
  const ariaParts: string[] = [];
  const spots = o.spots
    .map((s) => {
      const rad = (s.deg * Math.PI) / 180;
      const px = cx + Math.cos(rad) * (R + 44);
      const py = cy - Math.sin(rad) * (R + 44);
      // 물체 라벨은 접선 방향 옆자리(위·중심 쪽 후보 화살표와 겹치지 않게 · 파일럿 눈검수 반영)
      const tx = px - Math.sin(rad) * 26;
      const ty = py - Math.cos(rad) * 26;
      const obj = `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="#D9C6EC" stroke="#9A7FBE" stroke-width="2"/>
        <text x="${tx.toFixed(1)}" y="${(ty + 4.5).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${s.label}</text>`;
      const cands = s.cands
        .map((c) => {
          let vx = 0;
          let vy = 0;
          if (c.dir === "in") { vx = cx - px; vy = cy - py; }
          else if (c.dir === "out") { vx = px - cx; vy = py - cy; }
          else { [vx, vy] = DIRV[c.dir]; }
          const m = Math.hypot(vx, vy) || 1;
          const ux = vx / m;
          const uy = vy / m;
          const sx = px + ux * 12;
          const sy = py + uy * 12;
          const ex = px + ux * 38;
          const ey = py + uy * 38;
          const mx = (sx + ex) / 2 - uy * 15;
          const my = (sy + ey) / 2 + ux * 15;
          const dko = Math.abs(ux) > Math.abs(uy) ? (ux > 0 ? "오른쪽" : "왼쪽") : uy > 0 ? "아래쪽" : "위쪽";
          ariaParts.push(`${c.name}는 ${dko}`);
          return `${fArr(sx, sy, ex, ey, "#5E6B7E", 3.6)}<text x="${mx.toFixed(1)}" y="${(my + 4.5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${c.name}</text>`;
        })
        .join("");
      return obj + cands;
    })
    .join("");
  return `<svg viewBox="0 0 344 236" ${NS} role="img" aria-label="${moon ? "달" : "지구"} 주위 물체들과 후보 화살표. 화면 기준으로 ${ariaParts.join(", ")} 방향을 가리킨다">${planet}${spots}</svg>`;
}

/** SH 용수철 장면(라이트 · 파라미터형) · hang(천장 매달림)/pull(벽 수평 당김)/press(바닥 압축).
 *  dims: [원래 길이 라벨, 지금 길이 라벨] · 원래 길이는 왼쪽 구간 화살표+가로 점선, 지금 길이는
 *  오른쪽 구간 화살표(정보 이분 배치 · 값은 파라미터). cands: 탄성력 방향 후보 점선 화살표
 *  (방향 정답 문항은 후보 제시형만). pull 모드에서 forceLabel과 cands는 동시 사용 금지(겹침 ·
 *  당기는 힘 표기는 문두 서술로). */
export function springHangFig(o: {
  kind: "hang" | "pull" | "press";
  dims?: [string, string];
  weightLabel?: string;
  forceLabel?: string;
  cands?: { name: string; dir: "u" | "d" | "l" | "r" }[];
}): string {
  const coilV = (x: number, y1: number, y2: number, w = 13): string => {
    const n = 7;
    const step = (y2 - y1) / (n * 2);
    let d = `M${x} ${y1}`;
    for (let i = 0; i < n * 2; i++) d += ` L${x + (i % 2 ? -w : w)} ${(y1 + step * (i + 0.5)).toFixed(1)}`;
    d += ` L${x} ${y2}`;
    return `<path d="${d}" fill="none" stroke="#7E8B9C" stroke-width="3" stroke-linejoin="round"/>`;
  };
  const coilH = (y: number, x1: number, x2: number, w = 13): string => {
    const n = 7;
    const step = (x2 - x1) / (n * 2);
    let d = `M${x1} ${y}`;
    for (let i = 0; i < n * 2; i++) d += ` L${(x1 + step * (i + 0.5)).toFixed(1)} ${y + (i % 2 ? -w : w)}`;
    d += ` L${x2} ${y}`;
    return `<path d="${d}" fill="none" stroke="#7E8B9C" stroke-width="3" stroke-linejoin="round"/>`;
  };
  let body = "";
  let H = 200;
  const cands = (cx: number, cy: number): string =>
    (o.cands ?? [])
      .map((c) => {
        const [dx, dy] = DIRV[c.dir];
        const sx = cx + dx * 20;
        const sy = cy + dy * 20;
        return `${fArr(sx, sy, sx + dx * 40, sy + dy * 40, "#8B95A1", 3.4, "5 5")}<text x="${sx + dx * 56}" y="${sy + dy * 56 + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${c.name}</text>`;
      })
      .join("");
  if (o.kind === "hang") {
    let hatch = "";
    for (let x = 96; x <= 250; x += 15) hatch += `<line x1="${x}" y1="22" x2="${x + 9}" y2="10" stroke="#B0B8C1" stroke-width="2"/>`;
    const dims = o.dims
      ? `<path d="M232 22 H286 M232 150 H286" stroke="#C4CAD2" stroke-width="1.3" stroke-dasharray="4 4"/>
         <path d="M272 26 V146" stroke="#8B95A1" stroke-width="1.6"/>
         <path d="M272 26 l-4 8 h8 z M272 146 l-4 -8 h8 z" fill="#8B95A1"/>
         <text x="280" y="90" font-size="11.5" font-weight="700" fill="#4E5968">${o.dims[1]}</text>
         <path d="M58 92 H160" stroke="#C4CAD2" stroke-width="1.3" stroke-dasharray="4 4"/>
         <path d="M104 26 V88" stroke="#B0B8C1" stroke-width="1.6"/>
         <path d="M104 26 l-4 8 h8 z M104 88 l-4 -8 h8 z" fill="#B0B8C1"/>
         <text x="96" y="60" text-anchor="end" font-size="11.5" font-weight="700" fill="#8B95A1">${o.dims[0]}</text>`
      : "";
    body = `<line x1="90" y1="22" x2="254" y2="22" stroke="#8B95A1" stroke-width="3"/>${hatch}
      ${coilV(172, 22, 150)}
      <rect x="150" y="150" width="44" height="34" rx="6" fill="#C9B49A" stroke="#8B7355" stroke-width="2"/>
      <text x="172" y="172" text-anchor="middle" font-size="11.5" font-weight="700" fill="#5B4632">${o.weightLabel ?? "추"}</text>
      ${dims}${cands(172, 167)}`;
    H = 208;
  } else if (o.kind === "pull") {
    let hatch = "";
    for (let y = 52; y <= 128; y += 15) hatch += `<line x1="40" y1="${y}" x2="28" y2="${y + 9}" stroke="#B0B8C1" stroke-width="2"/>`;
    const force = o.forceLabel
      ? `${fArr(268, 90, 322, 90, "#E8710A", 4.6)}<text x="295" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#E8710A">${o.forceLabel}</text>`
      : "";
    body = `<line x1="40" y1="46" x2="40" y2="134" stroke="#8B95A1" stroke-width="3"/>${hatch}
      ${coilH(90, 40, 244)}
      <circle cx="256" cy="90" r="7" fill="none" stroke="#7E8B9C" stroke-width="3"/>
      ${force}${cands(266, 52)}`;
    H = 160;
  } else {
    const force = o.forceLabel
      ? `${fArr(172, 26, 172, 66, "#E8710A", 4.6)}<text x="190" y="44" font-size="12.5" font-weight="700" fill="#E8710A">${o.forceLabel}</text>`
      : "";
    body = `<rect x="140" y="70" width="64" height="10" rx="4" fill="#D5DBE3"/>
      ${coilV(172, 80, 140, 15)}
      <line x1="90" y1="142" x2="254" y2="142" stroke="#8B95A1" stroke-width="3"/>
      ${force}${cands(172, 108)}`;
    H = 168;
  }
  const aria = o.kind === "hang" ? "천장에 매단 용수철에 추가 걸려 있는 그림" : o.kind === "pull" ? "벽에 고정한 용수철을 옆으로 당기는 그림" : "바닥 위 용수철을 위에서 누르는 그림";
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="${aria}${o.dims ? `. 길이 표시 ${o.dims[0]}와 ${o.dims[1]}` : ""}${o.forceLabel ? `. 힘 라벨 ${o.forceLabel}` : ""}${o.cands?.length ? ". 방향 후보 화살표가 붙어 있다" : ""}">${body}</svg>`;
}

/** BS 용수철저울·추 잠김 장면(라이트 · 파라미터형) · buoyThreeFig 대체 확장.
 *  water: none(공기 중)/half(절반 잠김)/full(완전 잠김)/deep(완전 잠김 더 깊이).
 *  val: 저울 옆 콜아웃 라벨(표시창은 빈 패널 유지 · 값 제시는 콜아웃이 담당).
 *  quiet: aria에 콜아웃 값을 낭독하지 않는다(값이 곧 정답인 함정 문항용 · 값은 문두가 제공). */
export function buoyScaleFig(o: { scenes: { label: string; water: "none" | "half" | "full" | "deep"; val?: string }[]; quiet?: boolean }): string {
  const n = o.scenes.length;
  const W = 344 / n;
  const scene = (i: number, s: { label: string; water: string; val?: string }): string => {
    const cx = W / 2;
    const sink = s.water === "deep" ? 30 : s.water === "full" ? 16 : 0;
    const wy = 96 + sink;
    const waterTop = s.water === "none" ? null : s.water === "half" ? wy - 8 : s.water === "full" ? wy - 34 : wy - 48;
    const val = s.val
      ? `<g><rect x="${cx + 24}" y="20" width="58" height="24" rx="8" fill="#FFF0F3" stroke="#E8829B" stroke-width="1.6"/>
         <path d="M${cx + 24} 32 l-8 4 8 4z" fill="#E8829B"/>
         <text x="${cx + 53}" y="36" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9365E">${s.val}</text></g>`
      : "";
    return `<g transform="translate(${i * W},0)">
      <rect x="${cx - 20}" y="14" width="40" height="24" rx="5" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="${cx - 12}" y="19" width="24" height="13" rx="3" fill="#2A3442"/>
      <path d="M${cx} 38 v${wy - 60}" stroke="#8B95A1" stroke-width="2"/>
      <rect x="${cx - 14}" y="${wy - 22}" width="28" height="26" rx="5" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/>
      ${waterTop != null ? `<rect x="${cx - 38}" y="${waterTop}" width="76" height="${162 - waterTop}" rx="6" fill="rgba(90,162,248,.22)"/><path d="M${cx - 38} ${waterTop} h76" stroke="#5AA2F8" stroke-width="2"/>` : ""}
      <path d="M${cx - 38} 162 h76" stroke="#8B95A1" stroke-width="2.4"/>
      <path d="M${cx - 38} 58 v104 M${cx + 38} 58 v104" stroke="#8B95A1" stroke-width="2.4"/>
      ${val}
      <text x="${cx}" y="184" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${s.label}</text>
    </g>`;
  };
  const KO: Record<string, string> = { none: "물 밖", half: "절반 잠김", full: "완전히 잠김", deep: "완전히 잠긴 채 더 깊이" };
  const aria = o.scenes.map((s) => `${s.label} ${KO[s.water]}${s.val ? (o.quiet ? " 저울 옆에 값 표시" : " 저울 값 " + s.val) : ""}`).join(", ");
  return `<svg viewBox="0 0 344 196" ${NS} role="img" aria-label="용수철저울에 추를 매달아 물에 넣는 장면. ${aria}. 저울 표시창은 비어 있다">${o.scenes.map((s, i) => scene(i, s)).join("")}</svg>`;
}

/** FR 마찰 측정 장면(라이트 · 파라미터형) · 판+도막(쌓기)+수평 용수철저울(빈 표시창)+당김 화살표.
 *  surface: smooth(민면)/rough(빗금)/wet(물기) · val: 저울 옆 콜아웃(움직이기 시작하는 순간의 값).
 *  quiet: aria에 콜아웃 값을 낭독하지 않는다(값이 곧 정답인 평형 문항용 · 값은 문두가 제공). */
export function frictionRigFig(o: { boards: { surface: "smooth" | "rough" | "wet"; blocks: 1 | 2; val?: string; label?: string }[]; quiet?: boolean }): string {
  const row = (i: number, b: { surface: string; blocks: number; val?: string; label?: string }): string => {
    const y0 = i * 96;
    const by = y0 + 66;
    let surf = "";
    if (b.surface === "rough") {
      for (let x = 44; x <= 240; x += 14) surf += `<line x1="${x}" y1="${by + 4}" x2="${x - 8}" y2="${by + 13}" stroke="#B08D5E" stroke-width="1.8"/>`;
    } else if (b.surface === "wet") {
      surf = `<ellipse cx="90" cy="${by + 8}" rx="26" ry="4.5" fill="rgba(90,162,248,.35)"/><ellipse cx="180" cy="${by + 9}" rx="34" ry="5" fill="rgba(90,162,248,.30)"/>`;
    }
    const blocks =
      b.blocks === 2
        ? `<rect x="86" y="${by - 26}" width="44" height="26" rx="4" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/><rect x="86" y="${by - 50}" width="44" height="26" rx="4" fill="#D8C7AC" stroke="#8B7355" stroke-width="1.8"/>`
        : `<rect x="86" y="${by - 26}" width="44" height="26" rx="4" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/>`;
    const val = b.val
      ? `<g><rect x="238" y="${by - 58}" width="56" height="23" rx="8" fill="#FFF0F3" stroke="#E8829B" stroke-width="1.6"/>
         <path d="M258 ${by - 35} l4 8 4 -8z" fill="#E8829B"/>
         <text x="266" y="${by - 42}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9365E">${b.val}</text></g>`
      : "";
    return `<g>
      <rect x="40" y="${by}" width="208" height="7" rx="3" fill="#E3D5C0" stroke="#B08D5E" stroke-width="1.6"/>${surf}
      ${blocks}
      <line x1="130" y1="${by - 13}" x2="176" y2="${by - 13}" stroke="#8B95A1" stroke-width="2"/>
      <rect x="176" y="${by - 22}" width="54" height="18" rx="6" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="184" y="${by - 18}" width="26" height="10" rx="2.5" fill="#2A3442"/>
      ${fArr(232, by - 13, 296, by - 13, "#E8710A", 4.4)}
      ${val}
      ${b.label ? `<text x="24" y="${by - 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${b.label}</text>` : ""}
    </g>`;
  };
  const H = o.boards.length * 96 + 6;
  const KO: Record<string, string> = { smooth: "매끈한 면", rough: "거친 면", wet: "물기 있는 면" };
  const aria = o.boards.map((b) => `${b.label ?? ""} ${KO[b.surface]} 위 도막 ${b.blocks}개${b.val ? (o.quiet ? ", 저울 옆에 값 표시" : ", 저울 옆 값 " + b.val) : ""}`).join(". ");
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="나무 도막을 용수철저울로 당기는 마찰 측정 장면. ${aria}. 저울 표시창은 비어 있다">${o.boards.map((b, i) => row(i, b)).join("")}</svg>`;
}

/** 떨어져 있는 두 상자 A·B에 힘이 하나씩(한 물체 조건 판정 전용 · 화살표 길이 동일 = 크기 동일). */
export function twoBoxesFig(): string {
  const arr = (x1: number, x2: number, y: number): string => {
    const dir = x2 > x1 ? 1 : -1;
    return `<line x1="${x1}" y1="${y}" x2="${x2 - dir * 11}" y2="${y}" stroke="#5E6B7E" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M${x2} ${y} l${-dir * 12} -7 v14 z" fill="#5E6B7E"/>`;
  };
  return `<svg viewBox="0 0 344 140" ${NS} role="img" aria-label="서로 떨어져 있는 상자 A와 B. A에는 오른쪽으로 5 N 화살표 하나, B에는 왼쪽으로 5 N 화살표 하나가 그려져 있다">
    <line x1="16" y1="112" x2="328" y2="112" stroke="#D5DBE3" stroke-width="2"/>
    <rect x="44" y="68" width="52" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <text x="70" y="94" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">A</text>
    ${arr(98, 158, 90)}
    <text x="128" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">5 N</text>
    <rect x="248" y="68" width="52" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <text x="274" y="94" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">B</text>
    ${arr(246, 186, 90)}
    <text x="216" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">5 N</text>
  </svg>`;
}

/** TJ 같은 시간 간격 위치 기록(라이트 · 파라미터형) · 공 위치 배열이 전부(궤적 경향은 좌표가 만든다).
 *  공 사이 파란 화살표 길이 = 실제 간격(코드 보장 · 속력 변화가 화살표 길이로 읽힘).
 *  aria는 "같은 시간 간격 기록"까지만(간격 경향·방향 변화 낭독 금지 = 판독 과제). */
export function trajStroboFig(o: { pts: [number, number][]; cap?: string }): string {
  const r = 9;
  const balls = o.pts
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i === 0 ? "#F0A422" : "#FFE9C4"}" stroke="#D08A18" stroke-width="1.8"/>`)
    .join("");
  let arrows = "";
  for (let i = 0; i < o.pts.length - 1; i++) {
    const [x1, y1] = o.pts[i];
    const [x2, y2] = o.pts[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    // 간격이 공 지름 수준이면 화살표가 뭉개진다(거의 멈춤) · 생략이 물리적으로도 자연
    if (d < 2 * (r + 3) + 15) continue;
    const ux = (x2 - x1) / d;
    const uy = (y2 - y1) / d;
    arrows += fArr(x1 + ux * (r + 3), y1 + uy * (r + 3), x2 - ux * (r + 3), y2 - uy * (r + 3), "#4A7DDB", 3.4);
  }
  const cap = o.cap ? `<text x="172" y="152" text-anchor="middle" font-size="11.5" fill="#8B95A1">${o.cap}</text>` : "";
  return `<svg viewBox="0 0 344 158" ${NS} role="img" aria-label="같은 시간 간격으로 기록한 공의 위치들. 이웃한 위치 사이에 화살표가 그려져 있다">${arrows}${balls}${cap}</svg>`;
}

/* ══════════ 파일럿 40문항 ══════════ */

export const POOL_U5V2_PILOT: ExamItem[] = [
  // ── L1 힘의 표현 ──
  {
    // [201] d1 무① · 힘의 정의 직문 · 검산: 힘의 효과 = 모양 변화 + 운동 상태 변화 두 가지뿐
    id: "u5e201",
    lessonId: "u5l1",
    type: "mcq",
    diff: 1,
    prompt: "과학에서 말하는 <b>힘</b>에 대한 설명으로 옳은 것은?",
    options: [
      "물체의 모양을 바꾸거나 운동 상태를 바꾸는 원인이다",
      "물체가 오랫동안 움직일 수 있도록 몸속에 저장해 둔 에너지이다",
      "무거운 물체일수록 많이 지니고 있는 성질이다",
      "물체의 온도를 높여 주는 원인이다",
      "물체가 힘든 일을 참고 견디는 능력이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>과학에서 힘의 뜻은 하나로 정해져 있어요. 물체의 <b>모양</b>을 바꾸거나, 빠르기나 방향 같은 <b>운동 상태</b>를 바꾸는 원인이죠. 찰흙이 눌려 납작해지는 것도, 멈춰 있던 공이 굴러가기 시작하는 것도 모두 힘이 작용했다는 증거예요.<span class='xh'>오답 하나씩 격파</span>'저장해 둔 에너지'는 틀려요. 힘은 물체가 품고 다니는 것이 아니라 물체들 <b>사이에서 작용하는</b> 것이거든요. '무거울수록 많이 지닌 성질'이라면 가벼운 탁구공은 힘을 못 줘야 하는데, 라켓에 맞은 공은 잘만 튕겨 나가죠. '온도를 높이는 원인'은 열의 몫이고, '참고 견디는 능력'은 일상에서 쓰는 힘(체력)이라 과학의 정의가 아니에요.",
    core: "힘 = 모양 또는 운동 상태를 바꾸는 원인. 이 두 가지가 전부예요!",
  },
  {
    // [203] d1 AR anat · 그림 기호 판독 · 검산: ㉮ 시작점 = 작용점 · ㉯ 길이 = 크기 · ㉰ 촉 = 방향
    id: "u5e203",
    lessonId: "u5l1",
    type: "mcq",
    diff: 1,
    prompt: "그림은 힘을 화살표로 나타낸 거예요. <b>㉯</b>가 나타내는 것은?",
    figure: arrowAnatFig({ mode: "anat" }),
    options: [
      "힘이 작용한 시간",
      "물체의 무게",
      "힘의 크기",
      "힘의 방향",
      "힘이 작용하는 지점",
    ],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>화살표 하나에는 힘의 3요소가 전부 담겨요. 꼬리 쪽 시작점(㉮)이 <b>작용점</b>, 몸통의 길이(㉯)가 <b>힘의 크기</b>, 화살촉(㉰)이 <b>힘의 방향</b>이죠. ㉯는 길이 구간이니까 크기 담당이에요. 길이를 2배로 그리면 2배 큰 힘이라는 약속이고요.<span class='xh'>오답 하나씩 격파</span>'힘의 방향'은 길이가 아니라 화살촉(㉰)이 가리키는 쪽이 맡아요. '작용하는 지점'은 시작점(㉮)의 몫이죠. '작용한 시간'은 아예 화살표에 담기지 않는 정보예요. 3요소에 시간은 없거든요. '물체의 무게'도 화살표의 요소가 아니라 물체 쪽 정보라서 어긋나요. 꼬리부터 순서대로 \"작용점, 크기, 방향\"을 떠올리면 절대 안 섞여요.",
    core: "화살표: 시작점 = 작용점, 길이 = 크기, 촉 = 방향!",
  },
  {
    // [206] d2 사진 bowling bogi · 검산: ㄱ 참(핀 운동 상태 변화) · ㄴ 거짓(물질 변화 아님) · ㄷ 참(방향 변화도 힘)
    id: "u5e206",
    lessonId: "u5l1",
    type: "mcq",
    diff: 2,
    prompt: "사진은 볼링공이 핀들과 부딪히는 순간이에요. 이 장면에 대한 옳은 설명을 보기에서 모두 고른 것은?",
    figure: ximg("bowling-pins.webp", "볼링공이 여러 개의 볼링 핀과 부딪히는 순간"),
    bogi: [
      "공이 핀에 힘을 작용하여 핀의 운동 상태가 변했다",
      "쓰러지는 핀은 힘을 받아 다른 물질로 변한 것이다",
      "이 장면처럼 힘은 물체의 운동 방향을 바꿀 수 있다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ은 참이에요. 가만히 서 있던 핀이 공에 맞아 쓰러지기 시작했으니, 정지 상태가 운동 상태로 변한 거죠. ㄷ도 참이에요. 공도 핀에 부딪히면서 나아가던 방향이 꺾이는데, 방향이 바뀌는 것도 어엿한 운동 상태 변화라 힘이 한 일이에요.<span class='xh'>오답 하나씩 격파</span>ㄴ은 틀려요. 핀은 쓰러졌을 뿐 여전히 같은 핀이에요. 힘의 효과는 모양 변화와 운동 상태 변화 딱 두 가지라서, 물질이 <b>다른 물질로 변하는 일</b>은 힘의 목록에 없어요. 그건 녹슬거나 익는 것 같은 물질 변화의 영역이죠. 그래서 답은 ㄱ과 ㄷ이에요.",
    core: "부딪혀 멈추고, 꺾이고, 쓰러지는 것 전부 운동 상태 변화 = 힘의 일!",
  },
  {
    // [209] d2 AR grid num · 검산: 한 칸 2 N × 3칸 = 6 N(눈금 위 · 곱셈)
    id: "u5e209",
    lessonId: "u5l1",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "N",
    prompt: "그림은 모눈 위에 어떤 힘을 화살표로 나타낸 거예요. 이 화살표가 나타내는 힘의 크기는 몇 N일까요?",
    figure: arrowAnatFig({ mode: "grid", cell: "2 N", arrows: [{ row: 0, cells: 3 }] }),
    answer: "6",
    explain:
      "<span class='xh'>정답 풀이</span>화살표의 길이는 힘의 크기에 비례하게 그리기로 약속돼 있어요. 그림의 화살표는 모눈 <b>세 칸</b>짜리이고, 한 칸이 2 N이니까 ① 칸 수를 세고 ② 한 칸의 크기를 곱하면 2×3=<b>6 N</b>이에요.<span class='xh'>이렇게 틀려요</span>칸 수만 세고 '3 N'이라고 답하면 한 칸의 크기를 빼먹은 거예요. 반대로 '2 N'은 칸 수를 무시한 답이고요. 모눈 그림에서는 꼭 <b>한 칸이 몇 N인지</b>부터 확인한 다음 칸 수를 곱하세요. 이 약속 덕분에 화살표만 보고도 힘의 크기를 정확한 숫자로 읽어 낼 수 있는 거랍니다.",
    core: "모눈 화살표 읽기 = 한 칸의 크기 × 칸 수!",
  },
  {
    // [214] d1 무② multi · 검산: 빨라짐 참 · 방향 꺾임 참 / 그대로 놓임·모양 변화·상태 변화 거짓
    id: "u5e214",
    lessonId: "u5l1",
    type: "multi",
    diff: 1,
    prompt: "물체의 <b>운동 상태가 변한</b> 경우를 모두 고르세요.",
    options: [
      "미끄럼틀을 타고 내려오는 아이가 점점 빨라졌다",
      "날아가던 연이 바람에 밀려 방향을 바꿨다",
      "식탁 위의 컵이 그대로 놓여 있다",
      "빨대가 손에 눌려 구부러졌다",
      "얼음이 녹아서 물이 되었다",
    ],
    answer: [0, 1],
    explain:
      "<span class='xh'>정답 풀이</span>운동 상태 변화는 <b>빠르기</b>가 변하거나 <b>방향</b>이 변하는 것을 말해요. 점점 빨라진 아이는 빠르기 변화, 방향을 바꾼 연은 방향 변화니까 둘 다 정답이죠.<span class='xh'>오답 하나씩 격파</span>그대로 놓인 컵은 빠르기도 방향도 변한 게 없으니 운동 상태 변화가 아니에요. 구부러진 빨대는 힘을 받긴 했지만 <b>모양</b>이 변한 경우라서 운동 상태 쪽이 아니고요. 얼음이 물이 되는 건 물질의 상태가 변한 것이라 아예 힘의 효과 목록에 들어가지 않아요. \"빨라졌나? 느려졌나? 꺾였나?\" 이 세 가지 질문에 하나라도 '네'가 나와야 운동 상태 변화랍니다.",
    core: "운동 상태 변화 = 빠르기 변화 또는 방향 변화!",
  },
  // ── L2 힘의 평형 ──
  {
    // [221] d1 무① · 알짜힘 뜻 · 검산: 한 물체에 작용하는 여러 힘의 전체 효과
    id: "u5e221",
    lessonId: "u5l2",
    type: "mcq",
    diff: 1,
    prompt: "<b>알짜힘</b>에 대한 설명으로 옳은 것은?",
    options: [
      "물체가 받는 힘 중 가장 센 힘 하나를 가리키는 말이다",
      "두 힘의 크기를 방향과 상관없이 더한 값이다",
      "서로 다른 물체에 작용하는 힘들을 모아 놓은 것이다",
      "한 물체에 작용하는 여러 힘을 합한 전체 효과의 힘이다",
      "물체가 움직이고 있을 때만 생기는 힘이다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>알짜힘은 <b>한 물체</b>에 작용하는 여러 힘을 하나로 합쳤을 때의 <b>전체 효과</b>를 나타내는 힘이에요. 같은 방향이면 더하고, 반대 방향이면 큰 쪽에서 작은 쪽을 빼서 구하죠.<span class='xh'>오답 하나씩 격파</span>'가장 센 힘 하나'가 아니라 모든 힘을 합친 결과라는 게 핵심이에요. '방향과 상관없이 더한 값'도 틀려요. 반대 방향의 두 힘은 서로 지워지니까 방향을 꼭 따져야 하죠. '서로 다른 물체'의 힘은 애초에 합칠 대상이 아니에요. 알짜힘은 언제나 <b>한 물체</b> 기준이거든요. 그리고 정지한 물체에도 여러 힘이 작용할 수 있으니 '움직일 때만 생긴다'는 것도 어긋나요.",
    core: "알짜힘 = 한 물체가 받는 힘들의 전체 효과. 방향까지 따져 합해요!",
  },
  {
    // [222] d1 forcePairFig 같은 방향 · 검산: 4+3=7 N(같은 방향 합)
    id: "u5e222",
    lessonId: "u5l2",
    type: "mcq",
    diff: 1,
    prompt: "그림처럼 상자에 같은 방향으로 4 N과 3 N의 힘이 작용해요. 상자에 작용하는 알짜힘의 크기는?",
    figure: forcePairFig({ a: 4, b: 3 }),
    options: ["1 N", "7 N", "12 N", "4 N", "0 N"],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>두 힘이 <b>같은 방향</b>이면 힘을 합친 효과도 그 방향으로 더 커져요. 그래서 알짜힘은 4+3=<b>7 N</b>, 방향은 두 힘과 같은 쪽이죠. 두 사람이 한쪽에서 같이 밀면 더 세게 밀리는 것과 같아요.<span class='xh'>오답 하나씩 격파</span>'1 N'은 4−3을 계산한 값인데, 빼기는 두 힘이 <b>반대 방향</b>일 때 쓰는 방법이에요. 그림의 화살표는 둘 다 같은 쪽을 가리키고 있죠. '12 N'은 4×3을 곱해 버린 것으로 힘 합치기에 곱셈은 등장하지 않아요. '4 N'은 한쪽 힘만 남긴 답이고, '0 N'은 두 힘이 크기까지 같고 방향이 반대일 때만 나오는 값이에요.",
    core: "같은 방향 두 힘의 알짜힘 = 더하기, 방향은 그대로!",
  },
  {
    // [224] d1 forcePairFig 같은 방향 num · 검산: 2+9=11 N
    id: "u5e224",
    lessonId: "u5l2",
    type: "num",
    diff: 1,
    numKind: "int",
    unitLabel: "N",
    prompt: "그림처럼 수레에 같은 방향으로 2 N과 9 N의 힘이 작용해요. 수레에 작용하는 알짜힘의 크기는 몇 N일까요?",
    figure: forcePairFig({ a: 2, b: 9 }),
    answer: "11",
    explain:
      "<span class='xh'>정답 풀이</span>그림의 두 화살표가 <b>같은 방향</b>을 가리키고 있으니 두 힘은 서로 도와주는 관계예요. 이럴 때 알짜힘의 크기는 두 힘을 더해서 구해요. ① 방향 확인: 같은 방향 ② 계산: 2+9=<b>11 N</b>. 방향은 두 힘과 같은 쪽이고요.<span class='xh'>이렇게 틀려요</span>화살표 방향을 확인하지 않고 습관처럼 9−2=7로 빼면 틀려요. 빼기는 두 힘이 <b>반대 방향</b>으로 겨룰 때의 계산법이거든요. 알짜힘 문제의 첫 단계는 언제나 계산이 아니라 <b>화살표 방향 읽기</b>라는 걸 기억하세요. 같은 방향이면 더하기, 반대 방향이면 큰 힘에서 작은 힘 빼기예요.",
    core: "방향부터 확인! 같은 방향이면 더하기 = 2+9=11 N.",
  },
  {
    // [227] d2 FB 평형 bogi · 검산: 8 N·8 N 반대 = 평형 · 알짜힘 0 · ㄷ 12 N이면 12−8=4 N 왼쪽
    id: "u5e227",
    lessonId: "u5l2",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 정지해 있는 상자에 왼쪽으로 8 N, 오른쪽으로 8 N의 힘이 작용하고 있어요. 옳은 것을 보기에서 모두 고른 것은?",
    figure: forceSceneFig({
      arrows: [
        { dir: "l", n: 8, label: "8 N" },
        { dir: "r", n: 8, label: "8 N" },
      ],
      still: true,
    }),
    bogi: [
      "두 힘은 힘의 평형을 이루고 있다",
      "상자에 작용하는 알짜힘은 0이다",
      "왼쪽 힘만 12 N으로 커지면 알짜힘은 왼쪽으로 4 N이 된다",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 4,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>셋 다 옳아요. ㄱ: 두 힘이 <b>한 물체</b>(상자)에 작용하고, 크기가 8 N으로 같고, 방향이 반대니까 평형의 세 조건을 전부 만족해요. ㄴ: 평형이면 두 힘이 서로 지워져 알짜힘은 8−8=<b>0</b>이죠. 그래서 정지한 상자가 계속 정지해 있는 거예요. ㄷ: 왼쪽 힘이 12 N이 되면 반대 방향 두 힘이니 큰 쪽에서 작은 쪽을 빼요. 12−8=4 N이고 방향은 큰 힘 쪽인 <b>왼쪽</b>이 맞아요.<span class='xh'>더 챙길 것</span>평형은 '힘이 없다'가 아니라 힘들이 <b>서로 지워져 있는 상태</b>라는 게 포인트예요. 그림처럼 힘 화살표 두 개가 버젓이 그려져 있어도 알짜힘은 0일 수 있답니다.",
    core: "크기 같고 방향 반대인 두 힘(한 물체) = 평형 = 알짜힘 0!",
  },
  {
    // [234] d3 FB 세 힘 · 검산: 왼 2+3=5 vs 오 5 → 알짜힘 0(평형)
    id: "u5e234",
    lessonId: "u5l2",
    type: "mcq",
    diff: 3,
    prompt: "그림처럼 짐수레에 왼쪽으로 2 N과 3 N, 오른쪽으로 5 N의 힘이 함께 작용해요. 짐수레에 작용하는 알짜힘은?",
    figure: forceSceneFig({
      obj: "cart",
      arrows: [
        { dir: "l", n: 2, label: "2 N" },
        { dir: "l", n: 3, label: "3 N" },
        { dir: "r", n: 5, label: "5 N" },
      ],
    }),
    options: [
      "0 N이며, 힘들이 평형을 이루고 있다",
      "왼쪽으로 5 N이다",
      "오른쪽으로 5 N이다",
      "오른쪽으로 10 N이다",
      "왼쪽으로 1 N이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>힘이 셋이어도 요령은 같아요. ① 같은 방향끼리 먼저 합쳐요. 왼쪽 팀은 2+3=5 N. ② 반대 방향끼리 비교해요. 왼쪽 5 N vs 오른쪽 5 N. 크기가 같고 방향이 반대니까 서로 완전히 지워져 알짜힘은 <b>0</b>, 짐수레는 평형 상태예요.<span class='xh'>오답 하나씩 격파</span>'왼쪽으로 5 N'은 왼쪽 팀만 합치고 오른쪽 5 N을 빼먹은 답이에요. '오른쪽으로 5 N'은 반대로 왼쪽 두 힘을 무시했고요. '오른쪽으로 10 N'은 방향을 안 따지고 전부 더해 버린 값인데, 반대 방향 힘은 더하는 게 아니라 지워지는 관계죠. '왼쪽으로 1 N'은 3−2처럼 일부만 계산한 실수예요.",
    core: "여러 힘은 같은 방향끼리 합친 뒤 반대편과 대결! 5 vs 5 = 0.",
  },
  // ── L3 중력 ──
  {
    // [243] d1 무① · 중력 뜻 · 검산: 방향 = 지구 중심 쪽 · 비접촉으로도 작용
    id: "u5e243",
    lessonId: "u5l3",
    type: "mcq",
    diff: 1,
    prompt: "<b>중력</b>에 대한 설명으로 옳은 것은?",
    options: [
      "지구에 닿아 있는 물체에만 작용한다",
      "지구가 물체를 지구 중심 쪽으로 끌어당기는 힘이다",
      "물체를 지면과 나란한 방향으로 미는 힘이다",
      "무거운 물체에만 작용하고 가벼운 물체에는 작용하지 않는다",
      "달 표면에서는 중력이 전혀 작용하지 않는다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>중력은 지구가 물체를 <b>지구 중심 쪽</b>으로 끌어당기는 힘이에요. 우리가 '아래'라고 부르는 방향이 사실은 지구 중심을 향하는 방향이죠.<span class='xh'>오답 하나씩 격파</span>'닿아 있는 물체에만'은 틀려요. 중력은 떨어져 있어도 작용하는 힘이라, 공중의 빗방울이나 높이 던진 공도 끌어당기죠. '지면과 나란한 방향'이면 물체가 옆으로 굴러가야 할 텐데 실제로는 아래로 떨어지고요. '무거운 물체에만'도 틀려요. 깃털처럼 가벼운 물체에도 중력은 작용해요. 크기가 작을 뿐이죠. 달에도 중력이 있어요. 지구의 6분의 1 정도로 약할 뿐, 없는 게 아니랍니다.",
    core: "중력 = 지구가 지구 중심 쪽으로 당기는 힘. 안 닿아도, 가벼워도 작용!",
  },
  {
    // [244] d2 GD 지구 · 검산: (가) 위쪽 물체 → 아래(㉯ = in) · (나) 왼쪽 물체 → 오른쪽(㉱ = in) · 옆 물체 함정
    id: "u5e244",
    lessonId: "u5l3",
    type: "mcq",
    diff: 2,
    prompt: "그림은 지구 주위 두 곳에 물체 (가), (나)를 가만히 놓은 모습이에요. 각 물체가 움직이기 시작하는 방향을 옳게 짝 지은 것은?",
    figure: gravityDirsFig({
      spots: [
        { label: "(가)", deg: 90, cands: [{ name: "㉮", dir: "out" }, { name: "㉯", dir: "in" }] },
        { label: "(나)", deg: 180, cands: [{ name: "㉰", dir: "out" }, { name: "㉱", dir: "in" }] },
      ],
    }),
    options: ["(가) ㉮, (나) ㉰", "(가) ㉮, (나) ㉱", "(가) ㉯, (나) ㉰", "(가) ㉯, (나) ㉱", "둘 다 움직이지 않는다"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>가만히 놓은 물체는 중력을 받아 <b>지구 중심 쪽</b>으로 움직이기 시작해요. 지구 위쪽에 있는 (가)에게 지구 중심은 화면 아래쪽이니 ㉯ 방향이 맞아요. 지구 왼쪽 옆에 있는 (나)에게 지구 중심은 화면 오른쪽이니 ㉱ 방향이죠.<span class='xh'>오답 하나씩 격파</span>㉮와 ㉰는 지구에서 멀어지는 쪽이라 중력의 방향과 정반대예요. 특히 (나)를 '아래쪽'으로 떨어진다고 생각하기 쉬운데, 중력의 방향은 화면의 아래가 아니라 언제나 <b>지구 중심 쪽</b>이라는 게 이 문제의 핵심 함정이에요. 지구 반대편 사람이 우주로 떨어지지 않는 것도 같은 이유죠. '움직이지 않는다'는 중력을 무시한 답이고요.",
    core: "중력의 방향 = 화면 아래가 아니라 언제나 지구 중심 쪽!",
  },
  {
    // [248] d2 svgTable 비교표 · 검산: ㉠ 물질의 고유한 양 · ㉡ 중력의 크기 · ㉢ kg
    // ('뜻' 행은 양쪽 다 빈칸 · 한쪽을 인쇄하면 246/247 정의 직문의 정답 선언 · 검산 A 반영)
    id: "u5e248",
    lessonId: "u5l3",
    type: "mcq",
    diff: 2,
    prompt: "표는 질량과 무게를 비교한 거예요. 빈칸 ㉠~㉢에 들어갈 말을 옳게 짝 지은 것은?",
    figure: svgTable(["구분", "질량", "무게"], [
      ["뜻", "㉠", "㉡"],
      ["단위", "㉢", "N"],
      ["재는 저울", "양팔저울", "용수철저울"],
    ], { firstColHead: true }),
    options: [
      "㉠ 중력의 크기 · ㉡ 물질의 고유한 양 · ㉢ kg",
      "㉠ 물질의 고유한 양 · ㉡ 물체의 부피 · ㉢ N",
      "㉠ 물질의 고유한 양 · ㉡ 중력의 크기 · ㉢ kg",
      "㉠ 물질의 고유한 양 · ㉡ 중력의 크기 · ㉢ N",
      "㉠ 물체의 부피 · ㉡ 중력의 크기 · ㉢ kg",
    ],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>세 칸을 차례로 채워 봐요. ㉠ 질량의 뜻은 장소가 바뀌어도 변하지 않는 <b>물질의 고유한 양</b>이에요. ㉡ 무게의 뜻은 물체에 작용하는 <b>중력의 크기</b>고요. ㉢ 질량의 단위는 <b>kg</b>이에요. 무게 쪽에 이미 N이 적혀 있는 것과 짝을 이루죠.<span class='xh'>오답 하나씩 격파</span>㉠과 ㉡을 서로 맞바꾼 짝이 대표 함정이에요. 고유한 양은 질량, 중력의 크기는 무게라는 방향을 확실히 잡아 두세요. ㉢에 N을 넣은 짝은 단위마저 뒤바꾼 것으로, N은 힘(무게)의 단위라 질량 칸에 올 수 없어요. '물체의 부피'는 물체가 차지하는 공간이라 질량의 뜻도 무게의 뜻도 아니랍니다. 표의 저울 행(양팔저울·용수철저울)과 세로로 짝을 맞춰 검산하는 것도 좋은 요령이에요.",
    core: "질량 = 고유한 양(kg·양팔저울) ↔ 무게 = 중력의 크기(N·용수철저울)!",
  },
  {
    // [252] d2 svgTable num · 검산: 달 7 N × 6 = 지구 42 N(1/6 단서 문두 제시)
    id: "u5e252",
    lessonId: "u5l3",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "N",
    prompt: "표는 같은 돌의 무게를 달과 지구에서 용수철저울로 잰 기록의 일부예요. 달에서의 중력은 지구의 1/6이에요. ㉠에 들어갈 값은 몇 N일까요?",
    figure: svgTable(["잰 곳", "용수철저울 눈금"], [
      ["달", "7 N"],
      ["지구", "㉠"],
    ], { firstColHead: true }),
    answer: "42",
    explain:
      "<span class='xh'>정답 풀이</span>달의 중력이 지구의 1/6이라는 건, 거꾸로 지구의 중력이 달의 <b>6배</b>라는 뜻이에요. 달에서 7 N이었으니 지구에서는 ① 방향 확인: 달→지구는 커지는 쪽 ② 계산: 7×6=<b>42 N</b>이죠.<span class='xh'>이렇게 틀려요</span>7÷6을 계산하면 달에서 잰 값을 또 줄이는 셈이 돼요. 나누기 6은 지구 값에서 달 값으로 갈 때 쓰는 방향이에요. 지금은 달 값에서 지구 값을 구하니까 곱하기 6이 맞죠. 환산 문제는 <b>어느 쪽으로 가는 계산인지</b>부터 정하는 게 요령이에요. 참고로 질량이었다면 달에서든 지구에서든 그대로라 환산 자체가 필요 없답니다.",
    core: "달→지구는 ×6, 지구→달은 ÷6. 방향부터 정하고 계산!",
  },
  {
    // [254] d2 dbox bogi · 검산: 24÷6=4 N(ㄱ 참) · 질량 1/6(ㄴ 거짓) · 물질 양 불변(ㄷ 참)
    id: "u5e254",
    lessonId: "u5l3",
    type: "mcq",
    diff: 2,
    prompt: "자료를 읽고, 옳은 설명을 보기에서 모두 고른 것은?",
    figure: dbox([
      ["측정", "지구에서 어떤 물체를 용수철저울로 재니 24 N이었다"],
      ["계획", "이 물체를 달에 가져가 다시 잰다 (달의 중력은 지구의 1/6)"],
    ]),
    bogi: [
      "달에서 용수철저울로 재면 4 N이 된다",
      "달에서 양팔저울로 잰 질량은 지구의 1/6로 줄어든다",
      "물체를 이루는 물질의 양은 달에서도 그대로다",
    ],
    options: ["ㄱ", "ㄷ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ은 참이에요. 무게는 중력의 크기라서 달에서는 24÷6=<b>4 N</b>으로 줄어요. 용수철저울은 바로 이 무게를 재는 도구고요. ㄷ도 참이에요. 물체를 이루는 <b>물질의 양</b>, 곧 질량은 장소가 바뀌어도 변하지 않아요. 달에 간다고 물질이 사라지는 건 아니니까요.<span class='xh'>오답 하나씩 격파</span>ㄴ이 이 문제의 함정이에요. 1/6로 줄어드는 건 <b>무게뿐</b>이고, 질량은 달에서도 그대로예요. 양팔저울은 추와 균형을 맞춰 질량을 재는 도구라 달에서도 지구와 같은 값을 가리키죠. '달에 가면 다 가벼워지니 질량도 줄겠지'가 가장 흔한 착각이랍니다.",
    core: "달에서 변하는 건 무게(÷6)뿐. 질량과 양팔저울 값은 그대로!",
  },
  {
    // [255] d2 svgTable 저울 기록 해석 · 검산: 지구 58.8 N = 9.8×6 · 달 9.8 N = 58.8÷6(9.8 체계 정합)
    // (초판 12 N·2 kg은 9.8 규칙 위반 + 양팔저울 행 인쇄가 253·249의 정답 데이터 제공 · 검산 A 반영:
    //  용수철저울 기록만 제시 · 질량·양팔저울은 보기 판정 대상으로만)
    id: "u5e255",
    lessonId: "u5l3",
    type: "mcq",
    diff: 2,
    prompt: "표는 같은 물체의 무게를 지구와 달에서 용수철저울로 잰 기록이에요. 이 기록에 대한 해석으로 옳은 것은?",
    figure: svgTable(["잰 곳", "용수철저울 눈금"], [
      ["지구", "58.8 N"],
      ["달", "9.8 N"],
    ], { firstColHead: true }),
    options: [
      "달에서는 물체를 이루는 물질의 양이 줄어든다",
      "눈금이 달라진 것은 무게가 장소에 따라 변하기 때문이다",
      "지구의 용수철저울이 고장 나서 큰 값이 나왔다",
      "달에서 잰 값이 이 물체의 질량이다",
      "달의 중력이 지구의 중력보다 강하다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>용수철저울은 <b>무게</b>(중력의 크기)를 재요. 달의 중력은 지구의 1/6 수준으로 약하니까 58.8 N이던 눈금이 9.8 N으로 줄어든 거죠. 무게는 재는 <b>장소에 따라 변하는 값</b>이라는 사실이 기록에 그대로 드러난 거예요.<span class='xh'>오답 하나씩 격파</span>'물질의 양이 줄었다'는 틀려요. 달에 간다고 물체의 알맹이가 사라지지 않으니 질량은 그대로죠. 줄어든 건 그 물체를 당기는 중력뿐이에요. '고장'은 근거 없는 추측이고, 두 값의 비가 정확히 6배라는 규칙성이 오히려 정상 측정의 증거예요. '달에서 잰 값이 질량'은 틀려요. 용수철저울 눈금은 어디서 재든 <b>무게</b>지 질량이 아니거든요. '달의 중력이 더 강하다'면 달 눈금이 더 커야 하니 기록과 정반대죠.",
    core: "용수철저울 눈금은 어디서든 무게. 변한 건 장소의 중력!",
  },
  // ── L4 탄성력 ──
  {
    // [266] d1 무① · 탄성력 뜻 · 검산: 원래 모양으로 되돌아가려는 힘
    id: "u5e266",
    lessonId: "u5l4",
    type: "mcq",
    diff: 1,
    prompt: "<b>탄성력</b>에 대한 설명으로 옳은 것은?",
    options: [
      "물체가 바닥을 누르는 힘이다",
      "모양이 변한 물체가 원래 모양으로 되돌아가려는 힘이다",
      "물체를 지구 중심 쪽으로 끌어당기는 힘이다",
      "접촉면에서 물체의 운동을 방해하는 힘이다",
      "물체가 빨리 움직일수록 커지는 힘이다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>탄성력은 힘을 받아 <b>모양이 변한</b> 물체가 <b>원래 모양으로 되돌아가려는</b> 힘이에요. 늘어난 용수철은 줄어들려 하고, 눌린 용수철은 펴지려 하죠. 그래서 방향은 언제나 변형된 것과 반대, 곧 원래 모양을 회복하는 쪽이에요.<span class='xh'>오답 하나씩 격파</span>'지구 중심 쪽으로 끌어당기는 힘'은 중력의 정의고, '접촉면에서 운동을 방해하는 힘'은 마찰력의 정의예요. 이 단원의 힘들은 정의 문장이 서로 헷갈리게 출제되니 힘의 이름표를 정확히 붙여 두세요. '바닥을 누르는 힘'은 탄성력의 정의가 아니고, '빨리 움직일수록 커진다'도 틀려요. 탄성력의 크기를 정하는 건 빠르기가 아니라 <b>변형된 정도</b>거든요.",
    core: "탄성력 = 변형된 물체가 원래 모양으로 돌아가려는 힘!",
  },
  {
    // [268] d1 사진 spring-coil · 검산: 눌린 용수철 → 손을 위로 밀어냄(원래 모양 회복 방향)
    id: "u5e268",
    lessonId: "u5l4",
    type: "mcq",
    diff: 1,
    prompt: "사진처럼 손으로 용수철을 위에서 눌러 찌그러뜨렸어요. 이때 용수철이 <b>손에</b> 작용하는 탄성력의 방향은?",
    figure: ximg("spring-coil.webp", "손바닥이 탁자 위에 세운 금속 용수철을 위에서 누르고 있는 모습"),
    options: [
      "위쪽 (원래 모양으로 펴지려는 방향)",
      "아래쪽 (손이 누르는 방향)",
      "옆쪽 (용수철이 쓰러지는 방향)",
      "힘이 작용하지 않는다",
      "위와 아래에 번갈아 작용한다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>눌려서 짧아진 용수철은 <b>원래 길이로 펴지려고</b> 해요. 그래서 자기를 누르는 손을 <b>위쪽</b>으로 밀어내죠. 손바닥으로 용수철을 눌러 보면 손이 되밀리는 느낌이 나는데, 그게 바로 탄성력이에요.<span class='xh'>오답 하나씩 격파</span>'아래쪽'은 손이 용수철을 누르는 힘의 방향이에요. 문제는 용수철이 <b>손에</b> 주는 힘을 물었으니 주인공을 바꿔 읽으면 안 돼요. '옆쪽'은 변형된 방향과 무관하고, '힘이 작용하지 않는다'면 손을 뗐을 때 용수철이 튕겨 펴질 이유가 없죠. '번갈아 작용한다'도 틀려요. 눌려 있는 동안 탄성력은 꾸준히 <b>펴지려는 한 방향</b>으로만 작용한답니다.",
    core: "눌린 용수철의 탄성력 = 펴지려는 방향(누른 손을 되밀어요)!",
  },
  {
    // [271] d2 svgTable num · 검산: 1 N당 4 cm(0.25 N/cm) · 6 N → 24 cm(레슨 0.5·구 표 3 cm/N·미래엔 0.375 회피)
    id: "u5e271",
    lessonId: "u5l4",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "cm",
    prompt: "표는 어떤 용수철에 추를 매달며 늘어난 길이를 잰 거예요. 이 용수철에 6 N인 추를 매달면 몇 cm 늘어날까요?",
    figure: svgTable(["추의 무게", "늘어난 길이"], [
      ["1 N", "4 cm"],
      ["2 N", "8 cm"],
      ["3 N", "12 cm"],
    ], { firstColHead: true }),
    answer: "24",
    explain:
      "<span class='xh'>정답 풀이</span>표를 읽으면 규칙이 보여요. 1 N에 4 cm, 2 N에 8 cm, 3 N에 12 cm. 무게가 1 N 늘 때마다 <b>4 cm씩</b> 더 늘어나는 비례 관계죠. 그러니 6 N이면 ① 규칙 찾기: 1 N당 4 cm ② 계산: 4×6=<b>24 cm</b>예요.<span class='xh'>이렇게 틀려요</span>3 N에서 12 cm였으니 6 N이면 '12에 4를 더해 16 cm'처럼 한 칸만 더 가는 실수를 조심하세요. 6 N은 3 N의 <b>2배</b>니까 늘어난 길이도 2배인 24 cm가 돼요. 용수철의 늘어난 길이는 매단 힘에 <b>비례</b>한다는 것, 그래서 배수로 늘어난다는 것이 이 표가 보여 주는 핵심 규칙이랍니다.",
    core: "표에서 규칙부터: 1 N당 4 cm → 6 N이면 24 cm!",
  },
  {
    // [272] d2 springExamGraph num · 검산: 기울기 0.4 N/cm · x=10 → 4 N(x 눈금 5 간격·y 눈금 2 간격 위 · dots 가이드 점선은 정답 인쇄라 미사용)
    id: "u5e272",
    lessonId: "u5l4",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "N",
    prompt: "그래프는 어떤 용수철이 늘어난 길이에 따른 탄성력이에요. 이 용수철이 10 cm 늘어났을 때 탄성력은 몇 N일까요?",
    figure: springExamGraph({ slope: 0.4, xMax: 15, xStep: 5, yMax: 6, yStep: 2 }),
    answer: "4",
    explain:
      "<span class='xh'>정답 풀이</span>그래프의 가로축에서 10 cm를 찾고, 직선과 만나는 점의 세로축 값을 읽으면 <b>4 N</b>이에요. 원점을 지나는 곧은 직선이니 늘어난 길이와 탄성력이 비례한다는 뜻이고, 5 cm에 2 N이었으니 10 cm면 그 2배인 4 N이라고 확인할 수도 있죠.<span class='xh'>이렇게 틀려요</span>가로축과 세로축을 바꿔 읽어 '10 N'이라고 답하면 안 돼요. 이 그래프에서 세로축이 탄성력(N), 가로축이 늘어난 길이(cm)예요. 축 이름부터 확인하는 습관이 그래프 문제의 절반이에요. 그리고 눈금 하나가 세로축은 2 N씩이라는 것도 놓치기 쉬워요. 눈금 간격을 1로 잘못 세면 엉뚱한 값이 나온답니다.",
    core: "그래프 읽기 = 축 이름·눈금 간격 확인 → 10 cm에서 4 N!",
  },
  {
    // [275] d2 SH hang · 검산: 매달려 정지 = 평형 → 탄성력(위) = 추 무게, 방향+크기 짝
    id: "u5e275",
    lessonId: "u5l4",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 천장에 매단 용수철에 추를 걸었더니 용수철이 늘어난 채 추가 가만히 멈춰 있어요. 이때 용수철이 추에 작용하는 탄성력의 <b>방향</b>과 <b>크기</b>를 옳게 짝 지은 것은?",
    figure: springHangFig({ kind: "hang" }),
    options: [
      "위쪽이며, 추의 무게와 크기가 같다",
      "위쪽이며, 추의 무게보다 크다",
      "아래쪽이며, 추의 무게와 크기가 같다",
      "아래쪽이며, 추의 무게보다 작다",
      "위쪽이며, 추의 무게보다 작다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>늘어난 용수철은 원래 길이로 <b>줄어들려고</b> 하니까 추를 <b>위쪽</b>으로 당겨요. 그리고 추가 가만히 멈춰 있다는 건 추에 작용하는 힘들이 평형이라는 뜻이죠. 추를 아래로 당기는 중력(무게)과 위로 당기는 탄성력이 <b>같은 크기</b>로 맞서고 있는 거예요.<span class='xh'>오답 하나씩 격파</span>탄성력이 무게보다 크다면 추는 위로 끌려 올라가야 하고, 작다면 계속 아래로 내려가야 해요. 멈춰 있다는 관찰 자체가 '크기가 같다'의 증거랍니다. '아래쪽'을 고른 짝은 탄성력과 중력의 방향을 뒤바꾼 것이에요. 늘어난 용수철의 탄성력은 늘어난 것과 반대, 곧 줄어드는 쪽(위)이에요.",
    core: "매달려 정지 = 평형! 탄성력은 위쪽, 크기는 무게와 같아요.",
  },
  {
    // [279] d2 사진 bungee · 검산: 최대로 늘어난 줄 → 탄성력 위쪽(원래 길이로 줄어드는 방향)
    id: "u5e279",
    lessonId: "u5l4",
    type: "mcq",
    diff: 2,
    prompt: "사진은 번지점프 줄이 가장 길게 늘어난 순간이에요. 이 순간 줄이 사람에게 작용하는 탄성력에 대한 설명으로 옳은 것은?",
    figure: ximg("bungee-cord.webp", "다리 아래로 길게 늘어난 번지점프 줄 끝에 사람이 매달려 있는 모습"),
    options: [
      "아래쪽으로 작용하여 사람을 더 내려가게 한다",
      "이 순간에는 탄성력이 작용하지 않는다",
      "위쪽으로 작용하며, 줄이 원래 길이로 되돌아가려 하기 때문이다",
      "옆쪽으로 작용하여 사람을 흔들리게 한다",
      "줄이 늘어나기 전보다 탄성력이 작아져 있다",
    ],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>줄이 가장 길게 <b>늘어나 있는</b> 순간이니, 줄은 원래 길이로 <b>되돌아가려는</b> 힘을 내요. 늘어난 것과 반대 방향, 곧 <b>위쪽</b>으로 사람을 당기죠. 그래서 번지점프를 하면 최하점에서 다시 위로 튕겨 올라가는 거예요.<span class='xh'>오답 하나씩 격파</span>'아래쪽'은 중력의 방향이지 탄성력의 방향이 아니에요. '작용하지 않는다'는 틀려요. 오히려 줄이 <b>가장 많이 변형된</b> 순간이라 탄성력도 가장 크죠. 같은 이유로 '늘어나기 전보다 작아져 있다'도 거꾸로예요. 탄성력은 변형이 클수록 커지니까요. '옆쪽'은 줄이 늘어난 방향과 무관한 방향이라 성립하지 않아요.",
    core: "가장 많이 늘어난 순간 = 탄성력 최대, 방향은 되돌아가는 쪽(위)!",
  },
  // ── L5 마찰력 ──
  {
    // [289] d1 무① · 마찰력 뜻 · 검산: 접촉면에서 운동을 방해
    id: "u5e289",
    lessonId: "u5l5",
    type: "mcq",
    diff: 1,
    prompt: "<b>마찰력</b>에 대한 설명으로 옳은 것은?",
    options: [
      "물체를 위로 밀어 올리는 힘이다",
      "변형된 물체가 원래 모양으로 되돌아가려는 힘이다",
      "떨어져 있는 물체 사이에서 작용하는 힘이다",
      "두 물체의 접촉면에서 물체의 운동을 방해하는 힘이다",
      "물체가 미끄러지는 것을 도와주는 힘이다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>마찰력은 두 물체가 맞닿은 <b>접촉면</b>에서, 물체가 움직이거나 움직이려는 것을 <b>방해하는</b> 힘이에요. 아무리 매끈해 보여도 접촉면을 확대하면 울퉁불퉁한 요철이 서로 맞물려 있는데, 이게 미끄러짐을 붙잡는 거죠.<span class='xh'>오답 하나씩 격파</span>'위로 밀어 올리는 힘'은 부력, '원래 모양으로 되돌아가려는 힘'은 탄성력의 정의라 이름표가 바뀐 보기예요. '떨어져 있는 물체 사이'는 틀려요. 마찰력은 반드시 <b>맞닿아야</b> 생기는 힘이거든요. 떨어져서도 작용하는 건 중력 같은 힘이죠. '미끄러지는 것을 도와준다'는 정반대예요. 마찰력이 운동을 도와준다면 물체가 혼자 점점 빨라져야 하는데 그런 일은 일어나지 않아요.",
    core: "마찰력 = 접촉면에서 운동을 방해하는 힘. 닿아야 생겨요!",
  },
  {
    // [290] d1 FB cand · 검산: 오른쪽으로 미끄러짐 → 마찰력 왼쪽(㉯) · 후보 제시형
    id: "u5e290",
    lessonId: "u5l5",
    type: "mcq",
    diff: 1,
    prompt: "그림처럼 상자가 얼음판 위에서 오른쪽으로 미끄러져 가고 있어요. 이때 상자에 작용하는 마찰력의 방향은 ㉮~㉱ 중 어느 것일까요?",
    figure: forceSceneFig({
      motion: "r",
      ground: "ice",
      cand: [
        { name: "㉮", dir: "r" },
        { name: "㉯", dir: "l" },
        { name: "㉰", dir: "u" },
        { name: "㉱", dir: "d" },
      ],
    }),
    options: ["㉮", "㉯", "㉰", "㉱", "마찰력은 작용하지 않는다"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>마찰력은 운동을 <b>방해하는</b> 힘이니까 방향은 언제나 물체가 움직이는 방향의 <b>반대쪽</b>이에요. 상자가 오른쪽으로 미끄러지는 중이니 마찰력은 왼쪽, 곧 ㉯ 방향이죠. 그래서 밀기를 멈춘 상자는 서서히 느려지다 멈추는 거예요.<span class='xh'>오답 하나씩 격파</span>㉮(오른쪽)라면 마찰력이 상자를 밀어 주는 셈이라 상자가 혼자 빨라져야 해요. ㉰(위쪽)는 부력 같은 힘의 방향이고, ㉱(아래쪽)는 중력의 방향이라 마찰력과는 관계없죠. '작용하지 않는다'도 틀려요. 얼음판이 미끄럽다는 건 마찰력이 <b>작다</b>는 뜻이지 <b>없다</b>는 뜻이 아니거든요. 작아도 분명히 반대 방향으로 작용하고 있답니다.",
    core: "마찰력의 방향 = 움직이는 방향의 정반대. \"가는 길을 막는다\"!",
  },
  {
    // [292] d2 FR 표면 비교 · 검산: 값 큰 판(9 N)이 더 거침 · 같은 도막(무게 통제)
    id: "u5e292",
    lessonId: "u5l5",
    type: "mcq",
    diff: 2,
    prompt: "그림은 같은 나무 도막을 (가), (나) 두 판 위에서 용수철저울로 천천히 당겨, 움직이기 시작하는 순간의 값을 잰 거예요. 이 실험에 대한 설명으로 옳은 것은?",
    figure: frictionRigFig({
      boards: [
        { surface: "rough", blocks: 1, val: "9 N", label: "(가)" },
        { surface: "smooth", blocks: 1, val: "4 N", label: "(나)" },
      ],
    }),
    options: [
      "(가) 판의 표면이 (나)보다 거칠다",
      "(나) 판에서 마찰력이 더 크다",
      "두 판에서 마찰력의 크기는 같다",
      "(가) 판 위의 도막이 더 무겁다",
      "용수철저울의 값은 마찰력과 관계없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>움직이기 시작하는 순간까지 당긴 힘이 클수록, 그만큼 큰 마찰력이 버티고 있었다는 뜻이에요. (가)는 9 N, (나)는 4 N이 필요했으니 (가) 쪽 마찰력이 더 크죠. 그런데 <b>같은 도막</b>이라 무게는 같으니, 남는 원인은 하나. (가) 판의 표면이 더 <b>거칠다</b>는 거예요.<span class='xh'>오답 하나씩 격파</span>'(나)에서 마찰력이 더 크다'는 값을 거꾸로 읽은 거고, '같다'면 두 저울 값이 다를 이유가 없죠. '(가) 도막이 더 무겁다'는 틀려요. 같은 도막을 옮겨 가며 쟀으니 무게는 같게 맞춘(통제한) 조건이에요. 저울 값은 그 순간 마찰력과 맞서는 힘이니 '관계없다'도 성립하지 않아요.",
    core: "같은 물체인데 당기는 힘이 더 든다 = 접촉면이 더 거칠다!",
  },
  {
    // [294] d2 pushStillFig num · 검산: 7 N으로 미는데 정지 → 마찰력 = 7 N(평형 · 구 6 N·천 5 N 회피)
    id: "u5e294",
    lessonId: "u5l5",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "N",
    prompt: "그림처럼 거친 바닥 위의 상자를 7 N의 힘으로 밀고 있지만 상자는 움직이지 않아요. 이 순간 상자에 작용하는 마찰력의 크기는 몇 N일까요?",
    figure: pushStillFig(7),
    answer: "7",
    explain:
      "<span class='xh'>정답 풀이</span>미는데도 상자가 <b>정지</b>해 있다는 건, 미는 힘과 마찰력이 평형을 이루고 있다는 뜻이에요. 알짜힘이 0이어야 정지 상태가 유지되니까요. 그래서 마찰력은 미는 힘과 같은 크기인 <b>7 N</b>, 방향은 미는 방향의 반대예요.<span class='xh'>이렇게 틀려요</span>'움직이지 않으니 마찰력은 0'이라고 생각하기 쉬운데 정반대예요. 마찰력이 0이라면 7 N이 고스란히 알짜힘이 되어 상자가 밀려가야 하죠. 안 밀리는 건 마찰력이 <b>같은 크기로 맞서는 중</b>이라는 증거예요. 그리고 더 세게 밀면 버티는 마찰력도 따라 커지다가, 한계를 넘는 순간 상자가 움직이기 시작한답니다.",
    core: "밀어도 정지 = 마찰력이 미는 힘과 같은 크기(7 N)로 버티는 중!",
  },
  {
    // [297] d1 사진 cleats · 검산: 스터드 = 마찰 크게 → 같은 목적 = 미끄럼 방지(요가 매트 무늬)
    id: "u5e297",
    lessonId: "u5l5",
    type: "mcq",
    diff: 1,
    prompt: "사진은 바닥에 돌기가 붙어 있는 축구화예요. 이 돌기와 <b>같은 목적</b>으로 마찰력을 이용한 것은?",
    figure: ximg("soccer-cleats.webp", "바닥에 둥근 돌기들이 붙어 있는 축구화 밑창"),
    options: [
      "미끄럼틀 표면을 매끈하게 다듬는다",
      "요가 매트 바닥에 올록볼록한 무늬를 넣는다",
      "기계의 톱니바퀴에 윤활유를 바른다",
      "서랍 레일을 부드럽게 손질한다",
      "얼음판을 반들반들하게 고른다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>축구화 돌기는 신발과 잔디 사이의 마찰력을 <b>키워서</b> 미끄러지지 않게 하는 장치예요. 요가 매트의 올록볼록한 무늬도 똑같아요. 표면을 거칠게 만들어 마찰력을 키우고, 운동 중에 발이나 매트가 밀리지 않게 하죠.<span class='xh'>오답 하나씩 격파</span>나머지는 전부 마찰력을 <b>줄이는</b> 쪽이에요. 미끄럼틀을 매끈하게 하는 건 잘 미끄러지라고, 톱니바퀴에 윤활유를 바르는 건 부품이 부드럽게 돌라고, 서랍 레일 손질과 얼음판 고르기도 걸림 없이 미끄러지게 하려는 거죠. 마찰력 문제는 \"여기서 미끄러지면 좋은가, 나쁜가\"를 물어보면 돼요. 나쁘면 크게, 좋으면 작게 만든 거랍니다.",
    core: "돌기·울퉁불퉁 무늬 = 마찰력 크게(미끄럼 방지) 팀!",
  },
  {
    // [302] d3 FR 무게 비교 bogi · 검산: 다르게 한 것 = 무게(ㄱ 거짓: 거칠기라고 서술) · 통제 = 거칠기(ㄴ 참) · 결론 무게↑ 마찰↑(ㄷ 참)
    id: "u5e302",
    lessonId: "u5l5",
    type: "mcq",
    diff: 3,
    prompt: "그림은 같은 나무판 위에서 도막을 1개 얹었을 때와 2개 쌓았을 때, 움직이기 시작하는 순간의 힘을 잰 실험이에요. 옳은 것을 보기에서 모두 고른 것은?",
    figure: frictionRigFig({
      boards: [
        { surface: "rough", blocks: 1, val: "5 N", label: "(가)" },
        { surface: "rough", blocks: 2, val: "9 N", label: "(나)" },
      ],
    }),
    bogi: [
      "이 실험에서 다르게 한 조건은 접촉면의 거칠기다",
      "같은 나무판을 쓴 것은 접촉면의 거칠기를 같게 하기 위해서다",
      "물체가 무거울수록 마찰력이 커진다는 것을 알 수 있다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄴ은 참이에요. 이 실험은 무게의 효과만 보고 싶은 실험이라, 거칠기가 끼어들지 못하게 <b>같은 나무판</b>으로 고정한 거죠. ㄷ도 참이에요. 도막을 2개로 쌓아 무겁게 했더니 필요한 힘이 5 N에서 9 N으로 커졌으니, 무거울수록 마찰력이 커진다는 결론이 나와요.<span class='xh'>오답 하나씩 격파</span>ㄱ이 함정이에요. 이 실험에서 <b>다르게 한 조건</b>은 접촉면의 거칠기가 아니라 도막의 개수, 곧 물체의 <b>무게</b>예요. 거칠기는 오히려 같게 맞춘 조건이죠. 실험 문제에서는 \"무엇을 바꿨고, 무엇을 고정했나\"를 구분하는 게 핵심이에요. 바꾼 것이 원인 후보, 고정한 것이 공정한 비교 장치랍니다.",
    core: "바꾼 조건 = 무게(도막 수), 고정한 조건 = 거칠기(같은 판)!",
  },
  // ── L6 부력 ──
  {
    // [313] d1 무① · 부력 뜻·방향 · 검산: 위로 밀어 올림 · 중력 반대
    id: "u5e313",
    lessonId: "u5l6",
    type: "mcq",
    diff: 1,
    prompt: "<b>부력</b>에 대한 설명으로 옳은 것은?",
    options: [
      "물이 물체를 아래로 끌어내리는 힘이다",
      "접촉면에서 물체의 운동을 방해하는 힘이다",
      "물에 잠긴 물체에만 작용하고 공기 중에는 없는 힘이다",
      "물이나 공기가 물체를 위로 밀어 올리는 힘이다",
      "물체가 무거울수록 커지는 힘이다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>부력은 물이나 공기가 물체를 <b>위로 밀어 올리는</b> 힘이에요. 방향은 중력과 반대인 위쪽으로 정해져 있죠. 물속에서 몸이 가볍게 느껴지는 것도, 뚜껑 닫은 빈 페트병을 물속에 누르면 손을 되미는 것도 부력의 일이에요.<span class='xh'>오답 하나씩 격파</span>'아래로 끌어내린다'는 방향을 뒤집은 말이고, '운동을 방해하는 힘'은 마찰력의 정의예요. '공기 중에는 없다'도 틀려요. 헬륨 풍선이 하늘로 떠오르는 건 <b>공기의 부력</b> 덕분이거든요. '무거울수록 커진다'는 마찰력의 성질과 헷갈린 보기예요. 부력의 크기를 정하는 건 물체의 무게가 아니라 물에 <b>잠긴 부피</b>랍니다.",
    core: "부력 = 물·공기가 위로 밀어 올리는 힘(중력 반대 방향)!",
  },
  {
    // [314] d2 BS num · 검산: 공기 중 27 − 물속 19 = 부력 8 N(레슨 20−14·구 15−11 회피, 차이값 8 신선)
    id: "u5e314",
    lessonId: "u5l6",
    type: "num",
    diff: 2,
    numKind: "int",
    unitLabel: "N",
    prompt: "그림처럼 용수철저울에 매단 추의 눈금이 공기 중에서 27 N, 물속에 완전히 잠갔을 때 19 N이었어요. 추가 받는 부력의 크기는 몇 N일까요?",
    figure: buoyScaleFig({
      scenes: [
        { label: "(가) 물 밖", water: "none", val: "27 N" },
        { label: "(나) 완전히 잠김", water: "full", val: "19 N" },
      ],
    }),
    answer: "8",
    explain:
      "<span class='xh'>정답 풀이</span>물속에서 저울 눈금이 <b>줄어든 만큼</b>이 물이 추를 떠받쳐 준 몫, 곧 부력이에요. ① 공기 중 무게 27 N ② 물속 눈금 19 N ③ 부력 = 27−19 = <b>8 N</b>. 물이 8 N만큼 위로 밀어 준 덕분에 저울은 19 N만 감당하면 됐던 거죠.<span class='xh'>이렇게 틀려요</span>두 값을 더한 46 N이나, 물속 값 19 N을 그대로 답하면 안 돼요. 부력은 눈금 자체가 아니라 <b>두 눈금의 차이</b>거든요. 공기 중 값에서 물속 값을 빼는 이 방법이 부력의 크기를 재는 기본 공식이에요. 만약 눈금이 하나도 안 줄었다면 부력을 받지 않았다는 뜻이 되겠죠.",
    core: "부력 = 공기 중 무게 − 물속 눈금 = 27−19 = 8 N!",
  },
  {
    // [317] d2 BS 3장면 빈 패널 · 검산: 절반 < 완전 = 더 깊이(잠긴 부피가 정함 · 깊이 무관)
    id: "u5e317",
    lessonId: "u5l6",
    type: "mcq",
    diff: 2,
    prompt: "그림처럼 같은 추를 (가) 절반만 잠기게, (나) 완전히 잠기게, (다) 완전히 잠긴 채 더 깊이 넣었어요. 추가 받는 부력의 크기를 옳게 비교한 것은?",
    figure: buoyScaleFig({
      scenes: [
        { label: "(가)", water: "half" },
        { label: "(나)", water: "full" },
        { label: "(다)", water: "deep" },
      ],
    }),
    options: [
      "(가) < (나) = (다)",
      "(가) < (나) < (다)",
      "(가) = (나) = (다)",
      "(가) > (나) > (다)",
      "(가) = (나) < (다)",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>부력의 크기를 정하는 건 물에 <b>잠긴 부피</b>예요. 절반만 잠긴 (가)보다 완전히 잠긴 (나)가 부력이 크죠. 그런데 (다)는 이미 완전히 잠긴 추를 더 깊이 넣었을 뿐이라 잠긴 부피가 (나)와 똑같아요. 그래서 부력도 그대로. (가) < (나) = (다)예요.<span class='xh'>오답 하나씩 격파</span>'(가) < (나) < (다)'가 대표 함정이에요. 깊이 넣을수록 부력이 커질 것 같지만, 부력을 정하는 건 <b>깊이가 아니라 잠긴 부피</b>죠. 완전히 잠긴 뒤에는 더 내려도 잠긴 부피가 늘지 않으니 부력도 안 변해요. '모두 같다'는 (가)의 절반 잠김을 무시했고, '(가)가 가장 크다'는 관계를 통째로 뒤집은 답이에요.",
    core: "부력은 잠긴 부피가 정한다. 다 잠긴 뒤엔 깊이 무관!",
  },
  {
    // [322] d2 floatBallFig · 검산: 무게 3 N 뜬 채 정지 = 평형 → 부력 3 N(천재 5 N 회피)
    id: "u5e322",
    lessonId: "u5l6",
    type: "mcq",
    diff: 2,
    prompt: "무게가 3 N인 공이 그림처럼 물 위에 떠서 가만히 정지해 있어요. 이 공이 받고 있는 부력에 대한 설명으로 옳은 것은?",
    figure: floatBallFig(),
    options: [
      "부력의 크기는 3 N으로 무게와 같다",
      "물 위로 떠 있으니 부력이 3 N보다 크다",
      "공이 정지해 있으니 부력은 0이다",
      "부력이 중력보다 커서 정지해 있는 것이다",
      "부력은 아래쪽으로 3 N 작용하고 있다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>공이 <b>가만히 떠서 정지</b>해 있다는 건 힘의 평형 상태라는 뜻이에요. 아래로 당기는 중력(무게 3 N)과 위로 밀어 올리는 부력이 정확히 맞서고 있으니, 부력의 크기도 <b>3 N</b>이죠.<span class='xh'>오답 하나씩 격파</span>'떠 있으니 부력이 더 크다'가 가장 흔한 착각이에요. 부력이 3 N보다 크면 공은 위로 계속 밀려 올라가야 해요. 떠오르는 <b>중</b>이 아니라 떠서 <b>멈춰 있는</b> 상태니까 두 힘이 같은 거죠. '정지해 있으니 부력이 0'이라면 중력 3 N이 그대로 남아 공이 가라앉아야 하고요. 부력의 방향은 언제나 위쪽이라 '아래쪽 3 N'도 틀려요.",
    core: "떠서 정지 = 평형! 부력 = 무게 = 3 N.",
  },
  {
    // [326] d2 dbox bogi · 검산: 16→14(부력 2 N · ㄱ 거짓 4 N 서술) · 16→12(부력 4 N · ㄴ 참) · 더 깊이 = 그대로(ㄷ 참)
    id: "u5e326",
    lessonId: "u5l6",
    type: "mcq",
    diff: 2,
    prompt: "어떤 추를 용수철저울에 매달아 물에 넣으며 눈금을 기록했어요. 기록에 대한 옳은 설명을 보기에서 모두 고른 것은?",
    figure: dbox([
      ["물 밖", "눈금 16 N"],
      ["절반 잠김", "눈금 14 N"],
      ["완전히 잠김", "눈금 12 N"],
    ]),
    bogi: [
      "절반 잠겼을 때 추가 받는 부력은 4 N이다",
      "완전히 잠겼을 때 추가 받는 부력은 4 N이다",
      "완전히 잠긴 추를 더 깊이 내려도 눈금은 12 N에 머문다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>부력은 물 밖 눈금에서 잠긴 뒤 눈금을 뺀 값이에요. ㄴ: 완전히 잠겼을 때 부력은 16−12=<b>4 N</b>이 맞아요. ㄷ: 완전히 잠긴 뒤에는 더 깊이 넣어도 잠긴 부피가 늘지 않으니 부력도 눈금도 그대로예요. 그래서 12 N에 머무르죠.<span class='xh'>오답 하나씩 격파</span>ㄱ은 계산이 틀렸어요. 절반 잠겼을 때 부력은 16−14=<b>2 N</b>이지 4 N이 아니죠. 절반만 잠기면 밀려난 물도 절반이라 부력이 완전히 잠겼을 때의 절반이 되는 거예요. 기록표 문제는 겉보기에 그럴듯한 수치가 나와도 꼭 <b>직접 빼 보고</b> 판단하세요. 한 줄 계산이면 함정이 바로 드러난답니다.",
    core: "부력 = 물 밖 눈금 − 잠긴 눈금. 절반 2 N, 완전 4 N, 깊이는 무관!",
  },
  {
    // [328] d3 svgTable num 연립 · 검산: W−x=23, W−2x=18 → x=5, 완전 잠김 부력 2x=10 N(천재 6/4 회피)
    id: "u5e328",
    lessonId: "u5l6",
    type: "num",
    diff: 3,
    numKind: "int",
    unitLabel: "N",
    prompt: "표는 어떤 추를 물에 넣으며 잰 용수철저울 눈금이에요. 이 추는 부피의 절반이 잠겼을 때, 완전히 잠겼을 때의 절반만큼 부력을 받아요. 이 추가 <b>완전히 잠겼을 때</b> 받는 부력은 몇 N일까요?",
    figure: svgTable(["상태", "저울 눈금"], [
      ["절반 잠김", "23 N"],
      ["완전히 잠김", "18 N"],
    ], { firstColHead: true }),
    answer: "10",
    explain:
      "<span class='xh'>정답 풀이</span>완전히 잠겼을 때 부력을 □라고 하면 절반 잠김의 부력은 그 절반이에요. 잠기는 부피가 절반에서 전체로 늘어날 때 눈금이 23 N에서 18 N으로 <b>5 N</b> 더 줄었죠? 이 5 N이 바로 부력의 나머지 절반이에요. ① 두 눈금의 차: 23−18=5 N ② 절반이 5 N이니 전체 부력 □ = 5×2 = <b>10 N</b>.<span class='xh'>이렇게 틀려요</span>공기 중 무게가 주어지지 않았다고 당황해서 23−18=5를 그대로 답하면 절반만 구한 거예요. 두 눈금의 차이는 부력의 전체가 아니라, 절반에서 전체로 늘어난 <b>증가분</b>이라는 걸 놓치지 마세요. 참고로 이 추의 공기 중 무게는 23+5=28 N으로 역산할 수 있어요.",
    core: "눈금 차 5 N = 부력의 절반 → 완전히 잠기면 10 N!",
  },
  // ── L7 힘과 운동 ──
  {
    // [337] d1 무① · 나란한 힘·수직 힘 짝 · 검산: 나란 → 속력 · 수직 → 운동 방향
    id: "u5e337",
    lessonId: "u5l7",
    type: "mcq",
    diff: 1,
    prompt: "물체의 운동 방향과 <b>나란한</b> 방향으로 힘이 작용하면 ㉠이 변하고, <b>수직인</b> 방향으로 힘이 계속 작용하면 ㉡이 변해요. ㉠과 ㉡을 옳게 짝 지은 것은?",
    options: [
      "㉠ 물체의 모양 · ㉡ 속력",
      "㉠ 운동 방향 · ㉡ 속력",
      "㉠ 속력 · ㉡ 운동 방향",
      "㉠ 속력 · ㉡ 물체의 질량",
      "㉠ 운동 방향 · ㉡ 물체의 모양",
    ],
    answer: 2,
    explain:
      "<span class='xh'>정답 풀이</span>힘이 하는 일은 운동 방향과 이루는 각도에 따라 달라져요. 운동과 <b>나란한</b> 힘은 물체를 밀어 주거나 붙잡는 셈이라 <b>속력</b>을 바꿔요. 같은 방향이면 빨라지고 반대 방향이면 느려지죠. 운동에 <b>수직인</b> 힘은 가는 길을 옆에서 계속 잡아당기는 셈이라 속력은 그대로 두고 <b>운동 방향</b>만 바꿔요.<span class='xh'>오답 하나씩 격파</span>㉠과 ㉡을 서로 맞바꾼 짝이 대표 함정이에요. 나란한 힘이 방향을 바꾼다면 곧게 떨어지는 물체가 옆으로 휘어야 하는데 그렇지 않죠. '물체의 모양'이나 '질량'은 힘의 방향과 짝지어 변하는 항목이 아니에요. 특히 질량은 힘을 받아도 변하지 않는 고유한 양이랍니다.",
    core: "나란한 힘 = 속력 담당, 수직인 힘 = 방향 담당!",
  },
  {
    // [338] d2 FB 수직 힘 · 검산: 운동 오른쪽 + 힘 아래쪽(수직 · 탑뷰) → 방향이 계속 변함(커브)
    id: "u5e338",
    lessonId: "u5l7",
    type: "mcq",
    diff: 2,
    prompt: "그림은 위에서 내려다본 모습으로, 오른쪽으로 굴러가는 공에 운동 방향과 수직인 힘이 계속 작용하고 있어요. 공의 운동은 어떻게 될까요?",
    figure: forceSceneFig({
      obj: "ball",
      ground: "none",
      motion: "r",
      arrows: [{ dir: "d", n: 3, label: "힘", tone: "act" }],
      cap: "위에서 내려다본 모습",
    }),
    options: [
      "속력이 점점 빨라진다",
      "운동 방향이 계속 변하여 길이 휜다",
      "속력이 점점 느려지다 멈춘다",
      "운동 상태가 전혀 변하지 않는다",
      "그 자리에 즉시 멈춘다",
    ],
    answer: 1,
    explain:
      "<span class='xh'>정답 풀이</span>힘이 운동 방향과 <b>수직</b>으로 계속 작용하면, 물체를 앞으로 밀지도 뒤로 잡지도 않으면서 옆으로만 계속 잡아당겨요. 그래서 속력은 그대로인 채 <b>가는 길이 계속 휘어요</b>. 실에 매단 공을 빙빙 돌릴 때 실이 중심 쪽으로 계속 당기는 것과 같은 상황이죠.<span class='xh'>오답 하나씩 격파</span>'빨라진다'는 힘이 운동과 <b>같은 방향</b>일 때, '느려지다 멈춘다'는 <b>반대 방향</b>일 때의 일이에요. 수직인 힘은 앞뒤로는 아무 일도 하지 않아요. '변하지 않는다'는 힘이 버젓이 작용하는데 알짜힘이 0이 아니면 반드시 무언가 변한다는 원리에 어긋나고, '즉시 멈춘다'는 힘의 방향과 상관없이 성립하지 않는 과장이에요.",
    core: "수직인 힘이 계속 작용 = 속력 그대로, 길만 계속 휨!",
  },
  {
    // [340] d1 사진 merry-go-round · 검산: 일정한 속력 회전 = 방향만 변함 · 알짜힘 0 아님
    id: "u5e340",
    lessonId: "u5l7",
    type: "mcq",
    diff: 1,
    prompt: "사진의 회전목마가 일정한 속력으로 빙글빙글 돌고 있어요. 목마를 타고 도는 인형의 운동에 대한 설명으로 옳은 것은?",
    figure: ximg("merry-go-round.webp", "말 모형들이 둥근 판 위에 놓여 있는 놀이공원의 회전목마"),
    options: [
      "속력과 운동 방향이 모두 변하지 않는다",
      "속력이 점점 빨라지는 운동이다",
      "운동 상태가 변하지 않으므로 알짜힘은 0이다",
      "속력은 일정하고 운동 방향이 계속 변한다",
      "힘이 전혀 작용하지 않는 운동이다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>일정한 속력으로 돈다고 했으니 빠르기는 그대로예요. 하지만 빙글빙글 도는 동안 나아가는 <b>방향은 매 순간 바뀌고</b> 있죠. 동쪽을 향하다가 남쪽, 서쪽으로 계속 꺾이니까요. 그래서 이 운동은 <b>속력 일정, 방향 변화</b>형이에요.<span class='xh'>오답 하나씩 격파</span>'모두 변하지 않는다'는 방향 변화를 놓친 답이에요. 곧게 가지 않고 원을 그린다는 것 자체가 방향이 변한다는 증거죠. '점점 빨라진다'는 문제 조건(일정한 속력)과 어긋나고요. '알짜힘은 0'이 가장 좋은 함정인데, 방향이 변하는 것도 <b>운동 상태 변화</b>라서 알짜힘이 0일 수 없어요. 속력이 안 변해도요. 같은 이유로 '힘이 전혀 작용하지 않는다'도 틀려요.",
    core: "빙글빙글 = 방향이 계속 변하는 운동. 방향 변화도 알짜힘의 일!",
  },
  {
    // [344] d2 dbox 구간 카드 · 검산: 일정한 속력 구간 (나)만 알짜힘 0(승강기 문형 회피 · 케이블카)
    id: "u5e344",
    lessonId: "u5l7",
    type: "mcq",
    diff: 2,
    prompt: "자료는 케이블카가 한 구간을 곧게 이동한 기록이에요. 케이블카에 작용하는 <b>알짜힘이 0인 구간</b>은?",
    figure: dbox([
      ["(가)", "출발하며 점점 빨라졌다"],
      ["(나)", "일정한 속력으로 곧게 나아갔다"],
      ["(다)", "도착을 앞두고 점점 느려졌다"],
    ]),
    options: ["(가)", "(나)", "(다)", "(가), (다)", "세 구간 모두"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>알짜힘이 0이면 물체는 하던 운동을 그대로 해요. 정지해 있었다면 계속 정지, 움직이고 있었다면 <b>일정한 속력으로 곧게</b> 계속 가죠. (나) 구간이 바로 그 상태예요. 속력도 방향도 변하지 않았으니 알짜힘이 0이라는 증거랍니다.<span class='xh'>오답 하나씩 격파</span>(가)는 속력이 빨라지는 중이니 운동 방향 쪽으로 알짜힘이 남아 있고, (다)는 느려지는 중이니 운동 반대 방향으로 알짜힘이 작용하고 있어요. 속력이 변하는 구간은 어느 쪽이든 알짜힘이 0일 수 없죠. 주의할 점 하나. (나)에서 힘이 <b>하나도 없는</b> 게 아니라, 여러 힘이 서로 지워져 알짜힘만 0인 거예요. 움직이는데도 알짜힘이 0일 수 있다는 게 이 문제의 핵심이에요.",
    core: "일정한 속력 + 곧게 = 알짜힘 0. 빨라지거나 느려지면 0이 아님!",
  },
  {
    // [348] d3 TJ 곡선+감속 bogi · 검산: 간격 66→57→48→39 감소(ㄱ 참) · 경로 휨(ㄴ 참) · 알짜힘 0(ㄷ 거짓)
    id: "u5e348",
    lessonId: "u5l7",
    type: "mcq",
    diff: 3,
    prompt: "그림은 굴러가는 공의 위치를 같은 시간 간격으로 기록한 거예요. 옳은 설명을 보기에서 모두 고른 것은?",
    figure: trajStroboFig({
      pts: [[36, 118], [102, 112], [158, 100], [202, 82], [234, 60]],
      cap: "같은 시간 간격으로 기록",
    }),
    bogi: [
      "공의 속력이 점점 느려지고 있다",
      "공의 운동 방향이 변하고 있다",
      "공에 작용하는 알짜힘은 0이다",
    ],
    options: ["ㄱ", "ㄴ", "ㄷ", "ㄱ, ㄴ", "ㄴ, ㄷ"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>같은 시간 간격 기록에서는 <b>위치 사이의 거리</b>가 속력이에요. ㄱ: 갈수록 간격이 좁아지니 같은 시간에 가는 거리가 줄어드는 중, 곧 속력이 느려지고 있어요. ㄴ: 위치들을 이어 보면 곧은 직선이 아니라 위로 휘어지죠. 나아가는 방향이 계속 바뀌고 있다는 뜻이에요.<span class='xh'>오답 하나씩 격파</span>ㄷ은 틀려요. 속력도 변하고 방향도 변하고 있는데, 알짜힘이 0이라면 이런 변화가 일어날 수 없죠. 운동 상태가 변하고 있다는 관찰 자체가 <b>알짜힘이 있다</b>는 증거예요. 속력과 방향이 함께 변하는 건 힘이 운동 방향과 비스듬하게 작용하고 있다는 신호랍니다.",
    core: "간격 좁아짐 = 감속, 경로 휨 = 방향 변화 → 알짜힘이 있다!",
  },
  {
    // [354] d3 dbox bogi · 검산: 일정한 속력 직진 드론 → 알짜힘 0(ㄱ 참) · 힘 없음 아님(ㄴ 거짓) · 변화 생기면 알짜힘 존재(ㄷ 참)
    id: "u5e354",
    lessonId: "u5l7",
    type: "mcq",
    diff: 3,
    prompt: "자료를 읽고, 옳은 설명을 보기에서 모두 고른 것은?",
    figure: dbox([
      ["관찰", "배달 드론 한 대가 일정한 속력으로 곧게 날고 있다"],
      ["조건", "바람 등 주변 상황은 변하지 않는다"],
    ]),
    bogi: [
      "드론에 작용하는 알짜힘은 0이다",
      "드론에는 힘이 하나도 작용하지 않는다",
      "드론의 속력이나 방향이 변한다면 알짜힘이 생긴 것이다",
    ],
    options: ["ㄱ", "ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ: 속력도 방향도 변하지 않는 운동은 알짜힘이 <b>0</b>일 때만 가능해요. 운동 상태가 그대로라는 관찰이 곧 알짜힘 0의 증거죠. ㄷ: 거꾸로 속력이든 방향이든 변하기 시작했다면, 힘들의 균형이 깨져 <b>알짜힘이 생겼다</b>는 뜻이에요. 이 두 문장이 힘과 운동 단원의 결론이에요.<span class='xh'>오답 하나씩 격파</span>ㄴ이 함정이에요. 날고 있는 드론에는 아래로 당기는 중력, 날개가 밀어 올리는 힘, 공기가 방해하는 힘 등 여러 힘이 <b>동시에 작용</b>하고 있어요. 다만 그 힘들이 서로 지워져 알짜힘이 0일 뿐이죠. '알짜힘이 0'과 '힘이 없다'는 전혀 다른 말이라는 걸 구분하는 게 이 문제의 핵심이랍니다.",
    core: "알짜힘 0 = 힘이 없음이 아니라 힘들이 지워진 상태!",
  },
];

/* ══════════ 파일럿 미사용 신작 모드·신규 사진 데뷔 눈검수(부록 카드) ══════════ */

export const PILOT_PREVIEW: { name: string; svg: string; dark?: boolean }[] = [
  { name: "신규 사진 rock-climber(확대 231 예정 · 평형)", svg: ximg("rock-climber.webp", "암벽에 드리운 팽팽한 로프에 매달려 정지해 있는 사람의 뒷모습") },
  { name: "신규 사진 parachute(확대 341 예정 · 일정한 속력 하강)", svg: ximg("parachute.webp", "완전히 펼쳐진 낙하산이 하늘에서 내려오는 모습") },
  { name: "AR cards 모드(확대 217 예정 · 2배 힘 고르기)", svg: arrowAnatFig({ mode: "cards", cards: [{ len: 22, dir: "r" }, { len: 44, dir: "r" }, { len: 22, dir: "l" }, { len: 44, dir: "u" }, { len: 22, dir: "r", w: 7 }] }) },
  { name: "AR grid 세 화살표(확대 216 예정)", svg: arrowAnatFig({ mode: "grid", arrows: [{ row: 0, cells: 2, name: "ㄱ" }, { row: 1, cells: 4, name: "ㄴ" }, { row: 2, cells: 3, dir: "l", name: "ㄷ" }] }) },
  { name: "GD 달 모드(확대 257 예정)", svg: gravityDirsFig({ body: "moon", spots: [{ label: "(가)", deg: 45, cands: [{ name: "㉮", dir: "in" }, { name: "㉯", dir: "d" }] }] }) },
  { name: "SH pull(수평 당김 · 확대 269 계열 · 탄성력 방향 후보만)", svg: springHangFig({ kind: "pull", cands: [{ name: "㉮", dir: "l" }, { name: "㉯", dir: "r" }] }) },
  { name: "SH press(압축 · 확대 280 계열)", svg: springHangFig({ kind: "press", forceLabel: "8 N" }) },
  { name: "SH hang 치수 모드(확대 276 예정)", svg: springHangFig({ kind: "hang", dims: ["원래 길이 15 cm", "21 cm"] }) },
  { name: "FB 물속 화살표 후보(확대 330 예정 · 부력 방향)", svg: forceSceneFig({ obj: "ball", ground: "water", cand: [{ name: "㉮", dir: "u" }, { name: "㉯", dir: "d" }, { name: "㉰", dir: "l" }, { name: "㉱", dir: "r" }] }) },
  { name: "TJ 직선 가속(확대 346 예정 · 낙하 간격 벌어짐)", svg: trajStroboFig({ pts: [[172, 24], [172, 48], [172, 82], [172, 126]], cap: "같은 시간 간격으로 기록" }) },
];

