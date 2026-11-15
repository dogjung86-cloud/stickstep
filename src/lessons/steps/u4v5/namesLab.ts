// [중1 Ⅳ v5] u4l3 상태 변화 이름 랩: 「이름대로 물을 바꿔 볼까요?」
// 만화에서 배운 이름 넷(기화, 액화, 응고, 융해)을 손으로 일으킨다. 메타볼 무대(물리 수치 불변)와 온도 막대를 쓴다.
// 이름을 주면 학생이 그 변화를 일으킨다. 다른 변화를 일으키면 그 자리에서 무엇을 일으켰는지 알려 준다(틀린 조작도 해 볼 수 있다).
//   50℃ 물에서 시작: 기화(올린다. 내리면 응고) → 액화 → 응고(더 내린다. 올리면 기화) → 융해.
// 판정 질문은 따로 없다(조작이 곧 판정이다). 한 번도 어긋나지 않았으면 맞힌 것으로 기록한다.
// 그림(2026-11-15, 감사 하 후보): 물이 허공에 뜨지 않게 그릇 윤곽(공용 유리 그리기)을 두르고, 결론 때는 무대를 세 상태와 이름 붙은 화살 넷
//   (위는 온도를 올렸을 때의 융해와 기화, 아래는 내렸을 때의 응고와 액화)으로 바꿔 '서로 반대 방향'을 한 장에 보인다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { colFor } from "../../../renderers/palette";
import { glassVessel } from "../../../ui/labProps";
import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { deg, svgOpen, u4Lab, u4Matter, u4ViewBtn, type U4Step } from "./u4Kit";

/** 결론 그림: 고체, 액체, 기체 세 칸과 그 사이의 이름 붙은 화살 넷. */
function summarySvg(): string {
  const P = "#6E9EDB";
  const dot = (x: number, y: number): string => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.4" fill="${P}"/><circle cx="${(x - 1.3).toFixed(1)}" cy="${(y - 1.4).toFixed(1)}" r="1.3" fill="#fff" opacity=".5"/>`;
  const X = [52, 173, 294];
  const Y = 96;
  const icon = [
    [-10, 0, 10].flatMap((dx) => [-10, 0, 10].map((dy) => dot(X[0] + dx, Y + 6 + dy))).join(""),
    [[-15, 22], [-5, 23], [5, 21], [15, 22], [-10, 13], [0, 12], [10, 13], [-1, 4]].map(([dx, dy]) => dot(X[1] + dx, Y + dy)).join(""),
    [[-22, -16], [12, -20], [-4, 0], [22, 6], [-18, 22], [8, 24]].map(([dx, dy], i) => `<path d="M${X[2] + dx - 6 + (i % 2) * 12} ${Y + dy + 4} L${X[2] + dx} ${Y + dy}" stroke="#9FC2EE" stroke-width="2" stroke-linecap="round" opacity=".55"/>${dot(X[2] + dx, Y + dy)}`).join(""),
  ];
  const names = [["고체", "얼음"], ["액체", "물"], ["기체", "수증기"]];
  const node = (i: number): string => `<rect x="${X[i] - 38}" y="${Y - 34}" width="76" height="68" rx="14" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)" stroke-width="1.3"/>${icon[i]}
    <text x="${X[i]}" y="${Y + 53}" text-anchor="middle" font-size="14" font-weight="800" fill="#E8EEF7">${names[i][0]}</text>
    <text x="${X[i]}" y="${Y + 69}" text-anchor="middle" font-size="12" font-weight="700" fill="#8CA2C0">${names[i][1]}</text>`;
  const UP = "#FF922B", DN = "#74C0FC";
  const pair = (x0: number, x1: number, fwd: string, back: string): string => `
    <path d="M${x0} ${Y - 10} H${x1 - 2}" stroke="${UP}" stroke-width="2.8" stroke-linecap="round"/><path d="M${x1 - 8} ${Y - 15} L${x1 - 1} ${Y - 10} L${x1 - 8} ${Y - 5}" stroke="${UP}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${(x0 + x1) / 2}" y="${Y - 18}" text-anchor="middle" font-size="13" font-weight="800" fill="${UP}">${fwd}</text>
    <path d="M${x1} ${Y + 10} H${x0 + 2}" stroke="${DN}" stroke-width="2.8" stroke-linecap="round"/><path d="M${x0 + 8} ${Y + 5} L${x0 + 1} ${Y + 10} L${x0 + 8} ${Y + 15}" stroke="${DN}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${(x0 + x1) / 2}" y="${Y + 28}" text-anchor="middle" font-size="13" font-weight="800" fill="${DN}">${back}</text>`;
  return `${svgOpen}
    ${node(0)}${node(1)}${node(2)}
    ${pair(X[0] + 42, X[1] - 42, "융해", "응고")}
    ${pair(X[1] + 42, X[2] - 42, "기화", "액화")}
    <path d="M70 211 H90" stroke="${UP}" stroke-width="2.6" stroke-linecap="round"/><path d="M85 206.5 L90 211 L85 215.5" stroke="${UP}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="96" y="215.5" font-size="12.5" font-weight="700" fill="#B9C8DE">온도를 올리면</text>
    <path d="M196 211 H216" stroke="${DN}" stroke-width="2.6" stroke-linecap="round"/><path d="M201 206.5 L196 211 L201 215.5" stroke="${DN}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="222" y="215.5" font-size="12.5" font-weight="700" fill="#B9C8DE">온도를 내리면</text>
  </svg>`;
}

type Ph = "sol" | "liq" | "gas";
const phaseOf = (t: number): Ph => (t < 0.5 ? "sol" : t < 100 ? "liq" : "gas");
const WORD: Record<Ph, string> = { sol: "고체", liq: "액체", gas: "기체" };
const STATE: Record<Ph, string> = { sol: "고체(얼음)", liq: "액체(물)", gas: "기체(수증기)" };
const CHANGE: Record<string, string> = { "sol>liq": "융해", "liq>gas": "기화", "gas>liq": "액화", "liq>sol": "응고" };
const MISSIONS: { name: string; from: Ph; to: Ph }[] = [
  { name: "기화", from: "liq", to: "gas" },
  { name: "액화", from: "gas", to: "liq" },
  { name: "응고", from: "liq", to: "sol" },
  { name: "융해", from: "sol", to: "liq" },
];
const T0 = 50;

export const u4NamesLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 4, cls: "u4x-names" });
  const { f } = lab;

  let T = T0;
  let idx = 0;
  let slips = 0;

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: STATE.liq });
  const m = u4Matter(lab, {
    sim: { count: 48, r: 6.5, temp: T0, walls: (w, h) => ({ x0: 6, y0: 6, x1: w - 6, y1: h - 46 }) },
    overlay: (ctx, _w, _h, sim) => glassVessel(ctx, sim.bounds()),
    onReady: () => paint(),
  });
  m.pill.append(dot, name);
  const chips = MISSIONS.map((ms) => el("span", { class: "u4x-chip", text: ms.name }));
  const chipRow = el("div", { class: "u4x-chips" }, ...chips);
  f.stage.appendChild(chipRow);
  /** 결론: 무대를 세 상태와 이름 붙은 화살 넷으로 바꾼다. */
  const showSummary = (): void => {
    chipRow.style.display = "none";
    f.stage.appendChild(el("div", { class: "u4x-names-sum", html: summarySvg() }));
    host.dataset.u4Sum = "1";
  };

  function paint(): void {
    m.ms.setTemp(T);
    name.textContent = STATE[phaseOf(T)];
    m.read.textContent = deg(T);
    dot.style.background = colFor(T, 66, 1);
    dot.style.boxShadow = `0 0 8px ${colFor(T, 60, 0.8)}`;
    chips.forEach((c, i) => {
      c.classList.toggle("on", i < idx);
      c.classList.toggle("now", i === idx);
    });
    host.dataset.u4T = String(Math.round(T));
    host.dataset.u4Mission = String(idx);
  }
  const prompt = (): string => `<b>${MISSIONS[idx].name}</b>를 일으켜 보세요. 온도 막대를 밀어 ${WORD[MISSIONS[idx].from]}를 ${WORD[MISSIONS[idx].to]}로 바꿔요.`;

  function change(a: Ph, b: Ph): void {
    if (idx >= MISSIONS.length) return;
    const ms = MISSIONS[idx];
    const did = CHANGE[`${a}>${b}`];
    if (a === ms.from && b === ms.to) {
      haptic(HAPTIC.correct);
      m.ms.toast(`${did}: ${WORD[a]} → ${WORD[b]}`);
      idx += 1;
      f.pips(idx);
      if (idx >= MISSIONS.length) {
        api.recordQuiz(slips === 0);
        range.input.disabled = true;
        lab.tm.later(() => {
          showSummary();
          lab.finish("<b>융해와 응고</b>, <b>기화와 액화</b>는 서로 반대 방향이에요. 이렇게 물질의 상태가 바뀌는 것이 <b>상태 변화</b>예요.");
        }, 1200);
        f.say(`<b>${did}</b> 성공! ${WORD[a]}가 ${WORD[b]}로 변했어요. 이름 넷을 모두 일으켰어요.`);
      } else f.say(`<b>${did}</b> 성공! 다음은 <b>${MISSIONS[idx].name}</b>예요. ${WORD[MISSIONS[idx].from]}를 ${WORD[MISSIONS[idx].to]}로 바꿔 보세요.`);
    } else if (a === ms.from) {
      slips += 1;
      haptic(HAPTIC.wrong);
      m.ms.toast(`방금은 ${did}(${WORD[a]} → ${WORD[b]})`);
      f.say(`방금 일으킨 변화는 <b>${did}</b>예요. <b>${ms.name}</b>는 ${WORD[ms.from]}가 <b>${WORD[ms.to]}</b>로 변하는 거예요.`);
    }
  }

  const range = bvRange({
    cls: "u4x-names-range",
    min: -20,
    max: 120,
    value: T0,
    label: "온도: 막대를 밀어 바꿔요",
    ticks: [{ t: "−20℃", p: 0 }, { t: "0℃", p: 14.3 }, { t: "100℃", p: 85.7 }, { t: "120℃", p: 100 }],
    onInput: (v) => {
      const order: Ph[] = ["sol", "liq", "gas"];
      let a = order.indexOf(phaseOf(T));
      const b = order.indexOf(phaseOf(v));
      T = v;
      while (a !== b) {
        const n = a + Math.sign(b - a);
        change(order[a], order[n]);
        a = n;
      }
      paint();
    },
  });
  f.slot.setControls(range.el, u4ViewBtn(m));

  f.say(prompt());
  api.setCTA("이름 넷을 차례로 일으켜 보세요", { enabled: false });
  return lab.cleanup;
};
