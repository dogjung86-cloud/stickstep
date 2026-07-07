// elecWater — 전류·전압 물 비유 랩(중2 VII L3, 책 248~249쪽 그림 VII-5). 가로 모드.
//   왼쪽 물 회로(펌프→높은 수로→물레방아→낮은 수로)와 오른쪽 전기 회로(전지→전선→전구→스위치)가
//   한 화면에서 **동기로** 움직인다 — 펌프 세기 슬라이더 하나가 물살과 전류를 함께 바꾼다.
//   미션: ① 펌프 세기(=전압)를 바꿔 흐름·밝기 동기 관찰 ② 밸브·스위치 잠그고 열기
//        ③ 대응 짝 5쌍 찾기(펌프=전지 · 물의 흐름=전류 · 물레방아=전구 · 수도관=전선 · 밸브=스위치).
//   rotateStage + 논리 좌표(1000×460) 스케일 매핑(rockCycle 문법).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { drawBattery, drawBulb, drawSwitch, drawWire, ELEC, TAU } from "../../ui/elecKit";
import type { RotateStage } from "../../ui/rotateStage";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
}

// 대응 쌍(물 → 전기) — 탭 매칭 미션
interface Spot {
  id: string;
  side: "water" | "elec";
  label: string;
  x: number;
  y: number;
  r: number;
}
const PAIRS: [string, string, string][] = [
  // [물 id, 전기 id, 매칭 라벨]
  ["pump", "battery", "전압을 만든다"],
  ["flow", "current", "흐름 그 자체"],
  ["wheel", "bulb", "에너지를 쓰는 곳"],
  ["pipe", "wire", "흐르는 길"],
  ["valve", "switch", "길을 여닫는 곳"],
];
const SPOTS: Spot[] = [
  { id: "pump", side: "water", label: "펌프", x: 92, y: 235, r: 52 },
  { id: "flow", side: "water", label: "물의 흐름", x: 250, y: 96, r: 46 },
  { id: "wheel", side: "water", label: "물레방아", x: 395, y: 205, r: 55 },
  { id: "pipe", side: "water", label: "수도관", x: 236, y: 372, r: 46 },
  { id: "valve", side: "water", label: "밸브", x: 168, y: 96, r: 34 },
  { id: "battery", side: "elec", label: "전지", x: 745, y: 388, r: 52 },
  { id: "current", side: "elec", label: "전류", x: 790, y: 96, r: 46 },
  { id: "bulb", side: "elec", label: "전구", x: 920, y: 205, r: 52 },
  { id: "wire", side: "elec", label: "전선", x: 610, y: 240, r: 42 },
  { id: "switch", side: "elec", label: "스위치", x: 872, y: 388, r: 40 },
];
const MATCH_COLORS = ["#F0A422", "#37B6D8", "#8A6BFF", "#4CAF6E", "#E86FCE"];

export const waterCircuit: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "power" } }, el("b", { text: "펌프 세기" }), el("span", { text: "약하게↔세게" })),
    el("div", { class: "pn-badge", dataset: { g: "valve" } }, el("b", { text: "밸브·스위치" }), el("span", { text: "잠갔다 열기" })),
    el("div", { class: "pn-badge", dataset: { g: "match" } }, el("b", { text: "대응 찾기" }), el("span", { text: "짝 5쌍" })),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: enterArtSvg() }),
    el("div", {
      class: "sp3-enter-txt",
      html: "물을 끌어올리는 <b>펌프</b>와 물을 받아 도는 <b>물레방아</b> — 전기 회로와 나란히 놓고 <b>같은 것끼리</b> 이어 봐요.<br>화면이 자동으로 <b>가로</b>로 돌아가요.",
    }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" }));
  const helper = el("div", {
    class: "helper",
    html: "물이 계속 흐르려면 <b>높이 차</b>를 만들어 주는 펌프가 필요해요 — 전기 회로에서 그 역할을 하는 게 <b>전지(전압)</b>랍니다.",
  });
  host.append(goalChips, preview, enterBtn, helper);

  // ---- 상태 ----
  let power = 0.65; // 펌프 세기(=전압) 0.2~1
  let open = true; // 밸브·스위치
  let powerLo = false;
  let powerHi = false;
  let valveDone = { closed: false, reopened: false };
  const matched = new Map<string, number>(); // 물 id → 색 인덱스
  let selWater: string | null = null;
  const goals = new Set<string>();
  let finished = false;

  let rot: RotateStage | null = null;
  let loop: Loop | null = null;
  let disposed = false;
  let toastEl: HTMLElement | null = null;
  let toastTimer = 0;
  let statusPill: HTMLElement | null = null;
  let missionEls: Record<string, HTMLElement> | null = null;
  let wheelAngle = 0;
  let flowPhase = 0;

  function showToast(msg: string, ms = 2400): void {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl?.classList.remove("show"), ms);
  }

  function collect(id: "power" | "valve" | "match", subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    missionEls?.[id]?.classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>전압은 전류를 흐르게 하는 능력</b> — 펌프가 만든 높이 차가 물을 흐르게 하듯, 전지의 전압이 전류를 흐르게 해요. 펌프를 세게 = 전압을 크게 = <b>전류도 세게</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      window.setTimeout(() => showToast("비유 완성! 세로로 돌아가 계속해요", 3200), 1400);
    }
  }

  // ---- 가로 스테이지 ----
  async function enter(): Promise<void> {
    if (rot || disposed) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({ title: "물의 흐름 ↔ 전류 — 같은 것끼리 탭!", onLeave: () => leave() });

    const canvas = el("canvas", { class: "sp3-canvas" });
    statusPill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#37B6D8" }), el("span", { text: "" }));
    const missions = el("div", { class: "sp3-missions lb" });
    missionEls = {};
    ([
      ["power", "펌프 세기"],
      ["valve", "밸브·스위치"],
      ["match", "대응 5쌍"],
    ] as [string, string][]).forEach(([id, name]) => {
      const sp = el("span", { text: name });
      if (goals.has(id)) sp.classList.add("on");
      missionEls![id] = sp;
      missions.appendChild(sp);
    });
    const valveBtn = el(
      "button",
      { class: "sp3-tiltbtn", attrs: { type: "button", "aria-pressed": String(!open) } },
      el("span", { text: "밸브·스위치 잠그기" }),
    );
    valveBtn.addEventListener("click", () => {
      open = !open;
      (valveBtn.querySelector("span") as HTMLElement).textContent = open ? "밸브·스위치 잠그기" : "밸브·스위치 열기";
      valveBtn.classList.toggle("on", !open);
      haptic(HAPTIC.select);
      if (!open) {
        valveDone.closed = true;
        showToast("길이 막히면 — <b>물도 전류도 함께 멈춰요</b>", 2400);
      } else if (valveDone.closed) {
        valveDone.reopened = true;
        showToast("다시 열면 — 둘 다 <b>동시에</b> 다시 흘러요!", 2200);
        collect("valve", "함께 멈춘다!");
      }
    });
    // 펌프 세기 슬라이더(가로 HUD 하단 중앙)
    const fill = el("i", { class: "px-fill", style: "background:linear-gradient(90deg,#1D4E64,#37B6D8)" });
    const knob = el("i", { class: "px-knob" });
    const track = el("div", { class: "px-track" }, fill, knob);
    const val = el("b", { class: "px-val", text: "" });
    const sliderRow = el(
      "div",
      { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": "펌프 세기(전압)" } },
      el("b", { text: "펌프 세기" }),
      track,
      val,
    );
    const sliderBox = el("div", { class: "px-sliders show wc-slider" }, sliderRow);
    const syncSlider = (): void => {
      const t = (power - 0.2) / 0.8;
      fill.style.width = `${Math.round(t * 100)}%`;
      knob.style.left = `${Math.round(t * 100)}%`;
      val.textContent = power < 0.4 ? "약하게" : power > 0.85 ? "세게!" : "보통";
      if (power <= 0.3) powerLo = true;
      if (power >= 0.9) powerHi = true;
      if (powerLo && powerHi) collect("power", "전압↑ 전류↑!");
    };
    let drag = false;
    const setFrom = (cx: number, cy: number): void => {
      // rotateStage 안이므로 화면 좌표를 스테이지 좌표로 리매핑한 뒤 트랙 기준 계산
      void cy;
      const tr = track.getBoundingClientRect();
      // 회전된 트랙: 화면상 세로로 눕는다 — mapPoint 없이 getBoundingClientRect의 주축을 판별
      const horizontal = tr.width >= tr.height;
      const t = horizontal ? (cx - tr.left) / tr.width : (cy - tr.top) / tr.height;
      power = 0.2 + clamp(t, 0, 1) * 0.8;
      syncSlider();
    };
    sliderRow.addEventListener("pointerdown", (e) => {
      drag = true;
      capturePointer(sliderRow, e);
      setFrom(e.clientX, e.clientY);
    });
    sliderRow.addEventListener("pointermove", (e) => {
      if (drag) setFrom(e.clientX, e.clientY);
    });
    sliderRow.addEventListener("pointerup", () => (drag = false));
    sliderRow.addEventListener("pointercancel", () => (drag = false));
    syncSlider();

    toastEl = el("div", { class: "sp3-toast" });
    rot.stage.append(canvas, statusPill, missions, valveBtn, sliderBox, toastEl);
    showToast("물 회로의 요소를 탭한 뒤, 전기 회로에서 <b>같은 역할</b>을 탭해 짝을 지어요!", 3200);

    // ---- 좌표계: 논리 1000×460 → 화면 스케일 ----
    const view = { s: 1, ox: 0, oy: 0 };
    const toLogic = (px: number, py: number): [number, number] => [(px - view.ox) / view.s, (py - view.oy) / view.s];

    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      const [lx, ly] = toLogic(p.x, p.y);
      const hit = SPOTS.find((sp) => Math.hypot(sp.x - lx, sp.y - ly) <= sp.r + 12);
      if (!hit) return;
      haptic(HAPTIC.select);
      if (hit.side === "water") {
        selWater = hit.id;
        showToast(`<b>${hit.label}</b> — 전기 회로에서 같은 역할은?`, 2200);
      } else if (selWater) {
        const pair = PAIRS.find(([w]) => w === selWater);
        if (pair && pair[1] === hit.id) {
          if (!matched.has(selWater)) {
            matched.set(selWater, matched.size % MATCH_COLORS.length);
            haptic(HAPTIC.correct);
            showToast(`정답! <b>${SPOTS.find((x) => x.id === pair[0])!.label} = ${hit.label}</b> — ${pair[2]}`, 2600);
            if (matched.size === PAIRS.length) collect("match", "5쌍 완성!");
          }
          selWater = null;
        } else {
          haptic(HAPTIC.wrong);
          showToast("음… 역할이 달라요. 다시 골라 봐요!", 1800);
        }
      } else {
        showToast("먼저 <b>왼쪽 물 회로</b>에서 하나를 골라요!", 1800);
      }
    });

    // ---- 프레임 ----
    const ctx = canvas.getContext("2d")!;
    loop = createLoop((dt) => {
      if (!rot) return;
      const { w, h } = rot.size();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      view.s = Math.min(w / 1000, (h - 40) / 460);
      view.ox = (w - 1000 * view.s) / 2;
      view.oy = (h - 40 - 460 * view.s) / 2 + 6;
      ctx.save();
      ctx.translate(view.ox, view.oy);
      ctx.scale(view.s, view.s);

      const rate = open ? power : 0;
      flowPhase = (flowPhase + dt * rate * 0.55) % 1;
      wheelAngle += dt * rate * 0.11;

      drawWaterSide(ctx, rate, flowPhase, wheelAngle, open);
      drawElecSide(ctx, rate, flowPhase, open);
      drawMatches(ctx);
      ctx.restore();

      if (statusPill) {
        (statusPill.querySelectorAll("span")[1] as HTMLElement).textContent = open
          ? `펌프 세기(전압) ${Math.round(power * 100)}% — 물살과 전류가 함께 ${power > 0.85 ? "콸콸!" : power < 0.4 ? "졸졸" : "흘러요"}`
          : "밸브·스위치 잠김 — 물도 전류도 정지";
      }
    });
    loop.start();
  }

  function drawMatches(ctx: CanvasRenderingContext2D): void {
    for (const sp of SPOTS) {
      const pair = PAIRS.find(([wId, eId]) => wId === sp.id || eId === sp.id);
      const wId = pair?.[0];
      const colorIdx = wId != null && matched.has(wId) ? matched.get(wId)! : null;
      const isSel = selWater === sp.id;
      if (colorIdx == null && !isSel) {
        // 미매칭 — 은은한 점선 링(탭 대상 안내)
        ctx.strokeStyle = "rgba(196,214,240,.3)";
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }
      const color = isSel ? "#FFD978" : MATCH_COLORS[colorIdx!];
      ctx.strokeStyle = color;
      ctx.lineWidth = isSel ? 3 : 2.2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, TAU);
      ctx.stroke();
      // 라벨 필
      ctx.font = "800 15px Pretendard, sans-serif";
      const tw = ctx.measureText(sp.label).width + 18;
      ctx.fillStyle = "rgba(10,20,38,.82)";
      ctx.beginPath();
      ctx.roundRect(sp.x - tw / 2, sp.y + sp.r + 6, tw, 24, 12);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(sp.x - tw / 2, sp.y + sp.r + 6, tw, 24, 12);
      ctx.stroke();
      ctx.fillStyle = "#EAF1FA";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sp.label, sp.x, sp.y + sp.r + 18);
    }
  }

  // ── 물 회로(좌) — 교과서 그림 VII-5 구도 ──
  function drawWaterSide(ctx: CanvasRenderingContext2D, rate: number, phase: number, wheel: number, isOpen: boolean): void {
    // 제목
    ctx.font = "800 17px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(150,196,255,.9)";
    ctx.fillText("물의 회로", 250, 34);

    // 경로: 펌프(92,300→92,96 상승) → 위 수로(92,96→368,96) → 물레방아 낙하(368,96→368,205 부근)
    //      → 아래 수로(395,330→92,330... 단순 폐로)
    const pipe: { x: number; y: number }[] = [
      { x: 92, y: 330 },
      { x: 92, y: 96 },
      { x: 368, y: 96 },
      { x: 368, y: 160 },
    ];
    const back: { x: number; y: number }[] = [
      { x: 395, y: 300 },
      { x: 395, y: 372 },
      { x: 92, y: 372 },
      { x: 92, y: 330 },
    ];
    // 수로(파이프) — 물색 파란 관
    for (const seg of [pipe, back]) {
      ctx.strokeStyle = "#2A4A6E";
      ctx.lineWidth = 22;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      seg.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      ctx.strokeStyle = "rgba(86,158,238,.5)";
      ctx.lineWidth = 15;
      ctx.beginPath();
      seg.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    // 물 흐름 점(파랑) — 두 세그먼트를 이어 흐름
    const flowPts = [...pipe, { x: 368, y: 205 }, { x: 395, y: 240 }, ...back];
    if (rate > 0.02) {
      let total = 0;
      const segs: { a: { x: number; y: number }; b: { x: number; y: number }; len: number }[] = [];
      for (let i = 0; i < flowPts.length - 1; i++) {
        const len = Math.hypot(flowPts[i + 1].x - flowPts[i].x, flowPts[i + 1].y - flowPts[i].y);
        segs.push({ a: flowPts[i], b: flowPts[i + 1], len });
        total += len;
      }
      const gap = 34;
      const n = Math.floor(total / gap);
      ctx.fillStyle = "rgba(150,214,255,.95)";
      ctx.shadowColor = "rgba(150,214,255,.8)";
      ctx.shadowBlur = 6;
      for (let k = 0; k < n; k++) {
        let d = (k * gap + phase * gap) % total;
        for (const sgm of segs) {
          if (d <= sgm.len) {
            const t = sgm.len ? d / sgm.len : 0;
            ctx.beginPath();
            ctx.arc(sgm.a.x + (sgm.b.x - sgm.a.x) * t, sgm.a.y + (sgm.b.y - sgm.a.y) * t, 3.4, 0, TAU);
            ctx.fill();
            break;
          }
          d -= sgm.len;
        }
      }
      ctx.shadowBlur = 0;
    }
    // 펌프(빨간 헤드 + 몸통)
    ctx.fillStyle = "#4E5E78";
    ctx.beginPath();
    ctx.roundRect(72, 250, 40, 84, 8);
    ctx.fill();
    const pg = ctx.createLinearGradient(70, 0, 114, 0);
    pg.addColorStop(0, "#FF8A76");
    pg.addColorStop(1, "#C23A28");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.roundRect(70, 218, 44, 36, 9);
    ctx.fill();
    ctx.strokeStyle = "#7E1E12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, 218, 44, 36, 9);
    ctx.stroke();
    // 펌프 상승 화살표(세기 비례 진동)
    ctx.fillStyle = `rgba(150,214,255,${0.4 + rate * 0.55})`;
    for (let i = 0; i < 3; i++) {
      const yy = 205 - i * 26 - (phase * 26) % 26;
      if (yy > 120) {
        ctx.beginPath();
        ctx.moveTo(92, yy - 8);
        ctx.lineTo(84, yy + 4);
        ctx.lineTo(100, yy + 4);
        ctx.closePath();
        ctx.fill();
      }
    }
    // 밸브(위 수로 중간)
    ctx.save();
    ctx.translate(168, 96);
    ctx.fillStyle = "#8C99AC";
    ctx.beginPath();
    ctx.roundRect(-6, -20, 12, 20, 3);
    ctx.fill();
    ctx.rotate(isOpen ? 0 : Math.PI / 2);
    const vg = ctx.createLinearGradient(-16, 0, 16, 0);
    vg.addColorStop(0, "#FF9A86");
    vg.addColorStop(1, "#C23A28");
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.roundRect(-17, -26, 34, 10, 5);
    ctx.fill();
    ctx.restore();
    // 물레방아
    ctx.save();
    ctx.translate(395, 205);
    ctx.rotate(wheel);
    ctx.strokeStyle = "#C9A05E";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#8A6A34";
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
      ctx.stroke();
      // 물받이 판
      ctx.save();
      ctx.translate(Math.cos(a) * 52, Math.sin(a) * 52);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = "#E8C890";
      ctx.fillRect(-11, -4, 22, 8);
      ctx.restore();
    }
    ctx.fillStyle = "#5E4A22";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, TAU);
    ctx.fill();
    ctx.restore();
    // 낙하수(수로 끝 → 방아 위)
    if (rate > 0.02) {
      ctx.strokeStyle = `rgba(150,214,255,${0.35 + rate * 0.5})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(368, 108);
      ctx.quadraticCurveTo(372, 150, 386, 168);
      ctx.stroke();
    }
  }

  // ── 전기 회로(우) — 물 회로와 같은 구도 ──
  function drawElecSide(ctx: CanvasRenderingContext2D, rate: number, phase: number, isOpen: boolean): void {
    ctx.font = "800 17px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(${ELEC.amber},.9)`;
    ctx.fillText("전기 회로", 790, 34);

    // 폐회로: 전지(745,388) → 왼쪽 위로 → 위 전선 → 전구(920,205) → 아래로 → 스위치(872,388) → 전지
    const loopPts = [
      { x: 700, y: 388 },
      { x: 610, y: 388 },
      { x: 610, y: 96 },
      { x: 920, y: 96 },
      { x: 920, y: 175 },
    ];
    const loopPts2 = [
      { x: 920, y: 245 },
      { x: 920, y: 388 },
      { x: 896, y: 388 },
    ];
    const loopPts3 = [
      { x: 848, y: 388 },
      { x: 790, y: 388 },
    ];
    drawWire(ctx, loopPts, { on: rate > 0.02, flow: phase, width: 5 });
    drawWire(ctx, loopPts2, { on: rate > 0.02, flow: phase, width: 5 });
    drawWire(ctx, loopPts3, { on: rate > 0.02, flow: phase, width: 5 });
    drawBattery(ctx, 745, 388, 86, 34);
    drawBulb(ctx, 920, 205, 26, rate);
    drawSwitch(ctx, 872, 388, isOpen, 44);
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    rot?.dispose();
    rot = null;
    toastEl = null;
    statusPill = null;
    missionEls = null;
    window.clearTimeout(toastTimer);
    enterBtn.classList.remove("pulse");
    (enterBtn.querySelector("span") as HTMLElement).textContent = finished ? "비유 실험 다시 열기" : "가로 화면으로 이어서 열기";
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("가로 화면에서 비유를 완성해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    rot?.dispose();
    window.clearTimeout(toastTimer);
  };
};

// 세로 진입 카드 미니 아트 — 물레방아↔전구 스케치
function enterArtSvg(): string {
  return `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="360" height="120" fill="#0B1524"/>
    <path d="M30 88V38h96" stroke="#2A4A6E" stroke-width="10" stroke-linecap="round"/>
    <path d="M30 88V38h96" stroke="rgba(86,158,238,.55)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="146" cy="62" r="22" stroke="#C9A05E" stroke-width="4"/>
    ${[0, 1, 2, 3].map((i) => `<line x1="146" y1="62" x2="${146 + Math.cos((i / 4) * 6.283) * 22}" y2="${62 + Math.sin((i / 4) * 6.283) * 22}" stroke="#8A6A34" stroke-width="3"/>`).join("")}
    <rect x="22" y="84" width="18" height="16" rx="4" fill="#C23A28"/>
    <path d="M206 92h44M206 92V44h110v22" stroke="#8FA4C2" stroke-width="4" stroke-linecap="round"/>
    <circle cx="316" cy="80" r="13" fill="rgba(255,214,120,.9)"/>
    <circle cx="316" cy="80" r="20" fill="rgba(255,214,120,.25)"/>
    <rect x="252" y="84" width="34" height="15" rx="4" fill="#8FA0B8" stroke="#3E4B66" stroke-width="1.6"/>
    <text x="20" y="24" font-family="Pretendard, sans-serif" font-size="12" font-weight="800" fill="#C2D2EE">물의 흐름 ↔ 전류</text>
  </svg>`;
}
