// treeLab, 가지 뻗기 실험실(Ⅵ L3 기함). "각각에 대하여" 가지가 벌어지는 것을 직접 펼쳐 a×b를 발견한다.
// 국면 1 아바타(모자 3 × 옷 2 = 6) → 국면 2 숫자 카드 두 자리 수(재사용 금지: 3×2) →
// 국면 3 0 카드 함정(십의 자리에 0 금지: 2×2). 통찰은 하나, 곱셈의 정체는 "가지 끝의 개수".
// 가지 자람은 stroke-dashoffset 트랜지션 + setTimeout 스태거(rAF 금지), 판정 질문은 mq6-q 문법.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TreeStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 360;
const RED = "#C92A2A";
const RDEEP = "#8F1D1D";
const BLUE = "#4A7BE8";
const BDEEP = "#1D4E8F";
const INK = "#2A3648";

/* 트리 좌표 계산 — 잎 n개를 세로로 배치하고 층별 x는 고정 */
const X_ROOT = 26;
const X_L1 = 104;
const X_L2 = 206;
const X_LEAF = 252;

interface TreeSpec {
  first: string[];
  /** 첫 선택 i에 대한 두 번째 선택 목록(재사용 금지 반영은 호출 쪽에서) */
  secondOf: (i: number) => string[];
  leafText: (i: number, j: number) => string;
}

export const treeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TreeStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "avatar", label: "아바타 조합", sub: "3×2" },
    { id: "cards", label: "카드 두 자리 수", sub: "재사용 금지" },
    { id: "zero", label: "0의 함정", sub: "맨 앞자리" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "trl-stage" });
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "훅에서 조합을 하나씩 입어 봤죠? 이번엔 선택의 <b>가지</b>를 직접 뻗어서, 다 세지 않고도 전체를 아는 지름길을 찾아요.",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const showQ = (): void => later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);

  let finished = false;

  /* ── 트리 렌더(정적 골격 + 자람 트랜지션 대상 분리) ── */
  function leafYs(n: number, rowH: number, top: number): number[] {
    const ys: number[] = [];
    for (let i = 0; i < n; i++) ys.push(top + i * rowH);
    return ys;
  }

  function buildTree(spec: TreeSpec, H: number, rowH: number, top: number): { svg: SVGSVGElement; growL1: () => void; growL2: () => void } {
    const counts = spec.first.map((_, i) => spec.secondOf(i).length);
    const total = counts.reduce((a, b) => a + b, 0);
    const ys = leafYs(total, rowH, top);
    const midOf = (i: number): number => {
      const start = counts.slice(0, i).reduce((a, b) => a + b, 0);
      const g = ys.slice(start, start + counts[i]);
      return counts[i] === 0 ? 0 : (g[0] + g[g.length - 1]) / 2;
    };
    const rootY = (midOf(0) + midOf(spec.first.length - 1)) / 2;

    let inner = `<circle cx="${X_ROOT}" cy="${rootY.toFixed(1)}" r="6" fill="url(#trl-red)" stroke="${RDEEP}" stroke-width="1.6"/>`;
    spec.first.forEach((f, i) => {
      const my = midOf(i);
      inner +=
        `<path class="trl-e1" d="M${X_ROOT + 6} ${rootY.toFixed(1)} C ${X_ROOT + 34} ${rootY.toFixed(1)} ${X_ROOT + 34} ${my.toFixed(1)} ${X_L1 - 24} ${my.toFixed(1)}" pathLength="1" stroke="${RED}" stroke-width="2.2" fill="none"/>` +
        `<g class="trl-n1"><rect x="${X_L1 - 24}" y="${(my - 14).toFixed(1)}" width="48" height="28" rx="9" fill="url(#trl-red)" stroke="${RDEEP}" stroke-width="1.4"/>` +
        `<text x="${X_L1}" y="${(my + 4.5).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${f}</text></g>`;
      spec.secondOf(i).forEach((snd, j) => {
        const start = counts.slice(0, i).reduce((a, b) => a + b, 0);
        const ly = ys[start + j];
        inner +=
          `<path class="trl-e2" d="M${X_L1 + 24} ${my.toFixed(1)} C ${X_L1 + 58} ${my.toFixed(1)} ${X_L1 + 58} ${ly} ${X_L2 - 22} ${ly}" pathLength="1" stroke="${BLUE}" stroke-width="1.9" fill="none"/>` +
          `<g class="trl-n2"><rect x="${X_L2 - 22}" y="${ly - 12}" width="44" height="24" rx="8" fill="url(#trl-blue)" stroke="${BDEEP}" stroke-width="1.3"/>` +
          `<text x="${X_L2}" y="${ly + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${snd}</text>` +
          `<text x="${X_LEAF}" y="${ly + 4}" font-size="11.5" font-weight="800" fill="${INK}">${spec.leafText(i, j)}</text></g>`;
      });
    });

    const wrap = el("div", {});
    wrap.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<defs>` +
      `<linearGradient id="trl-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>` +
      `<linearGradient id="trl-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AB4FF"/><stop offset=".55" stop-color="#4A7BE8"/><stop offset="1" stop-color="#2A57C2"/></linearGradient>` +
      `</defs>${inner}</svg>`;
    const svg = wrap.querySelector("svg") as SVGSVGElement;

    // 자람 준비: 가지는 dashoffset 1, 노드·잎은 투명
    svg.querySelectorAll<SVGPathElement>(".trl-e1, .trl-e2").forEach((p) => {
      p.style.strokeDasharray = "1";
      p.style.strokeDashoffset = "1";
      p.style.transition = "stroke-dashoffset .5s cubic-bezier(.22,1,.36,1)";
    });
    svg.querySelectorAll<SVGGElement>(".trl-n1, .trl-n2").forEach((g) => {
      g.style.opacity = "0";
      g.style.transition = "opacity .4s";
    });

    const growL1 = (): void => {
      svg.querySelectorAll<SVGPathElement>(".trl-e1").forEach((p, i) => later(() => (p.style.strokeDashoffset = "0"), i * 140));
      svg.querySelectorAll<SVGGElement>(".trl-n1").forEach((g, i) => later(() => (g.style.opacity = "1"), 200 + i * 140));
    };
    const growL2 = (): void => {
      svg.querySelectorAll<SVGPathElement>(".trl-e2").forEach((p, i) => later(() => (p.style.strokeDashoffset = "0"), i * 110));
      svg.querySelectorAll<SVGGElement>(".trl-n2").forEach((g, i) => later(() => (g.style.opacity = "1"), 180 + i * 110));
    };
    return { svg, growL1, growL2 };
  }

  function actionBtn(label: string, aria: string, onTap: () => void): HTMLButtonElement {
    const b = el("button", { class: "mq6-btn mq6-pulse", text: label, attrs: { type: "button", "aria-label": aria } }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (finished) return;
      onTap();
    });
    return b;
  }

  function choiceRow(onPick: (i: number, b: HTMLButtonElement, row: HTMLElement) => void, labels: string[]): HTMLElement {
    const row = el("div", { class: "mq6-choices" });
    labels.forEach((t, i) => {
      const b = el("button", { class: "mq6-choice", text: t, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        onPick(i, b, row);
      });
      row.appendChild(b);
    });
    return row;
  }

  /* ══ 국면 1: 아바타 모자 3 × 옷 2 ══ */
  const HATS = ["캡", "비니", "베레"];
  const TOPS = ["티", "후드"];
  const treeA = buildTree(
    { first: HATS, secondOf: () => TOPS, leafText: (i, j) => `${HATS[i]} · ${TOPS[j]}` },
    236,
    34,
    30,
  );

  function phase1(): void {
    clear(stage);
    stage.appendChild(treeA.svg);
    inst.innerHTML = "훅의 아바타예요. 먼저 <b>모자 가지</b>부터 뻗어 봐요";
    let stepN = 0; // 0: 모자 대기, 1: 옷 대기, 2: 완료
    const b = actionBtn("모자 가지 뻗기", "모자 가지 뻗기", () => {
      if (stepN === 0) {
        stepN = 1;
        haptic(HAPTIC.select);
        treeA.growL1();
        b.textContent = "옷 가지 뻗기";
        b.setAttribute("aria-label", "옷 가지 뻗기");
        inst.innerHTML = "모자 3갈래! 이제 <b>각각의 모자에서</b> 옷 가지를 뻗어요";
        return;
      }
      if (stepN === 1) {
        stepN = 2;
        haptic(HAPTIC.select);
        treeA.growL2();
        b.disabled = true;
        b.classList.remove("mq6-pulse");
        later(() => {
          inst.innerHTML = "모자 <b>하나마다</b> 옷 2갈래가 똑같이 벌어졌어요";
          qline.innerHTML = "가지 끝(전체 조합)의 개수를 셈 하나로 쓰면?";
          const row = choiceRow((i, btn, r) => {
            if (i === 0) {
              haptic(HAPTIC.correct);
              r.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
              btn.classList.add("ok");
              qline.innerHTML = "";
              eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: "모자 3갈래, <b>각각에</b> 옷 2갈래씩: <b>3×2=6</b>. 다 입어 보지 않아도 가지 끝은 6개!" }));
              chips.on("avatar", "3×2=6");
              later(phase2, 1500);
            } else {
              haptic(HAPTIC.cross);
              toast(i === 1 ? "3+2는 '모자 또는 옷 중 하나만' 고를 때예요. 지금은 둘 다!" : "2×2×2는 세 단계짜리 가지예요. 지금은 모자, 옷 두 단계!");
            }
          }, ["3×2", "3+2", "2×2×2"]);
          clear(ctl);
          ctl.appendChild(row);
          showQ();
        }, TOPS.length * HATS.length * 110 + 500);
      }
    });
    clear(ctl);
    ctl.appendChild(b);
  }

  /* ══ 국면 2: 카드 1·2·3 두 자리 수(재사용 금지) ══ */
  function phase2(): void {
    const DIGITS = ["1", "2", "3"];
    const tree = buildTree(
      {
        first: DIGITS,
        secondOf: (i) => DIGITS.filter((_, j) => j !== i),
        leafText: (i, j) => `${DIGITS[i]}${DIGITS.filter((_, k) => k !== i)[j]}`,
      },
      236,
      34,
      30,
    );
    clear(stage);
    stage.appendChild(tree.svg);
    clear(eqs);
    clear(ctl);
    helper.innerHTML = "이번엔 숫자 카드 <b>1, 2, 3</b> 중 두 장을 뽑아 <b>두 자리 수</b>를 만들어요. 아바타와 다른 점이 하나 숨어 있어요!";
    inst.innerHTML = "먼저 <b>십의 자리</b> 가지부터";
    const b = actionBtn("십의 자리 가지 뻗기", "십의 자리 가지 뻗기", () => {
      haptic(HAPTIC.select);
      tree.growL1();
      b.disabled = true;
      b.classList.remove("mq6-pulse");
      later(() => {
        inst.innerHTML = "십의 자리는 1, 2, 3의 <b>3갈래</b>. 그런데 일의 자리는...";
        qline.innerHTML = "일의 자리 가지는 <b>각각 몇 갈래</b>씩 벌어질까요?";
        const row = choiceRow((i, btn, r) => {
          if (i === 0) {
            haptic(HAPTIC.correct);
            r.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
            btn.classList.add("ok");
            qline.innerHTML = "";
            inst.innerHTML = "직접 확인! <b>일의 자리 가지</b>를 뻗어요";
            const b2 = actionBtn("일의 자리 가지 뻗기", "일의 자리 가지 뻗기", () => {
              haptic(HAPTIC.select);
              tree.growL2();
              b2.disabled = true;
              b2.classList.remove("mq6-pulse");
              later(() => {
                eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: "쓴 카드가 빠져서 갈래가 하나 줄어요: <b>3×2=6</b>가지 (12, 13, 21, 23, 31, 32)" }));
                chips.on("cards", "3×2=6");
                later(phase3, 1600);
              }, 6 * 110 + 500);
            });
            clear(ctl);
            ctl.appendChild(b2);
          } else {
            haptic(HAPTIC.cross);
            toast("십의 자리에 쓴 카드는 손을 떠났어요! 남은 카드는 2장뿐이랍니다.");
          }
        }, ["2갈래, 쓴 카드는 다시 못 써요", "3갈래 그대로", "1갈래로 줄어요"]);
        clear(ctl);
        ctl.appendChild(row);
        showQ();
      }, 3 * 140 + 500);
    });
    clear(ctl);
    ctl.appendChild(b);
  }

  /* ══ 국면 3: 카드 0·1·2, 십의 자리 0 금지 ══ */
  function phase3(): void {
    const D = ["1", "2"]; // 십의 자리 후보(0 제외)
    const ALL = ["0", "1", "2"];
    const tree = buildTree(
      {
        first: D,
        secondOf: (i) => ALL.filter((d) => d !== D[i]),
        leafText: (i, j) => `${D[i]}${ALL.filter((d) => d !== D[i])[j]}`,
      },
      190,
      36,
      28,
    );
    clear(eqs);
    clear(ctl);
    helper.innerHTML = "마지막 함정! 카드가 <b>0, 1, 2</b>로 바뀌었어요. 0이 낄 때 조심할 자리가 있죠.";
    inst.innerHTML = "두 자리 수를 만들 거예요";
    qline.innerHTML = "십의 자리 가지는 <b>몇 갈래</b>일까요?";
    const row = choiceRow((i, btn, r) => {
      if (i === 0) {
        haptic(HAPTIC.correct);
        r.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
        btn.classList.add("ok");
        qline.innerHTML = "";
        clear(stage);
        stage.appendChild(tree.svg);
        inst.innerHTML = "0을 뺀 <b>2갈래</b>! 가지를 뻗어 확인해요";
        const b = actionBtn("가지 전부 뻗기", "가지 전부 뻗기", () => {
          haptic(HAPTIC.select);
          tree.growL1();
          later(() => tree.growL2(), 2 * 140 + 380);
          b.disabled = true;
          b.classList.remove("mq6-pulse");
          later(() => {
            eqs.appendChild(
              el("div", { class: "mq6-concl mq6-pop", html: "십의 자리 2갈래(0 금지), 각각에 일의 자리 2갈래(쓴 카드 제외, 0은 합류): <b>2×2=4</b>가지 (10, 12, 20, 21). 가지 그림은 함정까지 그대로 보여 줘요!" }),
            );
            chips.on("zero", "2×2=4");
            later(finish, 1400);
          }, 2 * 140 + 380 + 4 * 110 + 500);
        });
        clear(ctl);
        ctl.appendChild(b);
      } else {
        haptic(HAPTIC.cross);
        toast(i === 1 ? "03은 두 자리 수가 아니에요! 맨 앞자리에 0이 오면 자릿수가 무너져요." : "1과 2, 두 장이나 올 수 있어요. 0만 맨 앞을 못 설 뿐!");
      }
    }, ["2갈래, 0은 맨 앞에 못 와요", "3갈래 전부", "1갈래"]);
    clear(ctl);
    ctl.appendChild(row);
    showQ();
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "가지 끝의 개수가 곧 경우의 수, 그리고 그 개수는 언제나 <b>갈래 수의 곱</b>이에요. 이제 이름을 붙이러 가요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  phase1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
