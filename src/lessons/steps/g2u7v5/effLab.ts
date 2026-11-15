// [중2 Ⅶ v5] g2u7l6 effLab: 「같은 밝기를 내는 데 전기 에너지가 얼마나 들까요?」
// 책의 어디에서: 본문과 그림 '전구의 에너지 효율'(같은 양의 전기 에너지를 공급할 때 빛에너지로 바뀌는 비율이 높은 전구일수록 에너지 효율이 높다).
// 한 통찰: 넣어 준 전기 에너지 가운데 빛으로 바뀌는 비율이 높은 전구일수록 같은 밝기를 내는 데 전기 에너지가 적게 든다. 나머지는 열에너지가 된다.
// 학생이 정하는 것: 어느 전구를 켤지, 전기 에너지를 얼마나 넣어 줄지(빛에너지가 목표에 딱 닿게 맞춘다).
// 실패하는 길: 모자라게 넣으면 목표 밝기에 못 미치고, 넘치게 넣으면 목표를 지나친다(기록되지 않는다).
// 옛 판에는 랩이 없었다. 값(자체 설정): 빛으로 바뀌는 비율이 백열전구 5 %, 형광등 20 %, LED 전구 40 %. 목표는 빛에너지 20 J.
// 그림(2026-11-15 그래픽 감사 C099): 넣은 전기 에너지는 막대 하나다. 같은 눈금(0~500 J) 위에서 빛(노랑)과 열(붉은색) 두 토막으로 나눠 칠하고
//   토막마다 J과 비율(%)을 쓴다(정리 카드의 작은 그림과 같은 꼴, 책 그림 '전구의 에너지 효율'의 갈라지는 화살과 같은 뜻).
//   예전에는 빛 막대만 4배로 키운 눈금이라 LED에서 빛 막대가 넣은 에너지 막대보다 길어 '넣은 것 = 빛 + 열'과 거꾸로 읽혔다.
//   목표 밝기는 에너지 막대가 아니라 전구 아래의 작은 밝기 눈금(목표선)과 전구의 빛으로 따로 보인다. 세 전구는 모양을 달리 그리고, 열이 많을수록 아지랑이가 진하다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { X, xBox, xCanvas, xFrame, xSegs, xText, type LabStep } from "./kit";

type Bulb = "inc" | "flu" | "led";
const BULB: Record<Bulb, { name: string; eff: number }> = {
  inc: { name: "백열전구", eff: 0.05 },
  flu: { name: "형광등", eff: 0.2 },
  led: { name: "LED 전구", eff: 0.4 },
};
const GOAL = 20;
const LIGHT = "#FFE08A"; // 빛에너지
const HEAT = "#FF9D8A"; // 열에너지
const MINT = "#7FE3C4"; // 목표

/** 전구 그림. kind마다 모양이 다르다. glow는 밝기(0~1), 빛이 목표에 닿으면 1. */
function drawLamp(ctx: CanvasRenderingContext2D, kind: Bulb, x: number, y: number, glow: number): void {
  const lit = glow > 0.02;
  // 빛 번짐
  if (lit) {
    const rx = kind === "flu" ? 62 : 30 + glow * 34;
    const g = ctx.createRadialGradient(x, y, 4, x, y, rx);
    g.addColorStop(0, `rgba(255,228,140,${0.18 + glow * 0.6})`);
    g.addColorStop(1, "rgba(255,228,140,0)");
    ctx.save();
    if (kind === "flu") {
      ctx.translate(x, y);
      ctx.scale(1, 0.55);
      ctx.translate(-x, -y);
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const glass = (cool: boolean): string =>
    lit ? (cool ? `rgba(226,244,255,${0.4 + glow * 0.6})` : `rgba(255,${Math.round(196 + glow * 40)},${Math.round(120 + glow * 50)},${0.35 + glow * 0.65})`) : "rgba(190,208,230,.32)";
  const screw = (sx: number, sy: number, w: number, h: number): void => {
    xBox(ctx, sx - w / 2, sy, w, h, 2.5, "#8FA4C2", "#4E5E78", 1.2);
    ctx.strokeStyle = "rgba(78,94,120,.9)";
    ctx.lineWidth = 1.2;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - w / 2 + 1, sy + (h * i) / 4);
      ctx.lineTo(sx + w / 2 - 1, sy + (h * i) / 4 - 2);
      ctx.stroke();
    }
    xBox(ctx, sx - 3.5, sy + h, 7, 3, 1.5, "#4E5E78");
  };
  ctx.save();
  ctx.lineJoin = "round";
  if (kind === "inc") {
    // 백열전구: 둥근 유리알과 잘록한 목, 속의 필라멘트
    ctx.beginPath();
    ctx.arc(x, y - 6, 23, Math.PI * 0.78, Math.PI * 2.22);
    ctx.lineTo(x + 9, y + 24);
    ctx.lineTo(x - 9, y + 24);
    ctx.closePath();
    ctx.fillStyle = glass(false);
    ctx.fill();
    ctx.strokeStyle = "#C9D1DE";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = lit ? `rgba(255,${Math.round(150 + glow * 90)},60,1)` : "rgba(140,160,190,.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 20);
    ctx.lineTo(x - 7, y - 4);
    for (let i = 0; i <= 6; i++) ctx.lineTo(x - 7 + (i * 14) / 6, y - 4 + (i % 2 ? -4 : 0));
    ctx.lineTo(x + 5, y + 20);
    ctx.stroke();
    screw(x, y + 24, 18, 13);
  } else if (kind === "flu") {
    // 형광등: 긴 유리관과 양 끝의 쇠붙이, 핀
    for (const s of [-1, 1]) {
      ctx.strokeStyle = "#8FA4C2";
      ctx.lineWidth = 1.6;
      for (const dy of [-4, 4]) {
        ctx.beginPath();
        ctx.moveTo(x + s * 51, y + dy);
        ctx.lineTo(x + s * 56, y + dy);
        ctx.stroke();
      }
      xBox(ctx, s < 0 ? x - 51 : x + 43, y - 10, 8, 20, 3, "#8FA4C2", "#4E5E78", 1.2);
    }
    xBox(ctx, x - 44, y - 9, 88, 18, 9, glass(true), "#C9D1DE", 1.5);
  } else {
    // LED 전구: 젖빛 둥근 덮개, 방열 몸통(골 셋), 나사
    ctx.beginPath();
    ctx.arc(x, y - 2, 22, Math.PI, 0);
    ctx.lineTo(x + 22, y + 4);
    ctx.lineTo(x - 22, y + 4);
    ctx.closePath();
    ctx.fillStyle = lit ? `rgba(255,${Math.round(236 + glow * 14)},${Math.round(200 + glow * 40)},${0.45 + glow * 0.55})` : "rgba(225,232,242,.42)";
    ctx.fill();
    ctx.strokeStyle = "#C9D1DE";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 22, y + 4);
    ctx.lineTo(x + 22, y + 4);
    ctx.lineTo(x + 12, y + 24);
    ctx.lineTo(x - 12, y + 24);
    ctx.closePath();
    ctx.fillStyle = "#DDE4EE";
    ctx.fill();
    ctx.strokeStyle = "#8FA4C2";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(120,140,170,.8)";
    for (const dx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(x + dx * 1.3, y + 7);
      ctx.lineTo(x + dx * 0.8, y + 21);
      ctx.stroke();
    }
    screw(x, y + 24, 16, 12);
  }
  ctx.restore();
}

/** 열이 많은 전구 위의 아지랑이(진하기 a). */
function drawHaze(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, tMs: number, wide: boolean): void {
  if (a < 0.03) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  const xs = wide ? [-30, -10, 10, 30] : [-12, 0, 12];
  xs.forEach((dx, i) => {
    ctx.beginPath();
    for (let s = 0; s <= 1.0001; s += 0.08) {
      const px = x + dx + Math.sin(s * 9 + tMs / 260 + i * 1.7) * 3.2;
      const py = y - s * 26;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    const g = ctx.createLinearGradient(0, y, 0, y - 26);
    g.addColorStop(0, `rgba(255,157,138,${a})`);
    g.addColorStop(1, "rgba(255,157,138,0)");
    ctx.strokeStyle = g;
    ctx.stroke();
  });
  ctx.restore();
}

export const effLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let bulb: Bulb = "inc";
  let supply = 0;
  let finished = false;
  const rec: Partial<Record<Bulb, number>> = {};

  const pick = xSegs<Bulb>(
    [
      { k: "inc", t: "백열전구" },
      { k: "flu", t: "형광등" },
      { k: "led", t: "LED 전구" },
    ],
    "inc",
    (k) => {
      bulb = k;
      supply = 0;
      amount.set(0);
      f.say(`<b>${BULB[k].name}</b>예요. 빛에너지가 딱 <b>${GOAL} J</b>이 되게 전기 에너지를 맞춰 보세요.`);
    },
  );
  const amount = bvRange({
    cls: "g2u7x-r",
    min: 0,
    max: 50,
    value: 0,
    label: "넣어 주는 전기 에너지",
    ticks: ["0", "100", "200", "300", "400", "500 J"],
    onInput: (v) => {
      supply = v * 10;
    },
  });
  const ok = bvBtn("main", "이만큼 넣고 기록하기");
  f.slot.setControls(pick.el, amount.el, ok);

  ok.addEventListener("click", () => {
    if (finished) return;
    const b = BULB[bulb];
    const light = supply * b.eff;
    if (Math.abs(light - GOAL) > 0.01) {
      haptic(HAPTIC.wrong);
      f.say(light < GOAL ? `빛에너지가 ${light.toFixed(1)} J이라 <b>목표보다 어두워요</b>. 전기 에너지를 더 넣어 보세요.` : `빛에너지가 ${light.toFixed(1)} J이라 <b>목표를 지나쳤어요</b>. 전기 에너지를 줄여 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    rec[bulb] = supply;
    const n = Object.keys(rec).length;
    f.pips(n);
    if (n === 3) {
      finished = true;
      pick.lock(true);
      amount.input.disabled = true;
      ok.disabled = true;
      f.say("같은 밝기를 내는 데 백열전구는 <b>400 J</b>, LED 전구는 <b>50 J</b>이 들었어요.");
      tm.later(ask, 2800);
    } else f.say(`<b>${supply} J</b>을 넣어야 빛 ${GOAL} J이 나와요. 나머지 ${supply - GOAL} J은 열이 됐어요. 다른 전구도 해 봐요.`);
  });

  function ask(): void {
    f.slot.ask(
      "LED 전구에 넣은 50 J 가운데 빛이 된 것은 20 J이에요. 나머지 30 J은?",
      [{ t: "열에너지로 바뀌었어요", ok: true }, { t: "사라져 없어졌어요" }, { t: "전구 속에 남아 있어요" }],
      (v) => api.recordQuiz(v),
      { why: "막대의 붉은 토막이 <b>열에너지</b>였어요. 에너지는 사라지지 않아요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("넣어 준 전기 에너지 가운데 <b>필요한 에너지로 바뀌는 비율</b>이 에너지 효율이에요. 효율이 높은 LED 전구는 같은 밝기를 내는 데 전기 에너지가 훨씬 적게 들어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const b = BULB[bulb];
    const light = supply * b.eff;
    const heat = supply - light;
    const hit = Math.abs(light - GOAL) < 0.01;
    // ── 왼쪽: 전구(밝기는 빛에너지를 따른다), 열이 많을수록 진한 아지랑이, 밝기 눈금 ──
    const lx = 66;
    const ly = 74;
    const glow = Math.min(1, light / GOAL);
    drawHaze(ctx, lx, ly - (bulb === "flu" ? 16 : 34), Math.min(0.9, heat / 330), t, bulb === "flu");
    drawLamp(ctx, bulb, lx, ly, glow);
    xText(ctx, b.name, lx, 126, { px: 13, w: 800 });
    xText(ctx, hit ? "목표 밝기" : light > GOAL ? "목표보다 밝아요" : "목표보다 어두워요", lx, 144, { px: 12, color: hit ? MINT : X.dim });
    // 밝기 눈금(빛 0~30 J). 목표선은 빛 20 J
    const mx = 16;
    const mw = 100;
    const lmax = 30;
    xBox(ctx, mx, 160, mw, 9, 4.5, "rgba(255,255,255,.07)", X.line, 1.2);
    if (light > 0) xBox(ctx, mx, 160, Math.max(4, (Math.min(light, lmax) / lmax) * mw), 9, 4.5, LIGHT);
    const gx = mx + (GOAL / lmax) * mw;
    ctx.save();
    ctx.strokeStyle = MINT;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 2.5]);
    ctx.beginPath();
    ctx.moveTo(gx, 154);
    ctx.lineTo(gx, 175);
    ctx.stroke();
    ctx.restore();
    xText(ctx, "밝기", mx, 184, { px: 12, align: "left", color: X.dim });
    xText(ctx, "목표", gx, 184, { px: 12, color: MINT });
    // ── 오른쪽: 넣은 전기 에너지 막대 하나 = 빛(노랑) + 열(붉은색), 같은 눈금(0~500 J) ──
    const bx = 150;
    const bw = 184;
    const scale = bw / 500;
    xText(ctx, `넣은 전기 에너지 ${supply} J`, bx, 24, { px: 13, align: "left", color: X.cur, w: 800 });
    xBox(ctx, bx, 36, bw, 24, 7, "rgba(255,255,255,.06)", X.line);
    if (supply > 0) {
      const lw = light * scale;
      const all = Math.max(4, supply * scale);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, 36, all, 24, 7);
      ctx.clip();
      ctx.fillStyle = HEAT;
      ctx.fillRect(bx, 36, all, 24);
      ctx.fillStyle = LIGHT;
      ctx.fillRect(bx, 36, Math.max(2, lw), 24);
      ctx.fillStyle = "rgba(11,21,36,.85)";
      ctx.fillRect(bx + Math.max(2, lw), 36, 1.4, 24); // 두 토막의 경계
      ctx.restore();
    }
    // 100 J마다 눈금(세 전구를 같은 눈금으로 비교한다)
    ctx.strokeStyle = "rgba(178,204,238,.45)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i <= 5; i++) {
      const tx = bx + i * 100 * scale;
      ctx.beginPath();
      ctx.moveTo(tx, 62);
      ctx.lineTo(tx, 67);
      ctx.stroke();
    }
    xText(ctx, "0", bx, 76, { px: 12, color: X.dim, w: 600 });
    xText(ctx, "500 J", bx + bw, 76, { px: 12, color: X.dim, w: 600, align: "right" });
    // 두 토막의 값과 비율
    const pct = (v: number): string => (supply > 0 ? `${Math.round((v / supply) * 100)} %` : "");
    xText(ctx, "비율", bx + bw, 98, { px: 12, color: X.dim, align: "right" });
    const row = (y: number, color: string, name: string, v: number): void => {
      xBox(ctx, bx, y - 6, 12, 12, 3, color);
      xText(ctx, `${name} ${v.toFixed(1)} J`, bx + 18, y, { px: 13, align: "left", color, w: 800 });
      xText(ctx, pct(v), bx + bw, y, { px: 14, align: "right", color, w: 800 });
    };
    row(120, LIGHT, "빛에너지", light);
    row(146, HEAT, "열에너지", heat);
    // 두 토막을 더하면 넣은 전기 에너지(에너지는 사라지지 않는다)
    if (supply > 0) {
      const parts: [string, string][] = [
        [`${light.toFixed(1)} J`, LIGHT],
        [" + ", X.dim],
        [`${heat.toFixed(1)} J`, HEAT],
        [" = ", X.dim],
        [`${supply} J`, X.cur],
      ];
      ctx.save();
      ctx.font = "800 13px Pretendard, system-ui, sans-serif"; // xText와 같은 글꼴로 잰다
      let px = bx + bw - parts.reduce((s, [t]) => s + ctx.measureText(t).width, 0);
      ctx.restore();
      for (const [t, c] of parts) {
        xText(ctx, t, px, 176, { px: 13, align: "left", color: c, w: 800 });
        ctx.save();
        ctx.font = "800 13px Pretendard, system-ui, sans-serif";
        px += ctx.measureText(t).width;
        ctx.restore();
      }
    }
    const done = (Object.keys(rec) as Bulb[]).map((q) => `${BULB[q].name} ${rec[q]} J`).join(" · ");
    if (done) xText(ctx, done, 173, 210, { px: 12, color: X.dim });
    ctx.restore();
  });

  f.say(`세 전구로 <b>같은 밝기</b>(빛에너지 ${GOAL} J)를 내요. 전기 에너지를 얼마나 넣어야 할지 맞춰 보세요.`);
  api.setCTA("세 전구의 값을 기록해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
