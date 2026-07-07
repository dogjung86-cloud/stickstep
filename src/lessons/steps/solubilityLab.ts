// solubilityLab — 용해도 랩(중2 I 물질의 특성). "물 10 g에 0.5 g씩" 탐구의 조작판.
//   · 유리병 + 자석 젓개 + 깔때기: 넣기 버튼을 연타하며 "더 이상 안 녹는 한계"를 찾는다
//   · 최대 용해량(물 10 g): 질산 칼륨 20℃ 3.2 / 60℃ 11.0 g · 황산 구리(Ⅱ) 20℃ 2.0 / 60℃ 4.0 g
//   · 한계를 넘으면 가루가 바닥에 쌓이고, 60℃ 물중탕에 올리면 쌓인 가루가 다시 녹는다
//   · 식히면 녹아 있던 만큼이 도로 가라앉고, 용질을 바꾸면 새 물 10 g으로 리셋
// 목표: ① 질산 칼륨 포화(한계 발견) ② 황산 구리(Ⅱ)도 포화(물질마다 달라) ③ 60℃로 앙금 다 녹이기.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { glassVessel, glassStrokeStyle, liquidFill, contactShadow, softGlow } from "../../ui/labProps";
import { tempColor } from "../../ui/thermo";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SolubilityStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Solute = "kno3" | "cuso4";
const LIMIT: Record<Solute, { cold: number; hot: number }> = {
  kno3: { cold: 3.2, hot: 11.0 },
  cuso4: { cold: 2.0, hot: 4.0 },
};
const CVH = 336;

interface Grain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  m: number;
  mode: "fall" | "melt" | "sink";
  life: number;
  seed: number;
}
interface Spark {
  x: number;
  y: number;
  life: number;
}

export const solubilityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SolubilityStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const addPill = el("span", { text: "넣은 양 0.0 g" });
  const tempPill = el("span", { text: "실온 20℃" });
  const tempDot = el("span", { class: "pdot", style: "background:#6EA8FF" });
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "0.5 g씩 부으며 젓개가 녹이는 모습을 보세요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#E64980" }), addPill),
      el("div", { class: "pill" }, tempDot, tempPill),
    ),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge chem", dataset: { g: "limit" } }, el("b", { text: "한계가 있다" }), el("span", { text: "질산 칼륨" })),
    el("div", { class: "pn-badge chem", dataset: { g: "differ" } }, el("b", { text: "물질마다 달라" }), el("span", { text: "황산 구리로" })),
    el("div", { class: "pn-badge chem", dataset: { g: "heat" } }, el("b", { text: "데우면 더" }), el("span", { text: "60℃로!" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "병에 물이 딱 <b>10 g</b> 들어 있어요. <b>0.5 g씩</b> 넣으면서 어디까지 녹는지 시험해 보세요!",
  });

  // ---- 컨트롤: 용질 세그 + (온도 세그 · 넣기 버튼) ----
  const kBtn = el("button", { class: "on", text: "질산 칼륨", attrs: { type: "button", "aria-pressed": "true" } });
  const cBtn = el("button", { text: "황산 구리(Ⅱ)", attrs: { type: "button", "aria-pressed": "false" } });
  const soluteSeg = el("div", { class: "seg", attrs: { "aria-label": "용질 고르기" } }, kBtn, cBtn);
  const coldBtn = el("button", { class: "on", text: "20℃", attrs: { type: "button", "aria-pressed": "true", "aria-label": "실온 20도" } });
  const hotBtn = el("button", { text: "60℃", attrs: { type: "button", "aria-pressed": "false", "aria-label": "물중탕 60도" } });
  const tempSeg = el("div", { class: "seg", style: "margin-top:0", attrs: { "aria-label": "물 온도" } }, coldBtn, hotBtn);
  const addBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "0.5 g 넣기" }));
  const ctlRow = el("div", { class: "fp-controls" }, tempSeg, addBtn);

  host.append(goalChips, stage, soluteSeg, ctlRow, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let solute: Solute = "kno3";
  let temp: 20 | 60 = 20;
  let bath01 = 0; // 물중탕 연출 정도(0..1)
  let added = 0; // 넣은 총량(g)
  let dissolved = 0; // 녹아 있는 양(g)
  let settled = 0; // 바닥에 쌓인 양(g)
  let reserved = 0; // 녹는 중(예약)인 알갱이 질량 합
  let spin = 0; // 젓개 회전각
  const grains: Grain[] = [];
  const sparks: Spark[] = [];
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let satToastShown = false;
  let precipToastShown = false;
  let heatPile = false; // 60℃에서 앙금이 있었다 → 다 녹으면 목표 ③
  let capHidden = false;

  const limitNow = (): number => (temp === 60 ? LIMIT[solute].hot : LIMIT[solute].cold);
  const addCap = (): number => LIMIT[solute].hot;
  const pileCap = (): number => LIMIT[solute].hot - LIMIT[solute].cold;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
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
        "일정량의 물에 녹는 양엔 한계가 있고, 그 한계는 물질마다·온도마다 달라요. 이걸 숫자로 나타낸 게 <b>용해도</b>예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    if (finished) return;
    if (id === "limit" && !goals.has("differ")) {
      helper.innerHTML = "한계 발견! 이제 용질을 <b>황산 구리(Ⅱ)</b>로 바꿔 보세요 — 한계가 똑같을까요?";
    } else if (id === "differ" && !goals.has("heat")) {
      helper.innerHTML = "물질마다 한계가 달라요! 이번엔 가루가 쌓인 채로 <b>60℃</b>에 올려 보세요.";
    }
  }

  // ---- 컨트롤 동작 ----
  function setTemp(t: 20 | 60): void {
    if (temp === t) return;
    temp = t;
    coldBtn.classList.toggle("on", t === 20);
    hotBtn.classList.toggle("on", t === 60);
    coldBtn.setAttribute("aria-pressed", String(t === 20));
    hotBtn.setAttribute("aria-pressed", String(t === 60));
    satToastShown = false;
    precipToastShown = false;
    if (t === 20) heatPile = false;
    haptic(HAPTIC.tap);
    hideCap();
    toast(t === 60 ? "60℃ 물중탕에 올렸어요" : "실온 20℃로 내렸어요");
  }
  coldBtn.addEventListener("click", () => setTemp(20));
  hotBtn.addEventListener("click", () => setTemp(60));

  function setSolute(v: Solute): void {
    if (solute === v) return;
    solute = v;
    kBtn.classList.toggle("on", v === "kno3");
    cBtn.classList.toggle("on", v === "cuso4");
    kBtn.setAttribute("aria-pressed", String(v === "kno3"));
    cBtn.setAttribute("aria-pressed", String(v === "cuso4"));
    // 병 리셋(새 물 10 g, 실온)
    added = dissolved = settled = reserved = 0;
    grains.length = 0;
    sparks.length = 0;
    satToastShown = false;
    precipToastShown = false;
    heatPile = false;
    temp = 20;
    coldBtn.classList.add("on");
    hotBtn.classList.remove("on");
    coldBtn.setAttribute("aria-pressed", "true");
    hotBtn.setAttribute("aria-pressed", "false");
    haptic(HAPTIC.tap);
    toast(v === "kno3" ? "질산 칼륨 — 새 물 10 g!" : "황산 구리(Ⅱ) — 새 물 10 g!");
    if (!finished && v === "cuso4" && !goals.has("differ")) {
      helper.innerHTML = "황산 구리(Ⅱ)는 녹으면서 물을 <b>파랗게</b> 물들여요. 다시 0.5 g씩 — 한계는 몇 g일까요?";
    }
  }
  kBtn.addEventListener("click", () => setSolute("kno3"));
  cBtn.addEventListener("click", () => setSolute("cuso4"));

  addBtn.addEventListener("click", () => {
    if (added >= addCap() - 1e-6) {
      toast("이만하면 충분해요 — 온도를 바꿔 봐요!");
      return;
    }
    added = Math.round((added + 0.5) * 10) / 10;
    const cx = W * 0.5;
    for (let i = 0; i < 10; i++) {
      grains.push({
        x: cx + (Math.random() - 0.5) * 52,
        y: 4 + Math.random() * 20,
        vx: 0,
        vy: 0.3 + Math.random() * 0.3,
        r: 1.6 + Math.random() * 1.2,
        m: 0.05,
        mode: "fall",
        life: 1,
        seed: Math.random(),
      });
    }
    addBtn.classList.remove("pulse");
    hideCap();
    haptic(HAPTIC.tap);
  });

  // ---- 프레임 ----
  let shown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const cx = W * 0.5;
    const vw = Math.min(W * 0.52, 190);
    const x0 = cx - vw / 2;
    const x1 = cx + vw / 2;
    const y1 = CVH - 46; // 병 바닥
    const vy0 = y1 - 150; // 병 입구
    const surfY = vy0 + 36; // 수면
    const span = vw * 0.46; // 앙금 언덕 반폭

    // 물중탕 연출 수렴
    bath01 += ((temp === 60 ? 1 : 0) - bath01) * Math.min(1, 0.05 * dt);
    spin += 0.26 * dt;

    const lim = limitNow();
    // 60℃: 쌓인 가루 재용해
    if (settled > 0 && dissolved + reserved < lim - 1e-4) {
      const tr = Math.min(settled, lim - dissolved - reserved, 0.045 * dt);
      settled -= tr;
      dissolved += tr;
      if (Math.random() < 0.3 * dt) {
        sparks.push({ x: cx + (Math.random() - 0.5) * span * 1.4, y: y1 - 8 - Math.random() * 10, life: 1 });
      }
    }
    // 식힘: 한계 초과분이 도로 가라앉음
    if (dissolved > lim + 1e-4) {
      const tr = Math.min(dissolved - lim, 0.03 * dt);
      dissolved -= tr;
      settled += tr;
      if (!precipToastShown) {
        precipToastShown = true;
        toast("식으니 녹아 있던 가루가 도로 가라앉아요");
      }
    }

    const pileH = settled <= 0.001 ? 0 : 3 + 19 * Math.min(1, settled / pileCap());
    const pileY = (px: number): number => {
      const t = clamp(1 - ((px - cx) / span) ** 2, 0, 1);
      return y1 - 4 - pileH * t;
    };

    // 알갱이 물리
    for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      if (g.mode === "fall") {
        g.vy = Math.min(g.vy + 0.3 * dt, 3.2);
        g.y += g.vy * dt;
        // 깔때기로 모이기(입구→목→줄기)
        const pull = g.y < 64 ? 0.06 : g.y < 92 ? 0.22 : 0.015;
        g.x += (cx - g.x) * Math.min(1, pull * dt);
        if (g.y > vy0 + 4) g.x = clamp(g.x, x0 + 8, x1 - 8);
        if (g.y > surfY + 3) {
          g.vy *= 0.35;
          if (dissolved + reserved + g.m <= lim + 1e-6) {
            g.mode = "melt";
            reserved += g.m;
          } else {
            g.mode = "sink";
            if (!satToastShown) {
              satToastShown = true;
              toast("더 이상 녹지 않아요 — 바닥에 쌓여요");
            }
          }
        }
      } else if (g.mode === "melt") {
        g.life -= 0.02 * dt;
        const ang = tMs / 260 + g.seed * 6.28;
        g.x += (cx + Math.cos(ang) * vw * 0.2 - g.x) * Math.min(1, 0.05 * dt);
        g.y += (surfY + 44 + Math.sin(ang * 0.7) * 16 - g.y) * Math.min(1, 0.04 * dt);
        if (g.life <= 0) {
          reserved -= g.m;
          dissolved += g.m;
          grains.splice(i, 1);
        }
      } else {
        g.vy += (0.55 - g.vy) * Math.min(1, 0.1 * dt);
        g.y += g.vy * dt;
        g.x += Math.sin(tMs / 320 + g.seed * 9) * 0.1 * dt;
        if (g.y >= pileY(g.x) - 1.5) {
          settled += g.m;
          grains.splice(i, 1);
        }
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.y -= 0.45 * dt;
      sp.life -= 0.028 * dt;
      if (sp.life <= 0) sparks.splice(i, 1);
    }

    // 목표 판정
    if (solute === "kno3" && temp === 20 && settled >= 0.045) collect("limit", "3.2 g!", "여기까지 — 더는 안 녹아요!");
    if (solute === "cuso4" && temp === 20 && settled >= 0.045) collect("differ", "2.0 g!", "황산 구리(Ⅱ)는 2.0 g이 한계!");
    if (temp === 60 && settled > 0.06) heatPile = true;
    const pending = grains.some((g) => g.mode !== "melt");
    if (temp === 60 && heatPile && settled <= 0.015 && !pending) {
      heatPile = false;
      collect("heat", "다 녹았다!", "데우니 한계가 커졌어요!");
    }

    // ---- 그리기 ----
    // 물중탕 비커(병 뒤)
    const ox0 = x0 - 22;
    const ox1 = x1 + 22;
    const oy0 = vy0 + 24;
    const oy1 = y1 + 10;
    contactShadow(ctx, cx, y1 + 7, vw * 0.6, 0.26);
    if (bath01 > 0.02) {
      contactShadow(ctx, cx, oy1 + 3, (ox1 - ox0) * 0.5, 0.2 * bath01);
      softGlow(ctx, cx, oy1 - 6, vw * 0.7, "255,150,80", 0.08 * bath01);
      ctx.save();
      ctx.globalAlpha = bath01;
      const og = ctx.createLinearGradient(0, oy0 + 12, 0, oy1);
      og.addColorStop(0, tempColor(0.74, 0.3));
      og.addColorStop(1, tempColor(0.74, 0.1));
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.roundRect(ox0 + 3, oy0 + 12, ox1 - ox0 - 6, oy1 - oy0 - 15, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,236,204,.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(ox0 + 6, oy0 + 12);
      ctx.lineTo(ox1 - 6, oy0 + 12);
      ctx.stroke();
      ctx.strokeStyle = glassStrokeStyle(ctx, oy0, oy1);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ox0, oy0);
      ctx.lineTo(ox0, oy1 - 8);
      ctx.quadraticCurveTo(ox0, oy1, ox0 + 8, oy1);
      ctx.lineTo(ox1 - 8, oy1);
      ctx.quadraticCurveTo(ox1, oy1, ox1, oy1 - 8);
      ctx.lineTo(ox1, oy0);
      ctx.stroke();
      // 데워지는 물 기포
      for (let i = 0; i < 4; i++) {
        const bx = i < 2 ? x0 - 12 + i * 5 : x1 + 7 + (i - 2) * 5;
        const by = oy1 - 8 - ((tMs * (0.018 + i * 0.005) + i * 43) % (oy1 - oy0 - 26));
        ctx.strokeStyle = "rgba(255,255,255,.3)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      // 김
      if (bath01 > 0.35) {
        ctx.strokeStyle = `rgba(226,240,255,${0.2 * bath01})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (let k = 0; k < 2; k++) {
          const sx0 = cx - 34 + k * 62;
          const sway = Math.sin(tMs / 480 + k * 2.6) * 6;
          ctx.beginPath();
          ctx.moveTo(sx0, oy0 - 2);
          ctx.quadraticCurveTo(sx0 + sway, oy0 - 16, sx0 - sway * 0.6, oy0 - 30);
          ctx.stroke();
        }
      }
    }

    // 병 속 물 + (황산 구리) 파란 물
    liquidFill(ctx, x0 + 3, surfY, x1 - 3, y1 - 3, "150,190,240", 0.13);
    const conc = solute === "cuso4" ? dissolved / LIMIT.cuso4.hot : 0;
    if (conc > 0.01) {
      const bg = ctx.createLinearGradient(0, surfY, 0, y1);
      bg.addColorStop(0, `rgba(56,128,246,${0.08 + conc * 0.3})`);
      bg.addColorStop(1, `rgba(28,88,206,${0.05 + conc * 0.24})`);
      ctx.fillStyle = bg;
      ctx.fillRect(x0 + 3, surfY, vw - 6, y1 - 3 - surfY);
    }
    // 소용돌이 힌트(젓개가 만드는 흐름)
    ctx.strokeStyle = "rgba(226,242,255,.13)";
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      ctx.ellipse(cx, surfY + 26 + k * 30, vw * 0.2 + k * 12, 4.5 + k * 1.5, 0, spin * 1.3 + k * 2.2, spin * 1.3 + k * 2.2 + 1.9);
      ctx.stroke();
    }

    // 앙금 언덕
    if (pileH > 0.5) {
      const pc = solute === "kno3" ? ["#EDF3FA", "#AEBFD6", "rgba(94,112,140,.7)"] : ["#7FB0F2", "#3E6EC4", "rgba(30,62,130,.75)"];
      const pg = ctx.createLinearGradient(0, y1 - 4 - pileH, 0, y1 - 2);
      pg.addColorStop(0, pc[0]);
      pg.addColorStop(1, pc[1]);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.moveTo(cx - span, y1 - 3);
      ctx.quadraticCurveTo(cx - span * 0.4, y1 - 4 - pileH * 1.06, cx, y1 - 4 - pileH);
      ctx.quadraticCurveTo(cx + span * 0.4, y1 - 4 - pileH * 1.06, cx + span, y1 - 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = pc[2];
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // 가루 알갱이 점묘
      ctx.fillStyle = "rgba(255,255,255,.5)";
      for (let i = 0; i < 9; i++) {
        const rx = cx + (Math.sin(i * 127.3) * 0.5) * span * 1.5;
        const ry = pileY(rx) + 2 + ((i * 37) % 5);
        if (ry < y1 - 3) ctx.fillRect(rx, ry, 1.4, 1.4);
      }
    }

    // 자석 젓개 막대(회전 = 폭이 늘었다 줄었다)
    const bw = 4 + 15 * Math.abs(Math.cos(spin));
    const barY = y1 - 9 - pileH * 0.4;
    const barG = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
    barG.addColorStop(0, "#F2F6FB");
    barG.addColorStop(0.5, "#C7D4E6");
    barG.addColorStop(1, "#8FA2BC");
    ctx.fillStyle = barG;
    ctx.beginPath();
    ctx.roundRect(cx - bw, barY - 3.5, bw * 2, 7, 3.5);
    ctx.fill();
    ctx.strokeStyle = "rgba(52,68,96,.65)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 유리병 + 깔때기
    glassVessel(ctx, { x0, y0: vy0, x1, y1 });
    const mh = 40;
    ctx.fillStyle = "rgba(190,220,255,.05)";
    ctx.beginPath();
    ctx.moveTo(cx - mh, 34);
    ctx.lineTo(cx + mh, 34);
    ctx.lineTo(cx + 6.5, 64);
    ctx.lineTo(cx + 6.5, 92);
    ctx.lineTo(cx - 6.5, 92);
    ctx.lineTo(cx - 6.5, 64);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = glassStrokeStyle(ctx, 34, 92);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - mh, 34);
    ctx.lineTo(cx - 6.5, 64);
    ctx.lineTo(cx - 6.5, 92);
    ctx.moveTo(cx + mh, 34);
    ctx.lineTo(cx + 6.5, 64);
    ctx.lineTo(cx + 6.5, 92);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,240,255,.9)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - mh - 3, 34);
    ctx.lineTo(cx - mh + 7, 34);
    ctx.moveTo(cx + mh - 7, 34);
    ctx.lineTo(cx + mh + 3, 34);
    ctx.stroke();
    // 깔때기 좌측 스펙큘러
    ctx.strokeStyle = "rgba(255,255,255,.26)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - mh + 8, 39);
    ctx.lineTo(cx - 10, 61);
    ctx.stroke();

    // 가루 알갱이
    const gc = solute === "kno3" ? ["#F5F9FF", "rgba(140,160,190,.8)"] : ["#5E9BF2", "rgba(24,60,140,.85)"];
    for (const g of grains) {
      ctx.globalAlpha = g.mode === "melt" ? Math.max(0, g.life) : 1;
      ctx.fillStyle = gc[0];
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = gc[1];
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 재용해 반짝임
    for (const sp of sparks) {
      const a = Math.max(0, sp.life);
      softGlow(ctx, sp.x, sp.y, 7, "226,242,255", 0.3 * a);
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * a})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sp.x - 3, sp.y);
      ctx.lineTo(sp.x + 3, sp.y);
      ctx.moveTo(sp.x, sp.y - 3);
      ctx.lineTo(sp.x, sp.y + 3);
      ctx.stroke();
    }

    // HUD
    const key = `${added.toFixed(1)}|${temp}|${settled > 0.02 ? 1 : 0}`;
    if (key !== shown) {
      shown = key;
      addPill.textContent = `넣은 양 ${added.toFixed(1)} g`;
      tempPill.textContent = temp === 60 ? "물중탕 60℃" : "실온 20℃";
      tempDot.style.background = temp === 60 ? "#FF9F43" : "#6EA8FF";
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

  api.setCTA("세 가지 발견을 모아 보세요!", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
