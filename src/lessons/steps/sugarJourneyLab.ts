// sugarJourneyLab — 중2 V 광합성산물의 생성·이동·저장·이용 기함 랩.
// 잎의 포도당→녹말 임시 저장→주로 밤에 설탕으로 전환→체관을 따라 위·아래 필요한 기관으로 이동.

import "../../styles/plant.css";
import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import { drawFlowArrow, drawMaterialToken, plantAsset, plantColor } from "../../ui/plantKit";
import type { StepRenderer } from "../types";

interface JourneyStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Target = "top" | "fruit" | "root";
type Point = { x: number; y: number };
type Travel = { target: Target; p: number; done: boolean };
type Rect = { x: number; y: number; w: number; h: number };

const CVH = 390;

function css(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function alphaVar(name: string, alpha: number): string {
  return `color-mix(in srgb, ${css(name)} ${alpha * 100}%, transparent)`;
}

function pathPoint(points: Point[], raw: number): Point {
  const t = clamp(raw, 0, 1);
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(d);
    total += d;
  }
  let cursor = t * total;
  for (let i = 0; i < lengths.length; i++) {
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

  const goals = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge plant", dataset: { g: "convert" } }, el("b", { text: "이동 준비" }), el("span", { text: "녹말→설탕" })),
    el("div", { class: "pn-badge plant", dataset: { g: "both" } }, el("b", { text: "체관 양방향" }), el("span", { text: "위·아래" })),
    el("div", { class: "pn-badge plant", dataset: { g: "uses" } }, el("b", { text: "세 가지 쓰임" }), el("span", { text: "호흡·성장·저장" })),
  );
  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "잎에서 만든 양분이 설탕으로 바뀌어 체관을 따라 꽃, 열매, 뿌리로 이동하는 식물 모형",
    },
  });
  const phasePill = el("span", { text: "낮 · 광합성 준비" });
  const cargoPill = el("span", { text: "설탕 화물 0/3" });
  const stageCap = el("div", { class: "stage-cap", text: "잎에서 양분을 만든 뒤 밤으로 넘겨 보세요" });
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

  const makeBtn = el("button", { class: "plant-btn", text: "잎에서 포도당 만들기", attrs: { type: "button" } });
  const nightBtn = el("button", { class: "plant-btn", text: "밤: 녹말을 설탕으로", attrs: { type: "button", disabled: true, "aria-disabled": "true" } });
  const topBtn = el("button", { class: "plant-btn", text: "어린잎·꽃으로: 성장", attrs: { type: "button", disabled: true, "aria-disabled": "true" } });
  const fruitBtn = el("button", { class: "plant-btn", text: "열매로: 저장", attrs: { type: "button", disabled: true, "aria-disabled": "true" } });
  const rootBtn = el("button", { class: "plant-btn", text: "뿌리로: 호흡·저장", attrs: { type: "button", disabled: true, "aria-disabled": "true" } });
  const note = el("div", {
    class: "plant-note journey-note",
    html: "<b>자홍색 체관 경로</b>를 따라 설탕이 잎에서 양분을 필요로 하는 어린잎·꽃·열매·뿌리로 이동해요.",
  });
  const helper = el("div", {
    class: "helper",
    html: "먼저 잎에서 <b>포도당</b>을 만들어요. 포도당이 곧 어떤 형태로 바뀌어 잎에 저장되는지 지켜보세요.",
  });
  host.append(
    goals,
    helper, // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
    stage,
    el("div", { class: "plant-controls two journey-controls" }, makeBtn, nightBtn),
    el("div", { class: "plant-controls three journey-controls" }, topBtn, fruitBtn, rootBtn),
    note,
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  let phase: "ready" | "making" | "starch" | "sugar" | "shipping" | "done" = "ready";
  let process = 0;
  const travels: Travel[] = [];
  const delivered = new Set<Target>();
  const done = new Set<string>();
  let finished = false;
  let imageReady = false;
  let imageFailed = false;
  const plant = new Image();
  const onLoad = (): void => { imageReady = true; };
  const onError = (): void => { imageFailed = true; };
  plant.addEventListener("load", onLoad);
  plant.addEventListener("error", onError);
  plant.src = plantAsset("figs/whole-plant.webp");

  function enable(button: HTMLButtonElement, on: boolean): void {
    button.disabled = !on;
    button.setAttribute("aria-disabled", String(!on));
  }

  function collect(id: "convert" | "both" | "uses", subText: string): void {
    if (done.has(id)) return;
    done.add(id);
    const chip = goals.querySelector<HTMLElement>(`[data-g="${id}"]`);
    chip?.classList.add("on");
    const sub = chip?.querySelector("span");
    if (sub) sub.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (done.size === 3 && !finished) {
      finished = true;
      phase = "done";
      stageCap.textContent = "자홍: 잎에서 필요한 기관으로 이어지는 체관의 설탕 이동";
      helper.innerHTML = "여행 완료! 잎의 포도당은 <b>녹말</b>로 잠시 저장되고, 주로 밤에 물에 녹는 <b>설탕</b>으로 바뀌어 <b>체관</b>을 따라 필요한 기관으로 이동해요. 도착한 양분은 호흡·성장에 쓰이거나 여러 형태로 저장돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  const onMake = (): void => {
    if (phase !== "ready") return;
    phase = "making";
    process = 0;
    makeBtn.classList.add("on");
    enable(makeBtn, false);
    phasePill.textContent = "낮 · 포도당 만드는 중";
    stageCap.textContent = "포도당이 녹말로 바뀌어 잎에 잠시 저장돼요";
    helper.innerHTML = "빛에너지로 만든 <b>포도당</b>은 곧 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 잎의 엽록체에 저장돼요.";
    haptic(HAPTIC.tap);
  };
  const onNight = (): void => {
    if (phase !== "starch") return;
    phase = "sugar";
    process = 0;
    nightBtn.classList.add("on");
    enable(nightBtn, false);
    phasePill.textContent = "밤 · 설탕으로 바꾸는 중";
    stageCap.textContent = "녹말을 물에 잘 녹는 설탕으로 바꾸고 있어요";
    helper.innerHTML = "녹말은 물에 잘 녹지 않아 그대로 체관을 탈 수 없어요. 주로 밤에 <b>물에 녹는 설탕</b>으로 바꿔 이동을 준비해요.";
    haptic(HAPTIC.tap);
  };
  function send(target: Target): void {
    if (phase !== "shipping" || delivered.has(target) || travels.some((t) => t.target === target && !t.done)) return;
    travels.push({ target, p: 0, done: false });
    const button = target === "top" ? topBtn : target === "fruit" ? fruitBtn : rootBtn;
    button.classList.add("on");
    enable(button, false);
    haptic(HAPTIC.tap);
  }
  const onTop = (): void => send("top");
  const onFruit = (): void => send("fruit");
  const onRoot = (): void => send("root");
  makeBtn.addEventListener("click", onMake);
  nightBtn.addEventListener("click", onNight);
  topBtn.addEventListener("click", onTop);
  fruitBtn.addEventListener("click", onFruit);
  rootBtn.addEventListener("click", onRoot);

  function imageRect(w: number, h: number, image?: HTMLImageElement): Rect {
    const naturalW = image?.naturalWidth || 1;
    const naturalH = image?.naturalHeight || 1;
    const scale = Math.min((w - 18) / naturalW, (h - 10) / naturalH);
    const dw = naturalW * scale;
    const dh = naturalH * scale;
    return { x: (w - dw) * 0.5, y: 5, w: dw, h: dh };
  }

  function plantGeometry(rect: Rect): {
    leaf: Point; stem: Point; top: Point; fruit: Point; root: Point;
    paths: Record<Target, Point[]>;
  } {
    const px = (n: number): number => rect.x + rect.w * n;
    const py = (n: number): number => rect.y + rect.h * n;
    const leaf = { x: px(0.33), y: py(0.34) };
    const stem = { x: px(0.5), y: py(0.49) };
    const top = { x: px(0.53), y: py(0.18) };
    const fruit = { x: px(0.66), y: py(0.43) };
    const root = { x: px(0.5), y: py(0.9) };
    return {
      leaf, stem, top, fruit, root,
      paths: {
        top: [leaf, stem, { x: px(0.5), y: py(0.3) }, top],
        fruit: [leaf, stem, { x: px(0.58), y: py(0.47) }, fruit],
        root: [leaf, stem, { x: px(0.5), y: py(0.71) }, root],
      },
    };
  }

  function drawPath(ctx: CanvasRenderingContext2D, points: Point[], color: string, alpha: number): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 1; i < points.length; i++) {
      drawFlowArrow(ctx, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, color, 3.2);
    }
    ctx.restore();
  }

  function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, rect: Rect): void {
    ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
  }

  let tClock = 0;
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    const w = fit.w;
    tClock += dt;

    if (phase === "making" || phase === "sugar") {
      process = clamp(process + dt * 0.018, 0, 1);
      if (process >= 1 && phase === "making") {
        phase = "starch";
        phasePill.textContent = "낮 · 녹말로 임시 저장";
        enable(nightBtn, true);
        helper.innerHTML = "잎에 <b>녹말</b>이 저장됐어요. 이제 밤으로 넘겨 이동할 수 있는 형태로 바꿔 보세요.";
      } else if (process >= 1 && phase === "sugar") {
        phase = "shipping";
        phasePill.textContent = "밤 · 설탕 화물 준비 완료";
        collect("convert", "녹말→설탕 완료");
        enable(topBtn, true);
        enable(fruitBtn, true);
        enable(rootBtn, true);
        stageCap.textContent = "설탕 화물을 위쪽·옆쪽·아래쪽 기관으로 보내세요";
        helper.innerHTML = "설탕 화물이 준비됐어요. <b>체관</b>을 따라 위쪽 어린잎·꽃과 아래쪽 뿌리, 옆의 열매로 모두 보내 보세요.";
      }
    }
    for (const travel of travels) {
      if (travel.done) continue;
      travel.p = clamp(travel.p + dt * 0.015, 0, 1);
      if (travel.p >= 1) {
        travel.done = true;
        delivered.add(travel.target);
        cargoPill.textContent = `설탕 화물 ${delivered.size}/3`;
        if (delivered.has("top") && delivered.has("root")) collect("both", "위·아래 모두 이동");
        if (delivered.size === 3) collect("uses", "호흡·성장·저장 도착");
      }
    }

    ctx.fillStyle = css("--stage");
    ctx.fillRect(0, 0, w, CVH);
    const rect = imageRect(w, CVH, imageReady ? plant : undefined);
    if (imageReady) {
      ctx.save();
      ctx.globalAlpha = 0.92;
      drawContain(ctx, plant, rect);
      ctx.restore();
      const veil = ctx.createLinearGradient(0, 0, w, 0);
      veil.addColorStop(0, alphaVar("--stage", 0.72));
      veil.addColorStop(0.32, alphaVar("--stage", 0.1));
      veil.addColorStop(0.68, alphaVar("--stage", 0.1));
      veil.addColorStop(1, alphaVar("--stage", 0.72));
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, CVH);
    } else if (imageFailed) {
      const g = ctx.createLinearGradient(0, 0, 0, CVH);
      g.addColorStop(0, css("--subj-plant-tint"));
      g.addColorStop(1, css("--stage"));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, CVH);
    }

    const geo = plantGeometry(rect);
    // 이 랩은 양분 배송만 다루므로 물관은 생략하고 체관 경로만 보여 준다.
    if (phase === "shipping" || phase === "done") {
      drawPath(ctx, geo.paths.top, plantColor("phloem"), delivered.has("top") ? 0.95 : 0.35);
      drawPath(ctx, geo.paths.fruit, plantColor("phloem"), delivered.has("fruit") ? 0.95 : 0.35);
      drawPath(ctx, geo.paths.root, plantColor("phloem"), delivered.has("root") ? 0.95 : 0.35);
    }
    if (phase === "starch" || phase === "sugar" || phase === "shipping" || phase === "done") {
      const starchAlpha = phase === "sugar" ? 1 - process : phase === "starch" ? 1 : 0;
      const sugarAlpha = phase === "sugar" ? process : phase === "shipping" || phase === "done" ? 1 : 0;
      if (starchAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = starchAlpha;
        for (let i = 0; i < 4; i++) drawMaterialToken(ctx, geo.leaf.x - 18 + i * 12, geo.leaf.y - 8 + (i % 2) * 11, 6.5, "starch");
        ctx.restore();
      }
      if (sugarAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = sugarAlpha;
        drawMaterialToken(ctx, geo.leaf.x, geo.leaf.y, 10, "glucose", "설탕");
        ctx.restore();
      }
    } else if (phase === "making") {
      ctx.save();
      ctx.globalAlpha = process;
      drawMaterialToken(ctx, geo.leaf.x, geo.leaf.y, 10, "glucose", "당");
      ctx.restore();
    }

    for (const travel of travels) {
      const p = pathPoint(geo.paths[travel.target], travel.p);
      drawMaterialToken(ctx, p.x, p.y, 8.5, "glucose");
    }
    for (const target of delivered) {
      const p = target === "top" ? geo.top : target === "fruit" ? geo.fruit : geo.root;
      const text = target === "top" ? "성장·꽃" : target === "fruit" ? "저장" : "호흡·저장";
      ctx.save();
      ctx.shadowColor = plantColor("phloem");
      ctx.shadowBlur = 10 + Math.sin(tMs * 0.006) * 2;
      drawMaterialToken(ctx, p.x, p.y, 10, "glucose");
      ctx.restore();
      ctx.fillStyle = css("--n0");
      ctx.font = "800 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, p.x, p.y + (target === "root" ? 24 : -20));
    }
  });

  const start = requestAnimationFrame(() => loop.start());
  api.setCTA("설탕을 세 기관에 모두 보내요", { enabled: false });

  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    plant.removeEventListener("load", onLoad);
    plant.removeEventListener("error", onError);
    makeBtn.removeEventListener("click", onMake);
    nightBtn.removeEventListener("click", onNight);
    topBtn.removeEventListener("click", onTop);
    fruitBtn.removeEventListener("click", onFruit);
    rootBtn.removeEventListener("click", onRoot);
  };
};
