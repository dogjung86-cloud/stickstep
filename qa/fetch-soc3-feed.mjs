// 사회 Ⅲ L4 도시 SNS 피드 훅 — 손그림 SVG 3장을 위키미디어 실물 사진으로 교체
// (2026-07-20 사용자 피드백 "SVG 퀄리티가 너무 낮음 — 실제 사진으로 대체", L5 코펜힐·figTabs 계보).
// figTabs 5탭(런던·암스테르담·아테네·아이슬란드·소피아 앙티폴리스)과 겹치지 않는 도시로 —
// 세계=프랑크푸르트/라데팡스 후보, 역사=로마 콜로세움, 생태=프라이부르크 보봉/슐리어베르크 후보.
// 후보를 넉넉히 받아 눈검수(Read)로 3장 확정, 탈락분은 삭제 + 사유를 아래 주석에 기록.
// node qa/fetch-soc3-feed.mjs  (app 루트에서) → 눈검수 → CREDITS.md 기재
// 확정 3장(2026-07-20 눈검수): feed-world = 라데팡스(개선문 방향에서 — 파리 시가 너머 유리 빌딩 숲),
// feed-hist = 콜로세움(아치·돌기둥 정면 전경), feed-eco = 슐리어베르크(지붕 가득 태양광+색색 벽).
// 탈락 기록(재수급 시 같은 함정 방지): Bankenviertel lead = OSM 지도 PNG(사진 아님 — lead 지도류
// 탈락 유형), Vauban,_Freiburg lead = 잔뜩 흐린 하늘에 태양광 판독 약함(슐리어베르크가 채광·판독 우위).
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { article: "La_Défense", out: "feed-world", note: "피드 훅 세계 도시 — 프랑스 파리 라데팡스" },
  { article: "Colosseum", out: "feed-hist", note: "피드 훅 역사·문화 도시 — 이탈리아 로마 콜로세움" },
  { article: "Solar_Settlement_at_Schlierberg", out: "feed-eco", note: "피드 훅 생태 도시 — 프라이부르크 슐리어베르크 태양광 단지" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchWithRetry(url) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429) {
      await sleep(8000);
      continue;
    }
    return res;
  }
  return fetch(url, { headers: { "User-Agent": UA } });
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const credits = [];

for (const t of TARGETS) {
  await sleep(4000);
  let buf = null;
  let fileName = "";
  const sum = await (await fetchWithRetry(`https://en.wikipedia.org/api/rest_v1/page/summary/${t.article}`)).json();
  const orig = sum.originalimage?.source;
  const thumb = sum.thumbnail?.source;
  if (!orig || !thumb) {
    console.log(`FAIL ${t.article}: 대표 이미지 없음`);
    continue;
  }
  fileName = decodeURIComponent(orig.split("/").pop().replace(/^\d+px-/, ""));
  for (const w of [1280, 1024, 800, 640]) {
    const res = await fetchWithRetry(thumb.replace(/\/\d+px-/, `/${w}px-`));
    if (!res.ok) continue;
    const b = Buffer.from(await res.arrayBuffer());
    if ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b[0] === 0x89 && b[1] === 0x50)) {
      buf = b;
      break;
    }
    await sleep(2500);
  }
  if (!buf) {
    console.log(`FAIL ${t.out}: 이미지 획득 실패`);
    continue;
  }
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
  writeFileSync(`public/soc/europe/${t.out}.webp`, webp);
  let license = "?";
  let artist = "?";
  for (const host of ["commons.wikimedia.org", "en.wikipedia.org"]) {
    try {
      const meta = await (await fetchWithRetry(
        `https://${host}/w/api.php?action=query&titles=${encodeURIComponent(`File:${fileName}`)}&prop=imageinfo&iiprop=extmetadata&format=json`,
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

await browser.close();
console.log("\n--- CREDITS.md 기재용 ---");
for (const c of credits) {
  console.log(`| ${c.out} | ${c.note} — Wikimedia Commons "${c.fileName}" (${c.artist}) | ${c.license} |`);
}
