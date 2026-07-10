// directorLab — L1 적용 랩 시제품 "입자 연출가". [임시 프리뷰 — 본 커리큘럼 미부착]
// 위치: recap(개념 카드) 뒤. 카드 세 장의 내용을 학생이 손으로 재조립하는 복습 활동이다.
//   발견 랩에서는 온도 슬라이더 하나가 "활발함·간격"을 자동으로 묶어 보여줬다.
//   여기서는 그 묶음을 풀어 움직임·간격·크기 다이얼 3개를 독립으로 주고, 편의점 진열대의
//   음료 3종(냉장 주스 5℃ · 생수 20℃ · 온장 커피 60℃)에 올바른 입자 상태를 직접 연출하게 한다.
//   · 시작 상태: '입자의 눈' 데이터가 지워져 모든 입자가 정지(회색) — 생기를 불어넣는 진행이 보인다
//   · 함정 ①: 움직임 0(정지)인 채 재촬영 → "차가워도 입자는 멈추지 않아요" 오개념 교정
//   · 함정 ②: 크기 다이얼 → 정답은 언제나 '그대로'(가열해도 입자 크기는 불변, recap 카드 회수)
//   · 판정: 온도 순서대로 움직임·간격이 모두 커져야 하고(커플링 재현), 주스는 둔하게·커피는 활발하게
//   · 입자 색은 학생이 정한 움직임을 따른다(배운 온도색 언어) — 5℃ 칸에 주황 입자가 뜨면 스스로 어색함이 보인다

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, drawGlowParticle, makeParticles, stepFree, type Box, type FreeParticle } from "../../ui/thermo";
import type { StepRenderer } from "../types";

interface DirectorStep {
  title: string;
  lead?: string;
  cta?: string;
}

const N = 13; // 칸당 입자 수
const SPEEDS = [0, 0.16, 0.34, 0.62, 1.15, 1.9]; // 움직임 0~5 → 목표 속력
const REPELS = [16, 12, 17, 23, 31, 42]; // 간격 1~5 → 반발 반경([0]은 미사용)
const RADII = [4.2, 5.6, 7.4]; // 크기 0~2 → 입자 반지름
const M_WORDS = ["정지", "아주 둔함", "둔함", "보통", "활발", "아주 활발"];
const G_WORDS = ["", "아주 좁음", "좁음", "보통", "넓음", "아주 넓음"];
const S_WORDS = ["작게", "그대로", "크게"];

interface Drink {
  id: string;
  name: string;
  temp: number;
  m: number; // 움직임 0~5 (시작은 0 = 지워진 장면)
  g: number; // 간격 1~5
  s: number; // 크기 0~2 (1 = 그대로)
  visited: boolean;
  ps: FreeParticle[];
  box: Box;
}

export const directorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DirectorStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const drinks: Drink[] = [
    { id: "juice", name: "냉장 주스", temp: 5, m: 0, g: 3, s: 1, visited: true, ps: [], box: { x: 0, y: 0, w: 10, h: 10 } },
    { id: "water", name: "생수", temp: 20, m: 0, g: 3, s: 1, visited: false, ps: [], box: { x: 0, y: 0, w: 10, h: 10 } },
    { id: "coffee", name: "온장 커피", temp: 60, m: 0, g: 3, s: 1, visited: false, ps: [], box: { x: 0, y: 0, w: 10, h: 10 } },
  ];
  let sel = 0; // 선택된 음료
  let finished = false;

  // ---- 목표 칩 · 지시 ----
  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...drinks.map((d) =>
      el("div", { class: "pn-badge", dataset: { g: d.id } }, el("b", { text: d.name }), el("span", { text: `${d.temp}℃ 연출` })),
    ),
  );
  const helper = el("div", {
    class: "helper",
    html: "‘입자의 눈’ 데이터가 지워져서 <b>모든 입자가 멈춰</b> 있어요! 음료를 하나씩 골라 <b>움직임과 간격</b>을 온도에 맞게 연출하고, 셋 다 끝나면 <b>재촬영</b>을 눌러요.",
  });

  // ---- 무대: 편의점 진열대(칸 3개) ----
  const canvas = el("canvas", { class: "hp-canvas", style: "height:216px" });
  const tags = drinks.map((d, i) =>
    el(
      "div",
      { class: `dl-tag${i === 0 ? " sel" : ""}`, dataset: { tag: d.id } },
      el("div", { class: "pill" }, el("span", { text: `${d.name} ` }), el("b", { class: "dl-temp", text: `${d.temp}℃` }), el("span", { class: "dl-mark" })),
    ),
  );
  const tagsRow = el("div", { class: "dl-tags" }, ...tags);
  const toastEl = el("div", { class: "toast low" });
  const stage = el("div", { class: "stage hp-stage" }, canvas, tagsRow, toastEl);

  // ---- 조작부: 음료 선택 seg + 다이얼 3줄 + 재촬영 ----
  const segBtns = drinks.map((d, i) => {
    const b = el("button", { text: d.name, dataset: { drink: d.id } }) as HTMLButtonElement;
    if (i === 0) b.classList.add("on");
    b.addEventListener("click", () => selectDrink(i));
    return b;
  });
  const seg = el("div", { class: "seg dl-seg" }, ...segBtns);

  interface DialRow {
    row: HTMLElement;
    val: HTMLElement;
    minus: HTMLButtonElement;
    plus: HTMLButtonElement;
  }
  function dialRow(label: string, dial: "m" | "g" | "s"): DialRow {
    const minus = el("button", { class: "ck-btn", text: "−", dataset: { dial, d: "-1" }, attrs: { "aria-label": `${label} 줄이기` } }) as HTMLButtonElement;
    const plus = el("button", { class: "ck-btn", text: "+", dataset: { dial, d: "1" }, attrs: { "aria-label": `${label} 늘리기` } }) as HTMLButtonElement;
    const val = el("span", { class: "dl-val" });
    const row = el("div", { class: "ck-step" }, el("b", { text: label }), minus, val, plus);
    const bump = (dir: number): void => {
      const d = drinks[sel];
      if (dial === "m") d.m = clamp(d.m + dir, 0, 5);
      else if (dial === "g") d.g = clamp(d.g + dir, 1, 5);
      else d.s = clamp(d.s + dir, 0, 2);
      haptic(HAPTIC.tap);
      syncDials();
    };
    minus.addEventListener("click", () => bump(-1));
    plus.addEventListener("click", () => bump(1));
    return { row, val, minus, plus };
  }
  const mRow = dialRow("입자 움직임", "m");
  const gRow = dialRow("입자 사이 간격", "g");
  const sRow = dialRow("입자 크기", "s");
  const dials = el("div", { class: "dl-dials" }, mRow.row, gRow.row, sRow.row);

  const shootBtn = el("button", { class: "swapbtn", html: "<span>입자의 눈으로 재촬영</span>", attrs: { disabled: "" } }) as HTMLButtonElement;

  host.append(goalChips, helper, stage, seg, dials, shootBtn); // 지시(helper)는 조작 요소 위, 조작부는 무대 아래

  // ---- 상태 동기화 ----
  function syncDials(): void {
    const d = drinks[sel];
    mRow.val.textContent = M_WORDS[d.m];
    gRow.val.textContent = G_WORDS[d.g];
    sRow.val.textContent = S_WORDS[d.s];
    mRow.val.classList.toggle("dim", d.m === 0);
    mRow.minus.disabled = d.m <= 0;
    mRow.plus.disabled = d.m >= 5;
    gRow.minus.disabled = d.g <= 1;
    gRow.plus.disabled = d.g >= 5;
    sRow.minus.disabled = d.s <= 0;
    sRow.plus.disabled = d.s >= 2;
  }
  function selectDrink(i: number): void {
    sel = i;
    drinks[i].visited = true;
    segBtns.forEach((b, j) => b.classList.toggle("on", j === i));
    tags.forEach((t, j) => t.classList.toggle("sel", j === i));
    if (!finished && drinks.every((d) => d.visited)) shootBtn.removeAttribute("disabled");
    haptic(HAPTIC.tap);
    syncDials();
  }
  // 무대의 칸을 직접 탭해도 선택된다
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const i = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * 3), 0, 2);
    selectDrink(i);
  });

  let toastTimer = 0;
  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  // ---- 재촬영(커밋) 판정 ----
  function setMark(i: number, ok: boolean | null): void {
    const mark = tags[i].querySelector(".dl-mark") as HTMLElement;
    mark.textContent = ok === null ? "" : ok ? "✓" : "✗";
    mark.className = `dl-mark${ok === null ? "" : ok ? " ok" : " no"}`;
  }
  function firstProblem(): { msg: string; idx: number } | null {
    const [j, w, c] = drinks;
    for (let i = 0; i < drinks.length; i++) {
      const d = drinks[i];
      if (d.m === 0)
        return {
          idx: i,
          msg:
            d.temp <= 5
              ? `<b>${d.name}(${d.temp}℃)</b>의 입자가 완전히 멈춰 있어요. <b>차가워도 입자는 멈추지 않아요</b> — 둔하게라도 움직이게 해 주세요.`
              : `<b>${d.name}(${d.temp}℃)</b>의 입자가 멈춰 있어요. 온도가 있다는 건 곧 <b>입자가 움직이고 있다</b>는 뜻이에요.`,
        };
    }
    for (let i = 0; i < drinks.length; i++) {
      const d = drinks[i];
      if (d.s !== 1)
        return {
          idx: i,
          msg: `<b>${d.name}</b>의 입자 <b>크기</b>를 바꿨네요. 온도가 달라져도 입자 하나하나의 크기는 <b>그대로</b>예요 — 변하는 건 <b>움직임과 사이 간격</b>! 크기를 ‘그대로’로 되돌려 주세요.`,
        };
    }
    if (j.m > 2) return { idx: 0, msg: `냉장고에서 막 나온 <b>${j.temp}℃ 주스</b>치고는 입자가 너무 활발해요 — 더 둔하게 연출해 주세요.` };
    if (c.m < 4) return { idx: 2, msg: `<b>${c.temp}℃ 온장 커피</b>치고는 입자가 조용해요 — 훨씬 활발하게!` };
    const pairs: [Drink, Drink, number][] = [
      [j, w, 0],
      [w, c, 1],
    ];
    for (const [cold, hot, ci] of pairs) {
      if (cold.m >= hot.m)
        return {
          idx: ci,
          msg: `<b>${cold.name}(${cold.temp}℃)</b>의 입자가 <b>${hot.name}(${hot.temp}℃)</b>보다 둔하지 않아요. 온도가 높을수록 입자는 <b>더 활발</b>해야 해요.`,
        };
    }
    for (const [cold, hot, ci] of pairs) {
      if (cold.g >= hot.g)
        return {
          idx: ci + 1,
          msg: `움직임은 좋아요! 그런데 <b>간격</b>도 온도를 따라가요 — 온도가 높을수록 입자 사이가 <b>멀어져요</b>. <b>${hot.name}</b>의 간격을 <b>${cold.name}</b>보다 넓게 연출해 주세요.`,
        };
    }
    return null;
  }

  shootBtn.addEventListener("click", () => {
    if (finished || shootBtn.hasAttribute("disabled")) return;
    haptic(HAPTIC.tap);
    drinks.forEach((_, i) => setMark(i, null));
    const problem = firstProblem();
    if (problem) {
      haptic(HAPTIC.wrong);
      setMark(problem.idx, false);
      helper.innerHTML = problem.msg;
      toast("다시 연출해 보세요");
      return;
    }
    drinks.forEach((d, i) => {
      setMark(i, true);
      (goalChips.querySelector(`[data-g="${d.id}"]`) as HTMLElement).classList.add("on");
    });
    finished = true;
    haptic(HAPTIC.done);
    toast("재촬영 성공!");
    helper.innerHTML =
      "완벽한 연출이에요! 움직임도 간격도 온도를 따라갔죠. 그리고 눈치챘나요? <b>입자 크기</b> 다이얼은 건드릴 필요가 없었어요 — 온도가 변해도 입자의 크기는 <b>그대로</b>거든요. 변하는 건 <b>활발함과 간격</b>, 그게 카드 세 장의 핵심이에요.";
    shootBtn.classList.add("done-static");
    (shootBtn.querySelector("span") as HTMLElement).textContent = "재촬영 완료";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "문제 풀기");
  });

  // ---- 그리기 ----
  function layout(w: number, h: number): void {
    const cw = w / 3;
    drinks.forEach((d, i) => {
      d.box = { x: i * cw + 12, y: 46, w: cw - 24, h: h - 60 };
    });
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 216);
    layout(w, h);

    drinks.forEach((d, i) => {
      const tGiven = (d.temp - 0) / 70; // 칸 테두리 무드(주어진 온도) — 0~70℃ 근사 램프
      const x0 = (i * w) / 3;
      const cw = w / 3;
      // 칸 배경 무드: 주어진 온도의 은은한 세로 그라데이션(입력 정보라 누설이 아니다)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, tempColor(clamp(tGiven, 0, 1), 0.02));
      grad.addColorStop(1, tempColor(clamp(tGiven, 0, 1), 0.1));
      ctx.fillStyle = grad;
      ctx.fillRect(x0 + 2, 0, cw - 4, h);
      // 선택된 칸 표시
      if (i === sel && !finished) {
        ctx.strokeStyle = "rgba(255,255,255,.2)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x0 + 3, 3, cw - 6, h - 6);
      }
      // 칸막이
      if (i > 0) {
        ctx.strokeStyle = "rgba(255,255,255,.09)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, 8);
        ctx.lineTo(x0, h - 8);
        ctx.stroke();
      }

      // 입자: 움직임 다이얼이 속도·색을, 간격 다이얼이 반발을, 크기 다이얼이 반지름을 결정
      const frozen = d.m === 0;
      const speed = SPEEDS[d.m];
      const tSet = d.m / 5; // 학생이 정한 활발함 → 배운 온도색 언어로 표현
      stepFree(d.ps, d.box, dt, Math.max(0.02, speed), REPELS[d.g]);
      const r = RADII[d.s];
      for (const p of d.ps) {
        const vx = p.x - p.px;
        const vy = p.y - p.py;
        const sp = Math.hypot(vx, vy);
        if (!frozen && sp > 0.9) {
          ctx.strokeStyle = tempColor(tSet, Math.min(0.4, (sp - 0.8) * 0.16));
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x - vx * 3.2, p.y - vy * 3.2);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        if (frozen) {
          // 지워진 장면 — 회색으로 꺼진 입자(글로우 없음)
          ctx.fillStyle = "rgba(150,164,186,.55)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.14)";
          ctx.beginPath();
          ctx.arc(p.x - r * 0.32, p.y - r * 0.34, r * 0.34, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const shiver = (1 - tSet) * 0.7;
          const ox = Math.sin(tMs / 70 + p.seed * 40) * shiver;
          const oy = Math.cos(tMs / 64 + p.seed * 60) * shiver;
          drawGlowParticle(ctx, p.x + ox, p.y + oy, r, tSet, 2.1);
        }
      }
    });
  });

  // ---- 마운트 ----
  api.setCTA("세 음료의 입자를 연출하세요", { enabled: false });
  function fit(): void {
    const { w, h } = fitCanvas(canvas, 216);
    layout(w, h);
    for (const d of drinks) {
      if (d.ps.length === 0) d.ps = makeParticles(N, d.box);
      for (const p of d.ps) {
        p.x = clamp(p.x, d.box.x, d.box.x + d.box.w);
        p.y = clamp(p.y, d.box.y, d.box.y + d.box.h);
      }
    }
  }
  window.addEventListener("resize", fit);
  const rafId = requestAnimationFrame(() => {
    fit();
    syncDials();
    loop.start();
  });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", fit);
    window.clearTimeout(toastTimer);
  };
};
