// [중2 Ⅵ v5] 배설 랩 한 판(g2u6l5).
//
// g2u6NephronLab 「오줌에는 무엇을 담아 내보낼까요?」
//   책의 해 보기 「노폐물의 배설 과정을 모식도로 표현하기」와 그림(오줌이 만들어지는 과정: 여과, 재흡수, 분비).
//   콩팥단위 모식도 위에서 물질 모형(적혈구, 단백질, 포도당, 요소, 물)이 이동한다.
//   학생이 정하는 것: 여과된 액체에서 모세혈관으로 되돌릴 물질(포도당, 물, 요소를 따로 고른다).
//   실패하는 길: 포도당을 되돌리지 않으면 오줌에 포도당이 섞여 나가고, 요소를 되돌리면 노폐물이 혈액에 남고,
//               물을 되돌리지 않으면 몸의 물이 한꺼번에 빠져나간다. 어느 쪽이든 그 오줌이 무대에 보인다.

import type { StepRenderer } from "../../types";
import { P, bad, bvBtn, chip, dot, g6Lab, g6Svg, good, row, tag, tap, toast, txt, type G6Step } from "./kit";

type Kind = "rbc" | "pro" | "glu" | "urea" | "water";
const LOOK: Record<Kind, { r: number; fill: string; line: string; name: string }> = {
  rbc: { r: 9, fill: "#E8505B", line: "#8E1E2A", name: "적혈구" },
  pro: { r: 8, fill: P.protein, line: "#8A4520", name: "단백질" },
  glu: { r: 5, fill: P.glucose, line: "#8A5A0A", name: "포도당" },
  urea: { r: 5, fill: P.urea, line: "#5B3A9A", name: "요소" },
  water: { r: 4.5, fill: P.water, line: "#1E5E96", name: "물" },
};
interface Tok {
  kind: Kind;
  /** 여과 전 토리 안의 자리 */
  g: [number, number];
  /** 여과된 뒤 세뇨관 안의 자리(여과되지 않는 것은 null) */
  t: [number, number] | null;
  /** 모세혈관 안의 자리(여과되지 않고 남거나 재흡수된 뒤) */
  c: [number, number];
  /** 처음에는 혈액에 남았다가 분비되는 요소 */
  secrete?: boolean;
}
// 세뇨관은 y 44~70의 가로 관, 모세혈관은 y 112~138의 가로 관이다.
const TOKS: Tok[] = [
  { kind: "rbc", g: [46, 70], t: null, c: [100, 125] },
  { kind: "pro", g: [66, 88], t: null, c: [124, 125] },
  { kind: "glu", g: [44, 94], t: [136, 57], c: [148, 121] },
  { kind: "glu", g: [70, 62], t: [176, 57], c: [166, 129] },
  { kind: "water", g: [56, 80], t: [156, 52], c: [184, 121] },
  { kind: "water", g: [38, 82], t: [196, 62], c: [202, 129] },
  { kind: "water", g: [76, 76], t: [216, 52], c: [220, 121] },
  { kind: "water", g: [58, 60], t: [256, 62], c: [238, 129] },
  { kind: "urea", g: [52, 104], t: [236, 57], c: [256, 121] },
  { kind: "urea", g: [80, 98], t: [276, 57], c: [272, 129] },
  { kind: "urea", g: [34, 68], t: null, c: [84, 125], secrete: true },
];

export const g2u6NephronLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 4, cls: "g2u6x-nephron", wait: "오줌을 만들어 내보내 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "토리와 보먼주머니, 세뇨관, 세뇨관을 둘러싼 모세혈관으로 이루어진 콩팥단위 모식도");
  let phase: "start" | "filtered" | "out" = "start";
  const back: Record<"glu" | "water" | "urea", boolean> = { glu: false, water: false, urea: false };
  let secreted = false;
  let busy = false;

  /** 지금 이 알갱이가 있는 곳. */
  const place = (t: Tok, i: number): { at: "glom" | "tube" | "cap" | "urine"; p: [number, number] } => {
    if (phase === "start") return { at: "glom", p: t.g };
    if (!t.t) {
      if (t.secrete && secreted) return phase === "out" ? { at: "urine", p: [316, 140] } : { at: "tube", p: [296, 57] };
      return { at: "cap", p: t.c };
    }
    const k = t.kind as "glu" | "water" | "urea";
    // 물은 대부분만 되돌린다(넷 가운데 셋).
    const goBack = back[k] && !(k === "water" && i === 7);
    if (goBack) return { at: "cap", p: t.c };
    if (phase === "out") return { at: "urine", p: [309 + (i % 2) * 14, 150 + (i % 4) * 11] };
    return { at: "tube", p: t.t };
  };
  const draw = (): void => {
    let out = "";
    // 모세혈관(토리에서 나와 세뇨관 아래를 지난다)
    out += `<path d="M78 104 Q84 125 104 125 L286 125" fill="none" stroke="#7A2F3C" stroke-width="28" stroke-linecap="round"/><path d="M78 104 Q84 125 104 125 L286 125" fill="none" stroke="#3A1820" stroke-width="23" stroke-linecap="round"/>`;
    // 세뇨관(보먼주머니에서 오른쪽으로, 끝에서 아래로 꺾여 콩팥깔때기로)
    out += `<path d="M96 57 L316 57 L316 188" fill="none" stroke="#C9B26A" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><path d="M96 57 L316 57 L316 188" fill="none" stroke="#2A2616" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 보먼주머니와 토리
    out += `<path d="M98 40 A44 44 0 1 0 98 116" fill="none" stroke="#C9B26A" stroke-width="5" stroke-linecap="round"/>`;
    out += `<circle cx="58" cy="80" r="34" fill="#3A1820" stroke="#7A2F3C" stroke-width="3"/>`;
    out += `<path d="M6 80 L24 80" stroke="#7A2F3C" stroke-width="12" stroke-linecap="round"/>`;
    // 이름표
    out += tag(58, 22, "토리", { size: 12 }) + tag(40, 142, "보먼주머니", { size: 12 }) + tag(206, 28, "세뇨관", { size: 12 }) + tag(196, 158, "모세혈관", { size: 12 });
    out += txt(316, 222, "오줌", { size: 12.5, fill: "#F2DE8A", weight: 800 });
    // 알갱이
    TOKS.forEach((t, i) => {
      const pl = place(t, i);
      const lk = LOOK[t.kind];
      out += dot(pl.p[0], pl.p[1], lk.r, lk.fill, lk.line, "g2u6x-pop");
    });
    // 범례
    let lx = 16;
    (Object.keys(LOOK) as Kind[]).forEach((k) => {
      const lk = LOOK[k];
      out += dot(lx, 200, Math.min(lk.r, 6), lk.fill, lk.line) + txt(lx + 10, 204, lk.name, { anchor: "start", size: 12, fill: P.hi });
      lx += 22 + lk.name.length * 12;
    });
    stage.set(out);
    host.dataset.g6Stage = phase;
    host.dataset.g6Back = `${back.glu ? 1 : 0}${back.water ? 1 : 0}${back.urea ? 1 : 0}`;
  };

  const filter = bvBtn("main g2u6x-filter", "혈액을 토리로 흘려보내기");
  const urine = bvBtn("main g2u6x-urine", "오줌으로 내보내기");
  const mk = (k: "glu" | "water" | "urea", name: string): ReturnType<typeof chip> => {
    const c = chip(k, name, "세뇨관에 둠", () => {
      if (busy || phase !== "filtered") return;
      tap();
      back[k] = !back[k];
      c.on(back[k]);
      c.sub(back[k] ? "모세혈관으로 되돌림" : "세뇨관에 둠");
      draw();
    });
    return c;
  };
  const cGlu = mk("glu", "포도당");
  const cWater = mk("water", "물");
  const cUrea = mk("urea", "요소");

  filter.addEventListener("click", () => {
    if (phase !== "start") return;
    good();
    phase = "filtered";
    f.pips(1);
    draw();
    f.say("작은 포도당, 요소, 물만 <b>보먼주머니</b>로 빠져나왔어요. 큰 적혈구와 단백질은 혈액에 남았어요.");
    f.slot.setControls(row(cGlu.el, cWater.el, cUrea.el), urine);
    tm.later(() => f.say("세뇨관을 지나는 동안 <b>몸에 필요한 것</b>은 모세혈관으로 되돌려요. 무엇을 되돌릴까요?"), 3200);
  });
  const fail = (kind: string, msg: string, say: string): void => {
    bad();
    lab.slip();
    busy = true;
    host.dataset.g6Fail = kind;
    phase = "out";
    draw();
    toast(lab, msg, true);
    f.say(say);
    tm.later(() => {
      phase = "filtered";
      busy = false;
      draw();
    }, 2400);
  };
  urine.addEventListener("click", () => {
    if (busy || phase !== "filtered") return;
    if (!back.glu) return fail("glu", "오줌에 포도당이 섞였어요", "포도당은 몸에 필요한 <b>영양소</b>예요. 오줌으로 버리지 말고 모세혈관으로 되돌려요.");
    if (back.urea) return fail("urea", "요소가 혈액으로 되돌아갔어요", "요소는 내보내야 할 <b>노폐물</b>이에요. 되돌리지 말고 세뇨관에 두어요.");
    if (!back.water) return fail("water", "물이 너무 많이 빠져나갔어요", "물은 몸에 꼭 필요해요. <b>대부분</b>을 모세혈관으로 되돌려요.");
    busy = true;
    host.dataset.g6Fail = "";
    good();
    f.pips(2);
    secreted = true;
    draw();
    f.say("혈액에 남아 있던 요소도 모세혈관에서 세뇨관으로 나왔어요. 이 이동이 <b>분비</b>예요.");
    tm.later(() => {
      phase = "out";
      f.pips(3);
      draw();
      f.say("요소와 남은 물이 <b>오줌</b>이 되어 콩팥깔때기로 나갔어요.");
      tm.later(() => {
        lab.judge("보먼주머니로 빠져나왔지만 <b>오줌에는 없는</b> 물질은?", [{ t: "포도당", ok: true }, { t: "요소" }, { t: "적혈구" }], "포도당은 세뇨관에서 모세혈관으로 <b>모두</b> 되돌아가요.", () =>
          lab.finish("오줌은 <b>여과, 재흡수, 분비</b>를 거쳐 만들어져요. 큰 적혈구와 단백질은 여과되지 않고, 포도당은 모두 재흡수되어 오줌에 없어요."),
        );
      }, 1900);
    }, 2400);
  });
  f.slot.setControls(filter);
  draw();
  f.say("혈액이 실뭉치 같은 <b>토리</b>에 들어왔어요. 버튼을 눌러 혈액을 흘려보내요.");
  return lab.cleanup;
};
