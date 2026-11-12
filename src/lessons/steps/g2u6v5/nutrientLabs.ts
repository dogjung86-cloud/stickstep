// [중2 Ⅵ v5] 영양소 검출 랩 두 판(g2u6l1). 책의 탐구 「음식물에 들어 있는 영양소 검출하기」를 둘로 나눴다.
//
// g2u6PlateLab 「음식물마다 어떤 영양소가 들어 있을까요?」
//   책의 과정 1~2: 홈판의 세로줄에 증류수, 밥물, 양파즙, 달걀흰자액, 식용유를 넣고
//   가로줄 (가)에 아이오딘-아이오딘화 칼륨 용액, (나)에 뷰렛 용액, (다)에 수단 Ⅲ 용액을 떨어뜨려 색깔 변화를 본다.
//   학생이 정하는 것: 어느 시약을 어느 홈에 떨어뜨릴지(열다섯 홈). 증류수 줄을 채울지.
//   실패하는 길: 증류수 줄을 비운 채 결과를 읽으려 하면 시약 자체의 색과 견줄 수 없다고 막는다.
//   결과: 밥물 = 아이오딘 청람색, 달걀흰자액 = 뷰렛 보라색, 식용유 = 수단 Ⅲ 선홍색, 양파즙과 증류수는 변화 없음.
//
// g2u6BenedictLab 「양파즙에는 아무 영양소도 없을까요?」
//   책의 과정 3~4: 시험관 다섯 개에 베네딕트 용액을 넣고 뜨거운 물에 5분 담근다. 양파즙만 황적색.
//   학생이 정하는 것: 베네딕트 용액을 넣은 뒤 그대로 둘지, 뜨거운 물에 담글지.
//   실패하는 길: 가열하지 않으면 다섯 시험관 모두 푸른색 그대로다. 용액을 넣지 않고 데우면 아무 일도 없다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, g6Lab, g6Svg, good, mix, onStageTap, pipette, row, tag, tap, toast, tube, txt, type G6Step } from "./kit";

const SAMPLES = ["증류수", "밥물", "양파즙", "달걀흰자액", "식용유"];
const SAMPLE_FILL = ["rgba(225,238,255,.28)", "rgba(245,245,238,.75)", "rgba(240,232,170,.6)", "rgba(250,244,214,.7)", "rgba(245,208,80,.85)"];

interface Reagent {
  key: string;
  name: string;
  full: string;
  row: string;
  plain: string;
  hit: string;
  hitName: string;
  target: number;
  nutrient: string;
}
const REAGENTS: Reagent[] = [
  { key: "iod", name: "아이오딘", full: "아이오딘-아이오딘화 칼륨 용액", row: "(가)", plain: "#B98A45", hit: P.iodineBlue, hitName: "청람색", target: 1, nutrient: "녹말" },
  { key: "biu", name: "뷰렛", full: "뷰렛 용액", row: "(나)", plain: "#9CCBEA", hit: P.biuretViolet, hitName: "보라색", target: 3, nutrient: "단백질" },
  { key: "sud", name: "수단 Ⅲ", full: "수단 Ⅲ 용액", row: "(다)", plain: "#E3B1A6", hit: P.sudanRed, hitName: "선홍색", target: 4, nutrient: "지방" },
];

export const g2u6PlateLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-plate", wait: "시약을 골라 홈에 떨어뜨려 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "다섯 가지 시료를 세로줄에 담은 홈판. 가로줄마다 다른 시약을 떨어뜨린다");
  const filled = new Set<string>(); // "행-열"
  let cur = 0;
  let last = "";
  let reading = false;

  const X = (c: number): number => 72 + c * 62;
  const Y = (r: number): number => 70 + r * 56;
  const draw = (): void => {
    let out = `<rect x="38" y="36" width="302" height="186" rx="16" fill="rgba(200,225,255,.06)" stroke="${P.glass}" stroke-width="1.5"/>`;
    SAMPLES.forEach((n, c) => (out += txt(X(c), 24, n, { size: 12, fill: P.hi })));
    REAGENTS.forEach((rg, r) => {
      const on = r === cur && !reading;
      out += `<circle cx="19" cy="${Y(r)}" r="15" fill="${on ? "#33496E" : "#1B2A44"}" stroke="${on ? "#9CC2FF" : "#3A4D6E"}" stroke-width="${on ? 2 : 1}"/>${txt(19, Y(r) + 4.5, rg.row, { size: 12, fill: on ? "#fff" : P.dim })}`;
      SAMPLES.forEach((_, c) => {
        const k = `${r}-${c}`;
        const has = filled.has(k);
        const hit = has && rg.target === c;
        out += `<g data-k="w${k}"><circle cx="${X(c)}" cy="${Y(r)}" r="26" fill="transparent"/><circle cx="${X(c)}" cy="${Y(r)}" r="21" fill="${SAMPLE_FILL[c]}" stroke="${on ? "#9CC2FF" : P.glass}" stroke-width="${on ? 1.8 : 1.3}"/>`;
        if (has) out += `<circle${last === k ? ` class="g2u6x-pop"` : ""} cx="${X(c)}" cy="${Y(r)}" r="${hit ? 18 : 11}" fill="${hit ? rg.hit : rg.plain}" opacity="${hit ? 0.96 : 0.8}"/>`;
        out += `</g>`;
        if (reading && hit) out += tag(X(c), Y(r) + 5, rg.hitName, { size: 12, bg: "#0E1A2E", stroke: "#fff" });
      });
    });
    if (last && !reading) {
      const [r, c] = last.split("-").map(Number);
      out += pipette(X(c), Y(r) - 18, REAGENTS[r].plain);
    }
    stage.set(out);
    host.dataset.g6Filled = String(filled.size);
  };

  const chips = REAGENTS.map((rg, r) =>
    chip(rg.key, rg.name, `${rg.row} 줄`, () => {
      if (reading) return;
      tap();
      cur = r;
      chips.forEach((c, i) => c.on(i === r));
      last = "";
      draw();
      f.say(`<b>${rg.full}</b>을 골랐어요. ${rg.row} 줄의 홈을 눌러 한 방울씩 떨어뜨려요.`);
    }),
  );
  const read = bvBtn("main g2u6x-go", "색깔 변화 읽기");
  read.disabled = true;

  onStageTap(stage, (key) => {
    if (reading || !key.startsWith("w")) return;
    const k = key.slice(1);
    const [r, c] = k.split("-").map(Number);
    const rg = REAGENTS[r];
    if (r !== cur) {
      tap();
      f.say(`그 줄은 ${rg.row} 줄이에요. 아래에서 <b>${rg.name}</b> 시약을 먼저 골라요.`);
      return;
    }
    if (filled.has(k)) return;
    filled.add(k);
    last = k;
    draw();
    if (rg.target === c) {
      good();
      f.say(`${SAMPLES[c]}${c === 1 ? "이" : "가"} <b>${rg.hitName}</b>으로 변했어요.`);
    } else {
      tap();
      f.say(`${SAMPLES[c]}${c === 1 || c === 2 || c === 3 ? "은" : "는"} 색이 변하지 않았어요. 시약의 색 그대로예요.`);
    }
    const foods = [...filled].filter((x) => !x.endsWith("-0")).length;
    f.pips(foods >= 12 ? 1 : 0);
    if (foods >= 12) read.disabled = false;
    if (REAGENTS.every((_, i) => SAMPLES.every((__, j) => filled.has(`${i}-${j}`))) && !chips[r].el.classList.contains("done")) chips.forEach((ch) => ch.done());
  });

  read.addEventListener("click", () => {
    if (reading) return;
    const water = [0, 1, 2].filter((r) => filled.has(`${r}-0`)).length;
    if (water < 3) {
      bad();
      lab.slip();
      host.dataset.g6Fail = "water";
      toast(lab, "증류수 줄이 비어 있어요", true);
      f.say("증류수에도 떨어뜨려야 <b>시약 자체의 색</b>과 견줄 수 있어요. 증류수 줄을 채워요.");
      return;
    }
    tap();
    reading = true;
    host.dataset.g6Fail = "";
    f.pips(2);
    draw();
    f.say("증류수 줄과 색이 <b>다른 홈</b>이 반응이 일어난 곳이에요.");
    tm.later(() => {
      lab.judge("달걀흰자액은 <b>뷰렛 용액</b>에만 색이 변했어요. 들어 있는 영양소는?", [{ t: "단백질", ok: true }, { t: "녹말" }, { t: "지방" }], "보라색은 뷰렛 용액이 <b>단백질</b>과 반응한 색이에요.", () =>
        lab.finish("밥물에는 <b>녹말</b>, 달걀흰자액에는 <b>단백질</b>, 식용유에는 <b>지방</b>이 들어 있어요. 양파즙은 세 시약 모두 변화가 없었어요."),
      );
    }, 900);
  });

  f.slot.setControls(row(...chips.map((c) => c.el)), read);
  chips[0].on(true);
  draw();
  f.say("세로줄마다 다른 시료가 담겨 있어요. <b>(가) 줄</b>의 홈을 눌러 아이오딘 용액부터 떨어뜨려요.");
  return lab.cleanup;
};

// ── 베네딕트 반응 ──────────────────────────────────────────────────
const BLUE = "#4FA8E8";
const HEAT_STEPS = ["#4FA8E8", "#58B58C", "#C9B93E", "#E0792A"];

export const g2u6BenedictLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 2, cls: "g2u6x-bene", wait: "베네딕트 용액으로 검사해 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "증류수, 밥물, 양파즙, 달걀흰자액, 식용유가 담긴 시험관 다섯 개");
  let added = false;
  let bath: "none" | "room" | "hot" = "none";
  let heat = 0; // 0~1
  let busy = false;

  const X = (i: number): number => 45 + i * 64;
  const draw = (pop = false): void => {
    let out = "";
    if (bath === "hot") out += `<rect x="10" y="96" width="326" height="92" rx="12" fill="rgba(255,140,100,.20)" stroke="#E79A7C" stroke-width="1.6"/>${[60, 140, 220, 300].map((x, i) => `<path class="g2u6x-rise d${i % 3}" d="M${x} 92 q5 -8 0 -16 q-5 -8 0 -16" fill="none" stroke="#FFC2AC" stroke-width="2" stroke-linecap="round" opacity=".7"/>`).join("")}`;
    else out += `<line x1="14" y1="184" x2="332" y2="184" stroke="#3B5273" stroke-width="2"/>`;
    SAMPLES.forEach((n, i) => {
      let col = SAMPLE_FILL[i];
      if (added) {
        const seg = Math.min(2.999, heat * 3);
        col = i === 2 ? mix(HEAT_STEPS[Math.floor(seg)], HEAT_STEPS[Math.floor(seg) + 1], seg - Math.floor(seg)) : BLUE;
      }
      out += tube(X(i), 50, 126, col, 0.58, 13, pop ? "g2u6x-pop" : "");
      if (added && i === 4) out += `<rect x="${X(i) - 11.5}" y="${50 + 126 * 0.42}" width="23" height="12" fill="rgba(245,208,80,.9)"/>`;
      out += txt(X(i), 30, n, { size: 12, fill: P.hi });
      if (heat < 1 && bath === "hot" && i === 2) out += txt(173, 214, "뜨거운 물에 담가 둔 시험관", { size: 12, fill: "#FFC2AC" });
      if (heat >= 1) out += tag(X(i), 214, i === 2 ? "황적색" : "변화 없음", { size: 12, fill: i === 2 ? "#FFD2A8" : P.dim });
    });
    stage.set(out);
    host.dataset.g6Added = added ? "1" : "0";
    host.dataset.g6Heat = String(heat);
  };

  const cAdd = chip("add", "베네딕트 용액", "두세 방울씩 넣기", () => {
    if (busy || added) return;
    good();
    added = true;
    cAdd.done();
    f.pips(1);
    draw(true);
    f.say("다섯 시험관이 모두 <b>푸른색</b>이 됐어요. 이제 어떻게 둘까요?");
  });
  const wait = (hot: boolean): void => {
    if (busy) return;
    if (!added) {
      bad();
      f.say("아직 시약을 넣지 않았어요. <b>베네딕트 용액</b>부터 넣어요.");
      return;
    }
    busy = true;
    tap();
    bath = hot ? "hot" : "room";
    draw();
    f.say(hot ? "뜨거운 물에 담그고 5분을 기다려요." : "시험관대에 그대로 두고 5분을 기다려요.");
    if (!hot) {
      tm.later(() => {
        bad();
        lab.slip();
        host.dataset.g6Fail = "cold";
        toast(lab, "색이 변하지 않았어요", true);
        f.say("5분이 지나도 모두 푸른색 그대로예요. 베네딕트 용액은 <b>가열해야</b> 반응해요.");
        bath = "none";
        busy = false;
        draw();
      }, 1500);
      return;
    }
    bvTween(tm, 1800, (t) => {
      heat = t;
      draw();
    }, () => {
      heat = 1;
      host.dataset.g6Fail = "";
      draw();
      good();
      f.say("양파즙만 <b>황적색</b>으로 변했어요. 나머지는 푸른색 그대로예요.");
      tm.later(() => {
        lab.judge("가열하자 <b>양파즙</b>만 황적색으로 변했어요. 양파즙에 들어 있는 것은?", [{ t: "포도당 같은 당분", ok: true }, { t: "녹말" }, { t: "단백질" }], "베네딕트 용액은 <b>당분</b>을 만나 가열되면 황적색이 돼요.", () =>
          lab.finish("양파즙에는 포도당 같은 <b>당분</b>이 들어 있어요. 베네딕트 용액은 넣고 <b>가열해야</b> 색이 변해요. 당분과 녹말은 모두 탄수화물이에요."),
        );
      }, 1400);
    });
  };
  const cRoom = chip("room", "그대로 두기", "시험관대에 5분", () => wait(false));
  const cHot = chip("hot", "뜨거운 물에 담그기", "80~90 ℃에 5분", () => wait(true));
  f.slot.setControls(row(cAdd.el), row(cRoom.el, cHot.el));
  draw();
  f.say("앞의 세 시약에 변화가 없던 양파즙을 <b>베네딕트 용액</b>으로 다시 검사해요.");
  return lab.cleanup;
};
