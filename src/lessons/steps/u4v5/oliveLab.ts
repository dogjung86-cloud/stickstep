// [중1 Ⅳ v5] u4l4 올리브유 랩: 「얼리면 질량과 부피는 어떻게 될까요?」
// 책의 탐구를 손으로 한다: 유리병의 올리브유 높이를 색 테이프로 표시하고 질량을 잰 뒤, 얼음과 소금에 넣어 얼리고, 높이를 다시 표시하고 질량을 다시 잰다.
// 지금 단원에는 이 탐구를 해 보는 랩이 없는데 문제가 이 실험을 묻고 있어서 새로 넣었다.
// 조작: 높이 표시하고 재기 → 예측(질량) → 꾹 눌러 얼리기 → 바로 잴지 물기를 닦고 잴지 고르기 → 판정 하나(부피가 줄어든 까닭).
// 닦지 않고 바로 재면 차가운 병 겉에 맺힌 물방울 때문에 숫자가 커진다(책의 주의: 물기를 닦은 후 즉시 측정). 닦고 다시 재게 한다.
// 통찰 하나: 응고해도 질량은 그대로이고 부피만 준다. 입자 창에서 입자의 수는 그대로이고 사이만 가까워진다.
// 수치(12.60 g)는 이 랩에서 정한 값이다.
//
// 그림(2026-11-15 손질, 감사 상 후보): 판정의 근거인 높이 변화가 테이프 두 줄 사이 3px라 안 보였다.
//   병을 가늘고 길게 그려 같은 비율(약 12%)로 줄어도 14px 내려가게 하고, 판정 때 두 테이프 사이를 노란 괄호와 "줄어든 높이"로 묶는다.
//   입자 창에는 병의 단면(유리 벽, 기름, 액면 선)을 그리고, 판정 때 '얼리기 전'과 '얼린 뒤' 두 칸을 나란히 둔다(같은 단면, 같은 입자 12개).
//   얼리는 동안 병은 저울에서 내려 저울 옆 얼음과 소금 비커에 넣는다(저울 위에 비커를 그리면 비커째 재는 것처럼 읽혔다). 저울은 그동안 0.00 g.
//   얼리는 동안 입자가 한 줄로 겹치던 것은 액체 자리와 고체 자리의 짝을 거리가 짧아지게 다시 맺어 고쳤다(pairUp).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { A, beaker, bottle, scale, seeded, svgOpen, u4Hold, u4Lab, u4Predict, type Pt, type U4Step } from "./u4Kit";

const MASS = "12.60 g";
const MASS_W = "13.80 g"; // 같은 병에 같은 높이까지 담은 물의 질량(올리브유보다 조금 무겁다). 얼기 전과 뒤가 같다는 것만 보인다
const WET = "12.74 g"; // 닦지 않고 쟀을 때(겉에 맺힌 물방울의 질량이 더해진다)
const ZERO = "0.00 g";
const NEED = 3000;

// ── 저울 위의 가늘고 긴 병(무대 왼쪽). 유리는 단원 공용 bottle(), 뚜껑과 기름과 테이프는 여기서 그린다 ──
const SC = { x: 6, y: 168, w: 118 }; // 전자저울(왼쪽 위, 폭)
const BX = SC.x + SC.w / 2; // 병의 가운데 x
const BW = 15; // 병 바깥 반폭
const BOT = SC.y; // 병 바닥(저울판 윗면)
const BODY = 36; // 병 몸통의 위(그 위로 목 9px)
const OIL_BOT = BOT - 4.4; // 기름 바닥(유리의 두꺼운 바닥 띠 위)
const LIQ = 112; // 얼리기 전 올리브유 기둥의 높이
const DROP = 14; // 얼어서 내려간 높이(기둥의 약 12%)
const RISE = 13; // 물이 얼어서 올라간 높이(물의 응고 부피 팽창 예외)
const L0 = OIL_BOT - LIQ; // 얼리기 전 액면(빨간 테이프)
const L1 = L0 + DROP; // 얼린 뒤 액면(파란 테이프)
const LW1 = L0 - RISE; // 물이 얼어 높아진 액면(파란 테이프)
// 얼리는 동안 병을 넣는 얼음과 소금 비커(저울 옆)
const BATH = { x: 152, w: 66, top: 122, bot: 206 };
const MOVE = { dx: BATH.x + BATH.w / 2 - BX, dy: BATH.bot - 3 - BOT };

// ── 입자 창(무대 오른쪽): 병 단면을 크게 본 창. 실험하는 동안은 C 하나('입자의 눈'), 판정 때 B('얼리기 전')를 왼쪽에 더한다 ──
const WIN_Y = 12, WIN_H = 206;
const WB = { x: 146, w: 94 };
const WC = { x: 246, w: 94 };
const R = 7; // 입자 반지름(두 창 모두 같다)
const FLOOR = 202; // 단면의 바닥(입자 아랫면)
const SEC = 31; // 단면 안쪽 반폭
const SEC_TOP = 98; // 단면 유리 벽의 위 끝

const GAP = 2 * R + 0.5; // 입자 가운데 사이의 가장 짧은 거리(서로 겹치지 않게)

/** 겹친 입자를 서로 밀어 떼고 단면 안에 둔다(몇 번 되풀이). 같은 입력이면 늘 같은 자리가 나온다. */
function relax(ps: Pt[], cx: number, iter: number): Pt[] {
  const out = ps.map((p) => ({ x: p.x, y: p.y }));
  for (let k = 0; k < iter; k++) {
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i], b = out[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= GAP) continue;
        if (d < 1e-3) [dx, dy, d] = [1, 0, 1];
        const m = (GAP - d) / 2;
        a.x -= (dx / d) * m;
        a.y -= (dy / d) * m;
        b.x += (dx / d) * m;
        b.y += (dy / d) * m;
      }
    for (const p of out) {
      p.x = Math.min(cx + SEC - R, Math.max(cx - SEC + R, p.x));
      p.y = Math.min(FLOOR - R, p.y);
    }
  }
  return out;
}

/** 액체: 서로 가깝지만 가지런하지 않게(세 개씩 네 줄, 줄마다 어긋나고 조금씩 흩어진다). */
function liquidPts(cx: number, rnd: () => number): Pt[] {
  const pts: Pt[] = [];
  for (let k = 0; k < 4; k++)
    for (let c = 0; c < 3; c++)
      pts.push({ x: cx + (c - 1) * 16.5 + (k % 2 ? 3.5 : -3.5) + (rnd() - 0.5) * 5, y: FLOOR - R - k * 14.2 + (rnd() - 0.5) * 3.6 });
  return relax(pts, cx, 20);
}
/** 고체: 가지런히 붙어서(네 개씩 세 줄). */
function solidPts(cx: number): Pt[] {
  const pts: Pt[] = [];
  for (let k = 0; k < 3; k++) for (let c = 0; c < 4; c++) pts.push({ x: cx + (c - 1.5) * 14.6, y: FLOOR - R - k * 14.6 });
  return pts;
}
/** 얼음(물의 응고 예외): 가운데 빈틈이 큰 육각형 고리 두 개(6개씩 12개). */
function hexIcePts(cx: number): Pt[] {
  const pts: Pt[] = [];
  const rad = 14.8;
  for (const cy of [FLOOR - R - rad, FLOOR - R - rad - 30.2]) {
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 6) + (Math.PI / 3) * k;
      pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
    }
  }
  return pts;
}
const topOf = (ps: Pt[]): number => Math.min(...ps.map((p) => p.y)) - R - 1.5;

/** to를 from의 차례에 맞게 다시 늘어놓는다. 짝 사이 거리의 합이 줄어드는 동안 두 짝을 맞바꾼다
 *  (거리 합이 가장 짧은 짝 맺기는 길이 서로 엇갈리지 않는다. 예전에는 줄 차례가 뒤집혀 입자가 한 줄로 겹쳤다). */
function pairUp(from: Pt[], to: Pt[]): Pt[] {
  const out = to.slice();
  const d = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);
  for (let pass = 0, better = true; better && pass < 40; pass++) {
    better = false;
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++)
        if (d(from[i], out[j]) + d(from[j], out[i]) < d(from[i], out[i]) + d(from[j], out[j]) - 1e-6) {
          [out[i], out[j]] = [out[j], out[i]];
          better = true;
        }
  }
  return out;
}

export const u4OliveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 4, cls: "u4x-olive", tall: true });
  const { f, tm } = lab;
  const rnd = seeded(77);
  const ns = `u4o${Math.random().toString(36).slice(2, 7)}`; // 그라데이션 id(같은 id가 다른 화면에 남아 있으면 색이 빠진다)

  const cB = WB.x + WB.w / 2;
  const cC = WC.x + WC.w / 2;
  const liqB = liquidPts(cB, rnd);
  const liqC = liqB.map((p) => ({ x: p.x - cB + cC, y: p.y }));
  const solC = pairUp(liqC, solidPts(cC));
  const hexC = pairUp(liqC, hexIcePts(cC));
  const lvl0 = topOf(liqC); // 창 안의 액면: 얼리기 전
  const lvl1 = topOf(solC); // 얼린 뒤(올리브유)
  const lvlW = topOf(hexC); // 얼린 뒤(물 → 얼음, 높아짐)

  const dot = (p: Pt, cls: string): string =>
    `<circle class="${cls}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${R}" fill="url(#${ns}p)" stroke="${A.partEdge}" stroke-width="1.1"/>`;
  /** 병 단면: 유리 벽(위가 열린 U), 액면까지의 기름 빛, 액면 선. */
  const section = (cx: number, lv: number, cls: string, line: string): string => `
    <rect class="${cls}-fill" x="${cx - SEC}" y="${lv.toFixed(1)}" width="${SEC * 2}" height="${(FLOOR + 1 - lv).toFixed(1)}" rx="3" fill="rgba(255,255,255,.06)"/>
    <path d="M${cx - SEC - 1.5} ${SEC_TOP} V${FLOOR - 6} a8 8 0 0 0 8 8 h${SEC * 2 - 13} a8 8 0 0 0 8 -8 V${SEC_TOP}" stroke="rgba(190,210,240,.55)" stroke-width="1.6"/>
    <path class="${cls}-line" d="M${cx - SEC} ${lv.toFixed(1)} h${SEC * 2}" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/>`;
  const winRect = (x: number, w: number): string =>
    `<rect x="${x}" y="${WIN_Y}" width="${w}" height="${WIN_H}" rx="14" fill="rgba(124,107,255,.10)" stroke="rgba(155,140,255,.5)" stroke-width="1.6"/>`;
  const cubes = (pos: [number, number, number][]): string =>
    pos.map(([x, y, sz]) => `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" rx="3.5" fill="url(#${ns}ice)" stroke="#9CCBEF" stroke-width="1.2"/>`).join("");
  const grains = Array.from({ length: 40 }, () => [BATH.x + 6 + rnd() * (BATH.w - 12), BATH.top + 16 + rnd() * (BATH.bot - BATH.top - 24)])
    .filter(([x]) => Math.abs(x - (BATH.x + BATH.w / 2)) > BW + 2)
    .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="#fff" opacity="0.9"/>`)
    .join("");

  const glass = bottle(BX - BW, BODY, BW * 2, BOT - BODY, `${ns}b`, { neck: 9, neckW: 18 });
  const oilRect = (cls: string, fill: string, op: string): string =>
    `<rect class="${cls}" x="${BX - BW + 2.6}" y="${L0}" width="${BW * 2 - 5.2}" height="${OIL_BOT - L0}" rx="3" fill="${fill}" opacity="${op}"/>`;

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="${ns}oil" x1="0" x2="1"><stop offset="0" stop-color="#FFD24D"/><stop offset=".5" stop-color="${A.oil}"/><stop offset="1" stop-color="#D99500"/></linearGradient>
      <linearGradient id="${ns}frz" x1="0" x2="1"><stop offset="0" stop-color="#FFF8DC"/><stop offset=".5" stop-color="${A.oilFrozen}"/><stop offset="1" stop-color="#E9D58C"/></linearGradient>
      <linearGradient id="${ns}wat" x1="0" x2="1"><stop offset="0" stop-color="#8FD4FF"/><stop offset=".5" stop-color="#4FA8EE"/><stop offset="1" stop-color="#2E86D0"/></linearGradient>
      <linearGradient id="${ns}wfrz" x1="0" x2="1"><stop offset="0" stop-color="#F2FBFF"/><stop offset=".5" stop-color="#CBEBFA"/><stop offset="1" stop-color="#9BD3F0"/></linearGradient>
      <linearGradient id="${ns}lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7C4D4"/><stop offset=".5" stop-color="#8B9BB0"/><stop offset="1" stop-color="#6B7B90"/></linearGradient>
      <linearGradient id="${ns}ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FAFF" stop-opacity=".9"/><stop offset=".55" stop-color="#CBE6FA" stop-opacity=".62"/><stop offset="1" stop-color="#A7D0EE" stop-opacity=".55"/></linearGradient>
      <radialGradient id="${ns}p" cx=".35" cy=".32" r=".75"><stop offset="0" stop-color="#D9D2FF"/><stop offset=".55" stop-color="${A.part}"/><stop offset="1" stop-color="#7464E0"/></radialGradient>
      <radialGradient id="${ns}pw" cx=".35" cy=".32" r=".75"><stop offset="0" stop-color="#DFF4FF"/><stop offset=".55" stop-color="#66BCFF"/><stop offset="1" stop-color="#2B7ED6"/></radialGradient>
    </defs>
    ${scale(SC.x, SC.y, SC.w, "u4x-olive", ZERO)}
    <g class="u4x-olive-jar">
      <ellipse cx="${BX}" cy="${BOT}" rx="${BW + 4}" ry="2.6" fill="#000" opacity="0.32"/>
      ${glass.back}
      ${oilRect("u4x-olive-oil", `url(#${ns}oil)`, "1")}
      ${oilRect("u4x-olive-ice", `url(#${ns}frz)`, "0")}
      ${glass.front}
      <rect x="${BX - 11}" y="${BODY - 9 - 12}" width="22" height="13" rx="3.5" fill="url(#${ns}lid)" stroke="#56657A" stroke-width="1.4"/>
      <rect class="u4x-olive-tape1" x="${BX - BW - 6}" y="${L0 - 2}" width="${BW * 2 + 12}" height="4" rx="1.5" fill="#F0705E" opacity="0"/>
      <rect class="u4x-olive-tape2" x="${BX - BW - 6}" y="${L1 - 2}" width="${BW * 2 + 12}" height="4" rx="1.5" fill="#6C8CFF" opacity="0"/>
      <g class="u4x-olive-dew">${[[BX - BW - 1, 92], [BX + BW + 1, 108], [BX - BW - 1, 130], [BX + BW + 1, 146], [BX - BW - 1, 156], [BX + 6, 161]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="3.6" fill="#BFE6FF" stroke="#6FB9E0" stroke-width="0.8"/>`).join("")}</g>
    </g>
    <g class="u4x-olive-bath" opacity="0">
      ${cubes([[BATH.x + 4, BATH.top + 30, 14], [BATH.x + 5, BATH.top + 52, 13], [BATH.x + 3, BATH.top + 70, 13], [BATH.x + BATH.w - 18, BATH.top + 24, 14], [BATH.x + BATH.w - 17, BATH.top + 46, 13], [BATH.x + BATH.w - 18, BATH.top + 66, 14], [BATH.x + BATH.w / 2 - 6, BATH.bot - 17, 12]])}
      ${grains}
      ${beaker(BATH.x, BATH.top, BATH.w, BATH.bot - BATH.top, "#CFE6FF", `${ns}k`, 0)}
      <text x="${BATH.x + BATH.w / 2}" y="${BATH.bot + 17}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#CFE3FF">얼음과 소금</text>
    </g>
    <g class="u4x-olive-mark" opacity="0">
      <rect x="${BX - BW + 2.6}" y="${L0 + 2}" width="${BW * 2 - 5.2}" height="${DROP - 4}" fill="#FFE58A" opacity="0.3"/>
      <path d="M${BX + BW + 7} ${L0} h6 V${L1} h-6" stroke="#FFE58A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${BX + BW + 18}" y="${L0 + 4}" font-size="12.5" font-weight="800" fill="#FFE58A">줄어든</text>
      <text x="${BX + BW + 18}" y="${L0 + 19}" font-size="12.5" font-weight="800" fill="#FFE58A">높이</text>
    </g>
    <g class="u4x-water-mark" opacity="0">
      <rect x="${BX - BW + 2.6}" y="${LW1 + 2}" width="${BW * 2 - 5.2}" height="${RISE - 2}" fill="#7CF0B5" opacity="0.28"/>
      <path d="M${BX + BW + 7} ${LW1} h6 V${L0} h-6" stroke="#7CF0B5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${BX + BW + 18}" y="${LW1 + 5}" font-size="12.5" font-weight="800" fill="#7CF0B5">늘어난</text>
      <text x="${BX + BW + 18}" y="${LW1 + 20}" font-size="12.5" font-weight="800" fill="#7CF0B5">높이</text>
    </g>
    <g class="u4x-olive-cmp" opacity="0">
      ${winRect(WB.x, WB.w)}
      <text x="${cB}" y="${WIN_Y + 21}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9BEFF">얼리기 전</text>
      <text x="${cB}" y="${WIN_Y + 40}" text-anchor="middle" font-size="12" font-weight="700" fill="#9C90DA">입자 12개</text>
      ${section(cB, lvl0, "u4x-olive-b", "#F0705E")}
      ${liqB.map((p) => dot(p, "u4x-olive-p u4x-olive-pb")).join("")}
    </g>
    <g class="u4x-olive-win">
      ${winRect(WC.x, WC.w)}
      <text class="u4x-olive-ttl" x="${cC}" y="${WIN_Y + 21}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9BEFF">입자 모형</text>
      <text class="u4x-olive-cnt" x="${cC}" y="${WIN_Y + 40}" text-anchor="middle" font-size="12" font-weight="700" fill="#9C90DA" opacity="0">입자 12개</text>
      <path class="u4x-olive-ghost" d="M${cC - SEC} ${lvl0.toFixed(1)} h${SEC * 2}" stroke="#F0705E" stroke-width="1.6" stroke-dasharray="4 3" opacity="0"/>
      ${section(cC, lvl0, "u4x-olive-c", "rgba(255,255,255,.6)")}
      <path class="u4x-olive-wmark" d="M${cC + SEC + 3} ${lvl0.toFixed(1)} h5 V${lvl1.toFixed(1)} h-5" stroke="#FFE58A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
      <g class="u4x-hex-ring" opacity="0">${(() => {
        const raw = hexIcePts(cC);
        const poly = (pts: Pt[]): string => `<polygon points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" fill="none" stroke="rgba(160,225,255,.55)" stroke-width="1.5" stroke-dasharray="2.5 2"/>`;
        return poly(raw.slice(0, 6)) + poly(raw.slice(6, 12));
      })()}</g>
      ${liqC.map((p) => dot(p, "u4x-olive-p u4x-olive-pc")).join("")}
    </g>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const read = q<SVGTextElement>(".u4x-olive-read");
  const jar = q<SVGGElement>(".u4x-olive-jar");
  const oil = q<SVGRectElement>(".u4x-olive-oil");
  const ice = q<SVGRectElement>(".u4x-olive-ice");
  const baths = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-olive-bath"));
  const tape1 = q<SVGRectElement>(".u4x-olive-tape1");
  const tape2 = q<SVGRectElement>(".u4x-olive-tape2");
  const mark = q<SVGGElement>(".u4x-olive-mark");
  const waterMark = q<SVGGElement>(".u4x-water-mark");
  const hexRing = q<SVGGElement>(".u4x-hex-ring");
  const cmp = q<SVGGElement>(".u4x-olive-cmp");
  const ttl = q<SVGTextElement>(".u4x-olive-ttl");
  const cnt = q<SVGTextElement>(".u4x-olive-cnt");
  const ghost = q<SVGPathElement>(".u4x-olive-ghost");
  const wmark = q<SVGPathElement>(".u4x-olive-wmark");
  const cFill = q<SVGRectElement>(".u4x-olive-c-fill");
  const cLine = q<SVGPathElement>(".u4x-olive-c-line");
  const pB = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-olive-pb"));
  const pC = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-olive-pc"));

  let pred = "";
  let t = 0;
  let waterMode = false;
  let bathOn = false;
  /** 병의 자리: 저울 위(false) 또는 얼음과 소금 비커 속(true). */
  const inBath = (on: boolean): void => {
    if (on === bathOn) return;
    bathOn = on;
    jar.style.transform = on ? `translate(${MOVE.dx}px, ${MOVE.dy}px)` : "";
    baths.forEach((g) => g.setAttribute("opacity", on ? "1" : "0"));
    if (on) read.textContent = ZERO;
  };
  const paint = (): void => {
    const y = waterMode ? L0 - RISE * t : L0 + DROP * t;
    for (const r of [oil, ice]) {
      r.setAttribute("y", y.toFixed(1));
      r.setAttribute("height", (OIL_BOT - y).toFixed(1));
    }
    const k = Math.min(1, Math.max(0, (t - 0.3) / 0.55)); // 하얗게 굳는 정도
    ice.setAttribute("opacity", k.toFixed(2));
    const lv = lvl0 + ((waterMode ? lvlW : lvl1) - lvl0) * t;
    cFill.setAttribute("y", lv.toFixed(1));
    cFill.setAttribute("height", (FLOOR + 1 - lv).toFixed(1));
    cLine.setAttribute("d", `M${cC - SEC} ${lv.toFixed(1)} h${SEC * 2}`);
    // 짝지은 자리 사이를 곧게 가되, 가다가 맞닿는 입자는 서로 밀어 겹치지 않게 한다
    const targetPts = waterMode ? hexC : solC;
    const ps = relax(liqC.map((p, i) => ({ x: p.x + (targetPts[i].x - p.x) * t, y: p.y + (targetPts[i].y - p.y) * t })), cC, waterMode && t > 0.9 ? 2 : 12);
    pC.forEach((c, i) => {
      c.setAttribute("cx", ps[i].x.toFixed(1));
      c.setAttribute("cy", ps[i].y.toFixed(1));
    });
    hexRing.setAttribute("opacity", waterMode && t > 0.75 ? ((t - 0.75) * 4).toFixed(2) : "0");
    host.dataset.u4Olive = t.toFixed(2);
  };
  // 액체일 때는 입자가 조금씩 자리를 옮긴다(얼수록 잦아든다). '얼리기 전' 칸의 입자는 늘 액체다.
  const jitter = (): void => {
    if (!tm.alive()) return;
    const wob = (c: SVGCircleElement, amp: number): void => {
      c.style.transform = amp > 0.05 ? `translate(${((rnd() - 0.5) * amp).toFixed(1)}px, ${((rnd() - 0.5) * amp).toFixed(1)}px)` : "";
    };
    pC.forEach((c) => wob(c, 3.2 * (1 - t)));
    pB.forEach((c) => wob(c, 3.2));
    tm.later(jitter, 240);
  };

  const weigh = bvBtn("main u4x-olive-weigh", "처음 높이와 질량 기록하기");
  const hold = u4Hold(lab, "꾹 눌러 올리브유 얼리기", (ms) => {
    inBath(true);
    t = Math.min(1, t + ms / NEED);
    paint();
    if (t < 1) return true;
    haptic(HAPTIC.correct);
    hold.disabled = true;
    tape2.setAttribute("opacity", "1");
    // 입자 창에도 두 테이프처럼: 얼린 뒤 액면은 파랑, 얼리기 전 액면은 빨간 점선으로 남긴다
    cLine.setAttribute("stroke", "#6C8CFF");
    ghost.setAttribute("opacity", "0.85");
    f.pips(1);
    f.say("올리브유가 하얗게 굳으면서 높이가 <b>낮아졌어요</b>! 낮아진 높이에 파란색 테이프를 붙였으니, 이제 얼린 뒤의 질량을 재 볼까요?");
    f.slot.setControls(el("div", { class: "u4x-row" }, rush, again));
    api.setCTA("다시 재 보세요", { enabled: false });
    return false;
  });
  // 얼린 병을 어떻게 잴지는 학생이 정한다. 닦지 않고 바로 재면 겉에 맺힌 물방울 때문에 숫자가 커진다(책의 주의).
  const again = bvBtn("u4x-olive-again", "병 겉면의 물기를 닦고 재기");
  const rush = bvBtn("u4x-olive-rush", "꺼내서 그대로 바로 재기");
  rush.addEventListener("click", () => {
    rush.disabled = true;
    haptic(HAPTIC.wrong);
    inBath(false);
    f.stage.classList.add("dew");
    read.textContent = WET;
    f.say(`질량이 <b>${WET}</b>으로 늘어났네요! 차가운 유리병 겉면에 공기 중의 수증기가 액화하여 <b>물방울</b>이 맺혔기 때문이에요. 물기를 깨끗이 닦고 다시 재 보세요.`);
  });

  weigh.addEventListener("click", () => {
    weigh.disabled = true;
    haptic(HAPTIC.tap);
    tape1.setAttribute("opacity", "1");
    read.textContent = MASS;
    f.say(`얼리기 전 높이에 <b>빨간색 테이프</b>를 붙이고 질량(<b>${MASS}</b>)을 기록했어요. 이제 올리브유를 얼려 볼까요?`);
    tm.later(
      () =>
        // 첫 보기는 "그대로"로 시작해야 한다(다시 잰 뒤의 말머리가 pred.startsWith("그대로")로 가른다)
        u4Predict(lab, "액체 올리브유가 얼어서 고체가 되면 <b>질량</b>은 어떻게 될까요?", ["그대로 일정하다", "얼기 전보다 늘어난다", "얼기 전보다 줄어든다"], (picked) => {
          pred = picked;
          // 병은 버튼을 누른 순간 비커로 옮겨 간다(inBath). 그래서 아직 '넣었어요'가 아니라 '넣어 얼려요'다
          f.say("유리병을 <b>얼음과 소금</b>이 든 비커에 넣어 얼려요. 버튼을 꾹 눌러 올리브유가 얼 때 높이와 입자 배열이 어떻게 달라지는지 관찰해 보세요.");
          f.slot.setControls(hold);
          api.setCTA("꾹 눌러 얼려 보세요", { enabled: false });
        }),
      900,
    );
  });
  again.addEventListener("click", () => {
    again.disabled = true;
    rush.disabled = true;
    inBath(false);
    f.stage.classList.remove("dew");
    haptic(HAPTIC.correct);
    read.textContent = MASS;
    f.pips(2);
    // 판정 무대: 병의 두 테이프 사이를 괄호로 묶고, 입자 창을 '얼리기 전'과 '얼린 뒤' 두 칸으로
    mark.setAttribute("opacity", "1");
    cmp.setAttribute("opacity", "1");
    ttl.textContent = "얼린 뒤";
    cnt.setAttribute("opacity", "1");
    wmark.setAttribute("opacity", "1");
    host.dataset.u4OliveCmp = "1";
    const head = pred.startsWith("그대로") ? "예측대로" : "예측과 달리";
    f.say(`${head} 물기를 닦고 재니 질량은 얼기 전과 똑같이 <b>${MASS}</b>이에요! 반면 올리브유의 높이(부피)는 줄어들었네요.`);
    tm.later(judge, 1100);
  });

  function toWater(): void {
    waterMode = true;
    t = 0;
    inBath(false);
    read.textContent = MASS_W;
    oil.setAttribute("fill", `url(#${ns}wat)`);
    ice.setAttribute("fill", `url(#${ns}wfrz)`);
    [...pB, ...pC].forEach((c) => {
      c.setAttribute("fill", `url(#${ns}pw)`);
      c.setAttribute("stroke", "#2B7ED6");
    });
    mark.setAttribute("opacity", "0");
    cmp.setAttribute("opacity", "0");
    tape2.setAttribute("opacity", "0");
    tape2.setAttribute("y", (LW1 - 2).toFixed(1));
    cLine.setAttribute("stroke", "rgba(255,255,255,.6)");
    ghost.setAttribute("opacity", "0");
    wmark.setAttribute("opacity", "0");
    wmark.setAttribute("d", `M${cC + SEC + 3} ${lvlW.toFixed(1)} h5 V${lvl0.toFixed(1)} h-5`);
    wmark.setAttribute("stroke", "#7CF0B5");
    ttl.textContent = "물의 입자 모형";
    cnt.setAttribute("opacity", "0");
    paint();
    const holdWater = u4Hold(lab, "꾹 눌러 물 얼리기", (ms) => {
      inBath(true);
      t = Math.min(1, t + ms / 2200);
      paint();
      if (t < 1) return true;
      haptic(HAPTIC.correct);
      holdWater.disabled = true;
      inBath(false);
      read.textContent = MASS_W;
      tape2.setAttribute("opacity", "1");
      waterMark.setAttribute("opacity", "1");
      cmp.setAttribute("opacity", "1");
      cLine.setAttribute("stroke", "#6C8CFF");
      ghost.setAttribute("opacity", "0.85");
      wmark.setAttribute("opacity", "1");
      ttl.textContent = "얼린 뒤(얼음)";
      cnt.setAttribute("opacity", "1");
      f.pips(3);
      f.say(`물을 얼리고 물기를 닦아 재니 질량은 그대로 <b>${MASS_W}</b>인데, 파란 테이프가 빨간 테이프보다 <b>위로 올라갔어요</b>!`);
      tm.later(judgeWater, 1100);
      return false;
    });
    f.say(`대부분의 액체는 얼 때 부피가 줄어들지만, <b>물</b>은 예외예요! 같은 병에 물을 <b>같은 높이</b>까지 담아(<b>${MASS_W}</b>) 얼려 보세요.`);
    f.slot.setControls(holdWater);
    api.setCTA("꾹 눌러 물을 얼려 보세요", { enabled: false });
  }

  function judgeWater(): void {
    f.slot.ask(
      "물이 얼어 얼음이 될 때 올리브유와 <b>달랐던 점</b>은 무엇인가요?",
      [{ t: "질량은 그대로인데 부피가 늘어났어요", ok: true }, { t: "질량과 부피가 모두 늘어났어요" }, { t: "올리브유처럼 부피가 줄어들었어요" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "물도 얼 때 입자 수가 그대로라 <b>질량은 변하지 않아요</b>. 다만 대부분의 물질과 달리 <b>부피가 늘어나요</b>.",
        onNext: () =>
          lab.finish("액체가 응고할 때 입자 수는 그대로라 <b>질량은 일정해요</b>. 대부분의 물질은 입자 사이가 가까워져 부피가 줄지만, <b>물</b>은 예외로 <b>부피가 늘어나요</b>."),
      },
    );
  }

  function judge(): void {
    f.slot.ask(
      "액체 올리브유가 얼었을 때 <b>부피가 줄어든</b> 까닭은 무엇인가요?",
      // 정답 보기는 오답 카드의 정답 줄에 한 줄로 들게 둔다(두 줄이면 틀렸을 때 조작 칸 208px를 넘는다)
      [{ t: "규칙적으로 배열되며 입자 사이가 가까워져서", ok: true }, { t: "올리브유를 이루는 입자의 개수가 줄어들어서" }, { t: "올리브유 입자 하나하나의 크기가 작아져서" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "상태가 변해도 입자의 크기와 개수는 변하지 않아요. 액체가 고체로 응고할 때 <b>입자 사이의 거리</b>가 가까워지기 때문에 부피가 줄어들어요.",
        onNext: toWater,
      },
    );
  }

  paint();
  jitter();
  f.slot.setControls(weigh);
  f.say("뚜껑 있는 유리병에 <b>올리브유</b>를 담아 저울에 올렸어요. 먼저 높이와 질량을 기록해요.");
  api.setCTA("높이와 질량을 기록하세요", { enabled: false });
  return lab.cleanup;
};
