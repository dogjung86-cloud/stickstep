// [중2 Ⅵ v5] 세포호흡과 기관계의 협력 랩 두 판(g2u6l6).
//
// g2u6RespLab 「세포는 무엇이 있어야 에너지를 얻을까요?」
//   책의 그림(세포호흡과 에너지의 이용: 포도당 + 산소 → 이산화 탄소 + 물 + 에너지, 마이토콘드리아).
//   학생이 정하는 것: 세포에 포도당과 산소를 줄지 끊을지. 하나라도 끊으면 에너지가 나오지 않는다.
//
// g2u6TeamLab 「기관계 하나가 멈추면 세포는 어떻게 될까요?」
//   책의 해 보기 「세포호흡과 소화, 순환, 호흡, 배설의 관계 알아보기」의 모식도.
//   학생이 정하는 것: 네 기관계 가운데 멈출 하나. 멈춘 기관계에 따라 끊기는 물질과 쌓이는 물질이 그 자리에서 보인다.

import type { StepRenderer } from "../../types";
import { P, arrow, bvBtn, chip, dot, g6Lab, g6Svg, good, row, tag, tap, txt, type G6Step } from "./kit";

// ── 세포호흡 ───────────────────────────────────────────────────────
export const g2u6RespLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-resp", wait: "포도당과 산소를 세포에 공급해 보세요", tall: true });
  const { f } = lab;
  const stage = g6Svg(lab, "마이토콘드리아가 있는 세포. 왼쪽에서 포도당과 산소가 들어오고 오른쪽으로 이산화 탄소와 물이 나간다");
  let glu = false;
  let o2 = false;
  const seen = new Set<string>();

  const draw = (): void => {
    const on = glu && o2;
    let out = `<rect x="92" y="34" width="170" height="150" rx="34" fill="rgba(240,160,112,.12)" stroke="#F0A070" stroke-width="2"/>` + tag(177, 26, "세포", { size: 12 });
    // 마이토콘드리아
    out += `<ellipse cx="177" cy="112" rx="52" ry="27" fill="${on ? "#7A3E22" : "#3A2A24"}" stroke="#F0A070" stroke-width="2"/><path d="M134 112 q9 -18 18 0 q9 18 18 0 q9 -18 18 0 q9 18 18 0 q6 -12 12 -4" fill="none" stroke="#F8C9A8" stroke-width="2.2" opacity=".8"/>`;
    out += txt(177, 162, "마이토콘드리아", { size: 12, fill: P.hi });
    // 들어오는 것
    out += tag(42, 70, "포도당", { size: 12, fill: glu ? "#fff" : P.dim }) + tag(42, 134, "산소", { size: 12, fill: o2 ? "#fff" : P.dim });
    if (glu) out += arrow(42, 84, 122, 104, P.glucose, 3, "g2u6x-flow") + [0, 1, 2].map((i) => dot(60 + i * 18, 92 + i * 4, 5, P.glucose, "#8A5A0A")).join("");
    if (o2) out += arrow(42, 142, 122, 120, P.o2, 3, "g2u6x-flow") + [0, 1, 2].map((i) => dot(60 + i * 18, 136 - i * 5, 5, P.o2, "#2F6FA8")).join("");
    // 나가는 것
    out += tag(300, 70, "이산화 탄소", { size: 12, fill: on ? "#fff" : P.dim }) + tag(300, 134, "물", { size: 12, fill: on ? "#fff" : P.dim });
    if (on) {
      out += arrow(232, 104, 300, 84, P.co2, 3, "g2u6x-flow") + arrow(232, 120, 300, 142, P.water, 3, "g2u6x-flow");
      out += [0, 1, 2, 3, 4].map((i) => `<path class="g2u6x-blink" d="M${150 + i * 14} 98 l5 -11 l-1 8 l6 -1 l-6 12 l1 -8 z" fill="${P.energy}"/>`).join("");
    }
    // 에너지의 쓰임. "에너지가 나와요"는 그대로 둔다(수정안의 "만들어져요"는 에너지가 새로 생기는 것처럼 읽힌다. 단원은 '얻다'와 '나오다'로 쓴다).
    // '생장'은 단원 개념 스텝(에너지의 이용)이 쓰는 '성장'으로 맞췄다.
    out += txt(177, 204, on ? "에너지가 나와요" : "에너지가 나오지 않아요", { size: 13, fill: on ? P.energy : P.bad, weight: 800 });
    out += txt(177, 222, on ? "체온 유지, 근육 운동, 성장 등에 쓰여요" : glu || o2 ? (glu ? "산소가 부족해요" : "포도당이 부족해요") : "아직 공급된 물질이 없어요", { size: 12, fill: P.dim });
    stage.set(out);
    host.dataset.g6On = on ? "1" : "0";
    host.dataset.g6Seen = String(seen.size);
  };
  const go = bvBtn("main g2u6x-go", "알아낸 것 정리하기");
  go.disabled = true;
  const update = (): void => {
    const key = `${glu ? 1 : 0}${o2 ? 1 : 0}`;
    if (key !== "00") seen.add(key);
    draw();
    if (glu && o2) {
      good();
      f.say("세포에 <b>포도당</b>과 <b>산소</b>가 함께 공급되자 <b>에너지</b>가 나오고 이산화 탄소와 물이 생겼어요! 이번에는 둘 중 하나를 꺼 볼까요?");
    } else if (glu) f.say("포도당만으로는 에너지를 꺼낼 수 없어요. <b>산소</b>도 함께 공급해 보세요.");
    // 수정안의 "에너지를 만들 수 없어요"는 단원의 말(에너지를 얻다)에 맞춰 "얻을 수 없어요"로 썼다
    else if (o2) f.say("산소만으로는 에너지를 얻을 수 없어요. 분해할 영양소인 <b>포도당</b>도 함께 공급해 보세요.");
    else f.say("세포가 <b>에너지</b>를 얻으려면 무엇이 필요할까요? 아래 버튼을 눌러 공급해 보세요.");
    f.pips(Math.min(2, seen.size));
    go.disabled = seen.size < 3;
    if (seen.size === 3 && glu && o2) f.say("포도당과 산소 두 가지가 모두 있어야 세포가 에너지를 얻을 수 있어요. 아래 버튼을 눌러 정리해 보세요.");
  };
  const cG = chip("glu", "포도당(영양소)", "공급 안 함", () => {
    tap();
    glu = !glu;
    cG.on(glu);
    cG.sub(glu ? "공급 중" : "공급 안 함");
    update();
  });
  const cO = chip("o2", "산소", "공급 안 함", () => {
    tap();
    o2 = !o2;
    cO.on(o2);
    cO.sub(o2 ? "공급 중" : "공급 안 함");
    update();
  });
  go.addEventListener("click", () => {
    tap();
    // 이유 글: 세포호흡이라는 이름은 이 랩 바로 뒤의 개념 스텝이 붙이므로 수정안의 "세포 호흡에"는 뺐다
    lab.judge("세포에서 산소를 이용해 포도당을 분해하고 에너지를 얻을 때 <b>새로 생기는 노폐물</b>은 무엇인가요?", [{ t: "이산화 탄소와 물", ok: true }, { t: "산소와 포도당" }, { t: "요소와 산소" }], "포도당과 산소는 <b>쓰인 재료</b>이고, 분해 결과 새로 만들어진 물질은 <b>이산화 탄소와 물</b>이에요.", () =>
      lab.finish("세포는 <b>포도당</b> 같은 영양소를 <b>산소</b>와 반응시켜 에너지를 얻어요. 이때 이산화 탄소와 물이 생겨요. 이 일은 주로 마이토콘드리아에서 일어나요."),
    );
  });
  f.slot.setControls(row(cG.el, cO.el), go);
  update();
  return lab.cleanup;
};

// ── 기관계의 협력 ──────────────────────────────────────────────────
type Sys = "dig" | "res" | "cir" | "exc";
const SYS: { key: Sys; name: string }[] = [
  { key: "dig", name: "소화계" },
  { key: "res", name: "호흡계" },
  { key: "cir", name: "순환계" },
  { key: "exc", name: "배설계" },
];
// 수정안의 "에너지를 만들지 못해요"는 단원의 말에 맞춰 "얻지 못해요"로, "세포 호흡"은 단원 표기 "세포호흡"으로 썼다
const OFF_SAY: Record<Sys, string> = {
  dig: "<b>소화계</b>가 멈추자 음식물 속 영양소가 흡수되지 않아 조직세포가 에너지를 얻지 못해요.",
  res: "<b>호흡계</b>가 멈추자 세포호흡에 필요한 산소가 들어오지 못하고, 이산화 탄소도 밖으로 나가지 못해 몸속에 쌓여요.",
  cir: "가운데서 다리 역할을 하던 <b>순환계</b>가 멈추자 영양소, 산소, 노폐물의 운반이 모두 멈추며 모든 연결이 끊어졌어요!",
  exc: "<b>배설계</b>가 멈추자 세포호흡 결과 생긴 노폐물(요소)이 걸러지지 않고 몸속에 쌓여요.",
};

export const g2u6TeamLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 4, cls: "g2u6x-team", wait: "네 가지 기관계를 하나씩 멈춰 보며 변화를 확인해 보세요", tall: true });
  const { f } = lab;
  const stage = g6Svg(lab, "가운데 조직세포를 순환계가 둘러싸고 소화계, 호흡계, 배설계가 순환계와 이어진 모식도");
  let off: Sys | null = null;
  const seen = new Set<Sys>();

  const box = (x: number, y: number, w: number, h: number, name: string, dead: boolean): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${dead ? "#2A1A20" : "#17253D"}" stroke="${dead ? P.bad : "#6C86AE"}" stroke-width="${dead ? 2.4 : 1.6}"${dead ? ` stroke-dasharray="5 4"` : ""}/>${txt(x + w / 2, y + h / 2 + 4.5, dead ? `${name} 멈춤` : name, { size: 12.5, fill: dead ? P.bad : "#fff", weight: 800 })}`;
  const flow = (x0: number, y0: number, x1: number, y1: number, color: string, label: string, lx: number, ly: number, ok: boolean, anchor = "middle"): string =>
    (ok ? arrow(x0, y0, x1, y1, color, 2.8, "g2u6x-flow") : `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#4A5870" stroke-width="2" stroke-dasharray="3 5"/>`) + txt(lx, ly, label, { size: 12, fill: ok ? color : "#66788F", anchor });
  const draw = (): void => {
    const cir = off !== "cir";
    const nut = cir && off !== "dig";
    const oxy = cir && off !== "res";
    const co2 = cir && off !== "res";
    const ure = cir && off !== "exc";
    const energy = nut && oxy;
    let out = "";
    // 순환계(가운데 고리)와 조직세포
    out += `<ellipse cx="173" cy="118" rx="74" ry="50" fill="none" stroke="${cir ? P.red : "#4A5870"}" stroke-width="12" opacity="${cir ? 0.85 : 0.6}"${cir ? "" : ` stroke-dasharray="6 8"`}/>`;
    out += txt(173, 58, cir ? "순환계" : "순환계 멈춤", { size: 12.5, fill: cir ? "#FFD3D8" : P.bad, weight: 800 });
    out += `<circle cx="173" cy="118" r="30" fill="${energy ? "#7A3E22" : "#2A2430"}" stroke="#F0A070" stroke-width="2"/>${txt(173, 115, "조직세포", { size: 12, fill: "#fff" })}${txt(173, 131, energy ? "에너지 얻음" : "에너지 없음", { size: 12, fill: energy ? P.energy : P.bad })}`;
    // 소화계(왼쪽 위), 호흡계(오른쪽 위), 배설계(아래)
    out += box(6, 8, 84, 36, "소화계", off === "dig") + box(256, 8, 84, 36, "호흡계", off === "res") + box(131, 190, 84, 36, "배설계", off === "exc");
    out += flow(60, 46, 108, 86, P.glucose, "영양소", 50, 80, nut, "middle");
    out += flow(270, 46, 228, 84, P.o2, "산소", 240, 56, oxy, "end");
    out += flow(252, 110, 324, 48, P.co2, "이산화 탄소", 340, 98, co2, "end");
    out += flow(173, 170, 173, 188, P.urea, "노폐물", 190, 184, ure, "start");
    // 쌓이는 것
    if (off === "res" || off === "cir") out += tag(282, 152, "이산화 탄소 쌓임", { size: 12, fill: P.bad, stroke: P.bad });
    if (off === "exc" || off === "cir") out += tag(60, 152, "노폐물 쌓임", { size: 12, fill: P.bad, stroke: P.bad });
    stage.set(out);
    host.dataset.g6Off = off ?? "";
    host.dataset.g6Seen = String(seen.size);
  };
  const go = bvBtn("main g2u6x-go", "기관계의 협력 관계 정리하기");
  go.disabled = true;
  const chips = SYS.map((sy) =>
    chip(sy.key, sy.name, "정상 작동 중", () => {
      tap();
      off = off === sy.key ? null : sy.key;
      chips.forEach((c, i) => {
        const dead = off === SYS[i].key;
        c.on(dead);
        c.sub(dead ? "작동 멈춤" : "정상 작동 중");
      });
      if (off) {
        seen.add(off);
        chips[SYS.indexOf(sy)].done();
        f.say(OFF_SAY[off]);
      } else f.say("네 가지 기관계가 모두 정상적으로 협력하자 다시 조직세포에서 <b>에너지</b>가 나와요!");
      f.pips(Math.min(3, seen.size));
      go.disabled = seen.size < 4;
      draw();
    }),
  );
  go.addEventListener("click", () => {
    tap();
    lab.judge("작동이 멈췄을 때 영양소, 산소, 노폐물의 운반이 <b>모두 한꺼번에 끊긴</b> 기관계는 무엇인가요?", [{ t: "순환계", ok: true }, { t: "소화계" }, { t: "호흡계" }], "소화계, 호흡계, 배설계와 온몸의 조직세포 사이에서 물질을 실어 나르며 이어 주는 것은 <b>순환계</b>예요.", () =>
      lab.finish("<b>소화계</b>(영양소 소화·흡수), <b>호흡계</b>(산소 흡수·이산화 탄소 배출), <b>순환계</b>(물질 운반), <b>배설계</b>(노폐물 배출)가 서로 긴밀하게 협력해야 조직세포가 세포호흡으로 에너지를 얻고 우리 몸이 건강하게 살아갈 수 있어요."),
    );
  });
  f.slot.setControls(row(chips[0].el, chips[1].el), row(chips[2].el, chips[3].el), go);
  draw();
  f.say("소화계, 순환계, 호흡계, 배설계가 함께 협력하여 조직세포에 에너지를 공급하고 있어요. 아래 버튼을 눌러 하나씩 <b>멈추면</b> 어떤 일이 일어나는지 확인해 보세요.");
  return lab.cleanup;
};
