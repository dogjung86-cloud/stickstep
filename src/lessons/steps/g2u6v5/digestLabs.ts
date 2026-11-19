// [중2 Ⅵ v5] 소화 랩 세 판(g2u6l2).
//
// g2u6SalivaLab 「침은 녹말을 어떻게 바꿀까요?」
//   책의 탐구 「침의 소화 작용 탐구하기」: 녹말 용액이 든 시험관 (가)에 증류수, (나)에 침 용액을 넣고 35~40 ℃ 물에 10분 담근 뒤
//   아이오딘-아이오딘화 칼륨 용액(받침 유리에 한 방울)과 베네딕트 용액(넣고 뜨거운 물에)으로 비교한다.
//   학생이 정하는 것: 두 시험관에 넣을 것(증류수 5 mL 또는 침 용액 5 mL), 담가 둘 물의 온도. 두 검사는 어느 것부터 해도 결과가 같다.
//   실패하는 길: ① 두 시험관에 같은 것을 넣으면 결과가 같아 비교할 수 없다 ② 얼음물이나 끓는 물에 담그면 침을 넣은 쪽도 청람색이다.
//   검사 뒤 쌤의 말은 색만 말하고 해석하지 않는다(2026-11-15 점검: 화면이 "녹말이 사라졌어요"를 먼저 말해 판정이 거저였다).
//   판정 둘: ① 침을 넣은 쪽에서 일어난 일(두 검사를 다 읽어야 오답을 지운다)
//            ② 증류수 쪽 결과로 알 수 있는 것(같은 물, 같은 시간이었으니 시간이나 따뜻한 물 탓이 아니라 침 때문이다).
//
// g2u6EnzymeLab 「영양소는 어디에서 무엇이 될까요?」 (organLab.ts, 2026-11-15 소화기관 그림 랩으로 교체)
//   책의 해 보기 「소화 과정을 소화효소의 작용과 관련지어 추론하기」와 그림 Ⅵ-4. 앞에서 본 몸의 소화기관을 따라가며
//   기관마다 그 소화액이 분해할 영양소를 학생이 고른다. 자세한 설계는 organLab.ts 머리말. 몸 그림은 digestBody.ts.
//
// g2u6VilliLab 「작은창자 안쪽 벽은 왜 주름져 있을까요?」
//   책의 그림 Ⅵ-5(작은창자 안쪽의 구조와 융털의 속 구조). 학생이 정하는 것: 벽의 모양(매끈한 벽, 주름진 벽, 주름과 융털).
//   같은 수의 영양소를 흘려보내 흡수된 수를 비교한다. 흡수된 수는 영양소와 닿는 겉면의 길이(계산)에 비례한다.
//   그림은 villiArt.ts(2026-11-15 사용자 요청으로 자른 벽 덩어리, 손가락 모양 융털, 융털 속 확대 칸을 그려 넣었다).

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, bvTween, chip, dot, g6Lab, g6Svg, good, row, tag, tap, toast, tube, txt, type G6Step } from "./kit";
import { VILLI_ABSORBED, VILLI_TOTAL, villiInset, villiInsetLink, villiWall, villiWallLabels } from "./villiArt";

// ── 침의 소화 작용 ─────────────────────────────────────────────────
// fail: 침이 일을 못 한 까닭의 말(실패 안내). 얼음물에서도 아주 조금은 작용하므로 "활발히 작용하지 못해"로 쓴다(레슨 문제의 "잘 작용하지 못해서"와 맞춘다).
//   소화효소라는 이름은 이 랩 바로 뒤의 개념 스텝이 붙이므로 여기서는 "침", "침 속 물질"이라고만 쓴다.
const TEMPS = [
  { name: "얼음물", sub: "0~5 ℃", fill: "rgba(140,200,255,.20)", line: "#8CC8FF", ok: false, fail: "차가운 얼음물에서는 침이 활발히 작용하지 못해 둘 다 녹말이 그대로 남았어요." },
  { name: "체온과 비슷한 물", sub: "35~40 ℃", fill: "rgba(255,200,120,.20)", line: "#FFC878", ok: true, fail: "" },
  { name: "뜨거운 물", sub: "100 ℃", fill: "rgba(255,120,90,.24)", line: "#FF8A6A", ok: false, fail: "너무 뜨거운 물에서는 침 속 물질의 성질이 변해 작용하지 못했어요." },
];

export const g2u6SalivaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 4, cls: "g2u6x-saliva", wait: "실험 조건을 맞추고 두 가지 검사를 해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "녹말 용액이 든 시험관 두 개와 물이 담긴 비커, 받침 유리");
  let phase: "prep" | "test" = "prep";
  const sal = [false, false]; // 침 용액을 넣었는가
  let temp = -1;
  let iod = false;
  let ben = false;
  let busy = false;

  // 두 이름표(폭 최대 약 158)가 맞붙지 않게 시험관 간격을 164로 둔다(물통 40~306, 받침 유리 x±44 안쪽).
  const TX = [91, 255];
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
    chip(`t${i}`, i ? "시험관 (나)" : "시험관 (가)", "증류수 5 mL", () => {
      if (busy) return;
      tap();
      sal[i] = !sal[i];
      cTube[i].sub(sal[i] ? "침 용액 5 mL" : "증류수 5 mL");
      cTube[i].on(sal[i]);
      draw();
    }),
  );
  const cTemp = chip("temp", "비커의 물 온도", "온도 선택하기", () => {
    if (busy) return;
    tap();
    temp = (temp + 1) % 3;
    cTemp.sub(`${TEMPS[temp].name} (${TEMPS[temp].sub})`);
    cTemp.on(true);
    draw();
  });
  const soak = bvBtn("main g2u6x-soak", "비커에 10분 동안 담가 두기");
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
      f.say("먼저 <b>비커의 물 온도</b> 버튼을 눌러 물의 온도를 골라 주세요.");
      return;
    }
    tap();
    phase = "test";
    f.pips(1);
    draw();
    f.slot.setControls(row(cIod.el), row(cBen.el));
    f.say("10분이 지났어요! 이제 녹말이 남아 있는지 확인하는 <b>아이오딘 반응 검사</b>와 당분이 생겼는지 확인하는 <b>베네딕트 반응 검사</b>를 차례로 해 보세요.");
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
    if (sal[0] === sal[1]) return fail("same", "두 시험관에 넣은 용액이 같아 비교할 수 없어요", "두 시험관에 같은 용액을 넣어서 결과가 똑같이 나왔어요. 한쪽은 <b>침 용액</b>, 다른 쪽은 <b>증류수</b>로 다르게 넣고 다시 실험해 보세요.");
    if (!TEMPS[temp].ok) return fail("temp", "이 온도에서는 침이 제대로 작용하지 못했어요", `${TEMPS[temp].fail} <b>체온과 비슷한 따뜻한 물(35~40 ℃)</b>로 바꿔 보세요.`);
    host.dataset.g6Fail = "";
    if (iod && ben) {
      f.pips(2);
      good();
      // 해석은 판정에서 학생이 한다. 여기서는 두 검사의 색만 말한다(수정안 괄호의 "녹말 사라짐", "엿당 생성"은 바로 뒤 판정의 답이라 뺐다).
      f.say("침 용액을 넣은 시험관만 아이오딘 반응에서 <b>색이 변하지 않았고</b>, 베네딕트 반응에서 <b>황적색</b>으로 변했어요!");
      tm.later(() => {
        // 오답 보기 둘은 한쪽 검사만 읽은 답이다(아이오딘을 안 읽으면 "녹말은 그대로", 베네딕트를 안 읽으면 "당분은 없다").
        lab.judge(
          "체온과 비슷한 온도에서 <b>침 용액</b>을 넣은 시험관에서만 일어난 변화는 무엇인가요?",
          [{ t: "녹말이 없어지고 당분이 생겼다", ok: true }, { t: "녹말은 그대로이고 당분이 생겼다" }, { t: "녹말이 없어졌지만 당분은 없다" }],
          "청람색은 <b>녹말</b>, 황적색은 <b>당분</b>이 있다는 표시예요.",
          () => {
            // 증류수 쪽은 침만 빼고 똑같이 둔 시험관이다. 오답 보기 둘은 그 시험관이 지워 주는 다른 까닭(시간, 따뜻한 물)이다.
            f.pips(3);
            f.say("이번에는 <b>증류수 쪽</b>을 봐요. 같은 물에 10분 함께 담가 둔 시험관이에요.");
            lab.judge(
              "<b>증류수를 넣은 시험관</b>의 결과로 알 수 있는 사실은 무엇인가요?",
              [{ t: "녹말이 없어진 것은 침 때문이다", ok: true }, { t: "녹말은 10분이면 저절로 없어진다" }, { t: "따뜻한 물만으로도 녹말이 없어진다" }],
              "증류수를 넣은 쪽은 녹말이 그대로 남아 있어서, 녹말이 분해된 것이 물이 아니라 <b>침</b> 때문임을 확실히 증명해 줘요.",
              () =>
                lab.finish("침만 빼고 똑같이 둔 시험관은 녹말이 그대로였으니, 녹말을 <b>당분(엿당)</b>으로 분해한 것은 <b>침</b>이에요. 침은 체온과 비슷한 온도에서 잘 작용해요."),
            );
          },
        );
      }, 1500);
    } else f.say(iod ? "아이오딘 검사를 마쳤어요! 침을 넣은 쪽은 청람색이 나타나지 않네요. 이제 <b>베네딕트 반응 검사</b>도 해 볼까요?" : "베네딕트 용액을 넣고 가열했더니 침을 넣은 쪽이 황적색으로 변했어요! 이제 <b>아이오딘 반응 검사</b>도 마저 해 볼까요?");
  };
  const cIod = chip("iod", "아이오딘 반응 검사", "녹말이 남아 있는지 확인", () => {
    if (busy || iod) return;
    tap();
    iod = true;
    cIod.done();
    draw();
    after();
  });
  const cBen = chip("ben", "베네딕트 반응 검사", "가열하여 당분이 생겼는지 확인", () => {
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

// ── 소화기관을 따라가며(organLab.ts) ───────────────────────────────
export { g2u6EnzymeLab } from "./organLab";

// ── 작은창자 안쪽 벽(그림은 villiArt.ts, 2026-11-15 책의 그림 Ⅵ-5처럼 자세히 다시 그림) ──────────
export { VILLI_ABSORBED };
// 세 칸 단추(한 칸 약 110px)에 들어가게 짧은 이름을 쓴다(수정안 첫 안 "주름과 융털이 있는 벽"은 칸을 넘어 대안을 썼다)
const WALL_NAMES = ["매끈한 벽", "주름진 벽", "주름 + 융털 벽"];

export const g2u6VilliLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 2, cls: "g2u6x-villi", wait: "세 가지 벽 모양에 영양소를 모두 흘려보내 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "작은창자 안쪽 벽의 단면과 그 위를 지나는 영양소");
  let level = 0;
  let run = -1; // 0~1 진행, -1은 대기
  const result: (number | null)[] = [null, null, null];
  let busy = false;

  const draw = (): void => {
    const wall = villiWall(level);
    let out = wall.svg + villiWallLabels(level);
    out += txt(16, 56, "작은창자 안", { anchor: "start", size: 12, fill: P.dim });
    if (level === 2) out += villiInsetLink();
    const got = VILLI_ABSORBED[level];
    const tg = wall.targets;
    for (let i = 0; i < VILLI_TOTAL; i++) {
      const sx = 26 + (i % 10) * 20 + (i >= 10 ? 10 : 0);
      const sy = i >= 10 ? 90 : 70;
      const absorbed = i < got;
      // 흡수되는 것은 벽에 고르게 나눈 자리(융털이 있으면 융털 끝)로, 나머지는 오른쪽으로 흘러 나간다.
      const spread = [-3, 2, -1, 3, -2, 1][i % 6]; // 주름 꼭대기에만 모이지 않게 조금씩 비킨다
      const target = tg[Math.max(0, Math.min(tg.length - 1, Math.floor(((i + 0.5) / got) * tg.length) + (level === 2 ? 0 : spread)))] ?? tg[0];
      const tx = Math.max(9, target[0]);
      if (run < 0) out += dot(sx, sy, 4.6, P.glucose, "#8A5A0A");
      else if (absorbed) out += dot(sx + (tx - sx) * run, sy + (target[1] - sy) * run, 4.6, P.glucose, "#8A5A0A");
      else out += `<g opacity="${(1 - run * 0.85).toFixed(2)}">${dot(sx + 70 * run, sy, 4.6, P.glucose, "#8A5A0A")}</g>`;
    }
    if (level === 2) out += villiInset();
    out += `<g>${result.map((r, i) => tag([46, 130, 266][i], 26, `${["매끈", "주름", "주름과 융털"][i]} ${r === null ? "?" : `${r}개`}`, { size: 12, fill: i === level ? "#fff" : P.dim, stroke: i === level ? "#9CC2FF" : "#3A4D6E" })).join("")}</g>`;
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
      f.say(`<b>${n}</b> 모형을 골랐어요. 아래 버튼을 눌러 영양소 ${VILLI_TOTAL}개를 흘려보내 보세요.`);
    }),
  );
  const flow = bvBtn("main g2u6x-flow-btn", "영양소 20개 흘려보내기");
  const sum = bvBtn("g2u6x-go", "세 가지 벽의 흡수량 비교하기");
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
    lab.judge("작은창자 안쪽 벽에 주름과 융털이 많을 때 영양소가 <b>훨씬 더 많이</b> 흡수된 까닭은 무엇인가요?", [{ t: "영양소와 닿는 표면적이 매우 넓어져서", ok: true }, { t: "융털이 영양소의 크기를 더 작게 분해해서" }, { t: "작은창자의 근육층이 더 두꺼워져서" }], "주름과 융털은 작은창자 안쪽 벽이 영양소와 닿는 <b>표면적</b>을 크게 넓혀 주어 영양소를 효율적으로 흡수하게 해 줘요.", () =>
      lab.finish("작은창자 안쪽 벽에는 수많은 주름과 작은 돌기인 <b>융털</b>이 빽빽하게 나 있어 영양소와 닿는 <b>표면적</b>이 매우 넓어요. 덕분에 소화된 영양소를 효율적으로 흡수할 수 있어요."),
    );
  });
  f.slot.setControls(row(...chips.map((c) => c.el)), flow, sum);
  chips[0].on(true);
  draw();
  f.say("작게 분해된 영양소 20개가 작은창자 안을 지나가요. <b>안쪽 벽의 모양</b>에 따라 영양소가 얼마나 많이 흡수되는지 비교해 보세요.");
  return lab.cleanup;
};
