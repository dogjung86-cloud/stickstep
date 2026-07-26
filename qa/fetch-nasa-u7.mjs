// u7 v2 시험 신규 실사 — 행성 5종(수성·금성·화성·천왕성·해왕성) NASA 후보 수급.
// 자동 매칭 오배송 전례(fetch-nasa-star 주석) 때문에 바로 정본 채택하지 않는다:
// images-api.nasa.gov 검색 → 후보 상위 3장을 tmp/u7-photo-cands/에 내려받고, 메인이 Read 눈검수로
// 1장을 골라 public/photos/<name>.jpg 로 승격 + CREDITS.md 기재(후보 체인+눈검수 — g2u2 위키미디어 계보).
// node qa/fetch-nasa-u7.mjs          → 후보 다운로드(+cands.json 메타)
// node qa/fetch-nasa-u7.mjs pick mercury 1  → 후보 1번을 public/photos/mercury.jpg 로 승격
import { mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync } from "node:fs";

const DIR = "tmp/u7-photo-cands";
const JOBS = [
  { name: "mercury", q: "planet mercury messenger" },
  { name: "venus", q: "planet venus clouds" },
  { name: "mars", q: "mars globe" },
  { name: "uranus", q: "uranus voyager 2 planet" },
  { name: "neptune", q: "neptune voyager 2 full disk" },
];

const [, , cmd, pickName, pickIdx] = process.argv;

if (cmd === "pick") {
  const meta = JSON.parse(readFileSync(`${DIR}/cands.json`, "utf8"));
  const cand = meta[pickName]?.[Number(pickIdx)];
  if (!cand) throw new Error(`후보 없음: ${pickName} ${pickIdx}`);
  copyFileSync(`${DIR}/${pickName}-${pickIdx}.jpg`, `public/photos/${pickName}.jpg`);
  console.log(`승격: public/photos/${pickName}.jpg ← 후보 ${pickIdx}`);
  console.log(`크레딧 기재용: ${cand.title} | ${cand.nasaId} | ${cand.center ?? "NASA"} ${cand.photographer ?? ""}`);
  process.exit(0);
}

mkdirSync(DIR, { recursive: true });
const meta = {};
for (const j of JOBS) {
  meta[j.name] = [];
  try {
    const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(j.q)}&media_type=image&page_size=24`, { headers: { "user-agent": "Mozilla/5.0" } });
    const data = await res.json();
    const items = data?.collection?.items ?? [];
    let saved = 0;
    for (const it of items) {
      if (saved >= 3) break;
      const d = it.data?.[0];
      const nasaId = d?.nasa_id;
      if (!nasaId) continue;
      for (const variant of ["~medium.jpg", "~orig.jpg", "~large.jpg"]) {
        const url = `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}${variant}`;
        try {
          const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
          if (!r.ok) continue;
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.slice(0, 2).toString("latin1") !== "\xff\xd8") continue;
          if (buf.length > 8_000_000) continue;
          writeFileSync(`${DIR}/${j.name}-${saved}.jpg`, buf);
          meta[j.name].push({ idx: saved, nasaId, title: d.title, center: d.center, photographer: d.photographer, kb: Math.round(buf.length / 1024) });
          console.log(`OK ${j.name}-${saved}: ${d.title} (${nasaId}${variant}, ${Math.round(buf.length / 1024)}KB)`);
          saved += 1;
          break;
        } catch {
          continue;
        }
      }
    }
    if (!saved) console.log(`FAIL ${j.name}: 후보 0`);
  } catch (e) {
    console.log(`FAIL ${j.name}:`, e.message);
  }
}
writeFileSync(`${DIR}/cands.json`, JSON.stringify(meta, null, 2));
console.log("DONE — 후보 눈검수 후 pick으로 승격");
