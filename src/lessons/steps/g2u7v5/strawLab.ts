// [중2 Ⅶ v5] g2u7l1 strawLab: 「문지른 빨대는 어느 쪽으로 움직일까요?」
// 다루는 내용: 활동(빨간 빨대를 털가죽으로 문질러 통 위에 올리고, 털가죽과 문지른 파란 빨대를 차례로 가까이 가져간다).
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

  const cRub = bvCard("g2u7x-c", { name: "빨간 빨대 문지르기", sub: "털가죽으로 마찰하기", key: "rub" });
  const cFur = bvCard("g2u7x-c", { name: "털가죽 가까이 대기", sub: "빨대 끝에 접근", key: "fur" });
  const cBlue = bvCard("g2u7x-c", { name: "파란 빨대 가까이 대기", sub: "털가죽으로 문지른 빨대", key: "blue" });
  const cBack = bvCard("g2u7x-c", { name: "원래대로 치우기", sub: "처음 위치로", key: "back" });
  f.slot.setControls(bvCards(2, cRub, cFur, cBlue, cBack));

  const count = (): number => (seen.fur ? 1 : 0) + (seen.blue ? 1 : 0) + (seen.fail || rubbed ? 1 : 0);
  const paint = (): void => {
    cRub.el.disabled = busy || finished || rubbed;
    cFur.el.disabled = busy || finished || bring !== null;
    cBlue.el.disabled = busy || finished || bring !== null || !rubbed;
    cBack.el.disabled = busy || finished || bring === null;
    cBlue.sub(rubbed ? "털가죽으로 문지른 빨대" : "빨간 빨대부터 문지르기");
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
      cRub.sub("마찰 완료");
      paint();
      f.say("문지른 빨대를 통 위에 올려놓았어요. 이제 빨대 끝에 <b>털가죽</b>이나 <b>파란 빨대</b>를 가까이 대 보세요.");
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
        f.say("아직 빨대를 문지르지 않아서 <b>움직이지 않아요</b>. 털가죽을 치우고 빨간 빨대부터 먼저 문질러 보세요.");
      } else if (b === "fur") {
        seen.fur = true;
        cFur.done();
        haptic(HAPTIC.correct);
        f.say("빨간 빨대가 털가죽 쪽으로 <b>끌려와요</b>. 이제 치우고 다른 물체도 가까이 대 보세요.");
      } else {
        seen.blue = true;
        cBlue.done();
        haptic(HAPTIC.correct);
        f.say("빨간 빨대가 파란 빨대에서 <b>밀려나요</b>. 두 빨대 모두 같은 털가죽으로 문질렀기 때문이에요.");
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
    f.say("털가죽에는 끌려오고 파란 빨대에서는 밀려나는 모습을 모두 확인했어요!");
    f.slot.ask(
      "털가죽으로 문지른 두 빨대를 서로 가까이 대면 어떻게 되나요?",
      [{ t: "서로 밀어내요", ok: true }, { t: "서로 끌어당겨요" }, { t: "아무 변화가 없어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "똑같이 털가죽으로 문지른 <b>파란 빨대</b>를 가까이 대자 빨간 빨대가 밀려났어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("문지른 물체 사이에 끌어당기거나 밀어내는 힘이 작용한다는 것을 확인했어요!");
    f.slot.conclude("털가죽으로 문지른 빨대는 털가죽 쪽으로 <b>끌려오고</b>, 똑같이 문지른 다른 빨대와는 서로 <b>밀어내요</b>. 물체를 마찰하면 전기적인 힘이 생겨요.");
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
  // 털가죽(2026-11-15 그래픽 감사 C091): 둥근 가죽 조각 둘레에 부드러운 털 끝(짧은 곡선 결)을 두르고, 안쪽에 한 방향으로 빗긴 털결을 그린다.
  //   예전 톱니 테두리의 다각형은 과자나 병뚜껑처럼 보였다. 털 끝의 길이와 휨은 각도로 정해져(무작위 아님) 매 장면 같은 모양이다.
  const fur = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
    const RX = 29;
    const RY = 19;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = "round";
    // 바깥 털 끝(어두운 결 위에 밝은 결)
    for (const [col, lw, grow] of [["#6E4524", 2.6, 1], ["#D8A673", 1.6, 0.8]] as [string, number, number][]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      for (let i = 0; i < 34; i++) {
        const a = (i / 34) * Math.PI * 2;
        const ex = Math.cos(a) * RX;
        const ey = Math.sin(a) * RY;
        const len = (6.5 + 2.5 * Math.sin(i * 2.3)) * grow;
        const nx = Math.cos(a) * RY;
        const ny = Math.sin(a) * RX;
        const nl = Math.hypot(nx, ny);
        const ux = nx / nl;
        const uy = ny / nl;
        const sway = 0.55; // 털 끝이 한쪽으로 살짝 휜다
        ctx.beginPath();
        ctx.moveTo(ex - ux * 3, ey - uy * 3);
        ctx.quadraticCurveTo(ex + ux * len * 0.6, ey + uy * len * 0.6, ex + ux * len - uy * len * sway, ey + uy * len + ux * len * sway);
        ctx.stroke();
      }
    }
    // 가죽 조각
    const g = ctx.createRadialGradient(-8, -6, 3, 0, 0, RX);
    g.addColorStop(0, "#D49B63");
    g.addColorStop(0.7, "#B07A47");
    g.addColorStop(1, "#8A5A30");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, RX, RY, 0, 0, Math.PI * 2);
    ctx.fill();
    // 안쪽 털결(빗긴 방향으로 짧은 곡선)
    ctx.strokeStyle = "rgba(255,226,190,.55)";
    ctx.lineWidth = 1.3;
    for (let r = -1; r <= 1; r++)
      for (let c = -2; c <= 2; c++) {
        const px = c * 10 + (r % 2 ? 5 : 0);
        const py = r * 9;
        if ((px / (RX - 6)) ** 2 + (py / (RY - 5)) ** 2 > 1) continue;
        ctx.beginPath();
        ctx.moveTo(px - 4, py - 2);
        ctx.quadraticCurveTo(px, py - 4, px + 4, py + 1);
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
  f.say("플라스틱 통 위에 빨간 빨대를 올려 두었어요. 빨대를 <b>먼저 문지를지</b>, 다른 물체를 <b>바로 가까이 댈지</b> 골라 실험해 보세요.");
  api.setCTA("털가죽과 파란 빨대를 가까이 대 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
