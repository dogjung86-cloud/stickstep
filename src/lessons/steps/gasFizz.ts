// gasFizz — 기체 용해도 랩(중2 I 물질의 특성). 탄산음료 기포 해보기의 조작판.
//   · 물중탕 비커 속 탄산음료 시험관 + 감압 펌프·압력 게이지
//   · 온도 슬라이더(0~60℃)와 펌프(3단 감압)로 기포 생성률이 변한다:
//     기포율 = 기본 × 온도 계수(높을수록↑) × 압력 계수(낮을수록↑)
// 목표: ① 45℃ 이상으로 데우기 ② 펌프 3회로 최저 압력 ③ 0~10℃·정상 압력에서 3초 잠잠하게.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { glassStrokeStyle, contactShadow, softGlow } from "../../ui/labProps";
import { tempColor } from "../../ui/thermo";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface GasFizzStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const T_MIN = 0;
const T_MAX = 60;
const STAGES = [1.0, 0.7, 0.4, 0.2]; // 펌프 단계별 압력(기압)
const CVH = 328;

interface Bubble {
  x: number;
  y: number;
  vy: number;
  r: number;
  seed: number;
}
interface Pop {
  x: number;
  y: number;
  r: number;
  life: number;
}

export const gasFizz: StepRenderer = (host, step, api) => {
  const s = step as unknown as GasFizzStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const tempPill = el("span", { text: "온도 20℃" });
  const tempDot = el("span", { class: "pdot", style: "background:#6EA8FF" });
  const pressPill = el("span", { text: "압력 1.0기압" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "온도와 압력을 바꾸며 기포를 관찰해 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, tempDot, tempPill),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#B197FC" }), pressPill),
    ),
    toastEl,
    capEl,
  );

  // 온도 슬라이더(공용 커스텀 슬라이더 문법)
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const fillEl = el("div", { class: "sl-fill" });
  const track = el("div", { class: "sl-track temp" }, fillEl, thumb);
  const slider = el(
    "div",
    {
      class: "slider hp-slider",
      attrs: {
        role: "slider",
        tabindex: "0",
        "aria-label": "물중탕 온도",
        "aria-valuemin": String(T_MIN),
        "aria-valuemax": String(T_MAX),
        "aria-valuenow": "20",
        "aria-valuetext": "20도",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "얼음물 0℃" }), el("span", { text: "뜨거운 물 60℃" })),
  );

  const resetBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "뚜껑 열기" }));
  const pumpBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "펌프로 감압" }));
  const ctlRow = el("div", { class: "fp-controls" }, resetBtn, pumpBtn);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "warm" } }, el("b", { text: "데우면?" }), el("span", { text: "45℃ 이상" })),
    el("div", { class: "pn-badge chem", dataset: { g: "pump" } }, el("b", { text: "압력 빼면?" }), el("span", { text: "펌프 3회" })),
    el("div", { class: "pn-badge chem", dataset: { g: "calm" } }, el("b", { text: "잠잠하게" }), el("span", { text: "차갑게 3초" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "탄산음료 속엔 이산화 탄소 기체가 <b>녹아</b> 있어요. 온도와 압력을 바꾸면 기포가 어떻게 될까요?",
  });
  host.append(goalChips, helper, stage, slider, ctlRow); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let temp = 20;
  let pStage = 0; // 펌프 단계 0..3
  let dispP = 1.0; // 표시 압력(관성)
  let pumpAnim = 0; // 피스톤 애니 0..1
  let kick = 0; // 게이지 바늘 떨림
  let spawnAcc = 0;
  const bubbles: Bubble[] = [];
  const pops: Pop[] = [];
  const holdMs = { warm: 0, calm: 0 };
  let calmHint = false;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }
  function hideCap(): void {
    if (capHidden) return;
    capHidden = true;
    capEl.style.transition = "opacity .4s";
    capEl.style.opacity = "0";
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
        "기체의 용해도는 <b>온도가 높을수록, 압력이 낮을수록</b> 작아져요. 그래서 기체 용해도엔 온도·압력을 함께 표시해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (goals.has("warm") && goals.has("pump") && !goals.has("calm")) {
      helper.innerHTML = "이제 반대로 — <b>차갑게 식히고 뚜껑을 열어 압력을 되돌린 뒤</b> 가만히 두면?";
    }
  }

  // ---- 슬라이더 ----
  const t01 = (v: number): number => (v - T_MIN) / (T_MAX - T_MIN);
  function setSliderUI(): void {
    const f = t01(temp) * 100;
    thumb.style.left = `${f}%`;
    fillEl.style.width = `${f}%`;
    (thumb.firstChild as HTMLElement).style.background = tempColor(t01(temp));
    slider.setAttribute("aria-valuenow", String(Math.round(temp)));
    slider.setAttribute("aria-valuetext", `${Math.round(temp)}도`);
  }
  function setTempFromClientX(cxv: number): void {
    const rect = track.getBoundingClientRect();
    temp = clamp(T_MIN + ((cxv - rect.left) / rect.width) * (T_MAX - T_MIN), T_MIN, T_MAX);
    setSliderUI();
  }
  let sliderDrag = false;
  slider.addEventListener("pointerdown", (e) => {
    sliderDrag = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    setTempFromClientX(e.clientX);
    hideCap();
    haptic(HAPTIC.tap);
  });
  slider.addEventListener("pointermove", (e) => {
    if (sliderDrag) setTempFromClientX(e.clientX);
  });
  const endSlider = (): void => {
    sliderDrag = false;
    slider.classList.remove("drag");
  };
  slider.addEventListener("pointerup", endSlider);
  slider.addEventListener("pointercancel", endSlider);
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") temp = clamp(temp + 5, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") temp = clamp(temp - 5, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    hideCap();
    setSliderUI();
  });
  requestAnimationFrame(setSliderUI);

  // ---- 펌프 · 리셋 ----
  pumpBtn.addEventListener("click", () => {
    if (pStage >= 3) {
      toast("더 못 빼요 — 최저 압력이에요!");
      return;
    }
    pStage++;
    pumpAnim = 1;
    kick = 1;
    pumpBtn.classList.remove("pulse");
    hideCap();
    haptic(HAPTIC.tap);
    if (pStage === 3) collect("pump", "콸콸!", "압력을 빼니 기포가 콸콸!");
    else toast(`슉 — 압력 ${STAGES[pStage].toFixed(1)}기압`);
  });
  resetBtn.addEventListener("click", () => {
    if (pStage === 0) {
      toast("이미 새 공기 — 1.0기압이에요");
      return;
    }
    pStage = 0;
    kick = 1;
    hideCap();
    haptic(HAPTIC.tap);
    toast("뚜껑을 열어 새 공기 — 1.0기압");
  });

  // ---- 프레임 ----
  let shown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;

    dispP += (STAGES[pStage] - dispP) * Math.min(1, 0.1 * dt);
    pumpAnim = Math.max(0, pumpAnim - 0.05 * dt);
    kick *= Math.pow(0.93, dt);
    const warm01 = t01(temp);

    // 기포 생성률(개/초) = 기본 × 온도 계수 × 압력 계수
    const rate = 7 * (0.05 + Math.pow(warm01, 1.5) * 1.65) * (1 + (1 - dispP) * 3.4);

    // 배치 기하
    const cx1 = W * 0.33; // 비커·시험관 중심
    const bkW = Math.min(W * 0.42, 150);
    const bkL = cx1 - bkW / 2;
    const bkR = cx1 + bkW / 2;
    const bkTop = 64;
    const bkBot = CVH - 32;
    const wTop = 98; // 물중탕 수면
    const thw = 19; // 시험관 반폭
    const tubeTop = 44;
    const arcY = CVH - 76; // 시험관 바닥 반원 중심
    const sodaY = 118; // 음료 수면

    // 기포 스폰
    spawnAcc += rate * ((dt * 16.7) / 1000);
    while (spawnAcc >= 1 && bubbles.length < 90) {
      spawnAcc -= 1;
      const pick = Math.random();
      let bx: number;
      let by: number;
      if (pick < 0.55) {
        bx = cx1 + (Math.random() - 0.5) * (thw * 1.5);
        by = arcY + 6 - Math.random() * 14;
      } else {
        bx = pick < 0.78 ? cx1 - thw + 6 : cx1 + thw - 6;
        by = sodaY + 22 + Math.random() * (arcY - sodaY - 26);
      }
      bubbles.push({ x: bx, y: by, vy: -0.1, r: 0.9 + Math.random() * 1.0, seed: Math.random() });
    }
    if (spawnAcc > 1) spawnAcc = 1;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.vy = Math.max(b.vy - (0.02 + b.r * 0.006) * dt, -1.7);
      b.y += b.vy * dt;
      b.r = Math.min(b.r + (0.005 + (1 - dispP) * 0.004) * dt, 3.6);
      b.x += Math.sin(tMs / 380 + b.seed * 9) * 0.14 * dt;
      if (b.y - b.r <= sodaY + 2) {
        pops.push({ x: b.x, y: sodaY + 1, r: b.r, life: 1 });
        bubbles.splice(i, 1);
      }
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i];
      p.r += 0.4 * dt;
      p.life -= 0.07 * dt;
      if (p.life <= 0) pops.splice(i, 1);
    }

    // 목표 판정
    holdMs.warm = temp >= 45 ? holdMs.warm + dt * 16.7 : 0;
    if (holdMs.warm > 400) collect("warm", "보글보글!", "따뜻할수록 기체는 덜 녹아요");
    const calmCond = temp <= 10 && pStage === 0;
    holdMs.calm = calmCond ? holdMs.calm + dt * 16.7 : 0;
    if (!calmCond) calmHint = false;
    if (calmCond && !calmHint && !goals.has("calm") && holdMs.calm > 200) {
      calmHint = true;
      toast("좋아요 — 이대로 3초만 기다려요!");
    }
    if (holdMs.calm > 3000) collect("calm", "잠잠…", "차갑게·압력 그대로 — 탄산이 오래가요");

    // ---- 그리기: 물중탕 비커 ----
    contactShadow(ctx, cx1, bkBot + 6, bkW * 0.55, 0.24);
    if (warm01 > 0.6) softGlow(ctx, cx1, bkBot - 8, bkW * 0.6, "255,150,80", 0.1 * (warm01 - 0.6) * 2.5);
    const waterG = ctx.createLinearGradient(0, wTop, 0, bkBot);
    waterG.addColorStop(0, tempColor(warm01, 0.32));
    waterG.addColorStop(1, tempColor(warm01, 0.1));
    ctx.fillStyle = waterG;
    ctx.beginPath();
    ctx.roundRect(bkL + 3, wTop, bkW - 6, bkBot - wTop - 3, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bkL + 6, wTop);
    ctx.lineTo(bkR - 6, wTop);
    ctx.stroke();
    ctx.strokeStyle = glassStrokeStyle(ctx, bkTop, bkBot);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bkL, bkTop - 6);
    ctx.lineTo(bkL, bkBot - 8);
    ctx.quadraticCurveTo(bkL, bkBot, bkL + 8, bkBot);
    ctx.lineTo(bkR - 8, bkBot);
    ctx.quadraticCurveTo(bkR, bkBot, bkR, bkBot - 8);
    ctx.lineTo(bkR, bkTop - 6);
    ctx.stroke();
    // 얼음(차가울 때) · 김(뜨거울 때)
    if (temp < 8) {
      const ia = ((8 - temp) / 8) * 0.9;
      ctx.save();
      ctx.globalAlpha = ia;
      for (let k = 0; k < 2; k++) {
        const ix = bkL + 22 + k * (bkW - 58);
        const iy = wTop + 4 + Math.sin(tMs / 600 + k * 2.4) * 2;
        const ig = ctx.createLinearGradient(ix, iy, ix + 15, iy + 14);
        ig.addColorStop(0, "rgba(236,248,255,.85)");
        ig.addColorStop(1, "rgba(170,206,240,.5)");
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.roundRect(ix, iy, 16, 13, 3.5);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,160,205,.7)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.8)";
        ctx.beginPath();
        ctx.moveTo(ix + 3, iy + 3.5);
        ctx.lineTo(ix + 8, iy + 3.5);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (temp > 48) {
      const sa = ((temp - 48) / 12) * 0.3;
      ctx.strokeStyle = `rgba(226,240,255,${sa})`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let k = 0; k < 2; k++) {
        const sx0 = bkL + 30 + k * (bkW - 66);
        const sway = Math.sin(tMs / 460 + k * 2.2) * 6;
        ctx.beginPath();
        ctx.moveTo(sx0, bkTop - 8);
        ctx.quadraticCurveTo(sx0 + sway, bkTop - 22, sx0 - sway * 0.6, bkTop - 36);
        ctx.stroke();
      }
    }

    // ---- 시험관(탄산음료) ----
    const innerL = cx1 - thw + 4;
    const innerR = cx1 + thw - 4;
    // 음료(호박색) — 위 밝고 아래 가라앉는 톤
    ctx.beginPath();
    ctx.moveTo(innerL, sodaY);
    ctx.lineTo(innerL, arcY);
    ctx.arc(cx1, arcY, thw - 4, Math.PI, 0, true);
    ctx.lineTo(innerR, sodaY);
    ctx.closePath();
    const sodaG = ctx.createLinearGradient(0, sodaY, 0, arcY + thw);
    sodaG.addColorStop(0, "rgba(255,186,92,.34)");
    sodaG.addColorStop(1, "rgba(196,110,30,.16)");
    ctx.fillStyle = sodaG;
    ctx.fill();
    // 음료 수면 하이라이트
    ctx.strokeStyle = "rgba(255,226,170,.55)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(innerL + 2, sodaY);
    ctx.lineTo(innerR - 2, sodaY);
    ctx.stroke();
    // 기포(음료 안쪽 클립)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(innerL, sodaY - 6);
    ctx.lineTo(innerL, arcY);
    ctx.arc(cx1, arcY, thw - 4, Math.PI, 0, true);
    ctx.lineTo(innerR, sodaY - 6);
    ctx.closePath();
    ctx.clip();
    for (const b of bubbles) {
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, Math.max(0.5, b.r * 0.22), 0, Math.PI * 2);
      ctx.fill();
    }
    for (const p of pops) {
      ctx.strokeStyle = `rgba(255,255,255,${0.45 * Math.max(0, p.life)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 1, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // 시험관 유리 벽 + 둥근 바닥
    ctx.strokeStyle = glassStrokeStyle(ctx, tubeTop, arcY + thw);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx1 - thw, tubeTop);
    ctx.lineTo(cx1 - thw, arcY);
    ctx.arc(cx1, arcY, thw, Math.PI, 0, true);
    ctx.lineTo(cx1 + thw, tubeTop);
    ctx.stroke();
    // 좌측 스펙큘러
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx1 - thw + 5, tubeTop + 16);
    ctx.lineTo(cx1 - thw + 5, arcY - 6);
    ctx.stroke();
    // 고무 마개
    const stG = ctx.createLinearGradient(cx1 - thw, 0, cx1 + thw, 0);
    stG.addColorStop(0, "#9FB4D2");
    stG.addColorStop(0.5, "#DCE8F8");
    stG.addColorStop(1, "#6E86A8");
    ctx.fillStyle = stG;
    ctx.beginPath();
    ctx.roundRect(cx1 - thw - 2, tubeTop - 14, thw * 2 + 4, 17, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(44,62,88,.7)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // ---- 감압 펌프 + 게이지 ----
    const px = W * 0.8;
    const gy = 112;
    const gr = 28;
    // 호스(마개 → 펌프 몸통)
    ctx.strokeStyle = "rgba(150,172,200,.75)";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx1 + thw - 2, tubeTop - 6);
    ctx.bezierCurveTo(cx1 + 78, 6, px - 78, 46, px - 15, 176);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,240,255,.3)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx1 + thw - 2, tubeTop - 8);
    ctx.bezierCurveTo(cx1 + 78, 4, px - 78, 44, px - 16, 174);
    ctx.stroke();
    // 슉— 스트릭(펌프 직후)
    if (pumpAnim > 0.35) {
      const a = (pumpAnim - 0.35) * 1.3;
      ctx.strokeStyle = `rgba(180,214,255,${a})`;
      ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) {
        const t0 = 0.3 + k * 0.16 + (1 - pumpAnim) * 0.3;
        const hx = cx1 + thw + (px - 15 - cx1 - thw) * t0;
        const hy = 30 + 120 * t0 * t0;
        ctx.beginPath();
        ctx.moveTo(hx - 8, hy - 3);
        ctx.lineTo(hx + 8, hy + 3);
        ctx.stroke();
      }
    }
    // 펌프 본체(금속 실린더)
    contactShadow(ctx, px, CVH - 30, 40, 0.26);
    const pumpG = ctx.createLinearGradient(px - 18, 0, px + 18, 0);
    pumpG.addColorStop(0, "#8FA6C4");
    pumpG.addColorStop(0.3, "#E4EEF8");
    pumpG.addColorStop(0.7, "#9FB4CE");
    pumpG.addColorStop(1, "#5E7492");
    ctx.fillStyle = pumpG;
    ctx.beginPath();
    ctx.roundRect(px - 18, 168, 36, CVH - 32 - 168, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(40,56,80,.65)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 피스톤 손잡이(당기면 위로)
    const handleY = 150 - pumpAnim * 22;
    ctx.fillStyle = "#B9C9DE";
    ctx.beginPath();
    ctx.roundRect(px - 4, handleY, 8, 168 - handleY + 4, 3.5);
    ctx.fill();
    const hgG = ctx.createLinearGradient(0, handleY - 9, 0, handleY);
    hgG.addColorStop(0, "#F0F6FC");
    hgG.addColorStop(1, "#93A9C2");
    ctx.fillStyle = hgG;
    ctx.beginPath();
    ctx.roundRect(px - 22, handleY - 9, 44, 9, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(40,56,80,.6)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 게이지(펌프 위 스템)
    ctx.fillStyle = "#7A90AC";
    ctx.beginPath();
    ctx.roundRect(px - 4, gy + gr - 2, 8, 168 - gy - gr + 4, 3);
    ctx.fill();
    const ringG = ctx.createLinearGradient(0, gy - gr, 0, gy + gr);
    ringG.addColorStop(0, "#E8F1FA");
    ringG.addColorStop(1, "#7E94B2");
    ctx.fillStyle = "rgba(6,14,28,.85)";
    ctx.beginPath();
    ctx.arc(px, gy, gr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ringG;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(30,44,66,.8)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(px, gy, gr + 2.6, 0, Math.PI * 2);
    ctx.stroke();
    // 눈금(0.2~1.0 기압)
    const angOf = (p: number): number => 2.62 - clamp((p - 0.2) / 0.8, 0, 1) * 2.1;
    ctx.strokeStyle = "rgba(196,214,236,.7)";
    ctx.lineWidth = 1.4;
    ctx.font = "700 8px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(178,198,224,.8)";
    ctx.textAlign = "center";
    for (const p of [0.2, 0.4, 0.6, 0.8, 1.0]) {
      const a = angOf(p);
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(a) * (gr - 7), gy - Math.sin(a) * (gr - 7));
      ctx.lineTo(px + Math.cos(a) * (gr - 3), gy - Math.sin(a) * (gr - 3));
      ctx.stroke();
      if (p === 0.2 || p === 1.0) {
        ctx.fillText(p.toFixed(1), px + Math.cos(a) * (gr - 13), gy - Math.sin(a) * (gr - 13) + 2.6);
      }
    }
    ctx.fillText("기압", px, gy + 13);
    // 바늘
    const na = angOf(dispP) + Math.sin(tMs / 55) * 0.05 * kick;
    ctx.strokeStyle = "#FF7B7B";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(px, gy);
    ctx.lineTo(px + Math.cos(na) * (gr - 9), gy - Math.sin(na) * (gr - 9));
    ctx.stroke();
    ctx.fillStyle = "#E8F0FA";
    ctx.beginPath();
    ctx.arc(px, gy, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    const key = `${Math.round(temp)}|${dispP.toFixed(1)}`;
    if (key !== shown) {
      shown = key;
      tempPill.textContent = `온도 ${Math.round(temp)}℃`;
      tempDot.style.background = tempColor(warm01);
      pressPill.textContent = `압력 ${dispP.toFixed(1)}기압`;
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

  api.setCTA("데우기 → 감압 → 잠잠하게!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
