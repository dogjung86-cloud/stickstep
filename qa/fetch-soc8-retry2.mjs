// 사회 Ⅷ fetch 보완 2 — 커먼즈 파일 직접 지정 다운로드(티니클링 스틸·플라멩코 군무/원경 후보).
// 여러 후보를 받아 두고 Read 눈검수로 최종 1장을 고른다(식별 인물 독사진 탈락 가드).
// node qa/fetch-soc8-retry2.mjs
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const FILES = [
  { file: "Tinikling folk dance.jpg", out: "tinikling-a" },
  { file: "Tinikling sa Plaza.jpg", out: "tinikling-b" },
  { file: "Flamenco, Madrid, clapping.jpg", out: "flamenco-a" },
  { file: "Sevilla flamenco 19496136099 3e8d453006 o.jpg", out: "flamenco-b" },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

for (const t of FILES) {
  try {
    const meta = await (await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(t.file)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1024&format=json&origin=*`,
      { headers: { "User-Agent": UA } },
    )).json();
    const info = Object.values(meta?.query?.pages ?? {})[0]?.imageinfo?.[0];
    if (!info) { console.log(`FAIL ${t.file}: 메타 없음`); continue; }
    const url = info.thumburl ?? info.url;
    const lic = info.extmetadata?.LicenseShortName?.value ?? "?";
    const artist = (info.extmetadata?.Artist?.value ?? "?").replace(/<[^>]+>/g, "").trim().slice(0, 60);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const b = Buffer.from(await res.arrayBuffer());
    if (!((b[0] === 0xff && b[1] === 0xd8) || (b[0] === 0x89 && b[1] === 0x50))) { console.log(`FAIL ${t.file}: 매직 바이트`); continue; }
    const mime = b[0] === 0xff ? "image/jpeg" : "image/png";
    const out = await page.evaluate(async ({ dataUrl, max }) => {
      const img = new Image();
      await new Promise((r2, rj) => { img.onload = r2; img.onerror = rj; img.src = dataUrl; });
      const scale = Math.min(1, max / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      return { data: cv.toDataURL("image/webp", 0.88), w, h };
    }, { dataUrl: `data:${mime};base64,${b.toString("base64")}`, max: 960 });
    writeFileSync(`public/soc/culture/${t.out}.webp`, Buffer.from(out.data.split(",")[1], "base64"));
    console.log(`OK ${t.out}.webp ${out.w}x${out.h} | ${lic} | ${artist} | File:${t.file}`);
  } catch (e) {
    console.log(`FAIL ${t.file}: ${e.message}`);
  }
}
await browser.close();
console.log("DONE");
