// g2u2 v2 확대분 신규 실사 3장 — 위키미디어 수급(fetch-soc5-america 문법).
//   · 문서 제목 고정(검색 자동 매칭 금지) + 후보 체인(lead가 무관 사진이면 다음 문서) + 매직 바이트
//   · Chrome 캔버스 webp 변환(정사각 crop 아님 — process-geo가 SQUARE_DIRS 정사각화하므로 원본 저장 후 변환)
//   · 라이선스·작가 수집 → photos/CREDITS.md 기재용 출력 · 다운로드 후 Read 눈검수 필수
// node qa/fetch-g2u2-photos.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { chain: ["Sedimentary_rock", "Stratum", "Flysch"], out: "strata-tilt", note: "겹겹이 쌓인 층리 절벽(층리 제2벌)" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const credits = [];

async function fetchArticle(article, out, note) {
  const sum = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${article}`, { headers: { "User-Agent": UA } })).json();
  const orig = sum.originalimage?.source;
  const thumb = sum.thumbnail?.source;
  if (!orig || !thumb) throw new Error("대표 이미지 없음");
  const fileName = decodeURIComponent(orig.split("/").pop().replace(/^\d+px-/, ""));
  let buf = null;
  for (const w of [1280, 1024, 800, 640]) {
    const res = await fetch(thumb.replace(/\/\d+px-/, `/${w}px-`), { headers: { "User-Agent": UA } });
    if (res.status === 429) throw new Error("429");
    if (!res.ok) continue;
    const b = Buffer.from(await res.arrayBuffer());
    if ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b[0] === 0x89 && b[1] === 0x50)) { buf = b; break; }
    await sleep(3000);
  }
  if (!buf) throw new Error("허용 썸네일 폭에서 이미지 획득 실패");
  const mime = buf[0] === 0xff ? "image/jpeg" : "image/png";
  const outData = await page.evaluate(async ({ dataUrl, max }) => {
    const img = new Image();
    await new Promise((res2, rej) => { img.onload = res2; img.onerror = rej; img.src = dataUrl; });
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
    return { data: cv.toDataURL("image/webp", 0.87), w, h };
  }, { dataUrl: `data:${mime};base64,${buf.toString("base64")}`, max: 1024 });
  const webp = Buffer.from(outData.data.split(",")[1], "base64");
  writeFileSync(`public/exam/g2u2/${out}.webp`, webp);
  let license = "?";
  let artist = "?";
  for (const host of ["commons.wikimedia.org", "en.wikipedia.org"]) {
    try {
      const meta = await (await fetch(
        `https://${host}/w/api.php?action=query&titles=${encodeURIComponent(`File:${fileName}`)}&prop=imageinfo&iiprop=extmetadata&format=json`,
        { headers: { "User-Agent": UA } },
      )).json();
      const pg = Object.values(meta.query?.pages ?? {})[0];
      if (pg?.missing !== undefined) continue;
      const info = pg?.imageinfo?.[0]?.extmetadata ?? {};
      if (info.LicenseShortName?.value) {
        license = info.LicenseShortName.value;
        artist = (info.Artist?.value ?? "?").replace(/<[^>]+>/g, "").trim().slice(0, 60);
        break;
      }
    } catch { /* 다음 호스트 */ }
  }
  credits.push({ out: `${out}.webp`, note, fileName, license, artist });
  console.log(`OK ${out}.webp ${outData.w}x${outData.h} ${Math.round(webp.length / 1024)}KB — ${fileName} | ${license} | ${artist} (문서 ${article})`);
}

for (const t of TARGETS) {
  let done = false;
  for (const article of t.chain) {
    try {
      await fetchArticle(article, t.out, t.note);
      done = true;
      break;
    } catch (e) {
      console.log(`MISS ${article}: ${e.message} — 다음 후보`);
      await sleep(4000);
    }
  }
  if (!done) console.log(`FAIL ${t.out}: 후보 전멸 — codex 발주 폴백 대상`);
  await sleep(4000);
}

await browser.close();
console.log("\n--- photos/CREDITS.md 기재용 ---");
for (const c of credits) console.log(`| exam/g2u2/${c.out} | ${c.note} — Wikimedia "${c.fileName}" (${c.artist}) | ${c.license} |`);
