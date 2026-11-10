// 판정 자료 만들기: qa/shot-sketch.mjs 가 찍은 전후 샷을 나란히 붙이고, 그림만 모은 비교 시트를 만든다.
// 실행: node qa/sketch/compare.mjs <출력 폴더>   (먼저 PORT=5537 node qa/shot-sketch.mjs)
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { shotHtml, close } from "./lib/shot.mjs";
import { panels } from "./scenes/comic-u1l1.mjs";
import { frames } from "./scenes/splash.mjs";
import { avatars, reading } from "./scenes/avatars.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SHOTS = join(ROOT, "qa", "shots", "sketch");
const OUT = process.argv[2] ?? join(ROOT, "qa", "shots", "sketch-compare");
mkdirSync(OUT, { recursive: true });

const mime = f => (f.endsWith(".webp") ? "image/webp" : f.endsWith(".svg") ? "image/svg+xml" : "image/png");
const uri = f => `data:${mime(f)};base64,${readFileSync(f).toString("base64")}`;
const pub = rel => uri(join(ROOT, "public", rel));
const CSS = `body{margin:0;background:#F3F5F8;font:15px/1.4 "Malgun Gothic","Apple SD Gothic Neo",sans-serif;color:#1E2A38}
 h1{font-size:22px;margin:0 0 4px} .sub{color:#667085;font-size:14px;margin-bottom:18px}
 .wrap{padding:26px 28px 30px} .row{display:flex;gap:24px;align-items:flex-start}
 .col{display:flex;flex-direction:column;align-items:center;gap:10px}
 .tag{font-weight:800;font-size:15px;padding:5px 14px;border-radius:999px}
 .old{background:#E4E7EC;color:#475467} .new{background:#DDF3EF;color:#0B7A6E}
 .phone{border-radius:22px;overflow:hidden;box-shadow:0 6px 22px -8px rgba(30,42,56,.35);border:1px solid #D0D5DD;background:#fff;display:block}`;

// 폰 화면 두 장을 나란히
async function pair(name, title, sub, vp, file) {
  const [w, h] = vp.split("x").map(Number);
  const b = join(SHOTS, `${name}-${vp}-before.png`), a = join(SHOTS, `${name}-${vp}-after.png`);
  if (!existsSync(b) || !existsSync(a)) { console.log("  건너뜀(샷 없음):", name, vp); return; }
  const html = `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="wrap"><h1>${title}</h1><div class="sub">${sub} · 화면 ${w}×${h}</div>
   <div class="row"><div class="col"><span class="tag old">현행 (생성형 이미지)</span><img class="phone" width="${w}" height="${h}" src="${uri(b)}"></div>
   <div class="col"><span class="tag new">코드로 그린 그림</span><img class="phone" width="${w}" height="${h}" src="${uri(a)}"></div></div></div>`;
  await shotHtml(html, join(OUT, file), w * 2 + 24 + 56, h + 150, 2);
  console.log("  ", file);
}

// 그림만 모은 시트: rows = [{ label, cls, items: [{ src | svg, cap }] }]
async function artSheet(file, title, sub, rows, cell, cols) {
  const rowHtml = rows.map(r => `<div style="margin-top:16px"><span class="tag ${r.cls}">${r.label}</span>
    <div style="display:grid;grid-template-columns:repeat(${cols},${cell.w}px);gap:12px;margin-top:10px">${r.items.map(it =>
      `<div><div style="width:${cell.w}px;height:${cell.h}px;background:#fff;border:1px solid #D0D5DD;border-radius:12px;overflow:hidden;display:grid;place-items:center">${
        it.svg ? it.svg.replace("<svg ", `<svg style="width:100%;height:100%" `) : `<img src="${it.src}" style="width:100%;height:100%;object-fit:contain">`}</div>
       <div style="text-align:center;font-size:13px;color:#667085;margin-top:4px">${it.cap ?? ""}</div></div>`).join("")}</div></div>`).join("");
  const html = `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="wrap" id="w" style="display:inline-block"><h1>${title}</h1><div class="sub">${sub}</div>${rowHtml}</div>`;
  const W = cols * (cell.w + 12) + 56;
  const nRows = rows.reduce((s, r) => s + Math.ceil(r.items.length / cols), 0);
  const H = 96 + rows.length * 52 + nRows * (cell.h + 36);
  await shotHtml(html, join(OUT, file), W, H, 1.5);
  console.log("  ", file);
}

const STAGE = ["인트로", "문제 인식", "가설 설정", "탐구 설계", "탐구 수행", "자료 해석", "결론 도출"];

for (const vp of ["390x700", "375x812"]) {
  const d = vp === "390x700" ? "" : "375x812/";
  if (d) mkdirSync(join(OUT, "375x812"), { recursive: true });
  for (let i = 0; i < 7; i++) await pair(`comic${i}`, `도입 만화 컷 ${i + 1}: ${STAGE[i]}`, "중1 과학 첫 레슨(u1l1), 제임스 린드의 괴혈병 실험", vp, `${d}1-만화-컷${i + 1}.png`);
  await pair("splash", "홈 시작 장면: 정착 컷", "플립북이 끝나고 \"공부하자!\" 컷에 멈춘 모습", vp, `${d}2-스플래시-정착.png`);
  await pair("hook-start", "원형 스틱맨: 레슨 도입(웃는 얼굴)", "중1 과학 둘째 레슨의 도입 장면", vp, `${d}3-원형스틱맨-도입.png`);
  await pair("hook-after", "원형 스틱맨: 반응 뒤 표정", "보기를 고른 뒤 표정이 바뀐 모습", vp, `${d}3-원형스틱맨-반응.png`);
  await pair("recap-top", "원형 스틱맨: 정리 화면", "정리 화면 머리말", vp, `${d}3-원형스틱맨-정리.png`);
  await pair("recap-outro", "원형 스틱맨: 정리 화면 끝인사(만세)", "정리 화면 맨 아래", vp, `${d}3-원형스틱맨-끝인사.png`);
  await pair("login", "로그인 화면", "비로그인 상태의 \"공부하자!\" 그림", vp, `${d}4-로그인.png`);
  await pair("account", "계정 관리 화면", "로그인한 상태의 책 읽는 그림(검수용 가짜 계정)", vp, `${d}4-계정관리.png`);
}

// 그림만 비교
await artSheet("1-만화-그림만.png", "도입 만화 7컷: 그림만 비교", "위는 현행 그림(960×960 webp), 아래는 코드로 그린 그림(960×720 SVG). 말풍선과 캡션은 앱이 얹는다.", [
  { label: "현행 (생성형 이미지)", cls: "old", items: STAGE.map((s, i) => ({ src: pub(`comics/u1l1/${i}.webp`), cap: `${i + 1}. ${s}` })) },
  { label: "코드로 그린 그림", cls: "new", items: panels().map((p, i) => ({ svg: p.sk.svg(), cap: `${i + 1}. ${STAGE[i]}` })) },
], { w: 300, h: 300 }, 7);

const SEQ = [0, 1, 7, 2, 8, 3, 9, 10, 4, 11, 5, 12, 13, 6];
await artSheet("2-스플래시-컷모음.png", "홈 시작 장면: 플립북 컷 비교", "현행은 놀이 14컷 + 정착 컷, 코드 그림 샘플은 놀이 6컷 + 정착 컷. 둘 다 125ms 간격으로 넘어간다.", [
  { label: "현행 (생성형 이미지)", cls: "old", items: [...SEQ.map((n, i) => ({ src: pub(`brand/loading/${n}.webp`), cap: `${i + 1}` })), { src: pub("brand/study.webp"), cap: "정착" }] },
  { label: "코드로 그린 그림", cls: "new", items: frames().map((f, i) => ({ svg: f.sk.svg(), cap: f.name === "study" ? "정착" : `${i + 1}` })) },
], { w: 190, h: 190 }, 8);

const KIND = ["smile 웃음", "surprised 놀람", "curious 궁금", "wave 인사", "cheer 만세"];
await artSheet("3-원형스틱맨-5종.png", "개념 설명의 원형 스틱맨 5종", "큰 그림으로 본 모습. 실제 쓰이는 크기(지름 44px 원, 폭 54px 온몸)는 아래 '실제 크기' 그림 참고.", [
  { label: "현행 (생성형 이미지)", cls: "old", items: KIND.map((k, i) => ({ src: pub(`comics/avatar/${i}.png`), cap: k })) },
  { label: "코드로 그린 그림", cls: "new", items: avatars().map((a, i) => ({ svg: a.sk.svg(), cap: KIND[i] })) },
], { w: 220, h: 220 }, 5);

// 실제 크기: 앱의 원형 틀과 같은 CSS로 놓고 3배 화소로 찍는다
{
  const oldRound = i => `<span class="av"><img src="${pub(`comics/avatar/${i}.png`)}" style="width:100%;height:100%;object-fit:cover;transform:scale(1.22);object-position:50% 30%"></span>`;
  const newRound = a => `<span class="av">${a.sk.svg({ inline: true }).replace("<svg ", `<svg style="width:100%;height:100%;display:block" `)}</span>`;
  const oldFull = i => `<span class="fu"><img src="${pub(`comics/avatar/${i}.png`)}" style="width:100%;height:auto;display:block"></span>`;
  const newFull = a => `<span class="fu">${a.sk.svg({ inline: true }).replace("<svg ", `<svg style="width:100%;height:auto;display:block" `)}</span>`;
  const av = avatars();
  const html = `<!doctype html><meta charset="utf-8"><style>${CSS}
    .av{width:44px;height:44px;border-radius:50%;background:#fff;border:2px solid #E4E7EC;box-shadow:0 1px 3px rgba(30,42,56,.12);display:inline-grid;place-items:center;overflow:hidden;box-sizing:border-box}
    .fu{width:54px;display:inline-block;vertical-align:bottom} .line{display:flex;gap:18px;align-items:flex-end;margin:10px 0 18px} .cap{font-size:11px;color:#667085;width:60px}</style>
    <div class="wrap"><h1>원형 스틱맨: 실제 크기</h1><div class="sub">앱과 같은 틀(지름 44px 원, 온몸은 폭 54px). 이 그림은 3배 화소로 찍어 폰 화면의 선명도를 그대로 보여 준다.</div>
    <span class="tag old">현행 (생성형 이미지)</span><div class="line">${[0, 1, 2].map(oldRound).join("")}${[3, 4].map(oldFull).join("")}</div>
    <span class="tag new">코드로 그린 그림</span><div class="line">${av.slice(0, 3).map(newRound).join("")}${av.slice(3).map(newFull).join("")}</div></div>`;
  await shotHtml(html, join(OUT, "3-원형스틱맨-실제크기.png"), 520, 330, 3);
  console.log("   3-원형스틱맨-실제크기.png");
}

await artSheet("4-로그인-계정-그림만.png", "로그인 화면과 계정 관리 화면 그림", "로그인 화면은 스플래시 정착 컷과 같은 그림을 쓴다.", [
  { label: "현행 (생성형 이미지)", cls: "old", items: [{ src: pub("brand/study.webp"), cap: "로그인: 공부하자!" }, { src: pub("brand/loading/8.webp"), cap: "계정 관리: 책 읽기" }] },
  { label: "코드로 그린 그림", cls: "new", items: [{ svg: frames().find(f => f.name === "study").sk.svg(), cap: "로그인: 공부하자!" }, { svg: reading().svg(), cap: "계정 관리: 책 읽기" }] },
], { w: 300, h: 300 }, 2);

await close();
console.log("DONE →", OUT);
