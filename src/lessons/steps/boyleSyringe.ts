// boyleSyringe — 보일 법칙 랩(VI 단원 L2). 교과서 탐구(200~203쪽)의 조작판.
//   · 가로 주사기: 피스톤을 끌어 부피를 24→6 mL로 — 압력은 P·V=24로 반비례(1→24, 2→12, 4→6, 자체 수치)
//   · 속 입자는 GasBox — 좁아질수록 벽 충돌이 잦아지는 게 눈에 보인다(속력은 그대로 = 온도 일정)
//   · 하단 실시간 그래프(교과서 VI-3 축: x=압력(기압), y=부피(mL)) — 반비례 곡선이 그려진다
// 목표: ① 2기압(12 mL) ② 4기압(6 mL) ③ 1기압으로 복귀(24 mL).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { GasBox } from "../../ui/gasKit";
import { glassStrokeStyle, contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface BoyleStep {
  title: string;
  lead?: string;
  cta?: string;
}

const PV = 24; // P(기압) × V(mL) = 24
const V_MIN = 6;
const V_MAX = 24;
const CVH = 400;
const LABH = 288;

export const boyleSyringe: StepRenderer = (host, step, api) => {
  const s = step as unknown as BoyleStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "피스톤을 끌어 기체의 부피 조절. 좌우 화살표 키로도 조절해요.",
      "aria-valuemin": String(V_MIN),
      "aria-valuemax": String(V_MAX),
      "aria-valuenow": String(V_MAX),
    },
  });
  const readVal = el("span", { text: "1.0" });
  const volPill = el("span", { text: "부피 24 mL" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "피스톤 손잡이를 잡고 밀거나 당겨 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5AA2F8" }), volPill),
      el("div", { class: "tempread" }, readVal, el("small", { text: " 기압" })),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "p2" } }, el("b", { text: "2기압 만들기" }), el("span", { text: "부피는?" })),
    el("div", { class: "pn-badge", dataset: { g: "p4" } }, el("b", { text: "4기압 만들기" }), el("span", { text: "더 누르면?" })),
    el("div", { class: "pn-badge", dataset: { g: "back" } }, el("b", { text: "1기압 복귀" }), el("span", { text: "되돌리면?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "24 mL·1기압에서 시작. 피스톤을 <b>천천히 눌러</b> 보세요 — 입자 충돌이 어떻게 변하는지도 관찰!",
  });
  host.append(goalChips, stage, helper);

  // ---- 상태 ----
  let W = 340;
  let H = CVH;
  let vol = V_MAX; // mL
  let dragging = false;
  let dragStartX = 0;
  let dragStartVol = V_MAX;
  const gas = new GasBox(1.15);
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let holdMs = { p2: 0, p4: 0, back: 0 };
  const samples: { p: number; v: number }[] = [];

  const pres = (): number => PV / vol;

  // 주사기 기하(가로) — 몸통은 고정, 피스톤 면이 좌우로
  const bx0 = (): number => 34; // 몸통 왼끝(피스톤 들어오는 쪽)
  const bx1 = (): number => W - 92; // 몸통 오른끝(마개 쪽)
  const byc = (): number => 128;
  const bh = 92;
  const chamberX = (): number => bx1() - ((vol - 0) / V_MAX) * (bx1() - bx0() - 6); // 피스톤 면 x

  function bounds() {
    return { x0: chamberX() + 3, y0: byc() - bh / 2 + 4, x1: bx1() - 3, y1: byc() + bh / 2 - 4 };
  }

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
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
        "이게 <b>보일 법칙</b> — 온도가 일정할 때 압력과 부피는 <b>반비례</b>해요 (1기압×24 = 2기압×12 = 4기압×6). 입자의 <b>속력은 그대로</b>, 공간이 좁아져 <b>충돌이 잦아진</b> 것뿐!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 입력 ----
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const py = e.clientY - r.top;
    if (py > LABH) return; // 그래프 영역 제외
    dragging = true;
    dragStartX = e.clientX - r.left;
    dragStartVol = vol;
    capEl.style.transition = "opacity .4s";
    capEl.style.opacity = "0";
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    const dx = e.clientX - r.left - dragStartX;
    const mlPerPx = V_MAX / (bx1() - bx0() - 6);
    vol = clamp(dragStartVol - dx * mlPerPx, V_MIN, V_MAX);
    canvas.setAttribute("aria-valuenow", vol.toFixed(0));
  };
  const onUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft") vol = clamp(vol + 1, V_MIN, V_MAX);
    else if (e.key === "ArrowRight") vol = clamp(vol - 1, V_MIN, V_MAX);
    else return;
    e.preventDefault();
    canvas.setAttribute("aria-valuenow", vol.toFixed(0));
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 그래프(교과서 VI-3 축: x=압력, y=부피) ----
  function drawGraph(ctx: CanvasRenderingContext2D, tMs: number): void {
    const gx0 = 48;
    const gx1 = W - 18;
    const gy0 = LABH + 16;
    const gy1 = H - 24;
    const xOf = (p: number): number => gx0 + ((p - 0.5) / 4) * (gx1 - gx0); // 0.5~4.5기압
    const yOf = (v: number): number => gy1 - ((v - 4) / 24) * (gy1 - gy0); // 4~28mL

    ctx.strokeStyle = "rgba(148,168,196,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 4);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(196,212,232,.75)";
    ctx.textAlign = "right";
    for (const v of [24, 12, 6]) {
      ctx.strokeStyle = "rgba(148,168,196,.14)";
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(v));
      ctx.lineTo(gx1, yOf(v));
      ctx.stroke();
      ctx.fillText(String(v), gx0 - 6, yOf(v) + 3.5);
    }
    ctx.textAlign = "center";
    for (const p of [1, 2, 3, 4]) {
      ctx.fillText(String(p), xOf(p), gy1 + 13);
    }
    ctx.textAlign = "left";
    ctx.fillText("부피(mL)", gx0 + 4, gy0 - 6);
    ctx.textAlign = "right";
    ctx.fillText("압력(기압) →", gx1, gy0 - 6);

    // 이론 곡선(연하게, 반비례 안내선)
    ctx.strokeStyle = "rgba(120,190,255,.18)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    let first = true;
    for (let p = 0.95; p <= 4.3; p += 0.05) {
      const x = xOf(p);
      const y = yOf(PV / p);
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // 방문 샘플
    ctx.fillStyle = "rgba(120,190,255,.55)";
    for (const smp of samples) {
      ctx.beginPath();
      ctx.arc(xOf(smp.p), yOf(smp.v), 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    // 현재 점
    const cxg = xOf(pres());
    const cyg = yOf(vol);
    ctx.fillStyle = "rgba(120,190,255,.25)";
    ctx.beginPath();
    ctx.arc(cxg, cyg, 8 + Math.sin(tMs / 260), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9CD2FF";
    ctx.beginPath();
    ctx.arc(cxg, cyg, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- 프레임 ----
  let shown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const x0 = bx0();
    const x1 = bx1();
    const yc = byc();
    const b = bounds();

    gas.setCount(14, b);
    gas.step(dt, b, 1);

    // 목표 판정(±0.6mL 창에서 400ms 유지)
    const near = (target: number): boolean => Math.abs(vol - target) < 0.6;
    holdMs.p2 = near(12) ? holdMs.p2 + dt * 16.7 : 0;
    holdMs.p4 = near(6.2) || vol <= 6.4 ? holdMs.p4 + dt * 16.7 : 0;
    holdMs.back = near(24) || vol >= 23.4 ? holdMs.back + dt * 16.7 : 0;
    if (holdMs.p2 > 400) collect("p2", "12 mL!", "2기압 — 부피가 절반(12 mL)");
    if (goals.has("p2") && holdMs.p4 > 400) collect("p4", "6 mL!", "4기압 — 부피가 1/4(6 mL)");
    if (goals.has("p4") && holdMs.back > 400) collect("back", "24 mL!", "당기면 도로 1기압 — 반비례!");

    // 샘플 기록
    const last = samples[samples.length - 1];
    if (!last || Math.abs(last.v - vol) > 0.25) samples.push({ p: pres(), v: vol });
    if (samples.length > 240) samples.shift();

    // ---- 그리기 ----
    contactShadow(ctx, (x0 + x1) / 2, yc + bh / 2 + 16, (x1 - x0) * 0.5, 0.22);

    // 몸통 유리(원통 그라데이션)
    const bodyG = ctx.createLinearGradient(0, yc - bh / 2, 0, yc + bh / 2);
    bodyG.addColorStop(0, "rgba(214,232,252,.28)");
    bodyG.addColorStop(0.18, "rgba(255,255,255,.42)");
    bodyG.addColorStop(0.5, "rgba(190,214,240,.14)");
    bodyG.addColorStop(1, "rgba(150,178,210,.22)");
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.roundRect(x0, yc - bh / 2, x1 - x0, bh, 10);
    ctx.fill();
    ctx.strokeStyle = glassStrokeStyle(ctx, yc - bh / 2, yc + bh / 2);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 눈금(24~6mL)
    ctx.font = "600 9.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    for (let mv = 6; mv <= 24; mv += 6) {
      const mx = x1 - (mv / V_MAX) * (x1 - x0 - 6);
      ctx.strokeStyle = "rgba(226,240,255,.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mx, yc + bh / 2 - 12);
      ctx.lineTo(mx, yc + bh / 2 - 4);
      ctx.stroke();
      ctx.fillStyle = "rgba(196,214,236,.7)";
      ctx.fillText(String(mv), mx, yc + bh / 2 + 14);
    }

    // 마개(오른쪽 노즐)
    ctx.fillStyle = "rgba(150,178,210,.5)";
    ctx.beginPath();
    ctx.roundRect(x1, yc - 12, 18, 24, 5);
    ctx.fill();
    const capG = ctx.createLinearGradient(0, yc - 10, 0, yc + 10);
    capG.addColorStop(0, "#7FB2E8");
    capG.addColorStop(1, "#3E6EA8");
    ctx.fillStyle = capG;
    ctx.beginPath();
    ctx.roundRect(x1 + 16, yc - 9, 12, 18, 4);
    ctx.fill();

    // 기체 입자(피스톤 오른쪽 공간)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(b.x0 - 2, b.y0 - 2, b.x1 - b.x0 + 4, b.y1 - b.y0 + 4, 8);
    ctx.clip();
    gas.draw(ctx, 205, 1);
    ctx.restore();

    // 피스톤(면 + 축 + 손잡이)
    const px = chamberX();
    const rodG = ctx.createLinearGradient(0, yc - 7, 0, yc + 7);
    rodG.addColorStop(0, "#E8F2FC");
    rodG.addColorStop(1, "#9FB6CE");
    ctx.fillStyle = rodG;
    ctx.beginPath();
    ctx.roundRect(x0 - 26, yc - 6, px - x0 + 26, 12, 5);
    ctx.fill();
    const faceG = ctx.createLinearGradient(0, yc - bh / 2, 0, yc + bh / 2);
    faceG.addColorStop(0, "#5B87B8");
    faceG.addColorStop(0.5, "#DCEBFA");
    faceG.addColorStop(1, "#46688E");
    ctx.fillStyle = faceG;
    ctx.beginPath();
    ctx.roundRect(px - 7, yc - bh / 2 + 3, 12, bh - 6, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(30,52,76,.65)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 손잡이(왼쪽 밖)
    const hg = ctx.createLinearGradient(0, yc - 26, 0, yc + 26);
    hg.addColorStop(0, "#8FB6E4");
    hg.addColorStop(0.5, "#5D8CC2");
    hg.addColorStop(1, "#3D6494");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.roundRect(x0 - 40, yc - 26, 16, 52, 7);
    ctx.fill();
    ctx.strokeStyle = "rgba(24,42,64,.6)";
    ctx.stroke();
    // 잡기 유도
    if (!dragging && !finished && vol > 23) {
      const bob = Math.sin(tMs / 300) * 4;
      ctx.strokeStyle = "rgba(255,194,77,.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0 - 58 + bob, yc);
      ctx.lineTo(x0 - 76 + bob, yc);
      ctx.moveTo(x0 - 70 + bob, yc - 6);
      ctx.lineTo(x0 - 76 + bob, yc);
      ctx.lineTo(x0 - 70 + bob, yc + 6);
      ctx.stroke();
    }

    // 충돌률 미니 게이지(몸통 위) — "충돌이 잦아진다"의 시각 증거
    const rate = clamp(gas.hitRate() / 240, 0, 1);
    ctx.fillStyle = "rgba(214,230,250,.55)";
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("벽 충돌", x0 + 2, yc - bh / 2 - 18);
    ctx.strokeStyle = "rgba(148,168,196,.35)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0 + 44, yc - bh / 2 - 21);
    ctx.lineTo(x0 + 44 + 120, yc - bh / 2 - 21);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,176,90,.85)";
    ctx.beginPath();
    ctx.moveTo(x0 + 44, yc - bh / 2 - 21);
    ctx.lineTo(x0 + 44 + 120 * rate, yc - bh / 2 - 21);
    ctx.stroke();

    drawGraph(ctx, tMs);

    // HUD
    const txt = pres().toFixed(1);
    if (txt !== shown) {
      shown = txt;
      readVal.textContent = txt;
      volPill.textContent = `부피 ${vol.toFixed(0)} mL · ${txt}기압 × ${vol.toFixed(0)} = ${(pres() * vol).toFixed(0)}`;
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("2기압 → 4기압 → 복귀, 차례로!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
  };
};
