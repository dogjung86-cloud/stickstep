// g2u4 v2 검산 반영 수정 문항 눈검수 캡처(일회용) — tmp/g2u4v2-full 갤러리 file:// 로드 후
// 프롬프트 조각으로 카드를 찾아 카드 단위 스크린샷. 결과: qa/shots/g2u4v2-fixes/<key>.png
import { chromium } from "playwright-core";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "qa", "shots", "g2u4v2-fixes");
fs.mkdirSync(OUT, { recursive: true });

// key → 카드를 유일하게 짚는 프롬프트/본문 조각
const TARGETS = {
  e217: "가장 가벼운 기체라서 전구 속을 채운다",
  e242: "화학식만 보고도 그 물질의 색깔을",
  e248: "베로나",
  e264: "표시 없는 회색 알갱이보다 1개 많다",
  e270: "원자를 이루는 세 입자를 정리한",
  e274: "두 원자에 대한 판단으로 가장 옳은 것은",
  e285: "모두 같은 주기 원소이다",
  e287: "원소 대신 ㉮~㉲ 기호를 표시한 거예요. 이에 대한 설명으로",
  e289: "위 왼쪽 숫자 <b>8</b>", // innerHTML 검사
  e296: "헬륨과 같은 주기",
  e304: "세로로 나란히 놓인다",
  e313: "이 이온의 <b>이온식</b>", // innerHTML
  e315: "Fe⁺²",
  e317: "이온 ㉮의 <b>전자는 몇 개</b>", // innerHTML
  e318: "이온 ㉯의 <b>전자는 몇 개</b>", // innerHTML
  e319: "전자를 몇 개 잃어",
  e321: "양이온</b>을 모두 고르세요", // innerHTML
  e324: "산소 분자 <b>4개</b>", // innerHTML
  e344: "두 가지 액체에 각각 전극을 꽂고",
  e355: "(+)극 쪽으로 이동하는 것",
};

const url = "file:///" + path.join(ROOT, "tmp", "g2u4v2-full", "index.html").replace(/\\/g, "/");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 460, height: 1400 } });
await page.goto(url, { waitUntil: "networkidle" });
// details(해설) 접힌 상태 그대로 — 노출면 검수 목적
let ok = 0;
for (const [key, frag] of Object.entries(TARGETS)) {
  const handle = await page.evaluateHandle((f) => {
    const cards = [...document.querySelectorAll("article.q")];
    return cards.find((c) => c.innerHTML.includes(f)) ?? null;
  }, frag);
  const el = handle.asElement();
  if (!el) { console.log(`MISS ${key} (조각 불일치)`); continue; }
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: path.join(OUT, `${key}.png`) });
  ok++;
}
console.log(`캡처 ${ok}/${Object.keys(TARGETS).length} → qa/shots/g2u4v2-fixes/`);
await browser.close();
