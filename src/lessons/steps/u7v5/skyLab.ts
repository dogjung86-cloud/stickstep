// u7SkyLab: 하루 동안 별의 움직임(u7l4). 교과서 "하루 동안 별의 운동 알아보기"(245쪽)를 손으로 한다.
//   교과서: 천체 관측 프로그램에서 북쪽 하늘의 북극성과 북두칠성을 찾고, 시각을 1시간씩 바꾸며 위치 변화를 본다.
//           이어서 동쪽, 남쪽, 서쪽 하늘에서도 같은 일을 한다.
//   랩   : 하늘을 고르고 시각 막대를 밀면 별이 움직이고 지나온 자취가 남는다(저녁 8시부터 새벽 2시).
// 정본 skyDaily는 별이 저절로 흐르는 것을 구경했다. 여기서는 시각을 학생이 민다(원인을 손으로 바꾼다).
// 움직임(우리나라, 북위 약 37°): 북쪽은 북극성을 가운데 두고 시계 반대 방향으로 한 시간에 15°.
//   동쪽은 오른쪽 위로 비스듬히 떠오르고, 서쪽은 오른쪽 아래로 비스듬히 진다(지평선과 약 53°). 남쪽은 왼쪽에서 오른쪽으로 지나간다.
// 그리기는 조작이 있을 때만 한다(그리기 루프 없음).

import { el } from "../../../core/dom";
import { fitCanvas } from "../../../ui/canvas";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { u7Frame, u7Dev } from "./kit";

interface SkyStep {
  title: string;
  cta?: string;
}
type Dir = "E" | "S" | "W" | "N";
const DIRS: Dir[] = ["E", "S", "W", "N"];
const DIR_NAME: Record<Dir, string> = { E: "동쪽", S: "남쪽", W: "서쪽", N: "북쪽" };
const SEEN_SAY: Record<Dir, string> = {
  E: "동쪽 하늘의 별은 <b>오른쪽 위로</b> 비스듬히 떠올라요. 다른 하늘도 골라 보세요.",
  S: "남쪽 하늘의 별은 <b>왼쪽에서 오른쪽으로</b> 지나가요. 다른 하늘도 골라 보세요.",
  W: "서쪽 하늘의 별은 <b>오른쪽 아래로</b> 비스듬히 져요. 다른 하늘도 골라 보세요.",
  N: "북쪽 하늘의 별은 <b>한곳을 가운데 두고</b> 돌아요. 다른 하늘도 골라 보세요.",
};
const H = 230;
const POLE_Y = 96;
const GROUND = 36; // 땅 실루엣 높이
const MAXQ = 24; // 15분 단위(6시간)
const NEED = 16; // 4시간 넘게 밀어야 그 하늘을 본 것으로 친다
const RISE = (53 * Math.PI) / 180;

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 북두칠성: 북극성에서 본 (거리, 옆으로 벗어난 거리). 국자 끝의 두 별을 이은 선을 늘이면 북극성에 닿는다.
const DIPPER: [number, number][] = [[62, 0], [80, 0], [84, 23], [66, 21], [60, 38], [56, 55], [64, 72]];
const DIPPER_LINES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];
const DIPPER_A0 = (188 * Math.PI) / 180;

function timeLabel(q: number): string {
  const total = 20 * 60 + q * 15;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const part = h24 >= 20 && h24 < 21 ? "저녁" : h24 >= 21 || h24 === 0 ? "밤" : "새벽";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${part} ${h12}시${m ? ` ${m}분` : ""}`;
}

export const u7SkyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SkyStep;
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-sky", api });
  const doneCta = s.cta ?? "다음으로";

  const canvas = el("canvas", { class: "u7x-cv" }) as HTMLCanvasElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: timeLabel(0) });
  f.stage.append(canvas, pill);

  let dir: Dir = "E";
  let q = 0;
  const maxQ: Record<Dir, number> = { E: 0, S: 0, W: 0, N: 0 };
  const seen = new Set<Dir>();
  let phase: "look" | "pole" | "ask" | "done" = "look";
  let poleFound = false;
  let disposed = false;
  host.dataset.u7Phase = phase;

  // 조작부: 하늘 고르기 + 시각 막대
  const dirBtns = new Map<Dir, HTMLButtonElement>();
  const seg = el("div", { class: "u7x-seg" });
  for (const d of DIRS) {
    const b = el("button", { class: "u7x-segbtn", attrs: { type: "button", "aria-pressed": String(d === dir) }, dataset: { d } }, el("span", { text: DIR_NAME[d] })) as HTMLButtonElement;
    b.addEventListener("click", () => setDir(d));
    dirBtns.set(d, b);
    seg.appendChild(b);
  }
  const range = bvRange({
    cls: "u7x-range",
    min: 0,
    max: MAXQ,
    value: 0,
    label: "시각을 밀어 보세요",
    ticks: ["저녁 8시", "밤 10시", "밤 12시", "새벽 2시"],
    onInput: (v) => {
      q = v;
      onTime();
    },
  });
  f.slot.setControls(el("div", { class: "u7x-cap", text: "어느 쪽 하늘을 볼까요" }), seg, range.el);
  f.say("<b>시각 막대</b>를 밀어 보세요. 동쪽 하늘의 별이 어디로 움직이나요?");
  f.pips(1);
  api.setCTA("네 하늘을 모두 살펴봐요", { enabled: false });

  function paintSeg(): void {
    for (const [d, b] of dirBtns) {
      b.classList.toggle("on", d === dir);
      b.classList.toggle("done", seen.has(d));
      b.setAttribute("aria-pressed", String(d === dir));
      b.disabled = phase !== "look";
    }
  }

  function setDir(d: Dir): void {
    if (phase !== "look" || d === dir) return;
    dir = d;
    q = 0;
    range.set(0);
    haptic(HAPTIC.select);
    paintSeg();
    if (!seen.has(d)) f.say(`${DIR_NAME[d]} 하늘이에요. <b>시각 막대</b>를 밀어 별이 움직이는 쪽을 보세요.`);
    draw();
  }

  function onTime(): void {
    pill.textContent = timeLabel(q);
    if (phase === "look") {
      maxQ[dir] = Math.max(maxQ[dir], q);
      if (maxQ[dir] >= NEED && !seen.has(dir)) {
        seen.add(dir);
        haptic(HAPTIC.tap);
        host.dataset.u7Seen = String(seen.size);
        paintSeg();
        if (seen.size === DIRS.length) window.setTimeout(() => !disposed && phase === "look" && toPole(), 1300);
        f.say(seen.size === DIRS.length ? SEEN_SAY[dir].replace(" 다른 하늘도 골라 보세요.", "") : SEEN_SAY[dir]);
      }
    }
    draw();
  }

  function toPole(): void {
    phase = "pole";
    host.dataset.u7Phase = phase;
    dir = "N";
    q = MAXQ;
    range.set(MAXQ);
    pill.textContent = timeLabel(q);
    paintSeg();
    f.pips(2);
    f.say("북쪽 하늘이에요. 여섯 시간 동안 거의 <b>움직이지 않은 별</b>을 찾아 눌러 보세요.");
    api.setCTA("움직이지 않은 별을 눌러요", { enabled: false });
    draw();
  }

  function toAsk(): void {
    phase = "ask";
    host.dataset.u7Phase = phase;
    f.pips(3);
    f.say("그 별이 <b>북극성</b>이에요. 다른 별들의 자취를 보고 답해 보세요.");
    f.slot.ask(
      "북쪽 하늘의 별들은 <b>어느 방향</b>으로 돌았나요?",
      [{ t: "시계 반대 방향", ok: true }, { t: "시계 방향" }],
      (ok) => api.recordQuiz(ok),
      { why: "자취의 끝(밝은 점)이 시계 반대 방향으로 나아갔어요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = phase;
    f.pips(4);
    f.say("별은 동쪽에서 떠서 남쪽 하늘을 지나 서쪽으로 져요.");
    f.slot.conclude("별이 하루에 한 바퀴 도는 것처럼 보여요. 별이 도는 것이 아니라 <b>지구가 하루에 한 바퀴 스스로 돌기</b>(자전) 때문이에요. 그래서 별은 지구가 도는 방향과 반대로 움직여 보여요.");
    api.enableCTA(doneCta);
  }

  // ---- 별 자리 ----
  interface Star {
    b: number; // 밝기
    at: (hours: number, W: number) => [number, number];
  }
  const stars: Record<Dir, Star[]> = { E: [], S: [], W: [], N: [] };
  {
    const r = rng(41);
    const v = 22; // 한 시간에 움직이는 거리(px)
    for (let i = 0; i < 22; i++) {
      const u = r(), w = r(), b = 0.45 + r() * 0.55;
      stars.E.push({ b, at: (t, W) => [8 + u * (W - 110) + Math.cos(RISE) * v * t, 70 + w * 190 - Math.sin(RISE) * v * t] });
    }
    for (let i = 0; i < 22; i++) {
      const u = r(), w = r(), b = 0.45 + r() * 0.55;
      stars.W.push({ b, at: (t, W) => [8 + u * (W - 110) + Math.cos(RISE) * v * t, -50 + w * 190 + Math.sin(RISE) * v * t] });
    }
    for (let i = 0; i < 24; i++) {
      const rho = 185 + r() * 190, a0 = (-128 + r() * 50) * (Math.PI / 180), b = 0.45 + r() * 0.55;
      stars.S.push({ b, at: (t, W) => { const a = a0 + t * 7.5 * (Math.PI / 180); return [W / 2 + rho * Math.cos(a), H + 160 + rho * Math.sin(a)]; } });
    }
    const spin = (rad: number, a0: number, b: number): Star => ({ b, at: (t, W) => { const a = a0 - t * 15 * (Math.PI / 180); return [W / 2 + rad * Math.cos(a), POLE_Y + rad * Math.sin(a)]; } });
    for (const [d, p] of DIPPER) stars.N.push(spin(Math.hypot(d, p), DIPPER_A0 + Math.atan2(p, d), 1));
    for (let i = 0; i < 15; i++) stars.N.push(spin(26 + r() * 130, r() * Math.PI * 2, 0.4 + r() * 0.5));
  }
  const POLARIS: Star = { b: 1, at: (_t, W) => [W / 2, POLE_Y] };

  function draw(): void {
    if (disposed || !canvas.isConnected) return;
    const fit = fitCanvas(canvas, H);
    const { ctx, w: W } = fit;
    const t = q / 4;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#070E20");
    bg.addColorStop(1, "#1B2B52");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const list = stars[dir];
    const lineTo = (st: Star): void => {
      const n = Math.max(2, Math.ceil(t * 4));
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const [x, y] = st.at((t * i) / n, W);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    ctx.lineCap = "round";
    if (t > 0) {
      for (const st of list) {
        ctx.strokeStyle = `rgba(170,200,255,${0.2 + st.b * 0.3})`;
        ctx.lineWidth = st.b > 0.9 ? 2 : 1.4;
        lineTo(st);
      }
    }
    if (dir === "N") {
      // 북두칠성의 별을 잇는 선(지금 시각의 자리)
      ctx.strokeStyle = "rgba(255,226,160,.55)";
      ctx.lineWidth = 1.3;
      for (const [a, b] of DIPPER_LINES) {
        const [x1, y1] = list[a].at(t, W), [x2, y2] = list[b].at(t, W);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    list.forEach((st, i) => {
      const [x, y] = st.at(t, W);
      const big = dir === "N" && i < DIPPER.length;
      ctx.fillStyle = big ? "#FFE9B0" : `rgba(232,241,255,${0.6 + st.b * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, big ? 2.6 : 1.4 + st.b * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });
    if (dir === "N") {
      const [px, py] = POLARIS.at(0, W);
      ctx.fillStyle = "#FFF3CC";
      ctx.beginPath();
      ctx.arc(px, py, poleFound ? 3.6 : 2.8, 0, Math.PI * 2);
      ctx.fill();
      if (poleFound) {
        ctx.strokeStyle = "rgba(255,224,160,.9)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "800 13px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFEFC4";
        ctx.fillText("북극성", px, py - 18);
      }
    }

    // 땅과 방위
    ctx.fillStyle = "#060B18";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H - GROUND + 4);
    ctx.quadraticCurveTo(W * 0.28, H - GROUND - 14, W * 0.55, H - GROUND + 2);
    ctx.quadraticCurveTo(W * 0.8, H - GROUND + 12, W, H - GROUND - 4);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    ctx.font = "800 13px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#DCE7FB";
    ctx.fillText(`${DIR_NAME[dir]} 하늘`, W / 2, H - 11);
    ctx.font = "700 12.5px Pretendard, sans-serif";
    ctx.fillStyle = "#93A6C8";
    const sides: Record<Dir, [string, string]> = { E: ["북", "남"], S: ["동", "서"], W: ["남", "북"], N: ["서", "동"] };
    ctx.textAlign = "left";
    ctx.fillText(sides[dir][0], 12, H - 11);
    ctx.textAlign = "right";
    ctx.fillText(sides[dir][1], W - 12, H - 11);
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (phase !== "pole") return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = ((e.clientY - r.top) / r.height) * H;
    if (Math.hypot(x - r.width / 2, y - POLE_Y) <= 26) {
      poleFound = true;
      haptic(HAPTIC.correct);
      draw();
      toAsk();
    } else {
      haptic(HAPTIC.tap);
      f.say("그 별은 자취를 길게 남겼어요. <b>자취가 없는 별</b>을 찾아보세요.");
    }
  });
  u7Dev(host, { time: (v: number) => { q = v; range.set(v); onTime(); } });

  const ro = new ResizeObserver(() => draw());
  ro.observe(f.stage);
  paintSeg();
  const raf = requestAnimationFrame(() => draw());
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
  };
};
