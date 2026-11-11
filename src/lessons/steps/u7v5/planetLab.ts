// u7PlanetLab: 행성을 두 무리로 나누기(u7l2). 교과서 "태양계 행성 분류하기"(234쪽)를 손으로 한다.
//   교과서: 여덟 행성의 반지름, 질량, 위성 수 그래프를 견주어 두 집단으로 나누고 집단마다 공통점을 정리한다.
//   랩   : 세 그래프를 바꿔 가며 보고, 가르는 선을 직접 옮겨 두 무리로 나눈다. 엉뚱한 자리에서 가르면 왜 안 되는지 그래프가 보여 준다.
// 정본에는 이 레슨에 손으로 하는 랩이 없었다(표 읽기뿐). 이 랩 뒤에 정본의 표가 그대로 이어져 표면과 고리를 보탠다.
// 값은 지구를 1로 한 자연값이다(반지름, 질량). 위성 수는 2023년에 알려진 수다(해마다 새로 발견되어 늘어난다).
// 행성 그림은 실사 사진이다(public/photos). 무대는 SVG 하나로 그린다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvRange, bvTimers } from "../bio6/b6Lab";
import { u7Frame } from "./kit";

interface PlanetStep {
  title: string;
  cta?: string;
}

const PLANETS: { name: string; img: string }[] = [
  { name: "수성", img: "mercury.jpg" },
  { name: "금성", img: "venus.jpg" },
  { name: "지구", img: "earth_apollo17.jpg" },
  { name: "화성", img: "mars.jpg" },
  { name: "목성", img: "jupiter.jpg" },
  { name: "토성", img: "saturn_cassini.jpg" },
  { name: "천왕성", img: "uranus.jpg" },
  { name: "해왕성", img: "neptune.jpg" },
];
type MetricKey = "radius" | "mass" | "moons";
const METRICS: Record<MetricKey, { name: string; unit: string; cap: string; v: number[]; show: string[] }> = {
  radius: { name: "반지름", unit: "지구 = 1", cap: "반지름(지구를 1로)", v: [0.38, 0.95, 1, 0.53, 11.2, 9.4, 4.0, 3.9], show: ["0.4", "0.9", "1", "0.5", "11.2", "9.4", "4.0", "3.9"] },
  mass: { name: "질량", unit: "지구 = 1", cap: "질량(지구를 1로)", v: [0.06, 0.82, 1, 0.11, 318, 95, 15, 17], show: ["0.06", "0.8", "1", "0.1", "318", "95", "15", "17"] },
  moons: { name: "위성 수", unit: "2023년", cap: "위성 수(2023년에 알려진 수)", v: [0, 0, 1, 2, 95, 146, 27, 14], show: ["0", "0", "1", "2", "95", "146", "27", "14"] },
};
const ORDER: MetricKey[] = ["radius", "mass", "moons"];
const RIGHT = 4; // 화성과 목성 사이

const X0 = 13;
const COL = 40;
const BASE = 170;
const TOP = 58;

export const u7PlanetLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlanetStep;
  const tm = bvTimers();
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-planet", api });
  const doneCta = s.cta ?? "용어로 정리하기";
  const photo = (file: string): string => `${import.meta.env.BASE_URL}photos/${file}`;

  let metric: MetricKey = "radius";
  const viewed = new Set<MetricKey>(["radius"]);
  let cut = 2; // 가르는 자리(1~7): cut번째 행성 앞
  let phase: "view" | "split" | "ask" | "done" = "view";
  let split = false; // 바르게 갈랐다
  host.dataset.u7Phase = phase;

  function draw(): void {
    const m = METRICS[metric];
    const max = Math.max(...m.v);
    const showCut = phase !== "view";
    let g = "";
    if (split) {
      g += `<rect x="${X0 - 5}" y="${TOP - 22}" width="${COL * RIGHT + 3}" height="${230 - TOP + 16}" rx="12" fill="rgba(110,170,255,.13)"/>`;
      g += `<rect x="${X0 + COL * RIGHT + 2}" y="${TOP - 22}" width="${COL * (8 - RIGHT) + 3}" height="${230 - TOP + 16}" rx="12" fill="rgba(255,190,90,.14)"/>`;
    }
    g += `<path d="M${X0 - 3} ${BASE + 0.5}H${X0 + COL * 8 + 3}" stroke="#4A5F86" stroke-width="1.2"/>`;
    PLANETS.forEach((p, i) => {
      const cx = X0 + COL * i + COL / 2;
      const h = Math.max(2, (m.v[i] / max) * (BASE - TOP));
      const warm = split && i >= RIGHT;
      g += `<rect class="u7x-bar" x="${cx - 12}" y="${(BASE - h).toFixed(1)}" width="24" height="${h.toFixed(1)}" rx="5" fill="${warm ? "#FFC062" : "#7FB2FF"}"/>`;
      g += `<text x="${cx}" y="${(BASE - h - 6).toFixed(1)}" class="u7x-val">${m.show[i]}</text>`;
      g += `<clipPath id="u7pc${i}"><circle cx="${cx}" cy="${BASE + 19}" r="12.5"/></clipPath>`;
      g += `<image href="${photo(p.img)}" x="${cx - 12.5}" y="${BASE + 6.5}" width="25" height="25" preserveAspectRatio="xMidYMid slice" clip-path="url(#u7pc${i})"/>`;
      g += `<circle cx="${cx}" cy="${BASE + 19}" r="12.5" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1"/>`;
      g += `<text x="${cx}" y="${BASE + 49}" class="u7x-pname">${p.name}</text>`;
    });
    if (showCut) {
      const x = X0 + COL * cut;
      g += `<path d="M${x} ${TOP - 20}V${BASE + 54}" stroke="${split ? "#FFFFFF" : "#FFE08A"}" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>`;
      if (!split) g += `<path d="M${x - 7} ${TOP - 26}h14l-7 9z" fill="#FFE08A"/>`;
    }
    f.stage.innerHTML = `<svg viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="여덟 행성의 ${m.name} 막대그래프">${g}</svg><div class="bv-pill u7x-pill">${m.cap}</div>`;
    host.dataset.u7Metric = metric;
    host.dataset.u7Cut = String(cut);
  }

  const cards = ORDER.map((k) => bvCard("u7x-mcard", { name: METRICS[k].name, sub: METRICS[k].unit, key: k }));
  const cardRow = bvCards(3, ...cards);
  const range = bvRange({
    cls: "u7x-range",
    min: 1,
    max: 7,
    value: cut,
    label: "가르는 선을 옮겨 보세요",
    onInput: (v) => {
      cut = v;
      draw();
    },
  });
  const cutBtn = bvBtn("main", "여기서 둘로 나누기");

  function paintCards(): void {
    cards.forEach((c, i) => {
      c.on(ORDER[i] === metric);
      if (viewed.has(ORDER[i]) && !c.isDone()) c.done();
    });
  }

  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      if (phase === "ask" || phase === "done") return;
      metric = ORDER[i];
      haptic(HAPTIC.select);
      const first = !viewed.has(metric);
      viewed.add(metric);
      paintCards();
      draw();
      host.dataset.u7Seen = String(viewed.size);
      if (phase === "view") {
        if (viewed.size === ORDER.length) toSplit();
        else if (first) f.say(`${METRICS[metric].name} 그래프예요. 막대가 유난히 <b>높은 행성</b>은 어디인가요? 남은 그래프도 눌러요.`);
      }
    }),
  );

  function toSplit(): void {
    phase = "split";
    host.dataset.u7Phase = phase;
    f.pips(2);
    f.say("여덟 행성을 <b>두 무리</b>로 나눠요. 노란 선을 옮겨 가를 자리를 정해 보세요.");
    f.slot.setControls(cardRow, range.el, cutBtn);
    api.setCTA("두 무리로 나눠 보세요", { enabled: false });
    draw();
  }

  cutBtn.addEventListener("click", () => {
    if (phase !== "split") return;
    if (cut !== RIGHT) {
      haptic(HAPTIC.wrong);
      f.stage.classList.remove("u7x-shake");
      void f.stage.offsetWidth;
      f.stage.classList.add("u7x-shake");
      // 선의 양옆 두 행성(조사까지 적어 둔다)
      const pair = ["", "수성과 금성은", "금성과 지구는", "지구와 화성은", "", "목성과 토성은", "토성과 천왕성은", "천왕성과 해왕성은"][cut];
      f.say(`${pair} 한 무리로 보여요. 막대 높이가 <b>크게 뛰는 자리</b>를 찾아보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    split = true;
    phase = "ask";
    host.dataset.u7Phase = "wait";
    cutBtn.disabled = true;
    range.input.disabled = true;
    draw();
    f.say("화성과 목성 사이에서 막대 높이가 크게 뛰어요. 왼쪽 넷과 오른쪽 넷으로 나뉘었어요.");
    tm.later(ask, 1500);
  });

  function ask(): void {
    host.dataset.u7Phase = "ask";
    f.pips(3);
    f.say("세 그래프에서 본 것을 떠올리며 답해 보세요.");
    f.slot.ask(
      "오른쪽 네 행성(목성부터 해왕성)의 <b>공통점</b>은?",
      [{ t: "크고 무겁고 위성이 많아요", ok: true }, { t: "작고 가볍고 위성이 적어요" }, { t: "크지만 위성은 거의 없어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "세 그래프 모두 오른쪽 넷의 막대가 훨씬 높았어요.", onNext: conclude },
    );
  }

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = phase;
    f.pips(4);
    f.say("두 무리에는 이름이 있어요. 이어서 이름과 특징을 정리해요.");
    f.slot.conclude("작고 가볍고 위성이 적은 수성, 금성, 지구, 화성은 <b>지구형 행성</b>, 크고 무겁고 위성이 많은 목성, 토성, 천왕성, 해왕성은 <b>목성형 행성</b>이에요.");
    api.enableCTA(doneCta);
  }

  f.slot.setControls(el("div", { class: "u7x-cap", text: "그래프 셋을 하나씩 눌러 보세요" }), cardRow);
  f.say("여덟 행성의 반지름이에요. 막대가 유난히 <b>높은 행성</b>은 어디인가요? 남은 그래프도 눌러요.");
  f.pips(1);
  api.setCTA("세 그래프를 모두 봐요", { enabled: false });
  paintCards();
  draw();

  return () => tm.clear();
};
