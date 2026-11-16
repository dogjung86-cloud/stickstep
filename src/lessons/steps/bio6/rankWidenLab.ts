// [중1 Ⅱ v5] u2l8 rankWidenLab: 「분류 단계를 넓히면 누구와 한 무리가 될까?」
// 한 통찰: 종에서 계로 갈수록 무리는 커지고 공통점은 줄어든다. 더 작은 단계에서 한 무리가 되는 생물일수록 가까운 사이다.
// 무대: 들고양이부터 꿀벌까지 일곱 동물이 한 줄로 서 있고, 지금의 무리를 나타내는 띠가 왼쪽에서부터 덮는다.
//   동물마다 그 동물이 들어오는 단계의 계단 칸이 바로 아래에 있다(종이 가장 낮고 계가 가장 높다).
// 조작: 막대 하나(종, 속, 과, 목, 강, 문, 계). 밀면 무리가 한 단계씩 넓어지고 새 식구가 들어온다. 되돌리면 좁아진다.
// 흐름: 예측(채점하지 않음) → 막대를 계까지 → 판정(채점).
// 들고양이는 흔히 길고양이의 뜻으로도 쓰는 말이라, 첫 안내에서 야생의 한 종임을 밝히고 속에서 들어오는 고양이는 "집에서 기르는 고양이"라고 부른다.
// 척삭동물문의 안내는 "지금까지 모인 동물들은 모두 등뼈가 있다"로 쓴다(척삭동물이 모두 등뼈가 있는 것은 아니다. 2026-11-16 수정안의
//   "여기에 속한 동물들은"은 척삭동물문 전체를 가리키는 말로 읽혀 쓰지 않았다).
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
  { rank: "종", group: "들고양이종", who: "들고양이", img: "bio6/life/wildcat.webp", say: "들고양이는 자연 상태에서 짝짓기하여 번식 가능한 자손을 낳는 기본 단위인 한 <b>종</b>이에요. 아래 막대를 밀어 분류 단계를 한 칸씩 넓혀 보세요." },
  { rank: "속", group: "고양이속", who: "고양이", img: "bio6/life/cat.webp", say: "<b>고양이속</b>으로 넓히니 집에서 기르는 고양이가 들어왔어요. 생김새가 거의 같아요." },
  { rank: "과", group: "고양이과", who: "사자", img: "bio6/life/lion.webp", say: "<b>고양이과</b>로 넓히니 사자가 들어왔어요. 포함되는 동물이 늘어날수록 모두의 공통점은 줄어요." },
  { rank: "목", group: "식육목", who: "곰", img: "bio6/life/bear.webp", say: "<b>식육목</b>으로 넓히니 곰이 들어왔어요. 사자보다 한 단계 늦게 만났어요." },
  { rank: "강", group: "포유강", who: "다람쥐", img: "bio6/life/chipmunk.webp", say: "<b>포유강</b>으로 넓히니 다람쥐가 들어왔어요. 모두 새끼에게 젖을 먹여 키워요." },
  { rank: "문", group: "척삭동물문", who: "갈매기", img: "bio6/life/gull.webp", say: "<b>척삭동물문</b>으로 넓히니 갈매기가 들어왔어요. 지금까지 모인 동물들은 모두 몸속에 등뼈가 있어요." },
  { rank: "계", group: "동물계", who: "꿀벌", img: "bio/bee.webp", say: "<b>동물계</b>까지 넓히니 꿀벌도 들어왔어요. 가장 큰 단계에서야 만났어요." },
];
const N = RANKS.length;
const PITCH = 48;
const X0 = 5;

export const rankWidenLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RkwStep;
  const tm = bvTimers();
  // 세 줄 도움말을 처음부터 잡아 둔다(종 단계의 글이 세 줄이다. 랩 도중에 무대가 밀리지 않게)
  const f = bvFrame(host, { title: s.title, steps: 2, cls: "rkw-stage", qCls: "rkw-q", api, tall: true });
  const canvas = bvCanvas(f.stage);

  // ── 무대 ─────────────────────────────────────────────────────────
  const groupName = el("b", { text: RANKS[0].group });
  const head = el("div", { class: "rkw-head" }, el("span", { text: "지금의 무리" }), groupName);
  const famN = el("b", { text: "1" });
  const dots = Array.from({ length: N }, () => el("i"));
  const stats = el(
    "div",
    { class: "rkw-stats" },
    el("div", { class: "rkw-stat" }, el("span", { text: "포함된 동물" }), famN),
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
    label: "막대를 밀어 분류 단계 넓히기",
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
    f.say("동물계까지 넓히니 일곱 동물이 모두 한 무리가 됐어요! 각 동물이 어느 단계에서 합류했는지 확인해 보세요.");
    f.slot.ask(
      "사자, 곰, 다람쥐 가운데 들고양이와 가장 먼 사이인 동물은 누구인가요?",
      [{ t: "다람쥐", ok: true }, { t: "곰" }, { t: "사자" }],
      (ok) => api.recordQuiz(ok),
      { why: "사자는 '과', 곰은 '목'에서 한 무리가 되지만 다람쥐는 더 큰 단계인 <b>'강'(포유강)</b>에서야 만나요. 큰 단계에서 만날수록 먼 사이예요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    host.dataset.rkwPhase = phase;
    f.pips(2);
    f.say("종에서 계까지 분류 단계를 넓혀 가며 누가 들고양이와 더 가까운 사이인지 한눈에 확인했어요!");
    f.slot.conclude("생물의 분류 단계는 <b>종, 속, 과, 목, 강, 문, 계</b> 순으로 넓어져요. 큰 단계로 갈수록 포함되는 생물은 많아지고 공통점은 줄어들며, <b>작은 단계에서 함께 묶이는 생물일수록 더 가까운 사이</b>예요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el);
  paint(0);
  f.say("야생에 사는 들고양이와 분류 단계를 넓혀 가며 만날 동물들이에요. 먼저 예측해 볼까요?");
  f.slot.ask(
    "다람쥐와 갈매기 가운데 누가 더 작은 단계에서 먼저 들고양이와 한 무리가 될까요?",
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
  api.setCTA("분류 단계를 '계'까지 끝까지 넓혀 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
