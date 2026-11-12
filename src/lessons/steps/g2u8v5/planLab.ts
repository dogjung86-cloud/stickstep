// [중2 Ⅷ v5] g2u8l8 planLab: 「화성 탐사에 무엇을 실어 갈까요?」
// 책의 어디에서: 탐구 '우주 탐사 계획 세우기'(탐사할 천체와 목적을 정하고, 임무와 가져갈 장비, 예상 성과를 적은 탐사 계획 보고서를 만든다. 예시는 화성 기지 답사).
// 한 통찰: 탐사 계획은 목적에서 임무가 나오고, 임무에 맞춰 장비를 고른다.
// 학생이 정하는 것: 임무 셋에 맞춰 실을 장비 셋. 실패하는 길: 임무에 맞지 않는 장비를 실으면 그 임무가 실패로 돌아온다(계획을 고쳐 다시 보낸다).
// 화성의 모습은 실사(public/photos/mars.jpg).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sDisk, sFrame, sText, type LabStep } from "./kit";

const TASKS = [
  { name: "기지 세울 땅 조사하기", need: 0, fail: "땅의 성분을 알아낼 장비가 없었어요" },
  { name: "지구와 통신하기", need: 1, fail: "지구와 연락할 장비가 없었어요" },
  { name: "숨 쉴 산소 만들기", need: 2, fail: "산소를 만들 장비가 없었어요" },
];
const GEAR = ["토양 분석기", "통신 안테나", "산소 발생 장치", "우산", "고무보트", "부채"];
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export const planLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  f.stage.appendChild(el("img", { class: "g2u8x-mars", attrs: { src: `${BASE}photos/mars.jpg`, alt: "붉은 화성", draggable: "false" } }));
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
  const bGo = bvBtn("main", "화성으로 출발");
  const paint = (): void => {
    chips.forEach((c, i) => c.classList.toggle("on", picked.has(i)));
    bGo.disabled = picked.size !== 3 || flying || finished;
    bGo.textContent = picked.size === 3 ? "화성으로 출발" : `장비를 ${3 - picked.size}개 더 골라요`;
  };
  f.slot.setControls(el("div", { class: "g2u8x-chips c3" }, ...chips), bGo);

  bGo.addEventListener("click", () => {
    if (picked.size !== 3 || flying) return;
    haptic(HAPTIC.tap);
    flying = true;
    fly = 0;
    paint();
    f.say("탐사선이 화성으로 날아가고 있어요. 임무를 해낼 수 있을까요?");
    tm.later(() => {
      flying = false;
      result = TASKS.map((t) => picked.has(t.need));
      const ok = result.filter(Boolean).length;
      f.pips(ok);
      if (ok === 3) {
        finished = true;
        haptic(HAPTIC.correct);
        paint();
        f.say("세 임무를 <b>모두 해냈어요</b>. 임무에 꼭 맞는 장비를 골랐어요.");
        tm.later(askFinal, 1800);
      } else {
        haptic(HAPTIC.wrong);
        const bad = TASKS.find((_task, i) => !result![i])!;
        paint();
        f.say(`임무 ${3 - ok}개가 <b>실패</b>했어요. ${bad.fail}. 장비를 바꿔 <b>계획을 고쳐</b> 다시 보내 보세요.`);
      }
    }, 2000);
  });

  function askFinal(): void {
    f.slot.ask(
      "탐사에 가져갈 장비는 무엇에 맞춰 골라야 할까요?",
      [{ t: "탐사의 목적과 임무", ok: true }, { t: "장비의 크기" }, { t: "장비의 색깔" }],
      (ok) => api.recordQuiz(ok),
      { why: "임무에 맞지 않는 장비로는 임무를 해낼 수 없어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("계획 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("우주 탐사 계획은 <b>탐사할 천체와 목적</b>을 먼저 정하고, 목적에 맞는 <b>임무</b>와 임무를 해낼 <b>장비</b>를 갖춰 세워요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    if (flying) fly = Math.min(1, fly + dt / 110);
    // 탐사 계획 보고서(왼쪽)
    sText(ctx, "탐사 계획: 화성 기지 답사", 12, 16, { color: S.ink, px: 12.5, align: "left", w: 800 });
    TASKS.forEach((task, i) => {
      const y = 32 + i * 46;
      const r = result ? result[i] : null;
      sBox(ctx, 10, y, w - 132, 40, 10, "rgba(255,255,255,.06)", r === null ? "rgba(255,255,255,.14)" : r ? S.ok : "#FF7A85", 1.4);
      sText(ctx, `임무 ${i + 1}`, 20, y + 13, { color: S.dim, px: 12, align: "left" });
      sText(ctx, task.name, 20, y + 28, { color: S.ink, px: 12.5, align: "left", w: 800 });
      if (r !== null) sText(ctx, r ? "성공" : "실패", w - 132, y + 20, { color: r ? S.ok : "#FF7A85", px: 13, align: "right", w: 800 });
    });
    sText(ctx, `실은 장비 ${picked.size}/3`, 12, h - 14, { color: picked.size === 3 ? S.gold : S.dim, px: 12.5, align: "left", w: 800 });
    // 날아가는 탐사선(오른쪽 화성 사진 쪽으로)
    if (flying) {
      const x = w - 150 + fly * 70;
      const y = h - 30 - fly * 70;
      sDisk(ctx, x, y, 4, "#fff");
      for (let i = 1; i < 4; i++) sDisk(ctx, x - i * 6, y + i * 6, 2.5 - i * 0.5, `rgba(255,200,120,${0.6 - i * 0.15})`);
    }
    sText(ctx, "화성", w - 60, h - 16, { color: S.ink, px: 12 });
  });

  paint();
  f.say("화성에 기지를 세우기 전에 미리 가 보는 탐사예요. 왼쪽의 <b>임무 셋</b>을 해낼 <b>장비 세 개</b>를 골라 실어 보세요.");
  api.setCTA("탐사 계획을 세워 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
