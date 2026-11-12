// [중2 Ⅷ v5] g2u8l6 nebulaLab: 「같은 구름이 왜 다르게 보일까요?」
// 책의 어디에서: 본문(방출 성운은 주변의 별빛에 가열되어 스스로 빛을 내고, 반사 성운은 주변의 별빛을 반사하며, 암흑 성운은 뒤쪽에서 오는 별빛을 가로막는다).
// 한 통찰: 가스와 티끌의 구름은 둘레의 별이 어디에 있느냐에 따라 붉게 빛나거나, 파랗게 비치거나, 검게 가린다.
// 학생이 정하는 것: 구름 둘레의 별을 어디에 둘지(구름 속의 아주 뜨거운 별, 구름 옆의 별, 구름 뒤의 별들).
// 실사: 라군 성운(ESO), M78(ESO), 말머리성운. 같은 모습의 실제 천체를 무대 오른쪽에 보여 준다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { rnd, S, sCanvas, sFrame, sGlow, sLine, sLog, sSegs, starPhoto, sText, type LabStep } from "./kit";

type Mode = "in" | "side" | "back";
const REAL: Record<Mode, { file: string; name: string; alt: string }> = {
  in: { file: "lagoon.webp", name: "라군 성운", alt: "붉게 빛나는 성운" },
  side: { file: "m78-reflection.webp", name: "M78", alt: "파랗게 빛나는 성운" },
  back: { file: "horsehead.webp", name: "말머리성운", alt: "검게 보이는 성운" },
};

export const nebulaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const pic = el("img", { class: "g2u8x-real", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  f.stage.appendChild(pic);
  const tm = bvTimers();

  let mode: Mode | null = null;
  let k = 0; // 장면이 바뀐 정도(0에서 1로)
  let finished = false;
  const log = sLog(["별이 구름 속", "별이 구름 옆", "별이 구름 뒤"], 1, true);
  const seg = sSegs<Mode>(
    [
      { k: "in", t: "별이 구름 속" },
      { k: "side", t: "별이 구름 옆" },
      { k: "back", t: "별이 구름 뒤" },
    ],
    null,
    (m) => {
      mode = m;
      k = 0;
      haptic(HAPTIC.tap);
      pic.src = starPhoto(REAL[m].file);
      pic.alt = REAL[m].alt;
      pic.classList.add("on");
      if (m === "in") {
        log.set(0, "스스로 붉게 빛남");
        f.say("<b>아주 뜨거운 별</b>이 구름 속에 있어요. 구름의 가스가 별빛에 달궈져 <b>스스로 붉게</b> 빛나요.");
      } else if (m === "side") {
        log.set(1, "별빛을 반사해 파랗게");
        f.say("별이 구름 <b>옆</b>에 있어요. 구름의 티끌이 별빛을 <b>반사해</b> 파랗게 보여요.");
      } else {
        log.set(2, "뒤의 별빛을 가려 검게");
        f.say("가까이에 별이 없어요. 구름이 <b>뒤에서 오는 별빛을 가로막아</b> 검게 보여요.");
      }
      const n = [0, 1, 2].filter((i) => log.has(i)).length;
      f.pips(n);
      if (n === 3 && !finished) {
        finished = true;
        tm.later(() => {
          seg.lock(true);
          askFinal();
        }, 2000);
      }
    },
  );
  f.slot.setControls(seg.el, log.el);

  function askFinal(): void {
    f.say("세 장면을 떠올리며 아래 질문에 답해 보세요.");
    f.slot.ask(
      "구름 뒤의 별빛이 우리에게 오지 못한 까닭은?",
      [{ t: "구름이 별빛을 가로막아서", ok: true }, { t: "뒤의 별이 빛을 내지 않아서" }, { t: "구름이 별을 삼켜 버려서" }],
      (ok) => api.recordQuiz(ok),
      { why: "구름 뒤에도 별은 있어요. 가스와 티끌이 빛을 <b>가렸어요</b>.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("탐험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("가스와 티끌이 모인 구름은 둘레의 별에 따라 다르게 보여요. 별빛에 달궈지면 <b>스스로 붉게</b> 빛나고, 별빛을 <b>반사하면 파랗게</b>, 뒤의 별빛을 <b>가로막으면 검게</b> 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // 구름의 모양(부드러운 덩어리 여러 개)
  const BLOBS = Array.from({ length: 9 }, (_, i) => ({ x: (rnd(i * 3.3) - 0.5) * 120, y: (rnd(i * 5.1 + 2) - 0.5) * 70, r: 34 + rnd(i * 7.9) * 26 }));
  st.run((ctx, w, h, t, dt) => {
    k = Math.min(1, k + dt / 40);
    const cx = (w - 110) / 2 + 4;
    const cy = h / 2 + 6;
    // 뒤의 별밭
    for (let i = 0; i < 110; i++) {
      const x = rnd(i * 2.1 + 9) * (w - 108);
      const y = rnd(i * 4.7 + 5) * h;
      ctx.globalAlpha = 0.35 + rnd(i) * 0.6;
      ctx.fillStyle = "#DCE6FF";
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + rnd(i * 9.1) * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 구름
    const tone = mode === "in" ? [236, 86, 110] : mode === "side" ? [110, 160, 255] : mode === "back" ? [6, 8, 16] : [70, 78, 104];
    const alpha = mode === "back" ? 0.5 + 0.45 * k : mode ? 0.16 + 0.2 * k : 0.2;
    BLOBS.forEach((b) => {
      const g = ctx.createRadialGradient(cx + b.x, cy + b.y, 0, cx + b.x, cy + b.y, b.r);
      g.addColorStop(0, `rgba(${tone.join(",")},${alpha})`);
      g.addColorStop(1, `rgba(${tone.join(",")},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(cx + b.x - b.r, cy + b.y - b.r, b.r * 2, b.r * 2);
    });
    if (mode === "in") {
      sGlow(ctx, cx, cy, 14 + Math.sin(t / 300), S.hot, 0.36);
      sText(ctx, "아주 뜨거운 별", cx, cy + 26, { color: "#fff", px: 12 });
    } else if (mode === "side") {
      const sx = cx - 96;
      sGlow(ctx, sx, cy - 30, 13, "#EAF1FF", 0.36);
      sText(ctx, "별", sx, cy - 8, { color: "#fff", px: 12 });
      for (let i = 0; i < 3; i++) sLine(ctx, sx + 14, cy - 28 + i * 6, cx - 40, cy - 14 + i * 14, "rgba(170,200,255,.5)", 1.2, [4, 5]);
    } else if (mode === "back") {
      sText(ctx, "뒤의 별빛이 가려져요", cx, cy, { color: "rgba(232,238,249,.75)", px: 12 });
    } else sText(ctx, "가스와 티끌의 구름", cx, cy, { color: S.ink, px: 12.5 });
    // 오른쪽: 같은 모습의 실제 천체
    sText(ctx, mode ? `실제 사진: ${REAL[mode].name}` : "실제 사진", w - 58, 16, { color: S.ink, px: 12 });
  });

  f.say("가스와 티끌이 모인 <b>구름</b>이에요. 구름 둘레의 <b>별을 어디에 둘지</b> 골라 구름이 어떻게 보이는지 살펴보세요.");
  api.setCTA("별의 자리를 세 가지로 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
