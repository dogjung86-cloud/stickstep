// 네온 한붓그리기 오디오 발주 — 일레븐랩스 음악(/v1/music)·효과음(/v1/sound-generation).
// XI_KEY=<키> node qa/gen-onestroke-audio.mjs [--force]
// 키는 환경변수로만 받는다(리포 저장 금지). 산출물: public/game/onestroke/*.mp3
// 파이프라인은 gen-steprush-audio.mjs 계승 — BGM은 ffmpeg 2패스(라우드니스 정규화 →
// 꼬리를 머리에 크로스페이드 F=1.4s)로 루프 이음매를 보정한다.
//
// 사운드 디자인: 무대가 어두운 밤 + 네온사인이라 신스웨이브 계열로 가되, 미니게임 오디오
// DNA(스텝 러시 피드백 "게임기 느낌")를 지키려고 레트로 게임 톤을 명시한다. 퍼즐이라
// 에너지는 낮게(사고 방해 금지). 존은 2개 — 수제 1~6판(차분) / 절차 7판+(맥박 있는 심화).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.XI_KEY;
if (!KEY) {
  console.error("XI_KEY 환경변수 필요(키는 리포에 저장하지 않는다)");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const OUT = "public/game/onestroke";
const TMP = "qa/tmp-audio-ost";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

/** 존 BGM 2곡 — 판 1~6(튜토리얼 아크) / 판 7+(절차 생성 심화). 보컬 없는 루프 지향. */
const BGM = [
  {
    name: "bgm-neon-calm",
    ms: 32000,
    prompt:
      "Calm minimal synthwave puzzle game background music, soft neon synth arpeggios, warm analog pad chords, gentle slow groove, 84 BPM, relaxed thinking mood, night city neon glow, retro video game style, instrumental only, no vocals, consistent gentle energy throughout, seamless loop, no intro buildup, no outro ending",
  },
  {
    name: "bgm-neon-deep",
    ms: 32000,
    prompt:
      "Hypnotic mellow synthwave puzzle game background music, softly pulsing bassline, shimmering neon synth arpeggios, subtle focused tension, 92 BPM, deep night neon city mood, retro video game style, instrumental only, no vocals, consistent energy throughout, seamless loop, no intro buildup, no outro ending",
  },
];

/** 이벤트 효과음 3종 — 선 켜짐/되돌리기 신스 틱은 게임 디자인이라 유지, 굵직한 순간만 샘플.
 *  샘플 키 매핑: sfx-clear→best(판 완성), sfx-stuck→fall(막다른 길), sfx-hint→hint(홀수점 힌트). */
const SFX = [
  { name: "sfx-clear", dur: 1.6, prompt: "short bright victory jingle, sparkling neon synth shimmer ascending, arcade puzzle level clear fanfare, cheerful video game achievement sound" },
  { name: "sfx-stuck", dur: 1.2, prompt: "neon sign electric flicker then a short soft power-down buzz descending, playful gentle video game fail sound, not harsh, no explosion" },
  { name: "sfx-hint", dur: 1.3, prompt: "magical discovery chime, gentle golden bell shimmer with soft sparkle tail, mysterious secret reveal sound, video game hint" },
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
