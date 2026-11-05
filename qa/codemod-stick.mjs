// 인라인 스틱맨 일괄 전환: <circle 머리/> + <path 몸통/> 한 쌍을 ${inkStick(...)} 호출로 바꾼다.
// node qa/codemod-stick.mjs --only "<파일 정규식>"            드라이런(결정 목록만 출력)
// node qa/codemod-stick.mjs --only "<파일 정규식>" --write    실제 수정
// 대상 과목은 사용자 확정 범위만 넘긴다(2026-11 현재 과학만 적용, 수학·사회·역사 금지).
// 원칙: 확실한 것만 바꾼다. class·id·style이 달린 머리/몸(애니메이션 대상), 그라데이션 머리, 템플릿 안이 아닌
// 문자열은 건너뛰고 보고한다. 감싸는 <g>는 건드리지 않아 CSS 애니메이션·transform이 그대로 산다.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const onlyIdx = process.argv.indexOf("--only");
if (onlyIdx < 0 || !process.argv[onlyIdx + 1]) {
  console.error("--only \"<파일 정규식>\" 필수: 대상 과목 파일을 명시하세요.");
  process.exit(1);
}
const ONLY = new RegExp(process.argv[onlyIdx + 1]);
const EXCLUDE = /ui[\\/](stickArt|stickParts|stick|mapDecor)\.ts$|core[\\/]icons\.ts$|ui[\\/]art\.generated\.ts$/;

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".ts") && !EXCLUDE.test(p) && ONLY.test(relative(ROOT, p).replace(/\\/g, "/"))) files.push(p);
  }
})(join(ROOT, "src"));

/** 일반사회(무성별 기본형 가드, SOC_GUIDE) = 민머리 고정. */
const PLAIN_FILE = /(hookSoc(7|8|9|10|11|12)|socFigures(7|8|9|10|11|12)|examFiguresSoc|Lab)\.ts$/;
const NEUTRAL_LABS = /(suffrageLab|principleLab|kimchiLab|dilemmaLab|lifePathLab|electLab|policyLab|shieldLab|trialLab|fairTrialLab|workRightLab)\.ts$/;
/** 역사: 시대감을 해치지 않게 짧은 검은 머리 계열만. */
const HIS_FILE = /(hookHis\d*|hisFigures)\.ts$/;

const LOOKS_ANY = ["crop", "ponytail", "swept", "bob", "spiky", "curly", "long", "fringe", "pigtails", "bun", "beanie", "cap"];
const LOOKS_HIS = ["crop", "bun", "fringe", "swept"];

// ── 간이 렉서: 각 위치가 템플릿 문자열 "텍스트" 안인지 표시한다 ──
function templateMask(src) {
  const mask = new Uint8Array(src.length);
  const outer = new Int32Array(src.length).fill(-1); // 가장 바깥 템플릿 시작
  const stack = []; // "t" 템플릿, "e" ${ } 식, "b" 일반 {
  let i = 0;
  let outerStart = -1;
  const top = () => stack[stack.length - 1];
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (top() === "t") {
      mask[i] = 1;
      outer[i] = outerStart;
      if (c === "\\") { mask[i + 1] = 1; outer[i + 1] = outerStart; i += 2; continue; }
      if (c === "`") { stack.pop(); if (!stack.includes("t")) outerStart = -1; i++; continue; }
      if (c === "$" && n === "{") { stack.push("e"); i += 2; continue; }
      i++;
      continue;
    }
    if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i = src.indexOf("*/", i + 2) + 2; continue; }
    if (c === "'" || c === '"') {
      const q = c;
      i++;
      while (i < src.length && src[i] !== q) { if (src[i] === "\\") i++; i++; }
      i++;
      continue;
    }
    if (c === "`") { if (!stack.includes("t")) outerStart = i; stack.push("t"); i++; continue; }
    if (c === "{") { stack.push("b"); i++; continue; }
    if (c === "}") { stack.pop(); i++; continue; }
    i++;
  }
  return { mask, outer };
}

const attr = (s, k) => {
  const m = new RegExp(`(?:^|\\s)${k}="([^"]*)"`).exec(s);
  return m ? m[1] : null;
};

// ${식} 값을 표본 숫자로 계산(뼈대 판정용)
function evalExpr(expr) {
  const scope = new Proxy({}, {
    has: () => true,
    get: (_, k) => {
      if (k === Symbol.unscopables) return undefined;
      if (k === "Math") return Math;
      if (["r", "R"].includes(k)) return 8;
      if (["s", "k", "d", "dir", "flip", "side", "sgn", "sign", "f", "t"].includes(k)) return 1;
      return 100;
    },
  });
  try {
    const v = new Function("scope", `with(scope){ return (${expr}); }`)(scope);
    return typeof v === "number" && Number.isFinite(v) ? v : NaN;
  } catch {
    return NaN;
  }
}
const subst = (s) => s.replace(/\$\{([^}]+)\}/g, (_, e) => String(evalExpr(e)));

function parseSubs(d) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const subs = [];
  let cur = null;
  let x = 0;
  let y = 0;
  let cmd = "";
  let i = 0;
  const isNum = (t) => t !== undefined && !/[a-zA-Z]/.test(t);
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    if (!isNum(toks[i])) cmd = toks[i++];
    switch (cmd) {
      case "M": case "m": {
        const a = num(); const b = num();
        x = cmd === "m" ? x + a : a;
        y = cmd === "m" ? y + b : b;
        cur = [[x, y]];
        subs.push(cur);
        cmd = cmd === "M" ? "L" : "l";
        break;
      }
      case "L": x = num(); y = num(); cur?.push([x, y]); break;
      case "l": x += num(); y += num(); cur?.push([x, y]); break;
      case "H": x = num(); cur?.push([x, y]); break;
      case "h": x += num(); cur?.push([x, y]); break;
      case "V": y = num(); cur?.push([x, y]); break;
      case "v": y += num(); cur?.push([x, y]); break;
      case "Q": { num(); num(); x = num(); y = num(); cur?.push([x, y]); break; }
      case "q": { const a = num(); const b = num(); cur?.push([x + a, y + b]); x += num(); y += num(); cur?.push([x, y]); break; }
      case "C": { num(); num(); num(); num(); x = num(); y = num(); cur?.push([x, y]); break; }
      case "c": { num(); num(); const a = num(); const b = num(); cur?.push([x + a, y + b]); x += num(); y += num(); cur?.push([x, y]); break; }
      default: return null; // 호(a)·S·T 등은 사람 뼈대가 아니다
    }
  }
  return subs;
}

function isPerson(cx, cy, r, d) {
  if (!(r >= 3 && r <= 24)) return "r 범위";
  const subs = parseSubs(d);
  if (!subs) return "미지원 명령";
  if (subs.length < 3) return "서브패스 부족";
  let torso = 0;
  let above = 0;
  let maxD = 0;
  for (const s of subs) {
    const [sx, sy] = s[0];
    const dist = Math.hypot(sx - cx, sy - cy);
    const e = s[s.length - 1];
    const len = Math.hypot(e[0] - sx, e[1] - sy);
    if (dist >= r * 0.72 && dist <= r * 1.55 && sy > cy && len >= r * 0.8) torso++;
    if (sy < cy - r * 0.25 && dist >= r * 0.72) above++;
    for (const p of s) maxD = Math.max(maxD, Math.hypot(p[0] - cx, p[1] - cy));
  }
  if (!torso) return "목에서 시작하는 몸통 없음";
  if (above >= 2) return "머리 위 서브패스(광선류)";
  if (maxD > r * 9) return "뼈대가 너무 큼";
  if (maxD < r * 2.2) return "뼈대가 너무 작음";
  return null;
}

const lum = (hex) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.3 * r + 0.59 * g + 0.11 * b;
};

const asExpr = (v) => {
  const m = /^\$\{([^}]+)\}$/.exec(v);
  if (m) return m[1];
  if (/^-?[\d.]+$/.test(v)) return v;
  return null;
};
const quoteBody = (d) => (d.includes("${") ? `\`${d}\`` : `"${d}"`);
const hashStr = (s) => { let h = 5381; for (const c of s) h = (Math.imul(h, 33) ^ c.charCodeAt(0)) >>> 0; return h; };

const CIRCLE_RE = /<circle\b([^>]*?)\/>/g;
const report = { converted: 0, files: 0, skips: {} };
const skipLog = [];

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  let src = readFileSync(file, "utf8");
  const { mask, outer } = templateMask(src);
  const stickConst = /const STICK\s*=\s*`[^`]*stroke="(#[0-9A-Fa-f]+)"/.exec(src)?.[1] ?? null;
  const edits = [];
  const perLiteral = new Map();

  CIRCLE_RE.lastIndex = 0;
  let m;
  while ((m = CIRCLE_RE.exec(src))) {
    const circleAttrs = m[1];
    const cxS = attr(circleAttrs, "cx");
    const cyS = attr(circleAttrs, "cy");
    const rS = attr(circleAttrs, "r");
    if (cxS === null || cyS === null || rS === null) continue;
    const tail = src.slice(m.index + m[0].length, m.index + m[0].length + 700);
    const pm = /^\s*(?:<!--[^>]*-->\s*)?<path\b([^>]*?)\/>/.exec(tail);
    if (!pm) continue;
    const pathAttrs = pm[1];
    const d = attr(pathAttrs, "d");
    if (!d) continue;
    const cx = parseFloat(subst(cxS));
    const cy = parseFloat(subst(cyS));
    const r = parseFloat(subst(rS));
    const reason = isPerson(cx, cy, r, subst(d));
    const line = src.slice(0, m.index).split("\n").length;
    if (reason) {
      if ((d.match(/M/g) || []).length >= 3 && r >= 4 && r <= 20) skipLog.push(`${rel}:${line} [비인물 판정: ${reason}] r=${rS} d=${d.slice(0, 60)}`);
      continue;
    }
    // 이하 사람으로 판정 — 안전 조건 확인
    const skip = (why) => {
      report.skips[why] = (report.skips[why] || 0) + 1;
      skipLog.push(`${rel}:${line} [보류: ${why}] ${circleAttrs.trim().slice(0, 50)} d=${d.slice(0, 50)}`);
    };
    if (!mask[m.index]) { skip("템플릿 문자열 밖"); continue; }
    if (/\b(class|id|style|transform|opacity|filter)=/.test(circleAttrs)) { skip("머리에 class·id·style"); continue; }
    if (/\b(class|id|style|transform|opacity|filter|marker-\w+)=/.test(pathAttrs)) { skip("몸에 class·id·style"); continue; }
    const fill = attr(circleAttrs, "fill");
    if (fill && /^url\(/.test(fill)) { skip("그라데이션 머리"); continue; }
    if (fill && /^\$\{/.test(fill)) { skip("머리 색 변수"); continue; }
    const xE = asExpr(cxS);
    const yE = asExpr(cyS);
    const rE = asExpr(rS);
    if (xE === null || yE === null || rE === null) { skip("좌표 표현 복합"); continue; }

    // 잉크 색(다크 무대 판정): 머리 stroke → 몸 stroke → 감싸는 g
    const before = src.slice(Math.max(0, m.index - 220), m.index);
    const gm = /<g\b([^>]*)>\s*(?:<!--[^>]*-->\s*)?$/.exec(before);
    const gAttrs = gm ? gm[1] : "";
    let ink = attr(circleAttrs, "stroke") ?? attr(pathAttrs, "stroke") ?? attr(gAttrs, "stroke");
    if (!ink && /\$\{STICK\}/.test(gAttrs)) ink = stickConst;
    const lInk = lum(ink);
    const lHead = lum(fill);
    if (fill && lHead !== null) {
      // 채도 강한 머리(파랑 등)는 사람 머리가 아닐 수 있어 보류
      const h = fill.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const [a, b, c] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
      if (Math.max(a, b, c) - Math.min(a, b, c) > 70) { skip("채도 높은 머리색"); continue; }
    }
    const dark = (lInk !== null && lInk > 0.6) || (lHead !== null && lHead < 0.3);

    // 뒤따르는 원본 얼굴·머리 소품 감지
    const afterPair = tail.slice(pm.index + pm[0].length);
    const follow = afterPair.replace(/^\s*(<\/g>\s*)?/, "");
    let hasFace = false;
    let hasTopProp = false;
    const elRe = /^\s*<(circle|path|ellipse|rect)\b([^>]*?)\/>/;
    let rest = follow;
    for (let k = 0; k < 4; k++) {
      const em = elRe.exec(rest);
      if (!em) break;
      const [, tag, a] = em;
      let ex = NaN;
      let ey = NaN;
      if (tag === "circle" || tag === "ellipse") {
        ex = parseFloat(subst(attr(a, "cx") ?? ""));
        ey = parseFloat(subst(attr(a, "cy") ?? ""));
        const er = parseFloat(subst(attr(a, "r") ?? attr(a, "rx") ?? ""));
        if (Math.hypot(ex - cx, ey - cy) < r && er <= Math.max(2.4, r * 0.3)) hasFace = true;
        else if (Math.hypot(ex - cx, ey - cy) < r * 1.7 && ey < cy) hasTopProp = true;
      } else if (tag === "path") {
        const dd = subst(attr(a, "d") ?? "");
        const pts = /M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(dd);
        if (pts) {
          ex = parseFloat(pts[1]);
          ey = parseFloat(pts[2]);
          const near = Math.hypot(ex - cx, ey - cy) < r;
          if (near && (attr(a, "fill") === "none" || !attr(a, "fill"))) hasFace = true;
          else if (Math.hypot(ex - cx, ey - cy) < r * 1.7 && ey < cy + r * 0.2) hasTopProp = true;
        }
      } else if (tag === "rect") {
        ex = parseFloat(subst(attr(a, "x") ?? ""));
        ey = parseFloat(subst(attr(a, "y") ?? ""));
        if (Math.hypot(ex - cx, ey - cy) < r * 1.9 && ey < cy) hasTopProp = true;
      }
      rest = rest.slice(em[0].length);
    }

    // 룩: 템플릿(같은 상태의 그림) 안 순서 + 파일·함수 해시 — 같은 장면의 상태 변형끼리 같은 사람으로 유지
    const lit = outer[m.index];
    const idx = perLiteral.get(lit) ?? 0;
    perLiteral.set(lit, idx + 1);
    const fnName = /(?:^|\n)(?:export\s+)?(?:const|function)\s+([A-Za-z0-9_$]+)[^\n]*\n(?:(?!\n(?:export\s+)?(?:const|function)\s)[\s\S])*$/.exec(src.slice(0, lit < 0 ? m.index : lit))?.[1] ?? rel;
    let look = null;
    const neutral = (PLAIN_FILE.test(rel) && (/hookSoc|socFigures|examFiguresSoc/.test(rel) || NEUTRAL_LABS.test(rel)));
    if (!neutral && !hasTopProp) {
      const set = HIS_FILE.test(rel) ? LOOKS_HIS : LOOKS_ANY;
      look = set[(hashStr(fnName) + idx) % set.length];
    }
    const opts = [];
    if (look) opts.push(`look: "${look}"`);
    if (hasFace) opts.push(`mood: "none"`);
    if (dark) opts.push(`scheme: "dark"`);
    const call = `\${inkStick(${xE}, ${yE}, ${rE}, ${quoteBody(d)}${opts.length ? `, { ${opts.join(", ")} }` : ""})}`;
    edits.push({ start: m.index, end: m.index + m[0].length + pm.index + pm[0].length, call, line, look, hasFace, dark });
  }

  if (!edits.length) continue;
  report.converted += edits.length;
  report.files++;
  console.log(`${String(edits.length).padStart(3)} ${rel}`);
  if (WRITE) {
    for (const e of [...edits].reverse()) src = src.slice(0, e.start) + e.call + src.slice(e.end);
    if (!/from "[^"]*ui\/stickArt"|from "\.\/stickArt"/.test(src)) {
      let rp = relative(dirname(file), join(ROOT, "src/ui/stickArt")).replace(/\\/g, "/");
      if (!rp.startsWith(".")) rp = "./" + rp;
      const imp = `import { inkStick } from "${rp}";\n`;
      const imports = [...src.matchAll(/^import [^\n]*\n/gm)];
      const last = imports.pop();
      if (last) src = src.slice(0, last.index + last[0].length) + imp + src.slice(last.index + last[0].length);
      else {
        // 첫 코드 줄 앞(머리 주석 뒤)에 넣는다
        const first = /^(?:﻿)?(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/\s*\n)*/.exec(src);
        const at = first ? first[0].length : 0;
        src = src.slice(0, at) + imp + src.slice(at);
      }
    } else if (!/\binkStick\b[^(]*from/.test(src) && !/import \{[^}]*\binkStick\b[^}]*\} from/.test(src)) {
      src = src.replace(/import \{([^}]*)\} from "([^"]*(?:ui\/|\.\/)stickArt)";/, (_, a, b) => `import {${a.trimEnd()}, inkStick } from "${b}";`);
    }
    writeFileSync(file, src);
  }
}

console.log(`\n합계: ${report.converted}명 / ${report.files}파일${WRITE ? " (수정 완료)" : " (드라이런)"}`);
console.log("보류 사유:", JSON.stringify(report.skips));
console.log("\n--- 보류·비인물 목록 ---");
for (const l of skipLog) console.log(l);
