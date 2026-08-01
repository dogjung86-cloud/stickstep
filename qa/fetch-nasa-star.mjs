// 중2 VIII 별과 우주 — NASA/ESO/ESA-Hubble/NOIRLab 실사 다운로드(PD·CC BY 4.0, CREDITS.md 기재).
// 전부 정본 직링크(자동 검색 매칭은 오배송 사고가 있어 금지 — pleiades가 WISE 적외선, apollo11이
// 훈련 사진, jwst가 행사장 사진으로 온 실사고). photojournal.jpl.nasa.gov와 nssdc는 HTML 챌린지
// 페이지를 반환하므로 쓰지 않는다 — images-assets.nasa.gov 미러가 확정 경로.
// node qa/fetch-nasa-star.mjs → public/photos/star/*.jpg → node qa/process-star.mjs (webp 변환)
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const DIR = "public/photos/star";
mkdirSync(DIR, { recursive: true });

const jobs = [
  { name: "milkyway-top", url: "https://images-assets.nasa.gov/image/PIA10748/PIA10748~medium.jpg", credit: "NASA/JPL-Caltech/R. Hurt (SSC)" },
  { name: "milkyway-pan", url: "https://cdn.eso.org/images/large/eso0932a.jpg", credit: "ESO/S. Brunier (CC BY 4.0)" },
  { name: "orion-nebula", url: "https://cdn.esahubble.org/archives/images/large/heic0601a.jpg", credit: "NASA, ESA, M. Robberto (STScI/ESA) + HST Orion Treasury Team (CC BY 4.0)" },
  { name: "horsehead", url: "https://cdn.eso.org/images/large/eso0202a.jpg", credit: "ESO (CC BY 4.0)" },
  { name: "m78-reflection", url: "https://cdn.eso.org/images/large/eso1105a.jpg", credit: "ESO/Igor Chekalin (CC BY 4.0)" },
  { name: "pleiades", url: "https://noirlab.edu/public/media/archives/images/large/noao-m45.jpg", credit: "KPNO/NOIRLab/NSF/AURA (CC BY 4.0)" },
  { name: "m5-globular", url: "https://cdn.esahubble.org/archives/images/large/potw1118a.jpg", credit: "ESA/Hubble & NASA (CC BY 4.0)" },
  { name: "pluto", url: "https://images-assets.nasa.gov/image/PIA19952/PIA19952~medium.jpg", credit: "NASA/JHUAPL/SwRI (New Horizons)" },
  { name: "sputnik", url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Sputnik_asm.jpg", credit: "NASA/NSSDC (PD, via Wikimedia Commons)" },
  { name: "apollo11", url: "https://images-assets.nasa.gov/image/as11-40-5875/as11-40-5875~medium.jpg", credit: "NASA (Apollo 11, AS11-40-5875)" },
  { name: "hubble-telescope", url: "https://images-assets.nasa.gov/image/sts061-73-040/sts061-73-040~medium.jpg", credit: "NASA (STS-61)" },
  { name: "iss", url: "https://images-assets.nasa.gov/image/s134e010137/s134e010137~medium.jpg", credit: "NASA (STS-134)" },
  { name: "jwst", url: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000162/GSFC_20171208_Archive_e000162~medium.jpg", credit: "NASA/Chris Gunn" },
  // g2u8 단원 종합 평가 추가분(외부 은하 문항용) — 정본 직링크만, 다운로드 후 눈검수 필수
  { name: "andromeda", url: "https://noirlab.edu/public/media/archives/images/large/noao-m31.jpg", credit: "Bill Schoening, Vanessa Harvey/REU program/NOIRLab/NSF/AURA (CC BY 4.0)" },
  { name: "whirlpool", url: "https://cdn.esahubble.org/archives/images/large/heic0506a.jpg", credit: "NASA, ESA, S. Beckwith (STScI), Hubble Heritage Team (CC BY 4.0)" },
  // g2u8 v2 재출제 추가분(색 대비 관찰 문항용 이중성) — 눈검수: 주황·청백 두 별이 또렷이 구분돼야 합격.
  // NOIRLab 슬러그는 403이라 위키미디어 정본 제목 고정(Special:FilePath — 검색 자동 매칭 아님).
  // 저장본 albireo.webp는 이 원본에서 두 별 중심 정사각 크롭·900px webp(절차 qa/g2u8-v2-blueprint.md §8-0).
  { name: "albireo", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Albireo%20Killarney%20Provincial%20Park%20Observatory.jpg", credit: "Brucewaters, Wikimedia Commons (CC BY 4.0)" },
  // g2u8 v2 확대분(L6 성단·성운 사진화 4장) · 눈검수 기준: 이중 성단 = 두 별 무리가 나란히 또렷,
  // m13 = 공 모양 밀집이 한눈에, coalsack = 별밭 속 검은 영역 대비, lagoon = 붉게 번지는 구름.
  // 위키미디어는 upload 정본 직링크(제목 고정 · Special:FilePath 리다이렉트도 안 씀), ESO는 screen 판(1280px).
  { name: "double-cluster", url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Double_Cluster_%2850503695887%29.jpg", credit: "Stephen Rahn, Wikimedia Commons (CC0)" },
  { name: "m13", url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/M13_%28noao-m13bash2%29.jpg", credit: "KPNO/NOIRLab/NSF/AURA/Tom Bash and John Fox/Adam Block (CC BY 4.0)" },
  { name: "coalsack", url: "https://cdn.eso.org/images/screen/eso1539a.jpg", credit: "ESO (CC BY 4.0)" },
  { name: "lagoon", url: "https://cdn.eso.org/images/screen/eso1403a.jpg", credit: "ESO/VPHAS+ team (CC BY 4.0)" },
];

for (const j of jobs) {
  const path = `${DIR}/${j.name}.jpg`;
  if (existsSync(path) || existsSync(path.replace(/\.jpg$/, ".webp"))) { console.log("SKIP", j.name); continue; }
  try {
    const res = await fetch(j.url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.slice(0, 2).toString("latin1") !== "\xff\xd8") throw new Error("not a JPEG (HTML challenge page?)");
    writeFileSync(path, buf);
    console.log("OK", j.name, Math.round(buf.length / 1024) + "KB |", j.credit);
  } catch (e) {
    console.log("FAIL", j.name, e.message);
  }
}
console.log("DONE");
