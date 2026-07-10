// densityLab — 밀도 측정 랩(중2 I 물질의 특성). 교과서 탐구의 조작판.
//   · 크기가 다른 철·알루미늄 조각을 전자저울(질량)과 눈금실린더(물이 늘어난 만큼 = 부피)로 측정
//   · 시료를 드래그해 저울에 올리면 digits가 카운트업, 실린더에 넣으면 물이 차오르며 Δ부피 표시
//   · 측정이 끝난 시료는 무대 아래 기록표에 질량|부피|질량÷부피 행이 채워진다
// 발견: 크기가 달라도 질량÷부피는 물질마다 일정 — 철 7.87, 알루미늄 2.70 g/mL(밀도).
// 목표: ① 철 큰·작은 둘 다 측정 ② 철 둘의 질량÷부피가 똑같이 7.87 ③ 알루미늄으로 2.70 확인.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow, glassVessel, liquidFill, scaleBody, softGlow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DensityLabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type SampleId = "feL" | "feS" | "alL" | "alS";
type Mat = "fe" | "al";

interface Sample {
  id: SampleId;
  mat: Mat;
  name: string;
  mass: number; // g (전자저울 0.01 g)
  vol: number; // mL
  w: number; // 블록 폭(px)
  h: number; // 블록 높이(px)
  slot: number; // 트레이 슬롯 index
  x: number;
  y: number;
  vy: number;
  state: "tray" | "scale" | "cyl";
  massDone: boolean;
  volDone: boolean;
  splashed: boolean;
  rested: boolean;
}

// 실제 밀도: 철 7.87, 알루미늄 2.70 g/mL — 표시값 나눗셈이 정확히 떨어지게 질량은 0.01 g 단위.
const SAMPLES: Omit<Sample, "x" | "y" | "vy" | "state" | "massDone" | "volDone" | "splashed" | "rested">[] = [
  { id: "feL", mat: "fe", name: "철 큰 조각", mass: 78.7, vol: 10, w: 38, h: 27, slot: 0 },
  { id: "feS", mat: "fe", name: "철 작은 조각", mass: 39.35, vol: 5, w: 29, h: 21, slot: 1 },
  { id: "alL", mat: "al", name: "알루미늄 큰 조각", mass: 27, vol: 10, w: 38, h: 27, slot: 2 },
  { id: "alS", mat: "al", name: "알루미늄 작은 조각", mass: 13.5, vol: 5, w: 29, h: 21, slot: 3 },
];

const CVH = 420; // 캔버스 전체 높이
const WATER0 = 40; // 실린더 시작 눈금(mL)
const ML2PX = 1.7; // 1 mL당 px
const CYL_TOP = 44;
const CYL_BOT = 250; // 유리 바닥선
const INNER_BOT = 246; // 물이 닿는 안쪽 바닥
const TRAY_Y = 352; // 트레이 슬롯 중심
const PLATE_Y = 204; // 저울 접시 윗면
const K_CYL = 0.78; // 실린더 안 블록 축소 비율(유리 너머 느낌 + 잠김 보장)

const MAT_CHIP: Record<Mat, { bg: string; fg: string }> = {
  fe: { bg: "#EEF4FF", fg: "#2B62C4" },
  al: { bg: "#E9F9F1", fg: "#0B9B62" },
};

export const densityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DensityLabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "시료 옮기기: 좌우 화살표로 시료를 고르고, 엔터로 저울과 눈금실린더에 차례로 올려요.",
    },
  });
  const scalePill = el("span", { text: "저울 0.00 g" });
  const cylPill = el("span", { text: `실린더 ${WATER0.toFixed(1)} mL` });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "시료를 저울로, 그다음 눈금실린더로 끌어 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#C9D6E6" }), scalePill),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5C98EB" }), cylPill),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "iron2" } }, el("b", { text: "철 두 조각" }), el("span", { text: "큰·작은 다 재기" })),
    el("div", { class: "pn-badge chem", dataset: { g: "same" } }, el("b", { text: "나누면 같다" }), el("span", { text: "질량÷부피는?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "diff" } }, el("b", { text: "다른 물질" }), el("span", { text: "알루미늄은?" })),
  );

  // ---- 기록 미니표: 시료 | 질량(g) | 부피(mL) | 질량÷부피 ----
  const grid = "grid-template-columns:1.3fr .95fr .8fr .95fr";
  const tbl = el("div", { class: "tbl", style: "margin-top:14px" });
  const thead = el("div", { class: "trow thead", style: grid });
  for (const h of ["시료", "질량(g)", "부피(mL)", "질량÷부피"]) thead.appendChild(el("div", { text: h }));
  tbl.appendChild(thead);
  const cells = new Map<SampleId, { m: HTMLElement; v: HTMLElement; r: HTMLElement }>();
  for (const sp of SAMPLES) {
    const nameCell = el("div", { class: "tstate" });
    nameCell.appendChild(el("i", { style: `background:${sp.mat === "fe" ? "#5E7290" : "#9FB3C8"}` }));
    nameCell.appendChild(el("span", { text: sp.name }));
    const m = el("div", { class: "tv", style: "font-variant-numeric:tabular-nums", text: "—" });
    const v = el("div", { class: "tv", style: "font-variant-numeric:tabular-nums", text: "—" });
    const r = el("div", { class: "tv", style: "font-variant-numeric:tabular-nums", text: "—" });
    cells.set(sp.id, { m, v, r });
    tbl.appendChild(el("div", { class: "trow", style: grid }, nameCell, m, v, r));
  }

  const helper = el("div", {
    class: "helper",
    html: "같은 물질이라도 조각 크기는 제각각이에요. <b>질량</b>(전자저울)과 <b>부피</b>(물이 늘어난 만큼)를 재서 <b>질량÷부피</b>를 비교해 봐요.",
  });
  host.append(goalChips, helper, stage, tbl); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  const samples: Sample[] = SAMPLES.map((sp) => ({
    ...sp,
    x: 0,
    y: 0,
    vy: 0,
    state: "tray",
    massDone: false,
    volDone: false,
    splashed: false,
    rested: false,
  }));
  let W = 340;
  let placed = false; // 첫 프레임에 슬롯 좌표로 초기화
  let scaleId: SampleId | null = null;
  let countT = 1; // 저울 digits 카운트업 진행(0..1)
  let counted = false; // 현재 저울 시료의 카운트 완료 처리 여부
  let water = WATER0;
  let waterTarget = WATER0;
  let wave = 0;
  const cylStack: SampleId[] = [];
  let drag: { id: SampleId; dx: number; dy: number; moved: boolean; sx: number; sy: number } | null = null;
  let pointer = { x: 0, y: 0 };
  let selected: SampleId | null = null;
  let deltaFx: { v: number; t: number } | null = null;
  const goals = new Set<string>();
  let finished = false;
  let firstMassHinted = false;
  let firstRowHinted = false;
  let toastTimer = 0;
  let sameTimer = 0;
  let capHidden = false;

  const byId = (id: SampleId): Sample => samples.find((x) => x.id === id)!;
  const scaleX = (): number => W * 0.26;
  const cylX = (): number => W * 0.74;
  const slotX = (i: number): number => W * (0.14 + 0.24 * i);
  const mlY = (ml: number): number => INNER_BOT - ml * ML2PX;

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
        "크기가 달라도 질량÷부피는 그대로 — 이 값이 <b>밀도</b>, 물질의 지문이에요. 철 <b>7.87</b>, 알루미늄 <b>2.70 g/mL</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  const ratioChip = (sp: Sample): string => {
    const c = MAT_CHIP[sp.mat];
    return `<span style="display:inline-block;padding:2px 9px;border-radius:99px;font-weight:800;font-size:12.5px;background:${c.bg};color:${c.fg};animation:pnPop .45s var(--spring-bounce)">${(sp.mass / sp.vol).toFixed(2)}</span>`;
  };

  function fillMass(sp: Sample): void {
    cells.get(sp.id)!.m.innerHTML = `<b style="color:var(--ink)">${sp.mass.toFixed(2)}</b>`;
  }
  function fillVol(sp: Sample): void {
    cells.get(sp.id)!.v.innerHTML = `<b style="color:var(--ink)">${sp.vol.toFixed(1)}</b>`;
  }
  function fillRatio(sp: Sample): void {
    cells.get(sp.id)!.r.innerHTML = ratioChip(sp);
  }

  function onFullyMeasured(sp: Sample): void {
    fillRatio(sp);
    if (!firstRowHinted && !finished) {
      firstRowHinted = true;
      helper.innerHTML = `기록표에 한 줄! <b>${sp.mass.toFixed(2)} ÷ ${sp.vol.toFixed(1)} = ${(sp.mass / sp.vol).toFixed(2)}</b>. 다른 조각들도 재서 값을 비교해 봐요.`;
    }
    if (sp.mat === "fe") {
      const feDone = samples.filter((x) => x.mat === "fe" && x.volDone).length;
      if (feDone === 2) {
        collect("iron2", "질량·부피 달라!", "철 두 조각 측정 완료 — 질량도 부피도 서로 달라요");
        window.clearTimeout(sameTimer);
        sameTimer = window.setTimeout(() => {
          // 두 철 칩을 다시 반짝여 "같은 값"을 눈으로 못박는다
          for (const x of samples) if (x.mat === "fe" && x.volDone) fillRatio(x);
          collect("same", "둘 다 7.87!", "나누면 둘 다 7.87 — 크기와 상관없어요!");
        }, 1200);
      }
    } else {
      collect("diff", "2.70 — 달라요!", "알루미늄은 2.70 — 물질이 다르면 값도 달라요!");
    }
  }

  // ---- 배치 명령 ----
  function placeToScale(id: SampleId): void {
    const sp = byId(id);
    if (sp.state === "cyl") return;
    if (scaleId && scaleId !== id) {
      const prev = byId(scaleId);
      if (prev.state === "scale") prev.state = "tray";
    }
    scaleId = id;
    sp.state = "scale";
    counted = sp.massDone;
    countT = sp.massDone ? 1 : 0;
    selected = null;
    haptic(HAPTIC.tap);
    hideCap();
  }

  function placeToCyl(id: SampleId, atX: number, atY: number): boolean {
    const sp = byId(id);
    if (sp.state === "cyl") return false;
    if (!sp.massDone) {
      toast("먼저 저울에서 질량부터 재요");
      return false;
    }
    if (scaleId === id) scaleId = null;
    sp.state = "cyl";
    sp.x = clamp(atX, cylX() - 12, cylX() + 12);
    sp.y = Math.min(atY, CYL_TOP - 6);
    sp.vy = 0;
    sp.splashed = false;
    sp.rested = false;
    cylStack.push(id);
    selected = null;
    haptic(HAPTIC.tap);
    hideCap();
    return true;
  }

  // 실린더 안 정착 높이(아래부터 차곡차곡)
  function settleY(id: SampleId): number {
    let bottom = INNER_BOT - 2;
    for (const sid of cylStack) {
      const sp = byId(sid);
      const h = sp.h * K_CYL;
      if (sid === id) return bottom - h / 2;
      bottom -= h + 1.5;
    }
    return bottom;
  }

  // ---- 히트 테스트 · 존 ----
  function hitSample(x: number, y: number): Sample | null {
    for (const sp of [...samples].reverse()) {
      if (sp.state === "cyl") continue;
      const hw = Math.max(sp.w / 2 + 10, 24);
      const hh = Math.max(sp.h / 2 + 10, 24);
      if (Math.abs(x - sp.x) < hw && Math.abs(y - sp.y) < hh) return sp;
    }
    return null;
  }
  const inScaleZone = (x: number, y: number): boolean => Math.abs(x - scaleX()) < 68 && y > 160 && y < 272;
  const inCylZone = (x: number, y: number): boolean => Math.abs(x - cylX()) < 46 && y > 34 && y < 272;

  function dropAt(id: SampleId, x: number, y: number): void {
    const sp = byId(id);
    if (inScaleZone(x, y)) {
      placeToScale(id);
      return;
    }
    if (inCylZone(x, y)) {
      if (placeToCyl(id, x, y)) return;
      sp.state = "tray"; // 질량 미측정 → 트레이로 반납
      if (scaleId === id) scaleId = null;
      return;
    }
    if (y > 300) {
      // 트레이 영역에 내려놓음
      if (scaleId === id) scaleId = null;
      sp.state = "tray";
    }
    // 그 외: 상태 유지 — 루프가 제자리로 되돌린다
  }

  // ---- 포인터 ----
  const rel = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: PointerEvent): void => {
    const p = rel(e);
    pointer = p;
    const sp = hitSample(p.x, p.y);
    if (sp) {
      drag = { id: sp.id, dx: p.x - sp.x, dy: p.y - sp.y, moved: false, sx: p.x, sy: p.y };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
      haptic(HAPTIC.tap);
      return;
    }
    if (selected) {
      // 탭 폴백: 시료 선택 후 저울/실린더 탭
      if (inScaleZone(p.x, p.y)) {
        placeToScale(selected);
      } else if (inCylZone(p.x, p.y)) {
        placeToCyl(selected, cylX(), CYL_TOP - 10); // 실패(질량 전) 시 선택 유지 — 저울부터 탭하도록
      } else selected = null;
    }
  };
  const onMove = (e: PointerEvent): void => {
    const p = rel(e);
    pointer = p;
    if (!drag) return;
    const sp = byId(drag.id);
    sp.x = clamp(p.x - drag.dx, 18, W - 18);
    sp.y = clamp(p.y - drag.dy, 18, CVH - 18);
    if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 7) drag.moved = true;
  };
  const onUp = (): void => {
    canvas.classList.remove("dragging");
    if (!drag) return;
    const sp = byId(drag.id);
    if (!drag.moved) {
      selected = selected === sp.id ? null : sp.id;
      if (selected) toast(`${sp.name} 선택 — 저울이나 실린더를 탭해요`);
      haptic(HAPTIC.select);
    } else {
      dropAt(drag.id, sp.x, sp.y);
    }
    drag = null;
  };
  const onKey = (e: KeyboardEvent): void => {
    const pickable = samples.filter((x) => x.state !== "cyl");
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      if (!pickable.length) return;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const idx = selected ? pickable.findIndex((x) => x.id === selected) : -1;
      const nxt = pickable[(idx + dir + pickable.length) % pickable.length];
      selected = nxt.id;
      toast(`${nxt.name} 선택`);
      haptic(HAPTIC.select);
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === " ") {
      if (!selected) return;
      const sp = byId(selected);
      if (sp.state === "tray") placeToScale(sp.id);
      else if (sp.state === "scale") {
        if (!sp.massDone) toast("질량을 재는 중이에요 — 잠깐만요");
        else placeToCyl(sp.id, cylX(), CYL_TOP - 10);
      }
      e.preventDefault();
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 그리기 헬퍼 ----
  function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // 금속 블록 — 파운드리 문법: 근-동조 그라데이션 + 좌상단 키라이트 + 최암색 외곽선
  function drawBlock(ctx: CanvasRenderingContext2D, sp: Sample, k = 1): void {
    const w = sp.w * k;
    const h = sp.h * k;
    const x = sp.x - w / 2;
    const y = sp.y - h / 2;
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    if (sp.mat === "fe") {
      g.addColorStop(0, "#5F7188");
      g.addColorStop(0.32, "#93A7BE");
      g.addColorStop(0.62, "#4E6076");
      g.addColorStop(1, "#2E3A49");
    } else {
      g.addColorStop(0, "#C6D3E1");
      g.addColorStop(0.3, "#F2F7FC");
      g.addColorStop(0.62, "#AEBDCD");
      g.addColorStop(1, "#8695A8");
    }
    ctx.fillStyle = g;
    rr(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = sp.mat === "fe" ? "#1C2530" : "#5A6878";
    ctx.lineWidth = 1.5;
    rr(ctx, x, y, w, h, 5);
    ctx.stroke();
    // 좌상단 키라이트 스트릭
    ctx.strokeStyle = `rgba(255,255,255,${sp.mat === "fe" ? 0.38 : 0.65})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 3.2);
    ctx.lineTo(x + w * 0.55, y + 3.2);
    ctx.stroke();
    // 브러시드 라인(재질 결)
    ctx.strokeStyle = "rgba(10,18,28,.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h * 0.58);
    ctx.lineTo(x + w - 4, y + h * 0.58);
    ctx.stroke();
  }

  function drawSelectRing(ctx: CanvasRenderingContext2D, sp: Sample, tMs: number): void {
    const pad = 9 + Math.sin(tMs / 260) * 1.4;
    ctx.strokeStyle = "rgba(255,214,138,.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    rr(ctx, sp.x - sp.w / 2 - pad, sp.y - sp.h / 2 - pad, sp.w + pad * 2, sp.h + pad * 2, 9);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---- 프레임 ----
  const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
  let shownScale = "";
  let shownCyl = "";

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const sx = scaleX();
    const ccx = cylX();

    if (!placed) {
      placed = true;
      for (const sp of samples) {
        sp.x = slotX(sp.slot);
        sp.y = TRAY_Y - sp.h / 2 - 2;
      }
    }

    // 물 수렴 + 출렁
    const prevWater = water;
    water += (waterTarget - water) * Math.min(1, 0.07 * dt);
    if (Math.abs(water - prevWater) > 0.02) wave = Math.min(1, wave + 0.05 * dt);
    wave *= Math.pow(0.968, dt);

    // 시료 이동(트레이·저울은 목표로 수렴, 실린더는 낙하 물리)
    for (const sp of samples) {
      if (drag && drag.id === sp.id) continue;
      if (sp.state === "cyl") {
        const tY = settleY(sp.id);
        const wY = mlY(water);
        sp.vy += 0.55 * dt;
        if (sp.y > wY) sp.vy *= Math.pow(0.86, dt);
        if (!sp.splashed && sp.y + (sp.h * K_CYL) / 2 > wY) {
          sp.splashed = true;
          waterTarget += sp.vol;
          wave = 1;
          deltaFx = { v: sp.vol, t: 0 };
          haptic(HAPTIC.tap);
        }
        sp.y += sp.vy * dt;
        sp.x += (ccx + (cylStack.indexOf(sp.id) % 2 === 0 ? -4 : 4) - sp.x) * Math.min(1, 0.1 * dt);
        if (sp.y >= tY) {
          sp.y = tY;
          if (sp.vy > 0.8) sp.vy = -sp.vy * 0.22;
          else {
            sp.vy = 0;
            sp.rested = true;
          }
        }
        // 물이 자리를 잡으면 부피 확정 → 기록표
        if (sp.splashed && !sp.volDone && sp.rested && Math.abs(waterTarget - water) < 0.4) {
          sp.volDone = true;
          fillVol(sp);
          toast(`부피 ${sp.vol.toFixed(1)} mL — 물이 늘어난 만큼!`);
          onFullyMeasured(sp);
        }
      } else {
        const tx = sp.state === "scale" ? sx : slotX(sp.slot);
        const ty = sp.state === "scale" ? PLATE_Y - sp.h / 2 - 1 : TRAY_Y - sp.h / 2 - 2;
        sp.x += (tx - sp.x) * Math.min(1, 0.22 * dt);
        sp.y += (ty - sp.y) * Math.min(1, 0.22 * dt);
      }
    }

    // 저울 카운트업 — 시료가 접시에 안착해야 진행
    let disp = 0;
    if (scaleId) {
      const sp = byId(scaleId);
      if (sp.state === "scale") {
        const near = Math.abs(sp.x - sx) < 8 && Math.abs(sp.y - (PLATE_Y - sp.h / 2 - 1)) < 8;
        if (near && countT < 1) countT = Math.min(1, countT + dt / 39); // ≈650ms
        disp = sp.mass * easeOut(countT);
        if (countT >= 1 && !counted) {
          counted = true;
          if (!sp.massDone) {
            sp.massDone = true;
            fillMass(sp);
            toast(`질량 ${sp.mass.toFixed(2)} g`);
            haptic(HAPTIC.tap);
            if (!firstMassHinted && !finished) {
              firstMassHinted = true;
              helper.innerHTML = "질량 확인! 이제 그 조각을 <b>눈금실린더</b>로 옮겨요 — 물이 <b>늘어난 만큼</b>이 부피예요.";
            }
          }
        }
      }
    }

    // ================= 그리기 =================
    // 트레이 슬롯
    for (let i = 0; i < 4; i++) {
      const x = slotX(i);
      ctx.fillStyle = "rgba(255,255,255,.045)";
      rr(ctx, x - 33, TRAY_Y - 32, 66, 58, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.09)";
      ctx.lineWidth = 1.2;
      rr(ctx, x - 33, TRAY_Y - 32, 66, 58, 12);
      ctx.stroke();
    }
    // 그룹 라벨은 슬롯 위에(무대 하단은 stage-cap 안내문 자리)
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(196,212,232,.6)";
    ctx.fillText("철", (slotX(0) + slotX(1)) / 2, TRAY_Y - 42);
    ctx.fillText("알루미늄", (slotX(2) + slotX(3)) / 2, TRAY_Y - 42);

    // ---- 전자저울 ----
    contactShadow(ctx, sx, 262, 74, 0.26);
    // 기둥(접시 받침)
    ctx.fillStyle = "rgba(190,210,236,.22)";
    rr(ctx, sx - 7, PLATE_Y + 6, 14, 12, 3);
    ctx.fill();
    // 접시(위 밝은 금속)
    const pg = ctx.createLinearGradient(0, PLATE_Y, 0, PLATE_Y + 8);
    pg.addColorStop(0, "rgba(255,255,255,.34)");
    pg.addColorStop(1, "rgba(190,210,235,.12)");
    ctx.fillStyle = pg;
    rr(ctx, sx - 44, PLATE_Y, 88, 8, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(226,240,255,.55)";
    ctx.lineWidth = 1.4;
    rr(ctx, sx - 44, PLATE_Y, 88, 8, 4);
    ctx.stroke();
    // 몸체 + 표시창
    const dspRect = scaleBody(ctx, sx, PLATE_Y + 16, 122, 38);
    ctx.font = "800 14px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = disp > 0.005 ? "#8FF3C0" : "rgba(143,243,192,.4)";
    ctx.fillText(`${disp.toFixed(2)} g`, dspRect.dx + dspRect.dw - 8, dspRect.dy + dspRect.dh / 2 + 5);

    // ---- 눈금실린더 ----
    contactShadow(ctx, ccx, 262, 50, 0.26);
    // 받침 발
    ctx.fillStyle = "rgba(148,180,222,.25)";
    rr(ctx, ccx - 33, CYL_BOT + 2, 66, 7, 3.5);
    ctx.fill();
    ctx.strokeStyle = "rgba(216,234,255,.5)";
    ctx.lineWidth = 1.3;
    rr(ctx, ccx - 33, CYL_BOT + 2, 66, 7, 3.5);
    ctx.stroke();
    glassVessel(ctx, { x0: ccx - 27, y0: CYL_TOP, x1: ccx + 27, y1: CYL_BOT });
    // 실린더 안 시료(물 틴트가 위에 덮여 "잠긴" 느낌)
    for (const sid of cylStack) drawBlock(ctx, byId(sid), K_CYL);
    // 물
    const wY = mlY(water);
    liquidFill(ctx, ccx - 24, wY, ccx + 24, INNER_BOT + 1, "92,152,235", 0.17);
    if (wave > 0.03) {
      ctx.strokeStyle = `rgba(226,242,255,${0.5 * wave})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let px = ccx - 24; px <= ccx + 24; px += 6) {
        const yy = wY + Math.sin(px / 9 + tMs / 130) * wave * 2.6;
        if (px === ccx - 24) ctx.moveTo(px, yy);
        else ctx.lineTo(px, yy);
      }
      ctx.stroke();
    }
    // 눈금(10 mL 간격, 20마다 라벨)
    ctx.font = "600 9px Pretendard, sans-serif";
    ctx.textAlign = "right";
    for (let ml = 0; ml <= 100; ml += 10) {
      const y = mlY(ml);
      ctx.strokeStyle = "rgba(214,230,252,.38)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(ccx - 24, y);
      ctx.lineTo(ccx - 24 + (ml % 20 === 0 ? 12 : 7), y);
      ctx.stroke();
      if (ml % 20 === 0 && ml > 0) {
        ctx.fillStyle = "rgba(196,212,232,.55)";
        ctx.fillText(String(ml), ccx - 31, y + 3);
      }
    }
    ctx.fillStyle = "rgba(196,212,232,.55)";
    ctx.fillText("mL", ccx - 31, mlY(100) - 10);
    // 현재 수면 읽기 마커(◄)
    ctx.fillStyle = "rgba(140,230,180,.85)";
    ctx.beginPath();
    ctx.moveTo(ccx + 29, wY);
    ctx.lineTo(ccx + 36, wY - 4);
    ctx.lineTo(ccx + 36, wY + 4);
    ctx.closePath();
    ctx.fill();

    // Δ부피 라벨(림 위로 떠오르며 사라짐)
    if (deltaFx) {
      deltaFx.t += dt * 16.7;
      const p = deltaFx.t / 1800;
      if (p >= 1) deltaFx = null;
      else {
        ctx.font = "800 13px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(140,230,180,${1 - p})`;
        ctx.fillText(`+${deltaFx.v.toFixed(1)} mL`, ccx, CYL_TOP - 10 - p * 12);
      }
    }

    // ---- 트레이·저울 시료(드래그 중인 것은 맨 위) ----
    for (const sp of samples) {
      if (sp.state === "cyl" || (drag && drag.id === sp.id)) continue;
      contactShadow(ctx, sp.x, sp.y + sp.h / 2 + 4, sp.w * 0.75, 0.22);
      drawBlock(ctx, sp);
      if (selected === sp.id) drawSelectRing(ctx, sp, tMs);
    }
    if (drag) {
      const sp = byId(drag.id);
      // 유효 목표 하이라이트: 질량 전=저울, 후=실린더
      const targetCyl = sp.massDone;
      const hx = targetCyl ? ccx : sx;
      const hy = targetCyl ? 150 : PLATE_Y + 18;
      const hover = targetCyl ? inCylZone(pointer.x, pointer.y) : inScaleZone(pointer.x, pointer.y);
      softGlow(ctx, hx, hy, targetCyl ? 88 : 76, "140,190,255", hover ? 0.16 : 0.08);
      ctx.strokeStyle = `rgba(255,214,138,${hover ? 0.7 : 0.4 + Math.sin(tMs / 300) * 0.12})`;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      if (targetCyl) rr(ctx, ccx - 36, CYL_TOP - 8, 72, CYL_BOT - CYL_TOP + 20, 14);
      else rr(ctx, sx - 60, PLATE_Y - 34, 120, 96, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      contactShadow(ctx, sp.x, sp.y + sp.h / 2 + 10, sp.w * 0.6, 0.14);
      drawBlock(ctx, sp, 1.07);
    }

    // 시작 유도 화살표(첫 질량 측정 전): 첫 시료 → 저울
    if (!firstMassHinted && !drag && !scaleId) {
      const from = byId("feL");
      const dx = sx - from.x;
      const dy = PLATE_Y - 20 - from.y;
      const len = Math.hypot(dx, dy);
      const ux = dx / len;
      const uy = dy / len;
      const bob = Math.sin(tMs / 300) * 5;
      const ax = from.x + ux * (44 + bob);
      const ay = from.y - 26 + uy * (44 + bob) * 0.4;
      ctx.strokeStyle = "rgba(255,194,77,.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(from.x + ux * 16, from.y - 26 + uy * 6);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      const aa = Math.atan2(ay - (from.y - 26 + uy * 6), ax - (from.x + ux * 16));
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - Math.cos(aa - 0.5) * 9, ay - Math.sin(aa - 0.5) * 9);
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - Math.cos(aa + 0.5) * 9, ay - Math.sin(aa + 0.5) * 9);
      ctx.stroke();
    }

    // HUD 갱신
    const st = `저울 ${disp.toFixed(2)} g`;
    if (st !== shownScale) {
      shownScale = st;
      scalePill.textContent = st;
    }
    const ct = `실린더 ${water.toFixed(1)} mL`;
    if (ct !== shownCyl) {
      shownCyl = ct;
      cylPill.textContent = ct;
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

  api.setCTA("네 조각을 재서 표를 채워 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    window.clearTimeout(sameTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
  };
};
