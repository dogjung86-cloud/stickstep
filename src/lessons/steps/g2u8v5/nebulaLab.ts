// [중2 Ⅷ v5] g2u8l6 nebulaLab: 「같은 구름이 왜 다르게 보일까요?」
// 다루는 내용: 본문(방출 성운은 주변의 별빛에 가열되어 스스로 빛을 내고, 반사 성운은 주변의 별빛을 반사하며, 암흑 성운은 뒤쪽에서 오는 별빛을 가로막는다).
// 한 통찰: 가스와 티끌의 구름은 곁에 무엇이 있느냐에 따라 다르게 보인다. 곁의 별이 가스를 달굴 만큼 아주 뜨거우면 가스가 스스로 붉게 빛나고(방출),
//          그만큼 뜨겁지 않으면 티끌이 별빛을 반사해 파랗게 보이고(반사), 곁에 별이 없으면 뒤에서 오는 빛을 가로막아 검게 보인다(암흑).
// 학생이 정하는 것: 구름 곁에 무엇이 있을지(아주 뜨거운 별, 덜 뜨거운 별, 별 없이 뒤의 밝은 빛).
// 가르는 것은 별의 자리가 아니라 곁에 있는 별의 종류다. 그래서 앞의 두 장면은 별을 같은 자리에 두고 별의 색과 크기만 달리 그린다
// (아주 뜨거운 별은 크고 푸르게, 덜 뜨거운 별은 작고 희게. 반사 성운을 비추는 별도 흰빛이 도는 뜨거운 별이라 붉게 그리지 않는다).
// 실사: 라군 성운(ESO), M78(ESO), 말머리성운. 같은 모습의 실제 천체를 무대 오른쪽에 보여 준다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { rnd, S, sCanvas, sFrame, sLog, sSegs, starPhoto, sText, type LabStep } from "./kit";

type Mode = "hot" | "cool" | "none";
const REAL: Record<Mode, { file: string; name: string; alt: string }> = {
  hot: { file: "lagoon.webp", name: "라군 성운", alt: "붉게 빛나는 성운" },
  cool: { file: "m78-reflection.webp", name: "M78", alt: "파랗게 빛나는 성운" },
  none: { file: "horsehead.webp", name: "말머리성운", alt: "검게 보이는 성운" },
};

export const nebulaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api, tall: true });
  const st = sCanvas(f.stage);
  const pic = el("img", { class: "g2u8x-real", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  f.stage.appendChild(pic);
  const tm = bvTimers();

  let mode: Mode | null = null;
  let k = 0; // 장면이 바뀐 정도(0에서 1로)
  let finished = false;
  const log = sLog(["아주 뜨거운 별이 곁에", "덜 뜨거운 별이 곁에", "별 없이 뒤에 밝은 빛"], 1, true);
  /** 무대를 그 장면으로 바꾼다(기록은 건드리지 않는다). */
  const show = (m: Mode): void => {
    mode = m;
    k = 0;
    pic.src = starPhoto(REAL[m].file);
    pic.alt = REAL[m].alt;
    pic.classList.add("on");
  };
  const seg = sSegs<Mode>(
    [
      { k: "hot", t: "주변에 아주 뜨거운 별" },
      { k: "cool", t: "주변에 덜 뜨거운 별" },
      { k: "none", t: "뒤쪽에 밝은 별빛" },
    ],
    null,
    (m) => {
      show(m);
      haptic(HAPTIC.tap);
      if (m === "hot") {
        log.set(0, "스스로 붉게 빛남");
        f.say("구름 가까이 <b>아주 뜨거운 별</b>이 있으면, 성간 물질(가스)이 강한 별빛에 가열되어 <b>스스로 붉은 빛</b>을 내요(방출 성운)!");
      } else if (m === "cool") {
        log.set(1, "별빛을 반사해 파랗게");
        f.say("구름 가까이 가스를 달굴 만큼 뜨겁지 않은 <b>별</b>이 있으면, 티끌이 그 별빛을 <b>반사하여 파랗게</b> 보여요(반사 성운)!");
      } else {
        log.set(2, "뒤의 빛을 가려 검게");
        f.say("가까이에 비추는 별이 없고 <b>뒤쪽에서 밝은 빛</b>이 오면, 짙은 구름이 <b>뒤쪽의 별빛을 가로막아</b> 검은 그림자처럼 보여요(암흑 성운)!");
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
  seg.el.classList.add("wrap"); // 이름이 긴 세 칸이라 13px 두 줄까지 쓴다(한 줄로 두면 칸이 글만큼 넓어져 줄이 조작 칸 밖으로 나간다)
  f.slot.setControls(seg.el, log.el);

  function askFinal(): void {
    // 판정은 검게 보인 구름을 묻는다. 무대를 그 장면으로 되돌려 놓고 묻는다.
    if (mode !== "none") {
      show("none");
      seg.set("none");
    }
    f.say("세 가지 조건에서 가스와 티끌 구름이 어떻게 다르게 보이는지 모두 비교했어요!");
    // 정답 보기는 오답 카드의 정답 줄에 한 줄로 들어가는 길이로 둔다(두 줄이면 오답 화면이 조작 칸 208을 넘는다)
    f.slot.ask(
      "말머리성운처럼 검게 보이는 성운에서 뒤쪽의 별빛이 우리 눈에 도달하지 못하는 까닭은 무엇인가요?",
      [{ t: "빽빽한 가스와 티끌 구름이 별빛을 가로막아서", ok: true }, { t: "구름 뒤쪽에 있는 별들이 빛을 전혀 내지 않아서" }, { t: "검은 구름이 뒤쪽의 별들을 모두 삼켜 없애 버려서" }],
      (ok) => api.recordQuiz(ok),
      { why: "검게 보이는 곳 뒤에도 별과 밝은 성운이 있지만, 앞쪽의 성간 물질(가스와 티끌)이 별빛을 <b>가로막아 가렸기</b> 때문이에요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("성간 물질이 모인 성운은 주변 별빛과의 관계에 따라 방출·반사·암흑 성운으로 다르게 보인다는 것을 확인했어요!");
    f.slot.conclude("가스와 티끌의 구름은 곁에 무엇이 있느냐에 따라 달라 보여요. <b>아주 뜨거운 별</b>에 달궈지면 스스로 붉게 빛나고, 덜 뜨거운 별의 빛을 <b>반사하면 파랗게</b>, 뒤의 빛을 <b>가로막으면 검게</b> 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // 구름의 모양(부드러운 덩어리 여러 개)
  const BLOBS = Array.from({ length: 9 }, (_, i) => ({ x: (rnd(i * 3.3) - 0.5) * 120, y: (rnd(i * 5.1 + 2) - 0.5) * 70, r: 34 + rnd(i * 7.9) * 26 }));
  st.run((ctx, w, h, t, dt) => {
    k = Math.min(1, k + dt / 40);
    const cx = (w - 110) / 2 + 4;
    const cy = h / 2 + 6;
    // 앞의 두 장면에서 별이 서는 자리(같은 자리)
    const sx = cx - 16;
    const sy = cy - 4;
    // 암흑 장면: 구름 뒤의 밝은 빛(붉게 빛나는 성운과 촘촘한 별밭)
    if (mode === "none") {
      const back = ctx.createRadialGradient(cx + 20, cy - 4, 6, cx + 16, cy, 175);
      back.addColorStop(0, `rgba(255,128,150,${0.62 * k})`);
      back.addColorStop(0.5, `rgba(214,74,110,${0.34 * k})`);
      back.addColorStop(1, "rgba(214,74,110,0)");
      ctx.fillStyle = back;
      ctx.fillRect(0, 0, w, h);
    }
    // 뒤의 별밭(암흑 장면은 더 촘촘하다)
    const nStar = mode === "none" ? 190 : 110;
    for (let i = 0; i < nStar; i++) {
      const x = rnd(i * 2.1 + 9) * (w - 108);
      const y = rnd(i * 4.7 + 5) * h;
      ctx.globalAlpha = 0.35 + rnd(i) * 0.6;
      ctx.fillStyle = "#DCE6FF";
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + rnd(i * 9.1) * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 구름: 아주 뜨거운 별 곁이면 붉게, 덜 뜨거운 별 곁이면 파랗게(별 가까이가 더 밝다), 뒤에 빛만 있으면 검게 가린다
    const tone = mode === "hot" ? [236, 86, 110] : mode === "cool" ? [110, 160, 255] : mode === "none" ? [5, 7, 14] : [70, 78, 104];
    BLOBS.forEach((b) => {
      const bx = cx + b.x;
      const by = cy + b.y;
      let a = 0.2;
      if (mode === "none") a = 0.55 + 0.42 * k;
      else if (mode) {
        // 별에서 가까운 덩어리일수록 더 밝다
        const near = Math.max(0, 1 - Math.hypot(bx - sx, by - sy) / 110);
        a = 0.1 + (0.12 + 0.34 * near) * k;
      }
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
      g.addColorStop(0, `rgba(${tone.join(",")},${a})`);
      if (mode === "none") g.addColorStop(0.62, `rgba(${tone.join(",")},${a * 0.92})`); // 검은 구름은 가장자리까지 진하게(뒤의 빛을 또렷이 가린다)
      g.addColorStop(1, `rgba(${tone.join(",")},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(bx - b.r, by - b.r, b.r * 2, b.r * 2);
    });
    if (mode === "hot" || mode === "cool") {
      // 별 곁의 빛무리(구름이 별 가까이에서 가장 밝다)
      const glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, 62);
      const c = mode === "hot" ? "255,110,130" : "150,190,255";
      glow.addColorStop(0, `rgba(${c},${0.42 * k})`);
      glow.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(sx - 62, sy - 62, 124, 124);
      // 같은 자리의 별: 아주 뜨거운 별은 크고 푸르게(청색), 덜 뜨거운 별은 작고 희게(백색)
      const star = (r: number, glow: string, core: string, cr: number): void => {
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        sg.addColorStop(0, `rgba(${glow},.95)`);
        sg.addColorStop(0.3, `rgba(${glow},.5)`);
        sg.addColorStop(1, `rgba(${glow},0)`);
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(sx, sy, cr, 0, Math.PI * 2);
        ctx.fill();
      };
      if (mode === "hot") {
        star(24 + Math.sin(t / 300), "110,160,255", "#CFE0FF", 7.5);
        sText(ctx, "아주 뜨거운 별", sx, sy + 30, { color: "#fff", px: 12 });
      } else {
        star(12, "255,255,255", "#FFFFFF", 4);
        sText(ctx, "덜 뜨거운 별", sx, sy + 22, { color: "#fff", px: 12 });
      }
    } else if (mode === "none") {
      sText(ctx, "뒤의 빛을 가로막아요", cx - 4, cy + 4, { color: "rgba(232,238,249,.8)", px: 12 });
    } else sText(ctx, "가스와 티끌의 구름", cx, cy, { color: S.ink, px: 12.5 });
    // 오른쪽: 같은 모습의 실제 천체
    sText(ctx, mode ? `실제 사진: ${REAL[mode].name}` : "실제 사진", w - 8, 16, { color: S.ink, px: 12, align: "right" });
  });

  f.say("가스와 티끌이 모인 <b>구름</b>이에요. 구름 <b>곁에 무엇이 있을지</b> 골라 구름이 어떻게 보이는지 살펴보세요.");
  api.setCTA("구름 곁을 세 가지로 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
