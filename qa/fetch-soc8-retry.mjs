// 사회 Ⅷ fetch 보완 — 티니클링 재시도(원본 직접 다운) + 라이선스 미확인 2건(파일명 쿼리 제거) 재조회.
// node qa/fetch-soc8-retry.mjs
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";

// ① 티니클링 — summary 원본 이미지를 직접 받는다(썸네일 패턴 실패 폴백)
const sum = await (await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/Tinikling", { headers: { "User-Agent": UA } })).json();
const orig = sum.originalimage?.source;
console.log("tinikling original:", orig);
if (orig) {
  const res = await fetch(orig, { headers: { "User-Agent": UA } });
  if (res.ok) {
    const b = Buffer.from(await res.arrayBuffer());
    const ok = (b[0] === 0xff && b[1] === 0xd8) || (b[0] === 0x89 && b[1] === 0x50);
    console.log("magic ok:", ok, "bytes:", b.length);
    if (ok) {
      const mime = b[0] === 0xff ? "image/jpeg" : "image/png";
      const browser = await chromium.launch({ channel: "chrome", headless: true });
      const page = await browser.newPage();
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
      writeFileSync("public/soc/culture/tinikling.webp", Buffer.from(out.data.split(",")[1], "base64"));
      console.log(`OK tinikling.webp ${out.w}x${out.h}`);
      await browser.close();
    }
  } else console.log("original fetch fail", res.status);
}

// ② 라이선스 재조회 — 파일명에서 쿼리스트링 제거
for (const article of ["Flamenco", "B%C3%A1nh_ch%C6%B0ng", "Tinikling"]) {
  const s = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${article}`, { headers: { "User-Agent": UA } })).json();
  const src = s.originalimage?.source ?? "";
  const fileName = decodeURIComponent(src.split("/").pop().split("?")[0].replace(/^\d+px-/, ""));
  const meta = await (await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`,
    { headers: { "User-Agent": UA } },
  )).json();
  const info = Object.values(meta?.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata;
  const lic = info?.LicenseShortName?.value ?? "?";
  const artist = (info?.Artist?.value ?? "?").replace(/<[^>]+>/g, "").trim().slice(0, 60);
  console.log(`META ${article}: File:${fileName} | ${lic} | ${artist}`);
}
console.log("DONE");
