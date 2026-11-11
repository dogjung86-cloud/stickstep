// [중1 Ⅴ 도입] 여섯 장면. 형식은 Ⅰ·Ⅱ단원과 같다: 내기(예측)를 먼저 걸고 → 손으로 한 일이 장면을 바꾸고 → 끝에서 예측과 견준다.
// 예측은 모두 neutral(답이 조작으로 드러난다). 원리의 답은 말하지 않고 물음으로 맺어 바로 뒤의 랩에 넘긴다.
//   u5-balloon (u5l1) 풍선을 꾹 눌러 줄을 당겼다 놓는다          → 랩: 힘을 화살표로 나타내기
//   u5-tug     (u5l2) "더 세게" 버튼 세 번, 리본은 제자리          → 랩: 줄다리기의 남는 힘
//   u5-bow     (u5l4) 조금 당겨 쏘기와 많이 당겨 쏘기              → 랩: 용수철을 늘인 길이와 힘
//   u5-sled    (u5l5) 흙길과 빙판길에서 같은 세기로 썰매 밀기       → 랩: 바닥과 무게를 바꿔 상자 밀기
//   u5-bottle  (u5l6) 빈 페트병을 꾹 눌러 넣었다 놓는다             → 랩: 추를 물에 담그며 눈금 읽기
//   u5-roll    (u5l7) 공을 차고 지켜본다                          → 랩: 굴러가는 공에 바람 보내기
// 그림은 qa/sketch/scenes/intro-u5.mjs(손그림). 좌표는 c.meta에서 읽는다. 그림 속에 글자와 숫자는 없다.
// 옛 훅(hookForce.ts)과 달라진 사실: 없음(소재와 결과는 같다). 예측이 결과 앞으로 왔고, 답을 말하던 끝말을 물음으로 바꿨다.

import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx, OpenerScene } from "../opener";

type Meta = (typeof import("../../../../ui/introArt.u5.generated"))["INTRO_META"];
const meta = (c: OpenerCtx): Meta => c.meta as unknown as Meta;
const art = (c: OpenerCtx, key: string): void => {
  c.stage.append(el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" }));
};
const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

/** 무대 위의 누르는 자리(무대 좌표 x, y, w, h). */
function hit(c: OpenerCtx, r: readonly number[], label: string): HTMLButtonElement {
  const S = meta(c).stage;
  const b = el("button", { class: "opn-u5-hit", attrs: { type: "button", "aria-label": label }, style: { left: pct(r[0], S.w), top: pct(r[1], S.h), width: pct(r[2], S.w), height: pct(r[3], S.h) } }) as HTMLButtonElement;
  c.stage.append(b);
  return b;
}
/** 조작 줄의 버튼. */
function btn(c: OpenerCtx, key: string, label: string, sub: string): HTMLButtonElement {
  const b = el("button", { class: "opn-u5-btn", attrs: { type: "button" } }, el("b", { text: label }), el("span", { text: sub })) as HTMLButtonElement;
  b.dataset.k = key;
  c.controls.appendChild(b);
  return b;
}
/** 내기: 첫 보기가 조작으로 드러날 결과다. 끝말 앞에 붙일 "예측대로" 또는 "예측과 달리"를 돌려준다. */
function bet(c: OpenerCtx, question: string, picks: string[], go: string, onPlay: () => void): () => string {
  let verdict = "예측과 달리";
  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  c.ask(question, {
    choices: picks,
    neutral: true,
    good: go,
    onDone: (picked) => {
      verdict = picked === picks[0] ? "예측대로" : "예측과 달리";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.controls.hidden = c.controls.children.length === 0;
      c.face("curious");
      onPlay();
    },
  });
  return () => verdict;
}
function end(c: OpenerCtx, html: string): void {
  c.face("surprised");
  haptic(HAPTIC.correct);
  c.say(html);
  c.finish();
}

/** 꾹 누르는 동안 0에서 1로 차오르는 값. 놓으면 onRelease(그때의 값). */
function holdFill(c: OpenerCtx, b: HTMLButtonElement, ms: number, canPress: () => boolean, paint: (v: number) => void, onRelease: (v: number) => void): void {
  let v = 0;
  let holding = false;
  let last = 0;
  let raf = 0;
  const tick = (t: number): void => {
    if (!holding || !c.alive()) return;
    v = Math.min(1, v + (t - last) / ms);
    last = t;
    paint(v);
    raf = requestAnimationFrame(tick);
  };
  const up = (): void => {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    const got = v;
    v = 0;
    onRelease(got);
  };
  b.addEventListener("pointerdown", (e) => {
    if (!canPress() || holding) return;
    try {
      b.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
    holding = true;
    last = performance.now();
    c.stage.classList.add("touched");
    haptic(HAPTIC.tap);
    raf = requestAnimationFrame(tick);
  });
  b.addEventListener("pointerup", up);
  b.addEventListener("pointercancel", up);
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  // 키보드: 한 번 누르면 끝까지 눌렀다 놓은 것으로 친다
  b.addEventListener("click", (e) => {
    if (e.detail !== 0 || !canPress()) return;
    paint(1);
    c.later(() => onRelease(1), 500);
  });
  c.onCleanup(() => cancelAnimationFrame(raf));
}

// ── 1. 헬륨 풍선 ────────────────────────────────────────────────
const balloon: OpenerScene = (c) => {
  const M = meta(c).balloon;
  art(c, "balloonBase");
  const bal = c.stage.querySelector<SVGElement>(".opn-u5-bal");
  const str = c.stage.querySelector<SVGElement>(".opn-u5-str");
  const b = hit(c, M.hit, "풍선을 꾹 눌러 줄 당기기");
  let done = false;
  const paint = (v: number): void => {
    if (bal) bal.style.transform = `translateY(${v * M.pull}px)`;
    str?.setAttribute("y2", String(M.top + v * M.pull));
  };
  const verdict = bet(c, "쌤이 헬륨 풍선의 줄을 아래로 당겼다가 놓으면 풍선은?", ["다시 위로 올라가요", "내려온 자리에 멈춰요", "바닥으로 떨어져요"], "예측 완료! <b>풍선</b>을 꾹 눌러 줄을 당겼다가 놓아 보세요.", () => undefined);
  holdFill(
    c,
    b,
    900,
    () => c.step.dataset.opnPhase === "play" && !done,
    (v) => {
      bal?.classList.remove("rise");
      paint(v);
    },
    (v) => {
      bal?.classList.add("rise");
      paint(0);
      if (v < 0.8) {
        c.say("조금 더 길게 <b>꾹</b> 눌러 줄을 끝까지 당겨 보세요.");
        return;
      }
      done = true;
      c.later(() => end(c, `${verdict()} 풍선이 다시 올라갔어요. 무엇이 풍선의 움직임을 바꿨을까요?`), 800);
    },
  );
};

// ── 2. 줄다리기 ─────────────────────────────────────────────────
const tug: OpenerScene = (c) => {
  art(c, "tugBase");
  let lv = 0;
  const more = btn(c, "more", "더 세게!", "양쪽 모두 힘을 더 줘요");
  more.classList.add("wide");
  const verdict = bet(c, "양 팀이 똑같은 힘으로 점점 더 세게 당기면 가운데 리본은?", ["제자리에 있어요", "이리저리 크게 움직여요", "한쪽으로 끌려가요"], "예측 완료! <b>더 세게!</b>를 세 번 눌러 보세요.", () => undefined);
  more.addEventListener("click", () => {
    if (c.step.dataset.opnPhase !== "play" || lv >= 3) return;
    lv += 1;
    haptic(HAPTIC.tap);
    c.stage.classList.remove("lv-1", "lv-2", "lv-3", "shake");
    void c.stage.offsetWidth;
    c.stage.classList.add(`lv-${lv}`, "shake");
    c.step.dataset.opnLevel = String(lv);
    if (lv === 3) {
      more.disabled = true;
      c.later(() => end(c, `${verdict()} 리본은 제자리예요. 이렇게 세게 당기는데 왜 안 움직일까요?`), 900);
    }
  });
};

// ── 3. 활과 화살 ────────────────────────────────────────────────
const bow: OpenerScene = (c) => {
  const M = meta(c).bow;
  art(c, "bowBase");
  const string = c.stage.querySelector<SVGElement>(".opn-u5-string");
  const arw = c.stage.querySelector<SVGElement>(".opn-u5-arw");
  const tried = { small: false, big: false };
  let busy = false;
  const setPull = (p: number): void => {
    string?.setAttribute("points", `${M.tipX},${M.top} ${M.tipX - p},${M.midY} ${M.tipX},${M.bot}`);
  };
  const shoot = (k: "small" | "big"): void => {
    if (c.step.dataset.opnPhase !== "play" || busy) return;
    busy = true;
    haptic(HAPTIC.tap);
    const p = k === "small" ? 26 : 78;
    if (arw) {
      arw.style.transition = "transform .45s ease-out";
      arw.style.transform = `translate(${-p}px, 0)`;
    }
    setPull(p);
    c.later(() => {
      // 놓는다: 시위는 제자리로, 화살은 앞으로
      setPull(0);
      haptic(HAPTIC.tap);
      if (arw) {
        arw.style.transition = k === "small" ? "transform .7s cubic-bezier(.3,.2,.7,1)" : "transform .5s linear";
        arw.style.transform = k === "small" ? "translate(250px, 186px)" : `translate(${M.target - M.tipX - M.len}px, 0)`;
      }
      tried[k] = true;
      (k === "small" ? bSmall : bBig).classList.add("tried");
      c.later(() => {
        if (tried.small && tried.big) {
          end(c, `${verdict()} 많이 당기면 더 멀리 가요. 뒤로 당겼는데 왜 앞으로 날아갈까요?`);
          return;
        }
        c.say(k === "small" ? "과녁에 못 미쳤어요. 이번엔 <b>많이 당겨</b> 쏴 보세요." : "과녁에 꽂혔어요. <b>조금만 당겨</b> 쏘면 어떨까요?");
        if (arw) {
          arw.style.transition = "none";
          arw.style.transform = "translate(0, 0)";
        }
        busy = false;
      }, 1300);
    }, 600);
  };
  const bSmall = btn(c, "small", "조금 당겨 쏘기", "시위를 살짝만");
  const bBig = btn(c, "big", "많이 당겨 쏘기", "시위를 끝까지");
  c.controls.classList.add("opn-u5-two");
  bSmall.addEventListener("click", () => shoot("small"));
  bBig.addEventListener("click", () => shoot("big"));
  const verdict = bet(c, "활시위를 더 많이 당겼다 놓으면 화살은 어떻게 날아갈까요?", ["더 멀리 날아가요", "똑같이 날아가요", "덜 날아가요"], "예측 완료! 두 가지로 쏴서 견줘 보세요.", () => undefined);
};

// ── 4. 흙길과 빙판길 ────────────────────────────────────────────
const sled: OpenerScene = (c) => {
  const M = meta(c).sled;
  art(c, "sledBase");
  const tried = { dirt: false, ice: false };
  let busy = false;
  const push = (k: "dirt" | "ice"): void => {
    if (c.step.dataset.opnPhase !== "play" || busy || tried[k]) return;
    busy = true;
    haptic(HAPTIC.tap);
    const g = c.stage.querySelector<SVGElement>(`.opn-u5-sled.s-${k}`);
    if (g) {
      g.style.transition = `transform ${k === "dirt" ? 0.9 : 2.4}s cubic-bezier(.12,.7,.3,1)`;
      g.style.transform = `translateX(${k === "dirt" ? M.dirt : M.ice}px)`;
    }
    tried[k] = true;
    (k === "dirt" ? bDirt : bIce).classList.add("tried");
    c.later(
      () => {
        busy = false;
        if (tried.dirt && tried.ice) end(c, `${verdict()} 빙판길에서 훨씬 멀리 갔어요. 흙길에서는 무엇이 썰매를 세웠을까요?`);
        else c.say(k === "dirt" ? "금방 멈췄어요. 이번엔 <b>빙판길</b>에서 밀어 보세요." : "쭉 미끄러졌어요. 이번엔 <b>흙길</b>에서 밀어 보세요.");
      },
      k === "dirt" ? 1100 : 2600,
    );
  };
  const bDirt = btn(c, "dirt", "흙길에서 밀기", "위쪽 길");
  const bIce = btn(c, "ice", "빙판길에서 밀기", "아래쪽 길");
  c.controls.classList.add("opn-u5-two");
  bDirt.addEventListener("click", () => push("dirt"));
  bIce.addEventListener("click", () => push("ice"));
  const verdict = bet(c, "흙길과 빙판길에서 썰매를 같은 세기로 밀면 어디서 더 멀리 갈까요?", ["빙판길", "흙길", "똑같이 가요"], "예측 완료! 두 길에서 한 번씩 밀어 보세요.", () => undefined);
};

// ── 5. 빈 페트병 ────────────────────────────────────────────────
const bottle: OpenerScene = (c) => {
  const M = meta(c).bottle;
  art(c, "bottleBase");
  const btl = c.stage.querySelector<SVGElement>(".opn-u5-btl");
  const hand = c.stage.querySelector<SVGElement>(".opn-u5-hand");
  const b = hit(c, M.hit, "페트병을 꾹 눌러 물속에 넣기");
  let done = false;
  const verdict = bet(c, "물에 떠 있는 빈 페트병을 물속에 꾹 눌렀다가 손을 떼면?", ["위로 튀어 올라요", "물속에 그대로 있어요", "바닥으로 가라앉아요"], "예측 완료! <b>페트병</b>을 꾹 눌러 넣었다가 손을 떼 보세요.", () => undefined);
  holdFill(
    c,
    b,
    1000,
    () => c.step.dataset.opnPhase === "play" && !done,
    (v) => {
      btl?.classList.remove("pop");
      c.stage.classList.remove("splash");
      c.stage.classList.add("press");
      if (btl) btl.style.transform = `translateY(${v * M.down}px)`;
      if (hand) hand.style.transform = `translateY(${v * M.down}px)`;
    },
    (v) => {
      c.stage.classList.remove("press");
      btl?.classList.add("pop");
      if (btl) btl.style.transform = "translateY(0)";
      if (hand) hand.style.transform = "translateY(-40px)";
      if (v < 0.8) {
        c.say("조금 더 길게 <b>꾹</b> 눌러 병을 물속 깊이 넣어 보세요.");
        return;
      }
      done = true;
      c.stage.classList.add("splash");
      c.later(() => end(c, `${verdict()} 병이 퐁 하고 솟았어요. 누를 때 손을 밀어 올린 것은 무엇일까요?`), 700);
    },
  );
};

// ── 6. 굴러가다 멈추는 공 ───────────────────────────────────────
const roll: OpenerScene = (c) => {
  const M = meta(c).roll;
  art(c, "rollBase");
  const ballG = c.stage.querySelector<SVGElement>(".opn-u5-ball");
  const kick = btn(c, "kick", "공 차기", "차고 나서는 건드리지 않아요");
  kick.classList.add("wide");
  const verdict = bet(c, "잔디밭에서 찬 공을 아무도 건드리지 않으면 공은 어떻게 될까요?", ["점점 느려지다 멈춰요", "같은 속력으로 계속 가요", "점점 빨라져요"], "예측 완료! <b>공 차기</b>를 누르고 끝까지 지켜보세요.", () => undefined);
  kick.addEventListener("click", () => {
    if (c.step.dataset.opnPhase !== "play" || kick.disabled) return;
    kick.disabled = true;
    haptic(HAPTIC.tap);
    if (ballG) {
      ballG.style.transition = "transform 3s cubic-bezier(.08,.62,.3,1)";
      ballG.style.transform = `translateX(${M.far}px)`;
    }
    c.say("공이 굴러가요. 속력이 어떻게 변하는지 보세요.");
    c.later(() => end(c, `${verdict()} 공이 깃발에 닿기 전에 멈췄어요. 무엇이 공을 세웠을까요?`), 3200);
  });
};

export const U5_SCENES: Record<string, OpenerScene> = { "u5-balloon": balloon, "u5-tug": tug, "u5-bow": bow, "u5-sled": sled, "u5-bottle": bottle, "u5-roll": roll };
