// paraSpinLab, 반 바퀴 회전 실험실(중2 수학 Ⅳ L6 기함, 책 164~166쪽). 평행사변형의 사본을
// 대각선의 교점 O 중심으로 직접 드래그 회전 → 180°에서 자기 자신과 딱 포개짐을 발견.
// ① 스핀: 사본을 반 바퀴 돌려 스냅 ② 수집: 포개짐에서 성질 3개를 카드로 캐냄
//   (AB→CD 대변 / ∠A→∠C 대각 / OA→OC 대각선 이등분 — 회전 대응이 곧 성질의 직관)
// ③ 변형: 꼭짓점 A를 끌어 모양을 바꿔도(D는 평행사변형 유지로 자동 계산) 반 바퀴 포개짐은 그대로.
// '대변·대각' 정식 명명과 ▱ 기호는 다음 concept 몫 — 랩은 "마주 보는 변/각"으로 부른다.
// 회전각 관례: CSS rotate(+)=시계 방향, angleOf(수학 각)=반시계 + → delta에 부호 반전을 넣는다.
// rAF 금지(스냅·재회전은 CSS 트랜지션). capturePointer. 스타일: math2.css .psl-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { angleArc, dot, ptLabel, tickMark, angleOf, normDeg, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Pt = { x: number; y: number };

const VB_W = 340;
const VB_H = 258;

export const paraSpinLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "spin", label: "반 바퀴", sub: "사본을 돌려요" },
    { id: "collect", label: "성질 수집", sub: "잠김" },
    { id: "vary", label: "모양 바꿔도", sub: "잠김" },
  ]);

  const board = mboard(560);
  const dial = el("div", { class: "psl-dial", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="psl-base"></g><g class="psl-marks"></g><g class="psl-ghost"></g><g class="psl-handle"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(dial, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "주황 <b>사본</b>을 끌어서 빙글 돌려 보세요. 회전의 중심은 두 대각선이 만나는 점 <b>O</b>, 목표는 <b>반 바퀴(180°)</b>!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gBase = svg.querySelector(".psl-base") as SVGGElement;
  const gMarks = svg.querySelector(".psl-marks") as SVGGElement;
  const gGhost = svg.querySelector(".psl-ghost") as SVGGElement;
  const gHandle = svg.querySelector(".psl-handle") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* 평행사변형: B·C 고정, A 가변, D = A + (C − B). O = 대각선 교점(=AC 중점=BD 중점). */
  let A: Pt = { x: 104, y: 86 };
  const B: Pt = { x: 66, y: 192 };
  const C: Pt = { x: 244, y: 192 };
  const dPt = (): Pt => ({ x: A.x + (C.x - B.x), y: A.y + (C.y - B.y) });
  const oPt = (): Pt => ({ x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 });

  let phase: "spin" | "collect" | "vary" | "respin" | "done" = "spin";
  let theta = 0; // 사본 회전각(도, CSS 시계 방향 +)
  let spinning = false;
  let startPtr = 0;
  let startTheta = 0;
  let reshaping = false;
  let moved = 0; // vary 국면 누적 이동량
  let respinOffered = false;
  const collected = new Set<string>();

  const quadPath = (): string => {
    const d = dPt();
    return `M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x} ${B.y} L${C.x} ${C.y} L${d.x.toFixed(1)} ${d.y.toFixed(1)} Z`;
  };

  function paintBase(): void {
    const d = dPt();
    const o = oPt();
    gBase.innerHTML =
      `<path d="${quadPath()}" fill="#D9E9F9" stroke="#12579B" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<line x1="${A.x}" y1="${A.y}" x2="${C.x}" y2="${C.y}" stroke="#8FB6DC" stroke-width="1.6" stroke-dasharray="5 4"/>` +
      `<line x1="${B.x}" y1="${B.y}" x2="${d.x}" y2="${d.y}" stroke="#8FB6DC" stroke-width="1.6" stroke-dasharray="5 4"/>` +
      dot(o.x, o.y, "#12579B", 3.6) + ptLabel(o.x, o.y, "O", 12, -5) +
      dot(A.x, A.y, "#12579B") + dot(B.x, B.y, "#12579B") + dot(C.x, C.y, "#12579B") + dot(d.x, d.y, "#12579B") +
      ptLabel(A.x, A.y, "A", -10, -8) + ptLabel(B.x, B.y, "B", -11, 15) +
      ptLabel(C.x, C.y, "C", 11, 15) + ptLabel(d.x, d.y, "D", 11, -8);
  }

  function paintGhost(withTransition = false): void {
    if (phase === "vary") {
      gGhost.innerHTML = "";
      return;
    }
    const o = oPt();
    gGhost.innerHTML =
      `<g class="psl-gG" style="transform-box: view-box; transform-origin:${o.x.toFixed(1)}px ${o.y.toFixed(1)}px; ` +
      `transform: rotate(${theta}deg);${withTransition ? " transition: transform 1.1s var(--ease, cubic-bezier(.22,1,.36,1));" : ""} cursor:grab">` +
      `<path d="${quadPath()}" fill="rgba(232,169,62,.3)" stroke="#E8A93E" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<circle cx="${A.x}" cy="${A.y}" r="5" fill="#E8A93E" stroke="#9C5A10" stroke-width="1.4"/>` +
      `</g>`;
  }

  function setGhostAngle(): void {
    const g = gGhost.querySelector(".psl-gG") as SVGGElement | null;
    if (g) g.style.transform = `rotate(${theta}deg)`;
  }

  function paintDial(): void {
    if (phase === "collect" || phase === "done") {
      dial.innerHTML = `<span class="psl-deg hit">회전 <b>180°</b></span><span class="psl-goal">포개짐 유지 중</span>`;
      return;
    }
    if (phase === "vary") {
      dial.innerHTML = `<span class="psl-deg">모양 바꾸는 중</span><span class="psl-goal">A를 끌어요</span>`;
      return;
    }
    dial.innerHTML =
      `<span class="psl-deg${Math.round(theta) === 180 ? " hit" : ""}">회전 <b>${Math.round(theta)}°</b></span>` +
      `<span class="psl-goal">목표 180°</span>`;
  }

  function paintHandle(): void {
    if (phase !== "vary") {
      gHandle.innerHTML = "";
      return;
    }
    gHandle.innerHTML =
      `<g style="cursor:grab">` +
      `<circle cx="${A.x}" cy="${A.y}" r="15" fill="rgba(25,113,194,.14)"/>` +
      `<circle cx="${A.x}" cy="${A.y}" r="7" fill="#FFFFFF" stroke="#1971C2" stroke-width="2.8"/>` +
      `</g>`;
  }

  /* ── 국면 1 → 2: 스냅 후 성질 수집 ── */
  function onSpun(): void {
    phase = "collect";
    paintDial();
    haptic(HAPTIC.correct);
    chips.on("spin", "딱 포개짐!");
    toast("반 바퀴를 돌렸더니 자기 자신과 완전히 포개져요!");
    helper.innerHTML =
      "카드처럼 <b>포개졌어요!</b> 이 한 가지 사실에 성질 세 개가 숨어 있어요. 아래 카드를 <b>전부</b> 탭해 캐내 보세요.";
    later(askCollect, 800);
  }

  function arcAt(p: Pt, p1: Pt, p2: Pt, color: string): string {
    const a1 = angleOf(p.x, p.y, p1.x, p1.y);
    const a2 = angleOf(p.x, p.y, p2.x, p2.y);
    const span = normDeg(a2 - a1);
    return span <= 180
      ? angleArc(p.x, p.y, 18, a1, a2, color, "", { width: 2.8 })
      : angleArc(p.x, p.y, 18, a2, a1, color, "", { width: 2.8 });
  }

  function askCollect(): void {
    qline.innerHTML = "반 바퀴 회전에서 <b>무엇이 어디로</b> 갔을까요? (카드 3장 전부 탭)";
    const d = dPt();
    const o = oPt();
    const cards = [
      {
        id: "side",
        label: "변 AB는 어디로 갔을까?",
        fb: "AB는 정확히 CD 자리에! 회전은 길이를 안 바꾸니 AB=CD, 같은 이유로 AD=BC. 마주 보는 변의 길이가 각각 같아요.",
        mark: (): string =>
          tickMark(A.x, A.y, B.x, B.y, 1, "#C2255C") + tickMark(C.x, C.y, d.x, d.y, 1, "#C2255C") +
          tickMark(A.x, A.y, d.x, d.y, 2, "#0DA5C6") + tickMark(B.x, B.y, C.x, C.y, 2, "#0DA5C6"),
      },
      {
        id: "angle",
        label: "각 A는 어디로 갔을까?",
        fb: "∠A는 ∠C 자리로, ∠B는 ∠D 자리로! 회전은 각도도 안 바꾸니 마주 보는 각의 크기가 각각 같아요.",
        mark: (): string =>
          arcAt(A, B, d, "#E8A93E") + arcAt(C, d, B, "#E8A93E") +
          arcAt(B, C, A, "#B36CCB") + arcAt(d, A, C, "#B36CCB"),
      },
      {
        id: "diag",
        label: "선분 OA는 어디로 갔을까?",
        fb: "O가 회전의 중심이니 OA는 OC 자리로, OB는 OD 자리로! 두 대각선은 O에서 서로를 반씩 나눠요(서로를 이등분).",
        mark: (): string =>
          tickMark(o.x, o.y, A.x, A.y, 1, "#7A9A1E") + tickMark(o.x, o.y, C.x, C.y, 1, "#7A9A1E") +
          tickMark(o.x, o.y, B.x, B.y, 3, "#1971C2") + tickMark(o.x, o.y, d.x, d.y, 3, "#1971C2"),
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    for (const cd of cards) {
      const bt = el("button", { class: "mq6-choice wide", text: cd.label, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (bt.disabled) return;
        bt.disabled = true;
        bt.classList.add("ok");
        haptic(HAPTIC.correct);
        gMarks.innerHTML += cd.mark();
        toast(cd.fb);
        collected.add(cd.id);
        if (collected.size === 3) {
          later(() => {
            qline.innerHTML = "";
            clear(ctl);
            chips.on("collect", "성질 3개!");
            haptic(HAPTIC.done);
            startVary();
          }, 2600);
        }
      });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 3: 모양 바꿔도 성립 ── */
  function startVary(): void {
    phase = "vary";
    gMarks.innerHTML = "";
    paintGhost();
    paintDial();
    paintHandle();
    helper.innerHTML =
      "혹시 이 모양에서만 그런 건 아닐까요? 꼭짓점 <b>A</b>(파란 손잡이)를 끌어 <b>납작하게든 길쭉하게든</b> 바꿔 보세요!";
  }

  function offerRespin(): void {
    if (respinOffered) return;
    respinOffered = true;
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "다시 반 바퀴 돌리기" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      phase = "respin";
      theta = 0;
      paintGhost(false);
      paintDial();
      // 강제 리플로우 뒤 트랜지션 회전(rAF 없이)
      later(() => {
        const g = gGhost.querySelector(".psl-gG") as SVGGElement;
        g.style.transition = "transform 1.1s var(--ease, cubic-bezier(.22,1,.36,1))";
        theta = 180;
        setGhostAngle();
      }, 60);
      later(() => {
        paintDial();
        haptic(HAPTIC.done);
        toast("새 모양도 반 바퀴에 딱! 어떤 평행사변형이든 통해요.");
        phase = "done";
        chips.on("vary", "언제나 포개짐");
        helper.innerHTML =
          "마주 보는 변끼리 같고, 마주 보는 각끼리 같고, 대각선은 서로를 반씩. <b>반 바퀴의 마법</b>에서 나온 세 성질에 정식 이름을 붙이러 가요!";
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "이름 붙이러 가기");
      }, 1350);
    });
    clear(actions);
    actions.appendChild(b);
    later(() => b.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 포인터 ── */
  function toLocal(e: PointerEvent): Pt {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VB_W,
      y: ((e.clientY - rect.top) / rect.height) * VB_H,
    };
  }

  svg.addEventListener("pointerdown", (e) => {
    const p = toLocal(e);
    if (phase === "spin") {
      spinning = true;
      const o = oPt();
      startPtr = angleOf(o.x, o.y, p.x, p.y);
      startTheta = theta;
      capturePointer(svg, e.pointerId);
    } else if (phase === "vary") {
      if (Math.hypot(p.x - A.x, p.y - A.y) < 30) {
        reshaping = true;
        capturePointer(svg, e.pointerId);
      }
    }
  });

  svg.addEventListener("pointermove", (e) => {
    const p = toLocal(e);
    if (phase === "spin" && spinning) {
      const o = oPt();
      const cur = angleOf(o.x, o.y, p.x, p.y);
      // 수학 각(반시계 +) → CSS 회전(시계 +) 부호 반전
      theta = normDeg(startTheta + (startPtr - cur));
      if (Math.abs(theta - 180) < 8) {
        theta = 180;
        setGhostAngle();
        paintDial();
        spinning = false;
        onSpun();
        return;
      }
      setGhostAngle();
      paintDial();
    } else if (phase === "vary" && reshaping) {
      const prev = { ...A };
      A = {
        x: Math.max(74, Math.min(152, p.x)),
        y: Math.max(56, Math.min(132, p.y)),
      };
      moved += Math.hypot(A.x - prev.x, A.y - prev.y);
      paintBase();
      paintHandle();
      if (moved > 46 && !respinOffered) {
        helper.innerHTML = "좋아요, 완전히 다른 평행사변형이 됐어요. 이 모양도 반 바퀴에 포개질까요?";
        offerRespin();
      }
    }
  });

  const drop = (): void => {
    spinning = false;
    reshaping = false;
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintBase();
  paintGhost();
  paintDial();
  api.setCTA("모양을 바꿔 다시 포개면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
