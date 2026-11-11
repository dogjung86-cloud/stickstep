// [중1 Ⅱ v5] u2l8 rankWidenLab: 「무리를 넓히면 누구를 만날까?」
// 한 통찰: 종에서 계로 갈수록 무리는 커지고 공통점은 줄어든다. 더 작은 단계에서 한 무리가 되는 생물일수록 가까운 사이다.
// 무대: 들고양이부터 꿀벌까지 일곱 동물이 한 줄로 서 있고, 지금의 무리를 나타내는 띠가 왼쪽에서부터 덮는다.
//   동물마다 그 동물이 들어오는 단계의 계단 칸이 바로 아래에 있다(종이 가장 낮고 계가 가장 높다).
// 조작: 막대 하나(종, 속, 과, 목, 강, 문, 계). 밀면 무리가 한 단계씩 넓어지고 새 식구가 들어온다. 되돌리면 좁아진다.
// 흐름: 예측(채점하지 않음) → 막대를 계까지 → 판정(채점).
// 들고양이는 흔히 길고양이의 뜻으로도 쓰는 말이라, 첫 안내에서 야생의 한 종임을 밝히고 속에서 들어오는 고양이는 "집에서 기르는 고양이"라고 부른다.
// 척삭동물문의 안내는 "지금 식구는 모두 등뼈가 있다"로 쓴다(척삭동물이 모두 등뼈가 있는 것은 아니다).
// 사실(들고양이의 자리는 원전 그림 그대로): 들고양이종, 고양이속(고양이), 고양이과(사자), 식육목(곰), 포유강(다람쥐),
//   척삭동물문(갈매기), 동물계(꿀벌). 영상이 사자와 곰을 견주어 말하므로 판정은 다람쥐까지 넣어 새로 묻는다.
// 그림: 들고양이, 사자, 곰, 다람쥐, 갈매기는 v4 브랜치 발주본의 사본, 고양이는 구작에서 잘라 낸 것, 꿀벌은 구작(public/bio).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvFrame, bvRange, bvTimers } from "./b6Lab";

interface RkwStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

interface Rank {
  rank: string;
  group: string;
  who: string;
  img: string;
  say: string;
}
const RANKS: Rank[] = [
  { rank: "종", group: "들고양이종", who: "들고양이", img: "bio6/life/wildcat.webp", say: "들고양이는 야생에 사는 고양이의 한 <b>종</b>이에요. 막대를 밀어 무리를 한 단계씩 넓혀 보세요." },
  { rank: "속", group: "고양이속", who: "고양이", img: "bio6/life/cat.webp", say: "<b>고양이속</b>으로 넓히니 집에서 기르는 고양이가 들어왔어요. 생김새가 거의 같아요." },
  { rank: "과", group: "고양이과", who: "사자", img: "bio6/life/lion.webp", say: "<b>고양이과</b>로 넓히니 사자가 들어왔어요. 식구가 늘수록 모두의 공통점은 줄어요." },
  { rank: "목", group: "식육목", who: "곰", img: "bio6/life/bear.webp", say: "<b>식육목</b>으로 넓히니 곰이 들어왔어요. 사자보다 한 단계 늦게 만났어요." },
  { rank: "강", group: "포유강", who: "다람쥐", img: "bio6/life/chipmunk.webp", say: "<b>포유강</b>으로 넓히니 다람쥐가 들어왔어요. 모두 새끼에게 젖을 먹여 키워요." },
  { rank: "문", group: "척삭동물문", who: "갈매기", img: "bio6/life/gull.webp", say: "<b>척삭동물문</b>으로 넓히니 갈매기가 들어왔어요. 지금 식구는 모두 몸속에 등뼈가 있어요." },
  { rank: "계", group: "동물계", who: "꿀벌", img: "bio/bee.webp", say: "<b>동물계</b>까지 넓히니 꿀벌도 들어왔어요. 가장 큰 단계에서야 만났어요." },
];
const N = RANKS.length;
const PITCH = 48;
const X0 = 5;

export const rankWidenLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RkwStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 2, cls: "rkw-stage", qCls: "rkw-q" });
  const canvas = bvCanvas(f.stage);

  // ── 무대 ─────────────────────────────────────────────────────────
  const groupName = el("b", { text: RANKS[0].group });
  const head = el("div", { class: "rkw-head" }, el("span", { text: "지금의 무리" }), groupName);
  const famN = el("b", { text: "1" });
  const dots = Array.from({ length: N }, () => el("i"));
  const stats = el(
    "div",
    { class: "rkw-stats" },
    el("div", { class: "rkw-stat" }, el("span", { text: "식구" }), famN),
    el("div", { class: "rkw-stat" }, el("span", { text: "모두의 공통점" }), el("div", { class: "rkw-dots" }, ...dots)),
  );
  const band = el("div", { class: "rkw-band" });
  const toks = RANKS.map((r, i) => {
    const t = el(
      "div",
      { class: "rkw-tok" },
      el("div", { class: "rkw-face" }, el("img", { attrs: { src: bvSrc(r.img), alt: "", draggable: "false" } })),
      el("b", { text: r.who }),
    );
    t.style.left = `${X0 + i * PITCH}px`;
    return t;
  });
  const stairs = RANKS.map((r, i) => {
    const h = 10 + i * 7;
    const st = el("div", { class: "rkw-stair" }, el("b", { text: r.rank }), el("i"));
    st.style.left = `${X0 + i * PITCH + 4}px`;
    (st.lastElementChild as HTMLElement).style.height = `${h}px`;
    return st;
  });
  const axis = el("div", { class: "rkw-axis" }, el("span", { text: "가까운 사이" }), el("i"), el("span", { text: "먼 사이" }));
  canvas.el.append(head, stats, band, ...toks, axis, ...stairs);

  // ── 상태 ─────────────────────────────────────────────────────────
  let level = -1;
  let phase: "predict" | "widen" | "ask" | "done" = "predict";
  let reachedEnd = false;

  function paint(n: number): void {
    const grew = n > level;
    groupName.textContent = RANKS[n].group;
    famN.textContent = String(n + 1);
    dots.forEach((d, i) => d.classList.toggle("on", i < N - n));
    band.style.width = `${(n + 1) * PITCH + 2}px`;
    toks.forEach((t, i) => {
      const inside = i <= n;
      t.classList.toggle("in", inside);
      if (grew && i === n && n > 0) {
        t.classList.remove("join");
        void t.offsetWidth;
        t.classList.add("join");
      }
    });
    stairs.forEach((st, i) => {
      st.classList.toggle("on", i <= n);
      st.classList.toggle("cur", i === n);
    });
    level = n;
    host.dataset.rkwLevel = String(n);
    host.dataset.rkwPhase = phase;
  }

  const range = bvRange({
    cls: "rkw-range",
    min: 0,
    max: N - 1,
    value: 0,
    label: "밀어서 무리 넓히기",
    ticks: RANKS.map((r, i) => ({ t: r.rank, p: (i / (N - 1)) * 100 })),
    onInput: (v) => {
      if (phase !== "widen" || v === level) return;
      haptic(HAPTIC.tap);
      paint(v);
      f.say(RANKS[v].say);
      if (v === N - 1 && !reachedEnd) {
        reachedEnd = true;
        f.pips(1);
        tm.later(ask, 1900);
      }
    },
  });

  function ask(): void {
    if (phase !== "widen") return;
    phase = "ask";
    range.set(N - 1);
    paint(N - 1);
    f.stage.classList.add("end");
    f.say("일곱 동물이 모두 한 무리가 됐어요. 누가 어느 단계에서 들어왔는지 계단을 봐요.");
    f.slot.ask(
      "사자, 곰, 다람쥐 가운데 들고양이와 가장 먼 동물은?",
      [{ t: "다람쥐", ok: true }, { t: "곰" }, { t: "사자" }],
      (ok) => api.recordQuiz(ok),
      { why: "다람쥐는 <b>강</b>에서야 만났어요. 큰 단계에서 만날수록 먼 사이예요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    host.dataset.rkwPhase = phase;
    f.pips(2);
    f.say("무리를 계까지 넓혀 봤어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("종에서 계로 갈수록 무리는 커지고 공통점은 줄어요. <b>작은 단계에서 만나는 생물일수록 가까운 사이</b>예요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el);
  paint(0);
  f.say("야생에 사는 들고양이와 같은 무리가 될 동물들이에요. 넓히기 전에 먼저 짐작해 봐요.");
  f.slot.ask(
    "누가 먼저 들고양이와 한 무리가 될까요?",
    [{ t: "다람쥐", ok: true }, { t: "갈매기" }],
    () => undefined,
    {
      predict: true,
      nextDelay: 700,
      onNext: () => {
        phase = "widen";
        host.dataset.rkwPhase = phase;
        f.pips(0);
        f.slot.showControls();
        f.say(RANKS[0].say);
      },
    },
  );
  api.setCTA("무리를 계까지 넓혀 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
