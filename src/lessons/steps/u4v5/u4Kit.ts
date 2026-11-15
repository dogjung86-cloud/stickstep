// 중1 Ⅳ v5 랩의 공용 도구(2026-11-12). 뼈대는 Ⅱ단원의 bvFrame을 그대로 쓰고, 이 단원에 필요한 것만 얹는다.
//   u4Lab      뼈대 + 타이머 + 정리(cleanup) 묶음 + 끝맺음(결론, 끝 버튼, 궁금증 카드)
//   u4Hold     꾹 누르는 동안만 일이 진행되는 버튼(손을 떼면 멈춘다. 키보드는 누를 때마다 조금씩)
//   u4Matter   단원의 메타볼 무대(ui/matterStage)를 뼈대의 무대 칸에 올린다(물리 수치는 건드리지 않는다)
//   u4ViewBtn  '입자의 눈' 전환 버튼(조작 칸에 놓는 50px 버튼. 무대 구석의 작은 칩 대신 쓴다)
//   그림 조각  비커, 전자저울, 삼각 플라스크, 입자 창(어두운 무대용 SVG 조각. 좌표는 계산으로 맞춘다)
// 무대 좌표는 346×230(폰 390 화면의 무대 크기)이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { createLoop } from "../../../core/anim";
import { icon } from "../../../core/icons";
import { curioCard, type Curio } from "../../../ui/curio";
import { createMatterStage, type MatterStage, type MatterStageOpts } from "../../../ui/matterStage";
import type { StepAPI } from "../../types";
import { bvBtn, bvFrame, bvTimers, type BvFrame, type BvTimers } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;

export interface U4Step {
  title: string;
  cta?: string;
  curio?: Curio;
}

export interface U4Lab {
  f: BvFrame;
  tm: BvTimers;
  api: StepAPI;
  onCleanup: (fn: () => void) => void;
  cleanup: () => void;
  /** 랩의 끝: 진행 점을 다 켜고, 결론 한 문장을 조작 칸에 띄우고, 끝 버튼을 연다. */
  finish: (html: string) => void;
  finished: () => boolean;
}

export function u4Lab(host: HTMLElement, api: StepAPI, s: U4Step, o: { steps: number; cls: string }): U4Lab {
  host.classList.add("u4x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `u4x-stage ${o.cls}`, qCls: "u4x-q", api });
  const tm = bvTimers();
  const fns: Array<() => void> = [];
  let done = false;
  return {
    f,
    tm,
    api,
    onCleanup: (fn) => fns.push(fn),
    cleanup: () => {
      tm.clear();
      fns.splice(0).forEach((fn) => fn());
    },
    finish(html) {
      if (done) return;
      done = true;
      f.pips(o.steps);
      f.slot.conclude(html);
      haptic(HAPTIC.ctaUnlock);
      api.enableCTA(s.cta ?? "다음");
      if (s.curio) host.appendChild(curioCard(s.curio));
    },
    finished: () => done,
  };
}

/** 예측 질문(정오를 매기지 않는다). 고른 보기의 글을 next에 넘긴다. 답은 뒤의 실험이 보여 준다. */
export function u4Predict(lab: U4Lab, question: string, choices: string[], next: (picked: string) => void, delay = 600): void {
  let picked = "";
  const grab = (e: Event): void => {
    const b = (e.target as HTMLElement).closest(".bv-choice");
    if (b && !picked) picked = b.textContent?.trim() ?? "";
  };
  lab.f.slot.qBox.addEventListener("click", grab, true);
  lab.api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
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
export function u4Hold(lab: U4Lab, text: string, onTick: (ms: number) => boolean | void, onState?: (on: boolean) => void): HTMLButtonElement {
  const b = bvBtn("main u4x-hold", text);
  let holding = false;
  let raf = 0;
  let last = 0;
  const stop = (): void => {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    b.classList.remove("on");
    onState?.(false);
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
    onState?.(true);
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

export interface U4Matter {
  ms: MatterStage;
  /** 무대 왼쪽 위 알약(상태 이름 등) */
  pill: HTMLElement;
  /** 무대 오른쪽 위 읽을거리(온도 등) */
  read: HTMLElement;
}

/** 메타볼 무대를 뼈대의 무대 칸에 올리고 그리기 루프를 돌린다. onFrame은 시뮬레이션 한 걸음 앞에 불린다. */
export function u4Matter(lab: U4Lab, opts: Omit<MatterStageOpts, "height" | "toggle"> & { box?: HTMLElement; onFrame?: (dt: number, tMs: number) => void; onReady?: () => void }): U4Matter {
  const ms = createMatterStage({ ...opts, height: "100%", toggle: false });
  const pill = el("div", { class: "pill" });
  const read = el("div", { class: "tempread" });
  ms.hud.append(pill, read);
  (opts.box ?? lab.f.stage).appendChild(ms.el);
  const loop = createLoop((dt, tMs) => {
    opts.onFrame?.(dt, tMs);
    ms.tick(dt, tMs);
  });
  const onResize = (): void => ms.resize();
  window.addEventListener("resize", onResize);
  const raf = requestAnimationFrame(() => {
    ms.resize();
    ms.sim.buildLattice(true);
    opts.onReady?.();
    loop.start();
  });
  lab.onCleanup(() => {
    cancelAnimationFrame(raf);
    loop.stop();
    window.removeEventListener("resize", onResize);
    ms.dispose();
  });
  return { ms, pill, read };
}

/** '입자의 눈' 전환 버튼. 누를 때마다 물질 모습과 입자 모습을 오간다. onUse는 처음 입자의 눈을 켰을 때 한 번. */
export function u4ViewBtn(m: U4Matter, onUse?: () => void): HTMLButtonElement {
  const b = bvBtn("u4x-view", "");
  let used = false;
  const paint = (): void => {
    const p = m.ms.view() === "particle";
    b.innerHTML = `<span class="u4x-view-ic">${icon("microscope", 18)}</span><span>${p ? "물질 모습으로 보기" : "입자의 눈으로 보기"}</span>`;
    b.classList.toggle("on", p);
    b.setAttribute("aria-pressed", String(p));
  };
  b.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    m.ms.setView(m.ms.view() === "matter" ? "particle" : "matter");
    paint();
    if (!used && m.ms.view() === "particle") {
      used = true;
      onUse?.();
    }
  });
  if (!m.ms.metaOk) b.hidden = true; // 메타볼을 못 쓰는 기기는 늘 입자 모습이라 버튼이 필요 없다
  paint();
  return b;
}

/** 온도 표기(음수는 U+2212). */
export const deg = (t: number): string => {
  const r = Math.round(t);
  return `${r < 0 ? "−" + Math.abs(r) : r}℃`;
};

// ── 그림 조각(어두운 무대용) ─────────────────────────────────────────
export const A = {
  glass: "#A9C1DC",
  glassHi: "rgba(255,255,255,.5)",
  water: "#4DABF7",
  ink: "#6C8CFF",
  yellow: "#FFD43B",
  btb: "#4DABF7",
  part: "#9B8CFF",
  partEdge: "#E9E4FF",
  oil: "#F5B301",
  oilFrozen: "#FFF1B8",
  warm: "#FF922B",
  hot: "#F0705E",
  cold: "#74C0FC",
  text: "#DCE7F5",
  dim: "#8CA2C0",
} as const;

export interface Pt {
  x: number;
  y: number;
}

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

export function grid(cols: number, rows: number, cx: number, cy: number, gap: number): Pt[] {
  const pts: Pt[] = [];
  const x0 = cx - ((cols - 1) * gap) / 2;
  const y0 = cy - ((rows - 1) * gap) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: x0 + c * gap, y: y0 + r * gap });
  return pts;
}

/** 액체의 입자 자리: 서로 가깝지만 가지런하지 않게(줄마다 반 칸 어긋나고 조금씩 흩어진다). 바닥 가운데가 (cx, baseY). */
export function loose(cols: number, rows: number, cx: number, baseY: number, gap: number, rnd: () => number): Pt[] {
  const pts: Pt[] = [];
  for (let r = 0; r < rows; r++) {
    const n = cols - (r % 2);
    const x0 = cx - ((n - 1) * gap) / 2;
    for (let c = 0; c < n; c++) pts.push({ x: x0 + c * gap + (rnd() - 0.5) * gap * 0.34, y: baseY - r * gap * 0.9 + (rnd() - 0.5) * gap * 0.3 });
  }
  return pts;
}

// ── 유리 기구(어두운 무대용, 2026-11-15 다시 그림) ─────────────────────
// 파운드리 재질 문법의 SVG판(ui/labProps.ts의 캔버스 유리와 같은 색): ① 벽은 위 밝고 가운데 가라앉고 아래 되살아나는 세로 그라데이션
// ② 몸통은 양끝이 조금 밝은 옅은 가로 그라데이션 ③ 안쪽 벽 선으로 유리 두께, 두꺼운 바닥 띠, 입구 테 ④ 왼쪽 위 빛의 반사 줄.
// 유리는 옅게 둔다. 무대의 요점(잉크, 물방울, 막, 테이프)이 유리보다 진해야 한다.
// 그라데이션 id는 부를 때마다 새로 붙인다(한 무대에 기구가 여럿이어도, 같은 랩이 두 번 그려져도 겹치지 않게).
let glassN = 0;
const glassId = (ns: string): string => `${ns}-gl${++glassN}`;

/** 벽(세로), 몸통(가로), 반사 줄(세로 페이드) 그라데이션. */
function glassDefs(id: string, x0: number, x1: number, y0: number, y1: number): string {
  return `<defs>
    <linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"><stop offset="0" stop-color="#E4F0FF" stop-opacity=".95"/><stop offset=".45" stop-color="#94B4DE" stop-opacity=".58"/><stop offset="1" stop-color="#C2DBF8" stop-opacity=".86"/></linearGradient>
    <linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0"><stop offset="0" stop-color="#CFE3FF" stop-opacity=".17"/><stop offset=".16" stop-color="#CFE3FF" stop-opacity=".05"/><stop offset=".55" stop-color="#CFE3FF" stop-opacity=".02"/><stop offset=".86" stop-color="#CFE3FF" stop-opacity=".07"/><stop offset="1" stop-color="#CFE3FF" stop-opacity=".15"/></linearGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".7" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>`;
}

/** 비커 안쪽(액체가 차는 곳)의 윤곽. 위는 평평하고 아래 두 모서리가 둥글다. 액체와 자르기(clipPath)에 같이 쓴다. */
export function beakerLiquidD(x: number, y: number, w: number, h: number, level: number): string {
  const r = 7;
  const x0 = x + 2.6;
  const x1 = x + w - 2.6;
  const yb = y + h - 5.2; // 두꺼운 바닥 위
  const ly = Math.min(yb - 2, y + h - h * level);
  return `M${x0} ${ly.toFixed(1)} V${yb - r} A${r} ${r} 0 0 0 ${x0 + r} ${yb} H${x1 - r} A${r} ${r} 0 0 0 ${x1} ${yb - r} V${ly.toFixed(1)} Z`;
}

/** 비커. 왼쪽 위 (x, y), 폭 w, 높이 h. 액체는 class="<ns>-liq"(level이 0이면 그리지 않는다), 수면 줄은 class="<ns>-liqs". */
export function beaker(x: number, y: number, w: number, h: number, fill: string, ns: string, level = 0.8): string {
  const id = glassId(ns);
  const r = 10;
  const yb = y + h;
  const ly = y + h - h * level;
  const body = `M${x} ${y} V${yb - r} A${r} ${r} 0 0 0 ${x + r} ${yb} H${x + w - r} A${r} ${r} 0 0 0 ${x + w} ${yb - r} V${y}`;
  const ti = 2.4; // 유리 두께
  const inner = `M${x + ti} ${y + 4} V${yb - r} A${r - ti} ${r - ti} 0 0 0 ${x + r} ${yb - ti} H${x + w - r} A${r - ti} ${r - ti} 0 0 0 ${x + w - ti} ${yb - r} V${y + 4}`;
  // 눈금: 오른쪽 벽 안쪽에 짧고 긴 줄을 번갈아(숫자는 쓰지 않는다)
  const ticks = [1, 2, 3, 4]
    .map((k) => {
      const ty = yb - 8 - (k * (h - 26)) / 5;
      const len = k % 2 === 0 ? 15 : 9;
      return `<path d="M${x + w - ti - 2 - len} ${ty.toFixed(1)} H${x + w - ti - 2}" stroke="#D6E6FA" stroke-opacity=".62" stroke-width="1.3" stroke-linecap="round"/>`;
    })
    .join("");
  const liquid =
    level > 0
      ? `<path class="${ns}-liq" d="${beakerLiquidD(x, y, w, h, level)}" fill="${fill}" opacity="0.46"/>
    <path class="${ns}-liqs" d="M${x + 4} ${ly.toFixed(1)} H${x + w - 4}" stroke="#EAF4FF" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>`
      : "";
  return `<g>
    ${glassDefs(id, x, x + w, y, yb)}
    <path d="${body} Z" fill="url(#${id}f)"/>
    ${liquid}
    <path d="${inner}" stroke="#fff" stroke-opacity=".17" stroke-width="1"/>
    <path d="M${x + r * 0.7} ${yb - 2.6} H${x + w - r * 0.7}" stroke="#BED8F8" stroke-opacity=".34" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M${x + r} ${yb - 5.4} H${x + w - r}" stroke="#fff" stroke-opacity=".16" stroke-width="1"/>
    ${ticks}
    <path d="${body}" stroke="url(#${id}w)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M${x - 3} ${y} H${x + w + 3}" stroke="#E6F1FF" stroke-opacity=".95" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${x - 2.6} ${y + 0.6} q-5 -0.6 -7.2 -4.2" stroke="#E6F1FF" stroke-opacity=".9" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="${x + 5.4}" y="${y + 9}" width="3.4" height="${(h - 32).toFixed(1)}" rx="1.7" fill="url(#${id}s)"/>
    <path d="M${x + 11.5} ${y + 14} V${y + h * 0.42}" stroke="#fff" stroke-opacity=".2" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M${x + w - 4} ${y + 16} V${y + h * 0.55}" stroke="#fff" stroke-opacity=".14" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

/** 위가 넓은 유리컵(앞뒤 두 겹). 입구 가운데 (cx, topY), 바닥 높이 botY, 입구 반폭 topHalf, 바닥 반폭 botHalf.
 *  back은 내용물 앞에, front는 내용물 뒤에 놓는다(유리 너머로 얼음과 물이 보이게). */
export function cup(cx: number, topY: number, botY: number, topHalf: number, botHalf: number, ns: string): { back: string; front: string } {
  const id = glassId(ns);
  const r = 8;
  const L = cx - topHalf;
  const R = cx + topHalf;
  const bl = cx - botHalf;
  const br = cx + botHalf;
  // 옆벽은 곧은 비탈, 바닥 두 모서리는 둥글게
  const k = (topHalf - botHalf) / (botY - topY); // 아래로 1 내려갈 때 안으로 들어오는 양
  const body = `M${L} ${topY} L${bl + k * r} ${botY - r} Q${bl} ${botY} ${bl + r} ${botY} H${br - r} Q${br} ${botY} ${br - k * r} ${botY - r} L${R} ${topY}`;
  const ti = 2.4;
  const inner = `M${L + ti + 0.5} ${topY + 4} L${bl + ti + k * r} ${botY - r} Q${bl + ti} ${botY - ti} ${bl + r} ${botY - ti} H${br - r} Q${br - ti} ${botY - ti} ${br - ti - k * r} ${botY - r} L${R - ti - 0.5} ${topY + 4}`;
  const back = `<g>${glassDefs(id, L, R, topY, botY)}<path d="${body} Z" fill="url(#${id}f)"/></g>`;
  const front = `<g>
    <path d="${inner}" stroke="#fff" stroke-opacity=".17" stroke-width="1"/>
    <path d="M${bl + r * 0.6} ${botY - 2.6} H${br - r * 0.6}" stroke="#BED8F8" stroke-opacity=".34" stroke-width="4.2" stroke-linecap="round"/>
    <path d="${body}" stroke="url(#${id}w)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M${L - 3} ${topY} H${R + 3}" stroke="#E6F1FF" stroke-opacity=".95" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${L + 7} ${topY + 10} L${bl + 6 + k * 12} ${botY - 14}" stroke="url(#${id}s)" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${R - 5} ${topY + 14} L${br - 4 - k * 30} ${botY - 30}" stroke="#fff" stroke-opacity=".13" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
  return { back, front };
}

/** 가늘고 긴 유리병(앞뒤 두 겹). 몸통 왼쪽 위 (x, y), 폭 w, 몸통 높이 h(목은 몸통 위로 neck만큼). 뚜껑과 내용물은 부르는 쪽이 그린다.
 *  눈금(ticks)을 주면 오른쪽 벽 안쪽에 그 수만큼 짧은 줄을 긋는다. */
export function bottle(x: number, y: number, w: number, h: number, ns: string, o: { neck?: number; neckW?: number; ticks?: number } = {}): { back: string; front: string } {
  const id = glassId(ns);
  const neck = o.neck ?? 12;
  const nw = Math.min(w - 8, o.neckW ?? w * 0.62);
  const nx = x + (w - nw) / 2;
  const r = Math.min(8, w * 0.25);
  const sh = Math.min(10, w * 0.3); // 어깨 높이
  const yb = y + h;
  const body = `M${nx} ${y - neck} V${y} Q${nx} ${y + sh * 0.2} ${x} ${y + sh} V${yb - r} Q${x} ${yb} ${x + r} ${yb} H${x + w - r} Q${x + w} ${yb} ${x + w} ${yb - r} V${y + sh} Q${nx + nw} ${y + sh * 0.2} ${nx + nw} ${y} V${y - neck}`;
  const ti = 2.2;
  const ticks = Array.from({ length: o.ticks ?? 0 }, (_, i) => {
    const ty = yb - 10 - ((i + 1) * (h - sh - 18)) / ((o.ticks ?? 0) + 1);
    const len = i % 2 === 1 ? 10 : 6;
    return `<path d="M${x + w - ti - 1.5 - len} ${ty.toFixed(1)} H${x + w - ti - 1.5}" stroke="#D6E6FA" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round"/>`;
  }).join("");
  const back = `<g>${glassDefs(id, x, x + w, y - neck, yb)}<path d="${body} Z" fill="url(#${id}f)"/></g>`;
  const front = `<g>
    <path d="M${x + ti} ${y + sh + 2} V${yb - r} Q${x + ti} ${yb - ti} ${x + r} ${yb - ti} H${x + w - r} Q${x + w - ti} ${yb - ti} ${x + w - ti} ${yb - r} V${y + sh + 2}" stroke="#fff" stroke-opacity=".17" stroke-width="1"/>
    <path d="M${x + r * 0.7} ${yb - 2.4} H${x + w - r * 0.7}" stroke="#BED8F8" stroke-opacity=".34" stroke-width="4" stroke-linecap="round"/>
    ${ticks}
    <path d="${body}" stroke="url(#${id}w)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M${nx - 2} ${y - neck} H${nx + nw + 2}" stroke="#E6F1FF" stroke-opacity=".95" stroke-width="3" stroke-linecap="round"/>
    <rect x="${x + 4.4}" y="${y + sh + 4}" width="3" height="${Math.max(8, h - sh - 24).toFixed(1)}" rx="1.5" fill="url(#${id}s)"/>
    <path d="M${x + w - 3.6} ${y + sh + 8} V${y + h * 0.5}" stroke="#fff" stroke-opacity=".13" stroke-width="1.3" stroke-linecap="round"/>
  </g>`;
  return { back, front };
}

/** 전자저울. 왼쪽 위 (x, y), 폭 w. 표시창 글자는 class="<ns>-read". */
export function scale(x: number, y: number, w: number, ns: string, read = "0.00 g"): string {
  return `<g>
    <ellipse cx="${x + w / 2}" cy="${y + 50}" rx="${w * 0.56}" ry="6" fill="#000" opacity="0.3"/>
    <rect x="${x}" y="${y}" width="${w}" height="12" rx="4" fill="#C8D2DE" stroke="#8B9BB0" stroke-width="1.4"/>
    <rect x="${x + 6}" y="${y + 12}" width="${w - 12}" height="36" rx="9" fill="#E3E9F1" stroke="#8B9BB0" stroke-width="1.6"/>
    <rect x="${x + w / 2 - 40}" y="${y + 18}" width="80" height="24" rx="5" fill="#101A2C"/>
    <text class="${ns}-read" x="${x + w / 2}" y="${y + 35.5}" text-anchor="middle" font-size="15" font-weight="800" fill="#7CF29C" font-family="ui-monospace, Menlo, monospace">${read}</text>
  </g>`;
}

/** 삼각 플라스크. 바닥 가운데 (cx, baseY), 높이 h. 액체는 class="<ns>-liq"(액체와 수면 줄을 묶은 g. 투명도는 이 g에 준다). */
export function flask(cx: number, baseY: number, h: number, ns: string, fill: string, level = 0.3): string {
  const id = glassId(ns);
  const bw = h * 0.62;
  const nw = h * 0.16;
  const ny = baseY - h;
  const shY = ny + h * 0.45; // 목이 끝나고 어깨가 시작하는 높이
  const r = 8;
  const slope = (bw - nw) / (baseY - r - shY); // 아래로 1 내려갈 때 밖으로 나가는 양
  const body = `M${cx - nw} ${ny} V${shY} L${cx - bw} ${baseY - r} Q${cx - bw - 0.6} ${baseY} ${cx - bw + r} ${baseY} H${cx + bw - r} Q${cx + bw + 0.6} ${baseY} ${cx + bw} ${baseY - r} L${cx + nw} ${shY} V${ny}`;
  const ti = 2.4;
  const inner = `M${cx - nw + ti} ${ny + 4} V${shY + 1} L${cx - bw + ti + 0.6} ${baseY - r} Q${cx - bw + ti} ${baseY - ti} ${cx - bw + r + 1} ${baseY - ti} H${cx + bw - r - 1} Q${cx + bw - ti} ${baseY - ti} ${cx + bw - ti - 0.6} ${baseY - r} L${cx + nw - ti} ${shY + 1} V${ny + 4}`;
  // 액체: 바닥 띠 위에서 level만큼(원뿔 몸통 높이 기준). 수면 폭은 그 높이의 벽 사이
  const yb = baseY - 4.6;
  const liqTop = baseY - (baseY - r - shY) * level - 4;
  const half = (yy: number): number => (yy >= shY ? nw + (yy - shY) * slope : nw) - ti - 0.4;
  const lw = half(liqTop);
  const bwIn = half(baseY - r);
  const liq = `M${cx - lw} ${liqTop.toFixed(1)} H${cx + lw} L${cx + bwIn} ${baseY - r} Q${cx + bwIn} ${yb} ${cx + bwIn - 6} ${yb} H${cx - bwIn + 6} Q${cx - bwIn} ${yb} ${cx - bwIn} ${baseY - r} Z`;
  // 눈금: 원뿔 오른쪽 벽 안쪽에 셋
  const ticks = [0.3, 0.5, 0.7]
    .map((f, i) => {
      const ty = baseY - r - (baseY - r - shY) * f;
      const xr = cx + half(ty) - 1.2;
      return `<path d="M${(xr - (i === 1 ? 12 : 7)).toFixed(1)} ${ty.toFixed(1)} H${xr.toFixed(1)}" stroke="#D6E6FA" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round"/>`;
    })
    .join("");
  return `<g>
    ${glassDefs(id, cx - bw, cx + bw, ny, baseY)}
    <path d="${body} Z" fill="url(#${id}f)"/>
    <g class="${ns}-liq" opacity="0.6">
      <path d="${liq}" fill="${fill}"/>
      <path d="M${(cx - lw + 1.5).toFixed(1)} ${liqTop.toFixed(1)} H${(cx + lw - 1.5).toFixed(1)}" stroke="#F2F8FF" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>
    </g>
    <path d="${inner}" stroke="#fff" stroke-opacity=".17" stroke-width="1"/>
    <path d="M${cx - bw + r * 0.8} ${baseY - 2.6} H${cx + bw - r * 0.8}" stroke="#BED8F8" stroke-opacity=".34" stroke-width="4.2" stroke-linecap="round"/>
    ${ticks}
    <path d="${body}" stroke="url(#${id}w)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M${cx - nw - 3} ${ny} H${cx + nw + 3}" stroke="#E6F1FF" stroke-opacity=".95" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${cx - nw + 4.2} ${ny + 6} V${shY - 2}" stroke="#fff" stroke-opacity=".34" stroke-width="2" stroke-linecap="round"/>
    <path d="M${cx - nw + 2} ${shY + 7} L${cx - bw + 9} ${baseY - 13}" stroke="url(#${id}s)" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

/** 입자 창: 무대 오른쪽의 둥근 창. 제목 "입자의 눈"과 입자들(class="<ns>-p")을 담는다. */
export function partWin(x: number, y: number, w: number, h: number, pts: Pt[], ns: string, r = 5.5): string {
  return `<g class="${ns}-win">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="rgba(124,107,255,.10)" stroke="rgba(155,140,255,.5)" stroke-width="1.6"/>
    <text x="${x + w / 2}" y="${y + 19}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9BEFF">입자의 눈</text>
    ${pts.map((p, i) => `<circle class="${ns}-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${A.part}" stroke="${A.partEdge}" stroke-width="1.2"/>`).join("")}
  </g>`;
}

export const svgOpen = `<svg viewBox="0 0 ${SW} ${SH}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
