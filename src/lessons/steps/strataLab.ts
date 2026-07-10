// strataLab — 지층·퇴적암 랩(중2 II). 교과서 탐구(68쪽)의 조작판.
//   · 바다 단면에 퇴적물(자갈·모래·진흙·조개껍데기)을 골라 뿌리면 물속을 흩날리며 가라앉아 한 층이 된다
//     — 입자가 클수록 빨리 가라앉고, 층마다 크기·색이 달라 줄무늬가 저절로 생긴다
//   · 4층 이상 + 서로 다른 퇴적물 3가지면 "다지기" 개방 — 꾹 누르면 물이 빠지며 눌려 굳는다(층리 완성)
//   · 맨 위층 퇴적물로 대표 암석 판정(자갈→역암 · 모래→사암 · 진흙→이암 · 조개→석회암)
//   · 3층째에는 물고기 뼈가 함께 묻힌다 — 다진 뒤 반짝이는 곳을 탭하면 화석 발견
// 목표: ① 서로 다른 퇴적물 3층 ② 다져 굳히기 ③ 화석 발견.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { softGlow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface StrataStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type SedKey = "gravel" | "sand" | "mud" | "shell";
interface SedDef {
  name: string;
  rock: string;
  th: number; // 층 기본 두께(px)
  count: number; // 뿌리는 입자 수
  rMin: number;
  rMax: number;
  vMin: number; // 침강 속도(px/frame) — 입자가 클수록 빠르다
  vMax: number;
  light: string;
  mid: string;
  dark: string;
  line: string; // 경계선(최암색)
}
const SEDS: Record<SedKey, SedDef> = {
  gravel: { name: "자갈", rock: "역암", th: 30, count: 30, rMin: 3.2, rMax: 5.0, vMin: 2.6, vMax: 3.3,
    light: "#B9C4D6", mid: "#8C9BB2", dark: "#5F6F88", line: "rgba(40,50,68,.85)" },
  sand: { name: "모래", rock: "사암", th: 24, count: 72, rMin: 1.5, rMax: 2.2, vMin: 1.5, vMax: 2.0,
    light: "#EBD9A8", mid: "#D2B678", dark: "#A98D4E", line: "rgba(104,82,38,.8)" },
  mud: { name: "진흙", rock: "이암", th: 19, count: 96, rMin: 0.8, rMax: 1.3, vMin: 0.85, vMax: 1.15,
    light: "#A98C6B", mid: "#8A6C4C", dark: "#64492F", line: "rgba(58,42,26,.8)" },
  shell: { name: "조개껍데기", rock: "석회암", th: 24, count: 26, rMin: 2.6, rMax: 3.8, vMin: 1.9, vMax: 2.4,
    light: "#F2EDE0", mid: "#D9D0BC", dark: "#B2A78D", line: "rgba(118,110,88,.75)" },
};
const SED_KEYS: SedKey[] = ["gravel", "sand", "mud", "shell"];

interface Layer {
  key: SedKey;
  landed: number;
  fill: number; // 0..1
  seed: number;
  waveAmp: number;
  waveK: number;
  wavePhase: number;
}
interface Grain {
  xf: number; // 0..1 (무대 폭 기준 — 리사이즈 안전)
  y: number;
  vy: number;
  r: number;
  swayA: number;
  swayF: number;
  swayP: number;
  delay: number; // 타다닥 시간차(ms)
}
interface Drop {
  xf: number;
  y: number;
  vy: number;
  life: number;
}

const CVH = 368;
const SURF_Y = 52;
const FLOOR_Y = CVH - 30;
const MAX_LAYERS = 6;
const rnd = (seed: number): number => {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
};

export const strataLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as StrataStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "button",
      "aria-label": "바다 단면 무대. 다진 뒤 반짝이는 곳을 눌러 화석을 찾아요. 엔터 키로도 확인할 수 있어요.",
    },
  });
  const layerPill = el("span", { text: "지층 0층" });
  const layerDot = el("span", { class: "pdot", style: "background:#8CA2C0" });
  const gaugeFill = el("i", {});
  const gaugeVal = el("b", { text: "0%" });
  const gauge = el(
    "div",
    { class: "cv-gauge" },
    el("span", { text: "다짐" }),
    el("div", { class: "cv-gauge-track" }, gaugeFill),
    gaugeVal,
  );
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "퇴적물 버튼을 눌러 물속에 뿌려 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, layerDot, layerPill), gauge),
    toastEl,
    capEl,
  );

  // 퇴적물 팔레트(4종)
  const seg = el("div", { class: "seg" });
  const sedBtns = new Map<SedKey, HTMLButtonElement>();
  for (const k of SED_KEYS) {
    const d = SEDS[k];
    const b = el("button", { attrs: { type: "button", "aria-label": `${d.name} 뿌리기` } });
    b.innerHTML = `<i style="display:inline-block;width:9px;height:9px;border-radius:99px;background:${d.mid};margin-right:5px;vertical-align:-1px"></i>${k === "shell" ? "조개" : d.name}`;
    seg.appendChild(b);
    sedBtns.set(k, b);
  }
  const compactBtn = el(
    "button",
    { class: "swapbtn", style: "opacity:.45", attrs: { type: "button", disabled: "true" } },
    el("span", { text: "다지기 — 4층 넘게 쌓으면 열려요" }),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "stack" } }, el("b", { text: "층층이 쌓기" }), el("span", { text: "3가지 이상" })),
    el("div", { class: "pn-badge geo", dataset: { g: "press" } }, el("b", { text: "다져 굳히기" }), el("span", { text: "꾹 눌러!" })),
    el("div", { class: "pn-badge geo", dataset: { g: "fossil" } }, el("b", { text: "화석 발견" }), el("span", { text: "어디 있지?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "고요한 바다 밑바닥이에요. <b>퇴적물 4가지</b> 중 하나를 골라 뿌리면 가라앉아 한 층이 돼요 — 서로 다른 종류로 쌓아 보세요!",
  });
  host.append(goalChips, helper, stage, seg, compactBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  const layers: Layer[] = [];
  const parts: Grain[] = [];
  const drops: Drop[] = [];
  let pourKey: SedKey | null = null;
  let pourLeft = 0;
  let comp = 0; // 다짐 진행 0..1
  let compacted = false;
  let holdingC = false;
  let plateA = 0; // 누름판 표시 알파
  let rockName = "";
  const fossil = { active: false, landed: false, found: false, xf: 0.5, y: 0, layerIdx: 2, px: 0, py: 0 };
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;
  let sedsEnabled = true;
  let resetMode = false;

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
  function distinct(): number {
    return new Set(layers.map((l) => l.key)).size;
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
        "입자 크기·색이 다른 퇴적물이 쌓여 만든 줄무늬가 <b>층리</b> — 화석도 퇴적암의 트레이드마크예요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "stack") {
      helper.innerHTML = "줄무늬가 생기기 시작했어요! <b>4층 이상</b> 쌓이면 다지기 버튼이 열려요 — 계속 쌓아 볼까요?";
    } else if (id === "press" && !goals.has("fossil")) {
      helper.innerHTML = "단단히 굳었어요! 그런데 무대 어딘가 <b>반짝이는 곳</b>이 보이네요 — 눌러 보세요.";
    }
  }

  // ---- 버튼 상태 갱신 ----
  function setSeds(on: boolean): void {
    if (sedsEnabled === on) return;
    sedsEnabled = on;
    for (const b of sedBtns.values()) {
      b.disabled = !on;
      b.style.opacity = on ? "" : ".45";
    }
  }
  function compactReady(): boolean {
    return !compacted && !resetMode && pourLeft === 0 && layers.length >= 4 && distinct() >= 3;
  }
  function refreshCompactBtn(): void {
    const span = compactBtn.firstChild as HTMLElement;
    if (compacted) {
      compactBtn.className = "swapbtn done-static";
      compactBtn.style.opacity = "";
      (compactBtn as HTMLButtonElement).disabled = true;
      span.textContent = `${rockName} 완성 — 층리!`;
      return;
    }
    if (resetMode) {
      compactBtn.className = "swapbtn";
      compactBtn.style.opacity = "";
      (compactBtn as HTMLButtonElement).disabled = false;
      span.textContent = "처음부터 다시 쌓기";
      return;
    }
    if (compactReady()) {
      compactBtn.className = "swapbtn pulse";
      compactBtn.style.opacity = "";
      (compactBtn as HTMLButtonElement).disabled = false;
      span.textContent = "다지기 — 꾹 눌러 굳히기";
    } else {
      compactBtn.className = "swapbtn";
      compactBtn.style.opacity = ".45";
      (compactBtn as HTMLButtonElement).disabled = true;
      span.textContent = layers.length < 4 ? "다지기 — 4층 넘게 쌓으면 열려요" : "다지기 — 퇴적물 3가지가 필요해요";
    }
  }

  // ---- 뿌리기 ----
  function pour(key: SedKey): void {
    if (pourLeft > 0 || compacted || comp > 0 || layers.length >= MAX_LAYERS) return;
    hideCap();
    haptic(HAPTIC.select);
    const d = SEDS[key];
    layers.push({
      key,
      landed: 0,
      fill: 0,
      seed: Math.random() * 1000,
      waveAmp: 2 + Math.random() * 1.5,
      waveK: 0.035 + Math.random() * 0.03,
      wavePhase: Math.random() * 6.28,
    });
    pourKey = key;
    pourLeft = d.count;
    for (let i = 0; i < d.count; i++) {
      parts.push({
        xf: 0.02 + Math.random() * 0.96,
        y: SURF_Y - 6 - Math.random() * 22,
        vy: d.vMin + Math.random() * (d.vMax - d.vMin),
        r: d.rMin + Math.random() * (d.rMax - d.rMin),
        swayA: key === "mud" ? 5 + Math.random() * 4 : 1.5 + Math.random() * 2,
        swayF: 0.002 + Math.random() * 0.003,
        swayP: Math.random() * 6.28,
        delay: Math.random() * 800,
      });
    }
    // 3층째: 물고기 뼈가 함께 가라앉아 묻힌다
    if (layers.length === 3) {
      fossil.active = true;
      fossil.landed = false;
      fossil.xf = 0.3 + Math.random() * 0.4;
      fossil.y = SURF_Y - 14;
    }
    layerDot.style.background = d.mid;
    setSeds(false);
    refreshCompactBtn();
  }
  const sedHandlers = new Map<SedKey, () => void>();
  for (const k of SED_KEYS) {
    const h = (): void => pour(k);
    sedHandlers.set(k, h);
    sedBtns.get(k)!.addEventListener("click", h);
  }

  function onPourDone(): void {
    pourKey = null;
    layerPill.textContent = `지층 ${layers.length}층`;
    if (!compacted && layers.length < MAX_LAYERS) setSeds(true);
    if (layers.length >= 3 && distinct() >= 3) collect("stack", "3가지 지층!", "크기·색이 다른 층 — 줄무늬가 보여요!");
    if (layers.length === 1 && !goals.has("stack")) {
      helper.innerHTML = "한 층 완성! 입자가 <b>클수록 빨리</b> 가라앉는 것도 봤나요? 이번엔 <b>다른 퇴적물</b>로!";
    }
    if (layers.length >= MAX_LAYERS && distinct() < 3) {
      resetMode = true;
      setSeds(false);
      helper.innerHTML = "바닥이 가득 찼는데 줄무늬가 안 보여요 — <b>서로 다른 퇴적물</b>이어야 층이 구분돼요. 다시 쌓아 볼까요?";
    }
    if (layers.length >= MAX_LAYERS) setSeds(false);
    refreshCompactBtn();
  }

  function doReset(): void {
    layers.length = 0;
    parts.length = 0;
    drops.length = 0;
    pourKey = null;
    pourLeft = 0;
    comp = 0;
    compacted = false;
    resetMode = false;
    rockName = "";
    fossil.active = false;
    fossil.landed = false;
    fossil.found = false;
    layerPill.textContent = "지층 0층";
    layerDot.style.background = "#8CA2C0";
    canvas.style.cursor = "";
    setSeds(true);
    refreshCompactBtn();
    haptic(HAPTIC.tap);
    toast("새 바다 — 다시 차근차근 쌓아요");
  }

  // ---- 다지기(꾹) ----
  const cDown = (e: PointerEvent): void => {
    if (resetMode) return;
    if (!compactReady()) return;
    holdingC = true;
    try {
      compactBtn.setPointerCapture(e.pointerId);
    } catch {
      /* 포인터가 이미 사라진 경우 무시 */
    }
    haptic(HAPTIC.tap);
  };
  const cUp = (): void => {
    holdingC = false;
  };
  const cKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (resetMode) return; // 클릭 이벤트가 리셋을 처리
    e.preventDefault();
    if (e.repeat) return;
    if (compactReady()) {
      holdingC = true;
      haptic(HAPTIC.tap);
    }
  };
  const cKeyUp = (): void => {
    holdingC = false;
  };
  const cClick = (): void => {
    if (resetMode) doReset();
  };
  compactBtn.addEventListener("pointerdown", cDown);
  compactBtn.addEventListener("pointerup", cUp);
  compactBtn.addEventListener("pointercancel", cUp);
  compactBtn.addEventListener("keydown", cKeyDown);
  compactBtn.addEventListener("keyup", cKeyUp);
  compactBtn.addEventListener("click", cClick);

  // ---- 화석 탭 ----
  function findFossil(): void {
    if (fossil.found || !compacted || !fossil.landed) return;
    fossil.found = true;
    canvas.style.cursor = "";
    haptic(HAPTIC.correct);
    collect("fossil", "물고기 뼈!", "지층 속에 잠들어 있던 화석 발견!");
  }
  const onCvDown = (e: PointerEvent): void => {
    if (!compacted || fossil.found || !fossil.landed) return;
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (Math.hypot(px - fossil.px, py - fossil.py) < 30) findFossil();
    else toast("반짝이는 곳을 노려 보세요");
  };
  const onCvKey = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    findFossil();
  };
  canvas.addEventListener("pointerdown", onCvDown);
  canvas.addEventListener("keydown", onCvKey);

  // ---- 기하 ----
  const compScale = (): number => 1 - 0.38 * comp;
  const layerTh = (l: Layer): number => SEDS[l.key].th * l.fill * compScale();
  function cumH(upto: number): number {
    let h = 0;
    for (let i = 0; i < upto && i < layers.length; i++) h += layerTh(layers[i]);
    return h;
  }

  // ---- 프레임 ----
  let shownPct = -1;
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const x0 = 16;
    const x1 = W - 16;
    const xOf = (f: number): number => x0 + f * (x1 - x0);

    // ---- 물리: 침강 ----
    if (pourKey) {
      const L = layers.length - 1;
      const below = cumH(L);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.delay > 0) {
          p.delay -= dt * 16.7;
          continue;
        }
        p.y += p.vy * dt;
        const depositY = FLOOR_Y - below - layerTh(layers[L]);
        if (p.y + p.r >= depositY) {
          layers[L].landed++;
          layers[L].fill = Math.min(1, layers[L].landed / SEDS[layers[L].key].count);
          parts.splice(i, 1);
          pourLeft--;
        }
      }
      if (pourLeft <= 0) {
        layers[layers.length - 1].fill = 1;
        onPourDone();
      }
    }
    // 화석 침강 — 뿌리기가 먼저 끝나도 제 속도로 끝까지 가라앉는다
    if (fossil.active && !fossil.landed && layers.length > fossil.layerIdx) {
      fossil.y += 1.05 * dt;
      const fy = FLOOR_Y - cumH(fossil.layerIdx) - layerTh(layers[fossil.layerIdx]) * 0.5;
      if (fossil.y >= fy) {
        fossil.y = fy;
        fossil.landed = true;
        if (compacted && !fossil.found) canvas.style.cursor = "pointer";
      }
    }

    // ---- 물리: 다지기 ----
    if (holdingC && compactReady()) {
      comp = Math.min(1, comp + (dt * 16.7) / 1700);
      // 물이 빠져나가는 방울(속성 작용)
      if (comp < 1 && drops.length < 26 && Math.random() < 0.5) {
        drops.push({ xf: 0.06 + Math.random() * 0.88, y: FLOOR_Y - cumH(layers.length) - 3, vy: -(0.7 + Math.random() * 0.7), life: 1 });
      }
      if (comp >= 1 && !compacted) {
        compacted = true;
        holdingC = false;
        rockName = SEDS[layers[layers.length - 1].key].rock;
        layerPill.textContent = `${rockName} — 층리 완성!`;
        setSeds(false);
        if (fossil.landed) canvas.style.cursor = "pointer";
        refreshCompactBtn();
        collect("press", "층리 완성!", `${rockName} 완성 — 경계가 또렷해요!`);
      }
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.y += d.vy * dt;
      d.life -= 0.02 * dt;
      if (d.life <= 0 || d.y < SURF_Y + 8) drops.splice(i, 1);
    }
    plateA += (((holdingC || (comp > 0 && !compacted)) ? 1 : 0) - plateA) * Math.min(1, 0.12 * dt);

    // ---- 그리기: 물 ----
    const waveY = (px: number): number => SURF_Y + Math.sin(px / 34 + tMs / 900) * 1.6;
    const wg = ctx.createLinearGradient(0, SURF_Y, 0, FLOOR_Y);
    wg.addColorStop(0, "rgba(92,152,235,.20)");
    wg.addColorStop(1, "rgba(92,152,235,.06)");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(0, waveY(0));
    for (let px = 8; px <= W; px += 8) ctx.lineTo(px, waveY(px));
    ctx.lineTo(W, FLOOR_Y);
    ctx.lineTo(0, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(226,242,255,.5)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, waveY(0));
    for (let px = 8; px <= W; px += 8) ctx.lineTo(px, waveY(px));
    ctx.stroke();
    // 수면 위 은은한 하늘빛
    const skyG = ctx.createLinearGradient(0, 0, 0, SURF_Y);
    skyG.addColorStop(0, "rgba(150,196,255,.07)");
    skyG.addColorStop(1, "rgba(150,196,255,.015)");
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, SURF_Y);

    // ---- 그리기: 바닥(기반암) ----
    const bedG = ctx.createLinearGradient(0, FLOOR_Y, 0, CVH);
    bedG.addColorStop(0, "#233350");
    bedG.addColorStop(1, "#141F32");
    ctx.fillStyle = bedG;
    ctx.fillRect(0, FLOOR_Y, W, CVH - FLOOR_Y);
    ctx.strokeStyle = "rgba(150,176,210,.35)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(W, FLOOR_Y);
    ctx.stroke();

    // ---- 그리기: 지층 밴드 ----
    const sampleStep = 10;
    const edgeYAt = (j: number, px: number): number => {
      // 경계 j(=층 j-1의 윗면). 다질수록 경계 굴곡이 다림질된다.
      const base = FLOOR_Y - cumH(j);
      if (j === 0) return base;
      const l = layers[j - 1];
      return base - Math.sin(px * l.waveK + l.wavePhase) * l.waveAmp * (1 - comp * 0.75) * Math.min(1, l.fill * 1.6);
    };
    for (let i = 0; i < layers.length; i++) {
      const l = layers[i];
      if (l.fill <= 0.01) continue;
      const d = SEDS[l.key];
      const topAvg = FLOOR_Y - cumH(i + 1);
      const botAvg = FLOOR_Y - cumH(i);
      // 밴드 경로(위 곡선 → 아래 곡선 역순)
      ctx.beginPath();
      ctx.moveTo(x0, edgeYAt(i + 1, x0));
      for (let px = x0 + sampleStep; px <= x1; px += sampleStep) ctx.lineTo(px, edgeYAt(i + 1, px));
      ctx.lineTo(x1, edgeYAt(i, x1));
      for (let px = x1 - sampleStep; px >= x0; px -= sampleStep) ctx.lineTo(px, edgeYAt(i, px));
      ctx.closePath();
      const g = ctx.createLinearGradient(0, topAvg, 0, botAvg);
      g.addColorStop(0, d.light);
      g.addColorStop(0.42, d.mid);
      g.addColorStop(1, d.dark);
      ctx.fillStyle = g;
      ctx.fill();
      // 입자 텍스처(결정적 난수 — 프레임마다 고정)
      ctx.save();
      ctx.clip();
      const nSpeck = l.key === "sand" ? 56 : l.key === "mud" ? 40 : l.key === "gravel" ? 22 : 18;
      for (let k = 0; k < nSpeck; k++) {
        const fx = rnd(l.seed + k * 3.1);
        const fy = rnd(l.seed + k * 7.7 + 1);
        const px = xOf(fx);
        const py = topAvg + 2 + fy * Math.max(1, botAvg - topAvg - 4);
        if (l.key === "gravel") {
          ctx.fillStyle = k % 2 ? "rgba(52,64,86,.5)" : "rgba(214,226,242,.4)";
          ctx.beginPath();
          ctx.arc(px, py, 2.2 + rnd(l.seed + k) * 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (l.key === "sand") {
          ctx.fillStyle = k % 2 ? "rgba(120,94,42,.5)" : "rgba(255,244,208,.5)";
          ctx.fillRect(px, py, 1.5, 1.5);
        } else if (l.key === "mud") {
          ctx.strokeStyle = "rgba(46,32,18,.35)";
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(px - 2.5, py);
          ctx.lineTo(px + 2.5, py);
          ctx.stroke();
        } else {
          ctx.strokeStyle = "rgba(255,252,240,.6)";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(px, py, 2.6, Math.PI * 0.95, Math.PI * 2.05);
          ctx.stroke();
        }
      }
      // 다질수록 진해지는 톤(치밀해짐)
      if (comp > 0.02) {
        ctx.fillStyle = `rgba(18,14,8,${0.1 * comp})`;
        ctx.fill();
      }
      ctx.restore();
      // 윗면 하이라이트 + 경계선(다질수록 또렷)
      ctx.strokeStyle = "rgba(255,255,255,.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, edgeYAt(i + 1, x0) + 1.2);
      for (let px = x0 + sampleStep; px <= x1; px += sampleStep) ctx.lineTo(px, edgeYAt(i + 1, px) + 1.2);
      ctx.stroke();
      ctx.strokeStyle = d.line;
      ctx.globalAlpha = 0.25 + 0.6 * comp;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, edgeYAt(i + 1, x0));
      for (let px = x0 + sampleStep; px <= x1; px += sampleStep) ctx.lineTo(px, edgeYAt(i + 1, px));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 양옆 페이드(단면이 이어지는 느낌)
    for (const side of [0, 1]) {
      const gx = ctx.createLinearGradient(side ? W : 0, 0, side ? W - 22 : 22, 0);
      gx.addColorStop(0, "rgba(11,21,36,.85)");
      gx.addColorStop(1, "rgba(11,21,36,0)");
      ctx.fillStyle = gx;
      ctx.fillRect(side ? W - 22 : 0, SURF_Y, 22, FLOOR_Y - SURF_Y);
    }

    // ---- 그리기: 떨어지는 입자 ----
    if (pourKey) {
      const d = SEDS[pourKey];
      for (const p of parts) {
        if (p.delay > 0) continue;
        const sway = Math.sin(tMs * p.swayF + p.swayP) * p.swayA * (p.y > SURF_Y ? 1 : 0.3);
        const px = xOf(p.xf) + sway;
        ctx.fillStyle = p.r > (d.rMin + d.rMax) / 2 ? d.light : d.mid;
        ctx.beginPath();
        if (pourKey === "shell") {
          ctx.arc(px, p.y, p.r, Math.PI * 0.9, Math.PI * 2.1);
          ctx.strokeStyle = d.light;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else {
          ctx.arc(px, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ---- 그리기: 물 빠짐 방울 ----
    for (const d of drops) {
      ctx.fillStyle = `rgba(158,206,255,${0.5 * d.life})`;
      ctx.beginPath();
      ctx.arc(xOf(d.xf), d.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 그리기: 화석 ----
    if (fossil.active) {
      let fy = fossil.y;
      if (fossil.landed && fossil.layerIdx < layers.length) {
        const j = fossil.layerIdx;
        fy = FLOOR_Y - cumH(j) - layerTh(layers[j]) * 0.5;
      }
      const fx = xOf(fossil.xf);
      fossil.px = fx;
      fossil.py = fy;
      const rocking = fossil.landed ? 0.12 : Math.sin(tMs / 500) * 0.25;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(rocking);
      ctx.globalAlpha = fossil.found ? 1 : fossil.landed ? 0.8 : 0.95;
      ctx.strokeStyle = "rgba(242,238,224,.92)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();
      for (let k = -11; k <= 5; k += 4) {
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k - 2, -4.6);
        ctx.moveTo(k, 0);
        ctx.lineTo(k - 2, 4.6);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(12, 0, 3.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(242,238,224,.92)";
      ctx.beginPath();
      ctx.arc(13, -0.9, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(-20, -4);
      ctx.moveTo(-15, 0);
      ctx.lineTo(-20, 4);
      ctx.stroke();
      ctx.restore();
      // 다진 뒤: 반짝임 유도 → 발견하면 링 + 라벨
      if (compacted && !fossil.found) {
        const tw = (Math.sin(tMs / 240) + 1) / 2;
        softGlow(ctx, fx, fy, 20, "255,220,140", 0.14 + 0.18 * tw);
        ctx.strokeStyle = `rgba(255,230,160,${0.5 + 0.4 * tw})`;
        ctx.lineWidth = 1.6;
        const rr = 7 + tw * 4;
        ctx.beginPath();
        ctx.moveTo(fx - rr, fy);
        ctx.lineTo(fx + rr, fy);
        ctx.moveTo(fx, fy - rr);
        ctx.lineTo(fx, fy + rr);
        ctx.stroke();
      }
      if (fossil.found) {
        softGlow(ctx, fx, fy, 26, "255,214,138", 0.2);
        ctx.strokeStyle = "rgba(255,214,138,.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx, fy, 17, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "700 11px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,228,178,.95)";
        ctx.fillText("물고기 화석", fx, fy - 24);
      }
    }

    // ---- 그리기: 누름판(위 지층의 무게) ----
    if (plateA > 0.02 && layers.length > 0) {
      ctx.save();
      ctx.globalAlpha = plateA;
      const topY = FLOOR_Y - cumH(layers.length);
      const py = topY - 16;
      const pg = ctx.createLinearGradient(0, py, 0, py + 13);
      pg.addColorStop(0, "rgba(235,242,252,.5)");
      pg.addColorStop(1, "rgba(150,168,196,.28)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.roundRect(x0 + 6, py, x1 - x0 - 12, 13, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(220,234,252,.55)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // 아래로 누르는 화살표 3개
      ctx.strokeStyle = "rgba(255,176,58,.9)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (const f of [0.26, 0.5, 0.74]) {
        const ax = xOf(f);
        const ay = py - 30 + comp * 5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax, ay + 20);
        ctx.moveTo(ax - 5, ay + 13);
        ctx.lineTo(ax, ay + 20);
        ctx.lineTo(ax + 5, ay + 13);
        ctx.stroke();
      }
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,214,138,.9)";
      ctx.fillText("위에서 누르는 무게", W / 2, py - 36);
      ctx.restore();
    }

    // ---- 그리기: 층리 라벨(다진 뒤) ----
    if (compacted && layers.length >= 2) {
      const midJ = Math.max(1, Math.floor(layers.length / 2));
      const ly = FLOOR_Y - cumH(midJ);
      const lx = x1 - 52;
      ctx.fillStyle = "rgba(16,28,48,.85)";
      ctx.beginPath();
      ctx.roundRect(lx - 26, ly - 11, 52, 22, 11);
      ctx.fill();
      ctx.strokeStyle = "rgba(200,148,89,.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.font = "800 11px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#F2DDBE";
      ctx.fillText("층리", lx, ly + 3.6);
      ctx.strokeStyle = "rgba(200,148,89,.55)";
      ctx.beginPath();
      ctx.moveTo(lx - 26, ly);
      ctx.lineTo(lx - 58, ly);
      ctx.stroke();
    }

    // HUD 갱신
    const pct = Math.round(comp * 100);
    if (pct !== shownPct) {
      shownPct = pct;
      gaugeFill.style.width = `${pct}%`;
      gaugeFill.style.background = pct >= 100 ? "#C89459" : "#5AA2F8";
      gaugeVal.textContent = `${pct}%`;
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

  api.setCTA("쌓기 → 다지기 → 화석 찾기!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    for (const [k, h] of sedHandlers) sedBtns.get(k)!.removeEventListener("click", h);
    compactBtn.removeEventListener("pointerdown", cDown);
    compactBtn.removeEventListener("pointerup", cUp);
    compactBtn.removeEventListener("pointercancel", cUp);
    compactBtn.removeEventListener("keydown", cKeyDown);
    compactBtn.removeEventListener("keyup", cKeyUp);
    compactBtn.removeEventListener("click", cClick);
    canvas.removeEventListener("pointerdown", onCvDown);
    canvas.removeEventListener("keydown", onCvKey);
  };
};
