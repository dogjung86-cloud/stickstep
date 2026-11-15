// [중2 Ⅴ v5] 호흡과 에너지 쪽의 랩 네 판(g2u5l3, g2u5l4, g2u5l5).
//
// g2u5FarmLab 「이산화 탄소와 온도도 높을수록 좋을까요?」 (g2u5l3)
//   책의 세 그래프 가운데 둘과 스마트팜(이산화 탄소 공급 장치, 냉난방 장치). 학생이 정하는 것: 온실의 이산화 탄소 농도, 이어서 온도.
//   한 번에 하나만 바꾼다(농도를 정한 뒤 온도). 한 단계 바꿀 때마다 잰 점이 그래프에 찍힌다.
//   실패하는 길: 더 늘릴 수 있는 곳에서 정하면 되돌려 보낸다. 온도를 지나치게 올리면 광합성량이 뚝 떨어지고 잎이 처진다.
//   그림(2026-11-15 다시 그림, 같은 날 손봄): 맨 위 전체 폭에 광합성량 막대(조건을 바꿀 때마다 바로 보이는 결과), 그 아래 낮은 띠에 책의 스마트팜처럼
//   둥근 지붕의 유리 온실(재배대의 상추, 오른쪽 이산화 탄소 통, 왼쪽 냉난방 장치의 온도 표시). 이산화 탄소 농도는 온실 공기 속 분자 수로 보인다(단계마다 늚).
//   그래프는 잰 점을 매끈한 선으로 잇는다(책의 그림 Ⅴ-3과 같은 모양). 한때 온실을 크게 그리고 막대를 지붕 밑에 작게 두었더니 결과가 묻혔다(사용자 지적).
//
// g2u5SproutLab 「싹이 자랄 에너지는 무엇으로 얻을까요?」 (g2u5l4)
//   땅속의 강낭콩. 학생이 정하는 것: 흙 속 산소와 빛을 주고 끊는 일.
//   산소가 있으면 빛이 없어도 싹이 자라고, 산소를 끊으면 빛을 비춰도 멈춘다. 두 경우를 모두 봐야 끝까지 자란다.
//   그림(2026-11-15 다시 그림): 흙은 알갱이 사이의 틈이 보이게(산소가 있으면 틈에 공기와 산소 분자, 끊으면 틈이 물로 찬다).
//   강낭콩은 실제처럼 싹이 튼다: 먼저 어린뿌리가 내려가 뿌리털이 나고, 배축이 갈고리처럼 굽어 흙을 밀고 올라가며 떡잎을 끌어올린다.
//   끝까지 자라면 떡잎이 땅 위로 나와 벌어지고 사이에서 본잎 둘이 나온다(강낭콩은 떡잎이 땅 위로 나오는 식물). 떡잎 속 양분(앰버)은 자랄수록 준다.
//   손봄(같은 날, 사용자 지적 "세부에 초점을 맞춰 내용이 묻힘"): 흙 알갱이를 바탕색 가까이 성기게, 싹은 굵고 또렷하게,
//   콩 속 양분은 떡잎 안의 앰버 덩어리와 오른쪽 아래 막대로 함께 보인다(자랄수록 준다).
//
// g2u5LightLab 「잎이 내보내는 기체는 무엇이 정할까요?」 (g2u5l5)
//   책의 낮과 밤 그림과 순서도. 학생이 정하는 것: 빛의 세기 네 단계. 주어진 세 상황을 만들어 확인한다.
//   호흡의 양은 늘 같고 광합성의 양만 빛에 따라 달라진다. 광합성량과 호흡량이 같은 단계는 두지 않았다(책 밖).
//   그림(2026-11-15 다시 그림, 같은 날 손봄): 단순한 잎 한 장 안에 광합성 칸(엽록체)과 호흡 칸(마이토콘드리아)을 나란히 두고, 칸마다 쓰고 내놓는 기체를
//   분자 개수 그대로 그린다. 그 아래 한 줄이 두 양을 비교한다. 공변세포 사이의 기공으로 남는 기체가 나가고 모자란 기체가 들어온다.
//   한때 잎 조직(울타리, 해면, 잎맥)을 자세히 그렸으나 요점(두 양의 비교)이 묻혀(사용자 지적) 조직은 그리지 않는다.
//
// g2u5CycleLab 「광합성과 호흡은 어떻게 이어질까요?」 (g2u5l5)
//   책의 해 보기(붙임딱지). 빈칸 여섯 개에 붙임딱지를 붙인다. 틀린 딱지는 붙지 않고 까닭이 뜬다.
//   그림(2026-11-15 다시 그림): 책의 해 보기처럼 상자 대신 엽록체(그라나가 보인다)와 마이토콘드리아(안쪽 막의 주름)를 그리고 둘을 굽은 화살로 잇는다.

import type { StepRenderer } from "../../types";
import { P, arrow, bad, bvBtn, chip, g5Lab, good, row, stepper, tag, tap, toast, txt, type G5Step } from "./kit";
import { beam, f1, g5Layers, glassDefs, label, lettuce, memo, mol, newNs, particleDefs, plantDefs, rng, rootStrand, smooth, spark, sun, sunDefs, type Pt } from "./art";
import { chloroplast, microDefs, mitochondrion } from "./microArt";

/** 측정한 점들을 지나는 매끈한 선(넘치지 않는 단조 3차 보간). */
function monoPath(pts: Pt[]): string {
  const n = pts.length;
  if (n < 2) return "";
  const dx = pts.slice(1).map((p, i) => p[0] - pts[i][0]);
  const sl = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / dx[i]);
  const m = pts.map((_, i) => (i === 0 ? sl[0] : i === n - 1 ? sl[n - 2] : sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / sl[i];
    const b = m[i + 1] / sl[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * sl[i];
      m[i + 1] = t * b * sl[i];
    }
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${f1(pts[i][0] + h)} ${f1(pts[i][1] + m[i] * h)}, ${f1(pts[i + 1][0] - h)} ${f1(pts[i + 1][1] - m[i + 1] * h)}, ${f1(pts[i + 1][0])} ${f1(pts[i + 1][1])}`;
  }
  return d;
}

// ── 온실 조건 정하기 ────────────────────────────────────────────────
const PC = [0.3, 0.55, 0.8, 1, 1, 1];
const TS = [10, 15, 20, 25, 30, 35, 40, 45];
const PT = [0.2, 0.4, 0.62, 0.84, 1, 0.55, 0.15, 0.03];
/** 온실의 둥근 지붕 높이(x에서): 벽 위 (12, 74)에서 (334, 74)까지, 가운데 꼭대기 y 46. 광합성량 막대(맨 위) 아래의 낮은 띠에 둔다. */
const roofY = (x: number): number => {
  const t = (x - 12) / 322;
  return 74 - 112 * t * (1 - t);
};
// 온실 공기 속 이산화 탄소 분자의 자리(농도 단계마다 둘씩 늘어난다, 상추 위 공기)
const AIR_CO2: Pt[] = [[104, 62], [226, 66], [160, 58], [272, 61], [132, 69], [196, 63], [248, 70], [116, 56], [182, 70], [288, 55]];

export const g2u5FarmLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-farm", wait: "온실의 조건을 정해 보세요" });
  const { f } = lab;
  const A = newNs("fm");
  const ly = g5Layers(lab, "온실의 상추와 이산화 탄소 공급 장치, 냉난방 장치, 광합성량 막대, 이산화 탄소 농도 그래프와 온도 그래프", ["defs", "house", "plants", "gas", "meter", "charts"]);
  const art = memo<string>();
  ly.set(
    "defs",
    `<defs>${particleDefs(A)}${plantDefs(A)}${glassDefs(A)}<linearGradient id="${A}tank" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E6B3A"/><stop offset=".4" stop-color="#4FB06A"/><stop offset="1" stop-color="#1A5A30"/></linearGradient>` +
      `<linearGradient id="${A}pane" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BFDDFF" stop-opacity=".12"/><stop offset=".5" stop-color="#BFDDFF" stop-opacity=".04"/><stop offset="1" stop-color="#BFDDFF" stop-opacity=".1"/></linearGradient>` +
      `<linearGradient id="${A}bed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3E2B"/><stop offset="1" stop-color="#3A271A"/></linearGradient></defs>`,
  );
  let phase: "co2" | "temp" | "end" = "co2";
  let ci = 0;
  let ti = 3;
  const seenC = new Set<number>([0]);
  const seenT = new Set<number>();

  // 온실 몸체(유리 지붕, 뼈대 몇 줄, 재배대, 이산화 탄소 통, 냉난방 장치)는 바뀌지 않는다. 그래프와 막대가 주인공이라 낮고 옅게 둔다.
  ly.set(
    "house",
    (() => {
      let h = `<path d="M12 100 L12 74 Q173 18 334 74 L334 100 Z" fill="url(#${A}pane)" stroke="#6F8FB8" stroke-width="1.3"/>`;
      for (let x = 76; x < 334; x += 64) h += `<line x1="${x}" y1="100" x2="${x}" y2="${f1(roofY(x))}" stroke="#5E7FA8" stroke-width=".9" opacity=".55"/>`;
      // 재배대(흙)
      h += `<rect x="70" y="91" width="226" height="9" rx="2" fill="url(#${A}bed)" stroke="#2A1A10" stroke-width=".8"/>`;
      h += `<line x1="0" y1="100" x2="346" y2="100" stroke="#3B5273" stroke-width="2"/>`;
      // 이산화 탄소 공급 장치(초록 통과 밸브, 짧은 분사구)
      h += `<rect x="308" y="76" width="14" height="24" rx="4.5" fill="url(#${A}tank)" stroke="#0E3A1E" stroke-width=".8"/><rect x="311" y="71" width="8" height="6" rx="1.5" fill="url(#${A}metal)" stroke="#2D3748" stroke-width=".6"/><path d="M315 71 L315 66 L304 66" stroke="#9AA8BC" stroke-width="2" fill="none"/>`;
      // 냉난방 장치(바람구멍과 온도 표시창)
      h += `<rect x="18" y="72" width="42" height="26" rx="4" fill="#2C3B55" stroke="#8FA3BC" stroke-width="1"/>`;
      for (let k = 0; k < 3; k++) h += `<line x1="22" y1="${90 + k * 2.6}" x2="56" y2="${90 + k * 2.6}" stroke="#5E7598" stroke-width="1"/>`;
      return h;
    })(),
  );

  const chart = (x: number, title: string, n: number, vals: number[], seen: Set<number>, cur: number, lo: string, hi: string, active: boolean): string => {
    const w = 160;
    const px = (i: number): number => x + 20 + (i * (w - 38)) / (n - 1);
    const py = (v: number): number => 198 - v * 62;
    const idx = [...seen].sort((a, b) => a - b);
    let out = `<g opacity="${active ? 1 : 0.5}"><rect x="${x}" y="106" width="${w}" height="116" rx="10" fill="#0E1A2E" stroke="${active ? "#4A6FA5" : "#263B5C"}" stroke-width="${active ? 1.6 : 1}"/>`;
    out += txt(x + 10, 123, title, { anchor: "start", size: 12, fill: "#E8EEF9" });
    [0.25, 0.5, 0.75, 1].forEach((v) => (out += `<line x1="${x + 14}" y1="${f1(py(v))}" x2="${x + w - 10}" y2="${f1(py(v))}" stroke="#1E3150" stroke-width="1"/>`));
    for (let i = 0; i < n; i++) out += `<line x1="${f1(px(i))}" y1="196" x2="${f1(px(i))}" y2="200" stroke="#55698A" stroke-width="1"/>`;
    out += `<line x1="${x + 14}" y1="130" x2="${x + 14}" y2="198" stroke="#55698A"/><line x1="${x + 14}" y1="198" x2="${x + w - 10}" y2="198" stroke="#55698A"/>`;
    if (idx.length > 1) {
      const d = monoPath(idx.map((i) => [px(i), py(vals[i])] as Pt));
      out += `<path d="${d}" fill="none" stroke="${P.leafHi}" stroke-width="6" opacity=".16" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${P.leafHi}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    idx.forEach((i) => {
      const hot = i === cur && active;
      if (hot) out += `<circle cx="${f1(px(i))}" cy="${f1(py(vals[i]))}" r="9" fill="${P.energy}" opacity=".22"/>`;
      out += `<circle cx="${f1(px(i))}" cy="${f1(py(vals[i]))}" r="${hot ? 5.6 : 3.4}" fill="${hot ? P.energy : P.leafHi}" stroke="#0B1524" stroke-width="1.2"/>`;
    });
    out += txt(x + 14, 214, lo, { anchor: "start", size: 12, fill: P.dim }) + txt(x + w - 10, 214, hi, { anchor: "end", size: 12, fill: P.dim });
    return out + "</g>";
  };
  const value = (): number => PC[ci] * PT[ti];
  const draw = (): void => {
    const v = value();
    const hot = TS[ti] >= 40;
    const cold = TS[ti] <= 10;
    ly.set("plants", art(`p${hot}${cold}`, () => [96, 138, 180, 222, 264].map((x, i) => lettuce(A, x, 92, 0.4, { pale: hot || cold, droop: hot ? 1 : 0, seed: 3 + i * 4 })).join("")));
    // 온실 공기 속 이산화 탄소: 농도 단계가 높을수록 분자가 많다(1단계 2개 ~ 6단계 10개). 상추 위 공기에만 둔다.
    let gas = AIR_CO2.slice(0, [2, 3, 5, 6, 8, 10][ci]).map(([x, y], i) => `<g class="g2u5x-flow" style="animation-delay:-${f1(i * 0.27)}s">${mol(A, "co2", x, y, 0.6, { rot: (i * 53) % 180 })}</g>`).join("");
    const tc = TS[ti] >= 35 ? P.bad : TS[ti] <= 15 ? P.o2 : P.leafHi;
    gas += `<rect x="22" y="75" width="34" height="13" rx="2" fill="#081221" stroke="#3B5273" stroke-width=".8"/>` + txt(39, 86, `${TS[ti]} ℃`, { size: 12, fill: tc });
    ly.set("gas", gas);
    // 광합성량 막대: 맨 위 전체 폭(조건을 바꿀 때마다 바로 보이는 결과)
    ly.set(
      "meter",
      txt(12, 29, "광합성량", { anchor: "start", size: 12.5, fill: "#E8EEF9" }) +
        `<rect x="76" y="14" width="258" height="22" rx="11" fill="#0E1A2E" stroke="#2A4266"/>` +
        `<rect x="79" y="17" width="${f1(Math.max(8, 252 * v))}" height="16" rx="8" fill="${hot ? P.bad : P.leafHi}"/>`,
    );
    ly.set("charts", chart(8, "이산화 탄소 농도", 6, PC.map((p) => p * 0.84), seenC, ci, "낮음", "높음", phase === "co2") + chart(178, "온도", 8, PT.map((p) => p * PC[ci]), seenT, ti, "10 ℃", "45 ℃", phase !== "co2"));
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
const SOIL = 66; // 땅의 높이
const J: Pt = [124, 166]; // 어린뿌리와 배축이 만나는 곳(씨가 놓인 자리 바로 아래)
const ss = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 흙의 단면: 크고 작은 알갱이와 그 사이의 틈. 산소가 있으면 틈에 공기, 끊으면 틈이 물로 찬다(물에 잠긴 흙). */
function soilSection(o2: boolean): string {
  const r = rng(31);
  let s = `<rect x="0" y="${SOIL}" width="346" height="${230 - SOIL}" fill="${o2 ? "#22170F" : "#1F3A52"}"/>`;
  if (!o2) s += `<rect x="0" y="${SOIL}" width="346" height="${230 - SOIL}" fill="#5AB0F2" opacity=".14"/>`;
  // 알갱이는 바탕과 가까운 색으로 성기게 둔다(대비가 강하면 싹보다 흙이 먼저 보였다, 사용자 지적)
  const tones = o2 ? ["#33241A", "#3B2A1E", "#2E2017", "#44301F"] : ["#264764", "#2C4F6D", "#22405A", "#305676"];
  for (let i = 0; i < 70; i++) {
    const x = r() * 346;
    const y = SOIL + 4 + r() * (230 - SOIL);
    const rr = 3 + r() * 6;
    const n = 7;
    const pts: Pt[] = Array.from({ length: n }, (_, k) => {
      const a = (k / n) * Math.PI * 2;
      const q = rr * (0.75 + r() * 0.4);
      return [x + Math.cos(a) * q, y + Math.sin(a) * q * 0.8] as Pt;
    });
    s += `<path d="${smooth(pts, true)}" fill="${tones[i % 4]}" stroke="${o2 ? "#1E140D" : "#1A3248"}" stroke-width=".5"/>`;
  }
  if (!o2) for (let i = 0; i < 10; i++) s += `<path d="M${f1(r() * 330)} ${f1(SOIL + 10 + r() * 150)} q4 -2 8 0 q4 2 8 0" stroke="#BFE3FF" stroke-width=".7" fill="none" opacity=".45"/>`;
  s += `<rect x="0" y="${SOIL - 1}" width="346" height="4" fill="#5A3E2B"/><line x1="0" y1="${SOIL}" x2="346" y2="${SOIL}" stroke="#8A6A4C" stroke-width="1.4"/>`;
  return s;
}

/** 강낭콩(껍질에 싸인 씨): 길쭉한 콩팥 모양, 붉은 자주 껍질의 얼룩, 오목한 쪽의 흰 배꼽. half면 갈라진 껍질 반쪽. */
function kidney(k: number, half = false): string {
  const w = 30 * k;
  const h = 15 * k;
  const d = half
    ? `M${f1(-w)} 0 C${f1(-w)} ${f1(-h)}, ${f1(-w * 0.35)} ${f1(-h * 1.15)}, 0 ${f1(-h * 0.7)} L0 ${f1(h * 0.6)} C${f1(-w * 0.4)} ${f1(h * 1.2)}, ${f1(-w)} ${f1(h)}, ${f1(-w)} 0 Z`
    : `M${f1(-w)} 0 C${f1(-w)} ${f1(-h * 1.2)}, ${f1(-w * 0.35)} ${f1(-h * 1.15)}, 0 ${f1(-h * 0.7)} C${f1(w * 0.35)} ${f1(-h * 1.15)}, ${f1(w)} ${f1(-h * 1.2)}, ${f1(w)} 0 C${f1(w)} ${f1(h * 1.25)}, ${f1(w * 0.4)} ${f1(h * 1.3)}, 0 ${f1(h * 1.25)} C${f1(-w * 0.4)} ${f1(h * 1.3)}, ${f1(-w)} ${f1(h * 1.25)}, ${f1(-w)} 0 Z`;
  let s = `<path d="${d}" fill="#8E2B3C" stroke="#4E1220" stroke-width="1.1"/>`;
  [[-0.55, -0.1, 0.32, -14], [0.1, 0.35, 0.4, 8], [0.55, -0.15, 0.25, 30], [-0.2, 0.55, 0.3, -6]].forEach(([x, y, l, a]) => {
    if (half && x > 0) return;
    s += `<ellipse cx="${f1(x * w)}" cy="${f1(y * h)}" rx="${f1(l * w * 0.5)}" ry="${f1(h * 0.16)}" transform="rotate(${a} ${f1(x * w)} ${f1(y * h)})" fill="#C9707E" opacity=".55"/>`;
  });
  s += `<path d="M${f1(-w * 0.62)} ${f1(-h * 0.55)} C${f1(-w * 0.4)} ${f1(-h * 0.95)}, ${f1(-w * 0.15)} ${f1(-h * 0.85)}, ${f1(-w * 0.05)} ${f1(-h * 0.6)}" stroke="#E7A2AE" stroke-width="1.2" fill="none" opacity=".55"/>`;
  if (!half) s += `<ellipse cx="0" cy="${f1(-h * 0.62)}" rx="${f1(w * 0.16)}" ry="${f1(h * 0.16)}" fill="#F2EAD8" stroke="#8C7A5E" stroke-width=".6"/>`;
  return s;
}

/** 두 색을 t(0~1)만큼 섞는다. */
function mixHex(a: string, b: string, t: number): string {
  const p = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, "0")).join("");
}

/** 싹트는 강낭콩(g는 0~1, lit은 지금 빛을 비추는가). 돌려주는 값: 그림, 떡잎(양분)의 가운데, 떡잎이 땅 위에 있는가.
 *  땅속에서는 떡잎이 닫힌 채 배축의 갈고리에 끌려 올라가고, 땅 위로 나온 뒤에 펴지며 벌어진다.
 *  땅 위로 나온 부분은 빛을 받으면 초록, 빛이 없으면 엽록소를 만들지 못해 연노랑이다(콩나물처럼). */
function bean(ns: string, g: number, lit: boolean): { svg: string; cot: Pt; up: boolean } {
  let s = "";
  const rl = 6 + 78 * ss(0.03, 0.8, g); // 어린뿌리 길이
  const u = ss(0.9, 1, g); // 갈고리가 펴지는 정도(땅 위로 나온 뒤)
  const hook = 100 * ss(0.14, 0.9, g); // 배축이 밀고 올라간 높이
  const Hy = J[1] - hook - u * 26; // 갈고리 꼭대기(펴지면 땅 위 약 26px)
  const H: Pt = [J[0] + 2, Hy];
  // 떡잎이 매달린 자리: 갈고리일 때는 꼭대기 옆 아래, 펴지면 줄기 끝
  const C: Pt = [H[0] + 13 * (1 - u), H[1] + 15 * (1 - u)];
  // 씨(떡잎)의 자리: 처음에는 처음 자리(132, 150), 배축이 밀어 올리면 따라 올라간다
  const seedY = Math.min(150, C[1] + 16 * (1 - u));
  const seedX = g < 0.14 ? 132 : C[0] + 6 * (1 - u);
  const cot: Pt = [seedX, u > 0.5 ? C[1] + 2 : seedY];
  const up = cot[1] < SOIL;
  const green = lit ? "#86C46E" : "#E6DC8C";
  // 어린뿌리(아래로), 뿌리털, 곁뿌리
  if (g > 0.02) {
    const root: Pt[] = [J, [J[0] - 3, J[1] + rl * 0.35], [J[0] + 1, J[1] + rl * 0.7], [J[0] - 1, J[1] + rl]];
    s += rootStrand(ns, root, 5, { hairs: g > 0.25 ? Math.round(10 + g * 14) : 0, seed: 5, hairLen: 5.5 });
    if (g > 0.55) {
      const k = ss(0.55, 1, g);
      s += rootStrand(ns, [[J[0] - 2, J[1] + rl * 0.3], [J[0] - 12 * k, J[1] + rl * 0.38], [J[0] - 22 * k, J[1] + rl * 0.5]], 1.8, { hairs: 6, seed: 7, hairLen: 3.5 });
      s += rootStrand(ns, [[J[0] + 1, J[1] + rl * 0.45], [J[0] + 12 * k, J[1] + rl * 0.52], [J[0] + 20 * k, J[1] + rl * 0.64]], 1.8, { hairs: 6, seed: 9, hairLen: 3.5 });
    }
  }
  // 배축(줄기 아랫부분): 땅속에서는 희고, 땅 위로 나온 곳은 빛에 따라 초록이나 연노랑
  if (hook > 2) {
    const d = u > 0.02 ? `M${J[0]} ${J[1]} C${J[0] - 2} ${f1((J[1] + H[1]) / 2)}, ${H[0] - 2} ${f1(H[1] + 20)}, ${H[0]} ${f1(H[1])}` : `M${J[0]} ${J[1]} C${J[0] - 3} ${f1((J[1] + H[1]) / 2)}, ${H[0] - 6} ${f1(H[1] + 8)}, ${H[0]} ${f1(H[1])} C${H[0] + 4} ${f1(H[1] - 4)}, ${f1(H[0] + 12)} ${f1(H[1] - 2)}, ${f1(C[0])} ${f1(C[1])}`;
    s += `<path d="${d}" stroke="#6E6440" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#F2EBCF" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (H[1] < SOIL) s += `<g clip-path="url(#${ns}sky)"><path d="${d}" stroke="${green}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  }
  // 떡잎: 저장한 양분이 많을수록 짙은 크림(앰버 빛)이고 쓸수록 옅어진다. 땅 위에서 빛을 받으면 초록빛이 돈다.
  const food = 1 - g * 0.75;
  const base = mixHex("#EFE8D0", "#F1CF78", food);
  const cotFill = up ? mixHex(base, lit ? "#B2D47C" : "#EDE39C", 0.65) : base;
  const grains = (n: number, w: number, h: number): string => {
    const r = rng(n * 7 + 3);
    let d = "";
    for (let i = 0; i < n; i++) d += `<circle cx="${f1((r() - 0.5) * w)}" cy="${f1((r() - 0.5) * h)}" r="${f1(0.9 + r() * 0.6)}" fill="#D9A93E" opacity=".75"/>`;
    return d;
  };
  if (g < 0.16) {
    // 껍질에 싸인 강낭콩(붉은 자주, 흰 배꼽)
    s += `<g transform="translate(${f1(cot[0])} ${f1(cot[1])})">${kidney(1)}</g>`;
  } else if (u < 0.05) {
    // 껍질을 벗고 닫힌 채 끌려 올라가는 떡잎 둘(맞붙은 콩 모양, 가운데 갈라진 선)
    if (g < 0.5) s += `<g transform="translate(${f1(cot[0] + 10)} ${f1(cot[1] + 8)}) rotate(${f1(30 + g * 60)})" opacity="${f1(1 - ss(0.3, 0.5, g))}">${kidney(0.6, true)}</g>`;
    const w = 27;
    const h = 13.5;
    s += `<g transform="translate(${f1(cot[0])} ${f1(cot[1])}) rotate(64)"><path d="M${-w} 0 C${-w} ${f1(-h * 1.2)}, ${f1(-w * 0.35)} ${f1(-h * 1.15)}, 0 ${f1(-h * 0.7)} C${f1(w * 0.35)} ${f1(-h * 1.15)}, ${w} ${f1(-h * 1.2)}, ${w} 0 C${w} ${f1(h * 1.25)}, ${f1(w * 0.4)} ${f1(h * 1.3)}, 0 ${f1(h * 1.25)} C${f1(-w * 0.4)} ${f1(h * 1.3)}, ${-w} ${f1(h * 1.25)}, ${-w} 0 Z" fill="${cotFill}" stroke="#8C7A4A" stroke-width="1"/>` +
      `<ellipse cx="0" cy="${f1(h * 0.15)}" rx="${f1(w * 0.72 * food)}" ry="${f1(h * 0.8 * food)}" fill="${P.sugar}" opacity=".85"/>` +
      `<path d="M${f1(-w * 0.92)} 1 C${f1(-w * 0.4)} 3, ${f1(w * 0.4)} 3, ${f1(w * 0.92)} 1" stroke="#A8935A" stroke-width=".9" fill="none"/>${grains(Math.round(6 * food), w * 1.2, h * 1.2)}</g>`;
  } else {
    const open = u;
    [-1, 1].forEach((side) => {
      const ang = side * (8 + open * 62) + (1 - open) * 90;
      s += `<g transform="translate(${f1(cot[0])} ${f1(cot[1])}) rotate(${f1(ang)})"><path d="M0 0 C${side * -2} -8, ${side * 4} -26, ${side * 13} -24 C${side * 22} -22, ${side * 22} -4, ${side * 12} 2 C${side * 7} 4, ${side * 2} 3, 0 0 Z" fill="${cotFill}" stroke="#8C7A4A" stroke-width="1"/>` +
        `<ellipse cx="${side * 11}" cy="-11" rx="${f1(6.5 * food)}" ry="${f1(8 * food)}" fill="${P.sugar}" opacity=".85"/></g>`;
    });
    // 땅 위로 나와 펴지면 떡잎 사이에서 본잎 둘이 나온다(빛이 없으면 작고 연노랗다)
    if (open > 0.6) {
      const k = ss(0.6, 1, open) * (lit ? 1 : 0.72);
      const leaf = lit ? "#5DB45A" : "#E2D886";
      const edge = lit ? "#2F7D32" : "#A89A4A";
      s += `<path d="M${cot[0]} ${f1(cot[1])} L${cot[0]} ${f1(cot[1] - 10 * k)}" stroke="${green}" stroke-width="2.4"/>`;
      [-1, 1].forEach((side) => (s += `<g transform="translate(${cot[0]} ${f1(cot[1] - 10 * k)}) rotate(${side * 52}) scale(${f1(k)})"><path d="M0 0 C-7 -4, -9 -16, 0 -22 C9 -16, 7 -4, 0 0 Z" fill="${leaf}" stroke="${edge}" stroke-width=".9"/><path d="M0 -2 L0 -18" stroke="${lit ? "#B6E3A0" : "#F4EDB8"}" stroke-width=".8"/></g>`));
    }
  }
  return { svg: s, cot, up };
}

export const g2u5SproutLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 3, cls: "g2u5x-sprout", wait: "산소와 빛을 주고 끊어 보세요" });
  const { f, tm } = lab;
  const A = newNs("sr");
  const ly = g5Layers(lab, "땅속에 심은 강낭콩과 흙 속의 산소, 땅 위의 빛", ["defs", "ground", "sky", "bean", "fx", "marks"]);
  const art = memo<string>();
  ly.set("defs", `<defs>${particleDefs(A)}${plantDefs(A)}${sunDefs(A)}<clipPath id="${A}sky"><rect x="0" y="0" width="346" height="${SOIL}"/></clipPath></defs>`);
  let o2 = false;
  let light = false;
  let grow = 0;
  let darkMs = 0;
  let litMs = 0;
  let seenDark = false;
  let seenLit = false;
  let hinted = "";

  const mark = (y: number, text: string, on: boolean): string =>
    `<circle cx="222" cy="${y - 4}" r="6" fill="${on ? P.leafHi : "none"}" stroke="${on ? P.leafHi : "#55698A"}" stroke-width="1.6"/>${on ? `<path d="M219 ${y - 4} l2.4 2.6 l4 -5" fill="none" stroke="#0B1524" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` : ""}${txt(234, y, text, { anchor: "start", size: 12, fill: on ? "#E8EEF9" : P.dim })}`;
  const draw = (): void => {
    ly.set(
      "ground",
      art(`g${o2}`, () => {
        let g = soilSection(o2);
        // 흙 알갱이 사이 틈의 공기(산소 분자)
        if (o2) [[30, 96], [66, 128], [22, 168], [92, 204], [196, 196], [250, 120], [300, 170], [176, 92], [270, 210], [320, 98]].forEach(([x, y], i) => (g += mol(A, "o2", x, y, 0.82, { rot: i * 37 })));
        else g += label(64, 220, "물에 잠긴 흙", { size: 12, fill: P.water });
        return g;
      }),
    );
    ly.set("sky", art(`s${light}`, () => sun(A, 26, 24, 10, light) + (light ? beam(A, [36, 32], [116, 62], 10, { cls: "g2u5x-flow" }) : "") + txt(50, 30, light ? "빛 비춤" : "빛 가림", { anchor: "start", size: 12, fill: light ? P.energy : P.dim })));
    const b = bean(A, grow, light);
    ly.set("bean", b.svg);
    // 호흡: 떡잎의 양분과 산소로 에너지를 얻고(별) 이산화 탄소를 내놓는다
    let fx = "";
    const [cx, cy] = b.cot;
    if (o2 && grow < 1) {
      fx += spark(A, cx + 38, cy - 22, 7, { cls: "g2u5x-flow" }) + spark(A, cx + 50, cy - 2, 6, { cls: "g2u5x-flow", style: "animation-delay:.3s" }) + spark(A, cx + 38, cy + 16, 6, { cls: "g2u5x-flow", style: "animation-delay:.6s" });
      fx += label(cx + 62, cy - 18, "에너지", { anchor: "start", size: 12, fill: P.energy });
      fx += `<g class="g2u5x-mv out" style="--dx:6px;--dy:-26px">${mol(A, "co2", cx + 22, cy - 26, 0.75)}</g><g class="g2u5x-mv out" style="--dx:10px;--dy:-26px;animation-delay:-.9s">${mol(A, "co2", cx + 30, cy - 18, 0.75, { rot: 40 })}</g>`;
      fx += `<g class="g2u5x-mv" style="--dx:-24px;--dy:6px">${mol(A, "o2", cx - 30, cy + 4, 0.8)}</g>` + label(cx - 50, cy - 12, "산소", { size: 12, fill: P.o2 });
    }
    // 콩 속의 양분: 오른쪽 아래의 막대가 자랄수록 줄어든다(양분을 써서 자란다는 것이 바로 보이게)
    const left = 1 - grow * 0.75;
    fx += `<rect x="262" y="150" width="72" height="14" rx="7" fill="#0E1A2E" stroke="#5A4A2A" stroke-width="1"/><rect x="264" y="152" width="${f1(68 * left)}" height="10" rx="5" fill="${P.sugar}"/>`;
    fx += label(298, 142, "콩 속의 양분", { size: 12.5, fill: P.sugar });
    fx += label(298, 182, grow >= 1 ? "자라는 데 썼어요" : grow > 0 ? "쓰는 중" : "그대로", { size: 12, fill: "#E8EEF9" });
    ly.set("fx", fx);
    ly.set("marks", mark(40, "빛 없이도 자람", seenDark) + mark(60, "산소 없으면 멈춤", seenLit));
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
// 잎은 바탕일 뿐이다(2026-11-15 사용자 지적: 잎 조직을 자세히 그렸더니 요점이 묻혔다). 조직은 그리지 않고,
// 잎 안의 두 칸에 광합성과 호흡이 쓰고 내놓는 기체를 분자 개수 그대로 나란히 두어 두 양을 비교하게 한다.
// 기공은 잎 아래 가장자리 STOMA. 남는 기체가 여기로 나가고 모자란 기체가 들어온다.
const STOMA: Pt = [122, 186];
const LEAF_OUT: Pt[] = [[228, 112], [214, 76], [180, 50], [128, 40], [74, 47], [32, 72], [12, 106], [28, 146], [66, 172], [122, 186], [178, 176], [212, 148]];

/** 잎 한 장(단순한 모양, 맥은 옅게). */
function plainLeaf(ns: string): string {
  let s = `<path d="M228 112 L240 114" stroke="#2F7D46" stroke-width="3" stroke-linecap="round"/>`;
  s += `<path d="${smooth(LEAF_OUT, true)}" fill="url(#${ns}pleaf)" stroke="#3E9150" stroke-width="1.4"/>`;
  s += `<path d="M228 112 C170 106, 90 104, 14 106" stroke="#5FAE6A" stroke-width="1.6" fill="none" opacity=".55"/>`;
  [[196, 109, 186, 62], [196, 109, 196, 164], [150, 107, 136, 46], [150, 107, 150, 180], [104, 106, 84, 50], [104, 106, 98, 176], [60, 106, 44, 68], [60, 106, 52, 150]].forEach(
    ([x0, y0, x1, y1]) => (s += `<path d="M${x0} ${y0} Q${f1((x0 + x1) / 2 + (y1 < y0 ? -6 : -6))} ${f1((y0 + y1) / 2)} ${x1} ${y1}" stroke="#4E9F5C" stroke-width=".9" fill="none" opacity=".35"/>`),
  );
  return s;
}
/** 기공: 공변세포 둘(엽록체가 있다)과 그 사이의 구멍. */
function stoma(x: number, y: number): string {
  let s = "";
  [-1, 1].forEach((sg) => {
    s += `<path d="M${x + sg * 1.6} ${y - 7} C${x + sg * 12} ${y - 8}, ${x + sg * 12.5} ${y + 7}, ${x + sg * 1.6} ${y + 6} C${x + sg * 4} ${y + 2.5}, ${x + sg * 4} ${y - 3.5}, ${x + sg * 1.6} ${y - 7} Z" fill="#9CD58A" stroke="#2F7D32" stroke-width="1"/>`;
    s += `<circle cx="${x + sg * 7.4}" cy="${y - 2.4}" r="1.3" fill="#2E8B3E"/><circle cx="${x + sg * 8}" cy="${y + 2}" r="1.3" fill="#2E8B3E"/>`;
  });
  return s + `<ellipse cx="${x}" cy="${y - 0.5}" rx="1.4" ry="5.2" fill="#0B1524"/>`;
}

export const g2u5LightLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G5Step;
  const lab = g5Lab(host, api, s, { steps: 4, cls: "g2u5x-light", wait: "빛의 세기를 맞춰 확인해 보세요" });
  const { f, tm } = lab;
  const A = newNs("lt");
  const ly = g5Layers(lab, "잎 속의 광합성과 호흡이 쓰고 내놓는 기체, 기공으로 드나드는 기체", ["defs", "leaf", "sky", "cards", "gas", "panel"]);
  ly.set(
    "defs",
    `<defs>${particleDefs(A)}${sunDefs(A)}${microDefs(A)}<linearGradient id="${A}pleaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#235F3A"/><stop offset="1" stop-color="#173F28"/></linearGradient></defs>`,
  );
  ly.set(
    "leaf",
    plainLeaf(A) + stoma(STOMA[0], STOMA[1]) + `<path d="M${STOMA[0] + 12} ${STOMA[1] + 4} L148 198" stroke="#8CA2C0" stroke-width=".9"/>` + label(150, 204, "기공", { size: 12, fill: P.dim, anchor: "start" }),
  );
  let lv = 0;
  let m = 0;
  let busy = false;

  /** 칸 하나: 세포 속 구조 그림과 이름, 쓰는 기체와 내놓는 기체를 개수만큼(한 줄에 셋). */
  const card = (x: number, name: string, icon: string, useKind: "o2" | "co2", outKind: "o2" | "co2", n: number, off: string, edge: string): string => {
    const y = 54;
    const w = 98;
    const h = 98;
    let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#0B1729" fill-opacity=".86" stroke="${edge}" stroke-width="1.6"/>`;
    out += icon + txt(x + 40, y + 21, name, { anchor: "start", size: 13.5, fill: "#FFFFFF", weight: 800 });
    if (!n) return out + txt(x + w / 2, y + 62, off, { size: 12, fill: "#E8EEF9" });
    const rowOf = (kind: "o2" | "co2", y0: number): string => Array.from({ length: n }, (_, i) => mol(A, kind, x + 53 + (i % 3) * 17, y0 + Math.floor(i / 3) * 14, 0.72)).join("");
    out += txt(x + 8, y + 44, "씀", { anchor: "start", size: 12, fill: P.dim }) + rowOf(useKind, y + 40);
    out += `<line x1="${x + 8}" y1="${y + 62}" x2="${x + w - 8}" y2="${y + 62}" stroke="#2A4266" stroke-width="1"/>`;
    out += txt(x + 8, y + 78, "내놓음", { anchor: "start", size: 12, fill: P.dim }) + rowOf(outKind, y + 74);
    return out;
  };
  const list = (cx: number, y: number, kind: "o2" | "co2", n: number): string => Array.from({ length: n }, (_, i) => mol(A, kind, cx - ((n - 1) * 19) / 2 + i * 19, y, 0.78)).join("");
  const draw = (): void => {
    const k = KP[lv];
    const net = k - RESP; // 양수면 산소가 나간다
    const outKind = net > 0 ? "o2" : "co2";
    const inKind = net > 0 ? "co2" : "o2";
    const n = Math.abs(net);
    // 해와 빛줄기(세기만큼), 빛의 세기 이름표
    let sky = sun(A, 20, 18, 9, lv > 0);
    for (let i = 0; i < lv * 2; i++) sky += beam(A, [26 + i * 2, 24 + i], [64 + i * 24, 45], 6, { cls: "g2u5x-flow", op: 0.95 });
    ly.set("sky", sky + tag(150, 22, LV[lv], { size: 12, fill: lv ? P.energy : "#C6D3E6" }));
    // 두 칸과 두 양의 비교(광합성은 빛에 따라, 호흡은 늘 같다)
    const cmp = k === 0 ? "빛이 없어 호흡만 해요" : k > RESP ? "광합성이 호흡보다 많아요" : "광합성이 호흡보다 적어요";
    ly.set(
      "cards",
      card(20, "광합성", `<g opacity="${k ? 1 : 0.45}">${chloroplast(A, 38, 71, 30, 17, { rot: -12, seed: 3 })}</g>`, "co2", "o2", k, "빛이 없어 멈춤", "#3FA35B") +
        card(126, "호흡", mitochondrion(A, 144, 71, 30, 16, { rot: -10 }), "o2", "co2", RESP, "", "#D07A44") +
        label(122, 170, cmp, { size: 12.5, fill: k > RESP ? "#B9F0C2" : "#FFD9BF" }),
    );
    // 기공으로 드나드는 기체: 남는 기체는 아래로 나가고, 모자란 기체는 위로 들어온다
    const [sx, sy] = STOMA;
    let gas = arrow(sx - 12, sy + 8, sx - 12, sy + 36, outKind === "o2" ? P.o2 : P.co2, 2.6, "g2u5x-flow") + arrow(sx + 12, sy + 36, sx + 12, sy + 8, inKind === "o2" ? P.o2 : P.co2, 2.6, "g2u5x-flow");
    gas += `<g class="g2u5x-mv out" style="--dx:0px;--dy:16px">${mol(A, outKind, sx - 28, sy + 16, 0.72, { rot: 90 })}</g><g class="g2u5x-mv" style="--dx:0px;--dy:16px;animation-delay:-.9s">${mol(A, inKind, sx + 28, sy + 14, 0.72, { rot: 90 })}</g>`;
    ly.set("gas", gas);
    ly.set(
      "panel",
      `<rect x="244" y="48" width="96" height="174" rx="12" fill="#0E1A2E" stroke="#2A4266"/>` +
        txt(292, 68, "잎 밖으로", { size: 12, fill: P.dim }) +
        txt(292, 90, "나가는 기체", { size: 12, fill: "#E8EEF9" }) +
        txt(292, 112, outKind === "o2" ? "산소" : "이산화 탄소", { size: 14.5, fill: outKind === "o2" ? P.o2 : P.co2, weight: 800 }) +
        list(292, 129, outKind, n) +
        txt(292, 160, "들어오는 기체", { size: 12, fill: "#E8EEF9" }) +
        txt(292, 182, inKind === "o2" ? "산소" : "이산화 탄소", { size: 14.5, fill: inKind === "o2" ? P.o2 : P.co2, weight: 800 }) +
        list(292, 199, inKind, n),
    );
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
  const A = newNs("cy");
  const ly = g5Layers(lab, "광합성과 호흡을 잇는 그림과 붙임딱지를 붙일 빈칸", ["defs", "base", "slots"]);
  ly.set(
    "defs",
    `<defs>${particleDefs(A)}${microDefs(A)}<linearGradient id="${A}arG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FD08A" stop-opacity=".25"/><stop offset="1" stop-color="#7FD08A" stop-opacity=".55"/></linearGradient>` +
      `<linearGradient id="${A}arO" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#F0A070" stop-opacity=".25"/><stop offset="1" stop-color="#F0A070" stop-opacity=".55"/></linearGradient></defs>`,
  );
  let at = 0;
  const filled: Sticker[][] = [[], [], [], []];
  // 빈칸의 자리: [단계][칸] = (가운데 x, 가운데 y, 폭)
  const SLOT: [number, number, number][][] = [[[46, 26, 78]], [[136, 54, 72], [210, 54, 72]], [[210, 178, 72], [136, 178, 72]], [[300, 26, 78]]];

  /** 굵은 굽은 화살(책의 해 보기처럼 넓은 띠). pts는 지나는 점, 끝에 화살촉. */
  const band = (pts: Pt[], grad: string, head: string, flow: boolean): string => {
    const d = smooth(pts);
    const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const tip: Pt = [b[0] + Math.cos(ang) * 9, b[1] + Math.sin(ang) * 9];
    const L: Pt = [b[0] + Math.cos(ang + 2.2) * 9, b[1] + Math.sin(ang + 2.2) * 9];
    const R: Pt = [b[0] + Math.cos(ang - 2.2) * 9, b[1] + Math.sin(ang - 2.2) * 9];
    return `<path d="${d}" fill="none" stroke="url(#${A}${grad})" stroke-width="10" stroke-linecap="round"${flow ? ' class="g2u5x-flow"' : ""}/><path d="${d}" fill="none" stroke="${head}" stroke-width="1.6" stroke-dasharray="2 4" opacity=".8"/><polygon points="${f1(tip[0])},${f1(tip[1])} ${f1(L[0])},${f1(L[1])} ${f1(R[0])},${f1(R[1])}" fill="${head}"/>`;
  };
  const drawBase = (done: boolean): string =>
    band([[86, 92], [96, 54], [173, 40], [250, 54], [262, 84]], "arG", "#7FD08A", done) +
    band([[262, 144], [250, 180], [173, 196], [96, 180], [84, 148]], "arO", "#F0A070", done) +
    arrow(46, 42, 52, 84, P.energy, 2.6) +
    arrow(296, 86, 300, 42, "#FF9F5A", 2.6) +
    chloroplast(A, 74, 117, 112, 56, { rot: -6, seed: 5, starch: 2 }) +
    label(74, 112, "광합성", { size: 15 }) +
    label(74, 132, "엽록체", { size: 12, fill: "#CFF5D6" }) +
    mitochondrion(A, 272, 117, 108, 52, { rot: 6 }) +
    label(272, 112, "호흡", { size: 15 }) +
    label(272, 132, "마이토콘드리아", { size: 12, fill: "#FFE0C8" }) +
    txt(173, 222, "위: 광합성이 만든 것 · 아래: 호흡에서 생긴 것", { size: 12, fill: P.dim });

  const draw = (): void => {
    let slots = "";
    SLOT.forEach((list, si) =>
      list.forEach(([x, y, w], i) => {
        const v = filled[si][i];
        const now = si === at && !v;
        slots += v
          ? `<g class="g2u5x-pop"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="#16233A" stroke="${TINT[v]}" stroke-width="2"/>${txt(x, y + 4.5, v, { size: 12, fill: TINT[v], weight: 800 })}</g>`
          : `<rect${now ? ' class="g2u5x-flow"' : ""} x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" fill="${now ? "rgba(255,212,59,.14)" : "rgba(14,26,46,.85)"}" stroke="${now ? P.energy : "#55698A"}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      }),
    );
    const done = at >= STAGES.length;
    ly.set("base", drawBase(done));
    ly.set("slots", slots);
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
