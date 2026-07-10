// coolingLab — 화성암 랩(중2 II 지권의 변화 L3). 교과서 66~67쪽의 조작판.
//   · 좌: 지형 단면(위 지표·화산, 아래 지하 마그마 방) — 마그마 방울이 선택한 위치로 이동
//   · 우: 관찰 렌즈 — "식히기"를 누르면 결정이 자라는 과정이 그대로 보인다
//     (지표 = 순식간에 작은 결정이 우수수 / 지하 = 큰 결정이 천천히 성장)
//   · 냉각 속도(결정 크기) × 광물 조성(색) 2축 → 현무암·유문암·반려암·화강암 판정,
//     아래 2×2 표의 해당 칸이 채워진다
// 목표: ① 화산암 만들기(지표) ② 심성암 만들기(지하) ③ 네 칸 모두 완성.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { softGlow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CoolingStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Loc = "surface" | "deep";
type Comp = "dark" | "light";
type Phase = "liquid" | "cooling" | "done";

interface Crystal {
  ux: number; // 렌즈 중심 기준 단위 원 좌표(리사이즈 대응)
  uy: number;
  r: number;
  rot: number;
  verts: number[]; // 꼭짓점 반지름 배율(불규칙 다각형)
  color: string;
  start: number; // 성장 시작 시점(coolP 기준)
  micro: boolean; // 석기(바탕) 미세 알갱이
}

interface RockDef {
  name: string;
  kind: string;
  chip: string; // 표 칸 견본(css 그라데이션)
}

const ROCKS: Record<string, RockDef> = {
  "surface|dark": { name: "현무암", kind: "화산암 · 어두운 색", chip: "linear-gradient(150deg,#4A4E55,#23262B)" },
  "surface|light": { name: "유문암", kind: "화산암 · 밝은 색", chip: "linear-gradient(150deg,#EFE9DB,#CFC8B8)" },
  "deep|dark": { name: "반려암", kind: "심성암 · 어두운 색", chip: "linear-gradient(150deg,#535B53,#2A2F2B)" },
  "deep|light": { name: "화강암", kind: "심성암 · 밝은 색", chip: "linear-gradient(150deg,#F2E9DE,#D6C5B9)" },
};

const PAL: Record<
  Comp,
  { crystals: string[]; outline: string; matrix: readonly number[]; magmaHot: readonly number[]; magmaDeep: readonly number[] }
> = {
  dark: {
    crystals: ["#4E5B54", "#59646E", "#3E4A44", "#98A1AA"], // 마지막 = 밝은 사장석(소수)
    outline: "rgba(10,12,10,.6)",
    matrix: [35, 38, 43],
    magmaHot: [255, 118, 50],
    magmaDeep: [166, 42, 16],
  },
  light: {
    crystals: ["#ECE8DE", "#E9CDB9", "#DFD9CB", "#3A342C"], // 마지막 = 흑운모 반점(소수)
    outline: "rgba(96,86,70,.55)",
    matrix: [214, 207, 193],
    magmaHot: [255, 172, 86],
    magmaDeep: [204, 86, 30],
  },
};

const CVH = 330;
const DUR_FAST = 2300; // 지표 냉각(ms)
const DUR_SLOW = 4800; // 지하 냉각(ms)
const RING_COLD: readonly number[] = [110, 168, 255];
const TAU = Math.PI * 2;

const mix = (a: readonly number[], b: readonly number[], t: number, al = 1): string =>
  `rgba(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
    a[2] + (b[2] - a[2]) * t,
  )},${al})`;
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

export const coolingLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CoolingStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "volc" } }, el("b", { text: "화산암 만들기" }), el("span", { text: "지표에서 식혀요" })),
    el("div", { class: "pn-badge geo", dataset: { g: "plut" } }, el("b", { text: "심성암 만들기" }), el("span", { text: "지하에서 식혀요" })),
    el("div", { class: "pn-badge geo", dataset: { g: "all4" } }, el("b", { text: "네 칸 완성" }), el("span", { text: "모든 조합!" })),
  );

  // ---- 무대 ----
  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px`,
    attrs: { role: "img", "aria-label": "지형 단면과 마그마 관찰 렌즈. 아래 버튼으로 냉각 위치와 성분을 골라요." },
  });
  const locPill = el("span", { text: "지표 · 빨리 식음" });
  const locDot = el("span", { class: "pdot", style: "background:#FF8A3C" });
  const compPill = el("span", { text: "어두운 광물" });
  const compDot = el("span", { class: "pdot", style: "background:#4E5B54" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "어디서, 어떤 마그마를 식힐지 골라 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, locDot, locPill),
      el("div", { class: "pill" }, compDot, compPill),
    ),
    toastEl,
    capEl,
  );

  // ---- 컨트롤 ----
  const surfBtn = el("button", { class: "on", text: "지표로 분출 (빨리)", attrs: { type: "button", "aria-pressed": "true" } });
  const deepBtn = el("button", { text: "지하 깊은 곳 (천천히)", attrs: { type: "button", "aria-pressed": "false" } });
  const locSeg = el("div", { class: "seg", style: "margin-top:12px", attrs: { "aria-label": "어디서 식힐까" } }, surfBtn, deepBtn);
  const darkBtn = el("button", { class: "on", text: "어두운 광물 많음", attrs: { type: "button", "aria-pressed": "true" } });
  const lightBtn = el("button", { text: "밝은 광물 많음", attrs: { type: "button", "aria-pressed": "false" } });
  const compSeg = el("div", { class: "seg", style: "margin-top:8px", attrs: { "aria-label": "마그마의 성분" } }, darkBtn, lightBtn);
  const coolLabel = el("span", { text: "식히기" });
  const coolBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, coolLabel);

  // ---- 2×2 기록표 ----
  const grid = "grid-template-columns:1.15fr 1fr 1fr";
  const tbl = el("div", { class: "tbl", style: "margin-top:14px" });
  const thead = el("div", { class: "trow thead", style: grid });
  for (const h of ["구분", "어두운 색", "밝은 색"]) thead.appendChild(el("div", { text: h }));
  tbl.appendChild(thead);
  const cellEls = new Map<string, HTMLElement>();
  const addRow = (label: string, sub: string, loc: Loc, dot: string): void => {
    const lab = el("div", { class: "tstate" });
    lab.appendChild(el("i", { style: `background:${dot}` }));
    lab.appendChild(
      el("span", { html: `${label}<br><small style="font-size:10.5px;font-weight:700;color:var(--ter)">${sub}</small>` }),
    );
    const c1 = el("div", { class: "tv", text: "—" });
    const c2 = el("div", { class: "tv", text: "—" });
    cellEls.set(`${loc}|dark`, c1);
    cellEls.set(`${loc}|light`, c2);
    tbl.appendChild(el("div", { class: "trow", style: grid }, lab, c1, c2));
  };
  addRow("화산암", "결정 작음 · 지표", "surface", "#FF8A3C");
  addRow("심성암", "결정 큼 · 지하", "deep", "#8C5A28");

  const helper = el("div", {
    class: "helper",
    html: "같은 마그마라도 <b>어디서 식느냐</b>에 따라 다른 암석이 돼요. 위치와 성분을 고르고 <b>식히기</b>를 눌러 결정이 자라는 걸 지켜보세요!",
  });
  host.append(goalChips, helper, stage, locSeg, compSeg, coolBtn, tbl); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let loc: Loc = "surface";
  let comp: Comp = "dark";
  let phase: Phase = "liquid";
  let coolP = 0;
  let running = false;
  let crystals: Crystal[] = [];
  let curRock: RockDef | null = null;
  let curPal = PAL[comp];
  let dropCur = 1; // 마그마 방울 위치(0=마그마 방, 1=지표)
  const made = new Set<string>();
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
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
        "<b>식는 속도</b>가 결정 크기를, <b>광물 조성</b>이 색을 정해요 — 두 기준이면 화성암 4종이 딱 갈라져요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "volc" && !goals.has("plut")) {
      helper.innerHTML = "이번엔 <b>지하 깊은 곳</b>을 골라 천천히 식혀 봐요 — 결정 크기가 어떻게 달라질까요?";
    } else if (id === "plut" && !goals.has("volc")) {
      helper.innerHTML = "이번엔 <b>지표로 분출</b>을 골라 봐요 — 순식간에 식으면 결정이 자랄 시간이 있을까요?";
    } else if ((id === "volc" || id === "plut") && goals.has("volc") && goals.has("plut")) {
      helper.innerHTML = "이제 <b>성분</b>을 바꿔 남은 칸을 채워 봐요 — 어두우면 현무암·반려암, 밝으면 유문암·화강암!";
    }
  }

  function updateA11y(): void {
    const locW = loc === "surface" ? "지표" : "지하 깊은 곳";
    const compW = comp === "dark" ? "어두운 광물이 많은" : "밝은 광물이 많은";
    const st = phase === "done" && curRock ? `${curRock.name} 완성` : phase === "cooling" ? "식는 중" : "식히기 전";
    canvas.setAttribute("aria-label", `지형 단면과 관찰 렌즈. ${locW}에서 ${compW} 마그마 — ${st}.`);
  }

  // ---- 세그 동작 ----
  function freshMagma(): void {
    phase = "liquid";
    coolP = 0;
    crystals = [];
    curRock = null;
    coolLabel.textContent = "식히기";
  }
  function setLoc(v: Loc): void {
    if (running) {
      toast("굳는 중이에요 — 잠깐만요");
      return;
    }
    if (loc === v) return;
    loc = v;
    surfBtn.classList.toggle("on", v === "surface");
    deepBtn.classList.toggle("on", v === "deep");
    surfBtn.setAttribute("aria-pressed", String(v === "surface"));
    deepBtn.setAttribute("aria-pressed", String(v === "deep"));
    locPill.textContent = v === "surface" ? "지표 · 빨리 식음" : "지하 · 천천히 식음";
    locDot.style.background = v === "surface" ? "#FF8A3C" : "#C98A4B";
    freshMagma();
    haptic(HAPTIC.tap);
    hideCap();
    toast(v === "surface" ? "지표로 이동 — 용암이 되어 빨리 식어요" : "지하 마그마 방으로 — 아주 천천히 식어요");
    updateA11y();
  }
  function setComp(v: Comp): void {
    if (running) {
      toast("굳는 중이에요 — 잠깐만요");
      return;
    }
    if (comp === v) return;
    comp = v;
    curPal = PAL[v];
    darkBtn.classList.toggle("on", v === "dark");
    lightBtn.classList.toggle("on", v === "light");
    darkBtn.setAttribute("aria-pressed", String(v === "dark"));
    lightBtn.setAttribute("aria-pressed", String(v === "light"));
    compPill.textContent = v === "dark" ? "어두운 광물" : "밝은 광물";
    compDot.style.background = v === "dark" ? "#4E5B54" : "#EAE2D2";
    freshMagma();
    haptic(HAPTIC.tap);
    hideCap();
    toast(v === "dark" ? "어두운 광물이 많은 마그마예요" : "밝은 광물이 많은 마그마예요");
    updateA11y();
  }
  surfBtn.addEventListener("click", () => setLoc("surface"));
  deepBtn.addEventListener("click", () => setLoc("deep"));
  darkBtn.addEventListener("click", () => setComp("dark"));
  lightBtn.addEventListener("click", () => setComp("light"));

  // ---- 결정 생성 ----
  function genCrystals(): Crystal[] {
    const list: Crystal[] = [];
    const pal = PAL[comp];
    const pick = (): string => (Math.random() < 0.86 ? pal.crystals[Math.floor(Math.random() * 3)] : pal.crystals[3]);
    const put = (r: number, start: number, micro: boolean): void => {
      const rr = Math.sqrt(Math.random());
      const ang = Math.random() * TAU;
      const sides = 5 + Math.floor(Math.random() * 3);
      const verts: number[] = [];
      for (let i = 0; i < sides; i++) verts.push(0.72 + Math.random() * 0.5);
      list.push({ ux: Math.cos(ang) * rr, uy: Math.sin(ang) * rr, r, rot: Math.random() * TAU, verts, color: pick(), start, micro });
    };
    if (loc === "surface") {
      for (let i = 0; i < 112; i++) put(1.4 + Math.random() * 2, 0.08 + Math.random() * 0.75, false);
      for (let i = 0; i < 150; i++) put(0.6 + Math.random() * 0.7, 0.08 + Math.random() * 0.8, true);
    } else {
      for (let i = 0; i < 13; i++) put(12 + Math.random() * 8, 0.05 + Math.random() * 0.32, false);
      for (let i = 0; i < 24; i++) put(5 + Math.random() * 4, 0.12 + Math.random() * 0.35, false);
    }
    return list;
  }
  function crystalScale(c: Crystal): number {
    if (coolP <= c.start) return 0;
    if (loc === "surface") return easeOut(clamp((coolP - c.start) / 0.09, 0, 1)); // 우수수 팝
    return easeOut(clamp((coolP - c.start) / Math.max(0.2, 0.98 - c.start), 0, 1)); // 천천히 성장
  }

  // ---- 식히기 ----
  coolBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    phase = "cooling";
    coolP = 0;
    crystals = genCrystals();
    curRock = ROCKS[`${loc}|${comp}`];
    coolBtn.classList.remove("pulse");
    (coolBtn as HTMLButtonElement).disabled = true;
    coolBtn.style.opacity = ".6";
    coolLabel.textContent = "식는 중…";
    haptic(HAPTIC.tap);
    hideCap();
    toast(loc === "surface" ? "순식간에 식어요 — 결정이 자랄 틈이 없어요!" : "천천히 식어요 — 결정이 자랄 시간이 넉넉해요");
    updateA11y();
  });

  function fillCell(key: string, rock: RockDef): void {
    cellEls.get(key)!.innerHTML =
      `<span style="display:inline-flex;align-items:center;gap:6px;animation:pnPop .45s var(--spring-bounce)">` +
      `<i style="flex:none;width:14px;height:14px;border-radius:5px;background:${rock.chip};box-shadow:inset 0 0 0 1px rgba(20,30,50,.2)"></i>` +
      `<b style="color:var(--ink);font-size:13px">${rock.name}</b></span>`;
  }

  function onCooled(): void {
    running = false;
    phase = "done";
    (coolBtn as HTMLButtonElement).disabled = false;
    coolBtn.style.opacity = "";
    coolLabel.textContent = "다시 식히기";
    const key = `${loc}|${comp}`;
    const rock = ROCKS[key];
    const isNew = !made.has(key);
    made.add(key);
    fillCell(key, rock);
    haptic(HAPTIC.tap);
    toast(isNew ? `${rock.name} 완성 — 표에 채웠어요!` : `또 ${rock.name} — 이미 채운 칸이에요`);
    if (loc === "surface") collect("volc", "결정이 작아요!", `${rock.name} — 빨리 식으면 결정이 작아요!`);
    else collect("plut", "결정이 커요!", `${rock.name} — 천천히 식으면 결정이 커요!`);
    if (made.size === 4) collect("all4", "네 칸 모두!", "2×2 완성 — 화성암 4종을 다 만들었어요!");
    updateA11y();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;

    // 진행
    if (running) {
      coolP += (dt * 16.7) / (loc === "surface" ? DUR_FAST : DUR_SLOW);
      if (coolP >= 1) {
        coolP = 1;
        onCooled();
      }
    }
    dropCur += ((loc === "surface" ? 1 : 0) - dropCur) * Math.min(1, 0.08 * dt);

    // ---- 좌: 지형 단면 패널 ----
    const pl = 12;
    const pr = Math.max(124, Math.min(W * 0.37, 150));
    const pt = 14;
    const pb = CVH - 14;
    const pcx = (pl + pr) / 2;
    const groundY = pt + 58;
    const crX = pcx;
    const crY = pt + 30;
    const chX = pcx;
    const chY = pb - 46;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pl, pt, pr - pl, pb - pt, 12);
    ctx.clip();
    // 밤하늘
    const sky = ctx.createLinearGradient(0, pt, 0, groundY);
    sky.addColorStop(0, "#182742");
    sky.addColorStop(1, "#0F1B33");
    ctx.fillStyle = sky;
    ctx.fillRect(pl, pt, pr - pl, groundY - pt);
    ctx.fillStyle = "rgba(226,240,255,.7)";
    for (const [sxr, syr] of [
      [0.16, 0.28],
      [0.82, 0.2],
      [0.68, 0.44],
    ] as const) {
      const tw = 0.5 + 0.5 * Math.sin(tMs / 700 + sxr * 20);
      ctx.globalAlpha = 0.25 + 0.5 * tw;
      ctx.fillRect(pl + (pr - pl) * sxr, pt + (groundY - pt) * syr, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
    // 지하(지층 그라데이션)
    const ug = ctx.createLinearGradient(0, groundY, 0, pb);
    ug.addColorStop(0, "#4A3A2A");
    ug.addColorStop(0.5, "#33271A");
    ug.addColorStop(1, "#1E1710");
    ctx.fillStyle = ug;
    ctx.fillRect(pl, groundY, pr - pl, pb - groundY);
    ctx.strokeStyle = "rgba(240,224,196,.06)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const ly = groundY + ((pb - groundY) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(pl, ly + Math.sin(i * 3.7) * 3);
      ctx.quadraticCurveTo(pcx, ly + Math.sin(i * 1.9) * 5, pr, ly + Math.sin(i * 2.6) * 3);
      ctx.stroke();
    }
    // 화산(지표 위 봉우리)
    const vg = ctx.createLinearGradient(0, crY, 0, groundY);
    vg.addColorStop(0, "#4E4030");
    vg.addColorStop(1, "#2C2318");
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.moveTo(pl + 4, groundY);
    ctx.lineTo(crX - 9, crY);
    ctx.lineTo(crX + 9, crY);
    ctx.lineTo(pr - 4, groundY);
    ctx.closePath();
    ctx.fill();
    // 좌상단 키라이트 능선
    ctx.strokeStyle = "rgba(255,236,204,.22)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(pl + 10, groundY - 2);
    ctx.lineTo(crX - 9, crY + 1);
    ctx.stroke();
    // 지표선
    ctx.strokeStyle = "rgba(226,240,255,.28)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(pl, groundY);
    ctx.lineTo(pr, groundY);
    ctx.stroke();
    // 마그마 통로 + 마그마 방
    const hot = curPal.magmaHot;
    const deep = curPal.magmaDeep;
    ctx.strokeStyle = mix(deep, hot, 0.35, 0.5);
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(chX, chY - 12);
    ctx.quadraticCurveTo(chX + 5, (chY + crY) / 2, crX, crY + 8);
    ctx.stroke();
    softGlow(ctx, chX, chY, 40, `${hot[0]},${hot[1]},${hot[2]}`, 0.16 + 0.05 * Math.sin(tMs / 500));
    const cg = ctx.createRadialGradient(chX - 6, chY - 6, 2, chX, chY, 30);
    cg.addColorStop(0, mix(hot, hot, 0, 0.95));
    cg.addColorStop(0.6, mix(hot, deep, 0.55, 0.9));
    cg.addColorStop(1, mix(deep, deep, 0, 0.6));
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(chX, chY, 26, 19, 0, 0, TAU);
    ctx.fill();
    // 분출 용암 웅덩이(지표 모드)
    if (dropCur > 0.55) {
      const a = (dropCur - 0.55) / 0.45;
      ctx.fillStyle = mix(hot, deep, 0.25, 0.85 * a);
      ctx.beginPath();
      ctx.ellipse(crX, crY + 3, 12 * a + 4, 3.4, 0, 0, TAU);
      ctx.fill();
    }
    // 마그마 방울(현재 위치 표시) — 통로를 따라 이동
    const qt = dropCur;
    const dqx = (1 - qt) * (1 - qt) * chX + 2 * (1 - qt) * qt * (chX + 5) + qt * qt * crX;
    const dqy = (1 - qt) * (1 - qt) * (chY - 12) + 2 * (1 - qt) * qt * ((chY + crY) / 2) + qt * qt * (crY + 4);
    softGlow(ctx, dqx, dqy, 18, `${hot[0]},${hot[1]},${hot[2]}`, 0.3);
    ctx.fillStyle = mix(hot, deep, 0.15);
    ctx.beginPath();
    ctx.arc(dqx, dqy, 6.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,236,204,.85)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 라벨
    ctx.font = "600 9.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(196,212,232,.6)";
    ctx.fillText("지표", pr - 5, groundY - 5);
    ctx.textAlign = "center";
    ctx.fillText("마그마 방", chX, chY + 33);
    ctx.restore();
    // 패널 테두리
    ctx.strokeStyle = "rgba(120,140,190,.24)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(pl, pt, pr - pl, pb - pt, 12);
    ctx.stroke();

    // ---- 우: 관찰 렌즈 ----
    const lx = (pr + W - 8) / 2;
    const ly = 138;
    const lr = Math.min((W - 8 - pr) / 2 - 16, 92);
    // 리더선(방울 → 렌즈)
    ctx.strokeStyle = "rgba(196,212,232,.25)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(dqx + 10, dqy);
    ctx.lineTo(lx - lr - 5, ly);
    ctx.stroke();
    ctx.setLineDash([]);

    const glowA = phase === "liquid" ? 1 : phase === "done" ? 0 : Math.pow(1 - coolP, 1.15);
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.clip();
    // 바탕(식을수록 마그마 → 암석 기질)
    ctx.fillStyle = mix(curPal.matrix, curPal.matrix, 0);
    ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    if (glowA > 0.01) {
      const mg = ctx.createRadialGradient(lx - lr * 0.3, ly - lr * 0.3, 4, lx, ly, lr * 1.35);
      mg.addColorStop(0, mix(curPal.magmaHot, curPal.magmaHot, 0, 0.98 * glowA));
      mg.addColorStop(0.62, mix(curPal.magmaHot, curPal.magmaDeep, 0.6, 0.95 * glowA));
      mg.addColorStop(1, mix(curPal.magmaDeep, curPal.magmaDeep, 0, 0.95 * glowA));
      ctx.fillStyle = mg;
      ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
      // 대류 소용돌이
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(255,224,170,${0.13 * glowA})`;
        ctx.beginPath();
        ctx.arc(lx, ly, lr * (0.32 + 0.19 * k), tMs / 1400 + k * 2.1, tMs / 1400 + k * 2.1 + 1.7);
        ctx.stroke();
      }
      // 반짝이는 점(끓는 표면)
      for (let k = 0; k < 5; k++) {
        const twk = 0.5 + 0.5 * Math.sin(tMs / 260 + k * 2.3);
        ctx.fillStyle = `rgba(255,240,200,${0.5 * glowA * twk})`;
        ctx.fillRect(lx + Math.sin(k * 37.7) * lr * 0.55, ly + Math.sin(k * 61.3) * lr * 0.5, 1.8, 1.8);
      }
    }
    // 결정
    for (const c of crystals) {
      const cs = crystalScale(c);
      if (cs <= 0.02) continue;
      const cxp = lx + c.ux * (lr - 8);
      const cyp = ly + c.uy * (lr - 8);
      ctx.save();
      ctx.translate(cxp, cyp);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.beginPath();
      const n = c.verts.length;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * TAU;
        const rad = c.r * c.verts[i] * cs;
        if (i === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fill();
      if (!c.micro && c.r > 4) {
        ctx.strokeStyle = curPal.outline;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (c.r > 9) {
        // 큰 결정 벽개면 하이라이트
        ctx.strokeStyle = "rgba(255,255,255,.22)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-c.r * 0.4 * cs, -c.r * 0.28 * cs);
        ctx.lineTo(c.r * 0.34 * cs, -c.r * 0.05 * cs);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 안쪽 비네트 + 유리 글레어
    const vgn = ctx.createRadialGradient(lx, ly, lr * 0.62, lx, ly, lr);
    vgn.addColorStop(0, "rgba(3,9,20,0)");
    vgn.addColorStop(1, "rgba(3,9,20,.28)");
    ctx.fillStyle = vgn;
    ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lx, ly, lr - 6, -2.3, -1.5);
    ctx.stroke();
    // 림 + 진행 링
    ctx.strokeStyle = "rgba(148,168,196,.35)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.stroke();
    if (phase === "cooling") {
      ctx.strokeStyle = mix(curPal.magmaHot, RING_COLD, coolP);
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(lx, ly, lr + 3, -Math.PI / 2, -Math.PI / 2 + coolP * TAU);
      ctx.stroke();
    }
    // 렌즈 아래 상태 텍스트
    ctx.textAlign = "center";
    if (phase === "done" && curRock) {
      ctx.font = "800 15px Pretendard, sans-serif";
      ctx.fillStyle = "#F4F8FD";
      ctx.fillText(curRock.name, lx, ly + lr + 24);
      ctx.font = "600 10.5px Pretendard, sans-serif";
      ctx.fillStyle = "#8CA2C0";
      ctx.fillText(curRock.kind, lx, ly + lr + 39);
    } else if (phase === "cooling") {
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.fillStyle = "rgba(196,212,232,.7)";
      ctx.fillText(loc === "surface" ? "빠르게 식는 중…" : "천천히 식는 중…", lx, ly + lr + 24);
    } else {
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.fillStyle = "rgba(196,212,232,.55)";
      ctx.fillText("마그마 관찰 렌즈", lx, ly + lr + 24);
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
  updateA11y();

  api.setCTA("화성암 네 종을 모두 만들어 보세요!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
