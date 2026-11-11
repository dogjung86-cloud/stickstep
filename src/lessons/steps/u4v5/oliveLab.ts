// [중1 Ⅳ v5] u4l4 올리브유 랩: 「얼리면 질량과 부피는 어떻게 될까요?」
// 책의 탐구를 손으로 한다: 유리병의 올리브유 높이를 색 테이프로 표시하고 질량을 잰 뒤, 얼음과 소금에 넣어 얼리고, 높이를 다시 표시하고 질량을 다시 잰다.
// 지금 단원에는 이 탐구를 해 보는 랩이 없는데 문제가 이 실험을 묻고 있어서 새로 넣었다.
// 조작: 높이 표시하고 재기 → 예측(질량) → 꾹 눌러 얼리기 → 바로 잴지 물기를 닦고 잴지 고르기 → 판정 하나(부피가 줄어든 까닭).
// 닦지 않고 바로 재면 차가운 병 겉에 맺힌 물방울 때문에 숫자가 커진다(책의 주의: 물기를 닦은 후 즉시 측정). 닦고 다시 재게 한다.
// 통찰 하나: 응고해도 질량은 그대로이고 부피만 준다. 입자 창에서 입자의 수는 그대로이고 사이만 가까워진다.
// 수치(12.60 g)는 이 랩에서 정한 값이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { A, grid, loose, partWin, scale, seeded, svgOpen, u4Hold, u4Lab, u4Predict, type U4Step } from "./u4Kit";

const MASS = "12.60 g";
const WET = "12.74 g"; // 닦지 않고 쟀을 때(겉에 맺힌 물방울의 질량이 더해진다)
const WIN = { x: 196, y: 12, w: 138, h: 206 };
const JX = 75, JW = 44, JTOP = 96, JBOT = 160; // 병 안쪽
const DROP = 7; // 얼었을 때 내려가는 높이
const NEED = 3000;

export const u4OliveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-olive" });
  const { f, tm } = lab;
  const rnd = seeded(77);

  const cx = WIN.x + WIN.w / 2;
  // 액체는 가깝지만 가지런하지 않게, 고체는 더 가까이 가지런하게(입자의 수는 같다)
  const liq = loose(4, 3, cx, WIN.y + WIN.h - 34, 19, rnd).concat(loose(1, 1, cx, WIN.y + WIN.h - 34 - 19 * 2.7, 19, rnd));
  const sol = grid(4, 3, cx, WIN.y + WIN.h - 48, 15);

  f.stage.innerHTML = `${svgOpen}
    ${scale(22, 160, 150, "u4x-olive", "0.00 g")}
    <g class="u4x-olive-bath" opacity="0">
      <path d="M48 84 v64 a10 10 0 0 0 10 10 h78 a10 10 0 0 0 10 -10 v-64" fill="rgba(160,205,245,.16)" stroke="${A.glass}" stroke-width="2.2"/>
      ${[[56, 132], [124, 128], [58, 104], [126, 100], [90, 146]].map(([x, y]) => `<rect x="${x}" y="${y}" width="13" height="12" rx="3" fill="#DDEFFF" stroke="#8FC1E8" stroke-width="1"/>`).join("")}
    </g>
    <g class="u4x-olive-jar">
      <rect class="u4x-olive-oil" x="${JX}" y="${JTOP}" width="${JW}" height="${JBOT - JTOP}" rx="5" fill="${A.oil}" opacity="0.9"/>
      <rect x="${JX - 2}" y="84" width="${JW + 4}" height="${JBOT - 84 + 2}" rx="6" stroke="${A.glass}" stroke-width="2.4"/>
      <rect x="${JX + 2}" y="72" width="${JW - 4}" height="13" rx="3" fill="#8B9BB0" stroke="#5C6B7A" stroke-width="1.2"/>
      <path d="M${JX + 5} 100 v52" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
      <rect class="u4x-olive-tape1" x="${JX - 8}" y="${JTOP - 2}" width="${JW + 16}" height="4" rx="1.5" fill="#F0705E" opacity="0"/>
      <g class="u4x-olive-dew">${[[JX - 1, 104], [JX + JW + 1, 118], [JX - 1, 134], [JX + JW + 1, 146], [JX + 8, 152]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="3.6" fill="#BFE6FF" stroke="#6FB9E0" stroke-width="0.8"/>`).join("")}</g>
      <rect class="u4x-olive-tape2" x="${JX - 8}" y="${JTOP + DROP - 2}" width="${JW + 16}" height="4" rx="1.5" fill="#6C8CFF" opacity="0"/>
    </g>
    ${partWin(WIN.x, WIN.y, WIN.w, WIN.h, liq, "u4x-olive")}
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const read = q<SVGTextElement>(".u4x-olive-read");
  const oil = q<SVGRectElement>(".u4x-olive-oil");
  const bath = q<SVGGElement>(".u4x-olive-bath");
  const tape1 = q<SVGRectElement>(".u4x-olive-tape1");
  const tape2 = q<SVGRectElement>(".u4x-olive-tape2");
  const pEls = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-olive-p"));

  let pred = "";
  let t = 0;
  const paint = (): void => {
    oil.setAttribute("y", (JTOP + DROP * t).toFixed(1));
    oil.setAttribute("height", (JBOT - JTOP - DROP * t).toFixed(1));
    oil.setAttribute("fill", t > 0.55 ? A.oilFrozen : A.oil);
    pEls.forEach((c, k) => {
      c.setAttribute("cx", (liq[k].x + (sol[k].x - liq[k].x) * t).toFixed(1));
      c.setAttribute("cy", (liq[k].y + (sol[k].y - liq[k].y) * t).toFixed(1));
    });
    host.dataset.u4Olive = t.toFixed(2);
  };
  // 액체일 때는 입자가 조금씩 자리를 옮긴다(얼수록 잦아든다)
  const jitter = (): void => {
    if (!tm.alive()) return;
    if (t < 1) {
      const amp = 3.2 * (1 - t);
      pEls.forEach((c) => (c.style.transform = `translate(${((rnd() - 0.5) * amp).toFixed(1)}px, ${((rnd() - 0.5) * amp).toFixed(1)}px)`));
    } else pEls.forEach((c) => (c.style.transform = ""));
    tm.later(jitter, 240);
  };

  const weigh = bvBtn("main u4x-olive-weigh", "높이를 표시하고 질량 재기");
  const hold = u4Hold(lab, "꾹 눌러 얼음과 소금으로 얼리기", (ms) => {
    bath.setAttribute("opacity", "1");
    read.setAttribute("opacity", "0.25");
    t = Math.min(1, t + ms / NEED);
    paint();
    if (t < 1) return true;
    haptic(HAPTIC.correct);
    hold.disabled = true;
    tape2.setAttribute("opacity", "1");
    f.pips(1);
    f.stage.classList.add("dew");
    f.say("하얗게 굳었어요. 높이가 <b>내려가</b> 파란 테이프를 붙였어요. 이제 질량을 다시 재요.");
    f.slot.setControls(el("div", { class: "u4x-row" }, rush, again));
    api.setCTA("다시 재 보세요", { enabled: false });
    return false;
  });
  // 얼린 병을 어떻게 잴지는 학생이 정한다. 닦지 않고 바로 재면 겉에 맺힌 물방울 때문에 숫자가 커진다(책의 주의).
  const again = bvBtn("u4x-olive-again", "물기를 닦고 재기");
  const rush = bvBtn("u4x-olive-rush", "꺼내서 바로 재기");
  rush.addEventListener("click", () => {
    rush.disabled = true;
    haptic(HAPTIC.wrong);
    bath.setAttribute("opacity", "0");
    read.setAttribute("opacity", "1");
    read.textContent = WET;
    f.say(`숫자가 <b>${WET}</b>으로 커졌어요. 차가운 병 겉에 <b>물방울</b>이 맺혀서예요. 닦고 다시 재요.`);
  });

  weigh.addEventListener("click", () => {
    weigh.disabled = true;
    haptic(HAPTIC.tap);
    tape1.setAttribute("opacity", "1");
    read.textContent = MASS;
    f.say(`높이에 <b>빨간 테이프</b>를 붙였어요. 질량은 <b>${MASS}</b>이에요. 이제 얼릴 거예요.`);
    tm.later(
      () =>
        u4Predict(lab, "올리브유를 얼리면 <b>질량</b>은 어떻게 될까요?", ["그대로다", "늘어난다", "줄어든다"], (picked) => {
          pred = picked;
          f.say("병을 <b>얼음과 소금</b>에 넣어 얼려요. 버튼을 꾹 눌러 높이와 입자를 보세요.");
          f.slot.setControls(hold);
          api.setCTA("꾹 눌러 얼려 보세요", { enabled: false });
        }),
      900,
    );
  });
  again.addEventListener("click", () => {
    again.disabled = true;
    rush.disabled = true;
    f.stage.classList.remove("dew");
    haptic(HAPTIC.correct);
    bath.setAttribute("opacity", "0");
    read.setAttribute("opacity", "1");
    read.textContent = MASS;
    f.pips(2);
    const head = pred.startsWith("그대로") ? "예측대로" : "예측과 달리";
    f.say(`${head} 질량은 <b>그대로 ${MASS}</b>이에요. 그런데 높이(부피)는 줄었어요.`);
    tm.later(judge, 1100);
  });

  function judge(): void {
    f.slot.ask(
      "얼린 올리브유의 <b>부피가 줄어든</b> 까닭은?",
      [{ t: "입자 사이의 거리가 가까워져서", ok: true }, { t: "입자의 개수가 줄어서" }, { t: "입자 하나하나가 작아져서" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "입자의 수와 크기는 그대로예요. <b>입자 사이</b>가 가까워졌어요.",
        onNext: () => lab.finish("응고해도 입자의 종류와 개수는 그대로라 <b>질량은 변하지 않아요</b>. 입자 사이가 가까워져 <b>부피는 줄어요</b>."),
      },
    );
  }

  paint();
  jitter();
  f.slot.setControls(weigh);
  f.say("뚜껑 있는 유리병에 <b>올리브유</b>를 담아 저울에 올렸어요. 먼저 높이와 질량을 기록해요.");
  api.setCTA("높이와 질량을 기록하세요", { enabled: false });
  return lab.cleanup;
};
