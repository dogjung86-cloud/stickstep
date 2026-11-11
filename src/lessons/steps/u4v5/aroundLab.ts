// [중1 Ⅳ v5] u4l6 주변 온도 랩: 「주변은 시원해질까요, 따뜻해질까요?」
// 책의 '상태 변화와 열에너지의 이용'(상태가 변할 때 주변의 온도가 어떻게 달라지는가)을 손으로 확인한다. 옛 단원에는 없던 랩이다.
// 여섯 가지 상태 변화 가운데 하나를 일으키면: 물질의 입자 배열이 바뀌고, 열에너지가 주변에서 물질로(또는 물질에서 주변으로) 흐르고, 주변의 온도계가 내려가거나 올라간다.
// 주문: "주변을 시원하게 만드는 변화 셋을 찾아보세요." 따뜻해지는 변화를 고르면 온도계가 반대로 올라간다(틀린 선택도 그대로 보여 준다).
// 셋을 찾은 뒤에는 남은 변화도 눌러 확인한다. 판정 질문은 따로 없다(찾기가 곧 판정이다). 시원한 쪽을 찾는 동안 한 번도 어긋나지 않았으면 맞힌 것으로 기록한다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards } from "../bio6/b6Lab";
import { A, grid, loose, seeded, svgOpen, u4Lab, type Pt, type U4Step } from "./u4Kit";

type Ph = "sol" | "liq" | "gas";
interface Change {
  k: string;
  name: string;
  from: Ph;
  to: Ph;
  absorb: boolean;
  ex: string;
}
// 카드의 차례는 흡수와 방출이 섞이게 놓았다(줄만 보고 가려낼 수 없게)
const CHANGES: Change[] = [
  { k: "melt", name: "융해", from: "sol", to: "liq", absorb: true, ex: "아이스박스 속의 얼음이 녹는다" },
  { k: "cond", name: "액화", from: "gas", to: "liq", absorb: false, ex: "찬 컵 겉에 물방울이 맺힌다" },
  { k: "subl", name: "승화", from: "sol", to: "gas", absorb: true, ex: "상자 속의 드라이아이스가 작아진다" },
  { k: "frz", name: "응고", from: "liq", to: "sol", absorb: false, ex: "손에 묻은 액체 파라핀이 굳는다" },
  { k: "vap", name: "기화", from: "liq", to: "gas", absorb: true, ex: "더운 날 도로에 뿌린 물이 마른다" },
  { k: "depo", name: "승화", from: "gas", to: "sol", absorb: false, ex: "수증기가 바로 얼음이 되어 눈으로 내린다" },
];
const WORD: Record<Ph, string> = { sol: "고체", liq: "액체", gas: "기체" };
const BOX = { x: 14, y: 46, w: 168, h: 132 }; // 물질의 입자 창
const TH = { x: 290, y0: 56, y1: 176 }; // 주변의 온도계(기둥의 위와 아래)

export const u4AroundLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-around" });
  const { f, tm } = lab;
  const rnd = seeded(113);
  const cx = BOX.x + BOX.w / 2;
  // 입자 아홉 개의 세 가지 놓임새
  const POS: Record<Ph, Pt[]> = {
    sol: grid(3, 3, cx, BOX.y + BOX.h - 34, 15),
    liq: loose(4, 3, cx, BOX.y + BOX.h - 18, 19, rnd).slice(0, 9),
    gas: grid(3, 3, cx, BOX.y + BOX.h / 2 + 8, 44).map((p) => ({ x: p.x + (rnd() - 0.5) * 16, y: p.y + (rnd() - 0.5) * 14 })),
  };

  f.stage.innerHTML = `${svgOpen}
    <rect x="${BOX.x}" y="${BOX.y}" width="${BOX.w}" height="${BOX.h}" rx="14" fill="rgba(124,107,255,.10)" stroke="rgba(155,140,255,.5)" stroke-width="1.6"/>
    <text class="u4x-around-cap" x="${cx}" y="${BOX.y - 12}" text-anchor="middle" font-size="14" font-weight="800" fill="${A.text}">물질</text>
    ${POS.sol.map((p) => `<circle class="u4x-around-p" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${A.part}" stroke="${A.partEdge}" stroke-width="1.2"/>`).join("")}
    <g class="u4x-around-flow">${[78, 112, 146].map((y, i) => `<path style="animation-delay:${i * 0.18}s" d="M206 ${y - 9} l14 9 l-14 9" stroke="#FFB15C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
    <text class="u4x-around-heat" x="232" y="182" text-anchor="middle" font-size="12.5" font-weight="800" fill="#FFD8A8"></text>
    <text x="${TH.x}" y="${BOX.y - 12}" text-anchor="middle" font-size="14" font-weight="800" fill="${A.text}">주변</text>
    <rect x="${TH.x - 9}" y="${TH.y0 - 8}" width="18" height="${TH.y1 - TH.y0 + 14}" rx="9" fill="rgba(255,255,255,.92)" stroke="#8B9BB0" stroke-width="1.6"/>
    <rect class="u4x-around-col" x="${TH.x - 4}" y="${TH.y0}" width="8" height="${TH.y1 - TH.y0}" rx="4" fill="#B9ADFF"/>
    <circle class="u4x-around-bulb" cx="${TH.x}" cy="${TH.y1 + 10}" r="11" fill="#B9ADFF" stroke="#8B9BB0" stroke-width="1.6"/>
    <path d="M${TH.x + 14} ${(TH.y0 + TH.y1) / 2} h10" stroke="#8B9BB0" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="3 3"/>
    <text class="u4x-around-read" x="${TH.x}" y="218" text-anchor="middle" font-size="13" font-weight="800" fill="${A.text}"></text>
  </svg>`;
  const exEl = el("div", { class: "u4x-around-ex" });
  f.stage.appendChild(exEl);
  const q = <T extends Element>(sel: string): T => f.stage.querySelector(sel) as T;
  const pEls = Array.from(f.stage.querySelectorAll<SVGCircleElement>(".u4x-around-p"));
  const cap = q<SVGTextElement>(".u4x-around-cap");
  const col = q<SVGRectElement>(".u4x-around-col");
  const bulb = q<SVGCircleElement>(".u4x-around-bulb");
  const heat = q<SVGTextElement>(".u4x-around-heat");
  const read = q<SVGTextElement>(".u4x-around-read");
  col.style.transform = "scaleY(0.5)";

  const place = (ph: Ph): void => pEls.forEach((c, i) => (c.style.transform = `translate(${(POS[ph][i].x - POS.sol[i].x).toFixed(1)}px, ${(POS[ph][i].y - POS.sol[i].y).toFixed(1)}px)`));

  const tried = new Set<string>();
  let cools = 0;
  let slips = 0;
  let phase: "find" | "rest" = "find";
  let busy = false;

  const cards = CHANGES.map((c) => {
    const card = bvCard("col u4x-around-card", { name: c.name, sub: `${WORD[c.from]} → ${WORD[c.to]}`, key: c.k });
    card.el.addEventListener("click", () => run(c, card));
    return card;
  });

  function run(c: Change, card: (typeof cards)[number]): void {
    if (busy || lab.finished()) return;
    busy = true;
    haptic(HAPTIC.tap);
    cards.forEach((x) => x.on(x === card));
    // 처음 상태로 놓고 → 변화를 일으킨다
    f.stage.classList.remove("in", "out");
    pEls.forEach((p) => (p.style.transition = "none"));
    place(c.from);
    col.style.transition = "none";
    col.style.transform = "scaleY(0.5)";
    col.setAttribute("fill", "#B9ADFF");
    bulb.setAttribute("fill", "#B9ADFF");
    cap.textContent = `물질: ${WORD[c.from]}`;
    heat.textContent = "";
    read.textContent = "";
    exEl.textContent = c.ex;
    void col.getBoundingClientRect();
    tm.later(() => {
      pEls.forEach((p) => (p.style.transition = ""));
      col.style.transition = "";
      place(c.to);
      cap.textContent = `물질: ${WORD[c.from]} → ${WORD[c.to]}`;
      f.stage.classList.add(c.absorb ? "in" : "out");
      heat.textContent = c.absorb ? "열에너지 흡수" : "열에너지 방출";
      col.style.transform = `scaleY(${c.absorb ? 0.26 : 0.78})`;
      const color = c.absorb ? "#74C0FC" : "#F0705E";
      col.setAttribute("fill", color);
      bulb.setAttribute("fill", color);
    }, 350);
    tm.later(() => {
      busy = false;
      read.textContent = c.absorb ? "시원해졌어요" : "따뜻해졌어요";
      const first = !tried.has(c.k);
      tried.add(c.k);
      card.el.classList.add(c.absorb ? "cool" : "warm");
      card.sub(c.absorb ? "주변이 시원해짐" : "주변이 따뜻해짐");
      host.dataset.u4Around = String(tried.size);
      if (phase === "find") {
        if (c.absorb) {
          haptic(HAPTIC.correct);
          if (first) cools += 1;
          f.say(`<b>${c.name}</b>는 열에너지를 <b>흡수</b>해요. 주변이 시원해졌어요. ${cools < 3 ? `${3 - cools}가지를 더 찾아보세요.` : ""}`);
          if (cools === 3) {
            phase = "rest";
            f.pips(1);
            api.recordQuiz(slips === 0);
            tm.later(() => f.say("시원하게 하는 변화 셋을 다 찾았어요. <b>남은 변화</b>도 눌러 주변이 어떻게 되는지 보세요."), 1400);
          }
        } else {
          if (first) slips += 1;
          haptic(HAPTIC.wrong);
          f.say(`<b>${c.name}</b>는 열에너지를 <b>방출</b>해요. 주변이 오히려 따뜻해졌어요. 다른 변화를 골라 보세요.`);
        }
      } else {
        haptic(c.absorb ? HAPTIC.tap : HAPTIC.correct);
        f.say(`<b>${c.name}</b>는 열에너지를 <b>${c.absorb ? "흡수" : "방출"}</b>해요. 주변이 ${c.absorb ? "시원해졌어요" : "따뜻해졌어요"}.`);
      }
      if (tried.size === CHANGES.length && !lab.finished()) {
        f.pips(2);
        tm.later(() => lab.finish("<b>융해, 기화, 승화(고체→기체)</b>는 열에너지를 흡수해 주변이 시원해져요. <b>응고, 액화, 승화(기체→고체)</b>는 방출해 주변이 따뜻해져요."), 1500);
      }
    }, 1500);
  }

  place("sol");
  cap.textContent = "물질: 고체";
  f.slot.setControls(bvCards(3, ...cards));
  f.say("상태 변화를 하나 골라 일으켜 보세요. <b>주변을 시원하게</b> 만드는 변화 셋을 찾아요.");
  api.setCTA("주변을 시원하게 하는 변화를 찾으세요", { enabled: false });
  return lab.cleanup;
};
