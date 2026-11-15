// [중2 Ⅳ v5] g2u4l4 주기율표 랩 세 판.
//   g2u4TableLab 「빈칸에는 어떤 원소가 들어갈까요?」
//     원자 번호 1번부터 20번까지의 표에서 빈칸 셋(9번, 11번, 18번)에 원소 카드를 놓는다. 학생이 정하는 것: 어느 카드를 어느 칸에 놓을지.
//     실패하는 길: 번호가 맞지 않는 칸에 놓으면 카드가 되돌아오고 그 칸의 번호가 무엇을 뜻하는지 알려 준다.
//   g2u4AlkaliLab 「같은 세로줄 금속은 물에서 닮았을까요?」
//     책의 탐구 1(리튬, 나트륨, 칼륨의 물과의 반응 실험 영상 관찰하기). 학생이 금속을 골라 물에 넣는다. 2족의 마그네슘도 넣어 볼 수 있다(찬물에서는 거의 변화가 없다).
//     금속은 원자 공이 아니라 은회색 금속 조각으로 그리고 기호는 옆의 작은 이름표로 둔다(이 단원에서 기호를 적은 색 공은 원자 하나를 뜻한다).
//     판정의 답인 기체가 무대의 주인공이다: 조각 둘레에서 기포가 끊임없이 생겨 물 위로 솟는다. 세기의 차이는 기포의 양과 움직임으로 보인다
//     (리튬은 떠서 꾸준히, 나트륨은 녹아 둥글어진 채 물 위를 미끄러지며 기포 꼬리, 칼륨은 보랏빛 불꽃과 가장 많은 기포, 마그네슘은 가라앉고 기포가 없다).
//   g2u4NobleLab 「헬륨, 네온, 아르곤은 무엇이 닮았을까요?」
//     책의 탐구 2(헬륨, 네온, 아르곤의 성질 조사하기). 학생이 기체와 살펴볼 것(상온에서의 상태, 불꽃을 대었을 때)을 골라 표를 채운다. 비교할 기체로 수소도 살펴볼 수 있다.
//     18족 기체는 원자 하나씩 떠다니고, 수소 기체는 원자 2개가 결합한 수소 분자(H₂)다.

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { bad, ball, bvBtn, calm, cap, g4Lab, g4Layer, g4Svg, good, row, tap, toast, txt, type G4Step } from "./kit";

// ── 표 채우기 ───────────────────────────────────────────────────────
const TABLE: (string | null)[][] = [
  ["H", null, null, null, null, null, null, "He"],
  ["Li", "Be", "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", null, null, null, null, null, null],
];
const BLANKS: Record<string, string> = { F: "플루오린", Na: "나트륨", Ar: "아르곤" };

export const g2u4TableLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 3, cls: "g2u4x-table", wait: "빈칸 셋을 채워 보세요" });
  const { f, tm } = lab;
  const grid = el("div", { class: "g2u4x-tb-grid" });
  f.stage.appendChild(grid);
  let held: string | null = null;
  const placed = new Set<string>();
  const numOf: Record<string, number> = {};
  let no = 0;
  TABLE.forEach((r, ri) =>
    r.forEach((sym, ci) => {
      if (!sym) return;
      no += 1;
      numOf[sym] = no;
      const blank = sym in BLANKS;
      const cell = el(blank ? "button" : "div", { class: `g2u4x-tb-cell${blank ? " blank" : ""}`, attrs: blank ? { type: "button", "aria-label": `${no}번 빈칸` } : {} }, el("i", { text: String(no) }), el("b", { text: blank ? "?" : sym }));
      cell.style.left = `${13 + ci * 40}px`;
      cell.style.top = `${12 + ri * 52}px`;
      if (blank) {
        cell.dataset.no = String(no);
        cell.addEventListener("click", () => {
          if (placed.has(sym)) return;
          if (!held) {
            bad();
            toast(lab, "카드를 먼저 골라요", true);
            return;
          }
          if (held !== sym) {
            bad();
            lab.slip();
            f.say(`이 칸은 <b>${numOf[sym]}번</b>이에요. 양성자가 ${numOf[sym]}개인 원소가 들어가요. 카드의 양성자수를 다시 보세요.`);
            host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
            return;
          }
          good();
          placed.add(sym);
          cell.classList.add("filled");
          cell.querySelector("b")!.textContent = sym;
          const card = cards.find((c) => c.dataset.k === sym);
          card?.classList.remove("on");
          if (card) card.disabled = true;
          held = null;
          f.pips(placed.size);
          host.dataset.g4Done = String(placed.size);
          if (placed.size < 3) {
            f.say(`<b>${BLANKS[sym]}</b>은 양성자가 ${numOf[sym]}개라서 ${numOf[sym]}번 칸이에요. 다음 카드를 골라 보세요.`);
            return;
          }
          f.say("빈칸을 모두 채웠어요. 번호가 하나씩 커지는 차례로 놓여 있어요.");
          tm.later(() => {
            lab.judge("칼슘(Ca)은 <b>20번</b> 칸에 있어요. 칼슘 원자의 양성자는 몇 개일까요?", [{ t: "20개", ok: true }, { t: "2개" }, { t: "4개" }], "칸의 번호는 그 원소의 <b>양성자수</b>예요.", () =>
              lab.finish("원소를 <b>양성자수</b>가 작은 것부터 차례로 늘어놓으면 이 표가 돼요. 칸의 번호가 곧 양성자수예요."),
            );
          }, 1200);
        });
      }
      grid.appendChild(cell);
    }),
  );
  const cards = Object.entries(BLANKS).map(([sym, name]) => {
    const b = el("button", { class: "g2u4x-tb-card", attrs: { type: "button" } }, el("b", { text: sym }), el("span", { text: name }), el("i", { text: `양성자 ${numOf[sym]}개` })) as HTMLButtonElement;
    b.dataset.k = sym;
    b.addEventListener("click", () => {
      tap();
      held = sym;
      cards.forEach((c) => c.classList.toggle("on", c === b));
      f.say(`<b>${name}</b> 카드를 들었어요. 들어갈 <b>빈칸</b>을 눌러 놓아 보세요.`);
    });
    return b;
  });
  // 카드의 차례는 번호순이 아니게 둔다(아르곤, 플루오린, 나트륨)
  f.slot.setControls(row(cards[2], cards[0], cards[1]));
  f.say("1번부터 20번까지의 원소 표예요. <b>카드를 고르고</b> 들어갈 빈칸을 눌러 놓아 보세요.");
  return lab.cleanup;
};

// ── 1족 금속과 물 ───────────────────────────────────────────────────
interface Metal {
  k: string;
  name: string;
  sym: string;
  log: string;
  say: string;
  cell: [number, number]; // 표 조각의 [열, 행]
  reacts: boolean;
  /** 모양: 자른 면이 반짝이는 각진 조각(chunk), 반응열에 녹아 둥글어진 덩이(drop) */
  shape: "chunk" | "drop";
  /** 1초에 생기는 기포 수(반응의 세기) */
  rate: number;
}
const METALS: Metal[] = [
  { k: "li", name: "리튬", sym: "Li", log: "기포를 내며 반응", say: "<b>리튬</b>이 물 위에 떠서 <b>기포</b>를 내며 반응해요.", cell: [0, 0], reacts: true, shape: "chunk", rate: 18 },
  { k: "na", name: "나트륨", sym: "Na", log: "빠르게 돌며 반응", say: "<b>나트륨</b>이 물 위를 빠르게 돌아다니며 <b>기체</b>를 내요.", cell: [0, 1], reacts: true, shape: "drop", rate: 24 },
  { k: "k", name: "칼륨", sym: "K", log: "불꽃을 내며 격렬히 반응", say: "<b>칼륨</b>은 불꽃까지 내며 가장 격렬하게 반응해요. 기체도 나와요.", cell: [0, 2], reacts: true, shape: "drop", rate: 36 },
  { k: "mg", name: "마그네슘", sym: "Mg", log: "가라앉고 거의 변화 없음", say: "<b>마그네슘</b>은 가라앉아요. 찬물에서는 거의 변화가 없어요.", cell: [1, 1], reacts: false, shape: "chunk", rate: 0 },
];
const FRAG = [
  ["Li", "Be"],
  ["Na", "Mg"],
  ["K", "Ca"],
];

// 수조(안쪽 x 18~204, 위 끝 y 56), 물의 표면 WL, 바닥 BOT. 물 위 공기 칸(56~WL)을 넉넉히 두어 솟는 기체가 무대에서 가장 큰 그림이 되게 한다.
const WL = 120;
const BOT = 202;
const DROP_R = 11; // 녹아 둥글어진 덩이의 반지름
const CS = 1.35; // 각진 조각의 배율

interface Bub {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  air: boolean; // 물 위로 나와 기체로 올라가는 중
  age: number;
  life: number;
  seed: number;
}

/** 금속 조각의 자리(t초 뒤). 리튬은 떠서 천천히, 나트륨과 칼륨은 물 위를 빠르게 미끄러지고, 마그네슘은 바닥으로 가라앉는다. */
function metalAt(m: Metal, t: number): { x: number; y: number } {
  const T = Math.PI * 2;
  if (m.k === "li") return { x: 111 + 22 * Math.sin((T * t) / 6), y: WL + 0.8 * Math.sin((T * t) / 1.7) };
  if (m.k === "na") return { x: 111 + 56 * Math.sin((T * t) / 2.6) + 6 * Math.sin((T * t) / 0.8), y: WL };
  if (m.k === "k") return { x: 111 + 58 * Math.sin((T * t) / 1.6) + 9 * Math.sin((T * t) / 0.5), y: WL };
  const u = Math.min(1, t / 1.1);
  return { x: 111, y: WL + (BOT - 11 - WL) * (1 - (1 - u) ** 3) };
}

/** 각진 금속 조각: 앞면, 윗면, 반짝이는 자른 면. 반지름 대신 바깥 윤곽(hull)도 돌려준다(물에 잠긴 쪽을 물빛으로 덮을 때 쓴다). */
function chunk(x: number, y: number): { svg: string; hull: string } {
  const P = (pts: number[][]): string => pts.map(([a, b]) => `${(x + a * CS).toFixed(1)} ${(y + b * CS).toFixed(1)}`).join(" L");
  const line = `stroke="#4C5563" stroke-width="1.1" stroke-linejoin="round"`;
  return {
    svg:
      `<path d="M${P([[-13, -2], [11, -4], [14, 7], [-11, 8]])}Z" fill="#8C96A4" ${line}/>` +
      `<path d="M${P([[-13, -2], [-7, -10], [16, -11], [11, -4]])}Z" fill="#C9D1DC" ${line}/>` +
      `<path d="M${P([[11, -4], [16, -11], [18, 0], [14, 7]])}Z" fill="#EEF3F9" ${line}/>` +
      `<path d="M${P([[13.6, -6], [16.2, -2]])}" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>`,
    hull: `M${P([[-13, -2], [-7, -10], [16, -11], [18, 0], [14, 7], [-11, 8]])}Z`,
  };
}
/** 녹아 둥글어진 은빛 덩이. */
function drop(x: number, y: number): { svg: string; hull: string } {
  const r = DROP_R;
  return {
    svg: `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#AFB9C7" stroke="#4C5563" stroke-width="1.1"/><circle cx="${(x - r * 0.34).toFixed(1)}" cy="${(y - r * 0.38).toFixed(1)}" r="${(r * 0.36).toFixed(1)}" fill="#F4F7FB" opacity=".95"/><path d="M${(x + r * 0.15).toFixed(1)} ${(y + r * 0.62).toFixed(1)} Q${(x + r * 0.62).toFixed(1)} ${(y + r * 0.4).toFixed(1)} ${(x + r * 0.7).toFixed(1)} ${(y - r * 0.05).toFixed(1)}" stroke="#E2E8F0" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
    hull: `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`,
  };
}

export const g2u4AlkaliLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 3, cls: "g2u4x-alkali", wait: "1족 금속 셋을 물에 넣어 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "물이 담긴 수조와 주기율표의 1족, 2족 조각. 넣은 금속 조각 둘레에서 기포가 솟는다");
  const log = cap(lab, "g2u4x-al-log");
  const tried = new Map<string, Metal>();
  let cur: Metal | null = null;
  let busy = false;

  // ── 움직이는 층: 금속 조각, 기포, 불꽃, 이름표(40 ms마다 이 층만 다시 그린다) ──
  // 넣은 금속 하나가 기포의 샘(src)이다. 판정 때는 질문이 가리키는 1족 셋을 칸막이 수조에 나란히 두어 셋 다 기체를 내는 것을 함께 보인다.
  interface Src {
    m: Metal;
    at: (t: number) => { x: number; y: number };
    carry: number;
  }
  const TRIO_X = [49, 111, 173]; // 칸막이로 나눈 세 칸의 가운데(수조 안쪽 18~204를 셋으로)
  let fx: SVGGElement | null = null;
  let srcs: Src[] = [];
  let trio = false;
  let bubs: Bub[] = [];
  let t0 = 0;
  let last = 0;
  let looping = false;
  const spawn = (m: Metal, p: { x: number; y: number }): Bub => {
    const w = m.shape === "drop" ? DROP_R : 18;
    const deep = m.shape === "drop" ? DROP_R : 11;
    return { x: p.x + (Math.random() * 2 - 1) * w, y: WL + 1 + Math.random() * deep, r: 2.6 + Math.random() * 2.6, vx: (Math.random() * 2 - 1) * (trio ? 6 : 12), vy: -(16 + Math.random() * 16), air: false, age: 0, life: 1.6 + Math.random() * 0.8, seed: Math.random() * 6 };
  };
  const step1 = (dt: number): void => {
    for (const b of bubs) {
      b.age += dt;
      if (!b.air) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y <= WL) {
          b.air = true;
          b.age = 0;
          b.y = WL - 1;
        }
      } else {
        b.y -= (24 + b.r * 2) * dt;
        b.x += Math.sin((b.age + b.seed) * 5) * (trio ? 5 : 8) * dt;
      }
    }
    bubs = bubs.filter((b) => !(b.air && b.age > b.life) && b.y > 60);
  };
  /** 금속 조각 하나(몸, 물에 잠긴 쪽의 물빛, 물 표면 선)와 그 이름표(기포 위에 따로 그린다). */
  const piece = (m: Metal, p: { x: number; y: number }): { body: string; tag: string } => {
    const body = m.shape === "drop" ? drop(p.x, p.y) : chunk(p.x, p.y);
    const half = m.shape === "drop" ? DROP_R : 24;
    const w = 12 + m.sym.length * 8;
    // 이름표: 하나일 때는 조각 오른쪽 위(수조 벽에 닿으면 왼쪽), 셋을 나란히 둘 때는 조각 아래 물속(기체와 겹치지 않게)
    const tx = trio ? p.x - w / 2 : p.x + half + 4 + w > 202 ? p.x - half - 4 - w : p.x + half + 4;
    const ty = trio ? WL + 34 : p.y - 26;
    const tag = `<rect x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" width="${w}" height="18" rx="9" fill="#1B2A44" stroke="#5A7396" stroke-width="1"/><text x="${(tx + w / 2).toFixed(1)}" y="${(ty + 13.2).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#E8EEF9">${m.sym}</text>`;
    const sunk = p.y > WL + 12;
    return {
      body:
        body.svg +
        `<g clip-path="url(#${stage.ns}-uw)"><path d="${body.hull}" fill="rgba(96,168,245,.24)"/></g>` +
        (sunk ? "" : `<line x1="${(p.x - half - 2).toFixed(1)}" y1="${WL}" x2="${(p.x + half + 2).toFixed(1)}" y2="${WL}" stroke="#BFE0FF" stroke-width="1.4" opacity=".75"/>`),
      tag,
    };
  };
  // 칼륨: 덩이 위 보랏빛 불꽃(흔들림은 크기만 바꾼다)
  const flame = (p: { x: number; y: number }, t: number): string => {
    const fs = 1 + 0.12 * Math.sin(t * 27) + 0.07 * Math.sin(t * 16);
    return `<g transform="translate(${p.x.toFixed(1)} ${(p.y - DROP_R + 3).toFixed(1)}) scale(${fs.toFixed(3)})"><path d="M0 0 C-9 -5 -9 -18 0 -32 C2 -22 11 -19 8 -7 C7 -2 3 0 0 0 Z" fill="#B48AFF" opacity=".88"/><path d="M0 -1 C-4 -4 -4 -12 0 -19 C1 -13 5 -11 3 -5 C2 -2 1 -1 0 -1 Z" fill="#F3EAFF"/></g>`;
  };
  const render = (t: number): string => {
    let water = "";
    let air = "";
    for (const b of bubs) {
      if (!b.air) water += `<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r.toFixed(1)}" fill="rgba(225,242,255,.38)" stroke="#F0F8FF" stroke-width="1.3"/>`;
      else {
        const k = Math.min(1, b.age / b.life);
        const a = (1 - k) * 0.95;
        air += `<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${(b.r * (1 + 1.5 * k)).toFixed(1)}" fill="rgba(225,242,255,${(a * 0.28).toFixed(2)})" stroke="rgba(240,248,255,${a.toFixed(2)})" stroke-width="1.3"/>`;
      }
    }
    const pos = srcs.map((sr) => sr.at(t));
    const parts = srcs.map((sr, i) => piece(sr.m, pos[i]));
    const flames = srcs.map((sr, i) => (sr.m.k === "k" ? flame(pos[i], t) : "")).join("");
    // 그리는 차례: 조각 → 물속 기포 → 솟는 기체 → 칼륨의 불꽃 → 이름표(불꽃과 이름표가 기포에 묻히지 않게)
    return parts.map((q) => q.body).join("") + water + air + flames + parts.map((q) => q.tag).join("");
  };
  const feed = (t: number, dt: number): void => {
    for (const sr of srcs) {
      if (!sr.m.reacts) continue;
      sr.carry += sr.m.rate * (trio ? 0.8 : 1) * dt;
      const p = sr.at(t);
      while (sr.carry >= 1) {
        sr.carry -= 1;
        bubs.push(spawn(sr.m, p));
      }
    }
    step1(dt);
  };
  const frame = (now: number): void => {
    if (!fx || !srcs.length) return;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.08, Math.max(0, (now - last) / 1000));
    last = now;
    feed(t, dt);
    fx.innerHTML = render(t);
  };
  const tick = (): void => {
    if (!looping) return;
    frame(performance.now());
    tm.later(tick, 40);
  };
  /** 기포의 샘을 바꾸고 움직임을 시작한다(움직임 줄이기면 1.6초 동안의 기포를 미리 흘려 한 장면으로 멈춘다). */
  const run = (next: Src[]): void => {
    srcs = next;
    bubs = [];
    t0 = last = performance.now();
    if (calm()) {
      for (let i = 0; i < 40; i++) feed(i * 0.04, 0.04);
      return;
    }
    if (!looping) {
      looping = true;
      tick();
    }
  };
  lab.onCleanup(() => (looping = false));

  const draw = (): void => {
    const frag = FRAG.map((r, ri) =>
      r
        .map((sym, ci) => {
          const m = [...tried.values()].find((x) => x.sym === sym);
          const x = 232 + ci * 52;
          const y = 62 + ri * 46;
          return `<rect x="${x}" y="${y}" width="48" height="42" rx="9" fill="${m ? (m.reacts ? "rgba(255,170,80,.3)" : "rgba(150,165,190,.22)") : "rgba(255,255,255,.05)"}" stroke="${m ? (m.reacts ? "#FFB55A" : "#8CA2C0") : "rgba(255,255,255,.16)"}" stroke-width="1.4"/>${txt(x + 24, y + 27, sym, { size: 15, fill: m ? "#fff" : "#6F84A3", weight: 800 })}`;
        })
        .join(""),
    ).join("");
    const walls = trio ? [80, 142].map((x) => `<line x1="${x}" y1="64" x2="${x}" y2="${BOT + 1}" stroke="#9CB4D6" stroke-width="1.8" opacity=".75"/>`).join("") : "";
    stage.set(`
      <defs><clipPath id="${stage.ns}-uw"><rect x="17" y="${WL}" width="190" height="${BOT - WL + 2}"/></clipPath></defs>
      <path d="M16 56 L16 196 Q16 204 24 204 L198 204 Q206 204 206 196 L206 56" fill="rgba(160,200,255,.05)" stroke="#9CB4D6" stroke-width="2.2"/>
      <rect x="17.5" y="${WL}" width="187" height="${BOT - WL + 0.5}" rx="6" fill="rgba(120,190,255,.24)"/>
      <line x1="18" y1="${WL}" x2="204" y2="${WL}" stroke="#BFE0FF" stroke-width="1.6" opacity=".8"/>
      ${walls}
      ${txt(256, 52, "1족", { size: 13, fill: "#FFD9A8" })}${txt(308, 52, "2족", { size: 13 })}
      ${frag}
    `);
    fx = g4Layer(stage, "g2u4x-al-fx");
    // 움직임 줄이기면 멈춘 한 장면(가라앉은 마그네슘은 바닥에), 아니면 지금 시각의 장면
    if (srcs.length) fx.innerHTML = render(calm() ? (srcs.some((sr) => sr.m.k === "mg") ? 2 : 0) : (performance.now() - t0) / 1000);
    log.textContent = trio ? "리튬, 나트륨, 칼륨을 나란히" : cur ? `${cur.name}: ${cur.log}` : "금속을 골라 물에 넣어요";
    host.dataset.g4Tried = [...tried.keys()].join(",");
    host.dataset.g4Trio = trio ? "1" : "0";
  };
  /** 판정 장면: 질문이 묻는 1족 금속 셋을 칸막이 수조의 세 칸에 나란히(제자리에서 살짝 흔들리며 저마다 기체를 낸다). */
  const showTrio = (): void => {
    trio = true;
    const ones = METALS.filter((m) => m.reacts);
    run(ones.map((m, i) => ({ m, carry: 0, at: (t: number) => ({ x: TRIO_X[i], y: WL + 0.7 * Math.sin(t * 3.1 + i * 2) }) })));
    if (!calm()) {
      // 질문이 뜨는 순간 이미 기체가 솟고 있게 1.2초 동안의 기포를 미리 흘려 둔다
      for (let i = 0; i < 30; i++) feed(i * 0.04, 0.04);
      t0 -= 1200;
    }
    draw();
  };

  const btns = METALS.map((m) => {
    const b = el("button", { class: "g2u4x-chipbtn", attrs: { type: "button" } }, el("b", { text: m.name }), el("i", { text: m.k === "mg" ? "2족" : "1족" })) as HTMLButtonElement;
    b.dataset.k = m.k;
    b.addEventListener("click", () => {
      if (busy || trio) return;
      busy = true;
      tap();
      cur = m;
      tried.set(m.k, m);
      b.classList.add("done");
      run([{ m, carry: 0, at: (t) => metalAt(m, t) }]);
      draw();
      f.say(m.say);
      const n = ["li", "na", "k"].filter((k) => tried.has(k)).length;
      f.pips(n);
      tm.later(() => {
        busy = false;
        if (n < 3 || lab.finished() || host.dataset.g4Phase) return;
        showTrio();
        lab.judge("리튬, 나트륨, 칼륨의 <b>공통점</b>은 무엇인가요?", [{ t: "물과 반응해 기체가 나온다", ok: true }, { t: "물에 가라앉아 그대로 있다" }, { t: "물에 녹아 색이 변한다" }], "셋 다 물과 <b>활발하게 반응</b>했어요.", () =>
          lab.judge("같은 1족인 <b>루비듐</b>을 물에 넣으면 어떻게 될까요?", [{ t: "활발하게 반응한다", ok: true }, { t: "아무 변화가 없다" }, { t: "가라앉아 그대로 있다" }], "같은 세로줄이면 성질이 <b>비슷</b>해요.", () =>
            lab.finish("주기율표의 <b>같은 세로줄(족)</b>에 있는 원소는 성질이 비슷해요. 1족 금속은 모두 물과 활발하게 반응해요."),
          ),
        );
      }, 2600);
    });
    return b;
  });
  const box = el("div", { class: "g2u4x-chipgrid two" }, ...btns);
  f.slot.setControls(box);
  draw();
  f.say("실험 영상 속 수조예요. <b>금속 조각</b>을 골라 물에 넣어 보세요. 무엇이 닮았나요?");
  return lab.cleanup;
};

// ── 18족 기체 ───────────────────────────────────────────────────────
interface Gas {
  k: string;
  name: string;
  sym: string;
  state: string;
  flame: string;
  burns: boolean;
  use: string;
}
const GASES: Gas[] = [
  { k: "he", name: "헬륨", sym: "He", state: "기체", flame: "변화 없음", burns: false, use: "풍선과 비행선을 띄워요" },
  { k: "ne", name: "네온", sym: "Ne", state: "기체", flame: "변화 없음", burns: false, use: "광고판의 불빛에 써요" },
  { k: "ar", name: "아르곤", sym: "Ar", state: "기체", flame: "변화 없음", burns: false, use: "전구 속을 채워요" },
  { k: "h", name: "수소", sym: "H", state: "기체", flame: "펑 하고 탄다", burns: true, use: "1족 맨 위의 원소예요" },
];

export const g2u4NobleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 6, cls: "g2u4x-noble", wait: "세 기체의 표를 채워 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "기체가 든 유리병과 조사 결과 표");
  const res: Record<string, { state?: boolean; flame?: boolean }> = {};
  let cur: Gas = GASES[0];
  let show: "" | "state" | "flame" = "";

  const count = (): number => ["he", "ne", "ar"].reduce((a, k) => a + (res[k]?.state ? 1 : 0) + (res[k]?.flame ? 1 : 0), 0);
  // 병 속 입자: 18족 기체는 원자 하나씩(6개), 수소 기체는 수소 원자 2개가 결합한 수소 분자 3개(공 둘이 조금 겹쳐 붙는다).
  // 흔들림 클래스는 좌표를 그대로 쓴 바깥 g에만 건다(transform 속성이 있는 요소에 걸지 않는다).
  const atoms: [number, number][] = [[52, 96], [96, 84], [74, 128], [112, 132], [58, 160], [100, 166]];
  const H2: [number, number, number][] = [[70, 98, 0.6], [104, 128, -0.5], [68, 160, 0.2]];
  const particles = (g: Gas): string => {
    if (g.k !== "h") return atoms.map(([x, y], i) => `<g class="g2u4x-nb-dot" style="animation-delay:${-i * 0.5}s">${ball(x, y, g.sym, { label: false })}</g>`).join("");
    return H2.map(([x, y, a], i) => {
      const dx = Math.cos(a) * 6.6;
      const dy = Math.sin(a) * 6.6;
      return `<g class="g2u4x-nb-dot" style="animation-delay:${-i * 0.8}s">${ball(x - dx, y - dy, "H", { k: 0.9, label: false })}${ball(x + dx, y + dy, "H", { k: 0.9, label: false })}</g>`;
    }).join("");
  };
  const draw = (): void => {
    const rows = GASES.map((g, i) => {
      const y = 78 + i * 34;
      const r = res[g.k] ?? {};
      return `${g === cur ? `<rect x="158" y="${y - 20}" width="180" height="30" rx="8" fill="rgba(255,255,255,.07)"/>` : ""}
        ${txt(166, y, g.name, { anchor: "start", size: 13, fill: g.k === "h" ? "#8CA2C0" : "#E8EEF9", weight: 800 })}
        ${txt(240, y, r.state ? g.state : "?", { size: 13, fill: r.state ? "#7CF29C" : "#6F84A3" })}
        ${txt(302, y, r.flame ? g.flame : "?", { size: r.flame && g.burns ? 12 : 13, fill: r.flame ? (g.burns ? "#FFB55A" : "#7CF29C") : "#6F84A3" })}`;
    }).join("");
    stage.set(`
      <path d="M62 44 L62 62 Q30 78 30 124 Q30 190 82 190 Q134 190 134 124 Q134 78 102 62 L102 44 Z" fill="rgba(160,200,255,.07)" stroke="#9CB4D6" stroke-width="2.2" stroke-linejoin="round"/>
      ${particles(cur)}
      ${txt(82, 212, `${cur.name} (${cur.k === "h" ? "H₂" : cur.sym})`, { size: 13, fill: "#fff", weight: 800 })}
      ${show === "state" ? `<rect x="50" y="20" width="64" height="24" rx="12" fill="rgba(124,242,156,.18)" stroke="#7CF29C"/>${txt(82, 37, "기체", { size: 13, fill: "#7CF29C", weight: 800 })}` : ""}
      ${
        show === "flame"
          ? cur.burns
            ? `<path class="g2u4x-nb-bang" d="M82 4 L90 20 L108 14 L100 30 L118 38 L100 44 L104 60 L88 50 L76 62 L74 46 L56 44 L70 34 L60 18 L76 22 Z" fill="#FFB55A" stroke="#F0762E" stroke-width="1.4"/>${txt(84, 40, "펑", { size: 14, fill: "#5A2A00", weight: 800 })}`
            : `<path class="g2u4x-nb-flame" d="M82 40 Q72 28 82 10 Q86 22 92 18 Q96 30 88 40 Z" fill="#FFB55A" stroke="#F0762E" stroke-width="1.2"/>`
          : ""
      }
      ${txt(240, 40, "상온에서", { size: 12.5, fill: "#8CA2C0" })}${txt(302, 40, "불꽃을 대면", { size: 12.5, fill: "#8CA2C0" })}
      <line x1="158" y1="50" x2="338" y2="50" stroke="rgba(255,255,255,.16)"/>
      ${rows}
    `);
    host.dataset.g4Done = String(count());
  };

  const chips = GASES.map((g) => {
    const b = el("button", { class: "g2u4x-chipbtn", attrs: { type: "button" } }, el("b", { text: g.name }), el("i", { text: g.k === "h" ? "비교할 기체" : "18족" })) as HTMLButtonElement;
    b.dataset.k = g.k;
    b.addEventListener("click", () => {
      tap();
      cur = g;
      show = "";
      chips.forEach((c) => c.classList.toggle("on", c === b));
      draw();
      f.say(`<b>${g.name}</b>을 골랐어요. ${g.use}. 무엇을 살펴볼까요?`.replace("수소</b>을", "수소</b>를"));
    });
    return b;
  });
  chips[0].classList.add("on");
  let asked = false;
  const test = (kind: "state" | "flame"): void => {
    tap();
    show = kind;
    res[cur.k] = { ...res[cur.k], [kind]: true };
    draw();
    if (kind === "state") f.say(`<b>${cur.name}</b>은 상온에서 <b>기체</b>예요. 입자가 서로 멀리 떨어져 날아다녀요.`.replace("수소</b>은", "수소</b>는"));
    else f.say(cur.burns ? "<b>수소</b>는 불꽃을 대면 <b>펑 하고 타요</b>. 다른 물질과 잘 반응하는 기체예요." : `<b>${cur.name}</b>에 불꽃을 대도 <b>아무 변화가 없어요</b>. 다른 물질과 잘 반응하지 않아요.`);
    f.pips(count());
    if (count() >= 6 && !asked) {
      asked = true;
      tm.later(() => {
        lab.judge("헬륨, 네온, 아르곤의 <b>공통점</b>은 무엇인가요?", [{ t: "기체이고 잘 반응하지 않는다", ok: true }, { t: "기체이고 불에 잘 탄다" }, { t: "고체이고 잘 반응하지 않는다" }], "셋 다 기체이고 불꽃에도 <b>변화가 없었어요</b>.", () =>
          lab.finish("헬륨, 네온, 아르곤은 같은 <b>18족</b>이에요. 모두 상온에서 기체이고 다른 물질과 잘 반응하지 않아요."),
        );
      }, 1500);
    }
  };
  const bState = bvBtn("g2u4x-nb-tool", "상온에서의 상태 보기");
  const bFlame = bvBtn("g2u4x-nb-tool", "불꽃을 대어 보기");
  bState.dataset.k = "state";
  bFlame.dataset.k = "flame";
  bState.addEventListener("click", () => test("state"));
  bFlame.addEventListener("click", () => test("flame"));
  f.slot.setControls(el("div", { class: "g2u4x-chipgrid four" }, ...chips), row(bState, bFlame));
  draw();
  f.say("주기율표 맨 오른쪽 세로줄의 기체예요. <b>기체</b>와 <b>살펴볼 것</b>을 골라 표를 채워 보세요.");
  return lab.cleanup;
};
