// paraCondLab, 조건 감별소(중2 수학 Ⅳ L7, 평행사변형이 되는 조건, 책 167~171쪽).
// 조건 카드 한 장으로 사각형을 무작위 생성해 "이 조건만으로 평행사변형이 보장되는가"를 검증한다.
// 국면 1(len): 두 쌍의 대변 길이가 각각 같다(젓가락 훅 회수). 3회 생성 내내 평행 램프 초록, 합격 도장.
// 국면 2(bisect): 두 대각선이 서로를 이등분한다(교점 O + 반쪽 틱). 3회 생성, 합격 도장.
// 국면 3(trap): 한 쌍의 대변이 평행 + "다른" 한 쌍의 대변 길이가 같다. 1회차는 평행사변형("어, 되네?"),
//   2회차에 좌우 대칭 사다리꼴 반례 등장(AB∥DC 램프 빨강), 불합격 도장 + 판정 질문(mq6).
// 평행 판정은 기울기 비교(오차 0.01, 둘 다 세로선이면 평행). 생성 연출은 setTimeout 체인 트윈
// (꼭짓점 보간 12스텝×28ms). rAF 금지, 타이머는 Set으로 모아 cleanup에서 일괄 해제.
// 국면 전환 시 표식(틱·대각선·화살표)만 갈아 끼워 "같은 도형을 새 조건으로 재검사"하는 연출을 쓴다
// (직전 도형은 평행사변형이라 어떤 조건이든 정직하게 만족한다).
// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, rad, angleOf, dot, ptLabel, tickMark, arrowHead, lineSvg, gsym } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Pt = { x: number; y: number };
type Quad = [Pt, Pt, Pt, Pt]; // [A, B, C, D] — A 왼위 · B 왼아래 · C 오른아래 · D 오른위
type Mode = "len" | "bisect" | "trap";

/* 무대 기하(SVG 좌표) */
const W = 360;
const H = 260;
const OX = 185; // 국면 2 대각선 교점(고정)
const OY = 148;
const NEED: Record<Mode, number> = { len: 3, bisect: 3, trap: 2 };
/** 반례: 좌우 대칭 사다리꼴 — AD∥BC(평행)와 AB=DC(길이 √(54²+96²))를 지키면서 AB∦DC. */
const TRAP: Quad = [
  { x: 116, y: 119 },
  { x: 62, y: 215 },
  { x: 298, y: 215 },
  { x: 244, y: 119 },
];

const CHECK_SVG =
  `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.6 8.7 6.4 12.4 13.4 4.1" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const X_SVG =
  `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.4 3.4 12.6 12.6 M12.6 3.4 3.4 12.6" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;

/** 밑변 B(60,215) + 수평 벡터 u + 옆변 벡터 v(수학 각 aDeg)로 평행사변형을 만든다. */
function paraQuad(aDeg: number, u: number, vl: number): Quad {
  const B: Pt = { x: 60, y: 215 };
  const A: Pt = { x: B.x + vl * Math.cos(rad(aDeg)), y: B.y - vl * Math.sin(rad(aDeg)) };
  return [A, B, { x: B.x + u, y: B.y }, { x: A.x + u, y: A.y }];
}

/** 두 선분 pq·rs의 평행 판정 — 기울기 비교(오차 0.01), 둘 다 세로선이면 평행. */
function isPar(p: Pt, q: Pt, r: Pt, t: Pt): boolean {
  const dx1 = q.x - p.x;
  const dy1 = q.y - p.y;
  const dx2 = t.x - r.x;
  const dy2 = t.y - r.y;
  const v1 = Math.abs(dx1) < 1e-6;
  const v2 = Math.abs(dx2) < 1e-6;
  if (v1 || v2) return v1 && v2;
  return Math.abs(dy1 / dx1 - dy2 / dx2) < 0.01;
}

const mid = (p: Pt, q: Pt): Pt => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
const f = (v: number): string => v.toFixed(1);

/* 조건 카드 문안 */
const CARD: Record<Mode, { no: string; body: string }> = {
  len: {
    no: "①",
    body: "두 쌍의 대변의 길이가 <b>각각 같다</b><small>긴 변 한 쌍 + 짧은 변 한 쌍, 젓가락 세팅 그대로!</small>",
  },
  bisect: {
    no: "②",
    body: "두 대각선이 <b>서로를 이등분</b>한다<small>교점 O가 두 대각선 모두의 중점!</small>",
  },
  trap: {
    no: "③",
    body:
      `한 쌍의 대변이 <b>평행</b>하고, <b>다른</b> 한 쌍의 대변의 길이가 같다` +
      `<small>${gsym("AD", "seg")}∥${gsym("BC", "seg")} 그리고 ${gsym("AB", "seg")}=${gsym("DC", "seg")}</small>`,
  },
};

export const paraCondLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "len", label: "대변 길이 조건", sub: "3연속 검사" },
    { id: "bisect", label: "대각선 조건", sub: "잠김" },
    { id: "trap", label: "함정 간파", sub: "잠김" },
  ]);

  const board = mboard(460);
  const stage = el("div", { class: "mcl-plane pcd-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="pcd-quad"></g><g class="pcd-marks"></g><g class="pcd-labels"></g></svg>`;
  const lampWrap = el("div", { class: "pcd-lamps", attrs: { "aria-hidden": "true" } });
  const lamp1 = el("div", { class: "pcd-lamp", html: `<span class="pcd-bulb"></span>${gsym("AB", "seg")}∥${gsym("DC", "seg")}?` });
  const lamp2 = el("div", { class: "pcd-lamp", html: `<span class="pcd-bulb"></span>${gsym("AD", "seg")}∥${gsym("BC", "seg")}?` });
  lampWrap.append(lamp1, lamp2);
  const stamp = el("div", { class: "pcd-stamp", attrs: { "aria-hidden": "true" } });
  stage.append(lampWrap, stamp);

  const card = el("div", { class: "pcd-card" });
  const actions = el("div", { class: "lk-actions" });
  const genBtn = el("button", { class: "ct-btn pcd-hero", attrs: { type: "button" } }, el("span", { text: "다른 모양 생성" }));
  const dotsEl = el("div", { class: "pcd-dots", attrs: { "aria-hidden": "true" } });
  actions.append(genBtn, dotsEl);
  const qline = el("div", { class: "mq6-q m2u4q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(stage, card, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "젓가락 사각형의 조건이에요. <b>다른 모양 생성</b>을 3번 눌러, 매번 평행 램프를 확인해 보세요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gQuad = svg.querySelector(".pcd-quad") as SVGGElement;
  const gMarks = svg.querySelector(".pcd-marks") as SVGGElement;
  const gLabels = svg.querySelector(".pcd-labels") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let mode: Mode = "len";
  let gen = 0; // 현재 국면에서 완료한 생성 횟수
  let busy = false; // 트윈 진행 중
  let asking = false; // 판정 질문 중
  let lean = true; // 평행사변형 기울기 좌/우 교대(연속 생성이 늘 다르게 보이게)
  let prevA1 = 0; // 직전 대각선 각(비슷한 모양 반복 방지)
  let quad: Quad = paraQuad(72, 185, 100);

  function genPara(): Quad {
    lean = !lean;
    const a = lean ? 56 + Math.random() * 26 : 98 + Math.random() * 12; // 56~82° | 98~110°(세로 근처 회피)
    return paraQuad(a, 170 + Math.random() * 30, 90 + Math.random() * 20);
  }

  function genDiag(): Quad {
    let a1 = 122;
    for (let i = 0; i < 8; i++) {
      a1 = 122 + Math.random() * 26; // AC 방향(A가 왼위)
      if (Math.abs(a1 - prevA1) >= 8) break;
    }
    prevA1 = a1;
    const r1 = 88 + Math.random() * 16;
    const a2 = 30 + Math.random() * 28; // BD 방향(D가 오른위)
    const r2 = 76 + Math.random() * 20;
    const A = polar(OX, OY, r1, a1);
    const C = polar(OX, OY, r1, a1 + 180);
    const D = polar(OX, OY, r2, a2);
    const B = polar(OX, OY, r2, a2 + 180);
    return [A, B, C, D];
  }

  /** 사각형 + 조건 표식 + 꼭짓점 라벨을 다시 그린다. */
  function paint(q: Quad): void {
    const [A, B, C, D] = q;
    gQuad.innerHTML =
      `<path d="M${f(A.x)} ${f(A.y)} L${f(B.x)} ${f(B.y)} L${f(C.x)} ${f(C.y)} L${f(D.x)} ${f(D.y)} Z" ` +
      `fill="rgba(25,113,194,.08)" stroke="${GEO.ink}" stroke-width="3" stroke-linejoin="round"/>`;
    let m = "";
    if (mode === "len") {
      // 긴 한 쌍(틱 1) + 짧은 한 쌍(틱 2) — 조건 ①에서 "주어진" 정보
      m += tickMark(A.x, A.y, D.x, D.y, 1, GEO.hlA) + tickMark(B.x, B.y, C.x, C.y, 1, GEO.hlA);
      m += tickMark(A.x, A.y, B.x, B.y, 2, GEO.hlB) + tickMark(D.x, D.y, C.x, C.y, 2, GEO.hlB);
    } else if (mode === "bisect") {
      const O = mid(A, C); // 생성 규칙상 BD의 중점과 일치
      m += lineSvg(A.x, A.y, C.x, C.y, GEO.soft, 2) + lineSvg(B.x, B.y, D.x, D.y, GEO.soft, 2);
      m += tickMark(A.x, A.y, O.x, O.y, 1, GEO.hlA) + tickMark(O.x, O.y, C.x, C.y, 1, GEO.hlA);
      m += tickMark(B.x, B.y, O.x, O.y, 2, GEO.hlB) + tickMark(O.x, O.y, D.x, D.y, 2, GEO.hlB);
      m += dot(O.x, O.y, GEO.ink, 3.6) + ptLabel(O.x, O.y, "O", 14, -7);
    } else {
      // 평행이 주어진 쌍(AD·BC)엔 방향 화살촉, 길이가 주어진 쌍(AB·DC)엔 틱 2
      const mAD = mid(A, D);
      const mBC = mid(B, C);
      m += arrowHead(mAD.x, mAD.y, angleOf(A.x, A.y, D.x, D.y), GEO.hlA, 8);
      m += arrowHead(mBC.x, mBC.y, angleOf(B.x, B.y, C.x, C.y), GEO.hlA, 8);
      m += tickMark(A.x, A.y, B.x, B.y, 2, GEO.hlB) + tickMark(D.x, D.y, C.x, C.y, 2, GEO.hlB);
    }
    gMarks.innerHTML = m;
    gLabels.innerHTML =
      [A, B, C, D].map((p) => dot(p.x, p.y, GEO.ink, 3.4)).join("") +
      ptLabel(A.x, A.y, "A", -11, -8) +
      ptLabel(B.x, B.y, "B", -11, 17) +
      ptLabel(C.x, C.y, "C", 11, 17) +
      ptLabel(D.x, D.y, "D", 11, -8);
  }

  function setLamp(lamp: HTMLElement, ok: boolean, pop: boolean): void {
    lamp.classList.remove("wait", "on", "no", "pop");
    lamp.classList.add(ok ? "on" : "no");
    if (pop) {
      void lamp.offsetWidth;
      lamp.classList.add("pop");
    }
  }

  function lampsWait(): void {
    for (const L of [lamp1, lamp2]) {
      L.classList.remove("on", "no", "pop");
      L.classList.add("wait");
    }
  }

  function setCard(m: Mode): void {
    card.innerHTML = `<div class="pcd-badge">조건<b>${CARD[m].no}</b></div><p>${CARD[m].body}</p>`;
  }

  function setDots(): void {
    clear(dotsEl);
    for (let i = 0; i < NEED[mode]; i++) dotsEl.appendChild(el("span", { class: `pcd-dot${i < gen ? " on" : ""}` }));
  }

  function showStamp(ok: boolean): void {
    stamp.classList.remove("show", "no");
    stamp.innerHTML = (ok ? CHECK_SVG : X_SVG) + (ok ? "합격" : "불합격");
    if (!ok) stamp.classList.add("no");
    void stamp.offsetWidth;
    stamp.classList.add("show");
  }

  /** 꼭짓점 보간 트윈(12스텝×28ms, easeOutCubic) — rAF 없이 setTimeout 체인만. */
  function tweenTo(target: Quad, after: () => void): void {
    const from = quad.map((p) => ({ x: p.x, y: p.y })) as Quad;
    const STEPS = 12;
    for (let k = 1; k <= STEPS; k++) {
      later(() => {
        const t = k / STEPS;
        const e = 1 - Math.pow(1 - t, 3);
        quad = from.map((p, i) => ({
          x: p.x + (target[i].x - p.x) * e,
          y: p.y + (target[i].y - p.y) * e,
        })) as Quad;
        paint(quad);
        if (k === STEPS) {
          quad = target;
          paint(quad);
          after();
        }
      }, k * 28);
    }
  }

  function settle(): void {
    gMarks.removeAttribute("opacity");
    const [A, B, C, D] = quad;
    const p1 = isPar(A, B, D, C);
    const p2 = isPar(A, D, B, C);
    setLamp(lamp1, p1, true);
    setLamp(lamp2, p2, true);
    haptic(p1 && p2 ? HAPTIC.tap : HAPTIC.wrong);
    gen += 1;
    setDots();
    if (mode === "len") {
      if (gen === 1) toast("모양이 바뀌어도 램프는 둘 다 초록이에요!");
      else if (gen === 2) toast("또 초록! 대변 길이만 지키면 평행이 따라와요.");
      if (gen >= NEED.len) pass("len");
      else unlock();
    } else if (mode === "bisect") {
      if (gen === 1) toast("대각선 반쪽 네 개만 맞췄는데 초록 불!");
      else if (gen === 2) toast("이번에도 평행. 교점 O가 두 대각선의 중점이면 충분해요.");
      if (gen >= NEED.bisect) pass("bisect");
      else unlock();
    } else if (gen === 1) {
      toast("어, 되네? 평행사변형이 나왔어요. 한 번 더!");
      unlock();
    } else {
      toast("반례 등장! 조건은 다 지켰는데 AB와 DC가 평행이 아니에요. 삐딱한 사다리꼴!");
      later(() => showStamp(false), 420);
      later(askTrap, 1400);
    }
  }

  function unlock(): void {
    busy = false;
    genBtn.disabled = false;
  }

  function pass(id: "len" | "bisect"): void {
    later(() => {
      showStamp(true);
      haptic(HAPTIC.correct);
      chips.on(id, "합격!");
      toast(id === "len" ? "3연속 평행 유지. 조건 ①, 합격 도장!" : "3연속 평행 유지. 조건 ②도 합격 도장!");
    }, 380);
    later(() => {
      helper.innerHTML =
        id === "len"
          ? "젓가락의 고집이 증명됐어요. 두 쌍의 대변 길이만 같으면 <b>언제나</b> 평행사변형! 다음 조건도 검사해 보세요."
          : "대각선만 관리해도 평행이 보장돼요! 그럼 <b>이런</b> 조건은 어떨까요?";
      const nb = el(
        "button",
        { class: "ct-btn pcd-hero", attrs: { type: "button" } },
        el("span", { text: id === "len" ? "조건 ② 검사하기" : "마지막 조건 검사하기" }),
      );
      nb.addEventListener("click", () => {
        if (nb.disabled) return;
        nb.disabled = true;
        nb.remove();
        toPhase(id === "len" ? "bisect" : "trap");
      });
      actions.appendChild(nb);
      later(() => nb.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }, 1150);
  }

  function toPhase(m: Mode): void {
    haptic(HAPTIC.select);
    mode = m;
    gen = 0;
    stamp.classList.remove("show");
    card.classList.add("swap");
    later(() => {
      setCard(m);
      card.classList.remove("swap");
    }, 240);
    setDots();
    paint(quad); // 새 조건의 표식(대각선·평행 화살표)이 지금 도형 위에 바로 나타난다
    helper.innerHTML =
      m === "bisect"
        ? "이번 조건은 변이 아니라 <b>대각선</b>이에요. 교점 O가 두 대각선을 반씩 나누죠. <b>다른 모양 생성</b>을 3번 눌러 램프를 확인해 보세요!"
        : `마지막 조건이에요. 평행은 ${gsym("AD", "seg")}·${gsym("BC", "seg")} 쌍이, 같은 길이는 <b>다른</b> 쌍(${gsym("AB", "seg")}·${gsym("DC", "seg")})이 맡았어요. <b>다른 모양 생성</b>으로 검증해 보세요!`;
    unlock();
    later(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300); // 카드 전환 보정
  }

  function askTrap(): void {
    asking = true;
    helper.innerHTML = "조건을 다 지켰는데 삐딱한 사다리꼴이 나왔어요. 왜 불합격인지, 아래에서 이유를 골라 보세요!";
    qline.innerHTML = "조건 ③이 <b>불합격</b>인 이유는 무엇일까요?";
    const items = [
      {
        t: "생성기가 고장 나서 잘못 만든 거예요",
        good: false,
        fb: "생성기는 조건을 정확히 지켰어요. AD∥BC(평행)도 AB=DC(길이)도 만족하죠. 조건 자체에 구멍이 있는 거예요. 평행과 길이가 같은 쌍에 걸려야 확정!",
      },
      {
        t: "평행한 쌍 따로, 길이가 같은 쌍 따로라서, 어긋난 사다리꼴도 만들 수 있어요",
        good: true,
        fb: "정확해요! 평행 담당과 길이 담당이 서로 다른 쌍이면 삐딱한 사다리꼴이 끼어들 틈이 생겨요. 반례 하나면 그 조건은 탈락!",
      },
      {
        t: "3번 더 생성하면 전부 평행사변형이 나올 거예요",
        good: false,
        fb: "반례가 하나라도 나오면 그 조건은 탈락이에요. '항상'을 보장하지 못하니까요. 증명의 세계에서는 한 개의 반례가 백 개의 성공을 이겨요!",
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
        later(finish, it.good ? 2100 : 2800);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    qline.innerHTML = "";
    clear(ctl);
    chips.on("trap", "간파!");
    haptic(HAPTIC.done);
    helper.innerHTML =
      "합격 조건은 '한 쌍이 평행하고 <b>그</b> 쌍의 길이가 같다'예요. 평행과 길이가 <b>같은 쌍</b>에 걸려야 하죠. 다섯 열쇠의 전체 목록을 정리하러 가요.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
  }

  genBtn.addEventListener("click", () => {
    if (genBtn.disabled || busy || asking) return;
    busy = true;
    genBtn.disabled = true;
    haptic(HAPTIC.select);
    lampsWait();
    gMarks.setAttribute("opacity", "0"); // 이동 중엔 표식을 숨겨 "재검사" 느낌으로
    const target = mode === "len" ? genPara() : mode === "bisect" ? genDiag() : gen === 0 ? genPara() : TRAP;
    tweenTo(target, settle);
  });

  /* 초기 화면: 젓가락 평행사변형 + 램프 첫 판정(연출 없이) */
  setCard("len");
  setDots();
  paint(quad);
  {
    const [A, B, C, D] = quad;
    setLamp(lamp1, isPar(A, B, D, C), false);
    setLamp(lamp2, isPar(A, D, B, C), false);
  }
  api.setCTA("함정 조건까지 간파하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
