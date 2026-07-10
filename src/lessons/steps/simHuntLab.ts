// simHuntLab, 반례 사냥터(중2 수학 Ⅴ L2, 책 193~196쪽). 도형 패밀리 카드 6장 순차 판정:
// ① 정삼각형 ③ 원 ⑤ 정육면체는 항상 닮음(크기만 랜덤), ② 직사각형 ④ 이등변삼각형 ⑥ 원기둥은
// 반례 패밀리(모양 파라미터도 랜덤). '다르게 생겨!'로 재생성하다가 '항상 같은 모양!'(재생성 3회
// 이상 뒤 판단, 성급한 일반화 방지) 또는 '반례 찾았다!'(두 도형의 모양 차이가 충분할 때)로 선언.
// 오판정은 고른 오개념을 짚는 교정 토스트. '닮음'은 L1에서 도입돼 사용 가능.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .shl- 섹션.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Tone {
  grad: string;
  ink: string;
  top: string;
  left: string;
  right: string;
}

/** 도형 파라미터: s는 크기, q는 모양(반례 패밀리만 의미 있음). */
interface Params {
  s: number;
  q: number;
}

interface Fam {
  name: string;
  guide: string; // 카드 시작 helper
  always: boolean;
  qGap: number; // 반례 선언이 인정되는 모양 파라미터 최소 차이(항상 패밀리는 0)
  okMsg: string;
  wrongMsg: string; // 오판정 교정(항상 패밀리엔 '반례', 반례 패밀리엔 '항상' 선언 시)
  roll(prev?: Params): Params;
  draw(p: Params, cx: number, tone: Tone): string;
}

const Y0 = 196; // 바닥선
const CXL = 92;
const CXR = 248;
const TONE_L: Tone = { grad: "url(#shlGL)", ink: "#12579B", top: "#EAF3FC", left: "#C9DFF4", right: "#A9CBEC" };
const TONE_R: Tone = { grad: "url(#shlGR)", ink: "#C2255C", top: "#FBE9F1", left: "#F6D3E2", right: "#EFB9D0" };

const n1 = (v: number): string => (Math.round(v * 10) / 10).toString();
const rand = (a: number, b: number): number => a + Math.random() * (b - a);
/** 직전 값과 gap 이상 벌어질 때까지 재추첨(최대 8회, 재생성이 눈에 보이게). */
function randApart(a: number, b: number, prev: number | undefined, gap: number): number {
  let v = rand(a, b);
  if (prev == null) return v;
  for (let i = 0; i < 8 && Math.abs(v - prev) < gap; i++) v = rand(a, b);
  return v;
}

const FAMS: Fam[] = [
  {
    name: "두 정삼각형",
    guide: "카드 1: <b>두 정삼각형</b>이에요. <b>다르게 생겨!</b>로 크기를 마구 바꿔 보고, 둘이 늘 같은 모양인지 판단하세요!",
    always: true,
    qGap: 0,
    okMsg: "몇 번을 바꿔도 늘 같은 모양! 정삼각형끼리는 항상 닮음이에요.",
    wrongMsg: "정삼각형은 어떻게 그려도 세 각이 모두 60도예요. 크기만 다를 뿐 모양은 하나뿐이라 반례가 없어요!",
    roll: (prev) => ({ s: randApart(48, 100, prev?.s, 14), q: 0 }),
    draw(p, cx, tone) {
      const h = p.s * 0.866;
      return `<path d="M${n1(cx - p.s / 2)} ${Y0} L${n1(cx + p.s / 2)} ${Y0} L${cx} ${n1(Y0 - h)} Z" fill="${tone.grad}" stroke="${tone.ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
    },
  },
  {
    name: "두 직사각형",
    guide: "카드 2: <b>두 직사각형</b>. 이번에도 늘 같은 모양일까요? 바꾸다가 서로 모양이 다른 순간을 잡으면 <b>반례 찾았다!</b>",
    always: false,
    qGap: 0.6,
    okMsg: "반례 등장! 뚱뚱한 직사각형과 홀쭉한 직사각형은 모양이 달라요. 직사각형은 닮음이 아닐 수도 있어요.",
    wrongMsg: "직사각형이라고 다 같은 모양이 아니에요, 뚱뚱한 것과 홀쭉한 것을 보세요. 가로세로 비율이 다르면 모양이 달라요!",
    roll(prev) {
      const q = randApart(1.1, 3.2, prev?.q, 0.38);
      return { s: rand(36, Math.min(68, 138 / q)), q };
    },
    draw(p, cx, tone) {
      const w = p.s * p.q;
      return `<rect x="${n1(cx - w / 2)}" y="${n1(Y0 - p.s)}" width="${n1(w)}" height="${n1(p.s)}" rx="3" fill="${tone.grad}" stroke="${tone.ink}" stroke-width="2.2"/>`;
    },
  },
  {
    name: "두 원",
    guide: "카드 3: <b>두 원</b>이에요. 크기를 바꿔 보며 반례가 있는지 찾아보세요!",
    always: true,
    qGap: 0,
    okMsg: "원은 크기만 다를 뿐 언제나 같은 모양! 원끼리는 항상 닮음이에요.",
    wrongMsg: "원은 중심에서 어느 방향으로나 똑같이 둥글어요. 아무리 바꿔도 모양은 하나, 반례가 없어요!",
    roll: (prev) => ({ s: randApart(22, 56, prev?.s, 10), q: 0 }),
    draw(p, cx, tone) {
      return `<circle cx="${cx}" cy="${n1(Y0 - p.s)}" r="${n1(p.s)}" fill="${tone.grad}" stroke="${tone.ink}" stroke-width="2.2"/>`;
    },
  },
  {
    name: "두 이등변삼각형",
    guide: "카드 4: <b>두 이등변삼각형</b>. 뾰족한 것과 넓적한 것을 잘 비교해 보세요!",
    always: false,
    qGap: 30,
    okMsg: "반례 등장! 꼭지각이 다르면 뾰족이와 넓적이, 이등변삼각형은 닮음이 아닐 수도 있어요.",
    wrongMsg: "이등변삼각형도 꼭지각이 다르면 모양이 완전히 달라요. 뾰족한 것과 넓적한 것을 만들어 비교해 보세요!",
    roll(prev) {
      const q = randApart(24, 130, prev?.q, 16);
      const half = (q * Math.PI) / 360;
      const legMax = Math.min(96, 68 / Math.sin(half), 100 / Math.cos(half));
      return { s: rand(Math.min(50, legMax - 4), legMax), q };
    },
    draw(p, cx, tone) {
      const half = (p.q * Math.PI) / 360;
      const hw = p.s * Math.sin(half);
      const h = p.s * Math.cos(half);
      return `<path d="M${n1(cx - hw)} ${Y0} L${n1(cx + hw)} ${Y0} L${cx} ${n1(Y0 - h)} Z" fill="${tone.grad}" stroke="${tone.ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
    },
  },
  {
    name: "두 정육면체",
    guide: "카드 5: 입체로 넘어가요. <b>두 정육면체</b>는 어떨까요?",
    always: true,
    qGap: 0,
    okMsg: "정육면체는 모든 모서리가 같아 모양이 하나로 정해져요. 정육면체끼리는 항상 닮음!",
    wrongMsg: "정육면체는 어느 것이든 모든 면이 정사각형이에요. 크기만 다를 뿐 모양은 하나라 반례가 없어요!",
    roll: (prev) => ({ s: randApart(28, 54, prev?.s, 8), q: 0 }),
    draw(p, cx, tone) {
      const a = p.s;
      const dx = a * 0.866;
      const dy = a * 0.5;
      const lf = `M${cx} ${Y0} L${n1(cx - dx)} ${n1(Y0 - dy)} L${n1(cx - dx)} ${n1(Y0 - dy - a)} L${cx} ${n1(Y0 - a)} Z`;
      const rf = `M${cx} ${Y0} L${n1(cx + dx)} ${n1(Y0 - dy)} L${n1(cx + dx)} ${n1(Y0 - dy - a)} L${cx} ${n1(Y0 - a)} Z`;
      const tf = `M${cx} ${n1(Y0 - a)} L${n1(cx - dx)} ${n1(Y0 - dy - a)} L${cx} ${n1(Y0 - 2 * dy - a)} L${n1(cx + dx)} ${n1(Y0 - dy - a)} Z`;
      return (
        `<path d="${lf}" fill="${tone.left}" stroke="${tone.ink}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="${rf}" fill="${tone.right}" stroke="${tone.ink}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="${tf}" fill="${tone.top}" stroke="${tone.ink}" stroke-width="2" stroke-linejoin="round"/>`
      );
    },
  },
  {
    name: "두 원기둥",
    guide: "마지막 카드: <b>두 원기둥</b>. 홀쭉한 캔과 납작한 캔을 떠올리며 판단해 보세요!",
    always: false,
    qGap: 0.55,
    okMsg: "반례 등장! 홀쭉한 캔과 납작한 캔은 모양이 달라요. 원기둥은 닮음이 아닐 수도 있어요.",
    wrongMsg: "원기둥도 지름과 높이의 비율이 다르면 홀쭉이와 납작이, 서로 다른 모양이에요. 반례를 만들어 보세요!",
    roll(prev) {
      const q = randApart(0.4, 2.5, prev?.q, 0.3); // 지름:높이 비
      return { s: rand(42, Math.min(96, 118 / q)), q };
    },
    draw(p, cx, tone) {
      const h = p.s;
      const r = (p.q * h) / 2;
      const ry = Math.max(5, r * 0.32);
      const yT = Y0 - ry - h;
      const yB = Y0 - ry;
      return (
        `<path d="M${n1(cx - r)} ${n1(yT)} L${n1(cx - r)} ${n1(yB)} A${n1(r)} ${n1(ry)} 0 0 0 ${n1(cx + r)} ${n1(yB)} L${n1(cx + r)} ${n1(yT)}" fill="${tone.grad}" stroke="${tone.ink}" stroke-width="2.2"/>` +
        `<ellipse cx="${cx}" cy="${n1(yT)}" rx="${n1(r)}" ry="${n1(ry)}" fill="${tone.top}" stroke="${tone.ink}" stroke-width="2.2"/>`
      );
    },
  },
];

export const simHuntLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "plane", label: "평면 판별 4종", sub: "0/4" },
    { id: "solid", label: "입체 판별 2종", sub: "잠김" },
    { id: "counter", label: "반례의 힘", sub: "반례 0/3" },
  ]);

  const board = mboard(500);
  const prog = el("div", { class: "shl-prog", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 240" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<defs>` +
    `<linearGradient id="shlGL" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#EAF3FC"/><stop offset=".55" stop-color="#D4E7F8"/><stop offset="1" stop-color="#BBD7F2"/>` +
    `</linearGradient>` +
    `<linearGradient id="shlGR" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FBE4EE"/><stop offset=".55" stop-color="#F8D8E6"/><stop offset="1" stop-color="#F2C8DA"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<line x1="14" y1="${Y0}" x2="326" y2="${Y0}" stroke="#E2E9F2" stroke-width="1.6"/>` +
    `<g class="shl-l"></g><g class="shl-r"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const judgeRow = el("div", { class: "lk-actions" });
  board.append(prog, svgWrap, actions, judgeRow);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper", html: FAMS[0].guide });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gL = svgWrap.querySelector(".shl-l") as SVGGElement;
  const gR = svgWrap.querySelector(".shl-r") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let famIdx = 0;
  let pL: Params;
  let pR: Params;
  let regenCount = 0;
  let verdict: "" | "ok" | "no" = "";
  let busy = false;
  let planeDone = 0;
  let solidDone = 0;
  let counterCaught = 0;

  const fam = (): Fam => FAMS[famIdx];

  function rollBoth(): void {
    pL = fam().roll(pL);
    pR = fam().roll(pR);
    // 항상 패밀리는 크기가 비슷하면 밋밋하다: 좌우가 벌어질 때까지 오른쪽만 재추첨
    if (fam().always) {
      for (let i = 0; i < 8 && Math.abs(pR.s - pL.s) < 12; i++) pR = fam().roll(pR);
    }
  }

  function paintShapes(): void {
    gL.innerHTML = `<g class="shl-pop">${fam().draw(pL, CXL, TONE_L)}</g>`;
    gR.innerHTML = `<g class="shl-pop">${fam().draw(pR, CXR, TONE_R)}</g>`;
  }

  function paintProg(): void {
    prog.innerHTML =
      `<span class="shl-n">카드 <b>${famIdx + 1}/6</b></span>` +
      `<span class="shl-name">${fam().name}</span>` +
      (verdict ? `<span class="shl-verdict ${verdict}">${verdict === "ok" ? "항상 닮음" : "반례 발견!"}</span>` : "");
  }

  const setChipSub = (id: string, text: string): void => {
    const sub = chips.el.querySelector(`[data-g="${id}"] span`) as HTMLElement | null;
    if (sub) sub.textContent = text;
  };

  /* ── 조작 버튼 3개 ── */
  const regenBt = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "다르게 생겨!" }));
  const alwaysBt = el("button", { class: "ct-btn shl-dim", attrs: { type: "button" } }, el("span", { text: "항상 같은 모양!" }));
  const counterBt = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "반례 찾았다!" }));
  actions.appendChild(regenBt);
  judgeRow.append(alwaysBt, counterBt);

  regenBt.addEventListener("click", () => {
    if (busy) return;
    regenCount += 1;
    haptic(HAPTIC.tap);
    rollBoth();
    paintShapes();
    alwaysBt.classList.toggle("shl-dim", regenCount < 3);
  });

  const flashNo = (bt: HTMLButtonElement): void => {
    bt.classList.add("shl-no");
    later(() => bt.classList.remove("shl-no"), 900);
  };

  alwaysBt.addEventListener("click", () => {
    if (busy) return;
    if (regenCount < 3) {
      haptic(HAPTIC.tap);
      api.snack("세 번은 바꿔 보고 판단해요");
      return;
    }
    if (fam().always) {
      cardDone();
    } else {
      haptic(HAPTIC.wrong);
      flashNo(alwaysBt);
      toast(fam().wrongMsg);
    }
  });

  counterBt.addEventListener("click", () => {
    if (busy) return;
    if (fam().always) {
      haptic(HAPTIC.wrong);
      flashNo(counterBt);
      toast(fam().wrongMsg);
      return;
    }
    if (Math.abs(pL.q - pR.q) < fam().qGap) {
      haptic(HAPTIC.tap);
      api.snack("지금 둘은 거의 같은 모양이에요, 더 바꿔 봐요");
      return;
    }
    counterCaught += 1;
    setChipSub("counter", `반례 ${counterCaught}/3`);
    if (counterCaught === 3) chips.on("counter", "3마리 포획!");
    cardDone();
  });

  function cardDone(): void {
    busy = true;
    verdict = fam().always ? "ok" : "no";
    haptic(HAPTIC.correct);
    toast(fam().okMsg);
    paintProg();
    if (famIdx <= 3) {
      planeDone += 1;
      setChipSub("plane", `${planeDone}/4`);
      if (planeDone === 4) chips.on("plane", "4종 판별!");
    } else {
      solidDone += 1;
      setChipSub("solid", `${solidDone}/2`);
      if (solidDone === 2) chips.on("solid", "2종 판별!");
    }
    later(() => {
      if (famIdx === FAMS.length - 1) finish();
      else nextCard();
    }, 1900);
  }

  function nextCard(): void {
    famIdx += 1;
    regenCount = 0;
    verdict = "";
    pL = fam().roll();
    pR = fam().roll();
    if (fam().always) {
      for (let i = 0; i < 8 && Math.abs(pR.s - pL.s) < 12; i++) pR = fam().roll(pR);
    }
    paintShapes();
    paintProg();
    alwaysBt.classList.add("shl-dim");
    helper.innerHTML = fam().guide;
    busy = false;
  }

  function finish(): void {
    const dex = el("div", { class: "shl-dex" });
    dex.innerHTML =
      `<div class="shl-dex-row ok"><b>항상 닮음</b><span>정삼각형 · 원 · 정육면체</span></div>` +
      `<div class="shl-dex-row no"><b>아닐 수도 있음</b><span>직사각형 · 이등변삼각형 · 원기둥</span></div>`;
    board.appendChild(dex);
    alwaysBt.disabled = true;
    counterBt.disabled = true;
    regenBt.disabled = true;
    alwaysBt.classList.add("shl-dim");
    counterBt.classList.add("shl-dim");
    regenBt.classList.add("shl-dim");
    haptic(HAPTIC.done);
    helper.innerHTML =
      "도감 완성! <b>모양이 딱 하나로 정해진 도형</b>(정삼각형·원·정육면체)만 항상 닮음이에요. " +
      "그리고 '항상'을 무너뜨리는 데는 <b>반례 하나</b>면 충분하죠!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
    later(() => dex.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  pL = fam().roll();
  pR = fam().roll();
  for (let i = 0; i < 8 && Math.abs(pR.s - pL.s) < 12; i++) pR = fam().roll(pR);
  paintShapes();
  paintProg();
  api.setCTA("여섯 카드를 판정하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
