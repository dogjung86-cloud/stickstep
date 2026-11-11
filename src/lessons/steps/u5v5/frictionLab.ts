// [중1 Ⅴ v5] u5l5 frictionLab: 「어떤 때 상자를 밀기 더 힘들까요?」
// 한 통찰: 맞닿은 면에서 움직임을 방해하는 힘(마찰력)은 면이 거칠수록, 물체가 무거울수록 크다. 방향은 움직이려는 쪽과 반대다.
// 실험: 바닥(얼음판, 나무 바닥, 모래밭)과 상자 수(1개, 2개)를 정하고 미는 힘을 서서히 키워, 상자가 움직이기 시작하는 힘을 읽는다.
// 조작: 바닥 카드, 상자 수, 그리고 꾹 누르는 '밀기' 버튼. 누르는 동안 미는 힘이 커지고, 움직이기 전까지는 방해하는 힘이 똑같이 커진다.
// 무대는 옛 frictionPush의 것(미는 사람, 나무 상자, 두 힘 화살표)을 살렸다. 조작 다섯 개가 첫 화면 밖에 있던 것을 조작 칸 하나로 모았다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawCrate, drawForceArrow } from "../../../ui/forceProps";
import { drawStickman, posePush, poseStand } from "../../../ui/stick";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers, type BvCard } from "../bio6/b6Lab";
import { U5, u5Canvas, u5Frame, u5Hold, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
type Floor = "ice" | "wood" | "sand";
// 상자 1개가 움직이기 시작하는 힘(N). 2개면 2배.
const NEED: Record<Floor, number> = { ice: 4, wood: 12, sand: 20 };
const NAME: Record<Floor, string> = { ice: "얼음판", wood: "나무 바닥", sand: "모래밭" };
const RAMP = 13; // 누르는 동안 1초에 커지는 힘(N)

export const frictionLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let floor: Floor = "ice";
  let boxes = 1;
  let force = 0;
  let held = false;
  let slide = 0; // 미끄러진 거리(px). 0이면 아직 제자리
  let sliding = false;
  let busy = false;
  let finished = false;
  const rec: Record<string, number> = {};

  const cards: Record<Floor, BvCard> = {
    ice: bvCard("u5x-f", { name: NAME.ice, sub: "매끄러워요", key: "ice" }),
    wood: bvCard("u5x-f", { name: NAME.wood, sub: "보통이에요", key: "wood" }),
    sand: bvCard("u5x-f", { name: NAME.sand, sub: "거칠어요", key: "sand" }),
  };
  const seg1 = el("button", { class: "u5x-seg on", text: "상자 1개", attrs: { type: "button" } }) as HTMLButtonElement;
  const seg2 = el("button", { class: "u5x-seg", text: "상자 2개", attrs: { type: "button" } }) as HTMLButtonElement;
  seg1.dataset.k = "1";
  seg2.dataset.k = "2";
  seg2.disabled = true;
  const push = u5Hold("main u5x-push", "꾹 눌러 밀기", (v) => {
    if (busy || finished) return;
    held = v;
    if (!v && !sliding && force > 0) f.say("아직 안 움직였어요. 움직일 때까지 <b>더 오래</b> 눌러 보세요.");
  });
  f.slot.setControls(bvCards(3, cards.ice, cards.wood, cards.sand), el("div", { class: "u5x-segs" }, seg1, seg2), push);

  const done1 = (): number => (["ice", "wood", "sand"] as Floor[]).filter((k) => rec[k + 1] !== undefined).length;
  const paint = (): void => {
    (Object.keys(cards) as Floor[]).forEach((k) => {
      cards[k].on(k === floor);
      const a = rec[k + 1];
      const b = rec[k + 2];
      if (a !== undefined) cards[k].sub(b !== undefined ? `${a} N · 2개 ${b} N` : `${a} N에 움직임`);
    });
    seg1.classList.toggle("on", boxes === 1);
    seg2.classList.toggle("on", boxes === 2);
  };
  const reset = (): void => {
    force = 0;
    slide = 0;
    sliding = false;
    held = false;
  };
  (Object.keys(cards) as Floor[]).forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (busy || finished || k === floor) return;
      haptic(HAPTIC.tap);
      floor = k;
      reset();
      paint();
    }),
  );
  const setBoxes = (n: number): void => {
    if (busy || finished || boxes === n) return;
    haptic(HAPTIC.tap);
    boxes = n;
    reset();
    paint();
  };
  seg1.addEventListener("click", () => setBoxes(1));
  seg2.addEventListener("click", () => setBoxes(2));

  const guide = (): void => {
    const n = done1();
    if (n === 0) f.say("<b>꾹 눌러 밀기</b>를 누르고 있으면 미는 힘이 점점 커져요. 상자가 <b>몇 N</b>에서 움직이는지 봐요.");
    else if (n < 3) {
      const left = (["ice", "wood", "sand"] as Floor[]).filter((k) => rec[k + 1] === undefined).map((k) => NAME[k]);
      f.say(`기록했어요. 이번에는 <b>${left.join(", ")}</b>에서도 밀어 보세요.`);
    } else if (!Object.keys(rec).some((k) => k.endsWith("2"))) {
      seg2.disabled = false;
      f.say("바닥이 거칠수록 힘이 많이 들었어요. 이번에는 <b>상자 2개</b>를 눌러 무겁게 하고 다시 밀어 보세요.");
    }
  };

  const moved = (): void => {
    const need = NEED[floor] * boxes;
    rec[floor + boxes] = need;
    busy = true;
    held = false;
    haptic(HAPTIC.correct);
    cards[floor].done();
    paint();
    const two = Object.keys(rec).some((k) => k.endsWith("2"));
    f.pips(done1() + (two ? 1 : 0));
    tm.later(() => {
      busy = false;
      reset();
      if (done1() === 3 && two) {
        finished = true;
        f.say("같은 바닥인데 상자가 무거워지니 힘이 <b>2배</b>로 들었어요.");
        tm.later(askFinal, 1800);
      } else guide();
    }, 1500);
  };

  function askFinal(): void {
    f.slot.ask(
      "상자를 움직이는 데 힘이 가장 많이 드는 경우는?",
      [{ t: "거친 바닥, 무거운 상자", ok: true }, { t: "거친 바닥, 가벼운 상자" }, { t: "매끄러운 바닥, 무거운 상자" }],
      (ok) => api.recordQuiz(ok),
      { why: "바닥이 <b>거칠수록</b>, 상자가 <b>무거울수록</b> 방해하는 힘이 컸어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("맞닿은 면에서 움직임을 방해하는 힘이 <b>마찰력</b>이에요. 면이 거칠수록, 물체가 무거울수록 커요. 방향은 움직이려는 쪽과 <b>반대</b>예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const drawFloor = (ctx: CanvasRenderingContext2D, w: number, gy: number, h: number): void => {
    const g = ctx.createLinearGradient(0, gy, 0, h);
    if (floor === "ice") {
      g.addColorStop(0, "#CFE8FF");
      g.addColorStop(1, "#6FA6DA");
    } else if (floor === "wood") {
      g.addColorStop(0, "#C89562");
      g.addColorStop(1, "#7D5330");
    } else {
      g.addColorStop(0, "#E3C88E");
      g.addColorStop(1, "#A88752");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, gy, w, h - gy);
    if (floor === "ice") {
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 2;
      [[30, 8, 46], [140, 16, 60], [250, 9, 40]].forEach(([x, y, l]) => {
        ctx.beginPath();
        ctx.moveTo(x, gy + y);
        ctx.lineTo(x + l, gy + y - 4);
        ctx.stroke();
      });
    } else if (floor === "wood") {
      ctx.strokeStyle = "rgba(70,40,18,.45)";
      ctx.lineWidth = 1.5;
      for (let x = 20; x < w; x += 58) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "rgba(110,84,40,.6)";
      for (let i = 0; i < 90; i++) ctx.fillRect((i * 67) % w, gy + 1 + ((i * 29) % (h - gy - 2)), 2, 2);
      // 거친 겉면(오돌토돌한 윗선)
      ctx.fillStyle = "#E3C88E";
      for (let x = 0; x < w; x += 7) {
        ctx.beginPath();
        ctx.arc(x + 3.5, gy, 3, Math.PI, 0);
        ctx.fill();
      }
    }
  };

  st.run((ctx, w, h, t, dt) => {
    const gy = h - 38;
    const need = NEED[floor] * boxes;
    if (held && !sliding) {
      force = Math.min(force + (RAMP * dt) / 60, need);
      if (force >= need) {
        sliding = true;
        moved();
      }
    } else if (!held && !sliding && force > 0) force = Math.max(0, force - (40 * dt) / 60);
    if (sliding && slide < 50) slide = Math.min(50, slide + 2 * dt);
    drawFloor(ctx, w, gy, h);
    const cx = 150 + slide;
    const cw = 50;
    const chh = 40;
    const effort = need ? force / need : 0;
    drawStickman(ctx, cx - cw / 2 - 30, gy, 60, force > 0.2 || sliding ? posePush(effort, t, 1) : poseStand(t, 1), {});
    for (let i = 0; i < boxes; i++) drawCrate(ctx, cx, gy - i * chh, cw, chh, t, !sliding && effort > 0.5 ? effort : 0);
    // 미는 힘(파랑, 상자 왼쪽에서 오른쪽으로)과 방해하는 힘(빨강, 바닥 면에서 왼쪽으로). 1 N에 1.8px.
    const shown = sliding ? need : force;
    if (shown > 0.4) {
      const len = 12 + shown * 1.8;
      drawForceArrow(ctx, cx, gy - chh / 2, len + cw / 2, 0, { color: U5.push, width: 4.5 });
      u5Text(ctx, "미는 힘", cx + cw / 2 + 8 + len / 2, gy - chh / 2 - 14, { color: "#B5D4FF", px: 12 });
      drawForceArrow(ctx, cx - cw / 2, gy + 13, -len, 0, { color: U5.back, width: 4.5 });
      u5Text(ctx, "방해하는 힘", cx - cw / 2 - len / 2, gy + 27, { color: "#FFD9D9", px: 12 });
    }
    u5Read(ctx, w, shown.toFixed(0), "N", "미는 힘");
    u5Pill(ctx, sliding ? `${need} N에서 움직였어요` : force > 0.3 ? "아직 꼼짝 않아요" : `${NAME[floor]} · 상자 ${boxes}개`, sliding ? U5.up : U5.gold);
  });

  paint();
  guide();
  api.setCTA("세 바닥에서 상자를 밀어 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
