// 코드 그림 빌드: 장면 코드 → 정적 SVG(public/sketch) + 앱이 읽는 표(src/ui/sketchArt.generated.ts).
// 실행: node qa/sketch/build.mjs
//   만화 컷, 개념 컷, 스플래시 컷, 로그인과 계정 그림, 과목 카드 그림 = 정적 SVG 파일(<img>로 싣는다. 실행 중 그리는 비용 0)
//   원형 스틱맨 쌤 5종 = 생성 표에 SVG 문자열로(작고, 표정을 바꿀 때 바로 갈아 끼워야 해서)
//   말풍선과 때와 곳 상자 = 그림이 기록한 화자 머리 기준점에서 % 좌표를 계산해 표에 싣는다(lib/bubble.mjs)
//   만화의 글(머리말, 단계 배지, 제목, 설명, 용어 카드)은 장면 파일이 정본이다. 표에 함께 싣고, 단원 파일은 comic(comicStory("<레슨>"))로 쓴다.
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { frames } from "./scenes/splash.mjs";
import { avatars, reading } from "./scenes/avatars.mjs";
import { FRAME_W, placeBubble, whenBox, hit, textRules } from "./lib/bubble.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PUB = join(ROOT, "public", "sketch");
// 내용이 바뀐 파일만 다시 쓴다(dev 서버가 켜져 있을 때 쓸데없는 새로고침을 막는다)
const writeIfChanged = (f, text) => { if (!existsSync(f) || readFileSync(f, "utf8") !== text) writeFileSync(f, text); };
const made = new Set();
const put = (rel, text) => { const f = join(PUB, rel); mkdirSync(dirname(f), { recursive: true }); writeIfChanged(f, text); made.add(rel); return Buffer.byteLength(text); };
let warned = 0;
const warn = (m) => { warned++; console.warn("  ! " + m); };

const sizes = {};

// 만화: scenes/comic-<레슨>.mjs 마다 한 편.
//   panels() 가 [{ sk, bubbles?, when?, whenPos?, stage, title, caption, term? }] 를, META 가 { title, lead?, narrator?, cta? } 를 준다.
//   bubbles = [{ who: 기준점 이름, text, side?, dx?, dy? }](자리 계산은 lib/bubble.mjs 의 placeBubble)
const comic = {};
const comicMeta = {};
for (const f of readdirSync(join(HERE, "scenes")).filter(n => /^comic-.+\.mjs$/.test(n)).sort()) {
  const id = f.replace(/^comic-|\.mjs$/g, "");
  const mod = await import(pathToFileURL(join(HERE, "scenes", f)).href);
  const story = !!mod.META;
  if (story) {
    const { title, lead, narrator, cta } = mod.META;
    if (!title) throw new Error(`${id}: META.title 이 없다`);
    comicMeta[id] = Object.fromEntries(Object.entries({ title, lead, narrator, cta }).filter(([, v]) => v));
  }
  comic[id] = mod.panels().map((p, i) => {
    const where = `${id} 컷 ${i + 1}`;
    const rel = `comics/${id}/${i}.svg`;
    sizes[rel] = put(rel, p.sk.svg());
    const e = { img: `sketch/${rel}` };
    const bs = (p.bubbles ?? []).map(b => placeBubble(p.sk, b, where, warn));
    // 자리는 컷 폭 350px 기준으로 본다. 앱이 좁은 폰에서 말풍선과 상자를 그림과 같은 비율로 줄이므로(ui.css .comic-art.code) 이 폭만 맞으면 된다.
    for (let a = 0; a < bs.length; a++) for (let c = a + 1; c < bs.length; c++) if (hit(bs[a].box, bs[c].box)) warn(`${where}: 말풍선 둘이 겹친다`);
    if (bs.length) e.bubbles = bs.map(({ box, ...b }) => b);
    if (p.when) {
      e.when = p.when;
      if (p.whenPos === "tr") e.whenPos = "tr";
      const wb = whenBox(p.when, p.whenPos);
      for (const b of bs) if (hit({ ...wb, b: wb.b + 3 }, b.box)) warn(`${where}: 때와 곳 상자가 말풍선 "${b.text}" 과 겹친다(3px 안쪽으로 붙어도 경고)`);
      if (wb.r > FRAME_W - 4) warn(`${where}: 때와 곳 상자 "${p.when}" 이 너무 길다`);
    }
    if (story) {
      for (const k of ["stage", "title", "caption"]) if (!p[k]) throw new Error(`${where}: ${k} 가 없다`);
      if (/\d/.test(p.stage)) warn(`${where}: 단계 배지 "${p.stage}" 에 숫자가 있다(연도는 when 으로)`);
      Object.assign(e, { stage: p.stage, title: p.title, caption: p.caption });
      if (p.term) e.term = { name: p.term.name, def: p.term.def };
    }
    return e;
  });
  if (story) {
    const texts = [...Object.values(comicMeta[id]), ...comic[id].flatMap(p => [p.when, p.stage, p.title, p.caption, p.term?.name, p.term?.def, ...(p.bubbles ?? []).map(b => b.text)])].filter(Boolean).join("\n");
    for (const m of textRules(texts)) warn(`${id} 글: ${m}`);
  }
  // 덤 그림(문제 그림처럼 만화 밖에서 쓰는 것): extras() 가 [{ name, sk }] 를 돌려주면 comics/<레슨>/<name>.svg 로 쓴다
  for (const x of mod.extras?.() ?? []) { const rel = `comics/${id}/${x.name}.svg`; sizes[rel] = put(rel, x.sk.svg()); }
}

// 개념 컷: scenes/cuts/cuts-*.mjs 의 cuts() 가 [{ name, theme, sk, alt, cap, spare? }] 를 돌려준다.
//   cuts/<테마>/<이름>.svg 로 쓰고 표 CUT_ART["<테마>/<이름>"] 에 싣는다. dsl.ts 의 cut(theme, name, alt) 가 이 표를 먼저 본다.
//   alt 와 cap 의 정본은 단원 파일의 개념 스텝이다(장면 파일의 것은 미리보기 mock-cuts.mjs 용 가안).
//   spare: 지금 레슨에 쓰지 않는 예비 장면(미리보기에서만 본다)
const cutArt = {};
const CUT_DIR = join(HERE, "scenes", "cuts");
for (const f of readdirSync(CUT_DIR).filter(n => /^cuts-.+\.mjs$/.test(n)).sort()) {
  const mod = await import(pathToFileURL(join(CUT_DIR, f)).href);
  for (const c of mod.cuts()) {
    if (c.spare) continue;
    const key = `${c.theme}/${c.name}`;
    if (cutArt[key]) throw new Error(`개념 컷 이름이 겹친다: ${key}`);
    const rel = `cuts/${key}.svg`;
    sizes[rel] = put(rel, c.sk.svg());
    cutArt[key] = `sketch/${rel}`;
  }
}

// 스플래시
const splash = { frames: [], settle: [], study: "" };
for (const f of frames()) {
  const rel = `splash/${f.name}.svg`;
  sizes[rel] = put(rel, f.sk.svg());
  if (f.name === "study") splash.study = `sketch/${rel}`; else if (f.name.startsWith("study-")) splash.settle.push(`sketch/${rel}`); else splash.frames.push(`sketch/${rel}`);
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
/** 만화 컷 한 장. when 은 그림 왼쪽 위(whenPos "tr"이면 오른쪽 위)에 얹는 때와 곳 상자.
 *  stage 부터 term 까지는 장면 파일이 글까지 쓰는 편(COMIC_META 가 있는 편)에만 있다. */
export interface SketchPanelArt {
  img: string;
  bubbles?: SketchBubble[];
  when?: string;
  whenPos?: "tl" | "tr";
  stage?: string;
  title?: string;
  caption?: string;
  term?: { name: string; def: string };
}
export interface SketchComicMeta { title: string; lead?: string; narrator?: string; cta?: string }

/** 원형 스틱맨 쌤 5종(인라인 SVG) */
export const TEACHER_SVG: Record<string, string> = ${JSON.stringify(avatar, null, 2)};

/** 만화 컷: 레슨별 그림 경로, 말풍선(화자 머리 기준점에서 계산한 자리), 때와 곳, 컷의 글 */
export const COMIC_ART: Record<string, SketchPanelArt[]> = ${JSON.stringify(comic, null, 2)};

/** 만화 스텝의 머리말(제목, 이끄는 글, 쌤의 말, 마지막 컷 버튼) */
export const COMIC_META: Record<string, SketchComicMeta> = ${JSON.stringify(comicMeta, null, 2)};

/** 개념 컷: "<테마>/<이름>" → 그림 경로 */
export const CUT_ART: Record<string, string> = ${JSON.stringify(cutArt, null, 2)};

/** 스플래시 플립북(놀이 컷은 넘기는 순서대로) */
export const SPLASH_ART: { frames: string[]; settle: string[]; study: string } = ${JSON.stringify(splash, null, 2)};

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
const themes = [...new Set(Object.keys(cutArt).map(k => k.split("/")[0]))];
console.log("개념 컷", Object.keys(cutArt).length, "장", kb(sum("cuts/")), "|", themes.map(t => `${t} ${Object.keys(cutArt).filter(k => k.startsWith(t + "/")).length}`).join(", "));
console.log("스플래시", splash.frames.length + 1, "컷", kb(sum("splash/")), "| 계정", kb(sizes["account.svg"]), "| 과목 카드", Object.keys(subject).length, kb(sum("subj/")), "| 원형 스틱맨 5종(인라인)", kb(Object.values(avatar).join("").length));
if (warned) console.warn(`경고 ${warned}건`);
