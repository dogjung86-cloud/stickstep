// sugarJourneyLab — 중2 V 광합성 산물의 생성·이동·저장·이용 조작 랩.
// 낮에 잎의 녹말로 임시 저장하고, 밤에 설탕 화물로 바꿔 체관을 따라 위·아래 기관으로 직접 배송한다.

import "../../styles/plant.css";
import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import {
  drawFlowArrow,
  drawLeaf,
  drawMaterialToken,
  plantAsset,
  plantColor,
  safePointerCapture,
} from "../../ui/plantKit";
import type { StepRenderer } from "../types";

interface JourneyStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Target = "top" | "fruit" | "root";
type Point = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };
type Travel = { target: Target; p: number };

const CVH = 410;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function pathPoint(points: Point[], raw: number): Point {
  const t = clamp(raw, 0, 1);
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(d);
    total += d;
  }
  let cursor = t * total;
  for (let i = 0; i < lengths.length; i += 1) {
    if (cursor <= lengths[i] || i === lengths.length - 1) {
      const q = lengths[i] ? cursor / lengths[i] : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * q,
        y: points[i].y + (points[i + 1].y - points[i].y) * q,
      };
    }
    cursor -= lengths[i];
  }
  return points[points.length - 1];
}

export const sugarJourneyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as JourneyStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge plant", dataset: { g: "convert" } }, el("b", { text: "이동형 설탕" }), el("span", { text: "낮 녹말→밤 설탕" })),
    el("div", { class: "pn-badge plant", dataset: { g: "up" } }, el("b", { text: "위로 배송" }), el("span", { text: "어린잎·꽃" })),
    el("div", { class: "pn-badge plant", dataset: { g: "down" } }, el("b", { text: "아래로 배송" }), el("span", { text: "열매·뿌리" })),
  );
  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "잎의 설탕 화물을 체관을 따라 어린잎과 꽃, 열매, 뿌리로 직접 배송하는 식물 모형",
    },
  });
  const phasePill = el("span", { text: "낮 · 녹말 임시 저장" });
  const cargoPill = el("span", { text: "배송 0/3" });
  const stageCap = el("div", { class: "stage-cap", text: "밤으로 바꾼 뒤 잎의 설탕 화물을 목적지로 끌어 보세요" });
  const stage = el(
    "div",
    { class: "stage plant-stage journey-stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--plant-sun)" }), phasePill),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--plant-phloem)" }), cargoPill),
    ),
    stageCap,
  );
  const nightBtn = el("button", {
    class: "plant-btn",
    text: "밤으로 · 녹말을 설탕으로",
    attrs: { type: "button", "aria-pressed": "false" },
  });
  const topBtn = el("button", { class: "plant-btn", text: "어린잎·꽃으로: 성장", attrs: { type: "button", disabled: true } });
  const fruitBtn = el("button", { class: "plant-btn", text: "열매·씨로: 당·단백질·지방", attrs: { type: "button", disabled: true } });
  const rootBtn = el("button", { class: "plant-btn", text: "뿌리로: 녹말·호흡", attrs: { type: "button", disabled: true } });
  const helper = el("div", {
    class: "helper",
    html: "낮에 잎에 쌓인 <b>녹말</b>을 확인한 뒤 밤으로 바꿔 보세요. 설탕 화물이 생기면 잎에서 잡아 <b>위쪽과 아래쪽 목적지로 직접 끌어</b> 배송해요.",
  });
  const note = el("div", {
    class: "plant-note journey-note",
    html: "설탕은 <b>체관</b>을 따라 필요한 기관으로 이동해요. 목적지가 잎보다 위에 있든 아래에 있든 갈 수 있으므로 체관의 이동은 <b>양방향</b>이에요.",
  });
  host.append(
    goalChips,
    helper,
    stage,
    nightBtn,
    el("div", { class: "plant-controls three journey-controls" }, topBtn, fruitBtn, rootBtn),
    note,
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  let night = false;
  let conversion = 0;
  let sugarReady = false;
  let travel: Travel | null = null;
  let drag: Point | null = null;
  let dragMoved = false;
  let canvasW = 340;
  let imageReady = false;
  let imageFailed = false;
  let nearest: Target | null = null;
  const delivered = new Set<Target>();
  const goals = new Set<string>();
  let finished = false;
  const plant = new Image();
  const onLoad = (): void => { imageReady = true; };
  const onError = (): void => { imageFailed = true; };
  plant.addEventListener("load", onLoad);
  plant.addEventListener("error", onError);
  plant.src = plantAsset("figs/whole-plant.webp");

  function collect(id: "convert" | "up" | "down", subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector<HTMLElement>(`[data-g="${id}"]`);
    chip?.classList.add("on");
    const sub = chip?.querySelector("span");
    if (sub) sub.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "배송 완료! 잎의 포도당은 낮에 <b>녹말</b>로 잠시 저장되고, 주로 밤에 물에 녹는 <b>설탕</b>으로 바뀌어요. 설탕은 체관을 따라 어린잎·꽃으로 <b>위로도</b>, 열매와 뿌리로 <b>아래로도</b> 이동해 호흡·생장에 쓰이거나 여러 양분으로 저장돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "여행 정리하기");
    }
  }

  function setTargetButtons(): void {
    const entries: Array<[Target, HTMLButtonElement]> = [["top", topBtn], ["fruit", fruitBtn], ["root", rootBtn]];
    for (const [id, button] of entries) {
      button.disabled = !sugarReady || Boolean(travel) || delivered.has(id);
      button.classList.toggle("on", delivered.has(id));
    }
  }

  const toggleNight = (): void => {
    night = !night;
    nightBtn.classList.toggle("on", night);
    nightBtn.setAttribute("aria-pressed", String(night));
    stageCap.style.opacity = "0";
    haptic(HAPTIC.select);
    if (night) {
      conversion = 0;
      sugarReady = false;
      phasePill.textContent = "밤 · 녹말을 설탕으로 바꾸는 중";
      nightBtn.textContent = "낮으로 · 다시 녹말 저장";
      helper.innerHTML = "녹말이 물에 녹는 <b>설탕 화물</b>로 바뀌고 있어요. 준비되면 잎에서 화물을 잡아 목적지로 끌어 보세요.";
    } else {
      conversion = 0;
      sugarReady = false;
      phasePill.textContent = "낮 · 녹말 임시 저장";
      nightBtn.textContent = "밤으로 · 녹말을 설탕으로";
      helper.innerHTML = "낮에는 잎에 <b>녹말</b>이 다시 쌓여요. 배송하려면 밤으로 바꿔 설탕을 준비하세요.";
    }
    setTargetButtons();
  };
  nightBtn.addEventListener("click", toggleNight);

  function imageRect(w: number): Rect {
    if (!imageReady) return { x: 20, y: 8, w: w - 40, h: CVH - 16 };
    const scale = Math.min((w - 18) / plant.naturalWidth, (CVH - 10) / plant.naturalHeight);
    const dw = plant.naturalWidth * scale;
    const dh = plant.naturalHeight * scale;
    return { x: (w - dw) * 0.5, y: 5, w: dw, h: dh };
  }

  function geometry(rect: Rect): { leaf: Point; top: Point; fruit: Point; root: Point; paths: Record<Target, Point[]> } {
    const px = (n: number): number => rect.x + rect.w * n;
    const py = (n: number): number => rect.y + rect.h * n;
    const leaf = { x: px(0.33), y: py(0.34) };
    const stem = { x: px(0.5), y: py(0.49) };
    const top = { x: px(0.53), y: py(0.17) };
    const fruit = { x: px(0.68), y: py(0.45) };
    const root = { x: px(0.5), y: py(0.9) };
    return {
      leaf, top, fruit, root,
      paths: {
        top: [leaf, stem, { x: px(0.5), y: py(0.29) }, top],
        fruit: [leaf, stem, { x: px(0.59), y: py(0.47) }, fruit],
        root: [leaf, stem, { x: px(0.5), y: py(0.72) }, root],
      },
    };
  }

  function targetPoint(geo: ReturnType<typeof geometry>, target: Target): Point {
    return target === "top" ? geo.top : target === "fruit" ? geo.fruit : geo.root;
  }

  function startTravel(target: Target): void {
    if (!sugarReady || travel || delivered.has(target)) return;
    travel = { target, p: 0 };
    drag = null;
    nearest = null;
    setTargetButtons();
    haptic(HAPTIC.tap);
  }
  const topClick = (): void => startTravel("top");
  const fruitClick = (): void => startTravel("fruit");
  const rootClick = (): void => startTravel("root");
  topBtn.addEventListener("click", topClick);
  fruitBtn.addEventListener("click", fruitClick);
  rootBtn.addEventListener("click", rootClick);

  function canvasPoint(event: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  const onPointerDown = (event: PointerEvent): void => {
    if (!sugarReady || travel) return;
    const point = canvasPoint(event);
    const geo = geometry(imageRect(canvasW));
    if (Math.hypot(point.x - geo.leaf.x, point.y - geo.leaf.y) > 32) return;
    drag = point;
    dragMoved = false;
    safePointerCapture(canvas, event.pointerId);
    canvas.classList.add("dragging");
    stageCap.style.opacity = "0";
    haptic(HAPTIC.tap);
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (!drag) return;
    const point = canvasPoint(event);
    if (Math.hypot(point.x - drag.x, point.y - drag.y) > 5) dragMoved = true;
    drag = point;
    const geo = geometry(imageRect(canvasW));
    nearest = null;
    let best = 66;
    for (const id of ["top", "fruit", "root"] as Target[]) {
      if (delivered.has(id)) continue;
      const target = targetPoint(geo, id);
      const d = Math.hypot(point.x - target.x, point.y - target.y);
      if (d < best) {
        best = d;
        nearest = id;
      }
    }
  };
  const onPointerUp = (): void => {
    if (!drag) return;
    const destination = nearest;
    drag = null;
    nearest = null;
    canvas.classList.remove("dragging");
    if (destination && dragMoved) startTravel(destination);
    else helper.innerHTML = "설탕 화물을 <b>빛나는 목적지 원 안까지</b> 끌어 놓아 보세요. 체관 경로가 배송을 이어 줘요.";
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (!sugarReady || travel) return;
    if (event.key === "ArrowUp") startTravel("top");
    else if (event.key === "ArrowRight") startTravel("fruit");
    else if (event.key === "ArrowDown") startTravel("root");
    else return;
    event.preventDefault();
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("keydown", onKeyDown);

  function drawRoute(ctx: CanvasRenderingContext2D, points: Point[], alpha: number): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 1; i < points.length; i += 1) {
      drawFlowArrow(ctx, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, plantColor("phloem"), 3.2);
    }
    ctx.restore();
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    const w = fit.w;
    canvasW = w;
    if (night && !sugarReady) {
      conversion = clamp(conversion + dt * 0.018, 0, 1);
      if (conversion >= 1) {
        sugarReady = true;
        phasePill.textContent = "밤 · 설탕 화물 준비 완료";
        collect("convert", "녹말→설탕 완료");
        helper.innerHTML = "설탕 화물이 준비됐어요. 잎의 화물을 잡아 <b>어린잎·꽃, 열매·씨, 뿌리</b>로 직접 배송해 보세요.";
        setTargetButtons();
      }
    }
    if (travel) {
      travel.p = clamp(travel.p + dt * 0.016, 0, 1);
      if (travel.p >= 1) {
        const target = travel.target;
        delivered.add(target);
        travel = null;
        cargoPill.textContent = `배송 ${delivered.size}/3`;
        if (target === "top") {
          collect("up", "어린잎·꽃 도착");
          helper.innerHTML = "설탕이 체관을 따라 <b>위쪽 어린잎과 꽃</b>에도 도착했어요. 이제 아래쪽 저장 기관도 배송해 보세요.";
        }
        if (delivered.has("fruit") && delivered.has("root")) {
          collect("down", "열매·뿌리 도착");
        }
        setTargetButtons();
      }
    }

    ctx.fillStyle = cssVar("--stage");
    ctx.fillRect(0, 0, w, CVH);
    const rect = imageRect(w);
    if (imageReady) {
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.drawImage(plant, rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
      const veil = ctx.createLinearGradient(0, 0, w, 0);
      veil.addColorStop(0, `color-mix(in srgb, ${cssVar("--stage")} 72%, transparent)`);
      veil.addColorStop(0.32, `color-mix(in srgb, ${cssVar("--stage")} 10%, transparent)`);
      veil.addColorStop(0.68, `color-mix(in srgb, ${cssVar("--stage")} 10%, transparent)`);
      veil.addColorStop(1, `color-mix(in srgb, ${cssVar("--stage")} 72%, transparent)`);
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, CVH);
    } else if (imageFailed || !imageReady) {
      const cx = w * 0.5;
      ctx.strokeStyle = plantColor("soil");
      ctx.lineWidth = 15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, CVH - 42);
      ctx.lineTo(cx, 88);
      ctx.stroke();
      drawLeaf(ctx, cx - 65, 148, 130, 63, 0.2);
      drawLeaf(ctx, cx + 62, 116, 126, 61, -0.22);
    }
    const geo = geometry(rect);
    if (sugarReady) {
      for (const id of ["top", "fruit", "root"] as Target[]) {
        drawRoute(ctx, geo.paths[id], delivered.has(id) ? 0.96 : nearest === id ? 0.72 : 0.28);
      }
    }

    if (!night) {
      for (let i = 0; i < 5; i += 1) {
        drawMaterialToken(ctx, geo.leaf.x - 20 + i * 10, geo.leaf.y - 9 + (i % 2) * 12, 6.3, "starch");
      }
    } else if (!sugarReady) {
      ctx.save();
      ctx.globalAlpha = 1 - conversion;
      for (let i = 0; i < 5; i += 1) {
        drawMaterialToken(ctx, geo.leaf.x - 20 + i * 10, geo.leaf.y - 9 + (i % 2) * 12, 6.3, "starch");
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = conversion;
      drawMaterialToken(ctx, geo.leaf.x, geo.leaf.y, 12, "glucose", "설탕");
      ctx.restore();
    }

    for (const id of ["top", "fruit", "root"] as Target[]) {
      const point = targetPoint(geo, id);
      ctx.save();
      const pulse = 18 + Math.sin(tMs * 0.006 + point.x) * 2;
      ctx.strokeStyle = nearest === id ? cssVar("--n0") : plantColor("phloem");
      ctx.globalAlpha = delivered.has(id) ? 0.9 : 0.48;
      ctx.lineWidth = delivered.has(id) ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(point.x, point.y, pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      if (delivered.has(id)) {
        drawMaterialToken(ctx, point.x, point.y, 10, id === "root" ? "starch" : "glucose");
        const label = id === "top" ? "성장·꽃" : id === "fruit" ? "당·단백질·지방" : "녹말·호흡";
        ctx.fillStyle = cssVar("--n0");
        ctx.font = "800 9.5px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, point.x, point.y + (id === "root" ? 28 : -25));
      }
    }

    if (travel) {
      const point = pathPoint(geo.paths[travel.target], travel.p);
      drawMaterialToken(ctx, point.x, point.y, 10, "glucose", "당");
    } else if (drag) {
      drawFlowArrow(ctx, geo.leaf.x, geo.leaf.y, drag.x, drag.y, plantColor("phloem"), 2.2);
      drawMaterialToken(ctx, drag.x, drag.y, 12, "glucose", "당");
    } else if (sugarReady && delivered.size < 3) {
      ctx.save();
      ctx.shadowColor = plantColor("phloem");
      ctx.shadowBlur = 10 + Math.sin(tMs * 0.006) * 2;
      drawMaterialToken(ctx, geo.leaf.x, geo.leaf.y, 12, "glucose", "당");
      ctx.restore();
    }
  });

  setTargetButtons();
  const startFrame = requestAnimationFrame(() => loop.start());
  api.setCTA("설탕을 위와 아래 기관에 모두 배송해요", { enabled: false });

  return () => {
    cancelAnimationFrame(startFrame);
    loop.stop();
    plant.removeEventListener("load", onLoad);
    plant.removeEventListener("error", onError);
    plant.src = "";
    nightBtn.removeEventListener("click", toggleNight);
    topBtn.removeEventListener("click", topClick);
    fruitBtn.removeEventListener("click", fruitClick);
    rootBtn.removeEventListener("click", rootClick);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("keydown", onKeyDown);
  };
};
