// 사회 Ⅵ 위키미디어 3차 수급 — codex 사용량 한도 소진(7/25까지)으로 실사풍 발주가 불가해진
// 3소재의 위키 대체(fetch-soc6-oceania 문법). 실물/현상 사진이라 위키 경로가 오히려 정본.
//   wheatharvest: 밀 수확(기계화 대량 수확 — 두 책 공통 사진 소재) → Combine_harvester
//   beachcleanup: 해변 정화 활동 → Beach_cleanup (lead가 인물 클로즈업이면 눈검수 탈락)
//   artesianbore: 건조 내륙의 풍차 우물(찬정 분지 지하수) → Windpump (호주 windmill 사진 기대)
// node qa/fetch-soc6-retry2.mjs
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { host: "en.wikipedia.org", article: "Combine_harvester", out: "wheatharvest", note: "밀 수확 — 기계화된 대규모 농업" },
  { host: "en.wikipedia.org", article: "Beach_cleanup", out: "beachcleanup", note: "해변 정화 활동 — 개인의 실천" },
  { host: "en.wikipedia.org", article: "Windpump", out: "artesianbore", note: "건조 내륙의 풍차 우물 — 지하수 이용" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const credits = [];

async function fetchOne(t) {
  const sum = await (await fetch(`https://${t.host}/api/rest_v1/page/summary/${encodeURIComponent(t.article)}`, { headers: { "User-Agent": UA } })).json();
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
    if ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b[0] === 0x89 && b[1] === 0x50)) {
      buf = b;
      break;
    }
    await sleep(4000);
  }
  if (!buf) throw new Error("허용 썸네일 폭에서 이미지 획득 실패");
  const mime = buf[0] === 0xff ? "image/jpeg" : "image/png";
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
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { data: cv.toDataURL("image/webp", 0.86), w, h };
  }, { dataUrl: `data:${mime};base64,${buf.toString("base64")}`, max: 960 });
  const webp = Buffer.from(out.data.split(",")[1], "base64");
  writeFileSync(`public/soc/oceania/${t.out}.webp`, webp);
  let license = "?";
  let artist = "?";
  for (const host of ["commons.wikimedia.org", t.host]) {
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
    } catch {
      /* 다음 호스트로 */
    }
  }
  credits.push({ out: `${t.out}.webp`, note: t.note, fileName, license, artist });
  console.log(`OK ${t.out}.webp ${out.w}x${out.h} ${Math.round(webp.length / 1024)}KB — ${fileName} | ${license} | ${artist}`);
}

for (const t of TARGETS) {
  try {
    await fetchOne(t);
  } catch (e) {
    console.log(`RETRY-WAIT ${t.article}: ${e.message} — 90초 후 재시도`);
    await sleep(90000);
    try {
      await fetchOne(t);
    } catch (e2) {
      console.log(`FAIL ${t.article}: ${e2.message}`);
    }
  }
  await sleep(4000);
}

await browser.close();
console.log("\n--- CREDITS.md 기재용 ---");
for (const c of credits) {
  console.log(`| ${c.out} | ${c.note} — Wikimedia Commons "${c.fileName}" (${c.artist}) | ${c.license} |`);
}
