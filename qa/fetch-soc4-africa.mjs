// 사회 Ⅳ 실물 사진 — 실존 지형지물·유적·문화 실물은 발주 대신 위키미디어(fetch-soc2-religion 문법).
//   · 위키백과 문서 lead 이미지 → 허용 썸네일 폭 폴백 → 매직 바이트 검사 → Chrome 캔버스 webp
//     → public/soc/africa/<out>.webp. 라이선스·작가 수집 → photos/CREDITS.md 기재용 출력.
//   · 검색 자동 매칭 금지(문서 제목 고정) + 다운로드 후 Read 눈검수 필수(lead가 지도·로고면 탈락).
// node qa/fetch-soc4-africa.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
mkdirSync("public/soc/africa", { recursive: true });
const TARGETS = [
  { article: "Giza_pyramid_complex", out: "pyramids", note: "기자 피라미드 — 북부 아프리카 문명(이집트)" },
  { article: "Mount_Kilimanjaro", out: "kilimanjaro", note: "킬리만자로산 — 아프리카 최고봉(화산)" },
  { article: "Victoria_Falls", out: "vicfalls", note: "빅토리아(모시 오아 툰야) 폭포 — 잠베지강" },
  { article: "Nile", out: "nile", note: "나일강 — 아프리카에서 가장 긴 하천" },
  { article: "Sahara", out: "sahara", note: "사하라 사막 — 세계 최대 사막" },
  { article: "Great_Rift_Valley,_Kenya", out: "riftvalley", note: "동아프리카 지구대(케냐 구간)" },
  { article: "Serengeti", out: "savanna", note: "세렝게티 초원 — 사바나·야생 동물" },
  { article: "Congo_Basin", out: "rainforest", note: "콩고 분지 열대 우림" },
  { article: "Great_Mosque_of_Djenn%C3%A9", out: "djenne", note: "젠네 모스크 — 진흙 벽돌 세계 최대 건축물(말리)" },
  { article: "Djembe", out: "djembe", note: "젬베 — 서아프리카 전통 북" },
  { article: "Kalimba", out: "kalimba", note: "칼림바 — 아프리카 전통 악기" },
  { article: "Nollywood", out: "nollywood", note: "놀리우드 — 나이지리아 영화 산업" },
  { article: "Nairobi", out: "nairobi", note: "나이로비 — 케냐 수도(IT 산업·고층 건물)" },
  { article: "Adansonia_digitata", out: "baobab", note: "바오바브나무 — 사바나의 상징" },
  { article: "Great_Green_Wall", out: "greatwall", note: "그레이트 그린 월 프로젝트" },
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
      return { data: cv.toDataURL("image/webp", 0.86), w, h };
    }, { dataUrl: `data:${mime};base64,${buf.toString("base64")}`, max: 960 });
    const webp = Buffer.from(out.data.split(",")[1], "base64");
    writeFileSync(`public/soc/africa/${t.out}.webp`, webp);
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
      } catch {
        /* 다음 호스트로 */
      }
    }
    credits.push({ out: `${t.out}.webp`, note: t.note, fileName, license, artist });
    console.log(`OK ${t.out}.webp ${out.w}x${out.h} ${Math.round(webp.length / 1024)}KB — ${fileName} | ${license} | ${artist}`);
  } catch (e) {
    console.log(`FAIL ${t.article}: ${e.message}`);
  }
}

await browser.close();
console.log("\n--- CREDITS.md 기재용 ---");
for (const c of credits) {
  console.log(`| ${c.out} | ${c.note} — Wikimedia Commons "${c.fileName}" (${c.artist}) | ${c.license} |`);
}
