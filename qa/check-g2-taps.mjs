// 중2 과학 도입·랩 클릭 점검(2026-11-15, 사용자 적발 "저항의 연결에서 전구를 눌러도 빠지지 않는다, 점선을 눌러도 안 된다" 뒤에 만듦).
// 원인은 넓은 화면(태블릿 가로, PC)이 무대를 CSS zoom으로 키우는데 캔버스 킷의 포인터 좌표가 확대 전 크기로 계산된 것이었다.
// 이 검사는 그 종류와 그 밖의 "눌러도 안 되는" 경우를 두 가지로 찾는다.
//   A. 가림 검사: 스텝이 열린 때(도입은 예측을 고른 뒤에도) 눌러야 하는 것(버튼, 포인터나 클릭 리스너가 달린 요소, 손가락 커서 요소)의
//      가운데를 elementFromPoint로 누르면 그 요소가 받는지 본다. 다른 요소가 덮었으면, 24px보다 작으면, 오목한 그림이라 가운데가 비었으면 적는다.
//      리스너는 크롬 개발자 도구 규약(DOMDebugger.getEventListeners)으로 찾는다(합성 클릭 e2e가 놓치는 표시 계층을 본다).
//   B. 폰과 넓은 화면 견주기: 같은 설계 좌표(무대 폭 346 기준)를 실제 마우스로 차례로 누르고, 조작 칸의 버튼을 차례로 누른 뒤
//      도움말, 쌤의 말, 진행 점, 조작 칸과 판정 칸의 글을 견준다. 좌표 계산이 확대를 모르는 랩은 넓은 화면에서만 결과가 갈린다.
//      Math.random은 두 화면에서 같은 씨앗으로 바꾼다(그래도 그리기 루프가 쓰는 난수는 프레임 수에 따라 갈릴 수 있어, 갈린 곳은 눈으로 본다).
// 실행: PORT=<dev 포트> node qa/check-g2-taps.mjs [g2u7 | g2u7l5 ...] [--a | --b] [--out 파일]
//   결과는 콘솔 요약과 JSON(기본 qa/shots/g2-taps/<단원들>.json).
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const PORT = process.env.PORT || "5661";
const BASE = `http://localhost:${PORT}`;
const args = process.argv.slice(2);
const filters = args.filter((a) => /^(g2)?u\d/.test(a));
const onlyA = args.includes("--a");
const onlyB = args.includes("--b");
const doA = !onlyB;
const doB = !onlyA;
const oi = args.indexOf("--out");
const OUT = oi >= 0 ? args[oi + 1] : `qa/shots/g2-taps/${filters.length ? filters.join("-") : "all"}.json`;

// 레슨 id는 단원 파일에서 읽는다(단원 id "g2uN"은 빼고 "g2uNlM"만). 중1(u3, u5l2 꼴)을 주면 중1 단원 파일(content/unitN.ts)에서 읽는다.
const ids = [];
for (let u = 1; u <= 8; u++) {
  const src = readFileSync(`src/content/g2/unit${u}.ts`, "utf8");
  for (const m of src.matchAll(/id: "(g2u\d+l\d+)"/g)) ids.push(m[1]);
}
if (filters.some((f) => /^u\d/.test(f)))
  for (let u = 1; u <= 7; u++) {
    const src = readFileSync(`src/content/unit${u}.ts`, "utf8");
    for (const m of src.matchAll(/id: "(u\d+l\d+)"/g)) if (!ids.includes(m[1])) ids.push(m[1]);
  }
const lessons = ids.filter((id) => !filters.length || filters.some((f) => id === f || id.startsWith(f + "l")));

const SEED = () => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
  // 두 화면이 같은 난수를 쓰게 씨앗을 고정한다(mulberry32)
  let a = 20261115;
  Math.random = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const HMR_STUB = `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`;

const MODES = {
  phone: { viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  wide: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
};

const W = (page, ms) => page.waitForTimeout(ms);

async function makePage(browser, mode) {
  const ctx = await browser.newContext(MODES[mode]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(SEED);
  await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: HMR_STUB }));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("DOM.enable");
  return { page, cdp, errors, mode };
}

async function openLesson(page, id) {
  await page.goto(`${BASE}/?open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await W(page, 1000);
}

const stepInfo = (page) =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    if (!s) return null;
    const kind = s.classList.contains("opn-step") ? "opener" : s.classList.contains("bv-step") ? "lab" : "other";
    const title = (s.querySelector(".opn-title, .bv-title")?.textContent || s.querySelector("h1, h2, .q-prompt, .concept-title, .cp-title")?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (!s.dataset.taps) s.dataset.taps = String(Math.random()).slice(2, 9);
    // 정리 카드(recap)가 나오면 그 뒤는 문제뿐이다(도입 → 랩 → 정리 → 문제)
    return { kind, title, tag: s.dataset.taps, recap: !!s.querySelector(".rc-cards") };
  });

async function fwd(page) {
  const before = await page.evaluate(() => document.querySelector(".screen.active .step")?.dataset.taps ?? "");
  const ok = await page.evaluate(() => {
    const b = document.querySelector(".screen.active .xbtn.fwd");
    if (!b || b.disabled || b.offsetParent === null) return false;
    b.click();
    return true;
  });
  if (!ok) return false;
  for (let i = 0; i < 30; i++) {
    await W(page, 100);
    // 넘어가는 동안 옛 스텝과 새 스텝이 함께 있을 수 있어 마지막 스텝을 본다
    const now = await page.evaluate(() => { const ss = document.querySelectorAll(".screen.active .step"); const s = ss[ss.length - 1]; return s ? s.dataset.taps ?? "new" : ""; });
    if (now !== before) break;
  }
  await W(page, 700);
  return true;
}

/** 스텝 안에서 포인터·클릭 리스너가 달린 요소에 data-ha="<종류들>"를 붙인다. */
async function markListeners({ page, cdp }) {
  await page.evaluate(() => document.querySelectorAll("[data-ha]").forEach((e) => e.removeAttribute("data-ha")));
  const { result } = await cdp.send("Runtime.evaluate", { expression: "document.querySelector('.screen.active .step')" });
  if (!result.objectId) return 0;
  const { listeners } = await cdp.send("DOMDebugger.getEventListeners", { objectId: result.objectId, depth: -1, pierce: true });
  const types = new Set(["click", "pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend"]);
  const byNode = new Map();
  for (const l of listeners) {
    if (!types.has(l.type) || !l.backendNodeId) continue;
    if (!byNode.has(l.backendNodeId)) byNode.set(l.backendNodeId, new Set());
    byNode.get(l.backendNodeId).add(l.type);
  }
  for (const [backendNodeId, ts] of byNode) {
    try {
      const { object } = await cdp.send("DOM.resolveNode", { backendNodeId });
      await cdp.send("Runtime.callFunctionOn", {
        objectId: object.objectId,
        functionDeclaration: "function(t){ if (this.setAttribute) this.setAttribute('data-ha', t); }",
        arguments: [{ value: [...ts].join(",") }],
      });
    } catch {
      /* 그사이 사라진 노드 */
    }
  }
  return byNode.size;
}

/** A. 가림 검사: 눌러야 하는 것의 가운데가 그 요소에 닿는가. */
const auditHits = (page) =>
  page.evaluate(() => {
    const step = document.querySelector(".screen.active .step");
    if (!step) return [];
    const desc = (e) => {
      if (!e) return "(없음)";
      const cls = (e.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 3).join(".");
      const t = (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 22);
      return `${e.tagName.toLowerCase()}${cls ? "." + cls : ""}${t ? ` "${t}"` : ""}`;
    };
    const cands = new Set(step.querySelectorAll("button, [role=button], input, select, [data-ha]"));
    for (const e of step.querySelectorAll("*")) if (getComputedStyle(e).cursor === "pointer") cands.add(e);
    const out = [];
    for (const e of cands) {
      if (e.disabled) continue;
      if (!e.getClientRects().length) continue;
      if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      // pointer-events: none은 그 순간 일부러 잠근 것이다(예: 도입에서 예측을 고르기 전의 무대 버튼). 잠금이 풀린 뒤의 검사가 본다
      if (getComputedStyle(e).pointerEvents === "none") continue;
      // 손가락 커서만 물려받은 자식(버튼 안의 글자 등)은 부모가 대표한다
      if (!e.hasAttribute("data-ha") && !e.matches("button, [role=button], input, select") && e.parentElement && getComputedStyle(e.parentElement).cursor === "pointer") continue;
      e.scrollIntoView({ block: "nearest", inline: "nearest" });
      const r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const issues = [];
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) issues.push("가운데가 화면 밖");
      else {
        const top = document.elementFromPoint(x, y);
        if (!(top && (top === e || e.contains(top)))) {
          // 가운데를 받은 것이 이 요소의 조상이고 조상이 리스너를 가졌다면 위임일 수 있다(그래도 적어 둔다)
          const anc = top && top.contains(e);
          issues.push(`${anc ? "가운데가 비어 조상" : "가운데를 덮은 것"} ${desc(top)}`);
        }
      }
      const small = Math.min(r.width, r.height) < 24;
      if (small) issues.push(`작음 ${Math.round(r.width)}×${Math.round(r.height)}`);
      if (issues.length) out.push({ el: desc(e), ha: e.getAttribute("data-ha") || "", issues });
    }
    return out;
  });

/** 도입의 예측 보기를 고른다(보기 글이 사전순으로 가장 앞인 것: 두 화면이 섞인 차례와 무관하게 같은 것을 고른다). */
async function pickPrediction(page) {
  const p = await page.evaluate(() => {
    const bs = [...document.querySelectorAll(".screen.active .hook-choices.show .hook-choice")].filter((b) => !b.disabled && b.offsetParent !== null);
    if (!bs.length) return null;
    bs.sort((a, b) => a.textContent.localeCompare(b.textContent));
    bs[0].scrollIntoView({ block: "nearest" });
    const r = bs[0].getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: bs[0].textContent.trim() };
  });
  if (!p) return null;
  await page.mouse.click(p.x, p.y);
  await W(page, 1500);
  return p.t;
}

/** B. 같은 설계 좌표를 차례로 누르고 조작 칸 버튼을 차례로 누른 뒤의 글 서명. */
async function probe(page) {
  const stage = await page.evaluate(() => {
    const s = document.querySelector(".screen.active .bv-stage, .screen.active .opn-stage");
    if (!s) return null;
    // 무대 안이나 무대를 감싼 요소에 누르기 리스너가 없으면(버튼만 쓰는 화면) 격자 누르기를 건너뛴다(리스너 표식은 A가 단다)
    const marked = document.querySelectorAll(".screen.active [data-ha]");
    if (marked.length && !s.querySelector("[data-ha]") && ![...marked].some((e) => e.contains(s))) return null;
    s.scrollIntoView({ block: "nearest" });
    const r = s.getBoundingClientRect();
    const z = s.offsetWidth ? r.width / s.offsetWidth : 1;
    return { l: r.left, t: r.top, z, w: s.offsetWidth, h: s.offsetHeight };
  });
  const log = [];
  // 누를 때마다의 반응(도움말, 쌤의 말, 진행 점, 조작 칸 글)을 줄로 남긴다. 마지막 상태만 보면 뒤의 버튼이 앞의 차이를 덮는다.
  const snap = () =>
    page.evaluate(() => {
      const s = document.querySelector(".screen.active .step");
      if (!s) return "";
      const T = (sel) => [...s.querySelectorAll(sel)].map((e) => (e.textContent || "").trim().replace(/\s+/g, " ")).filter(Boolean).join(" / ");
      return [T(".bv-helper, .opn-bubble"), s.querySelectorAll(".bv-pips i.on").length, s.dataset.opnPhase ?? "", T(".bv-ctl"), T(".bv-q.show .bv-qt")].join(" | ");
    });
  const trace = [];
  if (stage) {
    const xs = [0.07, 0.21, 0.36, 0.5, 0.64, 0.79, 0.93];
    const ys = [0.12, 0.31, 0.5, 0.69, 0.88];
    for (const fy of ys)
      for (const fx of xs) {
        const x = stage.l + fx * stage.w * stage.z;
        const y = stage.t + fy * stage.h * stage.z;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await W(page, 40);
        await page.mouse.up();
        await W(page, 150);
        trace.push(`(${Math.round(fx * stage.w)},${Math.round(fy * stage.h)}) ${await snap()}`);
      }
  }
  // 조작 칸의 버튼(보이고 켜진 것)을 DOM 차례로 한 번씩
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .bv-ctl button, .screen.active .opn-controls button").length);
  for (let i = 0; i < Math.min(n, 8); i++) {
    const p = await page.evaluate((i) => {
      const b = [...document.querySelectorAll(".screen.active .bv-ctl button, .screen.active .opn-controls button")][i];
      if (!b || b.disabled || !b.getClientRects().length || (b.checkVisibility && !b.checkVisibility({ opacityProperty: true, visibilityProperty: true }))) return null;
      b.scrollIntoView({ block: "nearest" });
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: b.textContent.trim().slice(0, 12) };
    }, i);
    if (!p) continue;
    await page.mouse.click(p.x, p.y);
    log.push(p.t);
    await W(page, 260);
    trace.push(`[${p.t}] ${await snap()}`);
  }
  await W(page, 1200);
  const sig = await page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    const T = (sel) => [...s.querySelectorAll(sel)].map((e) => (e.textContent || "").trim().replace(/\s+/g, " ")).filter(Boolean).join(" / ");
    return {
      helper: T(".bv-helper, .opn-bubble"),
      pips: s.querySelectorAll(".bv-pips i.on").length,
      phase: s.dataset.opnPhase ?? "",
      ctl: T(".bv-ctl"),
      q: T(".bv-q.show .bv-qt"),
      done: T(".bv-done.show"),
      stageCls: (s.querySelector(".opn-stage, .bv-stage")?.getAttribute("class") || ""),
    };
  });
  return { sig, buttons: log, trace };
}

const TIME = !!process.env.TAPS_T;
async function walk(P, id) {
  const { page } = P;
  const recs = [];
  let t0 = Date.now();
  const tick = (what) => {
    if (TIME) console.log(`  [${P.mode}] ${what} ${Date.now() - t0}ms`);
    t0 = Date.now();
  };
  await openLesson(page, id);
  tick("열기");
  for (let i = 0; i < 40; i++) {
    const info = await stepInfo(page);
    if (!info) break;
    if (info.kind !== "other") {
      const rec = { i, kind: info.kind, title: info.title, a: [], b: null, pick: null };
      if (doA) {
        await markListeners(P);
        tick(`#${i + 1} 리스너`);
        rec.a.push(...(await auditHits(page)).map((x) => ({ ...x, phase: "열림" })));
        tick(`#${i + 1} 가림`);
      }
      if (info.kind === "opener") {
        rec.pick = await pickPrediction(page);
        if (doA && rec.pick) {
          await markListeners(P);
          rec.a.push(...(await auditHits(page)).map((x) => ({ ...x, phase: "예측 뒤" })));
        }
        tick(`#${i + 1} 예측`);
      }
      if (doB) {
        if (!doA) await markListeners(P); // 격자를 건너뛸지 가리려면 리스너 표식이 있어야 한다
        rec.b = await probe(page);
      }
      tick(`#${i + 1} 견주기`);
      recs.push(rec);
    }
    if (info.recap) break;
    if (!(await fwd(page))) break;
    tick(`#${i + 1} 넘기기`);
  }
  return recs;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const phone = await makePage(browser, "phone");
const wide = await makePage(browser, "wide");
const report = [];
let aCount = 0;
let bDiff = 0;
for (const id of lessons) {
  const [rp, rw] = await Promise.all([walk(phone, id), walk(wide, id)]);
  for (let k = 0; k < Math.max(rp.length, rw.length); k++) {
    const p = rp[k];
    const w = rw[k];
    const ref = p ?? w;
    const row = { id, step: ref.i + 1, kind: ref.kind, title: ref.title, phoneA: p?.a ?? [], wideA: w?.a ?? [], diff: null };
    aCount += row.phoneA.length + row.wideA.length;
    if (doB && p?.b && w?.b) {
      const keys = Object.keys(p.b.sig).filter((key) => key !== "stageCls" && p.b.sig[key] !== w.b.sig[key]);
      const at = p.b.trace.findIndex((t, j) => t !== w.b.trace[j]);
      if (keys.length || at >= 0 || p.b.buttons.join("|") !== w.b.buttons.join("|")) {
        row.diff = { keys, firstSplit: at, phoneAt: p.b.trace[at] ?? "", wideAt: w.b.trace[at] ?? "", phone: p.b.sig, wide: w.b.sig, phoneBtns: p.b.buttons, wideBtns: w.b.buttons };
        bDiff++;
      }
    }
    report.push(row);
    const flag = (row.phoneA.length || row.wideA.length ? " A" : "") + (row.diff ? " B" : "");
    console.log(`${id} #${row.step} ${row.kind} ${row.title}${flag ? "  <<" + flag : ""}`);
    for (const [m, list] of [["폰", row.phoneA], ["넓은", row.wideA]]) for (const x of list) console.log(`    A ${m} [${x.phase}] ${x.el}${x.ha ? " {" + x.ha + "}" : ""}: ${x.issues.join("; ")}`);
    if (row.diff && row.diff.firstSplit >= 0) console.log(`    B 처음 갈린 곳 ${row.diff.firstSplit + 1}번째 누름\n      폰  ${row.diff.phoneAt.slice(0, 200)}\n      넓은 ${row.diff.wideAt.slice(0, 200)}`);
    if (row.diff) for (const key of row.diff.keys) console.log(`    B 끝 ${key}: 폰「${String(row.diff.phone[key]).slice(0, 120)}」 / 넓은「${String(row.diff.wide[key]).slice(0, 120)}」`);
  }
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ lessons, report, errors: { phone: phone.errors, wide: wide.errors } }, null, 1));
console.log(`\n레슨 ${lessons.length}개, 도입·랩 스텝 ${report.length}개. A(가림·크기) ${aCount}건, B(폰과 넓은 화면이 갈림) ${bDiff}곳. 페이지 오류 폰 ${phone.errors.length}, 넓은 ${wide.errors.length}`);
for (const [m, errs] of [["폰", phone.errors], ["넓은", wide.errors]]) for (const e of [...new Set(errs)].slice(0, 10)) console.log(`  오류(${m}): ${e.slice(0, 160)}`);
console.log(`저장: ${OUT}`);
await browser.close();
