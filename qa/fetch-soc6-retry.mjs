// 사회 Ⅵ 위키미디어 재수급 — 1차 눈검수 탈락분의 대체 문서 재시도(fetch-soc6-oceania 문법).
// 탈락 사유 기록(재수급 시 같은 함정 방지):
//   greatbarrier: Great_Barrier_Reef lead = ISS 우주뷰 → Coral_reef(lead가 플린 리프 — GBR 수중 사진)
//   funafuti: Funafuti lead = 피지 항공기 사진(로고 텍스트) → Fongafale(본섬 항공뷰 기대)
//   kiwifruit: Kiwifruit lead = 품종 학술 도판(글자 라벨) → Kiwifruit_industry_in_New_Zealand
//   araon: en lead = 부두 단체 기념사진(식별 인물) → ko.wikipedia 아라온호
//   sejong: en 문서 lead 없음 → ko.wikipedia 세종_과학_기지
//   (artesian = 지도 → 위키 포기, codex P 발주(artesianbore) / kangaroo = 동물원 배경+GFDL → 폐기)
// node qa/fetch-soc6-retry.mjs
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { host: "en.wikipedia.org", article: "Coral_reef", out: "greatbarrier", note: "대보초의 산호초(플린 리프) — 오스트레일리아 북동부" },
  { host: "en.wikipedia.org", article: "Fongafale", out: "funafuti", note: "푸나푸티(폰가팔레섬) — 투발루의 낮은 산호섬" },
  { host: "en.wikipedia.org", article: "Kiwifruit_industry_in_New_Zealand", out: "kiwifruit", note: "키위 재배 — 뉴질랜드 온대 기후의 과일" },
  { host: "ko.wikipedia.org", article: "아라온호", out: "araon", note: "쇄빙 연구선 아라온호 — 우리나라의 극지 연구" },
  { host: "ko.wikipedia.org", article: "세종_과학_기지", out: "sejong", note: "세종 과학 기지 — 우리나라의 남극 기지" },
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
