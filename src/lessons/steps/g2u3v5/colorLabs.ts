// [중2 Ⅲ v5] g2u3l6 빛의 합성: 랩 세 판.
//
// 1) g2u3LampLab 「조명이 바뀌면 장미는 무슨 색일까요?」
//    책의 어디에서: 그림 Ⅲ-11(물체는 일부 색의 빛을 흡수하고 나머지를 반사한다. 반사하는 빛의 색으로 보인다)과 스스로 확인하기 3(빨간 조명 아래의 장미꽃과 잎).
//    학생이 정하는 것: 조명의 색(흰색, 빨간색, 초록색). 파란색 조명은 가려 두었다가 예측한 뒤에 켠다.
//    한 통찰: 물체는 반사하는 빛의 색으로 보인다. 반사할 빛이 조명에 없으면 검게 보인다.
//    옛 랩(objectColorLab)은 물체와 조명을 골라 결과를 구경했다. 가려 둔 조명을 예측하는 판정이 없었다.
//
// 2) g2u3TorchLab 「세 빛을 겹치면 무슨 색이 될까요?」
//    책의 어디에서: 해 보기 '빛의 합성 관찰하기'(빨간색, 초록색, 파란색 빛을 내는 손전등을 스크린에 여러 가지로 조합해 비추고 겹친 부분의 색을 표에 쓴다).
//    학생이 정하는 것: 켤 손전등의 조합과 차례. 표의 네 칸(둘씩 세 가지와 셋 모두)은 그 조합을 처음 만들었을 때 채워진다.
//    한 통찰: 빨강, 초록, 파랑 빛을 합치면 다른 색의 빛이 되고, 셋을 모두 합치면 흰색이 된다. 색은 캔버스의 더하기 합성으로 실제로 더한다.
//    옛 랩(colorMixLab)은 스포트라이트를 끌어 겹쳤다. 표를 채우는 판이 아니었다.
//
// 3) g2u3PixelLab 「화면의 색은 무엇으로 만들까요?」
//    책의 어디에서: 탐구 '영상 장치에서 다양한 색이 표현되는 원리 관찰하기'(스마트폰 현미경으로 노트북 화면의 색마다 확대해 화소를 그린다)와 그림 Ⅲ-13.
//    학생이 정하는 것: 확대해 볼 색, 그리고 주문한 색(노란색, 흰색)을 내려고 켤 화소.
//    실패하는 길: 주문한 색과 다른 화소를 켜고 멀리서 보면 화면의 색이 주문한 색과 나란히 어긋나 보인다.
//    한 통찰: 화면은 빨강, 초록, 파랑 화소의 빛을 합성해 색을 낸다.
//    옛 랩(pixelLab)은 돋보기와 밝기 막대였다. 직접 켜서 맞히는 판이 아니었다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBeam, eyeProp } from "../../../ui/lightKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { LX, lxCanvas, lxFrame, lxLog, lxPill, lxSeg, lxText } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}
type Ch = "r" | "g" | "b";
const CH: Ch[] = ["r", "g", "b"];
const RGB: Record<Ch, string> = { r: "255,64,56", g: "56,224,96", b: "64,110,255" };
const CH_NAME: Record<Ch, string> = { r: "빨간색", g: "초록색", b: "파란색" };
/** 켜진 빛의 조합이 내는 색의 이름. */
const mixName = (on: Record<Ch, boolean>): string => {
  const k = `${on.r ? "r" : ""}${on.g ? "g" : ""}${on.b ? "b" : ""}`;
  return ({ "": "꺼짐", r: "빨간색", g: "초록색", b: "파란색", rg: "노란색", rb: "자홍색", gb: "청록색", rgb: "흰색" } as Record<string, string>)[k];
};
const mixCss = (on: Record<Ch, boolean>): string => (on.r && on.g && on.b ? "#FFFFFF" : `rgb(${on.r ? 255 : 16},${on.g ? 240 : 16},${on.b ? 255 : 20})`);

// ══════════════════════════════════════════════════════════
// 1) 조명 아래의 장미
// ══════════════════════════════════════════════════════════
type Light = "w" | "r" | "g" | "b";
const LIGHTS: Record<Light, { name: string; has: Ch[]; css: string }> = {
  w: { name: "흰색 조명", has: ["r", "g", "b"], css: "255,246,220" },
  r: { name: "빨간색 조명", has: ["r"], css: RGB.r },
  g: { name: "초록색 조명", has: ["g"], css: RGB.g },
  b: { name: "파란색 조명", has: ["b"], css: RGB.b },
};

export const lampLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 4, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "lamp";
  host.dataset.lx = "try";

  let light: Light | null = null;
  let asked = false;
  const tried = new Set<Light>();
  const log = lxLog(["흰색 조명", "빨간색 조명", "초록색 조명"]);
  const look = (l: Light): string => `${LIGHTS[l].has.includes("r") ? "빨간" : "검은"} 꽃, ${LIGHTS[l].has.includes("g") ? "초록" : "검은"} 잎`;
  const seg = lxSeg<"w" | "r" | "g">(
    [
      { k: "w", t: "흰색 조명" },
      { k: "r", t: "빨간색 조명" },
      { k: "g", t: "초록색 조명" },
    ],
    "w",
    (k) => {
      if (asked) return;
      light = k;
      tried.add(k);
      haptic(HAPTIC.tap);
      log.set(["w", "r", "g"].indexOf(k), look(k));
      f.pips(tried.size);
      if (k === "w") f.say("흰색 조명에는 여러 색의 빛이 다 들어 있어요. 꽃잎은 <b>빨간색 빛</b>을, 잎은 <b>초록색 빛</b>을 반사해요.");
      else if (k === "r") f.say("빨간색 빛뿐이에요. 꽃잎은 그 빛을 반사하지만, 잎은 반사할 초록색 빛이 없어 <b>검게</b> 보여요.");
      else f.say("초록색 빛뿐이에요. 잎은 그 빛을 반사하지만, 꽃잎은 반사할 빨간색 빛이 없어 <b>검게</b> 보여요.");
      if (tried.size === 3) {
        asked = true;
        host.dataset.lx = "ask";
        tm.later(() => {
          f.slot.ask(
            "파란색 조명만 비추면 빨간 장미꽃과 초록 잎은 어떻게 보일까요?",
            [{ t: "꽃도 잎도 검게 보여요", ok: true }, { t: "꽃도 잎도 파랗게 보여요" }, { t: "꽃은 빨갛게, 잎은 초록으로 보여요" }],
            (ok) => api.recordQuiz(ok),
            { why: "꽃잎은 빨간색 빛만, 잎은 초록색 빛만 반사해요. 파란색 빛은 둘 다 <b>흡수</b>해요.", onNext: finish },
          );
        }, 2600);
      }
    },
    "low",
  );
  seg.btns.w.classList.remove("on");
  f.slot.setControls(seg.el, el("div", { class: "g2u3x-cap", text: "조명마다 보이는 색" }), log.el);

  function finish(): void {
    light = "b";
    host.dataset.lx = "done";
    f.pips(4);
    f.say("파란색 조명을 켰어요. 꽃잎도 잎도 반사할 빛이 없어 <b>검게</b> 보여요.");
    f.slot.conclude("물체는 자신이 <b>반사하는 빛의 색</b>으로 보여요. 반사할 색의 빛이 조명에 없으면 <b>검게</b> 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const LAMP = { x: 150, y: 16 };
  const PETAL = { x: 118, y: 104 };
  const LEAF = { x: 156, y: 164 };
  const EYE = { x: 312, y: 112 };
  st.run((ctx, t) => {
    const has = light ? LIGHTS[light].has : [];
    // 조명
    if (light) {
      const cone = ctx.createLinearGradient(0, LAMP.y, 0, 214);
      cone.addColorStop(0, `rgba(${LIGHTS[light].css},.34)`);
      cone.addColorStop(1, `rgba(${LIGHTS[light].css},.04)`);
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(LAMP.x - 12, LAMP.y + 8);
      ctx.lineTo(40, 214);
      ctx.lineTo(250, 214);
      ctx.lineTo(LAMP.x + 12, LAMP.y + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#93A3C0";
    ctx.beginPath();
    ctx.roundRect(LAMP.x - 16, LAMP.y - 8, 32, 16, 5);
    ctx.fill();
    ctx.fillStyle = light ? `rgba(${LIGHTS[light].css},1)` : "#4B5672";
    ctx.beginPath();
    ctx.ellipse(LAMP.x, LAMP.y + 9, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // 장미: 줄기, 잎, 꽃잎
    const petal = has.includes("r") ? "#E8453C" : light ? "#1C1216" : "#5A2A2E";
    const petalIn = has.includes("r") ? "#B92D2A" : light ? "#120B0E" : "#40181C";
    const leaf = has.includes("g") ? "#3FAE5A" : light ? "#101812" : "#274A30";
    ctx.strokeStyle = leaf;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(PETAL.x + 2, PETAL.y + 24);
    ctx.quadraticCurveTo(PETAL.x + 8, 170, PETAL.x + 2, 212);
    ctx.stroke();
    ctx.fillStyle = leaf;
    ctx.beginPath();
    ctx.ellipse(LEAF.x, LEAF.y, 26, 11, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(PETAL.x - 30, LEAF.y + 16, 22, 9, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = petal;
    [[-16, 4], [16, 4], [0, -14], [-10, 16], [10, 16]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(PETAL.x + dx, PETAL.y + dy, 17, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = petalIn;
    ctx.beginPath();
    ctx.arc(PETAL.x, PETAL.y + 2, 9, 0, Math.PI * 2);
    ctx.fill();
    // 빛의 길: 조명에 든 색마다 한 줄기씩. 반사하는 색만 눈으로 간다
    const flow = (t / 900) % 1;
    const ray = (target: { x: number; y: number }, keep: Ch, off: number): void => {
      has.forEach((c, i) => {
        const o = (i - (has.length - 1) / 2) * 5 + off;
        const hit = { x: target.x + o, y: target.y - 8 };
        drawBeam(ctx, [{ x: LAMP.x + o * 0.4, y: LAMP.y + 14 }, hit], { rgb: RGB[c], width: 1.6, flow, glow: false, alpha: 0.9 });
        if (c === keep) drawBeam(ctx, [hit, { x: EYE.x - 16, y: EYE.y + (target === PETAL ? -4 : 6) }], { rgb: RGB[c], width: 1.8, flow, arrow: true });
        else {
          ctx.fillStyle = `rgba(${RGB[c]},.9)`;
          ctx.beginPath();
          ctx.arc(hit.x, hit.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };
    if (light) {
      ray(PETAL, "r", 0);
      ray(LEAF, "g", 10);
    }
    eyeProp(ctx, EYE.x, EYE.y, Math.PI, 14);
    lxText(ctx, "눈", EYE.x, EYE.y + 24, { color: LX.dim });
    lxText(ctx, "꽃잎", PETAL.x - 44, PETAL.y - 8, { color: LX.dim });
    lxText(ctx, "잎", LEAF.x + 36, LEAF.y + 14, { color: LX.dim });
    if (light) lxPill(ctx, `${LIGHTS[light].name}: ${look(light)}`, `rgb(${LIGHTS[light].css})`, true, 196);
    else lxPill(ctx, "조명이 꺼져 있어요", LX.dim, true, 196);
  });

  f.say("빨간 장미꽃과 초록 잎이에요. <b>조명의 색</b>을 바꿔 가며 꽃잎과 잎이 무슨 색으로 보이는지 살펴보세요.");
  api.setCTA("세 가지 조명을 켜 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 2) 세 가지 색 손전등
// ══════════════════════════════════════════════════════════
/** 켜고 끄는 버튼 세 개(빨강, 초록, 파랑). */
function chToggles(label: (c: Ch) => string, onChange: (on: Record<Ch, boolean>) => void): { el: HTMLElement; on: Record<Ch, boolean>; set: (v: Record<Ch, boolean>) => void; lock: (v: boolean) => void } {
  const on: Record<Ch, boolean> = { r: false, g: false, b: false };
  const btns = CH.map((c) => {
    const b = el("button", { class: `g2u3x-seg g2u3x-ch ${c}`, attrs: { type: "button", "aria-pressed": "false" } }, el("b", { text: label(c) }), el("i", { text: "꺼짐" })) as HTMLButtonElement;
    b.dataset.k = c;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      on[c] = !on[c];
      paint();
      haptic(HAPTIC.tap);
      onChange(on);
    });
    return b;
  });
  const paint = (): void => {
    btns.forEach((b, i) => {
      const v = on[CH[i]];
      b.classList.toggle("on", v);
      b.setAttribute("aria-pressed", String(v));
      (b.querySelector("i") as HTMLElement).textContent = v ? "켜짐" : "꺼짐";
    });
  };
  const box = el("div", { class: "g2u3x-segs" }, ...btns);
  box.style.gridTemplateColumns = "repeat(3, 1fr)";
  return {
    el: box,
    on,
    set(v) {
      CH.forEach((c) => (on[c] = v[c]));
      paint();
    },
    lock(v) {
      btns.forEach((b) => (b.disabled = v));
    },
  };
}

export const torchLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 4, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "torch";
  host.dataset.lx = "mix";

  const COMBOS = ["rg", "rb", "gb", "rgb"];
  const log = lxLog(["빨강+초록", "빨강+파랑", "초록+파랑", "셋 모두"], "four");
  const found = new Set<string>();
  let asked = false;
  const tg = chToggles(
    (c) => `${CH_NAME[c].slice(0, 2)} 손전등`,
    (on) => {
      if (asked) return;
      const k = `${on.r ? "r" : ""}${on.g ? "g" : ""}${on.b ? "b" : ""}`;
      const i = COMBOS.indexOf(k);
      if (i >= 0 && !found.has(k)) {
        found.add(k);
        log.set(i, mixName(on));
        haptic(HAPTIC.correct);
        f.pips(found.size);
      }
      if (k.length === 0) f.say("손전등이 모두 꺼졌어요. 두 개 이상을 함께 켜 겹친 곳을 보세요.");
      else if (k.length === 1) f.say(`${CH_NAME[k as Ch]} 빛 하나예요. 다른 손전등을 <b>함께</b> 켜면 겹친 곳은 무슨 색일까요?`);
      else f.say(`겹친 곳이 <b>${mixName(on)}</b>으로 보여요. ${found.size < 4 ? `남은 조합 ${4 - found.size}가지도 만들어 보세요.` : "네 가지를 모두 찾았어요."}`);
      if (found.size === 4) {
        asked = true;
        tg.lock(true);
        host.dataset.lx = "ask";
        tm.later(() => {
          f.slot.ask(
            "노란색 빛에 어떤 색 빛을 더 비추면 흰색 빛이 될까요?",
            [{ t: "파란색 빛", ok: true }, { t: "빨간색 빛" }, { t: "초록색 빛" }],
            (ok) => api.recordQuiz(ok),
            { why: "노란색은 빨강과 초록을 합친 빛이에요. 남은 <b>파랑</b>을 더하면 셋이 모두 모여요.", onNext: finish },
          );
        }, 2200);
      }
    },
  );
  f.slot.setControls(tg.el, el("div", { class: "g2u3x-cap", text: "겹친 곳의 색" }), log.el);

  function finish(): void {
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("빨강, 초록, 파랑 빛을 겹치면 <b>다른 색의 빛</b>으로 보여요. 세 빛을 모두 겹치면 <b>흰색</b>이 돼요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const SPOT: Record<Ch, { x: number; y: number }> = { r: { x: 146, y: 92 }, g: { x: 200, y: 92 }, b: { x: 173, y: 136 } };
  st.run((ctx) => {
    // 스크린
    ctx.fillStyle = "#05080F";
    ctx.beginPath();
    ctx.roundRect(52, 22, 242, 186, 12);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(52, 22, 242, 186, 12);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    CH.forEach((c) => {
      if (!tg.on[c]) return;
      const g = ctx.createRadialGradient(SPOT[c].x, SPOT[c].y, 30, SPOT[c].x, SPOT[c].y, 56);
      g.addColorStop(0, `rgba(${RGB[c]},1)`);
      g.addColorStop(0.92, `rgba(${RGB[c]},1)`);
      g.addColorStop(1, `rgba(${RGB[c]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(SPOT[c].x, SPOT[c].y, 56, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    ctx.strokeStyle = "rgba(214,230,250,.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(52, 22, 242, 186, 12);
    ctx.stroke();
    lxText(ctx, "스크린", 80, 38, { color: LX.dim });
    const n = CH.filter((c) => tg.on[c]).length;
    if (n >= 2) lxPill(ctx, `겹친 곳: ${mixName(tg.on)}`, mixCss(tg.on), true, 174);
  });

  f.say("빨간색, 초록색, 파란색 손전등이 있어요. 원하는 대로 <b>켜고 꺼서</b> 스크린에서 빛이 겹친 곳의 색을 살펴보세요.");
  api.setCTA("네 가지 조합을 만들어 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 3) 화소 확대
// ══════════════════════════════════════════════════════════
export const pixelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 4, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "pixel";
  host.dataset.lx = "look";

  let phase: "look" | "make" | "end" = "look";
  let patch: Ch | null = null; // 확대해 보는 색
  const looked = new Set<Ch>();
  const GOALS: { name: string; on: Record<Ch, boolean> }[] = [
    { name: "노란색", on: { r: true, g: true, b: false } },
    { name: "흰색", on: { r: true, g: true, b: true } },
  ];
  let goal = 0;
  let checked: "" | "ok" | "no" = "";

  const seg = lxSeg<Ch>(
    CH.map((c) => ({ k: c, t: `${CH_NAME[c]} 부분`, sub: "확대해 보기" })),
    "r",
    (k) => {
      if (phase !== "look") return;
      patch = k;
      looked.add(k);
      haptic(HAPTIC.tap);
      seg.done(k);
      f.say(`${CH_NAME[k]} 부분에서는 <b>${CH_NAME[k]} 빛</b>을 내는 화소만 켜져 있어요.${looked.size < 3 ? " 다른 색 부분도 확대해 보세요." : ""}`);
      if (looked.size === 3) {
        f.pips(1);
        tm.later(startMake, 2200);
      }
    },
  );
  seg.btns.r.classList.remove("on");
  const tg = chToggles(
    (c) => `${CH_NAME[c].slice(0, 2)} 화소`,
    () => {
      checked = "";
    },
  );
  const confirm = bvBtn("main", "멀리서 화면 보기");
  confirm.dataset.k = "confirm";
  f.slot.setControls(seg.el);

  function startMake(): void {
    phase = "make";
    host.dataset.lx = "make";
    patch = null;
    tg.set({ r: false, g: false, b: false });
    f.slot.setControls(tg.el, confirm);
    f.say(`이번에는 직접 켜요. 화면이 <b>${GOALS[goal].name}</b>으로 보이게 화소를 켜고 <b>멀리서 화면 보기</b>를 눌러요.`);
    api.setCTA("주문한 색을 만들어 보세요", { enabled: false });
  }
  confirm.addEventListener("click", () => {
    if (phase !== "make") return;
    const g = GOALS[goal];
    const same = CH.every((c) => tg.on[c] === g.on[c]);
    if (!same) {
      checked = "no";
      haptic(HAPTIC.wrong);
      f.say(CH.every((c) => !tg.on[c]) ? "화소가 모두 꺼져 화면이 <b>검게</b> 보여요. 화소를 켜 보세요." : `멀리서 보니 <b>${mixName(tg.on)}</b>이에요. 주문한 ${g.name}과 달라요. 켠 화소를 바꿔 보세요.`);
      return;
    }
    checked = "ok";
    haptic(HAPTIC.correct);
    f.pips(2 + goal);
    if (goal === 0) {
      f.say("노란색 화면이 됐어요. 노란 화소는 없는데도 <b>빨강과 초록</b> 빛이 합쳐져 노랗게 보여요.");
      tg.lock(true);
      tm.later(() => {
        goal = 1;
        checked = "";
        tg.lock(false);
        tg.set({ r: false, g: false, b: false });
        f.say("이번 주문은 <b>흰색</b>이에요. 화소를 켜고 멀리서 확인해 보세요.");
      }, 2400);
      return;
    }
    phase = "end";
    tg.lock(true);
    host.dataset.lx = "ask";
    f.say("세 화소를 모두 켜자 <b>흰색</b> 화면이 됐어요.");
    tm.later(() => {
      f.slot.ask(
        "자홍색으로 보이는 화면을 확대하면 어떤 화소가 켜져 있을까요?",
        [{ t: "빨강 화소와 파랑 화소", ok: true }, { t: "빨강 화소와 초록 화소" }, { t: "초록 화소와 파랑 화소" }],
        (ok) => api.recordQuiz(ok),
        { why: "자홍색은 <b>빨강과 파랑</b> 빛을 합친 색이에요. 손전등 실험의 표와 같아요.", onNext: finish },
      );
    }, 2200);
  });
  function finish(): void {
    host.dataset.lx = "done";
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("화면은 <b>빨강, 초록, 파랑</b> 빛을 내는 아주 작은 화소로 이루어져 있어요. 화소의 빛이 합성되어 여러 가지 색으로 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const SCR = { x: 16, y: 44, w: 150, h: 96 };
  const VIEW = { x: 262, y: 112, r: 66 };
  st.run((ctx) => {
    // 노트북
    ctx.fillStyle = "#2B3650";
    ctx.beginPath();
    ctx.roundRect(SCR.x - 6, SCR.y - 6, SCR.w + 12, SCR.h + 12, 8);
    ctx.fill();
    ctx.fillStyle = "#3D4A68";
    ctx.beginPath();
    ctx.moveTo(SCR.x - 16, SCR.y + SCR.h + 22);
    ctx.lineTo(SCR.x - 4, SCR.y + SCR.h + 8);
    ctx.lineTo(SCR.x + SCR.w + 4, SCR.y + SCR.h + 8);
    ctx.lineTo(SCR.x + SCR.w + 16, SCR.y + SCR.h + 22);
    ctx.closePath();
    ctx.fill();
    // 화면
    let lit: Record<Ch, boolean>;
    if (phase === "look") {
      CH.forEach((c, i) => {
        ctx.fillStyle = `rgb(${RGB[c]})`;
        ctx.fillRect(SCR.x + (SCR.w / 3) * i, SCR.y, SCR.w / 3, SCR.h);
      });
      lit = { r: patch === "r", g: patch === "g", b: patch === "b" };
      if (patch) {
        // 스마트폰 현미경이 놓인 자리
        const cx = SCR.x + (SCR.w / 3) * (CH.indexOf(patch) + 0.5);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, SCR.y + SCR.h / 2, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(255,255,255,.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + 12, SCR.y + SCR.h / 2 - 6);
        ctx.lineTo(VIEW.x - VIEW.r + 6, VIEW.y - 30);
        ctx.moveTo(cx + 12, SCR.y + SCR.h / 2 + 6);
        ctx.lineTo(VIEW.x - VIEW.r + 6, VIEW.y + 30);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      lit = tg.on;
      // 멀리서 본 화면: 확인을 누른 뒤에만 합쳐진 색으로 보인다
      ctx.fillStyle = checked ? mixCss(tg.on) : "#0A0E16";
      ctx.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
      if (!checked) lxText(ctx, "멀리서 본 화면", SCR.x + SCR.w / 2, SCR.y + SCR.h / 2, { color: LX.dim });
      // 주문한 색
      const g = GOALS[goal];
      ctx.fillStyle = mixCss(g.on);
      ctx.beginPath();
      ctx.roundRect(SCR.x + 96, SCR.y + SCR.h + 34, 30, 22, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      lxText(ctx, `주문한 색: ${g.name}`, SCR.x + 44, SCR.y + SCR.h + 45, { color: LX.ink });
    }
    lxText(ctx, "노트북 화면", SCR.x + SCR.w / 2, SCR.y - 18, { color: LX.dim });
    // 확대한 모습(둥근 창)
    ctx.save();
    ctx.beginPath();
    ctx.arc(VIEW.x, VIEW.y, VIEW.r, 0, Math.PI * 2);
    ctx.fillStyle = "#05070C";
    ctx.fill();
    ctx.clip();
    if (phase !== "look" || patch) {
      const bw = 9;
      const gap = 3;
      const cell = bw * 3 + gap * 3 + 4;
      for (let row = -3; row <= 3; row++)
        for (let col = -3; col <= 3; col++) {
          const x0 = VIEW.x + col * cell - cell / 2 + 2;
          const y0 = VIEW.y + row * 30 - 13;
          CH.forEach((c, i) => {
            ctx.fillStyle = lit[c] ? `rgb(${RGB[c]})` : "rgba(70,78,98,.55)";
            ctx.beginPath();
            ctx.roundRect(x0 + i * (bw + gap), y0, bw, 25, 2.5);
            ctx.fill();
          });
        }
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(214,230,250,.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(VIEW.x, VIEW.y, VIEW.r, 0, Math.PI * 2);
    ctx.stroke();
    lxText(ctx, phase === "look" && !patch ? "확대할 곳을 골라요" : "확대한 화소", VIEW.x, VIEW.y + VIEW.r + 16, { color: LX.ink });
    if (checked === "ok") lxPill(ctx, "주문한 색과 같아요", LX.green);
    else if (checked === "no") lxPill(ctx, "주문한 색과 달라요", LX.red);
  });

  f.say("노트북 화면에 스마트폰 현미경을 대요. <b>빨간색, 초록색, 파란색 부분</b>을 차례로 확대해 무엇이 켜져 있는지 보세요.");
  api.setCTA("세 부분을 확대해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
