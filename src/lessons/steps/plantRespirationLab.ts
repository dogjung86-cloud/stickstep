// plantRespirationLab — 중2 V 식물의 호흡과 광합성·호흡 관계 조작 랩.
// 포도당·산소를 마이토콘드리아에 넣어 호흡 산물을 확인하고,
// 시간 다이얼로 낮과 밤을 돌려 두 과정의 실제 진행과 순기체 출입을 구분한다.

import { clamp, el } from "../../core/dom";
import { createLoop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
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
import "../../styles/plant.css";

interface PlantLabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type RespireInput = "glucose" | "oxygen";
type RespirePhase = "loading" | "running" | "done";

const RESP_H = 360;
const CYCLE_H = 350;
const TAU = Math.PI * 2;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 800,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = String(weight) + " " + String(size) + "px Pretendard, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  color: string,
  width: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.94;
  roundedRect(ctx, x - width * 0.5, y - 13, width, 26, 13);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.globalAlpha = 1;
  drawCenteredText(ctx, text, x, y + 0.5, 11.5, color);
  ctx.restore();
}

function drawMitochondrion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  pulse: number,
  active: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.09);
  ctx.shadowColor = plantColor("glucose");
  ctx.shadowBlur = 8 + 13 * active + 3 * pulse;

  const outer = ctx.createLinearGradient(-rx, -ry, rx, ry);
  outer.addColorStop(0, plantColor("starch"));
  outer.addColorStop(0.52, plantColor("glucose"));
  outer.addColorStop(1, plantColor("sun"));
  ctx.fillStyle = outer;
  ctx.strokeStyle = cssVar("--n0");
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.88;
  ctx.strokeStyle = cssVar("--subj-plant-press");
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx - 7, ry - 7, 0, 0, TAU);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = -3; i <= 3; i += 1) {
    const yy = i * ry * 0.18;
    const wiggle = 4 + active * 3;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.68, yy);
    ctx.bezierCurveTo(-rx * 0.38, yy - wiggle, -rx * 0.2, yy + wiggle, 0, yy);
    ctx.bezierCurveTo(rx * 0.2, yy - wiggle, rx * 0.38, yy + wiggle, rx * 0.68, yy);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.5 + 0.35 * active;
  const hi = ctx.createRadialGradient(-rx * 0.4, -ry * 0.45, 1, -rx * 0.25, -ry * 0.25, rx * 0.8);
  hi.addColorStop(0, cssVar("--n0"));
  hi.addColorStop(1, plantColor("starch"));
  ctx.fillStyle = hi;
  ctx.beginPath();
  ctx.ellipse(-rx * 0.24, -ry * 0.26, rx * 0.42, ry * 0.22, -0.08, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawEnergyBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  phase: number,
  alpha: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(phase * 0.22);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = plantColor("sun");
  ctx.fillStyle = plantColor("sun");
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * TAU;
    const inner = radius * (0.58 + 0.08 * Math.sin(phase + i));
    const outer = radius * (0.95 + 0.1 * Math.sin(phase * 1.4 + i));
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-4, -13);
  ctx.lineTo(7, -13);
  ctx.lineTo(1, -1);
  ctx.lineTo(10, -1);
  ctx.lineTo(-7, 16);
  ctx.lineTo(-2, 4);
  ctx.lineTo(-11, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export const plantRespireLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlantLabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el(
      "div",
      { class: "pn-badge plant", dataset: { g: "glucose" } },
      el("b", { text: "포도당 넣기" }),
      el("span", { text: "양분을 가져와요" }),
    ),
    el(
      "div",
      { class: "pn-badge plant", dataset: { g: "oxygen" } },
      el("b", { text: "산소 넣기" }),
      el("span", { text: "공기에서 가져와요" }),
    ),
    el(
      "div",
      { class: "pn-badge plant", dataset: { g: "energy" } },
      el("b", { text: "호흡 작동" }),
      el("span", { text: "산물과 에너지 확인" }),
    ),
  );

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: "height:" + String(RESP_H) + "px",
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "포도당과 산소를 마이토콘드리아로 끌어 넣고 호흡 시작 버튼을 누르는 실험",
    },
  });
  const statePill = el("span", { text: "재료를 기다려요" });
  const energyPill = el("span", { text: "생명활동 에너지 0" });
  const cap = el("div", { class: "stage-cap", text: "아래 재료를 가운데 마이토콘드리아로 끌어 보세요" });
  const stage = el(
    "div",
    { class: "stage plant-stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el(
        "div",
        { class: "pill" },
        el("span", { class: "pdot", style: "background:var(--plant-glucose)" }),
        statePill,
      ),
      el(
        "div",
        { class: "pill" },
        el("span", { class: "pdot", style: "background:var(--plant-sun)" }),
        energyPill,
      ),
    ),
    cap,
  );

  const glucoseBtn = el("button", {
    class: "plant-btn",
    text: "포도당 넣기",
    attrs: { type: "button" },
  });
  const oxygenBtn = el("button", {
    class: "plant-btn",
    text: "산소 넣기",
    attrs: { type: "button" },
  });
  const inputControls = el("div", { class: "plant-controls two" }, glucoseBtn, oxygenBtn);
  const startBtn = el("button", {
    class: "plant-btn",
    text: "호흡 시작",
    attrs: { type: "button", disabled: true },
    style: "width:100%;opacity:.5",
  });
  const equation = el(
    "div",
    { class: "plant-readout", attrs: { "aria-live": "polite" } },
    el("span", { html: "<b>포도당 + 산소</b>" }),
    el("span", { text: "마이토콘드리아로 넣어요" }),
  );
  const helper = el("div", {
    class: "helper",
    html: "식물은 <b>포도당에 저장된 에너지를 생명활동에 바로 쓸 수는 없어요</b>. 포도당과 산소를 마이토콘드리아에 넣어 생명활동에 쓸 에너지를 꺼내 보세요.",
  });
  host.append(goalChips, stage, inputControls, startBtn, equation, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const loaded: Record<RespireInput, boolean> = { glucose: false, oxygen: false };
  const goals = new Set<string>();
  let finished = false;
  let phase: RespirePhase = "loading";
  let reaction = 0;
  let canvasW = 340;
  let drag: { kind: RespireInput; x: number; y: number; moved: boolean; sx: number; sy: number } | null = null;
  let selected: RespireInput = "glucose";
  let a11yTick = 0;

  function collect(id: "glucose" | "oxygen" | "energy", sub: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector('[data-g="' + id + '"]') as HTMLElement | null;
    chip?.classList.add("on");
    const detail = chip?.querySelector("span");
    if (detail) detail.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "<b>식물의 호흡</b>은 포도당과 산소를 이용하면 이산화 탄소와 물이 생기고, 그 과정에서 생명활동에 쓸 에너지를 얻는 과정이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "낮과 밤 비교하기");
    }
  }

  function updateControls(): void {
    glucoseBtn.classList.toggle("on", loaded.glucose);
    oxygenBtn.classList.toggle("on", loaded.oxygen);
    glucoseBtn.textContent = loaded.glucose ? "포도당 투입 완료" : "포도당 넣기";
    oxygenBtn.textContent = loaded.oxygen ? "산소 투입 완료" : "산소 넣기";
    const ready = loaded.glucose && loaded.oxygen && phase === "loading";
    startBtn.disabled = !ready;
    startBtn.style.opacity = ready ? "1" : ".5";

    if (phase === "done") {
      statePill.textContent = "호흡 완료";
      energyPill.textContent = "생명활동 에너지 확보";
      equation.innerHTML =
        "<span><b>포도당 + 산소</b></span><span><b>이산화 탄소 + 물 + 에너지</b></span>";
      return;
    }
    if (phase === "running") {
      statePill.textContent = "호흡 진행 중";
      energyPill.textContent = "에너지를 꺼내는 중";
      equation.innerHTML = "<span><b>마이토콘드리아 작동 중</b></span><span>재료를 분해하고 있어요</span>";
      return;
    }
    const count = Number(loaded.glucose) + Number(loaded.oxygen);
    statePill.textContent = count === 2 ? "재료 준비 완료" : "재료 " + String(count) + " / 2";
    energyPill.textContent = "생명활동 에너지 0";
    equation.innerHTML =
      count === 2
        ? "<span><b>포도당 + 산소</b></span><span>이제 호흡을 시작해요</span>"
        : "<span><b>포도당 + 산소</b></span><span>마이토콘드리아로 넣어요</span>";
  }

  function addInput(kind: RespireInput): void {
    if (phase !== "loading" || loaded[kind]) return;
    loaded[kind] = true;
    collect(kind, "마이토콘드리아 안");
    haptic(HAPTIC.select);
    cap.style.opacity = "0";
    if (kind === "glucose") {
      helper.innerHTML = loaded.oxygen
        ? "재료가 모두 모였어요. <b>호흡 시작</b>을 눌러 산물과 에너지를 확인해요."
        : "포도당이 들어왔어요. 호흡에는 공기에서 얻는 <b>산소</b>도 필요해요.";
    } else {
      helper.innerHTML = loaded.glucose
        ? "재료가 모두 모였어요. <b>호흡 시작</b>을 눌러 산물과 에너지를 확인해요."
        : "산소가 들어왔어요. 이번에는 잎에서 만든 양분인 <b>포도당</b>을 넣어 보세요.";
    }
    updateControls();
  }

  function startRespiration(): void {
    if (phase !== "loading" || !loaded.glucose || !loaded.oxygen) return;
    phase = "running";
    reaction = 0;
    haptic(HAPTIC.tap);
    helper.innerHTML =
      "마이토콘드리아가 포도당을 분해하고 있어요. <b>이산화 탄소·물</b>과 함께 무엇을 얻는지 지켜보세요.";
    updateControls();
  }

  const glucoseClick = (): void => addInput("glucose");
  const oxygenClick = (): void => addInput("oxygen");
  glucoseBtn.addEventListener("click", glucoseClick);
  oxygenBtn.addEventListener("click", oxygenClick);
  startBtn.addEventListener("click", startRespiration);

  function sourcePos(kind: RespireInput): { x: number; y: number } {
    return kind === "glucose"
      ? { x: Math.max(62, canvasW * 0.19), y: RESP_H - 58 }
      : { x: Math.min(canvasW - 62, canvasW * 0.81), y: RESP_H - 58 };
  }

  function pointerPos(event: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function hitInput(x: number, y: number): RespireInput | null {
    for (const kind of ["glucose", "oxygen"] as RespireInput[]) {
      if (loaded[kind] || phase !== "loading") continue;
      const p = sourcePos(kind);
      if (Math.hypot(x - p.x, y - p.y) <= 34) return kind;
    }
    return null;
  }

  const onPointerDown = (event: PointerEvent): void => {
    const p = pointerPos(event);
    const kind = hitInput(p.x, p.y);
    if (!kind) return;
    safePointerCapture(canvas, event.pointerId);
    selected = kind;
    drag = { kind, x: p.x, y: p.y, moved: false, sx: p.x, sy: p.y };
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (!drag) return;
    const p = pointerPos(event);
    drag.x = p.x;
    drag.y = p.y;
    if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 5) drag.moved = true;
  };
  const onPointerUp = (): void => {
    if (!drag) return;
    const current = drag;
    drag = null;
    canvas.classList.remove("dragging");
    const mx = canvasW * 0.5;
    const my = RESP_H * 0.45;
    const inside = Math.pow((current.x - mx) / Math.max(80, canvasW * 0.26), 2)
      + Math.pow((current.y - my) / 76, 2) <= 1;
    if (inside || !current.moved) {
      addInput(current.kind);
    } else {
      helper.innerHTML = "재료를 가운데 빛나는 <b>마이토콘드리아 안</b>에 놓아 보세요.";
    }
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowLeft") {
      selected = "glucose";
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      selected = "oxygen";
      event.preventDefault();
    } else if (event.key === "Enter" || event.key === " ") {
      addInput(selected);
      event.preventDefault();
    }
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("keydown", onKeyDown);

  function drawRespiration(tMs: number): void {
    const fit = fitCanvas(canvas, RESP_H, 1.75);
    const ctx = fit.ctx;
    const w = fit.w;
    canvasW = w;
    const cx = w * 0.5;
    const cy = RESP_H * 0.45;
    const pulse = (Math.sin(tMs * 0.006) + 1) * 0.5;
    const active = phase === "running" ? 0.5 + reaction * 0.5 : phase === "done" ? 1 : 0;

    const bg = ctx.createRadialGradient(cx, cy - 20, 24, cx, cy, Math.max(w, RESP_H) * 0.72);
    bg.addColorStop(0, cssVar("--stage-2"));
    bg.addColorStop(1, cssVar("--stage"));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, RESP_H);

    ctx.save();
    ctx.globalAlpha = 0.12;
    drawLeaf(ctx, cx, cy, Math.min(w * 0.84, 330), 205, -0.05, 1);
    ctx.restore();

    drawCenteredText(ctx, "식물 세포 속 마이토콘드리아", cx, 28, 13, cssVar("--n300"));
    drawMitochondrion(ctx, cx, cy, Math.min(94, w * 0.27), 69, pulse, active);
    drawTag(ctx, "마이토콘드리아", cx, cy - 93, cssVar("--n0"), cssVar("--subj-plant-press"), 132);

    const inputKinds = ["glucose", "oxygen"] as RespireInput[];
    for (const kind of inputKinds) {
      if (phase !== "loading") continue;
      const p = sourcePos(kind);
      const isLoaded = loaded[kind];
      const label = kind === "glucose" ? "포도당" : "산소";
      const tokenLabel = kind === "glucose" ? "당" : "O₂";
      const selectedNow = selected === kind && !isLoaded && phase === "loading";

      ctx.save();
      ctx.globalAlpha = isLoaded ? 0.32 : 0.95;
      roundedRect(ctx, p.x - 48, p.y - 31, 96, 62, 16);
      ctx.fillStyle = cssVar("--stage-2");
      ctx.fill();
      ctx.strokeStyle = selectedNow ? cssVar("--subj-plant") : cssVar("--stage-line");
      ctx.lineWidth = selectedNow ? 2.4 : 1.4;
      ctx.stroke();
      ctx.restore();

      if (!isLoaded && (!drag || drag.kind !== kind)) {
        drawMaterialToken(ctx, p.x, p.y - 4, 17, kind, tokenLabel);
      }
      drawCenteredText(
        ctx,
        isLoaded ? label + " 투입 완료" : label,
        p.x,
        p.y + 23,
        11.5,
        isLoaded ? cssVar("--n500") : cssVar("--n200"),
      );
    }

    if (drag) {
      const tokenLabel = drag.kind === "glucose" ? "당" : "O₂";
      drawMaterialToken(ctx, drag.x, drag.y, 20, drag.kind, tokenLabel);
      drawFlowArrow(ctx, drag.x, drag.y - 24, cx, cy + 8, cssVar("--n300"), 2);
    }

    if (loaded.glucose && phase !== "done") {
      drawMaterialToken(ctx, cx - 34, cy + 7, 13, "glucose", "당");
    }
    if (loaded.oxygen && phase !== "done") {
      drawMaterialToken(ctx, cx + 34, cy + 7, 13, "oxygen", "O₂");
    }

    if (phase === "running") {
      ctx.save();
      ctx.strokeStyle = plantColor("sun");
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, 88, -Math.PI * 0.5, -Math.PI * 0.5 + TAU * reaction);
      ctx.stroke();
      ctx.restore();
    }

    if (phase === "running" || phase === "done") {
      const reveal = phase === "done" ? 1 : clamp((reaction - 0.42) / 0.48, 0, 1);
      if (reveal > 0) {
        const outY = RESP_H - 64;
        const carbonX = Math.max(66, cx - 112);
        const waterX = Math.min(w - 54, cx + 74);
        const waterY = cy + 64;
        ctx.save();
        ctx.globalAlpha = reveal;
        drawFlowArrow(ctx, cx - 44, cy + 48, carbonX, outY - 19, plantColor("carbon"), 4.5);
        drawMaterialToken(ctx, carbonX, outY, 18, "carbon", "CO₂");
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = plantColor("water");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + 42, cy + 36);
        ctx.lineTo(waterX - 13, waterY - 9);
        ctx.stroke();
        ctx.setLineDash([]);
        drawMaterialToken(ctx, waterX, waterY, 16, "water", "물");
        drawCenteredText(ctx, "이산화 탄소", carbonX, outY + 29, 11.5, cssVar("--n200"));
        drawCenteredText(ctx, "생성된 물", waterX, waterY + 26, 11.5, cssVar("--n200"));
        drawEnergyBurst(ctx, cx, outY - 1, 31 + pulse * 3, tMs * 0.004, reveal);
        drawTag(ctx, "생명활동 에너지", cx, outY + 38, cssVar("--n0"), cssVar("--subj-plant-press"), 132);
        ctx.restore();
      }
    }
  }

  const loop = createLoop((dt, tMs) => {
    if (phase === "running") {
      reaction = clamp(reaction + (dt * 16.7) / 1800, 0, 1);
      energyPill.textContent = "생명활동 에너지 " + String(Math.round(reaction * 100));
      if (reaction >= 1) {
        phase = "done";
        collect("energy", "CO₂·물·에너지 확인");
        updateControls();
      }
    }
    drawRespiration(tMs);
    a11yTick += dt;
    if (a11yTick > 50) {
      a11yTick = 0;
      canvas.setAttribute(
        "aria-label",
        phase === "done"
          ? "호흡 완료. 포도당과 산소로 이산화 탄소, 물, 생명활동 에너지를 얻었어요."
          : "포도당 " + (loaded.glucose ? "투입됨" : "대기 중") + ", 산소 " + (loaded.oxygen ? "투입됨" : "대기 중"),
      );
    }
  });
  const startFrame = requestAnimationFrame(() => loop.start());
  updateControls();
  api.setCTA("호흡 재료와 산물을 모두 확인해요", { enabled: false });

  return () => {
    cancelAnimationFrame(startFrame);
    loop.stop();
    glucoseBtn.removeEventListener("click", glucoseClick);
    oxygenBtn.removeEventListener("click", oxygenClick);
    startBtn.removeEventListener("click", startRespiration);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("keydown", onKeyDown);
  };
};

function lightAt(hour: number): number {
  if (hour <= 6 || hour >= 18) return 0;
  return Math.sin(((hour - 6) / 12) * Math.PI);
}

function formatHour(hour: number): string {
  const rounded = Math.round(hour) % 24;
  if (rounded === 0) return "밤 12시";
  if (rounded < 6) return "새벽 " + String(rounded) + "시";
  if (rounded < 12) return "오전 " + String(rounded) + "시";
  if (rounded === 12) return "낮 12시";
  if (rounded < 18) return "오후 " + String(rounded - 12) + "시";
  return "밤 " + String(rounded - 12) + "시";
}

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.shadowColor = cssVar("--n0");
  ctx.shadowBlur = 14;
  ctx.fillStyle = cssVar("--n0");
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = cssVar("--stage-2");
  ctx.beginPath();
  ctx.arc(x + r * 0.45, y - r * 0.18, r * 0.88, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawMovingMaterial(
  ctx: CanvasRenderingContext2D,
  kind: "carbon" | "oxygen",
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tMs: number,
  offset: number,
  alpha: number,
): void {
  const p = (tMs * 0.00028 + offset) % 1;
  const x = x0 + (x1 - x0) * p;
  const y = y0 + (y1 - y0) * p;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawMaterialToken(ctx, x, y, 6.5, kind);
  ctx.restore();
}

export const dayNightLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlantLabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el(
      "div",
      { class: "pn-badge plant", dataset: { g: "day" } },
      el("b", { text: "강한 낮" }),
      el("span", { text: "순기체 출입 관찰" }),
    ),
    el(
      "div",
      { class: "pn-badge plant", dataset: { g: "night" } },
      el("b", { text: "빛 없는 밤" }),
      el("span", { text: "순기체 출입 관찰" }),
    ),
    el(
      "div",
      { class: "pn-badge plant", dataset: { g: "always" } },
      el("b", { text: "호흡은 항상" }),
      el("span", { text: "낮·밤 모두 확인" }),
    ),
  );

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: "height:" + String(CYCLE_H) + "px",
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "화면을 좌우로 끌어 시간을 바꾸고 낮과 밤의 광합성, 호흡, 순기체 출입을 비교해요.",
    },
  });
  const photoDot = el("span", { class: "pdot", style: "background:var(--plant-leaf-hi)" });
  const photoPill = el("span", { text: "광합성 · 약하게 진행" });
  const respPill = el("span", { text: "호흡 · 항상 진행" });
  const cap = el("div", { class: "stage-cap", text: "해를 끌거나 아래 시간 슬라이더를 움직여요" });
  const stage = el(
    "div",
    { class: "stage plant-stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, photoDot, photoPill),
      el(
        "div",
        { class: "pill" },
        el("span", { class: "pdot", style: "background:var(--plant-glucose)" }),
        respPill,
      ),
    ),
    cap,
  );

  const timeLabel = el("span", { html: "<b>오전 7시</b>" });
  const netLabel = el("span", { text: "두 과정의 차이를 계산하는 중" });
  const readout = el("div", { class: "plant-readout", attrs: { "aria-live": "polite" } }, timeLabel, netLabel);
  const range = el("input", {
    class: "plant-range",
    attrs: {
      type: "range",
      min: 0,
      max: 24,
      step: 1,
      value: 7,
      "aria-label": "하루 시간",
    },
  });
  const dayBtn = el("button", { class: "plant-btn", text: "강한 낮으로", attrs: { type: "button" } });
  const nightBtn = el("button", { class: "plant-btn", text: "빛 없는 밤으로", attrs: { type: "button" } });
  const quickControls = el("div", { class: "plant-controls two" }, dayBtn, nightBtn);
  const note = el("div", {
    class: "plant-note",
    html: "<b>굵은 화살표는 광합성과 호흡을 합친 순변화</b>예요. 낮에도 가는 호흡 화살표는 계속 움직여요. 낮에는 광합성이 더 강해 겉으로 반대 방향이 크게 보이는 거예요.",
  });
  const helper = el("div", {
    class: "helper",
    html: "시간을 <b>강한 낮</b>과 <b>빛 없는 밤</b>으로 옮겨 보세요. 위 상태표에서 호흡이 한 번이라도 꺼지는지 확인해요.",
  });
  host.append(goalChips, stage, readout, range, quickControls, note, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let hour = 7;
  let userMoved = false;
  let dragging = false;
  let canvasW = 340;
  const goals = new Set<string>();
  let finished = false;

  function collect(id: "day" | "night" | "always", sub: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector('[data-g="' + id + '"]') as HTMLElement | null;
    chip?.classList.add("on");
    const detail = chip?.querySelector("span");
    if (detail) detail.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "<b>호흡은 낮과 밤에 항상 진행</b>하고, 광합성은 빛이 있을 때만 진행해요. 강한 낮에는 이산화 탄소를 순흡수하고 산소를 순방출하지만, 밤에는 그 방향이 뒤집혀요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function updateStatus(allowGoals: boolean): void {
    const light = lightAt(hour);
    const strongDay = hour >= 10 && hour <= 14;
    const deepNight = hour <= 4 || hour >= 20;
    const net = light * 1.55 - 0.34;
    const timeText = formatHour(hour);
    timeLabel.innerHTML = "<b>" + timeText + "</b>";
    range.value = String(Math.round(hour));
    photoDot.style.opacity = String(0.28 + light * 0.72);

    if (light <= 0.01) {
      photoPill.textContent = "광합성 · 빛이 없어 멈춤";
    } else if (strongDay) {
      photoPill.textContent = "광합성 · 호흡보다 강함";
    } else {
      photoPill.textContent = "광합성 · 빛에 따라 진행";
    }
    respPill.textContent = "호흡 · 낮·밤 항상 진행";

    dayBtn.classList.toggle("on", strongDay);
    nightBtn.classList.toggle("on", deepNight);
    if (strongDay) {
      netLabel.innerHTML = "<b>순변화</b> CO₂ 흡수 · O₂ 방출";
      helper.innerHTML =
        "굵은 낮 화살표는 <b>순변화</b>예요. 호흡도 진행하지만, 광합성이 더 강해서 이산화 탄소 순흡수·산소 순방출로 보여요.";
    } else if (deepNight) {
      netLabel.innerHTML = "<b>순변화</b> O₂ 흡수 · CO₂ 방출";
      helper.innerHTML =
        "빛이 없어 광합성은 멈췄지만 <b>호흡은 계속</b>돼요. 그래서 산소를 흡수하고 이산화 탄소를 방출해요.";
    } else if (net > 0.08) {
      netLabel.innerHTML = "<b>순변화</b> 광합성 쪽이 조금 큼";
      helper.innerHTML = "빛이 약해지면 광합성과 호흡의 차이가 작아져 <b>순기체 출입</b>도 약해져요.";
    } else {
      netLabel.innerHTML = "<b>순변화</b> 호흡 쪽이 조금 큼";
      helper.innerHTML = "해 뜨기 전이나 해 질 무렵에는 광합성이 약해 <b>호흡의 영향</b>이 더 크게 보여요.";
    }

    canvas.setAttribute(
      "aria-label",
      timeText + ". 광합성 " + (light > 0 ? "진행 중" : "멈춤") + ", 호흡은 항상 진행 중. " + netLabel.textContent,
    );

    if (!allowGoals) return;
    if (strongDay) collect("day", "CO₂ 순흡수·O₂ 순방출");
    if (deepNight) collect("night", "O₂ 흡수·CO₂ 방출");
    if (goals.has("day") && goals.has("night")) collect("always", "낮에도 밤에도 켜짐");
  }

  function setHour(next: number, fromUser: boolean): void {
    hour = clamp(next, 0, 24);
    if (fromUser) {
      userMoved = true;
      cap.style.opacity = "0";
    }
    updateStatus(userMoved);
  }

  const onRange = (): void => setHour(Number(range.value), true);
  const goDay = (): void => {
    haptic(HAPTIC.select);
    setHour(12, true);
  };
  const goNight = (): void => {
    haptic(HAPTIC.select);
    setHour(23, true);
  };
  range.addEventListener("input", onRange);
  dayBtn.addEventListener("click", goDay);
  nightBtn.addEventListener("click", goNight);

  function hourFromPointer(event: PointerEvent): number {
    const rect = canvas.getBoundingClientRect();
    return clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 24, 0, 24);
  }
  const onDialDown = (event: PointerEvent): void => {
    safePointerCapture(canvas, event.pointerId);
    dragging = true;
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
    setHour(hourFromPointer(event), true);
  };
  const onDialMove = (event: PointerEvent): void => {
    if (!dragging) return;
    setHour(hourFromPointer(event), true);
  };
  const onDialUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  const onDialKey = (event: KeyboardEvent): void => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      setHour(hour - 1, true);
      event.preventDefault();
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      setHour(hour + 1, true);
      event.preventDefault();
    } else if (event.key === "Home") {
      setHour(0, true);
      event.preventDefault();
    } else if (event.key === "End") {
      setHour(24, true);
      event.preventDefault();
    }
  };
  canvas.addEventListener("pointerdown", onDialDown);
  canvas.addEventListener("pointermove", onDialMove);
  canvas.addEventListener("pointerup", onDialUp);
  canvas.addEventListener("pointercancel", onDialUp);
  canvas.addEventListener("keydown", onDialKey);

  function drawProcessLane(
    ctx: CanvasRenderingContext2D,
    y: number,
    label: string,
    status: string,
    color: string,
    alpha: number,
  ): void {
    const x = 18;
    const width = canvasW - 36;
    ctx.save();
    ctx.globalAlpha = 0.64 + alpha * 0.24;
    roundedRect(ctx, x, y - 14, width, 28, 14);
    ctx.fillStyle = cssVar("--stage-2");
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 14, y, 4.5, 0, TAU);
    ctx.fill();
    ctx.font = "800 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = cssVar("--n100");
    ctx.fillText(label, x + 25, y);
    ctx.textAlign = "right";
    ctx.fillStyle = cssVar("--n300");
    ctx.fillText(status, x + width - 12, y);
    ctx.restore();
  }

  function drawDayNight(tMs: number): void {
    const fit = fitCanvas(canvas, CYCLE_H, 1.75);
    const ctx = fit.ctx;
    const w = fit.w;
    canvasW = w;
    const light = lightAt(hour);
    const net = light * 1.55 - 0.34;
    const cx = w * 0.5;
    const leafY = 181;

    ctx.fillStyle = cssVar("--stage");
    ctx.fillRect(0, 0, w, CYCLE_H);
    ctx.save();
    ctx.globalAlpha = 0.12 + light * 0.68;
    ctx.fillStyle = cssVar("--blue-tint-2");
    ctx.fillRect(0, 0, w, 226);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = (1 - light) * 0.78;
    ctx.fillStyle = cssVar("--n0");
    const stars = [
      [0.12, 50], [0.24, 89], [0.36, 41], [0.63, 63], [0.78, 38], [0.9, 92],
    ];
    for (const star of stars) {
      const twinkle = 1.2 + 0.8 * Math.sin(tMs * 0.004 + Number(star[0]) * 10);
      ctx.beginPath();
      ctx.arc(w * Number(star[0]), Number(star[1]), twinkle, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    if (light > 0) {
      const a = Math.PI - ((hour - 6) / 12) * Math.PI;
      const sx = cx + Math.cos(a) * w * 0.38;
      const sy = 122 - Math.sin(a) * 86;
      drawSun(ctx, sx, sy, 18 + light * 4, tMs * 0.0003);
    } else {
      const nt = hour >= 18 ? (hour - 18) / 12 : (hour + 6) / 12;
      const a = Math.PI - nt * Math.PI;
      const mx = cx + Math.cos(a) * w * 0.35;
      const my = 122 - Math.sin(a) * 72;
      drawMoon(ctx, mx, my, 19);
    }

    ctx.save();
    ctx.strokeStyle = plantColor("vein");
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, 244);
    ctx.quadraticCurveTo(cx - 2, 211, cx, 182);
    ctx.stroke();
    ctx.restore();
    drawLeaf(ctx, cx, leafY, Math.min(170, w * 0.49), 86, -0.06, 1);
    drawLeaf(ctx, cx - 42, 218, 88, 45, -0.58, 0.95);
    drawLeaf(ctx, cx + 43, 222, 84, 43, 0.58, 0.95);

    drawTag(ctx, "굵은 화살표 = 순변화", cx, 113, cssVar("--n0"), cssVar("--subj-plant-press"), 174);

    const left = 24;
    const right = w - 24;
    if (net > 0.08) {
      const alpha = clamp(net / 1.21, 0.32, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      drawFlowArrow(ctx, left, 154, cx - 84, 166, plantColor("carbon"), 7);
      drawFlowArrow(ctx, cx + 84, 166, right, 154, plantColor("oxygen"), 7);
      drawMovingMaterial(ctx, "carbon", left, 154, cx - 84, 166, tMs, 0, alpha);
      drawMovingMaterial(ctx, "oxygen", cx + 84, 166, right, 154, tMs, 0.45, alpha);
      ctx.restore();
      drawTag(ctx, "CO₂ 순흡수", Math.max(62, cx - 117), 137, cssVar("--n0"), plantColor("carbon"), 92);
      drawTag(ctx, "O₂ 순방출", Math.min(w - 62, cx + 117), 137, cssVar("--n0"), plantColor("oxygen"), 92);
    } else if (net < -0.06) {
      const alpha = clamp(Math.abs(net) / 0.34, 0.42, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      drawFlowArrow(ctx, right, 154, cx + 84, 166, plantColor("oxygen"), 7);
      drawFlowArrow(ctx, cx - 84, 166, left, 154, plantColor("carbon"), 7);
      drawMovingMaterial(ctx, "oxygen", right, 154, cx + 84, 166, tMs, 0.1, alpha);
      drawMovingMaterial(ctx, "carbon", cx - 84, 166, left, 154, tMs, 0.55, alpha);
      ctx.restore();
      drawTag(ctx, "O₂ 흡수", Math.min(w - 62, cx + 117), 137, cssVar("--n0"), plantColor("oxygen"), 84);
      drawTag(ctx, "CO₂ 방출", Math.max(62, cx - 117), 137, cssVar("--n0"), plantColor("carbon"), 84);
    } else {
      drawTag(ctx, "두 과정의 크기가 비슷해요", cx, 151, cssVar("--n0"), cssVar("--subj-plant-press"), 176);
    }

    const photoStatus = light <= 0.01 ? "빛 없음 · 멈춤" : "빛 세기 " + String(Math.round(light * 100)) + "%";
    drawProcessLane(ctx, 281, "광합성", photoStatus, plantColor("leafHi"), light);
    drawProcessLane(ctx, 318, "호흡", "낮·밤 항상 진행", plantColor("glucose"), 1);

    ctx.save();
    ctx.globalAlpha = 0.42 + 0.3 * Math.sin(tMs * 0.006) * Math.sin(tMs * 0.006);
    drawMovingMaterial(ctx, "oxygen", w - 66, 318, w - 116, 318, tMs, 0, 1);
    drawMovingMaterial(ctx, "carbon", 116, 318, 66, 318, tMs, 0.5, 1);
    ctx.restore();
  }

  const loop = createLoop((_dt, tMs) => drawDayNight(tMs));
  const startFrame = requestAnimationFrame(() => loop.start());
  updateStatus(false);
  api.setCTA("낮과 밤의 순기체 출입을 모두 관찰해요", { enabled: false });

  return () => {
    cancelAnimationFrame(startFrame);
    loop.stop();
    range.removeEventListener("input", onRange);
    dayBtn.removeEventListener("click", goDay);
    nightBtn.removeEventListener("click", goNight);
    canvas.removeEventListener("pointerdown", onDialDown);
    canvas.removeEventListener("pointermove", onDialMove);
    canvas.removeEventListener("pointerup", onDialUp);
    canvas.removeEventListener("pointercancel", onDialUp);
    canvas.removeEventListener("keydown", onDialKey);
  };
};
