// elecStatic — 마찰 전기 랩 2종(중2 VII L1, 책 244~245쪽).
//   frictionLab "빨대 회전 관찰소": 뒤집힌 플라스틱 통 위 (−)대전 빨간 빨대 — 털가죽(+)을
//     가까이 대면 끌려 오고(인력), 문지른 파란 빨대(−)를 대면 밀려난다(척력).
//     토크는 거리 제곱 반비례 근사 — 가까울수록 세게 돈다.
//   rubLab "전자 이동 관측소": 빨대를 털가죽 위에서 좌우로 문지르면 왕복 1회당
//     전자(−) 1개가 털가죽→빨대로 점프(최대 3개). (+)알갱이는 절대 움직이지 않는다.
// 전하 표현은 ui/elecKit(drawElectron·drawPlus)만 사용 — 하드코딩 금지 규칙.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawElectron, drawPlus, drawSpark, ELEC, TAU } from "../../ui/elecKit";
import { glassVessel, contactShadow, softGlow } from "../../ui/labProps";
import { capturePointer } from "../../ui/lightKit";
import { drawForceArrow } from "../../ui/forceProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 300; // 다크 스테이지 캔버스 높이

const wrapPi = (a: number): number => {
  let v = a;
  while (v > Math.PI) v -= TAU;
  while (v < -Math.PI) v += TAU;
  return v;
};

/** 털가죽 — 갈색 털 질감 타원(파운드리 문법: 그라데이션 면 + 재질별 최암 외곽 + 털 스트로크). */
function drawFur(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.save();
  const g = ctx.createRadialGradient(x - rx * 0.32, y - ry * 0.4, rx * 0.14, x, y, rx);
  g.addColorStop(0, "#A8803F");
  g.addColorStop(0.55, "#6B4522");
  g.addColorStop(1, "#3E250C");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#2E1B06";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.stroke();
  // 가장자리 털(결정적 지터 — 매 프레임 동일)
  ctx.lineCap = "round";
  const n = Math.max(18, Math.round(rx * 0.42));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const jit = Math.sin(i * 12.9898) * 0.24;
    const len = 5 + ((i * 7) % 4) + rx * 0.03;
    const ex = x + Math.cos(a) * rx * 0.97;
    const ey = y + Math.sin(a) * ry * 0.97;
    ctx.strokeStyle = i % 2 ? "rgba(168,123,68,.85)" : "rgba(52,31,10,.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + Math.cos(a + jit) * len, ey + Math.sin(a + jit) * len * 0.9);
    ctx.stroke();
  }
  // 안쪽 결 몇 가닥
  ctx.strokeStyle = "rgba(46,27,6,.45)";
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.7;
    const bx = x + Math.cos(a) * rx * 0.5;
    const by = y + Math.sin(a) * ry * 0.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + 6, by + 5, bx + 3, by + 11);
    ctx.stroke();
  }
  ctx.restore();
}

/** 파란 플라스틱 막대(빨대) — 가로 배치, 세로 그라데이션 + 스펙큘러 + 최암 외곽. */
function drawBlueRod(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  g.addColorStop(0, "#7EC2FF");
  g.addColorStop(0.5, "#3E86D8");
  g.addColorStop(1, "#1D4E8E");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = "#0F2C56";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(230,244,255,.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + h * 0.45, y - h / 2 + 3.2);
  ctx.lineTo(x + w / 2 - h * 0.45, y - h / 2 + 3.2);
  ctx.stroke();
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════════════
 * frictionLab — 빨대 회전 관찰소 (책 244쪽 '해 보기' 재현)
 * ══════════════════════════════════════════════════════════════════ */

type Tool = "fur" | "blue";

export const frictionLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "lt-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      "aria-label": "회전 실험 무대. 도구를 잡아 빨대 끝 가까이 끌어 보세요. 화살표 키로도 옮길 수 있어요.",
    },
  });
  const stateTxt = el("span", { text: "전기력 관찰 중" });
  const stateDot = el("span", { class: "pdot", style: "background:#8CA2C0" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "도구를 잡아 빨대 끝 가까이 가져가 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, stateDot, stateTxt)),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge elec", dataset: { g: "repel" } }, el("b", { text: "파란 빨대" }), el("span", { text: "가까이 대면?" })),
    el("div", { class: "pn-badge elec", dataset: { g: "attract" } }, el("b", { text: "털가죽" }), el("span", { text: "가까이 대면?" })),
    el("div", { class: "pn-badge elec", dataset: { g: "close" } }, el("b", { text: "더 가까이" }), el("span", { text: "힘은?" })),
  );

  const segBtns: Record<Tool, HTMLButtonElement> = {} as Record<Tool, HTMLButtonElement>;
  const seg = el("div", { class: "seg" });
  (["blue", "fur"] as Tool[]).forEach((k) => {
    const b = el("button", { text: k === "fur" ? "문지른 털가죽" : "문지른 파란 빨대", attrs: { type: "button" } });
    if (k === "blue") b.classList.add("on");
    b.addEventListener("click", () => pick(k));
    segBtns[k] = b;
    seg.appendChild(b);
  });

  const helper = el("div", {
    class: "helper",
    html: "핀에 꽂아 둔 <b>빨간 빨대</b> — 파란 빨대와 함께 <b>같은 털가죽으로 문질러</b> 뒀어요. 먼저 <b>파란 빨대를 잡아</b> 빨간 빨대 끝 가까이 가져가면 어떻게 될까요?",
  });
  host.append(goalChips, helper, stage, seg); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  const R = 88; // 빨대 반길이(수평면 논리 좌표)
  const PY = 0.42; // 수평 회전면의 화면 투영 비율
  let W = 340;
  let H = CVH;
  let theta = -0.35; // 빨대 각도(수평면)
  let omega = 0; // 각속도(rad/frame, 1frame=16.7ms)
  let tool: Tool = "blue"; // 파란 빨대(같은 전기·척력)부터 — 문지른 짝끼리 먼저 만난다
  let toolX = -1; // 첫 프레임에 배치
  let toolY = -1;
  let dragging = false;
  let grabDX = 0;
  let grabDY = 0;
  let everGrabbed = false;
  let prevGap: number | null = null;
  let prevNearSign = 0;
  let attractAcc = 0;
  let repelAcc = 0;
  let hudState = "";
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function collect(id: string, subText: string, msg: string, helperHtml: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    helper.innerHTML = helperHtml;
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>다른 종류의 전기는 서로 끌어당기고, 같은 종류의 전기는 서로 밀어내요</b> — 이 힘이 <b>전기력</b>이에요. 그리고 가까울수록 세지죠!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function pick(k: Tool): void {
    tool = k;
    prevGap = null;
    (["fur", "blue"] as Tool[]).forEach((kk) => segBtns[kk].classList.toggle("on", kk === k));
    haptic(HAPTIC.select);
    if (finished) return;
    helper.innerHTML =
      k === "fur"
        ? "이번엔 <b>빨대들을 문지르는 데 썼던 그 털가죽</b> 차례예요. 전자를 빨대에 내주었으니 <b>(+)전기</b> — 빨간 빨대의 (−)와는 <b>다른 종류</b>죠. 끝에 가까이 대면 어떻게 될까요?"
        : "파란 빨대는 빨간 빨대와 <b>같은 털가죽으로 문지른 짝꿍</b> — 똑같이 <b>(−)전기</b>를 띠어요. <b>같은 종류</b>끼리 만나면 어떻게 될까요?";
  }

  // ---- 입력: 도구 드래그 ----
  const grab = (px: number, py: number): boolean => Math.hypot(px - toolX, py - toolY) < 46;
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (!grab(px, py)) return;
    dragging = true;
    everGrabbed = true;
    grabDX = toolX - px;
    grabDY = toolY - py;
    capturePointer(canvas, e);
    haptic(HAPTIC.tap);
    capEl.style.transition = "opacity .4s";
    capEl.style.opacity = "0";
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    toolX = clamp(e.clientX - r.left + grabDX, 20, W - 20);
    toolY = clamp(e.clientY - r.top + grabDY, 46, H - 18);
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onKey = (e: KeyboardEvent): void => {
    const step14 = 14;
    if (e.key === "ArrowLeft") toolX -= step14;
    else if (e.key === "ArrowRight") toolX += step14;
    else if (e.key === "ArrowUp") toolY -= step14;
    else if (e.key === "ArrowDown") toolY += step14;
    else return;
    e.preventDefault();
    everGrabbed = true;
    toolX = clamp(toolX, 20, W - 20);
    toolY = clamp(toolY, 46, H - 18);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const cx = W / 2;
    const pinY = 160;
    if (toolX < 0) {
      toolX = Math.max(52, W * 0.16);
      toolY = 234;
    }
    toolX = clamp(toolX, 20, W - 20);
    toolY = clamp(toolY, 46, H - 18);

    // ---- 물리(수평 회전면, 비투영 좌표) ----
    const ux = toolX - cx;
    const uy = (toolY - pinY) / PY;
    const sign = tool === "fur" ? 1 : -1; // +1 인력(도구 쪽), −1 척력
    let torque = 0;
    let dNear = 1e9;
    let nearSign = 1;
    for (const es of [1, -1]) {
      const ex = Math.cos(theta) * R * es;
      const ey = Math.sin(theta) * R * es;
      const dx = ux - ex;
      const dy = uy - ey;
      const d = Math.hypot(dx, dy);
      if (d < dNear) {
        dNear = d;
        nearSign = es;
      }
      const f = (sign * 0.4) / (d * d + 1400); // 거리 제곱 반비례 근사(연화항 포함)
      const inv = d || 1;
      torque += (ex * (dy / inv) - ey * (dx / inv)) * f;
    }
    omega = clamp((omega + torque * dt) * Math.pow(0.94, dt), -0.11, 0.11);
    theta += omega * dt;

    // ---- 목표 판정 ----
    const nx = Math.cos(theta) * R * nearSign;
    const ny = Math.sin(theta) * R * nearSign;
    const gap = Math.abs(wrapPi(Math.atan2(ny, nx) - Math.atan2(uy, ux)));
    if (dNear < 172) {
      if (prevGap !== null && nearSign === prevNearSign) {
        if (tool === "fur") attractAcc += Math.max(0, prevGap - gap);
        else repelAcc += Math.max(0, gap - prevGap);
      }
      prevGap = gap;
      prevNearSign = nearSign;
    } else {
      prevGap = null;
    }
    if (attractAcc > 0.5) {
      collect(
        "attract", "인력!", "끌려 왔어요 — 다른 종류의 전기!",
        "빨대가 털가죽 쪽으로 <b>끌려 왔어요</b>. (+)와 (−), <b>다른 종류의 전기 사이에는 인력</b>이 작용해요." +
          (goals.has("repel") ? " 이제 <b>더 가까이</b> 대며 세기를 비교해 봐요!" : " <b>파란 빨대</b>로도 확인해 봐요!"),
      );
      attractAcc = 0;
    }
    if (repelAcc > 0.5) {
      collect(
        "repel", "척력!", "밀려났어요 — 같은 종류의 전기!",
        "빨대가 <b>밀려나요</b>! (−)와 (−), <b>같은 종류의 전기 사이에는 척력</b>이 작용해요." +
          (goals.has("attract") ? " 이제 도구를 <b>더 가까이</b> 대 보세요!" : " 이번엔 위에서 <b>문지른 털가죽</b>으로 바꿔 볼까요?"),
      );
      repelAcc = 0;
    }
    if ((goals.has("attract") || goals.has("repel")) && dNear < 74 && Math.abs(omega) > 0.055) {
      collect(
        "close", "더 세게!", "가까울수록 힘이 세져요!",
        "쌩쌩 돌죠? <b>거리가 가까울수록 전기력이 세져요</b>. 아직 안 해 본 도구도 끝에 대 보세요!",
      );
    }

    // ---- 그리기 ----
    // 뒤집힌 플라스틱 통(labProps 유리 용기 문법을 상하 반전)
    const tubW = 148;
    const tubTop = 190;
    const tubBot = 266;
    contactShadow(ctx, cx, tubBot + 4, tubW * 0.62, 0.26);
    ctx.save();
    ctx.translate(0, tubTop + tubBot);
    ctx.scale(1, -1);
    glassVessel(ctx, { x0: cx - tubW / 2, y0: tubTop, x1: cx + tubW / 2, y1: tubBot });
    ctx.restore();

    // 회전 궤도 가이드(수평면이 읽히도록)
    ctx.strokeStyle = "rgba(148,168,196,.15)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.ellipse(cx, pinY, R, R * PY, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    // 중심 핀
    ctx.strokeStyle = "rgba(196,212,236,.8)";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, tubTop - 2);
    ctx.lineTo(cx, pinY + 4);
    ctx.stroke();
    ctx.fillStyle = "#E8F0FA";
    ctx.beginPath();
    ctx.arc(cx, pinY + 4, 2.4, 0, TAU);
    ctx.fill();

    // 빨간 빨대(투영 좌표) — 3패스: 최암 외곽 → 몸통 그라데이션 → 스펙큘러
    const e1x = cx + Math.cos(theta) * R;
    const e1y = pinY + Math.sin(theta) * R * PY;
    const e2x = cx - Math.cos(theta) * R;
    const e2y = pinY - Math.sin(theta) * R * PY;
    const segLen = Math.hypot(e1x - e2x, e1y - e2y) || 1;
    const nxs = -(e1y - e2y) / segLen; // 화면 법선
    const nys = (e1x - e2x) / segLen;
    const bodyG = ctx.createLinearGradient(cx - nxs * 6, pinY - nys * 6, cx + nxs * 6, pinY + nys * 6);
    bodyG.addColorStop(0, "#A32014");
    bodyG.addColorStop(0.45, "#E5493B");
    bodyG.addColorStop(1, "#FF8A7A");
    ctx.lineCap = "round";
    ctx.strokeStyle = "#7E1408";
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(e2x, e2y);
    ctx.lineTo(e1x, e1y);
    ctx.stroke();
    ctx.strokeStyle = bodyG;
    ctx.lineWidth = 10.4;
    ctx.beginPath();
    ctx.moveTo(e2x, e2y);
    ctx.lineTo(e1x, e1y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,235,225,.5)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(e2x * 0.94 + e1x * 0.06 + nxs * 2.8, e2y * 0.94 + e1y * 0.06 + nys * 2.8);
    ctx.lineTo(e1x * 0.94 + e2x * 0.06 + nxs * 2.8, e1y * 0.94 + e2y * 0.06 + nys * 2.8);
    ctx.stroke();
    // 빨대의 (−)전하 — elecKit 전자 알갱이
    for (const u of [-0.62, 0, 0.62]) {
      drawElectron(ctx, cx + (e1x - cx) * u, pinY + (e1y - pinY) * u, 4.6, 0.95);
    }

    // 전기력 시각화(도구가 영향권일 때) — 가까운 끝에 화살표 + 발광
    const nearX = nearSign > 0 ? e1x : e2x;
    const nearY = nearSign > 0 ? e1y : e2y;
    if (dNear < 172) {
      const ddx = toolX - nearX;
      const ddy = toolY - nearY;
      const dl = Math.hypot(ddx, ddy) || 1;
      const len = clamp(3400 / (dNear + 40), 12, 44);
      const dirS = tool === "fur" ? 1 : -1;
      drawForceArrow(ctx, nearX, nearY, (ddx / dl) * len * dirS, (ddy / dl) * len * dirS, {
        color: tool === "fur" ? "#FFC45A" : "#7ED6FF",
        width: 3.5,
        alpha: 0.92,
      });
      softGlow(ctx, nearX, nearY, 26, tool === "fur" ? ELEC.amber : ELEC.cyan, clamp(70 / (dNear + 10), 0.08, 0.4));
    }

    // 도구
    if (tool === "fur") {
      drawFur(ctx, toolX, toolY, 38, 28);
      drawPlus(ctx, toolX - 13, toolY - 6, 5.2);
      drawPlus(ctx, toolX + 10, toolY - 11, 5.2);
      drawPlus(ctx, toolX + 1, toolY + 9, 5.2);
    } else {
      drawBlueRod(ctx, toolX, toolY, 92, 17);
      drawElectron(ctx, toolX - 26, toolY, 4.8);
      drawElectron(ctx, toolX, toolY, 4.8);
      drawElectron(ctx, toolX + 26, toolY, 4.8);
    }
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(174,196,228,.75)";
    ctx.fillText(tool === "fur" ? "문지른 털가죽 (+)" : "문지른 파란 빨대 (−)", toolX, toolY + 42);
    // 잡기 유도(아직 안 잡았을 때 — 숨 쉬는 링)
    if (!everGrabbed) {
      const pulse = 30 + Math.sin(tMs / 300) * 4;
      ctx.strokeStyle = "rgba(255,194,77,.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(toolX, toolY, pulse + 14, pulse, 0, 0, TAU);
      ctx.stroke();
    }

    // HUD 상태 필
    const st = dNear < 172 ? tool : "idle";
    if (st !== hudState) {
      hudState = st;
      if (st === "fur") {
        stateTxt.textContent = "다른 전기 — 끌어당김!";
        stateDot.style.background = "#FFC45A";
      } else if (st === "blue") {
        stateTxt.textContent = "같은 전기 — 밀어냄!";
        stateDot.style.background = "#7ED6FF";
      } else {
        stateTxt.textContent = "전기력 관찰 중";
        stateDot.style.background = "#8CA2C0";
      }
    }
  });

  api.setCTA("끌림·밀림·세기, 셋 다 관찰!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
  };
};

/* ══════════════════════════════════════════════════════════════════
 * rubLab — 전자 이동 관측소 (책 245쪽 대전 원리)
 * ══════════════════════════════════════════════════════════════════ */

const MAX_MOVE = 3;

export const rubLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "lt-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      "aria-label": "문지르기 실험 무대. 빨대를 잡아 털가죽 위에서 좌우로 문질러 보세요. 화살표 키로도 움직일 수 있어요.",
    },
  });
  const countTxt = el("span", { text: "전자 이동 0/3" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#4A90E0" }), countTxt)),
    toastEl,
    el("div", { class: "stage-cap", text: "(+)알갱이는 제자리 — 이동하는 건 전자(−)뿐이에요" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge elec", dataset: { g: "move" } }, el("b", { text: "전자 이동" }), el("span", { text: "문질러 3개" })),
    el("div", { class: "pn-badge elec", dataset: { g: "kind" } }, el("b", { text: "대전 종류" }), el("span", { text: "빨대는?" })),
    el("div", { class: "pn-badge elec", dataset: { g: "pull" } }, el("b", { text: "전기력" }), el("span", { text: "둘 사이엔?" })),
  );

  // 대전 종류 탭 퀴즈(3개 이동 후 등장)
  const plusBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "(+)전기" }));
  const minusBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "(−)전기" }));
  const quizRow = el("div", { class: "gp-controls", style: "display:none" }, plusBtn, minusBtn);
  // 인력 확인 버튼(퀴즈 정답 후 등장)
  const pullBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "서로 다른 전기 = 끌어당김!" }));
  const pullRow = el("div", { class: "gp-controls", style: "display:none" }, pullBtn);

  const helper = el("div", {
    class: "helper",
    html: "털가죽도 빨대도 지금은 (+)4개·전자(−) 4개 — <b>중성</b>이에요. 빨대를 <b>잡아 털가죽 위로</b> 가져가 <b>좌우로 문질러</b> 보세요. 왕복 1회마다 전자가 한 개씩 넘어가요.",
  });
  host.append(goalChips, helper, stage, quizRow, pullRow); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let H = CVH;
  const CY = 148;
  let sx = -1; // 빨대 중심(첫 프레임에 홈 배치)
  let sy = CY;
  let dragging = false;
  let grabDX = 0;
  let grabDY = 0;
  let departed = 0; // 털가죽을 떠난 전자 수(카운터는 즉시 반영)
  let landed = 0; // 빨대에 도착한 전자 수
  let rubDir = 0;
  let rubSwing = 0;
  let rubLastX = 0;
  let halfStrokes = 0;
  let returned = false; // 3개 이동 후 홈 복귀 완료
  let quizShown = false;
  const flights: { t: number; slot: number; toSlot: number }[] = [];
  const sparks: { x: number; y: number; life: number }[] = [];
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  // 슬롯(중심 상대 좌표) — 털가죽 (+)4·전자 4, 빨대 (+)4·전자 4+획득 3
  const FUR_RX = 84;
  const FUR_RY = 58;
  const furPlus = [[-40, -20], [6, -32], [36, -4], [-12, 18]] as const;
  const furElec = [[-18, -8], [24, -20], [44, 14], [2, 34]] as const;
  const ROD_W = 150;
  const ROD_H = 46;
  const rodPlus = [[-52, -11], [-17, -11], [17, -11], [52, -11]] as const;
  const rodElec = [[-52, 11], [-17, 11], [17, 11], [52, 11]] as const;
  const rodGain = [[-34, 0], [0, 0], [34, 0]] as const;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function collect(id: string, subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "마찰 전기 = <b>전자의 이사</b>예요! 전자를 <b>잃으면 (+), 얻으면 (−)</b>로 대전돼요 — 그리고 <b>원자핵(+)은 절대 움직이지 않아요</b>. 서로 다른 전기가 된 둘은 이렇게 끌어당기죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 문지르기 감지: 겹친 채 x 왕복(방향 반전 2회 = 1왕복) ----
  function furX(): number {
    return Math.max(96, W * 0.27);
  }
  function homeX(): number {
    return Math.min(W - 92, W * 0.74);
  }
  function overlapped(): boolean {
    return Math.abs(sx - furX()) < 84 && Math.abs(sy - CY) < 72;
  }
  function trackRub(): void {
    if (!overlapped()) {
      rubDir = 0;
      rubSwing = 0;
      halfStrokes = 0;
      rubLastX = sx;
      return;
    }
    const dx = sx - rubLastX;
    rubLastX = sx;
    if (Math.abs(dx) < 0.5) return;
    const d = Math.sign(dx);
    if (rubDir === 0) rubDir = d;
    else if (d !== rubDir) {
      if (rubSwing > 20) {
        halfStrokes += 1;
        if (departed < MAX_MOVE) sparks.push({ x: sx - d * 20, y: sy + ROD_H / 2 + 4, life: 1 });
        if (halfStrokes >= 2) {
          halfStrokes = 0;
          if (departed < MAX_MOVE) {
            flights.push({ t: 0, slot: departed, toSlot: departed });
            departed += 1;
            haptic(HAPTIC.select);
          }
        }
      }
      rubDir = d;
      rubSwing = 0;
    }
    rubSwing += Math.abs(dx);
  }

  // ---- 입력 ----
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (Math.abs(px - sx) > 86 || Math.abs(py - sy) > 36) return;
    dragging = true;
    grabDX = sx - px;
    grabDY = sy - py;
    rubLastX = sx;
    rubDir = 0;
    rubSwing = 0;
    capturePointer(canvas, e);
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    sx = clamp(e.clientX - r.left + grabDX, 80, W - 80);
    sy = clamp(e.clientY - r.top + grabDY, 62, H - 46);
    trackRub();
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft") sx -= 16;
    else if (e.key === "ArrowRight") sx += 16;
    else if (e.key === "ArrowUp") sy -= 14;
    else if (e.key === "ArrowDown") sy += 14;
    else return;
    e.preventDefault();
    sx = clamp(sx, 80, W - 80);
    sy = clamp(sy, 62, H - 46);
    trackRub();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 탭 퀴즈 · 인력 확인 ----
  plusBtn.addEventListener("click", () => {
    if (goals.has("kind")) return;
    haptic(HAPTIC.wrong);
    toast("다시 생각해 봐요!");
    helper.innerHTML = "(+)는 전자를 <b>잃은</b> 쪽이에요. 빨대는 전자를 <b>얻었죠</b> — 전자의 전기는 (−)! 다시 골라 봐요.";
  });
  minusBtn.addEventListener("click", () => {
    if (goals.has("kind")) return;
    haptic(HAPTIC.correct);
    collect("kind", "(−)전기!", "정답 — 전자를 얻으면 (−)!");
    helper.innerHTML =
      "맞아요! 전자(−)를 <b>얻은 빨대는 (−)전기</b>, <b>잃은 털가죽은 (+)전기</b>로 대전됐어요. 이제 두 물체 사이의 화살표를 확인!";
    quizRow.style.display = "none";
    pullRow.style.display = "";
  });
  pullBtn.addEventListener("click", () => {
    if (goals.has("pull")) return;
    pullBtn.classList.remove("pulse");
    pullBtn.classList.add("done-static");
    collect("pull", "인력!", "서로 다른 전기 = 인력!");
  });

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const fx = furX();
    if (sx < 0) sx = homeX();
    sx = clamp(sx, 80, W - 80);

    // 3개 이동 완료 → 손을 놓으면 홈으로 스르륵 복귀 → 인력 표시 + 퀴즈 등장
    if (departed >= MAX_MOVE && flights.length === 0 && !dragging && !returned) {
      sx += (homeX() - sx) * Math.min(1, 0.09 * dt);
      sy += (CY - sy) * Math.min(1, 0.09 * dt);
      if (Math.hypot(sx - homeX(), sy - CY) < 3) {
        sx = homeX();
        sy = CY;
        returned = true;
      }
    }
    if (returned && !quizShown) {
      quizShown = true;
      quizRow.style.display = "";
      helper.innerHTML = "전자 3개가 이사를 마쳤어요. 그럼 퀴즈 — 전자를 얻은 <b>빨대는 어느 전기</b>를 띠게 됐을까요? 위에서 골라 보세요.";
      window.setTimeout(() => quizRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }

    // ---- 털가죽 ----
    drawFur(ctx, fx, CY, FUR_RX, FUR_RY);
    furPlus.forEach(([ox, oy]) => drawPlus(ctx, fx + ox, CY + oy, 6));
    furElec.forEach(([ox, oy], i) => {
      if (i < departed) return; // 떠난 전자(0번부터 순서대로)
      const wob = Math.sin(tMs / 420 + i * 1.9) * 1.2;
      drawElectron(ctx, fx + ox, CY + oy + wob, 5.4);
    });

    // ---- 인력 화살표(3개 이동 + 복귀 후) ----
    if (returned) {
      const pulse = 34 + Math.sin(tMs / 280) * 5;
      const dirS = sx >= fx ? 1 : -1; // 빨대가 어느 쪽에 있든 서로를 향한다
      drawForceArrow(ctx, fx + (FUR_RX + 10) * dirS, CY, pulse * dirS, 0, { color: "#FFC45A", width: 4.5, alpha: 0.95 });
      drawForceArrow(ctx, sx - (ROD_W / 2 + 10) * dirS, sy, -pulse * dirS, 0, { color: "#FFC45A", width: 4.5, alpha: 0.95 });
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,214,138,.9)";
      ctx.fillText("서로 끌어당겨요", (fx + sx) / 2, Math.min(CY, sy) - 34);
    }

    // ---- 빨대(털가죽 위로 문지르므로 나중에 그린다) ----
    drawBlueRod(ctx, sx, sy, ROD_W, ROD_H);
    rodPlus.forEach(([ox, oy]) => drawPlus(ctx, sx + ox, sy + oy, 5.4));
    rodElec.forEach(([ox, oy], i) => {
      const wob = Math.sin(tMs / 380 + i * 2.3) * 1;
      drawElectron(ctx, sx + ox, sy + oy + wob, 5);
    });
    rodGain.forEach(([ox, oy], i) => {
      if (i >= landed) return;
      const wob = Math.sin(tMs / 360 + i * 2.7) * 1;
      drawElectron(ctx, sx + ox, sy + oy + wob, 5);
    });

    // ---- 이동 중인 전자(곡선 점프) ----
    for (let i = flights.length - 1; i >= 0; i--) {
      const fl = flights[i];
      fl.t = Math.min(1, fl.t + 0.03 * dt);
      const from = furElec[fl.slot];
      const to = rodGain[fl.toSlot];
      const x0 = fx + from[0];
      const y0 = CY + from[1];
      const x1 = sx + to[0];
      const y1 = sy + to[1];
      const cxp = (x0 + x1) / 2;
      const cyp = Math.min(y0, y1) - 64;
      const t = fl.t;
      const mt = 1 - t;
      const bx = mt * mt * x0 + 2 * mt * t * cxp + t * t * x1;
      const by = mt * mt * y0 + 2 * mt * t * cyp + t * t * y1;
      softGlow(ctx, bx, by, 18, ELEC.cyan, 0.35);
      drawElectron(ctx, bx, by, 6);
      if (fl.t >= 1) {
        flights.splice(i, 1);
        landed += 1;
        haptic(HAPTIC.tap);
        countTxt.textContent = `전자 이동 ${landed}/3`;
        if (landed >= MAX_MOVE) {
          collect("move", "3개 완료!", "전자 3개 이동 완료!");
          if (!goals.has("kind")) helper.innerHTML = "3개 이동 완료! <b>전자가 이사 가는 것</b> — 이게 마찰 전기의 정체예요. 빨대를 놓으면 결과를 정리해 볼게요.";
        } else {
          toast(`전자 이동! 털가죽 +${landed} · 빨대 −${landed}`);
          helper.innerHTML = `전자 ${landed}개째! 털가죽은 전자를 잃어 <b>+${landed}</b>, 빨대는 얻어서 <b>−${landed}</b> — <b>(+)알갱이는 그대로</b>인 것 보이죠? 계속 문질러요.`;
        }
      }
    }

    // ---- 마찰 스파크 ----
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.life -= 0.055 * dt;
      if (sp.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      drawSpark(ctx, sp.x, sp.y, 13, sp.life);
    }

    // ---- 전하 카운터 라벨 ----
    ctx.font = "800 12.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = departed > 0 ? "#FFB08C" : "rgba(196,212,232,.75)";
    ctx.fillText(departed > 0 ? `털가죽 +${departed}` : "털가죽 · 중성", fx, CY + FUR_RY + 26);
    ctx.fillStyle = landed > 0 ? "#9CD2FF" : "rgba(196,212,232,.75)";
    ctx.fillText(landed > 0 ? `빨대 −${landed}` : "빨대 · 중성", sx, sy + ROD_H / 2 + 24);

    // ---- 유도 힌트 ----
    if (departed === 0) {
      const bob = Math.sin(tMs / 300) * 4;
      if (!overlapped() && !dragging) {
        // 빨대를 털가죽 쪽으로
        drawForceArrow(ctx, sx - ROD_W / 2 - 8 + bob, sy - 34, -46, 0, { color: "#FFC45A", width: 3.5, alpha: 0.7 });
      } else if (overlapped()) {
        // 좌우로 문지르기
        drawForceArrow(ctx, fx - 16 + bob, CY - FUR_RY - 24, -30, 0, { color: "#FFC45A", width: 3.2, alpha: 0.75 });
        drawForceArrow(ctx, fx + 16 - bob, CY - FUR_RY - 24, 30, 0, { color: "#FFC45A", width: 3.2, alpha: 0.75 });
      }
    }
  });

  api.setCTA("문질러서 전자를 옮겨 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
  };
};
