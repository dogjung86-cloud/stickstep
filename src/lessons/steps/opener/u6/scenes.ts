// 중1 Ⅵ 도입 네 장면. 형식은 Ⅰ·Ⅱ단원과 같다: 내기를 걸고(정오를 매기지 않는다) → 손으로 장면을 바꾸고 → 끝에서 예측과 견준다.
//   u6-snow (u6l1) 「깊은 눈밭, 무엇을 신어야 덜 빠질까?」  운동화로 걷기와 설피 신고 걷기를 둘 다 해 본다. 원리의 이름(압력)은 말하지 않는다
//   u6-gym  (u6l3) 「공기 짐볼을 눌렀다 떼면?」      짐볼을 두 손으로 꾹 눌렀다 뗀다(두 번)
//   u6-foil (u6l4) 「은박 풍선, 추운 밖에 들고 나가면?」      밖으로 나갔다 안으로 들어온다
//   u6-pong (u6l5) 「찌그러진 탁구공, 살릴 수 있을까?」 공을 꾹 눌러 뜨거운 물에 담근다
// 옛 훅(hookGas.ts)에서 바로잡은 것: 답한 뒤에야 장면을 보여 주고 옳은 예측에 원리를 통째로 적어 두었다.
// 새 장면은 무엇을 신을지만 묻고 손으로 두 가지를 다 해 본 뒤에 견준다. 탁구공 장면은 "구멍이 없다"는 조건을 처음에 말한다.
// 2026-11-22: u6l1은 얼음판 위 동물 장면 대신 눈밭의 운동화와 설피, u6l3은 포장용 공기 방울 대신 공기 짐볼로 바꿨다(같은 사람, 같은 몸무게, 닿는 넓이만 다르다).
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

type Meta = (typeof import("../../../../ui/introArt.u6.generated"))["INTRO_META"];
const metaOf = (c: OpenerCtx): Meta => c.meta as unknown as Meta;
const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
const verdict = (picked: string, right: string): string => (picked === right ? "예측대로" : "예측과 달리");

function btn(c: OpenerCtx, cls: string, label: string, sub: string, fn: () => void): HTMLButtonElement {
  const b = el("button", { class: `opn-u6-btn ${cls}`, attrs: { type: "button" } }, el("b", { text: label }), el("span", { text: sub })) as HTMLButtonElement;
  b.addEventListener("click", fn);
  c.controls.appendChild(b);
  return b;
}

/** 무대 위의 꾹 누르는 자리. 누르는 동안 held()가 참이다. 키보드로는 누를 때마다 onKey가 불린다. */
function holdSpot(c: OpenerCtx, hit: readonly number[], label: string, on: { down?: () => void; up?: () => void; key?: () => void }): { el: HTMLButtonElement; held: () => boolean } {
  const S = metaOf(c).stage;
  const b = el("button", {
    class: "opn-u6-hit",
    attrs: { type: "button", "aria-label": label },
    style: { left: pct(hit[0], S.w), top: pct(hit[1], S.h), width: pct(hit[2], S.w), height: pct(hit[3], S.h) },
  }) as HTMLButtonElement;
  let held = false;
  const set = (v: boolean): void => {
    if (held === v) return;
    held = v;
    if (v) {
      c.stage.classList.add("touched");
      haptic(HAPTIC.tap);
      on.down?.();
    } else on.up?.();
  };
  b.addEventListener("pointerdown", (e) => {
    try {
      b.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    set(true);
  });
  b.addEventListener("pointerup", () => set(false));
  b.addEventListener("pointercancel", () => set(false));
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  b.addEventListener("click", (e) => {
    if (e.detail === 0) on.key?.();
  });
  c.stage.append(b);
  return { el: b, held: () => held };
}

/** 장면이 살아 있는 동안 도는 그리기 루프. */
function frames(c: OpenerCtx, fn: (dt: number) => void): void {
  let last = performance.now();
  let raf = 0;
  const tick = (t: number): void => {
    if (!c.alive()) return;
    const dt = Math.min(64, t - last);
    last = t;
    fn(dt);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  c.onCleanup(() => cancelAnimationFrame(raf));
}

/* ══════════ u6-snow: 눈밭의 운동화와 설피 ══════════ */
export function snowWalk(c: OpenerCtx): void {
  const M = metaOf(c).snow;
  c.stage.append(el("div", { class: "opn-layer", html: c.art.snowBase }));
  const kid = c.stage.querySelector<SVGElement>(".opn-u6-snow-kid");
  const RIGHT = "설피를 신어요";
  let phase: "ask" | "play" | "done" = "ask";
  let busy = false;
  let picked = RIGHT;
  const tried = { shoe: false, wide: false };
  const move = (x: number, instant = false): void => {
    if (!kid) return;
    kid.style.transition = instant ? "none" : "";
    kid.style.transform = `translateX(${x}px)`;
    if (instant) void kid.getBoundingClientRect();
  };
  const wrap = (): void => {
    if (!(tried.shoe && tried.wide) || phase === "done") return;
    phase = "done";
    c.step.dataset.opnPhase = "done";
    c.face("smile");
    haptic(HAPTIC.correct);
    c.say(`${verdict(picked, RIGHT)} 설피를 신으면 덜 빠져요! 몸무게는 그대로인데 눈에 닿는 <b>면적</b>이 넓어졌거든요.`);
    c.finish();
  };
  const go = (kind: "shoe" | "wide"): void => {
    if (phase !== "play" || busy) return;
    busy = true;
    haptic(HAPTIC.tap);
    c.stage.classList.remove("sink", "wide");
    move(0, true);
    c.step.dataset.opnTry = kind;
    (kind === "shoe" ? shoeBtn : wideBtn).classList.add("tried");
    if (kind === "shoe") {
      // 디딤판에서 눈밭으로 몇 걸음 나가자 무릎까지 푹 빠진다
      c.later(() => move(M.step), 60);
      c.later(() => {
        c.stage.classList.add("sink", "deep");
        c.face("surprised");
        haptic(HAPTIC.wrong);
        tried.shoe = true;
        busy = false;
        if (tried.wide) wrap();
        else c.say("푹! 발이 무릎까지 빠졌어요. 이번엔 <b>설피 신고 걷기</b>를 눌러 보세요.");
      }, 800);
    } else {
      c.stage.classList.add("wide");
      c.later(() => move(M.go), 60);
      c.later(() => {
        c.stage.classList.add("flat");
        tried.wide = true;
        busy = false;
        if (tried.shoe) wrap();
        else c.say("눈 위를 사뿐사뿐 걸어요. 이번엔 <b>운동화로 걷기</b>도 눌러 비교해 보세요.");
      }, 1500);
    }
  };
  const shoeBtn = btn(c, "shoe", "운동화로 걷기", "발바닥만 눈에 닿아요", () => go("shoe"));
  const wideBtn = btn(c, "wide", "설피 신고 걷기", "넓은 판이 눈에 닿아요", () => go("wide"));

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  c.ask("깊게 쌓인 눈밭을 건너야 해요. 운동화와 넓적한 눈신발인 설피 가운데 무엇을 신어야 덜 빠질까요?", {
    choices: [RIGHT, "운동화를 신어요", "둘 다 똑같이 빠져요"],
    neutral: true,
    good: "예측 완료! <b>운동화로 걷기</b>와 <b>설피 신고 걷기</b>를 모두 눌러 확인해 보세요.",
    onDone: (p) => {
      picked = p;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.controls.hidden = false;
      c.face("curious");
    },
  });
}

/* ══════════ u6-gym: 공기 짐볼 ══════════ */
export function gymBall(c: OpenerCtx): void {
  const M = metaOf(c).gym;
  c.stage.append(el("div", { class: "opn-layer", html: c.art.gymBase }));
  const ball = c.stage.querySelector<SVGElement>(".opn-u6-gym-ball");
  const hands = c.stage.querySelector<SVGElement>(".opn-u6-gym-hands");
  if (ball) ball.style.transformOrigin = `${M.cx}px ${M.baseY}px`; // 공이 바닥에 닿은 자리(무대 px)
  const RIGHT = "눌렸다가 다시 둥글게 부풀어요";
  const MIN = 0.7; // 다 눌렸을 때의 높이(처음의 몇 배)
  let phase: "ask" | "play" | "done" = "ask";
  let picked = RIGHT;
  let k = 1;
  let v = 0;
  let deep = false; // 이번 누르기에서 끝까지 눌렀는가
  let presses = 0;
  const paint = (): void => {
    if (ball) ball.style.transform = `scale(${1 + (1 - k) * 0.4}, ${k})`;
    if (hands) hands.style.transform = `translateY(${M.reach * (1 - k) - 6 * (k >= 0.999 ? 1 : 0)}px)`;
    c.step.dataset.opnSquash = k.toFixed(2);
  };
  const ending = (): string => `${verdict(picked, RIGHT)} 누르면 부피가 줄고 떼면 원래대로 돌아와요! 안에 갇힌 <b>공기</b>가 손을 밀어 올렸거든요.`;
  const spot = holdSpot(c, M.hit, "짐볼을 꾹 눌렀다 떼기", {
    up: () => {
      if (phase !== "play" || !deep) return;
      deep = false;
      presses += 1;
      haptic(HAPTIC.select);
      if (presses === 1) c.say("손을 떼니 다시 <b>둥글게</b> 부풀었어요. 한 번 더 눌렀다 떼 보세요.");
      else {
        phase = "done";
        c.step.dataset.opnPhase = "done";
        c.face("smile");
        haptic(HAPTIC.correct);
        c.say(ending());
        c.finish();
      }
    },
    key: () => {
      if (phase !== "play") return;
      k = MIN;
      deep = true;
      c.later(() => {
        deep = false;
        presses += 2;
        phase = "done";
        c.step.dataset.opnPhase = "done";
        c.say(ending());
        c.finish();
      }, 600);
    },
  });
  frames(c, (dt) => {
    if (phase === "ask") return;
    const f = dt / 16.7;
    if (spot.held() && phase === "play") {
      // 누를수록 버틴다: 처음엔 쑥 들어가고 갈수록 덜 들어간다
      k += (MIN - k) * 0.09 * f;
      v = 0;
      if (k < MIN + 0.04) deep = true;
    } else {
      // 떼면 통통 튀듯 돌아온다
      v += (1 - k) * 0.12 * f;
      v *= 0.78;
      k = Math.min(1.04, k + v * f);
    }
    paint();
  });

  c.step.dataset.opnPhase = "ask";
  paint();
  c.ask("공기를 빵빵하게 넣은 짐볼이에요. 두 손으로 꾹 눌렀다 떼면 어떻게 될까요?", {
    choices: [RIGHT, "납작해진 채로 있어요", "단단해서 전혀 안 눌려요"],
    neutral: true,
    good: "예측 완료! 그림의 <b>짐볼</b>을 꾹 눌렀다 떼 보세요.",
    onDone: (p) => {
      picked = p;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}

/* ══════════ u6-foil: 은박 풍선과 겨울 ══════════ */
export function foilBalloon(c: OpenerCtx): void {
  c.stage.append(el("div", { class: "opn-layer", html: c.art.foilBase }));
  const RIGHT = "쭈글쭈글해져요";
  let phase: "ask" | "play" | "done" = "ask";
  let picked = RIGHT;
  let out = false;
  let busy = false;
  let wentOut = false;
  const b = btn(c, "door", "밖으로 나가기", "추운 겨울 밖이에요", () => {
    if (phase !== "play" || busy) return;
    busy = true;
    b.disabled = true;
    out = !out;
    haptic(HAPTIC.tap);
    c.stage.classList.toggle("out", out);
    c.step.dataset.opnOut = out ? "1" : "0";
    c.later(() => {
      busy = false;
      b.disabled = false;
      const [name, sub] = b.children as unknown as HTMLElement[];
      name.textContent = out ? "안으로 들어오기" : "밖으로 나가기";
      sub.textContent = out ? "따뜻한 방이에요" : "추운 겨울 밖이에요";
      if (out) {
        wentOut = true;
        c.face("surprised");
        c.say("풍선이 <b>쭈글쭈글</b>해졌어요. 바람이 샌 걸까요? 다시 <b>안으로</b> 들어와 보세요.");
      } else if (wentOut) {
        phase = "done";
        c.step.dataset.opnPhase = "done";
        b.disabled = true;
        c.face("smile");
        haptic(HAPTIC.correct);
        c.say(`${verdict(picked, RIGHT)} 밖에서는 쭈그러들고 안에서는 다시 팽팽해요. 달라진 건 <b>온도</b>뿐이에요.`);
        c.finish();
      }
    }, 1500);
  });

  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  c.ask("따뜻한 방에서 팽팽하던 은박 풍선이에요. 추운 겨울 밖으로 들고 나가면?", {
    choices: [RIGHT, "더 팽팽해져요", "그대로예요"],
    neutral: true,
    good: "예측 완료! 아래 버튼으로 풍선을 들고 <b>밖으로</b> 나가 보세요.",
    onDone: (p) => {
      picked = p;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.controls.hidden = false;
      c.face("curious");
    },
  });
}

/* ══════════ u6-pong: 찌그러진 탁구공 ══════════ */
export function pingPong(c: OpenerCtx): void {
  const M = metaOf(c).pong;
  c.stage.append(el("div", { class: "opn-layer", html: c.art.pongBase }));
  const ball = c.stage.querySelector<SVGElement>(".opn-u6-pong-ball");
  const RIGHT = "다시 동그랗게 펴져요";
  const NEED = 1500; // 물속에서 데워져야 하는 시간(ms)
  let phase: "ask" | "play" | "done" = "ask";
  let picked = RIGHT;
  let dip = 0; // 0 물 위, 1 물속
  let heat = 0;
  let popped = false;
  const wrapUp = (): void => {
    if (phase === "done") return;
    phase = "done";
    c.step.dataset.opnPhase = "done";
    c.face("smile");
    c.say(`${verdict(picked, RIGHT)} 공이 <b>동그랗게</b> 펴졌어요. 구멍도 없는데 안에서 무엇이 밀어냈을까요?`);
    c.finish();
  };
  const spot = holdSpot(c, M.hit, "탁구공을 꾹 눌러 뜨거운 물에 담그기", {
    up: () => {
      if (phase !== "play") return;
      if (popped) wrapUp();
      else c.say("아직 그대로예요. 펴질 때까지 <b>꾹</b> 눌러 담가 주세요.");
    },
    key: () => {
      if (phase !== "play") return;
      heat = NEED;
      dip = 1;
    },
  });
  frames(c, (dt) => {
    if (phase === "ask") return;
    const down = spot.held() && phase === "play";
    dip += ((down ? 1 : 0) - dip) * Math.min(1, dt / 160);
    if (down && dip > 0.8 && !popped) heat += dt;
    if (!popped && heat >= NEED) {
      popped = true;
      c.stage.classList.add("popped");
      c.face("surprised");
      haptic(HAPTIC.correct);
      c.step.dataset.opnPopped = "1";
      c.say("어, 찌그러진 곳이 <b>펴지고</b> 있어요!");
      c.later(wrapUp, 1300); // 손을 떼지 않아도 끝난다
    }
    if (ball) ball.style.transform = `translateY(${M.dip * dip}px)`;
  });

  c.step.dataset.opnPhase = "ask";
  c.ask("밟혀서 찌그러진 탁구공이에요. 구멍은 나지 않았어요. 뜨거운 물에 담그면?", {
    choices: [RIGHT, "더 찌그러져요", "아무 변화도 없어요"],
    neutral: true,
    good: "예측 완료! 그림의 <b>탁구공</b>을 꾹 눌러 물에 담가 보세요.",
    onDone: (p) => {
      picked = p;
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
