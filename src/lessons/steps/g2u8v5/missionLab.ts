// [중2 Ⅷ v5] g2u8l8 missionLab: 「우주 탐사는 얼마나 멀리까지 갔을까요?」
// 책의 어디에서: 그림 '우주 탐사 사례'(1957년 스푸트니크 1호, 1969년 아폴로 11호, 1990년 허블 우주 망원경, 1998년 국제 우주 정거장 건설, 2015년 뉴호라이즌스호 명왕성 통과).
// 한 통찰: 우주 탐사는 지구 둘레에서 시작해 달, 태양계의 바깥쪽까지 넓어졌다.
// 학생이 정하는 것: 어느 탐사를 먼저 보낼지(자료 조사형. 보내는 차례는 자유이고 연표에는 해의 차례로 놓인다).
// 실사: NASA의 사진(스푸트니크 1호 모형, 아폴로 11호, 허블 우주 망원경, 국제 우주 정거장, 뉴호라이즌스호가 찍은 명왕성).
// 무대: 위는 거리 띠(지구, 달, 명왕성은 실사 원판 disk-*.webp)와 거리 숫자(약 400 km, 약 38만 km, 약 50억 km). 간격은 실제 거리와 달라
//       달과 명왕성 사이를 물결로 끊었다. 보낸 탐사의 이름은 닿은 곳 아래에 쌓인다(판정 때도 남는다).
//       아래는 연표: 해마다 보낸 탐사의 사진을 작은 원으로 달고, 고른 것은 크게 금색 테로. 오른쪽 가운데에 고른 탐사의 사진.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sDisk, sFrame, sLine, starPhoto, sText, type LabStep } from "./kit";

const M = [
  { k: "sp", name: "스푸트니크 1호", year: 1957, zone: 0, file: "sputnik.webp", what: "인류 최초의 인공위성으로 지구 궤도를 돌며 전파를 보냈어요.", alt: "공 모양 몸통에 안테나가 달린 인공위성" },
  { k: "ap", name: "아폴로 11호", year: 1969, zone: 1, file: "apollo11.webp", what: "인류 최초로 우주 비행사가 달 표면에 착륙했어요.", alt: "달 표면에 선 우주 비행사" },
  { k: "hb", name: "허블 우주 망원경", year: 1990, zone: 0, file: "hubble-telescope.webp", what: "지구 둘레를 돌며 대기의 방해 없이 선명한 우주 사진을 찍어요.", alt: "지구 위에 떠 있는 원통 모양 망원경" },
  { k: "is", name: "국제 우주 정거장", year: 1998, zone: 0, file: "iss.webp", what: "우주 비행사가 오래 머물며 과학 실험을 하는 우주 정거장이에요.", alt: "태양 전지판을 펼친 우주 정거장" },
  { k: "nh", name: "뉴호라이즌스호", year: 2015, zone: 2, file: "pluto.webp", what: "무인 탐사선이 태양계 바깥쪽의 명왕성 가까이 날아가 표면 사진을 찍었어요.", alt: "탐사선이 찍은 명왕성" },
];
const ZONES = ["지구 둘레", "달", "명왕성"];
const DIST = ["약 400 km", "약 38만 km", "약 50억 km"];
const ZX = [34, 152, 300]; // 거리 띠에서 닿는 곳의 가로 자리
const BAND_Y = 40;

export const missionLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 5, api });
  const st = sCanvas(f.stage);
  const pic = el("img", { class: "g2u8x-shot", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  f.stage.appendChild(pic);
  const tm = bvTimers();

  const load = (file: string): HTMLImageElement => {
    const im = new Image();
    im.decoding = "async";
    im.src = starPhoto(file);
    return im;
  };
  const DISK = [load("disk-earth.webp"), load("disk-moon.webp"), load("disk-pluto.webp")];
  const THUMB = M.map((m) => load(m.file));
  const ready = (im: HTMLImageElement): boolean => im.complete && im.naturalWidth > 0;
  /** 원판 실사(못 받으면 단색 원). */
  const disk = (ctx: CanvasRenderingContext2D, i: number, x: number, y: number, r: number, fallback: string): void => {
    if (ready(DISK[i])) ctx.drawImage(DISK[i], x - r, y - r, r * 2, r * 2);
    else sDisk(ctx, x, y, r, fallback);
  };
  /** 탐사 사진을 둥글게 잘라(가운데 정사각) 작은 원으로. */
  const thumb = (ctx: CanvasRenderingContext2D, i: number, x: number, y: number, r: number, ring: string, lw: number): void => {
    const im = THUMB[i];
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#1B2547";
    ctx.fill();
    if (ready(im)) {
      ctx.clip();
      const sq = Math.min(im.naturalWidth, im.naturalHeight);
      ctx.drawImage(im, (im.naturalWidth - sq) / 2, (im.naturalHeight - sq) / 2, sq, sq, x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
    sDisk(ctx, x, y, r, "rgba(0,0,0,0)", ring, lw);
  };

  const sent = new Set<number>();
  let cur = -1;
  let fly = 1; // 날아간 정도 0~1
  let finished = false;
  const cards = M.map((m) => bvCard("g2u8x-c", { name: m.name, sub: "눌러서 탐사 기록 보기", key: m.k }));
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
    f.say("1957년 스푸트니크 1호부터 2015년 뉴호라이즌스호까지 다섯 탐사 기록을 모두 살펴보았어요!");
    f.slot.ask(
      "살펴본 다섯 가지 우주 탐사 중 지구에서 가장 먼 곳까지 날아간 것은 무엇인가요?",
      [{ t: "뉴호라이즌스호", ok: true }, { t: "아폴로 11호" }, { t: "허블 우주 망원경" }],
      (ok) => api.recordQuiz(ok),
      { why: "허블 우주 망원경은 지구 둘레, 아폴로 11호는 달(약 38만 km), <b>뉴호라이즌스호</b>는 약 50억 km 떨어진 <b>명왕성</b>까지 날아갔어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("인류의 우주 탐사가 지구 궤도에서 시작해 달과 태양계 바깥쪽까지 점점 넓어졌다는 것을 확인했어요!");
    f.slot.conclude("우주 탐사는 1957년 첫 인공위성에서 시작해 <b>달 착륙</b>, 우주 망원경과 우주 정거장을 거쳐 <b>태양계의 바깥쪽</b>까지 넓어졌어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    fly = Math.min(1, fly + dt / 55);
    // 거리 띠: 지구에서 지구 둘레, 달, 명왕성까지(간격은 실제 거리와 달라 달과 명왕성 사이를 물결로 끊었다)
    sLine(ctx, ZX[0] + 24, BAND_Y, 222, BAND_Y, S.line, 1.4, [3, 5]);
    sLine(ctx, 236, BAND_Y, ZX[2] - 10, BAND_Y, S.line, 1.4, [3, 5]);
    ctx.save();
    ctx.strokeStyle = "rgba(232,238,249,.6)";
    ctx.lineWidth = 1.6;
    [222, 230].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x - 3, BAND_Y + 7);
      ctx.quadraticCurveTo(x - 6, BAND_Y + 2, x, BAND_Y);
      ctx.quadraticCurveTo(x + 6, BAND_Y - 2, x + 3, BAND_Y - 7);
      ctx.stroke();
    });
    ctx.restore();
    // 지구 둘레(궤도 고리), 달, 명왕성
    const reached = (z: number): boolean => [...sent].some((j) => M[j].zone === z);
    ctx.save();
    ctx.strokeStyle = reached(0) ? S.gold : "rgba(232,238,249,.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(ZX[0], BAND_Y, 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    disk(ctx, 0, ZX[0], BAND_Y, 15, S.earth);
    disk(ctx, 1, ZX[1], BAND_Y, 9, "#B9C0CC");
    disk(ctx, 2, ZX[2], BAND_Y, 8, "#D9B49A");
    ZONES.forEach((z, i) => {
      const on = reached(i);
      sText(ctx, z, ZX[i], 11, { color: on ? S.gold : S.ink, px: 12, w: on ? 800 : 700 });
      sText(ctx, DIST[i], ZX[i], 68, { color: on ? "#fff" : S.dim, px: 12, w: 800 });
    });
    // 닿은 곳 아래에 보낸 탐사의 이름(해의 차례로)
    ZONES.forEach((_, z) => {
      const names = M.map((m, j) => ({ m, j })).filter(({ m, j }) => m.zone === z && sent.has(j));
      names.forEach(({ m, j }, r) => {
        const x = z === 0 ? 8 : z === 1 ? ZX[1] : w - 10;
        sText(ctx, m.name, x, 86 + r * 15, { color: j === cur ? "#fff" : S.gold, px: 12, w: j === cur ? 800 : 700, align: z === 0 ? "left" : z === 1 ? "center" : "right" });
      });
    });
    sText(ctx, "간격은 실제 거리와 달라요", ZX[1] + 8, 142, { color: S.dim, px: 12 });
    // 날아가는 탐사선: 지구 둘레면 고리를 한 바퀴 돌고, 달과 명왕성이면 띠를 따라 날아간다
    if (cur >= 0 && fly < 1) {
      const z = M[cur].zone;
      if (z === 0) {
        const a = -Math.PI / 2 + fly * Math.PI * 2;
        sDisk(ctx, ZX[0] + Math.cos(a) * 21, BAND_Y + Math.sin(a) * 21, 3.5, "#fff");
      } else {
        const tx = ZX[z] - (z === 1 ? 11 : 10);
        const x = ZX[0] + 22 + (tx - ZX[0] - 22) * fly;
        const y = BAND_Y - Math.sin(fly * Math.PI) * 18;
        sDisk(ctx, x, y, 3.5, "#fff");
        sLine(ctx, x - 9, y + 3, x - 3, y + 1, "rgba(255,255,255,.5)", 2);
      }
    }
    // 고른 탐사의 사진 자리(사진은 무대 위의 img가 덮는다)
    if (cur < 0) {
      sBox(ctx, w - 114, 94, 104, 78, 10, "rgba(255,255,255,.04)", "rgba(255,255,255,.18)", 1);
      sText(ctx, "사진", w - 62, 133, { color: S.dim, px: 12 });
    }
    // 연표: 해마다 보낸 탐사의 사진이 작은 원으로 쌓인다(고른 것은 크게)
    const tx0 = 30;
    const tx1 = w - 30;
    const ty = h - 34;
    sText(ctx, "연표", 14, ty - 22, { color: S.dim, px: 12, align: "left" });
    sLine(ctx, 14, ty, w - 14, ty, S.line, 1.4);
    const order = M.map((_, i) => i).sort((a, b) => (a === cur ? 1 : b === cur ? -1 : 0));
    order.forEach((i) => {
      const m = M[i];
      const x = tx0 + ((m.year - 1957) / (2015 - 1957)) * (tx1 - tx0);
      if (!sent.has(i)) {
        sDisk(ctx, x, ty, 3, "rgba(255,255,255,.3)");
        return;
      }
      const big = i === cur;
      thumb(ctx, i, x, ty, big ? 15 : 11, big ? S.gold : "rgba(255,209,102,.8)", big ? 2.4 : 1.6);
      sText(ctx, String(m.year), x, ty + (big ? 25 : 21), { color: big ? "#fff" : S.gold, px: 12, w: 800 });
    });
  });

  f.say("인류가 우주로 보낸 탐사 다섯 가지예요. 카드를 눌러 하나씩 <b>보내 보고</b>, 언제 어디까지 갔는지 확인해 보세요.");
  api.setCTA("다섯 탐사를 모두 보내 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
