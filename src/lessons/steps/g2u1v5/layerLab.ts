// [중2 Ⅰ v5] g2u1l2 층 쌓기 랩: 「세 액체는 어떤 차례로 쌓일까요?」
// 책의 해 보기를 손으로 한다: 컵에 물, 식용유, 에탄올을 넣어 층을 만들고 동전과 얼음을 넣어 멈추는 자리를 본다.
// 학생이 정하는 것: 세 액체를 붓는 차례, 동전과 얼음이 멈출 자리의 예측.
// 실패하는 길: 물과 에탄올은 서로 섞인다. 둘이 맞닿게 부으면(식용유가 사이를 막지 못하면) 섞여서 두 층만 남는다.
// 통찰 하나: 밀도가 작은 물질은 위로 뜨고 큰 물질은 아래로 가라앉는다.
// 수치: 밀도(g/cm³)는 에탄올 0.79, 식용유 약 0.91, 물 1.00, 얼음 0.92, 동전 약 8.9. 섞인 액체의 값(약 0.93)은 같은 부피로 섞었을 때의 어림값이다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { P, g1Lab, g1Predict, g1Row, svgOpen, type G1Step } from "./g2u1Kit";

type K = "w" | "o" | "e" | "m";
const LIQ: Record<K, { name: string; d: number; color: string; vol: number }> = {
  w: { name: "물", d: 1.0, color: P.water, vol: 1 },
  o: { name: "식용유", d: 0.91, color: P.oil, vol: 1 },
  e: { name: "에탄올", d: 0.79, color: P.ethanol, vol: 1 },
  m: { name: "물과 에탄올이 섞인 액체", d: 0.93, color: "#7FA8E8", vol: 2 },
};
const CUP = { x: 34, w: 112, bottom: 200, unit: 50 };
const CX = CUP.x + CUP.w / 2;
const OBJ = {
  coin: { name: "동전", d: "약 8.9", home: [262, 196], stop: CUP.bottom - 6, right: "바닥" },
  ice: { name: "얼음", d: "0.92", home: [312, 196], stop: CUP.bottom - CUP.unit + 6, right: "식용유와 물" },
} as const;
type O = keyof typeof OBJ;
const GA: Record<string, string> = { w: "물이", o: "식용유가", e: "에탄올이" };

export const g2u1LayerLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-ly" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}
    <g class="g2u1x-ly-liq"></g>
    <path class="g2u1x-ly-stream" d="M${CX} 4 V${CUP.bottom}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0"/>
    <path d="M${CUP.x - 2} 30 V${CUP.bottom - 6} a8 8 0 0 0 8 8 h${CUP.w - 12} a8 8 0 0 0 8 -8 V30" stroke="${P.glass}" stroke-width="2.4"/>
    <path d="M${CUP.x + 8} 44 v120" stroke="${P.glassHi}" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>
    <g class="g2u1x-ly-tags"></g>
    <path d="M236 200 h96" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    <g class="g2u1x-ly-obj" data-o="coin"><ellipse rx="11" ry="5" cy="-5" fill="#D9B45B" stroke="#8A6D25" stroke-width="1.4"/><text y="-17" text-anchor="middle" font-size="12.5" font-weight="800" fill="${P.text}">동전</text></g>
    <g class="g2u1x-ly-obj" data-o="ice"><rect x="-10" y="-20" width="20" height="20" rx="4" fill="#E6F6FF" stroke="#9BD0F2" stroke-width="1.4"/><text y="-26" text-anchor="middle" font-size="12.5" font-weight="800" fill="${P.text}">얼음</text></g>
  </svg>`;
  const liq = f.stage.querySelector(".g2u1x-ly-liq") as SVGGElement;
  const tags = f.stage.querySelector(".g2u1x-ly-tags") as SVGGElement;
  const stream = f.stage.querySelector(".g2u1x-ly-stream") as SVGPathElement;
  const objs: Record<O, SVGGElement> = { coin: f.stage.querySelector("[data-o='coin']") as SVGGElement, ice: f.stage.querySelector("[data-o='ice']") as SVGGElement };

  let stack: K[] = []; // 아래에서 위로
  const poured = new Set<K>();
  const dropped = new Set<O>();
  let tries = 0;

  function paint(fresh?: K): void {
    let y = CUP.bottom;
    let s = "";
    let t = "";
    stack.forEach((k) => {
      const L = LIQ[k];
      const h = CUP.unit * L.vol;
      y -= h;
      s += `<rect class="${k === fresh ? "g2u1x-ly-in" : ""}" x="${CUP.x}" y="${y}" width="${CUP.w - 4}" height="${h}" fill="${L.color}" opacity=".62"/><path d="M${CUP.x} ${y} h${CUP.w - 4}" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/>`;
      t += `<text x="${CUP.x + CUP.w + 8}" y="${y + h / 2 + 4}" font-size="12.5" font-weight="700" fill="${P.text}">${k === "m" ? "물 + 에탄올" : L.name} <tspan fill="${P.yellow}" font-weight="800">${L.d.toFixed(2)}</tspan></text>`;
    });
    liq.innerHTML = s;
    tags.innerHTML = t;
    (Object.keys(OBJ) as O[]).forEach((o) => {
      const [x, y0] = dropped.has(o) ? [CX + (o === "coin" ? -18 : 16), OBJ[o].stop] : OBJ[o].home;
      objs[o].style.transform = `translate(${x}px, ${y0}px)`;
    });
    host.dataset.g2u1Ly = stack.join("");
  }

  const pourBtns = (["w", "o", "e"] as K[]).map((k) => {
    const b = bvBtn("", `${LIQ[k].name} 붓기`);
    b.dataset.k = k;
    b.addEventListener("click", () => pour(k, b));
    return b;
  });
  const bReset = bvBtn("main", "컵을 비우고 다시 붓기");
  bReset.dataset.k = "reset";
  bReset.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    stack = [];
    poured.clear();
    pourBtns.forEach((b) => (b.disabled = false));
    paint();
    f.say("물과 에탄올은 서로 잘 섞여요. 둘이 <b>맞닿지 않게</b> 붓는 차례를 다시 정해 보세요.");
    pourPhase();
  });

  function pour(k: K, b: HTMLButtonElement): void {
    if (poured.has(k)) return;
    haptic(HAPTIC.tap);
    poured.add(k);
    b.disabled = true;
    const top = stack[stack.length - 1];
    let mixed = false;
    if (k === "w" && stack.includes("e")) {
      stack = stack.filter((x) => x !== "e");
      stack.push("m");
      mixed = true;
    } else if (k === "e" && top === "w") {
      stack[stack.length - 1] = "m";
      mixed = true;
    } else stack.push(k);
    const before = stack.join("");
    stack.sort((a, c) => LIQ[c].d - LIQ[a].d);
    const sank = !mixed && before !== stack.join("");
    stream.setAttribute("stroke", LIQ[k].color);
    stream.setAttribute("opacity", ".85");
    tm.later(() => stream.setAttribute("opacity", "0"), 450);
    paint(mixed ? "m" : k);
    if (mixed) f.say("물과 에탄올이 만나 <b>섞여 버렸어요</b>. 섞인 액체는 다시 층으로 나뉘지 않아요.");
    else if (sank) f.say(`${GA[k]} 먼저 부은 액체 <b>아래로</b> 내려가 자리를 잡았어요.`);
    else if (stack.length > 1) f.say(`${GA[k]} 섞이지 않고 <b>위에</b> 층을 이뤘어요.`);
    if (poured.size < 3) return pourPhase();
    pourBtns.forEach((x) => (x.disabled = true));
    tm.later(() => {
      if (stack.join("") === "woe") {
        haptic(HAPTIC.correct);
        f.pips(1);
        f.say("세 층이 됐어요. 아래부터 <b>물, 식용유, 에탄올</b>. 숫자는 밀도(g/cm³)예요.");
        tm.later(dropPhase, 900);
      } else {
        haptic(HAPTIC.wrong);
        tries += 1;
        host.dataset.g2u1Fail = String(tries);
        f.say("층이 <b>둘뿐</b>이에요. 물과 에탄올이 섞였기 때문이에요. 컵을 비우고 다시 해 봐요.");
        f.slot.setControls(bReset);
        api.setCTA("컵을 비우고 다시 부어 보세요", { enabled: false });
        lab.todo("[data-k='reset']");
      }
    }, 700);
  }
  function pourPhase(): void {
    f.slot.setControls(...pourBtns);
    api.setCTA(`세 액체를 차례로 부어 보세요 (${poured.size}/3)`, { enabled: false });
    const next = (["w", "o", "e"] as K[]).find((k) => !poured.has(k));
    lab.todo(next ? `[data-k='${next}']` : undefined);
  }

  const dropBtns: Record<O, HTMLButtonElement> = { coin: bvBtn("", "동전 넣기"), ice: bvBtn("", "얼음 넣기") };
  (Object.keys(OBJ) as O[]).forEach((o) => {
    dropBtns[o].dataset.k = o;
    dropBtns[o].addEventListener("click", () => {
      if (dropped.has(o)) return;
      haptic(HAPTIC.tap);
      const ob = OBJ[o];
      f.say(`${ob.name}의 밀도는 <b>${ob.d}</b>예요. 컵에 넣으면 어디에서 멈출지 먼저 예측해 보세요.`);
      g1Predict(lab, `<b>${ob.name}</b>을 넣으면 어디에서 멈출까요?`, ["바닥까지 가라앉는다", "식용유와 물 사이에 멈춘다", "맨 위에 뜬다"], (picked) => {
        dropped.add(o);
        dropBtns[o].disabled = true;
        paint();
        const head = picked.startsWith(ob.right) ? "예측대로" : "예측과 달리";
        tm.later(() => {
          haptic(HAPTIC.correct);
          f.pips(1 + dropped.size);
          f.say(o === "coin" ? `${head} 동전은 세 액체를 모두 지나 <b>바닥</b>까지 가라앉았어요.` : `${head} 얼음은 에탄올과 식용유를 지나 <b>물 위</b>에서 멈췄어요.`);
          if (dropped.size < 2) dropPhase();
          else tm.later(ask, 1000);
        }, 900);
      });
    });
  });
  function dropPhase(): void {
    if (!dropped.size) f.say("이번에는 <b>동전</b>과 <b>얼음</b>을 넣어 볼 거예요. 넣을 것을 골라 보세요.");
    f.slot.setControls(g1Row(dropBtns.coin, dropBtns.ice));
    api.setCTA("동전과 얼음을 넣어 보세요", { enabled: false });
    lab.todo(dropped.has("coin") ? "[data-k='ice']" : "[data-k='coin']");
  }
  function ask(): void {
    lab.judge(
      "얼음(0.92)이 <b>식용유 아래, 물 위</b>에 멈춘 까닭은?",
      [{ t: "식용유보다 밀도가 크고 물보다 작아서", ok: true }, { t: "세 액체보다 밀도가 작아서" }, { t: "차가워서 식용유보다 무거워져서" }],
      "0.91 &lt; 0.92 &lt; 1.00. 식용유에서는 가라앉고 물에서는 떠요.",
      () => lab.finish("밀도가 <b>작은</b> 물질은 위로 뜨고 <b>큰</b> 물질은 아래로 가라앉아요. 멈춘 자리를 보면 밀도의 순서를 알 수 있어요."),
    );
  }

  paint();
  f.say("빈 컵에 <b>물, 식용유, 에탄올</b>을 부어 세 층을 만들 거예요. 붓는 차례를 정해 보세요.");
  pourPhase();
  return lab.cleanup;
};
