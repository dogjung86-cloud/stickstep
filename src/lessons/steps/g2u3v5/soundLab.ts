// [중2 Ⅲ v5] g2u3l8 소리의 특성: g2u3SoundLab 「소리가 달라지면 파동의 무엇이 달라질까요?」
// 책의 어디에서: 탐구 '디지털 탐구 도구를 이용하여 소리의 진폭, 진동수, 파형 탐구하기'(소리 분석 애플리케이션을 켜고
//   칼림바의 금속 막대 하나를 서로 다른 세기로, 길이가 다른 막대를 같은 세기로, 종류가 다른 두 악기로 높이가 같은 음을 비슷한 세기로 내어 파동의 모습을 그린다).
// 학생이 정하는 것: 기준 소리(칼림바, 긴 막대, 약하게)에서 무엇을 바꿀지(튕기는 세기, 막대의 길이, 악기), 기록할 때, 두 화면에서 달라진 것이 무엇인지.
// 실패하는 길: 두 가지를 한꺼번에 바꾸면 기록되지 않는다(무엇 때문에 달라졌는지 알 수 없다). 달라진 것을 잘못 고르면 다시 견준다.
// 한 통찰: 세게 튕기면 진폭이 커지고(소리의 세기), 짧은 막대는 진동수가 크고(높낮이), 악기가 다르면 파동의 모양이 다르다(음색).
// 소리는 '소리 듣기'를 누를 때만 낸다(Web Audio. 실패해도 랩은 끝까지 간다. cleanup에서 닫는다).
// 옛 랩(soundLab)은 합성기의 막대를 돌려 목표를 채웠다. 기준 소리와 하나씩 견주는 대조 실험이 아니었다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { LX, lxCanvas, lxFrame, lxLog, lxText } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}
type Factor = "power" | "bar" | "inst";
interface Sound {
  power: 0 | 1; // 약하게, 세게
  bar: 0 | 1; // 긴 막대, 짧은 막대
  inst: 0 | 1; // 칼림바, 리코더
}
const BASE: Sound = { power: 0, bar: 0, inst: 0 };
const LABEL: Record<Factor, [string, string]> = { power: ["약하게", "세게"], bar: ["긴 막대", "짧은 막대"], inst: ["칼림바", "리코더"] };
const FACTOR_NAME: Record<Factor, string> = { power: "튕기는 세기", bar: "막대의 길이", inst: "악기" };
const FACTORS: Factor[] = ["power", "bar", "inst"];
type Pick = "amp" | "freq" | "shape";
const ANSWER: Record<Factor, Pick> = { power: "amp", bar: "freq", inst: "shape" };
const PICK_NAME: Record<Pick, string> = { amp: "진폭", freq: "진동수", shape: "파동의 모양" };

/** 파동의 모양(봉우리를 1로 맞춘다). 악기가 달라도 진폭과 진동수는 같게 견줄 수 있다. */
const shape = (inst: 0 | 1, x: number): number => (inst === 0 ? Math.sin(x) : (Math.sin(x) + 0.55 * Math.sin(3 * x) + 0.3 * Math.sin(2 * x + 0.6)) / 1.42);
const ampOf = (s: Sound): number => (s.power ? 30 : 13);
const cyclesOf = (s: Sound): number => (s.bar ? 6 : 3);

export const soundLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "sound";
  host.dataset.lx = "set";

  const cur: Sound = { ...BASE };
  let asking: Factor | null = null; // 달라진 것을 고르는 중
  let end = false;
  let flash = 0; // 기록이 안 됐을 때 잠깐 붉게
  let show = 1; // 화면의 파동이 새로 그려지는 정도(0~1)
  const done = new Set<Factor>();
  const log = lxLog(["세기를 바꾸면", "막대를 바꾸면", "악기를 바꾸면"]);

  // 소리(누를 때만)
  let ac: AudioContext | null = null;
  const play = (snd: Sound): void => {
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ac = ac ?? new AC();
      const t0 = ac.currentTime;
      const g = ac.createGain();
      const peak = snd.power ? 0.2 : 0.07;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (snd.inst ? 0.9 : 0.7));
      g.connect(ac.destination);
      const base = snd.bar ? 784 : 392;
      const tones = snd.inst ? [[1, 1], [3, 0.5], [2, 0.3]] : [[1, 1]];
      tones.forEach(([k, a]) => {
        const o = ac!.createOscillator();
        const og = ac!.createGain();
        o.type = "sine";
        o.frequency.value = base * k;
        og.gain.value = a;
        o.connect(og);
        og.connect(g);
        o.start(t0);
        o.stop(t0 + 1);
      });
    } catch {
      /* 소리를 낼 수 없는 기기에서는 화면만으로 간다 */
    }
  };

  const toggles = FACTORS.map((k) => {
    const v = el("i", { text: LABEL[k][0] });
    const b = el("button", { class: "g2u3x-seg g2u3x-fac", attrs: { type: "button" } }, el("b", { text: FACTOR_NAME[k] }), v) as HTMLButtonElement;
    b.dataset.k = k;
    b.addEventListener("click", () => {
      if (end || asking) return;
      cur[k] = (cur[k] ? 0 : 1) as 0 | 1;
      v.textContent = LABEL[k][cur[k]];
      b.classList.toggle("on", cur[k] !== BASE[k]);
      haptic(HAPTIC.tap);
      show = 0;
      const n = FACTORS.filter((x) => cur[x] !== BASE[x]).length;
      f.say(n === 0 ? "기준 소리와 같아졌어요. <b>하나</b>를 골라 바꿔 보세요." : n === 1 ? "하나를 바꿨어요. 두 화면을 견주고 <b>견주어 기록하기</b>를 눌러요." : "지금은 <b>두 가지 넘게</b> 바뀌어 있어요. 기준 소리와 하나만 다르게 해 보세요.");
    });
    return b;
  });
  const facRow = el("div", { class: "g2u3x-segs" }, ...toggles);
  facRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  const hear = bvBtn("", "소리 듣기");
  hear.dataset.k = "hear";
  const rec = bvBtn("main", "견주어 기록하기");
  rec.dataset.k = "rec";
  const actRow = el("div", { class: "g2u3x-row2" }, hear, rec);
  const picks = (["amp", "freq", "shape"] as Pick[]).map((p) => {
    const b = el("button", { class: "g2u3x-seg", attrs: { type: "button" } }, el("b", { text: PICK_NAME[p] })) as HTMLButtonElement;
    b.dataset.k = p;
    b.addEventListener("click", () => choose(p));
    return b;
  });
  const pickRow = el("div", { class: "g2u3x-segs low" }, ...picks);
  pickRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  pickRow.hidden = true;
  f.slot.setControls(facRow, actRow, pickRow, log.el);

  hear.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    play(cur);
  });
  rec.addEventListener("click", () => {
    if (end || asking) return;
    const diff = FACTORS.filter((x) => cur[x] !== BASE[x]);
    if (diff.length === 0) {
      haptic(HAPTIC.wrong);
      flash = 1;
      f.say("아래 화면이 기준 소리와 <b>똑같아요</b>. 세기, 막대, 악기 가운데 하나를 바꿔 보세요.");
      return;
    }
    if (diff.length > 1) {
      haptic(HAPTIC.wrong);
      flash = 1;
      f.say("두 가지를 한꺼번에 바꾸면 <b>무엇 때문에</b> 달라졌는지 알 수 없어요. 하나만 바꾸고 기록해요.");
      return;
    }
    if (done.has(diff[0])) {
      haptic(HAPTIC.wrong);
      f.say(`${FACTOR_NAME[diff[0]]}는 이미 기록했어요. <b>다른 것</b>을 바꿔 견줘 보세요.`);
      return;
    }
    asking = diff[0];
    host.dataset.lx = "pick";
    actRow.hidden = true;
    pickRow.hidden = false;
    f.say("두 화면을 견줘요. 기준 소리와 견주어 파동의 <b>무엇이</b> 달라졌나요?");
  });

  function choose(p: Pick): void {
    if (!asking) return;
    const k = asking;
    if (p !== ANSWER[k]) {
      haptic(HAPTIC.wrong);
      flash = 1;
      const same = p === "amp" ? "<b>진폭</b>(위아래로 흔들리는 폭)은" : p === "freq" ? "<b>진동수</b>(같은 시간 동안 진동한 횟수)는" : "<b>파동의 모양</b>은";
      f.say(`두 화면에서 ${same} 같아요. 다른 곳을 다시 견줘 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    done.add(k);
    log.set(FACTORS.indexOf(k), p === "amp" ? "진폭이 달라요" : p === "freq" ? "진동수가 달라요" : "모양이 달라요");
    toggles[FACTORS.indexOf(k)].classList.add("done");
    f.pips(done.size);
    asking = null;
    host.dataset.lx = "set";
    host.dataset.lxN = String(done.size);
    pickRow.hidden = true;
    actRow.hidden = false;
    if (done.size < 3) {
      f.say(k === "power" ? "세게 튕기면 <b>진폭</b>이 커져요. 기준 소리로 되돌리고 다른 것을 바꿔 보세요." : k === "bar" ? "짧은 막대는 같은 시간에 더 많이 진동해요. <b>진동수</b>가 커요. 되돌리고 다른 것을 바꿔 보세요." : "악기가 다르면 진폭과 진동수가 같아도 <b>모양</b>이 달라요. 되돌리고 다른 것을 바꿔 보세요.");
      return;
    }
    end = true;
    host.dataset.lx = "ask";
    f.say("세 가지를 모두 견줬어요. 표를 보며 생각해 봐요.");
    tm.later(() => {
      f.slot.ask(
        "짧은 막대를 세게 튕기면, 긴 막대를 약하게 튕긴 기준 소리와 견주어 파동은 어떻게 달라질까요?",
        [{ t: "진폭도 진동수도 커져요", ok: true }, { t: "진폭만 커지고 진동수는 같아요" }, { t: "진동수만 커지고 진폭은 같아요" }],
        (ok) => api.recordQuiz(ok),
        { why: "세게 튕기면 <b>진폭</b>이, 짧은 막대는 <b>진동수</b>가 커져요. 두 가지가 함께 달라져요.", onNext: finish },
      );
    }, 1500);
  }
  function finish(): void {
    cur.power = 1;
    cur.bar = 1;
    cur.inst = 0;
    show = 0;
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("세게 튕기면 <b>진폭</b>이 커지고, 짧은 막대를 튕기면 <b>진동수</b>가 커져요. 악기가 다르면 파동의 <b>모양</b>이 달라요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const panel = (ctx: CanvasRenderingContext2D, y0: number, snd: Sound, title: string, k: number, hot: boolean): void => {
    const x0 = 14;
    const w = 318;
    const h = 96;
    const cy = y0 + h / 2 + 6;
    ctx.fillStyle = hot ? "rgba(255,107,107,.16)" : "rgba(9,16,30,.85)";
    ctx.strokeStyle = "rgba(160,190,235,.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 10);
    ctx.fill();
    ctx.stroke();
    // 모눈과 가운데 선
    ctx.strokeStyle = "rgba(160,190,235,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0 + 53; x < x0 + w; x += 53) {
      ctx.moveTo(x, y0 + 22);
      ctx.lineTo(x, y0 + h - 6);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(232,238,249,.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x0 + 6, cy);
    ctx.lineTo(x0 + w - 6, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    // 파동
    const A = ampOf(snd);
    const n = cyclesOf(snd);
    ctx.strokeStyle = "#63E6BE";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const xe = x0 + 8 + (w - 16) * k;
    for (let x = x0 + 8; x <= xe; x += 1.5) {
      const ph = ((x - x0 - 8) / (w - 16)) * n * Math.PI * 2;
      const yy = cy - A * shape(snd.inst, ph);
      if (x === x0 + 8) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    lxText(ctx, title, x0 + 10, y0 + 13, { align: "left", color: LX.ink });
    lxText(ctx, "가로: 시간", x0 + w - 10, y0 + 13, { align: "right", color: LX.dim });
  };

  st.run((ctx, _t, dt) => {
    show = Math.min(1, show + 0.05 * dt);
    flash = Math.max(0, flash - 0.03 * dt);
    panel(ctx, 6, BASE, "기준 소리: 칼림바, 긴 막대, 약하게", 1, false);
    panel(ctx, 124, cur, `바꾼 소리: ${LABEL.inst[cur.inst]}, ${LABEL.bar[cur.bar]}, ${LABEL.power[cur.power]}`, show, flash > 0.4);
  });

  f.say("위는 <b>기준 소리</b>의 화면이에요. 세기, 막대, 악기 가운데 <b>하나만</b> 바꿔 아래 화면과 견주고 기록해 보세요.");
  api.setCTA("세 가지를 하나씩 견줘 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
    try {
      void ac?.close();
    } catch {
      /* 이미 닫힌 경우 */
    }
    ac = null;
  };
};
