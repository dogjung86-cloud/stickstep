// [중2 Ⅴ v5] 투명 용기와 센서를 쓰는 랩 세 판(g2u5l2, g2u5l4, g2u5l3).
//
// g2u5SensorLab 「빛을 받은 상추는 어떤 기체를 쓰고 내놓을까요?」 (g2u5l2)
//   책의 탐구 1: 투명 용기에 상추 모종을 넣고 뚜껑을 닫아 이산화 탄소 센서와 산소 센서를 꽂은 뒤 빛을 비추며 10분 동안 잰다.
//   학생이 정하는 것: 모종을 넣을지, 뚜껑을 닫을지, 전등을 켤지. 그리고 10분 측정.
//   실패하는 길: 뚜껑을 열어 두면 바깥 공기와 섞여 변화가 없다. 모종이 없으면 변화가 없다. 전등을 끄면 이산화 탄소가 줄지 않는다.
//   전등을 켠 측정과 끈 측정을 모두 해야 판정으로 간다(두 선이 그래프에 함께 남는다).
//   그림(2026-11-15 다시 그림): 책의 장치처럼 목이 휘는 발광 다이오드 전등, 걸쇠 뚜껑의 투명 용기, 뚜껑에 꽂은 청록색 센서 둘(머리의 색 띠가 그래프 선의 색),
//   화분의 상추(주름진 잎). 용기 속 공기에는 이산화 탄소와 산소 분자를 그려 측정하는 동안 수가 그래프처럼 바뀐다.
//   공기에는 산소가 이산화 탄소보다 훨씬 많으므로(책 174쪽 도움말) 처음에 산소 14개, 이산화 탄소 3개를 두고, 늘고 주는 수만 같게 한다(켜면 이산화 탄소 2개 줄고 산소 2개 늚).
//
// g2u5DarkLab 「빛이 없을 때 식물은 어떤 기체를 쓸까요?」 (g2u5l4)
//   같은 장치를 알루미늄박으로 감싼다. 학생이 정하는 것: 용기에 넣을 것(상추 잎, 당근 뿌리, 비워 두기).
//   잎도 뿌리도 산소가 줄고 이산화 탄소가 는다. 빈 용기는 변화가 없다(비교 대상).
//
// g2u5DesignLab 「빛이 셀수록 광합성량이 계속 늘까요?」 (g2u5l3)
//   책의 탐구(실험 설계): 전등의 개수로 빛의 세기를 바꾸고 산소가 늘어난 양으로 광합성량을 잰다.
//   학생이 정하는 것: 켠 전등의 수와 용기의 온도. 온도까지 함께 바꾼 측정은 '온도 다름'으로 표시되고 세지 않는다(실패가 그래프에 남는다).

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, g5Lab, good, legend, ramp, row, stepper, tag, tap, timeGraph, toast, txt, type G5Step, type Series } from "./kit";
import { carrot, carrotDefs, container, deskLamp, foil, g5Layers, glassDefs, ledBar, lettuce, looseLeaf, memo, mol, newNs, particleDefs, plantDefs, pot, rng, type Pt } from "./art";

const GX = 172;
const GW = 164;

/** 두 그래프(이산화 탄소, 산소)를 그린다. */
const graphs = (co2: Series[], o2: Series[]): string => timeGraph(GX, 10, GW, 96, "이산화 탄소 농도", co2, P.co2) + timeGraph(GX, 114, GW, 96, "산소 농도", o2, P.o2);

/** 실험대(나무 상판의 앞 모서리). */
const bench = (x0: number, x1: number, y: number): string =>
  `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="5" rx="2" fill="#3A4C68"/><rect x="${x0}" y="${y}" width="${x1 - x0}" height="1.6" fill="#5F7598" opacity=".8"/>`;

/** 화분의 상추 모종. (x, y)는 화분 바닥 가운데. */
const seedling = (ns: string, x: number, y: number, s = 1, seed = 7): string => lettuce(ns, x, y - 21 * s, 0.9 * s, { seed }) + pot(ns, x, y, 30 * s, 17 * s);

/** 용기 속 공기의 분자 자리(상추와 센서 끝을 피해 고르게). */
function airSlots(x: number, y: number, w: number, h: number, avoid: { c: Pt; rx: number; ry: number }[], n: number, seed: number): Pt[] {
  const r = rng(seed);
  const out: Pt[] = [];
  for (let k = 0; k < 4000 && out.length < n; k++) {
    const p: Pt = [x + 8 + r() * (w - 16), y + 8 + r() * (h - 14)];
    if (avoid.some((a) => Math.pow((p[0] - a.c[0]) / a.rx, 2) + Math.pow((p[1] - a.c[1]) / a.ry, 2) < 1)) continue;
    if (out.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 12.5)) continue;
    out.push(p);
  }
  return out;
}

// ── 탐구 1: 빛을 받은 상추 ──────────────────────────────────────────
// 용기: 왼쪽 위 (BX, BY), BW×BH. 전등 머리는 (LX, LY)에서 아래로 비춘다.
const BX = 34;
const BY = 88;
const BW = 102;
const BH = 106;
const LX = 86;
const LY = 32;

export const g2u5SensorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-sensor", wait: "실험 장치를 맞추고 기체 농도를 측정해 보세요" });
  const { f, tm } = lab;
  const A = newNs("se");
  const ly = g5Layers(lab, "상추 모종을 넣은 투명 용기와 센서, 농도 그래프", ["defs", "rig", "air", "jar", "graph"]);
  const art = memo<string>();
  const st = { plant: false, lid: false, light: false };
  const kept: { bright: boolean; dark: boolean } = { bright: false, dark: false };
  let live: { co2: number[]; o2: number[]; dash: boolean; t: number } | null = null;
  let mix: { co2: number; o2: number } = { co2: 0.5, o2: 0.5 }; // 용기 속 공기(측정이 끝나면 그 끝 값을 다음 조작 전까지 둔다)
  let busy = false;
  ly.set("defs", `<defs>${particleDefs(A)}${plantDefs(A)}${glassDefs(A)}</defs>`);
  const slots = airSlots(BX, BY, BW, BH, [{ c: [LX, 150], rx: 40, ry: 40 }, { c: [BX + BW * 0.3, BY + 6], rx: 8, ry: 22 }, { c: [BX + BW * 0.7, BY + 6], rx: 8, ry: 22 }], 22, 3);

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
    // 전등과 실험대(전등의 빛은 용기 뒤에)
    ly.set("rig", art(`rig${st.light}`, () => deskLamp(A, 22, 198, LX, LY, st.light, 162, 46) + bench(2, 164, 196)));
    // 용기 속 공기: 산소가 훨씬 많다(처음 산소 14개, 이산화 탄소 3개). 그래프가 처음 높이(0.5)에서 움직인 만큼 수가 늘고 준다.
    const nC = Math.max(0, 3 + Math.round((mix.co2 - 0.5) * 6));
    const nO = 14 + Math.round((mix.o2 - 0.5) * 6);
    let air = "";
    slots.slice(0, nC).forEach((p, i) => (air += mol(A, "co2", p[0], p[1], 0.72, { rot: (i * 47) % 180 })));
    slots.slice(5, 5 + nO).forEach((p, i) => (air += mol(A, "o2", p[0], p[1], 0.74, { rot: (i * 61) % 180 })));
    ly.set("air", air);
    ly.set("jar", art(`jar${st.plant}${st.lid}`, () => container(A, BX, BY, BW, BH, { lid: st.lid, inside: st.plant ? seedling(A, LX, BY + BH - 2) : "" })) + legend(14, 220, [{ name: "전등 켬", color: "#E8EEF9" }, { name: "전등 끔", color: "#E8EEF9", dash: true }]));
    ly.set("graph", graphs(co2, o2));
    host.dataset.g5Kept = `${kept.bright ? "b" : ""}${kept.dark ? "d" : ""}`;
  };

  const cPlant = chip("plant", "상추 모종", "용기 밖", () => flip("plant"));
  const cLid = chip("lid", "뚜껑", "열림", () => flip("lid"));
  const cLight = chip("light", "전등", "꺼짐", () => flip("light"));
  const flip = (k: "plant" | "lid" | "light"): void => {
    if (busy) return;
    if (k === "plant" && st.lid) {
      bad();
      f.say("용기 뚜껑이 닫혀 있어요. 먼저 <b>뚜껑을 연 뒤에</b> 상추 모종을 옮겨 보세요.");
      return;
    }
    tap();
    st[k] = !st[k];
    live = null;
    mix = { co2: 0.5, o2: 0.5 };
    cPlant.on(st.plant);
    cPlant.sub(st.plant ? "용기 안" : "용기 밖");
    cLid.on(st.lid);
    cLid.sub(st.lid ? "닫힘" : "열림");
    cLight.on(st.light);
    cLight.sub(st.light ? "켜짐" : "꺼짐");
    draw();
  };
  const run = bvBtn("main g2u5x-run", "10분 동안 기체 농도 측정하기");
  run.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    tap();
    const full = st.plant && st.lid;
    const kind = !st.plant ? "empty" : !st.lid ? "open" : st.light ? "bright" : "dark";
    live = { co2: full ? ramp(st.light ? 0.18 : 0.62) : ramp(0.5), o2: full ? ramp(st.light ? 0.84 : 0.4) : ramp(0.5), dash: kind !== "bright", t: 0 };
    [cPlant, cLid, cLight].forEach((c) => c.lock(true));
    run.disabled = true;
    f.say("센서로 용기 속 이산화 탄소와 산소 농도를 측정하고 있어요.");
    bvTween(tm, 2200, (t) => {
      if (live) {
        live.t = t;
        const at = (v: number[]): number => v[Math.min(v.length - 1, Math.round(t * (v.length - 1)))];
        mix = { co2: at(live.co2), o2: at(live.o2) };
      }
      draw();
    }, () => {
      busy = false;
      [cPlant, cLid, cLight].forEach((c) => c.lock(false));
      run.disabled = false;
      host.dataset.g5Last = kind;
      if (kind === "open") {
        bad();
        lab.slip();
        toast(lab, "기체 농도가 변하지 않아요", true);
        f.say("뚜껑이 열려 있어서 용기 안팎의 <b>공기가 섞여 버렸어요</b>. 뚜껑을 꼭 닫고 다시 측정해 보세요.");
        return;
      }
      if (kind === "empty") {
        bad();
        toast(lab, "기체 농도가 변하지 않아요", true);
        f.say("용기 안에 상추 모종이 없어서 기체 농도가 <b>그대로</b>예요. 모종을 용기 안에 넣고 다시 측정해 보세요.");
        return;
      }
      good();
      live = null;
      kept[kind] = true;
      draw();
      f.pips(kept.bright && kept.dark ? 2 : 1);
      const lit = "전등을 켜니 <b>이산화 탄소는 줄어들고 산소는 늘어났어요</b>.";
      const unlit = "전등을 끄니 반대로 <b>산소가 줄어들고 이산화 탄소가 늘어났어요</b>.";
      if (kind === "bright") f.say(kept.dark ? `${lit} 이제 두 결과를 비교해 봐요!` : `${lit} 이번에는 전등을 끄고도 측정해 볼까요?`);
      else f.say(kept.bright ? `${unlit} 이제 두 결과를 비교해 봐요!` : `${unlit} 이번에는 전등을 켜고도 측정해 볼까요?`);
      if (kept.bright && kept.dark) {
        [cPlant, cLid, cLight].forEach((c) => c.lock(true));
        run.textContent = "전등 켰을 때와 껐을 때 비교하기";
        run.classList.add("g2u5x-go");
        busy = true;
        run.onclick = () => {
          tap();
          lab.judge("전등을 <b>켰을 때</b> 상추가 흡수하여 용기 안에서 줄어든 기체는 무엇인가요?", [{ t: "이산화 탄소", ok: true }, { t: "산소" }, { t: "두 기체 모두" }], "빛을 받으면 광합성이 일어나 <b>이산화 탄소</b> 농도가 줄어들고 산소 농도가 늘어나요.", () =>
            lab.finish("빛을 받은 식물은 <b>이산화 탄소</b>를 흡수하고 <b>산소</b>를 내보내요. 이를 통해 광합성에 이산화 탄소가 쓰이고 산소가 만들어진다는 것을 알 수 있어요."),
          );
        };
      }
    });
  });
  f.slot.setControls(row(cPlant.el, cLid.el, cLight.el), run);
  draw();
  f.say("상추 모종을 용기에 넣고 뚜껑을 닫은 뒤, 전등을 켜거나 꺼서 <b>10분 동안</b> 기체 농도를 측정해 보세요.");
  return lab.cleanup;
};

// ── 알루미늄박으로 감싼 용기 ────────────────────────────────────────
type Inside = "leaf" | "root" | "none";
const IN: Record<Inside, { name: string; color: string; co2: number; o2: number }> = {
  leaf: { name: "상추 잎", color: P.leafHi, co2: 0.8, o2: 0.2 },
  root: { name: "당근 뿌리", color: "#FF9F5A", co2: 0.66, o2: 0.34 },
  none: { name: "빈 용기", color: "#9AA8BC", co2: 0.5, o2: 0.5 },
};
const DX = 34;
const DY = 78;
const DW = 102;
const DH = 116;
/** 받침이 있으면 "을", 없으면 "를"(마지막 글자로 가른다. 상추 잎을, 당근 뿌리를). */
const eul = (w: string): string => {
  const c = w.charCodeAt(w.length - 1) - 0xac00;
  return c >= 0 && c <= 11171 && c % 28 ? "을" : "를";
};

export const g2u5DarkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-dark", wait: "세 가지 용기를 모두 측정해 보세요" });
  const { f, tm } = lab;
  const A = newNs("dk");
  const ly = g5Layers(lab, "알루미늄박으로 감싸는 투명 용기와 농도 그래프", ["defs", "jar", "tag", "graph"]);
  const art = memo<string>();
  ly.set("defs", `<defs>${particleDefs(A)}${plantDefs(A)}${glassDefs(A)}${carrotDefs(A)}</defs>`);
  const kept = new Set<Inside>();
  let pick: Inside = "leaf";
  let liveT = -1; // 재는 중이면 0~1
  let wrapped = false;

  // 용기에 넣는 것: 따 낸 상추 잎 셋(바닥에 겹쳐 눕힘), 당근 뿌리 하나(비스듬히)
  // 잎은 밑동이 서로 떨어지게 눕혀 '따 낸 잎'으로 읽히게 한다(한 점에 모으면 자라는 포기처럼 보였다).
  const leafPile = (): string => looseLeaf(A, 42, 182, 74, 54, 16, { grad: "lb", seed: 3 }) + looseLeaf(A, 130, 186, -80, 52, 16, { grad: "lm", seed: 5 }) + looseLeaf(A, 56, 164, 100, 48, 15, { grad: "lf", seed: 9 });
  const inside = (k: Inside): string => (k === "leaf" ? leafPile() : k === "root" ? carrot(A, 124, 172, 76, 72, 18) : "");

  const draw = (): void => {
    const co2: Series[] = [];
    const o2: Series[] = [];
    (Object.keys(IN) as Inside[]).forEach((k) => {
      const mine = k === pick && liveT >= 0;
      if (!kept.has(k) && !mine) return;
      co2.push({ v: ramp(IN[k].co2), color: IN[k].color, upto: mine ? liveT : 1 });
      o2.push({ v: ramp(IN[k].o2), color: IN[k].color, upto: mine ? liveT : 1 });
    });
    ly.set("jar", art(`${pick}${wrapped}`, () => bench(2, 164, 196) + container(A, DX, DY, DW, DH, { lid: true, inside: inside(pick), foil: wrapped ? foil(A, DX, DY, DW, DH) : "" })));
    ly.set("tag", tag(85, 30, wrapped ? "알루미늄박으로 빛 차단" : `용기 속: ${pick === "none" ? "비어 있음" : IN[pick].name}`, { size: 12 }) + legend(6, 220, [...kept].map((k) => ({ name: k === "leaf" ? "잎" : k === "root" ? "뿌리" : "빈 용기", color: IN[k].color }))));
    ly.set("graph", graphs(co2, o2));
    host.dataset.g5Kept = String(kept.size);
  };

  const chips = (Object.keys(IN) as Inside[]).map((k) =>
    chip(k, IN[k].name, "측정 전", () => {
      if (liveT >= 0) return;
      tap();
      pick = k;
      wrapped = false;
      chips.forEach((c) => c.on(c.el.dataset.k === k));
      draw();
      f.say(k === "none" ? "비교를 위해 아무것도 넣지 않은 <b>빈 용기</b>를 골랐어요. 똑같이 빛을 가리고 측정해 보세요." : `용기에 <b>${IN[k].name}</b>${eul(IN[k].name)} 넣었어요. 알루미늄박으로 빛을 가리고 측정해 보세요.`);
    }),
  );
  chips[0].on(true);
  const run = bvBtn("main g2u5x-run", "알루미늄박으로 감싸고 10분 동안 측정하기");
  run.addEventListener("click", () => {
    if (liveT !== -1) return;
    if (kept.has(pick)) {
      f.say("이미 측정을 마친 용기예요. 아직 측정하지 않은 <b>다른 용기</b>를 골라 보세요.");
      return;
    }
    tap();
    wrapped = true;
    liveT = 0;
    chips.forEach((c) => c.lock(true));
    run.disabled = true;
    f.say(`빛을 차단한 상태에서 <b>${IN[pick].name}</b>의 기체 농도 변화를 측정하고 있어요.`);
    bvTween(tm, 2200, (t) => {
      liveT = t;
      draw();
    }, () => {
      liveT = -1;
      kept.add(pick);
      const mine = chips.find((c) => c.el.dataset.k === pick);
      mine?.done();
      mine?.sub("측정 완료");
      chips.forEach((c) => c.lock(false));
      run.disabled = false;
      draw();
      host.dataset.g5Last = pick;
      const living = [...kept].filter((k) => k !== "none").length;
      f.pips(kept.size === 3 ? 2 : living ? 1 : 0);
      if (pick === "none") {
        tap();
        f.say("식물이 없는 빈 용기에서는 두 기체의 농도가 모두 <b>변하지 않았어요</b>.");
      } else {
        good();
        f.say(pick === "root" ? "엽록체가 없는 <b>당근 뿌리</b>에서도 산소가 줄고 이산화 탄소가 늘어났어요! 뿌리도 잎처럼 숨을 쉰다는 뜻이에요." : "빛이 없자 <b>상추 잎</b>에서도 산소가 줄고 이산화 탄소가 늘어났어요.");
      }
      if (kept.size === 3) {
        chips.forEach((c) => c.lock(true));
        run.textContent = "세 용기의 측정 결과 비교하기";
        run.classList.add("g2u5x-go");
        run.onclick = () => {
          tap();
          lab.judge("빛이 없는 용기 안에서 상추 잎과 당근 뿌리가 <b>흡수하여 줄어든</b> 기체는 무엇인가요?", [{ t: "산소", ok: true }, { t: "이산화 탄소" }, { t: "줄어든 기체가 없다" }], "상추 잎과 당근 뿌리가 들어 있는 두 용기 모두 <b>산소</b> 농도가 줄고 이산화 탄소 농도가 늘어났어요.", () =>
            lab.finish("식물은 초록색 잎뿐만 아니라 <b>뿌리</b>까지 살아 있는 모든 세포에서 끊임없이 <b>산소</b>를 흡수하고 <b>이산화 탄소</b>를 내보내요. 이 일이 <b>호흡</b>이에요."),
          );
        };
        liveT = -2; // 더는 측정하지 않는다(단추는 판정으로 간다)
      }
    });
  });
  f.slot.setControls(row(...chips.map((c) => c.el)), run);
  draw();
  f.say("이번에는 알루미늄박으로 빛을 완전히 가려 볼 거예요. 용기에 넣을 대상을 고르고 기체 농도를 측정해 보세요.");
  return lab.cleanup;
};

// ── 빛의 세기 실험 설계 ─────────────────────────────────────────────
const TEMPS = [20, 30];
const GAIN = [0, 2, 4, 5, 5];

export const g2u5DesignLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-design", wait: "전등 수를 1개부터 4개까지 바꿔 가며 측정해 보세요", tall: true });
  const { f, tm } = lab;
  const A = newNs("de");
  const ly = g5Layers(lab, "전등 네 개와 상추 용기, 켠 전등 수에 따른 산소 증가량 그래프", ["defs", "rig", "jar", "chart"]);
  const art = memo<string>();
  ly.set("defs", `<defs>${particleDefs(A)}${plantDefs(A)}${glassDefs(A)}<linearGradient id="${A}bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4C9BD8"/><stop offset=".45" stop-color="#9AD6FF"/><stop offset="1" stop-color="#5BA8E3"/></linearGradient></defs>`);
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
    // 전등 넷(가로대에 매단 발광 다이오드 막대등): 켠 수만큼 빛이 용기로 내려간다
    ly.set(
      "rig",
      art(`rig${lamps}`, () => {
        let r = `<rect x="18" y="16" width="112" height="5" rx="2.5" fill="url(#${A}metal)" stroke="#2D3748" stroke-width=".7"/><rect x="14" y="14" width="6" height="9" rx="1.5" fill="#3B4659"/><rect x="128" y="14" width="6" height="9" rx="1.5" fill="#3B4659"/>`;
        [0, 1, 2, 3].forEach((i) => (r += ledBar(A, 38 + i * 24, 44, i < lamps, 128)));
        return r + bench(2, 150, 196);
      }),
    );
    ly.set("jar", art("jar", () => container(A, 26, 92, 96, 102, { lid: true, inside: seedling(A, 74, 192, 0.92, 11) })) + tag(71, 219, `용기 온도 ${TEMPS[ti]} ℃`, { size: 12, fill: ref >= 0 && TEMPS[ti] !== ref ? P.bad : "#E8EEF9" }));
    let bars = "";
    for (let n = 1; n <= 4; n++) {
      const v = valid.get(n);
      const g = grow && grow.n === n && !grow.odd ? grow.v * grow.t : undefined;
      const val = g ?? v;
      if (val !== undefined && val > 0.05) bars += `<rect x="${X(n) - 11}" y="${Y(val)}" width="22" height="${186 - Y(val)}" rx="4" fill="url(#${A}bar)" stroke="#2F6FA8" stroke-width="1.2"/><rect x="${X(n) - 8}" y="${Y(val) + 2}" width="4" height="${Math.max(0, 186 - Y(val) - 6)}" rx="2" fill="#FFFFFF" opacity=".28"/>`;
      const o = grow && grow.n === n && grow.odd ? grow.v * grow.t : off.get(n);
      if (o !== undefined) bars += `<rect x="${X(n) + 2}" y="${Y(o)}" width="12" height="${186 - Y(o)}" rx="3" fill="rgba(255,138,148,.08)" stroke="${P.bad}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
      bars += txt(X(n), 202, `${n}개`, { size: 12, fill: lamps === n ? "#E8EEF9" : P.dim });
    }
    let grid = "";
    [1, 2, 3, 4, 5, 6].forEach((k) => (grid += `<line x1="179" y1="${Y(k)}" x2="330" y2="${Y(k)}" stroke="#1E3150" stroke-width="1"/>`));
    // 머리 줄은 제목만(제목이 길어 '점선' 이름표와 겹친다). 가로축 이름은 왼쪽(축 시작) 맞춤, '점선' 이름표는 같은 줄 오른쪽 끝(2026-11-16 글 다듬기)
    ly.set(
      "chart",
      `<rect x="150" y="10" width="188" height="210" rx="10" fill="#0E1A2E" stroke="#2A4266"/><rect x="151" y="11" width="186" height="24" rx="9" fill="#14233C"/>` +
        txt(160, 28, "발생한 산소량(광합성량)", { anchor: "start", size: 12, fill: P.o2 }) +
        grid +
        `<line x1="178" y1="40" x2="178" y2="186" stroke="#55698A"/><line x1="178" y1="186" x2="330" y2="186" stroke="#55698A"/>` +
        bars +
        txt(180, 216, "켠 전등 개수", { anchor: "start", size: 12, fill: P.dim }) +
        (off.size || (grow && grow.odd) ? txt(330, 216, "점선: 온도가 다름", { anchor: "end", size: 12, fill: P.bad }) : ""),
    );
    host.dataset.g5Valid = String(valid.size);
    host.dataset.g5Off = String(off.size);
  };

  const sLamp = stepper("켠 전등 개수", "lamp", (d) => {
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
  const run = bvBtn("main g2u5x-run", "5분 동안 산소량 측정하기");
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
        toast(lab, "온도가 달라져서 결과를 비교할 수 없어요", true);
        f.say(`전등 개수와 함께 온도까지 바꾸면 광합성량 차이가 빛 때문인지 알 수 없어요. 온도를 처음과 같은 <b>${ref} ℃</b>로 맞추고 다시 측정해 보세요.`);
        return;
      }
      valid.set(lamps, v);
      draw();
      good();
      f.pips(valid.size >= 4 ? 2 : 1);
      if (valid.size < 4) {
        f.say(`전등 <b>${lamps}개</b>일 때의 결과를 기록했어요. 남은 전등 개수도 같은 온도(<b>${ref} ℃</b>)에서 측정해 보세요.`);
        return;
      }
      busy = true;
      sLamp.lock(true);
      sTemp.lock(true);
      run.disabled = true;
      off.clear();
      draw();
      f.say("전등 1개부터 4개까지 같은 온도에서 모두 측정했어요! 그래프의 막대 높이를 비교해 볼까요?");
      tm.later(() => {
        lab.judge("전등을 <b>3개에서 4개</b>로 늘렸을 때 광합성량은 어떻게 변했나요?", [{ t: "더 이상 늘어나지 않고 일정했다", ok: true }, { t: "계속 늘어났다" }, { t: "오히려 줄어들었다" }], "그래프에서 전등이 3개일 때와 4개일 때의 막대 높이가 <b>같다는 점</b>을 확인해 보세요.", () =>
          lab.finish("빛이 강할수록 광합성량이 <b>증가하다가</b>, 일정한 세기 이상이 되면 <b>더 이상 증가하지 않고 일정</b>하게 유지돼요. 이때 온도 같은 다른 조건은 같게 유지해야 빛의 효과를 정확히 비교할 수 있어요."),
        );
      }, 1500);
    });
  });
  f.slot.setControls(sLamp.el, sTemp.el, run);
  draw();
  f.say("발생한 산소량이 많을수록 광합성이 활발하게 일어난 거예요. 빛의 세기 효과를 알아보려면 <b>무엇을 바꾸고 무엇을 같게</b> 유지해야 할까요?");
  return lab.cleanup;
};
