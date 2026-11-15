// [중1 Ⅳ v5] u4l1 증발 랩: 「저울 위의 손 소독제, 숫자는 어떻게 될까요?」
// 책의 해 보기를 손으로 한다: 전자저울 위 거름종이에 손 소독제를 바르고 시간에 따른 질량을 본다.
// 책의 도움말("뭉치지 않게 펴서 발라야 질량 변화를 관찰하기 쉽다")을 실험으로 만들었다: 같은 양을 넓게 펴 바른 것과 한 덩이로 올린 것을 견준다.
// 통찰 하나: 줄어드는 일은 액체의 표면에서 일어난다(표면이 넓으면 같은 시간에 더 많이 줄어든다).
// 조작: 예측 → 바르는 법 고르기(어느 쪽을 먼저 해도 된다) → 꾹 눌러 시간 보내기 → 다른 쪽도 → 판정 하나.
// 수치(0.50 g에서 0.31 g, 0.44 g)는 이 랩에서 정한 값이다.
// 무대(2026-11-15 다시 그림, 감사 상 후보): 처음부터 두 칸(넓게 펴 바른 것, 한 덩이로 올린 것)을 같은 크기로 나란히 둔다. 칸마다 거름종이 위
//   소독제를 입자로(두 칸 모두 12개), 공기와 닿는 표면을 밝은 줄로, 날아간 입자는 위에 남기고, 저울 숫자는 그 칸 아래에 둔다.
//   판정 때 두 칸이 함께 남아 표면의 넓이와 날아간 입자 수(6개와 2개), 줄어든 숫자를 나란히 견줄 수 있다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards } from "../bio6/b6Lab";
import { A, scale, seeded, svgOpen, u4Hold, u4Lab, u4Predict, type Pt, type U4Step } from "./u4Kit";

type Way = "spread" | "lump";
const M0 = 0.5;
const END: Record<Way, number> = { spread: 0.31, lump: 0.44 };
const LABEL: Record<Way, string> = { spread: "넓게 펴 바른 것", lump: "한 덩이로 올린 것" };
const NEED = 3200; // 한 번 지켜보는 데 눌러야 하는 시간(ms)
const PW = 165; // 칸 폭
const OX: Record<Way, number> = { spread: 4, lump: 177 }; // 칸의 왼쪽
const PR = 5.6; // 입자 반지름
const PAPER = 141; // 거름종이 윗면
const GAP = 11.6; // 액체 입자 사이

/** 칸 하나의 입자 자리(액체), 날아갈 입자의 차례와 날아간 뒤의 자리, 표면 줄. 두 칸 모두 입자 12개. */
function layout(w: Way, cx: number, rnd: () => number): { pts: Pt[]; fly: number[]; to: Pt[]; surf: string; tag: Pt } {
  const y0 = PAPER - PR - 0.4;
  if (w === "spread") {
    // 한 겹으로 얇고 넓게(입자 12개가 한 줄)
    const pts = Array.from({ length: 12 }, (_, i) => ({ x: cx + (i - 5.5) * GAP, y: y0 + (rnd() - 0.5) * 1.2 }));
    const fly = [3, 8, 1, 10, 5, 6];
    const to = fly.map((i, k) => ({ x: pts[i].x + (rnd() - 0.5) * 14, y: 56 + ((k * 37) % 44) + rnd() * 6 }));
    const xL = pts[0].x - PR - 0.6, xR = pts[11].x + PR + 0.6, top = y0 - PR - 1.4;
    const surf = `M${xL} ${PAPER - 1} V${top + 4} Q${xL} ${top} ${xL + 4} ${top} H${xR - 4} Q${xR} ${top} ${xR} ${top + 4} V${PAPER - 1}`;
    return { pts, fly, to, surf, tag: { x: cx, y: top - 7 } };
  }
  // 좁고 두껍게(아래부터 5, 4, 3개의 무더기)
  const rows = [5, 4, 3];
  const pts: Pt[] = [];
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) pts.push({ x: cx + (i - (n - 1) / 2) * GAP + (rnd() - 0.5) * 0.8, y: y0 - r * GAP * 0.87 });
  });
  const fly = [10, 9];
  const to = [{ x: cx - 16, y: 64 }, { x: cx + 24, y: 82 }];
  const half = 2 * GAP + PR + 0.8;
  const top = y0 - 2 * GAP * 0.87 - PR - 1.2;
  const surf = `M${cx - half} ${PAPER - 1} C${cx - half} ${top + 18} ${cx - 22} ${top} ${cx} ${top} C${cx + 22} ${top} ${cx + half} ${top + 18} ${cx + half} ${PAPER - 1}`;
  return { pts, fly, to, surf, tag: { x: cx, y: top - 7 } };
}

export const u4EvapLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-evap" });
  const { f, tm } = lab;
  const rnd = seeded(53);
  const L: Record<Way, ReturnType<typeof layout>> = {
    spread: layout("spread", OX.spread + PW / 2, rnd),
    lump: layout("lump", OX.lump + PW / 2, rnd),
  };

  const panel = (w: Way): string => {
    const ox = OX[w];
    const cx = ox + PW / 2;
    const l = L[w];
    return `<g class="u4x-evap-pn" data-k="${w}">
      <text class="u4x-evap-lb" x="${cx}" y="17" text-anchor="middle" font-size="12.5" font-weight="800">${LABEL[w]}</text>
      <rect class="u4x-evap-fr" x="${ox + 5}" y="25" width="${PW - 10}" height="128" rx="12" fill="rgba(124,107,255,.10)" stroke-width="1.5"/>
      <text x="${cx}" y="40" text-anchor="middle" font-size="12" font-weight="800" fill="#C9BEFF">입자의 눈</text>
      <rect x="${ox + 11}" y="${PAPER}" width="${PW - 22}" height="6" rx="2" fill="#E4EAF1" opacity=".88"/>
      <g class="u4x-evap-liq" opacity="0">
        <path d="${l.surf}" stroke="#7EE8F2" stroke-width="7" stroke-opacity=".22" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${l.surf}" stroke="#8EF0F8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="${l.tag.x}" y="${l.tag.y}" text-anchor="middle" font-size="12" font-weight="800" fill="#8EF0F8">표면</text>
        ${l.pts
          .map((p, i) => {
            const k = l.fly.indexOf(i);
            const d = k >= 0 ? { x: l.to[k].x - p.x, y: l.to[k].y - p.y } : { x: 0, y: 0 };
            return `<g class="u4x-evap-p" data-i="${i}" style="--dx:${d.x.toFixed(1)}px;--dy:${d.y.toFixed(1)}px">
              <rect class="u4x-evap-tr" x="${(p.x - 2.2).toFixed(1)}" y="${(p.y + PR - 1).toFixed(1)}" width="4.4" height="17" rx="2.2" fill="url(#u4evTr)"/>
              <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${PR}" fill="${A.part}" stroke="${A.partEdge}" stroke-width="1.2"/>
            </g>`;
          })
          .join("")}
      </g>
      ${scale(ox + 10, 158, PW - 20, `u4x-evap-${w}`, "0.00 g")}
    </g>`;
  };
  f.stage.innerHTML = `${svgOpen}<defs><linearGradient id="u4evTr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9BEFF" stop-opacity=".9"/><stop offset="1" stop-color="#C9BEFF" stop-opacity="0"/></linearGradient></defs>${panel("spread")}${panel("lump")}</svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const P = (w: Way) => {
    const g = q<SVGGElement>(`.u4x-evap-pn[data-k="${w}"]`);
    return {
      g,
      liq: g.querySelector(".u4x-evap-liq") as SVGGElement,
      read: g.querySelector(`.u4x-evap-${w}-read`) as SVGTextElement,
      parts: Array.from(g.querySelectorAll<SVGGElement>(".u4x-evap-p")),
    };
  };
  const pn: Record<Way, ReturnType<typeof P>> = { spread: P("spread"), lump: P("lump") };

  let pred = "";
  let way: Way = "spread";
  let t = 0; // 지금 실험의 진행(0~1)
  const done = new Set<Way>();

  function setup(w: Way): void {
    way = w;
    t = 0;
    (Object.keys(pn) as Way[]).forEach((k) => pn[k].g.classList.toggle("now", k === w));
    pn[w].g.classList.add("on");
    pn[w].liq.setAttribute("opacity", "1");
    paint();
  }

  function paint(): void {
    const m = M0 + (END[way] - M0) * t;
    pn[way].read.textContent = `${m.toFixed(2)} g`;
    const l = L[way];
    const want = Math.floor(t * l.fly.length + 0.001);
    l.fly.forEach((i, k) => pn[way].parts[i].classList.toggle("fly", k < want));
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
    pn[way].g.classList.remove("now");
    cards[way].done();
    cards[way].el.disabled = true;
    cards[way].sub(`${M0.toFixed(2)} → ${END[way].toFixed(2)} g`);
    f.pips(done.size);
    if (done.size === 1) {
      const head = pred.startsWith("점점 줄어") ? "예측대로" : "예측과 달리";
      f.say(`${head} 숫자가 <b>줄었어요</b>. 같은 양을 <b>다르게 발라</b> 같은 시간 동안 비교해요.`);
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
