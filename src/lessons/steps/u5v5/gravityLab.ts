// [중1 Ⅴ v5] u5l3 gravityLab: 「사과는 어느 쪽으로 떨어질까요?」
// 책의 어디에서: 해 보기 '중력의 방향 찾기', 무게와 질량, 달에서 잰 무게.
// 한 통찰: 중력은 어디서나 지구 중심 쪽으로 당긴다. 그 크기(무게)는 달에서 약 6분의 1이 되지만 질량은 그대로다.
// 학생이 정하는 것: (1) 지구 둘레 세 곳의 사과마다 떨어질 방향을 화살표로 겨눈 뒤 놓는다. (2) 저울(용수철저울, 양팔저울)과 곳(지구, 달)을 골라 같은 상자를 잰다.
// 실패하는 길: 겨눈 쪽과 다르게 떨어지면 겨눈 화살표(점선)와 실제로 떨어진 길이 어긋나 보인다. 다시 겨눠야 한다.
// 흐름: 위쪽 사과 → 오른쪽 사과 → 아래쪽 사과 → 저울 둘, 곳 둘의 표 네 칸 채우기 → 판정(60 N짜리 가방을 달에서) → 결론.
// 옛 랩(gravityDrop)은 빈 곳을 눌러 떨어뜨리고 구경했다. 여기서는 먼저 겨누고, 저울을 바꿔 가며 직접 잰다. 수치는 3 kg, 29.4 N, 4.9 N.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawCrate, drawForceArrow, drawSpring } from "../../../ui/forceProps";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { bvCapture, bvTimers } from "../bio6/b6Lab";
import { U5, u5Canvas, u5Frame, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
  curio?: Curio;
}
const RE = 40; // 지구 반지름(px)
const DIST = RE + 50; // 사과가 놓인 거리
const SPOTS = [
  { name: "위쪽", ang: -Math.PI / 2 },
  { name: "오른쪽", ang: 0 },
  { name: "아래쪽", ang: Math.PI / 2 },
];
type Tool = "spring" | "balance";
type Place = "earth" | "moon";
const CELL: Record<string, string> = { "spring-earth": "29.4 N", "spring-moon": "4.9 N", "balance-earth": "3 kg", "balance-moon": "3 kg" };

export const gravityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  // ── 첫 장면: 겨누고 놓기 ──
  let scene: "aim" | "scale" = "aim";
  let spot = 0;
  let aim: number | null = null; // 겨눈 각도(화면 좌표)
  let dragging = false;
  let fall = 0; // 0 제자리, 0~1 떨어지는 중
  let failAim: number | null = null; // 틀린 겨눔(점선으로 남긴다)
  let busy = false;
  const doneSpots: number[] = [];
  const hint = el("div", { class: "u5x-sum tall" });
  f.slot.setControls(hint);
  const paintHint = (): void => {
    hint.innerHTML = SPOTS.map((p, i) => `${p.name} 사과: <b>${doneSpots.includes(i) ? "지구 중심 쪽으로 떨어짐" : i === spot ? "겨누는 중" : "아직"}</b>`).join("<br>");
  };
  const center = (): { x: number; y: number } => ({ x: st.w() / 2, y: st.h() / 2 + 10 });
  const applePos = (i: number, k = 0): { x: number; y: number } => {
    const c = center();
    const d = DIST - (DIST - RE - 7) * k;
    return { x: c.x + Math.cos(SPOTS[i].ang) * d, y: c.y + Math.sin(SPOTS[i].ang) * d };
  };

  st.cv.addEventListener("pointerdown", (e) => {
    if (scene !== "aim" || busy) return;
    const p = st.pt(e);
    const a = applePos(spot);
    if (Math.hypot(p.x - a.x, p.y - a.y) > 60) return;
    bvCapture(st.cv, e.pointerId);
    dragging = true;
    failAim = null;
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = st.pt(e);
    const a = applePos(spot);
    if (Math.hypot(p.x - a.x, p.y - a.y) > 10) aim = Math.atan2(p.y - a.y, p.x - a.x);
  });
  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    if (aim === null) return;
    busy = true;
    const toCenter = SPOTS[spot].ang + Math.PI;
    let diff = Math.abs(aim - toCenter) % (Math.PI * 2);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    const good = diff < 0.45;
    const t0 = performance.now();
    const tick = (): void => {
      const k = Math.min(1, (performance.now() - t0) / 700);
      fall = k * k;
      if (k < 1) {
        tm.later(tick, 16);
        return;
      }
      if (good) {
        haptic(HAPTIC.correct);
        doneSpots.push(spot);
        f.pips(doneSpots.length);
        aim = null;
        fall = 0;
        if (doneSpots.length === 3) {
          paintHint();
          f.say("어디서 놓아도 사과는 <b>지구 중심 쪽</b>으로 떨어졌어요. 지구가 당기는 이 힘이 <b>중력</b>이에요.");
          tm.later(toScale, 2200);
        } else {
          spot += 1;
          busy = false;
          paintHint();
          f.say(`겨눈 대로 떨어졌어요. 이번에는 지구 <b>${SPOTS[spot].name}</b> 사과예요. 떨어질 쪽으로 화살표를 겨눠 보세요.`);
        }
      } else {
        haptic(HAPTIC.wrong);
        failAim = aim;
        f.say("겨눈 쪽(점선)과 다르게 떨어졌어요. 사과가 <b>어디를 향해</b> 갔는지 보고 다시 겨눠 보세요.");
        tm.later(() => {
          fall = 0;
          aim = null;
          busy = false;
        }, 1300);
      }
    };
    tick();
  };
  st.cv.addEventListener("pointerup", release);
  st.cv.addEventListener("pointercancel", release);

  // ── 둘째 장면: 저울 둘, 곳 둘 ──
  let tool: Tool = "spring";
  let place: Place = "earth";
  let shown = 29.4;
  const got = new Set<string>();
  let finished = false;
  const seg = (text: string, key: string): HTMLButtonElement => {
    const b = el("button", { class: "u5x-seg", text, attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = key;
    return b;
  };
  const tS = seg("용수철저울", "spring");
  const tB = seg("양팔저울", "balance");
  const pE = seg("지구에서", "earth");
  const pM = seg("달에서", "moon");
  const table = el("div", { class: "u5x-table" });
  const paintTable = (): void => {
    const cell = (k: string): string => `<span class="u5x-td${got.has(k) ? " on" : ""}${k === `${tool}-${place}` ? " cur" : ""}">${got.has(k) ? CELL[k] : ""}</span>`;
    table.innerHTML = `<span class="u5x-th"></span><span class="u5x-th">지구</span><span class="u5x-th">달</span><span class="u5x-th row">용수철저울</span>${cell("spring-earth")}${cell("spring-moon")}<span class="u5x-th row">양팔저울</span>${cell("balance-earth")}${cell("balance-moon")}`;
    tS.classList.toggle("on", tool === "spring");
    tB.classList.toggle("on", tool === "balance");
    pE.classList.toggle("on", place === "earth");
    pM.classList.toggle("on", place === "moon");
  };
  const measure = (): void => {
    got.add(`${tool}-${place}`);
    paintTable();
    if (got.size === 4 && !finished) {
      finished = true;
      f.pips(4);
      f.say("용수철저울의 값은 달에서 줄었는데 양팔저울의 값은 <b>그대로</b>예요. 달라진 것은 <b>무게</b>뿐이에요.");
      tm.later(askFinal, 2600);
    } else if (!finished) f.say(tool === "spring" ? "용수철저울은 당기는 힘의 크기, <b>무게</b>를 재요. 다른 칸도 채워 보세요." : "양팔저울은 추와 견주어 <b>질량</b>을 재요. 다른 칸도 채워 보세요.");
  };
  const pick = (t: Tool | null, p: Place | null): void => {
    if (finished) return;
    haptic(HAPTIC.tap);
    if (t) tool = t;
    if (p) place = p;
    measure();
  };
  tS.addEventListener("click", () => pick("spring", null));
  tB.addEventListener("click", () => pick("balance", null));
  pE.addEventListener("click", () => pick(null, "earth"));
  pM.addEventListener("click", () => pick(null, "moon"));

  function toScale(): void {
    scene = "scale";
    got.add("spring-earth");
    paintTable();
    f.say("이 당기는 힘을 재 봐요. <b>저울</b>과 <b>곳</b>을 바꿔 가며 같은 상자를 재서 표 네 칸을 채워 보세요.");
    f.slot.setControls(el("div", { class: "u5x-segs" }, tS, tB), el("div", { class: "u5x-segs" }, pE, pM), table);
    api.setCTA("표 네 칸을 채워 보세요", { enabled: false });
  }
  function askFinal(): void {
    f.slot.ask(
      "지구에서 무게가 60 N인 가방을 달에 가져가 용수철저울로 재면?",
      [{ t: "10 N", ok: true }, { t: "60 N" }, { t: "360 N" }],
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

  const drawApple = (ctx: CanvasRenderingContext2D, x: number, y: number, r = 8): void => {
    const g = ctx.createRadialGradient(x - 2, y - 3, 1, x, y, r);
    g.addColorStop(0, "#FF9D8A");
    g.addColorStop(0.6, "#F25757");
    g.addColorStop(1, "#B93232");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
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
    if (scene === "aim") {
      const c = center();
      ctx.fillStyle = "rgba(232,238,249,.35)";
      for (let i = 0; i < 26; i++) ctx.fillRect((i * 97) % w, 14 + ((i * 53) % (h - 28)), 1.5, 1.5);
      drawBody(ctx, c.x, c.y, RE, false);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      u5Text(ctx, "지구 중심", c.x, c.y + 13, { px: 12 });
      SPOTS.forEach((_, i) => {
        const done = doneSpots.includes(i);
        const a = applePos(i, done ? 1 : i === spot ? fall : 0);
        if (i > spot && !done) ctx.globalAlpha = 0.35;
        if (done) {
          // 떨어진 길을 남긴다(세 길이 모두 중심을 향한다)
          const a0 = applePos(i, 0);
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = "rgba(242,87,87,.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a0.x, a0.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        drawApple(ctx, a.x, a.y);
        ctx.globalAlpha = 1;
      });
      const a0 = applePos(spot, 0);
      if (failAim !== null) drawForceArrow(ctx, a0.x, a0.y, Math.cos(failAim) * 38, Math.sin(failAim) * 38, { color: "#9FB0CC", width: 3, alpha: 0.75 });
      if (aim !== null && fall === 0) drawForceArrow(ctx, a0.x, a0.y, Math.cos(aim) * 38, Math.sin(aim) * 38, { color: U5.back, width: 4.5 });
      else if (!busy && !dragging && doneSpots.length < 3) {
        const pulse = 0.5 + 0.5 * Math.sin(t / 300);
        ctx.strokeStyle = `rgba(240,164,34,${0.4 + pulse * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a0.x, a0.y, 14 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      u5Pill(ctx, doneSpots.length === 3 ? "모두 지구 중심 쪽으로" : dragging ? "손을 떼면 사과를 놓아요" : `${SPOTS[spot].name} 사과: 떨어질 쪽 겨누기`, U5.back);
    } else {
      const moon = place === "moon";
      drawBody(ctx, w / 2, h + 150, 190, moon);
      const x = w / 2 + 6;
      if (tool === "spring") {
        // 용수철저울: 늘어난 길이가 무게에 비례한다(1 N에 3.2px)
        const target = moon ? 4.9 : 29.4;
        shown += (target - shown) * Math.min(1, 0.12 * dt);
        const top = 22;
        const len = 26 + shown * 3.2;
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
        drawForceArrow(ctx, x + 34, by - 17, 0, 10 + shown * 1.6, { color: U5.back, width: 4 });
        u5Text(ctx, "중력", x + 62, by - 6 + shown * 0.8, { color: "#FFB3B3" });
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
        u5Read(ctx, w, shown.toFixed(1), "N", "용수철저울(무게)");
      } else {
        // 양팔저울: 왼쪽 접시에 상자, 오른쪽 접시에 1 kg 추 셋. 지구에서도 달에서도 수평이다.
        const py = 150;
        ctx.strokeStyle = "rgba(200,214,238,.85)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, py + 40);
        ctx.lineTo(x, 78);
        ctx.moveTo(x - 22, py + 40);
        ctx.lineTo(x + 22, py + 40);
        ctx.moveTo(x - 84, 80);
        ctx.lineTo(x + 84, 80);
        ctx.stroke();
        [-84, 84].forEach((dx) => {
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + dx, 80);
          ctx.lineTo(x + dx - 24, py - 22);
          ctx.moveTo(x + dx, 80);
          ctx.lineTo(x + dx + 24, py - 22);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + dx - 28, py - 22);
          ctx.quadraticCurveTo(x + dx, py - 12, x + dx + 28, py - 22);
          ctx.stroke();
        });
        drawCrate(ctx, x - 84, py - 22, 34, 28, t, 0);
        for (let i = 0; i < 3; i++) {
          const wx = x + 84 - 15 + i * 15;
          const g = ctx.createLinearGradient(wx - 6, 0, wx + 6, 0);
          g.addColorStop(0, "#B98A1E");
          g.addColorStop(0.4, "#FFE08A");
          g.addColorStop(1, "#A8780F");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.roundRect(wx - 6, py - 40, 12, 18, 2);
          ctx.fill();
        }
        u5Text(ctx, "상자", x - 84, py - 2, { px: 12, color: U5.dim });
        u5Text(ctx, "1 kg 추 셋", x + 84, py - 2, { px: 12, color: U5.dim });
        u5Text(ctx, "수평", x, 66, { px: 12.5, color: "#9BE8C4" });
        u5Read(ctx, w, "3", "kg", "양팔저울(질량)");
      }
      u5Pill(ctx, moon ? "달에서" : "지구에서", moon ? "#C9D1DE" : U5.push);
    }
  });

  paintHint();
  f.say("지구 <b>위쪽</b> 우주에 사과가 있어요. 사과에서 끌어 <b>떨어질 쪽</b>으로 화살표를 겨누고 손을 떼 보세요.");
  api.setCTA("세 사과가 떨어질 쪽을 겨눠 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
