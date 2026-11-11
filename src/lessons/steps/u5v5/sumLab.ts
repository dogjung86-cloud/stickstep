// [중1 Ⅴ v5] u5l2 sumLab: 「두 힘을 합치면 얼마일까요?」
// 책의 어디에서: 나란한 방향으로 작용하는 두 힘의 합력, 알짜힘, 힘의 평형(디지털 해 보기 '나란하게 작용하는 힘의 합력 구하기').
// 한 통찰: 같은 방향의 두 힘은 더하고 반대 방향의 두 힘은 뺀다. 크기가 같고 방향이 반대면 합친 힘이 0이라 물체가 움직이지 않는다.
// 학생이 정하는 것: 수레를 미는 두 사람 각각의 방향(왼쪽으로, 오른쪽으로)과 세기(100 N씩). 주문한 합친 힘을 만든다.
// 실패하는 길: 주문과 다르면 수레가 딴 쪽으로 가거나 느리게 간다. 무대의 초록 화살표(합친 힘)와 아래 셈이 그 자리에서 보여 준다.
// 흐름: 오른쪽 500 N(같은 방향) → 반대로 밀어 왼쪽 100 N → 둘 다 미는데 0 N(평형) → 판정 → 결론.
// 옛 랩(tugOfWar)은 반대 방향 줄다리기의 사람 수만 바꿨다. 여기서는 두 힘의 방향까지 정해 더하기와 빼기를 모두 만든다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawCrate, drawForceArrow } from "../../../ui/forceProps";
import { drawStickman, posePush, poseStand } from "../../../ui/stick";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Pill, u5Text } from "./u5Kit";

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
  { text: "두 힘을 합쳐 <b>오른쪽으로 500 N</b>을 만들어요", ok: (a: Force, b: Force) => a.dir === 1 && b.dir === 1 && a.n + b.n === 5 },
  { text: "서로 <b>반대로</b> 밀어서 <b>왼쪽으로 100 N</b>을 만들어요", ok: (a: Force, b: Force) => a.n > 0 && b.n > 0 && a.dir !== b.dir && a.dir * a.n + b.dir * b.n === -1 },
  { text: "둘 다 미는데 수레가 <b>꼼짝 않게</b> 만들어요", ok: (a: Force, b: Force) => a.n > 0 && b.n > 0 && a.dir * a.n + b.dir * b.n === 0 },
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
  let scroll = 0; // 바닥이 흘러간 거리(수레는 가운데에 그대로 둔다)
  let vel = 0;

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
    sum.innerHTML = `${order < 3 ? `주문: ${ORDERS[order].text}` : "세 주문을 모두 채웠어요."}<br>지금: ${parts[0]}, ${parts[1]} → 합친 힘 <b>${n === 0 ? "0 N" : `${side(n)} ${Math.abs(n) * 100} N`}</b>`;
  };
  function set(i: number, patch: Partial<Force>): void {
    if (lock) return;
    haptic(HAPTIC.tap);
    F[i] = { ...F[i], ...patch, n: clamp(patch.n ?? F[i].n, 0, 3) } as Force;
    hold = 0;
    paint();
  }

  const says = [
    "두 사람 <b>가</b>, <b>나</b>가 수레를 밀어요. 방향과 세기를 정해 아래 <b>주문</b>대로 합친 힘을 만들어 보세요.",
    "같은 방향이면 두 힘이 <b>더해졌어요</b>. 이번에는 한 사람을 반대쪽으로 돌려 주문을 채워 보세요.",
    "반대 방향이면 큰 힘에서 작은 힘을 <b>뺐어요</b>. 마지막 주문이에요. 둘 다 힘을 주는데 수레가 멈추게 해 보세요.",
  ];
  const setOrder = (n: number): void => {
    order = n;
    f.pips(n);
    hold = 0;
    if (n < 3) f.say(says[n]);
    paint();
    if (n === 3) {
      lock = true;
      paint();
      f.say("크기가 같고 방향이 반대인 두 힘은 서로 지워져요. 힘이 <b>없는 것이 아니에요</b>.");
      tm.later(askFinal, 1800);
    }
  };

  function askFinal(): void {
    f.slot.ask(
      "마찰이 없는 바닥에 수레가 멈춰 있어요. 한 사람이 오른쪽으로 200 N으로 밀면 다른 사람은?",
      [{ t: "왼쪽으로 200 N으로 밀어요", ok: true }, { t: "오른쪽으로 200 N으로 밀어요" }, { t: "밀지 않고 있어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "멈춰 있으려면 합친 힘이 0이어야 해요. <b>같은 크기, 반대 방향</b>이에요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("같은 방향의 두 힘은 <b>더하고</b>, 반대 방향의 두 힘은 큰 힘에서 작은 힘을 <b>빼요</b>. 크기가 같고 방향이 반대면 합친 힘이 0이라 멈춰 있던 물체는 그대로 멈춰 있어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    const gy = h - 30;
    const n = net();
    // 합친 힘만큼 수레가 빨라진다(바닥의 눈금이 반대로 흐른다)
    vel += (n * 0.9 - vel) * Math.min(1, 0.05 * dt);
    scroll -= vel * dt;
    if (order < 3 && ORDERS[order].ok(F[0], F[1])) {
      hold += dt * 16.7;
      if (hold > 1300) {
        haptic(HAPTIC.correct);
        setOrder(order + 1);
      }
    } else hold = 0;
    // 바닥과 흐르는 눈금
    ctx.strokeStyle = "rgba(178,204,238,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(178,204,238,.35)";
    for (let i = -1; i < 12; i++) {
      const x = ((i * 36 + scroll) % (w + 36) + (w + 36)) % (w + 36) - 18;
      ctx.beginPath();
      ctx.moveTo(x, gy + 5);
      ctx.lineTo(x - 8, gy + 14);
      ctx.stroke();
    }
    const cx = w / 2;
    // 수레
    drawCrate(ctx, cx, gy - 9, 56, 40, t, 0);
    ctx.fillStyle = "#93A3C0";
    [-18, 18].forEach((dx) => {
      ctx.beginPath();
      ctx.arc(cx + dx, gy - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3B4A68";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + dx, gy - 8);
      ctx.lineTo(cx + dx + 7 * Math.cos(-scroll / 8), gy - 8 + 7 * Math.sin(-scroll / 8));
      ctx.stroke();
    });
    // 사람: 오른쪽으로 미는 사람은 수레 왼쪽에, 왼쪽으로 미는 사람은 수레 오른쪽에 선다
    const used = { L: 0, R: 0 };
    F.forEach((x, i) => {
      const k = x.dir > 0 ? "L" : "R";
      const slot = used[k]++;
      const px = cx - x.dir * (28 + 30 + slot * 24); // 같은 쪽에 둘이 서면 나란히 붙어 함께 민다
      drawStickman(ctx, px, gy, 56, x.n ? posePush(x.n / 3, t, i) : poseStand(t, i), { flip: x.dir < 0, color: COL[i], alpha: x.n ? 1 : 0.45 });
      u5Text(ctx, NAMES[i], px - x.dir * 4, gy - 68, { color: COL[i], px: 13 });
    });
    // 힘 화살표 세 줄: 가, 나, 합친 힘(100 N에 22px)
    const ax = cx;
    F.forEach((x, i) => {
      const y = 64 + i * 21;
      if (x.n) {
        drawForceArrow(ctx, ax, y, x.dir * x.n * 22, 0, { color: COL[i], width: 4 });
        u5Text(ctx, `${NAMES[i]} ${x.n * 100} N`, ax - x.dir * 34, y, { color: COL[i], px: 12 });
      }
    });
    const y3 = 108;
    if (n !== 0) drawForceArrow(ctx, ax, y3, n * 22, 0, { color: U5.up, width: 6 });
    else {
      ctx.fillStyle = U5.up;
      ctx.beginPath();
      ctx.arc(ax, y3, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    u5Text(ctx, `합친 힘 ${Math.abs(n) * 100} N`, ax - (n >= 0 ? 1 : -1) * 52, y3, { color: "#9BE8C4", px: 12.5 });
    u5Pill(ctx, n === 0 ? (F[0].n + F[1].n ? "힘이 서로 지워져 멈춰 있어요" : "아무도 밀지 않아요") : `수레가 ${side(n)}으로 가요`, n === 0 ? U5.up : U5.gold);
  });

  setOrder(0);
  api.setCTA("주문대로 두 힘을 정해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
