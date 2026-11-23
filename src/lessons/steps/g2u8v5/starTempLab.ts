// [중2 Ⅷ v5] g2u8l4 starTempLab: 「별의 색은 무엇이 정할까요?」
// 다루는 내용: 본문(표면 온도가 낮은 별은 붉은색 빛을, 높은 별은 파란색 빛을 더 많이 낸다), 활동 과정 2(시리우스, 안타레스, 알데바란의 색 비교하기).
// 한 통찰: 별의 색은 표면 온도가 정한다. 표면 온도가 낮을수록 붉고 높을수록 하얗고 파랗다.
// 학생이 정하는 것: 별의 표면 온도. 세 별의 색에 맞을 때까지 온도를 맞춘다(색이 다르면 맞지 않는다).
// 두 빛의 양은 온도에 따른 빛의 세기 식(파장 650 nm와 450 nm)으로 계산한다.
// 별의 칠은 개념 그림의 일곱 색(적색, 주황색, 황색, 황백색, 백색, 청백색, 청색)이다. 색 이름의 구간(K)마다 그 색이고,
// 구간의 경계 가까이(±120 K)에서만 이웃 색과 부드럽게 잇는다. 그래서 무대의 별과 아래 글자의 색 이름이 늘 맞고, 맞출 별의 점도 같은 색에서 뽑는다.
// (흑체 근사색은 3000~6500 ℃가 살구색과 흰색 사이에 몰려 색 이름과 어긋났다.) 무대 아래 가장자리에 일곱 색 띠와 지금 자리를 둔다.
// 화면의 온도는 ℃로 적는다(중2는 켈빈을 배우지 않는다). 계산은 켈빈(℃ + 273)으로 한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { josa, rgb, S, sBox, sCanvas, sDisk, sFrame, sLog, sText, type LabStep } from "./kit";

type C3 = [number, number, number];
const KELVIN = (i: number): number => 3000 + i * 100 + 273; // 막대의 한 칸은 100 ℃, 3000 ℃에서 12000 ℃까지
const celsius = (k: number): number => Math.round((k - 273) / 100) * 100;
/** 일곱 색. 어두운 무대에서 이름대로 읽히게 조금 진하게 맞췄다. */
const BAND: { name: string; c: C3 }[] = [
  { name: "적색", c: [244, 96, 58] },
  { name: "주황색", c: [255, 162, 38] },
  { name: "황색", c: [255, 222, 92] },
  { name: "황백색", c: [247, 241, 196] },
  { name: "백색", c: [236, 242, 249] },
  { name: "청백색", c: [190, 216, 250] },
  { name: "청색", c: [120, 170, 240] },
];
/** 색 구간의 경계(K). 청색은 이 막대(12000 ℃)보다 훨씬 뜨거운 별이라 띠에만 보인다. */
const EDGE = [3700, 5200, 6000, 7500, 10000, 25000];
/** 띠에서 각 구간이 차지하는 온도(K)의 양 끝. 가장 차가운 쪽과 가장 뜨거운 쪽은 이 랩에서 쓰는 만큼만 잡았다. */
const LO = [2700, ...EDGE];
const HI = [...EDGE, 40000];
const bandIndex = (k: number): number => EDGE.filter((e) => k >= e).length;
const colorName = (k: number): string => BAND[bandIndex(k)].name;
const mixC = (a: C3, b: C3, t: number): C3 => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as C3;
/** 표면 온도(K)의 색: 구간마다 그 색, 경계의 ±120 K에서만 이웃 색과 섞는다. */
const BLEND = 120;
function bandColor(k: number): C3 {
  const i = bandIndex(k);
  if (i > 0 && k < EDGE[i - 1] + BLEND) return mixC(BAND[i - 1].c, BAND[i].c, 0.5 + (k - EDGE[i - 1]) / (2 * BLEND));
  if (i < EDGE.length && k > EDGE[i] - BLEND) return mixC(BAND[i].c, BAND[i + 1].c, 0.5 - (EDGE[i] - k) / (2 * BLEND));
  return BAND[i].c;
}
const planck = (nm: number, k: number): number => 1 / ((nm / 1000) ** 5 * (Math.exp(14388 / ((nm / 1000) * k)) - 1));
const TARGETS = [
  { name: "안타레스", color: "적색", k: 3473 },
  { name: "알데바란", color: "주황색", k: 3873 },
  { name: "시리우스", color: "백색", k: 9873 },
];

export const starTempLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let k = KELVIN(30);
  let kShow = k;
  let cur = 0; // 맞출 별의 차례
  let finished = false;
  const log = sLog(TARGETS.map((t) => t.name), 3, true);
  const bSet = bvBtn("main", "이 온도로 색 맞추기");
  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 90,
    value: 30,
    label: "별의 표면 온도 (℃)",
    ticks: ["3000 ℃", "6000 ℃", "9000 ℃", "12000 ℃"],
    onInput: (v) => {
      k = KELVIN(v);
    },
  });
  f.slot.setControls(range.el, bSet, log.el);

  const brief = (): void => f.say(`<b>${josa(TARGETS[cur].name, "과", "와")}</b> 같은 색(${TARGETS[cur].color})이 되도록 슬라이더로 <b>표면 온도</b>를 조절한 뒤 아래 버튼을 눌러 보세요.`);
  bSet.addEventListener("click", () => {
    if (finished) return;
    const t = TARGETS[cur];
    const mine = colorName(k);
    if (mine !== t.color) {
      haptic(HAPTIC.wrong);
      f.say(`현재 별의 색은 <b>${mine}</b>이에요. ${josa(t.name, "은", "는")} <b>${t.color}</b> 별이므로 표면 온도를 더 <b>${k > t.k ? "낮춰" : "높여"}</b> 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    log.set(cur, `${t.color}`);
    cur += 1;
    f.pips(cur);
    if (cur < 3) {
      f.say(`정확해요! ${t.color} 별인 ${t.name}의 표면 온도는 <b>약 ${celsius(t.k)} ℃</b>예요. 다음은 <b>${TARGETS[cur].name}(${TARGETS[cur].color})</b>의 온도를 맞춰 보세요.`);
    } else {
      finished = true;
      cur = 2;
      bSet.disabled = true;
      range.input.disabled = true;
      f.say(`정확해요! ${t.color} 별인 ${t.name}의 표면 온도는 <b>약 ${celsius(t.k)} ℃</b>예요. 이제 세 별의 색과 온도를 비교해 볼까요?`);
      tm.later(askFinal, 1700);
    }
  });

  function askFinal(): void {
    f.say("안타레스(적색), 알데바란(주황색), 시리우스(백색)의 표면 온도를 모두 찾았어요!");
    f.slot.ask(
      "관측한 세 별 가운데 표면 온도가 가장 높은 별은 어느 것인가요?",
      [{ t: "백색 별 시리우스", ok: true }, { t: "적색 별 안타레스" }, { t: "주황색 별 알데바란" }],
      (ok) => api.recordQuiz(ok),
      // 이유 글은 HTML로 들어가므로 부등호는 &lt;로 적는다
      { why: "표면 온도는 적색(안타레스, 약 3200 ℃) &lt; 주황색(알데바란, 약 3600 ℃) &lt; 백색(시리우스, <b>약 9600 ℃</b>) 순으로 높았어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("별은 표면 온도가 낮을수록 붉은색, 높을수록 흰색과 파란색을 띤다는 것을 확인했어요!");
    f.slot.conclude("별의 색깔은 별의 <b>표면 온도</b>에 따라 결정돼요. 표면 온도가 낮을수록 붉은색 빛을 많이 내어 <b>붉게</b> 보이고, 표면 온도가 높을수록 파란색 빛을 많이 내어 <b>희거나 파랗게</b> 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    kShow += (k - kShow) * Math.min(1, dt * 0.25);
    const col = bandColor(kShow);
    // 내 별
    const cx = 86;
    const cy = h / 2 + 12;
    const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 70);
    g.addColorStop(0, rgb(col, 0.55));
    g.addColorStop(1, rgb(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 180, h);
    sDisk(ctx, cx, cy, 34, rgb(col));
    sText(ctx, `${celsius(kShow)} ℃`, cx, cy + 54, { color: "#fff", px: 14, w: 800 });
    sText(ctx, colorName(kShow), cx, cy + 72, { color: S.gold, px: 13, w: 800 });
    // 맞출 별 셋
    TARGETS.forEach((t, i) => {
      const x = 30 + i * 54;
      const done = i < cur || finished;
      sDisk(ctx, x, 26, 11, rgb(bandColor(t.k)), i === cur && !finished ? "#fff" : undefined, 2);
      sText(ctx, t.name, x, 48, { color: i === cur && !finished ? "#fff" : done ? S.ok : S.dim, px: 12, w: i === cur ? 800 : 700 });
    });
    // 별이 내는 두 빛의 양
    const r = planck(650, kShow);
    const b = planck(450, kShow);
    const m = Math.max(r, b);
    const bx = w - 132;
    const base = h - 40;
    const top = 44;
    sText(ctx, "별이 내는 빛", bx + 55, 24, { color: S.dim, px: 12 });
    [
      { v: r / m, c: "#FF6B5C", n: "붉은색 빛" },
      { v: b / m, c: "#6FA8FF", n: "파란색 빛" },
    ].forEach((bar, i) => {
      const x = bx + i * 60;
      const hh = bar.v * (base - top);
      sBox(ctx, x + 6, top, 38, base - top, 6, "rgba(255,255,255,.06)");
      sBox(ctx, x + 6, base - hh, 38, hh, 6, bar.c);
      sText(ctx, bar.n, x + 25, base + 15, { color: S.ink, px: 12 });
    });
    // 무대 아래 가장자리: 일곱 색 띠(왼쪽이 낮은 온도)와 지금 온도의 자리
    const lx = 14;
    const lw = w - 28;
    const ly = h - 9;
    const seg = lw / BAND.length;
    BAND.forEach((band, i) => {
      ctx.fillStyle = rgb(band.c);
      ctx.fillRect(lx + i * seg + (i ? 0.5 : 0), ly, seg - (i < BAND.length - 1 ? 1 : 0), 5);
    });
    const bi = bandIndex(kShow);
    const mx = lx + (bi + Math.max(0, Math.min(1, (kShow - LO[bi]) / (HI[bi] - LO[bi])))) * seg;
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(11,21,36,.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, ly - 1);
    ctx.lineTo(mx - 5, ly - 8);
    ctx.lineTo(mx + 5, ly - 8);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  });

  brief();
  api.setCTA("세 별의 색을 맞춰 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
