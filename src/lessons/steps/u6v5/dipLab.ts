// u6DipLab (u6l4 첫 랩): 「뜨거운 물과 얼음물에 넣으면 피스톤은 어떻게 될까?」
// 나온 곳: 탐구 1 "온도에 따른 기체의 부피 변화 관찰하기"(피스톤을 중간쯤에 두고 끝을 마개로 막은 주사기를 뜨거운 물과 얼음물에 각각 넣어 피스톤을 본다).
// 학생이 정하는 것: 마개를 막을지, 주사기를 어디에 넣을지(뜨거운 물, 실험대, 얼음물). 차례는 정해 주지 않는다.
// 실패하는 길: 마개를 막지 않고 담그면 열린 끝으로 공기가 드나들어 피스톤이 움직이지 않는다(뜨거운 물에서는 공기 방울이 빠져나간다).
// 처음에 예측을 건다(정오를 매기지 않는다). 판정: 얼음물에서 피스톤이 내려간 까닭.
// 값은 정본과 같다: 20 ℃ 30.0 mL, 뜨거운 물 80 ℃ 36.0 mL, 얼음물 0 ℃ 28.0 mL(10 ℃마다 1.0 mL).
// 옛 판(물중탕 주사기의 온도 막대 하나)과 다른 점: 비커 둘에 직접 넣어 보는 관찰 실험이고, 마개를 잊으면 실패한다. 재는 일은 다음 랩으로 나눴다.
// 무대(2026-11-15 손질): 주사기를 키워(1 mL에 4px) 피스톤의 움직임이 보이게 했다. 처음 높이(20 ℃, 30.0 mL)에 점선 기준선이 늘 있고,
//   뜨거운 물과 얼음물에서 피스톤이 섰던 자리에는 옅은 자국과 ▲▼가 남는다. 판정과 결론 때는 세 곳의 주사기가 나란히 서서
//   세 높이(36.0, 30.0, 28.0 mL)와 같은 입자 수(12개)가 한눈에 보인다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, ease, noteRow, FONT } from "./u6Kit";
import { vSyringe, beaker, volOf, type VSyringe } from "./syringe";

type Place = "hot" | "table" | "ice";
const X: Record<Place, number> = { hot: 62, table: 173, ice: 284 };
const T: Record<Place, number> = { hot: 80, table: 20, ice: 0 };
const NAME: Record<Place, string> = { hot: "뜨거운 물", table: "실험대", ice: "얼음물" };
const BOT = 194; // 주사기 끝(아래)
const K = 4; // 1 mL의 길이(px)
const HALF = 20; // 주사기 안쪽 반폭
const BW = 80; // 비커 폭
const BEAKER_TOP = 100;
/** 부피 v일 때 피스톤 아랫면의 높이 */
const pistonY = (v: number): number => BOT - v * K;
function tri(ctx: CanvasRenderingContext2D, x: number, y: number, up: boolean, color: string, s = 5): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, up ? y - s : y + s);
  ctx.lineTo(x - s * 0.9, up ? y + s * 0.6 : y - s * 0.6);
  ctx.lineTo(x + s * 0.9, up ? y + s * 0.6 : y - s * 0.6);
  ctx.closePath();
  ctx.fill();
}

export const dipLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-dip", label: "뜨거운 물과 얼음물에 넣어 보는 주사기", wait: "주사기를 물에 넣어 보세요" });
  const { frame, tm } = lab;
  const syr = vSyringe(12, K, HALF);
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
    note.set(`위치: <b>${NAME[place]}</b>`, `주사기 끝: <b>${capped ? "마개로 막음" : "열려 있음"}</b>`);
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
        // 뜨거운 물에서는 부푼 공기가 방울로 빠져나간다(무대에도 방울이 보인다). 얼음물에서는 빠져나가지 않으므로 '드나들어요'로 둔다
        frame.say(`주사기 끝이 열려 있어 공기가 <b>${k === "hot" ? "빠져나가요" : "드나들어요"}</b>! 먼저 <b>실험대</b>로 꺼내 마개를 막아 주세요.`);
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
    frame.say("직접 확인해 봐요! 먼저 <b>주사기 끝을 마개로 막기</b>를 누른 뒤, <b>뜨거운 물</b>과 <b>얼음물</b>에 넣어 보세요.");
    frame.slot.setControls(cap, bvCards(3, cards.hot, cards.table, cards.ice), note.el);
    sync();
  };

  lab.phase("predict");
  frame.say("주사기의 피스톤을 중간쯤에 두었어요. 실험하기 전에 먼저 예측해 봐요.");
  frame.slot.ask("끝을 막은 주사기를 <b>뜨거운 물</b>에 넣으면 피스톤은?", [{ t: "밀려 올라가요" }, { t: "그대로 있어요" }, { t: "내려가요" }], () => undefined, { predict: true, onNext: start, nextDelay: 700 });

  // 판정과 결론 때 무대에 함께 세우는 나머지 두 주사기(지금 놓인 곳 말고 두 곳)
  const ghosts: Record<Place, VSyringe> = { hot: vSyringe(12, K, HALF), table: vSyringe(12, K, HALF), ice: vSyringe(12, K, HALF) };
  let board = 0;

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
        api.setCTA("피스톤 높이 변화를 비교해 볼까요?", { enabled: false });
        frame.say("뜨거운 물에서는 피스톤이 <b>올라가고</b>, 얼음물에서는 <b>내려갔어요</b>!");
        phase = "ask";
        tm.later(ask, 1500);
      } else if (place === "hot") frame.say("피스톤이 <b>밀려 올라갔어요</b>. 이번에는 <b>얼음물</b>에 넣어 보세요.");
      else frame.say("피스톤이 <b>내려갔어요</b>. 이번에는 <b>뜨거운 물</b>에 넣어 보세요.");
    }
    board = ease(board, phase === "ask" || phase === "done" ? 1 : 0, 0.2, dt);

    // 실험대와 비커 둘
    ctx.fillStyle = "#2A3A55";
    ctx.fillRect(126, BOT + 12, 94, 6);
    beaker(ctx, X.hot - BW / 2, BEAKER_TOP, BW, BOT + 12, 80, tMs);
    beaker(ctx, X.ice - BW / 2, BEAKER_TOP, BW, BOT + 12, 0, tMs);
    txt(ctx, "뜨거운 물", X.hot, 223, { align: "center", color: "#FFB37A" });
    txt(ctx, "실험대", X.table, 223, { align: "center", color: "#9FB2D0" });
    txt(ctx, "얼음물", X.ice, 223, { align: "center", color: "#8FC5FF" });
    // 처음 높이(20 ℃, 30.0 mL)의 기준선
    const base = pistonY(30);
    ctx.strokeStyle = "rgba(255,255,255,.42)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(6, base);
    ctx.lineTo(340, base);
    ctx.stroke();
    ctx.setLineDash([]);
    // 뜨거운 물과 얼음물에서 피스톤이 섰던 자리(옅은 자국과 ▲▼). 주사기가 그 자리를 떠난 뒤에 보인다
    if (board < 0.99) {
      ctx.globalAlpha = 1 - board;
      for (const p of ["hot", "ice"] as Place[]) {
        if (!seen.has(p) || Math.abs(cx - X[p]) < HALF * 2) continue;
        const y = pistonY(volOf(T[p]));
        ctx.strokeStyle = p === "hot" ? "rgba(255,179,122,.75)" : "rgba(143,197,255,.8)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(X[p] - HALF - 1, y - 8, HALF * 2 + 2, 8);
        ctx.setLineDash([]);
        tri(ctx, X[p] - HALF - 9, y - 4, p === "hot", p === "hot" ? "#FFB37A" : "#8FC5FF");
      }
      ctx.globalAlpha = 1;
    }
    // 판정과 결론: 세 곳의 주사기를 나란히(같은 입자 12개, 피스톤 높이만 다르다)
    if (board > 0.01) {
      ctx.globalAlpha = board;
      for (const p of ["hot", "table", "ice"] as Place[]) {
        if (p === place) continue;
        ghosts[p].draw(ctx, dt, { cx: X[p], bot: BOT, vol: volOf(T[p]), temp: T[p], capped: true });
      }
      ctx.globalAlpha = 1;
    }
    syr.draw(ctx, dt, { cx, bot: BOT, vol, temp, capped, marks: board < 0.5 });
    // 열린 끝으로 빠져나가는 공기 방울(뜨거운 물)
    if (!capped && place === "hot" && arrived) {
      for (let i = 0; i < 3; i++) {
        const t = (tMs / 900 + i / 3) % 1;
        ctx.strokeStyle = `rgba(220,240,255,${0.9 * (1 - t)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx + HALF + 8 + Math.sin(t * 6 + i) * 3, BOT + 6 - t * 90, 2.6 + t * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (board < 0.99) {
      // 지금 주사기의 값: 피스톤 옆의 작은 칸(뜨거운 물에서는 오른쪽, 그 밖에서는 왼쪽)
      ctx.globalAlpha = 1 - board;
      const y = pistonY(vol);
      const cw = 84;
      const x0 = cx < 118 ? cx + HALF + 22 : Math.min(cx - HALF - 10, 240) - cw;
      rr(ctx, x0, y - 18, cw, 36, 9);
      ctx.fillStyle = "rgba(11,21,36,.82)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.14)";
      ctx.lineWidth = 1;
      ctx.stroke();
      txt(ctx, `부피 ${vol.toFixed(1)} mL`, x0 + cw / 2, y - 7, { size: 13, weight: 800, color: "#FFFFFF", align: "center" });
      txt(ctx, `속 기체 ${Math.round(temp)} ℃`, x0 + cw / 2, y + 9, { size: 12, color: temp > 40 ? "#FFB37A" : "#9FC9FF", align: "center" });
      ctx.globalAlpha = 1;
    }
    if (board > 0.01) {
      ctx.globalAlpha = board;
      // 세 높이: 기준선에서 위로(뜨거운 물), 아래로(얼음물)
      const hy = pistonY(36);
      const iy = pistonY(28);
      ctx.strokeStyle = "#FFB37A";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(X.hot - HALF - 12, base);
      ctx.lineTo(X.hot - HALF - 12, hy + 6);
      ctx.stroke();
      tri(ctx, X.hot - HALF - 12, hy + 3, true, "#FFB37A", 5.5);
      ctx.strokeStyle = "#8FC5FF";
      ctx.beginPath();
      ctx.moveTo(X.ice + HALF + 12, base);
      ctx.lineTo(X.ice + HALF + 12, iy - 3);
      ctx.stroke();
      tri(ctx, X.ice + HALF + 12, iy, false, "#8FC5FF", 5.5);
      txt(ctx, "36.0 mL", X.hot + HALF + 8, hy - 4, { size: 13, weight: 800, color: "#FFB37A" });
      txt(ctx, "30.0 mL", X.table - HALF - 8, base - 4, { size: 13, weight: 800, color: "#E8EEF9", align: "right" });
      txt(ctx, "28.0 mL", X.ice - HALF - 8, iy - 4, { size: 13, weight: 800, color: "#8FC5FF", align: "right" });
      const label = "입자 수는 셋 다 12개";
      ctx.font = `700 12.5px ${FONT}`;
      const pw = ctx.measureText(label).width + 30;
      pill(ctx, label, 173 - pw / 2, 4, { dot: "#B9A6E8" });
      ctx.globalAlpha = 1;
    }
  });

  return () => lab.cleanup();
};
