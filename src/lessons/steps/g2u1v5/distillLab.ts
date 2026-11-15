// [중2 Ⅰ v5] g2u1l9 증류 랩: 「시험관은 언제 바꿔야 할까요?」
// 책의 탐구(물과 에탄올 혼합물 분리하기)를 손으로 한다: 가지 달린 삼각 플라스크의 혼합물을 가열하며 온도 그래프를 보고,
//   나오는 물질을 얼음물에 담근 시험관 (가)~(라)에 차례로 모은 뒤 냄새와 푸른색 염화 코발트 종이로 확인한다.
// 학생이 정하는 것: 가열하다가 시험관을 바꾸는 때, 어느 시험관을 무엇으로 확인할지.
// 실패하는 길: 온도가 평평한 구간과 오르는 구간이 한 시험관에 함께 모이면 에탄올과 물이 섞여 다시 해야 한다.
// 통찰 하나: 끓는점이 낮은 에탄올이 먼저 끓어 나오고 끓는점이 높은 물이 나중에 나온다.
// 수치: 끓는점은 에탄올 78 ℃, 물 100 ℃(자연값). 가열 시간은 이 랩에서 정했다.
// 장치(2026-11-15 그래픽 감사): 온도계 끝은 가지(옆으로 난 관) 높이, 플라스크 바닥에 끓임쪽. 얼음물 비커에는 지금 받는 시험관 하나만 두고
//   유리관 끝이 그 시험관 속(바닥에 닿지 않게)으로 들어간다. 다 받은 시험관은 옆 시험관대로 옮겨 세운다(모인 액체 색은 그대로).
//   그래프의 시험관 이름은 바꾼 자리가 아니라 각 구간의 가운데 아래쪽에 쓴다(짧은 구간에서 이름끼리 붙지 않게).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { P, fx, g1Curve, g1Lab, g1Row, heater, plot, svgOpen, type G1Step } from "./g2u1Kit";

const TMAX = 21;
// 구간: A 오름(0~6), B 78 ℃쯤에서 거의 일정(6~12), C 다시 오름(12~15), D 100 ℃에서 일정(15~21)
const EDGE = [0, 6, 12, 15, TMAX];
const temp = (t: number): number => (t < 6 ? 25 + (53 * t) / 6 : t < 12 ? 78 + (3 * (t - 6)) / 6 : t < 15 ? 81 + (19 * (t - 12)) / 3 : 100);
const region = (t: number): number => (t < 6 ? 0 : t < 12 ? 1 : t < 15 ? 2 : 3);
const NAME = ["(가)", "(나)", "(다)", "(라)"];
const ICE_X = 100; // 얼음물 속 시험관의 가운데
const RACK_X = [142, 167, 192]; // 시험관대 칸(다 받은 시험관). 그래프 세로축(x 208)과 눈금 40의 아래로 띄운다

export const g2u1DistillLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-dt" });
  const { f, tm } = lab;
  const pl = plot({ x: 208, y: 34, w: 126, h: 150, x0: 0, x1: TMAX, y0: 20, y1: 110, xl: "가열 시간(분)", yl: "온도(℃)", xt: [7, 14, 21], yt: [40, 60, 80, 100] });
  const chips = [[22, 189], [31, 191], [47, 190], [57, 188]].map(([x, y]) => `<path d="M${x - 2.6} ${y + 1.4} l1.6 -3.2 l3.2 .6 l1 2.6 l-2.2 1.6 Z" fill="#F1F3F5" stroke="#ADB5BD" stroke-width=".8"/>`).join("");
  const ice = [[85, 164, 8, 12], [115, 163, 8, -10], [85, 177, 7, -8], [116, 178, 7, 14]].map(([x, y, w, a]) => `<rect x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${w}" rx="2" fill="#E6F6FF" fill-opacity=".9" stroke="#9BD0F2" stroke-width="1" transform="rotate(${a} ${x} ${y})"/>`).join("");
  f.stage.innerHTML = `${svgOpen}
    ${pl.svg}
    <g class="g2u1x-dt-cuts"></g><g class="g2u1x-dt-lines"></g>
    ${heater(4, 200, 72)}
    <path class="g2u1x-dt-mix" d="M19.6 172 H60.4 L67 183.5 Q69 191 62 192 H18 Q11 191 13 183.5 Z" fill="#9FB8F5" opacity=".6"/>
    ${chips}
    <path d="M33 98 V148 L11 186 a6 6 0 0 0 5.2 9 H63.8 a6 6 0 0 0 5.2 -9 L47 148 V98" stroke="${P.glass}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M47 125 L62 129 H90 Q100 129 100 139 V156" stroke="${P.glass}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="30" y="90" width="20" height="9" rx="3" fill="#59657A" stroke="#C8D2DE" stroke-width="1"/>
    <rect x="37.5" y="70" width="5" height="58" rx="2.5" fill="rgba(255,255,255,.14)" stroke="${P.glass}" stroke-width="1.2"/>
    <path d="M40 124 V100" stroke="${P.hot}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="40" cy="127" r="3.6" fill="${P.hot}"/>
    <rect x="80" y="160" width="40" height="44" rx="5" fill="${P.cold}" opacity=".3"/>
    ${ice}
    <path d="M78 150 V200 a6 6 0 0 0 6 6 H116 a6 6 0 0 0 6 -6 V150 M74 150 H126" stroke="${P.glass}" stroke-width="2" stroke-linecap="round"/>
    <rect x="130" y="187" width="74" height="4" rx="2" fill="#59657A"/>
    <rect x="132" y="187" width="3" height="19" fill="#59657A"/><rect x="199" y="187" width="3" height="19" fill="#59657A"/>
    <rect x="128" y="205" width="78" height="5" rx="2" fill="#59657A"/>
    <g class="g2u1x-dt-tubes"></g>
    <circle class="g2u1x-dt-drop" cx="${ICE_X}" cy="159" r="2.6" fill="#DCE7F5" opacity="0"/>
    <text class="g2u1x-dt-t" x="40" y="62" text-anchor="middle" font-size="18" font-weight="800" fill="${P.text}">25.0 ℃</text>
    <text x="100" y="20" text-anchor="middle" font-size="12.5" font-weight="700" fill="${P.dim}">물 + 에탄올 혼합물</text>
  </svg>`;
  const q = <T extends Element>(s: string): T => f.stage.querySelector(s) as T;
  const lines = q<SVGGElement>(".g2u1x-dt-lines");
  const cuts = q<SVGGElement>(".g2u1x-dt-cuts");
  const tubes = q<SVGGElement>(".g2u1x-dt-tubes");
  const drop = q<SVGCircleElement>(".g2u1x-dt-drop");
  const tEl = q<SVGTextElement>(".g2u1x-dt-t");

  let cur = 0; // 지금 받고 있는 시험관
  let got: number[][] = [0, 1, 2, 3].map(() => [0, 0, 0, 0]); // 시험관마다 구간별로 받은 시간
  let lastT = 0;
  let segT = 0; // 지금 시험관으로 받기 시작한 때(그래프의 구간 이름 자리)
  let tries = 0;

  /** 시험관 하나: 가운데 x, 입구 top, 바닥 bot, 폭 w. 모인 액체의 색은 에탄올(보라), 물(파랑), 섞임(회색). */
  function tubeSvg(i: number, x: number, top: number, bot: number, w: number): string {
    const g = got[i];
    const sum = g[1] + g[2] + g[3];
    const h = Math.min(30, sum * 3.2);
    const pure = sum > 0 ? Math.max(g[1], g[3]) / sum : 1;
    const fill = pure < 0.8 ? "#9A9FB5" : g[1] >= g[3] ? P.ethanol : P.water;
    const r = w / 2;
    const liq = h > 0.4 ? `<rect class="g2u1x-dt-fill" data-i="${i}" x="${x - r + 2}" y="${fx(bot - 2 - h)}" width="${w - 4}" height="${fx(h)}" rx="${fx(Math.min(r - 2, h / 2))}" fill="${fill}" opacity=".85"/>` : "";
    return `${liq}<path d="M${x - r} ${top} V${bot - r} a${r} ${r} 0 0 0 ${w} 0 V${top} M${x - r - 2.5} ${top} h${w + 5}" stroke="${P.glass}" stroke-width="1.8"/>
      <text x="${x}" y="224" text-anchor="middle" font-size="12" font-weight="800" fill="${i === cur ? P.yellow : P.dim}" class="g2u1x-dt-nm" data-i="${i}">${NAME[i]}</text>`;
  }
  /** 지금 받는 시험관은 얼음물 속에, 다 받은 시험관은 시험관대에 차례로 세운다. 아직 쓰지 않은 시험관은 그리지 않는다. */
  function paintTubes(): void {
    let s = "";
    for (let i = 0; i < cur; i++) s += tubeSvg(i, RACK_X[i], 170, 204, 12);
    s += tubeSvg(cur, ICE_X, 138, 198, 14);
    tubes.innerHTML = s;
  }
  /** 그래프에 시험관 이름: 그 시험관으로 받은 구간의 가운데 아래쪽. */
  function segName(i: number, t0: number, t1: number): void {
    cuts.insertAdjacentHTML("beforeend", `<text x="${fx(pl.px((t0 + t1) / 2))}" y="${pl.py(20) - 6}" text-anchor="middle" font-size="12" font-weight="800" fill="${P.yellow}" stroke="#0E1A2C" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${NAME[i]}</text>`);
  }
  const bSwap = bvBtn("", "다음 시험관으로 바꾸기");
  bSwap.dataset.k = "swap";
  bSwap.addEventListener("click", () => {
    if (cur >= 3) return;
    haptic(HAPTIC.tap);
    cuts.insertAdjacentHTML("afterbegin", `<path d="M${fx(pl.px(lastT))} ${pl.py(20)} V${pl.py(110)}" stroke="${P.yellow}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
    segName(cur, segT, lastT);
    segT = lastT;
    cur += 1;
    bSwap.textContent = cur < 3 ? `다음 시험관으로 바꾸기 (지금 ${NAME[cur]})` : "마지막 시험관 (라)";
    bSwap.disabled = cur >= 3;
    paintTubes();
    f.say(`시험관 <b>${NAME[cur]}</b>로 바꿨어요. 계속 가열하며 그래프가 꺾이는 때를 지켜보세요.`);
    lab.todo(".g2u1x-hold");
  });

  function run(): void {
    cur = 0;
    got = [0, 1, 2, 3].map(() => [0, 0, 0, 0]);
    lastT = 0;
    segT = 0;
    lines.innerHTML = "";
    cuts.innerHTML = "";
    bSwap.disabled = false;
    bSwap.textContent = "다음 시험관으로 바꾸기 (지금 (가))";
    paintTubes();
    const hold = g1Curve(lab, pl, lines, {
      tMax: TMAX,
      ms: 7600,
      f: temp,
      color: P.rose,
      onTick: (t, v) => {
        got[cur][region(t)] += t - lastT;
        lastT = t;
        tEl.textContent = `${fx(v)} ℃`;
        drop.setAttribute("opacity", region(t) > 0 && Math.floor(t * 4) % 2 ? "1" : "0");
        paintTubes();
        // 검사 길잡이: 구간이 바뀐 직후에 시험관을 바꾼다
        if (cur < 3 && t >= EDGE[cur + 1] + 0.15) lab.todo("[data-k='swap']");
      },
      onEnd: () => {
        drop.setAttribute("opacity", "0");
        segName(cur, segT, TMAX);
        bSwap.disabled = true;
        tm.later(grade, 500);
      },
    });
    f.slot.setControls(hold, bSwap);
    api.setCTA("가열하며 제때 시험관을 바꿔 보세요", { enabled: false });
    lab.todo(".g2u1x-hold");
  }

  function grade(): void {
    const pick = (r: number): number => got.findIndex((g) => {
      const sum = g[1] + g[2] + g[3];
      return sum > 0 && g[r] / sum >= 0.8 && g[r] >= (EDGE[r + 1] - EDGE[r]) * 0.65;
    });
    const eth = pick(1);
    const wat = pick(3);
    if (eth < 0 || wat < 0) {
      tries += 1;
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = String(tries);
      f.say("회색 시험관에는 에탄올과 물이 <b>섞여</b> 모였어요. 그래프가 <b>꺾일 때마다</b> 시험관을 바꿔 다시 해 봐요.");
      const again = bvBtn("main", "혼합물을 새로 넣고 다시 하기");
      again.dataset.k = "again";
      again.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        tEl.textContent = "25.0 ℃";
        f.say("온도가 <b>평평해지기 시작할 때</b>, <b>다시 오를 때</b>, <b>다시 평평해질 때</b> 시험관을 바꿔요.");
        run();
      });
      f.slot.setControls(again);
      api.setCTA("다시 해 보세요", { enabled: false });
      lab.todo("[data-k='again']");
      return;
    }
    haptic(HAPTIC.correct);
    f.pips(1);
    f.say(`평평한 두 구간의 액체가 시험관 ${NAME[eth]}와 ${NAME[wat]}에 따로 모였어요. 무엇인지 확인해 봐요.`);
    const bSmell = bvBtn("", `${NAME[eth]}의 냄새 맡아 보기`);
    const bPaper = bvBtn("", `${NAME[wat]}에 푸른 염화 코발트 종이 대기`);
    bSmell.dataset.k = "smell";
    bPaper.dataset.k = "paper";
    const done = new Set<string>();
    const after = (): void => {
      f.pips(1 + (done.size === 2 ? 1 : 0));
      if (done.size < 2) return lab.todo(done.has("smell") ? "[data-k='paper']" : "[data-k='smell']");
      lab.todo();
      tm.later(
        () =>
          lab.judge(
            "<b>첫 번째 평평한 구간</b>에서 주로 끓어 나온 물질과 그 까닭은?",
            [{ t: "에탄올, 물보다 끓는점이 낮아서", ok: true }, { t: "물, 에탄올보다 끓는점이 낮아서" }, { t: "에탄올, 물보다 양이 많아서" }],
            "약 78 ℃의 구간에서 나온 액체에서 <b>소독용 알코올 냄새</b>가 났어요.",
            () => lab.finish("끓는점이 <b>낮은</b> 에탄올이 먼저 끓어 나오고, 끓는점이 높은 물이 나중에 나와요. 끓는점 차로 혼합물을 나누는 이 방법이 <b>증류</b>예요."),
          ),
        1300,
      );
    };
    bSmell.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      bSmell.disabled = true;
      done.add("smell");
      f.say(`시험관 ${NAME[eth]}의 액체에서 <b>소독용 알코올 냄새</b>가 나요. 에탄올이에요.`);
      after();
    });
    bPaper.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      bPaper.disabled = true;
      done.add("paper");
      f.say(`시험관 ${NAME[wat]}의 액체를 묻히자 푸른 종이가 <b>붉게</b> 변했어요. 물이에요.`);
      after();
    });
    f.slot.setControls(g1Row(bSmell), g1Row(bPaper));
    api.setCTA("두 시험관의 액체를 확인해 보세요", { enabled: false });
    lab.todo("[data-k='smell']");
  }

  f.say("버튼을 <b>꾹 눌러</b> 가열해요. 그래프가 꺾일 때 손을 떼고 <b>시험관을 바꿔</b> 나오는 액체를 나눠 받아요.");
  run();
  return lab.cleanup;
};
