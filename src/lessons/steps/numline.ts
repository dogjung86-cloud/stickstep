// numline, 수직선 랩(수학 · 정수와 유리수).
//   place: 수 카드(정수 2·분수·소수)를 0.5 스냅 프리뷰로 끌어/탭해 자리 찾기
//   abs  : 고정점 5개를 탭해 원점 거리 호(arc)를 그리며 절댓값 발견(|−3|=|+3|=3, |0|=0)
// 규율: rAF 금지(QA 프리즈), 모든 모션은 CSS 트랜지션 + 전역 키프레임(mansShake·svGlow) + setTimeout.
// setPointerCapture는 반드시 try/catch(합성 포인터에서 throw하면 리스너 전체가 죽는다).

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface NumlineStep {
  title: string;
  lead?: string;
  mode: "place" | "abs";
  cta?: string;
  curio?: Curio;
}

const Y = 86; // 수직선 y(뷰박스)
const X0 = 180; // 0의 x
const UNIT = 32; // 1당 뷰박스 px
const X = (v: number): number => X0 + v * UNIT;
/** 부호 표기(−는 U+2212). fs(-1.5)="−1.5", fs(0)="0". */
const fs = (v: number): string => (v === 0 ? "0" : `${v < 0 ? "−" : "+"}${Math.abs(v)}`);
const HALO = "paint-order:stroke;stroke:#fff;stroke-width:4px";

/** 공통 레일: 가로선 + 화살촉 + 정수 눈금(0은 크고 진하게) + 0.5 보조 눈금 + 라벨. */
function railSvg(): string {
  let g =
    `<line x1="12" y1="${Y}" x2="348" y2="${Y}" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M348 ${Y}l-7 -4.5M348 ${Y}l-7 4.5M12 ${Y}l7 -4.5M12 ${Y}l7 4.5" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  for (let h = -10; h <= 10; h++) {
    const x = X(h / 2);
    if (h % 2) {
      g += `<line x1="${x}" y1="${Y - 3.5}" x2="${x}" y2="${Y + 3.5}" stroke="#C2CBD6" stroke-width="1.2"/>`;
    } else {
      const zero = h === 0;
      g +=
        `<line x1="${x}" y1="${Y - (zero ? 10 : 6.5)}" x2="${x}" y2="${Y + (zero ? 10 : 6.5)}" stroke="${zero ? "#3D4A5C" : "#8A97A8"}" stroke-width="${zero ? 2.6 : 1.8}"/>` +
        `<text x="${x}" y="${Y + 26}" text-anchor="middle" font-size="${zero ? 12.5 : 11}" font-weight="${zero ? 800 : 700}" fill="${zero ? "#3D4A5C" : "#64748B"}">${fs(h / 2)}</text>`;
    }
  }
  return g;
}

export const numline: StepRenderer = (host, step, api) => {
  const s = step as unknown as NumlineStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips(
    s.mode === "place"
      ? [
          { id: "int", label: "정수", sub: "2개 놓기" },
          { id: "frac", label: "분수", sub: "자리 찾기" },
          { id: "dec", label: "소수", sub: "자리 찾기" },
        ]
      : [
          { id: "dist", label: "거리 재기", sub: "3칸 찾기" },
          { id: "pair", label: "짝 찾기", sub: "반대편" },
          { id: "zero", label: "|0|", sub: "얼마?" },
        ],
  );
  const board = mboard(260);
  const say = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (ms: number, fn: () => void): number => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  let finished = false;
  function maybeFinish(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /** 요소를 흔들거나(pop) 다시 재생, 전역 키프레임 재사용, 리플로로 재시작. */
  function replay(node: SVGElement | HTMLElement, anim: string): void {
    node.style.animation = "none";
    void node.getBoundingClientRect();
    node.style.animation = anim;
    later(760, () => {
      node.style.animation = "";
    });
  }

  api.setCTA("목표를 달성해 보세요", { enabled: false });

  /* ================================ place, 수 카드 놓기 ================================ */
  if (s.mode === "place") {
    const CARDS = [
      { src: "(-3)", v: -3, kind: "int", tag: "−3", hint: "−3은 0에서 왼쪽으로 3칸이에요" },
      { src: "(+2)", v: 2, kind: "int", tag: "+2", hint: "+2는 0에서 오른쪽으로 2칸이에요" },
      { src: "(-{3/2})", v: -1.5, kind: "frac", tag: "−3/2", hint: "−3/2 = −1.5, −1과 −2 사이예요" },
      { src: "(+2.5)", v: 2.5, kind: "dec", tag: "+2.5", hint: "+2.5는 +2와 +3 사이예요" },
    ] as const;
    const HELP = [
      `지금 카드는 ${mfmt("(-3)")}, 0에서 <b>왼쪽이 −, 오른쪽이 +</b> 방향이에요. 수직선을 탭하거나 끌어서 자리를 잡고, 손을 떼면 확인돼요.`,
      `이번엔 ${mfmt("(+2)")}, 어느 쪽으로 몇 칸일까요?`,
      `분수 차례! −3/2는 <b>−1과 −2 사이, −1.5 자리</b>예요. 반 칸 눈금을 써 보세요.`,
      `마지막은 소수 ${mfmt("(+2.5)")}, 반 칸 눈금이 또 나설 차례예요.`,
    ];
    const OK_MSG = [
      "딱 맞았어요, 0에서 왼쪽으로 3칸!",
      "정확해요, 오른쪽으로 2칸!",
      "−3/2 = −1.5, 분수도 수직선 위 한 점이에요!",
      "+2.5 완성, 소수도 한 점이에요!",
    ];

    const stage = el("div", {
      class: "nl-stage",
      style: "padding:14px 0 0",
      attrs: {
        tabindex: "0",
        role: "application",
        "aria-label": "수직선. 탭하거나 끌어 자리를 고르고 손을 떼면 확인해요. 키보드는 좌우 화살표로 반 칸씩 움직이고 엔터로 놓아요.",
      },
      html:
        `<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg">` +
        railSvg() +
        `<g data-nl="fx"></g>` +
        `<g data-nl="pv" style="opacity:0;transition:transform .1s linear,opacity .25s ease"><g data-nl="pvi">` +
        `<line x1="0" y1="${Y - 22}" x2="0" y2="${Y - 11}" stroke="var(--subj-num)" stroke-width="1.6" opacity=".7"/>` +
        `<circle cx="0" cy="${Y}" r="7.5" fill="var(--subj-num)" stroke="#fff" stroke-width="2.2"/>` +
        `<text data-nl="pvt" x="0" y="${Y - 28}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--subj-num-press)" style="${HALO}">0</text>` +
        `</g></g></svg>`,
    });
    const cardEls = CARDS.map((c) => el("div", { class: "nl-card", html: mfmt(c.src) }));
    const cardsBox = el("div", { class: "nl-cards" }, ...cardEls);
    board.append(stage, cardsBox);

    const svg = stage.querySelector("svg") as SVGSVGElement;
    const fxG = svg.querySelector('[data-nl="fx"]') as SVGGElement;
    const pv = svg.querySelector('[data-nl="pv"]') as SVGGElement;
    const pvi = svg.querySelector('[data-nl="pvi"]') as SVGGElement;
    const pvt = svg.querySelector('[data-nl="pvt"]') as SVGTextElement;

    let idx = 0;
    let curV = 0;
    let shown = false; // 프리뷰 표시 여부
    let done = false;
    let tracking = false;
    const placed: number[] = [];

    function refreshCards(): void {
      cardEls.forEach((c, i) => {
        c.classList.toggle("now", i === idx && !done);
        c.classList.toggle("done", i < idx);
      });
    }
    function evToVal(e: PointerEvent): number {
      const r = svg.getBoundingClientRect();
      const sx = ((e.clientX - r.left) / Math.max(1, r.width)) * 360;
      return clamp(Math.round(((sx - X0) / UNIT) * 2) / 2, -5, 5);
    }
    function showPreview(v: number, instant: boolean): void {
      curV = v;
      pvt.textContent = fs(v);
      if (instant) {
        pv.style.transition = "none";
        pv.style.transform = `translateX(${X(v)}px)`;
        void pv.getBoundingClientRect();
        pv.style.transition = "transform .1s linear, opacity .25s ease";
      } else {
        pv.style.transform = `translateX(${X(v)}px)`;
      }
      if (!shown) {
        shown = true;
        pv.style.opacity = "1";
      }
    }
    function hidePreview(): void {
      shown = false;
      pv.style.opacity = "0";
    }
    /** 정착 마커(초록). 이웃 라벨과 1 이내로 붙으면 위 단으로 올리고 점선 리더를 단다. */
    function addFixed(v: number, tag: string): void {
      const raise = placed.some((p) => p !== v && Math.abs(p - v) <= 1);
      const yl = raise ? 46 : 62;
      fxG.insertAdjacentHTML(
        "beforeend",
        `<g>` +
          (raise
            ? `<line x1="${X(v)}" y1="${yl + 5}" x2="${X(v)}" y2="${Y - 10}" stroke="var(--green)" stroke-width="1.2" stroke-dasharray="2 3" opacity=".55"/>`
            : "") +
          `<circle cx="${X(v)}" cy="${Y}" r="7" fill="var(--green)" stroke="#fff" stroke-width="2.2"/>` +
          `<text x="${X(v)}" y="${yl}" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--green)" style="${HALO}">${tag}</text>` +
          `</g>`,
      );
    }
    function judge(): void {
      if (done) return;
      const c = CARDS[idx];
      if (curV === c.v) {
        placed.push(c.v);
        addFixed(c.v, c.tag);
        hidePreview();
        haptic(HAPTIC.correct);
        say(OK_MSG[idx]);
        if (c.kind === "int" && idx === 1) chips.on("int", "완료!");
        if (c.kind === "frac") chips.on("frac", "완료!");
        if (c.kind === "dec") chips.on("dec", "완료!");
        idx++;
        if (idx >= CARDS.length) {
          done = true;
          helper.innerHTML =
            "정수·분수·소수 모두 <b>수직선 위 한 점</b>이에요. 오른쪽으로 갈수록 큰 수, 왼쪽으로 갈수록 작은 수예요.";
        } else {
          helper.innerHTML = HELP[idx];
        }
        refreshCards();
        maybeFinish();
      } else {
        const diff = c.v - curV;
        const side = diff > 0 ? "오른쪽" : "왼쪽";
        say(`${Math.abs(diff) <= 1 ? "조금 더" : "더"} ${side}이에요, ${c.hint}`);
        replay(pvi, "mansShake .38s");
        haptic(HAPTIC.wrong);
      }
    }

    const onDown = (e: PointerEvent): void => {
      if (done) return;
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 포인터, 캡처 없이 진행 */
      }
      tracking = true;
      showPreview(evToVal(e), !shown);
      haptic(HAPTIC.tap);
    };
    const onMove = (e: PointerEvent): void => {
      if (!tracking || done) return;
      showPreview(evToVal(e), false);
    };
    const onUp = (e: PointerEvent): void => {
      if (!tracking || done) return;
      tracking = false;
      showPreview(evToVal(e), false);
      judge();
    };
    const onKey = (e: KeyboardEvent): void => {
      if (done) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const d = e.key === "ArrowLeft" ? -0.5 : 0.5;
        showPreview(clamp((shown ? curV : 0) + d, -5, 5), !shown);
      } else if (e.key === "Enter" || e.key === " ") {
        if (!shown) return;
        e.preventDefault();
        judge();
      }
    };
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", () => {
      tracking = false;
    });
    stage.addEventListener("keydown", onKey);

    helper.innerHTML = HELP[0];
    refreshCards();
  } else {
    /* ================================ abs, 원점에서의 거리 ================================ */
    const POINTS = [-4, -3, 0, 1.5, 3];
    const stage = el("div", {
      class: "nl-stage",
      style: "padding:34px 0 22px",
      attrs: { role: "group", "aria-label": "수직선 위 다섯 점, 탭해서 원점과의 거리를 재요" },
      html:
        `<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg">` +
        railSvg() +
        `<text x="${X(1.5)}" y="${Y - 14}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#64748B">+1.5</text>` +
        `<g data-nl="arcs"></g><g data-nl="lbl"></g>` +
        POINTS.map(
          (v) =>
            `<g data-nl="pt" data-v="${v}" tabindex="0" role="button" aria-label="${fs(v)} 점" style="cursor:pointer;transform-box:fill-box;transform-origin:center">` +
            `<circle cx="${X(v)}" cy="${Y}" r="20" fill="#fff" opacity="0"/>` +
            `<circle data-nl="dot" cx="${X(v)}" cy="${Y}" r="7" fill="#fff" stroke="#64748B" stroke-width="2.2"/>` +
            `</g>`,
        ).join("") +
        `</svg>`,
    });
    board.appendChild(stage);
    const svg = stage.querySelector("svg") as SVGSVGElement;
    const arcsG = svg.querySelector('[data-nl="arcs"]') as SVGGElement;
    const lblG = svg.querySelector('[data-nl="lbl"]') as SVGGElement;

    let phase = 1; // 1 거리 3 찾기 → 2 반대쪽 짝 → 3 |0|
    let first = 0;
    let done = false;
    let uid = 0;

    function fadeText(x: number, y: number, txt: string, size: number, fill: string, delay: number): void {
      const id = `t${++uid}`;
      lblG.insertAdjacentHTML(
        "beforeend",
        `<text data-t="${id}" x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${fill}" style="opacity:0;transition:opacity .35s ease;${HALO}">${txt}</text>`,
      );
      const t = lblG.querySelector(`[data-t="${id}"]`) as SVGTextElement;
      later(delay, () => {
        t.style.opacity = "1";
      });
    }
    /** 0→v 거리 호, stroke-dashoffset 트랜지션으로 스르륵 그린다. */
    function drawArc(v: number): void {
      const x0 = X(0);
      const x1 = X(v);
      const peak = 78 - (14 + Math.abs(v) * 8);
      const midX = (x0 + x1) / 2;
      arcsG.insertAdjacentHTML(
        "beforeend",
        `<path data-a="${v}" d="M ${x0} 78 Q ${midX} ${peak} ${x1} 78" stroke="var(--subj-num)" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      );
      const p = arcsG.querySelector(`path[data-a="${v}"]`) as SVGPathElement;
      const L = p.getTotalLength();
      p.style.strokeDasharray = String(L);
      p.style.strokeDashoffset = String(L);
      void p.getBoundingClientRect();
      p.style.transition = "stroke-dashoffset .55s cubic-bezier(.22,1,.36,1)";
      p.style.strokeDashoffset = "0";
      fadeText(midX, 39 + peak / 2 - 7, `거리 ${Math.abs(v)}`, 12, "var(--subj-num-press)", 340);
    }
    function markFound(g: SVGGElement): void {
      const dot = g.querySelector('[data-nl="dot"]') as SVGCircleElement;
      dot.setAttribute("fill", "var(--green)");
      dot.setAttribute("stroke", "#fff");
      replay(g, "svGlow .7s var(--spring-bounce)");
    }
    function wrong(g: SVGGElement, msg: string): void {
      replay(g, "mansShake .35s");
      say(msg);
      haptic(HAPTIC.wrong);
    }
    function tapPoint(v: number, g: SVGGElement): void {
      if (done) return;
      haptic(HAPTIC.tap);
      if (phase === 1) {
        if (Math.abs(v) === 3) {
          first = v;
          phase = 2;
          markFound(g);
          drawArc(v);
          chips.on("dist", "거리 3!");
          helper.innerHTML = "같은 거리 3인 짝이 <b>하나 더</b> 있어요, 0의 반대쪽에서 찾아보세요.";
          say("0에서 3칸, 거리 3!");
          haptic(HAPTIC.correct);
        } else if (v === 0) {
          wrong(g, "0은 원점 그 자체, 거리가 0이에요. 거리 3인 점을 찾아요");
        } else {
          wrong(g, `${fs(v)}는 원점에서 거리가 ${Math.abs(v)}예요, 3이 아니에요`);
        }
      } else if (phase === 2) {
        if (v === -first) {
          phase = 3;
          markFound(g);
          drawArc(v);
          fadeText(180, 27, "|−3| = |+3| = 3", 14.5, "var(--subj-num-press)", 480);
          chips.on("pair", "대칭!");
          helper.innerHTML = "그럼 <b>0의 절댓값</b>은 얼마일까요? 원점 0을 탭해 보세요.";
          say("반대쪽도 3칸, 부호는 달라도 거리는 같아요!");
          haptic(HAPTIC.correct);
        } else if (v === first) {
          wrong(g, "그 점은 이미 쟀어요, 0의 반대쪽에서 짝을 찾아요");
        } else if (v === 0) {
          wrong(g, "0은 거리가 0이에요, 거리 3인 짝을 찾아요");
        } else {
          wrong(g, `${fs(v)}는 거리가 ${Math.abs(v)}예요, 3이 아니에요`);
        }
      } else {
        if (v === 0) {
          done = true;
          markFound(g);
          fadeText(180, 68, "|0| = 0", 12.5, "var(--green)", 120);
          chips.on("zero", "0!");
          helper.innerHTML =
            "절댓값은 <b>원점 0에서 그 수까지의 거리</b>예요. 방향(부호)은 버리고 거리만 봐요, 그래서 |−3| = |+3| = 3이고, |0| = 0이에요.";
          say("거리 0, |0| = 0이에요!");
          haptic(HAPTIC.correct);
          maybeFinish();
        } else {
          wrong(g, "0의 절댓값을 묻고 있어요, 원점 0을 탭!");
        }
      }
    }

    svg.querySelectorAll('[data-nl="pt"]').forEach((node) => {
      const g = node as SVGGElement;
      const v = Number(g.dataset.v);
      g.addEventListener("click", () => tapPoint(v, g));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          tapPoint(v, g);
        }
      });
    });

    helper.innerHTML = "원점 0에서 <b>거리가 3</b>인 점을 찾아 탭해 보세요. 점은 모두 다섯 개예요.";
  }

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers.clear();
  };
};
