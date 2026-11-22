// [중1 Ⅰ v5] u1l2 graphLab: 「표를 그래프로 옮기면 무엇이 보일까?」
// 한 통찰: 표의 숫자를 그래프로 옮기면 차이와 규칙이 한눈에 보인다(자료 해석). 많이 오른 컵일수록 선이 가파르다.
// 조작: 표에서 색칠된 칸의 값을 그래프에 찍는다. 그래프를 누른 채 위아래로 끌면 점과 값이 따라 움직이고, 손을 떼면 찍힌다.
//       표의 값과 1 ℃ 안쪽이면 그 값에 붙는다. 더 어긋나면 빨갛게 흔들리고 표의 값을 다시 알려 준다(다시 찍는다).
// 흐름: 여섯 점(컵 셋 × 30분 뒤, 60분 뒤. 처음 온도 18 ℃는 찍혀 있다) → 판정 → 결론.
// 값은 앞 랩(fairLab)의 공정한 실험 결과(60분 뒤 28, 23, 20 ℃)와 같다: 검은색 18, 24, 28 / 노란색 18, 21, 23 / 흰색 18, 19, 20.
// 그래프 좌표(viewBox 346×230): 18 ℃ = y 186, 30 ℃ = y 22(1 ℃ = 164/12, 약 13.7). 큰 눈금은 2 ℃마다. 시간 축 x = 70, 178, 286.
// 2026-11-15 그래픽 감사: 판정의 답인 검은색 컵의 선이 밝은 회색이라 흰색 선과 비슷했다. 검은 선은 밝은 테두리를 두른 굵고 짙은 선으로,
// 선 끝(60분 뒤 점 오른쪽)에 이름과 값을 붙인다. 그 자리를 내려고 시간 축을 왼쪽으로 조금 당겼다(세로 눈금은 그대로).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCapture, bvFrame, bvSvgPoint, bvTimers } from "../bio6/b6Lab";

interface GraphStep {
  title: string;
  cta?: string;
}

const SERIES = [
  { name: "검은색", dot: "#2B3440", ring: "#E8EEF9", line: "#232B38", casing: "#E8EEF9", label: "#E8EEF9", v: [18, 24, 28] },
  { name: "노란색", dot: "#FFD84A", ring: "#FFF3BF", line: "#FFD84A", casing: "", label: "#FFE27A", v: [18, 21, 23] },
  { name: "흰색", dot: "#FFFFFF", ring: "#FFFFFF", line: "#FFFFFF", casing: "", label: "#FFFFFF", v: [18, 19, 20] },
];
const TIMES = ["처음", "30분 뒤", "60분 뒤"];
const XS = [70, 178, 286];
const GX0 = 46; // 그래프 판의 왼쪽(세로축)
const GX1 = 304; // 그래프 판의 오른쪽(그 오른쪽은 선 끝 이름표 자리)
const T_MIN = 18; // 세로축 아래 끝(처음 온도)
const T_MAX = 30; // 세로축 위 끝
const Y_MIN = 186; // T_MIN의 y
const PER = (Y_MIN - 22) / (T_MAX - T_MIN); // 1 ℃의 높이
const yOf = (t: number): number => Y_MIN - (t - T_MIN) * PER;
const NS = "http://www.w3.org/2000/svg";

function stageSvg(): string {
  const grid = [18, 20, 22, 24, 26, 28, 30]
    .map((t) => `<line x1="${GX0}" y1="${yOf(t)}" x2="${GX1}" y2="${yOf(t)}" stroke="#22344F" stroke-width="1"/><text x="${GX0 - 7}" y="${yOf(t) + 4.5}" text-anchor="end" class="u1g-ax">${t}</text>`)
    .join("");
  const minor = Array.from({ length: T_MAX - T_MIN + 1 }, (_, i) => T_MIN + i)
    .filter((t) => t % 2)
    .map((t) => `<line x1="${GX0}" y1="${yOf(t)}" x2="${GX1}" y2="${yOf(t)}" stroke="#17263D" stroke-width="1"/>`)
    .join("");
  const cols = XS.map((x, i) => `<line x1="${x}" y1="${yOf(T_MAX)}" x2="${x}" y2="${Y_MIN}" stroke="#22344F" stroke-width="1"/><text x="${x}" y="206" text-anchor="middle" class="u1g-ax">${TIMES[i]}</text>`).join("");
  return `<svg viewBox="0 0 346 230" role="img" aria-label="시간에 따른 물의 온도 그래프">
    ${minor}${grid}${cols}
    <text x="14" y="14" class="u1g-ax">온도(℃)</text>
    ${SERIES.map((sr, i) => `<circle cx="${150 + i * 64}" cy="10" r="5" fill="${sr.dot}" stroke="${sr.ring}" stroke-width="1.6"/><text x="${159 + i * 64}" y="14.5" class="u1g-ax lg">${sr.name}</text>`).join("")}
    <line x1="${GX0}" y1="${yOf(T_MAX) - 6}" x2="${GX0}" y2="${Y_MIN}" stroke="#8FA3C2" stroke-width="1.6"/>
    <line x1="${GX0}" y1="${Y_MIN}" x2="${GX1 + 4}" y2="${Y_MIN}" stroke="#8FA3C2" stroke-width="1.6"/>
    <rect class="u1g-col" x="0" y="${yOf(T_MAX) - 6}" width="56" height="${Y_MIN - yOf(T_MAX) + 12}" rx="10" fill="#4C9BFF" opacity="0"/>
    <g class="u1g-lines"></g>
    <g class="u1g-dots"></g>
    <g class="u1g-ends"></g>
    <g class="u1g-ghost" style="display:none">
      <line class="u1g-gl" x1="${GX0}" x2="${GX1}" stroke="#FFD766" stroke-width="1.2" stroke-dasharray="4 4"/>
      <circle class="u1g-gc" r="8" fill="#FFD766" stroke="#fff" stroke-width="2"/>
      <rect class="u1g-gb" width="52" height="24" rx="12" fill="#FFD766"/>
      <text class="u1g-gt" text-anchor="middle"></text>
    </g>
  </svg>`;
}

export const graphLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as GraphStep;
  const tm = bvTimers();
  host.classList.add("u1x-step");
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "u1g-stage", qCls: "u1g-q", api });
  f.stage.innerHTML = stageSvg();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;
  const lines = svg.querySelector(".u1g-lines") as SVGGElement;
  const dots = svg.querySelector(".u1g-dots") as SVGGElement;
  const ends = svg.querySelector(".u1g-ends") as SVGGElement;
  const ghost = svg.querySelector(".u1g-ghost") as SVGGElement;
  const gl = svg.querySelector(".u1g-gl") as SVGLineElement;
  const gc = svg.querySelector(".u1g-gc") as SVGCircleElement;
  const gb = svg.querySelector(".u1g-gb") as SVGRectElement;
  const gt = svg.querySelector(".u1g-gt") as SVGTextElement;
  const colHi = svg.querySelector(".u1g-col") as SVGRectElement;

  // ── 표(조작 칸) ──
  const cells: HTMLElement[][] = [];
  const table = el("div", { class: "u1x-table", attrs: { role: "table", "aria-label": "컵의 색깔에 따른 물의 온도" } });
  table.append(el("div", { class: "u1x-th", text: "컵" }), ...TIMES.map((t) => el("div", { class: "u1x-th", text: t })));
  SERIES.forEach((sr, si) => {
    const sw = el("i", { class: "u1x-sw" });
    sw.style.background = sr.dot;
    sw.style.borderColor = sr.ring;
    table.append(el("div", { class: "u1x-td name" }, sw, sr.name));
    cells[si] = sr.v.map((v, ti) => {
      const c = el("div", { class: `u1x-td${ti === 0 ? " done" : ""}`, text: `${v} ℃` });
      table.append(c);
      return c;
    });
  });
  // 그래프(무대)는 이 표의 위에 있다(넓은 화면도 무대 바로 아래에 조작이 온다). 그래서 "위 그래프"라고 부른다.
  const cap = el("div", { class: "u1x-cap", text: "측정한 물의 온도예요. 색칠된 칸의 값을 위 그래프에 찍어 보세요." });

  // 찍을 차례: 컵마다 30분 뒤, 60분 뒤
  const ORDER: [number, number][] = [];
  SERIES.forEach((_, si) => [1, 2].forEach((ti) => ORDER.push([si, ti])));
  let idx = 0;
  let dragging = false;
  let busy = false;
  let finished = false;

  function addDot(si: number, ti: number, pop = true): void {
    const sr = SERIES[si];
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", String(XS[ti]));
    c.setAttribute("cy", yOf(sr.v[ti]).toFixed(1));
    c.setAttribute("r", "6.5");
    c.setAttribute("fill", sr.dot);
    c.setAttribute("stroke", sr.ring);
    c.setAttribute("stroke-width", "2");
    if (pop) c.setAttribute("class", "u1g-pop");
    dots.appendChild(c);
    if (ti > 0) {
      // 검은색 선은 밝은 테두리(굵은 밝은 선) 위에 짙은 선을 겹쳐 어두운 무대에서도 가장 또렷하게
      const seg = (color: string, w: string): void => {
        const l = document.createElementNS(NS, "line");
        l.setAttribute("x1", String(XS[ti - 1]));
        l.setAttribute("y1", yOf(sr.v[ti - 1]).toFixed(1));
        l.setAttribute("x2", String(XS[ti]));
        l.setAttribute("y2", yOf(sr.v[ti]).toFixed(1));
        l.setAttribute("stroke", color);
        l.setAttribute("stroke-width", w);
        l.setAttribute("stroke-linecap", "round");
        lines.appendChild(l);
      };
      if (sr.casing) {
        seg(sr.casing, "6.6");
        seg(sr.line, "3.6");
      } else seg(sr.line, "2.6");
    }
    if (ti === 2) {
      // 선 끝 이름표: 이름과 값(60분 뒤 점의 오른쪽)
      const y = yOf(sr.v[ti]);
      const t1 = document.createElementNS(NS, "text");
      t1.setAttribute("x", String(XS[ti] + 10));
      t1.setAttribute("y", (y - 2).toFixed(1));
      t1.setAttribute("class", `u1g-end${pop ? " u1g-pop" : ""}`);
      t1.setAttribute("fill", sr.label);
      t1.textContent = sr.name;
      const t2 = document.createElementNS(NS, "text");
      t2.setAttribute("x", String(XS[ti] + 10));
      t2.setAttribute("y", (y + 13).toFixed(1));
      t2.setAttribute("class", `u1g-end v${pop ? " u1g-pop" : ""}`);
      t2.setAttribute("fill", sr.label);
      t2.textContent = `${sr.v[ti]} ℃`;
      ends.append(t1, t2);
    }
  }

  function paintTurn(): void {
    cells.flat().forEach((c) => c.classList.remove("now"));
    host.dataset.u1Next = String(idx);
    if (idx >= ORDER.length) {
      colHi.setAttribute("opacity", "0");
      return;
    }
    const [si, ti] = ORDER[idx];
    cells[si][ti].classList.add("now");
    colHi.setAttribute("x", String(XS[ti] - 28));
    colHi.setAttribute("opacity", ".13");
    if (import.meta.env.DEV) host.dataset.u1Target = String(SERIES[si].v[ti]);
    // "파란 기둥" = 찍을 시각의 세로 칸을 파랗게 밝힌 띠(colHi). 그래프 어디를 눌러도 점은 이 기둥 위에 찍힌다.
    f.say(`<b>${SERIES[si].name} 컵의 ${TIMES[ti]} 온도(${SERIES[si].v[ti]} ℃)</b>를 찍어 보세요. 그래프의 파란 기둥을 누른 채 위아래로 맞춰 손을 떼면 돼요.`);
  }

  const tempAt = (clientX: number, clientY: number): number => {
    const p = bvSvgPoint(svg, clientX, clientY);
    return Math.max(T_MIN, Math.min(T_MAX, Math.round(T_MIN + (Y_MIN - p.y) / PER)));
  };
  function showGhost(t: number, bad = false): void {
    const [, ti] = ORDER[idx];
    const x = XS[ti];
    const y = yOf(t);
    ghost.style.display = "";
    ghost.classList.toggle("bad", bad);
    gl.setAttribute("y1", String(y));
    gl.setAttribute("y2", String(y));
    gc.setAttribute("cx", String(x));
    gc.setAttribute("cy", String(y));
    const bx = ti === 2 ? x - 66 : x + 14;
    gb.setAttribute("x", String(bx));
    gb.setAttribute("y", String(y - 12));
    gt.setAttribute("x", String(bx + 26));
    gt.setAttribute("y", String(y + 4.5));
    gt.textContent = `${t} ℃`;
  }

  function commit(t: number): void {
    const [si, ti] = ORDER[idx];
    const want = SERIES[si].v[ti];
    if (Math.abs(t - want) <= 1) {
      ghost.style.display = "none";
      haptic(HAPTIC.correct);
      addDot(si, ti);
      cells[si][ti].classList.add("done");
      idx += 1;
      if (ti === 2) f.pips(si + 1);
      paintTurn();
      if (idx >= ORDER.length) {
        busy = true;
        f.say("여섯 개의 점을 모두 찍었어요! 세 선이 올라가는 모습을 비교해 볼까요?");
        tm.later(askFinal, 1700);
      }
      return;
    }
    haptic(HAPTIC.wrong);
    busy = true;
    showGhost(t, true);
    f.say(`방금 놓은 자리는 ${t} ℃예요. 표에 적힌 값은 <b>${want} ℃</b>이니 세로축 눈금을 보고 다시 맞춰 보세요.`);
    tm.later(() => {
      ghost.style.display = "none";
      ghost.classList.remove("bad");
      busy = false;
    }, 900);
  }

  const down = (e: PointerEvent): void => {
    if (busy || finished || idx >= ORDER.length) return;
    e.preventDefault();
    dragging = true;
    bvCapture(f.stage, e.pointerId);
    showGhost(tempAt(e.clientX, e.clientY));
  };
  const move = (e: PointerEvent): void => {
    if (!dragging) return;
    showGhost(tempAt(e.clientX, e.clientY));
  };
  const up = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    commit(tempAt(e.clientX, e.clientY));
  };
  const cancel = (): void => {
    if (!dragging) return;
    dragging = false;
    ghost.style.display = "none";
  };
  f.stage.addEventListener("pointerdown", down);
  f.stage.addEventListener("pointermove", move);
  f.stage.addEventListener("pointerup", up);
  f.stage.addEventListener("pointercancel", cancel);

  function askFinal(): void {
    f.say("그래프가 완성됐어요! 세 선이 <b>얼마나 가파르게 올라가는지</b> 비교하며 답해 보세요.");
    f.slot.ask(
      "60분 동안 온도가 <b>가장 많이 오른</b> 컵의 선은 어떤 모습인가요?",
      [{ t: "가장 가파르게 올라간다", ok: true }, { t: "가장 완만하게 올라간다" }, { t: "가장 아래쪽에 놓인다" }],
      (ok) => api.recordQuiz(ok),
      { why: "검은색 컵의 선이 가장 가팔라요. 온도가 <b>많이 오를수록</b> 선이 가파르게 올라가요.", onNext: finish },
    );
  }

  function finish(): void {
    finished = true;
    f.pips(4);
    f.say("숫자로만 보던 표를 그래프로 옮기니 색깔별 온도 변화가 한눈에 비교돼요!");
    f.slot.conclude("표를 그래프로 바꾸면 변화와 차이가 한눈에 보여요. 이렇게 정리한 자료에서 규칙이나 관계를 찾는 과정을 <b>자료 해석</b>이라고 해요. 물의 온도는 검은색, 노란색, 흰색 컵 순으로 많이 올랐어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  SERIES.forEach((_, si) => addDot(si, 0, false));
  f.slot.setControls(cap, table);
  paintTurn();
  api.setCTA("표의 값을 그래프에 찍어 보세요", { enabled: false });
  return () => tm.clear();
};
