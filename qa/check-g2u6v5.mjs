// 중2 Ⅵ v5의 간소 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
//   시점마다(처음, 조작 중, 실패, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지, 화면이 밀리지 않았는지,
//   누르는 곳이 48px 이상인지, 잘린 글과 작은 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   랩의 첫 판정에서는 한 번 틀려 본다(틀림 표시, 정답 카드, '다음'). 실험 랩에서는 실패하는 길도 한 번 간다.
//   새로 쓴 선택형 문제는 정답을 눌러 정답으로 채점되는지 본다. 그 길에서 모은 화면 글에 대시, '교과서', 이모지가 없는지도 본다.
//   끝으로 토글을 끈 채 첫 레슨이 지금 화면(훅)으로 열리는지 본다.
// 실행: PORT=5586 node qa/check-g2u6v5.mjs [캡처 폴더]     ONLY=g2u6l2 를 붙이면 그 레슨만 돈다. NOGL=1 이면 WebGL2를 끈 채(평면 무대).
//       DIST=<개발 모드 번들 폴더> node qa/check-g2u6v5.mjs  (번들 만드는 법은 qa/u4v5-lib.mjs 머리말. 이때 문제 채점 검사는 건너뛴다)
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./u4v5-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/g2u6v5";
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || "";
const LESSONS = ["g2u6l1", "g2u6l2", "g2u6l3", "g2u6l4", "g2u6l5", "g2u6l6"].filter((x) => !ONLY || x === ONLY);
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await L.launch();
// NOGL=1: WebGL2를 쓸 수 없는 브라우저를 흉내 낸다(입체 무대를 쓰는 랩이 평면 무대로 뜨는지 본다)
if (process.env.NOGL) await page.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...a) { return type === "webgl2" ? null : orig.call(this, type, ...a); };
});
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
});
const W = (ms) => L.W(page, ms);
const texts = [];
let quizzes = 0;
let shots = 0;

async function open(id, v5 = true) {
  await page.goto(`${L.BASE}/?g2u6v5${v5 ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await W(600);
}
const kind = () =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active");
    if (!sc || sc.id === "sc-done" || sc.id === "sc-home") return "home";
    const s = sc.querySelector(".step");
    if (!s) return "";
    if (s.classList.contains("opn-step")) return "opener:" + (s.dataset.opnScene ?? "");
    if (s.classList.contains("g2u6x-step")) return "lab:" + (s.querySelector(".bv-stage")?.className.match(/g2u6x-(?!stage)[a-z0-9]+/)?.[0].slice(6) ?? "");
    if (s.querySelector(".hook-scene")) return "hook";
    if (s.querySelector(".comic-art, .comic-narrator")) return "comic";
    if (s.querySelector(".opts, .ox-grid")) return "quiz";
    return "read";
  });

// o.tall: 세로로 긴 무대(순환 여행 랩, 사용자 요청 "세로로 길게")는 한 화면 예산의 예외다.
//   대신 무대 안의 결정 단추와, 판정이 떠 있으면 남은 보기와 정답 카드가 스크롤 영역 안에 보이는지 본다.
async function at(id, mark, shot = true, o = {}) {
  const m = await L.measure(page);
  // 결론 뒤에 붙는 궁금증 카드(펼쳐 읽는 덤)는 한 화면 예산 밖이다(중1 Ⅳ 검사와 같은 기준)
  if (!o.tall) ok(m.content - m.curio <= m.view && m.scrollTop === 0, `${id} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  else {
    const vis = await page.evaluate(() => {
      const sc = document.querySelector(".screen.active .scroll").getBoundingClientRect();
      const inside = (e) => { const r = e.getBoundingClientRect(); return r.top >= sc.top - 1 && r.bottom <= sc.bottom + 1; };
      const out = [];
      document.querySelectorAll(".screen.active .g2u6x-rd-pick").forEach((b) => { if (!b.disabled && !inside(b)) out.push("단추 " + b.textContent); });
      const q = document.querySelector(".screen.active .bv-q.show");
      if (q) {
        q.querySelectorAll(".bv-choice:not(.gone)").forEach((b) => { if (!inside(b)) out.push("보기 " + b.textContent.trim().slice(0, 10)); });
        const a = q.querySelector(".bv-ans");
        if (a && !inside(a)) out.push("정답 카드");
      }
      return out;
    });
    ok(vis.length === 0, `${id} ${mark}: 화면 밖 ${vis.join(", ")}`);
  }
  ok(m.taps.every((t) => t.h >= 47.5), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 47.5).map((t) => t.t + ":" + t.h).join(", ")}`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.small.length === 0, `${id} ${mark}: 작은 글자 ${m.small.map((s) => s.t + ":" + s.px).join(", ")}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음`);
  texts.push(m.text);
  if (shot) {
    shots += 1;
    await page.screenshot({ path: join(OUT, `${id}-${String(shots).padStart(3, "0")}-${mark}.png`) });
  }
  console.log(`  ${id} ${mark}: ${m.content}/${m.view}`);
}
async function wrongOnce(id, mark, o = {}) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(350);
  await at(id, mark + "-ask", true, o);
  const t = await L.pickWrong(page);
  ok(!!t, `${id} ${mark}: 틀린 보기를 찾지 못함`);
  await W(450);
  const v = await L.verdict(page);
  ok(v && v.cls === "miss" && v.word === "오답이에요" && v.ans && v.next, `${id} ${mark}: 오답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-wrong", true, o);
  await W(1200);
  ok((await L.verdict(page))?.cls === "miss", `${id} ${mark}: '다음'을 누르기 전에 넘어감`);
  await L.tapNext(page);
  await W(500);
}
async function rightOnce(id, mark) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(300);
  await L.pickRightOnly(page);
  await W(400);
  const v = await L.verdict(page);
  ok(v && v.cls === "ok" && v.word === "정답이에요" && v.next, `${id} ${mark}: 정답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-right", false);
  await L.tapNext(page);
  await W(500);
}
async function predict(id, mark, word) {
  ok(await L.waitAsk(page), `${id} ${mark}: 예측이 뜨지 않음`);
  await W(300);
  await at(id, mark + "-predict");
  await L.pickText(page, word);
}
const tap = async (sel, wait = 250) => {
  const r = await L.click(page, sel);
  await W(wait);
  return r;
};
const must = async (id, sel, wait = 250) => ok(await tap(sel, wait), `${id}: 누를 수 없음 ${sel}`);
async function done(id, mark, o = {}) {
  ok(await L.waitDone(page, 150), `${id} ${mark}: 결론이 뜨지 않음`);
  await W(400);
  await at(id, mark + "-done", true, o);
  const c = await L.ctaState(page);
  ok(c.enabled, `${id} ${mark}: 끝 버튼이 열리지 않음(${c.text})`);
}

// ── 도입 ──
async function runOpener(id) {
  await at(id, "intro-ask");
  await L.choose(page, "");
  await W(700);
  await at(id, "intro-picked");
  for (let i = 0; i < 10; i++) {
    if ((await L.ds(page, "opnPhase")) === "done") break;
    const hit = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active .opn-g2u6-btn")].find((x) => !x.disabled);
      b?.click();
      return !!b;
    });
    await W(hit ? 900 : 500);
    if (i === 0) await at(id, "intro-play", false);
  }
  ok(await L.waitPhase(page, "done", 60), `${id}: 도입이 끝나지 않음`);
  await W(500);
  await at(id, "intro-done");
  ok((await L.ctaState(page)).enabled, `${id}: 도입의 끝 버튼이 열리지 않음`);
}

// ── 랩 ──
const K = (k) => `.g2u6x-chipbtn[data-k="${k}"]`;
const dsIs = async (id, key, want, msg) => ok((await L.ds(page, key)) === want, `${id}: ${msg} (${key}=${await L.ds(page, key)})`);
const S = async (id, key, wait = 300) => {
  const r = await page.evaluate((k) => {
    const e = document.querySelector(`.screen.active .g2u6x-stage [data-k="${k}"]`);
    if (!e) return false;
    e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }, key);
  ok(r, `${id}: 무대에서 누를 수 없음 ${key}`);
  await W(wait);
};
const LABS = {
  // 순환 여행 랩(입체, 세로로 긴 무대): 결정 셋에서 한 번씩 틀려 보고, 끝의 판정에서도 한 번 틀린다
  async ride(id) {
    const T = { tall: true };
    const R = (k) => `.g2u6x-rd-pick[data-k="${k}"]`;
    const pickReady = (k, tries = 250) => L.waitFor(page, (k) => { const b = document.querySelector(`.screen.active .g2u6x-rd-pick[data-k="${k}"]`); return !!b && !b.disabled; }, k, tries);
    const go = async (k, wait, tries) => { ok(await pickReady(k, tries), `${id}: 무대 단추가 뜨지 않음 ${k}`); await must(id, R(k), wait); };
    ok(await L.waitFor(page, () => { const s = document.querySelector(".screen.active .step"); return s.dataset.g6Stage === "flat" || s.dataset.g6Ready === "1"; }, null, 150), `${id}: 순환 무대가 그려지지 않음`);
    console.log(`  무대: ${await L.ds(page, "g6Stage")}`);
    await at(id, "ride-start", true, T);
    await go("pump", 1600);
    await at(id, "ride-aorta", true, T);
    ok(await pickReady("cap"), `${id}: 조직세포 곁의 결정이 뜨지 않음`);
    await at(id, "ride-d1", true, T);
    await must(id, R("art"), 500);
    await dsIs(id, "g6Fail", "art", "동맥을 골라도 막지 않음");
    await at(id, "ride-d1-wrong", true, T);
    await go("cap", 2400);
    await at(id, "ride-body", true, T);
    ok(await pickReady("ra"), `${id}: 심장 앞의 결정이 뜨지 않음`);
    await at(id, "ride-d2", true, T);
    await must(id, R("la"), 500);
    await dsIs(id, "g6Fail", "la", "좌심방을 골라도 막지 않음");
    await at(id, "ride-d2-wrong", true, T);
    await go("ra", 600);
    await go("pump", 2600);
    await at(id, "ride-pa", true, T);
    ok(await pickReady("breath"), `${id}: 숨 들이쉬기가 뜨지 않음`);
    await at(id, "ride-lung", true, T);
    await must(id, R("breath"), 3200);
    await at(id, "ride-lung-swap", true, T);
    ok(await pickReady("vein"), `${id}: 폐정맥의 결정이 뜨지 않음`);
    await at(id, "ride-d4", true, T);
    await must(id, R("artery"), 500);
    await dsIs(id, "g6Fail", "artery", "폐정맥을 동맥이라 해도 막지 않음");
    await at(id, "ride-d4-wrong", true, T);
    await go("vein", 1600);
    await go("pump", 1200);
    await wrongOnce(id, "ride", T);
    await done(id, "ride", T);
  },
  async plate(id) {
    await at(id, "plate-start");
    for (let r = 0; r < 3; r++) {
      await must(id, K(["iod", "biu", "sud"][r]));
      for (let c = 1; c < 5; c++) await S(id, `w${r}-${c}`, 180);
      if (r === 0) await at(id, "plate-row");
    }
    await dsIs(id, "g6Filled", "12", "음식물 열두 홈이 채워지지 않음");
    await must(id, ".g2u6x-go", 400);
    await dsIs(id, "g6Fail", "water", "증류수 줄을 비운 실패가 보이지 않음");
    await at(id, "plate-nowater");
    for (let r = 0; r < 3; r++) {
      await must(id, K(["iod", "biu", "sud"][r]));
      await S(id, `w${r}-0`, 180);
    }
    await at(id, "plate-full");
    await must(id, ".g2u6x-go", 600);
    await at(id, "plate-read", false);
    await wrongOnce(id, "plate");
    await done(id, "plate");
  },
  async bene(id) {
    await at(id, "bene-start");
    await must(id, K("add"), 400);
    await at(id, "bene-added");
    await must(id, K("room"), 1900);
    await dsIs(id, "g6Fail", "cold", "가열하지 않은 실패가 보이지 않음");
    await at(id, "bene-cold");
    await must(id, K("hot"), 2300);
    await dsIs(id, "g6Heat", "1", "가열해도 색이 변하지 않음");
    await at(id, "bene-hot");
    await wrongOnce(id, "bene");
    await done(id, "bene");
  },
  async saliva(id) {
    await at(id, "saliva-start");
    await must(id, K("temp"));
    await must(id, K("temp"));
    await must(id, ".g2u6x-soak", 400);
    await must(id, K("iod"), 500);
    await dsIs(id, "g6Fail", "same", "같은 것을 넣은 실패가 보이지 않음");
    await at(id, "saliva-same");
    await W(2700);
    await must(id, K("t1"));
    await must(id, K("temp"));
    await must(id, ".g2u6x-soak", 400);
    await must(id, K("iod"), 500);
    await dsIs(id, "g6Fail", "temp", "끓는 물의 실패가 보이지 않음");
    await at(id, "saliva-boil");
    await W(2700);
    await must(id, K("temp"));
    await must(id, K("temp"));
    await at(id, "saliva-prep");
    await must(id, ".g2u6x-soak", 400);
    await at(id, "saliva-test");
    await must(id, K("iod"), 500);
    await at(id, "saliva-iod");
    await must(id, K("ben"), 500);
    await dsIs(id, "g6Fail", "", "바르게 했는데 실패로 처리됨");
    await at(id, "saliva-both");
    await wrongOnce(id, "saliva");
    // 둘째 판정(증류수 쪽 결과로 알 수 있는 것, 2026-11-15). 틀린 직후의 카드가 가장 길어 이것도 틀려 보며 잰다.
    await wrongOnce(id, "saliva2");
    await done(id, "saliva");
  },
  // 소화기관 랩(2026-11-15, 옛 아홉 칸 표 랩을 갈아 끼움). 입에서는 맞게, 위와 쓸개즙에서는 일부러 틀리게 고른다.
  async organ(id) {
    await at(id, "organ-start");
    await must(id, K("n0"));
    await must(id, ".g2u6x-mix", 2300);
    await dsIs(id, "g6Miss", "0", "입에서 녹말만 골랐는데 틀림으로 처리됨");
    await at(id, "organ-mouth");
    await must(id, ".g2u6x-mix", 2100);
    await dsIs(id, "g6At", "stomach", "위에 닿지 않음");
    await must(id, K("n0"));
    await must(id, ".g2u6x-mix", 2100);
    await dsIs(id, "g6Fail", "pred", "위액에 녹말을 골랐는데 그대로 표시가 없음");
    await at(id, "organ-stomach-miss");
    await must(id, ".g2u6x-mix", 1700);
    await dsIs(id, "g6At", "bile", "작은창자에 닿지 않음");
    await must(id, K("n2"));
    await must(id, ".g2u6x-mix", 2300);
    await dsIs(id, "g6Fail", "pred", "쓸개즙에 지방을 골랐는데 아직 지방 표시가 없음");
    await at(id, "organ-bile-miss");
    await must(id, ".g2u6x-mix", 500);
    for (const k of ["n0", "n1", "n2"]) await must(id, K(k), 150);
    await must(id, ".g2u6x-mix", 5600);
    await dsIs(id, "g6Form", "332", "작은창자에서 소화가 끝나지 않음");
    await at(id, "organ-pancreas");
    await must(id, ".g2u6x-mix", 2500);
    await dsIs(id, "g6At", "large", "큰창자에 닿지 않음");
    await at(id, "organ-large");
    await must(id, ".g2u6x-mix", 700);
    await wrongOnce(id, "organ");
    await wrongOnce(id, "organ2");
    await done(id, "organ");
  },
  async villi(id) {
    await at(id, "villi-start");
    await must(id, ".g2u6x-flow-btn", 1800);
    await at(id, "villi-flat");
    await must(id, K("w1"));
    await must(id, ".g2u6x-flow-btn", 1800);
    await must(id, K("w2"));
    await at(id, "villi-shape", false);
    await must(id, ".g2u6x-flow-btn", 1800);
    await dsIs(id, "g6Runs", "3", "세 벽을 다 해 보지 못함");
    await at(id, "villi-all");
    await must(id, ".g2u6x-go", 400);
    await wrongOnce(id, "villi");
    await done(id, "villi");
  },
  async heart(id) {
    await at(id, "heart-start");
    await must(id, K("atrium"), 400);
    await at(id, "heart-atrium");
    await must(id, K("ventricle"), 500);
    await dsIs(id, "g6Where", "artery", "판막이 있는데 동맥으로만 가지 않음");
    await at(id, "heart-artery");
    await W(1700);
    await must(id, K("valve"));
    await must(id, K("atrium"), 400);
    await must(id, K("ventricle"), 500);
    await dsIs(id, "g6Where", "back", "판막을 뺐는데 거꾸로 흐르지 않음");
    await at(id, "heart-back");
    await W(1800);
    await must(id, ".g2u6x-go", 400);
    await wrongOnce(id, "heart");
    await done(id, "heart");
  },
  async blood(id) {
    await at(id, "blood-start");
    await must(id, ".g2u6x-spin", 500);
    await at(id, "blood-settled");
    await W(3100);
    await dsIs(id, "g6Job", "0", "첫 일이 뜨지 않음");
    await must(id, K("wbc"), 400);
    await dsIs(id, "g6Fail", "wbc", "잘못 보낸 실패가 보이지 않음");
    await at(id, "blood-miss");
    for (const k of ["rbc", "wbc", "plt", "pla"]) {
      await must(id, K(k), 600);
      if (k === "wbc") await at(id, "blood-job");
      await W(1500);
    }
    await wrongOnce(id, "blood");
    await done(id, "blood");
  },
  async loop(id) {
    await at(id, "loop-start");
    await S(id, "nra", 300);
    await dsIs(id, "g6Fail", "ra", "이어지지 않은 곳을 눌러도 막지 않음");
    await at(id, "loop-miss");
    await W(700);
    for (const k of ["ao", "body", "vc", "ra"]) await S(id, "n" + k, 300);
    await at(id, "loop-body");
    for (const k of ["rv", "pa", "lung", "pv", "la", "lv"]) await S(id, "n" + k, 300);
    await at(id, "loop-end");
    await wrongOnce(id, "loop");
    await done(id, "loop");
  },
  async chest(id) {
    await at(id, "chest-start");
    await must(id, K("pull"), 400);
    await dsIs(id, "g6Fail", "leak", "틈을 막지 않은 실패가 보이지 않음");
    await at(id, "chest-leak");
    await must(id, K("seal"), 300);
    await must(id, K("pull"), 400);
    await dsIs(id, "g6Vol", "1", "고무 막을 당겨도 통 속 부피가 커지지 않음");
    await at(id, "chest-pull");
    await must(id, K("push"), 400);
    await dsIs(id, "g6Vol", "-1", "고무 막을 밀어 올려도 통 속 부피가 작아지지 않음");
    await at(id, "chest-min");
    await must(id, ".g2u6x-go", 400);
    await wrongOnce(id, "chest");
    await done(id, "chest");
  },
  async gas(id) {
    await at(id, "gas-start");
    await must(id, K("out"), 400);
    await dsIs(id, "g6Fail", "lung", "거꾸로 고른 실패가 보이지 않음");
    await at(id, "gas-miss");
    await W(900);
    await must(id, K("in"), 500);
    await at(id, "gas-lung");
    await must(id, ".g2u6x-move", 500);
    await at(id, "gas-cell");
    await must(id, K("cin"), 500);
    await dsIs(id, "g6Blood", "co2", "조직세포를 지난 혈액이 바뀌지 않음");
    await at(id, "gas-done", false);
    await wrongOnce(id, "gas");
    await done(id, "gas");
  },
  async nephron(id) {
    await at(id, "nephron-start");
    await must(id, ".g2u6x-filter", 500);
    await at(id, "nephron-filtered");
    await must(id, ".g2u6x-urine", 500);
    await dsIs(id, "g6Fail", "glu", "포도당을 버린 실패가 보이지 않음");
    await at(id, "nephron-glu");
    await W(2400);
    await must(id, K("glu"));
    await must(id, K("urea"));
    await must(id, ".g2u6x-urine", 500);
    await dsIs(id, "g6Fail", "urea", "요소를 되돌린 실패가 보이지 않음");
    await W(2500);
    await must(id, K("urea"));
    await must(id, ".g2u6x-urine", 500);
    await dsIs(id, "g6Fail", "water", "물을 버린 실패가 보이지 않음");
    await at(id, "nephron-water");
    await W(2400);
    await must(id, K("water"));
    await at(id, "nephron-set");
    await must(id, ".g2u6x-urine", 800);
    await at(id, "nephron-secrete");
    await W(2300);
    await at(id, "nephron-out", false);
    await wrongOnce(id, "nephron");
    await done(id, "nephron");
  },
  async resp(id) {
    await at(id, "resp-start");
    await must(id, K("glu"));
    await dsIs(id, "g6On", "0", "포도당만으로 에너지가 나옴");
    await at(id, "resp-glu");
    await must(id, K("o2"));
    await dsIs(id, "g6On", "1", "둘 다 주어도 에너지가 나오지 않음");
    await at(id, "resp-on");
    await must(id, K("glu"));
    await at(id, "resp-o2", false);
    await must(id, K("glu"));
    await must(id, ".g2u6x-go", 400);
    await wrongOnce(id, "resp");
    await done(id, "resp");
  },
  async team(id) {
    await at(id, "team-start");
    await must(id, K("dig"));
    await at(id, "team-dig");
    await must(id, K("res"));
    await must(id, K("exc"));
    await at(id, "team-exc", false);
    await must(id, K("cir"));
    await dsIs(id, "g6Seen", "4", "네 기관계를 다 멈춰 보지 못함");
    await at(id, "team-cir");
    await must(id, ".g2u6x-go", 400);
    await wrongOnce(id, "team");
    await done(id, "team");
  },
};


// ── 문제 ──
async function answer() {
  // 번들(DIST)로 돌 때는 단원 표(/src/…)를 불러올 수 없다. 불러 보면 404가 페이지 오류로 잡혀 진짜 오류를 가리므로 아예 건너뛴다(Ⅴ 검사와 같게).
  if (L.DIST) return "skip";
  const r = await page.evaluate(async () => {
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, ""); };
    const s = document.querySelector(".screen.active .step");
    const here = s.innerText.replace(/\s+/g, "");
    let unit;
    try { unit = (await import("/src/content/g2/unit6.ts")).G2_UNIT6; } catch { return { skip: true }; }
    for (const l of unit.lessons) for (const st of l.steps) {
      if (st.type !== "quiz" || !here.includes(strip(st.prompt).slice(0, 30))) continue;
      const mode = st.mode ?? "mcq";
      if (mode === "ox") s.querySelector(st.answer ? ".ox-btn.o" : ".ox-btn.x")?.click();
      else for (const a of Array.isArray(st.answer) ? st.answer : [st.answer]) s.querySelector(`.opt[data-oi="${a}"]`)?.click();
      return {};
    }
    return { err: "단원 표에서 이 문항을 찾지 못함" };
  });
  if (r.skip) return "skip";
  if (r.err) return r.err;
  await W(250);
  if (!(await L.ctaState(page)).enabled) return "확인하기가 열리지 않음";
  await L.cta(page);
  const shown = await L.waitFor(page, () => {
    const t = document.querySelector(".screen.active .sheet-title");
    return !!t && t.offsetParent !== null && t.textContent.trim().length > 0;
  }, null, 40);
  if (!shown) return "채점 시트가 뜨지 않음";
  const title = await page.evaluate(() => document.querySelector(".screen.active .sheet-title").textContent.trim());
  texts.push(await page.evaluate(() => document.querySelector(".screen.active .sheet-card")?.innerText ?? ""));
  await W(300);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .sheet-card .btn")].find((b) => b.offsetParent !== null)?.click());
  await W(500);
  return title === "정답이에요" ? "ok" : `"${title}"로 채점됨`;
}
const forward = async () => {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await W(600);
};
const stepText = () => page.evaluate(() => (document.querySelector(".screen.active .step")?.innerText ?? "") + " " + (document.querySelector(".screen.active .btn.cta")?.textContent ?? ""));

for (const id of LESSONS) {
  console.log(`\n■ ${id}`);
  await open(id);
  const seen = [];
  for (let guard = 0; guard < 60; guard++) {
    const k = await kind();
    if (k === "home" || k === "") break;
    seen.push(k);
    if (k.startsWith("opener:")) {
      await runOpener(id, k.slice(7));
      await L.cta(page);
    } else if (k.startsWith("lab:")) {
      const fn = LABS[k.slice(4)];
      ok(!!fn, `${id}: 모르는 랩 ${k}`);
      if (fn) await fn(id);
      const before = await stepText();
      await L.cta(page);
      ok((await stepText()) !== before, `${id} ${k}: 끝 버튼을 눌러도 다음 스텝이 열리지 않음`);
    } else if (k === "quiz") {
      const r = await answer();
      if (r === "skip") await forward();
      else {
        quizzes += 1;
        ok(r === "ok", `${id} 문제: ${r} (${(await stepText()).slice(0, 30)})`);
      }
    } else if (k === "comic") {
      await forward();
    } else {
      // 개념, 정리, 분류, 순서, 짝 잇기: 글만 모으고 넘어간다
      texts.push(await stepText());
      const isLast = await page.evaluate(() => getComputedStyle(document.querySelector(".screen.active .xbtn.fwd")).visibility === "hidden");
      if (isLast) break;
      await forward();
    }
  }
  console.log("  스텝: " + seen.join(" → "));
}

// 화면 글 규칙
const all = texts.join("\n");
ok(!/[—–]/.test(all), "화면 글에 대시가 있음: " + (all.match(/.{0,12}[—–].{0,12}/)?.[0] ?? ""));
ok(!/교과서/.test(all), "화면 글에 '교과서'가 있음");
ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(all), "화면 글에 이모지가 있음: " + (all.match(/.{0,8}[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}].{0,8}/u)?.[0] ?? ""));
ok(!/ - /.test(all), "화면 글에 삽입구용 하이픈이 있음: " + (all.match(/.{0,12} - .{0,12}/)?.[0] ?? ""));

// 토글을 끈 화면
if (!ONLY || ONLY === "off") {
  await open("g2u6l1", false);
  const k = await kind();
  ok(k === "hook", `토글을 끈 첫 레슨이 지금 화면(훅)으로 열리지 않음: ${k}`);
  await page.screenshot({ path: join(OUT, "off-g2u6l1.png") });
}
ok(errors.length === 0, "페이지 오류: " + errors.slice(0, 5).join(" | "));
console.log(`\n문제 ${quizzes}개 채점 확인. 통과 ${pass}, 실패 ${fail}`);
await browser.close();
process.exit(fail ? 1 : 0);
