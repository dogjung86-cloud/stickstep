// [중2 Ⅶ v5] g2u7l1 strawLab: 「문지른 빨대는 어느 쪽으로 움직일까요?」
// 책의 어디에서: 해 보기 '마찰 전기 관찰하기'(빨간 빨대를 털가죽으로 문질러 통 위에 올리고, 털가죽과 문지른 파란 빨대를 차례로 가까이 가져간다).
// 한 통찰: 문지른 빨대는 털가죽에는 끌려오고, 똑같이 문지른 다른 빨대에게는 밀려난다.
// 학생이 정하는 것: 빨간 빨대를 문지를지, 무엇을 가까이 가져갈지, 그 차례.
// 실패하는 길: 문지르지 않고 털가죽을 가져가면 빨대는 꼼짝하지 않는다.
// 옛 랩(frictionLab)은 정해진 차례를 따라 눌렀다. 여기서는 위에서 내려다본 통 위의 빨대에 학생이 고른 것을 가져간다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers } from "../bio6/b6Lab";
import { X, xCanvas, xFrame, xPill, xText, type LabStep } from "./kit";

type Bring = "fur" | "blue";

export const strawLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let rubbed = false;
  let rubT = 0; // 문지르는 중(1에서 0으로)
  let bring: Bring | null = null;
  let near = 0; // 가져간 정도 0~1
  let nearTo = 0;
  let ang = 0; // 빨대가 돈 각(도). +는 가져간 것 쪽
  let busy = false;
  let finished = false;
  const seen = { fail: false, fur: false, blue: false };

  const cRub = bvCard("g2u7x-c", { name: "빨간 빨대 문지르기", sub: "털가죽으로 여러 번", key: "rub" });
  const cFur = bvCard("g2u7x-c", { name: "털가죽 가져가기", sub: "빨대 끝 가까이", key: "fur" });
  const cBlue = bvCard("g2u7x-c", { name: "파란 빨대 가져가기", sub: "털가죽으로 문지른 것", key: "blue" });
  const cBack = bvCard("g2u7x-c", { name: "멀리 치우기", sub: "처음 자리로", key: "back" });
  f.slot.setControls(bvCards(2, cRub, cFur, cBlue, cBack));

  const count = (): number => (seen.fur ? 1 : 0) + (seen.blue ? 1 : 0) + (seen.fail || rubbed ? 1 : 0);
  const paint = (): void => {
    cRub.el.disabled = busy || finished || rubbed;
    cFur.el.disabled = busy || finished || bring !== null;
    cBlue.el.disabled = busy || finished || bring !== null || !rubbed;
    cBack.el.disabled = busy || finished || bring === null;
    cBlue.sub(rubbed ? "털가죽으로 문지른 것" : "빨간 빨대 먼저 문질러요");
    f.pips(count());
  };

  cRub.el.addEventListener("click", () => {
    if (busy || rubbed) return;
    haptic(HAPTIC.tap);
    busy = true;
    rubT = 1;
    paint();
    f.say("털가죽으로 빨간 빨대를 <b>여러 번</b> 문지르고 있어요.");
    tm.later(() => {
      rubbed = true;
      busy = false;
      cRub.done();
      cRub.sub("문질렀어요");
      paint();
      f.say("문지른 빨대를 통 위에 올렸어요. 이제 <b>털가죽</b>이나 <b>파란 빨대</b>를 끝에 가까이 가져가 보세요.");
    }, 1500);
  });
  const go = (b: Bring): void => {
    if (busy || bring) return;
    haptic(HAPTIC.tap);
    bring = b;
    nearTo = 1;
    busy = true;
    paint();
    tm.later(() => {
      busy = false;
      if (!rubbed) {
        seen.fail = true;
        f.say("빨대가 <b>움직이지 않아요</b>. 문지르지 않아서예요. 치우고 빨간 빨대를 먼저 문질러 보세요.");
      } else if (b === "fur") {
        seen.fur = true;
        cFur.done();
        haptic(HAPTIC.correct);
        f.say("빨대가 털가죽 쪽으로 <b>끌려와요</b>. 치우고 다른 것도 가져가 보세요.");
      } else {
        seen.blue = true;
        cBlue.done();
        haptic(HAPTIC.correct);
        f.say("빨간 빨대가 파란 빨대에게서 <b>밀려나요</b>. 둘 다 같은 털가죽으로 문지른 빨대예요.");
      }
      paint();
    }, 1300);
  };
  cFur.el.addEventListener("click", () => go("fur"));
  cBlue.el.addEventListener("click", () => go("blue"));
  cBack.el.addEventListener("click", () => {
    if (busy || !bring) return;
    haptic(HAPTIC.tap);
    nearTo = 0;
    busy = true;
    paint();
    tm.later(() => {
      bring = null;
      busy = false;
      paint();
      if (seen.fur && seen.blue) {
        finished = true;
        paint();
        askFinal();
      }
    }, 900);
  });

  function askFinal(): void {
    f.say("끌려올 때와 밀려날 때를 모두 봤어요. 아래 질문에 답해 보세요.");
    f.slot.ask(
      "털가죽으로 문지른 빨대 두 개를 서로 가까이 하면?",
      [{ t: "서로 밀어내요", ok: true }, { t: "서로 끌어당겨요" }, { t: "아무 일도 없어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "문지른 <b>파란 빨대</b>를 가져가자 빨간 빨대가 밀려났어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("털가죽으로 문지른 빨대는 털가죽에는 <b>끌려오고</b>, 똑같이 문지른 빨대에게는 <b>밀려나요</b>. 문지르면 물체 사이에 힘이 생겨요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const straw = (ctx: CanvasRenderingContext2D, len: number, color: string, dark: string): void => {
    ctx.fillStyle = color;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-len / 2, -5, len, 10, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.fillRect(-len / 2 + 6, -3, len - 12, 2);
  };
  const fur = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#B98554";
    ctx.strokeStyle = "#7A5230";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = 1 + (i % 2 ? 0.1 : -0.02);
      const px = Math.cos(a) * 30 * r;
      const py = Math.sin(a) * 20 * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,236,210,.6)";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 9 - 3, -6);
      ctx.lineTo(i * 9 + 3, 6);
      ctx.stroke();
    }
    ctx.restore();
  };

  st.run((ctx, w, h, t, dt) => {
    const cx = w / 2 - 20;
    const cy = h / 2 + 12;
    near += (nearTo - near) * Math.min(1, dt * 0.07);
    if (rubT > 0) rubT = Math.max(0, rubT - dt / 90);
    const target = !bring || !rubbed ? 0 : (bring === "fur" ? 20 : -20) * near;
    ang += (target - ang) * Math.min(1, dt * 0.05);
    // 통(위에서 본 뚜껑)
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.strokeStyle = X.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();
    xText(ctx, "통", cx, cy + 50, { color: X.dim, px: 12 });
    // 빨간 빨대
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((ang * Math.PI) / 180);
    straw(ctx, 210, "#F26A5E", "#A8332A");
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // 문지르는 털가죽
    if (rubT > 0) fur(ctx, cx + Math.sin(t / 70) * 70, cy - 4);
    // 가져가는 것: 오른쪽 아래에서 빨대 끝으로
    if (bring) {
      const ex = cx + 104;
      const ey = cy + 28;
      const px = ex + (1 - near) * 50;
      const py = ey + (1 - near) * 70;
      if (bring === "fur") fur(ctx, px, py + 14);
      else {
        ctx.save();
        ctx.translate(px + 8, py + 26);
        ctx.rotate(-0.5);
        straw(ctx, 120, "#5AA2F8", "#2B62B8");
        ctx.restore();
      }
    }
    const label = !rubbed ? "빨간 빨대: 문지르지 않음" : "빨간 빨대: 털가죽으로 문지름";
    xPill(ctx, label, rubbed ? X.cur : "#9AA7BD");
    if (bring && near > 0.9 && !busy) {
      const msg = !rubbed ? "움직이지 않아요" : bring === "fur" ? "끌려와요" : "밀려나요";
      xText(ctx, msg, cx + 96, cy - 44, { color: !rubbed ? X.dim : X.cur, px: 14, w: 800 });
    }
    xText(ctx, "위에서 내려다본 모습", w - 12, h - 14, { color: X.dim, px: 12, align: "right" });
  });

  paint();
  f.say("플라스틱 통 위에 빨간 빨대를 올렸어요. 빨대를 <b>문지를지</b>, 무엇을 <b>가까이 가져갈지</b> 정해서 해 보세요.");
  api.setCTA("털가죽과 파란 빨대를 가져가 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
