// 코드 그림 빌드: 장면 코드 → 정적 SVG(public/sketch) + 앱이 읽는 표(src/ui/sketchArt.generated.ts).
// 실행: node qa/sketch/build.mjs
//   만화 컷, 스플래시 컷, 로그인과 계정 그림, 과목 카드 그림 = 정적 SVG 파일(<img>로 싣는다. 실행 중 그리는 비용 0)
//   원형 스틱맨 쌤 5종 = 생성 표에 SVG 문자열로(작고, 표정을 바꿀 때 바로 갈아 끼워야 해서)
//   말풍선 = 그림이 기록한 화자 머리 기준점에서 % 좌표를 계산해 표에 싣는다
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { frames } from "./scenes/splash.mjs";
import { avatars, reading } from "./scenes/avatars.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PUB = join(ROOT, "public", "sketch");
// 내용이 바뀐 파일만 다시 쓴다(dev 서버가 켜져 있을 때 쓸데없는 새로고침을 막는다)
const writeIfChanged = (f, text) => { if (!existsSync(f) || readFileSync(f, "utf8") !== text) writeFileSync(f, text); };
const made = new Set();
const put = (rel, text) => { const f = join(PUB, rel); mkdirSync(dirname(f), { recursive: true }); writeIfChanged(f, text); made.add(rel); return Buffer.byteLength(text); };

/* ---------- 말풍선 자리 계산 ----------
   앱의 .cut-bubble 은 (x%, y%)가 몸통의 아래 가운데다. 가운데 꼬리는 몸통 아래로 약 7px,
   뿔 꼬리(tail left/right)는 몸통 끝에서 16px 바깥, 27px 아래에 끝이 온다(ui.css, figures.cutTailHorn).
   폰 화면의 컷 폭(350px)을 기준으로 몸통 크기를 어림해 컷 밖으로 나가지 않는 자리를 고른다.
   b = { who: 기준점 이름, text, side?: "left" | "right"(뿔 꼬리를 강제), dx?, dy?(px 미세 조정) } */
const FRAME_W = 350;
function textWidth(line) {
  let w = 0;
  for (const ch of line.replace(/<[^>]+>/g, "")) w += /[가-힣]/.test(ch) ? 11.6 : ch === " " ? 3.2 : /[0-9A-Za-z]/.test(ch) ? 7.2 : 4.8;
  return w;
}
function placeBubble(sk, b, where) {
  const a = sk.anchors[b.who];
  if (!a) throw new Error(`${where}: 기준점 '${b.who}' 가 없다`);
  const FH = FRAME_W * sk.h / sk.w;
  const ax = a.x / sk.w * FRAME_W + (b.dx ?? 0), ay = a.y / sk.h * FH + (b.dy ?? 0);
  const lines = b.text.split("<br>");
  const bw = Math.min(FRAME_W * 0.52, Math.max(84, Math.max(...lines.map(textWidth)) + 25.2));
  const bh = lines.length * 15.6 + 16.2;
  let cx = ax, by = ay - 9, tail = b.side;
  if (!tail && ax - bw / 2 < 5) tail = "left";
  else if (!tail && (ax + bw / 2 > FRAME_W - 5 || FRAME_W - ax < Math.max(84, bw) - 1)) tail = "right"; // 오른쪽 폭이 모자라면 몸통을 왼쪽으로
  if (tail === "left") { cx = ax + 16 + bw / 2; by = ay - 29; }
  if (tail === "right") { cx = ax - 16 - bw / 2; by = ay - 29; }
  const box = { l: cx - bw / 2, r: cx + bw / 2, t: by - bh, b: by };
  if (box.l < 2 || box.r > FRAME_W - 2 || box.t < 2) console.warn(`  ! ${where}: 말풍선 "${b.text}" 이 컷 밖으로 나간다`, JSON.stringify(box));
  // 말풍선은 left 기준으로 놓이므로 오른쪽에 남은 폭보다 넓으면 브라우저가 줄을 더 나눈다. <br> 로 줄을 직접 나눠 맞춘다.
  if (bw > Math.max(84, FRAME_W - cx) + 1) console.warn(`  ! ${where}: 말풍선 "${b.text}" 이 오른쪽 폭(${Math.round(FRAME_W - cx)}px)보다 넓다(${Math.round(bw)}px). <br> 로 줄을 나누거나 side: "right" 를 줄 것`);
  const out = { text: b.text, x: +(cx / FRAME_W * 100).toFixed(1), y: +(by / FH * 100).toFixed(1) };
  if (tail) out.tail = tail;
  return out;
}

const sizes = {};

// 만화: scenes/comic-<레슨>.mjs 마다 한 편. panels() 가 [{ sk, bubbles? }] 를 돌려준다.
const comic = {};
for (const f of readdirSync(join(HERE, "scenes")).filter(n => /^comic-.+\.mjs$/.test(n)).sort()) {
  const id = f.replace(/^comic-|\.mjs$/g, "");
  const mod = await import(pathToFileURL(join(HERE, "scenes", f)).href);
  comic[id] = mod.panels().map((p, i) => {
    const rel = `comics/${id}/${i}.svg`;
    sizes[rel] = put(rel, p.sk.svg());
    const e = { img: `sketch/${rel}` };
    if (p.bubbles?.length) e.bubbles = p.bubbles.map(b => placeBubble(p.sk, b, `${id} 컷 ${i + 1}`));
    return e;
  });
  // 덤 그림(문제 그림처럼 만화 밖에서 쓰는 것): extras() 가 [{ name, sk }] 를 돌려주면 comics/<레슨>/<name>.svg 로 쓴다
  for (const x of mod.extras?.() ?? []) { const rel = `comics/${id}/${x.name}.svg`; sizes[rel] = put(rel, x.sk.svg()); }
}

// 스플래시
const splash = { frames: [], study: "" };
for (const f of frames()) {
  const rel = `splash/${f.name}.svg`;
  sizes[rel] = put(rel, f.sk.svg());
  if (f.name === "study") splash.study = `sketch/${rel}`; else splash.frames.push(`sketch/${rel}`);
}

// 계정 관리 화면
sizes["account.svg"] = put("account.svg", reading().svg());

// 과목 카드
const subject = {};
if (existsSync(join(HERE, "scenes", "subjects.mjs"))) {
  const { subjects } = await import(pathToFileURL(join(HERE, "scenes", "subjects.mjs")).href);
  for (const s of subjects()) { const rel = `subj/${s.name}.svg`; sizes[rel] = put(rel, s.sk.svg()); subject[s.name] = `sketch/${rel}`; }
}

// 원형 스틱맨
const avatar = {};
for (const a of avatars()) avatar[a.name] = a.sk.svg({ inline: true });

const ts = `// 자동 생성물: node qa/sketch/build.mjs 가 만든다. 손으로 고치지 않는다.
// 코드로 그린 스틱맨 그림의 표. 그림 원본은 qa/sketch/scenes/ 의 장면 코드다.

export interface SketchBubble { text: string; x: number; y: number; flip?: boolean; tail?: "left" | "right" }
export interface SketchPanelArt { img: string; bubbles?: SketchBubble[] }

/** 원형 스틱맨 쌤 5종(인라인 SVG) */
export const TEACHER_SVG: Record<string, string> = ${JSON.stringify(avatar, null, 2)};

/** 만화 컷: 레슨별 그림 경로와 말풍선(화자 머리 기준점에서 계산한 자리) */
export const COMIC_ART: Record<string, SketchPanelArt[]> = ${JSON.stringify(comic, null, 2)};

/** 스플래시 플립북(놀이 컷은 넘기는 순서대로) */
export const SPLASH_ART: { frames: string[]; study: string } = ${JSON.stringify(splash, null, 2)};

/** 계정 관리 화면 그림 */
export const ACCOUNT_ART = "sketch/account.svg";

/** 과목 카드 그림 */
export const SUBJECT_ART: Record<string, string> = ${JSON.stringify(subject, null, 2)};
`;
writeIfChanged(join(ROOT, "src", "ui", "sketchArt.generated.ts"), ts);

// 더는 만들지 않는 SVG 는 지운다
const sweep = (dir, rel = "") => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) sweep(join(dir, e.name), r);
    else if (e.name.endsWith(".svg") && !made.has(r)) rmSync(join(dir, e.name));
  }
};
sweep(PUB);

const kb = n => (n / 1024).toFixed(1) + "KB";
const sum = pre => Object.entries(sizes).filter(([k]) => k.startsWith(pre)).reduce((s, [, v]) => s + v, 0);
for (const id of Object.keys(comic)) console.log(`만화 ${id}: ${comic[id].length}컷 ${kb(sum(`comics/${id}/`))}` + comic[id].map((p, i) => (p.bubbles ? ` [${i + 1}:${p.bubbles.map(b => b.text.replace("<br>", " ")).join(" / ")}]` : "")).join(""));
console.log("스플래시", splash.frames.length + 1, "컷", kb(sum("splash/")), "| 계정", kb(sizes["account.svg"]), "| 과목 카드", Object.keys(subject).length, kb(sum("subj/")), "| 원형 스틱맨 5종(인라인)", kb(Object.values(avatar).join("").length));
