// 스틱스텝 마케팅 영상 캡처 리그 — CDP 스크린캐스트 1080x1920(뷰포트 405x720 × DSF 8/3)
// 사용: node capture.mjs            (전 비트)
//       BEAT=moon node capture.mjs  (한 비트만 재촬영)
// 산출: cap/<beat>/f00001.jpg… + times.json (프레임 타임스탬프)
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app/package.json의 playwright-core를 재사용(marketing/video → app 두 단계 위)
const requireApp = createRequire(path.join(__dirname, "..", "..", "package.json"));
const { chromium } = requireApp("playwright-core");

const PORT = process.env.PORT || "5311";
const ONLY = (process.env.BEAT || "").split(",").filter(Boolean);
const CAP = path.join(__dirname, "cap");
fs.mkdirSync(CAP, { recursive: true });

const VIEW = { width: 405, height: 720 };
const DSF = 8 / 3; // 1080x1920

const VITE_STUB = {
  contentType: "application/javascript",
  body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
};

// 시딩 완료 처리 = player.ts freeNav → 헤더 앞으로 가기(.xbtn.fwd)가 생겨 랩 스텝으로 점프할 수 있다.
// GIF 전용 랩(g2u3l7·g2u4l2·g2u4l3)도 여기 없으면 fwdTo가 동작하지 않는다.
const DONE_IDS = ["u3l1", "u4l2", "u6l2", "u7l5", "g2u3l1", "g2u3l6", "g2u3l7", "g2u4l2", "g2u4l3", "g2u5l1"];

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function makePage(seedDone, extra = {}) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  await page.route("**/@vite/client", (route) => route.fulfill(VITE_STUB));
  await page.addInitScript(
    ({ ids, done, extra }) => {
      const lessons = {};
      if (done) ids.forEach((id) => (lessons[id] = { done: true, acc: 1, bestXp: 10 }));
      localStorage.setItem(
        "science-app.v1",
        JSON.stringify({
          version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
          premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null,
          totalXp: 120, lessons, minigame: {}, ...extra,
        }),
      );
    },
    { ids: DONE_IDS, done: seedDone, extra },
  );
  return page;
}

// 오답노트 비트용 실전풍 시드(스냅샷 스키마 = e2e-notebook.mjs 준용)
const WRONG_NOTES = {
  "e:u3exam:m1": {
    key: "e:u3exam:m1", kind: "exam", srcId: "u3exam", lessonId: "u3l1", type: "mcq",
    q: "온도가 높아질수록 물질을 구성하는 <b>입자의 운동</b>은 어떻게 될까요?",
    opts: ["점점 활발해진다", "점점 둔해진다", "변화가 없다", "완전히 멈춘다"], answer: [0],
    explain: "온도는 입자 운동이 활발한 정도를 나타내는 값이에요. 온도가 높아지면 입자 운동은 점점 활발해지고 입자 사이 거리도 멀어져요.",
    hasFigure: false, wrongCount: 1, overcome: false, ts: Date.now() - 86400000,
  },
  "e:u6exam:m2": {
    key: "e:u6exam:m2", kind: "exam", srcId: "u6exam", lessonId: "u6l2", type: "mcq",
    q: "온도가 일정할 때 피스톤을 눌러 기체의 부피를 <b>절반</b>으로 줄이면 압력은?",
    opts: ["2배가 된다", "절반이 된다", "변화가 없다", "0이 된다"], answer: [0],
    explain: "부피가 절반이 되면 같은 수의 입자가 절반의 공간에서 두 배 자주 벽에 부딪혀요. 그래서 압력은 2배가 돼요(보일 법칙).",
    hasFigure: false, wrongCount: 1, overcome: false, ts: Date.now() - 43200000,
  },
  "e:u3exam:m3": {
    key: "e:u3exam:m3", kind: "exam", srcId: "u3exam", lessonId: "u3l3", type: "mcq",
    q: "열의 이동 방법 중 <b>입자가 직접 이동</b>하며 열을 나르는 것은?",
    opts: ["대류", "전도", "복사", "단열"], answer: [0],
    explain: "대류는 액체·기체에서 데워진 입자가 직접 위로 이동하며 열을 나르는 방식이에요.",
    hasFigure: false, wrongCount: 1, overcome: true, ts: Date.now() - 21600000,
  },
};

// ── 스크린캐스트 레코더 ──
function makeRecorder(page) {
  let cdp = null, dir = null, n = 0, times = [], on = false;
  const attach = async () => {
    cdp = await page.context().newCDPSession(page);
    cdp.on("Page.screencastFrame", async (ev) => {
      if (on) {
        n += 1;
        times.push(ev.metadata.timestamp);
        fs.writeFileSync(path.join(dir, `f${String(n).padStart(5, "0")}.jpg`), Buffer.from(ev.data, "base64"));
      }
      try { await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }); } catch {}
    });
  };
  return {
    attach,
    start: async (name) => {
      dir = path.join(CAP, name);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      n = 0; times = []; on = true;
      await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
    },
    stop: async () => {
      on = false;
      try { await cdp.send("Page.stopScreencast"); } catch {}
      fs.writeFileSync(path.join(dir, "times.json"), JSON.stringify(times));
      console.log(`  ${path.basename(dir)}: ${n} frames, ${(times[times.length - 1] - times[0]).toFixed(2)}s`);
    },
  };
}

// ── 가짜 손가락 + 자막 주입 ──
const FINGER_CSS = `
#mkt-finger{position:fixed;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.34);
border:3px solid rgba(49,130,246,.95);box-shadow:0 4px 14px rgba(11,21,36,.35),inset 0 0 10px rgba(255,255,255,.5);
transform:translate(-50%,-50%) scale(1);pointer-events:none;z-index:999999;opacity:0;transition:opacity .16s ease, transform .12s ease;}
#mkt-finger.down{transform:translate(-50%,-50%) scale(.82);background:rgba(110,168,255,.42);}
#mkt-cap{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-8px);max-width:86%;
background:rgba(20,27,38,.87);color:#fff;font-family:"Pretendard Variable",Pretendard,sans-serif;
font-size:19px;font-weight:800;letter-spacing:-0.012em;line-height:1.35;padding:12px 22px;border-radius:999px;
box-shadow:0 10px 28px rgba(11,21,36,.28);z-index:999998;opacity:0;transition:opacity .4s ease,transform .4s cubic-bezier(.22,1,.36,1);
white-space:nowrap;}
#mkt-cap.show{opacity:1;transform:translateX(-50%) translateY(0);}`;

async function injectKit(page) {
  await page.evaluate((css) => {
    if (document.getElementById("mkt-kit")) return;
    const s = document.createElement("style");
    s.id = "mkt-kit"; s.textContent = css;
    document.head.appendChild(s);
    const f = document.createElement("div"); f.id = "mkt-finger"; document.body.appendChild(f);
    const c = document.createElement("div"); c.id = "mkt-cap"; document.body.appendChild(c);
  }, FINGER_CSS);
}

const NOFINGER = !!process.env.NOFINGER; // 터치 동그라미 표시 제거(사용자 피드백 2026-08-05)
const fingerAt = (page, x, y, cls) => {
  if (NOFINGER) return Promise.resolve();
  return page.evaluate(({ x, y, cls }) => {
    const f = document.getElementById("mkt-finger");
    if (!f) return;
    f.style.left = x + "px"; f.style.top = y + "px";
    f.style.opacity = "1"; f.className = cls || "";
  }, { x, y, cls });
};
const fingerOff = (page) => {
  if (NOFINGER) return Promise.resolve();
  return page.evaluate(() => { const f = document.getElementById("mkt-finger"); if (f) { f.style.opacity = "0"; f.className = ""; } });
};

const NOCAP = !!process.env.NOCAP; // 컴포지터 v3용 — 앱 안 자막 필 없이 캡처
const caption = (page, text) => {
  if (NOCAP) return Promise.resolve();
  return page.evaluate((t) => {
    const c = document.getElementById("mkt-cap");
    if (!c) return;
    if (!t) { c.classList.remove("show"); return; }
    c.textContent = t; c.classList.add("show");
  }, text);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => t * t * (3 - 2 * t); // smoothstep

// 웨이포인트 드래그 — 각 구간을 smoothstep 보간, 손가락 동기
async function drag(page, pts, { stepMs = 24, stepsPer = 26, holdEnd = 0 } = {}) {
  const [p0] = pts;
  await fingerAt(page, p0.x, p0.y, "");
  await page.mouse.move(p0.x, p0.y);
  await sleep(180);
  await page.mouse.down();
  await fingerAt(page, p0.x, p0.y, "down");
  await sleep(120);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const n = b.steps ?? stepsPer;
    for (let k = 1; k <= n; k++) {
      const t = ease(k / n);
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      await page.mouse.move(x, y);
      await fingerAt(page, x, y, "down");
      await sleep(b.stepMs ?? stepMs);
    }
    if (b.hold) await sleep(b.hold);
  }
  if (holdEnd) await sleep(holdEnd);
  await page.mouse.up();
  await fingerOff(page);
}

async function tap(page, x, y, { settle = 350 } = {}) {
  await fingerAt(page, x, y, "");
  await sleep(200);
  await fingerAt(page, x, y, "down");
  await page.mouse.click(x, y);
  await sleep(160);
  await fingerOff(page);
  await sleep(settle);
}

// ── 앱 내비 ──
async function jump(page, lessonId) {
  const types = await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(id);
    if (!found) return null;
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: () => {} }));
    return found.lesson.steps.map((s) => s.type);
  }, lessonId);
  await sleep(900);
  await injectKit(page);
  return types;
}

async function fwdTo(page, idx) {
  for (let k = 0; k < idx; k++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await sleep(420);
  }
}

// 활성 화면 .scroll을 지정 셀렉터가 화면 세로 중심대에 오도록 스크롤
async function frameOn(page, sel, bias = 0.5, extra = 0) {
  await page.evaluate(({ sel, bias, extra }) => {
    const sc = document.querySelector(".screen.active .scroll");
    const el = document.querySelector(`.screen.active ${sel}`);
    if (!sc || !el) return;
    const r = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
    sc.scrollTop += r.top - sr.top - (sr.height - r.height) * bias + extra;
  }, { sel, bias, extra });
  await sleep(450);
}

const box = async (page, sel) => {
  const b = await page.locator(`.screen.active ${sel}`).first().boundingBox();
  if (!b) throw new Error("no box " + sel);
  return b;
};

// 글자로 버튼 찾아 탭 — 조작이 버튼인 랩(분자·원자 조립소)용
const tapText = async (page, sel, re, settle = 420) => {
  const b = await page.locator(`.screen.active ${sel}`).filter({ hasText: re }).first().boundingBox();
  if (!b) throw new Error("no button " + re);
  await tap(page, b.x + b.width / 2, b.y + b.height / 2, { settle });
};

// 스테퍼 + 버튼 n번 (원자 조립소: 행 0=양성자 1=중성자 2=전자, .ck-btn 마지막이 "+")
const stepPlus = async (page, row, n, settle = 300) => {
  for (let k = 0; k < n; k++) {
    const b = await page.locator(`.screen.active .ck-steppers .ck-step`).nth(row).locator(".ck-btn").last().boundingBox();
    if (!b) throw new Error("no stepper row " + row);
    await tap(page, b.x + b.width / 2, b.y + b.height / 2, { settle });
  }
};

// 랩 스텝으로 점프 — 스텝 배열에서 타입으로 인덱스를 찾는다(콘텐츠가 바뀌어도 안 깨짐)
const toLab = async (page, lessonId, type) => {
  const types = await jump(page, lessonId);
  if (!types) throw new Error("레슨 없음 " + lessonId);
  const i = types.indexOf(type);
  if (i < 0) throw new Error(`${lessonId}에 ${type} 스텝이 없음: ${types.join(",")}`);
  await fwdTo(page, i);
};

// ═══════════════ 비트 정의 ═══════════════
const BEATS = {};

// b1 — 입자 가열 (u3l1 heatParticles)
BEATS.heat = async (page, rec) => {
  await jump(page, "u3l1");
  await fwdTo(page, 1);
  await sleep(1100);
  await frameOn(page, ".stage", 0.42);
  await caption(page, "입자를 직접 데워 보고");
  await rec.start("b1-heat");
  await sleep(700);
  const s = await box(page, ".hp-slider");
  const y = s.y + s.height / 2;
  await drag(page, [
    { x: s.x + s.width * 0.18, y },
    { x: s.x + s.width * 0.55, y, steps: 34, hold: 350 },
    { x: s.x + s.width * 0.985, y, steps: 30, hold: 700 },
    { x: s.x + s.width * 1.06, y, steps: 8, hold: 350 }, // 러버밴딩 살짝
  ]);
  await sleep(1500);
  await rec.stop();
  await caption(page, null);
};

// ── GIF 전용 왕복 비트(2026-08-05 사용자 지시 "갔다 왔다까지 왕복으로") ──
// 영상 본편은 한 방향 드래그가 리듬에 맞아 그대로 두고, GIF만 별도 캡처한다
// (본편 비트를 늘리면 카드 길이·전체 러닝타임이 함께 변한다). 산출 = cap/b1r-heat, cap/b2r-matter.

// b1r — 입자 운동 왕복 (u3l1 heatParticles): 차갑게 → 끝까지 뜨겁게 → 다시 끝까지 차갑게 → 중간
BEATS.heatrt = async (page, rec) => {
  await jump(page, "u3l1");
  await fwdTo(page, 1);
  await sleep(1100);
  await frameOn(page, ".stage", 0.42);
  await rec.start("b1r-heat");
  await sleep(500);
  const s = await box(page, ".hp-slider");
  const y = s.y + s.height / 2;
  const at = (f) => ({ x: s.x + s.width * f, y });
  await drag(page, [
    at(0.18),
    { ...at(0.98), steps: 40, hold: 900 },  // 뜨겁게 — 입자 빨라지고 간격 벌어짐
    { ...at(0.05), steps: 46, hold: 900 },  // 다시 차갑게 — 되돌아오는 게 보여야 함
    { ...at(0.55), steps: 24, hold: 400 },
  ]);
  await sleep(700);
  await rec.stop();
};

// b2r — 상태 변화 왕복 (u4l2 matterTemp): 얼음 → 융해 → 끓음 → 융해 → 다시 얼음
BEATS.matterrt = async (page, rec) => {
  await jump(page, "u4l2");
  await fwdTo(page, 1);
  await sleep(1300);
  await frameOn(page, ".stage", 0.42);
  await rec.start("b2r-matter");
  await sleep(500);
  const s = await box(page, ".slider");
  const y = s.y + s.height / 2;
  const at = (f) => ({ x: s.x + s.width * f, y });
  await drag(page, [
    at(0.04),
    { ...at(0.42), steps: 30, hold: 700 },  // 융해
    { ...at(0.97), steps: 34, hold: 800 },  // 끓음
    { ...at(0.42), steps: 30, hold: 500 },  // 되돌아오는 길
    { ...at(0.04), steps: 26, hold: 800 },  // 다시 얼음
  ]);
  await sleep(700);
  await rec.stop();
};

// b6r — 빛의 삼원색 (g2u3l6 colorMixLab): 빨강·초록·파랑을 겹쳐 노랑→자홍→청록→흰색
// 조작부 없음(캔버스 드래그가 전부) → GIF는 무대만 크롭.
BEATS.colorgif = async (page, rec) => {
  await toLab(page, "g2u3l6", "colorMixLab");
  await sleep(1200);
  await frameOn(page, ".stage", 0.45);
  await rec.start("b6r-color");
  await sleep(600);
  const c = await box(page, ".stage canvas");
  const f = (fx, fy) => ({ x: c.x + c.width * fx, y: c.y + c.height * fy });
  // 초기 위치 R(0.30,0.34) G(0.70,0.34) B(0.50,0.72)
  await drag(page, [f(0.70, 0.34), { ...f(0.35, 0.37), steps: 26, hold: 750 }]); // G→R = 노랑
  await drag(page, [f(0.35, 0.37), { ...f(0.70, 0.34), steps: 22, hold: 350 }]); // G 복귀
  await drag(page, [f(0.50, 0.72), { ...f(0.31, 0.42), steps: 26, hold: 750 }]); // B→R = 자홍
  await drag(page, [f(0.31, 0.42), { ...f(0.70, 0.42), steps: 26, hold: 750 }]); // B→G = 청록
  await drag(page, [f(0.30, 0.34), { ...f(0.64, 0.38), steps: 26, hold: 1100 }]); // 셋 겹침 = 흰색
  await sleep(600);
  await rec.stop();
};

// b7r — 분자 조립소 (g2u4l2 moleculeLab): 원자를 넣으면 실제 분자 구조로 스냅
// 조작 버튼이 무대 아래(.gp-controls) → GIF는 조작부 포함 크롭.
BEATS.molgif = async (page, rec) => {
  await toLab(page, "g2u4l2", "moleculeLab");
  await sleep(1200);
  await frameOn(page, ".stage", 0.38);
  await rec.start("b7r-mol");
  await sleep(500);
  const H = /수소/, O = /산소/, C = /탄소/;
  const B = ".gp-controls button.swapbtn";
  await tapText(page, B, H); await tapText(page, B, H, 1500);           // H₂
  await tapText(page, B, H); await tapText(page, B, H); await tapText(page, B, O, 1700); // H₂O
  await tapText(page, B, C); await tapText(page, B, O); await tapText(page, B, O, 1900); // CO₂
  await sleep(500);
  await rec.stop();
};

// b8r — 원자 조립소 (g2u4l3 atomLab): 양성자를 6개 채우는 순간 "정체: 탄소"로 바뀐다
// 조작 스테퍼가 무대 아래(.ck-steppers) → GIF는 조작부 포함 크롭.
BEATS.atomgif = async (page, rec) => {
  await toLab(page, "g2u4l3", "atomLab");
  await sleep(1200);
  await frameOn(page, ".stage", 0.36);
  await rec.start("b8r-atom");
  await sleep(500);
  await stepPlus(page, 0, 1); await stepPlus(page, 2, 1, 900);  // 수소(양성자1·전자1)
  await stepPlus(page, 0, 5); await stepPlus(page, 1, 6); await stepPlus(page, 2, 5, 1400); // 탄소(6·6·6)
  await sleep(700);
  await rec.stop();
};

// b9r — 파동 (g2u3l7 waveLab): 손으로 흔든 파형이 오른쪽으로 전파, 탁구공은 제자리에서 위아래
// 자동 진동·이름표는 녹화 전에 켜 둔다(버튼이 무대 아래라 GIF엔 안 보인다) → 무대만 크롭.
BEATS.wavegif = async (page, rec) => {
  await toLab(page, "g2u3l7", "waveLab");
  await sleep(1200);
  const c0 = await box(page, ".stage canvas");
  // 손 흔들기 먼저(파동이 "만들어지는" 그림) — 진동자 잡이는 캔버스 왼쪽 끝 98px 안쪽만 받는다
  await frameOn(page, ".stage", 0.45);
  await rec.start("b9r-wave");
  await sleep(500);
  const x = c0.x + 46, my = c0.y + c0.height * 0.46;
  const wig = [];
  for (let k = 0; k < 5; k++) {
    wig.push({ x, y: my - 30, steps: 7, stepMs: 26 });
    wig.push({ x, y: my + 30, steps: 7, stepMs: 26 });
  }
  await drag(page, [{ x, y: my }, ...wig, { x, y: my, steps: 6, stepMs: 26, hold: 900 }]);
  await sleep(1600); // 만든 파동이 오른쪽 끝까지 전파되는 걸 보여 준다
  await rec.stop();
};

// b10r — 광합성 잎 공장 (g2u5l1 leafFactoryLab): 밸브 3개를 열면 물이 물관을 타고 오르고,
// 이산화 탄소가 기공으로 들어오고, 햇빛이 쏟아지고, 산소가 빠져나가는 흐름이 **계속** 돈다.
// 탭 3번 뒤로는 스스로 도는 랩이라 루프 GIF에 최적(생물 트랙 대표).
// 주의: '저장'·'반응로' 버튼은 누르지 않는다 — 밸브를 닫아 흐름이 멈춘다.
// **밸브를 하나씩 여는 과정을 녹화 안에 담는다**(2026-08-05 사용자 지시 "물 클릭하면 생기고
// 이산화탄소 클릭하면 생기고 순서대로"): 닫힌 잎 → 물관 열림(물방울) → 기공 열림(CO₂) →
// 빛 열림(광자·포도당·산소)까지 재료가 하나씩 쌓이는 게 광합성 식 그 자체라 결과만 보여 주면 손해다.
BEATS.leafgif = async (page, rec) => {
  await toLab(page, "g2u5l1", "leafFactoryLab");
  await sleep(1300);
  await frameOn(page, ".stage", 0.28); // 무대 + 아래 밸브 줄이 함께 보이게(탭 전에 스크롤 확정)
  const act = async (a, settle) => {
    const b = await box(page, `.plant-btn[data-act="${a}"]`);
    await tap(page, b.x + b.width / 2, b.y + b.height / 2, { settle });
  };
  await rec.start("b10r-leaf");
  await sleep(900);           // 다 닫힌 상태 — 아무것도 안 흐르는 출발점을 먼저 보여 준다
  await act("water", 1600);   // 물관에 물방울이 오르기 시작
  await act("carbon", 1600);  // 기공으로 이산화 탄소 유입
  await act("light", 3000);   // 빛 → 포도당·산소 생성 시작(공급 3/3)
  await sleep(1300);
  await rec.stop();
};

// b2 — 얼음 융해·끓음 (u4l2 matterTemp 메타볼)
BEATS.matter = async (page, rec) => {
  await jump(page, "u4l2");
  await fwdTo(page, 1);
  await sleep(1300);
  await frameOn(page, ".stage", 0.42);
  await caption(page, "얼음을 녹이고, 끓이고");
  await rec.start("b2-matter");
  await sleep(600);
  const s = await box(page, ".slider");
  const y = s.y + s.height / 2;
  await drag(page, [
    { x: s.x + s.width * 0.04, y },
    { x: s.x + s.width * 0.42, y, steps: 40, hold: 800 }, // 융해 구간
    { x: s.x + s.width * 0.97, y, steps: 44, hold: 600 }, // 끓음
  ]);
  await sleep(1400);
  // 입자의 눈 토글
  const btn = await page.locator(".screen.active .stage button", { hasText: "입자의 눈" }).first().boundingBox();
  if (btn) {
    await tap(page, btn.x + btn.width / 2, btn.y + btn.height / 2, { settle: 1700 });
  }
  await rec.stop();
  await caption(page, null);
};

// b3 — 주사기 압력 (u6l2 boyleSyringe)
BEATS.boyle = async (page, rec) => {
  await jump(page, "u6l2");
  await fwdTo(page, 1);
  await sleep(1100);
  await frameOn(page, ".stage", 0.35);
  await caption(page, "주사기를 눌러 압력을 만들고");
  await rec.start("b3-boyle");
  await sleep(700);
  const c = await box(page, ".stage canvas");
  const y = c.y + c.height * 0.3;
  await drag(page, [
    { x: c.x + c.width * 0.3, y },
    { x: c.x + c.width * 0.62, y, steps: 44, stepMs: 26, hold: 900 }, // 2기압
    { x: c.x + c.width * 0.8, y, steps: 34, stepMs: 26, hold: 900 }, // 4기압
    { x: c.x + c.width * 0.42, y, steps: 36, stepMs: 22, hold: 500 }, // 복귀
  ]);
  await sleep(1300);
  await rec.stop();
  await caption(page, null);
};

// b4 — 달 위상 3D (u7l5 moonPhase3d)
BEATS.moon = async (page, rec) => {
  await jump(page, "u7l5");
  await fwdTo(page, 1);
  await sleep(2800); // three.js 로드
  await frameOn(page, ".stage", 0.45);
  await caption(page, "달을 돌려 위상을 바꾸고");
  await rec.start("b4-moon");
  await sleep(700);
  const c = await box(page, ".stage canvas");
  const cx = c.x + c.width * 0.46, cy = c.y + c.height * 0.46;
  const rx = c.width * 0.34, ry = c.height * 0.3;
  const a0 = Math.PI * 0.78; // 달 초기(좌상단)
  const pts = [];
  const N = 96;
  for (let k = 0; k <= N; k++) {
    const a = a0 + (k / N) * Math.PI * 2.05;
    pts.push({ x: cx + Math.cos(a) * rx, y: cy - Math.sin(a) * ry, steps: 1, stepMs: 52 });
  }
  await drag(page, pts, { holdEnd: 600 });
  await sleep(1400);
  await rec.stop();
  await caption(page, null);
};

// b5 — 레이저 반사 (g2u3l1 reflectLab)
BEATS.laser = async (page, rec) => {
  await jump(page, "g2u3l1");
  await fwdTo(page, 1);
  await sleep(1100);
  await frameOn(page, ".stage", 0.5);
  await caption(page, "레이저로 반사 법칙을 확인하고");
  await rec.start("b5-laser");
  await sleep(700);
  const c = await box(page, ".stage canvas");
  const P = { x: c.x + c.width * 0.5, y: c.y + c.height * 0.86 };
  const r = c.height * 0.52;
  const at = (deg) => ({ x: P.x + Math.sin((deg * Math.PI) / 180) * r, y: P.y - Math.cos((deg * Math.PI) / 180) * r });
  const arc = (from, to, n, hold) => {
    const seq = [];
    for (let k = 1; k <= n; k++) seq.push({ ...at(from + ((to - from) * k) / n), steps: 1, stepMs: 30 });
    if (hold) seq[seq.length - 1].hold = hold;
    return seq;
  };
  await drag(page, [at(-30), ...arc(-30, -62, 30, 800), ...arc(-62, -14, 40, 800), ...arc(-14, -45, 28, 500)]);
  await sleep(1300);
  await rec.stop();
  await caption(page, null);
};

// (b6 빛의 합성·b7 과학사 만화 비트는 v7에서 제거 — 러닝타임 단축, 2026-08-05 사용자 지시.
//  복원 시 git 히스토리 8960e20의 BEATS.color/BEATS.comic + rebuild/compose/assemble 각 행 참조.)

// b8 — 문제 풀이 채점 (u3l1 그림 퀴즈, index 5)
BEATS.quiz = async (page, rec) => {
  await jump(page, "u3l1");
  await fwdTo(page, 5);
  await sleep(1100);
  const ans = await page.evaluate(async () => {
    const { findLesson } = await import("/src/content/curriculum.ts");
    const st = findLesson("u3l1").lesson.steps[5];
    return typeof st.answer === "number" ? st.answer : 0;
  });
  await frameOn(page, ".q-figure", 0.38);
  await caption(page, "문제를 풀면, 오답노트는 자동으로");
  await rec.start("b8-quiz");
  await sleep(1600);
  await frameOn(page, ".opts", 0.66);
  await sleep(500);
  const opt = await box(page, `.opts .opt[data-oi="${ans}"]`);
  await tap(page, opt.x + opt.width / 2, opt.y + Math.min(opt.height / 2, 40), { settle: 750 });
  const cta = await box(page, ".btn.cta");
  await tap(page, cta.x + cta.width / 2, cta.y + cta.height / 2, { settle: 2500 });
  await rec.stop();
  await caption(page, null);
};

// b9 — 정복 지도 (u7 태양계)
BEATS.map = async (page, rec) => {
  // 홈은 부팅 플로우로 진입해 있어야 한다(이 비트는 부팅 직후 홈에서 실행)
  await injectKit(page);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[6]?.click());
  await sleep(1000);
  await caption(page, "정복 지도를 따라, 한 걸음씩");
  await rec.start("b9-map");
  await sleep(900);
  // 지도 부드럽게 내려보기
  await page.evaluate(async () => {
    const sc = document.querySelector(".screen.active .scroll") || document.scrollingElement;
    const from = sc.scrollTop, to = from + 430;
    const t0 = performance.now(), D = 2600;
    await new Promise((done) => {
      const step = (t) => {
        const p = Math.min(1, (t - t0) / D);
        const e = p * p * (3 - 2 * p);
        sc.scrollTop = from + (to - from) * e;
        if (p < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  });
  await sleep(1400);
  await rec.stop();
  await caption(page, null);
};

// b0b — 정복 지도: 걷기 연출 ×2(레슨 완료 귀환) + 스크롤로 단원 종합 평가 노드까지
BEATS.enter = async (page, rec) => {
  await injectKit(page);
  const renderWalk = (walkFrom) =>
    page.evaluate(async (from) => {
      const store = await import("/src/core/store.ts");
      const { nav } = await import("/src/core/router.ts");
      const { homeScreen } = await import("/src/screens/home.ts");
      store.completeLesson(from, 1, 10);
      nav.reset(homeScreen(() => {}, "u3", { onOpenExam: () => {}, onTab: () => {}, onOpenNotebook: () => {}, onOpenSplash: () => {} }, { walkFrom: from }));
    }, walkFrom);
  await rec.start("b0b-enter");
  await sleep(400);
  await renderWalk("u3l1"); // 걷기 1: 온도와 입자 운동 → 열평형
  await sleep(3050);
  await renderWalk("u3l2"); // 걷기 2: 열평형 → 전도·대류·복사
  await sleep(2750);
  await rec.stop();
};

// bE — 단원 종합 평가 (examScreen 직접 진입 — 인트로 카드 → 시작 → 문항 2개)
BEATS.exam = async (page, rec) => {
  await injectKit(page);
  await page.evaluate(async () => {
    const { nav } = await import("/src/core/router.ts");
    const { examScreen } = await import("/src/screens/exam.ts");
    nav.go(examScreen("u3", { onExit: () => {}, onOpenLesson: () => {}, onPaywall: () => {} }));
  });
  await sleep(1000);
  await rec.start("bE-exam");
  await sleep(1200); // 시험 인트로 카드
  const cta1 = await box(page, ".btn.cta"); // 시험 시작
  await tap(page, cta1.x + cta1.width / 2, cta1.y + cta1.height / 2, { settle: 1400 });
  for (let i = 0; i < 2; i++) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    await sleep(i === 0 ? 900 : 700);
    // 유형 무관 최선 응답(시험 중 정오 노출 없음 — 화면 연출용)
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const a = document.querySelector(".screen.active");
      const opt = a.querySelector(".opts .opt");
      if (opt) { opt.click(); return; }
      const chip = a.querySelector(".ex-chip");
      if (chip) { chip.click(); return; }
      const keys = [...a.querySelectorAll(".mnp-k")];
      const k2 = keys.find((k) => k.textContent.trim() === "2");
      if (k2) { k2.click(); await sleep(120); }
    });
    await sleep(650);
    const cta = await box(page, ".btn.cta");
    await tap(page, cta.x + cta.width / 2, cta.y + cta.height / 2, { settle: 500 });
  }
  await sleep(900);
  await rec.stop();
};

// bN — 오답노트 (wrongNotes 시딩된 페이지: 복습 탭 → 목록 → 다시 풀기 → 해결)
BEATS.notebook = async (page, rec) => {
  await injectKit(page);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .gnav-item")].find((b) => b.textContent.includes("복습"))?.click());
  await sleep(900);
  await rec.start("bN-note");
  await sleep(1100); // 복습 탭 — "N문항 대기" 진입 카드
  const entry = await box(page, ".nb-entry");
  await tap(page, entry.x + entry.width / 2, entry.y + entry.height / 2, { settle: 1300 });
  const retry = await box(page, ".nb-card .nb-retry");
  await tap(page, retry.x + retry.width / 2, retry.y + retry.height / 2, { settle: 800 });
  const opt = await box(page, ".nb-card .nb-opt");
  await tap(page, opt.x + opt.width / 2, opt.y + opt.height / 2, { settle: 600 }); // 정답(0번) → 해결
  await sleep(1500);
  await rec.stop();
};

// b0 / b10 — 인트로·엔드카드
BEATS.intro = async (page, rec) => {
  await page.goto("file:///" + path.join(__dirname, "intro.html").replace(/\\/g, "/"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await rec.start("b0-intro");
  await sleep(150);
  await page.evaluate(() => document.body.classList.add("go")); // 게이트 발사 — 연출이 녹화 안에서 처음부터
  await sleep(2500); // 압축 타임라인(l2 정착 1.88s) + 홀드
  await rec.stop();
};

// (엔드카드는 compose.mjs의 c-end가 담당한다 — endcard2.html이 /__app/ 정적 서버로 브랜드 이미지를
//  받으므로 file:// 로는 로드되지 않는다. 여기서 다시 만들지 말 것.)

// ═══════════════ 실행 ═══════════════
const runOn = (name) => !ONLY.length || ONLY.includes(name);

// A 페이지: 랩 시딩 완료 상태 + 부팅(홈) — map·랩·퀴즈 비트
const pageA = await makePage(true);
const recA = makeRecorder(pageA);
await recA.attach();
await pageA.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await pageA.waitForSelector("#sc-splash", { timeout: 25000 });
await pageA.mouse.click(210, 300);
await pageA.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
await pageA.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click(); });
await pageA.waitForSelector("#sc-home", { timeout: 15000 });
await sleep(800);

if (runOn("map")) await BEATS.map(pageA, recA);
for (const name of ["heat", "matter", "boyle", "moon", "laser", "quiz",
                    "heatrt", "matterrt", "colorgif", "molgif", "atomgif", "wavegif", "leafgif"]) {
  if (runOn(name)) await BEATS[name](pageA, recA);
}

// B 페이지: 미완료 상태 + 인트로/엔드카드
const bootHome = async (page) => {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click(); });
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await sleep(900);
};

const pageB = await makePage(false);
const recB = makeRecorder(pageB);
await recB.attach();
if (runOn("enter") || runOn("exam")) {
  await bootHome(pageB);
  if (runOn("enter")) await BEATS.enter(pageB, recB);
  if (runOn("exam")) await BEATS.exam(pageB, recB); // enter 직후 — 지도가 시험 노드에 스크롤된 상태
}
if (runOn("notebook")) {
  const pageC = await makePage(false, { wrongNotes: WRONG_NOTES });
  const recC = makeRecorder(pageC);
  await recC.attach();
  await bootHome(pageC);
  await BEATS.notebook(pageC, recC);
}
if (runOn("intro")) await BEATS.intro(pageB, recB);

await browser.close();
console.log("CAPTURE DONE");
