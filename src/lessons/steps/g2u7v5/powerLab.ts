// [중2 Ⅶ v5] g2u7l6 powerLab: 「같은 시간에 전기 에너지를 가장 많이 쓰는 것은?」
// 책의 어디에서: 탐구 '전기 기구에서 에너지가 전환될 때의 소비 전력 조사하기'(전기 기구마다 전기 에너지가 주로 어떤 에너지로 바뀌는지와 소비 전력을 조사하고,
//   소비 전력이 큰 기구의 특징을 정리한다).
// 한 통찰: 전기 기구가 1초 동안 쓰는 전기 에너지가 소비 전력(W)이다. 열을 내는 기구의 소비 전력이 크다.
// 학생이 정하는 것: 어느 전기 기구를 켤지, 얼마 동안 켤지(1초, 10초).
// 실패하는 길: 한두 개만 켜 봐서는 어떤 기구가 많이 쓰는지 견줄 수 없다(여섯 개를 모두 켜야 표가 찬다).
// 옛 판에는 랩이 없었다(개념 글과 분류 문제뿐). 조사 활동을 '켜서 재 보는' 실험으로 새로 만들었다.
// 값(자체 설정, 흔한 제품의 값): 휴대 전화 충전 5 W, LED 전등 10 W, 선풍기 40 W, 텔레비전 150 W, 세탁기 500 W, 전기다리미 1200 W.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers, bvTween } from "../bio6/b6Lab";
import { X, xBox, xCanvas, xFrame, xJosa, xSegs, xText, type LabStep } from "./kit";

// 그림(2026-11-15 그래픽 감사 C098): 켠 기구를 코드 그림으로 그리고, 바뀐 에너지를 장면 속 표시로 보인다(전등과 화면의 빛, 선풍기와 세탁기의 도는 것,
//   다리미의 열기, 충전 막대, 소리 물결). 켜 둔 동안 움직이고, 다 재면 멈춘 채 옅게 남는다. 기록 표는 W 막대로 바꿔 다리미 막대가 압도적으로 긴 것이 보인다
//   (같은 눈금, 1200 W가 가장 긴 막대. 작은 값은 막대가 짧아도 줄 오른쪽 숫자로 읽는다).
const APPS = [
  { k: "phone", name: "휴대 전화 충전", short: "충전기", w: 5, to: ["화학 에너지"] },
  { k: "led", name: "LED 전등", short: "LED 전등", w: 10, to: ["빛에너지"] },
  { k: "fan", name: "선풍기", short: "선풍기", w: 40, to: ["운동 에너지"] },
  { k: "tv", name: "텔레비전", short: "텔레비전", w: 150, to: ["빛에너지", "소리 에너지"] },
  { k: "wash", name: "세탁기", short: "세탁기", w: 500, to: ["운동 에너지"] },
  { k: "iron", name: "전기다리미", short: "전기다리미", w: 1200, to: ["열에너지"] },
];
const TO_COLOR: Record<string, string> = { 빛에너지: "#FFD86B", "소리 에너지": "#9BE8C4", "운동 에너지": "#8FC0FF", 열에너지: "#FF9D8A", "화학 에너지": "#C9A7FF" };
const BODY = "#C9D3E2";
const EDGE = "#56657E";

/** 빛줄기(짧은 선 여럿) */
function rays(ctx: CanvasRenderingContext2D, x: number, y: number, r0: number, r1: number, a0: number, a1: number, n: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / (n - 1);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}
/** 위로 오르는 물결(열기) */
function heatWaves(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, gap: number, ph: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const x0 = x + (i - (n - 1) / 2) * gap;
    ctx.beginPath();
    for (let s = 0; s <= 1.0001; s += 0.1) {
      const px = x0 + Math.sin(s * 8 + ph + i) * 3;
      const py = y - s * 24;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
/** 소리 물결(호 셋) */
function soundArcs(ctx: CanvasRenderingContext2D, x: number, y: number, ph: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const r = 6 + i * 6 + ((ph * 4) % 6);
    ctx.globalAlpha = Math.max(0, 1 - (r - 6) / 20);
    ctx.beginPath();
    ctx.arc(x, y, r, -0.7, 0.7);
    ctx.stroke();
  }
  ctx.restore();
}
/** 도는 것을 보이는 둥근 화살(운동) */
function spinArc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ph: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (const s of [0, Math.PI]) {
    const a0 = ph + s;
    const a1 = a0 + 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r, a0, a1);
    ctx.stroke();
    const hx = x + Math.cos(a1) * r;
    const hy = y + Math.sin(a1) * r;
    const t = a1 + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(t) * 6, hy + Math.sin(t) * 6);
    ctx.lineTo(hx + Math.cos(t + 2.4) * 5, hy + Math.sin(t + 2.4) * 5);
    ctx.lineTo(hx + Math.cos(t - 2.4) * 5, hy + Math.sin(t - 2.4) * 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** 켠 기구 그림. a = 효과의 진하기(0~1), ph = 움직임의 위상, fill = 충전 정도(0~1). 가운데 (x, y), 너비 120 · 높이 84 안쪽. */
function drawApp(ctx: CanvasRenderingContext2D, k: string, x: number, y: number, a: number, ph: number, fill: number): void {
  ctx.save();
  ctx.lineJoin = "round";
  if (k === "phone") {
    // 휴대 전화와 충전기: 화면 속 배터리가 차오른다(화학 에너지로 저장)
    xBox(ctx, x + 22, y + 22, 26, 18, 4, BODY, EDGE);
    ctx.strokeStyle = "#8FA4C2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 36);
    ctx.quadraticCurveTo(x + 6, y + 44, x + 22, y + 32);
    ctx.stroke();
    xBox(ctx, x - 30, y - 38, 44, 76, 9, "#2E3A4E", "#8FA4C2", 1.6);
    xBox(ctx, x - 25, y - 31, 34, 60, 4, "#16233A");
    const bx = x - 17;
    const by = y - 10;
    xBox(ctx, bx, by, 18, 26, 3, "rgba(255,255,255,.06)", "#C9D3E2", 1.4);
    xBox(ctx, bx + 5.5, by - 4, 7, 4, 1.5, "#C9D3E2");
    const f = Math.max(0.12, fill);
    ctx.globalAlpha = 0.35 + a * 0.65;
    xBox(ctx, bx + 2.5, by + 2.5 + 21 * (1 - f), 13, 21 * f, 2, TO_COLOR["화학 에너지"]);
    ctx.globalAlpha = 1;
  } else if (k === "led") {
    // LED 전등: 젖빛 덮개와 방열 몸통, 둘레의 빛
    if (a > 0) {
      const g = ctx.createRadialGradient(x, y - 10, 4, x, y - 10, 44);
      g.addColorStop(0, `rgba(255,232,150,${0.55 * a})`);
      g.addColorStop(1, "rgba(255,232,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y - 10, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = a;
      rays(ctx, x, y - 10, 28, 38 + Math.sin(ph * 3) * 2, Math.PI * 0.95, Math.PI * 2.05, 7, TO_COLOR["빛에너지"]);
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(x, y - 10, 20, Math.PI, 0);
    ctx.lineTo(x + 20, y - 4);
    ctx.lineTo(x - 20, y - 4);
    ctx.closePath();
    ctx.fillStyle = a > 0 ? `rgba(255,246,214,${0.6 + 0.4 * a})` : "rgba(225,232,242,.5)";
    ctx.fill();
    ctx.strokeStyle = "#C9D1DE";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 4);
    ctx.lineTo(x + 20, y - 4);
    ctx.lineTo(x + 11, y + 16);
    ctx.lineTo(x - 11, y + 16);
    ctx.closePath();
    ctx.fillStyle = "#DDE4EE";
    ctx.fill();
    ctx.strokeStyle = "#8FA4C2";
    ctx.stroke();
    xBox(ctx, x - 8, y + 16, 16, 12, 2.5, "#8FA4C2", "#4E5E78", 1.2);
  } else if (k === "fan") {
    // 선풍기: 받침, 기둥, 둥근 망 속에서 도는 날개
    xBox(ctx, x - 26, y + 34, 52, 8, 4, BODY, EDGE);
    xBox(ctx, x - 3, y + 8, 6, 28, 2, BODY, EDGE);
    ctx.save();
    ctx.translate(x, y - 12);
    ctx.rotate(ph * 6);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, -13, 7, 13, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#E3E9F2";
      ctx.fill();
      ctx.strokeStyle = EDGE;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y - 12, 28, 0, Math.PI * 2);
    ctx.strokeStyle = "#C9D3E2";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 12, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#56657E";
    ctx.fill();
    if (a > 0) {
      ctx.globalAlpha = a;
      spinArc(ctx, x, y - 12, 36, ph * 2, TO_COLOR["운동 에너지"]);
      ctx.globalAlpha = 1;
    }
  } else if (k === "tv") {
    // 텔레비전: 밝아지는 화면(빛)과 옆의 소리 물결(소리)
    xBox(ctx, x - 12, y + 26, 24, 4, 2, BODY, EDGE);
    xBox(ctx, x - 4, y + 18, 8, 10, 1, BODY, EDGE);
    xBox(ctx, x - 44, y - 36, 82, 56, 6, "#2E3A4E", "#8FA4C2", 1.6);
    const g = ctx.createLinearGradient(x - 40, y - 32, x + 34, y + 16);
    g.addColorStop(0, a > 0 ? `rgba(255,236,160,${0.35 + 0.6 * a})` : "#16233A");
    g.addColorStop(1, a > 0 ? `rgba(143,200,255,${0.35 + 0.5 * a})` : "#16233A");
    ctx.beginPath();
    ctx.roundRect(x - 40, y - 32, 74, 48, 3);
    ctx.fillStyle = g;
    ctx.fill();
    if (a > 0) {
      ctx.globalAlpha = a;
      rays(ctx, x - 3, y - 8, 40, 47, -Math.PI * 0.65, -Math.PI * 0.35, 3, TO_COLOR["빛에너지"]);
      soundArcs(ctx, x + 44, y - 8, ph, TO_COLOR["소리 에너지"]);
      ctx.globalAlpha = 1;
    }
  } else if (k === "wash") {
    // 세탁기: 둥근 문 속에서 도는 빨래통(운동)
    xBox(ctx, x - 34, y - 38, 68, 78, 8, BODY, EDGE);
    xBox(ctx, x - 34, y - 38, 68, 14, 8, "#AFBBCD", EDGE);
    ctx.fillStyle = "#56657E";
    ctx.beginPath();
    ctx.arc(x + 22, y - 31, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + 6, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#24344E";
    ctx.fill();
    ctx.strokeStyle = "#8FA4C2";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    ctx.translate(x, y + 6);
    ctx.rotate(ph * 3);
    ctx.fillStyle = "#E3E9F2";
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(10, 0, 6, 3.5, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (a > 0) {
      ctx.globalAlpha = a;
      spinArc(ctx, x, y + 6, 29, ph * 3, "#3D7BD0");
      ctx.globalAlpha = 1;
    }
  } else {
    // 전기다리미: 달궈진 바닥과 위로 오르는 열기(열)
    if (a > 0) {
      ctx.globalAlpha = a;
      heatWaves(ctx, x - 2, y - 8, 4, 13, ph * 4, TO_COLOR["열에너지"]);
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.moveTo(x - 42, y + 26);
    ctx.lineTo(x + 30, y + 26);
    ctx.quadraticCurveTo(x + 46, y + 22, x + 48, y + 14);
    ctx.quadraticCurveTo(x + 20, y + 4, x - 36, y + 6);
    ctx.quadraticCurveTo(x - 44, y + 12, x - 42, y + 26);
    ctx.closePath();
    ctx.fillStyle = BODY;
    ctx.fill();
    ctx.strokeStyle = EDGE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 26, y + 6);
    ctx.quadraticCurveTo(x - 22, y - 16, x + 2, y - 16);
    ctx.lineTo(x + 14, y - 16);
    ctx.quadraticCurveTo(x + 22, y - 14, x + 20, y + 6);
    ctx.strokeStyle = "#8FA4C2";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();
    xBox(ctx, x - 44, y + 25, 94, 5, 2.5, a > 0 ? `rgba(255,${Math.round(170 - 60 * a)},${Math.round(130 - 70 * a)},1)` : "#8FA4C2", EDGE, 1);
    ctx.strokeStyle = "#8FA4C2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 40, y + 14);
    ctx.quadraticCurveTo(x - 56, y + 18, x - 60, y + 34);
    ctx.stroke();
  }
  ctx.restore();
}

export const powerLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let secs = 1;
  let cur = -1;
  let prog = 0; // 켜 둔 시간의 진행 0~1
  let busy = false;
  let finished = false;
  let ten = false;
  const tried = new Set<number>();

  const cards = APPS.map((a) => bvCard("col g2u7x-c", { name: a.short, sub: "눌러서 측정하기", key: a.k }));
  const time = xSegs(
    [
      { k: "1", t: "1초 동안 켜기" },
      { k: "10", t: "10초 동안 켜기" },
    ],
    "1",
    (k) => {
      secs = Number(k);
    },
  );
  f.slot.setControls(bvCards(3, ...cards), time.el);

  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      if (busy || finished) return;
      haptic(HAPTIC.tap);
      busy = true;
      cur = i;
      prog = 0;
      cards.forEach((x, j) => x.on(j === i));
      bvTween(tm, 1100, (t) => (prog = t), () => {
        busy = false;
        const a = APPS[i];
        tried.add(i);
        if (secs === 10) ten = true;
        c.done();
        c.sub(`${a.w} W`);
        haptic(HAPTIC.correct);
        f.pips((tried.size >= 3 ? 1 : 0) + (tried.size === APPS.length ? 1 : 0) + (ten ? 1 : 0));
        if (tried.size === APPS.length && ten) {
          finished = true;
          time.lock(true);
          f.say("여섯 기구와 사용 시간 조건을 모두 확인했어요! 막대그래프에서 각 기구의 <b>소비 전력(W)</b>을 비교해 보세요.");
          tm.later(ask1, 2800);
        } else if (tried.size === APPS.length) f.say("여섯 기구를 모두 켜 보았어요! 이번에는 <b>10초 동안 켜기</b>를 눌러 사용한 전기 에너지가 몇 배가 되는지 확인해 보세요.");
        else if (secs === 1) f.say(`${a.name}${xJosa(a.name, "은", "는")} 1초 동안 <b>${a.w} J</b>의 전기 에너지를 썼어요. 1초 동안 쓰는 전기 에너지가 소비 전력이므로 소비 전력은 <b>${a.w} W</b>예요.`);
        else f.say(`${a.name}${xJosa(a.name, "을", "를")} 10초 동안 켜자 1초일 때의 10배인 <b>${a.w * 10} J</b>의 전기 에너지를 썼어요.`);
      });
    }),
  );

  function ask1(): void {
    f.slot.ask(
      "1초 동안 40 J의 전기 에너지를 사용하는 선풍기의 소비 전력은 몇 W인가요?",
      [{ t: "40 W", ok: true }, { t: "4 W" }, { t: "400 W" }],
      (ok) => api.recordQuiz(ok),
      { why: "소비 전력(W)은 전기 기구가 <b>1초 동안</b> 사용하는 전기 에너지의 양(J)과 같으므로 40 W예요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "여섯 기구 중 소비 전력이 가장 큰 전기다리미(1200 W)는 전기 에너지를 주로 어떤 에너지로 전환하나요?",
      [{ t: "열에너지", ok: true }, { t: "빛에너지" }, { t: "소리 에너지" }],
      () => undefined,
      { why: "소비 전력이 1200 W로 가장 큰 <b>전기다리미</b>는 전기 에너지를 주로 <b>열에너지</b>로 바꾸는 전열기예요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("기구마다 1초 동안 쓰는 전기 에너지(소비 전력)가 다르며, 열을 내는 기구의 소비 전력이 특히 크다는 것을 확인했어요!");
    f.slot.conclude("전기 기구가 <b>1초 동안</b> 사용하는 전기 에너지의 양을 <b>소비 전력</b>이라고 하며, 단위는 <b>W(와트)</b>를 써요. 전기다리미처럼 열을 내는 기구는 소비 전력이 특히 커요.");
    api.enableCTA(s.cta ?? "다음");
  }

  let ph = 0; // 기구가 움직이는 위상(켜 둔 동안만 흐른다)
  st.run((ctx, w, _h, _t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    // ── 오른쪽: 소비 전력 막대(같은 눈금, 1200 W가 막대 길이 120) ──
    const tx0 = 192;
    xBox(ctx, tx0, 12, 142, 206, 14, "rgba(255,255,255,.06)", X.line);
    xText(ctx, "소비 전력", tx0 + 71, 27, { px: 12.5, color: X.dim });
    const bx = tx0 + 10;
    const bmax = 122;
    APPS.forEach((a, i) => {
      const y = 48 + i * 28;
      const has = tried.has(i);
      xText(ctx, a.short, bx, y, { px: 12.5, align: "left", color: has ? X.ink : X.dim, w: 700 });
      xText(ctx, has ? `${a.w} W` : "?", bx + bmax, y, { px: 13, align: "right", color: has ? X.cur : X.dim, w: 800 });
      xBox(ctx, bx, y + 8, bmax, 7, 3.5, "rgba(255,255,255,.06)");
      if (has) xBox(ctx, bx, y + 8, Math.max(2.5, (a.w / 1200) * bmax), 7, 3.5, X.cur);
    });
    // ── 왼쪽: 지금 켠 기구와 바뀐 에너지 ──
    const cx = 96;
    if (cur < 0) {
      xText(ctx, "전기 기구를", cx, 100, { px: 13.5, color: X.dim });
      xText(ctx, "눌러서 켜 보세요", cx, 122, { px: 13.5, color: X.dim });
    } else {
      const a = APPS[cur];
      const j = Math.round(a.w * secs * prog);
      if (busy) ph += dt / 60;
      xText(ctx, a.name, 14, 22, { px: 13.5, align: "left", w: 800 });
      xText(ctx, `${(secs * prog).toFixed(secs === 1 ? 1 : 0)}초`, 180, 22, { px: 12.5, align: "right", color: X.dim });
      drawApp(ctx, a.k, cx, 86, busy ? 1 : 0.55, ph, a.k === "phone" ? 0.25 + 0.55 * prog : 0);
      xText(ctx, `${j} J`, cx, 150, { px: 24, w: 800, color: X.cur });
      xText(ctx, "쓴 전기 에너지", cx, 171, { px: 12, color: X.dim });
      // 전기 에너지가 무엇으로 바뀌었나: "전기 에너지 → 열에너지"(두 가지면 "빛, 소리 에너지")
      const parts: [string, string][] = [["전기 에너지", X.cur], [" → ", X.dim]];
      if (a.to.length === 1) parts.push([a.to[0], TO_COLOR[a.to[0]]]);
      else parts.push(["빛, ", TO_COLOR["빛에너지"]], ["소리 에너지", TO_COLOR["소리 에너지"]]);
      ctx.save();
      ctx.font = "800 12.5px Pretendard, system-ui, sans-serif"; // xText와 같은 글꼴로 잰다
      const widths = parts.map(([t]) => ctx.measureText(t).width);
      ctx.restore();
      let px = cx - widths.reduce((s, v) => s + v, 0) / 2;
      parts.forEach(([t, c], i) => {
        xText(ctx, t, px, 200, { px: 12.5, align: "left", color: c, w: 800 });
        px += widths[i];
      });
    }
    ctx.restore();
  });

  f.say("여섯 가지 전기 기구 카드를 하나씩 눌러 <b>사용한 전기 에너지</b>를 측정해 보세요. <b>10초 동안 켜기</b>로도 바꿔 비교해 보세요.");
  api.setCTA("여섯 기구를 모두 켜 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
