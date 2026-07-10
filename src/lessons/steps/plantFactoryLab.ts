// leafFactoryLab — 중2 V 광합성 공장 랩.
// 빛은 잎으로, 이산화 탄소는 기공으로, 물은 뿌리·물관으로 들어간다.
// 세 재료를 모두 넣은 뒤 포도당·산소를 만들고, 포도당을 녹말로 바꾸어 저장한다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import {
  drawChloroplast,
  drawFlowArrow,
  drawLeaf,
  drawMaterialToken,
  drawStoma,
  drawSun,
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

export const leafFactoryLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LeafFactoryStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "빛, 이산화 탄소, 물이 잎의 엽록체로 이동해 포도당과 산소를 만들고 녹말로 저장되는 모형",
    },
  });
  const materialRead = el("span", { text: "재료 0/3" });
  const processRead = el("span", { text: "광합성 준비 중" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "세 재료가 들어오는 길을 하나씩 확인해 보세요" });
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
    el("div", { class: "pn-badge plant", dataset: { g: "inputs" } }, el("b", { text: "재료 도착" }), el("span", { text: "빛·CO₂·물" })),
    el("div", { class: "pn-badge plant", dataset: { g: "products" } }, el("b", { text: "산물 만들기" }), el("span", { text: "무엇이 생길까?" })),
    el("div", { class: "pn-badge plant", dataset: { g: "storage" } }, el("b", { text: "녹말 저장" }), el("span", { text: "포도당의 변신" })),
  );

  const makeInputButton = (kind: InputKind, label: string): HTMLButtonElement =>
    el("button", { class: "plant-btn", text: label, dataset: { act: kind }, attrs: { type: "button" } });
  const lightBtn = makeInputButton("light", "빛 비추기");
  const carbonBtn = makeInputButton("carbon", "이산화 탄소 넣기");
  const waterBtn = makeInputButton("water", "뿌리에 물 주기");
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
    html: "<b>빛</b>은 잎으로, <b>이산화 탄소</b>는 기공으로, <b>물</b>은 뿌리와 물관을 지나 엽록체로 들어가요. 버튼을 눌러 경로를 확인해 보세요.",
  });
  host.append(
    goalChips,
    stage,
    el("div", { class: "plant-controls three" }, lightBtn, carbonBtn, waterBtn),
    el("div", { class: "plant-controls two" }, reactionBtn, storageBtn),
    helper,
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
      processRead.textContent = "녹말로 저장 완료";
      helper.innerHTML =
        "발견 완료! 엽록체는 <b>빛에너지</b>를 이용해 <b>이산화 탄소와 물</b>로 <b>포도당과 산소</b>를 만들어요. 포도당은 곧 <b>녹말</b>로 바뀌어 엽록체에 저장돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function inputMessage(kind: InputKind): string {
    if (kind === "light") return "빛이 잎에 닿아 엽록체로 전달돼요.";
    if (kind === "carbon") return "이산화 탄소가 잎의 기공을 지나 엽록체로 들어가요.";
    return "뿌리가 흡수한 물이 물관을 따라 잎의 엽록체로 올라가요.";
  }

  function startInput(kind: InputKind): void {
    const state = states[kind];
    if (state.started) return;
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
    processRead.textContent = "포도당을 녹말로 바꾸는 중";
    helper.innerHTML = "만들어진 포도당을 여러 개 이어 <b>물에 잘 녹지 않는 녹말</b>로 바꾸어 저장해요.";
    haptic(HAPTIC.tap);
  };
  reactionBtn.addEventListener("click", onReaction);
  storageBtn.addEventListener("click", onStorage);

  function drawRoute(ctx: CanvasRenderingContext2D, points: Point[], color: string, active: boolean): void {
    ctx.save();
    ctx.globalAlpha = active ? 0.72 : 0.16;
    for (let i = 1; i < points.length; i++) {
      drawFlowArrow(ctx, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, color, active ? 3.4 : 2.2);
    }
    ctx.restore();
  }

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
        }
      }
    }
    if (Object.values(states).every((x) => x.done) && !goals.has("inputs")) {
      collect("inputs", "세 길 모두 확인", "빛, 이산화 탄소, 물이 엽록체에 도착했어요");
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
    const plantX = W * 0.27;
    const leafX = W * 0.31;
    const leafY = 154;
    const soilY = 344;
    const cpX = W * 0.75;
    const cpY = 190;
    const cpRx = Math.min(72, W * 0.19);
    const cpRy = 50;
    const stomaX = W * 0.49;
    const stomaY = 108;
    const sunX = Math.max(38, W * 0.12);
    const sunY = 58;

    // 무대 바닥과 식물 본체
    const soilG = ctx.createLinearGradient(0, soilY, 0, CVH);
    soilG.addColorStop(0, `${plantColor("soil")}CC`);
    soilG.addColorStop(1, plantColor("soil"));
    ctx.fillStyle = soilG;
    ctx.fillRect(0, soilY, W, CVH - soilY);
    ctx.fillStyle = alphaVar("--n0", 0.08);
    for (let i = 0; i < 18; i++) {
      const x = ((i * 47) % Math.max(1, W - 10)) + 5;
      const y = soilY + 10 + ((i * 29) % 65);
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(plantX, soilY + 16);
    ctx.quadraticCurveTo(plantX - 5, 245, leafX, leafY + 18);
    ctx.stroke();
    ctx.strokeStyle = plantColor("xylem");
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(plantX - 2, soilY + 12);
    ctx.quadraticCurveTo(plantX - 7, 245, leafX - 2, leafY + 16);
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (const dir of [-1, 1]) {
      ctx.strokeStyle = plantColor("leafLo");
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(plantX, soilY + 4);
      ctx.quadraticCurveTo(plantX + dir * 28, soilY + 28, plantX + dir * 55, soilY + 42);
      ctx.stroke();
    }
    drawLeaf(ctx, leafX, leafY, Math.min(150, W * 0.42), 78, -0.12);
    drawLeaf(ctx, plantX - 28, 238, Math.min(90, W * 0.26), 48, 0.35, 0.9);

    // 확대된 기공과 엽록체
    ctx.strokeStyle = alphaVar("--n0", 0.18);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(leafX + 45, leafY - 24);
    ctx.lineTo(stomaX - 17, stomaY + 12);
    ctx.moveTo(leafX + 48, leafY + 8);
    ctx.lineTo(cpX - cpRx, cpY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = alphaVar("--n0", 0.06);
    roundRectPath(ctx, stomaX - 38, stomaY - 38, 76, 76, 18);
    ctx.fill();
    drawStoma(ctx, stomaX, stomaY, 35, states.carbon.started ? 1 : 0.35);
    label(ctx, "기공", stomaX, stomaY + 34, n100);
    ctx.fillStyle = alphaVar("--n0", 0.06);
    ctx.beginPath();
    ctx.ellipse(cpX, cpY, cpRx + 17, cpRy + 17, -0.08, 0, Math.PI * 2);
    ctx.fill();
    drawChloroplast(ctx, cpX, cpY, cpRx, cpRy, -0.08);
    label(ctx, "엽록체", cpX, cpY - cpRy - 24, n100);
    label(ctx, "물관", plantX + 12, 274, plantColor("water"), "left");

    // 세 재료의 경로
    drawSun(ctx, sunX, sunY, 20, tMs / 5000);
    const lightPath: Point[] = [
      { x: sunX + 18, y: sunY + 20 },
      { x: leafX - 35, y: leafY - 28 },
      { x: cpX - cpRx * 0.55, y: cpY - cpRy * 0.48 },
    ];
    const carbonPath: Point[] = [
      { x: W - 14, y: 82 },
      { x: stomaX + 7, y: stomaY },
      { x: leafX + 40, y: leafY - 3 },
      { x: cpX - cpRx * 0.72, y: cpY - 4 },
    ];
    const waterPath: Point[] = [
      { x: plantX - 2, y: CVH - 19 },
      { x: plantX - 2, y: soilY + 4 },
      { x: plantX - 5, y: 248 },
      { x: leafX + 5, y: leafY + 18 },
      { x: cpX - cpRx * 0.6, y: cpY + cpRy * 0.45 },
    ];
    drawRoute(ctx, lightPath, plantColor("sun"), states.light.started);
    drawRoute(ctx, carbonPath, plantColor("carbon"), states.carbon.started);
    drawRoute(ctx, waterPath, plantColor("water"), states.water.started);

    if (states.light.started && reactionP === 0) {
      const p = pathPoint(lightPath, states.light.done ? (0.75 + (tMs / 900) % 0.25) : states.light.p);
      ctx.save();
      ctx.shadowColor = plantColor("sun");
      ctx.shadowBlur = 12;
      ctx.fillStyle = plantColor("sun");
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (states.carbon.started && reactionP === 0) {
      const p = pathPoint(carbonPath, states.carbon.done ? (0.76 + (tMs / 1050) % 0.24) : states.carbon.p);
      drawMaterialToken(ctx, p.x, p.y, 7.5, "carbon", "CO₂");
    }
    if (states.water.started && reactionP === 0) {
      const p = pathPoint(waterPath, states.water.done ? (0.74 + (tMs / 980) % 0.26) : states.water.p);
      drawMaterialToken(ctx, p.x, p.y, 7.5, "water", "물");
    }
    label(ctx, "빛", sunX, sunY + 39, plantColor("sun"));
    label(ctx, "이산화 탄소", W - 12, 61, plantColor("carbon"), "right");
    label(ctx, "물", plantX + 15, CVH - 18, plantColor("water"), "left");

    // 산물 생성: 포도당은 엽록체 안, 산소는 기공 밖으로 이동한다.
    if (reactionP > 0) {
      ctx.save();
      ctx.globalAlpha = reactionP;
      ctx.shadowColor = plantColor("glucose");
      ctx.shadowBlur = 10 * reactionP;
      drawMaterialToken(ctx, cpX - 18, cpY + 5, 12, "glucose", "당");
      ctx.restore();
      const oxygenOut: Point[] = [...carbonPath].reverse();
      drawRoute(ctx, oxygenOut, plantColor("oxygen"), true);
      for (let i = 0; i < 3; i++) {
        const t = reactionState === 1
          ? clamp(reactionP - i * 0.17, 0, 1)
          : (tMs / 1500 + i * 0.31) % 1;
        const p = pathPoint(oxygenOut, t);
        drawMaterialToken(ctx, p.x, p.y, 7, "oxygen", "O₂");
      }
      label(ctx, "포도당", cpX - 18, cpY + 30, plantColor("glucose"));
      label(ctx, "산소 방출", W - 12, 126, plantColor("oxygen"), "right");
    }

    // 녹말 저장: 포도당 한 알이 여러 포도당 단위가 이어진 녹말 사슬로 바뀌는 모형.
    if (storageP > 0) {
      const chainY = cpY + 14;
      const count = Math.max(1, Math.round(storageP * 5));
      ctx.save();
      ctx.globalAlpha = storageP;
      for (let i = 0; i < count; i++) {
        const x = cpX - 34 + i * 17;
        if (i > 0) {
          ctx.strokeStyle = plantColor("starch");
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x - 12, chainY);
          ctx.lineTo(x - 5, chainY);
          ctx.stroke();
        }
        drawMaterialToken(ctx, x, chainY, 7, "starch");
      }
      ctx.restore();
      label(ctx, "녹말로 저장", cpX, cpY + cpRy + 28, plantColor("starch"));
    }

    // 하단 반응식 띠
    ctx.fillStyle = alphaVar("--n0", 0.07);
    roundRectPath(ctx, 16, 378, W - 32, 35, 12);
    ctx.fill();
    const equation = storageState === 2
      ? "빛에너지: 이산화 탄소 + 물  →  포도당 + 산소  →  녹말 저장"
      : reactionState === 2
        ? "빛에너지: 이산화 탄소 + 물  →  포도당 + 산소"
        : "빛에너지와 재료를 엽록체에 모아요";
    label(ctx, equation, W / 2, 396, storageState === 2 ? plantColor("starch") : n0);

    // 무대를 너무 밝게 덮지 않는 얇은 안내선
    ctx.fillStyle = n400;
    ctx.globalAlpha = 0.72;
    ctx.font = "650 9.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("뿌리", plantX - 58, soilY + 47);
    ctx.globalAlpha = 1;
  });

  api.setCTA("재료를 넣고 광합성을 완성해요", { enabled: false });
  const startRaf = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(startRaf);
    window.clearTimeout(toastTimer);
    loop.stop();
    for (const kind of Object.keys(buttons) as InputKind[]) buttons[kind].removeEventListener("click", inputHandlers[kind]);
    reactionBtn.removeEventListener("click", onReaction);
    storageBtn.removeEventListener("click", onStorage);
  };
};
