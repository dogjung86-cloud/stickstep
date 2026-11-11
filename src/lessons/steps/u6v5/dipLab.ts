// u6DipLab (u6l4 첫 랩): 「뜨거운 물과 얼음물, 피스톤은?」
// 나온 곳: 탐구 1 "온도에 따른 기체의 부피 변화 관찰하기"(피스톤을 중간쯤에 두고 끝을 마개로 막은 주사기를 뜨거운 물과 얼음물에 각각 넣어 피스톤을 본다).
// 학생이 정하는 것: 마개를 막을지, 주사기를 어디에 넣을지(뜨거운 물, 실험대, 얼음물). 차례는 정해 주지 않는다.
// 실패하는 길: 마개를 막지 않고 담그면 열린 끝으로 공기가 드나들어 피스톤이 움직이지 않는다(뜨거운 물에서는 공기 방울이 빠져나간다).
// 처음에 예측을 건다(정오를 매기지 않는다). 판정: 얼음물에서 피스톤이 내려간 까닭.
// 값은 정본과 같다: 20 ℃ 30.0 mL, 뜨거운 물 80 ℃ 36.0 mL, 얼음물 0 ℃ 28.0 mL(10 ℃마다 1.0 mL).
// 옛 판(물중탕 주사기의 온도 막대 하나)과 다른 점: 비커 둘에 직접 넣어 보는 관찰 실험이고, 마개를 잊으면 실패한다. 재는 일은 다음 랩으로 나눴다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, txt, pill, ease, noteRow } from "./u6Kit";
import { vSyringe, beaker, volOf } from "./syringe";

type Place = "hot" | "table" | "ice";
const X: Record<Place, number> = { hot: 62, table: 173, ice: 284 };
const T: Record<Place, number> = { hot: 80, table: 20, ice: 0 };
const NAME: Record<Place, string> = { hot: "뜨거운 물", table: "실험대", ice: "얼음물" };
const BOT = 196;

export const dipLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-dip", label: "뜨거운 물과 얼음물에 넣어 보는 주사기", wait: "주사기를 물에 넣어 보세요" });
  const { frame, tm } = lab;
  const syr = vSyringe(12, 2.6, 16);
  let place: Place = "table";
  let capped = false;
  let cx = X.table;
  let temp = 20; // 주사기 속 기체의 온도
  let vol = 30; // 그림 속 부피
  let phase: "predict" | "play" | "ask" | "done" = "predict";
  const seen = new Set<Place>();
  let failed = false;

  const cap = bvBtn("main", "주사기 끝을 마개로 막기");
  const cards = {
    hot: bvCard("u6x-end", { name: "뜨거운 물", sub: "80 ℃", key: "hot" }),
    table: bvCard("u6x-end", { name: "실험대", sub: "20 ℃", key: "table" }),
    ice: bvCard("u6x-end", { name: "얼음물", sub: "0 ℃", key: "ice" }),
  };
  const note = noteRow();
  const sync = (): void => {
    (Object.keys(cards) as Place[]).forEach((k) => cards[k].on(place === k));
    cap.textContent = capped ? "마개를 막았어요" : "주사기 끝을 마개로 막기";
    cap.disabled = capped;
    note.set(`주사기는 <b>${NAME[place]}</b>에`, capped ? "끝을 <b>막았어요</b>" : "끝이 <b>열려</b> 있어요");
    host.dataset.u6Place = place;
    host.dataset.u6Cap = capped ? "1" : "0";
  };
  cap.addEventListener("click", () => {
    if (phase !== "play" || capped) return;
    if (place !== "table") {
      haptic(HAPTIC.wrong);
      frame.say("물속에서는 막을 수 없어요. 먼저 주사기를 <b>실험대</b>로 꺼내요.");
      return;
    }
    capped = true;
    haptic(HAPTIC.select);
    frame.pips(1);
    frame.say("끝을 막아 공기가 갇혔어요. 이제 <b>뜨거운 물</b>과 <b>얼음물</b>에 넣어 보세요.");
    sync();
  });
  (Object.keys(cards) as Place[]).forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (phase !== "play" || place === k) return;
      place = k;
      haptic(HAPTIC.tap);
      if (!capped && k !== "table" && !failed) {
        failed = true;
        frame.say("끝이 열려 있어 공기가 <b>드나들어요</b>. 피스톤이 그대로예요. 꺼내서 <b>마개</b>를 막아요.");
      }
      sync();
    }),
  );

  const ask = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(2);
    frame.say("뜨거운 물에서는 36.0 mL, 얼음물에서는 28.0 mL였어요.");
    frame.slot.ask(
      "얼음물에서 피스톤이 <b>내려간</b> 까닭은 무엇일까요?",
      [{ t: "속 기체가 식어 부피가 줄어서", ok: true }, { t: "속 기체가 밖으로 빠져나가서" }, { t: "얼음물이 피스톤을 눌러서" }],
      (ok) => lab.grade(ok),
      {
        why: "마개를 막아 입자 수는 그대로예요. 식으면 부피가 줄어요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("피스톤은 속 기체의 부피만큼 움직여요.");
          frame.slot.conclude("끝을 막은 주사기 속 기체는 따뜻해지면 부피가 <b>늘고</b>, 차가워지면 부피가 <b>줄어요</b>. 얼마나 달라지는지는 다음 실험에서 재 봐요.");
          api.enableCTA(s.cta ?? "부피 재러 가기");
        },
      },
    );
  };

  const start = (): void => {
    phase = "play";
    lab.phase("play");
    api.setCTA("주사기를 물에 넣어 보세요", { enabled: false });
    frame.say("실험으로 확인해요. 주사기의 <b>끝을 막고</b> 뜨거운 물과 얼음물에 넣어 보세요.");
    frame.slot.setControls(cap, bvCards(3, cards.hot, cards.table, cards.ice), note.el);
    sync();
  };

  lab.phase("predict");
  frame.say("주사기의 피스톤을 중간쯤에 두었어요. 실험하기 전에 먼저 예측해 봐요.");
  frame.slot.ask("끝을 막은 주사기를 <b>뜨거운 물</b>에 넣으면 피스톤은?", [{ t: "밀려 올라가요" }, { t: "그대로 있어요" }, { t: "내려가요" }], () => undefined, { predict: true, onNext: start, nextDelay: 700 });

  lab.run((ctx, dt, tMs) => {
    cx = ease(cx, X[place], 0.16, dt);
    const arrived = Math.abs(cx - X[place]) < 2;
    // 속 기체의 온도는 넣은 곳의 온도를 뒤따라간다. 끝이 열려 있으면 부피는 그대로다(공기가 드나든다).
    if (arrived) temp = ease(temp, T[place], 0.045, dt);
    vol = capped ? volOf(temp) : 30;
    if (phase === "play" && capped && arrived && Math.abs(temp - T[place]) < 1 && place !== "table" && !seen.has(place)) {
      seen.add(place);
      haptic(HAPTIC.select);
      if (seen.size === 2) {
        api.setCTA("피스톤을 살펴보고 있어요", { enabled: false });
        frame.say("뜨거운 물에서는 <b>올라가고</b> 얼음물에서는 <b>내려갔어요</b>.");
        phase = "ask";
        tm.later(ask, 1500);
      } else if (place === "hot") frame.say("피스톤이 <b>밀려 올라갔어요</b>. 이번에는 <b>얼음물</b>에 넣어 보세요.");
      else frame.say("피스톤이 <b>내려갔어요</b>. 이번에는 <b>뜨거운 물</b>에 넣어 보세요.");
    }

    // 실험대와 비커 둘
    ctx.fillStyle = "#2A3A55";
    ctx.fillRect(126, BOT + 10, 94, 6);
    beaker(ctx, 16, 78, 92, BOT + 12, 80, tMs);
    beaker(ctx, 238, 78, 92, BOT + 12, 0, tMs);
    txt(ctx, "뜨거운 물", 62, 222, { align: "center", color: "#FFB37A" });
    txt(ctx, "실험대", 173, 222, { align: "center", color: "#9FB2D0" });
    txt(ctx, "얼음물", 284, 222, { align: "center", color: "#8FC5FF" });
    syr.draw(ctx, dt, { cx, bot: BOT, vol, temp, capped, marks: true });
    // 열린 끝으로 빠져나가는 공기 방울(뜨거운 물)
    if (!capped && place === "hot" && arrived) {
      for (let i = 0; i < 3; i++) {
        const t = (tMs / 900 + i / 3) % 1;
        ctx.strokeStyle = `rgba(220,240,255,${0.9 * (1 - t)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx + 22 + Math.sin(t * 6 + i) * 4, BOT + 6 - t * 100, 2.6 + t * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    pill(ctx, `속 기체 ${Math.round(temp)} ℃`, 12, 7, { dot: temp > 40 ? "#FF9F5A" : "#5AA2F8" });
    pill(ctx, `부피 ${vol.toFixed(1)} mL`, 334, 7, { align: "right" });
  });

  return () => lab.cleanup();
};
