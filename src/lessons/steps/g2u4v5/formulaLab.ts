// [중2 Ⅳ v5] g2u4l2 화학식 쓰기 랩: 「모형을 보고 화학식을 써 볼까요?」
// 책의 해 보기(지구 환경에 영향을 미치는 물질을 화학식으로 표현하기): 이산화 탄소, 메테인, 오존.
// 학생이 정하는 것: 어떤 원소 기호를 몇 번 넣을지(기호를 누를 때마다 그 원자의 개수가 하나씩 는다). 개수 1은 숫자를 쓰지 않는다.
// 실패하는 길: 모형과 다른 식을 정하면 어느 원자가 몇 개 어긋났는지 알려 주고 모형의 그 원자가 깜빡인다.
// 판정: 방금 쓴 세 식 가운데 원소는 어느 것인가(기호가 한 종류뿐인 식). 결론: 화학식은 원자의 종류와 개수를 알려 준다.

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { bad, ball, bond, bvBtn, g4Lab, g4Svg, good, row, tap, txt, type G4Step } from "./kit";

type Comp = Record<string, number>;
interface Target {
  name: string;
  note: string;
  comp: Comp;
  art: (hot: string) => string;
}
const KO: Record<string, string> = { C: "탄소", H: "수소", O: "산소" };
const ORDER = ["C", "H", "O"];
const CX = 173;
const CY = 96;
const hotCls = (sym: string, hot: string): string => (sym === hot ? "g2u4x-blink" : "");

const TARGETS: Target[] = [
  {
    name: "이산화 탄소",
    note: "지구를 데우는 기체",
    comp: { C: 1, O: 2 },
    art: (hot) => bond(CX - 44, CY, CX + 44, CY) + ball(CX - 44, CY, "O", { k: 1.7, cls: hotCls("O", hot) }) + ball(CX + 44, CY, "O", { k: 1.7, cls: hotCls("O", hot) }) + ball(CX, CY, "C", { k: 1.7, cls: hotCls("C", hot) }),
  },
  {
    name: "메테인",
    note: "소의 트림에도 들어 있는 기체",
    comp: { C: 1, H: 4 },
    art: (hot) => {
      const hs: [number, number][] = [[-40, -30], [40, -30], [-40, 34], [40, 34]];
      return hs.map(([dx, dy]) => bond(CX, CY, CX + dx, CY + dy)).join("") + hs.map(([dx, dy]) => ball(CX + dx, CY + dy, "H", { k: 1.7, cls: hotCls("H", hot) })).join("") + ball(CX, CY, "C", { k: 1.7, cls: hotCls("C", hot) });
    },
  },
  {
    name: "오존",
    note: "자외선을 막아 주는 기체",
    comp: { O: 3 },
    art: (hot) => bond(CX - 40, CY + 18, CX, CY - 14) + bond(CX + 40, CY + 18, CX, CY - 14) + [[-40, 18], [0, -14], [40, 18]].map(([dx, dy]) => ball(CX + dx, CY + dy, "O", { k: 1.7, cls: hotCls("O", hot) })).join(""),
  },
];

const sub = (n: number): string => (n > 1 ? `<sub>${n}</sub>` : "");
const html = (c: Comp): string => ORDER.filter((k) => c[k]).map((k) => `${k}${sub(c[k])}`).join("") || "?";

export const g2u4FormulaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-formula", wait: "세 물질의 화학식을 써 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "원자 모형으로 나타낸 물질");
  const out = el("div", { class: "g2u4x-fm-out" });
  f.stage.appendChild(out);
  let idx = 0;
  let comp: Comp = {};
  let busy = false;

  const draw = (hot = ""): void => {
    const t = TARGETS[idx];
    stage.set(`${txt(CX, 24, t.name, { size: 15, fill: "#fff", weight: 800 })}${txt(CX, 42, t.note, { size: 12.5 })}${t.art(hot)}`);
    out.innerHTML = `<span>화학식</span><b>${html(comp)}</b>`;
    host.dataset.g4Fm = ORDER.filter((k) => comp[k]).map((k) => `${k}${comp[k]}`).join("");
    host.dataset.g4Round = String(idx);
  };

  const chips = ORDER.map((k) => {
    const b = bvBtn("g2u4x-fm-chip", "");
    b.innerHTML = `<b>${k}</b><i>${KO[k]}</i>`;
    b.dataset.k = k;
    b.addEventListener("click", () => {
      if (busy) return;
      if ((comp[k] ?? 0) >= 4) return;
      tap();
      comp = { ...comp, [k]: (comp[k] ?? 0) + 1 };
      draw();
    });
    return b;
  });
  const clear = bvBtn("g2u4x-fm-clear", "지우기");
  const fix = bvBtn("main g2u4x-fm-fix", "이 식으로 정하기");
  clear.addEventListener("click", () => {
    if (busy) return;
    tap();
    comp = {};
    draw();
  });
  fix.addEventListener("click", () => {
    if (busy) return;
    const t = TARGETS[idx];
    const off = ORDER.find((k) => (comp[k] ?? 0) !== (t.comp[k] ?? 0));
    if (off) {
      bad();
      const have = comp[off] ?? 0;
      const want = t.comp[off] ?? 0;
      f.say(want === 0 ? `모형에 <b>${KO[off]} 원자</b>는 없어요. 지우고 다시 써 보세요.` : `모형의 <b>${KO[off]} 원자</b>는 ${want}개인데 식에는 ${have}개예요. 모형을 다시 세어 보세요.`);
      draw(want ? off : "");
      host.dataset.g4Miss = String(Number(host.dataset.g4Miss ?? 0) + 1);
      return;
    }
    busy = true;
    good();
    const one = ORDER.find((k) => t.comp[k] === 1);
    f.say(one ? `<b>${t.name}</b>의 화학식이에요. ${KO[one]} 원자는 1개라서 숫자 1을 쓰지 않았어요.` : `<b>${t.name}</b>의 화학식이에요. 산소 원자 3개를 작은 숫자 3으로 나타냈어요.`);
    idx += 1;
    f.pips(idx);
    tm.later(() => {
      if (idx < TARGETS.length) {
        comp = {};
        busy = false;
        draw();
        f.say(`이번에는 <b>${TARGETS[idx].name}</b>예요. 모형의 원자를 세어 화학식을 써 보세요.`);
        return;
      }
      lab.judge("방금 쓴 세 화학식 가운데 <b>원소</b>는 어느 것인가요?", [{ t: "O₃ (오존)", ok: true }, { t: "CO₂ (이산화 탄소)" }, { t: "CH₄ (메테인)" }], "기호가 <b>한 종류</b>뿐이면 원소예요.", () =>
        lab.finish("화학식을 보면 물질을 이루는 <b>원자의 종류와 개수</b>를 알 수 있어요. 원소인지 화합물인지도 가릴 수 있어요."),
      );
    }, 1900);
  });
  f.slot.setControls(row(...chips), row(clear, fix));
  draw();
  f.say("<b>이산화 탄소</b>의 모형이에요. 기호를 눌러 식을 써요. 누를 때마다 개수가 하나씩 늘어요.");
  return lab.cleanup;
};
