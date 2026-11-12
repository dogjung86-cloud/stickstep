// [중2 Ⅴ v5] 호흡과 에너지 쪽의 랩 네 판(g2u5l3, g2u5l4, g2u5l5).
//
// g2u5FarmLab 「이산화 탄소와 온도도 높을수록 좋을까요?」 (g2u5l3)
//   책의 세 그래프 가운데 둘과 스마트팜(이산화 탄소 공급 장치, 냉난방 장치). 학생이 정하는 것: 온실의 이산화 탄소 농도, 이어서 온도.
//   한 번에 하나만 바꾼다(농도를 정한 뒤 온도). 한 단계 바꿀 때마다 잰 점이 그래프에 찍힌다.
//   실패하는 길: 더 늘릴 수 있는 곳에서 정하면 되돌려 보낸다. 온도를 지나치게 올리면 광합성량이 뚝 떨어지고 잎이 처진다.
//
// g2u5SproutLab 「싹이 자랄 에너지는 무엇으로 얻을까요?」 (g2u5l4)
//   땅속의 강낭콩. 학생이 정하는 것: 흙 속 산소와 빛을 주고 끊는 일.
//   산소가 있으면 빛이 없어도 싹이 자라고, 산소를 끊으면 빛을 비춰도 멈춘다. 두 경우를 모두 봐야 끝까지 자란다.
//
// g2u5LightLab 「잎이 내보내는 기체는 무엇이 정할까요?」 (g2u5l5)
//   책의 낮과 밤 그림과 순서도. 학생이 정하는 것: 빛의 세기 네 단계. 주어진 세 상황을 만들어 확인한다.
//   호흡의 양은 늘 같고 광합성의 양만 빛에 따라 달라진다. 광합성량과 호흡량이 같은 단계는 두지 않았다(책 밖).
//
// g2u5CycleLab 「광합성과 호흡은 어떻게 이어질까요?」 (g2u5l5)
//   책의 해 보기(붙임딱지). 빈칸 여섯 개에 붙임딱지를 붙인다. 틀린 딱지는 붙지 않고 까닭이 뜬다.

import type { StepRenderer } from "../../types";
import { P, arrow, bad, bvBtn, chip, g5Lab, g5Svg, gasDot, good, lettuce, row, stepper, tag, tap, toast, txt, type G5Step } from "./kit";

// ── 온실 조건 정하기 ────────────────────────────────────────────────
const PC = [0.3, 0.55, 0.8, 1, 1, 1];
const TS = [10, 15, 20, 25, 30, 35, 40, 45];
const PT = [0.2, 0.4, 0.62, 0.84, 1, 0.55, 0.15, 0.03];

export const g2u5FarmLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-farm", wait: "온실의 조건을 정해 보세요" });
  const { f } = lab;
  const stage = g5Svg(lab, "온실의 상추와 광합성량 막대, 이산화 탄소 농도 그래프와 온도 그래프");
  let phase: "co2" | "temp" | "end" = "co2";
  let ci = 0;
  let ti = 3;
  const seenC = new Set<number>([0]);
  const seenT = new Set<number>();

  const chart = (x: number, title: string, n: number, vals: number[], seen: Set<number>, cur: number, lo: string, hi: string, active: boolean): string => {
    const w = 160;
    const px = (i: number): number => x + 20 + (i * (w - 38)) / (n - 1);
    const py = (v: number): number => 198 - v * 62;
    const idx = [...seen].sort((a, b) => a - b);
    let out = `<g opacity="${active ? 1 : 0.5}"><rect x="${x}" y="106" width="${w}" height="116" rx="10" fill="#101D33" stroke="${active ? "#4A6FA5" : "#263B5C"}" stroke-width="${active ? 1.6 : 1}"/>`;
    out += txt(x + 10, 123, title, { anchor: "start", size: 12, fill: "#E8EEF9" });
    out += `<line x1="${x + 14}" y1="130" x2="${x + 14}" y2="198" stroke="#55698A"/><line x1="${x + 14}" y1="198" x2="${x + w - 10}" y2="198" stroke="#55698A"/>`;
    if (idx.length > 1) out += `<polyline points="${idx.map((i) => `${px(i).toFixed(1)},${py(vals[i]).toFixed(1)}`).join(" ")}" fill="none" stroke="${P.leafHi}" stroke-width="2.4" stroke-linejoin="round"/>`;
    idx.forEach((i) => (out += `<circle cx="${px(i)}" cy="${py(vals[i])}" r="${i === cur && active ? 6 : 3.6}" fill="${i === cur && active ? P.energy : P.leafHi}" stroke="#0B1524" stroke-width="1.2"/>`));
    out += txt(x + 14, 214, lo, { anchor: "start", size: 12, fill: P.dim }) + txt(x + w - 10, 214, hi, { anchor: "end", size: 12, fill: P.dim });
    return out + "</g>";
  };
  const value = (): number => PC[ci] * PT[ti];
  const draw = (): void => {
    const v = value();
    const hot = TS[ti] >= 40;
    const cold = TS[ti] <= 10;
    stage.set(`
      ${txt(12, 28, "광합성량", { anchor: "start", size: 12.5, fill: "#E8EEF9" })}
      <rect x="78" y="14" width="256" height="20" rx="10" fill="#101D33" stroke="#263B5C"/>
      <rect x="80" y="16" width="${Math.max(6, 252 * v).toFixed(1)}" height="16" rx="8" fill="${hot ? P.bad : P.leafHi}"/>
      ${[58, 173, 288].map((x) => lettuce(x, 100, 0.72, { pale: hot || cold, droop: hot ? 1 : 0 })).join("")}
      <line x1="10" y1="100" x2="336" y2="100" stroke="#3B5273" stroke-width="2"/>
      ${chart(8, "이산화 탄소 농도", 6, PC.map((p) => p * 0.84), seenC, ci, "낮음", "높음", phase === "co2")}
      ${chart(178, "온도", 8, PT.map((p) => p * PC[ci]), seenT, ti, "10 ℃", "45 ℃", phase !== "co2")}
    `);
    host.dataset.g5Farm = phase;
    host.dataset.g5Val = v.toFixed(2);
  };

  const sC = stepper("이산화 탄소", "c", (d) => {
    ci = Math.max(0, Math.min(5, ci + d));
    seenC.add(ci);
    sC.set(`${ci + 1}단계`);
    draw();
    f.say(ci >= 4 && PC[ci] === PC[ci - 1] ? "농도를 높였는데 광합성량이 <b>더 늘지 않아요</b>." : d > 0 ? "이산화 탄소를 더 넣자 광합성량이 <b>늘었어요</b>." : "이산화 탄소를 줄이자 광합성량도 줄었어요.");
  });
  const sT = stepper("온실 온도", "t", (d) => {
    const before = PT[ti];
    ti = Math.max(0, Math.min(TS.length - 1, ti + d));
    seenT.add(ti);
    sT.set(`${TS[ti]} ℃`);
    draw();
    if (TS[ti] >= 40) {
      bad();
      toast(lab, "잎이 처지고 있어요", true);
      f.say("온도가 너무 높아요. 광합성량이 <b>뚝 떨어졌어요</b>.");
    } else {
      lab.f.stage.querySelector(".g2u5x-toast")?.remove();
      f.say(PT[ti] > before ? "온도를 높이자 광합성량이 <b>늘었어요</b>." : PT[ti] < before ? "광합성량이 <b>줄었어요</b>. 가장 큰 곳은 어디일까요?" : "더 바꿀 수 없어요.");
    }
  });
  sC.set("1단계");
  sT.set(`${TS[ti]} ℃`);
  const pickC = bvBtn("main g2u5x-pick", "이 농도로 정하기");
  pickC.addEventListener("click", () => {
    if (!seenC.has(4)) {
      tap();
      f.say("어디까지 늘어나는지 아직 몰라요. 농도를 <b>더 높여</b> 재 보세요.");
      return;
    }
    if (PC[ci] < 1) {
      bad();
      lab.slip();
      toast(lab, "광합성량을 더 늘릴 수 있어요", true);
      f.say("이 농도에서는 광합성량이 <b>가장 크지 않아요</b>. 그래프를 다시 봐요.");
      return;
    }
    good();
    phase = "temp";
    ti = 1;
    sT.set(`${TS[ti]} ℃`);
    seenT.add(ti);
    f.pips(1);
    draw();
    f.slot.setControls(sT.el, pickT);
    f.say("농도를 정했어요. 이제 낮은 온도에서 시작해 <b>온도</b>를 올려 가며 재요.");
  });
  const pickT = bvBtn("main g2u5x-pick", "이 온도로 정하기");
  pickT.addEventListener("click", () => {
    if (phase !== "temp") return;
    if (!seenT.has(5)) {
      tap();
      f.say("더 높은 온도에서는 어떨까요? <b>35 ℃ 위</b>까지 재 보세요.");
      return;
    }
    if (ti !== 4) {
      bad();
      lab.slip();
      toast(lab, "광합성량이 더 큰 온도가 있어요", true);
      f.say("그래프에서 점이 <b>가장 높은</b> 온도를 찾아 맞춰요.");
      return;
    }
    good();
    phase = "end";
    f.pips(2);
    sT.lock(true);
    lab.judge("알맞은 온도보다 <b>더 높이면</b> 광합성량은?", [{ t: "빠르게 줄어든다", ok: true }, { t: "더 늘지 않고 일정하다" }, { t: "계속 늘어난다" }], "30 ℃를 넘기자 점이 <b>뚝 떨어졌어요</b>.", () =>
      lab.finish("이산화 탄소 농도가 높을수록 광합성량이 늘다가 일정 농도 이상에서는 <b>일정</b>해져요. 온도는 높을수록 늘다가 일정 온도 이상에서는 <b>빠르게 줄어요</b>."),
    );
  });
  f.slot.setControls(sC.el, pickC);
  draw();
  f.say("상추 온실이에요. <b>이산화 탄소</b>를 얼마나 넣어야 광합성량이 가장 클까요?");
  return lab.cleanup;
};

// ── 땅속의 콩 ───────────────────────────────────────────────────────
export const g2u5SproutLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-sprout", wait: "산소와 빛을 주고 끊어 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "땅속에 심은 강낭콩과 흙 속의 산소, 땅 위의 빛");
  let o2 = false;
  let light = false;
  let grow = 0;
  let darkMs = 0;
  let litMs = 0;
  let seenDark = false;
  let seenLit = false;
  let hinted = "";

  const spark = (x: number, y: number, d: number): string =>
    `<polygon class="g2u5x-flow" style="animation-delay:${d}s" points="${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `${(x + Math.cos((k * Math.PI) / 4) * (k % 2 ? 3 : 8)).toFixed(1)},${(y + Math.sin((k * Math.PI) / 4) * (k % 2 ? 3 : 8)).toFixed(1)}`).join(" ")}" fill="${P.energy}"/>`;
  const mark = (y: number, text: string, on: boolean): string =>
    `<circle cx="222" cy="${y - 4}" r="6" fill="${on ? P.leafHi : "none"}" stroke="${on ? P.leafHi : "#55698A"}" stroke-width="1.6"/>${on ? `<path d="M219 ${y - 4} l2.4 2.6 l4 -5" fill="none" stroke="#0B1524" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` : ""}${txt(234, y, text, { anchor: "start", size: 12, fill: on ? "#E8EEF9" : P.dim })}`;
  const draw = (): void => {
    const top = 132 - 96 * grow; // 싹의 끝(땅 위는 y < 66)
    const rootLen = 34 * grow;
    stage.set(`
      <rect x="0" y="66" width="346" height="164" fill="${o2 ? "#3B2A1E" : "#2A3344"}"/>
      <line x1="0" y1="66" x2="346" y2="66" stroke="#6B4A32" stroke-width="2"/>
      ${o2 ? "" : txt(60, 220, "물에 잠긴 흙", { size: 12, fill: P.water })}
      <g opacity="${light ? 1 : 0.25}"><circle cx="40" cy="30" r="13" fill="${P.energy}" stroke="#B8860B" stroke-width="1.5"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<line x1="${40 + Math.cos((k * Math.PI) / 4) * 18}" y1="${30 + Math.sin((k * Math.PI) / 4) * 18}" x2="${40 + Math.cos((k * Math.PI) / 4) * 24}" y2="${30 + Math.sin((k * Math.PI) / 4) * 24}" stroke="${P.energy}" stroke-width="2.2" stroke-linecap="round"/>`).join("")}</g>
      ${txt(84, 34, light ? "빛 비춤" : "빛 가림", { anchor: "start", size: 12, fill: light ? P.energy : P.dim })}
      ${o2 ? [[40, 110], [70, 150], [34, 180], [96, 196], [200, 200]].map(([x, y]) => gasDot(x, y, "o2", 4.5)).join("") + arrow(84, 150, 104, 150, P.o2, 2.2, "g2u5x-flow") + txt(62, 134, "산소", { size: 12, fill: P.o2 }) : ""}
      ${grow > 0 ? `<path d="M130 156 C 130 ${156 + rootLen * 0.6}, 126 ${156 + rootLen}, 122 ${160 + rootLen}" fill="none" stroke="#E8DCC0" stroke-width="3.4" stroke-linecap="round"/>` : ""}
      ${grow > 0 ? `<path d="M130 132 C 132 ${(132 + top) / 2}, 128 ${top + 8}, 130 ${top}" fill="none" stroke="${top < 66 ? "#7BC66A" : "#DCE8B8"}" stroke-width="5" stroke-linecap="round"/>` : ""}
      ${grow > 0.72 ? `<ellipse cx="121" cy="${top + 2}" rx="10" ry="5" fill="#7BC66A" stroke="#2F7D46" stroke-width="1.2" transform="rotate(-24 121 ${top + 2})"/><ellipse cx="139" cy="${top + 2}" rx="10" ry="5" fill="#7BC66A" stroke="#2F7D46" stroke-width="1.2" transform="rotate(24 139 ${top + 2})"/>` : ""}
      <ellipse cx="130" cy="146" rx="28" ry="20" fill="#E9CF96" stroke="#9A7A3A" stroke-width="1.8"/>
      <ellipse cx="130" cy="147" rx="${(21 * (1 - grow * 0.75)).toFixed(1)}" ry="${(14 * (1 - grow * 0.75)).toFixed(1)}" fill="${P.sugar}" opacity=".9"/>
      ${txt(166, 182, "콩 속의 양분", { anchor: "start", size: 12, fill: P.sugar })}
      ${o2 && grow < 1 ? spark(170, 126, 0) + spark(184, 146, 0.3) + spark(170, 166, 0.6) + txt(196, 112, "에너지", { anchor: "start", size: 12, fill: P.energy }) : ""}
      ${o2 && grow < 1 ? gasDot(158, 100, "co2", 4.5, "g2u5x-rise") + gasDot(170, 92, "co2", 4.5, "g2u5x-rise d1") : ""}
      ${mark(40, "빛 없이도 자람", seenDark)}${mark(60, "산소 없으면 멈춤", seenLit)}
    `);
    host.dataset.g5Grow = String(Math.round(grow * 100));
    host.dataset.g5Seen = `${seenDark ? "d" : ""}${seenLit ? "l" : ""}`;
  };
  const tell = (): void => {
    if (grow >= 1) return;
    if (grow >= 0.9 && o2 && !(seenDark && seenLit)) {
      f.say(!seenDark ? "이번에는 <b>빛을 가린 채</b>로도 자라는지 확인해 보세요." : "이번에는 <b>산소만 끊고</b> 빛을 비춰 보세요. 자랄까요?");
      return;
    }
    if (!o2 && !light) f.say("산소도 빛도 없어요. 싹이 <b>자라지 않아요</b>. 하나씩 줘 보세요.");
    else if (!o2 && light) f.say("빛을 비춰도 <b>자라지 않아요</b>. 산소가 없어 에너지가 나오지 않아요.");
    else if (o2 && !light) f.say("빛이 없는데도 <b>싹이 자라요</b>. 콩 속의 양분과 산소로 에너지를 얻어요.");
    else f.say("싹이 자라요. 빛을 가리면, 또 산소를 끊으면 어떻게 될까요?");
  };

  const cO2 = chip("o2", "흙 속 산소", "없음", () => {
    tap();
    o2 = !o2;
    cO2.on(o2);
    cO2.sub(o2 ? "있음" : "없음");
    draw();
    tell();
  });
  const cLight = chip("light", "빛", "가림", () => {
    tap();
    light = !light;
    cLight.on(light);
    cLight.sub(light ? "비춤" : "가림");
    draw();
    tell();
  });
  const go = bvBtn("main g2u5x-go", "싹이 자란 까닭 정리하기");
  go.disabled = true;
  go.addEventListener("click", () => {
    tap();
    stop = true;
    lab.judge("싹이 자랄 에너지를 얻는 데 <b>없어도 됐던</b> 것은?", [{ t: "빛", ok: true }, { t: "산소" }, { t: "콩 속의 양분" }], "빛을 가려도 산소만 있으면 싹이 자랐어요.", () =>
      lab.finish("콩은 저장된 <b>양분</b>을 <b>산소</b>로 분해해 에너지를 얻었어요. 빛이 없는 땅속에서도 일어나는 이 과정이 <b>호흡</b>이에요."),
    );
  });
  let stop = false;
  const tick = (): void => {
    if (stop) return;
    const cap = seenDark && seenLit ? 1 : 0.9;
    const before = grow;
    if (o2 && grow < cap) grow = Math.min(cap, grow + 0.016);
    if (o2 && !light) darkMs += 100;
    if (!o2 && light) litMs += 100;
    let changed = grow !== before;
    if (!seenDark && darkMs >= 1200 && grow > 0.1) {
      seenDark = true;
      changed = true;
      f.pips(seenLit ? 2 : 1);
    }
    if (!seenLit && litMs >= 1200) {
      seenLit = true;
      changed = true;
      f.pips(seenDark ? 2 : 1);
    }
    if (changed) draw();
    const key = `${grow >= 0.9}${seenDark}${seenLit}${grow >= 1}`;
    if (key !== hinted) {
      hinted = key;
      if (grow >= 1) {
        good();
        go.disabled = false;
        f.say("싹이 다 자랐어요. 무엇으로 에너지를 얻었는지 <b>정리</b>해요.");
      } else if (grow >= 0.9) tell();
    }
    tm.later(tick, 100);
  };
  f.slot.setControls(row(cO2.el, cLight.el), go);
  draw();
  f.say("땅속의 콩이 싹트려면 <b>에너지</b>가 필요해요. 무엇을 주면 자랄까요?");
  tm.later(tick, 100);
  return lab.cleanup;
};

// ── 빛의 세기와 잎의 기체 출입 ──────────────────────────────────────
const LV = ["빛 없음", "약한 빛", "밝은 빛", "강한 빛"];
const KP = [0, 1, 4, 6];
const RESP = 2;
const MISSION = [
  { say: "<b>산소</b>가 잎 밖으로 나가게 빛의 세기를 맞춰 보세요.", ok: (lv: number): boolean => KP[lv] > RESP },
  { say: "이번에는 <b>이산화 탄소</b>가 잎 밖으로 나가게 해 보세요.", ok: (lv: number): boolean => KP[lv] < RESP },
  { say: "<b>빛이 있는데도</b> 이산화 탄소가 나가게 할 수 있을까요?", ok: (lv: number): boolean => lv === 1 },
];

export const g2u5LightLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 4, cls: "g2u5x-light", wait: "빛의 세기를 맞춰 확인해 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "잎 속의 광합성과 호흡, 기공으로 드나드는 기체");
  let lv = 0;
  let m = 0;
  let busy = false;

  const box = (x: number, name: string, fill: string, edge: string, useKind: "o2" | "co2", outKind: "o2" | "co2", n: number, off: string): string => {
    let out = `<rect x="${x}" y="70" width="98" height="84" rx="12" fill="${fill}" stroke="${edge}" stroke-width="1.6" opacity="${n ? 1 : 0.45}"/>${txt(x + 49, 90, name, { size: 13, fill: "#fff", weight: 800 })}`;
    if (!n) return out + txt(x + 49, 122, off, { size: 12, fill: "#E8EEF9" });
    out += gasDot(x + 16, 112, useKind, 5) + txt(x + 27, 116, `${n}개 씀`, { anchor: "start", size: 12, fill: "#fff" });
    out += gasDot(x + 16, 136, outKind, 5) + txt(x + 27, 140, `${n}개 내놓음`, { anchor: "start", size: 12, fill: "#fff" });
    return out;
  };
  const dots = (cx: number, y: number, kind: "o2" | "co2", n: number): string => Array.from({ length: n }, (_, i) => gasDot(cx - ((n - 1) * 13) / 2 + i * 13, y, kind, 5)).join("");
  const draw = (): void => {
    const k = KP[lv];
    const net = k - RESP; // 양수면 산소가 나간다
    const outKind = net > 0 ? "o2" : "co2";
    const inKind = net > 0 ? "co2" : "o2";
    const n = Math.abs(net);
    const rays = Array.from({ length: lv * 2 }, (_, i) => `<line x1="${52 + i * 12}" y1="${22}" x2="${64 + i * 12}" y2="${48}" stroke="${P.energy}" stroke-width="2.4" stroke-linecap="round" class="g2u5x-ray"/>`).join("");
    stage.set(`
      <g opacity="${lv ? 1 : 0.25}"><circle cx="28" cy="24" r="12" fill="${P.energy}" stroke="#B8860B" stroke-width="1.5"/></g>${rays}
      ${tag(178, 26, LV[lv], { size: 12, fill: lv ? P.energy : "#C6D3E6" })}
      <path d="M12 112 C 12 66, 50 54, 124 54 C 198 54, 236 66, 236 112 C 236 150, 200 164, 148 166 L 142 174 L 106 174 L 100 166 C 48 164, 12 150, 12 112 Z" fill="#256B3E" stroke="${P.leafDark}" stroke-width="2"/>
      ${box(22, "광합성", "#2F9450", "#134D27", "co2", "o2", k, "빛이 없어 멈춤")}
      ${box(128, "호흡", "#B5683A", "#6E3A1A", "o2", "co2", RESP, "")}
      ${txt(124, 190, "기공", { size: 12, fill: P.dim })}
      ${arrow(112, 196, 112, 222, outKind === "o2" ? P.o2 : P.co2, 2.6, "g2u5x-flow")}${arrow(136, 222, 136, 196, inKind === "o2" ? P.o2 : P.co2, 2.6, "g2u5x-flow")}
      <rect x="246" y="48" width="94" height="174" rx="12" fill="#101D33" stroke="#263B5C"/>
      ${txt(293, 68, "잎 밖으로", { size: 12, fill: P.dim })}
      ${txt(293, 90, "나가는 기체", { size: 12, fill: "#E8EEF9" })}
      ${txt(293, 112, outKind === "o2" ? "산소" : "이산화 탄소", { size: 14.5, fill: outKind === "o2" ? P.o2 : P.co2, weight: 800 })}
      ${dots(293, 128, outKind, n)}
      ${txt(293, 160, "들어오는 기체", { size: 12, fill: "#E8EEF9" })}
      ${txt(293, 182, inKind === "o2" ? "산소" : "이산화 탄소", { size: 14.5, fill: inKind === "o2" ? P.o2 : P.co2, weight: 800 })}
      ${dots(293, 198, inKind, n)}
    `);
    host.dataset.g5Lv = String(lv);
    host.dataset.g5M = String(m);
  };

  const sL = stepper("빛의 세기", "lv", (d) => {
    if (busy) return;
    lv = Math.max(0, Math.min(3, lv + d));
    sL.set(LV[lv]);
    draw();
  });
  sL.set(LV[0]);
  const check = bvBtn("main g2u5x-check", "이 빛으로 확인하기");
  check.addEventListener("click", () => {
    if (busy) return;
    if (!MISSION[m].ok(lv)) {
      bad();
      lab.slip();
      toast(lab, m === 2 && lv === 0 ? "지금은 빛이 없어요" : KP[lv] > RESP ? "지금은 산소가 나가요" : "지금은 이산화 탄소가 나가요", true);
      return;
    }
    good();
    toast(lab, m === 0 ? "성공, 산소가 나가요" : m === 1 ? "성공, 이산화 탄소가 나가요" : "성공, 빛이 있어도 나가요");
    m += 1;
    f.pips(m);
    draw();
    if (m < MISSION.length) {
      f.say(MISSION[m].say);
      return;
    }
    busy = true;
    sL.lock(true);
    check.disabled = true;
    f.say("빛이 약하면 광합성이 <b>호흡보다 적어서</b> 이산화 탄소가 나가요.");
    tm.later(() => {
      lab.judge("빛의 세기를 바꾸는 동안 <b>변하지 않은</b> 것은?", [{ t: "호흡으로 쓰는 산소의 양", ok: true }, { t: "광합성으로 만드는 산소의 양" }, { t: "잎 밖으로 나가는 기체" }], "호흡은 빛과 관계없이 늘 <b>2개씩</b>이었어요.", () =>
        lab.finish("호흡은 빛과 관계없이 <b>늘</b> 일어나요. 광합성이 호흡보다 많으면 <b>산소</b>가, 적으면 <b>이산화 탄소</b>가 잎 밖으로 나가요."),
      );
    }, 1900);
  });
  f.slot.setControls(sL.el, check);
  draw();
  f.say(MISSION[0].say);
  return lab.cleanup;
};

// ── 붙임딱지로 잇는 광합성과 호흡 ───────────────────────────────────
type Sticker = "빛에너지" | "포도당" | "산소" | "이산화 탄소" | "물" | "에너지";
const STAGES: { accept: Sticker[]; say: string; why: string }[] = [
  { accept: ["빛에너지"], say: "광합성에 들어가는 <b>에너지</b>는 무엇일까요? 붙임딱지를 골라요.", why: "광합성은 <b>빛에너지</b>를 받아야 일어나요." },
  { accept: ["포도당", "산소"], say: "광합성이 만들어 호흡에 건네는 <b>두 가지</b>를 붙여요.", why: "광합성이 만드는 것은 <b>포도당과 산소</b>예요." },
  { accept: ["이산화 탄소", "물"], say: "호흡에서 생겨 광합성에 쓰이는 <b>두 가지</b>를 붙여요.", why: "호흡에서 생기는 것은 <b>이산화 탄소와 물</b>이에요." },
  { accept: ["에너지"], say: "호흡으로 식물이 <b>얻는 것</b>을 붙여요.", why: "호흡은 생명활동에 쓸 <b>에너지</b>를 얻는 과정이에요." },
];
const TINT: Record<Sticker, string> = { 빛에너지: P.energy, 포도당: P.sugar, 산소: P.o2, "이산화 탄소": P.co2, 물: P.water, 에너지: "#FF9F5A" };
const SHELF: Sticker[] = ["물", "에너지", "산소", "빛에너지", "이산화 탄소", "포도당"];

export const g2u5CycleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 4, cls: "g2u5x-cycle", wait: "빈칸에 붙임딱지를 붙여 보세요" });
  const { f, tm } = lab;
  const stage = g5Svg(lab, "광합성과 호흡을 잇는 그림과 붙임딱지를 붙일 빈칸");
  let at = 0;
  const filled: Sticker[][] = [[], [], [], []];
  // 빈칸의 자리: [단계][칸] = (가운데 x, 가운데 y, 폭)
  const SLOT: [number, number, number][][] = [[[46, 26, 78]], [[136, 54, 72], [210, 54, 72]], [[210, 178, 72], [136, 178, 72]], [[300, 26, 78]]];

  const draw = (): void => {
    let slots = "";
    SLOT.forEach((list, si) =>
      list.forEach(([x, y, w], i) => {
        const v = filled[si][i];
        const now = si === at && !v;
        slots += v
          ? `<g class="g2u5x-pop"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="#16233A" stroke="${TINT[v]}" stroke-width="2"/>${txt(x, y + 4.5, v, { size: 12, fill: TINT[v], weight: 800 })}</g>`
          : `<rect${now ? ' class="g2u5x-flow"' : ""} x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="${now ? "rgba(255,212,59,.14)" : "rgba(255,255,255,.04)"}" stroke="${now ? P.energy : "#55698A"}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      }),
    );
    const done = at >= STAGES.length;
    stage.set(`
      <path d="M95 86 L95 54 L251 54 L251 80" fill="none" stroke="#7FD08A" stroke-width="2.6" stroke-linejoin="round" ${done ? 'class="g2u5x-flow"' : ""}/><polygon points="251,88 245,77 257,77" fill="#7FD08A"/>
      <path d="M251 148 L251 178 L95 178 L95 154" fill="none" stroke="#E0A070" stroke-width="2.6" stroke-linejoin="round" ${done ? 'class="g2u5x-flow"' : ""}/><polygon points="95,146 89,157 101,157" fill="#E0A070"/>
      ${arrow(40, 42, 40, 86, P.energy)}${arrow(306, 86, 306, 42, "#FF9F5A")}
      <rect x="18" y="88" width="112" height="58" rx="12" fill="#2F9450" stroke="#134D27" stroke-width="1.6"/>${txt(74, 112, "광합성", { size: 15, fill: "#fff", weight: 800 })}${txt(74, 132, "엽록체", { size: 12, fill: "#CFF5D6" })}
      <rect x="216" y="88" width="112" height="58" rx="12" fill="#B5683A" stroke="#6E3A1A" stroke-width="1.6"/>${txt(272, 112, "호흡", { size: 15, fill: "#fff", weight: 800 })}${txt(272, 132, "마이토콘드리아", { size: 12, fill: "#FFE0C8" })}
      ${slots}
      ${txt(173, 214, "위: 광합성이 만든 것 · 아래: 호흡에서 생긴 것", { size: 12, fill: P.dim })}
    `);
    host.dataset.g5At = String(at);
  };

  const chips = SHELF.map((name) =>
    chip(name, name, "", () => {
      if (at >= STAGES.length) return;
      const st = STAGES[at];
      const c = chips[SHELF.indexOf(name)];
      if (!st.accept.includes(name)) {
        bad();
        lab.slip();
        c.el.classList.add("miss");
        tm.later(() => c.el.classList.remove("miss"), 500);
        host.dataset.g5Miss = "1";
        f.say(`이 칸에는 붙지 않아요. ${st.why}`);
        return;
      }
      good();
      filled[at].push(name);
      c.lock(true);
      c.done();
      if (filled[at].length === st.accept.length) {
        at += 1;
        f.pips(Math.min(at, 3));
        if (at < STAGES.length) f.say(STAGES[at].say);
      }
      draw();
      if (at >= STAGES.length) {
        f.say("그림이 완성됐어요. 두 과정이 <b>서로 주고받는 것</b>을 따라가 봐요.");
        tm.later(() => {
          lab.judge("광합성에서 생긴 <b>포도당과 산소</b>는 어디에 쓰일까요?", [{ t: "호흡에 쓰인다", ok: true }, { t: "다시 광합성에 쓰인다" }, { t: "쓰이지 않고 모두 나간다" }], "위쪽 화살표가 광합성에서 <b>호흡</b>으로 가요.", () =>
            lab.finish("광합성이 만든 <b>포도당과 산소</b>는 호흡에 쓰이고, 호흡에서 생긴 <b>이산화 탄소와 물</b>은 광합성에 쓰여요. 광합성은 빛에너지를 흡수하고 호흡은 에너지를 내놓아요."),
          );
        }, 2200);
      }
    }),
  );
  f.slot.setControls(row(chips[0].el, chips[1].el, chips[2].el), row(chips[3].el, chips[4].el, chips[5].el));
  draw();
  f.say(STAGES[0].say);
  return lab.cleanup;
};
