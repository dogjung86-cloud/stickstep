// probAddLab, 확률 덧셈 랩(Ⅵ L7, 책 248~249쪽 "확률의 덧셈"의 체험판).
// 8등분 원판(당첨 2, 5, 7)의 칸을 탭하면 그 칸의 1/8 조각이 아래 확률 접시로 미끄러져 쌓인다.
// "확률 덧셈 = 겹치지 않는 조각 모으기"라는 몸 감각이 목표.
// 국면 3개: 1 조각 모으기(1/8+1/8+1/8 = 3/8) →
//   2 겹침 검문("4의 배수의 칸(4, 8) 또는 8의 칸(8)", 그냥 더하면 8이 두 번 담기는 함정) →
//   3 덧셈의 자격(두 사건이 동시에 일어나지 않을 때만) 판정 → 완료.
// meanPullLab 뼈대 계승(칩 → helper → 보드, mq6 판정 문법). rAF 금지: CSS 트랜지션 + setTimeout 체인.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ProbAddStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 318;
const CX = 170; // 원판 중심
const CY = 122;
const R = 92;
const PLX = 30; // 확률 접시(가로 스트립)
const PLY = 266;
const PLH = 34;
const SLOT = 35; // 1/8 조각 하나의 폭(8칸 = 280)

const DEEP = "#8F1D1D"; // 레드 최암색(외곽선)
const BDEEP = "#1D4E8F"; // 블루 최암색
const SOFT = "#5A6B7E";

const WIN1 = [1, 4, 6]; // 국면 1 당첨 칸 인덱스(표기 숫자 2, 5, 7)
const EV_A = [3, 7]; // 국면 2 사건 A: 4의 배수의 칸(4, 8)
const EV_B = 7; // 국면 2 사건 B: 8의 칸

const rad = (d: number): number => (d * Math.PI) / 180;
const ax = (r: number, deg: number): number => CX + r * Math.cos(rad(deg));
const ay = (r: number, deg: number): number => CY + r * Math.sin(rad(deg));

/** 칸 i(0~7, 표기 숫자 i+1)의 부채꼴 경로. 시작각 = i*45-90도(각도 계산 고정). */
function wedge(i: number): string {
  const a0 = i * 45 - 90;
  const a1 = a0 + 45;
  return (
    `M${CX} ${CY} L${ax(R, a0).toFixed(1)} ${ay(R, a0).toFixed(1)} ` +
    `A${R} ${R} 0 0 1 ${ax(R, a1).toFixed(1)} ${ay(R, a1).toFixed(1)} Z`
  );
}

/** 칸 i 안쪽 고리 조각(국면 2에서 사건 B 소속 표시). */
function band(i: number, r1: number, r2: number): string {
  const a0 = i * 45 - 90;
  const a1 = a0 + 45;
  return (
    `M${ax(r2, a0).toFixed(1)} ${ay(r2, a0).toFixed(1)} A${r2} ${r2} 0 0 1 ${ax(r2, a1).toFixed(1)} ${ay(r2, a1).toFixed(1)} ` +
    `L${ax(r1, a1).toFixed(1)} ${ay(r1, a1).toFixed(1)} A${r1} ${r1} 0 0 0 ${ax(r1, a0).toFixed(1)} ${ay(r1, a0).toFixed(1)} Z`
  );
}

// 3스톱 그라데이션 + 키라이트, Ⅵ 그림 팔레트(#C92A2A 레드 · #4A7BE8 블루 · #E8A93E 골드) 계승
const DEFS =
  `<linearGradient id="adl-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>` +
  `<linearGradient id="adl-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset=".55" stop-color="#4A7BE8"/><stop offset="1" stop-color="#2A57C2"/></linearGradient>` +
  `<linearGradient id="adl-dud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FA"/><stop offset=".55" stop-color="#E8EDF4"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>` +
  `<linearGradient id="adl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>` +
  `<linearGradient id="adl-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF0F6"/></linearGradient>` +
  `<radialGradient id="adl-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`;

interface Piece {
  label: string;
  tone: "red" | "blue";
}

export const probAddLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ProbAddStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "sum", label: "조각 합치기", sub: "당첨 3칸" },
    { id: "check", label: "겹침 검문", sub: "함정 찾기" },
    { id: "rule", label: "덧셈의 자격", sub: "안심 조건" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "adl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<defs>${DEFS}</defs>` +
    `<ellipse cx="${CX}" cy="${CY + R + 14}" rx="${(R * 0.92).toFixed(0)}" ry="8" fill="#2A3A5E" opacity=".1"/>` +
    `<ellipse cx="${CX}" cy="${PLY + PLH + 7}" rx="132" ry="5.5" fill="#2A3A5E" opacity=".08"/>` +
    `<g class="adl-wheel"></g>` +
    `<g class="adl-deco" pointer-events="none"></g>` +
    `<g class="adl-dish"></g>` +
    `<g class="adl-pieces"></g>` +
    `<g class="adl-fx"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", {
    class: "mq6-inst",
    html: "당첨 칸을 <b>전부 탭</b>해 확률 접시에 담아 봐요",
  });
  const cards = el("div", { class: "adl-cards" });
  const eqs = el("div", { class: "mq6-eqs" });
  // 판단 질문 전용 줄, 항상 선택지 버튼 바로 위(mq6 문법)
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, cards, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "칸은 모두 8개, 한 칸의 확률은 <b>1/8</b>이에요. 붉은 칸(2, 5, 7)이 당첨!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gWheel = svg.querySelector(".adl-wheel") as SVGGElement;
  const gDeco = svg.querySelector(".adl-deco") as SVGGElement;
  const gDish = svg.querySelector(".adl-dish") as SVGGElement;
  const gPieces = svg.querySelector(".adl-pieces") as SVGGElement;
  const gFx = svg.querySelector(".adl-fx") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  let finished = false;
  let lock = false;
  let addShown = false;
  let bandOn = false; // 국면 2에서 검문 후 사건 B 고리 표시
  let nextSlot = 0;
  const collected = new Set<number>();
  let pieces: (Piece | null)[] = Array.from({ length: 8 }, () => null);
  let merged: { span: number; label: string } | null = null;

  /* ── 그리기 ── */

  function drawWheel(): void {
    let out = "";
    for (let i = 0; i < 8; i++) {
      const n = i + 1;
      const isWin = phase === 1 ? WIN1.includes(i) : EV_A.includes(i);
      const isDone = phase === 1 && collected.has(i);
      const fill = isWin ? (isDone ? "#F6DDD8" : "url(#adl-red)") : "url(#adl-dud)";
      const stroke = isWin ? DEEP : "#8A93A6";
      const numFill = isWin ? (isDone ? "#C99A91" : "#FFFFFF") : SOFT;
      const am = i * 45 - 67.5; // 칸 중앙각
      out +=
        `<g class="adl-cell${isDone ? " done" : ""}" data-i="${i}" role="button" aria-label="칸 ${n}">` +
        `<path d="${wedge(i)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"${isDone ? ` stroke-dasharray="5 4"` : ""}/>` +
        (phase >= 2 && bandOn && i === EV_B
          ? `<path d="${band(i, 38, 64)}" fill="#4A7BE8" opacity=".5" stroke="${BDEEP}" stroke-width="1.2"/>`
          : "") +
        `<text x="${ax(70, am).toFixed(1)}" y="${(ay(70, am) + 5).toFixed(1)}" text-anchor="middle" font-size="14.5" font-weight="900" fill="${numFill}">${n}</text>` +
        `</g>`;
    }
    gWheel.innerHTML = out;
  }

  function drawDeco(): void {
    gDeco.innerHTML =
      `<circle cx="${CX}" cy="${CY}" r="10" fill="url(#adl-gold)" stroke="#8C6A1E" stroke-width="1.4"/>` +
      `<path d="M${CX} ${CY - R - 6} l-8 -13 h16 z" fill="#3A2A2A" stroke="#1E1414" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<ellipse cx="${CX - 34}" cy="${CY - 44}" rx="52" ry="34" fill="url(#adl-glow)" opacity=".4"/>`;
  }

  function drawDish(): void {
    let seps = "";
    for (let k = 1; k < 8; k++) {
      seps += `<line x1="${PLX + k * SLOT}" y1="${PLY + 4}" x2="${PLX + k * SLOT}" y2="${PLY + PLH - 4}" stroke="#C9D2DE" stroke-width="1" stroke-dasharray="3 3"/>`;
    }
    gDish.innerHTML =
      `<rect x="${PLX}" y="${PLY}" width="${SLOT * 8}" height="${PLH}" rx="9" fill="url(#adl-plate)" stroke="#8A93A6" stroke-width="1.4"/>` +
      seps +
      `<text x="${PLX}" y="${PLY - 8}" font-size="10.5" font-weight="800" fill="${SOFT}">확률 접시</text>` +
      `<text x="${PLX + SLOT * 8}" y="${PLY - 8}" text-anchor="end" font-size="10" font-weight="700" fill="${SOFT}">접시 가득 = 1</text>`;
  }

  function pieceSvg(slot: number, p: Piece, pop: boolean): string {
    const x = PLX + slot * SLOT + 1.5;
    return (
      `<g${pop ? ` class="adl-pop"` : ""}>` +
      `<rect x="${x}" y="${PLY + 2}" width="${SLOT - 3}" height="${PLH - 4}" rx="6" fill="url(#adl-${p.tone})" stroke="${p.tone === "red" ? DEEP : BDEEP}" stroke-width="1.3"/>` +
      `<text x="${(x + (SLOT - 3) / 2).toFixed(1)}" y="${PLY + PLH / 2 + 4.5}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">${p.label}</text>` +
      `</g>`
    );
  }

  function renderPieces(popSlot = -1): void {
    if (merged) {
      const w = SLOT * merged.span - 3;
      gPieces.innerHTML =
        `<g class="adl-pop">` +
        `<rect x="${PLX + 1.5}" y="${PLY + 2}" width="${w}" height="${PLH - 4}" rx="7" fill="url(#adl-red)" stroke="${DEEP}" stroke-width="1.4"/>` +
        `<text x="${(PLX + 1.5 + w / 2).toFixed(1)}" y="${PLY + PLH / 2 + 5}" text-anchor="middle" font-size="13.5" font-weight="900" fill="#FFFFFF">${merged.label}</text>` +
        `</g>`;
      return;
    }
    gPieces.innerHTML = pieces.map((p, k) => (p ? pieceSvg(k, p, k === popSlot) : "")).join("");
  }

  /** 칸 fromI의 1/8 조각이 접시 slot 자리로 미끄러져 내려온다(CSS transform 트랜지션). */
  function flyTo(fromI: number, slot: number, label: string, tone: "red" | "blue", after?: () => void): void {
    const am = fromI * 45 - 67.5;
    const sx = ax(56, am);
    const sy = ay(56, am);
    const tx = PLX + slot * SLOT + SLOT / 2;
    const ty = PLY + PLH / 2;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "adl-fly");
    g.innerHTML =
      `<rect x="-16" y="-12.5" width="32" height="25" rx="6" fill="url(#adl-${tone})" stroke="${tone === "red" ? DEEP : BDEEP}" stroke-width="1.3"/>` +
      `<text y="4.5" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">${label}</text>`;
    g.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
    gFx.appendChild(g);
    void g.getBBox(); // 스타일 확정(트랜지션 시작점 고정)
    later(() => {
      g.style.transform = `translate(${tx}px, ${ty}px)`;
    }, 40);
    later(() => {
      g.remove();
      pieces[slot] = { label, tone };
      renderPieces(slot);
      haptic(HAPTIC.tap);
      if (after) after();
    }, 660);
  }

  function shake(i: number): void {
    const g = gWheel.querySelector(`[data-i="${i}"]`);
    if (!g) return;
    g.classList.add("adl-shake");
    later(() => g.classList.remove("adl-shake"), 540);
  }

  function blink(i: number): void {
    const g = gWheel.querySelector(`[data-i="${i}"]`);
    if (!g) return;
    g.classList.add("adl-blink");
    later(() => g.classList.remove("adl-blink"), 1100);
  }

  /* ── 국면 1: 조각 모으기 ── */

  function onCellTap(i: number): void {
    if (finished || phase !== 1 || lock) return;
    if (!WIN1.includes(i)) {
      shake(i);
      haptic(HAPTIC.cross);
      toast("꽝 칸은 당첨 사건의 경우가 아니에요");
      return;
    }
    if (collected.has(i)) {
      toast("그 칸은 이미 접시에 담았어요");
      return;
    }
    collected.add(i);
    drawWheel();
    haptic(HAPTIC.correct);
    const slot = nextSlot;
    nextSlot += 1;
    flyTo(i, slot, "1/8", "red", () => {
      if (collected.size === 3 && !addShown) {
        addShown = true;
        showAddBtn();
      }
    });
  }

  function showAddBtn(): void {
    if (phase !== 1 || finished) return;
    inst.innerHTML = "당첨 3칸이 모두 접시에! 이제 조각을 하나로 합쳐요";
    const b = el("button", { class: "mq6-btn mq6-pulse", text: "더하기", attrs: { type: "button", "aria-label": "확률 더하기" } });
    b.addEventListener("click", onAdd);
    clear(ctl);
    ctl.appendChild(b);
    later(() => ctl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function onAdd(): void {
    if (phase !== 1 || finished || lock) return;
    lock = true;
    clear(ctl);
    merged = { span: 3, label: "3/8" };
    renderPieces();
    haptic(HAPTIC.correct);
    eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: mfmt("{1/8}+{1/8}+{1/8} = {3/8}") }));
    toast("1/8 조각 셋이 모여 3/8, 당첨 확률이에요!");
    chips.on("sum", "3/8");
    later(startPhase2, 1900);
  }

  /* ── 국면 2: 겹침 검문 ── */

  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    collected.clear();
    nextSlot = 0;
    pieces = Array.from({ length: 8 }, () => null);
    merged = null;
    renderPieces();
    drawWheel();
    clear(eqs);
    inst.innerHTML = "문제 교체! 이번엔 <b>'4의 배수의 칸(4, 8)' 또는 '8의 칸(8)'</b>!";
    helper.innerHTML =
      "사건이 두 개가 됐어요. 무작정 더하기 전에, 두 사건이 <b>같은 칸을 함께 갖고 있진 않은지</b> 봐 두면 좋아요";
    cards.append(cardA, cardB);
    const b1 = el("button", {
      class: "mq6-choice wide",
      html: `그냥 더하기: ${mfmt("{2/8}+{1/8}")}`,
      attrs: { type: "button", "aria-label": "그냥 더하기" },
    });
    const b2 = el("button", { class: "mq6-choice wide", text: "잠깐, 검문부터", attrs: { type: "button", "aria-label": "검문하기" } });
    b1.addEventListener("click", onNaive);
    b2.addEventListener("click", onCheck);
    clear(ctl);
    ctl.append(b1, b2);
    later(() => ctl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function onNaive(): void {
    if (phase !== 2 || finished || lock) return;
    lock = true;
    clear(ctl);
    haptic(HAPTIC.tap);
    eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: mfmt("{2/8}+{1/8} = {3/8}") + "<b>...일까요?</b>" }));
    flyTo(3, 0, "4", "red");
    later(() => flyTo(7, 1, "8", "red"), 430);
    later(() => flyTo(7, 2, "8", "blue"), 860);
    later(() => {
      blink(EV_B);
      haptic(HAPTIC.cross);
      toast("8이 두 번 담겼어요! 3/8이 아니라...");
    }, 1650);
    later(joinCheck, 2950);
  }

  function joinCheck(): void {
    if (phase !== 2 || finished) return;
    bandOn = true;
    drawWheel();
    blink(EV_B);
    cardA.classList.add("on");
    cardB.classList.add("on");
    toast("칸 8은 두 사건 모두의 칸, 두 사건이 동시에 일어날 수 있어요");
    later(askTruth, 1400);
  }

  function onCheck(): void {
    if (phase !== 2 || finished || lock) return;
    lock = true;
    clear(ctl);
    haptic(HAPTIC.correct);
    bandOn = true;
    drawWheel();
    blink(EV_B);
    cardA.classList.add("on");
    cardB.classList.add("on");
    toast("훌륭한 습관! 칸 8이 두 사건 모두에 속해 있어요");
    later(askTruth, 1400);
  }

  function askTruth(): void {
    if (phase !== 2 || finished) return;
    inst.innerHTML = "겹침을 찾았으니 이제 진짜 확률을 구해요";
    qline.innerHTML = "칸 8이 <b>양쪽 사건에 다</b> 속해 있어요. 그럼 진짜 확률은?";
    const row = el("div", { class: "mq6-choices" });
    (
      [
        [true, mfmt("{2/8} = {1/4}"), "2/8", ""],
        [false, mfmt("{3/8}"), "3/8", "8을 두 번 센 값이에요. 같은 칸을 두 번 담을 수는 없죠!"],
        [false, mfmt("{1/8}"), "1/8", "8 하나만 세면 4가 억울해요. 조건에 맞는 칸은 4와 8, 모두 2칸!"],
      ] as [boolean, string, string, string][]
    ).forEach(([good, label, aria, msg]) => {
      const b = el("button", { class: "mq6-choice", html: label, attrs: { type: "button", "aria-label": aria } });
      b.addEventListener("click", () => {
        if (finished || phase !== 2) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => {
            x.disabled = true;
          });
          b.classList.add("ok");
          qline.innerHTML = "";
          merged = { span: 2, label: "2/8" };
          renderPieces();
          eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: mfmt("{1/8}+{1/8} = {2/8} = {1/4}") }));
          toast("겹친 8은 한 번만! 4와 8, 2칸이라 2/8이에요");
          chips.on("check", "동시 확인");
          later(startPhase3, 2000);
        } else {
          haptic(HAPTIC.cross);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 900);
          toast(msg);
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 3: 덧셈의 자격 ── */

  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    lock = false;
    inst.innerHTML = "마지막 정리! 오늘 실험의 규칙을 한 줄로 완성해요";
    helper.innerHTML = "원판 두 판을 떠올려요. 첫 판은 바로 더했고, 둘째 판은 검문이 필요했죠. 차이가 뭐였을까요?";
    qline.innerHTML = "확률을 <b>안심하고 더할 수 있는 때</b>는 언제일까요?";
    const row = el("div", { class: "mq6-choices" });
    (
      [
        [true, "두 사건이 동시에 일어나지 않을 때", "겹치지 않을 때", ""],
        [false, "두 확률의 분모가 같을 때", "분모가 같을 때", "분모는 통분하면 그만이에요, 진짜 자격은 겹치지 않는 것!"],
        [false, "두 사건이 모두 당첨일 때", "모두 당첨일 때", "당첨이냐 아니냐는 상관없어요. 두 사건이 같은 칸을 함께 갖는지가 핵심이에요"],
      ] as [boolean, string, string, string][]
    ).forEach(([good, label, aria, msg]) => {
      const b = el("button", { class: "mq6-choice wide", text: label, attrs: { type: "button", "aria-label": aria } });
      b.addEventListener("click", () => {
        if (finished || phase !== 3) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => {
            x.disabled = true;
          });
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "두 사건이 <b>동시에 일어나지 않을 때</b>만 확률을 그대로 더해요. 더하기 전에 겹침 검문, 오늘의 규칙이에요!",
            }),
          );
          chips.on("rule", "겹침 없음");
          later(finish, 1500);
        } else {
          haptic(HAPTIC.cross);
          b.classList.add("no");
          later(() => b.classList.remove("no"), 900);
          toast(msg);
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "조각이 안 겹치면 <b>더하기</b>, 겹치면 <b>검문 먼저</b>. 다음 화면에서 규칙의 정식 이름을 만나요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 사건 카드(국면 2) ── */
  const cardA = el("div", {
    class: "adl-card red",
    html: `<b><i class="adl-dot"></i>4의 배수의 칸</b><span>4, 8 (2칸)</span>`,
  });
  const cardB = el("div", {
    class: "adl-card blue",
    html: `<b><i class="adl-dot"></i>8의 칸</b><span>8 (1칸)</span>`,
  });

  /* ── 탭 위임(칸은 국면 1에서만 판정) ── */
  svg.addEventListener("click", (e) => {
    const t = e.target as Element | null;
    const g = t && t.closest ? (t.closest("[data-i]") as SVGGElement | null) : null;
    if (!g || g.dataset.i == null) return;
    onCellTap(Number(g.dataset.i));
  });

  drawWheel();
  drawDeco();
  drawDish();
  renderPieces();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
