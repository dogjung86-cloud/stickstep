// 중1 Ⅲ v3 — 그림 헬퍼 단독 렌더 눈검수(heat3Figures 전 그림 → qa/shots/u3v3-figs.png).
//   PORT=5453 node qa/shot-u3v3-figs.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.evaluate(async () => {
  const m = await import("/src/ui/heat3Figures.ts");
  const figs = [
    ["particleTrioFig", m.particleTrioFig()], ["heatCoolFig", m.heatCoolFig()], ["heatFlowFig", m.heatFlowFig()],
    ["contactGraphFig", m.contactGraphFig()], ["contactGraphFig quiz", m.contactGraphFig({ quiz: true })],
    ["conductChainFig", m.conductChainFig()], ["rodsThermalFig blank", m.rodsThermalFig({ blank: true })],
    ["convectionPotFig", m.convectionPotFig()], ["radiationFig blocked", m.radiationFig({ blocked: true })],
    ["ondolFig", m.ondolFig()], ["heatRaceGraphFig quiz", m.heatRaceGraphFig({ quiz: true })],
    ["specificHeatBarFig", m.specificHeatBarFig()], ["expansionParticlesFig", m.expansionParticlesFig()],
    ["liquidFlaskFig before", m.liquidFlaskFig("before")], ["liquidFlaskFig after", m.liquidFlaskFig("after")],
    ["tapeBendFig", m.tapeBendFig()], ["bimetalFig", m.bimetalFig()], ["bimetalFig blank bigOnTop:false", m.bimetalFig({ blank: true, bigOnTop: false })],
  ];
  document.body.innerHTML = `<div id="figs" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px;background:#fff">${figs
    .map(([n, s]) => `<div style="border:1px solid #E5E8EB;border-radius:10px;padding:6px"><div style="font:700 11px sans-serif;color:#4E5968;margin-bottom:4px">${n}</div>${s}</div>`)
    .join("")}</div>`;
});
await page.waitForTimeout(300);
const box = await page.locator("#figs").boundingBox();
await page.screenshot({ path: "qa/shots/u3v3-figs.png", clip: { x: 0, y: 0, width: 760, height: Math.ceil(box.height + 20) }, fullPage: true });
console.log("SHOT u3v3-figs", Math.ceil(box.height));
await browser.close();
