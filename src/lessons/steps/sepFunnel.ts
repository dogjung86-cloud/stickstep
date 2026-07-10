// sepFunnel — 분별 깔때기 랩(중2 I 물질의 특성). 교과서 탐구(물+식용유 분리)의 조작판:
//   · 시작은 방금 흔든 뿌연 에멀션 → "가만히 두기"로 층 분리(기름방울이 모여 위로)
//   · 마개를 먼저 열어야 콸콸 나온다(안 열면 꼭지를 눌러도 찔끔 — 교과서 포인트)
//   · 꼭지를 누르는 동안 아래층 물이 (가)로 — 경계면이 꼭지에 닿기 직전(±8px)에 손 떼면 성공,
//     지나치면 기름이 섞여 오염 — 처음부터 다시
//   · 남은 위층 식용유는 깔때기를 기울여 "입구로" (나)에 따른다(경계 부근 액체는 섞이니까)
// 목표: ① 층이 나뉘는 까닭(밀도 라벨 탭) ② 아래층은 꼭지로 ③ 위층은 입구로.

import { el, clamp, lerp, smooth } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { glassVessel, glassStrokeStyle, liquidFill, contactShadow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SepStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 396;
const PIVOT_Y = 150; // 깔때기 회전 중심(불룩한 몸통 중앙)
const TAP_Y = 223; // 꼭지(콕) 상단 — 경계면의 목표점
const B0 = 148; // 분리 직후 경계면 y
const OIL_TOP0 = 92; // 분리 직후 기름 윗면 y
const TILT_MAX = 1.95; // 따르기 최대 기울기(rad)

interface Blob {
  u: number; // 반지름 방향 -1..1
  ly: number; // 로컬 y
  r: number;
  sp: number;
}

export const sepFunnel: StepRenderer = (host, step, api) => {
  const s = step as unknown as SepStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "분별 깔때기 실험 무대. 마개·꼭지·층 라벨을 직접 탭하거나 아래 버튼으로 조작해요.",
    },
  });
  const waterPill = el("span", { text: "아래층 물 100%" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "방금 흔들어 뿌옇게 섞였어요 — 가만히 두면?" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5C98EB" }), waterPill)),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "layer" } }, el("b", { text: "층이 나뉜 까닭" }), el("span", { text: "라벨 탭" })),
    el("div", { class: "pn-badge chem", dataset: { g: "water" } }, el("b", { text: "아래층 물" }), el("span", { text: "꼭지로!" })),
    el("div", { class: "pn-badge chem", dataset: { g: "oil" } }, el("b", { text: "위층 기름" }), el("span", { text: "입구로!" })),
  );

  const btnAct = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "가만히 두기" }));
  const chOil = el("button", { class: "hook-choice", attrs: { type: "button" }, text: "위층 식용유 — 왜 위에 뜰까?" });
  const chWat = el("button", { class: "hook-choice", attrs: { type: "button" }, text: "아래층 물 — 왜 가라앉을까?" });
  const choices = el("div", { class: "hook-choices" }, chOil, chWat);

  const helper = el("div", {
    class: "helper",
    html: "물과 식용유를 넣고 <b>방금 흔든</b> 분별 깔때기예요. 뿌연 혼합물 — 가만히 두면 어떻게 될까요?",
  });
  host.append(goalChips, helper, stage, btnAct, choices); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let settling = false;
  let settled = false;
  let settleT = 0;
  let stopperOpen = false;
  let holding = false;
  let dribbleT = 0;
  let dribbleToasted = false;
  let boundaryY = B0;
  let waterDone = false;
  let failing = false;
  let failT = 0;
  let successT = 0;
  let oilVol = 1;
  let tilt = 0;
  let pourHold = false;
  let oilDone = false;
  let valveA = 0;
  let oilTapped = false;
  let watTapped = false;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let shownPct = "";

  const blobs: Blob[] = [];
  for (let i = 0; i < 24; i++) {
    blobs.push({ u: Math.random() * 2 - 1, ly: -46 + Math.random() * 110, r: 1.6 + Math.random() * 2.6, sp: 0.7 + Math.random() * 0.6 });
  }

  const fxOf = (): number => W * 0.42;
  const bxcOf = (): number => W - 52; // 비커 (나) 중심

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2100);
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
        "밀도가 큰 물은 아래층, 작은 식용유는 위층 — 서로 섞이지 않는 액체는 <b>밀도 차</b>로 분리해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function updateBtn(): void {
    const span = btnAct.firstChild as HTMLElement;
    btnAct.disabled = settling;
    btnAct.style.opacity = settling ? ".55" : "";
    if (oilDone) {
      span.textContent = "분리 완료!";
      btnAct.classList.add("done-static");
    } else if (waterDone) span.textContent = "기울여 (나)에 따르기 (꾹)";
    else if (stopperOpen) span.textContent = "꼭지 꾹 — 경계 직전에 손 떼기!";
    else if (settled) span.textContent = "마개 열기";
    else if (settling) span.textContent = "층이 나뉘는 중…";
    else span.textContent = "가만히 두기";
  }

  // ---- 단계 액션 ----
  function startSettle(): void {
    if (settled || settling) return;
    settling = true;
    settleT = 0;
    haptic(HAPTIC.tap);
    capEl.textContent = "작은 기름방울들이 모여 위로 떠올라요…";
    updateBtn();
  }
  function openStopper(): void {
    if (!settled || stopperOpen) return;
    stopperOpen = true;
    haptic(HAPTIC.tap);
    toast("마개 열림 — 이제 공기가 들어올 수 있어요");
    capEl.textContent = "꼭지를 꾹 — 경계면이 꼭지에 닿기 직전에 손 떼요!";
    updateBtn();
  }
  function startHold(): void {
    if (!settled || waterDone || failing) return;
    holding = true;
    if (!stopperOpen) {
      dribbleT = 0.9;
      if (!dribbleToasted) {
        dribbleToasted = true;
        toast("콸콸 안 나와요 — 마개를 먼저 열어야 해요");
      }
    } else haptic(HAPTIC.tap);
  }
  function releaseHold(): void {
    if (!holding) return;
    holding = false;
    dribbleToasted = false;
    if (!stopperOpen || waterDone || failing) return;
    const dist = TAP_Y - boundaryY;
    if (dist <= 8) {
      waterDone = true;
      successT = 0.7;
      capEl.textContent = "이제 위층 — 깔때기를 기울여 입구로!";
      collect("water", "딱 맞춤!", "딱 맞췄어요 — 물만 (가)에 받았어요!");
      updateBtn();
    } else if (boundaryY > B0 + 4) {
      toast("아직 물이 남았어요 — 경계가 꼭지에 닿기 직전까지!");
    }
  }
  function fail(): void {
    failing = true;
    failT = 1.6;
    holding = false;
    haptic(HAPTIC.wrong);
    toast("기름까지 내려왔어요! 처음부터 다시");
    capEl.textContent = "경계를 지나치면 (가)가 오염돼요 — 다시!";
  }
  function layerTap(kind: "oil" | "water"): void {
    if (!settled) return;
    haptic(HAPTIC.tap);
    if (kind === "oil") {
      oilTapped = true;
      chOil.classList.add("sel");
      toast("식용유 밀도 약 0.91 — 가벼워서 위층!");
    } else {
      watTapped = true;
      chWat.classList.add("sel");
      toast("물 밀도 1.00 — 무거워서 아래층!");
    }
    if (oilTapped && watTapped) collect("layer", "밀도 차!", "섞이지 않는 두 액체 — 밀도 큰 쪽이 아래!");
  }

  // ---- 버튼 이벤트(키보드 대체 경로 포함) ----
  const onBtnClick = (): void => {
    if (!settled && !settling) startSettle();
    else if (settled && !stopperOpen) openStopper();
  };
  const onBtnDown = (e: PointerEvent): void => {
    if (stopperOpen && !waterDone) {
      btnAct.setPointerCapture(e.pointerId);
      startHold();
    } else if (waterDone && !oilDone) {
      btnAct.setPointerCapture(e.pointerId);
      pourHold = true;
      haptic(HAPTIC.tap);
    }
  };
  const onBtnUp = (): void => {
    if (holding) releaseHold();
    pourHold = false;
  };
  const onBtnKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== " " && e.key !== "Enter") return;
    if (e.repeat) return;
    if (stopperOpen && !waterDone) {
      e.preventDefault();
      startHold();
    } else if (waterDone && !oilDone) {
      e.preventDefault();
      pourHold = true;
    }
  };
  const onBtnKeyUp = (e: KeyboardEvent): void => {
    if (e.key !== " " && e.key !== "Enter") return;
    if (holding) releaseHold();
    pourHold = false;
  };
  btnAct.addEventListener("click", onBtnClick);
  btnAct.addEventListener("pointerdown", onBtnDown);
  btnAct.addEventListener("pointerup", onBtnUp);
  btnAct.addEventListener("pointercancel", onBtnUp);
  btnAct.addEventListener("keydown", onBtnKeyDown);
  btnAct.addEventListener("keyup", onBtnKeyUp);
  const onChOil = (): void => layerTap("oil");
  const onChWat = (): void => layerTap("water");
  chOil.addEventListener("click", onChOil);
  chWat.addEventListener("click", onChWat);

  // ---- 캔버스 직접 조작 ----
  const onCvDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const fx = fxOf();
    if (!settled) {
      if (Math.abs(px - fx) < 70 && py > 40 && py < 260 && !settling) toast("뿌옇게 섞여 있어요 — 먼저 가만히 두기!");
      return;
    }
    // 마개
    if (!stopperOpen && Math.abs(px - fx) < 30 && py > 24 && py < 62) {
      openStopper();
      return;
    }
    // 층 라벨 칩
    if (!waterDone && px > fx + 50 && px < fx + 132) {
      if (py > 96 && py < 122) {
        layerTap("oil");
        return;
      }
      if (py > 168 && py < 194) {
        layerTap("water");
        return;
      }
    }
    // 층 영역 자체를 탭해도 라벨 확인(꼭지 히트 영역과 겹치지 않게 200px까지)
    if (!waterDone && Math.abs(px - fx) < 46 && py > OIL_TOP0 && py < 200) {
      layerTap(py < boundaryY ? "oil" : "water");
      return;
    }
    // 꼭지(물 빼기) — 마개를 안 열었으면 찔끔 교훈
    if (!waterDone && Math.abs(px - fx) < 26 && py > 206 && py < 264) {
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
      startHold();
      return;
    }
    // 따르기(물 완료 후 깔때기 아무 데나 꾹)
    if (waterDone && !oilDone && Math.abs(px - fx) < 80 && py > 30 && py < 270) {
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
      pourHold = true;
      haptic(HAPTIC.tap);
    }
  };
  const onCvUp = (): void => {
    canvas.classList.remove("dragging");
    if (holding) releaseHold();
    pourHold = false;
  };
  canvas.addEventListener("pointerdown", onCvDown);
  canvas.addEventListener("pointerup", onCvUp);
  canvas.addEventListener("pointercancel", onCvUp);

  // ---- 기하 헬퍼 ----
  function halfAt(ly: number): number {
    if (ly < -58) return 10;
    if (ly < 0) return 11 + 34 * smooth(-58, 0, ly);
    return 45 - 40.5 * (ly / 73);
  }
  function innerPath(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(-11, -90);
    ctx.lineTo(-11, -58);
    ctx.bezierCurveTo(-38, -46, -45, -24, -45, -2);
    ctx.bezierCurveTo(-45, 28, -22, 60, -4.5, 73);
    ctx.lineTo(4.5, 73);
    ctx.bezierCurveTo(22, 60, 45, 28, 45, -2);
    ctx.bezierCurveTo(45, -24, 38, -46, 11, -58);
    ctx.lineTo(11, -90);
    ctx.closePath();
  }
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
  // 분리 직후 기름 윗면(경계가 내려가면 기름 띠도 함께 내려온다 — 위는 공기)
  const oilTopOf = (by: number): number => OIL_TOP0 + (by - B0) * 0.55;

  // ---- 그리기 ----
  function draw(ctx: CanvasRenderingContext2D, tMs: number, dtSec: number): void {
    const fx = fxOf();
    const bxc = bxcOf();
    const poleX = Math.max(26, W * 0.13);

    // 스탠드
    ctx.strokeStyle = "rgba(196,212,236,.55)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(poleX, 44);
    ctx.lineTo(poleX, 348);
    ctx.stroke();
    contactShadow(ctx, poleX, 352, 46, 0.24);
    ctx.strokeStyle = "rgba(148,168,196,.6)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(poleX - 26, 350);
    ctx.lineTo(poleX + 26, 350);
    ctx.stroke();
    // 링 암 + 링(깔때기를 받친다)
    ctx.strokeStyle = "rgba(196,212,236,.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(poleX, 96);
    ctx.lineTo(fx - 24, 96);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(fx, 97, 22, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 비커 (가)(나)
    contactShadow(ctx, fx, 354, 52, 0.26);
    contactShadow(ctx, bxc, 354, 48, 0.26);
    glassVessel(ctx, { x0: fx - 40, y0: 288, x1: fx + 40, y1: 352 });
    glassVessel(ctx, { x0: bxc - 38, y0: 288, x1: bxc + 38, y1: 352 });
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(200,220,245,.85)";
    ctx.fillText("(가)", fx, 282);
    ctx.fillText("(나)", bxc, 282);
    // (가) 물
    const collected = clamp((boundaryY - B0) / (TAP_Y - B0), 0, 1);
    if (collected > 0.01) {
      const lvl = 348 - collected * 42;
      liquidFill(ctx, fx - 37, lvl, fx + 37, 349, "92,152,235", 0.24);
      // 오염 연출: 기름막 + 뿌염
      if (failT > 0) {
        const a = clamp(failT / 1.6, 0, 1);
        ctx.fillStyle = `rgba(255,196,90,${0.5 * a})`;
        ctx.beginPath();
        ctx.ellipse(fx, lvl, 34, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(230,206,150,${0.16 * a})`;
        ctx.fillRect(fx - 37, lvl, 74, 348 - lvl);
      }
    }
    // (나) 식용유
    if (1 - oilVol > 0.02) {
      const lvl = 348 - (1 - oilVol) * 38;
      liquidFill(ctx, bxc - 35, lvl, bxc + 35, 349, "255,196,90", 0.28);
    }

    // ---- 물줄기 ----
    const pourBlend = smooth(0.7, 1.6, tilt);
    if ((holding && stopperOpen && !waterDone && !failing) || failT > 1.2) {
      const oily = failT > 0;
      const lvl = 348 - collected * 42;
      ctx.strokeStyle = oily ? "rgba(255,196,90,.85)" : "rgba(120,178,245,.8)";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      const wig = Math.sin(tMs / 90) * 1.2;
      ctx.moveTo(fx, 258);
      ctx.quadraticCurveTo(fx + wig, (258 + lvl) / 2, fx, lvl);
      ctx.stroke();
      ctx.fillStyle = oily ? "rgba(255,214,138,.5)" : "rgba(170,210,250,.5)";
      ctx.beginPath();
      ctx.ellipse(fx, lvl, 7 + Math.sin(tMs / 140) * 1.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 찔끔(마개 닫힘)
    if (dribbleT > 0) {
      ctx.strokeStyle = `rgba(120,178,245,${0.7 * clamp(dribbleT, 0, 0.6)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(fx, 258);
      ctx.lineTo(fx, 258 + 12 * clamp(dribbleT / 0.9, 0, 1));
      ctx.stroke();
    }

    // ---- 깔때기(회전 프레임) ----
    const pe = smooth(0.25, 1.9, tilt);
    const dxFull = bxc - 6 - (fx + 92 * Math.sin(TILT_MAX));
    const px = fx + pe * dxFull;
    const py = PIVOT_Y + pe * 12;
    const mouthX = px + 92 * Math.sin(tilt);
    const mouthY = py - 92 * Math.cos(tilt);

    // 따르는 기름 줄기(깔때기 뒤에 깔리지 않게 먼저)
    const pouring = pourHold && tilt > 1.42 && oilVol > 0;
    if (pouring || (tilt > 1.42 && oilVol <= 0.02 && pourHold)) {
      const lvl = 348 - (1 - oilVol) * 38;
      ctx.strokeStyle = "rgba(255,196,90,.85)";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      ctx.quadraticCurveTo(mouthX + 4, (mouthY + lvl) / 2, bxc, lvl);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(tilt);
    // 유리 틴트
    ctx.fillStyle = "rgba(190,220,255,.05)";
    innerPath(ctx);
    ctx.fill();

    // 내용물(클립 → 월드 수평면 기준으로 채움)
    ctx.save();
    innerPath(ctx);
    ctx.clip();
    ctx.rotate(-tilt);
    ctx.translate(-px, -py);
    if (!settled) {
      // 에멀션(뿌연 혼합) + 기름방울
      const murk = 0.16 * (1 - smooth(0.4, 2.2, settleT));
      const lay = smooth(0.6, 2.3, settleT);
      ctx.fillStyle = `rgba(226,206,160,${murk})`;
      ctx.fillRect(fx - 60, OIL_TOP0, 120, TAP_Y - OIL_TOP0);
      if (lay > 0.02) {
        ctx.fillStyle = `rgba(255,196,90,${0.3 * lay})`;
        ctx.fillRect(fx - 60, OIL_TOP0, 120, B0 - OIL_TOP0);
        ctx.fillStyle = `rgba(92,152,235,${0.26 * lay})`;
        ctx.fillRect(fx - 60, B0, 120, TAP_Y - B0);
      }
      ctx.fillStyle = "rgba(255,196,90,.55)";
      for (const b of blobs) {
        const bx = fx + b.u * (halfAt(b.ly) - 5);
        const by = PIVOT_Y + b.ly + (settling ? 0 : Math.sin(tMs / 700 + b.u * 9) * 1.6);
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (!waterDone) {
      // 기름 띠 + 물 띠(경계가 내려간다)
      const ot = oilTopOf(boundaryY);
      const og = ctx.createLinearGradient(0, ot, 0, boundaryY);
      og.addColorStop(0, "rgba(255,196,90,.34)");
      og.addColorStop(1, "rgba(255,196,90,.18)");
      ctx.fillStyle = og;
      ctx.fillRect(fx - 60, ot, 120, boundaryY - ot);
      const wg = ctx.createLinearGradient(0, boundaryY, 0, TAP_Y);
      wg.addColorStop(0, "rgba(92,152,235,.3)");
      wg.addColorStop(1, "rgba(92,152,235,.13)");
      ctx.fillStyle = wg;
      ctx.fillRect(fx - 60, boundaryY, 120, TAP_Y - boundaryY + 2);
      // 윗면·경계선
      ctx.strokeStyle = "rgba(255,226,170,.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(fx - 46, ot);
      ctx.lineTo(fx + 46, ot);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.6)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let lx = -46; lx <= 46; lx += 4) {
        const yy = boundaryY + (holding ? Math.sin(lx / 6 + tMs / 130) * 0.9 : 0);
        if (lx === -46) ctx.moveTo(fx + lx, yy);
        else ctx.lineTo(fx + lx, yy);
      }
      ctx.stroke();
      // 마개 닫고 꼭지 열면: 목에 꼬르륵 기포
      if (dribbleT > 0) {
        ctx.fillStyle = "rgba(230,242,255,.6)";
        for (let k = 0; k < 2; k++) {
          const ph = (0.9 - dribbleT + k * 0.3) % 0.9;
          ctx.beginPath();
          ctx.arc(fx + (k ? 4 : -3), 210 - ph * 90, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // 남은 물 한 뼘(경계~꼭지) + 기름(면은 항상 수평)
      if (tilt < 0.2 && TAP_Y - boundaryY > 0.5) {
        ctx.fillStyle = "rgba(92,152,235,.3)";
        ctx.fillRect(fx - 60, boundaryY, 120, TAP_Y - boundaryY + 2);
      }
      const baseTop = oilTopOf(boundaryY);
      const bandTop = boundaryY - (boundaryY - baseTop) * oilVol;
      const planeY = lerp(bandTop, mouthY + 4 + (1 - oilVol) * 26, pourBlend);
      if (oilVol > 0.01) {
        // 세워져 있을 땐 물 한 뼘 위에 '띠'로, 기울이면 수평면 기준으로 채운다
        const bandBot = pourBlend < 0.02 ? boundaryY : planeY + 280;
        const og2 = ctx.createLinearGradient(0, planeY, 0, planeY + 140);
        og2.addColorStop(0, "rgba(255,196,90,.36)");
        og2.addColorStop(1, "rgba(255,196,90,.16)");
        ctx.fillStyle = og2;
        ctx.fillRect(px - 130, planeY, 260, bandBot - planeY);
        ctx.strokeStyle = "rgba(255,226,170,.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px - 130, planeY);
        ctx.lineTo(px + 130, planeY);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 유리 몸통(열린 입구 — 위를 가로지르지 않는다)
    ctx.strokeStyle = glassStrokeStyle(ctx, -90, 106);
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-11, -90);
    ctx.lineTo(-11, -58);
    ctx.bezierCurveTo(-38, -46, -45, -24, -45, -2);
    ctx.bezierCurveTo(-45, 28, -22, 60, -4.5, 73);
    ctx.moveTo(11, -90);
    ctx.lineTo(11, -58);
    ctx.bezierCurveTo(38, -46, 45, -24, 45, -2);
    ctx.bezierCurveTo(45, 28, 22, 60, 4.5, 73);
    ctx.stroke();
    // 목~꼭지 통로 + 꼭지 아래 유리관
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-4.5, 73);
    ctx.lineTo(-3, 87);
    ctx.moveTo(4.5, 73);
    ctx.lineTo(3, 87);
    ctx.moveTo(-3, 101);
    ctx.lineTo(-3, 106);
    ctx.moveTo(3, 101);
    ctx.lineTo(3, 106);
    ctx.stroke();
    // 스펙큘러(좌상단 키라이트) + 입구 림
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-34, -34);
    ctx.quadraticCurveTo(-40, -10, -36, 16);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,240,255,.9)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-14, -90);
    ctx.lineTo(-6, -90);
    ctx.moveTo(6, -90);
    ctx.lineTo(14, -90);
    ctx.stroke();
    // 꼭지(콕): 금속 몸체 + 돌아가는 손잡이
    const vg = ctx.createLinearGradient(-9, 88, 9, 100);
    vg.addColorStop(0, "rgba(232,242,255,.5)");
    vg.addColorStop(1, "rgba(150,172,205,.35)");
    ctx.fillStyle = vg;
    rr(ctx, -9, 88, 18, 13, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(96,116,150,.7)";
    ctx.lineWidth = 1.4;
    rr(ctx, -9, 88, 18, 13, 5);
    ctx.stroke();
    ctx.save();
    ctx.translate(0, 94.5);
    ctx.rotate(valveA);
    ctx.strokeStyle = "rgba(226,240,255,.85)";
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();
    ctx.restore();
    // 마개(닫힘 상태 — 깔때기에 붙어 회전)
    if (!stopperOpen) {
      const sg = ctx.createLinearGradient(-12, -104, 12, -92);
      sg.addColorStop(0, "#E2A878");
      sg.addColorStop(0.55, "#C88A5A");
      sg.addColorStop(1, "#A5673F");
      ctx.fillStyle = sg;
      rr(ctx, -12, -103, 24, 12, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(110,66,38,.8)";
      ctx.lineWidth = 1.4;
      rr(ctx, -12, -103, 24, 12, 4);
      ctx.stroke();
      rr(ctx, -6, -110, 12, 7, 3);
      ctx.fill();
    }
    ctx.restore(); // 깔때기 프레임 끝

    // 열린 마개(바닥에 내려놓음)
    if (stopperOpen) {
      contactShadow(ctx, fx - 66, 352, 18, 0.2);
      ctx.save();
      ctx.translate(fx - 66, 346);
      ctx.rotate(-0.35);
      const sg2 = ctx.createLinearGradient(-12, -6, 12, 6);
      sg2.addColorStop(0, "#E2A878");
      sg2.addColorStop(1, "#A5673F");
      ctx.fillStyle = sg2;
      rr(ctx, -12, -6, 24, 12, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(110,66,38,.8)";
      ctx.lineWidth = 1.4;
      rr(ctx, -12, -6, 24, 12, 4);
      ctx.stroke();
      ctx.restore();
    }

    // ---- 층 라벨 칩(밀도 확인 목표) ----
    if (settled && !waterDone) {
      const chip = (x: number, y: number, w: number, label: string, on: boolean, rgb: string, txt: string): void => {
        ctx.fillStyle = `rgba(${rgb},${on ? 0.24 : 0.1})`;
        rr(ctx, x, y, w, 22, 11);
        ctx.fill();
        ctx.strokeStyle = `rgba(${rgb},.55)`;
        ctx.lineWidth = 1.2;
        rr(ctx, x, y, w, 22, 11);
        ctx.stroke();
        ctx.fillStyle = txt;
        ctx.font = "700 10.5px Pretendard, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(label, x + 10, y + 14.5);
        ctx.strokeStyle = `rgba(${rgb},.4)`;
        ctx.beginPath();
        ctx.moveTo(x, y + 11);
        ctx.lineTo(fx + 44, y + 11);
        ctx.stroke();
      };
      chip(fx + 56, 98, 76, oilTapped ? "식용유 ✓" : "식용유 ?", oilTapped, "255,196,90", "#FFE2B0");
      chip(fx + 56, 170, 76, watTapped ? "물 ✓" : "물 ?", watTapped, "120,178,245", "#BBDCFF");
    }

    // ---- 안내 화살표 ----
    const bob = Math.sin(tMs / 300) * 4;
    ctx.strokeStyle = "rgba(255,194,77,.55)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    if (settled && !stopperOpen) {
      ctx.beginPath();
      ctx.moveTo(fx + 40, 22 + bob);
      ctx.lineTo(fx + 20, 40 + bob);
      ctx.moveTo(fx + 30, 26 + bob);
      ctx.lineTo(fx + 20, 40 + bob);
      ctx.lineTo(fx + 34, 44 + bob);
      ctx.stroke();
    } else if (stopperOpen && !waterDone && !holding && !failing) {
      ctx.strokeStyle = `rgba(255,194,77,${0.3 + 0.25 * Math.sin(tMs / 220)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx, 244, 17, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 성공 링
    if (successT > 0) {
      const a = successT / 0.7;
      ctx.strokeStyle = `rgba(120,220,160,${a * 0.8})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(fx, 240, 16 + (1 - a) * 26, 0, Math.PI * 2);
      ctx.stroke();
      successT = Math.max(0, successT - dtSec);
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const dtSec = (dt * 16.7) / 1000;

    // 층 분리 진행
    if (settling) {
      settleT += dtSec;
      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i];
        b.ly -= (22 + b.r * 5) * b.sp * dtSec;
        if (b.ly < -48) blobs.splice(i, 1);
      }
      if (settleT >= 2.5) {
        settling = false;
        settled = true;
        blobs.length = 0;
        haptic(HAPTIC.cross);
        toast("층이 나뉘었어요 — 물 아래, 식용유 위!");
        capEl.textContent = "마개를 먼저 연 다음, 꼭지로 아래층만!";
        choices.classList.add("show");
        window.setTimeout(() => choices.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
        if (!finished)
          helper.innerHTML =
            "위층·아래층 라벨을 탭해 <b>왜 이렇게 나뉘었는지</b> 확인하고, <b>마개 → 꼭지</b> 순서로 물을 받아요.";
        updateBtn();
      }
    }

    // 물 빼기
    if (holding && stopperOpen && !waterDone && !failing) {
      const frac = clamp((TAP_Y - boundaryY) / (TAP_Y - B0), 0, 1);
      boundaryY += (10 + 38 * frac) * dtSec;
      if (boundaryY >= TAP_Y + 2) fail();
    }
    if (dribbleT > 0) {
      dribbleT = Math.max(0, dribbleT - dtSec);
      if (!holding) dribbleT = 0;
    }
    // 오염 리셋
    if (failing) {
      failT -= dtSec;
      if (failT <= 0) {
        failing = false;
        failT = 0;
        boundaryY = B0;
        toast("층은 그대로 — 다시 도전!");
      }
    }
    // 꼭지 손잡이 회전
    const vTarget = holding && !waterDone ? Math.PI / 2 : 0;
    valveA += (vTarget - valveA) * Math.min(1, 9 * dtSec);
    // 기울여 따르기
    const tTarget = pourHold && waterDone && !oilDone ? TILT_MAX : 0;
    tilt += (tTarget - tilt) * Math.min(1, 3 * dtSec);
    if (pourHold && waterDone && !oilDone && tilt > 1.42 && oilVol > 0) {
      oilVol = Math.max(0, oilVol - 0.3 * dtSec);
      if (oilVol <= 0) {
        oilDone = true;
        pourHold = false;
        capEl.textContent = "물은 (가), 식용유는 (나) — 분리 성공!";
        collect("oil", "따라 냄!", "위층은 입구로 — 경계 부근 액체가 섞이지 않게!");
        if (!finished && !goals.has("layer"))
          helper.innerHTML = "마지막 하나 — <b>층 라벨</b>을 탭해 밀도를 비교해 보세요.";
        updateBtn();
      }
    }

    draw(ctx, tMs, dtSec);

    // HUD
    const pct = String(Math.round(clamp((TAP_Y - boundaryY) / (TAP_Y - B0), 0, 1) * 100));
    if (pct !== shownPct) {
      shownPct = pct;
      waterPill.textContent = `아래층 물 ${pct}%`;
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

  api.setCTA("물과 식용유를 나눠 담아 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onCvDown);
    canvas.removeEventListener("pointerup", onCvUp);
    canvas.removeEventListener("pointercancel", onCvUp);
    btnAct.removeEventListener("click", onBtnClick);
    btnAct.removeEventListener("pointerdown", onBtnDown);
    btnAct.removeEventListener("pointerup", onBtnUp);
    btnAct.removeEventListener("pointercancel", onBtnUp);
    btnAct.removeEventListener("keydown", onBtnKeyDown);
    btnAct.removeEventListener("keyup", onBtnKeyUp);
    chOil.removeEventListener("click", onChOil);
    chWat.removeEventListener("click", onChWat);
  };
};
