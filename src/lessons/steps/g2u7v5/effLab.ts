// [중2 Ⅶ v5] g2u7l6 effLab: 「같은 밝기를 내는 데 전기 에너지가 얼마나 들까요?」
// 책의 어디에서: 본문과 그림 '전구의 에너지 효율'(같은 양의 전기 에너지를 공급할 때 빛에너지로 바뀌는 비율이 높은 전구일수록 에너지 효율이 높다).
// 한 통찰: 넣어 준 전기 에너지 가운데 빛으로 바뀌는 비율이 높은 전구일수록 같은 밝기를 내는 데 전기 에너지가 적게 든다. 나머지는 열에너지가 된다.
// 학생이 정하는 것: 어느 전구를 켤지, 전기 에너지를 얼마나 넣어 줄지(빛에너지가 목표에 딱 닿게 맞춘다).
// 실패하는 길: 모자라게 넣으면 목표 밝기에 못 미치고, 넘치게 넣으면 목표를 지나친다(기록되지 않는다).
// 옛 판에는 랩이 없었다. 값(자체 설정): 빛으로 바뀌는 비율이 백열전구 5 %, 형광등 20 %, LED 전구 40 %. 목표는 빛에너지 20 J.

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
      { why: "그래프의 붉은 막대가 <b>열에너지</b>였어요. 에너지는 사라지지 않아요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("넣어 준 전기 에너지 가운데 <b>필요한 에너지로 바뀌는 비율</b>이 에너지 효율이에요. 효율이 높은 LED 전구는 같은 밝기를 내는 데 전기 에너지가 훨씬 적게 들어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const b = BULB[bulb];
    const light = supply * b.eff;
    const heat = supply - light;
    const hit = Math.abs(light - GOAL) < 0.01;
    // 전구(밝기는 빛에너지를 따른다)
    const glow = Math.min(1, light / GOAL);
    const g = ctx.createRadialGradient(64, 78, 4, 64, 78, 30 + glow * 34);
    g.addColorStop(0, `rgba(255,224,130,${0.2 + glow * 0.7})`);
    g.addColorStop(1, "rgba(255,224,130,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(64, 78, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,${Math.round(176 + glow * 60)},${Math.round(110 + glow * 60)},${0.35 + glow * 0.65})`;
    ctx.strokeStyle = "#C9D1DE";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(64, 78, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    xBox(ctx, 54, 100, 20, 16, 4, "#8FA4C2");
    xText(ctx, b.name, 64, 136, { px: 13, w: 800 });
    xText(ctx, hit ? "목표 밝기" : light > GOAL ? "목표보다 밝아요" : "목표보다 어두워요", 64, 156, { px: 12, color: hit ? "#7FE3C4" : X.dim });
    // 에너지 막대: 넣은 전기 에너지 = 빛 + 열
    const bx = 150;
    const bw = 182;
    const scale = bw / 500;
    xText(ctx, `넣은 전기 에너지 ${supply} J`, bx, 26, { px: 13, align: "left", color: X.cur, w: 800 });
    xBox(ctx, bx, 38, bw, 20, 6, "rgba(255,255,255,.06)", X.line);
    if (supply > 0) xBox(ctx, bx, 38, Math.max(3, supply * scale), 20, 6, "rgba(255,196,90,.8)");
    xText(ctx, `빛에너지 ${light.toFixed(1)} J (4배로 키운 눈금)`, bx, 80, { px: 13, align: "left", color: "#FFE08A", w: 800 });
    xBox(ctx, bx, 92, bw, 20, 6, "rgba(255,255,255,.06)", X.line);
    if (light > 0) xBox(ctx, bx, 92, Math.min(bw, Math.max(3, light * scale * 4)), 20, 6, "#FFE08A");
    // 목표선(빛 20 J)
    const gx = bx + GOAL * scale * 4;
    ctx.strokeStyle = "#7FE3C4";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(gx, 86);
    ctx.lineTo(gx, 118);
    ctx.stroke();
    ctx.setLineDash([]);
    xText(ctx, `목표 ${GOAL} J`, gx + 6, 126, { px: 12, align: "left", color: "#7FE3C4" });
    xText(ctx, `열에너지 ${heat.toFixed(1)} J`, bx, 150, { px: 13, align: "left", color: X.plus, w: 800 });
    xBox(ctx, bx, 162, bw, 20, 6, "rgba(255,255,255,.06)", X.line);
    if (heat > 0) xBox(ctx, bx, 162, Math.max(3, heat * scale), 20, 6, "#FF9D8A");
    const done = (Object.keys(rec) as Bulb[]).map((q) => `${BULB[q].name} ${rec[q]} J`).join(" · ");
    if (done) xText(ctx, done, 173, 208, { px: 12, color: X.dim });
    ctx.restore();
  });

  f.say(`세 전구로 <b>같은 밝기</b>(빛에너지 ${GOAL} J)를 내요. 전기 에너지를 얼마나 넣어야 할지 맞춰 보세요.`);
  api.setCTA("세 전구의 값을 기록해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
