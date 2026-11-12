// [중2 Ⅳ v5] g2u4l1 물 분해 랩: 「물은 더 나눌 수 있을까요?」
// 책의 활동(라부아지에보다 더 간단하게 물 분해하기)을 손으로 한다: 유리컵의 증류수에 황산 나트륨을 조금 녹이고 9 V 건전지를 세워 넣는다.
// 학생이 정하는 것: 준비의 차례(황산 나트륨을 녹일지, 건전지를 언제 넣을지).
// 실패하는 길: 황산 나트륨을 녹이지 않고 건전지를 넣으면 기포가 거의 생기지 않는다(순수한 물은 전류가 잘 흐르지 않는다). 꺼내고 다시 준비한다.
// 성공: 두 극에서 기포가 올라온다. (−)극 쪽 수소가 (+)극 쪽 산소보다 약 두 배 많다.
// 판정: 물에서 수소와 산소가 나왔다면 물은 한 가지 성분인가. 결론: 물은 수소와 산소로 분해된다.

import type { StepRenderer } from "../../types";
import { bad, bvBtn, cap, g4Lab, g4Svg, good, tap, txt, type G4Step } from "./kit";

export const g2u4WaterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G4Step;
  const lab = g4Lab(host, api, s, { steps: 2, cls: "g2u4x-water", wait: "물을 분해해 보세요" });
  const { f, tm } = lab;
  const stage = g4Svg(lab, "유리컵에 담긴 물과 세워 넣는 건전지");
  const label = cap(lab);

  let salt = false;
  let battery = false;
  let busy = false;

  // 컵: x 108~238, 물 표면 y 62, 바닥 y 204. 건전지: 폭 54, 단자는 위쪽((+)는 작게 왼쪽, (−)는 크게 오른쪽).
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
        ${txt(159, 144, "(+)", { size: 12.5, fill: "#5A2A00", weight: 800 })}${txt(187, 144, "(−)", { size: 12.5, fill: "#5A2A00", weight: 800 })}
        ${txt(173, 180, "9 V", { size: 13, fill: "#DCE5F2" })}
      </g>`
          : ""
      }
      ${run ? bubbles(160, 5, "o") + bubbles(186, 10, "h") : ""}
      ${weak ? `<circle class="g2u4x-bub o" cx="160" cy="118" r="2" style="animation-duration:5s"/>` : ""}
      ${run ? txt(70, 96, "산소", { fill: "#FFB4A8", size: 13 }) + txt(70, 113, "기포 적음", { size: 12 }) + txt(282, 96, "수소", { fill: "#A8CCFF", size: 13 }) + txt(282, 113, "기포 많음", { size: 12 }) : ""}
    `);
    label.textContent = salt ? "증류수 + 황산 나트륨" : "증류수";
    host.dataset.g4Water = run ? "run" : weak ? "weak" : "idle";
  };

  const bSalt = bvBtn("g2u4x-w-salt", "황산 나트륨 조금 녹이기");
  const bBat = bvBtn("main g2u4x-w-bat", "건전지 세워 넣기");
  bSalt.addEventListener("click", () => {
    if (busy || salt) return;
    if (battery) {
      f.say("건전지를 넣은 채로는 저을 수 없어요. 먼저 <b>건전지를 꺼내요</b>.");
      bad();
      return;
    }
    tap();
    salt = true;
    bSalt.disabled = true;
    bSalt.textContent = "황산 나트륨을 녹였어요";
    draw();
    f.say("황산 나트륨이 녹았어요. 이제 <b>건전지</b>를 세워 넣어 보세요.");
  });
  bBat.addEventListener("click", () => {
    if (busy) return;
    if (battery) {
      tap();
      battery = false;
      bBat.textContent = "건전지 세워 넣기";
      draw();
      f.say("건전지를 꺼냈어요. 무엇을 더 준비하면 좋을까요?");
      return;
    }
    battery = true;
    draw();
    if (!salt) {
      bad();
      bBat.textContent = "건전지 꺼내기";
      f.say("기포가 <b>거의 생기지 않아요</b>. 순수한 물은 전류가 잘 흐르지 않아요. 꺼내고 다시 준비해요.");
      return;
    }
    good();
    busy = true;
    bBat.disabled = true;
    f.pips(1);
    f.say("두 극에서 <b>기포</b>가 올라와요. (−)극 쪽 기체는 수소, (+)극 쪽 기체는 산소예요.");
    tm.later(() => {
      lab.judge("물에 전류를 흘리니 <b>수소와 산소</b>가 나왔어요. 물은?", [{ t: "두 가지 성분으로 된 물질", ok: true }, { t: "한 가지 성분으로 된 물질" }, { t: "수소와 같은 물질" }], "물은 <b>수소와 산소</b>로 분해돼요.", () =>
        lab.finish("물은 <b>수소와 산소</b>로 분해돼요. 더 분해할 수 있으니 한 가지 성분으로 된 물질이 아니에요."),
      );
    }, 3200);
  });
  f.slot.setControls(bSalt, bBat);
  draw();
  f.say("컵에 <b>증류수</b>가 있어요. 준비물을 골라 물에 전류를 흘려 보세요.");
  return lab.cleanup;
};
