// 중1 Ⅱ v5(열 레슨) 실플레이 E2E.
//   A. 정답 경로: 열 레슨을 도입부터 마지막 문제까지 CTA로만 걸어간다(랩 열세 판 + 문제 51개).
//   B. 오답 경로: 랩의 채점 판정을 일부러 틀리고(오답 카드가 누른 보기 바로 아래에 뜨는지, '다음'을 눌러야만 넘어가는지),
//      차례 틀리기, 덮개 유리 빨리 덮기, 엉뚱한 곳 누르기, 알맞지 않은 세포 맡기기, 되돌리기를 해 본 뒤, 문제도 한 번씩 틀려 본다.
//   C. 토글: ss.u2v5가 꺼져 있으면 Ⅱ단원이 정본 v3와 글자 하나까지 같다. 주소 ?u2v5가 세션 표식을 켠다.
//      켜져 있어도 레슨 열 개의 id, 제목, 이름표, 쪽수, 잠금은 v3와 같다(진도 기록과 시험 풀이 이 id에 묶여 있다).
//   D. 화면 글 검사: 걷는 동안 화면에 뜬 글을 모아 대시, '교과서', 출판사 이름, '분자', 이모지, 이 책에 없는 용어를 찾는다.
// 랩 조작은 qa/u2v5-lib.mjs의 것을 쓴다(한 화면 검사와 같은 조작). 레슨은 CURRICULUM에서 꺼내 연다.
//   PORT=5547 node qa/e2e-u2v5.mjs            (전부)
//   PORT=5547 ONLY=C node qa/e2e-u2v5.mjs     (토글만 빨리 볼 때)
//   PORT=5547 FROM=4 node qa/e2e-u2v5.mjs      (4번 레슨부터. A, B만 해당)
import {
  PORT, launch, openLesson, W, cta, ctaState, tap, waitFor, measure,
  playMagnify, playCellWork, playSlide, playScope, wrongCard, concluded, ds,
  playCellFit, playLevelBuild, playEcoMap, playBeakIsles, playKin, playRankWiden, playKingdomPath, playFoodWeb,
} from "./u2v5-lib.mjs";

let PASS = 0;
let FAIL = 0;
const fails = [];
const ok = (cond, label) => {
  if (cond) {
    PASS++;
    console.log("  ✓", label);
  } else {
    FAIL++;
    fails.push(label);
    console.log("  ✗", label);
  }
};

// ── 화면 글 모으기 ──────────────────────────────────────────────────
const seen = new Map(); // 글 → 처음 본 자리
const grab = async (page, where) => {
  const t = await page.evaluate(() => {
    const out = [];
    const w = document.querySelector(".screen.active .stepWrap");
    if (w) out.push(w.innerText);
    const sheet = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open"));
    if (sheet) out.push(sheet.innerText);
    const c = document.querySelector(".screen.active .btn.cta");
    if (c) out.push(c.textContent);
    w?.querySelectorAll("[aria-label]").forEach((e) => out.push(e.getAttribute("aria-label")));
    w?.querySelectorAll("img[alt]").forEach((e) => out.push(e.getAttribute("alt")));
    return out.join("\n");
  });
  for (const line of t.split("\n").map((x) => x.trim()).filter(Boolean)) if (!seen.has(line)) seen.set(line, where);
};

// ── 공용 조작(훅, 문제) ─────────────────────────────────────────────
const dispatchSel = (page, sel) => page.evaluate((s) => document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);
const clickAll = async (page, sel, gap = 320) => {
  const n = await page.evaluate((s) => document.querySelectorAll(`.screen.active ${s}`).length, sel);
  for (let i = 0; i < n; i++) {
    await page.evaluate(({ s, i }) => document.querySelectorAll(`.screen.active ${s}`)[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })), { s: sel, i });
    await W(page, gap);
  }
  return n;
};
const hookChoice = async (page, text, tries = 30) => {
  for (let t = 0; t < tries; t++) {
    const done = await page.evaluate((x) => {
      const b = [...document.querySelectorAll(".screen.active .hook-choice")].filter((c) => !c.disabled && c.offsetParent !== null).find((c) => c.textContent.includes(x));
      if (b) {
        b.click();
        return true;
      }
      return false;
    }, text);
    if (done) {
      await W(page, 450);
      return true;
    }
    await W(page, 300);
  }
  return false;
};
/** 피드백 시트가 정답 시트인지 보고, 계속하기를 누른다. */
const sheet = async (page, where) => {
  await W(page, 250);
  await grab(page, `${where} 해설`);
  const good = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
  const open = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open")));
  await page.evaluate(() => {
    const s = [...document.querySelectorAll(".sheet")].find((x) => x.className.includes("open"));
    [...(s?.querySelectorAll("button") ?? [])].pop()?.click();
  });
  await W(page, 520);
  return { good, open };
};
/** 문제 한 개. kind: mcq | multi | ox-o | ox-x, ans: 저작 인덱스(dev 전용 data-oi). */
const quiz = async (page, kind, ans, where) => {
  await grab(page, where);
  if (kind === "ox-o") await dispatchSel(page, ".ox-btn.o");
  else if (kind === "ox-x") await dispatchSel(page, ".ox-btn.x");
  else if (Array.isArray(ans)) {
    for (const i of ans) {
      await dispatchSel(page, `.opts .opt[data-oi="${i}"]`);
      await W(page, 140);
    }
  } else await dispatchSel(page, `.opts .opt[data-oi="${ans}"]`);
  await W(page, 230);
  await cta(page);
  return sheet(page, where);
};
const figureOk = (page) =>
  page.evaluate(() => {
    const fig = document.querySelector(".screen.active .q-figure");
    if (!fig) return false;
    const imgs = [...fig.querySelectorAll("img")];
    return imgs.length ? imgs.every((i) => i.complete && i.naturalWidth > 0) : fig.children.length > 0;
  });
/** 분류: [칩 글자의 일부, 통 id] 쌍으로 담는다. */
const binSort = async (page, pairs, where) => {
  await grab(page, where);
  for (let i = 0; i < 30; i++) {
    const t = await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.textContent?.trim() ?? null);
    if (!t) break;
    const bin = pairs.find(([k]) => t.includes(k))?.[1];
    if (!bin) throw new Error(`분류 표에 없는 칩: ${t}`);
    await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.click());
    await W(page, 130);
    await page.evaluate((b) => document.querySelector(`.screen.active .bin[data-bin="${b}"]`)?.click(), bin);
    await W(page, 150);
  }
  await cta(page);
  return sheet(page, where);
};
const orderChips = async (page, texts, where) => {
  await grab(page, where);
  for (const t of texts) {
    await page.evaluate((x) => [...document.querySelectorAll(".screen.active .ord-chip")].find((c) => c.textContent.includes(x) && !c.disabled && !c.className.includes("picked"))?.click(), t);
    await W(page, 200);
  }
  await W(page, 200);
  await cta(page);
  return sheet(page, where);
};
/** 짝 잇기: [왼쪽 글, 오른쪽 글] 쌍을 차례로 잇는다. */
const pairAll = async (page, pairs, where) => {
  await grab(page, where);
  for (const [a, b] of pairs) {
    await page.evaluate((t) => [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(), a);
    await W(page, 200);
    await page.evaluate((t) => [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(), b);
    await W(page, 340);
  }
  await W(page, 600);
  await cta(page);
  return sheet(page, where);
};
const cutLoaded = (page) => page.evaluate(() => {
  const img = document.querySelector('.screen.active img[src*="/cuts/"]');
  return !!img && img.complete && img.naturalWidth > 0;
});
const stepType = (page) => page.evaluate(() => document.querySelector(".screen.active .step")?.className ?? "");

/** 랩 한 판을 돌고 마무리를 검사한다. */
async function lab(page, label, play, opts, ctaLabel, wrong) {
  let before = null;
  const marks = [];
  let card = null;
  let stuck = null;
  const on = async (m) => {
    marks.push(m);
    await grab(page, `${label} ${m}`);
    if (m === "mount") before = await ctaState(page);
    if (m.endsWith("-wrong")) {
      card = await wrongCard(page);
      // 타이머가 덮지 않는가: 2.2초를 기다려도 카드가 그대로다
      await W(page, 2200);
      const again = await wrongCard(page);
      stuck = again.has && again.answer === card.answer;
    }
  };
  await play(page, { ...opts, wrong, on });
  const m = await measure(page);
  const end = await ctaState(page);
  ok(before && !before.enabled, `${label} 시작할 때 CTA 잠김("${before?.text}")`);
  ok(end.enabled && end.text === ctaLabel, `${label} 끝나면 CTA 열림("${end.text}")`);
  ok((await concluded(page)).includes("알게 된 것"), `${label} 결론 카드`);
  ok(m.curio, `${label} 궁금증 카드`);
  ok(m.frameScroll === 0, `${label} #frame 밀림 없음`);
  if (wrong) {
    ok(card?.has && card.adjacent, `${label} 오답: 누른 보기 바로 아래에 정답 카드("${card?.answer}")`);
    ok(card?.othersGone, `${label} 오답: 다른 보기는 접힘`);
    ok((card?.why ?? "").length >= 8 && card.nextH >= 48, `${label} 오답: 이유 한 줄 + '다음' ${card?.nextH}px`);
    ok(stuck === true, `${label} 오답: 기다려도 덮이지 않고 '다음'을 눌러야 넘어감`);
  }
  await grab(page, `${label} 끝`);
  return marks;
}

const ONLY = process.env.ONLY || "";
const FROM = Number(process.env.FROM || 1);

// ═════════════════════════════ A · B ═════════════════════════════
for (const wrong of ONLY ? [] : [false, true]) {
  console.log(`\n══ ${wrong ? "B. 오답 경로" : "A. 정답 경로"} ══`);
  const { browser, page, errors } = await launch();
  const want = (r) => (wrong ? r.open && !r.good : r.good);
  const tag = wrong ? "오답 시트" : "정답 시트";

  // ── u2l1 ──
  if (FROM <= 1) console.log("u2l1 세포, 생명의 기본 단위");
  if (FROM <= 1) {
    const meta = await openLesson(page, 0);
    ok(meta.id === "u2l1" && meta.types.join(",") === "comic,magnifyLab,concept,recap,binSort,quiz,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l1 만화");
    for (let i = 0; i < 7; i++) {
      await cta(page);
      if (i < 6) await grab(page, `u2l1 만화 ${i + 2}`);
    }
    ok((await stepType(page)).includes("bv-step"), "만화 뒤에 랩이 열림");
    await lab(page, "u2l1 확대 랩", playMagnify, {}, "세포, 이름으로 정리하기", wrong);
    await cta(page);
    await grab(page, "u2l1 개념");
    ok(await cutLoaded(page), "u2l1 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l1 정리");
    await cta(page);
    const sortGood = [["양파 껍질", "cell"], ["쇠못", "none"], ["버섯", "cell"], ["유리구슬", "none"], ["나뭇잎", "cell"], ["모래알", "none"], ["달팽이", "cell"], ["동전", "none"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 2 ? [k, "none"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l1 분류")), `u2l1 분류 ${tag}`);
    ok(await figureOk(page), "u2l1 눈금 그림");
    ok(want(await quiz(page, "mcq", wrong ? 2 : 0, "u2l1 눈금 읽기")), `u2l1 눈금 읽기 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-o" : "ox-x", null, "u2l1 소금 ox")), `u2l1 소금 ox ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l1 cell의 뜻")), `u2l1 cell의 뜻 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 2 : 0, "u2l1 맨눈으로 안 보인 까닭")), `u2l1 맨눈으로 안 보인 까닭 ${tag}`);
  }

  // ── u2l2 ──
  if (FROM <= 2) console.log("u2l2 세포의 구조");
  if (FROM <= 2) {
    const meta = await openLesson(page, 1);
    ok(meta.id === "u2l2" && meta.types.join(",") === "hook,concept,cellWorkLab,concept,cellWorkLab,pairMatch,recap,quiz,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l2 훅");
    await clickAll(page, ".hb4-bf-room", 320);
    await hookChoice(page, "부품들이");
    await grab(page, "u2l2 훅 끝");
    ok((await ctaState(page)).enabled, "u2l2 훅 완료");
    await cta(page);
    await grab(page, "u2l2 개념 1");
    ok(await cutLoaded(page), "u2l2 개념 컷 그림(공통 구조)");
    ok((await ctaState(page)).text === "구조를 하나씩 멈춰 보기", "u2l2 개념 1의 CTA가 랩으로 이어짐");
    await cta(page);
    await lab(page, "u2l2 동물세포 랩", (p, o) => playCellWork(p, "animal", o), {}, "식물세포의 구조 알아보기", wrong);
    await cta(page);
    await grab(page, "u2l2 개념 2");
    ok(await cutLoaded(page), "u2l2 개념 컷 그림(식물 구조)");
    await cta(page);
    await lab(page, "u2l2 식물세포 랩", (p, o) => playCellWork(p, "plant", o), {}, "빵 공장과 짝지어 보기", wrong);
    await cta(page);
    await grab(page, "u2l2 짝짓기");
    for (const [a, b] of [["출입문과 벽", "세포막"], ["중앙 통제실", "핵"], ["발전기", "마이토콘드리아"], ["지붕의 태양 전지판", "엽록체"], ["바깥 담장", "세포벽"]]) {
      await page.evaluate((t) => [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(), a);
      await W(page, 200);
      await page.evaluate((t) => [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => c.textContent.trim() === t && !c.disabled)?.click(), b);
      await W(page, 340);
    }
    await W(page, 600);
    await cta(page);
    ok((await sheet(page, "u2l2 짝짓기")).good, "u2l2 빵 공장 짝짓기 정답 시트");
    await grab(page, "u2l2 정리");
    await cta(page);
    ok(want(await quiz(page, "mcq", wrong ? 2 : 0, "u2l2 뒤죽박죽 = 핵")), `u2l2 뒤죽박죽 = 핵 ${tag}`);
    ok(await figureOk(page), "u2l2 세포 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l2 (나)가 사라지면")), `u2l2 (나)가 사라지면 ${tag}`);
    ok(want(await quiz(page, "multi", wrong ? [0, 1, 3] : [0, 1, 2], "u2l2 공통 구조")), `u2l2 공통 구조 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-o" : "ox-x", null, "u2l2 엽록체와 마이토콘드리아 ox")), `u2l2 엽록체와 마이토콘드리아 ox ${tag}`);
  }

  // ── u2l3 ──
  if (FROM <= 3) console.log("u2l3 현미경으로 직접 보기");
  if (FROM <= 3) {
    const meta = await openLesson(page, 2);
    ok(meta.id === "u2l3" && meta.types.join(",") === "hook,slideBuildLab,scopeCompareLab,concept,recap,order,quiz,binSort,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l3 훅");
    await dispatchSel(page, ".hb4-wl");
    await hookChoice(page, "현미경");
    await grab(page, "u2l3 훅 끝");
    ok((await ctaState(page)).enabled, "u2l3 훅 완료");
    await cta(page);
    const marks = await lab(page, "u2l3 표본 만들기 랩", playSlide, { fast: wrong, order: wrong }, "현미경으로 관찰하기", wrong);
    if (wrong) {
      ok(marks.includes("bubble") && (await ds(page, "sbdBubble")) === "0", "u2l3 빨리 덮으면 공기 방울 → 다시 들어 천천히 덮으면 통과");
      ok(marks.includes("early-cover") && marks.includes("nostain-cover"), "u2l3 차례를 틀려도 되돌아와 완성");
    } else ok((await ds(page, "sbdBubble")) === "0" && (await ds(page, "sbdStage")) === "4", "u2l3 네 단계 완성(공기 방울 없음)");
    await cta(page);
    await lab(page, "u2l3 현미경 비교 랩", playScope, { miss: wrong }, "관찰 기술 정리하기", wrong);
    ok((await ds(page, "scpSolved")) === "cheek,water,stain", "u2l3 세 표본을 모두 관찰");
    await cta(page);
    await grab(page, "u2l3 개념");
    ok(await cutLoaded(page), "u2l3 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l3 정리");
    await cta(page);
    const seq = ["검정말에서 잎을", "아세트올세인 용액을", "덮개 유리를 비스듬히", "거름종이로 감싸"];
    ok(want(await orderChips(page, wrong ? [seq[1], seq[0], seq[2], seq[3]] : seq, "u2l3 순서")), `u2l3 검정말잎 표본 순서 ${tag}`);
    ok(await figureOk(page), "u2l3 공기 방울 사진");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l3 공기 방울 표본")), `u2l3 공기 방울 표본 ${tag}`);
    const sortGood = [["또렷해지는 핵", "both"], ["각진 칸", "plant"], ["초록색 알갱이", "plant"], ["흐물흐물", "animal"], ["벽돌처럼", "plant"], ["낱낱이", "animal"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 0 ? [k, "plant"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l3 분류")), `u2l3 세 통 분류 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l3 물만 떨어뜨린 표본")), `u2l3 물만 떨어뜨린 표본 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-o" : "ox-x", null, "u2l3 메틸렌 블루 ox")), `u2l3 메틸렌 블루 ox ${tag}`);
  }

  // ── u2l4 ──
  if (FROM <= 4) console.log("u2l4 모양이 다른 세포들");
  if (FROM <= 4) {
    const meta = await openLesson(page, 3);
    ok(meta.id === "u2l4" && meta.types.join(",") === "hook,cellFitLab,concept,recap,binSort,quiz,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l4 훅");
    await dispatchSel(page, ".hb4-bd");
    await hookChoice(page, "원반 모양의 세포");
    await grab(page, "u2l4 훅 끝");
    ok((await ctaState(page)).enabled && (await ctaState(page)).text === "세포에게 일 맡기기", "u2l4 훅 완료, CTA가 랩으로 이어짐");
    await cta(page);
    await lab(page, "u2l4 세포 모양 랩", playCellFit, { miss: wrong }, "세 세포, 이름으로 정리하기", wrong);
    ok((await ds(page, "cftJob")) === "3", "u2l4 세 가지 일을 모두 맡김");
    await cta(page);
    await grab(page, "u2l4 개념");
    ok(await cutLoaded(page), "u2l4 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l4 정리");
    await cta(page);
    const sortGood = [["가늘고", "nerve"], ["신호", "nerve"], ["오목한", "rbc"], ["산소", "rbc"], ["납작", "epi"], ["표면", "epi"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 0 ? [k, "rbc"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l4 분류")), `u2l4 특징 카드 분류 ${tag}`);
    ok(await figureOk(page), "u2l4 세 세포 그림");
    ok(want(await quiz(page, "mcq", wrong ? 0 : 1, "u2l4 세 세포 짝")), `u2l4 세 세포 짝 ${tag}`); // 보기 차례가 고정이라 정답은 둘째 칸
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l4 길게 뻗은 세포의 일")), `u2l4 길게 뻗은 세포의 일 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-o" : "ox-x", null, "u2l4 적혈구 모양 ox")), `u2l4 적혈구 모양 ox ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 2 : 0, "u2l4 납작해서 좋은 점")), `u2l4 납작해서 좋은 점 ${tag}`);
  }

  // ── u2l5 ──
  if (FROM <= 5) console.log("u2l5 생물의 구성 단계");
  if (FROM <= 5) {
    const meta = await openLesson(page, 4);
    ok(meta.id === "u2l5" && meta.types.join(",") === "hook,levelBuildLab,concept,recap,order,quiz,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l5 훅");
    await dispatchSel(page, ".hb4-bh");
    await W(page, 500);
    await dispatchSel(page, ".hb4-bh");
    await W(page, 1500);
    await hookChoice(page, "비슷한 세포끼리");
    await grab(page, "u2l5 훅 끝");
    ok((await ctaState(page)).enabled, "u2l5 훅 완료");
    await cta(page);
    await lab(page, "u2l5 구성 단계 랩", playLevelBuild, {}, "단계의 이름 정리하기", wrong);
    ok((await ds(page, "blvDone")) === "animal,plant", "u2l5 두 계단을 모두 쌓음");
    await cta(page);
    await grab(page, "u2l5 개념");
    ok(await cutLoaded(page), "u2l5 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l5 정리");
    await cta(page);
    const seq = ["근육세포", "근육조직", "심장", "순환계", "사람"];
    ok(want(await orderChips(page, wrong ? [seq[1], seq[0], seq[2], seq[3], seq[4]] : seq, "u2l5 순서")), `u2l5 순환계 순서 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l5 학교 비유")), `u2l5 학교 비유 ${tag}`);
    ok(await figureOk(page), "u2l5 조직계와 기관계 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l5 조직계와 기관계")), `u2l5 조직계와 기관계 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l5 위가 기관인 까닭")), `u2l5 위가 기관인 까닭 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-o" : "ox-x", null, "u2l5 모이기만 하면 ox")), `u2l5 모이기만 하면 ox ${tag}`);
  }

  // ── u2l6 ──
  if (FROM <= 6) console.log("u2l6 생물다양성, 세 가지 눈금");
  if (FROM <= 6) {
    const meta = await openLesson(page, 5);
    ok(meta.id === "u2l6" && meta.types.join(",") === "hook,ecoMapLab,concept,recap,binSort,quiz,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l6 훅");
    await clickAll(page, ".dk-spot", 320);
    await hookChoice(page, "1,000종");
    await grab(page, "u2l6 훅 끝");
    ok((await ctaState(page)).enabled && (await ctaState(page)).text === "땅의 다양함 재어 보기", "u2l6 훅 완료, CTA가 랩으로 이어짐");
    await cta(page);
    await lab(page, "u2l6 생물다양성 랩", playEcoMap, { miss: wrong }, "세 눈금의 이름 알아보기", wrong);
    ok((await ds(page, "empEnv")) === "3" && (await ds(page, "empKinds")) === "12" && (await ds(page, "empTried")) === "wet,flat,bug", "u2l6 환경 3가지, 종류 12가지, 카드 셋을 모두 해 봄");
    await cta(page);
    await grab(page, "u2l6 개념");
    ok(await cutLoaded(page), "u2l6 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l6 정리");
    await cta(page);
    const sortGood = [["갯벌, 사막", "eco"], ["오리와 개구리", "kind"], ["무당벌레마다", "vary"], ["다람쥐와 사슴", "kind"], ["바지락마다", "vary"], ["강과 바다", "eco"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 1 ? [k, "eco"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l6 분류")), `u2l6 어떤 다양함일까 ${tag}`);
    ok(await figureOk(page), "u2l6 습지 두 모습 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l6 습지 두 모습")), `u2l6 습지 두 모습 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l6 벼만 자라는 논")), `u2l6 벼만 자라는 논 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l6 갯벌을 메우면")), `u2l6 갯벌을 메우면 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l6 얼룩말 무늬")), `u2l6 얼룩말 무늬 ${tag}`);
  }

  // ── u2l7 ──
  if (FROM <= 7) console.log("u2l7 변이, 그리고 살아남는 것들");
  if (FROM <= 7) {
    const meta = await openLesson(page, 6);
    ok(meta.id === "u2l7" && meta.types.join(",") === "comic,concept,beakIslesLab,recap,quiz,quiz,order,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l7 만화");
    // 만화 여덟 컷(main이 코드 그림으로 다시 편성하며 7 → 8)
    for (let i = 0; i < 8; i++) {
      await cta(page);
      if (i < 7) await grab(page, `u2l7 만화 ${i + 2}`);
    }
    await grab(page, "u2l7 개념");
    ok(await cutLoaded(page), "u2l7 개념 컷 그림");
    await cta(page);
    ok((await stepType(page)).includes("bv-step"), "개념 뒤에 랩이 열림");
    await lab(page, "u2l7 두 섬의 새 랩", playBeakIsles, { miss: wrong }, "변이와 살아남기 정리하기", wrong);
    ok((await ds(page, "bkiA")) === "9,0,0" && (await ds(page, "bkiB")) === "0,9,0", "u2l7 섬 (가)는 두꺼운 부리 9, 섬 (나)는 긴 부리 9");
    await cta(page);
    await grab(page, "u2l7 정리");
    await cta(page);
    ok(want(await quiz(page, "multi", wrong ? [0, 2] : [0, 1], "u2l7 변이의 예")), `u2l7 변이의 예 ${tag}`);
    ok(await figureOk(page), "u2l7 거북 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l7 거북")), `u2l7 거북 ${tag}`);
    const seq = ["부리 모양이 조금씩 다른", "두 섬에 나뉘어", "더 많이 살아남아", "서로 달라진다"];
    ok(want(await orderChips(page, wrong ? [seq[1], seq[0], seq[2], seq[3]] : seq, "u2l7 순서")), `u2l7 무리가 달라지는 순서 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l7 부리가 모두 같았다면")), `u2l7 부리가 모두 같았다면 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-x" : "ox-o", null, "u2l7 종류가 다양해진 원인 ox")), `u2l7 종류가 다양해진 원인 ox ${tag}`);
  }

  // ── u2l8 ──
  if (FROM <= 8) console.log("u2l8 생물을 나누는 기준");
  if (FROM <= 8) {
    const meta = await openLesson(page, 7);
    ok(meta.id === "u2l8" && meta.types.join(",") === "hook,kinLab,concept,concept,rankWidenLab,recap,quiz,quiz,order,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l8 훅");
    await page.evaluate(() => [...document.querySelectorAll(".screen.active .ms-shelf")][0]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await W(page, 600);
    await page.evaluate(() => [...document.querySelectorAll(".screen.active .ms-shelf")][1]?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await W(page, 1700);
    await hookChoice(page, "고유의 특징");
    await grab(page, "u2l8 훅 끝");
    ok((await ctaState(page)).enabled && (await ctaState(page)).text === "박쥐의 특징 조사하기", "u2l8 훅 완료, CTA가 랩으로 이어짐");
    await cta(page);
    await lab(page, "u2l8 가까운 사이 랩", playKin, { miss: wrong }, "분류의 기준 정리하기", wrong);
    ok((await ds(page, "knlL")) === "1" && (await ds(page, "knlR")) === "3", "u2l8 갈매기와 같은 점 1, 다람쥐와 같은 점 3");
    await cta(page);
    await grab(page, "u2l8 개념 1");
    ok(await cutLoaded(page), "u2l8 개념 컷 그림(분류)");
    await cta(page);
    await grab(page, "u2l8 개념 2");
    ok(await cutLoaded(page), "u2l8 개념 컷 그림(종)");
    ok((await ctaState(page)).text === "무리를 직접 넓혀 보기", "u2l8 개념 2의 CTA가 랩으로 이어짐");
    await cta(page);
    await lab(page, "u2l8 무리 넓히기 랩", playRankWiden, { miss: wrong }, "분류와 종 정리하기", wrong);
    ok((await ds(page, "rkwLevel")) === "6", "u2l8 무리를 계까지 넓힘");
    await cta(page);
    await grab(page, "u2l8 정리");
    await cta(page);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l8 고래")), `u2l8 고래 ${tag}`);
    ok(await figureOk(page), "u2l8 노새 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l8 노새")), `u2l8 노새 ${tag}`);
    const seq = ["종", "속", "과", "목", "강", "문", "계"];
    ok(want(await orderChips(page, wrong ? ["속", "종", "과", "목", "강", "문", "계"] : seq, "u2l8 순서")), `u2l8 종에서 계까지 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l8 호랑이와 너구리")), `u2l8 호랑이와 너구리 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-x" : "ox-o", null, "u2l8 기본 단위 ox")), `u2l8 기본 단위 ox ${tag}`);
  }

  // ── u2l9 ──
  if (FROM <= 9) console.log("u2l9 다섯 개의 왕국, 5계");
  if (FROM <= 9) {
    const meta = await openLesson(page, 8);
    ok(meta.id === "u2l9" && meta.types.join(",") === "hook,kingdomPathLab,concept,recap,binSort,quiz,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l9 훅");
    await dispatchSel(page, ".hb4-mr");
    await hookChoice(page, "광합성");
    await grab(page, "u2l9 훅 끝");
    ok((await ctaState(page)).enabled && (await ctaState(page)).text === "검색표에 생물 보내기", "u2l9 훅 완료, CTA가 랩으로 이어짐");
    await cta(page);
    await lab(page, "u2l9 검색표 랩", playKingdomPath, { miss: wrong }, "다섯 계의 특징 정리하기", wrong);
    ok((await ds(page, "kplLanded")) === "5" && (await ds(page, "kplWrong")) === (wrong ? "2" : "0"), `u2l9 생물 다섯이 모두 제 계에 들어감(틀린 길 ${await ds(page, "kplWrong")}번)`);
    await cta(page);
    await grab(page, "u2l9 개념");
    ok(await cutLoaded(page), "u2l9 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l9 정리");
    await cta(page);
    const sortGood = [["젖산균", "prok"], ["포도상구균", "prok"], ["짚신벌레", "prot"], ["해캄", "prot"], ["곰팡이", "fungi"], ["효모", "fungi"], ["고사리", "plant"], ["진달래", "plant"], ["붕어", "animal"], ["꿀벌", "animal"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 3 ? [k, "plant"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l9 분류")), `u2l9 다섯 계 분류 ${tag}`);
    ok(await figureOk(page), "u2l9 균계 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l9 균계의 공통 특징")), `u2l9 균계의 공통 특징 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l9 원생생물계")), `u2l9 원생생물계 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-x" : "ox-o", null, "u2l9 원핵생물계 ox")), `u2l9 원핵생물계 ox ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l9 검색표 따라가기")), `u2l9 검색표 따라가기 ${tag}`);
  }

  // ── u2l10 ──
  if (FROM <= 10) console.log("u2l10 생물다양성을 지켜라");
  if (FROM <= 10) {
    const meta = await openLesson(page, 9);
    ok(meta.id === "u2l10" && meta.types.join(",") === "hook,foodWebLab,concept,recap,quiz,pairMatch,binSort,quiz,quiz,quiz", `스텝 구성 ${meta.types.join(" ")}`);
    await grab(page, "u2l10 훅");
    await dispatchSel(page, ".bg-switch");
    await hookChoice(page, "꽃가루");
    await grab(page, "u2l10 훅 끝");
    ok((await ctaState(page)).enabled, "u2l10 훅 완료");
    await cta(page);
    await lab(page, "u2l10 먹이 관계 랩", playFoodWeb, { miss: wrong }, "지켜야 하는 까닭 정리하기", wrong);
    ok((await ds(page, "fwbOff")) === "frog" && (await ds(page, "fwbRiskA")) === "1" && (await ds(page, "fwbRiskB")) === "0", "u2l10 개구리를 빼면 (가)는 위험 1, (나)는 위험 0");
    await cta(page);
    await grab(page, "u2l10 개념");
    ok(await cutLoaded(page), "u2l10 개념 컷 그림");
    await cta(page);
    await grab(page, "u2l10 정리");
    await cta(page);
    ok(await figureOk(page), "u2l10 먹이 관계 그림");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l10 배추흰나비가 사라지면")), `u2l10 배추흰나비가 사라지면 ${tag}`);
    ok((await pairAll(page, [["벼", "식량"], ["푸른곰팡이", "의약품"], ["누에고치", "섬유"], ["편백나무", "목재"], ["고양이의 눈", "발명의 아이디어"]], "u2l10 짝 잇기")).good, "u2l10 생물과 혜택 짝 잇기 정답 시트");
    const sortGood = [["도로", "cause"], ["채집", "cause"], ["외래생물", "cause"], ["오염", "cause"], ["생태통로", "action"], ["협약", "action"], ["걸어가기", "action"], ["나눔", "action"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 2 ? [k, "action"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l10 분류")), `u2l10 원인과 방안 분류 ${tag}`);
    ok(await figureOk(page), "u2l10 생태통로 사진");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l10 생태통로")), `u2l10 생태통로 ${tag}`);
    ok(await figureOk(page), "u2l10 큰입배스 사진");
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l10 큰입배스")), `u2l10 큰입배스 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l10 가장 큰 원인")), `u2l10 가장 큰 원인 ${tag}`);
  }
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ C. 토글 ═════════════════════════════
console.log("\n══ C. 토글 ══");
{
  const probe = (page) =>
    page.evaluate(async () => {
      const c = await import("/src/content/curriculum.ts");
      const v3 = await import("/src/content/unit2v3.ts");
      const u = c.CURRICULUM.find((x) => x.id === "u2");
      // 내용이 글자 하나까지 같은지로 견준다. (객체가 같은지로 보면 안 된다: dev 서버는 고친 파일을 들여오는 주소에
      // 시각 꼬리표를 붙여서, 여기서 따로 들여온 v3 모듈이 CURRICULUM이 쓰는 것과 다른 사본일 수 있다.)
      // 문제 번호(n, of)는 curriculum.ts가 CURRICULUM에 실린 판의 문제 스텝에 나중에 써 넣는 값이라 견줄 때 뺀다.
      const j = (x) => JSON.stringify(x, (k, v) => (k === "n" || k === "of" ? undefined : v));
      return {
        same: j(u) === j(v3.UNIT2_V3),
        n: u.lessons.length,
        ids: u.lessons.map((l) => l.id).join(","),
        l1: u.lessons[0].steps.map((s) => s.type).join(","),
        // 진도 기록, 잠금, 시험 풀이 기대는 머리 정보는 켜도 v3와 같아야 한다(부제와 완료 문구는 새 랩에 맞춰 고친 레슨이 있다)
        meta: ["id", "unitId", "premium", "standard", "title", "label", "icon"].every((k) => j(u.lessons.map((l) => l[k])) === j(v3.UNIT2_V3.lessons.map((l) => l[k]))),
        labs: u.lessons.map((l) => l.steps.filter((s) => s.type.endsWith("Lab")).map((s) => s.type).join("+")).join(","),
        flag: sessionStorage.getItem("ss.u2v5"),
      };
    });
  const off = await launch({ v5: false });
  const a = await probe(off.page);
  ok(a.same && a.flag === null, "토글이 꺼져 있으면 CURRICULUM의 Ⅱ단원은 정본 v3와 글자 하나까지 같음");
  ok(a.l1.includes("zoomRulerLab") && !a.l1.includes("magnifyLab"), `꺼진 상태의 u2l1은 v3 랩(${a.l1})`);
  const meta = await openLesson(off.page, 0);
  ok(meta.types[1] === "zoomRulerLab", "꺼진 상태로 레슨을 열면 v3 화면");
  // 주소로 켜기
  await off.page.goto(`http://localhost:${PORT}/?u2v5`, { waitUntil: "domcontentloaded" });
  await off.page.waitForTimeout(1200);
  const b = await probe(off.page);
  ok(b.flag === "1" && !b.same && b.l1.includes("magnifyLab"), "주소 ?u2v5가 세션 표식을 켜고 새 판이 열림");
  ok(b.n === 10 && b.ids === "u2l1,u2l2,u2l3,u2l4,u2l5,u2l6,u2l7,u2l8,u2l9,u2l10", `레슨 수와 id 불변(${b.n}개)`);
  ok(b.meta, "켜진 상태에서도 열 레슨의 id, 제목, 이름표, 쪽수, 잠금은 v3와 같음");
  ok(
    b.labs === "magnifyLab,cellWorkLab+cellWorkLab,slideBuildLab+scopeCompareLab,cellFitLab,levelBuildLab,ecoMapLab,beakIslesLab,kinLab+rankWidenLab,kingdomPathLab,foodWebLab",
    `켜진 상태의 랩 열세 판(${b.labs})`,
  );
  await off.browser.close();
}

// ═════════════════════════════ D. 화면 글 ═════════════════════════════
if (!ONLY) console.log("\n══ D. 화면 글 검사 ══");
if (!ONLY) {
  const RULES = [
    ["대시", /[—–]|(?<=[가-힣a-zA-Z0-9.!?])\s-\s(?=[가-힣a-zA-Z0-9])/],
    ["'교과서'", /교과서/],
    ["출판사 이름", /미래엔|비상교육|천재교육|동아출판|지학사|금성출판|교학사|YBM/],
    ["'분자'", /분자/],
    ["이모지", /\p{Extended_Pictographic}/u],
    ["이 책에 없는 구조 이름", /세포질|액포|리보솜|소포체|골지|리소좀|염색체|소기관/],
    // 표기는 마이토콘드리아다. 다만 "예전 책에는 이렇게 썼다"고 이름의 내력을 알려 주는 문장(v3 개념 글)은 인용이라 허용한다.
    ["'미토콘드리아' 표기", /^(?!.*예전).*미토콘드리아/],
    ["현미경 부품 이름", /조동|미동|대물렌즈|접안렌즈|재물대|조리개/],
    ["금지 개념", /자연선택|진화/],
  ];
  const hits = [];
  for (const [line, where] of seen) for (const [name, re] of RULES) if (re.test(line)) hits.push(`${name}: "${line.slice(0, 70)}" (${where})`);
  ok(seen.size > 700, `화면에서 모은 글 ${seen.size}줄`);
  ok(hits.length === 0, `규칙 위반 ${hits.length}건`);
  hits.forEach((h) => console.log("     ", h));
}

console.log(`\nE2E: PASS ${PASS} · FAIL ${FAIL}`);
if (FAIL) {
  console.log(fails.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
