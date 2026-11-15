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
  urea: { r: 5, fill: P.urea, line: "#4E7A2A", name: "요소" },
  water: { r: 4.5, fill: P.water, line: "#1E5E96", name: "물" },
};
// 무대(2026-11-15 다시 그림, 그래픽 감사 C089): 책의 그림 「오줌이 만들어지는 과정」처럼 모세혈관이 위에서 세뇨관을 따라 감싸고(고리 셋)
// 콩팥정맥으로 나가며, 세뇨관 끝은 콩팥깔때기로 이어져 오줌이 아래에 넓게 모인다. 알갱이가 옮겨 간 자리에는 여과, 재흡수, 분비 화살이 그 이름과 함께 남는다.
// 토리 가운데 (72, 112), 세뇨관은 y 112의 가로 관(오른쪽 끝에서 아래로 꺾여 콩팥깔때기), 모세혈관 띠는 y 50.
const G: [number, number] = [72, 112];
const TUBE_Y = 112;
const CAP_Y = 50;
/** 세뇨관을 감싸는 모세혈관 고리의 가운데 x: 포도당, 물, 요소가 이 고리에서 오간다 */
const LOOP = { glu: 152, water: 202, urea: 252 };
/** 여과, 재흡수, 분비 화살의 색(책 그림의 주황, 초록, 갈색 주황) */
const ARROW = { filt: "#F59F4C", reab: "#3DBB72", secr: "#C9853A" };
interface Tok {
  kind: Kind;
  /** 여과 전 토리 안의 자리 */
  g: [number, number];
  /** 여과된 뒤 세뇨관 안의 자리(여과되지 않는 것은 null) */
  t: [number, number] | null;
  /** 모세혈관 안의 자리(여과되지 않고 남거나 재흡수된 뒤) */
  c: [number, number];
  /** 오줌으로 콩팥깔때기에 모인 자리 */
  u?: [number, number];
  /** 처음에는 혈액에 남았다가 분비되는 요소 */
  secrete?: boolean;
}
const TOKS: Tok[] = [
  { kind: "rbc", g: [64, 104], t: null, c: [96, CAP_Y] },
  { kind: "pro", g: [82, 120], t: null, c: [118, CAP_Y] },
  { kind: "glu", g: [62, 122], t: [138, 108], c: [146, CAP_Y - 1] },
  { kind: "glu", g: [84, 100], t: [164, 116], c: [160, CAP_Y + 2] },
  { kind: "water", g: [72, 112], t: [190, 106], c: [192, CAP_Y - 1] },
  { kind: "water", g: [58, 112], t: [212, 117], c: [206, CAP_Y + 2] },
  { kind: "water", g: [88, 112], t: [226, 107], c: [218, CAP_Y - 1] },
  { kind: "water", g: [72, 126], t: [240, 115], c: [230, CAP_Y + 2], u: [286, 194] },
  { kind: "urea", g: [70, 96], t: [256, 108], c: [246, CAP_Y - 1], u: [278, 180] },
  { kind: "urea", g: [56, 100], t: [274, 116], c: [260, CAP_Y + 2], u: [304, 190] },
  { kind: "urea", g: [86, 128], t: null, c: [272, CAP_Y], u: [322, 180], secrete: true },
];

export const g2u6NephronLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 4, cls: "g2u6x-nephron", wait: "오줌을 만들어 내보내 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "토리와 보먼주머니, 세뇨관, 세뇨관을 감싸고 콩팥정맥으로 나가는 모세혈관, 오줌이 모이는 콩팥깔때기로 이루어진 콩팥단위 모식도");
  let phase: "start" | "filtered" | "out" = "start";
  const back: Record<"glu" | "water" | "urea", boolean> = { glu: false, water: false, urea: false };
  let secreted = false;
  let busy = false;

  /** 지금 이 알갱이가 있는 곳. */
  const place = (t: Tok, i: number): { at: "glom" | "tube" | "cap" | "urine"; p: [number, number] } => {
    if (phase === "start") return { at: "glom", p: t.g };
    if (!t.t) {
      if (t.secrete && secreted) return phase === "out" ? { at: "urine", p: t.u ?? [306, 190] } : { at: "tube", p: [LOOP.urea + 14, TUBE_Y] };
      return { at: "cap", p: t.c };
    }
    const k = t.kind as "glu" | "water" | "urea";
    // 물은 대부분만 되돌린다(넷 가운데 셋).
    const goBack = back[k] && !(k === "water" && i === 7);
    if (goBack) return { at: "cap", p: t.c };
    if (phase === "out") return { at: "urine", p: t.u ?? [276 + (i % 3) * 22, 176 + (i % 4) * 7] };
    return { at: "tube", p: t.t };
  };
  /** 굵은 화살(위아래) */
  const vArrow = (x: number, y0: number, y1: number, color: string): string => {
    const d = y1 > y0 ? 1 : -1;
    return `<g class="g2u6x-pop"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1 - d * 8}" stroke="${color}" stroke-width="3.6" stroke-linecap="round"/><polygon points="${x},${y1} ${x - 6},${y1 - d * 10} ${x + 6},${y1 - d * 10}" fill="${color}" stroke="#0B1524" stroke-width=".8"/></g>`;
  };
  const draw = (): void => {
    let out = "";
    const vessel = (d: string, w: number): string => `<path d="${d}" fill="none" stroke="#7A2F3C" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#4A1C26" stroke-width="${w - 5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 콩팥동맥에서 토리로 들어오는 혈관(왼쪽 아래)과, 토리에서 나와 위로 올라가 모세혈관 띠가 되는 혈관(오른쪽 끝에서 콩팥정맥으로)
    out += vessel("M-4 182 Q30 172 46 136", 13);
    out += vessel(`M50 92 Q36 62 70 ${CAP_Y} L352 ${CAP_Y}`, 16);
    // 세뇨관(보먼주머니에서 오른쪽으로, 끝에서 아래로 꺾여 콩팥깔때기로)
    const TUBE = `M104 ${TUBE_Y} L302 ${TUBE_Y} L302 150`;
    out += `<path d="${TUBE}" fill="none" stroke="#C9B26A" stroke-width="30" stroke-linejoin="round"/>`;
    // 콩팥깔때기: 오줌이 넓게 모이는 곳
    out += `<path d="M264 156 Q264 148 274 148 L330 148 Q340 148 340 158 L340 196 Q340 210 326 210 L278 210 Q264 210 264 196 Z" fill="#2A2616" stroke="#C9B26A" stroke-width="3.5"/>`;
    if (phase === "out") out += `<path class="g2u6x-pop" d="M268 170 Q302 162 336 170 L336 196 Q336 206 326 206 L278 206 Q268 206 268 196 Z" fill="#F2DE8A" opacity=".24"/>`;
    out += `<path d="${TUBE}" fill="none" stroke="#2A2616" stroke-width="25" stroke-linejoin="round"/><rect x="290" y="140" width="24" height="18" fill="#2A2616"/>`;
    // 보먼주머니: 토리를 감싸는 주머니(왼쪽이 혈관 쪽으로 열려 있고 오른쪽은 세뇨관으로 이어진다)
    out += `<path d="M48 80 Q60 70 76 72 Q108 76 110 104 L110 120 Q106 150 76 152 Q58 152 46 142" fill="#2A2616" stroke="#C9B26A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    // 토리: 모세혈관이 실뭉치처럼 뭉친 곳
    out +=
      `<circle cx="${G[0]}" cy="${G[1]}" r="27" fill="#4A1C26"/>` +
      [0, 36, 72, 108, 144].map((r) => `<ellipse cx="${G[0]}" cy="${G[1]}" rx="25" ry="11" fill="none" stroke="#C24A5A" stroke-width="4.2" transform="rotate(${r} ${G[0]} ${G[1]})"/>`).join("") +
      `<circle cx="${G[0]}" cy="${G[1]}" r="27" fill="none" stroke="#7A2F3C" stroke-width="2.4"/>`;
    // 세뇨관을 감싸는 모세혈관 고리(세뇨관 위에 그린다)
    Object.values(LOOP).forEach((x) => {
      const d = `M${x - 14} ${CAP_Y + 6} L${x - 14} ${TUBE_Y + 18} Q${x - 14} ${TUBE_Y + 26} ${x} ${TUBE_Y + 26} Q${x + 14} ${TUBE_Y + 26} ${x + 14} ${TUBE_Y + 18} L${x + 14} ${CAP_Y + 6}`;
      out += `<path d="${d}" fill="none" stroke="#7A2F3C" stroke-width="6.5" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#4A1C26" stroke-width="3" stroke-linejoin="round"/>`;
    });
    // 이름표
    out += txt(8, 198, "콩팥동맥", { size: 12, fill: "#F0A0AA", anchor: "start" });
    out += `<polygon points="346,${CAP_Y} 336,${CAP_Y - 6} 336,${CAP_Y + 6}" fill="#F0A0AA"/>` + txt(340, 30, "콩팥정맥", { size: 12, fill: "#F0A0AA", anchor: "end" });
    out += `<line x1="62" y1="26" x2="70" y2="84" stroke="#8CA2C0" stroke-width="1.2"/>` + tag(54, 21, "토리", { size: 12 });
    out += `<line x1="66" y1="160" x2="72" y2="153" stroke="#8CA2C0" stroke-width="1.2"/>` + tag(56, 172, "보먼주머니", { size: 12 });
    out += tag(176, 21, "모세혈관", { size: 12 }) + `<line x1="176" y1="28" x2="176" y2="${CAP_Y - 8}" stroke="#8CA2C0" stroke-width="1.2"/>`;
    out += tag(300, 85, "세뇨관", { size: 12 });
    out += txt(302, 226, "콩팥깔때기", { size: 12, fill: "#F2DE8A", weight: 800 });
    if (phase === "out") out += txt(302, 166, "오줌", { size: 12.5, fill: "#F2DE8A", weight: 800 });
    // 여과, 재흡수, 분비: 일어난 자리에 화살과 이름이 남는다
    if (phase !== "start")
      out +=
        `<g class="g2u6x-pop"><path d="M84 112 L99 112 M84 104 L98 98 M84 120 L98 126" stroke="${ARROW.filt}" stroke-width="3" stroke-linecap="round"/><polygon points="105,112 97,107.5 97,116.5" fill="${ARROW.filt}"/><polygon points="104,95 95,95.5 100,103" fill="${ARROW.filt}"/><polygon points="104,129 100,121 95,128.5" fill="${ARROW.filt}"/></g>` +
        txt(124, 160, "여과", { size: 12.5, fill: ARROW.filt, weight: 800 });
    const reab = (["glu", "water", "urea"] as const).filter((k) => phase !== "start" && back[k]);
    reab.forEach((k) => (out += vArrow(LOOP[k], TUBE_Y - 12, CAP_Y + 10, ARROW.reab)));
    if (reab.length) out += txt(LOOP[reab[0]] - 20, 84, "재흡수", { size: 12.5, fill: ARROW.reab, weight: 800, anchor: "end" });
    if (secreted) out += vArrow(LOOP.urea + 14, CAP_Y + 10, TUBE_Y - 12, ARROW.secr) + txt(LOOP.urea - 6, 160, "분비", { size: 12.5, fill: ARROW.secr, weight: 800 });
    // 알갱이
    TOKS.forEach((t, i) => {
      const pl = place(t, i);
      const lk = LOOK[t.kind];
      out += dot(pl.p[0], pl.p[1], lk.r, lk.fill, lk.line, "g2u6x-pop");
    });
    // 범례
    let lx = 14;
    (Object.keys(LOOK) as Kind[]).forEach((k) => {
      const lk = LOOK[k];
      out += dot(lx, 218, Math.min(lk.r, 6), lk.fill, lk.line) + txt(lx + 10, 222, lk.name, { anchor: "start", size: 12, fill: P.hi });
      lx += 21 + lk.name.length * 12.2;
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
    toast(lab, msg, true, true);
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
