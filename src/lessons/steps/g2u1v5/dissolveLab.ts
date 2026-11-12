// [중2 Ⅰ v5] g2u1l3 녹이기 랩: 「물 10 g에 얼마나 녹을까요?」
// 책의 탐구 1을 손으로 한다: 자석 젓개 위 유리병의 실온의 물 10 g에 질산 칼륨(또는 황산 구리(Ⅱ))을 0.5 g씩 넣어 더 녹지 않을 때까지의 양을 적는다.
// 학생이 정하는 것: 어느 물질부터 할지, 몇 번 넣을지, 언제 한계라고 적을지.
// 실패하는 길: 바닥에 남은 것이 없는데 한계라고 적으면 받아 주지 않는다(아직 더 녹는다).
// 통찰 하나: 일정한 양의 물에 녹는 양에는 한계가 있고, 그 한계는 물질마다 다르다.
// 수치: 20 ℃ 물 100 g에 질산 칼륨 31.6 g, 황산 구리(Ⅱ) 약 20 g(자연값)이므로 0.5 g 걸음으로는 3.0 g, 2.0 g까지 다 녹는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn } from "../bio6/b6Lab";
import { P, fx, g1Lab, g1Log, g1Row, g1Seg, seeded, svgOpen, type G1Step } from "./g2u1Kit";

const SOL = [
  { name: "질산 칼륨", eul: "질산 칼륨을", eun: "질산 칼륨은", limit: 3.0, grain: "#F4F7FB", tint: "#4DABF7" },
  { name: "황산 구리(Ⅱ)", eul: "황산 구리(Ⅱ)를", eun: "황산 구리(Ⅱ)는", limit: 2.0, grain: "#3B9BE8", tint: "#2F8BE0" },
];
const B = { x: 44, y: 62, w: 92, h: 122 }; // 유리병
const CXB = B.x + B.w / 2;

export const g2u1DissolveLab: StepRenderer = (host, step, api) => {
  const lab = g1Lab(host, api, step as unknown as G1Step, { steps: 3, cls: "g2u1x-ds" });
  const { f, tm } = lab;
  const rnd = seeded(31);
  f.stage.innerHTML = `${svgOpen}
    <rect x="${B.x - 22}" y="${B.y + B.h + 4}" width="${B.w + 44}" height="24" rx="7" fill="#3A4660" stroke="#8B9BB0" stroke-width="1.4"/>
    <text x="${CXB}" y="${B.y + B.h + 21}" text-anchor="middle" font-size="12" font-weight="700" fill="${P.dim}">자석 젓개</text>
    <rect class="g2u1x-ds-liq" x="${B.x + 3}" y="${B.y + 34}" width="${B.w - 6}" height="${B.h - 37}" rx="6" fill="#4DABF7" opacity=".3"/>
    <g class="g2u1x-ds-pile"></g>
    <rect class="g2u1x-ds-bar" x="${CXB - 13}" y="${B.y + B.h - 9}" width="26" height="6" rx="3" fill="#F2F4F7" stroke="#8B9BB0" stroke-width="1"/>
    <g class="g2u1x-ds-fall"></g>
    <path d="M${B.x} ${B.y + 14} V${B.y + B.h - 8} a8 8 0 0 0 8 8 h${B.w - 16} a8 8 0 0 0 8 -8 V${B.y + 14}" stroke="${P.glass}" stroke-width="2.4"/>
    <path d="M${B.x} ${B.y + 14} q0 -10 14 -12 M${B.x + B.w} ${B.y + 14} q0 -10 -14 -12" stroke="${P.glass}" stroke-width="2.4"/>
    <path d="M${CXB - 26} ${B.y - 34} L${CXB - 5} ${B.y - 8} V${B.y + 10} M${CXB + 26} ${B.y - 34} L${CXB + 5} ${B.y - 8} V${B.y + 10} M${CXB - 28} ${B.y - 34} h56" stroke="${P.glass}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
  const log = g1Log(lab, "r");
  const liq = f.stage.querySelector(".g2u1x-ds-liq") as SVGRectElement;
  const pile = f.stage.querySelector(".g2u1x-ds-pile") as SVGGElement;
  const fall = f.stage.querySelector(".g2u1x-ds-fall") as SVGGElement;

  let cur = 0;
  const added = [0, 0];
  const rec: Array<number | null> = [null, null];

  function paint(): void {
    const s = SOL[cur];
    const dis = Math.min(added[cur], s.limit);
    const left = added[cur] - dis;
    liq.setAttribute("fill", s.tint);
    liq.setAttribute("opacity", (0.3 + (cur === 1 ? 0.5 : 0.12) * (dis / s.limit)).toFixed(2));
    let g = "";
    const n = Math.round(left * 12);
    const r2 = seeded(7 + cur);
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 9);
      g += `<circle cx="${(CXB - 32 + (i % 9) * 8 + r2() * 4).toFixed(1)}" cy="${(B.y + B.h - 8 - row * 5 - r2() * 2).toFixed(1)}" r="3" fill="${s.grain}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`;
    }
    pile.innerHTML = g;
    const rows = [`실온의 물 <b>10 g</b>`, `${s.name}`, `넣은 양 <b class="k">${fx(added[cur])} g</b>`, `바닥에 남은 것 <b class="${left > 0 ? "w" : ""}">${left > 0 ? "있음" : "없음"}</b>`];
    SOL.forEach((x, i) => {
      if (rec[i] !== null) rows.push(`${x.name} 최대 <b>${fx(rec[i] as number)} g</b>`);
    });
    log.set(rows);
    host.dataset.g2u1Ds = `${cur}:${added[cur]}`;
  }

  const seg = g1Seg("g2u1x-ds-seg", SOL.map((s) => s.name), (i) => {
    cur = i;
    seg.set(i);
    paint();
    f.say(`<b>${SOL[i].eul}</b> 넣을 병이에요. 0.5 g씩 넣으며 더 녹지 않는 때를 찾아보세요.`);
    sync();
  });
  const bAdd = bvBtn("main", "0.5 g 넣기");
  bAdd.dataset.k = "add";
  const bRec = bvBtn("", "한계라고 적기");
  bRec.dataset.k = "rec";

  function sync(): void {
    const s = SOL[cur];
    bAdd.disabled = rec[cur] !== null || added[cur] >= s.limit + 1.5;
    bRec.disabled = rec[cur] !== null || added[cur] === 0;
    const doneN = rec.filter((x) => x !== null).length;
    f.pips(doneN);
    if (doneN === 2) return;
    api.setCTA(rec[cur] !== null ? "다른 물질도 녹여 보세요" : "더 녹지 않을 때까지 넣어 보세요", { enabled: false });
    if (rec[cur] !== null) lab.todo(`.g2u1x-ds-seg [data-k='${1 - cur}']`);
    else lab.todo(added[cur] > s.limit ? "[data-k='rec']" : "[data-k='add']");
  }
  bAdd.addEventListener("click", () => {
    const s = SOL[cur];
    haptic(HAPTIC.tap);
    added[cur] = Math.round((added[cur] + 0.5) * 10) / 10;
    let g = "";
    for (let i = 0; i < 7; i++) g += `<circle cx="${(CXB - 5 + rnd() * 10).toFixed(1)}" cy="${(B.y - 6 - rnd() * 22).toFixed(1)}" r="2.6" fill="${s.grain}"/>`;
    fall.innerHTML = g;
    fall.classList.remove("go");
    void fall.getBoundingClientRect();
    fall.classList.add("go");
    bAdd.disabled = true;
    tm.later(() => {
      paint();
      const over = added[cur] > s.limit;
      if (over && added[cur] - s.limit <= 0.5) {
        haptic(HAPTIC.wrong);
        f.say(`이번 0.5 g은 저어도 <b>녹지 않고 바닥에 남았어요</b>. 한계를 넘은 거예요.`);
      } else if (over) f.say("더 넣어도 바닥에 <b>쌓이기만</b> 해요. 이제 한계를 적어 보세요.");
      else f.say(`${fx(added[cur])} g까지 저으니 <b>다 녹았어요</b>. 바닥에 남은 것이 없어요.`);
      sync();
    }, 650);
  });
  bRec.addEventListener("click", () => {
    const s = SOL[cur];
    if (added[cur] <= s.limit) {
      haptic(HAPTIC.wrong);
      host.dataset.g2u1Fail = "1";
      f.say("바닥에 <b>남은 것이 없어요</b>. 아직 더 녹을 수 있으니 한계가 아니에요. 더 넣어 보세요.");
      return;
    }
    haptic(HAPTIC.correct);
    rec[cur] = s.limit;
    seg.btns[cur].classList.add("used");
    paint();
    f.say(`${s.eun} 물 10 g에 <b>${fx(s.limit)} g</b>까지 녹고 그다음부터 남았어요. 표에 적었어요.`);
    sync();
    if (rec.every((x) => x !== null)) tm.later(ask, 1100);
  });

  function ask(): void {
    f.say("같은 물 10 g인데 질산 칼륨은 3.0 g, 황산 구리(Ⅱ)는 2.0 g까지 녹았어요.");
    lab.judge(
      "질산 칼륨은 물 10 g에 3.0 g까지 녹았어요. 같은 온도의 물이 <b>100 g</b>이라면?",
      [{ t: "약 30 g까지 녹는다", ok: true }, { t: "똑같이 3.0 g까지 녹는다" }, { t: "넣는 대로 모두 녹는다" }],
      "물이 10배면 녹을 수 있는 양도 10배예요. 그래도 <b>한계</b>는 있어요.",
      () => lab.finish("일정한 양의 물에 녹는 양에는 <b>한계</b>가 있고, 그 한계는 <b>물질마다</b> 달라요. 질산 칼륨 3.0 g, 황산 구리(Ⅱ) 2.0 g."),
    );
  }

  seg.set(0);
  paint();
  f.slot.setControls(seg.el, g1Row(bAdd, bRec));
  f.say("실온의 물 10 g이 든 병이에요. <b>0.5 g씩</b> 넣으며 더 녹지 않는 때를 찾아보세요.");
  sync();
  return lab.cleanup;
};
