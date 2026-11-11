// 배선 전 개념 컷 미리보기: 단원 파일(scenes/cuts/cuts-uN.mjs)의 그림을 폰 화면(390px)의 개념 카드 모양으로 찍는다.
// 실행: node qa/sketch/mock-cuts.mjs cuts/cuts-u2 [출력 PNG] [--compare] [--only=u2l1,u2l2]
//   --compare: 원본 발주 그림(public/<테마>/cuts/<컷>.webp, 없으면 재제작 브랜치의 같은 경로)을 왼쪽에 나란히 둔다.
//   단원 파일 형식: export function cuts() { return [{ name, theme, sk, cap, alt }] }
//   카드 모양은 앱의 개념 블록(ui.css 의 .c-figure)과 cut() 의 이미지 모서리(12px)를 그대로 따른다.
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
// 정본(main)에 없는 테마의 원본이 사는 브랜치
const ORIG_BRANCH = { heat3: "sci-u3-v3", matter3: "sci-u4-v3" };

function original(theme, name) {
  const rel = `public/${theme}/cuts/${name}.webp`;
  const f = join(ROOT, rel);
  try {
    const buf = existsSync(f) ? readFileSync(f) : ORIG_BRANCH[theme] ? execFileSync("git", ["-C", ROOT, "show", `${ORIG_BRANCH[theme]}:${rel}`], { maxBuffer: 1 << 26 }) : null;
    return buf ? `data:image/webp;base64,${buf.toString("base64")}` : null;
  } catch { return null; }
}

export async function mockCuts(modPath, out, o = {}) {
  const mod = await import(pathToFileURL(resolve(HERE, "scenes", modPath.endsWith(".mjs") ? modPath : modPath + ".mjs")).href + "?" + Date.now());
  let list = mod.cuts();
  if (o.only) list = list.filter(c => o.only.includes(c.name));
  const svgUri = s => "data:image/svg+xml;base64," + Buffer.from(s).toString("base64");
  const card = (src, cap, label) => `<div class="cell"><div class="lab">${label}</div><div class="c-figure"><div class="c-figure-art"><img src="${src}"></div><div class="c-figure-cap">${cap}</div></div></div>`;
  const cells = [];
  for (const c of list) {
    if (o.compare) {
      const org = original(c.theme, c.name);
      cells.push(org ? card(org, c.cap, `${c.name} 원본`) : `<div class="cell"><div class="lab">${c.name} 원본 없음</div></div>`);
    }
    cells.push(card(svgUri(c.sk.svg()), c.cap, o.compare ? `${c.name} 새 그림` : c.name));
  }
  const cols = o.cols ?? (o.compare ? 4 : 3);
  const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable-dynamic-subset.min.css"><style>
    body{margin:0;background:#E9ECEF;font-family:"Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif;letter-spacing:-.012em}
    .grid{display:grid;grid-template-columns:repeat(${cols},390px);gap:18px;padding:20px;align-items:start}
    .cell{width:390px;background:#fff;border-radius:22px;padding:8px 22px 18px;box-sizing:border-box;box-shadow:0 2px 12px rgba(0,0,0,.08)}
    .lab{font-size:13px;font-weight:800;color:#4E5968;padding:6px 0 0}
    .c-figure{margin-top:10px;border-radius:20px;overflow:hidden;border:1px solid #E5E8EB;background:#fff}
    .c-figure-art{padding:16px}.c-figure-art img{display:block;width:100%;border-radius:12px}
    .c-figure-cap{padding:10px 14px;font-size:12.5px;color:#8B95A1;border-top:1px solid #F2F4F6;text-align:center;word-break:keep-all}
  </style><div class="grid">${cells.join("")}</div>`;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: cols * 408 + 22, height: 900 }, deviceScaleFactor: o.dpr ?? 2 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const outPath = out ?? join(ROOT, "qa", "shots", `mock-${modPath.replace(/[\\/]/g, "-")}.png`);
  mkdirSync(dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  return outPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const pos = args.filter(a => !a.startsWith("--"));
  const only = args.find(a => a.startsWith("--only="))?.slice(7).split(",");
  if (!pos[0]) { console.log("쓰는 법: node qa/sketch/mock-cuts.mjs cuts/cuts-u2 [출력 PNG] [--compare] [--only=u2l1,u2l2]"); process.exit(1); }
  console.log(await mockCuts(pos[0], pos[1], { compare: args.includes("--compare"), only, dpr: args.includes("--dpr1") ? 1 : 2 }));
}
