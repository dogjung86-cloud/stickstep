// 랩의 다른 느낌 샘플 언어 검사(정적). 새로 쓴 소스의 문자열과 주석을 읽어 규칙 위반을 찾는다(qa/check-u2v5-lang.mjs와 같은 규칙).
//   문자열: 대시 · '교과서' · 출판사 이름 · '분자' · 이모지 · 이 책에 없는 구조 이름 · '미토콘드리아' 표기 · 금지 개념 · '스틱맨'
//   주석과 문서: 대시
//   node qa/check-labstyle-lang.mjs [판정 자료 README 경로 ...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  ...fs.readdirSync(path.join(ROOT, "src/lessons/steps/style")).map((f) => `src/lessons/steps/style/${f}`),
  "src/styles/labstyle.css",
  "public/qa-labstyle.html",
  ...fs.readdirSync(path.join(ROOT, "qa")).filter((f) => /labstyle/.test(f) && fs.statSync(path.join(ROOT, "qa", f)).isFile()).map((f) => `qa/${f}`),
  ...fs.readdirSync(path.join(ROOT, "qa/labstyle")).map((f) => `qa/labstyle/${f}`),
  ...process.argv.slice(2),
];

function split(src, isCss) {
  const strings = [];
  const comments = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/" && !isCss) {
      const j = src.indexOf("\n", i);
      comments.push(src.slice(i + 2, j < 0 ? n : j));
      i = j < 0 ? n : j;
    } else if (c === "/" && d === "*") {
      const j = src.indexOf("*/", i + 2);
      comments.push(src.slice(i + 2, j < 0 ? n : j));
      i = j < 0 ? n : j + 2;
    } else if (c === "#" && /\.py$/.test(isCss)) {
      const j = src.indexOf("\n", i);
      comments.push(src.slice(i + 1, j < 0 ? n : j));
      i = j < 0 ? n : j;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let buf = "";
      while (j < n && src[j] !== c) {
        if (src[j] === "\\") {
          buf += src[j + 1] ?? "";
          j += 2;
          continue;
        }
        if (c !== "`" && src[j] === "\n") break;
        buf += src[j];
        j++;
      }
      strings.push(buf);
      i = j + 1;
    } else i++;
  }
  return { strings, comments };
}

const HANGUL = /[가-힣]/;
const DASH = /[—–]|(?<=[가-힣.!?)])\s-\s(?=[가-힣(])/;
const STRING_RULES = [
  ["대시", DASH],
  ["'교과서'", /교과서/],
  ["출판사 이름", /미래엔|비상교육|천재교육|동아출판|지학사|금성출판|교학사|YBM/],
  ["'분자'", /분자/],
  ["이모지", /\p{Extended_Pictographic}/u],
  ["이 책에 없는 구조 이름", /세포질|액포|리보솜|소포체|골지|리소좀|염색체|소기관/],
  ["'미토콘드리아' 표기", /미토콘드리아/],
  ["금지 개념", /자연선택|진화/],
  ["'스틱맨'", /스틱맨/],
];
// 검사 스크립트의 규칙 표는 금지어를 인용한 것이라 문자열 검사에서 뺀다.
const QUOTED = (file) => /qa\/check-labstyle(-lang)?\.mjs$/.test(file);

let checked = 0;
const hits = [];
for (const rel of FILES) {
  const full = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, "utf8");
  if (/\.(md|html)$/.test(rel)) {
    // 문서와 화면 글: 줄마다 모든 규칙을 본다(표의 구분선과 목록 기호는 대시가 아니다)
    const isDoc = rel.endsWith(".md");
    src.split("\n").forEach((line, i) => {
      if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line)) return;
      const body = line.replace(/^\s*-\s/, "");
      checked++;
      if (DASH.test(body)) hits.push(`${rel}:${i + 1} 대시: ${line.trim().slice(0, 60)}`);
      if (!isDoc) for (const [name, re] of STRING_RULES.slice(1)) if (re.test(body)) hits.push(`${rel}:${i + 1} ${name}: ${line.trim().slice(0, 60)}`);
      if (/\p{Extended_Pictographic}/u.test(body)) hits.push(`${rel}:${i + 1} 이모지: ${line.trim().slice(0, 60)}`);
    });
    continue;
  }
  const { strings, comments } = split(src, rel.endsWith(".css") ? true : rel.endsWith(".py") ? ".py" : false);
  if (!QUOTED(rel)) {
    for (const s of strings) {
      if (!HANGUL.test(s)) continue;
      checked++;
      for (const [name, re] of STRING_RULES) if (re.test(s)) hits.push(`${rel} ${name}: "${s.replace(/\s+/g, " ").slice(0, 70)}"`);
    }
  }
  for (const c of comments) {
    checked++;
    if (DASH.test(c)) hits.push(`${rel} 주석의 대시: ${c.trim().slice(0, 70)}`);
    if (!QUOTED(rel) && /세포질|자연선택이|진화한/.test(c) && !/쓰지 않는다|금지/.test(c)) hits.push(`${rel} 주석의 금지어: ${c.trim().slice(0, 70)}`);
  }
}

console.log(`샘플 언어 검사: 글 ${checked}조각 · 파일 ${FILES.length}개 · 위반 ${hits.length}건`);
hits.forEach((h) => console.log(" -", h));
process.exit(hits.length ? 1 : 0);
