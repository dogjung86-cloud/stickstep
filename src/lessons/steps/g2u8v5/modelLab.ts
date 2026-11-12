// [중2 Ⅷ v5] g2u8l5 modelLab: 「어떤 모형을 찍어야 은하수처럼 보일까요?」
// 책의 어디에서: 해 보기 '우리은하에 속한 별의 분포 예상하기'(철사에 스타이로폼 공을 끼워 우드록에 꽂는다. 철사 길이가 같은 모형과 다른 모형을 만들어 검은 우드록 앞에서 찍는다).
// 한 통찰: 공(별)이 한 층에 납작하게 모여 있는 모형을 옆에서 찍어야 은하수처럼 띠로 보인다.
// 학생이 정하는 것: 철사의 길이(같게, 다르게), 찍는 자리(앞, 위). 실패하는 길: 위에서 찍으면 두 모형이 똑같이 흩어져 보여 가릴 수 없다.
// 사진은 같은 공의 자리에서 계산한다(앞에서는 가로와 높이, 위에서는 가로와 깊이).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { rnd, S, sBox, sCanvas, sDisk, sFrame, sLine, sLog, sPhoto, sSegs, sText, type LabStep } from "./kit";

type Wire = "same" | "diff";
type Cam = "front" | "top";
const N = 14;
const BALLS = Array.from({ length: N }, (_, i) => ({ x: rnd(i * 2.3 + 1) * 2 - 1, z: rnd(i * 4.1 + 7) * 2 - 1, h: 0.18 + rnd(i * 6.7 + 3) * 0.8 }));

export const modelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 4, api });
  f.stage.appendChild(sPhoto("g2u8x-mw", "milkyway-pan.webp", "밤하늘을 가로지르는 은하수"));
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let wire: Wire = "same";
  let hk = 0; // 철사 길이가 다른 정도(0 같게, 1 다르게)
  let shot: { wire: Wire; cam: Cam } | null = null;
  let flash = 0;
  let finished = false;
  const done = new Set<string>();
  const log = sLog(["같은 길이, 앞", "같은 길이, 위", "다른 길이, 앞", "다른 길이, 위"], 2, true);
  const idx = (w: Wire, c: Cam): number => (w === "same" ? 0 : 2) + (c === "front" ? 0 : 1);

  const wireSeg = sSegs<Wire>(
    [
      { k: "same", t: "철사 길이 같게" },
      { k: "diff", t: "철사 길이 다르게" },
    ],
    "same",
    (k) => {
      wire = k;
      shot = null;
      camSeg.set(null);
      f.say(k === "same" ? "철사의 길이를 <b>모두 같게</b> 잘라 공을 끼웠어요. 어디에서 찍을까요?" : "철사의 길이를 <b>서로 다르게</b> 잘라 공을 끼웠어요. 어디에서 찍을까요?");
    },
  );
  const camSeg = sSegs<Cam>(
    [
      { k: "front", t: "앞에서 찍기" },
      { k: "top", t: "위에서 찍기" },
    ],
    null,
    (c) => {
      if (finished) return;
      shot = { wire, cam: c };
      flash = 1;
      haptic(HAPTIC.tap);
      const band = wire === "same" && c === "front";
      done.add(`${wire}${c}`);
      log.set(idx(wire, c), band ? "한 줄 띠" : "흩어짐");
      f.pips(done.size);
      if (c === "top") f.say("위에서 찍으니 공들이 <b>흩어져</b> 보여요. 두 모형이 똑같이 보여 가릴 수 없어요.");
      else if (band) f.say("공들이 <b>한 줄로 겹쳐</b> 띠처럼 찍혔어요. 아래의 실제 은하수와 견주어 보세요.");
      else f.say("공들이 위아래로 <b>흩어져</b> 찍혔어요. 띠 모양이 아니에요.");
      if (done.size === 4) {
        finished = true;
        tm.later(() => {
          wireSeg.lock(true);
          camSeg.lock(true);
          askFinal();
        }, 1600);
      }
    },
    true,
  );
  f.slot.setControls(wireSeg.el, camSeg.el, log.el);

  function askFinal(): void {
    f.say("네 장의 사진을 떠올리며 아래 질문에 답해 보세요.");
    f.slot.ask(
      "은하수처럼 띠 모양으로 찍힌 사진은?",
      [{ t: "같은 길이 모형을 앞에서", ok: true }, { t: "다른 길이 모형을 앞에서" }, { t: "같은 길이 모형을 위에서" }],
      (ok) => api.recordQuiz(ok),
      { why: "공이 <b>한 층에 납작하게</b> 모여 있어 옆에서 보면 겹쳐요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("은하수가 띠로 보이는 것은 우리은하의 별들이 <b>납작한 원반 모양</b>으로 모여 있고, 우리가 그 안에서 옆으로 보기 때문이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    hk += ((wire === "diff" ? 1 : 0) - hk) * Math.min(1, dt * 0.2);
    if (flash > 0) flash = Math.max(0, flash - dt / 24);
    const height = (b: (typeof BALLS)[number]): number => 0.6 + (b.h - 0.6) * hk;
    // 모형(비스듬히 내려다본 모습)
    const ox = 104;
    const oy = h - 44;
    const P = (x: number, z: number, y: number): [number, number] => [ox + x * 66 + z * 26, oy - z * 20 - y * 88];
    ctx.beginPath();
    [
      [-1.15, -1.15],
      [1.15, -1.15],
      [1.15, 1.15],
      [-1.15, 1.15],
    ].forEach(([x, z], i) => {
      const p = P(x, z, 0);
      if (i) ctx.lineTo(p[0], p[1]);
      else ctx.moveTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.fillStyle = "#CDBE98";
    ctx.fill();
    ctx.strokeStyle = "#8A7446";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    [...BALLS]
      .sort((a, b) => b.z - a.z)
      .forEach((b) => {
        const foot = P(b.x, b.z, 0);
        const top = P(b.x, b.z, height(b));
        sLine(ctx, foot[0], foot[1], top[0], top[1], "#AEB6C4", 1.4);
        sDisk(ctx, top[0], top[1], 6, "#F5F7FA", "#8D97A8", 1);
      });
    sText(ctx, "우드록에 꽂은 철사와 공", ox + 10, h - 12, { color: S.dim, px: 12 });
    // 사진기 자리
    if (shot) {
      const c = shot.cam === "front" ? P(0, -2.3, 0.5) : P(0.2, 0, 1.75);
      sBox(ctx, c[0] - 13, c[1] - 9, 26, 18, 4, "#3A455C", "#fff", 1.2);
      sDisk(ctx, c[0], c[1], 5, "#8FB4FF");
    }
    // 찍은 사진
    const fx = w - 128;
    const fy = 26;
    sText(ctx, "찍은 사진", fx + 58, 13, { color: S.ink, px: 12 });
    sBox(ctx, fx, fy, 116, 76, 6, "#02040A", flash > 0 ? "#fff" : "rgba(255,255,255,.35)", flash > 0 ? 3 : 1.2);
    if (shot) {
      BALLS.forEach((b) => {
        const hh = shot!.wire === "same" ? 0.6 : b.h;
        const x = fx + 58 + b.x * 48;
        const y = shot!.cam === "front" ? fy + 66 - hh * 58 : fy + 38 - b.z * 30;
        sDisk(ctx, x, y, 3.2, "#fff");
      });
    } else sText(ctx, "아직 찍지 않았어요", fx + 58, fy + 38, { color: S.dim, px: 12 });
    sText(ctx, "실제 은하수", fx + 58, 121, { color: S.ink, px: 12 });
  });

  f.say("스타이로폼 공을 별이라고 해요. <b>철사의 길이</b>와 <b>찍는 자리</b>를 정해 검은 배경 앞에서 사진을 찍어 보세요.");
  api.setCTA("두 모형을 앞과 위에서 찍어 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
