// [중2 Ⅷ v5] g2u8l4 heaterLab: 「니크롬선이 뜨거워지면 색은 어떻게 변할까요?」
// 책의 어디에서: 해 보기 '물체의 색과 온도의 관계 알아보기' 과정 1(전기난로를 켠 뒤 니크롬선의 색이 변하는 모습을 관찰한다).
// 한 통찰: 물체는 온도가 높아질수록 내는 빛의 색이 붉은색에서 노란색으로 달라진다.
// 학생이 정하는 것: 전원을 얼마나 오래 누르고 있을지. 실패하는 길: 일찍 손을 떼면 식어서 다시 검붉어진다(노란색까지 가지 못한다).

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sFrame, sHold, sLog, sText, type LabStep } from "./kit";

const STAGES = [
  { name: "검붉은색", from: 0.14, c: [150, 34, 26] },
  { name: "붉은색", from: 0.38, c: [228, 58, 36] },
  { name: "주황색", from: 0.62, c: [250, 136, 40] },
  { name: "노란색", from: 0.86, c: [255, 220, 84] },
];
const COLD = [96, 100, 112];
const mix = (a: number[], b: number[], k: number): number[] => a.map((v, i) => v + (b[i] - v) * k);
/** 온도(0~1)에서 니크롬선의 색. 단계 사이는 부드럽게 잇는다. */
const wireColor = (t: number): number[] => {
  if (t < STAGES[0].from) return mix(COLD, STAGES[0].c, t / STAGES[0].from);
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (t >= STAGES[i].from) {
      const next = STAGES[i + 1];
      if (!next) return STAGES[i].c;
      return mix(STAGES[i].c, next.c, (t - STAGES[i].from) / (next.from - STAGES[i].from));
    }
  }
  return COLD;
};
const stageAt = (t: number): number => {
  let k = -1;
  STAGES.forEach((v, i) => {
    if (t >= v.from) k = i;
  });
  return k;
};

export const heaterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 4, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let temp = 0;
  let held = false;
  let last = -1;
  let peak = -1;
  let finished = false;
  const log = sLog(STAGES.map((v) => v.name), 2, true);
  const hold = sHold("main", "전원 누르고 있기", (v) => {
    held = v;
    if (finished) return;
    if (!v && peak >= 0 && peak < 3) f.say("손을 떼자 니크롬선이 <b>식으면서</b> 다시 어두워져요. 더 오래 눌러 온도를 끝까지 올려 보세요.");
    if (!v && peak === 3) {
      finished = true;
      hold.disabled = true;
      f.say("전원을 끄자 노란색에서 거꾸로 <b>붉어지며</b> 식어 가요.");
      tm.later(askFinal, 2200);
    }
  });
  f.slot.setControls(hold, log.el);

  function askFinal(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "니크롬선의 온도가 가장 높을 때의 색은?",
      [{ t: "노란색", ok: true }, { t: "검붉은색" }, { t: "붉은색" }],
      (ok) => api.recordQuiz(ok),
      { why: "오래 누를수록 <b>검붉은색, 붉은색, 주황색, 노란색</b>으로 변했어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물체는 <b>온도가 높아질수록</b> 내는 빛의 색이 달라져요. 니크롬선은 뜨거워질수록 검붉은색에서 붉은색, 주황색, <b>노란색</b>으로 변해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    temp = Math.max(0, Math.min(1, temp + (held && !finished ? dt / 250 : -dt / 190)));
    const k = stageAt(temp);
    if (k !== last) {
      last = k;
      if (k > peak) {
        peak = k;
        log.set(k, "봤어요");
        f.pips(k + 1);
        if (!finished) f.say(k < 3 ? `니크롬선이 <b>${STAGES[k].name}</b>으로 빛나요. 계속 누르고 있어요.` : "니크롬선이 <b>노란색</b>으로 빛나요. 이제 손을 떼어 보세요.");
      }
    }
    const c = wireColor(temp);
    const col = `rgb(${c.map(Math.round).join(",")})`;
    // 난로 몸통
    const bx = 34;
    const by = 30;
    const bw = w - 68 - 54;
    const bh = h - 70;
    sBox(ctx, bx, by, bw, bh, 14, "#2B3447", "rgba(232,238,249,.3)", 1.5);
    sBox(ctx, bx + 10, by + 10, bw - 20, bh - 20, 8, "#141B2B");
    sBox(ctx, bx + bw * 0.2, by + bh, bw * 0.6, 8, 3, "#3A455C");
    // 열기(번지는 빛)
    if (temp > 0.1) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.5, temp * 0.55);
      const g = ctx.createRadialGradient(bx + bw / 2, by + bh / 2, 10, bx + bw / 2, by + bh / 2, bw * 0.7);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w - 54, h);
      ctx.restore();
    }
    // 니크롬선 세 줄(돌돌 감긴 선)
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.shadowColor = col;
    ctx.shadowBlur = temp * 14;
    for (let r = 0; r < 3; r++) {
      const y = by + 32 + r * ((bh - 64) / 2);
      ctx.beginPath();
      for (let x = bx + 22; x <= bx + bw - 22; x += 2) {
        const yy = y + Math.sin((x - bx) * 0.42) * 7;
        if (x === bx + 22) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
    // 온도 막대
    const gx = w - 44;
    const gy = 34;
    const gh = h - 78;
    sBox(ctx, gx, gy, 14, gh, 7, "rgba(255,255,255,.1)", "rgba(255,255,255,.2)", 1);
    sBox(ctx, gx + 2, gy + gh - 2 - (gh - 4) * temp, 10, Math.max(0, (gh - 4) * temp), 5, col);
    sText(ctx, "온도", gx + 7, gy - 12, { color: S.dim, px: 12 });
    sText(ctx, k < 0 ? "니크롬선: 아직 빛나지 않아요" : `니크롬선: ${STAGES[k].name}`, bx, h - 14, { color: k < 0 ? S.dim : S.gold, px: 13, align: "left", w: 800 });
    if (held && !finished) sText(ctx, "전원 켜짐", bx + bw - 4, by - 12, { color: S.ok, px: 12, align: "right" });
  });

  f.say("전기난로예요. <b>전원</b>을 꾹 누르고 있으면 니크롬선이 점점 뜨거워져요. 색이 어떻게 변하는지 보세요.");
  api.setCTA("전원을 꾹 눌러 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
