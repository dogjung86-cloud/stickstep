// 사회 Ⅴ 실물 사진 — 실존 지형지물·유적·도시는 발주 대신 위키미디어(fetch-soc4-africa 문법).
//   · 위키백과 문서 lead 이미지 → 허용 썸네일 폭 폴백 → 매직 바이트 검사 → Chrome 캔버스 webp
//     → public/soc/america/<out>.webp. 라이선스·작가 수집 → photos/CREDITS.md 기재용 출력.
//   · 검색 자동 매칭 금지(문서 제목 고정) + 다운로드 후 Read 눈검수 필수(lead가 지도·우주뷰·
//     무관 사진이면 탈락 → 대체 문서 재시도 — Ⅳ 실사고 3건).
//   · 연속 요청 429 백오프: 문서 사이 4초 간격, 429/실패 시 90초 대기 후 1회 재시도(Ⅲ 교훈).
// node qa/fetch-soc5-america.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
mkdirSync("public/soc/america", { recursive: true });
const TARGETS = [
  { article: "Grand_Canyon", out: "grandcanyon", note: "그랜드캐니언 — 콜로라도강의 침식 협곡(미국)" },
  { article: "Niagara_Falls", out: "niagara", note: "나이아가라 폭포 — 미국·캐나다 국경" },
  { article: "Iguazu_Falls", out: "iguazu", note: "이구아수 폭포 — 브라질·아르헨티나 국경" },
  { article: "Rocky_Mountains", out: "rockies", note: "로키산맥 — 북아메리카 서부의 높고 험준한 산맥" },
  { article: "Andes", out: "andes", note: "안데스산맥 — 남아메리카 서부의 높고 험준한 산맥" },
  { article: "Appalachian_Mountains", out: "appalachia", note: "애팔래치아산맥 — 오랜 침식으로 낮고 완만" },
  { article: "Amazon_rainforest", out: "amazon", note: "아마존 열대림 — 세계 최대 열대 우림" },
  { article: "Atacama_Desert", out: "atacama", note: "아타카마 사막 — 남아메리카 태평양 연안의 건조 지역" },
  { article: "Mississippi_River", out: "mississippi", note: "미시시피강 — 북아메리카 대평원을 가로지르는 강" },
  { article: "Quito", out: "quito", note: "키토 — 적도 부근 해발 2,850m의 고산 도시(에콰도르)" },
  { article: "Machu_Picchu", out: "machupicchu", note: "마추픽추 — 잉카 문명의 고산 유적(페루)" },
  { article: "Teotihuacan", out: "teotihuacan", note: "테오티우아칸 — 멕시코의 고대 문명 유적" },
  { article: "Our_Lady_of_Guadalupe", out: "guadalupe", note: "과달루페 성모상 — 문화 혼종성의 사례(멕시코)" },
  { article: "New_York_City", out: "newyork", note: "뉴욕 — 세계 경제의 중심 도시(미국)" },
  { article: "Panama_Canal", out: "panamacanal", note: "파나마 운하 — 태평양과 대서양을 잇는 운하" },
  { article: "Packard_Automotive_Plant", out: "oldfactory", note: "디트로이트의 옛 자동차 공장 — 러스트 벨트" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const credits = [];

async function fetchOne(t) {
  const sum = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t.article}`, { headers: { "User-Agent": UA } })).json();
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
  writeFileSync(`public/soc/america/${t.out}.webp`, webp);
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
