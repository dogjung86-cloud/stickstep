// [중2 Ⅳ v5] g2u4l6 이온의 이동 랩 두 판. 책의 탐구(이온의 이동 관찰하기)를 학생이 직접 한다.
//   준비물과 차례는 책과 같다: 페트리 접시의 거름종이를 질산 칼륨 수용액으로 적신다 → 집게와 전원 장치를 잇고 전원을 켠다(12 V)
//   → 거름종이 가운데에 황산 구리(Ⅱ) 수용액을 떨어뜨린다 → 과망가니즈산 칼륨 수용액으로 되풀이한다.
//   g2u4MoveLab 「파란색은 어느 극으로 갈까요?」
//     학생이 정하는 것: 세 가지 일의 차례. 실패하는 길 둘: 거름종이를 적시지 않으면 전류가 흐르지 않아 방울이 그 자리에 머문다.
//     전원을 켜지 않으면 방울이 제자리에서 둥글게 번지기만 한다. 제대로 하면 파란색이 (−)극 쪽으로 옮겨 간다.
//   g2u4PoleLab 「보라색도 같은 쪽으로 갈까요?」
//     과망가니즈산 칼륨 수용액의 보라색은 (+)극 쪽으로 간다. '이온의 눈'으로 색이 없는 칼륨 이온이 반대쪽으로 가는 것을 보고, 두 극을 바꾸어 본다.
// 무대는 위에서 내려다본 그림이다. 왼쪽 집게가 (−)극, 오른쪽 집게가 (+)극(극을 바꾸면 뒤집힌다).

import type { StepRenderer } from "../../types";
import { bvTween } from "../bio6/b6Lab";
import { bad, bvBtn, cap, g4Lab, g4Svg, good, tap, txt, type G4Lab, type G4Step } from "./kit";

const MX = 173;
const MY = 92;
interface View {
  wet: boolean;
  on: boolean;
  flip: boolean; // 극을 바꿨는가(왼쪽이 (+)극)
  color: string;
  drop: null | { x: number; rx: number; ry: number; a: number };
  ions?: { t: number }; // 이온의 눈
}

function scene(v: View): string {
  const L = v.flip ? "(+)극" : "(−)극";
  const R = v.flip ? "(−)극" : "(+)극";
  const lc = v.flip ? "#FFB4A8" : "#A8CCFF";
  const rc = v.flip ? "#A8CCFF" : "#FFB4A8";
  const clip = (x: number, c: string): string => `<rect x="${x - 9}" y="${MY - 22}" width="18" height="44" rx="4" fill="#59667C" stroke="#2A3345" stroke-width="1.4"/><rect x="${x - 4}" y="${MY - 16}" width="8" height="32" rx="2" fill="${c}"/>`;
  let ions = "";
  if (v.ions) {
    const t = v.ions.t;
    const dir = v.flip ? -1 : 1;
    // 과망가니즈산 이온(보라, −)은 (+)극 쪽으로, 칼륨 이온(색 없음, +)은 (−)극 쪽으로
    for (let i = 0; i < 4; i++) {
      const y = MY - 15 + i * 10;
      const ax = MX + dir * (10 + t * (44 + i * 6));
      const kx = MX - dir * (10 + t * (44 + i * 6));
      ions += `<circle cx="${ax}" cy="${y}" r="6.5" fill="#8E3FD0" stroke="#E2C8FF" stroke-width="1"/>${txt(ax, y + 4.3, "−", { size: 12.5, fill: "#fff", weight: 800 })}`;
      ions += `<circle cx="${kx}" cy="${y}" r="6.5" fill="#EEF2F8" stroke="#8795AA" stroke-width="1"/>${txt(kx, y + 4.3, "+", { size: 12.5, fill: "#3A4760", weight: 800 })}`;
    }
  }
  return `
    <circle cx="${MX}" cy="${MY}" r="74" fill="rgba(160,200,255,.05)" stroke="#9CB4D6" stroke-width="2"/>
    <rect x="62" y="${MY - 26}" width="222" height="52" rx="5" fill="${v.wet ? "#C9D6E4" : "#F5F1E8"}" stroke="${v.wet ? "#8FA3BC" : "#CFC8B8"}" stroke-width="1.2"/>
    ${v.drop ? `<ellipse cx="${v.drop.x}" cy="${MY}" rx="${v.drop.rx}" ry="${v.drop.ry}" fill="${v.color}" opacity="${v.ions ? 0.25 : v.drop.a}"/>` : ""}
    ${ions}
    ${clip(58, lc)}${clip(288, rc)}
    <path d="M58 ${MY + 22} L58 190 L128 190 M288 ${MY + 22} L288 190 L218 190" stroke="#3E4C63" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="128" y="174" width="90" height="42" rx="8" fill="#243248" stroke="#3E5273" stroke-width="1.4"/>
    <circle cx="146" cy="195" r="6" fill="${v.on ? "#7CF29C" : "#4A5870"}"/>
    ${txt(182, 200, v.on ? "12 V 켜짐" : "전원 꺼짐", { size: 12.5, fill: v.on ? "#DFF8E6" : "#9AA8BC" })}
    ${txt(30, MY + 5, L, { size: 13, fill: lc, weight: 800 })}${txt(318, MY + 5, R, { size: 13, fill: rc, weight: 800 })}
  `;
}

function predict(lab: G4Lab, q: string, choices: string[], next: () => void): void {
  lab.api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  lab.f.slot.ask(q, choices.map((t) => ({ t })), () => undefined, { predict: true, nextDelay: 600, onNext: next });
}

export const g2u4MoveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 2, cls: "g2u4x-move", wait: "실험을 준비해 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "위에서 본 페트리 접시의 거름종이와 두 집게, 전원 장치");
  const label = cap(lab);
  const v: View = { wet: false, on: false, flip: false, color: "#2F7BE8", drop: null };
  let busy = false;
  let moved = false;
  const draw = (): void => {
    stage.set(scene(v));
    label.textContent = v.wet ? "질산 칼륨 수용액으로 적신 거름종이" : "마른 거름종이";
    host.dataset.g4Move = `${v.wet ? "w" : ""}${v.on ? "o" : ""}${v.drop ? "d" : ""}${moved ? "m" : ""}`;
  };

  const bWet = bvBtn("g2u4x-mv-wet", "질산 칼륨 수용액으로 적시기");
  const bOn = bvBtn("g2u4x-mv-on", "전원 켜기 (12 V)");
  const bDrop = bvBtn("main g2u4x-mv-drop", "황산 구리(Ⅱ) 수용액 떨어뜨리기");
  const bRedo = bvBtn("g2u4x-mv-redo", "거름종이를 갈고 다시 준비하기");
  const lock = (x: boolean): void => [bWet, bOn, bDrop].forEach((b) => (b.disabled = x || (b === bWet && v.wet) || (b === bOn && v.on) || (b === bDrop && !!v.drop)));

  const run = (): void => {
    busy = true;
    lock(true);
    predict(lab, "전류가 흐르는 거름종이 위에서 <b>파란색</b>은 어떻게 될까요?", ["(−)극 쪽으로 간다", "(+)극 쪽으로 간다", "제자리에서 번진다"], () => {
      f.slot.showControls();
      api.setCTA("파란색을 지켜보세요", { enabled: false });
      f.say("파란색이 천천히 움직여요. 어느 쪽으로 가는지 지켜보세요.");
      bvTween(
        tm,
        3200,
        (t) => {
          v.drop = { x: MX - 62 * t, rx: 13 + 12 * t, ry: 13 - 2 * t, a: 0.9 - 0.15 * t };
          draw();
        },
        () => {
          moved = true;
          draw();
          good();
          f.pips(1);
          f.say("파란색이 <b>(−)극 쪽</b>으로 옮겨 갔어요. 이 파란색은 <b>구리 이온</b>의 색이에요.");
          tm.later(() => {
            lab.judge("(−)극으로 끌려간 <b>구리 이온</b>은 어떤 전하를 띠나요?", [{ t: "(+)전하", ok: true }, { t: "(−)전하" }, { t: "전하를 띠지 않는다" }], "서로 다른 전하끼리 <b>끌어당겨요</b>.", () =>
              lab.finish("구리 이온은 <b>(+)전하</b>를 띠어서 <b>(−)극</b> 쪽으로 이동해요."),
            );
          }, 1500);
        },
        (x) => x,
      );
    });
  };

  bWet.addEventListener("click", () => {
    if (busy || v.wet) return;
    if (v.drop) return;
    tap();
    v.wet = true;
    lock(false);
    draw();
    f.say("거름종이가 <b>질산 칼륨 수용액</b>에 젖었어요. 이제 전류가 흐를 수 있어요.");
  });
  bOn.addEventListener("click", () => {
    if (busy || v.on) return;
    tap();
    v.on = true;
    lock(false);
    draw();
    if (v.drop && v.wet) {
      f.say("전원을 켰어요. 번져 있던 파란색을 지켜보세요.");
      tm.later(run, 400);
      return;
    }
    f.say(v.wet ? "전원을 켰어요. 젖은 거름종이에 <b>전류</b>가 흘러요." : "전원을 켰어요. 그런데 거름종이가 말라 있어요.");
  });
  bDrop.addEventListener("click", () => {
    if (busy || v.drop) return;
    tap();
    if (!v.wet) {
      // 실패: 마른 종이에는 전류가 흐르지 않는다
      bad();
      v.drop = { x: MX, rx: 10, ry: 10, a: 0.95 };
      draw();
      f.say("마른 거름종이에는 <b>전류가 흐르지 않아요</b>. 파란 방울이 떨어진 자리에 그대로 있어요.");
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
          f.say("파란색이 <b>제자리에서 둥글게</b> 번지기만 해요. 전원이 꺼져 있어요. 전원을 켜 보세요.");
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
    f.say("새 거름종이예요. 방울을 떨어뜨리기 전에 <b>무엇을 먼저</b> 해야 할까요?");
  });
  f.slot.setControls(bWet, bOn, bDrop);
  draw();
  f.say("거름종이 양 끝을 집게로 집었어요. <b>차례를 정해</b> 실험해 보세요. 파란색이 움직일까요?");
  return lab.cleanup;
};

export const g2u4PoleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 4, cls: "g2u4x-pole", wait: "보라색 수용액을 떨어뜨려 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "위에서 본 페트리 접시의 거름종이와 두 집게, 전원 장치");
  const label = cap(lab);
  const v: View = { wet: true, on: true, flip: false, color: "#8E3FD0", drop: null };
  let pos = 0; // 방울의 자리(−1: 왼쪽 끝, +1: 오른쪽 끝)
  const put = (): void => {
    const a = Math.abs(pos);
    v.drop = { x: MX + 62 * pos, rx: 13 + 12 * a, ry: 13 - 2 * a, a: 0.9 - 0.15 * a };
  };
  const draw = (): void => {
    stage.set(scene(v));
    host.dataset.g4Pos = pos.toFixed(2);
    host.dataset.g4Flip = v.flip ? "1" : "0";
  };
  label.textContent = "질산 칼륨 수용액으로 적신 거름종이, 전원 켜짐";

  const bDrop = bvBtn("main g2u4x-mv-drop", "과망가니즈산 칼륨 수용액 떨어뜨리기");
  const bEye = bvBtn("main g2u4x-mv-eye", "이온의 눈으로 보기");
  const bFlip = bvBtn("main g2u4x-mv-flip", "두 극을 서로 바꾸기");
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
    predict(lab, "보라색도 파란색처럼 <b>(−)극 쪽</b>으로 갈까요?", ["(+)극 쪽으로 간다", "(−)극 쪽으로 간다", "제자리에서 번진다"], () => {
      f.slot.setControls();
      api.setCTA("보라색을 지켜보세요", { enabled: false });
      f.say("보라색이 천천히 움직여요. 파란색과 같은 쪽인가요?");
      slide(1, 3000, () => {
        good();
        f.pips(1);
        f.say("보라색은 반대로 <b>(+)극 쪽</b>으로 갔어요. 보라색은 <b>과망가니즈산 이온</b>의 색이에요.");
        tm.later(() => {
          lab.judge("(+)극으로 끌려간 <b>과망가니즈산 이온</b>은 어떤 전하를 띠나요?", [{ t: "(−)전하", ok: true }, { t: "(+)전하" }, { t: "전하를 띠지 않는다" }], "(+)극에는 <b>(−)전하</b>를 띤 입자가 끌려가요.", () => {
            f.pips(2);
            f.slot.setControls(bEye);
            api.setCTA("이온의 눈으로 살펴보세요", { enabled: false });
            f.say("이 수용액에는 색이 없는 <b>칼륨 이온(K⁺)</b>도 들어 있어요. 이온의 눈으로 보세요.");
          });
        }, 1500);
      });
    });
  });
  bEye.addEventListener("click", () => {
    bEye.disabled = true;
    tap();
    v.ions = { t: 0 };
    label.textContent = "보라 (−): 과망가니즈산 이온  ·  흰색 (+): 칼륨 이온";
    f.say("보라색 (−) 입자와 색이 없는 (+) 입자가 서로 <b>반대쪽</b>으로 가요.");
    bvTween(
      tm,
      2400,
      (t) => {
        v.ions = { t };
        draw();
      },
      () => {
        tm.later(() => {
          lab.judge("색이 없어 보이지 않던 <b>칼륨 이온(K⁺)</b>은 어느 쪽으로 갔나요?", [{ t: "(−)극 쪽", ok: true }, { t: "(+)극 쪽" }, { t: "움직이지 않았다" }], "(+)전하를 띤 이온은 <b>(−)극</b>으로 가요.", () => {
            f.pips(3);
            delete v.ions;
            label.textContent = "질산 칼륨 수용액으로 적신 거름종이, 전원 켜짐";
            draw();
            f.slot.setControls(bFlip);
            api.setCTA("두 극을 바꾸어 보세요", { enabled: false });
            f.say("마지막으로 전선을 바꿔 끼워 <b>두 극을 서로 바꾸면</b> 보라색은 어떻게 될까요?");
          });
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
    f.say("왼쪽이 (+)극이 됐어요. 보라색이 <b>되돌아가요</b>.");
    slide(-1, 3400, () => {
      good();
      lab.finish("이온은 전하를 띠고 있어요. <b>양이온은 (−)극</b> 쪽으로 끌려가고 <b>음이온은 (+)극</b> 쪽으로 끌려가요.");
    });
  });
  f.slot.setControls(bDrop);
  draw();
  f.say("같은 장치에 이번에는 <b>보라색</b> 과망가니즈산 칼륨 수용액을 떨어뜨려 보세요.");
  return lab.cleanup;
};
