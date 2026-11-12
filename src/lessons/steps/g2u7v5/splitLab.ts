// [중2 Ⅶ v5] g2u7l5 splitLab: 「전압과 전류는 어떻게 나뉠까요?」
// 책의 어디에서: 본문(직렬로 연결하면 전체 저항이 커져 전류가 약해진다. 병렬로 연결하면 각 전구에 같은 전압이 걸리고 회로 전체의 전류는 세진다)과
//   그림 '전기 기구의 병렬연결'(멀티탭의 단자마다 같은 220 V).
// 한 통찰: 직렬은 길이 하나라 전류가 어디서나 같고 전압을 나눠 가진다. 병렬은 갈래마다 전압이 같고 전류를 나눠 가진다.
// 학생이 정하는 것: 연결 방법, 전류계와 전압계 가운데 무엇으로 잴지, 어느 자리를 잴지. 물길 그림으로 바꿔 까닭을 견준다.
// 실패하는 길: 한 자리만 재서는 "어디서나 같다"와 "나뉜다"를 가릴 수 없다(연결마다 전류 두 자리 이상, 두 전구의 전압을 모두 재야 한다).
// 옛 판은 물길 그림을 개념 글의 삽화로만 보여 주었다. 여기서는 학생이 잰 값과 물길을 같은 무대에서 오가며 견준다.
// 값: 전지 3 V, 전구 한 개 15 Ω(자체 설정). 직렬 0.1 A와 1.5 V씩, 병렬 3 V씩과 0.2 A씩(전체 0.4 A).

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawBulb, drawWire } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xPill, xSegs, xText, type LabStep } from "./kit";

type Mode = "series" | "parallel";
type Tool = "amp" | "volt";
interface Spot {
  id: string;
  tool: Tool;
  x: number;
  y: number;
  v: string;
  lx?: number;
  ly?: number;
}
const SPOTS: Record<Mode, Spot[]> = {
  series: [
    { id: "a1", tool: "amp", x: 302, y: 132, v: "0.1 A", lx: -30 },
    { id: "a2", tool: "amp", x: 173, y: 76, v: "0.1 A", ly: 26 },
    { id: "a3", tool: "amp", x: 44, y: 132, v: "0.1 A", lx: 30 },
    { id: "v1", tool: "volt", x: 112, y: 72, v: "1.5 V", ly: 36 },
    { id: "v2", tool: "volt", x: 234, y: 72, v: "1.5 V", ly: 36 },
    { id: "v0", tool: "volt", x: 173, y: 196, v: "3 V", ly: -30 },
  ],
  parallel: [
    { id: "a1", tool: "amp", x: 302, y: 164, v: "0.4 A", lx: -30 },
    { id: "a2", tool: "amp", x: 250, y: 66, v: "0.2 A", ly: -22 },
    { id: "a3", tool: "amp", x: 250, y: 124, v: "0.2 A", ly: -22 },
    { id: "v1", tool: "volt", x: 150, y: 62, v: "3 V", lx: -44 },
    { id: "v2", tool: "volt", x: 150, y: 120, v: "3 V", lx: -44 },
    { id: "v0", tool: "volt", x: 173, y: 196, v: "3 V", ly: -30 },
  ],
};

export const splitLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let mode: Mode = "series";
  let tool: Tool = "amp";
  let water = false;
  let finished = false;
  let ph = 0;
  const got: Record<Mode, Set<string>> = { series: new Set(), parallel: new Set() };
  const waterSeen: Record<Mode, boolean> = { series: false, parallel: false };
  const ok = (m: Mode): boolean => [...got[m]].filter((i) => i[0] === "a").length >= 2 && got[m].has("v1") && got[m].has("v2");

  const modeSeg = xSegs<Mode>(
    [
      { k: "series", t: "직렬연결" },
      { k: "parallel", t: "병렬연결" },
    ],
    "series",
    (k) => {
      mode = k;
      if (water) waterSeen[k] = true;
      hint();
      after();
    },
  );
  const toolSeg = xSegs<Tool>(
    [
      { k: "amp", t: "전류계로 재기" },
      { k: "volt", t: "전압계로 재기" },
    ],
    "amp",
    (k) => {
      tool = k;
      hint();
    },
  );
  const view = bvBtn("", "물길 그림으로 보기");
  f.slot.setControls(modeSeg.el, toolSeg.el, view);

  function hint(): void {
    if (water) {
      f.say(mode === "series" ? "물길이 <b>하나</b>예요. 같은 물이 두 물레방아를 차례로 지나고, 높이 차를 둘이 나눠 써요." : "물길이 <b>두 갈래</b>예요. 물은 나뉘어 흐르고, 갈래마다 높이 차는 전체와 같아요.");
      return;
    }
    if (ok(mode)) f.say(ok(mode === "series" ? "parallel" : "series") ? "두 연결을 모두 쟀어요. <b>물길 그림</b>으로 바꿔 까닭을 견줘 보세요." : `${mode === "series" ? "직렬" : "병렬"}연결을 다 쟀어요. 이번에는 <b>${mode === "series" ? "병렬" : "직렬"}연결</b>로 바꿔 재 보세요.`);
    else f.say(tool === "amp" ? "점선 동그라미를 눌러 그 자리의 <b>전류</b>를 재요. 두 자리 이상 재 보세요." : "점선 동그라미를 눌러 전구에 걸리는 <b>전압</b>을 재요. 두 전구 모두 재 보세요.");
  }
  function after(): void {
    const w = waterSeen.series && waterSeen.parallel;
    f.pips((ok("series") ? 1 : 0) + (ok("parallel") ? 1 : 0) + (w ? 1 : 0));
    if (ok("series") && ok("parallel") && w && !finished) {
      finished = true;
      modeSeg.lock(true);
      toolSeg.lock(true);
      view.disabled = true;
      tm.later(ask1, 3000);
    }
  }
  view.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    water = !water;
    view.textContent = water ? "회로 그림으로 돌아가기" : "물길 그림으로 보기";
    toolSeg.lock(water);
    if (water) waterSeen[mode] = true;
    hint();
    if (water && !(waterSeen.series && waterSeen.parallel)) f.say(`${mode === "series" ? "물길이 <b>하나</b>예요. 높이 차를 둘이 나눠 써요." : "물길이 <b>두 갈래</b>예요. 물이 나뉘어 흘러요."} 위에서 ${mode === "series" ? "병렬" : "직렬"}연결의 물길도 봐요.`);
    after();
  });
  st.cv.addEventListener("pointerdown", (e) => {
    if (finished || water) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const sp = SPOTS[mode].find((q) => q.tool === tool && Math.hypot(p.x / k - q.x, p.y / k - q.y) < 28);
    if (!sp) return;
    haptic(HAPTIC.tap);
    got[mode].add(sp.id);
    hint();
    after();
  });

  function ask1(): void {
    f.slot.ask(
      "직렬연결에서 두 전구에 걸린 전압을 더하면?",
      [{ t: "전지의 전압과 같아요", ok: true }, { t: "전지 전압의 2배예요" }, { t: "0이 돼요" }],
      (v) => api.recordQuiz(v),
      { why: "1.5 V와 1.5 V를 더하면 전지의 전압 <b>3 V</b>예요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "병렬연결에서 회로 전체의 전류 0.4 A는 두 갈래로 어떻게 흘렀나요?",
      [{ t: "0.2 A씩 나뉘어 흘렀어요", ok: true }, { t: "갈래마다 0.4 A씩 흘렀어요" }, { t: "한 갈래로만 흘렀어요" }],
      () => undefined,
      { why: "물이 두 갈래로 나뉘듯 전류도 <b>0.2 A씩</b> 나뉘었어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("<b>직렬</b>은 길이 하나라 전류가 어디서나 같고, 전압을 나눠 가져요. <b>병렬</b>은 갈래마다 전압이 같고, 전류를 나눠 가져요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const wheel = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.strokeStyle = "#D9A866";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((i / 4) * Math.PI) * (r + 3), Math.sin((i / 4) * Math.PI) * (r + 3));
      ctx.stroke();
    }
    ctx.restore();
  };
  const WAT = "rgba(79,168,242,.85)";
  const drawWater = (ctx: CanvasRenderingContext2D): void => {
    // 아래 물웅덩이, 펌프 관
    xBox(ctx, 26, 200, 294, 12, 4, WAT, "#2B6FB8");
    xBox(ctx, 34, 46, 14, 160, 4, "rgba(143,164,194,.35)", "#8FA4C2");
    ctx.fillStyle = "#4FA8F2";
    for (let i = 0; i < 6; i++) ctx.fillRect(38, 198 - ((ph * 20 + i * 26) % 150), 6, 8);
    xBox(ctx, 28, 24, 26, 24, 6, "#E0503A", "#8E2A1C");
    xText(ctx, "펌프", 76, 34, { px: 12, color: X.dim });
    if (mode === "series") {
      xBox(ctx, 46, 52, 82, 9, 3, WAT, "#2B6FB8");
      ctx.fillStyle = WAT;
      ctx.fillRect(122, 56, 7, 70);
      xBox(ctx, 122, 124, 116, 9, 3, WAT, "#2B6FB8");
      ctx.fillRect(232, 128, 7, 74);
      wheel(ctx, 146, 92, 18, ph * 1.2);
      wheel(ctx, 256, 166, 18, ph * 1.2);
      xArrow(ctx, 186, 60, 186, 122, "rgba(232,238,249,.75)", 1.6, 6);
      xArrow(ctx, 296, 132, 296, 198, "rgba(232,238,249,.75)", 1.6, 6);
      xText(ctx, "높이 차의 절반", 210, 88, { px: 12, color: X.cur, align: "left" });
      xText(ctx, "절반", 300, 150, { px: 12, color: X.cur, align: "left" });
      xText(ctx, "같은 물이 차례로 지나요", 124, 166, { px: 12, color: "#9CD0FF" });
    } else {
      xBox(ctx, 46, 52, 222, 9, 3, WAT, "#2B6FB8");
      ctx.fillStyle = WAT;
      ctx.fillRect(150, 56, 6, 146);
      ctx.fillRect(262, 56, 6, 146);
      wheel(ctx, 172, 128, 18, ph * 1.2);
      wheel(ctx, 284, 128, 18, ph * 1.2);
      xArrow(ctx, 108, 62, 108, 198, "rgba(232,238,249,.75)", 1.6, 6);
      xArrow(ctx, 222, 62, 222, 198, "rgba(232,238,249,.75)", 1.6, 6);
      xText(ctx, "높이 차", 108, 130, { px: 12, color: X.cur });
      xText(ctx, "똑같아요", 222, 130, { px: 12, color: X.cur });
      xText(ctx, "물이 두 갈래로 나뉘어요", 206, 36, { px: 12, color: "#9CD0FF" });
    }
  };
  const drawCircuit = (ctx: CanvasRenderingContext2D): void => {
    const P = (pts: [number, number][], sp = 1): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on: true, flow: ph * 0.4 * sp, dir: 1, width: 3.5 });
    const top = mode === "series" ? 72 : 62;
    P([[215, 196], [302, 196], [302, top]], mode === "series" ? 0.5 : 2);
    P([[44, top], [44, 196], [131, 196]], mode === "series" ? 0.5 : 2);
    if (mode === "series") {
      P([[302, 72], [256, 72]], 0.5);
      P([[212, 72], [134, 72]], 0.5);
      P([[90, 72], [44, 72]], 0.5);
      drawBulb(ctx, 112, 68, 19, 0.3);
      drawBulb(ctx, 234, 68, 19, 0.3);
    } else {
      for (const y of [62, 120]) {
        P([[302, y], [172, y]]);
        P([[128, y], [44, y]]);
      }
      P([[302, 62], [302, 120]]);
      P([[44, 120], [44, 62]]);
      drawBulb(ctx, 150, 58, 19, 1);
      drawBulb(ctx, 150, 116, 19, 1);
    }
    drawBattery(ctx, 173, 196, 84, 30, true);
    SPOTS[mode].forEach((q) => {
      const done = got[mode].has(q.id);
      if (q.tool === tool && !done) {
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = tool === "amp" ? X.cur : "#9BE8C4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (done) {
        const lx = q.x + (q.lx ?? 0);
        const ly = q.y + (q.ly ?? 0);
        const c = q.tool === "amp" ? X.cur : "#9BE8C4";
        xBox(ctx, lx - 24, ly - 11, 48, 22, 11, "rgba(11,21,36,.92)", c);
        xText(ctx, q.v, lx, ly + 0.5, { px: 12.5, color: c, w: 800 });
      }
    });
  };

  st.run((ctx, w, _h, _t, dt) => {
    const k = w / 346;
    ph += dt / 60;
    ctx.save();
    ctx.scale(k, k);
    if (water) drawWater(ctx);
    else drawCircuit(ctx);
    ctx.restore();
    if (!water) xPill(ctx, mode === "series" ? "직렬: 한 줄로 이음" : "병렬: 갈래를 나눠 이음", X.cur);
  });

  hint();
  api.setCTA("두 연결을 재고 물길과 견줘 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
