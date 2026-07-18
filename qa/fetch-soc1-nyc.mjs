// 사회 Ⅰ L6 ilovenyc 훅 — 머그 뒷면 "1970년대의 뉴욕"을 손그림 대신 **실물 사진**으로(사용자 확정).
//   정본: DOCUMERICA(미 환경청 기록 사진, 1973) — NARA 548253, Erik Calonius, Public Domain.
//   타임스스퀘어 역의 낙서로 뒤덮인 지하철 차량 — "불황과 낙서"가 작은 크기에서도 즉시 읽힌다.
//   fetch-soc2-religion.mjs 문법: 커먼즈 정본 파일 고정(검색 자동 매칭 금지) → 허용 썸네일 폭 →
//   매직 바이트 검사 → Chrome 캔버스 960px webp → public/soc/figs/nyc1970.webp. 눈검수 필수.
// node qa/fetch-soc1-nyc.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch)";
const FILE = "TIMES SQUARE SUBWAY STATION AND SUBWAY GRAFFITI - NARA - 548253.jpg";

mkdirSync("public/soc/figs", { recursive: true });
const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${FILE}`)}&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1280&format=json`;
const meta = await (await fetch(api, { headers: { "User-Agent": UA } })).json();
const ii = Object.values(meta.query.pages)[0].imageinfo[0];
const em = ii.extmetadata;
console.log("license:", em.LicenseShortName?.value, "| artist:", (em.Artist?.value ?? "").replace(/<[^>]+>/g, "").slice(0, 40));
const res = await fetch(ii.thumburl, { headers: { "User-Agent": UA } });
const buf = Buffer.from(await res.arrayBuffer());
if (!(buf[0] === 0xff && buf[1] === 0xd8)) {
  console.log("FAIL: jpg 아님 —", buf.slice(0, 12).toString("hex"));
  process.exit(1);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const out = await page.evaluate(async ({ dataUrl, max }) => {
  const img = new Image();
  await new Promise((res2, rej) => { img.onload = res2; img.onerror = rej; img.src = dataUrl; });
  const scale = Math.min(1, max / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return { data: cv.toDataURL("image/webp", 0.86), w, h };
}, { dataUrl: `data:image/jpeg;base64,${buf.toString("base64")}`, max: 960 });
await browser.close();
const webp = Buffer.from(out.data.split(",")[1], "base64");
writeFileSync("public/soc/figs/nyc1970.webp", webp);
console.log(`OK nyc1970.webp ${out.w}x${out.h} ${Math.round(webp.length / 1024)}KB — ${FILE}`);
