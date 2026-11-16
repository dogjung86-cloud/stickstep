// [중2 Ⅲ v5] g2u3l6 빛의 합성: 랩 세 판.
//
// 1) g2u3LampLab 「조명의 색이 바뀌면 장미는 무슨 색으로 보일까요?」
//    책의 어디에서: 그림 Ⅲ-11(물체는 일부 색의 빛을 흡수하고 나머지를 반사한다. 반사하는 빛의 색으로 보인다)과 스스로 확인하기 3(빨간 조명 아래의 장미꽃과 잎).
//    학생이 정하는 것: 조명의 색(흰색, 빨간색, 초록색). 파란색 조명은 가려 두었다가 예측한 뒤에 켠다.
//    한 통찰: 물체는 반사하는 빛의 색으로 보인다. 반사할 빛이 조명에 없으면 검게 보인다.
//    옛 랩(objectColorLab)은 물체와 조명을 골라 결과를 구경했다. 가려 둔 조명을 예측하는 판정이 없었다.
//
// 2) g2u3TorchLab 「빨강, 초록, 파랑 빛을 겹치면 무슨 색이 될까요?」
//    책의 어디에서: 해 보기 '빛의 합성 관찰하기'(빨간색, 초록색, 파란색 빛을 내는 손전등을 스크린에 여러 가지로 조합해 비추고 겹친 부분의 색을 표에 쓴다).
//    학생이 정하는 것: 켤 손전등의 조합과 차례. 표의 네 칸(둘씩 세 가지와 셋 모두)은 그 조합을 처음 만들었을 때 채워진다.
//    한 통찰: 빨강, 초록, 파랑 빛을 합치면 다른 색의 빛이 되고, 셋을 모두 합치면 흰색이 된다. 색은 캔버스의 더하기 합성으로 실제로 더한다.
//    옛 랩(colorMixLab)은 스포트라이트를 끌어 겹쳤다. 표를 채우는 판이 아니었다.
//
// 3) g2u3PixelLab 「영상 장치의 화면은 어떻게 여러 가지 색을 나타낼까요?」
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
  const f = lxFrame(host, { title: s.title, steps: 4, api, tall: true });
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
      if (k === "w") f.say("흰색 조명에는 여러 색의 빛이 모두 들어 있어요. 그래서 꽃잎은 <b>빨간색 빛</b>을, 잎은 <b>초록색 빛</b>을 반사하여 원래 색으로 보여요.");
      else if (k === "r") f.say("빨간색 조명 아래에서는 꽃잎만 빨간색 빛을 반사해 빨갛게 보이고, 초록 잎은 반사할 초록색 빛이 없어 <b>검은색</b>으로 보여요.");
      else f.say("초록색 조명 아래에서는 반대로 초록 잎만 초록색으로 보이고, 빨간 꽃잎은 반사할 빨간색 빛이 없어 <b>검은색</b>으로 보여요.");
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
    f.say("파란색 조명 아래에서는 꽃잎과 잎 모두 파란색 빛을 반사하지 못하므로 <b>둘 다 검은색</b>으로 보여요.");
    f.slot.conclude("물체는 그 물체가 <b>반사하여 우리 눈에 들어오는 빛의 색</b>으로 보여요. 반사하는 빛이 전혀 없으면 <b>검은색</b>으로 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // 무대: 조명이 비추는 회색 판 앞에 장미가 서 있다. 판은 모든 색의 빛을 조금씩 반사해 조명의 색으로 어둑하게 물들고,
  // 반사할 빛이 없는 꽃잎과 잎은 그 앞에 검은 실루엣(밝은 테 한 줄)으로 선다. 남색 무대에 바로 두면 검은 꽃이 사라진 것처럼 읽혔다.
  const LAMP = { x: 128, y: 16 };
  const PETAL = { x: 118, y: 96 }; // 꽃 가운데
  const LEAF = { x: 150, y: 160 }; // 오른쪽 잎(빛은 이 점보다 8 위, 잎맥 위에 닿는다)
  const EYE = { x: 312, y: 112 };
  const BOARD = { x: 40, y: 38, w: 212, h: 176 };
  type Tone = { base: string; hi: string; lo: string; deep: string; rim: string | null };
  const PETAL_TONE: Record<"lit" | "black" | "off", Tone> = {
    lit: { base: "#E2362F", hi: "#FF6E5E", lo: "#A8211E", deep: "#741214", rim: null },
    black: { base: "#1A151B", hi: "#2B242D", lo: "#100C11", deep: "#080609", rim: "rgba(226,232,242,.42)" },
    off: { base: "#4A2427", hi: "#5D2E32", lo: "#35181B", deep: "#250F12", rim: null },
  };
  const LEAF_TONE: Record<"lit" | "black" | "off", Tone> = {
    lit: { base: "#3DAA57", hi: "#6ECB80", lo: "#2A8443", deep: "#B9ECC4", rim: null },
    black: { base: "#151917", hi: "#232927", lo: "#0C0F0D", deep: "#2F3633", rim: "rgba(226,232,242,.42)" },
    off: { base: "#24432D", hi: "#2E5438", lo: "#1A3222", deep: "#3E6148", rim: null },
  };
  const toneOf = (on: boolean): "lit" | "black" | "off" => (!light ? "off" : on ? "lit" : "black");
  /** 판: 조명 빛의 0.6배(가운데)에서 0.32배(가장자리)로 물든다. 조명이 꺼져 있으면 어두운 회색. */
  const drawBoard = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 14);
    if (light) {
      const [r, g, b] = LIGHTS[light].css.split(",").map(Number);
      const mix = (k: number): string => `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
      const grad = ctx.createRadialGradient(PETAL.x + 6, PETAL.y + 20, 12, PETAL.x + 6, PETAL.y + 20, 150);
      grad.addColorStop(0, mix(0.6));
      grad.addColorStop(1, mix(0.32));
      ctx.fillStyle = grad;
    } else ctx.fillStyle = "#283041";
    ctx.fill();
    ctx.strokeStyle = "rgba(232,238,249,.16)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };
  /** 잎 하나: 밑동 b에서 끝 tip까지, 너비 w. 반쪽은 어둡게, 가운데 잎맥과 곁잎맥을 긋는다. */
  const drawLeaf = (ctx: CanvasRenderingContext2D, b: { x: number; y: number }, tip: { x: number; y: number }, w: number, tn: Tone): void => {
    const dx = tip.x - b.x;
    const dy = tip.y - b.y;
    const L = Math.hypot(dx, dy);
    const nx = -dy / L;
    const ny = dx / L;
    const mx = (b.x + tip.x) / 2;
    const my = (b.y + tip.y) / 2;
    const side = (s: number): void => {
      ctx.quadraticCurveTo(mx + nx * w * s, my + ny * w * s, tip.x, tip.y);
    };
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    side(1);
    ctx.quadraticCurveTo(mx - nx * w, my - ny * w, b.x, b.y);
    ctx.fillStyle = tn.base;
    ctx.fill();
    if (tn.rim) {
      ctx.strokeStyle = tn.rim;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    // 아래쪽 반은 그늘
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.quadraticCurveTo(mx - nx * w, my - ny * w, tip.x, tip.y);
    ctx.closePath();
    ctx.fillStyle = tn.lo;
    ctx.fill();
    // 잎맥
    ctx.strokeStyle = tn.deep;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = tn.rim ? 1 : 0.75;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(tip.x, tip.y);
    [0.3, 0.52, 0.74].forEach((k) => {
      const px = b.x + dx * k;
      const py = b.y + dy * k;
      const reach = w * 0.5 * (1 - Math.abs(k - 0.5));
      [1, -1].forEach((s) => {
        ctx.moveTo(px, py);
        ctx.lineTo(px + (dx / L) * reach * 0.9 + nx * reach * s, py + (dy / L) * reach * 0.9 + ny * reach * s);
      });
    });
    ctx.stroke();
    ctx.restore();
  };
  /** 장미(앞에서 본 겹꽃잎): 바깥 다섯, 가운데 다섯, 안쪽 셋, 말린 속. 색 면을 크게 두고 톤은 셋만 쓴다. */
  const drawRose = (ctx: CanvasRenderingContext2D, tn: Tone): void => {
    const { x: fx, y: fy } = PETAL;
    const petal = (dist: number, a: number, rr: number, rt: number, fill: string, edge: string | null): void => {
      const ar = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.ellipse(fx + Math.cos(ar) * dist, fy + Math.sin(ar) * dist, rr, rt, ar, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      if (edge) {
        ctx.strokeStyle = edge;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };
    ctx.save();
    // 실루엣의 밝은 테: 바깥 꽃잎 둘레만 한 번
    if (tn.rim) {
      ctx.strokeStyle = tn.rim;
      ctx.lineWidth = 2.6;
      for (let k = 0; k < 5; k++) {
        const ar = ((-90 + 72 * k) * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(ar) * 20, fy + Math.sin(ar) * 20, 14, 18, ar, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    for (let k = 0; k < 5; k++) petal(20, -90 + 72 * k, 14, 18, tn.base, tn.lo);
    for (let k = 0; k < 5; k++) petal(12, -54 + 72 * k, 11, 14, tn.lo, tn.deep);
    for (let k = 0; k < 3; k++) petal(5.5, -70 + 120 * k, 8, 10, tn.base, tn.lo);
    // 말린 속
    ctx.fillStyle = tn.deep;
    ctx.beginPath();
    ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tn.hi;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const th = (i / 30) * Math.PI * 3;
      const rr = 1 + (i / 30) * 4.6;
      const px = fx + Math.cos(th) * rr;
      const py = fy + Math.sin(th) * rr;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  };
  st.run((ctx, t) => {
    const has = light ? LIGHTS[light].has : [];
    drawBoard(ctx);
    // 조명(빛 원뿔은 옅게: 판의 색이 조명의 색을 말한다)
    if (light) {
      const cone = ctx.createLinearGradient(0, LAMP.y, 0, 150);
      cone.addColorStop(0, `rgba(${LIGHTS[light].css},.26)`);
      cone.addColorStop(1, `rgba(${LIGHTS[light].css},0)`);
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(LAMP.x - 12, LAMP.y + 8);
      ctx.lineTo(LAMP.x - 80, 150);
      ctx.lineTo(LAMP.x + 80, 150);
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
    const pt = PETAL_TONE[toneOf(has.includes("r"))];
    const lt = LEAF_TONE[toneOf(has.includes("g"))];
    ctx.save();
    ctx.lineCap = "round";
    if (lt.rim) {
      ctx.strokeStyle = lt.rim;
      ctx.lineWidth = 7.6;
      ctx.beginPath();
      ctx.moveTo(PETAL.x + 2, PETAL.y + 30);
      ctx.quadraticCurveTo(PETAL.x + 9, 166, PETAL.x + 3, 210);
      ctx.stroke();
    }
    ctx.strokeStyle = lt.base;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(PETAL.x + 2, PETAL.y + 30);
    ctx.quadraticCurveTo(PETAL.x + 9, 166, PETAL.x + 3, 210);
    ctx.stroke();
    ctx.restore();
    drawLeaf(ctx, { x: PETAL.x + 6, y: 166 }, { x: PETAL.x + 60, y: 136 }, 17, lt);
    drawLeaf(ctx, { x: PETAL.x + 5, y: 188 }, { x: PETAL.x - 44, y: 170 }, 15, lt);
    drawRose(ctx, pt);
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
      ray(LEAF, "g", 0);
    }
    eyeProp(ctx, EYE.x, EYE.y, Math.PI, 14);
    lxText(ctx, "눈", EYE.x, EYE.y + 24, { color: LX.dim });
    lxText(ctx, "꽃잎", PETAL.x - 54, PETAL.y - 26, { color: LX.ink });
    lxText(ctx, "잎", PETAL.x + 76, 130, { color: LX.ink });
    if (light) lxPill(ctx, `${LIGHTS[light].name}: ${look(light)}`, `rgb(${LIGHTS[light].css})`, true, 196);
    else lxPill(ctx, "조명이 꺼져 있어요", LX.dim, true, 196);
  });

  f.say("낮에 볼 때 빨간 꽃잎과 초록 잎을 가진 장미예요. <b>세 가지 조명</b>을 차례로 비추어 보고, 장미의 꽃잎과 잎이 각각 무슨 색으로 보이는지 살펴보세요.");
  api.setCTA("세 가지 색의 조명을 차례로 모두 켜 보세요", { enabled: false });
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
  const f = lxFrame(host, { title: s.title, steps: 4, api, tall: true });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "torch";
  host.dataset.lx = "mix";

  const COMBOS = ["rg", "rb", "gb", "rgb"];
  const log = lxLog(["빨강 + 초록", "빨강 + 파랑", "초록 + 파랑", "세 빛 모두"], "four");
  const found = new Set<string>();
  let asked = false;
  const tg = chToggles(
    (c) => `${CH_NAME[c]} 손전등`,
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
      if (k.length === 0) f.say("손전등이 모두 꺼져 있어요. 손전등을 <b>두 개 이상</b> 켜서 빛을 겹쳐 보세요.");
      else if (k.length === 1) f.say("손전등이 하나만 켜져 있어요. <b>다른 색 손전등</b>을 하나 더 켜서 빛을 겹쳐 보세요.");
      else f.say(`겹친 부분이 <b>${mixName(on)}</b>으로 보여요! ${found.size < 4 ? `손전등을 바꾸어 켜며 남은 조합(${4 - found.size}개)도 찾아보세요.` : "네 가지 합성 색을 모두 찾았어요!"}`);
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
    f.say("세 가지 빛을 합쳐 여러 가지 색의 빛을 만들어 보았어요! 아래 핵심 정리를 읽어 보세요.");
    f.slot.conclude("빛의 삼원색인 <b>빨간색, 초록색, 파란색</b> 빛을 합치면 노란색, 자홍색, 청록색 빛을 만들 수 있고, 세 빛을 모두 합치면 <b>흰색</b> 빛이 돼요.");
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
    // 글이 길어져(빛이 겹친 곳) 띠의 왼쪽 끝이 파란 빛의 가장자리에 닿아서 6px 내려 그 원 밖에 둔다(스크린 안쪽 끝 208에 띠 아래 끝 206).
    if (n >= 2) lxPill(ctx, `빛이 겹친 곳: ${mixName(tg.on)}`, mixCss(tg.on), true, 180);
  });

  // 무대의 스크린은 더하기 합성이 보이게 어둡게 그렸다. 수정안의 '하얀 스크린'은 무대와 맞지 않아 '스크린'으로 둔다.
  f.say("스크린에 빨간색, 초록색, 파란색 손전등을 비추어 볼 거예요. 손전등을 자유롭게 켜고 끄면서 <b>아래 표의 네 가지 빛 조합</b>을 모두 만들어 보세요.");
  api.setCTA("손전등을 조합해 표의 네 칸을 모두 채워 보세요", { enabled: false });
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
  const f = lxFrame(host, { title: s.title, steps: 4, api, tall: true });
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
    f.say(`이번에는 직접 켜요. 빨강, 초록, 파랑 <b>화소</b>를 알맞게 켜고 아래 <b>멀리서 화면 보기</b> 버튼을 눌러 먼저 <b>${GOALS[goal].name} 화면</b>을 만들어 보세요.`);
    api.setCTA("화소를 켜서 노란색 화면과 흰색 화면을 차례로 만들어 보세요", { enabled: false });
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
      f.say("맞아요! 빨강 화소와 초록 화소를 함께 켜면 멀리서 볼 때 두 빛이 합쳐져 <b>노란색</b>으로 보여요.");
      tg.lock(true);
      tm.later(() => {
        goal = 1;
        checked = "";
        tg.lock(false);
        tg.set({ r: false, g: false, b: false });
        f.say("이제 <b>흰색 화면</b>도 만들어 보세요.");
      }, 2400);
      return;
    }
    phase = "end";
    tg.lock(true);
    host.dataset.lx = "ask";
    f.say("맞아요! 빨강, 초록, 파랑 세 화소를 모두 켜면 멀리서 볼 때 <b>흰색</b>으로 보여요!");
    tm.later(() => {
      f.slot.ask(
        "화면에서 자홍색으로 보이는 부분을 돋보기나 현미경으로 크게 확대해 보면 어떤 화소가 켜져 있을까요?",
        [{ t: "빨강 화소와 파랑 화소", ok: true }, { t: "빨강 화소와 초록 화소" }, { t: "초록 화소와 파랑 화소" }],
        (ok) => api.recordQuiz(ok),
        { why: "영상 장치의 화면에는 빨강, 초록, 파랑 화소만 들어 있어요. 자홍색은 <b>빨간 빛과 파란 빛</b>이 합쳐져서 만들어진 색이에요.", onNext: finish },
      );
    }, 2200);
  });
  function finish(): void {
    host.dataset.lx = "done";
    f.pips(4);
    f.say("화면 속 화소들이 빛의 합성으로 색을 만드는 원리를 확인했어요! 아래 핵심 정리를 읽어 보세요.");
    f.slot.conclude("영상 장치의 화면은 <b>빨간색, 초록색, 파란색(RGB) 화소</b>에서 나오는 빛을 합성하여 다양한 색을 나타내요.");
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
    // 판정 알약은 오른쪽 위에 둔다(왼쪽 위에 두면 "노트북 화면" 이름표를 덮었다. 확대 원의 위끝 46보다 위라 원도 가리지 않는다)
    if (checked === "ok") lxPill(ctx, "주문한 색과 같아요", LX.green, true);
    else if (checked === "no") lxPill(ctx, "주문한 색과 달라요", LX.red, true);
  });

  f.say("노트북 화면에 스마트폰 현미경을 대요. <b>빨간색, 초록색, 파란색 부분</b>을 차례로 확대해 무엇이 켜져 있는지 보세요.");
  api.setCTA("세 부분을 확대해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
