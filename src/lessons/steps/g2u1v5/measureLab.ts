// [중2 Ⅰ v5] g2u1l1 측정 랩: 「같은 물질끼리 짝지을 수 있을까요?」
// 책의 탐구(질량과 부피를 측정하여 철과 알루미늄 구별하기)를 손으로 한다: 전자저울로 질량을, 물이 든 눈금실린더에 실로 묶은 조각을 잠가 부피를 잰다.
// 학생이 정하는 것: 어느 조각을 무엇으로 먼저 잴지, 실을 얼마나 내리고 눈금을 읽을지.
// 실패하는 길: 조각이 다 잠기기 전에 눈금을 읽으면 늘어난 부피가 작게 나와 기록되지 않는다.
// 통찰 하나: 크기가 달라도 같은 물질이면 질량 ÷ 부피가 같다(철 7.9, 알루미늄 2.7).
// 수치: 조각의 부피는 이 랩에서 정했고 질량은 밀도(철 7.87, 알루미늄 2.70 g/cm³)로 계산했다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { P, clamp, fx, g1Hold, g1Lab, g1Row, scale, svgOpen, type G1Step } from "./g2u1Kit";

interface Piece {
  name: string;
  m: number;
  v: number;
  w: number;
  h: number;
}
const PIECES: Piece[] = [
  { name: "가", m: 78.7, v: 10, w: 22, h: 22 }, // 철
  { name: "나", m: 27.0, v: 10, w: 22, h: 22 }, // 알루미늄(가와 크기가 같다)
  { name: "다", m: 31.5, v: 4, w: 16, h: 16 }, // 철
  { name: "라", m: 54.0, v: 20, w: 26, h: 34 }, // 알루미늄
];
const TRAY_X = [30, 62, 94, 126];
const TRAY_Y = 96;
const SC = { x: 14, y: 160, w: 128 };
const CY = { cx: 236, y0: 196, k: 1.6, w: 40 }; // 0 mL의 y, mL당 px
const V0 = 50;
const yOf = (ml: number): number => CY.y0 - CY.k * ml;

export const g2u1MeasureLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-ms" });
  const { f, tm } = lab;

  let ticks = "";
  for (let ml = 0; ml <= 100; ml += 10) {
    const long = ml % 50 === 0;
    ticks += `<path d="M${CY.cx + CY.w / 2} ${yOf(ml)} h${long ? -12 : -7}" stroke="${P.glass}" stroke-width="1.2"/>`;
    if (long && ml) ticks += `<text x="${CY.cx + CY.w / 2 + 5}" y="${yOf(ml) + 4}" font-size="12" font-weight="700" fill="${P.dim}">${ml}</text>`;
  }
  f.stage.innerHTML = `${svgOpen}
    <path d="M10 ${TRAY_Y} h136" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M18 ${TRAY_Y} v8 M138 ${TRAY_Y} v8" stroke="${P.glass}" stroke-width="2.4" stroke-linecap="round"/>
    ${scale(SC.x, SC.y, SC.w, "g2u1x-ms")}
    <rect class="g2u1x-ms-water" x="${CY.cx - CY.w / 2 + 2}" y="${yOf(V0)}" width="${CY.w - 4}" height="${CY.y0 - yOf(V0)}" fill="${P.water}" opacity="0.45"/>
    <path class="g2u1x-ms-thread" d="M${CY.cx} 4 V4" stroke="#E9EEF5" stroke-width="1.2"/>
    <g class="g2u1x-ms-pcs">${PIECES.map(
      (p, i) => `<g class="g2u1x-ms-pc" data-i="${i}"><rect x="${-p.w / 2}" y="${-p.h}" width="${p.w}" height="${p.h}" rx="3" fill="${P.metal}" stroke="${P.metalEdge}" stroke-width="1.4"/><path d="M${-p.w / 2 + 3} ${-p.h + 4} h${p.w - 9}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><text y="${-p.h - 5}" text-anchor="middle" font-size="13" font-weight="800" fill="${P.text}">${p.name}</text></g>`,
    ).join("")}</g>
    <path d="M${CY.cx - CY.w / 2} 30 V${CY.y0} a4 4 0 0 0 4 4 h${CY.w - 8} a4 4 0 0 0 4 -4 V30" stroke="${P.glass}" stroke-width="2.2"/>
    <path d="M${CY.cx - CY.w / 2 - 10} ${CY.y0 + 10} h${CY.w + 20}" stroke="${P.glass}" stroke-width="5" stroke-linecap="round"/>
    ${ticks}
    <text x="${CY.cx + CY.w / 2 + 5}" y="26" font-size="12" font-weight="700" fill="${P.dim}">mL</text>
    <g class="g2u1x-ms-rd" opacity="0">
      <path class="g2u1x-ms-rdl" d="M0 0" stroke="${P.yellow}" stroke-width="1.4" stroke-dasharray="3 3"/>
      <text class="g2u1x-ms-rdt" x="318" y="0" text-anchor="middle" font-size="15" font-weight="800" fill="${P.yellow}"></text>
    </g>
    <text x="78" y="20" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}">은빛 금속 조각</text>
  </svg>`;
  const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
  const read = q<SVGTextElement>(".g2u1x-ms-read");
  const water = q<SVGRectElement>(".g2u1x-ms-water");
  const thread = q<SVGPathElement>(".g2u1x-ms-thread");
  const rd = q<SVGGElement>(".g2u1x-ms-rd");
  const rdl = q<SVGPathElement>(".g2u1x-ms-rdl");
  const rdt = q<SVGTextElement>(".g2u1x-ms-rdt");
  const pcs = Array.from(f.stage.querySelectorAll<SVGGElement>(".g2u1x-ms-pc"));

  let sel = -1;
  let where: "tray" | "scale" | "cyl" = "tray";
  let d = 0; // 실을 내린 정도(0~1)
  let level = V0;
  const gotM = [false, false, false, false];
  const gotV = [false, false, false, false];

  const place = (i: number, x: number, y: number): void => {
    pcs[i].style.transform = `translate(${x}px, ${y}px)`;
  };
  function paint(): void {
    PIECES.forEach((p, i) => {
      if (i !== sel || where === "tray") place(i, TRAY_X[i], TRAY_Y);
      else if (where === "scale") place(i, SC.x + SC.w / 2, SC.y);
      else {
        const bottom = 74 + (190 - 74) * d;
        let frac = clamp((bottom - yOf(V0)) / p.h);
        frac = clamp((bottom - yOf(V0 + p.v * frac)) / p.h);
        level = V0 + p.v * frac;
        place(i, CY.cx, bottom);
        thread.setAttribute("d", `M${CY.cx} 4 V${bottom - p.h}`);
      }
      pcs[i].classList.toggle("on", i === sel);
    });
    if (where !== "cyl") {
      level = V0;
      thread.setAttribute("d", `M${CY.cx} 4 V4`);
    }
    water.setAttribute("y", fx(yOf(level)));
    water.setAttribute("height", fx(CY.y0 - yOf(level)));
    read.textContent = where === "scale" && sel >= 0 ? `${fx(PIECES[sel].m)} g` : "0.0 g";
  }

  const cards = PIECES.map((p, i) => bvCard("g2u1x-ms-card", { name: `조각 ${p.name}`, sub: "아직 재지 않았어요", key: String(i) }));
  const bScale = bvBtn("", "저울에 올리기");
  const bCyl = bvBtn("", "눈금실린더에 넣기");
  bScale.dataset.k = "scale";
  bCyl.dataset.k = "cyl";
  const bRead = bvBtn("", "눈금 읽기");
  bRead.dataset.k = "read";
  const hold = g1Hold(lab, "꾹 눌러 실 내리기", (ms) => {
    d = clamp(d + ms / 1100);
    rd.setAttribute("opacity", "0");
    paint();
    if (d >= 1) lab.todo("[data-k='read']");
    return d < 1;
  });

  const subOf = (i: number): string => {
    const p = PIECES[i];
    if (!gotM[i] && !gotV[i]) return "아직 재지 않았어요";
    return `${gotM[i] ? fx(p.m) + " g" : "질량 ?"} · ${gotV[i] ? fx(p.v) + " mL" : "부피 ?"}`;
  };
  function nextTodo(): void {
    const i = PIECES.findIndex((_, k) => !gotM[k] || !gotV[k]);
    if (i < 0) return;
    if (sel !== i) lab.todo(`.g2u1x-ms-card[data-k='${i}']`);
    else lab.todo(!gotM[i] ? "[data-k='scale']" : "[data-k='cyl']");
  }
  function main(): void {
    where = where === "cyl" ? "tray" : where;
    rd.setAttribute("opacity", "0");
    paint();
    cards.forEach((c, i) => {
      c.sub(subOf(i));
      c.on(i === sel);
      if (gotM[i] && gotV[i] && !c.isDone()) c.done();
    });
    bScale.disabled = sel < 0 || gotM[sel];
    bCyl.disabled = sel < 0 || gotV[sel];
    f.slot.setControls(bvCards(2, ...cards), g1Row(bScale, bCyl));
    const left = gotM.filter((x) => !x).length + gotV.filter((x) => !x).length;
    f.pips(left === 0 ? 1 : 0);
    if (left === 0) return calcPhase();
    api.setCTA(`질량과 부피를 재어 보세요 (남은 측정 ${left}번)`, { enabled: false });
    nextTodo();
  }
  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      sel = i;
      where = "tray";
      f.say(`<b>조각 ${PIECES[i].name}</b>를 골랐어요. <b>저울</b>에 올리거나 <b>눈금실린더</b>에 넣어 보세요.`);
      main();
    }),
  );
  bScale.addEventListener("click", () => {
    if (sel < 0) return;
    haptic(HAPTIC.tap);
    where = "scale";
    gotM[sel] = true;
    f.say(`조각 ${PIECES[sel].name}의 질량은 <b>${fx(PIECES[sel].m)} g</b>이에요. 표에 적었어요.`);
    main();
  });
  bCyl.addEventListener("click", () => {
    if (sel < 0) return;
    haptic(HAPTIC.tap);
    where = "cyl";
    d = 0;
    paint();
    hold.disabled = false;
    f.say(`물은 <b>${fx(V0)} mL</b>예요. 실을 내려 조각을 <b>완전히 잠기게</b> 한 뒤 눈금을 읽어요.`);
    f.slot.setControls(g1Row(hold, bRead));
    api.setCTA("실을 내리고 눈금을 읽어 보세요", { enabled: false });
    lab.todo(".g2u1x-hold");
  });
  bRead.addEventListener("click", () => {
    if (where !== "cyl" || sel < 0) return;
    const p = PIECES[sel];
    const y = yOf(level);
    rdl.setAttribute("d", `M${CY.cx - CY.w / 2} ${fx(y)} H296`);
    rdt.setAttribute("y", fx(y + 5));
    rdt.textContent = `${fx(level)} mL`;
    rd.setAttribute("opacity", "1");
    if (level < V0 + p.v - 0.05) {
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = "1";
      f.say(`조각이 <b>다 잠기지 않았어요</b>. 이대로면 부피가 ${fx(level - V0)} mL로 작게 나와요. 더 내려 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    gotV[sel] = true;
    hold.disabled = true;
    f.say(`물이 ${fx(V0)} mL에서 <b>${fx(level)} mL</b>로 늘었어요. 늘어난 <b>${fx(p.v)} mL</b>가 조각의 부피예요.`);
    lab.todo();
    tm.later(main, 1500);
  });

  function calcPhase(): void {
    lab.todo("[data-k='calc']");
    const bCalc = bvBtn("main", "질량 ÷ 부피 계산하기");
    bCalc.dataset.k = "calc";
    cards.forEach((c) => {
      c.el.disabled = true;
      c.on(false);
    });
    sel = -1;
    paint();
    f.say("가와 나는 크기가 같은데 질량이 달라요. 조각마다 <b>질량 ÷ 부피</b>를 계산해 봐요.");
    f.slot.setControls(bvCards(2, ...cards), bCalc);
    api.setCTA("질량 ÷ 부피를 계산해 보세요", { enabled: false });
    bCalc.addEventListener("click", () => {
      bCalc.disabled = true;
      haptic(HAPTIC.tap);
      PIECES.forEach((p, i) => tm.later(() => cards[i].sub(`${fx(p.m)} ÷ ${fx(p.v)} = ${fx(p.m / p.v)}`), 350 * i));
      tm.later(() => {
        f.pips(2);
        f.say("질량 ÷ 부피 값이 <b>두 가지</b>로 나뉘었어요. 카드의 값을 보고 답해 보세요.");
        // 판정의 근거(네 조각의 계산값)를 무대에 남긴다
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.innerHTML = `<rect x="156" y="62" width="50" height="86" rx="8" fill="rgba(11,21,36,.82)" stroke="${P.grid}"/>${PIECES.map(
          (p, i) => `<text x="181" y="${80 + i * 20}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${p.m / p.v > 5 ? P.rose : P.green}">${p.name} ${fx(p.m / p.v)}</text>`,
        ).join("")}`;
        f.stage.querySelector("svg")?.appendChild(g);
        lab.judge(
          "<b>조각 가</b>와 같은 물질인 조각은?",
          [{ t: "조각 다 (크기는 가보다 작다)", ok: true }, { t: "조각 나 (크기가 가와 같다)" }, { t: "조각 라 (가장 크다)" }],
          "가와 다는 질량 ÷ 부피가 <b>7.9</b>로 같아요. 나는 크기가 같아도 2.7이에요.",
          () => lab.finish("크기가 달라도 같은 물질이면 <b>질량 ÷ 부피</b>가 같아요. 가와 다는 철(7.9), 나와 라는 알루미늄(2.7)이에요."),
        );
      }, 350 * 4 + 500);
    });
  }

  paint();
  f.say("색이 비슷한 금속 조각 네 개예요. <b>조각을 골라</b> 질량과 부피를 재어 보세요.");
  main();
  return lab.cleanup;
};
