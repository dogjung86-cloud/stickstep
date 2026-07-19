// 사회 Ⅵ 실물 사진 — 실존 지형지물·유적·실물·동물은 발주 대신 위키미디어(fetch-soc5-america 문법).
//   · 위키백과 문서 lead 이미지 → 허용 썸네일 폭 폴백 → 매직 바이트 검사 → Chrome 캔버스 webp
//     → public/soc/oceania/<out>.webp. 라이선스·작가 수집 → photos/CREDITS.md 기재용 출력.
//   · 검색 자동 매칭 금지(문서 제목 고정) + 다운로드 후 Read 눈검수 필수(lead가 지도·우주뷰·
//     위성뷰·무관 사진이면 탈락 → 대체 문서 재시도 — Ⅳ 3건·Ⅴ 3건 선례).
//     탈락 위험 메모: Great_Barrier_Reef(위성뷰 위험 → 대체 Heart_Reef·Coral_reef),
//     Great_Pacific_garbage_patch(모델 지도 위험 → Marine_debris로 대신), Tuvalu(지도 위험 →
//     Funafuti 환초 사진), Kiribati(지도 위험 → South_Tarawa).
//   · 세종·장보고 기지는 위키미디어 경로(파일 라이선스 명시)로 — 극지연구소 원본은 공공누리
//     유형 개별 확인이 필요해 위키 파일이 더 안전(불명이면 눈검수 탈락 처리).
//   · 연속 요청 429 백오프: 문서 사이 4초 간격, 429/실패 시 90초 대기 후 1회 재시도.
// node qa/fetch-soc6-oceania.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";

const UA = "StickStepEdu/1.0 (educational app asset fetch; contact: dev@stickstep.local)";
mkdirSync("public/soc/oceania", { recursive: true });
const TARGETS = [
  // L1 위치·국가·도시
  { article: "Sydney_Opera_House", out: "operahouse", note: "오페라 하우스 — 시드니(오스트레일리아)" },
  { article: "Cathedral_Cove", out: "cathedralcove", note: "커시드럴 코브 — 영화 촬영지(뉴질랜드)" },
  { article: "South_Tarawa", out: "tarawa", note: "타라와 환초 — 키리바시의 수도(산호섬)" },
  // L2 지형
  { article: "Uluru", out: "uluru", note: "울루루 — 사막 한가운데의 거대한 바위(오스트레일리아)" },
  { article: "Great_Barrier_Reef", out: "greatbarrier", note: "대보초 — 세계 최대 산호초 지대(오스트레일리아 북동부)" },
  { article: "Blue_Mountains_(New_South_Wales)", out: "bluemountains", note: "블루마운틴 — 그레이트디바이딩산맥의 일부" },
  { article: "Franz_Josef_Glacier", out: "franzjosef", note: "프란츠요제프 빙하 — 뉴질랜드 남섬의 빙하 지형" },
  { article: "Milford_Sound", out: "milford", note: "밀퍼드 사운드 — 뉴질랜드 남섬의 피오르" },
  { article: "Mount_Taranaki", out: "taranaki", note: "타라나키산 — 뉴질랜드 북섬의 화산" },
  { article: "Great_Artesian_Basin", out: "artesian", note: "대찬정 분지 — 오스트레일리아 중앙 저지대(지도면 탈락 → 발주 대체)" },
  // L3 기후
  { article: "Kiwifruit", out: "kiwifruit", note: "키위 — 뉴질랜드 온대 기후의 과일 재배" },
  // L4 자원·상호작용
  { article: "Super_Pit_gold_mine", out: "superpit", note: "슈퍼핏 노천 광산 — 오스트레일리아의 광산 개발" },
  { article: "Sheep_farming_in_New_Zealand", out: "sheepfarm", note: "뉴질랜드의 양 목장 — 기업적 목축" },
  // L5 태평양 환경 문제
  { article: "Marine_debris", out: "marinedebris", note: "해양 쓰레기 — 해안에 밀려온 플라스틱류" },
  { article: "Coral_bleaching", out: "coralbleach", note: "산호의 백화 현상 — 하얗게 변한 산호" },
  { article: "Funafuti", out: "funafuti", note: "푸나푸티 환초 — 투발루의 수도(해발 고도가 낮은 산호섬)" },
  { article: "Green_sea_turtle", out: "seaturtle", note: "바다거북 — 태평양의 해양 생물" },
  // L7 극지방
  { article: "Aurora", out: "aurora", note: "오로라 — 극지방의 밤하늘" },
  { article: "Iceberg", out: "iceberg", note: "빙산 — 극지방의 바다" },
  { article: "Emperor_penguin", out: "penguin", note: "황제펭귄 — 남극의 동물" },
  { article: "Polar_bear", out: "polarbear", note: "북극곰 — 북극의 동물" },
  { article: "RV_Araon", out: "araon", note: "쇄빙 연구선 아라온호 — 우리나라의 극지 연구" },
  { article: "King_Sejong_Station", out: "sejong", note: "세종 과학 기지 — 우리나라의 남극 기지" },
  { article: "Jang_Bogo_Station", out: "jangbogo", note: "장보고 과학 기지 — 우리나라의 남극 기지" },
  // L8 개발과 보전
  { article: "Antarctic_krill", out: "krill", note: "남극 크릴 — 남극 바다의 수산 자원" },
  { article: "Red_kangaroo", out: "kangaroo", note: "붉은캥거루 — 오스트레일리아의 동물" },
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
  writeFileSync(`public/soc/oceania/${t.out}.webp`, webp);
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
