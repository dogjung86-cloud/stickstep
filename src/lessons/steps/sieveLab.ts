// sieveLab — 에라토스테네스의 체(L1 기함 랩). 상호작용 자체가 알고리즘이다:
// "남은 수 중 가장 작은 수를 찾아 탭" → 그 수는 남고 배수가 연쇄로 쓸려 나간다.
// 2→3→5→7을 직접 찾아 탭하면 1~60에서 소수 17개만 남는다(11²=121>60이라 7에서 끝).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SieveStep {
  title: string;
  lead?: string;
  max?: number;
  cta?: string;
  curio?: Curio;
}

export const sieveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SieveStep;
  const MAX = s.max ?? 60;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "p2", label: "2의 배수", sub: "쓸어내기" },
    { id: "p3", label: "3의 배수", sub: "쓸어내기" },
    { id: "p57", label: "5와 7", sub: "마무리" },
  ]);
  const board = mboard(0);
  const toast = mtoast(board);
  const grid = el("div", { class: "sv-grid", attrs: { role: "group", "aria-label": "1부터 60까지 수 격자" } });
  board.appendChild(grid);
  const helper = el("div", {
    class: "helper",
    html: "먼저 <b>1</b>부터 정리할게요 — 1은 약수가 1개뿐이라 소수도 합성수도 아니에요.",
  });
  host.append(goals.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const alive = new Set<number>();
  const cells = new Map<number, HTMLButtonElement>();
  for (let v = 1; v <= MAX; v++) {
    const c = el("button", {
      class: `sv-cell ${v === 1 ? "one" : ""}`,
      text: String(v),
      attrs: { type: "button", "aria-label": `${v}` },
    }) as HTMLButtonElement;
    grid.appendChild(c);
    cells.set(v, c);
    alive.add(v);
  }

  const PRIMES_STEPS = [2, 3, 5, 7];
  let stage = -1; // -1: 1 정리 전, 0..3: 2·3·5·7 찾는 중, 4: 완료
  let sweeping = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  function sweep(p: number, done: () => void): void {
    sweeping = true;
    cells.get(p)!.classList.add("keep");
    const targets: number[] = [];
    for (let v = p * 2; v <= MAX; v += p) if (alive.has(v)) targets.push(v);
    targets.forEach((v, i) => {
      later(() => {
        alive.delete(v);
        const c = cells.get(v)!;
        c.classList.remove("pulse");
        c.classList.add("swept");
        if (i % 3 === 0) haptic(HAPTIC.tap);
      }, 90 + i * 46);
    });
    later(() => {
      sweeping = false;
      done();
    }, 90 + targets.length * 46 + 260);
  }

  function promptStage(): void {
    stage += 1;
    if (stage >= PRIMES_STEPS.length) {
      finishAll();
      return;
    }
    const p = PRIMES_STEPS[stage];
    cells.get(p)!.classList.add("pulse");
    if (stage === 0) {
      helper.innerHTML = "남은 수 중 <b>가장 작은 수</b>를 탭하세요 — 그 수는 남기고, 그 수의 배수를 모두 쓸어낼 거예요.";
    } else {
      helper.innerHTML = `좋아요! 이제 남은 수 중 <b>가장 작은 수</b>는 무엇일까요? 찾아서 탭해 보세요.`;
    }
  }

  function finishAll(): void {
    helper.innerHTML =
      "7 다음으로 남은 수는 11 — 그런데 11의 배수 중 남은 건 <b>11×11=121부터</b>라 이 판엔 없어요. 체질 끝!";
    let i = 0;
    for (let v = 2; v <= MAX; v++) {
      if (!alive.has(v)) continue;
      const c = cells.get(v)!;
      later(() => {
        c.classList.remove("keep", "pulse");
        c.classList.add("prime");
      }, 300 + i * 55);
      i += 1;
    }
    later(() => {
      haptic(HAPTIC.correct);
      toast(`소수 ${i}개만 남았어요!`);
      helper.innerHTML =
        `체에 걸러 남은 <b>소수 ${i}개</b> — 전부 약수가 <b>1과 자기 자신뿐</b>인 수예요. ` +
        "지워진 수(합성수)는 더 작은 수의 배수, 즉 약수가 3개 이상이었죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "이름 붙이기");
    }, 300 + i * 55 + 420);
  }

  grid.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest(".sv-cell") as HTMLButtonElement | null;
    if (!t || sweeping || stage >= PRIMES_STEPS.length) return;
    const v = Number(t.textContent);
    haptic(HAPTIC.tap);
    if (stage === -1) return; // 인트로 진행 중
    if (v === 1) {
      toast("1은 소수도 합성수도 아니에요 — 이미 제외!");
      return;
    }
    if (!alive.has(v)) {
      toast("이미 지워진 수예요");
      t.classList.add("swept");
      return;
    }
    if (t.classList.contains("keep")) {
      toast("이미 남기기로 한 소수예요");
      return;
    }
    const want = PRIMES_STEPS[stage];
    if (v !== want) {
      toast(v > want ? `더 작은 수가 남아 있어요 — ${want}부터!` : `${want}부터 차례로!`);
      return;
    }
    // 정답: 배수 쓸어내기
    t.classList.remove("pulse");
    haptic(HAPTIC.select);
    const count = Math.floor(MAX / v) - 1;
    toast(`${v}는 남기고, ${v}의 배수 ${count}개를 쓸어내요`);
    sweep(v, () => {
      if (v === 2) goals.on("p2", "완료!");
      if (v === 3) goals.on("p3", "완료!");
      if (v === 7) goals.on("p57", "완료!");
      promptStage();
    });
  });

  // 인트로: 1이 스스로 지워진다
  later(() => {
    alive.delete(1);
    cells.get(1)!.classList.add("swept");
    haptic(HAPTIC.tap);
    later(promptStage, 500);
  }, 800);

  api.setCTA("체질을 끝내면 열려요", { enabled: false });
  return () => {
    timers.forEach((t) => window.clearTimeout(t));
  };
};
