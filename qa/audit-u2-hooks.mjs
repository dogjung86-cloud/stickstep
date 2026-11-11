// 중1 Ⅱ 도입(훅) 실측: 여덟 장면을 폰 크기에서 끝까지 조작하며 세 시점(처음, 예측이 뜬 때, 답한 뒤)을 잰다.
// PORT=5557 node qa/audit-u2-hooks.mjs <출력 폴더> [폭] [높이]
// 재는 것: 스텝 높이(몇 화면인가), 글자 수, 장면이 시작하는 높이, 누른 횟수, 누를 수 없이 기다린 시간,
//          예측이 떴을 때 장면이 보이는가, 답한 뒤 해설이 보이는가.
import { mkdirSync, writeFileSync } from "node:fs";
import { launch, openLesson, W, waitFor } from "./u2v5-lib.mjs";

const OUT = process.argv[2] || "qa/shots/u2-hooks";
const VW = Number(process.argv[3] || 390);
const VH = Number(process.argv[4] || 700);
mkdirSync(OUT, { recursive: true });

// 장면마다: 레슨 차례(0부터), 누를 곳, 누르는 횟수, 옳은 예측의 첫 낱말
const SCENES = [
  { li: 1, scene: "breadfactory", taps: [".hb4-bf-room[data-r=door]", ".hb4-bf-room[data-r=ctrl]", ".hb4-bf-room[data-r=gen]"], right: "비슷한 역할" },
  { li: 2, scene: "waterlens", taps: [".hb4-wl"], right: "빛을 모아" },
  { li: 3, scene: "blooddrop", taps: [".hb4-bd"], right: "빨간 원반" },
  { li: 4, scene: "brickhouse", taps: [".hb4-bh", ".hb4-bh"], right: "모양과 하는 일" },
  { li: 5, scene: "dokdofriends", taps: [".dk-spot[data-d=gull]", ".dk-spot[data-d=flower]", ".dk-spot[data-d=fish]"], right: "1,000종" },
  { li: 7, scene: "martshelf", taps: [".ms-shelf[data-side=fruit]", ".ms-shelf[data-side=veg]"], right: "누가 나눠도" },
  { li: 8, scene: "mushroomscan", taps: [".hb4-mr"], right: "광합성을 하지" },
  { li: 9, scene: "beegone", taps: [".bg-switch"], right: "꿀벌이 꽃가루" },
];

const snap = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const wrap = document.querySelector(".screen.active .stepWrap") ?? sc;
    const top0 = sc.getBoundingClientRect().top;
    const box = (sel) => {
      const e = wrap.querySelector(sel);
      if (!e || e.getClientRects().length === 0) return null;
      const b = e.getBoundingClientRect();
      const top = Math.round(b.top - top0 + sc.scrollTop);
      const bottom = Math.round(b.bottom - top0 + sc.scrollTop);
      // 지금 화면에 온전히 보이는가
      const seen = b.top >= top0 - 1 && b.bottom <= top0 + sc.clientHeight + 1;
      const part = b.bottom > top0 + 8 && b.top < top0 + sc.clientHeight - 8;
      return { top, bottom, h: Math.round(b.height), seen, part };
    };
    const text = (wrap.innerText || "").replace(/\s+/g, "");
    const stageSvg = wrap.querySelector(".hook-scene svg");
    let minFont = null;
    if (stageSvg) {
      const k = stageSvg.getBoundingClientRect().width / (stageSvg.viewBox.baseVal.width || 1);
      for (const t of stageSvg.querySelectorAll("text")) {
        const fs = parseFloat(t.getAttribute("font-size") || getComputedStyle(t).fontSize) * k;
        if (minFont === null || fs < minFont) minFont = Math.round(fs * 10) / 10;
      }
    }
    const taps = [...wrap.querySelectorAll(".hook-choice")].map((b) => Math.round(b.getBoundingClientRect().height));
    return {
      view: sc.clientHeight,
      content: sc.scrollHeight,
      screens: Math.round((sc.scrollHeight / sc.clientHeight) * 100) / 100,
      scrollTop: Math.round(sc.scrollTop),
      chars: text.length,
      title: box(".h1"),
      lead: box(".sub"),
      narrator: box(".comic-narrator"),
      scene: box(".hook-scene > :first-child"),
      choices: box(".hook-choices"),
      helper: box(".helper"),
      minFont,
      choiceH: taps,
      cta: (() => {
        const b = document.querySelector(".screen.active .btn.cta");
        return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled };
      })(),
    };
  });

const rows = [];
const { browser, page, errors } = await launch({ width: VW, height: VH });
for (const S of SCENES) {
  const info = await openLesson(page, S.li);
  await W(page, 700);
  const mount = await snap(page);
  await page.screenshot({ path: `${OUT}/${info.id}-${S.scene}-1-mount.png` });

  const t0 = Date.now();
  let tapCount = 0;
  for (const sel of S.taps) {
    const ok = await page.evaluate((s) => {
      const e = document.querySelector(`.screen.active ${s}`);
      if (!e) return false;
      e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      return true;
    }, sel);
    if (!ok) console.log(`  !! ${S.scene}: ${sel} 없음`);
    tapCount += 1;
    await W(page, 260);
    if (tapCount === 1) await page.screenshot({ path: `${OUT}/${info.id}-${S.scene}-2-tap1.png` });
  }
  const tLastTap = Date.now();
  const shown = await waitFor(page, () => !!document.querySelector(".screen.active .hook-choices.show"), null, 60, 50);
  const waitMs = Date.now() - tLastTap; // 마지막으로 누른 뒤 예측이 뜨기까지 손댈 수 없는 시간
  await W(page, 700); // 자동 스크롤이 가라앉을 때까지
  const asked = await snap(page);
  await page.screenshot({ path: `${OUT}/${info.id}-${S.scene}-3-ask.png` });

  // 틀린 예측을 고른다
  await page.evaluate((right) => {
    const bs = [...document.querySelectorAll(".screen.active .hook-choice")];
    (bs.find((b) => !b.textContent.trim().startsWith(right)) ?? bs[0]).click();
  }, S.right);
  await W(page, 900);
  const done = await snap(page);
  await page.screenshot({ path: `${OUT}/${info.id}-${S.scene}-4-wrong.png` });

  rows.push({ id: info.id, scene: S.scene, taps: tapCount, waitMs, shown, mount, asked, done, next: info.types[1] });
  console.log(
    `${info.id} ${S.scene}: 처음 ${mount.screens}화면(${mount.content}px, 글자 ${mount.chars}), 장면 시작 ${mount.scene?.top}px, ` +
      `누름 ${tapCount}번, 기다림 ${waitMs}ms, 예측 때 ${asked.screens}화면(장면 보임 ${asked.scene?.seen ? "예" : asked.scene?.part ? "일부" : "아니요"}), ` +
      `답한 뒤 ${done.screens}화면(해설 보임 ${done.helper?.seen ? "예" : done.helper?.part ? "일부" : "아니요"}), 무대 글자 ${mount.minFont ?? "없음"}px`,
  );
}
writeFileSync(`${OUT}/hooks-${VW}x${VH}.json`, JSON.stringify(rows, null, 1));
if (errors.length) console.log("페이지 오류:", errors);
await browser.close();
