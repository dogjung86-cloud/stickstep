// leafFactoryLab — 중2 V 광합성 공장 랩.
// 빛은 잎으로, 이산화 탄소는 기공으로, 물은 뿌리·물관으로 들어간다.
// 세 재료를 모두 넣은 뒤 포도당·산소를 만들고, 포도당을 녹말로 바꾸어 저장한다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import {
  drawFlowArrow,
  drawLeaf,
  drawMaterialToken,
  drawStoma,
  drawSun,
  plantAsset,
  plantColor,
} from "../../ui/plantKit";
import type { StepRenderer } from "../types";

interface LeafFactoryStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type InputKind = "light" | "carbon" | "water";
interface InputState {
  started: boolean;
  p: number;
}
interface Point {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CVH = 430;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function alphaVar(name: string, alpha: number): string {
  return `color-mix(in srgb, ${cssVar(name)} ${alpha * 100}%, transparent)`;
}

function pathPoint(points: Point[], tRaw: number): Point {
  const t = clamp(tRaw, 0, 1);
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(d);
    total += d;
  }
  let target = t * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const q = lengths[i] > 0 ? target / lengths[i] : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * q,
        y: points[i].y + (points[i + 1].y - points[i].y) * q,
      };
    }
    target -= lengths[i];
  }
  return points[points.length - 1];
}

function diagramImageRect(width: number, image: HTMLImageElement): Rect {
  const naturalW = image.naturalWidth || 960;
  const naturalH = image.naturalHeight || 960;
  const maxW = Math.min(356, Math.max(300, width - 12));
  const maxH = 350;
  const scale = Math.min(maxW / naturalW, maxH / naturalH);
  const w = naturalW * scale;
  const h = naturalH * scale;
  return { x: (width - w) / 2, y: 38, w, h };
}

function smoothstep(value: number): number {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawPathStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawTextBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  width: number,
  accent: string,
  progress: number,
): void {
  const p = smoothstep(progress);
  if (p <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.84 + p * 0.16, 0.84 + p * 0.16);
  ctx.globalAlpha = p;
  ctx.shadowColor = alphaVar("--n900", 0.2);
  ctx.shadowBlur = 9;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = alphaVar("--n0", 0.94);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.4;
  roundRectPath(ctx, -width / 2, -14, width, 28, 14);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.stroke();
  ctx.fillStyle = cssVar("--n800");
  ctx.font = "800 10.5px Pretendard, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0.5);
  ctx.restore();
}

export const leafFactoryLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LeafFactoryStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "물과 이산화 탄소에 빛에너지가 더해져 포도당과 산소가 만들어지고, 포도당이 녹말로 저장되는 모형",
    },
  });
  const materialRead = el("span", { text: "재료 0/3" });
  const processRead = el("span", { text: "광합성 준비 중" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "먼저 물을 눌러 물관을 따라가는 길을 확인해 보세요" });
  const stage = el(
    "div",
    { class: "stage plant-stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--subj-plant)" }), materialRead),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:var(--plant-glucose)" }), processRead),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge plant", dataset: { g: "products" } }, el("b", { text: "반응로 가동" }), el("span", { text: "물·CO₂+빛" })),
    el("div", { class: "pn-badge plant", dataset: { g: "lightOnly" } }, el("b", { text: "빛만 켜기" }), el("span", { text: "재료일까?" })),
    el("div", { class: "pn-badge plant", dataset: { g: "storage" } }, el("b", { text: "녹말 저장" }), el("span", { text: "포도당→녹말" })),
  );

  const makeInputButton = (kind: InputKind, label: string): HTMLButtonElement =>
    el("button", {
      class: "plant-btn",
      text: label + " · 닫힘",
      dataset: { act: kind, label },
      attrs: { type: "button", "aria-pressed": "false" },
    });
  const waterBtn = makeInputButton("water", "물관");
  const carbonBtn = makeInputButton("carbon", "기공 CO₂");
  const lightBtn = makeInputButton("light", "빛");
  const reactionBtn = el("button", {
    class: "plant-btn",
    text: "반응로 · 재료를 감지해 자동 작동",
    dataset: { act: "reaction" },
    attrs: { type: "button", disabled: true, "aria-disabled": "true" },
  });
  const storageBtn = el("button", {
    class: "plant-btn",
    text: "포도당을 녹말로 저장",
    dataset: { act: "storage" },
    attrs: { type: "button", disabled: true, "aria-disabled": "true" },
  });
  reactionBtn.disabled = true;
  storageBtn.disabled = true;

  const helper = el("div", {
    class: "helper",
    html: "<b>물관·기공 CO₂ 밸브</b>와 <b>빛 스위치</b>를 자유롭게 열고 닫아 보세요. 무엇을 끊으면 생성이 멈추는지 반응로에서 바로 확인할 수 있어요.",
  });
  host.append(
    goalChips,
    helper, // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
    stage,
    el("div", { class: "plant-controls three leaf-factory-inputs" }, waterBtn, carbonBtn, lightBtn),
    el("div", { class: "plant-controls two leaf-factory-actions" }, reactionBtn, storageBtn),
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  const states: Record<InputKind, InputState> = {
    light: { started: false, p: 0 },
    carbon: { started: false, p: 0 },
    water: { started: false, p: 0 },
  };
  const buttons: Record<InputKind, HTMLButtonElement> = { light: lightBtn, carbon: carbonBtn, water: waterBtn };
  const goals = new Set<string>();
  let reactionP = 0;
  let lightOnlyMs = 0;
  let storageState: 0 | 1 | 2 = 0;
  let storageP = 0;
  let finished = false;
  let capHidden = false;
  let toastTimer = 0;
  let plantReady = false;
  let plantFailed = false;
  let plantAlpha = 0.96;
  const plantImage = new Image();
  const onPlantLoad = (): void => { plantReady = true; };
  const onPlantError = (): void => { plantFailed = true; };
  plantImage.addEventListener("load", onPlantLoad);
  plantImage.addEventListener("error", onPlantError);
  plantImage.src = plantAsset("labs/leaf-factory-diagram-v2.webp");

  function toast(message: string): void {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function hideCap(): void {
    if (capHidden) return;
    capHidden = true;
    capEl.style.transition = "opacity .35s var(--ease)";
    capEl.style.opacity = "0";
  }

  function setEnabled(button: HTMLButtonElement, enabled: boolean): void {
    button.disabled = !enabled;
    button.setAttribute("aria-disabled", String(!enabled));
  }

  function collect(id: string, subText: string, message: string): void {
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
      processRead.textContent = "녹말 저장 완료";
      helper.innerHTML =
        "발견 완료! <b>빛은 반응을 움직이는 에너지</b>이고, 실제 재료는 <b>이산화 탄소와 물</b>이에요. 셋이 함께 있을 때만 포도당과 산소가 생기며, 포도당 일부는 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 잎에 저장돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function toggleInput(kind: InputKind): void {
    const state = states[kind];
    state.started = !state.started;
    state.p = state.started ? 1 : 0;
    const button = buttons[kind];
    const label = button.dataset.label ?? "공급";
    button.textContent = label + (state.started ? " · 열림" : " · 닫힘");
    button.classList.toggle("on", state.started);
    button.setAttribute("aria-pressed", String(state.started));
    const activeCount = Object.values(states).filter((item) => item.started).length;
    materialRead.textContent = "공급 " + String(activeCount) + "/3";
    if (state.started) {
      helper.innerHTML = kind === "light"
        ? "빛에너지가 반응로에 닿아요. 이제 <b>물과 이산화 탄소가 실제 재료인지</b> 밸브를 열고 닫아 확인해 보세요."
        : kind === "carbon"
          ? "기공이 열려 이산화 탄소가 들어와요. 반응이 시작되려면 <b>물과 빛에너지</b>도 함께 필요해요."
          : "물관이 열려 물이 들어와요. 반응이 시작되려면 <b>이산화 탄소와 빛에너지</b>도 함께 필요해요.";
    } else {
      helper.innerHTML = label + " 공급을 끊었어요. <b>반응로의 생성이 멈추는지</b> 바로 확인해 보세요.";
    }
    hideCap();
    haptic(HAPTIC.tap);
  }

  const inputHandlers: Record<InputKind, () => void> = {
    light: () => toggleInput("light"),
    carbon: () => toggleInput("carbon"),
    water: () => toggleInput("water"),
  };
  for (const kind of Object.keys(buttons) as InputKind[]) buttons[kind].addEventListener("click", inputHandlers[kind]);

  const onStorage = (): void => {
    if (storageState !== 0 || reactionP < 0.62) return;
    storageState = 1;
    setEnabled(storageBtn, false);
    storageBtn.classList.add("on");
    processRead.textContent = "포도당을 녹말로 저장하는 중";
    helper.innerHTML = "포도당 여러 개를 이어 물에 잘 녹지 않는 <b>녹말</b>로 바꾸어 잎에 저장해요.";
    haptic(HAPTIC.tap);
  };
  storageBtn.addEventListener("click", onStorage);

  function label(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = cssVar("--n0"),
    align: CanvasTextAlign = "center",
  ): void {
    ctx.fillStyle = color;
    ctx.font = "750 11px Pretendard, sans-serif";
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  let W = 340;
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    W = fit.w;

    const allOn = states.water.started && states.carbon.started && states.light.started;
    const lightOnly = goals.has("products") && states.light.started && !states.water.started && !states.carbon.started;
    reactionBtn.classList.toggle("on", allOn);
    reactionBtn.textContent = allOn ? "반응로 · 포도당과 산소 생성 중" : "반응로 · 재료가 부족해 멈춤";
    if (allOn) {
      reactionP = clamp(reactionP + dt * 0.016, 0, 1);
      processRead.textContent = "포도당·산소 생성 중";
      if (reactionP >= 0.62 && !goals.has("products")) {
        collect("products", "포도당·산소 생성", "물과 이산화 탄소에 빛에너지가 더해져 산물이 생겼어요");
        setEnabled(storageBtn, true);
        helper.innerHTML = "반응로가 가동됐어요. 이제 <b>물관과 기공 CO₂를 모두 닫고 빛만 남겨</b> 빛이 재료인지 확인해 보세요.";
      }
    } else {
      processRead.textContent = states.light.started ? "생성 멈춤 · 재료 부족" : "생성 멈춤 · 빛 꺼짐";
    }
    if (lightOnly) {
      lightOnlyMs += dt * 16.7;
      if (lightOnlyMs > 420) {
        collect("lightOnly", "생성 0 · 빛은 에너지", "빛만으로는 산물이 생기지 않아요");
        helper.innerHTML = "확인했어요. <b>빛은 재료가 아니라 에너지</b>예요. 만들어 둔 포도당을 녹말로 저장해 보세요.";
      }
    } else lightOnlyMs = 0;
    if (storageState === 1) {
      storageP = clamp(storageP + dt * 0.022, 0, 1);
      if (storageP >= 1) {
        storageState = 2;
        collect("storage", "포도당→녹말", "포도당이 녹말로 바뀌어 저장됐어요");
      }
    }

    const n0 = cssVar("--n0");
    const n100 = cssVar("--n100");
    const n400 = cssVar("--n400");
    const artRect = diagramImageRect(W, plantImage);
    const stemX = artRect.x + artRect.w * 0.075;
    const stemBottomY = artRect.y + artRect.h * 0.95;
    const stemJointY = artRect.y + artRect.h * 0.58;
    const leafBase: Point = { x: artRect.x + artRect.w * 0.2, y: artRect.y + artRect.h * 0.55 };
    const reactionY = artRect.y + artRect.h * 0.43;
    const waterBox: Point = { x: artRect.x + artRect.w * 0.35, y: reactionY };
    const carbonBox: Point = { x: artRect.x + artRect.w * 0.58, y: reactionY };
    const arrowStart: Point = { x: artRect.x + artRect.w * 0.69, y: reactionY };
    const arrowEnd: Point = { x: artRect.x + artRect.w * 0.78, y: reactionY };
    const outputX = artRect.x + artRect.w * 0.88;
    const glucoseY = reactionY - 18;
    const oxygenY = reactionY + 22;
    const stomaX = artRect.x + artRect.w * 0.91;
    const stomaY = artRect.y + artRect.h * 0.66;
    const sunX = artRect.x + artRect.w * 0.58;
    const sunY = 48;
    const waterPath: Point[] = [
      { x: stemX + 3, y: stemBottomY },
      { x: stemX + 3, y: stemJointY },
      leafBase,
      { x: waterBox.x - 12, y: waterBox.y + 18 },
      waterBox,
    ];
    const carbonPath: Point[] = [
      { x: W - 7, y: stomaY + 46 },
      { x: stomaX + 3, y: stomaY },
      { x: carbonBox.x + 24, y: carbonBox.y + 18 },
      carbonBox,
    ];
    const lightTarget: Point = { x: (arrowStart.x + arrowEnd.x) / 2, y: reactionY - 2 };
    const lightPath: Point[] = [
      { x: sunX, y: sunY + 20 },
      { x: sunX + 7, y: artRect.y + artRect.h * 0.25 },
      { x: lightTarget.x, y: lightTarget.y - 22 },
      lightTarget,
    ];
    const oxygenPath: Point[] = [
      { x: outputX, y: oxygenY + 12 },
      { x: stomaX, y: stomaY },
      { x: W - 7, y: stomaY + 42 },
    ];
    const anyInputStarted = Object.values(states).some((state) => state.started);
    const targetPlantAlpha = anyInputStarted ? 0.62 : 0.96;
    plantAlpha += (targetPlantAlpha - plantAlpha) * Math.min(1, dt * 0.012);

    // 발주한 잎·줄기는 질감만 담당한다. 판정되는 경로와 라벨은 아래 코드 오버레이다.
    if (plantReady) {
      ctx.save();
      ctx.globalAlpha = plantAlpha;
      ctx.drawImage(plantImage, artRect.x, artRect.y, artRect.w, artRect.h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = plantFailed ? plantAlpha : plantAlpha * 0.72;
      ctx.strokeStyle = plantColor("leafLo");
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(stemX, stemBottomY);
      ctx.lineTo(stemX, stemJointY);
      ctx.lineTo(leafBase.x, leafBase.y);
      ctx.stroke();
      drawLeaf(ctx, artRect.x + artRect.w * 0.62, artRect.y + artRect.h * 0.43, artRect.w * 0.72, artRect.h * 0.48, -0.03);
      ctx.restore();
    }

    // 잎 안 반응 영역과 물관 통로.
    ctx.fillStyle = alphaVar("--n0", anyInputStarted ? 0.13 : 0.07);
    ctx.strokeStyle = alphaVar("--n0", anyInputStarted ? 0.24 : 0.13);
    ctx.lineWidth = 1.2;
    roundRectPath(
      ctx,
      artRect.x + artRect.w * 0.26,
      artRect.y + artRect.h * 0.31,
      artRect.w * 0.7,
      artRect.h * 0.43,
      20,
    );
    ctx.fill();
    ctx.stroke();

    drawPathStroke(ctx, waterPath.slice(0, 3), alphaVar("--n900", 0.5), 7, 0.42);
    drawPathStroke(ctx, waterPath.slice(0, 3), plantColor("xylem"), 3.1, states.water.started ? 0.96 : 0.58);
    label(ctx, "물관", stemX + 23, artRect.y + artRect.h * 0.79, plantColor("water"), "left");

    ctx.fillStyle = alphaVar("--n0", 0.12);
    roundRectPath(ctx, stomaX - 24, stomaY - 23, 48, 46, 15);
    ctx.fill();
    drawStoma(ctx, stomaX, stomaY, 22, states.carbon.started ? 1 : 0.34);
    label(ctx, "기공", stomaX, stomaY + 29, n100);

    // 1. 물: 물관을 따라 올라온 물방울이 잎 안의 같은 크기 상자로 바뀐다.
    if (states.water.started) {
      drawPathStroke(ctx, waterPath, plantColor("water"), 2.8, 0.82);
      for (let i = 0; i < 3; i++) {
        const point = pathPoint(waterPath, (tMs / 1650 + i * 0.32) % 1);
        drawMaterialToken(ctx, point.x, point.y, 7.5, "water");
      }
    }
    const waterBoxP = clamp((states.water.p - 0.68) / 0.32, 0, 1);
    drawTextBox(ctx, "물", waterBox.x, waterBox.y, 42, plantColor("water"), waterBoxP);

    // 2. 이산화 탄소: 여러 알갱이가 기공을 지나 잎 안으로 모인다.
    if (states.carbon.started) {
      drawPathStroke(ctx, carbonPath, plantColor("carbon"), 2.4, 0.66);
      for (let i = 0; i < 6; i++) {
        const particleP = (tMs / 1500 + i * 0.16) % 1;
        const point = pathPoint(carbonPath, particleP);
        drawMaterialToken(ctx, point.x + ((i % 2) * 5 - 2.5), point.y + ((i % 3) - 1) * 4, 4.2, "carbon");
      }
    }
    const carbonBoxP = clamp((states.carbon.p - 0.68) / 0.32, 0, 1);
    drawTextBox(ctx, "이산화 탄소", carbonBox.x, carbonBox.y, 82, plantColor("carbon"), carbonBoxP);

    const plusP = Math.min(waterBoxP, carbonBoxP);
    if (plusP > 0) label(ctx, "+", (waterBox.x + carbonBox.x) / 2, reactionY, n0);
    const reactionArrowP = allOn ? 1 : 0;
    if (reactionArrowP > 0) {
      ctx.save();
      ctx.globalAlpha = smoothstep(reactionArrowP);
      drawFlowArrow(ctx, arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y, n100, 3);
      ctx.restore();
    }

    // 3. 빛: 태양에서 나온 빛 알갱이가 반응 화살표에 에너지를 공급한다.
    drawSun(ctx, sunX, sunY, 17, tMs / 5000);
    label(ctx, "빛", sunX, sunY + 31, plantColor("sun"));
    if (states.light.started) {
      drawPathStroke(ctx, lightPath, plantColor("sun"), 2.6, 0.72);
      for (let i = 0; i < 4; i++) {
        const point = pathPoint(lightPath, (tMs / 1250 + i * 0.23) % 1);
        ctx.save();
        ctx.shadowColor = plantColor("sun");
        ctx.shadowBlur = 10;
        ctx.fillStyle = plantColor("sun");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    const lightBoxP = clamp((states.light.p - 0.68) / 0.32, 0, 1);
    drawTextBox(ctx, "빛에너지", lightTarget.x, reactionY - 39, 64, plantColor("sun"), lightBoxP);

    // 광합성 시작: 오른쪽에 산물 상자가 생기고 산소 알갱이는 기공 밖으로 나간다.
    if (reactionP > 0) {
      const productP = clamp(reactionP * 1.35, 0, 1);
      const starchMorph = clamp((storageP - 0.08) / 0.42, 0, 1);
      drawTextBox(ctx, "포도당", outputX, glucoseY, 60, plantColor("glucose"), productP * (1 - starchMorph));
      drawTextBox(ctx, "녹말", outputX, glucoseY, 52, plantColor("starch"), starchMorph);
      if (storageP > 0.08) label(ctx, "저장", outputX, glucoseY - 24, plantColor("starch"));
      if (productP > 0) label(ctx, "+", outputX, reactionY + 1, n0);
      drawTextBox(ctx, "산소", outputX, oxygenY, 46, plantColor("oxygen"), productP);
      drawPathStroke(ctx, oxygenPath, plantColor("oxygen"), 2.5, (allOn ? 0.68 : 0.08) * productP);
      if (allOn) {
        for (let i = 0; i < 5; i++) {
          const point = pathPoint(oxygenPath, (tMs / 1500 + i * 0.19) % 1);
          drawMaterialToken(ctx, point.x, point.y, 4.6, "oxygen");
        }
      }
    }

    if (capHidden) {
      ctx.fillStyle = alphaVar("--n0", 0.08);
      roundRectPath(ctx, 16, 384, W - 32, 31, 12);
      ctx.fill();
      const equation = storageState === 2
        ? "포도당 → 녹말로 저장"
        : allOn
          ? "빛에너지 + 이산화 탄소 + 물 → 포도당 + 산소"
          : states.light.started && !states.water.started && !states.carbon.started
            ? "빛만으로는 포도당과 산소가 생기지 않아요"
            : "물·이산화 탄소·빛이 모두 있어야 해요";
      label(ctx, equation, W / 2, 400, storageState === 2 ? plantColor("starch") : n0);
    }

    ctx.fillStyle = n400;
    ctx.globalAlpha = 0.66;
    ctx.font = "650 9.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("줄기", Math.max(8, stemX - 17), stemBottomY + 12);
    ctx.globalAlpha = 1;
  });

  api.setCTA("밸브와 빛을 조작해 세 목표를 완성해요", { enabled: false });
  const startRaf = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(startRaf);
    window.clearTimeout(toastTimer);
    loop.stop();
    plantImage.removeEventListener("load", onPlantLoad);
    plantImage.removeEventListener("error", onPlantError);
    plantImage.src = "";
    for (const kind of Object.keys(buttons) as InputKind[]) buttons[kind].removeEventListener("click", inputHandlers[kind]);
    storageBtn.removeEventListener("click", onStorage);
  };
};
