// 중2 Ⅳ v5 랩의 공용 도구(2026-11-12). 뼈대는 bvFrame을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   g4Lab     뼈대 + 타이머 + 정리 묶음 + 판정(judge) + 끝맺음(finish)
//   g4Svg     무대(346×230)에 놓는 SVG 한 장. set(html)로 통째로 다시 그린다(움직임은 CSS와 setTimeout만). 움직이는 것만 따로 그릴 때는 g4Layer
//   그림 조각  원자 공(ball), 원자핵(nucleus), 원자핵 속 묶음(nucleusCluster), 전자(electron), 구름 모형 원자(cloudAtom, cloud, cloudSpots)
//   조작 부품  줄(row), 수 조절(stepper), 무대 글(cap), 알림(toast)
// 입자 표현은 ui/chemKit의 관례를 따른다(원자핵 +N, 전자 −, CPK 색, 상대 크기). 좌표는 전부 계산으로 놓는다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { ELEMS, formulaHtml } from "../../../ui/chemKit";
import type { StepAPI } from "../../types";
import { bvBtn, bvFrame, bvTimers, type BvChoice, type BvFrame, type BvTimers } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;
export const fml = formulaHtml;

export interface G4Step {
  title: string;
  cta?: string;
}

export interface G4Lab {
  f: BvFrame;
  tm: BvTimers;
  api: StepAPI;
  host: HTMLElement;
  onCleanup: (fn: () => void) => void;
  cleanup: () => void;
  /** 판정 질문. 틀린 적이 있으면 기록해 두었다가 finish에서 한 번 채점한다. */
  judge: (q: string, choices: BvChoice[], why: string, next: () => void) => void;
  /** 조작에서 어긋난 횟수를 센다(실패한 시도). */
  slip: () => void;
  finish: (html: string) => void;
  finished: () => boolean;
}

/** tall: 도움말에 세 줄 글이 하나라도 있는 랩은 처음부터 세 줄 상자를 잡아 둔다(랩 도중에 무대가 밀리지 않게, b6Lab 「글 맞춤」). */
export function g4Lab(host: HTMLElement, api: StepAPI, s: G4Step, o: { steps: number; cls: string; wait: string; tall?: boolean }): G4Lab {
  host.classList.add("g2u4x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u4x-stage ${o.cls}`, qCls: "g2u4x-q", api, tall: o.tall });
  const tm = bvTimers();
  const fns: Array<() => void> = [];
  let done = false;
  let wrong = 0;
  api.setCTA(o.wait, { enabled: false });
  return {
    f,
    tm,
    api,
    host,
    onCleanup: (fn) => fns.push(fn),
    cleanup: () => {
      tm.clear();
      fns.splice(0).forEach((fn) => fn());
    },
    judge(q, choices, why, next) {
      host.dataset.g4Phase = "ask";
      f.slot.ask(q, choices, (ok) => {
        if (!ok) wrong += 1;
        host.dataset.g4Phase = ok ? "right" : "wrong";
      }, { why, onNext: next });
    },
    slip: () => {
      wrong += 1;
    },
    finish(html) {
      if (done) return;
      done = true;
      host.dataset.g4Phase = "done";
      f.pips(o.steps);
      f.say("실험을 모두 마쳤어요! 아래 <b>핵심 정리</b>를 확인하고 다음으로 넘어가 보세요.");
      f.slot.conclude(html);
      haptic(HAPTIC.ctaUnlock);
      api.recordQuiz(wrong === 0);
      api.enableCTA(s.cta ?? "다음");
    },
    finished: () => done,
  };
}

// ── 무대 ────────────────────────────────────────────────────────────
export interface G4Svg {
  el: SVGSVGElement;
  /** 이 무대의 id 접두(그라데이션, 자르기). 같은 id가 다른 화면에도 있으면 숨은 쪽이 잡혀 색이 빠지므로 무대마다 다르게 붙인다. */
  ns: string;
  set: (html: string) => void;
}
let svgSeq = 0;
export function g4Svg(lab: G4Lab, aria: string): G4Svg {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${SW} ${SH}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", aria);
  lab.f.stage.appendChild(svg);
  svgSeq += 1;
  return { el: svg, ns: `g2u4x${svgSeq}`, set: (html) => (svg.innerHTML = html) };
}

/** 무대 위에 따로 다시 그리는 층(움직이는 것만). 무대를 set으로 다시 그린 뒤에 다시 붙여야 한다. */
export function g4Layer(stage: G4Svg, cls: string): SVGGElement {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", cls);
  stage.el.appendChild(g);
  return g;
}

/** 움직임 줄이기를 켠 기기인가(그때는 움직임을 한 장면으로 멈춰 그린다). */
export const calm = (): boolean => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 무대 위에 얹는 글 한 줄(왼쪽 위, 12.5px 이상). */
export function cap(lab: G4Lab, cls = ""): HTMLElement {
  const c = el("div", { class: `g2u4x-cap ${cls}` });
  lab.f.stage.appendChild(c);
  return c;
}

/** 무대 가운데 위에 잠깐 뜨는 알림. */
export function toast(lab: G4Lab, text: string, bad = false): void {
  lab.f.stage.querySelector(".g2u4x-toast")?.remove();
  const t = el("div", { class: `g2u4x-toast${bad ? " bad" : ""}`, text });
  lab.f.stage.appendChild(t);
  lab.tm.later(() => t.remove(), 1900);
}

// ── 그림 조각(어두운 무대용 SVG 문자열) ──────────────────────────────
interface Tone {
  rgb: string;
  hi: string;
  r: number;
  dark?: boolean; // 밝은 공이라 글자를 어둡게
}
const EXTRA: Record<string, Tone> = {
  Al: { rgb: "186,194,206", hi: "#F2F5FA", r: 14, dark: true },
  Li: { rgb: "196,134,240", hi: "#EBD4FF", r: 13 },
  K: { rgb: "132,84,206", hi: "#CDB4FF", r: 17 },
  F: { rgb: "150,214,96", hi: "#DDF6BE", r: 11, dark: true },
  Ne: { rgb: "246,146,96", hi: "#FFD8BE", r: 11 },
  Ar: { rgb: "186,140,236", hi: "#E6D2FF", r: 13 },
  Ca: { rgb: "120,196,150", hi: "#CFF2DC", r: 16 },
  Au: { rgb: "236,188,64", hi: "#FFEAA8", r: 15, dark: true },
};
const toneOf = (sym: string): Tone => {
  const e = ELEMS[sym];
  if (e) return { rgb: e.rgb, hi: e.hi, r: e.r, dark: sym === "H" || sym === "He" || sym === "S" };
  return EXTRA[sym] ?? { rgb: "150,160,176", hi: "#E0E6F0", r: 13 };
};
const shade = (rgb: string, k: number): string =>
  `rgb(${rgb
    .split(",")
    .map((v) => Math.round(Number(v) * k))
    .join(",")})`;

/** 원자 공. k는 크기 배율, label이 false면 기호를 적지 않는다. charge를 주면 오른쪽 위에 전하를 붙인다. */
export function ball(x: number, y: number, sym: string, o: { k?: number; label?: boolean; charge?: string; cls?: string } = {}): string {
  const t = toneOf(sym);
  const r = t.r * (o.k ?? 1);
  const fs = Math.max(12, r * 0.95);
  const lab = o.label === false ? "" : `<text x="${x}" y="${y + fs * 0.35}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${t.dark ? "#263244" : "#fff"}">${sym}</text>`;
  const ch = o.charge ? `<text x="${x + r * 0.78}" y="${y - r * 0.62}" font-size="13" font-weight="800" fill="#FFE58A">${o.charge}</text>` : "";
  return `<g class="g2u4x-ball ${o.cls ?? ""}"><circle cx="${x}" cy="${y}" r="${r}" fill="rgb(${t.rgb})" stroke="${shade(t.rgb, 0.55)}" stroke-width="1.5"/><circle cx="${x - r * 0.32}" cy="${y - r * 0.34}" r="${r * 0.3}" fill="${t.hi}" opacity=".75"/>${lab}${ch}</g>`;
}

/** 두 공을 잇는 결합 막대(공 뒤에 깔리게 먼저 그린다). */
export const bond = (x0: number, y0: number, x1: number, y1: number): string =>
  `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#9AA8BC" stroke-width="5" stroke-linecap="round"/>`;

/** 원자핵(+N). */
export function nucleus(x: number, y: number, p: number, r = 20): string {
  return `<g class="g2u4x-nuc"><circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B" stroke="#A8442E" stroke-width="1.6"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.3}" fill="#FFC0AE" opacity=".8"/><text x="${x}" y="${y + r * 0.26}" text-anchor="middle" font-size="${Math.max(12, r * 0.72)}" font-weight="800" fill="#fff">+${p}</text></g>`;
}

/** 전자(−). 옅은 파란 구름 위에서도 알갱이로 보이게 구름보다 진한 파랑에 밝은 테를 두른다. */
export function electron(x: number, y: number, r = 6.5, cls = ""): string {
  return `<g class="g2u4x-e ${cls}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#3F86E6" stroke="#D2E6FF" stroke-width="1.2"/><line x1="${(x - r * 0.5).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + r * 0.5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></g>`;
}

// ── 원자 모형(구름 모형) ────────────────────────────────────────────
// 책의 원자 모형과 같게 그린다: 원자의 크기만 한 옅은 파란 구름, 가운데 원자핵, 전자는 고리 없이 구름 안에 고르게 흩어 둔다(개수는 정확히).
// 이 교과 과정은 전자 껍질을 다루지 않으므로 궤도선이나 "안쪽 2개, 바깥 8개" 같은 채우는 차례를 보이지 않는다.

/** 구름 그라데이션(무대 한 장에 한 번 넣는다). 가운데가 조금 진하고 가장자리로 갈수록 옅어진다. */
export const cloudDefs = (ns: string): string =>
  `<defs><radialGradient id="${ns}-cl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#A8E2FF" stop-opacity=".62"/><stop offset=".45" stop-color="#62BDF8" stop-opacity=".44"/><stop offset=".8" stop-color="#3D9BEA" stop-opacity=".3"/><stop offset="1" stop-color="#3D9BEA" stop-opacity=".1"/></radialGradient></defs>`;

/** 원자의 크기를 나타내는 옅은 파란 구름(가장자리에 아주 옅은 테를 둘러 크기를 비교할 수 있게). */
export const cloud = (cx: number, cy: number, R: number, ns: string, op = 1): string =>
  `<g opacity="${op}"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="url(#${ns}-cl)"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(R - 0.6).toFixed(1)}" fill="none" stroke="#A9D4FF" stroke-opacity=".22" stroke-width="1.1"/></g>`;

const GOLD = Math.PI * (3 - Math.sqrt(5)); // 황금각

/** 전자의 자리: 구름 안의 고리 띠(rIn~rOut)를 넓이가 같게 나눠 해바라기처럼 흩는다.
 *  i번 전자의 방향은 개수와 상관없이 phase + i×황금각이다. 그래서 전자 수나 구름 크기가 바뀌어도 전자는 제 방향을 지킨 채
 *  반지름만 바뀌고(건네는 동안 서로 엇갈리지 않는다), 마지막 번호가 맨 바깥 전자다. */
export function cloudSpots(cx: number, cy: number, n: number, rIn: number, rOut: number, phase = 0): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt(rIn * rIn + (rOut * rOut - rIn * rIn) * ((i + 0.5) / n));
    const a = phase + i * GOLD;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

/** i번 전자의 방향(phase를 정할 때 쓴다). */
export const spotAngle = (i: number, phase: number): number => phase + i * GOLD;

/** 구름 모형 원자 하나: 구름, 원자핵(core를 주면 그것을), 전자 e개.
 *  rIn은 전자를 두기 시작하는 반지름(원자핵을 비켜 간다). avoid 상자(원자핵 아래 이름표 같은 것)에 걸린 전자는 같은 방향으로 밀어 낸다.
 *  전자가 없으면 구름을 옅게 그린다. */
export function cloudAtom(o: { cx: number; cy: number; R: number; p: number; e: number; ns: string; nr?: number; er?: number; rIn?: number; phase?: number; core?: string; avoid?: { x0: number; y0: number; x1: number; y1: number } }): string {
  const nr = o.nr ?? 17;
  const er = o.er ?? 6;
  const rIn = o.rIn ?? nr + er + 3;
  const rOut = Math.max(rIn + 1, o.R - er - 3);
  const spots = cloudSpots(o.cx, o.cy, o.e, rIn, rOut, o.phase ?? 0).map((s) => {
    const b = o.avoid;
    if (!b) return s;
    const hit = (x: number, y: number): boolean => x > b.x0 - er - 1 && x < b.x1 + er + 1 && y > b.y0 - er - 1 && y < b.y1 + er + 1;
    if (!hit(s.x, s.y)) return s;
    const dx = s.x - o.cx;
    const dy = s.y - o.cy;
    const r0 = Math.hypot(dx, dy) || 1;
    for (let r = r0; r <= rOut; r += 1) {
      const x = o.cx + (dx / r0) * r;
      const y = o.cy + (dy / r0) * r;
      if (!hit(x, y)) return { x, y };
    }
    return { x: o.cx + (dx / r0) * rOut, y: o.cy + (dy / r0) * rOut };
  });
  return cloud(o.cx, o.cy, o.R, o.ns, o.e === 0 ? 0.55 : 1) + (o.core ?? nucleus(o.cx, o.cy, o.p, nr)) + spots.map((s) => electron(s.x, s.y, er)).join("");
}

// 원자핵 속 알갱이 묶음의 자리: 육각으로 쌓은 격자점을 가운데에서 가까운 차례로(하나를 더하면 바깥에 하나가 붙는다).
const HEX: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) pts.push([i + j / 2, (j * Math.sqrt(3)) / 2]);
  const key = (p: [number, number]): number => Math.round(Math.hypot(p[0], p[1]) * 1000);
  const ang = (p: [number, number]): number => (Math.atan2(p[1], p[0]) + Math.PI * 2.5) % (Math.PI * 2);
  return pts.sort((a, b) => key(a) - key(b) || ang(a) - ang(b));
})();

/** 원자핵 속 알갱이 묶음: 양성자(빨강, +)와 중성자(회색)를 번갈아 쌓는다(한쪽이 떨어지면 남은 쪽). 바깥 것부터 그려 가운데가 앞으로 솟아 보이게 한다.
 *  돌려주는 R은 묶음의 바깥 반지름(이름표와 전자를 비켜 놓는 데 쓴다). */
export function nucleusCluster(cx: number, cy: number, p: number, n: number, br = 5): { svg: string; R: number } {
  const kinds: boolean[] = [];
  let lp = p;
  let ln = n;
  while (lp + ln > 0) {
    if (lp > 0 && (kinds.length % 2 === 0 || ln === 0)) {
      kinds.push(true);
      lp -= 1;
    } else {
      kinds.push(false);
      ln -= 1;
    }
  }
  const d = br * 1.8; // 알갱이 사이(조금 겹쳐 한 덩이로 보이게)
  const pts = HEX.slice(0, kinds.length).map(([x, y]) => [x * d, y * d]);
  const mx = pts.reduce((a, q) => a + q[0], 0) / Math.max(1, pts.length);
  const my = pts.reduce((a, q) => a + q[1], 0) / Math.max(1, pts.length);
  let R = br;
  let svg = "";
  for (let i = pts.length - 1; i >= 0; i--) {
    const x = cx + pts[i][0] - mx;
    const y = cy + pts[i][1] - my;
    R = Math.max(R, Math.hypot(x - cx, y - cy) + br);
    const s = br * 0.48;
    svg += kinds[i]
      ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${br}" fill="#E8836B" stroke="#A8442E" stroke-width="1.1"/><path d="M${(x - s).toFixed(1)} ${y.toFixed(1)}h${(2 * s).toFixed(1)}M${x.toFixed(1)} ${(y - s).toFixed(1)}v${(2 * s).toFixed(1)}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`
      : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${br}" fill="#A3AEBF" stroke="#5F6B7E" stroke-width="1.1"/><circle cx="${(x - br * 0.3).toFixed(1)}" cy="${(y - br * 0.32).toFixed(1)}" r="${(br * 0.3).toFixed(1)}" fill="#E4E9F1" opacity=".7"/>`;
  }
  return { svg: `<g class="g2u4x-nucs">${svg}</g>`, R };
}

/** 무대 글자(SVG). 12px 이상만 쓴다. */
export const txt = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number; cls?: string } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 12.5}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? "#C6D3E6"}"${o.cls ? ` class="${o.cls}"` : ""}>${s}</text>`;

// ── 조작 부품 ───────────────────────────────────────────────────────
/** 버튼 여러 개를 한 줄에 고르게 놓는다. */
export function row(...nodes: HTMLElement[]): HTMLElement {
  const r = el("div", { class: "g2u4x-row" }, ...nodes);
  r.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return r;
}

/** 수 조절: 이름표, 빼기, 값, 더하기(버튼은 48px). */
export interface G4Stepper {
  el: HTMLElement;
  set: (v: string) => void;
  lock: (v: boolean) => void;
}
export function stepper(label: string, key: string, onStep: (d: number) => void): G4Stepper {
  const val = el("b", { class: "g2u4x-st-v", text: "0" });
  const mk = (d: number): HTMLButtonElement => {
    const b = el("button", { class: "g2u4x-st-b", text: d < 0 ? "−" : "+", attrs: { type: "button", "aria-label": `${label} ${d < 0 ? "하나 빼기" : "하나 더하기"}` } }) as HTMLButtonElement;
    b.dataset.k = `${key}${d < 0 ? "-" : "+"}`;
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      onStep(d);
    });
    return b;
  };
  const minus = mk(-1);
  const plus = mk(1);
  return {
    el: el("div", { class: "g2u4x-st" }, el("span", { class: "g2u4x-st-l", html: label }), minus, val, plus),
    set: (v) => (val.textContent = v),
    lock: (v) => {
      minus.disabled = v;
      plus.disabled = v;
    },
  };
}

export { bvBtn };

// ── 조사(받침에 맞춰) ───────────────────────────────────────────────
// 변수로 이은 글의 조사를 앞말의 받침에 맞춘다("은(는)" 같은 겹쳐 쓰기 대신). 끝 글자가 한글이면 그 받침,
// 숫자와 알파벳은 읽는 소리로 본다(1 일, 3 삼, 6 육, 7 칠, 8 팔, 0 영·십은 받침. 원소 기호 Cl은 '시엘'이라 받침 ㄹ).
// 끝에 붙은 괄호 덧말("염화 나트륨(소금)")과 굵은 글씨 표시는 떼고 본다.
/** 0: 받침 없음, 1: 받침 있음(ㄹ 아님), 2: ㄹ받침 */
function batchim(word: string): 0 | 1 | 2 {
  const w = word.replace(/<[^>]*>/g, "").trim().replace(/\([^()]*\)$/, "").trim();
  const m = w.match(/[가-힣A-Za-z0-9](?=[^가-힣A-Za-z0-9]*$)/);
  if (!m) return 0;
  const ch = m[0];
  if (/[가-힣]/.test(ch)) {
    const j = (ch.charCodeAt(0) - 0xac00) % 28;
    return j === 0 ? 0 : j === 8 ? 2 : 1;
  }
  if (/[0-9]/.test(ch)) return "178".includes(ch) ? 2 : "036".includes(ch) ? 1 : 0;
  const up = ch.toUpperCase();
  return "LR".includes(up) ? 2 : "MN".includes(up) ? 1 : 0;
}
export const eun = (w: string): string => (batchim(w) ? "은" : "는");
export const iga = (w: string): string => (batchim(w) ? "이" : "가");
export const eul = (w: string): string => (batchim(w) ? "을" : "를");
/** 이에요/예요 */
export const ida = (w: string): string => (batchim(w) ? "이에요" : "예요");
/** 으로/로(ㄹ받침은 로) */
export const ro = (w: string): string => (batchim(w) === 1 ? "으로" : "로");

export const tap = (): void => haptic(HAPTIC.tap);
export const good = (): void => haptic(HAPTIC.correct);
export const bad = (): void => haptic(HAPTIC.wrong);
