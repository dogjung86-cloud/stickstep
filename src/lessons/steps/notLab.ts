// notLab, 나머지 영역 랩(Ⅵ L6: 일어나지 않을 확률). 응모권 10장 중 아무 카드나 3장을 직접 뒤집어
// 당첨 영역(p=3/10)을 만들면, 손대지 않은 나머지 7장이 저절로 "당첨되지 않을" 영역(7/10=1-3/10)이 된다.
// 마지막 국면은 무대를 동전 2개 네 경우 카드로 교체해 "적어도 한 번은 앞면"의 지름길 1-(모두 뒷면)을 판정.
// meanPullLab 뼈대 계승(칩, helper, 보드, mq6 판정 문법), rAF 없이 인라인 CSS 트랜지션+setTimeout 체인.
// 카드 뒤집기는 scaleX 스퀴즈: SVG 그룹 CSS 변형이라 transform-box:view-box + px 원점을 명시한다(Ⅳ 관례).
// 동전 네 경우 카드의 색·구도는 concept의 coinCasesFig(mathFigures2)와 같은 문법이라 정리 그림으로 이어진다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface NotLabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 204;

// 응모권 10장(2행 5열)
const TCW = 56;
const TCH = 74;
const TX0 = 16;
const TGX = 7;
const TYS = [18, 108];
const tx = (i: number): number => TX0 + (i % 5) * (TCW + TGX);
const ty = (i: number): number => TYS[Math.floor(i / 5)];

// 동전 2개 네 경우(2×2)
const KW = 140;
const KH = 84;
const KXS = [22, 178];
const KYS = [14, 110];
const CASES: [string, string][] = [["앞", "앞"], ["앞", "뒤"], ["뒤", "앞"], ["뒤", "뒤"]];

const RED_DEEP = "#8F1D1D";
const BLUE_DEEP = "#1D4E8F";

const DEFS =
  `<linearGradient id="ntl-gray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6FA"/><stop offset=".6" stop-color="#E6EAF2"/><stop offset="1" stop-color="#D9DFEA"/></linearGradient>` +
  `<linearGradient id="ntl-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>` +
  `<linearGradient id="ntl-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset=".55" stop-color="#4A7BE8"/><stop offset="1" stop-color="#2A57C2"/></linearGradient>` +
  `<linearGradient id="ntl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset=".55" stop-color="#F2C95C"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>` +
  `<linearGradient id="ntl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0EBE4"/></linearGradient>`;

/** 5각 별(당첨 얼굴 장식). */
function star(cx: number, cy: number, R: number, r: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const rad = (Math.PI / 5) * k - Math.PI / 2;
    const rr = k % 2 === 0 ? R : r;
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(1)},${(cy + rr * Math.sin(rad)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="#FFFFFF" opacity=".95"/>`;
}

/** 응모권 한 장: 뒷면(회색)·당첨(레드)·꽝(블루) 세 얼굴을 겹쳐 두고 뒤집기 순간에 교체한다. */
function ticketSvg(i: number): string {
  const x = tx(i);
  const y = ty(i);
  const cx = x + TCW / 2;
  const cy = y + TCH / 2;
  const back =
    `<g class="ntl-fb" style="opacity:1">` +
    `<rect x="${x}" y="${y}" width="${TCW}" height="${TCH}" rx="10" fill="url(#ntl-gray)" stroke="#8A93A6" stroke-width="1.4"/>` +
    `<line x1="${x + 13}" y1="${y + 9}" x2="${x + 13}" y2="${y + TCH - 9}" stroke="#B6BFCC" stroke-width="1.4" stroke-dasharray="3 3.4"/>` +
    `<circle cx="${x + 36}" cy="${y + 26}" r="9" fill="none" stroke="#C3CBD8" stroke-width="1.6"/>` +
    `<text x="${x + 36}" y="${y + 30.5}" text-anchor="middle" font-size="12" font-weight="900" fill="#6E7787">${i + 1}</text>` +
    `<text x="${x + 36}" y="${y + 56}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8A93A6">응모권</text>` +
    `</g>`;
  const win =
    `<g class="ntl-fw" style="opacity:0">` +
    `<rect x="${x}" y="${y}" width="${TCW}" height="${TCH}" rx="10" fill="url(#ntl-red)" stroke="${RED_DEEP}" stroke-width="1.5"/>` +
    `<circle cx="${x + 16}" cy="${y + 14}" r="7" fill="#FFFFFF" opacity=".25"/>` +
    star(cx, y + 30, 10, 4.2) +
    `<text x="${cx}" y="${y + 59}" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF">당첨</text>` +
    `</g>`;
  const miss =
    `<g class="ntl-fm" style="opacity:0">` +
    `<rect x="${x}" y="${y}" width="${TCW}" height="${TCH}" rx="10" fill="url(#ntl-blue)" stroke="${BLUE_DEEP}" stroke-width="1.5"/>` +
    `<circle cx="${x + 16}" cy="${y + 14}" r="7" fill="#FFFFFF" opacity=".25"/>` +
    `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="14" font-weight="900" fill="#FFFFFF">꽝</text>` +
    `</g>`;
  return (
    `<g class="ntl-card" data-i="${i}" role="button" tabindex="0" aria-label="응모권 ${i + 1}" aria-pressed="false" style="cursor:pointer">` +
    `<rect x="${x + 2.5}" y="${y + 3.5}" width="${TCW}" height="${TCH}" rx="10" fill="#2A3A5E" opacity=".1"/>` +
    `<g class="ntl-flip" style="transform-box:view-box;transform-origin:${cx}px ${cy}px">${back}${win}${miss}</g>` +
    `</g>`
  );
}

/** 동전 두 개 경우 카드. ntl-lit(레드 하이라이트)는 정답 연출에서 켠다. */
function coinCardSvg(idx: number): string {
  const x = KXS[idx % 2];
  const y = KYS[Math.floor(idx / 2)];
  const coin = (cx: number, t: string): string =>
    `<circle cx="${cx}" cy="${y + 32}" r="17" fill="url(#ntl-${t === "앞" ? "gold" : "gray"})" stroke="${t === "앞" ? "#8C6A1E" : "#8A93A6"}" stroke-width="1.6"/>` +
    `<ellipse cx="${cx - 5}" cy="${y + 25}" rx="5.5" ry="3" fill="#FFFFFF" opacity=".45" transform="rotate(-18 ${cx - 5} ${y + 25})"/>` +
    `<text x="${cx}" y="${y + 37}" text-anchor="middle" font-size="12" font-weight="900" fill="${t === "앞" ? "#5A4A18" : "#6E7787"}">${t}</text>`;
  const [a, b] = CASES[idx];
  return (
    `<g class="ntl-case" data-c="${idx}">` +
    `<rect x="${x + 3}" y="${y + 4}" width="${KW}" height="${KH}" rx="12" fill="#2A3A5E" opacity=".1"/>` +
    `<rect x="${x}" y="${y}" width="${KW}" height="${KH}" rx="12" fill="url(#ntl-paper)" stroke="#B9C2D2" stroke-width="1.5"/>` +
    `<rect class="ntl-lit" x="${x}" y="${y}" width="${KW}" height="${KH}" rx="12" fill="#FBECE6" stroke="#C92A2A" stroke-width="2" style="opacity:0"/>` +
    coin(x + 46, a) +
    coin(x + 94, b) +
    `<text x="${x + KW / 2}" y="${y + 72}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#2A3648">(${a}, ${b})</text>` +
    `</g>`
  );
}

export const notLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as NotLabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "win", label: "당첨 영역", sub: "3장 뒤집기" },
    { id: "rest", label: "나머지 영역", sub: "저절로!" },
    { id: "short", label: "적어도", sub: "지름길" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "ntl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none" style="width:100%;height:auto;display:block" role="group" aria-label="경품 응모권 카드">` +
    `<defs>${DEFS}</defs>` +
    `<g class="ntl-tickets">${Array.from({ length: 10 }, (_, i) => ticketSvg(i)).join("")}</g>` +
    `<g class="ntl-coins" style="opacity:0;pointer-events:none" aria-hidden="true">${CASES.map((_, i) => coinCardSvg(i)).join("")}</g>` +
    `</svg>`;

  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", {
    class: "mq6-inst",
    html: "당첨권은 3장이에요. 아무 카드나 <b>3장</b>을 탭해 당첨으로 뒤집어 봐요",
  });
  const gauge = el("div", { class: "mq6-gauge", html: "당첨 <b>0</b> / 3장" });
  const eqs = el("div", { class: "mq6-eqs" });
  // 판단 질문 전용 줄: 항상 선택지 버튼 바로 위(mq6 공용 문법)
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, gauge, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "응모권 10장이 뒷면으로 놓여 있어요. 어느 3장을 골라도 당첨 확률은 같으니, 마음 가는 카드를 골라 봐요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위(전 단원 공통 배치)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gT = svg.querySelector(".ntl-tickets") as SVGGElement;
  const gC = svg.querySelector(".ntl-coins") as SVGGElement;
  const cardEls = Array.from(gT.querySelectorAll<SVGGElement>(".ntl-card"));
  const caseEls = Array.from(gC.querySelectorAll<SVGGElement>(".ntl-case"));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const flipped = new Set<number>();
  let phase: 1 | 2 | 3 = 1;
  let lock = false;
  let finished = false;

  function actionBtn(label: string, aria: string, fn: () => void): HTMLElement {
    const b = el("button", { class: "mq6-btn mq6-pulse", text: label, attrs: { type: "button", "aria-label": aria } });
    b.addEventListener("click", fn);
    return b;
  }

  /** 새 조작 버튼이 랩 중간에 등장하는 지점은 스크롤 보정(전 단원 공통 규칙). */
  function showBtn(label: string, aria: string, fn: () => void): void {
    clear(ctl);
    ctl.appendChild(actionBtn(label, aria, fn));
    later(() => ctl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 1: 당첨 영역 칠하기(아무 3장) ── */
  function onTicket(i: number): void {
    if (phase !== 1 || finished || flipped.has(i) || flipped.size >= 3) return;
    flipped.add(i);
    const third = flipped.size === 3;
    haptic(HAPTIC.tap);
    const card = cardEls[i];
    card.setAttribute("aria-pressed", "true");
    const flip = card.querySelector(".ntl-flip") as SVGGElement;
    flip.style.transition = "transform .16s ease-in";
    flip.style.transform = "scaleX(.08)";
    later(() => {
      (card.querySelector(".ntl-fb") as SVGGElement).style.opacity = "0";
      (card.querySelector(".ntl-fw") as SVGGElement).style.opacity = "1";
      flip.style.transition = "transform .26s cubic-bezier(.34,1.35,.5,1)";
      flip.style.transform = "scaleX(1)";
      gauge.innerHTML = `당첨 <b>${flipped.size}</b> / 3장`;
      if (third) onThreeWins();
    }, 170);
  }

  function onThreeWins(): void {
    later(() => {
      haptic(HAPTIC.correct);
      toast("당첨 영역 완성!");
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `당첨될 확률 ${mfmt("p={3/10}")}` }));
      chips.on("win", "3/10");
      inst.innerHTML = "그럼 <b>당첨되지 않을</b> 확률은? 남은 카드를 하나하나 세어야 할까요?";
      helper.innerHTML = "당첨 3장을 뺀 나머지가 곧 당첨되지 않는 카드예요. 세지 않아도 알 수 있어요!";
    }, 420);
    later(() => {
      phase = 2;
      showBtn("나머지 보기", "나머지 보기", onRest);
    }, 1350);
  }

  /* ── 국면 2: 나머지가 저절로(7/10 = 1 - 3/10) ── */
  function onRest(): void {
    if (phase !== 2 || lock || finished) return;
    lock = true;
    clear(ctl);
    haptic(HAPTIC.tap);
    for (let i = 0; i < 10; i++) {
      if (flipped.has(i)) continue;
      const card = cardEls[i];
      card.style.cursor = "default";
      const fb = card.querySelector(".ntl-fb") as SVGGElement;
      const fm = card.querySelector(".ntl-fm") as SVGGElement;
      fb.style.transition = "opacity .55s ease";
      fm.style.transition = "opacity .55s ease";
      fb.style.opacity = "0";
      fm.style.opacity = "1";
    }
    later(() => {
      haptic(HAPTIC.correct);
      toast("남은 7장이 한꺼번에 파란 영역이 됐어요!");
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `당첨되지 않을 확률 ${mfmt("={7/10}=1-{3/10}")}` }));
      gauge.innerHTML = "당첨 3장 + 꽝 7장 = 전체 10장";
    }, 750);
    later(() => {
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `${mfmt("{3/10}+{7/10}=1")}, 두 확률의 합은 언제나 <b>1</b>!` }));
      chips.on("rest", "1−p");
      inst.innerHTML = "1에서 빼는 이 지름길, 동전 던지기에서 진가가 나와요";
    }, 1700);
    later(swapToCoins, 2800);
  }

  /* ── 국면 3: '적어도'의 지름길(동전 2개 네 경우) ── */
  function swapToCoins(): void {
    if (finished) return;
    gT.style.transition = "opacity .45s ease";
    gT.style.opacity = "0";
    gT.style.pointerEvents = "none";
    gC.style.transition = "opacity .5s ease .3s";
    gC.style.opacity = "1";
    gC.removeAttribute("aria-hidden");
    inst.innerHTML = "무대 교체! 동전 2개를 던질 때 나오는 <b>네 경우</b>예요";
    helper.innerHTML = "'적어도'가 붙으면 셀 게 많아 보여요. 방금 배운 1에서 빼기를 떠올려 봐요!";
    gauge.innerHTML = "동전 2개: 모든 경우 4가지";
    later(askJudge, 950);
  }

  function askJudge(): void {
    if (finished) return;
    phase = 3;
    lock = false;
    qline.innerHTML = "'적어도 한 번은 앞면'의 확률, 가장 빠른 길은?";
    const row = el("div", { class: "mq6-choices" });
    const picks: [string, "count" | "ok" | "half"][] = [
      ["앞면 경우를 하나씩 다 세기", "count"],
      [`(뒤,뒤) 하나만 빼고 ${mfmt("1-{1/4}")}`, "ok"],
      [`반반이니까 ${mfmt("{1/2}")}`, "half"],
    ];
    picks.forEach(([html, kind]) => {
      const b = el("button", { class: "mq6-choice wide", html, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (phase !== 3 || finished) return;
        if (kind === "ok") {
          celebrate(row, b);
        } else {
          haptic(HAPTIC.cross);
          toast(
            kind === "count"
              ? "세어도 3/4로 같지만, 동전이 3개, 4개로 늘면 셀 게 폭발해요. 반대쪽(모두 뒷면)은 언제나 한 가지!"
              : "반반은 가능성이 같을 때만! 네 경우 중 앞면이 하나도 없는 건 (뒤,뒤) 하나뿐이에요.",
          );
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /** 정답 연출: (뒤,뒤)만 꺼지고 나머지 세 장이 레드로 켜진다. */
  function celebrate(row: HTMLElement, b: HTMLElement): void {
    haptic(HAPTIC.correct);
    row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
    b.classList.add("ok");
    qline.innerHTML = "";
    const dd = caseEls[3];
    dd.style.transition = "opacity .5s ease";
    dd.style.opacity = ".38";
    [0, 1, 2].forEach((i, k) => {
      const lit = caseEls[i].querySelector(".ntl-lit") as SVGRectElement;
      lit.style.transition = `opacity .45s ease ${140 + k * 110}ms`;
      lit.style.opacity = "1";
    });
    later(() => {
      eqs.appendChild(el("div", { class: "mq6-concl mq6-pop", html: `${mfmt("1-{1/4}={3/4}")}, 반대쪽은 딱 한 덩어리!` }));
      chips.on("short", "1−(모두 뒷면)");
      helper.innerHTML = "일어나지 않을 확률은 1에서 빼기! '적어도'가 보이면 반대쪽(모두 뒷면)부터 찾는 게 지름길이에요.";
    }, 750);
    later(finish, 2100);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  cardEls.forEach((c, i) => {
    c.addEventListener("click", () => onTicket(i));
    c.addEventListener("keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        onTicket(i);
      }
    });
  });

  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
