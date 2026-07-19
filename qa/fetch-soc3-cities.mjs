// 사회 Ⅲ L4 다섯 도시 figTabs + L5 스키장 훅 — 발주 실사풍 대신 **위키미디어 실물 사진**으로
// 교체(2026-07-19 사용자 확정, Ⅱ 종교 4탭 fetch-soc2-religion 문법 계승 + 확장 2종):
//   · article 모드: 위키백과 문서 lead 이미지(REST summary) — 자동 검색 매칭 금지, 문서 제목 고정.
//   · file 모드: 커먼즈 파일명 직지정(Special:Redirect/file) — 훅 줌인/줌아웃처럼 lead 하나로
//     안 되는 경우 카테고리 목록에서 사람이 고른 파일명을 박는다(fetch-nasa 직링크 원칙).
//   · 위키미디어 429 대응: 요청 간 4초 간격 + 실패 시 8초 후 1회 재시도.
// node qa/fetch-soc3-cities.mjs  (app 루트에서) → 눈검수(Read) → CREDITS.md 기재
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { article: "City_of_London", out: "skyline", note: "세계 도시 — 영국 런던 시티(금융지구) 스카이라인" },
  { article: "Canals_of_Amsterdam", out: "canal", note: "생태 도시 — 네덜란드 암스테르담 운하" },
  { article: "Acropolis_of_Athens", out: "ruins", note: "역사·문화 도시 — 그리스 아테네 아크로폴리스" },
  { article: "Strokkur", out: "geyser", note: "관광 도시 — 아이슬란드 스트로퀴르 간헐천" },
  { article: "Sophia_Antipolis", out: "techpark", note: "첨단 도시 — 프랑스 소피아 앙티폴리스" },
  { file: "Grüne Wiesen auf dem Copenhill (51494009835).jpg", out: "copenhill-near", note: "스키장 훅 줌인 — 덴마크 코펜하겐 아마게르 바케(코펜힐) 지붕 슬로프" },
  { file: "COPENHILL.jpg", out: "copenhill-far", note: "스키장 훅 줌아웃 — 아마게르 바케(코펜힐) 전경" },
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
  if (t.article) {
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
  } else {
    fileName = t.file;
    const enc = encodeURIComponent(t.file);
    const res = await fetchWithRetry(`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${enc}&width=1280`);
    if (res.ok) {
      const b = Buffer.from(await res.arrayBuffer());
      if ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b[0] === 0x89 && b[1] === 0x50)) buf = b;
    }
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
