// u2(중1 Ⅱ 생물의 구성과 다양성) 시험 풀 기계 검사 v3(2026-11 전면 재출제 규격). 커밋 전 스캔: node qa/check-exam-u2.mjs
//   규격의 정본은 src/content/exams/u2.ts 머리말과 EXAM_GUIDE.md의 "u2 v3" 소단락이다(g2u7 v3와 같은 방식).
//   보는 것: 문항 수와 id, 레슨별 난이도와 유형, 보기 형식, 고정 순서 문항의 정답 자리, 짧은 라벨형 보기의 순서 고정, 보기별 이유,
//   여덟 시험지(forms)의 무중복과 균형, 같은 시험지에 두지 않을 짝, 그림 출력과 폭, 글 규칙(대시, '교과서', 말투, 쓰지 않는 말, 단위).
import { build } from "esbuild";
import { readFileSync } from "node:fs";

const result = await build({ entryPoints: ["src/content/exams/u2.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const { pool, forms, pick } = mod.U2_EXAM;

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let bad = 0;
const fail = (m) => { console.log("FAIL", m); bad++; };
const count = (arr, f) => arr.reduce((a, x) => { const k = f(x); a[k] = (a[k] || 0) + 1; return a; }, {});

// 레슨별 난이도(하, 중, 상). 합이 64/64/32가 되게 정한 값이다(EXAM_GUIDE "u2 v3").
const LVQ = { 1: [7, 6, 3], 2: [6, 7, 3], 3: [7, 6, 3], 4: [7, 6, 3], 5: [6, 7, 3], 6: [7, 6, 3], 7: [6, 6, 4], 8: [6, 7, 3], 9: [6, 6, 4], 10: [6, 7, 3] };
// 같은 시험지에 함께 두지 않을 문항([레슨, 레슨 안 번호들]). 한 문항이 다른 문항의 답을 알려 주거나 그림과 묻는 것이 거의 같은 묶음이다.
const CONFLICT = [
  [1, [1, 4, 13]], [1, [5, 15]], [1, [8, 14]], [1, [3, 9, 12]],
  [2, [1, 13]], [2, [2, 14, 16]], [2, [3, 10, 11]], [2, [7, 8]],
  [3, [1, 4, 6, 14]], [3, [8, 16]], [3, [2, 10, 13]], [3, [5, 11]],
  [4, [1, 15]], [4, [6, 16]], [4, [7, 11]], [4, [2, 5, 13]],
  [5, [1, 2, 13]], [5, [4, 7]], [5, [5, 11]],
  [6, [3, 5, 8]], [6, [2, 11, 14]], [6, [10, 16]],
  [7, [3, 11]], [7, [7, 15]], [7, [8, 10]], [7, [2, 9, 14]],
  [8, [8, 16]], [8, [1, 6, 14, 15]], [8, [5, 10]], [8, [4, 13]],
  [9, [2, 8, 15]], [9, [10, 16]], [9, [4, 13]],
  [10, [3, 8, 15]], [10, [2, 7, 12]], [10, [6, 16]], [10, [1, 5]],
];
// 쓰지 않는 말(미래엔 본문과 앱 레슨에 없는 말). 출제 지침 6절이 정본이다.
const BAN = [
  "총배율", "시야", "프레파라트", "회전판", "경통", "대물렌즈", "재물대", "조리개", "반사경", "조동나사", "미동나사",
  "리보솜", "소포체", "골지체", "리소좀", "액포", "세포 소기관", "진핵", "원핵세포", "염색체", "유전자", "DNA", "돌연변이", "유전 형질",
  "엽록소", "기공", "광합성 색소", "세포 호흡", "삼투", "학명", "이명법", "계통수", "유연관계", "분류군",
  "진화", "자연선택", "적자생존", "생존 경쟁", "개체군", "군집", "먹이사슬", "먹이그물", "생산자", "소비자", "분해자", "생태계 서비스", "생태 피라미드",
  "종다양성", "유전적 다양성", "생태계다양성", "생물자원", "바이러스", "미생물", "무성생식", "유성생식", "분자", "해면조직",
  "단세포", "다세포", "μm", "µm", "마이크로미터", "축척",
];
const POSREF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];
const LABEL = (o) => /^[㉠㉡㉢㉣㉤①②③④⑤가나다라마A-E()\s,·]+$/.test(o) || /^[㉠㉡㉢㉣㉤]\s/.test(o) || /^\([가-마]\)\s/.test(o);

// ── 문항 수, id, 레슨, 난이도, 유형 ──
if (pool.length !== 160) fail(`문항 수 ${pool.length} (160)`);
pool.forEach((it, i) => {
  const want = `u2e${401 + i}`, lesson = `u2l${Math.floor(i / 16) + 1}`;
  if (it.id !== want) fail(`${it.id}: id는 ${want}이어야 한다(레슨마다 16개씩 이어진다)`);
  if (it.lessonId !== lesson) fail(`${it.id}: lessonId ${it.lessonId} (${lesson})`);
});
for (let l = 1; l <= 10; l++) {
  const a = pool.filter((it) => it.lessonId === `u2l${l}`), d = count(a, (it) => it.diff), t = count(a, (it) => it.type);
  if ([d[1] ?? 0, d[2] ?? 0, d[3] ?? 0].join(",") !== LVQ[l].join(",")) fail(`레슨 ${l}: 난이도 ${JSON.stringify(d)} (하·중·상 ${LVQ[l].join("·")})`);
  if (t.multi !== 2) fail(`레슨 ${l}: 모두 고르기 ${t.multi ?? 0}문항 (2)`);
  const figs = a.filter((it) => it.figure || (it.options ?? []).some((o) => o.includes("<svg"))).length;
  if (figs < 11) fail(`레슨 ${l}: 그림이나 표가 있는 문항 ${figs} (11 이상)`);
}
const types = count(pool, (it) => it.type);
if (Object.keys(types).some((k) => !["mcq", "multi"].includes(k))) fail(`유형 ${JSON.stringify(types)} (mcq, multi만. 숫자 입력은 없다)`);
const diffs = count(pool, (it) => it.diff);
if (diffs[1] !== 64 || diffs[2] !== 64 || diffs[3] !== 32) fail(`난이도 ${JSON.stringify(diffs)} (64/64/32)`);

// ── 문항 단위 ──
const byId = new Map();
for (const it of pool) {
  if (byId.has(it.id)) fail(`${it.id}: id 중복`);
  byId.set(it.id, it);
  for (const k of ["prompt", "explain", "core"]) if (!plain(it[k])) fail(`${it.id}: ${k} 없음`);
  if (!String(it.explain).includes("class='xh'>정답 풀이")) fail(`${it.id}: 해설에 정답 풀이 소제목 없음`);
  const n = it.options?.length ?? 0;
  if (n !== 5) fail(`${it.id}: 보기 ${n}개 (5)`);
  if (new Set(it.options).size !== n) fail(`${it.id}: 보기 중복`);
  const opts = (it.options ?? []).map(plain), isFigOpt = (it.options ?? []).some((o) => o.includes("<svg")), isPair = !!it.optHead;
  const labelish = !isFigOpt && !isPair && opts.every(LABEL) && opts.reduce((s, o) => s + o.length, 0) / Math.max(1, n) <= 16;
  if (it.type === "mcq") {
    if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < n)) fail(`${it.id}: 정답 인덱스 ${it.answer}`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id}: 순서를 고정한 문항인데 첫 보기가 정답이다`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id}: ㄱㄴㄷ 합답은 shuffle: false`);
    if (it.bogi && it.bogi.length !== 3) fail(`${it.id}: 보기 상자 ${it.bogi.length}개 (ㄱㄴㄷ 3개)`);
    if (it.bogi && !String(it.explain).includes("보기 하나씩")) fail(`${it.id}: 합답 해설에 보기 하나씩 판정이 없다`);
    if (labelish && it.shuffle !== false) fail(`${it.id}: 짧은 라벨형 보기인데 순서를 고정하지 않았다`);
  } else {
    const a = it.answer;
    if (!Array.isArray(a) || a.length < 2 || a.length > 4 || a.some((x) => !(x >= 0 && x < n))) fail(`${it.id}: 모두 고르기 정답 ${JSON.stringify(a)}`);
    // 순수 라벨 모두 고르기만 순서를 고정할 수 있고, 그때 첫 라벨은 정답이 아니어야 한다(EXAM_GUIDE 라벨 multi 예외)
    if (it.shuffle === false && (!labelish || a.includes(0))) fail(`${it.id}: 모두 고르기의 순서 고정은 순수 라벨형이고 첫 라벨이 정답이 아닐 때만`);
  }
  if (!it.bogi) {
    if (!Array.isArray(it.optWhy) || it.optWhy.length !== n) fail(`${it.id}: optWhy는 보기 수만큼`);
    else it.optWhy.forEach((w, i) => {
      const isAns = Array.isArray(it.answer) ? it.answer.includes(i) : it.answer === i;
      if (!w && (it.type === "multi" || !isAns)) fail(`${it.id}: ${i + 1}번째 보기의 이유가 없다`);
    });
  }
  const pairs = (it.options ?? []).filter((o) => o.includes('class="ex-pair"')).length, figs = (it.options ?? []).filter((o) => o.includes('class="ex-optfig"')).length;
  if (it.optHead) {
    if (pairs !== n) fail(`${it.id}: 머리줄이 있는데 짝짓기 보기가 아니다`);
    for (const o of it.options) if ((o.match(/<span>/g) || []).length !== it.optHead.length) fail(`${it.id}: 짝짓기 칸 수가 머리줄과 다르다`);
  } else if (pairs) fail(`${it.id}: 짝짓기 보기인데 머리줄이 없다`);
  if (figs && figs !== n) fail(`${it.id}: 그림 보기와 글 보기가 섞였다`);
  if (figs && !it.optCols) fail(`${it.id}: 그림 보기인데 optCols가 없다`);
  // 글 규칙(화면에 나오는 글)
  const all = [it.prompt, ...(it.bogi ?? []), ...(it.options ?? []).filter((o) => !o.includes("<svg")), it.explain, it.core, ...(it.optWhy ?? []), ...(it.optHead ?? [])].map((x) => String(x ?? "")).join("\n");
  for (const w of BAN) if (all.includes(w)) fail(`${it.id}: 쓰지 않는 말 "${w}"`);
  for (const w of POSREF) if (all.includes(w)) fail(`${it.id}: 보기를 자리로 가리킨다("${w}")`);
  if (/[①②③④⑤]/.test(String(it.explain) + (it.optWhy ?? []).join(""))) fail(`${it.id}: 해설이나 보기별 이유가 보기를 번호로 가리킨다`);
  const tags = (all.match(/<[^>]+>/g) || []).filter((t) => !/^<\/?(u|br|b|sub|sup)>$/.test(t) && !/^<span class=('xh'|"ex-pair"|"ex-optfig")>$/.test(t) && !/^<\/?span>$/.test(t) && !/^<table class="ex-table">|^<\/?(tr|th|td|table)>$/.test(t));
  if (tags.length) fail(`${it.id}: 화면에서 사라지는 꺾쇠 글 ${tags.slice(0, 3).join(" ")}(〈보기〉처럼 쓴다)`);
}

// ── 그림 ──
for (const it of pool) {
  for (const [where, s] of [["그림", it.figure ?? ""], ...(it.options ?? []).map((o, i) => [`보기 ${i + 1}`, o])]) {
    if (!s.includes("<svg")) continue;
    if (/NaN|undefined|Infinity/.test(s)) fail(`${it.id} ${where}: 그림에 NaN, undefined, Infinity`);
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(s);
    if (!vb) fail(`${it.id} ${where}: viewBox 없음`);
    else if (where === "그림" && +vb[1] > 380) fail(`${it.id}: 그림 폭 ${vb[1]} (380 이하. 폰의 그림 칸에서 글자가 작아진다)`);
    else if (where === "그림" && +vb[2] > 280) fail(`${it.id}: 그림 높이 ${vb[2]} (280 이하)`);
    if (/μm|µm|축척/.test(s)) fail(`${it.id} ${where}: 그림에 단위나 축척 막대`);
    if (s.includes('loading="lazy"')) fail(`${it.id}: lazy 금지`);
  }
  if (/<img/.test(String(it.figure ?? ""))) fail(`${it.id}: 이 풀은 사진을 쓰지 않는다(코드 그림만)`);
}

// ── 여덟 시험지 ──
if (!Array.isArray(forms) || forms.length !== 8) fail(`forms ${forms?.length} (8)`);
else {
  const all = forms.flat();
  if (new Set(all).size !== 160 || all.length !== 160) fail(`시험지끼리 겹치거나 빠진 문항이 있다(서로 다른 문항 ${new Set(all).size}, 합 ${all.length})`);
  const clash = new Set();
  for (const [l, ns] of CONFLICT) for (const x of ns) for (const y of ns) if (x < y) clash.add(`u2e${400 + (l - 1) * 16 + x}|u2e${400 + (l - 1) * 16 + y}`);
  forms.forEach((f, i) => {
    const items = f.map((id) => byId.get(id));
    if (f.length !== pick || items.some((it) => !it)) { fail(`시험지 ${i + 1}: 문항 수 ${f.length} 또는 없는 id`); return; }
    const ls = count(items, (it) => it.lessonId), d = count(items, (it) => it.diff), t = count(items, (it) => it.type);
    if (Object.keys(ls).length !== 10 || Object.values(ls).some((c) => c !== 2)) fail(`시험지 ${i + 1}: 레슨별 ${JSON.stringify(ls)} (레슨마다 2문항)`);
    if (d[1] !== 8 || d[2] !== 8 || d[3] !== 4) fail(`시험지 ${i + 1}: 난이도 ${JSON.stringify(d)} (하 8, 중 8, 상 4)`);
    if ((t.multi ?? 0) < 2 || (t.multi ?? 0) > 3) fail(`시험지 ${i + 1}: 모두 고르기 ${t.multi ?? 0} (2~3)`);
    for (let x = 0; x < f.length; x++) for (let y = x + 1; y < f.length; y++) {
      const [a, b] = [f[x], f[y]].sort();
      if (clash.has(`${a}|${b}`)) fail(`시험지 ${i + 1}: ${a}와 ${b}는 같은 시험지에 두지 않는다`);
    }
  });
}

// ── 글 규칙(소스 전체) ──
for (let l = 1; l <= 10; l++) {
  const src = readFileSync(`src/content/exams/u2l${l}.ts`, "utf8").replace(/\r\n/g, "\n");
  const body = src.split("\n").filter((ln) => !ln.trim().startsWith("//")).join("\n");
  if (/[–—]/.test(src)) fail(`u2l${l}.ts: 대시 금지`);
  if (body.includes("교과서")) fail(`u2l${l}.ts: '교과서'라는 말을 쓰지 않는다`);
  // 줄바꿈은 따지지 않는다: 이 리포는 core.autocrlf=true라 새로 체크아웃하면 CRLF가 된다. 풀은 esbuild로 읽으니 영향이 없다(g2u7 검사와 같음).
  // 이 풀은 시험지 말투(~이다)다(g2u7 v3와 같은 방식). 해요체가 섞이면 알린다.
  const hae = body.match(/[가-힣](해요|어요|아요|이에요|예요|세요|네요|죠)[.?!"]/g);
  if (hae) fail(`u2l${l}.ts: 해요체가 섞였다 (${hae.slice(0, 3).join(" ")})`);
}

console.log(`문항 ${pool.length} · 유형 ${JSON.stringify(types)} · 그림 ${pool.filter((it) => it.figure).length} · 시험지 ${forms?.length ?? 0}`);
console.log(bad ? `FAIL ${bad}건` : "PASS");
process.exit(bad ? 1 : 0);
