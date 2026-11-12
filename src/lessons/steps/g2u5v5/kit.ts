// 중2 Ⅴ v5 랩의 공용 도구(2026-11-12). 뼈대는 bvFrame을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   g5Lab     뼈대 + 타이머 + 정리 묶음 + 판정(judge) + 끝맺음(finish)
//   g5Svg     무대(346×230)에 놓는 SVG 한 장. set(html)로 통째로 다시 그린다(움직임은 CSS와 setTimeout만)
//   그림 조각  상추 모종(lettuce), 투명 용기와 센서(jar), 전등(lamp), 시간 그래프(timeGraph), 기체 알갱이(gasDot)
//   조작 부품  줄(row), 단추(chip), 수 조절(stepper), 무대 글(cap), 알림(toast)
// 색은 P 팔레트 하나에서 뽑는다(산소 하늘색, 이산화 탄소 회보라, 녹말 남보라, 설탕 앰버, 에너지 노랑). 좌표는 전부 계산으로 놓는다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvBtn, bvFrame, bvTimers, bvTween, type BvChoice, type BvFrame, type BvTimers } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;

export const P = {
  o2: "#7CC8FF",
  co2: "#BBA8F5",
  starch: "#6C6CF0",
  sugar: "#F5B544",
  energy: "#FFD43B",
  leaf: "#3FA35B",
  leafHi: "#86D68F",
  leafDark: "#1F6B3A",
  water: "#5AB0F2",
  glass: "#9CB4D6",
  text: "#C6D3E6",
  dim: "#8CA2C0",
  soil: "#6B4A32",
  bad: "#FF8A94",
};

export interface G5Step {
  title: string;
  cta?: string;
}

export interface G5Lab {
  f: BvFrame;
  tm: BvTimers;
  api: StepAPI;
  host: HTMLElement;
  onCleanup: (fn: () => void) => void;
  cleanup: () => void;
  /** 판정 질문. 틀린 적이 있으면 기록해 두었다가 finish에서 한 번 채점한다. */
  judge: (q: string, choices: BvChoice[], why: string, next: () => void) => void;
  /** 조작에서 어긋난 횟수를 센다(실패한 시도). */
  slip: () => void;
  finish: (html: string) => void;
  finished: () => boolean;
}

export function g5Lab(host: HTMLElement, api: StepAPI, s: G5Step, o: { steps: number; cls: string; wait: string }): G5Lab {
  host.classList.add("g2u5x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u5x-stage ${o.cls}`, qCls: "g2u5x-q", api });
  const tm = bvTimers();
  const fns: Array<() => void> = [];
  let done = false;
  let wrong = 0;
  api.setCTA(o.wait, { enabled: false });
  return {
    f,
    tm,
    api,
    host,
    onCleanup: (fn) => fns.push(fn),
    cleanup: () => {
      tm.clear();
      fns.splice(0).forEach((fn) => fn());
    },
    judge(q, choices, why, next) {
      host.dataset.g5Phase = "ask";
      f.slot.ask(
        q,
        choices,
        (ok) => {
          if (!ok) wrong += 1;
          host.dataset.g5Phase = ok ? "right" : "wrong";
        },
        { why, onNext: next },
      );
    },
    slip: () => {
      wrong += 1;
    },
    finish(html) {
      if (done) return;
      done = true;
      host.dataset.g5Phase = "done";
      f.pips(o.steps);
      f.say("잘했어요. <b>알게 된 것</b>을 읽고 다음으로 넘어가요.");
      f.slot.conclude(html);
      haptic(HAPTIC.ctaUnlock);
      api.recordQuiz(wrong === 0);
      api.enableCTA(s.cta ?? "다음");
    },
    finished: () => done,
  };
}

// ── 무대 ────────────────────────────────────────────────────────────
export interface G5Svg {
  el: SVGSVGElement;
  set: (html: string) => void;
}
export function g5Svg(lab: G5Lab, aria: string): G5Svg {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${SW} ${SH}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", aria);
  lab.f.stage.appendChild(svg);
  return { el: svg, set: (html) => (svg.innerHTML = html) };
}

/** 무대 위에 얹는 글 한 줄(왼쪽 위, 12.5px). */
export function cap(lab: G5Lab, cls = ""): HTMLElement {
  const c = el("div", { class: `g2u5x-cap ${cls}` });
  lab.f.stage.appendChild(c);
  return c;
}

/** 무대 가운데에 잠깐 뜨는 알림. */
export function toast(lab: G5Lab, text: string, bad = false): void {
  lab.f.stage.querySelector(".g2u5x-toast")?.remove();
  const t = el("div", { class: `g2u5x-toast${bad ? " bad" : ""}`, text });
  lab.f.stage.appendChild(t);
  lab.tm.later(() => t.remove(), 1900);
}

/** 무대 글자(SVG). 12px 이상만 쓴다. */
export const txt = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number; cls?: string } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 12.5}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? P.text}"${o.cls ? ` class="${o.cls}"` : ""}>${s}</text>`;

/** 둥근 이름표(글자 뒤에 어두운 바탕). */
export function tag(x: number, y: number, s: string, o: { fill?: string; bg?: string; size?: number } = {}): string {
  const size = o.size ?? 12.5;
  const w = s.length * size * 0.92 + 14;
  return `<g><rect x="${x - w / 2}" y="${y - size - 3}" width="${w}" height="${size + 10}" rx="${(size + 10) / 2}" fill="${o.bg ?? "#22324D"}" stroke="#3A4D6E"/>${txt(x, y + 1, s, { size, fill: o.fill ?? "#E8EEF9" })}</g>`;
}

// ── 그림 조각(어두운 무대용 SVG 문자열) ──────────────────────────────
/** 상추 잎 한 장(밑동 x,y에서 각도 a로 뻗는다). */
function leafShape(x: number, y: number, len: number, wid: number, a: number, fill: string, edge: string): string {
  return `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 C ${-wid} ${-len * 0.35}, ${-wid * 0.9} ${-len * 0.95}, 0 ${-len} C ${wid * 0.9} ${-len * 0.95}, ${wid} ${-len * 0.35}, 0 0 Z" fill="${fill}" stroke="${edge}" stroke-width="1.3"/><line x1="0" y1="-2" x2="0" y2="${-len * 0.82}" stroke="${edge}" stroke-width="1" opacity=".55"/></g>`;
}
/** 화분에 심은 상추 모종. (x, y)는 화분 바닥 가운데, s는 배율. pale이면 시든 색. */
export function lettuce(x: number, y: number, s = 1, o: { pale?: boolean; droop?: number } = {}): string {
  const fill = o.pale ? "#9DB38A" : P.leaf;
  const hi = o.pale ? "#BFCFA8" : "#58BD6E";
  const edge = o.pale ? "#5E7350" : P.leafDark;
  const d = o.droop ?? 0;
  const top = y - 26 * s;
  const leaves = [
    leafShape(x, top, 30 * s, 12 * s, -58 - d * 30, fill, edge),
    leafShape(x, top, 30 * s, 12 * s, 58 + d * 30, fill, edge),
    leafShape(x, top, 36 * s, 13 * s, -26 - d * 26, hi, edge),
    leafShape(x, top, 36 * s, 13 * s, 26 + d * 26, hi, edge),
    leafShape(x, top, 38 * s, 12 * s, 0 + d * 8, fill, edge),
  ].join("");
  const pot = `<path d="M${x - 17 * s} ${y - 26 * s} L${x + 17 * s} ${y - 26 * s} L${x + 13 * s} ${y} L${x - 13 * s} ${y} Z" fill="#B9774A" stroke="#7A4826" stroke-width="1.3"/><rect x="${x - 19 * s}" y="${y - 30 * s}" width="${38 * s}" height="${7 * s}" rx="2" fill="#CC8A5A" stroke="#7A4826" stroke-width="1.2"/>`;
  return `<g class="g2u5x-lettuce">${leaves}${pot}</g>`;
}

/** 센서를 꽂은 투명 용기. (x, y)는 왼쪽 위, 몸통은 w×h. lid가 false면 뚜껑이 옆에 내려져 있다. foil이면 알루미늄박으로 감싼다. */
export function jar(x: number, y: number, w: number, h: number, o: { lid?: boolean; foil?: boolean; inside?: string } = {}): string {
  const lid = o.lid !== false;
  const body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="rgba(160,200,255,.07)" stroke="${P.glass}" stroke-width="2"/><line x1="${x + 7}" y1="${y + 10}" x2="${x + 7}" y2="${y + h - 14}" stroke="#DCEBFF" stroke-width="2" opacity=".25" stroke-linecap="round"/>`;
  // 센서 머리의 색이 오른쪽 그래프의 선 색과 같다(회보라 = 이산화 탄소, 하늘색 = 산소). 글자는 넣지 않는다.
  const probe = (px: number, col: string): string =>
    `<rect x="${px - 3}" y="${y - 2}" width="6" height="26" rx="2" fill="#44546E" stroke="#8FA3BC" stroke-width="1"/><rect x="${px - 12}" y="${y - 20}" width="24" height="16" rx="5" fill="${col}" stroke="#16233A" stroke-width="1.2"/><circle cx="${px}" cy="${y - 12}" r="3" fill="#16233A" opacity=".55"/>`;
  const lidOn = `<rect x="${x - 4}" y="${y - 5}" width="${w + 8}" height="9" rx="4" fill="#3A4D6E" stroke="${P.glass}" stroke-width="1.4"/>${probe(x + w * 0.3, P.co2)}${probe(x + w * 0.7, P.o2)}`;
  const lidOff = `<g opacity=".8"><rect x="${x + w + 8}" y="${y + h - 9}" width="${w * 0.8}" height="9" rx="4" fill="#3A4D6E" stroke="${P.glass}" stroke-width="1.4"/></g>`;
  const foil = o.foil
    ? `<rect x="${x - 3}" y="${y + 4}" width="${w + 6}" height="${h - 2}" rx="9" fill="#AEB8C6" stroke="#E6ECF4" stroke-width="1.4" opacity=".93"/>${Array.from({ length: 7 }, (_, i) => `<line x1="${x + 6 + i * (w / 7)}" y1="${y + 12 + ((i * 13) % 20)}" x2="${x + 14 + i * (w / 7)}" y2="${y + h - 12 - ((i * 7) % 24)}" stroke="#7C8796" stroke-width="1" opacity=".7"/>`).join("")}`
    : "";
  return `<g class="g2u5x-jar">${o.inside ?? ""}${body}${foil}${lid ? lidOn : lidOff}</g>`;
}

/** 발광 다이오드 전등(아래를 비춘다). (x, y)는 전등 머리의 가운데. */
export function lamp(x: number, y: number, on: boolean, len = 30): string {
  const rays = on ? [-0.5, 0, 0.5].map((k) => `<line x1="${x + k * 14}" y1="${y + 9}" x2="${x + k * 30}" y2="${y + 9 + len}" stroke="${P.energy}" stroke-width="2.4" stroke-linecap="round" opacity=".75" class="g2u5x-ray"/>`).join("") : "";
  return `<g>${rays}<rect x="${x - 15}" y="${y - 6}" width="30" height="12" rx="5" fill="${on ? "#FFE58A" : "#4A5870"}" stroke="${on ? "#B8860B" : "#77869E"}" stroke-width="1.4"/><rect x="${x - 3}" y="${y - 13}" width="6" height="8" fill="#77869E"/></g>`;
}

/** 시간에 따른 농도 그래프. series의 값은 0~1(0.5가 처음 농도). upto는 0~1(그려진 만큼, 선마다 따로 줄 수 있다). */
export interface Series {
  v: number[];
  color: string;
  dash?: boolean;
  upto?: number;
}
export function timeGraph(x: number, y: number, w: number, h: number, title: string, series: Series[], titleColor = "#E8EEF9"): string {
  const px = (i: number, n: number): number => x + 8 + ((w - 14) * i) / (n - 1);
  const py = (v: number): number => y + h - 8 - (h - 30) * v;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#101D33" stroke="#263B5C"/>`;
  out += txt(x + 8, y + 15, title, { anchor: "start", size: 12, fill: titleColor });
  out += txt(x + w - 6, y + 15, "10분", { anchor: "end", size: 12, fill: P.dim });
  out += `<line x1="${x + 8}" y1="${py(0.5)}" x2="${x + w - 6}" y2="${py(0.5)}" stroke="#3B5273" stroke-dasharray="3 4"/>`;
  out += `<line x1="${x + 8}" y1="${y + 22}" x2="${x + 8}" y2="${y + h - 8}" stroke="#55698A"/><line x1="${x + 8}" y1="${y + h - 8}" x2="${x + w - 6}" y2="${y + h - 8}" stroke="#55698A"/>`;
  series.forEach((s) => {
    const n = s.v.length;
    const cut = Math.max(0, Math.round((n - 1) * (s.upto ?? 1)));
    if (cut < 1) return;
    const pts = s.v.slice(0, cut + 1).map((v, i) => `${px(i, n).toFixed(1)},${py(v).toFixed(1)}`);
    out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"${s.dash ? ` stroke-dasharray="5 4"` : ""}/>`;
  });
  return out;
}
/** 선의 뜻을 알려 주는 범례 한 줄(왼쪽부터 차례로). */
export function legend(x: number, y: number, items: { name: string; color: string; dash?: boolean }[]): string {
  let cx = x;
  let out = "";
  items.forEach((it) => {
    out += `<line x1="${cx}" y1="${y - 4}" x2="${cx + 16}" y2="${y - 4}" stroke="${it.color}" stroke-width="3" stroke-linecap="round"${it.dash ? ` stroke-dasharray="5 4"` : ""}/>`;
    out += txt(cx + 20, y, it.name, { anchor: "start", size: 12, fill: "#E8EEF9" });
    cx += 20 + it.name.length * 11.2 + 12;
  });
  return out;
}
/** 처음 농도 0.5에서 끝 농도 end까지 가는 완만한 곡선 값 11개(0~10분). */
export const ramp = (end: number): number[] => Array.from({ length: 11 }, (_, i) => 0.5 + (end - 0.5) * (1 - Math.pow(1 - i / 10, 1.6)));

/** 기체 알갱이 하나(산소는 하늘색, 이산화 탄소는 회보라). */
export const gasDot = (x: number, y: number, kind: "o2" | "co2", r = 5.5, cls = ""): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${kind === "o2" ? P.o2 : P.co2}" stroke="${kind === "o2" ? "#2F6FA8" : "#6A55B8"}" stroke-width="1.2"${cls ? ` class="${cls}"` : ""}/>`;

/** 화살표(직선). */
export function arrow(x0: number, y0: number, x1: number, y1: number, color: string, w = 2.6, cls = ""): string {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const hx = (d: number, s: number): string => `${(x1 - Math.cos(a) * 9 + Math.cos(a + Math.PI / 2) * s * d).toFixed(1)},${(y1 - Math.sin(a) * 9 + Math.sin(a + Math.PI / 2) * s * d).toFixed(1)}`;
  return `<g${cls ? ` class="${cls}"` : ""}><line x1="${x0}" y1="${y0}" x2="${(x1 - Math.cos(a) * 6).toFixed(1)}" y2="${(y1 - Math.sin(a) * 6).toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x1},${y1} ${hx(1, 5)} ${hx(-1, 5)}" fill="${color}"/></g>`;
}

// ── 조작 부품 ───────────────────────────────────────────────────────
/** 버튼 여러 개를 한 줄에 고르게 놓는다. */
export function row(...nodes: HTMLElement[]): HTMLElement {
  const r = el("div", { class: "g2u5x-row" }, ...nodes);
  r.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return r;
}

/** 작은 단추(50px). 이름과 둘째 줄(상태). on()으로 켜진 모습, done()으로 해 본 표시. */
export interface G5Chip {
  el: HTMLButtonElement;
  on: (v: boolean) => void;
  sub: (t: string) => void;
  done: () => void;
  lock: (v: boolean) => void;
}
export function chip(key: string, name: string, sub = "", onTap?: () => void): G5Chip {
  const subEl = el("i", { text: sub });
  const b = el("button", { class: "g2u5x-chipbtn", attrs: { type: "button" } }, el("b", { text: name }), subEl) as HTMLButtonElement;
  b.dataset.k = key;
  if (!sub) subEl.hidden = true;
  if (onTap) b.addEventListener("click", onTap);
  return {
    el: b,
    on: (v) => b.classList.toggle("on", v),
    sub: (t) => {
      subEl.textContent = t;
      subEl.hidden = !t;
    },
    done: () => b.classList.add("done"),
    lock: (v) => (b.disabled = v),
  };
}

/** 수 조절: 이름표, 빼기, 값, 더하기(버튼은 50px). */
export interface G5Stepper {
  el: HTMLElement;
  set: (v: string) => void;
  lock: (v: boolean) => void;
}
export function stepper(label: string, key: string, onStep: (d: number) => void): G5Stepper {
  const val = el("b", { class: "g2u5x-st-v", text: "" });
  const mk = (d: number): HTMLButtonElement => {
    const b = el("button", { class: "g2u5x-st-b", text: d < 0 ? "−" : "+", attrs: { type: "button", "aria-label": `${label} ${d < 0 ? "한 단계 낮추기" : "한 단계 높이기"}` } }) as HTMLButtonElement;
    b.dataset.k = `${key}${d < 0 ? "-" : "+"}`;
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      onStep(d);
    });
    return b;
  };
  const minus = mk(-1);
  const plus = mk(1);
  return {
    el: el("div", { class: "g2u5x-st" }, el("span", { class: "g2u5x-st-l", html: label }), minus, val, plus),
    set: (v) => (val.textContent = v),
    lock: (v) => {
      minus.disabled = v;
      plus.disabled = v;
    },
  };
}

export { bvBtn, bvTween };
export const tap = (): void => haptic(HAPTIC.tap);
export const good = (): void => haptic(HAPTIC.correct);
export const bad = (): void => haptic(HAPTIC.wrong);
