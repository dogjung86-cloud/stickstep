// [중2 Ⅰ v5] 가열하며 온도를 재는 랩 셋. 무대와 진행은 같고 무엇을 비교하는지가 다르다.
//   g2u1MeltLab (g2u1l5) 「양이 달라지면 녹는 온도도 달라질까요?」 책의 해 보기: 로르산과 팔미트산 1 g, 2 g의 가열 곡선.
//   g2u1BoilLab (g2u1l5) 「끓는 온도는 무엇에 따라 달라질까요?」 책의 디지털 해 보기(종류, 양)와 본문의 압력솥.
//   g2u1SaltLab (g2u1l6) 「소금물도 100 ℃에서 온도가 일정할까요?」 책의 그림: 물과 소금물의 가열 곡선.
// 학생이 정하는 것: 무엇을 어떤 차례로 가열할지. 가열은 꾹 누르는 동안만 진행되고 곡선이 그 자리에서 그려져 앞의 곡선과 겹쳐 보인다.
// 통찰: 상태가 변하는 동안의 온도는 양과 관계없이 같고 물질마다 다르다 / 끓는점은 압력에 따라 달라진다 / 혼합물은 끓는 동안 온도가 일정하지 않다.
// 수치: 녹는점(로르산 43.8, 팔미트산 62.5 ℃), 끓는점(물 100, 에탄올 78 ℃, 압력솥 속의 물 약 120 ℃), 소금물의 끓는 온도(소금 10 g에 약 102 ℃, 30 g에 약 105 ℃에서 시작)는 자연값이고
//       가열 시간은 이 랩에서 정했다.
// 곡선 읽기(2026-11-15 그래픽 감사): 판정 때는 조작 칸의 카드가 걷히므로 곡선마다 이름표(tag)를 곡선 옆에 남긴다. 같은 물질의 2배 양은
//   색 농도가 아니라 점선으로 가른다. 이름표와 멈춘 온도 값의 자리는 네 곡선을 모두 그린 모습에서 겹치지 않게 손으로 정했다(좌표 계산은 아래 각 랩 주석).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards } from "../bio6/b6Lab";
import { P, bubbles, clamp, fx, g1Curve, g1Lab, g1Predict, heater, josa, plot, seeded, svgOpen, type G1Step } from "./g2u1Kit";

/** 곡선 이름표. (t, v) 자리에서 (dx, dy)만큼 옮긴 곳에 쓴다. */
interface Tag {
  text: string;
  t: number;
  v: number;
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
}
interface Judge {
  q: string;
  choices: { t: string; ok?: boolean }[];
  why: string;
}
interface Run {
  key: string;
  name: string;
  sub: string;
  color: string;
  f: (t: number) => number;
  /** 온도가 멈춘 값(그래프에 점선으로 남긴다). 없으면 남기지 않는다. */
  mark?: number;
  /** 멈춘 온도 값을 점선 아래에 쓴다(기본은 위). */
  markBelow?: boolean;
  done: string;
  say: string;
  state: (t: number, v: number) => string;
  bub: (t: number, v: number) => number;
  liq: string;
  /** 고체가 녹은 정도(0~1). 녹는점 랩만 쓴다. */
  melt?: (t: number) => number;
  /** 압력솥(냄비 무대에서 잠금 뚜껑, 추, 압력계를 그린다). */
  lid?: boolean;
  /** 같은 물질의 2배 양: 곡선을 점선으로. */
  dash?: boolean;
  /** 이 시간에 가열을 멈춘다(없으면 축의 끝까지). */
  tEnd?: number;
  /** 곡선 이름표(가열이 끝나면 그래프에 남는다). */
  tag?: Tag;
  /** 냄비 속 액체의 높이(px, 냄비 무대). */
  level?: number;
  /** 이 온도를 넘으면 도움말을 한 번 바꾼다(압력솥이 100 ℃를 넘어도 끓지 않을 때). */
  cross?: { at: number; say: string };
}
interface Cfg {
  cls: string;
  y0: number;
  y1: number;
  yt: number[];
  tMax: number;
  xt: number[];
  runs: Run[];
  cols: number;
  need: (done: Set<string>) => boolean;
  path: string[];
  intro: string;
  predict?: { q: string; choices: string[] };
  picked: (r: Run) => string;
  more: (done: Set<string>) => string;
  /** 판정. 함수면 해 본 것(done)에 맞춰 묻는다(녹는점 랩은 1 g과 2 g을 모두 그린 물질을 묻는다). */
  judge: Judge | ((done: Set<string>) => Judge);
  finish: string;
  tube?: boolean;
  /** 냄비 무대(뚜껑 없는 냄비와 압력솥). 없으면 유리 비커. */
  pot?: boolean;
  /** 그래프의 왼쪽 끝과 폭(기본 206, 128). */
  plotX?: number;
  plotW?: number;
  /** 멈춘 온도 점선의 무늬(기본 "4 3"). 곡선에 점선이 있는 랩은 점점이 옅게 해 곡선과 헷갈리지 않게 한다. */
  markDash?: string;
  /** 멈춘 온도가 세로축 눈금과 같으면 값을 다시 쓰지 않는다(곡선 이름표 옆에 같은 숫자가 겹쳐 읽히지 않게). */
  markSkipTicks?: boolean;
  /** 도움말에 세 줄이 되는 글이 있다(가열 결과 + 남은 것 안내). 처음부터 세 줄 상자를 잡는다. */
  tall?: boolean;
}

// 냄비 무대의 좌표(가운데 x=86, 바깥 바닥 y=193). 액체는 class="g2u1x-cv-liq"로 높이를 바꾼다.
const POT = { cx: 86, x0: 38, x1: 134, top: 112, bottom: 193 };
/** 냄비 속 액체(높이 lv px). 바닥 두 모서리만 냄비처럼 둥글다. */
const potLiq = (lv: number): string => {
  const b = POT.bottom - 2;
  const l = POT.x0 + 2.5;
  const r = POT.x1 - 2.5;
  return `M${l} ${fx(b - lv)} H${r} V${b - 8} a8 8 0 0 1 -8 8 H${l + 8} a8 8 0 0 1 -8 -8 Z`;
};
function potStage(): string {
  const { cx, x0, x1, top } = POT;
  const arrows = [56, 86, 116].map((x) => `<path d="M${x} 121 V144 M${x - 4} 139 L${x} 145 L${x + 4} 139" stroke="#A5D8FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  const wisps = [62, 86, 110].map((x) => `<path d="M${x} 106 q5 -6 0 -12 q-5 -6 0 -12" stroke="rgba(255,255,255,.45)" stroke-width="2.2" stroke-linecap="round"/>`).join("");
  return `
    <rect x="${x0 + 2}" y="${top}" width="${x1 - x0 - 4}" height="81" fill="rgba(210,225,245,.06)"/>
    <path class="g2u1x-cv-liq" d="${potLiq(30)}" fill="${P.water}" opacity=".45"/>
    <g class="g2u1x-cv-bub"></g>
    <g class="g2u1x-cv-vap"></g>
    <g class="g2u1x-cv-arw" opacity="0">${arrows}</g>
    <g class="g2u1x-cv-wisp" opacity="0">${wisps}</g>
    <path d="M${x0} ${top} V183 a10 10 0 0 0 10 10 H${x1 - 10} a10 10 0 0 0 10 -10 V${top}" stroke="#C8D2DE" stroke-width="2.8"/>
    <path d="M${x0 - 5} ${top} H${x1 + 5}" stroke="#C8D2DE" stroke-width="3.2" stroke-linecap="round"/>
    <g class="g2u1x-cv-pt">
      <rect x="${x0 - 16}" y="${top + 6}" width="16" height="8" rx="4" fill="#59657A" stroke="#8B9BB0" stroke-width="1.2"/>
      <rect x="${x1}" y="${top + 6}" width="16" height="8" rx="4" fill="#59657A" stroke="#8B9BB0" stroke-width="1.2"/>
    </g>
    <g class="g2u1x-cv-ck" opacity="0">
      <rect x="10" y="${top + 4}" width="28" height="8" rx="4" fill="#39455A" stroke="#8B9BB0" stroke-width="1.2"/>
      <rect x="${x1}" y="${top + 2}" width="14" height="8" rx="4" fill="#39455A" stroke="#8B9BB0" stroke-width="1.2"/>
      <path d="M${x0 - 5} ${top + 1} Q${cx} 95 ${x1 + 5} ${top + 1} Z" fill="#8B9BB0" stroke="#C8D2DE" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="8" y="${top - 8}" width="28" height="8" rx="4" fill="#39455A" stroke="#8B9BB0" stroke-width="1.2"/>
      <rect x="${cx - 3}" y="94" width="6" height="10" fill="#8B9BB0"/>
      <rect x="${cx - 9}" y="84" width="18" height="11" rx="5" fill="#C8D2DE" stroke="#8B9BB0" stroke-width="1.2"/>
      <circle cx="${cx}" cy="82" r="3" fill="#C8D2DE" stroke="#8B9BB0" stroke-width="1"/>
      <rect x="111" y="97" width="3" height="10" fill="#8B9BB0"/>
      <circle cx="112.5" cy="89" r="9" fill="#101A2C" stroke="#C8D2DE" stroke-width="1.6"/>
      <path d="M106.2 95.3 A9 9 0 1 1 118.8 95.3" stroke="rgba(255,255,255,.22)" stroke-width="1.4" fill="none"/>
      <path class="g2u1x-cv-ndl" d="M112.5 89 V82.5" stroke="${P.rose}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="112.5" cy="89" r="1.8" fill="${P.rose}"/>
      <text x="123" y="93" font-size="12" font-weight="700" fill="${P.dim}">압력</text>
    </g>`;
}

function curveLab(cfg: Cfg): StepRenderer {
  return (host, step, api) => {
    const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: `g2u1x-cv ${cfg.cls}`, tall: cfg.tall });
    const { f, tm } = lab;
    const rnd = seeded(17);
    const X = cfg.plotX ?? 206;
    const W = cfg.plotW ?? 128;
    const pl = plot({ x: X, y: 32, w: W, h: 148, x0: 0, x1: cfg.tMax, y0: cfg.y0, y1: cfg.y1, xl: "가열 시간(분)", yl: "온도(℃)", xt: cfg.xt, yt: cfg.yt });
    const tx = cfg.pot ? POT.cx : 90; // 위쪽 글(온도, 상태, 이름)의 가운데
    const ty = cfg.pot ? [30, 48, 66] : [34, 54, 74];
    const vessel = cfg.pot
      ? `${heater(26, 198, 120)}<rect class="g2u1x-cv-glow" x="40" y="193" width="92" height="5" rx="2.5" fill="${P.warm}" opacity="0"/>${potStage()}`
      : `${heater(30, 198, 120)}
      <rect class="g2u1x-cv-glow" x="42" y="193" width="96" height="5" rx="2.5" fill="${P.warm}" opacity="0"/>
      <rect class="g2u1x-cv-liq" x="43" y="112" width="94" height="79" rx="5" fill="${P.water}" opacity=".4"/>
      <g class="g2u1x-cv-bub"></g>
      ${cfg.tube ? `<rect class="g2u1x-cv-melted" x="80" y="140" width="20" height="38" rx="4" fill="#F7E7B0" opacity="0"/><rect class="g2u1x-cv-solid" x="80" y="140" width="20" height="38" rx="4" fill="#F4F7FB"/><path d="M77 84 V172 a13 13 0 0 0 26 0 V84 M73 84 h34" stroke="${P.glass}" stroke-width="2.2" stroke-linecap="round"/>` : ""}
      <path d="M40 104 V186 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 V104 M34 104 h112" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
      <g class="g2u1x-cv-lid" opacity="0"><rect x="34" y="94" width="112" height="12" rx="5" fill="#8B9BB0" stroke="#C8D2DE" stroke-width="1.4"/><rect x="82" y="82" width="16" height="13" rx="3" fill="#59657A" stroke="#C8D2DE" stroke-width="1.2"/></g>`;
    f.stage.innerHTML = `${svgOpen}
      ${pl.svg}
      <g class="g2u1x-cv-marks"></g><g class="g2u1x-cv-lines"></g><g class="g2u1x-cv-tags"></g>
      ${vessel}
      <text class="g2u1x-cv-temp" x="${tx}" y="${ty[0]}" text-anchor="middle" font-size="22" font-weight="800" fill="${P.text}"></text>
      <text class="g2u1x-cv-state" x="${tx}" y="${ty[1]}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.yellow}"></text>
      <text class="g2u1x-cv-name" x="${tx}" y="${ty[2]}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}"></text>
    </svg>`;
    const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
    const lines = q<SVGGElement>(".g2u1x-cv-lines");
    const marks = q<SVGGElement>(".g2u1x-cv-marks");
    const tags = q<SVGGElement>(".g2u1x-cv-tags");
    const liq = q<SVGElement>(".g2u1x-cv-liq");
    const bub = q<SVGGElement>(".g2u1x-cv-bub");
    const glow = q<SVGRectElement>(".g2u1x-cv-glow");
    const temp = q<SVGTextElement>(".g2u1x-cv-temp");
    const state = q<SVGTextElement>(".g2u1x-cv-state");
    const name = q<SVGTextElement>(".g2u1x-cv-name");
    const lid = f.stage.querySelector(".g2u1x-cv-lid");
    const solid = f.stage.querySelector(".g2u1x-cv-solid");
    const melted = f.stage.querySelector(".g2u1x-cv-melted");
    // 냄비 무대에만 있는 것
    const potPart = f.stage.querySelector(".g2u1x-cv-pt");
    const cooker = f.stage.querySelector(".g2u1x-cv-ck");
    const needle = f.stage.querySelector(".g2u1x-cv-ndl");
    const vap = f.stage.querySelector(".g2u1x-cv-vap");
    const arw = f.stage.querySelector(".g2u1x-cv-arw");
    const wisp = f.stage.querySelector(".g2u1x-cv-wisp");

    const done = new Set<string>();
    const marked = new Set<number>();
    let cur: Run | null = null;
    let lastBub = -1;
    let lastVap = -1;
    let crossed = false;
    const swatch = (r: Run): string =>
      `<svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#0B1524"/><path d="M6 24 L14 14 H22 L28 8" stroke="${r.color}" stroke-width="3" fill="none" stroke-linecap="${r.dash ? "butt" : "round"}" stroke-linejoin="round"${r.dash ? ` stroke-dasharray="4.5 3"` : ""}/></svg>`;
    const cards = cfg.runs.map((r) => bvCard("g2u1x-cv-card", { name: r.name, sub: r.sub, icon: swatch(r), key: r.key }));

    function show(r: Run, t: number): void {
      const v = r.f(t);
      temp.textContent = `${fx(v)} ℃`;
      state.textContent = r.state(t, v);
      name.textContent = r.name;
      liq.setAttribute("fill", r.liq);
      lid?.setAttribute("opacity", r.lid ? "1" : "0");
      const n = r.bub(t, v);
      if (cfg.pot) {
        const lv = r.level ?? 30;
        liq.setAttribute("d", potLiq(lv));
        cooker?.setAttribute("opacity", r.lid ? "1" : "0");
        potPart?.setAttribute("opacity", r.lid ? "0" : "1");
        // 압력솥: 데울수록 갇힌 수증기가 늘고 압력계 바늘과 물을 누르는 화살이 함께 커진다
        const k = r.lid ? clamp((v - 20) / 100) : 0;
        needle?.setAttribute("transform", `rotate(${fx(-110 + 220 * k)} 112.5 89)`);
        arw?.setAttribute("opacity", r.lid ? fx(0.25 + 0.75 * k, 2) : "0");
        const nv = r.lid ? Math.round(3 + 19 * k) : 0;
        if (vap && nv !== lastVap) {
          lastVap = nv;
          const r2 = seeded(41);
          let s = "";
          for (let i = 0; i < nv; i++) s += `<circle cx="${fx(46 + r2() * 80)}" cy="${fx(118 + r2() * (POT.bottom - lv - 124))}" r="1.9" fill="#DCE7F5" opacity=".75"/>`;
          vap.innerHTML = s;
        }
        wisp?.setAttribute("opacity", !r.lid && n >= 14 ? "1" : "0");
        if (n !== lastBub) {
          lastBub = n;
          // 기포는 액체 아래쪽 55%에서 생겨 수면 바로 밑까지만 떠오른다(얕은 냄비에서 기포가 공기 중에 뜨지 않게)
          bubbles(bub, n, POT.x0 + 10, POT.bottom - lv * 0.55, POT.x1 - POT.x0 - 20, lv * 0.55 - 4, rnd, lv * 0.45 - 2);
        }
      } else if (n !== lastBub) {
        lastBub = n;
        bubbles(bub, n, 48, 150, 84, 36, rnd);
      }
      if (solid && melted && r.melt) {
        const m = r.melt(t);
        solid.setAttribute("opacity", fx(1 - m, 2));
        melted.setAttribute("opacity", fx(m * 0.8, 2));
      }
    }
    function controls(btn?: HTMLButtonElement): void {
      const row = bvCards(cfg.cols, ...cards);
      if (btn) f.slot.setControls(row, btn);
      else f.slot.setControls(row);
    }
    function nextTodo(): void {
      const k = cfg.path.find((x) => !done.has(x));
      if (!k) return lab.todo();
      lab.todo(cur?.key === k ? ".g2u1x-hold" : `.g2u1x-cv-card[data-k='${k}']`);
    }
    /** 곡선 이름표. 어두운 테두리를 둘러 지나가는 선 위에서도 읽힌다. */
    const tagSvg = (r: Run, g: Tag): string =>
      `<text x="${fx(pl.px(g.t) + g.dx)}" y="${fx(pl.py(g.v) + g.dy)}" text-anchor="${g.anchor}" font-size="12" font-weight="800" fill="${r.color}" stroke="#0E1A2C" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${g.text}</text>`;
    cfg.runs.forEach((r, i) =>
      cards[i].el.addEventListener("click", () => {
        if (done.has(r.key)) return;
        haptic(HAPTIC.tap);
        cur = r;
        crossed = false;
        cards.forEach((c, j) => c.on(j === i));
        lastBub = -1;
        show(r, 0);
        f.say(cfg.picked(r));
        const btn = g1Curve(lab, pl, lines, {
          tMax: cfg.tMax,
          tEnd: r.tEnd,
          ms: 2600,
          f: r.f,
          color: r.color,
          dash: r.dash ? "6 4" : undefined,
          onTick: (t, v) => {
            glow.setAttribute("opacity", "1");
            show(r, t);
            if (r.cross && !crossed && v > r.cross.at) {
              crossed = true;
              f.say(r.cross.say);
            }
          },
          onEnd: () => {
            haptic(HAPTIC.correct);
            glow.setAttribute("opacity", "0");
            done.add(r.key);
            cards[i].done();
            cards[i].on(false);
            cards[i].el.disabled = true;
            cards[i].sub(r.done);
            if (r.mark !== undefined && !marked.has(r.mark)) {
              marked.add(r.mark);
              const y = pl.py(r.mark);
              marks.insertAdjacentHTML(
                "beforeend",
                `<path d="M${pl.px(0)} ${fx(y)} H${pl.px(cfg.tMax)}" stroke="${r.color}" stroke-width="1.2" stroke-dasharray="${cfg.markDash ?? "4 3"}" opacity=".8"/>${cfg.markSkipTicks && cfg.yt.includes(r.mark) ? "" : `<text x="${pl.px(cfg.tMax) - 2}" y="${fx(r.markBelow ? y + 14 : y - 4)}" text-anchor="end" font-size="12" font-weight="800" fill="${r.color}">${fx(r.mark)}</text>`}`,
              );
            }
            if (r.tag) tags.insertAdjacentHTML("beforeend", tagSvg(r, r.tag));
            cur = null;
            f.pips(Math.min(2, done.size));
            if (cfg.need(done)) {
              f.say(r.say);
              cards.forEach((c) => (c.el.disabled = true));
              controls();
              lab.todo();
              const j = typeof cfg.judge === "function" ? cfg.judge(done) : cfg.judge;
              tm.later(() => lab.judge(j.q, j.choices, j.why, () => lab.finish(cfg.finish)), 1300);
            } else {
              f.say(`${r.say} ${cfg.more(done)}`);
              controls();
              api.setCTA("다른 것도 가열해 비교해 보세요", { enabled: false });
              nextTodo();
            }
          },
        });
        controls(btn);
        api.setCTA("꾹 눌러 가열해 보세요", { enabled: false });
        nextTodo();
      }),
    );

    const start = (): void => {
      controls();
      f.say(cfg.intro);
      api.setCTA("가열할 것을 골라 보세요", { enabled: false });
      nextTodo();
    };
    temp.textContent = "";
    if (cfg.predict) {
      f.say(cfg.intro);
      g1Predict(lab, cfg.predict.q, cfg.predict.choices, start);
    } else start();
    return lab.cleanup;
  };
}

// ── 가열 곡선의 모형: t0 ℃에서 rate(℃/분)로 오르다가 stop ℃에서 hold분 동안 멈추고(drift만큼 조금씩 오른다) 다시 오른다 ──
const heat = (t0: number, rate: number, stop: number, hold: number, drift = 0, cap = 999) => (t: number): number => {
  const tA = (stop - t0) / rate;
  if (t <= tA) return t0 + rate * t;
  if (t <= tA + hold) return stop + drift * (t - tA);
  return Math.min(cap, stop + drift * hold + rate * 0.8 * (t - tA - hold));
};

// 1. 녹는점: 로르산과 팔미트산, 1 g과 2 g
// 다 녹은 뒤 8 ℃ 더 오르면 가열을 멈춘다(물중탕 온도에 막혀 생기던 두 번째 평평한 구간을 없앴다. 평평한 구간은 녹는 동안 하나뿐).
// 그래프 x 176~334(분당 15.8 px), y 20~80 ℃(℃당 2.47 px). 곡선 끝: 로르산 1 g (4.06분, 51.8 ℃), 2 g (7.20분, 51.8 ℃),
//   팔미트산 1 g (5.39분, 70.5 ℃), 2 g (9.28분, 70.5 ℃). 이름표는 끝의 오른쪽에(팔미트산 2 g만 끝이 무대 오른쪽 가장자리라 위에) 쓰고,
//   멈춘 온도 값은 점선 아래 오른쪽 끝에 쓴다(위에 쓰면 팔미트산 2 g이 다시 오르는 선이 값을 지나간다).
const MP = { la: 43.8, pa: 62.5 };
const meltRun = (key: string, sub: "la" | "pa", g: 1 | 2, color: string, at: Pick<Tag, "dx" | "dy" | "anchor">): Run => {
  const mp = MP[sub];
  const rate = g === 1 ? 14 : 9;
  const hold = g === 1 ? 2 : 4;
  const tA = (mp - 25) / rate;
  const top = mp + 8;
  const tEnd = tA + hold + (top - mp) / (rate * 0.8);
  const nm = sub === "la" ? "로르산" : "팔미트산";
  return {
    key,
    name: `${nm} ${g} g`,
    sub: "흰색 고체",
    color,
    f: heat(25, rate, mp, hold),
    tEnd,
    dash: g === 2,
    tag: { text: `${g} g`, t: tEnd, v: top, ...at },
    mark: mp,
    markBelow: true,
    done: `${fx(mp)} ℃에서 멈춤`,
    say: `${nm} ${g} g은 <b>${fx(mp)} ℃</b>에서 멈췄다가 다 녹은 뒤 다시 올랐어요.`,
    state: (t) => (t < tA ? "고체" : t <= tA + hold ? "녹는 중 (고체 + 액체)" : "액체"),
    bub: () => 0,
    liq: P.water,
    melt: (t) => Math.max(0, Math.min(1, (t - tA) / hold)),
  };
};
const RIGHT = { dx: 5, dy: 4, anchor: "start" } as const;
export const g2u1MeltLab = curveLab({
  cls: "g2u1x-cv-melt",
  tube: true,
  plotX: 176,
  plotW: 158,
  markDash: "2 4",
  y0: 20,
  y1: 80,
  yt: [20, 40, 60, 80],
  tMax: 10,
  xt: [5, 10],
  cols: 2,
  runs: [meltRun("la1", "la", 1, "#FF7EB0", RIGHT), meltRun("la2", "la", 2, "#FF7EB0", RIGHT), meltRun("pa1", "pa", 1, "#63E6BE", RIGHT), meltRun("pa2", "pa", 2, "#63E6BE", { dx: 0, dy: -8, anchor: "middle" })],
  need: (d) => ((d.has("la1") && d.has("la2")) || (d.has("pa1") && d.has("pa2"))) && (d.has("la1") || d.has("la2")) && (d.has("pa1") || d.has("pa2")),
  path: ["la1", "la2", "pa1"],
  intro: "흰색 고체 <b>로르산</b>과 <b>팔미트산</b>을 물중탕으로 가열해요. 가열할 것을 골라 보세요.",
  predict: { q: "같은 고체를 <b>2배</b> 넣고 가열하면 녹는 동안의 온도는?", choices: ["1 g일 때와 같다", "1 g일 때보다 높다", "1 g일 때보다 낮다"] },
  picked: (r) => `<b>${r.name}</b>을 시험관에 넣었어요. 버튼을 <b>꾹 눌러</b> 가열하며 온도를 지켜보세요.`,
  more: (d) => ((d.has("la1") || d.has("la2")) && (d.has("pa1") || d.has("pa2")) ? "같은 물질을 <b>양만 바꿔서</b>도 가열해 보세요." : d.size === 1 ? "<b>양</b>이나 <b>물질</b>을 바꿔 비교해 보세요." : "이번에는 <b>다른 물질</b>도 가열해 보세요."),
  // 1 g과 2 g을 모두 그린 물질을 묻는다(팔미트산 둘과 로르산 하나로 판정이 열리면 로르산 2 g 곡선이 없다).
  judge: (d) => {
    const la = d.has("la1") && d.has("la2");
    const [nm, mp] = la ? ["로르산", MP.la] : ["팔미트산", MP.pa];
    return {
      q: `${nm} 1 g과 2 g의 그래프에서 <b>같은 것</b>은?`,
      choices: [{ t: "온도가 일정하게 유지된 온도", ok: true }, { t: "온도가 일정하게 유지된 시간" }, { t: "모두 녹을 때까지 걸린 시간" }],
      why: `둘 다 <b>${fx(mp)} ℃</b>에서 멈췄어요. 2 g은 녹는 데 시간이 더 걸렸을 뿐이에요.`,
    };
  },
  finish: "고체가 녹는 동안에는 온도가 일정하게 유지돼요. 이 온도는 양이 달라도 같고 <b>물질마다 고유해요</b>(로르산 43.8 ℃, 팔미트산 62.5 ℃).",
});

// 2. 끓는점: 물과 에탄올, 양, 압력솥. 왼쪽 무대는 뚜껑 없는 냄비(물 100 mL, 물 200 mL, 에탄올)와 압력솥(잠금 뚜껑, 추, 압력계)을 따로 그린다.
// 압력솥은 데울수록 솥 안에 수증기가 갇혀 압력계 바늘이 오르고 물을 누르는 화살이 진해진다. 100 ℃를 넘어도 잠잠하다가 약 120 ℃에서 끓는다.
// 그래프 x 176~334(16분, 분당 9.9 px), y 20~130 ℃(℃당 1.35 px). 꺾이는 곳: 에탄올 (2.6분, 78), 물 100 mL (5분, 100), 압력솥 (6.25분, 120),
//   물 200 mL (10분, 100). 물 100 mL와 압력솥은 같은 빠르기로 데워져 100 ℃까지 같은 선을 지난다.
//   이름표: 압력솥은 120 ℃ 선 위 꺾인 곳의 오른쪽, 물 100 mL는 100 ℃ 선 위(압력솥의 오르는 선에서 9 px 오른쪽, 값 100.0과 13 px 떨어짐),
//   물 200 mL는 100 ℃ 선 아래 오른쪽 끝(자기 오르는 선에서 8 px), 에탄올은 78 ℃ 선 아래 가운데. 100과 120은 세로축 눈금으로 읽고
//   눈금에 없는 78만 점선 아래 오른쪽 끝에 값을 쓴다(물 100 mL 이름표 옆에 100.0이 붙어 한 덩어리로 읽히던 것을 없앴다).
const boilRun = (key: string, name: string, sub: string, color: string, rate: number, bp: number, liq: string, o: { lid?: boolean; dash?: boolean; level: number; tag: Omit<Tag, "t" | "v">; markBelow?: boolean }): Run => {
  const tA = (bp - 20) / rate;
  return {
    key,
    name,
    sub,
    color,
    f: heat(20, rate, bp, 99),
    mark: bp,
    markBelow: o.markBelow,
    dash: o.dash,
    level: o.level,
    lid: o.lid,
    tag: { ...o.tag, t: tA, v: bp },
    done: `${bp} ℃에서 끓음`,
    // 조사는 이름의 끝소리로 고른다(물 100 mL는: mL는 '밀리리터'로 읽는다, 압력솥의 물은)
    say: `${name}${josa(name, "은", "는")} <b>${bp} ℃</b>에서 끓기 시작해 온도가 더 오르지 않았어요.`,
    state: (t) => (t < tA ? "액체" : "끓는 중 (액체 + 기체)"),
    // 압력솥은 100 ℃를 넘어도 잠잠하다(약 112 ℃부터 잔 기포)
    bub: o.lid ? (_t, v) => (v < 112 ? 0 : v < bp ? 3 : 14) : (t) => (t < tA * 0.8 ? 0 : t < tA ? 3 : 14),
    liq,
    cross: o.lid ? { at: 100.5, say: "100 ℃가 넘었는데도 <b>끓지 않아요</b>. 압력계의 바늘을 보세요." } : undefined,
  };
};
export const g2u1BoilLab = curveLab({
  cls: "g2u1x-cv-boil",
  pot: true,
  plotX: 176,
  plotW: 158,
  markDash: "2 4",
  markSkipTicks: true,
  y0: 20,
  y1: 130,
  yt: [40, 80, 100, 120],
  tMax: 16,
  xt: [4, 8, 12, 16],
  cols: 2,
  runs: [
    boilRun("w1", "물 100 mL", "뚜껑 없는 냄비", "#74C0FC", 16, 100, P.water, { level: 30, tag: { text: "물 100 mL", dx: 15, dy: -5, anchor: "start" } }),
    boilRun("w2", "물 200 mL", "뚜껑 없는 냄비", "#74C0FC", 8, 100, P.water, { dash: true, level: 60, tag: { text: "물 200 mL", dx: 59.2, dy: 14, anchor: "end" } }),
    boilRun("et", "에탄올 100 mL", "뚜껑 없는 냄비", "#B9A6FF", 22, 78, P.ethanol, { level: 30, markBelow: true, tag: { text: "에탄올", dx: 66, dy: 15, anchor: "middle" } }),
    boilRun("pc", "압력솥의 물", "잠근 뚜껑, 높은 압력", "#FFA94D", 16, 120, P.water, { lid: true, level: 42, tag: { text: "압력솥", dx: 4, dy: -5, anchor: "start" } }),
  ],
  need: (d) => d.size === 4,
  path: ["w1", "w2", "et", "pc"],
  intro: "조건이 조금씩 다른 네 가지 액체를 가열하며 <b>끓는 온도</b>를 비교해 보세요.",
  picked: (r) =>
    `${r.lid ? `<b>${r.name}</b>${josa(r.name, "은", "는")} 뚜껑을 잠가 수증기가 빠져나가지 못해요` : `냄비에 <b>${r.name}</b>${josa(r.name, "을", "를")} 담았어요`}. 버튼을 <b>꾹 눌러</b> 가열해 보세요.`,
  more: (d) => `남은 ${4 - d.size}가지 조건도 가열해 비교해 보세요.`,
  judge: {
    q: "<b>압력솥</b>의 물이 100 ℃가 되어도 끓지 않은 까닭은?",
    choices: [{ t: "솥 안의 압력이 높아 더 높은 온도에서 끓어서", ok: true }, { t: "솥 안의 물이 더 많아서" }, { t: "뚜껑이 열을 막아 덜 뜨거워져서" }],
    why: "양이 2배인 물도 <b>100 ℃</b>에서 끓었어요. 달라진 것은 <b>압력</b>이에요.",
  },
  finish: "끓는 동안의 온도는 양이 달라도 같고 <b>물질마다 달라요</b>(물 100 ℃, 에탄올 78 ℃). 주위의 <b>압력이 높아지면</b> 더 높은 온도에서 끓어요.",
});

// 3. 물과 소금물
const saltRun = (key: string, name: string, sub: string, color: string, bp: number, drift: number, liq: string): Run => ({
  key,
  name,
  sub,
  color,
  f: heat(90, 5, bp, 99, drift),
  mark: drift ? undefined : bp,
  done: drift ? "계속 오름" : "100 ℃ 멈춤",
  say: drift ? `${name}은 <b>${fx(bp)} ℃</b>쯤에서 끓기 시작했는데, 끓는 동안에도 온도가 <b>계속 올랐어요</b>.` : "물은 <b>100 ℃</b>에서 끓기 시작해 온도가 더 오르지 않았어요.",
  state: (t) => (t < (bp - 90) / 5 ? "액체" : "끓는 중"),
  bub: (t) => (t < (bp - 90) / 5 ? 2 : 14),
  liq,
});
export const g2u1SaltLab = curveLab({
  cls: "g2u1x-cv-salt",
  tall: true, // 소금물의 가열 결과와 남은 액체 안내가 이어지면 세 줄(약 690px)
  y0: 90,
  y1: 110,
  yt: [90, 95, 100, 105, 110],
  tMax: 10,
  xt: [5, 10],
  cols: 3,
  runs: [saltRun("w", "물", "물 100 g", "#74C0FC", 100, 0, P.water), saltRun("s1", "묽은 소금물", "소금 10 g", "#FFD43B", 101.8, 0.16, "#8FC4F2"), saltRun("s2", "진한 소금물", "소금 30 g", "#FFA94D", 105.3, 0.42, "#B5D3EE")],
  need: (d) => d.size === 3,
  path: ["w", "s1", "s2"],
  intro: "순수한 <b>물</b>과 농도가 다른 <b>소금물</b> 두 가지를 90 ℃부터 가열해 비교해 보세요.",
  predict: { q: "물은 끓는 동안 100 ℃에 머물러요. <b>소금물</b>이 끓는 동안의 온도는?", choices: ["계속 조금씩 오른다", "100 ℃에 머문다", "100 ℃보다 낮은 온도에 머문다"] },
  picked: (r) => `<b>${r.name}</b>(${r.sub})을 올렸어요. 버튼을 <b>꾹 눌러</b> 가열해 보세요.`,
  more: (d) => `남은 ${3 - d.size}가지 액체도 가열해 비교해 보세요.`,
  judge: {
    q: "<b>소금물</b>이 끓는 동안 온도는 어떻게 됐나요?",
    choices: [{ t: "일정하지 않고 조금씩 계속 올랐다", ok: true }, { t: "물처럼 일정한 온도에서 유지됐다" }, { t: "끓기 시작하자 온도가 내려갔다" }],
    why: "물의 곡선만 평평했어요. 소금물은 진할수록 높은 온도에서 끓고 계속 올랐어요.",
  },
  finish: "한 가지 물질인 <b>물</b>은 끓는 온도가 일정해요. 물에 소금이 섞인 <b>소금물</b>은 끓는 동안 온도가 일정하지 않고 계속 올라가요.",
});
