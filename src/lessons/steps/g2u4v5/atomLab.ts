// [중2 Ⅳ v5] g2u4l3 원자 모형 랩 두 판. 활동(원자 모형 만들기: 양성자수, 중성자수, 전자 수를 바꾸어 수소, 탄소, 산소 원자 모형을 만든다)을 둘로 나눴다.
//   g2u4NeutralLab 「전하를 띤 입자가 들어 있는데 원자는 왜 전기적으로 중성일까요?」
//     원자핵 속을 들여다본 뒤((+)전하를 띤 입자와 전하가 없는 입자), 학생이 전자의 수를 정해 원자를 완성한다. 헬륨(+2) → 리튬(+3).
//     실패하는 길: 전하의 합이 0이 아닌 채로 완성하면 남은 전하를 알려 주고 완성되지 않는다.
//   g2u4KindLab 「원자의 종류는 어떤 입자의 개수로 결정될까요?」
//     수소 원자에 양성자, 중성자, 전자를 하나씩 더해 본다(한 번에 하나만 바꾸고 되돌아온다). 이름표가 바뀌는 것은 양성자뿐이다.
//     이어서 표대로 탄소(양성자 6)와 산소(양성자 8) 원자를 학생이 만든다. 전자 수를 맞추지 않으면 완성되지 않는다.

// 원자 모형은 구름 모형이다(kit의 cloudAtom): 옅은 파란 구름 가운데 원자핵, 전자는 고리 없이 구름 안에 고르게 흩는다.
// 원자의 종류 랩은 원자핵을 양성자(빨강, +)와 중성자(회색) 알갱이 묶음으로 그리고 +N은 묶음 아래에 적는다(중성자를 더해도 그림이 바뀐다).

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { bad, bvBtn, cloudAtom, cloudDefs, g4Lab, g4Svg, good, ida, nucleusCluster, row, stepper, tap, txt, type G4Step } from "./kit";

const signed = (n: number): string => (n === 0 ? "0" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);
/** 구름 위에서도 읽히게 어두운 테를 두른 글(12px 이상). */
const haloTxt = (x: number, y: number, s: string, size: number, fill: string): string =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${fill}" stroke="#0E1A2C" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke">${s}</text>`;

// 원자핵 속: 양성자(빨강, +)와 중성자(회색)를 가운데부터 돌려 놓는다
function core(cx: number, cy: number, p: number, n: number): string {
  const total = p + n;
  const pts: [number, number][] = [[0, 0]];
  for (let i = 0; i < 6; i++) pts.push([Math.cos((i / 6) * Math.PI * 2) * 17, Math.sin((i / 6) * Math.PI * 2) * 17]);
  let out = `<circle cx="${cx}" cy="${cy}" r="38" fill="rgba(232,131,107,.12)" stroke="#E8836B" stroke-width="1.6" stroke-dasharray="4 4"/>`;
  // 양성자와 중성자를 번갈아 놓다가 한쪽이 다 떨어지면 남은 쪽을 놓는다
  const kinds: boolean[] = [];
  let lp = p;
  let ln = n;
  while (lp + ln > 0) {
    if (lp > 0 && (kinds.length % 2 === 0 || ln === 0)) {
      kinds.push(true);
      lp -= 1;
    } else {
      kinds.push(false);
      ln -= 1;
    }
  }
  kinds.slice(0, total).forEach((isP, i) => {
    const [dx, dy] = pts[i % pts.length];
    out += isP
      ? `<circle cx="${cx + dx}" cy="${cy + dy}" r="8.2" fill="#E8836B" stroke="#A8442E" stroke-width="1.2"/>${txt(cx + dx, cy + dy + 4.5, "+", { size: 13, fill: "#fff", weight: 800 })}`
      : `<circle cx="${cx + dx}" cy="${cy + dy}" r="8.2" fill="#9AA6B8" stroke="#5F6B7E" stroke-width="1.2"/>`;
  });
  return out;
}

export const g2u4NeutralLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 3, cls: "g2u4x-neutral", wait: "전자를 알맞게 넣어 헬륨과 리튬 원자를 완성해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "원자핵과 전자로 나타낸 원자 모형");
  const sum = el("div", { class: "g2u4x-sum" });
  f.stage.appendChild(sum);
  const ROUNDS = [
    { name: "헬륨", p: 2, n: 2 },
    { name: "리튬", p: 3, n: 4 },
  ];
  let idx = 0;
  let e = 0;
  let opened = false;
  let busy = false;

  // 원자: 가운데 (110, 110), 구름 반지름 68. 원자핵 속 확대: 가운데 (276, 76), 반지름 38.
  const AX = 110;
  const AY = 110;
  const draw = (): void => {
    const r = ROUNDS[idx];
    stage.set(`
      ${cloudDefs(stage.ns)}
      ${cloudAtom({ cx: AX, cy: AY, R: 68, p: r.p, e, ns: stage.ns, nr: 19, er: 7, phase: -2.3 })}
      ${txt(AX, 24, `${r.name} 원자`, { size: 14, fill: "#fff", weight: 800 })}
      ${
        opened
          ? core(276, 76, r.p, r.n) +
            txt(276, 22, "원자핵 내부", { size: 12.5, fill: "#FFB4A8" }) +
            `<line x1="${AX + 19}" y1="${AY - 4}" x2="239" y2="84" stroke="#E8836B" stroke-width="1" stroke-dasharray="3 4" opacity=".8"/>` +
            txt(276, 136, `양성자 (+) ${r.p}개`, { size: 12.5, fill: "#FFB4A8" }) +
            txt(276, 154, `중성자 ${r.n}개`, { size: 12.5, fill: "#C6D3E6" })
          : ""
      }
    `);
    const total = r.p - e;
    // 세 알약이 한 줄에 들게 이 랩만 글씨 12px, 안쪽 여백 6px(g2u4v5.css의 .g2u4x-neutral .g2u4x-sum). 전자가 0개면 "−0" 대신 0.
    sum.innerHTML = opened
      ? `<span>양성자 (+)전하: +${r.p}</span><span>전자 (−)전하: ${e === 0 ? "0" : `−${e}`}</span><b class="${total === 0 ? "zero" : ""}">전체 전하의 합: ${signed(total)}</b>`
      : "";
    host.dataset.g4E = String(e);
    host.dataset.g4Round = String(idx);
  };

  const open = bvBtn("main g2u4x-open", "원자핵 속 들여다보기");
  const st = stepper("전자 (−) 개수", "e", (d) => {
    if (busy) return;
    e = Math.max(0, Math.min(6, e + d));
    st.set(`${e}개`);
    draw();
  });
  st.set("0개");
  const fix = bvBtn("main g2u4x-fix", "원자 완성하기");
  open.addEventListener("click", () => {
    tap();
    opened = true;
    draw();
    f.slot.setControls(st.el, fix);
    f.say("원자핵 속에는 (+)전하를 띤 <b>양성자</b>와 전하를 띠지 않는 <b>중성자</b>가 들어 있어요. 이제 (−)전하를 띤 <b>전자</b>를 알맞은 개수만큼 넣어 전기를 띠지 않는 원자를 완성해 보세요.");
  });
  fix.addEventListener("click", () => {
    if (busy) return;
    const r = ROUNDS[idx];
    const total = r.p - e;
    if (total !== 0) {
      bad();
      // 조사는 숫자를 읽는 소리에 맞춘다(+3 '삼'이에요, −2 '이'예요)
      f.say(`현재 전하의 합이 <b>${signed(total)}</b>${ida(signed(total))}. 원자는 전기적으로 중성(전하의 합이 0)이어야 해요. 전자를 ${total > 0 ? "더 추가해" : "줄여"} 보세요.`);
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    busy = true;
    good();
    idx += 1;
    f.pips(idx);
    f.say(`양성자 ${r.p}개의 (+)전하와 전자 ${r.p}개의 (−)전하가 만나 전체 전하의 합이 <b>0</b>이 되었어요! ${r.name} 원자가 완성됐어요.`);
    tm.later(() => {
      if (idx < ROUNDS.length) {
        e = 0;
        st.set("0개");
        busy = false;
        draw();
        f.say(`이번에는 원자핵에 양성자가 3개 들어 있는 <b>${ROUNDS[idx].name} 원자</b>예요. 전자를 몇 개 넣어야 전하의 합이 0이 될까요?`);
        return;
      }
      idx = ROUNDS.length - 1;
      lab.judge(
        "원자핵 속에 양성자가 8개 들어 있는 <b>산소 원자</b>에는 전자가 몇 개 있을까요?",
        [{ t: "8개", ok: true }, { t: "4개" }, { t: "16개" }],
        "양성자의 (+)전하 총합과 전자의 (−)전하 총합이 같아야 전체 전하의 합이 <b>0</b>이 되기 때문이에요.",
        // 수정안의 "주위를 도는 전자"는 궤도를 도는 것처럼 읽혀, 이 랩의 구름 모형(궤도 없음)에 맞게 "주위에 있는 전자"로 둔다
        () => lab.finish("원자는 원자핵 속 <b>양성자의 수와 주위에 있는 전자의 수가 같아서</b> 전기적으로 중성이에요(전기를 띠지 않아요)."),
      );
    }, 1700);
  });
  f.slot.setControls(open);
  draw();
  // 수정안의 "헬륨 원자의 중심부 모형이에요"는 무대가 원자 전체(구름과 원자핵)를 보여서 "헬륨 원자의 모형이에요"로 둔다
  f.say("헬륨 원자의 모형이에요. 한가운데에 있는 <b>원자핵</b> 속에는 어떤 입자들이 들어 있을까요? 아래 버튼을 눌러 들여다보세요.");
  return lab.cleanup;
};

// ── 원자의 종류 ─────────────────────────────────────────────────────
const NAMES: [string, string][] = [["", ""], ["수소", "H"], ["헬륨", "He"], ["리튬", "Li"], ["베릴륨", "Be"], ["붕소", "B"], ["탄소", "C"], ["질소", "N"], ["산소", "O"], ["플루오린", "F"], ["네온", "Ne"]];

export const g2u4KindLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-kind", wait: "양성자, 중성자, 전자를 하나씩 더해 보고 변화를 비교해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "양성자, 중성자, 전자의 수를 바꾸는 원자 모형");
  let p = 1;
  let n = 0;
  let e = 1;
  let busy = false;
  let flash = "";

  // 원자: 가운데 (106, 118), 구름 반지름 72. 원자핵은 알갱이 묶음, +N은 묶음 바로 아래.
  const KX = 106;
  const KY = 118;
  const draw = (): void => {
    const [name, sym] = NAMES[p];
    const charge = p - e;
    const nuc = nucleusCluster(KX, KY, p, n);
    const core = nuc.svg + haloTxt(KX, KY + nuc.R + 15, `+${p}`, 13, "#FFB4A8");
    const avoid = { x0: KX - 14, y0: KY + nuc.R + 3, x1: KX + 14, y1: KY + nuc.R + 18 };
    stage.set(`
      ${cloudDefs(stage.ns)}
      ${cloudAtom({ cx: KX, cy: KY, R: 72, p, e, ns: stage.ns, er: 6.5, rIn: nuc.R + 11, phase: -2.1, core, avoid })}
      <g class="${flash}"><rect x="212" y="26" width="120" height="58" rx="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)"/>
      ${txt(272, 50, name, { size: 17, fill: "#fff", weight: 800 })}${txt(272, 72, `원소 기호 ${sym}`, { size: 12.5 })}</g>
      ${txt(222, 112, `양성자 ${p}개`, { anchor: "start", size: 13, fill: "#FFB4A8" })}
      ${txt(222, 134, `중성자 ${n}개`, { anchor: "start", size: 13 })}
      ${txt(222, 156, `전자 ${e}개`, { anchor: "start", size: 13, fill: "#A8CCFF" })}
      ${txt(222, 184, charge === 0 ? "전하의 합 0" : `전하의 합 ${signed(charge)}`, { anchor: "start", size: 13, fill: charge === 0 ? "#7CF29C" : "#FFE58A", weight: 800 })}
    `);
    host.dataset.g4P = String(p);
    host.dataset.g4E = String(e);
  };

  // 1막: 하나씩 더활동
  const tried = new Set<string>();
  const trials: { k: string; label: string; run: () => string }[] = [
    { k: "p", label: "양성자 1개 더하기", run: () => ((p = 2), "원자의 이름표가 <b>헬륨</b>으로 바뀌었어요! 양성자가 2개가 되자 다른 종류의 원소가 되었네요.") },
    { k: "n", label: "중성자 1개 더하기", run: () => ((n = 1), "원자의 이름표는 그대로 <b>수소</b>예요. 원자핵의 질량만 조금 무거워졌을 뿐 원소의 종류는 바뀌지 않았어요.") },
    { k: "e", label: "전자 1개 더하기", run: () => ((e = 2), "원자의 이름표는 그대로 <b>수소</b>예요. 전체 전하의 합만 −1로 바뀌었을 뿐 원소의 종류는 그대로예요.") },
  ];
  const btns = trials.map((t) => {
    const b = bvBtn("g2u4x-try", t.label);
    b.dataset.k = t.k;
    b.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      tap();
      flash = t.k === "p" ? "g2u4x-flash" : "";
      f.say(t.run());
      draw();
      tried.add(t.k);
      b.classList.add("done");
      tm.later(() => {
        p = 1;
        n = 0;
        e = 1;
        flash = "";
        draw();
        busy = false;
        if (tried.size < 3) {
          f.say("다시 처음의 수소 원자로 되돌렸어요. 아직 확인하지 않은 <b>다른 입자</b>도 더해 보세요.");
          return;
        }
        f.pips(1);
        lab.judge("세 가지 입자 가운데 <b>원자의 종류(이름표)를 바꾼 것</b>은 무엇인가요?", [{ t: "양성자수", ok: true }, { t: "중성자수" }, { t: "전자 수" }], "원자핵 속의 <b>양성자수</b>가 달라지면 다른 종류의 원소가 되기 때문이에요.", build);
      }, 2300);
    });
    return b;
  });

  // 2막: 탄소와 산소 원자 만들기
  const ORDERS = [
    { name: "탄소", p: 6 },
    { name: "산소", p: 8 },
  ];
  let oi = 0;
  const sp = stepper("양성자 개수", "p", (d) => {
    if (busy) return;
    p = Math.max(1, Math.min(10, p + d));
    n = p === 1 ? 0 : p;
    paint();
  });
  const se = stepper("전자 개수", "e", (d) => {
    if (busy) return;
    e = Math.max(0, Math.min(10, e + d));
    paint();
  });
  const fix = bvBtn("main g2u4x-fix", "원자 완성하기");
  function paint(): void {
    sp.set(`${p}개`);
    se.set(`${e}개`);
    draw();
  }
  function build(): void {
    f.pips(2);
    f.slot.setControls(sp.el, se.el, fix);
    paint();
    api.setCTA("양성자수와 전자 수를 조절해 탄소와 산소 원자를 만들어 보세요", { enabled: false });
    f.say("이제 직접 <b>탄소 원자</b>를 만들어 볼까요? 탄소는 원자핵에 양성자가 <b>6개</b> 들어 있어요. 양성자수와 전자 수를 알맞게 맞추어 원자를 완성해 보세요.");
  }
  fix.addEventListener("click", () => {
    if (busy) return;
    const o = ORDERS[oi];
    if (p !== o.p) {
      bad();
      // 조사는 원소 이름의 받침에 맞춘다(수소예요, 헬륨이에요)
      f.say(`현재 양성자가 ${p}개여서 <b>${NAMES[p][0]}</b>${ida(NAMES[p][0])}. <b>${o.name} 원자</b>를 만들려면 양성자를 <b>${o.p}개</b>로 맞추어야 해요.`);
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    if (e !== p) {
      bad();
      f.say(`양성자수는 맞았지만 전하의 합이 <b>${signed(p - e)}</b>${ida(signed(p - e))}. 전기적으로 중성인 원자가 되도록 전자 수를 양성자수와 같게 맞추어 보세요.`);
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    busy = true;
    good();
    oi += 1;
    f.pips(2 + oi);
    if (oi < ORDERS.length) {
      f.say("탄소 원자(양성자 6개, 전자 6개)가 완성되었어요! 이번에는 양성자가 <b>8개</b>인 <b>산소 원자</b>를 만들어 보세요.");
      tm.later(() => (busy = false), 500);
      return;
    }
    tm.later(() => lab.finish("원자의 종류는 원자핵 속 <b>양성자수(원자 번호)</b>에 의해 결정돼요. 예를 들어 수소는 양성자가 1개, 탄소는 6개, 산소는 8개예요."), 900);
  });

  f.slot.setControls(row(...btns));
  draw();
  f.say("양성자 1개와 전자 1개로 이루어진 <b>수소 원자</b>예요. 여기에 어떤 입자를 더하면 다른 원소로 바뀔까요? 세 입자를 차례로 하나씩 더해 보세요.");
  return lab.cleanup;
};
