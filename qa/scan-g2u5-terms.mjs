// g2u5 v2 해설 용어 스캔 — "기호로 물은 부위를 해설이 돌려 말하고 이름을 안 주는" 결함을 잡는다.
// 사용자 지적(2026-08-02): 슬롯 201이 정답 부위인 기공을 "작은 틈"으로만 부르고 끝났다.
// 그림이 ㉠~㉤ 기호로 부위를 가리키는 문항은 해설에서 반드시 그 이름을 돌려줘야 한다
// (시험은 채점이 아니라 학습의 마지막 장면이다).
// node qa/scan-g2u5-terms.mjs
import { build } from "esbuild";
import { existsSync } from "node:fs";

const SRC = [
  ["qa/g2u5v2-pilot.ts", "POOL_G2U5_PILOT"],
  ["qa/g2u5v2-rest-a.ts", "POOL_G2U5_REST_A"],
  ["qa/g2u5v2-rest-b.ts", "POOL_G2U5_REST_B"],
  ["qa/g2u5v2-rest-c.ts", "POOL_G2U5_REST_C"],
  ["qa/g2u5v2-rest-d.ts", "POOL_G2U5_REST_D"],
  ["qa/g2u5v2-rest-e.ts", "POOL_G2U5_REST_E"],
  ["qa/g2u5v2-rest-f.ts", "POOL_G2U5_REST_F"],
].filter(([p]) => existsSync(p));

const items = [];
for (const [p, name] of SRC) {
  const r = await build({ entryPoints: [p], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  items.push(...mod[name]);
}
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");

// 레슨 도입어 → 그 이름 대신 흔히 쓰게 되는 돌려 말하기 표현.
// ⚠ 검산 B 실질 12 반영으로 사전을 넓혔다("물이 지나는 길/통로" · "양분이 지나는 통로" · "이 소기관").
const CIRCUM = {
  기공: ["작은 틈", "잎 표면의 구멍", "표면에 뚫린 구멍", "두 세포가 감싼 구멍"],
  물관: ["위쪽 관", "굵고 둥근 관", "물이 지나는 관", "물이 지나는 길", "물이 지나는 통로", "물이 올라오는 길", "물의 길"],
  체관: ["아래쪽 관", "작은 관", "양분이 지나가는 길", "양분이 지나는 통로", "양분이 내려오는 길"],
  엽록체: ["초록색 알갱이", "초록 알갱이"],
  마이토콘드리아: ["세포 소기관", "그 소기관", "이 소기관", "한 소기관"],
  녹말: ["저장 형태"],
  설탕: ["물에 잘 녹는 형태"],
};

let warns = 0;
for (const it of items) {
  const ex = plain(it.explain) + " " + plain(it.core);
  for (const [term, hints] of Object.entries(CIRCUM)) {
    const hit = hints.filter((h) => ex.includes(h));
    // "이 소기관"은 엽록체를 가리킬 수도 있으므로 두 소기관 가운데 하나만 명명돼 있으면 통과시킨다.
    const named = term === "마이토콘드리아" ? ex.includes(term) || ex.includes("엽록체") : ex.includes(term);
    if (hit.length && !named) {
      warns += 1;
      console.warn(`WARN ${it.id} 해설이 "${term}"을 이름 없이 "${hit.join("·")}"로만 부른다`);
    }
  }
  // 그림이 기호로 부위를 가리키는데 해설에 도입어가 하나도 없으면 학습이 닫히지 않는다.
  // 그래프·막대의 ㉠㉡㉢은 '부위'가 아니라 구간·지점 표지라 이름 붙일 대상이 없다(제외).
  const fig = String(it.figure ?? "");
  const aria = (fig.match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
  // ⚠ 검산 B 실질 12 반영: 제외 정규식이 그냥 "표"였던 탓에 PS·DN·TR의 aria에 든 "화살표"·"이름표"가
  //   부분열로 걸려 도해 문항이 통째로 검사에서 빠져 있었다(무증상 ALL CLEAR).
  //   → 표 계열은 svgTable("자료 표")·variableTableFig("같게 할지")의 실제 문구로만 좁힌다.
  if (/㉠/.test(fig) && !/그래프|곡선|막대|자료 표|같게 할지/.test(aria)) {
    const named = Object.keys(CIRCUM).concat(["포도당", "산소", "이산화 탄소", "무기 양분", "공변세포"])
      .filter((t) => ex.includes(t));
    if (!named.length) {
      warns += 1;
      console.warn(`WARN ${it.id} 그림이 기호로 부위를 가리키는데 해설에 이름이 하나도 없다`);
    }
  }
}
console.log(warns ? `\n${warns} WARN` : "\n용어 스캔 ALL CLEAR (돌려 말하기 0)");
