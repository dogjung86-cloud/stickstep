// chemParticles — 중2 IV 랩 2종.
//   elementLab(L1): 구리·물·염화 나트륨을 입자 수준으로 확대해 "몇 종류의 원자로
//     이루어졌나"로 원소/화합물을 직접 판정한다. 입자 표현은 chemKit 관례를 따른다
//     (구리 = 같은 원자 규칙 배열, 물 = H₂O 분자들, 염화 나트륨 = Na⁺/Cl⁻ 교대 격자·Cl⁻가 더 큼).
//   moleculeLab(L2/L5): 원자 팔레트를 탭해 목표 화학식대로 분자를 조립한다.
//     조성이 맞으면 실제 분자 모양(물 굽은형·CO₂ 직선형·NH₃ 세 갈래)으로 착 정렬.
//     mode "split"이면 조립한 물 분자를 쪼개 "분자가 깨지면 성질을 잃는다"를 체험.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { ELEMS, drawAtomBall, drawBond, drawIonLabel, formulaHtml, TAU } from "../../ui/chemKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ══════════════════════════════════════════════════════════
// elementLab — 원소와 화합물
// ══════════════════════════════════════════════════════════
type Sample = "cu" | "water" | "nacl";
const SAMPLE_NAME: Record<Sample, string> = { cu: "구리", water: "물", nacl: "염화 나트륨" };

export const elementLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:300px" });
  const segBtns: Record<Sample, HTMLButtonElement> = {} as Record<Sample, HTMLButtonElement>;
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  (Object.keys(SAMPLE_NAME) as Sample[]).forEach((k) => {
    const b = el("button", { text: SAMPLE_NAME[k], attrs: { type: "button" } });
    if (k === "cu") b.classList.add("on");
    b.addEventListener("click", () => pick(k));
    segBtns[k] = b;
    seg.appendChild(b);
  });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg), toast);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "cu" } }, el("b", { text: "구리" }), el("span", { text: "원소? 화합물?" })),
    el("div", { class: "pn-badge", dataset: { g: "water" } }, el("b", { text: "물" }), el("span", { text: "원소? 화합물?" })),
    el("div", { class: "pn-badge", dataset: { g: "nacl" } }, el("b", { text: "염화 나트륨" }), el("span", { text: "원소? 화합물?" })),
  );
  const elemBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "원소다! — 한 종류" }));
  const compBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "화합물이다! — 두 종류 이상" }));
  const btnRow = el("div", { class: "gp-controls" }, elemBtn, compBtn);
  const helper = el("div", {
    class: "helper",
    html: "구리를 원자 수준까지 확대했어요. 입자들을 잘 보고 — <b>몇 종류의 원자</b>로 이루어졌는지 아래에서 판정!",
  });
  host.append(goalChips, helper, stage, btnRow); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  let sample: Sample = "cu";
  const ANSWER: Record<Sample, boolean> = { cu: true, water: false, nacl: false }; // true = 원소
  const judged = new Set<Sample>();
  let wrongAny = false;
  let finished = false;
  let toastTimer = 0;

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1900);
  }

  function pick(k: Sample): void {
    sample = k;
    (Object.keys(segBtns) as Sample[]).forEach((kk) => segBtns[kk].classList.toggle("on", kk === k));
    haptic(HAPTIC.select);
    helper.innerHTML =
      k === "cu"
        ? "구리 확대 중 — 입자들의 <b>생김새</b>를 비교해 보세요. 다 같나요, 다른가요?"
        : k === "water"
          ? "물 확대 중 — 알갱이 하나(<b>물 분자</b>)를 자세히 보세요. 몇 <b>종류</b>의 원자가 보이나요?"
          : "염화 나트륨 확대 중 — 두 크기의 입자가 <b>번갈아 규칙적으로</b> 쌓여 있어요. 몇 종류일까요?";
  }

  function judge(sayElem: boolean): void {
    if (judged.has(sample)) {
      showToast("이 시료는 판정 완료! 다른 시료를 골라요");
      return;
    }
    const correct = ANSWER[sample] === sayElem;
    if (!correct) wrongAny = true;
    judged.add(sample);
    haptic(correct ? HAPTIC.correct : HAPTIC.wrong);
    const chip = goalChips.querySelector(`[data-g="${sample}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = ANSWER[sample] ? "원소!" : "화합물!";
    const why: Record<Sample, string> = {
      cu: "구리는 <b>구리 원자 한 종류</b>가 규칙적으로 배열된 <b>원소</b>예요.",
      water: "물 분자 하나엔 <b>수소(H)와 산소(O), 두 종류</b>의 원자가 들어 있어요 — <b>화합물</b>! 그래서 수소와 산소로 분해할 수 있죠.",
      nacl: "나트륨과 염소, <b>두 종류의 입자</b>가 번갈아 쌓여 있으니 <b>화합물</b>이에요. 성질은 나트륨과도 염소와도 전혀 다르죠!",
    };
    helper.innerHTML = (correct ? "정답! " : "아쉬워요 — ") + why[sample] + (judged.size < 3 ? " 다음 시료도 판정!" : "");
    if (judged.size === 3 && !finished) {
      finished = true;
      api.recordQuiz(!wrongAny);
      helper.innerHTML =
        "정리! <b>한 가지 종류</b>의 입자로 된 순물질이 <b>원소</b>(구리·산소), <b>서로 다른 종류</b>가 결합해 새로운 성질을 갖게 된 물질이 <b>화합물</b>(물·염화 나트륨) — 화합물은 성분 원소로 <b>분해할 수 있어요</b>.";
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }
  elemBtn.addEventListener("click", () => judge(true));
  compBtn.addEventListener("click", () => judge(false));

  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 300);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const t = tMs / 1000;
    // 확대경 링 연출
    ctx.strokeStyle = "rgba(150,176,210,.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 8, Math.min(W, H) * 0.44, 0, TAU);
    ctx.stroke();

    if (sample === "cu") {
      // 같은 원자의 규칙 배열(육방 느낌의 오프셋 격자) — 미세한 제자리 떨림만
      const g = 34;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 9; col++) {
          const x = 40 + col * g + (row % 2 ? g / 2 : 0) + Math.sin(t * 2 + row * 2 + col) * 1.2;
          const y = 52 + row * g * 0.88 + Math.cos(t * 2.3 + col * 1.7) * 1.2;
          if (Math.hypot(x - W / 2, y - H / 2 - 8) < Math.min(W, H) * 0.42) drawAtomBall(ctx, x, y, ELEMS.Cu, 1.05, { label: row === 3 && col === 4 });
        }
      }
    } else if (sample === "water") {
      // 물 분자들 — 전부 똑같은 H-O-H(굽은형 104.5°), 떠다님
      for (let i = 0; i < 9; i++) {
        const cx = W / 2 + Math.cos(t * 0.4 + i * 2.4) * (60 + (i % 3) * 34);
        const cy = H / 2 + 8 + Math.sin(t * 0.5 + i * 1.9) * (48 + (i % 2) * 26);
        const rot = t * 0.5 + i;
        drawWater(ctx, cx, cy, rot, 1);
      }
    } else {
      // NaCl 격자 — Na⁺(작음, 보라)와 Cl⁻(큼, 초록) 교대 배열 + 이온식 라벨
      const g = 42;
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          const x = 48 + col * g + Math.sin(t * 1.8 + row + col) * 0.8;
          const y = 54 + row * g + Math.cos(t * 2 + col) * 0.8;
          if (Math.hypot(x - W / 2, y - H / 2 - 8) > Math.min(W, H) * 0.42) continue;
          const isNa = (row + col) % 2 === 0;
          drawAtomBall(ctx, x, y, isNa ? ELEMS.Na : ELEMS.Cl, isNa ? 0.72 : 1.18, { label: false });
        }
      }
      drawIonLabel(ctx, 24, 26, "Na", 1, 14);
      drawIonLabel(ctx, 70, 26, "Cl", -1, 14);
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(174,196,228,.85)";
      ctx.fillText("작은 양이온과 큰 음이온이 번갈아 — 규칙적 배열", 18, H - 16);
    }
  });

  api.setCTA("세 시료를 판정해요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};

function drawWater(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, sc: number): void {
  const ang = (104.5 * Math.PI) / 180;
  const L = 17 * sc;
  const h1 = { x: cx + Math.cos(rot + ang / 2) * L, y: cy + Math.sin(rot + ang / 2) * L };
  const h2 = { x: cx + Math.cos(rot - ang / 2) * L, y: cy + Math.sin(rot - ang / 2) * L };
  drawBond(ctx, cx, cy, h1.x, h1.y, 4 * sc);
  drawBond(ctx, cx, cy, h2.x, h2.y, 4 * sc);
  drawAtomBall(ctx, h1.x, h1.y, ELEMS.H, sc, { label: false });
  drawAtomBall(ctx, h2.x, h2.y, ELEMS.H, sc, { label: false });
  drawAtomBall(ctx, cx, cy, ELEMS.O, sc, { label: false });
}

// ══════════════════════════════════════════════════════════
// moleculeLab — 화학식대로 분자 조립(+ 쪼개기 체험)
// ══════════════════════════════════════════════════════════
interface MolTarget {
  formula: string; // "H_2O"
  name: string;
  comp: Record<string, number>; // { H: 2, O: 1 }
}
interface MolStep extends LabStep {
  targets: MolTarget[];
  split?: boolean; // 마지막에 물 분자 쪼개기 체험
  palette?: string[];
}

// 분자 기하(중2 교과서 그림 수준) — 중심원자 기준 상대 좌표
const GEOM: Record<string, [string, number, number][]> = {
  H_2: [["H", -11, 0], ["H", 11, 0]],
  O_2: [["O", -13, 0], ["O", 13, 0]],
  N_2: [["N", -13, 0], ["N", 13, 0]],
  H_2O: [["O", 0, -4], ["H", -18, 10], ["H", 18, 10]],
  CO_2: [["C", 0, 0], ["O", -27, 0], ["O", 27, 0]],
  NH_3: [["N", 0, -6], ["H", -19, 10], ["H", 0, 16], ["H", 19, 10]],
  CH_4: [["C", 0, 0], ["H", 0, -22], ["H", 22, 0], ["H", 0, 22], ["H", -22, 0]],
  O_3: [["O", 0, -6], ["O", -22, 8], ["O", 22, 8]],
};
const BONDS: Record<string, [number, number][]> = {
  H_2: [[0, 1]], O_2: [[0, 1]], N_2: [[0, 1]],
  H_2O: [[0, 1], [0, 2]],
  CO_2: [[0, 1], [0, 2]],
  NH_3: [[0, 1], [0, 2], [0, 3]],
  CH_4: [[0, 1], [0, 2], [0, 3], [0, 4]],
  O_3: [[0, 1], [0, 2]],
};

export const moleculeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MolStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:280px" });
  const targetPill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#A2D13F" }), el("span", { html: "" }));
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, targetPill), toast);

  const goalChips = el("div", { class: `pn-badges ${s.targets.length + (s.split ? 1 : 0) === 3 ? "force3" : s.targets.length + (s.split ? 1 : 0) === 2 ? "duo" : "force4"}` });
  s.targets.forEach((t, i) => {
    goalChips.appendChild(
      el("div", { class: "pn-badge", dataset: { g: `t${i}` } }, el("b", { html: formulaHtml(t.formula) }), el("span", { text: t.name })),
    );
  });
  if (s.split) {
    goalChips.appendChild(el("div", { class: "pn-badge", dataset: { g: "split" } }, el("b", { text: "쪼개 보기" }), el("span", { text: "성질은?" })));
  }

  const palette = el("div", { class: "gp-controls" });
  const palBtns: Record<string, HTMLButtonElement> = {};
  (s.palette ?? ["H", "O", "C", "N"]).forEach((sym) => {
    const b = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { html: `${ELEMS[sym].name} <b>${sym}</b> 넣기` }));
    b.addEventListener("click", () => addAtom(sym));
    palBtns[sym] = b;
    palette.appendChild(b);
  });
  const undoBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "하나 빼기" }));
  undoBtn.addEventListener("click", () => {
    if (pool.length && !animating) {
      pool.pop();
      haptic(HAPTIC.tap);
      sync();
    }
  });
  const splitBtn = el("button", { class: "swapbtn", attrs: { type: "button" }, style: "display:none" }, el("span", { text: "완성한 물 분자 쪼개기" }));
  const row2 = el("div", { class: "gp-controls" }, undoBtn, splitBtn);
  const helper = el("div", { class: "helper" });
  host.append(goalChips, helper, stage, palette, row2); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let ti = 0; // 현재 목표
  let pool: string[] = []; // 담은 원자 기호들
  let settled = false; // 현재 목표 완성(정렬됨)
  let animating = false;
  let splitPhase = 0; // 0 없음, 1 쪼개짐
  let done = false;
  let toastTimer = 0;

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function target(): MolTarget {
    return s.targets[Math.min(ti, s.targets.length - 1)];
  }
  function compOf(list: string[]): Record<string, number> {
    const c: Record<string, number> = {};
    for (const x of list) c[x] = (c[x] ?? 0) + 1;
    return c;
  }
  function matches(): boolean {
    const c = compOf(pool);
    const t = target().comp;
    const keys = new Set([...Object.keys(c), ...Object.keys(t)]);
    for (const k of keys) if ((c[k] ?? 0) !== (t[k] ?? 0)) return false;
    return true;
  }
  function over(): boolean {
    const c = compOf(pool);
    const t = target().comp;
    for (const k of Object.keys(c)) if ((c[k] ?? 0) > (t[k] ?? 0)) return true;
    return false;
  }

  function sync(): void {
    const t = target();
    (targetPill.querySelectorAll("span")[1] as HTMLElement).innerHTML =
      done ? "임무 완료!" : `목표: <b>${t.name}</b> ${formulaHtml(t.formula)}`;
    if (done) return;
    if (matches()) {
      settled = true;
      animating = true;
      haptic(HAPTIC.correct);
      const chip = goalChips.querySelector(`[data-g="t${ti}"]`) as HTMLElement;
      chip.classList.add("on");
      chip.querySelector("span")!.textContent = "조립 완료!";
      const detail = Object.entries(t.comp).map(([k, n]) => `${ELEMS[k].name} 원자 ${n}개`).join(" + ");
      helper.innerHTML = `<b>${t.name}</b> 완성 — ${detail}. 화학식 ${formulaHtml(t.formula)}의 작은 숫자가 바로 <b>원자의 개수</b>예요!`;
      window.setTimeout(() => {
        animating = false;
        if (s.split && ti === s.targets.length - 1 && t.formula === "H_2O") {
          splitBtn.style.display = "";
          splitBtn.classList.add("pulse");
          helper.innerHTML += " 이제 이 분자를 <b>쪼개 볼까요</b>?";
          window.setTimeout(() => splitBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
        } else if (ti < s.targets.length - 1) {
          ti++;
          pool = [];
          settled = false;
          sync();
        } else finishAll();
      }, 1300);
    } else if (over()) {
      haptic(HAPTIC.wrong);
      showToast("목표 화학식보다 많아요 — 하나 빼기!");
      helper.innerHTML = `${formulaHtml(t.formula)}를 다시 읽어 봐요 — <b>종류별 개수</b>가 딱 맞아야 분자가 완성돼요.`;
    } else {
      helper.innerHTML = `좋아요, 계속! 목표 ${formulaHtml(t.formula)} = ` +
        Object.entries(t.comp).map(([k, n]) => `${k} ${n}개`).join(", ") + `. 지금 담은 것: ${pool.length ? pool.join(", ") : "없음"}`;
    }
  }

  function addAtom(sym: string): void {
    if (settled || done) return;
    pool.push(sym);
    haptic(HAPTIC.tap);
    sync();
  }

  splitBtn.addEventListener("click", () => {
    if (splitPhase) return;
    splitPhase = 1;
    splitBtn.classList.remove("pulse");
    (splitBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.wrong);
    const chip = goalChips.querySelector(`[data-g="split"]`) as HTMLElement;
    chip?.classList.add("on");
    chip?.querySelector("span") && (chip.querySelector("span")!.textContent = "성질이 사라짐!");
    helper.innerHTML =
      "수소 원자와 산소 원자로 갈라졌어요 — 이제 이건 <b>물이 아니에요</b>! 분자는 <b>물질의 성질을 나타내는 가장 작은 입자</b>라서, 원자로 나누어지면 그 성질이 사라져요.";
    window.setTimeout(finishAll, 1600);
  });

  function finishAll(): void {
    if (done) return;
    done = true;
    api.recordQuiz(true);
    if (!s.split)
      helper.innerHTML =
        "정리! <b>화학식</b>은 원소 기호에 <b>원자 개수</b>를 작은 숫자로 붙여 물질을 나타내요(1은 생략). 철(Fe)처럼 원자가 이어 붙은 물질은 기호만으로 나타내죠.";
    api.enableCTA(s.cta ?? "개념 정리하기");
    sync();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 280);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const cx = W / 2;
    const cy = H / 2 + 6;
    const t = target();
    const key = t.formula;

    if (settled && GEOM[key]) {
      // 완성 정렬(또는 쪼개짐 산개)
      const sc = 1.55;
      const geo = GEOM[key];
      if (!splitPhase) {
        for (const [a, b] of BONDS[key] ?? []) {
          drawBond(ctx, cx + geo[a][1] * sc, cy + geo[a][2] * sc, cx + geo[b][1] * sc, cy + geo[b][2] * sc, 6);
        }
        // 중심 원자를 마지막에(겹침 순서)
        for (let i = geo.length - 1; i >= 0; i--) {
          const [sym, dx, dy] = geo[i];
          drawAtomBall(ctx, cx + dx * sc, cy + dy * sc, ELEMS[sym], 1.55);
        }
        ctx.font = "800 13px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(226,238,252,.95)";
        ctx.fillText(`${t.name} 분자 1개`, cx, cy + 74);
      } else {
        // 쪼개짐 — 원자들이 흩어지고 물성 배지가 꺼진다
        const sp = 1 + Math.min(1, (tMs % 100000) * 0) + 1.6;
        geo.forEach(([sym, dx, dy], i) => {
          const px = cx + dx * sc * sp + Math.sin(tMs / 400 + i * 2) * 4;
          const py = cy + dy * sc * sp + Math.cos(tMs / 360 + i) * 4;
          drawAtomBall(ctx, px, py, ELEMS[sym], 1.4);
        });
        ctx.font = "800 12.5px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,160,140,.95)";
        ctx.fillText("이제 '물'이 아니에요 — 성질이 사라졌어요", cx, cy + 78);
      }
    } else {
      // 조립 중 — 담은 원자들이 중앙 주위를 맴돈다
      pool.forEach((sym, i) => {
        const a = (i / Math.max(1, pool.length)) * TAU + tMs / 1400;
        const rr = 46 + (i % 2) * 16;
        drawAtomBall(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.72, ELEMS[sym], 1.35);
      });
      if (!pool.length) {
        ctx.font = "700 12px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(150,176,210,.7)";
        ctx.fillText("아래 버튼으로 원자를 담아 보세요", cx, cy);
      }
      // 목표 실루엣(점선)
      if (GEOM[key]) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        const sc = 1.55;
        GEOM[key].forEach(([sym, dx, dy]) => drawAtomBall(ctx, cx + dx * sc, cy + dy * sc, ELEMS[sym], 1.55, { ghost: true, label: false, alpha: 0.35 }));
        ctx.restore();
      }
    }
  });

  sync();
  api.setCTA("분자를 조립해요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};
