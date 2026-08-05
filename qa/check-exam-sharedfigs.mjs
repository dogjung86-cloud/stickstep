// 공유 고정 그림 검사기 — "인자 없는 그림 하나를 여러 문항이 나눠 쓰는" 구조의 위험을 기계 검사한다.
// 실행: node qa/check-exam-sharedfigs.mjs
//
// 왜 있는가(실사고, 2026-08-05 사용자 적발):
//   bioKingdomClueTableFig()의 5계 비교표에서 E행이 A행과 값이 완전히 같아(핵막 ×·세포벽 ○·흡수)
//   표에 세균계가 두 줄, 균계는 아예 없었다. 그 표를 쓰는 u2e337의 정답 보기가
//   "핵막 칸이 ×인 무리는 하나뿐이에요"였는데 실제로는 A·E 두 곳이라 **정답이 거짓**이 됐다.
//   이 결함은 배포본에 살아 있었고 e2e도 check-exam-*도 잡지 못했다(동작·형식만 보므로).
//
// 이 검사기가 보는 것:
//   [FAIL] 표형 그림의 행 중복 — 라벨(첫 칸)만 다르고 나머지 속성이 완전히 같은 두 행.
//          "분류 근거를 읽어라"는 표에서 이런 행 쌍은 정답을 세는 문항을 즉시 깨뜨린다.
//   [WARN] 개수·유일성 주장 문항 — 공유 고정 그림을 쓰면서 보기·해설에 "하나뿐/두 곳/가장 ~"류
//          표현이 있는 문항. 그림 값이 바뀌면 바로 깨지는 자리라 눈검수 대상으로 always 노출한다.
//   [INFO] 공유 인벤토리 — 어떤 그림을 몇 문항이 나눠 쓰는지. 새로 생기면 여기서 보인다.
//
// 의도적으로 같은 속성 행을 둔 그림은 함수 바로 위 주석에 `@sharedfig-allow-dup` 를 적는다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const EXAM_DIR = path.join(ROOT, "src/content/exams");
const UI_DIR = path.join(ROOT, "src/ui");

let fails = 0, warns = 0;
const fail = (m) => { console.log("  FAIL " + m); fails++; };
const warn = (m) => { console.log("  WARN " + m); warns++; };

// ── 1) 시험 파일에서 "인자 없는 그림 호출"을 문항 단위로 센다 ──
const uses = new Map(); // `${file}::${fig}` → { file, fig, ids: [] }
for (const f of fs.readdirSync(EXAM_DIR).filter((x) => x.endsWith(".ts")).sort()) {
  const src = fs.readFileSync(path.join(EXAM_DIR, f), "utf8");
  // 문항 블록을 id 기준으로 자른다(문항 경계를 넘어 세지 않도록).
  const marks = [...src.matchAll(/id:\s*"([^"]+)"/g)];
  for (let i = 0; i < marks.length; i++) {
    const from = marks[i].index;
    const to = i + 1 < marks.length ? marks[i + 1].index : src.length;
    const body = src.slice(from, to);
    const id = marks[i][1];
    for (const m of new Set([...body.matchAll(/([a-zA-Z0-9_]+Fig)\(\)/g)].map((x) => x[1]))) {
      const key = `${f}::${m}`;
      if (!uses.has(key)) uses.set(key, { file: f, fig: m, ids: [] });
      uses.get(key).ids.push(id);
    }
  }
}
const shared = [...uses.values()].filter((u) => u.ids.length >= 2);

// ── 2) 그림 정의를 찾아 표형 데이터의 행 중복을 본다 ──
const uiFiles = fs.readdirSync(UI_DIR).filter((x) => x.endsWith(".ts"))
  .map((x) => ({ name: x, src: fs.readFileSync(path.join(UI_DIR, x), "utf8") }));

/** 그림 함수의 본문과 바로 위 주석을 뽑는다. */
function figBody(fig) {
  for (const { name, src } of uiFiles) {
    const m = src.match(new RegExp(`export function ${fig}\\s*\\(`));
    if (!m) continue;
    // 본문 = 선언부터 다음 최상위 export까지(넉넉히 잘라 배열만 훑는다).
    const start = m.index;
    const next = src.slice(start + 10).search(/\nexport (function|const) /);
    const body = next < 0 ? src.slice(start) : src.slice(start, start + 10 + next);
    const before = src.slice(Math.max(0, start - 400), start);
    return { ui: name, body, allowDup: before.includes("@sharedfig-allow-dup") };
  }
  return null;
}

/** 본문에서 ["a","b",…] 꼴 문자열 행 배열을 모두 뽑아 연속 그룹으로 묶는다. */
function stringRows(body) {
  const rows = [];
  for (const m of body.matchAll(/\[\s*("(?:[^"\\]|\\.)*"\s*,\s*){2,}"(?:[^"\\]|\\.)*"\s*,?\s*\]/g)) {
    const cells = [...m[0].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((c) => c[1]);
    rows.push({ cells, at: m.index });
  }
  // 서로 가까이(1500자 이내) 붙어 있고 칸 수가 같은 행들을 한 표로 본다.
  const groups = [];
  for (const r of rows) {
    const g = groups[groups.length - 1];
    if (g && r.at - g.end < 1500 && g.width === r.cells.length) { g.rows.push(r.cells); g.end = r.at; }
    else groups.push({ width: r.cells.length, rows: [r.cells], end: r.at });
  }
  // 색상 팔레트·좌표 배열은 비교표가 아니다(자석 N/S극 색 쌍을 표로 오인한 실오탐).
  const isPalette = (g) => g.rows.some((cells) => cells.some((c) => /^#[0-9A-Fa-f]{3,8}$/.test(c.trim())));
  return groups.filter((g) => g.rows.length >= 3 && !isPalette(g)); // 표로 볼 만한 크기만
}

const COUNT_WORDS = /하나뿐|한 곳|한 줄|두 곳|두 줄|세 곳|가장 (밝|크|작|무거|가벼|많|적|높|낮)|유일|오직|모두 (고르|골라)/;

console.log("공유 고정 그림 검사 — 인자 없는 그림을 2문항 이상이 공유하는 자리\n");
console.log(`대상: ${shared.length}곳 · 문항 ${shared.reduce((a, b) => a + b.ids.length, 0)}개\n`);

const seenFig = new Set();
for (const u of shared) {
  const info = figBody(u.fig);
  const where = info ? info.ui : "정의 미발견";
  console.log(`[${u.file}] ${u.fig} (${where}) — ${u.ids.length}문항: ${u.ids.join(", ")}`);

  // (a) 표 행 중복 — 라벨만 다르고 속성이 같은 행 쌍
  if (info && !info.allowDup && !seenFig.has(u.fig)) {
    seenFig.add(u.fig);
    for (const g of stringRows(info.body)) {
      const bykey = new Map();
      g.rows.forEach((cells) => {
        const key = cells.slice(1).join(""); // 첫 칸(라벨) 제외
        (bykey.get(key) || bykey.set(key, []).get(key)).push(cells[0]);
      });
      for (const [key, labels] of bykey) {
        if (labels.length >= 2) {
          fail(`${u.fig}: 라벨 ${labels.join("·")} 행의 속성이 완전히 동일 [${key.split("").join(", ")}]`
             + ` — 분류·판독 표에서 구분 불가 행 쌍은 "~은 하나뿐" 류 문항의 정답을 깨뜨린다`
             + ` (의도된 것이면 함수 위 주석에 @sharedfig-allow-dup)`);
        }
      }
    }
  }

  // (b) 개수·유일성 주장 문항은 항상 눈검수 대상으로 노출
  const src = fs.readFileSync(path.join(EXAM_DIR, u.file), "utf8");
  for (const id of u.ids) {
    const i = src.indexOf(`id: "${id}"`);
    const j = src.indexOf('id: "', i + 8);
    const body = src.slice(i, j < 0 ? src.length : j);
    const hit = body.match(COUNT_WORDS);
    if (hit) warn(`${id}: 공유 그림 + 개수·유일성 주장("${hit[0]}") — 그림 값이 바뀌면 즉시 깨지는 자리, 눈으로 대조할 것`);
  }
}

console.log(`\n결과: FAIL ${fails} · WARN ${warns}`);
if (fails) console.log("FAIL은 정답이 깨질 수 있는 자리다 — 그림 데이터를 고치거나 문항을 재설계할 것.");
process.exit(fails ? 1 : 0);
