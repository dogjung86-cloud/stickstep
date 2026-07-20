// 사회 Ⅲ L5 스키장 훅 v2(2026-07-20 사용자 피드백 재설계) — 사진 3장 수급.
// 구 훅의 결함: ① "도시 한복판 초록 언덕"은 미스터리가 성립하지 않음(도시에 언덕은 흔함 —
// near 사진이 사람도 스키도 없는 맨 풀언덕) ② 구도가 다른 두 사진의 스왑을 '줌 아웃'이라 불러 어색.
// v2 = 단서 축적 3박자: 초록 매트 스키장(mat) → 꼭대기 굴뚝+공장 조망(peak) → 항공 사진 위
// **진짜 CSS 줌 아웃**(aerial, scale 2.6→1 카메라 풀백)으로 "언덕 = 건물 지붕" 공개.
// 후보 눈검수 기록: 커먼즈 Amager Bakke 카테고리 47장 전수 — 슬로프 위 인물 스키 컷은 없음.
//   채택: Copenhill top 3(초록 매트+리프트 휠, 배경 중립) · COPENHILL 8(꼭대기 쉼터+굴뚝+항구,
//   인물은 원경 1명 뒷모습이라 관례 부합) · Amager Bakke (aerial view)(초록 지붕 띠+김 나는 굴뚝+항구).
//   탈락: Power plant with ski slope 01~05(전부 외관 원경 — 슬로프 디테일 없음), Copenhill 2(외벽
//   클로즈업), 구 near(맨 풀언덕 — 미스터리 불성립)·구 far(줌 관계 없는 측면 구도) → 파일 삭제.
// node qa/fetch-soc3-skislope.mjs  (app 루트에서) → 눈검수(Read) → CREDITS.md 기재
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { file: "Copenhill top 3.jpg", out: "copenhill-mat", max: 960, note: "훅 1박자 — 여름 슬로프의 초록 스키 매트와 리프트" },
  { file: "COPENHILL 8.jpg", out: "copenhill-peak", max: 960, note: "훅 2박자 — 꼭대기 쉼터, 거대한 굴뚝과 발밑 공장·항구" },
  { file: "Amager Bakke (aerial view).jpg", out: "copenhill-aerial", max: 1280, note: "훅 3박자 — 항공 전경(줌 아웃 원본이라 1280 유지)" },
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
  const enc = encodeURIComponent(t.file);
  const res = await fetchWithRetry(`https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${enc}&width=${t.max}`);
  if (res.ok) {
    const b = Buffer.from(await res.arrayBuffer());
    if ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b[0] === 0x89 && b[1] === 0x50)) buf = b;
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
  }, { dataUrl: `data:${mime};base64,${buf.toString("base64")}`, max: t.max });
  const webp = Buffer.from(out.data.split(",")[1], "base64");
  writeFileSync(`public/soc/europe/${t.out}.webp`, webp);
  let license = "?";
  let artist = "?";
  try {
    const meta = await (await fetchWithRetry(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${t.file}`)}&prop=imageinfo&iiprop=extmetadata&format=json`,
    )).json();
    const pg = Object.values(meta.query?.pages ?? {})[0];
    const info = pg?.imageinfo?.[0]?.extmetadata ?? {};
    if (info.LicenseShortName?.value) {
      license = info.LicenseShortName.value;
      artist = (info.Artist?.value ?? "?").replace(/<[^>]+>/g, "").trim().slice(0, 60);
    }
  } catch {
    /* 크레딧 조회 실패 시 수동 확인 */
  }
  credits.push({ out: `${t.out}.webp`, note: t.note, fileName: t.file, license, artist });
  console.log(`OK ${t.out}.webp ${out.w}x${out.h} ${Math.round(webp.length / 1024)}KB — ${t.file} | ${license} | ${artist}`);
}

await browser.close();
console.log("\n--- CREDITS.md 기재용 ---");
for (const c of credits) {
  console.log(`| ${c.out} | ${c.note} — Wikimedia Commons "${c.fileName}" (${c.artist}) | ${c.license} |`);
}
