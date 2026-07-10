// photoEvidenceLab — 중2 V 광합성 증거 랩.
// ① 빛을 비춘 상추의 이산화 탄소 감소·산소 증가를 센서로 관찰하고
// ② 한 개체를 어둠에 두어 기존 녹말을 줄이는 사전 암처리를 하고
// ③ 잎을 에탄올 물중탕으로 안전하게 탈색한 뒤 물로 헹구고
// ④ 아이오딘-아이오딘화 칼륨 용액으로 녹말을 검출한다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { fitCanvas } from "../../ui/canvas";
import { curioCard, type Curio } from "../../ui/curio";
import {
  drawFlowArrow,
  drawLeaf,
  drawMaterialToken,
  drawSun,
  plantColor,
} from "../../ui/plantKit";
import type { StepRenderer } from "../types";

interface PhotoEvidenceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Phase =
  | "readySensor"
  | "sensorRunning"
  | "readyDark"
  | "darkRunning"
  | "readyDecolor"
  | "decolorRunning"
  | "readyRinse"
  | "rinseRunning"
  | "readyIodine"
  | "iodineRunning"
  | "done";

const CVH = 485;

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
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function leafShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rot: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 0);
  ctx.bezierCurveTo(-w * 0.22, -h * 0.62, w * 0.28, -h * 0.62, w * 0.52, 0);
  ctx.bezierCurveTo(w * 0.26, h * 0.58, -w * 0.24, h * 0.58, -w * 0.5, 0);
  ctx.closePath();
  ctx.restore();
}

export const photoEvidenceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PhotoEvidenceStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "plant-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "빛을 비춘 상추의 기체 센서 변화와 사전 암처리, 에탄올 물중탕 탈색, 물 헹굼, 아이오딘 녹말 검출 실험",
    },
  });
  const carbonRead = el("span", { text: "이산화 탄소 관찰 전" });
  const oxygenRead = el("span", { text: "산소 관찰 전" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "센서 관찰부터 차례대로 실험해 보세요" });
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

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge plant", dataset: { g: "gas" } }, el("b", { text: "기체 센서" }), el("span", { text: "무엇이 변할까?" })),
    el("div", { class: "pn-badge plant", dataset: { g: "decolor" } }, el("b", { text: "잎 준비" }), el("span", { text: "암처리·탈색·헹굼" })),
    el("div", { class: "pn-badge plant", dataset: { g: "starch" } }, el("b", { text: "녹말 검출" }), el("span", { text: "어느 잎만?" })),
  );
  const actionBtn = el("button", {
    class: "plant-btn",
    text: "빛 비추고 센서 관찰하기",
    dataset: { act: "evidence", phase: "readySensor" },
    attrs: { type: "button" },
  });
  const statusRead = el(
    "div",
    { class: "plant-readout" },
    el("span", { text: "현재 단계" }),
    el("b", { text: "기체 센서 관찰" }),
  );
  const statusValue = statusRead.querySelector("b") as HTMLElement;
  const helper = el("div", {
    class: "helper",
    html: "먼저 상추에 빛을 비추고 센서 그래프를 관찰해요. 광합성이 활발하면 용기 안의 <b>이산화 탄소는 줄고 산소는 늘어요</b>.",
  });
  host.append(
    goalChips,
    stage,
    el("div", { class: "plant-controls" }, actionBtn),
    statusRead,
    helper,
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  let phase: Phase = "readySensor";
  let sensorP = 0;
  let darkP = 0;
  let decolorP = 0;
  let rinseP = 0;
  let iodineP = 0;
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;
  const goals = new Set<string>();

  function toast(message: string): void {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function hideCap(): void {
    if (capHidden) return;
    capHidden = true;
    capEl.style.transition = "opacity .35s var(--ease)";
    capEl.style.opacity = "0";
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
      helper.innerHTML =
        "증거를 모두 모았어요. 사전 암처리로 기존 녹말을 줄이고, 탈색한 잎을 물로 헹군 뒤 비교했어요. 빛을 비추면 <b>이산화 탄소가 줄고 산소가 늘었고</b>, 햇빛 받은 잎만 아이오딘-아이오딘화 칼륨 용액에 <b>청람색</b>으로 변했어요. 아이오딘 용액이 검출한 것은 포도당이 아니라 <b>녹말</b>이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setButton(label: string, enabled: boolean, nextPhase: Phase, status: string): void {
    actionBtn.textContent = label;
    actionBtn.disabled = !enabled;
    actionBtn.setAttribute("aria-disabled", String(!enabled));
    actionBtn.dataset.phase = nextPhase;
    statusValue.textContent = status;
  }

  const onAction = (): void => {
    hideCap();
    if (phase === "readySensor") {
      phase = "sensorRunning";
      setButton("센서 그래프 관찰 중", false, phase, "빛을 비추는 중");
      helper.innerHTML = "두 선을 함께 보세요. 광합성이 활발해지면서 <b>이산화 탄소는 감소</b>하고 <b>산소는 증가</b>해요.";
      haptic(HAPTIC.tap);
    } else if (phase === "readyDark") {
      phase = "darkRunning";
      setButton("어둠 상자에서 사전 암처리 중", false, phase, "기존 녹말 줄이기");
      helper.innerHTML = "공정하게 비교하려면 잎에 이미 들어 있던 녹말을 먼저 줄여야 해요. 상추 한 개체를 <b>어둠에 두어 사전 암처리</b>해요.";
      haptic(HAPTIC.tap);
    } else if (phase === "readyDecolor") {
      phase = "decolorRunning";
      setButton("에탄올 물중탕으로 탈색 중", false, phase, "잎의 초록색 빼기");
      helper.innerHTML = "에탄올은 불이 잘 붙어요. 시험관 속 에탄올을 불로 직접 가열하지 않고 <b>뜨거운 물에 담가 물중탕</b>해요.";
      haptic(HAPTIC.tap);
    } else if (phase === "readyRinse") {
      phase = "rinseRunning";
      setButton("탈색한 잎을 물로 헹구는 중", false, phase, "에탄올 씻어 내기");
      helper.innerHTML = "에탄올로 탈색한 잎을 꺼내 <b>물로 충분히 헹궈</b> 남은 에탄올을 씻어 내요. 헹군 뒤 아이오딘 용액을 떨어뜨려야 해요.";
      haptic(HAPTIC.tap);
    } else if (phase === "readyIodine") {
      phase = "iodineRunning";
      setButton("아이오딘 용액 반응 관찰 중", false, phase, "녹말 검출하기");
      helper.innerHTML = "탈색한 두 잎에 <b>아이오딘-아이오딘화 칼륨 용액</b>을 떨어뜨려요. 청람색으로 변하는 잎을 찾아보세요.";
      haptic(HAPTIC.tap);
    }
  };
  actionBtn.addEventListener("click", onAction);

  function label(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = cssVar("--n0"),
    align: CanvasTextAlign = "center",
    size = 10.5,
  ): void {
    ctx.fillStyle = color;
    ctx.font = `750 ${size}px Pretendard, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function drawSensorPanel(ctx: CanvasRenderingContext2D, W: number, tMs: number): void {
    const n0 = cssVar("--n0");
    const n300 = cssVar("--n300");
    const panelTop = 56;
    const panelBottom = 220;
    const splitX = W * 0.53;

    // 센서 전용 투명 용기와 상추
    const jarX = 24;
    const jarY = 91;
    const jarW = Math.max(118, splitX - 44);
    const jarH = 111;
    ctx.fillStyle = alphaVar("--n0", 0.055);
    roundedRect(ctx, jarX, jarY, jarW, jarH, 22);
    ctx.fill();
    ctx.strokeStyle = alphaVar("--plant-glass-hi", 0.62);
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.fillStyle = alphaVar("--plant-water", 0.1);
    roundedRect(ctx, jarX + 5, jarY + jarH - 24, jarW - 10, 19, 10);
    ctx.fill();
    const stemX = jarX + jarW * 0.5;
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(stemX, jarY + jarH - 12);
    ctx.lineTo(stemX, jarY + 42);
    ctx.stroke();
    drawLeaf(ctx, stemX - 20, jarY + 58, Math.min(66, jarW * 0.42), 33, 0.22);
    drawLeaf(ctx, stemX + 20, jarY + 43, Math.min(61, jarW * 0.39), 31, -0.25);
    drawLeaf(ctx, stemX - 3, jarY + 28, Math.min(55, jarW * 0.34), 29, -0.02);

    // 센서 탐침 두 개
    for (const [x, color, short] of [
      [jarX + jarW * 0.27, plantColor("carbon"), "이산화 탄소"],
      [jarX + jarW * 0.73, plantColor("oxygen"), "산소"],
    ] as [number, string, string][]) {
      ctx.fillStyle = color;
      roundedRect(ctx, x - 9, jarY - 17, 18, 40, 5);
      ctx.fill();
      ctx.strokeStyle = n0;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, jarY + 22);
      ctx.lineTo(x, jarY + 50);
      ctx.stroke();
      label(ctx, short, x, jarY - 25, color, "center", 9.5);
    }

    // 빛과 용기 안의 기체 알갱이
    drawSun(ctx, 35, 65, 13, tMs / 5200);
    drawFlowArrow(ctx, 49, 73, jarX + 28, jarY + 18, plantColor("sun"), 2.5);
    const gasAnim = phase === "sensorRunning" || sensorP >= 1;
    if (gasAnim) {
      for (let i = 0; i < 5; i++) {
        const a = tMs / 870 + i * 1.27;
        const x = jarX + 18 + ((Math.sin(a * 0.73) + 1) / 2) * (jarW - 36);
        const y = jarY + 23 + ((Math.cos(a) + 1) / 2) * (jarH - 50);
        // 변화의 방향만 보이되 어느 기체도 0이 되는 것처럼 그리지 않는다.
        const isOxygen = i < Math.round(2 + sensorP);
        drawMaterialToken(ctx, x, y, 4.8, isOxygen ? "oxygen" : "carbon");
      }
    }
    label(ctx, "빛을 비춘 상추", jarX + jarW / 2, panelBottom + 10, n300);

    // 정량 대신 방향을 읽는 센서 그래프
    const gx0 = splitX + 17;
    const gx1 = W - 17;
    const gy0 = panelTop + 26;
    const gy1 = panelBottom - 13;
    ctx.strokeStyle = alphaVar("--plant-glass", 0.42);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    ctx.fillStyle = alphaVar("--plant-glass", 0.12);
    for (let k = 1; k <= 3; k++) {
      const y = gy0 + ((gy1 - gy0) * k) / 4;
      ctx.fillRect(gx0, y, gx1 - gx0, 1);
    }
    const drawLine = (color: string, rising: boolean): void => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const steps = 42;
      for (let i = 0; i <= steps; i++) {
        const q = i / steps;
        if (q > sensorP) break;
        const eased = 1 - Math.pow(1 - q, 2.2);
        const yStart = rising ? gy1 - 24 : gy0 + 23;
        const yEnd = rising ? gy0 + 31 : gy1 - 31;
        const x = gx0 + q * (gx1 - gx0);
        const y = yStart + (yEnd - yStart) * eased;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    drawLine(plantColor("carbon"), false);
    drawLine(plantColor("oxygen"), true);
    label(ctx, "이산화 탄소", gx0 + 8, gy0 + 8, plantColor("carbon"), "left", 9.3);
    label(ctx, "산소", gx0 + 8, gy1 - 7, plantColor("oxygen"), "left", 9.3);
    label(ctx, "시간", gx1, gy1 + 13, n300, "right", 9.2);
  }

  function drawEvidencePanel(ctx: CanvasRenderingContext2D, W: number, tMs: number): void {
    const n0 = cssVar("--n0");
    const n100 = cssVar("--n100");
    const n300 = cssVar("--n300");
    const n700 = cssVar("--n700");
    const active = sensorP >= 1;
    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.38;

    // 구분선과 단계 이름
    ctx.strokeStyle = alphaVar("--plant-glass", 0.2);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(16, 247);
    ctx.lineTo(W - 16, 247);
    ctx.stroke();
    label(ctx, "햇빛 받은 잎과 가린 잎을 비교해요", 18, 262, n300, "left", 10.5);

    // 실제 잎 비교 전, 한 개체를 어둠에 두어 이미 있던 녹말을 줄이는 사전 암처리.
    // 완료 화면을 한 번 더 볼 수 있게 readyDecolor에서도 이 장면을 유지한다.
    const showDarkPrep = phase === "readyDark" || phase === "darkRunning" || phase === "readyDecolor";
    if (showDarkPrep) {
      const plantXs = [W * 0.31, W * 0.69];
      const baseY = 411;
      for (let i = 0; i < 2; i++) {
        const x = plantXs[i];
        ctx.fillStyle = plantColor("soil");
        roundedRect(ctx, x - 31, baseY - 27, 62, 28, 9);
        ctx.fill();
        ctx.strokeStyle = plantColor("leafLo");
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, baseY - 26);
        ctx.lineTo(x, baseY - 92);
        ctx.stroke();
        drawLeaf(ctx, x - 21, baseY - 74, 60, 31, 0.24);
        drawLeaf(ctx, x + 19, baseY - 94, 58, 30, -0.22);
        drawLeaf(ctx, x - 2, baseY - 116, 54, 28, 0.02);
      }
      drawSun(ctx, plantXs[0] - 50, 296, 15, tMs / 5000);
      drawFlowArrow(ctx, plantXs[0] - 36, 306, plantXs[0] - 10, 329, plantColor("sun"), 2.5);
      label(ctx, "햇빛", plantXs[0], 429, plantColor("sun"), "center", 9.5);

      // 어둠 상자가 내려오며 두 번째 개체를 가린다.
      const boxX = plantXs[1] - 52;
      const boxY = 286 + darkP * 19;
      ctx.save();
      ctx.globalAlpha *= 0.34 + darkP * 0.62;
      ctx.fillStyle = cssVar("--stage-2");
      roundedRect(ctx, boxX, boxY, 104, 121, 12);
      ctx.fill();
      ctx.strokeStyle = n700;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = alphaVar("--n0", 0.08);
      roundedRect(ctx, boxX + 8, boxY + 9, 88, 19, 6);
      ctx.fill();
      ctx.restore();
      label(ctx, "어둠 상자", plantXs[1], boxY + 19, n100, "center", 9.5);
      label(ctx, "사전 암처리", plantXs[1], 429, n300, "center", 9.5);

      ctx.fillStyle = alphaVar("--n0", 0.065);
      roundedRect(ctx, 15, 456, W - 30, 22, 8);
      ctx.fill();
      label(ctx, "한 개체를 어둠에 두어 잎에 남아 있던 기존 녹말을 줄여요", W / 2, 467, n100, "center", 9.1);
      ctx.restore();
      return;
    }

    // 왼쪽: 에탄올 시험관을 뜨거운 물에 담근 물중탕 장치
    const bathX = 18;
    const bathW = W * 0.47 - 26;
    const bathY = 315;
    const bathH = 104;
    const waterY = bathY + 32;
    ctx.fillStyle = alphaVar("--plant-water", 0.16);
    roundedRect(ctx, bathX, bathY, bathW, bathH, 13);
    ctx.fill();
    ctx.strokeStyle = alphaVar("--plant-glass-hi", 0.55);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = alphaVar("--plant-water", 0.24);
    ctx.fillRect(bathX + 4, waterY, bathW - 8, bathH - 36);
    ctx.strokeStyle = alphaVar("--plant-glass-hi", 0.6);
    ctx.beginPath();
    ctx.moveTo(bathX + 4, waterY);
    for (let x = bathX + 4; x < bathX + bathW - 4; x += 8) {
      ctx.lineTo(x, waterY + Math.sin(x / 13 + tMs / 360) * (decolorP > 0 && decolorP < 1 ? 1.8 : 0.5));
    }
    ctx.stroke();
    label(ctx, "뜨거운 물", bathX + bathW / 2, bathY + bathH - 11, plantColor("water"), "center", 9.5);

    const tubeXs = [bathX + bathW * 0.32, bathX + bathW * 0.69];
    const names = ["햇빛 받은 잎", "가린 잎"];
    for (let i = 0; i < 2; i++) {
      const tx = tubeXs[i];
      const tubeTop = 282;
      const tubeBottom = bathY + bathH - 20;
      ctx.fillStyle = alphaVar("--n0", 0.055);
      roundedRect(ctx, tx - 18, tubeTop, 36, tubeBottom - tubeTop, 15);
      ctx.fill();
      ctx.strokeStyle = alphaVar("--plant-glass-hi", 0.72);
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.fillStyle = alphaVar("--n0", 0.1);
      ctx.fillRect(tx - 15, tubeTop + 24, 30, tubeBottom - tubeTop - 28);
      label(ctx, "에탄올", tx, tubeTop + 17, n100, "center", 8.8);
      const leafY = 340 + Math.min(1, decolorP * 2) * 16;
      drawLeaf(ctx, tx, leafY, Math.min(48, bathW * 0.34), 25, i === 0 ? -0.18 : 0.18);
      if (i === 1 && decolorP < 0.15) {
        ctx.fillStyle = n700;
        ctx.globalAlpha *= 0.82;
        ctx.fillRect(tx - 5, leafY - 16, 10, 32);
        ctx.globalAlpha = active ? 1 : 0.38;
      }
      if (decolorP > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.94, decolorP * 0.94);
        leafShape(ctx, tx, leafY, Math.min(48, bathW * 0.34), 25, i === 0 ? -0.18 : 0.18);
        ctx.fillStyle = n100;
        ctx.fill();
        ctx.restore();
      }
      label(ctx, names[i], tx, 432, n300, "center", 8.8);
    }

    // 오른쪽: 탈색한 잎에 아이오딘 용액을 떨어뜨리는 페트리 접시
    const resultAlpha = clamp((decolorP - 0.55) / 0.45, 0, 1);
    ctx.save();
    ctx.globalAlpha *= resultAlpha;
    const dishXs = [W * 0.63, W * 0.85];
    const dishY = 365;
    for (let i = 0; i < 2; i++) {
      const dx = dishXs[i];
      ctx.fillStyle = alphaVar("--n0", 0.055);
      ctx.beginPath();
      ctx.ellipse(dx, dishY, Math.min(36, W * 0.095), 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = alphaVar("--plant-glass-hi", 0.66);
      ctx.lineWidth = 1.7;
      ctx.stroke();
      drawLeaf(ctx, dx, dishY, Math.min(55, W * 0.14), 28, i === 0 ? -0.12 : 0.12, 0.5);
      leafShape(ctx, dx, dishY, Math.min(55, W * 0.14), 28, i === 0 ? -0.12 : 0.12);
      ctx.save();
      ctx.globalAlpha = iodineP;
      ctx.fillStyle = i === 0 ? cssVar("--stage") : plantColor("soil");
      ctx.fill();
      ctx.restore();
      label(ctx, i === 0 ? "햇빛" : "가림", dx, dishY + 40, n300, "center", 9);
      if (iodineP > 0.82) {
        label(
          ctx,
          i === 0 ? "청람색" : "색 변화 거의 없음",
          dx,
          dishY + 57,
          i === 0 ? n0 : plantColor("soil"),
          "center",
          i === 0 ? 9.3 : 8.4,
        );
      }
      if (phase === "iodineRunning") {
        const dropY = 286 + clamp(iodineP * 1.7 - i * 0.12, 0, 1) * 54;
        ctx.fillStyle = plantColor("soil");
        ctx.beginPath();
        ctx.arc(dx, dropY, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (phase === "readyRinse" || phase === "rinseRunning") {
        const q = phase === "readyRinse" ? i * 0.18 : (rinseP * 1.45 + i * 0.21) % 1;
        drawMaterialToken(ctx, dx, 290 + q * 49, 5.2, "water");
        ctx.save();
        ctx.globalAlpha = 0.12 + rinseP * 0.13;
        leafShape(ctx, dx, dishY, Math.min(55, W * 0.14), 28, i === 0 ? -0.12 : 0.12);
        ctx.fillStyle = plantColor("water");
        ctx.fill();
        ctx.restore();
      }
    }
    if (phase === "readyRinse" || phase === "rinseRunning") {
      label(ctx, "탈색한 잎을 물로 헹궈요", W * 0.74, 275, plantColor("water"), "center", 9.3);
    }
    if (phase === "readyIodine" || phase === "iodineRunning" || phase === "done") {
      ctx.strokeStyle = plantColor("soil");
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      for (const dx of dishXs) {
        ctx.beginPath();
        ctx.moveTo(dx - 10, 283);
        ctx.lineTo(dx + 3, 303);
        ctx.stroke();
      }
      label(ctx, "아이오딘 용액", W * 0.74, 275, plantColor("soil"), "center", 9.3);
    }
    ctx.restore();

    // 안전 띠: 에탄올 직접 가열 오개념을 실험 화면에 고정한다.
    ctx.fillStyle = alphaVar("--n0", 0.065);
    roundedRect(ctx, 15, 456, W - 30, 22, 8);
    ctx.fill();
    label(ctx, "에탄올은 뜨거운 물로 물중탕하고, 탈색한 잎은 물로 헹궈요", W / 2, 467, n100, "center", 9.1);
    ctx.restore();
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    const W = fit.w;

    if (phase === "sensorRunning") {
      sensorP = clamp(sensorP + dt * 0.012, 0, 1);
      if (sensorP >= 1) {
        phase = "readyDark";
        carbonRead.textContent = "이산화 탄소 감소";
        oxygenRead.textContent = "산소 증가";
        collect("gas", "CO₂ 감소·산소 증가", "센서가 광합성에 따른 기체 변화를 잡았어요");
        setButton("상추 한 개체 사전 암처리하기", true, phase, "기존 녹말 줄이기");
        helper.innerHTML = "센서 관찰 완료! 잎 비교 전에는 한 개체를 <b>어둠에 두어 사전 암처리</b>해요. 그래야 잎에 이미 있던 녹말을 줄이고 빛을 받은 뒤 생긴 녹말을 비교하기 쉬워요.";
      }
    } else if (phase === "darkRunning") {
      darkP = clamp(darkP + dt * 0.016, 0, 1);
      if (darkP >= 1) {
        phase = "readyDecolor";
        setButton("두 잎을 에탄올 물중탕으로 탈색", true, phase, "에탄올 물중탕");
        helper.innerHTML = "사전 암처리로 기존 녹말을 줄였어요. 이제 잎을 에탄올이 든 시험관에 넣고, 시험관을 <b>뜨거운 물에 담가 물중탕</b>해 초록색을 빼요.";
      }
    } else if (phase === "decolorRunning") {
      decolorP = clamp(decolorP + dt * 0.016, 0, 1);
      if (decolorP >= 1) {
        phase = "readyRinse";
        setButton("탈색한 두 잎을 물로 헹구기", true, phase, "에탄올 씻어 내기");
        helper.innerHTML = "두 잎의 초록색을 뺐어요. 아직 아이오딘 용액을 떨어뜨리면 안 돼요. 먼저 탈색한 잎을 꺼내 <b>물로 헹궈</b> 남은 에탄올을 씻어 내요.";
      }
    } else if (phase === "rinseRunning") {
      rinseP = clamp(rinseP + dt * 0.02, 0, 1);
      if (rinseP >= 1) {
        phase = "readyIodine";
        collect("decolor", "암처리·탈색·헹굼", "사전 암처리, 물중탕 탈색, 물 헹굼을 마쳤어요");
        setButton("아이오딘 용액 떨어뜨리기", true, phase, "녹말 검출 준비");
        helper.innerHTML = "물로 헹군 두 잎을 나란히 놓았어요. 이제 <b>아이오딘-아이오딘화 칼륨 용액</b>을 떨어뜨려 녹말이 있는 잎을 찾아보세요.";
      }
    } else if (phase === "iodineRunning") {
      iodineP = clamp(iodineP + dt * 0.018, 0, 1);
      if (iodineP >= 1) {
        phase = "done";
        collect("starch", "햇빛 잎만 청람색", "햇빛 받은 잎에서 녹말이 검출됐어요");
        setButton("실험 관찰 완료", false, phase, "녹말 증거 확인");
      }
    }

    drawSensorPanel(ctx, W, tMs);
    drawEvidencePanel(ctx, W, tMs);
  });

  api.setCTA("센서와 잎 실험을 순서대로 마쳐요", { enabled: false });
  const startRaf = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(startRaf);
    window.clearTimeout(toastTimer);
    loop.stop();
    actionBtn.removeEventListener("click", onAction);
  };
};
