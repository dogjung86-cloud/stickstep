// 중2 Ⅴ v5 랩의 공용 도구(2026-11-12). 뼈대는 bvFrame을 그대로 쓰고 이 단원에 필요한 것만 얹는다.
//   g5Lab     뼈대 + 타이머 + 정리 묶음 + 판정(judge) + 끝맺음(finish)
//   그림     시간 그래프(timeGraph), 범례(legend), 화살표(arrow), 무대 글(txt, tag). 식물, 기구, 입자, 세포 그림은 ./art와 ./microArt(2026-11-15 다시 그림)
//            무대는 ./art의 g5Layers(층으로 나눈 SVG, 바뀐 층만 갈아 끼운다). 움직임은 CSS와 setTimeout만.
//   조작 부품  줄(row), 단추(chip), 수 조절(stepper), 알림(toast)
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

/** tall: 도움말에 세 줄 글이 있는 랩은 처음부터 세 줄 상자를 잡는다(bvFrame의 tall, 랩 도중에 무대가 밀리지 않게). */
export function g5Lab(host: HTMLElement, api: StepAPI, s: G5Step, o: { steps: number; cls: string; wait: string; tall?: boolean }): G5Lab {
  host.classList.add("g2u5x-step");
  const f = bvFrame(host, { title: s.title, steps: o.steps, cls: `g2u5x-stage ${o.cls}`, qCls: "g2u5x-q", api, tall: o.tall });
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
      f.say("결과를 모두 확인했어요! 아래 핵심 정리를 읽고 다음으로 넘어가 볼까요?");
      f.slot.conclude(html);
      haptic(HAPTIC.ctaUnlock);
      api.recordQuiz(wrong === 0);
      api.enableCTA(s.cta ?? "다음");
    },
    finished: () => done,
  };
}

// ── 무대 위 글과 알림 ──────────────────────────────────────────────
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

// ── 그래프와 기호 ───────────────────────────────────────────────────
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
  // 측정기 화면처럼: 짙은 바탕, 2분마다 세로 눈금, 처음 농도의 점선, 선 아래의 옅은 빛(2026-11-15 다듬음)
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#0E1A2E" stroke="#2A4266"/>`;
  out += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="20" rx="8" fill="#14233C"/>`;
  out += txt(x + 8, y + 15, title, { anchor: "start", size: 12, fill: titleColor });
  out += txt(x + w - 6, y + 15, "10분 동안", { anchor: "end", size: 12, fill: P.dim });
  for (let k = 1; k < 5; k++) {
    const gx = x + 8 + ((w - 14) * k) / 5;
    out += `<line x1="${gx.toFixed(1)}" y1="${y + 24}" x2="${gx.toFixed(1)}" y2="${y + h - 8}" stroke="#1E3150" stroke-width="1"/>`;
  }
  [0.2, 0.8].forEach((v) => (out += `<line x1="${x + 8}" y1="${py(v).toFixed(1)}" x2="${x + w - 6}" y2="${py(v).toFixed(1)}" stroke="#1E3150" stroke-width="1"/>`));
  out += `<line x1="${x + 8}" y1="${py(0.5)}" x2="${x + w - 6}" y2="${py(0.5)}" stroke="#3B5273" stroke-dasharray="3 4"/>`;
  out += `<line x1="${x + 8}" y1="${y + 22}" x2="${x + 8}" y2="${y + h - 8}" stroke="#55698A"/><line x1="${x + 8}" y1="${y + h - 8}" x2="${x + w - 6}" y2="${y + h - 8}" stroke="#55698A"/>`;
  series.forEach((s) => {
    const n = s.v.length;
    const cut = Math.max(0, Math.round((n - 1) * (s.upto ?? 1)));
    if (cut < 1) return;
    const pts = s.v.slice(0, cut + 1).map((v, i) => `${px(i, n).toFixed(1)},${py(v).toFixed(1)}`);
    if (!s.dash) out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>`;
    out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"${s.dash ? ` stroke-dasharray="5 4"` : ""}/>`;
    const last = pts[pts.length - 1].split(",");
    out += `<circle cx="${last[0]}" cy="${last[1]}" r="3" fill="${s.color}" stroke="#0E1A2E" stroke-width="1.2"/>`;
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
