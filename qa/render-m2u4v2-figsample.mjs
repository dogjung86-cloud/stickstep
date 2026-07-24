// m2u4 v2 신작·확장 헬퍼 저작 "전" 샘플 갤러리(m2u5 관행) — 확대 사이클 실세팅으로 렌더.
// node qa/render-m2u4v2-figsample.mjs → tmp/m2u4v2-figsample/index.html
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

const result = await build({
  entryPoints: ["src/ui/examFiguresMath.ts"],
  bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
});
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const {
  m2ExamIsoLadderFig, mExamFoldFig, m2ExamFoldCornerFig, m2ExamMidPerpFig,
  m2ExamRightPerpFig, m2ExamIsoOIFig, m2ExamEquiTriFig, m2ExamCenterFig, m2ExamEqAreaFig,
} = mod;

const samples = [
  ["슬롯 33 — FC phi=32(직사 모서리 접기 · ∠AEF=61 검산)", m2ExamFoldCornerFig({ phi: 32, phiLabel: "32°", askE: "x°" })],
  ["슬롯 46 — MP apex=76(중점 수선 RHS · ∠BMD=38)", m2ExamMidPerpFig({ apex: 76, marks: [{ at: "A", label: "76°" }, { at: "BMD", label: "x°" }] })],
  ["슬롯 53 — MP 역산 apex=52(∠BMD=26 라벨 → ∠A)", m2ExamMidPerpFig({ apex: 52, marks: [{ at: "BMD", label: "26°" }, { at: "A", label: "x°" }] })],
  ["슬롯 52 — RP bd=16·ce=9(직각이등변 수선 · DE=7)", m2ExamRightPerpFig({ bd: 16, ce: 9, bdLabel: "16 cm", ceLabel: "9 cm", askDE: "x cm" })],
  ["슬롯 100 — OI apex=68(I가 O보다 위 검산 · ∠OBI=6)", m2ExamIsoOIFig({ apex: 68, apexLabel: "68°" })],
  ["슬롯 120 — ET(정삼각형 셋 + □DAFE)", m2ExamEquiTriFig()],
  ["슬롯 72 — CTO 둔각 B38·C27(외심 외부 · ∠BOC=130)", m2ExamCenterFig({ kind: "O", B: 38, C: 27, segs: ["B", "C"], marks: [{ at: "B", label: "38°" }, { at: "C", label: "27°" }, { at: "BOC", label: "x°" }] })],
  ["슬롯 87 — CTI paraLine(내심 평행선 · 둘레 치환)", m2ExamCenterFig({ kind: "I", B: 52, C: 62, segs: ["B", "C"], paraLine: true, sideLabels: { AB: "9 cm", CA: "13 cm" } })],
  ["슬롯 64 — CTO feet+segLabels(발=중점 반변 라벨)", m2ExamCenterFig({ kind: "O", B: 56, C: 62, feet: true, tickFeet: true, segLabels: [{ on: "AD", label: "9 cm" }, { on: "BE", label: "11 cm" }, { on: "CF", label: "10 cm" }] })],
  ["슬롯 193 — EA split 3:2(등고 비율)", m2ExamEqAreaFig({ mode: "split", m: 3, n: 2, shade: "ABD", splitLabels: { bd: "3", dc: "2" } })],
];

const cards = samples.map(([t, svg]) => `<figure><figcaption>${t}</figcaption><div class="f">${svg}</div></figure>`).join("\n");
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>m2u4 v2 확대 헬퍼 샘플</title>
<style>body{font-family:"Malgun Gothic",sans-serif;background:#E8EAEE;padding:20px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;max-width:900px;margin:0 auto}
figure{background:#fff;border:1px solid #D5DAE2;border-radius:8px;padding:12px;margin:0}
figcaption{font-size:12px;color:#454F5D;font-weight:700;margin-bottom:8px}
.f{max-width:360px;margin:0 auto}.f svg{width:100%;height:auto;display:block}</style></head><body>
${cards}</body></html>`;
mkdirSync("tmp/m2u4v2-figsample", { recursive: true });
writeFileSync("tmp/m2u4v2-figsample/index.html", html);
console.log("렌더 완료: tmp/m2u4v2-figsample/index.html");
