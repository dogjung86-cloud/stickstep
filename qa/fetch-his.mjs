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

  // ── 2차분: 역사① Ⅱ(h1u2 — 문명·고대 세계) 16종 (2026-07-19) ──
  // 한국 유물(공공누리 제1유형 — 소장품 페이지에서 개별 확인 완료)
  { name: "handaxe", url: "https://www.museum.go.kr/relic_image/PS01001001/ssu000/2019/0925123406433/ssu019143-000-90000.jpg", credit: "국립중앙박물관, 주먹도끼 (공공누리 제1유형)" },
  // Met Open Access CC0 — collectionapi로 objectID별 isPublicDomain=true 확인 완료(괄호 안 = objectID)
  { name: "cuneiform", url: "https://images.metmuseum.org/CRDImages/an/original/DP293243.jpg", credit: "Metropolitan Museum of Art, Proto-Cuneiform tablet: administrative account of barley distribution (329081, CC0)" },
  { name: "mummycoffin", url: "https://images.metmuseum.org/CRDImages/eg/original/LC-86_1_2_EGDP026785-Stitched.jpg", credit: "Metropolitan Museum of Art, Inner coffin of Khonsu (544705, CC0)" },
  { name: "persia", url: "https://images.metmuseum.org/CRDImages/an/original/DP-19135-003.jpg", credit: "Metropolitan Museum of Art, Vessel terminating in the forepart of a leonine creature, Achaemenid (324291, CC0)" },
  { name: "augustus", url: "https://images.metmuseum.org/CRDImages/gr/original/DP337220.jpg", credit: "Metropolitan Museum of Art, Marble portrait of the emperor Augustus (247993, CC0)" },
  { name: "gandhara", url: "https://images.metmuseum.org/CRDImages/as/original/DP328363.jpg", credit: "Metropolitan Museum of Art, Buddha (Gandhara, 3rd century) (646117, CC0)" },
  { name: "mohenjoseal", url: "https://images.metmuseum.org/CRDImages/an/original/DP23101.jpg", credit: "Metropolitan Museum of Art, Stamp seal and modern impression: unicorn and incense burner, Indus valley (324062, CC0)" },
  // (기각 기록) 고전 쐐기 점토판 별도 수급 시도 — 321739는 흑백 저해상, 324238은 청동판(재질 불일치),
  // 323243은 인장 자국이 주인공이라 전부 기각. 퀴즈도 cuneiform(원시 쐐기)을 재사용하고 문구를 재질·기법
  // 중심으로 저작하는 것으로 확정(같은 사진의 concept+퀴즈 재사용은 h1u1 gwanggaeto 선례).
  // 위키미디어 커먼스 — imageinfo extmetadata로 개별 라이선스 확인 완료(CC0/PD/CC BY 계열만)
  { name: "pyramid", url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Giza_Sphinx_and_Pyramids_of_Khafre_%26_Khufu_%289793874844%29.jpg", credit: "Gary Todd, Giza Sphinx and Pyramids, via Wikimedia Commons (CC0)" },
  { name: "ziggurat", url: "https://upload.wikimedia.org/wikipedia/commons/9/93/Ancient_ziggurat_at_Ali_Air_Base_Iraq_2005.jpg", credit: "Hardnfast, Ancient ziggurat of Ur, via Wikimedia Commons (CC BY 3.0)" },
  // 1차 후보(Shang Tortoise Plastron 10197433513)는 눈검수 불합격 — 균열만 보이고 글자 새김이 안 보임(전시 유리 반사도).
  { name: "oracle", url: "https://upload.wikimedia.org/wikipedia/commons/0/00/Ancient_Chinese_Writing_on_Tortoise_Plastron%2C_Shang_Dynasty_Oracle_Bone%2C_Yinxu.jpg", credit: "Gary Todd, Ancient Chinese Writing on Tortoise Plastron (Yinxu), via Wikimedia Commons (CC0)" },
  { name: "parthenon", url: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Parthenon_east_Acropolis%2C_Athens%2C_Greece.jpg", credit: "Jebulon, Parthenon east facade, via Wikimedia Commons (CC0)" },
  { name: "colosseum", url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Colosseum_of_Rome_and_Roman_forum.jpg", credit: "Wilfredor, Colosseum of Rome, via Wikimedia Commons (CC0)" },
  { name: "aqueduct", url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Pont_du_Gard_004.jpg", credit: "Marc Ryckaert, Pont du Gard, via Wikimedia Commons (CC BY 2.5)" },
  // 병마용 1차(Pit 1 16 — 2인 클로즈업)는 "줄지어 선 군대" 캡션과 불일치, 만리장성 1차(Badaling 9863411783)는
  // 전경의 관광 슬라이드 구조물이 주인공이라 각각 기각 — 갱도 와이드 컷·능선 성벽 컷으로 교체.
  // 2차 후보(Pit 1 18)도 2인 클로즈업이라 기각 — "줄지어 선 군대"가 보이는 파노라마로 최종 확정.
  { name: "terracotta", url: "https://upload.wikimedia.org/wikipedia/commons/8/83/Terracotta_Soldier_Panorama_%285258589290%29.jpg", credit: "Walter-Wilhelm, Terracotta Soldier Panorama, via Wikimedia Commons (CC BY 2.0)" },
  { name: "greatwall", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Great_Wall_of_China_July_2006.JPG", credit: "Great Wall of China at Mutianyu, via Wikimedia Commons (CC0)" },
  { name: "hammurabi", url: "https://upload.wikimedia.org/wikipedia/commons/6/64/P1050763_Louvre_code_Hammurabi_face_rwk.JPG", credit: "Mbzt, Code of Hammurabi stele (Louvre), via Wikimedia Commons (CC BY 3.0)" },

  // ── 3차분: 역사① Ⅲ(h1u3 — 세계 종교·지역 문화) 15종 (2026-07-19) ──
  // Met Open Access CC0 — objectID별 isPublicDomain=true + medium 검산 완료(괄호 안 = objectID | medium)
  { name: "weibuddha", url: "https://images.metmuseum.org/CRDImages/as/original/DP170102.jpg", credit: "Metropolitan Museum of Art, Buddha Maitreya (Mile), dated 486, Northern Wei (42733 | gilt bronze, CC0)" },
  // 1차 후보(Met 49368 67_43_1)는 구식 흑백 아카이브 사진이라 기각 — 당삼채는 "세 가지 색 유약"이 핵심.
  // 컬러 낙타+서역 악단 당삼채(중국국가박물관 소장, Gary Todd CC0)로 교체 — 미래엔 도판과 같은 주제.
  { name: "sancaicamel", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Tang%20Dynasty%20musicians%20on%20camel%2C%20723%20ad.jpg", credit: "Gary Todd, Tang sancai camel with musicians (723), via Wikimedia Commons (CC0)" },
  { name: "guptabuddha", url: "https://images.metmuseum.org/CRDImages/as/original/DT237.jpg", credit: "Metropolitan Museum of Art, Standing Buddha Offering Protection, Gupta late 5th c. (38198 | red sandstone, CC0)" },
  { name: "mihrab", url: "https://images.metmuseum.org/CRDImages/is/original/DP235035.jpg", credit: "Metropolitan Museum of Art, Mihrab (Prayer Niche), 1354-55, Isfahan (449537 | mosaic of polychrome-glazed tiles, CC0)" },
  { name: "knightarmor", url: "https://images.metmuseum.org/CRDImages/aa/original/DP-46028-001.jpg", credit: "Metropolitan Museum of Art, Armor, ca. 1400-1450, Italian (23205 | steel, CC0)" },
  // 위키미디어 커먼스 — extmetadata 라이선스 개별 확인 완료(CC0/PD/CC BY만, CC BY-SA 후보는 전부 기각)
  { name: "longmen", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Ancient%20Buddhist%20Grottoes%20at%20Longmen-%20Fengxian%20Temple%2C%20Vairocana%20Buddha.jpg", credit: "Gary Todd, Longmen Grottoes Fengxian Temple Vairocana Buddha, via Wikimedia Commons (CC0)" },
  { name: "todaiji", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Daibutsu-den%20in%20Todaiji%20Nara02bs3200.jpg", credit: "663highland, Todai-ji Daibutsuden (Nara), via Wikimedia Commons (CC BY 2.5)" },
  { name: "ajanta", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Ajanta%20%2863%29.jpg", credit: "Ajanta Caves, via Wikimedia Commons (CC BY 2.5)" },
  { name: "angkor", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Angkor%20Wat%20Reflection%20%2846810498612%29.jpg", credit: "Amaury Laporte, Angkor Wat Reflection, via Wikimedia Commons (CC BY 2.0)" },
  { name: "astrolabe", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Planispheric%20Astrolabe%20MET%20DP170383.jpg", credit: "Metropolitan Museum of Art, Planispheric Astrolabe, via Wikimedia Commons (CC0)" },
  { name: "cordoba", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Mosque%20of%20Cordoba%2C%20interior%2C%208th%20-%2010th%20centuries%20%287%29%20%2829523855420%29.jpg", credit: "Richard Mortel, Great Mosque of Cordoba interior, via Wikimedia Commons (CC BY 2.0)" },
  { name: "sophia", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Hagia%20Sophia%20exterior%202007%20002.jpg", credit: "Gryffindor, Hagia Sophia exterior, via Wikimedia Commons (Public domain)" },
  { name: "sanvitale", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Justinian%20mosaic%2C%20San%20Vitale%2C%20consecrated%20547%2C%20Ravenna%2C%20Italy.jpg", credit: "Richard Mortel, Justinian mosaic San Vitale (Ravenna), via Wikimedia Commons (CC BY 2.0)" },
  { name: "chartres", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Chartres%20Cathedral.jpg", credit: "Tony Hisgett, Chartres Cathedral, via Wikimedia Commons (CC BY 2.0)" },
  { name: "rosewindow", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Chartres%20-%20cath%C3%A9drale%20-%20rosace%20nord.jpg", credit: "Eusebius, Chartres north rose window, via Wikimedia Commons (Public domain)" },
];

for (const j of jobs) {
  const isPng = (buf) => buf.slice(0, 4).toString("hex") === "89504e47";
  const isJpg = (buf) => buf.slice(0, 3).toString("hex") === "ffd8ff";
  if (existsSync(`${DIR}/${j.name}.jpg`) || existsSync(`${DIR}/${j.name}.png`) || existsSync(`${DIR}/${j.name}.webp`)) {
    console.log("SKIP", j.name);
    continue;
  }
  try {
    const res = await fetch(j.url, { headers: { "user-agent": "StickStepEduAssetFetch/1.0 (edu app; contact: sciencegive@naver.com)" } });
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
