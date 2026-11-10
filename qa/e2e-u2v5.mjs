// 중1 Ⅱ v5(앞 세 레슨) 실플레이 E2E.
//   A. 정답 경로: 세 레슨을 도입부터 마지막 문제까지 CTA로만 걸어간다(랩 다섯 판 + 문제 14개).
//   B. 오답 경로: 랩의 채점 판정을 일부러 틀리고(오답 카드가 누른 보기 바로 아래에 뜨는지, '다음'을 눌러야만 넘어가는지),
//      차례 틀리기, 덮개 유리 빨리 덮기, 엉뚱한 곳 누르기를 해 본 뒤, 문제도 한 번씩 틀려 본다.
//   C. 토글: ss.u2v5가 꺼져 있으면 Ⅱ단원이 정본 v3와 글자 하나까지 같다. 주소 ?u2v5가 세션 표식을 켠다. 켜져 있어도 4~10번 레슨은 v3와 같다.
//   D. 화면 글 검사: 걷는 동안 화면에 뜬 글을 모아 대시, '교과서', 출판사 이름, '분자', 이모지, 이 책에 없는 용어를 찾는다.
// 랩 조작은 qa/u2v5-lib.mjs의 것을 쓴다(한 화면 검사와 같은 조작). 레슨은 CURRICULUM에서 꺼내 연다.
//   PORT=5547 node qa/e2e-u2v5.mjs            (전부)
//   PORT=5547 ONLY=C node qa/e2e-u2v5.mjs     (토글만 빨리 볼 때)
import {
  PORT, launch, openLesson, W, cta, ctaState, tap, waitFor, measure,
  playMagnify, playCellWork, playSlide, playScope, wrongCard, concluded, ds,
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

// ═════════════════════════════ A · B ═════════════════════════════
for (const wrong of ONLY ? [] : [false, true]) {
  console.log(`\n══ ${wrong ? "B. 오답 경로" : "A. 정답 경로"} ══`);
  const { browser, page, errors } = await launch();
  const want = (r) => (wrong ? r.open && !r.good : r.good);
  const tag = wrong ? "오답 시트" : "정답 시트";

  // ── u2l1 ──
  console.log("u2l1 세포, 생명의 기본 단위");
  {
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
    const sortGood = [["양파 껍질", "cell"], ["쇠못", "none"], ["버섯", "cell"], ["유리구슬", "none"], ["나뭇잎", "cell"], ["모래알", "none"], ["달팽이", "cell"], ["물방울", "none"]];
    const sortBad = sortGood.map(([k, b], i) => (i === 2 ? [k, "none"] : [k, b]));
    ok(want(await binSort(page, wrong ? sortBad : sortGood, "u2l1 분류")), `u2l1 분류 ${tag}`);
    ok(await figureOk(page), "u2l1 눈금 그림");
    ok(want(await quiz(page, "mcq", wrong ? 2 : 0, "u2l1 눈금 읽기")), `u2l1 눈금 읽기 ${tag}`);
    ok(want(await quiz(page, wrong ? "ox-o" : "ox-x", null, "u2l1 소금 ox")), `u2l1 소금 ox ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 1 : 0, "u2l1 cell의 뜻")), `u2l1 cell의 뜻 ${tag}`);
    ok(want(await quiz(page, "mcq", wrong ? 2 : 0, "u2l1 맨눈으로 안 보인 까닭")), `u2l1 맨눈으로 안 보인 까닭 ${tag}`);
  }

  // ── u2l2 ──
  console.log("u2l2 세포의 구조");
  {
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
  console.log("u2l3 현미경으로 직접 보기");
  {
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
        rest: j(u.lessons.slice(3)) === j(v3.UNIT2_V3.lessons.slice(3)),
        head: j(u.lessons.slice(0, 3)) === j(v3.UNIT2_V3.lessons.slice(0, 3)),
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
  ok(b.rest && !b.head, "켜진 상태에서도 4~10번 레슨은 v3와 글자 하나까지 같음(이번에 손대지 않음)");
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
  ok(seen.size > 250, `화면에서 모은 글 ${seen.size}줄`);
  ok(hits.length === 0, `규칙 위반 ${hits.length}건`);
  hits.forEach((h) => console.log("     ", h));
}

console.log(`\nE2E: PASS ${PASS} · FAIL ${FAIL}`);
if (FAIL) {
  console.log(fails.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
