// [중2 Ⅲ v5] g2u3l8 소리의 특성: g2u3SoundLab 「소리의 세기·높이·악기가 다르면 파동은 어떻게 달라질까요?」
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
/** 무대 화면 제목에 쓰는 값(기준 소리: 칼림바, 긴 막대, 약하게) */
const LABEL: Record<Factor, [string, string]> = { power: ["약하게", "세게"], bar: ["긴 막대", "짧은 막대"], inst: ["칼림바", "리코더"] };
/** 바꿀 것 버튼에 쓰는 값. 막대는 음의 높이를 함께 적는다(화면 제목은 LABEL 그대로). */
const TOGGLE_LABEL: Record<Factor, [string, string]> = { power: ["약하게", "세게"], bar: ["긴 막대(낮은음)", "짧은 막대(높은음)"], inst: ["칼림바", "리코더"] };
const FACTOR_NAME: Record<Factor, string> = { power: "연주하는 세기", bar: "막대 길이(음높이)", inst: "악기 종류" };
const FACTORS: Factor[] = ["power", "bar", "inst"];
type Pick = "amp" | "freq" | "shape";
const ANSWER: Record<Factor, Pick> = { power: "amp", bar: "freq", inst: "shape" };
const PICK_NAME: Record<Pick, string> = { amp: "진폭", freq: "진동수", shape: "파동의 모양(파형)" };

/** 리코더 파형: 기본음에 두 배 진동하는 소리를 절반 세기로 더한 꼴(sin x + 0.5 sin 2x). 한 주기에 큰 봉우리 하나와 골 하나,
 *  그 사이 진동 중심에 어깨 하나가 생긴다. 봉우리와 골의 높이가 같은 모양이라(점대칭) 최댓값으로 나누면 봉우리도 골도 기준 소리와 꼭 같은 높이다.
 *  (예전 꼴은 한 주기에 봉우리가 셋이고 그 가운데 하나만 기준 높이에 닿아, 진폭이 줄고 진동이 늘어난 것처럼 읽혔다.) */
const REC_B = 0.5;
const REC_PEAK = (() => {
  let m = 0;
  for (let i = 0; i <= 3600; i++) {
    const x = (i / 3600) * Math.PI * 2;
    m = Math.max(m, Math.abs(Math.sin(x) + REC_B * Math.sin(2 * x)));
  }
  return m;
})();
/** 파동의 모양(봉우리를 1로 맞춘다). 악기가 달라도 진폭과 진동수는 같게 비교할 수 있다. */
const shape = (inst: 0 | 1, x: number): number => (inst === 0 ? Math.sin(x) : (Math.sin(x) + REC_B * Math.sin(2 * x)) / REC_PEAK);
const ampOf = (s: Sound): number => (s.power ? 30 : 15);
const cyclesOf = (s: Sound): number => (s.bar ? 6 : 3);
/** 화면 제목의 둘째 칸: 칼림바는 막대, 리코더는 기준 소리와 비교한 음의 높이('긴 막대'는 리코더에 맞지 않는다) */
const pitchLabel = (s: Sound): string => (s.inst ? (s.bar ? "높은 음" : "같은 높이의 음") : LABEL.bar[s.bar]);

export const soundLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api, tall: true });
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
  const log = lxLog(["세기를 바꾸면", "길이를 바꾸면", "악기를 바꾸면"]);

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
      const tones = snd.inst ? [[1, 1], [2, REC_B]] : [[1, 1]]; // 화면의 파형과 같은 섞임
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
    const v = el("i", { text: TOGGLE_LABEL[k][0] });
    const b = el("button", { class: "g2u3x-seg g2u3x-fac", attrs: { type: "button" } }, el("b", { text: FACTOR_NAME[k] }), v) as HTMLButtonElement;
    b.dataset.k = k;
    b.addEventListener("click", () => {
      if (end || asking) return;
      cur[k] = (cur[k] ? 0 : 1) as 0 | 1;
      v.textContent = TOGGLE_LABEL[k][cur[k]];
      b.classList.toggle("on", cur[k] !== BASE[k]);
      haptic(HAPTIC.tap);
      show = 0;
      const n = FACTORS.filter((x) => cur[x] !== BASE[x]).length;
      f.say(n === 0 ? "다시 기준 소리와 같아졌어요. 세 가지 조건 중 <b>하나</b>를 골라 바꾸어 보세요." : n === 1 ? "조건 하나를 바꾸었어요! 위아래 두 파동 화면을 비교해 보고 <b>비교하여 기록하기</b>를 눌러 보세요." : "지금은 조건이 <b>두 가지 이상</b> 바뀌어 있어요. 기준 소리와 한 가지만 다르게 맞추어 보세요.");
    });
    return b;
  });
  const facRow = el("div", { class: "g2u3x-segs" }, ...toggles);
  facRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  const hear = bvBtn("", "소리 들어 보기");
  hear.dataset.k = "hear";
  const rec = bvBtn("main", "비교하여 기록하기");
  rec.dataset.k = "rec";
  const actRow = el("div", { class: "g2u3x-row2" }, hear, rec);
  const picks = (["amp", "freq", "shape"] as Pick[]).map((p) => {
    const b = el("button", { class: "g2u3x-seg", attrs: { type: "button" } }, el("b", { text: PICK_NAME[p] })) as HTMLButtonElement;
    b.dataset.k = p;
    b.addEventListener("click", () => choose(p));
    return b;
  });
  // g2u3x-pk: '파동의 모양(파형)'이 칸 폭(99px)에 1px만 남아서, 넘치면 두 줄로 접히게 한다(g2u3v5.css).
  const pickRow = el("div", { class: "g2u3x-segs low g2u3x-pk" }, ...picks);
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
      f.say("아래쪽 화면이 기준 소리와 <b>똑같아요</b>. 세기, 막대 길이, 악기 종류 가운데 하나를 바꾸어 보세요.");
      return;
    }
    if (diff.length > 1) {
      haptic(HAPTIC.wrong);
      flash = 1;
      f.say("두 가지 이상을 한꺼번에 바꾸면 <b>무엇 때문에</b> 파동이 달라졌는지 알 수 없어요. 조건을 하나만 바꾸고 기록해 보세요.");
      return;
    }
    if (done.has(diff[0])) {
      haptic(HAPTIC.wrong);
      f.say(`${FACTOR_NAME[diff[0]]} 조건은 이미 기록했어요. <b>다른 조건</b>을 바꾸어 비교해 보세요.`);
      return;
    }
    asking = diff[0];
    host.dataset.lx = "pick";
    actRow.hidden = true;
    pickRow.hidden = false;
    f.say("위아래 두 화면을 비교해 보세요. 기준 소리와 비교했을 때 파동의 <b>무엇이</b> 달라졌나요?");
  });

  function choose(p: Pick): void {
    if (!asking) return;
    const k = asking;
    if (p !== ANSWER[k]) {
      haptic(HAPTIC.wrong);
      flash = 1;
      const same = p === "amp" ? "<b>진폭</b>(위아래로 흔들리는 폭)은" : p === "freq" ? "<b>진동수</b>(같은 시간 동안 진동한 횟수)는" : "<b>파동의 모양</b>은";
      f.say(`두 화면에서 ${same} 서로 같아요. 달라진 특징을 다시 찾아 골라 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    done.add(k);
    log.set(FACTORS.indexOf(k), p === "amp" ? "진폭이 달라짐" : p === "freq" ? "진동수가 달라짐" : "파형이 달라짐");
    toggles[FACTORS.indexOf(k)].classList.add("done");
    f.pips(done.size);
    asking = null;
    host.dataset.lx = "set";
    host.dataset.lxN = String(done.size);
    pickRow.hidden = true;
    actRow.hidden = false;
    if (done.size < 3) {
      f.say(k === "power" ? "맞아요! 더 세게 튕기면 소리가 커지면서 파동의 <b>진폭</b>이 커져요. 이제 기준 소리로 되돌린 뒤 다른 조건을 바꾸어 보세요." : k === "bar" ? "맞아요! 짧은 막대는 같은 시간 동안 더 빠르게 진동하므로 <b>진동수</b>가 커져요. 이제 기준 소리로 되돌린 뒤 다른 조건을 바꾸어 보세요." : "맞아요! 악기가 다르면 진폭과 진동수가 같아도 <b>파동의 모양(파형)</b>이 달라져요. 이제 기준 소리로 되돌린 뒤 다른 조건을 바꾸어 보세요.");
      return;
    }
    end = true;
    host.dataset.lx = "ask";
    f.say("세 가지 조건을 모두 비교하여 기록했어요! 아래 표를 보며 정리해 볼까요?");
    tm.later(() => {
      f.slot.ask(
        "짧은 막대를 세게 튕겼을 때의 소리는, 긴 막대를 약하게 튕긴 기준 소리와 비교할 때 파동이 어떻게 달라질까요?",
        [{ t: "진폭과 진동수가 모두 커져요", ok: true }, { t: "진폭만 커지고 진동수는 그대로예요" }, { t: "진동수만 커지고 진폭은 그대로예요" }],
        (ok) => api.recordQuiz(ok),
        { why: "세게 튕기면 소리가 커져 <b>진폭</b>이 커지고, 짧은 막대를 튕기면 높은 소리가 나 <b>진동수</b>가 커지므로 두 가지가 함께 커져요.", onNext: finish },
      );
    }, 1500);
  }
  function finish(): void {
    cur.power = 1;
    cur.bar = 1;
    cur.inst = 0;
    show = 0;
    host.dataset.lx = "done";
    f.say("소리의 세 가지 요소와 파동의 관계를 모두 알아냈어요! 아래 핵심 정리를 읽어 보세요.");
    // 수정안의 '소리의 맵시'는 이 단원(개념, 정리)의 말인 '음색'으로 둔다.
    f.slot.conclude("소리를 크게 내면 파동의 <b>진폭</b>이 커지고, 높은 소리를 내면 파동의 <b>진동수</b>가 커져요. 또한 악기마다 파동의 <b>모양(파형)</b>이 달라 음색이 구별돼요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // 화면 하나: 제목 줄, 파형(가운데 점선은 진동 중심), 위아래 진폭 점선(노랑), 맨 아래 줄에 '한 번 진동' 괄호(분홍)와 '가로: 시간'.
  // 두 화면의 점선 높이와 괄호 폭을 나란히 비교하면 진폭, 진동수, 모양 가운데 무엇이 달라졌는지 눈으로 가릴 수 있다.
  const AMP_RGB = "255,196,90";
  const PER = "#FF8FB1";
  const panel = (ctx: CanvasRenderingContext2D, y0: number, snd: Sound, title: string, k: number, hot: boolean): void => {
    const x0 = 14;
    const w = 318;
    const h = 106;
    const cy = y0 + 54;
    const xs = x0 + 8; // 파형이 시작하는 자리(진동 중심에서 올라가기 시작한다)
    const span = w - 16;
    ctx.fillStyle = hot ? "rgba(255,107,107,.16)" : "rgba(9,16,30,.85)";
    ctx.strokeStyle = "rgba(160,190,235,.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 10);
    ctx.fill();
    ctx.stroke();
    // 세로 모눈: 기준 소리 반 주기마다(두 화면이 같다)
    const refP = span / cyclesOf(BASE);
    ctx.strokeStyle = "rgba(160,190,235,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = xs + refP / 2; x < x0 + w - 4; x += refP / 2) {
      ctx.moveTo(x, y0 + 22);
      ctx.lineTo(x, y0 + 86);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(232,238,249,.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x0 + 6, cy);
    ctx.lineTo(x0 + w - 6, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    const A = ampOf(snd);
    const n = cyclesOf(snd);
    // 진폭 점선: 봉우리 높이와 골 깊이
    ctx.strokeStyle = `rgba(${AMP_RGB},.75)`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    [cy - A, cy + A].forEach((yy) => {
      ctx.moveTo(x0 + 6, yy);
      ctx.lineTo(x0 + w - 6, yy);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    // 파동
    ctx.strokeStyle = "#63E6BE";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    const xe = xs + span * k;
    for (let x = xs; x <= xe; x += 1.5) {
      const ph = ((x - xs) / span) * n * Math.PI * 2;
      const yy = cy - A * shape(snd.inst, ph);
      if (x === xs) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    // '한 번 진동' 괄호: 파형이 한 번 오르내리는 데 걸리는 폭
    const P = span / n;
    const by = y0 + 95;
    ctx.strokeStyle = PER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xs, by);
    ctx.lineTo(xs + P, by);
    ctx.moveTo(xs, by - 5);
    ctx.lineTo(xs, by + 5);
    ctx.moveTo(xs + P, by - 5);
    ctx.lineTo(xs + P, by + 5);
    ctx.stroke();
    lxText(ctx, "한 번 진동", xs + P + 8, by, { align: "left", color: PER });
    lxText(ctx, title, x0 + 10, y0 + 12, { align: "left", color: LX.ink });
    lxText(ctx, "가로축: 시간", x0 + w - 10, by, { align: "right", color: LX.dim });
  };

  st.run((ctx, _t, dt) => {
    show = Math.min(1, show + 0.05 * dt);
    flash = Math.max(0, flash - 0.03 * dt);
    panel(ctx, 3, BASE, "기준 소리: 칼림바, 긴 막대, 약하게", 1, false);
    panel(ctx, 121, cur, `바꾼 소리: ${LABEL.inst[cur.inst]}, ${pitchLabel(cur)}, ${LABEL.power[cur.power]}`, show, flash > 0.4);
  });

  f.say("위쪽은 <b>기준 소리</b>의 파동 화면이에요. 연주하는 세기, 음의 높이(막대 길이), 악기 종류 가운데 <b>한 번에 하나만</b> 바꾸어 아래쪽 화면과 비교하고 기록해 보세요.");
  api.setCTA("세 가지 조건을 한 번에 하나씩 바꾸어 기준 소리와 비교해 보세요", { enabled: false });
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
