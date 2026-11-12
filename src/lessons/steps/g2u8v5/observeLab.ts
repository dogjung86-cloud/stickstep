// [중2 Ⅷ v5] g2u8l6 observeLab: 「망원경으로 확대하면 무엇이 보일까요?」
// 책의 어디에서: 탐구 '천체 관측 프로그램으로 우리은하를 구성하는 천체 관측하기'(천체를 검색하고, 확대해 관찰하고, 특징을 기록한다).
// 한 통찰: 우리은하에는 별이 모인 무리(듬성듬성한 것, 공 모양으로 빽빽한 것)와 구름처럼 보이는 천체(붉은 것, 파란 것, 검은 것)가 있다.
// 학생이 정하는 것: 어느 천체를 볼지, 확대할지, 관측 기록에 적을 특징. 실패하는 길: 확대하기 전에는 뿌연 점뿐이라 적을 수 없고, 사진과 다른 특징을 고르면 기록되지 않는다.
// 책의 관측 대상 가운데 사진이 없는 것은 같은 종류의 실사로 바꿨다(M45, M13, M8, M78, 말머리성운. 출처 photos/CREDITS.md).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sField, sFrame, sSegs, starPhoto, sText, type LabStep } from "./kit";

type Id = "m45" | "m13" | "m8" | "m78" | "hh";
const OBJ: { k: Id; t: string; file: string; feat: number; at: [number, number]; alt: string }[] = [
  { k: "m45", t: "M45", file: "pleiades.webp", feat: 0, at: [0.2, 0.3], alt: "파란 별들이 듬성듬성 모인 모습" },
  { k: "m13", t: "M13", file: "m13.webp", feat: 1, at: [0.72, 0.24], alt: "수많은 별이 공 모양으로 빽빽하게 모인 모습" },
  { k: "m8", t: "M8", file: "lagoon.webp", feat: 2, at: [0.46, 0.56], alt: "붉게 빛나는 구름 모양의 천체" },
  { k: "m78", t: "M78", file: "m78-reflection.webp", feat: 3, at: [0.84, 0.66], alt: "파랗게 빛나는 구름 모양의 천체" },
  { k: "hh", t: "말머리", file: "horsehead.webp", feat: 4, at: [0.16, 0.74], alt: "붉은 빛 앞에 말 머리 모양으로 검게 보이는 구름" },
];
const FEATS = ["듬성듬성 모인 별", "공 모양으로 빽빽한 별", "붉게 빛나는 구름", "파랗게 빛나는 구름", "검게 보이는 구름"];

export const observeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 5, api });
  const st = sCanvas(f.stage);
  const shot = el("img", { class: "g2u8x-zoom", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  const tag = el("div", { class: "g2u8x-tag" });
  const album = el("div", { class: "g2u8x-album" });
  f.stage.append(shot, tag, album);
  const tm = bvTimers();

  let cur = 0;
  let zoomed = false;
  let finished = false;
  const done = new Set<Id>();

  const bZoom = bvBtn("main", "망원경으로 확대하기");
  const chips = FEATS.map((t, i) => {
    const b = el("button", { class: "g2u8x-chip", text: t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = String(i);
    b.addEventListener("click", () => record(i, b));
    return b;
  });
  const chipBox = el("div", { class: "g2u8x-chips" }, ...chips);
  const seg = sSegs<Id>(
    OBJ.map((o) => ({ k: o.k, t: o.t })),
    "m45",
    (k) => {
      cur = OBJ.findIndex((o) => o.k === k);
      unzoom();
      f.say(`고른 천체: <b>${cur === 4 ? "말머리성운" : OBJ[cur].t}</b>. 지금은 뿌연 점으로만 보여요. <b>확대</b>해 보세요.`);
    },
    true,
  );
  const layout = (): void => f.slot.setControls(seg.el, zoomed ? chipBox : bZoom);
  function unzoom(): void {
    zoomed = false;
    shot.classList.remove("on");
    tag.classList.remove("on");
    layout();
  }
  bZoom.addEventListener("click", () => {
    const o = OBJ[cur];
    haptic(HAPTIC.tap);
    zoomed = true;
    shot.src = starPhoto(o.file);
    shot.alt = o.alt;
    shot.classList.add("on");
    tag.textContent = cur === 4 ? "말머리성운" : o.t;
    tag.classList.add("on");
    chips.forEach((c) => c.classList.remove("miss"));
    layout();
    f.say(done.has(o.k) ? "이미 기록한 천체예요. <b>다른 천체</b>를 골라 보세요." : "확대한 사진이에요. 관측 기록에 적을 <b>특징</b>을 아래에서 골라 보세요.");
  });
  function record(i: number, b: HTMLButtonElement): void {
    const o = OBJ[cur];
    if (finished || done.has(o.k)) return;
    if (i !== o.feat) {
      haptic(HAPTIC.wrong);
      b.classList.add("miss");
      f.say("사진과 맞지 않는 특징이에요. 별이 보이는지, 구름처럼 보이는지, <b>색</b>은 어떤지 다시 살펴보세요.");
      return;
    }
    haptic(HAPTIC.correct);
    done.add(o.k);
    seg.btn(o.k).classList.add("done");
    f.pips(done.size);
    if (done.size < 5) f.say(`관측 기록에 적었어요. <b>${FEATS[i]}</b>. 남은 천체도 확대해 기록해 보세요.`);
    else {
      finished = true;
      f.say("다섯 천체를 모두 기록했어요. 관측 기록을 한눈에 볼까요?");
      tm.later(() => {
        unzoom();
        album.replaceChildren(
          ...OBJ.map((x) =>
            el("div", { class: "g2u8x-album-it" }, el("img", { attrs: { src: starPhoto(x.file), alt: x.alt, draggable: "false" } }), el("b", { text: x.k === "hh" ? "말머리성운" : x.t }), el("span", { text: FEATS[x.feat] })),
          ),
        );
        album.classList.add("on");
        seg.lock(true);
        askFinal();
      }, 1500);
    }
  }

  function askFinal(): void {
    f.say("관측 기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "수많은 별이 공 모양으로 빽빽하게 모인 천체는?",
      [{ t: "M13", ok: true }, { t: "M45" }, { t: "M78" }],
      (ok) => api.recordQuiz(ok),
      { why: "M45는 별이 듬성듬성하고, M78은 파란 구름이에요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("우리은하에는 <b>별이 모인 무리</b>와 <b>구름처럼 보이는 천체</b>가 있어요. 별 무리는 듬성듬성한 것과 공 모양으로 빽빽한 것, 구름은 붉은 것, 파란 것, 검은 것이 있어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t) => {
    sField(ctx, 0, 0, w, h, 90, 5, 0.75);
    OBJ.forEach((o, i) => {
      const x = o.at[0] * w;
      const y = o.at[1] * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
      g.addColorStop(0, "rgba(220,230,255,.75)");
      g.addColorStop(1, "rgba(220,230,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 10, y - 10, 20, 20);
      if (i === cur) {
        ctx.strokeStyle = S.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 15 + Math.sin(t / 300) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (done.has(o.k)) sDisk(ctx, x + 13, y - 13, 4, S.ok);
      sText(ctx, o.k === "hh" ? "말머리성운" : o.t, x, y + 24, { color: i === cur ? S.gold : S.dim, px: 12 });
    });
  });

  layout();
  f.say("오늘 밤 하늘에서 찾은 천체 다섯 개예요. 뿌연 점으로만 보여요. 하나씩 <b>확대</b>해서 특징을 기록해 보세요.");
  api.setCTA("다섯 천체를 관측해 기록해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
