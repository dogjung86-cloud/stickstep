// matterStage — 물질 단원(IV) 공용 무대 조립기.
// 하나의 MatterSim을 두 렌더러(메타볼·발광점)가 공유한다:
//   · 물질 뷰(기본) = WebGL 메타볼 — 얼음 덩어리·물방울·수증기 안개처럼 "물질"로 보인다.
//   · 입자의 눈 뷰 = Canvas 2D 발광점 — 성취기준의 "입자 모형"이 또렷이 보인다.
// 토글 시 두 캔버스를 크로스페이드. WebGL 실패·유실 시 자동으로 입자 뷰로 폴백.
// 렌더 루프는 스텝이 소유한다(createLoop) — stage.tick(dt)를 매 프레임 불러 줄 것.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { MatterSim, type MatterSimOpts } from "../engine/matterSim";
import { MetaRenderer } from "../renderers/meta";
import { DotRenderer } from "../renderers/dot";
import { icon } from "../core/icons";

export type MatterView = "matter" | "particle";

export interface MatterStageOpts {
  /** 캔버스 CSS 높이 — "260px" | "min(300px,36dvh)" 등 */
  height: string;
  sim?: Partial<MatterSimOpts>;
  /** 시작 뷰(기본 matter) */
  view?: MatterView;
  /** 뷰 토글 칩 표시 여부(기본 true) */
  toggle?: boolean;
  /** 무대 좌하단 캡션 */
  cap?: string;
  /** 매 프레임 오버레이(그릇 벽·라벨·이펙트). ctx는 DPR 보정된 2D. */
  overlay?: (ctx: CanvasRenderingContext2D, w: number, h: number, sim: MatterSim, tMs: number) => void;
  /** 뷰가 바뀔 때(토글 튜토리얼 목표 등에 사용) */
  onViewChange?: (v: MatterView) => void;
}

export interface MatterStage {
  el: HTMLElement;
  hud: HTMLElement;
  sim: MatterSim;
  /** WebGL 메타볼 사용 가능 여부(false면 항상 입자 뷰) */
  readonly metaOk: boolean;
  view(): MatterView;
  setView(v: MatterView): void;
  setTemp(T: number): void;
  toast(msg: string): void;
  tick(dt: number, tMs: number): void;
  resize(): void;
  dispose(): void;
}

const FADE_MS = 460;

export function createMatterStage(opts: MatterStageOpts): MatterStage {
  const wantToggle = opts.toggle ?? true;

  // ---- DOM ----
  const metaCv = el("canvas", { class: "mstage-cv" });
  const dotCv = el("canvas", { class: "mstage-cv" });
  const overlayCv = el("canvas", { class: "mstage-cv mstage-overlay" });
  const box = el("div", { class: "mstage-box", style: `height:${opts.height}` }, metaCv, dotCv, overlayCv);
  const hud = el("div", { class: "stage-hud" });
  const toastEl = el("div", { class: "toast" });
  const stage = el("div", { class: "stage mstage" }, box, hud, toastEl);
  if (opts.cap) stage.appendChild(el("div", { class: "stage-cap", text: opts.cap }));

  // ---- 시뮬 + 렌더러 ----
  const sim = new MatterSim(320, 240, opts.sim);
  const meta = new MetaRenderer(metaCv);
  const dot = new DotRenderer(dotCv);
  const overlayCtx = overlayCv.getContext("2d")!;
  let overlayDpr = 1;
  let w = 320;
  let h = 240;

  let view: MatterView = meta.ok ? (opts.view ?? "matter") : "particle";
  let fadeUntil = 0;

  function applyViewClass(): void {
    metaCv.style.opacity = view === "matter" && meta.ok ? "1" : "0";
    dotCv.style.opacity = view === "particle" || !meta.ok ? "1" : "0";
  }

  // ---- 뷰 토글 칩 ----
  const toggleLabel = el("span", { text: "입자의 눈" });
  const toggleBtn = el(
    "button",
    { class: "mstage-toggle", attrs: { "aria-pressed": "false", "aria-label": "입자의 눈으로 보기" } },
    el("span", { class: "mt-ic", html: icon("microscope", 15) }),
    toggleLabel,
  );
  function syncToggle(): void {
    const particle = view === "particle";
    toggleLabel.textContent = particle ? "물질 보기" : "입자의 눈";
    toggleBtn.setAttribute("aria-pressed", String(particle));
    toggleBtn.setAttribute("aria-label", particle ? "물질 모습으로 보기" : "입자의 눈으로 보기");
    toggleBtn.classList.toggle("on", particle);
  }
  toggleBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    setView(view === "matter" ? "particle" : "matter");
  });
  if (wantToggle && meta.ok) {
    stage.appendChild(toggleBtn);
    syncToggle();
  }

  function setView(v: MatterView): void {
    if (!meta.ok) v = "particle";
    if (v === view) return;
    view = v;
    fadeUntil = performance.now() + FADE_MS;
    applyViewClass();
    syncToggle();
    opts.onViewChange?.(view);
  }

  // WebGL 컨텍스트 유실 → 입자 뷰로 우아하게 전환, 토글 숨김
  meta.onContextLost = () => {
    view = "particle";
    applyViewClass();
    toggleBtn.remove();
  };

  // ---- 토스트 ----
  let toastTimer = 0;
  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  // ---- 크기 ----
  function resize(): void {
    const rect = box.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    meta.resize();
    dot.resize();
    overlayDpr = Math.min(window.devicePixelRatio || 1, 2);
    overlayCv.width = Math.max(1, Math.round(w * overlayDpr));
    overlayCv.height = Math.max(1, Math.round(h * overlayDpr));
    overlayCtx.setTransform(overlayDpr, 0, 0, overlayDpr, 0, 0);
    sim.setSize(w, h);
  }

  // ---- 프레임 ----
  function tick(dt: number, tMs: number): void {
    sim.step(dt);
    const fading = performance.now() < fadeUntil;
    const activeMeta = view === "matter" && meta.ok;
    if (activeMeta || (fading && meta.ok)) meta.draw(sim);
    if (!activeMeta || fading) dot.draw(sim);
    if (opts.overlay) {
      overlayCtx.clearRect(0, 0, w, h);
      opts.overlay(overlayCtx, w, h, sim, tMs);
    }
  }

  applyViewClass();

  return {
    el: stage,
    hud,
    sim,
    get metaOk() {
      return meta.ok;
    },
    view: () => view,
    setView,
    setTemp: (T) => sim.setTemp(T),
    toast,
    tick,
    resize,
    dispose: () => {
      window.clearTimeout(toastTimer);
      meta.dispose();
      dot.dispose();
    },
  };
}
