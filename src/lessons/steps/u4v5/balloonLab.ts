// [중1 Ⅳ v5] u4l4 풍선 랩: 「플라스크의 풍선은 어떻게 될까요?」
// 책의 해 보기를 손으로 한다: 삼각 플라스크에 아세톤을 조금 넣고 입구에 고무풍선을 씌운 뒤 따뜻한 바람을 불어 준다.
// 지금 랩의 저울을 살렸다(풍선이 부푸는 내내 저울의 숫자가 그대로인 것이 근거로 남는다).
// 조작: 예측 → 꾹 눌러 따뜻한 바람 보내기(풍선이 부풀고 입자가 흩어진다) → 판정 하나(다시 식히면?) → 꾹 눌러 식혀서 확인.
// 통찰 하나: 기화하면 입자 사이가 멀어져 부피가 크게 늘지만 입자의 수(질량)는 그대로다.
// 수치(86.40 g)는 이 랩에서 정한 값이다.
// 결론 무대(2026-11-15 손질, 감사 하 후보): 식힌 뒤 결론("기화하면 부피가 크게 늘어요")이 뜰 때 무대에는 쪼그라든 풍선만 남았다.
//   가장 크게 부풀었던 풍선의 윤곽을 점선으로 남기고 "데웠을 때"라고 적어 두 크기를 한 장면에 둔다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { A, flask, grid, loose, partWin, scale, seeded, svgOpen, u4Hold, u4Lab, u4Predict, type U4Step } from "./u4Kit";

const MASS = "86.40 g";
const FX = 97, BASE = 160, FH = 62; // 플라스크 바닥 가운데와 높이
const NECK = BASE - FH;
const WIN = { x: 196, y: 12, w: 138, h: 206 };
const NEED = 3000;
const SMALL = { rx: 11, ry: 13 }; // 쪼그라든 풍선
const BIG = { rx: SMALL.rx + 28, ry: SMALL.ry + 31 }; // 가장 크게 부푼 풍선

export const u4BalloonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-balloon", tall: true });
  const { f, tm } = lab;
  const rnd = seeded(91);

  const cx = WIN.x + WIN.w / 2;
  const liq = loose(4, 3, cx, WIN.y + WIN.h - 30, 18, rnd).concat(loose(1, 1, cx, WIN.y + WIN.h - 30 - 18 * 2.7, 18, rnd));
  const gas = grid(3, 4, cx, WIN.y + 28 + (WIN.h - 28) / 2, 40).map((p) => ({ x: p.x + (rnd() - 0.5) * 14, y: p.y + (rnd() - 0.5) * 14 }));

  f.stage.innerHTML = `${svgOpen}
    <defs><radialGradient id="u4bBal" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFB3C6"/><stop offset="0.6" stop-color="#F06595"/><stop offset="1" stop-color="#C2255C"/></radialGradient></defs>
    ${scale(22, 160, 150, "u4x-balloon", MASS)}
    <g class="u4x-balloon-ghost" opacity="0">
      <ellipse cx="${FX}" cy="${NECK + 1 - BIG.ry}" rx="${BIG.rx}" ry="${BIG.ry}" stroke="#FFB3C6" stroke-width="1.8" stroke-dasharray="5 4"/>
      <text x="${FX}" y="${NECK + 1 - BIG.ry * 1.42}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#FFC9D6">데웠을 때</text>
    </g>
    <ellipse class="u4x-balloon-b" cx="${FX}" cy="${NECK - 12}" rx="11" ry="13" fill="url(#u4bBal)" stroke="#A61E4D" stroke-width="1.4"/>
    ${flask(FX, BASE, FH, "u4x-balloon", "#BFE3FF", 0.3)}
    <path d="M${FX - 12} ${NECK + 2} h24" stroke="#C2255C" stroke-width="5" stroke-linecap="round"/>
    <g class="u4x-balloon-wind warm">${[136, 146, 156].map((y) => `<path d="M6 ${y} h20 M32 ${y} h9" stroke="${A.warm}" stroke-width="2.6" stroke-linecap="round"/>`).join("")}</g>
    <g class="u4x-balloon-wind cool">${[136, 146, 156].map((y) => `<path d="M6 ${y} h20 M32 ${y} h9" stroke="${A.cold}" stroke-width="2.6" stroke-linecap="round"/>`).join("")}</g>
    ${partWin(WIN.x, WIN.y, WIN.w, WIN.h, liq, "u4x-balloon")}
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const balloon = q<SVGEllipseElement>(".u4x-balloon-b");
  const ghost = q<SVGGElement>(".u4x-balloon-ghost");
  const liqEl = q<SVGPathElement>(".u4x-balloon-liq");
  const pEls = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-balloon-p"));

  let pred = "";
  let e = 0; // 기화한 정도(0~1)
  const paint = (): void => {
    const k = 1 - (1 - e) * (1 - e);
    const ry = SMALL.ry + (BIG.ry - SMALL.ry) * k;
    balloon.setAttribute("rx", (SMALL.rx + (BIG.rx - SMALL.rx) * k).toFixed(1));
    balloon.setAttribute("ry", ry.toFixed(1));
    balloon.setAttribute("cy", (NECK + 1 - ry).toFixed(1));
    liqEl.setAttribute("opacity", (0.6 * (1 - k)).toFixed(2));
    pEls.forEach((c, i) => {
      c.setAttribute("cx", (liq[i].x + (gas[i].x - liq[i].x) * k).toFixed(1));
      c.setAttribute("cy", (liq[i].y + (gas[i].y - liq[i].y) * k).toFixed(1));
    });
    host.dataset.u4Balloon = e.toFixed(2);
  };
  const jitter = (): void => {
    if (!tm.alive()) return;
    const amp = 2.5 + 9 * e;
    pEls.forEach((c) => (c.style.transform = `translate(${((rnd() - 0.5) * amp).toFixed(1)}px, ${((rnd() - 0.5) * amp).toFixed(1)}px)`));
    tm.later(jitter, 220);
  };

  const warm = u4Hold(
    lab,
    // '바람 불어넣기'는 풍선에 바람을 넣어 부풀리는 것으로 읽혀(기화가 아니라 공기를 넣은 것처럼) 대안 '드라이어로 데우기'를 쓴다
    "꾹 눌러 드라이어로 데우기",
    (ms) => {
      e = Math.min(1, e + ms / NEED);
      paint();
      if (e < 1) return true;
      haptic(HAPTIC.correct);
      warm.disabled = true;
      f.pips(1);
      const head = pred.startsWith("부풀어") ? "예측대로" : "예측과 달리";
      f.say(`${head} 액체 아세톤이 기체로 변하면서 풍선이 크게 <b>부풀어 올랐어요</b>! 반면 전자저울의 질량은 <b>${MASS} 그대로</b>예요.`);
      tm.later(judge, 1100);
      return false;
    },
    (on) => f.stage.classList.toggle("warm", on),
  );
  const cool = u4Hold(
    lab,
    "꾹 눌러 플라스크 식히기",
    (ms) => {
      e = Math.max(0, e - ms / NEED);
      paint();
      if (e > 0) return true;
      haptic(HAPTIC.correct);
      cool.disabled = true;
      ghost.setAttribute("opacity", "1"); // 데웠을 때의 크기를 점선으로 남긴다
      host.dataset.u4BalloonGhost = "1";
      tm.later(() => lab.finish("액체가 기체로 기화하면 입자 사이의 거리가 매우 멀어져 <b>부피가 크게 늘어나요</b>. 하지만 입자의 개수는 그대로이므로 <b>질량은 변하지 않아요</b>."), 700);
      f.say("플라스크를 식히니 기체 아세톤이 다시 액체로 변하면서 풍선이 <b>줄어들었어요</b>! 이때도 질량은 변함없이 그대로예요.");
      return false;
    },
    (on) => f.stage.classList.toggle("cool", on),
  );

  function judge(): void {
    f.slot.ask(
      // 부푸는 것은 플라스크가 아니라 풍선이다("부풀어 오른 플라스크를" → 꾸밈말을 풍선 앞으로)
      "이 플라스크를 <b>다시 차갑게 식히면</b> 부풀어 오른 고무풍선은 어떻게 될까요?",
      [{ t: "다시 작게 줄어든다", ok: true }, { t: "부풀어 오른 채로 그대로 있다" }, { t: "지금보다 더 크게 부풀어 오른다" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "플라스크를 식히면 기체 아세톤이 다시 액체로 액화하면서 <b>입자 사이의 거리</b>가 가까워져 부피가 줄어들어요.",
        onNext: () => {
          f.pips(2);
          f.say("정말 그런지 확인해요. 버튼을 <b>꾹 눌러</b> 플라스크를 식혀 보세요.");
          f.slot.setControls(cool);
          api.setCTA("꾹 눌러 식혀 보세요", { enabled: false });
        },
      },
    );
  }

  paint();
  jitter();
  f.say("<b>아세톤</b>(액체)을 조금 넣은 플라스크에 풍선을 씌워 저울에 올렸어요. 먼저 예측해 보세요.");
  u4Predict(lab, "플라스크에 따뜻한 바람을 보내면 <b>풍선</b>은 어떻게 될까요?", ["부풀어 오른다", "그대로다", "플라스크 안으로 빨려 든다"], (picked) => {
    pred = picked;
    f.say("버튼을 <b>꾹 눌러</b> 따뜻한 바람을 보내요. 풍선, 저울, 입자를 함께 보세요.");
    f.slot.setControls(warm);
    api.setCTA("꾹 눌러 따뜻하게 해 보세요", { enabled: false });
  });
  api.setCTA("먼저 결과를 예측해 보세요", { enabled: false });
  return lab.cleanup;
};
