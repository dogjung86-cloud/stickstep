// [중2 Ⅰ v5] 가열하며 온도를 재는 랩 셋. 무대와 진행은 같고 무엇을 견주는지가 다르다.
//   g2u1MeltLab (g2u1l5) 「양이 달라지면 녹는 온도도 달라질까요?」 책의 해 보기: 로르산과 팔미트산 1 g, 2 g의 가열 곡선.
//   g2u1BoilLab (g2u1l5) 「끓는 온도는 무엇에 따라 달라질까요?」 책의 디지털 해 보기(종류, 양)와 본문의 압력솥.
//   g2u1SaltLab (g2u1l6) 「소금물도 100 ℃에서 멈출까요?」 책의 그림: 물과 소금물의 가열 곡선.
// 학생이 정하는 것: 무엇을 어떤 차례로 가열할지. 가열은 꾹 누르는 동안만 진행되고 곡선이 그 자리에서 그려져 앞의 곡선과 겹쳐 보인다.
// 통찰: 상태가 변하는 동안의 온도는 양과 관계없이 같고 물질마다 다르다 / 끓는점은 압력에 따라 달라진다 / 혼합물은 끓는 동안 온도가 일정하지 않다.
// 수치: 녹는점(로르산 43.8, 팔미트산 62.5 ℃), 끓는점(물 100, 에탄올 78 ℃, 압력솥 속의 물 약 120 ℃), 소금물의 끓는 온도(소금 10 g에 약 102 ℃, 30 g에 약 105 ℃에서 시작)는 자연값이고
//       가열 시간은 이 랩에서 정했다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards } from "../bio6/b6Lab";
import { P, bubbles, fx, g1Curve, g1Lab, g1Predict, heater, plot, seeded, svgOpen, type G1Step } from "./g2u1Kit";

interface Run {
  key: string;
  name: string;
  sub: string;
  color: string;
  f: (t: number) => number;
  /** 온도가 멈춘 값(그래프에 점선으로 남긴다). 없으면 남기지 않는다. */
  mark?: number;
  done: string;
  say: string;
  state: (t: number, v: number) => string;
  bub: (t: number, v: number) => number;
  liq: string;
  /** 고체가 녹은 정도(0~1). 녹는점 랩만 쓴다. */
  melt?: (t: number) => number;
  lid?: boolean;
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
  judge: { q: string; choices: { t: string; ok?: boolean }[]; why: string };
  finish: string;
  tube?: boolean;
}

function curveLab(cfg: Cfg): StepRenderer {
  return (host, step, api) => {
    const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: `g2u1x-cv ${cfg.cls}` });
    const { f, tm } = lab;
    const rnd = seeded(17);
    const pl = plot({ x: 206, y: 32, w: 128, h: 148, x0: 0, x1: cfg.tMax, y0: cfg.y0, y1: cfg.y1, xl: "가열 시간(분)", yl: "온도(℃)", xt: cfg.xt, yt: cfg.yt });
    f.stage.innerHTML = `${svgOpen}
      ${pl.svg}
      <g class="g2u1x-cv-marks"></g><g class="g2u1x-cv-lines"></g>
      ${heater(30, 198, 120)}
      <rect class="g2u1x-cv-glow" x="42" y="193" width="96" height="5" rx="2.5" fill="${P.warm}" opacity="0"/>
      <rect class="g2u1x-cv-liq" x="43" y="112" width="94" height="79" rx="5" fill="${P.water}" opacity=".4"/>
      <g class="g2u1x-cv-bub"></g>
      ${cfg.tube ? `<rect class="g2u1x-cv-melted" x="80" y="140" width="20" height="38" rx="4" fill="#F7E7B0" opacity="0"/><rect class="g2u1x-cv-solid" x="80" y="140" width="20" height="38" rx="4" fill="#F4F7FB"/><path d="M77 84 V172 a13 13 0 0 0 26 0 V84 M73 84 h34" stroke="${P.glass}" stroke-width="2.2" stroke-linecap="round"/>` : ""}
      <path d="M40 104 V186 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10 -10 V104 M34 104 h112" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
      <g class="g2u1x-cv-lid" opacity="0"><rect x="34" y="94" width="112" height="12" rx="5" fill="#8B9BB0" stroke="#C8D2DE" stroke-width="1.4"/><rect x="82" y="82" width="16" height="13" rx="3" fill="#59657A" stroke="#C8D2DE" stroke-width="1.2"/></g>
      <text class="g2u1x-cv-temp" x="90" y="34" text-anchor="middle" font-size="22" font-weight="800" fill="${P.text}"></text>
      <text class="g2u1x-cv-state" x="90" y="54" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.yellow}"></text>
      <text class="g2u1x-cv-name" x="90" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}"></text>
    </svg>`;
    const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
    const lines = q<SVGGElement>(".g2u1x-cv-lines");
    const marks = q<SVGGElement>(".g2u1x-cv-marks");
    const liq = q<SVGRectElement>(".g2u1x-cv-liq");
    const bub = q<SVGGElement>(".g2u1x-cv-bub");
    const glow = q<SVGRectElement>(".g2u1x-cv-glow");
    const lid = q<SVGGElement>(".g2u1x-cv-lid");
    const temp = q<SVGTextElement>(".g2u1x-cv-temp");
    const state = q<SVGTextElement>(".g2u1x-cv-state");
    const name = q<SVGTextElement>(".g2u1x-cv-name");
    const solid = f.stage.querySelector(".g2u1x-cv-solid");
    const melted = f.stage.querySelector(".g2u1x-cv-melted");

    const done = new Set<string>();
    const marked = new Set<number>();
    let cur: Run | null = null;
    let lastBub = -1;
    const swatch = (c: string): string => `<svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#0B1524"/><path d="M6 24 L14 14 H22 L28 8" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const cards = cfg.runs.map((r) => bvCard("g2u1x-cv-card", { name: r.name, sub: r.sub, icon: swatch(r.color), key: r.key }));

    function show(r: Run, t: number): void {
      const v = r.f(t);
      temp.textContent = `${fx(v)} ℃`;
      state.textContent = r.state(t, v);
      name.textContent = r.name;
      liq.setAttribute("fill", r.liq);
      lid.setAttribute("opacity", r.lid ? "1" : "0");
      const n = r.bub(t, v);
      if (n !== lastBub) {
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
    cfg.runs.forEach((r, i) =>
      cards[i].el.addEventListener("click", () => {
        if (done.has(r.key)) return;
        haptic(HAPTIC.tap);
        cur = r;
        cards.forEach((c, j) => c.on(j === i));
        lastBub = -1;
        show(r, 0);
        f.say(cfg.picked(r));
        const btn = g1Curve(lab, pl, lines, {
          tMax: cfg.tMax,
          ms: 2600,
          f: r.f,
          color: r.color,
          onTick: (t) => {
            glow.setAttribute("opacity", "1");
            show(r, t);
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
              marks.insertAdjacentHTML("beforeend", `<path d="M${pl.px(0)} ${fx(y)} H${pl.px(cfg.tMax)}" stroke="${r.color}" stroke-width="1.2" stroke-dasharray="4 3" opacity=".8"/><text x="${pl.px(cfg.tMax) - 2}" y="${fx(y - 4)}" text-anchor="end" font-size="12" font-weight="800" fill="${r.color}">${fx(r.mark)}</text>`);
            }
            cur = null;
            f.pips(Math.min(2, done.size));
            if (cfg.need(done)) {
              f.say(r.say);
              cards.forEach((c) => (c.el.disabled = true));
              controls();
              lab.todo();
              tm.later(() => lab.judge(cfg.judge.q, cfg.judge.choices, cfg.judge.why, () => lab.finish(cfg.finish)), 1300);
            } else {
              f.say(`${r.say} ${cfg.more(done)}`);
              controls();
              api.setCTA("다른 것도 가열해 견주어 보세요", { enabled: false });
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
const MP = { la: 43.8, pa: 62.5 };
const meltRun = (key: string, sub: "la" | "pa", g: 1 | 2, color: string): Run => {
  const mp = MP[sub];
  const rate = g === 1 ? 14 : 9;
  const hold = g === 1 ? 2 : 4;
  const tA = (mp - 25) / rate;
  const nm = sub === "la" ? "로르산" : "팔미트산";
  return {
    key,
    name: `${nm} ${g} g`,
    sub: "흰색 고체",
    color,
    f: heat(25, rate, mp, hold, 0, 80),
    mark: mp,
    done: `${fx(mp)} ℃에서 멈춤`,
    say: `${nm} ${g} g은 <b>${fx(mp)} ℃</b>에서 멈췄다가 다 녹은 뒤 다시 올랐어요.`,
    state: (t) => (t < tA ? "고체" : t <= tA + hold ? "녹는 중 (고체 + 액체)" : "액체"),
    bub: () => 0,
    liq: P.water,
    melt: (t) => Math.max(0, Math.min(1, (t - tA) / hold)),
  };
};
export const g2u1MeltLab = curveLab({
  cls: "g2u1x-cv-melt",
  tube: true,
  y0: 20,
  y1: 80,
  yt: [20, 40, 60, 80],
  tMax: 10,
  xt: [5, 10],
  cols: 2,
  runs: [meltRun("la1", "la", 1, "#FF7EB0"), meltRun("la2", "la", 2, "#FFC2DA"), meltRun("pa1", "pa", 1, "#63E6BE"), meltRun("pa2", "pa", 2, "#C3FAE8")],
  need: (d) => ((d.has("la1") && d.has("la2")) || (d.has("pa1") && d.has("pa2"))) && (d.has("la1") || d.has("la2")) && (d.has("pa1") || d.has("pa2")),
  path: ["la1", "la2", "pa1"],
  intro: "흰색 고체 <b>로르산</b>과 <b>팔미트산</b>을 물중탕으로 가열해요. 가열할 것을 골라 보세요.",
  predict: { q: "같은 고체를 <b>2배</b> 넣고 가열하면 녹는 동안의 온도는?", choices: ["1 g일 때와 같다", "1 g일 때보다 높다", "1 g일 때보다 낮다"] },
  picked: (r) => `<b>${r.name}</b>을 시험관에 넣었어요. 버튼을 <b>꾹 눌러</b> 가열하며 온도를 지켜보세요.`,
  more: (d) => ((d.has("la1") || d.has("la2")) && (d.has("pa1") || d.has("pa2")) ? "같은 물질을 <b>양만 바꿔서</b>도 가열해 보세요." : d.size === 1 ? "<b>양</b>이나 <b>물질</b>을 바꿔 견주어 보세요." : "이번에는 <b>다른 물질</b>도 가열해 보세요."),
  judge: {
    q: "로르산 1 g과 2 g의 그래프에서 <b>같은 것</b>은?",
    choices: [{ t: "온도가 멈춘 구간의 온도", ok: true }, { t: "온도가 멈춘 구간의 길이" }, { t: "다 녹을 때까지 걸린 시간" }],
    why: "둘 다 <b>43.8 ℃</b>에서 멈췄어요. 2 g은 녹는 데 시간이 더 걸렸을 뿐이에요.",
  },
  finish: "고체가 녹는 동안에는 온도가 일정해요. 그 온도는 양이 달라도 같고 <b>물질마다 달라요</b>. 로르산 43.8 ℃, 팔미트산 62.5 ℃.",
});

// 2. 끓는점: 물과 에탄올, 양, 압력솥
const boilRun = (key: string, name: string, sub: string, color: string, rate: number, bp: number, liq: string, lid = false): Run => {
  const tA = (bp - 20) / rate;
  return {
    key,
    name,
    sub,
    color,
    f: heat(20, rate, bp, 99),
    mark: bp,
    done: `${bp} ℃에서 끓음`,
    say: `${name}${lid ? "은" : "는"} <b>${bp} ℃</b>에서 끓기 시작해 온도가 더 오르지 않았어요.`,
    state: (t) => (t < tA ? "액체" : "끓는 중 (액체 + 기체)"),
    bub: (t) => (t < tA * 0.8 ? 0 : t < tA ? 3 : 14),
    liq,
    lid,
  };
};
export const g2u1BoilLab = curveLab({
  cls: "g2u1x-cv-boil",
  y0: 20,
  y1: 130,
  yt: [40, 80, 120],
  tMax: 12,
  xt: [4, 8, 12],
  cols: 2,
  runs: [
    boilRun("w1", "물 100 mL", "뚜껑 없는 냄비", "#74C0FC", 16, 100, P.water),
    boilRun("w2", "물 200 mL", "뚜껑 없는 냄비", "#D0EBFF", 8, 100, P.water),
    boilRun("et", "에탄올 100 mL", "뚜껑 없는 냄비", "#B9A6FF", 22, 78, P.ethanol),
    boilRun("pc", "압력솥의 물", "잠근 뚜껑, 높은 압력", "#FFA94D", 16, 120, P.water, true),
  ],
  need: (d) => d.size === 4,
  path: ["w1", "w2", "et", "pc"],
  intro: "액체를 가열하며 <b>끓는 온도</b>를 재요. 종류, 양, 압력 가운데 하나씩만 달라요. 골라 보세요.",
  picked: (r) => `<b>${r.name}</b>${r.lid ? "은 뚜껑을 잠가 수증기가 못 나가요" : "를 올렸어요"}. 버튼을 <b>꾹 눌러</b> 가열해 보세요.`,
  more: (d) => `남은 것 ${4 - d.size}가지도 가열해 견주어 보세요.`,
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
  y0: 90,
  y1: 110,
  yt: [90, 95, 100, 105, 110],
  tMax: 10,
  xt: [5, 10],
  cols: 3,
  runs: [saltRun("w", "물", "물 100 g", "#74C0FC", 100, 0, P.water), saltRun("s1", "묽은 소금물", "소금 10 g", "#FFD43B", 101.8, 0.16, "#8FC4F2"), saltRun("s2", "진한 소금물", "소금 30 g", "#FFA94D", 105.3, 0.42, "#B5D3EE")],
  need: (d) => d.size === 3,
  path: ["w", "s1", "s2"],
  intro: "물, 그리고 같은 양의 물에 소금을 녹인 <b>소금물</b> 두 가지예요. 90 ℃부터 가열해요. 골라 보세요.",
  predict: { q: "물은 끓는 동안 100 ℃에 머물러요. <b>소금물</b>이 끓는 동안의 온도는?", choices: ["계속 조금씩 오른다", "100 ℃에 머문다", "100 ℃보다 낮은 온도에 머문다"] },
  picked: (r) => `<b>${r.name}</b>(${r.sub})을 올렸어요. 버튼을 <b>꾹 눌러</b> 가열해 보세요.`,
  more: (d) => `남은 것 ${3 - d.size}가지도 가열해 견주어 보세요.`,
  judge: {
    q: "<b>소금물</b>이 끓는 동안 온도는 어떻게 됐나요?",
    choices: [{ t: "멈추지 않고 조금씩 계속 올랐다", ok: true }, { t: "물처럼 한 온도에서 멈췄다" }, { t: "끓기 시작하자 내려갔다" }],
    why: "물의 곡선만 평평했어요. 소금물은 진할수록 높은 온도에서 끓고 계속 올랐어요.",
  },
  finish: "한 가지 물질인 <b>물</b>은 끓는 온도가 일정해요. 물에 소금이 섞인 <b>소금물</b>은 끓는 동안 온도가 일정하지 않고 계속 올라가요.",
});
