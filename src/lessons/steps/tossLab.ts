// tossLab, 던지기 실험실(Ⅵ L4 기함). 동전을 여러 번 던져 앞면의 상대도수가
// 일정한 값(0.5)으로 다가가는 것을 관찰하고, 그 값이 경우의 수의 비율임을 잇는다.
// 국면 1 낱개 던지기(요동 관찰) → 국면 2 몰아 던지기(수렴 발견 + 판정) →
// 국면 3 "실험 없이 알 수 있던 이유"(경우의 수 비율 1/2 명명 직전까지).
// 던지기 결과는 Math.random이지만 목표 판정은 던진 횟수 기준(결정적), 판정 답도 고정이라 e2e 안전.
// 그래프 갱신은 setTimeout 체인(rAF 금지), 배치 던지기는 10개씩 끊어 점이 자라나는 연출.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface TossStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 360;
const H = 232;
const GX0 = 46; // 그래프 영역
const GX1 = 340;
const GY0 = 196; // y=0
const GY1 = 40; // y=1
const N_MAX = 400;

const RED = "#C92A2A";
const BLUE = "#4A7BE8";
const BDEEP = "#1D4E8F";
const SOFT = "#5A6B7E";
const FAINT = "#C2CBD6";

export const tossLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TossStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "warm", label: "실험 시작", sub: "10번 던지기" },
    { id: "conv", label: "수렴 발견", sub: "몰아 던지기" },
    { id: "why", label: "이유 찾기", sub: "경우의 수" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "tsl-stage" });
  stage.innerHTML =
    `<div class="tsl-coinrow">` +
    `<div class="tsl-coin" aria-hidden="true"><span class="tsl-face">?</span></div>` +
    `<div class="tsl-count"><b class="tsl-n">0</b>번 던짐 · 앞면 <b class="tsl-h">0</b>번 · 상대도수 <b class="tsl-r">-</b></div>` +
    `</div>` +
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="tsl-axis"></g><g class="tsl-half"></g><g class="tsl-pts"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst", html: "먼저 <b>한 번씩</b> 몇 번 던져 봐요. 상대도수 점이 그래프에 찍혀요" });
  const eqs = el("div", { class: "mq6-eqs" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "동전 정하기가 공평하다는 믿음, 오늘 실험으로 검증해요. 앞면이 나온 비율(<b>상대도수</b>)이 어떻게 움직이는지가 관전 포인트!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gAxis = svg.querySelector(".tsl-axis") as SVGGElement;
  const gHalf = svg.querySelector(".tsl-half") as SVGGElement;
  const gPts = svg.querySelector(".tsl-pts") as SVGGElement;
  const coin = stage.querySelector(".tsl-coin") as HTMLElement;
  const faceEl = stage.querySelector(".tsl-face") as HTMLElement;
  const nEl = stage.querySelector(".tsl-n") as HTMLElement;
  const hEl = stage.querySelector(".tsl-h") as HTMLElement;
  const rEl = stage.querySelector(".tsl-r") as HTMLElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const showQ = (): void => later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);

  let n = 0;
  let heads = 0;
  let phase: 1 | 2 | 3 = 1;
  let busy = false;
  let finished = false;
  let pathD = "";

  const mx = (t: number): number => GX0 + (t / N_MAX) * (GX1 - GX0);
  const my = (v: number): number => GY0 - v * (GY0 - GY1);

  function drawAxis(): void {
    let out = `<line x1="${GX0}" y1="${GY0}" x2="${GX1}" y2="${GY0}" stroke="${FAINT}" stroke-width="2"/>`;
    out += `<line x1="${GX0}" y1="${GY0}" x2="${GX0}" y2="${GY1 - 8}" stroke="${FAINT}" stroke-width="2"/>`;
    ([[0, "0"], [0.5, "0.5"], [1, "1"]] as [number, string][]).forEach(([v, t]) => {
      out += `<line x1="${GX0 - 4}" y1="${my(v)}" x2="${GX0}" y2="${my(v)}" stroke="${FAINT}" stroke-width="1.6"/>`;
      out += `<text x="${GX0 - 8}" y="${my(v) + 3.5}" text-anchor="end" font-size="9.5" font-weight="700" fill="${SOFT}">${t}</text>`;
    });
    [100, 200, 300, 400].forEach((t) => {
      out += `<text x="${mx(t)}" y="${GY0 + 15}" text-anchor="middle" font-size="9" font-weight="700" fill="${SOFT}">${t}</text>`;
    });
    out += `<text x="${GX1}" y="${GY0 + 28}" text-anchor="end" font-size="9" font-weight="700" fill="${SOFT}">(던진 횟수, 번)</text>`;
    out += `<text x="${GX0 + 2}" y="${GY1 - 14}" font-size="9.5" font-weight="800" fill="${SOFT}">앞면의 상대도수</text>`;
    gAxis.innerHTML = out;
  }

  function plot(): void {
    const r = heads / n;
    const x = mx(Math.min(n, N_MAX)).toFixed(1);
    const y = my(r).toFixed(1);
    pathD += `${pathD ? "L" : "M"}${x} ${y}`;
    gPts.innerHTML =
      `<path d="${pathD}" stroke="${BLUE}" stroke-width="1.8" fill="none" opacity=".8"/>` +
      `<circle cx="${x}" cy="${y}" r="3.6" fill="${BLUE}" stroke="${BDEEP}" stroke-width="1.2"/>`;
    nEl.textContent = String(n);
    hEl.textContent = String(heads);
    rEl.textContent = r.toFixed(3);
  }

  function tossOnce(showFlip = true): void {
    const head = Math.random() < 0.5;
    n += 1;
    if (head) heads += 1;
    if (showFlip) {
      coin.classList.remove("flip");
      void coin.offsetWidth; // 리플로로 애니 재시작(rAF 금지)
      coin.classList.add("flip");
      faceEl.textContent = head ? "앞" : "뒤";
    }
    plot();
  }

  /* 배치 던지기: 10개씩 끊어 setTimeout 체인으로 점이 자라나는 연출 */
  function tossBatch(total: number, onDone: () => void): void {
    busy = true;
    const ticks = Math.ceil(total / 10);
    for (let k = 0; k < ticks; k++) {
      later(() => {
        for (let i = 0; i < 10 && (k * 10 + i) < total; i++) tossOnce(false);
        faceEl.textContent = "···";
        if (k === ticks - 1) {
          busy = false;
          onDone();
        }
      }, 90 * (k + 1));
    }
  }

  /* ── 조작 버튼 ── */
  const btn1 = el("button", { class: "mq6-btn mq6-pulse", text: "한 번 던지기", attrs: { type: "button", "aria-label": "한 번 던지기" } }) as HTMLButtonElement;
  const btn10 = el("button", { class: "mq6-btn", text: "10번 몰아 던지기", attrs: { type: "button", "aria-label": "10번 던지기" } }) as HTMLButtonElement;
  const btn100 = el("button", { class: "mq6-btn", text: "100번 몰아 던지기", attrs: { type: "button", "aria-label": "100번 던지기" } }) as HTMLButtonElement;
  btn100.disabled = true;

  function phase1Check(): void {
    if (phase !== 1 || n < 10) return;
    phase = 2;
    chips.on("warm", `${n}번`);
    haptic(HAPTIC.correct);
    toast("점이 이리저리 요동치죠?");
    inst.innerHTML = "10번으로는 들쭉날쭉! 이제 <b>100번씩</b> 몰아 던져 봐요";
    btn100.disabled = false;
    btn100.classList.add("mq6-pulse");
    btn1.classList.remove("mq6-pulse");
  }

  btn1.addEventListener("click", () => {
    if (busy || finished || n >= N_MAX) return;
    haptic(HAPTIC.tap);
    tossOnce();
    phase1Check();
  });
  btn10.addEventListener("click", () => {
    if (busy || finished || n >= N_MAX) return;
    haptic(HAPTIC.select);
    tossBatch(Math.min(10, N_MAX - n), phase1Check);
  });
  btn100.addEventListener("click", () => {
    if (busy || finished || phase < 2 || n >= N_MAX) return;
    haptic(HAPTIC.select);
    tossBatch(Math.min(100, N_MAX - n), () => {
      if (phase === 2 && n >= 200) startJudge();
      else if (phase === 2) inst.innerHTML = "좋아요, 한 번 더! 점이 어느 높이에 머무는지 보세요";
    });
  });

  function startJudge(): void {
    phase = 3;
    btn100.classList.remove("mq6-pulse");
    inst.innerHTML = `${n}번! 처음의 요동이 잦아들고 점이 한 높이에 머물러요`;
    qline.innerHTML = "앞면의 상대도수가 다가가는 <b>일정한 값</b>은 얼마일까요?";
    const row = el("div", { class: "mq6-choices" });
    ([
      ["0.5 근처", true],
      ["던질 때마다 완전히 다르다", false],
      ["1에 점점 가까워진다", false],
    ] as [string, boolean][]).forEach(([t, okAns]) => {
      const b = el("button", { class: "mq6-choice", text: t, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (okAns) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          qline.innerHTML = "";
          gHalf.innerHTML =
            `<line x1="${GX0}" y1="${my(0.5)}" x2="${GX1}" y2="${my(0.5)}" stroke="${RED}" stroke-width="2" stroke-dasharray="6 4"/>` +
            `<text x="${GX1 - 2}" y="${my(0.5) - 6}" text-anchor="end" font-size="10.5" font-weight="900" fill="${RED}">0.5</text>`;
          eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: "많이 던질수록 상대도수는 <b>0.5</b>라는 일정한 값에 다가가요" }));
          chips.on("conv", "0.5");
          later(startWhy, 1400);
        } else {
          haptic(HAPTIC.cross);
          toast(t.startsWith("던질") ? "낱개 결과는 제멋대로지만, 비율은 한 높이로 모여들고 있어요!" : "앞면만 나오는 동전이 아니에요. 점들이 머무는 높이를 다시 봐요.");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    showQ();
  }

  function startWhy(): void {
    inst.innerHTML = "그런데 이 0.5, 사실 던지기 <b>전에도</b> 알 수 있었어요";
    qline.innerHTML = "실험 없이도 0.5를 알 수 있는 이유는 뭘까요?";
    const row = el("div", { class: "mq6-choices" });
    ([
      ["앞면은 2가지 경우 중 1가지라서 1÷2", true],
      ["동전이 앞뒤를 번갈아 내도록 만들어져서", false],
      ["알 수 없다, 실험만이 답이다", false],
    ] as [string, boolean][]).forEach(([t, okAns]) => {
      const b = el("button", { class: "mq6-choice", text: t, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (okAns) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "두 면이 나올 가능성이 똑같으니 (앞면의 경우 1)÷(모든 경우 2)=<b>1/2</b>. 실험이 다가간 값과 계산이 딱 만났어요! 이 수의 정식 이름을 다음 화면에서 만나요.",
            }),
          );
          chips.on("why", "1÷2");
          later(finish, 1500);
        } else {
          haptic(HAPTIC.cross);
          toast(t.startsWith("동전이") ? "기록을 봐요, 같은 면이 연달아 나오기도 했죠? 번갈아 나오게 만들 수는 없어요." : "실험 전에 이미 두 경우의 가능성이 같다는 걸 알고 있잖아요. 그게 열쇠!");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    showQ();
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "낱개는 우연, 많이 모이면 <b>일정한 수</b>. 그리고 그 수는 <b>경우의 수의 비율</b>과 같아요. 확률의 두 얼굴을 모두 봤어요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  const btnRow = el("div", { class: "tsl-btnrow" });
  btnRow.append(btn1, btn10, btn100);
  ctl.appendChild(btnRow);

  drawAxis();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
