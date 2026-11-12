// 중2 Ⅵ v5 랩의 공용 도구(2026-11-12). 뼈대는 bvFrame을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   g6Lab     뼈대 + 타이머 + 정리 묶음 + 판정(judge) + 끝맺음(finish)
//   g6Svg     무대(346×230)에 놓는 SVG 한 장. set(html)로 통째로 다시 그린다(움직임은 CSS와 setTimeout만)
//   그림 조각  시험관(tube), 스포이트(pipette), 이름표(tag), 화살표(arrow), 알갱이(dot)
//   조작 부품  줄(row), 단추(chip), 알림(toast)
// 색은 P 팔레트 하나에서 뽑는다. 좌표는 전부 계산으로 놓는다. 무대 안 글자는 12px 이상.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvBtn, bvFrame, bvTimers, bvTween, type BvChoice, type BvFrame, type BvTimers } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;

export const P = {
  o2: "#7CC8FF",
  co2: "#BBA8F5",
  red: "#F0606B", // 산소가 많은 혈액
  dark: "#8E4A7A", // 산소가 적은 혈액
  glass: "#9CB4D6",
  text: "#C6D3E6",
  dim: "#8CA2C0",
  hi: "#E8EEF9",
  bad: "#FF8A94",
  good: "#6FD08C",
  energy: "#FFD43B",
  glucose: "#F5B544",
  urea: "#B58BE8",
  water: "#5AB0F2",
  protein: "#F08C5A",
  // 검출 반응의 색
  iodine: "#C58A2E",
  iodineBlue: "#2B2F8A",
  biuret: "#8FC7EE",
  biuretViolet: "#8A4FD0",
  sudan: "#E7A79A",
  sudanRed: "#E5354B",
  benedict: "#4FA8E8",
  benedictOrange: "#E0792A",
  clear: "rgba(225,238,255,.30)",
};

export interface G6Step {
  title: string;
  cta?: string;
}

export interface G6Lab {
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

export function g6Lab(host: HTMLElement, api: StepAPI, s: G6Step, o: { steps: number; cls: string; wait: string }): G6Lab {
  host.classList.add("g2u6x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u6x-stage ${o.cls}`, qCls: "g2u6x-q", api });
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
      host.dataset.g6Phase = "ask";
      f.slot.ask(
        q,
        choices,
        (ok) => {
          if (!ok) wrong += 1;
          host.dataset.g6Phase = ok ? "right" : "wrong";
        },
        { why, onNext: next },
      );
    },
    slip: () => {
      wrong += 1;
    },
    finish(html) {
      if (done) return;
      done = true;
      host.dataset.g6Phase = "done";
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
export interface G6Svg {
  el: SVGSVGElement;
  set: (html: string) => void;
}
export function g6Svg(lab: G6Lab, aria: string): G6Svg {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${SW} ${SH}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", aria);
  lab.f.stage.appendChild(svg);
  return { el: svg, set: (html) => (svg.innerHTML = html) };
}

/** 무대 안의 [data-k] 조각을 눌렀을 때 그 열쇠를 넘겨준다(무대를 다시 그려도 살아 있다). */
export function onStageTap(stage: G6Svg, fn: (key: string) => void): void {
  stage.el.addEventListener("click", (e) => {
    const hit = (e.target as Element).closest("[data-k]");
    const k = hit?.getAttribute("data-k");
    if (k) fn(k);
  });
}

/** 무대 가운데에 잠깐 뜨는 알림. */
export function toast(lab: G6Lab, text: string, bad = false): void {
  lab.f.stage.querySelector(".g2u6x-toast")?.remove();
  const t = el("div", { class: `g2u6x-toast${bad ? " bad" : ""}`, text });
  lab.f.stage.appendChild(t);
  lab.tm.later(() => t.remove(), 1900);
}

/** 무대 글자(SVG). 12px 이상만 쓴다. */
export const txt = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number; cls?: string } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 12.5}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? P.text}"${o.cls ? ` class="${o.cls}"` : ""}>${s}</text>`;

/** 둥근 이름표(글자 뒤에 어두운 바탕). */
export function tag(x: number, y: number, s: string, o: { fill?: string; bg?: string; size?: number; stroke?: string } = {}): string {
  const size = o.size ?? 12.5;
  const w = s.length * size * 0.92 + 14;
  return `<g><rect x="${x - w / 2}" y="${y - size - 3}" width="${w}" height="${size + 10}" rx="${(size + 10) / 2}" fill="${o.bg ?? "#22324D"}" stroke="${o.stroke ?? "#3A4D6E"}"/>${txt(x, y + 1, s, { size, fill: o.fill ?? P.hi })}</g>`;
}

/** 화살표(직선). */
export function arrow(x0: number, y0: number, x1: number, y1: number, color: string, w = 2.6, cls = ""): string {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const hx = (d: number, s: number): string => `${(x1 - Math.cos(a) * 9 + Math.cos(a + Math.PI / 2) * s * d).toFixed(1)},${(y1 - Math.sin(a) * 9 + Math.sin(a + Math.PI / 2) * s * d).toFixed(1)}`;
  return `<g${cls ? ` class="${cls}"` : ""}><line x1="${x0}" y1="${y0}" x2="${(x1 - Math.cos(a) * 6).toFixed(1)}" y2="${(y1 - Math.sin(a) * 6).toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x1},${y1} ${hx(1, 5)} ${hx(-1, 5)}" fill="${color}"/></g>`;
}

/** 알갱이 하나. */
export const dot = (x: number, y: number, r: number, fill: string, stroke = "#16233A", cls = ""): string =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"${cls ? ` class="${cls}"` : ""}/>`;

/** 시험관. (x, y)는 입구 가운데, h는 길이. liquid는 액체 색(없으면 빈 시험관), level은 0~1. */
export function tube(x: number, y: number, h: number, liquid: string | null, level = 0.6, w = 11, cls = ""): string {
  const top = y + h * (1 - level);
  const liq = liquid ? `<path${cls ? ` class="${cls}"` : ""} d="M${x - w + 1.5} ${top} L${x - w + 1.5} ${y + h - w} A${w - 1.5} ${w - 1.5} 0 0 0 ${x + w - 1.5} ${y + h - w} L${x + w - 1.5} ${top} Z" fill="${liquid}"/>` : "";
  return `${liq}<path d="M${x - w} ${y} L${x - w} ${y + h - w} A${w} ${w} 0 0 0 ${x + w} ${y + h - w} L${x + w} ${y}" fill="rgba(200,225,255,.07)" stroke="${P.glass}" stroke-width="1.7"/><line x1="${x - w - 3}" y1="${y}" x2="${x + w + 3}" y2="${y}" stroke="${P.glass}" stroke-width="2" stroke-linecap="round"/>`;
}

/** 스포이트(끝이 (x, y)를 향한다). */
export function pipette(x: number, y: number, color: string): string {
  return `<g class="g2u6x-pop"><rect x="${x - 4}" y="${y - 38}" width="8" height="26" rx="3" fill="rgba(200,225,255,.25)" stroke="${P.glass}" stroke-width="1.3"/><rect x="${x - 3}" y="${y - 28}" width="6" height="15" rx="2" fill="${color}"/><ellipse cx="${x}" cy="${y - 42}" rx="7" ry="6" fill="#C0392B" stroke="#7A1F16" stroke-width="1.2"/><path d="M${x} ${y - 10} l-3 6 a3 3 0 0 0 6 0 Z" fill="${color}"/></g>`;
}

// ── 조작 부품 ───────────────────────────────────────────────────────
/** 버튼 여러 개를 한 줄에 고르게 놓는다. */
export function row(...nodes: HTMLElement[]): HTMLElement {
  const r = el("div", { class: "g2u6x-row" }, ...nodes);
  r.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return r;
}

/** 작은 단추(50px). 이름과 둘째 줄(상태). on()으로 켜진 모습, done()으로 해 본 표시. */
export interface G6Chip {
  el: HTMLButtonElement;
  on: (v: boolean) => void;
  name: (t: string) => void;
  sub: (t: string) => void;
  done: (v?: boolean) => void;
  lock: (v: boolean) => void;
}
export function chip(key: string, name: string, sub = "", onTap?: () => void): G6Chip {
  const nameEl = el("b", { text: name });
  const subEl = el("i", { text: sub });
  const b = el("button", { class: "g2u6x-chipbtn", attrs: { type: "button" } }, nameEl, subEl) as HTMLButtonElement;
  b.dataset.k = key;
  if (!sub) subEl.hidden = true;
  if (onTap) b.addEventListener("click", onTap);
  return {
    el: b,
    on: (v) => b.classList.toggle("on", v),
    name: (t) => (nameEl.textContent = t),
    sub: (t) => {
      subEl.textContent = t;
      subEl.hidden = !t;
    },
    done: (v = true) => b.classList.toggle("done", v),
    lock: (v) => (b.disabled = v),
  };
}

export { bvBtn, bvTween };
export const tap = (): void => haptic(HAPTIC.tap);
export const good = (): void => haptic(HAPTIC.correct);
export const bad = (): void => haptic(HAPTIC.wrong);

/** 두 색(#RRGGBB)을 t(0~1)만큼 섞는다. */
export function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** 조작 칸에 놓는 안내 글 한 줄(버튼이 없는 랩에서 쓴다). */
export function noteLine(html: string): HTMLElement {
  return el("div", { class: "g2u6x-note", html });
}
