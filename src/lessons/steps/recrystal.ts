// recrystal — 재결정 랩(중2 I 물질의 특성). 질산 칼륨 10 g + 염화 나트륨 2 g(물 10 mL) 탐구의 조작판.
//   · 좌: 가열·냉각되는 비커(안 녹은 가루 → 전부 용해 → 냉각 시 침상 결정) + 우: 실시간 용해도 곡선
//   · 곡선(g/물 100 g): 질산 칼륨 0℃ 13.3 → 20℃ 31.6 → 40℃ 63.9 → 60℃ 110 → 80℃ 169(가파름),
//     염화 나트륨 ~36(거의 수평). 물 10 mL 기준 ×10 환산 — 질산 칼륨 10 g = 100 상당, 염화 나트륨 2 g = 20 상당
//   · 흐름: ① 가열해 전부 용해 ② 냉각 — 곡선과 100의 교차점 아래부터 결정 석출 ③ 거르기로 분리
// 목표: ① 모두 녹이기 ② 20℃ 이하로 식혀 석출 ③ 걸러서 분리.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { glassVessel, glassFlask, glassStrokeStyle, liquidFill, contactShadow, softGlow } from "../../ui/labProps";
import { tempColor } from "../../ui/thermo";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface RecrystalStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const T_MIN = 0;
const T_MAX = 80;
const CVH = 352;
const K_PTS: ReadonlyArray<readonly [number, number]> = [
  [0, 13.3],
  [20, 31.6],
  [40, 63.9],
  [60, 110],
  [80, 169],
];
const N_PTS: ReadonlyArray<readonly [number, number]> = [
  [0, 35.7],
  [20, 36.0],
  [40, 36.6],
  [60, 37.3],
  [80, 38.4],
];
function interp(pts: ReadonlyArray<readonly [number, number]>, t: number): number {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      return p0[1] + ((t - p0[0]) / (p1[0] - p0[0])) * (p1[1] - p0[1]);
    }
  }
  return pts[pts.length - 1][1];
}
const capK = (t: number): number => interp(K_PTS, t) / 10; // 물 10 mL에 녹을 수 있는 g
const T_CROSS = 40 + 20 * ((100 - 63.9) / (110 - 63.9)); // 곡선이 100을 지나는 온도 ≈ 55.7℃

interface Needle {
  x: number;
  y: number;
  ty: number;
  ang: number;
  len: number;
  tl: number;
  seed: number;
  dying: boolean;
}

export const recrystal: StepRenderer = (host, step, api) => {
  const s = step as unknown as RecrystalStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const tempPill = el("span", { text: "20℃" });
  const tempDot = el("span", { class: "pdot", style: "background:#6EA8FF" });
  const crysPill = el("span", { text: "석출된 결정 0.0 g" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "슬라이더로 온도를 올려 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, tempDot, tempPill),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FF8AB0" }), crysPill),
    ),
    toastEl,
    capEl,
  );

  // 온도 슬라이더
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
        "aria-label": "용액 온도",
        "aria-valuemin": String(T_MIN),
        "aria-valuemax": String(T_MAX),
        "aria-valuenow": "20",
        "aria-valuetext": "20도",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "차갑게 0℃" }), el("span", { text: "뜨겁게 80℃" })),
  );
  const filterBtn = el(
    "button",
    { class: "swapbtn", style: "opacity:.45", attrs: { type: "button", disabled: "true" } },
    el("span", { text: "거르기 — 결정 분리" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "melt" } }, el("b", { text: "모두 녹이기" }), el("span", { text: "가열!" })),
    el("div", { class: "pn-badge chem", dataset: { g: "cool" } }, el("b", { text: "식히면 석출" }), el("span", { text: "20℃ 이하" })),
    el("div", { class: "pn-badge chem", dataset: { g: "filter" } }, el("b", { text: "걸러서 분리" }), el("span", { text: "거르기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "물 10 mL에 <b>질산 칼륨 10 g + 염화 나트륨 2 g</b>을 넣고 저었어요. 질산 칼륨은 일부만 녹고 가라앉았네요 — 온도를 올려 볼까요?",
  });
  host.append(goalChips, stage, slider, filterBtn, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let T = 20;
  let dissolvedK = capK(20); // 시작: 20℃ 평형(3.16 g)
  let melted = false;
  let filtering = false;
  let filtered = false;
  let filterT = 0;
  let filterOn = false;
  let lockTemp = false;
  let sparkToast = false;
  const needles: Needle[] = [];
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
        "온도에 따른 <b>용해도 차가 큰</b> 질산 칼륨이 먼저 석출돼요 — 이렇게 순수한 고체를 얻는 방법이 <b>재결정</b>이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "melt") {
      helper.innerHTML = "다 녹았어요! 이제 슬라이더를 <b>천천히 내려서</b> 식혀 보세요. 어느 온도부터 결정이 생길까요?";
    } else if (id === "cool") {
      helper.innerHTML = "<b>염화 나트륨은 여전히 다 녹아</b> 있어요(그래프에서 곡선 아래). 이제 <b>거르기</b>로 결정만 건져요!";
    }
  }

  // ---- 슬라이더 ----
  const t01 = (v: number): number => (v - T_MIN) / (T_MAX - T_MIN);
  function setSliderUI(): void {
    const f = t01(T) * 100;
    thumb.style.left = `${f}%`;
    fillEl.style.width = `${f}%`;
    (thumb.firstChild as HTMLElement).style.background = tempColor(t01(T));
    slider.setAttribute("aria-valuenow", String(Math.round(T)));
    slider.setAttribute("aria-valuetext", `${Math.round(T)}도`);
  }
  function setTempFromClientX(cxv: number): void {
    if (lockTemp) return;
    const rect = track.getBoundingClientRect();
    T = clamp(T_MIN + ((cxv - rect.left) / rect.width) * (T_MAX - T_MIN), T_MIN, T_MAX);
    setSliderUI();
  }
  let sliderDrag = false;
  slider.addEventListener("pointerdown", (e) => {
    if (lockTemp) return;
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
    if (lockTemp) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") T = clamp(T + 5, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") T = clamp(T - 5, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    hideCap();
    setSliderUI();
  });
  requestAnimationFrame(setSliderUI);

  filterBtn.addEventListener("click", () => {
    if (!filterOn || filtering || filtered) return;
    filtering = true;
    lockTemp = true;
    filterOn = false;
    (filterBtn as HTMLButtonElement).disabled = true;
    filterBtn.classList.remove("pulse");
    filterBtn.style.opacity = ".7";
    slider.style.opacity = ".55";
    slider.setAttribute("aria-disabled", "true");
    haptic(HAPTIC.tap);
    toast("천천히 부어 거르는 중…");
  });

  // ---- 프레임 ----
  let shown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;

    // 용해·석출 물리(질산 칼륨) — 염화 나트륨 2 g은 전 구간에서 늘 전부 용해
    const target = Math.min(10, capK(T));
    if (target > dissolvedK) dissolvedK = Math.min(target, dissolvedK + 0.037 * dt);
    else dissolvedK = Math.max(target, dissolvedK - 0.03 * dt);
    const solid = 10 - dissolvedK;
    if (!melted && solid < 0.02) melted = true;
    const crystal = melted ? solid : 0;

    // 목표 판정
    if (melted) collect("melt", "10 g 용해!", "전부 녹았어요 — 점이 곡선 아래로!");
    if (melted && crystal > 0.15 && !sparkToast) {
      sparkToast = true;
      toast("반짝 — 질산 칼륨 결정이 자라기 시작해요!");
    }
    if (crystal < 0.05) sparkToast = false;
    if (melted && T <= 20 && crystal >= 6.0) collect("cool", "결정 탄생!", "질산 칼륨만 결정으로 돌아왔어요!");
    if (filtering && !filtered) {
      filterT = Math.min(1, filterT + (dt * 16.7) / 2600);
      if (filterT >= 1) {
        filtered = true;
        filterBtn.className = "swapbtn done-static";
        filterBtn.style.opacity = "";
        (filterBtn.firstChild as HTMLElement).textContent = "분리 완료!";
        collect("filter", "순수 분리!", "거름종이 위엔 질산 칼륨 결정만!");
      }
    }
    // 거르기 버튼 상태
    if (!filtering && !filtered) {
      const can = goals.has("cool") && crystal >= 5.5 && T <= 25;
      if (can !== filterOn) {
        filterOn = can;
        (filterBtn as HTMLButtonElement).disabled = !can;
        filterBtn.style.opacity = can ? "" : ".45";
        filterBtn.classList.toggle("pulse", can);
      }
    }

    // 배치 기하
    const cx = W * 0.26;
    const bw = Math.min(W * 0.4, 130);
    const bx0 = cx - bw / 2;
    const bx1 = cx + bw / 2;
    const by0 = 132;
    const y1 = CVH - 56;
    const surfY = 160;
    const warm01 = t01(T);
    const showFilter = filtering || filtered;
    const beakerA = showFilter ? Math.max(0, 1 - filterT * 2.4) : 1;
    const filterA = showFilter ? Math.min(1, filterT * 1.8) : 0;

    // 침상 결정 개수 목표에 맞춰 생성·소멸
    if (!showFilter) {
      const targetN = Math.round(crystal * 3);
      if (needles.filter((n) => !n.dying).length < targetN && needles.length < 34) {
        needles.push({
          x: bx0 + 16 + Math.random() * (bw - 32),
          y: surfY + 14 + Math.random() * (y1 - surfY - 44),
          ty: y1 - 9 - Math.random() * 15,
          ang: (Math.random() - 0.5) * 0.9,
          len: 0,
          tl: 8 + Math.random() * 7,
          seed: Math.random(),
          dying: false,
        });
      }
      const alive = needles.filter((n) => !n.dying);
      if (alive.length > targetN + 1) alive[alive.length - 1].dying = true;
      for (let i = needles.length - 1; i >= 0; i--) {
        const n = needles[i];
        if (n.dying) {
          n.len -= 0.5 * dt;
          if (n.len <= 0.5) needles.splice(i, 1);
        } else {
          n.len += (n.tl - n.len) * Math.min(1, 0.06 * dt);
          n.y += (n.ty - n.y) * Math.min(1, 0.012 * dt);
        }
      }
    }

    // ---- 왼쪽: 비커 장면 ----
    if (beakerA > 0.01) {
      ctx.save();
      ctx.globalAlpha = beakerA;
      // 가열판
      const hpY = y1 + 6;
      contactShadow(ctx, cx, hpY + 13, bw * 0.68, 0.3);
      if (warm01 > 0.15) softGlow(ctx, cx, y1, bw * 0.62, "255,140,70", 0.11 * warm01);
      const hg = ctx.createLinearGradient(0, hpY, 0, hpY + 10);
      hg.addColorStop(0, "#3E5070");
      hg.addColorStop(1, "#232F47");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.roundRect(bx0 - 10, hpY, bw + 20, 10, 5);
      ctx.fill();
      ctx.strokeStyle = "rgba(140,160,190,.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx0 - 4, hpY + 2);
      ctx.lineTo(bx1 + 4, hpY + 2);
      ctx.stroke();
      // 가열 램프
      ctx.fillStyle = tempColor(warm01, 0.5 + warm01 * 0.5);
      ctx.beginPath();
      ctx.arc(bx1 + 3, hpY + 5, 2.4, 0, Math.PI * 2);
      ctx.fill();
      // 용액
      liquidFill(ctx, bx0 + 3, surfY, bx1 - 3, y1 - 3, "150,190,240", 0.13);
      if (warm01 > 0.05) {
        ctx.fillStyle = tempColor(warm01, 0.04 + warm01 * 0.08);
        ctx.fillRect(bx0 + 3, surfY, bw - 6, y1 - 3 - surfY);
      }
      // 가열 기포
      if (T > 66) {
        for (let i = 0; i < 4; i++) {
          const bx = bx0 + 18 + ((i * 33.7) % (bw - 36));
          const by = y1 - 8 - ((tMs * (0.016 + i * 0.004) + i * 31) % (y1 - surfY - 20));
          ctx.strokeStyle = `rgba(255,255,255,${(0.3 * (T - 66)) / 14})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // 안 녹은 혼합물 가루(전부 녹기 전)
      if (!melted && solid > 0.03) {
        const ph = 3 + 17 * Math.min(1, solid / 6.84);
        const span = bw * 0.42;
        const pg = ctx.createLinearGradient(0, y1 - 4 - ph, 0, y1 - 2);
        pg.addColorStop(0, "#EFF4FB");
        pg.addColorStop(1, "#AFC0D8");
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.moveTo(cx - span, y1 - 3);
        ctx.quadraticCurveTo(cx, y1 - 5 - ph * 1.5, cx + span, y1 - 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(96,114,142,.65)";
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
      // 침상 결정(냉각 석출)
      for (const n of needles) {
        const tw = 0.55 + 0.45 * Math.sin(tMs / 300 + n.seed * 9);
        const w2 = Math.max(1.1, n.len * 0.14);
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.ang);
        ctx.globalAlpha = beakerA * (0.55 + 0.4 * tw);
        const ng = ctx.createLinearGradient(-w2, 0, w2, 0);
        ng.addColorStop(0, "#DCEBFB");
        ng.addColorStop(0.5, "#FFFFFF");
        ng.addColorStop(1, "#B9D2EE");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.moveTo(0, -n.len / 2);
        ctx.lineTo(w2, 0);
        ctx.lineTo(0, n.len / 2);
        ctx.lineTo(-w2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(122,156,198,.7)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
        if (tw > 0.8) {
          ctx.fillStyle = "rgba(255,255,255,.95)";
          ctx.fillRect(-0.8, -n.len * 0.26, 1.6, 1.6);
        }
        ctx.restore();
      }
      // 비커 유리 + 온도계
      glassVessel(ctx, { x0: bx0, y0: by0, x1: bx1, y1 });
      const thX = bx1 - 14;
      ctx.strokeStyle = "rgba(226,240,255,.6)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(thX, by0 - 16);
      ctx.lineTo(thX, surfY + 42);
      ctx.stroke();
      ctx.strokeStyle = tempColor(warm01, 0.95);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(thX, surfY + 42);
      ctx.lineTo(thX, surfY + 42 - 20 - warm01 * 40);
      ctx.stroke();
      // 김(뜨거울 때)
      if (T > 60) {
        ctx.strokeStyle = `rgba(226,240,255,${((T - 60) / 20) * 0.28})`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 2; k++) {
          const sx0 = cx - 24 + k * 44;
          const sway = Math.sin(tMs / 460 + k * 2.2) * 5;
          ctx.beginPath();
          ctx.moveTo(sx0, by0 - 10);
          ctx.quadraticCurveTo(sx0 + sway, by0 - 24, sx0 - sway * 0.6, by0 - 38);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // ---- 왼쪽: 거름 장치 미니 애니 ----
    if (filterA > 0.01) {
      const ft = filterT;
      ctx.save();
      ctx.globalAlpha = filterA;
      const fx = cx;
      // 기울인 비커(붓는 중)
      if (ft < 0.8) {
        ctx.save();
        ctx.translate(fx - 44, 66);
        ctx.rotate(-0.7);
        glassVessel(ctx, { x0: -17, y0: -13, x1: 17, y1: 13 });
        ctx.restore();
        // 붓는 물줄기
        ctx.strokeStyle = "rgba(180,215,255,.5)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(fx - 26, 66);
        ctx.quadraticCurveTo(fx - 10, 78, fx - 4, 104);
        ctx.stroke();
      }
      // 깔때기(유리) + 거름종이
      ctx.fillStyle = "rgba(190,220,255,.05)";
      ctx.beginPath();
      ctx.moveTo(fx - 40, 104);
      ctx.lineTo(fx + 40, 104);
      ctx.lineTo(fx + 5, 166);
      ctx.lineTo(fx + 5, 196);
      ctx.lineTo(fx - 5, 196);
      ctx.lineTo(fx - 5, 166);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = glassStrokeStyle(ctx, 104, 196);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fx - 40, 104);
      ctx.lineTo(fx - 5, 166);
      ctx.lineTo(fx - 5, 196);
      ctx.moveTo(fx + 40, 104);
      ctx.lineTo(fx + 5, 166);
      ctx.lineTo(fx + 5, 196);
      ctx.stroke();
      // 거름종이(안쪽 원뿔)
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.beginPath();
      ctx.moveTo(fx - 32, 108);
      ctx.lineTo(fx + 32, 108);
      ctx.lineTo(fx, 160);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // 종이 위 하얀 결정(쌓임)
      const nDots = Math.floor(30 * clamp(ft * 1.25, 0, 1));
      for (let i = 0; i < nDots; i++) {
        const rr = Math.sin(i * 127.3) * 0.5 + 0.5;
        const side = i % 2 === 0 ? -1 : 1;
        const tt = 0.25 + rr * 0.7;
        const px = fx + side * 30 * (1 - tt) + Math.sin(i * 61.7) * 3;
        const py = 110 + tt * 46;
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.fillRect(px, py, 1.8, 1.8);
      }
      if (ft > 0.25) {
        softGlow(ctx, fx, 150, 16, "226,242,255", 0.2 * Math.min(1, ft * 1.4));
      }
      // 스템에서 떨어지는 용액 방울
      if (ft > 0.08 && ft < 0.92) {
        for (let k = 0; k < 2; k++) {
          const dy = 200 + ((tMs * 0.09 + k * 26) % 42);
          ctx.fillStyle = "rgba(180,215,255,.55)";
          ctx.beginPath();
          ctx.arc(fx, dy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 삼각 플라스크 + 거른 용액(염화 나트륨은 통과)
      const flB = y1 + 4;
      contactShadow(ctx, fx, flB + 4, 46, 0.26);
      const lv = 5 + ft * 30;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fx - 9, 208);
      ctx.lineTo(fx - 9, 232);
      ctx.lineTo(fx - 40 + 6, flB - 6);
      ctx.quadraticCurveTo(fx - 40, flB, fx - 40 + 10, flB);
      ctx.lineTo(fx + 40 - 10, flB);
      ctx.quadraticCurveTo(fx + 40, flB, fx + 40 - 6, flB - 6);
      ctx.lineTo(fx + 9, 232);
      ctx.lineTo(fx + 9, 208);
      ctx.closePath();
      ctx.clip();
      liquidFill(ctx, fx - 40, flB - lv, fx + 40, flB - 2, "150,200,240", 0.16);
      ctx.restore();
      glassFlask(ctx, fx, 18, 208, 232, 80, flB);
      // 라벨
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,205,225,.92)";
      ctx.fillText("질산 칼륨 결정", fx, 96);
      ctx.fillStyle = "rgba(150,226,214,.92)";
      ctx.fillText("염화 나트륨 용액", fx, flB + 18);
      ctx.restore();
    }

    // ---- 오른쪽: 실시간 용해도 곡선 ----
    const gx0 = W * 0.52;
    const gx1 = W - 14;
    const gy0 = 42;
    const gy1 = CVH - 64;
    const xOf = (t: number): number => gx0 + (t / 80) * (gx1 - gx0);
    const yOf = (v: number): number => gy1 - (v / 180) * (gy1 - gy0);
    ctx.strokeStyle = "rgba(148,168,196,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 4);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    ctx.font = "600 9.5px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(196,212,232,.75)";
    ctx.textAlign = "right";
    for (const v of [50, 100, 150]) {
      ctx.strokeStyle = "rgba(148,168,196,.13)";
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(v));
      ctx.lineTo(gx1, yOf(v));
      ctx.stroke();
      ctx.fillText(String(v), gx0 - 4, yOf(v) + 3);
    }
    ctx.textAlign = "center";
    for (const t of [0, 20, 40, 60, 80]) ctx.fillText(String(t), xOf(t), gy1 + 12);
    ctx.fillText("온도(℃)", (gx0 + gx1) / 2, gy1 + 24);
    ctx.textAlign = "left";
    ctx.fillText("용해도(g/물 100 g)", gx0 - 8, gy0 - 8);
    // '전부 녹는 선'(질산 칼륨 10 g = 100 상당)
    ctx.strokeStyle = "rgba(255,214,138,.35)";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(gx0, yOf(100));
    ctx.lineTo(gx1, yOf(100));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,224,168,.75)";
    ctx.textAlign = "right";
    ctx.fillText("모두 녹는 선", gx1 - 2, yOf(100) - 5);
    // 곡선 2개(글로우 + 코어)
    const drawCurve = (pts: ReadonlyArray<readonly [number, number]>, glow: string, core: string): void => {
      for (const pass of [0, 1]) {
        ctx.strokeStyle = pass === 0 ? glow : core;
        ctx.lineWidth = pass === 0 ? 5 : 2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          if (i === 0) ctx.moveTo(xOf(p[0]), yOf(p[1]));
          else ctx.lineTo(xOf(p[0]), yOf(p[1]));
        }
        ctx.stroke();
      }
    };
    drawCurve(K_PTS, "rgba(255,138,176,.16)", "rgba(255,138,176,.85)");
    drawCurve(N_PTS, "rgba(77,212,192,.14)", "rgba(77,212,192,.8)");
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,182,206,.9)";
    ctx.fillText("질산 칼륨", xOf(52) + 4, yOf(interp(K_PTS, 52)) - 8);
    ctx.fillStyle = "rgba(140,226,212,.9)";
    ctx.fillText("염화 나트륨", xOf(40) + 4, yOf(37) + 14);
    // 교차점 링(곡선 × 모두 녹는 선)
    const nearCross = Math.abs(T - T_CROSS) < 4;
    ctx.strokeStyle = nearCross ? "rgba(255,214,138,.95)" : "rgba(255,214,138,.5)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(xOf(T_CROSS), yOf(100), 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (nearCross) softGlow(ctx, xOf(T_CROSS), yOf(100), 14, "255,214,138", 0.25);
    // 현재 온도 세로선
    ctx.strokeStyle = "rgba(226,240,255,.22)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(xOf(T), gy0);
    ctx.lineTo(xOf(T), gy1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(226,240,255,.55)";
    ctx.beginPath();
    ctx.moveTo(xOf(T), gy1 - 1);
    ctx.lineTo(xOf(T) - 3.5, gy1 + 4);
    ctx.lineTo(xOf(T) + 3.5, gy1 + 4);
    ctx.closePath();
    ctx.fill();
    // 현재 농도 점 2개(물 10 mL 기준 ×10 환산)
    const pulse = 1 + Math.sin(tMs / 260) * 0.3;
    const kx = xOf(T);
    const ky = yOf(dissolvedK * 10);
    ctx.fillStyle = "rgba(255,138,176,.25)";
    ctx.beginPath();
    ctx.arc(kx, ky, 7 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF9CBE";
    ctx.beginPath();
    ctx.arc(kx, ky, 3.4, 0, Math.PI * 2);
    ctx.fill();
    const ny = yOf(20);
    ctx.fillStyle = "rgba(77,212,192,.22)";
    ctx.beginPath();
    ctx.arc(kx, ny, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5FE0CC";
    ctx.beginPath();
    ctx.arc(kx, ny, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    const key = `${Math.round(T)}|${crystal.toFixed(1)}`;
    if (key !== shown) {
      shown = key;
      tempPill.textContent = `${Math.round(T)}℃`;
      tempDot.style.background = tempColor(warm01);
      crysPill.textContent = `석출된 결정 ${crystal.toFixed(1)} g`;
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

  api.setCTA("가열 → 냉각 → 거르기!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
