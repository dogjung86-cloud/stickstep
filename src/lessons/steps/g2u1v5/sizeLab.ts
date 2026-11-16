// [중2 Ⅰ v5] g2u1l1 크기 랩: 「조각의 크기가 달라지면 질량 ÷ 부피는요?」
// 앞의 측정 랩에서 얻은 생각(질량 ÷ 부피)을 손으로 굳힌다: 조각의 크기를 밀면 질량과 부피는 함께 변하지만 나눈 값은 그대로다.
// 학생이 정하는 것: 금속의 종류, 조각의 크기. 크기를 바꿀 때마다 질량과 부피 그래프에 점이 찍힌다(같은 물질의 점은 원점을 지나는 한 직선 위).
// 통찰 하나: 밀도(질량 ÷ 부피)는 물질의 양에 관계없이 일정하고 물질마다 다르다.
// 수치: 밀도는 철 7.87, 알루미늄 2.70 g/cm³(자연값).

import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { P, fx, g1Lab, g1Log, g1Predict, g1Seg, josa, plot, scale, svgOpen, type G1Step } from "./g2u1Kit";

const MAT = [
  { name: "철", d: 7.87, color: P.rose },
  { name: "알루미늄", d: 2.7, color: P.green },
];
const NEED = 3;

export const g2u1SizeLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-sz" });
  const { f } = lab;
  const pl = plot({ x: 208, y: 34, w: 126, h: 150, x0: 0, x1: 20, y0: 0, y1: 160, xl: "부피(cm³)", yl: "질량(g)", xt: [10, 20], yt: [40, 80, 120, 160] });
  f.stage.innerHTML = `${svgOpen}
    ${pl.svg}
    <g class="g2u1x-sz-lines"></g><g class="g2u1x-sz-dots"></g>
    <circle class="g2u1x-sz-now" r="5.5" fill="#fff" stroke="${P.rose}" stroke-width="2.4"/>
    ${scale(22, 164, 128, "g2u1x-sz")}
    <rect class="g2u1x-sz-block" x="0" y="0" width="10" height="10" rx="4" fill="${P.metal}" stroke="${P.metalEdge}" stroke-width="1.6"/>
  </svg>`;
  const log = g1Log(lab);
  const block = f.stage.querySelector(".g2u1x-sz-block") as SVGRectElement;
  const read = f.stage.querySelector(".g2u1x-sz-read") as SVGTextElement;
  const now = f.stage.querySelector(".g2u1x-sz-now") as SVGCircleElement;
  const dots = f.stage.querySelector(".g2u1x-sz-dots") as SVGGElement;
  const lines = f.stage.querySelector(".g2u1x-sz-lines") as SVGGElement;

  let mat = 0;
  let vol = 10;
  let phase: "pred" | "play" | "end" = "pred";
  const seen: Array<Set<number>> = [new Set(), new Set()];

  function paint(): void {
    const m = MAT[mat];
    const mass = m.d * vol;
    const w = 22 + vol * 2.9;
    const h = 16 + vol * 2.1;
    block.setAttribute("x", fx(86 - w / 2));
    block.setAttribute("y", fx(164 - h));
    block.setAttribute("width", fx(w));
    block.setAttribute("height", fx(h));
    block.setAttribute("fill", mat === 0 ? "#B9C2CE" : "#DDE4EC");
    read.textContent = `${fx(mass)} g`;
    now.setAttribute("cx", fx(pl.px(vol)));
    now.setAttribute("cy", fx(pl.py(mass)));
    now.setAttribute("stroke", m.color);
    log.set([`${m.name} 조각`, `부피 <b>${vol} cm³</b>`, `질량 <b>${fx(mass)} g</b>`, `질량 ÷ 부피 <b class="k">${fx(m.d, 2)}</b>`]);
    host.dataset.g2u1Sz = `${mat}:${vol}`;
  }
  function mark(): void {
    if (phase !== "play") return;
    const s = seen[mat];
    if (!s.has(vol)) {
      s.add(vol);
      const m = MAT[mat];
      dots.insertAdjacentHTML("beforeend", `<circle cx="${fx(pl.px(vol))}" cy="${fx(pl.py(m.d * vol))}" r="3.6" fill="${m.color}"/>`);
      if (s.size === NEED) lines.insertAdjacentHTML("beforeend", `<path d="M${pl.px(0)} ${pl.py(0)} L${pl.px(20)} ${fx(pl.py(m.d * 20))}" stroke="${m.color}" stroke-width="1.6" opacity=".75"/><text x="${pl.px(20) - 2}" y="${fx(pl.py(m.d * 20) - 6)}" text-anchor="end" font-size="12" font-weight="800" fill="${m.color}">${m.name}</text>`);
    }
    progress();
  }
  function progress(): void {
    const a = seen[0].size >= NEED;
    const b = seen[1].size >= NEED;
    f.pips((a ? 1 : 0) + (b ? 1 : 0));
    if (a && b) {
      phase = "end";
      range.input.disabled = true;
      seg.lock(true);
      f.say("같은 금속의 점들은 <b>원점을 지나는 한 직선</b> 위에 놓였어요. 왼쪽의 계산값도 확인해 보세요.");
      lab.tm.later(ask, 900);
      return;
    }
    if (seen[mat].size >= NEED) {
      const o = 1 - mat;
      // 조사는 받침으로 고른다: 7.87로, 2.70으로, 철로, 알루미늄으로
      const d = fx(MAT[mat].d, 2);
      const ro = josa(MAT[o].name, "으로", "로");
      f.say(`${MAT[mat].name}${josa(MAT[mat].name, "은", "는")} 크기를 바꿔도 질량 ÷ 부피가 <b>${d}</b>${josa(d, "으로", "로")} 일정해요. 이번에는 <b>${MAT[o].name}</b>${ro} 바꿔 보세요.`);
      api.setCTA(`${MAT[o].name}${ro} 바꿔 크기를 조절해 보세요`, { enabled: false });
      lab.todo(`.g2u1x-sz-seg [data-k='${o}']`);
    } else {
      const left = NEED - seen[mat].size;
      api.setCTA(`조각의 크기를 ${left}번 더 바꿔 보세요`, { enabled: false });
      const next = [6, 14, 18, 4].find((v) => !seen[mat].has(v)) ?? 12;
      lab.todo(".g2u1x-sz-range", next);
    }
  }
  const seg = g1Seg("g2u1x-sz-seg", MAT.map((m) => m.name), (i) => {
    if (phase !== "play") return;
    mat = i;
    seg.set(i);
    paint();
    mark();
  });
  const range = bvRange({
    cls: "g2u1x-sz-range",
    min: 2,
    max: 20,
    value: vol,
    label: "조각의 크기(부피)",
    ticks: ["작게", "크게"],
    onInput: (v) => {
      vol = v;
      paint();
    },
    onChange: () => mark(),
  });

  function ask(): void {
    lab.judge(
      "같은 금속 조각의 크기를 바꿔도 <b>변하지 않는 값</b>은 무엇인가요?",
      [{ t: "질량 ÷ 부피", ok: true }, { t: "질량" }, { t: "부피" }],
      "부피가 커지면 질량도 같은 비율로 커져서 <b>질량 ÷ 부피</b> 값은 일정해요.",
      () => lab.finish("단위 부피당 질량인 <b>밀도</b>는 물질의 양에 관계없이 일정하며 물질마다 고유해요(철 7.87, 알루미늄 2.70 g/cm³)."),
    );
  }

  paint();
  f.say("저울 위에 <b>철 조각</b>이 놓여 있어요. 조각을 자르면 어떻게 될지 예측해 보세요.");
  g1Predict(lab, "철 조각을 <b>절반으로 자르면</b> 질량 ÷ 부피 값은 어떻게 될까요?", ["변하지 않고 그대로다", "절반으로 줄어든다", "두 배로 커진다"], () => {
    phase = "play";
    seg.set(0);
    f.slot.setControls(seg.el, range.el);
    f.say("막대를 움직여 <b>조각의 크기</b>를 바꿔 보세요. 크기를 바꿀 때마다 그래프에 점이 찍혀요.");
    mark();
  });
  return lab.cleanup;
};
