// [랩의 다른 느낌 샘플 2: 손그림 공책] u2l7 beakIslesLab 「두 섬의 새는 어떻게 달라질까?」를 같은 내용, 같은 통찰로 다시 그린다.
// 정본(steps/bio6/beakIslesLab.ts)과 같은 것: 질문, 예측, 시간 막대(네 눈금), 눈금마다 주인이 바뀌는 자리, 판정 둘, 결론,
//   채점, 검사 표식(data-bki-*), 과학 가드('자연선택', '진화'를 쓰지 않는다. 새 한 마리의 부리는 처음부터 끝까지 그대로다).
// 다른 것은 무대뿐이다. 이 레슨의 도입 만화(다윈의 섬들)와 같은 손으로 그린 장면이다: 굵은 마커 선, 살짝 어긋난 색, 종이 바탕.
//   먹이를 잘 먹는 새는 부리에 그 섬의 먹이(씨앗, 곤충)를 물고 있다. 알맞지 않은 부리의 새는 물지 못한 채 있다가 사라지고,
//   그 자리에 갓 깬 새끼가 나타나 어린 새(조금 작고 빛깔이 옅다)가 된다. 어린 새는 다음 눈금에 다 자란다.
//   그래서 멈춘 화면에서도 누가 잘 먹는지, 어느 자리의 주인이 바뀌었는지가 보인다(부리 색만 바뀐 것처럼 읽히지 않는다).
// 그림: 새 발주 없음. 조각은 qa/labstyle/sketch-beak.mjs가 손그림 엔진으로 뽑아 둔 것(src/ui/labSketch.generated.ts)이고,
//   앱은 그 조각을 자리에 놓고 갈아 끼울 뿐이다. 움직임은 CSS와 타이머만 쓴다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { LSH_BEAK_COLOR, LSH_BEAK_TIP, LSH_DEFS, LSH_H, LSH_HALF, LSH_SCENE, LSH_SEATS, LSH_SEGS, LSH_W } from "../../../ui/labSketch.generated";
import type { StepRenderer } from "../../types";
import { bvFrame, bvRange, bvTimers } from "../bio6/b6Lab";

interface BkiStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Beak = "T" | "L" | "S"; // 두꺼운, 긴, 짧은
type Isle = "A" | "B";
const LABEL: Record<Beak, string> = { T: "두꺼운 부리", L: "긴 부리", S: "짧은 부리" };

// 무리의 처음 모습과 눈금마다 바뀌는 자리는 정본과 같다.
const START: Beak[] = ["T", "L", "S", "S", "T", "L", "L", "S", "T"];
const TURN: Record<Isle, number[][]> = {
  A: [[2, 5], [3, 6], [1, 7]], // 섬 (가): 두꺼운 부리가 남는다
  B: [[2, 8], [3, 0], [7, 4]], // 섬 (나): 긴 부리가 남는다
};
const FAV: Record<Isle, Beak> = { A: "T", B: "L" };

function flockAt(isle: Isle, step: number): Beak[] {
  const f = [...START];
  for (let k = 0; k < step; k++) TURN[isle][k].forEach((i) => (f[i] = FAV[isle]));
  return f;
}

const INK = "#1c1c1e";
const use = (id: string): string => `<use href="#lsh-${id}"/>`;
/** 글자 크기는 설계 판(346×230)의 세 배 좌표다. 37.5는 화면에서 12.5px. */
const text = (x: number, y: number, size: number, weight: number, body: string, fill = INK): string =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" stroke="none">${body}</text>`;

function stageSvg(): string {
  const isle = (k: Isle): string => {
    const ox = k === "A" ? 0 : LSH_HALF;
    const name = k === "A" ? "섬 (가)" : "섬 (나)";
    const food = k === "A" ? "크고 단단한 씨앗" : "나무 속 작은 곤충";
    const seats = LSH_SEATS.map(
      ([x, y], i) =>
        `<g transform="translate(${ox + x} ${y})"><g class="lsh-slot" data-i="${i}"></g></g>`,
    ).join("");
    const segs = LSH_SEGS[k].map((sg, i) => `<path class="lsh-seg" data-i="${i}" d="${sg.fill}"/><path d="${sg.ink}" stroke="${INK}" stroke-width="5"/>`).join("");
    return `
    <g class="lsh-isle" data-isle="${k}">
      ${text(ox + 30, 62, 42, 800, name)}
      ${text(ox + 30, 118, 37.5, 700, `<tspan fill="#5C564A">먹이: </tspan><tspan font-weight="800">${food}</tspan>`)}
      ${seats}
      ${segs}
    </g>`;
  };
  const legend = ([["T", 188], ["L", 530], ["S", 826]] as [Beak, number][]).map(([b, x]) => text(x, 668, 37.5, 700, LABEL[b], "#3A362E")).join("");
  return `<svg class="lsh-svg" viewBox="0 0 ${LSH_W} ${LSH_H}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="먹이가 다른 두 섬에 사는 새 무리">
    <defs>${LSH_DEFS}</defs>
    ${LSH_SCENE}
    ${isle("A")}${isle("B")}
    ${legend}
  </svg>`;
}

export const beakIslesSketch: StepRenderer = (host, step, api) => {
  const s = step as unknown as BkiStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 3, cls: "ls-paper lsh-stage", qCls: "bki-q" });
  host.classList.add("ls-sketch");
  f.stage.innerHTML = stageSvg();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;

  let cur = -1;
  let phase: "predict" | "time" | "ask" | "done" = "predict";
  let reachedEnd = false;
  const shown: Record<Isle, Beak[]> = { A: [], B: [] };
  const shownKey: Record<Isle, string[]> = { A: [], B: [] };

  /** 새 한 마리(발밑이 원점). 어린 새는 조금 작고 빛깔이 옅다. 먹이를 잘 먹는 다 자란 새는 부리 끝에 그 섬의 먹이를 문다. */
  const birdSvg = (b: Beak, isle: Isle, young: boolean, fed: boolean): string => {
    const [tx, ty] = LSH_BEAK_TIP[b];
    const food = fed ? `<g transform="translate(${tx - 4} ${ty + 2})">${use(isle === "A" ? "seed" : "bug")}</g>` : "";
    return `<g transform="scale(${young ? 0.8 : 1})">${use(young ? `${b}y` : b)}${food}</g>`;
  };

  /** 눈금 n의 무리를 그린다. 주인이 바뀐 자리는 앞의 새가 사라지고, 갓 깬 새끼가 나타나 어린 새가 된다. */
  function render(n: number, animate: boolean): void {
    (["A", "B"] as const).forEach((isle) => {
      const flock = flockAt(isle, n);
      const root = svg.querySelector(`.lsh-isle[data-isle="${isle}"]`) as SVGGElement;
      const newborn = n >= 1 ? TURN[isle][n - 1] : [];
      flock.forEach((b, i) => {
        const slot = root.querySelector(`.lsh-slot[data-i="${i}"]`) as SVGGElement;
        const young = newborn.includes(i);
        // 시간이 흐르기 시작하면(눈금 1부터) 이 섬의 먹이에 알맞은 부리의 다 자란 새만 먹이를 물고 있다
        const fed = n >= 1 && b === FAV[isle] && !young;
        const key = `${b}${young ? "y" : ""}${fed ? "f" : ""}`;
        const prevKey = shownKey[isle][i];
        if (prevKey === key && slot.childElementCount) return;
        const prev = shown[isle][i];
        const forward = animate && prev !== undefined && n > cur;
        const d = (0.3 + (i % 3) * 0.09).toFixed(2);
        if (forward && prev !== b) {
          slot.innerHTML = `<g class="lsh-gone">${birdSvg(prev, isle, false, false)}</g><g class="lsh-chk" style="--d:${d}s">${use("chick")}</g><g class="lsh-born" style="--d:${d}s">${birdSvg(b, isle, young, fed)}</g>`;
        } else if (forward && prevKey?.includes("y") && !young) {
          slot.innerHTML = `<g class="lsh-grow">${birdSvg(b, isle, false, fed)}</g>`; // 어린 새가 다 자란다
        } else {
          slot.innerHTML = `<g>${birdSvg(b, isle, young, fed)}</g>`;
        }
        shownKey[isle][i] = key;
      });
      shown[isle] = flock;
      // 구성 칸: 두꺼운, 긴, 짧은 순서로 모아 칠한다
      const order: Beak[] = ["T", "L", "S"];
      const sorted = order.flatMap((k) => flock.filter((x) => x === k));
      root.querySelectorAll<SVGPathElement>(".lsh-seg").forEach((seg, i) => seg.setAttribute("fill", LSH_BEAK_COLOR[sorted[i]]));
      host.dataset[isle === "A" ? "bkiA" : "bkiB"] = order.map((k) => flock.filter((x) => x === k).length).join(",");
    });
    cur = n;
    host.dataset.bkiStep = String(n);
  }

  const SAY = [
    "처음 모습이에요. 두 섬에 내려앉은 새 무리는 <b>똑같았어요</b>.",
    "먹이를 잘 먹는 새가 더 많이 살아남아 <b>새끼</b>를 낳았어요. 새끼의 부리는 어미를 닮아요.",
    "섬 (가)에는 <b>두꺼운 부리</b>의 새가, 섬 (나)에는 <b>긴 부리</b>의 새가 점점 늘어요.",
    "오랜 시간 뒤, 두 섬의 새 무리가 <b>서로 달라졌어요</b>.",
  ];

  const range = bvRange({
    cls: "bki-range",
    min: 0,
    max: 3,
    value: 0,
    label: "밀어서 시간 흐르게 하기",
    ticks: ["처음", "오랜 시간 뒤"],
    onInput: (v) => {
      if (phase !== "time" || v === cur) return;
      haptic(HAPTIC.tap);
      render(v, true);
      f.say(SAY[v]);
      if (v === 3 && !reachedEnd) {
        reachedEnd = true;
        f.pips(1);
        // 새끼가 다 자라고, 달라진 두 무리를 볼 시간을 준 뒤 묻는다
        tm.later(ask1, 2400);
      }
    },
  });

  function ask1(): void {
    if (phase !== "time") return;
    phase = "ask";
    host.dataset.bkiPhase = phase;
    range.set(3);
    render(3, false);
    f.say("섬 (가)에는 두꺼운 부리의 새만, 섬 (나)에는 긴 부리의 새만 남았어요.");
    f.slot.ask(
      "섬 (가)에 두꺼운 부리의 새만 남은 까닭은?",
      [{ t: "두꺼운 부리의 새가 더 많이 살아남아서", ok: true }, { t: "새들이 부리를 두껍게 바꿔서" }, { t: "다른 새들이 섬 (나)로 날아가서" }],
      (ok) => api.recordQuiz(ok),
      { why: "부리를 바꾼 새는 없었어요. <b>씨앗을 잘 깨는 새</b>가 살아남아 새끼를 낳았죠.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(2);
    f.say("이번에는 새 한 마리 한 마리를 떠올려 봐요. 부리가 달라진 새가 있었나요?");
    f.slot.ask(
      "그동안 새 한 마리 한 마리의 부리 모양은?",
      [{ t: "타고난 모양 그대로였다", ok: true }, { t: "먹이에 맞게 조금씩 변했다" }, { t: "많이 쓸수록 모양이 달라졌다" }],
      () => undefined,
      { why: "새 한 마리의 부리는 타고난 모양 그대로였어요. 달라진 것은 <b>무리를 이루는 새</b>예요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    host.dataset.bkiPhase = phase;
    f.pips(3);
    f.say("두 섬의 새가 달라진 까닭을 알아냈어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("환경에 알맞은 변이를 가진 새가 <b>더 많이 살아남아 자손을 남겨요</b>. 그래서 두 섬의 무리가 달라졌어요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el);
  render(0, false);
  host.dataset.bkiPhase = phase;
  f.say("부리 모양이 조금씩 다른 새 한 무리가 <b>두 섬</b>에 나뉘어 살게 됐어요. 먼저 짐작해 봐요.");
  f.slot.ask(
    "씨앗이 많은 섬 (가)에는 어떤 새가 많아질까요?",
    [{ t: "두꺼운 부리의 새", ok: true }, { t: "긴 부리의 새" }, { t: "짧은 부리의 새" }],
    () => undefined,
    {
      predict: true,
      nextDelay: 700,
      onNext: () => {
        phase = "time";
        host.dataset.bkiPhase = phase;
        f.slot.showControls();
        f.say("이제 아래 막대를 밀어 <b>시간</b>을 흘려 보내세요. 두 섬을 함께 지켜봐요.");
      },
    },
  );
  api.setCTA("시간을 끝까지 흘려 보내세요", { enabled: false });
  return () => tm.clear();
};
