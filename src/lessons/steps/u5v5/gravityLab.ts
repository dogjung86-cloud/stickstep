// [중1 Ⅴ v5] u5l3 gravityLab: 「사과는 어느 쪽으로 떨어질까요?」
// 한 통찰: 중력은 어디서나 지구 중심 쪽으로 당긴다. 그 크기(무게)는 달에서 약 6분의 1이 되지만 질량은 그대로다.
// 조작: (1) 지구 둘레의 빈 곳을 눌러 사과를 놓는다(위, 옆, 아래). (2) 같은 상자를 지구와 달에서 용수철저울에 매단다.
// 흐름: 예측(아래쪽에서 놓으면?) → 세 곳에서 놓기 → 지구와 달에서 재기 → 판정(60 N짜리 가방을 달에서 재면) → 결론.
// 무대는 옛 gravityDrop의 것(지구, 사과, 중력 화살표, 용수철저울)을 살렸다. 수치는 정본과 같다(3 kg, 29.4 N, 4.9 N).

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawCrate, drawForceArrow, drawSpring } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers } from "../bio6/b6Lab";
import { el } from "../../../core/dom";
import { curioCard, type Curio } from "../../../ui/curio";
import { U5, u5Canvas, u5Frame, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
  curio?: Curio;
}
interface Apple {
  x: number;
  y: number;
  v: number;
  landed: boolean;
}
const RE = 44; // 지구 반지름(px)

export const gravityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let scene: "earth" | "scale" = "earth";
  let ready = false; // 예측을 마쳐야 사과를 놓을 수 있다
  const apples: Apple[] = [];
  const done = { top: false, side: false, bottom: false };
  const log = u5Log([{ name: "지구 위쪽에서" }, { name: "지구 옆쪽에서" }, { name: "지구 아래쪽에서" }]);
  let place: "earth" | "moon" = "earth";
  let shown = 29.4; // 저울이 가리키는 값(부드럽게 따라간다)
  const tried = { earth: false, moon: false };
  let finished = false;

  const center = (): { x: number; y: number } => ({ x: st.w() / 2, y: st.h() / 2 + 8 });
  const count = (): number => Number(done.top) + Number(done.side) + Number(done.bottom);

  st.cv.addEventListener("pointerdown", (e) => {
    if (scene !== "earth" || !ready) return;
    const p = st.pt(e);
    const c = center();
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (d < RE + 16) {
      f.say("지구에서 조금 떨어진 <b>빈 곳</b>을 눌러 보세요.");
      return;
    }
    if (apples.filter((a) => !a.landed).length >= 2) return;
    haptic(HAPTIC.tap);
    apples.push({ x: p.x, y: Math.max(62, p.y), v: 0, landed: false });
    if (apples.length > 7) apples.shift();
  });

  const landed = (a: Apple): void => {
    const c = center();
    const ang = Math.atan2(a.y - c.y, a.x - c.x); // 화면 좌표(아래가 +)
    const zone: "top" | "side" | "bottom" = ang < -Math.PI / 4 && ang > (-3 * Math.PI) / 4 ? "top" : ang > Math.PI / 4 && ang < (3 * Math.PI) / 4 ? "bottom" : "side";
    if (!done[zone]) {
      done[zone] = true;
      haptic(HAPTIC.correct);
      log.set(zone === "top" ? 0 : zone === "side" ? 1 : 2, "지구 중심 쪽으로");
      f.pips(count());
      if (count() === 3) {
        f.say("어디서 놓아도 사과는 <b>지구 중심 쪽</b>으로 떨어졌어요. 지구가 당기는 이 힘이 <b>중력</b>이에요.");
        tm.later(toScale, 2200);
      } else {
        const left = [!done.top && "위쪽", !done.side && "옆쪽", !done.bottom && "아래쪽"].filter(Boolean).join(", ");
        f.say(`지구 쪽으로 떨어졌어요. 이번에는 지구 <b>${left}</b>의 빈 곳을 눌러 보세요.`);
      }
    }
  };

  // 두 번째 장면: 지구와 달에서 무게 재기
  const cE = bvCard("u5x-g", { name: "지구에서 재기", sub: "눌러서 재요", key: "earth" });
  const cM = bvCard("u5x-g", { name: "달에서 재기", sub: "눌러서 재요", key: "moon" });
  const note = el("div", { class: "u5x-sum" });
  const paintNote = (): void => {
    note.innerHTML = place === "earth" ? "지구: 질량 <b>3 kg</b>, 무게 <b>29.4 N</b><br>용수철이 길게 늘어났어요." : "달: 질량 <b>3 kg</b>, 무게 <b>4.9 N</b><br>용수철이 조금만 늘어났어요. 지구의 약 6분의 1이에요.";
  };
  const pick = (k: "earth" | "moon"): void => {
    if (finished) return;
    haptic(HAPTIC.tap);
    place = k;
    cE.on(k === "earth");
    cM.on(k === "moon");
    tried[k] = true;
    (k === "earth" ? cE : cM).done();
    (k === "earth" ? cE : cM).sub(k === "earth" ? "29.4 N" : "4.9 N");
    paintNote();
    if (tried.earth && tried.moon) {
      finished = true;
      f.pips(4);
      f.say("같은 상자인데 저울 눈금이 달라요. <b>질량</b>은 그대로이고 <b>무게</b>만 달라졌어요.");
      tm.later(askFinal, 2400);
    }
  };
  cE.el.addEventListener("click", () => pick("earth"));
  cM.el.addEventListener("click", () => pick("moon"));

  function toScale(): void {
    scene = "scale";
    f.say("이 당기는 힘의 크기를 재 봐요. 같은 상자를 <b>지구</b>와 <b>달</b>에서 용수철저울에 매달아 보세요.");
    cE.on(true);
    tried.earth = true;
    cE.done();
    cE.sub("29.4 N");
    paintNote();
    f.slot.setControls(bvCards(2, cE, cM), note);
    api.setCTA("달에서도 재 보세요", { enabled: false });
  }
  function askFinal(): void {
    f.slot.ask(
      "지구에서 무게가 60 N인 가방을 달에 가져가 용수철저울로 재면?",
      [{ t: "10 N" }, { t: "60 N" }, { t: "360 N" }].map((c, i) => ({ ...c, ok: i === 0 })),
      (ok) => api.recordQuiz(ok),
      { why: "달의 중력은 지구의 약 <b>6분의 1</b>이라 60÷6=10 N이에요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("<b>중력</b>은 지구 중심 쪽으로 당겨요. <b>무게</b>는 중력의 크기라 달에서 약 6분의 1이 되지만, <b>질량</b>은 어디서나 그대로예요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  const drawApple = (ctx: CanvasRenderingContext2D, x: number, y: number, r = 7): void => {
    const g = ctx.createRadialGradient(x - 2, y - 3, 1, x, y, r);
    g.addColorStop(0, "#FF9D8A");
    g.addColorStop(0.6, "#F25757");
    g.addColorStop(1, "#B93232");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6FCF97";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + 3, y - r - 4);
    ctx.stroke();
  };
  const drawBody = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, moon: boolean): void => {
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r);
    if (moon) {
      g.addColorStop(0, "#F1F3F7");
      g.addColorStop(0.6, "#B9C0CC");
      g.addColorStop(1, "#6C7586");
    } else {
      g.addColorStop(0, "#8FD0FF");
      g.addColorStop(0.6, "#3E8FE6");
      g.addColorStop(1, "#1B4E9E");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = moon ? "rgba(90,98,115,.45)" : "rgba(88,200,140,.85)";
    const blobs = moon ? [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.4, 0.13], [0.4, -0.4, 0.1]] : [[-0.35, -0.25, 0.34], [0.3, 0.2, 0.3], [0.05, -0.6, 0.18], [-0.3, 0.55, 0.2]];
    blobs.forEach(([bx, by, br]) => {
      ctx.beginPath();
      ctx.ellipse(x + bx * r, y + by * r, br * r * 1.25, br * r, 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  st.run((ctx, w, h, t, dt) => {
    if (scene === "earth") {
      const c = center();
      // 별
      ctx.fillStyle = "rgba(232,238,249,.35)";
      for (let i = 0; i < 26; i++) ctx.fillRect((i * 97) % w, 14 + ((i * 53) % (h - 28)), 1.5, 1.5);
      drawBody(ctx, c.x, c.y, RE, false);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      u5Text(ctx, "지구 중심", c.x, c.y + 13, { px: 12 });
      apples.forEach((a) => {
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const d = Math.hypot(dx, dy);
        if (!a.landed) {
          a.v += 0.07 * dt;
          const stepLen = Math.min(a.v * dt, d - RE - 6);
          a.x += (dx / d) * stepLen;
          a.y += (dy / d) * stepLen;
          if (d - RE - 6 <= 0.6) {
            a.landed = true;
            landed(a);
          }
          drawForceArrow(ctx, a.x, a.y, (dx / d) * 30, (dy / d) * 30, { color: U5.back, width: 3.5 });
        }
        drawApple(ctx, a.x, a.y);
      });
      u5Pill(ctx, !ready ? "먼저 예상해 봐요" : count() === 3 ? "모두 지구 중심 쪽으로" : "빈 곳을 눌러 사과 놓기", U5.back);
      if (ready && count() < 3) {
        // 아직 안 해 본 쪽에 깜빡이는 자리 표시
        const pulse = 0.5 + 0.5 * Math.sin(t / 320);
        const spots: [boolean, number, number][] = [
          [done.top, c.x, c.y - RE - 34],
          [done.side, c.x + RE + 62, c.y],
          [done.bottom, c.x, c.y + RE + 34],
        ];
        spots.forEach(([d, x, y]) => {
          if (d) return;
          ctx.strokeStyle = `rgba(240,164,34,${0.4 + pulse * 0.5})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(x, y, 11 + pulse * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }
    } else {
      // 용수철저울에 매단 상자. 늘어난 길이는 무게에 비례한다(1 N에 3.2px).
      const target = place === "earth" ? 29.4 : 4.9;
      shown += (target - shown) * Math.min(1, 0.12 * dt);
      const x = w / 2 + 6;
      const top = 22;
      const len = 26 + shown * 3.2;
      drawBody(ctx, w / 2, h + 150, 190, place === "moon");
      // 받침대
      ctx.strokeStyle = "rgba(200,214,238,.8)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 62, h - 34);
      ctx.lineTo(x - 62, top);
      ctx.lineTo(x + 10, top);
      ctx.stroke();
      drawSpring(ctx, x, top, x, top + len, { coils: 9, radius: 9, endLen: 8 });
      const by = top + len + 34;
      drawCrate(ctx, x, by, 40, 34, t, 0);
      u5Text(ctx, "질량 3 kg", x + 28, by + 13, { px: 12.5, align: "left" });
      drawForceArrow(ctx, x + 34, by - 17, 0, 10 + shown * 1.6, { color: U5.back, width: 4 });
      u5Text(ctx, "중력", x + 62, by - 6 + shown * 0.8, { color: "#FFB3B3" });
      // 눈금자(늘어난 길이를 견주는 자리)
      ctx.strokeStyle = "rgba(232,238,249,.4)";
      ctx.lineWidth = 1.5;
      for (let n = 0; n <= 30; n += 5) {
        const y = top + 26 + n * 3.2;
        ctx.beginPath();
        ctx.moveTo(x - 40, y);
        ctx.lineTo(x - (n % 10 === 0 ? 28 : 33), y);
        ctx.stroke();
        if (n % 10 === 0) u5Text(ctx, String(n), x - 50, y, { px: 12, color: U5.dim });
      }
      u5Read(ctx, w, shown.toFixed(1), "N", "저울 눈금(무게)");
      u5Pill(ctx, place === "earth" ? "지구에서" : "달에서", place === "earth" ? U5.push : "#C9D1DE");
    }
  });

  // 시작: 예측부터
  f.say("사과를 지구 <b>아래쪽</b> 우주에서 놓으면 어디로 갈까요? 먼저 예상해 봐요.");
  f.slot.setControls(log.el);
  f.slot.ask(
    "지구 아래쪽에서 사과를 놓으면 어디로 갈까요?",
    [{ t: "지구 쪽으로 올라가요" }, { t: "더 아래로 멀어져요" }, { t: "그 자리에 떠 있어요" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        f.slot.showControls();
        ready = true;
        f.say("확인해 봐요. 지구 <b>위쪽, 옆쪽, 아래쪽</b>의 빈 곳을 눌러 사과를 놓아 보세요.");
      },
    },
  );
  api.setCTA("세 곳에서 사과를 놓아 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
