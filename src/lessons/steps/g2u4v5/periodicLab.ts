// [중2 Ⅳ v5] g2u4l4 주기율표 랩 세 판.
//   g2u4TableLab 「빈칸에는 어떤 원소가 들어갈까요?」
//     원자 번호 1번부터 20번까지의 표에서 빈칸 셋(9번, 11번, 18번)에 원소 카드를 놓는다. 학생이 정하는 것: 어느 카드를 어느 칸에 놓을지.
//     실패하는 길: 번호가 맞지 않는 칸에 놓으면 카드가 되돌아오고 그 칸의 번호가 무엇을 뜻하는지 알려 준다.
//   g2u4AlkaliLab 「같은 세로줄 금속은 물에서 닮았을까요?」
//     책의 탐구 1(리튬, 나트륨, 칼륨의 물과의 반응 실험 영상 관찰하기). 학생이 금속을 골라 물에 넣는다. 2족의 마그네슘도 넣어 볼 수 있다(찬물에서는 거의 변화가 없다).
//   g2u4NobleLab 「헬륨, 네온, 아르곤은 무엇이 닮았을까요?」
//     책의 탐구 2(헬륨, 네온, 아르곤의 성질 조사하기). 학생이 기체와 살펴볼 것(상온에서의 상태, 불꽃을 대었을 때)을 골라 표를 채운다. 견줄 기체로 수소도 살펴볼 수 있다.

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { bad, ball, bvBtn, cap, g4Lab, g4Svg, good, row, tap, toast, txt, type G4Step } from "./kit";

// ── 표 채우기 ───────────────────────────────────────────────────────
const TABLE: (string | null)[][] = [
  ["H", null, null, null, null, null, null, "He"],
  ["Li", "Be", "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", null, null, null, null, null, null],
];
const BLANKS: Record<string, string> = { F: "플루오린", Na: "나트륨", Ar: "아르곤" };

export const g2u4TableLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 3, cls: "g2u4x-table", wait: "빈칸 셋을 채워 보세요" });
  const { f, tm } = lab;
  const grid = el("div", { class: "g2u4x-tb-grid" });
  f.stage.appendChild(grid);
  let held: string | null = null;
  const placed = new Set<string>();
  const numOf: Record<string, number> = {};
  let no = 0;
  TABLE.forEach((r, ri) =>
    r.forEach((sym, ci) => {
      if (!sym) return;
      no += 1;
      numOf[sym] = no;
      const blank = sym in BLANKS;
      const cell = el(blank ? "button" : "div", { class: `g2u4x-tb-cell${blank ? " blank" : ""}`, attrs: blank ? { type: "button", "aria-label": `${no}번 빈칸` } : {} }, el("i", { text: String(no) }), el("b", { text: blank ? "?" : sym }));
      cell.style.left = `${13 + ci * 40}px`;
      cell.style.top = `${12 + ri * 52}px`;
      if (blank) {
        cell.dataset.no = String(no);
        cell.addEventListener("click", () => {
          if (placed.has(sym)) return;
          if (!held) {
            bad();
            toast(lab, "카드를 먼저 골라요", true);
            return;
          }
          if (held !== sym) {
            bad();
            lab.slip();
            f.say(`이 칸은 <b>${numOf[sym]}번</b>이에요. 양성자가 ${numOf[sym]}개인 원소가 들어가요. 카드의 양성자수를 다시 보세요.`);
            host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
            return;
          }
          good();
          placed.add(sym);
          cell.classList.add("filled");
          cell.querySelector("b")!.textContent = sym;
          const card = cards.find((c) => c.dataset.k === sym);
          card?.classList.remove("on");
          if (card) card.disabled = true;
          held = null;
          f.pips(placed.size);
          host.dataset.g4Done = String(placed.size);
          if (placed.size < 3) {
            f.say(`<b>${BLANKS[sym]}</b>은 양성자가 ${numOf[sym]}개라서 ${numOf[sym]}번 칸이에요. 다음 카드를 골라 보세요.`);
            return;
          }
          f.say("빈칸을 모두 채웠어요. 번호가 하나씩 커지는 차례로 놓여 있어요.");
          tm.later(() => {
            lab.judge("칼슘(Ca)은 <b>20번</b> 칸에 있어요. 칼슘 원자의 양성자는 몇 개일까요?", [{ t: "20개", ok: true }, { t: "2개" }, { t: "4개" }], "칸의 번호는 그 원소의 <b>양성자수</b>예요.", () =>
              lab.finish("원소를 <b>양성자수</b>가 작은 것부터 차례로 늘어놓으면 이 표가 돼요. 칸의 번호가 곧 양성자수예요."),
            );
          }, 1200);
        });
      }
      grid.appendChild(cell);
    }),
  );
  const cards = Object.entries(BLANKS).map(([sym, name]) => {
    const b = el("button", { class: "g2u4x-tb-card", attrs: { type: "button" } }, el("b", { text: sym }), el("span", { text: name }), el("i", { text: `양성자 ${numOf[sym]}개` })) as HTMLButtonElement;
    b.dataset.k = sym;
    b.addEventListener("click", () => {
      tap();
      held = sym;
      cards.forEach((c) => c.classList.toggle("on", c === b));
      f.say(`<b>${name}</b> 카드를 들었어요. 들어갈 <b>빈칸</b>을 눌러 놓아 보세요.`);
    });
    return b;
  });
  // 카드의 차례는 번호순이 아니게 둔다(아르곤, 플루오린, 나트륨)
  f.slot.setControls(row(cards[2], cards[0], cards[1]));
  f.say("1번부터 20번까지의 원소 표예요. <b>카드를 고르고</b> 들어갈 빈칸을 눌러 놓아 보세요.");
  return lab.cleanup;
};

// ── 1족 금속과 물 ───────────────────────────────────────────────────
interface Metal {
  k: string;
  name: string;
  sym: string;
  cls: string;
  log: string;
  say: string;
  cell: [number, number]; // 표 조각의 [열, 행]
  reacts: boolean;
}
const METALS: Metal[] = [
  { k: "li", name: "리튬", sym: "Li", cls: "li", log: "기포를 내며 반응", say: "<b>리튬</b>이 물 위에 떠서 <b>기포</b>를 내며 반응해요.", cell: [0, 0], reacts: true },
  { k: "na", name: "나트륨", sym: "Na", cls: "na", log: "빠르게 돌며 반응", say: "<b>나트륨</b>이 물 위를 빠르게 돌아다니며 <b>기체</b>를 내요.", cell: [0, 1], reacts: true },
  { k: "k", name: "칼륨", sym: "K", cls: "k", log: "불꽃을 내며 격렬히 반응", say: "<b>칼륨</b>은 불꽃까지 내며 가장 격렬하게 반응해요. 기체도 나와요.", cell: [0, 2], reacts: true },
  { k: "mg", name: "마그네슘", sym: "Mg", cls: "mg", log: "가라앉고 거의 변화 없음", say: "<b>마그네슘</b>은 가라앉아요. 찬물에서는 거의 변화가 없어요.", cell: [1, 1], reacts: false },
];
const FRAG = [
  ["Li", "Be"],
  ["Na", "Mg"],
  ["K", "Ca"],
];

export const g2u4AlkaliLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 3, cls: "g2u4x-alkali", wait: "1족 금속 셋을 물에 넣어 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "물이 담긴 수조와 주기율표의 1족, 2족 조각");
  const log = cap(lab, "g2u4x-al-log");
  const tried = new Map<string, Metal>();
  let cur: Metal | null = null;
  let busy = false;

  const draw = (): void => {
    const frag = FRAG.map((r, ri) =>
      r
        .map((sym, ci) => {
          const m = [...tried.values()].find((x) => x.sym === sym);
          const x = 232 + ci * 52;
          const y = 62 + ri * 46;
          return `<rect x="${x}" y="${y}" width="48" height="42" rx="9" fill="${m ? (m.reacts ? "rgba(255,170,80,.3)" : "rgba(150,165,190,.22)") : "rgba(255,255,255,.05)"}" stroke="${m ? (m.reacts ? "#FFB55A" : "#8CA2C0") : "rgba(255,255,255,.16)"}" stroke-width="1.4"/>${txt(x + 24, y + 27, sym, { size: 15, fill: m ? "#fff" : "#6F84A3", weight: 800 })}`;
        })
        .join(""),
    ).join("");
    const piece = cur
      ? `<g class="g2u4x-al-piece ${cur.cls}">
          ${cur.cls === "k" ? `<path class="g2u4x-al-flame" d="M110 84 Q102 70 110 54 Q114 66 120 60 Q124 74 116 86 Z" fill="#C9A0FF" stroke="#8E5CF0" stroke-width="1"/>` : ""}
          ${ball(111, 94, cur.sym, { k: 0.9 })}
          ${cur.reacts ? [-16, -8, 9, 17].map((dx, i) => `<circle class="g2u4x-al-fizz" cx="${111 + dx}" cy="${90 - (i % 2) * 7}" r="${2.4 + (i % 2)}" style="animation-delay:${-i * 0.23}s"/>`).join("") : ""}
        </g>`
      : "";
    stage.set(`
      <path d="M16 56 L16 196 Q16 204 24 204 L198 204 Q206 204 206 196 L206 56" fill="rgba(160,200,255,.05)" stroke="#9CB4D6" stroke-width="2.2"/>
      <rect x="17.5" y="98" width="187" height="104.5" rx="6" fill="rgba(120,190,255,.24)"/>
      <line x1="18" y1="98" x2="204" y2="98" stroke="#BFE0FF" stroke-width="1.6" opacity=".8"/>
      ${piece}
      ${txt(256, 52, "1족", { size: 13, fill: "#FFD9A8" })}${txt(308, 52, "2족", { size: 13 })}
      ${frag}
    `);
    log.textContent = cur ? `${cur.name}: ${cur.log}` : "금속을 골라 물에 넣어요";
    host.dataset.g4Tried = [...tried.keys()].join(",");
  };

  const btns = METALS.map((m) => {
    const b = el("button", { class: "g2u4x-chipbtn", attrs: { type: "button" } }, el("b", { text: m.name }), el("i", { text: m.k === "mg" ? "2족" : "1족" })) as HTMLButtonElement;
    b.dataset.k = m.k;
    b.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      tap();
      cur = m;
      tried.set(m.k, m);
      b.classList.add("done");
      draw();
      f.say(m.say);
      const n = ["li", "na", "k"].filter((k) => tried.has(k)).length;
      f.pips(n);
      tm.later(() => {
        busy = false;
        if (n < 3 || lab.finished() || host.dataset.g4Phase) return;
        lab.judge("리튬, 나트륨, 칼륨의 <b>공통점</b>은 무엇인가요?", [{ t: "물과 반응해 기체가 나온다", ok: true }, { t: "물에 가라앉아 그대로 있다" }, { t: "물에 녹아 색이 변한다" }], "셋 다 물과 <b>활발하게 반응</b>했어요.", () =>
          lab.judge("같은 1족인 <b>루비듐</b>을 물에 넣으면 어떻게 될까요?", [{ t: "활발하게 반응한다", ok: true }, { t: "아무 변화가 없다" }, { t: "가라앉아 그대로 있다" }], "같은 세로줄이면 성질이 <b>비슷</b>해요.", () =>
            lab.finish("주기율표의 <b>같은 세로줄(족)</b>에 있는 원소는 성질이 비슷해요. 1족 금속은 모두 물과 활발하게 반응해요."),
          ),
        );
      }, 2600);
    });
    return b;
  });
  const box = el("div", { class: "g2u4x-chipgrid two" }, ...btns);
  f.slot.setControls(box);
  draw();
  f.say("실험 영상 속 수조예요. <b>금속 조각</b>을 골라 물에 넣어 보세요. 무엇이 닮았나요?");
  return lab.cleanup;
};

// ── 18족 기체 ───────────────────────────────────────────────────────
interface Gas {
  k: string;
  name: string;
  sym: string;
  state: string;
  flame: string;
  burns: boolean;
  use: string;
}
const GASES: Gas[] = [
  { k: "he", name: "헬륨", sym: "He", state: "기체", flame: "변화 없음", burns: false, use: "풍선과 비행선을 띄워요" },
  { k: "ne", name: "네온", sym: "Ne", state: "기체", flame: "변화 없음", burns: false, use: "광고판의 불빛에 써요" },
  { k: "ar", name: "아르곤", sym: "Ar", state: "기체", flame: "변화 없음", burns: false, use: "전구 속을 채워요" },
  { k: "h", name: "수소", sym: "H", state: "기체", flame: "펑 하고 탄다", burns: true, use: "1족 맨 위의 원소예요" },
];

export const g2u4NobleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 6, cls: "g2u4x-noble", wait: "세 기체의 표를 채워 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "기체가 든 유리병과 조사 결과 표");
  const res: Record<string, { state?: boolean; flame?: boolean }> = {};
  let cur: Gas = GASES[0];
  let show: "" | "state" | "flame" = "";

  const count = (): number => ["he", "ne", "ar"].reduce((a, k) => a + (res[k]?.state ? 1 : 0) + (res[k]?.flame ? 1 : 0), 0);
  const draw = (): void => {
    const dots: [number, number][] = [[52, 96], [96, 84], [74, 128], [112, 132], [58, 160], [100, 166]];
    const rows = GASES.map((g, i) => {
      const y = 78 + i * 34;
      const r = res[g.k] ?? {};
      return `${g === cur ? `<rect x="158" y="${y - 20}" width="180" height="30" rx="8" fill="rgba(255,255,255,.07)"/>` : ""}
        ${txt(166, y, g.name, { anchor: "start", size: 13, fill: g.k === "h" ? "#8CA2C0" : "#E8EEF9", weight: 800 })}
        ${txt(240, y, r.state ? g.state : "?", { size: 13, fill: r.state ? "#7CF29C" : "#6F84A3" })}
        ${txt(302, y, r.flame ? g.flame : "?", { size: r.flame && g.burns ? 12 : 13, fill: r.flame ? (g.burns ? "#FFB55A" : "#7CF29C") : "#6F84A3" })}`;
    }).join("");
    stage.set(`
      <path d="M62 44 L62 62 Q30 78 30 124 Q30 190 82 190 Q134 190 134 124 Q134 78 102 62 L102 44 Z" fill="rgba(160,200,255,.07)" stroke="#9CB4D6" stroke-width="2.2" stroke-linejoin="round"/>
      ${dots.map(([x, y], i) => `<g class="g2u4x-nb-dot" style="animation-delay:${-i * 0.5}s">${ball(x, y, cur.sym, { k: cur.k === "h" ? 0.9 : 1, label: false })}</g>`).join("")}
      ${txt(82, 212, `${cur.name} (${cur.k === "h" ? "H₂" : cur.sym})`, { size: 13, fill: "#fff", weight: 800 })}
      ${show === "state" ? `<rect x="50" y="20" width="64" height="24" rx="12" fill="rgba(124,242,156,.18)" stroke="#7CF29C"/>${txt(82, 37, "기체", { size: 13, fill: "#7CF29C", weight: 800 })}` : ""}
      ${
        show === "flame"
          ? cur.burns
            ? `<path class="g2u4x-nb-bang" d="M82 4 L90 20 L108 14 L100 30 L118 38 L100 44 L104 60 L88 50 L76 62 L74 46 L56 44 L70 34 L60 18 L76 22 Z" fill="#FFB55A" stroke="#F0762E" stroke-width="1.4"/>${txt(84, 40, "펑", { size: 14, fill: "#5A2A00", weight: 800 })}`
            : `<path class="g2u4x-nb-flame" d="M82 40 Q72 28 82 10 Q86 22 92 18 Q96 30 88 40 Z" fill="#FFB55A" stroke="#F0762E" stroke-width="1.2"/>`
          : ""
      }
      ${txt(240, 40, "상온에서", { size: 12.5, fill: "#8CA2C0" })}${txt(302, 40, "불꽃을 대면", { size: 12.5, fill: "#8CA2C0" })}
      <line x1="158" y1="50" x2="338" y2="50" stroke="rgba(255,255,255,.16)"/>
      ${rows}
    `);
    host.dataset.g4Done = String(count());
  };

  const chips = GASES.map((g) => {
    const b = el("button", { class: "g2u4x-chipbtn", attrs: { type: "button" } }, el("b", { text: g.name }), el("i", { text: g.k === "h" ? "견줄 기체" : "18족" })) as HTMLButtonElement;
    b.dataset.k = g.k;
    b.addEventListener("click", () => {
      tap();
      cur = g;
      show = "";
      chips.forEach((c) => c.classList.toggle("on", c === b));
      draw();
      f.say(`<b>${g.name}</b>을 골랐어요. ${g.use}. 무엇을 살펴볼까요?`.replace("수소</b>을", "수소</b>를"));
    });
    return b;
  });
  chips[0].classList.add("on");
  let asked = false;
  const test = (kind: "state" | "flame"): void => {
    tap();
    show = kind;
    res[cur.k] = { ...res[cur.k], [kind]: true };
    draw();
    if (kind === "state") f.say(`<b>${cur.name}</b>은 상온에서 <b>기체</b>예요. 입자가 서로 멀리 떨어져 날아다녀요.`.replace("수소</b>은", "수소</b>는"));
    else f.say(cur.burns ? "<b>수소</b>는 불꽃을 대면 <b>펑 하고 타요</b>. 다른 물질과 잘 반응하는 기체예요." : `<b>${cur.name}</b>에 불꽃을 대도 <b>아무 변화가 없어요</b>. 다른 물질과 잘 반응하지 않아요.`);
    f.pips(count());
    if (count() >= 6 && !asked) {
      asked = true;
      tm.later(() => {
        lab.judge("헬륨, 네온, 아르곤의 <b>공통점</b>은 무엇인가요?", [{ t: "기체이고 잘 반응하지 않는다", ok: true }, { t: "기체이고 불에 잘 탄다" }, { t: "고체이고 잘 반응하지 않는다" }], "셋 다 기체이고 불꽃에도 <b>변화가 없었어요</b>.", () =>
          lab.finish("헬륨, 네온, 아르곤은 같은 <b>18족</b>이에요. 모두 상온에서 기체이고 다른 물질과 잘 반응하지 않아요."),
        );
      }, 1500);
    }
  };
  const bState = bvBtn("g2u4x-nb-tool", "상온에서의 상태 보기");
  const bFlame = bvBtn("g2u4x-nb-tool", "불꽃을 대어 보기");
  bState.dataset.k = "state";
  bFlame.dataset.k = "flame";
  bState.addEventListener("click", () => test("state"));
  bFlame.addEventListener("click", () => test("flame"));
  f.slot.setControls(el("div", { class: "g2u4x-chipgrid four" }, ...chips), row(bState, bFlame));
  draw();
  f.say("주기율표 맨 오른쪽 세로줄의 기체예요. <b>기체</b>와 <b>살펴볼 것</b>을 골라 표를 채워 보세요.");
  return lab.cleanup;
};
