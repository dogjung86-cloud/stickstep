// photoEvidenceLab — 중2 V 광합성 증거 조작 랩.
// 빛 세기에 따른 기체 센서 변화와, 사전 암처리·부분 가리기를 직접 설계해 녹말 증거를 비교한다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { rubber } from "../../core/rubber";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import {
  drawFlowArrow,
  drawLeaf,
  drawMaterialToken,
  drawSun,
  plantColor,
  safePointerCapture,
} from "../../ui/plantKit";
import type { StepRenderer } from "../types";

interface PhotoEvidenceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type ResultKind = "none" | "controlled" | "confused";

const CVH = 430;
const SENSOR_BOTTOM = 205;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function alphaVar(name: string, alpha: number): string {
  return `color-mix(in srgb, ${cssVar(name)} ${alpha * 100}%, transparent)`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function leafPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.bezierCurveTo(x - w * 0.2, y - h * 0.62, x + w * 0.3, y - h * 0.62, x + w * 0.52, y);
  ctx.bezierCurveTo(x + w * 0.27, y + h * 0.58, x - w * 0.24, y + h * 0.58, x - w * 0.5, y);
  ctx.closePath();
}

export const photoEvidenceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PhotoEvidenceStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge plant", dataset: { g: "sensor" } }, el("b", { text: "센서 갈라짐" }), el("span", { text: "빛 약→강" })),
    el("div", { class: "pn-badge plant", dataset: { g: "leaf" } }, el("b", { text: "빛 부분 녹말" }), el("span", { text: "가리개 비교" })),
    el("div", { class: "pn-badge plant", dataset: { g: "confused" } }, el("b", { text: "암처리의 까닭" }), el("span", { text: "생략하면?" })),
  );

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "빛 센서 그래프와 잎 가리개를 조작해 광합성 증거를 찾는 실험",
    },
  });
  const carbonRead = el("span", { text: "CO₂ 변화 거의 없음" });
  const oxygenRead = el("span", { text: "O₂ 변화 거의 없음" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "센서 슬라이더와 잎 가리개를 직접 움직여 보세요" });
  const stage = el(
    "div",
    { class: "stage plant-stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--plant-carbon)" }), carbonRead),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--plant-oxygen)" }), oxygenRead),
    ),
    toastEl,
    capEl,
  );

  const thumb = el("div", { class: "sl-thumb" }, el("i", { style: "background:var(--plant-sun)" }));
  const fill = el("div", { class: "sl-fill", style: "background:var(--subj-plant)" });
  const track = el("div", { class: "sl-track" }, fill, thumb);
  const slider = el(
    "div",
    {
      class: "slider plant-evidence-slider",
      attrs: {
        role: "slider",
        tabindex: "0",
        "aria-label": "센서 실험의 빛 세기",
        "aria-valuemin": "0",
        "aria-valuemax": "100",
        "aria-valuenow": "8",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "빛 없음" }), el("span", { text: "강한 빛" })),
  );

  const darkBtn = el("button", {
    class: "plant-btn on",
    text: "사전 암처리 · 함",
    attrs: { type: "button", "aria-pressed": "true" },
  });
  const detectBtn = el("button", {
    class: "plant-btn",
    text: "탈색·헹굼 뒤 아이오딘 검출",
    attrs: { type: "button" },
  });
  const helper = el("div", {
    class: "helper",
    html: "먼저 센서의 <b>빛 세기</b>를 약하게, 강하게 바꿔 두 곡선이 어떻게 갈라지는지 보세요. 이어서 검은 <b>잎 가리개</b>를 옮겨 비교를 설계해요.",
  });
  const note = el("div", {
    class: "plant-note",
    html: "검출 전에는 잎을 에탄올 물중탕으로 <b>탈색</b>하고 물로 <b>헹군 뒤</b> 아이오딘 용액을 써요. 아이오딘 반응이 찾는 것은 포도당이 아니라 <b>녹말</b>이에요.",
  });
  host.append(
    goalChips,
    helper,
    stage,
    slider,
    el("div", { class: "plant-controls two" }, darkBtn, detectBtn),
    note,
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  let light = 0.08;
  let sliderDragging = false;
  let seenLow = false;
  let seenHigh = false;
  let darkTreated = true;
  let result: ResultKind = "none";
  let resultMix = 0;
  let canvasW = 340;
  let coverNorm = 0;
  let coverStartNorm = 0;
  let coverDragging = false;
  let coverMoved = false;
  let toastTimer = 0;
  const goals = new Set<string>();
  let finished = false;

  function toast(message: string): void {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function collect(id: "sensor" | "leaf" | "confused", subText: string, message: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector<HTMLElement>(`[data-g="${id}"]`);
    chip?.classList.add("on");
    const sub = chip?.querySelector("span");
    if (sub) sub.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(message);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "증거를 직접 설계했어요. 빛이 강할수록 <b>CO₂는 더 줄고 O₂는 더 늘었고</b>, 사전 암처리한 잎에서는 <b>빛을 받은 부분만 녹말</b>이 검출됐어요. 암처리를 생략하면 기존 녹말까지 반응해 공정한 비교가 흐려져요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "증거 정리하기");
    }
  }

  function updateSlider(fromUser: boolean): void {
    const pct = light * 100;
    thumb.style.left = `${pct}%`;
    fill.style.width = `${pct}%`;
    slider.setAttribute("aria-valuenow", String(Math.round(pct)));
    slider.setAttribute("aria-valuetext", `빛의 세기 ${Math.round(pct)}퍼센트`);
    carbonRead.textContent = light < 0.05 ? "CO₂ 변화 거의 없음" : `CO₂ 감소 ${Math.round(light * 100)}`;
    oxygenRead.textContent = light < 0.05 ? "O₂ 변화 거의 없음" : `O₂ 증가 ${Math.round(light * 100)}`;
    if (!fromUser) return;
    capEl.style.opacity = "0";
    if (light < 0.14) seenLow = true;
    if (light > 0.82) seenHigh = true;
    if (seenLow && seenHigh) {
      collect("sensor", "빛 강할수록 더 갈라짐", "센서 두 곡선의 간격이 빛에 따라 달라졌어요");
      helper.innerHTML = "센서 증거를 찾았어요. 이제 아래 잎의 <b>검은 가리개를 좌우로 끌어</b> 일부만 가린 뒤 아이오딘 검출을 해 보세요.";
    }
  }

  function setLightFromClientX(clientX: number): void {
    const rect = track.getBoundingClientRect();
    light = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const over = clientX < rect.left ? clientX - rect.left : clientX > rect.right ? clientX - rect.right : 0;
    thumb.style.setProperty("--rb", `${rubber(over, rect.width)}px`);
    updateSlider(true);
  }
  const onSliderDown = (event: PointerEvent): void => {
    sliderDragging = true;
    safePointerCapture(slider, event.pointerId);
    slider.classList.add("drag");
    setLightFromClientX(event.clientX);
  };
  const onSliderMove = (event: PointerEvent): void => {
    if (sliderDragging) setLightFromClientX(event.clientX);
  };
  const endSlider = (): void => {
    sliderDragging = false;
    slider.classList.remove("drag");
    thumb.style.setProperty("--rb", "0px");
  };
  const onSliderKey = (event: KeyboardEvent): void => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") light = clamp(light + 0.05, 0, 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") light = clamp(light - 0.05, 0, 1);
    else if (event.key === "Home") light = 0;
    else if (event.key === "End") light = 1;
    else return;
    event.preventDefault();
    updateSlider(true);
  };
  slider.addEventListener("pointerdown", onSliderDown);
  slider.addEventListener("pointermove", onSliderMove);
  slider.addEventListener("pointerup", endSlider);
  slider.addEventListener("pointercancel", endSlider);
  slider.addEventListener("keydown", onSliderKey);

  function coverGeometry(w: number): { cx: number; cy: number; leafW: number; leafH: number; coverW: number; coverX: number } {
    const leafW = Math.min(286, w - 54);
    const leafH = 102;
    const cx = w * 0.5;
    const cy = 316;
    const coverW = Math.min(72, leafW * 0.28);
    return { cx, cy, leafW, leafH, coverW, coverX: cx + coverNorm * leafW * 0.31 };
  }
  function canvasPoint(event: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  const onCanvasDown = (event: PointerEvent): void => {
    if (result !== "none") return;
    const p = canvasPoint(event);
    const geo = coverGeometry(canvasW);
    if (Math.abs(p.x - geo.coverX) > geo.coverW * 0.7 || Math.abs(p.y - geo.cy) > geo.leafH * 0.72) return;
    coverDragging = true;
    coverStartNorm = coverNorm;
    safePointerCapture(canvas, event.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
  };
  const onCanvasMove = (event: PointerEvent): void => {
    if (!coverDragging) return;
    const p = canvasPoint(event);
    const geo = coverGeometry(canvasW);
    coverNorm = clamp((p.x - geo.cx) / (geo.leafW * 0.31), -0.72, 0.72);
    if (Math.abs(coverNorm - coverStartNorm) > 0.12) coverMoved = true;
  };
  const endCanvas = (): void => {
    coverDragging = false;
    canvas.classList.remove("dragging");
  };
  const onCanvasKey = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    coverNorm = clamp(coverNorm + (event.key === "ArrowRight" ? 0.1 : -0.1), -0.72, 0.72);
    coverMoved = true;
    event.preventDefault();
  };
  canvas.addEventListener("pointerdown", onCanvasDown);
  canvas.addEventListener("pointermove", onCanvasMove);
  canvas.addEventListener("pointerup", endCanvas);
  canvas.addEventListener("pointercancel", endCanvas);
  canvas.addEventListener("keydown", onCanvasKey);

  const toggleDark = (): void => {
    darkTreated = !darkTreated;
    darkBtn.classList.toggle("on", darkTreated);
    darkBtn.textContent = darkTreated ? "사전 암처리 · 함" : "사전 암처리 · 안 함";
    darkBtn.setAttribute("aria-pressed", String(darkTreated));
    result = "none";
    resultMix = 0;
    helper.innerHTML = darkTreated
      ? "기존 녹말을 줄이는 <b>사전 암처리</b>를 켰어요. 가리개를 놓고 검출해 보세요."
      : "사전 암처리를 끈 조건이에요. 잎에 이미 있던 녹말이 비교를 어떻게 흐리는지 검출해 보세요.";
    haptic(HAPTIC.select);
  };
  const detect = (): void => {
    capEl.style.opacity = "0";
    if (!coverMoved) {
      helper.innerHTML = "먼저 검은 <b>잎 가리개를 좌우로 옮겨</b> 잎 일부만 빛을 받게 해 주세요.";
      haptic(HAPTIC.wrong);
      return;
    }
    result = darkTreated ? "controlled" : "confused";
    resultMix = 0;
    haptic(HAPTIC.tap);
    if (darkTreated) {
      collect("leaf", "빛 부분만 청람색", "빛을 받은 부분에서만 녹말이 검출됐어요");
      helper.innerHTML = "빛을 받은 부분만 청람색으로 변했어요. 이제 <b>사전 암처리를 끄고</b> 같은 검출을 해 비교해 보세요.";
    } else {
      collect("confused", "기존 녹말까지 반응", "암처리를 생략하니 가린 부분도 반응해 비교가 흐려졌어요");
      helper.innerHTML = "가린 부분까지 청람색으로 변해 버렸어요. <b>기존 녹말을 먼저 줄여야</b> 빛 때문에 새로 생긴 녹말만 공정하게 비교할 수 있어요.";
    }
  };
  darkBtn.addEventListener("click", toggleDark);
  detectBtn.addEventListener("click", detect);

  function drawSensor(ctx: CanvasRenderingContext2D, w: number, tMs: number): void {
    const jarX = 18;
    const jarY = 61;
    const jarW = Math.max(104, w * 0.34);
    const jarH = 119;
    ctx.fillStyle = alphaVar("--n0", 0.06);
    roundedRect(ctx, jarX, jarY, jarW, jarH, 20);
    ctx.fill();
    ctx.strokeStyle = alphaVar("--plant-glass-hi", 0.66);
    ctx.lineWidth = 2;
    ctx.stroke();
    const plantX = jarX + jarW * 0.52;
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(plantX, jarY + jarH - 10);
    ctx.lineTo(plantX, jarY + 44);
    ctx.stroke();
    drawLeaf(ctx, plantX - 16, jarY + 70, Math.min(58, jarW * 0.42), 29, 0.22);
    drawLeaf(ctx, plantX + 18, jarY + 50, Math.min(55, jarW * 0.4), 28, -0.24);
    drawSun(ctx, 38, 43, 13 + light * 4, tMs / 5000);
    drawFlowArrow(ctx, 50, 51, jarX + 23, jarY + 18, plantColor("sun"), 2.3 + light * 2.2);
    for (let i = 0; i < 6; i++) {
      const a = tMs / 820 + i * 1.13;
      const x = jarX + 16 + ((Math.sin(a * 0.71) + 1) * 0.5) * (jarW - 32);
      const y = jarY + 25 + ((Math.cos(a) + 1) * 0.5) * (jarH - 47);
      drawMaterialToken(ctx, x, y, 4.4, i < Math.round(2 + light * 3) ? "oxygen" : "carbon");
    }

    const gx0 = jarX + jarW + 25;
    const gx1 = w - 18;
    const gy0 = 72;
    const gy1 = 177;
    ctx.strokeStyle = cssVar("--stage-line");
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    const graphLine = (color: string, direction: -1 | 1): void => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const q = i / 36;
        const x = gx0 + q * (gx1 - gx0);
        const y = (gy0 + gy1) * 0.5 - direction * light * 43 * (1 - Math.pow(1 - q, 1.8));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    graphLine(plantColor("oxygen"), 1);
    graphLine(plantColor("carbon"), -1);
    ctx.font = "750 9.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = plantColor("oxygen");
    ctx.fillText("산소", gx0 + 6, gy0 + 9);
    ctx.fillStyle = plantColor("carbon");
    ctx.fillText("이산화 탄소", gx0 + 6, gy1 - 7);
    ctx.fillStyle = cssVar("--n400");
    ctx.textAlign = "right";
    ctx.fillText("시간", gx1, gy1 + 15);
  }

  function drawLeafTest(ctx: CanvasRenderingContext2D, w: number): void {
    const geo = coverGeometry(w);
    ctx.strokeStyle = alphaVar("--plant-glass", 0.24);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, SENSOR_BOTTOM + 10);
    ctx.lineTo(w - 16, SENSOR_BOTTOM + 10);
    ctx.stroke();
    ctx.font = "750 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = cssVar("--n300");
    ctx.fillText("잎 일부 가리기 · 사전 암처리 비교", 18, SENSOR_BOTTOM + 30);

    drawLeaf(ctx, geo.cx, geo.cy, geo.leafW, geo.leafH, 0);
    if (result !== "none") {
      ctx.save();
      leafPath(ctx, geo.cx, geo.cy, geo.leafW, geo.leafH);
      ctx.clip();
      ctx.globalAlpha = resultMix;
      ctx.fillStyle = cssVar("--blue-press");
      if (result === "confused") {
        ctx.fillRect(geo.cx - geo.leafW * 0.55, geo.cy - geo.leafH, geo.leafW * 1.1, geo.leafH * 2);
      } else {
        const left = geo.coverX - geo.coverW * 0.5;
        const right = geo.coverX + geo.coverW * 0.5;
        ctx.fillRect(geo.cx - geo.leafW * 0.55, geo.cy - geo.leafH, left - (geo.cx - geo.leafW * 0.55), geo.leafH * 2);
        ctx.fillRect(right, geo.cy - geo.leafH, geo.cx + geo.leafW * 0.55 - right, geo.leafH * 2);
        ctx.fillStyle = alphaVar("--n100", 0.7);
        ctx.fillRect(left, geo.cy - geo.leafH, geo.coverW, geo.leafH * 2);
      }
      ctx.restore();
    }

    ctx.save();
    if (result === "none") {
      const coverG = ctx.createLinearGradient(geo.coverX - geo.coverW * 0.5, geo.cy - 50, geo.coverX + geo.coverW * 0.5, geo.cy + 50);
      coverG.addColorStop(0, cssVar("--n500"));
      coverG.addColorStop(0.45, cssVar("--n800"));
      coverG.addColorStop(1, cssVar("--n900"));
      ctx.fillStyle = coverG;
      ctx.strokeStyle = cssVar("--n400");
      ctx.lineWidth = 1.5;
      roundedRect(ctx, geo.coverX - geo.coverW * 0.5, geo.cy - 63, geo.coverW, 126, 9);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = alphaVar("--n0", 0.34);
      ctx.beginPath();
      ctx.moveTo(geo.coverX - geo.coverW * 0.34, geo.cy - 55);
      ctx.lineTo(geo.coverX + geo.coverW * 0.27, geo.cy - 55);
      ctx.stroke();
      ctx.fillStyle = cssVar("--n100");
      ctx.font = "800 10px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("가리개", geo.coverX, geo.cy + 4);
    } else {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = cssVar("--n300");
      ctx.lineWidth = 1.5;
      ctx.strokeRect(geo.coverX - geo.coverW * 0.5, geo.cy - 58, geo.coverW, 116);
      ctx.setLineDash([]);
    }
    ctx.restore();

    const resultText = result === "none"
      ? (darkTreated ? "암처리 뒤 일부를 가린 잎" : "암처리 없이 일부를 가린 잎")
      : result === "controlled"
        ? "빛 받은 부분만 청람색 · 가린 부분은 변화 없음"
        : "가린 부분까지 청람색 · 기존 녹말 때문에 비교 흐림";
    ctx.fillStyle = result === "confused" ? cssVar("--red") : cssVar("--n100");
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(resultText, geo.cx, 407);
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    const w = fit.w;
    canvasW = w;
    ctx.fillStyle = cssVar("--stage");
    ctx.fillRect(0, 0, w, CVH);
    if (result !== "none") resultMix = clamp(resultMix + dt * 0.025, 0, 1);
    drawSensor(ctx, w, tMs);
    drawLeafTest(ctx, w);
  });

  updateSlider(false);
  const startFrame = requestAnimationFrame(() => loop.start());
  api.setCTA("센서와 잎 비교의 세 목표를 완성해요", { enabled: false });

  return () => {
    cancelAnimationFrame(startFrame);
    window.clearTimeout(toastTimer);
    loop.stop();
    slider.removeEventListener("pointerdown", onSliderDown);
    slider.removeEventListener("pointermove", onSliderMove);
    slider.removeEventListener("pointerup", endSlider);
    slider.removeEventListener("pointercancel", endSlider);
    slider.removeEventListener("keydown", onSliderKey);
    canvas.removeEventListener("pointerdown", onCanvasDown);
    canvas.removeEventListener("pointermove", onCanvasMove);
    canvas.removeEventListener("pointerup", endCanvas);
    canvas.removeEventListener("pointercancel", endCanvas);
    canvas.removeEventListener("keydown", onCanvasKey);
    darkBtn.removeEventListener("click", toggleDark);
    detectBtn.removeEventListener("click", detect);
  };
};
