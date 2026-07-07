// chemAtom — 중2 IV 랩 2종.
//   atomLab(L3): 양성자·중성자·전자를 ±로 넣고 빼며 원자를 조립한다(교과서 시뮬레이션 활동).
//     전하 저울이 실시간으로 (+)와 (−)를 비교 — 양성자수 = 전자수일 때 "중성" 배지.
//     미션: 수소(1p·0n·1e) → 탄소(6p·6n·6e) → 산소(8p·8n·8e). 종류를 정하는 건 양성자수!
//   ionLab(L5): 중성 원자에서 전자를 떼거나 붙여 이온을 만든다. 전하 = 양성자수 − 전자수를
//     정확히 계산해 이온식(Na⁺·Cl⁻·O²⁻)이 자동 표기된다.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawNucleus, drawElectron, drawIonLabel, TAU } from "../../ui/chemKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// 전자 배치 — 껍질 이론 없이 보기 좋게 원 두 개에 분산(교과서 모형 수준)
function electronPos(i: number, total: number, t: number, R1: number, R2: number): { x: number; y: number } {
  const inner = Math.min(total, 6);
  const isInner = i < inner;
  const n = isInner ? inner : total - inner;
  const idx = isInner ? i : i - inner;
  const r = isInner ? R1 : R2;
  const a = (idx / Math.max(1, n)) * TAU + t * (isInner ? 0.5 : -0.34) + (isInner ? 0 : 0.4);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.92 };
}

// ══════════════════════════════════════════════════════════
// atomLab — 원자 조립소
// ══════════════════════════════════════════════════════════
const TARGETS = [
  { name: "수소", p: 1, n: 0, e: 1 },
  { name: "탄소", p: 6, n: 6, e: 6 },
  { name: "산소", p: 8, n: 8, e: 8 },
];

export const atomLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:280px" });
  const namePill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FF8A6A" }), el("span", { text: "" }));
  const chargePill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7ED6FF" }), el("span", { html: "" }));
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, namePill, chargePill));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...TARGETS.map((t, i) =>
      el("div", { class: "pn-badge", dataset: { g: `t${i}` } }, el("b", { text: `${t.name} 만들기` }), el("span", { text: `양성자 ${t.p}개` })),
    ),
  );

  let p = 0;
  let n = 0;
  let eCount = 0;
  const vals: HTMLElement[] = [];
  const steppers = el("div", { class: "ck-steppers" });
  const mk = (label: string, dot: string, get: () => number, set: (v: number) => void): void => {
    const val = el("span", { class: "ck-val", text: "0" });
    vals.push(val);
    const minus = el("button", { class: "ck-btn", text: "−", attrs: { type: "button", "aria-label": `${label} 빼기` } });
    const plus = el("button", { class: "ck-btn", text: "+", attrs: { type: "button", "aria-label": `${label} 넣기` } });
    minus.addEventListener("click", () => {
      if (get() > 0) {
        set(get() - 1);
        haptic(HAPTIC.tap);
        sync();
      }
    });
    plus.addEventListener("click", () => {
      if (get() < 10) {
        set(get() + 1);
        haptic(HAPTIC.tap);
        sync();
      }
    });
    steppers.appendChild(
      el("div", { class: "ck-step" }, el("b", {}, el("i", { style: `background:${dot}` }), label), minus, val, plus),
    );
  };
  mk("양성자 (+)", "#E85B40", () => p, (v) => (p = v));
  mk("중성자 (전하 없음)", "#9AA5B4", () => n, (v) => (n = v));
  mk("전자 (−)", "#4A90E0", () => eCount, (v) => (eCount = v));

  const helper = el("div", {
    class: "helper",
    html: "부품은 셋 — <b>양성자(+)</b>와 <b>중성자</b>는 원자핵에, <b>전자(−)</b>는 그 주위에 들어가요. 첫 미션: <b>수소</b>(양성자 1, 중성자 0, 전자 1)!",
  });
  host.append(goalChips, stage, steppers, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let mission = 0;
  let holdMs = 0;
  let finished = false;

  function sync(): void {
    vals[0].textContent = String(p);
    vals[1].textContent = String(n);
    vals[2].textContent = String(eCount);
    const known = p === 1 ? "수소" : p === 2 ? "헬륨" : p === 6 ? "탄소" : p === 8 ? "산소" : null;
    (namePill.querySelectorAll("span")[1] as HTMLElement).textContent =
      p === 0 ? "핵이 비었어요" : known ? `이 원자의 정체: ${known}` : `양성자 ${p}개의 원소`;
    const net = p - eCount;
    (chargePill.querySelectorAll("span")[1] as HTMLElement).innerHTML =
      net === 0 ? `(+)${p} = (−)${eCount} · <b>중성</b>` : `(+)${p} vs (−)${eCount} · ${net > 0 ? "+" : ""}${net}`;
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 280);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const cx = W / 2;
    const cy = H / 2 + 6;
    const t = tMs / 1000;

    // 전자 자리(옅은 안내 원)
    ctx.strokeStyle = "rgba(120,150,196,.18)";
    ctx.lineWidth = 1.2;
    for (const r of [66, 98]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.92, 0, 0, TAU);
      ctx.stroke();
    }
    if (p + n > 0) drawNucleus(ctx, cx, cy, p, n, 17 + Math.min(9, (p + n) * 0.8));
    for (let i = 0; i < eCount; i++) {
      const pos = electronPos(i, eCount, t, 66, 98);
      drawElectron(ctx, cx + pos.x, cy + pos.y, 7.5);
    }

    // 미션 판정 — 값이 0.5초 유지되면 통과(스치는 값 방지)
    if (!finished && mission < TARGETS.length) {
      const tg = TARGETS[mission];
      if (p === tg.p && n === tg.n && eCount === tg.e) {
        holdMs += dt * 16.7;
        if (holdMs > 500) {
          holdMs = 0;
          const chip = goalChips.querySelector(`[data-g="t${mission}"]`) as HTMLElement;
          chip.classList.add("on");
          chip.querySelector("span")!.textContent = "완성!";
          haptic(HAPTIC.correct);
          mission++;
          if (mission === 1)
            helper.innerHTML = "수소 완성! (+)1 = (−)1, <b>중성</b>이죠. 다음: <b>탄소</b>(양성자 6, 중성자 6, 전자 6).";
          else if (mission === 2)
            helper.innerHTML = "탄소 완성! 이제 마지막 — <b>산소</b>(양성자 8, 중성자 8, 전자 8).";
          else {
            finished = true;
            helper.innerHTML =
              "정리! 원자 = <b>원자핵(양성자+중성자)</b> + <b>전자</b>. 양성자수와 전자 수가 같아 <b>전기적으로 중성</b>이고, 원자의 <b>종류는 양성자수</b>가 정해요 — 방금 1개면 수소, 6개면 탄소, 8개면 산소였죠!";
            api.recordQuiz(true);
            api.enableCTA(s.cta ?? "개념 정리하기");
          }
        }
      } else holdMs = 0;
    }
  });

  sync();
  api.setCTA("원자를 조립해요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};

// ══════════════════════════════════════════════════════════
// ionLab — 이온 공방(전자 떼기·붙이기)
// ══════════════════════════════════════════════════════════
type IonSample = "Na" | "Cl" | "O";
const ION_META: Record<IonSample, { name: string; p: number; goal: number; goalName: string; read: string }> = {
  Na: { name: "나트륨", p: 11, goal: 1, goalName: "나트륨 이온", read: "Na⁺" },
  Cl: { name: "염소", p: 17, goal: -1, goalName: "염화 이온", read: "Cl⁻" },
  O: { name: "산소", p: 8, goal: -2, goalName: "산화 이온", read: "O²⁻" },
};

export const ionLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:290px" });
  const segBtns: Record<IonSample, HTMLButtonElement> = {} as Record<IonSample, HTMLButtonElement>;
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  (Object.keys(ION_META) as IonSample[]).forEach((k) => {
    const b = el("button", { text: ION_META[k].name, attrs: { type: "button" } });
    if (k === "Na") b.classList.add("on");
    b.addEventListener("click", () => pick(k));
    segBtns[k] = b;
    seg.appendChild(b);
  });
  const chargePill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7ED6FF" }), el("span", { html: "" }));
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg, chargePill));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...(Object.keys(ION_META) as IonSample[]).map((k) =>
      el("div", { class: "pn-badge", dataset: { g: k } }, el("b", { text: ION_META[k].read }), el("span", { text: `${ION_META[k].name}에서` })),
    ),
  );
  const loseBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "전자 1개 떼기 (−)" }));
  const gainBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "전자 1개 붙이기 (+)" }));
  const btnRow = el("div", { class: "gp-controls" }, loseBtn, gainBtn);
  const helper = el("div", {
    class: "helper",
    html: "나트륨 원자예요 — (+)11과 (−)11로 지금은 중성. 나트륨은 전자 <b>1개를 잃고 싶어</b> 해요. 떼어 볼까요?",
  });
  host.append(goalChips, stage, btnRow, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let sample: IonSample = "Na";
  let eCount = 11;
  const doneSet = new Set<IonSample>();
  let flyOff: { t: number; dir: number } | null = null; // 전자 이탈/유입 연출
  let finished = false;

  function pick(k: IonSample): void {
    sample = k;
    eCount = ION_META[k].p;
    flyOff = null;
    (Object.keys(segBtns) as IonSample[]).forEach((kk) => segBtns[kk].classList.toggle("on", kk === k));
    haptic(HAPTIC.select);
    const m = ION_META[k];
    helper.innerHTML =
      k === "Na"
        ? "나트륨 원자 — 전자 <b>1개를 잃으면</b> 어떤 전하를 띨까요?"
        : k === "Cl"
          ? `염소 원자 — 염소는 전자 <b>1개를 얻고 싶어</b> 해요. 붙여 보세요!`
          : `산소 원자 — 이번엔 전자를 <b>2개</b>나 얻어요. 두 번 붙이기!`;
    void m;
  }

  function change(delta: number): void {
    const m = ION_META[sample];
    const next = eCount + delta;
    if (next < m.p - 3 || next > m.p + 3) return;
    eCount = next;
    flyOff = { t: 0, dir: delta };
    haptic(HAPTIC.select);
    const net = m.p - eCount;
    if (net === m.goal && !doneSet.has(sample)) {
      doneSet.add(sample);
      haptic(HAPTIC.correct);
      const chip = goalChips.querySelector(`[data-g="${sample}"]`) as HTMLElement;
      chip.classList.add("on");
      chip.querySelector("span")!.textContent = "완성!";
      helper.innerHTML =
        sample === "Na"
          ? "완성! (+)11 vs (−)10 — (+)가 1 많아져 <b>양이온 Na⁺</b>. 이름은 그대로 '나트륨 이온'이에요."
          : sample === "Cl"
            ? "완성! (+)17 vs (−)18 — (−)가 1 많아져 <b>음이온 Cl⁻</b>. 음이온은 '~화 이온', 그래서 <b>염화 이온</b>!"
            : "완성! 전자 2개를 얻어 <b>O²⁻</b> — '소'를 빼고 <b>산화 이온</b>이라 읽어요. 잃거나 얻은 전자 수를 오른쪽 위에 쓰죠.";
      if (doneSet.size === 3 && !finished) {
        finished = true;
        api.recordQuiz(true);
        window.setTimeout(() => {
          helper.innerHTML =
            "정리! 원자가 전자를 <b>잃으면 (+) 양이온</b>, <b>얻으면 (−) 음이온</b>. 변한 건 <b>전자 수뿐</b> — 양성자수(원자의 정체)는 그대로예요!";
          api.enableCTA(s.cta ?? "개념 정리하기");
        }, 900);
      }
    } else if (net !== 0 && net !== m.goal) {
      helper.innerHTML = `지금 전하: ${net > 0 ? "+" : ""}${net}. 목표는 <b>${m.read}</b> — ${m.goal > 0 ? "전자를 잃어" : "전자를 얻어"} ${Math.abs(m.goal)}만큼 차이 나게!`;
    }
  }
  loseBtn.addEventListener("click", () => change(-1));
  gainBtn.addEventListener("click", () => change(1));

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 290);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const cx = W / 2;
    const cy = H / 2 + 10;
    const t = tMs / 1000;
    const m = ION_META[sample];
    const net = m.p - eCount;

    // 전하에 따른 오라(양이온 붉은 기, 음이온 푸른 기)
    if (net !== 0) {
      const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 130);
      g.addColorStop(0, net > 0 ? "rgba(255,120,90,.16)" : "rgba(90,150,255,.16)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.strokeStyle = "rgba(120,150,196,.18)";
    ctx.lineWidth = 1.2;
    for (const r of [62, 92]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.92, 0, 0, TAU);
      ctx.stroke();
    }
    drawNucleus(ctx, cx, cy, m.p, m.p, 21);
    for (let i = 0; i < eCount; i++) {
      const pos = electronPos(i, eCount, t, 62, 92);
      drawElectron(ctx, cx + pos.x, cy + pos.y, 7);
    }
    // 이탈/유입 전자 연출
    if (flyOff) {
      flyOff.t += dt * 0.045;
      const k = Math.min(1, flyOff.t);
      const rr = flyOff.dir < 0 ? 92 + k * 120 : 220 - k * 128;
      drawElectron(ctx, cx + rr, cy - rr * 0.4, 7, 1 - (flyOff.dir < 0 ? k : 0) * 0.6);
      if (k >= 1) flyOff = null;
    }
    // 이온식 표기
    if (net !== 0) drawIonLabel(ctx, cx + 96, cy - 88, m.name === "염소" ? "Cl" : m.name === "산소" ? "O" : "Na", net, 19);

    (chargePill.querySelectorAll("span")[1] as HTMLElement).innerHTML =
      `(+)${m.p} vs (−)${eCount} · ` + (net === 0 ? "<b>중성 원자</b>" : net > 0 ? `<b>양이온 +${net}</b>` : `<b>음이온 −${-net}</b>`);
  });

  api.setCTA("이온 셋을 만들어요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
