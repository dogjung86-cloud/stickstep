// [도입 샘플 1] u2l4 longcell: 「유난히 긴 세포, 얼마나 길까?」
// 형식: 내기를 먼저 걸고, 손으로 확인한다. 길이를 손이 움직인 거리로 겪는다.
//   1 처음 화면에서 바로 예측(정오를 매기지 않는다. 답은 손이 알려 준다)
//   2 무대의 띠를 왼쪽으로 밀면 허리에서 시작한 신경세포가 줄자 위로 계속 이어진다. 내 예측에는 깃발이 꽂혀 있다.
//     아이의 다리에서는 같은 세포가 발끝 쪽으로 자란다(지금 몸의 어디쯤인지).
//   3 발끝(100 cm)에 닿으면 끝. 쌤이 예측과 견주어 말하고 "이 길쭉한 세포는 무슨 일을 맡았을까"로 랩에 넘긴다
//     (랩 「세포마다 왜 모양이 다를까?」의 첫 일이 먼 곳까지 신호 보내기다. 도입은 답을 말하지 않는다).
// 예측 보기 셋은 모두 길이이고 몸에 견준 말로 쓴다(손가락, 한 뼘, 다리). 굵기나 너비를 섞지 않고, 셋 다 세포치고는 긴 쪽에 둔다
//   (제목이 이미 긴 세포라고 말하므로 짧은 보기는 스스로 지워진다).
// 과학 가드: 머리에서 발끝까지 한 세포가 잇는 것은 아니다. 허리에서 발끝까지 이어지는 신경세포가 약 1 m다.
//   더 긴 신경세포도 있다는 자료가 있어 "가장 긴 세포"라고 하지 않는다(output/intro-redesign/research).
//   굵기는 머리카락보다 훨씬 가늘어 맨눈에 보이지 않는다(1번 레슨의 "세포는 작다"와 어긋나지 않게 함께 말한다).
//   세포의 몸은 허리 쪽 등뼈 속에 있다. 정면 그림이라 배 속으로 읽히지 않게 글이 "허리 등뼈 속"이라고 말한다.
//   그림은 길이만 줄자에 맞췄고 세포의 몸과 굵기는 보이게 키웠다. 무대에 그렇게 적어 둔다(.opn-lc-note).
// 밀기는 포인터 끌기(관성 있음), 누르기(12 cm씩), 방향 키로 된다. 움직임은 CSS와 setTimeout만 쓴다.

import { clamp, el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const PICKS = [
  { t: "다리 길이쯤 (약 1 m)", cm: 100, vs: "" },
  { t: "한 뼘쯤 (약 20 cm)", cm: 20, vs: "예측한 한 뼘의 <b>다섯 배</b>예요." },
  { t: "손가락 길이쯤 (약 7 cm)", cm: 7, vs: "예측한 손가락 길이의 <b>열네 배</b>쯤이에요." },
];

export function longCell(c: OpenerCtx): void {
  const M = c.meta.longcell;
  const S = c.meta.stage;
  const MAX = 100 * M.cm; // 띠를 끝까지 민 거리(무대 단위)
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

  const kid = el("div", { class: "opn-layer", html: c.art.longcellKid });
  const world = el("div", { class: "opn-lc-world", html: c.art.longcellWorld, style: { width: pct(M.worldW, M.bandW) } });
  const pin = el("div", { class: "opn-lc-pin" }, el("span", { text: "내 예측" }));
  const band = el("div", { class: "opn-lc-band", style: { left: pct(M.bandX, S.w), top: pct(M.bandY, S.h), width: pct(M.bandW, S.w), height: pct(M.bandH, S.h) } }, world, pin);
  const cap = el("span", { class: "opn-lc-cap", text: "이 세포의 길이" });
  const num = el("b", { class: "opn-lc-cm", text: "?" });
  const about = el("span", { class: "opn-lc-about", text: "약 " }); // 발끝에 닿았을 때만 보인다(사람마다 다른 길이다)
  const where = el("span", { class: "opn-lc-where", text: "" });
  // 그림의 축척 알림: 길이만 줄자에 맞고 세포의 몸과 굵기는 보이게 키웠다
  const note = el("span", { class: "opn-lc-note", text: "세포는 실제보다 굵게 그렸어요" });
  const read = el("div", { class: "opn-lc-read" }, cap, el("div", { class: "opn-lc-val" }, about, num, el("span", { text: " cm" })), where, note);
  // 허리라는 이름표(정면 그림이라 배 속의 세포로 읽히지 않게)
  const waist = el("div", { class: "opn-tag opn-lc-waist", text: "허리", style: { left: pct(M.back[0] + 100, S.w), top: pct(M.back[1] + 10, S.h) } });
  c.stage.append(kid, band, read, waist);
  c.stage.setAttribute("role", "slider");
  c.stage.setAttribute("aria-label", "세포를 따라가기");
  c.stage.setAttribute("aria-valuemin", "0");
  c.stage.setAttribute("aria-valuemax", "100");

  const trace = kid.querySelector<SVGPathElement>(".opn-lc-trace");
  const tip = kid.querySelector<SVGCircleElement>(".opn-lc-tip");
  const total = trace?.getTotalLength() ?? 0;

  let phase: "ask" | "pull" | "done" = "ask";
  let pos = 0;
  let lastTen = 0;
  let pred = PICKS[0];
  let said = 0;

  const WHERE: Array<[number, string]> = [
    [6, "허리에서 출발"],
    [46, "허벅지를 지나요"],
    [62, "무릎을 지나요"],
    [88, "종아리를 지나요"],
    [99.5, "발목을 지나요"],
    [1000, "발끝에 닿았어요"],
  ];

  function paint(): void {
    const cm = pos / M.cm;
    world.style.transform = `translateX(${(-pos / M.worldW) * 100}%)`;
    // 내 예측 깃발은 띠와 함께 움직이되 가림막 위에 얹는다(창 밖으로 나가면 숨긴다)
    const px = M.zeroX + pred.cm * M.cm - pos;
    pin.style.left = `${(px / M.bandW) * 100}%`;
    pin.style.visibility = px < 24 || px > M.bandW - 4 ? "hidden" : "visible";
    if (trace) trace.style.strokeDasharray = `${cm} 100`;
    if (trace && tip && total) {
      const p = trace.getPointAtLength((total * cm) / 100);
      tip.setAttribute("cx", String(Math.round(p.x * 10) / 10));
      tip.setAttribute("cy", String(Math.round(p.y * 10) / 10));
    }
    if (phase !== "ask") {
      num.textContent = String(Math.round(cm));
      where.textContent = (WHERE.find(([lim]) => cm < lim) ?? WHERE[0])[1];
    }
    c.stage.classList.toggle("moved", pos > 40);
    if (phase === "pull") {
      // 미는 동안 쌤이 한마디씩 거든다(두 줄 안쪽이라 화면이 밀리지 않는다)
      const line = cm >= 86 ? 3 : cm >= 62 ? 2 : pred.cm < 100 && cm >= pred.cm + 4 ? 1 : 0;
      if (line !== said) {
        said = line;
        if (line === 1) c.say("내 예측은 <b>벌써 지났어요</b>. 세포는 아직 이어져요. 계속 밀어 보세요!");
        else if (line === 2) c.say("<b>무릎</b>을 지났어요. 세포는 아직 이어져요. 계속 밀어 보세요!");
        else if (line === 3) c.say("거의 다 왔어요. 조금만 더!");
      }
    }
    c.stage.setAttribute("aria-valuenow", String(Math.round(cm)));
    c.step.dataset.opnCm = String(Math.round(cm));
    const ten = Math.floor(cm / 10);
    if (ten !== lastTen) {
      lastTen = ten;
      haptic(HAPTIC.tap);
    }
  }

  function arrive(): void {
    if (phase !== "pull") return;
    phase = "done";
    c.stage.classList.add("done");
    c.stage.classList.remove("pull");
    cap.textContent = "허리에서 발끝까지";
    haptic(HAPTIC.correct);
    c.face("surprised");
    const head = pred.cm === 100 ? "예측대로 <b>약 1 m</b>!" : `<b>약 1 m</b>! ${pred.vs}`;
    c.say(`${head} 그래도 머리카락보다 가늘어 눈에는 안 보여요. 이 길쭉한 세포는 무슨 <b>일</b>을 맡았을까요?`);
    c.finish();
  }

  function move(next: number): void {
    if (phase !== "pull") return;
    pos = clamp(next, 0, MAX);
    paint();
    if (pos >= MAX) arrive();
  }

  // ── 밀기: 끌기(관성), 누르기, 방향 키 ──
  let dragging = false;
  let startX = 0;
  let startPos = 0;
  let moved = 0;
  let lastX = 0;
  let lastT = 0;
  let vel = 0; // 무대 단위 / ms
  let glide = 0;
  const unit = (): number => S.w / (c.stage.clientWidth || S.w); // 화면 1px이 무대 단위로 얼마인가
  const stopGlide = (): void => {
    if (glide) c.cancel(glide);
    glide = 0;
  };
  const glideStep = (): void => {
    glide = 0;
    if (phase !== "pull" || Math.abs(vel) < 0.08) return;
    move(pos + vel * 16);
    vel *= 0.93;
    if (pos > 0 && pos < MAX) glide = c.later(glideStep, 16);
  };
  /** 누르기와 방향 키: step만큼 부드럽게 나아간다 */
  const nudge = (step: number): void => {
    stopGlide();
    const from = pos;
    let i = 0;
    const tick = (): void => {
      i += 1;
      const t = i / 10;
      move(from + step * t * (2 - t));
      if (i < 10 && phase === "pull") glide = c.later(tick, 16);
    };
    tick();
  };
  c.stage.addEventListener("pointerdown", (e) => {
    if (phase !== "pull") return;
    stopGlide();
    dragging = true;
    moved = 0;
    startX = lastX = e.clientX;
    startPos = pos;
    lastT = e.timeStamp;
    vel = 0;
    try {
      c.stage.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
  });
  c.stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    const dt = Math.max(1, e.timeStamp - lastT);
    vel = (-(e.clientX - lastX) * unit()) / dt;
    lastX = e.clientX;
    lastT = e.timeStamp;
    move(startPos - dx * unit());
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    if (moved < 6) nudge(12 * M.cm);
    else if (Math.abs(vel) > 0.25) glide = c.later(glideStep, 16);
  };
  c.stage.addEventListener("pointerup", drop);
  c.stage.addEventListener("pointercancel", drop);
  c.stage.addEventListener("keydown", (e) => {
    if (phase !== "pull") return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      nudge((e.key === "ArrowRight" ? 5 : -5) * M.cm);
    }
  });

  paint();
  c.step.dataset.opnPhase = "ask";
  c.ask("세포는 대부분 눈에 안 보일 만큼 작아요. 허리 등뼈 속에서 시작하는 이 <b>신경세포</b>는 얼마나 길까요?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 이제 위 그림의 세포를 <b>왼쪽으로 밀어서</b> 끝까지 따라가 보세요.",
    onDone: (picked) => {
      pred = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      phase = "pull";
      c.step.dataset.opnPhase = "pull";
      c.step.dataset.opnPred = String(pred.cm);
      c.stage.classList.add("pull");
      c.stage.tabIndex = 0;
      cap.textContent = "허리에서부터";
      c.face("curious");
      paint();
    },
  });
}
