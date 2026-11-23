// [중2 Ⅱ v5] g2u2l4 랩(퇴적암), g2u2l5 랩 1, 2(변성암).
//
// 4레슨 「줄무늬가 있는 암석을 만들려면?」(g2u2SedLab)
//   본문(퇴적물이 쌓여 다져지고 굳어 퇴적암이 된다. 종류가 다른 퇴적물이 쌓이면 층리가 나타난다)을 손으로 만든다.
//   학생이 정하는 것: 물속에 부을 퇴적물(자갈, 모래, 진흙, 조개껍데기)과 차례. 세 번 넘게 부은 뒤 꾹 눌러 오랫동안 다진다.
//   실패가 보이는 길: 같은 퇴적물만 부으면 다져도 줄무늬가 보이지 않는다(다시 만들기).
//   판정 둘: 줄무늬가 생긴 까닭, 자갈이 굳은 층의 이름(무대에 이름이 남아 있다). 통찰 하나: 퇴적물이 다져지고 굳으면 퇴적암, 종류가 다르면 줄무늬.
//
// 5레슨 랩 1 「누르는 방향을 바꾸면 줄무늬는?」(g2u2PressLab)
//   그림(엽리가 만들어지는 과정: 광물이 압력 방향에 수직으로 나란하게 배열된다)을 방향을 바꿔 가며 해 본다.
//   학생이 정하는 것: 위아래에서 누르기, 양옆에서 누르기, 열만 가하기와 그 차례. 꾹 눌러 오래 둔다. 먼저 예측한다.
//   판정 하나: 줄무늬와 누르는 방향의 관계. 세 결과는 무대 아래에 기록으로 남는다.
//
// 5레슨 랩 2 「열과 압력을 받으면 어떤 암석이 될까요?」(g2u2MetaLab)
//   그림(변성암의 종류: 화강암은 편마암, 이암은 편암이나 편마암, 사암은 규암, 석회암은 대리암)을 실사 표본으로 한다.
//   학생이 정하는 것: 원래 암석과 열과 압력의 세기(막대). 판정 하나: 이암이 받는 열과 압력이 세질 때의 변화.

import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { G, gBtn, gGrid, gHold, gLab, gPick, gPredict, gRow, geo, josa, haptic, HAPTIC, label, seeded, specimen, svgOpen, type GStep } from "./kit";

/* ══════════ 4레슨: 퇴적물 쌓고 다지기 ══════════ */
type Sed = "gravel" | "sand" | "mud" | "shell";
const SED: Record<Sed, { name: string; sub: string; rock: string; base: string }> = {
  gravel: { name: "자갈", sub: "굵은 알갱이", rock: "역암", base: "#8D7B6A" },
  sand: { name: "모래", sub: "중간 알갱이", rock: "사암", base: "#E2B85A" },
  mud: { name: "진흙", sub: "아주 고운 알갱이", rock: "이암", base: "#7A5A45" },
  shell: { name: "조개껍데기", sub: "생물의 유해", rock: "석회암", base: "#E9E2D2" },
};
const TX = 70, TW = 160, TB = 204, LH = 30;
// 다진 뒤에는 물에서 꺼내 크게 본 암석을 무대 가운데에 둔다. 같은 퇴적물이 이어진 층은 한 덩어리로 합치고,
// 경계선과 이름표는 퇴적물의 종류가 바뀌는 곳에만 단다(같은 퇴적물만 쌓으면 줄무늬가 없다는 것이 그림으로도 보이게).
const RX = 52, RW = 176, RY = 30, RH = 164;

export const g2u2SedLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 4, cls: "g2u2x-sed" });
  const { f, tm } = lab;
  let stack: Sed[] = [];
  let pressed = 0;
  let locked = false;
  /** 퇴적물 한 덩어리(x, y, w, h)의 결. 알갱이 수는 넓이에 맞춘다. */
  const tex = (s: Sed, x: number, y: number, w: number, h: number, seed: number): string => {
    const r = seeded(seed);
    const n1 = (v: number): string => v.toFixed(1);
    let out = `<rect x="${x}" y="${n1(y)}" width="${w}" height="${n1(h)}" fill="${SED[s].base}"/>`;
    if (s === "gravel") {
      const rows = Math.max(1, Math.round(h / 24)), rh = h / rows, n = Math.max(3, Math.round(w / 18));
      for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
        const cx = x + (i + 0.5) * (w / n) + (r() - 0.5) * 5, cy = y + (j + 0.5) * rh + (r() - 0.5) * rh * 0.22;
        out += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(Math.min((w / n) * 0.46, 7 + r() * 2.5))}" ry="${n1(Math.min(rh * 0.36, 5 + r() * 3))}" fill="#B9A894" stroke="#4E4338" stroke-width="1.2"/>`;
      }
    }
    if (s === "sand") for (let i = 0, n = Math.round((w * h) / 140); i < n; i++) out += `<circle cx="${n1(x + 4 + r() * (w - 8))}" cy="${n1(y + 3 + r() * Math.max(1, h - 6))}" r="1.6" fill="#A77B22"/>`;
    if (s === "mud") for (let i = 0, n = Math.round((w * h) / 420); i < n; i++) out += `<path d="M${n1(x + 6 + r() * (w - 18))} ${n1(y + 4 + r() * Math.max(1, h - 8))} h${n1(5 + r() * 6)}" stroke="#5E4434" stroke-width="1.2" stroke-linecap="round"/>`;
    if (s === "shell") {
      const rows = Math.max(1, Math.round(h / 26)), rh = h / rows, n = Math.max(3, Math.round(w / 23));
      for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
        const sx = x + (i + 0.5) * (w / n) - 9 + (r() - 0.5) * 5, by = y + (j + 0.5) * rh + Math.min(rh * 0.28, 7), hh = Math.min(rh * 0.5, 12);
        out += `<path d="M${n1(sx)} ${n1(by)} a9 ${n1(hh)} 0 0 1 18 0 Z" fill="#fff" stroke="#9A8F7A" stroke-width="1.2"/>`;
      }
    }
    return out;
  };
  f.stage.innerHTML = `${svgOpen}
    <defs><clipPath id="g2sdRk"><rect x="${RX}" y="${RY}" width="${RW}" height="${RH}" rx="12"/></clipPath></defs>
    <g class="g2u2x-sd-tank">
      <rect x="${TX}" y="16" width="${TW}" height="${TB - 16}" fill="rgba(77,171,247,.16)"/>
      <g class="g2u2x-sd-layers"></g>
      <path d="M${TX} 12 V${TB} H${TX + TW} V12" stroke="#A9C1DC" stroke-width="2.6" fill="none"/>
      <g class="g2u2x-sd-names"></g>
    </g>
    <g class="g2u2x-sd-rock"></g>
    ${label(TX + TW / 2, 222, "물속에 쌓이는 퇴적물", { size: 12, fill: G.dim, weight: 600, cls: "g2u2x-sd-cap" })}
  </svg>`;
  const layers = lab.q<SVGGElement>(".g2u2x-sd-layers"), names = lab.q<SVGGElement>(".g2u2x-sd-names"), rock = lab.q<SVGGElement>(".g2u2x-sd-rock");
  const cap = (t: string): void => {
    lab.q<SVGTextElement>(".g2u2x-sd-cap").textContent = t;
  };
  const paint = (): void => {
    const h = LH * (1 - 0.34 * pressed);
    layers.innerHTML = stack.map((s, i) => tex(s, TX, TB - (i + 1) * h, TW, h, 31 + i * 7)).join("");
    names.innerHTML = stack.map((s, i) => label(TX + TW + 10, TB - (i + 0.5) * h + 4, SED[s].name, { anchor: "start", size: 12.5 })).join("");
    host.dataset.g2Stack = stack.join(",");
  };
  /** 같은 퇴적물이 이어진 층을 한 덩어리로 묶는다(아래부터). */
  const runs = (): { s: Sed; n: number }[] =>
    stack.reduce<{ s: Sed; n: number }[]>((a, s) => {
      const last = a[a.length - 1];
      if (last && last.s === s) last.n += 1;
      else a.push({ s, n: 1 });
      return a;
    }, []);
  function showRock(): void {
    const u = RH / stack.length;
    let y = RY + RH, body = "", lines = "", tags = "";
    runs().forEach((g, i) => {
      const h = g.n * u;
      y -= h;
      body += tex(g.s, RX, y, RW, h, 91 + i * 13);
      if (i > 0) lines += `<path d="M${RX} ${(y + h).toFixed(1)} h${RW}" stroke="rgba(24,16,8,.6)" stroke-width="1.8"/>`;
      tags += label(RX + RW + 12, y + h / 2 + 5, SED[g.s].rock, { anchor: "start", size: 13.5, fill: G.gold });
    });
    rock.innerHTML = `<g clip-path="url(#g2sdRk)">${body}${lines}</g><rect x="${RX}" y="${RY}" width="${RW}" height="${RH}" rx="12" stroke="rgba(230,237,247,.7)" stroke-width="1.8"/>${tags}`;
    host.dataset.g2Runs = String(runs().length);
    f.stage.classList.add("rock");
    cap("다져지고 굳은 암석(꺼내서 크게 본 모습)");
  }
  const picks = (Object.keys(SED) as Sed[]).map((s) => {
    const p = gPick(s, SED[s].name, SED[s].sub, SED[s].base);
    p.el.addEventListener("click", () => {
      if (locked || stack.length >= 5) return;
      haptic(HAPTIC.tap);
      stack.push(s);
      paint();
      hold.disabled = stack.length < 3;
      f.pips(stack.length >= 3 ? 1 : 0);
      f.say(stack.length < 3 ? `<b>${SED[s].name}</b>${josa(SED[s].name, "이", "가")} 바닥에 쌓였어요. 세 층 이상 쌓일 때까지 더 부어 보세요.` : "층이 쌓였어요. 더 붓거나 <b>꾹 눌러</b> 오랫동안 다져 보세요.");
      hintNow();
    });
    return p;
  });
  const hold = gHold(lab, "press", "꾹 눌러 오랫동안 다지기", (ms) => {
    if (locked || stack.length < 3) return false;
    pressed = Math.min(1, pressed + ms / 2400);
    paint();
    if (pressed < 1) return true;
    locked = true;
    hold.disabled = true;
    showRock();
    if (runs().length < 2) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      f.say("단단한 암석은 됐지만 <b>줄무늬가 보이지 않아요</b>. 퇴적물을 바꿔 가며 다시 쌓아 보세요.");
      f.slot.setControls(redo);
      lab.hint("redo");
      return false;
    }
    haptic(HAPTIC.correct);
    f.pips(2);
    f.say("퇴적물이 단단한 암석이 됐고 층마다 <b>나란한 줄무늬</b>가 보여요. 암석을 보고 답해 보세요.");
    tm.later(judge, 1000);
    return false;
  });
  hold.disabled = true;
  const redo = gBtn("redo", "퇴적물을 바꿔 다시 쌓기");
  redo.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    stack = [];
    pressed = 0;
    locked = false;
    f.stage.classList.remove("rock");
    rock.innerHTML = "";
    cap("물속에 쌓이는 퇴적물");
    paint();
    f.slot.setControls(gGrid(2, ...picks), hold);
    f.say("이번에는 <b>종류가 다른 퇴적물</b>을 차례로 부어 보세요.");
    hintNow();
  });
  const ORDER: Sed[] = ["gravel", "sand", "mud"];
  function hintNow(): void {
    if (stack.length < 3) lab.hint(ORDER[stack.length]);
    else lab.hint("hold:press");
  }
  function judge(): void {
    lab.ask("이 암석에 <b>나란한 줄무늬</b>가 생긴 까닭은?", ["종류가 다른 퇴적물이 차례로 쌓여서", "위에서 세게 눌러서", "물속에서 쌓여서"], "같은 퇴적물만 쌓이면 다져져도 <b>경계</b>가 없어 줄무늬가 안 보여요.", () => {
      f.pips(3);
      const hasG = stack.includes("gravel");
      const s: Sed = hasG ? "gravel" : stack[0];
      const others = (["역암", "사암", "이암", "석회암"] as const).filter((n) => n !== SED[s].rock).slice(0, 2);
      lab.ask(`<b>${SED[s].name}</b>${josa(SED[s].name, "이", "가")} 쌓여 굳은 층은 어떤 암석이 됐나요?`, [SED[s].rock, others[0], others[1]], "자갈은 역암, 모래는 사암, 진흙은 이암, 조개껍데기는 석회암이 돼요.", () =>
        lab.finish("퇴적물이 쌓여 오랫동안 <b>다져지고 굳으면</b> 암석이 돼요. 알갱이의 크기나 종류가 다른 퇴적물이 차례로 쌓이면 <b>나란한 줄무늬</b>가 생겨요."),
      );
    });
  }
  paint();
  f.slot.setControls(gGrid(2, ...picks), hold);
  f.say("바닥에 쌓이는 자갈, 모래, 진흙 등을 <b>퇴적물</b>이라고 해요. 퇴적물을 골라 세 층 이상 쌓아 보세요.");
  api.setCTA("퇴적물을 쌓고 다져 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};

/* ══════════ 5레슨 랩 1: 누르는 방향과 줄무늬 ══════════ */
// 무대 왼쪽은 지금 해 보는 암석, 오른쪽은 해 본 결과의 기록(실험마다 끝 모습을 작은 덩어리로 남긴다).
// 판정 때는 왼쪽에 위아래, 양옆 두 결과를 화살과 함께 나란히 크게 다시 그린다(판정의 근거를 무대에 남긴다).
type Way = "v" | "h" | "heat";
const WAY: Record<Way, { name: string; sub: string; res: string; log: [string, string?] }> = {
  v: { name: "위아래에서 누르기", sub: "열과 압력", res: "가로 줄무늬", log: ["가로 줄무늬"] },
  h: { name: "양옆에서 누르기", sub: "열과 압력", res: "세로 줄무늬", log: ["세로 줄무늬"] },
  heat: { name: "열만 가하기", sub: "뜨거운 마그마 옆", res: "줄무늬 없음, 알갱이가 커짐", log: ["줄무늬 없음,", "알갱이가 커짐"] },
};
const WAYS: Way[] = ["v", "h", "heat"];
const f1 = (v: number): string => v.toFixed(1);
/** 화살(x, y에서 dx, dy만큼). */
function prArrow(x: number, y: number, dx: number, dy: number, w = 3.4): string {
  const ex = x + dx, ey = y + dy, nx = -dy / 3, ny = dx / 3;
  return `<path d="M${f1(x)} ${f1(y)} L${f1(ex)} ${f1(ey)} M${f1(ex - dx / 3 + nx)} ${f1(ey - dy / 3 + ny)} L${f1(ex)} ${f1(ey)} L${f1(ex - dx / 3 - nx)} ${f1(ey - dy / 3 - ny)}" stroke="${G.hot}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}
// 작은 덩어리의 납작한 알갱이(격자 셋씩)와 둥근 알갱이 자리(-0.5~0.5)
const MFL: [number, number, number][] = [[-0.3, -0.28, 0.4], [0, -0.3, 2.2], [0.3, -0.27, 1.1], [-0.31, 0, 2.7], [0.01, 0.02, 0.9], [0.3, -0.01, 1.9], [-0.29, 0.29, 1.5], [0.02, 0.28, 0.2], [0.31, 0.3, 2.5]];
const MDT: [number, number][] = [[-0.15, -0.14], [0.16, -0.15], [-0.16, 0.15], [0.15, 0.14]];
/** 실험 하나의 끝 모습(덩어리 + 화살 또는 열). k는 크기 배율(1이면 34×28). */
function pressMini(w: Way, cx: number, cy: number, k: number): string {
  const W0 = 34 * k, H0 = 28 * k;
  const bw = w === "h" ? W0 * 0.78 : W0, bh = w === "v" ? H0 * 0.78 : H0;
  let out = `<rect x="${f1(cx - bw / 2)}" y="${f1(cy - bh / 2)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(3.5 * k)}" fill="${w === "heat" ? "#EB926A" : "#B9B0A6"}" stroke="#E6EDF7" stroke-width="1.2"/>`;
  out += MDT.map(([u, v]) => `<circle cx="${f1(cx + u * bw)}" cy="${f1(cy + v * bh)}" r="${f1((w === "heat" ? 3 : 1.9) * k)}" fill="#EFE9E0" stroke="#7B7268" stroke-width=".7"/>`).join("");
  out += MFL.map(([u, v, a]) => {
    const ang = w === "v" ? 0 : w === "h" ? Math.PI / 2 : a, L = w === "heat" ? 0.1 * W0 : w === "v" ? 0.14 * bw : 0.14 * bh;
    const x = cx + u * bw, y = cy + v * bh;
    return `<path d="M${f1(x - Math.cos(ang) * L)} ${f1(y - Math.sin(ang) * L)} L${f1(x + Math.cos(ang) * L)} ${f1(y + Math.sin(ang) * L)}" stroke="#2E2A2A" stroke-width="${f1(2.1 * k)}" stroke-linecap="round"/>`;
  }).join("");
  const g = 3 * k, len = 8 * k, sw = Math.max(2.2, 2 * k);
  if (w === "v") out += prArrow(cx, cy - bh / 2 - g - len, 0, len, sw) + prArrow(cx, cy + bh / 2 + g + len, 0, -len, sw);
  if (w === "h") out += prArrow(cx - bw / 2 - g - len, cy, len, 0, sw) + prArrow(cx + bw / 2 + g + len, cy, -len, 0, sw);
  if (w === "heat") out += `<path d="M${f1(cx - bw / 2 - 7 * k)} ${f1(cy + 9 * k)} q${f1(4 * k)} ${f1(-4.5 * k)} 0 ${f1(-9 * k)} q${f1(-4 * k)} ${f1(-4.5 * k)} 0 ${f1(-9 * k)}" stroke="${G.hot}" stroke-width="${f1(sw)}" stroke-linecap="round" fill="none"/>`;
  return out;
}
const emptyMini = (cx: number, cy: number): string =>
  `<rect x="${cx - 17}" y="${cy - 14}" width="34" height="28" rx="4" stroke="rgba(230,237,247,.38)" stroke-width="1.4" stroke-dasharray="4 3"/>${label(cx, cy + 4.5, "?", { size: 13, fill: G.dim })}`;

export const g2u2PressLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-press" });
  const { f, tm } = lab;
  const BW = 112, BH = 100, MX = 88, MY = 100, BX = MX - BW / 2, BY = MY - BH / 2;
  const LX = 206, LT = 238, rowY = (i: number): number => 58 + i * 64; // 기록: 작은 덩어리의 가운데 x, 글의 x, 줄의 가운데 y
  const rnd = seeded(77);
  const flakes = Array.from({ length: 30 }, () => ({ x: (rnd() - 0.5) * (BW - 22), y: (rnd() - 0.5) * (BH - 22), a: rnd() * Math.PI }));
  const dots = Array.from({ length: 18 }, () => ({ x: (rnd() - 0.5) * (BW - 16), y: (rnd() - 0.5) * (BH - 16) }));
  f.stage.innerHTML = `${svgOpen}
    <g class="g2u2x-pr-main">
      <rect class="g2u2x-pr-block" x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="8" fill="#B9B0A6" stroke="#E6EDF7" stroke-width="1.6"/>
      <g class="g2u2x-pr-dots">${dots.map(() => `<circle r="3.4" fill="#EFE9E0" stroke="#7B7268" stroke-width=".8"/>`).join("")}</g>
      <g class="g2u2x-pr-fl" stroke="#2E2A2A" stroke-width="3" stroke-linecap="round">${flakes.map(() => "<path/>").join("")}</g>
      <g class="g2u2x-pr-arrows"></g>
    </g>
    <g class="g2u2x-pr-end"></g>
    ${label(LX - 20, 22, "실험 결과", { anchor: "start", size: 12, fill: G.dim, weight: 600 })}
    ${WAYS.map((w, i) => `<g class="g2u2x-pr-th th-${w}">${emptyMini(LX, rowY(i))}</g>
      ${label(LT, rowY(i) - 6, WAY[w].name, { anchor: "start", size: 12, fill: G.dim, weight: 700 })}
      ${label(LT, rowY(i) + 12, "실험 전", { anchor: "start", size: 12.5, fill: G.dim, weight: 600, cls: `g2u2x-pr-log r-${w}` })}
      ${label(LT, rowY(i) + 27, "", { anchor: "start", size: 12.5, fill: G.gold, cls: `r2-${w}` })}`).join("")}
  </svg>`;
  const block = lab.q<SVGRectElement>(".g2u2x-pr-block");
  const fl = lab.qa<SVGPathElement>(".g2u2x-pr-fl path"), dt = lab.qa<SVGCircleElement>(".g2u2x-pr-dots circle"), arrows = lab.q<SVGGElement>(".g2u2x-pr-arrows");
  let way: Way | null = null;
  let p = 0;
  let pred = "";
  const tried = new Set<Way>();
  const paint = (): void => {
    const sy = way === "v" ? 1 - 0.22 * p : 1, sx = way === "h" ? 1 - 0.22 * p : 1;
    const w = BW * sx, h = BH * sy;
    block.setAttribute("x", (MX - w / 2).toFixed(1));
    block.setAttribute("y", (MY - h / 2).toFixed(1));
    block.setAttribute("width", w.toFixed(1));
    block.setAttribute("height", h.toFixed(1));
    block.setAttribute("fill", way === "heat" ? `rgb(${185 + 50 * p},${176 - 30 * p},${166 - 60 * p})` : "#B9B0A6");
    const target = way === "v" ? 0 : Math.PI / 2;
    flakes.forEach((k, i) => {
      let a = k.a;
      if (way === "v" || way === "h") {
        let d = a - target;
        while (d > Math.PI / 2) d -= Math.PI;
        while (d < -Math.PI / 2) d += Math.PI;
        a = target + d * (1 - p);
      }
      const L = way === "heat" ? 6 + 3 * p : 7 + 4 * p * (way ? 1 : 0);
      const x = MX + k.x * sx, y = MY + k.y * sy;
      fl[i].setAttribute("d", `M${(x - Math.cos(a) * L).toFixed(1)} ${(y - Math.sin(a) * L).toFixed(1)} L${(x + Math.cos(a) * L).toFixed(1)} ${(y + Math.sin(a) * L).toFixed(1)}`);
    });
    dots.forEach((k, i) => {
      dt[i].setAttribute("cx", (MX + k.x * sx).toFixed(1));
      dt[i].setAttribute("cy", (MY + k.y * sy).toFixed(1));
      dt[i].setAttribute("r", (3.4 * (way === "heat" ? 1 + 0.9 * p : 1)).toFixed(1));
    });
    const g = 20 - 6 * p;
    arrows.innerHTML = way === "v" ? prArrow(MX, MY - h / 2 - g - 4, 0, g) + prArrow(MX, MY + h / 2 + g + 4, 0, -g)
      : way === "h" ? prArrow(MX - w / 2 - g - 4, MY, g, 0) + prArrow(MX + w / 2 + g + 4, MY, -g, 0)
      : way === "heat" ? [0, 1, 2].map((i) => `<path d="M${BX + BW + 16} ${BY + 26 + i * 30} q8 -8 0 -16 q-8 -8 0 -16" stroke="${G.hot}" stroke-width="3" stroke-linecap="round" fill="none" opacity="${0.4 + 0.6 * p}"/>`).join("") : "";
  };
  const picks = WAYS.map((w) => {
    const pk = gPick(w, WAY[w].name, WAY[w].sub);
    pk.el.addEventListener("click", () => {
      if (lab.finished() || (way && p > 0 && p < 1)) return;
      haptic(HAPTIC.tap);
      way = w;
      p = 0;
      picks.forEach((x) => x.on(x === pk));
      paint();
      hold.disabled = false;
      // 열만 가하기에는 압력이 없으므로 버튼 글도 고른 조건을 따른다
      hold.textContent = w === "heat" ? "꾹 눌러 열 가하기" : "꾹 눌러 열과 압력 가하기";
      f.say(`<b>${WAY[w].name}</b>를 골랐어요. 버튼을 꾹 눌러 오랫동안 두어 보세요.`);
      lab.hint("hold:go");
    });
    return pk;
  });
  const hold = gHold(lab, "go", "꾹 눌러 열과 압력 가하기", (ms) => {
    if (!way || p >= 1) return false;
    p = Math.min(1, p + ms / 2000);
    paint();
    if (p < 1) return true;
    haptic(HAPTIC.correct);
    tried.add(way);
    const i = WAYS.indexOf(way);
    lab.q(`.th-${way}`).innerHTML = pressMini(way, LX, rowY(i), 1);
    const t = lab.q<SVGTextElement>(`.r-${way}`);
    t.textContent = WAY[way].log[0];
    t.setAttribute("fill", G.gold);
    lab.q<SVGTextElement>(`.r2-${way}`).textContent = WAY[way].log[1] ?? "";
    picks[i].done();
    hold.disabled = true;
    f.pips(tried.size >= 2 ? 1 : 0);
    if (tried.size < 3) {
      f.say(way === "heat" ? "열만 받으면 알갱이는 <b>커지지만</b> 줄무늬는 생기지 않아요. 다른 방법도 해 보세요." : `납작한 알갱이들이 나란히 누워 <b>${WAY[way].res}</b>가 생겼어요. 다른 방법도 해 보세요.`);
      hintNext();
      return false;
    }
    f.pips(2);
    // 판정의 근거: 위아래, 양옆 두 결과를 화살과 함께 나란히 크게 다시 그린다
    lab.q(".g2u2x-pr-end").innerHTML = `${label(MX, 30, "누르는 방향과 줄무늬", { size: 12, fill: G.dim, weight: 600 })}
      ${pressMini("v", 46, 108, 1.6)}${pressMini("h", 130, 108, 1.6)}
      ${label(46, 172, "가로 줄무늬", { size: 12.5, fill: G.gold })}${label(130, 172, "세로 줄무늬", { size: 12.5, fill: G.gold })}`;
    f.stage.classList.add("end");
    picks.forEach((x) => x.on(false));
    f.say(`${pred.startsWith("옆으로") ? "예측대로" : "예측과 달리"} 줄무늬의 방향이 누르는 방향에 따라 달랐어요. 두 결과를 보고 답해 보세요.`);
    tm.later(() => lab.ask("줄무늬는 <b>누르는 방향</b>과 어떤 관계였나요?", ["누르는 방향에 수직이다", "누르는 방향과 나란하다", "누르는 방향과 상관없다"], "위아래로 누르면 <b>가로</b>, 양옆에서 누르면 <b>세로</b> 줄무늬가 생겼어요.", () =>
      lab.finish("암석이 <b>열과 압력</b>을 받으면 속의 광물이 <b>누르는 방향에 수직</b>으로 나란히 늘어서 줄무늬가 생겨요. 뜨거운 마그마 옆에서 열만 받으면 줄무늬 없이 알갱이가 커져요."),
    ), 1000);
    return false;
  });
  hold.disabled = true;
  function hintNext(): void {
    const w = WAYS.find((x) => !tried.has(x));
    if (w) lab.hint(w);
  }
  paint();
  f.say("암석 속에 <b>납작한 알갱이</b>들이 이리저리 흩어져 있어요. 누르기 전에 먼저 예측해 보세요.");
  gPredict(lab, "암석을 <b>위아래에서</b> 세게 누르면 납작한 알갱이들은?", ["옆으로 나란히 눕는다", "위아래로 나란히 선다", "흩어진 그대로다"], (picked) => {
    pred = picked;
    f.slot.setControls(gGrid(2, picks[0], picks[1]), gRow(picks[2].el, hold));
    f.say("암석에 가할 <b>조건</b>을 고르고 버튼을 꾹 눌러 보세요. 세 가지 조건을 모두 비교해 보세요.");
    api.setCTA("세 가지를 모두 해 보세요", { enabled: false });
    hintNext();
  });
  return lab.cleanup;
};

/* ══════════ 5레슨 랩 2: 원래 암석과 변성암 ══════════ */
const SRC = [
  { k: "granite", name: "화강암", img: "rocks/granite.webp", steps: [{ at: 50, name: "편마암", img: "rocks/gneiss.webp", foli: true }] },
  { k: "mud", name: "이암", img: "rocks/mudstone.webp", steps: [{ at: 34, name: "편암", img: "rocks/schist.webp", foli: true }, { at: 67, name: "편마암", img: "rocks/gneiss.webp", foli: true }] },
  { k: "sand", name: "사암", img: "rocks/sandstone.webp", steps: [{ at: 50, name: "규암", img: "rocks/quartzite.webp", foli: false }] },
  // 대리암은 진한 결을 밝힌 옅은 표본 사진(대리암에는 엽리가 잘 보이지 않는다는 레슨의 핵심과 맞춘다)
  { k: "lime", name: "석회암", img: "rocks/limestone.webp", steps: [{ at: 50, name: "대리암", img: "rocks/marble-plain.webp", foli: false }] },
] as const;

export const g2u2MetaLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-meta" });
  const { f, tm } = lab;
  let cur = -1;
  const seen = new Set<string>();
  const NEED = SRC.reduce((n, s) => n + s.steps.length, 0);
  f.stage.innerHTML = `${svgOpen}
    <g class="g2u2x-mt-main">
    <g class="g2u2x-mt-a"></g><g class="g2u2x-mt-b"></g>
    <path d="M150 88 h36 M176 78 l11 10 l-11 10" stroke="${G.hot}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${label(168, 70, "열과 압력", { size: 12, fill: G.hot })}
    ${label(76, 172, "원래 암석", { size: 12, fill: G.dim, weight: 600 })}${label(76, 192, "암석을 골라 보세요", { size: 13.5, cls: "g2u2x-mt-an" })}
    ${label(266, 172, "지금의 암석", { size: 12, fill: G.dim, weight: 600 })}${label(266, 192, "", { size: 13.5, fill: G.gold, cls: "g2u2x-mt-bn" })}${label(266, 212, "", { size: 12, weight: 600, fill: "#C5D2E6", cls: "g2u2x-mt-bf" })}
    </g>
    <g class="g2u2x-mt-end"></g>
    ${label(173, 18, "", { size: 12, fill: G.dim, weight: 600, cls: "g2u2x-mt-cnt" })}
  </svg>`;
  const A = lab.q<SVGGElement>(".g2u2x-mt-a"), B = lab.q<SVGGElement>(".g2u2x-mt-b");
  /** 판정 때의 무대: 이암, 편암, 편마암 사진을 한 줄로, 그 아래에 열과 압력의 세기(막대의 자리). */
  const endView = (): string => {
    const P = [
      { img: SRC[1].img, name: "이암", lv: "처음" },
      { img: SRC[1].steps[0].img, name: "편암", lv: "약하게" },
      { img: SRC[1].steps[1].img, name: "편마암", lv: "세게" },
    ];
    const X = [14, 125, 236], W = 96;
    return `<defs><linearGradient id="g2mtLv" x1="0" x2="1"><stop offset="0" stop-color="#5D7393"/><stop offset="1" stop-color="${G.hot}"/></linearGradient></defs>
      ${P.map((q, i) => `${specimen(`g2mtE${i}`, q.img, X[i], 28, W, 96, 12)}${label(X[i] + W / 2, 144, q.name, { size: 13.5, fill: i ? G.gold : G.text })}`).join("")}
      ${[0, 1].map((i) => `<path d="M${X[i] + W + 2} 76 h9 M${X[i] + W + 7} 71.5 l4.5 4.5 l-4.5 4.5" stroke="${G.hot}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join("")}
      <rect x="${X[0] + W / 2}" y="162" width="${X[2] - X[0]}" height="6" rx="3" fill="url(#g2mtLv)"/>
      ${X.map((x, i) => `<circle cx="${x + W / 2}" cy="165" r="6" fill="#0B1524" stroke="${i ? G.hot : "#93A6C2"}" stroke-width="2.4"/>${label(x + W / 2, 188, P[i].lv, { size: 12, weight: 700, fill: G.dim })}`).join("")}
      ${label(173, 208, "막대로 높인 열과 압력의 세기", { size: 12, fill: G.dim, weight: 600 })}`;
  };
  const an = lab.q<SVGTextElement>(".g2u2x-mt-an"), bn = lab.q<SVGTextElement>(".g2u2x-mt-bn"), bf = lab.q<SVGTextElement>(".g2u2x-mt-bf");
  let shown = "";
  const paint = (v: number): void => {
    if (cur < 0) return;
    const s = SRC[cur];
    const st = [...s.steps].reverse().find((x) => v >= x.at);
    const key = st ? `${s.k}>${st.name}` : s.k;
    if (key !== shown) {
      shown = key;
      B.innerHTML = specimen("g2mtB", st ? st.img : s.img, 206, 28, 120, 124, 14);
      bn.textContent = st ? st.name : s.name;
      bf.textContent = st ? (st.foli ? "줄무늬가 뚜렷하다" : "줄무늬가 없다") : "아직 변하지 않았다";
      if (st && !seen.has(key)) {
        seen.add(key);
        haptic(HAPTIC.correct);
        f.pips(seen.size >= NEED ? 2 : seen.size >= 2 ? 1 : 0);
        f.say(`<b>${s.name}</b>이 열과 압력을 받아 <b>${st.name}</b>이 됐어요. ${seen.size < NEED ? "막대를 오른쪽으로 더 움직이거나 다른 암석도 넣어 보세요." : ""}`);
        if (s.steps.every((x) => seen.has(`${s.k}>${x.name}`))) picks[cur].done();
        if (seen.size >= NEED) {
          range.input.disabled = true;
          // 판정의 근거를 무대에 남긴다: 이암이 거친 변화(이암, 편암, 편마암)를 한 줄로 다시 올리고 막대의 자리를 그 아래에 둔다
          tm.later(() => {
            lab.q(".g2u2x-mt-end").innerHTML = endView();
            f.stage.classList.add("end");
            picks.forEach((x) => x.on(false));
            f.say("다섯 가지 변화를 모두 찾았어요. 무대에 다시 올린 <b>이암</b>의 변화를 보고 답해 보세요.");
          }, 900);
          tm.later(() => lab.ask("<b>이암</b>이 받는 열과 압력이 점점 세지면?", ["편암을 거쳐 편마암이 된다", "규암을 거쳐 대리암이 된다", "더 변하지 않는다"], "이암은 열과 압력이 약하면 <b>편암</b>, 세면 <b>편마암</b>이 돼요.", () =>
            lab.finish("암석이 열과 압력을 받으면 성질이 변해 <b>새로운 암석</b>이 돼요. 원래 암석과 열과 압력의 세기에 따라 화강암은 편마암, 이암은 편암이나 편마암, 사암은 규암, 석회암은 대리암이 돼요."),
          ), 1100);
        }
      }
    }
    lab.q<SVGTextElement>(".g2u2x-mt-cnt").textContent = `찾은 변화 ${seen.size} / ${NEED}`;
    hintNow();
  };
  const range = bvRange({ cls: "g2u2x-mt-r", min: 0, max: 100, value: 0, label: "열과 압력의 세기(오른쪽으로 갈수록 세다)", onInput: (v) => paint(v) });
  range.input.dataset.k = "lv";
  range.input.disabled = true;
  const picks = SRC.map((s, i) => {
    const p = gPick(s.k, s.name, "", `<img src="${geo(s.img)}" alt="">`);
    p.el.addEventListener("click", () => {
      if (lab.finished()) return;
      haptic(HAPTIC.tap);
      cur = i;
      shown = "";
      picks.forEach((x, j) => x.on(j === i));
      A.innerHTML = specimen("g2mtA", s.img, 16, 28, 120, 124, 14);
      an.textContent = s.name;
      range.set(0);
      range.input.disabled = false;
      paint(0);
      f.say(`<b>${s.name}</b>을 땅속 깊은 곳에 넣었어요. 막대를 움직여 열과 압력을 높여 보세요.`);
    });
    return p;
  });
  function hintNow(): void {
    for (let i = 0; i < SRC.length; i++) {
      const s = SRC[i];
      const st = s.steps.find((x) => !seen.has(`${s.k}>${x.name}`));
      if (!st) continue;
      lab.hint(cur === i ? `range:lv=${st.at + 10}` : s.k);
      return;
    }
  }
  f.slot.setControls(gGrid(2, ...picks), range.el);
  f.say("암석이 땅속 깊은 곳에서 <b>열과 압력</b>을 받으면 어떻게 될까요? 암석을 하나 골라 보세요.");
  api.setCTA("네 암석을 모두 변하게 해 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
