// 사회 Ⅱ L3 종교 문화경관 — 발주 실사풍 대신 **위키미디어 실물 사진**으로 교체(사용자 확정).
//   · 위키백과 문서의 대표(lead) 이미지를 쓴다: REST summary → originalimage → 커먼즈 파일명
//     → thumb.php(w=1400)로 웹 크기 다운로드(수십 MB 원본 회피) → 매직 바이트 검사 →
//     Chrome 캔버스로 webp 변환(process-star 문법) → public/soc/asia/<out>.webp 교체.
//   · 라이선스·작가는 커먼즈 extmetadata에서 수집해 출력 — photos/CREDITS.md에 기재한다.
//   · fetch-nasa-star 교훈 계승: 검색 자동 매칭 금지(문서 제목 고정), 다운로드 후 Read 눈검수 필수.
// node qa/fetch-soc2-religion.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
const TARGETS = [
  { article: "Shwedagon_Pagoda", out: "temple-sea", note: "불교 — 미얀마 양곤 쉐다곤 파고다" },
  // Meenakshi_Temple 문서 lead는 도시 조감 파노라마라 부적합(눈검수 탈락) — Gopuram 문서
  // lead(스리랑감 랑가나타스와미 사원 고푸람)가 문탑 그 자체라 정본.
  { article: "Gopuram", out: "gopuram", note: "힌두교 — 인도 스리랑감 랑가나타스와미 사원 고푸람" },
  { article: "Sheikh_Zayed_Mosque", out: "mosque", note: "이슬람교 — 아랍에미리트 아부다비 셰이크 자이드 모스크" },
  { article: "Manila_Cathedral", out: "cathedral", note: "크리스트교 — 필리핀 마닐라 대성당" },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const credits = [];

for (const t of TARGETS) {
  const sum = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t.article}`, { headers: { "User-Agent": UA } })).json();
  const orig = sum.originalimage?.source;
  const thumb = sum.thumbnail?.source;
  if (!orig || !thumb) {
    console.log(`FAIL ${t.article}: 대표 이미지 없음`);
    continue;
  }
  const fileName = decodeURIComponent(orig.split("/").pop().replace(/^\d+px-/, ""));
  // 웹 크기 썸네일로 다운로드 — REST가 준 thumb URL의 폭만 치환. 위키미디어는 썸네일 폭을
  // **표준 사이즈로 제한**(400 "Use thumbnail sizes listed…" 실사고) → 허용 폭 폴백 순회.
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
  const magicOk = buf[0] === 0xff; // jpg면 true, 아니면 png
  // Chrome 캔버스 → webp(최대폭 960, soc/asia 관례)
  const mime = magicOk ? "image/jpeg" : "image/png";
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
  writeFileSync(`public/soc/asia/${t.out}.webp`, webp);
  // 라이선스·작가 — 커먼즈 우선, 없으면 en.wiki 로컬 파일 폴백(셰이크 자이드 실사고)
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

await browser.close();
console.log("\n--- CREDITS.md 기재용 ---");
for (const c of credits) {
  console.log(`| ${c.out} | ${c.note} — Wikimedia Commons "${c.fileName}" (${c.artist}) | ${c.license} |`);
}
