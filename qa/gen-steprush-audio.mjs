// 스텝 러시 오디오 발주 — 일레븐랩스 음악(/v1/music)·효과음(/v1/sound-generation).
// XI_KEY=<키> node qa/gen-steprush-audio.mjs [--force]
// 키는 환경변수로만 받는다(리포 저장 금지). 산출물: public/game/steprush/*.mp3
// BGM은 ffmpeg 2패스(라우드니스 정규화 → 꼬리를 머리에 크로스페이드)로 루프 이음매를 보정한다:
// out(t<F) = body 페이드인 + tail 페이드아웃 합 — 루프 랩 지점에서 오디오가 연속이 된다.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.XI_KEY;
if (!KEY) {
  console.error("XI_KEY 환경변수 필요(키는 리포에 저장하지 않는다)");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const OUT = "public/game/steprush";
const TMP = "qa/tmp-audio";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

/** 존 BGM 5곡 — 배경 여정(낮 도시→노을→밤→오로라→우주)과 1:1. 전부 보컬 없는 루프 지향. */
const BGM = [
  {
    name: "bgm-day",
    ms: 32000,
    prompt:
      "Cheerful lighthearted chiptune-pop video game background music, bouncy plucky synth melody, warm bright chords, light percussion, 112 BPM, sunny morning city vibe, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
  // 노을~우주 4곡은 1곡(낮 치프튠)과 같은 8비트 게임기 DNA로 통일(사용자 피드백 2026-07-18
  // "pop 느낌이 강하고 미니 게임 느낌이 안 난다") — 존마다 무드만 달라진다.
  {
    name: "bgm-sunset",
    ms: 32000,
    prompt:
      "Warm mellow 8-bit chiptune video game background music, retro game console square wave chords, gentle plucky chip melody, relaxed easy groove, 96 BPM, golden sunset glow, classic arcade game style, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
  {
    name: "bgm-night",
    ms: 32000,
    prompt:
      "Calm dreamy 8-bit chiptune lullaby video game background music, delicate twinkling chip arpeggios, soft warm square wave pads, slow and gentle, 84 BPM, starry night sky, retro game console style, instrumental only, no vocals, consistent gentle energy, seamless loop, no intro buildup, no outro ending",
  },
  {
    name: "bgm-aurora",
    ms: 32000,
    prompt:
      "Mysterious floaty 8-bit chiptune video game background music, shimmering wavering chip arpeggios, airy square wave pads, hypnotic and wondrous, 90 BPM, northern lights aurora, retro game console style, instrumental only, no vocals, consistent energy, seamless loop, no intro buildup, no outro ending",
  },
  {
    name: "bgm-space",
    ms: 36000,
    prompt:
      "Sparse serene 8-bit chiptune space ambient video game background music, slow deep chip drone, occasional twinkling retro blips, weightless and vast, very calm, floating in space above Earth, retro game console style, instrumental only, no vocals, no drums, consistent calm, seamless loop, no intro buildup, no outro ending",
  },
];

/** 이벤트 효과음 6종 — 스텝/골드 사다리 신스는 게임 디자인이라 유지, 굵직한 순간만 샘플로. */
const SFX = [
  { name: "sfx-fall", dur: 1.3, prompt: "cartoon slide whistle falling down fast then a soft comedic thump landing, playful video game fail sound" },
  { name: "sfx-best", dur: 1.7, prompt: "short cheerful victory fanfare, bright synth trumpet flourish with sparkle, video game new record achievement jingle" },
  { name: "sfx-fever", dur: 1.2, prompt: "magical star power-up activation, fast ascending sparkle shimmer burst, energetic video game boost sound" },
  { name: "sfx-save", dur: 1.0, prompt: "protective energy bubble shield popping with a glassy burst, quick video game block sound" },
  { name: "sfx-freeze", dur: 1.2, prompt: "quick magical ice crystallization crackle, frost spreading freeze spell, video game item sound" },
  { name: "sfx-gear", dur: 0.8, prompt: "quick cloth whoosh and snap of equipping gear, short video game item equip sound" },
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
