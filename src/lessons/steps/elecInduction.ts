// elecInduction — 정전기 유도 랩(중2 VII L2, 책 246~247쪽 그림 VII-3의 조작판).
//   대전된 플라스틱 막대를 좌우로 끌어 눕힌 알루미늄 깡통에 접근시키는 다크 스테이지 랩.
//   금속 속 자유 전자만 이동해 재배치되고((+) 원자핵 자리는 고정), 막대와 가까운 쪽엔
//   언제나 반대 종류의 전기가 유도돼 — 막대가 (−)든 (+)든 깡통은 끌려서 굴러온다.
//   물리 근사(모두 스무스스텝 기반):
//   · gap = 막대 끝~깡통 몸통 가장자리 수평 거리
//   · 전하 치우침 pol = smooth(REACH→26, gap) — 전자 목표 x = home·(1−.55·pol) + shiftDir·pol·0.56·CAN_HL
//   · 전자는 저강성 스프링(v += Δ·0.085·dt, v ×= 0.8^dt)으로 목표를 쫓는다
//   · 굴림: gap < ROLL_GAP이면 가속 ∝ smooth(ROLL_GAP→STOP_GAP, gap), 속도 상한 V_MAX, 마찰 0.93^dt

import { el, clamp, smooth } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawElectron, drawPlus, ELEC, TAU } from "../../ui/elecKit";
import { capturePointer } from "../../ui/lightKit";
import { contactShadow } from "../../ui/labProps";
import { drawForceArrow } from "../../ui/forceProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ---- 무대 상수 ----
const CVH = 300; // 캔버스 높이
const DESK_Y = 246; // 책상 윗면
const CAN_R = 33; // 깡통 반지름(세로)
const CAN_HL = 62; // 깡통 몸통 절반 길이(가로)
const CAP_RX = 11; // 양끝 타원의 가로 반지름
const CAN_CY = DESK_Y - CAN_R; // 깡통 중심 높이
const ROD_TIP_Y = 202; // 막대 끝 높이(깡통 몸통 높이)
const ROD_LEN = 154;
const ROD_TILT = 0.3; // 막대 기울기(rad) — 손잡이가 오른쪽 위
const REACH = 150; // 전하 재배치가 느껴지기 시작하는 거리
const ROLL_GAP = 106; // 이보다 가까우면 깡통이 굴러온다(임계)
const STOP_GAP = 15; // 막대 코앞 — 여기서 멈춘다
const V_MAX = 1.15; // 굴림 속도 상한(px/프레임) — "천천히"

// 전자 8개의 집 자리(깡통 중심 기준 오프셋)
const E_HOMES = [
  { x: -46, y: -11 }, { x: -46, y: 11 },
  { x: -17, y: -12 }, { x: -17, y: 10 },
  { x: 12, y: -10 }, { x: 12, y: 12 },
  { x: 42, y: -12 }, { x: 42, y: 10 },
];
// 고정 (+) 4개 — 원자핵 자리(움직이지 않는다)
const P_SITES = [
  { x: -40, y: 5 }, { x: -14, y: -7 }, { x: 14, y: 7 }, { x: 40, y: -5 },
];

export const inductionLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- DOM ----
  const canvas = el("canvas", {
    class: "lt-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "대전된 막대를 좌우로 끌어 깡통에 가까이 하기. 좌우 화살표 키로도 움직여요.",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      "aria-valuenow": "20",
    },
  });
  const segMinus = el("button", { text: "(−)막대", class: "on", attrs: { type: "button" } });
  const segPlus = el("button", { text: "(+)막대", attrs: { type: "button" } });
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" }, segMinus, segPlus);
  const hudDot = el("span", { class: "pdot", style: "background:#8CA2C0" });
  const hudTxt = el("span", { text: "전하 치우침 없음" });
  const hudPill = el("div", { class: "pill", style: "white-space:nowrap" }, hudDot, hudTxt);
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", style: "transition:opacity .4s", text: "막대를 잡고 좌우로 끌어 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, seg, hudPill),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "shift" } }, el("b", { text: "전하 재배치" }), el("span", { text: "막대를 가까이" })),
    el("div", { class: "pn-badge", dataset: { g: "roll" } }, el("b", { text: "깡통 끌기" }), el("span", { text: "굴러올까?" })),
    el("div", { class: "pn-badge", dataset: { g: "plus" } }, el("b", { text: "(+)막대" }), el("span", { text: "그래도 끌릴까?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "깡통 같은 금속 안에는 <b>자유롭게 움직이는 전자</b>가 가득해요. (−)막대를 잡아 깡통 쪽으로 천천히 끌어 보세요.",
  });
  host.append(goalChips, stage, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let mode: 1 | -1 = -1; // 막대 전하 부호
  let rodX = 46; // 실제 막대 위치(목표로 수렴)
  let rodTX = 46; // 드래그 목표
  let canX = 250;
  let canV = 0; // 깡통 속도(px/프레임)
  let rollPhase = 0; // 굴림 회전각
  let dirRod = 1; // 깡통→막대 방향(±1, 히스테리시스)
  let pol = 0; // 전하 치우침 0..1
  let shiftMs = 0; // 목표① 유지 시간
  let rollDist = 0; // 인력으로 굴러간 누적 거리
  let plusRoll = 0; // (+)막대 모드에서 굴러간 거리
  let inited = false;
  let dragging = false;
  let grabDX = 0;
  let touched = false; // 첫 드래그 전 안내 화살표용
  let lastTrailX = 0;
  const trail: { x: number; a: number }[] = []; // 타원 굴림 흔적
  const eParts = E_HOMES.map((h) => ({ hx: h.x, hy: h.y, x: h.x, v: 0 }));
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let hudShown = "";

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2100);
  }

  function collect(id: string, subText: string, msg: string, helperHtml?: string): void {
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
        "정리! 대전체와 <b>가까운 쪽은 다른 종류</b>, 먼 쪽은 같은 종류의 전기가 유도돼요. 다른 종류끼리 더 가까우니 — 막대가 (−)든 (+)든 깡통은 <b>언제나 끌려와요</b>. 이게 바로 정전기 유도!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (helperHtml && !finished) helper.innerHTML = helperHtml;
  }

  function setMode(m: 1 | -1): void {
    if (mode === m) return;
    mode = m;
    segMinus.classList.toggle("on", m === -1);
    segPlus.classList.toggle("on", m === 1);
    haptic(HAPTIC.select);
    if (m === 1) {
      toast("(+)막대로 바꿨어요 — 전자들은 어디로 갈까요?");
      if (!finished && goals.has("roll") && !goals.has("plus"))
        helper.innerHTML = "이번엔 막대가 <b>(+)전기</b>를 띠어요. 깡통에 가까이 가져가 보세요 — 그래도 끌려올까요?";
    } else {
      toast("(−)막대로 돌아왔어요");
    }
  }
  segMinus.addEventListener("click", () => setMode(-1));
  segPlus.addEventListener("click", () => setMode(1));

  // ---- 입력: 막대 좌우 드래그 ----
  const rodMin = (): number => 40;
  const rodMax = (): number => W - 48;
  const setAria = (): void => {
    canvas.setAttribute("aria-valuenow", String(Math.round(((rodTX - rodMin()) / Math.max(1, rodMax() - rodMin())) * 100)));
  };
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    dragging = true;
    touched = true;
    grabDX = Math.abs(px - rodX) < 90 ? rodX - px : 0;
    rodTX = clamp(px + grabDX, rodMin(), rodMax());
    capturePointer(canvas, e);
    capEl.style.opacity = "0";
    haptic(HAPTIC.tap);
    setAria();
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    rodTX = clamp(e.clientX - r.left + grabDX, rodMin(), rodMax());
    setAria();
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft") rodTX = clamp(rodTX - 16, rodMin(), rodMax());
    else if (e.key === "ArrowRight") rodTX = clamp(rodTX + 16, rodMin(), rodMax());
    else return;
    e.preventDefault();
    touched = true;
    setAria();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 그리기 조각 ----
  function drawBench(ctx: CanvasRenderingContext2D, H: number): void {
    const g = ctx.createLinearGradient(0, DESK_Y, 0, H);
    g.addColorStop(0, "rgba(52,70,104,.5)");
    g.addColorStop(1, "rgba(16,26,46,.12)");
    ctx.fillStyle = g;
    ctx.fillRect(0, DESK_Y, W, H - DESK_Y);
    ctx.strokeStyle = "rgba(186,206,236,.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, DESK_Y);
    ctx.lineTo(W - 8, DESK_Y);
    ctx.stroke();
  }

  function drawCan(ctx: CanvasRenderingContext2D, tMs: number): void {
    const x0 = canX - CAN_HL;
    const x1 = canX + CAN_HL;
    // 굴림 흔적(지나온 자리의 옅은 타원)
    for (const t of trail) {
      ctx.strokeStyle = `rgba(150,190,255,${t.a * 0.5})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(t.x, CAN_CY, CAP_RX, CAN_R * 0.94, 0, 0, TAU);
      ctx.stroke();
    }
    contactShadow(ctx, canX, DESK_Y + 2, CAN_HL * 1.15, 0.26);
    // 몸통(금속 원통 세로 그라데이션)
    const body = ctx.createLinearGradient(0, CAN_CY - CAN_R, 0, CAN_CY + CAN_R);
    body.addColorStop(0, "#6F8098");
    body.addColorStop(0.16, "#C6D4E4");
    body.addColorStop(0.34, "#EDF3FA");
    body.addColorStop(0.58, "#A2B2C8");
    body.addColorStop(1, "#4A5A74");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(x0, CAN_CY - CAN_R, CAN_HL * 2, CAN_R * 2, 4);
    ctx.fill();
    ctx.strokeStyle = "#2A3850";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x0, CAN_CY - CAN_R, CAN_HL * 2, CAN_R * 2, 4);
    ctx.stroke();
    // 양끝 타원(뚜껑·바닥)
    for (const ex of [x0, x1]) {
      const capG = ctx.createLinearGradient(0, CAN_CY - CAN_R, 0, CAN_CY + CAN_R);
      capG.addColorStop(0, "#8CA0BC");
      capG.addColorStop(0.5, "#5A6C8C");
      capG.addColorStop(1, "#3C4C6A");
      ctx.fillStyle = capG;
      ctx.beginPath();
      ctx.ellipse(ex, CAN_CY, CAP_RX, CAN_R, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#26334C";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(ex, CAN_CY, CAP_RX, CAN_R, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(226,238,252,.28)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(ex, CAN_CY, CAP_RX * 0.6, CAN_R * 0.66, 0, 0, TAU);
      ctx.stroke();
      // 굴림 마커 — 타원 테두리를 도는 점 2개(회전이 눈에 보이게)
      for (const off of [0, TAU / 3]) {
        const a = rollPhase + off;
        ctx.fillStyle = "rgba(232,242,255,.55)";
        ctx.beginPath();
        ctx.arc(ex + Math.cos(a) * CAP_RX * 0.78, CAN_CY + Math.sin(a) * (CAN_R - 4.5), 2.2, 0, TAU);
        ctx.fill();
      }
    }
    // 몸통 스펙큘러 스트릭
    ctx.fillStyle = "rgba(255,255,255,.26)";
    ctx.beginPath();
    ctx.roundRect(x0 + 10, CAN_CY - CAN_R * 0.52, CAN_HL * 2 - 20, 5, 3);
    ctx.fill();

    // 고정 (+) 원자핵 자리 — 전자가 떠난 쪽이 살짝 도드라진다
    const posSide = mode === -1 ? dirRod : -dirRod; // (+)로 유도되는 쪽
    for (const p of P_SITES) {
      const hot = Math.sign(p.x) === posSide ? 0.3 * pol : 0;
      drawPlus(ctx, canX + p.x, CAN_CY + p.y, 6, 0.42 + hot);
    }
    // 자유 전자 8개(잔잔히 떨리는 알갱이)
    eParts.forEach((p, i) => {
      const wx = Math.sin(tMs / 640 + i * 2.3) * 1.9;
      const wy = Math.sin(tMs / 520 + i * 1.7) * 2.4;
      drawElectron(ctx, canX + p.x + wx, CAN_CY + p.hy + wy, 6.5);
    });

    // 유도 전하 라벨 — 표면(양끝) 근처, 세기 비례
    if (pol > 0.06) {
      const nearSign = mode === -1 ? "+" : "−";
      const farSign = mode === -1 ? "−" : "+";
      ctx.save();
      ctx.font = "800 14px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const a = Math.min(1, pol * 0.95);
      for (const [side, sign] of [[dirRod, nearSign], [-dirRod, farSign]] as [number, string][]) {
        const gx = canX + side * (CAN_HL + 3);
        ctx.fillStyle = sign === "+" ? `rgba(${ELEC.amber},${a})` : `rgba(126,214,255,${a})`;
        ctx.shadowColor = sign === "+" ? `rgba(${ELEC.amber},${a * 0.8})` : `rgba(126,214,255,${a * 0.8})`;
        ctx.shadowBlur = 7;
        for (const gy of [-16, 0, 16]) ctx.fillText(sign, gx + (gy === 0 ? side * 3 : 0), CAN_CY + gy);
      }
      ctx.restore();
    }
  }

  function drawRod(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(rodX, ROD_TIP_Y);
    ctx.rotate(ROD_TILT);
    // 끝 주변 전하 아우라
    const aura = ctx.createRadialGradient(0, -34, 4, 0, -34, 48);
    aura.addColorStop(0, mode === -1 ? "rgba(126,214,255,.18)" : `rgba(${ELEC.amber},.18)`);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -34, 48, 0, TAU);
    ctx.fill();
    // 막대 몸통(플라스틱 3스톱 + 스펙 스트릭)
    const g = ctx.createLinearGradient(-8, 0, 8, 0);
    g.addColorStop(0, "#232F4A");
    g.addColorStop(0.42, "#4A5C84");
    g.addColorStop(0.6, "#5E7098");
    g.addColorStop(1, "#1C2740");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-8, -ROD_LEN, 16, ROD_LEN, 8);
    ctx.fill();
    ctx.strokeStyle = "#101828";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-8, -ROD_LEN, 16, ROD_LEN, 8);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3.4, -ROD_LEN + 12);
    ctx.lineTo(-3.4, -16);
    ctx.stroke();
    // 손잡이 홈
    ctx.fillStyle = "rgba(10,16,30,.5)";
    ctx.fillRect(-8, -ROD_LEN + 16, 16, 3.5);
    ctx.fillRect(-8, -ROD_LEN + 25, 16, 3.5);
    // 끝쪽 전하 기호들 — 대전체의 부호
    for (const y of [-14, -38, -62]) {
      if (mode === -1) drawElectron(ctx, 0, y, 6);
      else drawPlus(ctx, 0, y, 6);
    }
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const H = fit.h;
    if (!inited) {
      inited = true;
      rodX = rodTX = Math.max(44, W * 0.13);
      canX = Math.min(W - CAN_HL - 14, W * 0.78);
      lastTrailX = canX;
      setAria();
    }
    rodTX = clamp(rodTX, rodMin(), rodMax());
    canX = clamp(canX, CAN_HL + 16, W - CAN_HL - 12);

    // 막대는 드래그 목표로 묵직하게 수렴
    rodX += (rodTX - rodX) * Math.min(1, 0.4 * dt);

    // 기하 — 방향(히스테리시스)과 간격
    const dxRC = rodX - canX;
    if (Math.abs(dxRC) > 10) dirRod = dxRC > 0 ? 1 : -1;
    const gap = Math.max(0, Math.abs(dxRC) - CAN_HL - 9);
    pol = smooth(REACH, 26, gap);

    // 전자 재배치 — (−)막대면 먼 쪽, (+)막대면 가까운 쪽으로 스프링 이동
    const shiftDir = mode === -1 ? -dirRod : dirRod;
    eParts.forEach((p, i) => {
      const jit = 0.86 + (i % 3) * 0.11;
      const tx = clamp(p.hx * (1 - 0.55 * pol) + shiftDir * pol * CAN_HL * 0.56 * jit, -(CAN_HL - 13), CAN_HL - 13);
      p.v += (tx - p.x) * 0.085 * dt;
      p.v *= Math.pow(0.8, dt);
      p.x += p.v * dt;
    });

    // 굴림 — 임계 안이면 막대 쪽으로 가속, 밖이면 마찰로 감속 정지
    const pull = smooth(ROLL_GAP, STOP_GAP, gap);
    if (gap > STOP_GAP && gap < ROLL_GAP) canV += dirRod * (0.028 + 0.075 * pull) * dt;
    canV = clamp(canV, -V_MAX, V_MAX);
    canV *= Math.pow(0.93, dt);
    const before = canX;
    canX += canV * dt;
    const moved = Math.abs(canX - before);
    if (moved > 0.02 && gap > STOP_GAP * 0.6) {
      rollDist += moved;
      if (mode === 1) plusRoll += moved;
    }
    // 막대와 겹치지 않게(코앞에서 정지)
    if (Math.abs(rodX - canX) - CAN_HL - 9 < 4) {
      canX = rodX - dirRod * (CAN_HL + 13);
      canV = 0;
    }
    rollPhase += (canX - before) / CAN_R;
    // 굴림 흔적 적립·감쇠
    if (Math.abs(canX - lastTrailX) > 13) {
      trail.push({ x: canX, a: 0.3 });
      lastTrailX = canX;
      if (trail.length > 22) trail.shift();
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].a *= Math.pow(0.975, dt);
      if (trail[i].a < 0.02) trail.splice(i, 1);
    }

    // ---- 목표 판정 ----
    if (pol > 0.5) {
      shiftMs += dt * 16.7;
      if (shiftMs > 340 && !goals.has("shift")) {
        collect(
          "shift",
          "전자 이동!",
          mode === -1 ? "전자들이 먼 쪽으로 우르르 — 가까운 쪽은 (+)!" : "전자들이 가까운 쪽으로 우르르 — 가까운 쪽은 (−)!",
          mode === -1
            ? "막대의 (−)전기가 전자를 밀어내 <b>먼 쪽</b>으로 보냈어요. 그래서 가까운 쪽은 (+) — 서로 다른 전기끼리는 당겨요. 더 가까이 가져가면?"
            : "막대의 (+)전기가 전자를 <b>가까운 쪽</b>으로 끌어왔어요. 그래서 가까운 쪽은 (−) — 서로 다른 전기끼리는 당겨요. 더 가까이 가져가면?",
        );
      }
    } else shiftMs = 0;
    if (rollDist > 60 && !goals.has("roll")) {
      collect(
        "roll",
        "끌려왔다!",
        "깡통이 막대 쪽으로 굴러와요 — 인력!",
        goals.has("plus")
          ? undefined
          : "가까운 쪽에 유도된 전기와 막대 사이의 <b>인력</b>이 깡통을 끌었어요. 이제 위 토글에서 <b>(+)막대</b>로 바꿔 다시 해 봐요!",
      );
    }
    if (mode === 1 && plusRoll > 42 && !goals.has("plus")) {
      collect("plus", "역시 인력!", "(+)막대인데도 끌려와요 — 어느 쪽이든 인력!");
    }

    // ---- 그리기 ----
    drawBench(ctx, H);
    drawCan(ctx, tMs);
    // 인력 화살표(깡통 → 막대)
    if (pull > 0.08) {
      const len = Math.min(18 + 30 * pull, Math.max(10, gap - 8));
      drawForceArrow(ctx, canX + dirRod * (CAN_HL + CAP_RX + 5), CAN_CY, dirRod * len, 0, {
        color: "#FFC45A",
        width: 4,
        alpha: 0.35 + 0.65 * pull,
        label: "인력",
      });
    }
    drawRod(ctx);
    // 첫 조작 유도 화살표(막대 옆에서 깡통 쪽으로 까딱)
    if (!touched) {
      const dir = canX > rodX ? 1 : -1;
      const bob = Math.sin(tMs / 300) * 5;
      const ax = rodX + dir * 30 + bob * dir;
      ctx.strokeStyle = `rgba(${ELEC.amber},.6)`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ax, ROD_TIP_Y - 44);
      ctx.lineTo(ax + dir * 26, ROD_TIP_Y - 44);
      ctx.moveTo(ax + dir * 18, ROD_TIP_Y - 50);
      ctx.lineTo(ax + dir * 26, ROD_TIP_Y - 44);
      ctx.lineTo(ax + dir * 18, ROD_TIP_Y - 38);
      ctx.stroke();
    }

    // ---- HUD 필 갱신(변할 때만 DOM 접근) ----
    const near = mode === -1 ? "+" : "−";
    const hud = pol < 0.12 ? "전하 치우침 없음" : `가까운 쪽 (${near}) · 먼 쪽 (${near === "+" ? "−" : "+"})`;
    if (hud !== hudShown) {
      hudShown = hud;
      hudTxt.textContent = hud;
      hudDot.style.background = pol < 0.12 ? "#8CA2C0" : near === "+" ? "#FFC45A" : "#6FB4FF";
    }
  });

  api.setCTA("재배치 → 끌기 → (+)막대, 차례로!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
  };
};
