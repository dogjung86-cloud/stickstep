// shapeLockLab, "모양 잠금 공방"(중2 수학 Ⅴ L4, 삼각형의 닮음 조건 — 책 199~201쪽).
// 왼쪽 의뢰 삼각형(의뢰서 원본, 변 3색 구분) + 오른쪽 후보 실루엣 4개(부채 배치) +
// 아래 정보 카드 상점(탭으로 열기). 의뢰 3건을 순차 처리한다:
// ① 각 2개 → 모양 확정 + 크기 3종 러시아 인형 연출(칩 aa)
// ② 변 비 2개 + 끼인각 → 확정(칩 sas)
// ③ 함정: 변 비 2개 + 끼인각 아닌 각(∠C) → SSA 두 해가 모두 살아남는 확정 실패 연출 →
//    판정 mq6 → CA 비를 마저 열어 변 비 3개로 확정(칩 trap) → recordQuiz + CTA.
// SSS·SAS·AA 명칭은 다음 concept 몫이라 이 랩에서 금지("변 비 3개/변 비 2개와 끼인각/
// 각 2개"로만 서술, '닮음'은 L1 기왕이라 허용). 후보 기하는 전부 생성기 계산(눈대중 금지):
// 밑각 쌍(triBase)·SAS(triSAS)·SSA 두 해(triSSA — 국면 ③의 "정보 3개인데 2모양"이
// 수학적으로 진짜인 모호한 경우 그 자체다).
// rAF 금지: CSS 트랜지션/키프레임 + setTimeout 체인(타이머 Set → cleanup). CSS: math2.css .slk-*.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, angleArc, angleOf, dot, ptLabel, lineSvg } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Pt {
  x: number;
  y: number;
}

const NS = "http://www.w3.org/2000/svg";
const SIM = "#C2255C"; // 단원 액센트(마트료시카 라즈베리)
const C_AB = "#E8547E"; // 변 AB(로즈)
const C_BC = "#0DA5C6"; // 변 BC(틸)
const C_CA = "#F08C00"; // 변 CA(앰버)
const C_ANGB = "#F08C00"; // ∠B 호(앰버)
const C_ANGC = "#12B886"; // ∠C 호(그린 — BC 틸과 겹치지 않게)
const FILLS = [
  "rgba(194,37,92,.32)",
  "rgba(73,80,120,.30)",
  "rgba(240,140,0,.26)",
  "rgba(13,165,198,.26)",
];

const d2r = (d: number): number => (d * Math.PI) / 180;

/** 밑변 왼끝 B + 밑변 길이 L + 두 밑각(β=∠B, γ=∠C)으로 삼각형 [A,B,C] 생성. */
function triBase(B: Pt, L: number, beta: number, gamma: number): [Pt, Pt, Pt] {
  const tb = Math.tan(d2r(beta));
  const tg = Math.tan(d2r(gamma));
  const h = (L * tb * tg) / (tb + tg);
  return [{ x: B.x + h / tb, y: B.y - h }, B, { x: B.x + L, y: B.y }];
}

/** SAS 생성: AB 길이 + ∠B + BC 길이(밑변은 +x 방향). */
function triSAS(B: Pt, ab: number, betaDeg: number, bc: number): [Pt, Pt, Pt] {
  return [
    { x: B.x + ab * Math.cos(d2r(betaDeg)), y: B.y - ab * Math.sin(d2r(betaDeg)) },
    B,
    { x: B.x + bc, y: B.y },
  ];
}

/** SSA 생성(모호한 경우): AB·BC와 끼인각 아닌 ∠C. tall=true가 CA 긴 해, false가 짧은 해. */
function triSSA(B: Pt, ab: number, bc: number, gammaDeg: number, tall: boolean): [Pt, Pt, Pt] {
  const g = d2r(gammaDeg);
  const C = { x: B.x + bc, y: B.y };
  const disc = Math.sqrt(ab * ab - bc * bc * Math.sin(g) ** 2);
  const u = bc * Math.cos(g) + (tall ? disc : -disc);
  return [{ x: C.x - u * Math.cos(g), y: C.y - u * Math.sin(g) }, B, C];
}

type CardId = "angB" | "angC" | "ab" | "bc" | "ca";

interface CardCfg {
  id: CardId;
  label: string;
  value: string;
  /** ready 즉시 가능 · locked 값은 보이나 잠김(해금 이벤트로 개방) · none 이번 의뢰에 없는 정보(?) */
  state: "ready" | "locked" | "none";
  kills: number[];
}

interface Cand {
  pts: [Pt, Pt, Pt];
  rot: number; // 부채 배치 회전(도, CSS 시계+)
  fill: string;
}

interface PhaseCfg {
  tag: string;
  brief: string;
  req: [Pt, Pt, Pt];
  cands: Cand[];
  cards: CardCfg[];
}

function phase1(): PhaseCfg {
  return {
    tag: "의뢰 ①",
    brief: "의뢰서에 온 정보는 <b>각 2개</b>뿐이에요. 카드를 열어 후보 중 의뢰와 같은 모양을 찾아요!",
    req: triBase({ x: 26, y: 198 }, 76, 40, 65),
    cands: [
      { pts: triBase({ x: 164, y: 208 }, 118, 40, 65), rot: -5, fill: FILLS[0] },
      { pts: triBase({ x: 172, y: 192 }, 128, 40, 30), rot: 4, fill: FILLS[1] },
      { pts: triBase({ x: 196, y: 214 }, 100, 58, 65), rot: -8, fill: FILLS[2] },
      { pts: triBase({ x: 152, y: 200 }, 96, 75, 42), rot: 7, fill: FILLS[3] },
    ],
    cards: [
      { id: "angB", label: "∠B", value: "40°", state: "ready", kills: [2, 3] },
      { id: "angC", label: "∠C", value: "65°", state: "ready", kills: [1, 3] },
      { id: "ab", label: "AB 비", value: "?", state: "none", kills: [] },
      { id: "bc", label: "BC 비", value: "?", state: "none", kills: [] },
      { id: "ca", label: "CA 비", value: "?", state: "none", kills: [] },
    ],
  };
}

function phase2(): PhaseCfg {
  return {
    tag: "의뢰 ②",
    brief: "이번 의뢰는 <b>2배 확대 제작</b>이에요. 길이 정보 카드 2장부터 열어 보세요!",
    req: triSAS({ x: 26, y: 198 }, 56, 55, 66),
    cands: [
      { pts: triSAS({ x: 166, y: 206 }, 112, 55, 132), rot: -4, fill: FILLS[2] },
      { pts: triSAS({ x: 184, y: 196 }, 112, 82, 132), rot: 5, fill: FILLS[0] },
      { pts: triSAS({ x: 156, y: 214 }, 112, 48, 104), rot: -8, fill: FILLS[3] },
      { pts: triSAS({ x: 176, y: 188 }, 84, 62, 132), rot: 8, fill: FILLS[1] },
    ],
    cards: [
      { id: "angB", label: "∠B", value: "55°", state: "locked", kills: [1] },
      { id: "angC", label: "∠C", value: "?", state: "none", kills: [] },
      { id: "ab", label: "AB 비", value: "1:2", state: "ready", kills: [3] },
      { id: "bc", label: "BC 비", value: "1:2", state: "ready", kills: [2] },
      { id: "ca", label: "CA 비", value: "?", state: "none", kills: [] },
    ],
  };
}

function phase3(): PhaseCfg {
  return {
    tag: "의뢰 ③",
    brief: "또 <b>2배 확대</b> 의뢰예요. 그런데 온 각이 좀 이상해요. 일단 길이 카드부터!",
    req: triSSA({ x: 26, y: 198 }, 44, 64, 38, true),
    cands: [
      { pts: triSSA({ x: 168, y: 204 }, 88, 128, 38, true), rot: -4, fill: FILLS[1] },
      { pts: triSSA({ x: 180, y: 196 }, 88, 128, 38, false), rot: 4, fill: FILLS[0] },
      { pts: triSSA({ x: 152, y: 212 }, 88, 136, 38, true), rot: -7, fill: FILLS[3] },
      { pts: triSSA({ x: 190, y: 190 }, 110, 128, 38, true), rot: 6, fill: FILLS[2] },
    ],
    cards: [
      { id: "angB", label: "∠B", value: "?", state: "none", kills: [] },
      { id: "angC", label: "∠C", value: "38°", state: "locked", kills: [] },
      { id: "ab", label: "AB 비", value: "1:2", state: "ready", kills: [3] },
      { id: "bc", label: "BC 비", value: "1:2", state: "ready", kills: [2] },
      { id: "ca", label: "CA 비", value: "?", state: "none", kills: [1] },
    ],
  };
}

const PHASES = [phase1, phase2, phase3];

export const shapeLockLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "aa", label: "각 두 개", sub: "의뢰 ①" },
    { id: "sas", label: "변 비 둘·끼인각", sub: "잠김" },
    { id: "trap", label: "끼인각 함정", sub: "잠김" },
  ]);

  const board = mboard(540);
  const counter = el("div", { class: "slk-count", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", {
    class: "mcl-plane",
    attrs: { role: "img", "aria-label": "왼쪽에 의뢰 삼각형, 오른쪽에 후보 삼각형 실루엣 무리" },
  });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 250" xmlns="${NS}" fill="none">` +
    `<g class="slk-req"></g><g class="slk-cands"></g><g class="slk-marks"></g><g class="slk-badge"></g>` +
    `</svg>`;
  const cardsRow = el("div", { class: "slk-cards", attrs: { role: "group", "aria-label": "정보 카드 상점" } });
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(counter, svgWrap, cardsRow, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 사용자 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gReq = svg.querySelector(".slk-req") as SVGGElement;
  const gCands = svg.querySelector(".slk-cands") as SVGGElement;
  const gMarks = svg.querySelector(".slk-marks") as SVGGElement;
  const gBadge = svg.querySelector(".slk-badge") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phaseIdx = 0;
  let cur: PhaseCfg = PHASES[0]();
  let alive = new Set<number>([0, 1, 2, 3]);
  const openSet = new Set<CardId>();
  const candEls: SVGGElement[] = [];
  const cardBtns: HTMLButtonElement[] = [];
  let busy = false;
  let finished = false;

  /* ── 그리기 ── */

  function paintReq(): void {
    const [A, B, C] = cur.req;
    gReq.innerHTML =
      `<text x="18" y="22" font-size="11.5" font-weight="900" fill="${SIM}">${cur.tag}</text>` +
      `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x.toFixed(1)} ${B.y.toFixed(1)} L${C.x.toFixed(1)} ${C.y.toFixed(1)} Z" fill="rgba(194,37,92,.06)"/>` +
      lineSvg(A.x, A.y, B.x, B.y, C_AB, 2.6) +
      lineSvg(B.x, B.y, C.x, C.y, C_BC, 2.6) +
      lineSvg(C.x, C.y, A.x, A.y, C_CA, 2.6) +
      dot(A.x, A.y, GEO.ink, 3) + dot(B.x, B.y, GEO.ink, 3) + dot(C.x, C.y, GEO.ink, 3) +
      ptLabel(A.x, A.y, "A", 0, -9) + ptLabel(B.x, B.y, "B", -10, 13) + ptLabel(C.x, C.y, "C", 10, 13) +
      `<text x="${((B.x + C.x) / 2).toFixed(1)}" y="232" text-anchor="middle" font-size="9.5" font-weight="700" fill="${GEO.soft}">의뢰서 원본</text>` +
      `<text x="245" y="244" text-anchor="middle" font-size="9.5" font-weight="700" fill="${GEO.soft}">후보 실루엣</text>`;
  }

  function paintCands(): void {
    clear(gCands);
    candEls.length = 0;
    cur.cands.forEach((c, i) => {
      const [A, B, C] = c.pts;
      const mx = (B.x + C.x) / 2;
      const my = (B.y + C.y) / 2;
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "slk-cand");
      g.style.transformOrigin = `${mx}px ${my}px`;
      g.style.setProperty("--rot", `${c.rot}deg`);
      g.style.setProperty("--op", "0");
      g.style.setProperty("--sc", ".7");
      g.innerHTML =
        `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x.toFixed(1)} ${B.y.toFixed(1)} L${C.x.toFixed(1)} ${C.y.toFixed(1)} Z" ` +
        `fill="${c.fill}" stroke="rgba(51,65,85,.5)" stroke-width="1.6" stroke-linejoin="round"/>`;
      gCands.appendChild(g);
      candEls.push(g);
      later(() => {
        g.style.setProperty("--op", "1");
        g.style.setProperty("--sc", "1");
      }, 90 + i * 110);
    });
  }

  /** 카드가 준 정보를 의뢰 삼각형 위에 하이라이트(각 호·변 할로). */
  function paintGiven(id: CardId, value: string): void {
    const [A, B, C] = cur.req;
    if (id === "angB") {
      gMarks.insertAdjacentHTML(
        "beforeend",
        angleArc(B.x, B.y, 13, 0, angleOf(B.x, B.y, A.x, A.y), C_ANGB, value, { labelR: 26, fontSize: 9.5, fill: true }),
      );
    } else if (id === "angC") {
      gMarks.insertAdjacentHTML(
        "beforeend",
        angleArc(C.x, C.y, 13, angleOf(C.x, C.y, A.x, A.y), 180, C_ANGC, value, { labelR: 26, fontSize: 9.5, fill: true }),
      );
    } else {
      const seg: [Pt, Pt, string, string, number, number] =
        id === "ab"
          ? [A, B, C_AB, "rgba(232,84,126,.24)", -15, -2]
          : id === "bc"
            ? [B, C, C_BC, "rgba(13,165,198,.22)", 0, 15]
            : [C, A, C_CA, "rgba(240,140,0,.22)", 15, -2];
      const [P, Q, color, halo, dx, dy] = seg;
      const mid = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
      gMarks.insertAdjacentHTML(
        "beforeend",
        lineSvg(P.x, P.y, Q.x, Q.y, halo, 9) +
          `<text x="${(mid.x + dx).toFixed(1)}" y="${(mid.y + dy).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="900" fill="${color}">${value}</text>`,
      );
    }
  }

  function renderCards(): void {
    clear(cardsRow);
    cardBtns.length = 0;
    cur.cards.forEach((cd, i) => {
      const b = el(
        "button",
        {
          class: `slk-card${cd.id === "angB" || cd.id === "angC" ? " ang" : ""}${cd.state === "none" ? " none" : ""}`,
          attrs: { type: "button", "aria-label": `정보 카드 ${cd.label} ${cd.value}` },
        },
        el("b", { text: cd.label }),
        el("span", { text: cd.value }),
      ) as HTMLButtonElement;
      if (cd.state !== "ready") b.disabled = true;
      b.addEventListener("click", () => openCard(i));
      cardBtns.push(b);
      cardsRow.appendChild(b);
    });
  }

  function unlockCard(id: CardId, newValue?: string): void {
    const i = cur.cards.findIndex((c) => c.id === id);
    if (i < 0) return;
    const cd = cur.cards[i];
    cd.state = "ready";
    if (newValue) cd.value = newValue;
    const b = cardBtns[i];
    b.disabled = false;
    b.classList.remove("none");
    b.classList.add("pulse");
    (b.querySelector("span") as HTMLElement).textContent = cd.value;
    haptic(HAPTIC.tap);
    later(() => cardsRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function updateCount(): void {
    counter.innerHTML = `남은 후보 모양 <b>${alive.size}</b>개`;
  }

  function killCand(i: number): void {
    if (!alive.has(i)) return;
    alive.delete(i);
    candEls[i].style.setProperty("--op", "0");
    candEls[i].style.setProperty("--sc", ".35");
  }

  /** 생존 후보 확정 연출(플래시 + 배지 필). */
  function lockCand(i: number): void {
    const g = candEls[i];
    g.classList.add("lock");
    const apex = cur.cands[i].pts[0];
    const bx = Math.min(Math.max(apex.x, 100), 270);
    const by = Math.max(apex.y - 20, 16);
    gBadge.innerHTML =
      `<g class="slk-pill" style="transform-origin:${bx}px ${by + 10}px">` +
      `<rect x="${bx - 43}" y="${by}" width="86" height="20" rx="10" fill="#FFFFFF" stroke="#04B45F" stroke-width="1.8"/>` +
      `<text x="${bx}" y="${by + 14}" text-anchor="middle" font-size="11" font-weight="900" fill="#1E7A31">모양 확정!</text>` +
      `</g>`;
    counter.innerHTML = `남은 후보 모양 <b>1</b>개, 확정!`;
    haptic(HAPTIC.correct);
  }

  function mkBtn(label: string, fn: () => void): HTMLButtonElement {
    const b = el("button", { class: "ct-btn hero slk-go", attrs: { type: "button" } }, el("span", { text: label })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.tap);
      fn();
    });
    return b;
  }

  function nextPhaseBtn(): void {
    clear(actions);
    actions.appendChild(mkBtn("다음 의뢰 받기", () => setPhase(phaseIdx + 1)));
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 카드 열기 ── */

  function openCard(i: number): void {
    const cd = cur.cards[i];
    if (busy || finished || cd.state !== "ready" || openSet.has(cd.id)) return;
    openSet.add(cd.id);
    const b = cardBtns[i];
    b.disabled = true;
    b.classList.remove("pulse");
    b.classList.add("on");
    haptic(HAPTIC.select);
    paintGiven(cd.id, cd.value);
    const killed = cd.kills.filter((k) => alive.has(k));
    for (const k of killed) killCand(k);
    if (killed.length) later(updateCount, 420);
    afterOpen(cd.id, killed.length);
  }

  function afterOpen(id: CardId, nKilled: number): void {
    const cd = cur.cards.find((c) => c.id === id)!;
    if (phaseIdx === 0) {
      if (openSet.has("angB") && openSet.has("angC")) {
        busy = true;
        toast("두 각이 모두 맞는 모양은 단 하나!");
        later(() => lockCand(0), 650);
        later(startDolls, 1750);
      } else {
        toast(`${cd.label}가 ${cd.value}가 아닌 모양들이 탈락! 후보 ${alive.size}개 남았어요.`);
        helper.innerHTML = "좋아요, 후보가 줄었어요. <b>남은 각 카드</b>도 열어 봐요!";
      }
      return;
    }
    if (phaseIdx === 1) {
      if (id === "ab" || id === "bc") {
        if (openSet.has("ab") && openSet.has("bc")) {
          toast("길이 2개를 다 맞췄는데 두 모양이 남았어요. 남은 열쇠는 그 사이의 각!");
          helper.innerHTML = "변 비 2개로는 아직 두 모양이에요. <b>두 변 사이에 낀 ∠B 카드</b>가 열렸어요!";
          unlockCard("angB");
        } else {
          toast(`${cd.label.slice(0, 2)} 길이가 2배가 아닌 후보 탈락! ${alive.size}개 남았어요.`);
        }
      } else if (id === "angB") {
        busy = true;
        toast("변 비 둘에 그 사이 끼인각까지 맞으니 모양이 하나로 잠겼어요!");
        later(() => {
          lockCand(0);
          chips.on("sas", "확정!");
          helper.innerHTML = "변 비 2개 + <b>끼인각</b> 조합도 모양을 잠가요. 다음 의뢰로!";
          nextPhaseBtn();
        }, 700);
      }
      return;
    }
    // 국면 ③
    if (id === "ab" || id === "bc") {
      if (openSet.has("ab") && openSet.has("bc")) {
        toast("이번에도 두 모양이 남았어요. 남은 카드는 각 하나!");
        helper.innerHTML = "온 각은 <b>∠C</b>, 그런데 ∠C는 AB와 BC <b>사이에 낀 각이 아니에요</b>. 과연 잠길까요?";
        unlockCard("angC");
      } else {
        toast(`${cd.label.slice(0, 2)} 길이가 2배가 아닌 후보 탈락! ${alive.size}개 남았어요.`);
      }
    } else if (id === "angC") {
      busy = true;
      haptic(HAPTIC.wrong);
      for (const k of alive) candEls[k].classList.add("shake");
      toast("둘 다 ∠C가 38°로 딱 맞아요! 정보 3개를 다 썼는데 확정 실패…");
      counter.innerHTML = `남은 후보 모양 <b>2</b>개, 확정 실패`;
      later(() => {
        for (const k of alive) candEls[k].classList.remove("shake");
      }, 1100);
      later(askTrap, 1500);
    } else if (id === "ca" && nKilled > 0) {
      busy = true;
      later(() => {
        lockCand(0);
        toast("CA까지 세 변의 비가 전부 1:2! 이번엔 모양이 하나로 잠겼어요.");
        chips.on("trap", "간파!");
        later(finish, 1400);
      }, 650);
    }
  }

  /* ── 국면 ① 피날레: 러시아 인형 ── */

  function startDolls(): void {
    killCand(0);
    gBadge.innerHTML = "";
    const org: Pt = { x: 176, y: 206 };
    const sizes = [150, 108, 72];
    const tints = ["rgba(194,37,92,.14)", "rgba(194,37,92,.24)", "rgba(194,37,92,.34)"];
    later(() => {
      sizes.forEach((L, i) => {
        later(() => {
          const [A, B, C] = triBase(org, L, 40, 65);
          const g = document.createElementNS(NS, "g");
          g.setAttribute("class", "slk-doll");
          g.style.transformOrigin = `${org.x}px ${org.y}px`;
          g.innerHTML =
            `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x.toFixed(1)} ${B.y.toFixed(1)} L${C.x.toFixed(1)} ${C.y.toFixed(1)} Z" ` +
            `fill="${tints[i]}" stroke="${SIM}" stroke-width="1.8" stroke-linejoin="round"/>`;
          gCands.appendChild(g);
          g.getBoundingClientRect();
          g.classList.add("show");
          haptic(HAPTIC.tap);
        }, i * 380);
      });
    }, 500);
    later(() => {
      gBadge.innerHTML =
        `<g class="slk-pill" style="transform-origin:245px 91px">` +
        `<rect x="150" y="78" width="184" height="26" rx="13" fill="#FFFFFF" stroke="${SIM}" stroke-width="1.8"/>` +
        `<text x="242" y="95" text-anchor="middle" font-size="11.5" font-weight="900" fill="${SIM}">크기는 여러 개, 모양은 하나!</text>` +
        `</g>`;
      counter.innerHTML = `모양 <b>1</b>가지 · 크기 <b>무한</b>`;
      toast("각 2개만 맞으면 크기가 달라도 전부 서로 닮음! 모양이 잠겨요.");
      chips.on("aa", "모양 확정!");
      helper.innerHTML = "각 2개가 모양을 잠갔어요. 크기는 자유! 이제 <b>다음 의뢰</b>를 받아 봐요.";
      haptic(HAPTIC.done);
      nextPhaseBtn();
    }, 500 + 380 * 3 + 500);
  }

  /* ── 국면 ③ 판정 질문 ── */

  function askTrap(): void {
    qline.innerHTML = "변 비 2개와 각 1개면 모양이 <b>항상</b> 정해질까요?";
    const items = [
      {
        t: "네, 정보 3개면 무조건 확정돼요",
        good: false,
        fb: "방금 정보 3개를 다 맞추고도 두 모양이 살아남았죠. 개수보다 배치! 각은 두 변 사이에 끼어 있어야 모양을 잠가요.",
      },
      {
        t: "아니요, 그 각이 두 변 사이의 끼인각이어야 해요",
        good: true,
        fb: "정확해요! ∠C는 AB와 BC 사이의 각이 아니라서 두 모양을 모두 허용해요. 각은 끼인각 자리에 있어야 잠기죠.",
      },
      {
        t: "변 비가 3개는 되어야만 해요",
        good: false,
        fb: "변 비 3개도 방법이지만 유일한 길은 아니에요. 의뢰 ①은 각 2개, 의뢰 ②는 변 비 2개와 끼인각으로 잠겼죠. 진짜 문제는 이 각이 끼인각이 아니라는 거예요.",
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
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          busy = false;
          helper.innerHTML = "의뢰인에게 물어 <b>CA의 비</b>를 받아냈어요! 마지막 카드를 열어 변 비 3개로 확정해요.";
          unlockCard("ca", "1:2");
        }, 2600);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 전환·마무리 ── */

  function setPhase(i: number): void {
    phaseIdx = i;
    cur = PHASES[i]();
    alive = new Set([0, 1, 2, 3]);
    openSet.clear();
    busy = false;
    gMarks.innerHTML = "";
    gBadge.innerHTML = "";
    clear(actions);
    qline.innerHTML = "";
    clear(ctl);
    paintReq();
    paintCands();
    renderCards();
    updateCount();
    helper.innerHTML = cur.brief;
    if (i === 1) (chips.el.querySelector(`[data-g="sas"] span`) as HTMLElement).textContent = "의뢰 ②";
    if (i === 2) (chips.el.querySelector(`[data-g="trap"] span`) as HTMLElement).textContent = "의뢰 ③";
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML =
      "정보는 개수가 아니라 <b>배치</b>! 각 2개, 변 비 2개와 끼인각, 변 비 3개. 모양을 잠그는 세 조합에 정식 이름을 붙이러 가요.";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "이름 붙이러 가기");
  }

  setPhase(0);
  api.setCTA("의뢰 3건을 해결하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
