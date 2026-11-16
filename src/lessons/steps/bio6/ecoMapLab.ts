// [중1 Ⅱ v5] u2l6 ecoMapLab: 「생물이 얼마나 다양한지는 무엇으로 알까?」
// 한 통찰: 생물이 다양한 정도는 생물의 수가 아니라 세 가지로 안다. 사는 환경이 여러 가지인가, 생물의 종류가 많은가,
//   같은 종류 안에서도 서로 다른가.
// 무대: 땅 세 칸(처음에는 모두 숲)과 눈금 셋, 그리고 생물의 수. 생물의 수는 끝까지 60 그대로다.
// 조작(카드 셋, 누를 때마다 바뀌고 다시 누르면 되돌아간다):
//   습지로 바꾸기(가운데 칸) · 갯벌로 바꾸기(오른쪽 칸): 사는 환경이 한 가지 늘고 그곳의 생물 4종류가 더해진다. 되돌리면 함께 사라진다.
//   무당벌레 보기: 숲속 무당벌레 다섯 마리를 가까이 본다. 겉날개의 색과 무늬가 저마다 다르다(세 번째 눈금).
// 처음 환경을 바꿀 때 예측 질문(채점하지 않음). 셋을 다 해 보면 확인 버튼 → 판정(채점): 환경을 바꾸자 종류가 늘어난 까닭.
// 그림: 구작 생태계 그림(bio3/eco)과 무당벌레 다섯 마리(코드 그림 bio6Figures.ladybugRowSvg, 2026-11-15 그래픽 손질. 고치기 전 사진은
//   다섯 마리가 거의 같은 빨강이라 같은 종류 안의 차이가 약했고 넓은 화면에서 흐렸다). 칸마다 적힌 생물은 그 그림에 실제로 보이는 것만 썼다.
// 눈금의 '생물의 종류'는 그림에 적힌 생물을 센 값(칸마다 4)이다. 모형이라는 점은 도움말이 "이 땅"이라고 부르는 것으로 드러낸다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import { LADYBUG_SWATCH, ladybugIconSvg, ladybugRowSvg } from "../../../ui/bio6Figures";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "./b6Lab";

interface EmpStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Hab = "forest" | "wet" | "flat";
const HAB: Record<Hab, { name: string; img: string; kinds: [string, string]; size: string; pos: string }> = {
  forest: { name: "숲", img: "bio3/eco/forest.webp", kinds: ["다람쥐 사슴", "곰 고사리"], size: "330px auto", pos: "" },
  wet: { name: "습지", img: "bio3/eco/wetland.webp", kinds: ["왜가리 오리", "개구리 수련"], size: "150px auto", pos: "-15px -14px" },
  flat: { name: "갯벌", img: "bio3/eco/tidalflat.webp", kinds: ["도요새 물떼새", "게 조개"], size: "150px auto", pos: "-14px -18px" },
};
const PER_PLOT = 20; // 한 칸에 사는 생물의 수(모형)
type Key = "wet" | "flat" | "bug";
const KEYS: Key[] = ["wet", "flat", "bug"];
/** 셋째 눈금의 점 다섯: 무당벌레 다섯 마리의 겉날개 색(검정 바탕은 붉은 점을 함께, 어두운 무대에서 보이게 옅은 테). */
const bugDot = (sw: { base: string; red: boolean }, i: number): string => {
  const spot = sw.red ? "#E5352A" : "#161616";
  if (i === 0) return sw.base;
  return `radial-gradient(circle at 33% 40%, ${spot} 0 1.5px, transparent 1.8px), radial-gradient(circle at 68% 64%, ${spot} 0 1.5px, transparent 1.8px), ${sw.base}`;
};

export const ecoMapLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as EmpStep;
  const tm = bvTimers();
  // 세 줄 도움말을 처음부터 잡아 둔다(무당벌레를 볼 때의 글이 세 줄이다. 랩 도중에 무대가 밀리지 않게)
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "emp-stage", qCls: "emp-q", api, tall: true });
  const canvas = bvCanvas(f.stage);

  // ── 무대: 땅 세 칸 ───────────────────────────────────────────────
  interface Plot {
    root: HTMLElement;
    alt: HTMLElement | null;
    chip: HTMLElement;
    kinds: HTMLElement;
  }
  const plots: Plot[] = [0, 1, 2].map((i) => {
    const base = el("div", { class: "emp-bg" });
    base.style.backgroundImage = `url(${bvSrc(HAB.forest.img)})`;
    base.style.backgroundSize = HAB.forest.size;
    base.style.backgroundPosition = `${-i * 112}px -88px`; // 숲 그림 한 장이 세 칸에 걸쳐 이어진다
    const altKey: Hab | null = i === 1 ? "wet" : i === 2 ? "flat" : null;
    let alt: HTMLElement | null = null;
    if (altKey) {
      alt = el("div", { class: "emp-bg alt" });
      alt.style.backgroundImage = `url(${bvSrc(HAB[altKey].img)})`;
      alt.style.backgroundSize = HAB[altKey].size;
      alt.style.backgroundPosition = HAB[altKey].pos;
    }
    const chip = el("div", { class: "emp-chip", text: HAB.forest.name });
    const kinds = el("div", { class: "emp-kinds" }, el("span", { text: HAB.forest.kinds[0] }), el("span", { text: HAB.forest.kinds[1] }));
    const pic = el("div", { class: "emp-pic" }, base, alt, chip);
    const root = el("div", { class: `emp-plot p${i}` }, pic, kinds);
    root.style.left = `${8 + i * 112}px`;
    return { root, alt, chip, kinds };
  });
  // 무당벌레를 가까이 본 모습(땅 위에 겹쳐 뜬다)
  const bugImg = el("div", { class: "emp-bug-img", html: ladybugRowSvg(330, 118, "잎 위의 같은 종류 무당벌레 다섯 마리. 겉날개의 색과 점 무늬가 저마다 다르다", 26) });
  const bug = el("div", { class: "emp-bug" }, bugImg, el("div", { class: "emp-chip", text: "숲속의 무당벌레 다섯 마리" }));

  // ── 무대: 눈금 셋과 생물의 수 ────────────────────────────────────
  const envCells = [0, 1, 2].map(() => el("i"));
  const envVal = el("b", { text: "1가지" });
  const kindFill = el("i");
  const kindVal = el("b", { text: "4가지" });
  const varDots = LADYBUG_SWATCH.map((sw, i) => {
    const d = el("i", { class: sw.red ? "dark" : "" });
    d.style.background = bugDot(sw, i);
    return d;
  });
  const varVal = el("b", { text: "?" });
  const row = (cls: string, label: string, meter: HTMLElement, val: HTMLElement): HTMLElement =>
    el("div", { class: `emp-row ${cls}` }, el("span", { text: label }), meter, val);
  const gauges = el(
    "div",
    { class: "emp-gauges" },
    row("env", "사는 환경", el("div", { class: "emp-cells" }, ...envCells), envVal),
    row("kind", "생물의 종류", el("div", { class: "emp-bar" }, kindFill), kindVal),
    row("vary", "같은 종류 안의 차이", el("div", { class: "emp-dots" }, ...varDots), varVal),
  );
  const countNote = el("i", { text: "그대로" });
  const count = el("div", { class: "emp-count" }, el("span", { text: "생물의 수" }), el("b", { text: String(PER_PLOT * 3) }), countNote);
  canvas.el.append(...plots.map((p) => p.root), bug, gauges, count);

  // ── 상태 ─────────────────────────────────────────────────────────
  const on: Record<Key, boolean> = { wet: false, flat: false, bug: false };
  const tried: Record<Key, boolean> = { wet: false, flat: false, bug: false };
  let predicted = false;
  let phase: "play" | "ask" | "done" = "play";

  const cards = {} as Record<Key, BvCard>;
  cards.wet = bvCard("emp-card col", { name: "습지로 바꾸기", sub: "가운데 칸", icon: `<img src="${bvSrc(HAB.wet.img)}" alt="" draggable="false" />`, key: "wet" });
  cards.flat = bvCard("emp-card col", { name: "갯벌로 바꾸기", sub: "오른쪽 칸", icon: `<img src="${bvSrc(HAB.flat.img)}" alt="" draggable="false" />`, key: "flat" });
  cards.bug = bvCard("emp-card col bug", { name: "무당벌레 보기", sub: "숲속에서", icon: ladybugIconSvg(2), key: "bug" });
  const doneBtn = bvBtn("main emp-check", "질문에 답하고 정리하기");
  doneBtn.hidden = true;

  const envN = (): number => 1 + (on.wet ? 1 : 0) + (on.flat ? 1 : 0);

  function paint(): void {
    const habOf: Hab[] = ["forest", on.wet ? "wet" : "forest", on.flat ? "flat" : "forest"];
    plots.forEach((p, i) => {
      const h = HAB[habOf[i]];
      p.alt?.classList.toggle("show", habOf[i] !== "forest");
      p.chip.textContent = h.name;
      (p.kinds.children[0] as HTMLElement).textContent = h.kinds[0];
      (p.kinds.children[1] as HTMLElement).textContent = h.kinds[1];
      p.root.dataset.hab = habOf[i];
    });
    const n = envN();
    envCells.forEach((c, i) => c.classList.toggle("on", i < n));
    envVal.textContent = `${n}가지`;
    kindFill.style.width = `${(n / 3) * 100}%`;
    kindVal.textContent = `${n * 4}가지`;
    gauges.classList.toggle("seen", tried.bug);
    // 환경을 한 번이라도 바꾼 뒤에는 '그대로'가 생물의 수 아래에 남는다(판정의 근거)
    count.classList.toggle("kept", tried.wet || tried.flat);
    varVal.textContent = tried.bug ? "다양해요" : "?";
    f.stage.classList.toggle("bug", on.bug);
    cards.wet.on(on.wet);
    cards.flat.on(on.flat);
    cards.bug.on(on.bug);
    cards.wet.sub(on.wet ? "다시 누르면 숲으로" : "가운데 칸");
    cards.flat.sub(on.flat ? "다시 누르면 숲으로" : "오른쪽 칸");
    cards.bug.sub(on.bug ? "다시 누르면 닫기" : "숲속에서");
    host.dataset.empEnv = String(n);
    host.dataset.empKinds = String(n * 4);
    host.dataset.empTried = KEYS.filter((k) => tried[k]).join(",");
    host.dataset.empBug = on.bug ? "1" : "0";
  }

  /** 바뀐 눈금과 '그대로'인 생물의 수를 잠깐 짚는다. */
  function flash(cls: string): void {
    gauges.classList.remove("hit-env", "hit-kind", "hit-vary");
    count.classList.remove("same");
    void gauges.offsetWidth;
    if (cls) gauges.classList.add(cls);
    if (cls !== "hit-vary") count.classList.add("same");
    tm.later(() => {
      gauges.classList.remove("hit-env", "hit-kind", "hit-vary");
      count.classList.remove("same");
    }, 1800);
  }

  function afterTry(k: Key): void {
    if (tried[k]) return;
    tried[k] = true;
    cards[k].done();
    f.pips(KEYS.filter((x) => tried[x]).length);
    if (KEYS.every((x) => tried[x])) {
      tm.later(() => {
        if (phase !== "play") return;
        doneBtn.hidden = false;
      }, 1400);
    }
  }

  function toggleHab(k: "wet" | "flat"): void {
    on[k] = !on[k];
    if (on.bug) on.bug = false;
    const plot = plots[k === "wet" ? 1 : 2];
    plot.root.classList.remove("swap");
    void plot.root.offsetWidth;
    plot.root.classList.add("swap");
    afterTry(k);
    paint();
    flash("hit-kind");
    const name = HAB[k].name;
    if (on[k]) f.say(`전체 생물의 수(60마리)는 그대로인데 <b>생물의 종류가 4가지 더 늘었어요!</b> ${name}에는 숲과 또 다른 생물들이 살기 때문이에요.`);
    else f.say(`${name}${k === "wet" ? "가" : "이"} 사라지자 그곳에 살던 생물들도 함께 사라져 <b>생물의 종류가 줄어들었어요</b>.`);
  }

  function press(k: Key): void {
    if (phase !== "play") return;
    haptic(HAPTIC.tap);
    if (k === "bug") {
      on.bug = !on.bug;
      const first = !tried.bug;
      afterTry("bug");
      paint();
      if (on.bug) {
        if (first) flash("hit-vary");
        f.say("모두 같은 종류의 무당벌레지만 겉날개의 <b>색깔과 반점 무늬가 저마다</b> 달라요! 이렇게 같은 종류 안에서 나타나는 차이도 생물다양성에 포함돼요.");
      } else f.say("같은 종류의 생물이라도 생김새와 특징이 조금씩 달라요. 세 번째 눈금까지 모두 채워졌어요!");
      return;
    }
    if (!predicted) {
      // 처음 환경을 바꾸기 전에 짐작해 본다(채점하지 않는다)
      predicted = true;
      f.say("환경을 바꾸기 전에 먼저 결과를 예측해 볼까요?");
      f.slot.ask(
        `숲으로만 이루어진 땅의 한 칸을 <b>${HAB[k].name}</b>로 바꾸면 이 지역에 사는 생물의 종류는 어떻게 될까요?`,
        [{ t: "더 늘어난다", ok: true }, { t: "변함없이 그대로이다" }, { t: "오히려 줄어든다" }],
        () => undefined,
        {
          predict: true,
          nextDelay: 650,
          onNext: () => {
            f.slot.showControls();
            toggleHab(k);
          },
        },
      );
      return;
    }
    toggleHab(k);
  }
  KEYS.forEach((k) => cards[k].el.addEventListener("click", () => press(k)));

  doneBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "ask";
    // 세 환경이 다 있는 땅을 보며 답한다
    on.wet = true;
    on.flat = true;
    on.bug = false;
    paint();
    host.dataset.empPhase = phase;
    f.say("숲, 습지, 갯벌이 고루 있는 지역이 됐어요. 전체 생물의 수는 처음과 똑같이 60이에요.");
    f.slot.ask(
      "숲 한 칸을 습지로 바꾸었더니 생물의 종류가 늘어난 까닭은 무엇인가요?",
      [{ t: "환경이 달라지면 그곳에 사는 생물의 종류도 달라지기 때문에", ok: true }, { t: "전체 생물의 마릿수가 처음보다 더 많아졌기 때문에" }, { t: "습지의 넓이가 숲보다 훨씬 더 넓기 때문에" }],
      (ok) => api.recordQuiz(ok),
      { why: "전체 생물의 수는 60으로 같았지만, <b>사는 환경(생태계)이 다양해지면서</b> 각 환경에 어울리는 서로 다른 생물들이 살게 되었기 때문이에요.", onNext: finish },
    );
  });

  function finish(): void {
    phase = "done";
    host.dataset.empPhase = phase;
    f.pips(4);
    f.say("사는 환경, 생물의 종류, 같은 종류 안의 차이까지 생물다양성을 이루는 세 가지를 모두 확인했어요!");
    f.slot.conclude("생물다양성은 <b>생물이 사는 환경(생태계)의 다양함, 생물 종류(종)의 다양함, 같은 종류 안에서 나타나는 특징(변이)의 다양함</b>을 모두 뜻해요. 단순히 생물의 마릿수가 많다고 해서 생물다양성이 높은 것은 아니에요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(3, cards.wet, cards.flat, cards.bug), doneBtn);
  paint();
  host.dataset.empPhase = phase;
  f.say("지금은 세 칸 모두 숲으로만 이루어진 땅이에요. 아래 카드를 눌러 가운데 칸을 <b>습지로 바꿔</b> 보세요.");
  api.setCTA("아래 카드 세 장을 모두 실행해 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
