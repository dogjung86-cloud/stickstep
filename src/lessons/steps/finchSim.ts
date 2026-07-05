// finchSim — 변이와 자연선택. 환경(씨앗 섬/곤충 섬)을 고르고 세대를 진행하면
// 환경에 맞는 부리를 가진 새가 더 많이 살아남아, 집단의 평균 부리가 이동한다.
// trait 0 = 가늘고 긴 부리(곤충용) ↔ 1 = 굵고 짧은 부리(씨앗용).

import { el, clamp, afterPaint } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface FinchStep {
  title: string;
  lead?: string;
  explainGood?: string;
  goalGen?: number;
}

interface Bird { x: number; y: number; trait: number; alive: boolean; a: number; scale: number; }

const N = 15;
const randn = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.9;

export const finchSim: StepRenderer = (host, step, api) => {
  const s = step as unknown as FinchStep;
  const goalGen = s.goalGen ?? 3;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // 환경 선택
  const seg = el("div", { class: "seg" });
  const seedBtn = el("button", { class: "on", text: "씨앗 섬" });
  const bugBtn = el("button", { text: "곤충 섬" });
  seg.append(seedBtn, bugBtn);

  const canvas = el("canvas", { class: "finch-canvas", style: "height:250px" });
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, el("span", { class: "pdot" }), el("span", { class: "finch-gen", text: "세대 0" })),
    el("div", { class: "pill" }, el("span", { class: "finch-avg", text: "평균 부리 —" })),
  );
  const stage = el("div", { class: "stage finch-stage" }, canvas, hud);

  const barWrap = el(
    "div",
    { class: "finch-bar" },
    el("span", { class: "finch-bar-l", text: "가늘고 긴 부리" }),
    el("div", { class: "finch-track" }, el("div", { class: "finch-fill" }, el("i", {}))),
    el("span", { class: "finch-bar-r", text: "굵고 짧은 부리" }),
  );
  const runBtn = el("button", { class: "swapbtn", html: "<span>한 세대 지나기</span>" });
  const helper = el("div", { class: "helper" });

  host.append(seg, stage, barWrap, runBtn, helper);

  let target = 1; // 씨앗 섬
  let gen = 0;
  let birds: Bird[] = [];
  let dims = { w: 320, h: 250 };
  let loop: Loop | null = null;
  let animating = false;

  function seed(): void {
    gen = 0;
    animating = false;
    birds = [];
    const cols = 5, rows = 3;
    for (let i = 0; i < N; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const x = ((c + 0.5) / cols) * dims.w + (Math.random() - 0.5) * 20;
      const y = ((r + 0.6) / (rows + 0.3)) * dims.h + (Math.random() - 0.5) * 16;
      birds.push({ x, y, trait: clamp(0.5 + randn() * 0.28, 0.05, 0.95), alive: true, a: 1, scale: 1 });
    }
    updateHud();
    render();
  }

  function avgTrait(): number {
    const live = birds.filter((b) => b.alive);
    return live.reduce((s2, b) => s2 + b.trait, 0) / Math.max(1, live.length);
  }

  function updateHud(): void {
    (host.querySelector(".finch-gen") as HTMLElement).textContent = `세대 ${gen}`;
    const avg = avgTrait();
    (host.querySelector(".finch-avg") as HTMLElement).textContent = `평균 부리 ${target === 1 ? Math.round(avg * 100) : Math.round((1 - avg) * 100)}%`;
    (host.querySelector(".finch-fill i") as HTMLElement).style.left = `${avg * 100}%`;
    (host.querySelector(".finch-fill") as HTMLElement).style.width = `${avg * 100}%`;
    const fit = 1 - Math.abs(avg - target);
    helper.innerHTML =
      gen === 0
        ? "이 섬 새들의 <b>부리 모양이 조금씩 달라요</b>. 이런 차이를 <b>변이</b>라고 해요."
        : `환경에 맞는 부리를 가진 새가 더 많이 살아남았어요. 집단의 <b>평균 부리</b>가 ${target === 1 ? "굵고 짧은" : "가늘고 긴"} 쪽으로 이동했죠. (적합도 ${Math.round(fit * 100)}%)`;
  }

  function runGeneration(): void {
    if (animating) return;
    animating = true;
    haptic(HAPTIC.select);
    // 적합도 순으로 하위 40% 도태
    const live = birds.filter((b) => b.alive);
    const scored = live
      .map((b) => ({ b, f: 1 - Math.abs(b.trait - target) + Math.random() * 0.12 }))
      .sort((p, q) => p.f - q.f);
    const kill = Math.floor(live.length * 0.4);
    for (let i = 0; i < kill; i++) scored[i].b.alive = false;

    let phase: "cull" | "grow" = "cull";
    let t0 = performance.now();
    loop?.stop();
    loop = createLoop((_dt, t) => {
      const p = clamp((t - t0) / 520, 0, 1);
      if (phase === "cull") {
        for (const b of birds) if (!b.alive) { b.a = 1 - p; b.scale = 1 - 0.3 * p; }
        render();
        if (p >= 1) {
          // 빈 슬롯을 생존자의 자손으로 채움(변이 포함)
          const survivors = birds.filter((b) => b.alive);
          for (const b of birds) {
            if (!b.alive) {
              const parent = survivors[Math.floor(Math.random() * survivors.length)];
              b.trait = clamp(parent.trait + randn() * 0.13, 0.03, 0.97);
              b.alive = true;
              b.a = 0;
              b.scale = 0.4;
            }
          }
          phase = "grow";
          t0 = performance.now();
        }
      } else {
        for (const b of birds) if (b.a < 1) { b.a = p; b.scale = 0.4 + 0.6 * p; }
        render();
        if (p >= 1) {
          for (const b of birds) { b.a = 1; b.scale = 1; }
          loop?.stop();
          loop = null;
          gen += 1;
          animating = false;
          updateHud();
          render();
          if (gen >= goalGen) {
            api.recordQuiz(true);
            window.setTimeout(() => {
              api.openSheet({
                good: true,
                title: "자연선택을 확인했어요",
                html:
                  s.explainGood ??
                  "환경에 <b>적합한 변이</b>를 가진 개체가 더 많이 살아남아 자손을 남겼어요. 이 과정이 오래 반복되면 생물은 환경에 <b>적응</b>하고, 서로 다른 종류로 나뉘며 <b>생물다양성</b>이 커져요.",
                onContinue: api.next,
              });
            }, 300);
          }
        }
      }
    });
    loop.start();
  }

  function setEnv(t: number, seedOn: boolean): void {
    target = t;
    seedBtn.classList.toggle("on", seedOn);
    bugBtn.classList.toggle("on", !seedOn);
    seed();
  }
  seedBtn.addEventListener("click", () => setEnv(1, true));
  bugBtn.addEventListener("click", () => setEnv(0, false));
  runBtn.addEventListener("click", runGeneration);

  function render(): void {
    const { ctx, w, h } = fitCanvas(canvas, 250);
    dims = { w, h };
    ctx.clearRect(0, 0, w, h);
    // 바닥(환경 힌트)
    ctx.fillStyle = target === 1 ? "rgba(255,180,80,.10)" : "rgba(90,200,140,.10)";
    ctx.fillRect(0, h - 26, w, 26);
    for (const b of birds) drawBird(ctx, b);
  }

  function drawBird(ctx: CanvasRenderingContext2D, b: Bird): void {
    ctx.save();
    ctx.globalAlpha = b.a;
    ctx.translate(b.x, b.y);
    ctx.scale(b.scale, b.scale);
    // 몸통
    const hue = 205 - b.trait * 170; // 낮은 trait=파랑, 높은 trait=주황
    ctx.fillStyle = `hsl(${hue} 70% 62%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // 머리
    ctx.beginPath();
    ctx.arc(9, -5, 5.5, 0, Math.PI * 2);
    ctx.fill();
    // 부리: trait 높으면 굵고 짧게, 낮으면 가늘고 길게
    const len = 6 + (1 - b.trait) * 12;
    const thick = 2 + b.trait * 5;
    ctx.fillStyle = "#F2B01E";
    ctx.beginPath();
    ctx.moveTo(13, -6);
    ctx.lineTo(13 + len, -5);
    ctx.lineTo(13, -5 + thick);
    ctx.closePath();
    ctx.fill();
    // 눈
    ctx.fillStyle = "#12202f";
    ctx.beginPath();
    ctx.arc(10.5, -6, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  api.setCTA("세대를 진행해 변화를 관찰하세요", { enabled: false });
  afterPaint(() => {
    const f = fitCanvas(canvas, 250);
    dims = { w: f.w, h: f.h };
    seed();
  });

  return () => loop?.stop();
};
