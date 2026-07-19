// rhCongLab, "직각삼각형 복제 공방"(중2 수학 Ⅳ L3, 직각삼각형의 합동 조건 — 책 147~149쪽).
// 왼쪽 기준 직각삼각형(3-4-5꼴 84·112·140px, 직각은 왼아래 C)과 오른쪽 점선 복제 슬롯.
// 주문서 3장을 한 장씩 처리한다: ① 빗변+한 예각 → 복제 성공(칩 rha) ② 빗변+밑변 → 성공(칩 rhs)
// ③ 예각 2개(함정) → 크기 제각각 삼형제 등장 + 판정 질문 mq6(칩 trap) → recordQuiz + CTA.
// 성공 연출: 슬롯에 복제본 페이드 인(.5s) → 기준 위로 translate 슬라이드(.7s var(--ease)) 딱 포개짐 →
// 플래시 → 슬롯 복귀. 'RHA/RHS' 명칭은 다음 concept 몫이라 랩에서는 쓰지 않는다(무대의
// "빗변(가장 긴 변)" 라벨만 허용). 각도 라벨은 표시용 35°/55° 고정 서술(실제 36.87°/53.13°와의
// 오차는 라벨 우선, 판정 없음). rAF 금지: CSS 트랜지션/키프레임 + setTimeout 체인(타이머 Set → cleanup).
// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, lineSvg, angleArc, rightMark, dot, ptLabel, angleOf } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const NS = "http://www.w3.org/2000/svg";
const PROVE = "#1971C2"; // 단원 액센트(블루프린트 코발트)

/* ── 무대 기하(전부 계산, 3-4-5꼴: 높이 84 · 밑변 112 · 빗변 140) ── */
const C = { x: 28, y: 130 }; // 직각(왼아래)
const B = { x: 140, y: 130 }; // 오른아래
const A = { x: 28, y: 46 }; // 위
const SC = { x: 208, y: 130 }; // 복제 슬롯 쪽 대응점
const SB = { x: 320, y: 130 };
const SA = { x: 208, y: 46 };
const DX = C.x - SC.x; // 슬롯 → 기준 이동량(-180)

interface OrderDef {
  tag: string;
  note: string;
  infos: [string, "hyp" | "ang" | "cyn"][];
}

const ORDERS: OrderDef[] = [
  { tag: "주문서 ①", note: "기준과 같은 값이에요", infos: [["빗변 12cm", "hyp"], ["한 예각 35°", "ang"]] },
  { tag: "주문서 ②", note: "이번에도 기준과 같은 값!", infos: [["빗변 12cm", "hyp"], ["밑변 9cm", "cyn"]] },
  { tag: "주문서 ③", note: "어라, 빗변이 없는데요?", infos: [["예각 35°", "ang"], ["예각 55°", "cyn"]] },
];

/** 삼각형 채움 path(a→b→c 닫힘). */
const triFill = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, fill: string): string =>
  `<path d="M${a.x} ${a.y} L${b.x} ${b.y} L${c.x} ${c.y} Z" fill="${fill}"/>`;

/** 기준 직각삼각형(라벨·빗변 강조 포함) SVG 조각. */
function refSvg(): string {
  return (
    triFill(A, B, C, "rgba(25,113,194,.07)") +
    lineSvg(C.x, C.y, B.x, B.y, GEO.ink, 2.6) +
    lineSvg(C.x, C.y, A.x, A.y, GEO.ink, 2.6) +
    lineSvg(A.x, A.y, B.x, B.y, PROVE, 3.6) +
    rightMark(C.x, C.y, 0, 10) +
    dot(A.x, A.y) +
    dot(B.x, B.y) +
    dot(C.x, C.y) +
    ptLabel(A.x, A.y, "A", 0, -9) +
    ptLabel(B.x, B.y, "B", 9, 14) +
    ptLabel(C.x, C.y, "C", -9, 14) +
    // 빗변 곁 라벨(허용된 자연 소개 — 정식 명명은 다음 concept 몫)
    `<text x="106" y="60" text-anchor="middle" font-size="13" font-weight="900" fill="${PROVE}">빗변</text>` +
    `<text x="106" y="74" text-anchor="middle" font-size="10.5" font-weight="700" fill="#5A7FA6">(가장 긴 변)</text>` +
    `<text x="84" y="156" text-anchor="middle" font-size="12" font-weight="700" fill="${GEO.soft}">기준 삼각형</text>`
  );
}

export const rhCongLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "rha", label: "빗변+예각", sub: "주문서 ①" },
    { id: "rhs", label: "빗변+변", sub: "잠김" },
    { id: "trap", label: "함정 간파", sub: "잠김" },
  ]);

  const board = mboard(520);
  const svgWrap = el("div", {
    class: "mcl-plane",
    attrs: { role: "img", "aria-label": "왼쪽에 기준 직각삼각형, 오른쪽에 점선 복제 슬롯" },
  });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 360 162" xmlns="${NS}" fill="none">` +
    `<g class="rhc-ref">${refSvg()}</g>` +
    `<g class="rhc-givens"></g>` +
    `<rect x="196" y="34" width="140" height="110" rx="12" fill="rgba(25,113,194,.04)" stroke="${GEO.faint}" stroke-width="1.8" stroke-dasharray="7 6"/>` +
    `<text x="266" y="156" text-anchor="middle" font-size="12" font-weight="700" fill="${GEO.soft}">복제 슬롯</text>` +
    `<g class="rhc-slot"></g>` +
    `</svg>`;
  const card = el("div", { class: "rhc-order enter" });
  const qline = el("div", { class: "mq6-q m2u4q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, card, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "주문서 ①을 확인하고 <b>이 정보로 복제</b>를 눌러 보세요. 직각 말고 정보는 딱 <b>2개</b>, 과연 똑같이 복제될까요?",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gGivens = svg.querySelector(".rhc-givens") as SVGGElement;
  const gSlot = svg.querySelector(".rhc-slot") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // 각도는 전부 계산(눈대중 금지): B에서 A 방향 143.13°, A에서 B 방향 323.13°
  const angBtoA = angleOf(B.x, B.y, A.x, A.y);
  const angAtoB = angleOf(A.x, A.y, B.x, B.y);

  let busy = false;
  let finished = false;

  /** 주문서가 준 정보를 기준 삼각형 위에 하이라이트(빗변 할로·밑변 시안·각 호). */
  function paintGivens(i: number): void {
    const haloHyp = lineSvg(A.x, A.y, B.x, B.y, "rgba(25,113,194,.22)", 11);
    const haloBase =
      lineSvg(C.x, C.y, B.x, B.y, "rgba(13,165,198,.2)", 11) + lineSvg(C.x, C.y, B.x, B.y, GEO.hlB, 3.2);
    const arcB35 = angleArc(B.x, B.y, 16, angBtoA, 180, GEO.hlA, "35°", { labelR: 30, fontSize: 10, fill: true });
    const arcA55 = angleArc(A.x, A.y, 16, 270, angAtoB, GEO.hlB, "55°", { labelR: 30, fontSize: 10, fill: true });
    gGivens.innerHTML = i === 0 ? haloHyp + arcB35 : i === 1 ? haloHyp + haloBase : arcB35 + arcA55;
  }

  /** 복제본(슬롯 좌표에서 태어나 기준 위로 슬라이드) SVG 조각. */
  function cloneSvg(i: 0 | 1): string {
    return (
      triFill(SA, SB, SC, "rgba(25,113,194,.15)") +
      lineSvg(SC.x, SC.y, SB.x, SB.y, i === 1 ? GEO.hlB : GEO.ink, i === 1 ? 3.2 : 2.6) +
      lineSvg(SC.x, SC.y, SA.x, SA.y, GEO.ink, 2.6) +
      lineSvg(SA.x, SA.y, SB.x, SB.y, PROVE, 3.6) +
      rightMark(SC.x, SC.y, 0, 9) +
      (i === 0
        ? angleArc(SB.x, SB.y, 14, angleOf(SB.x, SB.y, SA.x, SA.y), 180, GEO.hlA, "35°", { labelR: 27, fontSize: 9.5 })
        : "")
    );
  }

  /** 함정 국면의 닮은꼴 삼각형(직각 모서리 SC 공유, 배율 sc). */
  function trapTri(sc: number, withRight: boolean): SVGGElement {
    const b = { x: SC.x + 112 * sc, y: SC.y };
    const a = { x: SC.x, y: SC.y - 84 * sc };
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "rhc-trap");
    g.innerHTML =
      lineSvg(SC.x, SC.y, b.x, b.y, GEO.ink, 2) +
      lineSvg(SC.x, SC.y, a.x, a.y, GEO.ink, 2) +
      lineSvg(a.x, a.y, b.x, b.y, GEO.ink, 2) +
      (withRight ? rightMark(SC.x, SC.y, 0, 7) : "") +
      angleArc(b.x, b.y, 11, angleOf(b.x, b.y, a.x, a.y), 180, GEO.hlA, undefined, { width: 2 }) +
      angleArc(a.x, a.y, 11, 270, angleOf(a.x, a.y, b.x, b.y), GEO.hlB, undefined, { width: 2 });
    return g;
  }

  /** 이전 주문의 결과물을 슬롯에서 걷어낸다(페이드 아웃 후 제거). */
  function resetSlot(): void {
    const olds = Array.from(gSlot.children);
    if (!olds.length) return;
    for (const o of olds) o.classList.remove("show");
    later(() => {
      for (const o of olds) o.remove();
    }, 520);
  }

  function stampCard(ok: boolean): void {
    if (card.querySelector(".rhc-stamp")) return;
    card.appendChild(el("span", { class: `rhc-stamp ${ok ? "ok" : "no"}`, text: ok ? "복제 성공" : "복제 불가" }));
  }

  /** 주문서 카드를 i번으로 교체(enter 트랜지션 + 기준 하이라이트 + 슬롯 정리). */
  function renderCard(i: number): void {
    card.classList.add("enter");
    later(
      () => {
        clear(card);
        const o = ORDERS[i];
        card.appendChild(
          el("div", { class: "rhc-head" }, el("span", { class: "rhc-tag", text: o.tag }), el("span", { class: "rhc-note", text: o.note })),
        );
        const row = el("div", { class: "rhc-chips" });
        for (const [t, k] of o.infos) row.appendChild(el("span", { class: `rhc-chip ${k}`, text: t }));
        card.appendChild(row);
        const actions = el("div", { class: "lk-actions" });
        const btn = el(
          "button",
          { class: "ct-btn hero rhc-do", attrs: { type: "button" } },
          el("span", { text: "이 정보로 복제" }),
        );
        btn.addEventListener("click", () => {
          if (busy || btn.disabled) return;
          btn.disabled = true;
          haptic(HAPTIC.select);
          if (i < 2) runClone(i as 0 | 1);
          else runTrap();
        });
        actions.appendChild(btn);
        card.appendChild(actions);
        paintGivens(i);
        resetSlot();
        // 잠긴 칩의 부제를 현재 주문서로 안내(켜는 건 판정 몫)
        if (i === 1) (chips.el.querySelector(`[data-g="rhs"] span`) as HTMLElement).textContent = "주문서 ②";
        if (i === 2) (chips.el.querySelector(`[data-g="trap"] span`) as HTMLElement).textContent = "주문서 ③";
        card.getBoundingClientRect(); // reflow 후 enter 해제 → 등장 트랜지션
        card.classList.remove("enter");
        later(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
      },
      i === 0 ? 60 : 380,
    );
  }

  /* ── 국면 1·2: 복제 성공 연출(페이드 인 → 포개짐 → 복귀) ── */
  function runClone(i: 0 | 1): void {
    busy = true;
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "rhc-clone");
    g.innerHTML = cloneSvg(i);
    gSlot.appendChild(g);
    g.getBoundingClientRect(); // reflow
    g.classList.add("show"); // 0.5s 페이드 인
    later(() => {
      g.style.transform = `translate(${DX}px, 0px)`; // 0.7s 슬라이드, 기준 위로 딱
    }, 640);
    later(() => {
      // 포개짐 순간
      g.classList.add("flash");
      haptic(HAPTIC.correct);
      chips.on(i === 0 ? "rha" : "rhs", "복제 성공!");
      toast(i === 0 ? "완전히 포개져요! 정보 2개로 복제 성공" : "이번에도 딱 포개져요! 빗변+변 조합도 복제 성공");
      stampCard(true);
    }, 1380);
    later(() => {
      g.classList.remove("flash");
      g.style.transform = ""; // 슬롯으로 복귀
    }, 2340);
    later(() => {
      helper.innerHTML =
        i === 0
          ? "직각 말고는 딱 2개(빗변+예각)였는데 복제가 확정됐어요. 다른 조합도 될까요? <b>주문서 ②</b>로 실험해 보세요!"
          : "빗변+다른 한 변도 성공! 그럼 <b>빗변 없이</b> 예각 2개면 어떨까요? 주문서 ③으로 확인해 보세요.";
      busy = false;
      renderCard(i + 1);
    }, 3080);
  }

  /* ── 국면 3: 함정 — 모양만 같은 삼형제 ── */
  function runTrap(): void {
    busy = true;
    const scales = [0.5, 0.78, 1.08]; // 작은 것 → 중간 → 큰 것
    scales.forEach((sc, k) => {
      later(() => {
        const g = trapTri(sc, k === 0);
        gSlot.appendChild(g);
        g.getBoundingClientRect();
        g.classList.add("pop");
        haptic(HAPTIC.tap);
      }, 260 + k * 420);
    });
    later(() => {
      haptic(HAPTIC.wrong);
      toast("모양은 같은데 크기가 제각각! 복제 실패…");
      stampCard(false);
    }, 1620);
    later(askTrap, 2380);
  }

  function askTrap(): void {
    qline.innerHTML = "직각삼각형 복제 주문서에 <b>꼭 있어야 하는</b> 정보는?";
    const items = [
      {
        t: "각도만 2개 있으면 돼요",
        good: false,
        fb: "방금 실패를 봤죠? 각도만 같으면 모양만 같은 크고 작은 삼각형이 무수히 나와요. 크기를 고정할 길이가 하나는 필요해요.",
      },
      {
        t: "빗변의 길이. 크기를 붙잡아 줄 길이 정보가 필요해요",
        good: true,
        fb: "맞아요! 각도는 모양만 정할 뿐 크기를 못 정해요. 빗변의 길이가 크기를 딱 붙잡아 줘야 복제가 확정되죠.",
      },
      {
        t: "정보가 3개는 있어야 해요",
        good: false,
        fb: "일반 삼각형이라면 3개가 필요하지만, 직각삼각형은 직각이 이미 정보 1개예요. 그래서 빗변을 포함한 2개면 충분하죠!",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(finish, 2000);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    qline.innerHTML = "";
    clear(ctl);
    chips.on("trap", "간파!");
    haptic(HAPTIC.done);
    helper.innerHTML =
      "직각(R) 하나는 공짜 정보. <b>빗변과 하나 더</b>면 복제 끝! 이 두 조합의 정식 이름을 붙이러 가요.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "이름 붙이러 가기");
  }

  renderCard(0);
  api.setCTA("주문서 3장을 모두 처리하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
