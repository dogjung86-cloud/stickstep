// 역사 트랙 유물 실사 다운로드 — fetch-nasa-star.mjs 문법(정본 직링크만, API 자동 검색 매칭 금지).
// 소스 규칙(스틱스텝은 유료 앱 — 상업적 이용 가능 라이선스만):
//   한국 유물 = 국립박물관 계열 공공누리 제1유형만(항목마다 개별 확인 — 아래 전부 페이지에서 1유형 확인 완료).
//   세계 유물 = Met CC0 1순위·위키미디어 커먼스 PD/CC0 보조(개별 파일 라이선스 API 확인 완료).
//   대영박물관 자체 사진은 CC BY-NC-SA(비상업)라 사용 금지 — 로제타석은 위키미디어 CC0 사진.
// 다운로드 후 매직 바이트(ffd8ff jpg / 89504e47 png) 검사 + Read 눈검수, 실패 시 대체 소스 보고.
// node qa/fetch-his.mjs → public/photos/his/*.jpg|png → node qa/process-his.mjs (webp 변환)
// 출처·라이선스는 public/photos/CREDITS.md에 기재.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const DIR = "public/photos/his";
mkdirSync(DIR, { recursive: true });

const jobs = [
  // ── 한국 유물(공공누리 제1유형 — 출처표시·상업·변형 가능) ──
  { name: "sumaksae", url: "https://gyeongju.museum.go.kr/_prog/download/?site_dvs_cd=kor&func_gbn_cd=relic_data&mng_no=395&atch=atch_img1", credit: "국립경주박물관, 얼굴무늬 수막새 (공공누리 제1유형)" },
  { name: "imsin", url: "https://gyeongju.museum.go.kr/_prog/download/?site_dvs_cd=kor&func_gbn_cd=relic_data&mng_no=40&atch=atch_img1", credit: "국립경주박물관, 임신서기석 (공공누리 제1유형)" },
  { name: "bitsal", url: "https://www.museum.go.kr/relic_image/PS01001001/ssu000/2024/1220165016025/ssu022891-000-90000.jpg", credit: "국립중앙박물관, 빗살무늬 토기 (공공누리 제1유형)" },
  { name: "bronze", url: "https://www.museum.go.kr/relic_image/PS01001001/ssu000/2019/0925103407266/ssu003094-000-90000.jpg", credit: "국립중앙박물관, 요령식 동검(비파형 동검) (공공누리 제1유형)" },
  { name: "gwanggaeto", url: "https://www.museum.go.kr/relic_image/PS01001001/bon000/2024/0131084448230/bon006490-000-80100.jpg", credit: "국립중앙박물관, 광개토대왕비 탑본 (공공누리 제1유형)" },
  { name: "sillok", url: "https://www.gogung.go.kr/cmmn/file/imageSrc.do?atchFileId=c436ad1c0b864d1f86849a4136f6e576&fileSn=35303", credit: "국립고궁박물관, 중종실록(조선왕조실록 오대산사고본) (공공누리 제1유형)" },
  // ── 세계 유물·유적(위키미디어 커먼스 CC0 — extmetadata로 개별 확인) ──
  { name: "pompeii", url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Pompeii_Forum_%26_Mt._Vesuvius_%289809458366%29.jpg", credit: "Pompeii Forum & Mt. Vesuvius, via Wikimedia Commons (CC0)" },
  { name: "machu", url: "https://upload.wikimedia.org/wikipedia/commons/4/42/Ruins_of_Machu_Picchu_%28Unsplash%29.jpg", credit: "Tomas Sobek, Ruins of Machu Picchu, via Wikimedia Commons (CC0)" },
  // 1차 후보(CC0, Rosetta-stone-display-in-1985.jpg)는 눈검수 불합격 — 돌이 누워 있고 관람객 얼굴이 주인공.
  // CC BY 4.0 정면 사진으로 교체(ESO·NOIRLab CC BY 4.0을 쓰는 photos/star 선례와 같은 라이선스 급).
  { name: "rosetta", url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Rosetta_Stone%2C_British_Museum.jpg", credit: "APK, Rosetta Stone, via Wikimedia Commons (CC BY 4.0)" },
];

for (const j of jobs) {
  const isPng = (buf) => buf.slice(0, 4).toString("hex") === "89504e47";
  const isJpg = (buf) => buf.slice(0, 3).toString("hex") === "ffd8ff";
  if (existsSync(`${DIR}/${j.name}.jpg`) || existsSync(`${DIR}/${j.name}.png`) || existsSync(`${DIR}/${j.name}.webp`)) {
    console.log("SKIP", j.name);
    continue;
  }
  try {
    const res = await fetch(j.url, { headers: { "user-agent": "Mozilla/5.0 (StickStep edu app asset fetch)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isJpg(buf) && !isPng(buf)) throw new Error(`not an image (magic ${buf.slice(0, 4).toString("hex")} — HTML page?)`);
    const path = `${DIR}/${j.name}.${isPng(buf) ? "png" : "jpg"}`;
    writeFileSync(path, buf);
    console.log("OK", j.name, Math.round(buf.length / 1024) + "KB |", j.credit);
  } catch (e) {
    console.log("FAIL", j.name, e.message);
  }
}
console.log("DONE");
