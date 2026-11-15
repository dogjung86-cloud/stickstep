// [중1 Ⅳ v5] u4l3 시계 접시 랩: 「물방울은 어디에서 왔을까요?」
// 책의 해 보기를 손으로 한다: 뜨거운 물이 든 비커 위에 얼음이 담긴 시계 접시를 올리고, 비커의 물과 접시 아랫면의 물방울에 푸른색 염화 코발트 종이를 댄다.
// 지금 단원에는 이 실험을 해 보는 랩이 없는데 정리 글과 문제가 이 실험을 말하고 있어서 새로 넣었다.
// 학생이 정하는 것: 비커에 뜨거운 물을 담을지 찬물을 담을지(찬물이면 수증기가 거의 올라오지 않아 물방울이 맺히지 않는다. 뜨거운 물로 다시 한다),
//   세 곳(접시 위, 접시 아래, 비커 속) 가운데 어디를 볼지, 종이를 어디에 댈지.
// 판정 하나: 아랫면 물방울의 출처(찬물일 때는 맺히지 않았다는 것이 근거로 남는다).
// 통찰 하나: 상태가 변해도 물질의 성질은 변하지 않는다(두 곳 모두 종이가 붉게 변한다).
// 그림(2026-11-15 다시 그림, 감사 상 후보): 수증기는 눈에 보이지 않으므로 흰 김 줄로 그리지 않는다(같은 스텝의 궁금증 카드와 맞선다).
//   '입자의 눈'처럼 작은 입자로 그려 물 표면에서 접시 아랫면까지 올라가는 길(점선 화살)을 무대에서 가장 크게 둔다.
//   물방울은 접시 아랫면에 맺힌 둥근 방울로 따로, 접시 위 녹은 물은 얼음 둘레의 웅덩이로. 시계 접시는 비커 입구에 걸친 얇은 곡면 유리다.
//   종이를 댈 때는 책처럼 접시를 들어 올린다(종이가 비커 벽을 뚫고 지나가지 않게).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { beaker, svgOpen, u4Lab, type Pt, type U4Step } from "./u4Kit";

type Spot = "top" | "under" | "water";
const SPOTS: { k: Spot; label: string; y: number; say: string }[] = [
  { k: "top", label: "접시 위", y: 14, say: "접시 위: 얼음이 녹아 <b>물</b>이 되고 있어요. 고체가 액체로 변했어요." },
  { k: "under", label: "접시 아래", y: 70, say: "접시 아랫면: 처음에는 없던 <b>물방울</b>이 맺혔어요. 어디에서 왔을까요?" },
  { k: "water", label: "비커 속", y: 126, say: "비커 속: 뜨거운 물이 <b>수증기</b>가 되어 올라가요. 액체가 기체로 변했어요." },
];
const CX = 128; // 비커 가운데
const BT = 64; // 비커 입구(수증기가 올라가는 길을 길게 보이려고 비커를 높이고 물을 낮게 담았다)
const BH = 142; // 비커 높이
const LEVEL = 0.36; // 물의 높이(비커의 몇 할)
const WATER = BT + BH - BH * LEVEL; // 물 표면
const OY = 56; // 접시 아랫면 양끝 높이(비커 입구에 걸친다)
const IY = 54; // 접시 윗면 양끝 높이
const LIFT = 30; // 종이를 댈 때 접시를 들어 올리는 높이

// 시계 접시: 아랫면(바깥) 곡선과 윗면(안쪽) 곡선. 비커 입구(±62)에 걸치고 가운데가 입구 아래로 조금 내려간다
const outerY = (dx: number): number => {
  const t = (dx + 80) / 160;
  return OY + 73.9 * t * (1 - t);
};
const innerY = (dx: number): number => {
  const t = (dx + 78) / 156;
  return IY + 68 * t * (1 - t);
};
/** 접시 위 웅덩이: 안쪽 곡면과 수면(높이 wl) 사이. wl이 가운데 바닥(IY + 17)보다 낮으면(=값이 크면) 없다. */
function puddleD(wl: number): string {
  const c = (wl - IY) / 68;
  if (c >= 0.25) return "";
  const t1 = (1 - Math.sqrt(1 - 4 * c)) / 2;
  const half = 78 - 156 * t1;
  const pts: string[] = [];
  for (let i = 0; i <= 14; i++) {
    const dx = -half + (2 * half * i) / 14;
    pts.push(`${(CX + dx).toFixed(1)} ${Math.max(wl, innerY(dx)).toFixed(1)}`);
  }
  return `M${CX - half} ${wl} L${pts.join(" L")} Z`;
}

const DROPS = [-44, -24, -4, 16, 36].map((dx, i) => ({ x: CX + dx, r: [3.4, 4.2, 4.6, 4, 3.5][i] }));

export const u4WatchLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-watch" });
  const { f, tm } = lab;

  // 수증기 입자: 물 표면에서 출발해 각 물방울 자리까지 올라간다(뜨거운 물 12개, 찬물 2개). 정지 화면에서도 길 위 여러 높이에 있게 자리를 나눠 둔다
  const vapor = (n: number, slow: boolean): string =>
    Array.from({ length: n }, (_, i) => {
      const d = DROPS[i % DROPS.length];
      const from: Pt = { x: d.x + ((i * 23) % 30) - 15, y: WATER - 3 };
      const to: Pt = { x: d.x + ((i * 7) % 6) - 3, y: outerY(d.x - CX) + d.r * 2 + 3 };
      const fr = (i * 0.37) % 1; // 정지 자리(길의 몇 할)
      const at: Pt = { x: from.x + (to.x - from.x) * fr, y: from.y + (to.y - from.y) * fr };
      const dur = (slow ? 5.2 : 2.6) + ((i * 0.31) % 0.9);
      return `<circle class="u4x-watch-vp" cx="${at.x.toFixed(1)}" cy="${at.y.toFixed(1)}" r="2.6" fill="url(#u4wVp)" stroke="#7DB7EC" stroke-width=".6" style="--fx:${(from.x - at.x).toFixed(1)}px;--fy:${(from.y - at.y).toFixed(1)}px;--tx:${(to.x - at.x).toFixed(1)}px;--ty:${(to.y - at.y).toFixed(1)}px;--mx:${(((i % 3) - 1) * 5).toFixed(0)}px;animation-duration:${dur.toFixed(2)}s;animation-delay:${(-fr * dur).toFixed(2)}s"/>`;
    }).join("");
  // 올라가는 길(점선 화살) 셋
  const paths = [-30, 0, 30]
    .map((dx) => {
      const y1 = outerY(dx) + 13;
      return `<path d="M${CX + dx} ${WATER - 6} C${CX + dx - 7} ${WATER - 22} ${CX + dx + 7} ${y1 + 18} ${CX + dx} ${y1}" stroke="#B4DAFF" stroke-opacity=".85" stroke-width="1.8" stroke-dasharray="3.2 4" stroke-linecap="round"/>
        <path d="M${CX + dx - 4.5} ${y1 + 5} L${CX + dx} ${y1 - 0.5} L${CX + dx + 4.5} ${y1 + 5}" stroke="#B4DAFF" stroke-opacity=".95" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="u4wIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.6" stop-color="#DDEFFF"/><stop offset="1" stop-color="#B7D9F5"/></linearGradient>
      <radialGradient id="u4wDrop" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#F2FAFF"/><stop offset="0.6" stop-color="#9FD3F7"/><stop offset="1" stop-color="#4E9DDB"/></radialGradient>
      <linearGradient id="u4wGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DCEBFF" stop-opacity=".55"/><stop offset=".5" stop-color="#DCEBFF" stop-opacity=".2"/><stop offset="1" stop-color="#DCEBFF" stop-opacity=".5"/></linearGradient>
      <radialGradient id="u4wVp" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#9FD0FA"/></radialGradient>
    </defs>
    <ellipse cx="${CX}" cy="212" rx="84" ry="7" fill="#000" opacity="0.32"/>
    ${beaker(CX - 62, BT, 124, BH, "#6CB8FF", "u4x-watch", LEVEL)}
    <g class="u4x-watch-steam hot">${paths}${vapor(12, false)}</g>
    <g class="u4x-watch-steam cold">${vapor(2, true)}</g>
    <g class="u4x-watch-dish">
      <g class="u4x-watch-drops">${DROPS.map((d) => {
        const y = outerY(d.x - CX) - 0.6;
        return `<g class="u4x-watch-drop"><circle cx="${d.x}" cy="${(y + d.r).toFixed(1)}" r="${d.r}" fill="url(#u4wDrop)" stroke="#5BA7E0" stroke-width=".9"/><circle cx="${(d.x - d.r * 0.32).toFixed(1)}" cy="${(y + d.r * 0.62).toFixed(1)}" r="${(d.r * 0.3).toFixed(1)}" fill="#fff" opacity=".85"/></g>`;
      }).join("")}</g>
      <path d="M${CX - 80} ${OY} Q${CX} ${OY + 37} ${CX + 80} ${OY} L${CX + 78} ${IY} Q${CX} ${IY + 34} ${CX - 78} ${IY} Z" fill="url(#u4wGlass)" stroke="#C7DCF5" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M${CX - 70} ${OY + 2.6} Q${CX - 40} ${OY + 18} ${CX - 12} ${OY + 17.6}" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
      <path class="u4x-watch-melt" d="" fill="#7CC4F5" fill-opacity=".85" stroke="#C9E8FF" stroke-width="1"/>
      <path class="u4x-watch-meltline" d="" stroke="#E6F5FF" stroke-width="1.2" stroke-linecap="round"/>
      <rect class="u4x-watch-ice" x="${CX - 21}" y="${IY - 13}" width="42" height="30" rx="7" fill="url(#u4wIce)" stroke="#8FC1E8" stroke-width="1.6"/>
    </g>
    <g class="u4x-watch-strip sa" opacity="0"><path d="M${CX + 63.5} ${BT - 26} L${CX + 38} ${BT + 110}"/></g>
    <g class="u4x-watch-strip sb" opacity="0"><path d="M${CX - 100} ${OY - 11.5} L${CX - 2} ${OY - 1.5}"/></g>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const dish = q<SVGGElement>(".u4x-watch-dish");
  const ice = q<SVGRectElement>(".u4x-watch-ice");
  const melt = q<SVGPathElement>(".u4x-watch-melt");
  const meltLine = q<SVGPathElement>(".u4x-watch-meltline");
  const steamHot = q<SVGGElement>(".u4x-watch-steam.hot");
  const steamCold = q<SVGGElement>(".u4x-watch-steam.cold");
  const drops = Array.from(f.stage.querySelectorAll<SVGGElement>(".u4x-watch-drop"));

  let hot = true;
  let asked = false;
  const seen = new Set<Spot>();

  /** 접시 위 녹은 물(0~1): 얼음 밑 안쪽 곡면에 고이는 웅덩이. */
  function paintMelt(m: number): void {
    const wl = IY + 17.2 - 5.6 * m;
    const d = m > 0.02 ? puddleD(wl) : "";
    melt.setAttribute("d", d);
    const c = (wl - IY) / 68;
    const half = c < 0.25 ? 78 - 156 * ((1 - Math.sqrt(1 - 4 * c)) / 2) : 0;
    meltLine.setAttribute("d", d ? `M${CX - half + 2} ${wl} H${CX + half - 2}` : "");
  }

  function reset(): void {
    dish.style.transition = "none";
    dish.style.transform = "translateY(-70px)";
    dish.style.opacity = "0";
    ice.style.transform = "";
    paintMelt(0);
    drops.forEach((d) => (d.style.transform = "scale(0)"));
    void dish.getBoundingClientRect();
    dish.style.transition = "";
  }

  const spotBtns = SPOTS.map((sp) => {
    const b = el("button", { class: "u4x-watch-spot", text: sp.label, attrs: { type: "button" }, style: { top: `${sp.y}px` } }) as HTMLButtonElement;
    b.dataset.k = sp.k;
    b.hidden = true;
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      spotBtns.forEach((x) => x.classList.toggle("on", x === b));
      b.classList.add("seen");
      f.say(sp.say);
      seen.add(sp.k);
      if (seen.size === SPOTS.length && !asked) {
        asked = true;
        f.pips(1);
        tm.later(judge, 1500);
      }
    });
    f.stage.appendChild(b);
    return b;
  });

  // 1. 비커에 담을 물 고르기
  const cHot = bvCard("u4x-watch-water", { name: "뜨거운 물", sub: "김이 올라온다", key: "hot" });
  const cCold = bvCard("u4x-watch-water", { name: "찬물", sub: "김이 없다", key: "cold" });
  const put = bvBtn("main u4x-watch-put", "얼음 접시를 비커 위에 올리기");
  const redo = bvBtn("main u4x-watch-redo", "뜨거운 물로 바꿔 다시 하기");
  const fill = (h: boolean): void => {
    hot = h;
    haptic(HAPTIC.tap);
    steamHot.style.display = h ? "" : "none";
    steamCold.style.display = h ? "none" : "";
    f.stage.classList.toggle("cold", !h);
    f.say(`비커에 <b>${h ? "뜨거운 물" : "찬물"}</b>을 담았어요. 이제 얼음이 담긴 시계 접시를 올려 보세요.`);
    put.disabled = false;
    f.slot.setControls(put);
    api.setCTA("얼음 접시를 올려 보세요", { enabled: false });
  };
  cHot.el.addEventListener("click", () => fill(true));
  cCold.el.addEventListener("click", () => fill(false));
  redo.addEventListener("click", () => {
    cCold.done();
    reset();
    fill(true);
  });

  // 2. 접시를 올리고 지켜보기
  put.addEventListener("click", () => {
    put.disabled = true;
    haptic(HAPTIC.tap);
    dish.style.opacity = "1";
    dish.style.transform = "translateY(0)";
    f.say(`${hot ? "뜨거운 물" : "찬물"} 위에 얼음 접시를 올렸어요. 잠시 지켜봐요.`);
    const N = 14;
    const tick = (i: number): void => {
      const t = i / N;
      const k = hot ? 1 : 0.25; // 찬물 위에서는 얼음이 천천히 녹고 물방울이 맺히지 않는다
      ice.style.transform = `scale(${(1 - 0.22 * t * k).toFixed(2)}, ${(1 - 0.34 * t * k).toFixed(2)})`;
      paintMelt(Math.min(1, t * 1.15 * k));
      if (hot) drops.forEach((d, j) => (d.style.transform = `scale(${Math.max(0, Math.min(1, (t - 0.2 - (j % 3) * 0.1) * 2)).toFixed(2)})`));
      if (i < N) {
        tm.later(() => tick(i + 1), 170);
        return;
      }
      if (!hot) {
        haptic(HAPTIC.wrong);
        f.say("접시 아랫면에 <b>아무것도 맺히지 않았어요</b>. 찬물에서는 수증기가 거의 올라오지 않아요.");
        f.slot.setControls(redo);
        return;
      }
      haptic(HAPTIC.correct);
      spotBtns.forEach((b) => (b.hidden = false));
      f.slot.setControls();
      f.say("달라진 곳이 있어요. 무대 오른쪽의 <b>세 곳</b>을 차례로 눌러 살펴보세요.");
      api.setCTA("세 곳을 눌러 살펴보세요", { enabled: false });
    };
    tm.later(() => tick(1), 600);
  });

  function judge(): void {
    f.slot.ask(
      "접시 <b>아랫면의 물방울</b>은 어디에서 왔을까요?",
      [{ t: "비커에서 올라온 수증기가 식어서", ok: true }, { t: "얼음 녹은 물이 접시를 뚫고 나와서" }, { t: "비커의 물이 튀어 올라서" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "수증기가 차가운 접시에 닿아 <b>다시 물</b>이 됐어요. 기체가 액체로 변한 거예요.",
        onNext: paper,
      },
    );
  }

  // 3. 종이를 두 곳에 대기: 책처럼 접시를 살짝 들어 올리고 댄다
  function paper(): void {
    f.pips(2);
    spotBtns.forEach((b) => (b.hidden = true));
    dish.style.transform = `translateY(${-LIFT}px)`;
    f.say("<b>푸른색 염화 코발트 종이</b>는 물에 닿으면 붉게 변해요. 두 곳에 대 보세요.");
    api.setCTA("종이를 두 곳에 대 보세요", { enabled: false });
    const done = new Set<string>();
    const mk = (cls: string, text: string, where: string): HTMLButtonElement => {
      const b = bvBtn(`u4x-watch-paper ${cls}`, text);
      b.addEventListener("click", () => {
        b.disabled = true;
        haptic(HAPTIC.tap);
        const g = q<SVGGElement>(`.u4x-watch-strip.${cls}`);
        g.setAttribute("opacity", "1");
        tm.later(() => g.classList.add("red"), 500);
        tm.later(() => {
          haptic(HAPTIC.correct);
          done.add(cls);
          f.say(`${where}에 댄 종이가 <b>붉게</b> 변했어요.${done.size < 2 ? " 다른 곳에도 대 보세요." : ""}`);
          if (done.size === 2) tm.later(() => lab.finish("두 곳 모두 종이가 붉게 변했어요. 둘 다 물이에요. 물질의 상태가 변해도 <b>성질은 변하지 않아요</b>."), 1100);
        }, 1200);
      });
      return b;
    };
    f.slot.setControls(el("div", { class: "u4x-row" }, mk("sa", "비커의 물에 대기", "비커의 물"), mk("sb", "물방울에 대기", "접시 아랫면의 물방울")));
  }

  reset();
  steamHot.style.display = "none";
  steamCold.style.display = "none";
  f.slot.setControls(bvCards(2, cHot, cCold));
  f.say("비커 위에 얼음 접시를 올릴 거예요. 먼저 비커에 <b>어떤 물</b>을 담을지 골라 보세요.");
  api.setCTA("비커에 담을 물을 골라 보세요", { enabled: false });
  return lab.cleanup;
};
