// [중2 Ⅱ v5] g2u2l3 랩 1, 2: 화성암.
//
// 랩 1 「천천히 식으면 알갱이가 어떻게 될까요?」(g2u2CoolLab)
//   책의 본문(마그마가 지표에서 빠르게 식으면 결정이 작고 지하 깊은 곳에서 천천히 식으면 결정이 크다)을 손으로 비교한다.
//   학생이 정하는 것: 마그마를 식힐 곳(지표, 지하 깊은 곳)과 차례. 꾹 눌러 식힌다. 먼저 예측한다(정오를 매기지 않는다).
//   실패가 보이는 길: 다 식기 전에 손을 떼면 아직 굳지 않은 채로 남는다(지하 깊은 곳은 훨씬 오래 눌러야 한다).
//   판정 하나: 천천히 식은 쪽의 알갱이. 통찰 하나: 식는 빠르기가 결정의 크기를 정한다. 두 결과는 무대에 나란히 남는다.
//
// 랩 2 「이 화성암은 표의 어느 칸일까요?」(g2u2IgneousLab)
//   책의 그림(화성암의 종류: 광물 결정의 크기와 암석의 색으로 구분)을 실사 표본 네 개로 직접 분류한다.
//   학생이 정하는 것: 볼 암석과 놓을 칸. 틀린 칸에 놓으면 들어가지 않고 무엇이 맞지 않는지 나온다.
//   판정 하나: 색이 같은 현무암과 반려암의 다른 점. 통찰 하나: 화성암은 결정의 크기와 색으로 나눈다.

import type { StepRenderer } from "../../types";
import { G, clamp, gGrid, gHold, gLab, gPick, gPredict, gTap, geo, haptic, HAPTIC, label, seeded, specimen, svgOpen, type GStep } from "./kit";

/* ══════════ 랩 1: 식는 빠르기와 결정의 크기 ══════════ */
// 결정은 둥근 원이 아니라 빈틈없이 맞물린 모난 알갱이다(정밀 그림 g2u2l3f1의 확대 원과 같은 모양, 6레슨 표본 랩의 '맞물린 결정').
// 돋보기 원 안을 보로노이 칸으로 나눠 두고, 칸마다 가운데(결정이 생긴 자리)에서 결정이 자라 제 칸을 다 채운다.
// 자라는 동안 칸 사이로 주황 마그마가 보이고, 다 굳으면 주황을 걷는다(남은 틈은 알갱이 경계 색).
const TINT = ["#E9E4DC", "#C9B7A6", "#5A5560", "#F0D9C8"];
type Pt = [number, number];
/** 볼록 다각형을 반평면(점 m, 바깥쪽 법선 n) 안쪽만 남기게 자른다. */
function clipHalf(poly: Pt[], m: Pt, n: Pt): Pt[] {
  const side = (p: Pt): number => (p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1];
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
interface Grain { sx: number; sy: number; pts: Pt[]; c: string; d: number }
/** 원(cx, cy, R)을 크기 cell 안팎의 결정 칸으로 빈틈없이 나눈다(흔들린 육각 격자의 보로노이). */
function crystals(cx: number, cy: number, R: number, cell: number, seed: number): Grain[] {
  const rnd = seeded(seed);
  const seeds: Pt[] = [];
  const n = Math.ceil(R / cell) + 2;
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const x = cx + (i + (j % 2 ? 0.5 : 0)) * cell + (rnd() - 0.5) * cell * 0.62, y = cy + j * cell * 0.866 + (rnd() - 0.5) * cell * 0.62;
    if (Math.hypot(x - cx, y - cy) < R + cell * 0.9) seeds.push([x, y]);
  }
  const circle: Pt[] = Array.from({ length: 56 }, (_, k) => [cx + (R + 1) * Math.cos((k / 56) * Math.PI * 2), cy + (R + 1) * Math.sin((k / 56) * Math.PI * 2)]);
  const out: Grain[] = [];
  seeds.forEach((p, idx) => {
    let poly = circle.slice();
    for (const q of seeds) {
      if (q === p || Math.hypot(q[0] - p[0], q[1] - p[1]) > cell * 3) continue;
      poly = clipHalf(poly, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], [q[0] - p[0], q[1] - p[1]]);
      if (poly.length < 3) break;
    }
    if (poly.length < 3) return;
    // 칸의 무게중심에서 자라게 한다(원 밖에 씨앗이 있는 가장자리 칸도 제 칸 안에서 자란다)
    const gx = poly.reduce((a, v) => a + v[0], 0) / poly.length, gy = poly.reduce((a, v) => a + v[1], 0) / poly.length;
    out.push({ sx: gx, sy: gy, pts: poly, c: TINT[Math.floor(rnd() * TINT.length)], d: rnd() * 0.45 + (idx % 3) * 0.02 });
  });
  return out;
}
const SPOT = [
  { k: "top", name: "지표에서 식히기", sub: "흘러나온 용암", cx: 92, need: 1300, cell: 9, cap: "지표에서 식음" },
  { k: "deep", name: "지하 깊은 곳에서 식히기", sub: "땅속의 마그마", cx: 254, need: 3400, cell: 34, cap: "지하 깊은 곳에서 식음" },
] as const;

export const g2u2CoolLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-cool" });
  const { f, tm } = lab;
  const CY = 100, R = 66;
  const data = SPOT.map((s, i) => crystals(s.cx, CY, R, s.cell, 11 + i * 7));
  f.stage.innerHTML = `${svgOpen}
    <defs><radialGradient id="g2clMelt" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#FFD27A"/><stop offset=".6" stop-color="#FF8A3D"/><stop offset="1" stop-color="#D9481E"/></radialGradient>
      ${SPOT.map((s, i) => `<clipPath id="g2clC${i}"><circle cx="${s.cx}" cy="${CY}" r="${R}"/></clipPath>`).join("")}</defs>
    ${SPOT.map((s, i) => `<circle class="g2u2x-cl-melt m-${s.k}" cx="${s.cx}" cy="${CY}" r="${R}" fill="url(#g2clMelt)"/>
      <g clip-path="url(#g2clC${i})" class="g2u2x-cl-g g-${s.k}">${data[i].map((c) => `<polygon points="" fill="${c.c}" stroke="#3B3440" stroke-width="${s.cell > 20 ? 1.6 : 0.8}" stroke-linejoin="round"/>`).join("")}</g>
      <circle cx="${s.cx}" cy="${CY}" r="${R}" stroke="#DCE7F5" stroke-width="3"/>
      ${label(s.cx, 188, s.cap, { size: 12.5 })}
      ${label(s.cx, 207, "아직 마그마", { size: 12, weight: 600, fill: G.warm, cls: `g2u2x-cl-st st-${s.k}` })}`).join("")}
    ${label(173, 22, "돋보기로 본 모습", { size: 12, fill: G.dim, weight: 600 })}
  </svg>`;
  const polys = SPOT.map((s) => lab.qa<SVGPolygonElement>(`.g-${s.k} polygon`));
  const prog = [0, 0];
  const paint = (i: number): void => {
    const p = prog[i];
    polys[i].forEach((el, n) => {
      const g = data[i][n], k = clamp((p - g.d) / (1 - g.d));
      el.setAttribute("points", k <= 0 ? "" : g.pts.map(([x, y]) => `${(g.sx + (x - g.sx) * k).toFixed(1)},${(g.sy + (y - g.sy) * k).toFixed(1)}`).join(" "));
    });
    // 다 굳으면 마그마의 주황을 걷는다(칸 사이 머리카락 틈은 알갱이 경계 색으로 보인다)
    lab.q<SVGCircleElement>(`.m-${SPOT[i].k}`).setAttribute("fill", p >= 1 ? "#3B3440" : "url(#g2clMelt)");
    lab.q<SVGTextElement>(`.st-${SPOT[i].k}`).textContent = p >= 1 ? (i === 0 ? "금방 굳었어요" : "아주 오래 걸려 굳었어요") : p > 0 ? "식는 중(아직 다 굳지 않음)" : "아직 마그마";
    lab.q<SVGTextElement>(`.st-${SPOT[i].k}`).setAttribute("fill", p >= 1 ? G.ok : G.warm);
  };
  let cur = -1;
  let pred = "";
  const picks = SPOT.map((s, i) => {
    const p = gPick(s.k, s.name, s.sub);
    p.el.addEventListener("click", () => {
      if (prog[i] >= 1 || lab.finished()) return;
      haptic(HAPTIC.tap);
      cur = i;
      picks.forEach((x, j) => x.on(j === i));
      hold.disabled = false;
      hold.textContent = i === 0 ? "꾹 눌러 식히기" : "꾹 눌러 식히기(오래 걸려요)";
      f.say(`<b>${s.name}</b>를 골랐어요. 버튼을 꾹 눌러 다 굳을 때까지 식혀 보세요.`);
      lab.hint("hold:cool");
    });
    return p;
  });
  const hold = gHold(lab, "cool", "꾹 눌러 식히기", (ms) => {
    if (cur < 0 || prog[cur] >= 1) return false;
    prog[cur] = Math.min(1, prog[cur] + ms / SPOT[cur].need);
    paint(cur);
    if (prog[cur] < 1) return true;
    haptic(HAPTIC.correct);
    picks[cur].done();
    picks[cur].on(false);
    hold.disabled = true;
    const other = prog.findIndex((p) => p < 1);
    f.pips(other < 0 ? 2 : 1);
    if (other >= 0) {
      f.say(cur === 0 ? "지표에서는 <b>금방</b> 굳었어요. 이번에는 지하 깊은 곳에서 식혀 보세요." : "지하 깊은 곳에서는 <b>아주 오래</b> 걸렸어요. 이번에는 지표에서 식혀 보세요.");
      cur = -1;
      lab.hint(SPOT[other].k);
      return false;
    }
    f.say(`${pred.startsWith("크게") ? "예측대로" : "예측과 달리"} 두 돋보기 속 알갱이의 크기가 달라요. 비교해 보고 답해 보세요.`);
    tm.later(judge, 1000);
    return false;
  });
  hold.disabled = true;

  function judge(): void {
    lab.ask(
      "지하 깊은 곳에서 마그마가 <b>천천히</b> 식으면 광물 알갱이의 크기는?",
      ["더 크다", "더 작다", "크기가 같다"],
      "천천히 식으면 알갱이가 <b>자랄 시간</b>이 길어서 크게 자라요.",
      () => lab.finish("마그마가 지표에서 <b>빨리</b> 식으면 광물 알갱이(결정)가 <b>작고</b>, 지하 깊은 곳에서 <b>천천히</b> 식으면 <b>크게</b> 자라요. 식는 빠르기가 결정의 크기를 정해요."),
    );
  }

  f.say("암석이 녹은 뜨거운 물질인 <b>마그마</b>가 식으면 알갱이가 생기며 굳어요. 먼저 예측해 보세요.");
  gPredict(lab, "마그마가 <b>천천히</b> 식으면 알갱이는 어떻게 될까요?", ["크게 자란다", "작게 자란다", "빠르게 식을 때와 같다"], (picked) => {
    pred = picked;
    f.slot.setControls(gGrid(1, ...picks), hold);
    f.say("마그마를 <b>식힐 곳</b>을 고르고 버튼을 꾹 눌러 식혀 보세요. 두 곳 모두 해 봐요.");
    api.setCTA("두 곳에서 모두 식혀 보세요", { enabled: false });
    lab.hint("top");
  });
  return lab.cleanup;
};

/* ══════════ 랩 2: 화성암 분류표 ══════════ */
const ROCK = [
  { k: "basalt", name: "현무암", img: "rocks/basalt.webp", big: 0, light: 0 },
  { k: "granite", name: "화강암", img: "rocks/granite.webp", big: 1, light: 1 },
  { k: "gabbro", name: "반려암", img: "rocks/gabbro.webp", big: 1, light: 0 },
  // 유문암 사진은 흐름 줄무늬의 대비를 낮춘 판(나란한 줄무늬는 4, 5레슨에서 층리와 엽리로 배운다)
  { k: "rhyolite", name: "유문암", img: "rocks/rhyolite-soft.webp", big: 0, light: 1 },
] as const;
const GX = [164, 254], GY = [36, 122], CW = 84, CH = 80;

export const g2u2IgneousLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-ign" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}
    ${label(GX[0] + CW / 2, 26, "색이 어둡다", { size: 12.5 })}${label(GX[1] + CW / 2, 26, "색이 밝다", { size: 12.5 })}
    ${label(139, GY[0] + CH / 2 - 3, "결정이", { size: 12.5 })}${label(139, GY[0] + CH / 2 + 13, "작다", { size: 12.5 })}
    ${label(139, GY[1] + CH / 2 - 3, "결정이", { size: 12.5 })}${label(139, GY[1] + CH / 2 + 13, "크다", { size: 12.5 })}
    ${[0, 1].map((r) => [0, 1].map((c) => `<rect class="g2u2x-ig-cell c-${r}${c}" x="${GX[c]}" y="${GY[r]}" width="${CW}" height="${CH}" rx="12" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.35)" stroke-width="1.4" stroke-dasharray="5 5"/><g class="g2u2x-ig-in i-${r}${c}"></g>`).join("")).join("")}
    <g class="g2u2x-ig-big"></g>
    ${label(60, 26, "고른 암석", { size: 12, fill: G.dim, weight: 600 })}
    ${label(60, 172, "", { size: 13, cls: "g2u2x-ig-name" })}
    ${label(60, 192, "", { size: 12, weight: 600, fill: G.dim, cls: "g2u2x-ig-n1" })}${label(60, 207, "", { size: 12, weight: 600, fill: G.dim, cls: "g2u2x-ig-n2" })}
  </svg>`;
  const big = lab.q<SVGGElement>(".g2u2x-ig-big");
  let sel = -1;
  const placed = new Set<string>();
  const picks = ROCK.map((r, i) => {
    const p = gPick(r.k, `암석 ${"가나다라"[i]}`, "눌러서 보기", `<img src="${geo(r.img)}" alt="">`);
    p.el.addEventListener("click", () => choose(i));
    return p;
  });
  const cells = [0, 1].flatMap((r) => [0, 1].map((c) => {
    const b = gTap(lab, `c${r}${c}`, `결정이 ${r ? "크고" : "작고"} 색이 ${c ? "밝은" : "어두운"} 칸`, GX[c] + CW / 2, GY[r] + CH / 2, CW, CH);
    b.classList.add("g2u2x-ig-tap");
    b.addEventListener("click", () => put(r, c));
    return b;
  }));
  // 현무암을 크게 볼 때 가장 눈에 띄는 것은 구멍이라, 구멍이 결정이 아니라 기체가 빠져나간 자리라는 것을 한 줄로 붙인다
  const note = (on: boolean): void => {
    lab.q<SVGTextElement>(".g2u2x-ig-n1").textContent = on ? "구멍은 기체가" : "";
    lab.q<SVGTextElement>(".g2u2x-ig-n2").textContent = on ? "빠져나간 자리" : "";
  };
  const hintNow = (): void => {
    if (sel >= 0 && !placed.has(ROCK[sel].k)) lab.hint(`c${ROCK[sel].big}${ROCK[sel].light}`);
    else {
      const n = ROCK.findIndex((r) => !placed.has(r.k));
      if (n >= 0) lab.hint(ROCK[n].k);
    }
  };
  function choose(i: number): void {
    if (placed.has(ROCK[i].k) || lab.finished()) return;
    haptic(HAPTIC.tap);
    sel = i;
    picks.forEach((p, j) => p.on(j === i));
    big.innerHTML = specimen("g2igB", ROCK[i].img, 8, 36, 104, 120, 14);
    lab.q<SVGTextElement>(".g2u2x-ig-name").textContent = `암석 ${"가나다라"[i]}`;
    note(ROCK[i].k === "basalt");
    f.say("크게 본 암석의 <b>색</b>과 <b>알갱이의 크기</b>를 보고 표에서 알맞은 칸을 눌러 보세요.");
    hintNow();
  }
  function put(r: number, c: number): void {
    if (sel < 0 || placed.has(ROCK[sel].k) || lab.finished()) return;
    const R = ROCK[sel];
    if (R.big !== r || R.light !== c) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      const cell = lab.q(`.c-${r}${c}`);
      cell.classList.remove("g2u2x-blink");
      void cell.getBoundingClientRect();
      cell.classList.add("g2u2x-blink");
      f.say(R.big !== r ? `이 암석은 알갱이가 ${R.big ? "<b>눈에 보일 만큼 커요</b>" : "<b>눈으로 구별하기 어려울 만큼 작아요</b>"}. 다른 줄을 골라 보세요.` : `이 암석은 색이 ${R.light ? "<b>밝아요</b>" : "<b>어두워요</b>"}. 다른 칸을 골라 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    placed.add(R.k);
    lab.q(`.i-${r}${c}`).innerHTML = `${specimen(`g2ig${r}${c}`, R.img, GX[c] + 4, GY[r] + 4, CW - 8, CH - 26, 9)}${label(GX[c] + CW / 2, GY[r] + CH - 7, R.name, { size: 13 })}`;
    lab.q(`.c-${r}${c}`).setAttribute("stroke-dasharray", "0");
    cells[r * 2 + c].disabled = true;
    picks[sel].done();
    picks[sel].on(false);
    picks[sel].el.disabled = true;
    big.innerHTML = "";
    lab.q<SVGTextElement>(".g2u2x-ig-name").textContent = "";
    note(false);
    f.pips(placed.size >= 2 ? 1 : 0);
    sel = -1;
    if (placed.size < ROCK.length) {
      f.say(`이 암석의 이름은 <b>${R.name}</b>이에요. 남은 암석도 골라서 표에 놓아 보세요.`);
      hintNow();
      return;
    }
    f.pips(2);
    f.say("네 암석이 모두 제 칸을 찾았어요. 완성한 표를 보고 답해 보세요.");
    tm.later(() => lab.ask("둘 다 어두운 <b>현무암과 반려암</b>은 무엇이 다른가요?", ["광물 결정의 크기", "암석의 색", "다른 점이 없다"], "색은 비슷하지만 현무암은 결정이 <b>작고</b> 반려암은 <b>커요</b>.", () =>
      lab.finish("화성암은 <b>광물 결정의 크기</b>와 <b>암석의 색</b>에 따라 분류해요. 결정이 작으면 현무암(어두움)·유문암(밝음), 결정이 크면 반려암(어두움)·화강암(밝음)이에요."),
    ), 900);
  }
  f.slot.setControls(gGrid(2, ...picks));
  f.say("마그마가 식어 굳은 암석이 네 개 있어요. <b>하나를 골라</b> 크게 보고 표의 알맞은 칸에 놓아 보세요.");
  api.setCTA("네 암석을 표에 놓아 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};
