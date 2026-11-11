// [중1 Ⅳ v5] u4l5, u4l6 온도 측정 랩: 「녹는 동안(끓는 동안, 어는 동안) 온도는 어떻게 될까요?」
// 책의 실험 셋을 따로따로 손으로 한다. 1분마다 온도를 재어 그래프에 점을 찍고, 상태가 변하던 구간을 가려낸다.
//   melt   탐구: 얼음이 든 플라스크를 찬물에 담그고 1분마다 온도를 잰다(얼음이 녹는 동안 0℃).
//   boil   탐구: 물을 가열하며 1분마다 온도를 잰다(끓는 동안 100℃). 불의 세기를 학생이 정하고 두 가지를 다 해서 견준다
//          (도입의 물음 "센 불이면 더 뜨거울까"에 그래프로 답한다. 센 불은 더 빨리 끓을 뿐 멈춘 온도는 같다).
//   freeze 해 보기: 시험관의 물을 얼음(과 소금)에 넣고 온도를 잰다. 비커에 얼음만 넣을지 얼음과 소금을 넣을지 학생이 정한다
//          (얼음만 넣으면 0℃ 아래로 내려가지 않아 물이 얼지 않는다. 소금을 섞어 다시 한다).
// 무대: 왼쪽은 용기 속의 물질(단원의 메타볼과 입자 뷰. 물리 수치 불변), 오른쪽은 온도 그래프. 꾹 누르는 동안 시간이 흐르고 1분마다 점이 찍힌다.
// 옛 랩(−20℃에서 120℃까지 한 줄로 이어 그리는 곡선)의 구성은 가져오지 않았다. 온도와 시간의 값은 이 랩에서 정한 값이다(0℃와 100℃는 자연값).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { colFor } from "../../../renderers/palette";
import { fitCanvas } from "../../../ui/canvas";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { deg, u4Hold, u4Lab, u4Matter, u4Predict, type U4Step } from "./u4Kit";

type Mode = "melt" | "boil" | "freeze";
type Kind = "melt" | "weak" | "strong" | "ice" | "salt";
interface Model {
  /** m분의 온도(℃) */
  T: (m: number) => number;
  /** 무대의 시뮬레이션에 넣는 온도(상태가 변하는 구간에서는 조금씩 넘어가게 한다) */
  sim: (m: number) => number;
  /** 상태가 변하는 구간(분). 없으면 null */
  flat: [number, number] | null;
  end: number;
  state: (m: number) => string;
  bath: string;
}
const lin = (m: number, m0: number, t0: number, k: number): number => t0 + (m - m0) * k;
const MODELS: Record<Kind, Model> = {
  melt: {
    T: (m) => (m < 2 ? lin(m, 0, -5, 2.5) : m < 7 ? 0 : lin(m, 7, 0, 5 / 3)),
    sim: (m) => (m < 2 ? lin(m, 0, -8, 3) : m < 7 ? -2 + (m - 2) : 3 + (m - 7) * 5),
    flat: [2, 7],
    end: 10,
    state: (m) => (m < 2 ? "얼음" : m < 7 ? "얼음과 물" : "물"),
    bath: "찬물",
  },
  weak: {
    T: (m) => (m < 8 ? lin(m, 0, 20, 10) : 100),
    sim: (m) => (m < 8 ? lin(m, 0, 20, 9) : 96.5 + (m - 8) * 0.9),
    flat: [8, 10],
    end: 10,
    state: (m) => (m < 8 ? "물" : "물과 수증기"),
    bath: "약한 불",
  },
  strong: {
    T: (m) => (m < 4 ? lin(m, 0, 20, 20) : 100),
    sim: (m) => (m < 4 ? lin(m, 0, 20, 18) : 96.5 + (m - 4) * 0.33),
    flat: [4, 10],
    end: 10,
    state: (m) => (m < 4 ? "물" : "물과 수증기"),
    bath: "센 불",
  },
  ice: {
    T: (m) => 0.6 + 14.4 * Math.exp(-0.55 * m),
    sim: (m) => 4 + 30 * Math.exp(-0.55 * m),
    flat: null,
    end: 8,
    state: () => "물",
    bath: "얼음",
  },
  salt: {
    T: (m) => (m < 3 ? lin(m, 0, 15, -5) : m < 7 ? 0 : lin(m, 7, 0, -3)),
    sim: (m) => (m < 3 ? lin(m, 0, 34, -10) : m < 7 ? 3 - (m - 3) * 1.3 : lin(m, 7, -3, -4)),
    flat: [3, 7],
    end: 10,
    state: (m) => (m < 3 ? "물" : m < 7 ? "물과 얼음" : "얼음"),
    bath: "얼음과 소금",
  },
};
const AXIS: Record<Mode, { lo: number; hi: number; ticks: number[] }> = {
  melt: { lo: -6, hi: 6, ticks: [-5, 0, 5] },
  boil: { lo: 0, hi: 120, ticks: [0, 50, 100] },
  freeze: { lo: -10, hi: 20, ticks: [-10, 0, 10, 20] },
};
const MS_PER_MIN = 560;

interface CurveStep extends U4Step {
  mode?: Mode;
}

export const u4CurveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CurveStep;
  const mode: Mode = s.mode ?? "melt";
  const lab = u4Lab(host, api, s, { steps: 3, cls: `u4x-curve is-${mode}` });
  const { f, tm } = lab;
  const cool = mode === "freeze";

  const simBox = el("div", { class: "u4x-heat-sim" });
  const graph = el("canvas", { class: "u4x-heat-graph" });
  const tag = el("div", { class: "u4x-heat-tag", text: cool ? "열에너지를 내놓는 중" : "열에너지를 받는 중" });
  const temp = el("div", { class: "u4x-heat-temp", text: "" });
  f.stage.append(simBox, graph, tag, temp);

  let kind: Kind = mode === "melt" ? "melt" : mode === "boil" ? "weak" : "salt";
  let m = 0; // 지금 실험에서 흐른 시간(분)
  let running = false; // 실험이 준비되어 시간을 보낼 수 있는가
  let holding = false;
  let flatSeen = false;
  let zones = false; // 구간 이름표 (가)(나)(다)
  let chosen = mode === "melt"; // 데우거나 식히는 것을 정했는가(정하기 전에는 이름표를 그리지 않는다)
  let pred = "";
  const past: { kind: Kind; pts: number[] }[] = []; // 끝낸 실험의 1분마다의 온도
  let pts: number[] = [];

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: "" });
  const mt = u4Matter(lab, {
    box: simBox,
    sim: { count: 32, r: 6, temp: MODELS[kind].sim(0), walls: (w, h) => ({ x0: 18, y0: 40, x1: w - 18, y1: h - 50 }) },
    overlay: (ctx, w, h) => bath(ctx, w, h),
    onFrame: () => paint(),
  });
  mt.pill.append(dot, name);
  mt.read.remove();

  /** 안쪽 용기(플라스크, 시험관)의 윤곽과, 그것을 데우거나 식히는 것(바깥 통의 찬물이나 얼음, 아래의 불). */
  function bath(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const x0 = 14, x1 = w - 14, top = 34, bot = h - 46;
    const label = (t: string, color: string): void => {
      ctx.font = "800 12.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = color;
      ctx.fillText(t, w / 2, h - 7);
    };
    // 바깥 통: 안쪽 용기의 아랫부분을 감싼다
    if (mode !== "boil") {
      ctx.fillStyle = mode === "melt" ? "rgba(77,171,247,.22)" : chosen ? "rgba(197,228,255,.14)" : "rgba(255,255,255,.04)";
      ctx.strokeStyle = "rgba(169,193,220,.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(3, h - 104, w - 6, 82, 9);
      ctx.fill();
      ctx.stroke();
      if (mode === "freeze" && chosen) {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = "rgba(221,239,255,.9)";
          ctx.fillRect(i % 2 ? w - 12 : 5, h - 98 + i * 14, 7, 7);
        }
        if (kind === "salt") {
          ctx.fillStyle = "#fff";
          for (let i = 0; i < 10; i++) ctx.fillRect(i % 2 ? w - 9 - (i % 3) : 6 + (i % 3), h - 94 + i * 7, 2, 2);
        }
      }
    }
    // 안쪽 용기의 유리 벽
    ctx.strokeStyle = "rgba(200,220,245,.85)";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.lineTo(x0, bot - 8);
    ctx.quadraticCurveTo(x0, bot + 2, x0 + 10, bot + 2);
    ctx.lineTo(x1 - 10, bot + 2);
    ctx.quadraticCurveTo(x1, bot + 2, x1, bot - 8);
    ctx.lineTo(x1, top);
    ctx.stroke();
    if (mode === "boil") {
      if (!chosen) return;
      const n = kind === "strong" ? 5 : 3;
      const fh = kind === "strong" ? 20 : 11;
      for (let i = 0; i < n; i++) {
        const x = w / 2 + (i - (n - 1) / 2) * 15;
        const flick = holding ? Math.sin(performance.now() / 90 + i) * 2.5 : 0;
        ctx.fillStyle = "#FF922B";
        ctx.beginPath();
        ctx.moveTo(x - 6, h - 20);
        ctx.quadraticCurveTo(x - 7, h - 20 - fh * 0.5, x, h - 20 - fh - flick);
        ctx.quadraticCurveTo(x + 7, h - 20 - fh * 0.5, x + 6, h - 20);
        ctx.fill();
      }
      label(MODELS[kind].bath, "#FFD8A8");
      return;
    }
    if (chosen) label(MODELS[kind].bath, "#CFE3FF");
  }

  function paint(): void {
    const M = MODELS[kind];
    const T = M.T(m);
    mt.ms.setTemp(M.sim(m));
    name.textContent = M.state(m);
    temp.textContent = deg(T);
    dot.style.background = colFor(T, 66, 1);
    draw();
    host.dataset.u4M = m.toFixed(1);
    host.dataset.u4Kind = kind;
  }

  function draw(): void {
    const { ctx, w, h } = fitCanvas(graph);
    ctx.clearRect(0, 0, w, h);
    const ax = AXIS[mode];
    const padL = 34, padR = 24, padT = 50, padB = 30;
    const pw = w - padL - padR, ph = h - padT - padB;
    const xOf = (mm: number): number => padL + (mm / 10) * pw;
    const yOf = (T: number): number => padT + (1 - (T - ax.lo) / (ax.hi - ax.lo)) * ph;
    ctx.strokeStyle = "rgba(148,176,214,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(padL, padT - 6);
    ctx.lineTo(padL, padT + ph);
    ctx.lineTo(padL + pw, padT + ph);
    ctx.stroke();
    ctx.font = "700 12px Pretendard, sans-serif";
    ctx.fillStyle = "#8CA2C0";
    ctx.textAlign = "left";
    ctx.fillText("온도(℃)", 6, padT - 16);
    ctx.textAlign = "center";
    for (const mm of [0, 5, 10]) ctx.fillText(String(mm), xOf(mm), h - 12);
    ctx.textAlign = "right";
    ctx.fillText("분", w - 2, h - 12);
    for (const T of ax.ticks) {
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = T === 0 || T === 100 ? "rgba(148,176,214,.42)" : "rgba(148,176,214,.16)";
      ctx.beginPath();
      ctx.moveTo(padL, yOf(T));
      ctx.lineTo(padL + pw, yOf(T));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(T < 0 ? `−${-T}` : String(T), padL - 5, yOf(T) + 4);
    }
    const line = (ps: number[], partial: number | null, K: Kind, dim: boolean): void => {
      if (!ps.length) return;
      ctx.globalAlpha = dim ? 0.42 : 1;
      ctx.strokeStyle = dim ? "#9FB3CC" : "#B9ADFF";
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ps.forEach((T, i) => (i ? ctx.lineTo(xOf(i), yOf(T)) : ctx.moveTo(xOf(i), yOf(T))));
      if (partial !== null) ctx.lineTo(xOf(partial), yOf(MODELS[K].T(partial)));
      ctx.stroke();
      ps.forEach((T, i) => {
        ctx.fillStyle = dim ? "#9FB3CC" : colFor(T, 68, 1);
        ctx.beginPath();
        ctx.arc(xOf(i), yOf(T), 3.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };
    past.forEach((p) => line(p.pts, null, p.kind, true));
    line(pts, running ? m : null, kind, false);
    // 견줄 실험의 이름표(끓이기: 약한 불과 센 불)
    ctx.font = "800 12px Pretendard, sans-serif";
    if (mode === "boil") {
      const all = [...past.map((p) => p.kind), ...(pts.length ? [kind] : [])];
      all.forEach((K) => {
        const reach = MODELS[K].flat?.[0] ?? 0;
        ctx.fillStyle = K === kind && pts.length ? "#E9E4FF" : "#9FB3CC";
        ctx.textAlign = "center";
        const done = K !== kind || m >= reach;
        if (done) ctx.fillText(MODELS[K].bath, xOf(reach) + (K === "strong" ? -4 : 0), yOf(100) - 10);
      });
    }
    // 구간 이름표 (가)(나)(다)
    const fl = MODELS[kind].flat;
    if (zones && fl) {
      ctx.fillStyle = "#FFE58A";
      ctx.textAlign = "center";
      [["(가)", fl[0] / 2], ["(나)", (fl[0] + fl[1]) / 2], ["(다)", (fl[1] + 10) / 2]].forEach(([t, mm]) => ctx.fillText(t as string, xOf(mm as number), padT - 2));
      ctx.strokeStyle = "rgba(255,229,138,.5)";
      ctx.setLineDash([3, 4]);
      for (const mm of fl) {
        ctx.beginPath();
        ctx.moveTo(xOf(mm), padT + 4);
        ctx.lineTo(xOf(mm), padT + ph);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }

  // ── 시간 보내기 ──
  const HOLD: Record<Mode, string> = { melt: "꾹 눌러 시간 보내기", boil: "꾹 눌러 가열하기", freeze: "꾹 눌러 식히기" };
  const hold = u4Hold(
    lab,
    HOLD[mode],
    (ms) => {
      if (!running) return false;
      const M = MODELS[kind];
      const before = Math.floor(m);
      m = Math.min(M.end, m + ms / MS_PER_MIN);
      for (let i = before + 1; i <= Math.floor(m); i++) {
        pts[i] = M.T(i);
        haptic(HAPTIC.tap);
      }
      if (M.flat && !flatSeen && m >= M.flat[0] + 0.6) {
        flatSeen = true;
        haptic(HAPTIC.cross);
        f.pips(Math.max(1, past.length));
        mt.ms.toast(`${deg(M.T(m))}에서 멈췄어요`);
        f.say(SAY[kind].flat);
      }
      if (M.flat && flatSeen && m >= M.flat[1] + 0.5 && m < M.end - 0.01 && SAY[kind].after) f.say(SAY[kind].after as string);
      if (m >= M.end) {
        running = false;
        endRun();
        return false;
      }
      return true;
    },
    (on) => {
      holding = on;
      f.stage.classList.toggle("act", on && running);
    },
  );

  const SAY: Record<Kind, { go: string; flat: string; after?: string }> = {
    melt: {
      go: "얼음이 든 플라스크를 <b>찬물</b>에 담갔어요. 꾹 눌러 시간을 보내면 1분마다 온도가 찍혀요.",
      flat: "얼음이 녹기 시작했어요. 그런데 온도가 <b>0℃에서 멈췄어요</b>. 계속 지켜봐요.",
      after: "얼음이 다 녹자 온도가 <b>다시 올라가요</b>.",
    },
    weak: { go: "<b>약한 불</b>로 물을 가열해요. 꾹 누르면 1분마다 온도가 찍혀요.", flat: "물이 끓기 시작했어요. 온도가 <b>100℃에서 멈췄어요</b>. 계속 가열해 봐요." },
    strong: { go: "<b>센 불</b>로 물을 가열해요. 꾹 누르면 1분마다 온도가 찍혀요.", flat: "물이 끓기 시작했어요. 온도가 <b>100℃에서 멈췄어요</b>. 계속 가열해 봐요." },
    ice: { go: "시험관을 <b>얼음</b>만 채운 비커에 넣었어요. 꾹 눌러 식히며 온도를 봐요.", flat: "" },
    salt: {
      go: "시험관을 <b>얼음과 소금</b>을 채운 비커에 넣었어요. 꾹 눌러 식히며 온도를 봐요.",
      flat: "물이 얼기 시작했어요. 그런데 온도가 <b>0℃에서 멈췄어요</b>. 계속 식혀 봐요.",
      after: "물이 다 얼자 온도가 <b>다시 내려가요</b>.",
    },
  };

  function begin(k: Kind): void {
    kind = k;
    chosen = true;
    m = 0;
    pts = [MODELS[k].T(0)];
    flatSeen = false;
    running = true;
    hold.disabled = false;
    f.say(SAY[k].go);
    f.slot.setControls(hold);
    api.setCTA(mode === "boil" ? "끓을 때까지 가열해 보세요" : "끝까지 지켜보세요", { enabled: false });
  }

  function endRun(): void {
    hold.disabled = true;
    f.stage.classList.remove("act");
    haptic(HAPTIC.correct);
    if (mode === "melt" || kind === "salt") {
      zones = true;
      f.pips(2);
      const head = pred.startsWith("그대로") ? "예측대로" : "예측과 달리";
      f.say(`${head} ${mode === "melt" ? "녹는" : "어는"} 동안 온도가 <b>멈춰</b> 있었어요. 그래프를 세 구간으로 나눠 봤어요.`);
      tm.later(judge, 1100);
      return;
    }
    if (kind === "ice") {
      // 얼음만으로는 얼지 않는다: 그린 곡선을 남겨 두고 소금을 섞어 다시 한다
      haptic(HAPTIC.wrong);
      past.push({ kind, pts });
      pts = [];
      f.say("온도가 0℃ 가까이에서 더 내려가지 않아요. 물이 <b>얼지 않았어요</b>. 얼음만으로는 모자라요.");
      const redo = bvBtn("main u4x-curve-redo", "얼음에 소금을 섞어 다시 하기");
      redo.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        begin("salt");
      });
      f.slot.setControls(redo);
      return;
    }
    // 끓이기: 두 가지 불을 다 해 본다
    past.push({ kind, pts });
    pts = [];
    f.pips(past.length);
    if (past.length < 2) {
      const other: Kind = kind === "weak" ? "strong" : "weak";
      f.say(`끓는 동안 온도는 <b>100℃ 그대로</b>였어요. 이번에는 <b>${MODELS[other].bath}</b>로 바꿔 다시 끓여 봐요.`);
      const redo = bvBtn("main u4x-curve-redo", `${MODELS[other].bath}로 다시 끓이기`);
      redo.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        begin(other);
      });
      f.slot.setControls(redo);
      return;
    }
    f.say("센 불에서는 더 빨리 끓었어요. 그런데 멈춘 온도는 두 번 다 <b>100℃</b>예요.");
    tm.later(judge, 1100);
  }

  function judge(): void {
    const done = (html: string) => () => lab.finish(html);
    if (mode === "boil") {
      f.slot.ask(
        "불을 세게 했을 때 <b>달라진 것</b>은?",
        [{ t: "100℃에 닿기까지 걸린 시간", ok: true }, { t: "물이 끓는 동안의 온도" }, { t: "물이 끓기 시작하는 온도" }],
        (ok) => api.recordQuiz(ok),
        {
          why: "센 불은 <b>더 빨리</b> 끓게 할 뿐이에요. 끓는 동안의 온도는 똑같이 100℃였어요.",
          onNext: done("물이 끓는 동안에는 계속 가열해도 온도가 <b>일정</b>해요. 센 불은 온도를 높이지 못하고 물을 더 빨리 끓게 할 뿐이에요."),
        },
      );
      return;
    }
    const melt = mode === "melt";
    f.slot.ask(
      melt ? "얼음이 <b>녹고 있던</b> 때는 그래프의 어느 구간일까요?" : "물이 <b>얼고 있던</b> 때는 그래프의 어느 구간일까요?",
      [{ t: "(나) 구간", ok: true }, { t: "(가) 구간" }, { t: "(다) 구간" }],
      (ok) => api.recordQuiz(ok),
      {
        why: melt ? "얼음이 녹는 동안에는 온도가 <b>0℃에서 멈춰</b> 있었어요. 평평한 (나) 구간이에요." : "물이 어는 동안에는 온도가 <b>0℃에서 멈춰</b> 있었어요. 평평한 (나) 구간이에요.",
        onNext: done(
          melt
            ? "얼음이 녹는 동안에는 열을 받아도 온도가 <b>일정</b>해요. 받은 열에너지가 모두 <b>상태 변화</b>에 쓰이기 때문이에요."
            : "물이 어는 동안에는 식혀도 온도가 <b>일정</b>해요. 얼면서 열에너지를 <b>내놓기</b> 때문이에요.",
        ),
      },
    );
  }

  // ── 처음 ──
  if (mode === "melt") {
    f.say("<b>−5℃ 얼음</b>이 든 플라스크예요. 찬물에 담가 천천히 녹일 거예요. 먼저 예측해 보세요.");
    u4Predict(lab, "얼음이 <b>녹는 동안</b> 온도는 어떻게 될까요?", ["그대로 멈춰 있다", "계속 올라간다", "조금씩 내려간다"], (picked) => {
      pred = picked;
      begin("melt");
    });
  } else if (mode === "freeze") {
    f.say("<b>물</b>이 든 시험관에 온도 센서를 꽂았어요. 이 물을 얼릴 거예요. 먼저 예측해 보세요.");
    u4Predict(lab, "물이 <b>어는 동안</b> 온도는 어떻게 될까요?", ["그대로 멈춰 있다", "계속 내려간다", "조금씩 올라간다"], (picked) => {
      pred = picked;
      const cIce = bvCard("u4x-curve-pick", { name: "얼음만", sub: "비커에 얼음을 채운다", key: "ice" });
      const cSalt = bvCard("u4x-curve-pick", { name: "얼음과 소금", sub: "얼음에 소금을 섞는다", key: "salt" });
      cIce.el.addEventListener("click", () => begin("ice"));
      cSalt.el.addEventListener("click", () => begin("salt"));
      f.say("시험관을 넣을 비커에 <b>무엇을 채울지</b> 골라 보세요.");
      f.slot.setControls(bvCards(2, cIce, cSalt));
      api.setCTA("비커에 채울 것을 골라 보세요", { enabled: false });
    });
  } else {
    const cWeak = bvCard("u4x-curve-pick", { name: "약한 불", sub: "천천히 가열한다", key: "weak" });
    const cStrong = bvCard("u4x-curve-pick", { name: "센 불", sub: "빠르게 가열한다", key: "strong" });
    cWeak.el.addEventListener("click", () => begin("weak"));
    cStrong.el.addEventListener("click", () => begin("strong"));
    f.say("<b>20℃ 물</b>을 끓일 거예요. 먼저 <b>불의 세기</b>를 골라 보세요. 두 가지 다 해 볼 거예요.");
    f.slot.setControls(bvCards(2, cWeak, cStrong));
    api.setCTA("불의 세기를 골라 보세요", { enabled: false });
  }
  return lab.cleanup;
};
