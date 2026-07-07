// chemIonMove — 이온의 이동 랩(중2 IV L6, 책 158~159쪽 탐구 재현).
//   질산 칼륨 수용액을 적신 거름종이 + 양끝 전극. 중앙에 색깔 이온 수용액을 점적하고
//   전류를 켜면 — 파란 Cu²⁺는 (−)극으로, 보라 MnO₄⁻는 (+)극으로 끌려간다.
//   "극 바꾸기"(마무리 12번)와 "보이지 않는 이온 보기"(무색 짝 이온도 반대쪽으로!) 토글 포함.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawIonLabel, TAU } from "../../ui/chemKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Drop = "cuso4" | "kmno4";
const DROP_META: Record<Drop, { name: string; ion: string; charge: number; rgb: string; ghost: string; ghostCharge: number }> = {
  cuso4: { name: "황산 구리(Ⅱ)", ion: "Cu", charge: 2, rgb: "72,150,235", ghost: "SO₄", ghostCharge: -2 },
  kmno4: { name: "과망가니즈산 칼륨", ion: "MnO₄", charge: -1, rgb: "156,80,214", ghost: "K", ghostCharge: 1 },
};

export const ionMoveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:300px" });
  const segBtns: Record<Drop, HTMLButtonElement> = {} as Record<Drop, HTMLButtonElement>;
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  (Object.keys(DROP_META) as Drop[]).forEach((k) => {
    const b = el("button", { text: k === "cuso4" ? "황산 구리" : "과망가니즈산 칼륨", attrs: { type: "button" } });
    if (k === "cuso4") b.classList.add("on");
    b.addEventListener("click", () => pick(k));
    segBtns[k] = b;
    seg.appendChild(b);
  });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg), toast);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "cu" } }, el("b", { text: "파란 이온" }), el("span", { text: "어느 극으로?" })),
    el("div", { class: "pn-badge", dataset: { g: "mn" } }, el("b", { text: "보라 이온" }), el("span", { text: "어느 극으로?" })),
    el("div", { class: "pn-badge", dataset: { g: "flip" } }, el("b", { text: "극 바꾸기" }), el("span", { text: "그럼 이온은?" })),
    el("div", { class: "pn-badge", dataset: { g: "ghost" } }, el("b", { text: "무색 이온" }), el("span", { text: "그들도 간다" })),
  );
  const powerBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "전류 켜기" }));
  const flipBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "극 바꾸기" }));
  const ghostBtn = el("button", { class: "swapbtn", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "보이지 않는 이온 보기" }));
  const row = el("div", { class: "gp-controls" }, powerBtn, flipBtn, ghostBtn);
  const helper = el("div", {
    class: "helper",
    html: "거름종이 중앙에 <b>황산 구리(Ⅱ) 수용액</b>을 한 방울 떨어뜨렸어요. 파란색의 정체는 <b>구리 이온</b> — 전류를 켜면 어디로 갈까요?",
  });
  host.append(goalChips, stage, row, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let drop: Drop = "cuso4";
  let on = false;
  let flipped = false; // false: 왼쪽 (+) / 오른쪽 (−)
  let showGhost = false;
  let flipRef: number | null = null; // 극 바꾼 순간의 색 이온 평균 위치(반전 이동 감지 기준)
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  // 입자: 색 이온 + 무색 짝 이온, 중앙 점적에서 시작(offset은 중앙 기준 px)
  interface P { x: number; y: number; ghost: boolean; }
  let parts: P[] = [];
  function seedParts(): void {
    parts = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU;
      const r = 6 + (i % 5) * 7;
      parts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.55, ghost: i % 2 === 1 });
    }
  }
  seedParts();

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2100);
  }

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 이온은 <b>전하를 띠고 있어서</b> 전류를 흘리면 끌려가요 — <b>양이온은 (−)극으로, 음이온은 (+)극으로</b>. 색이 없는 이온도 똑같이 이동하고, 극을 바꾸면 방향도 바뀌죠. 이 이동이 이온이 전하를 띤다는 <b>증거</b>예요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function pick(k: Drop): void {
    drop = k;
    seedParts();
    (Object.keys(segBtns) as Drop[]).forEach((kk) => segBtns[kk].classList.toggle("on", kk === k));
    haptic(HAPTIC.select);
    const m = DROP_META[k];
    helper.innerHTML = `중앙에 <b>${m.name} 수용액</b> 점적! ${k === "cuso4" ? "파란색 = 구리 이온(Cu²⁺)" : "보라색 = 과망가니즈산 이온(MnO₄⁻)"} — 전류를 켜고 지켜봐요.`;
  }

  powerBtn.addEventListener("click", () => {
    on = !on;
    powerBtn.classList.remove("pulse");
    (powerBtn.querySelector("span") as HTMLElement).textContent = on ? "전류 끄기" : "전류 켜기";
    powerBtn.setAttribute("aria-pressed", String(on));
    haptic(HAPTIC.select);
  });
  flipBtn.addEventListener("click", () => {
    flipped = !flipped;
    flipRef = null; // 다음 프레임에서 현재 평균 위치를 기준으로 잡는다
    haptic(HAPTIC.select);
    showToast("전극이 뒤바뀌었어요 — 이온들이 방향을 트는지 보세요!");
  });
  ghostBtn.addEventListener("click", () => {
    showGhost = !showGhost;
    ghostBtn.setAttribute("aria-pressed", String(showGhost));
    haptic(HAPTIC.select);
    if (showGhost) {
      collect("ghost", "반대쪽으로!");
      const m = DROP_META[drop];
      helper.innerHTML = `숨어 있던 <b>${m.ghost}${m.ghostCharge > 0 ? "⁺" : m.ghostCharge === -2 ? "²⁻" : "⁻"} 이온</b>이 보여요 — 색이 없을 뿐, ${m.ghostCharge > 0 ? "(−)극" : "(+)극"}으로 <b>똑같이 이동</b> 중이었어요!`;
    }
  });

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 300);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const cy = H / 2 + 12;
    const plusX = flipped ? W - 52 : 52; // (+)극 위치
    const minusX = flipped ? 52 : W - 52;
    const m = DROP_META[drop];

    // 거름종이 밴드
    const px0 = 66;
    const px1 = W - 66;
    ctx.fillStyle = "rgba(226,234,244,.14)";
    ctx.beginPath();
    ctx.roundRect(px0, cy - 52, px1 - px0, 104, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(196,214,240,.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(px0, cy - 52, px1 - px0, 104, 12);
    ctx.stroke();
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(174,196,228,.7)";
    ctx.fillText("질산 칼륨 수용액을 적신 거름종이", W / 2, cy - 62);

    // 전극 두 개(금속판 + 전선 + 라벨)
    for (const [x, sign] of [[plusX, "+"], [minusX, "−"]] as [number, string][]) {
      const g = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
      g.addColorStop(0, "#8FA4C2");
      g.addColorStop(0.5, "#5C7295");
      g.addColorStop(1, "#3A4A66");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x - 9, cy - 64, 18, 128, 6);
      ctx.fill();
      ctx.strokeStyle = "#1D2A40";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(x - 9, cy - 64, 18, 128, 6);
      ctx.stroke();
      ctx.strokeStyle = "rgba(150,176,210,.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, cy - 64);
      ctx.lineTo(x, 26);
      ctx.lineTo(W / 2 + (x < W / 2 ? -30 : 30), 26);
      ctx.stroke();
      // 전하 라벨
      ctx.beginPath();
      ctx.arc(x, cy - 82, 12, 0, TAU);
      ctx.fillStyle = sign === "+" ? "rgba(240,90,70,.9)" : "rgba(74,130,220,.9)";
      ctx.fill();
      ctx.font = "800 15px Pretendard, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(sign, x, cy - 81);
    }
    // 전원(전류 켜짐 표시)
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.fillStyle = on ? "rgba(162,209,63,.95)" : "rgba(150,176,210,.6)";
    ctx.fillText(on ? "전류 흐르는 중" : "전원 꺼짐", W / 2, 20);

    // 이온 이동 — 학생이 답답하지 않게 넉넉한 속도(수 초 안에 극에 도달)
    const speed = on ? 62 : 0; // px/s
    const dir = (charge: number): number => {
      // 양이온 → (−)극 방향
      const targetX = charge > 0 ? minusX : plusX;
      return targetX > W / 2 ? 1 : -1;
    };
    let mainAvg = 0;
    let ghostAvg = 0;
    parts.forEach((p, i) => {
      const charge = p.ghost ? m.ghostCharge : m.charge;
      if (on) p.x += dir(charge) * speed * (dt * 16.7 / 1000) * (0.8 + (i % 3) * 0.18);
      p.x = clamp(p.x, px0 - W / 2 + 26, px1 - W / 2 - 26);
      const wob = Math.sin(tMs / 500 + i * 2.1) * 2;
      const x = W / 2 + p.x;
      const y = cy + p.y + wob;
      if (p.ghost) {
        ghostAvg += p.x;
        if (showGhost) {
          ctx.strokeStyle = "rgba(214,228,248,.6)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        mainAvg += p.x;
        const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 8);
        g.addColorStop(0, `rgba(${m.rgb},1)`);
        g.addColorStop(1, `rgba(${m.rgb},.55)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 7.5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(10,18,30,.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 7.5, 0, TAU);
        ctx.stroke();
      }
    });
    mainAvg /= parts.length / 2;
    ghostAvg /= parts.length / 2;
    // 색 번짐 라벨(이온식)
    drawIonLabel(ctx, W / 2 + mainAvg - 14, cy - 40, m.ion === "Cu" ? "Cu" : "MnO₄", m.charge, 14);
    if (showGhost) drawIonLabel(ctx, W / 2 + ghostAvg - 14, cy + 44, m.ghost === "K" ? "K" : "SO₄", m.ghostCharge, 13);

    // 도착 판정(평균 위치가 전극 근처)
    const arrived = (avg: number, charge: number): boolean => {
      const targetX = charge > 0 ? minusX : plusX;
      return Math.abs(W / 2 + avg - targetX) < 62;
    };
    if (on && !flipped && arrived(mainAvg, m.charge)) {
      if (drop === "cuso4") {
        collect("cu", "(−)극으로!");
        if (!goals.has("mn")) helper.innerHTML = "파란 구리 이온이 <b>(−)극</b>에 모였어요 — (+)전하라서 (−)극에 끌린 거죠! 이제 <b>과망가니즈산 칼륨</b>으로 바꿔 봐요.";
      } else {
        collect("mn", "(+)극으로!");
        if (goals.has("cu")) helper.innerHTML = "보라 이온은 반대로 <b>(+)극</b>으로 — (−)전하니까요! 이제 <b>극 바꾸기</b>를 눌러 되돌아오는지 확인!";
      }
    }
    // flip 목표: 극을 바꾼 뒤 색 이온이 반대 방향으로 충분히(45px) 이동하면 인정
    if (on && flipped && (goals.has("cu") || goals.has("mn"))) {
      if (flipRef === null) flipRef = mainAvg;
      else if (Math.abs(mainAvg - flipRef) > 45) {
        collect("flip", "방향도 반대!");
        if (!goals.has("ghost")) helper.innerHTML = "극을 바꾸니 이온들이 <b>방향을 틀어</b> 반대 극으로 향해요 — 끌림의 정체가 전하라는 확실한 증거! 마지막으로 <b>보이지 않는 이온</b>도 켜 봐요.";
      }
    }
  });

  api.setCTA("이온을 움직여 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};
