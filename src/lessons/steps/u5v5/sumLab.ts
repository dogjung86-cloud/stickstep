// [중1 Ⅴ v5] u5l2 sumLab: 「두 힘을 합치면 얼마일까요?」
// 다루는 것: 나란한 방향으로 작용하는 두 힘의 합력, 알짜힘, 힘의 평형.
// 한 통찰: 같은 방향의 두 힘은 더하고 반대 방향의 두 힘은 뺀다. 크기가 같고 방향이 반대면 합친 힘이 0이라 물체가 움직이지 않는다.
// 학생이 정하는 것: 수레를 미는 두 사람 각각의 방향(왼쪽으로, 오른쪽으로)과 세기(100 N씩). 주문한 합친 힘을 만든다.
// 실패하는 길: 주문과 다르면 수레가 딴 쪽으로 가거나 느리게 간다. 무대의 초록 화살표(합친 힘)와 아래 셈이 그 자리에서 보여 준다.
// 흐름: 오른쪽 500 N(같은 방향) → 반대로 밀어 왼쪽 100 N → 둘 다 미는데 0 N(평형) → 판정 → 결론.
// 옛 랩(tugOfWar)은 반대 방향 줄다리기의 사람 수만 바꿨다. 여기서는 두 힘의 방향까지 정해 더하기와 빼기를 모두 만든다.
// 움직임(2026-11-15 그래픽 손질): 마찰이 없는 바닥이라 수레는 합친 힘이 있으면 '점점 빨라지고', 합친 힘이 0이면 멈춰 있던 그대로다.
//   힘을 바꿀 때마다 수레는 처음 자리에서 멈춘 채 다시 출발한다(잠깐 사라졌다 나타나는 되감기). 그래서 "힘이 0이면 선다"로 읽히지 않는다(u5l7 개념과 같은 약속).
// 화살표는 수레 몸에서 시작한다(세 줄: 가, 합친 힘, 나). 판정 동안에는 질문의 장면(가 오른쪽 200 N, 나는 ?)을, 답한 뒤와 결론에는 답의 장면을 그린다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawStickman, posePush, poseStand } from "../../../ui/stick";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Arrow, u5Canvas, u5Frame, u5Pill, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
interface Force {
  dir: 1 | -1;
  n: number; // 0~3 (100 N씩)
}
const COL = ["#8FC0FF", "#FFC978"]; // 가, 나
const NAMES = ["가", "나"];
const side = (d: number): string => (d > 0 ? "오른쪽" : "왼쪽");

const ORDERS = [
  { text: "두 힘을 합쳐 <b>오른쪽으로 500 N</b> 만들기", ok: (a: Force, b: Force) => a.dir === 1 && b.dir === 1 && a.n + b.n === 5 },
  { text: "서로 <b>반대로</b> 밀어 <b>왼쪽으로 100 N</b> 만들기", ok: (a: Force, b: Force) => a.n > 0 && b.n > 0 && a.dir !== b.dir && a.dir * a.n + b.dir * b.n === -1 },
  { text: "둘 다 힘을 주는데도 수레가 <b>정지(합친 힘 0 N)</b>하게 만들기", ok: (a: Force, b: Force) => a.n > 0 && b.n > 0 && a.dir * a.n + b.dir * b.n === 0 },
];

export const sumLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 3, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  const F: Force[] = [{ dir: 1, n: 1 }, { dir: 1, n: 0 }];
  let order = 0;
  let hold = 0; // 주문을 채운 채 버틴 시간(ms)
  let lock = false;
  // 수레의 움직임: 처음 자리에서 멈춘 채 출발해 합친 힘에 비례한 가속도로 점점 빨라진다. 한 번 출발한 뒤 RUN_MS가 지나거나 LIM만큼 가면 되감아 다시 출발한다.
  const ACC = 0.005; // 100 N마다 가속도(px/프레임²)
  const RUN_MS = 1700;
  const LIM = 30;
  let pos = 0; // 처음 자리에서 간 거리(px)
  let vel = 0;
  let runT = 0;
  let rew = 0; // 되감기 남은 시간(ms, 0이면 아님): 사라졌다가 처음 자리에서 다시 나타난다
  let rewound = false;
  const REW = 380;
  const rewind = (): void => {
    runT = 0;
    if (Math.abs(pos) < 0.5 && Math.abs(vel) < 0.01) {
      pos = 0;
      vel = 0;
      return;
    }
    rew = REW;
    rewound = false;
  };
  // 판정과 결론의 장면: 판정 동안은 질문(가 오른쪽 200 N, 나는 ?), 답한 뒤에는 답(나 왼쪽 200 N)
  let scene: "play" | "ask" | "reveal" = "play";
  const ASK_F: Force[] = [{ dir: 1, n: 2 }, { dir: -1, n: 2 }];

  const rows = F.map((_, i) => {
    const l = el("button", { class: "u5x-seg u5x-dir", text: "← 왼쪽", attrs: { type: "button" } }) as HTMLButtonElement;
    const r = el("button", { class: "u5x-seg u5x-dir", text: "오른쪽 →", attrs: { type: "button" } }) as HTMLButtonElement;
    const minus = el("button", { class: "u5x-tug-b sm", text: "−", attrs: { type: "button", "aria-label": `${NAMES[i]}의 힘 줄이기` } }) as HTMLButtonElement;
    const plus = el("button", { class: "u5x-tug-b sm", text: "+", attrs: { type: "button", "aria-label": `${NAMES[i]}의 힘 늘리기` } }) as HTMLButtonElement;
    const out = el("b", { class: "u5x-sum-n" });
    l.dataset.k = `${i}L`;
    r.dataset.k = `${i}R`;
    minus.dataset.k = `${i}-`;
    plus.dataset.k = `${i}+`;
    const chip = el("span", { class: "u5x-who", text: NAMES[i] });
    chip.style.background = COL[i];
    const row = el("div", { class: "u5x-frow" }, chip, el("div", { class: "u5x-dirs" }, l, r), minus, out, plus);
    l.addEventListener("click", () => set(i, { dir: -1 }));
    r.addEventListener("click", () => set(i, { dir: 1 }));
    minus.addEventListener("click", () => set(i, { n: F[i].n - 1 }));
    plus.addEventListener("click", () => set(i, { n: F[i].n + 1 }));
    return { row, l, r, minus, plus, out };
  });
  const sum = el("div", { class: "u5x-sum tall" });
  f.slot.setControls(rows[0].row, rows[1].row, sum);

  const net = (): number => F[0].dir * F[0].n + F[1].dir * F[1].n;
  const paint = (): void => {
    rows.forEach((r, i) => {
      r.l.classList.toggle("on", F[i].dir === -1);
      r.r.classList.toggle("on", F[i].dir === 1);
      r.out.textContent = `${F[i].n * 100} N`;
      r.minus.disabled = lock || F[i].n <= 0;
      r.plus.disabled = lock || F[i].n >= 3;
      r.l.disabled = lock;
      r.r.disabled = lock;
    });
    const n = net();
    const parts = F.map((x) => (x.n ? `${side(x.dir)} ${x.n * 100} N` : "0 N"));
    sum.innerHTML = `${order < 3 ? `목표: ${ORDERS[order].text}` : "세 가지 목표를 모두 성공했어요!"}<br>지금: ${parts[0]}, ${parts[1]} → 합친 힘 <b>${n === 0 ? "0 N" : `${side(n)} ${Math.abs(n) * 100} N`}</b>`;
    // 글 맞춤: 셋째 목표는 한 줄이 길어 두 힘이 클 때 세 줄 상자를 넘친다. 넘칠 때만 글씨를 조금 줄인다(u5v5.css .u5x-sum.tall.dense)
    sum.classList.remove("dense");
    if (sum.isConnected && sum.scrollHeight > sum.clientHeight + 1) sum.classList.add("dense");
  };
  function set(i: number, patch: Partial<Force>): void {
    if (lock) return;
    haptic(HAPTIC.tap);
    F[i] = { ...F[i], ...patch, n: clamp(patch.n ?? F[i].n, 0, 3) } as Force;
    hold = 0;
    rewind(); // 힘을 바꾸면 처음 자리에서 멈춘 채 다시 출발한다
    paint();
  }

  const says = [
    "<b>가</b>와 <b>나</b>의 방향·세기를 조절해 아래 <b>목표</b>대로 합친 힘을 만들어 보세요.",
    "같은 방향이면 두 힘이 <b>더해져요</b>! 이번엔 서로 <b>반대 방향</b>으로 밀어 목표를 맞춰 보세요.",
    "반대 방향이면 큰 힘에서 작은 힘을 <b>빼요</b>! 이제 둘 다 미는데도 합친 힘이 <b>0 N</b>이 되게 해 보세요.",
  ];
  const setOrder = (n: number): void => {
    order = n;
    f.pips(n);
    hold = 0;
    if (n > 0) rewind();
    if (n < 3) f.say(says[n]);
    paint();
    if (n === 3) {
      lock = true;
      paint();
      f.say("크기가 같고 방향이 반대인 두 힘은 서로 상쇄돼 합친 힘이 <b>0 N</b>이 돼요!");
      tm.later(askFinal, 1800);
    }
  };

  function askFinal(): void {
    scene = "ask";
    rewind();
    f.slot.ask(
      // 수정안은 '마찰이 없는 바닥'을 뺐으나, 마찰이 있으면 '아무 힘도 주지 않아요'도 답이 될 수 있어 조건을 남긴다(13.5px 두 줄에 들게 뒤의 '수레가'만 뺐다)
      "마찰이 없는 바닥에서 한 사람이 수레를 오른쪽으로 <b>200 N</b>으로 미는데도 멈춰 있어요. 다른 사람은 어떻게 밀고 있을까요?",
      [{ t: "왼쪽으로 200 N의 힘으로 밀어요", ok: true }, { t: "오른쪽으로 200 N의 힘으로 밀어요" }, { t: "아무 힘도 주지 않아요" }],
      (ok) => {
        scene = "reveal";
        api.recordQuiz(ok);
      },
      { why: "멈춰 있으려면 합친 힘이 0이어야 해요. <b>같은 크기, 반대 방향</b>이에요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("두 힘의 방향에 따라 힘을 더하거나 빼서 합친 힘을 구해 보았어요!");
    f.slot.conclude("같은 방향의 두 힘은 <b>더하고</b>, 반대 방향의 두 힘은 큰 힘에서 작은 힘을 <b>빼요</b>. 크기가 같고 방향이 반대면 합친 힘이 0이라 멈춰 있던 물체는 그대로 멈춰 있어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    const gy = h - 30;
    const ms = dt * 16.7;
    const FF = scene === "play" ? F : ASK_F; // 판정과 결론에서는 질문과 답의 장면
    const n = FF[0].dir * FF[0].n + FF[1].dir * FF[1].n;
    // 움직임: 되감는 동안은 멈추고, 그 밖에는 합친 힘에 비례한 가속도로 점점 빨라진다(마찰이 없는 바닥)
    if (rew > 0) {
      rew = Math.max(0, rew - ms);
      if (!rewound && rew <= REW / 2) {
        rewound = true;
        pos = 0;
        vel = 0;
      }
    } else if (scene === "play") {
      vel += n * ACC * dt;
      pos += vel * dt;
      runT += ms;
      if (n !== 0 && (runT > RUN_MS || Math.abs(pos) > LIM)) rewind(); // 한 번 출발을 보인 뒤 처음 자리에서 다시
    }
    const fade = rew > 0 ? Math.min(1, Math.abs(rew - REW / 2) / (REW / 2)) : 1;
    if (order < 3 && ORDERS[order].ok(F[0], F[1])) {
      hold += ms;
      if (hold > 1300) {
        haptic(HAPTIC.correct);
        setOrder(order + 1);
      }
    } else hold = 0;
    // 바닥과 고정된 눈금(수레가 눈금 위를 지나간다)
    ctx.strokeStyle = "rgba(178,204,238,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(178,204,238,.35)";
    for (let x = 4; x < w + 10; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, gy + 5);
      ctx.lineTo(x - 8, gy + 14);
      ctx.stroke();
    }
    const cx = w / 2;
    const CW = 100; // 수레 몸 폭
    const CH = 64; // 수레 몸 높이(화살표 세 줄이 들어간다)
    const WR = 11; // 바퀴 반지름
    const AP = 24; // 화살표: 100 N에 24px
    const by = gy - WR - 4; // 수레 몸 바닥
    const cy = by - CH / 2; // 수레 몸의 가운데 높이(세 화살표의 가운데 줄)
    // 처음 자리(멈춰 있던 자리): 수레가 떠나 있으면 옅은 점선 윤곽으로 남긴다
    if (Math.abs(pos) > 3) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(201,219,245,.32)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - CW / 2, by - CH, CW, CH, 7);
      ctx.stroke();
      ctx.restore();
      u5Text(ctx, "처음 자리", cx, gy + 14, { color: U5.dim, px: 12 });
    }
    const X = cx + pos; // 수레의 지금 가운데
    ctx.save();
    ctx.globalAlpha = fade;
    // 수레: 화살표가 잘 보이게 차분한 남회색 몸(근-동조 그라데이션, 왼쪽 위 빛, 최암색 윤곽)
    const cg = ctx.createLinearGradient(0, by - CH, 0, by);
    cg.addColorStop(0, "#6B7EA2");
    cg.addColorStop(0.55, "#4E6085");
    cg.addColorStop(1, "#3A4968");
    ctx.fillStyle = cg;
    ctx.strokeStyle = "#26324B";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(X - CW / 2, by - CH, CW, CH, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X - CW / 2 + 6, by - CH + 2.5);
    ctx.lineTo(X + CW / 2 - 6, by - CH + 2.5);
    ctx.stroke();
    [-30, 30].forEach((dx) => {
      const wg = ctx.createRadialGradient(X + dx - 3, gy - WR - 3, 1, X + dx, gy - WR, WR);
      wg.addColorStop(0, "#C4D0E4");
      wg.addColorStop(1, "#7F8FAD");
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(X + dx, gy - WR, WR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2E3B55";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X + dx, gy - WR);
      ctx.lineTo(X + dx + (WR - 2) * Math.cos(pos / WR), gy - WR + (WR - 2) * Math.sin(pos / WR));
      ctx.stroke();
    });
    // 사람: 오른쪽으로 미는 사람은 수레 왼쪽에, 왼쪽으로 미는 사람은 수레 오른쪽에 선다. 판정 동안 '나'는 그리지 않는다(물음표)
    const used = { L: 0, R: 0 };
    FF.forEach((x, i) => {
      if (scene === "ask" && i === 1) return;
      const k = x.dir > 0 ? "L" : "R";
      const slot = used[k]++;
      const px = X - x.dir * (CW / 2 + 37 + slot * 30); // 같은 쪽에 둘이 서면 나란히 붙어 함께 민다
      drawStickman(ctx, px, gy, 76, x.n ? posePush(x.n / 3, t, i) : poseStand(t, i), { flip: x.dir < 0, color: COL[i], alpha: x.n ? 1 : 0.45 });
      // 같은 쪽에 둘이 서면 뒷사람의 이름표를 한 줄 위로(겹치지 않게)
      u5Text(ctx, x.n ? `${NAMES[i]} ${x.n * 100} N` : NAMES[i], px - x.dir * 4, gy - 98 - slot * 17, { color: COL[i], px: 13 });
    });
    // 힘 화살표 세 줄은 수레 몸의 가운데에서 시작한다(100 N에 AP px): 위 줄 가, 가운데 줄 합친 힘, 아래 줄 나
    const rowY = [cy - 19, cy + 19];
    FF.forEach((x, i) => {
      if (scene === "ask" && i === 1) {
        u5Text(ctx, "?", X + 9, rowY[1], { color: COL[1], px: 16, w: 800 });
        return;
      }
      if (x.n) u5Arrow(ctx, X, rowY[i], x.dir * x.n * AP, 0, { color: COL[i], width: 5 });
    });
    if (n !== 0) u5Arrow(ctx, X, cy, n * AP, 0, { color: U5.up, width: 7 });
    else if (FF[0].n + FF[1].n > 0) {
      ctx.fillStyle = "#0B1524";
      ctx.beginPath();
      ctx.arc(X, cy, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = U5.up;
      ctx.beginPath();
      ctx.arc(X, cy, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
    u5Text(ctx, `합친 힘 ${Math.abs(n) * 100} N`, X, by - CH - 44, { color: "#9BE8C4", px: 14 });
    ctx.restore();
    const pill =
      scene === "ask"
        ? "수레가 멈춰 있어요"
        : n === 0
          ? FF[0].n + FF[1].n
            ? "두 힘이 비겨 멈춰 있어요 (합친 힘 0 N)"
            : "아무도 밀지 않아요"
          : `수레가 ${side(n)}으로 점점 빨라져요`;
    u5Pill(ctx, pill, n === 0 ? U5.up : U5.gold);
  });

  setOrder(0);
  api.setCTA("목표대로 두 힘을 조절해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
