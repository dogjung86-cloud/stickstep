// [중1 Ⅱ v5] u2l9 kingdomPathLab: 「이 생물은 어느 계일까?」
// 한 통찰: 생물은 핵막, 광합성, 세포벽과 운동성을 차례로 따져 다섯 계로 나눈다(버섯은 광합성을 하지 못해 식물계가 아니다).
// 무대: 검색표. 물음 넷이 한 줄로 놓이고, 물음마다 아래로 갈리는 길 끝에 계가 있다(마지막 물음의 '아니요'는 균계).
//   ① 유전물질이 핵막으로 싸여 있는가: 아니요 → 원핵생물계      ② 균계, 식물계, 동물계가 아닌 무리인가: 예 → 원생생물계
//   ③ 광합성을 하는가: 예 → 식물계      ④ 세포벽이 없고 운동성이 있는가: 예 → 동물계, 아니요 → 균계
// 조작: 생물 다섯(대장균, 아메바, 소나무, 박새, 버섯)을 차례로 보낸다. 조작 칸의 특징 카드를 보고 예, 아니요로 답하면
//   생물이 그 길로 움직인다. 틀리면 특징 카드의 해당 줄이 짚이고 다시 고른다(채점하지 않는다).
//   ②는 특징만으로 답할 수 없는 물음이라 랩이 까닭을 말하며 대신 답한다.
//   '핵막'은 이 랩에서 처음 만나는 말이라 첫 물음에 뜻을 괄호로 붙였다(개념 글은 랩 뒤에 있다).
// 다섯을 다 보내면 판정(채점): 버섯이 식물계가 아니라 균계인 까닭. 판정 때 버섯이 지나간 길이 무대에 표시된다.
// 그림: 구작 생물 그림(public/bio). 움직임은 CSS 전환과 타이머.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvFrame, bvTimers } from "./b6Lab";

interface KplStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const KINGDOMS = ["원핵생물계", "원생생물계", "식물계", "동물계", "균계"];
interface Org {
  name: string;
  img: string;
  kingdom: number;
  facts: [string, string, string];
  /** 물음(1~4)마다 봐야 할 특징 줄 */
  hot: Record<number, number>;
  land: string;
  /** 이름 뒤에 붙는 조사(을/를, 은/는) */
  eul: string;
  eun: string;
}
const ORGS: Org[] = [
  {
    name: "대장균",
    img: "bio/bacteria.webp",
    kingdom: 0,
    facts: ["핵막이 없어요", "광합성을 하지 못해요", "세포벽이 있어요"],
    hot: { 1: 0 },
    land: "대장균은 <b>원핵생물계</b>예요. 핵막이 없는 생물은 첫 물음에서 갈려요.",
    eul: "을",
    eun: "은",
  },
  {
    name: "아메바",
    img: "bio/amoeba.webp",
    kingdom: 1,
    facts: ["핵막이 있어요", "세포 하나로 된 몸이에요", "균, 식물, 동물 어디에도 들지 않아요"],
    hot: { 1: 0, 2: 2 },
    land: "아메바는 <b>원생생물계</b>예요. 균계, 식물계, 동물계 어디에도 들지 않는 무리예요.",
    eul: "를",
    eun: "는",
  },
  {
    name: "소나무",
    img: "bio/pine.webp",
    kingdom: 2,
    facts: ["핵막이 있어요", "광합성을 해요", "세포벽이 있어요"],
    hot: { 1: 0, 3: 1 },
    land: "소나무는 <b>식물계</b>예요. 광합성을 해서 스스로 양분을 만들어요.",
    eul: "를",
    eun: "는",
  },
  {
    name: "박새",
    img: "bio/bird.webp",
    kingdom: 3,
    facts: ["핵막이 있어요", "광합성을 하지 못해요", "세포벽이 없고 스스로 움직여요"],
    hot: { 1: 0, 3: 1, 4: 2 },
    land: "박새는 <b>동물계</b>예요. 세포벽이 없고 스스로 움직여요.",
    eul: "를",
    eun: "는",
  },
  {
    name: "버섯",
    img: "bio/mushroom.webp",
    kingdom: 4,
    facts: ["핵막이 있어요", "광합성을 하지 못해요", "세포벽이 있고 움직이지 못해요"],
    hot: { 1: 0, 3: 1, 4: 2 },
    land: "버섯은 <b>균계</b>예요. 광합성을 하지 못하고, 세포벽이 있으며 움직이지 못해요.",
    eul: "을",
    eun: "은",
  },
];

const GATE_KEY = ["", "핵막", "나머지", "광합성", "세포벽"];
const QUESTION = ["", "유전물질이 핵막(핵을 둘러싼 막)으로 싸여 있나요?", "균계, 식물계, 동물계가 아닌 무리인가요?", "광합성을 하나요?", "세포벽이 없고 스스로 움직이나요?"];
/** 물음 g에 대한 옳은 답(예 = true). */
const truth = (o: Org, g: number): boolean => (g === 1 ? o.kingdom !== 0 : g === 2 ? o.kingdom === 1 : g === 3 ? o.kingdom === 2 : o.kingdom === 3);
/** 아래로 갈리는 답(예 = true). ①만 '아니요'가 아래다. */
const DOWN_IS_YES = [false, false, true, true, true];

// 좌표(346×230 설계 판)
const GX = [37, 105, 173, 241, 309]; // 물음 넷과 균계 길목의 x
const LINE_Y = 64;
const BOX_Y = 130;
const LAND_Y = 187;
const START: [number, number] = [12, LINE_Y];

function pathSvg(): string {
  const downs = [0, 1, 2, 3, 4].map((i) => `<path d="M${GX[i]} ${LINE_Y}V${BOX_Y - 9}" /><path d="M${GX[i] - 5} ${BOX_Y - 15}l5 7 5 -7" />`).join("");
  return `<svg class="kpl-lines" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="none" stroke="#3F5C8C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${START[0]} ${LINE_Y}H${GX[4]}" />
      ${[0, 1, 2, 3].map((i) => `<path d="M${GX[i]} 44V${LINE_Y}" />`).join("")}
      ${downs}
    </g>
    <path class="kpl-trail" d="M${START[0]} ${LINE_Y}H${GX[4]}V${BOX_Y - 9}" fill="none" stroke="#FFD43B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${[0, 1, 2, 3].map((i) => `<circle cx="${GX[i]}" cy="${LINE_Y}" r="4.5" fill="#0B1524" stroke="#6F8FC9" stroke-width="2"/>`).join("")}
  </svg>`;
}

export const kingdomPathLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as KplStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: ORGS.length + 1, cls: "kpl-stage", qCls: "kpl-q" });
  const canvas = bvCanvas(f.stage);

  // ── 무대: 검색표 ─────────────────────────────────────────────────
  const lines = el("div", { class: "kpl-svgbox", html: pathSvg() });
  const gates = [1, 2, 3, 4].map((g) => {
    const n = el("div", { class: "kpl-gate" }, el("i", { text: String(g) }), el("b", { text: GATE_KEY[g] }));
    n.style.left = `${GX[g - 1] - 30}px`;
    return n;
  });
  // 갈림길의 예, 아니요
  const tags: HTMLElement[] = [];
  [1, 2, 3, 4].forEach((g) => {
    const down = el("span", { class: "kpl-tag down", text: DOWN_IS_YES[g] ? "예" : "아니요" });
    down.style.left = `${GX[g - 1] + 7}px`;
    const side = el("span", { class: "kpl-tag side", text: DOWN_IS_YES[g] ? "아니요" : "예" });
    side.style.left = `${GX[g - 1] + 34}px`;
    tags.push(down, side);
  });
  const boxes = KINGDOMS.map((k, i) => {
    const b = el("div", { class: "kpl-box" }, el("b", { text: k }), el("div", { class: "kpl-seat" }));
    b.style.left = `${GX[i] - 33}px`;
    return b;
  });
  const token = el("div", { class: "kpl-token" }, el("img", { attrs: { alt: "", draggable: "false" } }));
  canvas.el.append(lines, ...gates, ...tags, ...boxes, token);

  // ── 조작 칸: 특징 카드, 물음, 예와 아니요 ─────────────────────────
  const cardImg = el("img", { attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  const cardName = el("b");
  const factEls = [0, 1, 2].map(() => el("li"));
  const card = el("div", { class: "kpl-card" }, el("div", { class: "kpl-card-ic" }, cardImg), el("div", { class: "kpl-card-tx" }, cardName, el("ul", {}, ...factEls)));
  const qNum = el("i");
  const qText = el("span");
  const question = el("div", { class: "kpl-ask" }, qNum, qText);
  const yesBtn = bvBtn("kpl-yes", "예");
  const noBtn = bvBtn("kpl-no", "아니요");
  const answers = el("div", { class: "kpl-answers" }, yesBtn, noBtn);
  const nextBtn = bvBtn("main kpl-next", "다음 생물 보내기");
  nextBtn.hidden = true;

  // ── 상태 ─────────────────────────────────────────────────────────
  let oi = 0;
  let gate = 1;
  let busy = false;
  let wrongs = 0;
  let landed = 0;
  let phase: "play" | "ask" | "done" = "play";

  const mark = (): void => {
    host.dataset.kplOrg = String(oi);
    host.dataset.kplGate = String(gate);
    host.dataset.kplBusy = busy ? "1" : "0";
    host.dataset.kplWrong = String(wrongs);
    host.dataset.kplLanded = String(landed);
    host.dataset.kplPhase = phase;
  };
  const place = (x: number, y: number, jump = false): void => {
    token.classList.toggle("jump", jump);
    token.style.left = `${x - 17}px`;
    token.style.top = `${y - 17}px`;
    if (jump) void token.offsetWidth;
  };

  function showQuestion(g: number, auto: boolean): void {
    gate = g;
    gates.forEach((n, i) => {
      n.classList.toggle("on", i === g - 1);
      n.classList.toggle("past", i < g - 1);
    });
    qNum.textContent = String(g);
    qText.textContent = QUESTION[g];
    question.hidden = false;
    answers.hidden = false;
    nextBtn.hidden = true;
    yesBtn.disabled = auto;
    noBtn.disabled = auto;
    yesBtn.classList.remove("pick", "no");
    noBtn.classList.remove("pick", "no");
    factEls.forEach((li) => li.classList.remove("hot"));
    mark();
  }

  function startOrg(i: number): void {
    oi = i;
    const o = ORGS[i];
    token.querySelector("img")?.setAttribute("src", bvSrc(o.img));
    token.classList.remove("gone");
    place(START[0], START[1], true);
    cardImg.src = bvSrc(o.img);
    cardName.textContent = o.name;
    factEls.forEach((li, k) => (li.textContent = o.facts[k]));
    busy = true;
    showQuestion(1, false);
    yesBtn.disabled = true;
    noBtn.disabled = true;
    f.say(`<b>${o.name}</b>${o.eul} 보낼게요. 아래 특징을 보고 물음에 <b>예, 아니요</b>로 답해요.`);
    tm.later(() => {
      token.classList.remove("jump");
      place(GX[0], LINE_Y);
      tm.later(() => {
        busy = false;
        yesBtn.disabled = false;
        noBtn.disabled = false;
        mark();
      }, 480);
    }, 60);
    mark();
  }

  /** 생물이 계의 칸에 들어간다. */
  function land(k: number): void {
    const o = ORGS[oi];
    busy = true;
    mark();
    place(GX[k], LINE_Y);
    tm.later(() => place(GX[k], LAND_Y), k === 4 && gate === 4 ? 480 : 60);
    tm.later(
      () => {
        token.classList.add("gone");
        const seat = boxes[k].querySelector(".kpl-seat") as HTMLElement;
        seat.innerHTML = `<img src="${bvSrc(o.img)}" alt="" draggable="false" />`;
        boxes[k].classList.add("full");
        haptic(HAPTIC.correct);
        landed += 1;
        gates.forEach((n) => n.classList.remove("on"));
        f.pips(landed);
        f.say(o.land);
        question.hidden = true;
        answers.hidden = true;
        nextBtn.textContent = oi < ORGS.length - 1 ? "다음 생물 보내기" : "버섯이 지나온 길 돌아보기";
        nextBtn.hidden = false;
        busy = false;
        gate = 0;
        mark();
      },
      k === 4 && gate === 4 ? 1020 : 620,
    );
  }

  /** 옳은 답을 골랐다: 그 길로 움직인다. */
  function go(yes: boolean): void {
    const g = gate;
    const down = yes === DOWN_IS_YES[g];
    if (down) {
      land(g - 1);
      return;
    }
    if (g === 4) {
      land(4);
      return;
    }
    busy = true;
    mark();
    place(GX[g], LINE_Y);
    tm.later(() => {
      if (g + 1 === 2) autoGate2();
      else {
        busy = false;
        showQuestion(g + 1, false);
        f.say(g + 1 === 3 ? "셋째 물음이에요. 특징 카드에서 <b>광합성</b>을 찾아봐요." : "마지막 물음이에요. <b>세포벽</b>과 움직임을 함께 봐요.");
      }
    }, 500);
  }

  /** ②는 특징만으로 답할 수 없어서 랩이 까닭을 말하며 대신 답한다. */
  function autoGate2(): void {
    const o = ORGS[oi];
    const yes = truth(o, 2);
    showQuestion(2, true);
    busy = true;
    mark();
    f.say(
      yes
        ? `둘째 물음은 대신 답할게요. ${o.name}${o.eun} 균계, 식물계, 동물계가 <b>아닌 무리</b>예요.`
        : `둘째 물음은 대신 답할게요. ${o.name}${o.eun} 균계, 식물계, 동물계 <b>가운데 하나</b>예요.`,
    );
    if (o.hot[2] !== undefined) factEls[o.hot[2]].classList.add("hot");
    tm.later(() => (yes ? yesBtn : noBtn).classList.add("pick"), 500);
    tm.later(() => go(yes), 1700);
  }

  function answer(yes: boolean): void {
    if (phase !== "play" || busy || gate < 1) return;
    const o = ORGS[oi];
    const btn = yes ? yesBtn : noBtn;
    if (truth(o, gate) !== yes) {
      // 틀린 길: 특징 카드의 그 줄을 짚어 주고 다시 고르게 한다
      haptic(HAPTIC.wrong);
      wrongs += 1;
      btn.classList.remove("no");
      void btn.offsetWidth;
      btn.classList.add("no");
      const k = o.hot[gate];
      factEls.forEach((li, i) => li.classList.toggle("hot", i === k));
      f.say(`특징을 다시 봐요. ${o.name}${o.eun} <b>${o.facts[k]}</b>.`);
      mark();
      return;
    }
    haptic(HAPTIC.tap);
    btn.classList.add("pick");
    yesBtn.disabled = true;
    noBtn.disabled = true;
    go(yes);
  }
  yesBtn.addEventListener("click", () => answer(true));
  noBtn.addEventListener("click", () => answer(false));
  nextBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (oi < ORGS.length - 1) startOrg(oi + 1);
    else review();
  });

  function review(): void {
    phase = "ask";
    f.stage.classList.add("trail");
    gates.forEach((n, i) => n.classList.toggle("on", i === 2));
    mark();
    f.say("노란 선이 버섯이 지나온 길이에요. 식물계로 가는 길과 <b>어디에서 갈렸는지</b> 봐요.");
    f.slot.ask(
      "버섯이 식물계가 아니라 균계인 까닭은?",
      [{ t: "광합성을 하지 못해서", ok: true }, { t: "세포벽이 없어서" }, { t: "핵막이 없어서" }],
      (ok) => api.recordQuiz(ok),
      { why: "버섯은 셋째 물음에서 '아니요'로 갈렸어요. <b>광합성을 하지 못하니</b> 식물계가 아니에요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    mark();
    f.pips(ORGS.length + 1);
    f.say("다섯 생물이 모두 제 계를 찾았어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("생물은 <b>핵막, 광합성, 세포벽과 운동성</b>을 차례로 따져 다섯 계로 나눠요. 버섯은 균계예요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(card, question, answers, nextBtn);
  startOrg(0);
  api.setCTA("생물 다섯을 제 계로 보내 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
