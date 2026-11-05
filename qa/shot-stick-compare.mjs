// 스틱맨 전후 비교판(과학): 변경 전(BEFORE_PORT)과 후(PORT) 서버의 같은 장면을 3배율로 찍어 나란히 놓는다.
// PORT=<후> BEFORE_PORT=<전> node qa/shot-stick-compare.mjs [출력 폴더]
// 변경 전 서버 = git archive로 뽑은 HEAD 소스 + public 공유(qa-stickscenes.html을 같이 쓴다).
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";

const OUT = process.argv[2] || "qa/shots/compare";
const AFTER = process.env.PORT || "5199";
const BEFORE = process.env.BEFORE_PORT;
if (!BEFORE) throw new Error("BEFORE_PORT 필요");
mkdirSync(`${OUT}/parts`, { recursive: true });

const addPeople = async (page) => {
  await page.evaluate(() => {
    const plus = [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "+");
    for (let i = 0; i < 2; i++) plus.forEach((b) => b.click());
  });
};
const hold = (txt) => async (page) => {
  const box = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((e) => e.textContent.includes(t));
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, txt);
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
};

// [제목, 쿼리, 조작, 찍을 요소]
const SCENES = {
  labs: [
    ["줄다리기 (힘의 평형)", "types=tugOfWar", addPeople, "canvas"],
    ["상자 밀기 (마찰력)", "types=frictionPush", hold("밀기"), "canvas"],
    ["모닥불 (복사)", "types=radiation", null, "canvas"],
    ["세포 임무", "types=shapeJobLab", null, "svg"],
  ],
  hooks: [
    ["줄다리기 훅", "scenes=tugrope", null, "svg"],
    ["빙판길", "scenes=iceslip", null, "svg"],
    ["사해", "scenes=deadsea", null, "svg"],
    ["약수터", "scenes=springwater", null, "svg"],
    ["낚시 (밤 무대)", "scenes=fishing", null, "svg"],
    ["전기 자전거", "scenes=ebike", null, "svg"],
    ["밤길 (밤 무대)", "scenes=nightroad", null, "svg"],
    ["딸꾹질", "scenes=hiccup", null, "svg"],
  ],
};

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function shot(port, query, act, sel, name) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 3 });
  await page.goto(`http://localhost:${port}/qa-stickscenes.html?subject=sci&${query}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__qa !== undefined, null, { timeout: 120000 });
  await page.waitForTimeout(900);
  if (act) await act(page);
  await page.waitForTimeout(1300);
  await page.locator(`.qa-card ${sel}`).first().screenshot({ path: name });
  await page.close();
}
const b64 = (p) => `data:image/png;base64,${readFileSync(p).toString("base64")}`;

for (const [group, list] of Object.entries(SCENES)) {
  const rows = [];
  for (const [title, q, act, sel] of list) {
    const key = q.replace(/[^a-zA-Z0-9]/g, "_");
    const a = `${OUT}/parts/${key}-before.png`;
    const b = `${OUT}/parts/${key}-after.png`;
    await shot(BEFORE, q, act, sel, a);
    await shot(AFTER, q, act, sel, b);
    rows.push(`<div class="r"><h3>${title}</h3><div class="p"><figure><img src="${b64(a)}"><figcaption>지금</figcaption></figure><figure><img src="${b64(b)}"><figcaption>새 스틱맨</figcaption></figure></div></div>`);
    console.log("shot", title);
  }
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:28px;background:#F2F4F6;font-family:Pretendard,'Malgun Gothic',system-ui,sans-serif;color:#191F28}
    .g{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .r{background:#fff;border-radius:18px;padding:16px 18px}
    h3{margin:0 0 10px;font-size:17px}
    .p{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
    figure{margin:0}
    img{width:100%;display:block;border-radius:10px}
    figcaption{margin-top:6px;font-size:13px;color:#6B7684;text-align:center}
  </style><div class="g">${rows.join("")}</div>`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/compare-${group}.png`, fullPage: true });
  await page.close();
  console.log("saved", `${OUT}/compare-${group}.png`);
}
await browser.close();
