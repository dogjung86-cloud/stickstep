// foliationLab — 변성암·엽리 랩(중2 II). 교과서(69쪽) 열·압력에 의한 변성 작용의 조작판.
//   · 깊이 슬라이더로 암석을 지하 깊은 곳으로 — 내려갈수록 온도·압력 게이지가 오른다
//   · "꾹 눌러 조이기"를 누르고 있으면 위·아래 프레스가 조여 암석이 납작해지고,
//     광물 막대들이 압력 방향에 **수직**(가로)으로 회전·정렬 → 가로 줄무늬(엽리)
//     ※ 과학적 정확성: 엽리는 압력에 수직으로 발달 — 그래서 프레스는 위아래(지층의 무게 방향)다.
//   · 원래 암석 세그: 화강암→편마암(엽리 O) / 사암→규암·석회암→대리암(엽리 X — 치밀해지기만)
// 목표: ① 지하 깊은 곳 도달 ② 화강암을 조여 편마암(엽리) ③ 엽리 없는 변성암(규암 또는 대리암).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow, softGlow } from "../../ui/labProps";
import { tempColor } from "../../ui/thermo";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface FoliationStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type RockKey = "granite" | "sandstone" | "limestone";
interface RockDef {
  name: string;
  out: string;
  foliate: boolean;
  body: [string, string, string]; // 원래 몸체(밝→어)
  bodyOut: [string, string, string]; // 변성 후 몸체
  line: string;
}
const ROCKS: Record<RockKey, RockDef> = {
  granite: { name: "화강암", out: "편마암", foliate: true,
    body: ["#9AA2B4", "#767E92", "#5A6276"], bodyOut: ["#868D9F", "#636A7E", "#4A5064"], line: "rgba(40,46,62,.9)" },
  sandstone: { name: "사암", out: "규암", foliate: false,
    body: ["#D8BF8D", "#BFA267", "#997E4A"], bodyOut: ["#E0D5BE", "#C4B79C", "#9F9276"], line: "rgba(96,76,38,.85)" },
  limestone: { name: "석회암", out: "대리암", foliate: false,
    body: ["#E6E1D3", "#CDC6B3", "#ACA48C"], bodyOut: ["#F2EFE8", "#DCD8CE", "#BDB8AC"], line: "rgba(112,106,88,.8)" },
};
const ROCK_KEYS: RockKey[] = ["granite", "sandstone", "limestone"];

interface Grain {
  xf: number; // -0.5..0.5 (암석 폭 기준)
  yf: number;
  ang: number;
  len: number;
  w: number;
  dark: boolean;
  rowY: number; // 정렬 목표 줄(같은 밝기끼리 모여 띠가 된다)
  jit: number;
}

const CVH = 340;
const DEPTH_KM = 20;
const DEEP_AT = 0.72; // 이 깊이부터 변성 작용 가능
const RH0 = 118;
// 편마암 줄무늬 줄 위치(밝은 줄·어두운 줄 교대)
const ROWS: { y: number; dark: boolean }[] = [
  { y: -0.34, dark: false },
  { y: -0.17, dark: true },
  { y: 0, dark: false },
  { y: 0.17, dark: true },
  { y: 0.34, dark: false },
];

function mixc(a: string, b: string, t: number): string {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

export const foliationLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FoliationStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const rockPill = el("span", { text: "화강암" });
  const rockDot = el("span", { class: "pdot", style: "background:#9AA2B4" });
  const depthPill = el("span", { text: "지하 0 km · 15℃" });
  const depthDot = el("span", { class: "pdot", style: "background:#6EA8FF" });
  const gaugeFill = el("i", {});
  const gaugeVal = el("b", { text: "0%" });
  const gauge = el(
    "div",
    { class: "cv-gauge" },
    el("span", { text: "압력" }),
    el("div", { class: "cv-gauge-track" }, gaugeFill),
    gaugeVal,
  );
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "슬라이더로 지하 깊은 곳까지 내려가 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, rockDot, rockPill),
      el(
        "div",
        { style: "display:flex;flex-direction:column;gap:8px;align-items:flex-end" },
        el("div", { class: "pill" }, depthDot, depthPill),
        gauge,
      ),
    ),
    toastEl,
    capEl,
  );

  // 원래 암석 선택 세그
  const seg = el("div", { class: "seg" });
  const rockBtns = new Map<RockKey, HTMLButtonElement>();
  for (const k of ROCK_KEYS) {
    const b = el("button", {
      class: k === "granite" ? "on" : "",
      text: ROCKS[k].name,
      attrs: { type: "button", "aria-pressed": String(k === "granite") },
    });
    seg.appendChild(b);
    rockBtns.set(k, b);
  }

  // 깊이 슬라이더
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
        "aria-label": "지하 깊이",
        "aria-valuemin": "0",
        "aria-valuemax": String(DEPTH_KM),
        "aria-valuenow": "0",
        "aria-valuetext": "지하 0킬로미터",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "지표 0 km" }), el("span", { text: "깊은 곳 20 km" })),
  );
  const pressBtn = el(
    "button",
    { class: "swapbtn", style: "opacity:.45", attrs: { type: "button", disabled: "true" } },
    el("span", { text: "조이기 — 지하 깊은 곳에서 열려요" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "deep" } }, el("b", { text: "깊은 곳으로" }), el("span", { text: "지하 15 km" })),
    el("div", { class: "pn-badge geo", dataset: { g: "fol" } }, el("b", { text: "엽리 만들기" }), el("span", { text: "화강암 꾹" })),
    el("div", { class: "pn-badge geo", dataset: { g: "nofol" } }, el("b", { text: "엽리 없이" }), el("span", { text: "사암·석회암" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "변성암 공장에 왔어요. 먼저 <b>슬라이더</b>로 암석을 지하 깊은 곳까지 내려요 — 온도·압력 게이지를 지켜보세요!",
  });
  host.append(goalChips, helper, stage, seg, slider, pressBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let mode: RockKey = "granite";
  let depth01 = 0;
  let holding = false;
  let plateEng = 0; // 프레스 밀착 0..1
  const prog: Record<RockKey, number> = { granite: 0, sandstone: 0, limestone: 0 };
  const done: Record<RockKey, boolean> = { granite: false, sandstone: false, limestone: false };
  const grains = new Map<RockKey, Grain[]>();
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;
  let deepHintAt = 0;

  function genGrains(k: RockKey): Grain[] {
    const cached = grains.get(k);
    if (cached) return cached;
    const arr: Grain[] = [];
    const n = k === "granite" ? 46 : k === "sandstone" ? 52 : 48;
    for (let i = 0; i < n; i++) {
      const dark = k === "granite" ? i % 5 < 2 : false;
      const rows = ROWS.filter((r) => r.dark === dark);
      const yf = -0.42 + Math.random() * 0.84;
      let best = rows[0].y;
      for (const r of rows) if (Math.abs(r.y - yf) < Math.abs(best - yf)) best = r.y;
      arr.push({
        xf: -0.44 + Math.random() * 0.88,
        yf,
        ang: (Math.random() - 0.5) * 2.2,
        len: k === "granite" ? 12 + Math.random() * 7 : 6.6 + Math.random() * 3.6,
        w: k === "granite" ? 3.2 + Math.random() * 1.4 : 6 + Math.random() * 3.4,
        dark,
        rowY: best,
        jit: (Math.random() - 0.5) * 0.05,
      });
    }
    grains.set(k, arr);
    return arr;
  }

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
        "광물이 압력에 <b>수직</b>으로 늘어선 줄무늬가 엽리 — 층리(쌓인 무늬)와 태생이 달라요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "deep") {
      helper.innerHTML = "여기가 변성 작용의 무대! 이제 <b>꾹 눌러</b> 화강암을 조여 봐요 — 광물 막대들의 방향을 잘 보세요.";
    } else if (id === "fol") {
      helper.innerHTML = "가로 줄무늬(엽리) 완성! 이번엔 <b>사암이나 석회암</b>으로 바꿔 같은 압력을 줘 보세요 — 결과가 같을까요?";
    } else if (id === "nofol" && !goals.has("fol")) {
      helper.innerHTML = "줄무늬 없이 <b>치밀</b>해지기만 했죠? 이번엔 <b>화강암</b>으로 바꿔 조여 보세요 — 뭔가 다를 거예요.";
    }
  }

  // ---- 버튼 상태 ----
  const canPress = (): boolean => depth01 >= DEEP_AT && !done[mode];
  function refreshPressBtn(): void {
    const span = pressBtn.firstChild as HTMLElement;
    if (done[mode]) {
      pressBtn.className = "swapbtn done-static";
      pressBtn.style.opacity = "";
      (pressBtn as HTMLButtonElement).disabled = true;
      span.textContent = `변성 완료 — ${ROCKS[mode].out}!`;
      return;
    }
    const on = depth01 >= DEEP_AT;
    pressBtn.className = on ? "swapbtn pulse" : "swapbtn";
    pressBtn.style.opacity = on ? "" : ".45";
    (pressBtn as HTMLButtonElement).disabled = !on;
    span.textContent = on ? "꾹 눌러 조이기" : "조이기 — 지하 깊은 곳에서 열려요";
  }

  function setMode(k: RockKey): void {
    if (mode === k) return;
    mode = k;
    holding = false;
    for (const [key, b] of rockBtns) {
      b.classList.toggle("on", key === k);
      b.setAttribute("aria-pressed", String(key === k));
    }
    rockPill.textContent = done[k] ? `${ROCKS[k].name} → ${ROCKS[k].out}` : ROCKS[k].name;
    rockDot.style.background = ROCKS[k].body[0];
    genGrains(k);
    refreshPressBtn();
    haptic(HAPTIC.select);
    if (!finished && !done[k]) {
      helper.innerHTML =
        k === "granite"
          ? "화강암 속 <b>광물 막대</b>들이 제멋대로죠? 깊은 곳에서 꾹 조이면 어떻게 될까요?"
          : `${ROCKS[k].name}을 골랐어요. 같은 열·압력을 받으면 <b>${ROCKS[k].out}</b>이 돼요 — 줄무늬가 생길지 지켜보세요!`;
    }
  }
  const rockHandlers = new Map<RockKey, () => void>();
  for (const k of ROCK_KEYS) {
    const h = (): void => setMode(k);
    rockHandlers.set(k, h);
    rockBtns.get(k)!.addEventListener("click", h);
  }

  // ---- 슬라이더 ----
  function setSliderUI(): void {
    const f = depth01 * 100;
    thumb.style.left = `${f}%`;
    fillEl.style.width = `${f}%`;
    (thumb.firstChild as HTMLElement).style.background = tempColor(depth01);
    const km = Math.round(depth01 * DEPTH_KM);
    slider.setAttribute("aria-valuenow", String(km));
    slider.setAttribute("aria-valuetext", `지하 ${km}킬로미터`);
  }
  function setDepthFromClientX(cxv: number): void {
    const rect = track.getBoundingClientRect();
    depth01 = clamp((cxv - rect.left) / rect.width, 0, 1);
    setSliderUI();
  }
  let sliderDrag = false;
  const slDown = (e: PointerEvent): void => {
    sliderDrag = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    setDepthFromClientX(e.clientX);
    hideCap();
    haptic(HAPTIC.tap);
  };
  const slMove = (e: PointerEvent): void => {
    if (sliderDrag) setDepthFromClientX(e.clientX);
  };
  const slUp = (): void => {
    sliderDrag = false;
    slider.classList.remove("drag");
  };
  const slKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") depth01 = clamp(depth01 + 0.1, 0, 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") depth01 = clamp(depth01 - 0.1, 0, 1);
    else return;
    e.preventDefault();
    hideCap();
    setSliderUI();
  };
  slider.addEventListener("pointerdown", slDown);
  slider.addEventListener("pointermove", slMove);
  slider.addEventListener("pointerup", slUp);
  slider.addEventListener("pointercancel", slUp);
  slider.addEventListener("keydown", slKey);
  requestAnimationFrame(setSliderUI);

  // ---- 꾹 눌러 조이기 ----
  const pDown = (e: PointerEvent): void => {
    if (!canPress()) return;
    holding = true;
    try {
      pressBtn.setPointerCapture(e.pointerId);
    } catch {
      /* 무시 */
    }
    haptic(HAPTIC.tap);
  };
  const pUp = (): void => {
    holding = false;
  };
  const pKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (e.repeat) return;
    if (canPress()) {
      holding = true;
      haptic(HAPTIC.tap);
    }
  };
  const pKeyUp = (): void => {
    holding = false;
  };
  pressBtn.addEventListener("pointerdown", pDown);
  pressBtn.addEventListener("pointerup", pUp);
  pressBtn.addEventListener("pointercancel", pUp);
  pressBtn.addEventListener("keydown", pKeyDown);
  pressBtn.addEventListener("keyup", pKeyUp);

  // ---- 프레임 ----
  let shownHud = "";
  let shownBtnKey = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const cx = W * 0.5;
    const cy = 178;
    const p = prog[mode];
    const rock = ROCKS[mode];
    const gs = genGrains(mode);

    // 깊이 목표
    if (depth01 >= DEEP_AT) collect("deep", "열·압력 ↑!", "지하 깊은 곳 — 온도와 압력이 세져요");

    // 조이기 진행 — 누르는 도중 얕아지면 홀드를 풀고 힌트(비활성 버튼은 pointerup을 삼킬 수 있다)
    if (holding && depth01 < DEEP_AT) {
      holding = false;
      if (tMs - deepHintAt > 2000) {
        deepHintAt = tMs;
        toast("더 깊은 곳이어야 변성이 일어나요");
      }
    }
    if (holding && canPress()) {
      prog[mode] = Math.min(1, p + (dt * 16.7) / 2300);
      if (prog[mode] >= 1 && !done[mode]) {
        done[mode] = true;
        holding = false;
        rockPill.textContent = `${rock.name} → ${rock.out}`;
        refreshPressBtn();
        if (rock.foliate) collect("fol", "편마암!", "광물이 눌려 가로 줄무늬(엽리)로!");
        else collect("nofol", `${rock.out}!`, `${rock.out} 완성 — 엽리 없이 치밀!`);
      }
    }
    plateEng += ((holding ? 1 : 0.35) - plateEng) * Math.min(1, 0.1 * dt);

    // ---- 배경: 지하 톤 ----
    ctx.fillStyle = `rgba(5,9,20,${depth01 * 0.28})`;
    ctx.fillRect(0, 0, W, CVH);
    softGlow(ctx, cx, CVH + 60, W * 0.75, "255,120,60", 0.04 + 0.14 * depth01);
    // 왼쪽 깊이 눈금자
    const ryTop = 66;
    const ryBot = CVH - 54;
    ctx.strokeStyle = "rgba(148,168,196,.35)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(26, ryTop);
    ctx.lineTo(26, ryBot);
    ctx.stroke();
    ctx.font = "600 9.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    for (let km = 0; km <= DEPTH_KM; km += 5) {
      const yy = ryTop + (km / DEPTH_KM) * (ryBot - ryTop);
      ctx.strokeStyle = "rgba(148,168,196,.35)";
      ctx.beginPath();
      ctx.moveTo(22, yy);
      ctx.lineTo(30, yy);
      ctx.stroke();
      ctx.fillStyle = "rgba(196,212,232,.6)";
      ctx.fillText(`${km}`, 34, yy + 3);
    }
    const my = ryTop + depth01 * (ryBot - ryTop);
    ctx.fillStyle = tempColor(depth01, 0.95);
    ctx.beginPath();
    ctx.moveTo(14, my - 5);
    ctx.lineTo(22, my);
    ctx.lineTo(14, my + 5);
    ctx.closePath();
    ctx.fill();

    // ---- 암석 기하 ----
    const RW0 = Math.min(W * 0.52, 210);
    const RW = RW0 * (1 + 0.24 * p);
    const RH = RH0 * (1 - 0.3 * p);
    const qx = holding ? Math.sin(tMs / 26) * 0.9 : 0;
    const rx = cx - RW / 2 + qx;
    const ry = cy - RH / 2;

    contactShadow(ctx, cx, cy + RH0 / 2 + 26, RW * 0.6, 0.2);

    // ---- 프레스(위·아래 — 엽리는 압력에 수직으로 생긴다) ----
    const gap = 8 + (1 - plateEng) * 22;
    const plateW = RW + 40;
    const drawPlate = (pyTop: number, up: boolean): void => {
      const pg = ctx.createLinearGradient(0, pyTop, 0, pyTop + 15);
      pg.addColorStop(0, "rgba(235,242,252,.4)");
      pg.addColorStop(1, "rgba(140,158,188,.22)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.roundRect(cx - plateW / 2, pyTop, plateW, 15, 7);
      ctx.fill();
      ctx.strokeStyle = "rgba(214,230,250,.5)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // 피스톤 축
      ctx.fillStyle = "rgba(150,168,196,.3)";
      ctx.beginPath();
      ctx.roundRect(cx - 8, up ? pyTop - 20 : pyTop + 15, 16, 20, 4);
      ctx.fill();
    };
    drawPlate(ry - gap - 15, true);
    drawPlate(ry + RH + gap, false);
    // 압력 화살표(누를 때 진하게)
    const arrA = 0.35 + 0.6 * plateEng;
    ctx.strokeStyle = `rgba(255,176,58,${arrA})`;
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    const arrLen = 18 + 12 * p;
    for (const side of [-1, 1]) {
      const ax = cx + side * RW * 0.28;
      // 위에서 ↓
      let ay = ry - gap - 22 - arrLen;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, ay + arrLen);
      ctx.moveTo(ax - 5, ay + arrLen - 7);
      ctx.lineTo(ax, ay + arrLen);
      ctx.lineTo(ax + 5, ay + arrLen - 7);
      ctx.stroke();
      // 아래에서 ↑
      ay = ry + RH + gap + 22 + arrLen;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, ay - arrLen);
      ctx.moveTo(ax - 5, ay - arrLen + 7);
      ctx.lineTo(ax, ay - arrLen);
      ctx.lineTo(ax + 5, ay - arrLen + 7);
      ctx.stroke();
    }
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = `rgba(255,214,138,${arrA})`;
    ctx.fillText("압력", cx + RW * 0.28 + 10, ry - gap - 24);

    // ---- 암석 몸체 ----
    const bodyPath = (): void => {
      ctx.beginPath();
      ctx.roundRect(rx, ry, RW, RH, 16 - 6 * p);
    };
    const bg = ctx.createLinearGradient(rx, ry, rx + RW * 0.4, ry + RH);
    bg.addColorStop(0, mixc(rock.body[0], rock.bodyOut[0], p));
    bg.addColorStop(0.5, mixc(rock.body[1], rock.bodyOut[1], p));
    bg.addColorStop(1, mixc(rock.body[2], rock.bodyOut[2], p));
    bodyPath();
    ctx.fillStyle = bg;
    ctx.fill();

    ctx.save();
    bodyPath();
    ctx.clip();
    // 좌상단 키라이트
    const hl = ctx.createRadialGradient(rx + RW * 0.24, ry + RH * 0.2, 4, rx + RW * 0.24, ry + RH * 0.2, RW * 0.5);
    hl.addColorStop(0, "rgba(255,255,255,.20)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(rx, ry, RW, RH);

    if (rock.foliate) {
      // 편마암 줄무늬 띠(정렬이 진행될수록 뚜렷) — 가로 방향!
      if (p > 0.1) {
        for (const row of ROWS) {
          const bandY = cy + row.y * RH;
          const bandH = RH * 0.115;
          ctx.fillStyle = row.dark ? `rgba(42,46,62,${0.4 * p})` : `rgba(232,238,250,${0.22 * p})`;
          ctx.beginPath();
          ctx.moveTo(rx, bandY - bandH / 2 + Math.sin(rx * 0.05) * 2);
          for (let px = rx + 10; px <= rx + RW; px += 10)
            ctx.lineTo(px, bandY - bandH / 2 + Math.sin(px * 0.05 + row.y * 9) * 2.4 * p);
          ctx.lineTo(rx + RW, bandY + bandH / 2);
          for (let px = rx + RW - 10; px >= rx; px -= 10)
            ctx.lineTo(px, bandY + bandH / 2 + Math.sin(px * 0.05 + row.y * 9 + 2) * 2.4 * p);
          ctx.closePath();
          ctx.fill();
        }
      }
      // 광물 막대(압력에 수직 = 가로로 회전·정렬)
      for (let i = 0; i < gs.length; i++) {
        const g = gs[i];
        const yy = cy + (g.yf + (g.rowY + g.jit - g.yf) * p * 0.85) * RH;
        const xx = cx + g.xf * RW + (holding ? Math.sin(tMs / 24 + i) * 0.7 : 0);
        const ang = g.ang * (1 - p);
        const len = g.len * (1 + 0.4 * p);
        const gw = g.w * (1 - 0.28 * p);
        ctx.save();
        ctx.translate(xx, yy);
        ctx.rotate(ang);
        const gg = ctx.createLinearGradient(0, -gw / 2, 0, gw / 2);
        if (g.dark) {
          gg.addColorStop(0, "#4A4550");
          gg.addColorStop(1, "#2E2B36");
        } else {
          gg.addColorStop(0, "#ECEFF7");
          gg.addColorStop(1, "#C4CBDC");
        }
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.roundRect(-len / 2, -gw / 2, len, gw, gw / 2);
        ctx.fill();
        ctx.strokeStyle = g.dark ? "rgba(16,14,22,.7)" : "rgba(96,106,130,.65)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // 사암·석회암: 둥근 알갱이 — 조이면 촘촘히 재결합(엽리 없음!)
      for (let i = 0; i < gs.length; i++) {
        const g = gs[i];
        const xx = cx + g.xf * RW * (1 - 0.08 * p) + (holding ? Math.sin(tMs / 24 + i) * 0.7 : 0);
        const yy = cy + g.yf * RH * (1 - 0.06 * p);
        const rr = (g.w / 2) * (1 + 0.22 * p);
        const tone = i % 3;
        const base = mixc(rock.body[tone === 0 ? 0 : tone === 1 ? 1 : 2], rock.bodyOut[tone === 0 ? 0 : tone === 1 ? 1 : 2], p);
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(xx, yy, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(80,66,42,${0.4 * (1 - p * 0.6)})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        // 좌상단 미세 하이라이트
        ctx.fillStyle = `rgba(255,255,255,${0.18 + 0.2 * p})`;
        ctx.beginPath();
        ctx.arc(xx - rr * 0.3, yy - rr * 0.3, rr * 0.26, 0, Math.PI * 2);
        ctx.fill();
      }
      // 공극(빈틈)은 조일수록 사라진다
      if (p < 0.95) {
        for (let i = 0; i < 22; i++) {
          const fx = Math.sin(i * 12.9898) * 43758.5453;
          const fy = Math.sin(i * 78.233) * 12543.21;
          const ux = fx - Math.floor(fx);
          const uy = fy - Math.floor(fy);
          ctx.fillStyle = `rgba(40,30,16,${0.28 * (1 - p)})`;
          ctx.beginPath();
          ctx.arc(rx + 8 + ux * (RW - 16), ry + 8 + uy * (RH - 16), 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 치밀해진 뒤 결정 반짝임
      if (p > 0.72) {
        const a = (p - 0.72) / 0.28;
        for (let i = 0; i < 8; i++) {
          const g = gs[(i * 6 + 2) % gs.length];
          const xx = cx + g.xf * RW * 0.9;
          const yy = cy + g.yf * RH * 0.9;
          const tw = 0.5 + 0.5 * Math.sin(tMs / 220 + i * 2.2);
          ctx.strokeStyle = `rgba(255,255,255,${0.55 * a * tw})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(xx - 3.4, yy);
          ctx.lineTo(xx + 3.4, yy);
          ctx.moveTo(xx, yy - 3.4);
          ctx.lineTo(xx, yy + 3.4);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
    // 외곽선(최암색)
    bodyPath();
    ctx.strokeStyle = rock.line;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // ---- 변환 라벨 ----
    ctx.font = "700 12.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    const ly = cy + RH0 / 2 + 44;
    const doneNow = done[mode];
    ctx.fillStyle = "rgba(226,240,255,.85)";
    ctx.fillText(rock.name, cx - 54, ly);
    ctx.strokeStyle = `rgba(200,148,89,${0.4 + 0.5 * p})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 22, ly - 4);
    ctx.lineTo(cx + 14, ly - 4);
    ctx.moveTo(cx + 8, ly - 8);
    ctx.lineTo(cx + 14, ly - 4);
    ctx.lineTo(cx + 8, ly);
    ctx.stroke();
    ctx.fillStyle = doneNow ? "#F2DDBE" : `rgba(242,221,190,${0.35 + 0.5 * p})`;
    ctx.fillText(rock.out, cx + 52, ly);
    if (doneNow) {
      ctx.font = "700 10px Pretendard, sans-serif";
      ctx.fillStyle = rock.foliate ? "rgba(255,214,138,.9)" : "rgba(160,226,214,.9)";
      ctx.fillText(rock.foliate ? "엽리 줄무늬!" : "엽리 없음 — 치밀!", cx + 52, ly + 15);
    }

    // ---- HUD ----
    const km = Math.round(depth01 * DEPTH_KM);
    const temp = Math.round(15 + depth01 * 585);
    const pct = Math.round((0.45 * depth01 + 0.55 * p) * 100);
    const hudKey = `${km}|${temp}|${pct}`;
    if (hudKey !== shownHud) {
      shownHud = hudKey;
      depthPill.textContent = `지하 ${km} km · ${temp}℃`;
      depthDot.style.background = tempColor(depth01);
      gaugeFill.style.width = `${pct}%`;
      gaugeFill.style.background = pct > 62 ? "#FF9F43" : "#5AA2F8";
      gaugeVal.textContent = `${pct}%`;
    }
    const btnKey = `${mode}|${done[mode]}|${depth01 >= DEEP_AT}`;
    if (btnKey !== shownBtnKey) {
      shownBtnKey = btnKey;
      refreshPressBtn();
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

  api.setCTA("깊이 → 조이기 → 비교까지!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    for (const [k, h] of rockHandlers) rockBtns.get(k)!.removeEventListener("click", h);
    slider.removeEventListener("pointerdown", slDown);
    slider.removeEventListener("pointermove", slMove);
    slider.removeEventListener("pointerup", slUp);
    slider.removeEventListener("pointercancel", slUp);
    slider.removeEventListener("keydown", slKey);
    pressBtn.removeEventListener("pointerdown", pDown);
    pressBtn.removeEventListener("pointerup", pUp);
    pressBtn.removeEventListener("pointercancel", pUp);
    pressBtn.removeEventListener("keydown", pKeyDown);
    pressBtn.removeEventListener("keyup", pKeyUp);
  };
};
