// streakLab — 광물 특성 랩(중2 II 지권의 변화 L2). 교과서 탐구(62~63쪽)의 조작판.
//   · 위: 광물 5종 트레이(발주 실사 webp, 없으면 색 견본 폴백) — 석영·장석·흑운모·방해석·자철석
//   · 무대: 흰 초벌구이 조흔판. 광물을 잡고 드래그로 문지르면 가루색 스트로크가 실제로 쌓인다
//     (석영은 조흔판보다 단단해 자국이 안 남고 불꽃 + 끼익 토스트)
//   · 버튼: 클립 대보기(자성 — 자철석만 착) · 묽은 염산(방해석만 보글) · 굳기 긁기(석영↔방해석) · 판 닦기
// 목표: ① 가루색 발견(자철석 검은 조흔) ② 자성 찾기(클립 실험) ③ 거품의 정체(방해석 염산 반응).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow, softGlow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

interface StreakStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type MinId = "quartz" | "feldspar" | "biotite" | "calcite" | "magnetite";

interface MinDef {
  id: MinId;
  name: string;
  surfWord: string; // 겉색 한 마디(HUD)
  dot: string; // HUD pdot 색
  grad: [string, string, string]; // 몸통 3스톱(좌상단 키라이트 방향)
  line: string; // 재질별 최암색 외곽선
  powder: string | null; // 조흔(가루) 색 — 석영은 null(판보다 단단)
  powderEdge: string; // 가루 밑 그림자색
  poly: ReadonlyArray<readonly [number, number]>; // 표본 폴리곤(로컬)
  spec: readonly [readonly [number, number], readonly [number, number]]; // 스펙큘러 선분
  layers?: boolean; // 흑운모 판상 결
}

const MINS: MinDef[] = [
  {
    id: "quartz",
    name: "석영",
    surfWord: "무색",
    dot: "#DCEAF5",
    grad: ["#F0F7FC", "#CBDCEA", "#9DB4C8"],
    line: "#5C7186",
    powder: null,
    powderEdge: "rgba(90,80,60,.18)",
    poly: [
      [0, -30],
      [15, -15],
      [13, 17],
      [0, 25],
      [-13, 17],
      [-15, -15],
    ],
    spec: [
      [-9, -19],
      [-2, -27],
    ],
  },
  {
    id: "feldspar",
    name: "장석",
    surfWord: "연분홍",
    dot: "#E9C9B8",
    grad: ["#F6E4D9", "#E2C3B2", "#BE9884"],
    line: "#7C5F50",
    powder: "#FAF8F2",
    powderEdge: "rgba(90,80,60,.18)",
    poly: [
      [-26, -14],
      [8, -21],
      [26, -8],
      [22, 15],
      [-6, 21],
      [-24, 12],
    ],
    spec: [
      [-20, -11],
      [-2, -17],
    ],
  },
  {
    id: "biotite",
    name: "흑운모",
    surfWord: "검은색",
    dot: "#41362C",
    grad: ["#5C4E42", "#352B23", "#1A1510"],
    line: "#0C0906",
    powder: "#E6E3DA",
    powderEdge: "rgba(70,62,48,.2)",
    poly: [
      [-26, -10],
      [0, -18],
      [26, -10],
      [24, 9],
      [0, 17],
      [-24, 11],
    ],
    spec: [
      [-18, -11],
      [2, -16],
    ],
    layers: true,
  },
  {
    id: "calcite",
    name: "방해석",
    surfWord: "흰색",
    dot: "#F0EAD9",
    grad: ["#FAF7EE", "#E8E1CE", "#C8BFA4"],
    line: "#8C8266",
    powder: "#FAF8F2",
    powderEdge: "rgba(90,80,60,.18)",
    poly: [
      [-24, -10],
      [12, -21],
      [24, 10],
      [-12, 21],
    ],
    spec: [
      [-16, -10],
      [2, -16],
    ],
  },
  {
    id: "magnetite",
    name: "자철석",
    surfWord: "검은색",
    dot: "#3E4450",
    grad: ["#6E7482", "#3B3F49", "#1D2027"],
    line: "#0B0D12",
    powder: "#2A2A33",
    powderEdge: "rgba(0,0,0,.35)",
    poly: [
      [0, -24],
      [20, -6],
      [14, 17],
      [-12, 19],
      [-21, -4],
    ],
    spec: [
      [-12, -12],
      [-1, -20],
    ],
  },
];

const CVH = 342; // 무대 캔버스 높이
const PY0 = 172; // 조흔판 윗변
const PY1 = 306; // 조흔판 아랫변
const STREAK_GOAL = 110; // 자철석 조흔 목표 누적 거리(px)

interface StrokePt {
  x: number; // 판 중심 기준 상대 좌표(리사이즈에도 판과 함께 움직인다)
  y: number;
}
interface Stroke {
  pts: StrokePt[];
  powder: string;
  edge: string;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  spark: boolean;
}
interface Bubble {
  x: number;
  y: number;
  vy: number;
  r: number;
  life: number;
  seed: number;
}

type Fx =
  | { kind: "clip"; t: number; phase: "fly" | "hold" | "snap" | "fall"; x: number; y: number; vx: number; vy: number; rot: number }
  | { kind: "acid"; t: number; hit: boolean }
  | { kind: "scratch"; t: number; ok: boolean };

export const streakLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as StreakStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 목표 칩 ----
  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "streak" } }, el("b", { text: "가루색 발견" }), el("span", { text: "자철석을 긁자" })),
    el("div", { class: "pn-badge geo", dataset: { g: "magnet" } }, el("b", { text: "자성 찾기" }), el("span", { text: "클립을 대보자" })),
    el("div", { class: "pn-badge geo", dataset: { g: "acid" } }, el("b", { text: "거품의 정체" }), el("span", { text: "염산 반응은?" })),
  );

  // ---- 광물 트레이(실사 카드 + 색 견본 폴백) ----
  const tray = el("div", {
    style: "display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:14px",
    attrs: { role: "group", "aria-label": "관찰할 광물 고르기" },
  });
  const cardBase =
    "display:flex;flex-direction:column;align-items:center;gap:5px;padding:7px 3px 8px;background:#fff;" +
    "border:1.5px solid var(--line);border-radius:14px;box-shadow:var(--sh-card);" +
    "transition:transform .12s var(--ease),border-color .16s,background .16s,box-shadow .2s";
  const cards = new Map<MinId, HTMLButtonElement>();
  for (const m of MINS) {
    const swatch = `linear-gradient(150deg,${m.grad[0]} 0%,${m.grad[1]} 55%,${m.grad[2]} 100%)`;
    const img = el("img", {
      attrs: { src: `${base}geo/minerals/${m.id}.webp`, alt: `${m.name} 표본 사진`, loading: "lazy" },
      style: "position:absolute;inset:0;width:100%;height:100%;object-fit:cover",
    });
    img.addEventListener("error", () => img.remove()); // 발주 전엔 색 견본 카드로 폴백
    const thumb = el(
      "span",
      { style: `position:relative;display:block;width:46px;height:46px;border-radius:11px;overflow:hidden;background:${swatch}` },
      img,
    );
    const card = el(
      "button",
      { style: cardBase, attrs: { type: "button", "aria-pressed": "false", "aria-label": `${m.name} 고르기` } },
      thumb,
      el("b", { text: m.name, style: "font-size:11.5px;font-weight:800;color:var(--ink);letter-spacing:-.01em" }),
    );
    card.addEventListener("pointerdown", () => (card.style.transform = "scale(.94)"));
    const unpress = (): void => {
      card.style.transform = "";
    };
    card.addEventListener("pointerup", unpress);
    card.addEventListener("pointercancel", unpress);
    card.addEventListener("pointerleave", unpress);
    card.addEventListener("click", () => selectMin(m.id));
    cards.set(m.id, card);
    tray.appendChild(card);
  }

  // ---- 무대 ----
  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "application",
      "aria-label": "조흔판 실험. 광물을 잡고 드래그로 조흔판에 문질러요. 키보드에서는 엔터 키가 한 번 문지르기예요.",
    },
  });
  const minPill = el("span", { text: "" });
  const minDot = el("span", { class: "pdot" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "광물을 잡고 조흔판에 문질러 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, minDot, minPill)),
    toastEl,
    capEl,
  );

  // ---- 실험 버튼(2×2) ----
  const btnStyle = "margin-top:0;font-size:13.5px";
  const clipLabel = el("span", { text: "클립 대보기" });
  const clipBtn = el("button", { class: "swapbtn", style: btnStyle, attrs: { type: "button" } }, clipLabel);
  const acidBtn = el("button", { class: "swapbtn", style: btnStyle, attrs: { type: "button" } }, el("span", { text: "묽은 염산 떨어뜨리기" }));
  const hardLabel = el("span", { text: "석영으로 긁기" });
  const hardBtn = el("button", { class: "swapbtn", style: btnStyle, attrs: { type: "button" } }, hardLabel);
  const wipeBtn = el("button", { class: "swapbtn", style: btnStyle, attrs: { type: "button" } }, el("span", { text: "조흔판 닦기" }));
  const ctrls = el("div", { class: "tg-controls" }, clipBtn, acidBtn, hardBtn, wipeBtn);

  const helper = el("div", {
    class: "helper",
    html: "겉색만으로는 광물을 가려내기 어려워요. <b>흑운모와 자철석</b>은 겉이 둘 다 까맣죠 — 조흔판에 문질러 <b>가루색</b>을 비교해 보세요!",
  });
  host.append(goalChips, helper, tray, stage, ctrls); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let sel: MinDef = MINS[4]; // 자철석부터 — 첫 발견(검은 가루)으로 바로 이어진다
  let dragging = false;
  let sx = 0; // 표본 현재 위치(스무딩)
  let sy = 0;
  let tx = 0; // 표본 목표 위치
  let ty = 0;
  let placed = false;
  let strokeActive: Stroke | null = null;
  let lastRub: { x: number; y: number } | null = null;
  const strokes: Stroke[] = [];
  const dust: Particle[] = [];
  const bubbles: Bubble[] = [];
  const streakDist = new Map<MinId, number>();
  const rubToasted = new Set<MinId>();
  const scratched = new Set<MinId>();
  let clipOn = false; // 자철석에 클립이 붙어 있는 상태
  let fx: Fx | null = null;
  let fizzT = 0; // 방해석 거품 남은 시간(ms)
  let sheenA = 0; // 염산 무반응 젖은 자국
  let plateFlash = 0;
  let squeakAt = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let capHidden = false;
  let interacted = false;

  const plateW = (): number => Math.min(W * 0.86, 300);
  const plateX0 = (): number => W / 2 - plateW() / 2;
  const plateX1 = (): number => W / 2 + plateW() / 2;
  const plateCX = (): number => W / 2;
  const plateCY = (): number => (PY0 + PY1) / 2;
  const restX = (): number => W * 0.32;
  const restY = 92;
  const clipRestX = (): number => W * 0.78;
  const clipRestY = 118;
  const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
  const easeIn = (t: number): number => t * t * t;

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
        "겉색이 비슷해도 <b>조흔색·굳기·자성·염산 반응</b>이 달라요 — 광물의 특성으로 가려낼 수 있어요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "streak" && !goals.has("magnet")) {
      helper.innerHTML = "흑운모 가루는 희끗한데 <b>자철석 가루는 검어요</b>! 이번엔 <b>클립 대보기</b>로 자석 성질을 시험해 볼까요?";
    } else if (id === "magnet" && !goals.has("acid")) {
      helper.innerHTML = "이제 <b>묽은 염산</b>을 떨어뜨려 봐요 — 어떤 광물에서 거품이 날까요? (힌트: 흰 광물 중 하나)";
    } else if (id === "acid" && !goals.has("streak")) {
      helper.innerHTML = "마지막 하나! <b>자철석</b>을 골라 조흔판에 문질러 <b>가루색</b>을 확인해 보세요.";
    }
  }

  // ---- 트레이 선택 ----
  function paintTray(): void {
    for (const m of MINS) {
      const c = cards.get(m.id)!;
      const on = m.id === sel.id;
      c.setAttribute("aria-pressed", String(on));
      c.style.borderColor = on ? "var(--subj-geo)" : "var(--line)";
      c.style.background = on ? "var(--subj-geo-tint)" : "#fff";
      c.style.boxShadow = on ? "0 0 0 1px var(--subj-geo) inset, var(--sh-card)" : "var(--sh-card)";
    }
  }
  function paintPill(): void {
    minPill.textContent = `${sel.name} · 겉은 ${sel.surfWord}`;
    minDot.style.background = sel.dot;
  }
  function paintHardBtn(): void {
    hardLabel.textContent = sel.id === "quartz" ? "방해석으로 긁기" : "석영으로 긁기";
  }
  function selectMin(id: MinId): void {
    if (sel.id === id) return;
    sel = MINS.find((m) => m.id === id)!;
    clipOn = false;
    fx = null;
    fizzT = 0;
    sheenA = 0;
    bubbles.length = 0;
    paintTray();
    paintPill();
    paintHardBtn();
    haptic(HAPTIC.tap);
    hideCap();
  }
  paintTray();
  paintPill();
  paintHardBtn();

  // ---- 조흔(문지르기) ----
  function inPlate(x: number, y: number, pad = 12): boolean {
    return x > plateX0() + pad && x < plateX1() - pad && y > PY0 + pad && y < PY1 - pad;
  }
  function addRubPoint(x: number, y: number): void {
    interacted = true;
    if (!inPlate(x, y)) {
      strokeActive = null;
      lastRub = null;
      return;
    }
    const now = performance.now();
    if (sel.powder === null) {
      // 석영 — 판보다 단단해 자국이 안 남고 끼익
      if (lastRub) {
        const d = Math.hypot(x - lastRub.x, y - lastRub.y);
        if (d > 3) {
          for (let i = 0; i < 2; i++) {
            dust.push({
              x: x + (Math.random() - 0.5) * 6,
              y: y + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 1.6,
              vy: -0.6 - Math.random() * 0.9,
              life: 1,
              color: "#FFE9B8",
              spark: true,
            });
          }
          if (now - squeakAt > 1700) {
            squeakAt = now;
            toast("끼익 — 석영은 조흔판보다 단단해요!");
            haptic(HAPTIC.wrong);
          }
          lastRub = { x, y };
        }
      } else lastRub = { x, y };
      return;
    }
    const rel = { x: x - plateCX(), y: y - plateCY() };
    if (!strokeActive) {
      strokeActive = { pts: [rel], powder: sel.powder, edge: sel.powderEdge };
      strokes.push(strokeActive);
      if (strokes.length > 26) strokes.shift();
      lastRub = { x, y };
      return;
    }
    const d = lastRub ? Math.hypot(x - lastRub.x, y - lastRub.y) : 0;
    if (d < 3.2) return;
    strokeActive.pts.push(rel);
    if (strokeActive.pts.length > 240) strokeActive.pts.shift();
    lastRub = { x, y };
    const acc = (streakDist.get(sel.id) ?? 0) + d;
    streakDist.set(sel.id, acc);
    if (Math.random() < 0.35) {
      dust.push({
        x,
        y: y + 3,
        vx: (Math.random() - 0.5) * 0.9,
        vy: 0.3 + Math.random() * 0.5,
        life: 1,
        color: sel.powder,
        spark: false,
      });
    }
    if (sel.id === "magnetite" && acc >= STREAK_GOAL) {
      collect("streak", "검은 가루!", "겉도 검고 가루도 검다 — 자철석의 조흔색!");
    } else if (acc >= STREAK_GOAL * 0.6 && !rubToasted.has(sel.id) && sel.id !== "magnetite") {
      rubToasted.add(sel.id);
      toast(
        sel.id === "biotite"
          ? "흑운모 가루는 희끗해요 — 겉색과 달라요!"
          : `${sel.name} 가루는 흰색이에요`,
      );
    }
  }

  // ---- 포인터 ----
  const canvasPt = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: PointerEvent): void => {
    if (fx) fx = null; // 진행 중 연출은 접고 문지르기 우선
    dragging = true;
    const p = canvasPt(e);
    tx = p.x;
    ty = p.y;
    lastRub = null;
    strokeActive = null;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
    hideCap();
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const p = canvasPt(e);
    tx = clamp(p.x, 16, W - 16);
    ty = clamp(p.y, 24, CVH - 16);
    addRubPoint(tx, ty);
  };
  const onUp = (): void => {
    dragging = false;
    strokeActive = null;
    lastRub = null;
    canvas.classList.remove("dragging");
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    hideCap();
    interacted = true;
    // 한 번 문지르기: 판 가운데에 지그재그 획을 자동으로 긋는다
    if (sel.powder === null) {
      squeakAt = 0;
      addRubPoint(plateCX(), plateCY());
      for (let i = 0; i < 8; i++) {
        dust.push({
          x: plateCX() + (Math.random() - 0.5) * 60,
          y: plateCY() + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -0.8 - Math.random(),
          life: 1,
          color: "#FFE9B8",
          spark: true,
        });
      }
      return;
    }
    const st: Stroke = { pts: [], powder: sel.powder, edge: sel.powderEdge };
    const span = plateW() * 0.32;
    const y0 = plateCY() + (Math.random() - 0.5) * 44;
    let acc = streakDist.get(sel.id) ?? 0;
    let px = -span;
    let prev: StrokePt | null = null;
    while (px <= span) {
      const pt = { x: px, y: y0 + Math.sin(px / 14) * 7 - plateCY() };
      st.pts.push(pt);
      if (prev) acc += Math.hypot(pt.x - prev.x, pt.y - prev.y);
      prev = pt;
      px += 7;
    }
    strokes.push(st);
    if (strokes.length > 26) strokes.shift();
    streakDist.set(sel.id, acc);
    haptic(HAPTIC.tap);
    if (sel.id === "magnetite" && acc >= STREAK_GOAL) collect("streak", "검은 가루!", "겉도 검고 가루도 검다 — 자철석의 조흔색!");
    else if (!rubToasted.has(sel.id) && sel.id !== "magnetite") {
      rubToasted.add(sel.id);
      toast(sel.id === "biotite" ? "흑운모 가루는 희끗해요 — 겉색과 달라요!" : `${sel.name} 가루는 흰색이에요`);
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  // ---- 버튼 동작 ----
  function busy(): boolean {
    if (fx) {
      toast("실험 중이에요 — 잠깐만요");
      return true;
    }
    return false;
  }
  clipBtn.addEventListener("click", () => {
    if (busy()) return;
    if (clipOn) {
      toast("이미 착 붙어 있어요 — 자철석은 자석 성질!");
      return;
    }
    interacted = true;
    hideCap();
    haptic(HAPTIC.tap);
    fx = { kind: "clip", t: 0, phase: "fly", x: clipRestX(), y: clipRestY, vx: 0, vy: 0, rot: 0 };
  });
  acidBtn.addEventListener("click", () => {
    if (busy()) return;
    interacted = true;
    hideCap();
    haptic(HAPTIC.tap);
    fx = { kind: "acid", t: 0, hit: false };
  });
  hardBtn.addEventListener("click", () => {
    if (busy()) return;
    interacted = true;
    hideCap();
    haptic(HAPTIC.tap);
    // 석영이 선택돼 있으면 '방해석으로 긁기' — 더 무른 광물로는 흠집이 안 난다
    fx = { kind: "scratch", t: 0, ok: sel.id !== "quartz" };
  });
  wipeBtn.addEventListener("click", () => {
    strokes.length = 0;
    strokeActive = null;
    plateFlash = 1;
    haptic(HAPTIC.tap);
    toast("조흔판을 새것처럼 닦았어요");
  });

  // ---- 그리기 도우미 ----
  function drawMineral(
    ctx: CanvasRenderingContext2D,
    m: MinDef,
    x: number,
    y: number,
    scale: number,
    rot: number,
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    const g = ctx.createLinearGradient(-26, -26, 26, 26);
    g.addColorStop(0, m.grad[0]);
    g.addColorStop(0.55, m.grad[1]);
    g.addColorStop(1, m.grad[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    m.poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = m.line;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    if (m.layers) {
      ctx.strokeStyle = "rgba(150,130,110,.45)";
      ctx.lineWidth = 1;
      for (const ly of [-5, 1, 7]) {
        ctx.beginPath();
        ctx.moveTo(-20, ly);
        ctx.lineTo(20, ly - 3);
        ctx.stroke();
      }
    }
    // 좌상단 스펙큘러
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(m.spec[0][0], m.spec[0][1]);
    ctx.lineTo(m.spec[1][0], m.spec[1][1]);
    ctx.stroke();
    // 굳기 실험 흠집(영구)
    if (scratched.has(m.id)) {
      const zig: ReadonlyArray<readonly [number, number]> = [
        [-14, -3],
        [-6, 1],
        [2, -2],
        [10, 4],
        [16, 6],
      ];
      ctx.strokeStyle = "rgba(20,14,8,.5)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      zig.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py + 1) : ctx.lineTo(px, py + 1)));
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      zig.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawClip(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(-11, -6, 11, 6);
    g.addColorStop(0, "#F2F6FB");
    g.addColorStop(0.5, "#B9C6D8");
    g.addColorStop(1, "#7E8EA6");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.roundRect(-11, -5, 22, 10, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-6.5, -2, 13, 6.4, 3.2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(40,52,70,.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-11, 5.6);
    ctx.lineTo(6, 5.6);
    ctx.stroke();
    ctx.restore();
  }

  function drawDropper(ctx: CanvasRenderingContext2D, x: number, y: number, squeeze: number): void {
    // 고무 꼭지
    ctx.save();
    ctx.translate(x, y);
    const bg = ctx.createLinearGradient(-8, -20, 8, 0);
    bg.addColorStop(0, "#B06A62");
    bg.addColorStop(0.55, "#8A4A44");
    bg.addColorStop(1, "#5E2E2A");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(0, -14, 7.5, 10 * (1 - squeeze * 0.28), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3E1C1A";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-3.4, -20);
    ctx.lineTo(-3.4, -12);
    ctx.stroke();
    // 유리관
    const gg = ctx.createLinearGradient(-3, 0, 3, 0);
    gg.addColorStop(0, "rgba(226,240,255,.9)");
    gg.addColorStop(0.5, "rgba(160,190,225,.35)");
    gg.addColorStop(1, "rgba(210,232,255,.75)");
    ctx.strokeStyle = gg;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 26);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,240,255,.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1.6, -2);
    ctx.lineTo(-1.6, 24);
    ctx.stroke();
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    if (!placed) {
      placed = true;
      sx = restX();
      sy = restY;
      tx = sx;
      ty = sy;
    }
    if (!dragging) {
      tx = restX();
      ty = restY;
    }
    sx += (tx - sx) * Math.min(1, 0.3 * dt);
    sy += (ty - sy) * Math.min(1, 0.3 * dt);

    const px0 = plateX0();
    const px1 = plateX1();
    const pcx = plateCX();
    const pcy = plateCY();

    // ---- 조흔판(초벌구이 도자기) ----
    contactShadow(ctx, pcx, PY1 + 8, plateW() * 0.56, 0.3);
    const pg = ctx.createLinearGradient(px0, PY0, px1, PY1);
    pg.addColorStop(0, "#EBE4D4");
    pg.addColorStop(0.55, "#DDD3BF");
    pg.addColorStop(1, "#CBC0A7");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.roundRect(px0, PY0, plateW(), PY1 - PY0, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(122,110,86,.9)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 좌상단 키라이트 + 질감 점묘
    const kl = ctx.createRadialGradient(px0 + 40, PY0 + 26, 0, px0 + 40, PY0 + 26, plateW() * 0.5);
    kl.addColorStop(0, "rgba(255,255,255,.28)");
    kl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px0, PY0, plateW(), PY1 - PY0, 14);
    ctx.clip();
    ctx.fillStyle = kl;
    ctx.fillRect(px0, PY0, plateW(), PY1 - PY0);
    ctx.fillStyle = "rgba(96,84,60,.06)";
    for (let i = 0; i < 42; i++) {
      const rx = pcx + Math.sin(i * 127.3) * plateW() * 0.47;
      const ry = pcy + Math.sin(i * 61.7) * (PY1 - PY0) * 0.44;
      ctx.fillRect(rx, ry, 1.6, 1.6);
    }
    // 가루 스트로크(그림자 → 본체 2패스, 판에 클립됨)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const st of strokes) {
      if (st.pts.length < 2) continue;
      for (const pass of [0, 1] as const) {
        ctx.strokeStyle = pass === 0 ? st.edge : st.powder;
        ctx.lineWidth = pass === 0 ? 11 : 8;
        ctx.globalAlpha = pass === 0 ? 1 : 0.92;
        ctx.beginPath();
        st.pts.forEach((p, i) => {
          const ax = pcx + p.x;
          const ay = pcy + p.y + (pass === 0 ? 1.4 : 0);
          if (i === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
        });
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // 가루 점묘(결정 알갱이 느낌)
      ctx.fillStyle = st.powder;
      for (let i = 0; i < st.pts.length; i += 5) {
        const p = st.pts[i];
        ctx.fillRect(pcx + p.x + Math.sin(i * 12.9) * 6, pcy + p.y + Math.sin(i * 7.7) * 5, 1.5, 1.5);
      }
    }
    if (plateFlash > 0.02) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 * plateFlash})`;
      ctx.fillRect(px0, PY0, plateW(), PY1 - PY0);
      plateFlash *= Math.pow(0.86, dt);
    }
    ctx.restore();
    // 판 이름표
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(196,212,232,.55)";
    ctx.fillText("조흔판(초벌구이 판)", px0 + 4, PY0 - 8);

    // ---- 클립(대기 위치) ----
    const restingClip = !clipOn && (!fx || fx.kind !== "clip");
    if (restingClip) {
      contactShadow(ctx, clipRestX(), clipRestY + 9, 20, 0.22);
      drawClip(ctx, clipRestX(), clipRestY, -0.18);
      ctx.font = "600 9.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(196,212,232,.5)";
      ctx.fillText("클립", clipRestX(), clipRestY + 24);
    }

    // ---- 표본 ----
    const tilt = dragging ? -0.22 : Math.sin(tMs / 900) * 0.02;
    const scale = dragging ? 1.06 : 1.12;
    if (!dragging) contactShadow(ctx, sx, sy + 26, 34, 0.26);
    else contactShadow(ctx, sx, Math.min(sy + 24, PY1 - 4), 26, 0.2);
    drawMineral(ctx, sel, sx, sy, scale, tilt);
    // 붙은 클립
    if (clipOn) drawClip(ctx, sx + 20, sy + 14, 0.5);
    // 표본 이름
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(226,240,255,.75)";
    if (!dragging) ctx.fillText(sel.name, sx, sy + 44);

    // ---- 유도 화살표(첫 상호작용 전) ----
    if (!interacted && !dragging) {
      const bob = Math.sin(tMs / 300) * 5;
      ctx.strokeStyle = "rgba(255,194,77,.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx + 4, sy + 52 + bob);
      ctx.lineTo(sx + 4, sy + 82 + bob);
      ctx.moveTo(sx - 3, sy + 73 + bob);
      ctx.lineTo(sx + 4, sy + 82 + bob);
      ctx.lineTo(sx + 11, sy + 73 + bob);
      ctx.stroke();
    }

    // ---- 연출(fx) ----
    if (fx && fx.kind === "clip") {
      const f = fx;
      const nearX = sx + 34;
      const nearY = sy + 8;
      if (f.phase === "fly") {
        f.t = Math.min(1, f.t + dt / 46);
        const e = easeOut(f.t);
        f.x = clipRestX() + (nearX - clipRestX()) * e;
        f.y = clipRestY + (nearY - clipRestY) * e - Math.sin(e * Math.PI) * 26;
        if (f.t >= 1) {
          if (sel.id === "magnetite") f.phase = "snap";
          else f.phase = "hold";
          f.t = 0;
        }
      } else if (f.phase === "snap") {
        f.t = Math.min(1, f.t + dt / 9);
        const e = easeIn(f.t);
        f.x = nearX + (sx + 20 - nearX) * e;
        f.y = nearY + (sy + 14 - nearY) * e;
        if (f.t >= 1) {
          clipOn = true;
          fx = null;
          softGlow(ctx, sx + 20, sy + 14, 30, "226,242,255", 0.5);
          collect("magnet", "자철석에 착!", "착 — 클립이 달라붙어요. 자석 성질!");
        }
      } else if (f.phase === "hold") {
        f.t = Math.min(1, f.t + dt / 22);
        f.x = nearX + Math.sin(tMs / 60) * 1.2; // 갖다 대고 살짝 흔들어 본다
        f.y = nearY;
        if (f.t >= 1) {
          f.phase = "fall";
          f.vx = 0.4;
          f.vy = 0;
          f.t = 0;
        }
      } else {
        f.vy += 0.34 * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rot += 0.09 * dt;
        if (f.y >= clipRestY + 26) {
          fx = null;
          toast(`톡 — ${sel.name}에는 안 붙어요`);
          haptic(HAPTIC.wrong);
        }
      }
      if (fx) drawClip(ctx, f.x, f.y, f.rot);
    } else if (fx && fx.kind === "acid") {
      const f = fx;
      f.t = Math.min(1, f.t + dt / 110);
      const dx = sx + 2;
      const appear = easeOut(clamp(f.t / 0.3, 0, 1));
      const retract = f.t > 0.8 ? easeIn(clamp((f.t - 0.8) / 0.2, 0, 1)) : 0;
      const dy = -34 + (sy - 66 + 34) * appear - retract * 90;
      const squeeze = f.t > 0.34 && f.t < 0.56 ? Math.sin(((f.t - 0.34) / 0.22) * Math.PI) : 0;
      drawDropper(ctx, dx, dy, squeeze);
      // 방울
      if (f.t >= 0.46 && !f.hit) {
        const dropP = clamp((f.t - 0.46) / 0.16, 0, 1);
        const dropYv = dy + 30 + (sy - 16 - (dy + 30)) * easeIn(dropP);
        ctx.fillStyle = "rgba(205,230,255,.85)";
        ctx.beginPath();
        ctx.arc(dx, dropYv, 3.1, 0, Math.PI * 2);
        ctx.fill();
        if (dropP >= 1) {
          f.hit = true;
          if (sel.id === "calcite") {
            fizzT = 2500;
            collect("acid", "방해석 보글!", "보글보글 — 방해석이 염산과 반응해요!");
          } else {
            sheenA = 1;
            toast(`${sel.name}은 조용해요 — 반응이 없어요`);
          }
        }
      }
      if (f.t >= 1) fx = null;
    } else if (fx && fx.kind === "scratch") {
      const f = fx;
      f.t = Math.min(1, f.t + dt / 52);
      const e = easeOut(f.t);
      const tool = sel.id === "quartz" ? MINS[3] : MINS[0]; // 방해석 ↔ 석영
      const tx0 = sx - 40;
      const ty0 = sy - 34;
      const tx1 = sx + 34;
      const ty1 = sy + 16;
      drawMineral(ctx, tool, tx0 + (tx1 - tx0) * e, ty0 + (ty1 - ty0) * e, 0.52, 0.5);
      if (f.ok && f.t >= 0.86 && !scratched.has(sel.id)) {
        scratched.add(sel.id); // 도구가 지나간 자리에 흠집이 새겨진다
        haptic(HAPTIC.tap);
      }
      if (f.t >= 1) {
        fx = null;
        if (f.ok) {
          toast(
            sel.id === "calcite"
              ? "긁혔어요! 석영(굳기 7)이 방해석(3)보다 단단해요"
              : `석영이 ${sel.name}에 흠집을 냈어요 — 더 단단하니까요`,
          );
        } else {
          toast("흠집이 안 나요 — 석영이 훨씬 단단해요!");
        }
      }
    }

    // ---- 거품(방해석 + 염산) ----
    if (fizzT > 0) {
      fizzT -= dt * 16.7;
      if (Math.random() < 0.5 * dt) {
        bubbles.push({
          x: sx + (Math.random() - 0.5) * 34,
          y: sy + 12,
          vy: 0.5 + Math.random() * 0.5,
          r: 1.6 + Math.random() * 2.2,
          life: 1,
          seed: Math.random() * 9,
        });
      }
      softGlow(ctx, sx, sy + 10, 30, "205,230,255", 0.1);
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.vy * dt;
      b.x += Math.sin(tMs / 240 + b.seed) * 0.3 * dt;
      b.life -= 0.016 * dt;
      if (b.life <= 0) {
        bubbles.splice(i, 1);
        continue;
      }
      const a = Math.max(0, Math.min(1, b.life));
      ctx.strokeStyle = `rgba(226,242,255,${0.75 * a})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${0.5 * a})`;
      ctx.fillRect(b.x - b.r * 0.4, b.y - b.r * 0.5, 1.2, 1.2);
    }
    // 무반응 젖은 자국
    if (sheenA > 0.02) {
      sheenA *= Math.pow(0.975, dt);
      ctx.fillStyle = `rgba(200,228,255,${0.28 * sheenA})`;
      ctx.beginPath();
      ctx.ellipse(sx + 2, sy - 4, 12, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 가루 낙하·불꽃 ----
    for (let i = dust.length - 1; i >= 0; i--) {
      const d = dust[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (!d.spark) d.vy += 0.05 * dt;
      d.life -= (d.spark ? 0.06 : 0.03) * dt;
      if (d.life <= 0) {
        dust.splice(i, 1);
        continue;
      }
      const a = Math.max(0, d.life);
      if (d.spark) {
        ctx.strokeStyle = `rgba(255,225,150,${0.9 * a})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 2.4, d.y - d.vy * 2.4);
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.8 * a;
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x, d.y, 1.8, 1.8);
        ctx.globalAlpha = 1;
      }
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

  api.setCTA("특성 세 가지를 발견해 보세요!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
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
