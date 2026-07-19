// nephronLab — 물질 알갱이를 직접 끌어 여과·재흡수·분비의 방향을 체험하는 콩팥단위 랩.
//  · 여과: 토리(사구체)의 물질을 세뇨관으로 끌어내린다. 혈구·단백질은 커서 여과막에 막혀 튕겨 나온다.
//  · 재흡수: 세뇨관의 포도당·물을 모세혈관으로 되돌린다. 요소는 노폐물이라 되돌리면 거부된다.
//  · 분비: 모세혈관에 남은 노폐물을 세뇨관으로 보낸다.
//  · 결론: 정상 오줌엔 포도당(모두 재흡수)·단백질(여과 안 됨)이 없다.
// 조작 실체: 알갱이를 pointerdown/move/up으로 끌어 목표 관에 드롭한다. 크기·종류로 통과 여부가 갈린다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { bodyColor, safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface NephronStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "filter" | "reabsorb" | "secrete";
type Zone = "blood" | "tubule" | "capillary" | "hidden";
type PartId = "glucose" | "water" | "urea" | "cell" | "protein" | "waste";

const CVH = 320;
const BASE_W = 360;
const NEPHRON_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

// 새 모식도 좌표. 여과는 보먼주머니 입구, 재흡수·분비는 세뇨관과 주변 모세혈관 사이에서 판정한다.
const FILTER_ZONE = { x0: 58, x1: 118, y0: 180, y1: 225, cy: 203 };
const TUBULE = { x0: 102, x1: 334, y0: 182, y1: 225, cy: 204 };
const CAPIL = { x0: 132, x1: 334, y0: 116, y1: 166, cy: 142 };
const TUBULE_SLOTS: [number, number][] = [[162, 204], [214, 204], [266, 204], [310, 204]];
const CAPIL_SLOTS: [number, number][] = [[190, 142], [246, 142]];

interface PartDef { id: PartId; label: string; small: boolean; key: string; home: [number, number] }
const PART_DEFS: PartDef[] = [
  { id: "glucose", label: "포도당", small: true, key: "nutrient", home: [44, 70] },
  { id: "water", label: "물", small: true, key: "water", home: [98, 70] },
  { id: "urea", label: "요소", small: true, key: "urea", home: [150, 70] },
  { id: "cell", label: "혈구", small: false, key: "cell", home: [62, 120] },
  { id: "protein", label: "단백질", small: false, key: "protein", home: [132, 120] },
  { id: "waste", label: "노폐물", small: true, key: "waste", home: [300, 142] },
];

interface Part { id: PartId; label: string; small: boolean; color: string; x: number; y: number; zone: Zone }

export const nephronLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as NephronStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge body", dataset: { g: "filter" } }, el("b", { text: "여과" }), el("span", { text: "보먼주머니로" })),
    el("div", { class: "pn-badge body", dataset: { g: "reabsorb" } }, el("b", { text: "재흡수" }), el("span", { text: "혈관으로" })),
    el("div", { class: "pn-badge body", dataset: { g: "secrete" } }, el("b", { text: "분비" }), el("span", { text: "세뇨관으로" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "위 물질을 <b>토리 옆 보먼주머니 입구로 끌어</b> 여과해 보세요. 혈구와 단백질도 끌어 크기에 따라 어떻게 되는지 확인해요.",
  });
  const canvas = el("canvas", {
    class: "body-lab-canvas",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", role: "img", "aria-label": "토리·보먼주머니와 세뇨관, 모세혈관 사이에서 물질 알갱이를 끌어 옮기는 콩팥단위 무대" },
  });
  const readPill = el("span", { text: "작은 물질을 보먼주머니로 여과해요" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div", { class: "stage body-lab-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#E23B4B" }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const diagram = new Image();
  diagram.src = `${NEPHRON_IMG_BASE}body/figs/v2/nephron-process.webp`;

  const COLOR: Record<PartId, string> = {
    glucose: bodyColor("nutrient") || "#12B886",
    water: "#4DA6E0",
    urea: bodyColor("urea") || "#C98A2B",
    cell: bodyColor("oxygenated") || "#C0392B",
    protein: bodyColor("protein") || "#8B3FA8",
    waste: bodyColor("carbon") || "#5A6B7B",
  };
  const parts: Part[] = PART_DEFS.map((d) => ({
    id: d.id, label: d.label, small: d.small, color: COLOR[d.id],
    x: d.home[0], y: d.home[1], zone: d.id === "waste" ? "hidden" : "blood",
  }));
  const byId = (id: PartId): Part => parts.find((p) => p.id === id)!;

  let W = BASE_W;
  const scale = (): number => W / BASE_W;
  const sx = (x: number): number => x * scale();
  const sy = (y: number): number => y * scale();

  let phase: Goal = "filter";
  const goals = new Set<Goal>();
  const filtered = new Set<PartId>();
  const reabsorbed = new Set<PartId>();
  let finished = false;
  let toastTimer = 0;
  let dragId: PartId | null = null;
  let dragX = 0;
  let dragY = 0;
  let tubuleCount = 0;
  let capCount = 0;

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1750);
  };
  const collect = (id: Goal, sub: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "완성했어요! 콩팥단위는 <b>여과 → 재흡수 → 분비</b>로 오줌을 만들어요. 그래서 정상 오줌에는 <b>단백질(여과 안 됨)과 포도당(모두 재흡수)</b>이 없고, 요소와 남은 물·무기염류만 나가요.";
      readPill.textContent = "오줌 생성 완성";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "기관계 연결하기");
    }
  };

  const laneHit = (px: number, py: number, lane: typeof TUBULE): boolean =>
    px >= lane.x0 && px <= lane.x1 && py >= lane.y0 && py <= lane.y1;

  const advanceToReabsorb = (): void => {
    phase = "reabsorb";
    readPill.textContent = "세뇨관의 포도당·물을 모세혈관으로 되돌려요";
    helper.innerHTML = "이번엔 <b>세뇨관의 포도당과 물을 모세혈관으로 끌어</b> 재흡수해 보세요. 요소도 끌어 되돌려지는지 확인해요.";
  };
  const advanceToSecrete = (): void => {
    phase = "secrete";
    const waste = byId("waste");
    waste.zone = "capillary";
    waste.x = PART_DEFS[5].home[0];
    waste.y = PART_DEFS[5].home[1];
    readPill.textContent = "모세혈관의 노폐물을 세뇨관으로 보내요";
    helper.innerHTML = "마지막으로 <b>모세혈관에 남은 노폐물을 세뇨관으로 끌어</b> 분비해 보세요.";
  };

  const draggable = (p: Part): boolean => {
    if (finished) return false;
    if (phase === "filter") return p.zone === "blood";
    if (phase === "reabsorb") return p.zone === "tubule" && (p.id === "glucose" || p.id === "water" || p.id === "urea");
    return p.zone === "capillary" && p.id === "waste";
  };

  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (!draggable(p)) continue;
      const rr = p.small ? 15 : 20;
      if (Math.hypot(px - p.x, py - p.y) < rr + 8) {
        dragId = p.id;
        dragX = px;
        dragY = py;
        safePointerCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
        return;
      }
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragId) return;
    const r = canvas.getBoundingClientRect();
    dragX = clamp((e.clientX - r.left) / scale(), 0, BASE_W);
    dragY = clamp((e.clientY - r.top) / scale(), 0, CVH);
  };
  const onUp = (): void => {
    if (!dragId) return;
    const p = byId(dragId);
    dragId = null;

    if (phase === "filter") {
      if (laneHit(dragX, dragY, FILTER_ZONE)) {
        if (p.small) {
          const [sx0, sy0] = TUBULE_SLOTS[tubuleCount++];
          p.x = sx0; p.y = sy0; p.zone = "tubule"; filtered.add(p.id);
          haptic(HAPTIC.select);
          toastMsg(`${p.label}은 작아서 토리에서 보먼주머니로 여과돼요`);
          if (filtered.has("glucose") && filtered.has("water") && filtered.has("urea")) {
            collect("filter", "통과 확인");
            advanceToReabsorb();
          }
        } else {
          haptic(HAPTIC.wrong);
          toastMsg(`${p.label}은 크기가 커서 여과막을 통과하지 못하고 혈액에 남아요`);
        }
      }
      return;
    }
    if (phase === "reabsorb") {
      if (laneHit(dragX, dragY, CAPIL)) {
        if (p.id === "glucose" || p.id === "water") {
          const [sx0, sy0] = CAPIL_SLOTS[capCount++];
          p.x = sx0; p.y = sy0; p.zone = "capillary"; reabsorbed.add(p.id);
          haptic(HAPTIC.select);
          toastMsg(`${p.label}은 몸에 필요해 혈액으로 되돌아가요`);
          if (reabsorbed.has("glucose") && reabsorbed.has("water")) {
            collect("reabsorb", "되돌림 확인");
            advanceToSecrete();
          }
        } else {
          haptic(HAPTIC.wrong);
          toastMsg("요소는 노폐물이라 되돌리지 않고 오줌으로 내보내요");
        }
      }
      return;
    }
    // secrete
    if (laneHit(dragX, dragY, TUBULE)) {
      const [sx0, sy0] = TUBULE_SLOTS[tubuleCount++];
      p.x = sx0; p.y = sy0; p.zone = "tubule";
      haptic(HAPTIC.select);
      toastMsg("혈액에 남은 노폐물을 세뇨관으로 분비했어요");
      collect("secrete", "내보냄 확인");
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 그리기 ────────────────────────────────────────────────
  function drawBaseDiagram(ctx: CanvasRenderingContext2D, tMs: number): void {
    ctx.save();
    if (diagram.complete && diagram.naturalWidth > 0) {
      ctx.drawImage(diagram, 0, sy(40), W, sy(240));
    } else {
      ctx.fillStyle = "rgba(255,255,255,.06)";
      ctx.fillRect(0, sy(40), W, sy(240));
    }
    if (phase === "filter" && !finished) highlightLane(ctx, FILTER_ZONE, tMs);
    ctx.restore();
  }

  function drawTubule(ctx: CanvasRenderingContext2D, tMs: number): void {
    ctx.save();
    if (phase === "secrete" && !finished) highlightLane(ctx, TUBULE, tMs);
    ctx.restore();
  }

  function drawCapillary(ctx: CanvasRenderingContext2D, tMs: number): void {
    ctx.save();
    if (phase === "reabsorb" && !finished) highlightLane(ctx, CAPIL, tMs);
    ctx.restore();
  }

  function highlightLane(ctx: CanvasRenderingContext2D, lane: typeof TUBULE, tMs: number): void {
    const pulse = Math.sin(tMs / 360) * 0.5 + 0.5;
    ctx.save();
    ctx.strokeStyle = `rgba(226,59,75,${0.35 + pulse * 0.4})`;
    ctx.setLineDash([8 * scale(), 6 * scale()]);
    ctx.lineWidth = 2.4 * scale();
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
      .roundRect(sx(lane.x0) - 3, sy(lane.y0) - 3, sx(lane.x1 - lane.x0) + 6, sy(lane.y1 - lane.y0) + 6, 24 * scale());
    ctx.stroke();
    ctx.restore();
  }

  function drawLabels(ctx: CanvasRenderingContext2D): void {
    const pill = (x: number, y: number, text: string, color: string): void => {
      ctx.font = `850 ${10.5 * scale()}px Pretendard, sans-serif`;
      const width = ctx.measureText(text).width + 16 * scale();
      const height = 22 * scale();
      ctx.fillStyle = "rgba(255,255,255,.94)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1 * scale();
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
        .roundRect(sx(x) - width / 2, sy(y) - height / 2, width, height, 11 * scale());
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#172033";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, sx(x), sy(y));
    };
    ctx.save();
    pill(64, 266, "토리·보먼주머니", "#F08C00");
    pill(257, 104, "주변 모세혈관", "#E23B4B");
    pill(274, 262, "세뇨관", "#C08A18");
    ctx.restore();
  }

  function drawToken(ctx: CanvasRenderingContext2D, p: Part, px: number, py: number, isDrag: boolean): void {
    const x = sx(px);
    const y = sy(py);
    const r = (p.small ? 12 : 17) * scale();
    ctx.save();
    if (isDrag) { ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 12; }
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,.92)");
    g.addColorStop(0.38, p.color);
    g.addColorStop(1, p.color);
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(18,26,44,.55)";
    ctx.lineWidth = 1.5 * scale();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (isDrag || draggable(p)) {
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.6 * scale();
      ctx.beginPath();
      ctx.arc(x, y, r + 3 * scale(), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.font = `850 ${9.5 * scale()}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labelY = y + r + 9 * scale();
    const labelW = ctx.measureText(p.label).width + 10 * scale();
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.strokeStyle = "rgba(23,32,51,.18)";
    ctx.lineWidth = 1 * scale();
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
      .roundRect(x - labelW / 2, labelY - 8 * scale(), labelW, 16 * scale(), 8 * scale());
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#172033";
    ctx.fillText(p.label, x, labelY);
    ctx.restore();
  }

  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    drawBaseDiagram(ctx, tMs);
    drawTubule(ctx, tMs);
    drawCapillary(ctx, tMs);
    drawLabels(ctx);
    for (const p of parts) {
      if (p.zone === "hidden" || p.id === dragId) continue;
      drawToken(ctx, p, p.x, p.y, false);
    }
    if (dragId) drawToken(ctx, byId(dragId), dragX, dragY, true);
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("여과·재흡수·분비를 모두 해결해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
