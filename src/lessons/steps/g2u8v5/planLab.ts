// [중2 Ⅷ v5] g2u8l8 planLab: 「달 얼음 탐사에 무엇을 실어 갈까요?」
// 다루는 내용: 탐구 활동(탐사할 천체와 목적을 정하고, 임무와 가져갈 장비, 예상 성과를 적은 탐사 계획 보고서를 만든다).
// 예시는 햇빛이 들지 않는 달 남극의 깊은 분화구에서 얼음을 찾는 탐사다. 활동의 예시로만 쓰고, 달의 얼음을 개념이나 문제로 묻지 않는다.
// 한 통찰: 탐사 계획은 목적에서 임무가 나오고, 임무에 맞춰 장비를 고른다.
// 학생이 정하는 것: 임무 셋에 맞춰 실을 장비 셋. 실패하는 길: 임무에 맞지 않는 장비를 실으면 그 임무가 실패로 돌아온다(계획을 고쳐 다시 보낸다).
// 달의 모습은 실사(public/photos/moon_lro.jpg, NASA LRO 모자이크).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sDisk, sFrame, sText, type LabStep } from "./kit";

const TASKS = [
  { name: "어두운 분화구에서 얼음 찾기", need: 0, fail: "땅속의 얼음을 찾아낼 탐지 장비가 없었어요" },
  { name: "얼어붙은 땅을 파서 시료 얻기", need: 1, fail: "단단히 언 땅을 파낼 장비가 없었어요" },
  { name: "지구에 탐사 자료 전송하기", need: 2, fail: "지구와 신호를 주고받을 통신 장비가 없었어요" },
];
const GEAR = ["얼음 탐지기", "시추 드릴", "통신 안테나", "우산", "고무보트", "부채"];
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export const planLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api, tall: true });
  f.stage.appendChild(el("img", { class: "g2u8x-moon", attrs: { src: `${BASE}photos/moon_lro.jpg`, alt: "회색빛 달", draggable: "false" } }));
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  const picked = new Set<number>();
  let result: boolean[] | null = null;
  let fly = 0; // 0 대기, 0~1 날아가는 중
  let flying = false;
  let finished = false;

  const chips = GEAR.map((t, i) => {
    const b = el("button", { class: "g2u8x-chip", text: t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = String(i);
    b.addEventListener("click", () => {
      if (flying || finished) return;
      if (picked.has(i)) picked.delete(i);
      else if (picked.size < 3) picked.add(i);
      else {
        f.say("탐사선에는 장비를 <b>세 개</b>만 실을 수 있어요. 하나를 빼고 골라 보세요.");
        return;
      }
      haptic(HAPTIC.tap);
      result = null;
      paint();
    });
    return b;
  });
  const bGo = bvBtn("main", "탐사선 발사하기");
  const paint = (): void => {
    chips.forEach((c, i) => c.classList.toggle("on", picked.has(i)));
    bGo.disabled = picked.size !== 3 || flying || finished;
    bGo.textContent = picked.size === 3 ? "탐사선 발사하기" : `장비를 ${3 - picked.size}개 더 골라 주세요`;
  };
  f.slot.setControls(el("div", { class: "g2u8x-chips c3" }, ...chips), bGo);

  bGo.addEventListener("click", () => {
    if (picked.size !== 3 || flying) return;
    haptic(HAPTIC.tap);
    flying = true;
    fly = 0;
    paint();
    f.say("탐사선이 달로 날아가고 있어요. 임무를 해낼 수 있을까요?");
    tm.later(() => {
      flying = false;
      result = TASKS.map((t) => picked.has(t.need));
      const ok = result.filter(Boolean).length;
      f.pips(ok);
      if (ok === 3) {
        finished = true;
        haptic(HAPTIC.correct);
        paint();
        f.say("세 가지 임무를 <b>모두 성공적으로 완수했어요</b>! 탐사 목적과 임무에 꼭 맞는 장비를 골랐기 때문이에요.");
        tm.later(askFinal, 1800);
      } else {
        haptic(HAPTIC.wrong);
        const bad = TASKS.find((_task, i) => !result![i])!;
        paint();
        f.say(`임무 ${3 - ok}개가 <b>실패</b>했어요(${bad.fail}). 임무와 맞지 않는 장비를 빼고 <b>탐사 계획을 수정해</b> 다시 발사해 보세요.`);
      }
    }, 2000);
  });

  function askFinal(): void {
    f.slot.ask(
      "우주 탐사 계획을 세울 때 탐사선에 실어 갈 장비는 무엇에 맞추어 결정해야 하나요?",
      [{ t: "탐사할 천체의 환경 및 탐사 목적과 임무", ok: true }, { t: "장비의 겉모양과 색깔" }, { t: "일상생활에서 자주 쓰는 순서" }],
      (ok) => api.recordQuiz(ok),
      { why: "우주 탐사 계획은 먼저 <b>탐사할 천체와 목적</b>을 정하고, 그 목적을 이루기 위한 <b>임무</b>에 꼭 필요한 장비를 선택해야 해요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("탐사 목적에 맞는 임무와 장비를 갖추어 달 얼음 탐사를 성공적으로 마쳤어요!");
    f.slot.conclude("우주 탐사 계획을 세울 때는 <b>탐사할 천체와 탐사 목적</b>을 먼저 정한 뒤, 목적에 맞는 구체적인 <b>임무</b>와 그 임무를 수행할 <b>장비</b>를 맞추어 계획해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    if (flying) fly = Math.min(1, fly + dt / 110);
    // 탐사 계획 보고서(왼쪽)
    sText(ctx, "탐사 계획: 달 얼음 탐사", 12, 16, { color: S.ink, px: 12.5, align: "left", w: 800 });
    TASKS.forEach((task, i) => {
      const y = 32 + i * 46;
      const r = result ? result[i] : null;
      sBox(ctx, 10, y, w - 132, 40, 10, "rgba(255,255,255,.06)", r === null ? "rgba(255,255,255,.14)" : r ? S.ok : "#FF7A85", 1.4);
      sText(ctx, `임무 ${i + 1}`, 20, y + 13, { color: S.dim, px: 12, align: "left" });
      sText(ctx, task.name, 20, y + 28, { color: S.ink, px: 12.5, align: "left", w: 800 });
      // 성공과 실패는 '임무 N'과 같은 윗줄에 적는다(임무 이름이 길어 가운데 높이에 두면 이름 끝과 겹친다)
      if (r !== null) sText(ctx, r ? "성공" : "실패", w - 132, y + 13, { color: r ? S.ok : "#FF7A85", px: 13, align: "right", w: 800 });
    });
    sText(ctx, `실은 장비 ${picked.size}/3`, 12, h - 14, { color: picked.size === 3 ? S.gold : S.dim, px: 12.5, align: "left", w: 800 });
    // 날아가는 탐사선(오른쪽 달 사진 쪽으로)
    if (flying) {
      const x = w - 150 + fly * 70;
      const y = h - 30 - fly * 70;
      sDisk(ctx, x, y, 4, "#fff");
      for (let i = 1; i < 4; i++) sDisk(ctx, x - i * 6, y + i * 6, 2.5 - i * 0.5, `rgba(255,200,120,${0.6 - i * 0.15})`);
    }
    sText(ctx, "달", w - 60, h - 16, { color: S.ink, px: 12 });
  });

  paint();
  f.say("햇빛이 들지 않는 달 남극의 깊은 분화구에 얼음이 있는지 찾아보는 탐사예요. 왼쪽의 <b>임무 셋</b>을 해낼 <b>장비 세 개</b>를 골라 실어 보세요.");
  api.setCTA("탐사 계획을 세워 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
