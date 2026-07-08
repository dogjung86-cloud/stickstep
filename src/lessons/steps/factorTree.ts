// factorTree — 소인수분해 인수 트리(L3 기함 랩).
// 합성수 노드를 탭 → 인수 쌍을 골라 두 갈래로 가른다. 소수 잎은 초록으로 잠긴다.
// 미션: ① 60 완전 분해 ② 60을 "다른 첫 갈래"로 다시(결과 유일성 체험) ③ 90 분해.
// rAF 없음 — 상태 변경마다 SVG를 다시 그리고 CSS로만 모션.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TreeStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Node {
  v: number;
  x: number; // viewBox 좌표
  y: number;
  depth: number;
  spread: number;
  kids: [Node, Node] | null;
}

const W = 360;
const H = 292;
const DY = [36, 106, 176, 246];

const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

/** 1 제외 인수 쌍 목록 (a ≤ b). */
const pairsOf = (v: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let a = 2; a * a <= v; a++) if (v % a === 0) out.push([a, v / a]);
  return out;
};

export const factorTree: StepRenderer = (host, step, api) => {
  const s = step as unknown as TreeStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "t60", label: "60 분해", sub: "끝까지" },
    { id: "path2", label: "다른 길", sub: "결과는?" },
    { id: "t90", label: "90 분해", sub: "새 도전" },
  ]);
  const board = mboard(0);
  const toast = mtoast(board);
  const stage = el("div", { class: "ft-stage" });
  const result = el("div", { class: "ft-result" });
  board.append(stage, result);
  const helper = el("div", { class: "helper", html: "<b>60</b>을 탭해서 두 수의 곱으로 갈라 보세요 — 어떤 갈래든 좋아요." });
  host.append(goals.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let root: Node = mkRoot(60);
  let mission: "t60" | "path2" | "t90" = "t60";
  let firstSplit60: string | null = null; // "2×30" — 두 번째 길에서 비활성화
  let picker: HTMLElement | null = null;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  function mkRoot(v: number): Node {
    return { v, x: W / 2, y: DY[0], depth: 0, spread: 88, kids: null };
  }

  function leaves(n: Node, acc: number[] = []): number[] {
    if (!n.kids) {
      acc.push(n.v);
      return acc;
    }
    leaves(n.kids[0], acc);
    leaves(n.kids[1], acc);
    return acc;
  }

  function allPrime(n: Node): boolean {
    return leaves(n).every(isPrime);
  }

  function nodes(n: Node, acc: Node[] = []): Node[] {
    acc.push(n);
    if (n.kids) {
      nodes(n.kids[0], acc);
      nodes(n.kids[1], acc);
    }
    return acc;
  }

  function draw(): void {
    closePicker();
    const all = nodes(root);
    let lines = "";
    let circles = "";
    for (const n of all) {
      if (n.kids) {
        for (const k of n.kids) {
          lines += `<line x1="${n.x}" y1="${n.y + 20}" x2="${k.x}" y2="${k.y - 20}" stroke="#A8BCCB" stroke-width="2.4" stroke-linecap="round"/>`;
        }
      }
      const prime = isPrime(n.v);
      const leaf = !n.kids;
      const fill = prime ? "url(#ftPrime)" : leaf ? "url(#ftComp)" : "#EDF3F8";
      const stroke = prime ? "#0C8A5E" : leaf ? "#0E7A92" : "#B9C8D4";
      const txt = prime ? "#046648" : leaf ? "#075E74" : "#8698A8";
      const cls = leaf && !prime ? "ft-node" : "";
      circles +=
        `<g class="${cls}" data-v="${n.v}" data-x="${n.x}" data-y="${n.y}">` +
        `<circle cx="${n.x}" cy="${n.y}" r="21" fill="${fill}" stroke="${stroke}" stroke-width="${leaf ? 2.2 : 1.6}"/>` +
        (prime ? `<circle cx="${n.x}" cy="${n.y}" r="26" fill="none" stroke="#26B87E" stroke-width="1.4" opacity=".45"/>` : "") +
        `<text x="${n.x}" y="${n.y + 5.5}" text-anchor="middle" font-size="${n.v >= 100 ? 13 : 15}" font-weight="800" fill="${txt}">${n.v}</text>` +
        `</g>`;
    }
    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<defs>` +
      `<radialGradient id="ftPrime" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#D9F8EA"/><stop offset="1" stop-color="#9FE8C8"/></radialGradient>` +
      `<radialGradient id="ftComp" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#E4F7FB"/><stop offset="1" stop-color="#AEE4F0"/></radialGradient>` +
      `</defs>${lines}${circles}</svg>`;
    // 결과 바
    const ls = leaves(root).sort((a, b) => a - b);
    if (allPrime(root)) {
      const flat = ls.join("×");
      const expo = expoForm(ls);
      result.innerHTML = mfmt(`${root.v} = ${flat}`) + (expo !== flat ? `&nbsp;${mfmt(`= ${expo}`)}` : "");
    } else {
      result.innerHTML = "";
    }
  }

  /** [2,2,3,5] → "2^2×3×5" */
  function expoForm(ls: number[]): string {
    const cnt = new Map<number, number>();
    ls.forEach((v) => cnt.set(v, (cnt.get(v) ?? 0) + 1));
    return [...cnt.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([b, e]) => (e > 1 ? `${b}^${e}` : `${b}`))
      .join("×");
  }

  function closePicker(): void {
    picker?.remove();
    picker = null;
  }

  function openPicker(n: Node): void {
    closePicker();
    const scale = stage.clientWidth ? stage.clientWidth / W : 1;
    picker = el("div", { class: "ft-picker", style: `top:${(n.y + 30) * scale}px` });
    const pairs = pairsOf(n.v);
    for (const [a, b] of pairs) {
      const key = `${a}×${b}`;
      const blocked = mission === "path2" && n.depth === 0 && key === firstSplit60;
      const chip = el("button", {
        class: "ft-pick",
        text: blocked ? `${key} (아까 간 길)` : key,
        attrs: { type: "button", ...(blocked ? { disabled: "true", style: "opacity:.4" } : {}) },
      });
      chip.addEventListener("click", () => {
        haptic(HAPTIC.select);
        split(n, a, b);
      });
      picker.appendChild(chip);
    }
    stage.appendChild(picker);
  }

  function split(n: Node, a: number, b: number): void {
    if (n.depth === 0) {
      const key = `${a}×${b}`;
      if (mission === "t60") firstSplit60 = key;
    }
    const spread = n.spread;
    n.kids = [
      { v: a, x: n.x - spread, y: DY[n.depth + 1], depth: n.depth + 1, spread: Math.max(22, spread * 0.5), kids: null },
      { v: b, x: n.x + spread, y: DY[n.depth + 1], depth: n.depth + 1, spread: Math.max(22, spread * 0.5), kids: null },
    ];
    draw();
    const newPrimes = [a, b].filter(isPrime).length;
    if (newPrimes) haptic(HAPTIC.tap);
    if (allPrime(root)) later(missionDone, 420);
    else helper.innerHTML = "아직 <b>하늘색 수</b>가 남아 있어요 — 소수(초록)가 될 때까지 계속 갈라요.";
  }

  function missionDone(): void {
    const ls = leaves(root).sort((a, b) => a - b);
    const expo = expoForm(ls);
    haptic(HAPTIC.correct);
    if (mission === "t60") {
      goals.on("t60", "2²×3×5!");
      toast("60 완전 분해!");
      helper.innerHTML =
        `모든 잎이 소수예요: <b>60 = ${ls.join("×")}</b>. 작은 소인수부터 쓰고 같은 수는 거듭제곱으로 — <b>${expo.replace("^2", "²")}</b>. ` +
        "그런데… 처음에 <b>다른 갈래</b>로 갈랐어도 결과가 같았을까요?";
      mission = "path2";
      later(() => {
        root = mkRoot(60);
        draw();
        helper.innerHTML = `이번엔 <b>${firstSplit60}가 아닌 다른 갈래</b>로 60을 다시 갈라 보세요.`;
        toast("같은 60, 다른 길!");
      }, 2200);
    } else if (mission === "path2") {
      goals.on("path2", "똑같다!");
      toast("길이 달라도 2×2×3×5!");
      helper.innerHTML =
        "첫 갈래가 달라도 잎은 언제나 <b>2, 2, 3, 5</b> — 소인수분해 한 결과는 <b>오직 한 가지</b>예요(곱하는 순서만 다를 뿐). " +
        "마지막 도전, <b>90</b>도 분해해 볼까요?";
      mission = "t90";
      later(() => {
        root = mkRoot(90);
        draw();
        helper.innerHTML = "<b>90</b>을 탭해서 갈라 보세요.";
      }, 2200);
    } else {
      goals.on("t90", "2×3²×5!");
      helper.innerHTML =
        `<b>90 = ${ls.join("×")} = ${expo.replace("^2", "²")}</b>. ` +
        "이렇게 1보다 큰 자연수를 <b>소인수만의 곱</b>으로 나타내는 것이 소인수분해예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  stage.addEventListener("click", (e) => {
    const g = (e.target as HTMLElement).closest("g[data-v]") as SVGGElement | null;
    if (!g) return;
    const v = Number(g.dataset.v);
    haptic(HAPTIC.tap);
    if (isPrime(v)) {
      toast(`${v}는 소수 — 더는 쪼갤 수 없어요!`);
      return;
    }
    // 해당 노드(잎만 탭 가능 — .ft-node 클래스가 잎에만 붙는다)
    const target = nodes(root).find((n) => !n.kids && n.v === v && String(n.x) === g.dataset.x && String(n.y) === g.dataset.y);
    if (target) openPicker(target);
  });

  draw();
  api.setCTA("세 미션을 끝내면 열려요", { enabled: false });
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    closePicker();
  };
};
