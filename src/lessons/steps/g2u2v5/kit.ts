// 중2 Ⅱ 지권의 변화 v5 랩의 공용 도구(2026-11-12). 뼈대는 중1 Ⅱ의 bvFrame을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   gLab      뼈대 + 타이머 + 정리 묶음 + 끝맺음(결론, 끝 버튼). hint()는 검사 도구가 읽는 "다음에 누를 곳" 표식(개발 서버 전용)
//   gPredict  예측 질문(정오를 매기지 않는다)
//   gHold     꾹 누르는 동안만 일이 진행되는 버튼
//   gTap      무대 위의 누르는 자리(48px 이상, 무대 좌표 346×230의 퍼센트로 놓는다)
//   그림 조각  실사 표본(public/geo), 색
// 무대 좌표는 346×230이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvBtn, bvFrame, bvTimers, type BvFrame, type BvTimers } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;
export const svgOpen = `<svg viewBox="0 0 ${SW} ${SH}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
const BASE = (import.meta as unknown as { env: { BASE_URL?: string } }).env?.BASE_URL || "/";
/** public/geo 아래의 실사 표본 주소 */
export const geo = (path: string): string => `${BASE}geo/${path}`;

export const G = {
  text: "#E6EDF7",
  dim: "#93A6C2",
  line: "#6F86A8",
  gold: "#FFD43B",
  ok: "#51CF66",
  bad: "#FF8787",
  warm: "#FF922B",
  hot: "#FF6B4A",
  water: "#4DABF7",
  rock: "#B08D6E",
  rockDark: "#7A5C45",
  soil: "#8B6B4A",
} as const;

export interface GStep {
  title: string;
  cta?: string;
}

export interface GLab {
  host: HTMLElement;
  f: BvFrame;
  tm: BvTimers;
  api: StepAPI;
  q: <T extends Element>(sel: string) => T;
  qa: <T extends Element>(sel: string) => T[];
  onCleanup: (fn: () => void) => void;
  cleanup: () => void;
  /** 검사 도구용: 바른 길에서 다음에 누를 곳(data-k). "hold:키"는 꾹 누르기, "range:키=값"은 막대. 개발 서버에서만 남긴다. */
  hint: (k: string) => void;
  /** 판정 질문. 채점을 기록하고, 답한 뒤 '다음'으로 next를 부른다. */
  ask: (question: string, choices: [string, string, string?], why: string, next: () => void) => void;
  finish: (html: string) => void;
  finished: () => boolean;
}

export function gLab(host: HTMLElement, api: StepAPI, s: GStep, o: { steps: number; cls: string }): GLab {
  host.classList.add("g2u2x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u2x-stage ${o.cls}`, qCls: "g2u2x-q", api });
  const tm = bvTimers();
  const fns: Array<() => void> = [];
  let done = false;
  const hint = (k: string): void => {
    if (!import.meta.env.DEV) return;
    host.dataset.g2Hint = k;
    host.dataset.g2N = String(Number(host.dataset.g2N ?? 0) + 1);
  };
  return {
    host,
    f,
    tm,
    api,
    q: <T extends Element>(sel: string) => host.querySelector(sel) as T,
    qa: <T extends Element>(sel: string) => Array.from(host.querySelectorAll<T>(sel)),
    onCleanup: (fn) => fns.push(fn),
    cleanup: () => {
      tm.clear();
      fns.splice(0).forEach((fn) => fn());
    },
    hint,
    ask(question, choices, why, next) {
      hint("ask");
      // choices[0]이 정답이다(보기는 뼈대가 섞는다)
      f.slot.ask(question, choices.filter((t): t is string => !!t).map((t, i) => ({ t, ok: i === 0 })), (ok) => api.recordQuiz(ok), { why, onNext: next });
    },
    finish(html) {
      if (done) return;
      done = true;
      f.pips(o.steps);
      f.slot.conclude(html);
      haptic(HAPTIC.ctaUnlock);
      hint("cta");
      api.enableCTA(s.cta ?? "다음");
    },
    finished: () => done,
  };
}

/** 예측 질문(정오를 매기지 않는다). 고른 보기의 글을 next에 넘긴다. */
export function gPredict(lab: GLab, question: string, choices: string[], next: (picked: string) => void): void {
  let picked = "";
  const grab = (e: Event): void => {
    const b = (e.target as HTMLElement).closest(".bv-choice");
    if (b && !picked) picked = b.textContent?.trim() ?? "";
  };
  lab.f.slot.qBox.addEventListener("click", grab, true);
  lab.api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  lab.hint("predict");
  lab.f.slot.ask(question, choices.map((t) => ({ t })), () => undefined, {
    predict: true,
    nextDelay: 600,
    onNext: () => {
      lab.f.slot.qBox.removeEventListener("click", grab, true);
      next(picked);
    },
  });
}

/** 꾹 누르는 버튼. 누르는 동안 프레임마다 onTick(지난 ms)을 부른다. onTick이 false를 돌려주면 멈춘다. 키보드는 누를 때마다 0.5초. */
export function gHold(lab: GLab, key: string, text: string, onTick: (ms: number) => boolean | void): HTMLButtonElement {
  const b = bvBtn("main g2u2x-hold", text);
  b.dataset.k = key;
  let holding = false;
  let raf = 0;
  let last = 0;
  const stop = (): void => {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    b.classList.remove("on");
  };
  const frame = (t: number): void => {
    if (!holding || !lab.tm.alive()) return;
    const ms = Math.min(60, t - last);
    last = t;
    if (onTick(ms) === false) {
      stop();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  b.addEventListener("pointerdown", (e) => {
    if (b.disabled || holding) return;
    try {
      b.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    holding = true;
    last = performance.now();
    b.classList.add("on");
    haptic(HAPTIC.tap);
    raf = requestAnimationFrame(frame);
  });
  b.addEventListener("pointerup", stop);
  b.addEventListener("pointercancel", stop);
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  b.addEventListener("click", (e) => {
    if (e.detail !== 0 || b.disabled) return;
    onTick(500);
  });
  lab.onCleanup(stop);
  return b;
}

/** 넓은 버튼에 검사용 키를 달아 만든다. */
export function gBtn(key: string, text: string, main = true): HTMLButtonElement {
  const b = bvBtn(main ? "main" : "", text);
  b.dataset.k = key;
  return b;
}

/** 버튼 여러 개를 한 줄에 놓는다. */
export function gRow(...nodes: HTMLElement[]): HTMLElement {
  const row = el("div", { class: "g2u2x-row" }, ...nodes);
  row.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return row;
}

/** 고르는 칸(이름 + 한 줄 설명). 누른 것에 on, 해 본 것에 done. */
export interface GPick {
  el: HTMLButtonElement;
  on: (v: boolean) => void;
  done: () => void;
  sub: (t: string) => void;
}
export function gPick(key: string, name: string, sub = "", swatch = ""): GPick {
  const subEl = el("i", { text: sub });
  const b = el(
    "button",
    { class: "bv-card g2u2x-pick", attrs: { type: "button" } },
    swatch ? el("span", { class: "g2u2x-sw", attrs: { "aria-hidden": "true" }, html: swatch.startsWith("<") ? swatch : "", style: swatch.startsWith("<") ? {} : { background: swatch } }) : null,
    el("span", { class: "bv-card-tx" }, el("b", { text: name }), subEl),
  ) as HTMLButtonElement;
  b.dataset.k = key;
  return { el: b, on: (v) => b.classList.toggle("on", v), done: () => b.classList.add("done"), sub: (t) => (subEl.textContent = t) };
}
export function gGrid(cols: number, ...picks: GPick[]): HTMLElement {
  const row = el("div", { class: "bv-cards" }, ...picks.map((p) => p.el));
  row.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  return row;
}

/** 무대 위의 누르는 자리. (cx, cy)는 무대 좌표, w×h는 누르는 넓이(무대 좌표). */
export function gTap(lab: GLab, key: string, label: string, cx: number, cy: number, w = 52, h = 52): HTMLButtonElement {
  const b = el("button", { class: "g2u2x-tap", attrs: { type: "button", "aria-label": label } }) as HTMLButtonElement;
  b.dataset.k = key;
  b.style.left = `${((cx - w / 2) / SW) * 100}%`;
  b.style.top = `${((cy - h / 2) / SH) * 100}%`;
  b.style.width = `${(w / SW) * 100}%`;
  b.style.height = `${(h / SH) * 100}%`;
  lab.f.stage.appendChild(b);
  return b;
}

/** 실사 표본을 둥근 네모로 무대에 놓는 SVG 조각. */
export function specimen(id: string, path: string, x: number, y: number, w: number, h: number, r = 12): string {
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
    <image href="${geo(path)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/>`;
}

/** 무대 글자(12px 이상). */
export function label(x: number, y: number, t: string, o: { size?: number; fill?: string; anchor?: string; cls?: string; weight?: number } = {}): string {
  return `<text${o.cls ? ` class="${o.cls}"` : ""} x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 12.5}" font-weight="${o.weight ?? 800}" fill="${o.fill ?? G.text}">${t}</text>`;
}

/** 시드 고정 난수(mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v));
export { haptic, HAPTIC, el };
