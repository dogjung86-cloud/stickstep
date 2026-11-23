// [중2 Ⅳ v5] g2u4l5 입자 랩 두 판.
//   g2u4MolLab 「결합하는 원자의 개수가 달라지면 물질의 성질은 어떻게 될까요?」
//     활동(여러 가지 분자의 구성 알아보기: 일산화 탄소와 이산화 탄소처럼 원자의 종류가 같은 분자의 성질은 같을까)과 본문(물 분자를 나누면 물의 성질이 사라진다).
//     학생이 정하는 것: 탄소 원자에 산소 원자를 붙이고 떼는 일, 물 분자를 원자로 나누는 일. 손을 대면 이름과 성질 카드가 그 자리에서 바뀐다.
//     판정(CO와 CO₂는 같은 물질일까요?)이 뜨면 두 분자를 나란히 놓고 아래에 성질을 한 줄씩 적는다. 물 분자는 굽은 모양(결합 각 104.5°).
//   g2u4IonLab 「원자가 전자를 잃거나 얻으면 어떤 전하를 띠게 될까요?」
//     그림(이온의 형성)과 본문(나트륨 원자는 전자를 잃고 염소 원자는 전자를 얻는다). 학생이 전자를 한 개씩 건넨다. 양쪽의 (+)와 (−) 개수가 그 자리에서 바뀐다.
//     나트륨과 염소(전자 1개) → 마그네슘과 산소(전자 2개). 원자와 이온은 구름 모형이고, 구름의 크기는 실제 반지름의 비를 따른다.

import type { StepRenderer } from "../../types";
import { bvTween } from "../bio6/b6Lab";
import { ball, bond, bvBtn, cloud, cloudDefs, cloudSpots, electron, g4Lab, g4Svg, good, iga, nucleus, ro, row, spotAngle, tap, txt, type G4Step } from "./kit";

// ── 분자 ────────────────────────────────────────────────────────────
const CX = 173;
const CY = 92;
// 이산화 탄소 카드: 수정안의 "탄산음료에 들어 있는 안전한 기체"에서 "안전한"을 뺐다(이산화 탄소도 많이 들이마시면 해롭다)
const CARB = [
  { name: "탄소 원자", f: "C", prop: "아직 다른 원자와 결합하지 않은 원자" },
  { name: "일산화 탄소 분자", f: "CO", prop: "독성이 있어 흡입하면 위험한 기체" },
  { name: "이산화 탄소 분자", f: "CO₂", prop: "탄산음료에 들어 있는 기체" },
];

export const g2u4MolLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-mol", wait: "탄소 원자에 산소 원자를 결합해 보고 성질을 비교해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "원자가 결합한 분자 모형");
  let o = 0;
  const seen = new Set<number>([0]);
  let split = false;
  let act = 1;

  const card = (name: string, formula: string, prop: string): string =>
    `<rect x="48" y="150" width="250" height="62" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)"/>${txt(64, 175, name, { anchor: "start", size: 15, fill: "#fff", weight: 800 })}${txt(282, 175, formula, { anchor: "end", size: 15, fill: "#FFE58A", weight: 800 })}${txt(64, 198, prop, { anchor: "start", size: 13 })}`;
  // 판정 때: 두 분자를 나란히(왼쪽 CO, 오른쪽 CO₂), 그 아래 카드에 이름, 화학식, 성질 한 줄
  const halfCard = (x: number, name: string, formula: string, prop: string): string =>
    `<rect x="${x}" y="128" width="162" height="76" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)"/>${txt(x + 13, 155, name, { anchor: "start", size: 14, fill: "#fff", weight: 800 })}${txt(x + 149, 155, formula, { anchor: "end", size: 14, fill: "#FFE58A", weight: 800 })}${txt(x + 13, 184, prop, { anchor: "start", size: 12.5 })}`;
  const compare = (): string => {
    const y = 70;
    const k = 1.5;
    const L = 42;
    const co = bond(88 - L / 2, y, 88 + L / 2, y) + ball(88 + L / 2, y, "O", { k }) + ball(88 - L / 2, y, "C", { k });
    const co2 = bond(258 - L, y, 258 + L, y) + ball(258 - L, y, "O", { k }) + ball(258 + L, y, "O", { k }) + ball(258, y, "C", { k });
    return co + co2 + halfCard(8, "일산화 탄소", "CO", "마시면 위험한 기체") + halfCard(176, "이산화 탄소", "CO₂", "탄산음료 속 기체");
  };
  // 물 분자: 두 수소가 산소에서 좌우로 52.25°씩 벌어진다(결합 각 104.5°, SCI_GUIDE Ⅳ의 굽은형)
  const HOH = (104.5 / 2) * (Math.PI / 180);
  const draw = (): void => {
    if (act === 0) {
      stage.set(compare());
      host.dataset.g4O = "cmp";
      return;
    }
    if (act === 1) {
      const c = CARB[o];
      const art =
        (o >= 1 ? bond(CX, CY, CX + 46, CY) : "") + (o >= 2 ? bond(CX, CY, CX - 46, CY) : "") + (o >= 1 ? ball(CX + 46, CY, "O", { k: 1.7, cls: "g2u4x-pop" }) : "") + (o >= 2 ? ball(CX - 46, CY, "O", { k: 1.7, cls: "g2u4x-pop" }) : "") + ball(CX, CY, "C", { k: 1.7 });
      stage.set(art + card(c.name, c.f, c.prop));
      host.dataset.g4O = String(o);
      return;
    }
    const oy = CY - 10;
    const L = 40;
    const hx = L * Math.sin(HOH);
    const hy = oy + L * Math.cos(HOH);
    const art = split
      ? ball(CX - hx - 46, hy + 10, "H", { k: 1.7 }) + ball(CX + hx + 46, hy + 10, "H", { k: 1.7 }) + ball(CX, oy - 22, "O", { k: 1.7 })
      : bond(CX, oy, CX - hx, hy) + bond(CX, oy, CX + hx, hy) + ball(CX - hx, hy, "H", { k: 1.7 }) + ball(CX + hx, hy, "H", { k: 1.7 }) + ball(CX, oy, "O", { k: 1.7 });
    stage.set(art + (split ? card("수소 원자 2개와 산소 원자 1개", "", "물 고유한 성질이 사라짐") : card("물 분자", "H₂O", "마실 수 있는 물 고유한 성질을 지님")));
    host.dataset.g4Split = split ? "1" : "0";
  };

  const add = bvBtn("main g2u4x-mol-add", "산소 원자 1개 붙이기");
  const sub = bvBtn("g2u4x-mol-sub", "산소 원자 1개 떼기");
  const cut = bvBtn("main g2u4x-mol-cut", "낱개의 원자로 나누기");
  const act2 = (): void => {
    act = 2;
    f.pips(2);
    draw();
    f.slot.setControls(cut);
    api.setCTA("물 분자를 원자로 나누어 성질이 유지되는지 확인해 보세요", { enabled: false });
    f.say("이번에는 수소 원자 2개와 산소 원자 1개가 결합한 <b>물 분자(H₂O)</b>예요. 아래 버튼을 눌러 물 분자를 낱개의 원자로 나누어 보세요.");
  };
  const check = (): void => {
    if (seen.size < 3 || act !== 1) return;
    act = 0;
    f.pips(1);
    tm.later(() => {
      draw(); // 두 분자를 나란히 놓고 묻는다
      lab.judge(
        "일산화 탄소(CO)와 이산화 탄소(CO₂)는 이루는 원자의 종류가 탄소와 산소로 같아요. 그렇다면 두 물질은 <b>같은 물질</b>일까요?",
        // 정답 보기는 수정안의 "결합한 원자의 개수가 다르므로 성질이 다른 별개의 물질이다"를 줄였다(오답 카드의 정답 글이 두 줄이 되면 조작 칸 208px를 넘는다)
        [{ t: "결합한 원자의 개수가 달라 성질이 다른 물질이다", ok: true }, { t: "이루는 원자의 종류가 같으므로 성질도 같은 물질이다" }, { t: "부르는 이름만 다를 뿐 실제로는 같은 물질이다" }],
        "같은 종류의 원자로 이루어져 있어도 <b>결합한 원자의 개수</b>가 다르면 성질이 전혀 다른 새로운 분자가 되기 때문이에요.",
        act2,
      );
    }, 1100);
  };
  add.addEventListener("click", () => {
    if (act !== 1) return;
    if (o >= 2) {
      // 수정안의 "탄소 원자 하나에는 산소 원자가 최대 2개까지만 결합해요"는 틀린 일반화라(제빵 소다 속 탄소에는 산소 3개가 붙는다) 이 탄소 원자에 한정해 둔다
      f.say("이 탄소 원자에는 산소 원자가 더 결합하지 않아요. 이번에는 산소 원자를 <b>떼어</b> 보세요.");
      return;
    }
    tap();
    o += 1;
    seen.add(o);
    draw();
    f.say(
      o === 1
        ? "탄소 원자에 산소 원자 1개가 결합해 <b>일산화 탄소(CO)</b> 분자가 되었어요! 산소 원자를 하나 더 붙여 볼까요?"
        : "산소 원자가 2개가 되자 <b>이산화 탄소(CO₂)</b> 분자가 되었어요! 결합한 산소 원자의 개수가 달라지니 물질의 이름도, 성질도 완전히 달라졌네요.",
    );
    check();
  });
  sub.addEventListener("click", () => {
    if (act !== 1 || o <= 0) return;
    tap();
    o -= 1;
    draw();
    f.say(`산소 원자 1개를 떼어 냈더니 다시 <b>${CARB[o].name}</b>${iga(CARB[o].name)} 되었어요.`);
  });
  cut.addEventListener("click", () => {
    if (split) return;
    tap();
    split = true;
    cut.disabled = true;
    draw();
    f.pips(3);
    f.say("결합이 끊어져 낱개의 원자로 흩어지자 더 이상 물의 성질을 나타내지 못해요! <b>물의 성질</b>은 물 분자 상태로 결합해 있을 때만 나타나요.");
    tm.later(() => {
      lab.judge(
        "물질이 <b>물의 고유한 성질</b>을 그대로 지니고 있는 가장 작은 입자는 무엇인가요?",
        [{ t: "물 분자", ok: true }, { t: "수소 원자" }, { t: "산소 원자" }],
        "물 분자가 수소 원자와 산소 원자로 나뉘면 물 고유한 성질이 <b>사라지기</b> 때문이에요.",
        () => lab.finish("독립된 입자로 존재하여 물질의 성질을 나타내는 가장 작은 입자를 <b>분자</b>라고 해요. 결합한 원자의 종류나 개수가 달라지면 성질이 다른 새로운 분자가 돼요."),
      );
    }, 1900);
  });
  f.slot.setControls(row(sub, add));
  draw();
  f.say("화면 가운데에 <b>탄소 원자(C)</b> 하나가 있어요. 아래 버튼을 눌러 산소 원자를 하나씩 결합해 보세요. 어떤 물질이 만들어질까요?");
  return lab.cleanup;
};

// ── 이온 ────────────────────────────────────────────────────────────
// 원자와 이온은 그림(이온의 형성)처럼 구름 모형으로 그린다: 옅은 파란 구름 가운데 +N 원자핵, 전자는 고리 없이 구름 안에 고르게(개수는 정확히).
// 구름의 반지름은 실제 반지름(pm)의 비를 따른다. 원자: Na 186, Cl 99, Mg 160, O 73. 이온: Na⁺ 102, Cl⁻ 181, Mg²⁺ 72, O²⁻ 140
// (Na⁺와 Cl⁻는 캔 음료 랩의 염화 나트륨과 같은 값). 그래서 양이온은 제 원자보다 작고 음이온은 제 원자보다 크다(음이온 > 원자 > 양이온).
// 한 판의 두 원자는 같은 배율이고, 판마다 가장 큰 구름이 반지름 RMAX가 되게 맞춘다. 전자가 건너가는 동안 두 구름의 크기도 함께 바뀐다
// (마그네슘처럼 둘을 건넬 때 하나만 건넌 사이는 원자와 이온의 가운데 크기로 둔다).
interface Side {
  name: string;
  sym: string;
  p: number;
  ion: string;
  ionName: string;
  atomPm: number;
  ionPm: number;
}
interface Pair {
  a: Side;
  b: Side;
  n: number; // 건넬 전자 수
}
const PAIRS: Pair[] = [
  { a: { name: "나트륨", sym: "Na", p: 11, ion: "Na⁺", ionName: "나트륨 이온", atomPm: 186, ionPm: 102 }, b: { name: "염소", sym: "Cl", p: 17, ion: "Cl⁻", ionName: "염화 이온", atomPm: 99, ionPm: 181 }, n: 1 },
  { a: { name: "마그네슘", sym: "Mg", p: 12, ion: "Mg²⁺", ionName: "마그네슘 이온", atomPm: 160, ionPm: 72 }, b: { name: "산소", sym: "O", p: 8, ion: "O²⁻", ionName: "산화 이온", atomPm: 73, ionPm: 140 }, n: 2 },
];
const AX = 86;
const BX = 260;
const AY = 104;
const RMAX = 74;
const NR = 11; // 원자핵 반지름(+17도 12px 글자로 든다)
const ER = 4.3; // 전자 반지름
const signed = (n: number): string => (n === 0 ? "0" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);
/** 전자를 건네기 전 맨 아래 버튼의 글(처음과 둘째 판이 같다) */
const ION_WAIT = "전자를 이동시켜 이온이 만들어지는 과정을 확인해 보세요";
/** 전자를 m개 건넨 뒤의 구름 반지름(px). */
const radius = (pr: Pair, side: Side, m: number): number => {
  const k = RMAX / Math.max(pr.a.atomPm, pr.a.ionPm, pr.b.atomPm, pr.b.ionPm);
  return k * (side.atomPm + ((side.ionPm - side.atomPm) * m) / pr.n);
};
/** 전자 자리(구름 반지름 R 안에 e개). */
const spotsOf = (cx: number, e: number, R: number, phase: number): { x: number; y: number }[] => cloudSpots(cx, AY, e, NR + ER + 3, R - ER - 3, phase);
/** 방향 맞추기: 건너갈 전자들(주는 쪽의 마지막 번호들)은 오른쪽을, 받을 자리(받는 쪽의 새 번호들)는 왼쪽을 보게 phase를 정한다. */
const phases = (pr: Pair): { a: number; b: number } => ({
  a: -spotAngle(pr.a.p - (pr.n + 1) / 2, 0),
  b: Math.PI - spotAngle(pr.b.p + (pr.n - 1) / 2, 0),
});

export const g2u4IonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-ion", wait: ION_WAIT, tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "전자를 주고받는 두 원자의 구름 모형");
  let pi = 0;
  let moved = 0;
  let busy = false;
  let named = false;

  /** 원자 하나: 구름, 원자핵, 전자(자리 목록을 그대로 받는다). */
  const atom = (cx: number, p: number, R: number, spots: { x: number; y: number }[]): string =>
    cloud(cx, AY, R, stage.ns) + nucleus(cx, AY, p, NR) + spots.map((x) => electron(x.x, x.y, ER)).join("");
  const read = (cx: number, o: Side, e: number): string => {
    const c = o.p - e;
    const ion = named && c !== 0;
    return (
      txt(cx, 19, ion ? `${o.ionName} (${o.ion})` : `${o.name} 원자`, { size: 13.5, fill: ion ? "#FFE58A" : "#fff", weight: 800 }) +
      txt(cx, 201, `양성자(+) ${o.p}개 · 전자(−) ${e}개`, { size: 12.5 }) +
      txt(cx, 221, `전하의 합: ${signed(c)}`, { size: 13.5, fill: c === 0 ? "#7CF29C" : c > 0 ? "#FFB4A8" : "#A8CCFF", weight: 800 })
    );
  };
  const arrow = `<path d="M163 ${AY} L185 ${AY} M179 ${AY - 5} L185 ${AY} L179 ${AY + 5}" stroke="#6F8AB0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const draw = (): void => {
    const pr = PAIRS[pi];
    const ph = phases(pr);
    const ra = radius(pr, pr.a, moved);
    const rb = radius(pr, pr.b, moved);
    stage.set(`${cloudDefs(stage.ns)}${atom(AX, pr.a.p, ra, spotsOf(AX, pr.a.p - moved, ra, ph.a))}${atom(BX, pr.b.p, rb, spotsOf(BX, pr.b.p + moved, rb, ph.b))}${read(AX, pr.a, pr.a.p - moved)}${read(BX, pr.b, pr.b.p + moved)}${arrow}`);
    host.dataset.g4Moved = String(moved);
    host.dataset.g4Round = String(pi);
  };

  const give = bvBtn("main g2u4x-ion-give", "");
  const back = bvBtn("g2u4x-ion-back", "전자 원래대로 되돌리기");
  const label = (): void => {
    const b = PAIRS[pi].b.name;
    give.textContent = `${PAIRS[pi].a.name}의 전자 1개를 ${b}${ro(b)} 이동시키기`;
  };
  const after = (): void => {
    const pr = PAIRS[pi];
    if (moved < pr.n) {
      busy = false;
      f.say("전자 1개가 이동했어요. 마그네슘 원자는 전자를 <b>2개</b> 잃고 이온이 돼요. 전자를 1개 더 이동시켜 보세요.");
      return;
    }
    f.pips(pi * 2 + 1);
    const next = (): void => {
      named = true;
      draw();
      f.pips(pi * 2 + 2);
      if (pi === 0) {
        f.say("이처럼 원자가 전자를 잃거나 얻어 전하를 띠게 된 입자를 <b>이온</b>이라고 해요. 나트륨 이온은 Na⁺, 염화 이온은 Cl⁻로 나타내요.");
        tm.later(() => {
          pi = 1;
          moved = 0;
          named = false;
          busy = false;
          label();
          draw();
          f.slot.setControls(give, back);
          api.setCTA(ION_WAIT, { enabled: false });
          f.say("이번에는 <b>마그네슘 원자</b>와 <b>산소 원자</b>예요. 전자를 이동시키면 두 입자의 전하의 합이 어떻게 변할까요?");
        }, 3000);
        return;
      }
      lab.finish("원자가 전자를 <b>잃으면 (+)전하를 띤 양이온</b>이 되고, 전자를 <b>얻으면 (−)전하를 띤 음이온</b>이 돼요. 이때 원자핵 속 양성자수는 변하지 않아요.");
    };
    // 첫 판정의 이유: 수정안의 "양성자가 1개 더 많아졌기"는 양성자가 늘어난 것처럼 읽혀 "전자보다"를 넣었다(이온이 되어도 양성자수는 그대로다)
    if (pi === 0)
      lab.judge(
        "전자 1개를 <b>잃은</b> 나트륨은 어떤 전하를 띠게 되었나요?",
        [{ t: "(+)전하", ok: true }, { t: "(−)전하" }, { t: "전하를 띠지 않는다" }],
        "(−)전하를 띤 전자가 1개 줄어들어 <b>(+)전하를 띤 양성자가 전자보다 1개 더 많아졌기</b> 때문이에요.",
        next,
      );
    else
      lab.judge(
        "전자 2개를 <b>얻은</b> 산소(산화 이온, O²⁻)의 전체 전하의 합은 얼마인가요?",
        [{ t: "−2", ok: true }, { t: "+2" }, { t: "+8" }],
        "(−)전하를 띤 전자가 (+)전하를 띤 양성자보다 <b>2개 더 많아졌기</b> 때문이에요.",
        next,
      );
  };
  give.addEventListener("click", () => {
    const pr = PAIRS[pi];
    if (busy || moved >= pr.n) return;
    busy = true;
    tap();
    // 건너가는 전자: 주는 쪽의 맨 바깥 전자(마지막 번호)가 구름을 떠나 받는 쪽 구름의 새 자리(맨 바깥)로 간다.
    // 그동안 주는 쪽 구름은 줄고 받는 쪽 구름은 커지며, 남은 전자는 제 방향 그대로 반지름만 따라간다.
    const ph = phases(pr);
    const k0 = moved;
    const ea0 = pr.a.p - k0;
    const eb0 = pr.b.p + k0;
    const ra0 = radius(pr, pr.a, k0);
    const ra1 = radius(pr, pr.a, k0 + 1);
    const rb0 = radius(pr, pr.b, k0);
    const rb1 = radius(pr, pr.b, k0 + 1);
    const a0 = spotsOf(AX, ea0, ra0, ph.a);
    const a1 = spotsOf(AX, ea0 - 1, ra1, ph.a);
    const b0 = spotsOf(BX, eb0, rb0, ph.b);
    const b1 = spotsOf(BX, eb0 + 1, rb1, ph.b);
    const from = a0[ea0 - 1];
    const to = b1[eb0];
    moved += 1;
    const lerp = (p: { x: number; y: number }, q: { x: number; y: number }, t: number): { x: number; y: number } => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    bvTween(
      tm,
      900,
      (t) => {
        // 날아가는 동안 주는 쪽 글은 이미 줄었고, 받는 쪽 글은 아직 더하지 않는다
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 30;
        const ra = ra0 + (ra1 - ra0) * t;
        const rb = rb0 + (rb1 - rb0) * t;
        const sa = a1.map((q, i) => lerp(a0[i], q, t));
        const sb = b0.map((q, i) => lerp(q, b1[i], t));
        stage.set(`${cloudDefs(stage.ns)}${atom(AX, pr.a.p, ra, sa)}${atom(BX, pr.b.p, rb, sb)}${read(AX, pr.a, ea0 - 1)}${read(BX, pr.b, eb0)}${arrow}${electron(x, y, 5.2)}`);
      },
      () => {
        good();
        draw();
        after();
      },
    );
  });
  back.addEventListener("click", () => {
    if (busy || moved <= 0) return;
    tap();
    moved -= 1;
    draw();
    f.say("전자를 원래 원자로 되돌렸어요. 양성자(+)와 전자(−)의 개수를 다시 비교해 보세요.");
  });
  label();
  f.slot.setControls(give, back);
  draw();
  f.say("전기를 띠지 않는 중성 상태의 <b>나트륨 원자</b>와 <b>염소 원자</b>예요. 아래 버튼을 눌러 나트륨의 전자를 염소 쪽으로 이동시켜 보세요.");
  return lab.cleanup;
};
