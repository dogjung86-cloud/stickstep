// 코스모 머지 오디오 발주 — 일레븐랩스 음악(/v1/music)·효과음(/v1/sound-generation).
// XI_KEY=<키> node qa/gen-cosmo-audio.mjs [--force]
// 키는 환경변수로만 받는다(리포 저장 금지 — 스텝 러시 규칙). 산출물: public/game/cosmo/*.mp3
// 파이프라인은 gen-steprush-audio.mjs 그대로: 라우드니스 정규화 → 꼬리 1.4s를 머리에
// 크로스페이드해 루프 이음매를 굽는다. 검수 페이지: /qa-cosmo-audio.html
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.XI_KEY;
if (!KEY) {
  console.error("XI_KEY 환경변수 필요(키는 리포에 저장하지 않는다)");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const OUT = "public/game/cosmo";
const TMP = "qa/tmp-audio-cosmo";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

/** BGM 3곡 — 판의 성장(성운→행성 시대→별의 시대)과 1:1. 앱 오디오 정체성(8비트 치프튠) 유지,
 *  무드만 우주 퍼즐(느리고 몽환)로. 전부 보컬 없는 심리스 루프 지향. */
const BGM = [
  // 시작 곡은 귀엽게(사용자 피드백 2026-07-18 "귀여운 음악으로 시작되면") — 원본 수박게임의
  // 아기자기함. 몽환 버전은 폐기, 뒤 존(행성·별)이 웅장함을 맡는다.
  {
    name: "bgm-nebula",
    ms: 34000,
    prompt:
      "Cute cheerful 8-bit chiptune space puzzle game background music, adorable bouncy plucky chip melody, kawaii rounded soft synth tones, gentle light percussion, warm cozy playful and sweet, 92 BPM, tiny twinkling stardust sparkles, retro game console style, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
  {
    name: "bgm-planets",
    ms: 34000,
    prompt:
      "Warm hopeful 8-bit chiptune space game background music, gentle plucky chip melody over soft glowing square wave chords, quiet sense of wonder slowly blooming, light soft percussion, 84 BPM, planets forming from cosmic dust, retro game console style, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
  // 별의 시대도 귀엽게(사용자 피드백 2026-07-18 "1·2번은 괜찮고 3번은 조금 더 귀엽게") —
  // 장엄한 초판 폐기, "아기 별 탄생 축하" 무드로.
  {
    name: "bgm-star",
    ms: 34000,
    prompt:
      "Cute triumphant 8-bit chiptune space game background music, adorable bouncy chip melody with radiant sparkling arpeggios, kawaii celebratory happy mood, warm bright rounded synth tones, light cheerful percussion, 96 BPM, a happy newborn star twinkling over its little galaxy, retro game console style, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
];

/** 이벤트 효과음 4종 — 합체 팝·콤보·드롭은 즉발 신스 유지(게임 디자인), 굵직한 순간만 샘플. */
const SFX = [
  { name: "sfx-sun", dur: 1.8, prompt: "triumphant warm star birth fanfare, bright rising synth jingle with glowing sparkle shimmer, video game big achievement sound" },
  { name: "sfx-nova", dur: 2.2, prompt: "huge cosmic explosion, deep sub bass boom then sparkling stardust debris shimmering outward and fading, epic video game supernova blast" },
  { name: "sfx-best", dur: 1.6, prompt: "short cheerful victory fanfare, sparkling bright synth flourish with twinkles, video game new high score jingle" },
  { name: "sfx-over", dur: 1.4, prompt: "soft wistful descending spacey synth tones fading into quiet, gentle cosmic game over sound, melancholy but warm, not harsh" },
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
