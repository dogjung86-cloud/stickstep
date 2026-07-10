// rayLab, 곧은 선 삼형제(Ⅳ L2 — 교과서 145~146쪽 직선·반직선·선분과 기호, AB와 BA는 다른 반직선).
// 세 국면: ① 삼형제 만들기(선분→직선→반직선 미션 3연속, 모드 버튼 탭)
//          ② 방향의 발견(반직선 BA를 그리고 "AB와 같은 도형?" 미니 질문, 다르다가 정답)
//          ③ 기호 판독(기호 카드를 보고 그림 보기 3지선다 3연속).
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA.
// 선이 자라나는 애니는 stroke-dasharray/offset 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제), rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, dot, ptLabel, lineSvg, arrowHead, gsym } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface RayStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type ModeId = "seg" | "line" | "rayAB" | "rayBA";
type SymKind = "line" | "seg" | "ray";

const NS = "http://www.w3.org/2000/svg";
const W = 340;
const H = 180;
const BASE_Y = 76; // 기준선(A·B가 놓인 줄)
const BA_Y = 104; // 반직선 BA 비교선(살짝 아래, 겹침 방지)
const A_X = 114; // 왼쪽 1/3
const B_X = 226; // 오른쪽 2/3
const EDGE_L = 14;
const EDGE_R = 326;

const TRIO: { mode: ModeId; ask: string; ok: string }[] = [
  { mode: "seg", ask: "<b>선분 AB</b>를 만들어 보세요", ok: "A에서 B까지, 딱 그 사이만!" },
  { mode: "line", ask: "이번엔 <b>직선 AB</b>를 만들어 보세요", ok: "양쪽으로 끝없이!" },
  { mode: "rayAB", ask: "<b>반직선 AB</b>를 만들어 보세요", ok: "시작점 A, 방향은 B쪽!" },
];

const HINT: Record<ModeId, string> = {
  seg: "그건 선분: 두 점 사이만 곧게 이어요",
  line: "그건 직선: 양쪽으로 끝없이 뻗어요",
  rayAB: "반직선은 한쪽으로만 뻗어요, AB는 A에서 출발!",
  rayBA: "반직선 BA는 B에서 출발해 A쪽으로 뻗어요",
};

const SYM_GOOD: Record<SymKind, string> = {
  line: "↔ 마크: 양쪽으로 끝없이, 직선!",
  seg: "― 마크: 두 점 사이만, 선분!",
  ray: "→ 마크: 한쪽으로만, 반직선!",
};

export const rayLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RayStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "trio", label: "삼형제", sub: "0/3" },
    { id: "dir", label: "방향 발견", sub: "AB≠BA" },
    { id: "sym", label: "기호 판독", sub: "0/3" },
  ]);

  const board = mboard(430);
  const qCard = el("div", { class: "mdr-q mrl-q" });
  const stage = el("div", { class: "mrl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" fill="none">` +
    lineSvg(EDGE_L, BASE_Y, EDGE_R, BASE_Y, GEO.faint, 1.5, "5 6") +
    `<g class="mrl-g-draw"></g>` +
    `<g class="mrl-g-ba"></g>` +
    `<g class="mrl-g-fx"></g>` +
    `<g class="mrl-g-pts">` +
    dot(A_X, BASE_Y, GEO.ink, 4.5) +
    ptLabel(A_X, BASE_Y, "A", 0, -12) +
    dot(B_X, BASE_Y, GEO.ink, 4.5) +
    ptLabel(B_X, BASE_Y, "B", 0, -12) +
    `</g>` +
    `</svg>`;
  const modeRow = el("div", { class: "mrl-modes" });
  const askCard = el("div", { class: "mrl-panel mrl-hide" });
  board.append(qCard, stage, modeRow, askCard);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "아래 <b>버튼 4개</b> 중 미션에 맞는 것을 골라 탭해요. 문자 위의 마크가 힌트!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gDraw = svg.querySelector(".mrl-g-draw") as SVGGElement;
  const gBA = svg.querySelector(".mrl-g-ba") as SVGGElement;
  const gFx = svg.querySelector(".mrl-g-fx") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const kicker = (t: string): string => `<span class="mrl-k">${t}</span>`;
  const chipSub = (id: string): HTMLElement => chips.el.querySelector(`[data-g="${id}"] span`) as HTMLElement;
  const tag = (x: number, y: number, txt: string, color: string, anchor: "start" | "end"): string =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="10.5" font-weight="800" fill="${color}">${txt}</text>`;

  let phase: "trio" | "dir" | "ask" | "sym" | "done" = "trio";
  let locking = false;
  let trioIdx = 0;

  /* ── 그리기 헬퍼(dasharray 성장 + 페이드) ── */
  function grow(parent: SVGGElement, x1: number, y1: number, x2: number, y2: number, color: string, delay: number, dur: number): void {
    const ln = document.createElementNS(NS, "line");
    ln.setAttribute("x1", String(x1));
    ln.setAttribute("y1", String(y1));
    ln.setAttribute("x2", String(x2));
    ln.setAttribute("y2", String(y2));
    ln.setAttribute("stroke", color);
    ln.setAttribute("stroke-width", "3.4");
    ln.setAttribute("stroke-linecap", "round");
    const len = Math.hypot(x2 - x1, y2 - y1);
    ln.style.setProperty("stroke-dasharray", `${len}`);
    ln.style.setProperty("stroke-dashoffset", `${len}`);
    parent.appendChild(ln);
    later(() => {
      void ln.getBoundingClientRect(); // 초기 상태 커밋(트랜지션 보장)
      ln.style.transition = `stroke-dashoffset ${dur}ms var(--ease-out)`;
      ln.style.setProperty("stroke-dashoffset", "0");
    }, delay);
  }

  function fadeIn(parent: SVGGElement, html: string, delay: number): void {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "mrl-fade");
    g.innerHTML = html;
    parent.appendChild(g);
    later(() => g.classList.add("show"), delay);
  }

  /** 시작점 강조(색 점 + 링 + 퍼지는 핑). */
  function startMark(parent: SVGGElement, x: number, y: number, color: string, delay: number): void {
    fadeIn(
      parent,
      dot(x, y, color, 3.8) +
        `<circle cx="${x}" cy="${y}" r="7.5" fill="none" stroke="${color}" stroke-width="2.2"/>` +
        `<circle class="mrl-ping" cx="${x}" cy="${y}" r="8" fill="none" stroke="${color}" stroke-width="2"/>`,
      delay,
    );
  }

  function drawMode(mode: ModeId): void {
    if (mode !== "rayBA") {
      clear(gDraw);
      clear(gFx);
    }
    if (mode === "seg") {
      grow(gDraw, A_X, BASE_Y, B_X, BASE_Y, GEO.hlA, 20, 420);
      startMark(gFx, A_X, BASE_Y, GEO.hlA, 400);
      startMark(gFx, B_X, BASE_Y, GEO.hlA, 500);
    } else if (mode === "line") {
      grow(gDraw, A_X, BASE_Y, B_X, BASE_Y, GEO.hlA, 20, 280);
      grow(gDraw, A_X, BASE_Y, EDGE_L, BASE_Y, GEO.hlA, 310, 360);
      grow(gDraw, B_X, BASE_Y, EDGE_R, BASE_Y, GEO.hlA, 310, 360);
      fadeIn(gDraw, arrowHead(EDGE_L, BASE_Y, 180, GEO.hlA) + arrowHead(EDGE_R, BASE_Y, 0, GEO.hlA), 680);
    } else if (mode === "rayAB") {
      grow(gDraw, A_X, BASE_Y, B_X, BASE_Y, GEO.hlA, 20, 280);
      grow(gDraw, B_X, BASE_Y, EDGE_R, BASE_Y, GEO.hlA, 310, 360);
      fadeIn(gDraw, arrowHead(EDGE_R, BASE_Y, 0, GEO.hlA) + tag(EDGE_R - 2, BASE_Y - 12, "반직선 AB", GEO.hlA, "end"), 680);
      startMark(gFx, A_X, BASE_Y, GEO.hlA, 20);
    } else {
      grow(gBA, B_X, BA_Y, A_X, BA_Y, GEO.hlC, 20, 280);
      grow(gBA, A_X, BA_Y, EDGE_L, BA_Y, GEO.hlC, 310, 360);
      fadeIn(gBA, arrowHead(EDGE_L, BA_Y, 180, GEO.hlC) + tag(EDGE_L + 2, BA_Y + 22, "반직선 BA", GEO.hlC, "start"), 680);
      startMark(gBA, B_X, BA_Y, GEO.hlC, 20);
    }
  }

  /* ── 국면 1·2: 모드 버튼 미션 ── */
  const MODES: { id: ModeId; name: string; sym: string }[] = [
    { id: "seg", name: "선분", sym: gsym("AB", "seg") },
    { id: "line", name: "직선", sym: gsym("AB", "line") },
    { id: "rayAB", name: "반직선", sym: gsym("AB", "ray") },
    { id: "rayBA", name: "반직선", sym: gsym("BA", "ray") },
  ];
  for (const m of MODES) {
    const b = el("button", {
      class: "mrl-mode",
      html: `<span class="mrl-mname">${m.name}</span>${m.sym}`,
      attrs: { type: "button" },
    });
    b.addEventListener("click", () => onMode(m.id, b));
    modeRow.appendChild(b);
  }

  function askTrio(): void {
    qCard.innerHTML = `${kicker(`미션 ${trioIdx + 1}/4`)} ${TRIO[trioIdx].ask}`;
  }

  function onMode(id: ModeId, btn: HTMLButtonElement): void {
    if (locking || (phase !== "trio" && phase !== "dir")) return;
    const want: ModeId = phase === "dir" ? "rayBA" : TRIO[trioIdx].mode;
    if (id !== want) {
      haptic(HAPTIC.cross);
      btn.classList.add("no");
      toast(HINT[id]);
      later(() => btn.classList.remove("no"), 650);
      return;
    }
    locking = true;
    haptic(HAPTIC.correct);
    btn.classList.add("ok");
    later(() => btn.classList.remove("ok"), 900);
    drawMode(id);
    if (phase === "trio") {
      toast(TRIO[trioIdx].ok);
      trioIdx += 1;
      chipSub("trio").textContent = `${trioIdx}/3`;
      later(() => {
        locking = false;
        if (trioIdx < TRIO.length) askTrio();
        else {
          chips.on("trio", "3/3!");
          startDir();
        }
      }, 1500);
    } else {
      toast("B에서 출발, A쪽으로!");
      later(() => {
        locking = false;
        openAsk();
      }, 1600);
    }
  }

  function startDir(): void {
    phase = "dir";
    qCard.innerHTML = `${kicker("미션 4/4")} 그럼 <b>반직선 BA</b>를 만들어 보세요`;
    helper.innerHTML = "방금 만든 반직선 <b>AB</b>는 그대로 둘게요. 이름만 뒤집은 <b>BA</b>는 어떤 모양일까요?";
  }

  /* ── 국면 2 미니 질문: 같은 도형일까? ── */
  function openAsk(): void {
    phase = "ask";
    modeRow.classList.add("mrl-hide");
    askCard.classList.remove("mrl-hide");
    qCard.innerHTML = `${kicker("생각해 봐요")} ${gsym("AB", "ray")}와 ${gsym("BA", "ray")}, 같은 도형일까요?`;
    helper.innerHTML = "주황(AB)은 A에서 오른쪽으로, 분홍(BA)은 B에서 왼쪽으로 뻗었어요. 자, 판정은?";
    clear(askCard);
    const same = el("button", { class: "mrl-choice", text: "같다", attrs: { type: "button" } });
    const diff = el("button", { class: "mrl-choice", text: "다르다", attrs: { type: "button" } });
    same.addEventListener("click", () => onSame(same));
    diff.addEventListener("click", () => onDiff(diff));
    askCard.append(same, diff);
    later(() => askCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function onDiff(btn: HTMLButtonElement): void {
    if (locking || phase !== "ask") return;
    locking = true;
    haptic(HAPTIC.correct);
    btn.classList.add("ok");
    chips.on("dir", "발견!");
    toast("정답! 시작점도 방향도 반대예요");
    helper.innerHTML =
      "반직선은 <b>시작점과 방향이 모두 같아야</b> 같은 도형이에요. AB와 BA는 시작점도 방향도 반대, 서로 다른 반직선!";
    later(() => {
      locking = false;
      startSym();
    }, 1800);
  }

  function onSame(btn: HTMLButtonElement): void {
    if (locking || phase !== "ask") return;
    locking = true;
    haptic(HAPTIC.cross);
    btn.classList.add("no");
    toast("겹쳐 볼까요?");
    gBA.classList.add("mrl-lift");
    gDraw.classList.add("mrl-cmp");
    gBA.classList.add("mrl-cmp2");
    later(() => {
      gBA.classList.remove("mrl-lift", "mrl-cmp2");
      gDraw.classList.remove("mrl-cmp");
      btn.classList.remove("no");
      toast("겹쳐도 화살표가 반대 방향이죠? 다시 골라요!");
      locking = false;
    }, 2400);
  }

  /* ── 국면 3: 기호 판독 ── */
  const SYMQ: { letters: string; kind: SymKind }[] = [
    { letters: "CD", kind: "line" },
    { letters: "EF", kind: "seg" },
    { letters: "GH", kind: "ray" },
  ];
  SYMQ.sort(() => Math.random() - 0.5); // 랜덤 순서(스펙)
  let symIdx = 0;
  let symOk = 0;

  function miniFig(k: SymKind): string {
    const y = 16;
    let inner = "";
    if (k === "line")
      inner = lineSvg(16, y, 104, y, GEO.ink, 2.6) + arrowHead(16, y, 180, GEO.ink, 6) + arrowHead(104, y, 0, GEO.ink, 6);
    else if (k === "seg") inner = lineSvg(26, y, 94, y, GEO.ink, 2.6) + dot(26, y, GEO.ink, 3.6) + dot(94, y, GEO.ink, 3.6);
    else inner = dot(22, y, GEO.ink, 3.6) + lineSvg(22, y, 104, y, GEO.ink, 2.6) + arrowHead(104, y, 0, GEO.ink, 6);
    return `<svg viewBox="0 0 120 32" xmlns="${NS}" fill="none">${inner}</svg>`;
  }

  function startSym(): void {
    phase = "sym";
    helper.innerHTML = "이제 기호만 보고 알아맞혀요. 문자 <b>위의 마크</b>(↔·→·―)가 힌트예요!";
    askSym();
  }

  function askSym(): void {
    const q = SYMQ[symIdx];
    qCard.innerHTML = `${kicker(`기호 판독 ${symIdx + 1}/3`)} 이 기호가 나타내는 도형은?`;
    clear(askCard);
    askCard.appendChild(el("div", { class: "mrl-sym", html: gsym(q.letters, q.kind) }));
    const opts = el("div", { class: "mrl-opts" });
    const names: Record<SymKind, string> = { line: "양쪽으로 뻗는 선", seg: "두 점 사이 선분", ray: "한쪽으로 뻗는 선" };
    const kinds: SymKind[] = (["line", "seg", "ray"] as SymKind[]).sort(() => Math.random() - 0.5);
    for (const k of kinds) {
      const b = el("button", { class: "mrl-opt", html: miniFig(k), attrs: { type: "button", "aria-label": names[k] } });
      b.addEventListener("click", () => onSymPick(k, b));
      opts.appendChild(b);
    }
    askCard.appendChild(opts);
    later(() => askCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function onSymPick(k: SymKind, btn: HTMLButtonElement): void {
    if (locking || phase !== "sym") return;
    if (k !== SYMQ[symIdx].kind) {
      haptic(HAPTIC.cross);
      btn.classList.add("no");
      toast("위의 마크를 봐요, ↔는 양쪽, →는 한쪽, ―는 두 점 사이!");
      later(() => btn.classList.remove("no"), 650);
      return;
    }
    locking = true;
    haptic(HAPTIC.correct);
    btn.classList.add("ok");
    symOk += 1;
    chipSub("sym").textContent = `${symOk}/3`;
    toast(SYM_GOOD[k]);
    later(() => {
      locking = false;
      symIdx += 1;
      if (symIdx < SYMQ.length) askSym();
      else {
        chips.on("sym", "3/3!");
        finish();
      }
    }, 1200);
  }

  function finish(): void {
    phase = "done";
    askCard.classList.add("mrl-hide");
    qCard.innerHTML = `${kicker("완성")} 직선·반직선·선분, 이제 기호만 봐도 훤해요`;
    helper.innerHTML = "곧은 선 삼형제 완성! 이름은 셋, 차이는 딱 하나, <b>어디까지 뻗는가</b>예요.";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  askTrio();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
