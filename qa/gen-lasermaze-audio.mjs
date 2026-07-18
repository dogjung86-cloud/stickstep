// 레이저 미로 오디오 발주 — 일레븐랩스 음악(/v1/music)·효과음(/v1/sound-generation).
// XI_KEY=<키> node qa/gen-lasermaze-audio.mjs [--force]
// 키는 환경변수로만 받는다(리포 저장 금지). 산출물: public/game/lasermaze/*.mp3
// 파이프라인은 gen-steprush-audio.mjs 계승(라우드니스 정규화 → 루프 이음매 크로스페이드 F=1.4s).
//
// 사운드 디자인: 무드는 "정밀한 광학 실험실" — 유리질 플럭·크리스탈 아르페지오(보석·레이저와
// 결이 같다). 퍼즐이라 에너지는 낮게. 존 2개 = 판 1~6(기초 반사) / 판 7+(색 합성 시대 — 살짝 화사).
// 거울 회전 틱은 매 탭 울리는 고빈도라 신스 유지(지연 0 — 스텝 러시 사다리음 원칙).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.XI_KEY;
if (!KEY) {
  console.error("XI_KEY 환경변수 필요(키는 리포에 저장하지 않는다)");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const OUT = "public/game/lasermaze";
const TMP = "qa/tmp-audio-lzm";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

/** 존 BGM 2곡 — 판 1~6(기초) / 판 7+(색 합성). 보컬 없는 루프 지향. */
const BGM = [
  {
    name: "bgm-laser-focus",
    ms: 32000,
    prompt:
      "Minimal glassy electronic puzzle game background music, crystalline plucked synth notes, soft airy pads, precise thoughtful focused mood, subtle clicky percussion, 88 BPM, dark laboratory with glowing laser beams, retro video game style, instrumental only, no vocals, consistent gentle energy throughout, seamless loop, no intro buildup, no outro ending",
  },
  {
    name: "bgm-laser-prism",
    ms: 32000,
    prompt:
      "Shimmering colorful electronic puzzle game background music, sparkling crystal arpeggios, warm softly pulsing bass, gently uplifting focused mood, 94 BPM, prism splitting light into rainbow spectrum glow, retro video game style, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
];

/** 이벤트 효과음 3종 — 샘플 키 매핑: sfx-clear→best(판 완성)·sfx-gem→gem(보석 점등)·sfx-reset→reset. */
const SFX = [
  { name: "sfx-clear", dur: 1.6, prompt: "short triumphant victory jingle, bright laser zap harmonics resolving into a sparkling chime, arcade puzzle level clear fanfare, cheerful video game achievement sound" },
  { name: "sfx-gem", dur: 1.1, prompt: "crystal gem lighting up with a magical glassy chime, bright sparkle ping with a soft shimmer tail, video game jewel activation sound" },
  { name: "sfx-reset", dur: 0.9, prompt: "quick soft rewind whoosh, airy backwards swish ending with a gentle mechanical click, video game undo reset sound, not harsh" },
];

function ff(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function probeDur(file) {
  return Number(
    execFileSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim(),
  );
}

async function call(url, body, outFile) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
      return;
    }
    const err = await res.text();
    console.error(`  HTTP ${res.status} (시도 ${attempt}/3):`, err.slice(0, 240));
    if (res.status === 429 || res.status >= 500) await new Promise((r) => setTimeout(r, 4000 * attempt));
    else throw new Error(`API 실패: ${res.status}`);
  }
  throw new Error("3회 재시도 실패");
}

// ── BGM: 발주 → 라우드니스 정규화 → 루프 이음매 크로스페이드(F=1.4s) → mp3 128k ──
for (const t of BGM) {
  const out = path.join(OUT, `${t.name}.mp3`);
  if (!FORCE && fs.existsSync(out)) {
    console.log(`skip ${t.name} (있음 — --force로 재발주)`);
    continue;
  }
  console.log(`music ${t.name} ...`);
  const raw = path.join(TMP, `${t.name}-raw.mp3`);
  const norm = path.join(TMP, `${t.name}-norm.wav`);
  await call("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", { prompt: t.prompt, music_length_ms: t.ms }, raw);
  ff(["-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", norm]);
  const D = probeDur(norm);
  const F = 1.4;
  const body = (D - F).toFixed(3);
  ff([
    "-i", norm,
    "-filter_complex",
    `[0:a]asplit=2[a][b];[a]atrim=0:${body},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${F}[x];` +
      `[b]atrim=${body},asetpts=PTS-STARTPTS,afade=t=out:st=0:d=${F}[y];` +
      `[x][y]amix=inputs=2:duration=first:normalize=0`,
    "-c:a", "libmp3lame", "-b:a", "128k", out,
  ]);
  console.log(`  → ${out} (${probeDur(out).toFixed(1)}s, ${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
}

// ── SFX: 발주 → 라우드니스 정규화 → mp3 96k ──
for (const s of SFX) {
  const out = path.join(OUT, `${s.name}.mp3`);
  if (!FORCE && fs.existsSync(out)) {
    console.log(`skip ${s.name} (있음 — --force로 재발주)`);
    continue;
  }
  console.log(`sfx ${s.name} ...`);
  const raw = path.join(TMP, `${s.name}-raw.mp3`);
  await call(
    "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
    { text: s.prompt, duration_seconds: s.dur, prompt_influence: 0.55 },
    raw,
  );
  ff(["-i", raw, "-af", "loudnorm=I=-16:TP=-1.5", "-c:a", "libmp3lame", "-b:a", "96k", out]);
  console.log(`  → ${out} (${probeDur(out).toFixed(2)}s, ${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log("DONE");
