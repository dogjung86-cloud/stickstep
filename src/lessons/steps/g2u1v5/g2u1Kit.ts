// 중2 Ⅰ v5 랩의 공용 도구(2026-11-12). 뼈대는 bvFrame(bio6/b6Lab)을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   g1Lab     뼈대 + 타이머 + 정리(cleanup) 묶음 + 끝맺음(결론, 끝 버튼, 궁금증 카드) + 검사 길잡이(todo)
//   g1Predict 예측 질문(정오를 매기지 않는다)
//   g1Hold    꾹 누르는 동안만 일이 진행되는 버튼
//   g1Seg     나란한 선택 버튼 줄
//   그림 조각 비커, 전자저울, 눈금실린더, 시험관, 온도계, 불꽃, 그래프 축(어두운 무대용 SVG 조각. 좌표는 계산으로 맞춘다)
// 무대 좌표는 346×230(폰 390 화면의 무대 크기)이다.
// 검사 길잡이: 개발 서버에서만 스텝 요소에 data-todo(다음에 누를 곳의 선택자)를 남긴다. 운영 화면에는 없다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepAPI } from "../../types";
import { bvBtn, bvFrame, bvTimers, type BvFrame, type BvTimers } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;

export interface G1Step {
  title: string;
  cta?: string;
  curio?: Curio;
  mode?: string;
}

export interface G1Lab {
  host: HTMLElement;
  f: BvFrame;
  tm: BvTimers;
  api: StepAPI;
  onCleanup: (fn: () => void) => void;
  cleanup: () => void;
  /** 랩의 끝: 진행 점을 다 켜고, 결론 한 문장을 조작 칸에 띄우고, 끝 버튼을 연다. */
  finish: (html: string) => void;
  finished: () => boolean;
  /** 검사 길잡이(개발 서버 전용): 다음에 누를 곳. val을 주면 미는 막대의 값. 비우면 지운다. */
  todo: (sel?: string, val?: number) => void;
  /** 판정 질문(채점은 첫 판정 한 번만 기록한다). */
  judge: (q: string, choices: { t: string; ok?: boolean }[], why: string, next: () => void) => void;
}

export function g1Lab(host: HTMLElement, api: StepAPI, s: G1Step, o: { steps: number; cls: string }): G1Lab {
  host.classList.add("g2u1x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u1x-stage ${o.cls}`, qCls: "g2u1x-q", api });
  const tm = bvTimers();
  const fns: Array<() => void> = [];
  let done = false;
  let judged = false;
  const todo = (sel?: string, val?: number): void => {
    if (!import.meta.env.DEV) return;
    if (!sel) delete host.dataset.todo;
    else host.dataset.todo = sel;
    if (val === undefined) delete host.dataset.todoVal;
    else host.dataset.todoVal = String(val);
  };
  return {
    host,
    f,
    tm,
    api,
    todo,
    onCleanup: (fn) => fns.push(fn),
    cleanup: () => {
      tm.clear();
      fns.splice(0).forEach((fn) => fn());
    },
    finish(html) {
      if (done) return;
      done = true;
      todo();
      f.pips(o.steps);
      f.slot.conclude(html);
      haptic(HAPTIC.ctaUnlock);
      api.enableCTA(s.cta ?? "다음");
      if (s.curio) host.appendChild(curioCard(s.curio));
    },
    finished: () => done,
    judge(q, choices, why, next) {
      todo(".bv-choice[data-ok='1'], .bv-next");
      f.slot.ask(
        q,
        choices,
        (ok) => {
          if (!judged) api.recordQuiz(ok);
          judged = true;
        },
        { why, onNext: next },
      );
    },
  };
}

/** 예측 질문(정오를 매기지 않는다). 고른 보기의 글을 next에 넘긴다. 답은 뒤의 실험이 보여 준다. */
export function g1Predict(lab: G1Lab, question: string, choices: string[], next: (picked: string) => void, delay = 600): void {
  let picked = "";
  const grab = (e: Event): void => {
    const b = (e.target as HTMLElement).closest(".bv-choice");
    if (b && !picked) picked = b.textContent?.trim() ?? "";
  };
  lab.f.slot.qBox.addEventListener("click", grab, true);
  lab.api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  lab.todo(".bv-choice");
  lab.f.slot.ask(question, choices.map((t) => ({ t })), () => undefined, {
    predict: true,
    nextDelay: delay,
    onNext: () => {
      lab.f.slot.qBox.removeEventListener("click", grab, true);
      next(picked);
    },
  });
}

/** 꾹 누르는 버튼. 누르고 있는 동안 프레임마다 onTick(지난 ms)을 부른다. onTick이 false를 돌려주면 멈춘다. */
export function g1Hold(lab: G1Lab, text: string, onTick: (ms: number) => boolean | void, cls = "main"): HTMLButtonElement {
  const b = bvBtn(`${cls} g2u1x-hold`, text);
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
  // 키보드(Enter, Space): 누를 때마다 0.5초만큼 진행한다
  b.addEventListener("click", (e) => {
    if (e.detail !== 0 || b.disabled) return;
    onTick(500);
  });
  lab.onCleanup(stop);
  return b;
}

/** 나란한 선택 버튼 줄. 고른 칸에 on이 붙는다. */
export interface G1Seg {
  el: HTMLElement;
  btns: HTMLButtonElement[];
  set: (i: number) => void;
  lock: (v: boolean) => void;
}
export function g1Seg(cls: string, labels: string[], onPick: (i: number) => void): G1Seg {
  const btns = labels.map((t, i) => {
    const b = el("button", { class: "g2u1x-seg-b", html: t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = String(i);
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      onPick(i);
    });
    return b;
  });
  const row = el("div", { class: `g2u1x-seg ${cls}` }, ...btns);
  row.style.gridTemplateColumns = `repeat(${labels.length}, 1fr)`;
  return {
    el: row,
    btns,
    set: (i) => btns.forEach((b, j) => b.classList.toggle("on", i === j)),
    lock: (v) => btns.forEach((b) => (b.disabled = v)),
  };
}

/** 두 칸 줄(버튼 둘을 나란히). */
export const g1Row = (...nodes: HTMLElement[]): HTMLElement => {
  const r = el("div", { class: "g2u1x-row" }, ...nodes);
  r.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return r;
};

/** 무대 위 기록 글(왼쪽 위나 오른쪽 위에 얹는 줄들). */
export function g1Log(lab: G1Lab, cls = ""): { el: HTMLElement; add: (html: string) => void; set: (rows: string[]) => void } {
  const box = el("div", { class: `g2u1x-log ${cls}` });
  lab.f.stage.appendChild(box);
  return {
    el: box,
    add: (html) => void box.appendChild(el("div", { html })),
    set: (rows) => box.replaceChildren(...rows.map((html) => el("div", { html }))),
  };
}

export const fx = (v: number, d = 1): string => v.toFixed(d);
export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v));
/** 온도 표기(음수는 U+2212). */
export const deg = (t: number, d = 0): string => `${t < 0 ? "−" : ""}${Math.abs(t).toFixed(d)} ℃`;

/** 시드 고정 난수(mulberry32). 배치가 실행마다 같아 눈검수와 검사가 안정적이다. */
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

// ── 그림 조각(어두운 무대용) ─────────────────────────────────────────
export const P = {
  glass: "#A9C1DC",
  glassHi: "rgba(255,255,255,.5)",
  water: "#4DABF7",
  oil: "#F5C542",
  ethanol: "#B9A6FF",
  soy: "#6B3A1E",
  kno3: "#F4F7FB",
  cuso4: "#3B9BE8",
  metal: "#C9D2DC",
  metalEdge: "#8E9BAB",
  warm: "#FF922B",
  hot: "#F0705E",
  cold: "#74C0FC",
  rose: "#FF7EB0",
  green: "#7CF29C",
  yellow: "#FFD43B",
  text: "#DCE7F5",
  dim: "#8CA2C0",
  grid: "rgba(255,255,255,.12)",
} as const;

export const svgOpen = `<svg viewBox="0 0 ${SW} ${SH}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;

/** 비커. 왼쪽 위 (x, y), 폭 w, 높이 h. 액체는 class="<ns>-liq"(level 0~1). */
export function beaker(x: number, y: number, w: number, h: number, fill: string, ns: string, level = 0.8): string {
  const lh = h * level;
  return `<g>
    <rect class="${ns}-liq" x="${x + 3}" y="${y + h - lh}" width="${w - 6}" height="${lh - 3}" rx="5" fill="${fill}" opacity="0.45"/>
    <path d="M${x} ${y} v${h - 10} a10 10 0 0 0 10 10 h${w - 20} a10 10 0 0 0 10 -10 v${-(h - 10)}" stroke="${P.glass}" stroke-width="2.4"/>
    <path d="M${x - 5} ${y} h${w + 10}" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M${x + 7} ${y + 12} v${h - 32}" stroke="${P.glassHi}" stroke-width="2.6" stroke-linecap="round" opacity="0.45"/>
  </g>`;
}

/** 전자저울. 왼쪽 위 (x, y), 폭 w. 표시창 글자는 class="<ns>-read". 접시 윗면의 y는 y. */
export function scale(x: number, y: number, w: number, ns: string, read = "0.0 g"): string {
  return `<g>
    <ellipse cx="${x + w / 2}" cy="${y + 50}" rx="${w * 0.56}" ry="6" fill="#000" opacity="0.3"/>
    <rect x="${x}" y="${y}" width="${w}" height="12" rx="4" fill="#C8D2DE" stroke="#8B9BB0" stroke-width="1.4"/>
    <rect x="${x + 6}" y="${y + 12}" width="${w - 12}" height="36" rx="9" fill="#E3E9F1" stroke="#8B9BB0" stroke-width="1.6"/>
    <rect x="${x + w / 2 - 42}" y="${y + 18}" width="84" height="24" rx="5" fill="#101A2C"/>
    <text class="${ns}-read" x="${x + w / 2}" y="${y + 35.5}" text-anchor="middle" font-size="15" font-weight="800" fill="${P.green}" font-family="ui-monospace, Menlo, monospace">${read}</text>
  </g>`;
}

/** 시험관. 위 가운데 (cx, y), 폭 w, 높이 h. 액체는 class="<ns>-liq"(level 0~1). */
export function tube(cx: number, y: number, w: number, h: number, fill: string, ns: string, level = 0.6): string {
  const r = w / 2;
  const top = y + (h - r) * (1 - level);
  return `<g>
    <path class="${ns}-liq" d="M${cx - r + 2} ${top} h${w - 4} V${y + h - r} a${r - 2} ${r - 2} 0 0 1 ${-(w - 4)} 0 Z" fill="${fill}" opacity="0.75"/>
    <path d="M${cx - r} ${y} V${y + h - r} a${r} ${r} 0 0 0 ${w} 0 V${y}" stroke="${P.glass}" stroke-width="2.2"/>
    <path d="M${cx - r - 3} ${y} h${w + 6}" stroke="${P.glass}" stroke-width="2.2" stroke-linecap="round"/>
  </g>`;
}

/** 불꽃(알코올램프나 가열 장치 위). 바닥 가운데 (cx, y). class="<ns>-flame". */
export function flame(cx: number, y: number, ns: string, k = 1): string {
  return `<g class="${ns}-flame g2u1x-flame">
    <path d="M${cx} ${y - 30 * k} C ${cx + 13 * k} ${y - 16 * k} ${cx + 11 * k} ${y - 3} ${cx} ${y} C ${cx - 11 * k} ${y - 3} ${cx - 13 * k} ${y - 16 * k} ${cx} ${y - 30 * k} Z" fill="${P.warm}"/>
    <path d="M${cx} ${y - 17 * k} C ${cx + 6 * k} ${y - 9 * k} ${cx + 5 * k} ${y - 2} ${cx} ${y} C ${cx - 5 * k} ${y - 2} ${cx - 6 * k} ${y - 9 * k} ${cx} ${y - 17 * k} Z" fill="${P.yellow}"/>
  </g>`;
}

/** 가열 장치(납작한 판). 왼쪽 위 (x, y), 폭 w. */
export function heater(x: number, y: number, w: number): string {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="14" rx="5" fill="#59657A" stroke="#8B9BB0" stroke-width="1.4"/><rect x="${x + 8}" y="${y - 4}" width="${w - 16}" height="5" rx="2.5" fill="#39455A"/></g>`;
}

/** 그래프 축. 그림 영역 왼쪽 아래가 (x, y+h). 좌표 변환 px, py를 함께 돌려준다. */
export interface G1Plot {
  svg: string;
  px: (v: number) => number;
  py: (v: number) => number;
}
export function plot(o: { x: number; y: number; w: number; h: number; x0: number; x1: number; y0: number; y1: number; xl: string; yl: string; xt?: number[]; yt?: number[]; yFmt?: (v: number) => string }): G1Plot {
  const px = (v: number): number => o.x + ((v - o.x0) / (o.x1 - o.x0)) * o.w;
  const py = (v: number): number => o.y + o.h - ((v - o.y0) / (o.y1 - o.y0)) * o.h;
  const yf = o.yFmt ?? ((v: number) => String(v));
  let s = `<g font-size="12" font-weight="700" fill="${P.dim}">`;
  (o.yt ?? []).forEach((v) => {
    s += `<path d="M${o.x} ${py(v).toFixed(1)} h${o.w}" stroke="${P.grid}" stroke-width="1" fill="none"/><text x="${o.x - 5}" y="${(py(v) + 4).toFixed(1)}" text-anchor="end">${yf(v)}</text>`;
  });
  (o.xt ?? []).forEach((v) => {
    s += `<path d="M${px(v).toFixed(1)} ${o.y} v${o.h}" stroke="${P.grid}" stroke-width="1" fill="none"/><text x="${px(v).toFixed(1)}" y="${o.y + o.h + 14}" text-anchor="middle">${v}</text>`;
  });
  s += `<path d="M${o.x} ${o.y} v${o.h} h${o.w}" stroke="${P.glass}" stroke-width="1.6" fill="none"/>`;
  s += `<text x="${o.x + o.w}" y="${o.y + o.h + (o.xt?.length ? 27 : 15)}" text-anchor="end" fill="${P.text}">${o.xl}</text>`;
  s += `<text x="${o.x - 2}" y="${o.y - 7}" text-anchor="start" fill="${P.text}">${o.yl}</text></g>`;
  return { svg: s, px, py };
}

/** 점 목록을 polyline의 points 글로. */
export const ptsOf = (pts: Array<[number, number]>): string => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** 보글보글 기포를 묶음 요소에 n개 그린다(자리는 시드 난수). 영역은 (x, y, w, h). */
export function bubbles(g: Element, n: number, x: number, y: number, w: number, h: number, rnd: () => number): void {
  let s = "";
  for (let i = 0; i < n; i++) {
    const r = 1.6 + rnd() * 2.4;
    s += `<circle class="g2u1x-bub" cx="${(x + rnd() * w).toFixed(1)}" cy="${(y + rnd() * h).toFixed(1)}" r="${r.toFixed(1)}" stroke="#EAF4FF" stroke-width="1" fill="rgba(255,255,255,.18)" style="animation-delay:${(-rnd() * 1.4).toFixed(2)}s"/>`;
  }
  g.innerHTML = s;
}

/** 가열 곡선을 꾹 누르는 동안 그려 가는 버튼. 시간 t(0~tMax)가 차는 동안 f(t)의 점을 이어 붙인다. 다 차면 onEnd. */
export function g1Curve(lab: G1Lab, pl: G1Plot, layer: Element, o: { tMax: number; ms: number; f: (t: number) => number; color: string; text?: string; onTick?: (t: number, v: number) => void; onEnd: () => void }): HTMLButtonElement {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  line.setAttribute("stroke", o.color);
  line.setAttribute("stroke-width", "2.4");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("fill", "none");
  layer.appendChild(line);
  let t = 0;
  const pts: Array<[number, number]> = [[pl.px(0), pl.py(o.f(0))]];
  const b = g1Hold(lab, o.text ?? "꾹 눌러 가열하기", (ms) => {
    t = Math.min(o.tMax, t + (ms / o.ms) * o.tMax);
    const v = o.f(t);
    pts.push([pl.px(t), pl.py(v)]);
    line.setAttribute("points", ptsOf(pts));
    o.onTick?.(t, v);
    if (t >= o.tMax) {
      b.disabled = true;
      o.onEnd();
      return false;
    }
    return true;
  });
  return b;
}

/** 온도계(막대형). 아래 끝 가운데 (cx, y1), 위 끝 y0. 눈금 범위 t0~t1. 빨간 기둥은 class="<ns>-col", 읽는 값은 class="<ns>-tv". */
export function thermo(cx: number, y0: number, y1: number, ns: string): string {
  return `<g>
    <rect x="${cx - 5}" y="${y0}" width="10" height="${y1 - y0}" rx="5" fill="rgba(255,255,255,.14)" stroke="${P.glass}" stroke-width="1.4"/>
    <rect class="${ns}-col" x="${cx - 2.5}" y="${y1 - 8}" width="5" height="8" rx="2.5" fill="${P.hot}"/>
    <circle cx="${cx}" cy="${y1 + 3}" r="7" fill="${P.hot}" stroke="${P.glass}" stroke-width="1.4"/>
  </g>`;
}
/** 온도계 기둥의 높이를 0~1로 맞춘다. */
export function thermoSet(col: Element, y0: number, y1: number, k: number): void {
  const h = 8 + (y1 - y0 - 12) * clamp(k);
  col.setAttribute("y", (y1 - h).toFixed(1));
  col.setAttribute("height", h.toFixed(1));
}
