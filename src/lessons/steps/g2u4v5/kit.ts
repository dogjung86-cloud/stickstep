// 중2 Ⅳ v5 랩의 공용 도구(2026-11-12). 뼈대는 bvFrame을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   g4Lab     뼈대 + 타이머 + 정리 묶음 + 판정(judge) + 끝맺음(finish)
//   g4Svg     무대(346×230)에 놓는 SVG 한 장. set(html)로 통째로 다시 그린다(움직임은 CSS와 setTimeout만)
//   그림 조각  원자 공(ball), 원자핵(nucleus), 전자(electron), 원자 모형(atomModel), 기포(bubbles)
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

export function g4Lab(host: HTMLElement, api: StepAPI, s: G4Step, o: { steps: number; cls: string; wait: string }): G4Lab {
  host.classList.add("g2u4x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u4x-stage ${o.cls}`, qCls: "g2u4x-q", api });
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
      f.say("잘했어요. <b>알게 된 것</b>을 읽고 다음으로 넘어가요.");
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
  set: (html: string) => void;
}
export function g4Svg(lab: G4Lab, aria: string): G4Svg {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${SW} ${SH}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", aria);
  lab.f.stage.appendChild(svg);
  return { el: svg, set: (html) => (svg.innerHTML = html) };
}

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

/** 전자(−). */
export function electron(x: number, y: number, r = 6.5, cls = ""): string {
  return `<g class="g2u4x-e ${cls}"><circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#BFDcFF" stroke-width="1.2"/><line x1="${x - r * 0.5}" y1="${y}" x2="${x + r * 0.5}" y2="${y}" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></g>`;
}

/** 전자의 자리: 안쪽 궤도부터 2, 8, 8개씩 고르게 놓는다. */
export function electronSpots(cx: number, cy: number, e: number, r0: number, gap: number): { x: number; y: number; shell: number }[] {
  const caps = [2, 8, 8, 2];
  const out: { x: number; y: number; shell: number }[] = [];
  let left = e;
  caps.forEach((c, s) => {
    const n = Math.min(c, left);
    left -= n;
    const r = r0 + gap * s;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + s * 0.4;
      out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, shell: s });
    }
  });
  return out;
}

/** 원자 모형: 가운데 원자핵(+p), 점선 궤도, 전자 e개. */
export function atomModel(cx: number, cy: number, p: number, e: number, o: { nr?: number; r0?: number; gap?: number; er?: number } = {}): string {
  const nr = o.nr ?? 17;
  const r0 = o.r0 ?? nr + 15;
  const gap = o.gap ?? 17;
  const spots = electronSpots(cx, cy, e, r0, gap);
  const shells = Math.max(1, ...spots.map((s) => s.shell + 1));
  let out = "";
  for (let s = 0; s < shells; s++) out += `<circle cx="${cx}" cy="${cy}" r="${r0 + gap * s}" fill="none" stroke="#3B5273" stroke-width="1.2" stroke-dasharray="4 5"/>`;
  out += nucleus(cx, cy, p, nr);
  out += spots.map((s) => electron(s.x, s.y, o.er ?? 6)).join("");
  return out;
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
export const tap = (): void => haptic(HAPTIC.tap);
export const good = (): void => haptic(HAPTIC.correct);
export const bad = (): void => haptic(HAPTIC.wrong);
