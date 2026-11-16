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
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
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
    ORDER.map((k) => ({ k, t: `저항 B: ${k} Ω` })),
    "10",
    (k) => apply(k),
    (k) => {
      if (asking || finished) return false;
      if (!doneCase.has("10")) {
        f.say("먼저 현재 연결된 회로에서 점선을 눌러 <b>저항 A와 B</b>의 전압을 모두 측정해 보세요.");
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
      f.say(`이미 측정한 조건이에요(${CASES[k].row.replace(" = 3 V", "")}). 두 전압을 더하면 전체 전압인 <b>3.0 V</b>가 돼요.`);
    } else f.say(`저항 B를 <b>${k} Ω</b>으로 바꿨어요. 점선을 눌러 저항 A와 B에 걸리는 전압을 각각 재 보세요.`);
  }
  function predict(k: RB): void {
    asking = true;
    api.setCTA("먼저 예측해 보세요", { enabled: false });
    f.slot.ask(
      "저항 B를 10 Ω보다 더 큰 저항으로 바꾸면 B에 걸리는 전압은 어떻게 될까요?",
      [{ t: "1.5 V보다 커져요", ok: true }, { t: "1.5 V 그대로 유지돼요" }, { t: "1.5 V보다 작아져요" }],
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
      f.say(got.has("A") ? "저항 A의 전압을 쟀어요. 이제 <b>저항 B</b>의 점선도 눌러 전압을 재 보세요." : "저항 B의 전압을 쟀어요. 이제 <b>저항 A</b>의 점선도 눌러 전압을 재 보세요.");
      return;
    }
    doneCase.add(rb);
    log.set(ORDER.indexOf(rb), CASES[rb].row);
    f.pips(doneCase.size);
    if (rb === "10") f.say("두 저항의 크기가 같으면 전체 전압 3.0 V를 <b>1.5 V씩 똑같이</b> 나눠 가져요. 이제 아래에서 저항 B를 더 큰 값으로 바꿔 보세요.");
    else if (rb === "20") f.say("저항 B(20 Ω)가 A(10 Ω)의 2배가 되자 걸리는 전압도 <b>2배(2.0 V)</b>가 되었어요. 두 전압을 더하면 전체 전압인 3.0 V예요.");
    else f.say("저항 B(50 Ω)가 A(10 Ω)의 5배가 되자 걸리는 전압도 <b>5배(2.5 V)</b>가 되었어요. 합은 여전히 3.0 V예요.");
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
      "직렬연결에서 저항이 큰 쪽에 더 큰 전압이 걸리는 까닭은 무엇인가요?",
      [{ t: "같은 전류를 흘리는 데 더 큰 전압이 필요해서", ok: true }, { t: "저항이 큰 쪽에 전류가 더 세게 흐르기 때문에" }, { t: "저항이 큰 쪽이 전지에 더 가까이 연결되어 있어서" }],
      (ok) => api.recordQuiz(ok),
      { why: "직렬 회로에서는 두 저항에 같은 세기의 전류가 흐르므로, 옴의 법칙(V = IR)에 따라 <b>저항이 클수록</b> 걸리는 전압도 커요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "6 V 전지에 10 Ω 저항과 20 Ω 저항을 직렬로 연결하면, 20 Ω 저항에 걸리는 전압은 몇 V일까요?",
      [{ t: "4 V", ok: true }, { t: "3 V" }, { t: "2 V" }],
      () => undefined,
      { why: "저항의 비가 1 : 2이므로 전압도 1 : 2로 나뉘어요. 전체 전압 6 V가 <b>2 V와 4 V</b>로 나뉘어 20 Ω에는 4 V가 걸려요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("직렬 회로에서는 전체 전압이 각 저항의 크기에 비례해 나뉜다는 것을 확인했어요!");
    f.slot.conclude("직렬연결에서는 전체 전압이 각 저항에 <b>나누어 걸려요</b>. 두 저항에 흐르는 전류의 세기가 같으므로 <b>저항이 클수록</b> 더 큰 전압이 걸리며, 각 저항에 걸리는 전압의 합은 전체 전압과 같아요.");
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

  f.say("저항 A와 B를 한 줄(직렬)로 연결했어요. 각 저항 위의 <b>점선 상자</b>를 눌러 전압계를 연결해 보세요.");
  api.setCTA("A와 B의 전압을 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
