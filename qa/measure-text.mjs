// 글 상자 맞춤 재기: 실제 Pretendard 글꼴로 글을 그려 몇 줄인지, 한 줄 상자에서 넘치는지 잰다.
// 쓰는 법:
//   node qa/measure-text.mjs --kind bv-helper "글 <b>굵게</b>"           (하나)
//   node qa/measure-text.mjs --json items.json                             (여럿: [{id, kind, html, width?}])
// kind(폰 390 기준 실제 앱 CSS를 옮긴 것):
//   bv-helper   랩 도움말: 14px/21, 폭 332, 두 줄 고정(42px, 넘치면 잘림)
//   bv-title    랩 제목: 20px 800, 한 줄(말줄임), 폭 기본 300(진행 점 자리를 뺀 값, --width로 바꿈)
//   bv-qt       랩 판정 질문: 14.5px 700 /21, 폭 338(줄 수만 봄)
//   bv-choice   랩 판정 보기: 14.5px 600, 한 줄(말줄임), 폭 315
//   bv-ans      오답 카드의 정답 글: 14.5px 700, 한 줄(말줄임), 폭 270
//   bv-why      판정 이유: 13px /1.45, 폭 236(다음 버튼 옆)
//   bv-btn      랩 버튼: 15px 800, 폭 기본 346(두 칸이면 --width 169), 줄 수
//   bv-card-b   조건 카드 제목: 14px 800 한 줄(nowrap), 폭 --width 필요
//   bv-card-i   조건 카드 보조: 11.5px 600 한 줄(nowrap), 폭 --width 필요
//   bv-pill     무대 알약: 12.5px 700 한 줄, 폭은 결과로 알려 줌(무대 346 안)
//   opn-title   도입 제목: 21px 800 /30, 폭 346, 줄 수
//   opn-bubble  도입 쌤의 말: 14px /20, 폭 278, 줄 수(두 줄 안쪽이 규칙)
//   hook-q      도입 예측 질문: 14.5px 700 /21, 폭 346
//   hook-choice 도입 예측 보기: 14.5px /1.35, 폭 318
//   custom      --font 14 --weight 700 --lh 20 --width 200 --nowrap
import { chromium } from "playwright-core";
import fs from "node:fs";

const KINDS = {
  "bv-helper": { fs: 14, w: 400, lh: 21, width: 332, maxLines: 2 },
  "bv-title": { fs: 20, w: 800, lh: 30, width: 300, nowrap: true, ls: "-.03em" },
  "bv-qt": { fs: 14.5, w: 700, lh: 21, width: 338, maxLines: 2 },
  "bv-choice": { fs: 14.5, w: 600, lh: 20, width: 315, nowrap: true },
  "bv-ans": { fs: 14.5, w: 700, lh: 20, width: 270, nowrap: true },
  "bv-why": { fs: 13, w: 400, lh: 18.85, width: 236, maxLines: 3 },
  "bv-btn": { fs: 15, w: 800, lh: 18, width: 346, maxLines: 2, pad: 16 },
  "bv-card-b": { fs: 14, w: 800, lh: 17.5, width: 100, nowrap: true },
  "bv-card-i": { fs: 11.5, w: 600, lh: 15, width: 100, nowrap: true },
  "bv-pill": { fs: 12.5, w: 700, lh: 26, width: 9999, nowrap: true },
  "opn-title": { fs: 21, w: 800, lh: 30, width: 346, ls: "-.03em", maxLines: 2 },
  "opn-bubble": { fs: 14, w: 400, lh: 20, width: 278, maxLines: 2 },
  "hook-q": { fs: 14.5, w: 700, lh: 21, width: 346, maxLines: 2 },
  "hook-choice": { fs: 14.5, w: 400, lh: 19.6, width: 318, maxLines: 2 },
};

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf("--" + k);
  return i >= 0 ? args[i + 1] : d;
};
let items = [];
if (opt("json")) items = JSON.parse(fs.readFileSync(opt("json"), "utf8"));
else {
  const kind = opt("kind", "custom");
  const html = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--"))).join(" ");
  const base = KINDS[kind] ?? {};
  const spec = {
    ...base,
    ...(opt("width") ? { width: +opt("width") } : {}),
    ...(opt("font") ? { fs: +opt("font") } : {}),
    ...(opt("weight") ? { w: +opt("weight") } : {}),
    ...(opt("lh") ? { lh: +opt("lh") } : {}),
    ...(args.includes("--nowrap") ? { nowrap: true } : {}),
  };
  items = [{ id: "1", kind, html, spec }];
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable-dynamic-subset.min.css" />
<style>body{margin:0;font-family:'Pretendard Variable',Pretendard,sans-serif;letter-spacing:-.012em;-webkit-font-smoothing:antialiased} .box{position:absolute;left:0;top:0;word-break:keep-all} b{font-weight:700}</style></head><body><div id="root"></div></body></html>`);
await page.waitForFunction(() => document.fonts && document.fonts.status === "loaded").catch(() => {});
// 글꼴이 실제로 내려오도록 한글을 한 번 그려 둔다
await page.evaluate(async () => {
  const d = document.createElement("div");
  d.textContent = "가나다라마바사 아자차카타파하 0123 ABC 가열하기 예측 완료";
  d.style.fontWeight = "800";
  document.body.appendChild(d);
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 400));
  await document.fonts.ready;
});
const out = await page.evaluate(
  ({ items, KINDS }) => {
    const root = document.getElementById("root");
    return items.map((it) => {
      const s = { ...(KINDS[it.kind] ?? {}), ...(it.spec ?? {}), ...(it.width ? { width: it.width } : {}) };
      const d = document.createElement("div");
      d.className = "box";
      d.style.fontSize = s.fs + "px";
      d.style.fontWeight = String(s.w ?? 400);
      d.style.lineHeight = s.lh + "px";
      if (s.ls) d.style.letterSpacing = s.ls;
      d.style.width = s.nowrap ? "auto" : s.width - (s.pad ?? 0) + "px";
      if (s.nowrap) d.style.whiteSpace = "nowrap";
      d.innerHTML = it.html;
      root.appendChild(d);
      const r = d.getBoundingClientRect();
      const lines = Math.round(r.height / s.lh);
      const textW = s.nowrap ? Math.ceil(r.width) : null;
      d.remove();
      const over = s.nowrap ? textW > s.width : s.maxLines ? lines > s.maxLines : false;
      return { id: it.id, kind: it.kind, lines, textW, limit: s.nowrap ? s.width : s.maxLines, over, text: d.textContent.slice(0, 80) };
    });
  },
  { items, KINDS },
);
const fontOk = await page.evaluate(() => document.fonts.check("16px 'Pretendard Variable'"));
await browser.close();
if (!fontOk) console.error("경고: Pretendard 글꼴을 못 불러왔어요(네트워크). 결과가 실제와 다를 수 있어요.");
if (opt("json")) {
  const outFile = opt("out");
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
  const overs = out.filter((o) => o.over);
  console.log(`재기 ${out.length}개, 넘침 ${overs.length}개`);
  for (const o of overs.slice(0, 400)) console.log(`  [${o.id}] ${o.kind} ${o.textW != null ? o.textW + "px > " + o.limit + "px" : o.lines + "줄 > " + o.limit + "줄"} :: ${o.text}`);
} else {
  for (const o of out) console.log(JSON.stringify(o));
}
