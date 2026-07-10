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
// 두 회로는 **위치까지 거울 대칭**(교과서 그림 VII-5 구도): 왼쪽 세로 = 펌프↔전지,
// 위 가운데 = 밸브↔스위치, 오른쪽 = 물레방아↔전구, 아래 = 수도관↔전선. 오프셋 +518.
const SPOTS: Spot[] = [
  { id: "pump", side: "water", label: "펌프", x: 92, y: 240, r: 52 },
  { id: "valve", side: "water", label: "밸브", x: 244, y: 96, r: 36 },
  { id: "flow", side: "water", label: "물의 흐름", x: 155, y: 96, r: 38 },
  { id: "wheel", side: "water", label: "물레방아", x: 395, y: 205, r: 55 },
  { id: "pipe", side: "water", label: "수도관", x: 244, y: 372, r: 46 },
  { id: "battery", side: "elec", label: "전지", x: 610, y: 240, r: 52 },
  { id: "switch", side: "elec", label: "스위치", x: 762, y: 96, r: 36 },
  { id: "current", side: "elec", label: "전류", x: 673, y: 96, r: 38 },
  { id: "bulb", side: "elec", label: "전구", x: 913, y: 205, r: 52 },
  { id: "wire", side: "elec", label: "전선", x: 762, y: 372, r: 46 },
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
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

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

  // ── 물 회로(좌) — 교과서 그림 VII-5 구도. 폐로: 왼쪽(펌프 상승) → 위(밸브) → 오른쪽(낙하 → 물레방아) → 아래 귀환 ──
  function drawWaterSide(ctx: CanvasRenderingContext2D, rate: number, phase: number, wheel: number, isOpen: boolean): void {
    // 제목
    ctx.font = "800 17px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(150,196,255,.9)";
    ctx.fillText("물의 회로", 244, 34);

    // 관: 위 구간(왼쪽 세로 → 위 가로 → 오른쪽 세로, 끝이 물레방아 위에서 열림) + 아래 귀환 구간
    const pipe: { x: number; y: number }[] = [
      { x: 92, y: 372 },
      { x: 92, y: 96 },
      { x: 395, y: 96 },
      { x: 395, y: 118 },
    ];
    const back: { x: number; y: number }[] = [
      { x: 395, y: 262 },
      { x: 395, y: 372 },
      { x: 92, y: 372 },
    ];
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
    // 물 흐름 점(파랑) — 폐로 전체를 한 경로로(방아 구간은 방아가 위에 그려져 자연히 가려진다)
    const flowPts = [...pipe, ...back];
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
    // 낙하수(관 끝 → 방아 위) — 세기 비례 폭
    if (rate > 0.02) {
      ctx.strokeStyle = `rgba(150,214,255,${0.4 + rate * 0.5})`;
      ctx.lineWidth = 5 + rate * 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(395, 122);
      ctx.lineTo(395, 152);
      ctx.stroke();
    }
    // 펌프(왼쪽 세로 관 위 — 전지와 같은 위치) : 몸통 + 빨간 헤드 + 상승 화살표
    ctx.fillStyle = "#4E5E78";
    ctx.beginPath();
    ctx.roundRect(72, 214, 40, 84, 8);
    ctx.fill();
    ctx.strokeStyle = "#25324A";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(72, 214, 40, 84, 8);
    ctx.stroke();
    const pg = ctx.createLinearGradient(70, 0, 114, 0);
    pg.addColorStop(0, "#FF8A76");
    pg.addColorStop(1, "#C23A28");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.roundRect(70, 184, 44, 34, 9);
    ctx.fill();
    ctx.strokeStyle = "#7E1E12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, 184, 44, 34, 9);
    ctx.stroke();
    // 펌프 상승 화살표(펌프 위 관 속, 세기 비례)
    ctx.fillStyle = `rgba(150,214,255,${0.4 + rate * 0.55})`;
    for (let i = 0; i < 2; i++) {
      const yy = 172 - i * 26 - (phase * 26) % 26;
      if (yy > 116) {
        ctx.beginPath();
        ctx.moveTo(92, yy - 8);
        ctx.lineTo(84, yy + 4);
        ctx.lineTo(100, yy + 4);
        ctx.closePath();
        ctx.fill();
      }
    }
    // 밸브(위 관 가운데 — 스위치와 같은 위치)
    ctx.save();
    ctx.translate(244, 96);
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
    // 물레방아(오른쪽 — 전구와 같은 위치, 낙하수가 위에서 때린다)
    ctx.save();
    ctx.translate(395, 205);
    ctx.rotate(wheel);
    ctx.strokeStyle = "#C9A05E";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#8A6A34";
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
      ctx.stroke();
      // 물받이 판
      ctx.save();
      ctx.translate(Math.cos(a) * 48, Math.sin(a) * 48);
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
  }

  // ── 전기 회로(우) — 물 회로와 거울 대칭(+518): 전지 왼쪽 세로·스위치 위·전구 오른쪽 ──
  function drawElecSide(ctx: CanvasRenderingContext2D, rate: number, phase: number, isOpen: boolean): void {
    ctx.font = "800 17px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(${ELEC.amber},.9)`;
    ctx.fillText("전기 회로", 762, 34);

    // 관례 전류 방향((+)→스위치→전구→(−)) 순서로 점이 흐르게 경로를 나눈다.
    // 전지: 세로(중심 610,240 · 몸통 반 43) — (+)극 위. 스위치: (762,96) 접점 ±22. 전구: (913,205) r26.
    const wireA = [
      { x: 610, y: 197 },
      { x: 610, y: 96 },
      { x: 740, y: 96 },
    ];
    const wireB = [
      { x: 784, y: 96 },
      { x: 913, y: 96 },
      { x: 913, y: 179 },
    ];
    const wireC = [
      { x: 913, y: 233 },
      { x: 913, y: 372 },
      { x: 610, y: 372 },
      { x: 610, y: 283 },
    ];
    const on = rate > 0.02;
    drawWire(ctx, wireA, { on, flow: phase, width: 5 });
    drawWire(ctx, wireB, { on, flow: phase, width: 5 });
    drawWire(ctx, wireC, { on, flow: phase, width: 5 });
    // 전지 — 세로((+)캡 위, 라벨은 elecKit vert 모드가 바로 세워 준다)
    drawBattery(ctx, 610, 240, 86, 34, false, true);
    drawBulb(ctx, 913, 205, 26, rate);
    drawSwitch(ctx, 762, 96, isOpen, 44);
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

// 세로 진입 카드 미니 아트 — 거울 대칭 두 폐로(펌프↔전지 왼쪽 · 밸브↔스위치 위 · 물레방아↔전구 오른쪽)
function enterArtSvg(): string {
  const wheel = `
    <circle cx="160" cy="70" r="15" stroke="#C9A05E" stroke-width="3.4"/>
    ${[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      return `<line x1="160" y1="70" x2="${(160 + Math.cos(a) * 15).toFixed(1)}" y2="${(70 + Math.sin(a) * 15).toFixed(1)}" stroke="#8A6A34" stroke-width="2.6"/>`;
    }).join("")}`;
  return `<svg viewBox="0 0 360 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect width="360" height="128" fill="#0B1524"/>
    <text x="18" y="22" font-family="Pretendard, sans-serif" font-size="12" font-weight="800" fill="#C2D2EE">물의 회로</text>
    <text x="206" y="22" font-family="Pretendard, sans-serif" font-size="12" font-weight="800" fill="#FFD98C">전기 회로</text>
    <!-- 물 폐로: 왼쪽 세로(펌프) → 위(밸브) → 오른쪽(낙하 → 물레방아) → 아래 귀환 -->
    <path d="M28 108V36H160v14M160 92v16H28" stroke="#2A4A6E" stroke-width="9"/>
    <path d="M28 108V36H160v14M160 92v16H28" stroke="rgba(86,158,238,.55)" stroke-width="5"/>
    <path d="M160 52v8" stroke="rgba(150,214,255,.8)" stroke-width="3.4"/>
    ${wheel}
    <rect x="20" y="62" width="16" height="26" rx="4" fill="#4E5E78" stroke="#25324A" stroke-width="1.4"/>
    <rect x="18" y="52" width="20" height="13" rx="4" fill="#C23A28" stroke="#7E1E12" stroke-width="1.4"/>
    <rect x="88" y="26" width="4.5" height="10" rx="2" fill="#8C99AC"/>
    <rect x="82" y="22" width="17" height="5" rx="2.5" fill="#E86450"/>
    <!-- 전기 폐로(+180 거울): 왼쪽 세로(전지) → 위(스위치) → 오른쪽(전구) → 아래 귀환 -->
    <path d="M208 108V36h60M282 36h58v22M340 84v24H208" stroke="#4E5E78" stroke-width="6.5"/>
    <path d="M208 108V36h60M282 36h58v22M340 84v24H208" stroke="#8FA4C2" stroke-width="3"/>
    <rect x="200" y="58" width="16" height="30" rx="4" fill="#8FA0B8" stroke="#25324A" stroke-width="1.4"/>
    <rect x="204.5" y="53" width="7" height="5" rx="2" fill="#D8B04A"/>
    <text x="208" y="68" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="9" font-weight="800" fill="#F2F7FF">+</text>
    <text x="208" y="83" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="9" font-weight="800" fill="#F2F7FF">−</text>
    <circle cx="268" cy="36" r="2.6" fill="#AEBDD6"/>
    <circle cx="282" cy="36" r="2.6" fill="#AEBDD6"/>
    <path d="M268 36l12-7" stroke="#C9D8EE" stroke-width="3"/>
    <circle cx="340" cy="71" r="16" fill="rgba(255,214,120,.22)"/>
    <circle cx="340" cy="71" r="10" fill="rgba(255,214,120,.92)"/>
    <path d="M336 74q2-5 4-1t4-1" stroke="#C87F2E" stroke-width="1.6"/>
  </svg>`;
}
