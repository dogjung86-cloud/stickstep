// u2 v2 해설 용어 지칭 스캔 — 해설이 그 레슨의 도입어를 "정확히 불렀는지" 훑는다.
// 금지어를 피하려다 모양·기능 서술로만 돌려말하면 학생이 이름을 익힐 자리가 사라진다.
//   ✗ = 해설이 그 레슨 도입어를 하나도 부르지 않음(반드시 수리)
//   △ = 용어가 core 한 줄에만 있고 해설 본문에는 없음(수리 권장)
// node qa/scan-u2v2-terms.mjs
import { build } from "esbuild";
import { existsSync } from "node:fs";

const SRC = [
  ["qa/u2v2-pilot.ts", "POOL_U2V2_PILOT"],
  ["qa/u2v2-rest-a.ts", "POOL_U2V2_REST_A"],
  ["qa/u2v2-rest-b.ts", "POOL_U2V2_REST_B"],
  ["qa/u2v2-rest-c.ts", "POOL_U2V2_REST_C"],
  ["qa/u2v2-rest-d.ts", "POOL_U2V2_REST_D"],
  ["qa/u2v2-rest-e.ts", "POOL_U2V2_REST_E"],
  ["qa/u2v2-rest-f.ts", "POOL_U2V2_REST_F"],
].filter(([p]) => existsSync(p));

const pool = [];
for (const [p, name] of SRC) {
  const r = await build({ entryPoints: [p], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  pool.push(...mod[name]);
}

// 레슨별 핵심 도입어(unit2.ts의 term·concept 목록에서 뽑았다). 그 레슨을 다루는 해설이라면
// 적어도 하나는 이름 그대로 불러야 한다.
const TERMS = {
  u2l1: ["세포", "생명활동"],
  u2l2: ["세포막", "핵", "마이토콘드리아", "엽록체", "세포벽", "유전물질"],
  u2l3: ["표본", "덮개 유리", "받침 유리", "염색액", "거름종이", "저배율", "고배율", "접안렌즈", "대물렌즈", "재물대", "조동나사", "반사경", "핵"],
  u2l4: ["신경세포", "적혈구", "상피세포"],
  u2l5: ["세포", "조직", "기관", "기관계", "조직계", "개체", "유기적"],
  u2l6: ["생물다양성", "생태계", "종류"],
  u2l7: ["변이", "적응", "종"],
  u2l8: ["생물분류", "종", "속", "과", "목", "강", "문", "계", "기준"],
  u2l9: ["원핵생물계", "원생생물계", "균계", "식물계", "동물계", "핵막", "세포벽", "광합성", "단세포", "다세포"],
  u2l10: ["멸종", "서식지파괴", "서식지", "외래생물", "생태통로", "국립공원", "먹이 관계", "생물다양성"],
};
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

let bad = 0;
let warn = 0;
for (const it of pool) {
  const surface = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ") + " " + (it.bogi ?? []).map(plain).join(" ");
  const exp = plain(it.explain);
  const core = plain(it.core);
  const t = TERMS[it.lessonId] ?? [];
  const inExp = t.filter((w) => exp.includes(w));
  const onlyCore = t.filter((w) => !exp.includes(w) && !surface.includes(w) && core.includes(w));
  if (!inExp.length) { bad += 1; console.error(`✗ ${it.id} (${it.lessonId}) 해설이 이 레슨 도입어를 하나도 부르지 않음`); }
  else if (onlyCore.length) { warn += 1; console.warn(`△ ${it.id} (${it.lessonId}) core에만 등장: ${onlyCore.join(", ")}`); }
}
console.log(`\n문항 ${pool.length} · 미지칭 ${bad} · core에만 ${warn}`);
if (bad) process.exit(1);
