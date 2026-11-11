// [중1 Ⅳ v5] u4l1 증발 랩: 「저울 위의 손 소독제, 숫자는 어떻게 될까요?」
// 책의 해 보기를 손으로 한다: 전자저울 위 거름종이에 손 소독제를 바르고 시간에 따른 질량을 본다.
// 책의 도움말("뭉치지 않게 펴서 발라야 질량 변화를 관찰하기 쉽다")을 실험으로 만들었다: 같은 양을 넓게 펴 바른 것과 한 덩이로 올린 것을 견준다.
// 통찰 하나: 줄어드는 일은 액체의 표면에서 일어난다(표면이 넓으면 같은 시간에 더 많이 줄어든다).
// 조작: 예측 → 바르는 법 고르기(어느 쪽을 먼저 해도 된다) → 꾹 눌러 시간 보내기 → 다른 쪽도 → 판정 하나.
// 수치(0.50 g에서 0.31 g, 0.44 g)는 이 랩에서 정한 값이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards } from "../bio6/b6Lab";
import { A, grid, scale, seeded, svgOpen, u4Hold, u4Lab, u4Predict, type Pt, type U4Step } from "./u4Kit";

type Way = "spread" | "lump";
const M0 = 0.5;
const END: Record<Way, number> = { spread: 0.31, lump: 0.44 };
const NAME: Record<Way, string> = { spread: "넓게 펴 바른 것", lump: "한 덩이로 올린 것" };
const NEED = 3200; // 한 번 지켜보는 데 눌러야 하는 시간(ms)
const WIN = { x: 196, y: 12, w: 138, h: 206 };
const PX = 97; // 접시 가운데

export const u4EvapLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-evap" });
  const { f, tm } = lab;
  const rnd = seeded(53);

  f.stage.innerHTML = `${svgOpen}
    <defs><linearGradient id="u4evGel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4F8FF"/><stop offset="1" stop-color="#8FD3F4"/></linearGradient></defs>
    ${scale(22, 160, 150, "u4x-evap", "0.00 g")}
    <ellipse cx="${PX}" cy="156" rx="58" ry="9" fill="rgba(210,225,245,.25)" stroke="${A.glass}" stroke-width="2.2"/>
    <ellipse cx="${PX}" cy="153" rx="47" ry="7" fill="#F4F6F9" stroke="#C9D3DE" stroke-width="1.2"/>
    <ellipse class="u4x-evap-gel" cx="${PX}" cy="151" rx="0" ry="0" fill="url(#u4evGel)" stroke="#6FB9E0" stroke-width="1"/>
    <g class="u4x-evap-win" opacity="0">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="14" fill="rgba(124,107,255,.10)" stroke="rgba(155,140,255,.5)" stroke-width="1.6"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 19}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9BEFF">입자의 눈</text>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="${A.dim}">소독제의 표면</text>
      <g class="u4x-evap-ps"></g>
    </g>
  </svg>`;
  const log = el("div", { class: "u4x-evap-log" });
  f.stage.appendChild(log);
  const read = f.stage.querySelector(".u4x-evap-read") as SVGTextElement;
  const gel = f.stage.querySelector(".u4x-evap-gel") as SVGEllipseElement;
  const win = f.stage.querySelector(".u4x-evap-win") as SVGGElement;
  const ps = f.stage.querySelector(".u4x-evap-ps") as SVGGElement;

  let pred = "";
  let way: Way = "spread";
  let t = 0; // 지금 실험의 진행(0~1)
  let pts: Pt[] = [];
  let pEls: SVGCircleElement[] = [];
  let fly: number[] = []; // 날아갈 입자의 차례(맨 윗줄 = 표면)
  const flown = new Set<number>();
  const done = new Set<Way>();

  function setup(w: Way): void {
    way = w;
    t = 0;
    flown.clear();
    const baseY = WIN.y + WIN.h - 34;
    if (w === "spread") {
      pts = grid(6, 2, WIN.x + WIN.w / 2, baseY - 9, 19);
      fly = [1, 4, 0, 3, 5, 2];
    } else {
      pts = grid(3, 4, WIN.x + WIN.w / 2, baseY - 28, 19);
      fly = [1, 0];
    }
    ps.innerHTML = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6.5" fill="${A.part}" stroke="${A.partEdge}" stroke-width="1.2"/>`).join("");
    pEls = Array.from(ps.querySelectorAll("circle"));
    win.setAttribute("opacity", "1");
    paint();
  }

  function paint(): void {
    const m = M0 + (END[way] - M0) * t;
    read.textContent = `${m.toFixed(2)} g`;
    const k = 1 - 0.4 * t * (way === "spread" ? 1 : 0.35);
    gel.setAttribute("rx", ((way === "spread" ? 40 : 15) * k).toFixed(1));
    gel.setAttribute("ry", ((way === "spread" ? 4.5 : 9) * k).toFixed(1));
    gel.setAttribute("cy", (way === "spread" ? 151 : 147).toFixed(0));
    const want = Math.floor(t * fly.length + 0.001);
    while (flown.size < want) {
      const i = fly[flown.size];
      flown.add(i);
      const c = pEls[i];
      c.style.transition = "transform 1.1s ease-out, opacity 1.1s ease-out";
      c.style.transform = `translate(${((rnd() - 0.5) * 50).toFixed(0)}px, ${(-(pts[i].y - WIN.y - 44) + rnd() * 20).toFixed(0)}px)`;
      c.style.opacity = "0.18";
    }
    host.dataset.u4Evap = t.toFixed(2);
  }

  const cards: Record<Way, ReturnType<typeof bvCard>> = {
    spread: bvCard("u4x-evap-card", { name: "넓게 펴 바르기", sub: "얇고 넓게", key: "spread" }),
    lump: bvCard("u4x-evap-card", { name: "한 덩이로 올리기", sub: "좁고 두껍게", key: "lump" }),
  };
  const hold = u4Hold(lab, "꾹 눌러 시간 보내기", (ms) => {
    t = Math.min(1, t + ms / NEED);
    paint();
    if (t >= 1) {
      endRun();
      return false;
    }
    return true;
  });

  function choose(): void {
    f.slot.setControls(bvCards(2, cards.spread, cards.lump));
    api.setCTA(done.size ? "다른 방법으로도 발라 보세요" : "소독제를 발라 보세요", { enabled: false });
  }
  (Object.keys(cards) as Way[]).forEach((w) =>
    cards[w].el.addEventListener("click", () => {
      if (done.has(w)) return;
      haptic(HAPTIC.tap);
      setup(w);
      f.say(`저울이 <b>${M0.toFixed(2)} g</b>을 가리켜요. 버튼을 <b>꾹 눌러</b> 시간을 보내며 숫자를 보세요.`);
      hold.disabled = false;
      f.slot.setControls(hold);
      api.setCTA("꾹 눌러 시간을 보내세요", { enabled: false });
    }),
  );

  function endRun(): void {
    haptic(HAPTIC.correct);
    hold.disabled = true;
    done.add(way);
    cards[way].done();
    cards[way].el.disabled = true;
    cards[way].sub(`${M0.toFixed(2)} → ${END[way].toFixed(2)} g`);
    log.appendChild(el("div", { html: `${NAME[way]} <b>${M0.toFixed(2)} → ${END[way].toFixed(2)} g</b>` }));
    f.pips(done.size);
    if (done.size === 1) {
      const head = pred.startsWith("점점 줄어") ? "예측대로" : "예측과 달리";
      f.say(`${head} 숫자가 <b>줄었어요</b>. 같은 양을 <b>다르게 발라</b> 같은 시간 동안 견주어요.`);
      tm.later(choose, 700);
    } else {
      f.say("같은 양, 같은 시간인데 <b>넓게 펴 바른 쪽</b>이 훨씬 많이 줄었어요.");
      tm.later(judge, 800);
    }
  }

  function judge(): void {
    f.slot.ask(
      "<b>넓게 펴 바른 쪽</b>이 더 많이 줄어든 까닭은?",
      [{ t: "공기와 닿는 표면이 넓어서", ok: true }, { t: "소독제의 양이 더 많아서" }, { t: "거름종이가 더 넓어서" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "입자는 액체의 <b>표면</b>에서 날아가요. 두 번 다 양은 0.50 g으로 같았어요.",
        onNext: () => lab.finish("액체 <b>표면</b>의 입자가 스스로 움직여 기체가 되어 날아갔어요. 이 현상이 <b>증발</b>이에요."),
      },
    );
  }

  f.say("전자저울 위 거름종이에 <b>손 소독제</b>를 바를 거예요. 먼저 예측해 보세요.");
  u4Predict(lab, "소독제를 바르고 가만히 두면 저울의 <b>숫자</b>는?", ["점점 줄어든다", "그대로다", "점점 늘어난다"], (picked) => {
    pred = picked;
    f.say("같은 양의 소독제예요. <b>어떻게 바를지</b> 골라 보세요. 둘 다 해 볼 거예요.");
    choose();
  });
  api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  return lab.cleanup;
};
