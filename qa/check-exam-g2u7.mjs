// g2u7 시험 풀 기계 검사 v3(2026-11 전면 재출제 규격). 커밋 전 스캔: node qa/check-exam-g2u7.mjs
//   규격의 정본은 src/content/exams/g2u7.ts 머리말과 EXAM_GUIDE.md의 "g2u7 v3" 소단락이다.
//   보는 것: 문항 수와 id, 레슨별 난이도, 유형과 보기 형식, 고정 순서 문항의 정답 자리, 보기별 이유,
//   여덟 시험지(forms)의 무중복과 균형, 그림 출력과 폭, 그림 설명글의 답 유출, 글 규칙(대시, '교과서', 말투).
import { build } from "esbuild";
import { readFileSync } from "node:fs";

const result = await build({ entryPoints: ["src/content/exams/g2u7.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const { pool, forms, pick } = mod.G2U7_EXAM;

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let bad = 0;
const fail = (m) => { console.log("FAIL", m); bad++; };
const count = (arr, f) => arr.reduce((a, x) => { const k = f(x); a[k] = (a[k] || 0) + 1; return a; }, {});

// ── 문항 수, id, 레슨, 난이도 ──
if (pool.length !== 160) fail(`문항 수 ${pool.length} (160)`);
pool.forEach((it, i) => {
  const want = `g2u7e${401 + i}`, lesson = `g2u7l${Math.floor(i / 20) + 1}`;
  if (it.id !== want) fail(`${it.id}: id는 ${want}이어야 한다(레슨마다 20개씩 이어진다)`);
  if (it.lessonId !== lesson) fail(`${it.id}: lessonId ${it.lessonId} (${lesson})`);
});
for (let l = 1; l <= 8; l++) {
  const a = pool.filter((it) => it.lessonId === `g2u7l${l}`), d = count(a, (it) => it.diff), t = count(a, (it) => it.type);
  if (d[1] !== 8 || d[2] !== 8 || d[3] !== 4) fail(`레슨 ${l}: 난이도 ${JSON.stringify(d)} (하 8, 중 8, 상 4)`);
  if (t.multi !== 2) fail(`레슨 ${l}: 모두 고르기 ${t.multi ?? 0}문항 (2)`);
}
const types = count(pool, (it) => it.type);
if (Object.keys(types).some((k) => !["mcq", "multi", "num"].includes(k))) fail(`유형 ${JSON.stringify(types)} (mcq, multi, num만)`);
if (types.num !== 16) fail(`숫자 입력 ${types.num}문항 (16)`);

// ── 문항 단위 ──
const byId = new Map();
for (const it of pool) {
  if (byId.has(it.id)) fail(`${it.id}: id 중복`);
  byId.set(it.id, it);
  for (const k of ["prompt", "explain", "core"]) if (!plain(it[k])) fail(`${it.id}: ${k} 없음`);
  if (!String(it.explain).includes("class='xh'>정답 풀이")) fail(`${it.id}: 해설에 정답 풀이 소제목 없음`);
  if (it.type === "num") {
    if (typeof it.answer !== "string" || !/^\d+(\.\d+)?$/.test(it.answer)) fail(`${it.id}: 숫자 정답 ${it.answer}`);
    if (!it.unitLabel) fail(`${it.id}: unitLabel 없음`);
    else if (!plain(it.prompt).includes(it.unitLabel)) fail(`${it.id}: 발문에 단위 ${it.unitLabel}가 없다`);
    if (it.answer.includes(".") && it.numKind !== "dec") fail(`${it.id}: 소수 정답인데 numKind가 dec가 아니다`);
    continue;
  }
  const n = it.options?.length ?? 0;
  if (n !== 5) fail(`${it.id}: 보기 ${n}개 (5)`);
  if (new Set(it.options).size !== n) fail(`${it.id}: 보기 중복`);
  if (it.type === "mcq") {
    if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < n)) fail(`${it.id}: 정답 인덱스 ${it.answer}`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id}: 순서를 고정한 문항인데 첫 보기가 정답이다`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id}: ㄱㄴㄷ 합답은 shuffle: false`);
    if (it.bogi && !String(it.explain).includes("보기 하나씩")) fail(`${it.id}: 합답 해설에 보기 하나씩 판정이 없다`);
  } else {
    const a = it.answer;
    if (!Array.isArray(a) || a.length < 2 || a.length > 4 || a.some((x) => !(x >= 0 && x < n))) fail(`${it.id}: 모두 고르기 정답 ${JSON.stringify(a)}`);
  }
  if (!it.bogi) {
    if (!Array.isArray(it.optWhy) || it.optWhy.length !== n) fail(`${it.id}: optWhy는 보기 수만큼`);
    else it.optWhy.forEach((w, i) => {
      const isAns = Array.isArray(it.answer) ? it.answer.includes(i) : it.answer === i;
      if (!w && (it.type === "multi" || !isAns)) fail(`${it.id}: ${i + 1}번째 보기의 이유가 없다`);
    });
  }
  const pairs = it.options.filter((o) => o.includes('class="ex-pair"')).length, figs = it.options.filter((o) => o.includes('class="ex-optfig"')).length;
  if (it.optHead) {
    if (pairs !== n) fail(`${it.id}: 머리줄이 있는데 짝짓기 보기가 아니다`);
    for (const o of it.options) if ((o.match(/<span>/g) || []).length !== it.optHead.length) fail(`${it.id}: 짝짓기 칸 수가 머리줄과 다르다`);
  } else if (pairs) fail(`${it.id}: 짝짓기 보기인데 머리줄이 없다`);
  if (figs && figs !== n) fail(`${it.id}: 그림 보기와 글 보기가 섞였다`);
  if (figs && !it.optCols) fail(`${it.id}: 그림 보기인데 optCols가 없다`);
}

// ── 그림 ──
for (const it of pool) {
  for (const [where, s] of [["그림", it.figure ?? ""], ...(it.options ?? []).map((o, i) => [`보기 ${i + 1}`, o])]) {
    if (!s.includes("<svg")) continue;
    if (/NaN|undefined/.test(s)) fail(`${it.id} ${where}: 그림에 NaN 또는 undefined`);
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(s);
    if (!vb) fail(`${it.id} ${where}: viewBox 없음`);
    else if (where === "그림" && +vb[1] > 380) fail(`${it.id}: 그림 폭 ${vb[1]} (380 이하. 폰의 그림 칸에서 글자가 작아진다)`);
    for (const m of s.matchAll(/aria-label="([^"]*)"/g)) for (const w of ["직렬", "병렬"]) if (m[1].includes(w) && !plain(it.prompt).includes(w)) fail(`${it.id} ${where}: 그림 설명글이 발문에 없는 "${w}"을 말한다`);
    if (s.includes('loading="lazy"')) fail(`${it.id}: lazy 금지`);
  }
}

// ── 여덟 시험지 ──
if (!Array.isArray(forms) || forms.length !== 8) fail(`forms ${forms?.length} (8)`);
else {
  const all = forms.flat();
  if (new Set(all).size !== 160 || all.length !== 160) fail(`시험지끼리 겹치거나 빠진 문항이 있다(서로 다른 문항 ${new Set(all).size}, 합 ${all.length})`);
  forms.forEach((f, i) => {
    const items = f.map((id) => byId.get(id));
    if (f.length !== pick || items.some((it) => !it)) { fail(`시험지 ${i + 1}: 문항 수 ${f.length} 또는 없는 id`); return; }
    const ls = count(items, (it) => it.lessonId), d = count(items, (it) => it.diff), t = count(items, (it) => it.type);
    if (Object.keys(ls).length !== 8 || Object.values(ls).some((c) => c < 2 || c > 3)) fail(`시험지 ${i + 1}: 레슨별 ${JSON.stringify(ls)} (레슨마다 2~3문항)`);
    if (d[1] !== 8 || d[2] !== 8 || d[3] !== 4) fail(`시험지 ${i + 1}: 난이도 ${JSON.stringify(d)} (하 8, 중 8, 상 4)`);
    if (t.num !== 2 || t.multi !== 2) fail(`시험지 ${i + 1}: 숫자 입력 ${t.num ?? 0}, 모두 고르기 ${t.multi ?? 0} (2씩)`);
  });
}

// ── 글 규칙(소스 전체) ──
for (let l = 1; l <= 8; l++) {
  const src = readFileSync(`src/content/exams/g2u7l${l}.ts`, "utf8").replace(/\r\n/g, "\n");
  const body = src.split("\n").filter((ln) => !ln.trim().startsWith("//")).join("\n");
  if (/[–—]/.test(body)) fail(`g2u7l${l}.ts: 대시 금지`);
  if (body.includes("교과서")) fail(`g2u7l${l}.ts: '교과서'라는 말을 쓰지 않는다`);
  // 이 풀은 시험지 말투(~이다)다(2026-11-15 사용자 결정). 해요체가 섞이면 알린다.
  const hae = body.match(/[가-힣](해요|어요|아요|이에요|예요|세요|네요|죠)[.?!"]/g);
  if (hae) fail(`g2u7l${l}.ts: 해요체가 섞였다 (${hae.slice(0, 3).join(" ")})`);
}

console.log(`문항 ${pool.length} · 유형 ${JSON.stringify(types)} · 그림 ${pool.filter((it) => it.figure).length} · 시험지 ${forms?.length ?? 0}`);
console.log(bad ? `FAIL ${bad}건` : "PASS");
process.exit(bad ? 1 : 0);
