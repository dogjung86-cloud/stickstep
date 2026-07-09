// circleLab, 원의 부품 랩(Ⅴ 평면도형 — 교과서 194~195쪽 원과 부채꼴 용어).
// 국면 3개: 1 점 B를 원 위로 드래그해 호 관찰 + "현 긋기"(가장 긴 현=지름 힌트) →
//   2 부채꼴(앰버)과 활꼴(시안) 두 영역을 구분 탭(교과서처럼 서로 다른 자리에 배치) →
//   3 B를 드래그해 중심각 180° 만들기: 반원 스냅, "부채꼴이면서 활꼴" 발견(교과서 역량활동).
// 판정은 pointerup/탭에서, 드래그 중에는 즉시 갱신만. 모션은 CSS transition + setTimeout. rAF 금지.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, angleOf, normDeg, arcPath, dot, ptLabel, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CircleStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 276;
const OX = 170;
const OY = 140;
const R = 100;
const A_DEG = 205; // 점 A(고정)

export const circleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CircleStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "arc", label: "호와 현", sub: "만들기" },
    { id: "sector", label: "부채꼴·활꼴", sub: "구분 탭" },
    { id: "half", label: "반원의 비밀", sub: "둘 다!" },
  ]);

  const board = mboard(580);
  const stage = el("div", { class: "mcl-stage" });
  const panel = el("div", { class: "mcl-panel" });
  const inst = el("div", { class: "mcl-inst", html: "점 <b>B</b>를 잡고 원 둘레를 따라 움직여 보세요" });
  const ctl = el("div", { class: "mcl-ctl" });
  panel.append(inst, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "수박을 자르기 전에, 원의 <b>부품</b>부터 알아야 해요. 점 두 개가 원을 어떻게 나누는지 봐요!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let bDeg = 320; // 점 B의 각(드래그)
  let phase: 1 | 2 | 3 = 1;
  let finished = false;
  let lock = false;
  let dragging = false;
  let moveAcc = 0;
  let chordDrawn = false;
  let tappedSector = false;

  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mcl-fill"></g>` +
    `<circle cx="${OX}" cy="${OY}" r="${R}" stroke="${GEO.ink}" stroke-width="2.8"/>` +
    `<g class="mcl-parts"></g><g class="mcl-deco"></g><g class="mcl-pts"></g>` +
    `</svg>`;
  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gFill = svg.querySelector(".mcl-fill") as SVGGElement;
  const gParts = svg.querySelector(".mcl-parts") as SVGGElement;
  const gDeco = svg.querySelector(".mcl-deco") as SVGGElement;
  const gPts = svg.querySelector(".mcl-pts") as SVGGElement;

  /** A→B 반시계 span이 180 이하가 되는 방향으로 짧은 호를 정의. */
  function minorArc(): { a0: number; a1: number; span: number } {
    const d = normDeg(bDeg - A_DEG);
    return d <= 180 ? { a0: A_DEG, a1: bDeg, span: d } : { a0: bDeg, a1: A_DEG, span: 360 - d };
  }

  function render(): void {
    const A = polar(OX, OY, R, A_DEG);
    const B = polar(OX, OY, R, bDeg);
    const m = minorArc();
    let parts = "";
    let fills = "";
    if (phase === 1) {
      // 짧은 호(앰버) + 긴 호(회색 점선 오버레이) + 현
      parts += `<path d="${arcPath(OX, OY, R, m.a0, m.a1)}" stroke="${GEO.hlA}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      const mid = polar(OX, OY, R + 16, m.a0 + m.span / 2);
      parts += `<text x="${mid.x.toFixed(1)}" y="${(mid.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.hlA}">호 AB</text>`;
      if (chordDrawn) {
        parts += `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" stroke="${GEO.hlB}" stroke-width="3.4" stroke-linecap="round"/>`;
        const cm = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        parts += `<text x="${(cm.x + (OX - cm.x) * 0.22).toFixed(1)}" y="${(cm.y + (OY - cm.y) * 0.22 + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.hlB}">현 AB</text>`;
      }
    } else if (phase === 3) {
      // 부채꼴 채움 + 현 + 중심각 표기
      const p0 = polar(OX, OY, R, m.a0);
      const p1 = polar(OX, OY, R, m.a1);
      fills += `<path d="M${OX} ${OY} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${R} ${R} 0 ${m.span > 180 ? 1 : 0} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${GEO.hlA}" opacity=".24"/>`;
      parts +=
        `<line x1="${OX}" y1="${OY}" x2="${A.x.toFixed(1)}" y2="${A.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6"/>` +
        `<line x1="${OX}" y1="${OY}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6"/>` +
        `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" stroke="${GEO.hlB}" stroke-width="3" stroke-linecap="round"/>` +
        arcPathLabel(m);
    }
    gFill.innerHTML = fills;
    gParts.innerHTML = parts;
    gPts.innerHTML =
      dot(OX, OY, GEO.pt, 4) +
      ptLabel(OX, OY, "O", 0, 16) +
      dot(A.x, A.y, GEO.ink, 5.5) +
      ptLabel(A.x, A.y, "A", (A.x - OX) * 0.14, (A.y - OY) * 0.16 + 4) +
      `<g class="mcl-knob"><circle cx="${B.x.toFixed(1)}" cy="${B.y.toFixed(1)}" r="11" fill="#FFFFFF" stroke="#2F9E44" stroke-width="3"/><circle cx="${B.x.toFixed(1)}" cy="${B.y.toFixed(1)}" r="3.2" fill="#2F9E44"/></g>` +
      ptLabel(B.x, B.y, "B", (B.x - OX) * 0.2, (B.y - OY) * 0.22 + 4);
  }

  function arcPathLabel(m: { a0: number; a1: number; span: number }): string {
    const t = polar(OX, OY, 40, m.a0 + m.span / 2);
    return (
      `<path d="${arcPath(OX, OY, 24, m.a0, m.a1)}" stroke="${GEO.hlC}" stroke-width="2.4" fill="none"/>` +
      `<text x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.hlC}">${Math.round(m.span)}°</text>`
    );
  }

  /* ── 국면 1 → 현 긋기 ── */
  const chordBtn = el("button", { class: "mcl-btn", text: "현 긋기", attrs: { type: "button" } }) as HTMLButtonElement;
  chordBtn.style.display = "none";
  ctl.appendChild(chordBtn);
  chordBtn.addEventListener("click", () => {
    if (chordDrawn) return;
    chordDrawn = true;
    haptic(HAPTIC.correct);
    render();
    toast("원 위의 두 점을 곧게 이으면 현!");
    chips.on("arc", "호+현");
    inst.innerHTML = "굽은 <b>호</b>, 곧은 <b>현</b>. 둘의 차이가 보이죠?";
    lock = true;
    later(startPhase2, 1700);
  });

  /* ── 국면 2: 부채꼴 vs 활꼴 구분 탭 ── */
  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    chordBtn.style.display = "none";
    // 고정 배치: 부채꼴 POQ(오른쪽 위, 앰버 윤곽) + 활꼴 CD(왼쪽 아래, 시안 윤곽)
    const p0 = polar(OX, OY, R, 20);
    const p1 = polar(OX, OY, R, 80);
    const c0 = polar(OX, OY, R, 150);
    const c1 = polar(OX, OY, R, 250);
    gFill.innerHTML = "";
    gParts.innerHTML = "";
    gPts.innerHTML = dot(OX, OY, GEO.pt, 4) + ptLabel(OX, OY, "O", 0, 16);
    gDeco.innerHTML =
      // 부채꼴(영역 자체가 탭 대상)
      `<path class="mcl-tap" data-k="sector" d="M${OX} ${OY} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${R} ${R} 0 0 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${GEO.hlA}" opacity=".3" stroke="${GEO.hlA}" stroke-width="2"/>` +
      // 활꼴
      `<path class="mcl-tap" data-k="segment" d="M${c0.x.toFixed(1)} ${c0.y.toFixed(1)} A${R} ${R} 0 0 0 ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} Z" fill="${GEO.hlB}" opacity=".3" stroke="${GEO.hlB}" stroke-width="2"/>`;
    inst.innerHTML = "미션: 반지름 두 개와 호로 만든 <b>부채꼴</b>을 탭하세요";
    helper.innerHTML = "하나는 <b>반지름 2개+호</b>, 다른 하나는 <b>현+호</b>로 둘러싸였어요. 부채꼴은 어느 쪽?";
  }

  function onTapRegion(k: string): void {
    if (phase !== 2 || lock) return;
    if (!tappedSector) {
      if (k === "sector") {
        tappedSector = true;
        haptic(HAPTIC.correct);
        toast("정답! 중심 O에서 반지름 두 개가 뻗은 쪽이 부채꼴");
        inst.innerHTML = "좋아요! 이번엔 현과 호로 만든 <b>활꼴</b>을 탭하세요";
      } else {
        haptic(HAPTIC.cross);
        toast("그건 활꼴! 중심 O와 반지름 두 개가 있는 쪽을 찾아요.");
      }
    } else {
      if (k === "segment") {
        haptic(HAPTIC.correct);
        chips.on("sector", "구분 완료");
        toast("활 모양이라 활꼴! 현이 활시위예요.");
        lock = true;
        later(startPhase3, 1500);
      } else {
        haptic(HAPTIC.cross);
        toast("그건 아까 찾은 부채꼴! 현이 시위처럼 걸린 쪽이 활꼴이에요.");
      }
    }
  }

  /* ── 국면 3: 반원 미션 ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    lock = false;
    gDeco.innerHTML = "";
    chordDrawn = true;
    bDeg = 300;
    render();
    inst.innerHTML = "미션: B를 움직여 <b>부채꼴이면서 동시에 활꼴</b>인 모양을 만들어 보세요";
    helper.innerHTML = "부채꼴의 두 반지름이 <b>한 직선</b>이 되는 순간, 현과도 겹쳐요. 중심각을 얼마로?";
  }

  function judgeHalf(): void {
    const m = minorArc();
    if (Math.abs(m.span - 180) <= 6) {
      bDeg = normDeg(A_DEG + 180);
      render();
      haptic(HAPTIC.done);
      gDeco.innerHTML = `<text x="${OX}" y="${OY - 44}" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A31" class="mcl-pop">반원: 중심각 180°</text>`;
      inst.innerHTML = "<b>반원</b>! 두 반지름이 지름(가장 긴 현)이 되면서 부채꼴이자 활꼴이 됐어요";
      toast("중심각 180°, 유일한 두 얼굴의 도형!");
      chips.on("half", "180°");
      later(finish, 1200);
    } else {
      haptic(HAPTIC.cross);
      toast(m.span < 180 ? `지금 ${Math.round(m.span)}°, 더 벌려요!` : `지금 ${Math.round(m.span)}°, 조금 좁혀요!`);
    }
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "호·현·부채꼴·중심각·활꼴, 원의 부품 세트 완성! 이름표를 정식으로 달러 가요.";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터 ── */
  function pointerDeg(e: PointerEvent): number {
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    return angleOf(OX, OY, x, y);
  }

  svg.addEventListener("pointerdown", (e) => {
    if (lock || finished) return;
    const t = (e.target as Element).closest(".mcl-tap") as SVGPathElement | null;
    if (t && phase === 2) {
      haptic(HAPTIC.tap);
      onTapRegion(t.dataset.k || "");
      return;
    }
    if (phase === 2) return;
    capturePointer(svg, e.pointerId);
    dragging = true;
    const d = pointerDeg(e);
    moveAcc += Math.abs(normDeg(d - bDeg + 180) - 180);
    bDeg = d;
    render();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || lock || finished || phase === 2) return;
    const d = pointerDeg(e);
    moveAcc += Math.abs(normDeg(d - bDeg + 180) - 180);
    bDeg = d;
    render();
  });
  svg.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    if (phase === 1 && moveAcc > 40 && chordBtn.style.display === "none" && !chordDrawn) {
      chordBtn.style.display = "";
      chordBtn.classList.add("pulse");
      inst.innerHTML = "점 두 개가 원을 <b>두 동강</b> 냈어요. 이제 두 점을 곧게 이어 볼까요?";
      toast("굽은 조각 두 개가 모두 호!");
    }
    if (phase === 3 && !finished) judgeHalf();
  });
  svg.addEventListener("pointercancel", () => {
    dragging = false;
  });

  render();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
