// u7SunLab: 태양의 표면과 대기, 활동(u7l3). 교과서 236~239쪽(그림 Ⅶ-3 태양의 표면과 대기, 흑점 수와 태양의 활동, 지구에 미치는 영향).
// 정본 sunLab의 무대 그림(쌀알 무늬가 깔린 광구, 흑점, 달이 가릴 때 드러나는 채층과 코로나, 홍염)을 살리고 틀과 흐름을 고쳤다:
//   한 화면(정본은 1.64화면: 목표 칩, 도움말, 무대, 막대, 그래프, 궁금증 카드가 아래로 쌓였다)
//   · 조작부는 조작 칸 하나에(보기 전환, 흑점 수 막대, 지구에 생기는 일) · 무대 안 글자 13px
//   · 지어낸 곡선 그래프는 뺐다(오로라, 통신 장애, 정전이 흑점 수와 함께 켜지는 등으로 바꿨다)
//   · 본 것을 판정으로 묻고 결론은 조작 칸에 · 궁금증 카드는 결론 뒤에만 붙는다.
// 할 일은 셋이다(흑점 누르기, 달이 가렸을 때 보기, 가려진 채로 흑점 수 늘리기). 앞의 둘은 차례가 없고 도움말이 남은 일을 알려 준다.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { fitCanvas } from "../../../ui/canvas";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { u7Frame, u7Dev } from "./kit";

interface SunStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const H = 230;
const CY = 116;
const R = 74;
// 흑점의 자리(각도, 중심에서의 거리 비율, 크기). 앞의 것부터 나타난다.
const SPOTS: { a: number; d: number; r: number }[] = [
  { a: 0.4, d: 0.36, r: 9 }, { a: 2.2, d: 0.55, r: 7 }, { a: 4.1, d: 0.42, r: 10 },
  { a: 1.3, d: 0.68, r: 6 }, { a: 5.2, d: 0.5, r: 7.5 }, { a: 3.2, d: 0.3, r: 6.5 },
  { a: 0.9, d: 0.75, r: 5.5 }, { a: 5.9, d: 0.62, r: 7 }, { a: 2.8, d: 0.72, r: 5.5 },
  { a: 3.8, d: 0.58, r: 6 }, { a: 1.8, d: 0.42, r: 5.5 }, { a: 4.7, d: 0.72, r: 5.5 },
];
const EARTH: { key: string; name: string; at: number }[] = [
  { key: "aurora", name: "넓은 오로라", at: 0.5 },
  { key: "radio", name: "통신 장애", at: 0.68 },
  { key: "power", name: "정전", at: 0.85 },
];

export const u7SunLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SunStep;
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-sun", api });
  const doneCta = s.cta ?? "개념 정리하기";

  const canvas = el("canvas", { class: "u7x-cv" }) as HTMLCanvasElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "흑점 5개" });
  f.stage.append(canvas, pill);

  let mode: "surf" | "ecl" = "surf";
  let activity = 0.2;
  let coverT = 0;
  let coronaMs = 0;
  let activeMs = 0;
  let tapped = -1;
  const did = { spot: false, corona: false, active: false };
  let phase: "play" | "wait" | "ask" | "done" = "play";
  let disposed = false;
  host.dataset.u7Phase = phase;

  // 조작부
  const surfBtn = el("button", { class: "u7x-segbtn on", attrs: { type: "button", "aria-pressed": "true" }, dataset: { v: "surf" } }, el("span", { text: "평소의 태양" })) as HTMLButtonElement;
  const eclBtn = el("button", { class: "u7x-segbtn", attrs: { type: "button", "aria-pressed": "false" }, dataset: { v: "ecl" } }, el("span", { text: "달이 가렸을 때" })) as HTMLButtonElement;
  const seg = el("div", { class: "u7x-seg two" }, surfBtn, eclBtn);
  const range = bvRange({
    cls: "u7x-range",
    min: 0,
    max: 100,
    value: 20,
    label: "흑점 수를 바꿔 보세요",
    ticks: ["흑점이 적을 때", "흑점이 많을 때"],
    onInput: (v) => {
      activity = v / 100;
    },
  });
  const lamps = EARTH.map((e) => el("span", { class: "u7x-lamp", dataset: { k: e.key }, text: e.name }));
  const earthRow = el("div", { class: "u7x-lamps" }, el("i", { text: "그때 지구는" }), ...lamps);
  f.slot.setControls(seg, range.el, earthRow);
  f.say("태양의 밝은 표면이에요. <b>어두운 점</b>을 하나 눌러 보세요.");
  f.pips(1);
  api.setCTA("태양을 살펴봐요", { enabled: false });

  function setMode(m: "surf" | "ecl"): void {
    if (mode === m) return;
    mode = m;
    surfBtn.classList.toggle("on", m === "surf");
    eclBtn.classList.toggle("on", m === "ecl");
    surfBtn.setAttribute("aria-pressed", String(m === "surf"));
    eclBtn.setAttribute("aria-pressed", String(m === "ecl"));
    haptic(HAPTIC.select);
    host.dataset.u7Mode = m;
  }
  surfBtn.addEventListener("click", () => setMode("surf"));
  eclBtn.addEventListener("click", () => setMode("ecl"));

  const spotCount = (): number => Math.round(3 + activity * 9);

  function next(): void {
    const n = Number(did.spot) + Number(did.corona) + Number(did.active);
    host.dataset.u7Done = String(n);
    f.pips(1 + Math.min(n, 2));
    if (n === 3 && phase === "play") {
      phase = "wait";
      window.setTimeout(() => !disposed && ask(), 1600);
    }
  }
  const todo = (): string =>
    !did.spot ? " <b>평소의 태양</b>에서 어두운 점을 눌러 보세요." : !did.corona ? " 이제 <b>달이 가렸을 때</b>를 눌러 보세요." : !did.active ? " 가려진 채로 <b>흑점 수</b>를 끝까지 늘려 보세요." : "";

  function ask(): void {
    phase = "ask";
    host.dataset.u7Phase = phase;
    f.pips(3);
    f.say("세 가지를 모두 봤어요. 본 것을 떠올리며 답해 보세요.");
    f.slot.ask(
      "흑점이 <b>많을 때</b> 태양은 어떤 모습이었나요?",
      [{ t: "홍염이 잦고 코로나가 커요", ok: true }, { t: "홍염이 줄고 코로나가 작아요" }, { t: "언제나 같은 모습이에요" }],
      (ok) => api.recordQuiz(ok),
      { why: "흑점이 많을수록 태양의 활동이 활발해요.", onNext: conclude },
    );
  }
  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = phase;
    f.pips(4);
    f.say("흑점 수는 약 11년마다 늘었다 줄었다 해요.");
    f.slot.conclude("흑점이 <b>많을 때</b> 태양은 활발해요. 홍염이 잦고 코로나가 커져요. 그때 지구에서는 <b>오로라</b>가 넓게 나타나고 통신 장애나 정전이 생기기도 해요.");
    if (s.curio) host.appendChild(curioCard(s.curio));
    api.enableCTA(doneCta);
  }

  // 쌀알 무늬(한 번만 굽는다)
  const gran = document.createElement("canvas");
  gran.width = 512;
  gran.height = 512;
  {
    const g = gran.getContext("2d")!;
    const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256);
    grd.addColorStop(0, "#FFD25E");
    grd.addColorStop(0.65, "#FFAE35");
    grd.addColorStop(1, "#F08A1E");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 4;
      g.fillStyle = Math.random() > 0.5 ? "rgba(255,236,180,.32)" : "rgba(214,110,20,.26)";
      g.beginPath();
      g.ellipse(x, y, r, r * 0.8, Math.random() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }

  const spotAt = (i: number, cx: number): [number, number, number] => {
    const sp = SPOTS[i];
    return [cx + Math.cos(sp.a) * sp.d * R, CY + Math.sin(sp.a) * sp.d * R * 0.92, sp.r * 0.95];
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (mode !== "surf" || coverT > 0.1) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const n = spotCount();
    let best = -1;
    let bestD = 1e9;
    for (let i = 0; i < n && i < SPOTS.length; i++) {
      const [sx, sy] = spotAt(i, rect.width / 2);
      const d = Math.hypot(x - sx, y - sy);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best >= 0 && bestD <= 26) {
      tapped = best;
      haptic(HAPTIC.select);
      if (!did.spot) {
        did.spot = true;
        if (phase === "play") f.say(`이 점이 <b>흑점</b>이에요. 주위보다 온도가 낮아 어두워요.${todo()}`);
        next();
      }
    } else if (!did.spot && phase === "play") {
      f.say("밝은 표면이에요. 그 위의 <b>어두운 점</b>을 눌러 보세요.");
    }
  });
  u7Dev(host, { act: (v: number) => { activity = v / 100; range.set(v); } });

  const label = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, align: CanvasTextAlign = "center"): void => {
    ctx.font = "800 13px Pretendard, sans-serif";
    ctx.textAlign = align;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "rgba(6,11,22,.85)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#FFEFC8";
    ctx.fillText(text, x, y);
  };

  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, H);
    const ctx = fit.ctx;
    const W = fit.w;
    const cx = W / 2;

    coverT = clamp(coverT + (mode === "ecl" ? 0.03 : -0.06) * dt, 0, 1);
    const covered = coverT > 0.96;
    const n = spotCount();
    pill.textContent = covered ? "밝은 표면이 가려졌어요" : `흑점 ${n}개`;
    lamps.forEach((l, i) => l.classList.toggle("on", activity >= EARTH[i].at));

    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = `rgba(220,232,255,${0.25 + ((i * 37) % 10) / 22})`;
      ctx.fillRect(((i * 97) % (W - 30)) + 15, ((i * 61) % (H - 30)) + 15, 1.6, 1.6);
    }

    // 코로나: 가려졌을 때만 보인다. 흑점이 많을수록 크다
    if (coverT > 0.5) {
      const k = (coverT - 0.5) * 2;
      const cr = R * (0.22 + activity * 0.42) * k;
      const cg = ctx.createRadialGradient(cx, CY, R * 0.95, cx, CY, R + cr);
      cg.addColorStop(0, `rgba(232,241,255,${0.5 * coverT})`);
      cg.addColorStop(0.5, `rgba(200,218,248,${0.2 * coverT})`);
      cg.addColorStop(1, "rgba(196,214,246,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, CY, R + cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(220,234,255,${0.22 * coverT})`;
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const len = cr * (0.55 + (i % 3) * 0.16);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R * 1.03, CY + Math.sin(a) * R * 1.03);
        ctx.lineTo(cx + Math.cos(a) * (R * 1.03 + len), CY + Math.sin(a) * (R * 1.03 + len));
        ctx.stroke();
      }
    }

    // 광구(쌀알 무늬)와 흑점
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, CY, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, CY);
    ctx.rotate(tMs * 0.000018);
    ctx.drawImage(gran, -R * 1.45, -R * 1.45, R * 2.9, R * 2.9);
    ctx.rotate(-tMs * 0.000018);
    ctx.translate(-cx, -CY);
    for (let i = 0; i < n && i < SPOTS.length; i++) {
      const [sx, sy, rr] = spotAt(i, cx);
      const pg = ctx.createRadialGradient(sx, sy, rr * 0.2, sx, sy, rr * 1.9);
      pg.addColorStop(0, "rgba(52,26,8,.95)");
      pg.addColorStop(0.55, "rgba(112,52,14,.75)");
      pg.addColorStop(1, "rgba(150,80,20,0)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(sx, sy, rr * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 홍염: 가장자리에서 솟는 불꽃. 흑점이 많을수록 잦다
    const promN = Math.round(1 + activity * 5);
    const promA = coverT > 0.5 ? 0.9 : 0.35;
    let promAt: [number, number] | null = null;
    for (let i = 0; i < promN; i++) {
      const a = (i / promN) * Math.PI * 2 + 0.9 + Math.sin(tMs * 0.0004 + i) * 0.05;
      const px = cx + Math.cos(a) * R;
      const py = CY + Math.sin(a) * R;
      const h2 = 8 + (i % 3) * 5 + activity * 8;
      ctx.strokeStyle = `rgba(255,96,60,${promA})`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(px + Math.cos(a + 1.57) * h2 * 0.5, py + Math.sin(a + 1.57) * h2 * 0.5, h2 * 0.62, a + Math.PI * 0.9, a + Math.PI * 2.1);
      ctx.stroke();
      if (i === 0) promAt = [px + Math.cos(a) * (h2 + 8), py + Math.sin(a) * (h2 + 8)];
    }

    // 달(광구를 가린다)과 채층
    if (coverT > 0) {
      const mx = cx + (1 - coverT) * (W * 0.5 + R);
      ctx.fillStyle = "#070B14";
      ctx.beginPath();
      ctx.arc(mx, CY, R * 1.01, 0, Math.PI * 2);
      ctx.fill();
      if (coverT > 0.9) {
        ctx.strokeStyle = `rgba(255,84,54,${(coverT - 0.9) * 9})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(mx, CY, R * 1.02, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 이름표
    if (covered) {
      label(ctx, "코로나", cx - R - 22, CY - R * 0.72, "right");
      label(ctx, "채층", cx - R - 8, CY + R * 0.8, "right");
      if (promAt) label(ctx, "홍염", promAt[0] + 6, promAt[1] + 16, "left");
      label(ctx, "달", cx, CY + 5);
    } else if (coverT < 0.05) {
      if (tapped >= 0 && tapped < n) {
        const [sx, sy, rr] = spotAt(tapped, cx);
        ctx.strokeStyle = "rgba(255,240,200,.95)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(sx, sy, rr * 1.9 + 4, 0, Math.PI * 2);
        ctx.stroke();
        label(ctx, "흑점", sx, sy - rr * 1.9 - 9);
      }
      label(ctx, "태양의 밝은 표면, 광구", cx, CY + R + 22);
    }

    if (covered) {
      coronaMs += dt * 16.7;
      if (coronaMs > 600 && !did.corona) {
        did.corona = true;
        haptic(HAPTIC.ctaUnlock);
        if (phase === "play") f.say(`밝은 표면이 가려지자 <b>채층</b>과 <b>코로나</b>가 드러났어요.${todo()}`);
        next();
      }
    } else coronaMs = 0;
    if (covered && activity > 0.88) {
      activeMs += dt * 16.7;
      if (activeMs > 500 && !did.active) {
        did.active = true;
        haptic(HAPTIC.ctaUnlock);
        if (phase === "play") f.say(`흑점이 늘자 <b>홍염</b>이 잦아지고 <b>코로나</b>가 커졌어요.${todo()}`);
        next();
      }
    } else activeMs = 0;
  });

  const raf = requestAnimationFrame(() => loop.start());
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    loop.stop();
  };
};
