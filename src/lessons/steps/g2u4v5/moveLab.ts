// [중2 Ⅳ v5] g2u4l6 이온의 이동 랩 두 판. 책의 탐구(이온의 이동 관찰하기)를 학생이 직접 한다.
//   준비물과 차례는 책과 같다: 페트리 접시의 거름종이를 질산 칼륨 수용액으로 적신다 → 집게와 전원 장치를 잇고 전원을 켠다(12 V)
//   → 거름종이 가운데에 황산 구리(Ⅱ) 수용액을 떨어뜨린다 → 과망가니즈산 칼륨 수용액으로 되풀이한다.
//   g2u4MoveLab 「전류를 흘려 주면 파란색 구리 이온은 어느 극으로 이동할까요?」
//     학생이 정하는 것: 세 가지 일의 차례. 실패하는 길 둘: 거름종이를 적시지 않으면 전류가 흐르지 않아 방울이 그 자리에 머문다.
//     전원을 켜지 않으면 방울이 제자리에서 둥글게 번지기만 한다. 제대로 하면 파란색이 (−)극 쪽으로 옮겨 간다.
//     판정 뒤 결론 앞에 '이온의 눈'을 한 번 보인다: 파란 구리 이온(+)은 (−)극 쪽으로, 색이 없는 황산 이온(−)은 (+)극 쪽으로(책 그림 Ⅳ-12).
//   g2u4PoleLab 「보라색 과망가니즈산 이온은 어느 극으로 이동할까요?」
//     과망가니즈산 칼륨 수용액의 보라색은 (+)극 쪽으로 간다. '이온의 눈'으로 색이 없는 칼륨 이온이 반대쪽으로 가는 것을 보고, 두 극을 바꾸어 본다.
// 무대는 위에서 내려다본 그림이다. 왼쪽 집게가 (−)극, 오른쪽 집게가 (+)극(극을 바꾸면 뒤집힌다).
// 거름종이 띠는 페트리 접시 안에 들고, 두 집게가 접시 가장자리에서 띠의 양 끝을 문다(접시 반지름 90, 띠 168×52의 모서리가 접시 안).
// 전원 장치 상자는 x 111~235(가운데 173): 불 뒤에 "전원 켜짐 (12 V)"(86px)가 들게 넓혔다.

import type { StepRenderer } from "../../types";
import { bvTween } from "../bio6/b6Lab";
import { bad, bvBtn, cap, eul, g4Lab, g4Svg, good, tap, txt, type G4Lab, type G4Step } from "./kit";

const MX = 173;
const MY = 98;
const DISH = 90; // 페트리 접시 반지름
const PX0 = 89; // 거름종이 띠 왼쪽 끝
const PX1 = 257; // 오른쪽 끝
const CLIP_L = 86; // 집게(접시 가장자리)
const CLIP_R = 260;
const TRAVEL = 55; // 얼룩이 옮겨 가는 거리
interface View {
  wet: boolean;
  on: boolean;
  flip: boolean; // 극을 바꿨는가(왼쪽이 (+)극)
  color: string;
  drop: null | { x: number; rx: number; ry: number; a: number };
  /** 이온의 눈: 색을 띠는 이온(color, 전하 sign)과 짝인 색 없는 이온(반대 전하)이 서로 반대쪽 극으로 간다. t는 0에서 1. */
  ions?: { t: number; color: string; line: string; sign: "+" | "−" };
}

function scene(v: View): string {
  const L = v.flip ? "(+)극" : "(−)극";
  const R = v.flip ? "(−)극" : "(+)극";
  const lc = v.flip ? "#FFB4A8" : "#A8CCFF";
  const rc = v.flip ? "#A8CCFF" : "#FFB4A8";
  const clip = (x: number, c: string): string => `<rect x="${x - 9}" y="${MY - 22}" width="18" height="44" rx="4" fill="#59667C" stroke="#2A3345" stroke-width="1.4"/><rect x="${x - 4}" y="${MY - 16}" width="8" height="32" rx="2" fill="${c}"/>`;
  let ions = "";
  if (v.ions) {
    const { t, color, line, sign } = v.ions;
    const toMinus = v.flip ? 1 : -1; // 양이온이 가는 쪽((−)극 쪽): 극을 바꾸지 않았으면 왼쪽
    const dir = sign === "+" ? toMinus : -toMinus;
    const other = sign === "+" ? "−" : "+";
    for (let i = 0; i < 4; i++) {
      const y = MY - 15 + i * 10;
      const d = 10 + t * (44 + i * 6);
      const ax = MX + dir * d;
      const kx = MX - dir * d;
      ions += `<circle cx="${ax}" cy="${y}" r="6.5" fill="${color}" stroke="${line}" stroke-width="1"/>${txt(ax, y + 4.3, sign, { size: 12.5, fill: "#fff", weight: 800 })}`;
      ions += `<circle cx="${kx}" cy="${y}" r="6.5" fill="#EEF2F8" stroke="#8795AA" stroke-width="1"/>${txt(kx, y + 4.3, other, { size: 12.5, fill: "#3A4760", weight: 800 })}`;
    }
  }
  return `
    <circle cx="${MX}" cy="${MY}" r="${DISH}" fill="rgba(160,200,255,.05)" stroke="#9CB4D6" stroke-width="2"/>
    <circle cx="${MX}" cy="${MY}" r="${DISH - 5}" fill="none" stroke="#9CB4D6" stroke-opacity=".35" stroke-width="1"/>
    <rect x="${PX0}" y="${MY - 26}" width="${PX1 - PX0}" height="52" rx="5" fill="${v.wet ? "#C9D6E4" : "#F5F1E8"}" stroke="${v.wet ? "#8FA3BC" : "#CFC8B8"}" stroke-width="1.2"/>
    ${v.drop ? `<ellipse cx="${v.drop.x}" cy="${MY}" rx="${v.drop.rx}" ry="${v.drop.ry}" fill="${v.color}" opacity="${v.ions ? 0.25 : v.drop.a}"/>` : ""}
    ${ions}
    ${clip(CLIP_L, lc)}${clip(CLIP_R, rc)}
    <path d="M${CLIP_L} ${MY + 22} L${CLIP_L} 211 L111 211 M${CLIP_R} ${MY + 22} L${CLIP_R} 211 L235 211" stroke="#3E4C63" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="111" y="196" width="124" height="30" rx="8" fill="#243248" stroke="#3E5273" stroke-width="1.4"/>
    <circle cx="124" cy="211" r="5.5" fill="${v.on ? "#7CF29C" : "#4A5870"}"/>
    ${txt(181, 215.5, v.on ? "전원 켜짐 (12 V)" : "전원 꺼짐", { size: 12.5, fill: v.on ? "#DFF8E6" : "#9AA8BC" })}
    ${txt(44, MY + 5, L, { size: 13, fill: lc, weight: 800 })}${txt(302, MY + 5, R, { size: 13, fill: rc, weight: 800 })}
  `;
}

/** 예측 질문(정오 없음). wait는 예측을 고르기 전 맨 아래 버튼의 글. */
function predict(lab: G4Lab, q: string, choices: string[], next: () => void, wait = "먼저 예측을 골라 보세요"): void {
  lab.api.setCTA(wait, { enabled: false });
  lab.f.slot.ask(q, choices.map((t) => ({ t })), () => undefined, { predict: true, nextDelay: 600, onNext: next });
}

export const g2u4MoveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 2, cls: "g2u4x-move", wait: "거름종이를 적시고 전원을 켜서 실험을 준비해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "위에서 본 페트리 접시의 거름종이와 두 집게, 전원 장치");
  const label = cap(lab);
  const v: View = { wet: false, on: false, flip: false, color: "#2F7BE8", drop: null };
  let busy = false;
  let moved = false;
  const draw = (): void => {
    stage.set(scene(v));
    label.textContent = v.ions ? "파랑(+): 구리 이온(Cu²⁺) · 흰색(−): 황산 이온(SO₄²⁻)" : v.wet ? "질산 칼륨 수용액으로 적신 거름종이" : "마른 거름종이(전류가 흐르지 않음)";
    host.dataset.g4Move = `${v.wet ? "w" : ""}${v.on ? "o" : ""}${v.drop ? "d" : ""}${moved ? "m" : ""}${v.ions ? "e" : ""}`;
  };
  // 판정 뒤 결론 앞: 이온의 눈으로 한 번(파란 구리 이온은 (−)극 쪽, 색이 없는 황산 이온은 (+)극 쪽)
  const eye = (): void => {
    api.setCTA("이온들이 이동하는 방향을 확인해 보세요", { enabled: false });
    f.say("입자 모형으로 보면, 파란색 <b>구리 이온(Cu²⁺)</b>은 (−)극 쪽으로, 눈에 보이지 않던 무색의 <b>황산 이온(SO₄²⁻)</b>은 (+)극 쪽으로 이동하고 있어요.");
    bvTween(
      tm,
      2400,
      (t) => {
        v.ions = { t, color: "#2F7BE8", line: "#CFE4FF", sign: "+" };
        draw();
      },
      () => tm.later(() => lab.finish("파란색을 띠는 구리 이온(Cu²⁺)은 <b>(+)전하를 띤 양이온</b>이므로 전류를 흘려 주면 <b>(−)극</b> 쪽으로 이동해요."), 700),
      (x) => x,
    );
  };

  const bWet = bvBtn("g2u4x-mv-wet", "질산 칼륨 수용액으로 거름종이 적시기");
  const bOn = bvBtn("g2u4x-mv-on", "전원 켜기 (12 V)");
  const bDrop = bvBtn("main g2u4x-mv-drop", "파란색 황산 구리(Ⅱ) 수용액 떨어뜨리기");
  const bRedo = bvBtn("g2u4x-mv-redo", "새 거름종이로 바꾸어 다시 준비하기");
  const lock = (x: boolean): void => [bWet, bOn, bDrop].forEach((b) => (b.disabled = x || (b === bWet && v.wet) || (b === bOn && v.on) || (b === bDrop && !!v.drop)));

  const run = (): void => {
    busy = true;
    lock(true);
    const go = (): void => {
      f.slot.showControls();
      api.setCTA("파란색이 어느 극으로 이동하는지 지켜보세요", { enabled: false });
      f.say("파란색 성분이 서서히 움직이고 있어요! 어느 극 쪽으로 이동하는지 지켜보세요.");
      bvTween(
        tm,
        3200,
        (t) => {
          v.drop = { x: MX - TRAVEL * t, rx: 13 + 12 * t, ry: 13 - 2 * t, a: 0.9 - 0.15 * t };
          draw();
        },
        () => {
          moved = true;
          draw();
          good();
          f.pips(1);
          f.say("파란색이 왼쪽의 <b>(−)극 쪽</b>으로 이동했어요! 이 파란색은 수용액 속 <b>구리 이온(Cu²⁺)</b>이 나타내는 색이에요.");
          tm.later(() => {
            lab.judge(
              "(−)극 쪽으로 끌려간 파란색 <b>구리 이온(Cu²⁺)</b>은 어떤 전하를 띠고 있을까요?",
              [{ t: "(+)전하", ok: true }, { t: "(−)전하" }, { t: "전하를 띠지 않는다" }],
              "전기력은 서로 다른 종류의 전하끼리 <b>끌어당기므로</b>, (−)극으로 끌려간 구리 이온은 (+)전하를 띠는 양이온이에요.",
              eye,
            );
          }, 1500);
        },
        (x) => x,
      );
    };
    predict(
      lab,
      "전류가 흐르는 거름종이 위에서 <b>파란색</b>은 어느 쪽으로 움직일까요?",
      ["(−)극 쪽으로 이동한다", "(+)극 쪽으로 이동한다", "어느 극으로도 가지 않고 제자리에서 번진다"],
      go,
      "먼저 파란색이 어느 쪽으로 이동할지 예측해 보세요",
    );
  };

  bWet.addEventListener("click", () => {
    if (busy || v.wet) return;
    if (v.drop) return;
    tap();
    v.wet = true;
    lock(false);
    draw();
    f.say("거름종이를 무색의 <b>질산 칼륨 수용액</b>으로 적셨어요! 이제 거름종이에 전류가 잘 흐를 수 있어요.");
  });
  bOn.addEventListener("click", () => {
    if (busy || v.on) return;
    tap();
    v.on = true;
    lock(false);
    draw();
    if (v.drop && v.wet) {
      f.say("전원을 켰어요! 둥글게 번져 있던 파란색이 어느 쪽으로 움직이는지 지켜보세요.");
      tm.later(run, 400);
      return;
    }
    f.say(v.wet ? "전원을 켰어요! 질산 칼륨 수용액에 젖은 거름종이를 통해 <b>전류</b>가 흐르고 있어요." : "전원을 켰지만, 아직 거름종이가 말라 있어서 전류가 흐르지 않아요. 거름종이를 먼저 적셔 보세요.");
  });
  bDrop.addEventListener("click", () => {
    if (busy || v.drop) return;
    tap();
    if (!v.wet) {
      // 실패: 마른 종이에는 전류가 흐르지 않는다
      bad();
      v.drop = { x: MX, rx: 10, ry: 10, a: 0.95 };
      draw();
      f.say("마른 거름종이에는 <b>전류가 흐르지 않아서</b> 파란 방울이 이동하지 못하고 제자리에 멈춰 있어요.");
      host.dataset.g4Fail = "dry";
      f.slot.setControls(bRedo);
      return;
    }
    if (!v.on) {
      // 실패: 전원이 꺼져 있으면 제자리에서 둥글게 번지기만 한다
      bad();
      busy = true;
      host.dataset.g4Fail = "off";
      bvTween(
        tm,
        1400,
        (t) => {
          v.drop = { x: MX, rx: 10 + 9 * t, ry: 10 + 9 * t, a: 0.95 - 0.2 * t };
          draw();
        },
        () => {
          busy = false;
          lock(false);
          f.say("전원이 꺼져 있어서 파란색이 한쪽으로 이동하지 않고 <b>제자리에서 둥글게</b> 번지기만 해요. 이제 전원을 켜 보세요.");
        },
      );
      return;
    }
    v.drop = { x: MX, rx: 13, ry: 13, a: 0.9 };
    draw();
    run();
  });
  bRedo.addEventListener("click", () => {
    tap();
    v.wet = false;
    v.drop = null;
    busy = false;
    f.slot.setControls(bWet, bOn, bDrop);
    lock(false);
    draw();
    f.say("새 거름종이로 바꾸었어요. 수용액 방울을 떨어뜨리기 전에 전류가 흐르도록 <b>무엇을 먼저</b> 해야 할까요?");
  });
  f.slot.setControls(bWet, bOn, bDrop);
  draw();
  f.say("거름종이 양 끝을 전원 장치의 집게로 연결했어요. 전류가 잘 흐르도록 <b>실험 과정을 순서대로</b> 진행해 보세요.");
  return lab.cleanup;
};

export const g2u4PoleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-pole", wait: "보라색 수용액을 떨어뜨려 이동 방향을 확인해 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "위에서 본 페트리 접시의 거름종이와 두 집게, 전원 장치");
  const label = cap(lab);
  const v: View = { wet: true, on: true, flip: false, color: "#8E3FD0", drop: null };
  let pos = 0; // 방울의 자리(−1: 왼쪽 끝, +1: 오른쪽 끝)
  const put = (): void => {
    const a = Math.abs(pos);
    v.drop = { x: MX + TRAVEL * pos, rx: 13 + 12 * a, ry: 13 - 2 * a, a: 0.9 - 0.15 * a };
  };
  const draw = (): void => {
    stage.set(scene(v));
    host.dataset.g4Pos = pos.toFixed(2);
    host.dataset.g4Flip = v.flip ? "1" : "0";
  };
  const WET_ON = "질산 칼륨 수용액으로 적신 거름종이 (전원 켜짐)";
  label.textContent = WET_ON;

  const bDrop = bvBtn("main g2u4x-mv-drop", "보라색 과망가니즈산 칼륨 수용액 떨어뜨리기");
  const EYE = "입자 모형으로 이온 보기";
  const bEye = bvBtn("main g2u4x-mv-eye", EYE);
  const bFlip = bvBtn("main g2u4x-mv-flip", "(+)극과 (−)극 서로 바꾸기");
  const slide = (to: number, ms: number, done: () => void): void => {
    const from = pos;
    bvTween(
      tm,
      ms,
      (t) => {
        pos = from + (to - from) * t;
        put();
        draw();
      },
      done,
      (x) => x,
    );
  };
  bDrop.addEventListener("click", () => {
    bDrop.disabled = true;
    tap();
    put();
    draw();
    predict(lab, "보라색 성분도 앞선 파란색 성분처럼 <b>(−)극 쪽</b>으로 이동할까요?", ["반대쪽인 (+)극 쪽으로 이동한다", "파란색처럼 (−)극 쪽으로 이동한다", "어느 극으로도 가지 않고 제자리에서 번진다"], () => {
      f.slot.setControls();
      api.setCTA("보라색이 어느 극으로 이동하는지 지켜보세요", { enabled: false });
      f.say("보라색 성분이 서서히 움직이고 있어요! 앞선 파란색과 같은 방향인가요?");
      slide(1, 3000, () => {
        good();
        f.pips(1);
        f.say("보라색은 파란색과 반대로 오른쪽의 <b>(+)극 쪽</b>으로 이동했어요! 이 보라색은 <b>과망가니즈산 이온(MnO₄⁻)</b>이 나타내는 색이에요.");
        tm.later(() => {
          lab.judge(
            "(+)극 쪽으로 끌려간 보라색 <b>과망가니즈산 이온(MnO₄⁻)</b>은 어떤 전하를 띠고 있을까요?",
            [{ t: "(−)전하", ok: true }, { t: "(+)전하" }, { t: "전하를 띠지 않는다" }],
            "(+)극에는 반대 전하인 <b>(−)전하를 띤 음이온</b>이 끌려가기 때문이에요.",
            () => {
              f.pips(2);
              f.slot.setControls(bEye);
              // 수정안은 "입자 모형 보기를 눌러"였지만 버튼 이름이 "입자 모형으로 이온 보기"라 그 이름으로 부른다
              api.setCTA(`${EYE}${eul(EYE)} 눌러 숨어 있는 이온까지 확인해 보세요`, { enabled: false });
              f.say("이 수용액 속에는 눈에 보이지 않는 무색의 <b>칼륨 이온(K⁺)</b>도 함께 들어 있어요. 아래 버튼을 눌러 입자 모형으로 확인해 보세요.");
            },
          );
        }, 1500);
      });
    });
  });
  bEye.addEventListener("click", () => {
    bEye.disabled = true;
    tap();
    v.ions = { t: 0, color: "#8E3FD0", line: "#E2C8FF", sign: "−" };
    // 알약 폭(322px)에 한 줄로 들게 이 글만 12px(g2u4v5.css의 .g2u4x-cap.sm)
    label.textContent = "보라(−): 과망가니즈산 이온(MnO₄⁻) · 흰색(+): 칼륨 이온(K⁺)";
    label.classList.add("sm");
    f.say("보라색의 (−)이온과 무색의 (+)이온이 서로 <b>반대쪽 극</b>을 향해 이동하고 있어요!");
    bvTween(
      tm,
      2400,
      (t) => {
        v.ions = { t, color: "#8E3FD0", line: "#E2C8FF", sign: "−" };
        draw();
      },
      () => {
        tm.later(() => {
          lab.judge(
            "색이 없어 눈으로 보이지 않던 <b>칼륨 이온(K⁺)</b>은 어느 극 쪽으로 이동했나요?",
            [{ t: "(−)극 쪽", ok: true }, { t: "(+)극 쪽" }, { t: "어느 쪽으로도 이동하지 않았다" }],
            "칼륨 이온(K⁺)은 (+)전하를 띤 양이온이므로 <b>(−)극</b> 쪽으로 끌려가기 때문이에요.",
            () => {
              f.pips(3);
              delete v.ions;
              label.textContent = WET_ON;
              label.classList.remove("sm");
              draw();
              f.slot.setControls(bFlip);
              api.setCTA("(+)극과 (−)극의 위치를 서로 바꾸어 보세요", { enabled: false });
              f.say("마지막으로 전선을 바꾸어 연결해 <b>(+)극과 (−)극의 위치를 서로 바꾸면</b> 보라색 이온은 어느 쪽으로 움직일까요?");
            },
          );
        }, 900);
      },
      (x) => x,
    );
  });
  bFlip.addEventListener("click", () => {
    bFlip.disabled = true;
    tap();
    v.flip = true;
    draw();
    f.say("왼쪽이 (+)극으로 바뀌자, 보라색 과망가니즈산 이온이 새로운 (+)극인 왼쪽으로 <b>방향을 바꾸어 이동해요</b>!");
    slide(-1, 3400, () => {
      good();
      lab.finish("수용액 속의 이온은 전하를 띠고 있어서 전류를 흘려 주면 이동해요. <b>(+)전하를 띤 양이온은 (−)극</b>으로, <b>(−)전하를 띤 음이온은 (+)극</b>으로 이동해요.");
    });
  });
  f.slot.setControls(bDrop);
  draw();
  f.say("전류가 흐르는 같은 거름종이 장치 위에, 이번에는 <b>보라색</b> 과망가니즈산 칼륨 수용액을 한 방울 떨어뜨려 보세요.");
  return lab.cleanup;
};
