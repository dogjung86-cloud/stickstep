// curveLab, 곡선 정원(반비례 그래프 발견 랩, 자체 제작 상수 xy=8). xy=8을 지키는 점을 좌우로
// 끌면 원점과 점이 만드는 직사각형(넓이 항상 8)이 변형되고, 지나간 자리에 자취가 남아
// 한 쌍의 매끄러운 곡선이 자라난다. 축 끝까지 밀면 "닿을 듯 닿지 않는" 성질을 만난다.
//   격자점 (1,8)(2,4)(4,2)(8,1)이 전부 모눈 위: 좌표평면은 ±8.
//   목표 ① 자취로 곡선 만들기 ② 양 끝 관찰(축 근접, 0 금지) ③ a=−8 반전(제2·4사분면)
// 점은 곡선 위에 구속(드래그는 x만 조종, y=a/x 자동). setPointerCapture는 try/catch(사고 7).
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA. rAF 금지(CSS+setTimeout).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CurveStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

export const curveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CurveStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "trail", label: "곡선 자취", sub: "0/14" },
    { id: "asym", label: "축 근접 관찰", sub: "양 끝까지" },
    { id: "neg", label: "음수의 세계", sub: "잠김" },
  ]);

  const board = mboard(500);
  const qCard = el("div", { class: "mdr-q mcl-q" });
  const spec = planeSpec({ min: -8, max: 8, size: 340, labelEvery: 2 });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    `<g class="cv-rect"></g>` +
    `<g class="cv-trail"></g>` +
    `<path class="cv-curve" d="" stroke="#0DA5C6" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0" style="transition: opacity .6s ease"/>` +
    `<g class="cv-pt" style="transition: transform .1s ease-out">` +
    `<circle class="ql-halo" r="15" fill="#E8608A" opacity=".16"/>` +
    `<circle r="7.5" fill="url(#cv-bd)" stroke="#B03A54" stroke-width="1.8"/>` +
    `<circle r="22" fill="transparent"/>` +
    `</g>` +
    `<defs><radialGradient id="cv-bd" cx=".36" cy=".3" r="1"><stop offset="0" stop-color="#FF9EB4"/><stop offset="1" stop-color="#E8608A"/></radialGradient></defs>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  board.append(qCard, svgWrap, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "분홍 점은 <b>곱 x×y=8</b>을 절대 어기지 않아요. 좌우로 끌면서 직사각형과 자취를 관찰해 보세요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const pt = svg.querySelector(".cv-pt") as SVGGElement;
  const gRect = svg.querySelector(".cv-rect") as SVGGElement;
  const gTrail = svg.querySelector(".cv-trail") as SVGGElement;
  const curve = svg.querySelector(".cv-curve") as SVGPathElement;

  const timers = new Set<number>();

  let a = 8;
  let x = 2; // 현재 점의 x(부호 = 가지)
  let lastStamp = 0;
  let trailN = 0;
  let edgeFar = false;
  let edgeNear = false;
  let negTrail = 0;
  let finished = false;

  const yOf = (xx: number): number => a / xx;
  const X_MIN = 1; // |x| ∈ [1, 8] → |y|도 [1, 8]

  function fmtEq(): string {
    return `x×y = ${a < 0 ? "−8" : "8"}`;
  }

  function paintCard(): void {
    const y = yOf(x);
    const disp = (v: number): string => String(Math.round(v * 100) / 100).replace("-", "−");
    qCard.innerHTML =
      `<span class="mcl-k">${fmtEq()}</span> ` +
      `<span class="cv-read">x=${disp(x)}, y=${disp(y)}</span>` +
      `<span class="ln-quad ${a > 0 ? "pos" : "neg"}">${a > 0 ? "제1·3사분면" : "제2·4사분면"}</span>`;
  }

  function paint(): void {
    const y = yOf(x);
    pt.style.transform = `translate(${spec.px(x)}px, ${spec.py(y)}px)`;
    // 원점-점 직사각형(넓이 |a| 고정)
    const x0 = spec.px(0);
    const y0 = spec.py(0);
    const x1 = spec.px(x);
    const y1 = spec.py(y);
    const rx = Math.min(x0, x1);
    const ry = Math.min(y0, y1);
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    const col = a > 0 ? "#0DA5C6" : "#8A6EE0";
    gRect.innerHTML =
      `<rect x="${rx}" y="${ry}" width="${w}" height="${h}" fill="${col}" opacity=".12" stroke="${col}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
      `<text x="${rx + w / 2}" y="${ry + h / 2 + 4}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${col}">넓이 8</text>`;
    paintCard();
  }

  function stamp(): void {
    const now = Date.now();
    if (now - lastStamp < 70) return;
    lastStamp = now;
    const y = yOf(x);
    gTrail.innerHTML += `<circle cx="${spec.px(x)}" cy="${spec.py(y)}" r="3" fill="${a > 0 ? "#7FC8DC" : "#B9A6F2"}" opacity=".75"/>`;
    if (a > 0) {
      trailN += 1;
      if (!chips.has("trail")) {
        const chip = chips.el.querySelector(`[data-g="trail"] span`) as HTMLElement;
        chip.textContent = `${Math.min(trailN, 14)}/14`;
        if (trailN >= 14) {
          chips.on("trail", "곡선 등장!");
          drawCurve();
          toast("자취가 매끄러운 곡선이 됐어요!");
          helper.innerHTML = "이제 점을 <b>양쪽 끝까지</b> 밀어 보세요. 곡선은 축과 만날 수 있을까요?";
        }
      }
    } else {
      negTrail += 1;
      if (negTrail >= 8 && !chips.has("neg")) {
        chips.on("neg", "2·4사분면!");
        drawCurve();
        finishLab();
      }
    }
  }

  /** 현재 a의 두 가지 곡선을 매끄럽게 그린다. */
  function drawCurve(): void {
    const branch = (sign: 1 | -1): string => {
      let d = "";
      for (let i = 0; i <= 40; i++) {
        const xx = sign * (X_MIN + (i / 40) * (8 - X_MIN));
        const yy = yOf(xx);
        d += `${i === 0 ? "M" : "L"}${spec.px(xx).toFixed(1)} ${spec.py(yy).toFixed(1)} `;
      }
      return d;
    };
    curve.setAttribute("d", branch(1) + branch(-1));
    curve.setAttribute("stroke", a > 0 ? "#0DA5C6" : "#8A6EE0");
    curve.style.opacity = "1";
  }

  function judgeEdges(): void {
    if (a < 0 || chips.has("asym")) return;
    if (Math.abs(x) >= 7.5 && !edgeFar) {
      edgeFar = true;
      haptic(HAPTIC.tap);
      toast("x가 커질수록 y는 0에 다가가요, 그런데 절대 0이 되진 않죠!");
    }
    if (Math.abs(x) <= 1.05 && !edgeNear) {
      edgeNear = true;
      haptic(HAPTIC.tap);
      toast("x가 0으로 다가가면 y가 치솟아요! x=0은 영원히 금지 구역이에요.");
    }
    if (edgeFar && edgeNear) {
      chips.on("asym", "닿을 듯 안 닿아!");
      helper.innerHTML =
        "곡선은 좌표축에 <b>한없이 가까워지지만 절대 닿지 않아요</b>. 곱이 8이어야 하는데 x나 y가 0이면 곱이 0이 되어 버리니까요! 이제 아래에서 <b>a를 −8로</b> 바꿔 보세요.";
      const chip = chips.el.querySelector(`[data-g="neg"] span`) as HTMLElement;
      chip.textContent = "도전!";
      negBtn();
    }
  }

  function negBtn(): void {
    clear(actions);
    const pos = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "a = 8" })) as HTMLButtonElement;
    const neg = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "a = −8" })) as HTMLButtonElement;
    const swap = (na: number): void => {
      if (a === na) return;
      a = na;
      x = na > 0 ? 2 : -2; // 반전하면 가지가 2·4사분면으로: x>0이면 y<0
      gTrail.innerHTML = "";
      curve.style.opacity = "0";
      if (a < 0) {
        helper.innerHTML = "곱이 <b>−8</b>이 됐어요. x가 양수면 y는 음수, 곡선이 <b>제2·4사분면</b>으로 이사했죠. 자취를 남겨 확인해 보세요!";
        toast("이제 x×y=−8, 부호가 반대인 짝!");
      }
      haptic(HAPTIC.select);
      paint();
    };
    pos.addEventListener("click", () => swap(8));
    neg.addEventListener("click", () => swap(-8));
    actions.append(pos, neg);
    timers.add(window.setTimeout(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80)); // 화면 밖 등장 보정
  }

  function finishLab(): void {
    if (finished) return;
    finished = true;
    haptic(HAPTIC.done);
    helper.innerHTML =
      "정원 완성! 반비례 그래프는 <b>한 쌍의 매끄러운 곡선</b>, a>0이면 1·3사분면, a<0이면 2·4사분면. 그리고 언제나 <b>축에 닿을 듯 닿지 않아요</b>.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function moveTo(clientX: number, clientY: number): void {
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * spec.size;
    const sy = ((clientY - rect.top) / rect.height) * spec.size;
    let vx = spec.vx(sx);
    const vy = spec.vy(sy);
    // 가지 선택: a>0이면 포인터가 3사분면 쪽(x<0, y<0)일 때 음가지, a<0이면 (x<0,y>0)이 2사분면 가지
    const wantNeg = a > 0 ? vx < 0 && vy < 0 : vx < 0;
    const sign = wantNeg ? -1 : 1;
    vx = Math.abs(vx);
    vx = Math.max(X_MIN, Math.min(8, vx));
    x = sign * (Math.round(vx * 4) / 4);
    paint();
    stamp();
  }

  let dragging = false;
  svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 안전(사고 7) */
    }
    moveTo(e.clientX, e.clientY);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) moveTo(e.clientX, e.clientY);
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    judgeEdges();
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paint();
  api.setCTA("정원을 완성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
