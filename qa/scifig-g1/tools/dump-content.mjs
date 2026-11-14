// 중1 과학 단원 글에서 개념(concept) 스텝과 정리(recap) 스텝을 뽑아 조사용 마크다운으로 적는다.
// node qa/scifig-g1/tools/dump-content.mjs <출력 폴더>
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] || "tmp-dump";
mkdirSync(out, { recursive: true });
const plain = (v) => String(v ?? "").replace(/<br\s*\/?>/g, " / ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

async function load(n) {
  const r = await build({
    entryPoints: [`src/content/unit${n}.ts`], bundle: true, write: false, format: "esm", platform: "node",
    logLevel: "silent", loader: { ".css": "empty", ".svg": "text" },
    define: { "import.meta.env": JSON.stringify({ BASE_URL: "/", DEV: false }) },
  });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  return mod[`UNIT${n}`];
}

for (let n = 1; n <= 7; n++) {
  const U = await load(n);
  const lines = [`# 단원 ${n}: ${plain(U.title)}`, ""];
  for (const L of U.lessons) {
    lines.push(`## ${L.id} ${plain(L.title)} (${plain(L.standard ?? "")})`, "");
    const types = L.steps.map((s) => s.type).join(" → ");
    lines.push(`흐름: ${types}`, "");
    L.steps.forEach((s, i) => {
      if (s.type === "concept") {
        lines.push(`### [${i}] concept: ${plain(s.title)}`);
        if (s.lead) lines.push(`lead: ${plain(s.lead)}`);
        (s.blocks ?? []).forEach((b, j) => {
          if (b.k === "figure") lines.push(`- (${j}) figure: ${/sketch\/cuts/.test(b.svg) ? "스틱맨 컷" : plain(b.svg).slice(0, 60) || (b.svg.match(/src="([^"]+)"/)?.[1] ?? "svg")} | cap: ${plain(b.cap)}`);
          else if (b.k === "term") lines.push(`- (${j}) term **${plain(b.name)}**: ${plain(b.def)}`);
          else if (b.k === "list") lines.push(`- (${j}) list: ${b.items.map(plain).join(" | ")}`);
          else lines.push(`- (${j}) ${b.k}: ${plain(b.html ?? b.title ?? "")}`);
        });
        lines.push("");
      } else if (s.type === "recap") {
        lines.push(`### [${i}] recap: ${plain(s.title)}`);
        s.cards.forEach((c, j) => {
          lines.push(`- 카드${j} **${plain(c.name)}**: ${plain(c.text)}`);
          if (c.more) lines.push(`  - more: ${plain(c.more).slice(0, 700)}`);
        });
        lines.push("");
      } else {
        const t = plain(s.title ?? s.q ?? s.prompt ?? "");
        lines.push(`- [${i}] ${s.type}${t ? `: ${t.slice(0, 80)}` : ""}`);
      }
    });
    lines.push("");
  }
  writeFileSync(join(out, `u${n}.md`), lines.join("\n"));
  console.log(`u${n}: ${U.lessons.length} lessons`);
}
