// [중1 Ⅴ v5] u5l7 fanLab: 「바람은 공의 움직임을 어떻게 바꿀까요?」
// 책의 어디에서: 해 보기 '힘과 운동의 관계 알아보기'(홈통에서 굴린 탁구공에 휴대용 선풍기로 운동 방향과 나란하게, 나란하지 않게 바람을 보낸다).
// 한 통찰: 알짜힘이 0이 아니면 속력이나 운동 방향이 변한다. 운동 방향과 나란한 힘은 속력을, 나란하지 않은 힘은 운동 방향도 바꾼다.
// 학생이 정하는 것: 선풍기를 둘 자리(없음, 공의 뒤, 공의 앞, 공의 옆)를 고르고 공을 굴린다. 위에서 내려다본 모습이다.
// 실패하는 길: 선풍기 없이 굴리면 아무것도 변하지 않는다(견줄 기준이 된다). 같은 자리로 다시 굴려도 결과가 같다.
// 흐름: 네 가지로 한 번씩 굴리기(차례는 자유) → 판정(느려지다 멈춘 공이 받은 힘의 방향) → 결론. 굴린 자국은 무대에 남아 서로 견줄 수 있다.
// 옛 랩(windSoccer)은 끝없이 구르는 공에 바람 버튼을 눌렀다. 여기서는 장치를 차리고 한 번씩 굴려 자국을 견준다.
// 자국은 같은 시간 간격으로 찍힌다: 간격이 벌어지면 빨라진 것, 좁아지면 느려진 것이다.
// 그래픽 손질(2026-11-15): 선풍기는 둥근 망과 날개, 손잡이가 있는 휴대용 선풍기로 그리고, 뒤와 앞의 선풍기는 길과 일직선에 둔다(공 뒤, 길 끝).
//   굴러가는 공에는 '바람이 미는 힘'(파랑, 늘 같은 길이)과 '운동 방향'(초록, 길이는 빠르기)을 공 가운데에서 그려 둘이 나란한지 보이게 했다.
//   넷을 다 굴린 뒤(판정과 결론) 무대는 작은 칸 넷(없이, 뒤, 앞, 옆)으로 나뉘어 칸마다 자국, 선풍기, 공의 두 화살표를 다시 보인다.
//   판정 동안은 '앞에서' 칸만 밝게 앞세우고, 판정 질문이 떠 있는 동안은 네 칸 모두 힘 화살표(파랑)를 숨긴다(답한 뒤와 결론에서는 보인다).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvTimers, type BvCard } from "../bio6/b6Lab";
import { U5, u5Arrow, u5Canvas, u5Frame, u5Pill, u5Read, u5Text } from "./u5Kit";

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
const NAME: Record<Fan, string> = { none: "선풍기 없이", back: "뒤에서", front: "앞에서", side: "옆에서" };
const SHORT: Record<Fan, string> = { none: "그대로", back: "빨라짐", front: "느려지다 멈춤", side: "휘어짐" };
const X_START = 56; // 공이 출발하는 자리(그 뒤에 '뒤에서' 선풍기가 길과 일직선으로 선다)
const FPX = 28; // 바람이 미는 힘 화살표(늘 같은 크기)
const VPX = 20; // 운동 방향 화살표: 처음 속력일 때 20px, 빠르기에 비례
const GRID: Fan[] = ["none", "back", "front", "side"]; // 넷을 다 굴린 뒤의 칸 차례(왼쪽 위부터)
type Pt = { x: number; y: number; vx: number; vy: number };

export const fanLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let fan: Fan = "none";
  let rolling = false;
  let finished = false;
  const ball = { x: X_START, y: 0, vx: 0, vy: 0 };
  let tick = 0;
  let live: Pt[] = [];
  const trails: Partial<Record<Fan, Pt[]>> = {};
  // 넷을 다 굴린 뒤: 칸 넷 비교판. ask = 판정 질문이 떠 있는 동안('앞에서' 칸을 앞세우고 힘 화살표는 숨긴다), reveal = 답한 뒤, done = 결론
  let grid: "off" | "ask" | "reveal" | "done" = "off";

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
    ball.x = X_START;
    ball.y = mid();
    ball.vx = V0;
    ball.vy = 0;
    tick = 0;
    live = [{ x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy }];
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
    grid = "ask";
    f.slot.ask(
      "굴러가던 공이 점점 느려지다가 멈췄어요. 공이 받은 힘의 방향은?",
      [{ t: "굴러가는 방향과 반대쪽", ok: true }, { t: "굴러가는 방향과 같은 쪽" }, { t: "힘을 받지 않았어요" }],
      (ok) => {
        grid = "reveal"; // 답한 뒤에는 칸마다 바람이 미는 힘을 다시 보인다
        api.recordQuiz(ok);
      },
      { why: "<b>앞에서</b> 바람이 불 때 공이 느려졌어요. 힘이 없으면 속력은 그대로였어요.", onNext: finish },
    );
  }
  function finish(): void {
    grid = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("힘을 받으면 물체의 <b>속력</b>이나 <b>운동 방향</b>이 변해요. 운동 방향과 나란한 힘은 속력을, 나란하지 않은 힘은 운동 방향도 바꿔요.");
    api.enableCTA(s.cta ?? "다음");
  }

  /** 휴대용 선풍기(위에서 비스듬히 본 모습): 손잡이, 모터, 둥근 망 안의 날개 셋. 바람은 +x 쪽(dir)으로 나간다. s는 크기 배율. */
  const drawFan = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: [number, number], t: number, on: boolean, s = 1): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(dir[1], dir[0]));
    ctx.scale(s, s);
    // 손잡이와 모터 통(망 뒤쪽)
    const hg = ctx.createLinearGradient(0, -5, 0, 5);
    hg.addColorStop(0, "#86A4D6");
    hg.addColorStop(0.55, "#5E7FB8");
    hg.addColorStop(1, "#34507F");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.roundRect(-27, -4.5, 17, 9, 4.5);
    ctx.fill();
    ctx.fillStyle = "#4A6699";
    ctx.beginPath();
    ctx.roundRect(-13, -7, 10, 14, 4);
    ctx.fill();
    // 망과 날개: 바람 쪽을 향한 원판을 비스듬히 보면 바람 방향으로 납작한 타원이다
    const R = 17;
    const K = 0.4;
    const P = (r: number, a: number): [number, number] => [Math.cos(a) * r * K, Math.sin(a) * r];
    ctx.fillStyle = "rgba(11,21,36,.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, R * K, R, 0, 0, Math.PI * 2);
    ctx.fill();
    const spin = on ? t / 60 : 0.5;
    ctx.fillStyle = "rgba(176,208,255,.85)";
    for (let b = 0; b < 3; b++) {
      const a0 = spin + (b * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(...P(3, a0 - 0.35));
      for (let k = 0; k <= 8; k++) ctx.lineTo(...P(R - 3, a0 - 0.55 + (k / 8) * 1.0));
      ctx.lineTo(...P(3, a0 + 0.35));
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(220,230,245,.5)";
    ctx.lineWidth = 0.9;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(...P(4, a));
      ctx.lineTo(...P(R, a));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.55 * K, R * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#DCE6F5";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * K, R, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#E8EEF9";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 바람 줄(켜졌을 때 앞으로 흘러간다)
    ctx.strokeStyle = "rgba(160,205,255,.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      const o = on ? (t / 14 + i * 9) % 18 : 4;
      ctx.globalAlpha = on ? 0.9 - o / 24 : 0.35;
      ctx.beginPath();
      ctx.moveTo(R * K + 4 + o, i * 9);
      ctx.lineTo(R * K + 12 + o, i * 9);
      ctx.stroke();
    }
    ctx.restore();
  };
  /** 선풍기 자리(무대 좌표): 뒤와 앞은 길과 일직선(공 뒤, 길 끝), 옆은 길 위쪽에서 길을 향해. */
  const fanAt = (k: Fan, w: number, h: number): { x: number; y: number; dir: [number, number] } | null => {
    const my = h / 2 + 10;
    if (k === "back") return { x: 31, y: my, dir: [1, 0] };
    if (k === "front") return { x: w - 31, y: my, dir: [-1, 0] };
    if (k === "side") return { x: w / 2, y: my - 64, dir: [0, 1] };
    return null;
  };
  /** 공의 두 화살표: 바람이 미는 힘(파랑, 바람 쪽으로 늘 같은 길이)과 운동 방향(초록, 가는 쪽). 둘 다 공 가운데에서.
   *  같은 쪽을 가리키면(나란하면) 두 화살표가 포개지지 않게 공 안에서 조금 비켜 나란히 그린다. vl은 운동 방향 화살표의 길이. */
  const ballArrows = (ctx: CanvasRenderingContext2D, k: Fan, x: number, y: number, vx: number, vy: number, fl: number, vl: number, wd = 4): void => {
    const [wx, wy] = WIND[k];
    const sp = Math.hypot(vx, vy);
    const ux = sp > 1e-6 ? vx / sp : 0;
    const uy = sp > 1e-6 ? vy / sp : 0;
    const windy = (wx !== 0 || wy !== 0) && fl > 0;
    const same = windy && sp > 1e-6 && wx * ux + wy * uy > 0.9;
    const off = same ? 4.5 : 0;
    if (windy) u5Arrow(ctx, x - uy * off, y + ux * off, wx * fl, wy * fl, { color: U5.push, width: wd });
    if (vl > 2) u5Arrow(ctx, x + uy * off, y - ux * off, ux * vl, uy * vl, { color: U5.up, width: wd });
  };
  const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
    const g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.45, 1, x, y, r);
    g.addColorStop(0, "#FFFFFF");
    g.addColorStop(0.6, "#FFE9C7");
    g.addColorStop(1, "#E9A85C");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  /** 넷을 다 굴린 뒤: 무대를 작은 칸 넷으로. 칸마다 같은 배율(S)로 출발점을 칸 왼쪽에 맞춰 처음 가던 길, 선풍기, 자국, 출발점의 공을 다시 그린다.
   *  공의 운동 방향(초록)은 공 위에서 가는 쪽으로(자국을 덮지 않게), 바람이 미는 힘(파랑)은 공 가운데에서. 판정 질문이 떠 있는 동안은 힘을 숨긴다(그림이 답을 알려 주지 않게). */
  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void => {
    const pw = w / 2;
    const ph = h / 2;
    const S = 0.85; // 자국 배율(네 칸 같다)
    const OX = 30; // 칸 안에서 출발점의 x
    const OY = 54; // 칸 안에서 처음 가던 길의 y
    const my = h / 2 + 10;
    const judging = grid === "ask" || grid === "reveal";
    GRID.forEach((k, i) => {
      const x0 = (i % 2) * pw;
      const y0 = Math.floor(i / 2) * ph;
      const lead = judging && k === "front";
      const P = (q: Pt): [number, number] => [x0 + OX + (q.x - X_START) * S, y0 + OY + (q.y - my) * S];
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, pw, ph);
      ctx.clip();
      ctx.globalAlpha = judging && !lead ? 0.38 : 1;
      if (lead) {
        ctx.fillStyle = "rgba(240,164,34,.08)";
        ctx.fillRect(x0, y0, pw, ph);
      }
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(232,238,249,.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0 + OX, y0 + OY);
      ctx.lineTo(x0 + pw - 5, y0 + OY);
      ctx.stroke();
      ctx.setLineDash([]);
      // 선풍기(칸 안 자리): 뒤는 출발점 뒤, 앞은 길 끝, 옆은 길 위에서 아래로
      if (k === "back") drawFan(ctx, x0 + 14, y0 + OY, [1, 0], t, false, 0.55);
      if (k === "front") drawFan(ctx, x0 + pw - 14, y0 + OY, [-1, 0], t, false, 0.55);
      if (k === "side") drawFan(ctx, x0 + 104, y0 + 23, [0, 1], t, false, 0.55);
      const tr = trails[k] ?? [];
      // 출발점의 공(자국의 첫 점)
      const p0 = tr[0];
      if (p0) {
        const [bx, by] = P(p0);
        drawBall(ctx, bx, by, 6);
      }
      // 자국: 같은 시간 간격의 점(조금 크게, 공과 화살표가 덮지 않는 뒤쪽 층)
      ctx.fillStyle = COLOR[k];
      tr.forEach((q, j) => {
        if (j === 0) return;
        const [qx, qy] = P(q);
        ctx.beginPath();
        ctx.arc(qx, qy, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      if (p0) {
        const [bx, by] = P(p0);
        const sp = Math.hypot(p0.vx, p0.vy) || 1;
        // 운동 방향: 공 위쪽에서 가는 쪽으로(자국 위를 지나지 않게)
        u5Arrow(ctx, bx - 3, by - 12, (p0.vx / sp) * 22, (p0.vy / sp) * 22, { color: U5.up, width: 3.5 });
        // 바람이 미는 힘: 공 가운데에서(판정 질문 동안은 숨김)
        if (grid !== "ask") ballArrows(ctx, k, bx, by, p0.vx, p0.vy, 20, 0, 3.5);
      }
      u5Text(ctx, NAME[k], x0 + 8, y0 + 13, { px: 12.5, align: "left", color: lead ? "#FFD27A" : U5.ink });
      u5Text(ctx, SHORT[k], x0 + pw - 8, y0 + 13, { px: 12, align: "right", color: COLOR[k] });
      ctx.restore();
      if (lead) {
        ctx.strokeStyle = "rgba(240,164,34,.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x0 + 2, y0 + 2, pw - 4, ph - 4, 10);
        ctx.stroke();
      }
    });
    ctx.strokeStyle = "rgba(232,238,249,.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pw, 6);
    ctx.lineTo(pw, h - 6);
    ctx.moveTo(6, ph);
    ctx.lineTo(w - 6, ph);
    ctx.stroke();
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
        live.push({ x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy });
      }
      if (rolling && (ball.x > w + 10 || ball.y > h + 10)) endRun();
    }
    if (grid !== "off") {
      drawGrid(ctx, w, h, t);
      return;
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
    u5Text(ctx, "처음 가던 길", w / 2 + 40, my - 13, { color: U5.dim, px: 12 });
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
    // 선풍기(뒤와 앞은 길과 일직선, 옆은 길 위에서 길을 향해)
    const fp = fanAt(fan, w, h);
    if (fp) drawFan(ctx, fp.x, fp.y, fp.dir, t, rolling);
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
    const bx = rolling || live.length ? ball.x : X_START;
    const by = rolling || live.length ? ball.y : my;
    drawBall(ctx, bx, by, 11);
    // 굴러가는 동안 공에 두 화살표: 바람이 미는 힘(파랑)과 운동 방향(초록, 길이는 빠르기에 비례)
    if (rolling) {
      ballArrows(ctx, fan, bx, by, ball.vx, ball.vy, FPX, (VPX * Math.hypot(ball.vx, ball.vy)) / V0);
      // 범례(무대 왼쪽 아래)
      u5Arrow(ctx, 14, h - 30, 18, 0, { color: U5.push, width: 3.5, halo: false });
      u5Text(ctx, "바람이 미는 힘", 38, h - 30, { color: "#B5D4FF", px: 12, align: "left" });
      u5Arrow(ctx, 14, h - 13, 18, 0, { color: U5.up, width: 3.5, halo: false });
      u5Text(ctx, "운동 방향", 38, h - 13, { color: "#9BE8C4", px: 12, align: "left" });
    }
    const sp = rolling ? Math.hypot(ball.vx, ball.vy) : live.length ? Math.hypot(ball.vx, ball.vy) : 0;
    u5Read(ctx, w, (sp / V0).toFixed(1), "배", "처음 속력의 몇 배");
    u5Pill(ctx, rolling ? (fan === "none" ? "바람 없이 굴러가요" : "바람을 받으며 굴러가요") : live.length ? RESULT[fan] : fan === "none" ? "선풍기 없음" : fan === "back" ? "선풍기: 공의 뒤" : fan === "front" ? "선풍기: 공의 앞" : "선풍기: 공의 옆", fan === "none" ? U5.gold : U5.push);
  });

  paint();
  f.say("마찰이 거의 없는 매끈한 바닥을 위에서 본 모습이에요. 먼저 <b>선풍기 없이</b> 굴려 보고, 자리를 바꿔 가며 비교해 보세요.");
  api.setCTA("네 가지로 공을 굴려 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
