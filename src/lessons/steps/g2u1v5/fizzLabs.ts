// [중2 Ⅰ v5] g2u1l4 기포 랩 둘. 책의 해 보기(온도와 압력에 따른 기체의 용해도 알아보기)를 손으로 한다.
//   g2u1FizzLab 「따뜻하게 하면 기포는 어떻게 될까요?」 차가운 탄산음료가 든 시험관을 온도가 다른 물에 담그고 같은 시간 동안 올라오는 기포를 센다.
//   g2u1PumpLab 「공기를 빼면 기포는 어떻게 될까요?」 감압 용기에 탄산음료를 넣고 용기 속 공기를 빼내며 기포를 본다. 공기를 다시 넣어도 본다.
// 학생이 정하는 것: 시험관을 담글 물과 그 차례 / 공기를 빼고 넣는 때.
// 통찰: 기체의 용해도는 온도가 높을수록 작아진다 / 압력이 낮을수록 작아진다.
// 수치: 물의 온도(5, 20, 60 ℃)와 기포 수, 용기 속 압력의 값은 이 랩에서 정했다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { P, bubbles, clamp, fx, g1Hold, g1Lab, g1Log, g1Predict, g1Row, seeded, svgOpen, tube, type G1Step } from "./g2u1Kit";

const SODA = "#FFD76A";

// ── 1. 온도 ──
const BATH = [
  { key: "ice", name: "얼음물", t: 5, n: 4, show: 2, color: P.cold },
  { key: "room", name: "실온의 물", t: 20, n: 11, show: 5, color: P.water },
  { key: "hot", name: "뜨거운 물", t: 60, n: 38, show: 16, color: P.hot },
];
export const g2u1FizzLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-fz" });
  const { f, tm } = lab;
  const rnd = seeded(23);
  f.stage.innerHTML = `${svgOpen}
    <rect class="g2u1x-fz-bath" x="43" y="112" width="114" height="85" rx="6" fill="${P.water}" opacity="0"/>
    <path d="M40 96 V190 a10 10 0 0 0 10 10 h100 a10 10 0 0 0 10 -10 V96 M34 96 h132" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    ${tube(100, 30, 34, 158, SODA, "g2u1x-fz", 0.72)}
    <g class="g2u1x-fz-bub"></g>
    <text class="g2u1x-fz-name" x="100" y="218" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}">물을 골라 시험관을 담가요</text>
    <text x="262" y="92" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}">10초 동안 올라온 기포</text>
    <text class="g2u1x-fz-n" x="262" y="136" text-anchor="middle" font-size="40" font-weight="800" fill="${P.text}">0</text>
    <text x="262" y="158" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}">개</text>
  </svg>`;
  const log = g1Log(lab, "r");
  const bathEl = f.stage.querySelector(".g2u1x-fz-bath") as SVGRectElement;
  const bub = f.stage.querySelector(".g2u1x-fz-bub") as SVGGElement;
  const nEl = f.stage.querySelector(".g2u1x-fz-n") as SVGTextElement;
  const nameEl = f.stage.querySelector(".g2u1x-fz-name") as SVGTextElement;
  const cards = BATH.map((b) => bvCard("g2u1x-fz-card", { name: b.name, sub: `${b.t} ℃`, key: b.key }));
  const done = new Set<number>();
  let cur = -1;
  let p = 0;
  let pred = "";

  const hold = g1Hold(lab, "꾹 눌러 10초 동안 세기", (ms) => {
    if (cur < 0) return false;
    p = clamp(p + ms / 2400);
    nEl.textContent = String(Math.round(BATH[cur].n * p));
    if (p >= 1) {
      end();
      return false;
    }
    return true;
  });
  function controls(withHold: boolean): void {
    if (withHold) f.slot.setControls(bvCards(3, ...cards), hold);
    else f.slot.setControls(bvCards(3, ...cards));
    const k = [2, 0, 1].find((i) => !done.has(i));
    lab.todo(k === undefined ? undefined : cur === k ? ".g2u1x-hold" : `.g2u1x-fz-card[data-k='${BATH[k].key}']`);
  }
  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      if (done.has(i)) return;
      haptic(HAPTIC.tap);
      cur = i;
      p = 0;
      const b = BATH[i];
      cards.forEach((x, j) => x.on(i === j));
      bathEl.setAttribute("fill", b.color);
      bathEl.setAttribute("opacity", ".4");
      nameEl.textContent = `${b.name} (${b.t} ℃)`;
      nEl.textContent = "0";
      bubbles(bub, b.show, 88, 110, 24, 60, rnd);
      hold.disabled = false;
      f.say(`차가운 탄산음료 시험관을 <b>${b.name}</b>에 담갔어요. 버튼을 <b>꾹 눌러</b> 기포를 세어 보세요.`);
      api.setCTA("꾹 눌러 기포를 세어 보세요", { enabled: false });
      controls(true);
    }),
  );
  function end(): void {
    const b = BATH[cur];
    haptic(HAPTIC.correct);
    hold.disabled = true;
    done.add(cur);
    cards[cur].done();
    cards[cur].on(false);
    cards[cur].el.disabled = true;
    cards[cur].sub(`기포 ${b.n}개`);
    log.add(`${b.name} ${b.t} ℃ <b>${b.n}개</b>`);
    f.pips(done.size);
    cur = -1;
    if (done.size < 3) {
      f.say(`${b.name}에서는 10초에 <b>${b.n}개</b>였어요. 다른 물에도 담가 견주어 보세요.`);
      api.setCTA(`다른 물에도 담가 보세요 (${done.size}/3)`, { enabled: false });
      controls(false);
      return;
    }
    controls(false);
    const head = pred.startsWith("더 많이") ? "예측대로" : "예측과 달리";
    f.say(`${head} 물이 따뜻할수록 기포가 <b>많이</b> 올라왔어요. 4개, 11개, 38개.`);
    tm.later(
      () =>
        lab.judge(
          "<b>뜨거운 물</b>에서 기포가 가장 많이 올라온 까닭은?",
          [{ t: "온도가 높아 이산화 탄소가 덜 녹게 되어서", ok: true }, { t: "뜨거운 물이 시험관 속으로 들어가서" }, { t: "음료 속에서 이산화 탄소가 새로 만들어져서" }],
          "기포는 음료에 <b>녹아 있던</b> 이산화 탄소가 빠져나온 거예요.",
          () => lab.finish("기체는 물의 온도가 <b>높을수록</b> 덜 녹아요. 녹아 있을 수 없게 된 이산화 탄소가 기포가 되어 빠져나왔어요."),
        ),
      1200,
    );
  }

  f.say("탄산음료에는 <b>이산화 탄소</b>가 녹아 있어요. 차가운 탄산음료를 시험관에 담았어요. 먼저 예측해 보세요.");
  g1Predict(lab, "이 시험관을 <b>뜨거운 물</b>에 담그면 올라오는 기포는?", ["더 많이 올라온다", "더 적게 올라온다", "달라지지 않는다"], (picked) => {
    pred = picked;
    f.say("온도가 다른 <b>세 가지 물</b>이 있어요. 시험관을 담글 물을 골라 보세요. 모두 해 볼 거예요.");
    api.setCTA("시험관을 담글 물을 골라 보세요", { enabled: false });
    controls(false);
  });
  return lab.cleanup;
};

// ── 2. 압력 ──
export const g2u1PumpLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 2, cls: "g2u1x-pm" });
  const { f, tm } = lab;
  const rnd = seeded(29);
  const GX = 262;
  const GY = 112;
  f.stage.innerHTML = `${svgOpen}
    <rect x="40" y="56" width="124" height="146" rx="14" fill="rgba(210,225,245,.07)" stroke="${P.glass}" stroke-width="2.4"/>
    <rect x="34" y="44" width="136" height="16" rx="6" fill="#59657A" stroke="#C8D2DE" stroke-width="1.4"/>
    <rect x="94" y="14" width="16" height="30" rx="4" fill="#8B9BB0" stroke="#C8D2DE" stroke-width="1.2"/>
    <rect class="g2u1x-pm-knob" x="84" y="8" width="36" height="10" rx="4" fill="#C8D2DE"/>
    <rect x="71" y="116" width="62" height="76" rx="4" fill="${SODA}" opacity=".75"/>
    <g class="g2u1x-pm-bub"></g>
    <path d="M68 100 V186 a8 8 0 0 0 8 8 h52 a8 8 0 0 0 8 -8 V100" stroke="${P.glass}" stroke-width="2.2"/>
    <g class="g2u1x-pm-air"></g>
    <circle cx="${GX}" cy="${GY}" r="46" fill="rgba(255,255,255,.05)" stroke="${P.glass}" stroke-width="2.2"/>
    <path d="M${GX - 34} ${GY + 20} A40 40 0 1 1 ${GX + 34} ${GY + 20}" stroke="${P.grid}" stroke-width="6" stroke-linecap="round"/>
    <text x="${GX - 34}" y="${GY + 62}" text-anchor="middle" font-size="12" font-weight="700" fill="${P.dim}">낮음</text>
    <text x="${GX + 34}" y="${GY + 62}" text-anchor="middle" font-size="12" font-weight="700" fill="${P.dim}">높음</text>
    <path class="g2u1x-pm-needle" d="M${GX} ${GY} L${GX} ${GY - 36}" stroke="${P.rose}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="${GX}" cy="${GY}" r="5" fill="${P.rose}"/>
    <text x="${GX}" y="48" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}">용기 속의 압력</text>
    <text class="g2u1x-pm-n" x="${GX}" y="196" text-anchor="middle" font-size="12.5" font-weight="800" fill="${P.text}"></text>
  </svg>`;
  const bub = f.stage.querySelector(".g2u1x-pm-bub") as SVGGElement;
  const air = f.stage.querySelector(".g2u1x-pm-air") as SVGGElement;
  const needle = f.stage.querySelector(".g2u1x-pm-needle") as SVGPathElement;
  const nEl = f.stage.querySelector(".g2u1x-pm-n") as SVGTextElement;
  let pr = 1; // 용기 속 압력(처음을 1로 본다)
  let shown = -1;
  let phase: "pred" | "out" | "in" | "end" = "pred";
  let pred = "";

  function paint(): void {
    const a = -120 + 240 * clamp((pr - 0.2) / 0.9);
    needle.setAttribute("transform", `rotate(${fx(a)} ${GX} ${GY})`);
    const n = Math.round(3 + 22 * (1 - pr) / 0.7);
    if (n !== shown) {
      shown = n;
      bubbles(bub, n, 74, 150, 56, 38, rnd);
      const r2 = seeded(5);
      let s = "";
      for (let i = 0; i < Math.round(26 * pr); i++) s += `<circle cx="${fx(48 + r2() * 108)}" cy="${fx(64 + r2() * 30)}" r="2" fill="#DCE7F5" opacity=".55"/>`;
      air.innerHTML = s;
    }
    nEl.textContent = `기포 ${n < 6 ? "조금" : n < 15 ? "많아짐" : "아주 많음"}`;
    host.dataset.g2u1Pm = fx(pr, 2);
  }
  const bOut = g1Hold(lab, "꾹 눌러 공기 빼기", (ms) => {
    if (phase !== "out") return false;
    pr = Math.max(0.3, pr - (ms / 2600) * 0.7);
    paint();
    if (pr <= 0.3) {
      phase = "in";
      haptic(HAPTIC.correct);
      bOut.disabled = true;
      bIn.disabled = false;
      f.pips(1);
      const head = pred.startsWith("더 많이") ? "예측대로" : "예측과 달리";
      f.say(`${head} 압력이 낮아질수록 기포가 <b>많이</b> 올라왔어요. 이번에는 <b>공기를 다시 넣어</b> 보세요.`);
      api.setCTA("공기를 다시 넣어 보세요", { enabled: false });
      lab.todo("[data-k='in']");
      return false;
    }
    return true;
  });
  const bIn = bvBtn("", "공기 다시 넣기");
  bIn.dataset.k = "in";
  bIn.disabled = true;
  bIn.addEventListener("click", () => {
    if (phase !== "in") return;
    phase = "end";
    bIn.disabled = true;
    haptic(HAPTIC.tap);
    let k = 0;
    const tick = (): void => {
      k += 1;
      pr = Math.min(1, 0.3 + 0.07 * k);
      paint();
      if (pr < 1) tm.later(tick, 70);
      else {
        f.say("압력이 처음으로 돌아오자 기포가 <b>다시 줄었어요</b>. 음료의 온도는 그대로였어요.");
        tm.later(ask, 1100);
      }
    };
    tick();
  });
  function ask(): void {
    lab.judge(
      "용기 속의 압력이 낮아지자 기포가 많아진 까닭은?",
      [{ t: "압력이 낮아 이산화 탄소가 덜 녹게 되어서", ok: true }, { t: "빼낸 공기가 음료 속으로 들어가서" }, { t: "음료의 온도가 높아져서" }],
      "온도는 그대로였어요. 달라진 것은 <b>압력</b>뿐이에요.",
      () => lab.finish("기체는 누르는 압력이 <b>낮을수록</b> 덜 녹아요. 그래서 기체의 용해도를 말할 때는 온도와 압력을 함께 적어요."),
    );
  }

  paint();
  f.say("공기를 빼낼 수 있는 용기에 <b>차가운 탄산음료</b>를 넣고 뚜껑을 닫았어요. 먼저 예측해 보세요.");
  g1Predict(lab, "용기 속의 <b>공기를 빼내면</b> 음료에서 올라오는 기포는?", ["더 많이 올라온다", "더 적게 올라온다", "달라지지 않는다"], (picked) => {
    pred = picked;
    phase = "out";
    f.slot.setControls(g1Row(bOut), g1Row(bIn));
    f.say("버튼을 <b>꾹 눌러</b> 용기 속의 공기를 빼내 보세요. 압력계의 바늘과 기포를 함께 보세요.");
    api.setCTA("꾹 눌러 공기를 빼 보세요", { enabled: false });
    lab.todo(".g2u1x-hold");
  });
  return lab.cleanup;
};
