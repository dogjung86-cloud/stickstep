// SVG나 HTML을 헤드리스 크롬으로 PNG 로 찍는 도우미 (눈검수와 비교 자료용).
import { chromium } from "playwright-core";

let browser = null;
export async function open() {
  if (!browser) browser = await chromium.launch({ channel: "chrome", headless: true });
  return browser;
}
export async function close() { if (browser) { await browser.close(); browser = null; } }

// html 문자열을 w×h 뷰포트에 띄워 out 으로 저장한다
export async function shotHtml(html, out, w, h, scale = 1) {
  const b = await open();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: out });
  await ctx.close();
}

// SVG 여러 장을 격자로 놓은 시트
export async function sheet(items, out, o = {}) {
  const cols = o.cols ?? 3, cw = o.cw ?? 480, ch = o.ch ?? 360, gap = o.gap ?? 16, bg = o.bg ?? "#fff";
  const rows = Math.ceil(items.length / cols);
  const W = cols * cw + (cols + 1) * gap, H = rows * (ch + (o.label ? 26 : 0)) + (rows + 1) * gap;
  const cells = items.map(it => `<div class="c"><div class="f">${it.svg}</div>${o.label ? `<div class="l">${it.label ?? ""}</div>` : ""}</div>`).join("");
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:${bg};font:14px/1.2 "Malgun Gothic",sans-serif;color:#555}
    .g{display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:${gap}px;padding:${gap}px}
    .f{width:${cw}px;height:${ch}px;background:#fff;border:1px solid #e3e5e8;border-radius:10px;overflow:hidden;display:grid;place-items:center}
    .f svg{width:100%;height:100%}
    .l{height:26px;display:grid;place-items:center}
  </style><div class="g">${cells}</div>`;
  await shotHtml(html, out, W, H, o.scale ?? 1);
}
