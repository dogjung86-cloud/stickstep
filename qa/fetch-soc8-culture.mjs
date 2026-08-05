// 사회 Ⅷ 실물 사진 — 실존 무형유산(민속춤)·실물 음식은 발주 대신 위키미디어(실물 우선 원칙,
// fetch-soc4-africa 문법). 문서 제목 고정 + 다운로드 후 Read 눈검수 필수(lead가 지도·로고·인물
// 클로즈업이면 탈락 → 대체 문서 재시도). 출처는 photos/CREDITS.md 기재.
// node qa/fetch-soc8-culture.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
mkdirSync("public/soc/culture", { recursive: true });
const TARGETS = [
  { article: "Ganggangsullae", out: "ganggang", note: "강강술래 — 한국 강강술래(유네스코 인류무형유산)" },
  { article: "Tinikling", out: "tinikling", note: "티니클링 — 필리핀 대나무 춤" },
  { article: "Flamenco", out: "flamenco", note: "플라멩코 — 에스파냐(유네스코 인류무형유산)" },
  { article: "Tteokguk", out: "tteokguk", note: "떡국 — 한국 설날 음식" },
  { article: "Buuz", out: "buuz", note: "보쯔 — 몽골 차강사르 찐만두" },
  { article: "B%C3%A1nh_ch%C6%B0ng", out: "banhchung", note: "반쯩 — 베트남 뗏 찹쌀떡" },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const credits = [];

for (const t of TARGETS) {
  try {
    const sum = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t.article}`, { headers: { "User-Agent": UA } })).json();
    const orig = sum.originalimage?.source;
    const thumb = sum.thumbnail?.source;
    if (!orig || !thumb) {
      console.log(`FAIL ${t.article}: 대표 이미지 없음`);
      continue;
    }
    const fileName = decodeURIComponent(orig.split("/").pop().replace(/^\d+px-/, ""));
    let buf = null;
    for (const w of [1280, 1024, 800, 640]) {
      const res = await fetch(thumb.replace(/\/\d+px-/, `/${w}px-`), { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const b = Buffer.from(await res.arrayBuffer());
      if ((b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (b[0] === 0x89 && b[1] === 0x50)) {
        buf = b;
        break;
      }
    }
    if (!buf) {
      console.log(`FAIL ${t.article}: 허용 썸네일 폭에서 이미지 획득 실패`);
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
      return { data: cv.toDataURL("image/webp", 0.88), w, h };
    }, { dataUrl: `data:${mime};base64,${buf.toString("base64")}`, max: 960 });
    const webp = Buffer.from(out.data.split(",")[1], "base64");
    writeFileSync(`public/soc/culture/${t.out}.webp`, webp);
    // 라이선스 정보(커먼즈 파일 메타)
    let lic = "?", artist = "?";
    try {
      const meta = await (await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`,
        { headers: { "User-Agent": UA } },
      )).json();
      const pages = meta?.query?.pages ?? {};
      const info = Object.values(pages)[0]?.imageinfo?.[0]?.extmetadata;
      lic = info?.LicenseShortName?.value ?? "?";
      artist = (info?.Artist?.value ?? "?").replace(/<[^>]+>/g, "").trim().slice(0, 60);
    } catch { /* 메타 실패는 무시 — CREDITS에 수동 보완 */ }
    credits.push(`- soc/culture/${t.out}.webp — ${t.note} | File:${fileName} | ${lic} | ${artist}`);
    console.log(`OK ${t.out}.webp ${out.w}x${out.h} ${Math.round(webp.length / 1024)}KB | ${lic} | ${fileName}`);
  } catch (e) {
    console.log(`FAIL ${t.article}: ${e.message}`);
  }
}
await browser.close();
console.log("\n=== CREDITS.md 추가분 ===");
for (const c of credits) console.log(c);
console.log("DONE");
