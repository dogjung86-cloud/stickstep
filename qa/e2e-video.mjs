// 개념 영상 진입점 검사: 지도의 영상 칸, 재생 화면, 완료 표시, 유료 잠금, 레슨 머리줄 버튼, 넓은 화면.
// DEV 서버 필요. PORT=<포트> node qa/e2e-video.mjs [스크린샷 폴더]
// 영상이 올라간 곳(src)이 아직 하나도 없으므로 재생 자체(Vimeo 임베드, 파일 재생)는 여기서 보지 않는다.
// 검수용 미리 보기(sessionStorage "ss.vid"="1")로 자리 표시 재생 화면까지의 길을 본다.
import { chromium } from "playwright-core";
import fs from "fs";

const PORT = process.env.PORT || "5173";
const SHOTS = process.argv[2] || "";
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
let checks = 0, fails = 0, pageErrors = 0;
const check = (ok, msg) => { checks += 1; if (!ok) fails += 1; console.log(`${ok ? "PASS" : "FAIL"} [${checks}] ${msg}`); };
const STUB = "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector('style[data-vite-dev-id=\"'+id+'\"]');if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}";

async function open({ vp = { width: 390, height: 700 }, preview = true, premium = true, lessons = { u3l1: { done: true, acc: 100, xp: 100 } }, query = "" } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { pageErrors += 1; console.log("PAGEERROR:", e.message); });
  await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: STUB }));
  await page.addInitScript(({ preview, premium, lessons }) => {
    if (preview) sessionStorage.setItem("ss.vid", "1");
    if (!localStorage.getItem("science-app.v1"))
      localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium, reviewMode: false, goalMin: 10, streak: 1, lastStudyDay: null, totalXp: 0, lessons, minigame: {} }));
  }, { preview, premium, lessons });
  const W = (ms) => page.waitForTimeout(ms);
  await page.goto(`http://localhost:${PORT}/${query}`, { waitUntil: "networkidle" });
  if (!query) {
    await page.waitForSelector("#sc-splash", { timeout: 25000 });
    await page.mouse.click(vp.width / 2, 300);
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
    await page.waitForSelector("#sc-home", { timeout: 15000 });
    await W(800);
  } else await W(2500);
  const unit = async (t) => { await page.evaluate((t) => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.includes(t))?.click(), t); await W(1800); };
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };
  return { ctx, page, W, unit, shot };
}
const mapInfo = (page) => page.evaluate(() => {
  const r = (e) => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, l: b.left, r: b.right, t: b.top, b: b.bottom }; };
  const L = document.querySelector(".gm-nodes").getBoundingClientRect();
  return {
    left: L.left, right: L.right,
    nodes: [...document.querySelectorAll(".gm-node")].map((n) => ({ cls: n.className, ...r(n.querySelector(".gm-med")) })),
    vids: [...document.querySelectorAll(".gm-vid")].map((n) => ({ id: n.dataset.vid, cls: n.className, small: n.querySelector("small").textContent, label: r(n.querySelector(".gv-label")), ...r(n.querySelector(".gv-med")) })),
    walker: r(document.querySelector(".gm-walker")),
  };
});

// [A] 미리 보기가 꺼져 있으면(=지금 운영) 지도와 레슨이 예전 그대로다
{
  const { ctx, page, unit, shot } = await open({ preview: false });
  await unit("열");
  const m = await mapInfo(page);
  check(m.vids.length === 0, "[A] 영상이 올라간 곳이 없으면 지도에 영상 칸이 없다");
  check(m.nodes.length === 6, `[A] 발자국 수는 그대로(레슨 5 + 시험 1 = ${m.nodes.length})`);
  await shot("a-map-off");
  await ctx.close();
  const l = await open({ preview: false, query: "?open=u3l1" });
  check((await l.page.locator(".lesson-screen .lvid").count()) === 0, "[A] 레슨 머리줄에 영상 버튼이 없다");
  await l.ctx.close();
}

// [B] 미리 보기: Ⅲ단원 지도의 영상 칸
{
  const { ctx, page, W, unit, shot } = await open();
  await unit("열");
  await page.evaluate(() => { document.querySelector("#sc-home .scroll").scrollTop = 230; });
  await W(400);
  let m = await mapInfo(page);
  check(m.vids.length === 4, `[B] Ⅲ단원 영상 칸 4개(${m.vids.length})`);
  check(m.nodes.length === 6, `[B] 발자국(.gm-node) 수는 그대로 6(${m.nodes.length})`);
  check(m.vids.map((v) => v.id).join() === "u3v1,u3v2,u3v3,u3v4", "[B] 영상 순서");
  check(m.vids[0].y < m.nodes[0].y && m.vids[1].y > m.nodes[1].y && m.vids[1].y < m.nodes[2].y, "[B] 영상 칸은 묶음의 첫 발자국 앞에 선다(1편은 레슨 1 앞, 2편은 레슨 2와 3 사이)");
  check(m.vids.every((v) => v.label.l >= m.left && v.label.r <= m.right), "[B] 이름표가 지도 밖으로 나가지 않는다");
  check(m.vids.every((v) => v.small === "3분"), "[B] 안 본 영상은 길이를 보인다");
  const now = m.nodes.find((n) => / now /.test(` ${n.cls} `));
  check(!!now && Math.abs(m.walker.x - now.x) < 6, "[B] 걷는 캐릭터는 영상 칸이 아니라 지금 할 발자국에 서 있다");
  await shot("b-map");
  // 잠긴 발자국들 사이의 2편을 누른다(앞 레슨을 마치지 않아도 열린다)
  check(m.nodes[2].cls.includes("locked"), "[B] 레슨 3 발자국은 잠겨 있다");
  await page.locator('.gm-vid[data-vid="u3v2"]').click();
  await page.waitForSelector("#sc-video.active", { timeout: 5000 });
  check((await page.locator("#sc-video .vp-ttl b").textContent()) === "열의 이동", "[B] 잠긴 발자국 앞의 영상도 열린다(재생 화면 제목)");
  check((await page.locator("#sc-video .vp-empty").count()) === 1, "[B] 올라간 곳이 없는 영상은 자리 표시를 보인다");
  const fr = await page.locator("#sc-video .vp-frame").boundingBox();
  check(Math.abs(fr.width / fr.height - 9 / 16) < 0.02 && fr.height > 560, `[B] 세로 9:16 틀이 화면을 채운다(${Math.round(fr.width)}x${Math.round(fr.height)})`);
  await shot("b-player");
  await page.locator("#sc-video .vp-mark").click();
  await page.locator("#sc-video .vp-x").click();
  await W(900);
  check((await page.locator("#sc-home.active").count()) === 1, "[B] 닫으면 지도로 돌아온다");
  m = await mapInfo(page);
  const v2 = m.vids.find((v) => v.id === "u3v2");
  check(v2.cls.includes("seen") && v2.small === "봤어요", "[B] 다 본 영상은 그 자리에서 완료 표시로 바뀐다");
  check((await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")).videos?.u3v2?.done)) === true, "[B] 시청 기록이 기기에 남는다");
  check(m.nodes[2].cls.includes("locked"), "[B] 영상을 봐도 발자국 잠금은 풀리지 않는다");
  await shot("b-map-seen");
  // 하드웨어 뒤로가기로 닫기
  await page.locator('.gm-vid[data-vid="u3v3"]').click();
  await page.waitForSelector("#sc-video.active");
  await page.goBack();
  await W(900);
  check((await page.locator("#sc-home.active").count()) === 1 && (await page.locator("#sc-video").count()) === 0, "[B] 뒤로가기로도 닫힌다");
  // 다시 그려도 완료 표시가 남는다
  await unit("상태");
  await unit("열");
  m = await mapInfo(page);
  check(m.vids.find((v) => v.id === "u3v2").cls.includes("seen"), "[B] 지도를 다시 그려도 완료 표시가 남는다");
  // 묶음이 큰 단원
  await unit("생물");
  m = await mapInfo(page);
  check(m.vids.length === 5 && m.nodes.length === 11, `[B] Ⅱ단원 영상 칸 5개, 발자국 11개(${m.vids.length}, ${m.nodes.length})`);
  await ctx.close();
}

// [C] 유료 잠금
{
  const { ctx, page, W, unit, shot } = await open({ premium: false, lessons: {} });
  await unit("생물");
  const m = await mapInfo(page);
  const v1 = m.vids.find((v) => v.id === "u2v1"), v2 = m.vids.find((v) => v.id === "u2v2");
  check(!v1.cls.includes("locked"), "[C] 무료 레슨에 딸린 영상은 열려 있다");
  check(v2.cls.includes("locked") && v2.small === "프리미엄", "[C] 유료 레슨에 딸린 영상은 잠긴다");
  await page.locator('.gm-vid[data-vid="u2v2"]').scrollIntoViewIfNeeded();
  await shot("c-locked");
  await page.locator('.gm-vid[data-vid="u2v2"]').click();
  await W(900);
  check((await page.locator("#sc-paywall.active").count()) === 1 && (await page.locator("#sc-video").count()) === 0, "[C] 잠긴 영상을 누르면 페이월로 간다");
  await ctx.close();
}

// [D] 레슨 머리줄의 상시 버튼: 영상을 보고 돌아와도 스텝 안의 진행이 그대로다
{
  const { ctx, page, W, shot } = await open({ query: "?open=u3l1" });
  check((await page.locator(".lesson-screen .lvid").count()) === 1, "[D] 레슨 머리줄에 영상 버튼이 있다");
  const fwd = async (n) => { for (let i = 0; i < n; i++) { await page.evaluate(() => document.querySelector(".lesson-screen .xbtn.fwd")?.click()); await W(700); } };
  const watch = async () => {
    await page.locator(".lesson-screen .lvid").click();
    await page.waitForSelector("#sc-video.active");
    await W(700);
    await page.locator("#sc-video .vp-x").click();
    await W(1100);
  };
  const frame = () => page.evaluate(() => { const c = document.querySelector(".lesson-screen .step canvas"); return c ? c.toDataURL().length + ":" + c.toDataURL().slice(-400) : null; });
  // 랩 스텝: 조작한 뒤 영상을 보고 온다
  await fwd(1);
  const box = await page.locator(".lesson-screen .step canvas").first().boundingBox();
  const sl = await page.evaluate(() => { const t = [...document.querySelectorAll(".lesson-screen .step *")].find((e) => /slider|track|range/.test(e.className?.toString?.() ?? "") && e.getBoundingClientRect().width > 150); if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
  if (sl) { await page.mouse.move(sl.x + sl.w * 0.2, sl.y); await page.mouse.down(); await page.mouse.move(sl.x + sl.w * 0.8, sl.y, { steps: 8 }); await page.mouse.up(); await W(600); }
  await page.evaluate(() => document.querySelector(".lesson-screen .step").setAttribute("data-keep", "1"));
  const before = await page.evaluate(() => ({ w: document.querySelector(".lesson-screen .pbar").style.width, text: document.querySelector(".lesson-screen .step").innerText, cta: document.querySelector(".lesson-screen .cta").textContent + "|" + document.querySelector(".lesson-screen .cta").disabled }));
  await shot("d-lab-before");
  await watch();
  const after = await page.evaluate(() => ({ on: !!document.querySelector(".lesson-screen.active"), keep: !!document.querySelector(".lesson-screen .step[data-keep]"), w: document.querySelector(".lesson-screen .pbar").style.width, text: document.querySelector(".lesson-screen .step").innerText, cta: document.querySelector(".lesson-screen .cta").textContent + "|" + document.querySelector(".lesson-screen .cta").disabled }));
  check(after.on && after.keep, "[D] 랩: 돌아오면 같은 스텝 화면 그대로다(다시 그리지 않는다)");
  check(after.w === before.w && after.text === before.text && after.cta === before.cta, `[D] 랩: 조작한 상태와 다음 버튼이 그대로다(조작 ${sl ? "함" : "못 찾음"}, 캔버스 ${box ? "있음" : "없음"})`);
  const f1 = await frame(); await W(500); const f2 = await frame();
  check(!!f1 && f1 !== f2, "[D] 랩: 무대의 움직임이 다시 돈다(멈춘 그림으로 남지 않는다)");
  await shot("d-lab-after");
  // 문제 스텝: 보기를 고른 채로 영상을 보고 온다
  await fwd(3);
  await page.locator('.lesson-screen .opts .opt[data-oi="1"]').click();
  await W(300);
  const pick = () => page.evaluate(() => [...document.querySelectorAll(".lesson-screen .opts .opt")].map((o) => o.className).join("|"));
  const p1 = await pick();
  await watch();
  check((await pick()) === p1 && /sel|on|picked|active/.test(p1), "[D] 문제: 고른 보기가 그대로 남아 있다");
  // 묶음의 둘째 레슨도 같은 영상
  await ctx.close();
  const l2 = await open({ query: "?open=u3l2" });
  await l2.page.locator(".lesson-screen .lvid").click();
  await l2.page.waitForSelector("#sc-video.active");
  check((await l2.page.locator("#sc-video .vp-ttl b").textContent()) === "온도와 열평형", "[D] 묶음의 둘째 레슨도 같은 영상을 연다");
  await l2.ctx.close();
}

// [E] 넓은 화면
{
  const { ctx, page, W, unit, shot } = await open({ vp: { width: 1280, height: 800 } });
  await unit("열");
  const m = await mapInfo(page);
  check(await page.evaluate(() => document.documentElement.classList.contains("wide")), "[E] 넓은 화면으로 열린다");
  check(m.vids.length === 4 && m.vids.every((v) => v.label.l >= m.left && v.label.r <= m.right), "[E] 영상 칸 4개가 지도 안에 든다");
  await shot("e-wide-map");
  await page.locator('.gm-vid[data-vid="u3v1"]').click();
  await page.waitForSelector("#sc-video.active");
  await W(500);
  const fr = await page.locator("#sc-video .vp-frame").boundingBox();
  check(Math.abs(fr.width / fr.height - 9 / 16) < 0.02 && fr.height > 600, `[E] 넓은 화면의 재생 틀(${Math.round(fr.width)}x${Math.round(fr.height)})`);
  await shot("e-wide-player");
  await ctx.close();
}

await browser.close();
console.log(`\n${checks - fails}/${checks} 통과, 페이지 오류 ${pageErrors}건`);
process.exit(fails || pageErrors ? 1 : 0);
