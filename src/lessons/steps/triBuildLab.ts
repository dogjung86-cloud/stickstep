// triBuildLab, "되는 삼각형, 하나뿐인 삼각형"(Ⅳ L11 — 교과서 169~172쪽).
// 2국면 자동 진행:
//   1 빨대 삼각형 공장 — 세 변 스테퍼 + 컴퍼스 원호 작도로 삼각형 부등식 발견
//     (초기 6·8·14는 딱 붙는 실패 조합 — 수치는 교과서와 다르게 자체 제작. 성공 1회+서로 다른 실패 2회면 규칙 배지)
//   2 설계도 3장 — SSS·SAS·ASA 프리셋 작도 애니 + 반례(끼인각이 아니면 삼각형 2개)
// 모션은 전부 CSS transition/keyframes + setTimeout 체인(rAF 금지),
// 원호·선분 성장은 stroke-dashoffset 트랜지션. 타이머는 Set으로 모아 cleanup에서 해제.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, arcPath, angleArc, tickMark } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TriBuildStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/* 국면 1 무대 상수: 340×230, 1cm=14px, 밑변 y=188, 중심 x=170 */
const W1 = 340;
const H1 = 230;
const PX = 14; // 1cm
const BASE_Y = 188;
const MID_X = 170;

/* 변 색(카드·원호·완성 변이 같은 색을 공유한다) */
const C_A = GEO.hlA; // 밑변 a 앰버
const C_B = GEO.hlB; // 원호 b(오른쪽 C에서) 시안
const C_C = GEO.hlC; // 원호 c(왼쪽 B에서) 로즈

/* 국면 2 무대 상수: 340×240, 1cm=12px, 기준 삼각형 a=11·b=9·c=8(∠B≈54°·∠C≈46°) */
const W2 = 340;
const H2 = 240;
const P2 = 12;
const B2 = { x: 104, y: 150 };
const C2 = { x: 236, y: 150 };
const A2 = { x: 160.7, y: 72.6 };
const A2G = { x: 160.7, y: 227.4 }; // 원호 아래쪽 교점(고스트)
const ANG_B = 53.8;
const ANG_C = 45.8;

type Mode = "sss" | "sas" | "asa";

export const triBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TriBuildStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "fail", label: "안 되는 삼각형", sub: "6·8·14" },
    { id: "rule", label: "되는 규칙", sub: "긴 변<합" },
    { id: "unique", label: "하나로 정해짐", sub: "설계도 3장" },
  ]);

  const board = mboard(430);
  const wrap = el("div", { class: "mtb-wrap" });
  board.appendChild(wrap);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "빨대 세 개로 삼각형을 만들어요. 먼저 지금 조합 <b>6·8·14</b> 그대로 <b>만들어 보기</b>를 눌러 보세요!",
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

  /** 선·호를 자라나게 하는 dashoffset 트랜지션. fromEnd면 경로 끝에서부터 나타난다. */
  function grow(p: SVGPathElement | SVGLineElement, dur: number, delay = 0, fromEnd = false): void {
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L}`;
    p.style.strokeDashoffset = `${fromEnd ? -L : L}`;
    p.getBoundingClientRect(); // reflow로 시작 상태 확정
    p.style.transition = `stroke-dashoffset ${dur}ms ease ${delay}ms`;
    p.style.strokeDashoffset = "0";
  }

  /* ============================== 국면 1: 빨대 삼각형 공장 ============================== */

  let a = 14;
  let b = 6;
  let c = 8;
  let locking = false;
  let succCount = 0;
  const failCombos = new Set<string>();
  let ruleShown = false;
  let finished = false;

  const stage = el("div", { class: "mtb-stage" });
  const panel = el("div", { class: "mtb-panel" });
  const sidesRow = el("div", { class: "mtb-sides" });
  const actions = el("div", { class: "mtb-actions" });
  wrap.append(stage, panel, sidesRow, actions);

  stage.innerHTML =
    `<svg viewBox="0 0 ${W1} ${H1}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="tb-base"></g><g class="tb-arcs"></g><g class="tb-out"></g></svg>`;
  let gBase = stage.querySelector(".tb-base") as SVGGElement;
  let gArcs = stage.querySelector(".tb-arcs") as SVGGElement;
  let gOut = stage.querySelector(".tb-out") as SVGGElement;

  function sideCard(key: "a" | "b" | "c", color: string, init: number): HTMLElement {
    const card = el("div", { class: `mtb-side s${key}` });
    const head = el("div", { class: "mtb-shead", html: `<i style="color:${color}">${key}</i>` });
    const val = el("div", { class: "mtb-val", text: `${init}cm` });
    const stepRow = el("div", { class: "mtb-step" });
    const mk = (d: number, label: string): HTMLButtonElement => {
      const btn = el("button", {
        class: "mtb-sbtn",
        text: d < 0 ? "−" : "+",
        attrs: { type: "button", "aria-label": label },
      }) as HTMLButtonElement;
      btn.addEventListener("click", () => {
        if (locking) return;
        const cur = key === "a" ? a : key === "b" ? b : c;
        const next = Math.max(3, Math.min(18, cur + d));
        if (next === cur) return;
        if (key === "a") a = next;
        else if (key === "b") b = next;
        else c = next;
        haptic(HAPTIC.tap);
        val.textContent = `${next}cm`;
        paintPreview();
      });
      return btn;
    };
    stepRow.append(mk(-1, `${key} 줄이기`), mk(1, `${key} 늘리기`));
    card.append(head, val, stepRow);
    return card;
  }

  sidesRow.append(sideCard("a", C_A, a), sideCard("b", C_B, b), sideCard("c", C_C, c));

  const buildBtn = el("button", {
    class: "mtb-build",
    text: "만들어 보기",
    attrs: { type: "button" },
  }) as HTMLButtonElement;
  actions.appendChild(buildBtn);

  /** 가장 긴 변과 나머지 둘(나머지는 이름 알파벳순). */
  function longest(): { name: string; v: number; o1: string; o1v: number; o2: string; o2v: number; sum: number } {
    const m: [string, number][] = [
      ["a", a],
      ["b", b],
      ["c", c],
    ];
    m.sort((p, q) => q[1] - p[1]);
    const others = [m[1], m[2]].sort((p, q) => (p[0] < q[0] ? -1 : 1));
    return {
      name: m[0][0],
      v: m[0][1],
      o1: others[0][0],
      o1v: others[0][1],
      o2: others[1][0],
      o2v: others[1][1],
      sum: m[1][1] + m[2][1],
    };
  }

  function paintPreview(): void {
    const L = longest();
    const rel = L.sum > L.v ? ">" : L.sum === L.v ? "=" : "<";
    const word = rel === ">" ? "삼각형 가능!" : rel === "=" ? "딱 붙음!" : "못 닿음!";
    const cls = rel === ">" ? "ok" : rel === "=" ? "eq" : "no";
    panel.innerHTML =
      `<span class="mtb-k">판정</span>` +
      `${mfmt(`${L.o1}+${L.o2}=${L.sum}`)}<span class="mtb-sep">,</span> ${mfmt(`${L.name}=${L.v}`)}` +
      ` <span class="mtb-verdict ${cls}">→ ${word}</span>`;
  }

  /** 국면 1 작도 실행. */
  function build(): void {
    if (locking || ruleShown) return;
    locking = true;
    buildBtn.disabled = true;
    haptic(HAPTIC.tap);

    gBase.innerHTML = "";
    gArcs.innerHTML = "";
    gOut.innerHTML = "";

    const bx = MID_X - (a * PX) / 2; // B(왼쪽)
    const cx = MID_X + (a * PX) / 2; // C(오른쪽)

    // 1) 밑변이 깔린다
    gBase.innerHTML =
      `<line class="tb-seg" x1="${bx}" y1="${BASE_Y}" x2="${cx}" y2="${BASE_Y}" stroke="${C_A}" stroke-width="4" stroke-linecap="round"/>` +
      `<circle cx="${bx}" cy="${BASE_Y}" r="4.5" fill="${GEO.ink}"/>` +
      `<circle cx="${cx}" cy="${BASE_Y}" r="4.5" fill="${GEO.ink}"/>` +
      `<text x="${bx - 2}" y="${BASE_Y + 18}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GEO.ink}">B</text>` +
      `<text x="${cx + 2}" y="${BASE_Y + 18}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GEO.ink}">C</text>` +
      `<text x="${MID_X}" y="${BASE_Y + 18}" text-anchor="middle" font-size="11" font-weight="800" fill="${C_A}"><tspan font-style="italic">a</tspan>=${a}cm</text>`;
    grow(gBase.querySelector(".tb-seg") as SVGLineElement, 320);

    // 2) 두 원호가 자란다: B에서 반지름 c, C에서 반지름 b (−10°~190° 넓은 스윙)
    later(() => {
      gArcs.innerHTML =
        `<path class="tb-arc-b" d="${arcPath(cx, BASE_Y, b * PX, -10, 190)}" stroke="${C_B}" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path class="tb-arc-c" d="${arcPath(bx, BASE_Y, c * PX, -10, 190)}" stroke="${C_C}" stroke-width="2.6" stroke-linecap="round"/>`;
      const lb = polar(cx, BASE_Y, b * PX + 11, 150);
      const lc = polar(bx, BASE_Y, c * PX + 11, 30);
      gArcs.innerHTML +=
        `<text x="${lb.x.toFixed(1)}" y="${lb.y.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" font-style="italic" fill="${C_B}">b</text>` +
        `<text x="${lc.x.toFixed(1)}" y="${lc.y.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" font-style="italic" fill="${C_C}">c</text>`;
      grow(gArcs.querySelector(".tb-arc-c") as SVGPathElement, 620); // B의 원호: 시작(−10°)부터
      grow(gArcs.querySelector(".tb-arc-b") as SVGPathElement, 620, 0, true); // C의 원호: 끝(190°)부터
    }, 380);

    // 3) 판정
    later(() => verdict(bx, cx), 1120);
  }

  function verdict(bx: number, cx: number): void {
    const L = longest();
    const key = `${a},${b},${c}`;
    if (L.sum > L.v) {
      // 성공: 원호 교차점에 A 팟!
      const dx = (a * a + c * c - b * b) / (2 * a); // B로부터 cm
      const dy = Math.sqrt(Math.max(0, c * c - dx * dx));
      const ax = bx + dx * PX;
      const ay = BASE_Y - dy * PX;
      gOut.innerHTML =
        `<polygon class="tb-fill" points="${bx},${BASE_Y} ${cx},${BASE_Y} ${ax.toFixed(1)},${ay.toFixed(1)}" fill="${C_A}" opacity="0"/>` +
        `<line class="tb-sc" x1="${bx}" y1="${BASE_Y}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="${C_C}" stroke-width="4" stroke-linecap="round"/>` +
        `<line class="tb-sb" x1="${cx}" y1="${BASE_Y}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="${C_B}" stroke-width="4" stroke-linecap="round"/>` +
        `<g class="tb-apex mtb-pop"><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="6" fill="${GEO.ink}"/>` +
        `<text x="${ax.toFixed(1)}" y="${(ay - 11).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GEO.ink}">A</text></g>`;
      grow(gOut.querySelector(".tb-sc") as SVGLineElement, 300);
      grow(gOut.querySelector(".tb-sb") as SVGLineElement, 300, 0, true);
      later(() => {
        const f = gOut.querySelector(".tb-fill") as SVGPolygonElement;
        f.style.transition = "opacity .4s";
        f.style.opacity = "0.12";
      }, 300);
      succCount += 1;
      haptic(HAPTIC.correct);
      toast("삼각형 완성! 두 원호가 한 점에서 딱 만났어요.");
    } else {
      // 실패: 딱 붙거나 못 닿음
      failCombos.add(key);
      haptic(HAPTIC.cross);
      if (L.sum === L.v) {
        // 납작: 원호가 한 점에서 겨우 닿는다
        const px = L.name === "a" ? bx + c * PX : L.name === "b" ? bx - c * PX : cx + b * PX;
        gOut.innerHTML =
          `<line x1="${bx}" y1="${BASE_Y - 3}" x2="${px}" y2="${BASE_Y - 3}" stroke="${C_C}" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>` +
          `<line x1="${cx}" y1="${BASE_Y - 3}" x2="${px}" y2="${BASE_Y - 3}" stroke="${C_B}" stroke-width="3.4" stroke-linecap="round" opacity=".55"/>` +
          `<circle class="mtb-pulse" cx="${px}" cy="${BASE_Y - 3}" r="8" fill="none" stroke="${GEO.no}" stroke-width="2.4"/>`;
        toast(`${L.v}=${L.o1v}+${L.o2v}, 딱 붙어서 납작해요. 삼각형이 안 돼요!`);
      } else if (L.name === "a") {
        // 밑변이 너무 길다: 원호 끝 사이 벌어진 틈
        const x1 = bx + c * PX;
        const x2 = cx - b * PX;
        gOut.innerHTML =
          `<circle cx="${x1}" cy="${BASE_Y}" r="4" fill="${C_C}"/>` +
          `<circle cx="${x2}" cy="${BASE_Y}" r="4" fill="${C_B}"/>` +
          `<line class="mtb-pulse" x1="${x1 + 6}" y1="${BASE_Y}" x2="${x2 - 6}" y2="${BASE_Y}" stroke="${GEO.no}" stroke-width="2.6" stroke-dasharray="5 5"/>` +
          `<text x="${(x1 + x2) / 2}" y="${BASE_Y - 12}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.no}">틈!</text>`;
        toast("두 빨대를 합쳐도 밑변에 못 미쳐요!");
      } else {
        // b 또는 c가 너무 길다: 긴 원호가 나머지를 통째로 삼킨다
        const longArc = gArcs.querySelector(L.name === "b" ? ".tb-arc-b" : ".tb-arc-c") as SVGPathElement;
        longArc.classList.add("mtb-pulse");
        toast(`빨대 ${L.name}가 너무 길어요. 나머지 둘을 합쳐도 못 미쳐요!`);
      }
      if (chips.on("fail", "경험!")) {
        helper.innerHTML = "안 되는 삼각형을 직접 봤어요! 이제 <b>값을 바꿔서</b> 되는 조합도, 또 다른 안 되는 조합도 찾아보세요.";
      }
    }

    // 규칙 발견 판정: 성공 1회 이상 + 서로 다른 실패 2회 이상
    if (!ruleShown && succCount >= 1 && failCombos.size >= 2) {
      ruleShown = true;
      later(() => {
        const badge = el("div", {
          class: "mtb-rule",
          html: "규칙 발견! <b>(가장 긴 변) &lt; (나머지 두 변의 합)</b> 일 때만 삼각형이 돼요",
        });
        wrap.insertBefore(badge, sidesRow);
        chips.on("rule", "발견!");
        toast("이게 삼각형이 되는 단 하나의 규칙이에요!");
        later(() => toPhase2(), 2400);
      }, 1400);
    } else {
      later(() => {
        locking = false;
        buildBtn.disabled = false;
      }, 500);
    }
  }

  buildBtn.addEventListener("click", build);
  paintPreview();

  /* ============================== 국면 2: 설계도 3장 ============================== */

  const played = new Set<Mode>();
  let mode: Mode = "sss";
  let badge3Shown = false;
  let modeBtns: Record<Mode, HTMLButtonElement>;
  let drawBtn: HTMLButtonElement;
  let counterBtn: HTMLButtonElement;
  let panelRef: HTMLElement;

  function toPhase2(): void {
    wrap.classList.add("out");
    later(() => {
      clear(wrap);
      buildPhase2();
      wrap.classList.remove("out");
      locking = false;
      helper.innerHTML =
        "이번엔 <b>설계도 3장</b>이에요. 조건 3개만 주면 삼각형이 <b>단 하나로</b> 정해지는지, 모드마다 <b>작도!</b>를 눌러 확인해요.";
    }, 480);
  }

  function buildPhase2(): void {
    const modes = el("div", { class: "mtb-modes" });
    const defs: [Mode, string][] = [
      ["sss", "세 변"],
      ["sas", "두 변과 끼인각"],
      ["asa", "한 변과 양 끝 각"],
    ];
    modeBtns = {} as Record<Mode, HTMLButtonElement>;
    for (const [m, label] of defs) {
      const btn = el("button", { class: "mtb-mode", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      btn.addEventListener("click", () => {
        if (locking) return;
        mode = m;
        haptic(HAPTIC.tap);
        for (const k of Object.keys(modeBtns) as Mode[]) modeBtns[k].classList.toggle("sel", k === m);
        readyStage();
      });
      modeBtns[m] = btn;
      modes.appendChild(btn);
    }

    const stage2 = el("div", { class: "mtb-stage" });
    stage2.innerHTML =
      `<svg viewBox="0 0 ${W2} ${H2}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<g class="tb-base"></g><g class="tb-arcs"></g><g class="tb-out"></g></svg>`;
    const panel2 = el("div", { class: "mtb-panel" });
    const actions2 = el("div", { class: "mtb-actions" });

    drawBtn = el("button", { class: "mtb-build", text: "작도!", attrs: { type: "button" } }) as HTMLButtonElement;
    counterBtn = el("button", {
      class: "mtb-build warn",
      text: "끼인각이 아니면?",
      attrs: { type: "button" },
      style: "display:none",
    }) as HTMLButtonElement;
    drawBtn.addEventListener("click", () => playMode());
    counterBtn.addEventListener("click", () => playCounter());
    actions2.append(drawBtn, counterBtn);

    wrap.append(modes, stage2, panel2, actions2);
    gBase = stage2.querySelector(".tb-base") as SVGGElement;
    gArcs = stage2.querySelector(".tb-arcs") as SVGGElement;
    gOut = stage2.querySelector(".tb-out") as SVGGElement;
    panelRef = panel2;
    modeBtns.sss.classList.add("sel");
    readyStage();
  }

  const GIVENS: Record<Mode, string> = {
    sss: "주어진 것은 <b>세 변</b>, 8cm·9cm·11cm이에요.",
    sas: "주어진 것은 <b>두 변과 그 끼인각</b>, 11cm·8cm과 54°예요.",
    asa: "주어진 것은 <b>한 변과 그 양 끝 각</b>, 11cm과 54°·46°예요.",
  };

  function readyStage(): void {
    gBase.innerHTML = "";
    gArcs.innerHTML = "";
    gOut.innerHTML = "";
    panelRef.innerHTML = `<span class="mtb-k">설계도</span> ${GIVENS[mode]}`;
  }

  /** 밑변 BC + 꼭짓점 라벨(국면 2 공용, 길이 라벨 선택). */
  function baseBC(withLen: boolean): void {
    gBase.innerHTML =
      `<line class="tb-seg" x1="${B2.x}" y1="${B2.y}" x2="${C2.x}" y2="${C2.y}" stroke="${GEO.ink}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<circle cx="${B2.x}" cy="${B2.y}" r="4" fill="${GEO.ink}"/>` +
      `<circle cx="${C2.x}" cy="${C2.y}" r="4" fill="${GEO.ink}"/>` +
      `<text x="${B2.x - 4}" y="${B2.y + 17}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">B</text>` +
      `<text x="${C2.x + 4}" y="${C2.y + 17}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">C</text>` +
      (withLen
        ? `<text x="${(B2.x + C2.x) / 2}" y="${B2.y + 17}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${GEO.soft}">11cm</text>`
        : "");
    grow(gBase.querySelector(".tb-seg") as SVGLineElement, 320);
  }

  function finishMode(doneMsg: string): void {
    panelRef.innerHTML = `<span class="mtb-k ok">완성</span> ${doneMsg}`;
    played.add(mode);
    modeBtns[mode].classList.add("done");
    if (played.size === 3 && !badge3Shown) {
      badge3Shown = true;
      later(() => {
        const badge = el("div", { class: "mtb-rule", html: "<b>이 세 가지면 삼각형이 하나로 정해져요</b>" });
        wrap.insertBefore(badge, panelRef.nextSibling);
        haptic(HAPTIC.correct);
        toast("설계도 3장 완성! 그런데 마지막 반전이 있어요.");
        counterBtn.style.display = "";
        counterBtn.classList.add("mtb-in");
        helper.innerHTML = "마지막 반전! 각이 <b>끼인각이 아니면</b> 어떻게 될까요? 주황 버튼을 눌러 보세요.";
      }, 900);
    }
    later(() => {
      locking = false;
      drawBtn.disabled = false;
      counterBtn.disabled = false;
    }, 900);
  }

  function playMode(): void {
    if (locking) return;
    locking = true;
    drawBtn.disabled = true;
    counterBtn.disabled = true;
    haptic(HAPTIC.tap);
    readyStage();
    if (mode === "sss") playSSS();
    else if (mode === "sas") playSAS();
    else playASA();
  }

  /* SSS: 밑변 + 두 원호 → 유일한 교점 → 고스트(아래 교점)는 뒤집으면 같은 모양 */
  function playSSS(): void {
    baseBC(true);
    later(() => {
      const dirB = 53.8; // A를 향한 방향
      const dirC = 134.2;
      gArcs.innerHTML =
        `<path class="tb-a1" d="${arcPath(B2.x, B2.y, 8 * P2, dirB - 26, dirB + 26)}" stroke="${C_C}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<path class="tb-a2" d="${arcPath(C2.x, C2.y, 9 * P2, dirC - 26, dirC + 26)}" stroke="${C_B}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<text x="${polar(B2.x, B2.y, 8 * P2 + 11, dirB + 22).x.toFixed(1)}" y="${polar(B2.x, B2.y, 8 * P2 + 11, dirB + 22).y.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="${C_C}">8cm</text>` +
        `<text x="${polar(C2.x, C2.y, 9 * P2 + 11, dirC - 22).x.toFixed(1)}" y="${polar(C2.x, C2.y, 9 * P2 + 11, dirC - 22).y.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="${C_B}">9cm</text>`;
      grow(gArcs.querySelector(".tb-a1") as SVGPathElement, 480);
      grow(gArcs.querySelector(".tb-a2") as SVGPathElement, 480);
    }, 380);
    later(() => {
      gOut.innerHTML =
        `<line class="tb-sc" x1="${B2.x}" y1="${B2.y}" x2="${A2.x}" y2="${A2.y}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>` +
        `<line class="tb-sb" x1="${C2.x}" y1="${C2.y}" x2="${A2.x}" y2="${A2.y}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>` +
        `<g class="mtb-pop"><circle cx="${A2.x}" cy="${A2.y}" r="5.5" fill="${GEO.hlA}"/>` +
        `<text x="${A2.x}" y="${A2.y - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">A</text></g>`;
      grow(gOut.querySelector(".tb-sc") as SVGLineElement, 280);
      grow(gOut.querySelector(".tb-sb") as SVGLineElement, 280, 0, true);
      toast("교점은 단 하나, 삼각형도 단 하나!");
    }, 1000);
    // 고스트: 원호의 아래쪽 교점에 뒤집힌 삼각형이 잠깐
    later(() => {
      const ghost = document.createElementNS("http://www.w3.org/2000/svg", "g");
      ghost.setAttribute("class", "mtb-ghost");
      ghost.innerHTML =
        `<path d="${arcPath(B2.x, B2.y, 8 * P2, -79.8, -27.8)}" stroke="${C_C}" stroke-width="1.8" opacity=".4"/>` +
        `<path d="${arcPath(C2.x, C2.y, 9 * P2, -160.2, -108.2)}" stroke="${C_B}" stroke-width="1.8" opacity=".4"/>` +
        `<polygon points="${B2.x},${B2.y} ${C2.x},${C2.y} ${A2G.x},${A2G.y}" fill="${GEO.hlB}" fill-opacity=".14" stroke="${GEO.hlB}" stroke-width="2" stroke-dasharray="5 4"/>`;
      gOut.appendChild(ghost);
      ghost.getBoundingClientRect();
      ghost.classList.add("show");
      toast("아래쪽 교점도 있지만, 뒤집으면 같은 모양이라 하나로 쳐요!");
      later(() => ghost.classList.remove("show"), 2100);
      later(() => finishMode("세 변이 정해지면 원호의 교점이 딱 하나, 삼각형도 하나예요."), 2600);
    }, 1500);
  }

  /* SAS: 각 B 작도 → 두 변 길이 → 완성. 고스트가 본체에 포개진다 */
  function playSAS(): void {
    baseBC(true);
    later(() => {
      const rayEnd = polar(B2.x, B2.y, 8 * P2 + 34, ANG_B);
      gArcs.innerHTML =
        angleArc(B2.x, B2.y, 22, 0, ANG_B, GEO.hlA, "54°", { labelR: 36, fontSize: 10.5 }) +
        `<line class="tb-ray" x1="${B2.x}" y1="${B2.y}" x2="${rayEnd.x.toFixed(1)}" y2="${rayEnd.y.toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
      grow(gArcs.querySelector(".tb-ray") as SVGLineElement, 380);
    }, 380);
    later(() => {
      const tickA = tickMark(B2.x, B2.y, A2.x, A2.y, 1, C_C);
      const mid = { x: (B2.x + A2.x) / 2 - 14, y: (B2.y + A2.y) / 2 - 4 };
      gOut.innerHTML =
        `<line class="tb-sc" x1="${B2.x}" y1="${B2.y}" x2="${A2.x}" y2="${A2.y}" stroke="${C_C}" stroke-width="3.4" stroke-linecap="round"/>` +
        tickA +
        `<text x="${mid.x.toFixed(1)}" y="${mid.y.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="${C_C}">8cm</text>` +
        `<g class="mtb-pop"><circle cx="${A2.x}" cy="${A2.y}" r="5.5" fill="${GEO.hlA}"/>` +
        `<text x="${A2.x}" y="${A2.y - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">A</text></g>`;
      grow(gOut.querySelector(".tb-sc") as SVGLineElement, 320);
    }, 900);
    later(() => {
      const close = document.createElementNS("http://www.w3.org/2000/svg", "line");
      close.setAttribute("x1", String(C2.x));
      close.setAttribute("y1", String(C2.y));
      close.setAttribute("x2", String(A2.x));
      close.setAttribute("y2", String(A2.y));
      close.setAttribute("stroke", GEO.ink);
      close.setAttribute("stroke-width", "3");
      close.setAttribute("stroke-linecap", "round");
      gOut.appendChild(close);
      grow(close, 300);
    }, 1400);
    // 고스트가 비켜난 자리에서 본체 위로 포개진다
    later(() => {
      const ghost = document.createElementNS("http://www.w3.org/2000/svg", "g");
      ghost.setAttribute("class", "mtb-ghost slide");
      ghost.innerHTML = `<polygon points="${B2.x},${B2.y} ${C2.x},${C2.y} ${A2.x},${A2.y}" fill="${GEO.hlB}" fill-opacity=".16" stroke="${GEO.hlB}" stroke-width="2" stroke-dasharray="5 4"/>`;
      gOut.appendChild(ghost);
      ghost.getBoundingClientRect();
      ghost.classList.add("show");
      toast("어떻게 그려도 똑같은 삼각형!");
      later(() => ghost.classList.remove("show"), 2000);
      later(() => finishMode("두 변과 끼인각이 정해지면 나머지 한 변은 저절로, 삼각형은 하나예요."), 2500);
    }, 1900);
  }

  /* ASA: 밑변 + 양 끝 각 → 두 반직선의 교점 */
  function playASA(): void {
    baseBC(true);
    later(() => {
      gArcs.innerHTML =
        angleArc(B2.x, B2.y, 22, 0, ANG_B, GEO.hlA, "54°", { labelR: 36, fontSize: 10.5 }) +
        angleArc(C2.x, C2.y, 22, 180 - ANG_C, 180, GEO.hlB, "46°", { labelR: 36, fontSize: 10.5 });
    }, 380);
    later(() => {
      const rb = polar(B2.x, B2.y, 8 * P2 + 30, ANG_B);
      const rc = polar(C2.x, C2.y, 9 * P2 + 30, 180 - ANG_C);
      gArcs.innerHTML +=
        `<line class="tb-r1" x1="${B2.x}" y1="${B2.y}" x2="${rb.x.toFixed(1)}" y2="${rb.y.toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.6" stroke-dasharray="5 4"/>` +
        `<line class="tb-r2" x1="${C2.x}" y1="${C2.y}" x2="${rc.x.toFixed(1)}" y2="${rc.y.toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
      grow(gArcs.querySelector(".tb-r1") as SVGLineElement, 420);
      grow(gArcs.querySelector(".tb-r2") as SVGLineElement, 420);
    }, 800);
    later(() => {
      gOut.innerHTML =
        `<line class="tb-sc" x1="${B2.x}" y1="${B2.y}" x2="${A2.x}" y2="${A2.y}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>` +
        `<line class="tb-sb" x1="${C2.x}" y1="${C2.y}" x2="${A2.x}" y2="${A2.y}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>` +
        `<g class="mtb-pop"><circle cx="${A2.x}" cy="${A2.y}" r="5.5" fill="${GEO.hlA}"/>` +
        `<text x="${A2.x}" y="${A2.y - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">A</text></g>`;
      grow(gOut.querySelector(".tb-sc") as SVGLineElement, 300);
      grow(gOut.querySelector(".tb-sb") as SVGLineElement, 300, 0, true);
      toast("두 반직선이 만나는 점은 단 하나!");
      later(() => finishMode("한 변과 양 끝 각이 정해지면 두 반직선의 교점이 하나, 삼각형도 하나예요."), 900);
    }, 1400);
  }

  /* 반례: 끼인각이 아닌 각이면 원호가 반직선과 두 점에서 만나 삼각형이 2개 */
  function playCounter(): void {
    if (locking) return;
    locking = true;
    drawBtn.disabled = true;
    counterBtn.disabled = true;
    haptic(HAPTIC.tap);
    gBase.innerHTML = "";
    gArcs.innerHTML = "";
    gOut.innerHTML = "";
    panelRef.innerHTML = `<span class="mtb-k warn">반례</span> 두 변과 <b>끼인각이 아닌</b> ∠B가 주어지면 어떻게 될까요?`;

    baseBC(true);
    const angB = 35;
    const A1 = { x: 162.8, y: 108.8 };
    const A2p = { x: 222.3, y: 67.1 };
    later(() => {
      const rayEnd = polar(B2.x, B2.y, 13.5 * P2, angB);
      gArcs.innerHTML =
        angleArc(B2.x, B2.y, 22, 0, angB, GEO.hlA, "∠B", { labelR: 38, fontSize: 10.5 }) +
        `<line class="tb-ray" x1="${B2.x}" y1="${B2.y}" x2="${rayEnd.x.toFixed(1)}" y2="${rayEnd.y.toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      grow(gArcs.querySelector(".tb-ray") as SVGLineElement, 420);
    }, 380);
    later(() => {
      const lb = polar(C2.x, C2.y, 7 * P2 + 12, 120);
      gArcs.innerHTML +=
        `<path class="tb-carc" d="${arcPath(C2.x, C2.y, 7 * P2, 85, 170)}" stroke="${C_B}" stroke-width="2.6" stroke-linecap="round"/>` +
        `<text x="${lb.x.toFixed(1)}" y="${lb.y.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="${C_B}">7cm</text>`;
      grow(gArcs.querySelector(".tb-carc") as SVGPathElement, 520);
    }, 900);
    later(() => {
      gOut.innerHTML =
        `<polygon class="mtb-blinkA" points="${B2.x},${B2.y} ${C2.x},${C2.y} ${A1.x},${A1.y}" fill="${GEO.hlC}" fill-opacity=".16" stroke="${GEO.hlC}" stroke-width="2.6"/>` +
        `<polygon class="mtb-blinkB" points="${B2.x},${B2.y} ${C2.x},${C2.y} ${A2p.x},${A2p.y}" fill="${GEO.hlB}" fill-opacity=".16" stroke="${GEO.hlB}" stroke-width="2.6"/>` +
        `<g class="mtb-pop"><circle cx="${A1.x}" cy="${A1.y}" r="5" fill="${GEO.hlC}"/><circle cx="${A2p.x}" cy="${A2p.y}" r="5" fill="${GEO.hlB}"/></g>`;
      haptic(HAPTIC.cross);
      toast("교점이 둘! 삼각형이 2개 생겨요.");
    }, 1600);
    later(() => {
      panelRef.innerHTML = `<span class="mtb-k warn">반례</span> 조건은 3개인데 삼각형이 <b>2개</b>! 그래서 <b>끼인각</b>이어야 해요.`;
      chips.on("unique", "확인!");
      finishAll();
      locking = false;
      drawBtn.disabled = false;
      counterBtn.disabled = false;
    }, 2900);
  }

  function finishAll(): void {
    if (finished || chips.count() < 3) return;
    finished = true;
    helper.innerHTML = "삼각형이 <b>되는 조건</b>과 <b>하나로 정해지는 조건</b>, 이 둘이 다음 레슨 합동의 열쇠예요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
