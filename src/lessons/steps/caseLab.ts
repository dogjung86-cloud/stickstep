// caseLab, 경우 수집대(중2 Ⅵ L1 — 사건·경우의 수 도입 랩). "빠짐없이, 겹치지 않게"를 몸으로.
// 무대: 사건 카드(레드) + 수집 선반(골드) + 주사위 눈 카드 6장(표준 눈 배치, mathFigures2 dice6 관례).
// 국면 3개: 1 '6의 약수' 수집(1,2,3,6) → 2 '5 이상' 수집(5,6 — '이상' 경계 함정) →
//   3 판정('홀수의 눈'의 경우의 수, 선반 없이 머릿속 나열 — 선반 칸수가 답을 흘리지 않게 국면 3은 선반 미사용).
// 함정 설계: [수집 확인]은 처음부터 노출, 미완이면 빠진 눈을 콕 짚는다("1도 6의 약수예요!").
// 뼈대는 meanPullLab 계승(칩→helper→보드, mq6 판정 문법). rAF 금지 — CSS 트랜지션+setTimeout 체인,
// 카드 이동은 인라인 style.transform(px=SVG 사용자 좌표)이라 새 CSS 없이도 동작한다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CaseLabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 208;
const CARD = 46; // 눈 카드 한 변
const ROW_Y = 152; // 카드 대기 줄 y
const SHELF_Y = 73; // 선반 위 카드 y
const ROWX = [0, 1, 2, 3, 4, 5].map((i) => 12 + i * (CARD + 8));
const SPRING = "transform .5s var(--spring-soft)";

// 주사위 눈 배치 — mathFigures2 dice6과 같은 단위 좌표(표준 배치, 개념 그림과 시각 일치)
const PIP: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.19, -0.19], [0.19, 0.19]],
  3: [[-0.21, -0.21], [0, 0], [0.21, 0.21]],
  4: [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]],
  5: [[-0.21, -0.21], [0.21, -0.21], [0, 0], [-0.21, 0.21], [0.21, 0.21]],
  6: [[-0.18, -0.22], [0.18, -0.22], [-0.18, 0], [0.18, 0], [-0.18, 0.22], [0.18, 0.22]],
};

// 은/는 조사(일·삼·육 = 받침 있음)
const EUN = (v: number): string => (v === 1 || v === 3 || v === 6 ? "은" : "는");

interface EventSpec {
  text: string; // 사건 카드 문장
  want: number[]; // 조건에 맞는 눈(오름차순)
  chip: string;
  chipSub: string;
  concl: string;
  inst: string;
  helper: string;
  wrong(v: number): string;
  miss(v: number): string;
}

const EVENTS: EventSpec[] = [
  {
    text: "6의 약수의 눈이 나온다",
    want: [1, 2, 3, 6],
    chip: "ev1",
    chipSub: "4가지",
    concl: "'6의 약수의 눈'이 나오는 경우는 <b>1, 2, 3, 6</b>. 빠짐없이 <b>4가지</b>!",
    inst: "사건: <b>6의 약수의 눈이 나온다</b>. 조건에 맞는 눈 카드를 모두 탭!",
    helper:
      "눈 카드를 탭하면 사건 카드가 검사해요. 통과한 카드만 선반에 올라가죠. 다 모았다 싶으면 <b>수집 확인</b>을 눌러요!",
    wrong: (v) => `${v}${EUN(v)} 6의 약수가 아니에요! 6을 ${v}로 나누면 나누어떨어지지 않죠`,
    miss: (v) => `아직 빠진 경우가 있어요. ${v}도 6의 약수예요!`,
  },
  {
    text: "5 이상의 눈이 나온다",
    want: [5, 6],
    chip: "ev2",
    chipSub: "2가지",
    concl: "'5 이상의 눈'이 나오는 경우는 <b>5, 6</b>. 딱 <b>2가지</b>!",
    inst: "새 사건: <b>5 이상의 눈이 나온다</b>. 이번에도 빠짐없이, 겹치지 않게!",
    helper: "'이상'이라는 말의 경계를 조심해요. 5는 들어갈까요, 안 들어갈까요? 다 모으면 <b>수집 확인</b>!",
    wrong: (v) => `${v}${EUN(v)} 5 이상이 아니에요! '이상'은 5부터 시작해요`,
    miss: (v) => `아직 빠진 경우가 있어요. ${v}도 5 이상이에요!`,
  },
];

const DEFS =
  `<defs>` +
  `<linearGradient id="csl-ev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>` +
  `<linearGradient id="csl-dice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F6E8E4"/><stop offset="1" stop-color="#EBCFC7"/></linearGradient>` +
  `<linearGradient id="csl-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B0"/><stop offset=".55" stop-color="#EFC35C"/><stop offset="1" stop-color="#D89B24"/></linearGradient>` +
  `<radialGradient id="csl-key" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>` +
  `</defs>`;

/** 눈 카드 한 장(로컬 0,0 기준 46×46 — 위치는 style.transform으로만). */
function cardSvg(v: number): string {
  const pips = (PIP[v] ?? [])
    .map(
      ([ux, uy]) =>
        `<circle class="csl-pip" cx="${(23 + ux * CARD).toFixed(1)}" cy="${(23 + uy * CARD).toFixed(1)}" r="3.5" fill="#6E5A54"/>`,
    )
    .join("");
  return (
    `<g class="csl-card" data-v="${v}" role="button" tabindex="0" aria-label="눈 ${v}"` +
    ` style="transform:translate(${ROWX[v - 1]}px,${ROW_Y}px);transition:${SPRING};cursor:pointer">` +
    `<ellipse cx="23" cy="48.5" rx="17" ry="3.2" fill="#2A3A5E" opacity=".1"/>` +
    `<rect class="csl-face" x=".8" y=".8" width="44.4" height="44.4" rx="10" fill="url(#csl-dice)" stroke="#B7A29A" stroke-width="1.6"/>` +
    `<ellipse cx="13.8" cy="10.1" rx="8.3" ry="3.7" fill="#FFFFFF" opacity=".55"/>` +
    pips +
    `</g>`
  );
}

export const caseLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CaseLabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "ev1", label: "6의 약수", sub: "빠짐없이" },
    { id: "ev2", label: "5 이상", sub: "경계 조심" },
    { id: "judge", label: "홀수 판정", sub: "마지막 관문" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "csl-stage" });
  const ghosts = ROWX.map(
    (x) =>
      `<rect x="${x + 2}" y="${ROW_Y + 2}" width="42" height="42" rx="9" fill="#EDF1F8" fill-opacity=".55" stroke="#C3CCDE" stroke-width="1.3" stroke-dasharray="4 4"/>`,
  ).join("");
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none" style="width:100%;height:auto;display:block">` +
    DEFS +
    // 사건 카드(레드 3스톱 + 키라이트 + 접촉 그림자 + 최암 레드 외곽선)
    `<g class="csl-event">` +
    `<ellipse cx="170" cy="52.5" rx="145" ry="4.5" fill="#2A3A5E" opacity=".1"/>` +
    `<rect x="12" y="8" width="316" height="42" rx="12" fill="url(#csl-ev)" stroke="#8F1D1D" stroke-width="1.5"/>` +
    `<ellipse cx="62" cy="14" rx="44" ry="7" fill="url(#csl-key)" opacity=".5"/>` +
    `<rect x="24" y="19" width="40" height="20" rx="10" fill="#FFFFFF" fill-opacity=".22" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1"/>` +
    `<text x="44" y="33" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">사건</text>` +
    `<text class="csl-evtext" x="195" y="34.5" text-anchor="middle" font-size="13.5" font-weight="800" fill="#FFFFFF">${EVENTS[0].text}</text>` +
    `</g>` +
    // 수집 선반(골드 — 칸을 그리지 않는다: 칸 수가 정답 개수를 흘리면 함정이 죽는다)
    `<g class="csl-shelfg">` +
    `<ellipse cx="170" cy="130.5" rx="145" ry="4.5" fill="#2A3A5E" opacity=".1"/>` +
    `<rect x="12" y="64" width="316" height="64" rx="14" fill="url(#csl-shelf)" stroke="#8C6A1E" stroke-width="1.5"/>` +
    `<ellipse cx="64" cy="70" rx="46" ry="6.5" fill="url(#csl-key)" opacity=".5"/>` +
    `<text x="320" y="79" text-anchor="end" font-size="10" font-weight="800" fill="#7A5510">수집 선반</text>` +
    `</g>` +
    ghosts +
    `<g class="csl-cards">` +
    [1, 2, 3, 4, 5, 6].map(cardSvg).join("") +
    `</g></svg>`;

  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst", html: EVENTS[0].inst });
  const meter = el("div", { class: "mq6-gauge", html: "모은 경우 <b>0</b>가지" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" }); // 판정 질문은 항상 선택지 바로 위
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, meter, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper", html: EVENTS[0].helper });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드 순서
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const evText = svg.querySelector(".csl-evtext") as SVGTextElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  let lock = false;
  let finished = false;
  const got = new Set<number>();

  const cardEl = (v: number): SVGGElement | null =>
    svg.querySelector(`.csl-card[data-v="${v}"]`) as SVGGElement | null;

  /** 수집 표시 — 개념 그림(diceEventFig)의 강조 문법 그대로: 주색 링 + 진한 레드 눈. */
  function setCollected(g: SVGGElement, on: boolean): void {
    const face = g.querySelector(".csl-face") as SVGRectElement | null;
    face?.setAttribute("stroke", on ? "#C92A2A" : "#B7A29A");
    face?.setAttribute("stroke-width", on ? "2.4" : "1.6");
    g.querySelectorAll<SVGCircleElement>(".csl-pip").forEach((p) => p.setAttribute("fill", on ? "#8F1D1D" : "#6E5A54"));
  }

  /** 선반 위 카드들을 크기순으로 가운데 정렬 — "나열해서 세기" 습관이 화면에 남는다. */
  function layoutShelf(): void {
    const vals = [...got].sort((a, b) => a - b);
    const total = vals.length * CARD + (vals.length - 1) * 8;
    const x0 = (W - total) / 2;
    vals.forEach((v, j) => {
      const g = cardEl(v);
      if (g) g.style.transform = `translate(${(x0 + j * (CARD + 8)).toFixed(1)}px,${SHELF_Y}px)`;
    });
  }

  function resetCards(): void {
    got.clear();
    for (let v = 1; v <= 6; v++) {
      const g = cardEl(v);
      if (!g) continue;
      g.style.transform = `translate(${ROWX[v - 1]}px,${ROW_Y}px)`;
      setCollected(g, false);
    }
    meter.innerHTML = "모은 경우 <b>0</b>가지";
  }

  /** 조건 불합격 카드의 도리도리 — 키프레임 없이 setTimeout 체인(rAF 금지 규율과 동일 결). */
  function shake(g: SVGGElement, x: number): void {
    if (g.dataset.shaking === "1") return;
    g.dataset.shaking = "1";
    g.style.transition = "transform .06s linear";
    const seq = [7, -6, 4, -2, 0];
    seq.forEach((dx, i) =>
      later(() => {
        g.style.transform = `translate(${x + dx}px,${ROW_Y}px)`;
        if (i === seq.length - 1)
          later(() => {
            g.style.transition = SPRING;
            delete g.dataset.shaking;
          }, 80);
      }, 60 * (i + 1)),
    );
  }

  function onCard(v: number, g: SVGGElement): void {
    if (finished || lock) return;
    if (phase === 3) {
      haptic(HAPTIC.tap);
      toast("이제 카드는 그대로 두고, 홀수의 눈만 머릿속으로 짚어 봐요!");
      return;
    }
    const P = EVENTS[phase - 1];
    if (got.has(v)) {
      haptic(HAPTIC.cross);
      toast("이미 선반에 있어요. 같은 경우를 두 번 세면 겹쳐요!");
      return;
    }
    if (!P.want.includes(v)) {
      haptic(HAPTIC.wrong);
      shake(g, ROWX[v - 1]);
      toast(P.wrong(v));
      return;
    }
    got.add(v);
    haptic(HAPTIC.correct);
    setCollected(g, true);
    layoutShelf();
    meter.innerHTML = `모은 경우 <b>${got.size}</b>가지`;
  }

  /* ── [수집 확인] — 미완이면 빠진 눈을 짚는 함정 검사 ── */
  function onConfirm(): void {
    if (finished || lock || phase === 3) return;
    const P = EVENTS[phase - 1];
    const missing = P.want.filter((v) => !got.has(v));
    if (missing.length > 0) {
      haptic(HAPTIC.cross);
      toast(P.miss(missing[0]));
      return;
    }
    lock = true;
    haptic(HAPTIC.correct);
    eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: P.concl }));
    chips.on(P.chip, P.chipSub);
    later(phase === 1 ? startPhase2 : startPhase3, 1900);
  }

  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    resetCards();
    evText.textContent = EVENTS[1].text;
    inst.innerHTML = EVENTS[1].inst;
    helper.innerHTML = EVENTS[1].helper;
    lock = false;
  }

  /* ── 국면 3: 판정(선반 없이 머릿속 나열) ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    resetCards();
    evText.textContent = "홀수의 눈이 나온다";
    inst.innerHTML = "마지막 판정: 선반 없이 머릿속으로 나열해 봐요";
    helper.innerHTML = "홀수의 눈을 마음속으로 하나씩 짚어요. 빠짐없이, 겹치지 않게!";
    meter.style.display = "none";
    clear(ctl);
    qline.innerHTML = "'홀수의 눈이 나온다' 사건의 경우의 수는?";
    const row = el("div", { class: "mq6-choices" });
    ([
      ["3가지", true, ""],
      ["2가지", false, "1도 홀수예요, 빠짐없이! 3과 5만 세면 하나를 놓친 거죠"],
      ["6가지", false, "6은 모든 경우의 수예요, 사건에 맞는 눈만 세요!"],
    ] as [string, boolean, string][]).forEach(([label, ok, msg]) => {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (finished) return;
        if (ok) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "홀수의 눈은 <b>1, 3, 5</b>의 <b>3가지</b>! 빠짐없이, 겹치지 않게 세는 눈이 생겼어요",
            }),
          );
          chips.on("judge", "3가지");
          later(finish, 1500);
        } else {
          haptic(HAPTIC.cross);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 650);
          toast(msg);
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
    lock = false;
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "경우 세기의 철칙은 <b>빠짐없이, 겹치지 않게</b>! 방금 그 감각에 정식 이름을 붙이러 가요";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 조립: 카드 리스너 + 확인 버튼 ── */
  svg.querySelectorAll<SVGGElement>(".csl-card").forEach((g) => {
    const v = Number(g.dataset.v);
    g.addEventListener("click", () => onCard(v, g));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCard(v, g);
      }
    });
  });

  const confirmBtn = el("button", {
    class: "mq6-btn",
    text: "수집 확인",
    attrs: { type: "button", "aria-label": "수집 확인" },
  });
  confirmBtn.addEventListener("click", onConfirm);
  ctl.appendChild(confirmBtn);

  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
