// [중2 Ⅳ v5] g2u4l1 물 분해 랩: 「물에 전류를 흘려 주면 다른 물질로 분해될까요?」
// 활동(라부아지에보다 더 간단하게 물 분해하기)을 손으로 한다: 유리컵의 증류수에 황산 나트륨을 조금 녹이고 9 V 건전지를 세워 넣는다.
// 학생이 정하는 것: 준비의 차례(황산 나트륨을 녹일지, 건전지를 언제 넣을지).
// 실패하는 길: 황산 나트륨을 녹이지 않고 건전지를 넣으면 기포가 거의 생기지 않는다(순수한 물은 전류가 잘 흐르지 않는다). 꺼내고 다시 준비한다.
// 성공: 두 극에서 기포가 올라온다. (−)극 쪽 수소가 (+)극 쪽 산소보다 약 두 배 많다.
// 판정: 물에서 수소와 산소가 나왔다면 물은 한 가지 성분인가. 결론: 물은 수소와 산소로 분해된다.

import type { StepRenderer } from "../../types";
import { bad, bvBtn, cap, g4Lab, g4Svg, good, tap, txt, type G4Step } from "./kit";

export const g2u4WaterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 2, cls: "g2u4x-water", wait: "준비물을 사용해 물에 전류를 흘려 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "유리컵에 담긴 물과 세워 넣는 건전지");
  const label = cap(lab);

  let salt = false;
  let battery = false;
  let busy = false;

  // 컵: x 108~238, 물 표면 y 62, 바닥 y 204. 건전지: 폭 54, 단자는 위쪽((+)는 작게 왼쪽, (−)는 크게 오른쪽).
  // 극 이름표 "(+)극", "(−)극"은 건전지 띠(폭 54)에 둘이 나란히 들지 않아 단자 바로 바깥 옆(물속, 단자 높이)에 둔다. 기포는 단자 위로만 솟아 겹치지 않는다.
  const bubbles = (x: number, n: number, cls: string): string =>
    Array.from({ length: n }, (_, i) => `<circle class="g2u4x-bub ${cls}" cx="${x + ((i * 7) % 11) - 5}" cy="118" r="${2.6 + (i % 3) * 0.7}" style="animation-delay:${(-i * 1.9) / n}s"/>`).join("");
  const draw = (): void => {
    const run = salt && battery;
    const weak = !salt && battery;
    stage.set(`
      <path d="M108 40 L114 200 Q114 206 122 206 L224 206 Q232 206 232 200 L238 40" fill="rgba(160,200,255,.06)" stroke="#9CB4D6" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M109.5 62 L114.5 199 Q115 204 122 204 L224 204 Q231 204 231.5 199 L236.5 62 Z" fill="${salt ? "rgba(120,190,255,.3)" : "rgba(120,190,255,.22)"}"/>
      <line x1="110" y1="62" x2="236" y2="62" stroke="#BFE0FF" stroke-width="1.6" opacity=".8"/>
      ${salt ? Array.from({ length: 9 }, (_, i) => `<circle cx="${124 + i * 12.5}" cy="${190 + ((i * 5) % 9)}" r="1.4" fill="#fff" opacity=".55"/>`).join("") : ""}
      ${
        battery
          ? `<g class="g2u4x-bat">
        <rect x="146" y="128" width="54" height="74" rx="5" fill="#2E3B52" stroke="#111A2A" stroke-width="1.6"/>
        <rect x="146" y="128" width="54" height="22" rx="5" fill="#D9A441"/>
        <rect x="155" y="118" width="9" height="11" rx="2" fill="#C9D2DC"/><rect x="179" y="116" width="14" height="13" rx="3" fill="#C9D2DC"/>
        ${txt(152, 127, "(+)극", { size: 12.5, fill: "#FFE08A", weight: 800, anchor: "end" })}${txt(196, 127, "(−)극", { size: 12.5, fill: "#FFE08A", weight: 800, anchor: "start" })}
        ${txt(173, 180, "9 V", { size: 13, fill: "#DCE5F2" })}
      </g>`
          : ""
      }
      ${run ? bubbles(160, 5, "o") + bubbles(186, 10, "h") : ""}
      ${weak ? `<circle class="g2u4x-bub o" cx="160" cy="118" r="2" style="animation-duration:5s"/>` : ""}
      ${run ? txt(70, 96, "산소 기체", { fill: "#FFB4A8", size: 13 }) + txt(70, 113, "기포 적음", { size: 12 }) + txt(282, 96, "수소 기체", { fill: "#A8CCFF", size: 13 }) + txt(282, 113, "기포 많음", { size: 12 }) : ""}
    `);
    label.textContent = salt ? "증류수 + 황산 나트륨" : "순수한 증류수";
    host.dataset.g4Water = run ? "run" : weak ? "weak" : "idle";
  };

  const bSalt = bvBtn("g2u4x-w-salt", "황산 나트륨 조금 녹이기");
  const bBat = bvBtn("main g2u4x-w-bat", "건전지 세워 넣기");
  bSalt.addEventListener("click", () => {
    if (busy || salt) return;
    if (battery) {
      f.say("건전지가 들어 있는 상태에서는 물을 저을 수 없어요. 먼저 <b>건전지 꺼내기</b>를 눌러 건전지를 꺼내 보세요.");
      bad();
      return;
    }
    tap();
    salt = true;
    bSalt.disabled = true;
    bSalt.textContent = "황산 나트륨 녹임";
    draw();
    f.say("증류수에 황산 나트륨이 골고루 녹았어요! 이제 <b>건전지 세워 넣기</b>를 눌러 전류를 흘려 보세요.");
  });
  bBat.addEventListener("click", () => {
    if (busy) return;
    if (battery) {
      tap();
      battery = false;
      bBat.textContent = "건전지 세워 넣기";
      draw();
      f.say("건전지를 꺼냈어요. 물에 전류가 잘 흐르게 하려면 무엇을 먼저 넣어야 할까요?");
      return;
    }
    battery = true;
    draw();
    if (!salt) {
      bad();
      bBat.textContent = "건전지 꺼내기";
      f.say("전극에서 기포가 <b>거의 생기지 않아요</b>. 순수한 물은 전류가 잘 흐르지 않기 때문이에요. 건전지를 꺼내고 전류가 잘 흐르도록 먼저 준비해 보세요.");
      return;
    }
    good();
    busy = true;
    bBat.disabled = true;
    f.pips(1);
    f.say("전류가 흐르면서 두 전극에서 <b>기포</b>가 뽀글뽀글 올라와요! (−)극에서는 수소 기체가, (+)극에서는 산소 기체가 발생했어요.");
    tm.later(() => {
      lab.judge(
        "물에 전류를 흘려 주었더니 <b>수소와 산소</b>로 나누어졌어요. 이 실험으로 알 수 있는 물의 특징은 무엇인가요?",
        [{ t: "두 가지 성분으로 이루어진 물질이다", ok: true }, { t: "더 이상 분해되지 않는 한 가지 성분으로 된 물질이다" }, { t: "성질이 수소 기체와 똑같은 물질이다" }],
        "물이 전류에 의해 <b>수소와 산소</b>라는 두 가지 성분으로 분해되었기 때문이에요.",
        () => lab.finish("물은 전류를 흘려 주면 <b>수소와 산소</b>로 분해돼요. 따라서 물은 한 가지 성분으로 이루어진 기본 물질(원소)이 아니에요."),
      );
    }, 3200);
  });
  f.slot.setControls(bSalt, bBat);
  draw();
  f.say("컵에 순수한 물인 <b>증류수</b>가 담겨 있어요. 아래 준비물을 사용해 물에 전류를 흘려 보세요.");
  return lab.cleanup;
};
