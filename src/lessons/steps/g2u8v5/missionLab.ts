// [중2 Ⅷ v5] g2u8l8 missionLab: 「우주 탐사는 얼마나 멀리까지 갔을까요?」
// 책의 어디에서: 그림 '우주 탐사 사례'(1957년 스푸트니크 1호, 1969년 아폴로 11호, 1990년 허블 우주 망원경, 1998년 국제 우주 정거장 건설, 2015년 뉴호라이즌스호 명왕성 통과).
// 한 통찰: 우주 탐사는 지구 둘레에서 시작해 달, 태양계의 끝까지 넓어졌다.
// 학생이 정하는 것: 어느 탐사를 먼저 보낼지(자료 조사형. 보내는 차례는 자유이고 연표에는 해의 차례로 놓인다).
// 실사: NASA의 사진(스푸트니크 1호 모형, 아폴로 11호, 허블 우주 망원경, 국제 우주 정거장, 뉴호라이즌스호가 찍은 명왕성).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sFrame, sLine, starPhoto, sText, type LabStep } from "./kit";

const M = [
  { k: "sp", name: "스푸트니크 1호", year: 1957, zone: 0, file: "sputnik.webp", what: "최초의 인공위성이 지구 둘레를 돌았어요.", alt: "공 모양 몸통에 안테나가 달린 인공위성" },
  { k: "ap", name: "아폴로 11호", year: 1969, zone: 1, file: "apollo11.webp", what: "사람이 처음으로 달에 내렸어요.", alt: "달 표면에 선 우주 비행사" },
  { k: "hb", name: "허블 우주 망원경", year: 1990, zone: 0, file: "hubble-telescope.webp", what: "지구 둘레를 돌며 먼 우주를 찍어요.", alt: "지구 위에 떠 있는 원통 모양 망원경" },
  { k: "is", name: "국제 우주 정거장", year: 1998, zone: 0, file: "iss.webp", what: "사람이 머물며 실험하는 곳을 짓기 시작했어요.", alt: "태양 전지판을 펼친 우주 정거장" },
  { k: "nh", name: "뉴호라이즌스호", year: 2015, zone: 2, file: "pluto.webp", what: "태양계 끝의 명왕성 곁을 지나며 사진을 찍었어요.", alt: "탐사선이 찍은 명왕성" },
];
const ZONES = ["지구 둘레", "달", "명왕성"];

export const missionLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 5, api });
  const st = sCanvas(f.stage);
  const pic = el("img", { class: "g2u8x-shot", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  f.stage.appendChild(pic);
  const tm = bvTimers();

  const sent = new Set<number>();
  let cur = -1;
  let fly = 1; // 날아간 정도 0~1
  let finished = false;
  const cards = M.map((m) => bvCard("g2u8x-c", { name: m.name, sub: "아직 보내지 않았어요", key: m.k }));
  f.slot.setControls(bvCards(2, ...cards));

  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      if (finished || sent.has(i)) return;
      haptic(HAPTIC.tap);
      cur = i;
      fly = 0;
      const m = M[i];
      pic.src = starPhoto(m.file);
      pic.alt = m.alt;
      pic.classList.add("on");
      cards.forEach((x, j) => x.on(j === i));
      c.done();
      c.sub(`${m.year}년, ${ZONES[m.zone]}`);
      sent.add(i);
      f.pips(sent.size);
      f.say(`<b>${m.year}년 ${m.name}</b>: ${m.what}`);
      if (sent.size === 5) {
        finished = true;
        tm.later(askFinal, 2600);
      }
    }),
  );

  function askFinal(): void {
    f.say("연표와 거리를 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "다섯 탐사 가운데 지구에서 가장 멀리 간 것은?",
      [{ t: "뉴호라이즌스호", ok: true }, { t: "아폴로 11호" }, { t: "허블 우주 망원경" }],
      (ok) => api.recordQuiz(ok),
      { why: "지구 둘레, 달을 지나 <b>명왕성</b>까지 갔어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("조사 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("우주 탐사는 1957년 첫 인공위성에서 시작해 <b>달 착륙</b>, 우주 망원경과 우주 정거장을 거쳐 <b>태양계의 끝</b>까지 넓어졌어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    fly = Math.min(1, fly + dt / 55);
    const left = 14;
    const right = w - 128;
    // 거리 띠: 지구에서 지구 둘레, 달, 명왕성까지(간격은 실제 거리와 다르다)
    const ay = 78;
    const zx = [left + 58, left + 122, right - 8];
    sLine(ctx, left + 20, ay, right, ay, S.line, 1.4, [3, 5]);
    sDisk(ctx, left + 12, ay, 11, S.earth, "#fff", 1.5);
    sText(ctx, "지구", left + 12, ay + 24, { color: S.ink, px: 12 });
    ZONES.forEach((z, i) => {
      const reached = [...sent].some((j) => M[j].zone === i);
      sDisk(ctx, zx[i], ay, i === 0 ? 3 : i === 1 ? 6 : 5, reached ? S.gold : "rgba(255,255,255,.3)");
      sText(ctx, z, zx[i], ay - 18, { color: reached ? S.gold : S.dim, px: 12, w: reached ? 800 : 700 });
    });
    sText(ctx, "간격은 실제 거리와 달라요", left, ay + 46, { color: S.dim, px: 12, align: "left" });
    // 날아가는 탐사선
    if (cur >= 0) {
      const tx = zx[M[cur].zone];
      const x = left + 12 + (tx - left - 12) * fly;
      const y = ay - Math.sin(fly * Math.PI) * 22;
      sDisk(ctx, x, y, 4, "#fff");
      sLine(ctx, x - 10, y + 3, x - 3, y + 1, "rgba(255,255,255,.5)", 2);
    }
    // 연표(해의 차례로 놓인다)
    const ty = h - 40;
    sLine(ctx, left, ty, right, ty, S.line, 1.4);
    M.forEach((m, i) => {
      const x = left + 10 + ((m.year - 1957) / (2015 - 1957)) * (right - left - 24);
      const on = sent.has(i);
      sDisk(ctx, x, ty, on ? 5 : 3, on ? (i === cur ? "#fff" : S.gold) : "rgba(255,255,255,.3)");
      if (on) sText(ctx, String(m.year), x, ty + (i % 2 ? -16 : 17), { color: i === cur ? "#fff" : S.gold, px: 12, w: 800 });
    });
    sText(ctx, "연표", left, ty - 30, { color: S.dim, px: 12, align: "left" });
    if (cur < 0) sText(ctx, "사진", w - 64, h / 2, { color: S.dim, px: 12 });
  });

  f.say("인류가 우주로 보낸 탐사 다섯 가지예요. 카드를 눌러 하나씩 <b>보내 보고</b>, 언제 어디까지 갔는지 확인해 보세요.");
  api.setCTA("다섯 탐사를 모두 보내 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
