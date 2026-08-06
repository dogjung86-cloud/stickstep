// s1u1 v1 조립·갤러리 — 스테이징(qa/s1u1-*.ts)을 esbuild 실로드해 전 문항 카드를 렌더한다.
// 부분 검증 모드 내장(스테이징 일부만 있어도 렌더 · 저작 중간 게이트 겸용).
// 출력: tmp/s1u1-full/index.html (+ soc/climate.webp 복사 · href 상대 경로 치환).
// 서빙: 루트 launch.json "s1u1-full"(포트 6021 · 6000은 Chrome ERR_UNSAFE_PORT라 금지).
// 실행: node qa/render-s1u1-full.mjs
import { build } from "esbuild";
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";

async function loadMod(entry) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
}

const SRC = [
  "qa/s1u1-pilot.ts", "qa/s1u1-rest-a.ts", "qa/s1u1-rest-b.ts", "qa/s1u1-rest-c.ts",
  "qa/s1u1-rest-d.ts", "qa/s1u1-rest-e.ts", "qa/s1u1-rest-f.ts",
].filter((p) => existsSync(p));
const allPresent = SRC.length === 7;

const items = [];
for (const p of SRC) {
  const mod = await loadMod(p);
  const pool = mod.POOL_PILOT ?? mod.POOL_REST ?? [];
  items.push(...pool);
  console.log(`${p}: ${pool.length}문항`);
}
items.sort((a, b) => a.id.localeCompare(b.id));
console.log(`총 ${items.length}문항 ${allPresent ? "(전수)" : "(부분)"}`);

const LNAME = {
  s1u1l1: "L1 지형과 기후", s1u1l2: "L2 환경과 생활", s1u1l3: "L3 서로 연결된 세계",
  s1u1l4: "L4 연결의 규모", s1u1l5: "L5 세계화", s1u1l6: "L6 지역화",
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

const cards = items
  .map((it) => {
    const diff = "●".repeat(it.diff ?? 0) + "○".repeat(3 - (it.diff ?? 0));
    const bogi = it.bogi
      ? `<div class="bogi"><b>보기</b>${it.bogi.map((b, i) => `<div>${"ㄱㄴㄷㄹㅁ"[i]}. ${b}</div>`).join("")}</div>`
      : "";
    const opts =
      it.type === "word"
        ? `<div class="bank">${(it.bank ?? []).map((b) => `<span class="chip${b === it.answer ? " ans" : ""}">${b}</span>`).join("")}</div>`
        : `<ol class="opts">${(it.options ?? [])
            .map((o, i) => {
              const isAns = Array.isArray(it.answer) ? it.answer.includes(i) : it.answer === i;
              return `<li class="${isAns ? "ans" : ""}">${o}</li>`;
            })
            .join("")}</ol>`;
    const fig = it.figure ? `<div class="fig">${it.figure.replaceAll('href="/soc/', 'href="./soc/')}</div>` : "";
    return `<div class="card" data-id="${it.id}">
      <div class="meta"><b>${it.id}</b> · ${LNAME[it.lessonId] ?? it.lessonId} · ${it.type}${it.shuffle === false ? " · 순서 고정" : ""} · ${diff}</div>
      <div class="prompt">${it.prompt}</div>
      ${bogi}${fig}${opts}
      <details><summary>해설</summary><div class="ex">${it.explain}</div><div class="core">핵심: ${esc(it.core)}</div></details>
    </div>`;
  })
  .join("\n");

const html = `<!doctype html><meta charset="utf-8"><title>s1u1 v1 시험지 갤러리(${items.length})</title>
<style>
  body{font-family:"Pretendard","Malgun Gothic",sans-serif;background:#F2F4F6;margin:0;padding:18px;color:#191F28}
  .wrap{column-count:2;column-gap:16px;max-width:1160px;margin:0 auto}
  .card{break-inside:avoid;background:#fff;border:1px solid #E5E8EB;border-radius:14px;padding:14px 16px;margin:0 0 16px}
  .meta{font-size:11.5px;color:#8B95A1;margin-bottom:8px}
  .prompt{font-size:14.5px;line-height:1.6;word-break:keep-all}
  .bogi{border:1.4px solid #D9DFE6;border-radius:10px;margin:10px 0;padding:10px 12px;font-size:13.2px;line-height:1.65}
  .bogi b{display:block;font-size:11.5px;color:#8B95A1;margin-bottom:4px}
  .fig{margin:10px 0}.fig svg{width:100%;height:auto;display:block}
  .opts{margin:10px 0 4px;padding-left:22px;font-size:13.6px;line-height:1.7}
  .opts li.ans{color:#0B7B4A;font-weight:700}
  .bank{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
  .chip{border:1.4px solid #D9DFE6;border-radius:999px;padding:4px 12px;font-size:12.8px}
  .chip.ans{background:#E8F7EF;border-color:#0B7B4A;color:#0B7B4A;font-weight:700}
  details{margin-top:8px;font-size:12.8px}summary{color:#4E5968;cursor:pointer}
  .ex{margin-top:6px;line-height:1.65;word-break:keep-all}
  .ex .xh{display:block;font-weight:800;color:#B84A08;margin-top:8px}
  .core{margin-top:8px;color:#2E6EA8;font-weight:700}
  h1{font-size:16px;max-width:1160px;margin:0 auto 14px}
</style>
<h1>s1u1 v1 단원 종합 평가 갤러리 · ${items.length}문항 ${allPresent ? "(전수)" : "(부분)"}</h1>
<div class="wrap">${cards}</div>`;

mkdirSync("tmp/s1u1-full/soc", { recursive: true });
writeFileSync("tmp/s1u1-full/index.html", html);
if (existsSync("public/soc/climate.webp")) copyFileSync("public/soc/climate.webp", "tmp/s1u1-full/soc/climate.webp");
console.log("갤러리: tmp/s1u1-full/index.html");
