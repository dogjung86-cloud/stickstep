// [중1 Ⅳ v5] u4l3 시계 접시 랩: 「물방울은 어디에서 왔을까요?」
// 책의 해 보기를 손으로 한다: 뜨거운 물이 든 비커 위에 얼음이 담긴 시계 접시를 올리고, 비커의 물과 접시 아랫면의 물방울에 푸른색 염화 코발트 종이를 댄다.
// 지금 단원에는 이 실험을 해 보는 랩이 없는데 정리 글과 문제가 이 실험을 말하고 있어서 새로 넣었다.
// 학생이 정하는 것: 비커에 뜨거운 물을 담을지 찬물을 담을지(찬물이면 수증기가 거의 올라오지 않아 물방울이 맺히지 않는다. 뜨거운 물로 다시 한다),
//   세 곳(접시 위, 접시 아래, 비커 속) 가운데 어디를 볼지, 종이를 어디에 댈지.
// 판정 하나: 아랫면 물방울의 출처(찬물일 때는 맺히지 않았다는 것이 근거로 남는다).
// 통찰 하나: 상태가 변해도 물질의 성질은 변하지 않는다(두 곳 모두 종이가 붉게 변한다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { A, beaker, svgOpen, u4Lab, type U4Step } from "./u4Kit";

type Spot = "top" | "under" | "water";
const SPOTS: { k: Spot; label: string; y: number; say: string }[] = [
  { k: "top", label: "접시 위", y: 28, say: "접시 위: 얼음이 녹아 <b>물</b>이 되고 있어요. 고체가 액체로 변했어요." },
  { k: "under", label: "접시 아래", y: 84, say: "접시 아랫면: 처음에는 없던 <b>물방울</b>이 맺혔어요. 어디에서 왔을까요?" },
  { k: "water", label: "비커 속", y: 140, say: "비커 속: 뜨거운 물이 <b>수증기</b>가 되어 올라가요. 액체가 기체로 변했어요." },
];
const CX = 128; // 비커 가운데

export const u4WatchLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-watch" });
  const { f, tm } = lab;

  f.stage.innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="u4wIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.6" stop-color="#DDEFFF"/><stop offset="1" stop-color="#B7D9F5"/></linearGradient>
      <radialGradient id="u4wDrop" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#E6F5FF"/><stop offset="1" stop-color="#6CB6EC"/></radialGradient>
    </defs>
    <ellipse cx="${CX}" cy="212" rx="84" ry="7" fill="#000" opacity="0.32"/>
    ${beaker(CX - 62, 84, 124, 122, "#6CB8FF", "u4x-watch", 0.56)}
    <g class="u4x-watch-steam">
      ${[-26, 0, 26].map((dx, i) => `<path style="animation-delay:${i * 0.5}s" d="M${CX + dx} 134 q7 -10 0 -19 t0 -18" stroke="rgba(255,255,255,.75)" stroke-width="3" stroke-linecap="round"/>`).join("")}
    </g>
    <g class="u4x-watch-dish">
      <g class="u4x-watch-drops">${[-24, 0, 24].map((dx) => `<path class="u4x-watch-drop" d="M${CX + dx} ${dx === 0 ? 92 : 89} c-5 7 -5 12 0 14 c5 -2 5 -7 0 -14 Z" fill="url(#u4wDrop)" stroke="#5BA7E0" stroke-width="1"/>`).join("")}</g>
      <path d="M${CX - 78} 76 q78 28 156 0 q-78 -8 -156 0 Z" fill="rgba(215,232,250,.35)" stroke="${A.glass}" stroke-width="2.4" stroke-linejoin="round"/>
      <path class="u4x-watch-melt" d="M${CX - 36} 81 q36 10 72 0" stroke="#7CC4F5" stroke-width="3.4" stroke-linecap="round" opacity="0"/>
      <rect class="u4x-watch-ice" x="${CX - 21}" y="46" width="42" height="34" rx="7" fill="url(#u4wIce)" stroke="#8FC1E8" stroke-width="1.6"/>
    </g>
    <g class="u4x-watch-strip sa" opacity="0"><rect x="${CX + 36}" y="112" width="9" height="56" rx="2" transform="rotate(14 ${CX + 40} 140)"/></g>
    <g class="u4x-watch-strip sb" opacity="0"><rect x="${CX + 27}" y="96" width="52" height="9" rx="2" transform="rotate(-10 ${CX + 53} 100)"/></g>
  </svg>`;
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const dish = q<SVGGElement>(".u4x-watch-dish");
  const ice = q<SVGRectElement>(".u4x-watch-ice");
  const melt = q<SVGPathElement>(".u4x-watch-melt");
  const steam = q<SVGGElement>(".u4x-watch-steam");
  const drops = Array.from(f.stage.querySelectorAll<SVGPathElement>(".u4x-watch-drop"));

  let hot = true;
  let asked = false;
  const seen = new Set<Spot>();

  function reset(): void {
    dish.style.transition = "none";
    dish.style.transform = "translateY(-70px)";
    dish.style.opacity = "0";
    ice.style.transform = "";
    melt.setAttribute("opacity", "0");
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
    steam.style.display = h ? "" : "none";
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
      ice.style.transform = `scale(${(1 - 0.25 * t * k).toFixed(2)}, ${(1 - 0.4 * t * k).toFixed(2)})`;
      melt.setAttribute("opacity", Math.min(0.95, t * 1.3 * k).toFixed(2));
      if (hot) drops.forEach((d, j) => (d.style.transform = `scale(${Math.max(0, Math.min(1, (t - 0.2 - j * 0.12) * 2)).toFixed(2)})`));
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

  // 3. 종이를 두 곳에 대기
  function paper(): void {
    f.pips(2);
    spotBtns.forEach((b) => (b.hidden = true));
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
  steam.style.display = "none";
  f.slot.setControls(bvCards(2, cHot, cCold));
  f.say("비커 위에 얼음 접시를 올릴 거예요. 먼저 비커에 <b>어떤 물</b>을 담을지 골라 보세요.");
  api.setCTA("비커에 담을 물을 골라 보세요", { enabled: false });
  return lab.cleanup;
};
