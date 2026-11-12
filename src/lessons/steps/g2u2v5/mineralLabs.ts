// [중2 Ⅱ v5] g2u2l2 랩 1, 2: 광물의 특성.
//
// 랩 1 「색이 같으면 가루 색도 같을까요?」(g2u2PowderLab)
//   책의 그림(광물의 조흔색: 자철석과 적철석, 황철석과 황동석)을 조흔판에 직접 긁어 본다.
//   학생이 정하는 것: 네 광물을 긁는 차례. 먼저 예측한다(정오를 매기지 않는다).
//   판정 하나: 겉보기 색이 같은 두 광물을 구별해 준 것. 통찰 하나: 가루의 색은 겉보기 색과 다를 수 있다.
//
// 랩 2 「이 광물들을 무엇으로 가려낼까요?」(g2u2MineralLab)
//   책의 탐구(광물의 특성 관찰하기: 석영, 장석, 흑운모, 방해석, 자철석 / 조흔판, 클립, 묽은 염산, 서로 긁기)를 한다.
//   학생이 정하는 것: 과제마다 어떤 도구를 쓸지. 차례도 학생이 정한다.
//   실패가 보이는 길: 가려내지 못하는 도구를 쓰면 광물 모두 "변화 없음"이 기록되고 과제가 끝나지 않는다.
//   판정 둘: 클립이 붙은 광물의 성질, 서로 긁었을 때 더 단단한 쪽. 통찰 하나: 광물마다 특성이 달라 그 특성으로 구별한다.

import type { StepRenderer } from "../../types";
import { G, gBtn, gGrid, gLab, gPick, gPredict, gTap, haptic, HAPTIC, label, specimen, svgOpen, type GStep } from "./kit";

/* ══════════ 랩 1: 조흔판에 긁기 ══════════ */
const ORE = [
  { k: "mag", name: "자철석", body: "#2B2B31", hi: "#5C5C68", streak: "#1C1C20", sname: "검은색" },
  { k: "hem", name: "적철석", body: "#33292B", hi: "#6A5557", streak: "#9A3F2E", sname: "적갈색" },
  { k: "pyr", name: "황철석", body: "#D9B544", hi: "#FFF0A8", streak: "#222226", sname: "검은색" },
  { k: "cha", name: "황동석", body: "#C99A2C", hi: "#F6DC84", streak: "#33402F", sname: "녹흑색" },
] as const;
const LX = [52, 133, 214, 295];

export const g2u2PowderLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-powder" });
  const { f, tm } = lab;
  const chunk = (x: number, o: (typeof ORE)[number]): string =>
    `<g class="g2u2x-pw-ore o-${o.k}"><path d="M${x - 24} 62 l8 -22 l20 -8 l18 12 l4 20 l-14 12 l-26 -2 Z" fill="${o.body}" stroke="rgba(255,255,255,.35)" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M${x - 14} 44 l16 -7 l4 14 l-14 6 Z" fill="${o.hi}" opacity=".55"/><path d="M${x + 8} 50 l12 4 l-8 12 Z" fill="${o.hi}" opacity=".3"/></g>`;
  f.stage.innerHTML = `${svgOpen}
    <rect x="14" y="112" width="318" height="84" rx="10" fill="#F2EEE6" stroke="#CFC8BA" stroke-width="1.6"/>
    ${label(173, 214, "조흔판(초벌구이 도자기 판)", { size: 12, fill: G.dim, weight: 600 })}
    ${ORE.map((o, i) => `<path class="g2u2x-pw-streak s-${o.k}" pathLength="100" d="M${LX[i] - 20} 124 l40 7 l-40 8 l40 7 l-40 8 l34 7" stroke="${o.streak}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>
      ${chunk(LX[i], o)}${label(LX[i], 98, o.name, { size: 13 })}
      ${label(LX[i], 190, "", { size: 12, fill: "#3A2E20", cls: `g2u2x-pw-read r-${o.k}` })}`).join("")}
  </svg>`;
  let pred = "";
  const done = new Set<string>();
  let busy = false;
  const taps = ORE.map((o, i) => {
    const b = gTap(lab, o.k, `${o.name} 긁기`, LX[i], 56, 70, 76);
    b.addEventListener("click", () => rub(i));
    b.disabled = true;
    return b;
  });
  const nextHint = (): void => {
    const o = ORE.find((x) => !done.has(x.k));
    if (o) lab.hint(o.k);
  };
  function rub(i: number): void {
    const o = ORE[i];
    if (busy || done.has(o.k)) return;
    busy = true;
    haptic(HAPTIC.tap);
    taps[i].classList.add("done");
    lab.q(`.o-${o.k}`).classList.add("rub");
    lab.q(`.s-${o.k}`).classList.add("on");
    tm.later(() => {
      busy = false;
      done.add(o.k);
      lab.q<SVGTextElement>(`.r-${o.k}`).textContent = o.sname;
      f.pips(done.size >= 2 ? 1 : 0);
      if (done.size < ORE.length) {
        f.say(`<b>${o.name}</b>의 가루는 <b>${o.sname}</b>이에요. 남은 광물도 긁어 보세요.`);
        nextHint();
        return;
      }
      f.pips(2);
      f.say(`${pred.startsWith("다르") ? "예측대로" : "예측과 달리"} 겉보기 색이 같아도 <b>가루의 색</b>은 달랐어요. 조흔판을 보고 답해 보세요.`);
      tm.later(judge, 1000);
    }, 950);
  }
  function judge(): void {
    lab.ask(
      "둘 다 검은 <b>자철석과 적철석</b>을 구별해 준 것은?",
      ["가루의 색", "겉으로 보이는 색", "광물 조각의 크기"],
      "겉은 둘 다 검지만 가루는 <b>검은색과 적갈색</b>으로 달랐어요.",
      () => lab.finish("광물을 조흔판에 긁으면 나오는 <b>가루의 색</b>은 겉보기 색과 다를 수 있어요. 그래서 겉보기 색이 비슷한 광물도 가루의 색으로 구별할 수 있어요."),
    );
  }
  f.say("검은 광물 둘과 노란 광물 둘이 있어요. 조흔판에 긁으면 <b>가루</b>가 묻어나요. 먼저 예측해 보세요.");
  gPredict(lab, "겉보기 색이 같은 광물은 <b>가루의 색</b>도 같을까요?", ["같다", "다르다", "가루가 생기지 않는다"], (picked) => {
    pred = picked;
    taps.forEach((b) => (b.disabled = false));
    f.stage.classList.add("play");
    f.slot.setControls();
    f.say("광물을 하나씩 <b>눌러</b> 조흔판에 긁어 보세요. 차례는 마음대로예요.");
    api.setCTA("네 광물을 모두 긁어 보세요", { enabled: false });
    nextHint();
  });
  return lab.cleanup;
};

/* ══════════ 랩 2: 도구로 가려내기 ══════════ */
type Tool = "clip" | "acid" | "plate";
const MIN: Record<string, { name: string; img: string; clip: boolean; acid: boolean; plate: string }> = {
  bio: { name: "흑운모", img: "minerals/biotite.webp", clip: false, acid: false, plate: "흰색 가루" },
  mag: { name: "자철석", img: "minerals/magnetite.webp", clip: true, acid: false, plate: "검은색 가루" },
  qtz: { name: "석영", img: "minerals/quartz.webp", clip: false, acid: false, plate: "가루 없음" },
  fel: { name: "장석", img: "minerals/feldspar.webp", clip: false, acid: false, plate: "흰색 가루" },
  cal: { name: "방해석", img: "minerals/calcite.webp", clip: false, acid: true, plate: "흰색 가루" },
};
const TOOLS: { k: Tool; name: string; sub: string; short: string }[] = [
  { k: "clip", name: "클립", sub: "가까이 대기", short: "클립" },
  { k: "acid", name: "묽은 염산", sub: "한 방울 떨어뜨리기", short: "염산" },
  { k: "plate", name: "조흔판", sub: "긁어서 가루 보기", short: "가루" },
];
const TASKS: { set: string[]; goal: string; say: string; good: Tool[]; best: Tool }[] = [
  { set: ["bio", "mag"], goal: "검은 광물 둘", say: "<b>흑운모와 자철석</b>은 둘 다 검어요. 도구를 골라 두 광물을 가려내 보세요.", good: ["clip", "plate"], best: "clip" },
  { set: ["qtz", "fel", "cal"], goal: "밝은 광물 셋", say: "밝은 광물 셋 가운데 <b>방해석</b>을 찾아야 해요. 어떤 도구가 방해석만 골라낼까요?", good: ["acid"], best: "acid" },
];

export const g2u2MineralLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 4, cls: "g2u2x-mineral" });
  const { f, tm } = lab;
  let task = 0;
  let busy = false;
  let used = new Set<Tool>();
  let solved = false;
  const picks = TOOLS.map((t) => {
    const p = gPick(t.k, t.name, t.sub);
    p.el.addEventListener("click", () => use(t.k, p));
    return p;
  });
  const next = gBtn("next", "다음 광물로");
  next.hidden = true;

  function draw(): void {
    const set = TASKS[task].set;
    const w = set.length === 2 ? 104 : 92, gap = (346 - w * set.length) / (set.length + 1);
    f.stage.innerHTML = `${svgOpen}${set.map((k, i) => {
      const x = gap + i * (w + gap), cx = x + w / 2, m = MIN[k];
      return `${specimen(`g2mn${task}${i}`, m.img, x, 12, w, 92)}
        ${label(cx, 122, m.name, { size: 13.5 })}
        <g class="g2u2x-mn-fx fx-${k}"></g>
        ${[0, 1, 2].map((j) => label(cx, 144 + j * 19, "", { size: 12.5, weight: 700, fill: G.dim, cls: `g2u2x-mn-log l-${k}-${j}` })).join("")}`;
    }).join("")}</svg>`;
  }
  function fx(k: string, tool: Tool, hit: boolean, cx: number): string {
    if (tool === "clip") return `<g class="g2u2x-mn-clip ${hit ? "stick" : "fall"}"><path d="M${cx + 20} 30 v26 a7 7 0 0 0 14 0 v-30 a10 10 0 0 0 -20 0 v34" stroke="#DDE6F2" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
    if (tool === "acid") return `<g class="g2u2x-mn-drop"><path d="M${cx} 22 q-7 10 0 14 q7 -4 0 -14" fill="#B6F3C8"/></g>${hit ? [-14, -4, 8, 16, 2].map((d, n) => `<circle class="g2u2x-mn-bub" style="animation-delay:${0.5 + n * 0.12}s" cx="${cx + d}" cy="${62 - (n % 2) * 8}" r="${4 + (n % 3)}" fill="rgba(255,255,255,.85)"/>`).join("") : ""}`;
    const col = MIN[k].plate.startsWith("검") ? "#1C1C20" : "#FFFFFF";
    return `<g class="g2u2x-mn-plate"><rect x="${cx - 30}" y="74" width="60" height="24" rx="5" fill="#EDE7DC" stroke="#B9B09E" stroke-width="1.2"/>${MIN[k].plate === "가루 없음" ? `<path d="M${cx - 18} 86 h36" stroke="#9A917F" stroke-width="1.6" stroke-dasharray="3 3"/>` : `<path d="M${cx - 20} 86 h40" stroke="${col}" stroke-width="5" stroke-linecap="round"/><path d="M${cx - 20} 86 h40" stroke="#8D8573" stroke-width="5.6" stroke-linecap="round" opacity=".25"/>`}</g>`;
  }
  const hintNow = (): void => {
    if (solved) lab.hint("next");
    else lab.hint(TASKS[task].best);
  };

  function use(tool: Tool, p: (typeof picks)[number]): void {
    if (busy || lab.finished()) return;
    const T = TASKS[task];
    busy = true;
    haptic(HAPTIC.tap);
    picks.forEach((x) => x.on(x === p));
    const set = T.set;
    const w = set.length === 2 ? 104 : 92, gap = (346 - w * set.length) / (set.length + 1);
    set.forEach((k, i) => {
      const cx = gap + i * (w + gap) + w / 2;
      const m = MIN[k];
      const hit = tool === "clip" ? m.clip : tool === "acid" ? m.acid : m.plate !== "가루 없음";
      lab.q(`.fx-${k}`).innerHTML = fx(k, tool, hit, cx);
    });
    tm.later(() => {
      const first = !used.has(tool);
      if (first) {
        const row = used.size;
        used.add(tool);
        set.forEach((k) => {
          const m = MIN[k];
          const t = lab.q<SVGTextElement>(`.l-${k}-${row}`);
          const word = tool === "clip" ? (m.clip ? "달라붙음" : "변화 없음") : tool === "acid" ? (m.acid ? "거품이 남" : "변화 없음") : m.plate;
          const strong = tool === "plate" ? m.plate !== "흰색 가루" : word !== "변화 없음";
          t.textContent = `${TOOLS.find((x) => x.k === tool)!.short}: ${word}`;
          t.setAttribute("fill", strong ? G.gold : G.dim);
        });
      }
      p.done();
      busy = false;
      const good = T.good.includes(tool);
      if (task === 0) {
        if (tool === "clip") f.say("<b>자철석</b>에만 클립이 달라붙었어요. 두 광물이 가려졌어요.");
        if (tool === "acid") f.say("두 광물 모두 <b>변화가 없어요</b>. 묽은 염산으로는 가려낼 수 없어요. 다른 도구를 써 보세요.");
        if (tool === "plate") f.say("가루가 흑운모는 <b>흰색</b>, 자철석은 <b>검은색</b>이에요. 겉은 같아도 가루로 가려졌어요.");
      } else {
        if (tool === "acid") f.say("<b>방해석</b>에서만 거품이 생겼어요. 방해석을 찾았어요.");
        if (tool === "clip") f.say("세 광물 모두 <b>변화가 없어요</b>. 클립으로는 가려낼 수 없어요. 다른 도구를 써 보세요.");
        if (tool === "plate") f.say("석영만 가루가 없어요. 조흔판보다 단단해서예요. 하지만 <b>장석과 방해석</b>은 가루가 같아요.");
      }
      if (!good) {
        haptic(HAPTIC.wrong);
        host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      } else if (!solved) {
        solved = true;
        haptic(HAPTIC.correct);
        f.pips(task * 2 + 1);
        next.hidden = false;
        next.textContent = task === 0 ? "다음, 밝은 광물 셋" : "다음, 서로 긁어 보기";
      }
      hintNow();
    }, 1100);
  }

  next.addEventListener("click", () => {
    if (busy) return;
    haptic(HAPTIC.tap);
    next.hidden = true;
    if (task === 0) {
      lab.ask("클립이 달라붙은 <b>자철석</b>에는 어떤 성질이 있을까요?", ["쇠붙이를 끌어당긴다", "묽은 염산과 반응한다", "가루가 붉은색이다"], "자철석은 클립 같은 <b>쇠붙이를 끌어당기는</b> 성질이 있어요.", () => {
        task = 1;
        start();
      });
      return;
    }
    scratch();
  });

  function start(): void {
    used = new Set();
    solved = false;
    picks.forEach((p) => {
      p.on(false);
      p.el.classList.remove("done");
    });
    draw();
    f.pips(task * 2);
    f.slot.setControls(gGrid(3, ...picks), next);
    f.say(TASKS[task].say);
    api.setCTA(`${TASKS[task].goal}을 가려내 보세요`, { enabled: false });
    hintNow();
  }

  // 마지막: 석영과 방해석을 서로 긁는다
  function scratch(): void {
    f.pips(3);
    f.stage.innerHTML = `${svgOpen}
      <g class="g2u2x-mn-sq">${specimen("g2mnq", MIN.qtz.img, 30, 40, 120, 106)}</g>
      ${specimen("g2mnc", MIN.cal.img, 196, 40, 120, 106)}
      <g class="g2u2x-mn-mark"><path d="M222 78 l44 22 M230 104 l40 18" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M222 78 l44 22 M230 104 l40 18" stroke="#5B6B80" stroke-width="1" stroke-linecap="round" transform="translate(1 1.5)"/></g>
      ${label(90, 170, "석영", { size: 13.5 })}${label(256, 170, "방해석", { size: 13.5 })}
      ${label(173, 200, "", { size: 12.5, fill: G.gold, cls: "g2u2x-mn-res" })}
    </svg>`;
    f.say("이번에는 도구 없이 <b>석영과 방해석</b>을 서로 긁어요. 먼저 예측해 보세요.");
    gPredict(lab, "두 광물을 서로 긁으면 어느 쪽에 <b>흠집</b>이 생길까요?", ["석영", "방해석", "둘 다 생긴다"], (picked) => {
      const go = gBtn("rub", "두 광물 서로 긁기");
      f.slot.setControls(go);
      f.say("버튼을 눌러 두 광물을 <b>서로 긁어</b> 보세요.");
      api.setCTA("두 광물을 서로 긁어 보세요", { enabled: false });
      lab.hint("rub");
      go.addEventListener("click", () => {
        go.disabled = true;
        haptic(HAPTIC.tap);
        f.stage.classList.add("rubbing");
        tm.later(() => {
          f.stage.classList.add("marked");
          lab.q<SVGTextElement>(".g2u2x-mn-res").textContent = "방해석에만 흠집이 생겼어요";
          f.say(`${picked.startsWith("방해석") ? "예측대로" : "예측과 달리"} <b>방해석</b>에만 흠집이 생겼어요. 석영은 멀쩡해요.`);
          tm.later(() => lab.ask("석영과 방해석 가운데 <b>더 단단한</b> 광물은?", ["석영", "방해석", "단단하기가 같다"], "서로 긁으면 <b>무른 쪽</b>에만 흠집이 생겨요. 긁힌 방해석이 더 물러요.", () =>
            lab.finish("광물마다 <b>가루의 색, 쇠붙이를 끌어당기는 성질, 묽은 염산과의 반응, 단단한 정도</b>가 달라요. 이런 특성을 이용하면 겉보기가 비슷한 광물도 가려낼 수 있어요."),
          ), 1000);
        }, 1200);
      });
    });
  }

  start();
  return lab.cleanup;
};
