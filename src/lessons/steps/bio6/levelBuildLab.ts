// [중1 Ⅱ v5] u2l5 levelBuildLab: 「세포가 모이면 무엇이 될까?」
// 한 통찰: 생물의 몸은 세포가 그냥 모인 것이 아니라 세포, 조직, 기관, 개체의 단계를 거쳐 이루어진다.
//   동물에는 기관계가, 식물에는 조직계가 한 단계 더 있다.
// 조작: 막대를 밀면 그림이 더 큰 단계로 넓어지고(작은 것이 큰 것 속의 한 자리가 된다), 오른쪽 계단에 단계 이름이 아래에서부터 쌓인다.
//   동물: 상피세포 → 상피조직 → 위 → 소화계 → 사람.  식물: 잎살세포 → 울타리 조직 → 기본 조직계 → 잎 → 나무.
//   두 계단을 다 쌓으면 "두 계단 견주어 보기"가 뜨고, 나란히 놓인 두 계단을 보며 판정 두 번(첫 판정만 채점).
// 그림: 동물 쪽 네 장은 v4 브랜치 발주본의 사본(public/bio6/levels), 사람과 식물 쪽은 구작(public/bio2/levels).
// 넓어지는 움직임: 다음 단계 그림 속의 한 자리(ANCHOR)에서 화면 가득 보이던 시야가 그림 전체로 물러난다.
//   앞 단계 그림은 그 자리에 놓인 채 함께 작아지다 사라진다(두 그림이 똑같지는 않아서 겹쳐 넘긴다). 그림 상자는 한 변 196px.
// 움직임은 막대 값의 함수라 타이머가 필요 없다. 손을 떼면 가까운 단계로 맞춰 준다(타이머 보간).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvRange, bvTimers, bvTween, type BvCard } from "./b6Lab";

interface BlvStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Route = "animal" | "plant";
interface Level {
  rank: string;
  name: string;
  img: string;
  say: string;
}
interface RouteDef {
  card: string;
  sub: string;
  levels: Level[];
  /** k번째 그림이 k+1번째 그림 속에서 놓이는 자리(그림 중심에서의 px, 196px 상자 기준)와 크기 비. */
  anchor: [number, number, number][];
}

const ROUTES: Record<Route, RouteDef> = {
  animal: {
    card: "동물",
    sub: "사람의 몸",
    levels: [
      { rank: "세포", name: "상피세포", img: "bio6/levels/epi-cell.webp", say: "<b>상피세포</b> 하나예요. 아래 막대를 밀어 세포를 모아 보세요." },
      { rank: "조직", name: "상피조직", img: "bio6/levels/epi-tissue.webp", say: "모양과 하는 일이 비슷한 세포가 모여 <b>조직</b>이 됐어요. 상피조직이에요." },
      { rank: "기관", name: "위", img: "bio6/levels/stomach.webp", say: "여러 조직이 모여 고유한 모양과 기능을 가진 <b>기관</b>이 됐어요. 위예요." },
      { rank: "기관계", name: "소화계", img: "bio6/levels/digestive.webp", say: "위, 작은창자처럼 관련된 일을 하는 기관이 모여 <b>기관계</b>가 됐어요. 소화계예요." },
      { rank: "개체", name: "사람", img: "bio2/levels/human.webp", say: "여러 기관계가 모여 하나의 생물, <b>개체</b>가 됐어요. 사람이에요." },
    ],
    anchor: [[0, 2, 0.24], [30, 2, 0.26], [15, -4, 0.2], [0, -30, 0.6]],
  },
  plant: {
    card: "식물",
    sub: "나무의 몸",
    levels: [
      { rank: "세포", name: "잎살세포", img: "bio2/levels/leaf-cell.webp", say: "잎을 이루는 <b>잎살세포</b> 하나예요. 막대를 밀어 세포를 모아 보세요." },
      { rank: "조직", name: "울타리 조직", img: "bio2/levels/palisade.webp", say: "비슷한 세포가 모여 <b>조직</b>이 됐어요. 울타리 조직이에요." },
      { rank: "조직계", name: "기본 조직계", img: "bio2/levels/tissue-system.webp", say: "여러 조직이 모여 <b>조직계</b>가 됐어요. 동물의 계단에는 없던 단계예요." },
      { rank: "기관", name: "잎", img: "bio2/levels/leaf.webp", say: "조직계가 모여 <b>기관</b>이 됐어요. 잎이에요. 뿌리와 줄기도 기관이에요." },
      { rank: "개체", name: "나무", img: "bio2/levels/tree.webp", say: "기관이 모여 하나의 생물, <b>개체</b>가 됐어요. 나무예요." },
    ],
    anchor: [[-17, 0, 0.19], [0, -24, 0.5], [8, 4, 0.22], [26, -42, 0.1]],
  },
};
const ORDER: Route[] = ["animal", "plant"];

const ramp = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const levelBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BlvStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 3, cls: "blv-stage", qCls: "blv-q", api });
  const canvas = bvCanvas(f.stage);

  // ── 무대: 왼쪽 그림 상자, 오른쪽 계단 ─────────────────────────────
  const solo = el("div", { class: "blv-solo" });
  const pic = el("div", { class: "blv-pic" });
  const glow = el("div", { class: "blv-glow" });
  pic.appendChild(glow);
  const imgs: Record<Route, HTMLImageElement[]> = { animal: [], plant: [] };
  ORDER.forEach((r) =>
    ROUTES[r].levels.forEach((lv) => {
      const im = el("img", { class: "blv-img", attrs: { src: bvSrc(lv.img), alt: "", draggable: "false" } }) as HTMLImageElement;
      im.style.opacity = "0";
      imgs[r].push(im);
      pic.appendChild(im);
    }),
  );
  const nameTag = el("div", { class: "blv-name" });
  const ladder = el("div", { class: "blv-ladder" });
  const rungs = Array.from({ length: 5 }, () => el("div", { class: "blv-rung" }, el("b"), el("span")));
  // 아래에서부터 쌓이게: 0번(세포)이 맨 아래
  [...rungs].reverse().forEach((r) => ladder.appendChild(r));
  solo.append(pic, nameTag, ladder);

  // ── 무대: 두 계단을 나란히 ───────────────────────────────────────
  const duo = el("div", { class: "blv-duo" });
  ORDER.forEach((r) => {
    const col = el("div", { class: `blv-col ${r}` }, el("div", { class: "blv-col-h", text: `${ROUTES[r].card}의 계단` }));
    [...ROUTES[r].levels].reverse().forEach((lv) => {
      const only = lv.rank === "기관계" || lv.rank === "조직계";
      col.appendChild(el("div", { class: `blv-step${only ? " only" : ""}` }, el("b", { text: lv.rank }), el("span", { text: lv.name })));
    });
    duo.appendChild(col);
  });
  canvas.el.append(solo, duo);

  // ── 상태 ─────────────────────────────────────────────────────────
  let route: Route = "animal";
  let phase: "build" | "duo" | "done" = "build";
  const top: Record<Route, number> = { animal: 0, plant: 0 }; // 지금까지 쌓은 가장 높은 단계
  const finished: Record<Route, boolean> = { animal: false, plant: false };
  let snapping = false;

  const cards = {} as Record<Route, BvCard>;
  ORDER.forEach((r) => {
    const last = ROUTES[r].levels[4];
    cards[r] = bvCard("blv-card", { name: ROUTES[r].card, sub: ROUTES[r].sub, icon: `<img src="${bvSrc(last.img)}" alt="" draggable="false" />`, key: r });
  });
  const cmpBtn = bvBtn("main blv-cmp", "두 계단 견주어 보기");
  cmpBtn.hidden = true;

  const mark = (level: number): void => {
    host.dataset.blvRoute = route;
    host.dataset.blvLevel = String(level);
    host.dataset.blvDone = ORDER.filter((r) => finished[r]).join(",");
    host.dataset.blvPhase = phase;
  };

  /** 막대 값(0~400)에 맞춰 그림 두 장을 놓는다. */
  function paint(v: number): void {
    const R = ROUTES[route];
    const L = Math.min(3, Math.floor(v / 100));
    const fr = Math.max(0, Math.min(1, (v - L * 100) / 100));
    const [ax, ay, sc] = R.anchor[L];
    const t = ramp(0, 1, fr);
    const k = Math.pow(1 / sc, 1 - t); // 다음 그림의 확대 비: 1/sc(앞 그림이 화면 가득)에서 1로
    const cx = ax * (1 - t); // 시야의 중심: 자리(ANCHOR)에서 그림 한가운데로
    const cy = ay * (1 - t);
    imgs[route].forEach((im, i) => {
      if (i === L) {
        im.style.opacity = String(1 - ramp(0.45, 0.9, fr));
        im.style.transform = `translate(${((ax - cx) * k).toFixed(2)}px, ${((ay - cy) * k).toFixed(2)}px) scale(${(k * sc).toFixed(4)})`;
      } else if (i === L + 1) {
        im.style.opacity = String(ramp(0.25, 0.8, fr));
        im.style.transform = `translate(${(-cx * k).toFixed(2)}px, ${(-cy * k).toFixed(2)}px) scale(${k.toFixed(4)})`;
      } else im.style.opacity = "0";
    });
    ORDER.filter((r) => r !== route).forEach((r) => imgs[r].forEach((im) => (im.style.opacity = "0")));
    const near = Math.round(v / 100);
    nameTag.textContent = R.levels[near].name;
    nameTag.classList.toggle("dim", Math.abs(v - near * 100) > 18);
  }

  function drawLadder(): void {
    const R = ROUTES[route];
    rungs.forEach((r, i) => {
      const on = i <= top[route];
      r.classList.toggle("on", on);
      (r.children[0] as HTMLElement).textContent = on ? R.levels[i].rank : "";
      (r.children[1] as HTMLElement).textContent = on ? R.levels[i].name : "";
    });
  }

  /** 단계 하나에 닿았다(손을 뗀 자리). */
  function settle(level: number): void {
    const R = ROUTES[route];
    if (level > top[route]) {
      top[route] = level;
      haptic(HAPTIC.tap);
      drawLadder();
      rungs[level].classList.add("pop");
      tm.later(() => rungs[level].classList.remove("pop"), 420);
    }
    let say = R.levels[level].say;
    if (level === 4 && !finished[route]) {
      finished[route] = true;
      cards[route].done();
      f.pips(ORDER.filter((r) => finished[r]).length);
      const other = ORDER.find((r) => !finished[r]);
      if (other) say += ` 이번에는 <b>${ROUTES[other].card}</b>을 골라 봐요.`;
      else {
        // 마지막 계단을 볼 시간을 준 뒤 버튼을 띄운다
        tm.later(() => {
          cmpBtn.hidden = false;
          range.el.hidden = true;
          f.say("두 계단을 다 쌓았어요. 이제 <b>두 계단을 나란히</b> 놓고 견주어 봐요.");
        }, 1300);
      }
    }
    f.say(say);
    sayKey = `L${level}`;
    mark(level);
  }

  /** 막대를 끄는 동안의 안내 글: 그림이 어느 단계에 와 있으면 그 단계의 글, 단계 사이를 지나는 중이면 '막대를 미는 중'.
   *  (그림은 다음 단계로 넘어갔는데 글은 앞 단계를 말하는 일이 없게 한다. 경계에서 깜빡이지 않게 들어올 때와 나갈 때의 문턱을 달리 둔다.) */
  let sayKey = "L0";
  const MOVING = "막대를 미는 중이에요. 손을 떼면 무엇이 됐는지 알 수 있어요.";
  function narrate(v: number): void {
    const near = Math.round(v / 100);
    const dist = Math.abs(v - near * 100);
    const at = sayKey === `L${near}` ? dist <= 26 : dist <= 14;
    const key = at ? `L${near}` : "moving";
    if (key === sayKey) return;
    sayKey = key;
    f.say(at ? ROUTES[route].levels[near].say : MOVING);
  }

  const range = bvRange({
    cls: "blv-range",
    min: 0,
    max: 400,
    value: 0,
    label: "밀어서 모으기",
    ticks: ["세포", "", "", "", "개체"],
    onInput: (v) => {
      if (phase !== "build") return;
      paint(v);
      if (!snapping) narrate(v);
      // 지나간 단계는 그 자리에서 계단에 쌓인다
      const passed = Math.floor((v + 6) / 100);
      if (passed > top[route]) {
        top[route] = passed;
        drawLadder();
      }
    },
    onChange: (v) => {
      if (phase !== "build" || snapping) return;
      const to = Math.round(v / 100) * 100;
      snapping = true;
      bvTween(
        tm,
        Math.abs(to - v) < 2 ? 40 : 200,
        (t) => {
          const x = v + (to - v) * t;
          range.set(Math.round(x));
          paint(x);
        },
        () => {
          snapping = false;
          settle(to / 100);
        },
      );
    },
  });

  function setRoute(r: Route): void {
    if (phase !== "build") return;
    route = r;
    ORDER.forEach((x) => cards[x].on(x === r));
    range.set(0);
    paint(0);
    drawLadder();
    f.say(ROUTES[r].levels[0].say);
    sayKey = "L0";
    mark(0);
  }
  ORDER.forEach((r) =>
    cards[r].el.addEventListener("click", () => {
      if (phase !== "build" || r === route) return;
      haptic(HAPTIC.tap);
      setRoute(r);
    }),
  );

  // ── 두 계단 견주기(판정) ─────────────────────────────────────────
  cmpBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "duo";
    f.stage.classList.add("duo");
    mark(4);
    f.say("왼쪽은 동물, 오른쪽은 식물의 계단이에요. 칸을 하나씩 견주어 봐요.");
    f.slot.ask(
      "동물의 계단에만 있는 단계는 무엇인가요?",
      [{ t: "기관계", ok: true }, { t: "조직계" }, { t: "기관" }],
      (ok) => {
        api.recordQuiz(ok);
        f.stage.classList.add("reveal"); // 답한 뒤에야 서로 다른 칸에 색을 입힌다
      },
      { why: "동물은 기관이 모여 <b>기관계</b>를 이뤄요. 조직계는 식물의 단계예요.", onNext: ask2 },
    );
  });
  function ask2(): void {
    f.say("이번에는 식물의 계단을 봐요. 조직계가 놓인 자리를 찾아봐요.");
    f.slot.ask(
      "식물의 조직계는 어느 단계 사이에 있나요?",
      [{ t: "조직과 기관 사이", ok: true }, { t: "기관과 개체 사이" }, { t: "세포와 조직 사이" }],
      () => undefined,
      { why: "식물은 세포, 조직, <b>조직계</b>, 기관, 개체의 순서예요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    f.pips(3);
    mark(4);
    f.say("두 계단을 견주어 봤어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("생물의 몸은 <b>세포, 조직, 기관, 개체</b>의 단계로 이루어져요. 동물에는 기관계가, 식물에는 조직계가 더 있어요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(2, cards.animal, cards.plant), range.el, cmpBtn);
  setRoute("animal");
  api.setCTA("두 계단을 끝까지 쌓아 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
