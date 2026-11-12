// [중2 Ⅳ v5] g2u4l2 원소 기호 랩 두 판.
//   g2u4SymbolLab 「원소 기호는 어떻게 지을까요?」
//     책의 규칙(첫 글자를 대문자로, 첫 글자가 같으면 중간 글자를 골라 소문자로)을 학생이 직접 지으며 겪는다.
//     탄소(Carbonium) → 염소(Chlorium) → 칼슘(Calcium). 학생이 정하는 것: 이름에서 어느 글자를 쓸지.
//     실패하는 길: 이미 쓰는 기호와 겹치게 지으면 등록부에서 겹친 기호가 흔들리고 되돌아온다.
//   g2u4CardLab 「기호 카드를 뒤집어 말을 옮겨 볼까요?」
//     책의 해 보기(원소 기호를 익히는 놀이): 말이 놓인 이름과 같은 기호 카드를 뒤집으면 한 칸 간다. 틀린 카드는 다시 덮인다(자리를 기억해 둔다).

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { bad, bvBtn, g4Lab, good, row, tap, toast, type G4Step } from "./kit";

interface Round {
  ko: string;
  latin: string;
  answer: string;
}
const ROUNDS: Round[] = [
  { ko: "탄소", latin: "Carbonium", answer: "C" },
  { ko: "염소", latin: "Chlorium", answer: "Cl" },
  { ko: "칼슘", latin: "Calcium", answer: "Ca" },
];

export const g2u4SymbolLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-symbol", wait: "세 원소의 기호를 지어 보세요" });
  const { f, tm } = lab;
  const used: Record<string, string> = { H: "수소", O: "산소" };
  let idx = 0;
  let pick: number[] = [];
  let busy = false;

  const nameEl = el("div", { class: "g2u4x-sy-name" });
  const letters = el("div", { class: "g2u4x-sy-letters" });
  const symEl = el("div", { class: "g2u4x-sy-sym" });
  const reg = el("div", { class: "g2u4x-sy-reg" });
  f.stage.append(nameEl, letters, el("div", { class: "g2u4x-sy-out" }, el("span", { text: "기호" }), symEl), reg);

  const symbol = (): string => {
    const r = ROUNDS[idx];
    return pick.map((i, n) => (n === 0 ? r.latin[i].toUpperCase() : r.latin[i].toLowerCase())).join("");
  };
  const paintReg = (shake?: string): void => {
    reg.replaceChildren(
      el("span", { class: "g2u4x-sy-regk", text: "이미 쓰는 기호" }),
      ...Object.entries(used).map(([k, v]) => el("span", { class: `g2u4x-sy-chip${k === shake ? " shake" : ""}`, html: `<b>${k}</b> ${v}` })),
    );
  };
  const paint = (): void => {
    const r = ROUNDS[idx];
    nameEl.innerHTML = `<b>${r.ko}</b><span>라틴어 이름</span>`;
    letters.replaceChildren(
      ...r.latin.split("").map((ch, i) => {
        const b = el("button", { class: `g2u4x-sy-l${pick.includes(i) ? " on" : ""}`, text: ch, attrs: { type: "button", "aria-label": `${i + 1}번째 글자 ${ch}` } }) as HTMLButtonElement;
        b.dataset.i = String(i);
        b.addEventListener("click", () => {
          if (busy) return;
          if (pick.includes(i)) return;
          if (pick.length === 0 && i !== 0) {
            bad();
            toast(lab, "첫 글자부터 골라요", true);
            return;
          }
          if (pick.length >= 2) {
            bad();
            toast(lab, "기호는 두 글자까지예요", true);
            return;
          }
          tap();
          pick.push(i);
          paint();
        });
        return b;
      }),
    );
    symEl.textContent = symbol() || "?";
    host.dataset.g4Sym = symbol();
    host.dataset.g4Round = String(idx);
  };

  const clear = bvBtn("g2u4x-sy-clear", "지우기");
  const fix = bvBtn("main g2u4x-sy-fix", "이 기호로 정하기");
  clear.addEventListener("click", () => {
    if (busy) return;
    tap();
    pick = [];
    paint();
  });
  const next = (): void => {
    const r = ROUNDS[idx];
    used[r.answer] = r.ko;
    idx += 1;
    f.pips(idx);
    pick = [];
    paintReg();
    if (idx < ROUNDS.length) {
      busy = false;
      paint();
      f.say(`이번에는 <b>${ROUNDS[idx].ko}</b>예요. 이름에서 글자를 골라 기호를 지어 보세요.`);
      return;
    }
    lab.judge("코발트의 기호는 Co예요. 둘째 글자도 대문자로 <b>CO</b>라고 쓰면?", [{ t: "탄소와 산소로 읽힌다", ok: true }, { t: "그래도 코발트로 읽힌다" }, { t: "코발트 두 개로 읽힌다" }], "<b>대문자 하나</b>가 원소 하나의 시작이에요.", () =>
      lab.finish("원소 기호는 이름의 <b>첫 글자를 대문자</b>로 쓰고, 첫 글자가 겹치면 <b>소문자 한 글자</b>를 더해요."),
    );
  };
  fix.addEventListener("click", () => {
    if (busy) return;
    const r = ROUNDS[idx];
    const sym = symbol();
    if (!sym) {
      bad();
      toast(lab, "글자를 먼저 골라요", true);
      return;
    }
    if (used[sym]) {
      bad();
      paintReg(sym);
      f.say(`<b>${sym}</b> 기호는 이미 <b>${used[sym]}</b>가 쓰고 있어요. 겹치지 않게 <b>글자를 하나 더</b> 골라 보세요.`);
      host.dataset.g4Clash = sym;
      if (pick.length === 2) pick = [pick[0]];
      paint();
      return;
    }
    if (sym.length === 2 && !used[sym[0]]) {
      bad();
      f.say(`<b>${sym[0]}</b> 한 글자를 쓰는 원소가 아직 없어요. 겹치지 않으면 <b>첫 글자만</b> 써요.`);
      pick = [pick[0]];
      paint();
      return;
    }
    busy = true;
    good();
    if (sym !== r.answer) {
      // 겹치지는 않지만 약속된 글자가 따로 있다(틀렸다고 하지 않고 약속을 알려 준다)
      f.say(`겹치지는 않아요. 다만 과학자들은 <b>${r.answer}</b>로 약속했어요. ${r.ko}의 기호는 <b>${r.answer}</b>예요.`);
      symEl.textContent = r.answer;
    } else {
      f.say(`<b>${r.ko}</b>의 기호는 <b>${r.answer}</b>예요. 등록부에 올렸어요.`);
    }
    tm.later(next, 1500);
  });
  f.slot.setControls(row(clear, fix));
  paintReg();
  paint();
  f.say("<b>탄소</b>의 기호를 지어요. 라틴어 이름에서 글자를 골라 보세요.");
  return lab.cleanup;
};

// ── 카드 놀이 ───────────────────────────────────────────────────────
const PATH: [string, string][] = [
  ["나트륨", "Na"],
  ["철", "Fe"],
  ["구리", "Cu"],
  ["은", "Ag"],
  ["금", "Au"],
];
const DECK = ["Na", "Fe", "Cu", "Ag", "Au", "K"];

export const g2u4CardLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: PATH.length, cls: "g2u4x-card", wait: "말을 끝까지 옮겨 보세요" });
  const { f, tm } = lab;
  let at = 0;
  let busy = false;
  let flips = 0;

  const tiles = PATH.map(([name]) => el("div", { class: "g2u4x-cd-tile" }, el("b", { text: name }), el("i", { text: "?" })));
  const token = el("div", { class: "g2u4x-cd-token", attrs: { "aria-hidden": "true" } });
  const path = el("div", { class: "g2u4x-cd-path" }, ...tiles, token);
  const count = el("div", { class: "g2u4x-cap g2u4x-cd-count" });
  f.stage.append(path, count);
  const place = (): void => {
    token.style.left = `${((Math.min(at, PATH.length - 1) + 0.5) / PATH.length) * 100}%`;
    tiles.forEach((t, i) => {
      t.classList.toggle("now", i === at);
      t.classList.toggle("done", i < at);
    });
    count.textContent = `뒤집은 횟수 ${flips}`;
    host.dataset.g4At = String(at);
  };

  const order = DECK.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const cards = order.map((di) => {
    const sym = DECK[di];
    const b = el("button", { class: "g2u4x-cd-card", attrs: { type: "button", "aria-label": "뒤집힌 원소 기호 카드" } }, el("span", { class: "g2u4x-cd-back", text: "?" }), el("span", { class: "g2u4x-cd-face", text: sym })) as HTMLButtonElement;
    if (import.meta.env.DEV) b.dataset.sym = sym;
    b.addEventListener("click", () => {
      if (busy || b.classList.contains("open") || at >= PATH.length) return;
      tap();
      busy = true;
      flips += 1;
      b.classList.add("open");
      const [name, want] = PATH[at];
      tm.later(() => {
        if (sym === want) {
          good();
          b.classList.add("keep");
          b.disabled = true;
          tiles[at].querySelector("i")!.textContent = want;
          at += 1;
          f.pips(at);
          place();
          busy = false;
          if (at >= PATH.length) {
            lab.finish("라틴어 이름에서 온 원소 기호도 많아요. <b>Na, Fe, Cu, Ag, Au</b>가 그런 기호예요.");
            return;
          }
          f.say(`맞아요, ${name}의 기호는 <b>${want}</b>예요. 이번에는 <b>${PATH[at][0]}</b>의 기호 카드를 찾아요.`);
        } else {
          bad();
          f.say(`이 카드는 <b>${sym}</b>예요. ${name}의 기호가 아니에요. 자리를 기억해 두세요.`);
          tm.later(() => {
            b.classList.remove("open");
            busy = false;
            place();
          }, 700);
        }
      }, 520);
      place();
    });
    return b;
  });
  f.slot.setControls(el("div", { class: "g2u4x-cd-deck" }, ...cards));
  place();
  f.say("말이 놓인 <b>나트륨</b>의 기호 카드를 찾아 뒤집어요. 틀린 카드는 다시 덮여요.");
  return lab.cleanup;
};
