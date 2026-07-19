// seasonLab — 남반구 계절 역전 랩(사회 Ⅵ L3). Ⅰ latSunLab(위도×햇빛)의 직계 완결편이자
// Ⅱ 계절풍·Ⅲ 편서풍·Ⅳ 비 띠·Ⅴ 고도 드래그 계보의 이 단원 시스템성 소재.
//   · 교과서 근거(두 책 공통): 비상 110쪽 도입 만화("겨울 방학인데 배경이 다 여름")+통합적으로
//     보기(+과학: 자전축이 기울어진 채 공전) · 비상 112쪽 밀 수확 시기 활동 · 미래엔 115쪽
//     "남반구라 밀을 12~2월에 수확 → 북반구 수출에 유리".
//   · 시각 언어는 latSunLab 그대로: 오른쪽에서 평행 광선, 남색 지구 원판, "같은 넓이가 받는
//     햇빛 %" 게이지. 새 조작 = **가로 드래그 = 공전 스크럽**(12월 ↔ 6월, 연속 조작 노선).
//   · 물리(정직한 투영): 지축은 우주에 고정 — 태양을 화면 오른쪽에 고정하면 공전에 따라
//     지축의 화면 기울기 α = −23.44°·cos(공전 위상 p)로 변한다(p 0=12월 → π=6월). 태양 직하
//     위도 δ = α. 도시(위도 φ)의 림 각 = φ−δ, 햇빛 게이지 = cos(φ−δ) — latSunLab과 같은 식.
//     서울(37.5°N) 12월 48% ↔ 시드니(33.9°S) 12월 98%: 옷차림·게이지가 거울처럼 뒤집힌다.
//   · 목표: ① 12월 관찰(남반구 여름) ② 6월 관찰(반전) ③ 판정(msn 2지선다 — "12월엔 태양과
//     가까워져서"가 대표 오개념. 실제론 1월에 가장 가깝다는 교정이 심장).
//   · 원인 서술은 사회 깊이(모형 수준 — '모형' 캡션, 정량 공식 금지·기울기 수치 미표기).
// 연출: 위상은 입력 추종(유체 아님) · 눈발/땀방울 등 장식 낙하는 20px/s 이하.
import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawStickman, poseStand } from "../../ui/stick";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SeasonStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 396;
const R = 128; // 지구 반지름(px)
const TILT = 23.44; // 지축 기울기(°) — 계산용(화면 표기는 안 함)
const LAT_N = 37.5; // 서울
const LAT_S = -33.9; // 시드니
const P_START = Math.PI / 2; // 시작 위상 = 3월(중립 — 어느 목표에도 안 걸림)

const rad = (d: number): number => (d * Math.PI) / 180;
type Pt = { x: number; y: number };
const lp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function seg(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** 위상 p(0=12월 ~ π=6월) → 달 이름(12·1·2·3·4·5·6월). */
function monthOf(p: number): string {
  const i = Math.round((p / Math.PI) * 6);
  return i === 0 ? "12월" : `${i}월`;
}

export const seasonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SeasonStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "dec" } }, el("b", { text: "12월" }), el("span", { text: "남쪽은 여름" })),
    el("div", { class: "pn-badge world", dataset: { g: "jun" } }, el("b", { text: "6월" }), el("span", { text: "반전!" })),
    el("div", { class: "pn-badge world", dataset: { g: "why" } }, el("b", { text: "계절의 비밀" }), el("span", { text: "판정" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "기울어진 지구 위에 <b>서울</b>과 <b>시드니</b>가 서 있어요. 화면을 <b>좌우로 끌어</b> 지구를 공전시키며(12월 ↔ 6월) 두 사람의 <b>옷차림과 햇빛 게이지</b>를 비교해 보세요!",
  });
  host.append(goalChips, helper);

  const canvas = el("canvas", {
    class: "spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "지구의 공전 위치 옮기기(12월에서 6월까지). 좌우 화살표 키로도 조절해요.",
      "aria-valuemin": "0",
      "aria-valuemax": "6",
      "aria-valuenow": "3",
      "aria-valuetext": "3월",
    },
  });
  const pdot = el("span", { class: "pdot", style: "background:#FFC24D" });
  const pillTxt = el("span", { text: "3월 — 둘 다 봄가을 날씨" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, el("div", { class: "pill" }, pdot, pillTxt)));
  const capEl = el("div", { class: "stage-cap", text: "좌우로 끌면 지구가 공전해요 · 옷차림·계절 표현은 모형" });
  stage.appendChild(capEl);

  // 판정 카드 — msn 문법(monsoonLab 계보)
  const quizQ = el("div", { class: "msn-q", html: "오스트레일리아의 <b>12월(크리스마스)</b>이 한여름인 까닭은 뭘까요?" });
  const optA = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "지구가 <b>기울어진 채 공전</b>해서 — 12월엔 남반구가 태양 쪽으로 기울어요" });
  const optB = el("button", { class: "msn-opt", attrs: { type: "button" }, html: "12월엔 지구가 태양과 <b>더 가까워져서</b>" });
  const quizCard = el("div", { class: "msn-quiz" }, quizQ, optA, optB);

  host.append(stage, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 목표 ----
  const goals = new Set<string>();
  let finished = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  let toastTimer = 0;
  const toastEl = el("div", { class: "toast low" });
  stage.appendChild(toastEl);
  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2400);
  }
  function collect(id: string, subText: string, msg?: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (msg) toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "지구가 <b>기울어진 채 공전</b>하니, 12월엔 남반구가·6월엔 북반구가 태양 쪽으로 기울어요 — 그래서 <b>남반구와 북반구는 계절이 반대</b>! 오스트레일리아의 밀이 12~2월에 익는 것도, 산타가 서핑을 하는 것도 이 기울기 덕분이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
    if (goals.has("dec") && goals.has("jun") && !quizCard.classList.contains("show")) {
      quizCard.classList.add("show");
      later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }
  }

  // ---- 판정 카드 ----
  let quizDone = false;
  optA.addEventListener("click", () => {
    if (quizDone) return;
    quizDone = true;
    optA.classList.add("ok");
    optB.classList.add("dim");
    haptic(HAPTIC.correct);
    quizQ.innerHTML = "정답! 방금 실험 그대로예요 — <b>12월엔 남반구가 태양 쪽으로 기울어</b> 햇빛을 집중해서 받아요. 그래서 계절이 우리와 반대랍니다.";
    collect("why", "정답!");
  });
  optB.addEventListener("click", () => {
    if (quizDone) return;
    haptic(HAPTIC.wrong);
    optB.classList.add("no");
    quizQ.innerHTML = "거리 때문이 아니에요 — 놀랍게도 지구는 <b>1월에 태양과 가장 가까워요</b>! 계절을 만드는 건 <b>기울기</b>: 게이지가 뒤집히던 순간을 떠올리며 다시!";
    later(() => optB.classList.remove("no"), 700);
  });

  // ---- 상태 ----
  let phase = P_START; // 0=12월 ~ π=6월
  let showPhase = P_START;
  let dragging = false;
  let dragX0 = 0;
  let dragP0 = P_START;
  let decMs = 0;
  let junMs = 0;
  let capFaded = false;
  let shownPill = "";

  function syncAria(): void {
    const m = Math.round((phase / Math.PI) * 6);
    canvas.setAttribute("aria-valuenow", String(m));
    canvas.setAttribute("aria-valuetext", monthOf(phase));
  }

  const onDown = (e: PointerEvent): void => {
    dragging = true;
    dragX0 = e.clientX;
    dragP0 = phase;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 포인터 안전(사고 7) */
    }
    canvas.classList.add("dragging");
    if (!capFaded) {
      capFaded = true;
      capEl.style.transition = "opacity .4s";
      capEl.style.opacity = "0";
    }
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    // 오른쪽으로 끌면 12월 → 6월(위상 증가). 화면 폭 절반 드래그 = 반년.
    const r = canvas.getBoundingClientRect();
    phase = clamp(dragP0 + ((e.clientX - dragX0) / Math.max(160, r.width * 0.55)) * Math.PI, 0, Math.PI);
    syncAria();
  };
  const onUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight") phase = clamp(phase + Math.PI / 12, 0, Math.PI);
    else if (e.key === "ArrowLeft") phase = clamp(phase - Math.PI / 12, 0, Math.PI);
    else return;
    e.preventDefault();
    syncAria();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 도시 스틱맨(옷차림 = 햇빛 게이지 구간) ----
  function drawCitizen(ctx: CanvasRenderingContext2D, px: number, py: number, saRad: number, f: number, tMs: number, santa: boolean): void {
    const hot = f >= 0.85;
    const cold = f < 0.6;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 2 - saRad); // 로컬 -y = 지표 바깥(법선)
    if (cold) ctx.translate(Math.sin(tMs / 32) * 1.1, 0);
    const j = drawStickman(ctx, 0, 0, 30, poseStand(tMs), { face: "dot" });
    ctx.lineCap = "round";
    if (hot) {
      ctx.strokeStyle = "#EBD9A4";
      ctx.lineWidth = 5.4;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      const ph = (tMs / 640) % 1;
      ctx.fillStyle = `rgba(140,214,255,${((1 - ph) * 0.85).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(j.head.x + 6 + ph * 4, j.head.y - 2 + ph * 9, 1.9, 0, Math.PI * 2);
      ctx.fill();
      if (santa) {
        // 크리스마스 회수 연출 — 한여름 산타 모자(훅 정합)
        ctx.fillStyle = "#E2574C";
        ctx.beginPath();
        ctx.moveTo(j.head.x - 6.5, j.head.y - 6);
        ctx.quadraticCurveTo(j.head.x, j.head.y - 16, j.head.x + 7.5, j.head.y - 7.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(j.head.x + 7.5, j.head.y - 8, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (!cold) {
      ctx.strokeStyle = "#7FB0E0";
      ctx.lineWidth = 5.4;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      ctx.lineWidth = 4;
      const f1 = lp(j.shoulder, j.handF, 0.84);
      const b1 = lp(j.shoulder, j.handB, 0.84);
      seg(ctx, j.shoulder.x, j.shoulder.y, f1.x, f1.y);
      seg(ctx, j.shoulder.x, j.shoulder.y, b1.x, b1.y);
    } else {
      ctx.strokeStyle = "#E8590C";
      ctx.lineWidth = 10.5;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      ctx.lineWidth = 6.5;
      const f1 = lp(j.shoulder, j.handF, 0.88);
      const b1 = lp(j.shoulder, j.handB, 0.88);
      seg(ctx, j.shoulder.x, j.shoulder.y, f1.x, f1.y);
      seg(ctx, j.shoulder.x, j.shoulder.y, b1.x, b1.y);
      ctx.strokeStyle = "rgba(255,255,255,.3)";
      ctx.lineWidth = 3.4;
      seg(ctx, j.hip.x, j.hip.y, j.shoulder.x, j.shoulder.y);
      const neck = lp(j.shoulder, j.head, 0.38);
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 2.8;
      seg(ctx, neck.x - 3.6, neck.y, neck.x + 4, neck.y + 0.7);
      const ph = (tMs % 1500) / 1500;
      if (ph < 0.55) {
        const pp = ph / 0.55;
        ctx.strokeStyle = `rgba(226,240,255,${((1 - pp) * 0.6).toFixed(2)})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(j.head.x + 7 + pp * 7, j.head.y - 1.5, 1.4 + pp * 2.1, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH, 1.75);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;

    showPhase += (phase - showPhase) * Math.min(1, 0.3 * dt);
    if (Math.abs(phase - showPhase) < 0.004) showPhase = phase;
    const delta = -TILT * Math.cos(showPhase); // 태양 직하 위도 δ(= 지축 화면 기울기)
    const cx = W * 0.4;
    const cy = 214;

    // 목표 판정 — 극점 위상에 400ms 머무르면 수집(latSun 대역 체류 문법)
    const tick = dt * 16.7;
    if (showPhase <= Math.PI * 0.1) {
      decMs += tick;
      if (decMs > 400) collect("dec", "여름!", "12월 — 시드니가 여름! 남반구가 태양 쪽으로 기울었어요");
    } else decMs = 0;
    if (showPhase >= Math.PI * 0.9) {
      junMs += tick;
      if (junMs > 400) collect("jun", "겨울!", "6월 — 이번엔 시드니가 겨울! 계절이 통째로 뒤집혔죠");
    } else junMs = 0;

    // 1) 오른쪽 빛 유입 글로우 + 평행 광선 다발(latSun 시각 언어)
    const inGlow = ctx.createLinearGradient(W - 80, 0, W, 0);
    inGlow.addColorStop(0, "rgba(255,205,120,0)");
    inGlow.addColorStop(1, "rgba(255,205,120,.11)");
    ctx.fillStyle = inGlow;
    ctx.fillRect(W - 80, 0, 80, H);
    for (let y = 56; y < H - 24; y += 34) {
      const dy = cy - y;
      const hits = Math.abs(dy) <= R - 1;
      const xEnd = hits ? cx + Math.sqrt(R * R - dy * dy) : -4;
      ctx.strokeStyle = hits ? "rgba(255,196,90,.08)" : "rgba(255,196,90,.05)";
      ctx.lineWidth = 2.6;
      seg(ctx, W + 2, y, xEnd, y);
      ctx.strokeStyle = hits ? "rgba(255,208,124,.24)" : "rgba(255,208,124,.13)";
      ctx.lineWidth = 1.2;
      seg(ctx, W + 2, y, xEnd, y);
    }

    // 2) 지구 원판
    const disc = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
    disc.addColorStop(0, "#0E1C36");
    disc.addColorStop(0.78, "#142645");
    disc.addColorStop(0.97, "#1D3560");
    disc.addColorStop(1, "#294573");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(182,204,238,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    // 밤 반구(태양 반대쪽) 살짝 어둡게 — 왼쪽 절반
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 1, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(2,8,20,.35)";
    ctx.fill();
    ctx.restore();

    // 3) 지축(우주 고정 — 공전에 따라 화면 기울기만 변함) + 적도
    const aRad = rad(delta); // 축 상단이 태양 쪽(+x)으로 기운 각 = δ
    const axU = { x: Math.sin(aRad), y: -Math.cos(aRad) };
    const eqU = { x: Math.cos(aRad), y: Math.sin(aRad) };
    ctx.strokeStyle = "rgba(255,214,102,.85)";
    ctx.lineWidth = 2.4;
    ctx.setLineDash([7, 5]);
    seg(ctx, cx - axU.x * (R + 18), cy - axU.y * (R + 18), cx + axU.x * (R + 18), cy + axU.y * (R + 18));
    ctx.setLineDash([]);
    ctx.font = "800 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,224,150,.9)";
    ctx.fillText("북극", cx + axU.x * (R + 30), cy + axU.y * (R + 30) + 3.5);
    ctx.fillText("남극", cx - axU.x * (R + 30), cy - axU.y * (R + 30) + 3.5);
    ctx.strokeStyle = "rgba(160,185,220,.42)";
    ctx.lineWidth = 1.3;
    ctx.setLineDash([5, 6]);
    seg(ctx, cx - eqU.x * (R - 2), cy - eqU.y * (R - 2), cx + eqU.x * (R - 2), cy + eqU.y * (R - 2));
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(205,222,244,.7)";
    ctx.fillText("적도", cx + eqU.x * (R - 26), cy + eqU.y * (R - 26) - 6);

    // 4) 두 도시 — 림 각 sa = φ − δ, 게이지 f = cos(sa)
    const cities: { name: string; lat: number; santa: boolean }[] = [
      { name: "서울", lat: LAT_N, santa: false },
      { name: "시드니", lat: LAT_S, santa: showPhase <= Math.PI * 0.16 },
    ];
    for (const c of cities) {
      const sa = rad(c.lat - delta);
      const px = cx + R * Math.cos(sa);
      const py = cy - R * Math.sin(sa);
      const f = Math.max(0, Math.cos(sa));
      // 도시 하이라이트 광선(중심 빛줄기 + 흐르는 알갱이 — latSun 문법 축약)
      ctx.strokeStyle = "rgba(255,200,90,.2)";
      ctx.lineWidth = 4;
      seg(ctx, W + 2, py, px + 1, py);
      ctx.strokeStyle = "rgba(255,228,168,.8)";
      ctx.lineWidth = 1.6;
      seg(ctx, W + 2, py, px + 1, py);
      ctx.save();
      ctx.setLineDash([5, 22]);
      ctx.lineDashOffset = -((tMs * 0.065) % 270);
      ctx.strokeStyle = "rgba(255,242,205,.85)";
      ctx.lineWidth = 2.2;
      seg(ctx, W + 2, py, px + 2, py);
      ctx.restore();
      // 지표에 닿는 밝은 호(같은 폭 빛이 닿는 구간 — 비스듬할수록 길다)
      const hw = 7;
      const sinHi = (cy - (py - hw)) / R;
      const sinLo = (cy - (py + hw)) / R;
      const phiHi = Math.asin(Math.min(1, sinHi));
      const phiLo = Math.asin(Math.max(-1, sinLo));
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const [lw, col] of [
        [7, "rgba(255,170,60,.18)"],
        [3.6, "rgba(255,196,80,.5)"],
        [1.7, "rgba(255,235,196,.9)"],
      ] as [number, string][]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(cx, cy, R, -phiHi, -phiLo);
        ctx.stroke();
      }
      ctx.restore();
      drawCitizen(ctx, px, py, sa, f, tMs, c.santa);
      // 이름 + 미니 게이지(같은 넓이가 받는 햇빛 %)
      const nx = px + Math.cos(sa) * 30;
      const ny = py - Math.sin(sa) * 30 - 26;
      // 클램프 W−94: 바(44px)+"햇빛 N%" 텍스트(gx+48~)가 오른쪽으로 잘리지 않는 하한(눈검수 실사고)
      const gx = Math.min(Math.max(nx, cx + R * 0.28), W - 94);
      ctx.font = "800 10.5px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(226,238,252,.95)";
      ctx.fillText(c.name, gx, ny);
      const pctV = Math.round(f * 100);
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.beginPath();
      ctx.roundRect(gx, ny + 5, 44, 6, 3);
      ctx.fill();
      ctx.fillStyle = `hsl(${45 + (100 - pctV) * 1.5}, 86%, 62%)`;
      ctx.beginPath();
      ctx.roundRect(gx, ny + 5, Math.max(2.5, (44 * pctV) / 100), 6, 3);
      ctx.fill();
      ctx.font = "700 9px Pretendard, sans-serif";
      ctx.fillStyle = "rgba(226,238,252,.8)";
      ctx.fillText(`햇빛 ${pctV}%`, gx + 48, ny + 11);
    }

    // 5) 공전 인셋(우상단) — 태양·궤도·지구 위치·달 표기(모형)
    const ox = W - 64;
    const oy = 52;
    ctx.strokeStyle = "rgba(182,204,238,.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ox, oy, 40, 15, 0, 0, Math.PI * 2);
    ctx.stroke();
    const sun = ctx.createRadialGradient(ox, oy, 1, ox, oy, 8);
    sun.addColorStop(0, "#FFE9B0");
    sun.addColorStop(1, "rgba(255,196,90,.15)");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(ox, oy, 8, 0, Math.PI * 2);
    ctx.fill();
    const ex = ox - 40 * Math.cos(showPhase);
    const ey = oy + 15 * Math.sin(showPhase);
    ctx.fillStyle = "#7FB0E0";
    ctx.beginPath();
    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "700 9px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(205,222,244,.72)";
    ctx.fillText("12월", ox - 46, oy - 18);
    ctx.fillText("6월", ox + 46, oy - 18);

    // 6) 시작 힌트 — 첫 목표 전 좌우 화살표
    if (!dragging && goals.size === 0 && !finished) {
      const bob = Math.sin(tMs / 300) * 4;
      const hy = cy + R + 34;
      ctx.strokeStyle = "rgba(255,194,77,.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (const d of [1, -1]) {
        const tx = cx + d * (56 + bob);
        seg(ctx, tx - d * 18, hy, tx, hy);
        ctx.beginPath();
        ctx.moveTo(tx - d * 8, hy - 5.5);
        ctx.lineTo(tx, hy);
        ctx.lineTo(tx - d * 8, hy + 5.5);
        ctx.stroke();
      }
    }

    // 7) HUD 갱신(변할 때만) — 리드아웃은 pill 하나(Ⅴ 교훈)
    const fN = Math.max(0, Math.cos(rad(LAT_N - delta)));
    const fS = Math.max(0, Math.cos(rad(LAT_S - delta)));
    const seasonOf = (f: number): string => (f >= 0.85 ? "여름" : f < 0.6 ? "겨울" : "봄가을");
    const pillNow = `${monthOf(showPhase)} — 서울 ${seasonOf(fN)} · 시드니 ${seasonOf(fS)}`;
    if (pillNow !== shownPill) {
      shownPill = pillNow;
      pillTxt.textContent = pillNow;
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH, 1.75);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("12월과 6월을 모두 관찰해요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    for (const t of timers) window.clearTimeout(t);
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
