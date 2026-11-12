// [중2 Ⅵ v5] 소화 랩 세 판(g2u6l2).
//
// g2u6SalivaLab 「침은 녹말을 어떻게 바꿀까요?」
//   책의 탐구 「침의 소화 작용 탐구하기」: 녹말 용액이 든 시험관 (가)에 증류수, (나)에 침 용액을 넣고 35~40 ℃ 물에 10분 담근 뒤
//   아이오딘-아이오딘화 칼륨 용액(받침 유리에 한 방울)과 베네딕트 용액(넣고 뜨거운 물에)으로 견준다.
//   학생이 정하는 것: 두 시험관에 넣을 것, 담가 둘 물의 온도, 검사의 차례.
//   실패하는 길: ① 두 시험관에 같은 것을 넣으면 결과가 같아 견줄 수 없다 ② 얼음물이나 끓는 물에 담그면 침을 넣은 쪽도 청람색이다.
//
// g2u6EnzymeLab 「소화액마다 어떤 영양소를 분해할까요?」
//   책의 해 보기 「소화 과정을 소화효소의 작용과 관련지어 추론하기」와 그림(영양소의 소화 과정).
//   학생이 정하는 것: 세 영양소를 세 곳의 소화액에 넣어 보는 아홉 칸의 차례. 분해되지 않는 칸도 해 본다.
//
// g2u6VilliLab 「작은창자 안쪽 벽은 왜 주름져 있을까요?」
//   책의 그림(작은창자 안쪽의 구조와 융털). 학생이 정하는 것: 벽의 모양(매끈한 벽, 주름진 벽, 주름과 융털).
//   같은 수의 영양소를 흘려보내 흡수된 수를 견준다. 흡수된 수는 벽 선의 길이(계산)에 비례한다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, dot, g6Lab, g6Svg, good, noteLine, onStageTap, row, tag, tap, toast, tube, txt, type G6Step } from "./kit";

// ── 침의 소화 작용 ─────────────────────────────────────────────────
const TEMPS = [
  { name: "얼음물", sub: "0~5 ℃", fill: "rgba(140,200,255,.20)", line: "#8CC8FF", ok: false },
  { name: "따뜻한 물", sub: "35~40 ℃", fill: "rgba(255,200,120,.20)", line: "#FFC878", ok: true },
  { name: "끓는 물", sub: "100 ℃", fill: "rgba(255,120,90,.24)", line: "#FF8A6A", ok: false },
];

export const g2u6SalivaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-saliva", wait: "실험을 차례대로 해 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "녹말 용액이 든 시험관 두 개와 물이 담긴 비커, 받침 유리");
  let phase: "prep" | "test" = "prep";
  const sal = [false, false]; // 침 용액을 넣었는가
  let temp = -1;
  let iod = false;
  let ben = false;
  let busy = false;

  const TX = [108, 238];
  const works = (i: number): boolean => sal[i] && temp >= 0 && TEMPS[temp].ok;
  const draw = (): void => {
    let out = "";
    const t = temp >= 0 ? TEMPS[temp] : null;
    if (phase === "prep") {
      out += `<rect x="40" y="74" width="266" height="96" rx="12" fill="${t ? t.fill : "rgba(200,225,255,.05)"}" stroke="${t ? t.line : "#3B5273"}" stroke-width="1.6"${t ? "" : ` stroke-dasharray="5 5"`}/>`;
      out += txt(173, 190, t ? `${t.name} (${t.sub})` : "물의 온도를 골라요", { size: 12.5, fill: t ? t.line : P.dim });
    } else out += `<line x1="20" y1="150" x2="326" y2="150" stroke="#3B5273" stroke-width="2"/>`;
    [0, 1].forEach((i) => {
      const x = TX[i];
      const col = phase === "test" && ben ? (works(i) ? P.benedictOrange : P.benedict) : "rgba(238,240,235,.55)";
      out += tube(x, 36, 110, col, 0.62, 14, phase === "test" && ben ? "g2u6x-pop" : "");
      out += tag(x, 24, `${i ? "(나)" : "(가)"} 녹말 + ${sal[i] ? "침 용액" : "증류수"}`, { size: 12 });
      if (phase === "test") {
        if (ben) out += txt(x + 22, 100, works(i) ? "황적색" : "푸른색", { anchor: "start", size: 12, fill: works(i) ? "#FFD2A8" : "#A9D6FF" });
        // 받침 유리와 아이오딘 반응
        out += `<rect x="${x - 44}" y="170" width="88" height="16" rx="3" fill="rgba(200,225,255,.14)" stroke="${P.glass}" stroke-width="1.3"/>`;
        out += `<ellipse${iod ? ` class="g2u6x-pop"` : ""} cx="${x}" cy="178" rx="15" ry="6" fill="${iod ? (works(i) ? "#C9A45E" : P.iodineBlue) : "rgba(238,240,235,.55)"}"/>`;
        if (iod) out += txt(x, 208, works(i) ? "변화 없음" : "청람색", { size: 12, fill: works(i) ? "#E3C27A" : "#A9B0FF" });
      }
    });
    stage.set(out);
    host.dataset.g6Stage = phase;
    host.dataset.g6Iod = iod ? "1" : "0";
    host.dataset.g6Ben = ben ? "1" : "0";
  };

  const cTube = [0, 1].map((i) =>
    chip(`t${i}`, i ? "(나)에 넣기" : "(가)에 넣기", "증류수", () => {
      if (busy) return;
      tap();
      sal[i] = !sal[i];
      cTube[i].sub(sal[i] ? "침 용액" : "증류수");
      cTube[i].on(sal[i]);
      draw();
    }),
  );
  const cTemp = chip("temp", "물의 온도", "눌러서 고르기", () => {
    if (busy) return;
    tap();
    temp = (temp + 1) % 3;
    cTemp.sub(`${TEMPS[temp].name} (${TEMPS[temp].sub})`);
    cTemp.on(true);
    draw();
  });
  const soak = bvBtn("main g2u6x-soak", "10분 담가 두기");
  const toPrep = (): void => {
    phase = "prep";
    iod = false;
    ben = false;
    busy = false;
    f.pips(0);
    cIod.done(false);
    cBen.done(false);
    draw();
    f.slot.setControls(row(cTube[0].el, cTube[1].el), row(cTemp.el), soak);
    f.say("두 시험관에 <b>무엇을</b> 넣을지, <b>몇 도</b>의 물에 담글지 정해요.");
  };
  soak.addEventListener("click", () => {
    if (busy) return;
    if (temp < 0) {
      bad();
      f.say("담가 둘 <b>물의 온도</b>를 먼저 골라요.");
      return;
    }
    tap();
    phase = "test";
    f.pips(1);
    draw();
    f.slot.setControls(row(cIod.el), row(cBen.el));
    f.say("10분이 지났어요. 두 가지 검사로 시험관 속을 <b>견줘</b> 봐요.");
  });

  const fail = (kind: string, msg: string, say: string): void => {
    busy = true;
    bad();
    lab.slip();
    host.dataset.g6Fail = kind;
    toast(lab, msg, true);
    f.say(say);
    tm.later(toPrep, 2600);
  };
  const after = (): void => {
    if (sal[0] === sal[1]) return fail("same", "두 시험관의 결과가 같아요", "두 시험관에 <b>같은 것</b>을 넣어서 침이 한 일을 알 수 없어요. 다시 준비해요.");
    if (!TEMPS[temp].ok) return fail("temp", "침을 넣은 쪽도 그대로예요", `${TEMPS[temp].name}에서는 침이 작용하지 못했어요. <b>체온과 비슷한</b> 온도로 다시 해요.`);
    host.dataset.g6Fail = "";
    if (iod && ben) {
      f.pips(2);
      good();
      f.say("침을 넣은 쪽은 아이오딘 반응이 <b>없고</b>, 베네딕트 반응이 <b>나타났어요</b>.");
      tm.later(() => {
        lab.judge("<b>침 용액</b>을 넣은 시험관에서만 일어난 일은?", [{ t: "녹말이 없어지고 당분이 생겼다", ok: true }, { t: "녹말이 더 많아졌다" }, { t: "아무 변화도 없었다" }], "청람색은 <b>녹말</b>, 황적색은 <b>당분</b>이 있다는 표시예요.", () =>
          lab.finish("침은 <b>녹말</b>을 <b>당분(엿당)</b>으로 분해해요. 침은 체온과 비슷한 온도에서 잘 작용해요."),
        );
      }, 1500);
    } else f.say(iod ? "증류수 쪽만 <b>청람색</b>이에요. 침을 넣은 쪽은 녹말이 사라졌어요. 다른 검사도 해요." : "침을 넣은 쪽만 <b>황적색</b>이에요. 당분이 생겼어요. 다른 검사도 해요.");
  };
  const cIod = chip("iod", "아이오딘 검사", "받침 유리에 덜어 한 방울씩", () => {
    if (busy || iod) return;
    tap();
    iod = true;
    cIod.done();
    draw();
    after();
  });
  const cBen = chip("ben", "베네딕트 검사", "넣고 뜨거운 물에 담그기", () => {
    if (busy || ben) return;
    tap();
    ben = true;
    cBen.done();
    draw();
    after();
  });

  toPrep();
  return lab.cleanup;
};

// ── 소화액과 영양소 ────────────────────────────────────────────────
const ORGANS = [
  { name: "입", juice: "침" },
  { name: "위", juice: "위액" },
  { name: "작은창자", juice: "이자액" },
];
const FOODS = [
  { name: "녹말", color: "#8E8EF5" },
  { name: "단백질", color: P.protein },
  { name: "지방", color: "#F2D15C" },
];
// [영양소][기관] = 소화효소 이름과 생긴 것. 없으면 분해되지 않는다.
const CUT: (null | { enz: string; out: string; parts: number })[][] = [
  [{ enz: "아밀레이스", out: "엿당", parts: 3 }, null, { enz: "아밀레이스", out: "포도당", parts: 6 }],
  [null, { enz: "펩신", out: "더 작은 단백질", parts: 2 }, { enz: "트립신", out: "아미노산", parts: 6 }],
  [null, null, { enz: "라이페이스", out: "지방산과 모노글리세라이드", parts: 6 }],
];

export const g2u6EnzymeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-enzyme", wait: "아홉 칸을 모두 눌러 보세요" });
  const { f } = lab;
  const stage = g6Svg(lab, "세 영양소를 입, 위, 작은창자의 소화액에 넣어 보는 표");
  const done = new Set<string>();
  let last = "";
  let asking = false;

  const CX = (c: number): number => 76 + c * 90;
  const CY = (r: number): number => 44 + r * 60;
  const chain = (x: number, y: number, color: string, parts: number): string => {
    // 구슬 여섯 개. parts 조각으로 끊는다(1이면 한 줄).
    const per = 6 / parts;
    const gap = parts === 1 ? 0 : parts === 6 ? 4.5 : 7;
    const w = 6 * 9 + (parts - 1) * gap;
    let out = "";
    let px = x - w / 2 + 4.5;
    for (let i = 0; i < 6; i++) {
      if (i > 0 && i % per !== 0) out += `<line x1="${px - 9}" y1="${y}" x2="${px}" y2="${y}" stroke="${color}" stroke-width="3"/>`;
      if (i > 0 && i % per === 0) px += gap;
      out += dot(px, y, 4.5, color);
      px += 9;
    }
    return out;
  };
  const draw = (): void => {
    let out = "";
    ORGANS.forEach((o, c) => (out += txt(CX(c) + 43, 16, o.name, { size: 13, fill: P.hi, weight: 800 }) + txt(CX(c) + 43, 32, o.juice, { size: 12, fill: P.dim })));
    FOODS.forEach((fd, r) => {
      out += txt(36, CY(r) + 24, fd.name, { size: 13, fill: fd.color, weight: 800 }) + chain(36, CY(r) + 40, fd.color, 1);
      ORGANS.forEach((_, c) => {
        const k = `${r}-${c}`;
        const hit = CUT[r][c];
        const d = done.has(k);
        out += `<g data-k="c${k}"${last === k ? ` class="g2u6x-pop"` : ""}><rect x="${CX(c)}" y="${CY(r)}" width="86" height="54" rx="12" fill="${d ? (hit ? "rgba(111,208,140,.14)" : "rgba(200,225,255,.05)") : "rgba(200,225,255,.09)"}" stroke="${d ? (hit ? P.good : "#3A4D6E") : "#6C86AE"}" stroke-width="1.5"/>`;
        if (!d) out += txt(CX(c) + 43, CY(r) + 32, "넣어 보기", { size: 12, fill: P.dim });
        else out += chain(CX(c) + 43, CY(r) + 18, fd.color, hit ? hit.parts : 1) + txt(CX(c) + 43, CY(r) + 43, hit ? hit.enz : "그대로", { size: 12, fill: hit ? "#C9F2D5" : P.dim });
        out += `</g>`;
      });
    });
    stage.set(out);
    host.dataset.g6Done = String(done.size);
  };
  const count = noteLine("");
  const go = bvBtn("main g2u6x-go", "결과 정리하기");
  go.disabled = true;
  const note = (): void => {
    count.innerHTML = `넣어 본 칸 <b>${done.size} / 9</b><br>초록 칸은 영양소가 <b>분해된</b> 곳이고, 칸 안의 이름은 그 일을 한 소화효소예요.`;
  };

  onStageTap(stage, (key) => {
    if (asking || !key.startsWith("c")) return;
    const k = key.slice(1);
    if (done.has(k)) return;
    const [r, c] = k.split("-").map(Number);
    const hit = CUT[r][c];
    done.add(k);
    last = k;
    draw();
    note();
    const fd = FOODS[r].name;
    const o = ORGANS[c];
    if (hit) {
      good();
      const extra = r === 2 ? " 쓸개즙이 이 일을 도와요." : "";
      if (c === 2 && r < 2) {
        f.say(`이자액 속 <b>${hit.enz}</b>${r === 1 ? "이" : "가"} ${fd}을 분해하고, 작은창자에서 <b>${hit.out}</b>까지 분해돼요.`);
      } else
      f.say(`${o.juice} 속 <b>${hit.enz}</b>${hit.enz === "펩신" || hit.enz === "트립신" ? "이" : "가"} ${fd}을 <b>${hit.out}</b>${hit.out.endsWith("당") || hit.out.endsWith("산") ? "으로" : "로"} 분해했어요.${extra}`);
    } else {
      tap();
      f.say(`${o.juice}은 ${fd}을 분해하지 못해요. ${fd}은 그대로예요.`);
    }
    if (done.size === 9) {
      f.pips(1);
      go.disabled = false;
    }
  });
  go.addEventListener("click", () => {
    if (asking) return;
    asking = true;
    tap();
    last = "";
    draw();
    lab.judge("세 영양소가 <b>모두</b> 분해된 곳은?", [{ t: "작은창자", ok: true }, { t: "입" }, { t: "위" }], "이자액에는 세 영양소의 소화효소가 <b>모두</b> 들어 있어요.", () => {
      f.pips(2);
      lab.judge("위액 속 <b>펩신</b>이 분해한 영양소는?", [{ t: "단백질", ok: true }, { t: "녹말" }, { t: "지방" }], "소화효소마다 분해하는 영양소가 <b>정해져</b> 있어요.", () =>
        lab.finish("소화효소는 <b>정해진 영양소</b>만 분해해요. 작은창자에서 녹말은 <b>포도당</b>, 단백질은 <b>아미노산</b>, 지방은 <b>지방산과 모노글리세라이드</b>가 돼요."),
      );
    });
  });
  f.slot.setControls(count, go);
  note();
  draw();
  f.say("왼쪽의 영양소를 위쪽의 소화액에 넣어요. <b>칸을 눌러</b> 분해되는지 알아봐요.");
  return lab.cleanup;
};

// ── 작은창자 안쪽 벽 ────────────────────────────────────────────────
type Pt = [number, number];
/** 벽의 윗선(왼쪽에서 오른쪽으로). level 0 매끈, 1 주름, 2 주름과 융털. */
function wallLine(level: number): Pt[] {
  const pts: Pt[] = [];
  const x0 = 20;
  const x1 = 326;
  const base = 176;
  const n = 300;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = x0 + (x1 - x0) * u;
    let y = base;
    if (level >= 1) y -= 44 * Math.pow(Math.sin(u * Math.PI * 4), 2); // 주름 네 개
    if (level >= 2) y -= 13 * Math.pow(Math.abs(Math.sin(u * Math.PI * 26)), 0.7); // 융털
    pts.push([x, y]);
  }
  return pts;
}
const lineLen = (p: Pt[]): number => p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
const WALLS = [0, 1, 2].map(wallLine);
const LENS = WALLS.map(lineLen);
const TOTAL = 20;
/** 흡수된 수: 가장 넓은 벽이 20개를 모두 흡수한다고 놓고 벽 선의 길이에 비례하게 정한다. */
export const VILLI_ABSORBED = LENS.map((l) => Math.round((TOTAL * l) / LENS[2]));
const WALL_NAMES = ["매끈한 벽", "주름진 벽", "주름과 융털"];

export const g2u6VilliLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 2, cls: "g2u6x-villi", wait: "세 가지 벽에 모두 흘려보내 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "작은창자 안쪽 벽의 단면과 그 위를 지나는 영양소");
  let level = 0;
  let run = -1; // 0~1 진행, -1은 대기
  const result: (number | null)[] = [null, null, null];
  let busy = false;

  const draw = (): void => {
    const w = WALLS[level];
    const path = `M${w.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")}`;
    let out = `<path d="${path} L326 222 L20 222 Z" fill="#E7A0A6" stroke="#B45C68" stroke-width="2" stroke-linejoin="round"/>`;
    out += txt(173, 212, "작은창자의 벽", { size: 12, fill: "#5A1E28" });
    out += txt(24, 62, "작은창자 안", { anchor: "start", size: 12, fill: P.dim });
    const got = VILLI_ABSORBED[level];
    for (let i = 0; i < TOTAL; i++) {
      const sx = 30 + (i % 10) * 31 + (i >= 10 ? 15 : 0);
      const sy = i >= 10 ? 96 : 78;
      const absorbed = i < got;
      // 흡수되는 것은 벽 선 위의 고르게 나눈 자리로, 나머지는 오른쪽으로 흘러 나간다.
      const target = w[Math.round(((i + 0.5) / got) * (w.length - 1)) % w.length] ?? w[0];
      if (run < 0) out += dot(sx, sy, 5, P.glucose, "#8A5A0A");
      else if (absorbed) out += dot(sx + (target[0] - sx) * run, sy + (target[1] + 7 - sy) * run, 5, P.glucose, "#8A5A0A");
      else out += `<g opacity="${(1 - run * 0.85).toFixed(2)}">${dot(sx + 70 * run, sy, 5, P.glucose, "#8A5A0A")}</g>`;
    }
    out += `<g>${result.map((r, i) => tag([46, 130, 266][i], 30, `${["매끈", "주름", "주름과 융털"][i]} ${r === null ? "?" : `${r}개`}`, { size: 12, fill: i === level ? "#fff" : P.dim, stroke: i === level ? "#9CC2FF" : "#3A4D6E" })).join("")}</g>`;
    stage.set(out);
    host.dataset.g6Level = String(level);
    host.dataset.g6Runs = String(result.filter((r) => r !== null).length);
  };

  const chips = WALL_NAMES.map((n, i) =>
    chip(`w${i}`, n, "", () => {
      if (busy) return;
      tap();
      level = i;
      run = -1;
      chips.forEach((c, j) => c.on(j === i));
      draw();
      f.say(`<b>${n}</b>이에요. 영양소 20개를 흘려보내 몇 개가 흡수되는지 봐요.`);
    }),
  );
  const flow = bvBtn("main g2u6x-flow-btn", "영양소 20개 흘려보내기");
  const sum = bvBtn("g2u6x-go", "세 벽 견주기");
  sum.disabled = true;
  flow.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    tap();
    bvTween(tm, 1300, (t) => {
      run = t;
      draw();
    }, () => {
      result[level] = VILLI_ABSORBED[level];
      chips[level].done();
      run = 1;
      draw();
      busy = false;
      good();
      f.say(`${WALL_NAMES[level]}에서는 20개 가운데 <b>${VILLI_ABSORBED[level]}개</b>가 흡수됐어요.${result.every((r) => r !== null) ? "" : " 다른 벽도 해 봐요."}`);
      if (result.every((r) => r !== null)) {
        f.pips(1);
        sum.disabled = false;
      }
    });
  });
  sum.addEventListener("click", () => {
    if (busy) return;
    tap();
    lab.judge("주름과 융털이 있을 때 <b>더 많이</b> 흡수된 까닭은?", [{ t: "영양소와 닿는 표면적이 넓어서", ok: true }, { t: "영양소의 크기가 더 작아져서" }, { t: "벽이 더 두꺼워져서" }], "같은 길이의 창자라도 벽이 구불구불할수록 <b>닿는 면</b>이 넓어요.", () =>
      lab.finish("작은창자 안쪽 벽은 <b>주름과 융털</b> 덕분에 영양소와 닿는 <b>표면적</b>이 매우 넓어요. 그래서 영양소를 효율적으로 흡수해요."),
    );
  });
  f.slot.setControls(row(...chips.map((c) => c.el)), flow, sum);
  chips[0].on(true);
  draw();
  f.say("벽의 <b>모양</b>을 고르고 영양소를 흘려보내요. 노란 알갱이가 영양소예요.");
  return lab.cleanup;
};
