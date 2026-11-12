// [중2 Ⅳ v5] g2u4l3 원자 모형 랩 두 판. 책의 해 보기(원자 모형 만들기: 양성자수, 중성자수, 전자 수를 바꾸어 수소, 탄소, 산소 원자 모형을 만든다)를 둘로 나눴다.
//   g2u4NeutralLab 「원자는 왜 전기를 띠지 않을까요?」
//     원자핵 속을 들여다본 뒤((+)전하를 띤 입자와 전하가 없는 입자), 학생이 전자의 수를 정해 원자를 완성한다. 헬륨(+2) → 리튬(+3).
//     실패하는 길: 전하의 합이 0이 아닌 채로 완성하면 남은 전하를 알려 주고 완성되지 않는다.
//   g2u4KindLab 「원자의 종류는 무엇이 정할까요?」
//     수소 원자에 양성자, 중성자, 전자를 하나씩 더해 본다(한 번에 하나만 바꾸고 되돌아온다). 이름표가 바뀌는 것은 양성자뿐이다.
//     이어서 책의 표대로 탄소(양성자 6)와 산소(양성자 8) 원자를 학생이 만든다. 전자 수를 맞추지 않으면 완성되지 않는다.

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { atomModel, bad, bvBtn, g4Lab, g4Svg, good, row, stepper, tap, txt, type G4Step } from "./kit";

const signed = (n: number): string => (n === 0 ? "0" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

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
  const lab = g4Lab(host, api, s, { steps: 3, cls: "g2u4x-neutral", wait: "원자를 완성해 보세요" });
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

  const draw = (): void => {
    const r = ROUNDS[idx];
    stage.set(`
      ${atomModel(112, 108, r.p, e, { nr: 19, r0: 44, gap: 24, er: 7 })}
      ${txt(112, 22, `${r.name} 원자`, { size: 14, fill: "#fff", weight: 800 })}
      ${
        opened
          ? core(276, 76, r.p, r.n) +
            txt(276, 22, "원자핵 속", { size: 12.5, fill: "#FFB4A8" }) +
            `<line x1="131" y1="104" x2="238" y2="80" stroke="#E8836B" stroke-width="1" stroke-dasharray="3 4" opacity=".7"/>` +
            txt(276, 136, `양성자 (+) ${r.p}개`, { size: 12.5, fill: "#FFB4A8" }) +
            txt(276, 154, `중성자 ${r.n}개`, { size: 12.5, fill: "#C6D3E6" })
          : ""
      }
    `);
    const total = r.p - e;
    sum.innerHTML = opened ? `<span>(+) ${r.p}개</span><span>(−) ${e}개</span><b class="${total === 0 ? "zero" : ""}">전하의 합 ${signed(total)}</b>` : "";
    host.dataset.g4E = String(e);
    host.dataset.g4Round = String(idx);
  };

  const open = bvBtn("main g2u4x-open", "원자핵 속 들여다보기");
  const st = stepper("전자 (−)", "e", (d) => {
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
    f.say("원자핵에는 (+)전하를 띤 <b>양성자</b>와 전하가 없는 <b>중성자</b>가 있어요. <b>전자</b>를 넣어 원자를 완성해요.");
  });
  fix.addEventListener("click", () => {
    if (busy) return;
    const r = ROUNDS[idx];
    const total = r.p - e;
    if (total !== 0) {
      bad();
      f.say(`전하의 합이 <b>${signed(total)}</b>이에요. 원자는 전기를 띠지 않아요. 전자를 ${total > 0 ? "더 넣어" : "덜어"} 보세요.`);
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    busy = true;
    good();
    idx += 1;
    f.pips(idx);
    f.say(`(+) ${r.p}개와 (−) ${r.p}개가 만나 전하의 합이 <b>0</b>이에요. ${r.name} 원자가 완성됐어요.`);
    tm.later(() => {
      if (idx < ROUNDS.length) {
        e = 0;
        st.set("0개");
        busy = false;
        draw();
        f.say(`이번에는 양성자가 3개인 <b>${ROUNDS[idx].name}</b>이에요. 전자를 몇 개 넣어야 할까요?`);
        return;
      }
      idx = ROUNDS.length - 1;
      lab.judge("양성자가 8개인 <b>산소 원자</b>에는 전자가 몇 개 있을까요?", [{ t: "8개", ok: true }, { t: "4개" }, { t: "16개" }], "(+)와 (−)의 수가 같아야 합이 <b>0</b>이에요.", () =>
        lab.finish("원자는 <b>양성자수와 전자 수가 같아서</b> 전기를 띠지 않아요."),
      );
    }, 1700);
  });
  f.slot.setControls(open);
  draw();
  f.say("헬륨 원자의 모형이에요. 가운데 <b>원자핵</b> 속에는 무엇이 있을까요? 들여다보세요.");
  return lab.cleanup;
};

// ── 원자의 종류 ─────────────────────────────────────────────────────
const NAMES: [string, string][] = [["", ""], ["수소", "H"], ["헬륨", "He"], ["리튬", "Li"], ["베릴륨", "Be"], ["붕소", "B"], ["탄소", "C"], ["질소", "N"], ["산소", "O"], ["플루오린", "F"], ["네온", "Ne"]];

export const g2u4KindLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-kind", wait: "세 가지를 하나씩 더해 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "양성자, 중성자, 전자의 수를 바꾸는 원자 모형");
  let p = 1;
  let n = 0;
  let e = 1;
  let busy = false;
  let flash = "";

  const draw = (): void => {
    const [name, sym] = NAMES[p];
    const charge = p - e;
    stage.set(`
      ${atomModel(112, 118, p, e, { nr: 19, r0: 40, gap: 22, er: 6.5 })}
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

  // 1막: 하나씩 더해 보기
  const tried = new Set<string>();
  const trials: { k: string; label: string; run: () => string }[] = [
    { k: "p", label: "양성자 +1", run: () => ((p = 2), "이름표가 <b>헬륨</b>으로 바뀌었어요. 양성자가 2개가 되자 다른 원소가 됐어요.") },
    { k: "n", label: "중성자 +1", run: () => ((n = 1), "이름표는 그대로 <b>수소</b>예요. 원자핵이 조금 무거워졌을 뿐이에요.") },
    { k: "e", label: "전자 +1", run: () => ((e = 2), "이름표는 그대로 <b>수소</b>예요. 전하의 합만 −1이 됐어요.") },
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
          f.say("수소 원자로 되돌렸어요. <b>다른 것</b>도 하나 더해 보세요.");
          return;
        }
        f.pips(1);
        lab.judge("원자의 <b>이름표를 바꾼 것</b>은 무엇인가요?", [{ t: "양성자수", ok: true }, { t: "중성자수" }, { t: "전자 수" }], "양성자수가 달라지면 <b>다른 원소</b>가 돼요.", build);
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
  const sp = stepper("양성자", "p", (d) => {
    if (busy) return;
    p = Math.max(1, Math.min(10, p + d));
    n = p === 1 ? 0 : p;
    paint();
  });
  const se = stepper("전자", "e", (d) => {
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
    api.setCTA("탄소와 산소 원자를 만들어 보세요", { enabled: false });
    f.say("이제 <b>탄소 원자</b>를 만들어요. 탄소는 양성자가 <b>6개</b>예요. 중성자는 알맞게 넣어 둘게요.");
  }
  fix.addEventListener("click", () => {
    if (busy) return;
    const o = ORDERS[oi];
    if (p !== o.p) {
      bad();
      f.say(`지금 모형은 <b>${NAMES[p][0]}</b> 원자예요. ${o.name} 원자는 양성자가 <b>${o.p}개</b>예요.`);
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    if (e !== p) {
      bad();
      f.say(`전하의 합이 <b>${signed(p - e)}</b>이에요. 원자가 되려면 전자 수를 양성자수와 맞춰야 해요.`);
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    busy = true;
    good();
    oi += 1;
    f.pips(2 + oi);
    if (oi < ORDERS.length) {
      f.say("탄소 원자가 완성됐어요. 이번에는 양성자가 <b>8개</b>인 <b>산소 원자</b>를 만들어 보세요.");
      tm.later(() => (busy = false), 500);
      return;
    }
    tm.later(() => lab.finish("원자의 종류는 <b>양성자수</b>가 정해요. 수소는 1개, 탄소는 6개, 산소는 8개예요."), 900);
  });

  f.slot.setControls(row(...btns));
  draw();
  f.say("<b>수소 원자</b>예요. 무엇을 더하면 다른 원소가 될까요? 하나씩 더해 보세요.");
  return lab.cleanup;
};
