// 스틱맨 아바타 파츠 갤러리 캡처: PORT=<포트> node qa/shot-avatar-gallery.mjs [모드] [출력 폴더]
// 모드: review(기본: 파츠를 크게 그려 눈검수) · parts(픽커 썸네일 그대로 전 파츠) · presets · sizes · all
// dev 서버의 src 모듈(stickParts)을 페이지 안에서 직접 import해 그린다. 앱 화면을 거치지 않는다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5527";
const MODE = process.argv[2] || "review";
const OUT = process.argv[3] || "qa/shots/avatar";
mkdirSync(OUT, { recursive: true });

const VITE_STUB =
  "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE:", m.text());
});
await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: VITE_STUB }));
await page.goto(`http://localhost:${PORT}/#/my`, { waitUntil: "networkidle" });
await page.waitForSelector("#sc-my", { timeout: 20000 });

async function sheet(name, build, arg) {
  await page.evaluate(
    async ({ build, arg }) => {
      const m = await import("/src/ui/stickParts.ts");
      const art = await import("/src/ui/stickArt.ts");
      document.documentElement.style.cssText = "height:auto;overflow:auto";
      document.body.style.cssText =
        "display:block;height:auto;overflow:visible;background:#fff;user-select:none;padding:28px 32px 40px;font-family:'Pretendard Variable',Pretendard,system-ui,sans-serif;color:#191F28";
      document.body.innerHTML = "";
      const h = (tag, css, html) => {
        const e = document.createElement(tag);
        if (css) e.style.cssText = css;
        if (html != null) e.innerHTML = html;
        return e;
      };
      // eslint-disable-next-line no-new-func
      new Function("m", "art", "h", "arg", build)(m, art, h, arg);
    },
    { build, arg },
  );
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log("saved", `${OUT}/${name}.png`);
}

// ── 눈검수: 파츠 하나하나를 상반신 전체로 크게 ──
const REVIEW = `
  const base = Object.assign({}, m.DEFAULT_STICK, arg.base || {});
  for (const slot of m.STICK_SLOTS) {
    if (arg.only && !arg.only.includes(slot.key)) continue;
    document.body.appendChild(h("div", "font-size:22px;font-weight:800;margin:26px 0 12px", slot.label + " (" + slot.parts.length + ")"));
    const row = h("div", "display:flex;flex-wrap:wrap;gap:14px");
    slot.parts.forEach((part, i) => {
      const cfg = Object.assign({}, base, { [slot.key]: i });
      const cell = h("div", "width:" + arg.size + "px;text-align:center");
      const fr = h("div", "width:" + arg.size + "px;height:" + arg.size + "px;border-radius:" + (arg.round ? "50%" : "18px") + ";overflow:hidden;border:1px solid #E7EAEE;background:#fff");
      fr.innerHTML = arg.thumb ? m.stickAvatarSvg(cfg, { view: slot.view, hide: slot.hide, bg: !!slot.round }) : m.stickAvatarSvg(cfg);
      fr.firstChild.style.cssText = "width:100%;height:100%;display:block";
      cell.appendChild(fr);
      cell.appendChild(h("div", "margin-top:6px;font-size:13px;font-weight:700;color:#4E5968", i + " " + part.name));
      row.appendChild(cell);
    });
    document.body.appendChild(row);
  }
`;

// ── 픽커 썸네일 그대로(슬롯별 확대 영역): 판정 자료용 "전 파츠 한눈에" ──
const PARTS = `
  const base = Object.assign({}, m.DEFAULT_STICK, arg.base || {});
  document.body.appendChild(h("div", "font-size:26px;font-weight:800;margin-bottom:4px", arg.title));
  document.body.appendChild(h("div", "font-size:14px;font-weight:600;color:#6B7684;margin-bottom:8px", arg.sub));
  for (const slot of m.STICK_SLOTS) {
    document.body.appendChild(h("div", "font-size:17px;font-weight:800;margin:20px 0 9px", slot.label + " <span style='color:#9AA3AD;font-weight:700'>" + slot.parts.length + "가지</span>"));
    if (slot.color) {
      const sw = h("div", "display:flex;gap:7px;align-items:center;margin:0 0 10px");
      sw.appendChild(h("span", "font-size:12.5px;font-weight:700;color:#6B7684;margin-right:4px", slot.color.label + " " + slot.color.swatches.length + "색"));
      for (const s of slot.color.swatches) sw.appendChild(h("span", "width:22px;height:22px;border-radius:50%;background:" + s.css + ";box-shadow:inset 0 0 0 1.5px rgba(25,31,40,.14)"));
      document.body.appendChild(sw);
    }
    const row = h("div", "display:flex;flex-wrap:wrap;gap:9px");
    slot.parts.forEach((part, i) => {
      const cfg = Object.assign({}, base, { [slot.key]: i });
      const cell = h("div", "width:84px;text-align:center");
      const fr = h("div", "width:84px;height:84px;border-radius:" + (slot.round ? "50%" : "16px") + ";overflow:hidden;border:1.5px solid #E7EAEE;background:#F7F8FA");
      fr.innerHTML = m.stickAvatarSvg(cfg, { view: slot.view, hide: slot.hide, bg: !!slot.round });
      fr.firstChild.style.cssText = "width:100%;height:100%;display:block";
      cell.appendChild(fr);
      cell.appendChild(h("div", "margin-top:4px;font-size:11.5px;font-weight:700;color:#6B7684;white-space:nowrap", part.name));
      row.appendChild(cell);
    });
    document.body.appendChild(row);
  }
`;

const PRESETS = `
  document.body.appendChild(h("div", "font-size:26px;font-weight:800;margin-bottom:14px", "캐릭터 프리셋 " + m.STICK_PRESETS.length + "종"));
  const row = h("div", "display:flex;flex-wrap:wrap;gap:18px");
  m.STICK_PRESETS.forEach((pr) => {
    const cell = h("div", "width:" + arg.size + "px;text-align:center");
    const fr = h("div", "width:" + arg.size + "px;height:" + arg.size + "px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1.5px #E7EAEE");
    fr.innerHTML = m.stickAvatarSvg(pr.cfg);
    fr.firstChild.style.cssText = "width:100%;height:100%;display:block";
    cell.appendChild(fr);
    cell.appendChild(h("div", "margin-top:8px;font-size:15px;font-weight:800", pr.name));
    row.appendChild(cell);
  });
  document.body.appendChild(row);
`;

// ── 실제 쓰이는 크기: 카드 72px(상반신) · 탭바 21px(얼굴 확대) ──
const SIZES = `
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const list = m.STICK_PRESETS.map((p) => p.cfg);
  for (let i = 0; i < 24; i++) list.push(m.randomStick(rnd));
  const put = (title, size, view, zoom) => {
    document.body.appendChild(h("div", "font-size:18px;font-weight:800;margin:22px 0 10px", title));
    const row = h("div", "display:flex;flex-wrap:wrap;gap:" + Math.max(8, size / 5) + "px;zoom:" + zoom);
    for (const cfg of list) {
      const fr = h("div", "width:" + size + "px;height:" + size + "px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1.5px #E7EAEE;flex:none");
      fr.innerHTML = m.stickAvatarSvg(cfg, { view });
      fr.firstChild.style.cssText = "width:100%;height:100%;display:block";
      row.appendChild(fr);
    }
    document.body.appendChild(row);
  };
  put("꾸미기 미리보기 132px", 132, "bust", 1);
  put("마이 탭 카드 72px", 72, "bust", 1);
  put("탭바 21px (얼굴 확대, 실제 크기)", 21, "head", 1);
  put("탭바 21px (4배 확대해서 본 모습)", 21, "head", 4);
  put("비교: 탭바에 상반신을 그대로 넣었을 때 (4배 확대)", 21, "bust", 4);
`;

// ── 조합 검수: 임의 조합 목록(JSON)을 크게: 모자×머리 같은 상호작용 확인용 ──
const COMBOS = `
  const row = h("div", "display:flex;flex-wrap:wrap;gap:14px");
  for (const item of arg.list) {
    const cell = h("div", "width:" + arg.size + "px;text-align:center");
    const fr = h("div", "width:" + arg.size + "px;height:" + arg.size + "px;border-radius:18px;overflow:hidden;border:1px solid #E7EAEE;background:#fff");
    fr.innerHTML = m.stickAvatarSvg(Object.assign({}, m.DEFAULT_STICK, item.cfg), item.opts || {});
    fr.firstChild.style.cssText = "width:100%;height:100%;display:block";
    cell.appendChild(fr);
    cell.appendChild(h("div", "margin-top:6px;font-size:12px;font-weight:700;color:#4E5968", item.label || ""));
    row.appendChild(cell);
  }
  document.body.appendChild(row);
`;
if (MODE === "combos") {
  const { readFileSync } = await import("node:fs");
  const list = JSON.parse(readFileSync(process.env.LIST, "utf8"));
  await sheet(process.env.NAME || "combos", COMBOS, { size: Number(process.env.SIZE || 190), list });
}

if (MODE === "review" || MODE === "all") {
  const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
  const base = process.env.BASE ? JSON.parse(process.env.BASE) : { skin: 1, hairColor: 4, topColor: 2 };
  await sheet(process.env.NAME || "review", REVIEW, { size: Number(process.env.SIZE || 190), only, base, round: false, thumb: process.env.THUMB === "1" });
}
if (MODE === "parts" || MODE === "all") {
  await sheet("gallery-parts", PARTS, {
    title: "스틱맨 꾸미기 파츠 전체",
    sub: "꾸미기 화면의 썸네일과 같은 모습이에요. 기본 캐릭터(새싹 머리)에 그 파츠만 바꿔 그렸어요.",
    base: {},
  });
}
if (MODE === "presets" || MODE === "all") await sheet("gallery-presets", PRESETS, { size: 150 });
if (MODE === "sizes" || MODE === "all") await sheet("gallery-sizes", SIZES, {});

await browser.close();
console.log("DONE");
