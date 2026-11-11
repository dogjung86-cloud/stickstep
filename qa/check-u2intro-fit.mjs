// 중1 Ⅱ 도입 샘플 한 화면 검사: 세 장면을 실제로 조작하며 시점마다 잰다(화면 세 가지).
// PORT=5557 node qa/check-u2intro-fit.mjs
// 시점마다 보는 것
//   · 스텝 높이가 스크롤 영역 안(스크롤 없이 다 보인다), 화면 밀림 0
//   · 제목 한 줄, 무대가 화면 위 60px 안에서 시작(두 바구니는 무대가 아래로 길다)
//   · 누르는 곳(예측 보기, 시설 카드) 높이 48px 이상
//   · 무대 안 글자 12.5px 이상(360 폭에서는 11px 이상), 잘린 글 없음, 무대 밖으로 나간 글자 없음
//   · 쌤의 말 4줄 이하
// 마지막에 틀의 "정오를 매기는 예측" 길도 잰다: 세 샘플은 모두 정오를 매기지 않는 예측이라, 공용 ask()에 정오가 있는
// 보기를 넣어 틀린 보기를 눌렀을 때(누른 보기 + 옳은 보기 + 해설 4줄)도 한 화면인지 따로 확인한다.
import * as L from "./u2intro-lib.mjs";

const SIZES = [
  [390, 700],
  [360, 700],
  [430, 932],
];
let PASS = 0;
let FAIL = 0;
const fails = [];
const ok = (cond, label) => {
  if (cond) PASS++;
  else {
    FAIL++;
    fails.push(label);
    console.log("  ✗", label);
  }
};

function judge(m, tag, w) {
  ok(m.stepH <= m.view && m.content <= m.view + 1, `${tag} 한 화면(스텝 ${m.stepH} ≤ ${m.view})`);
  ok(m.scrollTop === 0 && m.frameScroll === 0, `${tag} 화면 밀림 없음`);
  ok(m.titleLines === 1, `${tag} 제목 한 줄(${m.titleLines})`);
  ok(m.stage && m.stage.top <= 60, `${tag} 무대가 위 60px 안에서 시작(${m.stage?.top})`);
  const small = m.taps.filter((t) => t.h < 48);
  ok(small.length === 0, `${tag} 누르는 곳 48px 이상 ${JSON.stringify(small)}`);
  const minFont = w < 380 ? 11 : 12.5;
  const tiny = m.fonts.filter((f) => f.px < minFont - 0.05);
  ok(tiny.length === 0, `${tag} 무대 글자 ${minFont}px 이상 ${JSON.stringify(tiny)}`);
  ok(m.clipped.length === 0, `${tag} 잘린 글 없음 ${JSON.stringify(m.clipped)}`);
  ok(m.out.length === 0, `${tag} 무대 밖으로 나간 글자 없음 ${JSON.stringify(m.out)}`);
  ok(m.bubbleLines === null || m.bubbleLines <= 4, `${tag} 쌤의 말 4줄 이하(${m.bubbleLines})`);
}

const RUNS = [
  { id: "u2l4", play: L.playLongCell, variants: [{ pick: "손가락", how: "drag" }, { pick: "한 뼘", how: "key" }, { pick: "다리", how: "tap" }] },
  { id: "u2l9", play: L.playBaskets, variants: [{ first: "plant", how: "drag" }, { first: "animal", how: "tap", again: true }] },
  { id: "u2l2", play: L.playFactory, variants: [{ how: "card", pick: "통제실" }, { how: "stage", order: ["gen", "door", "ctrl"], swap: true, pick: "발전기" }, { how: "card", order: ["ctrl", "gen", "door"], pick: "출입문" }] },
];

for (const [w, h] of SIZES) {
  const { browser, page, errors } = await L.launch({ width: w, height: h, query: null });
  for (const R of RUNS) {
    for (const [vi, v] of R.variants.entries()) {
      await L.openSample(page, R.id);
      const before = PASS + FAIL;
      let n = 0;
      await R.play(page, {
        ...v,
        on: async (mark) => {
          n++;
          judge(await L.measure(page), `${w}×${h} ${R.id} #${vi + 1} ${mark}`, w);
        },
      });
      const st = await L.ctaState(page);
      ok(st.enabled, `${w}×${h} ${R.id} #${vi + 1} 끝나면 아래 버튼 열림("${st.text}")`);
      console.log(`${w}×${h} ${R.id} #${vi + 1}: 시점 ${n}개, 검사 ${PASS + FAIL - before}개`);
    }
  }

  // 틀의 정오 예측 길(가장 긴 경우): 긴 세포 장면을 끝낸 화면에서 예측 칸을 비우고 공용 ask()를 직접 불러 틀린 보기를 누른다
  await L.openSample(page, "u2l4");
  await L.playLongCell(page, { pick: "다리", how: "key" });
  await page.evaluate(() => {
    const step = document.querySelector(".screen.active .step");
    step.classList.remove("opn-picked");
    const box = step.querySelector(".hook-choices");
    box.innerHTML = "";
    box.classList.remove("locked", "show");
  });
  await page.evaluate(async () => {
    const { ask } = await import("/src/lessons/steps/hookAsk.ts");
    const step = document.querySelector(".screen.active .step");
    const box = step.querySelector(".hook-choices");
    const bubble = step.querySelector(".opn-bubble");
    bubble.innerHTML = "정오를 매기는 예측을 넣었을 때의 틀 검사예요. 질문은 두 줄까지 쓰고, 보기는 한 줄로 써요. 어느 쪽일까요?";
    ask(box, bubble, {
      choices: ["옳은 보기는 이쯤의 길이로 써요", "틀린 보기도 길이를 나란히 맞춰요", "셋째 보기도 한 줄 안에서 끝나요"],
      good: "옳은 예측을 골랐을 때의 말이에요. 두세 줄 안에서 까닭을 짚고 다음으로 넘겨요.",
      bad: "틀린 예측을 골랐을 때의 말이에요. 고른 생각이 왜 그럴듯한지 짚고, 옳은 쪽을 알려 준 다음, 실험으로 넘겨요. 이쯤이 가장 긴 경우예요.",
      shuffle: false,
      onDone: () => step.classList.add("opn-picked"),
    });
  });
  await L.W(page, 500);
  judge(await L.measure(page), `${w}×${h} 틀 검사 정오 예측이 뜬 때`, w);
  await L.choose(page, 1);
  await L.W(page, 500);
  const m = await L.measure(page);
  judge(m, `${w}×${h} 틀 검사 틀린 보기를 누른 뒤`, w);
  const seen = await page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll").getBoundingClientRect();
    const inView = (sel) => {
      const e = document.querySelector(`.screen.active ${sel}`);
      if (!e) return false;
      const r = e.getBoundingClientRect();
      return r.top >= sc.top - 1 && r.bottom <= sc.bottom + 1;
    };
    const miss = document.querySelector(".screen.active .hook-choice.miss");
    const bubble = document.querySelector(".screen.active .opn-bubble");
    const reveal = document.querySelector(".screen.active .hook-choice.reveal");
    return {
      miss: inView(".hook-choice.miss"),
      reveal: inView(".hook-choice.reveal"),
      bubble: inView(".opn-bubble"),
      gap: miss && bubble ? Math.round(bubble.getBoundingClientRect().top - Math.max(miss.getBoundingClientRect().bottom, reveal?.getBoundingClientRect().bottom ?? 0)) : null,
      dim: [...document.querySelectorAll(".screen.active .hook-choice.dim")].filter((e) => e.getClientRects().length).length,
    };
  });
  ok(seen.miss && seen.reveal && seen.bubble, `${w}×${h} 틀 검사 누른 보기, 옳은 보기, 해설이 모두 화면 안 ${JSON.stringify(seen)}`);
  ok(seen.gap !== null && seen.gap <= 12, `${w}×${h} 틀 검사 해설이 보기 바로 아래(간격 ${seen.gap}px)`);
  ok(seen.dim === 0, `${w}×${h} 틀 검사 고르지 않은 보기는 접힘`);
  ok(errors.length === 0, `${w}×${h} 페이지 오류 없음 ${JSON.stringify(errors)}`);
  await browser.close();
}
console.log(`\n한 화면 검사: ${PASS}/${PASS + FAIL} 통과`);
if (FAIL) {
  console.log(fails.join("\n"));
  process.exit(1);
}
