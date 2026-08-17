// microscopeLab — 현미경 표본 만들기부터 고배율 관찰까지를 손으로 밟아 보는 시뮬(중1 Ⅱ L3).
//  · 순서: 받침 유리에 시료 → 액체 한 방울 → 덮개 유리 덮기 → 저배율 → 초점 맞추기 → 고배율.
//  · **이 랩의 핵심 오개념 교정 지점**: 덮개 유리를 그냥 수평으로 내리면 공기 방울이 갇혀 관찰이 안 된다.
//    덮개 유리는 두 끝을 각각 잡을 수 있는 막대로 모형화했다 — 한쪽 끝을 먼저 받침 유리에 대고(기울임)
//    반대쪽을 천천히 내려야 성공하고, 가운데를 잡고 그대로 내리면 두 끝이 동시에 닿아 방울이 생긴다.
//    실패는 벌이 아니라 설명이다(토스트로 이유를 말하고 "다시 덮기"로 되돌린다).
//  · 표본 2종(입안 상피세포 · 검정말잎 세포)을 모두 고배율까지 관찰해야 완료.
//    입안 상피세포는 핵이 옅어 염색액을 쓰고, 검정말잎은 엽록체가 이미 초록이라 물 한 방울로 만든다.
//  · 관찰 결과는 발주 사진 없이 캔버스로 직접 그린다 —
//    입안 상피세포 = 납작하고 불규칙한 다각형 + 파랗게 염색된 핵 1개,
//    검정말잎 세포 = 벽돌처럼 각진 직사각형 + 초록 엽록체 알갱이 다수.
//  · 목표 3개: 공기 방울 없이 표본 만들기 · 초점 맞추기 · 표본 2종 모두 관찰하기.
//
// 흐림은 ctx.filter 대신 여러 번 어긋나게 겹쳐 그리는 방식(구형 웹뷰에서도 동작).

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-cell.css";

interface MicroscopeStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "slide" | "focus" | "both";
type Spec = "cheek" | "elodea";
type Stage = "sample" | "liquid" | "cover" | "low" | "focus" | "high" | "done";

const CVH = 348;
const BASE_W = 360;
const MEM = "#12B886";
const STAIN = "#4A5FD6";
const CHLORO = "#2F9E5B";

// 작업대(옆모습) 좌표
const SLIDE = { x0: 52, x1: 308, top: 250, h: 14 };
const REST_Y = 238;          // 덮개 유리가 내려앉는 높이
const GLASS_LEN = 150;
const DROP_CX = 180;

// 현미경 시야 — 무대 위쪽 14~52는 HUD 필 자리라 그보다 아래에 둔다.
const FIELD = { cx: 130, cy: 174, r: 104 };
const KNOB = { cx: 300, cy: 180, r: 40 };
const DIAL_TARGET = 0.62;    // 초점이 맞는 지점(눈으로는 알 수 없다 — 돌려서 찾는다)
const DIAL_BAND = 0.34;

const SPEC_NAME: Record<Spec, string> = { cheek: "입안 상피세포", elodea: "검정말잎 세포" };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CheekCell { x: number; y: number; pts: [number, number][]; nx: number; ny: number }
interface Grain { x: number; y: number; a: number }

export const microscopeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MicroscopeStep;
  const rnd = mulberry32(20260727);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "slide" } }, el("b", { text: "표본 만들기" }), el("span", { text: "방울 없이" })),
    el("div", { class: "pn-badge bio", dataset: { g: "focus" } }, el("b", { text: "초점" }), el("span", { text: "선명하게" })),
    el("div", { class: "pn-badge bio", dataset: { g: "both" } }, el("b", { text: "표본 2종" }), el("span", { text: "0 / 2" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "먼저 표본을 만들어요. <b>받침 유리에 시료를 올리기</b>부터 시작해 볼까요?",
  });
  const stepStrip = el(
    "div", { class: "mscl-steps" },
    el("span", { dataset: { st: "prep" }, text: "표본" }),
    el("span", { dataset: { st: "low" }, text: "저배율" }),
    el("span", { dataset: { st: "focus" }, text: "초점" }),
    el("span", { dataset: { st: "high" }, text: "고배율" }),
  );
  const canvas = el("canvas", {
    class: "b3-canvas mscl-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "받침 유리에 표본을 만들고 현미경 시야에서 세포를 관찰하는 무대",
    },
  });
  const specPill = el("span", { text: "입안 상피세포" });
  const magPill = el("span", { text: "표본 만드는 중" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage mscl-stage" },
    canvas,
    el(
      "div", { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${MEM}` }), specPill),
      el("div", { class: "pill" }, magPill),
    ),
    toast,
  );
  const controls = el("div", { class: "b3-controls" });
  host.append(goalsEl, helper, stepStrip, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ────────────────────────────────────────────────────────────
  let W = BASE_W;
  let k = 1;
  let spec: Spec = "cheek";
  let stage2: Stage = "sample";
  let toastTimer = 0;
  let finished = false;
  const goals = new Set<Goal>();
  const observed = new Set<Spec>();

  let sampleOn = false;
  let liquidOn = false;
  let dropT = -1;              // 0..1 방울 낙하 연출(-1 = 대기)
  let covered = false;
  let bubbles = false;
  let tiltedFirst = false;
  let hintSeen = false;

  let gL = { x: DROP_CX - GLASS_LEN / 2, y: 116 };
  let gR = { x: DROP_CX + GLASS_LEN / 2, y: 116 };
  let grab: "L" | "R" | "mid" | null = null;
  let grabDX = 0;
  let grabDY = 0;

  let dial = 0.06;             // 조동나사 위치
  let dialDrag = false;
  let lastY = 0;
  let foc = 0;                 // 선명도 0..1

  const fpx = (v: number): number => Math.max(v, 12 / k);
  const focusOf = (d: number): number => clamp(1 - Math.abs(d - DIAL_TARGET) / DIAL_BAND, 0, 1);
  /** 고배율은 "고배율로 관찰하기"를 누른 뒤(done)부터 — stage "high"는 아직 100배다. */
  const highMag = (): boolean => stage2 === "done";
  const onBench = (): boolean => stage2 === "sample" || stage2 === "liquid" || stage2 === "cover" || stage2 === "low";

  const toastMsg = (msg: string, ms = 2600): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), ms);
  };

  const collect = (id: Goal, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    (goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "두 표본을 모두 관찰했어요. 입안 상피세포는 <b>납작하고 불규칙한 다각형</b>에 핵이 하나, 검정말잎 세포는 <b>벽돌처럼 각진 모양</b>에 초록 엽록체가 가득했어요. 모양은 달라도 둘 다 세포예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "동물세포와 식물세포 정리하기");
    }
  };

  const setStripe = (): void => {
    const order: Record<string, number> = { prep: 0, low: 1, focus: 2, high: 3 };
    const cur = stage2 === "sample" || stage2 === "liquid" || stage2 === "cover" ? 0
      : stage2 === "low" ? 1
        : stage2 === "focus" ? 2 : 3;
    for (const node of Array.from(stepStrip.children) as HTMLElement[]) {
      const idx = order[node.dataset.st ?? "prep"] ?? 0;
      node.classList.toggle("on", idx === cur);
      node.classList.toggle("done", idx < cur);
    }
  };

  // ── 컨트롤(국면마다 교체) ────────────────────────────────────────────
  const btn = (label: string, onClick: () => void, act: string): HTMLButtonElement => {
    const b = el("button", { class: "btn b3-btn", attrs: { type: "button" }, dataset: { msclAct: act }, text: label });
    b.addEventListener("click", onClick);
    return b;
  };

  function renderControls(): void {
    controls.replaceChildren();
    if (stage2 === "sample") {
      controls.appendChild(btn(
        spec === "cheek" ? "받침 유리에 입안 상피 올리기" : "받침 유리에 검정말잎 올리기",
        () => { sampleOn = true; stage2 = "liquid"; afterStage(); }, "sample",
      ));
    } else if (stage2 === "liquid") {
      controls.appendChild(btn(
        spec === "cheek" ? "염색액 한 방울 떨어뜨리기" : "물 한 방울 떨어뜨리기",
        () => { dropT = 0; }, "liquid",
      ));
    } else if (stage2 === "cover" && bubbles) {
      controls.appendChild(btn("덮개 유리 다시 덮기", () => resetCover(), "recover"));
    } else if (stage2 === "low") {
      controls.appendChild(btn("저배율(100배)로 관찰하기", () => { stage2 = "focus"; afterStage(); }, "low"));
    } else if (stage2 === "high") {
      controls.appendChild(btn("고배율(400배)로 관찰하기", () => finishSpec(), "high"));
    } else if (stage2 === "done" && observed.size < 2) {
      controls.appendChild(btn("다른 표본으로 바꾸기", () => switchSpec(), "swap"));
    }
  }

  function afterStage(): void {
    setStripe();
    renderControls();
    if (stage2 === "liquid") {
      helper.innerHTML = spec === "cheek"
        ? "시료를 올렸어요. 핵은 색이 옅어 잘 안 보이니 <b>염색액</b>을 한 방울 떨어뜨려요."
        : "잎을 올렸어요. 엽록체가 이미 초록이라 염색하지 않고 <b>물</b>을 한 방울만 떨어뜨려요.";
      magPill.textContent = "표본 만드는 중";
    } else if (stage2 === "cover") {
      helper.innerHTML =
        "이제 <b>덮개 유리</b>를 덮어요. 끝을 잡고 <b>한쪽 끝을 먼저 받침 유리에 댄 다음</b>, 반대쪽을 천천히 내려 보세요.";
    } else if (stage2 === "low") {
      helper.innerHTML = "표본이 완성됐어요. 현미경에서는 <b>저배율부터</b> 관찰해요. 넓게 봐야 세포를 찾을 수 있거든요.";
      magPill.textContent = "표본 완성";
    } else if (stage2 === "focus") {
      helper.innerHTML = "시야가 흐려요. 오른쪽 <b>조동나사를 위아래로 드래그</b>해서 상이 가장 선명해지는 곳을 찾아보세요.";
      magPill.textContent = "100배 · 저배율";
    } else if (stage2 === "high") {
      helper.innerHTML = "선명해졌어요! 이제 <b>고배율</b>로 올려 세포 하나를 자세히 볼까요?";
    }
  }

  function resetCover(): void {
    bubbles = false;
    covered = false;
    tiltedFirst = false;
    gL = { x: DROP_CX - GLASS_LEN / 2, y: 116 };
    gR = { x: DROP_CX + GLASS_LEN / 2, y: 116 };
    helper.innerHTML =
      "다시 해 봐요. <b>한쪽 끝의 손잡이</b>를 먼저 받침 유리에 대어 기울인 뒤, 반대쪽 손잡이를 천천히 내리는 거예요.";
    renderControls();
  }

  function landCover(): void {
    covered = true;
    grab = null;
    if (tiltedFirst) {
      bubbles = false;
      haptic(HAPTIC.correct);
      collect("slide", "공기 방울 없이 잘 덮었어요");
      helper.innerHTML =
        "비스듬히 눕히듯 덮으니 <b>공기 방울이 갇히지 않았어요</b>. 방울이 있으면 세포와 겹쳐 보여 관찰을 방해해요.";
      stage2 = "low";
      afterStage();
    } else {
      bubbles = true;
      haptic(HAPTIC.wrong);
      toastMsg("공기 방울이 갇혔어요");
      helper.innerHTML =
        "덮개 유리를 <b>수평으로 그대로 내리면</b> 유리와 액체 사이에 공기가 갇혀 동그란 방울이 생겨요. 방울은 세포처럼 보이거나 세포를 가려서 관찰을 망쳐요.";
      renderControls();
    }
  }

  function finishSpec(): void {
    stage2 = "done";
    observed.add(spec);
    (goalsEl.querySelector('[data-g="both"] span') as HTMLElement).textContent = `${observed.size} / 2`;
    magPill.textContent = "400배 · 고배율";
    setStripe();
    haptic(HAPTIC.select);
    helper.innerHTML = spec === "cheek"
      ? "입안 상피세포예요. <b>납작하고 불규칙한 다각형</b>이고, 염색액이 스며든 <b>핵이 하나</b> 진하게 보여요. 세포벽이 없어 모양이 일정하지 않아요."
      : "검정말잎 세포예요. <b>벽돌처럼 각진 직사각형</b>이고 <b>초록색 엽록체</b>가 가득해요. 두껍고 단단한 세포벽이 모양을 일정하게 잡아 줘요.";
    if (observed.size >= 2) collect("both", "두 표본을 모두 관찰했어요");
    else toastMsg(spec === "cheek" ? "이번엔 검정말잎으로 바꿔 볼까요?" : "이번엔 입안 상피세포로 바꿔 볼까요?");
    renderControls();
  }

  function switchSpec(): void {
    spec = spec === "cheek" ? "elodea" : "cheek";
    specPill.textContent = SPEC_NAME[spec];
    stage2 = "sample";
    sampleOn = false;
    liquidOn = false;
    dropT = -1;
    covered = false;
    bubbles = false;
    tiltedFirst = false;
    dial = 0.06;
    foc = 0;
    gL = { x: DROP_CX - GLASS_LEN / 2, y: 116 };
    gR = { x: DROP_CX + GLASS_LEN / 2, y: 116 };
    helper.innerHTML = spec === "elodea"
      ? "이번엔 <b>검정말잎</b>이에요. 잎을 받침 유리에 올리는 것부터 다시 시작해요."
      : "이번엔 <b>입안 상피세포</b>예요. 시료를 받침 유리에 올리는 것부터 다시 시작해요.";
    magPill.textContent = "표본 만드는 중";
    setStripe();
    renderControls();
  }

  // ── 관찰 대상(한 번만 생성) ──────────────────────────────────────────
  const cheekCells: CheekCell[] = [];
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.6;
    const rad = i === 0 ? 0 : 62 + rnd() * 14;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad * 0.86;
    const n = 8;
    const pts: [number, number][] = [];
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + rnd() * 0.3;
      const r = 34 + rnd() * 12;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.78]);
    }
    cheekCells.push({ x, y, pts, nx: x + (rnd() - 0.5) * 14, ny: y + (rnd() - 0.5) * 10 });
  }
  const grains: Grain[] = [];
  for (let i = 0; i < 220; i++) grains.push({ x: rnd(), y: rnd(), a: rnd() * Math.PI });

  // ── 그리기: 작업대(표본 만들기) ───────────────────────────────────────
  function drawBench(ctx: CanvasRenderingContext2D, tMs: number): void {
    // 받침 유리
    ctx.save();
    const g = ctx.createLinearGradient(0, SLIDE.top, 0, SLIDE.top + SLIDE.h);
    g.addColorStop(0, "rgba(212,232,248,.92)");
    g.addColorStop(1, "rgba(150,182,214,.75)");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(226,242,255,.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(SLIDE.x0, SLIDE.top, SLIDE.x1 - SLIDE.x0, SLIDE.h, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7E93B3";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("받침 유리", SLIDE.x0, SLIDE.top + SLIDE.h + 8);
    ctx.restore();

    // 시료 + 액체
    if (sampleOn) {
      ctx.save();
      if (liquidOn) {
        ctx.fillStyle = spec === "cheek" ? "rgba(96,120,214,.42)" : "rgba(120,190,240,.36)";
        ctx.strokeStyle = spec === "cheek" ? "rgba(140,160,235,.7)" : "rgba(150,210,250,.6)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(DROP_CX, SLIDE.top + 1, 62, 13, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      if (spec === "cheek") {
        ctx.fillStyle = liquidOn ? STAIN : "rgba(225,236,248,.9)";
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(DROP_CX - 30 + i * 12, SLIDE.top - 3 - (i % 2) * 3, 6, 2.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "rgba(48,150,86,.9)";
        ctx.strokeStyle = "#1F7A46";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(DROP_CX, SLIDE.top - 5, 34, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(230,255,240,.7)";
        ctx.beginPath();
        ctx.moveTo(DROP_CX - 30, SLIDE.top - 5);
        ctx.lineTo(DROP_CX + 30, SLIDE.top - 5);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 스포이트와 떨어지는 방울
    if (stage2 === "liquid" || dropT >= 0) {
      const dy = dropT < 0 ? 0 : dropT;
      ctx.save();
      ctx.fillStyle = "rgba(200,220,244,.5)";
      ctx.strokeStyle = "rgba(226,242,255,.6)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(268, 60, 22, 60, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(272, 120);
      ctx.lineTo(286, 120);
      ctx.lineTo(280, 142);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#7E93B3";
      ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(spec === "cheek" ? "염색액" : "물", 279, 34);
      if (dropT >= 0) {
        const px = 279 + (DROP_CX - 279) * dy;
        const py = 144 + (SLIDE.top - 150) * dy;
        ctx.fillStyle = spec === "cheek" ? "rgba(110,132,224,.9)" : "rgba(140,200,244,.9)";
        ctx.beginPath();
        ctx.ellipse(px, py, 6, 8 - dy * 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 덮개 유리
    if (stage2 === "cover" || covered) drawCoverGlass(ctx, tMs);
    if (bubbles) drawBubbles(ctx, tMs);
  }

  function drawCoverGlass(ctx: CanvasRenderingContext2D, tMs: number): void {
    const dx = gR.x - gL.x;
    const dy = gR.y - gL.y;
    const ang = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate((gL.x + gR.x) / 2, (gL.y + gR.y) / 2);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, -4, 0, 4);
    g.addColorStop(0, "rgba(232,246,255,.92)");
    g.addColorStop(1, "rgba(160,196,228,.75)");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(240,250,255,.85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-GLASS_LEN / 2, -3.4, GLASS_LEN, 6.8, 2.4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // 두 끝 손잡이
    if (!covered) {
      for (const p of [gL, gR]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(18,184,134,.28)";
        ctx.fill();
        ctx.strokeStyle = MEM;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    if (!bubbles) { // 공기 방울 경고와 같은 자리라 그때는 비운다
      ctx.fillStyle = "#7E93B3";
      ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("덮개 유리", (gL.x + gR.x) / 2, Math.min(gL.y, gR.y) - 16);
    }
    // 첫 안내 — 왼쪽 끝을 먼저 대라는 화살표
    if (!covered && !tiltedFirst && !hintSeen) {
      const bob = Math.sin(tMs / 420) * 3;
      ctx.strokeStyle = "rgba(255,198,92,.9)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(gL.x - 22, gL.y + 16 + bob);
      ctx.lineTo(gL.x - 34, REST_Y - 6 + bob);
      ctx.moveTo(gL.x - 40, REST_Y - 20 + bob);
      ctx.lineTo(gL.x - 34, REST_Y - 6 + bob);
      ctx.lineTo(gL.x - 25, REST_Y - 16 + bob);
      ctx.stroke();
      ctx.fillStyle = "#FFC65C";
      ctx.font = `800 ${fpx(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("한쪽 끝을 먼저 대요", 24, REST_Y - 44);
    }
  }

  function drawBubbles(ctx: CanvasRenderingContext2D, tMs: number): void {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const bx = DROP_CX - 42 + i * 28;
      const by = REST_Y + 8 + Math.sin(tMs / 500 + i) * 1.4;
      const r = 9 - (i % 2) * 2.5;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.24)";
      ctx.fill();
      ctx.strokeStyle = "rgba(240,68,82,.95)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.fillStyle = "#F04452";
    ctx.font = `800 ${fpx(12.5)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("공기 방울!", DROP_CX, REST_Y - 22);
    ctx.restore();
  }

  // ── 그리기: 현미경 시야 ───────────────────────────────────────────────
  function drawCheek(ctx: CanvasRenderingContext2D, zoom: number, alpha: number): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(FIELD.cx, FIELD.cy);
    ctx.scale(zoom, zoom);
    for (const c of cheekCells) {
      ctx.beginPath();
      ctx.moveTo(c.pts[0][0], c.pts[0][1]);
      for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(150,176,232,.34)";
      ctx.fill();
      ctx.strokeStyle = "rgba(74,95,214,.85)";
      ctx.lineWidth = 2 / zoom + 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(c.nx, c.ny, 10, 8.4, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = STAIN;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawElodea(ctx: CanvasRenderingContext2D, zoom: number, alpha: number): void {
    const bw = 52 * zoom;
    const bh = 30 * zoom;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(FIELD.cx, FIELD.cy);
    for (let row = -4; row <= 4; row++) {
      for (let col = -4; col <= 4; col++) {
        const x = col * bw + (row & 1 ? bw / 2 : 0) - bw / 2;
        const y = row * bh - bh / 2;
        if (Math.hypot(x + bw / 2, y + bh / 2) > FIELD.r + bw) continue;
        ctx.fillStyle = "rgba(180,224,196,.42)";
        ctx.beginPath();
        ctx.rect(x, y, bw - 2, bh - 2);
        ctx.fill();
        ctx.strokeStyle = "#2E7D51"; // 두껍고 단단한 세포벽
        ctx.lineWidth = 2.6;
        ctx.stroke();
        // 엽록체 알갱이
        for (let i = 0; i < 12; i++) {
          const gr = grains[(Math.abs(row * 9 + col) * 12 + i) % grains.length];
          const gx = x + 5 + gr.x * (bw - 12);
          const gy = y + 5 + gr.y * (bh - 12);
          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(gr.a);
          ctx.fillStyle = CHLORO;
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.2 * Math.sqrt(zoom), 2.4 * Math.sqrt(zoom), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  function drawScope(ctx: CanvasRenderingContext2D): void {
    const high = highMag();
    const zoom = high ? 2.4 : 1;
    const blur = (1 - foc) * 7.5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(FIELD.cx, FIELD.cy, FIELD.r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = high ? "#DCE6EF" : "#EFF6FB"; // 고배율은 시야가 조금 어둡다
    ctx.fillRect(FIELD.cx - FIELD.r, FIELD.cy - FIELD.r, FIELD.r * 2, FIELD.r * 2);
    const paint = (alpha: number): void => {
      if (spec === "cheek") drawCheek(ctx, zoom, alpha);
      else drawElodea(ctx, zoom, alpha);
    };
    if (blur < 0.4) {
      paint(1);
    } else {
      // ctx.filter는 구형 웹뷰에서 빠져 있다 — 두 겹의 원형 오프셋으로 흐림을 만든다.
      for (const [n, rf, al] of [[10, 1, 0.22], [6, 0.5, 0.2]] as [number, number, number][]) {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + (rf < 1 ? 0.4 : 0);
          ctx.save();
          ctx.translate(Math.cos(a) * blur * rf, Math.sin(a) * blur * rf);
          paint(al);
          ctx.restore();
        }
      }
    }
    ctx.restore();
    // 경통
    ctx.strokeStyle = "#16263C";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(FIELD.cx, FIELD.cy, FIELD.r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(150,180,220,.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(FIELD.cx, FIELD.cy, FIELD.r + 13, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawKnob(ctx: CanvasRenderingContext2D): void {
    const active = stage2 === "focus";
    ctx.save();
    ctx.translate(KNOB.cx, KNOB.cy);
    const g = ctx.createLinearGradient(-KNOB.r, -KNOB.r, KNOB.r, KNOB.r);
    g.addColorStop(0, active ? "#33507C" : "#22334C");
    g.addColorStop(1, "#131F31");
    ctx.fillStyle = g;
    ctx.strokeStyle = active ? MEM : "rgba(150,180,220,.45)";
    ctx.lineWidth = active ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, KNOB.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 홈
    ctx.save();
    ctx.rotate(dial * 5.4);
    ctx.strokeStyle = "rgba(190,214,242,.55)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (KNOB.r - 12), Math.sin(a) * (KNOB.r - 12));
      ctx.lineTo(Math.cos(a) * (KNOB.r - 3), Math.sin(a) * (KNOB.r - 3));
      ctx.stroke();
    }
    ctx.fillStyle = active ? MEM : "#7E93B3";
    ctx.beginPath();
    ctx.arc(0, -KNOB.r + 9, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.fillStyle = active ? "#EAF6F1" : "#7E93B3";
    ctx.font = `800 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("조동나사", KNOB.cx, KNOB.cy + KNOB.r + 8);
    // 선명도 막대
    const bx = KNOB.cx - 30;
    const by = KNOB.cy - KNOB.r - 24;
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.beginPath();
    ctx.roundRect(bx, by, 60, 8, 4);
    ctx.fill();
    ctx.fillStyle = foc > 0.9 ? MEM : "#F0A63A";
    ctx.beginPath();
    ctx.roundRect(bx, by, Math.max(3, 60 * foc), 8, 4);
    ctx.fill();
    ctx.fillStyle = "#7E93B3";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("선명도", KNOB.cx, by - 5);
  }

  function drawCaption(ctx: CanvasRenderingContext2D): void {
    const sharp = foc > 0.9;
    const line = stage2 === "focus" && !sharp
      ? "아직 흐려요. 조동나사를 돌려 초점을 맞춰요"
      : spec === "cheek"
        ? "납작하고 불규칙한 다각형 · 파랗게 물든 핵이 하나"
        : "벽돌처럼 각진 직사각형 · 초록 엽록체가 가득";
    ctx.save();
    ctx.fillStyle = "#EAF6F1";
    ctx.font = `800 ${fpx(12.5)}px Pretendard, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`${SPEC_NAME[spec]} · ${highMag() ? "400배" : "100배"}`, 16, 296);
    ctx.fillStyle = sharp ? "#7E93B3" : "#F0A63A";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillText(line, 16, 318);
    ctx.restore();
  }

  // ── 포인터: 덮개 유리 · 조동나사 ─────────────────────────────────────
  const ptOf = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  };

  const onDown = (e: PointerEvent): void => {
    const p = ptOf(e);
    if (stage2 === "focus") {
      if (Math.hypot(p.x - KNOB.cx, p.y - KNOB.cy) <= KNOB.r + 8) {
        dialDrag = true;
        lastY = p.y;
        setDial(dial + (p.y < KNOB.cy ? 0.05 : -0.05)); // 탭만 해도 한 칸씩 돌아간다
        safePointerCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
      }
      return;
    }
    if (stage2 !== "cover" || covered) return;
    // 유리 근처를 잡으면 되고, 잡은 위치가 어느 쪽 끝인지로 조작이 갈린다
    // (끝 = 그 끝을 끌어 기울이기 · 가운데 = 통째로 내리기). 기울면 손잡이가 움직이므로
    // 점-선분 최근접으로 판정한다(고정 반경은 기울인 뒤 잡히지 않던 문제).
    const dx = gR.x - gL.x;
    const dy = gR.y - gL.y;
    const seg = dx * dx + dy * dy || 1;
    const t = clamp(((p.x - gL.x) * dx + (p.y - gL.y) * dy) / seg, 0, 1);
    const qx = gL.x + dx * t;
    const qy = gL.y + dy * t;
    if (Math.hypot(p.x - qx, p.y - qy) > 44) return;
    grab = t < 0.35 ? "L" : t > 0.65 ? "R" : "mid";
    if (grab === "mid") {
      grabDX = (gL.x + gR.x) / 2 - p.x;
      grabDY = (gL.y + gR.y) / 2 - p.y;
    }
    hintSeen = true;
    safePointerCapture(canvas, e.pointerId);
    haptic(HAPTIC.tap);
  };

  const onMove = (e: PointerEvent): void => {
    const p = ptOf(e);
    if (dialDrag) {
      setDial(dial + (lastY - p.y) / 260); // 위로 끌면 올라간다
      lastY = p.y;
      return;
    }
    if (!grab || covered) return;
    if (grab === "mid") {
      // 막대 전체를 평행 이동(길이·기울기 유지) — 두 끝이 동시에 닿는 "그냥 내리기" 경로.
      const half = (gR.x - gL.x) / 2;
      const halfY = (gR.y - gL.y) / 2;
      const cxN = p.x + grabDX;
      let cyN = p.y + grabDY;
      const lowest = cyN + Math.abs(halfY);
      if (lowest > REST_Y) cyN -= lowest - REST_Y;
      gL = { x: cxN - half, y: cyN - halfY };
      gR = { x: cxN + half, y: cyN + halfY };
    } else {
      const prevFree = grab === "L" ? gR : gL;
      // 유리는 휘지 않는다 — 두 끝의 거리는 항상 GLASS_LEN. 받침 유리 아래로도 내려가지 않는다.
      const layDown = (ox: number, oy: number, vx: number, vy: number): { x: number; y: number } => {
        const y = oy + vy * GLASS_LEN;
        if (y <= REST_Y) return { x: ox + vx * GLASS_LEN, y };
        const down = REST_Y - oy;
        const across = Math.sqrt(Math.max(0, GLASS_LEN * GLASS_LEN - down * down));
        return { x: ox + (vx >= 0 ? across : -across), y: REST_Y };
      };
      const unit = (dx: number, dy: number, fallback: number): { vx: number; vy: number } => {
        const len = Math.hypot(dx, dy);
        return len < 1 ? { vx: fallback, vy: 0 } : { vx: dx / len, vy: dy / len };
      };
      if (prevFree.y >= REST_Y - 3) {
        // 반대쪽 끝이 이미 받침 유리에 닿아 있으면 그 점을 축으로 회전한다
        // (닿은 끝이 손을 따라 들리면 "한쪽을 대고 눕히는" 조작이 성립하지 않는다).
        const u = unit(p.x - prevFree.x, p.y - prevFree.y, grab === "L" ? -1 : 1);
        const held = layDown(prevFree.x, prevFree.y, u.vx, u.vy);
        if (grab === "L") { gL = held; gR = prevFree; } else { gR = held; gL = prevFree; }
      } else {
        // 아직 닿지 않았으면 잡은 끝이 손가락을 그대로 따라가고 반대쪽이 사슬처럼 끌려온다.
        const held = { x: clamp(p.x, 20, 340), y: Math.min(p.y, REST_Y) };
        const u = unit(prevFree.x - held.x, prevFree.y - held.y, grab === "L" ? 1 : -1);
        const free = layDown(held.x, held.y, u.vx, u.vy);
        if (grab === "L") { gL = held; gR = free; } else { gR = held; gL = free; }
      }
    }
    // 한쪽 끝만 닿았는지(= 기울여 댄 상태) 판정
    const lDown = gL.y >= REST_Y - 3;
    const rDown = gR.y >= REST_Y - 3;
    if (!tiltedFirst && lDown !== rDown) {
      const up = lDown ? gR.y : gL.y;
      if (up <= REST_Y - 22) {
        tiltedFirst = true;
        haptic(HAPTIC.select);
        toastMsg("이제 반대쪽을 천천히 내려요");
      }
    }
    if (lDown && rDown) landCover();
  };

  const onUp = (): void => {
    grab = null;
    dialDrag = false;
  };

  /** 초점 지점 근처에서는 자석처럼 붙는다 — 드래그로도 탭으로도 반드시 도달할 수 있게. */
  function setDial(v: number): void {
    dial = clamp(v, 0, 1);
    if (Math.abs(dial - DIAL_TARGET) < 0.045) dial = DIAL_TARGET;
    foc = focusOf(dial);
    if (stage2 !== "focus" || foc < 0.95) return;
    collect("focus", "초점이 맞았어요. 세포가 선명해졌어요");
    stage2 = "high";
    afterStage();
  }

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 프레임 ───────────────────────────────────────────────────────────
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    k = W / BASE_W;
    ctx.clearRect(0, 0, W, fit.h);
    ctx.save();
    ctx.scale(k, k);

    if (dropT >= 0 && dropT < 1) {
      dropT = clamp(dropT + dt * 0.028, 0, 1);
      if (dropT >= 1 && !liquidOn) {
        liquidOn = true;
        stage2 = "cover";
        afterStage();
      }
    }

    if (onBench()) {
      drawBench(ctx, tMs);
    } else {
      drawScope(ctx);
      drawKnob(ctx);
      drawCaption(ctx);
    }

    ctx.restore();
  });

  setStripe();
  renderControls();
  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("표본을 만들고 두 세포를 관찰해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
