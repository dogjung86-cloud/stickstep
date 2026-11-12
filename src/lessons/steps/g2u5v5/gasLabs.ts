// [중2 Ⅴ v5] 투명 용기와 센서를 쓰는 랩 세 판(g2u5l2, g2u5l4, g2u5l3).
//
// g2u5SensorLab 「빛을 받은 상추는 어떤 기체를 쓰고 내놓을까요?」 (g2u5l2)
//   책의 탐구 1: 투명 용기에 상추 모종을 넣고 뚜껑을 닫아 이산화 탄소 센서와 산소 센서를 꽂은 뒤 빛을 비추며 10분 동안 잰다.
//   학생이 정하는 것: 모종을 넣을지, 뚜껑을 닫을지, 전등을 켤지. 그리고 10분 측정.
//   실패하는 길: 뚜껑을 열어 두면 바깥 공기와 섞여 변화가 없다. 모종이 없으면 변화가 없다. 전등을 끄면 이산화 탄소가 줄지 않는다.
//   전등을 켠 측정과 끈 측정을 모두 해야 판정으로 간다(두 선이 그래프에 함께 남는다).
//
// g2u5DarkLab 「빛이 없을 때 식물은 어떤 기체를 쓸까요?」 (g2u5l4)
//   같은 장치를 알루미늄박으로 감싼다. 학생이 정하는 것: 용기에 넣을 것(상추 잎, 당근 뿌리, 비워 두기).
//   잎도 뿌리도 산소가 줄고 이산화 탄소가 는다. 빈 용기는 변화가 없다(견줄 대상).
//
// g2u5DesignLab 「빛이 셀수록 광합성량이 계속 늘까요?」 (g2u5l3)
//   책의 탐구(실험 설계): 전등의 개수로 빛의 세기를 바꾸고 산소가 늘어난 양으로 광합성량을 잰다.
//   학생이 정하는 것: 켠 전등의 수와 용기의 온도. 온도까지 함께 바꾼 측정은 '온도 다름'으로 표시되고 세지 않는다(실패가 그래프에 남는다).

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, g5Lab, g5Svg, good, jar, lamp, legend, lettuce, ramp, row, stepper, tag, tap, timeGraph, toast, txt, type G5Step, type Series } from "./kit";

const GX = 172;
const GW = 164;

/** 두 그래프(이산화 탄소, 산소)를 그린다. */
const graphs = (co2: Series[], o2: Series[]): string => timeGraph(GX, 10, GW, 96, "이산화 탄소 농도", co2, P.co2) + timeGraph(GX, 114, GW, 96, "산소 농도", o2, P.o2);

// ── 탐구 1: 빛을 받은 상추 ──────────────────────────────────────────
export const g2u5SensorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-sensor", wait: "장치를 꾸며 측정해 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "상추 모종을 넣은 투명 용기와 센서, 농도 그래프");
  const st = { plant: false, lid: false, light: false };
  const kept: { bright: boolean; dark: boolean } = { bright: false, dark: false };
  let live: { co2: number[]; o2: number[]; dash: boolean; t: number } | null = null;
  let busy = false;

  const draw = (): void => {
    const line = (v: number[], color: string, dash: boolean, upto = 1): Series => ({ v, color, dash, upto });
    const co2: Series[] = [];
    const o2: Series[] = [];
    if (kept.bright) {
      co2.push(line(ramp(0.18), P.co2, false));
      o2.push(line(ramp(0.84), P.o2, false));
    }
    if (kept.dark) {
      co2.push(line(ramp(0.62), P.co2, true));
      o2.push(line(ramp(0.4), P.o2, true));
    }
    if (live) {
      co2.push(line(live.co2, live.dash ? "#8FA3BC" : P.co2, live.dash, live.t));
      o2.push(line(live.o2, live.dash ? "#8FA3BC" : P.o2, live.dash, live.t));
    }
    stage.set(`
      ${lamp(77, 22, st.light, 30)}
      ${jar(22, 74, 110, 122, { lid: st.lid, inside: st.plant ? lettuce(77, 192, 1) : "" })}
      <line x1="10" y1="198" x2="160" y2="198" stroke="#3B5273" stroke-width="2"/>
      ${legend(14, 220, [{ name: "전등 켬", color: "#E8EEF9" }, { name: "전등 끔", color: "#E8EEF9", dash: true }])}
      ${graphs(co2, o2)}
    `);
    host.dataset.g5Kept = `${kept.bright ? "b" : ""}${kept.dark ? "d" : ""}`;
  };

  const cPlant = chip("plant", "상추 모종", "밖에 있음", () => flip("plant"));
  const cLid = chip("lid", "뚜껑", "열림", () => flip("lid"));
  const cLight = chip("light", "전등", "꺼짐", () => flip("light"));
  const flip = (k: "plant" | "lid" | "light"): void => {
    if (busy) return;
    if (k === "plant" && st.lid) {
      bad();
      f.say("뚜껑이 닫혀 있어요. 먼저 <b>뚜껑을 열고</b> 모종을 옮겨요.");
      return;
    }
    tap();
    st[k] = !st[k];
    live = null;
    cPlant.on(st.plant);
    cPlant.sub(st.plant ? "용기 안" : "밖에 있음");
    cLid.on(st.lid);
    cLid.sub(st.lid ? "닫힘" : "열림");
    cLight.on(st.light);
    cLight.sub(st.light ? "켜짐" : "꺼짐");
    draw();
  };
  const run = bvBtn("main g2u5x-run", "10분 동안 측정");
  run.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    tap();
    const full = st.plant && st.lid;
    const kind = !st.lid ? "open" : !st.plant ? "empty" : st.light ? "bright" : "dark";
    live = { co2: full ? ramp(st.light ? 0.18 : 0.62) : ramp(0.5), o2: full ? ramp(st.light ? 0.84 : 0.4) : ramp(0.5), dash: kind !== "bright", t: 0 };
    [cPlant, cLid, cLight].forEach((c) => c.lock(true));
    run.disabled = true;
    f.say("센서가 두 기체의 농도를 재고 있어요.");
    bvTween(tm, 2200, (t) => {
      if (live) live.t = t;
      draw();
    }, () => {
      busy = false;
      [cPlant, cLid, cLight].forEach((c) => c.lock(false));
      run.disabled = false;
      host.dataset.g5Last = kind;
      if (kind === "open") {
        bad();
        lab.slip();
        toast(lab, "농도가 변하지 않아요", true);
        f.say("뚜껑이 열려 있어 <b>바깥 공기와 섞였어요</b>. 뚜껑을 닫고 다시 재요.");
        return;
      }
      if (kind === "empty") {
        bad();
        toast(lab, "농도가 변하지 않아요", true);
        f.say("용기 안에 식물이 없으면 두 기체의 농도가 <b>그대로</b>예요.");
        return;
      }
      good();
      live = null;
      kept[kind] = true;
      draw();
      f.pips(kept.bright && kept.dark ? 2 : 1);
      if (kind === "bright") f.say(kept.dark ? "전등을 켜자 <b>이산화 탄소는 줄고 산소는 늘었어요</b>." : "이산화 탄소는 줄고 산소는 늘었어요. <b>전등을 끄고</b> 한 번 더 재요.");
      else f.say(kept.bright ? "빛이 없으니 이산화 탄소가 <b>줄지 않았어요</b>. 오히려 조금 늘었어요." : "이산화 탄소가 줄지 않고 조금 늘었어요. <b>전등을 켜고</b> 다시 재요.");
      if (kept.bright && kept.dark) {
        [cPlant, cLid, cLight].forEach((c) => c.lock(true));
        run.textContent = "두 측정 견주기";
        run.classList.add("g2u5x-go");
        busy = true;
        run.onclick = () => {
          tap();
          lab.judge("전등을 <b>켰을 때</b> 용기 안에서 줄어든 기체는?", [{ t: "이산화 탄소", ok: true }, { t: "산소" }, { t: "두 기체 모두" }], "빛을 받으면 <b>이산화 탄소</b>가 줄고 산소가 늘어요.", () =>
            lab.finish("빛을 받은 식물은 <b>이산화 탄소</b>를 쓰고 <b>산소</b>를 내놓아요. 광합성에 이산화 탄소가 쓰이고 산소가 생긴다는 증거예요."),
          );
        };
      }
    });
  });
  f.slot.setControls(row(cPlant.el, cLid.el, cLight.el), run);
  draw();
  f.say("용기와 센서가 있어요. 장치를 꾸미고 <b>10분 동안</b> 농도를 재 보세요.");
  return lab.cleanup;
};

// ── 알루미늄박으로 감싼 용기 ────────────────────────────────────────
type Inside = "leaf" | "root" | "none";
const IN: Record<Inside, { name: string; color: string; co2: number; o2: number }> = {
  leaf: { name: "상추 잎", color: P.leafHi, co2: 0.8, o2: 0.2 },
  root: { name: "당근 뿌리", color: "#FF9F5A", co2: 0.66, o2: 0.34 },
  none: { name: "빈 용기", color: "#9AA8BC", co2: 0.5, o2: 0.5 },
};
const leafPile = (x: number, y: number): string =>
  [-34, 0, 30].map((a, i) => `<g transform="translate(${x + (i - 1) * 16} ${y}) rotate(${a})"><path d="M0 0 C -14 -12, -13 -34, 0 -40 C 13 -34, 14 -12, 0 0 Z" fill="${i === 1 ? "#58BD6E" : P.leaf}" stroke="${P.leafDark}" stroke-width="1.3"/><line x1="0" y1="-3" x2="0" y2="-33" stroke="${P.leafDark}" stroke-width="1" opacity=".5"/></g>`).join("");
const carrot = (x: number, y: number): string =>
  `<g transform="translate(${x} ${y}) rotate(-62)"><path d="M-11 0 C -10 -30, -4 -58, 0 -66 C 4 -58, 10 -30, 11 0 Z" fill="#F08A3C" stroke="#A8521A" stroke-width="1.4"/>${[-16, -30, -44].map((d) => `<line x1="-5" y1="${d}" x2="4" y2="${d - 2}" stroke="#A8521A" stroke-width="1" opacity=".6"/>`).join("")}<path d="M-6 0 l-3 9 M0 0 l0 11 M6 0 l3 9" stroke="#3FA35B" stroke-width="3" stroke-linecap="round"/></g>`;

export const g2u5DarkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-dark", wait: "넣을 것을 골라 측정해 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "알루미늄박으로 감싸는 투명 용기와 농도 그래프");
  const kept = new Set<Inside>();
  let pick: Inside = "leaf";
  let liveT = -1; // 재는 중이면 0~1
  let wrapped = false;

  const draw = (): void => {
    const co2: Series[] = [];
    const o2: Series[] = [];
    (Object.keys(IN) as Inside[]).forEach((k) => {
      const mine = k === pick && liveT >= 0;
      if (!kept.has(k) && !mine) return;
      co2.push({ v: ramp(IN[k].co2), color: IN[k].color, upto: mine ? liveT : 1 });
      o2.push({ v: ramp(IN[k].o2), color: IN[k].color, upto: mine ? liveT : 1 });
    });
    const inside = pick === "leaf" ? leafPile(77, 190) : pick === "root" ? carrot(52, 188) : "";
    stage.set(`
      ${jar(22, 60, 110, 136, { lid: true, foil: wrapped, inside })}
      <line x1="10" y1="198" x2="160" y2="198" stroke="#3B5273" stroke-width="2"/>
      ${tag(77, 30, wrapped ? "알루미늄박으로 감쌈" : `넣은 것: ${IN[pick].name}`, { size: 12 })}
      ${legend(6, 220, [...kept].map((k) => ({ name: k === "leaf" ? "잎" : k === "root" ? "뿌리" : "빈 용기", color: IN[k].color })))}
      ${graphs(co2, o2)}
    `);
    host.dataset.g5Kept = String(kept.size);
  };

  const chips = (Object.keys(IN) as Inside[]).map((k) =>
    chip(k, IN[k].name, "", () => {
      if (liveT >= 0) return;
      tap();
      pick = k;
      wrapped = false;
      chips.forEach((c) => c.on(c.el.dataset.k === k));
      draw();
      f.say(`${k === "leaf" ? "상추 잎을 넣었어요" : k === "root" ? "당근 뿌리를 넣었어요" : "용기를 비웠어요"}. <b>알루미늄박</b>으로 감싸 빛을 막고 재요.`);
    }),
  );
  chips[0].on(true);
  const run = bvBtn("main g2u5x-run", "알루미늄박으로 감싸고 10분 측정");
  run.addEventListener("click", () => {
    if (liveT !== -1) return;
    if (kept.has(pick)) {
      f.say("이미 잰 것이에요. <b>다른 것</b>을 넣어 견줘 보세요.");
      return;
    }
    tap();
    wrapped = true;
    liveT = 0;
    chips.forEach((c) => c.lock(true));
    run.disabled = true;
    f.say("빛이 들어가지 않는 용기 안에서 센서가 농도를 재고 있어요.");
    bvTween(tm, 2200, (t) => {
      liveT = t;
      draw();
    }, () => {
      liveT = -1;
      kept.add(pick);
      chips.find((c) => c.el.dataset.k === pick)?.done();
      chips.forEach((c) => c.lock(false));
      run.disabled = false;
      draw();
      host.dataset.g5Last = pick;
      const living = [...kept].filter((k) => k !== "none").length;
      f.pips(kept.size === 3 ? 2 : living ? 1 : 0);
      if (pick === "none") {
        tap();
        f.say("빈 용기는 두 기체의 농도가 <b>그대로</b>예요. 변화는 식물이 만든 것이에요.");
      } else {
        good();
        f.say(`${IN[pick].name}${pick === "leaf" ? "은" : "는"} 어둠 속에서 <b>산소를 쓰고 이산화 탄소를 내놓았어요</b>.`);
      }
      if (kept.size === 3) {
        chips.forEach((c) => c.lock(true));
        run.textContent = "세 측정 견주기";
        run.classList.add("g2u5x-go");
        run.onclick = () => {
          tap();
          lab.judge("빛이 없는 용기에서 잎과 뿌리가 <b>써서 줄어든</b> 기체는?", [{ t: "산소", ok: true }, { t: "이산화 탄소" }, { t: "줄어든 기체가 없다" }], "잎도 뿌리도 <b>산소</b>가 줄고 이산화 탄소가 늘었어요.", () =>
            lab.finish("빛이 없어도 잎과 뿌리는 <b>산소</b>를 쓰고 <b>이산화 탄소</b>를 내놓아요. 살아 있는 세포에서 늘 일어나는 이 일이 <b>호흡</b>이에요."),
          );
        };
        liveT = -2; // 더는 측정하지 않는다(단추는 판정으로 간다)
      }
    });
  });
  f.slot.setControls(row(...chips.map((c) => c.el)), run);
  draw();
  f.say("이번에는 빛을 막아요. 용기에 넣을 것을 고르고 <b>감싸서</b> 재 보세요.");
  return lab.cleanup;
};

// ── 빛의 세기 실험 설계 ─────────────────────────────────────────────
const TEMPS = [20, 30];
const GAIN = [0, 2, 4, 5, 5];

export const g2u5DesignLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-design", wait: "전등 수를 바꿔 가며 재 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "전등 네 개와 상추 용기, 켠 전등 수에 따른 산소 증가량 그래프");
  let lamps = 1;
  let ti = 0;
  let ref = -1; // 처음 잰 온도(기준)
  const valid = new Map<number, number>(); // 전등 수 → 값
  const off = new Map<number, number>(); // 온도가 달랐던 측정
  let grow: { n: number; v: number; t: number; odd: boolean } | null = null;
  let busy = false;

  // 그래프: x 152~336, y 14~216. 축 원점 (178, 186), 값 1 = 22px.
  const X = (n: number): number => 178 + n * 36 - 12;
  const Y = (v: number): number => 186 - v * 22;
  const draw = (): void => {
    let bars = "";
    for (let n = 1; n <= 4; n++) {
      const v = valid.get(n);
      const g = grow && grow.n === n && !grow.odd ? grow.v * grow.t : undefined;
      const val = g ?? v;
      if (val !== undefined) bars += `<rect x="${X(n) - 11}" y="${Y(val)}" width="22" height="${186 - Y(val)}" rx="4" fill="${P.o2}" stroke="#2F6FA8" stroke-width="1.2"/>`;
      const o = grow && grow.n === n && grow.odd ? grow.v * grow.t : off.get(n);
      if (o !== undefined) bars += `<rect x="${X(n) + 2}" y="${Y(o)}" width="12" height="${186 - Y(o)}" rx="3" fill="none" stroke="${P.bad}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
      bars += txt(X(n), 202, `${n}개`, { size: 12, fill: lamps === n ? "#E8EEF9" : P.dim });
    }
    const small = (x: number, on: boolean): string =>
      `${on ? `<line x1="${x}" y1="40" x2="${x}" y2="62" stroke="${P.energy}" stroke-width="2.4" stroke-linecap="round" class="g2u5x-ray"/>` : ""}<rect x="${x - 10}" y="26" width="20" height="11" rx="5" fill="${on ? "#FFE58A" : "#4A5870"}" stroke="${on ? "#B8860B" : "#77869E"}" stroke-width="1.3"/>`;
    stage.set(`
      ${[0, 1, 2, 3].map((i) => small(30 + i * 27, i < lamps)).join("")}
      ${jar(20, 86, 102, 110, { lid: true, inside: lettuce(71, 192, 0.9) })}
      <line x1="8" y1="198" x2="140" y2="198" stroke="#3B5273" stroke-width="2"/>
      ${tag(71, 219, `용기 온도 ${TEMPS[ti]} ℃`, { size: 12, fill: ref >= 0 && TEMPS[ti] !== ref ? P.bad : "#E8EEF9" })}
      <rect x="150" y="10" width="188" height="210" rx="10" fill="#101D33" stroke="#263B5C"/>
      ${txt(160, 28, "산소가 늘어난 양", { anchor: "start", size: 12, fill: P.o2 })}
      <line x1="178" y1="40" x2="178" y2="186" stroke="#55698A"/><line x1="178" y1="186" x2="330" y2="186" stroke="#55698A"/>
      ${bars}
      ${txt(244, 216, "켠 전등의 수", { size: 12, fill: P.dim })}
      ${off.size || (grow && grow.odd) ? txt(330, 28, "점선: 온도 다름", { anchor: "end", size: 12, fill: P.bad }) : ""}
    `);
    host.dataset.g5Valid = String(valid.size);
    host.dataset.g5Off = String(off.size);
  };

  const sLamp = stepper("켠 전등", "lamp", (d) => {
    if (busy) return;
    lamps = Math.max(1, Math.min(4, lamps + d));
    sLamp.set(`${lamps}개`);
    draw();
  });
  const sTemp = stepper("용기 온도", "temp", (d) => {
    if (busy) return;
    ti = Math.max(0, Math.min(TEMPS.length - 1, ti + d));
    sTemp.set(`${TEMPS[ti]} ℃`);
    draw();
  });
  sLamp.set("1개");
  sTemp.set(`${TEMPS[0]} ℃`);
  const run = bvBtn("main g2u5x-run", "5분 동안 측정");
  run.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    tap();
    const temp = TEMPS[ti];
    if (ref < 0) ref = temp;
    const odd = temp !== ref;
    const v = GAIN[lamps] * (temp === TEMPS[0] ? 1 : 1.25);
    grow = { n: lamps, v, t: 0, odd };
    sLamp.lock(true);
    sTemp.lock(true);
    run.disabled = true;
    bvTween(tm, 900, (t) => {
      if (grow) grow.t = t;
      draw();
    }, () => {
      grow = null;
      busy = false;
      sLamp.lock(false);
      sTemp.lock(false);
      run.disabled = false;
      if (odd) {
        off.set(lamps, v);
        draw();
        bad();
        lab.slip();
        toast(lab, "온도가 달라 견줄 수 없어요", true);
        f.say(`온도까지 바꿨어요. 차이가 빛 때문인지 알 수 없어요. <b>${ref} ℃</b>로 되돌려요.`);
        return;
      }
      valid.set(lamps, v);
      draw();
      good();
      f.pips(valid.size >= 4 ? 2 : 1);
      if (valid.size < 4) {
        f.say(`전등 ${lamps}개일 때를 쟀어요. <b>전등 수만</b> 바꿔 가며 네 가지를 모두 재요.`);
        return;
      }
      busy = true;
      sLamp.lock(true);
      sTemp.lock(true);
      run.disabled = true;
      f.say("네 가지를 모두 쟀어요. 막대의 높이를 <b>견줘</b> 보세요.");
      tm.later(() => {
        lab.judge("전등을 <b>3개에서 4개</b>로 늘렸을 때 광합성량은?", [{ t: "더 늘지 않았다", ok: true }, { t: "계속 늘었다" }, { t: "오히려 줄었다" }], "3개와 4개의 막대 높이가 <b>같아요</b>.", () =>
          lab.finish("빛이 셀수록 광합성량이 <b>늘다가</b>, 일정 세기 이상이 되면 <b>더 늘지 않고 일정</b>해져요. 온도 같은 다른 조건은 같게 두어야 견줄 수 있어요."),
        );
      }, 1500);
    });
  });
  f.slot.setControls(sLamp.el, sTemp.el, run);
  draw();
  f.say("산소가 많이 늘수록 광합성량이 많은 거예요. <b>무엇을 바꾸고 무엇을 같게</b> 둘까요?");
  return lab.cleanup;
};
