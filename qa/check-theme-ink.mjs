// 발바닥(밑창·도장·헤더 칩) 잉크가 단원 테마색과 어긋나지 않는지 기계 검사.
//   node qa/check-theme-ink.mjs
//
// 왜 필요한가: 지도 밴드·지형·노드 링은 CSS 토큰(--subj-*)을 쓰는데 **밑창만** soleMap.ts의
// THEME_INK 표를 본다. 새 단원 테마를 등록할 때 이 표를 빠뜨리면 발바닥만 토스 블루 폴백이 된다.
// 같은 사고가 두 번 났다 — his(2026-07-21) · body(2026-07-26). 그래서 검사로 못 박는다.
import { readFileSync } from "node:fs";

const home = readFileSync("src/screens/home.ts", "utf8");
const sole = readFileSync("src/ui/soleMap.ts", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");

const UNIT_THEME = {};
for (const m of home.match(/const UNIT_THEME[^=]*=\s*\{([^}]*)\}/s)[1].matchAll(/(\w+):\s*"([^"]*)"/g)) {
  UNIT_THEME[m[1]] = m[2];
}
const THEME_INK = {};
for (const m of sole.match(/const THEME_INK[^=]*=\s*\{(.*?)\n\};/s)[1].matchAll(/(\w+):\s*"(#[0-9A-Fa-f]{6})"/g)) {
  THEME_INK[m[1]] = m[2].toUpperCase();
}
const SUBJ = {};
for (const m of tokens.matchAll(/--subj-(\w+):\s*(#[0-9A-Fa-f]{6})/g)) {
  if (!m[1].endsWith("-press") && !m[1].endsWith("-tint")) SUBJ[m[1]] = m[2].toUpperCase();
}

let fail = 0;
const ok = (cond, label) => {
  console.log(`  ${cond ? "✓" : "✗"} ${label}`);
  if (!cond) fail++;
};

console.log("[1] UNIT_THEME의 모든 테마가 THEME_INK에 등록됐는지");
const themes = [...new Set(Object.values(UNIT_THEME))].filter(Boolean).sort();
for (const t of themes) ok(THEME_INK[t] !== undefined, `${t}: THEME_INK 등록`);

console.log("\n[2] --subj-<테마> 토큰이 있는 테마는 잉크가 그 토큰과 같아야 한다");
let checked = 0;
for (const t of themes) {
  if (!SUBJ[t] || THEME_INK[t] === undefined) continue;
  checked++;
  ok(THEME_INK[t] === SUBJ[t], `${t}: 잉크 ${THEME_INK[t]} = --subj-${t} ${SUBJ[t]}`);
}
if (!checked) console.log("  (대조할 토큰 없음)");

console.log(`\n테마 ${themes.length}종 · 실패 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
