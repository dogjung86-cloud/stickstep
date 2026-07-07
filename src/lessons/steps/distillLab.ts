// distillLab — 증류 랩(중2 I 물질의 특성). 교과서 탐구(물+에탄올 혼합물 분리)의 조작판:
//   · 가지 달린 플라스크 + 끓임쪽 + 가열 장치 → 가지관 → 얼음물 비커 속 시험관 (가)(나)(다)(라)
//   · 가열하면 온도가 오르다 78℃에서 멈춤(에탄올) → 다시 오르다 100℃에서 멈춤(물)
//   · 구간이 바뀔 때 "시험관 바꾸기" 버튼이 반짝 — 제때 탭해서 받는 시험관을 교체
//   · 증류가 끝나면 (나)는 냄새로, (라)는 염화 코발트 종이로 정체를 확인
// 목표: ① 78℃ 플래토 ② 100℃ 플래토 ③ 정체 확인(냄새+코발트 종이).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawFlame } from "../../ui/thermo";
import { glassFlask, glassVessel, glassStrokeStyle, liquidFill, contactShadow, softGlow, windStrokeStyle } from "../../ui/labProps";
import { colFor } from "../../renderers/palette";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DistillStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 436;
const LABH = 254;
// 타임라인(초): 상승1 → 78℃ 플래토(에탄올) → 상승2 → 100℃ 플래토(물)
const D0 = 4.5;
const D1 = 5;
const D2 = 3;
const D3 = 5;
const TOTAL = D0 + D1 + D2 + D3;
const TUBES = ["가", "나", "다", "라"] as const;

interface Vapor {
  p: number; // 경로 진행 0..1
  sp: number;
  kind: "eth" | "wat";
}
interface Drop {
  y: number;
  kind: "eth" | "wat";
}
interface Pt {
  x: number;
  y: number;
}

function tempAt(t: number): { T: number; seg: number } {
  if (t < D0) return { T: 20 + 58 * (t / D0), seg: 0 };
  if (t < D0 + D1) return { T: 78, seg: 1 };
  if (t < D0 + D1 + D2) return { T: 78 + 22 * ((t - D0 - D1) / D2), seg: 2 };
  return { T: 100, seg: 3 };
}

export const distillLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DistillStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px`,
    attrs: { role: "img", "aria-label": "증류 장치와 실시간 온도-시간 그래프. 아래 버튼으로 조작해요." },
  });
  const tubePill = el("span", { text: "(가)에 받는 중" });
  const tubeDot = el("span", { class: "pdot", style: "background:#FF8FB0" });
  const readVal = el("span", { text: "20" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "가지 달린 플라스크 — 가열을 시작해 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, tubeDot, tubePill),
      el("div", { class: "tempread" }, readVal, el("small", { text: "°C" })),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "e78" } }, el("b", { text: "첫 번째 평평" }), el("span", { text: "몇 ℃?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "w100" } }, el("b", { text: "두 번째 평평" }), el("span", { text: "몇 ℃?" })),
    el("div", { class: "pn-badge chem", dataset: { g: "id" } }, el("b", { text: "정체 확인" }), el("span", { text: "냄새·종이" })),
  );

  const btnMain = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "가열 시작" }));
  const btnB = el(
    "button",
    { class: "swapbtn", style: "display:none", attrs: { type: "button" } },
    el("span", { text: "(라) 코발트 종이 대기" }),
  );
  const ctrls = el("div", { class: "gp-controls" }, btnMain, btnB);

  const helper = el("div", {
    class: "helper",
    html: "물과 에탄올을 섞은 <b>혼합물</b>이에요. 가열하면서 온도 곡선을 보고, 구간이 바뀌면 <b>시험관을 제때 바꿔</b> 주세요.",
  });
  host.append(goalChips, stage, ctrls, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let phase: "idle" | "run" | "verify" = "idle";
  let tSec = 0;
  let T = 20;
  let segIdx = 0;
  let cur = 0; // 지금 받는 시험관
  let curAnim = 0;
  const tubes = TUBES.map(() => ({ eth: 0, wat: 0 }));
  const vapors: Vapor[] = [];
  const drops: Drop[] = [];
  let vapAcc = 0;
  let condCnt = 0;
  let wrongCnt = 0;
  const samples: { t: number; T: number }[] = [];
  let platMs1 = 0;
  let platMs2 = 0;
  let smellDone = false;
  let cobaltDone = false;
  let smellT = 0; // 냄새 연출 잔여(1→0)
  let cobaltT = 0; // 코발트 종이 진행(0→1)
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let shownT = "";

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
        "끓는점이 낮은 에탄올이 먼저 기화해 나와요 — 이렇게 끓는점 차로 분리하는 방법이 <b>증류</b>예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function mainLabel(txt: string): void {
    (btnMain.firstChild as HTMLElement).textContent = txt;
  }
  function updateRunLabel(): void {
    mainLabel(cur < 3 ? `시험관 바꾸기 → (${TUBES[cur + 1]})` : "(라)에 받는 중");
  }

  // ---- 버튼 ----
  const onMain = (): void => {
    if (phase === "idle") {
      phase = "run";
      tSec = 0;
      haptic(HAPTIC.tap);
      updateRunLabel();
      capEl.style.transition = "opacity .4s";
      capEl.style.opacity = "0";
      toast("가열 시작 — 온도계를 지켜보세요");
      return;
    }
    if (phase === "run") {
      if (cur >= 3) {
        toast("마지막 시험관이에요");
        return;
      }
      cur += 1;
      haptic(HAPTIC.tap);
      updateRunLabel();
      tubePill.textContent = `(${TUBES[cur]})에 받는 중`;
      if (cur === segIdx) {
        btnMain.classList.remove("pulse");
        toast(`좋아요 — (${TUBES[cur]})에 받아요`);
      } else if (cur > segIdx) {
        toast(`조금 일찍 바꿨어요 — 아직 (${TUBES[segIdx]}) 구간`);
      }
      return;
    }
    // verify: (나) 냄새
    if (!smellDone) {
      smellDone = true;
      smellT = 1;
      haptic(HAPTIC.tap);
      btnMain.classList.add("done-static");
      mainLabel("(나) 알코올 냄새!");
      toast("손으로 바람을 일으켜 킁킁 — 알코올 냄새!");
      if (!finished)
        helper.innerHTML = "(나)에 모인 액체는 <b>에탄올</b> — 78℃ 구간에서 나온 기체가 얼음물에 식어 액화된 거예요.";
      if (cobaltDone) collect("id", "확인 완료!", "(나) 에탄올 · (라) 물 — 정체 확인!");
    }
  };
  const onB = (): void => {
    if (phase !== "verify" || cobaltDone) return;
    cobaltDone = true;
    haptic(HAPTIC.tap);
    btnB.classList.add("done-static");
    (btnB.firstChild as HTMLElement).textContent = "(라) 푸른 종이가 붉게!";
    toast("염화 코발트 종이가 붉게 — 물이에요!");
    if (!finished) helper.innerHTML = "(라)의 액체에 푸른 염화 코발트 종이가 <b>붉게</b> 변했어요 — 물이라는 증거!";
    if (smellDone) collect("id", "확인 완료!", "(나) 에탄올 · (라) 물 — 정체 확인!");
  };
  btnMain.addEventListener("click", onMain);
  btnB.addEventListener("click", onB);

  // 시험관 좌표(검증 탭 판정용)
  const outletX = (): number => W * 0.7;
  const tubeX = (i: number): number => outletX() + (i - curAnim) * 22;
  const onCanvasDown = (e: PointerEvent): void => {
    if (phase !== "verify") return;
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (py < 138 || py > 240) return;
    if (Math.abs(px - tubeX(1)) < 13) onMain();
    else if (Math.abs(px - tubeX(3)) < 13) onB();
  };
  canvas.addEventListener("pointerdown", onCanvasDown);

  // ---- 구간 전환 ----
  function onSegment(seg: number): void {
    const need = cur !== seg;
    if (seg === 1) {
      haptic(HAPTIC.cross);
      toast(need ? "78℃ 구간! 시험관 바꾸기 → (나)" : "78℃ — (나)에 받는 중");
      if (!finished)
        helper.innerHTML =
          "온도가 <b>78℃에서 멈췄어요</b> — 에탄올의 끓는점! 지금 나오는 기체는 거의 다 에탄올이에요.";
    } else if (seg === 2) {
      toast(need ? "온도가 다시 올라요 — (다)로!" : "온도가 다시 올라요");
      if (!finished) helper.innerHTML = "에탄올이 거의 다 나갔어요 — 온도가 <b>다시 올라가요</b>.";
    } else if (seg === 3) {
      haptic(HAPTIC.cross);
      toast(need ? "100℃ 구간! 시험관 바꾸기 → (라)" : "100℃ — (라)에 받는 중");
      if (!finished) helper.innerHTML = "이번엔 <b>100℃에서 멈춤</b> — 물이 끓어서 나오는 중이에요!";
    }
    if (need) btnMain.classList.add("pulse");
    else btnMain.classList.remove("pulse");
  }

  function endRun(): void {
    phase = "verify";
    btnMain.classList.remove("pulse");
    mainLabel("(나) 냄새 맡기");
    btnB.style.display = "";
    canvas.style.cursor = "pointer";
    tubePill.textContent = "증류 완료";
    capEl.textContent = "시험관 (나)와 (라)를 직접 탭해도 돼요";
    capEl.style.opacity = "1";
    toast("증류 완료! 시험관 속 정체를 확인해요");
    if (!finished) helper.innerHTML = "받아 낸 액체의 <b>정체를 확인</b>할 차례 — (나)는 냄새로, (라)는 염화 코발트 종이로!";
  }

  // ---- 그리기 ----
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

  function flaskLevel(): number {
    // 168 → 플래토1 동안 180 → 플래토2 동안 190
    if (tSec <= D0) return 168;
    if (tSec <= D0 + D1) return 168 + 12 * ((tSec - D0) / D1);
    if (tSec <= D0 + D1 + D2) return 180;
    return 180 + 10 * Math.min(1, (tSec - D0 - D1 - D2) / D3);
  }

  function vaporPath(fx: number, levelY: number): Pt[] {
    return [
      { x: fx, y: levelY - 8 },
      { x: fx, y: 58 },
      { x: fx + 26, y: 66 },
      { x: outletX() - 12, y: 128 },
      { x: outletX(), y: 140 },
    ];
  }
  function pathPos(pts: Pt[], f: number): Pt {
    const lens: number[] = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      lens.push(l);
      total += l;
    }
    let d = clamp(f, 0, 1) * total;
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i]) {
        const k = lens[i] ? d / lens[i] : 0;
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
      }
      d -= lens[i];
    }
    return pts[pts.length - 1];
  }

  function drawLab(ctx: CanvasRenderingContext2D, tMs: number): void {
    const fx = W * 0.3;
    const ox = outletX();
    const bx0 = W * 0.5;
    const bx1 = W - 12;
    const heating = phase === "run";
    const levelY = flaskLevel();

    // 버너 + 불꽃
    contactShadow(ctx, fx, 250, 74, 0.22);
    ctx.strokeStyle = "rgba(148,168,196,.5)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(fx - 34, 248);
    ctx.lineTo(fx - 20, 216);
    ctx.moveTo(fx + 34, 248);
    ctx.lineTo(fx + 20, 216);
    ctx.stroke();
    if (heating) {
      softGlow(ctx, fx, 216, 58, "255,150,80", 0.12);
      drawFlame(ctx, fx, 246, 28, tMs);
    }

    // 혼합물(플라스크 속) — 목~몸통 폭 보간 사다리꼴
    const wAt = (y: number): number => 12 + 44 * clamp((y - 118) / 96, 0, 1);
    const wl = wAt(levelY);
    ctx.fillStyle = "rgba(150,190,255,.14)";
    ctx.beginPath();
    ctx.moveTo(fx - wl, levelY);
    ctx.lineTo(fx - 48, 204);
    ctx.lineTo(fx - 40, 209);
    ctx.lineTo(fx + 40, 209);
    ctx.lineTo(fx + 48, 204);
    ctx.lineTo(fx + wl, levelY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(226,242,255,.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fx - wl + 2, levelY);
    ctx.lineTo(fx + wl - 2, levelY);
    ctx.stroke();
    // 끓임쪽 + 끓는 기포
    ctx.fillStyle = "rgba(232,214,180,.85)";
    for (const [dx, dy] of [[-14, 205], [2, 207], [16, 204]] as [number, number][]) {
      ctx.beginPath();
      ctx.arc(fx + dx, dy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (heating && (segIdx === 1 || segIdx === 3)) {
      ctx.fillStyle = "rgba(226,242,255,.4)";
      for (let i = 0; i < 7; i++) {
        const ph = (tMs / 700 + i * 0.31) % 1;
        const bxx = fx + Math.sin(i * 2.1) * 26;
        const byy = 204 - ph * (204 - levelY - 6);
        ctx.beginPath();
        ctx.arc(bxx, byy, 1.3 + (i % 3) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 플라스크(유리) + 가지관
    glassFlask(ctx, fx, 24, 40, 118, 112, 214);
    const arm = [
      { x: fx + 10, y: 58 },
      { x: fx + 42, y: 74 },
      { x: ox - 12, y: 128 },
      { x: ox, y: 142 },
    ];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(148,180,222,.32)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(arm[0].x, arm[0].y);
    for (let i = 1; i < arm.length; i++) ctx.lineTo(arm[i].x, arm[i].y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(13,26,44,.85)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(arm[0].x, arm[0].y);
    for (let i = 1; i < arm.length; i++) ctx.lineTo(arm[i].x, arm[i].y);
    ctx.stroke();

    // 고무마개 + 온도계(구부는 가지관 높이 — 기체 온도를 잰다)
    const stG = ctx.createLinearGradient(fx - 13, 0, fx + 13, 0);
    stG.addColorStop(0, "#E2A878");
    stG.addColorStop(0.55, "#C88A5A");
    stG.addColorStop(1, "#A5673F");
    ctx.fillStyle = stG;
    rr(ctx, fx - 13, 30, 26, 13, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(110,66,38,.8)";
    ctx.lineWidth = 1.4;
    rr(ctx, fx - 13, 30, 26, 13, 4);
    ctx.stroke();
    ctx.strokeStyle = "rgba(235,245,255,.55)";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(fx, 14);
    ctx.lineTo(fx, 58);
    ctx.stroke();
    const colTop = 56 - (clamp(T, 20, 110) - 20) / 90 * 34;
    ctx.strokeStyle = "#F25757";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(fx, 58);
    ctx.lineTo(fx, colTop);
    ctx.stroke();
    ctx.fillStyle = "#F25757";
    ctx.beginPath();
    ctx.arc(fx, 59, 3.6, 0, Math.PI * 2);
    ctx.fill();

    // 얼음물 비커 + 시험관 레일
    contactShadow(ctx, (bx0 + bx1) / 2, 250, (bx1 - bx0) * 0.55, 0.22);
    glassVessel(ctx, { x0: bx0, y0: 152, x1: bx1, y1: 246 });
    liquidFill(ctx, bx0 + 3, 172, bx1 - 3, 243, "120,180,240", 0.18);
    // 얼음 조각
    ctx.fillStyle = "rgba(235,246,255,.42)";
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1.1;
    for (const [ix, iy, iw] of [[bx0 + 12, 166, 17], [bx0 + 42, 170, 14], [bx1 - 34, 167, 16]] as [number, number, number][]) {
      rr(ctx, ix, iy, iw, 12, 4);
      ctx.fill();
      rr(ctx, ix, iy, iw, 12, 4);
      ctx.stroke();
    }
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(180,210,245,.8)";
    ctx.fillText("얼음물", bx0 + 26, 190);

    // 시험관 4개
    for (let i = 0; i < 4; i++) {
      const tx = tubeX(i);
      if (tx < bx0 + 10 || tx > bx1 - 10) continue;
      const half = 7;
      const top = 160;
      const bot = 222;
      const tb = tubes[i];
      const vol = Math.min(0.95, tb.eth + tb.wat);
      if (vol > 0.02) {
        const ratio = tb.eth + tb.wat > 0 ? tb.wat / (tb.eth + tb.wat) : 0;
        const cr = Math.round(205 + (110 - 205) * ratio);
        const cg = Math.round(215 + (170 - 215) * ratio);
        const cb = Math.round(255 + (240 - 255) * ratio);
        const fh = vol * 44;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},.4)`;
        ctx.beginPath();
        ctx.moveTo(tx - half + 2, bot - 4 - fh);
        ctx.lineTo(tx - half + 2, bot - half - 2);
        ctx.arc(tx, bot - half - 2, half - 2, Math.PI, 0, true);
        ctx.lineTo(tx + half - 2, bot - 4 - fh);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(240,250,255,.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx - half + 2, bot - 4 - fh);
        ctx.lineTo(tx + half - 2, bot - 4 - fh);
        ctx.stroke();
      }
      ctx.strokeStyle = glassStrokeStyle(ctx, top, bot);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tx - half, top);
      ctx.lineTo(tx - half, bot - half);
      ctx.arc(tx, bot - half, half, Math.PI, 0, true);
      ctx.lineTo(tx + half, top);
      ctx.stroke();
      ctx.fillStyle = i === cur && phase === "run" ? "#FFD9E6" : "rgba(200,220,245,.75)";
      ctx.font = "700 9.5px Pretendard, sans-serif";
      ctx.fillText(`(${TUBES[i]})`, tx, 236);
    }
    // 지금 받는 시험관 표시(화살촉)
    if (phase === "run") {
      const tx = tubeX(cur);
      ctx.fillStyle = "rgba(255,143,176,.85)";
      ctx.beginPath();
      ctx.moveTo(tx - 5, 148);
      ctx.lineTo(tx + 5, 148);
      ctx.lineTo(tx, 155);
      ctx.closePath();
      ctx.fill();
      // 늦었을 때: 받아야 할 시험관에 주황 링
      if (cur !== segIdx) {
        const ex = tubeX(segIdx);
        ctx.strokeStyle = `rgba(255,194,77,${0.35 + 0.3 * Math.sin(tMs / 170)})`;
        ctx.lineWidth = 2;
        rr(ctx, ex - 11, 156, 22, 70, 8);
        ctx.stroke();
      }
    }

    // 증기 입자(발광 점)
    const path = vaporPath(fx, levelY);
    for (const v of vapors) {
      const p = pathPos(path, v.p);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
      g.addColorStop(0, "rgba(215,232,255,.6)");
      g.addColorStop(1, "rgba(215,232,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(232,242,255,.9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // 응축 방울
    ctx.fillStyle = "rgba(190,215,255,.9)";
    for (const d of drops) {
      ctx.beginPath();
      ctx.arc(ox, d.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 냄새 연출((나) 위 손부채 스트릭)
    if (smellT > 0.02) {
      const tx = tubeX(1);
      ctx.strokeStyle = windStrokeStyle(ctx, tx - 30, tx + 30, "220,235,255", 0.55 * smellT);
      ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) {
        const lift = (1 - smellT) * 26 + k * 9;
        ctx.beginPath();
        ctx.moveTo(tx - 16, 150 - lift);
        ctx.bezierCurveTo(tx - 6, 144 - lift, tx + 4, 154 - lift, tx + 14, 146 - lift);
        ctx.stroke();
      }
    }
    // 염화 코발트 종이((라) — 푸른색 → 붉은색)
    if (cobaltDone || cobaltT > 0) {
      const tx = tubeX(3);
      const dip = cobaltT * 26;
      const cr = Math.round(77 + (224 - 77) * cobaltT);
      const cg = Math.round(123 + (71 - 123) * cobaltT);
      const cb = Math.round(232 + (91 - 232) * cobaltT);
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      rr(ctx, tx - 3.5, 130 + dip, 7, 24, 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,32,54,.55)";
      ctx.lineWidth = 1.2;
      rr(ctx, tx - 3.5, 130 + dip, 7, 24, 2);
      ctx.stroke();
    }
  }

  function drawGraph(ctx: CanvasRenderingContext2D): void {
    const gx0 = 46;
    const gx1 = W - 16;
    const gy0 = LABH + 28;
    const gy1 = CVH - 24;
    const xOf = (t: number): number => gx0 + clamp(t / TOTAL, 0, 1) * (gx1 - gx0);
    const yOf = (v: number): number => gy1 - ((v - 20) / 90) * (gy1 - gy0);

    ctx.strokeStyle = "rgba(148,168,196,.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx0, gy0 - 6);
    ctx.lineTo(gx0, gy1);
    ctx.lineTo(gx1, gy1);
    ctx.stroke();
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.textAlign = "right";
    for (const n of [20, 60, 100]) {
      ctx.strokeStyle = "rgba(148,168,196,.14)";
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(n));
      ctx.lineTo(gx1, yOf(n));
      ctx.stroke();
      ctx.fillStyle = "rgba(196,212,232,.75)";
      ctx.fillText(String(n), gx0 - 6, yOf(n) + 3.5);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(196,212,232,.7)";
    ctx.fillText("온도(℃)", gx0 + 4, gy0 - 10);
    ctx.textAlign = "right";
    ctx.fillText("가열 시간 →", gx1, gy1 + 13);

    // 발견한 끓는점 안내선
    const guides: [string, number, string, string][] = [
      ["e78", 78, "78℃ — 에탄올", "255,143,176"],
      ["w100", 100, "100℃ — 물", "120,180,240"],
    ];
    for (const [gid, tv, label, rgb] of guides) {
      if (!goals.has(gid)) continue;
      ctx.strokeStyle = `rgba(${rgb},.4)`;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(gx0, yOf(tv));
      ctx.lineTo(gx1, yOf(tv));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(${rgb},.95)`;
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.fillText(label, gx1 - 2, yOf(tv) - 5);
    }

    // 곡선(그 지점 온도색)
    if (samples.length > 1) {
      ctx.lineCap = "round";
      for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1];
        const b = samples[i];
        ctx.strokeStyle = colFor(b.T, 62, 0.95);
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(xOf(a.t), yOf(a.T));
        ctx.lineTo(xOf(b.t), yOf(b.T));
        ctx.stroke();
      }
      const last = samples[samples.length - 1];
      const px = xOf(last.t);
      const py = yOf(last.T);
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 13);
      glow.addColorStop(0, colFor(last.T, 62, 0.5));
      glow.addColorStop(1, colFor(last.T, 62, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colFor(last.T, 70, 1);
      ctx.beginPath();
      ctx.arc(px, py, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const dtSec = (dt * 16.7) / 1000;

    curAnim += (cur - curAnim) * Math.min(1, 0.16 * dt);

    if (phase === "run") {
      tSec += dtSec;
      const m = tempAt(Math.min(tSec, TOTAL));
      T = m.T;
      if (m.seg !== segIdx) {
        segIdx = m.seg;
        onSegment(segIdx);
      }
      // 플래토 관찰 목표
      if (segIdx === 1) {
        platMs1 += dtSec * 1000;
        if (platMs1 > 1200) collect("e78", "78℃!", "첫 번째 평평 — 에탄올의 끓는점 78℃!");
      }
      if (segIdx === 3) {
        platMs2 += dtSec * 1000;
        if (platMs2 > 1200) collect("w100", "100℃!", "두 번째 평평 — 물의 끓는점 100℃!");
      }
      // 증기 발생(플래토 구간)
      if (segIdx === 1 || segIdx === 3) {
        vapAcc += dtSec * 5;
        while (vapAcc >= 1) {
          vapAcc -= 1;
          vapors.push({ p: 0, sp: 0.5 + Math.random() * 0.22, kind: segIdx === 1 ? "eth" : "wat" });
        }
      }
      // 샘플
      const last = samples[samples.length - 1];
      if (!last || tSec - last.t >= 0.1) samples.push({ t: Math.min(tSec, TOTAL), T });
      if (tSec >= TOTAL) endRun();
    }

    // 증기 이동 → 응축 → 방울
    for (let i = vapors.length - 1; i >= 0; i--) {
      const v = vapors[i];
      v.p += v.sp * dtSec;
      if (v.p >= 1) {
        vapors.splice(i, 1);
        condCnt += 1;
        if (condCnt >= 2) {
          condCnt = 0;
          drops.push({ y: 144, kind: v.kind });
        }
      }
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.y += 300 * dtSec;
      if (d.y >= 166) {
        drops.splice(i, 1);
        const tb = tubes[cur];
        if (d.kind === "eth") tb.eth = Math.min(0.95, tb.eth + 0.13);
        else tb.wat = Math.min(0.95, tb.wat + 0.13);
        // 잘못된 시험관에 받는 중 — 몇 방울마다 안내
        if (phase === "run" && cur !== segIdx) {
          wrongCnt += 1;
          if (wrongCnt >= 3) {
            wrongCnt = -4;
            toast(`앗 — 지금은 (${TUBES[segIdx]})에 받아야 해요!`);
          }
        }
      }
    }
    if (smellT > 0) smellT = Math.max(0, smellT - dtSec / 1.7);
    if (cobaltDone && cobaltT < 1) cobaltT = Math.min(1, cobaltT + dtSec / 0.9);

    drawLab(ctx, tMs);
    drawGraph(ctx);

    const txt = String(Math.round(T));
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

  api.setCTA("증류를 끝까지 진행해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onCanvasDown);
    btnMain.removeEventListener("click", onMain);
    btnB.removeEventListener("click", onB);
  };
};
