// meltCurve — 녹는점 비교 랩(중2 I 물질의 특성). 교과서 해보기의 조작판:
//   · 물중탕 장치로 로르산·팔미트산을 가열 — 시험관 속 흰 고체가 아래부터 투명하게 녹는다
//   · 하단 실시간 온도-시간 그래프: 녹는 동안 온도가 멈추는 수평 구간(플래토)이 그려진다
//   · 완료한 곡선은 흐린 색으로 누적 — 물질 2종 × 양 2종, 최대 4조합을 겹쳐 비교
//   · 물리: 상승 기울기 ∝ 1/양, 플래토 길이 ∝ 양, 플래토 온도는 물질마다 고유(양 무관)
// 목표: ① 로르산 43.8℃ ② 팔미트산 62.5℃ ③ 같은 물질 1 g·2 g 모두 — 플래토는 그대로.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawFlame } from "../../ui/thermo";
import { glassVessel, glassStrokeStyle, liquidFill, contactShadow, softGlow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface MeltStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Sub = "la" | "pa";
type Mass = 1 | 2;

const MP: Record<Sub, number> = { la: 43.8, pa: 62.5 };
const NAME: Record<Sub, string> = { la: "로르산", pa: "팔미트산" };
const COL: Record<Sub, string> = { la: "255,143,176", pa: "164,148,255" }; // 로즈 · 바이올렛

const CVH = 434; // 캔버스 전체 높이
const LABH = 244; // 위 실험 영역(아래는 그래프)
const X_MAX = 18; // 그래프 시간축(초)
const T0 = 20; // 시작 온도
const RATE_1G = 9; // 1 g 가열 속도(℃/s) — 2 g은 절반
const PLATEAU_1G = 2.6; // 1 g 플래토 길이(s) — 2 g은 2배

interface RunPt {
  t: number;
  T: number;
}
interface Archived {
  sub: Sub;
  mass: Mass;
  pts: RunPt[];
}

export const meltCurve: StepRenderer = (host, step, api) => {
  const s = step as unknown as MeltStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px`,
    attrs: { role: "img", "aria-label": "물중탕 가열 장치와 실시간 온도-시간 그래프" },
  });
  const subPill = el("span", { text: "로르산 · 1 g" });
  const subDot = el("span", { class: "pdot", style: "background:rgb(255,143,176)" });
  const statePill = el("span", { text: "고체" });
  const stateDot = el("span", { class: "pdot", style: "background:#CFE0F5" });
  const stateWrap = el("div", { class: "pill" }, stateDot, statePill);
  const readVal = el("span", { text: "20.0" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "물질과 양을 고르고 가열을 시작해 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { style: "display:flex;gap:8px" }, el("div", { class: "pill" }, subDot, subPill), stateWrap),
      el("div", { class: "tempread" }, readVal, el("small", { text: "°C" })),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "la" } }, el("b", { text: "로르산" }), el("span", { text: "녹는점은?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "pa" } }, el("b", { text: "팔미트산" }), el("span", { text: "다를까?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "amt" } }, el("b", { text: "양 2배" }), el("span", { text: "1 g·2 g 비교" })),
  );

  // ---- 컨트롤: 물질 세그 × 양 세그 + 가열 버튼 ----
  const mkSeg = (label: string, on: boolean): HTMLButtonElement =>
    el("button", { text: label, class: on ? "on" : "", attrs: { type: "button", "aria-pressed": String(on) } });
  const btnLa = mkSeg("로르산", true);
  const btnPa = mkSeg("팔미트산", false);
  const btn1g = mkSeg("1 g", true);
  const btn2g = mkSeg("2 g", false);
  const segSub = el("div", { class: "seg", style: "margin-top:0", attrs: { "aria-label": "물질 고르기" } }, btnLa, btnPa);
  const segAmt = el("div", { class: "seg", style: "margin-top:0", attrs: { "aria-label": "양 고르기" } }, btn1g, btn2g);
  const ctrls = el("div", { class: "tg-controls" }, segSub, segAmt);
  const heatBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "가열 시작" }));

  const helper = el("div", {
    class: "helper",
    html: "시험관 속 <b>흰 고체</b>를 물중탕으로 천천히 데워요. 그래프의 온도 곡선 — 어딘가에서 <b>이상한 일</b>이 벌어져요.",
  });
  host.append(goalChips, helper, stage, ctrls, heatBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let sub: Sub = "la";
  let mass: Mass = 1;
  let running = false;
  let T = T0;
  let melt = 0; // 녹은 비율 0..1
  let zone: "solid" | "melt" | "liquid" = "solid";
  let tSec = 0;
  let observed = false; // 이번 런에서 플래토 관찰 처리 여부
  let samples: RunPt[] = [];
  const archived: Archived[] = [];
  const seen: Record<Sub, Set<number>> = { la: new Set(), pa: new Set() };
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let shownT = "";

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2000);
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
        "플래토(평평한 구간)의 온도가 <b>녹는점</b> — 물질마다 고유하고 양과 무관해요. 그래서 물질의 특성이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setHud(): void {
    subPill.textContent = `${NAME[sub]} · ${mass} g`;
    subDot.style.background = `rgb(${COL[sub]})`;
    const st = zone === "solid" ? "고체" : zone === "melt" ? "고체+액체" : "액체";
    statePill.textContent = st;
    stateDot.style.background = zone === "solid" ? "#CFE0F5" : zone === "melt" ? "#FF8FB0" : "#FFC24D";
    stateWrap.classList.toggle("pulse-soft", zone === "melt");
  }

  function resetRun(msg?: string): void {
    running = false;
    T = T0;
    melt = 0;
    zone = "solid";
    tSec = 0;
    observed = false;
    samples = [];
    (heatBtn.firstChild as HTMLElement).textContent = "가열 시작";
    setHud();
    if (msg) toast(msg);
  }

  function finishRun(): void {
    running = false;
    // 같은 조합의 이전 곡선은 교체(겹침 방지)
    const i = archived.findIndex((a) => a.sub === sub && a.mass === mass);
    if (i >= 0) archived.splice(i, 1);
    archived.push({ sub, mass, pts: samples });
    samples = [];
    (heatBtn.firstChild as HTMLElement).textContent = "다시 가열하기";
    if (!finished) toast("곡선 완성 — 조건을 바꿔 겹쳐 봐요");
  }

  // ---- 컨트롤 이벤트 ----
  function pick(btnOn: HTMLButtonElement, btnOff: HTMLButtonElement): void {
    btnOn.classList.add("on");
    btnOn.setAttribute("aria-pressed", "true");
    btnOff.classList.remove("on");
    btnOff.setAttribute("aria-pressed", "false");
  }
  const onLa = (): void => {
    if (sub === "la") return;
    sub = "la";
    pick(btnLa, btnPa);
    haptic(HAPTIC.tap);
    resetRun(running || samples.length ? "물질을 바꿨어요 — 새 시험관으로!" : undefined);
  };
  const onPa = (): void => {
    if (sub === "pa") return;
    sub = "pa";
    pick(btnPa, btnLa);
    haptic(HAPTIC.tap);
    resetRun(running || samples.length ? "물질을 바꿨어요 — 새 시험관으로!" : undefined);
  };
  const on1g = (): void => {
    if (mass === 1) return;
    mass = 1;
    pick(btn1g, btn2g);
    haptic(HAPTIC.tap);
    resetRun(running || samples.length ? "양을 바꿨어요 — 새 시험관으로!" : undefined);
  };
  const on2g = (): void => {
    if (mass === 2) return;
    mass = 2;
    pick(btn2g, btn1g);
    haptic(HAPTIC.tap);
    resetRun(running || samples.length ? "양을 바꿨어요 — 새 시험관으로!" : undefined);
  };
  btnLa.addEventListener("click", onLa);
  btnPa.addEventListener("click", onPa);
  btn1g.addEventListener("click", on1g);
  btn2g.addEventListener("click", on2g);
  const onHeat = (): void => {
    haptic(HAPTIC.tap);
    if (running) {
      resetRun();
    }
    running = true;
    T = T0;
    melt = 0;
    zone = "solid";
    tSec = 0;
    observed = false;
    samples = [];
    (heatBtn.firstChild as HTMLElement).textContent = "처음부터 다시";
    capEl.style.opacity = "0";
    capEl.style.transition = "opacity .4s";
  };
  heatBtn.addEventListener("click", onHeat);

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

  function drawLab(ctx: CanvasRenderingContext2D, tMs: number): void {
    const cx = W / 2;
    const bkHalf = Math.min(W * 0.27, 96);
    const bkTop = 86;
    const bkBot = 206;
    const waterY = 102;

    // 버너(바닥) + 불꽃
    contactShadow(ctx, cx, 242, bkHalf * 1.2, 0.22);
    ctx.strokeStyle = "rgba(148,168,196,.5)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - bkHalf * 0.6, 240);
    ctx.lineTo(cx - bkHalf * 0.3, bkBot + 4);
    ctx.moveTo(cx + bkHalf * 0.6, 240);
    ctx.lineTo(cx + bkHalf * 0.3, bkBot + 4);
    ctx.stroke();
    if (running) {
      softGlow(ctx, cx, bkBot + 8, 64, "255,150,80", 0.12);
      drawFlame(ctx, cx, 240, 30, tMs);
    }

    // 물중탕 비커 + 물
    glassVessel(ctx, { x0: cx - bkHalf, y0: bkTop, x1: cx + bkHalf, y1: bkBot });
    liquidFill(ctx, cx - bkHalf + 3, waterY, cx + bkHalf - 3, bkBot - 3, "92,152,235", running ? 0.18 : 0.13);
    // 가열 중 물 속 잔 기포
    if (running) {
      ctx.fillStyle = "rgba(226,242,255,.35)";
      for (let i = 0; i < 6; i++) {
        const ph = (tMs / 900 + i * 0.37) % 1;
        const bx = cx + Math.sin(i * 2.7) * bkHalf * 0.7;
        const by = bkBot - 8 - ph * (bkBot - waterY - 14);
        ctx.beginPath();
        ctx.arc(bx, by, 1.4 + (i % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 시험관 홀더(오른쪽 스탠드 암)
    ctx.strokeStyle = "rgba(196,212,236,.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 24, 48);
    ctx.lineTo(W - 10, 48);
    ctx.moveTo(W - 10, 48);
    ctx.lineTo(W - 10, 24);
    ctx.stroke();

    // 시험관(유리)
    const tubeHalf = 16;
    const tubeTop = 40;
    const tubeBot = 192;
    ctx.fillStyle = "rgba(190,220,255,.05)";
    ctx.beginPath();
    ctx.moveTo(cx - tubeHalf, tubeTop);
    ctx.lineTo(cx - tubeHalf, tubeBot - tubeHalf);
    ctx.arc(cx, tubeBot - tubeHalf, tubeHalf, Math.PI, 0, true);
    ctx.lineTo(cx + tubeHalf, tubeTop);
    ctx.closePath();
    ctx.fill();

    // ---- 시험관 속 왁스(고체는 위, 녹은 액체는 아래부터) ----
    const inL = cx - tubeHalf + 3;
    const inR = cx + tubeHalf - 3;
    const waxH = mass === 1 ? 46 : 82;
    const waxBot = tubeBot - 4;
    const liqH = waxH * melt;
    const liqTop = waxBot - liqH;
    const solTop = waxBot - waxH;
    // 액체(투명 — 아래)
    if (liqH > 0.5) {
      const lg = ctx.createLinearGradient(inL, 0, inR, 0);
      lg.addColorStop(0, "rgba(255,216,150,.34)");
      lg.addColorStop(0.5, "rgba(255,216,150,.16)");
      lg.addColorStop(1, "rgba(255,216,150,.28)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(inL, liqTop);
      ctx.lineTo(inL, waxBot - (tubeHalf - 3));
      ctx.arc(cx, waxBot - (tubeHalf - 3), tubeHalf - 3, Math.PI, 0, true);
      ctx.lineTo(inR, liqTop);
      ctx.closePath();
      ctx.fill();
    }
    // 고체(흰 왁스 — 위)
    if (melt < 0.995) {
      const sg = ctx.createLinearGradient(inL, 0, inR, 0);
      sg.addColorStop(0, "rgba(255,250,240,.95)");
      sg.addColorStop(0.45, "rgba(240,230,210,.9)");
      sg.addColorStop(1, "rgba(216,202,172,.88)");
      ctx.fillStyle = sg;
      const wig = zone === "melt" ? Math.sin(tMs / 210) * 1.4 : 0;
      if (melt < 0.02) {
        // 통짜 고체(바닥 라운드)
        ctx.beginPath();
        ctx.moveTo(inL, solTop);
        ctx.lineTo(inL, waxBot - (tubeHalf - 3));
        ctx.arc(cx, waxBot - (tubeHalf - 3), tubeHalf - 3, Math.PI, 0, true);
        ctx.lineTo(inR, solTop);
        ctx.closePath();
        ctx.fill();
      } else {
        rr(ctx, inL, solTop, inR - inL, Math.max(2, liqTop - solTop + wig), 3);
        ctx.fill();
      }
      // 좌상단 키라이트 + 최암색 윤곽
      ctx.strokeStyle = "rgba(255,255,255,.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(inL + 2.5, solTop + 3);
      ctx.lineTo(inL + 2.5, Math.max(solTop + 6, liqTop - 4));
      ctx.stroke();
      ctx.strokeStyle = "rgba(140,118,86,.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(inL, solTop);
      ctx.lineTo(inR, solTop);
      ctx.stroke();
    }
    // 녹는 경계(고체+액체 공존선)
    if (zone === "melt") {
      ctx.strokeStyle = "rgba(255,236,200,.75)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let px = inL; px <= inR; px += 4) {
        const y = liqTop + Math.sin(px / 5 + tMs / 160) * 1.3;
        if (px === inL) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    }

    // 시험관 벽(유리 스트로크 — 내용물 위에)
    ctx.strokeStyle = glassStrokeStyle(ctx, tubeTop, tubeBot);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - tubeHalf, tubeTop);
    ctx.lineTo(cx - tubeHalf, tubeBot - tubeHalf);
    ctx.arc(cx, tubeBot - tubeHalf, tubeHalf, Math.PI, 0, true);
    ctx.lineTo(cx + tubeHalf, tubeTop);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - tubeHalf + 4.5, tubeTop + 12);
    ctx.lineTo(cx - tubeHalf + 4.5, tubeBot - 40);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,240,255,.9)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - tubeHalf - 3, tubeTop);
    ctx.lineTo(cx - tubeHalf + 6, tubeTop);
    ctx.moveTo(cx + tubeHalf - 6, tubeTop);
    ctx.lineTo(cx + tubeHalf + 3, tubeTop);
    ctx.stroke();

    // 온도계(눈금 대신 붉은 기둥 — 플래토에서 멈춘 게 보인다)
    const thX = cx + 7;
    ctx.strokeStyle = "rgba(235,245,255,.55)";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(thX, 30);
    ctx.lineTo(thX, 182);
    ctx.stroke();
    const colTop = 182 - ((clamp(T, T0, 80) - T0) / 60) * 128;
    ctx.strokeStyle = "#F25757";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(thX, 184);
    ctx.lineTo(thX, colTop);
    ctx.stroke();
    ctx.fillStyle = "#F25757";
    ctx.beginPath();
    ctx.arc(thX, 186, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.arc(thX - 1.2, 184.8, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // "녹는 중" 배지(캔버스 칩)
    if (zone === "melt") {
      const chipX = cx + 30;
      const chipY = 66;
      ctx.fillStyle = "rgba(255,143,176,.14)";
      rr(ctx, chipX, chipY, 122, 22, 11);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,143,176,.5)";
      ctx.lineWidth = 1.2;
      rr(ctx, chipX, chipY, 122, 22, 11);
      ctx.stroke();
      ctx.fillStyle = "#FFD9E6";
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("녹는 중 — 고체+액체", chipX + 11, chipY + 14.5);
    }
  }

  function drawCurve(ctx: CanvasRenderingContext2D, pts: RunPt[], rgb: string, alpha: number, lw: number, xOf: (t: number) => number, yOf: (T: number) => number): void {
    if (pts.length < 2) return;
    ctx.strokeStyle = `rgba(${rgb},${alpha})`;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(xOf(pts[0].t), yOf(pts[0].T));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(xOf(pts[i].t), yOf(pts[i].T));
    ctx.stroke();
  }

  function drawGraph(ctx: CanvasRenderingContext2D, tMs: number): void {
    const gx0 = 46;
    const gx1 = W - 16;
    const gy0 = LABH + 26;
    const gy1 = CVH - 24;
    const xOf = (t: number): number => gx0 + (clamp(t, 0, X_MAX) / X_MAX) * (gx1 - gx0);
    const yOf = (v: number): number => gy1 - ((v - T0) / 60) * (gy1 - gy0);

    // 축 + 온도 눈금
    ctx.strokeStyle = "rgba(148,168,196,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 6);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    ctx.font = "600 10px Pretendard, sans-serif";
    for (const n of [20, 40, 60, 80]) {
      ctx.strokeStyle = "rgba(148,168,196,.14)";
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(n));
      ctx.lineTo(gx1, yOf(n));
      ctx.stroke();
      ctx.fillStyle = "rgba(196,212,232,.75)";
      ctx.textAlign = "right";
      ctx.fillText(String(n), gx0 - 6, yOf(n) + 3.5);
    }
    // 시간 눈금 틱(5초 간격)
    ctx.strokeStyle = "rgba(148,168,196,.35)";
    for (const t of [5, 10, 15]) {
      ctx.beginPath();
      ctx.moveTo(xOf(t), gy1);
      ctx.lineTo(xOf(t), gy1 + 3.5);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(196,212,232,.7)";
    ctx.textAlign = "left";
    ctx.fillText("온도(℃)", gx0 + 4, gy0 - 10);
    ctx.textAlign = "right";
    ctx.fillText("가열 시간 →", gx1, gy1 + 13);

    // 발견한 녹는점 안내선
    for (const key of ["la", "pa"] as Sub[]) {
      if (!goals.has(key)) continue;
      const y = yOf(MP[key]);
      ctx.strokeStyle = `rgba(${COL[key]},.4)`;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(gx0, y);
      ctx.lineTo(gx1, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(${COL[key]},.95)`;
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${MP[key]}℃`, gx1 - 2, y - 5);
    }

    // 누적(완료) 곡선 — 흐린 색 + 양 라벨
    ctx.font = "700 10px Pretendard, sans-serif";
    for (const a of archived) {
      drawCurve(ctx, a.pts, COL[a.sub], 0.42, a.mass === 1 ? 2.2 : 3.2, xOf, yOf);
      const last = a.pts[a.pts.length - 1];
      if (last) {
        ctx.fillStyle = `rgba(${COL[a.sub]},.8)`;
        ctx.textAlign = "left";
        ctx.fillText(`${a.mass} g`, xOf(last.t) + 4, yOf(last.T) + 3);
      }
    }

    // 진행 중 곡선(밝게) + 발광 현재점
    drawCurve(ctx, samples, COL[sub], 0.95, 2.6, xOf, yOf);
    if (samples.length) {
      const last = samples[samples.length - 1];
      const px = xOf(last.t);
      const py = yOf(last.T);
      const pulse = 4 + Math.sin(tMs / 260) * 1;
      ctx.fillStyle = `rgba(${COL[sub]},.25)`;
      ctx.beginPath();
      ctx.arc(px, py, pulse + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgb(${COL[sub]})`;
      ctx.beginPath();
      ctx.arc(px, py, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 범례(우상단)
    ctx.textAlign = "right";
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(255,143,176,.9)";
    ctx.fillText("● 로르산", gx1 - 58, gy0 + 4);
    ctx.fillStyle = "rgba(164,148,255,.9)";
    ctx.fillText("● 팔미트산", gx1, gy0 + 4);
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const dtSec = (dt * 16.7) / 1000;

    if (running) {
      tSec += dtSec;
      const mp = MP[sub];
      const rate = RATE_1G / mass;
      if (zone === "solid") {
        T = Math.min(mp, T + rate * dtSec);
        if (T >= mp - 1e-6) {
          zone = "melt";
          haptic(HAPTIC.cross);
          toast(`${mp}℃ — 온도가 멈췄어요! 녹는 중`);
          if (!finished)
            helper.innerHTML =
              "가열 중인데 온도가 <b>꼼짝도 안 해요</b>. 열이 전부 <b>고체→액체 변화</b>에 쓰이는 중이거든요. 이 온도가 바로 <b>녹는점</b>!";
        }
      } else if (zone === "melt") {
        T = mp;
        melt = Math.min(1, melt + dtSec / (PLATEAU_1G * mass));
        if (!observed && melt >= 0.5) {
          observed = true;
          seen[sub].add(mass);
          if (sub === "la") collect("la", "43.8℃!", "로르산의 녹는점 — 43.8℃!");
          else collect("pa", "62.5℃!", "물질이 다르면 녹는점도 달라요 — 62.5℃!");
          if (seen.la.size === 2 || seen.pa.size === 2)
            collect("amt", "그대로!", "양을 바꿔도 플래토 온도는 그대로!");
        }
        if (melt >= 1) {
          zone = "liquid";
          toast("다 녹았어요 — 온도가 다시 올라요");
        }
      } else {
        T += rate * dtSec;
        if (T >= MP[sub] + 12 || tSec >= X_MAX) finishRun();
      }
      // 샘플 기록
      const last = samples[samples.length - 1];
      if (!last || tSec - last.t >= 0.12) samples.push({ t: tSec, T });
      setHud();
    }

    drawLab(ctx, tMs);
    drawGraph(ctx, tMs);

    const txt = T.toFixed(1);
    if (txt !== shownT) {
      shownT = txt;
      readVal.textContent = txt;
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

  api.setCTA("가열해서 녹는점을 찾아보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    btnLa.removeEventListener("click", onLa);
    btnPa.removeEventListener("click", onPa);
    btn1g.removeEventListener("click", on1g);
    btn2g.removeEventListener("click", on2g);
    heatBtn.removeEventListener("click", onHeat);
  };
};
