// 중1 Ⅱ v5 언어 검사(정적). 새로 쓴 소스의 문자열과 주석을 읽어 규칙 위반을 찾는다.
// (실제 화면에 뜬 글은 e2e-u2v5의 D 구역이 따로 검사한다. 여기서는 화면에 안 뜬 갈래의 글까지 본다.)
//   문자열: 대시(긴 줄표, 짧은 줄표, 한글 낱말 사이에 낀 붙임표) · '교과서' · 출판사 이름 · '분자' · 이모지 ·
//           이 책에 없는 구조 이름(세포질, 액포 등) · 현미경 부품 이름 · 금지 개념 · '미토콘드리아' 표기 · '스틱맨'
//   주석: 대시만(문서와 주석도 대시를 쓰지 않는다)
//   node qa/check-u2v5-lang.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  "src/content/unit2v5.ts",
  "src/ui/bio6Kit.ts",
  "src/ui/bio6Figures.ts",
  "src/ui/bio6Web.ts",
  "src/styles/bio6.css",
  ...fs.readdirSync(path.join(ROOT, "src/lessons/steps/bio6")).filter((f) => f.endsWith(".ts")).map((f) => `src/lessons/steps/bio6/${f}`),
  ...fs.readdirSync(path.join(ROOT, "qa")).filter((f) => /u2v5|make-bio6|audit-g1-labs|shot-g1-lab-play/.test(f)).map((f) => `qa/${f}`),
  "design/u2v5-plan.md",
];

/** 소스를 문자열 조각과 주석 조각으로 나눈다(따옴표 안의 //는 주석이 아니다). */
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
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let buf = "";
      while (j < n && src[j] !== c) {
        if (src[j] === "\\") {
          buf += src[j + 1] ?? "";
          j += 2;
          continue;
        }
        if (c !== "`" && src[j] === "\n") break; // 닫히지 않은 따옴표(정규식 안의 따옴표 따위)
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
  ["이 책에 없는 구조 이름", /세포질|액포|리보솜|소포체|골지|리소좀|염색체|소기관/],
  ["'미토콘드리아' 표기", /미토콘드리아/],
  ["현미경 부품 이름", /조동|미동|대물렌즈|접안렌즈|재물대|조리개/],
  ["금지 개념", /자연선택|진화/],
  ["'스틱맨'", /스틱맨/],
];
const COMMENT_RULES = [["주석의 대시", /[—–]|(?<=[가-힣])\s-\s(?=[가-힣])/]];
// 검사 스크립트의 규칙 표는 금지어를 '인용'한 것이라 문자열 검사에서 뺀다.
const QUOTED = (file) => /qa\/(check-u2v5-lang|e2e-u2v5)\.mjs$/.test(file);
// v3 원문에서 고쳐 낼 문장을 그대로 적어 둔 것(patch의 앞쪽 글)도 인용이다: v3 파일에 똑같이 있는 문자열은 건너뛴다.
const V3_SRC = fs.readFileSync(path.join(ROOT, "src/content/unit2v3.ts"), "utf8");

let checked = 0;
const hits = [];
for (const rel of FILES) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, "utf8");
  if (rel.endsWith(".md")) {
    // 문서: 대시만 본다(표의 구분선 |---|과 목록 기호는 대시가 아니다)
    src.split("\n").forEach((line, i) => {
      if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line)) return;
      const body = line.replace(/^\s*-\s/, "");
      if (/[—–]|(?<=[가-힣.!?)])\s-\s(?=[가-힣(])/.test(body)) hits.push(`${rel}:${i + 1} 문서의 대시: ${line.trim().slice(0, 60)}`);
      checked++;
    });
    continue;
  }
  const { strings, comments } = split(src, rel.endsWith(".css"));
  if (!QUOTED(rel)) {
    for (const s of strings) {
      if (!HANGUL.test(s)) continue;
      if (rel === "src/content/unit2v5.ts" && V3_SRC.includes(s)) continue;
      checked++;
      for (const [name, re] of STRING_RULES) if (re.test(s)) hits.push(`${rel} ${name}: "${s.replace(/\s+/g, " ").slice(0, 70)}"`);
    }
  }
  for (const c of comments) {
    checked++;
    for (const [name, re] of COMMENT_RULES) if (re.test(c)) hits.push(`${rel} ${name}: ${c.trim().slice(0, 70)}`);
  }
}

console.log(`언어 검사: 글 ${checked}조각 · 파일 ${FILES.length}개 · 위반 ${hits.length}건`);
hits.forEach((h) => console.log(" -", h));
process.exit(hits.length ? 1 : 0);
