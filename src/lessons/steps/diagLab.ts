// diagLab, 대각선 발견 랩(Ⅴ 평면도형 — 교과서 188쪽 다각형의 대각선의 개수).
// 국면 3개: 1 한 꼭짓점에서 긋기(이웃을 이으면 "그건 변!" 함정 포함, 5-3=2 발견) →
//   2 나머지 꼭짓점에서도 모두 긋기(대각선 5개 완성 → 별 등장, 훅 콜백) →
//   3 중복의 비밀(5×2=10인데 왜 5개? A→C와 C→A 연출 → n(n-3)/2 공식 카드).
// 조작: 꼭짓점 탭 두 번 = 선분 시도. 판정은 두 번째 탭에서(이웃=변 교정, 건너뛰면 대각선).
// 모션은 전부 CSS transition/keyframes + setTimeout 체인(타이머 Set 일괄 해제). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { GEO, polar, ptLabel, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DiagStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/* 무대 기하(SVG 좌표) — 정오각형 */
const W = 340;
const H = 268;
const CX = 170;
const CY = 138;
const R = 102;
const NAMES = ["A", "B", "C", "D", "E"];
/** 꼭짓점 좌표(A 위에서 반시계). */
const VTX = [90, 162, 234, 306, 18].map((a) => polar(CX, CY, R, a));

/** 정렬된 쌍 키("02" = A-C). */
const pairKey = (i: number, j: number): string => (i < j ? `${i}${j}` : `${j}${i}`);
/** 이웃 판정(오각형에서 |i-j|가 1 또는 4). */
const isAdj = (i: number, j: number): boolean => {
  const d = Math.abs(i - j);
  return d === 1 || d === 4;
};

export const diagLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DiagStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "one", label: "한 꼭짓점에서", sub: "0/2" },
    { id: "all", label: "모두 긋기", sub: "0/5" },
    { id: "half", label: "중복의 비밀", sub: "÷2" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "mdg-stage" });
  const edges = NAMES.map((_, i) => {
    const a = VTX[i];
    const b = VTX[(i + 1) % 5];
    return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mdg-diag"></g>` +
    `<g class="mdg-flash"></g>` +
    edges +
    `<g class="mdg-vtx">` +
    VTX.map(
      (v, i) =>
        `<g class="mdg-v" data-i="${i}">` +
        `<circle class="hit" cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="20" fill="transparent"/>` +
        `<circle class="face" cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="8" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.4"/>` +
        ptLabel(v.x + (v.x - CX) * 0.17, v.y + (v.y - CY) * 0.2, NAMES[i], 0, 4) +
        `</g>`,
    ).join("") +
    `</g></svg>`;

  const panel = el("div", { class: "mdg-panel" });
  const inst = el("div", { class: "mdg-inst", html: `꼭짓점 <b>A</b>를 탭하고, 이을 수 있는 다른 꼭짓점을 탭해 보세요` });
  const count = el("div", { class: "mdg-count" });
  const eqs = el("div", { class: "mdg-eqs" });
  panel.append(inst, count, eqs);

  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "오각형 마을에 새 다리를 놓아요. 단, <b>변(테두리)이 아닌 새 다리</b>만 인정! 어디와 어디를 이어야 할까요?",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gDiag = svg.querySelector(".mdg-diag") as SVGGElement;
  const gFlash = svg.querySelector(".mdg-flash") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  let sel = -1; // 선택된 꼭짓점(없으면 -1)
  let finished = false;
  let lock = false;
  const drawn = new Set<string>(); // 그어진 대각선 쌍 키
  const fromA = new Set<string>(); // 국면 1에서 A를 지나는 대각선

  function setSel(i: number): void {
    sel = i;
    svg.querySelectorAll(".mdg-v .face").forEach((c, idx) => {
      (c as SVGCircleElement).setAttribute("fill", idx === sel ? "#2F9E44" : "#FFFFFF");
      (c as SVGCircleElement).setAttribute("stroke", idx === sel ? "#1E7A31" : GEO.ink);
    });
  }

  function diagLine(i: number, j: number): string {
    const a = VTX[i];
    const b = VTX[j];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    return (
      `<line class="mdg-d" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"` +
      ` stroke="#2F9E44" stroke-width="3.4" stroke-linecap="round"` +
      ` stroke-dasharray="${len.toFixed(0)}" stroke-dashoffset="${len.toFixed(0)}" style="transition: stroke-dashoffset .5s ease-out"/>`
    );
  }

  function updateCount(): void {
    count.innerHTML = `그은 대각선: <b>${drawn.size}</b>개`;
  }

  /** 변을 탭한 함정 교정 — 해당 변을 붉게 깜빡. */
  function flashEdge(i: number, j: number): void {
    const a = VTX[i];
    const b = VTX[j];
    gFlash.innerHTML = `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${GEO.no}" stroke-width="5" stroke-linecap="round" opacity=".85" style="transition: opacity .8s"/>`;
    later(() => {
      const l = gFlash.firstElementChild as SVGLineElement | null;
      if (l) l.style.opacity = "0";
    }, 350);
    later(() => {
      gFlash.innerHTML = "";
    }, 1200);
  }

  function tryConnect(i: number, j: number): void {
    if (isAdj(i, j)) {
      haptic(HAPTIC.cross);
      flashEdge(i, j);
      toast(`${NAMES[Math.min(i, j)]}와 ${NAMES[Math.max(i, j)]}는 이웃, 그 길은 이미 있는 변이에요!`);
      setSel(-1);
      return;
    }
    const key = pairKey(i, j);
    if (drawn.has(key)) {
      toast("이미 놓은 다리예요. 다른 곳을 이어 봐요!");
      setSel(-1);
      return;
    }
    if (phase === 1 && i !== 0 && j !== 0) {
      toast("먼저 A에서 나가는 다리부터! A를 지나는 선을 그어 보세요.");
      setSel(-1);
      return;
    }
    // 대각선 성공
    drawn.add(key);
    gDiag.insertAdjacentHTML("beforeend", diagLine(i, j));
    later(() => {
      const lines = gDiag.querySelectorAll(".mdg-d");
      (lines[lines.length - 1] as SVGLineElement).style.strokeDashoffset = "0";
    }, 30);
    haptic(HAPTIC.correct);
    updateCount();
    setSel(-1);

    if (phase === 1) {
      fromA.add(key);
      chips.el.querySelector(`[data-g="one"] span`)!.textContent = `${fromA.size}/2`;
      if (fromA.size >= 2) {
        chips.on("one", "5−3=2개!");
        toast("A에서 그을 수 있는 다리는 딱 2개!");
        lock = true;
        later(() => {
          eqs.appendChild(
            el("div", {
              class: "mdg-eq pop",
              html: `A 자신과 <b>양옆 이웃 B·E</b>는 못 이어요. 그래서 5−3=<b>2</b>개!`,
            }),
          );
          later(startPhase2, 1500);
        }, 700);
      } else {
        toast("좋아요! A에서 하나 더 그을 수 있어요.");
      }
    } else if (phase === 2) {
      chips.el.querySelector(`[data-g="all"] span`)!.textContent = `${drawn.size}/5`;
      if (drawn.size >= 5) {
        chips.on("all", "5개 완성!");
        lock = true;
        // 별 콜백 연출 — 대각선 5개가 곧 별
        gDiag.querySelectorAll(".mdg-d").forEach((l) => {
          (l as SVGLineElement).style.transition = "stroke .6s, stroke-width .6s";
          (l as SVGLineElement).setAttribute("stroke", "#F2B430");
          (l as SVGLineElement).setAttribute("stroke-width", "4");
        });
        haptic(HAPTIC.done);
        toast("어라, 훅에서 그린 별이 나타났어요!");
        inst.innerHTML = "대각선 5개를 모두 그으니 <b>별</b>이 됐어요. 별의 정체가 바로 오각형의 대각선!";
        later(startPhase3, 1900);
      } else {
        toast(`다리 ${drawn.size}개째! 남은 꼭짓점도 이어 봐요.`);
      }
    }
  }

  /* ── 국면 2: 나머지도 모두 ── */
  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    clear(eqs);
    chips.el.querySelector(`[data-g="all"] span`)!.textContent = `${drawn.size}/5`;
    inst.innerHTML = `이제 <b>다른 꼭짓점들</b>에서도 이웃이 아닌 곳으로 모두 이어 보세요`;
    helper.innerHTML = "B, C, D, E에서도 다리를 놓아요. 전부 몇 개가 될까요?";
    updateCount();
  }

  /* ── 국면 3: 중복의 비밀 ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    inst.innerHTML = `그런데 이상해요. 꼭짓점 5개에서 <b>2개씩</b>이면 5×2=10개여야 하는데, 실제로는 <b>5개</b>?`;
    const btn = el("button", { class: "mdg-btn pulse", text: "비밀 보기", attrs: { type: "button" } }) as HTMLButtonElement;
    clear(eqs);
    eqs.appendChild(btn);
    helper.innerHTML = "10개를 예상했는데 5개만 나왔어요. 절반이 사라진 이유를 확인해 봐요!";
    btn.addEventListener("click", () => {
      btn.disabled = true;
      haptic(HAPTIC.tap);
      // A→C와 C→A가 같은 다리임을 연출: AC만 남기고 흐리게, 두 방향 라벨
      const A = VTX[0];
      const C = VTX[2];
      gDiag.querySelectorAll(".mdg-d").forEach((l) => ((l as SVGLineElement).style.opacity = ".18"));
      gFlash.innerHTML =
        `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${C.x.toFixed(1)}" y2="${C.y.toFixed(1)}" stroke="#2F9E44" stroke-width="4.4" stroke-linecap="round"/>` +
        `<text x="${((A.x + C.x) / 2 - 30).toFixed(1)}" y="${((A.y + C.y) / 2 - 10).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1E7A31">A→C</text>` +
        `<text x="${((A.x + C.x) / 2 + 30).toFixed(1)}" y="${((A.y + C.y) / 2 + 20).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1E7A31">C→A</text>`;
      clear(eqs);
      eqs.appendChild(
        el("div", { class: "mdg-eq pop", html: `A에서 그은 <b>A→C</b>와 C에서 그은 <b>C→A</b>, 알고 보니 <b>같은 다리 하나</b>!` }),
      );
      later(() => {
        eqs.appendChild(
          el("div", { class: "mdg-eq pop", html: `모든 다리를 <b>두 번씩 센 셈</b>이라 2로 나눠요: 5×2÷2=<b>5</b>개` }),
        );
      }, 1600);
      later(() => {
        haptic(HAPTIC.correct);
        eqs.appendChild(
          el("div", {
            class: "mdg-concl pop",
            html: `${mfmt("{n(n-3)/2}")} <span>n각형의 대각선 개수 공식이 완성됐어요!</span>`,
          }),
        );
        chips.on("half", "×2÷2");
        later(finish, 800);
      }, 3200);
    });
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "이웃 빼고(−3) 전부 잇고(×n) 반으로(÷2). 대각선 개수의 비밀, 완전 정복!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 꼭짓점 탭 ── */
  svg.addEventListener("pointerdown", (e) => {
    if (lock || finished || phase === 3) return;
    capturePointer(svg, e.pointerId);
    const t = (e.target as Element).closest(".mdg-v");
    if (!t) return;
    const i = Number((t as SVGGElement).dataset.i);
    haptic(HAPTIC.tap);
    if (sel === -1) {
      setSel(i);
      return;
    }
    if (sel === i) {
      setSel(-1);
      return;
    }
    tryConnect(sel, i);
  });

  updateCount();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
