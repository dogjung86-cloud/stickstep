// [중1 Ⅴ v5] u5l7 fanLab: 「바람은 공의 움직임을 어떻게 바꿀까요?」
// 책의 어디에서: 해 보기 '힘과 운동의 관계 알아보기'(홈통에서 굴린 탁구공에 휴대용 선풍기로 운동 방향과 나란하게, 나란하지 않게 바람을 보낸다).
// 한 통찰: 알짜힘이 0이 아니면 속력이나 운동 방향이 변한다. 운동 방향과 나란한 힘은 속력을, 나란하지 않은 힘은 운동 방향도 바꾼다.
// 학생이 정하는 것: 선풍기를 둘 자리(없음, 공의 뒤, 공의 앞, 공의 옆)를 고르고 공을 굴린다. 위에서 내려다본 모습이다.
// 실패하는 길: 선풍기 없이 굴리면 아무것도 변하지 않는다(견줄 기준이 된다). 같은 자리로 다시 굴려도 결과가 같다.
// 흐름: 네 가지로 한 번씩 굴리기(차례는 자유) → 판정(느려지다 멈춘 공이 받은 힘의 방향) → 결론. 굴린 자국은 무대에 남아 서로 견줄 수 있다.
// 옛 랩(windSoccer)은 끝없이 구르는 공에 바람 버튼을 눌렀다. 여기서는 장치를 차리고 한 번씩 굴려 자국을 견준다.
// 자국은 같은 시간 간격으로 찍힌다: 간격이 벌어지면 빨라진 것, 좁아지면 느려진 것이다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvTimers, type BvCard } from "../bio6/b6Lab";
import { U5, u5Canvas, u5Frame, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
type Fan = "none" | "back" | "front" | "side";
const V0 = 1.6; // 손으로 밀어 보낸 처음 속력(px/프레임). 화면에는 처음 속력의 몇 배인지로 보인다
const A = 0.013; // 바람이 주는 가속(px/프레임²)
const WIND: Record<Fan, [number, number]> = { none: [0, 0], back: [1, 0], front: [-1, 0], side: [0, 1] };
const COLOR: Record<Fan, string> = { none: "#C9D1DE", back: "#8FC0FF", front: "#FF9D8A", side: "#9BE8C4" };
const RESULT: Record<Fan, string> = { none: "속력도 방향도 그대로", back: "점점 빨라짐", front: "느려지다 멈춤", side: "길이 휘어짐" };

export const fanLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let fan: Fan = "none";
  let rolling = false;
  let finished = false;
  const ball = { x: 30, y: 0, vx: 0, vy: 0 };
  let tick = 0;
  let live: { x: number; y: number }[] = [];
  const trails: Partial<Record<Fan, { x: number; y: number }[]>> = {};

  const cards: Record<Fan, BvCard> = {
    none: bvCard("u5x-f", { name: "선풍기 없이", sub: "바람 없음", key: "none" }),
    back: bvCard("u5x-f", { name: "공의 뒤에서", sub: "가는 쪽으로 바람", key: "back" }),
    front: bvCard("u5x-f", { name: "공의 앞에서", sub: "마주 보는 바람", key: "front" }),
    side: bvCard("u5x-f", { name: "공의 옆에서", sub: "옆으로 부는 바람", key: "side" }),
  };
  const roll = bvBtn("main u5x-roll", "공 굴리기");
  f.slot.setControls(bvCards(2, cards.none, cards.back, cards.front, cards.side), roll);
  const paint = (): void => {
    (Object.keys(cards) as Fan[]).forEach((k) => cards[k].on(k === fan));
    roll.disabled = rolling || finished;
  };
  (Object.keys(cards) as Fan[]).forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (rolling || finished || k === fan) return;
      haptic(HAPTIC.tap);
      fan = k;
      live = [];
      paint();
    }),
  );
  const mid = (): number => st.h() / 2 + 10;
  roll.addEventListener("click", () => {
    if (rolling || finished) return;
    haptic(HAPTIC.tap);
    rolling = true;
    ball.x = 30;
    ball.y = mid();
    ball.vx = V0;
    ball.vy = 0;
    tick = 0;
    live = [{ x: ball.x, y: ball.y }];
    paint();
  });
  const endRun = (): void => {
    rolling = false;
    trails[fan] = live;
    const first = !cards[fan].isDone();
    cards[fan].done();
    cards[fan].sub(RESULT[fan]);
    haptic(HAPTIC.correct);
    const n = (Object.keys(cards) as Fan[]).filter((k) => cards[k].isDone()).length;
    f.pips(n);
    paint();
    if (n === 4 && first) {
      finished = true;
      paint();
      f.say("바람이 운동 방향과 <b>나란하면</b> 속력이, <b>나란하지 않으면</b> 가는 방향도 변했어요. 바람이 없으면 그대로였고요.");
      tm.later(askFinal, 2600);
      return;
    }
    const left = (Object.keys(cards) as Fan[]).filter((k) => !cards[k].isDone()).map((k) => (k === "none" ? "선풍기 없이" : k === "back" ? "뒤에서" : k === "front" ? "앞에서" : "옆에서"));
    f.say(fan === "none" ? `바람이 없으면 공은 <b>같은 속력</b>으로 곧게 갔어요. 이제 선풍기를 놓아 보세요(${left.join(", ")}).` : `자국의 <b>간격</b>과 <b>길</b>을 봐요. 남은 것: ${left.join(", ") || "없음"}.`);
  };

  function askFinal(): void {
    f.slot.ask(
      "굴러가던 공이 점점 느려지다가 멈췄어요. 공이 받은 힘의 방향은?",
      [{ t: "굴러가는 방향과 반대쪽", ok: true }, { t: "굴러가는 방향과 같은 쪽" }, { t: "힘을 받지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "<b>앞에서</b> 바람이 불 때 공이 느려졌어요. 힘이 없으면 속력은 그대로였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("힘을 받으면 물체의 <b>속력</b>이나 <b>운동 방향</b>이 변해요. 운동 방향과 나란한 힘은 속력을, 나란하지 않은 힘은 운동 방향도 바꿔요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const drawFan = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: [number, number], t: number, on: boolean): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(dir[1], dir[0]));
    // 손잡이와 머리(위에서 본 모습: 바람은 +x 쪽으로 나간다)
    ctx.fillStyle = "#5E7FB8";
    ctx.beginPath();
    ctx.roundRect(-22, -5, 16, 10, 3);
    ctx.fill();
    ctx.fillStyle = "#C9D8F2";
    ctx.beginPath();
    ctx.roundRect(-8, -15, 8, 30, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(160,205,255,.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      const o = on ? ((t / 14 + i * 9) % 18) : 4;
      ctx.globalAlpha = on ? 0.9 - o / 24 : 0.35;
      ctx.beginPath();
      ctx.moveTo(4 + o, i * 9);
      ctx.lineTo(12 + o, i * 9);
      ctx.stroke();
    }
    ctx.restore();
  };

  st.run((ctx, w, h, t, dt) => {
    const my = mid();
    if (rolling) {
      const [wx, wy] = WIND[fan];
      ball.vx += wx * A * dt;
      ball.vy += wy * A * dt;
      if (fan === "front" && ball.vx <= 0) {
        ball.vx = 0;
        endRun();
      }
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      tick += dt;
      if (tick >= 9) {
        tick = 0;
        live.push({ x: ball.x, y: ball.y });
      }
      if (rolling && (ball.x > w + 10 || ball.y > h + 10)) endRun();
    }
    // 홈통 자리(종이테이프: 처음 가던 길)
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(232,238,249,.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, my);
    ctx.lineTo(w - 10, my);
    ctx.stroke();
    ctx.setLineDash([]);
    u5Text(ctx, "처음 가던 길", w - 14, my - 13, { color: U5.dim, px: 12, align: "right" });
    // 지난 자국들(견주는 근거)
    (Object.keys(trails) as Fan[]).forEach((k) => {
      if (k === fan && (rolling || live.length)) return;
      ctx.fillStyle = COLOR[k];
      ctx.globalAlpha = 0.4;
      (trails[k] ?? []).forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y + (k === "none" ? 0 : k === "back" ? -7 : k === "front" ? 7 : 0), 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    });
    // 선풍기
    if (fan === "back") drawFan(ctx, 20, my - 26, [1, 0.35], t, rolling);
    if (fan === "front") drawFan(ctx, w - 20, my + 26, [-1, -0.35], t, rolling);
    if (fan === "side") drawFan(ctx, w / 2, 62, [0, 1], t, rolling);
    if (fan !== "none" && rolling) {
      const [wx, wy] = WIND[fan];
      ctx.strokeStyle = "rgba(160,205,255,.4)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        const px = (((i * 67 + (t / 6) * wx) % w) + w) % w;
        const py = 66 + ((((i * 41 + (t / 6) * wy) % (h - 90)) + (h - 90)) % (h - 90));
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + wx * 20, py + wy * 20);
        ctx.stroke();
      }
    }
    // 이번 자국과 공
    ctx.fillStyle = COLOR[fan];
    live.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    const bx = rolling || live.length ? ball.x : 30;
    const by = rolling || live.length ? ball.y : my;
    const g = ctx.createRadialGradient(bx - 4, by - 5, 1, bx, by, 11);
    g.addColorStop(0, "#FFFFFF");
    g.addColorStop(0.6, "#FFE9C7");
    g.addColorStop(1, "#E9A85C");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, 11, 0, Math.PI * 2);
    ctx.fill();
    const sp = rolling ? Math.hypot(ball.vx, ball.vy) : live.length ? Math.hypot(ball.vx, ball.vy) : 0;
    u5Read(ctx, w, (sp / V0).toFixed(1), "배", "처음 속력의 몇 배");
    u5Pill(ctx, rolling ? (fan === "none" ? "바람 없이 굴러가요" : "바람을 받으며 굴러가요") : live.length ? RESULT[fan] : fan === "none" ? "선풍기 없음" : fan === "back" ? "선풍기: 공의 뒤" : fan === "front" ? "선풍기: 공의 앞" : "선풍기: 공의 옆", fan === "none" ? U5.up : U5.back);
  });

  paint();
  f.say("마찰이 거의 없는 매끈한 바닥을 위에서 본 모습이에요. 먼저 <b>선풍기 없이</b> 굴려 보고, 자리를 바꿔 가며 견줘 보세요.");
  api.setCTA("네 가지로 공을 굴려 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
