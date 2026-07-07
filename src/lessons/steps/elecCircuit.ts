// elecCircuit — 저항(전구)의 직렬·병렬 연결 랩(중2 VII L5, 책 254~255쪽).
//   circuitLab: [전구 1개 / 직렬 2개 / 병렬 2개] 세그 + 스위치 탭 + 전구 빼기/끼우기 토글.
//   · 회로 레이아웃(논리 좌표, 캔버스 H=320): 사각 루프 left/right = cx ± clamp(W·0.40, 112, 132),
//     전지 하단 중앙(cx−34, y=254), 스위치 하단 우측(cx+66), 상변 y=88(1개·직렬은 전구가 상변 소켓에),
//     병렬은 가지 두 개 yA=80·yB=142(분기점은 좌우 세로선 위 y=142). 소켓 단자 간격 28px.
//   · 전류는 (+)→(−) 관례 방향의 앰버 점 흐름(drawWire) — 점 속도 ∝ 그 구간 전류.
//     병렬은 본선(전체 전류)과 가지(가지 전류)의 점 속도가 달라 "전류가 갈라진다"가 몸으로 읽힌다.
//   · 같은 전구 기준 과학 사실: 직렬 2개는 저항↑ → 전류 절반(0.5×) → 둘 다 어둡다(밝기 0.55).
//     병렬 2개는 각자 같은 전압 → 1개일 때와 같은 밝기(1.0), 전체 전류는 2×.
//     직렬은 하나만 빠져도 전멸(0×), 병렬은 하나가 빠져도 나머지 생존(전체 1×).
// 목표 4: ① 기준 밝기(1개 켜기) ② 직렬 어두워짐 ③ 병렬 같은 밝기 ④ 빼기(직렬 전멸 + 병렬 생존).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawBattery, drawBulb, drawSwitch, drawWire, ELEC, TAU } from "../../ui/elecKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Mode = "single" | "series" | "parallel";
const MODE_NAME: Record<Mode, string> = { single: "전구 1개", series: "직렬 2개", parallel: "병렬 2개" };
const CVH = 320; // 캔버스 높이
const FLOW_RATE = 0.03; // 정규화 dt당 점 흐름 위상 — 전류 1×에서 약 47px/s

interface Pt {
  x: number;
  y: number;
}
interface BulbGeo {
  sx: number; // 소켓 장착 시 전구(유리구) 중심 x
  sy: number; // 중심 y — 소켓 전선은 sy+21에 지나간다
  fx: number; // 빠져서 떠 있을 때 중심 x
  fy: number;
}
interface Geo {
  cx: number;
  left: number;
  right: number;
  yTop: number;
  yA: number;
  yB: number;
  yBot: number;
  bx: number; // 전지 중심
  swx: number; // 스위치 중심
  bulbs: BulbGeo[];
}

export const circuitLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "lt-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      "aria-label": "회로 실험 무대. 엔터 키로 스위치를 여닫고, 숫자 1과 2 키로 전구를 빼거나 끼워요.",
    },
  });
  const segBtns: Record<Mode, HTMLButtonElement> = {} as Record<Mode, HTMLButtonElement>;
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  (Object.keys(MODE_NAME) as Mode[]).forEach((k) => {
    const b = el("button", { text: MODE_NAME[k], attrs: { type: "button", "aria-pressed": String(k === "single") } });
    if (k === "single") b.classList.add("on");
    b.addEventListener("click", () => pick(k));
    segBtns[k] = b;
    seg.appendChild(b);
  });
  const hudDot = el("span", { class: "pdot", style: "background:#5E7090" });
  const hudRead = el("span", { text: "전구 1개 · 전체 전류 0×" });
  const hudBot = el(
    "div",
    { class: "stage-hud", style: "top:auto;bottom:12px;justify-content:flex-start" },
    el("div", { class: "pill" }, hudDot, hudRead),
  );
  const toastEl = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg), hudBot, toastEl);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "one" } }, el("b", { text: "전구 1개" }), el("span", { text: "기준 밝기 보기" })),
    el("div", { class: "pn-badge", dataset: { g: "series" } }, el("b", { text: "직렬 2개" }), el("span", { text: "어두울까?" })),
    el("div", { class: "pn-badge", dataset: { g: "parallel" } }, el("b", { text: "병렬 2개" }), el("span", { text: "같을까?" })),
    el("div", { class: "pn-badge", dataset: { g: "pull" } }, el("b", { text: "빼기 실험" }), el("span", { text: "하나 빼면?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지금은 <b>전구 1개</b> 회로예요. 오른쪽 아래 <b>스위치를 탭해 닫고</b>, 이 전구의 밝기를 기준으로 봐 두세요.",
  });
  host.append(goalChips, stage, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let mode: Mode = "single";
  let closed = false; // 스위치
  const bulbIn = [true, true]; // 소켓 장착 여부(단일 모드는 [0]만 사용)
  const bright = [0, 0]; // 표시 밝기(목표로 수렴)
  let mainFlow = 0; // 본선 점 흐름 위상(∝ 전체 전류)
  let brAFlow = 0; // 병렬 가지 A(위) — ∝ 가지 전류
  let brBFlow = 0; // 병렬 가지 B(아래)
  let litMs = 0; // 현재 구성으로 점등 유지 시간(관찰 대기)
  let nudged = false; // "기준 먼저" 안내를 모드 진입당 1회만
  let everSwitched = false;
  let everRemoved = false;
  let pullSeries = false; // ④-a 직렬 전멸 관찰
  let pullParallel = false; // ④-b 병렬 생존 관찰
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let hudShown = "";

  function geom(): Geo {
    const cx = W / 2;
    const halfW = clamp(W * 0.4, 112, 132);
    const left = cx - halfW;
    const right = cx + halfW;
    const yTop = 88;
    const yA = 80;
    const yB = 142;
    const yBot = 254;
    const bx = cx - 34;
    const swx = cx + 66;
    let bulbs: BulbGeo[];
    if (mode === "single") bulbs = [{ sx: cx, sy: yTop - 21, fx: cx - 56, fy: yTop + 22 }];
    else if (mode === "series")
      bulbs = [
        { sx: cx - 56, sy: yTop - 21, fx: cx - 92, fy: yTop + 26 },
        { sx: cx + 56, sy: yTop - 21, fx: cx + 92, fy: yTop + 26 },
      ];
    else
      bulbs = [
        { sx: cx, sy: yA - 21, fx: cx - 66, fy: yA + 26 },
        { sx: cx, sy: yB - 21, fx: cx - 66, fy: yB + 40 },
      ];
    return { cx, left, right, yTop, yA, yB, yBot, bx, swx, bulbs };
  }

  /** 전체 전류(1개 켜짐 기준 상대값): 0 / 0.5 / 1 / 2. */
  function currentI(): number {
    if (!closed) return 0;
    if (mode === "single") return bulbIn[0] ? 1 : 0;
    if (mode === "series") return bulbIn[0] && bulbIn[1] ? 0.5 : 0;
    return (bulbIn[0] ? 1 : 0) + (bulbIn[1] ? 1 : 0);
  }
  function branchI(i: number): number {
    if (mode !== "parallel") return currentI();
    return closed && bulbIn[i] ? 1 : 0;
  }
  function bulbTarget(i: number): number {
    if (!closed) return 0;
    if (mode === "single") return i === 0 && bulbIn[0] ? 1 : 0;
    if (mode === "series") return bulbIn[0] && bulbIn[1] ? 0.55 : 0;
    return bulbIn[i] ? 1 : 0;
  }
  const fmtI = (v: number): string => (v === 0.5 ? "0.5×" : `${v}×`);

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
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "<b>직렬은 전류의 길이 하나</b> — 저항이 늘수록 전류가 줄고 하나만 끊겨도 끝. <b>병렬은 길이 여러 개</b> — 각자 같은 전압을 받아 밝기가 그대로!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function pullProgress(): void {
    if (goals.has("pull")) return;
    if (pullSeries && pullParallel) {
      collect("pull", "전멸·생존!", "직렬은 전멸, 병렬은 생존 — 빼기 실험 완료");
      if (!finished) helper.innerHTML = "빼기 실험 완료 — <b>직렬은 전멸, 병렬은 생존</b>! 남은 목표도 마저 확인해 봐요.";
    } else {
      const spanEl = goalChips.querySelector('[data-g="pull"] span') as HTMLElement;
      spanEl.textContent = pullSeries ? "병렬에서도!" : "직렬에서도!";
    }
  }

  function pick(k: Mode): void {
    if (mode === k) return;
    mode = k;
    bulbIn[0] = true;
    bulbIn[1] = true;
    litMs = 0;
    nudged = false;
    (Object.keys(segBtns) as Mode[]).forEach((kk) => {
      segBtns[kk].classList.toggle("on", kk === k);
      segBtns[kk].setAttribute("aria-pressed", String(kk === k));
    });
    haptic(HAPTIC.select);
    if (finished) return;
    if (k === "single") helper.innerHTML = "<b>전구 1개</b> — 스위치를 닫으면 이 밝기가 비교 기준이 돼요.";
    else if (k === "series")
      helper.innerHTML = "<b>직렬 2개</b> — 전류가 지나는 길이 <b>하나</b>뿐이에요. 1개일 때보다 밝을까요, 어두울까요?";
    else helper.innerHTML = "<b>병렬 2개</b> — 길이 <b>두 갈래</b>로 나뉘어요. 이번엔 밝기가 어떻게 될까요?";
  }

  function toggleSwitch(): void {
    closed = !closed;
    everSwitched = true;
    litMs = 0;
    haptic(HAPTIC.tap);
    if (closed) toast(currentI() > 0 ? "스위치 닫힘 — 전류가 흘러요" : "스위치 닫힘 — 그런데 회로가 끊겨 있어요");
    else toast("스위치 열림 — 전류가 멈췄어요");
  }

  function toggleBulb(i: number): void {
    const wasI = currentI();
    bulbIn[i] = !bulbIn[i];
    litMs = 0;
    haptic(HAPTIC.tap);
    if (bulbIn[i]) {
      toast("전구를 다시 끼웠어요");
      return;
    }
    everRemoved = true;
    const otherIn = mode !== "single" && bulbIn[1 - i];
    if (mode === "series" && closed && wasI > 0) {
      toast("직렬에서 하나를 빼니 — 전부 꺼졌어요(전류 0×)");
      if (!pullSeries) {
        pullSeries = true;
        if (!finished && !pullParallel)
          helper.innerHTML = "직렬은 하나만 빠져도 <b>길이 끊겨 전부 소등</b>이에요(전류 0×). 이제 <b>병렬</b>에서도 빼 볼까요?";
        pullProgress();
      }
    } else if (mode === "parallel" && closed && otherIn && wasI > 0) {
      toast("병렬에서 하나를 빼도 — 나머지는 그대로!(전류 1×)");
      if (!pullParallel) {
        pullParallel = true;
        if (!finished && !pullSeries)
          helper.innerHTML =
            "병렬은 하나가 빠져도 <b>나머지 가지로 전류가 계속</b> 흘러요 — 남은 전구는 그대로 밝죠(전체 전류 1×). <b>직렬</b>에서도 빼 보면?";
        pullProgress();
      }
    } else {
      toast(closed && wasI > 0 ? "전구를 뺐어요 — 회로가 끊겼어요" : "전구를 뺐어요");
    }
  }

  // ---- 입력: 캔버스 탭(전구 → 스위치 순서 히트 판정) + 키보드 ----
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const g = geom();
    for (let i = 0; i < g.bulbs.length; i++) {
      const b = g.bulbs[i];
      const cxb = bulbIn[i] ? b.sx : b.fx;
      const cyb = bulbIn[i] ? b.sy : b.fy;
      if (Math.hypot(px - cxb, py - cyb) < 30) {
        toggleBulb(i);
        return;
      }
    }
    if (Math.hypot(px - g.swx, py - (g.yBot - 8)) < 34) toggleSwitch();
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === " " || e.key === "Enter") toggleSwitch();
    else if (e.key === "1") toggleBulb(0);
    else if (e.key === "2" && mode !== "single") toggleBulb(1);
    else return;
    e.preventDefault();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("keydown", onKey);

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const g = geom();
    const I = currentI();
    const iA = branchI(0);
    const iB = branchI(1);

    // 흐름 위상·밝기 수렴
    mainFlow += I * FLOW_RATE * dt;
    brAFlow += iA * FLOW_RATE * dt;
    brBFlow += iB * FLOW_RATE * dt;
    for (let i = 0; i < 2; i++) bright[i] += (bulbTarget(i) - bright[i]) * Math.min(1, 0.2 * dt);

    // 관찰 목표(잠깐 켜 둔 상태를 눈으로 본 뒤 달성)
    if (I > 0) litMs += dt * 16.7;
    else litMs = 0;
    if (I > 0 && litMs > 550) {
      if (mode === "single" && !goals.has("one")) {
        collect("one", "1× 기준!", "기준 밝기 확인 — 전체 전류 1×");
        if (!finished) helper.innerHTML = "이 밝기(전류 1×)가 <b>기준</b>이에요. 위 세그에서 <b>직렬 2개</b>로 바꿔 비교해 보세요.";
      } else if (mode === "series" && bulbIn[0] && bulbIn[1] && !goals.has("series")) {
        if (goals.has("one")) {
          collect("series", "어두워짐!", "직렬 2개 — 둘 다 어두워요(전류 0.5×)");
          if (!finished)
            helper.innerHTML = "직렬은 <b>전체 저항이 늘어 전류가 절반</b>(0.5×) — 그래서 둘 다 어두워요. 다음은 <b>병렬 2개</b>!";
        } else if (!nudged) {
          nudged = true;
          toast("먼저 전구 1개에서 기준 밝기를 봐 두세요");
        }
      } else if (mode === "parallel" && bulbIn[0] && bulbIn[1] && !goals.has("parallel")) {
        if (goals.has("one")) {
          collect("parallel", "같은 밝기!", "병렬 2개 — 1개일 때와 같은 밝기(전체 전류 2×)");
          if (!finished)
            helper.innerHTML =
              "병렬은 각 전구가 <b>같은 전압</b>을 그대로 받아 <b>같은 밝기</b>(전체 전류는 2×)! 이제 <b>전구를 탭해 빼기 실험</b> — 직렬과 병렬이 다를까요?";
        } else if (!nudged) {
          nudged = true;
          toast("먼저 전구 1개에서 기준 밝기를 봐 두세요");
        }
      }
    }

    const wire = (pts: Pt[], flow?: number): void =>
      drawWire(ctx, pts, flow === undefined ? {} : { on: true, flow });

    // ---- 전선(기본) + 전류 점 흐름(전도 시 덧그리기) ----
    const yBot = g.yBot;
    if (mode !== "parallel") {
      const yTop = g.yTop;
      const b0 = g.bulbs[0];
      wire([{ x: g.bx + 44, y: yBot }, { x: g.swx - 22, y: yBot }]);
      if (mode === "single") {
        wire([{ x: g.swx + 22, y: yBot }, { x: g.right, y: yBot }, { x: g.right, y: yTop }, { x: b0.sx + 14, y: yTop }]);
        wire([{ x: b0.sx - 14, y: yTop }, { x: g.left, y: yTop }, { x: g.left, y: yBot }, { x: g.bx - 37, y: yBot }]);
      } else {
        const b1 = g.bulbs[1];
        wire([{ x: g.swx + 22, y: yBot }, { x: g.right, y: yBot }, { x: g.right, y: yTop }, { x: b1.sx + 14, y: yTop }]);
        wire([{ x: b1.sx - 14, y: yTop }, { x: b0.sx + 14, y: yTop }]);
        wire([{ x: b0.sx - 14, y: yTop }, { x: g.left, y: yTop }, { x: g.left, y: yBot }, { x: g.bx - 37, y: yBot }]);
      }
      if (I > 0)
        wire(
          [
            { x: g.bx + 44, y: yBot },
            { x: g.right, y: yBot },
            { x: g.right, y: yTop },
            { x: g.left, y: yTop },
            { x: g.left, y: yBot },
            { x: g.bx - 37, y: yBot },
          ],
          mainFlow,
        );
    } else {
      const { yA, yB } = g;
      const bA = g.bulbs[0];
      const bB = g.bulbs[1];
      wire([{ x: g.bx + 44, y: yBot }, { x: g.swx - 22, y: yBot }]);
      wire([{ x: g.swx + 22, y: yBot }, { x: g.right, y: yBot }, { x: g.right, y: yA }, { x: bA.sx + 14, y: yA }]);
      wire([{ x: bA.sx - 14, y: yA }, { x: g.left, y: yA }, { x: g.left, y: yBot }, { x: g.bx - 37, y: yBot }]);
      wire([{ x: g.right, y: yB }, { x: bB.sx + 14, y: yB }]);
      wire([{ x: bB.sx - 14, y: yB }, { x: g.left, y: yB }]);
      if (I > 0) {
        // 본선(전체 전류) — 점이 빠르고, 분기점에서 가지 속도로 갈라진다
        wire([{ x: g.bx + 44, y: yBot }, { x: g.right, y: yBot }, { x: g.right, y: yB }], mainFlow);
        wire([{ x: g.left, y: yB }, { x: g.left, y: yBot }, { x: g.bx - 37, y: yBot }], mainFlow);
        if (iA > 0) wire([{ x: g.right, y: yB }, { x: g.right, y: yA }, { x: g.left, y: yA }, { x: g.left, y: yB }], brAFlow);
        if (iB > 0) wire([{ x: g.right, y: yB }, { x: g.left, y: yB }], brBFlow);
      }
      // 분기점
      ctx.fillStyle = "#AEBDD6";
      for (const jx of [g.left, g.right]) {
        ctx.beginPath();
        ctx.arc(jx, yB, 4.2, 0, TAU);
        ctx.fill();
      }
    }

    // 소켓 단자(전구가 빠지면 이 사이가 끊긴 채 드러난다)
    ctx.fillStyle = ELEC.wire;
    for (const b of g.bulbs) {
      const wy = b.sy + 21;
      for (const tx of [b.sx - 14, b.sx + 14]) {
        ctx.beginPath();
        ctx.arc(tx, wy, 4, 0, TAU);
        ctx.fill();
      }
    }
    // 빠진 자리 안내(점선 고스트)
    g.bulbs.forEach((b, i) => {
      if (bulbIn[i]) return;
      ctx.strokeStyle = "rgba(150,176,210,.4)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(b.sx, b.sy, 13.5, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    drawBattery(ctx, g.bx, yBot);
    drawSwitch(ctx, g.swx, yBot, closed);

    // 스위치 유도 화살표(첫 조작 전까지)
    if (!everSwitched) {
      const bob = Math.sin(tMs / 300) * 4;
      ctx.strokeStyle = "rgba(255,194,77,.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(g.swx + 30, yBot - 78 + bob);
      ctx.lineTo(g.swx + 30, yBot - 50 + bob);
      ctx.moveTo(g.swx + 24, yBot - 58 + bob);
      ctx.lineTo(g.swx + 30, yBot - 50 + bob);
      ctx.lineTo(g.swx + 36, yBot - 58 + bob);
      ctx.stroke();
    }
    // 빼기 실험 유도 링(병렬 목표 달성 후, 첫 빼기 전까지)
    if (goals.has("parallel") && !everRemoved && bulbIn[0]) {
      const b0 = g.bulbs[0];
      ctx.strokeStyle = "rgba(255,194,77,.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(b0.sx, b0.sy, 27 + Math.sin(tMs / 240) * 3, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 전구(장착 = 소켓 위, 분리 = 옆에 떠서 까딱까딱)
    g.bulbs.forEach((b, i) => {
      const lit = clamp(bright[i], 0, 1);
      if (bulbIn[i]) drawBulb(ctx, b.sx, b.sy, 20, lit);
      else {
        const fy = b.fy + Math.sin(tMs / 420 + i * 1.7) * 3;
        ctx.save();
        ctx.globalAlpha = 0.92;
        drawBulb(ctx, b.fx, fy, 20, 0);
        ctx.restore();
      }
    });

    // HUD 필: 모드명 · 전체 전류 N×
    const hudTxt = `${MODE_NAME[mode]} · 전체 전류 ${fmtI(I)}`;
    if (hudTxt !== hudShown) {
      hudShown = hudTxt;
      hudRead.textContent = hudTxt;
      hudDot.style.background = I > 0 ? "#FFC24D" : "#5E7090";
      hudDot.style.boxShadow = I > 0 ? "0 0 10px rgba(255,194,77,.85)" : "none";
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

  api.setCTA("기준 → 직렬 → 병렬 → 빼기, 차례로!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("keydown", onKey);
  };
};
