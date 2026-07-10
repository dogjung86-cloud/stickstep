// congLab, "쌍둥이 감별소"(Ⅳ L12 — 교과서 174~175쪽 문제 2 각색).
// 삼각형 카드 6장에서 합동인 쌍 3개를 찾고, 쌍마다 근거(SSS·SAS·ASA)를 판정한다.
// 카드 2장 탭 → 옳은 쌍이면 "근거는?" 판정 시트, 틀린 쌍이면 흔들며 힌트.
// 3쌍 완성 후 ≡ 기호의 대응 순서 미니 문제로 마무리.
// 모션은 전부 CSS transition/keyframes + setTimeout(타이머 Set으로 모아 cleanup 해제). rAF 금지.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, lineSvg, angleArc, dot, gsym } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CongStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Basis = "SSS" | "SAS" | "ASA";

interface CardDef {
  id: string; // A~F
  name: string; // 꼭짓점 세 글자
  svg: string;
  aria: string;
}

/* ---------- 카드 SVG 조각 헬퍼 ---------- */

const txt = (x: number, y: number, t: string, color: string, size = 9.8): string =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${color}">${t}</text>`;

const vtx = (x: number, y: number): string => dot(x, y, GEO.ink, 2.6);

const vlab = (x: number, y: number, name: string): string =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" font-weight="800" fill="${GEO.ink}">${name}</text>`;

const given = (x1: number, y1: number, x2: number, y2: number): string => lineSvg(x1, y1, x2, y2, GEO.hlB, 2.8);
const faint = (x1: number, y1: number, x2: number, y2: number): string => lineSvg(x1, y1, x2, y2, GEO.faint, 2);

function cardSvg(inner: string): string {
  return `<svg viewBox="0 0 150 112" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;
}

/* ---------- 카드 6장(교과서 문제 2 각색 수치, 1cm=15~18px) ----------
   A △ABC: 세 변 5·7·4(SSS 짝 D) · B △DEF: 변 5 + 양 끝 각 35°·55°(ASA 짝 E)
   C △GHI: 두 변 4·6 + 끼인각 110°(SAS 짝 F). D·E·F는 각 짝의 거울/재배열판.
   수치는 자체 제작(교과서 문제와 다르게)이 원칙. */

function makeCards(): CardDef[] {
  // A △ABC: B=(24,84) C=(129,84) A=(86.1,42), AB=5 BC=7 CA=4 (15px/cm)
  const cardA = cardSvg(
    given(86.1, 42, 24, 84) +
      given(24, 84, 129, 84) +
      given(129, 84, 86.1, 42) +
      txt(44, 58, "5cm", GEO.hlB) +
      txt(76.5, 96.5, "7cm", GEO.hlB) +
      txt(115, 58, "4cm", GEO.hlB) +
      vtx(86.1, 42) +
      vtx(24, 84) +
      vtx(129, 84) +
      vlab(86.1, 34, "A") +
      vlab(17.5, 89, "B") +
      vlab(135.5, 89, "C"),
  );
  // D △MNO: O=(24,84) N=(129,84) M=(66.9,42) — A의 거울상, MN=5 NO=7 OM=4
  const cardD = cardSvg(
    given(24, 84, 66.9, 42) +
      given(129, 84, 24, 84) +
      given(66.9, 42, 129, 84) +
      txt(36, 58, "4cm", GEO.hlB) +
      txt(76.5, 96.5, "7cm", GEO.hlB) +
      txt(108, 58, "5cm", GEO.hlB) +
      vtx(66.9, 42) +
      vtx(24, 84) +
      vtx(129, 84) +
      vlab(66.9, 34, "M") +
      vlab(17.5, 89, "O") +
      vlab(135.5, 89, "N"),
  );
  // B △DEF: E=(37,82) F=(112,82) D=(87.3,46.8), EF=5 ∠E=35° ∠F=55°
  const cardB = cardSvg(
    faint(37, 82, 87.3, 46.8) +
      faint(112, 82, 87.3, 46.8) +
      given(37, 82, 112, 82) +
      angleArc(37, 82, 15, 0, 35, GEO.hlA, "35°", { labelR: 27, fontSize: 9.5 }) +
      angleArc(112, 82, 15, 125, 180, GEO.hlA, "55°", { labelR: 27, fontSize: 9.5 }) +
      txt(74.5, 95.5, "5cm", GEO.hlB) +
      vtx(87.3, 46.8) +
      vtx(37, 82) +
      vtx(112, 82) +
      vlab(87.3, 38.8, "D") +
      vlab(31, 88, "E") +
      vlab(118, 88, "F"),
  );
  // E △JKL: J=(37,82) K=(112,82) L=(61.7,46.8), ∠J=55° ∠K=35° JK=5
  const cardE = cardSvg(
    faint(37, 82, 61.7, 46.8) +
      faint(112, 82, 61.7, 46.8) +
      given(37, 82, 112, 82) +
      angleArc(37, 82, 15, 0, 55, GEO.hlA, "55°", { labelR: 27, fontSize: 9.5 }) +
      angleArc(112, 82, 15, 145, 180, GEO.hlA, "35°", { labelR: 27, fontSize: 9.5 }) +
      txt(74.5, 95.5, "5cm", GEO.hlB) +
      vtx(61.7, 46.8) +
      vtx(37, 82) +
      vtx(112, 82) +
      vlab(61.7, 38.8, "L") +
      vlab(31, 88, "J") +
      vlab(118, 88, "K"),
  );
  // C △GHI: H=(46,82) I=(136,82) G=(25.5,25.6), HI=6 HG=4 ∠H=110°
  const cardC = cardSvg(
    faint(25.5, 25.6, 136, 82) +
      given(46, 82, 136, 82) +
      given(46, 82, 25.5, 25.6) +
      angleArc(46, 82, 13, 0, 110, GEO.hlA, "110°", { labelR: 25, fontSize: 9.5 }) +
      txt(91, 95.5, "6cm", GEO.hlB) +
      txt(24, 55, "4cm", GEO.hlB) +
      vtx(25.5, 25.6) +
      vtx(46, 82) +
      vtx(136, 82) +
      vlab(25.5, 18.5, "G") +
      vlab(40, 92.5, "H") +
      vlab(142, 92.5, "I"),
  );
  // F △PQR: Q=(104,82) P=(14,82) R=(124.5,25.6), QP=6 QR=4 ∠Q=110° — C의 거울상
  const cardF = cardSvg(
    faint(14, 82, 124.5, 25.6) +
      given(104, 82, 14, 82) +
      given(104, 82, 124.5, 25.6) +
      angleArc(104, 82, 13, 70, 180, GEO.hlA, "110°", { labelR: 25, fontSize: 9.5 }) +
      txt(59, 95.5, "6cm", GEO.hlB) +
      txt(126, 55, "4cm", GEO.hlB) +
      vtx(124.5, 25.6) +
      vtx(104, 82) +
      vtx(14, 82) +
      vlab(124.5, 18.5, "R") +
      vlab(110, 92.5, "Q") +
      vlab(8, 92.5, "P"),
  );
  return [
    { id: "A", name: "ABC", svg: cardA, aria: "삼각형 ABC 카드, 세 변 5·7·4" },
    { id: "B", name: "DEF", svg: cardB, aria: "삼각형 DEF 카드, 변 5와 양 끝 각 35도·55도" },
    { id: "C", name: "GHI", svg: cardC, aria: "삼각형 GHI 카드, 두 변 4·6과 끼인각 110도" },
    { id: "D", name: "MNO", svg: cardD, aria: "삼각형 MNO 카드, 세 변 4·7·5" },
    { id: "E", name: "JKL", svg: cardE, aria: "삼각형 JKL 카드, 각 55도·35도와 그 사이 변 5" },
    { id: "F", name: "PQR", svg: cardF, aria: "삼각형 PQR 카드, 끼인각 110도와 두 변 6·4" },
  ];
}

/** 합동 쌍과 근거. */
const PAIR: Record<string, string> = { A: "D", D: "A", B: "E", E: "B", C: "F", F: "C" };
const BASIS: Record<string, Basis> = { A: "SSS", D: "SSS", B: "ASA", E: "ASA", C: "SAS", F: "SAS" };
/** 짝이 이웃하지 않는 고정 셔플 순서. */
const ORDER = ["A", "E", "C", "B", "F", "D"];
/** 확정된 쌍의 테두리 색(순서대로). */
const PAIR_COLORS = [GEO.hlD, GEO.hlC, GEO.hlA];

const PRAISE: Record<Basis, string> = {
  SSS: "세 변이 4·5·7로 똑같아요, SSS 합동!",
  ASA: "변 5cm와 그 양 끝 각 35°·55°, ASA 합동!",
  SAS: "두 변 4·6과 그 끼인각 110°, SAS 합동!",
};

export const congLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CongStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "pairs", label: "쌍둥이 3쌍", sub: "0/3" },
    { id: "why", label: "근거 판정", sub: "SSS·SAS·ASA" },
    { id: "order", label: "대응 순서", sub: "≡의 약속" },
  ]);

  const board = mboard(520);
  const grid = el("div", { class: "mcg-grid" });
  board.appendChild(grid);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "여섯 장 속에 <b>합동인 쌍둥이가 3쌍</b> 숨어 있어요. 주어진 변·각을 비교하며 카드 두 장을 탭해 짝을 지어 보세요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const defs = makeCards();
  const byId = new Map(defs.map((d) => [d.id, d]));
  const cardEls = new Map<string, HTMLButtonElement>();

  let sel: string | null = null;
  let judging = false;
  let shaking = false;
  let pairCount = 0;
  const basisFound = new Set<Basis>();
  let finished = false;

  for (const id of ORDER) {
    const d = byId.get(id)!;
    const card = el("button", {
      class: "mcg-card",
      attrs: { type: "button", "aria-label": d.aria },
      html: `<span class="mcg-name">${gsym(d.name, "tri")}</span>${d.svg}`,
    }) as HTMLButtonElement;
    card.addEventListener("click", () => tapCard(id));
    cardEls.set(id, card);
    grid.appendChild(card);
  }

  function tapCard(id: string): void {
    if (judging || shaking || finished) return;
    const card = cardEls.get(id)!;
    if (card.disabled) return;
    haptic(HAPTIC.tap);
    if (sel === null) {
      sel = id;
      card.classList.add("sel");
      return;
    }
    if (sel === id) {
      sel = null;
      card.classList.remove("sel");
      return;
    }
    const first = cardEls.get(sel)!;
    if (PAIR[sel] === id) {
      card.classList.add("sel");
      openJudge(sel, id);
    } else {
      // 틀린 쌍: 둘 다 흔들고 힌트
      haptic(HAPTIC.cross);
      shaking = true;
      sel = null;
      card.classList.add("no");
      first.classList.add("no");
      toast("주어진 요소의 짝이 맞지 않아요. 변·각의 구성이 같은 카드를 찾아요!");
      later(() => {
        card.classList.remove("no");
        first.classList.remove("no", "sel");
        shaking = false;
      }, 520);
    }
  }

  /* ---------- 근거 판정 시트 ---------- */

  function openJudge(idA: string, idB: string): void {
    judging = true;
    const nameA = byId.get(idA)!.name;
    const nameB = byId.get(idB)!.name;
    const overlay = el("div", { class: "mcg-judge" });
    const sheet = el("div", { class: "mcg-judge-card" });
    sheet.appendChild(el("div", { class: "mcg-jtitle", text: "근거는?" }));
    sheet.appendChild(
      el("div", { class: "mcg-jsub", html: `${gsym(nameA, "tri")} ≡ ${gsym(nameB, "tri")}, 무엇이 근거일까요?` }),
    );
    const hint = el("div", { class: "mcg-jhint" });
    const btnDefs: [Basis, string][] = [
      ["SSS", "세 변이 각각 같아요"],
      ["SAS", "두 변과 그 끼인각이 같아요"],
      ["ASA", "한 변과 그 양 끝 각이 같아요"],
    ];
    const answer = BASIS[idA];
    for (const [k, sub] of btnDefs) {
      const btn = el("button", {
        class: "mcg-jbtn",
        attrs: { type: "button" },
        html: `<b>${k} 합동</b><span>${sub}</span>`,
      }) as HTMLButtonElement;
      btn.addEventListener("click", () => {
        if (k === answer) {
          haptic(HAPTIC.correct);
          btn.classList.add("ok");
          later(() => {
            overlay.remove();
            confirmPair(idA, idB, k);
          }, 550);
        } else {
          haptic(HAPTIC.cross);
          btn.classList.add("no");
          hint.textContent = "주어진 세 요소를 다시 봐요. 변이 몇 개, 각이 몇 개죠?";
          hint.classList.add("show");
          later(() => btn.classList.remove("no"), 520);
        }
      });
      sheet.appendChild(btn);
    }
    sheet.appendChild(hint);
    overlay.appendChild(sheet);
    board.appendChild(overlay);
    overlay.getBoundingClientRect(); // reflow 후 페이드 인
    overlay.classList.add("show");
    later(() => sheet.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function confirmPair(idA: string, idB: string, basis: Basis): void {
    judging = false;
    sel = null;
    const color = PAIR_COLORS[pairCount];
    pairCount += 1;
    basisFound.add(basis);
    for (const id of [idA, idB]) {
      const card = cardEls.get(id)!;
      card.classList.remove("sel");
      card.classList.add("paired");
      card.disabled = true;
      card.style.setProperty("--pairc", color);
      card.appendChild(el("span", { class: "mcg-eq", text: "≡" }));
    }
    toast(PRAISE[basis]);

    // 목표 칩 갱신
    if (pairCount < 3) {
      (chips.el.querySelector(`[data-g="pairs"] span`) as HTMLElement).textContent = `${pairCount}/3`;
      (chips.el.querySelector(`[data-g="why"] span`) as HTMLElement).textContent = [...basisFound].join("·");
    } else {
      chips.on("pairs", "3/3!");
      chips.on("why", "3종!");
      helper.innerHTML = "3쌍 완성! 마지막으로 <b>≡ 기호의 약속</b> 하나만 확인해요.";
      later(() => showOrderQuiz(), 1000);
    }
  }

  /* ---------- 마무리 미니 문제: 대응 순서 ---------- */

  function showOrderQuiz(): void {
    const quiz = el("div", { class: "mcg-quiz" });
    quiz.appendChild(
      el("div", {
        class: "mcg-qtext",
        html: `${gsym("ABC", "tri")} ≡ ${gsym("MNO", "tri")}처럼 쓸 때, 꼭짓점 순서는 아무렇게나 써도 될까요?`,
      }),
    );
    const options: [string, boolean][] = [
      ["대응하는 순서대로 써야 해요", true],
      ["알파벳 순서면 돼요", false],
    ];
    if (Math.random() < 0.5) options.reverse();
    for (const [label, good] of options) {
      const btn = el("button", { class: "mcg-jbtn", attrs: { type: "button" }, html: `<b>${label}</b>` }) as HTMLButtonElement;
      btn.addEventListener("click", () => {
        if (finished) return;
        if (good) {
          haptic(HAPTIC.correct);
          btn.classList.add("ok");
          toast("맞아요! A는 M, B는 N, C는 O, 대응점끼리 같은 자리에 서요.");
          chips.on("order", "약속!");
          finish();
        } else {
          haptic(HAPTIC.cross);
          btn.classList.add("no");
          toast("합동 기호는 대응점끼리 같은 자리에! ≡ 기호를 쓸 때의 약속이에요.");
          later(() => btn.classList.remove("no"), 520);
        }
      });
      quiz.appendChild(btn);
    }
    board.appendChild(quiz);
    quiz.getBoundingClientRect();
    quiz.classList.add("show");
    quiz.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "<b>세 요소만 맞으면 나머지도 전부 같다</b>, 그게 합동 조건의 힘이에요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
