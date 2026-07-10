// photoFactorLab — 중2 V 환경요인 기함 랩.
// 스마트 온실에서 한 조건만 바꾸며 빛·이산화 탄소의 포화 곡선과 온도의 알맞은 범위를 직접 그린다.

import "../../styles/plant.css";
import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import { drawMaterialToken, drawSun, plantAsset, plantColor } from "../../ui/plantKit";
import type { StepRenderer } from "../types";

interface FactorStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Factor = "light" | "co2" | "temp";
type Sample = { x: number; y: number };

const CVH = 430;
const SCENE_H = 250;

const LABEL: Record<Factor, string> = {
  light: "빛의 세기",
  co2: "이산화 탄소 농도",
  temp: "온도",
};

function css(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function alphaVar(name: string, alpha: number): string {
  return `color-mix(in srgb, ${css(name)} ${alpha * 100}%, transparent)`;
}

function lightResponse(v: number): number {
  return 1 - Math.exp(-v / 23);
}

function co2Response(v: number): number {
  return 1 - Math.exp(-v / 26);
}

function tempResponse(c: number): number {
  const cool = 1 / (1 + Math.exp(-(c - 10) / 5));
  const heatDrop = 1 / (1 + Math.exp((c - 36) / 3.3));
  return clamp(cool * heatDrop * 1.1, 0, 1);
}

function rateFor(factor: Factor, value: number): number {
  if (factor === "light") return lightResponse(value) * co2Response(78) * tempResponse(25) * 100;
  if (factor === "co2") return lightResponse(88) * co2Response(value) * tempResponse(25) * 100;
  return lightResponse(88) * co2Response(78) * tempResponse(value) * 100;
}

function displayValue(factor: Factor, value: number): string {
  if (factor === "light") return `${Math.round(value)} %`;
  if (factor === "co2") return `${Math.round(350 + value * 10)} ppm`;
  return `${Math.round(value)} ℃`;
}

function preset(factor: Factor, kind: "low" | "mid" | "high"): number {
  if (factor === "temp") return kind === "low" ? 8 : kind === "mid" ? 25 : 45;
  return kind === "low" ? 12 : kind === "mid" ? 55 : 96;
}

export const photoFactorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FactorStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge plant", dataset: { g: "fair" } }, el("b", { text: "공정한 실험" }), el("span", { text: "한 조건만" })),
    el("div", { class: "pn-badge plant", dataset: { g: "plateau" } }, el("b", { text: "포화 발견" }), el("span", { text: "빛·CO₂" })),
    el("div", { class: "pn-badge plant", dataset: { g: "temp" } }, el("b", { text: "알맞은 온도" }), el("span", { text: "너무 높으면?" })),
  );

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "스마트 온실의 빛, 이산화 탄소, 온도를 한 번에 하나씩 바꾸며 광합성량 그래프를 관찰하는 모형",
    },
  });
  const rateText = el("span", { text: "광합성량 28" });
  const conditionText = el("span", { text: "나머지 조건 고정" });
  const stage = el(
    "div",
    { class: "stage plant-stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--subj-plant)" }), rateText),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--plant-sun)" }), conditionText),
    ),
    el("div", { class: "stage-cap", text: "변인 하나를 고르고 값을 바꿔 보세요" }),
  );

  const factorButtons = (["light", "co2", "temp"] as Factor[]).map((f) =>
    el("button", { class: `plant-btn${f === "light" ? " on" : ""}`, text: LABEL[f], dataset: { factor: f }, attrs: { type: "button" } }),
  );
  const range = el("input", {
    class: "plant-range",
    attrs: { type: "range", min: 0, max: 100, step: 1, value: 22, "aria-label": "빛의 세기" },
  });
  const factorName = el("span", { text: "빛의 세기" });
  const factorValue = el("b", { text: "22 %" });
  const readout = el("div", { class: "plant-readout", attrs: { "aria-live": "polite" } }, factorName, factorValue);
  const lowBtn = el("button", { class: "plant-btn", text: "낮게", attrs: { type: "button" } });
  const midBtn = el("button", { class: "plant-btn", text: "알맞게", attrs: { type: "button" } });
  const highBtn = el("button", { class: "plant-btn", text: "매우 높게", attrs: { type: "button" } });
  const lockNote = el("div", {
    class: "plant-note",
    html: "선택한 조건만 움직이고, 나머지 두 조건은 자동으로 <b>같게 고정</b>돼요. 그래야 결과가 달라진 까닭을 하나로 좁힐 수 있어요.",
  });
  const helper = el("div", {
    class: "helper",
    html: "먼저 <b>빛의 세기</b>를 낮게와 매우 높게 바꿔 보세요. 그래프 점이 어디에서 더 이상 크게 오르지 않는지 찾아요.",
  });

  host.append(
    goals,
    helper, // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
    stage,
    el("div", { class: "plant-controls three" }, ...factorButtons),
    readout,
    range,
    el("div", { class: "plant-controls three" }, lowBtn, midBtn, highBtn),
    lockNote,
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  const values: Record<Factor, number> = { light: 22, co2: 22, temp: 18 };
  const samples: Record<Factor, Sample[]> = { light: [], co2: [], temp: [] };
  const visits: Record<Factor, Set<string>> = { light: new Set(), co2: new Set(), temp: new Set() };
  const done = new Set<string>();
  let selected: Factor = "light";
  let finished = false;
  let imageReady = false;
  let imageFailed = false;
  let activeRate = rateFor(selected, values[selected]);
  let targetRate = activeRate;
  let lastSample = -1;
  let userChanged = false;

  const greenhouse = new Image();
  const onImageLoad = (): void => { imageReady = true; };
  const onImageError = (): void => { imageFailed = true; };
  greenhouse.addEventListener("load", onImageLoad);
  greenhouse.addEventListener("error", onImageError);
  greenhouse.src = plantAsset("figs/greenhouse.webp");

  function collect(id: "fair" | "plateau" | "temp", text: string): void {
    if (done.has(id)) return;
    done.add(id);
    const chip = goals.querySelector<HTMLElement>(`[data-g="${id}"]`);
    chip?.classList.add("on");
    const sub = chip?.querySelector("span");
    if (sub) sub.textContent = text;
    haptic(HAPTIC.ctaUnlock);
    if (done.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "발견 완료! <b>빛과 이산화 탄소</b>는 늘릴수록 광합성량이 증가하다가 다른 조건이 제한해 <b>일정</b>해져요. <b>온도</b>는 알맞은 범위까지 증가하지만 너무 높으면 빠르게 감소해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function markVisit(): void {
    const v = values[selected];
    if (selected === "light" || selected === "co2") {
      if (v <= 20) visits[selected].add("low");
      if (v >= 88) visits[selected].add("high");
    } else {
      if (v >= 20 && v <= 30) visits.temp.add("mid");
      if (v >= 40) visits.temp.add("high");
    }
    if (userChanged) collect("fair", "나머지 두 조건 고정");
    if (visits.light.has("low") && visits.light.has("high") && visits.co2.has("low") && visits.co2.has("high")) {
      collect("plateau", "두 곡선 모두 평평");
    }
    if (visits.temp.has("mid") && visits.temp.has("high")) collect("temp", "알맞은 뒤 급감");
  }

  function guidance(): void {
    if (!visits.light.has("low") || !visits.light.has("high")) {
      helper.innerHTML = "<b>빛의 세기</b>를 낮게와 매우 높게 모두 바꿔 곡선의 끝을 비교해 보세요.";
    } else if (!visits.co2.has("low") || !visits.co2.has("high")) {
      helper.innerHTML = "빛 곡선이 평평해졌어요. 이제 <b>이산화 탄소 농도</b>도 양 끝을 비교해 같은 모양인지 확인해요.";
    } else if (!visits.temp.has("mid") || !visits.temp.has("high")) {
      helper.innerHTML = "마지막은 <b>온도</b>예요. 알맞게와 매우 높게를 비교하면 앞의 두 곡선과 다른 모양이 보여요.";
    }
  }

  function syncControls(): void {
    const max = selected === "temp" ? 50 : 100;
    range.max = String(max);
    range.value = String(values[selected]);
    range.setAttribute("aria-label", LABEL[selected]);
    factorName.textContent = LABEL[selected];
    factorValue.textContent = displayValue(selected, values[selected]);
    factorButtons.forEach((b) => b.classList.toggle("on", b.dataset.factor === selected));
    conditionText.textContent = selected === "light"
      ? "CO₂·온도 고정"
      : selected === "co2"
        ? "빛·온도 고정"
        : "빛·CO₂ 고정";
  }

  function setValue(v: number, fromUser = true): void {
    const max = selected === "temp" ? 50 : 100;
    values[selected] = clamp(v, 0, max);
    if (fromUser) {
      userChanged = true;
      haptic(HAPTIC.tap);
    }
    targetRate = rateFor(selected, values[selected]);
    factorValue.textContent = displayValue(selected, values[selected]);
    range.value = String(values[selected]);
    const bucket = Math.round(values[selected] / (selected === "temp" ? 2.5 : 5));
    if (bucket !== lastSample) {
      lastSample = bucket;
      samples[selected].push({ x: values[selected], y: targetRate });
      if (samples[selected].length > 45) samples[selected].shift();
    }
    markVisit();
    guidance();
  }

  const factorHandlers = factorButtons.map((button) => {
    const handler = (): void => {
      selected = button.dataset.factor as Factor;
      lastSample = -1;
      syncControls();
      guidance();
      haptic(HAPTIC.select);
    };
    button.addEventListener("click", handler);
    return handler;
  });
  const onRange = (): void => setValue(Number(range.value));
  const goLow = (): void => setValue(preset(selected, "low"));
  const goMid = (): void => setValue(preset(selected, "mid"));
  const goHigh = (): void => setValue(preset(selected, "high"));
  range.addEventListener("input", onRange);
  lowBtn.addEventListener("click", goLow);
  midBtn.addEventListener("click", goMid);
  highBtn.addEventListener("click", goHigh);

  function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.naturalWidth - sw) * 0.5;
    const sy = (img.naturalHeight - sh) * 0.34;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }

  function drawGraph(ctx: CanvasRenderingContext2D, w: number): void {
    const x0 = 47;
    const x1 = w - 18;
    const y0 = SCENE_H + 30;
    const y1 = CVH - 27;
    const maxX = selected === "temp" ? 50 : 100;
    const xp = (v: number): number => x0 + (v / maxX) * (x1 - x0);
    const yp = (v: number): number => y1 - (v / 100) * (y1 - y0);

    ctx.fillStyle = css("--stage-2");
    ctx.fillRect(0, SCENE_H, w, CVH - SCENE_H);
    ctx.strokeStyle = css("--n600");
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.font = "650 10px Pretendard, sans-serif";
    ctx.fillStyle = css("--n300");
    ctx.textAlign = "left";
    ctx.fillText("광합성량", x0 + 5, y0 - 8);
    ctx.textAlign = "right";
    ctx.fillText(LABEL[selected], x1, y1 + 18);

    ctx.strokeStyle = plantColor(selected === "temp" ? "sun" : selected === "co2" ? "carbon" : "leafHi");
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const v = (i / 80) * maxX;
      const x = xp(v);
      const y = yp(rateFor(selected, v));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    for (const p of samples[selected]) {
      ctx.fillStyle = css("--n0");
      ctx.beginPath();
      ctx.arc(xp(p.x), yp(p.y), 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    const cx = xp(values[selected]);
    const cy = yp(targetRate);
    ctx.fillStyle = plantColor(selected === "temp" ? "sun" : selected === "co2" ? "carbon" : "leafHi");
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css("--n0");
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  let bubblePhase = 0;
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    const w = fit.w;
    activeRate += (targetRate - activeRate) * Math.min(1, dt * 0.12);
    rateText.textContent = `광합성량 ${Math.round(activeRate)}`;
    bubblePhase += dt * (0.004 + activeRate * 0.00009);

    ctx.fillStyle = css("--stage");
    ctx.fillRect(0, 0, w, CVH);
    if (imageReady) {
      ctx.save();
      ctx.globalAlpha = 0.84;
      drawCover(ctx, greenhouse, w, SCENE_H);
      ctx.restore();
      const shade = ctx.createLinearGradient(0, 0, 0, SCENE_H);
      shade.addColorStop(0, alphaVar("--stage", 0.16));
      shade.addColorStop(1, alphaVar("--stage", 0.68));
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, w, SCENE_H);
    } else if (imageFailed) {
      const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
      g.addColorStop(0, css("--blue-tint-2"));
      g.addColorStop(1, css("--stage"));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, SCENE_H);
    }

    if (selected === "light") drawSun(ctx, w * 0.17, 54, 19 + values.light * 0.05, tMs * 0.0004);
    if (selected === "co2") {
      for (let i = 0; i < 5; i++) {
        const p = (bubblePhase * 0.07 + i * 0.2) % 1;
        drawMaterialToken(ctx, 20 + p * (w * 0.38), 95 + Math.sin(i * 2.1) * 30, 6.2, "carbon");
      }
    }
    const oxygenCount = Math.max(2, Math.round(activeRate / 17));
    for (let i = 0; i < oxygenCount; i++) {
      const p = (bubblePhase * 0.12 + i / oxygenCount) % 1;
      const x = w * (0.56 + (i % 3) * 0.1);
      const y = SCENE_H - 18 - p * 110;
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.5 * (1 - p);
      drawMaterialToken(ctx, x, y, 5.5 + p * 1.8, "oxygen");
      ctx.restore();
    }
    ctx.fillStyle = alphaVar("--n0", 0.9);
    ctx.font = "800 12px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${LABEL[selected]} ${displayValue(selected, values[selected])}`, 16, SCENE_H - 18);
    ctx.textAlign = "right";
    ctx.fillText("산소 발생률", w - 16, SCENE_H - 18);
    drawGraph(ctx, w);
  });

  syncControls();
  setValue(values.light, false);
  const start = requestAnimationFrame(() => loop.start());
  api.setCTA("세 환경요인의 곡선을 모두 확인해요", { enabled: false });

  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    greenhouse.removeEventListener("load", onImageLoad);
    greenhouse.removeEventListener("error", onImageError);
    factorButtons.forEach((b, i) => b.removeEventListener("click", factorHandlers[i]));
    range.removeEventListener("input", onRange);
    lowBtn.removeEventListener("click", goLow);
    midBtn.removeEventListener("click", goMid);
    highBtn.removeEventListener("click", goHigh);
  };
};
