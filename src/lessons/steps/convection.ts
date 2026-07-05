// convection — 대류 랩(L3).
// 1부: 주전자 단면 — 불을 켜면 바닥에서 데워진 입자가 위로, 식은 입자가 아래로
//      순환하며 물 전체가 데워지는 두 개의 대류 롤을 관찰한다.
// 2부: "난방기는 어디에?" — 바닥/천장 중 위치를 골라 방 안 공기의 순환(또는 성층)을
//      확인한다(선택이 채점됨).

import { el, clamp, clear } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, drawFlame, drawGlowParticle } from "../../ui/thermo";
import type { StepRenderer } from "../types";

interface ConvectionStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface FlowP {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number; // 0..1 입자 온도
  seed: number;
}

const N_POT = 46;
const N_ROOM = 56;

export const convection: StepRenderer = (host, step, api) => {
  const s = step as unknown as ConvectionStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "cv-canvas", style: "height:250px" });
  const pillText = el("span", { class: "cv-pill", text: "주전자 속 물" });
  const gaugeFill = el("i", {});
  const gauge = el("div", { class: "cv-gauge", attrs: { "aria-hidden": "true" } }, el("span", { text: "방 온도" }), el("div", { class: "cv-gauge-track" }, gaugeFill));
  const hud = el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot" }), pillText), gauge);
  const stage = el("div", { class: "stage cv-stage" }, canvas, hud);
  const controls = el("div", { class: "cd-controls" });
  const helper = el("div", {
    class: "helper",
    html: "주전자는 <b>아래만</b> 가열해요. 그런데 어떻게 물 <b>전체</b>가 뜨거워질까요? 불을 켜고 지켜보세요.",
  });
  host.append(stage, controls, helper);

  // ---- 상태 ----
  type Mode = "pot" | "pick" | "room";
  let mode: Mode = "pot";
  let fire = false;
  let fieldK = 0; // 유동장 세기(불 켜짐에 따라 0..1)
  let fireTime = 0;
  let potDone = false;
  let heaterAt: "floor" | "ceil" | null = null;
  let roomTime = 0;
  let roomJudged = false;
  let firstPick: "floor" | "ceil" | null = null;
  let judged = false;

  const ps: FlowP[] = [];
  function seedParticles(n: number, t0: number): void {
    ps.length = 0;
    for (let i = 0; i < n; i++) {
      ps.push({
        x: Math.random(),
        y: Math.random(),
        vx: 0,
        vy: 0,
        t: t0 + (Math.random() - 0.5) * 0.06,
        seed: 0.75 + Math.random() * 0.5,
      });
    }
  }
  seedParticles(N_POT, 0.22);

  gauge.style.display = "none";

  // ---- 1부 컨트롤 ----
  const fireBtn = el("button", { class: "swapbtn", html: "<span>불 켜기</span>" });
  fireBtn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    fire = !fire;
    fireBtn.innerHTML = `<span>${fire ? "불 끄기" : "불 켜기"}</span>`;
    if (fire) {
      helper.innerHTML =
        "바닥에서 <b>뜨거워진 입자는 위로</b> 올라가고, 위에서 <b>식은 입자는 아래로</b> 내려와요. 입자들이 <b>직접 돌면서</b> 열을 실어 나르고 있어요.";
    }
  });
  controls.appendChild(fireBtn);

  function toPick(): void {
    mode = "pick";
    pillText.textContent = "방 안의 공기";
    clear(controls);
    helper.innerHTML =
      "공기에서도 대류가 일어나요. 겨울철, 방 <b>전체</b>를 빨리 데우려면 난방기를 어디에 두는 게 좋을까요?";
    const row = el("div", { class: "cd-pick" });
    const mk = (key: "floor" | "ceil", name: string, note: string): HTMLButtonElement => {
      const b = el(
        "button",
        { class: "cd-pick-btn" },
        el("span", { class: "cd-pick-name", text: name }),
        el("span", { class: "cd-pick-note", text: note }),
      );
      b.addEventListener("click", () => {
        if (mode !== "pick") return;
        haptic(HAPTIC.select);
        row.querySelectorAll(".cd-pick-btn").forEach((x) => x.classList.toggle("sel", x === b));
        startRoom(key);
      });
      row.appendChild(b);
      return b;
    };
    mk("floor", "바닥에 두기", "방 아래쪽");
    mk("ceil", "천장에 달기", "방 위쪽");
    controls.appendChild(row);
  }

  function startRoom(at: "floor" | "ceil"): void {
    heaterAt = at;
    if (!firstPick) firstPick = at;
    mode = "room";
    roomTime = 0;
    roomJudged = false;
    seedParticles(N_ROOM, 0.14);
    gauge.style.display = "";
    helper.innerHTML = at === "floor" ? "난방기를 <b>바닥</b>에 뒀어요. 공기가 어떻게 움직이나요?" : "난방기를 <b>천장</b>에 달았어요. 공기가 어떻게 움직이나요?";
  }

  function judgeRoom(): void {
    roomJudged = true;
    const goodPlace = heaterAt === "floor";
    helper.innerHTML = goodPlace
      ? "데워진 공기가 위로 올라가고 찬 공기가 내려오며 <b>방 전체가 골고루</b> 따뜻해졌어요!"
      : "따뜻한 공기가 <b>천장에만 머물러요</b>. 위는 훈훈한데 발밑은 여전히 차갑네요.";
    // 첫 선택만 채점 — 이후엔 자유 실험
    if (!judged) {
      judged = true;
      const good = firstPick === "floor";
      api.recordQuiz(good);
      window.setTimeout(() => {
        api.openSheet({
          good,
          title: good ? "정확한 선택이에요" : "천장은 아쉬워요",
          html:
            (good
              ? "맞아요. 난방기가 <b>아래</b>에 있으면 데워진 공기가 위로 올라가고 찬 공기가 내려와 <b>대류 순환</b>이 생겨요. "
              : "난방기가 <b>위</b>에 있으면 데워진 가벼운 공기가 천장에 머물러 <b>순환이 생기지 않아요</b>. 난방기는 <b>아래</b>가 좋아요. ") +
            "반대로 냉방기는 <b>위</b>에 달아요 — 차가워진 공기가 아래로 내려오며 방 전체가 시원해지거든요.",
        });
        api.enableCTA(s.cta ?? "개념 정리하기");
        // 다른 위치도 실험해 볼 수 있게 선택 버튼을 되살린다
        window.setTimeout(() => {
          if (mode === "room") {
            clear(controls);
            const again = el("button", { class: "swapbtn", html: "<span>다른 위치도 실험해 보기</span>" });
            again.addEventListener("click", () => {
              haptic(HAPTIC.tap);
              toPick();
            });
            controls.appendChild(again);
          }
        }, 400);
      }, 600);
    } else {
      clear(controls);
      const again = el("button", { class: "swapbtn", html: "<span>다른 위치도 실험해 보기</span>" });
      again.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        toPick();
      });
      controls.appendChild(again);
    }
  }

  // ---- 유동장(두 개의 대류 롤): 중앙 상승, 벽쪽 하강 ----
  function rollField(nx: number, ny: number, out: { u: number; v: number }): void {
    out.u = -Math.sin(2 * Math.PI * nx) * Math.PI * Math.cos(Math.PI * ny) * 0.5;
    out.v = 2 * Math.PI * Math.cos(2 * Math.PI * nx) * Math.sin(Math.PI * ny) * 0.5;
  }
  const fv = { u: 0, v: 0 };
  const FLOW = 0.016; // 유동장 → 정규화 좌표 이동량 스케일(프레임 기준)

  function stepPot(dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    fieldK += ((fire ? 1 : 0) - fieldK) * Math.min(1, 1.6 * dtSec);
    if (fire) fireTime += dtSec;
    for (const p of ps) {
      rollField(p.x, p.y, fv);
      const sp = 0.24 * fieldK * p.seed;
      p.x += fv.u * sp * FLOW * dt;
      p.y += fv.v * sp * FLOW * dt;
      // 지터(온도 비례)
      p.x += (Math.random() - 0.5) * 0.0035 * (0.4 + p.t) * dt;
      p.y += (Math.random() - 0.5) * 0.0035 * (0.4 + p.t) * dt;
      p.x = clamp(p.x, 0.02, 0.98);
      p.y = clamp(p.y, 0.03, 0.97);
      // 가열/냉각
      if (fire && p.y > 0.72 && Math.abs(p.x - 0.5) < 0.3) p.t = clamp(p.t + 1.1 * dtSec, 0, 1);
      if (p.y < 0.24) p.t = clamp(p.t - 0.34 * dtSec, 0.16, 1);
      if (!fire) p.t += (0.3 - p.t) * Math.min(1, 0.25 * dtSec);
    }
    if (!potDone && fireTime > 4.2) {
      potDone = true;
      haptic(HAPTIC.ctaUnlock);
      helper.innerHTML =
        "이렇게 <b>입자들이 직접 이동</b>하면서 열을 전달하는 것이 <b>대류</b>예요. 액체뿐 아니라 <b>기체(공기)</b>에서도 일어나요.";
      clear(controls);
      const nextBtn = el("button", { class: "swapbtn", html: "<span>다음 실험 — 난방기는 어디에?</span>" });
      nextBtn.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        toPick();
      });
      controls.appendChild(nextBtn);
    }
  }

  function stepRoom(dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    roomTime += dtSec;
    const floor = heaterAt === "floor";
    for (const p of ps) {
      if (floor) {
        rollField(p.x, p.y, fv);
        const sp = 0.22 * p.seed;
        p.x += fv.u * sp * FLOW * dt;
        p.y += fv.v * sp * FLOW * dt;
        if (p.y > 0.78 && Math.abs(p.x - 0.5) < 0.24) p.t = clamp(p.t + 0.9 * dtSec, 0, 1);
      } else {
        // 천장 난방: 부력 성층 — 데워진 입자만 위에 머물고 순환이 없다
        if (p.y < 0.22 && Math.abs(p.x - 0.5) < 0.24) p.t = clamp(p.t + 0.9 * dtSec, 0, 1);
        p.vy += (0.5 - p.t) * 0.0011 * dt; // 따뜻하면 위로, 차가우면 아래로
        p.vy *= 0.94;
        p.y += p.vy * dt;
        p.x += (Math.random() - 0.5) * 0.0022 * dt;
      }
      p.x += (Math.random() - 0.5) * 0.0022 * dt;
      p.y += (Math.random() - 0.5) * 0.0018 * dt;
      p.x = clamp(p.x, 0.02, 0.98);
      p.y = clamp(p.y, 0.03, 0.97);
      if (floor && p.y < 0.2) p.t = clamp(p.t - 0.22 * dtSec, 0.1, 1);
    }
    if (!roomJudged && roomTime > 5.2) judgeRoom();
  }

  // ---- 그리기 ----
  function draw(tMs: number, dt: number): void {
    const { ctx, w, h } = fitCanvas(canvas, 250);
    const isPot = mode === "pot";
    const bx = isPot ? w * 0.2 : w * 0.12;
    const bw = isPot ? w * 0.6 : w * 0.76;
    const by = isPot ? 34 : 26;
    const bh = h - by - (isPot ? 44 : 32);

    if (mode === "pot") stepPot(dt);
    else if (mode === "room") stepRoom(dt);

    // 용기/방
    ctx.fillStyle = "rgba(255,255,255,.045)";
    ctx.beginPath();
    ctx.roundRect(bx - 10, by - 10, bw + 20, bh + 20, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx - 10, by - 10, bw + 20, bh + 20, 16);
    ctx.stroke();

    if (mode === "pot") {
      if (fire) drawFlame(ctx, bx + bw / 2, h - 4, 30, tMs);
      ctx.fillStyle = "rgba(210,224,245,.6)";
      ctx.font = "600 11.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(fire ? "가열 중" : "가열 전", bx + bw / 2, h - 6 - 34);
    } else {
      // 난방기 본체
      if (heaterAt) {
        const hw = bw * 0.3;
        const hx = bx + bw / 2 - hw / 2;
        const hy = heaterAt === "floor" ? by + bh - 12 : by - 2;
        ctx.fillStyle = "rgba(255,159,67,.9)";
        ctx.beginPath();
        ctx.roundRect(hx, hy, hw, 14, 6);
        ctx.fill();
        const glow = ctx.createRadialGradient(bx + bw / 2, hy + 7, 4, bx + bw / 2, hy + 7, 60);
        glow.addColorStop(0, "rgba(255,159,67,.4)");
        glow.addColorStop(1, "rgba(255,159,67,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(bx, hy - 60, bw, 134);
      }
    }

    // 순환 힌트 화살표(불이 켜졌고 유동장이 살아있을 때)
    const showLoops = (mode === "pot" && fieldK > 0.25) || (mode === "room" && heaterAt === "floor");
    if (showLoops) {
      ctx.strokeStyle = "rgba(255,255,255,.22)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 7]);
      const spin = (tMs / 1400) % (Math.PI * 2);
      for (const side of [-1, 1]) {
        const cx = bx + bw / 2 + side * bw * 0.24;
        const cy = by + bh / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, bw * 0.17, bh * 0.32, 0, spin, spin + Math.PI * 1.5, side === 1);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 입자
    let avg = 0;
    for (const p of ps) {
      avg += p.t;
      drawGlowParticle(ctx, bx + p.x * bw, by + p.y * bh, 5.4, p.t, 1.9);
    }
    avg /= ps.length;

    if (mode === "room") {
      const pct = Math.round(((avg - 0.14) / 0.6) * 100);
      gaugeFill.style.width = `${clamp(pct, 2, 100)}%`;
      gaugeFill.style.background = tempColor(clamp(avg * 1.3, 0, 1));
    }
  }

  const loop: Loop = createLoop((dt, tMs) => draw(tMs, dt));

  api.setCTA("불을 켜서 대류를 관찰하세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
