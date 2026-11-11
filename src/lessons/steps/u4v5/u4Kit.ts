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

/** 비커. 왼쪽 위 (x, y), 폭 w, 높이 h. 액체는 class="<ns>-liq". */
export function beaker(x: number, y: number, w: number, h: number, fill: string, ns: string, level = 0.8): string {
  const lh = h * level;
  return `<g>
    <rect class="${ns}-liq" x="${x + 3}" y="${y + h - lh}" width="${w - 6}" height="${lh - 3}" rx="5" fill="${fill}" opacity="0.42"/>
    <path d="M${x} ${y} v${h - 10} a10 10 0 0 0 10 10 h${w - 20} a10 10 0 0 0 10 -10 v${-(h - 10)}" stroke="${A.glass}" stroke-width="2.6"/>
    <path d="M${x - 6} ${y} h${w + 12}" stroke="${A.glass}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M${x + 8} ${y + 14} v${h - 36}" stroke="${A.glassHi}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  </g>`;
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

/** 삼각 플라스크. 바닥 가운데 (cx, baseY), 높이 h. 액체는 class="<ns>-liq". */
export function flask(cx: number, baseY: number, h: number, ns: string, fill: string, level = 0.3): string {
  const bw = h * 0.62;
  const nw = h * 0.16;
  const ny = baseY - h;
  const sh = baseY - h * 0.55;
  const liqTop = baseY - h * 0.5 * level - 4;
  const t = (baseY - liqTop) / (baseY - sh);
  const lw = bw + (nw - bw) * Math.min(1, t);
  return `<g>
    <path class="${ns}-liq" d="M${cx - lw + 3} ${liqTop} h${(lw - 3) * 2} L${cx + bw - 3} ${baseY - 3} h${-(bw - 3) * 2} Z" fill="${fill}" opacity="0.6"/>
    <path d="M${cx - nw} ${ny} v${h * 0.45} L${cx - bw} ${baseY - 8} a8 8 0 0 0 8 8 h${(bw - 8) * 2} a8 8 0 0 0 8 -8 L${cx + nw} ${ny + h * 0.45} v${-h * 0.45}" stroke="${A.glass}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M${cx - nw - 4} ${ny} h${nw * 2 + 8}" stroke="${A.glass}" stroke-width="2.6" stroke-linecap="round"/>
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
