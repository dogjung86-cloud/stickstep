// [중1 Ⅱ v5] u2l7 beakIslesLab: 「두 섬의 새는 어떻게 달라질까?」
// 한 통찰: 변이가 있는 무리가 서로 다른 환경에 살면, 그 환경에 알맞은 변이를 가진 생물이 더 많이 살아남아 자손을 남긴다.
//   그래서 무리의 구성이 달라진다(새 한 마리의 부리가 변하는 것이 아니다).
// 무대: 섬 (가)(크고 단단한 씨앗)와 섬 (나)(나무 속 작은 곤충). 두 섬에 같은 무리(두꺼운 부리 3, 긴 부리 3, 짧은 부리 3)가 내려앉아 있다.
// 조작: 시간 막대 하나(처음 → 오랜 시간 뒤, 네 눈금). 한 눈금 지날 때마다 먹이를 잘 먹지 못하는 새의 자리가 비고,
//   그 자리를 살아남은 새의 새끼(어미와 같은 부리)가 채운다. 섬마다 아홉 자리는 그대로다(섬이 먹여 살릴 수 있는 수).
//   막대를 되돌리면 그때의 무리로 돌아간다(시간의 함수).
// 흐름: 예측(채점하지 않음) → 막대 → 판정 둘(첫 판정만 채점).
// 과학 가드: '자연선택', '진화'라는 말을 쓰지 않는다. 새 한 마리의 부리는 처음부터 끝까지 그대로다(자리의 주인이 바뀔 뿐이다).
//   결과의 부리 이름은 원전 그대로: (가) 크고 두꺼운 부리, (나) 길고 단단한 부리. 무대의 짧은 이름은 두꺼운, 긴, 짧은 부리.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { bvFrame, bvRange, bvTimers } from "./b6Lab";

interface BkiStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Beak = "T" | "L" | "S"; // 두꺼운, 긴, 짧은
const COLOR: Record<Beak, string> = { T: "#FF922B", L: "#4DABF7", S: "#9AA5B4" };
const LABEL: Record<Beak, string> = { T: "두꺼운 부리", L: "긴 부리", S: "짧은 부리" };

/** 처음 무리의 자리 배치(두 섬이 같다). 3×3 자리에 세 가지 부리가 고루 섞여 있다. */
const START: Beak[] = ["T", "L", "S", "S", "T", "L", "L", "S", "T"];
/** 눈금마다 주인이 바뀌는 자리(알맞지 않은 부리의 새가 있던 자리). 눈금 1에 둘, 2에 둘, 3에 둘. */
const TURN: Record<"A" | "B", number[][]> = {
  A: [[2, 5], [3, 6], [1, 7]], // 섬 (가): 두꺼운 부리가 남는다
  B: [[2, 8], [3, 0], [7, 4]], // 섬 (나): 긴 부리가 남는다
};
const FAV: Record<"A" | "B", Beak> = { A: "T", B: "L" };

function flockAt(isle: "A" | "B", step: number): Beak[] {
  const f = [...START];
  for (let k = 0; k < step; k++) TURN[isle][k].forEach((i) => (f[i] = FAV[isle]));
  return f;
}

const BEAK_PATH: Record<Beak, string> = {
  T: "M12.4 -10.4l12.6 5 -12.6 6.4Z",
  L: "M12.8 -7.6l19 2.2 -19 2.6Z",
  S: "M12.8 -7.6l7 2.3 -7 2.5Z",
};
/** 새 한 마리(원점이 몸 가운데). 몸은 모두 같고 부리만 다르다. */
const bird = (b: Beak): string => `
  <path d="M-9 1l-8 -4 2 7Z" fill="#E8DCC4" stroke="#6B5B45" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M-2 8v5M3 8v5" stroke="#6B5B45" stroke-width="1.4" stroke-linecap="round"/>
  <ellipse cx="0" cy="1.5" rx="10.5" ry="7.6" fill="#FFF6E6" stroke="#6B5B45" stroke-width="1.5"/>
  <path d="M-5 0q5 6 10 1" fill="none" stroke="#B9A88A" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="8.6" cy="-5.2" r="5.8" fill="#FFF6E6" stroke="#6B5B45" stroke-width="1.5"/>
  <path d="${BEAK_PATH[b]}" fill="${COLOR[b]}" stroke="#5F3D12" stroke-width="1" stroke-linejoin="round"/>
  <circle cx="10" cy="-6.4" r="1.25" fill="#2B2B2B"/>`;

const PANEL_W = 164;
const PANEL = { A: 6, B: 176 };
/** 자리 좌표(섬 안, 판의 왼쪽 위 기준). 먹이 그림이 놓이는 왼쪽을 비워 둔다. */
const SLOT_XY: [number, number][] = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [57 + c * 39, 100 + r * 26] as [number, number]));

const SEEDS = `
  <g stroke="#7A5524" stroke-width="1.3">
    <ellipse cx="17" cy="128" rx="7.5" ry="6" fill="#C9975A"/><ellipse cx="27" cy="140" rx="7.5" ry="6" fill="#B98244"/>
    <ellipse cx="15" cy="150" rx="7.5" ry="6" fill="#B98244"/><ellipse cx="28" cy="158" rx="6.8" ry="5.4" fill="#D4A66C"/>
  </g>
  <path d="M13.5 126.5q3 -2.4 6 0M23.5 138.5q3 -2.4 6 0M11.5 148.5q3 -2.4 6 0M24.8 156.6q3 -2.4 6 0" fill="none" stroke="#F3D9B0" stroke-width="1.2" stroke-linecap="round"/>`;
const TREE = `
  <circle cx="19" cy="78" r="16" fill="#3E8E4E" stroke="#27633A" stroke-width="1.4"/><circle cx="31" cy="87" r="10" fill="#4BA35C" stroke="#27633A" stroke-width="1.4"/>
  <path d="M11 160V94q0 -4 4 -4h8q4 0 4 4v66Z" fill="#A9743F" stroke="#6E4520" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M15 100v10M22 122v12M16 146v8" stroke="#6E4520" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="19" cy="114" rx="4.2" ry="5.6" fill="#4A2C12"/><ellipse cx="19" cy="140" rx="4.2" ry="5.6" fill="#4A2C12"/>
  <circle cx="19" cy="115" r="2.1" fill="#C0EB75"/><circle cx="19" cy="141" r="2.1" fill="#C0EB75"/>`;

function panel(isle: "A" | "B"): string {
  const x = PANEL[isle];
  const name = isle === "A" ? "섬 (가)" : "섬 (나)";
  const food = isle === "A" ? "크고 단단한 씨앗" : "나무 속 작은 곤충";
  const slots = SLOT_XY.map(([sx, sy], i) => `<g transform="translate(${sx} ${sy}) scale(.84)"><g class="bki-slot" data-i="${i}"></g></g>`).join("");
  const segs = Array.from({ length: 9 }, (_, i) => `<rect class="bki-seg" x="${2 + i * 18}" y="181" width="16" height="9" rx="3"/>`).join("");
  return `
  <g class="bki-isle" data-isle="${isle}" transform="translate(${x} 0)">
    <clipPath id="bkiClip${isle}"><rect x="0" y="6" width="${PANEL_W}" height="170" rx="14"/></clipPath>
    <g clip-path="url(#bkiClip${isle})">
      <rect x="0" y="6" width="${PANEL_W}" height="170" fill="url(#bkiSea)"/>
      <path d="M-6 164q14 -6 28 0t28 0 28 0 28 0 28 0 28 0v18H-6Z" fill="#2F6FA8" opacity=".55"/>
      <ellipse cx="84" cy="140" rx="84" ry="54" fill="#E7D7A6" stroke="#B9A56A" stroke-width="1.6"/>
      <path d="M14 112q70 -44 140 0q-70 -20 -140 0Z" fill="#9CCB6B" opacity=".85"/>
    </g>
    <rect x="0" y="6" width="${PANEL_W}" height="170" rx="14" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
    <text x="10" y="27" font-size="13.5" font-weight="800" fill="#0B2545">${name}</text>
    <text x="10" y="46" font-size="12.5"><tspan font-weight="700" fill="#234A75">먹이: </tspan><tspan font-weight="800" fill="#0B2545">${food}</tspan></text>
    ${isle === "A" ? SEEDS : TREE}
    ${slots}
    ${segs}
  </g>`;
}

function stageSvg(): string {
  const item = (b: Beak, x: number): string =>
    `<g transform="translate(${x} 211)"><circle cx="0" cy="0" r="6.5" fill="#FFF6E6" stroke="#6B5B45" stroke-width="1.3"/><path d="M5 -3.4l${b === "T" ? "9 3 -9 4.4" : b === "L" ? "14 1.6 -14 2.2" : "5 1.6 -5 1.8"}Z" fill="${COLOR[b]}" stroke="#5F3D12" stroke-width=".9" stroke-linejoin="round"/><circle cx="2" cy="-1.6" r="1.1" fill="#2B2B2B"/><text x="${b === "L" ? 23 : 18}" y="4.4" font-size="12.5" font-weight="700" fill="#DCE6F5">${LABEL[b]}</text></g>`;
  return `<svg class="bki-svg" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="먹이가 다른 두 섬에 사는 새 무리">
    <defs><linearGradient id="bkiSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0F2"/><stop offset=".55" stop-color="#5FB3E4"/><stop offset="1" stop-color="#3E8FCB"/></linearGradient></defs>
    ${panel("A")}${panel("B")}
    ${item("T", 56)}${item("L", 152)}${item("S", 238)}
  </svg>`;
}

export const beakIslesLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BkiStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 3, cls: "bki-stage", qCls: "bki-q", api });
  f.stage.innerHTML = stageSvg();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;

  let cur = -1;
  let phase: "predict" | "time" | "ask" | "done" = "predict";
  let reachedEnd = false;
  const shown: Record<"A" | "B", Beak[]> = { A: [], B: [] };

  /** 눈금 n의 무리를 그린다. 주인이 바뀐 자리는 앞의 새가 사라지고 새끼가 나타난다. */
  function render(n: number, animate: boolean): void {
    (["A", "B"] as const).forEach((isle) => {
      const flock = flockAt(isle, n);
      const root = svg.querySelector(`.bki-isle[data-isle="${isle}"]`) as SVGGElement;
      flock.forEach((b, i) => {
        const slot = root.querySelector(`.bki-slot[data-i="${i}"]`) as SVGGElement;
        const prev = shown[isle][i];
        if (prev === b && slot.childElementCount) return;
        const forward = animate && prev !== undefined && n > cur;
        slot.innerHTML = forward ? `<g class="bki-gone">${bird(prev)}</g><g class="bki-born" style="--d:${(0.32 + (i % 3) * 0.08).toFixed(2)}s">${bird(b)}</g>` : `<g>${bird(b)}</g>`;
      });
      shown[isle] = flock;
      // 구성 막대: 두꺼운, 긴, 짧은 순서로 모아 칠한다
      const order: Beak[] = ["T", "L", "S"];
      const sorted = order.flatMap((k) => flock.filter((x) => x === k));
      root.querySelectorAll<SVGRectElement>(".bki-seg").forEach((seg, i) => seg.setAttribute("fill", COLOR[sorted[i]]));
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
        // 달라진 두 무리를 볼 시간을 준 뒤 묻는다
        tm.later(ask1, 1900);
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
      // 이유는 어느 오답을 골랐든, 맞혔든 같은 글이 보인다. 한 오답만 받아치지 않게 쓴다(2026-11-11 눈검수)
      { why: "<b>씨앗을 잘 깨는 새</b>가 살아남아 새끼를 낳았어요. 부리를 바꾸거나 떠난 새는 없어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(2);
    f.say("이번에는 새 한 마리 한 마리를 떠올려 봐요. 부리가 달라진 새가 있었나요?");
    f.slot.ask(
      "그동안 새 한 마리 한 마리의 부리 모양은?",
      // 새는 자라면서 부리도 커지므로 '태어날 때', '나이가 들수록' 같은 말은 쓰지 않는다(타고난 모양이 먹이에 맞춰 바뀌지 않는다는 것만 묻는다)
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
