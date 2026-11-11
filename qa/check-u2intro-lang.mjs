// 중1 Ⅱ 도입 샘플 언어 검사(정적). 새로 쓴 소스의 문자열과 주석을 읽어 규칙 위반을 찾는다.
// (실제 화면에 뜬 글은 e2e-u2intro의 E 구역이 따로 검사한다. 여기서는 화면에 안 뜬 갈래의 글과 주석까지 본다.)
//   문자열: 대시(긴 줄표, 짧은 줄표, 한글 낱말 사이에 낀 붙임표) · '교과서' · 출판사 이름 · '분자' · 이모지 ·
//           이 책에 없는 구조 이름 · 금지 개념 · '미토콘드리아' 표기 · '스틱맨'
//   주석: 대시만(문서와 주석도 대시를 쓰지 않는다)
//   node qa/check-u2intro-lang.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ls = (dir, re) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => re.test(f)).map((f) => `${dir}/${f}`);
const FILES = [
  "src/content/unit2intro.ts",
  "src/styles/opener.css",
  ...ls("src/lessons/steps/opener", /\.ts$/),
  ...ls("qa/sketch/scenes", /^intro-.*\.mjs$/),
  ...ls("qa/sketch", /intro.*\.mjs$/),
  ...ls("qa", /u2intro|audit-u2-hooks|^sheet\.py$|^crop\.py$/),
];

/** 소스를 문자열 조각과 주석 조각으로 나눈다(따옴표 안의 //는 주석이 아니다). 파이썬은 # 주석. */
function split(src, kind) {
  const strings = [];
  const comments = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (kind === "py" && c === "#") {
      const j = src.indexOf("\n", i);
      comments.push(src.slice(i + 1, j < 0 ? n : j));
      i = j < 0 ? n : j;
    } else if (kind !== "py" && c === "/" && d === "/" && kind !== "css" && src[i - 1] !== ":") {
      const j = src.indexOf("\n", i);
      comments.push(src.slice(i + 2, j < 0 ? n : j));
      i = j < 0 ? n : j;
    } else if (kind !== "py" && c === "/" && d === "*") {
      const j = src.indexOf("*/", i + 2);
      comments.push(src.slice(i + 2, j < 0 ? n : j));
      i = j < 0 ? n : j + 2;
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
const STRING_RULES = [
  ["대시", /[—–]|(?<=[가-힣.!?)])\s-\s(?=[가-힣(])/],
  ["'교과서'", /교과서/],
  ["출판사 이름", /미래엔|비상교육|천재교육|동아출판|지학사|금성출판|교학사|YBM/],
  ["'분자'", /분자/],
  ["이모지", /\p{Extended_Pictographic}/u],
  ["이 책에 없는 구조 이름", /세포질|액포|리보솜|소포체|골지|리소좀|염색체|소기관|축삭|가지돌기|뉴런|척수/],
  ["'미토콘드리아' 표기", /미토콘드리아/],
  ["금지 개념", /자연선택|진화/],
  ["'스틱맨'", /스틱맨/],
];
const COMMENT_RULES = [["주석의 대시", /[—–]|(?<=[가-힣])\s-\s(?=[가-힣])/]];
// 검사 스크립트의 규칙 표는 금지어를 '인용'한 것이라 문자열 검사에서 뺀다.
const QUOTED = (file) => /qa\/(check-u2intro-lang|e2e-u2intro)\.mjs$/.test(file);

let checked = 0;
const bad = [];
// 문서(.md)는 통째로 대시만 본다
for (const doc of ["design/u2-intro-samples.md"]) {
  const lines = fs.readFileSync(path.join(ROOT, doc), "utf8").split("\n");
  lines.forEach((line, i) => {
    checked++;
    if (/[—–]|(?<=[가-힣])\s-\s(?=[가-힣])/.test(line)) bad.push(`${doc}:${i + 1} 문서의 대시: ${line.trim().slice(0, 70)}`);
  });
}
for (const file of FILES) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  const kind = file.endsWith(".css") ? "css" : file.endsWith(".py") ? "py" : "js";
  const { strings, comments } = split(src, kind);
  if (!QUOTED(file)) {
    for (const s of strings) {
      if (!HANGUL.test(s)) continue;
      checked++;
      for (const [name, re] of STRING_RULES) if (re.test(s)) bad.push(`${file} 문자열 ${name}: ${s.slice(0, 70)}`);
    }
  }
  for (const c of comments) {
    if (!HANGUL.test(c)) continue;
    checked++;
    for (const [name, re] of COMMENT_RULES) if (re.test(c)) bad.push(`${file} 주석 ${name}: ${c.trim().slice(0, 70)}`);
    // 주석에도 금지 표기는 쓰지 않는다('스틱맨'은 인물 설정 이름처럼 코드 이야기에 쓰일 수 있어 뺀다)
    if (!QUOTED(file) && /미토콘드리아|교과서 출판사/.test(c)) bad.push(`${file} 주석 금지 표기: ${c.trim().slice(0, 70)}`);
  }
}
console.log(`언어 검사: 파일 ${FILES.length}개, 조각 ${checked}개, 위반 ${bad.length}건`);
for (const b of bad) console.log("  ✗", b);
if (bad.length) process.exit(1);
