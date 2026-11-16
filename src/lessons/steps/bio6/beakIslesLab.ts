// [중1 Ⅱ v5] u2l7 beakIslesLab: 「두 섬의 새 무리는 어떻게 달라질까?」
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

// ── 그림(2026-11-15 그래픽 손질: 바뀌는 결과인 부리가 무대에서 가장 크게) ──────────────────────
// 고치기 전에는 새 몸이 약 18px, 부리가 7~16px라 결과(무리의 부리)가 작았고, 섬 위쪽 하늘은 비고 먹이도 작았다.
// 판의 폭(164px, 한 줄에 세 마리)은 그대로 두고 비율만 바꾼다: 몸은 작고 옅게, 머리와 부리를 1.5배쯤 키워 부리가 가장 진하다.
// 섬 이름과 먹이는 위쪽 하늘 띠로 올려 키운다(씨앗 더미, 나무 속 애벌레를 확대한 원). 구성 막대는 굵게(14px) 하고 칸마다 수를 쓴다.
const BEAK_PATH: Record<Beak, string> = {
  T: "M13.4 -15.6l20.5 8.2 -20.5 9.6Z",
  L: "M14.2 -10.4l29.6 3.4 -29.6 4Z",
  S: "M14.2 -10.4l10.6 3.4 -10.6 3.7Z",
};
/** 새 한 마리(원점이 몸 가운데). 몸은 모두 같고 부리만 다르다. 몸은 작고 옅게, 머리와 부리는 크게. */
const bird = (b: Beak): string => `
  <path d="M-7 1l-6.5 -3.4 1.6 5.6Z" fill="#F4EBDA" stroke="#B5A68C" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M-1.6 6.6v4.2M2.6 6.6v4.2" stroke="#B5A68C" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="0" cy="1.2" rx="8.2" ry="6" fill="#FFFBF2" stroke="#B5A68C" stroke-width="1.1"/>
  <circle cx="7.6" cy="-7" r="7.6" fill="#FFF7E8" stroke="#8C7A5C" stroke-width="1.3"/>
  <path d="${BEAK_PATH[b]}" fill="${COLOR[b]}" stroke="#4A2E0B" stroke-width="1.3" stroke-linejoin="round"/>
  <circle cx="9.6" cy="-8.8" r="1.6" fill="#2B2B2B"/>`;

const PANEL_W = 164;
const PANEL = { A: 6, B: 176 };
/** 자리 좌표(섬 안, 판의 왼쪽 위 기준). 섬의 폭 전체를 쓴다(먹이는 하늘 띠로 올렸다). */
const SLOT_XY: [number, number][] = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [24 + c * 48 + (r === 1 ? 4 : 0), 108 + r * 24] as [number, number]));
const SLOT_K = 0.86;

/** 섬 (가)의 먹이: 크고 단단한 씨앗 더미(하늘 띠 오른쪽). */
const SEEDS = `
  <g stroke="#6B4A1F" stroke-width="1.4">
    ${[[108, 76, 10, 7.6, -12], [127, 78, 10.4, 7.8, 8], [146, 75, 9.6, 7.4, -4], [117, 64, 9.8, 7.4, 18], [137, 63, 10, 7.6, -14], [127, 52, 9.4, 7.2, 4]]
      .map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="#B98244"/>`)
      .join("")}
  </g>
  ${[[108, 76, -12], [127, 78, 8], [146, 75, -4], [117, 64, 18], [137, 63, -14], [127, 52, 4]]
    .map(([x, y, a]) => `<path d="M${x - 5} ${y - 2}q5 -4 10 0" transform="rotate(${a} ${x} ${y})" fill="none" stroke="#F3D9B0" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`)
    .join("")}`;
/** 섬 (나)의 먹이: 나무줄기 속 작은 곤충(애벌레). 줄기의 구멍과 그 속을 확대한 원. */
const TREE = `
  <path d="M96 92V34q0 -5 5 -5h10q5 0 5 5v58Z" fill="#A9743F" stroke="#6E4520" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M100 40v9M110 58v10M101 74v8" stroke="#6E4520" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="106" cy="62" rx="4.4" ry="5.8" fill="#3E240E"/>
  <path d="M110.5 58.5L128 46M110.5 65.5L128 78" stroke="#FFF2CC" stroke-width="1.4" stroke-dasharray="3 3"/>
  <circle cx="141" cy="62" r="19" fill="#5A3516" stroke="#FFF2CC" stroke-width="2.2"/>
  <path d="M130 66c3 -8 9 -10 14 -8s9 2 11 -3" fill="none" stroke="#8BD44A" stroke-width="7" stroke-linecap="round"/>
  <path d="M130 66c3 -8 9 -10 14 -8s9 2 11 -3" fill="none" stroke="#C6F28E" stroke-width="3" stroke-linecap="round"/>
  <path d="M136 59.6l1 4M141.5 58.4l.4 4M147 58.6l-.4 4" stroke="#5C9A23" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="155.5" cy="55" r="1.5" fill="#2B2B2B"/>`;

function panel(isle: "A" | "B"): string {
  const x = PANEL[isle];
  const name = isle === "A" ? "섬 (가)" : "섬 (나)";
  const food = isle === "A" ? ["크고 단단한", "씨앗"] : ["나무 속", "작은 곤충"];
  const slots = SLOT_XY.map(([sx, sy], i) => `<g transform="translate(${sx} ${sy}) scale(${SLOT_K})"><g class="bki-slot" data-i="${i}"></g></g>`).join("");
  const blocks = (["T", "L", "S"] as Beak[])
    .map((k) => `<g class="bki-blk" data-k="${k}"><rect class="bki-seg" y="179" height="14" rx="4" fill="${COLOR[k]}"/><text class="bki-n" y="190.4" text-anchor="middle" font-size="12.5" font-weight="800" fill="${k === "S" ? "#13233D" : "#fff"}"></text></g>`)
    .join("");
  return `
  <g class="bki-isle" data-isle="${isle}" transform="translate(${x} 0)">
    <clipPath id="bkiClip${isle}"><rect x="0" y="6" width="${PANEL_W}" height="168" rx="14"/></clipPath>
    <g clip-path="url(#bkiClip${isle})">
      <rect x="0" y="6" width="${PANEL_W}" height="168" fill="url(#bkiSea)"/>
      <path d="M-6 162q14 -6 28 0t28 0 28 0 28 0 28 0 28 0v18H-6Z" fill="#2F6FA8" opacity=".55"/>
      <ellipse cx="84" cy="140" rx="86" ry="52" fill="#E7D7A6" stroke="#B9A56A" stroke-width="1.6"/>
      <path d="M8 104q76 -40 152 0q-76 -18 -152 0Z" fill="#9CCB6B" opacity=".85"/>
    </g>
    <rect x="0" y="6" width="${PANEL_W}" height="168" rx="14" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
    <text x="10" y="27" font-size="14" font-weight="800" fill="#0B2545">${name}</text>
    <text x="10" y="47" font-size="12.5" font-weight="700" fill="#234A75">먹이</text>
    <text x="10" y="63" font-size="13" font-weight="800" fill="#0B2545">${food[0]}</text>
    <text x="10" y="79" font-size="13" font-weight="800" fill="#0B2545">${food[1]}</text>
    ${isle === "A" ? SEEDS : TREE}
    ${slots}
    ${blocks}
  </g>`;
}

function stageSvg(): string {
  const item = (b: Beak, x: number): string =>
    `<g transform="translate(${x} 213)"><circle cx="0" cy="0" r="6.5" fill="#FFF6E6" stroke="#6B5B45" stroke-width="1.3"/><path d="M5 -3.4l${b === "T" ? "9 3 -9 4.4" : b === "L" ? "14 1.6 -14 2.2" : "5 1.6 -5 1.8"}Z" fill="${COLOR[b]}" stroke="#5F3D12" stroke-width=".9" stroke-linejoin="round"/><circle cx="2" cy="-1.6" r="1.1" fill="#2B2B2B"/><text x="${b === "L" ? 23 : 18}" y="4.4" font-size="12.5" font-weight="700" fill="#DCE6F5">${LABEL[b]}</text></g>`;
  return `<svg class="bki-svg" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="먹이가 다른 두 섬에 사는 새 무리">
    <defs><linearGradient id="bkiSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0F2"/><stop offset=".55" stop-color="#5FB3E4"/><stop offset="1" stop-color="#3E8FCB"/></linearGradient></defs>
    ${panel("A")}${panel("B")}
    ${item("T", 56)}${item("L", 152)}${item("S", 238)}
  </svg>`;
}

export const beakIslesLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BkiStep;
  const tm = bvTimers();
  // 세 줄 도움말을 처음부터 잡아 둔다(시간 막대를 밀 때의 글이 세 줄이다. 랩 도중에 무대가 밀리지 않게)
  const f = bvFrame(host, { title: s.title, steps: 3, cls: "bki-stage", qCls: "bki-q", api, tall: true });
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
      // 구성 막대: 두꺼운, 긴, 짧은 순서로 모아 그 수만큼의 폭으로 칠하고 칸 안에 수를 쓴다
      const order: Beak[] = ["T", "L", "S"];
      const counts = order.map((k) => flock.filter((x) => x === k).length);
      const GAP = 3;
      const shownN = counts.filter((c) => c > 0).length;
      const unit = (PANEL_W - GAP * (shownN - 1)) / 9;
      let bx = 0;
      order.forEach((k, j) => {
        const blk = root.querySelector(`.bki-blk[data-k="${k}"]`) as SVGGElement;
        const rect = blk.querySelector("rect") as SVGRectElement;
        const txt = blk.querySelector("text") as SVGTextElement;
        const w = counts[j] * unit;
        rect.setAttribute("x", bx.toFixed(1));
        rect.setAttribute("width", Math.max(0, w).toFixed(1));
        txt.setAttribute("x", (bx + w / 2).toFixed(1));
        txt.textContent = counts[j] ? String(counts[j]) : "";
        blk.style.display = counts[j] ? "" : "none";
        if (counts[j]) bx += w + GAP;
      });
      host.dataset[isle === "A" ? "bkiA" : "bkiB"] = counts.join(",");
    });
    cur = n;
    host.dataset.bkiStep = String(n);
  }

  const SAY = [
    "처음 모습이에요. 두 섬에 날아온 새 무리에는 세 가지 부리 모양의 새가 <b>비슷하게 섞여 있었어요</b>.",
    "각 섬의 먹이를 먹기에 알맞은 부리를 가진 새가 더 많이 살아남아 <b>자손(새끼)</b>을 남겼어요. 새끼의 부리는 어미를 닮아요.",
    "세대를 거듭할수록 씨앗이 많은 섬 (가)에는 <b>두꺼운 부리</b>의 새가, 곤충이 많은 섬 (나)에는 <b>긴 부리</b>의 새가 점점 늘어나요.",
    "오랜 세월이 흐른 뒤, 두 섬에 사는 새 무리의 부리 모양이 <b>서로 뚜렷하게 달라졌어요</b>!",
  ];

  const range = bvRange({
    cls: "bki-range",
    min: 0,
    max: 3,
    value: 0,
    label: "막대를 밀어 세대(시간) 흐르게 하기",
    ticks: ["처음", "오랜 세월이 흐른 뒤"],
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
    f.say("오랜 세월이 흐른 뒤 섬 (가)에는 두꺼운 부리의 새만, 섬 (나)에는 긴 부리의 새만 남았어요.");
    f.slot.ask(
      "단단한 씨앗이 많은 섬 (가)에 두꺼운 부리의 새만 남게 된 까닭은 무엇인가요?",
      [{ t: "두꺼운 부리를 가진 새가 더 많이 살아남아 자손을 남겨서", ok: true }, { t: "새들이 씨앗을 먹으려고 스스로 부리를 두껍게 바꿔서" }, { t: "부리가 얇은 새들이 모두 섬 (나)로 날아가서" }],
      (ok) => api.recordQuiz(ok),
      // 이유는 어느 오답을 골랐든, 맞혔든 같은 글이 보인다. 한 오답만 받아치지 않게 쓴다(2026-11-11 눈검수)
      { why: "단단한 <b>씨앗을 깨 먹기에 알맞은 두꺼운 부리</b>의 새가 더 잘 살아남아 자손을 남겼기 때문이에요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(2);
    f.say("이번에는 새 한 마리 한 마리를 떠올려 보세요. 살아 있는 동안 부리 모양이 바뀐 새가 있었나요?");
    f.slot.ask(
      "세대가 흐르는 동안 새 한 마리 한 마리의 부리 모양은 어떠했나요?",
      // 새는 자라면서 부리도 커지므로 '태어날 때', '나이가 들수록' 같은 말은 쓰지 않는다(타고난 모양이 먹이에 맞춰 바뀌지 않는다는 것만 묻는다).
      // 2026-11-16 글 다듬기: 수정안의 "태어날 때 지닌 모양"도 같은 까닭으로 "타고난 모양"을 지켰다(보기와 이유 둘 다)
      [{ t: "타고난 모양 그대로였다", ok: true }, { t: "먹이에 맞춰 살아가는 동안 조금씩 변했다" }, { t: "부리를 많이 쓸수록 모양이 달라졌다" }],
      () => undefined,
      { why: "새 한 마리의 부리는 타고난 모양 그대로예요. 달라진 것은 개체의 부리가 아니라 <b>무리 안에서 어떤 부리의 새가 살아남아 늘어났는가</b>예요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    host.dataset.bkiPhase = phase;
    f.pips(3);
    f.say("먹이 환경에 알맞은 변이를 가진 새가 살아남아 자손을 남기면서 두 섬의 새 무리가 달라졌어요!");
    f.slot.conclude("같은 종류의 생물이라도 조금씩 다른 특징(변이)을 가지고 있어요. 그중 <b>사는 환경에 알맞은 변이를 가진 생물이 더 많이 살아남아 자손을 남기면서</b> 오랜 세월 뒤 서로 다른 모습의 무리가 돼요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el);
  render(0, false);
  host.dataset.bkiPhase = phase;
  f.say("부리 모양이 조금씩 다른 새 무리가 먹이가 다른 <b>두 섬</b>에 나뉘어 살게 됐어요. 먼저 결과를 예측해 볼까요?");
  f.slot.ask(
    "크고 단단한 씨앗이 많은 섬 (가)에는 오랜 세월 뒤 어떤 새가 많아질까요?",
    [{ t: "두꺼운 부리의 새", ok: true }, { t: "긴 부리의 새" }, { t: "짧은 부리의 새" }],
    () => undefined,
    {
      predict: true,
      nextDelay: 700,
      onNext: () => {
        phase = "time";
        host.dataset.bkiPhase = phase;
        f.slot.showControls();
        f.say("이제 아래 막대를 오른쪽으로 밀어 <b>오랜 세월</b>이 흐르게 해 보세요. 두 섬의 새 무리가 어떻게 달라지는지 지켜보세요.");
      },
    },
  );
  api.setCTA("막대를 오른쪽 끝까지 밀어 보세요", { enabled: false });
  return () => tm.clear();
};
