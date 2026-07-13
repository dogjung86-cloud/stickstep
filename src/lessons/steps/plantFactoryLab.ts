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
  done: boolean;
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
    el("div", { class: "pn-badge plant", dataset: { g: "inputs" } }, el("b", { text: "재료 도착" }), el("span", { text: "물·CO₂·빛" })),
    el("div", { class: "pn-badge plant", dataset: { g: "products" } }, el("b", { text: "산물 만들기" }), el("span", { text: "무엇이 생길까?" })),
    el("div", { class: "pn-badge plant", dataset: { g: "storage" } }, el("b", { text: "녹말 저장" }), el("span", { text: "포도당→녹말" })),
  );

  const makeInputButton = (kind: InputKind, label: string): HTMLButtonElement =>
    el("button", { class: "plant-btn", text: label, dataset: { act: kind }, attrs: { type: "button" } });
  const waterBtn = makeInputButton("water", "물");
  const carbonBtn = makeInputButton("carbon", "이산화 탄소");
  const lightBtn = makeInputButton("light", "빛");
  carbonBtn.disabled = true;
  carbonBtn.setAttribute("aria-disabled", "true");
  lightBtn.disabled = true;
  lightBtn.setAttribute("aria-disabled", "true");
  const reactionBtn = el("button", {
    class: "plant-btn",
    text: "광합성 시작",
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
    html: "<b>물 → 이산화 탄소 → 빛</b>의 차례로 재료와 에너지가 잎에 도착하는 모습을 확인해 보세요.",
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
    light: { started: false, done: false, p: 0 },
    carbon: { started: false, done: false, p: 0 },
    water: { started: false, done: false, p: 0 },
  };
  const buttons: Record<InputKind, HTMLButtonElement> = { light: lightBtn, carbon: carbonBtn, water: waterBtn };
  const goals = new Set<string>();
  let reactionState: 0 | 1 | 2 = 0;
  let reactionP = 0;
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
        "발견 완료! 잎은 <b>빛에너지</b>로 <b>이산화 탄소와 물</b>을 이용해 <b>포도당과 산소</b>를 만들어요. 포도당 일부는 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 잎에 저장돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function inputMessage(kind: InputKind): string {
    if (kind === "light") return "빛 알갱이가 반응 화살표 쪽으로 이동해 빛에너지를 전달해요.";
    if (kind === "carbon") return "공기 중 이산화 탄소 알갱이가 기공을 지나 잎 안으로 들어가요.";
    return "뿌리에서 올라온 물방울이 줄기의 물관을 따라 잎으로 이동해요.";
  }

  function startInput(kind: InputKind): void {
    const state = states[kind];
    if (state.started) return;
    if (kind === "carbon" && !states.water.done) return;
    if (kind === "light" && !states.carbon.done) return;
    state.started = true;
    setEnabled(buttons[kind], false);
    buttons[kind].classList.add("on");
    helper.innerHTML = inputMessage(kind);
    hideCap();
    haptic(HAPTIC.tap);
  }

  const inputHandlers: Record<InputKind, () => void> = {
    light: () => startInput("light"),
    carbon: () => startInput("carbon"),
    water: () => startInput("water"),
  };
  for (const kind of Object.keys(buttons) as InputKind[]) buttons[kind].addEventListener("click", inputHandlers[kind]);

  const onReaction = (): void => {
    if (reactionState !== 0 || !Object.values(states).every((x) => x.done)) return;
    reactionState = 1;
    setEnabled(reactionBtn, false);
    reactionBtn.classList.add("on");
    processRead.textContent = "포도당·산소 만드는 중";
    helper.innerHTML = "세 재료가 모였어요. 엽록체에서 <b>빛에너지</b>를 이용해 어떤 산물이 생기는지 지켜보세요.";
    haptic(HAPTIC.tap);
  };
  const onStorage = (): void => {
    if (storageState !== 0 || reactionState !== 2) return;
    storageState = 1;
    setEnabled(storageBtn, false);
    storageBtn.classList.add("on");
    processRead.textContent = "포도당을 녹말로 저장하는 중";
    helper.innerHTML = "포도당 여러 개를 이어 물에 잘 녹지 않는 <b>녹말</b>로 바꾸어 잎에 저장해요.";
    haptic(HAPTIC.tap);
  };
  reactionBtn.addEventListener("click", onReaction);
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

    for (const kind of Object.keys(states) as InputKind[]) {
      const state = states[kind];
      if (state.started && !state.done) {
        state.p = clamp(state.p + dt * 0.026, 0, 1);
        if (state.p >= 1) {
          state.done = true;
          materialRead.textContent = `재료 ${Object.values(states).filter((x) => x.done).length}/3`;
          if (kind === "water") {
            setEnabled(carbonBtn, true);
            processRead.textContent = "이산화 탄소 차례";
            helper.innerHTML = "잎 안에 <b>물</b> 상자가 생겼어요. 이제 공기 중 <b>이산화 탄소</b>를 기공으로 보내 보세요.";
            toast("물이 물관을 따라 잎에 도착했어요");
          } else if (kind === "carbon") {
            setEnabled(lightBtn, true);
            processRead.textContent = "빛에너지 차례";
            helper.innerHTML = "<b>이산화 탄소</b>도 잎 안에 모였어요. 마지막으로 <b>빛</b>을 반응 화살표 쪽으로 보내 보세요.";
            toast("이산화 탄소가 기공을 지나 들어왔어요");
          }
        }
      }
    }
    if (Object.values(states).every((x) => x.done) && !goals.has("inputs")) {
      collect("inputs", "물·CO₂·빛 도착", "물, 이산화 탄소, 빛에너지가 모두 모였어요");
      setEnabled(reactionBtn, true);
      processRead.textContent = "광합성 시작 가능";
      helper.innerHTML = "재료가 모두 모였어요. 이제 <b>광합성 시작</b>을 눌러 포도당과 산소를 만들어 보세요.";
    }
    if (reactionState === 1) {
      reactionP = clamp(reactionP + dt * 0.021, 0, 1);
      if (reactionP >= 1) {
        reactionState = 2;
        processRead.textContent = "포도당·산소 생성";
        collect("products", "포도당·산소", "포도당과 산소가 만들어졌어요");
        setEnabled(storageBtn, true);
        helper.innerHTML = "광합성으로 <b>포도당과 산소</b>가 만들어졌어요. 마지막으로 포도당을 저장하기 알맞은 형태로 바꿔 보세요.";
      }
    }
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
      if (!states.water.done) {
        const point = pathPoint(waterPath, states.water.p);
        drawMaterialToken(ctx, point.x, point.y, 7.5, "water");
      }
    }
    const waterBoxP = clamp((states.water.p - 0.68) / 0.32, 0, 1);
    drawTextBox(ctx, "물", waterBox.x, waterBox.y, 42, plantColor("water"), waterBoxP);

    // 2. 이산화 탄소: 여러 알갱이가 기공을 지나 잎 안으로 모인다.
    if (states.carbon.started) {
      drawPathStroke(ctx, carbonPath, plantColor("carbon"), 2.4, 0.66);
      for (let i = 0; i < 6; i++) {
        const particleP = clamp(states.carbon.p * 1.22 - i * 0.085, 0, 1);
        if (particleP <= 0 || (states.carbon.done && particleP >= 1)) continue;
        const point = pathPoint(carbonPath, particleP);
        drawMaterialToken(ctx, point.x + ((i % 2) * 5 - 2.5), point.y + ((i % 3) - 1) * 4, 4.2, "carbon");
      }
    }
    const carbonBoxP = clamp((states.carbon.p - 0.68) / 0.32, 0, 1);
    drawTextBox(ctx, "이산화 탄소", carbonBox.x, carbonBox.y, 82, plantColor("carbon"), carbonBoxP);

    const plusP = Math.min(waterBoxP, carbonBoxP);
    if (plusP > 0) label(ctx, "+", (waterBox.x + carbonBox.x) / 2, reactionY, n0);
    const reactionArrowP = states.carbon.done ? 1 : clamp((states.carbon.p - 0.74) / 0.26, 0, 1);
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
      if (!states.light.done) {
        for (let i = 0; i < 4; i++) {
          const photonP = clamp(states.light.p * 1.2 - i * 0.12, 0, 1);
          if (photonP <= 0) continue;
          const point = pathPoint(lightPath, photonP);
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
      drawPathStroke(ctx, oxygenPath, plantColor("oxygen"), 2.5, 0.68 * productP);
      for (let i = 0; i < 5; i++) {
        const oxygenP = reactionState === 1
          ? clamp(reactionP * 1.25 - i * 0.11, 0, 1)
          : (tMs / 1500 + i * 0.19) % 1;
        if (oxygenP <= 0) continue;
        const point = pathPoint(oxygenPath, oxygenP);
        drawMaterialToken(ctx, point.x, point.y, 4.6, "oxygen");
      }
    }

    if (capHidden) {
      ctx.fillStyle = alphaVar("--n0", 0.08);
      roundRectPath(ctx, 16, 384, W - 32, 31, 12);
      ctx.fill();
      const equation = storageState === 2
        ? "포도당 → 녹말로 저장"
        : reactionState === 2
          ? "빛에너지 + 이산화 탄소 + 물 → 포도당 + 산소"
          : "물과 이산화 탄소에 빛에너지가 더해져요";
      label(ctx, equation, W / 2, 400, storageState === 2 ? plantColor("starch") : n0);
    }

    ctx.fillStyle = n400;
    ctx.globalAlpha = 0.66;
    ctx.font = "650 9.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("줄기", Math.max(8, stemX - 17), stemBottomY + 12);
    ctx.globalAlpha = 1;
  });

  api.setCTA("재료를 넣고 광합성을 완성해요", { enabled: false });
  const startRaf = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(startRaf);
    window.clearTimeout(toastTimer);
    loop.stop();
    plantImage.removeEventListener("load", onPlantLoad);
    plantImage.removeEventListener("error", onPlantError);
    plantImage.src = "";
    for (const kind of Object.keys(buttons) as InputKind[]) buttons[kind].removeEventListener("click", inputHandlers[kind]);
    reactionBtn.removeEventListener("click", onReaction);
    storageBtn.removeEventListener("click", onStorage);
  };
};
