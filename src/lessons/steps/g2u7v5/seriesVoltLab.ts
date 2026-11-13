// [중2 Ⅶ v5] g2u7l5 seriesVoltLab: 「전압은 어떻게 나뉠까요?」
// 책의 어디에서: 본문(저항을 직렬로 연결하면 전체 전압이 각 저항에 나뉘어 걸린다).
// 한 통찰: 직렬에서는 같은 전류가 두 저항을 지난다. 저항이 클수록 그 전류를 흘리는 데 전압이 더 필요하므로, 전지의 전압은 저항의 크기대로 나뉜다. 더하면 언제나 전지의 전압이다.
// 걸음: ① 10 Ω과 10 Ω의 전압을 잰다(반반) → ② 예측한 뒤 B를 큰 저항으로 바꿔 잰다 → ③ 남은 저항으로도 잰다 → ④ 판정.
// 학생이 정하는 것: 저항 B의 크기, 전압계를 댈 자리.
// 실패하는 길: 한 저항만 재서는 "나눠 가진다"를 볼 수 없다(A와 B를 모두 재야 기록된다).
// 깨려는 생각: "직렬이면 늘 반반이다", "전지에서 가까운 쪽이 더 많이 가져간다".
// 값: 전지 3 V, A는 10 Ω. B가 10 Ω이면 0.15 A, 1.5 V와 1.5 V. 20 Ω이면 0.1 A, 1 V와 2 V. 50 Ω이면 0.05 A, 0.5 V와 2.5 V.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawWire } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { BAT, C, G, cInk, cProbe, cRes, cSpotBox, cTag, hit, type Pt } from "./circuitKit";
import { X, xBox, xCanvas, xFrame, xLog, xSegs, xText, type LabStep } from "./kit";

type RB = "10" | "20" | "50";
const TOP = 104;
const AX = 114; // 저항 A(왼쪽)
const BX = 232; // 저항 B(오른쪽)
const CASES: Record<RB, { amp: string; va: string; vb: string; a: number; b: number; row: string }> = {
  "10": { amp: "0.15", va: "1.5 V", vb: "1.5 V", a: 1.5, b: 1.5, row: "1.5 V + 1.5 V = 3 V" },
  "20": { amp: "0.1", va: "1 V", vb: "2 V", a: 1, b: 2, row: "1 V + 2 V = 3 V" },
  "50": { amp: "0.05", va: "0.5 V", vb: "2.5 V", a: 0.5, b: 2.5, row: "0.5 V + 2.5 V = 3 V" },
};
const ORDER: RB[] = ["10", "20", "50"];
const SPOTS = [
  { id: "A", x: AX, y: TOP },
  { id: "B", x: BX, y: TOP },
];

export const seriesVoltLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let rb: RB = "10";
  let finished = false;
  let asked = false; // 예측을 했는지
  let asking = false;
  let ph = 0;
  const got = new Set<string>(); // 지금 저항에서 잰 자리
  const doneCase = new Set<RB>();
  const log = xLog(ORDER.map((k) => `10 Ω과 ${k} Ω`), 1, true);

  const seg = xSegs<RB>(
    ORDER.map((k) => ({ k, t: `B를 ${k} Ω으로` })),
    "10",
    (k) => apply(k),
    (k) => {
      if (asking || finished) return false;
      if (!doneCase.has("10")) {
        f.say("먼저 지금 회로에서 <b>A와 B</b>의 전압을 모두 재 보세요.");
        return false;
      }
      if (asked) return true;
      predict(k);
      return false;
    },
  );
  f.slot.setControls(seg.el, log.el);

  function apply(k: RB): void {
    rb = k;
    got.clear();
    if (doneCase.has(k)) {
      got.add("A");
      got.add("B");
      f.say(`이미 잰 회로예요. ${CASES[k].row.replace(" = 3 V", "")}, 더하면 <b>3 V</b>였어요.`);
    } else f.say(`B를 <b>${k} Ω</b>으로 바꿨어요. 점선을 눌러 A와 B의 전압을 재 보세요.`);
  }
  function predict(k: RB): void {
    asking = true;
    api.setCTA("먼저 예측해 보세요", { enabled: false });
    f.slot.ask(
      "B를 더 큰 저항으로 바꾸면 B에 걸리는 전압은?",
      [{ t: "1.5 V보다 커져요", ok: true }, { t: "1.5 V 그대로예요" }, { t: "1.5 V보다 작아져요" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          asked = true;
          asking = false;
          f.slot.showControls();
          seg.set(k);
          apply(k);
          api.setCTA("A와 B의 전압을 재 보세요", { enabled: false });
        },
      },
    );
  }
  function measured(): void {
    if (!(got.has("A") && got.has("B")) || doneCase.has(rb)) {
      f.say(got.has("A") ? "A를 쟀어요. 이번에는 <b>B</b>의 전압도 재 보세요." : "B를 쟀어요. 이번에는 <b>A</b>의 전압도 재 보세요.");
      return;
    }
    doneCase.add(rb);
    log.set(ORDER.indexOf(rb), CASES[rb].row);
    f.pips(doneCase.size);
    if (rb === "10") f.say("똑같은 저항은 3 V를 <b>반씩</b> 나눠요. 아래에서 B를 더 큰 저항으로 바꿔 봐요.");
    else if (rb === "20") f.say("B의 저항이 A의 2배가 되자 전압도 <b>2배</b>예요. 더하면 3 V예요.");
    else f.say("B의 저항이 A의 5배가 되자 전압도 <b>5배</b>예요. 더하면 그대로 3 V예요.");
    if (doneCase.size === ORDER.length && !finished) {
      finished = true;
      seg.lock(true);
      api.setCTA("세 경우를 모두 쟀어요", { enabled: false });
      tm.later(ask1, 3000);
    } else if (doneCase.size > 1) api.setCTA("남은 저항으로도 바꿔 재 보세요", { enabled: false });
  }
  st.cv.addEventListener("pointerdown", (e) => {
    if (finished || asking) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const sp = hit(SPOTS.filter((q) => !got.has(q.id)), p.x / k, p.y / k, 34);
    if (!sp) return;
    haptic(HAPTIC.tap);
    got.add(sp.id);
    measured();
  });

  function ask1(): void {
    f.slot.ask(
      "저항이 큰 쪽에 전압이 더 많이 걸린 까닭은?",
      [{ t: "같은 전류를 흘리는 데 전압이 더 들어서", ok: true }, { t: "큰 저항에 전류가 더 세게 흘러서" }, { t: "큰 저항이 전지에 더 가까워서" }],
      (ok) => api.recordQuiz(ok),
      { why: "전류는 같으니 전압 = 전류 × 저항에서 <b>저항이 클수록</b> 커요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "6 V 전지에 10 Ω과 20 Ω을 직렬로 이으면 20 Ω의 전압은?",
      [{ t: "4 V", ok: true }, { t: "3 V" }, { t: "2 V" }],
      () => undefined,
      { why: "저항이 2배라 전압도 2배예요. 6 V를 <b>2 V와 4 V</b>로 나눠요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("직렬연결에서는 전지의 전압을 저항들이 <b>나눠 가져요</b>. 같은 전류가 흐르니 <b>저항이 클수록</b> 더 큰 전압이 걸리고, 모두 더하면 전지의 전압이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    const cs = CASES[rb];
    ph += (dt / 60) * Number(cs.amp) * 10;
    ctx.save();
    ctx.scale(k, k);
    const P = (pts: Pt[]): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on: true, flow: ph, dir: 1, width: 3.5 });
    P([[BAT.out, G.By], [G.R, G.By], [G.R, TOP], [BX + 23, TOP]]);
    P([[BX - 23, TOP], [AX + 23, TOP]]);
    P([[AX - 23, TOP], [G.L, TOP], [G.L, G.By], [BAT.in, G.By]]);
    drawBattery(ctx, BAT.x, G.By, G.bw, 30, false);
    xText(ctx, "전지 3 V", BAT.x, G.By - 25, { px: 12, color: X.dim });
    cRes(ctx, AX, TOP, { name: "A", ohm: "10 Ω", below: true });
    cRes(ctx, BX, TOP, { name: "B", ohm: `${rb} Ω`, below: true });
    // 전압 막대: 전지의 3 V를 두 저항이 어떻게 나눠 갖는지(잰 것만 채운다)
    const bx = 58;
    const bw = 230;
    const by = 34;
    xBox(ctx, bx, by, bw, 16, 8, "rgba(255,255,255,.07)", "rgba(178,204,238,.45)", 1.2);
    const wb = (bw * cs.b) / 3;
    const wa = (bw * cs.a) / 3;
    if (got.has("A")) {
      xBox(ctx, bx, by, wa, 16, 8, "rgba(255,212,0,.85)");
      cInk(ctx, wa > 50 ? `A ${cs.va}` : "A", bx + wa / 2, by + 8.5, "#3A2A00");
    }
    if (got.has("B")) {
      xBox(ctx, bx + wa, by, wb, 16, 8, "rgba(155,232,196,.85)");
      cInk(ctx, `B ${cs.vb}`, bx + wa + wb / 2, by + 8.5, "#0B2A1E");
    }
    xText(ctx, "전지의 전압 3 V", bx, by - 13, { px: 12, color: X.ink, align: "left" });
    xText(ctx, `회로의 전류 ${cs.amp} A`, bx + bw, by - 13, { px: 12, color: X.cur, align: "right" });
    SPOTS.forEach((q) => {
      if (got.has(q.id)) {
        cProbe(ctx, q.x - 23, q.x + 23, TOP, TOP - 30);
        cTag(ctx, q.x, TOP - 30, q.id === "A" ? cs.va : cs.vb, C.volt);
      } else if (!finished && !asking) cSpotBox(ctx, q.x, TOP, C.volt, t);
    });
    ctx.restore();
  });

  f.say("저항 A와 B를 한 줄로 이었어요. <b>점선</b>을 눌러 전압계를 대 보세요.");
  api.setCTA("A와 B의 전압을 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
