// formulaLab — "여러 가지 분자의 구성 알아보기"(중2 IV L5, 책 156쪽 해 보기).
//   분자 모형을 보고 ① 원자의 종류와 개수를 세고 ② 화학식을 토큰(기호·아래 숫자)으로
//   직접 써 본다. 예시(암모니아)는 풀이가 완성된 채로 보여 주고, 네 라운드를 직접 푼다.
//   입자 색·크기는 chemKit ELEMS(CPK 관례) — 하드코딩 금지 규칙 준수.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ELEMS } from "../../ui/chemKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Round {
  formula: string; // chemKit 표기("N_2")
  name: string;
  comp: Record<string, number>;
  model: [string, number, number][]; // [기호, dx, dy]
  bonds: [number, number][];
}

const ROUNDS: Round[] = [
  { formula: "N_2", name: "질소", comp: { N: 2 }, model: [["N", -13, 0], ["N", 13, 0]], bonds: [[0, 1]] },
  { formula: "HCl", name: "염화 수소", comp: { H: 1, Cl: 1 }, model: [["H", -22, 2], ["Cl", 8, 0]], bonds: [[0, 1]] },
  { formula: "CO", name: "일산화 탄소", comp: { C: 1, O: 1 }, model: [["C", -14, 0], ["O", 14, 0]], bonds: [[0, 1]] },
  { formula: "CO_2", name: "이산화 탄소", comp: { C: 1, O: 2 }, model: [["O", -30, 0], ["C", 0, 0], ["O", 30, 0]], bonds: [[0, 1], [1, 2]] },
];
const EXAMPLE: Round = {
  formula: "NH_3",
  name: "암모니아",
  comp: { N: 1, H: 3 },
  model: [["N", 0, -4], ["H", -24, 14], ["H", 24, 14], ["H", 0, -30]],
  bonds: [[0, 1], [0, 2], [0, 3]],
};

const PALETTE = ["H", "C", "N", "O", "Cl"];
const SUBS = ["2", "3"];

/** 분자 모형 SVG(다크 무대) — CPK 색·상대 크기, 파운드리풍 하이라이트 */
function moleculeSvg(r: Round, w = 220, h = 110, scale = 1.7): string {
  const cx = w / 2;
  const cy = h / 2;
  const bonds = r.bonds
    .map(([i, j]) => {
      const [, x0, y0] = r.model[i];
      const [, x1, y1] = r.model[j];
      return `<line x1="${cx + x0 * scale}" y1="${cy + y0 * scale}" x2="${cx + x1 * scale}" y2="${cy + y1 * scale}" stroke="rgba(150,168,192,.85)" stroke-width="7" stroke-linecap="round"/>
        <line x1="${cx + x0 * scale}" y1="${cy + y0 * scale - 1.6}" x2="${cx + x1 * scale}" y2="${cy + y1 * scale - 1.6}" stroke="rgba(226,238,252,.4)" stroke-width="2" stroke-linecap="round"/>`;
    })
    .join("");
  const balls = r.model
    .map(([sym, dx, dy]) => {
      const e = ELEMS[sym];
      const rr = e.r * scale;
      const x = cx + dx * scale;
      const y = cy + dy * scale;
      const [cr, cg, cb] = e.rgb.split(",").map(Number);
      const dark = cr * 0.299 + cg * 0.587 + cb * 0.114 > 150;
      return `<circle cx="${x}" cy="${y}" r="${rr}" fill="rgb(${e.rgb})"/>
        <circle cx="${x - rr * 0.32}" cy="${y - rr * 0.34}" r="${rr * 0.36}" fill="${e.hi}" opacity=".75"/>
        <circle cx="${x}" cy="${y}" r="${rr}" fill="none" stroke="rgb(${Math.round(cr * 0.4)},${Math.round(cg * 0.4)},${Math.round(cb * 0.4)})" stroke-width="1.6"/>
        ${rr >= 13 ? `<text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="${Math.max(10, rr * 0.8)}" font-weight="800" fill="${dark ? "rgba(30,40,54,.92)" : "rgba(255,255,255,.95)"}">${sym}</text>` : ""}`;
    })
    .join("");
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">${bonds}${balls}</svg>`;
}

function fmtHtml(tokens: string[]): string {
  return tokens.map((t) => (t.startsWith("_") ? `<sub>${t.slice(1)}</sub>` : t)).join("");
}

function tokensToComp(tokens: string[]): Record<string, number> | null {
  const comp: Record<string, number> = {};
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.startsWith("_")) return null; // 숫자가 기호 없이 등장 — parse 단계에서 걸러짐
    let n = 1;
    if (tokens[i + 1]?.startsWith("_")) {
      n = Number(tokens[i + 1].slice(1));
      i++;
    }
    comp[t] = (comp[t] ?? 0) + n;
  }
  return comp;
}

export const formulaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // 예시 카드(암모니아 — 완성된 풀이)
  const example = el(
    "div",
    { class: "fl-example" },
    el("div", { class: "fl-ex-art", html: moleculeSvg(EXAMPLE, 150, 96, 1.35) }),
    el("div", {
      class: "fl-ex-txt",
      html: `<b>예시 · ${EXAMPLE.name}</b><br>질소 원자 <b>1</b>개 + 수소 원자 <b>3</b>개<br>→ 화학식 <b class="fl-ex-f">NH<sub>3</sub></b> <small>(1은 생략!)</small>`,
    }),
  );

  const roundChips = el(
    "div",
    { class: "pn-badges force4" },
    ...ROUNDS.map((r, i) =>
      el("div", { class: "pn-badge", dataset: { g: String(i) } }, el("b", { text: r.name }), el("span", { text: "화학식 쓰기" })),
    ),
  );

  const art = el("div", { class: "fl-art" });
  const namePill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7CB024" }), el("span", { text: "" }));
  const stage = el("div", { class: "stage fl-stage" }, art, el("div", { class: "stage-hud" }, namePill));

  const out = el("div", { class: "fl-out", html: "&nbsp;" });
  const pad = el("div", { class: "fl-pad" });
  const checkBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "화학식 확인" }));
  const helper = el("div", {
    class: "helper",
    html: "모형 속 원자의 <b>종류</b>와 <b>개수</b>를 세고, 기호와 아래 숫자 버튼으로 화학식을 완성해요. (개수 1은 생략!)",
  });
  host.append(example, roundChips, helper, stage, out, pad, checkBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let idx = 0;
  let tokens: string[] = [];
  let wrongAny = false;
  let finished = false;

  const symBtns: HTMLButtonElement[] = PALETTE.map((sym) => {
    const e = ELEMS[sym];
    const b = el("button", { class: "fl-key sym", attrs: { type: "button" }, html: `<i style="background:rgb(${e.rgb})"></i>${sym}` });
    b.addEventListener("click", () => {
      if (finished) return;
      if (tokens.length >= 6) return;
      tokens.push(sym);
      haptic(HAPTIC.select);
      render();
    });
    return b;
  });
  const subBtns: HTMLButtonElement[] = SUBS.map((n) => {
    const b = el("button", { class: "fl-key sub", attrs: { type: "button" }, html: `X<sub>${n}</sub>` });
    b.addEventListener("click", () => {
      if (finished) return;
      const last = tokens[tokens.length - 1];
      if (!last || last.startsWith("_")) {
        helper.innerHTML = "아래 숫자는 <b>원소 기호 뒤에만</b> 붙일 수 있어요 — 기호부터!";
        return;
      }
      tokens.push(`_${n}`);
      haptic(HAPTIC.select);
      render();
    });
    return b;
  });
  const delBtn = el("button", { class: "fl-key del", attrs: { type: "button", "aria-label": "지우기" }, text: "⌫" });
  delBtn.addEventListener("click", () => {
    tokens.pop();
    haptic(HAPTIC.select);
    render();
  });
  pad.append(...symBtns, ...subBtns, delBtn);

  function render(): void {
    out.innerHTML = tokens.length ? fmtHtml(tokens) : "&nbsp;";
    out.classList.toggle("empty", !tokens.length);
  }

  function loadRound(): void {
    const r = ROUNDS[idx];
    art.innerHTML = moleculeSvg(r);
    (namePill.querySelectorAll("span")[1] as HTMLElement).textContent = `${r.name} 분자`;
    tokens = [];
    render();
  }

  function compSummary(r: Round): string {
    return Object.entries(r.comp)
      .map(([sym, n]) => `${ELEMS[sym].name} 원자 <b>${n}</b>개`)
      .join(" + ");
  }

  checkBtn.addEventListener("click", () => {
    if (finished) return;
    const r = ROUNDS[idx];
    const joined = tokens.join("");
    if (!tokens.length) {
      helper.innerHTML = "기호 버튼으로 화학식을 먼저 써 봐요!";
      return;
    }
    if (joined === r.formula) {
      haptic(HAPTIC.correct);
      const chip = roundChips.querySelector(`[data-g="${idx}"]`) as HTMLElement;
      chip.classList.add("on");
      chip.querySelector("span")!.textContent = "완성!";
      helper.innerHTML = `정답! ${compSummary(r)} → 화학식 <b>${fmtHtml(tokenize(r.formula))}</b>${r.formula.includes("_") ? "" : " (개수 1은 생략!)"}`;
      idx++;
      if (idx >= ROUNDS.length) {
        finished = true;
        api.recordQuiz(!wrongAny);
        helper.innerHTML =
          "네 분자 모두 완성! 화학식 쓰는 법 — 원소 <b>기호</b>를 쓰고, 그 원자의 <b>개수</b>를 오른쪽 아래 작은 숫자로(1은 생략). 이제 화학식만 봐도 분자 속 원자가 보이죠?";
        api.enableCTA(s.cta ?? "다음으로");
      } else {
        window.setTimeout(loadRound, 900);
      }
      return;
    }
    // 오답 피드백 — 무엇이 틀렸는지 짚기
    wrongAny = true;
    haptic(HAPTIC.wrong);
    out.classList.add("miss");
    window.setTimeout(() => out.classList.remove("miss"), 420);
    const comp = tokensToComp(tokens);
    const same =
      comp &&
      Object.keys(r.comp).length === Object.keys(comp).length &&
      Object.entries(r.comp).every(([k, v]) => comp[k] === v);
    if (same) {
      helper.innerHTML = `원자 개수는 완벽해요! 다만 쓰는 <b>순서</b>가 달라요 — 이 분자는 <b>${fmtHtml(tokenize(r.formula))}</b> 순서로 써요.`;
    } else if (comp && Object.keys(r.comp).every((k) => k in comp) && Object.keys(comp).every((k) => k in r.comp)) {
      helper.innerHTML = "원자 <b>종류</b>는 맞았어요 — <b>개수</b>를 다시 세어 봐요. 같은 원자가 몇 개 보이나요? 개수는 기호 <b>오른쪽 아래 숫자</b>로!";
    } else {
      helper.innerHTML = "모형 속 공 색깔을 힌트로 — 어떤 <b>종류</b>의 원자가 있는지부터 다시 확인해요!";
    }
  });

  function tokenize(f: string): string[] {
    return f.match(/_\d+|[A-Z][a-z]?/g) ?? [];
  }

  loadRound();
  api.setCTA("네 분자의 화학식을 써요", { enabled: false });
};
